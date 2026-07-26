# Volkswirtschafts-Simulation — Konzept

Stand: Grobkonzept. Bewusst offen gelassene Punkte sind am Ende gesammelt.
Ein spielbarer Prototyp existiert (`siedlung.jsx`) und bildet den Kern bereits ab.

---

## 1. Was das Spiel ist

Ein Browser-Incremental-Spiel in der Tradition von *Universal Paperclips*: einfach
im Einstieg, wachsende Komplexität, hoher Sog. Der Spieler steuert eine
Volkswirtschaft von der Subsistenz-Siedlung bis zur modernen Industriegesellschaft.

**Erste Priorität ist Spielspaß.** Der Lerneffekt entsteht nebenbei — dadurch, dass
das Modell korrekt ist und der Spieler gegen falsche Intuitionen läuft, nicht durch
Erklärtexte.

Ökonomische Grundlage ist MMT bzw. eine saldenmechanisch konsistente Modellierung.
Buchhaltungsidentitäten sind hart verdrahtet. Umstrittene Verhaltensannahmen
(Inflationsdynamik, Investitionsverhalten) gehören in die Config, nicht in den Code.

### Mythen, gegen die der Spieler laufen soll

Jeder braucht eine Mechanik, die ihn widerlegt — keine Textbox:

| Mythos | Erfahrung im Spiel |
|---|---|
| Der Staat muss erst einnehmen, um ausgeben zu können | Steuer vor der ersten Ausgabe → niemand kann zahlen |
| Geld ist knapp | Umlaufmenge = kumuliertes Staatsdefizit, vom Spieler gesetzt |
| Staatsschulden sind eine Last | Zähler steigt, nichts passiert — bis die Auslastung reißt |
| Sparsamkeit ist solide | Überschuss zieht Geld ab, Wirtschaft fällt Richtung Tauschhandel |
| Inflation kommt von der Geldmenge | Sie kommt aus der Spalte Auslastung |
| Privat ist immer effizienter | Private Investition versiegt genau in der Krise |

Die übergeordnete Lehre: **Knappheit ist immer real** — Arbeit, Kapazität,
Rohstoffe — und nie monetär. Der Spieler lernt das, bevor überhaupt Geld existiert.

---

## 2. Kernmodell

### Die eine Ressource

**Arbeit**, gemessen in Arbeitsmonaten (AM). Alles kostet Arbeit: Nahrung, Erhalt,
Bau, Forschung. Geld kommt später dazu und ist nie die eigentliche Beschränkung.

### Sektoren

Alle Sektoren funktionieren gleich, mit denselben Spalten. Am Anfang gibt es zwei
(Nahrung, Wohnraum), später kommen weitere dazu — Energie, Bildung, Gesundheit,
Mobilität. Neue Sektoren sind Config-Zeilen, keine neue Mechanik.

Zwei Typen:

- **Fluss** (Nahrung): muss jeden Tick produziert werden, lagerfähig
- **Bestand** (Wohnraum): wird gebaut, verfällt prozentual pro Tick, Überschuss = Leerstand

Erhaltung ist kein eigener Mechanismus, sondern Neubau von dem, was zerfallen ist.
Eine Regel, ein Kostensatz.

### Produktivität durch Anlagen

Ein Sektor hat einen Aufwandssatz (AM je Einheit). **Anlagen** senken ihn — aber
nur für eine begrenzte **Kapazität** (z. B. eine Mühle bedient 60 Personen). Der
effektive Satz ist der Mischwert aus bedienten und unbedienten Personen.

Das ist der zentrale Trick: Wächst die Bevölkerung, sinkt der Nutzen bestehender
Anlagen automatisch, es braucht mehr davon. Kein künstlicher Grenzertrag nötig.

### Zwei Spalten, die nicht dasselbe sind

- **Deckung** = Produktion / Bedarf → kommt genug an?
- **Auslastung** = wie weit die Anlagen ausgereizt sind

Der Unterschied bestimmt, ob zusätzliche Nachfrage in Menge oder in Preise geht.
Das ist später die Inflationsmechanik — deshalb steht Auslastung ab der ersten
Minute in der Übersicht, lange bevor es Geld gibt.

### Bevölkerung

Wächst und schrumpft endogen, abhängig von Nahrungsvorrat und Wohnraumdeckung.
Erzeugt die Malthusische Falle: Produktivitätsgewinne werden von Bevölkerungs-
wachstum aufgefressen. Das ist der Motor der Frühphase und der Grund, warum der
Spieler Geld braucht.

---

## 3. Tick-Pipeline

Feste Reihenfolge, unabhängig davon, wie viele Sektoren existieren:

1. Verfall aller Bestände
2. Arbeitsangebot berechnen (Bevölkerung × AM pro Kopf)
3. Zuteilung nach Priorität: Bestandserhalt → laufende Sektorkosten → Vorhaben → Rest
4. Produktion je Sektor
5. Deckung und Auslastung je Sektor
6. Lager aktualisieren
7. Bevölkerung (Geburten, Tode)
8. Geldkreislauf und Preisniveau (sobald aktiv)
9. Private Investition (sobald aktiv)
10. Fortschritt der Vorhaben

Ein Tick ist ein Monat. Der Spieler stellt die Geschwindigkeit ein (Pause / 1× / 2× / 5×),
SimCity-artig.

---

## 4. Vorhaben statt Level

Es gibt **keine Level**. Fortschritt läuft über einen Baum aus **Vorhaben**.
Ein Vorhaben ist immer dasselbe: Arbeit fließt hinein, bei 100 % ist es fertig.
Unterschiedlich ist nur das Ergebnis:

- **Wissen** — dauerhaft, verfällt nie, kostet in der Nutzung nichts (Münzgeld, Fruchtwechsel)
- **Anlage** — physischer Bestand, hat Kapazität, verfällt, wiederholbar (Mühle, Schule)

Wichtig ist die Unterscheidung zu **Bildung**: Wissen ist der Baum selbst und
bleibt. Bildung ist ein Bestand in Köpfen, verfällt (Menschen sterben) und muss
laufend erneuert werden. Bildung hebt die Produktivität **aller** Sektoren, stark
abflachend, mit langer Verzögerung.

### Knotenarten

- **Institutionen** (selten): ändern die Spielregeln, bringen neue Regler und eine neue Fehlerart — Münzgeld, Steuerwesen, Lohnarbeit, Banken, Zentralbank, Außenhandel
- **Verfahren** (häufig): bessere Sätze, neue Anlagentypen — das schnelle Futter
- **Politikfelder** (~10): kosten dauerhaft Arbeit, zahlen verzögert, immer optional — Bildung, Gesundheit, Rente, Wohnungsbau, Jobgarantie

Sackgassen-Knoten sind erlaubt und erwünscht. Die Anforderung gilt nicht dem
einzelnen Knoten, sondern dem **sichtbaren Rand**: Es müssen immer 3–5 erreichbare
Vorhaben offen liegen. Zu Spielbeginn ist fast alles unsichtbar, nicht nur gesperrt.

Institutionsknoten sind die Ausrufezeichen — sie öffnen jeweils einen ganzen Ast,
der vorher grau war.

### Grober Ablauf der Institutionen

Anlagen → Geld & Steuern → Märkte & Haushaltsschichten → Banken & Kredit →
Außenhandel & Währung → Energie & Ressourcen.

Diese Reihenfolge ist zwingend (jede Stufe setzt die vorige voraus). Die
Politikfelder daneben sind frei wählbar — hier entscheidet sich progressiv vs.
konservativ. Beide Spielweisen sind gewinnbar und scheitern unterschiedlich.

---

## 5. Geld

Vor Münzgeld gibt es kein Geld — der Spieler kann nur Fronarbeit abziehen, und die
ist durch Hunger begrenzt.

Die Einführung läuft in drei Schritten und ist der wichtigste Moment des Spiels:

1. **Münzen prägen** → niemand will sie, nichts passiert
2. **Steuer erheben**, zahlbar nur in Münzen → jetzt will jeder Münzen verdienen
3. **Lohnarbeit** → der Staat kauft Arbeit statt sie zu befehlen

Der Effekt ist ein echter Multiplikator: Das Arbeitsangebot pro Kopf steigt deutlich
über 1,0 (Mehrarbeit lohnt sich jetzt), und Spezialisierung wird möglich.

### Mechanik

- **Geld im Umlauf = kumuliertes Staatsdefizit.** Eine Zahl mit genau diesem Label — die Identität steht im Namen, nicht in zwei Feldern.
- **Der Staatslohn ist der Preisanker.** Er definiert, was eine Münze wert ist. Verdoppeln verdoppelt alle Preise, real ändert sich nichts.
- **Inflation** entsteht, wenn Staatsnachfrage auf einen Sektor mit voller Auslastung trifft — nicht aus der Geldmenge.
- **Zu wenig Geld** (Überschuss über längere Zeit) drückt die Wirtschaft zurück Richtung Tauschhandel.
- **Steuern** sind Regler für Arbeitsangebot und Verteilung, nicht für Finanzierung. Art der Steuer (Kopf / Einkommen / Vermögen / Konsum nach Sektor) bestimmt, wen sie trifft.

Banken und Kredit kommen erst danach — dann als zweite Geldquelle neben dem Staat.

---

## 6. Privatisierung

Wichtige Unterscheidung:

- **Produktion** machen immer die Haushalte, in jedem Sektor, in jedem Spielstand. Das ist nie ein Schalter.
- **Investition** ist der Schalter. Pro Sektor: Staat oder Privat.

Freigeschaltet durch Münzgeld (ohne Geld keine Ersparnisse) plus einen eigenen Knoten.

| | Staat | Privat |
|---|---|---|
| Baut | wann der Spieler will | wenn es sich lohnt |
| Kostet den Staat | Arbeit bzw. Geld | nichts |
| Reaktion auf Knappheit | nur wenn der Spieler reagiert | automatisch und schnell |
| Reaktion in der Flaute | Staat kann gegensteuern | nichts passiert |
| Ertrag | an alle | Aufschlag an die Eigentümer |
| Ungleichheit | stabil | steigt, selbstverstärkend |

Auslöser für private Investition: hohe Auslastung **und** ausreichende Ersparnisse.
Beides muss zutreffen. Daraus folgt der Haken, den man erst spät merkt: In der
Krise fällt die Auslastung überall, private Investition versiegt genau dann, wenn
sie gebraucht wird.

Privatisierung ist damit kein moralischer Schalter, sondern ein Tausch:
Reaktionsgeschwindigkeit gegen Ungleichheit und Krisenanfälligkeit.

---

## 7. Ungleichheit

Muss in beide Richtungen wehtun, sonst ist es Propaganda.

Haushaltsschichten mit unterschiedlicher Konsumneigung. Geld nach unten hat hohen
Multiplikator, drückt aber auf die unelastischen Güter. Geld nach oben versickert in
Vermögensmärkten. Zu hohe Ungleichheit → Nachfrageschwäche. Zu abrupte Umverteilung
→ Investitionszurückhaltung (umstritten, deshalb als Config-Parameter).

Wird erst sinnvoll, wenn Haushaltsschichten existieren — vorher sind alle Siedler
identisch und jeder Gini wäre null.

---

## 8. Krisen

Keine zufälligen Katastrophen. Die interessanten Krisen sind **endogen**:
Bevölkerung frisst Produktivität, Auslastung reißt, private Investition versiegt.
Die entstehen aus dem Modell und sind deshalb lehrreich.

Zwei Ausnahmen:

- **Ernteschwankung** ab Beginn (±15 % pro Tick) — ohne sie ist Vorratshaltung sinnlos; mit ihr wird der Speicher zum ersten strategischen Puffer und damit zur Vorstufe von allem Späteren bis zur Jobgarantie
- **Gezielte Angebotsschocks** später (Missernte, Energiepreissprung) — als Gegenbeweis zu „Inflation kommt immer von der Nachfrage"

---

## 9. Oberfläche

Sie muss über das ganze Spiel gleich groß bleiben und nur tiefer werden.

**Kopfzeile** — nur Globales: Bevölkerung (mit Delta pro Tick), freie Arbeit, Tick.
Später Geld im Umlauf, Preisniveau, Gini.

**Arbeitsverteilungs-Balken** — ein Streifen, der zeigt, wohin die verfügbaren
Arbeitsmonate fließen. Macht den zentralen Trade-off physisch sichtbar.

**Sektortabelle** — eine Zeile je Sektor, immer dieselben Spalten:
Produktivität (Index, 100 = Start, über alle Sektoren vergleichbar) · Anlagen mit
Auslastung · Bestand mit Delta pro Tick · Deckung · Arbeit.

Jeder Bestandswert zeigt seine Veränderung pro Tick. Verfall bekommt keine eigene
Spalte — er ist im Delta und in der Arbeit-Spalte sichtbar.

**Aufklappen** je Sektor für die Innereien: Aufwandssatz, Anlagendetails,
Ersatz vs. Neubau, Eigentumsschalter.

**Chronik** — ein Log. Konzepte werden im Moment gemeldet, in dem sie beißen
("Mühle ausgelastet, 30 Siedler mahlen wieder von Hand"), statt dauerhaft angezeigt
zu werden.

**Regel für alles Neue:** Ein Konzept startet im Aufklapp-Bereich und wandert nur
dann nach oben, wenn der Spieler aktiv darauf reagieren muss.

---

## 10. Technik

**Client-only.** Kein Backend, kein Account, Speicherstand in localStorage. Multiplayer
ist nicht geplant — simulierte Nachbarstaaten sind für die Lernziele besser geeignet
als echte Mitspieler (ein Nachbar, der stur auf Exportüberschuss spielt, lehrt etwas;
ein zufälliger Mitspieler nicht).

**Kern als reine Funktion:** `tick(state, actions) → state`. Kein DOM, kein Framework
im Kern. Zufall ausschließlich über einen Seed. Damit läuft die Simulation headless
testbar, deterministisch und wäre notfalls serverfähig.

**Alle Balancing-Zahlen in einer Config**, keine im Code. Sektoren, Anlagen,
Vorhaben, Raten — alles Daten. Balancing passiert durch Editieren, nicht durch
Umschreiben.

**Tests** vor allem auf die Bilanzidentitäten: Geld im Umlauf muss immer dem
kumulierten Defizit entsprechen, Arbeitszuteilung muss sich zum Angebot summieren.

---

## 11. Bewusst offen

Das hier ist noch nicht entschieden und sollte im Detail besprochen werden:

- Konkrete Zahlen für Sätze, Kapazitäten, Kosten, Wachstumsraten — der Prototyp hat erste Werte, die Balance ist ungeprüft
- Vollständiger Vorhabensbaum: Anzahl, Reihenfolge, Voraussetzungen
- Wie Haushaltsschichten technisch modelliert werden (diskrete Klassen vs. Verteilung)
- Wie Banken und Kredit im Detail funktionieren
- Ob Zufriedenheit, Presse, Wahlen überhaupt vorkommen
- Wie das Spiel endet oder ob es das tut; ob es Siegbedingungen gibt oder nur mehrere Score-Achsen (Wohlstand, Gleichheit, Preisstabilität, Auslastung, Ökologie)
- Ob es mehrere Wohnraum-Hebel geben soll (aktuell nur Ziegelei)
- Balance von Bildung — im Prototyp aktuell zu teuer für ihren Nutzen
