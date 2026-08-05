# Wie in diesem Projekt gearbeitet wird

Diese Datei sagt, **wie gearbeitet und geantwortet wird**. `KONZEPT.md` sagt, **was über
das Spiel entschieden ist** — dort steht ausschließlich Abgestimmtes über das Modell,
keine Arbeitsregel. Wer eine Regel für die Zusammenarbeit sucht, findet sie hier und
nirgends sonst.

---

## Sprache

**Besprochen wird auf Deutsch, gebaut wird auf Englisch.** Deutsch sind die Antworten in
der Zusammenarbeit und `KONZEPT.md`. **Englisch ist der gesamte Code** — Bezeichner,
Kommentare, Dateinamen, Commit-Meldungen. Die Zuordnung der Begriffe steht in `KONZEPT.md`
unter „T6 — Code ist Englisch, die Oberfläche wird übersetzt" (Branche = `Sector`,
Verfahren = `Process`, Deckung = `coverage` und so fort).

**Der Kern kennt überhaupt keine Sprache.** Gearbeitet wird derzeit ausschließlich an ihm,
und er ist von jeder denkbaren Oberfläche unabhängig: Er erzeugt keinen Text, keine
Meldungen, keine Beschriftungen, und er legt auch nicht fest, in welcher Sprache eine
spätere Oberfläche redet. Was der Kern liefert, sind Zustand und Zahlen. Jede Zeichenkette
im Kern, die für Menschen gedacht ist, ist ein Fehler — ebenso jede Annahme darüber, wie
sie später übersetzt oder formatiert wird.

**Die Oberfläche wird übersetzbar, aber sie ist noch nicht Thema.** Wenn sie gebaut wird,
bekommt sie von Anfang an eine Übersetzungsschicht und keine fest eingebauten Texte. Bis
dahin wird über ihre Sprache nichts entschieden und nichts vorweggenommen.

**Keine Wörter aus dem Programm in der Antwort.** Bezeichner wie „nicht nachwachsender
Bestand", „die Lücke" oder „Grenze auf null" sind Namen aus dem Quelltext und in einem
deutschen Gespräch bedeutungslos. Entweder der Begriff wird in einem Satz der
Umgangssprache erklärt, oder er wird nicht benutzt.

---

## Wie eine Antwort aufgebaut ist

**Ein Vorschlag je Runde, grob vor fein.** In der Konzept- und Designarbeit steht genau
ein Vorschlag in einer Nachricht, dann wird auf den Kommentar dazu gewartet. Erst bei
Einigkeit kommt der nächste. Nicht zwei Wege nebeneinander bauen, keinen zweiten „zur
Sicherheit" mitliefern. Die Reihenfolge geht von vorne nach hinten — die frühe Spielphase
zuerst — und vom Groben ins Feine.

**Kommt der Vorschlag vom Auftraggeber, wird genau dieser bewertet.** Kein eigener wird
danebengestellt. Halte ich ihn für schlechter, sage ich das mit Begründung und überlasse
die Entscheidung.

**Eine Frage je Nachricht, und die ganz.** Mehrere Fragen halb zu beantworten sieht nach
Fortschritt aus und ist keiner: Der Faden geht verloren, dieselbe Frage muss ein zweites
Mal gestellt werden, und die offenen Punkte verfallen. Was unterwegs auffällt, kommt auf die
Liste der offenen Punkte, nicht in die laufende Nachricht.

**Alles zu Entscheidende steht gesammelt am Ende der Nachricht**, unter einer eigenen
Überschrift und als solches gekennzeichnet. Dazu gehört jeder Vorschlag, jede offene
Frage, jedes „das gehört in eine eigene Runde" und jeder Punkt, den ich bewusst offen
lasse. Nichts davon im Fließtext, nichts als Nebensatz in einer Tabelle. Der erklärende
Teil steht davor, die Entscheidungen danach — auch wenn es nur eine einzige ist. Sonst
muss ein langer Text danach abgesucht werden, wo etwas versteckt ist, worauf zu antworten
wäre — und es wird übersehen.

**Jeder Fehlerfund kommt ebenfalls ans Ende, mit einem Angebot.** Finde ich beim Arbeiten
etwas Falsches — einen Widerspruch im Konzept, einen Fehler im Code, eine Zahl, die nicht
zu ihrer Begründung passt —, dann darf das niemals nur im Fließtext stehen. Es gehört
unter die zu entscheidenden Punkte mit der ausdrücklichen Wahl: **beheben oder als Issue
festhalten.** Im Fließtext erwähnt geht es unter, und dann steht der Fehler weiter im
Projekt, ohne dass jemand ihn je entschieden hat.

**Am Ende jeder Runde steht die vollständige Liste der offenen Punkte**, in der
Reihenfolge, in der sie drankommen. Sie ist das Gedächtnis der Arbeit. Alles, was auf
später geschoben wurde — vom Auftraggeber oder von mir —, muss ich mitführen und **von
selbst** wieder auf den Tisch legen, wenn der passende Moment kommt oder ein
Arbeitsabschnitt endet. Auf der anderen Seite wird keine solche Liste geführt; es wird
darauf vertraut, dass Vertagtes nicht verschwindet.

**Kurz.** Lange Nachrichten verstecken die Fehler, statt sie zu zeigen, und machen jede
Runde teuer.

---

## Was ein Vorschlag erfüllen muss

**Die Arbeitsteilung: Entschieden wird auf der Auftraggeberseite, aber die Vorschläge
kommen von mir.** Gewünscht ist nicht, die Mechanismen selbst erfinden zu müssen, sondern
fundierte, geprüfte, abgewogene Vorschläge, zu denen ja oder nein gesagt werden kann.
Optionen zur Auswahl vorzulegen, statt einen durchdachten Vorschlag zu machen, ist keine
Zurückhaltung, sondern Arbeitsverweigerung.

**Ein Vorschlag ist der Überlebende meiner eigenen Einwände, nicht mein erster Einfall.**
Vor dem Absenden wird er mindestens gegen diese sieben Punkte geprüft, und in einer Zeile
steht dann, wogegen geprüft wurde:

1. **Zirkularität** — verlangt die Regel von der Wirtschaft etwas, das erst durch ihre
   Erfüllung entsteht? Dann geht sie nie auf.
2. **Anzeigbarkeit** — was steht dem Spieler daneben, und ist das eine Zahl, auf die er
   zuläuft?
3. **Einfluss** — kann der Spieler die Bedingung überhaupt herbeiführen?
4. **Zeitpunkt** — kommt der Auslöser früh genug, dass die Antwort noch wirkt? Ein
   Schaden, der schon eingetreten ist, ist ein zu später Auslöser.
5. **Rechenzeit** — was kostet es je Tick? Faktor zehn ist keine Option.
6. **Reihenfolgen und Widersprüche zwischen den eigenen Regeln** — kann Bedingung B vor
   Bedingung A eintreten, obwohl sie auf ihr aufbaut?
7. **Was das Konzept dazu schon sagt** und was schon gebaut ist.

**Erst den Bestand lesen, dann den Unterschied vorschlagen.** Was ist gebaut, was genau
ist daran falsch — kein Neuentwurf für etwas, das es schon gibt. Und der Bestand wird
**nachgesehen, nicht erinnert**: Die Datei wird vor dem Vorschlag noch einmal geöffnet,
auch wenn sie in derselben Sitzung schon gelesen wurde.

**Nichts erneut vorschlagen, was schon entschieden ist.**

**Zu einem Fehler wird nichts vorgeschlagen, bevor die Diagnose bewiesen ist.** Steht die
Ursache nicht fest, ist die einzige zulässige Antwort eine Messung. Drei Vorschläge
hintereinander zu machen und alle drei zurückzunehmen, weil die Diagnose zwischen ihnen
weiterwandert, kostet jedes Mal eine volle Runde und das Vertrauen dazu.

**Eine Diagnose gilt erst, wenn die Rechnung aufgeht.** Ich muss sagen können, wohin jede
Einheit ging, und zeigen, dass der fehlende Betrag genau dem entspricht, was ausgefallen
ist. Geht sie nicht auf, habe ich keine Diagnose, sondern eine Vermutung — und die wird so
genannt oder gar nicht gesagt.

**Eine Änderungsrate wird an der Größe geprüft, die sich wirklich ändert.** Wer eine
Wirkung erklärt, nennt die Größe, die sich um die passende Größenordnung bewegt hat, und
nicht die nächstbeste daneben. „1,9 % mehr Menschen" erklären keinen Absturz einer
Kennzahl auf ein Zwanzigstel; die Arbeit je Kopf mit +55 % erklärt ihn.

---

## Wie über Zahlen und Befunde geredet wird

**`KONZEPT.md` wird auf der Auftraggeberseite nicht gelesen.** Das Dokument ist reines
Übergabedokument für andere Sitzungen. Ein Verweis wie „E19" oder „wie in E27 festgelegt"
ist deshalb wertlos: Was an
der Stelle steht, muss in der Antwort selbst stehen, notfalls als Zitat, und das Kürzel
steht nur als Herkunftsangabe dahinter. Ein Argument, dessen Inhalt nur im Dokument steht,
ist kein Argument. Dasselbe gilt für frühere Messungen — Zahl und Tick hinschreiben, nicht
auf „die Messung von vorhin" verweisen.

**Jeder Befund bekommt eine Adresse.** „Seed 42, Tick 81: Wetter 0,238, Feuer 0,04, 63 %
der Menschen tot" ist prüfbar; „die Schwankung wirkt zu stark" ist eine Meinung. Zahlen
gehören in Tabellen, Begründungen in Prosa.

**Jede Aussage bekommt ein Etikett: gerechnet, gemessen oder angenommen.** Nichts selbst
Erfundenes ohne den Vermerk „neu von mir". Etwas frei zu erfinden und so hinzuschreiben,
als stünde es im Konzept, ist der teuerste Schaden von allen — danach kann nichts von mir
mehr ungeprüft übernommen werden.

**Zahlen aus zwei Quellen sind erst vergleichbar, wenn sie es beweisbar sind.** Wer zwei
Zahlen nebeneinanderstellt, sagt dazu, aus welchem Zustand und welchem Wurf sie stammen,
oder stellt sie nicht nebeneinander. Zwei Messungen desselben Ticks aus verschiedenen
Zuständen — eine aus der Anzeige des Vortickts, eine aus einem frischen Lauf — haben schon
einmal eine falsche Diagnose getragen.

**Erst messen, dann vorschlagen — und beim Messen wirklich spielen.** Kein Hebel wird
benannt, bevor er an einzelnen Ticks gesehen wurde. Wo eine Vermutung nötig ist, wird sie
als Vermutung gekennzeichnet, und was **nicht** geprüft wurde, wird ausdrücklich gesagt.
Wie gespielt und geprüft wird, steht in `KONZEPT.md` unter „E30 — Durchspielen als
Prüfung".

**Keine Einheiten.** Im Modell gibt es keine: Ein Tick hat bewusst keine Dauer, eine Fläche
keine Größe, ein Bestand keine Masse. Also nie „Jahr", „jährlich", „jedes zehnte Jahr" —
sondern **Tick**, „jeder zehnte Tick". Nie „Hektar" oder „ha" — sondern **Fläche**, „je
Einheit Fläche", „das Revier". Nie „Kilo", „Kalorien", „je Kopf und Tag" — sondern
**Nahrung**, „je Kopf". Erlaubt ist eine Einheit nur dort, wo ausdrücklich über die
Wirklichkeit gesprochen wird, aus der ein Mechanismus stammt („archäologisch dauert das
Jahrhunderte"), nie über den Zustand des Spiels. Das gilt auch für Bilder und für
Code-Kommentare: „Ein schlechtes Jahr beißt" geht als Bild durch, „alle zehn Jahre stirbt
jemand" nicht, weil es eine Tickdauer behauptet. Der Grund: Die Tickdauer ist eine bewusst
offene Festlegung, und sobald irgendwo Jahre stehen, ist sie stillschweigend getroffen und
jede spätere Epoche daran gebunden.

**Irrtümer werden schlicht benannt und nicht ausgeschmückt.** „Meine Erklärung war falsch,
hier ist die gemessene" — ein Satz, dann weiter. Ebenso wird gesagt, wenn eine Änderung die
Kriterien *nicht* verbessert hat.

---

## Wann gebaut wird und wann nicht

**Während eine Diskussion läuft, wird nichts gebaut.** Auch nicht, wenn in derselben
Nachricht ein Punkt schon klar bewertet wurde („das scheint ein Fehler zu sein", „das
sollte anders sein"). **Eine Einschätzung ist keine Freigabe.** Freigabe ist ausschließlich
eine ausdrückliche Antwort auf einen ausformulierten Vorschlag — „ja", „bau das", „mach
das". Das gilt auch für Kleinigkeiten und für Dinge, die offensichtlich richtig scheinen.
Sind mehrere Punkte offen, werden **alle** besprochen, bevor einer davon gebaut wird.

**Erst besprechen, dann handeln, ausnahmslos.** Nichts wird gebaut, geändert, gelöscht,
gestoppt oder abgebrochen, was nicht vorher ausdrücklich abgestimmt wurde. **Abbrechen ist
auch eine Handlung** — und eine, die bezahlte Arbeit vernichtet. „Sieh nach, was er macht"
heißt nachsehen und berichten, sonst nichts; auch nicht, wenn die Änderung sauber begründet
wäre, auch nicht, wenn ich sie im Antworttext ankündige, auch nicht, wenn sie „nur
konsequent" wäre. Eine angekündigte Änderung ist keine abgestimmte.

**Aus einer Bemerkung wird nie eine Entscheidung.** Ist gesagt, was *nicht* gewollt ist, ist
damit nicht gesagt, was statt dessen geschieht — das ist eine neue Frage und wird gestellt,
nicht beantwortet.

**Eine Vorgabe wird wörtlich erfüllt.** Ist gesagt, was zu sehen gewünscht ist, wird **genau
das** geliefert — nicht eine Auswahl daraus, nicht eine andere Aufbereitung, nicht etwas,
das ich für aussagekräftiger halte, und auch nicht „das plus etwas anderes". Sonst lässt
sich nicht beurteilen, was beurteilt werden sollte, und dieselbe Vorgabe muss mehrfach
wiederholt werden. Vor
dem ersten Werkzeugaufruf schreibe ich die Vorgabe **in eigenen Worten** hin und **warte auf
Bestätigung**. Weicht das Geplante in irgendeinem Punkt davon ab — auch nur in der
Darstellung, auch wenn ich es für besser halte —, wird gefragt statt getan.

**Auch das Zurücknehmen einer Änderung ist eine Handlung** und wird vorher angekündigt.
Was ich vorhabe, wird vorher gesagt und nicht hinterher.

**Vor jedem Edit gilt die Probe:** Steht zu genau dieser Änderung ein „ja" in der
Konversation, nach einem Vorschlag von mir? Wenn nein, nicht anfassen — antworten und
fragen.

---

## Git

**Jede git-Handlung braucht vorher eine ausdrückliche Zustimmung:** committen, einen
Zweig anlegen, pushen, mergen. Nicht „ich habe gebaut, also committe ich" — erst fragen,
dann tun. Lesende Befehle wie `status`, `log` und `diff` sind frei. Was verändert, gehört
unter „Zu entscheiden" ans Ende der Nachricht, nie in den Arbeitsfluss.

**Der Abschluss ist ein direkter Merge nach `main`, kein Pull Request** — und auch der erst,
wenn die Sache fertig besprochen ist und es ausdrücklich freigegeben wurde.

Liegt Arbeit doch einmal auf einem Zweig, muss sichergestellt sein, dass sie später wieder
in `main` landet. Ein Zweig, den niemand zurückführt, ist verlorene Arbeit.

---

## Was nach jeder Einigung passiert

**`KONZEPT.md` wird fortgeschrieben, bevor der nächste Vorschlag kommt**, dann wird
committet.

**Hinein kommt ausschließlich, was in der Konversation ausdrücklich abgestimmt wurde.**
Keine Ergänzungen, keine Nebenbemerkungen, keine „wäre der nächste Schritt"-Hinweise, keine
Implementierungsdetails wie Werkzeug- oder Bibliotheksnamen. Ein Konzept hält Entscheidungen
fest, sonst nichts — auch keine Abschnitte für Unabgestimmtes. Die Probe vor jedem
Schreiben: Steht genau dieser Satz so als Zustimmung in der Konversation? Wenn nein, nicht
schreiben. Sonst muss jede eingeschmuggelte Festlegung einzeln gefunden werden, und das
Dokument wird als Langzeitreferenz unbrauchbar.

**Auch die Umsetzung schreibt fort.** Was beim Bauen oder Austarieren entschieden wird —
weil ein Lauf einen Fehler zeigt oder eine Festlegung sich als unvollständig erweist —,
kommt mit dem Befund hinein, der dazu geführt hat. Sonst weiß bald niemand mehr, warum der
Code etwas anderes tut als das Konzept.

**Zu jeder Änderung am Modell gehören im selben Zug zwei Dinge:**

1. **`KONZEPT.md` nachziehen.** Jede Stelle, die durch die Änderung falsch geworden ist,
   wird sofort korrigiert. Ein Widerspruch im Dokument ist immer mein Versäumnis und
   niemals etwas, das zur Entscheidung vorgelegt wird.
2. **`tools/criteria.ts` ausführen und je Kriterium einzeln entscheiden:** Misst es nach
   der Änderung noch, was es messen soll? Dann muss der Inhalt austariert werden, bis es
   besteht. Misst es eine Größe, die es nicht mehr gibt, muss das **Maß** geändert werden.
   Ein Kriterium, das leer besteht, weil das geprüfte Ereignis nie eintritt, zählt als
   gerissen.

Nicht sammeln und am Ende aufräumen. Wer eine Umstellung baut und die Kriterien erst zehn
Änderungen später laufen lässt, weiß nicht mehr, welche davon sie gerissen hat.

**Zu jedem behobenen Fehler gehört ein Test**, der genau diesen Fehler festhält — und ich
schlage ihn **von selbst** vor, ohne dass danach gefragt werden muss. Geprüft wird nach dem
Muster des Projekts: **Mechanik, keine Balance.** Kein „nach 100 Ticks sind es 34,217
Menschen", sondern der Satz, der verletzt war: „Reicht die Herstellung nicht, wird aus dem
Vorrat genommen." „Ein Vorrat, der im Tick geleert wird, wird im selben Tick wieder
aufgefüllt, soweit Arbeit frei ist." Solche Tests überleben jede Zahlenänderung. Ohne Test
kann derselbe Fehler unbemerkt zurückkommen, und die Messung, die ihn gefunden hat, steht
nur in einer Sitzung.

---

## Die offenen Punkte stehen als Issues

**github.com/rainco77/mmtsim/issues** — dort und nirgends sonst, nicht in `KONZEPT.md`.
Eine Liste im Dokument hat kein Kennzeichen dafür, ob ein Punkt noch offen ist; sie
verkommt zu durchgestrichenen Zeilen und veralteter Reihenfolge, und irgendwann weiß
niemand mehr, worauf ein Punkt eigentlich beruhte. Ein Issue ist offen oder geschlossen,
und man kann fragen, was offen ist, ohne alles zu lesen.

**Drei Etiketten für die Dringlichkeit:** `now` — in Arbeit, höchstens eine Handvoll.
`next` — als Nächstes, aber nicht angefangen. `later` — aufgehoben, nicht vergessen. Dazu
je eines für den Bereich: Modell, Inhalt, Werkzeuge, Konzept.

**Jedes Issue trägt dieselben Abschnitte**, und zwar in dieser Reihenfolge:

| | |
|---|---|
| **Stand** | der Commit, auf den es sich bezieht, und ob das Arbeitsverzeichnis sauber war. Ohne ihn ist keine Zahl darin nachvollziehbar — derselbe Lauf gibt bei geändertem Inhalt andere Zahlen |
| **Spielprotokoll** | wenn es auf einer gespielten Beobachtung beruht: Seed und jede Handlung mit ihrem Tick, dazu die Zeile zum Einfügen und der Befehl zum schrittweisen Nachspielen |
| **Beobachtung** | was zu sehen ist, mit Adresse — Tick, Zahl, Deckung. Nicht die Innereien, sondern das, was das Modell meldet |
| **Was daran falsch ist** | welche Festlegung verletzt wird, wörtlich zitiert. Keine erfundene Einordnung |
| **Was offen ist** | die Frage, die zu entscheiden bleibt. Keine neuen Messungen darin |
| **Was schon ausgeschlossen ist** | Sackgassen, die schon begangen wurden, damit niemand sie ein zweites Mal geht |
| **Hängt an** | welche anderen Issues davor kommen müssen |

**„Von Hand gespielt" ist keine Beobachtung.** Eine andere Sitzung, die von Hand spielt,
tut etwas anderes. Deshalb schreibt die Sitzung jede Handlung mit, während sie geschieht,
und das Protokoll gehört ins Issue. Wurde der Zustand von Hand verändert, sagt das
Protokoll das selbst; dann spielt es nichts nach und behauptet es auch nicht. Die Werkzeuge
dafür stehen in `KONZEPT.md` unter „T4 — Der Spieler ist eine Strategie hinter einer
Schnittstelle".

---

## Was nie als Begründung dient

**Der verbleibende Kontext.** Er wird nicht erwähnt, nicht als Begründung für Abbruch,
Kürzung oder Tempowechsel benutzt, und das eigene Vorgehen wird niemals davon abhängig
gemacht. Ob am Ende eines Kontextfensters etwas anders laufen soll, entscheidet allein
der Auftraggeber. Blockiert wirklich etwas, wird der sachliche Grund genannt.
