# Konzept — festgelegte Entscheidungen

Lebendes Dokument. Wird nach **jeder** Einigung fortgeschrieben, bevor der nächste
Vorschlag kommt. Wer hier neu einsteigt, liest nur diese Datei.

`DRAFT.md` ist ein früherer Entwurf und dient **nur als Inspiration** — nichts darin
ist verbindlich, solange es nicht hier unten steht.

---

## Ziel

Ein Browser-Incremental in der Tradition von *Universal Paperclips*: einfacher
Einstieg, wachsende Komplexität, hoher Sog.

Drei gleichrangige Anforderungen:

1. **Es muss Spaß machen und süchtig machen.**
2. **Es muss die volkswirtschaftliche Lehre so genau wie möglich wiedergeben** — das
   Spiel soll wirklich dazu dienen, Volkswirtschaft zu verstehen, und mit verbreiteten
   Mythen aufräumen (Geld sei knapp, Staaten könnten in eigener Währung pleitegehen).
3. **Es muss gegen wissenschaftliche Kritik möglichst immun sein.** Ein VWL-Professor
   soll es empfehlen können; jemand wie Maurice Höfgen soll es als lehrreich und nicht
   als falsch einordnen. Vereinfachungen sind erlaubt — besonders am Anfang —, aber
   nichts darf **falsch** sein, und nichts darf so **unterkomplex** sein, dass es wie
   falsch wirkt. Jede Mechanik braucht einen Anker in der Lehre (siehe unten).

Ökonomische Grundlage: MMT bzw. saldenmechanisch konsistente Modellierung.
Buchhaltungsidentitäten sind hart. Umstrittene Verhaltensannahmen gehören in die
Konfiguration, nicht in den Code.

**Politisch neutral.** Progressive und konservative Spielweisen müssen beide
gewinnbar sein und unterschiedlich scheitern. Das Spiel sagt, was *möglich* ist,
nicht was *wünschenswert* ist.

---

## Arbeitsweise

- **Ein Vorschlag pro Runde.** Vorschlag → Kommentar → Einigung → nächster Punkt.
- Reihenfolge **von vorne nach hinten** (frühe Spielphase zuerst) und **vom Groben
  ins Feine**.
- Der Anfang muss super simpel sein. Komplexität kommt ausschließlich schrittweise
  im Spielverlauf dazu.
- Nach jeder Einigung: dieses Dokument fortschreiben, dann committen.

---

## Entschieden

### E1 — Fortschritt heißt weniger Kontrolle, nicht mehr Zahlen

Der Widerspruch zwischen Spielspaß und Korrektheit wird so aufgelöst: Die
Fortschrittsachse des Spiels ist der **schrittweise Verlust direkter Steuerung**.

Am Anfang wird die Arbeit von ein paar Dutzend Menschen direkt zugeteilt — für eine
Gemeinschaft dieser Größe ist das ökonomisch korrekt. Mit jeder Institution wird ein
direkter Hebel genommen und durch einen indirekten ersetzt (Arbeit zuteilen → Arbeit
kaufen → Anreize setzen → …). Am Ende sitzt der Spieler dort, wo ein echter Staat
sitzt: Ausgaben, Steuern, Zinsen, Gesetze — und eine Wirtschaft, die sich selbst
bewegt.

Trägt beides gleichzeitig: **süchtig**, weil jede Institution das Spiel neu erfindet
und die gemeisterte Oberfläche obsolet macht; **lehrreich**, weil der Kontrollverlust
nicht simuliert wird, sondern die Lektion selbst ist; **neutral**, weil nie gesagt
wird, ob Kontrolle gut oder schlecht ist — nur, dass sie ihre Form ändert.

Der Spieler tritt dabei **nicht als Befehlshaber** auf, sondern als die kollektive
Entscheidung der Gemeinschaft. „Kleine Siedlungen teilen Arbeit per Anordnung zu" ist
anthropologisch bestritten (Graeber: Gaben und Verpflichtung statt Befehl); die
kollektive Lesart kostet mechanisch nichts und ist unangreifbar.

*Leitlinie, kein Gesetz.* Einzelne direkte Hebel dürfen bleiben, wo es dem Spiel hilft.

### E2 — Zweischichten-Fundament

**Untere Schicht — die reale Wirtschaft.** Knapp sind **reale Ressourcen**: die Zeit
der Menschen, Fläche, Rohstoffe, Anlagen, Energie. Welche davon *bindet*, hängt vom
Sektor und von der Epoche ab (→ E6). Am Anfang ist es Fläche, kurz darauf Arbeit.

> Formulierungen wie „nur die Zeit der Menschen ist knapp" sind bewusst verworfen. Das
> wäre faktisch eine Arbeitswertlehre und würde sofort als Parteinahme eingeordnet
> (Ricardo, Marx, Sraffa). Die MMT sagt ausdrücklich **reale Ressourcen im Plural**.

**Obere Schichten — Geld und Institutionen.** Kommen später dazu. Sie ändern:

- **wie** die realen Ressourcen verteilt werden, und
- **wie produktiv** ihr Einsatz ist (Werkzeuge, Wissen, Organisation, Spezialisierung).

Sie ändern **nie, wieviel davon da ist.**

Damit ist die Kernlehre keine Behauptung, sondern das, was auf dem Bildschirm steht:
Bei „können wir uns X leisten?" ist die Antwort immer dieselbe wie in Monat 1 —
**was bindet gerade, und ist dort Luft?** Nie „ist Geld da?". Und die Grenze bleibt
ehrlich: ohne Luft wird es teurer statt mehr.

### E3 — Sektormerkmale

Alle Sektoren laufen über dasselbe Schema. Ein neuer Sektor ist eine Zeile
Konfiguration, nie neue Mechanik.

| Merkmal | Frage | Trägt im Spiel |
|---|---|---|
| **Verfallsrate** | Wie schnell zerfällt der Bestand? | Bestimmt, ob Puffer möglich sind (Pflege 100 %/Tick, Wohnraum sehr langsam) |
| **Sättigung** | Wieviel braucht ein Mensch, bis genug ist? | Motor des Strukturwandels — Wachstum muss woandershin, wenn Grundbedarf gedeckt ist |
| **Trägheit** | Wie lange von Entscheidung bis Wirkung? | Grund, warum Wirtschaftspolitik schwer ist |

**Produktivität ist kein Sektormerkmal**, sondern Ergebnis der oberen Schichten (E2)
und der verfügbaren Verfahren (E5).

**Elastizität ist ebenfalls kein Merkmal**, sondern ein Ergebnis (→ E5). Als feste
Zahl wäre sie fachlich falsch: Angebotselastizität hängt an Auslastung und
Zeithorizont, sie ist keine Konstante.

### E4 — Inputs: Kapazität vs. Vorleistung

Sektoren haben **Inputs**, nicht nur Arbeit. Zwei Arten:

**Kapazität** — wird **belegt**, nicht verbraucht. Land, Gebäude, Maschinen. Steht
während der Produktion zur Verfügung und ist danach wieder frei. Verfällt über die
Zeit, nicht durch Nutzung.

**Vorleistung** — wird **verbraucht**. Energie, Dünger, Saatgut, Stahl. Weg nach der
Produktion, muss jeden Tick neu beschafft werden.

Das ist die Trennung der Volkswirtschaftlichen Gesamtrechnung; der zweite Begriff
heißt dort wörtlich *Vorleistungen*. Lieferketten sind damit nichts anderes als die
**Input-Output-Tabelle nach Leontief** — jeder Sektor bezieht Vorleistungen von
anderen Sektoren.

Zwei Dinge fallen gratis ab:

- **Auslastung** bekommt ihre präzise Definition: wie stark die *Kapazitätsinputs*
  belegt sind. Nicht, wieviele Vorleistungen fließen.
- **Wertschöpfung** wird darstellbar: Produktion − Vorleistungen. Erst damit lässt
  sich das BIP korrekt bilden, ohne doppelt zu zählen.

Zu Spielbeginn gibt es **null Vorleistungen**: Nahrung braucht Land und Arbeit,
fertig. Die Lieferkettenmaschinerie schaltet sich erst mit der ersten Maschine ein —
und bringt dann sofort ihre eigene Verwundbarkeit mit.

### E5 — Verfahren mit Rückfallebene

Jeder Sektor hat mehrere **Verfahren**, jedes mit eigenen Inputs und eigener
Produktivität. Beispiel Nahrung im Endausbau:

| Verfahren | Inputs | Ertrag je Arbeitsmonat |
|---|---|---|
| Maschinell | Land, Maschinen, Energie, Dünger | 40 |
| Pfluggespann | Land, Zugtiere, Futter | 8 |
| Handarbeit | Land | 3 |

**Regel: Das beste Verfahren läuft, bis einer seiner Inputs ausgeht. Der Rest fällt
auf das nächste zurück.**

Fehlt Energie für die halbe Maschinenflotte, läuft sie halb, der Rest geht ans
Pfluggespann oder an die Hand. Die Produktion bricht nicht ein — die
**Durchschnittsproduktivität sinkt**.

Folgen:

- **Auslastung geht nie über 100 %.** Was nicht mehr in die Maschinen passt, läuft auf
  der Rückfallebene. Kein Sonderfall.
- **Der harte Stopp bleibt möglich**, ohne Extramerkmal: ein Sektor ohne Rückfallebene
  (Chipfertigung) steht ohne Energie einfach still.
- **Elastizität ist definiert**: elastisch, solange ein besseres Verfahren noch Luft
  hat; unelastisch, wenn alles auf der schlechtesten Stufe läuft und der feste Faktor
  voll ist.
- **Produktivität steigt**, indem man ein besseres Verfahren freischaltet **und** die
  Inputs dafür beschafft. Natürlicher Anschluss für den Fortschrittsbaum.

Akademisch ist das **Aktivitätsanalyse** (Koopmans): Produktion als Menge diskreter
Verfahren mit festen Inputkoeffizienten, die Produktionsfunktion entsteht als obere
Hülle. Entscheidend: **Substitution wird nicht unterstellt, sie entsteht.** Damit
umgehen wir die aggregierte Produktionsfunktion vom Cobb-Douglas-Typ und mit ihr die
Kapitalkontroverse — die schärfste methodische Kritik in dem Feld.

Zu Spielbeginn hat Nahrung **genau ein Verfahren**: Handarbeit auf Land.

### E6 — Der Engpass wandert

Land wächst nicht von selbst, soll aber auch nicht ewig die Frage bleiben. Auf jeden
begrenzten Input gibt es genau **zwei Antworten**:

**Extensiv** — mehr davon erschließen. Kostet Arbeit. Entscheidend: **das beste Land
wird zuerst genommen**, jede weitere Fläche ist schlechter (Ricardos
Differentialrente).

**Intensiv** — mehr aus dem holen, was da ist. Kostet Wissen und Anlagen.

Anfangs ist Erschließen billig, also expandiert man. Dann beißen die abnehmenden
Erträge und Intensivierung wird der bessere Deal. **Dieser Kipppunkt ist die erste
echte strategische Entscheidung des Spiels — und buchstäblich die Agrarrevolution.**

Danach hört Land auf zu binden, weil **Nahrung scharfe Sättigung hat** (E3): Sind alle
satt, muss die Landwirtschaft nicht weiter wachsen, ihr Arbeitsanteil fällt. Man
verwaltet Land nicht ewig — **man wächst aus ihm heraus.**

| Epoche | Was bindet |
|---|---|
| Siedlung | Fläche |
| nach der Agrarrevolution | Arbeit |
| Industrialisierung | Anlagen und Energie |
| Moderne | Qualifikation, Demographie, Umweltsenken |
| galaktisch | die extensive Grenze öffnet sich wieder |

Historisch korrekt — 1500 war Land der Engpass Europas, heute begrenzt Ackerfläche
Deutschland nicht. Nebeneffekt: Die galaktische Spätphase wird thematisch schlüssig
statt beliebig; sie ist der Moment, in dem die extensive Grenze wieder aufgeht.

### E7 — Bevölkerung stufenweise

**Stufe 1: eine einzige Zahl.** Kein Alter, keine Kohorten, keine Geburten- und
Sterbetabellen. Sie wächst, wenn die Versorgung über dem Existenzminimum liegt, und
schrumpft, wenn sie darunter fällt.

Daraus fällt die Malthus-Dynamik von allein heraus — **aber nur, weil Land existiert**
(E6). Ohne festen Faktor gäbe es konstante Skalenerträge, die Pro-Kopf-Versorgung
bliebe bei Wachstum unverändert und die Falle könnte gar nicht eintreten. Der
Mechanismus ist: begrenzte Fläche → abnehmende Erträge der Arbeit → Wachstum stoppt am
Existenzminimum.

**Altersstruktur kommt erst, wenn ein Politikfeld sie braucht** (Bildung → Kinder,
Rente → Alte, Pflege → beides). Vorher wäre sie Rechenlast ohne Spielwirkung.

Sobald sie kommt, trägt sie die schärfste Lektion des Spiels: „Renten sind wegen der
Demographie nicht finanzierbar" ist **über Geld falsch und über reale Ressourcen
wahr**. Weniger Hände müssen für mehr Münder produzieren — eine echte Beschränkung,
keine monetäre.

### E8 — Keine Benotung

Es gibt am Ende kein Urteil und keine Punktzahl über die Spielweise. Kennzahlen
beschreiben, sie bewerten nicht. Sobald das Spiel Gleichheit oder Preisstabilität
benotet, benotet es Politik und die Neutralität ist verloren.

---

## Vorläufig

### V1 — Start im Überschuss

Das Spiel beginnt nicht mit Mangel, sondern mit gedeckten Bedürfnissen und **freier,
ungenutzter Arbeit** als erstem und einzigem Hebel. Der Spieler lernt sofort:
brachliegende Arbeit ist verlorener Wohlstand, der nie wiederkommt — genau die
Intuition, die er später für Arbeitslosigkeit und Unterauslastung braucht.

*Grundsätzlich abgenickt, aber als unwichtig eingestuft. Kann fallen.*

### V2 — Zeit läuft von selbst

Kein „Runde beenden"-Knopf; Pause ist erlaubt. Der Takt in Echtzeit bleibt konstant
(grob ein Tick pro Sekunde), aber **was ein Tick bedeutet, dehnt sich mit der Epoche**
— anfangs ein Jahrzehnt, später ein Jahr, am Ende ein Quartal. Das ist die
realistische Variante, nicht die bequeme: Politikverzögerungen *sind* in einer
neolithischen Siedlung Jahrzehnte und in einer modernen Volkswirtschaft Monate.

Direkte Folge, die eingehalten werden muss: **In jeder laufenden Wartezeit muss es
etwas zu entscheiden geben.** Sonst wird Zuschauen zum Spiel.

*Grundgerüst unstrittig, Details offen (siehe Beschleunigung).*

---

## Offen

Aufgeworfen, noch nicht besprochen — grob in der Reihenfolge, in der es drankommt:

- **Beschleunigung (2×, 5×).** Spricht dafür: Spieler wollen viel Fortschritt pro
  Echtzeit, und Beschleunigung kostet sie Spielzeit — ein Tausch, kein Cheat.
  Spricht dagegen: entwertet die Trägheit, die Weitsicht lehren soll. Jederzeit
  änderbar, deshalb zurückgestellt.
- **Volkswirtschaftliche Kennzahlen.** Welche sind je Entwicklungsstufe sinnvoll?
  Ändert sich vermutlich mit dem Fortschritt.
- **Prognose.** Der Spieler braucht Vorausschau, um bei **trägen** Sektoren
  rechtzeitig zu handeln — er muss sehen können, dass Wohnraum knapp *werden wird*.
- **Fünftes Sektormerkmal „Dringlichkeit"** — verhungert man ohne, oder ist es nur
  unangenehm? Erst nötig, wenn Unterdeckung Folgen haben soll.
- **Fortschrittsstruktur.** Wie werden Institutionen und Verfahren freigeschaltet?
- **Geldeinführung.** Der wichtigste Moment des Spiels.
- **Auslastung und Inflation.**
- **Ungleichheit.** Braucht einen echten *wirtschaftlichen* Effekt (höhere Sparquote
  oben → Nachfrageausfall), nicht nur eine Anzeige.
- **Banken und Kredit.**
- **Außenhandel und Währung.**
- **Politikfelder.**
- **Oberfläche.**
- **Ob und wie das Spiel endet.**
- **Technik**: Projektaufbau, Konfigurationsformat, Teststrategie für die
  Identitäten, Balancing.

---

## Verworfen

- **Wohlstandsjahre** (monoton steigende Leitzahl aus Bevölkerung × Deckung). Die
  Zeit läuft ohnehin hoch, und Siedlungsgröße ist die ehrlichere Erfolgszahl.
- **Fluss vs. Bestand als eigenes Sektormerkmal.** Ein Haus ist einfach langsamer
  Verfall plus hohe Trägheit.
- **Elastizität als Sektormerkmal.** Fachlich falsch als Konstante; entsteht jetzt aus
  den Verfahren (E5).
- **„Zwingend vs. ersetzbar" als Attribut an der Kante Sektor↔Input.** Kein
  Ja/Nein — der Effekt entsteht aus der Rückfallebene (E5).
- **„Nur Arbeit ist knapp".** Wäre Arbeitswertlehre und würde die Malthus-Dynamik
  mechanisch unmöglich machen.

---

## Wissenschaftliche Anker

Jede Mechanik braucht eine Entsprechung in der Lehre. Stand jetzt:

| Mechanik | Anker |
|---|---|
| Zweischichtigkeit, Identitäten | Godley/Lavoie, stock-flow-konsistente Modellierung |
| Verfahren mit Rückfallebene | Aktivitätsanalyse (Koopmans); Sraffa, von Neumann |
| Vorleistungen, Lieferketten | Input-Output-Analyse (Leontief); VGR |
| Extensiv vs. intensiv, beste Fläche zuerst | Ricardo, Differentialrente |
| Sättigung, Strukturwandel | Engelsches Gesetz; Pasinetti |
| Trägheit | Time-to-build (Kydland/Prescott); Investitionsverzögerung bei Kalecki |
| Verfall | Abschreibung; Dienstleistungen als nicht lagerfähig |
| Bevölkerung | Malthus; Unified Growth Theory (Galor/Weil) |
| Geldschöpfung durch Kredit (später) | Bank of England, Quarterly Bulletin 2014 |
| Steuern treiben die Währung (später) | Knapp, Lerner, Wray, Ehnts |

---

## Begriffe

- **Deckung** = Produktion ÷ Bedarf. *Kommt bei den Menschen genug an?*
- **Auslastung** = wie stark die **Kapazitätsinputs** belegt sind. *Ginge mehr, wenn
  mehr nachgefragt würde?* Nie über 100 % (E5).
- **Verfahren** = eine Produktionsweise eines Sektors, mit eigenen Inputs und eigener
  Produktivität.
- **Vorleistung** = Input, der in der Produktion verbraucht wird.
- **Kapazität** = Input, der belegt und wieder frei wird.

Deckung und Auslastung können unabhängig voneinander hoch oder niedrig sein. Genau
dieser Unterschied entscheidet später, ob zusätzliche Nachfrage in **Menge** oder in
**Preise** geht.
