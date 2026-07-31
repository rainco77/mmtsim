# Konzept — festgelegte Entscheidungen

Lebendes Dokument. Wird nach **jeder** Einigung fortgeschrieben, bevor der nächste
Vorschlag kommt. Wer hier neu einsteigt, liest nur diese Datei.

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
- **Auch die Umsetzung schreibt fort.** Was beim Bauen oder Austarieren entschieden
  wird — weil ein Lauf einen Fehler zeigt oder eine Festlegung sich als unvollständig
  erweist —, kommt hier hinein, mit dem Befund, der dazu geführt hat. Sonst weiß bald
  niemand mehr, warum der Code etwas anderes tut als das Konzept.
- **Der Entwicklungsbogen wird nicht am Schreibtisch entworfen.** Nach E28 muss ein
  Übergang einen Schmerz beantworten — und ein Schmerz wird **gefunden, nicht
  erfunden**. Der Versuch, die Stufen bis zur galaktischen Zivilisation vorab
  durchzuplanen, ist gescheitert: Jeder am Schreibtisch konstruierte Engpass hielt der
  Prüfung nicht stand. Gebaut wird die nächste Stufe; der übernächste Übergang ergibt
  sich daraus, was beim Spielen tatsächlich stört.

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
Branche und von der Epoche ab (→ E6). Am Anfang ist es Fläche, kurz darauf Arbeit.

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

### E3 — Branchenmerkmale

Alle Branchen laufen über dasselbe Schema. Ein neuer Branche ist eine Zeile
Konfiguration, nie neue Mechanik.

| Merkmal | Frage | Trägt im Spiel |
|---|---|---|
| **Verfallsrate** | Wie schnell zerfällt der Bestand? | Bestimmt, ob Puffer möglich sind (Pflege 100 %/Tick, Wohnraum sehr langsam) |
| **Sättigung** | Wieviel braucht ein Mensch, bis genug ist? | Motor des Strukturwandels — Wachstum muss woandershin, wenn Grundbedarf gedeckt ist |
| **Trägheit** | Wie lange von Entscheidung bis Wirkung? | Grund, warum Wirtschaftspolitik schwer ist |
| **Empfindlichkeit** | Wie stark schlägt die Jahresgüte durch? | Wetter trifft Acker stark, Bau gar nicht (E24) |

**Produktivität ist keine Branchenmerkmal**, sondern Ergebnis der oberen Schichten (E2)
und der verfügbaren Verfahren (E5).

**Elastizität ist ebenfalls kein Merkmal**, sondern ein Ergebnis (→ E5). Als feste
Zahl wäre sie fachlich falsch: Angebotselastizität hängt an Auslastung und
Zeithorizont, sie ist keine Konstante.

### E4 — Inputs: Kapazität vs. Vorleistung

Branchen haben **Inputs**, nicht nur Arbeit. Zwei Arten:

**Kapazität** — wird **belegt**, nicht verbraucht. Land, Gebäude, Maschinen. Steht
während der Produktion zur Verfügung und ist danach wieder frei. Verfällt über die
Zeit, nicht durch Nutzung.

**Vorleistung** — wird **verbraucht**. Energie, Dünger, Saatgut, Stahl. Weg nach der
Produktion, muss jeden Tick neu beschafft werden.

Das ist die Trennung der Volkswirtschaftlichen Gesamtrechnung; der zweite Begriff
heißt dort wörtlich *Vorleistungen*. Lieferketten sind damit nichts anderes als die
**Input-Output-Tabelle nach Leontief** — jede Branche bezieht Vorleistungen von
anderen Branchen.

Zwei Dinge fallen gratis ab:

- **Auslastung** bekommt ihre präzise Definition: wie stark die *Kapazitätsinputs*
  belegt sind. Nicht, wieviele Vorleistungen fließen.
- **Wertschöpfung** wird darstellbar: Produktion − Vorleistungen. Erst damit lässt
  sich das BIP korrekt bilden, ohne doppelt zu zählen.

Zu Spielbeginn gibt es **null Vorleistungen**: Nahrung braucht Land und Arbeit,
fertig. Die Lieferkettenmaschinerie schaltet sich erst mit der ersten Maschine ein —
und bringt dann sofort ihre eigene Verwundbarkeit mit.

**Arbeit ist eine Vorleistung wie jede andere, Köpfe sind eine Kapazität wie jede
andere.** Arbeit ist ein Bestand mit `decayPerTick: 1` — hergestellt vom Verfahren
`labor` aus der Kapazität `people`, deren Qualität Arbeitsfähigkeit × Produktivität
ist, und bis zum nächsten Tick vollständig verfallen. Ein Verfahren deklariert seinen
Arbeitsbedarf als `intermediatesPerOutput: { labor: … }`, nicht anders als seinen
Holzbedarf.

Damit hat **kein Input mehr einen Sonderweg**. Vorher hatte Arbeit ein eigenes Feld im
Vorrat, eigene Zweige in jeder Abfrage, eine eigene Wertrechnung über die Kette und —
das war der Schaden — ein eigenes Entscheidungskriterium. Die Nichtlagerbarkeit
zeichnet sie nicht aus: Sie ist eine Eigenschaft, die über den Verfall gesteuert wird,
und Pflege oder Betreuung bekommen später schlicht denselben Wert.

Auch die Köpfe stehen richtig: Ein Mensch wird durch Arbeit nicht aufgebraucht, er ist
für einen Tick belegt und danach wieder frei — genau die Definition von Kapazität
oben. **Auslastung** gilt damit auch für ihn, und was eine Kapazität hergibt, meldet
die Zuteilung, statt es andernorts ein zweites Mal abzuleiten: Beim Bauen las die
Auslastung der Köpfe null, während sie zu 87 % arbeiteten, weil die zweite Ableitung
sie im Zustand suchte — wo sie nicht steht, weil sie aus den Köpfen folgt.

### E5 — Verfahren mit Rückfallebene

Jede Branche hat mehrere **Verfahren**, jedes mit eigenen Inputs und eigener
Produktivität. Beispiel Nahrung im Endausbau:

| Verfahren | Inputs | Ertrag je Arbeitseinheit |
|---|---|---|
| Maschinell | Land, Maschinen, Energie, Dünger | 40 |
| Pfluggespann | Land, Zugtiere, Futter | 8 |
| Handarbeit | Land | 3 |

**Regel: Verfahren haben eine erklärte Priorität. Das höchstpriore läuft, bis einer
seiner Inputs ausgeht. Der Rest fällt auf das nächste zurück.**

**Woher die Ordnung kommt, hat zwei Quellen — und beide liefern dieselbe Form: eine
Ordnung der Verfahren, nie ein einzelnes ausgewähltes.** Nur so lässt sich später
zwischen ihnen umschalten, ohne dass die Rückfallebene neu gebaut werden muss.

**Gerechnet (die Voreinstellung): nach Dominanz.** Ein Verfahren geht vor einem
anderen, wenn es von **jedem** Input, den beide benutzen, nicht mehr je Einheit braucht
und von mindestens einem weniger. Verglichen wird auf **risikobereinigten**
Koeffizienten: Ein Verfahren, das oft misslingt, kostet je *gelieferter* Einheit mehr,
weil Fläche und Arbeit auch in den Fehljahren verbraucht sind. Das Gewicht hängt daran,
wie dünn der Puffer ist — wer einen vollen Speicher hat, kann sich Streuung leisten; wer
auf Kante lebt, nimmt das Verlässliche.

**Kein Input ist ein Kriterium für sich.** Dominanz ist der Standardbegriff der
Aktivitätsanalyse (Koopmans): Was übrig bleibt, ist die effiziente Grenze — und welches
der nicht dominierten Verfahren man nimmt, ist mit Mengen gar nicht entscheidbar. Dafür
braucht es Preise. Der Plan soll es also nicht entscheiden, und er tut es nicht.

**Wo Dominanz schweigt, entscheidet die Knappheit** — und zwar später: Der Plan beginnt
mit der Routine (dem im Inhalt erklärten Verfahren) und schiebt Nachfrage von dem weg,
was nicht reicht (E21 — wie die Zuteilung rechnet). Ist das Land knapp, gewinnt das
flächensparende Verfahren; ist die Arbeit knapp, das arbeitssparende. Vollkommen
symmetrisch, ohne vorab genanntes Kriterium. Das ist zugleich Simons
Anspruchsniveau-Suche und Nelson/Winters **Routinen**: Man macht weiter wie bisher und
weicht ab, wenn eine Schranke drückt — nicht: man rechnet jeden Tick neu, was optimal
wäre.

**Das ist eine Zuteilung, keine Wahl.** In der Geschichte gab es keinen Umstieg von
Jagd auf Ackerbau — beide liefen jahrtausendelang nebeneinander, und die Anteile
verschoben sich mit der Bevölkerungsdichte. Zwei Verfahren auf verschiedenem Boden
dominieren einander nie, weil jedes einen Input braucht, den das andere nicht braucht;
also laufen beide bis an ihre je eigene Kapazität. Boserup als verschiebende Mischung,
nicht als Sprung.

> *Verworfen: die Ordnung nach dem **Ertrag je Arbeitsleistung**.* Sie hat Arbeit zum
> einzigen Input mit einem Entscheidungskriterium gemacht und deshalb messbar das
> schlechtere Verfahren gewählt: Dreifelderwirtschaft bringt 5,0 Einheiten je Flächeneinheit
> gegen 2,9 beim einfachen Ackerbau, kostet aber 18 % mehr Arbeit je Einheit. Die Regel
> lehnte sie ab — und sparte damit einen Input, der zu 27 % ungenutzt verfiel (E10 —
> ungenutzte Arbeit ist am Tickende weg). Gemessen: 1704 Menschen statt 2822, wenn man
> die Reihenfolge von Hand richtig stellte.

**Belegt, dass die Reihenfolge nicht tragend ist.** Der Austausch des Kriteriums —
Arbeitsertrag gegen Dominanz — hat das Ergebnis über 25 Seeds und 1200 Ticks um
**0,007 %** verändert (3179,475 → 3179,451 Menschen). Die Arbeit macht die Verlagerung
nach Knappheit, nicht die Rangliste. Genau das behauptet der Absatz oben, und genau so
soll es sein: Eine Reihenfolge, an der das Ergebnis hinge, wäre eine Wahl.

> *Verworfen auf dem Weg dorthin:* eine Ordnung nach dem **bindenden Input**. Sie war
> als Rangfrage gestellt, wo eine Zuteilungsfrage stand — und schwang deshalb: Jede
> Wahl entlastet ihren eigenen Engpass, also bindet gleich darauf der andere. Weder
> Glättung noch Schwellen noch Trägheit lösen das; sie machen das Schwingen nur
> langsamer. Der Fehler lag in der Fragestellung.

**Verfahren, die Flächenertrag gegen Arbeitsertrag tauschen, werden gar nicht
gegeneinander gereiht** — sie unterscheiden sich durch ihren **Flächentyp**.
Bewässertes Land ist ein eigener Typ, den der Kanalbau schafft, genau wie Rodung
Wildnis in Ackerland verwandelt. Jedes Verfahren läuft dann auf seinem eigenen Boden,
und die Entscheidung ist der Bau — also ein Projekt, und damit dort, wo Entscheidungen
in diesem Modell wohnen.

**Warum der Puffer über das Risiko entscheidet und nicht der Spieler:** Der Abschlag ist
keine Haltung, sondern folgt aus dem Modell selbst. Nach E24 ist Verhungern nicht
symmetrisch — Unterdeckung von Rang 100 hebt die Sterberate, Überdeckung bringt nichts
zurück. Bauern haben die widerstandsfähige, ertragsärmere Sorte auch ohne jede Politik
gewählt; eine Lösung, die das an einen Spielerhebel hängt, verlöre sie mit dem Hebel.

Nebenbei bekommt der Vorrat damit einen zweiten Sinn: **Ein Vorrat erlaubt es, Risiken
einzugehen.** Wer nichts hat, muss sicher gehen und bleibt deshalb ärmer — die
Risikotragfähigkeit steigt mit dem Vermögen. Die Armutsfalle wird sichtbar, ohne dass
wir sie einbauen.

**Die Begründung ist immer sichtbar.** `derive` rechnet die Ordnung ohnehin, also liefert
es den Grund mit: *„sichere Sorte läuft ← Vorrat dünn"*. Ein Wechsel ist damit keine
Zauberei, sondern eine Meldung mit Grund.

**Die Reihenfolge von Hand zu setzen gibt es nicht — ausgemessen und entfernt.**

Der Hebel war gebaut: Der Spieler konnte die Ordnung je Branche setzen und wieder
freigeben. Die Messung über fünf Seeds und 900 Ticks, gegen die Automatik nach Dominanz:

| gesetzte Reihenfolge | Bevölkerung |
|---|---:|
| Automatik | 2818 |
| Jagd zuerst | 2818 |
| Ackerbau zuerst | 2818 |
| Sammeln zuerst | 1721 |

Je Seed **bitgleich**, nicht nur im Mittel. Wo die Hand zwischen Verfahren wählt, die
einander nicht dominieren — Jagd gegen Ackerbau, jedes auf eigenem Boden —, ändert sie
**nichts**: Der Plan läuft in dieselbe Zuteilung, ganz gleich, wo er beginnt. Wo sie ein
**dominiertes** Verfahren nach vorn zwingt, kostet das 39 %.

Der Hebel kann also nur schaden. Er hat keinen Zustand, in dem er nützt. Seine früher
gemessenen 66 % waren kein Nutzen, sondern das Ausgleichen eines Fehlers der Automatik,
die damals nach Arbeitsertrag ordnete.

Und er verfehlt beide Ziele des Spiels: Ein Knopf, dessen richtige Einstellung „nicht
anfassen" lautet, belohnt nie und bestraft nur — kein Spielspaß. Und als *Wahl* zwischen
Jagd und Ackerbau lehrt er, die neolithische Revolution sei eine Menüauswahl gewesen —
die Gegenlehre zu Boserup, auf den sich dieses Modell beruft.

**Die Schnittstelle bleibt.** `ProcessOrdering` hat weiter mehr als eine Implementierung
dahinter, also ist ein späteres Wiedereinführen eine Zeile Konfiguration und kein Neubau
(E23 — Regeln sind Schalter, die die Phasen lesen). Der Platz dafür ist da, falls der
Spieler später wirklich zwischen Gleichwertigem wählen soll — welche Feldfrucht, welcher
Handelspartner. Nur zwischen Verfahren derselben Branche gibt es nichts zu wählen, was
die Knappheit nicht besser entscheidet.

**Zwei Arten von Verfahren:**

**Ohne Kapazitätsinput** — eine Technik. Wer mit Speeren jagen kann, kann es überall.
Sie **ersetzt ihre Vorgängerin vollständig**; es wird nichts gemischt und eine
Rückfallebene nie gebraucht. So sehen die Verfahrensketten der Frühphase aus.

**Mit Kapazitätsinput** — Mühle, Kanal, Maschine. Sie läuft **so weit die Kapazität
reicht**, der Rest fällt auf die nächste Priorität.

Daraus folgt, dass es **keinen Wahlmechanismus zwischen Verfahren braucht**: Bewässerung
steht über Trockenfeldbau und läuft auf so viel Fläche, wie Kanäle gebaut sind. **Die
Entscheidung des Spielers ist, wie viele Kanäle er baut** — also ein Projekt, und damit
dort, wo Entscheidungen in diesem Modell wohnen.

Fehlt Energie für die halbe Maschinenflotte, läuft sie halb, der Rest geht ans
Pfluggespann oder an die Hand. Die Produktion bricht nicht ein — die
**Durchschnittsproduktivität sinkt**.

Folgen:

- **Auslastung geht nie über 100 %.** Was nicht mehr in die Maschinen passt, läuft auf
  der Rückfallebene. Kein Sonderfall.
- **Der harte Stopp bleibt möglich**, ohne Extramerkmal: eine Branche ohne Rückfallebene
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

**Einheitenregel: Was in die Wahl der Einheit hineinrechenbar ist, braucht keinen
eigenen Mechanismus.** Nahrung wird in **Nährwert** gemessen, nicht in Masse. Damit ist
Kochen ein gewöhnliches Verfahren, das den Ertrag hebt — dieselbe Sammelarbeit liefert
mehr verwertbare Kalorien. Ohne die richtige Einheit hätte man eine Verbrauchssenkung
als Produktivitätsgewinn tarnen müssen, was eine Verdrehung wäre. Dasselbe gilt für
Sperrigkeit bei Lagerkapazität.

Zu Spielbeginn hat Nahrung **genau ein Verfahren**: Sammeln auf Wildnis (E29).

**Verfahren wirken nicht nur auf Produktion, sondern auch auf den Verfall.** Der
wiederverwendbare Teil dieses Abschnitts ist die **Rückfallordnung**, nicht die
Produktion. Sie passt auf Lagerung unverändert:

| Lagerverfahren | Braucht | Verfallsrate |
|---|---|---|
| Silo | Kapazität Silo | 1 % |
| Grube | Kapazität Grube | 4 % |
| im Freien | nichts | 12 % |

Reicht das Silo für 200 Einheiten und liegen 300 da, verfallen 200 mit 1 % und 100 mit
4 % — wie bei der Mühle, wo ein Teil maschinell und der Rest von Hand mahlt.

**Ein Verfahren hat also Inputs, eine Rückfallposition und ein Ergebnis; das Ergebnis
ist entweder eine Produktion oder eine Verfallsrate.** Und ein Verfahren gehört zu dem,
worauf es wirkt: ein Produktionsverfahren zu einem **Branche**, ein Lagerverfahren zu
einem **Bestand**.

Das ist kein Kunstgriff: In der Aktivitätsanalyse ist **Lagerung eine Aktivität wie jede
andere** — sie wandelt „Gut heute" in „Gut morgen" mit einem Verlust. So behandeln es
Koopmans und von Neumann, auf die sich dieser Abschnitt ohnehin beruft.

*Verworfen: Lagerung vollständig als Produktion zu führen („Nahrung morgen" aus
„Nahrung heute" mit Ertrag 0,95). Theoretisch sauberer — es gäbe dann keinen Verfall
mehr als eigenes Konzept —, würde aber E19 umbauen, jeden Bestand jeden Tick durch ein
Lagerverfahren schleusen und die Lesbarkeit verschlechtern, ohne dass sich im Spiel
etwas ändert.*

Zu Spielbeginn hat **jeder Bestand genau ein Lagerverfahren**: „im Freien", ohne Inputs.
Das ist exakt die feste Verfallsrate aus E19. Die Liste wächst erst mit einem
Speicherprojekt.

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
Bedarfsstufe, nicht an der Branche als Ganzer (→ E9).

### E9 — Bedarf ist gestuft und rangiert über alle Branchen

Bedarf ist nicht „Anzahl × fester Wert pro Kopf" — das widerspräche der Sättigung
(E3) und machte Strukturwandel unmöglich. Stattdessen gibt es **eine Rangliste von
Bedarfsstufen über alle Branchen hinweg**:

| Rangzahl | Stufe | Branche | Menge pro Kopf |
|---|---|---|---|
| 100 | Nahrung — überleben | Nahrung | 1,0 |
| 200 | Dach über dem Kopf | Wohnraum | 0,3 |
| 300 | Nahrung — satt werden | Nahrung | 0,8 |
| 400 | eigener Raum | Wohnraum | 0,5 |
| … | … | … | … |

**Ränge gehören zur Branche, sind aber global geordnet.** Jeder Rang erklärt eine
**absolute Rangzahl**, keine Position in einer Liste. Die geltende Liste ist: alle
Ränge, die gerade existieren, nach ihrer Zahl sortiert. Kommt die Branche Wohnraum
hinzu, rutscht „Dach" von allein zwischen die beiden Nahrungsränge — in welcher
Reihenfolge der Spieler Branchen freischaltet, ist damit gleichgültig. Das ist nötig,
weil Branchen aus Projektwirkungen entstehen (E12) und deren Reihenfolge nicht
feststeht.

Die **Lücken sind Absicht**: Sie lassen Platz, später einen Rang dazwischenzusetzen,
ohne alles umzunummerieren. Zwei Nebenbedingungen: Die Zahlen müssen **eindeutig** sein,
sonst entstünde der Gleichstand, den E21 ausschließt. Und sie sind **fest** —
Umsortieren im Spielverlauf braucht es nicht, weil die Sättigung aus E3 den Effekt schon
leistet: Sind die Nahrungsränge gedeckt, wandert die Nachfrage von allein nach oben. Das
ist Engels Gesetz, ohne dass sich eine Reihenfolge ändert.

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
| **Branchenbetrieb** | jeden Tick | Deckung einer Bedarfsstufe (E9) — teilt sich **selbst** zu, von unten nach oben durch die Ränge |
| **Projekt** | einmalig | Kapazität oder Wissen |

Mehr Typen gibt es nicht. Insbesondere sind **Politikfelder kein eigener Typ**:
Bildung ist eine Branche mit Kapazität (Schulgebäude), Verfahren, Inputs und einer
Bedarfsstufe. Was dort jeden Tick Arbeit kostet, sind die Lehrer — laufender
Branchenbetrieb, genau wie Bauern in der Landwirtschaft. Grundschule → weiterführende
Schule → Universität sind Projekte, die Kapazität erzeugen, und irgendwann braucht man
viele Universitäten, genau wie viele Mühlen. „Politikfeld" ist kein Mechanismus,
sondern nur ein **Name für eine Branche, deren Leistung öffentlich bereitgestellt
wird**.

**Ein Projekt ist Arbeit rein, Ergebnis raus.** Genaueres Schema in E13.

Die Trennlinie zwischen beidem ist **Konsumgut vs. Produktionsmittel**: Eine Hütte
deckt einen Bedarfsrang, also ist sie Branchenproduktion und teilt sich selbst zu. Eine
Mühle ist Input für eine Branche, also ist sie ein Projekt. Das trägt bis ans Ende —
Wohnungen bleiben immer Branchenproduktion, auch als Plattenbau.

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

**Sobald Geld existiert, wird Eigentum pro Branche zur Entscheidung.** Bei privatem
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

**Wie oft.** Ein Projekt trägt eine Obergrenze, wie oft es überhaupt ausgeführt werden
darf; fehlt sie, ist es unbegrenzt. „Einmal", „sechsmal" und „beliebig oft" sind
dieselbe Aussage bei verschiedenen Werten.

> *Befund aus der Umsetzung:* Vorher gab es dafür einen Ja/Nein-Schalter, und wo eine
> echte Zahl gebraucht wurde — der Deckel auf die Landnahmen (E13) —, stand sie als
> **Bedingung**. Damit meldete ein verbrauchtes Kontingent eine „fehlende
> Voraussetzung", obwohl nichts fehlte: Es war nur nichts mehr übrig. Drei Dinge waren
> in zwei Feldern vermischt, die getrennt gehören und die der Spieler auch getrennt
> liest:
>
> | | |
> |---|---|
> | **wie oft** es noch geht | ausgeführt 3 von 6 |
> | **wie weit** ein laufendes ist | 42 % |
> | **was fehlt**, um es zu starten | Speicher 1,8 von 2,0 |

**Kosten.** Anfangs nur Arbeit, später zusätzlich Vorleistungen (E4).

**Wirkung.** Vier Typen, ein Projekt kann mehrere haben — und **Wirkungen dürfen
negativ sein**. Eine Flächenumwandlung (E13) ist damit schlicht ein Paar aus einer
negativen und einer positiven Kapazitätswirkung; ein fünfter Typ ist dafür nicht nötig.
Bei Regel-Wirkungen heißt dasselbe, dass sie **ersetzen und abschalten** dürfen — ohne
das könnte kein Hebel je verschwinden, was E1 verlangt (→ E23).

| Typ | Beispiel | Häufigkeit |
|---|---|---|
| **+ Kapazität** | Hütten, Mühle, Universität | ständig |
| **+ Verfahren** | Brache, Pflug (E5) | häufig |
| **+ Branche** | Bildung existiert jetzt, mit eigenen Bedarfsrängen | selten |
| **+ Regel** | Geld existiert · Branchen sind privatisierbar · neuer Hebel | **sehr selten** |

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

**Fläche hat Typen.** Eine Branche verlangt einen bestimmten Typ als Kapazitätsinput (E4):

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
| **Aufforstung** | erschlossene Fläche → Wildnis |
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

**Güte wirkt über die Branchen, nicht über die Fläche.** Für Wohnraum ist eine Fläche
eine Fläche; Bodenqualität beeinflusst den **Ertrag**, und Wohnraum hat keinen. Also
erklärt jede Branche, wie stark die Güte in ihren Ertrag eingeht:

| Branche | Güte wirkt |
|---|---|
| Nahrung | stark |
| Holz | mittel |
| Wohnraum | gar nicht |

Das ist eine Zahl in der Branchenkonfiguration (T3) und ökonomisch das Richtige: Ricardos
Differentialrente handelt von **Ertragsunterschieden**, nicht von einer allgemeinen
Landgüte. Die Güte selbst hängt am **Flächentyp**; werden Typen später gesplittet,
bekommt jeder seine eigene Kurve.

**Sie wirkt auf die Fläche, nicht auf die Arbeit** — `Ertrag = Fläche × Güte ×
Verfahrensertrag`. Schlechter Boden heißt *mehr Fläche für dieselbe Ernte*, nicht mehr
Arbeit je Fläche.

**Es wird keine Einheit behauptet.** Wie bei der Tickdauer (E17) steht nirgends, wieviel
eine Flächeneinheit in der Wirklichkeit ist — und aus demselben Grund: Eine einzige
Größe kann nicht gleichzeitig zum Streifgebiet einer Jägergruppe und zum Ackerbau einer
Industriegesellschaft passen. Beim Durchspielen fiel auf, dass dreißig Sammler rund 165
Einheiten nutzten; als Hektar gelesen wären das 1,65 km² für eine Gruppe, ein bis zwei
Größenordnungen zu dicht. Als Zahl ohne Einheit ist es keine Aussage und damit auch kein
Fehler. Was trägt, sind die **Verhältnisse**. Falls die Oberfläche je eine Einheit
anzeigen will, gehört sie dorthin und nicht in den Kern.

> *Befund aus der Umsetzung:* Andersherum gerechnet macht schlechter Boden die Arbeit
> teurer statt die Fläche knapper — dann wirkt der feste Faktor nicht, und die
> Malthus-Falle schnappt nie zu, egal an welchen Wachstumsraten man dreht.

**Der Deckel ist eine Bedingung am Projekt**, nicht eine eigene Zustandsgröße: Jede
Landnahme bringt eine feste Parzelle, also *ist* eine Höchstzahl an Landnahmen eine
Höchstfläche. Bis dorthin greift die weiche Bremse der fallenden Güte, danach die
harte.

> *Befund aus der Umsetzung:* Solange der Deckel fehlte, lief Landnahme unbegrenzt, und
> die Falle konnte nicht zuschnappen — die Bevölkerung wuchs ohne Grenze.

**Die Grenzgüte steht vor dem Klick da, nicht danach:**

> **Landnahme** — 60 Arbeit
> +20 Wildnis, Güte **0,77** *(dein Durchschnitt: 0,94)*

Der Spieler sieht den abnehmenden Ertrag **am Rand**, bevor er ihn bezahlt — gute
Bedienung und zugleich das ökonomische Konzept: Entscheidungen fallen am Rand, nicht im
Durchschnitt.

**Benannte Vereinfachung:** Dass Wohnraum **guten Ackerboden** verbraucht, bilden wir
nicht ab — Bauen nimmt Fläche durchschnittlicher Güte, weil wir nicht mitschreiben,
welche Parzelle wer nutzt. Der Verlust an gutem Boden ist damit unterschätzt. Auflösbar,
sobald Ackerland und Bauland getrennte Typen mit eigenen Güten sind; das braucht keine
Buchführung über einzelne Parzellen, nur einen zweiten Typ.

### E14 — Startaufstellung

**Fünfzig Menschen auf einem Revier, das sie gerade trägt.** Die Gruppe sitzt *an* der
Tragfähigkeit ihres Landes, nicht weit darunter — das ist die Lage einer
Wildbeutergruppe, und nur so ist ein schlechtes Jahr existentiell, lohnt Vorratshaltung
und entsteht Druck zur Intensivierung. Mit einem Revier, das ein Vielfaches des Bedarfs
hergibt, drückt jahrhundertelang nichts, und dann hat weder der Speicher noch die Rodung
eine Aufgabe.

Beides gehört deshalb zusammen austariert: Fünfzig Menschen brauchen rund 270 Fläche,
und ein Revier von 300 lässt gerade so viel Luft, dass die Gruppe wachsen und ihre
ersten Werkzeuge bauen kann. Gemessen: Bei 180 — richtig für eine Gruppe von dreißig —
lag dieselbe Fünfzigergruppe dauerhaft unter der Sättigung, bekam keine Kinder, konnte
kein Projekt mehr anfangen und stand hundertfünfzig Ticks lang still.

**Drei Branchen**: Nahrung, Wohnraum, Holz. Alle teilen sich selbst zu (E10). Wohnraum
braucht **Holz als Vorleistung**, also zieht das System von allein Arbeit in die
Holzwirtschaft, wenn Rang 2 unterdeckt ist — der Spieler erlebt eine Lieferkette, ohne
eine zu bedienen. *Vorleistungen gibt es zunächst nur für Wohnraum und für Projekte,
nicht flächendeckend; Nahrung braucht weiterhin nur Land und Arbeit.*

**Roden und Holz gewinnen sind zwei Dinge.** Die **Holzwirtschaft** (Branche) gewinnt
laufend Holz aus stehender Wildnis, ohne sie zu verbrauchen; die **Rodung** verwandelt
Wildnis dauerhaft in Ackerland (E13). Wer zu viel rodet, hat Felder und kein Holz.

**Und deshalb gibt es die Aufforstung von Anfang an.** Sie ist der Rückweg: Ackerland
wird wieder Wildnis, wenig Arbeit, aber sehr langsam — eine Entscheidung, kein
Naturvorgang. Ohne sie ist die Entwaldung eine Einbahnstraße, und das verstößt gegen
E20 (kein Zustand ohne Rückweg): Gemessen blutete eine Siedlung von 1774 Menschen über
sechshundert Ticks aus, bei durchgehend gedecktem Hunger — es fehlte schlicht Holz für
Häuser, weil die Rodung die Wildnis aufgezehrt hatte. Historisch ist das die Nieder- und
Hauberg-Wirtschaft: Wald, den man neben dem Acker bewusst vorhält, statt ihn übrig zu
lassen.

Übernutzung und natürliche Nachwuchsraten kommen später. Daraus entsteht die erste sichtbare Zielkonkurrenz, und der Spieler sieht
seine Entscheidung in der Welt statt nur in Zahlen.

**Drei Projektstränge**, deren erster Schritt jeweils sofort machbar ist, alle ohne
Geld begehbar:

| Nahrung | Wohnraum | Holz |
|---|---|---|
| Brache | Fachwerk | Bessere Äxte |
| ↳ Pflug *(braucht Holz)* | ↳ Ziegel *(neuer Branche Lehm)* | ↳ Forstwirtschaft |
| ↳ Wassermühle *(+ Mühle bauen)* | | |

Dazu **Rodung** und **Landnahme** als dauerhaft wiederholbare Projekte (E13).

Leitsatz für die Dosierung: **Projekte sind der Spaß, Branchen sind die Leserei.** Ein
Projekt mehr ist eine Entscheidung mehr; eine Branche mehr ist eine Tabellenzeile mehr,
die verstanden werden muss, bevor irgendetwas entschieden werden darf. Also viele
kleinteilige Projekte von Anfang an, drei Branchen am Anfang, weitere langsam.

Der Reiz der ersten halben Stunde entsteht daraus, dass **der Engpass wandert**: Erst
fehlt Nahrung → roden. Dann fehlt Wohnraum → mehr Holz. Dann fehlt Wald, weil zu viel
gerodet wurde → Forstwirtschaft oder Ziegel. Dann fehlt Ackerland, weil der Wald
geschont wird → Brache statt Rodung. Das ist E6 in klein, viermal, jedes Mal
mit einer anderen Antwort.

*Wackelkandidat:* **Ziegel** bringt einen vierten Branche sehr früh. Bleibt vorerst
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

**Die Arbeitsbilanz muss aufgehen — geprüft, nicht behauptet:**

```
Arbeitsleistung  =  Verfahren  +  Projekte  +  frei
```

Das ist eine Invariante und steht als Test. Der Test, der vorher dort stand, verglich
die Arbeitsleistung mit einer Zahl, die aus ihr selbst abgeleitet war, und konnte
deshalb gar nicht scheitern. Er hielt still, während die Anzeige im selben Tick
„Arbeit bindet" und „1,8 frei" behauptete: Was der Plan für Projekte herstellte,
verbrauchte kein Verfahren — also wurde es zusätzlich als frei gezählt. Auch das
Kriterium für E10 (ungenutzte Arbeit verfällt, also darf sie nicht massenhaft
brachliegen) misst genau diese Zahl und maß sie falsch.

Eine Bilanz, die aufgehen muss, gehört als Invariante geprüft — sonst trägt eine
Anzeige den Fehler über Sitzungen.

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
| **Verfahren** (E5) | den Ertrag je Arbeitsleistung **in einer Branche** | Brache, bessere Äxte, Wassermühle |

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

**Die Mindestdauer ist das Höchsttempo, keine Bedingung.** Je Tick *kann* ein Projekt
*Kosten geteilt durch diese Tickzahl* von jeder Ressource aufnehmen. Steht weniger zur
Verfügung, nimmt es, was da ist, und kommt entsprechend langsamer voran — das Tempo
setzt die knappste seiner Ressourcen, und genau dieser Anteil wird von **jeder**
genommen. So laufen sie weiter im Gleichschritt, und ein Projekt kann **länger** dauern
als seine Mindestdauer, nie kürzer.

> *Befund aus der Umsetzung:* Vorher war es alles oder nichts — wer weniger als seinen
> vollen Tickanteil bekam, nahm gar nichts. Beim Durchspielen wurden dadurch 6 von 7,5
> Arbeitseinheiten hergestellt und **weggeworfen**, während der Fortschrittsbalken
> stehenblieb.

**„Projekte werden zuerst finanziert" ist ein Rang, keine Phase.** Ein Projekt ist ein
Verbraucher von Arbeit und Beständen wie jeder andere; es geht als Nachfrage in
dieselbe Planung wie die Bedürfnisse (E9 — die Rangfolge der Bedürfnisse), nicht in
eine eigene Phase davor.

**Und der Rang ist eine Zahl, die das Projekt trägt — vom Spieler gesetzt.** Jedes
Projekt einzeln: Für einen Speicher geht man vielleicht hungern, für ein Denkmal nicht.
Die Voreinstellung steht im Inhalt und liegt über allen Bedürfnissen, also bleibt die
alte Regel der Normalfall; der Spieler senkt sie für alles, wofür er nicht hungern will.
Im Kern ist es eine freie Zahl, damit jede Stellung ausdrückbar ist; was die Oberfläche
davon anbietet — freie Wahl oder ein paar benannte Plätze —, entscheidet die Hülle (T1).

Der Grund für diese Form ist gemessen. Steht ein Projekt **fest** über allem, ist es
eine Falle statt einer Entscheidung: Seine Kosten sind absolut, also wächst ihr Anteil,
während eine Siedlung schrumpft. Im Spiel gingen sechzig Ticks nach dem Start 8 von 9
verbliebenen Arbeitseinheiten ins Projekt und 2 in die Nahrung; die Siedlung starb an
einer Verpflichtung aus besseren Zeiten, ohne dass irgendetwas den Moment markiert
hätte, an dem sie untragbar wurde. Steht es dagegen **fest** unter dem Überleben,
verschwindet die Falle — aber mit ihr die Entscheidung: Der Zeitpunkt spielt dann kaum
noch eine Rolle, weil das Modell den Spieler ohnehin schützt.

Als Zahl am Projekt ist die Gefahr **gewählt** statt verborgen, und der Zeitpunkt zählt
wieder. Gemessen: Wer die Voreinstellung stehen lässt, stirbt in 100 % der Läufe; wer
seine Projekte knapp unter das Überleben setzt, stirbt nicht mehr an ihnen. Pausieren
bleibt daneben das, was es sein soll — ein Mittel, kein Pflichtprogramm.

Das war vorher anders und war ein Sonderweg, der nur deshalb nicht auffiel, weil
Arbeit selbst einer war: Eine eigene Projektphase zog die Arbeit oben ab, und der Plan
sah diesen Anspruch nie. Als Rang gewinnt man zweierlei: Der Spieler kann der
Bedarfsdeckung weiterhin Arbeit entziehen (E10 — Arbeit fließt in Bedarf oder in
Projekte), und ein Projekt, das Holz kostet, funktioniert von selbst richtig, weil der
Plan die Holzbeschaffung mitplant. Vorher hätte man das eigens bauen müssen.

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

**Verfall ist Verderb und Abnutzung — nicht Verbrauch.** Das eine hängt am *Bestand*,
das andere an den *Köpfen*. Brot wird gegessen, ein Dach wird bewohnt; die Verfallsrate
kann den Durchfluss durch einen Bestand nicht abbilden, weil sie mit dem Lager skaliert
und nicht mit den Menschen.

Deshalb trägt jede **Bedarfsstufe** (E9) einen Anteil, der in der Nutzung aufgebraucht
wird: Nahrung 1, Wohnraum 0. Das ist eine Eigenschaft der **Bedarfsbeziehung**, nicht
der Branche.

> *Befund aus der Umsetzung:* Ohne diese Trennung wurde Nahrung nie gegessen. Der
> Verbrauch ließ sich nur über die Verfallsrate nachbilden — und dann „aß" die Siedlung
> einen festen Anteil ihres Lagers, gleichgültig wie viele Menschen es waren. Die
> Aussage weiter unten unter *Verworfen*, ein Haus sei einfach langsamer Verfall, gilt
> deshalb nur für die **Haltbarkeit**, nicht für den Durchfluss.

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

**Keine harten Speichergrenzen.** Halten kostet — der Verfall ist proportional zum
Bestand, ein Vorrat von 400 kostet bei 5 % zwanzig Einheiten je Tick. Daraus folgt von
allein ein Gleichgewicht: Der Vorrat wächst nur so lange, wie der Überschuss die
Verluste übersteigt. Ein Deckel ist dafür nicht nötig, und es ist auch der historische
Grund, warum Vorräte begrenzt waren — nicht fehlender Platz, sondern Verderb.

**Ein Speicher ist deshalb kein Behälter mit Fassungsvermögen, sondern Kapazität, die
die Verfallsrate für die gedeckte Menge senkt** (Lagerverfahren, E5). Grenzen sind damit
immer **wirtschaftlich** und nie willkürlich; es gibt nirgends ein „Lager voll". Und
damit ist ein Puffer nicht kostenlos, was die Voraussetzung dafür ist, dass
Vorratshaltung überhaupt eine Abwägung sein kann.

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

**Die Schwelle liegt bei 25, die Startgruppe bei 50.** Der Anker sind Birdsells „magic
numbers": Eine Bande von rund 25 ist die kleinste, die sich selbst trägt — darunter muss
eine Gruppe in einer anderen aufgehen oder sie verschwindet. Und aus einer zu kleinen
Gruppe erholt sich nichts mehr, also muss der Lauf **davor** enden und nicht erst, wenn
niemand mehr da ist.

**Die Aufgabe steht im Zustand, und danach steht die Uhr.** Der Tick, an dem es geschah,
wird festgehalten; von da an gibt es keinen nächsten Tick mehr — auch keinen leeren, die
Tickzahl bleibt stehen. Was daraus wird, entscheidet die Hülle: Abschlussbildschirm,
Verlauf, neu anfangen. Das ist Darstellung und Steuerfluss und gehört nach T1 dorthin.

Zwei Gründe, warum es nicht bei einer Ableitung bleiben konnte. Es ist **Geschichte** und
kein Vergleich (E22): „bei Tick 340 aufgegeben" bleibt wahr, `Köpfe < Mindestgröße`
könnte aufhören, es zu sein. Und eine Regel, die sich jeder Verbraucher selbst merken
muss, wird vergessen — gemessen an uns selbst: Bots, Kriterien und Messskripte rechneten
allesamt über die Grenze hinaus weiter, bis rechnerisch Zehntelmenschen übrig waren. Im
Kern festgehalten hört die Welt für alle zugleich auf, ohne dass es irgendwer wissen muss.

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
zu genau einer Branche. Zwei Ansprüche können nie gleichauf liegen.

**Nichts davon wird gespeichert.** Die Zuteilung ist eine Rechnung innerhalb des Ticks,
aus dem vorigen Zustand und der Konfiguration. Sie hinterlässt nur ihre Ergebnisse —
Bestände, Fortschritt der Projekte.

**Die gemessene Grenze dieses Verfahrens: geteilte Kapazitäten kann es nicht abwägen.**

Ein Lauf nach 900 Ticks: 213 Menschen, die Wildnis zu 100 % genutzt, **560 ha
Ackerland zu 11 % genutzt**, 49 Arbeitseinheiten frei — und trotzdem Wärme bei 0,69 und
Wohnraum bei 0,00.

Der Grund: Rang 100 wird zuerst gedeckt, und die Jagd ist arbeitsergiebiger als der
Ackerbau. Sie nimmt sich die **Wildnis**. Die Holzwirtschaft, die dieselbe Wildnis
braucht, findet danach nur Reste — obwohl daneben Ackerland brachliegt, auf dem die
Nahrung ebenso hätte wachsen können.

Eine wirkliche Gesellschaft würde hier mehr ackern und weniger jagen, um Wald für
Brennholz freizugeben. Rang für Rang vorzugehen kann das nicht: Beim Decken von Rang 100
ist nicht bekannt, dass Rang 150 dieselbe Fläche braucht.

**Die Ursache liegt nicht in der Rangliste.** Zwei Dinge waren vermischt:

- **Wer zuerst bedient wird**, wenn es nicht reicht — das *soll* fest sein (E9).
- **Womit produziert wird** — das darf **nicht** Rang für Rang entschieden werden, weil
  Verfahren um dieselben Kapazitäten konkurrieren.

Rang 100 wählte sein Verfahren, bevor überhaupt bekannt war, dass Rang 150 dieselbe
Fläche braucht. Die Rangliste bestimmt, wer zuerst bekommt — sie darf nicht bestimmen,
wie produziert wird.

**Richtung der Lösung: erst gemeinsam planen, dann nach Rang rationieren.** Der Bedarf
aller Ränge wird zusammen geplant — dabei sieht die Zuteilung die Konkurrenz um die
Wildnis —, und reicht es nicht, fällt der höchste Rang und es wird neu geplant. Die
Rangliste bleibt unverändert; nur wird geplant, **bevor** rationiert wird.

Das ist auch das Wirklichkeitsnähere: Ein bäuerlicher Haushalt plant sein Jahr im
Ganzen — Brot, Feuer, Dach — und teilt die Hände danach ein. Er plant nicht erst das
Brot in Unkenntnis des Feuers. Anker: **Tschajanow** zum bäuerlichen Haushalt,
**Simons** Anspruchsniveau-Suche für „reicht es? nein, eine Stufe tiefer".

**Und das ist keine Planwirtschaft.** Es gibt zurzeit *einen* Haushaltssektor; die
Siedlung ist eine wirtschaftliche Einheit, und ein Haushalt, der sein eigenes Jahr
plant, plant für niemanden sonst. Planwirtschaft wäre es erst, für **viele unabhängige
Einheiten** zu planen — und genau daran scheitert sie, aus Informationsgründen.

> **Damit steht der ehrliche Engpass für Preise fest, und er liegt woanders als hier
> zunächst vermutet.** Nicht „die Zuteilung rechnet schlecht" — das ist ein
> Planungsfehler und ohne jedes Geld behebbar. Sondern: **Sobald der Haushaltssektor
> sich aufteilt, gibt es keinen gemeinsamen Plan mehr, den jemand machen könnte.** Viele
> Einheiten entscheiden je für sich, und was sie koordiniert, sind Preise. Das passt zu
> E1: Der Spieler verliert die Planung nicht, weil man sie ihm nimmt, sondern weil es
> nichts mehr zu planen gibt.

**Der Planungsalgorithmus.** Das Ergebnis eines Plans ist ein Vektor von
**Aktivitätsniveaus** — wie viel auf jedem Verfahren läuft. Arbeit und Kapazitäten sind
Nebenbedingungen, nicht Ergebnis; ein Niveau von null heißt „läuft nicht". Das ist die
Aktivitätsanalyse, auf die sich E5 ohnehin beruft.

```
1. Bedarf aller Ränge zusammen als Ziel
2. je Verfahren die geforderte Menge je Input, begrenzt durch das Ziel
3. für jeden Input:
     Summe passt          → weiter
     Summe passt nicht    → Überhang verlagern, beginnend bei der
                            Verlagerung, die am meisten VON DIESEM Input
                            freimacht; genau so viel, bis es passt
4. eine Verlagerung erzeugt Bedarf auf einem anderen Input
   → dieser wird in derselben Runde erneut geprüft
5. bleibt Ungedecktes → höchsten Rang streichen, ab 1
```

**Verglichen wird immer nur innerhalb eines Inputs.** Der Konflikt entsteht dort — die
Wildnis reicht nicht —, also muss auch nur entschieden werden, wer von der Wildnis
weicht, und das ist in Einheiten Wildnis messbar. **Kein Maßstab über Inputs hinweg, keine
Gewichte, keine Schattenpreise.** Arbeit ist dabei kein Sonderfall, sondern ein Input wie
jeder andere.

**Die Arbeitskosten einer Umstellung gehen nicht ein**, weil ungenutzte Arbeit nach E10
ohnehin verfällt: Ein Bedürfnis zu decken schlägt das Sparen von Arbeit, solange die
Arbeit da ist. Fehlt sie, scheitert die Verlagerung an ihrer eigenen Grenze und es wird
nach Rang rationiert.

**Abbruch: Eine Nachfrage darf ein Verfahren nur einmal verlassen und kehrt nie
zurück.** Damit ist die Zahl der Verlagerungen durch `Verfahren × Ränge` beschränkt und
der Durchgang endet garantiert — ohne Schwelle, ohne Glättung.

**Das Ergebnis ist ein gangbarer Plan, kein bestmöglicher.** Ein Optimum bräuchte einen
Löser, und der scheitert an drei Dingen: eine Abhängigkeit oder mehrere hundert Zeilen
Simplex; Toleranzen für Rundungsfehler, die E26 ausdrücklich ausschließt; und vor allem
Undurchsichtigkeit — E5 verlangt, dass die Begründung sichtbar ist, und „weil das Optimum
es so ergibt" kann man niemandem zeigen. Rechenzeit ist **nicht** der Grund: beides ist
bei unseren Größen billig.

Dass der Plan nicht optimal ist, ist zugleich ein Gewinn: **Ein Verschiebeverfahren
findet eine Lösung, ein Preis findet die beste.** Wäre schon hier optimiert, hätten
Preise später nichts mehr zu holen.

**Beim Bauen korrigiert.** Schritt 5 oben — „bleibt Ungedecktes → höchsten Rang
streichen" — war zu grob, und zwar in zwei Punkten. Beide fielen sofort auf: Die
Siedlung starb in **100 %** der Läufe.

- **Der Grenzrang wird zum Teil bedient, nicht ganz gestrichen.** Ein Rang, der zu 90 %
  ginge, bekam nichts, und die Ränge darunter saßen auf ungenutzter Arbeit — gemessen:
  Nahrung/Überleben gedeckt, Sättigung bei 0, bei 7,9 freien Arbeitseinheiten.
  Rationieren heißt einen kleineren Anteil, nicht keinen. Der größte Anteil, der noch
  passt, wird durch Halbieren gesucht; da der Anteil in [0, 1] liegt, genügt eine feste
  Zahl Schritte, und es ist keine Toleranz zu stellen (E26).
- **Und dass ein Rang *teilweise* bedient wird, ist ein Aggregationsbehelf.** Es bildet
  nicht die Entscheidung eines Haushalts nach, sondern die **Verteilung vieler**. In
  Wirklichkeit wurde der Übergang von der Jagd zum Ackerbau allmählich, weil viele
  Haushalte zu verschiedenen Zeitpunkten umstellten — die auf dem schlechtesten Boden
  zuerst. Die sanfte Aggregatkurve ist die Verteilung vieler Umschaltzeitpunkte, nicht
  die sanfte Umstellung irgendeines Einzelnen; niemand hat je „zu 37 % Dreifelderwirtschaft"
  betrieben.

  Wir haben **einen** Haushaltssektor, der keine Verteilung hat. Also muss jede
  Allmählichkeit von der Regel hergestellt werden. Das ist vertretbar, solange es hier
  steht — und es ist die Stelle, an der eine spätere Aufteilung in Schichten oder
  Halter den Behelf ersetzen würde, weil die Verteilung dann aus dem Modell käme statt
  aus der Zuteilung.
- **Ein gescheiterter Rang stoppt die niedrigeren nicht.** Ein Rang, den der Wald
  aufhält, hält keinen Rang auf, der an der Wildnis hängt. Die Rangfolge entscheidet,
  wer einen *umstrittenen* Input zuerst bekommt — nicht, dass darunter alles leer
  ausgeht. Gemessen bei der Sesshaftigkeit: Wohnraum 0 **und** Sättigung 0, bei 45
  freien Arbeitseinheiten.

**Zwischenprodukte sind kein fester Vorrat.** Der Plan rechnete Holz gegen den
*Bestand* an Holz. Der ist fast immer null, weil Holz im selben Tick geschlagen und
verbaut wird — also war Wohnraum bei jedem Anteil unmöglich, und es wurde nie ein Haus
gebaut. Ein Bestand wird nicht nur entnommen, er wird auch hergestellt: Ein Input, den
der Plan selbst erzeugt, zählt **netto** (E4). Beim Ausführen folgt daraus die
Reihenfolge — wer herstellt, läuft vor dem, der verbraucht.

**Schritt 4 stand da und war nicht gebaut.** „Eine Verlagerung erzeugt Bedarf auf einem
anderen Input → dieser wird in derselben Runde erneut geprüft" — ich hatte den *Input*
erneut geprüft, aber den **abgeleiteten Bedarf** nur einmal zu Beginn gerechnet.

Die Folge war messbar und groß: Verlagert der Plan Nahrung von der Jagd auf den
Ackerbau, kostet das mehr Arbeit je Einheit. Diese Mehrarbeit galt dann als Fehlbetrag
statt als einzuplanende Arbeit, und weil eine Nachfrage nicht zur Jagd zurückkehren
darf, fand die Verlagerung keinen Ausweg und der ganze Rang fiel. Gemessen bei Tick
300: Wildnis zu 100 % genutzt, **490 Ackerland zu 0,003 %**, 173 von 355
Arbeitseinheiten frei, Sättigung 0.

Richtig ist **eine** Schleife: den eigenen Bedarf decken, einen Input suchen, der nicht
passt, Nachfrage von ihm wegschieben — und von vorn, weil das Schieben anderswo Bedarf
erzeugt hat.

**Abgeleiteter Bedarf gehört in den Planer, gegen die Niveaus selbst.** Außerhalb
geschätzt verfehlt er sie um einen Rundungsfehler, und ein Rundungsfehler liest sich
als Fehlbetrag — E26 (Tests prüfen Mechanik, keine Toleranzen) verbietet, ihn
wegzuglätten. Gemessen: 0,07 Arbeitseinheiten Abweichung schnitten den Plan auf null
zusammen, und *alle* Siedlungen starben.

**Eine Endnachfrage zählt im Nettoverbrauch mit.** Der Nettoverbrauch eines Bestands
ist Verbrauch durch Verfahren **plus Endnachfrage** minus Herstellung. Fehlt der
mittlere Teil, wird die für einen Anspruch geplante Produktion ein zweites Mal
vergeben. Das war der Grund, warum Projekte nie Arbeit bekamen: Die für sie geplante
Arbeit deckte den Bedarf des Sammelns, und `better_tools` stand nach 900 Ticks bei
Fortschritt 0.

**Hersteller vor Verbrauchern braucht eine echte topologische Sortierung.** Ein
paarweiser Vergleich reicht bei zwei Stufen und ordnet bei drei — Arbeit → Holz →
Haus — falsch.

**Die Rechenzeit wächst mit der Zahl der Verfahren, und das ist die Größe, die
wachsen soll.** Gemessen wurde deshalb nicht der heutige Wert, sondern die
Wachstumsordnung: mit künstlichen Verfahren, die Fläche gegen Arbeit tauschen und
einander daher nicht dominieren — der teure Fall, nicht der billige.

| Verfahren | vorher | nachher |
|---:|---:|---:|
| 9 | 0,30 ms | 0,32 ms |
| 30 | 3,32 ms | 1,18 ms |
| 60 | 26,7 ms | 2,65 ms |
| 110 | 226,7 ms | 6,43 ms |

Vorher kostete eine Verdopplung der Verfahrenszahl etwa das Achtfache — kubisch. Der
Grund lag **nicht** im Planer, sondern in der Reihenfolge nach Dominanz (E5): Aus den
verbliebenen Verfahren in jeder Runde neu die nicht dominierten zu suchen sind *n*
Runden mal *n²* Vergleiche, und jeder Vergleich baute seine Schlüsselmengen und die
Risikobereinigung neu auf. Die Beziehung einmal aufzustellen und dann je Verfahren zu
zählen, wie viele es noch dominieren, macht daraus *n²*; die Koeffizienten einmal je
Verfahren zu rechnen nimmt den Rest. Gemessener Exponent danach rund 1,3.

In der Zeit ist es linear und war es immer — 3200 Ticks kosten je Tick nicht mehr als
200.

**Die Welt steht still, während ein Plan gemacht wird.** Welche Inputs es gibt, wer was
herstellen kann, wieviel ein Verfahren je Einheit braucht, wieviel von einem Input da
ist: Das folgt aus den freigeschalteten Verfahren, der Flächenqualität und den Schocks
dieses Ticks, und keines davon ändert sich beim Planen. Es einmal statt zehntausendfach
je Tick zu rechnen ist deshalb keine Näherung, sondern dieselbe Zahl — belegt durch ein
bitgleiches Ergebnis über alle Kriterien. Gemessen 3,70 → 0,73 ms je Tick, Faktor 5,1.
Wichtiger als der Faktor ist die Wachstumsordnung: Die quadratische Stelle (Filtern der
Reihenfolge mit verschachtelter Suche) und die multiplikative (Koeffizient je Frage neu)
sind draußen, es bleibt eine Schleife über die laufenden Verfahren.

**Verglichen wird auf Kettenkoeffizienten, nicht auf direkten.** Wieviel von einem
Input ein Verfahren kostet, heißt: sein eigener Verbrauch **plus** das, was seine
Vorleistungen davon verbrauchen (Leontief). Auf direkten Koeffizienten zu vergleichen
war falsch und fiel erst auf, seit Arbeit ein gewöhnlicher Input ist (E4): Ein Feld
benutzt die Köpfe nicht mehr direkt, es benutzt Arbeit, und Arbeit benutzt die Köpfe.
Nach den direkten Kosten gefragt, antwortete der Ackerbau „null Köpfe" — also erzeugte
Arbeitsknappheit **gar keinen** Verlagerungszug, während Landknappheit einen erzeugte.
Gemessen: Arbeit voll ausgelastet, Land brach, und das arbeitssparende Verfahren kam
nie zum Zug. Die Mengen laufen durch die Kette, seit es abgeleitete Nachfrage gibt; die
Entscheidung über diese Mengen muss dieselbe Kette sehen.

**Der eigene Bedarf wird genau gedeckt, in beide Richtungen.** Nur zu erhöhen genügt
nicht: Nach einer Verlagerung auf ein Verfahren, das weniger Arbeit braucht, blieb die
schon eingeplante Arbeitsproduktion stehen. Der Überhang verschwand dadurch nie, die
Verlagerung galt als fruchtlos, und der ganze Rang fiel — gemessen blieb er über
mehrere Durchgänge bei exakt demselben Wert stehen.

**Der gemessene Defekt ist behoben.** Derselbe Lauf nach 900 Ticks: Ackerland **11 % →
100 %** genutzt, Wohnraum **0,00 → 0,84**, Bevölkerung **213 → 1707**. Alle acht
Kriterien bestehen; T4 (Entscheidungen zählen) von zuvor gescheitert auf Faktor 7,3.
Dass am Ende beide Flächen zu 100 % genutzt sind, ein Teil der Arbeit aber frei bleibt
und die Sättigung bei 0 liegt, ist kein Fehler mehr, sondern Malthus: Das Land bindet,
die Arbeit ist im Überschuss (E7).

### E22 — Was im Zustand steht

Regel: **gespeichert wird nur, was Geschichte hat.** Alles Berechenbare wird jeden Tick
neu gerechnet und nirgends abgelegt. Das hält den Spielstand klein (T7) und verhindert,
dass zwei Stellen dasselbe behaupten und auseinanderlaufen.

**Gespeichert — acht Dinge:**

| | |
|---|---|
| **Tickzähler** | |
| **Zufallszustand** | Hauptseed plus je Strom ein Zählerstand (E25); nie ein globaler Generator |
| **Bestände** | eine Zahl je Bestand: Bevölkerung, Nahrung, Wohnraum, Holz — dazu eine je Flächentyp (E13), anfangs Wildnis und erschlossene Fläche |
| **Zahl der Landnahmen** | daraus wird die Güte gerechnet (E13) |
| **Produktivität** | mitgeführt |
| **Arbeitsfähigkeit** | mitgeführt |
| **Erledigte Projekte** | je Kennung, wie oft — und daran misst sich die Obergrenze aus E12 |
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

### E23 — Was eine Epoche ist

**Eine Epoche ist kein Mechanismus, sondern ein abgeleiteter Name.**

Was existiert, sind erledigte **Institutionsprojekte**. Eine neue Epoche beginnt, wenn
ein bestimmtes Projekt fertig wird — und das ist genau die **Regel-Wirkung**, die E12
schon vorsieht, keine zusätzliche Maschinerie. Alles, was eine Epoche bringt, ist damit
bereits ausdrückbar:

| Was die Epoche bringt | Wirkungstyp aus E12 |
|---|---|
| Neue Branchen | + Branche |
| Neue Verfahren | + Verfahren |
| Mehr erreichbares Gebiet | + Kapazität (E13) |
| Neue Regeln und Hebel | + Regel |

**Kein Epochenzähler im Zustand.** Wo die Oberfläche „Frühstaat" schreiben soll, ergibt
sich das aus den erledigten Projekten — wie das erreichbare Gebiet in E13, das aus
demselben Grund nicht gespeichert wird.

**Regeln sind Schalter, die die Phasen lesen.** „+ Regel" heißt: Ein Projekt setzt einen
Schalter, und die Phasen aus T2 verhalten sich danach. Weil Schalter aus erledigten
Projekten folgen, kommt auch dafür nichts Neues in den Zustand.

**Regel-Wirkungen dürfen ersetzen und abschalten, nicht nur hinzufügen.** E1 verspricht,
dass Hebel verschwinden: Sobald Lohnarbeit kommt, hört „Arbeit direkt zuteilen" auf zu
funktionieren. Bei Kapazitätswirkungen ist geklärt, dass sie negativ sein dürfen (E12);
für Regeln stand es nirgends — und ohne es kann kein Hebel je verschwinden. Es ist die
Voraussetzung dafür, dass E1 überhaupt umsetzbar ist.

**Folge für alles Weitere:** Epochen brauchen im Modell gar nichts. Preise,
Privatisierung, Banken und Außenhandel müssen sich nicht in ein Epochensystem
einpassen, sondern nur in Projektwirkungen und Schalter.

### E24 — Schwankung

**Die Jahresgüte** — eine Zahl je Tick mit Mittelwert 1, auf die jedes **Verfahren** mit
seiner **eigenen Empfindlichkeit** reagiert:

| Verfahren | Empfindlichkeit |
|---|---|
| Sammeln | hoch |
| Ackerbau, trocken | hoch |
| Ackerbau, bewässert | gering |
| Waldwirtschaft | gering |
| Bau | keine |

Ein gemeinsamer Wurf statt einer je Branche, weil **Wetter gemeinsam ist**: Ein schlechtes
Jahr trifft Acker und Waldwirtschaft zusammen, nur unterschiedlich stark. Bei
unabhängigen Würfen wäre genau das unmöglich. Nebenbei ergibt es eine lesbare Zahl („ein
schlechtes Jahr") statt eines Bündels unsichtbarer Störungen.

**Risiko ist nicht nur Wetter.** Ein Verfahren erklärt seine **Aussetzung je
Zufallsstrom** (E25), nicht eine einzelne Wetterempfindlichkeit:

```
{ weather: 0.7 }                 trockener Acker
{ weather: 0.2 }                 bewässerter Acker
{ weather: 0.1, disease: 0.6 }   Monokultur
{ foreign: 0.8 }                 Produktion für den Export
```

Erst damit wird der Satz aus E25 wirksam, dass Gleichlauf eine Entwurfsentscheidung ist:
Zwei Verfahren am selben Strom brechen **gemeinsam** ein, und ein Verfahren, das auf
einen anderen Strom ausweicht, ist eine echte **Streuung** des Risikos — nicht bloß ein
niedrigerer Wert. Das ist der Unterschied zwischen einer widerstandsfähigeren und einer
anderen Sorte.

Der Risikoabschlag in der Verfahrensordnung (E5) summiert über alle Ströme, die ein
Verfahren berührt.

**Die Aussetzung gehört zum Verfahren, nicht zur Branche.** Bewässerter und
trockener Acker sind dieselbe Branche mit sehr verschiedener Wetterabhängigkeit — später
genauso Gewächshaus gegen Freiland. An der Branche festgemacht wäre Bewässerung nicht
darstellbar. Sie ist reine Konfiguration (T3), wie die Branchenmerkmale in E3.

**Sie wirkt nur auf Erträge, nicht auf den Verfall.** Gegen schwankenden Verfall plant
niemand — es wäre Rauschen ohne Entscheidung, und Rauschen verdeckt in einem Lehrspiel,
ob eine Entscheidung gewirkt hat. Angewandt wird sie multiplikativ in der
Produktionsphase.

**Die Verteilung hat einen langen linken Rand:** Mittelwert 1, eine Obergrenze, seltene
starke Ausfälle nach unten. Das ist die empirisch richtige Form — Ernten haben eine
biologische Obergrenze, aber nach unten kein Gegenstück; es gibt Missernten, aber keine
Ernten mit dreifachem Ertrag. Eine symmetrische Streuung wäre die unrealistischere Wahl.

Daraus folgt: **kein zweiter Mechanismus für Missernten.** Eine Missernte ist der linke
Rand derselben Verteilung, kein eigenes Ereignissystem. Die genaue Kurve ist Balancing.

**Der Erwartungswert bleibt unberührt.** Die Streuung verschiebt den konfigurierten
Mittelwert nicht — damit bleibt er die Zahl, an der gedreht wird, und die Streuung ist ein
zweiter, unabhängiger Regler.

Trotzdem wird das Spiel **härter, nicht nur unruhiger**, und darin liegt der ökonomische
Gehalt: **Verhungern ist nicht symmetrisch.** Eine schlechte Ernte kann Menschen töten,
eine gute macht sie nicht doppelt lebendig. Bei gleichem Mittelwert ist mehr Streuung
strikt schlechter. Genau das ist der Wert eines Puffers — und nach E19 kostet der etwas.
Erst damit ist Vorratshaltung eine Abwägung statt einer Formalität.

### E25 — Benannte Zufallsströme

Ein **Hauptseed**, daraus mehrere unabhängige Ströme:

| Strom | Wofür |
|---|---|
| `weather` | Jahresgüte für die inländische Produktion (E24) |
| `events` | zufällige Ereignisse |
| `foreign` | Weltmarktpreise, Wechselkurs |

Der Zustand trägt den Hauptseed und **je Strom einen Zählerstand**:

```
random: { seed, draws: { weather: 47, events: 3 } }
```

Gezogen wird aus `hash(seed, stromname, zähler)` — unabhängige Ströme bei einem einzigen
Seed.

**Je Strom ein eigener Zähler, und das ist nicht Ordnungsliebe:** Ein neuer Strom darf die
bestehenden nicht verschieben. Bei einem gemeinsamen Zähler würde jedes zusätzliche
Ziehen — etwa wenn Ereignisse dazukommen — die ganze Wetterfolge verändern; jeder
Balance-Lauf, jeder Spielstand und jeder Test verhielte sich anders, ohne dass eine Zahl
angefasst wurde. Mit getrennten Zählern ist ein neuer Strom vollständig isoliert und
sogar rückwärtskompatibel: Ein fehlender Zählerstand bedeutet „nie gezogen", also braucht
es nicht einmal eine Migration nach T7.

**Gleichlauf ist eine Entwurfsentscheidung, kein Zufall.** Zwei Dinge schwanken nur dann
gemeinsam, wenn sie ausdrücklich denselben Strom benutzen. Der Wechselkurs darf nicht an
der Getreideernte hängen.

Die Regel aus T1 bleibt: kein `Math.random` in der Simulation, nur der gesäte Generator
im Zustand. Der Linter prüft es.

### E26 — Tests prüfen Mechanik, nicht Balance

Mit dem Seed im Zustand ist `tick` eine reine Funktion. **Keine Toleranzen, keine
Bandbreiten** — Toleranzen wären das Eingeständnis, den Zufall nicht zu kontrollieren.
Getestet wird zweierlei:

**Invarianten**, für jeden Seed und jeden Zustand: Fläche summiert sich auf das Gebiet,
zugeteilte Arbeit übersteigt nie das Angebot, Deckung liegt in [0, 1], kein Bestand wird
negativ, Verfall vermehrt nie. Sie überleben jede Zahlenänderung.

**Mechanik**: *Fehlt Holz, pausiert das Projekt und verbraucht nichts.* *Reicht das Silo
nicht, verfällt der Überhang mit der höheren Rate.* *Ist ein Rang durch Fläche begrenzt,
wandert Arbeit zum nächsten.*

**Vermieden werden Momentaufnahmen** wie „nach 100 Ticks ist die Bevölkerung 34,217".
Deterministisch, aber sie brechen bei jeder Balance-Änderung und sagen nichts über die
Absicht.

### E27 — Balancing ist eine Messung

**Derselbe Seed macht Vergleiche exakt:** Zwei Läufe unterscheiden sich ausschließlich
durch die geänderte Zahl, die Würfe fallen identisch.

**Viele Seeds machen sie belastbar:** Eine Balance, die bei Seed 42 trägt, kann bei Seed 7
scheitern. Bei Sekundenbruchteilen je Lauf sind hundert Seeds kostenlos.

Geprüft wird gegen Kriterien, die sich aus den Festlegungen ergeben — Zahlen aus einem
Lauf, keine Eindrücke:

| Kriterium | Woher |
|---|---|
| Wechselt der bindende Input im Verlauf? | E6 |
| Beißt die Malthus-Falle und lässt wieder los? | E7, E20 |
| Wird Intensivierung irgendwann besser als Expansion? | E6, E13 |
| Kommt eine passive Strategie genauso weit wie eine aktive? | T4 |
| **Kommt schlechtes Spiel genauso weit wie gutes?** | T4 |
| Gibt es Zustände ohne Weg zurück? | E20 |

**Der Komfort ist der Puffer, und er muss der richtige sein.** Hunger 1,2 und Sättigung
0,6 je Kopf heißt: Ein Drittel des Nahrungsbedarfs ist entbehrlich. Ein schlechtes Jahr
frisst zuerst diesen Teil, und erst wenn es mehr nimmt, sterben Menschen.

Gemessen bei 1,0 gegen 0,8 — also 44 % entbehrlich — war eine Hungersnot **unmöglich**:
Der schlechteste Wurf über 2000 Ticks nahm 40 % des Ertrags, blieb also unter dem
Polster. Bei 1,4 gegen 0,4 stirbt der bedachte Spieler dagegen in 60 % der Läufe, was
gegen die Regel verstößt, dass gutes Spiel praktisch nie scheitern darf.

Bei 1,2 gegen 0,6 stimmt der Bogen, und zwar im Durchspielen sichtbar: In der dünnen
Frühphase heben schlechte Jahre die Sterberate von 1,0 % auf 3,1 % und die Gruppe
schrumpft; in der gefestigten Siedlung frisst derselbe Wurf (0,39, der schlechteste des
Laufs) die Sättigung auf 2 % herunter, halbiert die Geburtenrate und tötet niemanden.
Genau die Ordnung, die eine Rangfolge leisten soll — erst fällt der Komfort, dann das
Leben.

**Beide Hälften von T4 werden gebraucht.** Handeln muss besser sein als Nichtstun —
sonst sind die Projekte Zierrat. Und *gut* zu handeln muss besser sein als schlecht zu
handeln — sonst ist es kein Spiel, sondern ein Klickwettlauf.

Der schlechte Spieler ist dabei **nicht** „stößt alles sofort an". Seit es Projekte
gibt, die einander aufheben — Rodung und Aufforstung —, wäre das keine forsche
Spielweise, sondern eine widersprüchliche, und ein Vergleich gegen Unsinn beweist
nichts. Er hat dieselben Möglichkeiten und nutzt sie schlecht: Er baut, wenn es der
Siedlung ohnehin schon schlecht geht, statt aus dem Überschuss, und nimmt, was gerade
da ist, statt dessen, was etwas Neues bringt. Die Dringlichkeit, die er seinen Projekten
gibt, ist dieselbe wie beim bedachten Spieler, damit sie als Erklärung ausscheidet.

Gemessen: 993 gegen 139 Menschen, Faktor 7. Sterben muss dabei niemand — Scheitern ist
die Strafe für Untätigkeit, nicht für einen Fehlgriff.

**Die Schwankung wird von Anfang an eingeschaltet.** Mit Puffern zu wirtschaften ist
teurer als ohne; wer erst ohne austariert und sie später zuschaltet, macht alles zweimal.

### E28 — Das Muster jedes Übergangs

**Der Spieler kommt weiter, weil etwas wehtut — nicht weil ein Baum es erlaubt.**

Jeder Übergang von einer Stufe zur nächsten füllt fünf Felder aus:

| Feld | Frage |
|---|---|
| **1 Engpass** | Was bindet, und zwar so, dass es weh tut? |
| **2 Warum die alten Mittel nicht reichen** | Sonst würde man einfach weiter intensivieren |
| **3 Was die Institution eröffnet** | Neue Branche, neues Verfahren, neue Regel, mehr Gebiet (E12) |
| **4 Was sie kostet** | Welcher direkte Hebel verschwindet (E1) |
| **5 Voraussetzung im Modell** | Welche Struktur muss vorher existieren |

Feld 5 sagt, was **jetzt** angelegt werden muss, damit spätere Stufen funktionieren.
Feld 4 hält das Spiel ehrlich: Nach E1 hat jede Institution einen Preis, und der ist
keine Strafe, sondern die Lektion.

**Das Muster ist zugleich ein Prüfstein.** Lässt sich ein Feld nicht ausfüllen, gehört
der Übergang nicht ins Spiel. Ein Mechanismus, der historisch stimmt, aber im Spiel
keinen Druck beantwortet, bleibt Dekoration — mit leerem Feld 1 fällt das vorher auf
statt hinterher.

### E29 — Übergang 1: Jäger und Sammler → Siedlung

**Epoche „Jäger und Sammler".** Auf dem Bildschirm: Bevölkerung, Wildnis, Nahrung,
Deckung von Rang 100 und Rang 300. Kein Wohnraum, kein Holz, keine erschlossene Fläche,
kein Vorrat.

Verfahrenskette der Branche Nahrung über das ganze Spiel:
`Sammeln` → `Ackerbau` → `Pflug` → `Maschinell`

Sammeln braucht **Wildnis**, kein erschlossenes Land: guter Ertrag je Arbeitsleistung,
sehr geringer je Fläche, hohe Empfindlichkeit gegen die Jahresgüte. Nahrung hat eine
sehr hohe Verfallsrate — **kein Vorrat möglich** (E19).

**Beim Durchspielen verworfen: die erste Fassung dieser Projekte.** Sie waren
*Bessere Werkzeuge* → *Feuer nutzen* → *Jagdwaffen*, jedes das nächste freischaltend,
und Sesshaftigkeit ab einer Bevölkerungszahl. Gemessen ergab das:

- **Drei Klicks in 89 Ticks, und keiner davon eine Entscheidung.** Es gab nie mehr als
  ein Angebot, und nie einen Grund, es nicht zu nehmen. Dazwischen sechs Ticks mit
  vollkommen leerem Bildschirm, weil die Bevölkerung erst wachsen musste.
- **Die Projekte waren nicht nötig.** Ohne jedes Projekt wurde die Schwelle von 45
  Menschen bei Tick 65 erreicht statt bei 44 — ein Beschleuniger um zwanzig Ticks, keine
  Voraussetzung. Die Siedlung wuchs auch ohne alles auf 268 Menschen weiter.
- **Die Kette war künstlich.** Feuer hat sachlich nichts mit Werkzeugen zu tun und
  Jagdwaffen nichts mit Feuer; die Reihenfolge war reine Sperre.
- **Die Namen waren zu allgemein.** Werkzeuge gibt es in jeder Epoche, und Feuer
  beherrschte der Mensch schon eine Million Jahre vorher.

**Verfügbare Projekte, alle drei ab dem ersten Tick, keines ein anderes voraussetzend:**

| Projekt | Wirkung | zahlt sich aus |
|---|---|---|
| **Sichelklingen** | Ernte je Hand (Arbeit je Einheit 0,769 → 0,625) | sofort, klein, sicher |
| **Mahlsteine** | dieselbe Ernte ernährt mehr (`food_survival` 1,0 → 0,85 je Kopf) | sofort, auf der **Verbrauchsseite** |
| **Vorratsgruben** | Kapazität, die den gedeckten Vorrat langsamer verderben lässt | **gar nicht sofort** — erst im schlechten Jahr |
| *Jagdwaffen* (zweite Welle) | Verfahren `Jagd` | öffnet ein zweites Verfahren auf derselben Wildnis |

Der Zuschnitt folgt nicht der Vielfalt, sondern dem **Auszahlungsprofil**: sicher und
klein, sofort aber auf der anderen Seite der Rechnung, später aber groß. Drei Knöpfe,
die alle „Zahl wird größer" bedeuten, sind keine Entscheidung, wie viele es auch sind.

Alle drei sind natufisch und gehören damit **einer** Welt an statt drei Epochen:
Sichelklingen mit Glanzspuren und Mörser sind ihre Leitfunde (Flannerys *broad spectrum
revolution*), die Speicherbauten von Dhra' gehen der Domestizierung um rund tausend
Jahre voraus (Kuijt & Finlayson 2009).

**Die Kosten beißen: 90 Arbeitsleistung über mindestens 12 Ticks, also ein Viertel aller
Hände einer Gruppe von dreißig.** Vorher waren es 6 %, und deshalb gab es nie eine
Konkurrenz. Zwei Projekte gleichzeitig kosten die Hälfte, drei drei Viertel — gemessen
stirbt eine Siedlung, die alle drei sofort anfängt, in **100 %** der Läufe. „Sofort
alles nehmen" ist damit keine entschlossenere Spielweise, sondern eine schlechtere.

**Der Schmerz, gegen den der Vorrat hilft.** Vorher konnte das Überleben gar nicht
ausfallen: Die Sättigung machte 44 % des Nahrungsbedarfs aus und das schlechteste Jahr
in 2000 Ticks nahm 40 % des Ertrags — der Puffer war größer als der schlimmste Sturm,
und die Schwankung war Rauschen. Jetzt ist das Sammeln ganz dem Jahr ausgeliefert
(Exposition 1,0 statt 0,7) und die Verteilung hat einen echten Schwanz (Exponent 4 statt
8). Eine Bevölkerung ohne Speicher hängt damit nicht an der **mittleren** Tragfähigkeit,
sondern an der **schlechtesten** — jedes gute Jahr bringt Kinder, die das nächste
schlechte tötet. Genau deshalb ist ein Speicher umwälzend: Er lässt eine Gesellschaft am
Mittelwert leben statt am Minimum.

**Die Bedingung für Sesshaftigkeit ist gebaute Speicherkapazität, nicht Bevölkerung und
nicht gehaltener Vorrat** (2 je Kopf). Was an einen Ort bindet, ist Kapital, das man
nicht mittragen kann (Testart) — ein nach guter Ernte voller Speicher macht niemanden
sesshaft, eine Grube schon.

Der gehaltene *Vorrat* taugt als Bedingung zudem nicht, und das war eine Messung: Ein
Bestand schwankt mit dem Wetter, und die Schwelle wurde in nur 93 % der Läufe erreicht,
egal wie großzügig der Verfall gesetzt wurde. Daraus die Regel:

> **Schwankung darf verzögern, nie blockieren.** Ein Pechlauf braucht länger bis zum
> Übergang — er erreicht ihn trotzdem.

Mit der Kapazität als Bedingung wird der Übergang im Mittel bei Tick 88 erreicht,
**spätestens bei 100**: Pech kostet höchstens zwölf Ticks.

**Gemessen gegen die abgestimmten Zielwerte:**

| | Ziel | gemessen |
|---|---|---|
| ohne Projekte: erreicht Sesshaftigkeit | unter 2 % | **0 %** |
| ohne Projekte: Siedlung scheitert | unter 5 % | **0 %** |
| mit guten Entscheidungen: erreicht Sesshaftigkeit | über 99 %, seedunabhängig | **100 %** |
| mit guten Entscheidungen: scheitert | praktisch nie | **0 %** |
| sichtbarer Rückschlag vor der Sesshaftigkeit | über 80 % der Läufe | **100 %** |


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

### E30 — Durchspielen als Prüfung

**Das Spiel wird regelmäßig Tick für Tick gespielt und jeder Tick angesehen.** Nicht
laufen gelassen und am Ende ausgewertet — angesehen.

**Aggregate genügen nicht, und das ist keine Vorsicht, sondern eine Erfahrung.** Über
mehrere Runden haben Mittelwerte über ganze Läufe nacheinander zu diesen falschen
Schlüssen geführt, jeder davon erst beim Ansehen einzelner Ticks widerlegt:

| behauptet aus Aggregaten | tatsächlich |
|---|---|
| „Der Speicher tut nichts" | Er rettete 85–93 % der Ticks, in denen die Ernte den Hunger nicht deckte — die hungrigen Ticks im Mittelwert lagen *alle* vor dem Bau der Gruben |
| „Die Wirtschaft ist strukturell defizitär" | Galt für die ersten 20 Ticks, nicht für den Lauf |
| „Der Ertrag muss steigen" | Falsche Richtung: höherer Ertrag beseitigt die Gefahr, statt die gesuchte Phase zu erzeugen |
| „Überleben schlechtestens 45 %, mit und ohne Gruben gleich" | Über alle Ticks gemessen, auch die vor den Gruben — ab Tick 60 steht es in beiden Fällen bei 100 % |

Ein Mittelwert über einen Lauf mischt Phasen, die nichts miteinander zu tun haben. Wo
eine Wirkung an eine Phase gebunden ist — und im Aufbau einer Wirtschaft ist fast jede
das —, verschwindet sie im Mittel oder erscheint dort, wo sie nicht ist.

**Angesehen wird jeder Tick auf drei Fragen:**

1. **Ist das Ergebnis plausibel?** Passen die Zahlen zueinander, geht die Bilanz auf,
   tut die Anzeige, was sie behauptet.
2. **Ist es akademisch haltbar?** Nicht nur „kein Fehler im Modell", sondern: Entwickelt
   sich das Spiel so, wie die Entwicklung menschlicher Gesellschaften wissenschaftlich
   beschrieben wird. Sitzt eine Wildbeutergruppe an der Tragfähigkeit ihres Reviers?
   Kommt das Lager vor der Sesshaftigkeit? Wird intensiviert, wenn das Land knapp wird?
3. **Trägt es spieldynamisch?** Hat der Spieler an *diesem* Tick etwas zu entscheiden,
   und hat eine frühere Entscheidung hier eine sichtbare Folge? Beides muss über den
   ganzen Bogen gelten: Zu viele Hebel überfordern, zu wenige langweilen; zu früher
   Erfolg macht satt, zu später frustriert.

**Die Sicht dabei ist die des Spielers**, ergänzt um das, was aufgehen muss — die
Arbeitsbilanz, die Flächennutzung, den bindenden Input. Was der Spieler nicht sähe,
darf zur Beurteilung der Spieldynamik nicht herangezogen werden.

**Jeder Befund wird mit dem Tick festgehalten, der ihn erzeugt hat.** „Bei Tick 124
steht der schlechteste Wetterwurf des Laufs und der Hunger bleibt bei 100 %" ist eine
Feststellung, die man prüfen kann; „die Schwankung wirkt zu schwach" ist eine Meinung.

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

Branchen, Verfahren, Projekte, Bedarfsränge, Kurven — alles Konfiguration, **ohne Code
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
JavaScript entgegen — mit `s` (Zustand), `cfg` (Konfiguration) und `derive` im
Sichtbereich. **Ausgabe ist JSON**, kein formatierter Text: eindeutig, vollständig, und
jede Sicht lässt sich im Aufruf selbst zusammenstellen.

```bash
npm run session
eval 's = tick(s, cfg); ({...s, ...derive(s, cfg)})'
eval 's = apply(s, {type:"startProject", id:"clearForest"}, cfg)'
eval 's.stocks'
eval 'for (let i=0;i<20;i++) s = tick(s, cfg); derive(s, cfg).binding'
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

**`derive(state, config)` liefert die abgeleiteten Größen als Daten** — die Liste aus
E22: Köpfe, Arbeitsvolumen, Arbeitsleistung, erreichbares Gebiet, Güte, Deckung je Rang,
Auslastung, laufendes Verfahren je Branche, Produktion, Geburten- und Sterberate,
sichtbare und machbare Projekte, und **welcher Input bindet**.

Das Letzte ist der wichtigste Wert: Es prüft E6 (der Engpass wandert) direkt. Bindet
über zweihundert Ticks immer dasselbe, stimmen die Zahlen nicht. Und es steht *nicht* im
Zustand — nach E21 hinterlässt die Zuteilung nur ihre Ergebnisse, welcher Input gebunden
hat, ist danach weg. Ohne `derive` wäre es nicht erreichbar.

**`derive` ist kein Werkzeug daneben, sondern regulärer Teil der Simulation.** Die
Oberfläche braucht genau dieselben Werte, um Deckung, Auslastung und Engpass anzuzeigen.
Es ist die saubere Antwort darauf, dass abgeleitete Größen nirgends gespeichert werden:
Sie kommen aus einer Funktion, nicht aus dem Zustand.

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
| Branche | `Sector` |
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
erledigte Projekte als Kennungen, Zuteilungen, Zufallszustand, Tick. Branchen,
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

- **Ein Bedarf, mehrere Güter, je mit eigenem Faktor.** *Idee, nicht entschieden.* Heute
  deckt genau ein Bestand eine Bedarfsstufe: Nahrung ist Nahrung, egal ob sie aus Fisch,
  Fleisch oder Körnern kommt. Das trägt, solange der Nährwert das Maß ist (E5) und die
  Unterschiede im Verfahren stecken — andere Fläche, andere Exposition, andere Arbeit.
  Es geht aber verloren, was am Gut selbst hängt: Fisch verdirbt schneller als Korn.
  Mehrere Güter für einen Bedarf, jedes mit einem eigenen Beitrag je Einheit, würden das
  ausdrücken — und wären die Voraussetzung dafür, aus der Verbreiterung des Nahrungs­
  spektrums mehr zu machen als verschiedene Wege zum selben Bestand.
- **Natürlicher Nachwuchs auf Brachland.** *Idee, nicht entschieden.* Ungenutztes
  Ackerland fiele langsam an die Wildnis zurück — ökologisch die Sukzession, und
  genutztes Land bliebe unangetastet, es träfe also nur, wer Land hält, ohne es zu
  bestellen. Es löst den gemessenen Fall allerdings **nicht**: Dort waren Ackerland und
  Wildnis beide zu 100 % genutzt, es lag nichts brach. Der Rückweg aus der Entwaldung
  musste deshalb eine Handlung sein (Aufforstung, E13), nicht ein Naturvorgang.
- **Volkswirtschaftliche Kennzahlen.** Welche sind je Entwicklungsstufe sinnvoll?
  Ändert sich vermutlich mit dem Fortschritt.
- **Prognose.** Der Spieler braucht Vorausschau, um bei **trägen** Branchen
  rechtzeitig zu handeln — er muss sehen können, dass Wohnraum knapp *werden wird*.
- **Branchen ohne Überlebensbezug** — Kultur, Freizeit. Nach der Grundregel in E9
  muss jede Bedarfsstufe in eine reale Größe zurückzahlen. Für Kultur ist unklar,
  worin. Bloße Legitimität reicht als Begründung nicht; wird bei den Politikfeldern
  geklärt.
- ~~**Wodurch die Verfahrensordnung aus der Hand des Spielers gleitet** (E5).~~
  **Erledigt:** Sie war nie in seiner Hand, ohne zu schaden. Die Messung in E5 zeigt,
  dass die Handreihenfolge zwischen nicht dominierten Verfahren nichts bewirkt und bei
  einem dominierten 39 % kostet; sie ist entfernt. Die Frage nach dem auslösenden
  Projekt entfällt damit.
- **Preise.** Der Engpass steht (E21): Sobald der Haushaltssektor sich aufteilt, gibt es
  keinen gemeinsamen Plan mehr. Offen bleibt, ob der Spieler Preise durch ein Projekt
  einführt. Die manuelle Steuerung der Zuteilung ist inzwischen ausgemessen und
  entfernt (E5); die Frage nach ihrem Verbleib stellt sich also nicht mehr.
- **Geldeinführung.** Der wichtigste Moment des Spiels. Merkposten für später, **keine
  Entscheidung**: Die amerikanischen Kolonien sind der bestdokumentierte Fall für
  „ausgeben vor besteuern" — Massachusetts 1690 druckt Papierscheine, um heimkehrende
  Soldaten zu bezahlen, die es weder befehlen noch in Korn entlohnen kann, und macht sie
  durch Steuerannahme gültig; Pennsylvania 1723 ebenso (Farley Grubb). Der europäische
  Gegenfall zeigt dieselbe Ursache von der anderen Seite: Grundherren wandelten
  Frondienst in Geldzins um, weil sie Güter brauchten, die auf dem eigenen Gut nicht
  wuchsen. *(Nicht unbestritten — Quantitätstheoretiker halten die Kolonien für
  silberbasierter. Die Aktenlage zu Ausgabe und Steuerannahme ist unstrittig.)*
- **Auslastung und Inflation.**
- **Ungleichheit.** Braucht einen echten *wirtschaftlichen* Effekt (höhere Sparquote
  oben → Nachfrageausfall), nicht nur eine Anzeige.
- **Banken und Kredit.** Merkposten: Mit dem Giralgeld **zerbricht** die Regel
  „Umlaufmenge = kumuliertes Staatsdefizit", die vorher gilt. Das ist kein Fehler,
  sondern der beabsichtigte Lerneffekt — der Spieler sieht eine Regel fallen, die er für
  ein Gesetz gehalten hat, und sie wird durch die vollständige Saldenmechanik ersetzt.
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
- **Fluss vs. Bestand als eigenes Branchenmerkmal.** Gilt für die *Haltbarkeit*: ein
  Haus ist einfach langsamer
  Verfall plus hohe Trägheit.
- **Elastizität als Branchenmerkmal.** Fachlich falsch als Konstante; entsteht jetzt aus
  den Verfahren (E5).
- **Die Verfahrensordnung nach dem bindenden Input.** Als Rangfrage gestellt, wo eine
  Zuteilungsfrage stand: Jede Wahl entlastet ihren eigenen Engpass, also schwingt die
  Ordnung. Glättung, Schwellen auf Input- und Verfahrenswahl und Trägheit machen es nur
  langsamer, nicht stabil. Ersetzt durch die Ordnung nach Arbeitsertrag (E5).
- **Die Verfahrensordnung als feste Zahl in der Konfiguration.** Sie kann nicht für alle
  Lagen richtig sein, weil der bindende Input wandert (E6): Bei reichlich Land und
  knapper Arbeit erzwang sie den Ackerbau, während der Wald brachlag und die Siedlung
  hungerte. Ersetzt durch die gerechnete Ordnung in E5; die erklärte Priorität bleibt nur
  noch Rückfall für den ersten Tick.
- **„Zwingend vs. ersetzbar" als Attribut an der Kante Branche↔Input.** Kein
  Ja/Nein — der Effekt entsteht aus der Rückfallebene (E5).
- **„Nur Arbeit ist knapp".** Wäre Arbeitswertlehre und würde die Malthus-Dynamik
  mechanisch unmöglich machen.
- **Zufriedenheit als Zustandsgröße.** Keine volkswirtschaftliche Größe, verdoppelt
  die Deckung und wäre eine Benotung durch die Hintertür (E8).
- **„Dringlichkeit" als Branchenmerkmal.** Ersetzt durch die konkrete Angabe je Branche,
  worauf seine Unterdeckung real wirkt (E8).
- **Regler „Bedarf ↔ Zukunft".** Ersetzt durch Projekte (E10) — konkreter, und der
  Übergang zum Geldkauf von Arbeit wird dadurch scharf statt weich.
- **Gemeinschaftsarbeit vs. Fron als eigene Stufen.** Ohne mechanischen Unterschied.
- **Politikfelder als eigener Typ neben Projekten.** Politikfelder sind Branchen (E10).
- **„Hütten bauen" als Projekt.** Kategorienfehler — ein Dach deckt Rang 2, ist also
  Branchenproduktion (E10).
- **Steigende Erschließungskosten** als Bremse der Expansion. Ersetzt durch fallende
  Grenzgüte (E13), die dem Ricardo-Anker entspricht und die bessere Dynamik erzeugt.

### Aus dem gescheiterten Entwicklungsbogen

- **„Ungleichheit ist die Voraussetzung für Geld."** Geprüft und falsch. Rechnungseinheit,
  Schuld, Währung und Banken brauchen sie nicht — sie brauchen viele Güter, eine
  Zeitlücke und jemanden, der fordern kann. Ungleichheit ist Voraussetzung für einen
  **Arbeitsmarkt**, und der liegt nicht auf dem Weg zum Geld: Lohnarbeit wird historisch
  weit später verbreitet als Rechnungseinheiten und Schuldverträge. **Diese Annahme war
  die Wurzel aller Folgefehler unten.**
- **Rechnungseinheit als eigener Übergang.** Kein Engpass. Der kirchliche Zehnte war eine
  Naturalabgabe und kam ohne gemeinsamen Maßstab aus.
- **„Arbeit gegen Anteil" als früher Übergang.** Der Engpass dafür entsteht nicht:
  Güteunterschiede ändern den **Ertrag** je Fläche, nicht die **Arbeit** je Fläche. Bei
  gleicher Fläche je Kopf gibt es weder brachliegendes Land noch freie Hände.
- **Hundert Haushaltseinheiten mit Gewicht**, Mobilitätsschwellen zwischen Schichten,
  Verteilungsschlüssel für Projektinputs, freiwillige Beiträge im Verhältnis des Nutzens,
  anteiliges Einziehen bei allen Schichten, Zuordnung von Projekten zu Schichten durch
  den Spieler. Alles Folgen derselben falschen Annahme.
- **„Gemeinbesitz"** als Halter der Wildnis. Wildnis hat **keinen** Halter, sie ist
  unbesessen. Eine **Allmende** wäre etwas anderes — geregelte Gemeinschaftsnutzung mit
  Zugangsregeln, also eine Institution, die es nicht gibt.

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
| Ackerbau: mehr je Fläche, weniger je Arbeitsleistung | Boserup |
| Abgeleitete Nachfrage, Arbeitsinhalt einer Ware | Leontief; Arbeitswerte der Input-Output-Tabelle |
| Mindestlebensfähige Größe | Populationsbiologie; minimum viable population |
| Lagerung als Aktivität | Aktivitätsanalyse (Koopmans, von Neumann) |
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
- **Branche** = wo produziert wird: Nahrung, Wohnraum, Holz.
- **Sektor** = wer ein Konto hat und entscheidet: Haushalte, Zentralinstanz, Staat,
  Unternehmen, Banken, Ausland. In der VGR heißt das **institutionelle Einheit**; „Sektor"
  ist dort ebenfalls die Kontoseite, und es ist auch das Wort, das in MMT-Texten
  („Sektorbilanzen", „sektorale Salden") verwendet wird.
- **Verfahren** = eine Produktionsweise einer Branche, mit eigenen Inputs und eigener
  Produktivität.
- **Vorleistung** = Input, der in der Produktion verbraucht wird.
- **Kapazität** = Input, der belegt und wieder frei wird.

Deckung und Auslastung können unabhängig voneinander hoch oder niedrig sein. Genau
dieser Unterschied entscheidet später, ob zusätzliche Nachfrage in **Menge** oder in
**Preise** geht.
