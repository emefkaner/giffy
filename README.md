# LIDL GIFFY – Video zu GIF im Browser

Eine One-Page-HTML-App im Lidl-Design (Look & Feel wie MCO Now Konverter und InStore Communication Converter), die Videos direkt im Browser in animierte GIFs umwandelt.
**Komplett clientseitig** – keine Server, keine Uploads, keine externen Bibliotheken.

## Benutzung

Live unter `http://lidl.saleskunde.de/giffy/` – oder einfach `index.html` lokal im Browser öffnen (Doppelklick genügt, kein Webserver nötig):

1. Video per Drag & Drop oder Klick auswählen (MP4, WebM, MOV … alles, was der Browser abspielen kann)
2. Ausschnitt (Start/Ende), FPS, Breite, Dithering und Endlos-Schleife einstellen
3. Modus wählen:
   - **Qualität vorgeben** – der Qualitätsslider (10–100 %) steuert die Farbanzahl
     pro Frame (4–256 Farben)
   - **Dateigröße begrenzen** – der Größenslider (0,1–10 MB) setzt eine Obergrenze;
     die App verkleinert dann automatisch schrittweise die Breite (und notfalls die
     Farbanzahl), bis das GIF unter die Grenze passt
4. „✨ In GIF umwandeln“ klicken
5. GIF ansehen und herunterladen

## Wie es funktioniert

- Frames werden per `<video>`-Seek auf ein Canvas gezeichnet, einmal als RGBA-Daten
  erfasst und dann kodiert; im Größenmodus werden weitere Kodierversuche aus den
  gespeicherten Frames heruntergerechnet (kein erneutes Seeking)
- Ein eingebetteter GIF89a-Encoder (reines JavaScript) übernimmt die Kodierung:
  - **Median-Cut-Quantisierung** auf max. 256 Farben pro Frame (lokale Farbtabellen)
  - optional **Floyd-Steinberg-Dithering** für weichere Farbverläufe
  - **LZW-Kompression** mit variabler Codelänge inkl. 12-Bit-Wörterbuch-Reset
  - NETSCAPE2.0-Extension für die Endlos-Schleife

## Tests

Der Encoder lässt sich ohne Browser testen (kodiert synthetische Frames und
dekodiert sie mit einem strikten Referenz-Decoder zurück):

```bash
node test/test-encoder.js
```

## Versionierung

Die App zeigt im Footer eine Versionsnummer (Start: 1.0). Bei jeder
Aktualisierung wird sie automatisch um 0.1 erhöht:

```bash
node bump-version.js
```

## Tipps

- GIFs werden schnell groß: kurze Ausschnitte (≤ 8 s), 10–15 FPS und ≤ 480 px Breite liefern die besten Ergebnisse
- Bei flächigen Motiven (Screencasts, Cartoons) Dithering ausschalten – das spart deutlich Dateigröße
