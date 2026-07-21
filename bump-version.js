/* Erhöht die Versionsnummer automatisch um 0.1 und stempelt sie in die
 * Fußzeile von index.html. Bei JEDER Aktualisierung der App ausführen:
 *
 *     node bump-version.js
 *
 * Die aktuelle Version steht in der Datei VERSION (Start: 1.0).
 * index.html ist zugleich die Standalone-Datei – ein Build-Schritt entfällt.
 */
const fs = require("fs");
const R = __dirname + "/";

const cur = fs.readFileSync(R + "VERSION", "utf8").trim();
const next = (Math.round(parseFloat(cur) * 10) + 1) / 10; // + 0.1
const nv = next.toFixed(1);

fs.writeFileSync(R + "VERSION", nv + "\n");

let html = fs.readFileSync(R + "index.html", "utf8");
html = html.replace(
  /(<span class="app-version" id="appVersion">)Version [0-9.]+(<\/span>)/,
  function (_m, a, b) { return a + "Version " + nv + b; }
);
fs.writeFileSync(R + "index.html", html);

console.log("Version: " + cur + " -> " + nv + " (in VERSION und index.html gestempelt)");
