// Roundtrip-Test für den in index.html eingebetteten GIF-Encoder.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), 'utf8');
const m = html.match(/<script>\s*(\/\* =+[\s\S]*?GifEncoder[\s\S]*?)<\/script>/);
if (!m) throw new Error('Encoder-Script nicht gefunden');
const module_ = { exports: {} };
new Function('module', m[1])(module_);
const GifEncoder = module_.exports;

// --- synthetische Frames: 64x48, Frame i = Farbverlauf + bewegtes Rechteck ---
const W = 64, H = 48, FRAMES = 5;
function makeFrame(i) {
  const rgba = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      rgba[o] = Math.round(x / (W - 1) * 255);
      rgba[o + 1] = Math.round(y / (H - 1) * 255);
      rgba[o + 2] = 40 * i;
      rgba[o + 3] = 255;
      // bewegtes weißes Quadrat
      if (x >= i * 10 && x < i * 10 + 8 && y >= 10 && y < 18) {
        rgba[o] = rgba[o + 1] = rgba[o + 2] = 255;
      }
    }
  }
  return rgba;
}

const frames = [];
for (let i = 0; i < FRAMES; i++) frames.push(makeFrame(i));

for (const dither of [true, false]) {
  const enc = GifEncoder.create(W, H, { fps: 10, loop: true, dither });
  for (const f of frames) enc.addFrame(f);
  const gif = enc.finish();
  console.log(`dither=${dither}: ${gif.length} Bytes`);

  // ---- Struktur prüfen ----
  const sig = Buffer.from(gif.slice(0, 6)).toString('ascii');
  assert(sig === 'GIF89a', 'Signatur', sig);
  assert(gif[6] + (gif[7] << 8) === W, 'Breite');
  assert(gif[8] + (gif[9] << 8) === H, 'Höhe');
  assert(gif[gif.length - 1] === 0x3b, 'Trailer');

  // ---- Parser + LZW-Decoder ----
  let pos = 13; // Header + LSD (keine globale Farbtabelle)
  let frameIdx = 0;
  while (pos < gif.length) {
    const b = gif[pos];
    if (b === 0x21) { // Extension
      pos += 2; // Introducer + Label
      while (gif[pos] !== 0) pos += gif[pos] + 1;
      pos++;
    } else if (b === 0x2c) { // Image Descriptor
      pos++;
      const ix = gif[pos] | (gif[pos+1] << 8);
      const iy = gif[pos+2] | (gif[pos+3] << 8);
      const iw = gif[pos+4] | (gif[pos+5] << 8);
      const ih = gif[pos+6] | (gif[pos+7] << 8);
      const flags = gif[pos+8];
      pos += 9;
      assert(ix === 0 && iy === 0 && iw === W && ih === H, 'Frame-Geometrie');
      assert(flags & 0x80, 'Lokale Farbtabelle vorhanden');
      const tableSize = 2 << (flags & 7);
      const palette = [];
      for (let i = 0; i < tableSize; i++) {
        palette.push([gif[pos], gif[pos+1], gif[pos+2]]);
        pos += 3;
      }
      const minCodeSize = gif[pos++];
      // Sub-Blöcke einsammeln
      const data = [];
      while (gif[pos] !== 0) {
        const len = gif[pos++];
        for (let i = 0; i < len; i++) data.push(gif[pos++]);
      }
      pos++;
      const indices = lzwDecode(data, minCodeSize);
      assert(indices.length === W * H, `Pixelanzahl (${indices.length} vs ${W*H})`);
      for (const idx of indices) assert(idx < tableSize, 'Index in Palette');

      // Farbabweichung gegen Original messen
      const orig = frames[frameIdx];
      let errSum = 0;
      for (let i = 0; i < W * H; i++) {
        const p = palette[indices[i]];
        const o = i * 4;
        errSum += Math.abs(p[0]-orig[o]) + Math.abs(p[1]-orig[o+1]) + Math.abs(p[2]-orig[o+2]);
      }
      const avgErr = errSum / (W * H * 3);
      console.log(`  Frame ${frameIdx}: mittlerer Kanalfehler ${avgErr.toFixed(2)}`);
      assert(avgErr < 12, 'Farbfehler zu groß: ' + avgErr);
      frameIdx++;
    } else if (b === 0x3b) {
      break;
    } else {
      throw new Error('Unbekannter Block 0x' + b.toString(16) + ' bei ' + pos);
    }
  }
  assert(frameIdx === FRAMES, `Frame-Anzahl (${frameIdx})`);
}

// GIF für manuelle Sichtprüfung speichern
{
  const enc = GifEncoder.create(W, H, { fps: 10 });
  for (const f of frames) enc.addFrame(f);
  const out = path.join(__dirname, 'test.gif');
  fs.writeFileSync(out, Buffer.from(enc.finish()));
  console.log('Test-GIF gespeichert:', out);
}

console.log('\nAlle Tests bestanden ✅');

function assert(cond, msg, extra) {
  if (!cond) throw new Error('FEHLER: ' + msg + (extra !== undefined ? ' -> ' + extra : ''));
}

// Strikter Referenz-Decoder: Cap bei 4096 Einträgen, Clear-Code-Semantik wie echte GIF-Decoder
function lzwDecode(bytes, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoi = clearCode + 1;
  let codeSize, dict, prev;
  const initDict = () => {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict.push([i]);
    dict.push(null, null); // clear, eoi
    codeSize = minCodeSize + 1;
    prev = null;
  };
  initDict();

  let bitPos = 0;
  const readCode = () => {
    let code = 0;
    for (let i = 0; i < codeSize; i++) {
      const byte = bytes[bitPos >> 3];
      if (byte === undefined) return null;
      code |= ((byte >> (bitPos & 7)) & 1) << i;
      bitPos++;
    }
    return code;
  };

  const out = [];
  for (;;) {
    const code = readCode();
    if (code === null || code === eoi) break;
    if (code === clearCode) { initDict(); continue; }
    let entry;
    if (code < dict.length && dict[code]) {
      entry = dict[code];
    } else if (code === dict.length && prev) {
      entry = prev.concat(prev[0]);
    } else {
      throw new Error('Ungültiger LZW-Code ' + code + ' (dict ' + dict.length + ')');
    }
    for (const v of entry) out.push(v);
    if (prev && dict.length < 4096) {
      dict.push(prev.concat(entry[0]));
      if (dict.length === (1 << codeSize) && codeSize < 12) codeSize++;
    }
    prev = entry;
  }
  return out;
}
