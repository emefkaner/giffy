# LIDL GIFFY

Statische, clientseitige One-Page-Web-App (eine einzige `index.html`) zum
Umwandeln von Videos in animierte GIFs. Läuft komplett lokal im Browser –
keine Server, keine Uploads, keine externen Bibliotheken. Design im
Lidl-Look, identisch zu „MCO Now Konverter“ und „InStore Communication
Converter“ (Repos `emefkaner/mconow` und `emefkaner/instorecommunications`).

## Projektstruktur
- `index.html` – die komplette App inkl. eingebettetem GIF89a-Encoder,
  Styles und Sales-Kunde-Logo (Data-URI). **Zugleich die Standalone-Datei** –
  es gibt keinen Build-Schritt.
- `test/test-encoder.js` – Roundtrip-Test des Encoders (reines Node, keine
  Abhängigkeiten): `node test/test-encoder.js`
- `VERSION` – aktuelle Versionsnummer
- `bump-version.js` – erhöht die Version automatisch

## WICHTIG: Automatische Versionsnummer
Die App zeigt unten in der Fußzeile eine Versionsnummer (Start: **1.0**).

**Regel (vom Nutzer gewünscht): Bei JEDER Aktualisierung der App die Version
automatisch um 0.1 erhöhen.** Ablauf bei jeder Änderung, bevor committet wird:

```
node bump-version.js        # Version +0.1, stempelt index.html-Fußzeile
```

## WICHTIG: Finale HTML immer ausliefern
**Regel (vom Nutzer gewünscht): Nach jeder neuen Version die fertige
`index.html` dem Nutzer direkt als Datei liefern** (nicht nur pushen) –
GitHub ist im Firmennetz blockiert.

## Design-Konventionen (vom MCO Now Konverter übernommen)
- Lidl-Farben: Blau `#0050aa`, Gelb `#fff000`, Rot `#e60a14`
- Header: blauer Verlauf, gelbe Unterkante, Rauten-Motiv, rotes
  Rauten-Logo, Sales-Kunde-Logo oben rechts (unverändert übernehmen)
- Karten mit Blau-Gelb-Rot-Streifen oben, Slider mit Lidl-blauer Füllung
- Footer: App-Name · „created by Marc Ferdinand Körner – Team Sales Kunde“ ·
  Version

## Entwicklung / Tests
- Encoder-Test: `node test/test-encoder.js`
- E2E (optional, Playwright + Chromium): Video im Browser erzeugen, in die
  App füttern, GIF validieren
