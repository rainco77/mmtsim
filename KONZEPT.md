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

| Verfahren | Inputs | Ertrag je Arbeitseinheit |
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

**Leitregel für den Zustand: so wenig gespeichert wie möglich, alles Übrige jeden Tick
abgeleitet.** Neue Zustandsgrößen entstehen erst in dem Moment, in dem eine Mechanik
sie tatsächlich braucht — Altersstruktur mit Bildung und Rente, Qualifikation sobald
ein Verfahren sie als Input verlangt, Schichten sobald es Geld und damit Sparquoten
gibt.

### E8 — Keine Zufriedenheit; Unterdeckung wirkt konkret

Es gibt **keine Zufriedenheits- oder Stimmungsgröße**, weder jetzt noch später. Drei
Gründe:

- Sie ist keine volkswirtschaftliche Größe. Ein Stimmungsbalken, der die Wirtschaft
  antreibt, ist genau das, was fachlich sofort angestrichen wird.
- Wir haben sie bereits: **Deckung ist das Wohlfahrtsmaß** — was die Menschen
  brauchen, verglichen mit dem, was sie bekommen. Eine zweite Zahl daneben wäre eine
  Verdopplung mit unklarem Verhältnis zur ersten.
- Sie würde E15 unterlaufen. Eine Zufriedenheitszahl ist eine Benotung durch die
  Hintertür, deren Formel wir festlegen müssten — also unsere Politik.

Stattdessen wirkt Unterdeckung **konkret auf reale Größen** — Sterberate,
Geburtenrate, Arbeitsfähigkeit, Produktivität, verfügbare Verfahren. Wo genau, hängt an der
Bedarfsstufe, nicht am Sektor als Ganzem (→ E9).

### E9 — Bedarf ist gestuft und rangiert über alle Sektoren

Bedarf ist nicht „Anzahl × fester Wert pro Kopf" — das widerspräche der Sättigung
(E3) und machte Strukturwandel unmöglich. Stattdessen gibt es **eine Rangliste von
Bedarfsstufen über alle Sektoren hinweg**:

| Rang | Stufe | Menge pro Kopf |
|---|---|---|
| 1 | Nahrung — überleben | 1,0 |
| 2 | Wohnraum — Dach über dem Kopf | 0,3 |
| 3 | Nahrung — satt werden | 0,8 |
| 4 | Wohnraum — eigener Raum | 0,5 |
| … | … | … |

**Gedeckt wird von unten nach oben.** Solange Rang 1 nicht voll ist, bringt Produktion
auf Rang 3 nichts. Überschuss oberhalb der aktuellen Stufe geht in den Speicher, aber
nicht in Wohlstand.

**Grundregel: Jede Stufe zahlt in eine reale Größe zurück. Eine Stufe, die in nichts
zurückzahlt, existiert nicht als Stufe.** Für den Spielanfang:

| Rang | Bewirkt |
|---|---|
| 1 — Nahrung, überleben | Unterdeckung → Sterberate steigt. Bei 100 % ist die Bevölkerung stabil, mehr nicht. |
| 2 — Dach | Senkt Sterberate weiter, hebt Geburtenrate |
| 3 — Nahrung, satt | Hebt Geburtenrate **und Produktivität** |

Der **halbe Erfolg** von Rang 3 trägt die gesamte Frühphase: Die höhere Geburtenrate
frisst sich selbst auf (mehr Menschen auf gleicher Fläche → sinkender Ertrag pro Kopf
→ zurück Richtung Rang 1, das ist Malthus). Die höhere **Produktivität ist dagegen
pro Kopf** und wird vom Bevölkerungswachstum *nicht* aufgefressen — ein dauerhafter
realer Gewinn. Der Spieler erlebt: „Ich stehe wieder auf Kante, aber irgendwas ist
trotzdem besser geworden." Genau dieser halbe Erfolg treibt ihn zur Produktivität.

Die Produktivität ist **kein neuer Zustand**, sondern jeden Tick aus der Deckung
abgeleitet (konform zur Leitregel in E7).

Weitere Folgen:

- **Sättigung wird konkret**: Die Nahrungsstufen hören bei Rang 3 auf, darüber kommt
  nichts mehr. Gesundheit und Bildung haben Stufen bis weit nach oben.
- **Strukturwandel entsteht von allein**: Sind die Nahrungsstufen abgehakt, hat
  zusätzliche Arbeit in der Landwirtschaft keinen Wert mehr. Muss nicht gescriptet
  werden (→ E6).
- **Der Spieler weiß immer, was als Nächstes dran ist.** Die Rangliste ist der
  Fortschrittsbalken der unteren Schicht — „Rang 4 von 6 gedeckt" versteht man sofort
  und es benotet nichts.
- **Ungleichheit wird später anschaulich**: Sobald es Schichten gibt, sitzen sie auf
  *verschiedenen Rängen* — die einen bei Rang 9, die anderen bei Rang 2. Weit
  greifbarer als ein Gini-Wert.
- **Der Kultursektor braucht damit eine Begründung**: Können wir nicht sagen, worin er
  real zurückzahlt, kommt er nicht ins Spiel.

Anker: **Pasinettis** hierarchische Bedürfnisstruktur mit Sättigung — der
Standardweg, Strukturwandel endogen zu erzeugen; vorher **Georgescu-Roegen**
(Hierarchie der Bedürfnisse, 1954). Ausdrücklich *nicht* Maslow: die Ordnung ist
ökonomisch begründet, nicht psychologisch. Die Wirkung von Ernährung auf
Produktivität: ernährungsbasierte Effizienzlohntheorie (Leibenstein; Dasgupta/Ray)
und **Fogel** (Nobelpreis) zu Ernährung und Wachstum.

**Zu Spielbeginn gibt es genau zwei Ränge**: überleben und ein Dach.

### E10 — Arbeit fließt in genau zwei Dinge

| | Kostet | Ergebnis |
|---|---|---|
| **Sektorbetrieb** | jeden Tick | Deckung einer Bedarfsstufe (E9) — teilt sich **selbst** zu, von unten nach oben durch die Ränge |
| **Projekt** | einmalig | Kapazität oder Wissen |

Mehr Typen gibt es nicht. Insbesondere sind **Politikfelder kein eigener Typ**:
Bildung ist ein Sektor mit Kapazität (Schulgebäude), Verfahren, Inputs und einer
Bedarfsstufe. Was dort jeden Tick Arbeit kostet, sind die Lehrer — laufender
Sektorbetrieb, genau wie Bauern in der Landwirtschaft. Grundschule → weiterführende
Schule → Universität sind Projekte, die Kapazität erzeugen, und irgendwann braucht man
viele Universitäten, genau wie viele Mühlen. „Politikfeld" ist kein Mechanismus,
sondern nur ein **Name für einen Sektor, dessen Leistung öffentlich bereitgestellt
wird**.

**Ein Projekt ist Arbeit rein, Ergebnis raus.** Genaueres Schema in E13.

Die Trennlinie zwischen beidem ist **Konsumgut vs. Produktionsmittel**: Eine Hütte
deckt einen Bedarfsrang, also ist sie Sektorproduktion und teilt sich selbst zu. Eine
Mühle ist Input für einen Sektor, also ist sie ein Projekt. Das trägt bis ans Ende —
Wohnungen bleiben immer Sektorproduktion, auch als Plattenbau.

**Der Forschungsbaum ist nichts Eigenes**, sondern schlicht die Liste der verfügbaren
Projekte. Ein Wissensprojekt schaltet weitere Projekte frei.

**Alle knappen Inputs werden nach derselben Regel zugeteilt** wie Arbeit: von unten
nach oben durch die Rangliste (E9). Reicht Land nicht für Rang 1 *und* Rang 2, bekommt
es Nahrung. Eine Regel für Arbeit, Land und später Energie — kein Sonderfall.

**Die reale Decke:** Arbeit lässt sich nur bis zu dem Punkt aus der Bedarfsdeckung
abziehen, an dem sie unter Rang 1 fällt — dann sterben Menschen oder wandern ab. Die
Grenze ist keine Spielregel, sie fällt aus dem Modell. Ungenutzte Arbeit **verfällt
sichtbar** und ist nicht nachholbar:

> *8 Arbeitseinheiten ungenutzt verfallen.*

Das ist die Arbeitslosigkeits-Intuition, lange bevor das Wort fällt. Anker: Konsum-
Investitions-Abwägung und Produktionsmöglichkeitenkurve; der Verfall ungenutzter
Arbeit ist der post-keynesianische Punkt, dass nicht produzierter Output dauerhaft
verloren ist.

**Große Sprünge in der Ressourcenbasis** kommen nicht aus einer Sonderregel für Land,
sondern daraus, dass **manche Projekte Institutionen sind** (E1) — Nationalstaats-
gründung, Kolonisierung der Galaxis. Regimewechsel, die *unter anderem* die extensive
Grenze aufreißen. Nur eine Größenordnung, kein neuer Mechanismus. Ehrlich bleibt es,
weil solche Sprünge reale Kosten haben (Arbeit, Menschenleben) und, sobald es Nachbarn
gibt, deren Grenze enger machen. Expansion wird als reale Option mit realem Preis
gezeigt, nicht empfohlen.

*Verworfen auf dem Weg dorthin: die Unterscheidung Gemeinschaftsarbeit vs. Fron. Sie
hatte keine mechanische Wirkung — beides ist „der Spieler weist Projekten Arbeit zu".
Wie es heißt, darf sich mit der Epoche ändern; das ist Erzählung und kostenlos. Nur
ein Übergang zählt: von Befehl zu Kauf (E11).*

### E11 — Eigentum entsteht erst mit dem Geld

**Solange es kein Geld gibt, gibt es keine Eigentumsfrage.** Die Siedlung rodet, die
Fläche gehört der Siedlung. Ohne Tausch ist Eigentum keine sinnvolle Kategorie — der
Anfang bleibt damit simpel.

**Sobald Geld existiert, wird Eigentum pro Sektor zur Entscheidung.** Bei privatem
Eigentum baut der Spieler nicht mehr selbst; die Menschen bauen Mühlen, wenn es sich
lohnt.

**Privatisierung ist damit Automatisierung.** In einem Incremental ist die Belohnung
für gemeisterte Mechanik immer, dass sie sich fortan selbst erledigt — und hier ist
genau das buchstäblich Privatisierung. Spielspaß und ökonomische Korrektheit zeigen
in dieselbe Richtung.

Der Tausch ist echt und neutral:

| | Öffentlich | Privat |
|---|---|---|
| Baut | wenn der Spieler entscheidet | wenn es sich lohnt |
| Tempo | langsam, aber steuerbar | schnell und selbsttätig |
| In der Flaute | kann gegensteuern | **versiegt genau dann, wenn es gebraucht wird** |
| Ertrag | an alle | an die Eigentümer |

Keine moralische Wahl, sondern Reaktionsgeschwindigkeit gegen Krisenanfälligkeit.
Details gehören zur Geld- und Ungleichheitsdiskussion.

### E12 — Projektschema

Alles daran ist Konfiguration, nichts ist Code.

**Bedingungen, in zwei Stufen.** Freischaltung ist nur ein Sonderfall der
Vorbedingung, aber es gibt zwei Sätze davon:

- **Sichtbar ab** — das Projekt erscheint, grau, mit Namen. Wirkung noch unbekannt.
- **Machbar ab** — es lässt sich starten.

Bedingungen sind immer Zustandsabfragen desselben Typs: *Projekt X fertig*,
*Bevölkerung ≥ 200*, *Rang 3 gedeckt*, *Kapazität Mühle ≥ 4*.

**Kosten.** Anfangs nur Arbeit, später zusätzlich Vorleistungen (E4).

**Wirkung.** Vier Typen, ein Projekt kann mehrere haben — und **Wirkungen dürfen
negativ sein**. Eine Flächenumwandlung (E13) ist damit schlicht ein Paar aus einer
negativen und einer positiven Kapazitätswirkung; ein fünfter Typ ist dafür nicht nötig.

| Typ | Beispiel | Häufigkeit |
|---|---|---|
| **+ Kapazität** | Hütten, Mühle, Universität | ständig |
| **+ Verfahren** | Fruchtwechsel, Pflug (E5) | häufig |
| **+ Sektor** | Bildung existiert jetzt, mit eigenen Bedarfsrängen | selten |
| **+ Regel** | Geld existiert · Sektoren sind privatisierbar · neuer Hebel | **sehr selten** |

Der letzte Typ ist die Institution aus E1 — der, der die Oberfläche verändert. Die
Geldeinführung ist ein Projekt mit *Regel*-Wirkung, das anschließend Privatisierung
(E11) als weitere Regel freischaltet. Die Häufigkeitsspalte ist der Taktgeber:
**Kapazität als Grundrauschen, Verfahren als regelmäßiges Futter, Regeln als seltene
laute Momente.**

**Zwei Anzeigepflichten:**

- Bei sichtbaren, nicht machbaren Projekten steht **immer die fehlende Voraussetzung**
  da — nicht „gesperrt", sondern *„braucht: Bevölkerung ≥ 60 (aktuell 41)"*.
- Jedes Projekt zeigt, **was es aufschließt**. Damit entsteht der Horizont lokal und
  ständig, statt aus einem einzelnen fernen Versprechen.

### E13 — Fläche

**Fläche hat Typen.** Ein Sektor verlangt einen bestimmten Typ als Kapazitätsinput (E4):

| Typ | Wer ihn braucht |
|---|---|
| **Wildnis** | Holz |
| **Erschlossene Fläche** | Nahrung **und** Wohnraum |

Nahrung und Wohnraum konkurrieren also um **dieselbe** Fläche — der interessante Teil,
und historisch richtig: Man baut auf Land, das man auch beackern könnte. Damit gibt es
am Anfang trotz nur zweier Typen sofort die dreifache Konkurrenz: Nahrung gegen
Wohnraum um die erschlossene Fläche, beide gegen Holz um die Wildnis.

Die Aufspaltung in **Ackerland und Bauland** kommt erst, wenn sie etwas trägt — etwa
wenn Städte entstehen. Bis dahin wäre sie eine Unterscheidung ohne Unterschied.

Wohnraum **belegt** seine Fläche, solange es steht, und gibt sie beim Verfall wieder
frei — Kapazität nach E4, kein Verbrauch.

**Projekte wandeln Typen um.** Es gibt nur eine Art Flächenprojekt:

| Projekt | Wandelt |
|---|---|
| **Rodung** | Wildnis → erschlossene Fläche, dazu einmalig Holz |
| **Landnahme** | unerschlossen → Wildnis |
| später **Aufforstung** | erschlossene Fläche → Wildnis |
| später **Bebauung** | Ackerland → Bauland |

**Das erreichbare Gebiet ist gedeckelt.**

```
erreichbar   ████████████████░░░░░░░░   ← Deckel der Epoche
erschlossen  ████████░░░░░░░░
  Wildnis          ██████
  erschl. Fläche   ██
```

Landnahme läuft nur bis zum Deckel. Darüber hinaus geht es nur mit einer
**Institution** — einem Projekt mit Regel-Wirkung nach E12:

| Institution | Hebt den Deckel auf |
|---|---|
| Stammesverband | die Region |
| Nationalstaatsgründung | das Territorium |
| Raumfahrt | das Sonnensystem |
| Interstellare Fahrt | die Galaxis |

Damit sind die großen Sprünge aus E10 kein Sonderfall mehr, sondern haben einen
Mechanismus. **Das erreichbare Gebiet wird nicht gespeichert** — es ergibt sich aus
Grundgebiet plus den erledigten Institutionsprojekten. Wie gut die Fläche einer neuen
Stufe ist, gehört zum Deckel und ist Inhalt; eine Stufe kann besseres oder schlechteres
Land bringen.

**Zwei Bremsen, eine weiche und eine harte:**

**Weich — die Güte fällt.** Das Beste wird zuerst genommen. Jede Landnahme bringt
Fläche, die einen festen Prozentsatz schlechter ist als die vorige.

| Landnahme | Güte |
|---|---|
| Startgebiet | 1,00 |
| 1. | 0,95 |
| 5. | 0,77 |
| 10. | 0,60 |
| 20. | 0,36 |

*(Platzhalterzahlen, Balancing später.)* Güte statt steigender Kosten aus drei Gründen:
Es ist **Ricardo im Original** (Differentialrente handelt von Qualität, nicht von
Erschließungskosten). Es erzeugt die richtige Dynamik — bei steigenden Kosten würde man
einfach länger sparen, bei fallender Güte wird Expansion allmählich sinnlos und
Intensivierung gewinnt durch Vergleich (E6). Und es zahlt später doppelt: Sobald es
Geld gibt, werden Güteunterschiede zu Einkommensunterschieden — die Grundrente.

**Hart — der Deckel.** Irgendwann geht gar nichts mehr, und dann bleibt nur
Intensivierung oder eine neue Institution. Die weiche Bremse macht die Entscheidung
interessant, die harte macht sie alternativlos. Zusammen erzeugen sie den Kipppunkt aus
E6 verlässlich, statt darauf zu hoffen.

**Güte wirkt über die Sektoren, nicht über die Fläche.** Ein Hektar ist für Wohnraum
ein Hektar; Bodenqualität beeinflusst den **Ertrag**, und Wohnraum hat keinen. Also
erklärt jeder Sektor, wie stark die Güte in seinen Ertrag eingeht:

| Sektor | Güte wirkt |
|---|---|
| Nahrung | stark |
| Holz | mittel |
| Wohnraum | gar nicht |

Das ist eine Zahl in der Sektorkonfiguration (T3) und ökonomisch das Richtige: Ricardos
Differentialrente handelt von **Ertragsunterschieden**, nicht von einer allgemeinen
Landgüte. Die Güte selbst hängt am **Flächentyp**; werden Typen später gesplittet,
bekommt jeder seine eigene Kurve.

**Die Grenzgüte steht vor dem Klick da, nicht danach:**

> **Landnahme** — 60 Arbeit
> +20 ha Wildnis, Güte **0,77** *(dein Durchschnitt: 0,94)*

Der Spieler sieht den abnehmenden Ertrag **am Rand**, bevor er ihn bezahlt — gute
Bedienung und zugleich das ökonomische Konzept: Entscheidungen fallen am Rand, nicht im
Durchschnitt.

**Benannte Vereinfachung:** Dass Wohnraum **guten Ackerboden** verbraucht, bilden wir
nicht ab — Bauen nimmt Fläche durchschnittlicher Güte, weil wir nicht mitschreiben,
welche Parzelle wer nutzt. Der Verlust an gutem Boden ist damit unterschätzt. Auflösbar,
sobald Ackerland und Bauland getrennte Typen mit eigenen Güten sind; das braucht keine
Buchführung über einzelne Parzellen, nur einen zweiten Typ.

### E14 — Startaufstellung

**Drei Sektoren**: Nahrung, Wohnraum, Holz. Alle teilen sich selbst zu (E10). Wohnraum
braucht **Holz als Vorleistung**, also zieht das System von allein Arbeit in die
Holzwirtschaft, wenn Rang 2 unterdeckt ist — der Spieler erlebt eine Lieferkette, ohne
eine zu bedienen. *Vorleistungen gibt es zunächst nur für Wohnraum und für Projekte,
nicht flächendeckend; Nahrung braucht weiterhin nur Land und Arbeit.*

**Roden und Holz gewinnen sind zwei Dinge.** Rodung vernichtet Wildnis dauerhaft
(E13); die **Holzwirtschaft** (Sektor) gewinnt laufend Holz aus stehender Wildnis, ohne
sie zu verbrauchen. Zum Start gibt es genau **einen** Wirkungspfad auf den
Wildnisbestand — nur Rodung verkleinert ihn. Übernutzung, Aufforstung und Nachwuchsraten
kommen später. Daraus entsteht die erste sichtbare Zielkonkurrenz, und der Spieler sieht
seine Entscheidung in der Welt statt nur in Zahlen.

**Drei Projektstränge**, deren erster Schritt jeweils sofort machbar ist, alle ohne
Geld begehbar:

| Nahrung | Wohnraum | Holz |
|---|---|---|
| Fruchtwechsel | Fachwerk | Bessere Äxte |
| ↳ Pflug *(braucht Holz)* | ↳ Ziegel *(neuer Sektor Lehm)* | ↳ Forstwirtschaft |
| ↳ Wassermühle *(+ Mühle bauen)* | | |

Dazu **Rodung** und **Landnahme** als dauerhaft wiederholbare Projekte (E13).

Leitsatz für die Dosierung: **Projekte sind der Spaß, Sektoren sind die Leserei.** Ein
Projekt mehr ist eine Entscheidung mehr; ein Sektor mehr ist eine Tabellenzeile mehr,
die verstanden werden muss, bevor irgendetwas entschieden werden darf. Also viele
kleinteilige Projekte von Anfang an, drei Sektoren am Anfang, weitere langsam.

Der Reiz der ersten halben Stunde entsteht daraus, dass **der Engpass wandert**: Erst
fehlt Nahrung → roden. Dann fehlt Wohnraum → mehr Holz. Dann fehlt Wald, weil zu viel
gerodet wurde → Forstwirtschaft oder Ziegel. Dann fehlt Ackerland, weil der Wald
geschont wird → Fruchtwechsel statt Rodung. Das ist E6 in klein, viermal, jedes Mal
mit einer anderen Antwort.

*Wackelkandidat:* **Ziegel** bringt einen vierten Sektor sehr früh. Bleibt vorerst
drin, aber als Erstes wieder heraus, falls der Anfang zäh wirkt.

### E15 — Keine Benotung

Es gibt am Ende kein Urteil und keine Punktzahl über die Spielweise. Kennzahlen
beschreiben, sie bewerten nicht. Sobald das Spiel Gleichheit oder Preisstabilität
benotet, benotet es Politik und die Neutralität ist verloren.

### E16 — Arbeit: drei Faktoren, zwei abgeleitete Größen

```
Köpfe  ×  Arbeitsfähigkeit   =  Arbeitsvolumen
Arbeitsvolumen  ×  Produktivität  =  Arbeitsleistung
```

Gespeichert werden nur die **drei Faktoren**, die beiden Produkte sind abgeleitet.

| Faktor | Was er ist | Getrieben von |
|---|---|---|
| **Köpfe** | wer für Arbeit zur Verfügung steht — nicht einfach alle Menschen | Demographie; nach E7 am Anfang alle, mit der Altersstruktur später getrennt |
| **Arbeitsfähigkeit** | Faktor 0–1: welcher Anteil einer Person für Arbeit zur Verfügung steht | Gesundheit, später Arbeitszeitregelungen |
| **Produktivität** | wie viel eine Zeiteinheit hervorbringt | Ernährung, Gesundheit, Bildung, Wissen |

**Arbeitsleistung ist die Größe, die zugeteilt wird und in der alle Kosten stehen.**

**Projektkosten sind fest, in Arbeitsleistung.** Sie ändern sich nie. Was sich ändert,
ist die Angebotsseite: Eine gebildetere, gesündere Bevölkerung stellt aus derselben
Kopfzahl mehr Arbeitsleistung bereit. Dieselbe Mühle ist dadurch schneller fertig —
nicht, weil sie weniger kostet, sondern weil mehr geleistet wird.

**Produktivität und Verfahren sind zwei verschiedene Dinge und beißen sich nicht:**

| | Wirkt auf | Beispiel |
|---|---|---|
| **Produktivität** | die Arbeitsleistung insgesamt, überall | Bildung, Gesundheit, Ernährung |
| **Verfahren** (E5) | den Ertrag je Arbeitsleistung **in einem Sektor** | Fruchtwechsel, bessere Äxte, Wassermühle |

Bessere Äxte machen Holz schneller verfügbar — sie senken **nicht** die Holzkosten
einer Mühle. Das eine ist Humankapital, das andere Technik; sie multiplizieren sich.

Die Trennung der drei Faktoren kostet nichts (die Produkte sind abgeleitet) und ist
nötig, weil sie später auseinanderlaufen: **Arbeitsproduktivität** ist definiert als
Ergebnis je Arbeitsvolumen und wäre bei verschmolzenen Zahlen nicht mehr berechenbar;
und Arbeitszeitverkürzung senkt das Volumen, ohne die Produktivität anzutasten. Es
sind auch in der amtlichen Statistik getrennte Größen.

In der Oberfläche ist **Arbeitsleistung** die Arbeitszahl; die drei Faktoren stehen als
ihre Quellen darunter. Der Spieler sieht damit, dass *mehr Leute*, *länger arbeiten*
und *besser arbeiten* drei verschiedene Wege sind.

### E17 — Die Tickdauer wird nicht festgelegt

Es wird nirgends behauptet, welchen realen Zeitraum ein Tick abbildet. Es werden nur
Ticks gezählt.

Das löst ein Problem, das sonst unlösbar bleibt: Eine einzige Tickdauer kann nicht
gleichzeitig zu einer neolithischen Siedlung und zu einem modernen Staat passen. Was
die Ökonomie trägt, sind ohnehin die **Verhältnisse** — dass Wohnraum vielfach länger
braucht als eine Ernte.

Der Preis: Ohne Anker lässt sich nicht behaupten, dass Bevölkerungs- oder Bauraten
realistischen Werten entsprechen. Sie werden nach Gefühl und nach ihrem Verhältnis
zueinander austariert. Die Aussagen des Spiels hängen an Zusammenhängen, nicht an
Jahreszahlen.

### E18 — Projekte in Arbeit

**Kosten sind ein Bündel beliebiger Ressourcen**, nicht nur Arbeitsleistung.

**Ein Projekt hat eine Mindestdauer in Ticks.** Je Tick braucht es *Kosten geteilt
durch diese Tickzahl* von **jeder** Ressource. Fehlt eine davon, **pausiert es und
verbraucht gar nichts** — die Arbeit, die es dadurch nicht abnimmt, fließt nach E16
weiter zum nächsten.

Damit ist der Fortschritt eine einzige Prozentzahl, alle Ressourcen laufen im
Gleichschritt, und ein blockiertes Projekt frisst nichts. Ein Projekt kann **länger**
dauern als seine Mindestdauer, nie kürzer.

Die Mindestdauer ist unmittelbar die **Trägheit aus E3**: Sie verhindert, dass ein
Vorhaben durch Aufwerfen aller Hände in einem Tick durchgedrückt wird. Neun Frauen
bekommen kein Kind in einem Monat.

**Reihenfolge:** Der Startzeitpunkt bestimmt sie voreingestellt — ältere zuerst —, der
Spieler kann umsortieren. Das Modell ist ohnehin eine geordnete Liste; woher die
Ordnung kommt, ist Sache der Oberfläche.

**Pause:** Ein pausiertes Projekt bekommt nichts und behält seinen Fortschritt. Kein
Verfall. Der Anreiz, sich nicht zu verzetteln, besteht ohnehin — ein halbfertiges
Projekt liefert nichts.

Im Zustand je laufendem Projekt: **Fortschritt, Position in der Reihenfolge, pausiert
ja/nein.**

### E19 — Verfall und die drei Eigenschaften eines Bestands

**Verfall ist geometrisch: ein fester Anteil je Tick.** Ein Bestand von 100 mit 2 %
wird zu 98, dann zu 96,04 — er nähert sich der Null, erreicht sie aber nie von allein.
Das ist die **geometrische Abschreibung**, mit der statistische Ämter den Kapitalstock
fortschreiben (Perpetual-Inventory-Methode). Lineare Abschreibung wäre für einen
laufend nachgefüllten Bestand unnatürlich, weil sie einen Endzeitpunkt braucht.

**Die Rate gehört zu jedem Bestand, und null ist erlaubt** — dann braucht es keine
Sonderfälle:

| Bestand | Rate |
|---|---|
| Dienstleistungen (Pflege) | 100 % je Tick — gar nicht lagerfähig |
| Nahrung im Speicher | mittel, sie verdirbt |
| Mühlen, Gebäude | langsam |
| Wohnraum | sehr langsam |
| **Fläche** | **null** |

Wissen taucht nicht auf: Es ist kein Bestand, sondern eine Menge freigeschalteter
Dinge (E10).

**Verfall ist der erste Schritt im Tick.** Erst zerfällt, was zerfällt, dann wird mit
dem gerechnet, was übrig ist — die übliche Reihenfolge der Bestandsrechnung:
Anfangsbestand, Abgang, Zugänge.

**Bestände sind kontinuierlich**, keine Stückzahlen. „3,7 Mühlen" ist intern richtig
und wird gerundet angezeigt. So wird auch der Kapitalstock gemessen: als Größe, nicht
als Stückliste. Andernfalls bräuchte jedes Gebäude ein eigenes Alter.

**Instandhaltung gibt es nicht als eigenen Mechanismus.** Erhalt ist Neubau dessen, was
zerfallen ist. Bei Konsumgütern läuft das von allein — Wohnraum verfällt, die Deckung
sinkt, die Zuteilung schiebt wieder Arbeit hinein. Bei Kapazität startet der Spieler
ein Projekt neu. Ob sich das nach Aufmerksamkeit oder nach Fleißarbeit anfühlt, hängt
allein an den Raten und ist Balancing, nicht Mechanik.

**Ein Bestand hat drei Eigenschaften, die sich frei kombinieren:**

| Eigenschaft | Gilt für | Beispiel |
|---|---|---|
| **Verfall** | jeden Bestand | Mühle 2 %, Fläche 0 % |
| **Zuflussart** | woher der Zuwachs kommt | aus Produktion — oder **proportional zum eigenen Bestand** |
| **Kohorten** | optional, unabhängig von beidem | Altersgruppen, Baujahrgänge |

Die zweite Art unterscheidet **biologische Bestände**: Eine Mühle baut keine Mühlen,
Menschen bekommen Kinder.

```
gewöhnlicher Bestand:   neu = Produktion       − Verfall × Bestand
biologischer Bestand:   neu = Zuwachs × Bestand − Verfall × Bestand
```

Das ist kein Sonderfall der Bevölkerung, sondern eine Klasse: **Wald** (Nachwuchs
proportional zum stehenden Wald, in E14 auf später verschoben) und **Zugtiere** (Input
des Pfluggespanns in E5) teilen sie.

Kohorten sind davon unabhängig und passen auf Menschen, Wälder **und Gebäude** —
Gebäude verschiedenen Alters sind unterschiedlich gut, in der Volkswirtschaft
**Jahrgangskapital**. Eingeführt werden sie nur dort, wo sie etwas tragen.

**Die Regeln sind gemeinsam; Aufbau des Zustands und Darstellung sind davon
unabhängig.** Nach T1 kennt die Simulation die Oberfläche ohnehin nicht: Die
Bevölkerung darf groß und mit eigener Warnzone oben stehen, während Mühlen in einer
Tabellenzeile stehen. Zentralität ist keine Modelleigenschaft. Ob die Bevölkerung im
Zustand ein eigenes benanntes Feld bekommt, ändert an der Rechnung nichts und wird beim
Bau entschieden.

### E20 — Wie Bevölkerungswachstum rechnet

**Zwei Raten**, je Tick und je Kopf: **Geburtenrate** und **Sterberate**. Ihre Differenz
verändert die Kopfzahl. Beide sind die allgemeinen Größen aus E19, auf Menschen
angewandt — die Sterberate *ist* der Verfall, die Geburtenrate *ist* der
bestandsproportionale Zufluss. Auch die Mindestgröße gilt allgemein: Ein zu kleiner
Restwald erholt sich ebenso wenig wie eine zu kleine Herde.

**Jede Bedarfsstufe verschiebt eine der beiden Raten.** Sie erklärt in der
Konfiguration, welche Rate sie betrifft und wie stark — bei voller Deckung gegenüber
gar keiner. Dazwischen wird linear verrechnet. Für den Anfang ergibt sich aus E9:

| Stufe | Verschiebt |
|---|---|
| 1 — Nahrung, überleben | Sterberate: bei Unterdeckung stark nach oben |
| 2 — Dach | Sterberate leicht nach unten, Geburtenrate nach oben |
| 3 — Nahrung, satt | Geburtenrate nach oben |

**Linear reicht**, weil die nötige Nichtlinearität schon in der **Rangstruktur** steckt:
Ein unterdeckter Rang 1 bedeutet Hunger, und das ist ein anderes Regime als „Rang 3
fehlt". Die Ränge zerteilen den Raum bereits, also braucht es innerhalb einer Stufe
keine Kurve. Das hält die Konfiguration bei zwei Zahlen je Stufe.

**Der Gleichgewichtspunkt:** Rang 1 voll gedeckt und sonst nichts → Geburten = Tode,
die Bevölkerung steht. Das legt zugleich die Grundwerte beider Raten fest — sie sind in
diesem Zustand gleich groß. Damit ist der Malthus-Punkt aus E7 exakt definiert statt
Gefühlssache.

**Die Bevölkerung wird intern als Bruchzahl geführt** und gerundet angezeigt. Bei
dreißig Menschen und kleinen Raten wäre eine ganzzahlige Rechnung sonst über viele
Ticks bewegungslos und würde dann springen.

**Scheitern an einer Schwelle, nicht bei null.** Fällt die Bevölkerung unter eine
Mindestgröße, gilt die Siedlung als aufgegeben und der Lauf ist zu Ende.

Das ist kein Zugeständnis an die Spielbarkeit, sondern fachlich das Richtigere: Eine
Gemeinschaft unterhalb einer bestimmten Größe ist nicht überlebensfähig — keine
Arbeitsteilung, kein Puffer gegen ein schlechtes Jahr, kein Ersatz für Ausfälle.
**Mindestlebensfähige Größe** ist ein etablierter Begriff, und historisch wurden zu
klein gewordene Siedlungen aufgegeben oder gingen in anderen auf. Bis auf den letzten
Menschen zu rechnen wäre die unrealistischere Variante.

Zugleich verhindert es, dass der Spieler auf einer winzigen Zahl festhängt, wo
prozentuales Wachstum quälend langsam ist. **Die Schwelle muss sichtbar sein** — als
Zone, auf die man zuläuft, nicht als Überraschung.

Was nach dem Scheitern passiert, hängt an der offenen Frage, ob und wie das Spiel
endet.

**Kohorten später:** Das Modell ist der Ein-Kohorten-Fall eines allgemeinen
Kohortenmodells, nicht eine Zahl mit Sonderregeln. Die Erweiterung besteht darin, dass
aus der Zahl ein Vektor wird, die Raten je Gruppe gelten und ein Alterungsschritt
dazukommt. Möglich ist das, weil die Raten **aus Regeln über der Deckung berechnet**
werden (T3) statt fest im Code zu stehen: Aus „Rang 1 unterdeckt → Sterberate hoch"
wird „→ Sterberate der Kleinkinder sehr stark, der Erwachsenen mäßig". Geschlechter
sind derselbe Fall — eine Kohorte ist eine Gruppe mit eigenen Raten. Der Umstieg ist
eine Schemamigration nach T7.

### E21 — Wie die Zuteilung rechnet

**Gierig, Rang für Rang, in Bündeln.**

Die Reihenfolge je Tick:

1. **Projekte bekommen, was der Spieler ihnen zugewiesen hat** (E18). Nach E10 darf
   der Spieler der Bedarfsdeckung Arbeit entziehen, also wird das zuerst abgezogen.
2. **Der Rest geht durch die Rangliste** aus E9, von unten nach oben.

**Die Regel:**

> Ein Rang nimmt so viel, wie er verwerten kann. Was er nicht verwerten kann, geht an
> den nächsten.

Damit ist die Teildeckung geklärt: Ist Rang 1 (Nahrung, überleben) durch **Ackerland**
begrenzt und nicht durch Arbeit, bringt zusätzliche Arbeit dort nichts. Sie wandert
weiter an Rang 2 (Wohnraum, Dach). Der Rang bleibt unterdeckt, obwohl noch Hände frei
waren — weil die Hände dort keinen Ertrag mehr gebracht hätten. Ökonomisch genau
richtig: zugeteilt wird bis dahin, wo der Grenzertrag null ist, dann weiter.

**Inputs werden nicht einzeln zugeteilt.** Ein Rang fordert ein **Bündel** an — so viel
Arbeit *und* so viel Fläche, wie sein Verfahren verlangt. Das folgt aus E5: Feste
Inputverhältnisse heißen, dass das Bündel bestimmt ist, sobald das Verfahren feststeht.
Es gibt keinen Freiheitsgrad, über den getrennt zu entscheiden wäre. Läuft ein Input
aus, greift die Rückfallebene aus E5, nicht eine eigene Zuteilungsregel.

**Gleichstand gibt es nicht.** Die Rangliste ist streng geordnet, und jeder Rang gehört
zu genau einem Sektor. Zwei Ansprüche können nie gleichauf liegen.

**Nichts davon wird gespeichert.** Die Zuteilung ist eine Rechnung innerhalb des Ticks,
aus dem vorigen Zustand und der Konfiguration. Sie hinterlässt nur ihre Ergebnisse —
Bestände, Fortschritt der Projekte.

### E22 — Was im Zustand steht

Regel: **gespeichert wird nur, was Geschichte hat.** Alles Berechenbare wird jeden Tick
neu gerechnet und nirgends abgelegt. Das hält den Spielstand klein (T7) und verhindert,
dass zwei Stellen dasselbe behaupten und auseinanderlaufen.

**Gespeichert — acht Dinge:**

| | |
|---|---|
| **Tickzähler** | |
| **Zufallszustand** | nach T1 im Zustand, nie ein globaler Zufallsgenerator |
| **Bestände** | eine Zahl je Bestand: Bevölkerung, Nahrung, Wohnraum, Holz — dazu eine je Flächentyp (E13), anfangs Wildnis und erschlossene Fläche |
| **Zahl der Landnahmen** | daraus wird die Güte gerechnet (E13) |
| **Produktivität** | mitgeführt |
| **Arbeitsfähigkeit** | mitgeführt |
| **Erledigte Projekte** | je Kennung, wie oft — deckt einmalige und wiederholbare gleichermaßen ab |
| **Laufende Projekte** | je Projekt: Fortschritt, Position, pausiert ja/nein (E18) |

**Warum Produktivität und Arbeitsfähigkeit gespeichert werden**, obwohl sie aus der
Deckung folgen: Genau hier saß ein Zirkelschluss — Deckung braucht Produktion,
Produktion braucht Arbeitsleistung, Arbeitsleistung braucht Produktivität,
Produktivität braucht Deckung. Nach T2 wird der Kreis aufgetrennt, indem beide Faktoren
mitgeführt und am Ende des Ticks aus der frisch berechneten Deckung fortgeschrieben
werden. Sie sind damit auch der Ort, an dem später Gesundheit und Bildung einzahlen.

**Abgeleitet — jeden Tick neu, nirgends abgelegt:**

Köpfe (heute gleich der Bevölkerung, später aus den Kohorten) · Arbeitsvolumen = Köpfe ×
Arbeitsfähigkeit · Arbeitsleistung = Arbeitsvolumen × Produktivität · **erreichbares
Gebiet** (aus Grundgebiet und erledigten Institutionsprojekten, E13) · Güte des nächsten
Landstücks und Durchschnittsgüte · Deckung je Rang · Auslastung · welches Verfahren wie
stark läuft · Produktion · Geburten- und Sterberate · welche Projekte sichtbar und
machbar sind · welche Verfahren freigeschaltet sind

Die Liste ist kurz genug, dass ein Spielstand klein bleibt — im Wesentlichen ein Dutzend
Zahlen plus zwei kleine Listen. Das bestätigt, was T7 vorausgesetzt hatte.

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

## Technik

### T1 — Functional Core, Imperative Shell

**Daten sind unveränderliche Werte. Verhalten darf objektorientiert sein.** In
Java-Begriffen: Value Objects plus Strategy Pattern plus Registry.

Die Simulation ist rein und weiß nichts von der Oberfläche:

```ts
tick(state, config) → state
apply(state, action, config) → state
```

Kein DOM, kein `Math.random` (nur ein gesäter Generator **im** State), keine Uhr.
Gleicher Eingang, gleicher Ausgang, immer.

Das ist keine Ästhetik, sondern die Bedingung dafür, dass derselbe Code **in zwei
Umgebungen** läuft — im Browser und headless in Node. Und dafür, dass der Weltzustand
kopierbar, speicherbar, vergleichbar und zurückspulbar ist. Ein Objektgraph mit
veränderlichen Feldern kann das nicht ohne Aliasing- und Serialisierungsschmerzen.

**Faustregel:** *Klassen dürfen rechnen, aber nichts behalten.* Was zwischen zwei Ticks
überlebt, steht im `GameState` — sonst nirgends. Wird per Test geprüft.

Die Grenze `sim/` ↛ `ui/` wird per Lint-Regel **erzwungen**, nicht per Disziplin.

### T2 — Der Tick ist eine geordnete Liste von Phasen

```ts
interface Phase { readonly id: string; run(state, config): GameState }

const PIPELINE: Phase[] = [
  new DecayPhase(), new LaborSupplyPhase(), new InputAllocationPhase(),
  new ProductionPhase(), new CoveragePhase(), new PopulationPhase(),
  new ProjectPhase(),
  // new MoneyPhase(),  ← kommt später einfach dazu
];
```

**Geld einzuführen heißt später: eine Zeile in dieser Liste.** Keine bestehende Phase
wird angefasst. Ebenso bei den Projektwirkungen aus E12 — je Wirkungstyp ein
`EffectHandler` in einer Registry. Open/Closed in Reinform: neuer Typ = neue Klasse +
Registry-Eintrag, keine Änderung an bestehenden Dateien.

Komposition schlägt Vererbung; flache Interfaces, keine tiefen Basisklassen.

**Die Simulation hat keine Uhr. Die Hülle ruft `tick` auf.**

| Umgebung | Wer treibt |
|---|---|
| Browser | ein Zeitgeber, oder ein Knopf, oder beides |
| Headless-Lauf | eine Schleife, so schnell die Maschine kann |
| Test | eine Schleife über feste Schritte |

Die Hülle hält den aktuellen Zustand und meldet der Oberfläche, wenn er sich geändert
hat.

**Spielzeit ist die Anzahl der Ticks, nicht die Echtzeit.** Es gibt kein Nachholen von
Offline-Zeit: Schließen pausiert, Öffnen setzt genau dort fort, wo aufgehört wurde —
egal ob nach fünf Minuten oder drei Wochen.

Der Grund ist inhaltlich, nicht technisch. Liefe die Zeit ohne den Spieler weiter,
wären nach Stunden Tausende Ticks vergangen: Projekte längst fertig, Hände seitdem
brach — und ungenutzte Arbeit ist nach E10 **dauerhaft verloren**. Der Spieler käme zu
einer Lage zurück, die er nicht verursacht hat und nicht rückgängig machen kann. Damit
bliebe nur die Wahl, Abwesenheit zu belohnen (und ausgerechnet die zentrale Lehre
auszuhebeln) oder sie zu bestrafen. Folgenlos ist besser als beides.

**Der Spieler stellt die Geschwindigkeit im Spiel ein und kann pausieren.**
Beschleunigung heißt schlicht: mehr Ticks pro Sekunde. Eine Einstellung der Hülle, nie
eine Änderung am Modell.

Zwei Dinge fallen dabei ab: Gebremste Hintergrund-Tabs sind kein Fehlerfall, das Spiel
läuft dann eben langsamer. Und ein geladener Spielstand verhält sich identisch,
unabhängig davon, wann er geladen wird — Voraussetzung dafür, dass ein mitgeschickter
Spielstand aus einem Fehlerbericht dieselbe Lage ergibt (T7).

**Der neue Zustand ergibt sich vollständig aus dem letzten.** Die Simulation braucht
nie mehr als den vorigen Stand — kein Rückblick über mehrere Ticks.

Verzögerungen werden deshalb als **mitgeführter Zustand** abgebildet, nicht als Blick
in die Vergangenheit. Ein Bau, der drei Jahre dauert, ist ein Eintrag „noch 12 Ticks"
im aktuellen Zustand, kein Blick 36 Ticks zurück. Das ist die Standardform dynamischer
Modelle: Jedes System mit endlichem Gedächtnis lässt sich in ein Modell erster Ordnung
überführen, indem man den Zustand erweitert.

**Der Verlauf ist reine Darstellungsdaten. Die Simulation liest ihn nie.**

**Aufzeichnen und Wegschreiben sind Aufgaben der Hülle**, nicht der Simulation. Ein-
und Ausgabe in der Simulation würde sie bremsen und ihre Reinheit brechen (T1). Das
Headless-Werkzeug (T4) ist seine eigene Hülle und entscheidet selbst, ob es überhaupt
mitschreibt.

Für die erste Fassung liegt der Verlauf **nur im Arbeitsspeicher**; es wird nichts
persistiert.

### T3 — Inhalt ist Daten, die Engine interpretiert sie

Sektoren, Verfahren, Projekte, Bedarfsränge, Kurven — alles Konfiguration, **ohne Code
darin**:

```ts
expandTerritory: {
  visibleWhen: [], availableWhen: [],
  cost: { labor: 60 },
  effects: [{ type: "area", kind: "forest", amount: 20 }],
  repeatable: { qualityDecay: { kind: "exponential", factor: 0.95 } },
}
```

Keine Funktionen in der Konfiguration — sonst ist sie Code und Balancing wird wieder
Programmieren. Als TypeScript statt JSON, damit der Editor Tippfehler in Kennungen
sofort meldet.

### T4 — Der Spieler ist eine Strategie hinter einer Schnittstelle

```ts
interface Policy { decide(state: GameState): Action[] }
```

| | Implementierung |
|---|---|
| Echtes Spiel | `HumanPolicy` — sammelt Klicks aus der Oberfläche |
| Headless-Lauf | `ExpansionistPolicy`, `IntensifierPolicy`, `PassivePolicy` |

Dieselbe Schleife, dieselbe Simulation, nur der Entscheider wird getauscht. Damit sind
Headless-Läufe (`npm run simulate -- --years 300 --seed 42`) ein erstklassiges
Werkzeug: 300 Spieljahre in einer Sekunde, um etwa den wandernden Engpass aus E14 zu
prüfen, ohne eine halbe Stunde zu spielen.

Und es ist ein **Konzeptprüfer**: Kommt `PassivePolicy` genauso weit wie eine
durchdachte Strategie, sind unsere Entscheidungen bedeutungslos und das Spiel ist
kaputt.

**Zum Balancing gehört eine laufende Sitzung.** Ein Node-Prozess hält den Zustand im
Arbeitsspeicher und nimmt über eine kleine HTTP-Schnittstelle auf `localhost`
JavaScript entgegen — mit `s` (Zustand), `cfg` (Konfiguration) und `report` im
Sichtbereich:

```bash
npm run session
eval 's = tick(s, cfg); report(s)'
eval 's = apply(s, {type:"startProject", id:"clearForest"}, cfg)'
eval 's.stocks'
eval 'for (let i=0;i<20;i++) s = tick(s, cfg); reportCompact(s)'
```

Synchron, interaktiv, ohne Zustandsdatei und ohne Neuanfang: Der Zustand ist eine
Variable in einem laufenden Prozess. Nach jedem Tick lässt sich sehen, was passiert
ist, und der nächste Befehl baut darauf auf.

**Ein einziger Endpunkt genügt.** Ticken, handeln, in den Zustand schauen, eine
Schleife laufen lassen, eine Zwischenrechnung anstellen — alles derselbe Weg. Eine
feste Befehlsliste könnte immer nur das, woran beim Entwurf gedacht wurde. HTTP statt
Node-Konsole, weil jeder Aufruf für sich abgeschlossen ist, während der Prozess
weiterläuft.

Nur an `localhost` gebunden, ausschließlich Entwicklungswerkzeug, nie Teil des
ausgelieferten Spiels.

**`report(state)` in zwei Formen** — ein ausführlicher Block und eine kompakte Zeile je
Tick, aus der sich Verläufe ablesen lassen:

```
Tick  Bev    Wildnis  erschl.  Nahr  Wohn  R1    R2    Bindet
  44  33,8     144       36     58    11   100%   84%  erschl. Fläche
  45  34,0     144       36     59    11   100%   83%  erschl. Fläche
  46  34,1     142       38     61    11   100%   82%  Holz
```

Die **Bindet**-Spalte ist der wichtigste Teil: Sie prüft E6 (der Engpass wandert)
direkt. Steht dort über zweihundert Ticks immer dasselbe, stimmen die Zahlen nicht.

### T5 — Stack und Aufbau

| | | Warum |
|---|---|---|
| **TypeScript** | überall | Hunderte Konfigurationswerte mit Kennungen, die zusammenpassen müssen — Tippfehler wären in JS stille Fehler |
| **Vite** | Build & Dev-Server | Keine Konfiguration, sofortiges Neuladen |
| **Svelte 5** | Oberfläche | Die Oberfläche ist Text, Tabellen, Balken, Listen. React brächte Zeremonie ohne Nutzen |
| **Vitest** | Tests | Gehört zu Vite |
| **Node 24** | Werkzeuge | Führt TypeScript **direkt** aus (Type-Stripping) — Headless-Läufe und Tests brauchen keinen Build-Schritt |

Rein statische Auslieferung: `npm run build` → `dist/`, auf jeden Webspace legbar.
Kein Backend, keine Datenbank.

```
src/
  sim/        state.ts · tick.ts · phases/ · effects/ · random.ts
  content/    sectors.ts · processes.ts · projects.ts · needs.ts
  policy/     policy.ts · bots/
  persistence/
  ui/
  i18n/       de.ts · en.ts · t.ts
tools/        simulate.ts
test/         invariants/ · scenarios/
```

**Invariant-Tests von Anfang an** — sie sind das Rückgrat der dritten Zielanforderung,
weil sie die Buchhaltungsidentitäten überprüfbar statt behauptet machen:

```ts
test("allocated labor sums to supply", ...)
test("forest + farmland = total area", ...)
// später: Geldmenge === kumuliertes Defizit
```

### T6 — Code ist Englisch, die Oberfläche wird übersetzt

**Der gesamte Code ist Englisch** — Bezeichner, Kommentare, Dateinamen, Commits. Nur
`KONZEPT.md` und die Oberfläche sind Deutsch.

| Konzept | Code |
|---|---|
| Sektor | `Sector` |
| Verfahren | `Process` |
| Bedarfsrang | `NeedTier` |
| Deckung | `coverage` |
| Auslastung | `utilization` |
| Vorleistung | `intermediate` |
| Kapazität | `capacity` |
| Güte | `quality` |
| Rodung / Landnahme | `clearForest` / `expandTerritory` |

**Die Simulation erzeugt weder Text noch Meldungen.** Sie liefert ihren Zustand; alles,
was der Spieler zu sehen bekommt, entsteht außerhalb.

Eine Meldung an den Spieler ist ein **i18n-Schlüssel plus ein paar Zahlen**, aufgerufen
von der Oberfläche:

```ts
t("forest_cleared", { hectares: 10, remaining: 170 })
```

```
de: forest_cleared: "Wald gerodet: {hectares} ha, {remaining} ha verbleiben."
```

Mehr braucht es nicht: eine flache Schlüsseltabelle je Sprache, eine `t()`-Funktion,
keine Bibliothek. Wann eine Meldung erscheint, ist eine Bedingung auf dem Zustand —
gewöhnlicher Code in der Oberfläche.

### T7 — Speicherstände: nur das, was jetzt billig und später teuer ist

Bewusst **kein** Verwaltungskonzept — ob es eine Spielstandsverwaltung überhaupt geben
soll, ist offen. Festgelegt wird nur, was einen späteren Umbau verhindert:

**1. Der Zustand ist ein einfacher, serialisierbarer Wert; der Inhalt steckt nicht
drin.** Gespeichert wird nur, was sich beim Spielen ändert — Bevölkerung, Bestände,
erledigte Projekte als Kennungen, Zuteilungen, Zufallszustand, Tick. Sektoren,
Projekte und Balancing-Zahlen gehören zum Programm. Damit bleiben Stände klein und
**Balance-Änderungen werden automatisch übernommen**, statt Teststände zu zerstören.

**2. Ein Umschlag um den Zustand, von Anfang an:**

```json
{ "schemaVersion": 1, "gameVersion": "0.1.0", "meta": { ... }, "state": { ... } }
```

**3. Speichern läuft über eine Schnittstelle**, nicht über verstreute
localStorage-Aufrufe:

```ts
interface SaveStore {
  save(id: string, snapshot: Snapshot): Promise<void>;
  load(id: string): Promise<Snapshot | null>;
  list(): Promise<SaveMeta[]>;
  delete(id: string): Promise<void>;
}
```

**Asynchron von Anfang an**, obwohl localStorage synchron ist — sonst bräuchte ein
späterer Wechsel auf IndexedDB oder einen Server eine Änderung an jeder Aufrufstelle.
**Mit `id` von Anfang an**, auch wenn zunächst nur eine benutzt wird — mehrere Plätze
sind damit später geschenkt.

**Vorgabe:** Nichts wird überschrieben oder rotiert. Gespeichert wird bewusst und
benannt.

Rotation, Autosave-Strategie, Export, Teilen-Codes und Verlaufsindex sind
**Implementierungen hinter dieser Schnittstelle** und jederzeit nachrüstbar.

### T8 — Code-Qualität

**Prettier zum Formatieren, ESLint zum Prüfen.**

Die Alternative wäre Biome — ein Werkzeug statt zwei, eine Konfiguration, schneller.
Dagegen spricht genau ein Punkt: **`.svelte`-Dateien.** Biome versteht davon nur die
Skriptblöcke, nicht die Vorlagen; für Prettier und ESLint gibt es ausgereifte
Svelte-Erweiterungen. Zwei Werkzeuge sind der Preis dafür, dass beide unsere
Dateitypen wirklich können.

Formatierung wird nicht diskutiert, sondern automatisch angewandt.

**TypeScript streng:** `strict: true` plus **`noUncheckedIndexedAccess`**.

Das zweite ist bei uns wichtiger als üblich, weil ständig über Kennungen auf
Konfiguration zugegriffen wird — `sectors[id]`, `processes[id]`. Ohne die Einstellung
behauptet TypeScript, da käme immer etwas zurück; mit ihr muss der Fall behandelt
werden, dass die Kennung nicht existiert. Genau die Fehlerklasse, die sonst erst beim
Balancing auffällt.

**Regeln werden nach ihrer Art durchgesetzt:**

| Art | Mittel |
|---|---|
| **Statische Regeln** — wer darf wen importieren (`sim/` ↛ `ui/`) | **ESLint**, `no-restricted-imports` ist eingebaut |
| **Verhaltensregeln** — dass Phasen zwischen Ticks nichts behalten (T1), dass Buchhaltungsidentitäten aufgehen, dass zugeteilte Arbeit sich aufs Angebot summiert | **Tests** |

Der Linter meldet Importverstöße sofort im Editor, also bevor die Datei überhaupt
fertig ist — für eine Regel, die man gar nicht erst verletzen soll, der bessere
Zeitpunkt als ein fehlschlagender Test. Verhaltensregeln kann er dagegen nicht prüfen,
weil sie am Code nicht ablesbar sind.

Falls die Importregeln später zahlreicher werden, wäre `dependency-cruiser` der
nächste Schritt. Für eine einzige Regel lohnt er nicht.

---

## Offen

Aufgeworfen, noch nicht besprochen — grob in der Reihenfolge, in der es drankommt:

- **Volkswirtschaftliche Kennzahlen.** Welche sind je Entwicklungsstufe sinnvoll?
  Ändert sich vermutlich mit dem Fortschritt.
- **Prognose.** Der Spieler braucht Vorausschau, um bei **trägen** Sektoren
  rechtzeitig zu handeln — er muss sehen können, dass Wohnraum knapp *werden wird*.
- **Sektoren ohne Überlebensbezug** — Kultur, Freizeit. Nach der Grundregel in E9
  muss jede Bedarfsstufe in eine reale Größe zurückzahlen. Für Kultur ist unklar,
  worin. Bloße Legitimität reicht als Begründung nicht; wird bei den Politikfeldern
  geklärt.
- **Geldeinführung.** Der wichtigste Moment des Spiels.
- **Auslastung und Inflation.**
- **Ungleichheit.** Braucht einen echten *wirtschaftlichen* Effekt (höhere Sparquote
  oben → Nachfrageausfall), nicht nur eine Anzeige.
- **Banken und Kredit.**
- **Außenhandel und Währung.**
- **Politikfelder.**
- **Oberfläche.**
- **Ob und wie das Spiel endet.**

Technisch noch offen:

- **Konkrete Zahlen** — Startbevölkerung, Erträge, Projektkosten, Wachstumsraten.
- **Veröffentlichung** — wo das Spiel am Ende liegt. Statische Dateien, also
  unkritisch; zum Schluss.

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
- **Zufriedenheit als Zustandsgröße.** Keine volkswirtschaftliche Größe, verdoppelt
  die Deckung und wäre eine Benotung durch die Hintertür (E8).
- **„Dringlichkeit" als Sektormerkmal.** Ersetzt durch die konkrete Angabe je Sektor,
  worauf seine Unterdeckung real wirkt (E8).
- **Regler „Bedarf ↔ Zukunft".** Ersetzt durch Projekte (E10) — konkreter, und der
  Übergang zum Geldkauf von Arbeit wird dadurch scharf statt weich.
- **Gemeinschaftsarbeit vs. Fron als eigene Stufen.** Ohne mechanischen Unterschied.
- **Politikfelder als eigener Typ neben Projekten.** Politikfelder sind Sektoren (E10).
- **„Hütten bauen" als Projekt.** Kategorienfehler — ein Dach deckt Rang 2, ist also
  Sektorproduktion (E10).
- **Steigende Erschließungskosten** als Bremse der Expansion. Ersetzt durch fallende
  Grenzgüte (E13), die dem Ricardo-Anker entspricht und die bessere Dynamik erzeugt.

---

## Wissenschaftliche Anker

Jede Mechanik braucht eine Entsprechung in der Lehre. Stand jetzt:

| Mechanik | Anker |
|---|---|
| Zweischichtigkeit, Identitäten | Godley/Lavoie, stock-flow-konsistente Modellierung |
| Verfahren mit Rückfallebene | Aktivitätsanalyse (Koopmans); Sraffa, von Neumann |
| Vorleistungen, Lieferketten | Input-Output-Analyse (Leontief); VGR |
| Extensiv vs. intensiv, fallende Grenzgüte | Ricardo, Differentialrente |
| Konsumgut vs. Produktionsmittel | Standardunterscheidung der VGR |
| Sättigung, Strukturwandel | Engelsches Gesetz; Pasinetti |
| Trägheit | Time-to-build (Kydland/Prescott); Investitionsverzögerung bei Kalecki |
| Verfall | Abschreibung; Dienstleistungen als nicht lagerfähig |
| Projekte, Konsum gegen Investition | Produktionsmöglichkeitenkurve; intertemporale Wahl |
| Verfall ungenutzter Arbeit | Post-Keynesianisch: nicht produzierter Output ist dauerhaft verloren |
| Bevölkerung | Malthus; Unified Growth Theory (Galor/Weil) |
| Mindestlebensfähige Größe | Populationsbiologie; minimum viable population |
| Geometrischer Verfall | Perpetual-Inventory-Methode der Kapitalstockrechnung |
| Kohorten bei Kapital | Jahrgangskapital |
| Gestufte Bedarfshierarchie | Pasinetti; Georgescu-Roegen (1954) |
| Ernährung → Produktivität | Effizienzlohntheorie (Leibenstein, Dasgupta/Ray); Fogel |
| Köpfe × Arbeitsfähigkeit × Produktivität | Zerlegung der VGR; Arbeit in Effizienzeinheiten (Solow) |
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
