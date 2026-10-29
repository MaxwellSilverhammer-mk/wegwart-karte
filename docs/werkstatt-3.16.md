# Hold der Seeprinzen – Werkstatt der Spielleitung

**Zum Regelwerk 3.16 · 29. Oktober 2026 · Weltenhüter: Max**

Die Werkstatt ist der zweite Teil des Regelwerks: die Arbeitsschritte, die die Spielleitung nur zum Speichern, Bauen und Einrichten braucht, und die Tafel der Wahlregeln (23). Sie gilt wie das Regelwerk und wird mit ihm geändert, steht aber in einer eigenen Datei, damit sie nicht jede Sitzung mitlädt. Die Spielleitung liest sie, wenn sie einen Zwischenhalt macht oder eine Sitzung beendet, das Spielerbuch oder die Chronik beschreibt, Tische baut oder prüft, ein Treffen leitet, eine neue Figur anlegt oder einem Revier einen neuen Auftrag oder eine neue Bedrohung gibt, wenn ein Spieler nach einer Regel der Bücher fragt, die im Regelwerk nicht steht (23), und immer, wenn das Regelwerk mit „W“ hierher verweist. Die Abschnitte tragen die Nummern des Regelwerks; eine Nummer meint den Abschnitt in dieser Datei, wo es ihn hier gibt, sonst den im Regelwerk.

## 4 Befehle und Bedienung

### 4.4 Zeichen, Seltenheit und Marke wählen
- Was ein Zeichen, eine Seltenheit und eine Marke sind, steht im Regelwerk (4.4). Kommt ein Ding ins Gepäck, legt die Spielleitung in derselben Antwort fest, was es im Spielerbuch tragen wird, und notiert es für das Sitzungsende: `art` (bestimmt Gruppe und Standardzeichen), bei Bedarf `ikone` (ein Name aus der Sammlung, README „Gepäck“; sonst rät der Tisch aus Art und Namen), `seltenheit`, wenn nicht gewöhnlich, und `marke`, wenn eine passt. Mehr als diese Felder gibt es nicht; ein Zeichen wird nie eigens gezeichnet.
- Wahl des Zeichens: Was der Tisch rät, reicht fast immer (ein „Jorriks Dolch“ wird ein Dolch, ein „Gesiegelter Brief“ ein Brief). `ikone` braucht nur, was der Name nicht verrät („Schlüssel zum Lagerhaus“ ist klar, „das Ding aus dem Sumpf“ nicht) oder was anders aussieht, als die Art vermuten lässt (ein Dolch als Werkzeug: `ikone: 'dolch'`).
- Wahl der Seltenheit: nach dem, was die Figur weiß (4.8). Magisches nach dem DMG, sobald die Figur es bestimmt hat; Dinge von Wert oder Bedeutung nach der Geschichte, zurückhaltend: `ungewoehnlich` für das, was man nicht in jedem Krämerladen bekommt, `selten` für Einzelstücke, `sehr_selten` und `legendaer` nur für das, was im Revier Legende ist.
- Wahl der Marke: `siegel` für gesiegelte Schriftstücke, solange das Siegel unversehrt ist; `beschaedigt`, sobald `zustand` etwas sagt; `benannt` für Stücke mit Namen oder Geschichte; `unbekannt` für Fundstücke, deren Wirkung oder Herkunft die Figur nicht kennt. Passt mehr als eine, zählt die, die für die Figur am meisten bedeutet (ein beschädigtes Erbstück ist `benannt`, sein Zustand steht in `zustand`).
- Fehlt der Sammlung ein Zeichen für ein Ding, das öfter vorkommen wird, schlägt die Spielleitung dem Weltenhüter beim Sitzungsende ein neues vor (Name und was es zeigt); gezeichnet wird es im Repository (`seite/zeichen.js`, README), nie in der Sitzung.

### 4.7 Das Spielerbuch
- Was das Spielerbuch ist und zeigt, steht im Regelwerk (4.7).
- Sammlungen: `meta/buch` (Titel, Stand, Stufe, Figur), `meta/glossar`, `glossar/<id>` (4.6), `tische/karte`, `tische/gepaeck`, `tische/logbuch` (4.2, 4.4, 4.5), `geschichte/<id>` (Wortlaut von „Was bisher geschah“, je Abschnitt ein Dokument, 21.1) und `sl/<id>` (Archiv der Spielleitung, etwa Würfelprotokolle, und die Ablage `sl/_…` mit den Kopien von Spielstand und Spoilerdatei und der Übergabe eines Zwischenhalts, 21.4 und 21.5: Das Buch zeigt `sl` nicht, und wem der Spieler das Buch teilt, der kann es nicht lesen; der Spieler selbst liest es so wenig wie die Spoilerdatei). Nur der Besitzer schreibt. Das Buch zeigt den Stand des letzten Sitzungsendes.
- Die Seite baut `node seite/bauen.js --seite --titel "<Figur>s Buch" > buch.gebaut.html` aus dem Repository im Stand `tische_stand` (die Tische sind eingebaut, ein Artefakt lädt keine Skripte von GitHub; die Vorlage nennt meta/welt unter `spielerbuch`); veröffentlicht wird sie mit `capabilities: {db: {rules: [{path: "", read: "view", write: "owner"}, {path: "sl", read: "owner", write: "owner"}]}}`. Eine neue Fassung der Tische heißt: neu bauen, dieselbe Adresse neu veröffentlichen.
- Daten hin und zurück, ohne dass etwas davon durch den Chat läuft:
  - Holen: ArtifactData `list` mit `out_dir` und `query.limit` 1000 für `meta`, `tische`, `glossar` und `geschichte`, alle in denselben Ordner; meldet ein Ergebnis einen `next_cursor`, holt sie den Rest mit `query.cursor` nach. Von `sl` holt sie nur die Ablage (21.5): `query sl` mit `where: [["datei", "in", ["02_spielstand.md", "03_spielleitung_SPOILER.md", "uebergabe.md"]]]` und `out_dir`, in denselben Ordner; das Archiv wird nie geholt, nur ergänzt (21.3, Schritt 5). Den Text der Ergebnisse von `meta`, `tische` und `glossar` speichert die Spielleitung wörtlich als versionen.txt, samt Kopfzeile und, bei mehr als 50 Dokumenten, der gekürzten Schlusszeile `[… more saved documents … (id, version): …]`, denn nur er trägt die Versionen; `geschichte` und das Archiv brauchen keine, sie bekommen nur neue Dokumente.
  - `node seite/bauen.js --zurueck <db-ordner> <ordner>` schreibt daraus 02_glossar.md, 02_karte.json, 02_inventar.json, 02_questlog.json, 02_geschichte.md und 03_archiv.md zum Bearbeiten und Prüfen. Aus der Ablage schreibt es dazu 02_spielstand.md, 03_spielleitung_SPOILER.md und uebergabe.md und meldet, von wann sie sind und ob die Prüfsumme stimmt (21.5).
  - `node seite/bauen.js --db <neu> 02_glossar.md 02_karte.json 02_inventar.json 02_questlog.json` macht nach der Prüfung wieder Dokumente. Den Abschnitt der Sitzung und das Würfelprotokoll spielt sie als neue Dokumente in denselben Ordner ein: `node seite/bauen.js --db <neu> --reihe-ab <n> 02_geschichte-neu.md --sl-reihe-ab <m> --sl wuerfelprotokoll-sitzung-N.md`, mit n = Zahl der Abschnitte, die `geschichte` schon hat (aus dem `list`-Ergebnis), und m = 100 plus Sitzungsnummer (ordnet nur das Archiv, falls es je als Datei gebaut wird); Spielleitungswissen nimmt es nur über `--sl` an, und meta/buch rührt dieser zweite Aufruf nicht an.
  - `node seite/bauen.js --batches <neu> --alt <db-ordner> versionen.txt > batches.jsonl` schreibt je Zeile ein `writes`-Array für ArtifactData `batch`: nur geänderte Dokumente, mit `if_version`, gestrichene als `delete`, neue (Geschichte, Archiv) ohne `if_version`, höchstens 50 je Aufruf. Jede Zeile geht so, wie sie in der Datei steht, als ein `batch` hinaus; auch eine Wiederholung nimmt sie aus der Datei. Die Ablage fasst `--batches` nie an; sie schreiben `--kopie` und `--uebergabe` (21.4, 21.5).
  - Ein Batch gilt ganz oder gar nicht. Meldet ArtifactData „no approval record … retry“, ist nichts geschrieben: Die Spielleitung schickt dieselbe Zeile sofort unverändert noch einmal und, scheitert auch das, nach einem anderen Schritt (etwa dem nächsten Batch) ein drittes Mal. Geht sie dann nicht durch, stellt sie den Batch zurück (21.3).
  - `version_mismatch` wiederholt sie nie unverändert. „already exists … no if_version“: versionen.txt kennt das Dokument nicht; sie holt neu und baut die Batches neu. „no longer at version …“: Das Dokument hat sich seit dem Holen geändert; sie liest es, nimmt die Änderung auf und pinnt auf die neue Version.
  - Sie lässt nie `if_version` weg und pinnt nie auf eine frisch gelesene Version, ohne den Inhalt auf diese Fassung neu zu bauen; beides hebt den Schutz vor fremden Änderungen auf.
  - Fragt die App vor dem Schreiben um Freigabe, sagt die Spielleitung vorher, was der Aufruf schreibt (Buch oder Chronik, wie viele Dokumente); jeder Versuch fragt neu.
- Hat die Spielleitung keine Artefakt-Datenbank oder kann sie keinen Code ausführen (22.1), liegen dieselben Daten als Dateien im Projekt (02_karte.md, 02_inventar.md, 02_questlog.md, 02_glossar.md, 02_geschichte.md), und die Tische erscheinen im Chat.

### 4.8 Spoilerschutz der Tische
- Der Grundsatz steht im Regelwerk (4.8), wie die Werkzeuge geholt werden in 4.2.
- Vor jeder Änderung läuft die Prüfung aus dem Repository, mit dem Spielstand und seinen Teilen (die Geschichte, das Glossar), in dieser Reihenfolge, denn das Glossar zählt danach als Beleg:
  1. Glossar: `node pruefen.js 02_glossar.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_karte.json 02_inventar.json 02_questlog.json figuren.json` (`figuren.json`: `["Name", …]` der Figuren aus der Weltchronik)
  2. Karte, Gepäck, Logbuch: `node pruefen.js 02_karte.json 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md` (ebenso `02_inventar.json`, `02_questlog.json`)
  3. Wissensbuch (5.1): `node pruefen.js 03_spielleitung_SPOILER.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md`
  Erst „FREIGEGEBEN“ darf ins Spielerbuch oder in den Chat. Was die Prüfung prüft, steht in der README; die wichtigsten Sperren: Namen, Wörter, Zahlen und Reisezeiten, die nicht im Spielstand stehen oder nur in der Spoilerdatei; **Belegprüfung** für Gepäck und Logbuch (jeder Satz braucht eine Zeile im Spielstand mit mindestens 70 % seiner Inhaltswörter, der Wortlaut eines Schriftstücks 90 %); **Wortpaare** bei Gepäck und Logbuch (zwei benachbarte Wörter, die so nur in der Spoilerdatei stehen); **Lore-Check** (Mondphasen und Daten gegen den Weltkalender 8.1, Stufengrenzen gegen 11.1, Stand, Frist, EP, Termine und Gefahr-Stufe gegen den Spielstand); beim Glossar Form, Quellen, Tage, 🎭 und Querverweise.
- Was die Maschine nicht kann: einen Posten erkennen, der mit gewöhnlichen Wörtern umschreibt, was nur die Spoilerdatei weiß. Darum liest die Spielleitung jeden neuen Posten und Satz vor dem Eintragen gegen die Spoilerdatei, ebenso jeden neuen Abschnitt der Geschichte, den keine Maschine prüft.
- Ohne Node-Zugang ändert die Spielleitung die Daten nur mit Wörtern, die wörtlich im Spielstand stehen, bei der Karte im Abschnitt „Karte“, vermerkt „ungeprüft“ im Kopf der Datei und prüft in der nächsten Sitzung mit Zugang nach.

## 17 Die geteilte Welt

### 17.6 Treffen
- Treffen ergeben sich aus dem Spiel: Die Figuren haben voneinander gehört und sich über Post oder Mittelsleute auf Ort und Welttag verständigt. Die Verabredung steht in der Chronik unter `treffen` (verabredet), mit Ort, Welttag und Absprache.
- Beide müssen am selben Ort am selben Welttag sein. Wer im Kalender vorn liegt, spielt bis zum Treffpunkt und wartet dort im Spiel: rastet, arbeitet, erledigt Kleines am Ort, ohne ihn zu verlassen. Er darf stattdessen weiterziehen und per Brief einen neuen Tag vorschlagen; dann ist die alte Verabredung abgesagt.
- Eine Verabredung verfällt, wenn eine Figur länger als vier Wochen Echtzeit am Treffpunkt wartet: Ihr Spieler sagt sie ab, die Spielleitung setzt `abgesagt`, schreibt eine Spur („der andere kam nicht“), und die Figur zieht weiter. Neu verabreden kann man sich jederzeit.
- Gespielt wird zusammen an einem Rechner, im Projekt eines der beiden Spieler (Gastgeber). Der Gast lädt Spielstand und Spoilerdatei seiner Figur ungelesen in den Chat. Die Spielleitung verrät keinem Spieler die Geheimnisse des anderen.
- Beim Treffen gelten die Figuren als Verbündete: Gegner-EP werden geteilt (11.2), Meilensteine bekommt jede Figur nach ihrem eigenen Auftrag.
- Am Ende gibt die Spielleitung beide Spielstände aus, bei Änderungen auch die Spoilerdateien, schreibt die Chronik für beide und vermerkt das Treffen. Danach nimmt jeder seinen Spielstand mit in sein Projekt. Reisen sie weiter zusammen, ist jede gemeinsame Sitzung ein weiteres Treffen.

## 18 Weltchronik

- Was die Chronik ist und was die Spielleitung zu Beginn jeder Sitzung liest, steht im Regelwerk (18). Hier stehen die Sammlungen im Einzelnen und das Schreiben.
- Sammlungen und Felder:
  - **meta/welt**: Name der Welt, gültige Regelwerk-Version, Welttag 1, Weltenhüter, Adressen von Würfelkasten, Kartentisch, Rastübersicht, Gepäck, Logbuch, Glossar, Händlertisch, Titelbildschirm und Kampfkarte (ein Stand für alle Tische, `tische_stand`, 4.2) und die Vorlage des Spielerbuchs (`spielerbuch`, 4.7).
  - **orte**: je Ort id, name, x, y (Weltraster, 4.2), art (Ortsart der README), revier, erstmals (welttag, figur), aktualisiert (JJJJ-MM-TT). Hier steht die Lage; was eine Figur über den Ort weiß, steht in ihren Kartendaten.
  - **figuren**: je Figur name, spieler, revier, status (aktiv, ruhend, tot), start (welttag, ort), stand (welttag, datum, tageszeit, ort), ruf (was man sich erzählt), erkennungszeichen, gefolge, buch (Link zum Spielerbuch, privat; nur zum Wiederfinden), aktualisiert (JJJJ-MM-TT).
  - **reviere**: je Revier name, inhaber, gebiet (Orte), schluesselfiguren, abenteuer (Titel, Frist), status (laufend, abgeschlossen), oeffentlich (was jeder über die Gegend weiß), aktualisiert (JJJJ-MM-TT).
  - **chronik**: je Ereignis welttag, datum, ort, revier, figuren, art (ereignis, geruecht, tod, spur, zettel, wetter, handel), oeffentlich (was man sich erzählt), verbreitung (wo ab welchem Welttag man davon hört), geheim (was wirklich war; nur für Spielleitungen), quelle (Spieler, Sitzung), eingetragen (Tag des Eintrags in der echten Welt, JJJJ-MM-TT). Ein `zettel` trägt zusätzlich wortlaut, versteck und haltbar (bis Welttag). Ein `handel` steht in der Chronik, wenn etwas den Besitzer wechselt, das eine andere Figur finden oder kaufen könnte (eine verkaufte Waffe, ein Einzelstück, ein Schuldschein), oder wenn ein Händler ausgekauft ist; Rationen, Kerzen und Mahlzeiten nicht (10.1).
  - **ruf** (10.3): je Figur und Gruppe oder Person, bei der sich ihr Ruf über das Dorf hinaus herumspricht: figur, bei (Gruppe oder Person, mit Ort), oeffentlich (was man sich erzählt), verbreitung (wo ab welchem Welttag man davon hört), welttag, quelle (Spieler, Sitzung), eingetragen. Id: `<figur>-<gruppe>`. Der Renown-Wert und die Neigung selbst stehen nur in der Spoilerdatei; eine Spielleitung in einem anderen Revier leitet daraus die erste Neigung fremder Mitglieder ab (10.3), sobald die Kunde sie erreicht hat.
  - **geheimnisse**: Wahrheiten, die mehrere Reviere betreffen können: thema, wahrheit, betrifft, quelle, aktualisiert (JJJJ-MM-TT).
  - Daten in `aktualisiert` und `eingetragen` stehen als JJJJ-MM-TT, damit `query` mit `where` seit einem Datum lesen kann (Regelwerk 18); seit 3.16, ältere Einträge sind umgestellt.
  - **post**: von, an (Name oder Beschreibung, mit Ort), abgeschickt (welttag, ort), weg, ankunft (welttag frühestens, ort), inhalt (Wortlaut), siegel, sprache, zugestellt (ja/nein, welttag, wie), geoeffnet (von wem, falls unterwegs gelesen), quelle (Spieler, Sitzung).
  - **treffen**: figuren, ort, welttag, status (verabredet, gespielt, abgesagt), absprache.
  - **nachtraege**: was über den Briefkasten der Seite eingereicht wurde (figur, stand, eingereicht, anzahl); die Seite schreibt das selbst.
- **Auf „Sitzungsende“** schreibt sie: den eigenen Eintrag in figuren (Datum, Ort, Ruf, Gefolge, Status), neue Einträge in chronik (mit `eingetragen`), Ruf, der sich über das Dorf hinaus herumspricht, in ruf (10.3), neue Orte in orte, neue Weltgeheimnisse, gesendete und zugestellte Post, Treffen. Einträge sind knappe Fakten, keine Spielszenen. Was nur das eigene Revier betrifft und geheim bleiben soll, gehört in die Spoilerdatei, nicht in die Chronik. Sie schreibt wie in 4.7 und pinnt nur auf die Version, auf der ihr Eintrag beruht: für figuren und reviere die Versionen vom Spielstart oder aus der Übergabe (21.4); fehlen sie, liest sie die beiden Dokumente vorher mit `get`. Meldet die Chronik `version_mismatch`, hat meist eine andere Spielleitung das Dokument geändert: Sie liest es, arbeitet ihren Eintrag in die neue Fassung ein und schreibt erst dann; fremde Angaben überschreibt sie nie.
- **Briefkasten der Seite.** Für Spielleitungen, die die Datenbank nicht selbst lesen oder schreiben können, hat die Seite zwei Knöpfe, beide nur für angemeldete Konten mit Zugang: **Sitzungspaket speichern** lädt alle Sammlungen als Datei `01_chronik.md` herunter, die der Spieler ungelesen ins Projekt legt; **Nachtrag einreichen** nimmt den Chroniknachtrag entgegen und schreibt ihn in die Sammlungen. Der Weltenhüter darf Nachträge für andere einreichen.
- **Chroniknachtrag.** Ist die Chronik nicht erreichbar oder hat die Spielleitung keinen Zugang, spielt sie trotzdem weiter und gibt beim Sitzungsende alle fälligen Einträge als Datei `chroniknachtrag.json` aus (zur Not als Codeblock), die der Spieler ungelesen einreicht oder dem Weltenhüter schickt. Aufbau: `{"figur":"<id der Figur>","stand":"<Datum>","eintraege":[{"sammlung":"chronik","id":"wt0012-…","daten":{…}}, …]}`. Für Dokumente, die es schon gibt (die eigene Figur, das Revier, ein Brief bei der Zustellung), enthält `daten` nur die Felder, die sich ändern; die Seite legt Neues an und ergänzt Vorhandenes. Die Ids folgen dem Muster der bestehenden Einträge (chronik: `wt<Welttag vierstellig>-<stichwort>`, für Tage vor Welttag 1 `wt-<Abstand vierstellig>-<stichwort>`, post: `wt<Welttag>-<von>-an-<an>`).
- Die Chronik wächst. Einträge, die älter als ein Jahr Weltzeit sind, fasst der Weltenhüter je Revier zu einem Eintrag zusammen, damit Sitzungspakete handlich bleiben.

## 21 Spielstand pflegen

### 21.3 Sitzungsende
Auf „Sitzungsende“ oder wenn der Spieler aufhört („Sitzungsende“ ist die sichere Form), in dieser Reihenfolge:
1. Glanzmoment, wenn fällig (11.4). Steht ein Aufstieg an (Regelwerk 7.4), danach in einem Absatz: die Wahl des Spielers (sie fragt, wenn er sie noch nicht gesagt hat) und der Weg, den sie vorschlägt; beides kommt in Schritt 4 unter „Jetzt“ in den Spielstand, damit die nächste Sitzung mit dem neuen Bogen und dem Weg beginnt.
2. Spielerbuch holen und in Dateien verwandeln (4.7: `list` mit `out_dir` für meta, tische, glossar und geschichte, die Ablage mit `query`, versionen.txt, `--zurueck`); das Archiv wird nicht geholt. Aus der Ablage legt `--zurueck` die Kopien von Spielstand und Spoilerdatei daneben, dazu projekt-dokumente.txt und, nach einem Zwischenhalt, die Übergabe (21.4, 21.5).
3. Neu lesen, bevor geschrieben wird: `project_info` und die Meldung von `--zurueck` zeigen, ob die Kopien gelten (21.5). Gelten sie, arbeitet die Spielleitung auf ihnen; sonst fragt sie nach 21.5 oder liest Spielstand und Spoilerdatei neu aus dem Projekt und arbeitet auf dieser Fassung. Was andere seit dem letzten Schreiben eingetragen haben, bleibt stehen: Sie ändert, was ihre Sitzung ändert, und nichts sonst; widerspricht Fremdes dem Gespielten, gilt das Gespielte (21.2), und sie sagt es dem Spieler.
4. Spielstand nachführen: „Jetzt“ neu, Kurzchronik um einen Absatz, Figur und EP, Inventar, Tiere und Gefolge, Karte, Questlog, Fäden, Einfälle, Post, unter „Geteilte Welt“ das Datum des Abgleichs vom Sitzungsbeginn (18); die Stichwortliste noch nicht. Liegt der Kern ohne die Stichwortliste über etwa 50.000 Zeichen, kürzt sie ihn nach 21.1. Die Geschichte bekommt den Abschnitt der Sitzung, „### Sitzung N, Tag …“, erzählt wie die früheren Abschnitte: was geschah, mit den Sätzen, die wörtlich zählen, kein Chatprotokoll; er steht als eigene Datei 02_geschichte-neu.md mit nur diesem Abschnitt (4.7, `--reihe-ab`) und wird für die Prüfung an 02_geschichte.md angehängt. Glossar, Karte, Gepäck und Logbuch bekommen das Neue (4.2 bis 4.6), das Gepäck dazu Zeichen, Seltenheit und Marke neuer Dinge und die neue Marke sichtbar veränderter (4.4). Nach einem Zwischenhalt ist die Übergabe die Grundlage für alles bis dorthin (21.4).
5. Spoilerdatei nachführen: Zeitleiste, Uhren und Neigungen (8.3), Renown der Gruppen und offene Nebenaufträge mit Lohn (10.3), Reaktionen, Folgen, Meilensteine (11.3), Händler (10.1), Wissensbuch (5.1). Das Würfelprotokoll der Sitzung wird eine eigene Datei mit einem Abschnitt „## Würfelprotokoll Sitzung N“ und ein neues Dokument im Archiv (`sl`, 4.7 mit `--sl-reihe-ab`); 03_archiv.md gibt es nicht mehr.
6. Prüfen (4.8) gegen die neue Spoilerdatei, in der Reihenfolge dort; die Geschichte liest die Spielleitung selbst gegen die Spoilerdatei. Weiter geht es erst, wenn alles „FREIGEGEBEN“ meldet.
7. Stichwortliste im Spielstand erneuern (`node glossar.js --liste 02_glossar.md`).
8. Spielerbuch einspielen (`--db` zweimal wie in 4.7, `--batches` nach batches.jsonl, ArtifactData `batch`).
9. Weltchronik nach 18; bleibt ein Batch dort nach drei Versuchen hängen, gibt sie die Einträge als Chroniknachtrag aus (18). Danach schickt sie zurückgestellte Batches des Spielerbuchs noch einmal unverändert; gehen sie wieder nicht durch, sagt sie es dem Spieler, gibt den Ordner `<neu>` mit versionen.txt als Archiv aus und vermerkt in Schritt 10 unter „Jetzt“, dass das Spielerbuch nachzuspielen ist.
10. Spielstand und Spoilerdatei ins Projekt: erst noch einmal `project_info`; hat sich die Größe des Projektwissens seit Schritt 3 geändert, hat inzwischen jemand anders geschrieben, und sie liest neu wie dort. Dann `project_write` mit `local_path`, je Datei ein Aufruf, nie mit dem Text im Aufruf.
11. Kopien (21.5): `project_info` für die neue Größe des Projektwissens und die Pfade der Projektdokumente (je Zeile einer in projekt-dokumente.txt), dann `node seite/bauen.js --kopie <ordner> --projekt <größe> --dokumente projekt-dokumente.txt --sitzung "Sitzung N" --sitzungsende 02_spielstand.md 03_spielleitung_SPOILER.md versionen.txt` und die Zeile als ArtifactData `batch`; sie schreibt beide Kopien und löscht die Übergabe. Geht der Batch auch beim dritten Versuch nicht durch (4.7), ist nichts verloren: Die nächste Sitzung merkt es an der Kopie und liest neu.
12. Gemälde für Orte, die die Figur zum ersten Mal betreten hat, wenn es einen Bildersaal gibt (21.6).
Die Dateien bearbeitet die Spielleitung als Dateien mit gezielten Änderungen (Edit, kleine Skripte). Spielstand und Spoilerdatei schreibt sie nie im Ganzen neu, weder in den Chat noch in eine Datei, außer wenn keine Kopie gilt und `project_read` den Text nur in den Chat liefert (21.5). Hat sie keinen Zugriff auf das Projekt, gibt sie die Dateien aus, oder den Spielstand als Text im Chat und die Spoilerdatei nur auf Nachfrage, klar als Spoiler markiert.

### 21.4 Zwischenhalt
- Auf „Zwischenhalt“ (Regelwerk 21.3) schreibt die Spielleitung die Übergabe als Datei uebergabe.md und legt sie in die Ablage des Spielerbuchs: die Version einer schon liegenden Übergabe mit `query sl` auf `where: [["datei", "==", "uebergabe.md"]]` holen (eine Zeile für versionen.txt; kein Treffer heißt keine Übergabe), `node seite/bauen.js --uebergabe <ordner> uebergabe.md versionen.txt`, die Zeile als ArtifactData `batch`. Das Archiv holt sie dafür nicht. Liegt schon eine Übergabe aus einem früheren Teil der Sitzung, schreibt sie diese fort (Teil 2, 3 …); nichts aus früheren Teilen fällt weg. Sonst ändert sie nichts: nicht das Projekt, nicht das übrige Spielerbuch, nicht die Chronik.
- Die Übergabe enthält, was ein neuer Chat braucht, um ohne den alten weiterzuerzählen, und was das Sitzungsende braucht:
  - Kopf: Sitzung und Teil, Welttag, Tageszeit und interne Uhr (8.2), Ort, Wetter, Mond, die laufende Stimmung (3.2), die nächste Wurfnummer (6.2), das Datum des Chronikabgleichs, die Versionen des eigenen Eintrags in figuren und reviere und was aus der Chronik für die Sitzung zählt (18)
  - der letzte Spieltisch, wörtlich: Statuszeile, zweite Zeile, Optionen
  - was sich an der Figur seit dem Sitzungsbeginn geändert hat: TP, Plätze, Ressourcen, Heldenmut, Einfälle, EP mit Grund, Geld, Rationen, Gepäck, Tiere und Gefolge, Post, gegebenes Wort, Neues für Glossar, Karte und Logbuch, dazu Zeichen, Seltenheit und Marke neuer Dinge (4.4)
  - die Szene: wer da ist, was die Leute wollen und wissen (5.1), was offen ist, wie die Figur aufgetreten ist (10)
  - der Verlauf der Sitzung als Entwurf für die Geschichte, erzählt wie die früheren Abschnitte, mit den Sätzen, die wörtlich zählen; kein Chatprotokoll
  - für die Spoilerdatei: Uhren und Neigungen (8.3), Renown und Nebenaufträge (10.3), Reaktionen, Folgen, Meilensteine (11.3), Händler (10.1), Wissensbuch (5.1) und das Würfelprotokoll
- Die Übergabe nennt Geheimnisse so offen wie die Spoilerdatei; darum liegt sie nur in der Ablage und steht nie im Chat.
- Danach sagt die Spielleitung in zwei Sätzen, was gesichert ist und dass es in einem neuen Chat in diesem Projekt mit „Weiter“ weitergeht. Im alten Chat spielt sie nicht weiter; schreibt der Spieler dort doch weiter, erinnert sie einmal an den neuen Chat, spielt dann weiter und schreibt die Übergabe beim nächsten Halt neu.
- **Weiter** (im neuen Chat, oder wenn zu Beginn einer Sitzung eine Übergabe liegt): Die Spielleitung liest das Regelwerk aus dem Projekt, holt Spielstand, Spoilerdatei und Übergabe aus der Ablage auf die Platte (Regelwerk 21.3, 21.5) und liest die Übergabe und den Spielstand ganz, die Spoilerdatei gezielt; dazu die Dateiliste des Bildersaals (3.3), nicht die Chronik. Dann zeigt sie ohne Titelbildschirm (4.10) das Gemälde des Ortes (3.3) und schreibt statt Rückblick und Befehlszeile ein, zwei Sätze, die zurück in die Szene führen, dazu die Klangzeile (3.2) und den letzten Spieltisch aus der Übergabe. Weiter geht es, wie der Spieler antwortet.
- Beim Sitzungsende ist die Übergabe die Grundlage für alles bis zum letzten Zwischenhalt (21.3, Schritt 4); Schritt 11 löscht sie.

### 21.5 Kopien im Spielerbuch
- Spielstand und Spoilerdatei liegen außer im Projekt als Kopie in der Ablage des Spielerbuchs: `sl/_spielstand` und `sl/_spoiler`, je mit `datei`, `text` (die Datei, wie sie im Projekt steht), `zeichen`, `sha256`, `projekt` (die Größe des Projektwissens, `knowledge_size` aus `project_info`, gleich nach dem Schreiben ins Projekt), `dokumente` (die Pfade der Projektdokumente aus `project_info` zur selben Zeit), `sitzung` (wer geschrieben hat: „Sitzung 11“, „Weltenhüter“) und `geschrieben` (JJJJ-MM-TT). Wie alles unter `sl` liest der Spieler sie nicht (4.7).
- Wozu: Die Ablage ist die Hauptfassung beider Dateien (Regelwerk 21.1). Beim Spielstart und beim Sitzungsende kommen sie mit einem `query` auf die Platte (4.7, 21.3); die Spielleitung liest sie dort, ändert sie gezielt und schreibt sie per `local_path` ins Projekt, dessen Dateien ihre Abschrift sind. Sie aus dem Chat abzuschreiben, war der größte Posten beim Speichern.
- Die Kopien gelten, wenn `--zurueck` „Prüfsumme stimmt“ meldet und ihr `projekt` gleich der heutigen Größe des Projektwissens ist: Dann hat seit dem letzten Schreiben niemand das Projekt geändert. Weicht die Größe ab, vergleicht die Spielleitung projekt-dokumente.txt mit den Pfaden aus `project_info`: Ist ein Dokument dazugekommen oder weggefallen, erklärt das die Abweichung, und die Kopien gelten. Ist die Liste gleich, fragt sie den Spieler einmal, ob jemand Spielstand oder Spoilerdatei im Projekt von Hand geändert hat; nur bei Ja, oder wenn niemand antworten kann, liest sie beide neu mit `project_read`: Legt es eine Datei ab, arbeitet sie mit ihr; gibt es den Text in den Chat, schreibt sie diese Fassung einmal als Datei, mit den Änderungen der Sitzung. Ebenso, wenn eine Kopie fehlt (ein neues Spielerbuch) oder die Spielleitung kein `project_info` hat.
- Steht unter `sitzung` nicht die vorige Sitzung, sondern etwa „Weltenhüter“, hat zwischendurch ein anderer Chat auf dem richtigen Weg geschrieben, womöglich erst während dieser Sitzung. Die Kopien gelten, aber die Spielleitung liest sie, bevor sie ändert, damit sie nichts davon überschreibt.
- Wer außerhalb eines Sitzungsendes etwas im Projekt ändert (eine Spielleitung auf Wunsch des Weltenhüters, ein neues Regelwerk, ein Umbau), schreibt danach die Kopien neu: `project_info`, dann `--kopie` mit `--dokumente` und `--sitzung "Weltenhüter"`, ohne `--sitzungsende`. Ohne die Werkzeuge genügt, in beiden Kopien `projekt` und `dokumente` nachzuziehen, wenn Spielstand und Spoilerdatei selbst unverändert sind (ihre `sha256` stimmt). Wer eine Datei von Hand ändert, sagt es beim nächsten Sitzungsbeginn; dann gelten die Kopien in dieser Sitzung nicht.
- Eine Kopie über 250 KiB lehnt `--kopie` ab (die Grenze eines Dokuments); dann kürzt die Spielleitung nach 21.1, bevor sie speichert.

### 21.6 Ortsgemälde anlegen
- Gibt es einen Bildersaal (3.3), bekommt jeder Ort, den die Figur in der Sitzung zum ersten Mal betreten hat, ein Gemälde, als letzter Schritt des Sitzungsendes, wenn alles andere gesichert ist (21.3, Schritt 12). Ist der Chat dafür schon zu lang, malt die Spielleitung in einem eigenen Chat nach dem Sitzungsende („Gemälde für <Ort>“) oder beim nächsten Sitzungsende; bis dahin hat der Ort kein Bild.
- Motiv ist der Ort, wie die Figur ihn beim ersten Betreten wahrgenommen hat, mit Tageszeit und Wetter der Ankunft. Auf das Bild kommt nichts, was die Figur nicht gesehen hat, und nichts, was nur die Spoilerdatei weiß (4.8).
- Gemalt wird mit dem Skill für selbstmalende Gemälde. Das Bild wird als PNG mit 1040 × 780 Pixeln gerendert (Playwright: warten, bis es fertig gemalt ist, dann das Canvas speichern) und kommt als `bilder/<ort>.png` in den Bildersaal: die Seite mit Artifact `read` holen, ein Bild mit Messingschild ergänzen (Ort, Motiv, Weg und Reisezeit, soweit die Figur sie kennt) und mit `url` und `files` neu veröffentlichen, das HTML des Gemäldes als `bilder/<ort>.html` gleich mit. `<ort>` ist der Ortsname klein, mit ae, oe, ue und ss für ä, ö, ü und ß und `_` für Leerzeichen (`krummer_anker`, `suesswasser`).
- Ins Projekt kommt dabei nichts, denn nach den Kopien (21.3, Schritt 11) soll das Projekt bleiben, wie es ist (21.5).

## 22 Neu einsteigen

Für Spieler:
1. Ein eigenes Claude-Konto anlegen und ein neues Projekt „Hold der Seeprinzen – <Name>“ erstellen. Projekte gibt es auch im kostenlosen Plan, dort höchstens fünf; wer regelmäßig spielt, kommt mit Pro oder Max weiter, weil jede Nachricht Regelwerk, Spielstand und Spoilerdatei mitlädt (21.1). Was mit einem kostenlosen Konto anders läuft, steht in 22.1.
2. Die Projektanweisungen aus der Vorlage einfügen (Name, Figur, Chronik-Adresse eintragen) und das Regelwerk als 00_regelwerk.md und die Werkstatt als 00_werkstatt.md ins Projekt laden (beide im Repository unter docs/).
3. Der D&D-Beyond-Kampagne des Weltenhüters beitreten und die Figur dort nach 7.2 bauen, Stufe 1. Den Bogen als PDF exportieren und ins Projekt laden.
4. Beim Weltenhüter Schreibrecht für die Weltchronik holen: Er lädt dich per E-Mail als Bearbeiter ein. Auf der Chronikseite prüfst du mit „Schreibrecht prüfen“, ob es klappt. Klappt es, führt deine Spielleitung die Chronik selbst (ArtifactData), oder du führst sie über den Briefkasten der Seite (18, 22.1). Meldet die Seite auch angemeldet „nicht erreichbar“, läuft die Chronik für dich über den Weltenhüter (22.1).
5. Die erste Sitzung beginnen. Die Spielleitung liest Bogen und Chronik, legt Spielstand, Revier, Spoilerdatei und Spielerbuch an und trägt die Figur in die Chronik ein. Die Spoilerdatei nicht lesen; das Spielerbuch darfst du jederzeit öffnen.

### 22.1 Mit einem kostenlosen Konto
Das Spiel geht auch mit einem kostenlosen Konto. Einiges läuft dort anders:
- **Jede Nachricht zählt.** Das Konto hat ein Nutzungslimit je fünf Stunden und je Woche, und jede Nachricht lädt das Projektwissen mit. Darum: Spielstand handlich halten (21), lieber kurze Sitzungen mit „Sitzungsende“ oder einem Zwischenhalt (21.4) als mitten im Spiel ins Limit laufen, keine Nebenfragen im Spielchat. Läuft das Konto doch ins Limit, geht es nach der Wartezeit im selben Chat weiter; erst dann „Sitzungsende“.
- **Tische und Würfelkasten** laden vielleicht nicht. Dann gilt die Textform (4.2 bis 4.6, 6.1): Karte, Gepäck, Logbuch und Glossar als Text, Würfel per Hand, Rast per „kurze Rast“ oder „lange Rast“, Briefe per „Brief an …“.
- **Ohne Artefakt-Datenbank oder ohne Code** gibt es kein Spielerbuch: Tischdaten, Glossar und Geschichte liegen dann als Dateien im Projekt (4.7) und laden mit jeder Nachricht mit. Darum zählt hier doppelt, den Spielstand handlich zu halten. Einen Zwischenhalt gibt es dann nicht; die Spielleitung schlägt stattdessen das Sitzungsende vor.
- **Code läuft vielleicht nicht.** Dann entfällt die Spoilerprüfung (4.8); die Spielleitung hält sich an die Wortregel und vermerkt „ungeprüft“. Den Bogen liest sie aus der PDF-Ansicht; kommt nichts an, tippt der Spieler die Werte einmal ab, und sie stehen fortan im Spielstand.
- **Die Chronik läuft über Dateien.** Kann deine Spielleitung die Datenbank nicht lesen (keine ArtifactData-Werkzeuge in deinem Chat), holst du dir vor einer Sitzung auf der Chronikseite das **Sitzungspaket** (`01_chronik.md`) und legst es ungelesen ins Projekt, an die Stelle des alten; zeigt die Seite dasselbe Änderungsdatum wie beim letzten Mal, kannst du dir das sparen. Die Spielleitung liest das Paket statt der Datenbank. Beim Sitzungsende gibt sie den **Chroniknachtrag** als Datei aus; du reichst ihn auf der Chronikseite ein, ohne ihn zu lesen. Kannst du auf der Seite nicht schreiben, schickst du den Nachtrag dem Weltenhüter und bekommst das Paket von ihm.
- **Dateien kommen von dir.** Kann die Spielleitung das Projekt nicht selbst beschreiben, gibt sie Spielstand, Spoilerdatei und Tischdaten beim Sitzungsende als Dateien aus (21); du ersetzt sie im Projekt, die Spoilerdatei ungelesen.

Für die Spielleitung in der ersten Sitzung:
- Bogen lesen (7.4), Spielstand anlegen (21) mit den Einstellungen für die Rastübersicht (4.3), Revier anlegen (17.2, Handwerk 22.3) mit Klima (9.7), Uhren (8.3), zwei bis drei Nebenaufträgen mit Lohn (10.3), Händlern (10.1) und Wissensbuch (5.1), Spielerbuch veröffentlichen (4.7) und darin Kartendaten mit dem Startort aus der Chronik (4.2), Gepäck, Logbuch und Glossar anlegen (4.4 bis 4.6), alles in die Chronik eintragen (18), dann den Titelbildschirm mit der neuen Figur zeigen (4.10) und auf „Spiel laden“ die Einführung geben (4.1) und mit einer Einleitung am Welttag 1 beginnen.

### 22.2 Umstieg einer laufenden Figur auf 3.0
- Spielstand teilen: Kern ins Projekt (21.1), „Was bisher geschah“ wörtlich als Geschichte, Tischdaten und Glossar ins Spielerbuch (4.7), Würfelprotokolle und die alte Fassung des Spielstands nach `sl`. In der Spoilerdatei Uhren und Neigungen (8.3) und das Wissensbuch (5.1) anlegen. Alles prüfen (4.8).
- Danach die alten Tischdateien und Konzeptpapiere aus dem Projekt löschen, denn alles im Projekt lädt jede Nachricht mit, und die Projektanweisungen nach der Vorlage der Chronikseite erneuern.

### 22.3 Handwerk beim Anlegen eines Reviers
Was ein Revier enthält, steht in 17.2 und 21.1. Hier steht, worauf die Spielleitung beim Bauen achtet; das gilt ebenso, wenn ein bestehendes Revier einen neuen Auftrag oder eine neue Bedrohung bekommt. Es sind Faustregeln für den Stoff, keine Spielregeln.
- **Jedes Geheimnis hat mehrere Spuren.** Was die Figur wissen muss, damit ein Auftrag weitergeht, liegt an mindestens drei Stellen: bei Leuten, an Orten, in Dingen. Fortschritt hängt nie an einer einzigen Probe oder daran, zu erraten, was die Spielleitung denkt; eine verpasste Spur verschiebt den Weg, sie versperrt ihn nicht (6.4).
- **Jeder Gegenspieler hat ein Ziel, eine Rechtfertigung und einen Bezug zur Figur.** Was er will, warum er sich im Recht glaubt und was ihn mit Herkunft, Handwerk, Bindung oder Taten der Figur verbindet, steht bei ihm in der Spoilerdatei. Er handelt über Uhren und Reaktionen (8.3), nicht über Auftritte.
- **Jede geplante Kampflage hat mehr als Gegner.** Die Spoilerdatei nennt zum Ort, was die Lage bewegt: Gelände und Wasser, Licht und Wetter, Unbeteiligte, ein Ziel außer Töten (fliehen, schützen, etwas holen oder halten) und was sich mitten im Kampf ändern kann. Schwierigkeit und EP regeln weiter 12.2 und 11.2.
- **Orte folgen der Karte, Ton folgt den Vorbildern.** Lage, Landschaft und Leben eines Ortes nach 20.1, Aufträge und Gegenspieler im Ton von 20.2; Ungeheuer und ihre Werte nach 7.1.
- **Das Revier kennt sein Klima.** Die Spoilerdatei trägt „## Klima“ je Jahreszeit (9.7): Regen- und Trockenzeit, Frost und Eis, Nebel, Stürme auf See, Hitze; daraus kommt das Wetter der Statuszeile, und daraus folgen Kälte, Hitze, Höhe und Eis als Gefahren. Ein Revier im Amedio hat andere Jahreszeiten als eins an der Eissee; beide stehen so fest wie die Karte.
- **Zwischenzeit, Zwischenfälle, Flüche und Schrecken wachsen aus dem Revier.** Die Spoilerdatei bekommt beim Anlegen drei kleine Abschnitte, die mit dem Spiel wachsen: „## Zwischenzeit“ mit den Verwicklungen, die in diesem Revier passieren können (8.4; aus Leuten, Uhren und Geheimnissen, nicht aus Buchtabellen), „## Zwischenfälle“ je Gelände für Verfolgungen (12.4) und „## Flüche und Schrecken“ mit Auslöser, Wirkung, Dauer und Lösung (14.1). Was es im Revier gibt (eine Arena, ein Archiv, einen Lehrer, einen Hehler, einen Tempel, einen Verkäufer für Magisches, eine Formel), steht bei den Orten, damit die Tätigkeiten der Zwischenzeit und 15.1 einen Boden haben; was es nicht gibt, gibt es nicht.
- **Schiffe und Häfen haben Werte, Grundrisse gibt es vorher.** Schiffe des Reviers stehen mit Werteblock nach Ghosts of Saltmarsh, Mannschaft, Kurs und Fahrplan in der Spoilerdatei (8.5); Orte, an denen ein Kampf auf der Kampfkarte wahrscheinlich ist (Gewölbe, Häuser mit mehreren Räumen, Hinterhalte, Decks), bekommen einen Grundriss als Text oder Skizze (12.6), aus dem die Spielleitung im Kampf zeichnet, was die Figur sieht.
- **Schätze sind Geschichte.** Alltagshorte folgen 10.2 (ein Viertel der Horttabelle); ein Schatz, der den Namen verdient, steht mit Herkunft, Besitzern und Folgen in der Spoilerdatei und wird mit dem Weltenhüter angelegt, denn er kauft ein Schiff (10.1) und zieht Kreise durch mehrere Reviere (17.4).

## 23 Wahlregeln

Die Tafel aller Wahlregeln der Bücher (7.1). **gilt** heißt in der Fassung des Buchs, **angepasst** in der Fassung des genannten Abschnitts des Regelwerks, **aus** heißt aus, mit Grund. Was hier nicht steht, ist aus. Geändert wird die Tafel nur mit dem Regelwerk, über den Weltenhüter (2).

**Die Gründe, nach denen „aus“ entschieden ist, in sechs Sätzen:**
1. **Werkzeuge rechnen mit festen Zahlen.** Würfelkasten, Rastübersicht und D&D Beyond kennen Boni, Zauberplätze, Trefferwürfel und Initiative nach PHB; Varianten, die daran drehen, kosten eine neue Fassung aller Tische (Übungswürfel, Fertigkeitsvarianten, Zauberpunkte, Initiativvarianten, Rast- und Heilvarianten).
2. **Raster nur auf der Kampfkarte** (12.6), und auch dort nichts, was Dauervorteil gibt (Flankieren) oder für Text zu fein ist (Blickrichtung, 5-10-5-Diagonalen).
3. **Nichts, was Figuren stärker oder Tode plötzlicher macht** (Markieren, Durchschlagen, massiver Schaden, Dauervorteil durch Flankieren, dunkle Gaben, epische Gaben, Training für Stufen als Bremse ebenso wie als Beschleuniger).
4. **Eigene Systeme stehen** (Heldenmut statt Inspiration und Heldenpunkten, Einfall statt Handlungspunkten, Neigung statt Haltungstabelle, Beziehungen und Frömmigkeit, Spoilerdatei statt Zufallstabellen, Chronik statt geteilter Kampagne, EP mit Meilensteinen statt Stufen ohne EP).
5. **Nicht bestrafend, Figur statt Spieler** (Wahnsinn, Stress, Verstand, Ehre).
6. **Nicht diese Welt** (Feuerwaffen, Sprengstoff, fremde Technik, Setting-Bücher, 2024-Regeln außer Zauberfassungen).

| Regel | Quelle | Stand |
|---|---|---|
| Attribute würfeln | PHB 13 | aus: Punktekauf oder Standardreihe (7.2) |
| Aufstieg sofort beim Erreichen der EP | PHB 15 | angepasst: zur nächsten Sitzung, mit Weg (7.4, 11.1) |
| Varianten-Mensch | PHB 31 | gilt (7.2) |
| Inspiration | PHB 125 | angepasst: Heldenmut (6.6) |
| Startgeld statt Ausrüstung | PHB 143 | aus: Startausrüstung (7.2) |
| Ausrüstungsgrößen | PHB 144 | aus: was passt, sagt die Geschichte (7.2) |
| Lebensumstände | PHB 157 f. | gilt (8.4, 16.2) |
| Mehrklassen | PHB 163 | angepasst: Mindestattribute, Lehrer oder Begründung aus dem Gespielten, Aufstieg zur nächsten Sitzung (7.2, 7.4) |
| Talente | PHB 165 | gilt, 2014-Quellen (7.2) |
| Fertigkeiten mit anderem Attribut | PHB 175 | gilt (6.7) |
| Traglast (Variante) | PHB 176 | gilt (9.5) |
| Reisetempo schnell/langsam | PHB 181 f. | gilt (8.2) |
| Zwischenzeit (Handwerk, Beruf, Erholung, Forschen, Training) | PHB 187 | angepasst (8.4) |
| Spiel auf dem Raster | PHB 192 | angepasst: nur auf der Kampfkarte, sonst Erzählung mit Metern (12.6) |
| Renown | DMG 22 | angepasst (10.3) |
| Begegnungen bauen, Schwellen | DMG 81 ff. | gilt (12.2); das Abenteuertag-Budget ist aus: Kämpfe sind selten und angekündigt (12.1) |
| Treue | DMG 93 | gilt (16.2) |
| Wetter, Kälte, Hitze, Höhe | DMG 109 f. | gilt (9.7); Zufallstabellen nur Hilfe |
| Gefahren der Wildnis | DMG 110 f. | gilt (9.7); Entweihter Boden und Rasierranke nur über die Spoilerdatei |
| Nahrungssuche, Orientierung | DMG 111 f. | gilt (9.8) |
| Schwimmen, Unterwasser | DMG 116 ff., PHB | gilt (9.7, 12.5) |
| Fahrzeuge zu Wasser | DMG 119, PHB 157 | angepasst: Ghosts of Saltmarsh (8.5) |
| Fallen | DMG 120 ff. | gilt (Spoilerdatei) |
| Zwischenzeit (Festung, Zechen, Ruf, Riten, Geschäft, Gerüchte) | DMG 127–131 | angepasst (8.4) |
| Training für Stufen | DMG 131 | aus: Aufstieg nach EP, zur nächsten Sitzung mit Weg (7.4); die weiche Grenze bremst (11.1), kein Geldtor dazu |
| Magisches herstellen | DMG 128, XGtE 128 f. | angepasst: nur mit Formel und Zutat aus der Spoilerdatei (15.1) |
| Magisches verkaufen | DMG 129 f. | gilt (10.1) |
| Zufallshorte und -beute | DMG 133 ff. | angepasst: Alltagshorte ein Viertel, Schätze mit dem Weltenhüter (10.2) |
| Magisches bestimmen (schwerere Bestimmung) | DMG 136 | gilt (15.1) |
| Gaben: Segnungen, Charms | DMG 227 f. | angepasst (15.1) |
| Auszeichnungen | DMG 228 ff. | angepasst (10.3) |
| Epische Gaben | DMG 231 f. | aus: Stufe 20 kommt nicht (11.1) |
| Erfolgsgrade, natürliche 20 und 1 | DMG 242 | angepasst (6.4, 6.5) |
| Soziale Interaktion (Haltungstabelle) | DMG 244 f. | aus: Neigung (8.3) |
| Spurenlesen-SG | DMG 244 | gilt (9.8) |
| Massen (Mob-Rechnung) | DMG 250 | aus: die Spielleitung würfelt per Code, auch für viele (6.1) |
| Flächen auf dem Raster | DMG 251 | gilt auf der Kampfkarte (12.6) |
| Flankieren, Diagonalen (5-10-5), Blickrichtung | DMG 251 f. | aus, auch auf der Kampfkarte: Umzingelung löst Moral aus statt Vorteil (12.1), Blickrichtung ist für Text zu fein, Diagonalen zählen nach PHB (12.6) |
| Verfolgungsjagden | DMG 252 ff. | angepasst (12.4) |
| Belagerungsgerät | DMG 255 | gilt, wenn es vorkommt (Werteblöcke); keine Kanonen (20) |
| Krankheiten | DMG 256 f. | angepasst (14) |
| Gifte | DMG 257 f. | gilt: Werte nach DMG, Vorkommen, Ernten und Kauf über die Spoilerdatei |
| Wahnsinn | DMG 258 ff. | aus (14.1) |
| Stufen ohne EP (Meilensteine) | DMG 261 | aus: EP mit Meilenstein-EP (11) |
| EP ohne Kampf | DMG 260 f. | angepasst (11.2, 11.3) |
| Übungswürfel | DMG 263 | aus: feste Boni in Bogen und Kasten |
| Fertigkeitsvarianten | DMG 263 f. | aus: dito |
| Heldenpunkte | DMG 264 | aus: Heldenmut (6.6) |
| Ehre | DMG 264 | aus: ein Kodex ist Spiel, kein Wert |
| Verstand | DMG 264 f. | aus (14.1) |
| Furcht und Horror | DMG 266 | angepasst (14.1) |
| Heilvarianten (Heilerkit-Pflicht, Heilschübe, langsames Heilen) | DMG 266 f. | aus: Rastübersicht und Trefferwürfel-Rechnung; Wunden wiegen über 14 |
| Rastvarianten (episch, grimmig) | DMG 267 | aus: kippt Zauber- und Trefferwürfel-Rechnung laufender Figuren und die Rastübersicht; Rast im Freien ist über 9.4 und 8.3 schon teuer |
| Feuerwaffen, Sprengstoff, fremde Technik | DMG 267 f. | aus: Schießpulver ist auf Oerth wirkungslos, Technik nach Gygax (20) |
| Handlungspunkte | DMG 269 | aus: die Welt erzählt die Spielleitung, der Einfall gibt dem Spieler sein Stück davon (6.6) |
| Initiativvarianten | DMG 270 | aus: Kasten und Reihenfolge nach 12.1 |
| Handlungsoptionen | DMG 271 f. | angepasst: fünf von sechs (12.3) |
| Deckung treffen | DMG 272 | gilt (12.3) |
| Durchschlagen | DMG 272 | aus (12.3) |
| Bleibende Verletzungen | DMG 272 | angepasst (14) |
| Massiver Schaden | DMG 273 | aus: ein Wurf, der eine Solo-Figur ohne Wahl fällt (6.5) |
| Moral | DMG 273 | angepasst (12.1), auch bei Umzingelung |
| Zauberpunkte | DMG 288 | aus: Zauberplätze in Statuszeile, Rastübersicht und Bogen |
| Fallgeschwindigkeit | XGtE 77 | gilt |
| Gleichzeitige Wirkungen | XGtE 77 | gilt |
| Schlaf | XGtE 77 f. | gilt (9.2) |
| Adamant | XGtE 78 | gilt, wenn es vorkommt |
| Knoten binden | XGtE 78 | gilt (6.7) |
| Werkzeuge | XGtE 78 ff. | angepasst (6.8) |
| Zauberwirker bemerken | XGtE 85 | gilt (15) |
| Zauber erkennen | XGtE 85 | gilt (15) |
| Ungültige Ziele | XGtE 85 f. | gilt (15) |
| Flächen auf dem Raster (Schablone, Marken) | XGtE 86 | gilt auf der Kampfkarte (12.6) |
| Begegnungen bauen (XGtE-Art) | XGtE 88 ff. | aus: DMG (12.2) |
| Zufallsbegegnungen (Tabellen) | XGtE 92 ff. | aus: Spoilerdatei (8.2); als Steinbruch erlaubt |
| Komplexe Fallen | XGtE 113 ff. | gilt (Spoilerdatei) |
| Zwischenzeit mit Verwicklungen und Rivalen | XGtE 123 ff. | angepasst (8.4); Tabellen aus |
| Magisches kaufen | XGtE 126 | angepasst (15.1) |
| Zauberrollen schreiben | XGtE 133 | gilt (8.4) |
| Gewöhnliche magische Dinge | XGtE 136 ff. | gilt über die Spoilerdatei (10.2) |
| Geteilte Kampagne | XGtE 172 ff. | aus: eigene geteilte Welt (17) |
| „Das ist dein Leben“ | XGtE 61 ff. | aus: den Hintergrund schreibt der Spieler (22) |
| Volksbezogene Talente | XGtE 73 ff. | gilt (7.2) |
| Wahlweise Klassenmerkmale | Tasha's | gilt (7.2) |
| Herkunft anpassen | Tasha's | gilt (7.2) |
| Gruppenpatrone | Tasha's | aus: Auftraggeber, Patrone und Orden stehen in der Spoilerdatei (10.3, 15) |
| Gefährten (Sidekicks) | Tasha's | angepasst (16.4); Aufstieg mit der Figur aus |
| Verhandeln mit Ungeheuern | Tasha's | aus als Regel; Hilfe für Spoilerdateien |
| Übernatürliche Regionen, magische Phänomene, Gefahren | Tasha's | angepasst: nur mit Eintrag in der Spoilerdatei (14.1) |
| Rätsel | Tasha's | aus |
| Schiffe, Rollen, Mannschaft, Wetter und Gefahren auf See, Gefecht | Ghosts of Saltmarsh, Anhang A | angepasst (8.5) |
| Zufallsbegegnungen auf See, Ausbau | Ghosts of Saltmarsh | aus: Steinbruch für Spoilerdateien |
| Furcht | Van Richten's Guide | angepasst (14.1) |
| Stress | Van Richten's Guide | aus (14.1) |
| Flüche | Van Richten's Guide | angepasst (14.1) |
| Dunkle Gaben | Van Richten's Guide | aus: Powercreep; was eine Figur wird, wird sie im Spiel |
| Abstammungen (Dhampir, Hexenblut, Wiedergänger) | Van Richten's Guide | aus beim Bau; was eine Figur im Spiel wird, entscheidet der Weltenhüter |
| Überlebende | Van Richten's Guide | aus |
| Spukfallen | Van Richten's Guide | gilt (Fallen) |
| Beziehungen | Strixhaven | aus: Neigung (8.3) |
| Frömmigkeit | Theros | aus: Renown bei einer Gemeinde (10.3) |
| Gildenruf | Ravnica | aus: Renown (10.3) |
| Drachenmale, Dunamantie, Spelljammer, Planescape, Dragonlance-Schlachten, Deck der vielen Dinge, Acquisitions Inc. | Setting-Bücher | aus: Setting-gebunden; Wesen und Dinge daraus nach 7.1 und 10.2 |
| Zauberfassungen 2024 | PHB 2024 | gilt nach Bogen (7.3) |
| Heldeninspiration | PHB 2024 | angepasst: Heldenmut (6.6) |
| Waffenmeisterschaft, Erschöpfung 2024, Bastionen, übrige 2024-Regeln | PHB/DMG 2024 | aus (7.2, 9.3) |
