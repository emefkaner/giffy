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

## WICHTIG: Deployment auf den Strato-Webspace
Die App läuft live unter **`http://lidl.saleskunde.de/giffy/`**
(HTTPS folgt, sobald das SSL-Zertifikat für die Subdomain aktiv ist).

**Regel (vom Nutzer gewünscht): Jede neue Version zusätzlich dorthin
deployen.** Ablauf und Fakten:

- Ziel auf dem Webspace: `/LIDL/giffy/index.html` (per SFTP, Port 22).
  Die Subdomain `lidl.saleskunde.de` ist im Strato-Panel dem Ordner
  `/LIDL` zugeordnet; `/LIDL/index.html` leitet auf `/giffy/` weiter.
- Zugangsdaten (Host, Nutzer, Passwort) stehen **nicht** in diesem
  öffentlichen Repo, sondern in Marcs Dropbox:
  `/_CLAUDE/WEB_Schmelztiegel.store/tools/.deploy-credentials`
  (derselbe Strato-Webspace wie emefka.com und schmelztiegel.store).
- In Claude-Remote-Sessions ist ausgehend nur Port 443 erlaubt – SFTP
  von dort über eine verbundene Cloud-Sandbox ausführen (z. B.
  Higgsfield `sandbox_exec`: paramiko installieren, Datei per SFTP
  hochladen; die aktuelle `index.html` kann die Sandbox direkt von
  GitHub-Raw laden, das Repo ist öffentlich).
- Nach dem Upload die Live-URL testen (Inhalt muss „LIDL GIFFY“ und die
  neue Versionsnummer enthalten).
- SSL/Subdomain-Einstellungen gehen nur über den Strato-Kundenlogin
  (Kundennummer 74025894) – dessen Passwort ist nirgends hinterlegt,
  solche Schritte macht Marc selbst.

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
