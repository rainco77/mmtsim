# Konzept — festgelegte Entscheidungen

Lebendes Dokument. Hier steht ausschließlich, was über **das Spiel** entschieden ist.
Wie in diesem Projekt gearbeitet und geantwortet wird, steht in `CLAUDE.md`.

---

## Ziel

Ein Browser-Incremental in der Tradition von *Universal Paperclips*: einfacher
Einstieg, wachsende Komplexität, hoher Sog.

Drei gleichrangige Anforderungen:

1. **Es muss Spaß machen und süchtig machen.**
2. **Es muss die volkswirtschaftliche Lehre so genau wie möglich wiedergeben** — das
   Spiel soll wirklich dazu dienen, Volkswirtschaft zu verstehen, und mit verbreiteten
   Mythen aufräumen. Eine **offene Liste**, die wächst; bisher benannt:

   | Mythos | woran er scheitern soll |
   |---|---|
   | Geld ist knapp | die Umlaufmenge ist das kumulierte Defizit, vom Spieler gesetzt |
   | Ein Staat in eigener Währung kann pleitegehen | er kann es nicht; die Grenze ist eine andere |
   | Inflation kommt aus der Geldmenge | sie kommt aus der Auslastung realer Ressourcen |
   | Ein Staat wirtschaftet wie ein Privathaushalt | der Haushalt braucht Einnahmen vor Ausgaben, der Währungsherausgeber nicht |

   Jeder braucht eine **Mechanik**, an der er zerbricht, keine Textbox. Und die Liste ist
   ausdrücklich unvollständig — sie ist der Zweck des Spiels, nicht seine Verzierung.
3. **Es muss gegen wissenschaftliche Kritik möglichst immun sein.** Ein VWL-Professor
   soll es empfehlen können; jemand wie Maurice Höfgen soll es als lehrreich und nicht
   als falsch einordnen. Vereinfachungen sind erlaubt — besonders am Anfang —, aber
   nichts darf **falsch** sein, und nichts darf so **unterkomplex** sein, dass es wie
   falsch wirkt. Jede Mechanik braucht einen Anker in der Lehre (siehe unten).

Ökonomische Grundlage: MMT bzw. saldenmechanisch konsistente Modellierung.
Buchhaltungsidentitäten sind hart. Umstrittene Verhaltensannahmen gehören in die
Konfiguration, nicht in den Code.

**Politisch neutral.** Progressive und konservative Spielweisen müssen **ähnlich
wahrscheinlich gewinnen und ähnlich wahrscheinlich scheitern** — aber auf verschiedene
Weise. Das ist eine messbare Forderung, keine Absichtserklärung, und es ist zugleich die
neutrale Fassung dessen, was sonst eine politische Zuschreibung wäre: Wer erlebt, dass
beide Wege tragen und beide auf ihre eigene Art zusammenbrechen, braucht keine Aussage
darüber, welche Seite wirtschaften kann. Das Spiel sagt, was *möglich* ist,
nicht was *wünschenswert* ist.

**Der Anfang muss super simpel sein.** Komplexität kommt ausschließlich schrittweise im
Spielverlauf dazu, nie schon zu Beginn.

---

## Entschieden

### E1 — Fortschritt heißt weniger Kontrolle, nicht mehr Zahlen

**Eine Institution nimmt nicht nur die Entscheidung ab, sondern die laufende Pflege.**
Was der Spieler einstellt, wird deshalb als **feste Menge** gesetzt und nicht als Vielfaches
seines Verbrauchs: Eine Einstellung, die von selbst mitwächst, muss er nie wieder ansehen —
und dann nimmt ihm die Institution, die sie später ablöst, nichts ab, was ihn je gestört
hätte. Ein fester Wert veraltet dagegen, während die Gemeinschaft wächst, und muss
nachgezogen werden. Genau diese Mühe ist es, die später wegfällt, und erst dadurch wird
„weniger Kontrolle" als **Fortschritt erlebbar** statt nur behauptet.

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
| **Empfindlichkeit** | Wie stark schlägt der Wurf durch? | Die Witterung trifft Acker stark, Bau gar nicht (E24) |

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

**Wo Dominanz schweigt, entscheidet die Knappheit.** Zwischen zwei Verfahren, von denen
eines Fläche spart und Arbeit kostet und das andere umgekehrt, ist mit Mengen allein
nichts zu entscheiden — es kommt darauf an, was gerade knapp ist. Genau das rechnet die
Zuteilung aus (E21): Sie stellt den ganzen Tick als **ein** Programm auf und löst es
nach der Rangfolge. Ist das Land knapp, gewinnt das flächensparende Verfahren; ist die
Arbeit knapp, das arbeitssparende. Vollkommen symmetrisch, ohne vorab genanntes
Kriterium.

**Dominanz braucht deshalb keinen eigenen Mechanismus mehr.** Ein dominiertes Verfahren
hat bei jedem Stand höhere Grenzkosten und bekommt in einer Kostenrechnung ohnehin nie
einen Anteil; die Ordnung ist der grobe Sonderfall dessen, was die Zuteilung allgemein
leistet. Sie bleibt als **Begriff** wichtig — sie sagt, warum manche Verfahren einander
nie ablösen —, aber sie entscheidet nichts mehr.

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
mehr verwertbaren Nährwert. Ohne die richtige Einheit hätte man eine Verbrauchssenkung
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

**Verbesserer desselben Handwerks verbinden sich, statt einander zu verdrängen.** Ein
Verfahren kann mehrere fertige Projekte voraussetzen; die Kombination ist im Inhalt
ausgeschrieben (Sammeln mit Sichel und Mörser, Fischen mit Netz und Schnur). Wer beide
Verbesserer baut, hat keinen umsonst gebaut — die höchste freigeschaltete Stufe führt.

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

**Und eine unerfüllte Bedingung meldet, wo man steht** — nicht nur ihre Regel. „Speicher
1,8 von 2,0" ist ein Antrieb, „Speicher ≥ 2 je Kopf" ist eine Auskunft, und „gesperrt"
ist keines von beidem. Ohne den Stand kann der Spieler nicht erkennen, ob er näher kommt
oder zurückfällt — beim Durchspielen grub er neunzig Ticks lang Gruben und sah nur ein
graues Ziel mit einer Regel daneben.

Zwei Zahlen genügen dafür, ein Anteil wird nicht mitgeliefert: Bei jeder Bedingung ist
mehr besser, also ist der Anteil eine Division, die die Oberfläche selbst machen kann.
Und eine Ja/Nein-Bedingung steht bei 0 von 1 und springt auf 1 von 1 — dazwischen gibt
es nichts, und die Form sagt genau das.

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

**Diese Reihe ist der Mittelwert**, nicht das, was in einem einzelnen Tick auf dem Tisch
liegt: Das jeweilige Angebot streut gleichmäßig um sie, ohne sie zu verschieben (E25;
ausgeführt beim Revierwechsel der ersten Epoche).

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

**Das nächste Revier wird vom verlassenen aus gerechnet, nie aus einer Zählung.** Es ist
im Mittel eine Stufe schlechter als das Revier, das man verlässt, mit der Streuung des
Angebots obendrauf — ein gut abgepasster Bericht kann es übertreffen, und das Abpassen ist
Spielerkunst. Der Umzug vollzieht sich zu dem Bericht, auf den die Entscheidung fiel: Das
Angebot würfelt jeden Tick neu, aber man zieht in das Revier, das man besichtigt hat. Die
frühere Leiter (Güte fällt mit der Zahl der Landnahmen) ist für das Wandern dieser Epoche
verworfen: Die Besiedlung der Erde führte oft in reicheres Land; die stetig fallende
Grenzgüte gehört zur Landnahme mit Feldern, nicht zum Wandern der Jäger.

### E14 — Startaufstellung

**Eine Gemeinschaft von etwa fünfundzwanzig auf einem Revier, das sie gerade trägt.**
Fünfundzwanzig ist die Gruppe, die zusammen lebt und zieht (Birdsells *magic numbers*);
fünfzig wären zwei davon.

**Das Revier beginnt auf seiner Ruhelage** — dort, wo der Nachwuchs genau das ersetzt, was
diese Gemeinschaft entnimmt. Die Decke ist, was der Boden tragen *könnte*, nicht was darauf
steht; und die Gemeinschaft ist übernommen, nicht eben angekommen, also steht das Land
schon dort, wo ihre eigene Entnahme es hält. Jeder andere Wert bewegt sich in den ersten
Ticks, und dann misst der Anfang jedes Laufs ein Revier beim Einpendeln statt eines, auf dem
gelebt wird.

**Ausgerechnet, nicht hingeschrieben.** Der Ruhepunkt folgt aus Nachwuchsrate, Decke und
Entnahme; weil die Entnahme ihrerseits an den Suchkosten und damit am Stand hängt, wird die
Gleichung mehrfach im Kreis gerechnet, bis beide zueinander passen. So trägt jede Änderung
an Dichte, Rate, Verfahren oder Bedarf die Startaufstellung mit sich, statt eine veraltete
Zahl zurückzulassen.

**Und alles daran ist abgeleitet, nicht abgeschrieben:**

| | |
|---|---|
| **Revier** | *je Kopf* angegeben und mit der Gemeinschaft multipliziert |
| **Alles, was auf dem Revier lebt** | beginnt auf seiner Ruhelage, aus derselben Regel wie der Nachwuchs (E19) |
| **Vorrat** | **keiner.** Von der Hand in den Mund ist der Zustand, in dem die Epoche anfängt und aus dem sie sich herausarbeitet; ein Startvorrat verschenkte gerade den Mangel, den die Grube später beantwortet — und war ohnehin wirkungslos, weil Nahrung mit 0,9 verdirbt |
| **Ende bei sieben Erwachsenen** | darunter zu wenige Jäger, niemand übrig für Kinder und Kranke, kein Ausgleich für einen einzelnen Todesfall — und alle drei gelten den Arbeitenden, nicht den Köpfen (E20) |

Zwei lose Zahlen für Gemeinschaft und Revier liefen auseinander, sobald an einer gedreht wurde —
und derselbe Fehler ließ eine Gruppe in einem *bereits leergefischten* Gewässer starten,
weil die Startbestände neben der Regel standen statt aus ihr zu folgen. Als Abhängigkeit
geschrieben kann das nicht wiederkehren.

Eine zu klein gewordene Gemeinschaft stirbt übrigens nicht aus — sie schließt sich einer
anderen an. Als *diese* Gemeinschaft ist sie vorbei, und das genügt: eine weitere Regel
dafür braucht es nicht.

**Die Gruppe sitzt etwas über der Tragfähigkeit ihres Landes, nicht darunter.** Das ist die
Lage einer Wildbeutergemeinschaft, und nur so ist ein schlechter Tick existentiell, lohnt
Vorratshaltung und entsteht Druck zur Intensivierung. Mit einem Revier, das ein Vielfaches
des Bedarfs hergibt, drückt über hunderte Ticks nichts, und dann hat weder der Speicher noch
die Rodung eine Aufgabe.

**Etwas darüber, und nicht genau darauf** — denn die Bestände beginnen voll, und was die
Gemeinschaft am ersten Tick trägt, trägt sie nicht mehr, sobald das langsam Nachwachsende
ausgedünnt ist. Wer nichts tut, geht deshalb auf ein niedrigeres Niveau zurück und hält sich
dort (E29). Stand die Fläche je Kopf so, dass die Ruhelage *über* der Startgruppe lag, sagte
das Modell das Gegenteil der Erzählung.

**Und die Fläche je Kopf ist nicht allein zu drehen.** Sie bestimmt zugleich, wie viele
Hände es gibt — und was ein Projekt kostet und wieviel Übung eine Technik verlangt, sind
absolute Zahlen. Ein Drittel weniger Menschen ist ein Drittel langsamer zu jeder Schwelle,
und gemessen erreichte dann kein Lauf mehr die Sesshaftigkeit. Was die Fläche an Arbeit
nimmt, muss die Grundproduktivität zurückgeben: Die Fläche sagt, wie viele Menschen das Land
ernährt, die Produktivität, wieviel Arbeit diese Menschen leisten — und nur das Erste ist
es, wovon die Erzählung handelt.

**Aber „an der Tragfähigkeit" heißt: an der eines *leicht* schlechten Ticks.** Wörtlich
am Durchschnitt genommen wäre nie etwas übrig — kein Vorrat, kein Projekt, keine
Entwicklung, und die Epoche wäre unspielbar. Die Bevölkerung von Wildbeutern pendelt sich
auch tatsächlich nicht am Mittel ein, sondern an dem, was die mageren Jahre zulassen;
genau deshalb war in guten Jahren etwas übrig, und genau davon handelt der *normal
surplus* von Halstead und O'Shea.

Daraus wird ein **messbares Ziel** für das Austarieren, und zugleich der Prüfstein für
die Lehre der Epoche:

| Tick | ohne Speicher | mit Speicher |
|---|---|---|
| leicht schlecht (Wurf um 0,85) | niemand stirbt | — |
| **sehr schlecht (Wurf um 0,50)** | **Menschen sterben** | **niemand stirbt** |

Der schlechte Tick muss also **wehtun, solange es keinen Speicher gibt** — und der
Speicher ist genau das, was aus „es sterben Menschen" ein „es wird knapp" macht. Fällt
die erste Zeile aus, hat der Speicher keine Aufgabe; fällt die zweite aus, hat er keine
Wirkung.

**Die Stellschrauben dafür sind nicht die Wachstumsgeschwindigkeit.** Wie schnell die
Bevölkerung wächst, verschiebt nur, wann das Gleichgewicht erreicht ist, nicht wo es
liegt. Wo es liegt, hängt daran, wie hart ein schlechter Tick zurückwirft und wie lange
die Erholung dauert — die Sterberate bei Hunger und die Geburtenrate.

Beides gehört deshalb zusammen austariert, und die Zahl folgt aus den Koeffizienten der
Epoche — sie muss jedes Mal neu gemessen werden, wenn die sich ändern. Gemessen wird sie
an einer Siedlung, die **nichts entscheidet**: Wo deren Bevölkerung stehen bleibt, das
ist die Tragfähigkeit des Reviers.

**Sie soll dort liegen, wo die Gemeinschaft anfängt.** Wer die Gruppe übernimmt,
übernimmt keine, die eben erst in die Welt gesetzt wurde: Sie lebt seit Generationen auf
diesem Revier und steht an dessen Tragfähigkeit — genau das, was weiter oben über die
Startaufstellung steht. Ohne jede Entscheidung soll sie deshalb ungefähr bleiben, wo sie
ist, und nicht von allein auf das Doppelte wachsen. Gemessen liegt sie bei rund
siebenundzwanzig gegen eine Startgruppe von fünfundzwanzig.

> *Hier stand vorher „sie soll nahe bei fünfzig liegen".* Das war die Zahl aus der Zeit,
> als die Startgruppe fünfzig war; mit einer Gruppe von fünfundzwanzig hieße es, dass sich
> die Gemeinschaft ohne einen einzigen Handgriff verdoppelt — und dann hat das Wachstum
> nichts mehr mit dem Spielen zu tun.

| Revier | Plateau ohne Entscheidungen | ungenutzte Arbeit |
|---|---|---|
| 300 | 179 | 32 % |
| 200 | 139 | 29 % |
| 150 | 119 | 21 % |
| **100** | **99** | **3 %** |
| 80 | 91 | 1 % |
| 60 | 83 | fünf von acht Läufen aufgegeben |

**Der Leerlauf ist der eigentliche Befund.** Bei 300 lag ein Drittel aller Hände brach,
weil das Land nie knapp wurde; bei 100 sind es drei Prozent. Die Tickzahl bis zur
Sesshaftigkeit bewegt sich dabei fast nicht (39 bis 46) — die Fläche macht den *Druck*,
nicht das *Tempo*. Was das Tempo macht, sind die Projektkosten und -wirkungen.

Ein Restbetrag bleibt: Auch bei 60 Wildnis liegt das Plateau bei 83, denn das **Wasser
trägt unabhängig davon** rund fünfundvierzig Köpfe. Die Tragfähigkeit hängt an beiden
Achsen, und die zweite ist mit dem Land allein nicht zu erreichen.

*Historisch war die alte Begründung übrigens richtig und nur an die falschen Zahlen
gebunden: Bei 180 — passend für eine Gruppe von dreißig — lag eine Fünfzigergruppe unter
der alten Kostenlage dauerhaft unter der Sättigung und stand hundertfünfzig Ticks still.
Dieselbe Fläche ist mit den heutigen Koeffizienten zu groß. Die Regel „gerade so viel
Luft, dass die Gruppe wachsen und ihre ersten Werkzeuge bauen kann" gilt weiter; nur die
Zahl darunter ist eine Messung und kein Beschluss (E27).*

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

**Die Ankunft:** Der Lauf beginnt wie kurz nach einem Umzug. Die langsamen Bestände (Wild,
Fisch) öffnen um den Umzugsanteil über ihrer Ruhe und dünnen von dort aus — was in der Ruhe
öffnet, kann nicht ausdünnen, und der Anfang jedes Laufs zeigte sonst nichts vom Preis des
Bleibens. Die schnellen Bestände öffnen im Gleichgewicht ihrer eigenen Entnahme.

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
Die Voreinstellung steht im Inhalt und liegt **hinter allen Bedürfnissen**: gebaut wird
aus dem, was übrig ist, nie aus jemandes Abendessen. Im Kern ist es eine freie Zahl,
damit jede Stellung ausdrückbar ist; was die Oberfläche davon anbietet — freie Wahl oder
ein paar benannte Plätze —, entscheidet die Hülle (T1).

Der beste Platz ist mit ziemlicher Sicherheit **keines der beiden Enden**: über den
Rängen, die nur Behaglichkeit und Kinder kosten, und unter denen, die Leben kosten.
Genau deshalb darf er nicht die Voreinstellung sein — er ist das, was ein Spieler
herausfinden soll.

Der Grund für diese Form ist gemessen. Steht ein Projekt **fest** über allem, ist es
eine Falle statt einer Entscheidung: Seine Kosten sind absolut, also wächst ihr Anteil,
während eine Siedlung schrumpft. Im Spiel gingen sechzig Ticks nach dem Start 8 von 9
verbliebenen Arbeitseinheiten ins Projekt und 2 in die Nahrung; die Siedlung starb an
einer Verpflichtung aus besseren Zeiten, ohne dass irgendetwas den Moment markiert
hätte, an dem sie untragbar wurde. Steht es dagegen **fest** unter dem Überleben,
verschwindet die Falle — aber mit ihr die Entscheidung: Der Zeitpunkt spielt dann kaum
noch eine Rolle, weil das Modell den Spieler ohnehin schützt.

Als Zahl am Projekt ist die Gefahr **gewählt** statt verborgen, und der Zeitpunkt zählt
wieder. Von Hand gespielt: Zwei Projekte auf der alten Voreinstellung — ganz vorn —
töteten die Gemeinschaft binnen **eines** Ticks, weil der Anspruch über dem Hunger stand
und die Hände in die Grube statt in die Ernte gingen; gewarnt wurde nicht. Pausieren
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

### E19 — Wie ein Bestand sich verhält

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

**Und manches wächst nach, statt zu verfallen.** Wild und Fisch sind keine Fläche: Ein
Stück Wald wird nicht verbraucht, wenn man darüber jagt — die Rehe darauf schon. Daraus
die Regel, die im ganzen Modell gilt und für jede Epoche:

> **Fläche wird belegt: ausschließlich, ohne Gedächtnis** — wer sie nimmt, nimmt sie
> jedem anderen, und im nächsten Tick steht sie unverändert da, wie hart auch immer
> darauf gearbeitet wurde.
>
> **Ein Bestand wird entnommen: nebeneinander, mit Gedächtnis** — wer entnimmt, nimmt
> nur denen etwas weg, die aus *demselben* Bestand nehmen; was fehlt, fehlt weiter,
> wächst aus dem Rest nach und kostet je Einheit mehr, je dünner er wird.

**Und was herunterfällt, ist ein anderer Bestand als was steht.** Totholz ist kein
Vorrat, sondern eine Restgröße: Es fällt je Tick an, und wer nur aufliest, bekommt nie
mehr, als heruntergekommen ist. Der stehende Wald ist ein Vorrat, aber ohne Beil nicht
zu erreichen. Zwei Bestände auf derselben Wildnis, mit eigener Dichte und eigener Rate —
und **darauf** beruht, dass die Steinaxt etwas *erschließt* statt nur zu verbilligen
(E29). Bast wird vom stehenden Wald geschält und braucht kein Beil; ob man den Stamm
vorher fällt oder ihn stehend ringelt, der Baum ist danach hin.

> **Benannte Vereinfachung:** Die Decke des Totholzes hängt an der Fläche, nicht am
> Wald, der darauf steht — wer viel fällt, bekommt dadurch nicht weniger Totholz.
> Vertretbar, weil der stehende Wald in dieser Epoche kaum bewegt wird (Rate 0,1; E13).

Eine Hand, ein Feld, eine Grube gegen ein Tier, einen Fisch, einen Baum. Maschinenstunden
und Gebäude sind Kapazität; Erz, Öl und Fischgründe sind Bestände.

**Beide Eigenschaften werden gebraucht, und die erste ist die wichtigere.** Am Gedächtnis
allein ließe sich nichts entscheiden, weil ein Wildbeuter überhaupt nichts belegt: Er
liest Totholz auf demselben Waldstück auf, auf dem er sammelt und über das er jagt.
Solange all das Fläche kostete, nahm die Nahrung als höchster Rang das ganze Revier, und
Holz, Bast und Felle waren nicht knapp, sondern **ausgesperrt** — es wurde in keinem Tick
davon etwas gewonnen, die Gemeinschaft fror und ging nackt. Wo Verdrängung sachlich
richtig ist, bildet das Modell sie weiter ab: Jagen auf Fleisch und Jagen auf Felle ziehen
aus demselben Wild und konkurrieren dort hart. Die Konkurrenz sitzt am Wild statt an der
Fläche, und dort gehört sie hin.

**Fläche ist deshalb nicht der Grenzfall eines schnell nachwachsenden Bestands.** Bei
Rate 1 kommt ein halb entnommener Bestand auf drei Viertel zurück, nicht auf voll; um
sich wie Fläche zu verhalten, bräuchte er die Rate `Decke / Bestand`, die mit der
Ausdünnung ins Unendliche wächst.

**In dieser Epoche zahlt daher kein einziges Verfahren Fläche.** Wildnis und Wasser sind
reine **Träger**: Sie setzen die Decken dessen, was auf ihnen lebt, und ihre Güte sagt,
wieviel das ist. Belegt wird erst der Acker und die Hütte — die Sesshaftigkeit ist damit
auch mechanisch der Bruch, den sie erzählt.

Weil nichts mehr für Fläche zahlt, hätte die **Bodengüte** sonst keine Wirkung mehr. Sie
sitzt deshalb an der Decke: `Decke = Fläche × Güte × Dichte`. Schlechteres Land trägt
weniger Wild, weniger Wuchs, weniger Bäume — Ricardo unverändert, an der einzigen Stelle,
an der er noch beißen kann. Der Revierwechsel behält damit seinen Preis.

Der Nachwuchs ist der Verfall mit umgekehrtem Vorzeichen und einer Decke — die
logistische Kurve, das Standardmodell erneuerbarer Ressourcen:

```
Obergrenze K = Fläche × Dichte
Zuwachs      = Rate × (Bestand + Rückzugssockel) × (1 − Bestand / K)
```

Der **Rückzugssockel** hält E20: Bei Bestand null wäre auch der Zuwachs null, und ein
leergejagtes Revier käme nie zurück. Es gibt immer Winkel, die niemand erreicht.

**In einem Tick darf höchstens neun Zehntel des Stehenden genommen werden.** Das sagt
nicht, dass ein Zehntel immer überlebt: Wer Tick für Tick neun Zehntel des Rests nimmt,
bringt einen langsam nachwachsenden Bestand trotzdem herunter — was ein Revier davor
bewahrt, endgültig leer zu sein, ist allein der Rückzugssockel. Was die Grenze sagt, ist
etwas über die Gruppe: Sie kann ihr Revier zwischen zwei Ticks nicht durchkämmen. Das
Revier ist groß, es reift nicht auf einmal, und was weit von den Menschen liegt, wird
nicht getragen.

**Es muss eine Grenze sein und kann kein Aufwand sein**, weil die Ränge eine Ordnung
sind und kein Abwägen: Ein Rang deckt sich, so weit er kann, und fragt nie, was es
kostet. Gemessen — die Obergrenze dessen, was eine Einheit beim Suchen kosten darf, von
30 auf 300 zu heben änderte in keinem von acht Läufen etwas, und den Bestand in 32 oder
128 Stufen zu schneiden statt in 8 ebenso wenig. In der Wirklichkeit verschont den Rest
eines dünnen Bestands eine **Entscheidung**: Der Ertrag fällt, und man wendet sich
anderem zu, lange bevor der letzte gefunden ist. Diese Entscheidung kann die Rangordnung
nicht treffen, also trifft die Grenze sie an ihrer Stelle.

Gespielt, acht Seeds: Ohne die Grenze nahm der schlimmste Tick 51 % der Menschen, und
der dünnste je erreichte Bestand stand bei 0,10 seiner Decke. Mit ihr sind es 33 % und
0,12 bis 0,25, und die Epoche dauert kaum länger — sesshaft bei Tick 87 gegen 81.
Schärfer wäre milder (11 % bei vier Fünfteln), verdoppelt aber die Dauer der Epoche.

Der Einbruch fällt dabei in jeder Einstellung auf einen **guten** Wurf nach einem
schlechten, nie auf den schlechten selbst. Das bleibt so und ist richtig: Ein magerer
Tick wird nicht überstanden, er wird auf Kredit bezahlt — erst wird aufgezehrt, was
steht, und gestorben wird danach. Zu ändern war nicht der Verzug, sondern der Betrag.

**Ein dünner Bestand ist teuer zu ernten.** Ohne das sieht der Plan einen vorhandenen
Bestand als kostenlosen Vorrat und nimmt ihn bis auf null, sobald das der billigste Weg
ist — gemessen war ein Gewässer binnen zwanzig Ticks tot, und keine Bremse erreichte es
rechtzeitig. Was einen Bestand wirklich rettet, ist, dass das Nehmen teuer wird:

> `Fang = q · Aufwand · Bestand` — der Aufwand je Einheit läuft also umgekehrt zum
> Verbliebenen. Das ist die bioökonomische Standardform (Gordon-Schaefer) und dasselbe,
> was die optimale Nahrungssuche als fallende Begegnungsrate sagt.

Ein Fisch bleibt dabei ein Fisch: Der Aufschlag trifft **Arbeit und Fläche**, das Suchen
— nie die Menge der Beute je Einheit.

**Gerechnet wird gegen den Stand, aus dem gerade genommen wird, nicht gegen den, der
vorgefunden wurde.** Wer die Hälfte eines Reviers abgrast, findet die zweite Hälfte
schwerer als die erste; über eine Entnahme `T` aus einem Stand `S` ist das der Mittelwert
von `Decke / Bestand`, also `(Decke / T) · ln(S / (S − T))`. Am Rand — winzige Entnahme —
ist das wieder die alte Zahl.

Gegen den vorgefundenen Stand gerechnet war der Preis der der **ersten** Einheit, und
vier Fünftel eines Reviers zu nehmen kostete je Einheit so wenig wie ein Zwanzigstel.
Gespielt stand der Zuschlag von Tick 0 bis 45 unverändert auf 1,0, während die Entnahme
von 31 auf 75 stieg: Nichts wurde teuer, ein Drittel der Arbeit lag brach, kein Projekt
konnte sich lohnen — und die Gemeinschaft wuchs weiter, bis die Entnahme die ganze Decke
erreichte, worauf der Stand in drei Ticks von 89 auf 12 fiel und alle auf einmal starben.
Der Druck kam als Klippe, weil der Preis auf dem Weg dorthin nie stieg.

**Der Deckel nach oben hat zwei Aufgaben, und sie streiten.** Er soll verhindern, dass ein
erschöpftes Revier unendlich teuer wird, damit es einen Weg zurück gibt (E20 — kein
Zustand ohne Rückweg). Zugleich ist er die Obergrenze des Preises, der die Übernutzung
bremsen soll. Bei 6 gewann die erste Aufgabe und die zweite fiel aus: Sobald die Sichel
die Arbeit je Einheit halbiert hatte, war selbst der Anschlag noch bezahlbar, und die
Gemeinschaft nahm weiter, bis der Stand kippte.

**Ein Speicher ist ein Rückfall, keine erste Quelle — und das entscheidet sich beim
Planen, nicht beim Austeilen.** Nachgefragt wird immer der **volle** Bedarf, gerechnet
gegen einen normalen Tick mit etwas Vorsicht. Andersherum — Bedarfe ziehen schon beim
Planen den Vorrat ab und bestellen nur den Rest — beginnt jeder Tick damit, den Speicher
aufzuessen, und endet damit, ihn wieder zu füllen; er steht dann dauerhaft bei *einem*
Tick Ersparnis, wie groß die Gruben auch sind.

**Ausgeteilt wird dagegen aus einem einzigen Topf.** Was erzeugt wird, geht ins Lager,
und die Ränge decken sich der Reihe nach von dort. Zwei Töpfe — eine Liste „heute
entstanden" neben dem Vorrat — führten zur Doppelzählung: Die Erzeugung lag in beiden,
weil ein nachgelagertes Verfahren am selben Tick darauf zugreifen können muss, und ein
Rang, der zu kurz kam, fand im Lager genau das wieder, was ihm gerade verweigert worden
war. Gemessen: 42 Nahrung erzeugt, 69 ausgeteilt, davon 27 aus einem Lager mit Bestand
null. Hunger war damit unmöglich, jeder Rang meldete Deckung, die Geburten liefen voll
weiter — und die Gemeinschaft wuchs, bis das Revier selbst nachgab.

**Der Plan darf aus dem Vorrat nehmen — und was zu halten ist, verlangt er als
Schlussbestand.** Beide Hälften werden gebraucht, und keine trägt allein.

Ein Vorrat ist da, um in schlechten Zeiten benutzt zu werden, und ob das Gut eine
Vorleistung ist oder an einen Bedarf ausgeteilt wird, ändert daran nichts. Wo der Plan ihn
nicht sieht, ist er unerreichbar, sobald ein **Verfahren** das Gut verbraucht statt eines
Bedarfs: Bei der Nahrung fällt es nicht auf, weil am Tickende ohnehin aus einem Topf
ausgeteilt wird, in dem Vorrat und Erzeugung zusammenliegen. Beim Holz fällt es auf —
gemessen bei Seed 42, Tick 57 lagen 4,90 Holz da, Totholz war mit 1,26 das Billigste im
Revier, und das Feuer kam trotzdem auf 0,00, was drei von fünf Menschen das Leben kostete.

Genommen wird dann aber, was am billigsten ist, und ein liegender Vorrat kostet keine Hand.
Was ihn davor bewahrt, aufgezehrt zu werden, ist die zweite Hälfte: **Die Vorgabe ist kein
Verbraucher des Guts, sondern ein Anspruch auf den Stand am Ende des Ticks** — mach so viel,
wie dieser Tick ausgibt, und dazu, was noch fehlt. Innerhalb eines Ticks ist es gleichgültig,
ob zuerst der Vorrat oder zuerst die Erzeugung genutzt wird; es zählt allein, was am Ende
steht.

**Und gemessen wird am Schlussbestand, nicht an der Lücke von gestern.** An der Anfangslücke
gemessen stellt ein Tick, der voll beginnt, überhaupt keinen Anspruch — leert er sich dann,
holt ihn nichts zurück. Gemessen mit einer Vorgabe von zwölf: Der Vorrat stand bei Tick 51
auf 12,08, es wurde kein Anspruch erhoben, der Tick gab ihn auf 0,56 aus, und dabei wurde ein
Viertel der Arbeit gar nicht abgerufen. Dasselbe bei Tick 54. Der Bestand sägezahnte
zwischen voll und leer, statt zu halten.

**Was für einen Vorrat gilt, gilt für jedes Gut, das in der Nutzung nicht aufgebraucht
wird.** Kleidung wird getragen, nicht gegessen; ihr Rang verlangt also ebenfalls einen
Stand und keine Entnahme. Als Fehlbetrag geschrieben — Bedarf minus Bestand — wäre der
Vorrat zweimal gezählt: einmal beim Abziehen und einmal als Angebot an den Plan. Ein Rang
könnte sich dann aus genau dem Bestand bedienen, den er halten soll, und sich als gedeckt
melden, ohne dass irgendetwas hergestellt wurde.

**Was in der Nutzung nicht aufgebraucht wird, wird nur zum Fehlbetrag nachgefragt.**
Nahrung fließt durch und muss jeden Tick ganz neu erzeugt werden; Kleidung wird getragen,
nicht gegessen, und Erhalt ist Neubau dessen, was zerfallen ist. Ohne diese
Unterscheidung nähte eine Gemeinschaft von dreißig jeden Tick acht neue Kleidungsstücke,
während sie zweiundneunzig trug — und weil Bast 2,5 Bäume je Faser kostet, wanderte der
ganze Wald in Kleider, die niemand brauchte, worauf die Gemeinschaft erfror.

**Und was der Spieler daran ablesen kann, ist der Lagerstand vor und nach dem Tick.**
Woher eine einzelne Einheit im Topf stammt, weiß sie selbst nicht; ob von der Substanz
gelebt wurde, sagt der Vergleich der beiden Stände.

Wieviel zu halten sich lohnt, sagt der Speicher selbst: **das Ziel ist seine Kapazität.**
Darüber hinaus verdirbt ein Gut mit dem gewöhnlichen Satz, die Arbeit wäre vertan — und
wie groß der Speicher ist, hat der Spieler beim Bauen entschieden. Es braucht dafür keine
zweite Zahl und keine Sparquote.

**Warum überhaupt ein Vorrat, und zwar für jedes Gut:** weil der Ausstoß unsicher ist.
Das gilt für eine ausbleibende Lieferung so wie für eine missratene Ernte — keine
Jahreszeiten, kein Saatgut, nichts, was nur Nahrung haben kann.

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

**Jede Rate ist ein Faktor, und Raten werden nie addiert.**

```
Köpfe'      = Köpfe ⊙ Überleben ⊕ Neugeborene in ihrer Kohorte
Überleben   = Grundüberleben × Faktor je Bedarf …      je Kohorte
Neugeborene = Grundrate × Traglastfaktor × (Gewichte · Köpfe)
Arbeit      = (Gewichte · Köpfe) × Arbeitsfähigkeit × Produktivität
```

Köpfe sind ein Vektor über die Kohorten; `⊙` heißt „je Kohorte einzeln", `·` ist das
Skalarprodukt. Addiert wird an genau einer Stelle, und dort ist es keine Rate, sondern
Menschen: die Neugeborenen, die in ihre Kohorte kommen.

**Die Geburten sind eine Zahl von Menschen, kein Faktor auf alle.** Sie folgen aus einer
Grundrate je Erwachsenem, mal dem Traglastfaktor, mal der Zahl derer, die Kinder bekommen
können — kein Bedarf trägt einen Geburtenfaktor — und sie kommen in die untere Kohorte.

**Der Traglastfaktor ist die Bremse der wandernden Lebensweise** (E29, „Wie sich die
Gemeinschaft einregelt"): Er fällt, je mehr Kinderlast je Tragendem schon da ist und je
weiter die Suchwege des Ticks reichen — die Suchkosten der Bestände, aus denen entnommen
wurde, gewichtet mit der Arbeit, die hineinging. Auf frischem Land und ohne Kinderlast ist
er eins, unter null fällt er nie, und die Regel der Sesshaftigkeit hebt ihn dauerhaft auf
eins. Vorher war es ein Faktor auf die
Kopfzahl, und dabei war gleichgültig, wer mitzählte: Eine Gruppe aus lauter Kindern
vermehrte sich so schnell wie eine aus lauter Erwachsenen. Damit kostet Nachwuchs zuerst
und trägt später — eine Gemeinschaft, die gerade viele Kinder hat, bekommt dadurch nicht
mehr Kinder, sondern weniger Hände, und muss diese Zeit überstehen, bevor es sich auszahlt.

Ein Überlebensfaktor von 0,10 heißt: **ein Zehntel der Gruppe übersteht den Tick.** Eine
Produktivität von 1,2 heißt: ein Fünftel mehr wird geschafft. 1,0 heißt „keine Wirkung".

**Warum multiplikativ und nicht additiv** — drei Gründe, und keiner davon ist bloß
Ordnungsliebe:

- Es ist die **exakte** Zusammensetzung. Unabhängige Todesursachen kombinieren sich im
  *Überleben* multiplikativ; ihre Sterblichkeiten zu addieren ist eine Näherung, die nur
  zufällig fast stimmt, solange die Raten klein sind.
- **Zwei Notlagen zugleich treffen härter als jede für sich.** 20 % zu wenig Nahrung und
  halb so viel Feuer wie nötig ergibt 0,82 × 0,70 = 0,574 — 43 % Tote. Das ist
  empirisch richtig und fällt bei Addition unter den Tisch.
- Eine negative Bevölkerung oder ein negativer Arbeitstag sind **unmöglich**. Bei
  Addition waren sie es nicht.

> **Warnung aus der Umsetzung:** Solange Raten addiert und Faktoren als Zuschläge
> geschrieben wurden, stand die Wirkung der Kleidung (0,6 bei Nulldeckung, 1,0 bei
> voller) in einem Feld, das addiert wurde. Ergebnis: Eine **nackte** Gemeinschaft arbeitete
> *besser* als eine gekleidete, und niemandem fiel es auf, weil beide Lesarten plausible
> Zahlen ergeben. Eine gemischte Konvention ist eine Fehlerquelle, die nicht auffällt.

**Zwischen keiner und voller Deckung wird linear verrechnet.** Die Nichtlinearität, die
eine Schwelle braucht, steckt nicht in einer Kurve, sondern in der **Rangfolge** (E8):
Ein Bedarf, der erst tödlich ist, wenn er ganz ausfällt, wird in einen kleinen
lebensnotwendigen Rang und einen Behaglichkeitsrang darüber geteilt. Nahrung und Wärme
sind beide so gebaut — halbe Rationen sind Hunger, halbes Brennholz ist ein kalter
Winter.

**Nur der Puffer trägt das Wachstum.** Die Grundfaktoren waren einmal Kehrwerte
voneinander, so dass eine Gruppe mit gerade gedeckten Bedarfen stehenblieb. Das ist
aufgehoben: Wer nur die tödlichen Ränge deckt, **schrumpft** — langsam und ohne dass
jemand daran stirbt. Gewachsen wird ausschließlich, solange **Betreuung und
Behaglichkeit** bedient werden, die beiden Ränge auf der Geburtenachse. Das ist der
Malthus-Punkt aus E7, und er sitzt jetzt an der Stelle, an der er hingehört: nicht am
Verhungern, sondern am Verzicht.

Gemessen war der Grund handfest: Mit Kehrwerten blieb die Gruppe stehen, sobald der
Hunger gedeckt war, und ein schlechter Wurf hatte keine Folge, die über den Tick
hinausreichte. Jetzt kostet ein Tick ohne Puffer Nachwuchs, und mehrere hintereinander
kosten Größe.

**Der Regler ist immer genau ein Bedarf.** Die Bevölkerung pendelt sich dort ein, wo
**geboren = gestorben** wird — die Grundrate mal den Bedarfsfaktoren mal den Erwachsenen
gegen die Summe der Verluste über alle Kohorten. Dahin kommt sie, indem sie so lange wächst, bis
*ein* Bedarf so weit unterdeckt ist, dass er es allein ausgleicht. Welcher das ist,
entscheidet allein die Größe seines Faktors, **nicht** die Menge, die er verlangt:
Gemessen wuchs die Siedlung immer wieder genau so weit, bis die Wärme bei 0,45 stand,
gleich ob der Bedarf 0,1 oder 0,03 je Kopf war und ob Holz 0,6 oder 0,2 Fläche kostete.
Wer den Regler wechseln will, ändert Faktoren, keine Mengen.

**Die Bevölkerung wird intern als Bruchzahl geführt** und gerundet angezeigt. Bei
dreißig Menschen und kleinen Raten wäre eine ganzzahlige Rechnung sonst über viele
Ticks bewegungslos und würde dann springen.

**Scheitern an einer Schwelle, nicht bei null.** Fällt die Bevölkerung unter eine
Mindestgröße, gilt die Siedlung als aufgegeben und der Lauf ist zu Ende.

Das ist kein Zugeständnis an die Spielbarkeit, sondern fachlich das Richtigere: Eine
Gemeinschaft unterhalb einer bestimmten Größe ist nicht überlebensfähig — keine
Arbeitsteilung, kein Puffer gegen einen schlechten Tick, kein Ersatz für Ausfälle.
**Mindestlebensfähige Größe** ist ein etablierter Begriff, und historisch wurden zu
klein gewordene Siedlungen aufgegeben oder gingen in anderen auf. Bis auf den letzten
Menschen zu rechnen wäre die unrealistischere Variante.

**Gezählt werden dabei die Erwachsenen, nicht die Köpfe.** Ob eine Gemeinschaft sich noch
erholen kann, hängt an ihnen, und zwar an beidem, was sie tun: Sie leisten die Arbeit, und
sie bekommen die Kinder. Zwölf Menschen, davon zehn Heranwachsende, sind erledigt — die
zwei Übrigen müssen alle ernähren und dazu die Betreuung aufbringen, und bis die Kinder
aufrücken, vergehen viele Ticks. Zwölf Erwachsene kommen heraus. Nach Köpfen gezählt wären
beide gleich.

**Die Schwelle liegt bei sieben Erwachsenen, die Startgruppe bei fünfundzwanzig Köpfen** —
dieselben Zahlen wie in E14 („Startaufstellung"), und der Anker ist Birdsells *magic
number*: Fünfundzwanzig **ist** die Gemeinschaft, die zusammen lebt und zieht, also kann
sie nicht zugleich der Boden sein, unter dem es nicht weitergeht. Unter etwa einem Dutzend
Menschen hört eine Gemeinschaft auf zu funktionieren — zu wenige Jäger, niemand übrig für
Kinder und Kranke, kein Ausgleich für einen einzelnen Todesfall; alle drei Aussagen gelten
den Arbeitenden. Sieben von fünfzehn Erwachsenen ist derselbe Anteil, an dem die Schwelle
vorher als zwölf von fünfundzwanzig Köpfen stand, nur unempfindlich dagegen, ob die
Verluste die Arbeitenden oder die Kinder getroffen haben. Und aus einer zu kleinen Gruppe
erholt sich nichts mehr, also muss der Lauf **davor** enden und nicht erst, wenn niemand
mehr da ist.

> *Hier stand vorher „Die Schwelle liegt bei 25, die Startgruppe bei 50" — im Widerspruch
> zu E14 und zum Inhalt, der schon immer zwölf sagt. Der Satz stammte aus der Zeit vor der
> Messung, die das Revier und die Gruppengröße aneinander gebunden hat.*

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

#### Kohorten: aus der Kopfzahl wird ein Vektor

Das Modell war der Ein-Kohorten-Fall eines allgemeinen Kohortenmodells, nicht eine Zahl
mit Sonderregeln. Aus der Zahl wird ein **Vektor**, und welche Gruppen darin stehen, sagt
allein der Inhalt. Für diese Epoche sind es zwei: **Heranwachsende und Erwachsene.**

**Jede Stelle, die die Kohorten anfasst, trägt einen eigenen Vektor über sie** — und zwar
in genau einer von zwei Arten, je nachdem, was herauskommen soll:

| | der zweite Vektor ist | Rechnung | Ergebnis |
|---|---|---|---|
| **Lesen** | Gewichte | Skalarprodukt | **eine Zahl** |
| **Wirken** | Empfindlichkeiten | elementweise | **wieder ein Vektor** |

Gelesen wird überall dort, wo aus den Menschen eine einzelne Größe wird: der Bedarf eines
Rangs, die Arbeitsleistung, die Zahl der Geburten, die Größe, unter der aufgegeben wird,
der Speicher je Kopf. Jede dieser Stellen hat ihre eigene Gewichtung, denn ein
Heranwachsender isst weniger als ein Erwachsener, arbeitet anders und bekommt keine
Kinder — aber wer aufgibt, zählt Menschen und keine Arbeitskräfte.

Gewirkt wird dort, wo sich der Vektor selbst ändert: Sterblichkeit und Aufrücken. Dort
kann keine Summe stehen, ohne genau die Auskunft zu verlieren, um die es geht — aus „die
Hälfte der Kinder und ein Zehntel der Erwachsenen" wird keine einzelne Zahl. **Dass Hunger
und Kälte Kinder härter treffen als Erwachsene, ist genau das, was diese Form trägt.**

**Die Geburten sind beides zugleich:** wie viele geboren werden, ist ein Skalarprodukt;
**wohin** sie fallen, ist ein Einheitsvektor.

**Ein Vektor wird immer vollständig ausgeschrieben** — nie weggelassen, nie zu einer
einzelnen Zahl abgekürzt, die „für alle gleich" bedeutet. Der Grund ist der Tag, an dem
eine Kohorte dazukommt: Bei einem fehlenden Vektor müsste das Modell raten, und beide
Vermutungen sind falsch — mit einer Eins bekäme die neue Gruppe volle Arbeitsleistung, mit
einer Null nichts zu essen. Ausgeschrieben erzwingt eine neue Kohorte an jeder Stelle eine
Entscheidung, und beim Lesen steht ohnehin klarer da, was gemeint ist.

**Produktivität und Arbeitsfähigkeit bleiben je eine Zahl.** Sie sind mitgeführter Zustand
und nicht Inhalt, und sie wären doppelt: Was ein Halbwüchsiger weniger leistet, steht schon
im Gewichtsvektor der Arbeit. Wer keine Arbeit beisteuert, kann nicht zusätzlich
unproduktiv sein — es zeigt sich nirgends. Kleidung und Sättigung wirken deshalb weiter
auf die Arbeitsleistung als Ganzes, Hunger und Kälte dagegen je Kohorte.

**Die Bewegung zwischen den Kohorten ist eine Liste im Inhalt**: je Eintrag, aus welcher
Gruppe in welche und mit welchem festen Anteil je Tick. Das ist der Alterungsschritt, und
es ist zugleich die allgemeine Form — dieselbe Liste, dünn geschrieben, ist die Matrix, mit
der der Kohortenstand multipliziert wird. **Alle Übergänge eines Ticks werden aus demselben
Anfangsstand gerechnet und gemeinsam angewandt**, sonst hinge das Ergebnis daran, in
welcher Reihenfolge sie im Inhalt stehen, und niemand könnte es dem Inhalt ansehen.

Eine feste Rate ist dabei ein Eimer mit Loch und keine Warteschlange: Bei einem Zehntel je
Tick bleibt ein Mensch im Mittel zehn Ticks Kind, aber ein Zehntel wird schon im nächsten
erwachsen. Wer die Verzögerung schärfer will, schreibt zwei oder drei Kohorten
hintereinander in den Inhalt. Genau dafür ist der Vektor da.

**Andere Achsen sind weitere Einträge in derselben Liste, keine zweite Maschine.** Ein
Kreuz wie gesund und krank mal jung und alt schreibt der Inhalt aus — gesunde Kinder,
kranke Kinder, gesunde Erwachsene, kranke Erwachsene. Ein mehrachsiger Zustand wäre enger
und nicht allgemeiner: Er müsste jede Kombination führen, auch die, die nie vorkommt, und
er müsste beantworten, was ein krankes Kind ist, wenn Krankheit die Sterblichkeit
verdoppelt und Kindsein sie um die Hälfte hebt — eine Frage, auf die es keine Antwort aus
der Sache gibt. Eine Liste stellt sie nie.

**Was jede Achse eigen mitbringt, ist ihre Bewegung**, und die kommt, wenn es die Achse
gibt: Alter mit fester Rate, Krankheit mit einer Rate, die an der Deckung eines Rangs
hängt, Vermögen aus den Zahlungen und mit einem Besitz je Gruppe. Eine allgemeine
Verteilungsmaschine wird nicht vorab gebaut — sie müsste sich für einen Bewegungsgrund
entscheiden und wäre für die anderen falsch.

Der Umstieg ist eine Schemamigration nach T7.

**Betreuung und Behaglichkeit wirken auf das Überleben der Kinder, nicht auf die
Geburten.** Vernachlässigung hart (unbeaufsichtigte Kinder verunglücken), Kälte mild (die
Wintersterblichkeit trifft die Kleinsten; was Erwachsene tötet, bleibt das erloschene
Feuer). Die Geburten tragen keinen Deckungsfaktor mehr: ihr Tempo ist die Grundrate, ihr
Niveau die Traglast. Der Wohlstand entscheidet, wie viele Kinder durchkommen — nicht, wie
viele empfangen werden.

### E21 — Wie die Zuteilung rechnet

**Alles auf einmal geplant, dann nach Rang bedient.**

Ansprüche gibt es dreierlei, und sie stehen alle in **einer** Rangliste (E9): die
Bedarfsränge, die Vorratsziele, und die Projekte — ein Projekt trägt seinen Rang wie ein
Bedarf, und der Spieler setzt ihn (E18). Nach E10 darf er der Bedarfsdeckung damit
Arbeit entziehen; das ist eine Rangfrage, keine eigene Phase.

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

Ein Lauf nach 900 Ticks: 213 Menschen, die Wildnis zu 100 % genutzt, **560 Fläche
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

**Die Lösung, und sie ist gebaut: erst gemeinsam planen, dann nach Rang rationieren.** Der Bedarf
aller Ränge wird zusammen geplant — dabei sieht die Zuteilung die Konkurrenz um die
Wildnis —, und reicht es nicht, fällt der höchste Rang und es wird neu geplant. Die
Rangliste bleibt unverändert; nur wird geplant, **bevor** rationiert wird.

Das ist auch das Wirklichkeitsnähere: Ein bäuerlicher Haushalt plant sein Jahr im
Ganzen — Brot, Feuer, Dach — und teilt die Hände danach ein. Er plant nicht erst das
Brot in Unkenntnis des Feuers. Anker: **Tschajanow** zum bäuerlichen Haushalt; und für das Wählen zwischen Revieren
und Verfahren die **optimale Nahrungssuche** (MacArthur/Pianka, Charnov), die genau das
behauptet — Sammler und Jäger teilen ihren Einsatz so auf, dass der Ertrag je Suchzeit
am größten wird.

> **Warum hier optimiert wird und nicht nach Anspruchsniveau gesucht.** Satisficing
> (Simon, Nelson/Winter) ist das Modell für **Unternehmen unter Neuheit und
> Unsicherheit** — wer nicht weiß, was möglich ist, kann es nicht ausrechnen. Die
> Zuteilung dieser Epoche ist das Gegenteil: dieselbe Aufgabe in jedem Tick, über
> Generationen gelernt, auf einem Revier, das die Gruppe hundertmal begangen hat. Für
> genau diese Lage ist die optimale Nahrungssuche das bestbestätigte Verhaltensmodell
> des Feldes, und über lange Zeiträume verschwindet der Unterschied ohnehin: Lernen und
> Auslese führen zu derselben Mischung, *als ob* gerechnet worden wäre (Alchian).
>
> **Nicht optimiert wird die Wahl der Projekte.** Was man noch nicht kennt, kann man
> nicht ausrechnen — und deshalb ist sie die Entscheidung des Spielers und bleibt es.

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

**Der Planungsalgorithmus: ein einziges Programm, nach Rängen gelöst.**

Das Ergebnis eines Plans ist ein Vektor von **Aktivitätsniveaus** — wie viel auf
jedem Verfahren läuft. Arbeit und Kapazitäten sind Nebenbedingungen, nicht
Ergebnis; ein Niveau von null heißt „läuft nicht". Das ist die Aktivitätsanalyse,
auf die sich E5 ohnehin beruft.

Der ganze Tick wird als **ein** Programm hingeschrieben und in einem Zug gelöst:

| | |
|---|---|
| **Spalten** | je Verfahren eine — und für ein Verfahren, das aus einem nachwachsenden Bestand schöpft, eine **je Stufe** dieses Bestands. Dazu je Anspruch eine Spalte: das Bedienen eines Bedarfsrangs, eines Vorratsziels, eines Projekts |
| **Grenzen** | je Kapazität, je Bestand, je Stufe eines Bestands, und je Anspruch: mehr als verlangt wird nicht bedient |
| **Zielzeilen** | je Anspruch eine, **in der Rangfolge** aus E9 |

**Die Rangfolge steckt im Verfahren selbst, nicht in einer Reihe von Aufrufen.**
Die Tafel trägt alle Zielzeilen zugleich, und eine Spalte darf nur einrücken,
wenn sie den Rang in Arbeit verbessert **und jeden höheren Rang unberührt
lässt**. Damit wird unter allen gleich guten Wegen, Rang 100 zu decken,
derjenige gewählt, der für Rang 200 am meisten übriglässt — genau der Fehler,
den der Abschnitt oben beschreibt, und er kann nicht wiederkehren. Rang 100
bekommt dabei nie weniger, gleich wie viel ein niedrigerer gewönne.

**Steigende Suchkosten stehen im Modell, nicht in einer Regel daneben.** Ein
Bestand wird in **acht Stufen** geschnitten: die erste Scheibe eines vollen
Reviers ist fast umsonst, die letzte eines ausgedünnten teuer. Ein Verfahren
erscheint einmal je Stufe — dieselbe Beute je Einheit, mehr Hände fürs Suchen.
Der Löser nimmt deshalb die billigen Stufen **aller** Bestände, bevor er in einen
einzelnen tiefer geht, und das ist die Aufteilung nach gleichen Grenzkosten,
ohne dass sie irgendwo als Regel steht.

> **Eine Stufe ist eine Tiefe, kein Privatvorrat.** Die Grenze gilt je Bestand
> und Stufe, geteilt von allen, die dort graben. Bekäme jedes Verfahren seine
> eigene Kopie, könnte die bloße Hand die billige Oberschicht eines Reviers
> nehmen, das die Sichel längst durchgearbeitet hat — gemessen sammelte sie
> weiter neben der Sichel, die sie vollständig ablöst.

**Warum acht.** Gemessen gegen die exakte Aufteilung mit überall gleichen
Grenzkosten, bei drei Bedarfslagen: drei Stufen liegen bis zu 33 % daneben und
verändern nicht nur *wieviel*, sondern *was* genommen wird — die Muscheln werden
abgeerntet, die die exakte Lösung nie anrührt. Acht liegen bei rund einem
Prozent und nehmen dieselben Dinge in denselben Verhältnissen. Zwölf und zwanzig
kaufen ein weiteres halbes Prozent für ein größeres Programm. Die Abweichung
geht immer in dieselbe Richtung: Die Stufen lassen das Suchen etwas teurer
aussehen, als es ist, nie billiger.

**Der Mittelwert entscheidet nicht, er bezahlt.** Was eine Entnahme kostet, ist
der Mittelwert der Suchkosten über sie; ob eine *weitere* Einheit genommen wird,
entscheidet der Preis der nächsten. Ein Mittelwert kann das nicht: Er bleibt
klein, wie tief auch genommen wird, weil die ersten Einheiten fast umsonst waren
und die letzten mitziehen. Gemessen kostete das Ausräumen eines ganzen Gewässers
im Mittel das 3,5-fache — bezahlbar —, und der Plan räumte es in einem einzigen
Tick aus, Tick für Tick.

**Bei Gleichstand gewinnt die sparsamere Spalte.** Wo Arbeit nicht knapp ist, ist
eine arbeitssparende Technik genau so viel wert wie die, die sie ablöst, und ein
Löser ist zu Recht gleichgültig. Gleichgültigkeit ist keine Antwort, die ein
Spieler versteht — also stehen die sparsamen Spalten vorn, und die Pivotregel
entscheidet die Gleichheit vernünftig. Es kostet nichts.

**Und was den Plan aufgehalten hat, sagt das Programm selbst:** Welche Grenzen
angespannt sind, steht nach dem Lösen da, und dazu, was eine Einheit mehr davon
gebracht hätte. Das sind **Opportunitätskosten in realen Mengen** — wieviel mehr
Deckung eine Hand oder eine Fläche mehr eingebracht hätte —, ausdrücklich **keine
Preise**: Ein Preis setzt Markt und Währung voraus, und beides gibt es hier
nicht. Die Größe kostet nichts extra und kann nicht von der Antwort abweichen,
die sie erklärt.

**Es ist kein allgemeiner Löser und soll keiner werden.** Er beantwortet die
Frage dieser Zuteilung und sonst nichts, und deshalb passt er in eine Datei von
gut zweihundertfünfzig Zeilen: Alle Grenzen sind Obergrenzen mit nichtnegativer
rechter Seite, also ist Nichtstun schon zulässig und die ganze erste Phase eines
Lehrbuch-Simplex entfällt. Die Pivotregel ist durchgehend Blands, damit ein
entartetes Programm nicht kreisen kann — und Entartung ist bei uns der
Normalfall, weil viele Grenzen gleichzeitig anliegen.

**Gemessen, weil eine fremde Bibliothek naheläge und nicht trägt:** Für unsere
Größe — rund hundert Aktivitäten, zwanzig Grenzen, sieben Ränge — braucht der
eigene Löser **0,081 ms**. Ein ausgereifter Löser als WebAssembly braucht 4,0 ms
je *einzelner* Lösung, ein reiner JS-Löser 0,44 — und beide bräuchten sieben
davon. Der ganze Tick kostete vorher 0,305 ms. Ein Löser für große Aufgaben
zahlt bei winzigen fast nur festen Aufwand je Aufruf.

**Was der Umstieg gemessen gebracht hat**, über acht Seeds und zweihundert Ticks,
ohne jede Entscheidung:

| | vorher | nachher |
|---|---|---|
| Fisch, tiefster Stand | 3 % der Decke | **21 %** |
| Suchkosten Fisch, Spitze | 30 (am Anschlag) | **5,7** |
| Tief der Bevölkerung | 19 | **24** |
| schlimmster Einbruch in *einem* Tick | 68 % der Menschen | **39 %** |
| schlechteste Feuerdeckung | 0,00 | **0,76** |
| Zeit für dieselben Läufe | 1354 ms | **1007 ms** |

**Der Vorrat steht im Programm als Angebot, und die Vorgabe als Anspruch auf den
Schlussbestand** (E19). In Zeilen: Die Grenze je Bestand ist nicht null, sondern
das, was daliegt — netto verbraucht werden darf bis zum Anfangsbestand, was
dasselbe ist wie „kein Bestand schließt unter null". Und ein Anspruch auf ein Gut,
das nicht aufgebraucht wird, bekommt eine eigene Zeile:

```
Anspruch  ≤  Anfangsbestand + Erzeugung − Verbrauch
Anspruch  ≤  das verlangte Niveau
```

Beide rechten Seiten sind nicht negativ, also bleibt Nichtstun zulässig und der
Löser braucht dafür nichts Zusätzliches. Der Rang des Anspruchs entscheidet weiter
alles Übrige: Steht die Behaglichkeit darüber, darf sie den Vorrat aufzehren — nur
greift die Auffüllung danach nach der Arbeit, die noch frei ist.

**Der blinde Plan bleibt blind** (E24): Gerechnet wird gegen ein leicht
schlechtes Durchschnittsjahr, der wirkliche Wurf trifft danach den Ausstoß.

**Was dabei weggefallen ist**, und es ist mehr, als hinzugekommen ist: die
Ordnung nach Dominanz als Entscheider, das Verschieben von Nachfrage weg von dem,
was ausgeht, die Regel „eine Nachfrage darf ein Verfahren nur einmal verlassen",
der Vorlauf, der erst schätzen musste, wieviel der Tick zu nehmen gedenkt, die
Halbierungssuche um den Grenzrang, und der Sonderweg für Projekte — ein Projekt
ist jetzt schlicht eine weitere Zielzeile an seiner Stelle in derselben Ordnung
(E18).

**Wie weit der oberste erreichbare Rang gedeckt wird, ist damit ein Ergebnis
statt einer Näherung.** Dass ein Rang *teilweise* bedient wird, bleibt aber ein
**Aggregationsbehelf**: Es bildet nicht die Entscheidung eines Haushalts nach,
sondern die Verteilung vieler. In Wirklichkeit wurde der Übergang von der Jagd
zum Ackerbau allmählich, weil viele Haushalte zu verschiedenen Zeitpunkten
umstellten — die auf dem schlechtesten Boden zuerst. Niemand hat je „zu 37 %
Dreifelderwirtschaft" betrieben. Wir haben **einen** Haushaltssektor, der keine
Verteilung hat; eine spätere Aufteilung in Schichten würde den Behelf ersetzen.

**Ein gescheiterter Rang stoppt die niedrigeren nicht.** Ein Rang, den der Wald
aufhält, hält keinen Rang auf, der an der Wildnis hängt. Die Rangfolge
entscheidet, wer einen *umstrittenen* Input zuerst bekommt — nicht, dass darunter
alles leer ausgeht.

**Und die Buchhaltung sagt, was geschehen ist, nicht was übrig blieb.** Arbeit,
die hergestellt und von keinem Verfahren gebraucht wurde, galt als „geht an
Projekte" — auch wenn jedes Projekt pausiert war. Sie ist **Leerlauf**: gemacht,
von niemandem gewollt, am Tickende weg (E10). Die Bilanz ging in beiden Fällen
auf; wahr war nur eine davon.


### E22 — Was im Zustand steht

Regel: **gespeichert wird nur, was Geschichte hat.** Alles Berechenbare wird jeden Tick
neu gerechnet und nirgends abgelegt. Das hält den Spielstand klein (T7) und verhindert,
dass zwei Stellen dasselbe behaupten und auseinanderlaufen.

**Gespeichert — zehn Dinge:**

| | |
|---|---|
| **Tickzähler** | |
| **Zufallszustand** | Hauptseed plus je Strom ein Zählerstand (E25); nie ein globaler Generator |
| **Bestände** | eine Zahl je Bestand: Nahrung, Wärme, Kleidung, Betreuung, Holz — dazu eine je Flächentyp (E13), anfangs Wildnis und erschlossene Fläche |
| **Die Bevölkerung** | eine Zahl **je Kohorte** (E20), nicht eine einzelne Kopfzahl |
| **Zahl der Landnahmen** | daraus wird der Mittelwert der Güte gerechnet (E13) |
| **Das Landangebot** | der Wurf, der das gerade angebotene Land gegen diesen Mittelwert stellt (E13). Gespeichert, weil er am Ende des Ticks gezogen wird und bis zur Entscheidung im nächsten stehen bleiben muss |
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

**Der Zustand hält außerdem fest, was der letzte Tick wirklich getan hat:** Deckung je
Rang, Suchkosten, Geburten, Überlebensfaktor je Kohorte und die Aufteilung der Arbeit
(in Herstellung, in Projekte, ungenutzt) — so, wie die Zuteilung sie in diesem Tick
angewandt hat. Der Grund ist ein Befund aus dem Probespielen: Eine Anzeige, die die
Zuteilung am Tickende neu rechnet, rechnet mit inzwischen geleerten oder nachgewachsenen
Beständen und der schon geschrumpften Bevölkerung — sie zeigte den Einbruch einen Tick
zu früh und die Erholung einen Tick zu spät, und am schlimmsten Tick stand „alles
gedeckt" neben den Toten. **Was als Geschehen angezeigt wird, kommt aus dieser
Aufzeichnung und wird nie neu gerechnet.** Die frisch gerechnete Ableitung bleibt für
Entscheidungsgrundlagen — was eine Zuteilung aus dem jetzigen Stand ergäbe.

**Abgeleitet — jeden Tick neu, nirgends abgelegt:**

Köpfe (die Summe über die Kohorten) · Arbeitsvolumen = gewichtete Kopfzahl ×
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

**Der Wurf** — eine Zahl je Tick und Strom mit Mittelwert 1, auf die jedes **Verfahren**
mit seiner **eigenen Empfindlichkeit** reagiert:

| Verfahren | Empfindlichkeit |
|---|---|
| Sammeln | hoch |
| Ackerbau, trocken | hoch |
| Ackerbau, bewässert | gering |
| Waldwirtschaft | gering |
| Bau | keine |

Ein gemeinsamer Wurf statt einer je Branche, weil **Wetter gemeinsam ist**: Ein schlechter
Tick trifft Acker und Waldwirtschaft zusammen, nur unterschiedlich stark. Bei
unabhängigen Würfen wäre genau das unmöglich. Nebenbei ergibt es eine lesbare Zahl („ein
schlechter Tick") statt eines Bündels unsichtbarer Störungen.

**Der Wurf senkt den Ausstoß, nicht einen einzelnen Input.** Ein Verfahren hatte einen
schlechten Tick oder nicht; was hineinging, ist dann für weniger Ertrag verbraucht — alle
Inputkoeffizienten steigen gemeinsam.

**Ob der Plan den Wurf kennt, entscheidet das Verfahren und nicht das Modell.** Es gibt
zwei Arten, und beide werden gebraucht.

**Ein Verfahren, das seinen Ertrag verpflichtet, kennt den Wurf nicht.** Der Same liegt in
der Erde, bevor irgendetwas feststeht, und danach ist nichts mehr zu richten. Geplant wird
deshalb auf einen **durchschnittlichen Tick**, abzüglich einer Vorsicht; die Vorleistungen
werden **verbraucht wie geplant**, und der **Ertrag** ergibt sich aus dem echten Wurf. Ein
guter Tick bringt dann mehr, als der Plan vorsah — der **unerwartete Überfluss**, und der
ist einer der beiden Gründe, warum Speicher erfunden wurden.

**Ein Verfahren, das seinen Ertrag findet, sieht den Tick, während es arbeitet.** Man geht
sammeln und geht weiter, bis man hat, was man wollte. Geplant wird deshalb gegen den Wurf,
der wirklich fällt: Ein schlechter macht die Einheit teurer in Arbeit, und die Antwort
darauf sind **mehr Hände**, nicht weniger Ertrag. Überrascht wird hier niemand, und übrig
bleibt auch nichts.

**Die Bedarfsseite ist nie verpflichtet.** Niemand legt vorher fest, wie kalt ihm sein
wird. Geheizt wird gegen den Tick, der wirklich kommt; ein harter tut weh.

**Was daraus für den Vorrat folgt.** Wo jedes Verfahren seinen Ertrag findet, gewinnt eine
Gemeinschaft genau das, was ein Rang verlangt hat — es entsteht kein Rest, aus dem sich ein
Vorrat von selbst ergäbe. Ein Vorrat entsteht dort nur, weil er **selbst ein Rang ist** und
mit den übrigen um dieselbe Arbeit ringt: Wer anlegt, isst schlechter oder friert mehr.
Das ist der zweite Grund für Speicher, und er ist der einzige, der ohne Säen trägt.

> *Befund aus der Umsetzung:* Vorher fiel der Wurf in einer Phase **vor** der Planung und
> wurde der Zuteilung für **jedes** Verfahren übergeben. Für ein verpflichtetes ist das
> Hellsehen, und es hatte eine Folge, die lange unerklärt blieb: In einem guten Tick deckte
> der Plan denselben Bedarf mit *weniger Arbeit*, statt mehr zu ernten. **Es konnte also
> nie ein Überschuss entstehen** — gemessen standen Holz, Faser und Felle über sechzig
> Ticks gemeinsam auf 0,00, der Speicher hatte nichts zu bewahren, und der Rückschlag eines
> schlechten Ticks kam allein daher, dass die Arbeit ausging.
>
> Für ein gefundenes Verfahren ist dasselbe Verhalten richtig: Wer sammelt, hört auf, wenn
> er genug hat, und braucht in einem guten Tick weniger Hände dafür. Der Fehler lag nicht
> darin, den Wurf zu kennen, sondern darin, ihn **allen** Verfahren zu geben. Seitdem trägt
> jedes Verfahren die Eigenschaft selbst.

**Ein blinder Plan braucht ein Teiltempo eine Stufe früher.** Hat ein Verfahren weiter
oben einen schlechten Tick, fehlt der Stufe darunter ihre Vorleistung; sie läuft dann so
weit, wie das Vorhandene trägt — dieselbe Regel wie bei einem Projekt, dem eine Zutat
fehlt (E18). Die dabei nicht abgerufene Arbeit steht still und wird als **ungenutzt**
gebucht, nicht als Arbeit für Projekte.

**Was hier „Erwartungswert" heißt, ist in späteren Epochen die Absatzprognose.** Damit
ist die Stelle gebaut, an der später Erwartungen sitzen: Unternehmen produzieren gegen
eine Erwartung, und der Fehler landet im Lager — daraus kommen unverkaufte Bestände und
Lagerzyklen.

> *Befund aus der Umsetzung:* Vorher traf der Schock nur die **Arbeit**. Damit machte
> eine Missernte **Fläche frei**: gemessen fiel die Nutzung der Wildnis bei einem Wurf
> von 0,66 von 100 % auf 67 %. Eine missratene Ernte verbraucht ihre Fläche aber genauso
> wie eine gelungene, sie liefert nur weniger. Seit der Wurf am Ausstoß hängt, liegt die
> Flächennutzung bei jedem Wetter gleich — 63 bis 71 % bei Würfen von 0,36 bis 1,25.
>
> Es ist zugleich ein Sonderfall weniger: Vorher stand im Modell, dass Arbeit anders
> getroffen wird als jeder andere Input.

**Zufall trifft Angebot oder Nachfrage — beides.** Ein schlechter Wurf senkt den Ertrag
eines Verfahrens *und* hebt den Bedarf, der am selben Wetter hängt: Ein kalter Tick
bringt weniger Holz und verlangt zugleich mehr davon. Deshalb erklärt auch eine
**Bedarfsstufe** ihre Empfindlichkeit je Strom, so wie ein Verfahren es tut.

**Die Richtung ist dabei umgekehrt**, und das muss dastehen, damit niemand später über
das Vorzeichen stolpert: Beim Verfahren *senkt* ein schlechter Wurf den Ertrag, beim
Bedarf *hebt* er ihn.

Das ist es, was einen schlechten Tick gefährlich macht: Not addiert sich nicht, sie
verstärkt sich. Historisch ist genau das der Zusammenhang — Kältejahre brachten
Hungersnot und Brennstoffnot zugleich, und die Arbeit fürs Holz fehlte dann bei der
Nahrung.

**Die vollständige Übersicht, wo Zufall angreifen kann**, damit nicht in zwei Runden ein
weiterer Fall auftaucht:

| Angriffspunkt | Beispiel | |
|---|---|---|
| Ertrag eines Verfahrens | schlechte Ernte | gebaut |
| Bedarf je Kopf | kalter Tick braucht mehr Holz | gebaut |
| Verfall eines Bestands | nasser Tick lässt Korn verderben | zweitrangig; die Vorratsgeschichte trägt ohne |
| Kapazität, Geburten, Tode | Hochwasser, Seuche | anderer Mechanismus, siehe unten |
| Projekte, Bodengüte | Einsturz, Schwemmland | kein überzeugender Fall |

**Was ausdrücklich nicht gebaut ist:** ein Strom, der einen einzelnen Input trifft und
einen anderen nicht. Es fand sich kein Fall, der es verlangt — misslingt die Ernte, ist
alles vergeudet, was in sie ging. Und **Angebotsschocks** — eine Seuche, die Köpfe
nimmt, ein Brand, der einen Vorrat vernichtet — sind über die Aussetzung gar nicht
ausdrückbar, weil sie kein Verfahren treffen, sondern einen Bestand oder eine Kapazität.
Sie wären ein anderer Mechanismus: eine **Wirkung, die ein Wurf auslöst**, mit denselben
Wirkungstypen, die heute Projekte haben. Gebraucht wird das sicher — die Pest ist einer
der großen wirtschaftlichen Vorgänge der Geschichte —, aber nicht in dieser Epoche.

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

**Die Verteilung hat einen langen linken Rand:** Mittelwert 1, eine Obergrenze, starke
Ausfälle nach unten. Das ist die empirisch richtige Form — Ernten haben eine biologische
Obergrenze, aber nach unten kein Gegenstück; es gibt Missernten, aber keine Ernten mit
dreifachem Ertrag. Eine symmetrische Streuung wäre die unrealistischere Wahl.

**Wie lang der Rand ist, entscheidet, ob die Epoche ihre Krise überhaupt bekommt.** Die
Wahrscheinlichkeit ist `P(Wurf < x) = (x / Maßstab)^Exponent` mit
`Maßstab = (Exponent + 1) / Exponent`. Bei einem Exponenten von 4 fällt der Wurf in einem
von achtunddreißig Ticks unter die Hälfte — auf einer Strecke von wenigen hundert Ticks
also eine Handvoll Mal, und gemessen kein einziges Mal so, dass der tödliche Rang knapp
wurde. Eine Epoche, die sich ohne eine einzige erlebte Not durchqueren lässt, verlangt
keinen Vorrat, und ohne Vorrat gibt es keinen Weg hinaus.

Bei einem Exponenten von 2 ist es jeder neunte Tick. Damit erlebt eine Gemeinschaft
mehrere Nöte, bevor sie sesshaft werden kann — und jede davon ist zu überstehen statt
endgültig, weil die Überlebenszahl des Hungers das trägt (E29). Der Preis ist, dass auch
die gute Seite breiter wird: Der Wurf reicht dann bis 1,5 statt bis 1,25. Häufigkeit und
Härte gehören deshalb immer zusammen eingestellt, nie einzeln.

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
| `weather` | die Witterung für die inländische Produktion (E24) |
| `land` | die Güte des Landes, das gerade angeboten wird (E13) |
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
| **Tötet Nichtstun?** Es darf nicht — es soll nur stehenbleiben | T4 |
| Kommt eine passive Strategie genauso weit wie eine aktive? | T4 |
| Hebt Handeln das Niveau, solange beide leben? | T4 |
| **Kommt schlechtes Spiel genauso weit wie gutes?** | T4 |
| Gibt es Zustände ohne Weg zurück? | E20 |

**Wie eine Grenze eines Urteils bemessen wird.** Eine Grenze wird nach zwei Maßstäben
gesetzt und nach keinem anderen: ob sie historisch und fachlich vertretbar ist — nichts
festschreiben, was akademisch angreifbar wäre —, und ob die Spieldynamik mit ihr attraktiv
bleibt; das Spiel soll den Spieler halten. Nie wird eine Grenze danach bemessen, dass die
Urteile zusammen grün werden: Eine Grenze, die verschoben wird, damit ein anderes Urteil
besteht, misst nichts mehr. Eine Ablesung, für die noch keine begründbare Grenze bekannt
ist, bleibt Ablesung ohne Urteil, bis die Erfahrung eine liefert. Auch eine gesetzte
Grenze ist nicht endgültig: Die Erfahrung darf sie ändern, mit Begründung aus denselben
zwei Maßstäben.

**Der Komfort ist der Puffer, und er muss der richtige sein.** Der entbehrliche Anteil
des Nahrungsbedarfs — der Abstand zwischen Sättigung und Hunger — ist das Polster: Ein
schlechter Tick frisst zuerst diesen Teil, und erst wenn er mehr nimmt, sterben Menschen.
Wie groß die Mengen je Kopf sind, steht im Inhalt; hier steht, wie ihr Verhältnis wirkt.

**Ein knappes Drittel, und der Abstand zwischen den beiden Rängen *ist* der Puffer.** Je
mehr entbehrlich ist, desto tiefer muss ein Wurf gehen, bevor jemand stirbt — und desto
seltener erlebt der Spieler eine Krise. Gemessen wurde bis zur Hälfte hinauf: Dann sieht
mancher Lauf bis zur Sesshaftigkeit **keine einzige** Krise, und wer nie gehungert hat, hat
keinen Grund zu graben. Bei einem knappen Drittel erlebt jeder Lauf mindestens zwei, im
Mittel drei bis vier, und die meisten davon, bevor die Grube überhaupt baubar ist.

Nach unten ist die Grenze, dass der Hunger die **Krise** bleiben muss und nicht der Alltag
wird. Extern gestützt ist die Größenordnung dadurch, dass der Grundumsatz eines Menschen
etwa zwei Drittel seines Verbrauchs ausmacht und Bewegung und Arbeit den Rest, und dadurch,
dass Menschen eine lange Strecke auf etwa der Hälfte ihrer üblichen Aufnahme überlebt haben
— schwer geschädigt, aber lebend.

Wo das Polster liegt, sagt eine Schwelle, die sich ausrechnen lässt und nicht geraten
werden muss. Geplant wird gegen einen Wurf von 0,9; der Hunger wird also berührt,
sobald der Ertrag unter seinen Anteil an den 1,8 fällt:

| Polster | erste Tote ab einem Wurf von | wie oft |
|---|---|---|
| 1,4 / 0,4 (ein Fünftel entbehrlich) | 0,70 | jeder 10. Tick |
| 1,2 / 0,6 (ein Drittel entbehrlich) | 0,60 | jeder 19. Tick |
| dazu Sammeln mit Exposition 0,7 | 0,46 | jeder 56. Tick |
| **0,9 / 0,9, Exposition 0,88, Exponent 2** | **0,38** | **jeder 15. Tick** |

Die letzte Zeile ist der Stand. Die Häufigkeit steigt gegenüber der Zeile darüber um das
Dreieinhalbfache — nicht weil das Polster kleiner wäre, sondern weil der linke Rand der
Verteilung länger geworden ist (E24) und das Sammeln härter am Wurf hängt. Gemessen über
zwanzig Seeds und dreihundert Ticks kommt der tödliche Rang in vier von hundert Ticks zu
kurz; die Rechnung und die Messung sagen dasselbe.

Gespielt bei 1,4 / 0,4: Zwei Würfe, 0,44 bei Tick 73 und 0,24 bei Tick 81, kosteten
28 % und 52 % der Menschen und beendeten den Lauf. Dieselben Würfe kosten mit dem
größeren Polster und der kleineren Exposition 2 % und 22 %.

**Nichtstun tötet nicht — es bleibt stehen.** Das ist die Grundregel, gegen die die
anderen gelesen werden. Eine Gemeinschaft, die nichts unternimmt, sitzt auf einem
niedrigen Niveau und bleibt dort; sie stirbt nicht aus. Zwei Gründe, und beide zählen:

- **Sachlich.** Menschen haben so über eine ungeheure Zeitspanne gelebt, ohne sesshaft
  zu werden. Ein Modell, in dem Stillhalten die Gemeinschaft beendet, behauptet, diese
  Lebensweise sei nicht tragfähig gewesen — das ist falsch. Die Nullhypothese der
  Epoche ist Beharren, nicht Aussterben.
- **Spieldynamisch.** Wer nichts tut und stirbt, lernt daraus nur, dass das Spiel unfair
  ist. Wer nichts tut und **auf der Stelle tritt**, sieht unmittelbar, wozu Handeln da
  ist.

**Gestraft wird Untätigkeit also mit Stillstand: Sie kommt nicht aus der Epoche heraus.**
Scheitern bleibt der Preis dafür, **falsch** zu handeln — zu bauen, wenn die Gemeinschaft
es am wenigsten tragen kann. Nie darf der Zufall allein den Ausschlag geben.

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

Gemessen: 993 gegen 139 Menschen, Faktor 7. Sterben muss dabei niemand.

**Wie an diesem Modell gerechnet wird.** Fast alles, was in diesem Modell wie eine
Geschmacksfrage aussieht, ist ausrechenbar — und wurde lange statt dessen durch Drehen
gesucht. Sieben Handgriffe, jeder in dieser Sitzung mindestens einmal entscheidend:

1. **Erst die Formel hinschreiben, dann drehen.** Jede Zahl steht in einer Beziehung zu
   anderen. Wer sie aufschreibt, sieht sofort, ob die Zahl überhaupt das kann, was von
   ihr erwartet wird. *So kam heraus, dass eine größere Decke den entnommenen Anteil im
   Gleichgewicht überhaupt nicht ändert — er folgt der Nachwuchsrate, nicht der Decke.*
2. **Fragen, was sich herauskürzt.** Kürzt sich die Kopfzahl, ist die Größe der
   Gemeinschaft nicht die Ursache. *So stellte sich heraus, dass der Startanteil allein
   am Ertrag des Reviers je Kopf hängt — nicht daran, wie viele Menschen es sind.*
3. **Stand, Fluss und Anteil auseinanderhalten.** Ein Füllstand kann Druck grundsätzlich
   nicht ausdrücken; er wird nach dem Nachwachsen gemessen. *Deshalb meldete das Revier
   über acht Seeds nie weniger als 86 %, während zwei Drittel davon jeden Tick genommen
   wurden — und die eine Antwort darauf war nie verfügbar.*
4. **Gleichgewichte über „Zufluss = Abfluss" suchen, und prüfen, welche Wurzel stabil
   ist.** *So ergab sich, wo der Bestand sich einpendelt und dass jenseits des Maximums
   der Nachwuchskurve kein Gleichgewicht mehr existiert, sondern ein Absturz.*
5. **Nachrechnen, was ein Grenzwert im Extremfall bedeutet.** *So fiel auf, dass eine
   Bedarfsstufe, die ihre volle Menge jeden Tick verlangt, statt nur den Abrieb, bei
   dreißig Menschen zweiundneunzig Kleidungsstücke anhäuft — und dass Bast dafür den
   ganzen Wald kostet.*
6. **Eine Schwelle in eine Häufigkeit übersetzen.** Eine Grenze allein sagt nichts; erst
   mit der Verteilung wird daraus eine Aussage. *„Ab Wurf 0,70 sterben Menschen" heißt
   jeder zehnte Tick, „ab 0,46" jeder sechsundfünfzigste.*
7. **Vor dem Glauben prüfen, ob das Maß noch sehen kann, was es misst.** Ein Kriterium,
   das nicht mehr scheitern kann, ist schlimmer als keines. *Vier Boserup-Maße standen
   auf null, weil sie fragten, wer Fläche **bezahlt** — und niemand bezahlt mehr Fläche.*

Und der Gegenprobe halber: Gerechnet wird, um zu wissen, **wo** man hinsehen muss.
Entschieden wird danach am einzelnen Tick (E30 — Durchspielen als Prüfung).

**Vor dem Drehen wird gerechnet.** Die Zahlen dieser Epoche hängen über wenige
Beziehungen zusammen, und wer sie kennt, muss nicht probieren. Sie sind hier
aufgeschrieben, damit niemand sie noch einmal durch Herumdrehen finden muss.

**1. Welcher Anteil eines Bestands am Anfang genommen wird.**

```
Anteil = Bedarf je Kopf ÷ (Fläche je Kopf × Dichte)
```

Die Kopfzahl kürzt sich heraus — sie steht in Zähler und Nenner. Der Startanteil hängt
also **nur** am Ertrag des Reviers je Kopf, nie an der Größe der Gemeinschaft. Beispiel:
1,8 ÷ (0,36 × 8) = 0,625.

**2. Was das Suchen kostet.** Der Preis ist der Mittelwert von `Decke / Bestand` über die
ganze Entnahme, also `(Decke / Entnahme) · ln(Stand / Rest)`. Auf einem vollen Stand
hängt er nur am Anteil `x`:

```
Kosten = (1 / x) · ln(1 / (1 − x))
```

| Anteil | 0,25 | 0,375 | 0,50 | 0,65 | 0,80 |
|---|---|---|---|---|---|
| Kosten | 1,15 | 1,25 | 1,39 | 1,62 | 2,01 |

**3. Wo das Wachstum aufhört.** Dort, wo das Essen alle Hände braucht:

```
Kosten am Ruhepunkt = (1 − übrige Arbeit je Kopf) ÷ (Bedarf je Kopf × Arbeit je Einheit)
```

Deshalb ist die Obergrenze **keine Stellschraube**: Jede arbeitssparende Technik hebt sie
von selbst — mit der Sichel (0,182 statt 0,28) rückt sie von rund 1,6 auf rund 2,5. Über
Anteil und Kosten lässt sich daraus die Kopfzahl am Ruhepunkt zurückrechnen.

**4. Was ein Bestand dauerhaft hergibt.** Die logistische Kurve hat ihr Maximum bei halber
Decke: `Rate × Decke ÷ 4`. Wird mehr genommen, fällt der Stand, bis die Kosten die
Entnahme bremsen. Bei Rate 4 ist dieses Maximum ungefähr so groß wie die Decke selbst —
deshalb nimmt eine Gemeinschaft von einem Zuwachs je Tick zwangsläufig den größten Teil, und
das ist bei einem Wuchs richtig und bei einer Herde alarmierend.

**5. Ab welchem Wurf Menschen sterben.** Geplant wird gegen `1 − Vorsicht`. Der tödliche
Rang wird berührt, sobald der Ertrag unter seinen Anteil am Gesamtbedarf fällt:

```
Faktor(Wurf) = Faktor(geplant) × (tödlicher Bedarf ÷ Gesamtbedarf)
```

wobei `Faktor(w) = 1 + Exposition · (w − 1)`. Und wie oft das vorkommt, sagt die Form der
Schwankung: `P(Wurf < x) = (x / Maßstab)^Exponent` mit `Maßstab = (Exponent+1)/Exponent`.

**Was diese fünf zusammen bedeuten.** Startanteil, Preisspanne, Ruhepunkt und
Hungerschwelle sind **nicht** unabhängig voneinander einstellbar. Wer den Startanteil
senkt, verschiebt zwangsläufig den Ruhepunkt zu mehr Menschen; wer das Polster
verbreitert, verschiebt die Hungerschwelle nach unten und macht Krisen seltener. Jede
dieser Zahlen ist deshalb erst zu rechnen und dann zu messen — nie zu raten.

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

**Der Entwicklungsbogen wird darum nicht am Schreibtisch entworfen.** Ein Übergang muss
einen Schmerz beantworten — und ein Schmerz wird **gefunden, nicht erfunden**. Der
Versuch, die Stufen bis zur galaktischen Zivilisation vorab durchzuplanen, ist
gescheitert: Jeder am Schreibtisch konstruierte Engpass hielt der Prüfung nicht stand.
Gebaut wird die nächste Stufe; der übernächste Übergang ergibt sich daraus, was beim
Spielen tatsächlich stört.

### E29 — Übergang 1: Jäger und Sammler → Siedlung

**Die Erzählung der Epoche.** Sie ist der Maßstab, gegen den alles andere geprüft wird:
der Verlauf, den Modell und Inhalt hervorbringen sollen.

#### 1 — Wie es anfängt

Die Gemeinschaft lebt auf einem Revier, das sie vorerst trägt.

Fast die ganze Arbeit ist gebunden. Hunger, Feuer und Kleidung sind meistens gedeckt, und
ein großer Teil der Hände geht in die Betreuung. Für Sättigung und Behaglichkeit reicht es
nicht in jedem Tick.

Bleibt alles, wie es ist, dünnt das Revier aus. Was langsam nachwächst, wird stärker
entnommen, als es nachkommt, und dieselbe Menge kostet nach und nach mehr Arbeit. Die
Gemeinschaft geht darum zurück, bis sie auf einem niedrigeren Niveau steht, auf dem sie
sich wieder hält.

Früher oder später trifft sie ein schlechter Tick — daran führt kein Weg vorbei, offen ist
nur wann. Dann bleiben zuerst Sättigung und Behaglichkeit unversorgt, und fällt er hart
genug aus, reicht es auch für Feuer oder gar Hunger nicht mehr, und Menschen sterben.
Danach erholt sie sich auf das Niveau, das inzwischen gilt.

**Was daran zu lernen ist**

- Arbeit ist die Währung, in der alles bezahlt wird. Knapp ist sie nicht immer — gute Ticks
  lassen etwas frei —, aber jede Entscheidung geht auf ihre Kosten.
- Ein dünner werdendes Revier zeigt sich nicht als leeres Land, sondern als mehr Arbeit für
  dieselbe Menge. Knappheit erscheint hier als Arbeitsaufwand.
- Stillhalten kostet. Es stellt sich wieder eine Ruhelage ein, aber auf einer kleineren Zahl.
- Die Krise kommt sicher, nur nicht absehbar wann — und sie trifft von zwei Seiten: weniger
  Ertrag und zugleich mehr Bedarf.

**Anker**

- Die Vorstellung von der müßigen Wildbeutergesellschaft stammt aus Zeitmessungen, die nur
  die Nahrungssuche zählten. Mit Verarbeitung, Werkzeugpflege und Betreuung rückt die
  Arbeitslast in die Größenordnung kleinbäuerlicher Gesellschaften (Hawkes/O'Connell gegen
  Sahlins).
- Wildbeuter lebten weit unter dem, was ihr Land theoretisch hätte tragen können — bei
  einem Fünftel bis zwei Fünfteln (Kelly). Diese Obergrenze rechnet, was ein Land
  hervorbringt, nicht was sich davon mit den vorhandenen Händen holen lässt. Und sie
  widerspricht dem Ausdünnen nicht: Zurück gehen die langsam nachwachsenden Arten, und die
  sind nur ein kleiner Teil dessen, was ein Land insgesamt hergibt.
- Dass ein Revier ausdünnt, wenn man bleibt, ist für langsam nachwachsende Arten belegt:
  Muschelschalen werden durch die Abfallschichten kleiner, und der Fang verschiebt sich von
  langsamer zu schneller Beute (Ertebølle; Stiner/Munro).

#### 2 — Die Wege heraus

Auf die Enge gibt es Antworten. Jede bindet Arbeit oder Material, und was hineingeht, fehlt
anderswo.

**Vorrat anlegen.** Was gewonnen und nicht gleich verbraucht wird, trägt durch eine
schlechte Zeit. In guten Ticks fällt das leicht, in schlechten spart man es sich vom Mund
ab.

**Revierwechsel.** Auf einem frischen Revier sind die Suchkosten wieder niedrig.
Weiterzuziehen ist für eine solche Gemeinschaft der Normalfall und kein Notbehelf. Es
begrenzt dafür ihre Zahl: Unterwegs müssen die Kleinen getragen werden, und tragen lassen
sich nur wenige — darum folgen die Geburten weit auseinander.

**Projekte.** Sie kosten Arbeit, Material oder beides, bevor etwas zurückkommt. Die einen
bringen dieselbe Menge mit weniger Händen. Die anderen holen aus demselben Revier mehr
heraus als bisher, aber jede Einheit kostet dann mehr Arbeit als zuvor — diesen Weg geht
man erst, wenn die Enge zwingt.

Die Wege zahlen zu verschiedenen Zeiten: der Revierwechsel sofort, der Vorrat erst in der
schlechten Zeit, ein Projekt erst, wenn es fertig ist.

**Was daran zu lernen ist**

- Alle Wege werden aus derselben Arbeit bezahlt. Was in den einen geht, fehlt beim anderen.
- Hände sparen und mehr aus demselben Revier holen sind nicht dasselbe: Das zweite kostet je
  Einheit **mehr** Arbeit, nicht weniger.
- Was die Gemeinschaft beweglich hält, hält sie zugleich klein.

**Anker**

- Weiterziehen war der Normalbetrieb und nicht die Notmaßnahme: Man brachte die Menschen zu
  den Ressourcen statt umgekehrt (Binford).
- Wie viele Kleinkinder zugleich getragen werden können, begrenzt, wie dicht Geburten
  aufeinanderfolgen (Blurton Jones).
- Die Traglast einer Frau — das Kind, getragen auf den Sammelwegen und bei den
  Lagerwechseln — setzt den Geburtenabstand; beides zusammen, nicht eines allein (Lee).
- Mehr je Fläche kostet mehr Arbeit je Einheit und geschieht unter Druck, nicht aus Einsicht
  (Boserup).

#### 3 — Was der Fortschritt bringt

Ein fertiges Projekt hebt die Deckung, und die Gemeinschaft wächst. Mit ihr wächst, was sie
dem Revier entnimmt: Die Dichte sinkt, die Suchkosten steigen, und bald steht sie wieder so
eng wie zuvor — nur mit mehr Menschen.

Ein Vorrat federt die schlechte Zeit ab. Er hebt nicht, wie viele hier leben können.

Ein Revierwechsel senkt die Suchkosten und ist über die Strecke mehrfach nötig. Auch er
hebt nicht, wie viele hier leben können, und jedes weitere Revier gibt im Mittel etwas
weniger her als das vorige.

Was bleibt, ist kein besseres Leben, sondern eine höhere Decke: Dasselbe Land trägt mehr
Menschen als vorher, und eine größere Gemeinschaft kann Projekte angehen, die einer kleinen
zu groß waren.

**Was daran zu lernen ist**

- Fortschritt wird in Köpfe umgesetzt, nicht in Wohlstand. Man wird nicht reicher, man wird
  mehr.
- Land und Arbeit sind hier dasselbe: Wo niemand Fläche belegt, zeigt sich knappes Land als
  Arbeit.
- Von den drei Wegen hebt nur einer die Decke. Die beiden anderen kaufen Zeit und Sicherheit.

**Anker**

- Wächst die Nahrung, wächst die Zahl der Menschen mit, bis der Vorteil aufgezehrt ist
  (Malthus).
- Zur Intensivierung treibt nicht die Einsicht, sondern der Druck der wachsenden Zahl
  (Boserup).

#### 4 — Wie die Epoche endet

Irgendwann wird ein Vorrat für Nahrung **gebaut**. Erst damit ist die schlechte Zeit
wirklich abgefedert; was ohne Bau zurückgelegt werden kann, hilft nur bedingt.

Zurück bleibt bei einem Revierwechsel ohnehin manches — auch ein Holzvorrat wandert nicht
mit. Neu ist, dass hier etwas **gebaut** ist: Einen Vorrat, der von selbst hält, kann die
Gemeinschaft vorher aufbrauchen, den Bau nicht. Je mehr davon steht, desto weniger lohnt
der Revierwechsel.

Irgendwann lohnt der Revierwechsel gar nicht mehr. Die Projekte haben die Decke gehoben,
aber wer bleibt, lebt dauerhaft auf einem dünnen Revier.

Heraus führt nur, sesshaft zu werden. Das ist eine Entscheidung, und sie beendet die
Epoche: Sie öffnet Projekte, die vorher nicht möglich waren, macht Eigentum zu einer
Einrichtung und verbilligt die Betreuung — wer nicht mehr zieht, muss die Kleinen nicht mehr
tragen, und die Geburten folgen dichter.

**Was daran zu lernen ist**

- Was gebaut ist, bindet an den Ort.
- Die Falle schnappt durch den eigenen Erfolg zu: Das Wirksamste gegen die Krise nimmt den
  ältesten Ausweg.
- Wo man nicht mehr weggehen kann, wird zur Frage, wem etwas gehört.

**Anker**

- Vorratshaltung setzt lagerfähige Nahrung und den Bau dafür voraus; was an den Ort bindet,
  ist, was man nicht mitträgt — sesshaft ist man, bevor man es beschließt (Testart).
- Gebaute Vorratsgruben sind älter als die ersten Nutzpflanzen: Gelagert wurde vor dem
  Ackerbau (Kuijt/Finlayson).
- Mit dem Sesshaftwerden rücken die Geburten dichter zusammen (Bocquet-Appel).

---

Über die ganze Strecke bleibt die Gemeinschaft **deutlich kleiner, als die Nahrung allein
zuließe**. Wäre sie so groß, ginge alle Arbeit ins Essen, und für Feuer, Kleidung und Vorrat
bliebe nichts — heraus käme eine Gesellschaft, die satt, nackt und frierend ist.

> Die Bevölkerung soll **nicht chronisch am Verhungern** sein; im Mittel war sie gut
> ernährt (Sahlins). Der Hunger ist die **Krise**, nicht der Alltag.

**Epoche „Jäger und Sammler".** Auf dem Bildschirm: Bevölkerung, Wildnis, Nahrung,
Deckung von Rang 100 und Rang 500 — Hunger und Sättigung, die beiden Nahrungsränge. Kein
Wohnraum, kein Holz, keine erschlossene Fläche, kein Vorrat.

> *Hier stand „Rang 100 und Rang 300".* Gemeint war der zweite Nahrungsrang.

Verfahrenskette der Branche Nahrung über das ganze Spiel:
`Sammeln` → `Ackerbau` → `Pflug` → `Maschinell`

Sammeln braucht **Wildnis**, kein erschlossenes Land: guter Ertrag je Arbeitsleistung,
sehr geringer je Fläche, hohe Empfindlichkeit gegen die Witterung. Nahrung hat eine
sehr hohe Verfallsrate — **kein Vorrat möglich** (E19).

**Die Bedarfe dieser Epoche.** Von der Physiologie her bestimmt, nicht von der Technik:
Was braucht ein Mensch, damit er nicht stirbt, Kinder bekommt und arbeiten kann.

| Rang | Bedarf | Gut | wirkt auf |
|---|---|---|---|
| 100 | **Hunger** | Nahrung | Überleben |
| 200 | **Feuer** | Wärme, aus Holz | Überleben |
| 300 | **Betreuung** | Betreuung, nur aus Arbeit | Überleben der Kinder; bemisst sich je Heranwachsendem |
| 400 | **Kleidung** | Kleidung, aus Fell oder Faser | Arbeitsfähigkeit |
| ganz hinten | *Vorrat anlegen* | — | siehe E19: Ziel ist die Speicherkapazität |
| 500 | **Sättigung** | Nahrung | Produktivität |
| 600 | **Behaglichkeit** | Wärme | Überleben der Kinder, mild |

Wieviel ein Rang je Kopf verlangt und wie hart seine Unterdeckung wirkt, steht im
Inhalt; das Konzept führt diese Zahlen nicht, damit es nicht mit jedem Austarieren
veraltet.

**Jeder Rang wirkt auf genau eine Achse.** Sättigung und Behaglichkeit taten vorher beide
dasselbe — Geburten *und* Produktivität — und unterschieden sich nur in der Größe der
Zahlen; das war keine Wahl, sondern dieselbe Wirkung zweimal. Jetzt trägt die Sättigung
die Kraft zu arbeiten und die Behaglichkeit die Kinder.

*Der Vorrat trägt keine Rangzahl.* Seine Vorgabe steht hinter jedem Bedarf, wo niemand
daran sterben kann; wohin er gehört, rückt der Spieler selbst (E1, E18).

Die Ränge stehen in **Hunderterschritten**, weil die Projektränge im selben Zahlenraum
liegen (E18) — dazwischen bleiben neunundneunzig Plätze für sie.

**Die Behaglichkeit bleibt, und zwar nicht als Geburtenhebel, sondern als obere Hälfte der
geteilten Wärme.** Kälte ist eine Schwelle und keine Rampe. Mit einer einzigen Wärmestufe,
linear verrechnet, kostete eine Deckung von 0,44 mehr als die halbe Sterblichkeit eines
ganz erloschenen Feuers, und die Kälte regelte die Bevölkerung, lange bevor der Hunger es
konnte. Fiele sie weg, wäre dieser Fehler zurück.

**Der Wohnraum ist ganz herausgenommen** — Rang, Gut, Branche und Verfahren. Seine Branche
ging erst mit der Sesshaftigkeit auf, und die Sesshaftigkeit beendet die Epoche: Der Bedarf
stand also immer bei null, und seine Zahlen waren gegen nichts ausbalanciert. Ein Rang, der
nie feuert, lässt sich nicht beurteilen. Er kommt mit der Epoche zurück, in der es Wohnraum
wirklich gibt, und dann mit etwas, wogegen er sich einstellen lässt.

**Das Tor der Sesshaftigkeit ist physisch: Man siedelt am Ufer.** Grube und Boot sind
Bauwerke in Scheiben — eine Grube hält eine Grubenmenge, ein Boot erschließt seine eigene
Wasserscheibe samt dem, was darin lebt; mehrere von beiden sind nötig (Speicher je Kopf und
eigene Wasserfläche als Bedingungen), und beide bleiben beim Revierwechsel am Ort, wie der
Brandbonus am Boden. Gebautes bindet — die Falle der Epoche als Mechanik, nicht als Text.
Nicht mehr gilt die frühere Begründung, die Welt werde stetig dünner und man siedle mangels
guter Reviere: Gesiedelt wird am guten Platz, aus Kapital im Boden und am Ufer (Testart;
die sesshaften Wildbeuterplätze sind Uferplätze).

**Dazugekommen sind der Angelhaken** (vertieft das Fischen über die Schnur, hängt am
Zwirnen) **und das Feuerlegen** (der Brand hebt die Pflanzendichte des Reviers; der Bonus
verblasst, weil das Unterholz nachwächst, Brennstoff ist stehendes Totholz, und beim Umzug
bleibt das Gebrannte am Boden — Boserup ohne Sonderregel: dichteres Land kostet laufend
Hände). **Das Fällen samt Baum-Bestand und Stämmen als Gut wandert in die
Siedlungs-Epoche**; die Steinaxt verbessert statt dessen die Totholz-Arbeit und ist Tor zu
Grube und Boot. Die Kleidungs-Projekte (Gerben, Zwirnen, Knochennadel) werden sichtbar,
wenn das Wild — die Rohquelle der Kleidung — teuer wird, gestaffelt nach Tiefe der Not.
Die Muschel ist als Reserve bepreist: im Alltag unangetastet, in Hungerticks trägt sie.

#### Wie sich die Gemeinschaft einregelt

**Die Bremse der Geburten ist die Traglast.** Wer wandert, trägt die Kleinen — auf jedem
Suchgang. Wie schwer das wiegt, ist die Kinderlast je Tragendem mal der Weite der Wege,
und die Weite der Wege sind die Suchkosten des Ticks: über die Bestände, aus denen
entnommen wurde, gewichtet mit der Arbeit, die hineinging. Frisches Land kostet eins und
bremst gar nicht. Dünnt das Revier aus, werden die Wege weit, und die Geburten rücken
auseinander; eine Krise nimmt die Kinder zuerst, danach ist die Last klein und die Wege
sind kurz, und die Gemeinschaft füllt sich mit nahezu voller Rate wieder auf. Die
Sesshaftigkeit hebt die Bremse für immer auf: Wer bleibt, trägt nicht — die Geburten
rücken zusammen.

**Wo die Gemeinschaft ruht, bestimmt die Traglast gegen die Grundgeburtenrate.** Die
Grundgeburtenrate ist das Tempo, mit dem sich die Gemeinschaft nach einem Verlust wieder
auffüllt. Behaglichkeit und Betreuung wirken weiter auf die Geburten, aber als
Krisenantwort, nicht als Setzer des Niveaus.

**Das Niveau hebt allein ein Projekt.** Und Projekte werden nicht aus Überschuss bezahlt,
sondern aus Deckung — der Rang sagt, worauf verzichtet wird — oder sie kommen nur in guten
Ticks voran.

**Der Revierwechsel holt zurück, was das Bleiben gekostet hat.** Wer bleibt, dessen
Suchkosten steigen, dessen Behaglichkeit fällt und dessen Geburten sinken. Der Wechsel
senkt die Suchkosten für einige Ticks, und in diesen Ticks ist zweierlei zu holen: **die
Arbeit, die sonst in die teuren Wege ginge, kann in ein Projekt gehen, und die Traglast
ist leicht — auf frischem Revier rücken die Geburten zusammen.** Sein Wert ist das
Baufenster und der Geburtenlohn.

Er füllt das Revier deshalb **nicht auf die Decke, sondern schließt einen Teil der Lücke**
zwischen dem, was steht, und dem, was der Boden tragen könnte. Ein Anteil der *Decke* wäre
falsch: Die Bestände kommen bei sehr verschiedenen Dichten zur Ruhe, und ein gemeinsamer
Anteil hübe die dünnen und drückte die vollen — ein Wechsel machte dann manchen Bestand
schlechter. Ein Anteil der *Lücke* senkt keinen, und die ausgezehrten gewinnen am meisten.

**Und was ihn wertvoll macht, ist ein Verhältnis:** Was er freimacht, muss größer sein als
was er kostet. Ist er zu teuer, wird nie gezogen; ist er zu billig oder zu großzügig, wird
nur noch gezogen und nichts mehr gebaut.

**Nur die schnell nachwachsenden Bestände wurden verlangsamt, dichter gemacht wurden alle.**
Ein Bestand, der sich innerhalb eines Ticks wieder füllt, kann gar nicht ausdünnen — dort
muss die Rate herunter. Die ohnehin langsamen ebenfalls zu verlangsamen ist ein Fehler:
Gemessen wurden sie damit unwiederbringlich, und die Gemeinschaft starb an der Kleidung,
lange bevor der Hunger sie erreichte. Die Dichte dagegen gehört überall angehoben, damit die
Verhältnisse zwischen den Beständen bleiben — sonst wächst die Gemeinschaft in die eine
gehobene Decke hinein und räumt die übrigen ab.

**Krisen treffen die Kinder härter als die Erwachsenen, und ohne das gibt es keine
Erholung.** Über das Aufwachsen gerechnet erreicht etwa die Hälfte der Kinder das
Erwachsenenalter nicht — auch ohne Krise. Das lässt das Verhältnis Kinder zu Erwachsenen
unberührt, denn das hängt an der Aufrückrate und der Sterblichkeit der Erwachsenen; es hebt
statt dessen, wieviele Geburten nötig sind, um es zu halten. Der Geburtenstrom wird dadurch
groß genug, dass die Bevölkerung auf ihre Bremsen **antwortet**, statt sie zu ignorieren.

#### Die Betreuung

**Sie ist der Anspruch auf Arbeit, den kein Fortschritt verbilligt.** Sichel, Mörser und
Axt machen Nahrung, Wärme und Holz billiger — an der Sorge für die, die nicht für sich
sorgen können, geht keine davon vorbei. Der Anspruch wächst mit der Zahl der
Heranwachsenden, und damit ist er der Boden, gegen den die Gemeinschaft klein bleibt.

**Ein Gut, das sich nicht auf Vorrat legen lässt.** Es verfällt vollständig je Tick — wer
heute nicht betreut, hat es nicht nachgeholt. Sein Verfahren verbraucht **nur Arbeit**,
keine Fläche und kein Material, und es hängt nicht am Wetter: Kinder brauchen Betreuung bei
jedem Wurf.

**Sie ist keine neue Arbeit, sondern Arbeit, die sichtbar wird.** Die berühmten kurzen
Arbeitstage der „ursprünglichen Überflussgesellschaft" zählten allein die Nahrungssuche;
mit Verarbeitung, Werkzeugpflege und der Sorge für Kinder rückt die Last in die
Größenordnung kleinbäuerlicher Gesellschaften. Die Koeffizienten der Verfahren sind gegen
dieselbe Wirklichkeit ausbalanciert, also steckte die Betreuungszeit stillschweigend schon
in ihnen. Sie herauszuziehen heißt deshalb nicht, Arbeit hinzuzufügen, sondern **den Tag
richtig zu messen** — und der Ausgleich gehört auf die Angebotsseite, nicht in die
Koeffizienten: Die Grundproduktivität steigt um genau das, was sichtbar geworden ist.

**Die Bedarfe der anderen Ränge werden dafür nicht gesenkt.** Sie sind Physiologie und
ausdrücklich keine Stellschraube.

**Die beiden Überlebenszahlen sagen, wie hart eine Not landet — nicht, wie oft eine
eintritt.** Wie oft, sagt die Verteilung der Würfe (E24); wie hart, sagen diese Zahlen,
und beide gehören zusammen eingestellt. Ein tiefer Wurf, der die Gemeinschaft auf einmal
zerreißt, lehrt nichts: Es gibt kein Danach, in dem die nicht gegrabene Grube geholfen
hätte. Deshalb steht der Hunger bei 0,65 und nicht bei 0,10 — ein Tick ohne Essen kostet
ein Drittel der Menschen, und die Krise hat ein Vorher, ein Währenddessen und ein Nachher.

**Und das Feuer trägt die Not nicht, es begleitet sie.** Es fällt im selben Tick aus wie
die Nahrung, weil beide am selben Wurf hängen und der Hunger jede Hand zuerst nimmt.
Schwer bewertet war es deshalb nicht ein Teil der Krise, sondern *die* Krise — die
Gemeinschaft erfror, während sie sich noch ernährte. Bei 0,94 kostet ein ausgefallenes
Feuer sechs Hundertstel, und die Toten eines schlechten Ticks sind die des Hungers.

**Der Feuerausfall muss überlebbar sein.** Bei Nulldeckung stand das Überleben einmal
auf 0,40 — drei Fünftel der Menschen in einem Tick. Aus so etwas erholt sich keine
Gruppe, und ein Rang, dessen Ausfall das Spiel beendet, lehrt nichts. Bei 0,75 kostet er
rund ein Viertel: hart genug, dass der Holzvorrat sich lohnt, mild genug, dass die
Gruppe die Lehre daraus noch anwenden kann. Die Ordnung bleibt: Hunger tötet mit 0,10
ungleich schneller, denn gegen Kälte helfen Kleidung und Zusammenrücken, gegen fehlende
Nahrung hilft nichts.

#### Wieviel Arbeit ein Bedarf beansprucht

**Jeder Rang beansprucht einen Anteil an der Arbeit der Gemeinschaft, und dieser Anteil
ist eine Festlegung — keine Nebenfolge der Koeffizienten.** Er lässt sich ohne jeden Lauf
ausrechnen: der Fluss, den ein Rang je Kopf verlangt, mal dem, was eine Einheit davon an
Arbeit kostet, die Vorleistungen eingerechnet, geteilt durch das, was ein Kopf leistet.
Was verbraucht wird, wird jeden Tick neu verlangt; was nur getragen wird, nur in Höhe
seines Verfalls.

**Warum das eine eigene Festlegung ist und keine Balancefrage:** Ein Rang ist nur dann
*teilweise* gedeckt, wenn das Angebot **innerhalb** seines Bedarfs endet — und die
Wahrscheinlichkeit dafür ist ungefähr sein Anteil am Ganzen. Ein Rang mit einem Prozent
der Arbeit ist in einem Tick von hundert der klemmende und in den anderen
neunundneunzig ein **Schalter**: an oder aus, nie dazwischen. Wer nie klemmt, kann auch
nicht der Bedarf sein, an dem sich die Bevölkerung einpendelt.

Gemessen war das kein Randfall: Die Kleidung beanspruchte **vier Promille** der Arbeit,
während ihr Ausfall zwei Fünftel der Arbeitsfähigkeit kostete — ein Hebel, der nichts
kostet und alles bewirkt, und einer, der niemals einen Verlauf zeigen konnte. Der Grund
ist, dass Kleidung getragen und nicht verbraucht wird: Verlangt wird nur der Verfall.

**Die Zielanteile auf unberührtem Land:**

| Rang | Anteil |
|---|---|
| Hunger | 17 % |
| Sättigung | 17 % |
| Betreuung | 14 % |
| Behaglichkeit | 9 % |
| Kleidung | 8 % |
| Feuer | 4 % |
| übrig für Projekte | rund ein Drittel |

**Es ist ein Band, kein Punkt** — belegt ist die Größenordnung, nicht die Ziffer, also
darf jeder Anteil um ein Drittel danebenliegen. Und die Anker sind Jahresmittel, Winter
und Sommer zusammen: die Nahrungssuche etwa die Hälfte aller Arbeit, sobald Verarbeitung,
Werkzeug und Betreuung mitgezählt werden; Brennstoff ein bis zwei Stunden am Tag; Felle
und Faser über ein Jahr in derselben Größenordnung. Dass die Nahrung hier trotzdem bei
einem Drittel steht, ist kein Widerspruch: Gerechnet wird für **unberührtes Land**, und
im Spiel heben die Suchkosten sie um gut die Hälfte — gemessen auf 57 %.

**Der Anteil für Projekte wird dabei nicht angetastet.** Umverteilt wird zwischen den
Rängen; wächst ihre Summe, wird die Epoche länger.

**Das Feuer liegt bewusst unter der Grenze**, ab der ein Rang ein Regler sein kann. Es ist
klein und steht weit unten, damit es fast immer bedient wird: An ist der Normalfall, Aus
ist die Krise. Bei ihm ist der Schalter die Absicht.

**Die Arbeit je Nahrung war einmal um die Hälfte teurer angesetzt als ganz zu Anfang.**
Der Grund galt und gilt: Lag die Hälfte der Arbeitsfähigkeit brach, konnte kein schlechter
Wurf wehtun und keine Technik sich lohnen, denn eine neue Technik kostet gerade mehr
Arbeit, und wo Arbeit übrig ist, ist das kein Tausch. Extern gestützt ist die Richtung
dadurch, dass der niedrige Wert aus der Behauptung von der ursprünglichen
Wohlstandsgesellschaft stammt und zurückgewiesen wurde, sobald Verarbeitung, Werkzeugbau
und Wege mitgezählt wurden. Ein Teil davon ist inzwischen wieder abgegeben — an die
Kleidung und die Wärme, die vorher fast nichts kosteten —, und der Druck bleibt trotzdem,
weil die Summe der Ansprüche dieselbe ist.

**Wärme steht zweimal darin, und Nahrung auch**, aus demselben Grund (E20): Kälte ist
eine Schwelle, kein Hang. Halbe Rationen sind Hunger; halbes Brennholz ist ein kalter
Winter, kein halbes Erfrieren. Ein kleiner lebensnotwendiger Rang und ein
Behaglichkeitsrang darüber sagen das, ohne dass ein Koeffizient verbogen werden muss.

**Warum nur diese.** *Wasser* ist lebensnotwendig, aber für eine wandernde Gruppe
nie knapp — man lagert daran; ein Bedarf, der immer gedeckt ist, ist Rauschen.
*Wohnraum* gehört nicht hierher, denn ein dauerhaftes Haus **ist** die Sesshaftigkeit;
was eine Gruppe unterwegs braucht, ist Fell und Faser. *Werkzeuge* sind kein Bedarf,
sondern ein Mittel, und stecken in den Verfahren. *Schmuck und Ritual* sind
archäologisch auffällig, aber nach E9 muss jede Stufe in eine reale Größe zurückzahlen,
und für Ritual fällt keine ein, die nicht behauptet wäre.

**Warum Wärme und Kleidung getrennt**, obwohl beides gegen Kälte hilft: Sie sind nicht
austauschbar — man kann kein Feuer mittragen, und ein Fell ersetzt keine Nacht am Feuer.
Und sie verhalten sich als Bestände verschieden, was die Epoche gerade nützlich macht:
**Feuer wird verbraucht**, **Kleidung nutzt sich langsam ab**, **Nahrung wird gegessen
und verdirbt zugleich**. Drei Beispiele für die Unterscheidung aus E19.

**Kleidung wirkt auf die Arbeitsfähigkeit**, nicht auf Sterbe- oder Geburtenrate. Die
ehrliche Wirkung ist nicht „man stirbt ohne Mantel", sondern „man kann weniger Tage
draußen arbeiten" — und das ist nach E16 die Arbeitsfähigkeit, nicht die Produktivität.
Rechnerisch ist es dieselbe Multiplikation; getrennt geführt kann die Oberfläche später
sagen, *wieviel* gearbeitet werden konnte und *wie ergiebig* das war.

**Wärme ist ein eigenes Gut, kein Bedarf auf Holz.** Ein Verfahren macht aus Holz Wärme,
so wie ein anderes aus Holz Wohnraum macht. Das ist die Form, die trägt, sobald eine
zweite Quelle dazukommt — Kohle, Gas —, und sie kostet nichts, solange es nur eine gibt.

**Woraus die Bedarfe gedeckt werden** — Schritt 2 aus E31:

| Gut | Verfahren | Quelle |
|---|---|---|
| **Nahrung** | Sammeln, Jagd, Fischfang | Wildnis, **Wasser** |
| **Holz** | Holzschlag | Wildnis |
| **Wärme** | Feuerstelle | Holz |
| **Felle** | Jagd auf Felle | Wildnis |
| **Faser** | Bastgewinnung | Wildnis |
| **Kleidung** | Gerben, Flechten | Felle *oder* Faser |

Drei Kapazitäten: Köpfe, Wildnis, **Wasser**. Speicher entsteht aus den Gruben,
Ackerland erst mit der Sesshaftigkeit.

**Wasser ist die zweite Achse, und strukturell das Wichtigste an der Epoche.** Sonst
konkurriert alles um dieselbe Wildnis — Nahrung, Holz, Felle, Faser —, die Gruppe sitzt
an der Tragfähigkeitsgrenze, und jede Verbesserung verschiebt nur, wer die Fläche
bekommt. Wasser nimmt der Wildnis nichts weg.

Fachlich ist es die Hauptsache und nicht Beiwerk: Das europäische Mesolithikum ist
wesentlich eine Anpassung an Küste und Fluss — Ertebølle, die Køkkenmøddinger, die
Fischwehre von Friesack —, und die frühe Sesshaftigkeit sitzt fast überall dort, wo
Wasser verlässlich Nahrung gab. Sesshaft wurde man am Fisch, bevor man am Korn sesshaft
wurde.

**Das Wasser liegt von Anfang an im Revier, und ein Verfahren darauf ist von Anfang an
möglich** — Muscheln am Ufer sammeln braucht keine Technik, und Menschen tun es seit
jeher. Nur ist der Ertrag mager. Der Reiz liegt deshalb nicht im Aufschließen, sondern
im Lohnenderwerden, und das ist die ehrlichere Lehre: **Technik schafft eine Ressource
nicht, sie erschließt sie.**

**Zwei Wege zur Kleidung, und das ist die erste echte Alternative der Epoche** im Sinne
von E31 — sie ändert das Risikoprofil, nicht den Ausgang. Felle brauchen **viel Fläche
und wenig Arbeit**, Faser **wenig Fläche und viel Arbeit**. Ist das Land knapp, gewinnt
die Faser; sind die Hände knapp, gewinnen die Felle. Beide Zahlen stehen dem Spieler vor
Augen, also ist die Wahl beurteilbar. Und sie sagt etwas Wahres: Als das Land eng wurde,
ging man von tierischen auf pflanzliche Rohstoffe über.

> Zwei Verfahren auf derselben Kapazität **konkurrieren** — eine Kapazität wird zwar
> nicht verbraucht, aber je Tick **belegt** (E4). Daran hängt der ganze Malthus-Druck
> der Epoche.

**Verfahren heißen nach Tätigkeiten**, durchgehend: Sammeln, Jagen, Fischen, Holzschlag,
Gerben, Flechten — und auch die Arbeit selbst ist eine Tätigkeit. Der Bestand heißt nach
der Sache, das Verfahren nach dem Tun; heute ist das noch gemischt (`forestry`, `labor`
neben `gathering`, `hunting`).

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

#### Schritt 3 — die Stufen je Bedarf

Der Zuschnitt folgt nicht der Vielfalt, sondern dem **Auszahlungsprofil**: sicher und
klein, sofort aber auf der anderen Seite der Rechnung, später aber groß. Drei Knöpfe,
die alle „Zahl wird größer" bedeuten, sind keine Entscheidung, wie viele es auch sind.

Deckung kann auf **fünf Achsen** besser werden, und kein Projekt der Epoche doppelt eine
andere:

| Achse | was besser wird |
|---|---|
| **je Hand** | dieselbe Fläche, weniger Arbeit |
| **je Fläche** | dieselbe Arbeit, mehr aus dem Land — Boserups Intensivierung |
| **je Vorleistung** | dieselbe Einheit, weniger Material — der Urahn jeder Energieeffizienz |
| **gegen den Wurf** | dieselbe Menge, geringere Schwankung |
| **gegen den Verfall** | dieselbe Ernte, länger haltbar |

**Verfahren ab Tick 0**, keines freizuschalten. Der Anfang ist damit nicht leer, und die
Konkurrenz zwischen Sammeln und Jagen auf derselben Wildnis ist von der ersten Sekunde
an der Malthus-Druck der Epoche:

| Gut | Verfahren | Eigenart |
|---|---|---|
| Nahrung | **Sammeln** | Wildnis; gut je Hand, mager je Fläche, ganz dem Wurf ausgeliefert |
| Nahrung | **Jagen** | Wildnis; mager je Hand, sehr mager je Fläche, schwankt stark |
| Nahrung | **Fischen** | Wasser; mager je Hand, aber vom Wetter kaum berührt |
| Holz | **Holz sammeln** | Totholz auflesen: viel Laufen, wenig Holz |
| Wärme | **Feuer machen** | offenes Feuer, verschwenderisch |
| Felle | **Jagen** (auf Felle) | viel Fläche, wenig Arbeit |
| Faser | **Bast sammeln** | wenig Fläche, viel Arbeit |
| Kleidung | **Felle zurichten** *oder* **Flechten** | zwei Verfahren, ein Bestand, verschiedene Eingänge |

Die Jagd ist ausdrücklich **nicht** freizuschalten: Der Mensch jagt Großwild seit
hunderttausenden Jahren (Schöninger Speere). Ein Spiel, in dem man sie erfinden muss,
behauptet Unsinn.

**Die Projekte der Epoche** (Stand siehe Inhalt; dazugekommen sind Angelhaken und
Feuerlegen, das Fällen ist in die Siedlungs-Epoche gewandert):

| Projekt | wirkt auf | Achse | Anker |
|---|---|---|---|
| **Sichel** | Sammeln | je Hand | Natufien, Klingen mit Sichelglanz; Harlans Erntversuch |
| **Mörser und Stößel** | Sammeln | je Fläche | Natufien, Wadi Hammeh; Flannerys *broad spectrum revolution* |
| **Feuerlegen** | das Revier selbst | **je Fläche** — der Brand hebt die Pflanzendichte, der Bonus verblasst mit dem nachwachsenden Unterholz | mesolithisches Brennen aus Holzkohle- und Pollenprofilen (Mellars) |
| **Pfeil und Bogen** | Jagen | je Hand | Stellmoor ~10.000 v. Chr., Bögen von Holmegaard |
| **Angelhaken** | Fischen | je Hand | Widerhaken und Haken aus Knochen und Geweih, mesolithischer Massenbefund; die Schnur ist gezwirnter Bast |
| **Fischernetz** | Fischen | je Hand | Netz von Antrea ~8300 v. Chr., aus Bastfaser |
| **Boot** | Fischen | **mehr Fläche** — nutzbares Wasser | Einbaum von Pesse ~8000 v. Chr. |
| **Vorratsgrube** | Speicher | gegen den Verfall | Dhra' ~9500 v. Chr. (Kuijt & Finlayson 2009) |
| **Steinaxt** | Holz sammeln | je Hand; dazu Tor zu Grube und Boot | mesolithische Kernbeile |
| **Erdofen** | Feuer machen | **je Vorleistung** | Kochgruben und Brandhügel, mesolithischer Massenbefund |
| **Gerben** | Felle zurichten | je Hand | Rinden- und Hirngerbung |
| **Zwirnen** | Flechten | je Hand | Zwirnbindung; gedrehte Faser vom Abri du Maras, Schnurabdrücke durchs Mesolithikum |
| **Knochennadel** | **beide** Kleidungswege | je Hand **und** gegen den Verfall | Öhrnadeln seit dem Jungpaläolithikum |
| **Revierwechsel** | das Revier selbst | **frisches Land**, mit fallender Güte | Ricardos Differentialrente; Wildbeutermobilität |
| **Sesshaftigkeit** | der Übergang selbst | — | Testart |

Drei Entscheidungen daran sind begründungsbedürftig:

- **Die Steinaxt verbessert die Totholzarbeit und ist das Tor zu Grube und Boot.** Der
  Baum als Bestand und das Fällen sind in die Siedlungs-Epoche gewandert; was die Axt
  hier tut, ist dieselbe Arbeit billiger machen — Äste werden an Ort und Stelle zerlegt
  statt ganz geschleift. Ihr Gewicht in dieser Epoche liegt darum nicht in ihrer Achse,
  sondern darin, dass ohne sie zwei andere Projekte verschlossen bleiben.
- **Die Knochennadel wirkt auf beide Kleidungswege**, sonst macht sie die Alternative
  kaputt. Das Gerben stärkt den Fellweg — das ist gewollt und gibt der Wahl Gewicht.
  Bevorzugte aber *jedes* Kleidungsprojekt einen Weg, wäre der andere nach zwei
  Projekten nur noch schlechter, und die Alternative war eine Falle.
- **Wärme braucht kein Projekt „gegen den Wurf"**, weil der Wärmebedarf selbst am Wetter
  hängt: Ein kalter Winter verlangt mehr. Das ist die Nachfrageseite des Zufalls (E24).

> **Ein Projekt heißt, wie ein Laie die Sache nennt** — der Fachbegriff steht im Anker,
> nicht auf dem Knopf. „Sichelklinge" ist das archäologische Wort für das Ding, das
> jeder als Sichel kennt; es kostet Verständlichkeit und bringt keine Genauigkeit.
> Deshalb auch *Steinaxt* statt *Beil*: kein Fachwort, sagt nebenbei, in welcher Welt
> der Spieler ist, und lässt später Platz für die Eisenaxt.

#### Wie ein Projekt verfügbar wird

**Man verbessert, was man tut.** Eine Sichel kommt aus vielen Ernten, ein Netz aus vielen
Fischzügen. Der Zustand zählt je **Tätigkeit** mit, wieviel damit erzeugt wurde, und ein
Projekt, das eine Tätigkeit verbessert, verlangt Übung darin.

Das **verzögert und blockiert nie**: Wer weiter sammelt, bekommt die Sichel, und ein
schlechter Tick kostet ein paar weitere. Und es ordnet sich nach dem, was der Spieler
tatsächlich tut — wer viel fischt, bekommt zuerst das Netz. Der Baum wächst aus der
eigenen Wirtschaft, statt vorgeschrieben zu sein. Anker: Arrow, *Learning by Doing* —
Stückkosten fallen mit der kumulierten Menge, nicht mit der Zeit.

**Tätigkeit ist eine Eigenschaft des Verfahrens**, und weder die Branche noch das
Verfahren selbst: Jagd auf Fleisch und Jagd auf Felle liefern in verschiedene Branchen
und sind dieselbe Tätigkeit; Sammeln mit Sichel ist immer noch Sammeln. Sie steht einmal
am Verfahren, damit zwei Projekte sich nicht darüber uneinig werden können, was „Sammeln"
ist.

**Sichtbar wird ein Projekt, wenn der Mangel drückt, den es beantwortet — ausführbar,
wenn die Übung da ist.** Das sind zwei verschiedene Fragen, und sie werden an zwei
verschiedenen Größen gemessen: Ob etwas gebraucht wird, sagt der Zustand der Wirtschaft;
ob man es kann, sagt das, was bisher getan wurde. Der Mörser wird sichtbar, wenn das
Sammeln teurer wird, und ausführbar aus vielen Ernten; die Sichel, wenn das Sammeln je
Kopf mehr Hände frisst; der Erdofen, wenn das Totholz knapp wird. Wo ein Projekt ein
anderes sachlich voraussetzt, steht diese Voraussetzung zusätzlich auf der
Ausführbarkeit.

Es steht also erst grau da mit dem, worauf es wartet — das ist der Reiz, weiterzumachen,
statt einer unerreichbaren Liste. Am ersten Tick steht nichts auf dem Schirm; ab dem
zweiten wächst die Karte herein.

**Ausgenommen sind Vorsorge und Fläche.** Vorratsgrube, Revierwechsel, Boot und
Sesshaftigkeit verlangen keine Übung — eine Grube gräbt man, man erfindet sie nicht.

Die Grube wartet statt dessen darauf, dass die **Nahrungsgewinnung ergiebig** geworden
ist. Sie ist der Weg aus der Epoche und **darf nicht zu früh aufgehen**; und weil sie
spät kommt, hat der Spieler bis dahin ohnehin mehrere schlechte Ticks erlebt und weiß,
wofür ein Speicher da ist — **das erledigt der Zufall von allein**, es muss nichts
gezählt werden. Nebenbei ist der Revierwechsel dadurch früh billig und später teuer,
ohne dass ein Wort darüber verloren wird: Wer noch nichts gegraben hat, lässt nichts
zurück.

**Der Revierwechsel hat gar keine Marke.** Wer wandern kann, kann immer wandern: Eine
Gemeinschaft, die ihren ganzen Hausstand mit sich trägt, ist am ersten Tick so frei zu
gehen wie am hundertsten. Ausführbar ist er, solange nicht sesshaft — sonst steht nichts
davor.

**Was der Zustand des Reviers entscheidet, ist allein seine Stellung in der Reihenfolge
der möglichen Projekte.** Je dünner die Bestände, desto weiter oben steht das Angebot. Das
ist die Warnung; ein Erscheinen und Verschwinden wäre sie nicht, denn ein Angebot, das mit
einem Bestand kommt und geht, kann auch keinen Fortschrittsbalken tragen.

Wert ist der Wechsel dabei genau das, was das ausgedünnte Revier an Mehraufwand bei der
Suche gerade kostet — **geteilt durch die Zahl der Ticks, die ein frisches Revier frisch
bleibt.** Ohne diese Teilung ist er gegen eine Technik überhaupt nicht abzuwägen: Eine
Technik zahlt, solange die Epoche dauert, ein Umzug nur, bis das Revier wieder ausgedünnt
ist. Ungeteilt stünde er von dem Augenblick an obenan, in dem irgendetwas dünner wird.
Dazu skaliert mit dem, was gerade angeboten wird, gegen das, worauf man steht.

**An den Suchkosten hing er zuvor, und das war falsch.** Die Suchkosten tragen das Wetter:
Ein Verfahren, das seinen Ertrag findet, läuft auf Ziel geteilt durch Wurf, also holt die
Gemeinschaft bei schlechtem Wurf mehr aus demselben Stand. Über 1680 Ticks gemessen liegt
die Beziehung zwischen Suchkosten und Wurf bei −0,71; im schlechtesten Wurfviertel stehen
die Kosten bei 2,02, im besten bei 1,35. Eine Marke darauf feuert gegen Wetter — und gegen
Wetter hilft kein Umzug, weil das Wetter mitzieht. Die Dichte der Bestände, am Tickende
nach der Entnahme gelesen, ist der ruhige Ersatz: Beziehung zum Wurf 0,03.

**Und ohne Marke ist der Wechsel trotzdem kein billiger Neuanfang.** Die Bremse ist die
fallende Güte: Jedes weitere Revier trägt weniger als das vorige, wer das gute Land früh
verbraucht, steht später auf schlechtem. Diesen Preis zahlt der Spieler selbst, und er
braucht keine Sperre, die ihn erzwingt.

**Die Steinaxt hängt allein an der Übung im Holz, an keiner Knappheit.** Sie beantwortet
keinen Mangel: Was sie erschließt, ist der stehende Wald, und den verlangt niemand, bevor
es die Axt gibt — wem Brennstoff fehlt, der liest mehr von dem auf, was gefallen ist. Am
Brennholz gemessen war ihre Marke außerdem nicht verlässlich zu erreichen: Der höchste
Suchkosten für Totholz, den ein ganzer Lauf überhaupt erreicht, liegt zwischen 1,13 und
1,31, die Marke lag also im Rauschen. Drei von acht Seeds kamen darüber, und daran hing,
ob die Epoche zu Ende gespielt werden konnte, denn ohne Axt keine Grube und ohne Grube
keine Sesshaftigkeit. Übung im Holz fällt nie, also wird sie in jedem Lauf erreicht.

#### Schritt 4 — was worauf aufbaut

**Es gibt fast keine Projektketten.** Nur eine, und die ist materiell zwingend. Alles
andere baut nicht auf Projekten auf, sondern auf **Vorleistungen** — und das ist der
Unterschied zwischen einem Baum und einer Sperre.

| Projekt | Voraussetzung | warum sachlich |
|---|---|---|
| Mörser und Stößel, Erdofen, Revierwechsel | — | Stein auf Stein; eine Grube; man geht weiter |
| Sichel, Steinaxt | Holz | Schaft und Schaft |
| **Vorratsgrube** | **Steinaxt**, dazu Holz | Auskleidung und Pfosten kommen vom stehenden Stamm; aufgelesenes Totholz ist kurz und mürbe, und der Erdofen spart Brennstoff, erschließt aber kein Bauholz |
| Gerben | Felle | offensichtlich |
| Fischernetz, Knochennadel, Zwirnen | Faser | ein Netz ist Bast, eine Nadel ohne Faden nichts, und gezwirnt wird Bast |
| Pfeil und Bogen | Holz **und** Faser | Stave und Sehne |
| **Boot** | **Steinaxt**, viel Holz | einen Stamm höhlt man nicht mit der Hand aus |
| Sesshaftigkeit | gebaute Speicherkapazität, 2 je Kopf | siehe unten |

**Warum das trotzdem ein Baum ist.** Auf dem Papier sind zehn der zwölf ab Tick 0
freigeschaltet — in der Wirtschaft sind sie es nicht. Am Anfang geht **alles Holz in die
Wärme**: Wärme steht auf Rang 200 und tötet, Projekte rangieren darunter (E18). Es gibt
kein Holz übrig, also ist kein Holzprojekt machbar. Und **Faser gibt es nur, wenn jemand
Bast sammelt** — das kostet Hände, die dann nicht sammeln oder jagen.

Tatsächlich anfangbar sind am ersten Tick genau **drei**: Mörser, Erdofen, Landnahme.
Das ist der untere Rand der drei bis fünf aus E31, und es sind drei wirklich
verschiedene Antworten auf dieselbe Enge — mehr aus der Fläche holen, weniger
verschwenden, mehr Fläche nehmen.

> **Das Rückgrat der Epoche, in einem Satz:** Um zu bleiben, brauchst du Gruben. Für
> Gruben brauchst du eine Axt — und Holz übrig, wofür entweder die Axt selbst sorgt oder
> ein Feuer, das weniger verschwendet.

Die Axt steht damit **materiell** vor der Sesshaftigkeit, ohne dass diese eine zweite
Bedingung bekäme: Sie behält ihre eine — gebaute Speicherkapazität — und erbt die Axt
über die Grube. Der Erdofen bleibt eine echte Alternative im *Wie*, weil er Hände frei
macht; ein zweiter Weg aus der Epoche ist er nicht mehr.

Danach öffnet sich der Rest von selbst: Die Axt gibt so viel Holz, dass das Boot möglich
wird; wer Hände in den Bast steckt, bekommt Netz, Bogen und Nadel dazu. **Was du als
Nächstes tun kannst, hängt daran, was deine Wirtschaft gerade herstellt** — das ist die
Lehre, für die diese Epoche da ist.

**Die Bedingung wird aus den Kosten gerechnet, nicht hingeschrieben:**

> Ein Projekt ist ausführbar, sobald der Bestand reicht, es **einen Tick lang im
> schnellstmöglichen Tempo** zu speisen — also Vorleistung ÷ Mindestdauer.

Keine neue Zahl, sondern eine Division zweier ohnehin vorhandener; damit können die
beiden auch nicht auseinanderlaufen. Angezeigt als „Faser: 0 von 3", und der Spieler
liest die richtige Antwort daran ab: *jemand muss Bast sammeln.* Der volle Vorrat vorab
wäre die schlechtere Regel — man dreht die Schnur, während man das Netz knüpft, und ein
Vorrat, den man nur für eine Schwelle anlegt, verdirbt unterwegs. Läuft das Projekt,
übernimmt die laufende Produktion, und stockt sie, greift das Teiltempo (E18):
Schwankung verzögert, sie blockiert nicht.

**Wo die Zahlen stehen.** Kosten, Wirkungsgrößen und Amortisationsziele sind
**Hypothesen und keine Beschlüsse** — sie stehen in der Inhaltsdatei, damit gemessen
werden kann, und kommen erst hierher, wenn sie gemessen sind (E27). Der eine Wert, der
schon feststeht, ist das Zielband der Amortisation: **klein 10–15, mittel 20–30, groß
40–60 Ticks**, also innerhalb eines Fünftels bis Drittels der Epoche. Wer länger
braucht, trifft eine Entscheidung, deren Nutzen er nie erlebt.

Dass die Entscheidung dadurch nicht wertlos wird, liegt nicht an der Rechnung, sondern
am **Zeitpunkt**: Ein merklicher Teil der Hände über etliche Ticks heißt, die Nahrung
fällt *jetzt* und der Gewinn kommt *später* — und dazwischen liegt ein Tick, der schlecht
sein kann. Die Disziplin kommt aus dem Risiko, nicht aus der Amortisationsdauer.

**Die Kosten müssen beißen.** Ein Projekt bindet einen merklichen Teil aller Hände über
mehrere Ticks — so viel, dass zwei gleichzeitig eine Entscheidung sind und die
Gemeinschaft daran zugrunde gehen kann, wenn sie alles auf einmal anfängt. Bei einem
Bruchteil davon gäbe es überhaupt keine Konkurrenz zwischen den Projekten, und „sofort
alles nehmen" wäre die beste Spielweise statt der schlechtesten. Wie groß der Teil ist,
steht im Inhalt und wird dort gemessen.

**Der Schmerz, gegen den der Vorrat hilft.** Vorher konnte das Überleben gar nicht
ausfallen: Die Sättigung machte 44 % des Nahrungsbedarfs aus und der schlechteste Tick
in 2000 Ticks nahm 40 % des Ertrags — der Puffer war größer als der schlimmste Sturm,
und die Schwankung war Rauschen. Jetzt ist das Sammeln ganz dem Wurf ausgeliefert
(Exposition 1,0 statt 0,7) und die Verteilung hat einen echten Schwanz (Exponent 4 statt
8). Eine Bevölkerung ohne Speicher hängt damit nicht an der **mittleren** Tragfähigkeit,
sondern an der **schlechtesten** — jeder gute Tick bringt Kinder, die der nächste
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

**Der Bogen zur nächsten Epoche, und er hängt an der Übernutzung.** Wild und Fisch sind
Bestände, die nachwachsen (E19) — man kann sie leerjagen. Für eine wandernde Gruppe ist
die Antwort darauf nicht die Fangordnung, sondern der **Revierwechsel**: Man zieht
weiter, das neue Revier ist voll, das alte erholt sich. Genau das haben Wildbeuter getan.

> **Solange man weiterziehen kann, ist Übernutzung ein Ärgernis. Sobald man bleibt, ist
> sie ein Problem.**

Die Sesshaftigkeit nimmt dem Spieler die Flucht — und *erst dadurch* entsteht der Bedarf
nach einer Regel. Die Fangquote ist deshalb keine Mechanik, die irgendwann nachgereicht
wird, sondern die Antwort auf einen Verlust, den der Spieler selbst erlebt hat (Punkt 10
der offenen Liste). Sie in dieser Epoche schon anzubieten würde die Pointe verbrauchen
und wäre außerdem anachronistisch: Fünfzig Menschen brauchen keine Fangordnung, sie
gehen woandershin.

**Die räumliche Antwort ist je Epoche eine andere**, und das ist kein Zufall:

| | |
|---|---|
| **Revierwechsel** (Epoche 1) | Das alte Revier wird aufgegeben, ein neues genommen. Gleich groß, etwas ärmer. |
| **Landnahme** (Epoche 2) | Das alte wird behalten und etwas dazugenommen — das heißt, in fremdes Land zu drängen und es zu halten, was voraussetzt, dass man überhaupt etwas verteidigt. |

Für eine wandernde Gruppe wären beide fast dasselbe; getrennt ergeben sie erst Sinn,
wenn man wählen kann, ob man bleibt. Die Landnahme gehört deshalb **nicht** in diese
Epoche.

**Die Güte fällt geometrisch und wird beim Sesshaftwerden zurückgesetzt.** Jedes frische
Revier ist etwas ärmer als das vorige (`Grundgüte × (1 − Verfall)^Züge`), erreicht aber
nie null. Zurückgesetzt wird, weil sonst eine Entscheidung aus den ersten fünfzig Ticks
jede spätere Epoche mit einem dauerhaften Abschlag belastete — aus einer Option würde
eine Falle. Und es lässt sich begründen: **Sesshaft wird man nicht irgendwo, sondern an
einem ausgesuchten Ort.** Wer viel gewandert ist, hat viel Land gesehen. Der Preis des
Wanderns wird während des Wanderns bezahlt und ist damit abgegolten.

**Was gerade angeboten wird, ist gezogen.** Eine Gemeinschaft wandert nicht blind, aber
sie weiß auch nicht, was sie finden wird: Sie beobachtet ihre Umgebung und hört von
Verwandten und Tauschpartnern, wie es anderswo steht — und was da zurückkommt, ist eine
Nachricht über *ein* Stück Land. Die nächste Nachricht lautet anders. Deshalb wird das
Angebot jeden Tick neu gezogen, aus einem eigenen Zufallsstrom (E25) und am Tickende,
damit die Zahl, gegen die entschieden wird, auch die ist, die der Umzug dann bekommt.

Der Wurf liegt gleichmäßig um den fallenden Mittelwert, **der Mittelwert selbst bleibt
unberührt** und fällt mit jedem Zug genau wie zuvor; was ein guter Bescheid ändert, ist
dieses eine Angebot und nie die Reihe. Auf ein besseres zu warten ist damit eine
Entscheidung mit Preis, denn das Revier, in dem man steht, dünnt derweil weiter aus.

**Woran gemessen wird, ob die Erzählung eintritt** — die Zahlen daneben gehören in die
Messung, nicht hierher, weil sie sich mit jeder Änderung bewegen:

| | |
|---|---|
| Tragfähigkeit ohne Entscheidungen | nahe der Startbande |
| leicht schlechter Tick, ohne Speicher | niemand stirbt |
| **sehr schlechter Tick, ohne Speicher** | **Menschen sterben** |
| sehr schlechter Tick, mit Speicher | niemand stirbt |
| alle Intensivierungen gebaut | Tragfähigkeit **deutlich** höher |

Fällt die dritte Zeile aus, hat der Speicher keine Aufgabe. Fällt die vierte aus, hat er
keine Wirkung. Fällt die fünfte aus, trägt der Baum die Epoche nicht.


### V1 — Start im Überschuss

Das Spiel beginnt nicht mit Mangel, sondern mit gedeckten Bedürfnissen und **freier,
ungenutzter Arbeit** als erstem und einzigem Hebel. Der Spieler lernt sofort:
brachliegende Arbeit ist verlorener Wohlstand, der nie wiederkommt — genau die
Intuition, die er später für Arbeitslosigkeit und Unterauslastung braucht.

*Grundsätzlich abgenickt, aber als unwichtig eingestuft. Kann fallen.*

### V2 — Tick für Tick, mit automatischem Lauf

**Vorgabe ist Tick für Tick: Der Spieler schaltet selbst weiter.** Gibt es keine
Entscheidungsmöglichkeit, kann er automatisch laufen lassen, **bis die nächste Aktion
möglich wird**. Zusätzlich kann er automatisch laufen lassen, auch wenn Aktionen
möglich sind.

**Was den automatischen Lauf anhält, ist noch festzulegen.** „Eine Aktion ist möglich"
taugt nicht wörtlich als Haltebedingung, denn die meisten Handlungen (Vorratsziel
setzen, Ränge verschieben, pausieren, abbrechen) sind in jedem Tick erlaubt. Anhalten
muss der Lauf an **neuen** Möglichkeiten und an Ereignissen, die der Spieler sehen
muss; die Liste dieser Haltepunkte wird bei der Gestaltung der Oberfläche festgelegt.

**Was ein Tick bedeutet, wird nicht gesagt** — hier so wenig wie sonst irgendwo (E17).
Hier stand einmal, er dehne sich mit der Epoche und sei anfangs ein Jahrzehnt, später ein
Jahr, am Ende ein Quartal. Das widersprach E17 unmittelbar, und E17 hat recht: Sobald
irgendwo eine Dauer steht, ist sie festgelegt, und jede spätere Epoche ist daran gebunden.
Was der Satz treffen wollte, bleibt trotzdem wahr und ist ohne Dauer zu haben — die
Verhältnisse ändern sich mit der Epoche: In einer frühen Gemeinschaft dauert es viele
Ticks, bis eine Entscheidung wirkt, in einer entwickelten wenige. Das steckt in den
Mindestdauern der Projekte und in den Trägheiten der Branchen, nicht in einer Uhr.

Die frühere Bedingung „in jeder laufenden Wartezeit muss es etwas zu entscheiden
geben" entfällt mit diesem Modell: Wartezeit wird übersprungen statt gefüllt.

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
   beschrieben wird. Sitzt eine Wildbeutergemeinschaft an der Tragfähigkeit ihres Reviers?
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

**Woraus folgt, was ein Kriterium überhaupt wert ist.** Ein rotes Kriterium hat immer
zwei mögliche Ursachen — das Modell oder der Bot — und ein Mittelwert sagt nie, welche.
Daraus nicht „weglassen", sondern **zwei Sorten trennen**:

| | | |
|---|---|---|
| **Versuche** | ohne Spieler: Zustand setzen, eine Größe variieren, den Mechanismus ablesen | ein Ausfall ist eindeutig der des Modells — **sie beweisen etwas** |
| **Stolperdrähte** | gespielt, also nicht vom Bot trennbar | sie sagen, dass sich etwas *bewegt* hat, und widerlegen absolute Behauptungen — **sie zeigen nur hin** |

Die Versuche sind ausgerechnet die, die aus der Literatur kommen: Boserup, broad
spectrum, sinkender Grenzertrag. Sie werden an **mehreren gesetzten Technikständen**
gemessen und nicht nur am rohen Zustand — ein Mechanismus, der nur unberührt hält, ist
wenig wert, und ein Ausfall sagt dann gleich, *welche* Technik ihn gekippt hat. Gesetzt,
nicht gespielt: Sonst weiß man hinterher wieder nicht, ob die Technik oder die Laune des
Bots die Verschiebung gemacht hat.

> **Keine Balancing-Änderung auf einen Mittelwert hin.** Das Aggregat zeigt hin,
> entschieden wird am einzelnen Tick.

**Und was Bot und Kriterien grundsätzlich nicht leisten können.** Der Bot ist eine
**letzte Verteidigungslinie**, keine Beurteilung: Er und die Kriterien prüfen, dass kein
grober Unfug passiert — dass niemand verhungert, wo Nahrung im Überfluss läge, dass eine
Ressource nicht unbemerkt stirbt, dass die Bilanzen aufgehen. **Ob das Spiel sinnvoll
ist, kann kein Test sagen.** Dafür gibt es nur das echte Durchspielen. Ein grüner
Kriterienlauf heißt darum nie „es ist gut", sondern nur „es ist nicht offensichtlich
kaputt" — und wer das verwechselt, tariert gegen eine Zahl statt gegen ein Spiel.

Damit das keine Ermahnung bleibt, **nennt jeder gerissene Stolperdraht Seed und Tick**,
an dem er zuerst gerissen ist. „51,8 % Leerlauf" ist keine Auskunft, mit der man
irgendwohin gehen kann; „Leerlauf über 15 % ab Tick 14, Seed 231" ist eine Adresse.

**Zwei Messfehler, die dabei aufgefallen sind, und beide waren Fehler im Maß, nicht im
Modell:**

- *Fläche* je Einheit Nahrung addierte Fläche Wald und Fläche Wasser. Bei fünfzig Köpfen
  trägt das kleine Gewässer viel, also fiel die Zahl, ohne dass irgendetwas
  intensiviert worden wäre. Boserup gehört auf **eine** Kapazität gemessen — und mit
  beiden Hälften: Der Ertrag je Fläche steigt *und* es kostet mehr Hände je Einheit.
  Ohne die zweite Hälfte misst man gewöhnliche Effizienz.
- *Bevölkerung am Ende* verglich Läufe verschiedener Länge. Eine Epoche, die an einem
  Meilenstein endet, dauert für den schlechteren Spieler länger — seine Siedlung hat
  mehr Ticks zum Wachsen und sieht größer aus. So gemessen lag schlechtes Spiel um den
  Faktor fünf vorn. Innerhalb einer Epoche heißt „schlechter": **man braucht länger
  hinaus.**

### E31 — Wie der Projektbaum einer Epoche gebaut ist

Vier Anforderungen, und keine darf der anderen geopfert werden: Der Baum muss **fesseln**,
er muss **akademisch haltbar** sein, aus ihm muss sich eine **benennbare Lehre** ergeben,
und er darf das Modell nicht komplizierter machen, als die Lehre es verlangt.

**Ein benanntes Rückgrat, dazu wenige echte Alternativen.**

Das Rückgrat sind die Projekte, ohne die es nicht weitergeht. Es wird **benannt, nicht
gezählt**: „Um zu bleiben, brauchst du einen Vorrat; für einen Vorrat Überschuss; für
Überschuss bessere Ernte." Das kann ein Spieler nachvollziehen und darauf hinarbeiten.
Eine Schwelle wie „die Hälfte des Baums" kann er nicht — sie ist unlesbar, und sie macht
aus allem, was nicht zählt, Füllmaterial.

Daneben stehen Alternativen, die **das Wie ändern, nicht das Ob**: sich auf die Jagd
stützen oder aufs Wasser, früh auf Vorrat gehen oder auf Ertrag. Sie verschieben das
**Risikoprofil**, nicht den Ausgang. Daher kommt der Wiederspielwert, ohne dass jemand
einen Ast verpasst, den er gebraucht hätte.

**Warum nicht „man braucht eine Auswahl":** Bei uns kostet alles dieselbe knappe
Ressource — Hände. Die interessante Entscheidung ist deshalb ohnehin selten *welches*
Projekt, sondern **wann und in welcher Reihenfolge**, und das ist bereits gemessen tief:
Drei Projekte gleichzeitig anzufangen tötet die Siedlung. Ein Baum zum Weglassen würde
diese Tiefe nicht vergrößern, sondern verwässern — weggelassen würde, was man nicht
versteht, und der Unterschied fiele nie auf.

**Eine Wahl darf nur stehen, wo der Spieler sie beurteilen kann.** Sonst ist sie kein
Abwägen, sondern ein Münzwurf mit Folgen. Gemessener Fall: Rodung gegen Aufforstung ist
unentscheidbar, solange nirgends steht, was ein Stück Wald gegen ein Stück Acker wert
ist — selbst ein Spieler, der beide Zahlen kennt, rechnet am Rand richtig und entwaldet
sich zu Tode. Jede Alternative braucht also eine **ablesbare Grundlage**, oder sie gehört
nicht in den Baum.

**Der Umfang, an dem sich das misst:**

| | |
|---|---|
| gleichzeitige Angebote | **drei bis fünf** — darunter keine Wahl, darüber eine Liste zum Überfliegen |
| Entscheidungen über die Epoche | **zwölf bis achtzehn** |
| davon Rückgrat | etwa die Hälfte, als *Ergebnis* und nicht als Regel |

**Die erste Epoche ist kleiner als die späteren**, weil sie der versteckte Lehrgang ist:
Ihre Aufgabe ist, die Schleife beizubringen — Bedarf, Knappheit, Projekt, neue
Möglichkeit — mit so wenig verschiedenen Dingen, dass jedes haften bleibt. Wer dort
dreißig Projekte sieht, lernt keine Schleife, sondern klickt sich durch. Spätere Epochen
dürfen reicher werden, weil der Spieler dann weiß, worauf er achtet.

**Lehren fallen auf allen Größen an, nicht eine je Epoche.** An einem einzelnen Tick
(„der Speicher hat den schlechten Tick aufgefangen"), an einer Mechanik („Arbeit, die
niemand nutzt, ist am Tickende weg"), an einem Bogen über hunderte Ticks („ein Vorrat
lässt eine Gesellschaft vom Durchschnitt leben statt vom schlechtesten Tick"). Alle
zusammen tragen den Zweck aus dem Ziel: die Mythenliste, an Mechanik zerbrochen statt
an Text.

Der Satz je Epoche ist deshalb ein **Prüfstein und kein Behälter**: Fällt einem für eine
Epoche keiner ein, fehlt ihr der Grund, und kein Umfang an Projekten ersetzt ihn.

**Die Reihenfolge beim Entwerfen ist die umgekehrte der Technikgeschichte:**

1. Welche **Bedarfe** hat die Epoche — und was passiert, wenn sie nicht gedeckt sind.
   Ohne diese Folge ist ein Bedarf Zierrat, und die Rangfolge ergibt sich daraus.
2. Woraus sie **gedeckt** werden können: Gut und Quelle. Hier entscheidet sich, welche
   Kapazitäten es braucht und welche Güter zwischen Quelle und Bedarf stehen.
3. **In welchen Stufen** — erst schlecht gedeckt, dann besser. Diese Stufen *sind* die
   Projekte.
4. **Was worauf aufbaut**, und zwar aus sachlichen Abhängigkeiten. Erst hier entsteht der
   Baum.

Von der Technik her zu denken führt dazu, dass man Bogen, Hund und Einbaum sammelt, weil
sie bekannt sind. Von der Deckung her gedacht fragt man „wie kommt eine Gruppe an mehr
Nahrung, wenn das Land voll ist" — und der Bogen fällt als *eine* Antwort ab, neben
anderen.

**Ausführbarkeit hängt nur an Monotonem** — Übung, fertige Projekte, gebaute Kapazitäten:
Größen, die nur vorwärts laufen, damit die Oberfläche Fortschrittsbalken zeigen kann.
Sichtbarkeit darf an Schwankendem hängen (Suchkosten, Anstrengung) und wird nie
zurückgenommen. Urteilsvermögen — ob sich etwas *gerade* lohnt — gehört in den Spieler
bzw. die Strategie, nie in die Ausführbarkeit.

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
in die Vergangenheit. Ein Bau, der lange dauert, ist ein Eintrag „noch 12 Ticks"
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
Headless-Läufe (`npm run simulate -- --ticks 300 --seeds 20`) ein erstklassiges
Werkzeug: 300 Ticks in einer Sekunde, um etwa den wandernden Engpass aus E14 zu
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

**Die Sitzung schreibt jede Handlung mit, während sie geschieht.** `log()` gibt das
Protokoll aus — den Seed und jede Handlung mit ihrem Tick. `step(protokoll, zustand)`
spielt es Schritt für Schritt nach, und nach jedem Schritt steht der volle Zustand zum
Ansehen bereit. Wurde der Zustand von Hand verändert, sagt das Protokoll das selbst; dann
spielt es nichts nach und behauptet es auch nicht. Ohne das ist „von Hand gespielt" keine
Beobachtung, denn eine andere Sitzung, die von Hand spielt, tut etwas anderes.

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

**Der gesamte Code ist Englisch** — Bezeichner, Kommentare, Dateinamen, Commits. Deutsch
ist allein `KONZEPT.md`.

**Die Oberfläche bekommt keine Sprache vorgeschrieben.** Sie wird von Anfang an übersetzbar
gebaut, mit einer Übersetzungsschicht statt fest eingebauter Texte; welche Sprachen sie am
Ende anbietet, ist nicht entschieden. Die erste Ausbaustufe führt aber **Deutsch und
Englisch von Anfang an beide** (T9): Erst mit zwei Sprachen zeigen sich die Probleme der
Übersetzungsschicht sofort, und spät entdeckte sind teils schwer zu beheben. Der Kern gibt ihr davon
nichts vor: Er erzeugt keinen Text und trifft keine Annahme darüber, wie eine Anzeige
später formuliert oder formatiert wird.

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
| Wurf | `shock` |
| Witterung | `weather` |
| Rodung / Landnahme | `clearForest` / `expandTerritory` |

**Die Simulation erzeugt weder Text noch Meldungen.** Sie liefert ihren Zustand; alles,
was der Spieler zu sehen bekommt, entsteht außerhalb.

Eine Meldung an den Spieler ist ein **i18n-Schlüssel plus ein paar Zahlen**, aufgerufen
von der Oberfläche:

```ts
t("forest_cleared", { area: 10, remaining: 170 })
```

```
de: forest_cleared: "Wald gerodet: {area}, {remaining} verbleiben."
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

### T9 — Die erste Ausbaustufe der Oberfläche

**Die Oberfläche wird webbasiert gebaut** (Stack: T5). Die erste Ausbaustufe ist **nur
für den Auftraggeber**: eine spielbare Oberfläche, an der sich das Spielgefühl der
Epoche prüfen lässt. Sie ist aber **kein Wegwerf-Werkzeug**, sondern der Anfang des
Spiels: so angelegt, dass Didaktik und Erzählung später hineinpassen, ohne dass alles
überarbeitet werden muss. Übersetzungsschicht von Anfang an, mit Deutsch und Englisch
(T6).

**Gestaltungsmaß: Tablet im Querformat, und der Desktop-Browser gleichwertig** — beide
müssen gut funktionieren. Der Grund für dieses Maß: Der Spieler soll **alle wichtigen
Größen der Ökonomie auf einem Bildschirm** sehen, nach Möglichkeit samt ihrer
Entwicklung über das ganze Spiel — ohne Blättern und ohne Pflicht-Verstecke; die
Aktionen dürfen in einer aufklappbaren Leiste liegen. Auf einem Telefon ginge das nur
mit Verstecken, also ist das Telefon **kein Ziel** — durch die Bausteinbauweise aber
auch nicht verbaut. Die Anzeige ist **grafisch, nicht nur Zahlen**: Balken für
Fortschritt, Deckung und Auslastung, Verlaufskurven für die Entwicklung; die Oberfläche
soll ansprechend aussehen.

**Die Projektauskunft hat zwei Hälften.** Die mechanischen Fakten — Kosten, Dauer, bei
verriegelten Projekten das Hat/Braucht je Bedingung — erzeugt die Oberfläche
**generisch aus den Daten**, als Schablone, die für jedes Projekt und jede spätere
Zahlenänderung von selbst stimmt und nie von Hand gepflegt wird. Der **Nutzen-Satz** je
Projekt wird dagegen von Hand geschrieben und lebt als Schlüssel in der
Übersetzungsschicht. Der Grund: Maschinell aus den Wirkungsdaten erzeugte Sätze wären
in jeder Sprache hölzern und müssten trotzdem übersetzt werden; ein Satz je Projekt ist
billig, und die mechanische Hälfte daneben zeigt immer die aktuelle Wahrheit aus den
Daten.

**Die Revier-Anzeige zeigt je Bestand auch den gepflegten Zuschlag** — was Brand (in
späteren Epochen Dung und Zucht) dem Land gerade hinzufügt, samt seinem Verblassen.
Damit ist ohne neue Größe und ohne Erklärtext ablesbar, ob sich erneutes Pflegen schon
wieder lohnt: Zuschlag groß → warten, fast weg → wieder dran.

**Kein Speichern und Laden in der ersten Stufe.** Statt dessen kennt die Oberfläche
**den ganzen Verlauf des Laufs**, nicht nur den letzten Tick: Für Testzwecke lässt sich
damit einfach zurückrollen. Ob der Spieler später auch zurückrollen kann, ist offen.

---

## Offen

**Die offenen Punkte stehen als Issues:** github.com/rainco77/mmtsim/issues

Nicht hier. Warum, und nach welchem Schema ein Issue aufgebaut ist, steht in `CLAUDE.md`.

## Verworfen

Was hier steht, wurde probiert und wieder aufgegeben — **mit dem Grund**, damit niemand
dieselbe Sackgasse ein zweites Mal baut.

- **Vier Regeln um die Vorratshaltung**: eine Sparquote als Anteil des Verbrauchs, eine
  Sicherung auf die lebensnotwendigen Bedarfe, eine Pause bei dünnen Beständen, und ein
  Rang, der in beide Richtungen schneidet. Alle vier zusammen füllten den Speicher
  **nicht** — und ihr Zusammenspiel war so verwickelt, dass sich nicht mehr vorhersagen
  ließ, was das Ding tut. Die Ursache lag ganz woanders: Bedarfe nahmen zuerst aus dem
  Lager (E19). Vier Regeln raus, eine Zeile umgedreht.
- **Fischwehr** als Intensivierung des Wassers. Eine feste Anlage bindet an den Ort und
  wirkt damit wie die Gruben — das gehört der Sesshaftigkeit, nicht der Zeit davor. Statt
  dessen die Muscheln: mehr aus derselben Uferstrecke, für viel mehr Arbeit, ohne
  irgendwo festzumachen.
- **Ein zweiter Wert am Gut, wieviel davon zu halten sich lohnt** (in Ticks des
  Verbrauchs). Sagt nichts, was die Speicherkapazität nicht schon sagt — und wie groß die
  ist, hat der Spieler beim Bauen entschieden.
- **Allee-Effekt**: fallende Produktivität bei kleiner Gruppe, damit sich eine
  schrumpfende Gemeinschaft nicht mehr fängt. Zusätzliche Mechanik für etwas, das die
  Aufgabeschwelle schon leistet.
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
| Wie die Zuteilung wählt | optimale Nahrungssuche (MacArthur/Pianka, Charnov); Alchian zur Auslese über lange Zeiträume |
| Ein dünner Bestand ist teuer zu ernten | Gordon-Schaefer; fallende Begegnungsrate |
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
