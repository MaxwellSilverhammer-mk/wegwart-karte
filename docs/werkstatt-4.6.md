# Oerik – Werkstatt der Spielleitung

**Zum Regelwerk 4.6 · 15. November 2026 · Weltenhüter: Max**

Die Werkstatt ist der zweite Teil des Regelwerks: die Arbeitsschritte, die die Spielleitung nur zum Speichern, Bauen und Einrichten braucht, und die Tafel der Wahlregeln (23). Sie gilt wie das Regelwerk und wird mit ihm geändert, steht aber in einer eigenen Datei, damit sie nicht jede Sitzung mitlädt. Die Spielleitung liest sie, wenn sie einen Zwischenhalt macht oder eine Sitzung beendet, Spielerbuch, Ablage oder Chronik liest oder schreibt, Tische baut oder prüft, ein Treffen leitet, einen Kampf erzählt (12.7), einen Zauber umrechnet, nachschlägt oder zur Wahl stellt (7.3), eine neue Figur anlegt oder einem Revier einen neuen Auftrag, eine neue Bedrohung oder ein Gewölbe gibt (22.3), für eine Gegend nach ihrer Überlieferung sucht (20.2), wenn ein Spieler nach einer Regel der Bücher fragt, die im Regelwerk nicht steht (23), und immer, wenn das Regelwerk mit „W“ hierher verweist. Die Abschnitte tragen die Nummern des Regelwerks; eine Nummer meint den Abschnitt in dieser Datei, wo es ihn hier gibt, sonst den im Regelwerk.

## 4 Befehle und Bedienung

### 4.4 Zeichen, Seltenheit und Marke wählen
- Was ein Zeichen, eine Seltenheit und eine Marke sind, steht im Regelwerk (4.4). Kommt ein Ding ins Gepäck, legt die Spielleitung in derselben Antwort fest, was es im Spielerbuch tragen wird, und notiert es für das Sitzungsende: `art` (bestimmt Gruppe und Standardzeichen), bei Bedarf `ikone` (ein Name aus der Sammlung, README „Gepäck“; sonst rät der Tisch aus Art und Namen), `seltenheit`, wenn nicht gewöhnlich, und `marke`, wenn eine passt. Mehr als diese Felder gibt es nicht; ein Zeichen wird nie eigens gezeichnet.
- Wahl des Zeichens: Was der Tisch rät, reicht fast immer (ein „Großvaters Dolch“ wird ein Dolch, ein „Gesiegelter Brief“ ein Brief). `ikone` braucht nur, was der Name nicht verrät („Schlüssel zum Lagerhaus“ ist klar, „das Ding aus dem Sumpf“ nicht) oder was anders aussieht, als die Art vermuten lässt (ein Dolch als Werkzeug: `ikone: 'dolch'`).
- Wahl der Seltenheit: nach dem, was die Figur weiß (4.8). Magisches nach dem DMG, sobald die Figur es bestimmt hat; Dinge von Wert oder Bedeutung nach der Geschichte, zurückhaltend: `ungewoehnlich` für das, was man nicht in jedem Krämerladen bekommt, `selten` für Einzelstücke, `sehr_selten` und `legendaer` nur für das, was im Revier Legende ist.
- Wahl der Marke: `siegel` für gesiegelte Schriftstücke, solange das Siegel unversehrt ist; `beschaedigt`, sobald `zustand` etwas sagt; `benannt` für Stücke mit Namen oder Geschichte; `unbekannt` für Fundstücke, deren Wirkung oder Herkunft die Figur nicht kennt. Passt mehr als eine, zählt die, die für die Figur am meisten bedeutet (ein beschädigtes Erbstück ist `benannt`, sein Zustand steht in `zustand`).
- Fehlt der Sammlung ein Zeichen für ein Ding, das öfter vorkommen wird, schlägt die Spielleitung dem Weltenhüter beim Sitzungsende ein neues vor (Name und was es zeigt); gezeichnet wird es im Repository (`seite/zeichen.js`, README), nie in der Sitzung.

### 4.7 Das Spielerbuch und die Ablage
- Was Spielerbuch und Ablage sind, steht im Regelwerk (Regelwerk 4.7, 21.1). Beide sind Artefakte aus Dateien (Spielerbuch 2.0, seit 4.2); eine Datenbank hat nur noch die Chronik (18). Wie ein Buch von vor 4.2 umzieht, steht in 22.2.
- **Spielerbuch:** die Seite `index.html` und vier Dateien, die sie lädt: `daten/meta.json` (Titel, Stand, Stufe, Figur und die Kopfdaten des Glossars), `daten/glossar.json` (4.6), `daten/tische.json` (`karte`, `gepaeck`, `logbuch`; 4.2, 4.4, 4.5) und `daten/geschichte.json` (der Wortlaut von „Was bisher geschah“, je Abschnitt ein Eintrag; 21.1). Abschnitte, deren Titel mit „Stand der Dinge“ beginnt, zeigt das Buch als Gruppe „Nachschlagen“ nach der Erzählung und klappt sie nie von selbst auf (21.7). Das Buch zeigt den Stand des letzten Sitzungsendes. Wem der Spieler es teilt, der kann alle vier Dateien lesen; darum steht darin nur, was die Prüfung freigegeben hat (4.8).
- **Ablage:** ein zweites Artefakt, privat und nie geteilt. Seine Seite ist ein Deckblatt, das nur Sitzung, Datum und Zahl der Dateien nennt. Daneben liegen `02_spielstand.md`, `03_spielleitung_SPOILER.md`, `wissensbuch.md`, `einstellungen.md`, `werkbank.md`, nach einem Zwischenhalt `uebergabe.md` (21.4), `buehnen/<id>.json` und `profile/<figur>.json` (12.6), das Archiv als `archiv/NNN-<name>.md` (je Abschnitt eine Datei, fortlaufend nummeriert) und `stand.json` (21.5). Der Spieler liest davon nichts.
- **Bauen:** `node seite/bauen.js --seite --titel "<Figur>s Buch" > index.html` und `node seite/bauen.js --ablage-seite --titel "<Figur>s Ablage" > index.html`, aus dem Repository im Stand `tische_stand` (die Tische sind eingebaut, ein Artefakt lädt keine Skripte von GitHub). Eine neue Fassung der Tische heißt: die Seite neu bauen und als `index.html` in dasselbe Artefakt veröffentlichen; die Daten bleiben liegen.
- **Dateien sind exakt, Abschriften nicht.** Was als Datei auf der Platte liegt und als Datei veröffentlicht wird, kommt Byte für Byte an (geprüft am 13.11.2026). Was die Spielleitung aus dem Verlauf abtippt, ist eine Abschrift mit Fehlern. Darum läuft nichts Längeres durch den Chat: holen, gezielt ändern (Edit, kleine Skripte), prüfen, veröffentlichen.
- **Werkzeuge.** Ihre Namen wechseln mit dem Chat. Maßgeblich ist die Werkzeugliste des Chats, und die Spielleitung sieht dort nach, bevor sie etwas zusagt (Regelwerk 21.3). Am 13.11.2026 hießen sie in der App `mcp__claude-artifacts__…`:

| Zweck | Werkzeug | Merke |
|---|---|---|
| Stand eines Artefakts | `get_artifact` | nimmt die Adresse und nennt `slug` (ihn verlangen die anderen Werkzeuge), `version` (sie wird `base_version`), `read` (mit wem es geteilt ist) und, in einem Chat ohne Netzzugriff, `network_off_limit`. Immer vor dem ersten Schreiben in ein Artefakt, das dieser Chat nicht angelegt hat |
| Dateiliste | `list_files` | je Datei `path`, `size` und `sha256` |
| Dateien auf die Platte holen | `read_file` mit `paths` | bis 32 Dateien und 4 MiB je Aufruf; ihr Text steht nicht im Verlauf. Die Dateien bekommen fremde Namen: erst einordnen, dann bearbeiten |
| eine Datei als Text lesen | `read_file` mit `path` | der Text steht im Verlauf: nur für Unverfängliches (`stand.json`, das Titelbildnis) |
| Dateien veröffentlichen | `publish_files` mit `slug`, `base_version`, `files` (je `as` und `path`) und `remove` | nur die genannten Dateien ändern sich (`mode` „patch“, der Standard), bis 256 je Aufruf. Ohne `slug` entsteht ein neues, privates Artefakt; es braucht `index.html` und `title`. Ist das Artefakt einzelnen Konten geteilt, verlangt der Aufruf `shared_live` mit dem Wert von `read` |
| Chronik lesen und schreiben | `db_get`, `db_query`, `db_write` | siehe 18 |

- In älteren Chats heißen dieselben Handgriffe `Artifact` (`list` mit `scope: "files"`, `read` mit `path`, Veröffentlichen mit `url` und `files`) und `ArtifactData` (`get`, `query`, `batch`); es gilt dasselbe unter diesen Namen (am 13.11.2026 nicht nachgeprüft). Kommt dort der Text einer Datei in den Verlauf statt auf die Platte, gilt für Spoilerdatei, Wissensbuch, Übergabe und Archiv Fall 2 unten.
- **Holen.** Ablage: `list_files`, dann `read_file` mit `paths` für `stand.json` und die Dateien, die gebraucht werden; `node seite/bauen.js --einordnen <ablage> <geholte Dateien …>` legt jede unter ihrem Pfad in den Ordner der Ablage und prüft sie dabei gegen ihre Prüfsumme in `stand.json`. Das Archiv holt sie nur zum Nachschlagen, nie zum Speichern. Buch: `read_file` mit `paths` für die Dateien unter `daten/`, dann `node seite/bauen.js --zurueck <geholt> <arbeit>`: Es erkennt die Dateien am Inhalt und schreibt 02_glossar.md, 02_karte.json, 02_inventar.json, 02_questlog.json und 02_geschichte.md zum Bearbeiten und Prüfen. In 02_geschichte.md trennt „###“ die Abschnitte; eine Überschrift im Text eines Abschnitts steht darum ab „####“, und `--zurueck` setzt sie dorthin und sagt es.
- **Veröffentlichen.** Buch: nach der Prüfung (4.8) `node seite/bauen.js --dateien <buch> --stand "Stand: Tag N" --stufe <n> 02_glossar.md 02_karte.json 02_inventar.json 02_questlog.json 02_geschichte.md`; auf stdout steht die Liste `files` für `publish_files`. Wissen der Spielleitung (eine Datei `03_…`, ein Archiv, ein Wissensbuch) lehnt es ab. Ablage: `node seite/bauen.js --ablage <ablage> --sitzung "Sitzung N" [--sitzungsende] [--entfernen <pfad>]` vergleicht den Ordner mit `stand.json`, schreibt sie neu und gibt `files` und `remove` aus: nur Neues und Geändertes. Was der Stand kennt und im Ordner fehlt, gilt als nicht geholt und bleibt, wie es ist; `--sitzungsende` entfernt die Übergabe. Je Artefakt genügt ein Aufruf `publish_files`.
- **Konflikt.** Ist `base_version` überholt, schreibt `publish_files` nichts und nennt die neue Version: Ein anderer Chat hat inzwischen veröffentlicht. Die Spielleitung holt neu, nimmt dessen Änderung auf und veröffentlicht dann; sie setzt nie blind die neue Version unter ihre alten Dateien.
- **Freigabe.** Fragt die App vor dem Veröffentlichen um Freigabe, sagt die Spielleitung vorher, was der Aufruf schreibt (Buch oder Ablage, wie viele Dateien); jeder Versuch fragt neu.
- **Was sie veröffentlicht, kennt sie.** Im gewöhnlichen Kreislauf weiß die Spielleitung, was in einer Datei steht: Die Datei kommt aus demselben Artefakt, ihre Prüfsumme stimmt (`--einordnen`, `list_files`), und geändert ist nur, was sie selbst gezielt geändert hat. Kommt eine Datei von anderswo (aus einem Umzugspaket, vom Spieler hochgeladen, aus einem anderen Projekt) oder stimmt ihre Prüfsumme nicht, wird sie ganz gelesen, bevor sie hinausgeht. Spoilerdatei, Wissensbuch, Übergabe, Bühnen und Archiv liest dann ein Hilfsagent, der sie auch veröffentlicht und nur Pfade, Zahlen und Auffälliges meldet, denn was er liest, steht nicht im Chat. Ohne Hilfsagenten ist das der eine Fall, in dem eine solche Datei als eingeklappter Arbeitsschritt im Verlauf stehen darf: Die Spielleitung sagt es dem Spieler vorher, und er klappt den Schritt nicht auf.
- **Geteilt und öffentlich.** Die Werkzeuge geben Dateien nur aus Artefakten heraus, die dem Spieler gehören und in die kein anderer geschrieben hat, und sie veröffentlichen nicht in ein Artefakt mit öffentlichem Link. Darum teilt der Spieler sein Buch nur einzelnen Konten und nur zum Lesen, und die Ablage nie (Regelwerk 4.7).
- **Wenn ein Chat es nicht kann:**
  1. **Kein Netzzugriff.** Ein solcher Chat ändert sicher nur Artefakte, die er selbst angelegt hat; bei den anderen entscheidet das Artefakt (`network_off_limit`). Am 13.11.2026 ließ sich aus einem Chat im Projekt der Figur in ihr Spielerbuch und ihren Bildersaal veröffentlichen, nicht aber in Eingang und Chronik (18, 24): Die ändert nur ein Chat, der von der Seite des Artefakts aus geöffnet ist, oder einer mit Netzzugriff. Zeigt `get_artifact` für Buch oder Ablage `network_off_limit`, probiert die Spielleitung das Veröffentlichen, bevor sie etwas festschreibt: `publish_files` mit der unveränderten `stand.json`. Eine Antwort mit `network_off` ist eine Absage, kein Hänger; Wiederholen hilft nicht.
  2. **Buch und Ablage lassen sich nicht schreiben** (kein Dateiweg zu den Artefakten, der Text einer Datei stünde im Verlauf, oder eine Absage wie oben): Die Spielleitung liest, was sie braucht, aus den Projektdateien (21.5) und sichert die Sitzung mit einem Zwischenhalt, dessen Übergabe als `claude/uebergabe.md` ins Projekt geht (21.4). Ein Sitzungsende gibt es in diesem Chat nicht; es läuft im nächsten, der schreiben kann. Bleibt das die Regel, bespricht der Spieler mit dem Weltenhüter, ob die Figur ohne Spielerbuch weiterspielt (22.1).
  3. **Weder Artefakt-Werkzeuge noch Code** (22.1): Es gibt kein Spielerbuch und keine Ablage. Dieselben Daten liegen als Dateien im Projekt (02_karte.md, 02_inventar.md, 02_questlog.md, 02_glossar.md, 02_geschichte.md), und die Tische erscheinen im Chat.

### 4.8 Spoilerschutz der Tische
- Der Grundsatz steht im Regelwerk (4.8), wie die Werkzeuge geholt werden in 4.2.
- Vor jeder Änderung läuft die Prüfung aus dem Repository, mit dem Spielstand und seinen Teilen (die Geschichte, das Glossar), in dieser Reihenfolge, denn das Glossar zählt danach als Beleg:
  1. Glossar: `node pruefen.js 02_glossar.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_karte.json 02_inventar.json 02_questlog.json figuren.json` (`figuren.json`: `["Name", …]`. Die Liste prüft nur Glossareinträge mit 🎭: Hat das Glossar keinen, genügt die eigene Figur, und die Chronik muss dafür nicht breit gelesen werden; sonst stehen darin die Figuren, deren Einträge 🎭 tragen, je einzeln in der Chronik nachgesehen, Regelwerk 18)
  2. Karte, Gepäck, Logbuch: `node pruefen.js 02_karte.json 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md` (ebenso `02_inventar.json`, `02_questlog.json`)
  3. Wissensbuch (5.1): `node pruefen.js wissensbuch.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md`; die Datei beginnt mit `*Stand: Tag n · Figur: Name*`, sonst bleiben ihre Tage ungeprüft. Steht das Wissensbuch noch als Abschnitt in der Spoilerdatei, ist `03_spielleitung_SPOILER.md` auch die erste Datei des Aufrufs
  4. Bühnen und Profile, wenn sie neu sind oder sich geändert haben (12.6): `node buehne.js --pruefe <bühne.json> --spielstand 02_spielstand.md --spoiler 03_spielleitung_SPOILER.md --weitere 02_geschichte.md,02_glossar.md` und `node buehne.js --profil <profil.json>`. Eine Bühne an einem Ort, den die Figur noch nicht kennt, ohne `--spielstand` und `--spoiler`: Ihre Wörter stehen naturgemäß nur in der Spoilerdatei; sie prüft `--karte`, wenn die Figur dort steht.
  Erst „FREIGEGEBEN“ darf ins Spielerbuch oder in den Chat. Geprüft wird immer das Ganze: Glossar und Geschichte liegen mit dem Dateiweg vollständig auf der Platte (4.7). Was die Prüfung prüft, steht in der README, dort auch ihre Eigenheiten, die schon Runden gekostet haben („Eigenheiten der Prüfung“); die wichtigsten Sperren: Namen, Wörter, Zahlen und Reisezeiten, die nicht im Spielstand stehen oder nur in der Spoilerdatei; **Belegprüfung** für Gepäck und Logbuch (jeder Satz braucht eine Zeile im Spielstand mit mindestens 70 % seiner Inhaltswörter, der Wortlaut eines Schriftstücks 90 %); **Wortpaare** bei Gepäck und Logbuch (zwei benachbarte Wörter, die so nur in der Spoilerdatei stehen); **Lore-Check** (Mondphasen und Daten gegen den Weltkalender 8.1, Stufengrenzen gegen 11.1, Stand, Frist, EP, Termine und Gefahr-Stufe gegen den Spielstand); beim Glossar Form, Quellen, Tage, 🎭 und Querverweise.
- `--ohne-kern` hinter einem Aufruf zeigt, was allein am Kern hängt: die Sätze eines Tischs, die ohne `02_spielstand.md` keinen Beleg mehr hätten, und die Zahl der Namen, Wörter und Zahlen, die nur dort stehen (Regelwerk 21.1, Schreiben vor Kürzen). Am Ergebnis ändert der Schalter nichts. Nach einem Kehraus (21.7) läuft die Prüfung zweimal, vor dem Kürzen und danach; freigegeben ist die Kürzung nur, wenn beide dasselbe melden.
- Was die Maschine nicht kann: einen Posten erkennen, der mit gewöhnlichen Wörtern umschreibt, was nur die Spoilerdatei weiß. Darum liest die Spielleitung jeden neuen Posten und Satz vor dem Eintragen gegen die Spoilerdatei, ebenso jeden neuen Abschnitt der Geschichte, den keine Maschine prüft.
- Ohne Node-Zugang ändert die Spielleitung die Daten nur mit Wörtern, die wörtlich im Spielstand stehen, bei der Karte im Abschnitt „Karte“, vermerkt „ungeprüft“ im Kopf der Datei und prüft in der nächsten Sitzung mit Zugang nach.

## 7 Regelgrundlage und Charakterbau

### 7.1 Auslegung
Regelwerk 7.1 macht das Sage Advice Compendium (2014) zur Auslegung der Bücher. An diesen Stellen entscheidet das Regelwerk anders oder legt sich fest:

| Frage | Sage Advice | An unseren Tischen |
|---|---|---|
| Natürliche 20 und 1 | zählen nur bei Angriffswürfen | bei jedem Wurf mit SG oder RK (6.5, Hausregel) |
| Überraschung mitten im Kampf | gibt es nur am Kampfbeginn | wer unbemerkt dazukommt, bekommt einen Zug vorab (12.1, Hausregel) |
| Magisches bestimmen | eine kurze Rast genügt | Gebrauch, Identify oder ein Kundiger (15.1) |
| Zauber in der kurzen Rast | unterbrechen die Rast | gelten als direkt vor oder nach der Stunde gewirkt; die Rastübersicht führt sie als „Zauber zur Rast“ (4.3), in der Überschrift erst mit der nächsten Fassung der Tische |
| Flucht, die ein Zauber erzwingt | löst Gelegenheitsangriffe aus | ebenso (12.6) |

Häufige Antworten: Wer als Bonusaktion zaubert, wirkt im selben Zug daneben nur einen Zaubertrick als Aktion. Ein Gelegenheitsangriff ist ein einzelner Angriff, kein Mehrfachangriff. Silvery Barbs hebt eine Legendary Resistance nicht auf.

Für die 30 Zauber in der Fassung von 2024 gelten die Antworten von 2014 nur, soweit der Text derselbe geblieben ist. Bei True Strike, Hail of Thorns, Blinding Smite, Barkskin, Cloud of Daggers und Poison Spray ist er es nicht.

### 7.3 Zauber umrechnen und freigeben
Welche Fassung eines Zaubers gilt und was wählbar ist, regelt Regelwerk 7.3. Hier stehen die Umrechnungstafel für Zauber, die für die Regeln von 2024 geschrieben sind, die Quellen zum Nachschlagen und der Stand der Modulzauber.

**Umrechnungstafel 2024 → 2014.** Einen Zauber in einer Fassung von 2024 liest die Spielleitung so: Was links steht, ersetzt sie durch die Regel rechts.

| Im Text von 2024 | An unseren Tischen | Anmerkung |
|---|---|---|
| Magic action, Utilize | Aktion: Zauber wirken, Gegenstand benutzen | nur andere Namen |
| Emanation | Radius um den Wirker, der mit ihm wandert | der Wirker ist nur betroffen, wenn der Zauber es sagt |
| Bloodied | bei der Hälfte der Trefferpunkte oder weniger | ausschreiben |
| D20 Test | Angriffswurf, Attributswurf oder Rettungswurf | ausschreiben |
| Heroic Inspiration | Heldenmut (6.6) | höchstens einer zugleich |
| Zustände wie Grappled, Incapacitated, Invisible, Stunned | Wortlaut des PHB 2014 | Stunned erlaubt 2014 keine Bewegung |
| Exhaustion | Erschöpfung nach 9.3 | eine Stufe bleibt eine Stufe |
| Überraschung | PHB 2014 (12.1) | wer überrascht ist, handelt im ersten Zug nicht |
| Hide, Search, Study, Influence | Aktionen und Proben des PHB 2014 | |
| Ringen und Stoßen per Rettungswurf | Wettstreit nach PHB 2014 (12.3) | ein Flucht-SG im Zauber bleibt |
| ein Zauber mit Zauberplatz je Zug | Regel des PHB 2014 zu Zaubern als Bonusaktion | |
| Weapon Mastery | entfällt (7.2) | |
| Species | Volk | |
| Tag „Chronomancy“ | Schule aus dem Zauber | das Tag bleibt als Stichwort |
| Burning | 1W4 Feuerschaden zu Beginn jedes Zuges, bis eine Aktion die Flammen löscht | wie Alchemistenfeuer (PHB 2014) |

**Abgleich bei Modulzaubern.** Maßstab ist die Tabelle „Spell Damage“ im DMG 2014 (S. 283 f.), für Schaden wie für Heilung. Liegt ein Zauber deutlich darüber, senkt eine Auflage seinen Wert, oder der Weltenhüter lehnt ihn ab. Heilzauber in einer Fassung von 2024 heilen gegenüber 2014 teils das Doppelte.

**Nachschlagen**
- **Zauberbibliothek von Oerik:** eine Seite des Weltenhüters; ihre Adresse steht in meta/welt (`zauberbibliothek`) und im Werkzeugkoffer (24). Je Zauber zeigt sie Name, Grad, Schule, Klassenlisten, Eckdaten, geltende Fassung, Kurzwirkung in eigenen Worten, Hinweis, Quelle und Stand, mit Suche und Filtern nach Klasse, Grad, Quelle und Stand. Steht eine Zauberwahl oder eine Zaubervorbereitung an (Regelwerk 7.4 und 4.3), nennt die Spielleitung dem Spieler die Adresse, beim ersten Mal ungefragt, danach auf Wunsch. Sie selbst holt die Seite als Datei `index.html` auf die Platte (4.7) und liest gezielt daraus: Die Zauber stehen als JSON-Liste im Element `<script id="daten">`, je Zauber mit Name `n`, Kurzwirkung `w`, Hinweis `h` und Stand `st`; fehlt `st`, ist der Zauber offen. Erreicht sie die Seite nicht, liest der Spieler ihr die Karte vor (Regelwerk 7.3).
- **Zauber von Wizards of the Coast:** Maßgeblich ist der Wortlaut des Buchs, wie D&D Beyond ihn führt; die Karte der Bibliothek ist eine Kurzfassung. Weichen die Zauberdaten von D&D Beyond vom Buch ab, gilt das Buch. Die Karte folgt der gedruckten Zeile, auch bei der Reichweite: „Selbst“ mit Fläche nur, wo das Buch die Fläche nennt. Die Klassenliste ist die des Buchs, ergänzt um Tashas zusätzliche Zauberlisten; nennt das Buch keine, folgt die Karte D&D Beyond und sagt es im Hinweis.
- **Deep Magic:** Band 1 und 2 (2023), als PDF beim Weltenhüter. Beide sind für die Regeln von 2014 geschrieben und brauchen die Tafel nicht. Die Ausgabe von Open5e (Sammlungen `deepm` und `deepmx`, Fassung von 2020) dient nur noch zum Nachlesen: 500 der 1.037 Zauber stehen auch dort, 79 gibt es nur dort.
- **Valda's Player Packs:** D&D Beyond, geteilt über die Kampagne des Weltenhüters. In die Bibliothek kommen Eckdaten, Kurzwirkung in eigenen Worten und Auflagen, nie der Wortlaut.
- **The Griffon's Saddlebag** bringt keine eigenen Zauber mit.

**Stand der Modulzauber.** Den Stand jedes Zaubers führt die Bibliothek: offen, frei, frei mit Auflage, gesperrt oder zurückgestellt. Wählbar ist, was frei oder frei mit Auflage ist (Regelwerk 7.3); die Auflage steht im Hinweis. Was der Weltenhüter entscheidet, trägt er dort ein; weicht die Bibliothek von diesem Abschnitt ab, gilt die Bibliothek. Der Wortlaut der Bücher kommt nicht hinein. Die Zahlen führt die Statuszeile der Bibliothek.
- **Wizards of the Coast:** alle frei, je in der Fassung nach Regelwerk 7.3, soweit keine Auflage aus dem Buch gilt (Regelwerk 7.3) und der Weltenhüter den Zauber nicht zurückgestellt hat (unten, „Gegengelesen“). Vier Namen gibt es auch in Deep Magic (Catapult, Frostbite, Power Word Pain, Thunderclap); es gilt der Zauber von Wizards of the Coast.
- **Deep Magic:** 1.037 Zauber, alle offen. 280 tragen einen Hinweis: „prüfen“ heißt, Stärke oder Text sind unklar; „Blick des Weltenhüters“ heißt, der Zauber greift in die Welt ein; die übrigen nennen Zusatzregeln, Stile der Magie oder fremde Monsterbücher. Würfel, Maße, Rettungswürfe, Schadensarten und Zustände der Karten sind per Skript gegen die Bände geprüft, die Klassenlisten in zwei Lesungen; bei Zaubern mit Reaktion steht der Auslöser im Zeitaufwand. Nicht geprüft ist, was eine Kurzwirkung weglässt: Fehlt etwas, meldet die Spielleitung die Lücke, und der Weltenhüter liest im Band nach (Regelwerk 7.3).
- **Valda's Player Packs:** 36 Zauber, umgerechnet nach der Tafel. Nach dem Beschluss des Weltenhüters vom 14. November 2026 sind 34 frei, 6 davon mit Auflage; einer ist gesperrt, einer zurückgestellt.
  - Gesperrt: Finger Guns. Er liegt über dem Maß für Zaubertricks, und die Geste ahmt eine Feuerwaffe nach, die Oerth nicht kennt (Regelwerk 20).
  - Zurückgestellt: Soul Effigy. Er liegt weit über dem, was 2014 auf Grad 4 kann, und taugt eher als Fluch der Welt (14.1).
  - Rumor, Auflage: Die Probe für „Gerüchte streuen“ gilt als gelungen, Dauer und Kosten bleiben (8.4); das Gerücht ist eine Spur (17.4).
  - Defenestration, Auflage: bei gelungenem Rettungswurf kein Stoß.
  - Cheat, Auflage: zählt beim „Spiel“ als Falschspiel (8.4), und die Geste muss verborgen bleiben (15).
  - Flawed Reconstruction, Auflage: Das Trefferpunktmaximum bleibt bis zur nächsten langen Rast gesenkt.
  - Flashback, Auflage: Die Vorbereitung muss in den letzten 24 Stunden möglich gewesen sein, nach Ort, Zeit, Geld und Gewicht (10.1, 9.5), und darf nichts Gespieltem und keinem Eintrag der Chronik widersprechen (17.1).
  - Rusting Grasp, Auflage: Der Abzug auf die RK trifft nur nichtmagische Rüstung und Schilde aus Metall, wie beim Rostmonster.
  - Frei mit dem Hinweis „Blick des Weltenhüters“: Moment to Think, Clue, Séance.
  - Chronomantie ist keine eigene Schule; das Stichwort bleibt am Zauber. Mandy's Feral Follower und Mandy's Marvelous Dress führt die Welt ohne den Namen. Die sieben Vertrauten aus Pack 2 sind als Wesen der Welt nutzbar (Regelwerk 7.1), als Vertraute sind sie aus (23).

**Gegengelesen.** Stand 14. November 2026 sind 576 der 590 Karten zu Zaubern von Wizards of the Coast gegen den Wortlaut gelesen. Offen sind 14 aus vier Büchern, die dem Weltenhüter fehlen: Acquisitions Incorporated 7, The Book of Many Things 3, Spelljammer 2, Planescape 2. Nicht gelesen sind die Werteblöcke der zehn Summon-Zauber; die Karten verweisen dort auf den Werteblock. Der Weltenhüter hat am 15. November 2026 die 14 Karten zurückgestellt, bis sie gegengelesen sind: Distort Value, Fast Friends, Gift of Gab, Incite Greed, Jim's Glowing Coin, Jim's Magic Missile und Motivational Speech (Acquisitions Incorporated), Antagonize, Spirit of Death und Spray of Cards (The Book of Many Things), Air Bubble und Create Spelljamming Helm (Spelljammer), Gate Seal und Warp Sense (Planescape). Mit ihnen hat er 13 Karten zurückgestellt, die seinen Blick oder eine Prüfung brauchen: Buzzing Bee, Conjure Tools, Deryan's Helpful Homunculi, Galder's Tower, Hindsight, Holy Star of Mystra, Inflict Doubt, Moment of Prescience, Spellfire Flare, Spellfire Storm, Vision of Elapsing Eons, Wail of the Banshee und Waves of Exhaustion. Die Bibliothek führt alle 27 als „zurückgestellt“ und nennt im Hinweis den Grund. Die Zauber aus Deep Magic hat er bis auf Weiteres ausgeklammert: Sie bleiben offen.

**Umstellen einer laufenden Figur** (Übergang, Regelwerk 7.3). In der ersten Sitzung unter 4.4 geht die Spielleitung die Zauber der Figur durch, bestimmt je Zauber die geltende Fassung und sagt dem Spieler in einem Satz je Zauber, was sich ändert. Beim Sitzungsende trägt sie die Fassungen in den Spielstand ein und die umgerechnete Form ins Zauberbuch der Werkbank (Regelwerk 21.1). Auf D&D Beyond stellt der Spieler die Fassungen selbst um.

## 12 Kämpfe

### 12.6 Bühnen und Profile
- Was sie sind, steht im Regelwerk (12.6), ihre Felder in der README („Bühnen und Profile“). Eine Bühne liegt als Datei `buehnen/<id>.json` in der Ablage, mit `art: "buehne"`, `ort` (die `id` aus `orte` der Chronik) und `gelaende` (das Kachelset, Regelwerk 12.6), höchstens 60 × 26 Felder; ein großer Ort bekommt mehrere. Das Profil liegt als `profile/<figur>.json` mit `art: "profil"`. Wie alles in der Ablage liest der Spieler sie nicht (4.7).
- **Holen,** erst wenn ein Kampf auf der Karte ansteht: Die Dateiliste der Ablage zeigt, welche Bühnen es gibt. Die Spielleitung holt das Profil und die Bühnen des Ortes als Dateien und ordnet sie in den Ordner der Ablage ein (4.7); im Zweifel holt sie alle unter `buehnen/` und wählt nach dem Feld `ort`. Für den Kampf arbeitet sie auf Kopien in einem eigenen Kampfordner, denn was im Ordner der Ablage geändert ist, geht beim nächsten Veröffentlichen hinaus. Nichts davon läuft durch den Chat. Die Werkzeuge holt sie nach Regelwerk 4.2.
- **Die erste Karte** eines Kampfes:
  1. `node buehne.js --zeige <bühne.json> --ausschnitt <name>` zeigt Felder, Höhe, verdeckte Gruppen und Merkmale. Gibt es keine Bühne, legt sie aus dem Grundriss oder frei eine Datei im selben Format an; dazu reichen `id`, `titel`, `gelaende` nach der Landschaft der Szene, `boden` und, wo es nicht flach ist, `hoehe`. Welches Zeichen im Set was zeichnet, steht in der README („Die Zeichen der Sets“); `--pruefe` sperrt, was das Set nicht zeichnet.
  2. Den Szenenzettel (Regelwerk 12.6) trägt sie unter `szene` in dieselbe Datei ein, je `text`, `feld` und `zeichen`, etwa `{"text": "Der Brunnen mitten im Hof", "feld": "13/F", "zeichen": "O"}`. Mehrere Zeichen heißen „eines davon“. Der Szenenzettel gilt für diesen Kampf; in die Ablage kommt davon nur, was bleibt.
  3. Sie rechnet nach, was die Figur gerade am Leib trägt und vorbereitet hat (Regelwerk 12.6, 9.5). Weicht das vom Profil ab, nimmt sie eine Arbeitskopie des Profils im Kampfordner und setzt darin `bewegung`, `waffen` und `zauber`. Die Kopie gilt für diesen Kampf und kommt nicht in die Ablage.
  4. `node buehne.js --karte <bühne.json> --kampf pf-s19-1 --nr <n> --ausschnitt <name> [--offen a,b] --profil <profil.json> --feld 19/H --tp <jetzt> --wesen <wesen.json> --runde 1 --stand "…" --spielstand 02_spielstand.md --spoiler 03_spielleitung_SPOILER.md`. `wesen.json` ist eine Liste derer, die dabei sind: Gefolge aus dem Profil nur mit `id`, `feld` und `tp`, alle anderen wie in der Karte. Nur „FREIGEGEBEN“ gibt `var KAMPF={…}` heraus, und es wird wörtlich die dritte Zeile des Tischs (4.2). Was sie braucht und das Werkzeug nicht kennt (`reihenfolge`, `ziel`, `uhren`, `lage`, `hinweis`, `aufstellung`), setzt sie von Hand dazu.
  5. Sperrt `--karte` ein Wort, das nur in der Spoilerdatei steht, prüft sie es selbst: Sieht die Figur es gerade oder kennt sie es aus Glossar oder Geschichte, nennt sie es mit `--gesehen "Altar,Priester"`. Sonst kommt es nicht auf die Karte: Das Merkmal bekommt für diesen Kampf andere Worte, der Titel mit `--titel "…"`.
- **Im Kampf:** Spätere Karten tippt sie (Regelwerk 12.6). Sieht die Figur eine verdeckte Gruppe, schreibt `node buehne.js --aufdecken <bühne.json> <gruppe> --ausschnitt <name> [--offen a,b]`, was die nächste Karte dazu braucht (`aendern`, `notizen`, `licht`, `zeichnung`). Einen neuen Ausschnitt schreibt `--karte … --weiter --ausschnitt <name> [--offen a,b]`.
- **Ohne Node** gilt die Wortregel (4.8): Sie tippt die erste Karte selbst, mit Wörtern, die im Spielstand stehen; Schreibfehler meldet die Karte dem Spieler.
- **Beim Sitzungsende:** Eine neue Karte an einem Ort, der wiederkommen kann, wird zur Bühne, und die Bühne wird berichtigt, wenn das Gespielte ihr widerspricht oder sich der Ort verändert hat (eine Tür ist aufgebrochen, ein Keller ist gesehen). Neu oder geändert: prüfen (4.8), dann als Datei in den Ordner der Ablage; sie geht mit der Ablage hinaus (21.3, Schritt 10). Ein Zwischenhalt schreibt sie gleich (21.4).
- **Abnahme:** Zeigen darf die Spielleitung dem Spieler von einer Bühne höchstens, was `--karte` herausgibt, und nur für Orte, die die Figur kennt; das gilt auch für den Weltenhüter, wenn er mitspielt. Bühnen unbekannter Orte prüft nur die Maschine.

### 12.7 Stilblatt der Kampfbeschreibung
Was gilt, steht im Regelwerk (12.7). Hier steht der Vorrat dazu: wie eine Trefferbeschreibung entsteht und welche Bilder zu Schadensart, Körper, Attribut und Gesinnung gehören. Die Bilder sind Vorrat, kein Wortlaut: Die Spielleitung nimmt eines, formt es für die Szene und bringt es in einem Kampf nicht zweimal. Beginnt ein Kampf, genügen Töne, Baukasten, Wundmaß und Zeichen; die Tafeln zu Schadensarten, Attributen und Gesinnungen holt sie einzeln, nach dem, was in diesem Kampf vorkommt.

**Töne nach Lage.**

| Lage | Ton | Kennzeichen |
|---|---|---|
| Grundton: Gegnerzüge, Getroffenwerden, alles ohne eigene Zeile | Dreck und Atem | hässlich, körperlich, erschöpfend; Zufall, Angst, müde Arme; trockene innere Stimme |
| Eigener Treffer, vom Fach | Handwerk | Fußarbeit, Finte, Winkel; zeigt, warum der Treffer sitzt |
| Eigener Treffer, nicht vom Fach | Dreck und Atem | der Treffer gelingt trotz der Technik, nicht ihretwegen |
| Kipppunkt | Sinnesrausch | Fragmente, ein Sinn nach dem anderen, gedehnte Zeit |
| Glanzmoment | Ballade | Märchenformeln, Dreizahl, feste Bilder |
| Rauferei | Lakonisch | Ergebnis zuerst, kurze Sätze, trockener Witz |

**Linse der Figur.** Beispiele für die Zeile im Spielstand:

| Figur | Achtet zuerst auf | Vergleicht mit |
|---|---|---|
| Marinesoldat | Stand, Wetter, Kommando | Deck und Dünung, Tauwerk, Drill |
| Jägerin | Wind, Fährte, Sehnen und Gelenke | Wild, Falle, Aufbrechen |
| Schmied | Gewicht, Naht, Fehler im Material | Amboss, Glut, Abschrecken |
| Gelehrter | Muster, Abweichung, Proportion | Lehrsatz, Rechnung, Randnotiz |
| Akolythin | Zeichen, Schuld, wer Schutz braucht | Liturgie, Fasten, Glocke |
| Dieb | Ausgänge, Hände, Lücken | Schloss, Gedränge, Würfelspiel |

**Baukasten.** Eine Trefferbeschreibung beantwortet fünf Fragen in fester Reihenfolge:
1. **Ton:** nach Lage, siehe oben.
2. **Güte des Wurfs:** knapp oder sauber getroffen, knapp oder weit verfehlt. Für Fehlwürfe gilt die Rüstungsleiter (Regelwerk 12.1).
3. **Wundmaß:** wie viel der Treffer dem Ziel nimmt.
4. **Schadensart am Körper:** das Bild aus den Tafeln unten, mit den drei Zeichen.
5. **Farbe:** höchstens ein Attribut und höchstens eine Gesinnung je Zug.

**Wundmaß.**

| Stufe | Wann | In der Erzählung |
|---|---|---|
| Streifer | unter einem Zehntel der vollen Trefferpunkte | ein Halbsatz: Atem, Haut, Haltung; keine Wunde |
| Treffer | ein Zehntel bis ein Viertel | eine konkrete Wunde, ein bis zwei Sätze |
| Schwerer Treffer | über ein Viertel, kritischer Treffer oder der Fall unter die Hälfte | die Wunde und ihre sichtbare Folge, die bis zum Ende des Kampfes im Bild bleibt |
| Fällt | 0 Trefferpunkte | der entscheidende Treffer; ob tot, sterbend oder bewusstlos, sagt die Regel (Regelwerk 12.1, 13) |

Unter der Hälfte ihrer Trefferpunkte tragen alle sichtbare Spuren (PHB): Blut, Schonhaltung, pfeifender Atem. So liest der Spieler den Stand eines Gegners ohne Zahl.

**Die drei Zeichen.**

| Zeichen | Regel | In der Erzählung |
|---|---|---|
| Prallt ab | immun | Der Treffer sitzt, und nichts geschieht. Das wird klar gesagt und wundert die Figur. |
| Beißt schlecht | resistent | Die Wirkung bleibt hinter dem Schlag zurück: stumpf, gedämpft, schnell erstickt. |
| Frisst sich hinein | anfällig | Die Wirkung ist größer als der Schlag: Sie reißt weiter, breitet sich aus, das Wesen klingt anders. |

Welches Zeichen gilt, sagt der Werteblock, nicht dieses Blatt. Die Tafeln unten zeigen gewöhnlichen Schaden und nennen nur, was für eine Körperart üblich ist.

**Körperarten.** Jede Schadensart hat ein Kernbild; der Körper bestimmt, wie es aussieht, klingt und riecht.

| Körper | Wer | Woran man Schaden sieht |
|---|---|---|
| Fleisch und Blut | Humanoide, Tiere, Riesen | Blut, Schmerz, Schonhaltung |
| Schuppe, Panzer, Chitin | Echsen, Krokodile, Schildkröten, Insekten, Drachen | Platten springen, darunter ist es weich |
| Pflanze und Pilz | Pflanzenwesen, Baumhirten, Pilzvolk | Saft, Fasern, Sporen; kein Schrei |
| Untote mit Leib | Zombies, Ghule, Skelette | kein Blut, kein Schmerz; Stücke fehlen |
| Körperlose | Geister, Schatten | der Umriss franst aus, wird dünn, flackert |
| Schleim | Gallerten, Schlicke | Masse fehlt, zieht sich zusammen, zischt |
| Konstrukte | Stein und Ton, Metall, Holz, Seil und Tuch | Risse, Dellen, Splitter; nur das Material macht Laut |
| Elementare | Feuer, Wasser, Luft, Erde | der Leib verliert Form, Größe oder Zusammenhalt |

Jenseitige (Scheusale, Himmlische, Feen, Aberrationen) folgen dem Körper, den sie zeigen. Fremd ist nur, was aus der Wunde kommt: schwarzes Ichor, Licht, Harz, etwas, das sich bewegt.

**Hieb.** Eine Schneide trennt, was zusammengehört. Es klafft, und es läuft sofort.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Die Wunde klafft und läuft sofort; Sehnen geben nach, ein Griff wird unsicher. |
| Schuppe, Panzer, Chitin | Die Klinge schabt über Platten, findet eine Naht und hebt eine Schuppe ab wie einen Fingernagel. |
| Pflanze und Pilz | Ein Schnitt wie durch nasses Tau; Saft statt Blut, der abgetrennte Trieb zuckt noch. |
| Untote mit Leib | Totes Fleisch teilt sich ohne Blut, grau und faserig; Gebein kerbt ein und splittert. |
| Körperlose | Die Klinge geht durch Kälte; der Umriss reißt wie Rauch und schließt sich langsamer als zuvor. |
| Schleim | Der Schnitt schließt sich hinter der Klinge; manche Schlicke teilen sich daran in zwei. |
| Konstrukte | Stein: Funken und eine helle Scharte. Metall: ein Kreischen, ein blanker Strich. Holz: Späne bis ins Kernholz. |
| Elementare | Feuer und Luft schließen sich um die Klinge, Wasser spritzt, Erde bröckelt; getroffen ist der Zusammenhalt. |

**Stich.** Eine Spitze geht tief und zeigt wenig. Kleine Wunde, große Wirkung; der Schmerz kommt spät.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Ein kleines Loch, das innen mehr anrichtet als außen; der Atem wird kurz, das Blut kommt dunkel und spät. |
| Schuppe, Panzer, Chitin | Die Spitze findet den Spalt zwischen zwei Platten, sitzt fest und muss herausgedreht werden. |
| Pflanze und Pilz | Ein Loch im Stamm, aus dem es harzt; Fasern reißen der Länge nach. |
| Untote mit Leib | Die Spitze fährt hinein wie in einen nassen Sack; kein Zucken, kein Laut, innen reißt etwas. Gebein verliert eine Rippe. |
| Körperlose | Ein Loch im Umriss, durch das man kurz die Wand dahinter sieht. |
| Schleim | Die Spitze versinkt; die Masse zieht sich um die Stelle zusammen. |
| Konstrukte | Stein: ein abgeplatzter Splitter. Metall: ein Loch mit aufgebogenem Rand. Holz: der Bolzen steckt und zittert. |
| Elementare | Ein Zischen im Feuer, ein Wirbel im Wasser, eine Lücke im Sturm, ein Loch im Lehm, das nicht gleich zuläuft. |

**Wucht.** Masse bricht, was unter der Haut liegt. Erst ein dumpfer Schlag, dann ein Knacken.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Kein Blut zuerst, nur ein Schlag, der die Luft nimmt; dann schwillt es, etwas knackt, ein Arm will nicht mehr. |
| Schuppe, Panzer, Chitin | Der Panzer hält die Schneide ab, nicht den Stoß: Platten springen, Chitin reißt wie Eierschale. |
| Pflanze und Pilz | Fasern quetschen, Rinde platzt; ein Ast bricht mit dem Laut von grünem Holz. |
| Untote mit Leib | Totes Fleisch gibt nach wie nasser Lehm; Gebein zerspringt, Rippen fliegen wie Kleinholz. |
| Körperlose | Der Schlag fährt durch Kälte; der Umriss zittert wie ein Bild im Wasser. |
| Schleim | Die Masse klatscht auseinander und läuft wieder zusammen, kleiner als vorher. |
| Konstrukte | Stein: Risse laufen vom Einschlag, ein Stück bricht aus. Metall: eine Delle, eine Niete springt. Holz: splittert quer zur Faser. |
| Elementare | Erde zerbröselt, Wasser spritzt auseinander, Feuer stiebt in Funken, Luft reißt kurz ab. |

**Feuer.** Feuer frisst von außen nach innen und nimmt zuerst, was leicht brennt. Es riecht nach verbranntem Haar.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Haar und Stoff zuerst; die Haut rötet sich und wirft Blasen, bei schweren Treffern wird sie wächsern und fühllos. |
| Schuppe, Panzer, Chitin | Schuppen rollen sich an den Rändern auf und schwärzen; Chitin knackt wie Kastanien in der Glut. |
| Pflanze und Pilz | Saft kocht und zischt, Rinde platzt, Trockenes fängt wie Zunder; es riecht nach Herbstfeuer. |
| Untote mit Leib | Totes Fleisch brennt fettig und stinkend, ohne Schrei; Gebein schwärzt und wird mürbe. |
| Körperlose | Die Flamme geht hindurch und färbt den Umriss einen Atemzug lang; er wird dünner wie Nebel in der Sonne. |
| Schleim | Die Oberfläche kocht, wirft Blasen und verkrustet; darunter zieht sich die Masse zurück. |
| Konstrukte | Stein: schwärzt und platzt erst bei großer Hitze. Metall: glüht dunkelrot, Riemen verkohlen. Holz, Seil, Tuch: flammt auf und verkohlt. |
| Elementare | Feuer: nichts, Flamme in Flamme. Wasser verdampft zischend und schrumpft, Luft flimmert, Erde backt hart und rissig. |

**Kälte.** Kälte nimmt Gefühl und Beweglichkeit, bevor sie verletzt. Die Wunde ist weiß und blutet nicht.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Die Haut wird weiß und hart, Finger gehorchen spät, der Atem steht als Wolke; später brennt es wie Feuer. |
| Schuppe, Panzer, Chitin | Kaltblüter werden stumpf im Blick; Reif kriecht in die Fugen zwischen den Platten, Gelenke knirschen. |
| Pflanze und Pilz | Saft gefriert und sprengt die Fasern von innen; Blätter werden glasig und brechen bei Berührung. |
| Untote mit Leib | Nasses totes Fleisch friert steif und reißt bei der nächsten Bewegung; Gebein wird spröde wie altes Glas. |
| Körperlose | Kälte in Kälte: oft nichts zu sehen, höchstens glitzert der Umriss kurz wie Atem im Frost. |
| Schleim | Die Oberfläche wird zäh und milchig; eine Eishaut bricht in Schollen. |
| Konstrukte | Stein: Reif und feine Risse, wo Wasser in den Fugen stand. Metall: beschlägt, wird spröde, klingt heller. Holz: knackt wie Balken im Winter. |
| Elementare | Wasser erstarrt an den Rändern zu Eis, Feuer schrumpft und rußt, Luft wird schwer, Erde hart wie gefrorener Acker. |

**Blitz.** Blitz ist schneller als der Schmerz. Er sucht den kürzesten Weg durch den Körper, und die Muskeln tun, was er will. Es riecht nach Gewitter.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Alle Muskeln krampfen zugleich, die Zähne schlagen aufeinander; wo er ein- und austritt, bleibt ein schwarzes Mal, manchmal ein Farnmuster auf der Haut. |
| Schuppe, Panzer, Chitin | Der Panzer schützt nicht: Der Schlag läuft durch das nasse Fleisch darunter, das Tier zuckt wie am Haken, zwischen den Platten raucht es. |
| Pflanze und Pilz | Der Saft verdampft im Stamm; Rinde platzt in einem langen Streifen ab wie am getroffenen Baum. |
| Untote mit Leib | Tote Muskeln zucken noch einmal, als lebten sie; Gebein rasselt, Zähne klappern. |
| Körperlose | Der Umriss leuchtet von innen auf wie Wetterleuchten in einer Wolke. |
| Schleim | Ein Zittern läuft durch die ganze Masse; manche Schlicke reißt es in zwei, und beide kriechen weiter. |
| Konstrukte | Stein: ein schwarzer Zackenstrich, ein abgesprengter Splitter. Metall: der Schlag läuft über die ganze Hülle, Fugen sprühen. Holz: spaltet der Länge nach. |
| Elementare | Wasser kocht entlang der Bahn, Luft nimmt ihn auf wie ihresgleichen, Feuer flackert weiß, Sand schmilzt zu Glasfäden. |

**Säure.** Säure löst auf, was sie berührt: Kanten werden weich, Farben laufen, es zischt und raucht. Der Geruch sticht in der Nase.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Die Haut wird erst rot, dann grau und weich; Stoff löst sich in Fetzen, Leder kräuselt sich, der Schmerz kommt in Wellen. |
| Schuppe, Panzer, Chitin | Schuppen werden stumpf und weich wie eingeweichtes Horn; Chitin bekommt Löcher mit hellen Rändern. |
| Pflanze und Pilz | Blätter fallen zu braunem Brei zusammen, Rinde löst sich in Streifen. |
| Untote mit Leib | Totes Fleisch läuft von den Knochen wie Wachs; Gebein wird porös. |
| Körperlose | Die Säure fällt hindurch und zischt auf dem Boden; der Umriss trübt sich wie Wasser, in das Tinte fällt. |
| Schleim | Säure in Säure: oft nichts, höchstens ein Brodeln an der Stelle. |
| Konstrukte | Stein: schäumt und wird narbig. Metall: läuft an, Nieten lösen sich. Holz, Seil, Tuch: wird morsch und faserig. |
| Elementare | Wasser trübt sich und verdünnt sie, Erde schäumt und sackt zusammen, Feuer faucht kurz farbig auf, Luft trägt den Dunst weiter. |

**Schall.** Schall ist ein Schlag ohne Waffe: Druck, der durch alles Feste läuft und innen zuerst trifft. Danach ist es sehr still.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Die Brust wird eingedrückt wie von einer Faust, es pfeift in den Ohren, aus der Nase kommt ein dünner Blutfaden. |
| Schuppe, Panzer, Chitin | Ein Panzer ist eine Trommel: Das Wesen wird in seiner eigenen Schale geschüttelt, Chitin bekommt Haarrisse. |
| Pflanze und Pilz | Blätter und Sporen stieben weg, Äste brechen an den dünnen Stellen; der Stamm summt nach. |
| Untote mit Leib | Lockeres fällt ab: Zähne, Finger, Rippen; totes Fleisch reißt an alten Nähten. |
| Körperlose | Der Umriss wird zerdrückt und zieht Schlieren wie Rauch im Luftzug. |
| Schleim | Ringe laufen über die Masse wie über einen Teich; an den Rändern spritzt sie ab. |
| Konstrukte | Stein und Ton: springen entlang alter Risse, Schalen platzen ab. Metall: dröhnt wie eine Glocke, Nähte gehen auf. Holz: Zapfen und Leimfugen lösen sich. |
| Elementare | Erde zerfällt in Brocken, Wasser zerstäubt, Luft wird zerrissen und sammelt sich neu, Feuer wird flach gedrückt. |

**Gift.** Gift ist kein Schlag, sondern ein Verlauf: Es kommt verzögert und von innen. Zu sehen ist nicht die Wunde, sondern das Gesicht.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Erst Taubheit an der Stelle, dann Schweiß, Speichel, weite Pupillen; die Knie werden weich, der Mund schmeckt nach Metall. |
| Schuppe, Panzer, Chitin | Kaltblüter zeigen es spät: Die Zunge hängt, die Flanken pumpen; Insekten krümmen sich und ziehen die Beine an. |
| Pflanze und Pilz | Blätter welken in Augenblicken, Triebe hängen, Fruchtkörper fallen ein und werden schwarz. |
| Untote mit Leib | Prallt in aller Regel ab: Nichts kreist mehr, was das Gift tragen könnte. |
| Körperlose | Prallt in aller Regel ab: kein Leib, kein Gift. |
| Schleim | Trübe Schlieren ziehen von der Stelle nach innen; die Masse wird flockig und träge. |
| Konstrukte | Prallt in aller Regel ab: kein Blut, kein Atem. Das Gift läuft an Stein und Metall herunter. |
| Elementare | Prallt in aller Regel ab: Gift braucht einen Leib, der lebt. |

**Nekrotisch.** Nekrotische Kraft nimmt Leben, ohne zu verwunden: Was sie berührt, altert, welkt und wird grau. Es riecht nach kalter Asche.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Die Stelle wird grau und kalt wie die Hand eines Toten, Adern zeichnen sich dunkel ab; es tut nicht weh, es fehlt nur etwas. |
| Schuppe, Panzer, Chitin | Schuppen verlieren Glanz und Farbe und lösen sich wie in einer schlechten Häutung; Chitin wird papieren. |
| Pflanze und Pilz | Es welkt vom Punkt der Berührung aus: Grün wird braun, Holz wird Mulm, ein Winter in einem Atemzug. |
| Untote mit Leib | Was sie aufrecht hält, wird dünner: Glieder hängen in falschen Winkeln, ein Kiefer fällt herab. Alte Tote nehmen es hin wie Regen. |
| Körperlose | Prallt meist ab: Tod lässt sich nicht töten. |
| Schleim | Die Masse wird an der Stelle stumpf und flockig und stößt sie ab wie tote Haut. |
| Konstrukte | Das Material altert: Stein verwittert, Metall rostet in Augenblicken, Holz wird morsch. |
| Elementare | Feuer brennt grau und kalt, Wasser wird schal, Luft steht verbraucht, Erde wird zu totem Staub. |

**Gleißend.** Gleißendes ist Licht mit Gewicht: Es brennt ohne Flamme und ohne Rauch und lässt saubere Ränder.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Ein Brand wie von einem Sommer Sonne in einem Augenblick: Die Haut ist rot und heiß, die Augen tränen; schwere Treffer lassen scharf umrissene weiße Stellen. |
| Schuppe, Panzer, Chitin | Der Panzer hilft nicht, das Licht geht durch die Fugen; Schuppen bleichen aus, Augen ohne Lider finden keinen Schutz. |
| Pflanze und Pilz | Blätter verdorren wie unter einem Brennglas; Pilze, die das Dunkel lieben, schrumpfen und reißen. |
| Untote mit Leib | Totes Fleisch dampft und zerfällt an den Rändern zu Asche; Gebein wird kreideweiß und mürbe. |
| Körperlose | Der Umriss brennt weg wie Nebel in der Morgensonne; wo das Licht war, fehlt ein Stück. |
| Schleim | Die Masse wird an der Stelle trüb und fest wie gekochtes Eiweiß. |
| Konstrukte | Stein bleicht und wird heiß, Metall glüht ohne Feuer, Holz vergilbt wie nach Jahren in der Sonne. |
| Elementare | Wasser dampft, ohne zu kochen, Feuer verblasst im stärkeren Licht, Luft flimmert, Erde wird spröde. |

**Psychisch.** Psychischer Schaden hat keinen Ort am Körper. Trifft er die Figur, wird er von innen erzählt; trifft er andere, liest man ihn am Gesicht.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Der Blick bricht weg, eine Hand geht an die Schläfe, ein Laut kommt, der kein Wort ist; Nasenbluten, Würgen. Bei der Figur: ein Gedanke, der nicht ihrer ist, zu laut. |
| Schuppe, Panzer, Chitin | Tiere wehren sich gegen nichts: Sie schnappen in die Luft, drehen sich um sich selbst, drücken den Kopf an den Boden. |
| Pflanze und Pilz | Ein Zittern geht durch alle Blätter gegen den Wind; Pilzvolk stößt eine wirre Sporenwolke aus. |
| Untote mit Leib | Geistlose Tote stocken nur, als hätte jemand an einer Schnur gezogen. Die mit Willen heulen. |
| Körperlose | Es trifft das Einzige, was noch da ist: Der Umriss verzerrt sich und zeigt kurz das Gesicht, das er im Leben hatte. |
| Schleim | Ein zielloses Zucken in alle Richtungen zugleich. |
| Konstrukte | Prallt oft ab: nichts da, was sich fürchten könnte. Wo ein Geist gebunden ist, stockt die Bewegung mitten im Schlag. |
| Elementare | Die Form verliert ihre Absicht: Flammen schlagen ohne Richtung, Wasser steht einen Herzschlag still, der Wind dreht gegen sich selbst. |

**Energie.** Energie ist Kraft ohne Stoff: ein Hammer, den niemand sieht. Sie hat keine Hitze und keinen Geruch, und fast nichts hält sie auf.

| Körper | Bild |
|---|---|
| Fleisch und Blut | Ein Schlag wie von einer Faust aus Luft: Male in Formen, die keine Waffe macht; bei schweren Treffern bricht etwas, ohne dass die Haut reißt. |
| Schuppe, Panzer, Chitin | Der Panzer verteilt nichts: Die Kraft sitzt genau dort, wo sie gemeint war, und drückt die Platte ins Fleisch. |
| Pflanze und Pilz | Ein Stück fehlt wie herausgestanzt; die Fasern stehen sauber ab. |
| Untote mit Leib | Glieder werden weggedrückt wie von unsichtbaren Händen; Gebein bricht an der Stelle glatt durch. |
| Körperlose | Sie fasst den Umriss an wie Festes: Er wird gestoßen, eingedellt, verliert Stücke. |
| Schleim | Ein Abdruck bleibt einen Atemzug lang stehen wie ein Stempel in Wachs. |
| Konstrukte | Stein: ein glattes Loch wie gebohrt. Metall: eine Delle ohne Kratzer. Holz: bricht ohne Splitter. |
| Elementare | Die Form wird auseinandergedrückt und braucht einen Augenblick, um zurückzufinden. |

**Attribute.** Gefärbt wird mit dem Attribut, das der Wurf benutzt: beim Angriff das Angriffsattribut, beim Zauber das Zauberattribut, beim Rettungswurf seines, beim Getroffenwerden Konstitution. Zwischen zwei Kämpfern zählt der Abstand: Hoch gegen höher liest sich wie niedrig.

| Modifikator | Wirkung in der Beschreibung |
|---|---|
| −1 und tiefer | zeigt sich als Mangel |
| 0 und +1 | bleibt ohne Farbe |
| +2 und +3 | zeigt sich als Können |
| +4 und höher | Können, das Gegnern und Umstehenden auffällt |

| Attribut | Hoch im Kampf | Niedrig im Kampf | Zaubern und Rettungswürfe |
|---|---|---|---|
| Stärke: Gewicht und Hebel | Hiebe gehen durch Paraden statt um sie herum; die fremde Klinge wird beiseitegedrückt, der Schild sinkt. | Am Ende jedes Hiebs ist die Waffe zu schwer; Treffer kommen an, aber ohne Gewicht, und jede Bindung gewinnt der andere. | Stärke zaubert nicht, sie hält stand: Gegen Griff, Ranken, Sturm und Stoß stemmt sich der Starke, der Schwache wird mitgenommen. |
| Geschick: Zeit, früher da sein und kürzer bleiben | Der Treffer kommt aus der kleinsten Bewegung und landet in der Lücke: Achsel, Kniekehle, Naht. In der Abwehr ist die Figur schon fort, wo der Schlag ankommt. | Einen halben Schritt zu spät, die eigenen Füße im Weg; Treffer landen, wo es gerade ging, nicht wo sie sollten. | Gesten sind klein und sauber. Gegen Flamme, Splitter und Falle duckt sich der Geschickte unter der Wirkung weg, der Ungeschickte steht mitten darin. |
| Konstitution: was übrig bleibt, wenn der Kampf länger dauert als geplant | Treffer werden genommen wie Wetter: ein Grunzen, ein Schritt, weiter. Der Atem bleibt ruhig, wenn der des Gegners schon pfeift. | Jeder Treffer kostet mehr als die Wunde: Seitenstechen, weiße Lippen, Hände, die nach dem Kampf zittern. | Konzentration unter Schmerz: Der Zähe hält den Zauber durch den Treffer wie ein Tau unter Last, dem Schwachen reißt der Faden beim ersten Blut. Gegen Gift, Kälte und Krankheit wehrt sich der Körper oder gibt nach. |
| Intelligenz: der Plan hinter dem Schlag | Die Figur liest die Schule des Gegners, zählt seine Schritte und weiß vor ihm, wohin er nach der Finte muss. | Dieselbe Finte wirkt zweimal; das Gelände ist erst da, wenn man darüber stolpert. | Magie als Rechnung (Magier, Magieschmiede, Mystische Ritter, Arkane Betrüger): genaue Worte, saubere Winkel, eine Wirkung mit scharfem Rand. Bei niedrigem Wert fransen die Ränder. Im Rettungswurf erkennt der Kluge das Trugbild an seinem Fehler. |
| Weisheit: was man merkt, bevor man es weiß | Ruhe im Lärm: Die Figur sieht den zweiten Gegner, bevor er zählt, spürt den Hieb im Rücken und lässt sich nicht reizen. | Tunnelblick: nur der eine Gegner, nur die eine Klinge. Spott trifft, und Finten mit dem Blick auch. | Magie als Antwort (Kleriker, Druiden, Waldläufer): Die Figur bittet, lauscht, lässt geschehen; die Wirkung wächst und kommt wie Wetter. Bei niedrigem Wert muss zweimal gefragt werden. Im Rettungswurf bleibt der Weise bei sich, wenn ein fremder Wille anklopft. |
| Charisma: Wille, den andere spüren | Der Gegner zögert vor dem Blick, nicht vor der Klinge; Finten gelingen, weil man sie glaubt. | Niemand weicht, Drohungen verpuffen. Das kann nützen: Wer übersehen wird, steht plötzlich nah. | Magie als Behauptung (Barden, Hexenmeister, Zauberer, Paladine): Die Figur sagt, was ist, und die Welt gibt nach; die Wirkung trägt ihre Stimme und ihren Auftritt. Bei niedrigem Wert wirkt der Zauber wie geliehen. Im Rettungswurf hält das Selbst gegen Verbannung und Besessenheit. |

Die drei Quellen der Magie in einem Satz: Intelligenz rechnet, Weisheit bittet, Charisma behauptet.

**Gesinnungen.** Die Gesinnung ändert nie, was ein Schlag tut, sondern wie und wie weit jemand kämpft. Sie färbt Gegner und Gefolge; bei der Spielerfigur liefert sie nur den Grundzug, denn was sie tut, entscheidet der Spieler.

| Pol | Färbt | Im Kampf |
|---|---|---|
| Rechtschaffen | die Form | Drill, Reihe, Ansage; wiederholt, was wirkt; hält Abmachungen auch im Kampf: Ergebung, Zweikampf, Waffenruhe |
| Chaotisch | die Form | Einfall, Rhythmuswechsel, das Gelände als Waffe; kein Zug wie der letzte; Abmachungen gelten, solange sie passen |
| Gut | das Maß | so hart wie nötig; hört auf, wenn der andere fällt oder aufgibt; stellt sich vor Wehrlose und trägt es danach (Regelwerk 13) |
| Böse | das Maß | nimmt mehr als nötig: schlägt Liegende, nimmt Geiseln, lässt leiden oder rechnet kalt |
| Neutral | den Zweck | tut, was die Lage verlangt, und nicht mehr |

| Gesinnung | Im Kampf | Beim Zaubern |
|---|---|---|
| Rechtschaffen gut | Kündigt an, bietet Ergebung, deckt die Schwachen zuerst; kämpft nach Regeln, die auch für ihn gelten. | Gemessen, wie ein Eid gesprochen; klare Formen, nichts streift Unbeteiligte. |
| Neutral gut | Beendet, was Leid macht, auf dem kürzesten Weg; keine Pose, kein Nachtreten. | Still und warm; Heilung vor Schaden, wenn beides geht. |
| Chaotisch gut | Bricht jede Regel für einen Menschen; Überraschung, Witz, der Griff nach dem Kronleuchter. | Sprunghaft; die Wirkung kommt von der Seite, aber nie auf Wehrlose. |
| Rechtschaffen neutral | Befehl und Verfahren; weder Gnade noch Grausamkeit. Hört auf, wenn der Auftrag erfüllt ist. | Nach Formel, ohne Schnörkel, jedes Mal gleich. |
| Neutral | Kämpft wie ein Handwerker: um Lohn, Revier, die eigene Haut; flieht ohne Scham, wenn es sich nicht mehr lohnt. | Sparsam; kein Zauber mehr als nötig. |
| Chaotisch neutral | Laune und Risiko; der schöne Hieb zählt mehr als der kluge. | Wild, zu groß oder zu klein; Nebenwirkungen nur im Bild, nie in der Regel. |
| Rechtschaffen böse | Grausamkeit mit Methode: zielt auf den, dessen Fall die anderen bricht; hält Verträge dem Buchstaben nach. | Genau und kalt; bevorzugt, was festhält, zwingt und zeichnet. |
| Neutral böse | Jedes Mittel, das sich lohnt: Rücken, Gift, Geisel; kein Hass, nur Vorteil. | Zweckmäßig und hässlich; nimmt, was gerade wirkt. |
| Chaotisch böse | Lust an der Zerstörung ohne Plan: bleibt am Liegenden, vergisst die anderen. | Roh, verschwenderisch, laut; die Wirkung will gesehen werden. |

- Tiere und Geistlose sind gesinnungslos: Sie kämpfen nach Hunger, Revier, Brut und Befehl (Regelwerk 13).
- Gesinnung färbt, sie erklärt nicht. Wer herrscht, hält sich für gerecht (Regelwerk 20.2): Ein rechtschaffen böser Aufseher nennt sich ordentlich.
- Würfe ändert die Gesinnung nur, wo ein Zauber oder Ding es sagt. Spirit Guardians etwa erscheinen bei guten und neutralen Wirkern himmlisch oder feenhaft und tun gleißenden Schaden, bei bösen scheusalhaft und nekrotischen.

**Beispiele.** Vier erfundene Züge zeigen den Baukasten.
- Eigener Treffer, vom Fach (Handwerk, sauber getroffen, schwerer Treffer, Hieb an Schuppe, Linse Marinesoldat): „Das Krokodil wirft sich herum, und du gehst mit, einen halben Schritt aus der Linie, wie an einer Reling, die für zwei zu schmal ist. Die Klinge schabt über den Rückenpanzer, findet die Naht hinter dem Vorderbein und hebt dort eine Platte ab wie einen Fingernagel. Darunter ist es weich. Das Tier schlägt mit dem Schwanz, und seine Flanke färbt das Wasser dunkel.“
- Gegnerzug (Grundton, knapp getroffen, Treffer, Hieb an Fleisch, Stärke hoch, rechtschaffen neutral): „Der Mann kämpft, wie man Holz hackt: derselbe Hieb, dieselbe Höhe, ohne Hass. Beim dritten drückt er deine Klinge einfach beiseite, und die Schneide geht dir über den Unterarm, tief genug, dass die Finger kurz nicht wissen, was sie halten (6 Schaden).“
- Zauber der Figur (gleißend an totem Fleisch, schwerer Treffer): „Der Stern bricht dir aus der Hand wie Sonne durch eine Wolke. Wo er den Toten trifft, dampft das graue Fleisch und fällt an den Rändern zu Asche. Kein Laut. Er geht weiter, mit einem Loch in der Schulter, durch das du den Bach siehst.“
- Prallt ab (Gift an Gebein): „Der Dolch fährt dem Skelett zwischen die Rippen, und das Gift tropft durch den leeren Brustkorb auf den Stein. Es dreht den Schädel zu dir, als hättest du es angetippt.“

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
  - **meta/welt**: Name der Welt, gültige Regelwerk-Version, Welttag 1, Weltenhüter, Adressen von Würfelkasten, Kartentisch, Rastübersicht, Gepäck, Logbuch, Glossar, Händlertisch, Titelbildschirm und Kampfkarte (ein Stand für alle Tische, `tische_stand`, 4.2), die Vorlage des Spielerbuchs (`spielerbuch`, 4.7), der Eingang (`eingang`, 22), die Zauberbibliothek (`zauberbibliothek`, 7.3), die Karten (`karten`, Regelwerk 20.3), die Karte von Oerik (`weltkarte`), das Greyhawk-Wissen der Spielleitungen (`greyhawk_wissen`) und die Verzeichnisse der Orte, der Personen, der Wesen und der Gegenstände (`ortsverzeichnis`, `personenverzeichnis`, `wesenverzeichnis`, `gegenstandsverzeichnis`; alle 24).
  - **orte**: je Ort id, name, x, y (Weltraster, 4.2), art (Ortsart der README), revier, erstmals (welttag, figur), aktualisiert (JJJJ-MM-TT). Hier steht die Lage; was eine Figur über den Ort weiß, steht in ihren Kartendaten. Die kanonischen Orte der Flanaess-Karte (Regelwerk 20.1) tragen `kanon: true` und `legende` (Hauptstadt, Stadt, Freie Stadt, Ort, Ruine) statt `revier` und `erstmals`; gemessen vom Nullpunkt Monmurg aus, ein Hexfeld (30 Meilen) sind 10 Einheiten, auf etwa 2 Einheiten genau. Betritt eine Figur einen davon, kommen `revier` und `erstmals` dazu. Orte jenseits der Flanaess tragen kein `kanon`; ihre Lage legt die erste Spielleitung, die dort spielen will, mit dem Weltenhüter fest (Regelwerk 20.3).
  - **laender** (Regelwerk 20.3): je Land, in dem gespielt wird, der Spickzettel. Id klein mit Bindestrichen (`hold-der-seeprinzen`). name, raum (Flanaess, Zentral-Oerik, West-Oerik), spickzettel (Zeilen: Herrscher und Götter, Sprachen, Sklaverei, Vertrautheit mit Magie, Sonnenuntergang, Kalendernamen, wem man misstraut, Lage), muenzen (`{pm: [Einzahl, Mehrzahl], ga: …, em: …, sm: …, km: …}`, wie im Gepäck, Regelwerk 4.4), quellen, quelle (Spieler, Sitzung), aktualisiert (JJJJ-MM-TT). Kanon, jenseits der Flanaess das Festgelegte (Regelwerk 20.3), keine Geheimnisse. Eine Spielleitung ergänzt, was fehlt, und überschreibt nichts; bei Streit entscheidet der Weltenhüter.
  - **figuren**: je Figur name, spieler, revier, status (aktiv, ruhend, tot), start (welttag, ort), stand (welttag, datum, tageszeit, ort), ruf (was man sich erzählt), erkennungszeichen, gefolge, buch (Link zum Spielerbuch, privat; nur zum Wiederfinden), aktualisiert (JJJJ-MM-TT).
  - **reviere**: je Revier name, inhaber, land (die id seines Landeseintrags, Regelwerk 20.3), gebiet (Orte), schluesselfiguren, abenteuer (Titel, Frist), status (laufend, abgeschlossen), oeffentlich (was jeder über die Gegend weiß), aktualisiert (JJJJ-MM-TT).
  - **chronik**: je Ereignis welttag, datum, ort, revier, figuren, art (ereignis, geruecht, tod, spur, zettel, wetter, handel), oeffentlich (was man sich erzählt), verbreitung (wo ab welchem Welttag man davon hört), geheim (was wirklich war; nur für Spielleitungen), quelle (Spieler, Sitzung), eingetragen (Tag des Eintrags in der echten Welt, JJJJ-MM-TT). Ein `zettel` trägt zusätzlich wortlaut, versteck und haltbar (bis Welttag). Ein `handel` steht in der Chronik, wenn etwas den Besitzer wechselt, das eine andere Figur finden oder kaufen könnte (eine verkaufte Waffe, ein Einzelstück, ein Schuldschein), oder wenn ein Händler ausgekauft ist; Rationen, Kerzen und Mahlzeiten nicht (10.1).
  - **ruf** (10.3): je Figur und Gruppe oder Person, bei der sich ihr Ruf über das Dorf hinaus herumspricht: figur, bei (Gruppe oder Person, mit Ort), oeffentlich (was man sich erzählt), verbreitung (wo ab welchem Welttag man davon hört), welttag, quelle (Spieler, Sitzung), eingetragen. Id: `<figur>-<gruppe>`. Der Renown-Wert und die Neigung selbst stehen nur in der Spoilerdatei; eine Spielleitung in einem anderen Revier leitet daraus die erste Neigung fremder Mitglieder ab (10.3), sobald die Kunde sie erreicht hat.
  - **geheimnisse**: Wahrheiten, die mehrere Reviere betreffen können: thema, wahrheit, betrifft, quelle, aktualisiert (JJJJ-MM-TT).
  - Daten in `aktualisiert` und `eingetragen` stehen als JJJJ-MM-TT, damit `query` mit `where` seit einem Datum lesen kann (Regelwerk 18); seit 3.16, ältere Einträge sind umgestellt.
  - **post**: von, an (Name oder Beschreibung, mit Ort), abgeschickt (welttag, ort), weg, ankunft (welttag frühestens, ort), inhalt (Wortlaut), siegel, sprache, zugestellt (ja/nein, welttag, wie), geoeffnet (von wem, falls unterwegs gelesen), quelle (Spieler, Sitzung).
  - **treffen**: figuren, ort, welttag, status (verabredet, gespielt, abgesagt), absprache.
  - **nachtraege**: was über den Briefkasten der Seite eingereicht wurde (figur, stand, eingereicht, anzahl); die Seite schreibt das selbst.
- **Auf „Sitzungsende“** schreibt sie: den eigenen Eintrag in figuren (Datum, Ort, Ruf, Gefolge, Status), neue Einträge in chronik (mit `eingetragen`), Ruf, der sich über das Dorf hinaus herumspricht, in ruf (10.3), neue Orte in orte, neue Länder in laender, neue Weltgeheimnisse, gesendete und zugestellte Post, Treffen. Einträge sind knappe Fakten, keine Spielszenen. Was nur das eigene Revier betrifft und geheim bleiben soll, gehört in die Spoilerdatei, nicht in die Chronik. Wie sie schreibt, steht im nächsten Punkt.
- **Schreiben.** Neue Dokumente legt sie an (`set`), in vorhandenen ändert sie nur ihre Felder (`merge` oder `update`), je mit der Version, auf der ihr Eintrag beruht (`ifVersion`): für figuren und reviere die Versionen vom Spielstart oder aus der Übergabe (21.4); fehlen sie, liest sie die beiden Dokumente vorher mit `get`. Sie lässt die Version nie weg und setzt nie eine frisch gelesene ein, ohne ihren Eintrag auf diese Fassung neu zu bauen; beides hebt den Schutz vor fremden Änderungen auf. Meldet die Chronik, das Dokument stehe nicht mehr auf dieser Version, hat meist eine andere Spielleitung es geändert: Sie liest es, arbeitet ihren Eintrag in die neue Fassung ein und schreibt erst dann; fremde Angaben überschreibt sie nie. `merge` ersetzt eine Liste ganz: Was wachsen soll, liest sie vorher und schreibt es mit dem Neuen zurück. Ein Aufruf mit mehreren Aufträgen gilt ganz oder gar nicht, höchstens 50 je Aufruf; Schreibaufrufe gehen nacheinander hinaus, nie nebeneinander. Bleibt ein Aufruf ohne Absage hängen, schickt sie ihn unverändert noch einmal, höchstens dreimal. Fragt die App um Freigabe, sagt sie vorher, was der Aufruf schreibt.
- **Absage ohne Netzzugriff.** Antwortet die Chronik mit `network_off`, hat der Chat keinen Netzzugriff und darf die Chronik nicht ändern; Lesen geht weiter. Das ist eine Absage, kein Hänger: Wiederholen hilft nicht. Die Spielleitung gibt alles Fällige als Chroniknachtrag aus (unten), legt ihn als `chroniknachtrag.json` in die Ablage und vermerkt im Spielstand unter „Geteilte Welt“, dass er einzureichen ist; liest sie zu Beginn der nächsten Sitzung ihren Eintrag in figuren auf dem neuen Stand, ist er angekommen, und Vermerk und Datei fallen weg. Damit sie die Absage früh kennt, schreibt sie beim Sitzungsende zuerst ihren Eintrag in figuren (21.3, Schritt 2). Ob Spielchats Netzzugriff haben, stellt der Kontoinhaber ein.
- **Briefkasten der Seite.** Für Spielleitungen, die die Datenbank nicht selbst lesen oder schreiben können, hat die Seite zwei Knöpfe, beide nur für angemeldete Konten mit Zugang: **Sitzungspaket speichern** lädt alle Sammlungen als Datei `01_chronik.md` herunter, die der Spieler ungelesen ins Projekt legt; **Nachtrag einreichen** nimmt den Chroniknachtrag entgegen und schreibt ihn in die Sammlungen. Der Weltenhüter darf Nachträge für andere einreichen.
- **Chroniknachtrag.** Ist die Chronik nicht erreichbar oder hat die Spielleitung keinen Zugang, spielt sie trotzdem weiter und gibt beim Sitzungsende alle fälligen Einträge als Datei `chroniknachtrag.json` aus (zur Not als Codeblock), die der Spieler ungelesen einreicht oder dem Weltenhüter schickt. Aufbau: `{"figur":"<id der Figur>","stand":"<Datum>","eintraege":[{"sammlung":"chronik","id":"wt0012-…","daten":{…}}, …]}`. Für Dokumente, die es schon gibt (die eigene Figur, das Revier, ein Brief bei der Zustellung), enthält `daten` nur die Felder, die sich ändern: Die Seite ersetzt jedes genannte Feld ganz und lässt die übrigen stehen. Was wachsen soll (der `ruf` einer Figur, `oeffentlich` eines Reviers oder eines Rufs), steht unter `anhaengen`, etwa `"anhaengen":{"ruf":"In Rohrdorf heißt es, sie habe den Brand gelöscht."}`: Die Seite hängt den Satz an das an, was im Feld steht, ohne es zu ersetzen und nie doppelt. So schreibt niemand ein ganzes Feld ab, und nichts geht verloren, was inzwischen ein anderer geschrieben hat. Ein Feld steht in `daten` oder in `anhaengen`, nicht in beiden; meta/welt ändert so nur der Weltenhüter (24). Die Ids folgen dem Muster der bestehenden Einträge (chronik: `wt<Welttag vierstellig>-<stichwort>`, für Tage vor Welttag 1 `wt-<Abstand vierstellig>-<stichwort>`, post: `wt<Welttag>-<von>-an-<an>`).
- Die Chronik wächst. Einträge, die älter als ein Jahr Weltzeit sind, fasst der Weltenhüter je Revier zu einem Eintrag zusammen, damit Sitzungspakete handlich bleiben.

## 20 Die Welt

### 20.2 Sammlungen je Gegend
Märchen und Folklore geben einer Szene Farbe (Regelwerk 20.2). Aus welcher Überlieferung die Spielleitung schöpft, hängt an Gegend und Leuten. Es bleibt bei Motiven und Ton: keine Namen, keine Gestalten, keine erkennbaren Geschichten, und keine Sammlung wird im Spiel genannt.

| Gegend und Leute | Sammlungen | Stand |
|---|---|---|
| Baklunischer Westen | 1001 Nacht | beschlossen |
| Olman im Amedio-Dschungel und in der Hold der Seeprinzen | Popol Vuh, Sahagún (Codex Florentinus) | beschlossen |
| Barbaren im Nordosten | Asbjørnsen und Moe, Kalevala | beschlossen |
| Flan, auch in der Hold der Seeprinzen | Boas, Erdoes und Ortiz, Stith Thompson | beschlossen |
| Hold der Seeprinzen und Sheldomar-Tal, Oeridier und Suel | Brüder Grimm, Bechstein, Andersen | Vorschlag |
| Olman, zusätzlich | Peñalosa (Q'anjob'al Maya) | Vorschlag |
| Motive nachschlagen, überall | Enzyklopädie des Märchens, Lévi-Strauss (Mythologica) | Vorschlag |

Eine Zeile mit „Vorschlag“ gilt, bis der Weltenhüter sie bestätigt oder ändert. Noch ohne Gegend sind aus seiner Liste: Narodnye russkie skazki, Erben, Srpske narodne pripovijetke, Hyltén-Cavallius und Stephens, Tang Kristensen, Rasmussen, Macmillan, das Huarochirí-Manuskript, Wilbert und Simoneau. Die erste Spielleitung, die in einer Gegend ohne Eintrag spielt, schlägt dem Weltenhüter eine Zuordnung vor (Regelwerk 2).

**Roman und Dichtung des Mittelalters** (Regelwerk 20.2; seit 4.6). Fünf Werke geben Farbe für Stände, Sitten und Alltag. Sie hängen an keiner Gegend: Sie passen, wo es den Schauplatz gibt. Auch hier bleibt es bei Motiven und Ton.

| Werk | Schauplatz und Leute | Was es an Farbe gibt |
|---|---|---|
| Umberto Eco, *Der Name der Rose* | Klöster, Tempel, Bibliotheken und Kanzleien | der Tag nach den Gebetszeiten, Schreibstube und verschlossene Bücher, Orden im Streit, Ketzer und Inquisitoren, Gelehrte, die zweifeln |
| Ken Follett, *Die Säulen der Erde* | Städte, Märkte und Bauplätze | Bauhütte und Handwerk, Zunft und Markt, der Streit zwischen Kloster und Burg, Hunger, Fehde und Thronstreit von unten gesehen |
| Sir Thomas Malory, *Le Morte d'Arthur* | Höfe, Burgen und Ritterorden | Turnier und Queste, Eid und Ehre, Hofhaltung und Treubruch, eine Gemeinschaft, die an sich selbst zerbricht |
| Geoffrey Chaucer, *The Canterbury Tales* | Straßen, Herbergen und Pilgerwege | Reisende aller Stände auf einem Weg, Geschichten unterwegs und am Feuer, Spott über Stand und Beruf, Frömmigkeit neben Geschäft |
| *Das Nibelungenlied* | Hallen, Sippen und Gefolgschaften | Treue bis in den Untergang, Fest und Brautfahrt, der Hort, Kränkung und Blutrache |

Die Werke hat der Weltenhüter am 15. November 2026 benannt. Wofür sie stehen, ist die Lesart der Spielleitung und gilt, bis er sie bestätigt oder ändert. Die Technik der Welt bleibt die von Regelwerk 20.

## 21 Spielstand pflegen

### 21.3 Sitzungsende
Auf „Sitzungsende“ oder wenn der Spieler aufhört („Sitzungsende“ ist die sichere Form), in dieser Reihenfolge:
1. Glanzmoment, wenn fällig (11.4). Steht ein Aufstieg an (Regelwerk 7.4), danach in einem Absatz: die Wahl des Spielers (sie fragt, wenn er sie noch nicht gesagt hat) und der Weg, den sie vorschlägt; beides kommt in Schritt 4 unter „Jetzt“ in den Spielstand, damit die nächste Sitzung mit dem neuen Bogen und dem Weg beginnt.
2. Werkzeuge und Schreibwege klären, bevor etwas festgeschrieben wird. Was kann dieser Chat (4.7)? `get_artifact` für Buch und Ablage nennt ihre Versionen und, ohne Netzzugriff, was dann noch geht. Als Erstes schreibt sie ihren Eintrag in figuren der Chronik (Welttag, Datum, Tageszeit, Ort); lehnt die Chronik ab, plant sie den Chroniknachtrag ein (18). Lassen sich Buch und Ablage nicht schreiben, wird aus dem Sitzungsende ein Zwischenhalt (4.7, Fall 2), und sie sagt es dem Spieler. Von hier an hält eine Notizdatei im Arbeitsordner Versionen, Prüfsummen und erledigte Schritte fest, denn sie übersteht eine Zusammenfassung des Verlaufs.
3. Holen und neu lesen, bevor geschrieben wird (4.7): die Ablage, soweit sie nicht seit dem Sitzungsbeginn auf der Platte liegt, und die vier Dateien des Buchs; das Archiv wird nicht geholt. Hat die Ablage eine andere `version` als beim Sitzungsbeginn, hat inzwischen ein anderer Chat veröffentlicht, etwa der Weltenhüter: Sie holt `stand.json` und die geänderten Dateien neu und arbeitet auf dieser Fassung (21.5). Was andere eingetragen haben, bleibt stehen: Sie ändert, was ihre Sitzung ändert, und nichts sonst; widerspricht Fremdes dem Gespielten, gilt das Gespielte (21.2), und sie sagt es dem Spieler.
4. Nachführen, in dieser Reihenfolge (Regelwerk 21.1, Schreiben vor Kürzen). Zuerst die Geschichte: der Abschnitt der Sitzung, „### Sitzung N, Tag …“, erzählt wie die früheren Abschnitte: was geschah, mit den Sätzen, die wörtlich zählen, kein Chatprotokoll; er steht am Ende von 02_geschichte.md, denn die Reihenfolge der Datei ist die des Buchs. Dann das Glossar, dann Karte, Gepäck und Logbuch in den Worten von Geschichte und Glossar (4.2 bis 4.6), das Gepäck dazu Zeichen, Seltenheit und Marke neuer Dinge und die neue Marke sichtbar veränderter (4.4). Zuletzt der Kern: „Jetzt“ neu, Figur und EP, Inventar, Tiere und Gefolge, Karte, Questlog, Fäden, Einfälle, Post, unter „Geteilte Welt“ das Datum des Abgleichs vom Sitzungsbeginn (18); die Stichwortliste noch nicht. In den Kern kommt nur, was der Bleibetest hält, und es altert, was dort seinen Platz verloren hat: Die Kurzchronik trägt die neue Sitzung als Absatz, die vorige in zwei, drei Sätzen, Älteres als Bogen; erledigte Aufträge, eingelöstes Wort, die Haken der Fäden und verbrauchte Einfälle gehen, sobald sie an ihrem Ort stehen. Notizen zu Werkzeugen gehören nicht in den Spielstand: Was für alle gilt, steht hier, was nur diese Figur betrifft, in ihrer Werkbank. Nach einem Zwischenhalt ist die Übergabe die Grundlage für alles bis dorthin (21.4).
5. Spoilerdatei und Wissensbuch nachführen: Zeitleiste, Uhren und Neigungen (8.3), Renown der Gruppen und offene Nebenaufträge mit Lohn (10.3), Reaktionen, Folgen, Meilensteine (11.3), Lagen mit Einsatz (11.5; neue aus dem Gespielten), Händler (10.1), Wissensbuch (5.1). Das Würfelprotokoll der Sitzung wird eine neue Datei des Archivs, `archiv/NNN-wuerfelprotokoll-sitzung-N.md`, mit einem Abschnitt „## Würfelprotokoll Sitzung N“; NNN ist die nächste freie Nummer laut `stand.json`. Liegt die Spoilerdatei oder das Wissensbuch über etwa 100.000 Zeichen, wandert Abgeschlossenes ebenso wörtlich ins Archiv (Regelwerk 21.1, 5.1; der Handgriff steht in 21.7).
6. Prüfen (4.8) gegen die neue Spoilerdatei, in der Reihenfolge dort; die Geschichte liest die Spielleitung selbst gegen die Spoilerdatei. Weiter geht es erst, wenn alles „FREIGEGEBEN“ meldet. Liegt der Kern jetzt ohne die Stichwortliste über etwa 50.000 Zeichen (`node seite/bauen.js --kern messen 02_spielstand.md`), folgt hier der Kehraus (21.7), und die Prüfung läuft danach noch einmal.
7. Stichwortliste im Spielstand erneuern (`node glossar.js --liste 02_glossar.md`). Danach ändert sich der Spielstand nicht mehr.
8. Spielerbuch veröffentlichen (4.7): `--dateien`, dann `publish_files` mit den vier Dateien.
9. Weltchronik nach 18, was nach Schritt 2 noch fällig ist; nach einer Absage als Chroniknachtrag.
10. Ablage veröffentlichen (4.7): Spielstand, Spoilerdatei, Wissensbuch und was sonst neu oder geändert ist, liegen im Ordner der Ablage; `node seite/bauen.js --ablage <ablage> --sitzung "Sitzung N" --sitzungsende`, dann `publish_files` mit `files` und `remove`. Damit ist die Sitzung gesichert und die Übergabe entfernt.
11. Projekt nachziehen: Spielstand und Spoilerdatei als Abschrift, je Datei ein Aufruf `project_write` mit `local_path`, nie mit dem Text im Aufruf. Die Antwort nennt als `version` die sha256 des Textes; sie muss der Datei gleichen. Das Projektwerkzeug überschreibt ein Dokument aber erst, wenn dieser Chat dessen alten Text ganz vor sich hatte: durch ein `project_read`, das ihn zeigt oder als Datei ablegt, oder weil der Chat das Dokument schon einmal aus einer Datei geschrieben hat (beobachtet am 13.11.2026). Beim Spielstand kostet das nichts, wenn die Spielleitung ihn zu Beginn der Sitzung mit `project_read` gelesen hat (21.5); lehnt das Werkzeug trotzdem ab, liest sie ihn noch einmal. Bei der Spoilerdatei ist es der eine Fall, in dem sie im Ganzen im Verlauf stehen darf: `project_read` als eingeklappter Arbeitsschritt, den die Spielleitung vorher ankündigt und den der Spieler nicht aufklappt; danach schreibt sie. Ein Dokument zu löschen, um es neu anzulegen, verbietet das Werkzeug, denn Löschen lässt sich nicht zurücknehmen. Zeigt `project_read` nur einen Teil, lässt sich das Dokument aus dem Chat nicht ersetzen; dann ersetzt es der Spieler ungelesen von Hand (22.1). Verlangt `local_path` einen anderen Ort, legt sie die Datei in den Arbeitsordner des Chats oder nach `/mnt/user-data/outputs`. Bleibt das Projekt trotz allem stehen, ist nichts verloren: Die Ablage gilt, die nächste Sitzung merkt den Unterschied (21.5), und der Bericht sagt es dem Spieler.
12. Gemälde für Orte, die die Figur zum ersten Mal betreten hat, wenn es einen Bildersaal gibt (21.6).
Die Dateien bearbeitet die Spielleitung als Dateien mit gezielten Änderungen (Edit, kleine Skripte). Spielstand und Spoilerdatei schreibt sie nie im Ganzen neu, weder in den Chat noch in eine Datei. Hat sie keinen Zugriff auf das Projekt, gibt sie die Dateien aus, oder den Spielstand als Text im Chat und die Spoilerdatei nur auf Nachfrage, klar als Spoiler markiert. Am Ende sagt sie in wenigen Zeilen, was gesichert ist (Buch, Chronik, Ablage, Projekt), was offen blieb und was der Spieler noch tun muss, etwa einen Chroniknachtrag einreichen.

### 21.4 Zwischenhalt
- Auf „Zwischenhalt“ (Regelwerk 21.3) sieht die Spielleitung zuerst nach, was der Chat kann (4.7), und schreibt dann die Übergabe als Datei `uebergabe.md` in den Ordner der Ablage: `node seite/bauen.js --ablage <ablage> --sitzung "Sitzung N, Teil 1"`, dann `publish_files`. Liegt schon eine Übergabe aus einem früheren Teil der Sitzung, schreibt sie diese fort (Teil 2, 3 …); nichts aus früheren Teilen fällt weg. Neue und geänderte Bühnen und Profile dieser Sitzung legt sie gleich dazu (12.6), denn mit dem Chat gingen sie verloren. Sonst ändert sie nichts: nicht das Projekt, nicht das Spielerbuch, nicht die Chronik, und im Ordner der Ablage bis zum Sitzungsende keine andere Datei.
- Lässt sich die Ablage nicht schreiben (4.7, Fall 2), geht die Übergabe als `claude/uebergabe.md` ins Projekt (`project_write` mit `local_path`). Das nächste Sitzungsende in einem Chat, der schreiben kann, arbeitet sie ein und leert die Datei danach bis auf die Zeile „Keine Übergabe offen.“
- Die Übergabe enthält, was ein neuer Chat braucht, um ohne den alten weiterzuerzählen, und was das Sitzungsende braucht:
  - Kopf: Sitzung und Teil, Welttag, Tageszeit und interne Uhr (8.2), Ort, Wetter, Mond, die laufende Stimmung (3.2), die nächste Wurfnummer (6.2), das Datum des Chronikabgleichs, die Versionen des eigenen Eintrags in figuren und reviere und was aus der Chronik für die Sitzung zählt, auch das Land mit seinen Münznamen (18)
  - der letzte Spieltisch, wörtlich: Statuszeile, zweite Zeile, Optionen
  - was sich an der Figur seit dem Sitzungsbeginn geändert hat: TP, Plätze, Ressourcen, Heldenmut, Einfälle, EP mit Grund, Geld, Rationen, Gepäck, Tiere und Gefolge, Post, gegebenes Wort, Neues für Glossar, Karte und Logbuch, dazu Zeichen, Seltenheit und Marke neuer Dinge (4.4)
  - die Szene: wer da ist, was die Leute wollen und wissen (5.1), was offen ist, wie die Figur aufgetreten ist (10)
  - der Verlauf der Sitzung als Entwurf für die Geschichte, erzählt wie die früheren Abschnitte, mit den Sätzen, die wörtlich zählen; kein Chatprotokoll
  - für die Spoilerdatei: Uhren und Neigungen (8.3), Renown und Nebenaufträge (10.3), Reaktionen, Folgen, Meilensteine (11.3), Lagen mit Einsatz (11.5), Händler (10.1), Wissensbuch (5.1) und das Würfelprotokoll
- Die Übergabe nennt Geheimnisse so offen wie die Spoilerdatei; darum liegt sie nur in der Ablage und steht in keiner Antwort. Im Verlauf steht sie als Arbeitsschritt, wenn die Spielleitung sie schreibt oder liest; den klappt der Spieler nicht auf.
- Danach sagt die Spielleitung in zwei Sätzen, was gesichert ist und dass es in einem neuen Chat in diesem Projekt mit „Weiter“ weitergeht. Im alten Chat spielt sie nicht weiter; schreibt der Spieler dort doch weiter, erinnert sie einmal an den neuen Chat, spielt dann weiter und schreibt die Übergabe beim nächsten Halt neu.
- **Weiter** (im neuen Chat, oder wenn zu Beginn einer Sitzung eine Übergabe liegt): Die Spielleitung sieht nach, was der Chat kann, liest das Regelwerk aus dem Projekt, holt `stand.json`, Spielstand, Spoilerdatei, Wissensbuch, Einstellungen und Übergabe aus der Ablage auf die Platte (Regelwerk 21.3, 21.5) und liest die Übergabe und den Spielstand ganz, Spoilerdatei und Wissensbuch gezielt; dazu die Dateiliste des Bildersaals (3.3), nicht die Chronik. Liegt die Übergabe im Projekt (`claude/uebergabe.md` mit mehr als der Zeile „Keine Übergabe offen.“), liest sie sie von dort. Dann zeigt sie ohne Titelbildschirm (4.10) das Gemälde des Ortes (3.3) und schreibt statt Rückblick und Befehlszeile ein, zwei Sätze, die zurück in die Szene führen, dazu die Klangzeile (3.2) und den letzten Spieltisch aus der Übergabe. Weiter geht es, wie der Spieler antwortet.
- Beim Sitzungsende ist die Übergabe die Grundlage für alles bis zum letzten Zwischenhalt (21.3, Schritt 4); Schritt 10 entfernt sie.

### 21.5 Ablage und Projekt
- Spielstand und Spoilerdatei liegen zweimal: in der Ablage (die Hauptfassung, Regelwerk 21.1) und im Projekt (ihre Abschrift). `stand.json` der Ablage nennt je Datei `sha256` und `zeichen`, dazu `sitzung` (wer zuletzt geschrieben hat: „Sitzung 11“, „Weltenhüter“, „Umzug“) und `geschrieben` (JJJJ-MM-TT); `--ablage` schreibt sie bei jedem Veröffentlichen neu.
- Wozu: Beim Spielstart und beim Sitzungsende kommen die Dateien der Ablage als Dateien auf die Platte (4.7); die Spielleitung liest sie dort, ändert sie gezielt und veröffentlicht sie wieder. Ihr Text läuft dabei nie durch den Chat. Ihn aus dem Verlauf abzuschreiben, war der größte Posten beim Speichern und die größte Fehlerquelle.
- **Die Adressen** von Spielerbuch und Ablage stehen im Kopf des Spielstands. Zu Beginn nimmt die Spielleitung sie aus der Projektdatei (die ersten Zeilen genügen); fehlt die Adresse der Ablage, hat die Figur noch keine (22.2).
- **Beim Holen** merkt sich die Spielleitung die `version` der Ablage (`get_artifact`), und `--einordnen` prüft jede Datei gegen ihre Prüfsumme in `stand.json`. „STIMMT NICHT“ heißt: Die Datei ist nicht die, die zuletzt geschrieben wurde. Dann arbeitet die Spielleitung nicht auf ihr weiter, sondern klärt mit dem Spieler, was geschehen ist; bis dahin gilt die Projektdatei.
- **Projekt und Ablage vergleichen:** Liegen die Projektdateien als Dateien vor (`/mnt/project`, im Stand vom Beginn des Chats), vergleicht sie beide Fassungen (`cmp`). Gleich: alles in Ordnung, und sie liest den Spielstand mit `project_read` statt aus der Datei: Es ist derselbe Text, und das Projektwerkzeug lässt sie ihn dann am Sitzungsende überschreiben (21.3, Schritt 11). Ungleich: Eine ist neuer. Hat das letzte Sitzungsende das Projekt nicht schreiben können, gilt die Ablage, und dieses Sitzungsende zieht das Projekt nach. Hat ein Chat ohne Schreibweg nur das Projekt geändert oder jemand die Projektdatei von Hand, sagt der Spieler es beim Sitzungsbeginn; dann nimmt die Spielleitung die Änderung in die Fassung der Ablage auf. Weiß es niemand, fragt sie einmal und nimmt im Zweifel die Fassung, deren Kopf die spätere Sitzung nennt. Ohne `/mnt/project` vergleicht sie nicht: Die Ablage gilt.
- Steht in `stand.json` unter `sitzung` nicht die vorige Sitzung, sondern etwa „Weltenhüter“, hat zwischendurch ein anderer Chat auf dem richtigen Weg geschrieben, womöglich erst während dieser Sitzung (21.3, Schritt 3). Die Dateien gelten, aber die Spielleitung sieht nach, was sich geändert hat, bevor sie ändert, damit sie nichts davon überschreibt.
- Wer außerhalb eines Sitzungsendes Spielstand oder Spoilerdatei ändert (eine Spielleitung auf Wunsch des Weltenhüters, ein Umbau), ändert die Fassung der Ablage, veröffentlicht sie mit `--sitzung "Weltenhüter"` und zieht das Projekt nach (21.3, Schritt 11). Regelwerk und Werkstatt liegen nur im Projekt; wer sie ersetzt, fasst die Ablage nicht an.
- **Ohne Ablage** (eine Figur vor dem Umzug, 22.2, oder ein Chat ohne Dateiweg, 4.7) arbeitet die Spielleitung mit den Projektdateien: unter `/mnt/project` als Dateien, sonst mit `project_read`. Der Spielstand darf dabei im Verlauf stehen; die Spoilerdatei liest ein Hilfsagent gezielt und meldet nur, was die Szene braucht.
- Die Richtwerte aus Regelwerk 21.1 und 5.1 gelten auch für Dateien: Gelesen wird gezielt, und was nicht mehr laufend gebraucht wird, gehört ins Archiv.

### 21.6 Ortsgemälde anlegen
- Gibt es einen Bildersaal (3.3), bekommt jeder Ort, den die Figur in der Sitzung zum ersten Mal betreten hat, ein Gemälde, als letzter Schritt des Sitzungsendes, wenn alles andere gesichert ist (21.3, Schritt 12). Ist der Chat dafür schon zu lang, malt die Spielleitung in einem eigenen Chat nach dem Sitzungsende („Gemälde für <Ort>“) oder beim nächsten Sitzungsende; bis dahin hat der Ort kein Bild.
- Motiv ist der Ort, wie die Figur ihn beim ersten Betreten wahrgenommen hat, mit Tageszeit und Wetter der Ankunft. Auf das Bild kommt nichts, was die Figur nicht gesehen hat, und nichts, was nur die Spoilerdatei weiß (4.8).
- Ein Ortsgemälde zeigt keine Menschen und keine Kreaturen (seit 4.2); Boote, Fahnen, Rauch und Licht dürfen zeigen, dass der Ort lebt. Maßstäbe sind Stimmung, Licht, ein klarer Aufbau, stimmige Perspektive und Materialien und alles, was die Geschichte über den Ort festlegt.
- Gemalt wird mit dem Skill für selbstmalende Gemälde. Das Bild wird als PNG mit 1040 × 780 Pixeln gerendert (Playwright: warten, bis es fertig gemalt ist, dann das Canvas speichern) und kommt als `bilder/<ort>.png` in den Bildersaal: die Seite `index.html` als Datei holen (4.7), ein Bild mit Messingschild ergänzen (Ort, Motiv, Weg und Reisezeit, soweit die Figur sie kennt) und mit `publish_files` veröffentlichen, zusammen mit dem Bild und dem HTML des Gemäldes als `bilder/<ort>.html`. `<ort>` ist der Ortsname klein, mit ae, oe, ue und ss für ä, ö, ü und ß und `_` für Leerzeichen (`alte_eiche`, `muehlfurt`).
- **Bildnisse und Titelbildnis.** Ein Bildnis der Spielerfigur oder eines Gefährten (`bilder/bildnis_<figur>.png`, 800 × 1200, mit dem Personen-Kern des Malkastens, das HTML als `bilder/bildnis_<figur>.html` daneben) malt die Spielleitung, wenn der Spieler es will, und malt es neu, wenn er es will; die Metadaten der Seite (`gruppe[]`) halten fest, wie die Figur aussieht und was der Spieler sich gewünscht hat. Zu jedem Bildnis der Spielerfigur gehört ihr Titelbildnis (Regelwerk 3.3, 4.10): Kopf und Schultern im Hochformat 3 : 4 aus dem Bildnis geschnitten, auf 150 × 200 Pixel verkleinert, als WebP (Qualität um 80, rund 4 KB) unter `bilder/bildnis_<figur>_titel.webp` und dieselben Bytes als `data:image/webp;base64,…` in `bilder/bildnis_<figur>_titel.txt`; `gruppe[].bild_titel` nennt die Textdatei. Beide Dateien schreibt sie neu, sobald das Bildnis neu gemalt ist, in derselben Veröffentlichung. Gefährten bekommen kein Titelbildnis, denn der Titelbildschirm zeigt nur Spielerfiguren.
- Ins Projekt und in die Ablage kommt dabei nichts mehr.

### 21.7 Den Kern kürzen (Kehraus)
Die Regeln stehen in Regelwerk 21.1 („Der Kern“). Fällig ist der Kehraus, wenn der Kern nach dem Nachführen ohne die Stichwortliste über etwa 50.000 Zeichen liegt. Er läuft beim Sitzungsende nach der Prüfung (21.3, Schritt 6), in dieser Reihenfolge:
1. Messen: `node seite/bauen.js --kern messen 02_spielstand.md` nennt Zeichen und Anteil je Abschnitt. Die Spielleitung beginnt, wo am meisten steht, was der Bleibetest nicht hält.
2. Die Prüfung von eben ist die Prüfung vorher; ihre Ergebnisse stehen in der Notizdatei. Mit `--ohne-kern` zeigt sie dazu, welche Sätze der Tische ihren Beleg nur im Kern haben (4.8).
3. Die alte Fassung beiseitelegen: `cp 02_spielstand.md kern-alt.md`.
4. Kürzen, mit gezielten Änderungen im Kern: je offenem Auftrag Stand, nächster Schritt und was bindet; offenes Wort und Termine im Wortlaut; Fäden als Titel in Gruppen; Dinge mit Ort und Gewicht; Orte mit Lage und Reisezeiten; die Kurzchronik wie in 21.3, Schritt 4. Bindungen bleiben. Notizen der Spielleitung wandern nach `werkbank.md`, feste Einstellungen nach `einstellungen.md`: als Zeilen aus `kern-alt.md` kopiert (ein kleines Skript, etwa `sed -n`), nicht abgetippt. Der Kopf des Kerns bekommt oder behält den Absatz „Abruf“: bei welchem Anlass gelesen wird, was nicht mehr im Kern steht (Regelwerk 21.1), etwa „Abruf: Person oder Ding in der Szene: Glossareintrag, bei Leuten das Wissensbuch. Ort: Glossareintrag, Karte, Spoilerdatei. Auftrag, Faden, gegebenes Wort: Logbuch. Arbeitsschritt: Werkbank. Früherer Stand: Geschichte, Kapitel ‚Stand der Dinge‘.“
5. Das Kapitel schreiben: `node seite/bauen.js --kern kapitel kern-alt.md 02_spielstand.md 02_geschichte.md --titel "Stand der Dinge nach Sitzung N (Welttag T)" --ohne werkbank.md --ohne einstellungen.md <Abschnitt> …`. Aus den genannten Abschnitten nimmt es jede Zeile der alten Fassung, die im neuen Kern nicht mehr wörtlich steht, und stellt sie als Kapitel vor die erste Sitzung von 02_geschichte.md. Überschriften stehen dort ab „####“, denn „###“ trennt die Abschnitte der Geschichte. Genannt werden nur Abschnitte mit Figurenwissen (etwa Auftrag, Inventar, Karte, Kurzchronik, Questlog, Fäden, Einfälle), je mit dem Anfang ihrer Überschrift. Was aus anderen Abschnitten fehlt, zählt das Werkzeug auf; es gehört in Werkbank oder Einstellungen, nie ins Buch, und einen Abschnitt, der für die Spielleitung überschrieben ist, lehnt das Werkzeug ab. Das Kapitel liest die Spielleitung gegen die Spoilerdatei wie jeden neuen Abschnitt der Geschichte (4.8).
6. Verlustprobe: `node seite/bauen.js --kern verlust kern-alt.md 02_spielstand.md 02_geschichte.md werkbank.md einstellungen.md`. Erst „NICHTS VERLOREN“ gilt; jede Zeile unter „FEHLT“ bekommt ihren Ort. Überschriftenzeichen zählen dabei nicht.
7. Prüfung nachher (4.8), mit dem gekürzten Kern und der neuen Geschichte. Sie meldet dasselbe wie vorher; sonst ist die Kürzung nicht freigegeben, und was jetzt als nicht belegt gilt, bleibt im Kern oder steht im Tisch in den Worten der Geschichte.
8. Die alte Fassung wird eine Datei des Archivs: `archiv/NNN-kern-vor-kehraus-sitzung-N.md` (NNN ist die nächste freie Nummer laut `stand.json`), mit der Zeile „## Kern vor dem Kehraus, Sitzung N“ über dem alten Text. Weiter geht es mit 21.3, Schritt 7.

Spoilerdatei und Wissensbuch kürzt die Spielleitung nach demselben Muster, wenn sie über etwa 100.000 Zeichen liegen (Regelwerk 21.1, 5.1): messen mit `node seite/bauen.js --kern messen <datei>`, die alte Fassung beiseitelegen, Abgeschlossenes als Zeilen in neue Dateien des Archivs kopieren und in der Datei streichen, dann `node seite/bauen.js --kern verlust <alt> <neu> archiv/NNN-….md`. Bei diesen Dateien nennen beide Befehle nur Nummern und Zeilen, nie Überschriften oder Wortlaut.

## 22 Neu einsteigen

Für Spieler:
1. Den Eingang nach Oerik öffnen (https://claude.ai/artifact/TBdN725HV7U3bjcmiFHiQg); er führt durch alle Schritte. Ein eigenes Claude-Konto anlegen und ein neues Projekt „Die Wege von Oerik – <Name>“ erstellen. Projekte gibt es auch im kostenlosen Plan, dort höchstens fünf; wer regelmäßig spielt, kommt mit Pro oder Max weiter, weil jede Nachricht Regelwerk, Spielstand und Spoilerdatei mitlädt (21.1). Was mit einem kostenlosen Konto anders läuft, steht in 22.1.
2. Die Projektanweisungen aus der Vorlage einfügen (Name, Figur, Chronik-Adresse eintragen) und das Regelwerk als 00_regelwerk.md und die Werkstatt als 00_werkstatt.md ins Projekt laden (alle drei zum Speichern im Eingang, außerdem im Repository unter docs/).
3. Beim Weltenhüter melden: Er lädt dich per E-Mail als Bearbeiter in die Weltchronik ein und schickt den Link zu seiner D&D-Beyond-Kampagne. Auf der Chronikseite prüfst du mit „Schreibrecht prüfen“, ob es klappt. Klappt es, führt deine Spielleitung die Chronik selbst, wenn ihr Chat in geteilte Artefakte schreiben darf; sonst führst du sie über den Briefkasten der Seite (18, 22.1). Meldet die Seite auch angemeldet „nicht erreichbar“, läuft die Chronik für dich über den Weltenhüter (22.1).
4. Der D&D-Beyond-Kampagne beitreten und die Figur dort nach 7.2 bauen, Stufe 1. Den Bogen als PDF exportieren und ins Projekt laden.
5. Die erste Sitzung beginnen. Die Spielleitung liest Bogen und Chronik, legt Spielstand, Revier, Spoilerdatei, Spielerbuch und Ablage an und trägt die Figur in die Chronik ein. Spoilerdatei und Ablage nicht lesen; das Spielerbuch darfst du jederzeit öffnen.

### 22.1 Mit einem kostenlosen Konto
Das Spiel geht auch mit einem kostenlosen Konto. Einiges läuft dort anders:
- **Jede Nachricht zählt.** Das Konto hat ein Nutzungslimit, und jede Nachricht lädt das Projektwissen mit. Darum: Spielstand handlich halten (21), lieber kurze Sitzungen mit „Sitzungsende“ oder einem Zwischenhalt (21.4) als mitten im Spiel ins Limit laufen, keine Nebenfragen im Spielchat. Läuft das Konto doch ins Limit, geht es nach der Wartezeit im selben Chat weiter; erst dann „Sitzungsende“.
- **Tische und Würfelkasten** laden vielleicht nicht. Dann gilt die Textform (4.2 bis 4.6, 6.1): Karte, Gepäck, Logbuch und Glossar als Text, Würfel per Hand, Rast per „kurze Rast“ oder „lange Rast“, Briefe per „Brief an …“.
- **Ohne Artefakt-Werkzeuge oder ohne Code** gibt es kein Spielerbuch und keine Ablage: Tischdaten, Glossar und Geschichte liegen dann als Dateien im Projekt (4.7, Fall 3) und laden mit jeder Nachricht mit. Darum zählt hier doppelt, den Spielstand handlich zu halten. Einen Zwischenhalt gibt es dann nicht; die Spielleitung schlägt stattdessen das Sitzungsende vor. Bühnen und Profile gibt es dann auch nicht: Der Grundriss bleibt in der Spoilerdatei (Regelwerk 12.6), die Kampfdaten stehen im Spielstand. Das Merken im Browser geht trotzdem, wenn die Tische laden.
- **Code läuft vielleicht nicht.** Dann entfällt die Spoilerprüfung (4.8); die Spielleitung hält sich an die Wortregel und vermerkt „ungeprüft“. Den Bogen liest sie aus der PDF-Ansicht; kommt nichts an, tippt der Spieler die Werte einmal ab, und sie stehen fortan im Spielstand.
- **Die Chronik läuft über Dateien.** Kann deine Spielleitung die Datenbank nicht lesen (keine Datenbank-Werkzeuge in deinem Chat), holst du dir vor einer Sitzung auf der Chronikseite das **Sitzungspaket** (`01_chronik.md`) und legst es ungelesen ins Projekt, an die Stelle des alten; zeigt die Seite dasselbe Änderungsdatum wie beim letzten Mal, kannst du dir das sparen. Die Spielleitung liest das Paket statt der Datenbank. Beim Sitzungsende gibt sie den **Chroniknachtrag** als Datei aus; du reichst ihn auf der Chronikseite ein, ohne ihn zu lesen. Kannst du auf der Seite nicht schreiben, schickst du den Nachtrag dem Weltenhüter und bekommst das Paket von ihm. Kann die Spielleitung lesen, aber nicht schreiben (ein Chat ohne Netzzugriff, 18), entfällt das Paket, und nur der Nachtrag läuft über dich.
- **Dateien kommen von dir.** Kann die Spielleitung das Projekt nicht selbst beschreiben, gibt sie Spielstand, Spoilerdatei und Tischdaten beim Sitzungsende als Dateien aus (21); du ersetzt sie im Projekt, die Spoilerdatei ungelesen.

Für die Spielleitung in der ersten Sitzung:
- Bogen lesen (7.4), die Chronik im Hilfsagenten lesen (Regelwerk 18), Spielstand anlegen (21) mit dem Absatz „Abruf“ im Kopf (Regelwerk 21.1) und den Einstellungen für die Rastübersicht (4.3), Revier anlegen (17.2, Handwerk 22.3) mit Klima (9.7), Uhren (8.3), zwei bis drei Nebenaufträgen mit Lohn (10.3), Händlern (10.1) und Wissensbuch (5.1), Spielerbuch und Ablage veröffentlichen (4.7): im Buch Kartendaten mit dem Startort aus der Chronik (4.2), Gepäck, Logbuch und Glossar (4.4 bis 4.6), in der Ablage Spielstand, Spoilerdatei, Wissensbuch, Einstellungen und `stand.json`; beide Adressen in den Kopf des Spielstands, alles in die Chronik eintragen (18), dann den Titelbildschirm mit der neuen Figur zeigen (4.10) und auf „Spiel laden“ die Einführung geben (4.1) und mit einer Einleitung am Welttag 1 beginnen.

### 22.2 Umstieg einer laufenden Figur auf 4.2
Bis 4.1 lagen Buch und Ablage in der Datenbank des Spielerbuchs. Der Umzug macht daraus Dateien: einmal je Figur, in einem eigenen Chat ihres Projekts, der Dateien veröffentlichen kann (4.7), vor der nächsten Sitzung. Bis dahin ließe sich aus den Projektdateien spielen (21.5), aber kein Sitzungsende schreiben. Eine Übergabe, die noch liegt, zieht mit um; danach geht es mit „Weiter“ oder dem Sitzungsende weiter.
1. Regelwerk und Werkstatt ab 4.2 liegen im Projekt (24), die Werkzeuge im neuen Stand in der Arbeitsumgebung (Regelwerk 4.2).
2. Die neue Seite bauen: `node seite/bauen.js --seite --titel "<Figur>s Buch" > index.html`. Zum Speichern des Pakets braucht sie eine Fähigkeit mehr, und die wird vor der Seite erklärt: `read_declaration`, dann `declare_capabilities` mit der bisherigen Datenbank und `"downloads": true`, dann `publish_files` mit `index.html` in das Spielerbuch. Das Buch sieht aus wie vorher, denn solange `daten/meta.json` fehlt, liest die neue Seite weiter die Datenbank.
3. Der Spieler öffnet sein Buch. Nur er sieht dort den Kasten „Umzug“; „Umzugspaket speichern“ lädt alle Sammlungen samt der alten Ablage als `spielerbuch-umzug.zip`. Er öffnet das Paket nicht, denn es enthält die Spoilerdatei, und hängt es an den Chat. Meldet die Seite, dass Speichern hier nicht geht, braucht der Umzug einen Chat mit Netzzugriff oder den Weltenhüter.
4. `node seite/bauen.js --umzug <paket.zip> <umzug>` schreibt `<umzug>/buch/daten/` und `<umzug>/ablage/` samt `stand.json` und meldet nur Zahlen und Prüfsummen: wie viele Einträge, Abschnitte, Bühnen und Profile, und ob Spielstand und Spoilerdatei ihrer alten Prüfsumme gleichen. Bei „STIMMT NICHT“ oder übergangenen Einträgen geht es nicht weiter, bis der Grund klar ist.
5. Einrichten, was 4.2 neu ordnet: Führt die Spoilerdatei das Wissensbuch als Abschnitt, wird daraus `wissensbuch.md` mit der Standzeile am Anfang (Regelwerk 5.1). Feste Einstellungen wandern aus dem Spielstand nach `einstellungen.md`; was nur diese Figur betrifft und nur bei einem Arbeitsschritt gebraucht wird, nach `werkbank.md`; Notizen zu Werkzeugen, die jetzt die Werkstatt trägt, fallen weg (Regelwerk 21.1).
6. Prüfen wie bei einem Sitzungsende (4.8), mit den Dateien aus `<umzug>/ablage` und, über `--zurueck <umzug>/buch <arbeit>`, denen des Buchs. Ein Kapitel „Stand der Dinge“ von vor 4.2 zieht als erster Abschnitt der Geschichte mit um; stehen in seinem Text Überschriften, setzt `--zurueck` sie ab „####“ und sagt es (4.7).
7. Veröffentlichen. Das Paket kam vom Spieler, also wird jede Datei ganz gelesen, bevor sie hinausgeht (4.7): Ein Hilfsagent liest und veröffentlicht und meldet nur Zahlen und Auffälliges; bei einem großen Archiv mehrere nacheinander. Das Buch: die vier Dateien unter `daten/` in das Spielerbuch. Die Ablage: `node seite/bauen.js --ablage-seite --titel "<Figur>s Ablage" > <umzug>/ablage/index.html`, dann `--ablage <umzug>/ablage --sitzung "Umzug"` und `publish_files` ohne `slug`, mit dem Titel „<Figur>s Ablage“: Ein neues, privates Artefakt entsteht.
8. Die Adresse der Ablage kommt neben die des Buchs in den Kopf des Spielstands, darunter der Absatz „Abruf“ (Regelwerk 21.1, W 21.7); danach Ablage und Projekt wie in 21.3, Schritte 10 und 11. Die Projektanweisungen erneuert der Spieler nach der Vorlage im Eingang.
9. Nachsehen: Das Buch zeigt dasselbe wie vorher und keinen Kasten „Umzug“ mehr, und `list_files` der Ablage nennt alle Dateien. Die alte Datenbank bleibt als Rückhalt liegen, bis der Weltenhüter das Aufräumen freigibt; das Buch liest sie nicht mehr, sobald `daten/meta.json` da ist.

### 22.3 Handwerk beim Anlegen eines Reviers
Was ein Revier enthält, steht in 17.2 und 21.1. Hier steht, worauf die Spielleitung beim Bauen achtet; das gilt ebenso, wenn ein bestehendes Revier einen neuen Auftrag oder eine neue Bedrohung bekommt. Es sind Faustregeln für den Stoff, keine Spielregeln.
- **Jedes Geheimnis hat mehrere Spuren.** Was die Figur wissen muss, damit ein Auftrag weitergeht, liegt an mindestens drei Stellen: bei Leuten, an Orten, in Dingen. Fortschritt hängt nie an einer einzigen Probe oder daran, zu erraten, was die Spielleitung denkt; eine verpasste Spur verschiebt den Weg, sie versperrt ihn nicht (6.4).
- **Jeder Gegenspieler hat ein Ziel, eine Rechtfertigung und einen Bezug zur Figur.** Was er will, warum er sich im Recht glaubt und was ihn mit Herkunft, Handwerk, Bindung oder Taten der Figur verbindet, steht bei ihm in der Spoilerdatei. Er handelt über Uhren und Reaktionen (8.3), nicht über Auftritte.
- **Jede geplante Kampflage hat mehr als Gegner.** Die Spoilerdatei nennt zum Ort, was die Lage bewegt: Gelände und Wasser, Licht und Wetter, Unbeteiligte, ein Ziel außer Töten (fliehen, schützen, etwas holen oder halten) und was sich mitten im Kampf ändern kann. Schwierigkeit und EP regeln weiter 12.2 und 11.2.
- **Orte folgen der Karte, Ton folgt den Vorbildern.** Lage, Landschaft und Leben eines Ortes nach 20.1, Aufträge und Gegenspieler im Ton von Regelwerk 20.2; Ungeheuer und ihre Werte nach 7.1.
- **Das Revier kennt sein Land.** Jedes Revier stützt sich auf den Landeseintrag seines Landes (Regelwerk 20.3, Chronik unter `laender`, 18). Gibt es keinen, legt die Spielleitung ihn beim Anlegen an, aus Wiki und Chronik: Herrscher und Götter, Sprache, die Namen der Münzen zu den Werten von 7.5, wie es dort um die Sklaverei steht, wie vertraut die Leute mit Magie sind, wie man Tage und Monate nennt, wem man misstraut und wann die Sonne untergeht. Was nur das Revier betrifft, bleibt in der Spoilerdatei. Die id des Eintrags steht im Revier unter `land` (18), die Münznamen trägt sie als `muenzen` ins Gepäck (Regelwerk 4.4). Kann sie die Datenbank nicht beschreiben, steht der Eintrag im Chroniknachtrag (18).
- **Das Revier kennt sein Klima.** Die Spoilerdatei trägt „## Klima“ je Jahreszeit (9.7): Regen- und Trockenzeit, Frost und Eis, Nebel, Stürme auf See, Hitze; daraus kommt das Wetter der Statuszeile, und daraus folgen Kälte, Hitze, Höhe und Eis als Gefahren. Ein Revier im Amedio hat andere Jahreszeiten als eins an der Eissee; beide stehen so fest wie die Karte.
- **Zwischenzeit, Zwischenfälle, Flüche und Schrecken wachsen aus dem Revier.** Die Spoilerdatei bekommt beim Anlegen drei kleine Abschnitte, die mit dem Spiel wachsen: „## Zwischenzeit“ mit den Verwicklungen, die in diesem Revier passieren können (8.4; aus Leuten, Uhren und Geheimnissen, nicht aus Buchtabellen), „## Zwischenfälle“ je Gelände für Verfolgungen (12.4) und „## Flüche und Schrecken“ mit Auslöser, Wirkung, Dauer und Lösung (14.1). Was es im Revier gibt (eine Arena, ein Archiv, einen Lehrer, einen Hehler, einen Tempel, einen Verkäufer für Magisches, eine Formel), steht bei den Orten, damit die Tätigkeiten der Zwischenzeit und 15.1 einen Boden haben; was es nicht gibt, gibt es nicht.
- **Schiffe und Häfen haben Werte, Bühnen gibt es vorher.** Schiffe des Reviers stehen mit Werteblock nach Ghosts of Saltmarsh, Mannschaft, Kurs und Fahrplan in der Spoilerdatei (8.5); Orte, an denen ein Kampf auf der Kampfkarte wahrscheinlich ist (Gewölbe, Häuser mit mehreren Räumen, Hinterhalte, Decks), bekommen eine Bühne (12.6) mit dem, was die Figur noch nicht sieht, als verdeckte Gruppen, und was sie nicht einmal ahnen darf, getarnt (`aussehen`). Ohne Spielerbuch (22.1) steht stattdessen ein Grundriss als Text oder Skizze in der Spoilerdatei, aus dem die Spielleitung im Kampf nimmt, was die Figur sieht.
- **Ein Gewölbe steht vorher.** Bevor eine Figur ein Gewölbe betreten kann (Regelwerk 8.6), stehen in der Spoilerdatei: der Plan als Bühne mit verdeckten Gruppen je Raum (12.6; ein großes Gewölbe als mehrere Bühnen), die Kernfrage mit ihrer Antwort an mindestens drei Stellen, die Bewohner als Gruppe mit Ziel und Tageslauf, die Schwelle der Begegnungsprobe und was Lärm auslöst, Licht, Fallen (DMG 120 ff.) und der Hort (Regelwerk 10.2). Anhang A des DMG 2014 (Zufallsgewölbe, S. 290 ff.) und veröffentlichte Abenteuer sind Steinbruch beim Bauen: Die Spielleitung würfelt oder liest vorab, streicht, was nicht zur Karte (Regelwerk 20.1) und zur Kernfrage passt, und schreibt das Ergebnis in die Spoilerdatei. Im Spiel wird nichts erwürfelt. Liegt ein Gewölbe am Schauplatz eines veröffentlichten Abenteuers, gilt Regelwerk 20.3: Den Ort gibt es in der Welt, das Abenteuer selbst spielt dort nur nach Absprache mit dem Weltenhüter.
- **Schätze sind Geschichte.** Alltagshorte folgen 10.2 (ein Viertel der Horttabelle); ein Schatz, der den Namen verdient, steht mit Herkunft, Besitzern und Folgen in der Spoilerdatei und wird mit dem Weltenhüter angelegt, denn er kauft ein Schiff (10.1) und zieht Kreise durch mehrere Reviere (17.4).

## 23 Wahlregeln

Die Tafel aller Wahlregeln der Bücher (7.1). **gilt** heißt in der Fassung des Buchs, **angepasst** in der Fassung des genannten Abschnitts des Regelwerks, **aus** heißt aus, mit Grund. Was hier nicht steht, ist aus. Geändert wird die Tafel nur mit dem Regelwerk, über den Weltenhüter (2).

**Die Gründe, nach denen „aus“ entschieden ist, in sechs Sätzen:**
1. **Werkzeuge rechnen mit festen Zahlen.** Würfelkasten, Rastübersicht und D&D Beyond kennen Boni, Zauberplätze, Trefferwürfel und Initiative nach PHB; Varianten, die daran drehen, kosten eine neue Fassung aller Tische (Übungswürfel, Fertigkeitsvarianten, Zauberpunkte, Initiativvarianten, Rast- und Heilvarianten).
2. **Raster nur auf der Kampfkarte** (12.6), und auch dort nichts, was Dauervorteil gibt (Flankieren) oder für Text zu fein ist (Blickrichtung, 5-10-5-Diagonalen).
3. **Nichts, was Figuren stärker oder Tode plötzlicher macht** (Markieren, Durchschlagen, massiver Schaden, Dauervorteil durch Flankieren, dunkle Gaben, epische Gaben, Training für Stufen als Bremse ebenso wie als Beschleuniger).
4. **Eigene Systeme stehen** (Heldenmut statt Inspiration und Heldenpunkten, Einfall statt Handlungspunkten, Neigung statt Haltungstabelle, Beziehungen und Frömmigkeit, Spoilerdatei statt Zufallstabellen, Chronik statt geteilter Kampagne, EP mit Meilensteinen statt Stufen ohne EP).
5. **Nicht bestrafend, Figur statt Spieler** (Wahnsinn, Stress, Verstand, Ehre).
6. **Nicht diese Welt** (Feuerwaffen, Sprengstoff, fremde Technik, Setting-Bücher außer ihren Zaubern, 2024-Regeln außer den Zauberfassungen nach Regelwerk 7.3, die Schauplätze der Module).

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
| Erkundung in Zügen | PHB 181 ff. | angepasst (8.6) |
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
| Belagerungsgerät | DMG 255 | gilt, wenn es vorkommt (Werteblöcke); keine Kanonen (Regelwerk 20) |
| Krankheiten | DMG 256 f. | angepasst (14) |
| Gifte | DMG 257 f. | gilt: Werte nach DMG, Vorkommen, Ernten und Kauf über die Spoilerdatei |
| Wahnsinn | DMG 258 ff. | aus (14.1) |
| Stufen ohne EP (Meilensteine) | DMG 261 | aus: EP mit Meilenstein-EP (11) |
| EP ohne Kampf | DMG 260 f. | angepasst (11.2, 11.3, 11.5) |
| Übungswürfel | DMG 263 | aus: feste Boni in Bogen und Kasten |
| Fertigkeitsvarianten | DMG 263 f. | aus: dito |
| Heldenpunkte | DMG 264 | aus: Heldenmut (6.6) |
| Ehre | DMG 264 | aus: ein Kodex ist Spiel, kein Wert |
| Verstand | DMG 264 f. | aus (14.1) |
| Furcht und Horror | DMG 266 | angepasst (14.1) |
| Heilvarianten (Heilerkit-Pflicht, Heilschübe, langsames Heilen) | DMG 266 f. | aus: Rastübersicht und Trefferwürfel-Rechnung; Wunden wiegen über 14 |
| Rastvarianten (episch, grimmig) | DMG 267 | aus: kippt Zauber- und Trefferwürfel-Rechnung laufender Figuren und die Rastübersicht; Rast im Freien ist über 9.4 und 8.3 schon teuer |
| Feuerwaffen, Sprengstoff, fremde Technik | DMG 267 f. | aus: Schießpulver ist auf Oerth wirkungslos, Technik nach Gygax (Regelwerk 20) |
| Handlungspunkte | DMG 269 | aus: die Welt erzählt die Spielleitung, der Einfall gibt dem Spieler sein Stück davon (6.6) |
| Initiativvarianten | DMG 270 | aus: Kasten und Reihenfolge nach 12.1 |
| Handlungsoptionen | DMG 271 f. | angepasst: fünf von sechs (12.3) |
| Deckung treffen | DMG 272 | gilt (12.3) |
| Durchschlagen | DMG 272 | aus (12.3) |
| Bleibende Verletzungen | DMG 272 | angepasst (14) |
| Massiver Schaden | DMG 273 | aus: ein Wurf, der eine Solo-Figur ohne Wahl fällt (6.5) |
| Moral | DMG 273 | angepasst (12.1), auch bei Umzingelung |
| Zauberpunkte | DMG 288 | aus: Zauberplätze in Statuszeile, Rastübersicht und Bogen |
| Zufallsgewölbe | DMG 290 ff. (Anhang A) | angepasst: Steinbruch beim Bauen, nie im Spiel (8.6, 22.3) |
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
| Drachenmale, Dunamantie, Spelljammer, Planescape, Dragonlance-Schlachten, Deck der vielen Dinge, Acquisitions Inc. | Setting-Bücher | aus: Setting-gebunden; Wesen und Dinge daraus nach 7.1 und 10.2, Zauber daraus nach Regelwerk 7.3 |
| Zauberfassungen | PHB 2014, PHB 2024 | angepasst (Regelwerk 7.3): Fassung 2014; 30 Zauber immer nach 2024; sonst 2024 nur, wo es keine andere Fassung gibt |
| Zauber aus allen Büchern | alle Bücher von Wizards of the Coast für die 5. Edition, auch Setting-Bücher | gilt (Regelwerk 7.3, seit 4.2): wählbar nach der Zauberliste der Klasse in dem Buch; Fassung nach Regelwerk 7.3; Auflagen des Buchs bleiben (seit 4.5) |
| Zauber aus D&D Beyond Drops | D&D Beyond Drops | gilt (Regelwerk 7.3, seit 4.5): wählbar wie Zauber eines Buchs, Fassung von 2024 nach der Tafel in 7.3 |
| Kreiszauber | Forgotten Realms: Heroes of Faerûn | aus: mehrere Wirker an einem Zauber kennt 15 nicht; die vier Zauber gelten ohne diesen Modus |
| Dunamantie-Zauber, Gildenzauber | Explorer's Guide to Wildemount, Guildmasters' Guide to Ravnica | angepasst: frei mit Auflage, wählbar erst nach Fund oder Lehre (Regelwerk 7.3) |
| Zauber aus D&D: World of Warcraft | D&D: World of Warcraft, Frühzugang | aus: andere Welt, Text noch nicht endgültig (Regelwerk 7.3) |
| Unterklassen, Hintergründe, Völker, Gilden, Heldenchronik | Explorer's Guide to Wildemount, Guildmasters' Guide to Ravnica | aus: nicht diese Welt (Grund 6) |
| Lawine, Schneesturm, Reisen im Schnee, Gebirgsreise | Icewind Dale: Rime of the Frostmaiden, S. 10 f. | aus, bis ein Revier im Eis entsteht; dann angepasst in 9.7 |
| Fremde Technik in Abenteuern | Expedition to the Barrier Peaks (in Quests from the Infinite Staircase), Lost Laboratory of Kwalish | aus wie DMG 267 f.; als Fund eine Spur und Sache des Weltenhüters (Regelwerk 20) |
| Abenteuer, Werteblöcke und Gegenstände aus Partnerinhalten | Legends of Greyhawk (acht Titel), Classic Modules Today | aus als Regelquelle: Steinbruch (22.3); Werteblöcke nach Regelwerk 7.1; Schauplätze nach Regelwerk 20.3 |
| Schauplätze und Handlung veröffentlichter Abenteuer | Abenteuer, die in Greyhawk spielen: Ghosts of Saltmarsh, Tales from the Yawning Portal, Quests from the Infinite Staircase, Lost Laboratory of Kwalish, Vecna: Eve of Ruin, Legends of Greyhawk | angepasst (Regelwerk 20.3; seit 4.6): Den Schauplatz gibt es in der Welt; das Abenteuer spielt dort nur nach ausdrücklicher Absprache mit dem Weltenhüter, sonst ist es Steinbruch (22.3) |
| Orte aus Büchern und Abenteuern, die nicht in Greyhawk spielen | Dead in Thay (in Tales from the Yawning Portal); Pharaoh, When a Star Falls und The Lost City (in Quests from the Infinite Staircase); Bücher anderer Welten | aus (Regelwerk 20.3; seit 4.6): nur Inspiration, kein Ort der Welt, auch wenn das Buch eine Stelle in Greyhawk vorschlägt. Ausnahmen nimmt nur der Weltenhüter auf: Sunless Citadel und Khundrukar |
| Wesen und Gegenstände aus Büchern für die Regeln von 2024 | 5.5e Expanded Rules, D&D Beyond Drops | gilt (Regelwerk 7.1, seit 4.5): Sie ergänzen, wo sie Neues bringen; Neufassungen gelten nicht |
| Heldeninspiration | PHB 2024 | angepasst: Heldenmut (6.6) |
| Waffenmeisterschaft, Erschöpfung 2024, Bastionen, übrige 2024-Regeln | PHB/DMG 2024 | aus (7.2, 9.3) |
| Blessing of the Lone Champion | Dragon Delves (2025) | aus: Powercreep; allein gilt 12.2, mit Gefährte 16.4 |
| Magische Gegenstände | The Griffon's Saddlebag 1 und 2, Valda's Player Pack 1 und 2, Deep Magic Band 1 und 2 (Stile der Magie) | angepasst: nur über die Spoilerdatei (7.1, 10.2); Zufallstabellen aus |
| Zauber | Valda's Player Pack 1 und 2 | angepasst: umgerechnet nach der Tafel in 7.3, je Zauber mit Freigabe (Regelwerk 7.3) |
| Zauber | Deep Magic, Band 1 und 2 (2023) | angepasst: Kurzwirkung der Zauberbibliothek, je Zauber mit Freigabe (Regelwerk 7.3) |
| Unterklassen, Talente | The Griffon's Saddlebag 2, Fassung für 2014 | angepasst: je Stück mit Freigabe (7.2); Stand 4.4: keine freigegeben |
| Unterklassen, Talente, Vertraute | Valda's Player Pack 1 und 2, The Griffon's Saddlebag 1 | aus: nur für die Regeln von 2024 (7.2) |
| Klassen, Unterklassen, Hintergründe | Deep Magic | aus: nicht auf D&D Beyond baubar, und gebaut wird dort (7.2) |
| Völker | alle Module | aus: Völker kommen aus dem Kanon (Regelwerk 20); Ausnahmen nur mit dem Weltenhüter |
| Pistolero, Gunslinger | Valda's Player Pack 2 | aus: Schießpulver ist auf Oerth wirkungslos (Regelwerk 20) |
| Schauplätze | The Griffon's Saddlebag 1 und 2 | aus: nicht Oerik (Regelwerk 20); Wesen daraus nach 7.1 |
| Wesen und Werteblöcke | alle Module | gilt nach 7.1: Sie ergänzen, wo sie Neues bringen |
| Abenteuerorte, Zufallstabellen | Deep Magic, Band 1 und 2 (2023) | aus: Steinbruch für Spoilerdateien (22.3) |
| Zwischenzeit, Zauberanpassung, epische Magie | Deep Magic, Band 1 und 2 (2023) | aus, solange 8.4 und 15.1 sie nicht übernehmen |
| Rule of Cool, „Ja, und …“ | Tischbrauch | angepasst (6.7): ein Ja und ein Wurf, nichts über Vorteil und Heldenmut hinaus |

## 24 Werkzeugkoffer

Alles Werkzeug der Welt an einer Stelle. Neu ist hier nichts: Die Regeln stehen in den genannten Abschnitten, die Felder in der README des Repositorys wegwart-karte. Der gültige Stand aller Tische steht in meta/welt (`tische_stand`, 4.2). Im Eingang nach Oerik (https://claude.ai/artifact/TBdN725HV7U3bjcmiFHiQg) lassen sich die Tische an der erfundenen Welt der Tests ausprobieren. In den Spalten „Regel“ dieses Kapitels meinen Nummern ohne W das Regelwerk.

**Am Spieltisch** (Widgets im Chat)

| Werkzeug | Datei | Wofür | Regel | Lädt es nicht |
|---|---|---|---|---|
| Titelbildschirm | titel.js | Gemälde, Menü und Spielstände zu Beginn jeder Sitzung | 4.10 | „Spiel laden“ schreiben |
| Würfelkasten | wuerfel.js (Repository wegwart-wuerfel) | alle Würfe der Figur | 6.2 | selbst würfeln und das Ergebnis schreiben |
| Kartentisch | karte.js | Orte, Wege und Reisezeiten, die die Figur kennt | 4.2 | Karte als Text |
| Rastübersicht | rast.js | kurze und lange Rast, Zaubervorbereitung, Schreiben | 4.3 | „kurze Rast“ oder „lange Rast“ schreiben |
| Gepäck | inventar.js | Geld, Rationen, Traglast, Dinge | 4.4 | Inventar als Text |
| Logbuch | questlog.js | Aufträge, Fristen, Mond, gegebenes Wort, EP | 4.5 | Questlog als Text |
| Glossar | glossar.js | was die Figur weiß und woher | 4.6 | Glossar als Text |
| Händlertisch | handel.js | Kaufen, Verkaufen, Feilschen auf der Waage | 4.9, 10.1 | „Handel“ schreiben, Auslage als Text |
| Kampfkarte | kampf.js, kacheln.js | Raster, Gelände, Höhe, Züge, Kampfbilanz | 12.6 | Textkarte |

**Seiten** (Artefakte auf claude.ai)

| Werkzeug | Wo | Wofür | Regel | Wer |
|---|---|---|---|---|
| Eingang nach Oerik | https://claude.ai/artifact/TBdN725HV7U3bjcmiFHiQg | Einstieg, Regelbuch, Werkzeugkoffer, Dateien; ohne Datenbank, öffentlich teilbar (für eine neue Fassung nimmt der Weltenhüter den öffentlichen Link kurz zurück) | 22 | alle |
| Chronik von Oerik | Adresse in den Projektanweisungen | die gemeinsame Datenbank, Kalender, Postrechner, Briefkasten; kein öffentlicher Link | 18 | eingeladene Konten |
| Zauberbibliothek von Oerik | https://claude.ai/artifact/PLB8E8DPvX6m5xSKz4oJGP (auch in meta/welt: `zauberbibliothek`) | alle Zauber mit Eckdaten, geltender Fassung, Kurzwirkung, Hinweis und Stand, mit Suche und Filtern; ohne Datenbank; noch nicht geteilt | 7.3, W 7.3 | Weltenhüter; Spieler und Spielleitungen, sobald er sie teilt |
| Verzeichnis der Wesen von Oerik | https://claude.ai/artifact/AfgoJsYc69Rd7vuYgGCS2s (auch in meta/welt: `wesenverzeichnis`) | welche Wesen in welchem Buch stehen und welche Fassung gilt: Art, Größe, Herausforderungsgrad, EP, Fundstelle und Vermerk, mit Suche und Filtern; mit Kampfwerten für die 323 Wesen des freien Grundregelwerks (SRD 5.1, CC BY 4.0, englischer Wortlaut), sonst ohne Werteblöcke; ohne Datenbank; noch nicht geteilt | 7.1, 16.2 | Weltenhüter; Spielleitungen, sobald er es teilt |
| Verzeichnis der Gegenstände von Oerik | https://claude.ai/artifact/65CpzZMGDjCm9CuTxH8F7x (auch in meta/welt: `gegenstandsverzeichnis`) | magische Gegenstände mit Art, Seltenheit, Einstimmung, Fundstelle und Vermerk, mit Suche und Filtern; mit Wirkung für die 249 Gegenstände des freien Grundregelwerks (SRD 5.1, CC BY 4.0, englischer Wortlaut), sonst ohne Wirkung; ohne Datenbank; Steinbruch für Spoilerdateien; noch nicht geteilt | 7.1, 10.2, 15.1 | Weltenhüter; Spielleitungen, sobald er es teilt |
| Verzeichnis der Orte von Oerik | https://claude.ai/artifact/FxbhCq2P5Vf8nT4MjeDy2m (auch in meta/welt: `ortsverzeichnis`) | Orte der Chronik, Orte aus Quellenbüchern und Schauplätze der Abenteuer mit Art, Land, Lage im Weltraster, Weg von einer gewählten Stadt und Eckdaten in eigenen Worten, mit Suche und Filtern; nichts aus dem Inneren eines Reviers; ohne Datenbank; noch nicht geteilt | 20.1, 20.3 | Weltenhüter; Spieler und Spielleitungen, sobald er es teilt |
| Verzeichnis der Personen von Oerik | https://claude.ai/artifact/XQKZyvfQeSbEXRTvfDsaTs (auch in meta/welt: `personenverzeichnis`) | wer 576 CY wo herrscht und wessen Namen jeder kennt: Herrscher, Räte und Bünde, die Spitzen der Freien Stadt Greyhawk, berühmte Zauberer und Gestalten der Legende, je mit Amt, Land, Sitz, Volk, Klasse und Stufe nach dem Folio und Quelle, mit Suche und Filtern; nur öffentlich Bekanntes, keine Personen der Reviere; ohne Datenbank; noch nicht geteilt | 20.3 | Weltenhüter; Spieler und Spielleitungen, sobald er es teilt |
| Karte von Oerik | https://claude.ai/artifact/RcNnCgHC5T7znWkhR7FGcW (auch in meta/welt: `weltkarte`) | die Flanaess im Weltraster nach den Karten von 576 CY und 2024: Küsten, Gelände, Flüsse, Orte der Chronik und der Quellenbücher, Schauplätze der Abenteuer, Reviere als Gebiete, Wege messen; im selben Artefakt liegen ihre Übergabe und das Greyhawk-Wissen der Spielleitungen (`wissen/greyhawk.md`, meta/welt `greyhawk_wissen`); ohne Datenbank; noch nicht geteilt | 4.2, 8.2, 20.1, 20.3 | Weltenhüter; Spieler und Spielleitungen, sobald er sie teilt |
| Spielerbuch | eines je Figur, gebaut aus seite/buch.html | Glossar, Logbuch, Gepäck, Karte, „Was bisher geschah“; vier Dateien statt einer Datenbank | 4.7, W 4.7 | Spieler, Spielleitung |
| Ablage | eine je Figur, Deckblatt aus seite/ablage.html | Spielstand, Spoilerdatei, Wissensbuch, Einstellungen, Werkbank, Übergabe, Bühnen, Profile, Archiv; nie geteilt | 4.7, 21.1, W 21.5 | nur die Spielleitung |
| Bildersaal | einer je Figur | Ortsgemälde und Bildnisse als PNG, das Titelbildnis als WebP und `data:`-Text | 3.3, 4.10, W 21.6 | freiwillig |

**Für die Spielleitung** (Node, aus dem Repository im Stand `tische_stand`, holen nach 4.2)

| Werkzeug | Datei | Wofür | Regel |
|---|---|---|---|
| Spoilerprüfung | pruefen.js, wissen.js, wissensbuch.js | sperrt, was die Figur nicht wissen kann, und Wissen ohne Weg; `--ohne-kern` zeigt, was allein am Kern hängt | 5.1, W 4.8 |
| Bücherordner des Weltenhüters | Ordner „Oerik“ in seinen Dokumenten (darin `Lesehinweise.md`) oder Ordner „Oerik“ in seinem Google Drive | Bücher, die im Regal auf D&D Beyond fehlen: Volo's, Mordenkainen's, die Greyhawk-Quellen, Abenteuer. Die Lesehinweise nennen je Buch Seitenzählung, Textschicht und Fundstellen und tragen die Namenstafeln. Lesbar nur in einem Chat, den der Weltenhüter mit dem Ordner verbindet, sonst gilt der Behelf nach 7.1. Über Google Drive kommt nur der Text von Büchern mit Textschicht bis etwa 45 MB an, keine Seitenbilder | 7.1, 20.3 |
| Glossar-Auszug | glossar.js `--auszug`, `--liste` | ein Eintrag für den Chat, Stichwortliste für den Spielstand | 4.6 |
| Bühnen und Profile | buehne.js | feste Karten, Kampfdaten, die erste Karte eines Kampfes | 12.6, W 12.6 |
| Buchbinder | seite/bauen.js | Spielerbuch und Ablage bauen, Dateien hin und zurück, Umzug von vor 4.2; `--kern` misst den Kern, schreibt das Kapitel „Stand der Dinge“ und macht die Verlustprobe | W 4.7, W 21.4, W 21.5, W 21.7, W 22.2 |
| Zeichen | seite/zeichen.js, seite/ikonen.svg | die 70 Umrisszeichen des Gepäcks, nur im Repository zu ändern | 4.4, W 4.4 |
| Kacheln | kacheln-bauen.js | baut kacheln.js aus den zehn Geländesets, nur im Repository | 12.6 |

**Freiwillig**

| Werkzeug | Wo | Was man braucht | Regel |
|---|---|---|---|
| Klangzeile | Links im Spielstand | eigene Playlists bei einem Dienst, der im Hintergrund weiterspielt | 3.2 |
| Klangtisch Live | Repository wegwart-klang | eigene Kopie des Repositorys, Spotify Premium und eine Spotify-App (README dort); kennt neun Ortstypen statt der acht Stimmungen. Die Signaldatei ist öffentlich: Wer keinen Ort verraten will, setzt nur den Ortstyp | 3.2 |
| Gemälde malen | Skill „Selbstmalende Gemälde“ und Malkasten, beide beim Weltenhüter | Der Weltenhüter teilt beides. Ohne sie gibt es keine Gemälde, und das Spiel läuft genauso | 3.3, W 21.6 |

**Außerhalb des Koffers** steht D&D Beyond: Jede Figur wird in der Kampagne des Weltenhüters gebaut, und ihr Bogen kommt als PDF ins Projekt (7.2, 7.4). Bücher legt der Weltenhüter selbst in seinen Ordner. Die Spielleitung vervielfältigt keine Bücher: Sie liest, was bereitliegt, und trägt nur Eckdaten und eigene Worte weiter (W 7.3).

**Nachschlagewerke** (seit 4.6). Die Zauberbibliothek, die Verzeichnisse der Wesen, der Gegenstände, der Orte und der Personen und die Karte von Oerik sollen auch tragen, wenn D&D Beyond oder der Rechner des Weltenhüters nicht erreichbar sind. Die Grenze: Wortlaut und volle Werte der Bücher werden nie abgeschrieben. Im Wortlaut steht nur das freie Grundregelwerk (SRD 5.1, die Regeln von 2014, CC BY 4.0, mit der Namensnennung aus seiner Präambel); alles andere bekommt Kurzangaben in eigenen Worten und die Fundstelle. Auf Karten und in Verzeichnissen steht nur öffentlich Bekanntes (Regelwerk 20.3).
- **Bauen.** Die Bauskripte liegen im jeweiligen Artefakt unter `bau/`: `bau_wesen_srd.py.txt`, `bau_gegenstaende_srd.py.txt` und `bau_personen.py.txt`, das die Liste der Personen selbst trägt und die ganze Seite baut. Die Skripte der Karte und des Ortsverzeichnisses liegen mit ihren Eingangsdaten im Artefakt der Karte unter `bau/werk/` und `bau/daten/`, daneben ihre Übergabe (`uebergabe.md`). Die Skripte für Wesen und Gegenstände lesen die Seite, wie sie im Artefakt steht, hängen die Daten an und ändern Stil, Text und Code nur, wenn die Erweiterung noch fehlt. Datenquelle für das freie Grundregelwerk SRD 5.1 ist `github.com/5e-bits/5e-database`, Ordner `src/2014/en` (Aufbereitung unter MIT-Lizenz). Baut ein anderes Werkzeug ein Verzeichnis neu, laufen die Skripte danach noch einmal.
- **Nachführen.** Nennt ein Tisch oder die Chronik einen Herrscher anders als das Buch, wird es im Skript des Personenverzeichnisses nachgetragen (Regelwerk 20.3). Wer ein Buch weiterliest, trägt Eckdaten in eigenen Worten mit Quelle im Greyhawk-Wissen nach: Datei `wissen/greyhawk.md` im Artefakt der Karte, zu holen mit `list_files` und `read_file` (4.7).

**Lücken, Stand 4.6.** Sie stören das Spiel nicht, aber man sollte sie kennen:
- Der Kartentisch kennt die Gebiete `sumpf`, `totholz`, `wald`, `berge`, `felder`, `mangroven`; für Wüste, Eis und Steppe gibt es noch keine Gebietsart. Bis dahin stehen sie als Name und Notiz auf der Karte. Große Strecken zeigt er nur im Ausschnitt.
- Klangtisch Live hat keine Ortstypen für Gebirge, Wüste und Eis.
- Eine Spielleitung ohne Artefakt-Werkzeuge, Code oder Widgets spielt nach 22.1 in Textform. Eine, die Buch und Ablage nur gerade nicht schreiben kann, sichert mit einem Zwischenhalt ins Projekt (4.7, Fall 2).
- Ein Projektchat ohne Netzzugriff ändert weder die Chronik noch den Eingang. Für die Chronik gibt es den Chroniknachtrag (18), für eine neue Fassung den Weg unten.
- Das Projektwerkzeug überschreibt ein Dokument nur, wenn der Chat es mit `project_read` ganz gelesen oder selbst aus einer Datei geschrieben hat, und es verbietet, ein Dokument zu löschen, um es neu anzulegen. Was das für Spielstand und Spoilerdatei heißt, steht in 21.3, Schritt 11.
- Ein Artefakt mit öffentlichem Link lässt sich mit den Werkzeugen im Chat nicht neu veröffentlichen, und in die Chronik schreibt dann niemand außer dem Weltenhüter (Regelwerk 18).
- Für die Karte eines Gewölbes außerhalb des Kampfes gibt es noch keinen Tisch. Bis dahin beschreibt die Spielleitung auf (Karte), was die Figur vom Gewölbe kennt.
- Die Zauberbibliothek ist noch nicht geteilt: Bisher öffnen sie nur der Weltenhüter und seine Spielleitung. Bis er sie teilt, gelten an anderen Tischen für Zauber von Wizards of the Coast D&D Beyond und für Valda's Player Packs die Beschlüsse in 7.3; die Zauber aus Deep Magic sind ohnehin alle noch offen.
- Die Umrechnungstafel (7.3) ist noch nicht gegen den Leitfaden „Converting to SRD v5.2.1“ von Wizards of the Coast gegengelesen. Von den Karten zu Zaubern von Wizards of the Coast sind 14 noch nicht gegen den Wortlaut gelesen (W 7.3).
- Volo's und Mordenkainen's hat nur der Weltenhüter, Volo's als deutschen Scan, Mordenkainen's als Bilddatei ohne Suche. Werte liest die Spielleitung vom Seitenbild; andere Tische spielen den Behelf nach 7.1.
- Die Verzeichnisse der Wesen und der Gegenstände tragen Werte nur für das freie Grundregelwerk SRD 5.1: Kampfwerte für 323 Wesen und Wirkung für 249 Gegenstände, im englischen Wortlaut. Für alles andere nennen sie Eckdaten und Fundstelle: Es fehlen 173 Wesen des Monster Manual, 51 Gegenstände des Dungeon Master's Guide und alle anderen Bücher, dazu die deutschen Namen außerhalb von Volo's; dafür liest die Spielleitung im Buch. Kurzangaben in eigenen Worten für die übrigen stehen noch aus.
- Das Verzeichnis der Personen ist noch nicht mit allen Tischen abgeglichen, und Klasse und Stufe nennt es nur bei einem Teil der Herrscher. Nennt ein Tisch einen Herrscher anders, meldet seine Spielleitung es dem Weltenhüter (Regelwerk 20.3).
- Karte und Verzeichnis der Orte führen 21 Orte aus Quellenbüchern und 24 Schauplätze, die noch nicht unter `orte` in der Chronik stehen.
- Auch die Verzeichnisse und die Karte von Oerik sind noch nicht geteilt, und das Greyhawk-Wissen liegt als Datei im Artefakt der Karte: Bisher erreichen sie nur der Weltenhüter und seine Spielleitungen.
- Die Listen von D&D Beyond sind nicht für jede Quelle verlässlich: Für Explorer's Guide to Wildemount nannten sie fünf Wesen. Gezählt wird dann am Buch.
- Die Herausforderungsgrade aus Mordenkainen's sind in den Lesehinweisen noch nicht erfasst.

**Eine neue Fassung veröffentlichen** (Weltenhüter): 1. Tische im Repository ändern, testen (`for t in test/*.test.js; do node $t; done`), Commit als neuer `tische_stand`. 2. Regelwerk und Werkstatt als docs/regelwerk-<Version>.md und docs/werkstatt-<Version>.md schreiben, Änderungen in docs/aenderungen.md. 3. Eingang neu veröffentlichen (`publish_files`, 4.7): die Seite seite/eingang.html als `index.html` mit den Dateien regelwerk.md, werkstatt.md und vorlage-projektanweisungen.md aus docs/ und den Tischen unter tische/ (die .js-Dateien der Tische, wuerfel.js und seite/proben.js); hat sich seite/chronik.html geändert, auch die Chronikseite, ihre Datenbank bleibt. Beide Seiten ändert kein Projektchat ohne Netzzugriff (4.7): Der Weltenhüter öffnet dafür einen Chat von der Seite des Artefakts aus oder erlaubt den Netzzugriff. Solange eine Seite einen öffentlichen Link hat, geht auch das nicht: Er nimmt ihn vorher zurück und teilt den Eingang danach neu. 4. meta/welt in der Chronik setzen (`regelwerk_version`, `tische_stand`, Adressen), im selben Chat wie die Chronikseite. Sonst reicht der Weltenhüter auf der Chronikseite einen Nachtrag ein, der nur meta/welt nennt: `{"figur":"weltenhueter","eintraege":[{"sammlung":"meta","id":"welt","daten":{"regelwerk_version":"<Version>","tische_stand":"<Commit>"}}]}`. 5. Im Projekt jeder Figur Regelwerk und Werkstatt ersetzen: die Dateien aus dem Repository im Stand von main holen (docs/; der `tische_stand` liegt einen Commit davor und trägt die neuen Texte noch nicht), je Dokument erst `project_read`, dann `project_write` mit `local_path` (21.3, Schritt 11; beide alten Texte stehen dann im Verlauf, zusammen rund 250.000 Zeichen). Die Kopfzeile jeder Datei nennt ihre Fassung; sie muss `regelwerk_version` aus meta/welt gleichen. Billiger ist es von Hand: Der Spieler speichert beide Dateien im Eingang und ersetzt sie im Projekt. Die Ablage bleibt dabei, wie sie ist (21.5); neue Spieler holen beide im Eingang. 6. Ändert die Fassung die Seite von Buch oder Ablage, baut jede Spielleitung sie beim nächsten Sitzungsende neu (4.7).
