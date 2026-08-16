# Übergabe — Stand beim Pausieren

**Datum: 2026-08-16 · Stand: der Merge dieses Commits nach `main`.** Dieses Dokument
ist an diesen Stand gebunden und behauptet nie, aktuell zu sein.

## Wo das Projekt steht

Die erste Ausbaustufe der Spiel-Oberfläche (Epoche 1, Wildbeuter) ist zur Hälfte
gebaut, alles Grüne läuft auf `main`:

- **Paket 1 (Fundament und Zeit):** Farb-/Typo-Schicht aus der Vorlage, Seitenraster,
  Kopfleiste mit vier Zeit-Griffen, 500-ms-Takt mit sichtbarer Raffung, Not-Halt,
  Ereignis-Log in Tickblöcken.
- **Paket 2 (das Band und seine Karten):** Die Bedarfs-Leiter ist durch das
  horizontale **Band** ersetzt (Breite = Voll-Deckungs-Kosten, Füllung = Deckung bzw.
  Stand, ziehbare ockerne Anspruchs-Segmente, Zweiton-Beschriftung), dazu die
  **Erklärkarten nach der Kartengrammatik** (sieben Plätze; Stufenkurven mit
  Bremsteppich, Ursachen-und-Folgen-Block, Auswege), der Katalog in vier Gruppen,
  Bedingungszeilen im Ereignis-Muster ohne Rohzahlen, der `#protokoll`-Griff.
- Tests: 145 (90 Kern + 55 Oberfläche) · Kriterien `node tools/measure.ts`: 18 von 18.

## Wie man es startet und prüft

| | |
|---|---|
| Spiel | `npm run dev` → http://localhost:5173 (Seed fest: 42) |
| Tests | `npx vitest run` (Kern und Oberfläche getrennt berichten) |
| Kriterien | `node tools/measure.ts` — 18 müssen bestehen |
| Von Hand spielen/messen | `MMTSIM_SESSION_PORT=79xx node tools/session.ts` und JavaScript an `/eval` schicken (siehe `.claude/skills/playtest`) |
| Lauf-Protokoll ziehen | im Spiel `#protokoll` an die Adresse hängen → Textdatei mit Seed und jeder Handlung, direkt im Sitzungswerkzeug nachspielbar |
| Mitschauen durch die Sitzung | Chrome mit `--remote-debugging-port=9222 --user-data-dir=$HOME/.chrome-claude`, Spiel darin öffnen |

## Der Leseweg für eine frische Sitzung

1. **`CLAUDE.md`** — wie gearbeitet und geantwortet wird, einschließlich des
   Abschnitts „Wie mit Bau- und Design-Agenten gearbeitet wird" (der eingespielte
   Takt: sammeln → schnüren → freigeben → Agent baut → vollständiger Bericht →
   prüfen/mergen → live testen).
2. **`KONZEPT.md`, Abschnitt T9** — alles Entschiedene zur Oberfläche: Band,
   Kartengrammatik, Anzeige-Gesetze, Vokabular, Momente, Eröffnung.
3. **Die Issues** (github.com/rainco77/mmtsim/issues) — der einzige Ort der offenen
   Punkte: **#45** (now: die ausstehende Verständlichkeits-Sichtung — der erste
   Schritt nach der Pause) · **#42/#43/#44** (next: Pakete 3, 4, 5, je mit den
   gesammelten Feinschliff-Funden ihrer Kacheln) · **#41/#46/#47** (later) und die
   älteren offenen Issues.
4. Die Design-Vorlagen: `design/mock4*.html` und `design/band/*` (Gesetz für den Bau;
   `design/band/band-detail.html` ist die Spezifikation der Karten).

## Woran zuerst weiterarbeiten

Issue **#45**: Der Auftraggeber sichtet die neuen Karten, Bedingungszeilen und den
Katalog auf Verständlichkeit — sein Urteil bestimmt, ob vor Paket 3 (#42) noch eine
Korrekturrunde kommt.
