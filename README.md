# Wegwart-Karte

Pergament-Tische für die geteilte Welt „Hold der Seeprinzen“, ein D&D-5e-Textabenteuer mit Claude als Spielleitung. Alle zeigen nur, was die Figur weiß, und werden vorher mit derselben Prüfung freigegeben:

- **Kartentisch** (`karte.js`): Pergamentkarte mit Orten, Wegen und Reisezeiten, Gebieten, Küste und Notizen. Wer einen Ort antippt, sieht, was die Figur über ihn weiß, und die Karte zoomt hinein. Ein Knopf fragt die Spielleitung per `sendPrompt` nach dem Glossareintrag.
- **Gepäck** (`inventar.js`): Geldbeutel, Rationen, Traglast je Träger und die Dinge, die die Figur bei sich hat, mit dem, was sie darüber weiß (Abschnitt „Gepäck“).
- **Logbuch** (`questlog.js`): Fristleiste mit Mondphasen aus dem Weltkalender, Termine, Aufträge mit Etappen, gegebenes Wort und Erfahrung (Abschnitt „Logbuch“).
- **Rast** (`rast.js`): Rastübersicht im Stil des Würfelkastens mit Trefferwürfeln, Lied der Erholung, Essen, Klassenfähigkeiten, Zaubern und Zaubervorbereitung (Abschnitt „Rast“).
- **Glossar** (`glossar.js`): alle Schlüsselwörter nach Personen, Gruppen, Orten, Dingen und Gerüchten, mit dem, was die Figur weiß, Posten für Posten mit Herkunft und Welttag, aus `02_glossar.md`, dem Glossar-Abschnitt des Spielstands in eigener Datei (Abschnitt „Glossar“). Die Knöpfe „Glossar … ↗“ der anderen Tische führen hierher. Dieselbe Datei füllt das Glossar im Spielerbuch.
- **Spielerbuch** (`seite/buch.html`, gebaut mit `seite/bauen.js`): eine Seite je Figur, ein Artefakt mit Datenbank, mit Glossar, Logbuch, Gepäck, Karte und „Was bisher geschah“; die Tische sind eingebaut (Abschnitt „Das Spielerbuch“).
- **Wissensbuch** (`wissensbuch.js`, nur Prüfung): Wer weiß was im Revier, Figur für Figur mit Herkunft und Welttag, in der Spoilerdatei; die Prüfung sperrt Wissen ohne Weg (Abschnitt „Wissensbuch“).

## Aufruf

```html
<h2 class="sr-only">Karte: Hool-Hinterland</h2>
<div id="karte">Karte lädt …</div>
<script>var KARTE={titel:'Hool-Hinterland', stand:'Stand: Tag 8', orte:[…], wege:[…]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/karte.js';document.head.appendChild(s);</script>
```

Die Datei wird aus einem Skript heraus nachgeladen, nicht über ein geschriebenes `<script src>`-Tag: Das Tag kam im Visualizer-Widget nicht an, das eingefügte Skript lädt (geprüft am 19.10.2026).

## Weltraster

- 1 Einheit ist 1 Stunde zu Fuß, etwa 4,5 km. Monmurg liegt bei (0, 0), x wächst nach Osten, y nach Süden.
- Eine Lage, die einmal festgelegt ist, bleibt. Jede Figur sieht denselben Ort an derselben Stelle.
- Die Karte ist eine Skizze: Die Reisezeiten an den Wegen gelten, die Abstände sind ungefähr.

## Felder

| Feld | Inhalt |
|---|---|
| `titel`, `stand` | Kartusche mit Maßstab; `titelEcke`: `ol`, `ul` (Standard), `or`, `ur` |
| `kartenquelle`, `trassenname` | Legendentexte für rote Tinte („Varrins Karte“) und die geplante Trasse |
| `ausschnitt` | `[xMin, yMin, xMax, yMax]`; Orte außerhalb erscheinen als Randzeiger mit Reisezeit |
| `orte[]` | `id`, `name`, `x`, `y`, `art`, `bekannt`, `notiz`; `quelle` (wer es erzählt hat, Pflicht bei `gehoert`), `namen` (weitere Schreibweisen aus dem Spielstand, nur für die Prüfung); dazu `beschriftung` (Zeilenumbruch mit `\n`), `lage` (Wunschseite: `r`, `l`, `o`, `u`, `or`, `ol`, `ur`, `ul`), `rang` (2 = erst beim Zoomen), `zeigerLage: 'u'` (Randzeiger unter dem Weg) |
| `wege[]` | `von` und `nach`, oder `von` und `bis: [x, y]`, oder `punkte`; dazu `art`, `bekannt`, `quelle`, `zeit`, `ueber` (Zwischenpunkte), `trasse` (geplanter Admiralsweg), `pfeil`, `rang`, `zeitBei` (0 bis 1), `zeitSeite` (1 oder −1) |
| `gebiete[]` | `art`, `punkte`; dazu `name`, `beschriftung: [x, y]`, `groesse`, `sperren`, `nebel` (Nebelbänke im Wald) |
| `kueste` | `linie` von Kartenrand zu Kartenrand, `meer` (`s`, `n`, `o`, `w`); dazu `name`, `beschriftung` |
| `notizen[]` | `text` oder `zeilen: [{text, tinte, durch}]`; Lage über `x`, `y` oder `ort` (sucht einen freien Platz daneben); dazu `tinte` (`kohle`, `varrin`), `durch`, `verwischt`, `rang` |

- Ortsarten: `stadt`, `furt`, `gasthaus`, `pfahldorf`, `dorf`, `gut`, `haus`, `wehr`, `pfahl`, `echsen`, `toterbaum`, `hain`, `steine`, `ruine`, `stelle`, `punkt`
- Wegarten: `strasse`, `damm`, `knueppeldamm`, `wasser`, `graben`, `pfad`, `unvermessen`
- Gebietsarten: `sumpf`, `totholz`, `wald`, `berge`, `felder`, `mangroven`
- `bekannt`: `gesehen` (Kohle), `karte` (rote Kanzleitinte), `gehoert` (gestrichelt, Name kursiv). Ohne gültiges `bekannt` wird ein Ort oder Weg nicht gezeichnet.

## Beschriftung

Für Ortsnamen und Wegzeiten sucht der Kartentisch selbst eine freie Stelle; `lage` und `zeitBei` sind nur Wünsche. Gebietsnamen, Küste und Notizen mit `x` und `y` stehen fest. Was `rang: 2` trägt, erscheint erst beim Hineinzoomen oder auf breiten Bildschirmen.

## Darstellung

Pergament, Tinte und Gelände bleiben im hellen und dunklen Modus gleich, das Pergament wird im dunklen Modus etwas gedämpft. Schriften: EB Garamond und IM Fell English von Google Fonts, sonst Georgia.

## Gepäck

```html
<h2 class="sr-only">Inventar: Fürchtegotts Gepäck</h2>
<div id="gepaeck">Gepäck lädt …</div>
<script>var INVENTAR={titel:'Fürchtegotts Gepäck', stand:'Stand: Tag 8', geld:{ga:19, sm:9}, traeger:[…]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/inventar.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `titel`, `stand` | Kopf des Pergaments; `figur` (Name, frei) |
| `geld` | Münzen der Hold: `pm` Highlord, `ga` Goldadmiral, `em` Bright Ship, `sm` Silber, `km` Common |
| `esser` | wie viele von den Rationen essen (Standard 1); daraus „reicht X Tage“ |
| `traeger[]` | `id`, `name`, `art` (`figur`, `gefolge`, `lasttier`, `reittier`, `lager`), `dinge[]`; dazu `namen`, `staerke` und `faktor` (Traglast nach Regelwerk 9.5: STÄ × Faktor × 2,5 / 5 / 7,5 kg; Lasttiere Faktor 2), `ort` |
| `dinge[]` | `name`, `art`; dazu `namen`, `anzahl`, `kg` (je Stück), `notiz` (was die Figur weiß), `wortlaut` (Text eines Schriftstücks), `herkunft`, `quelle`, `glossar` (Stichwort für den Knopf „Glossar …“) |

- Arten der Dinge: `waffe`, `ruestung`, `kleidung`, `kostuem`, `instrument`, `werkzeug`, `schreibzeug`, `licht`, `seil`, `behaelter`, `schlafzeug`, `tierbedarf`, `boot`, `ration`, `proviant`, `trank`, `papier`, `brief`, `karte`, `zeichen`, `andenken`, `fund`, `wertsache`, `spiel`, `sonstiges`. Sie bestimmen Zeichen und Gruppe.
- Rationen sind Dinge der Art `ration`; der Kopf zählt sie je Träger. Ein `lager` (etwas, das nicht im Gepäck ist) ist eingeklappt.

## Logbuch

```html
<h2 class="sr-only">Questlog: Fürchtegotts Logbuch</h2>
<div id="logbuch">Logbuch lädt …</div>
<script>var QUESTLOG={titel:'Logbuch', stand:'Stand: Tag 8', heute:8, frist:28, welttag:8, auftraege:[…]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/questlog.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `titel`, `stand`, `heute` | Kopf; `heute` ist der Tag, wie das Abenteuer ihn zählt |
| `frist`, `fristText` | Tag der Frist und wofür; ohne Frist zeigt die Leiste die Tage um heute |
| `welttag` | Welttag von heute. Daraus rechnet das Logbuch Datum und Mondphasen (Regelwerk 8.1). |
| `ep` | `[Stand, Grenze, Stufe]`, z. B. `[900, 2700, 4]` |
| `termine[]` | `tag`, `text`; dazu `quelle`, `mond` (`voll`, `dunkel`, `zunehmend`, `abnehmend`) |
| `auftraege[]` | `id`, `titel`, `art` (`haupt`, `neben`, `faden`, `gefahr`), `status` (`offen`, `erledigt`, `gescheitert`, `ruht`); dazu `von`, `frist`, `lohn`, `text`, `quelle`, `glossar` (Liste), `etappen[]` mit `text`, `erledigt`, `gescheitert`, `notiz`, `quelle` |
| `wort[]` | `text`, `status` (`offen`, `gehalten`, `eingeloest`, `gebrochen`); `an` (wem die Figur ihr Wort gab) oder `von` (wer ihr sein Wort gab) |

## Rast

Plant kurze und lange Rast. Trefferwürfel würfelt der Spieler einzeln wie am Tisch, das Lied der Erholung und Heilzauber würfelt der Kasten mit; Heldenmut lässt einen Trefferwürfel neu werfen. Dazu Essen, Versorgung von Tieren und Gefolge, Klassenfähigkeiten, Zauber während der kurzen Rast oder vor und nach der langen, und Zaubervorbereitung. Das Ergebnis geht als „Rast #nr · …“ an die Spielleitung; die Nummer teilt sich den Zähler mit dem Würfelkasten (Repository wegwart-wuerfel). Die Rast liegt hier, weil sie zu den Tischen des Spiels gehört; sie braucht keine Spoilerprüfung, denn sie zeigt nur Werte vom Bogen und den Zustand der Figur.

```html
<h2 class="sr-only">Rast: Fürchtegott in Hollos Hütte</h2>
<div id="rast">Rastübersicht lädt …</div>
<script>var RAST={nr:7,figur:'Fürchtegott',ort:'Hollos Hütte',tp:[15,21],tw:[2,3,8],kon:1,plaetze:[[3,4],[2,2]],lied:{name:'Lied der Erholung',w:6}}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/rast.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `nr`, `figur`, `tp`, `tw` | Pflicht. `tp: [aktuell, Maximum]`, `tw: [frei, gesamt, Seiten]` oder eine Liste davon (mehrere Klassen) |
| `kon` | KON-Modifikator für Trefferwürfel |
| `ort`, `erschoepfung`, `hunger` | Anzeige; `hunger: [Tage ohne Essen, Grenze]` |
| `plaetze` | je Grad `[frei, Maximum]`; `pakt: [frei, Maximum, Grad]` für Paktmagie (kehrt bei kurzer Rast zurück) |
| `ressourcen[]` | `name`, `frei`, `max`, `rast` (`kurz` oder `lang`: wann sie zurückkommt) |
| `lied` | `name`, `w`: zusätzlicher Würfel bei kurzer Rast, wenn Trefferwürfel ausgegeben werden (Song of Rest) |
| `faehigkeiten[]` | `name`, `rast` (`kurz`, `lang`, `beide`), `art` (`heilung` mit `wuerfel`, `mod`; `plaetze` mit `summe`, `bisGrad` wie Arcane Recovery; `pool` mit `frei`, `max`, `einheit` wie Lay on Hands; `hinweis`), `text` |
| `zauber[]` | `name`, `grad`, `wann` (`kurz`: während der kurzen Rast, `vor`/`nach`: vor oder nach der langen), `ziele` (Anzahl), `heilung`, `mod`, `hoeher` (Würfel je Grad darüber), `ritual`, `wirkung` |
| `ziele` | wer in der Nähe ist (für Zauber und Fähigkeiten); die Figur steht immer dabei |
| `vorbereiten` | für Zauberklassen: `anzahl`, `liste` (`[[Name, Grad], …]`), `vorbereitet`, `immer` |
| `essen` | `rationen` (dabei), `gepaeck` und `traeger` (bei Tier oder Gefolge), `heute` (schon gegessen), `mahlzeit` und `preis` (Essen vor Ort) |
| `versorgung[]` | `name`, `text`, `standard` (vorausgewählt, Standard ja): Tiere und Gefolge |
| `kurz`, `lang` | `true` oder ein Sperrgrund als Text (z. B. höchstens eine lange Rast in 24 Stunden) |
| `start` | `'lang'`, um mit der langen Rast zu öffnen |
| `held` | `true`, wenn die Figur Heldenmut hat |

Beispielnachrichten: „Rast #7 · Kurze Rast · Trefferwürfel 2 × W8+1: 5+1, 3+1 = 10 · Lied der Erholung W6: 4 · TP 8 → 21/21 · Trefferwürfel übrig 0/3 · isst eine Ration“ und „Rast #8 · Lange Rast · isst vorher eine Ration · danach Aid (Grad 2) auf Fürchtegott, Hollo und Pfeffer · Pfeffer versorgt (Hafer oder Weide)“. Die lange Rast ist ein Plan: Was in der Nacht geschieht und was am Morgen zurückkommt, erzählt die Spielleitung.

## Glossar

Eine Datei `02_glossar.md`: der Glossar-Abschnitt des Spielstands in eigener Datei, als Text (Grammatik unten), den der Tisch selbst liest. Zwei Formen aus derselben Datei:

- **Auszug** (Kopfzeile mit `Auszug: 1 von 64`): ein Eintrag mit allen Posten, aufgeklappt. Querverweise auf Einträge, die nicht mitkommen, fragen die Spielleitung („Glossar <Name> ↗“), der Fuß „Ganzes Glossar ↗“ ebenso. Das ist die Antwort auf **Glossar <Stichwort>** und auf die Knöpfe „Glossar … ↗“ der anderen Tische. `node glossar.js --auszug "<Name>" 02_glossar.md` schreibt den Text (Anführungszeichen bei Namen mit Leerzeichen).
- **Ganzes Glossar**: alle Einträge mit Kurzzeile, Haltung und Gefahrzeichen, nach Rubriken, mit Suche; ein Tipp klappt den Eintrag an Ort und Stelle auf, Querverweise springen hin. Als Widget nur auf Wunsch („Glossar hier“), weil die ganze Datei durch den Chat geht; die Antwort auf **Glossar** ohne Stichwort ist der Link zum Spielerbuch (unten), das dieselbe Form zeigt. Der Fuß „Ganzes Glossar ↗“ eines Auszugs schickt „Glossar“.

Aufruf im Widget, der Text unverändert zwischen den Tags:

```html
<h2 class="sr-only">Glossar: was Fürchtegott weiß, Stand Tag 12</h2>
<div id="glossar">Glossar lädt … Falls nicht, frag nach dem Glossar als Text.</div>
<script type="text/plain" id="glossar-text">
*Stand: Tag 12 · Gefahr nach Stufe 3 · Figur: Fürchtegott*

### Personen
- **Ksshar** (verbündet) · auch: der Echsenmann vom Knüppeldamm · Ort: Schuppenkreis · Logbuch: Die Gelbkehlen · siehe: Ssark
  Späher der Gelbkehlen, dein Vertrauter.
  - Späher der Gelbkehlen, der Echsenmann vom Knüppeldamm. (gesehen, Tag 3)
  - Hat Brasks Boote gesehen und die Köpfe gezählt. (von Ksshar, Tag 4)
</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/glossar.js';document.head.appendChild(s);</script>
```

| Zeile | Form |
|---|---|
| Kopf | `*Stand: Tag 12 · Gefahr nach Stufe 3 · Figur: Fürchtegott*`, beim Auszug dazu `Auszug: 1 von 64`. `Gefahr nach Stufe`: die Stufe der Figur, auf der 🩸 und ☠️ eingeschätzt sind (Regelwerk 12.2); Pflicht, sobald ein Zeichen vorkommt |
| Rubrik | `### Personen`, `### Gruppen`, `### Orte`, `### Dinge`, `### Gerüchte` |
| Eintrag | `- **Name** ☠️ (Haltung) · auch: …; … · Ort: … · Logbuch: …; … · siehe: …; … · Post: Ort – wie`. 🎭 vor dem Namen: Figur eines anderen Spielers. Hinter dem Namen 🩸 (harter Gegner) oder ☠️ (jenseits der Stufe). Haltung in Klammern: verbündet, freundlich, feindlich, gefangen, tot, vermisst, unklar; sie ist der Eindruck der Figur, nicht die Wahrheit. Felder trennt ` · `, Listen trennt `; ` (Namen und Titel tragen Kommas). `auch:` weitere Schreibweisen aus dem Spielstand (Suche, Querverweise, Stichwörter der anderen Tische), `Ort:` Name auf der Karte, `Logbuch:` Titel von Aufträgen, `siehe:` andere Einträge, `Post:` wo ein Brief die Person erreicht |
| Kurzzeile | eingerückt, ohne `- `: eine Zeile, die in der Liste unter dem Namen steht |
| Posten | `  - Text. (Herkunft, Tag n)`: ein bis zwei Sätze, Zitate in „…“. Herkunft: `gesehen`, `von X`, `gelesen: X`, `laut X` (eine Karte), `Gerücht`, `Gerücht von X`. Tag: der Welttag, an dem die Figur es erfuhr |

Was vor der ersten Rubrik steht, übergeht der Tisch bis auf die Kopfzeile (Hinweise für die Spielleitung). Der Tisch zeigt die Posten nach Tag, jeden mit Herkunft; die Gefahr nur als Zeichen am Namen, dessen Beschriftung die Stufe nennt („jenseits deiner Stufe (eingeschätzt auf Stufe 3)“); die Haltung als Satz der Figur („Fürchtegott hält Brask für feindlich.“). Knöpfe: Orte haben **Karte ↗**, Dinge **Gepäck ↗**, Einträge mit `Logbuch:` **Logbuch ↗**. Spielhandlungen (nachfragen, einen Brief schreiben) gibt es im Glossar nicht; sie gehören an den Spieltisch (Regelwerk 5, 17.5).

Node: `node glossar.js --auszug <Name> 02_glossar.md` (Text eines Auszugs), `--json 02_glossar.md` (das gelesene Objekt; Zeilen, die der Tisch nicht versteht, auf stderr), `--text daten.json` (Objekt als Text, zum Umstellen). Zur Not liest der Tisch statt des Textes ein Objekt `var GLOSSAR={…}` mit den Feldern aus `--json`.

## Das Spielerbuch

`seite/buch.html` ist das Spielerbuch einer Figur (Regelwerk 3.0, 4.7): ein Artefakt auf claude.ai mit eigener Datenbank, privat, bis der Spieler es teilt. Oben fünf Reiter: Glossar, Logbuch, Gepäck, Karte, Geschichte; die Tische sind dieselben wie im Chat (ohne die Rast), ihre Knöpfe „Glossar … ↗“ blättern im Buch. `#karte`, `#logbuch` (auch `#questlog`), `#gepaeck` (auch `#inventar`), `#geschichte` oder `#<glossar-id>` in der Adresse öffnen einen Teil oder einen Eintrag, wo die App den Anker weitergibt. Das Buch zeigt den Stand des letzten Sitzungsendes.

| Sammlung/Dokument | Inhalt |
|---|---|
| `meta/buch` | `titel`, `stand`, `stufe`, `figur` |
| `meta/glossar`, `glossar/<id>` | das Glossar: je Eintrag `reihe`, `name`, `art`, `kurz`, `haltung`, `gefahr`, `namen`, `ort`, `logbuch`, `siehe`, `post`, `wissen[]`, `spieler`; meta mit `titel`, `stand`, `heute`, `stufe`, `figur`, `anzahl` |
| `tische/karte`, `tische/gepaeck`, `tische/logbuch` | die Objekte von Kartentisch, Gepäck und Logbuch, Felder wie oben |
| `geschichte/<id>` | „Was bisher geschah“: `reihe`, `titel` (die Überschrift „Sitzung N, Tag …“), `text` (Markdown: Punkte, Unterpunkte, Zitate mit `>`, fett, kursiv) |
| `sl/<id>` | Archiv der Spielleitung (`reihe`, `titel`, `text`), etwa Würfelprotokolle; das Buch zeigt es nicht |

- Bauen: `node seite/bauen.js --seite --titel "Fürchtegotts Buch" > buch.gebaut.html` (`--titel` ist der Titel vor dem Laden, sonst „Spielerbuch“; baut `glossar.js`, `karte.js`, `inventar.js`, `questlog.js` und die Zeichen aus `seite/ikonen.svg`, Tabler Icons, MIT, ein). Veröffentlichen mit dem Artifact-Werkzeug und `capabilities: {db: {rules: [{path: "", read: "view", write: "owner"}, {path: "sl", read: "owner", write: "owner"}]}}`. Eine neue Fassung der Tische heißt: neu bauen, dieselbe Adresse neu veröffentlichen.
- Füllen: `node seite/bauen.js --db <ordner> 02_glossar.md 02_karte.json 02_inventar.json 02_questlog.json 02_geschichte.md --sl 03_archiv.md` schreibt `<ordner>/<sammlung>/<id>.json` (die Art jeder Datei erkennt es selbst; Karte, Gepäck und Logbuch als `.json` oder als Markdown mit json-Block; die Geschichte in Abschnitten `### Sitzung …` unter `# Was bisher geschah`, das Archiv in `## …`) und `meta/buch` (`--stand`, `--stufe`, `--titel` überschreiben). Spielleitungswissen nimmt es nur über `--sl` an: Dateien `03_…`, ein „# Archiv der Spielleitung“ oder ein Wissensbuch als gewöhnliche Datei lehnt es ab, ebenso eine Datei, die keine Geschichte ist.
- Einspielen: `node seite/bauen.js --batches <ordner> --alt <db-ordner> versionen.txt` schreibt je Zeile ein `writes`-Array für ArtifactData `batch` (höchstens 50 Schreibvorgänge und etwa 900 KB je Batch): `set` mit `file_path` und, wo das Dokument schon besteht, `if_version`; Einträge, die es nicht mehr gibt, als `delete`. `--alt` (der Ordner, den `list` mit `out_dir` gefüllt hat) lässt unveränderte Dokumente weg. `versionen.txt` ist der Text der `list`-Ergebnisse davor (Zeilen `- "id"  750 bytes  version 3  "…/glossar/id.json"`), denn die Dateien von `out_dir` tragen keine Version; json `{"glossar/id": 3}` geht auch. `list` liefert ohne `query.limit` nur 100 Dokumente: für das Glossar `limit` 1000.
- Zurück: `node seite/bauen.js --zurueck <db-ordner> <ordner>` liest, was ArtifactData mit `out_dir` gespeichert hat, und schreibt `02_glossar.md`, `02_karte.json`, `02_inventar.json`, `02_questlog.json`, `02_geschichte.md` und `03_archiv.md` zum Bearbeiten und Prüfen. Hin und zurück ändert nichts (geprüft).
- `node glossar.js --liste 02_glossar.md` schreibt die Stichwortliste für den Spielstand (je Eintrag Name, Haltung, Zeichen, Kurzzeile, `auch:`).

## Spoilerschutz

Kartentisch, Gepäck und Logbuch dürfen nur zeigen, was die Figur weiß. Für die Karte gibt es drei Sperren:

1. **Kartendaten kommen aus dem Spielstand**, nie aus der Spoilerdatei. Alles, was im `KARTE`-Objekt steht, ist im Widget lesbar, auch ohne gezeichnet zu werden. Darum gibt es keine versteckten Felder: Die Prüfung lehnt jedes Feld ab, das die Tabelle oben nicht kennt.
2. **Laufzeitsperre:** `karte.js` zeichnet nur Orte und Wege, deren `bekannt` `gesehen`, `karte` oder `gehoert` ist. Jeder Ort zeigt beim Antippen seine Herkunft: „Selbst gesehen.“, „Aus Varrins Karte.“ oder „Vom Hörensagen (Ssark).“
3. **Prüfung vor jeder Änderung:** `node pruefen.js kartendaten.js 02_spielstand.md 03_spielleitung_SPOILER.md` gibt die Daten frei oder sperrt sie. Die Spoilerdatei wird dabei nur gelesen, nie ausgegeben. Gesperrt wird, wenn
   - ein Ortsname (oder eine Schreibweise aus `namen`) nicht im Spielstand steht,
   - ein Wort oder eine Zahl aus Notizen, Beschriftungen, Gebiets- und Küstennamen nicht im Spielstand steht; steht es in der Spoilerdatei, sagt die Meldung das,
   - eine `id` ein Wort enthält, das nur die Spoilerdatei kennt,
   - eine Reisezeit in keiner Spielstandzeile steht, die beide Orte und die Zahl mit Stunden nennt („Krummer Anker – Süßwasser 3 Stunden“, „vier Stunden“ zählt auch),
   - ein Weg ohne Zeit zwei Orte verbindet, die keine Spielstandzeile verbindet,
   - `gehoert` ohne `quelle` steht oder die Quelle nicht im Spielstand vorkommt,
   - ein Feld, eine Art oder ein Wert nicht erlaubt ist,
   - Spielstand oder Spoilerdatei fehlen.

Die Prüfung läuft nur bei der Spielleitung (Node). Spielstand und Spoilerdatei gehören nie ins Repository und nie ins Widget (`.gitignore`). `test/spoiler.test.js` prüft die Prüfung selbst: echte Daten müssen durchgehen, eingeschleuste Spoiler scheitern.

### Gepäck, Logbuch und Glossar

Dieselbe Prüfung, `node pruefen.js 02_inventar.md …`, `02_questlog.md …` oder `02_glossar.md …`, erkennt die Art an den Daten (`traeger`, `auftraege`; beim Glossar der Text mit seinen Rubriken) und nutzt `wissen.js`. Gesperrt wird, wenn

- ein Wort oder eine Zahl nicht im Spielstand steht oder nur in der Spoilerdatei; ein Feld, eine Art oder ein Wert nicht erlaubt ist (wie bei der Karte),
- ein Name (Ding, Träger) nicht im Spielstand steht; eine Quelle, ein Gegenüber beim Wort oder ein Glossar-Stichwort fehlt (Stichwörter müssen im Glossar stehen: `02_glossar.md` als weitere Datei, sonst der Abschnitt „Glossar“ des Spielstands),
- **Belegprüfung:** ein Satz aus Notiz, Text, Etappe, Termin oder Wort keine Zeile im Spielstand hat, die mindestens 70 % seiner Inhaltswörter trägt (Wortlaut eines Schriftstücks: 90 %). So lässt sich aus verstreuten Wörtern nichts Neues zusammensetzen,
- **Wortpaare:** ein Satz zwei benachbarte Inhaltswörter mit der Spoilerdatei teilt, die der Spielstand nicht in derselben Reihenfolge nah beieinander hat („verrät … Figur“, „versunkene Kapelle“),
- **Lore-Check (Logbuch):** ein Termin mit `mond` oder mit „Vollmond“/„Dunkelmond“ im Text nicht auf diese Mondphase fällt, `stand` nicht zu `heute` passt, die Stufengrenze in `ep` nicht Regelwerk 11.1 entspricht, EP, Frist, heute oder ein Termintag nicht im Spielstand stehen (einen Termin, den der Weltkalender festlegt, belegt der Mond).

- **Glossar:** Die Datei ist selbst Spielstand (der Abschnitt „Glossar“ in eigener Datei); darum vergleicht die Maschine hier keine Wörter mit dem übrigen Spielstand, sondern prüft Form, Namen, Lore und Verweise. Gesperrt wird, wenn der Text eine Zeile hat, die der Tisch nicht versteht (Rubrik, Haltung, Feld, Posten ohne Herkunft, Eintrag vor der ersten Rubrik); ein Name, den der übrige Spielstand nicht nennt (auch nicht unter `auch:`), ein Wort trägt, das nur die Spoilerdatei kennt; eine Kurzzeile oder ein Posten ein Wort trägt, das in der Spoilerdatei fett oder in einer Überschrift steht (meist ein Name) und sonst nirgends im Spielstand; eine Quelle (`von X`, `gelesen: X`, `laut X`) weder im übrigen Spielstand noch als Eintrag im Glossar steht; ein Logbuch-Titel nicht im Spielstand vorkommt; Selbstgesehenes eine fremde Quelle nennt; ein Tag nach heute liegt oder es ihn nicht gibt; ein Gefahrzeichen vorkommt, ohne dass der Kopf `Gefahr nach Stufe N` trägt, oder diese Stufe nicht die heutige Stufe der Figur ist (Regelwerk 12.2: nach dem Aufstieg alle Zeichen neu einschätzen und die Stufe im Kopf anpassen); 🎭 bei der eigenen Figur steht oder bei einer, die nicht unter `figuren` in der Weltchronik steht (Figurenliste mitgeben); ein Name doppelt ist; `siehe:` auf sich selbst oder auf etwas zeigt, das es im Glossar nicht gibt; `Ort:` nicht in den Kartendaten oder `Logbuch:` nicht im Logbuch steht (Kartendaten, Gepäck und Logbuch als weitere Dateien mitgeben; ohne sie bleibt das ungeprüft und die Prüfung sagt es); ein Eintrag keinen gültigen Posten hat (der Tisch würde ihn verschweigen).

Hinweise statt Sperren beim Glossar: Namen, die nur im Glossar stehen (Schlüsselwörter, die die Chronik des Spielstands nicht nennt); ein Gefahrzeichen, das sonst nirgends im Spielstand bei diesem Namen steht; ein Ort ohne Stelle auf der Karte, ein Ding ohne Stück im Gepäck; die Stufe der Figur im Spielstand nicht erkannt; eine Liste der Wörter, die außer im Glossar nur in der Spoilerdatei stehen, zum Überfliegen auf verirrte Namen. Was die Maschine nicht kann: einen wahren, aber nicht erlebten Posten erkennen, der mit gewöhnlichen Wörtern umschreibt, was die Spoilerdatei weiß. Das bleibt die Lektüre der Spielleitung vor dem Eintragen (Regelwerk 4.8).

Für Gepäck und Logbuch zählt `02_glossar.md` als Spielstand mit (als weitere Datei mitgeben): Ihre Glossar-Stichwörter müssen dort als Name oder unter `auch:` stehen, und ihre Sätze dürfen sich auf Posten des Glossars stützen.

Aufruf mit Querverweisen: `node pruefen.js 02_glossar.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_karte.json 02_inventar.json 02_questlog.json figuren.json` (`figuren.json`: `["Name", …]` der Figuren aus der Weltchronik); für die anderen Tische `node pruefen.js 02_inventar.json 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md`.

**Teile des Spielstands:** Weitere Markdown-Dateien ohne Daten (etwa `02_geschichte.md`, „Was bisher geschah“ aus dem Spielerbuch) zählen wie der Spielstand selbst: für Wörter, Belege, Namen und Quellen. So bleibt der immer geladene Spielstand klein, und die Prüfung sieht trotzdem alles, was die Figur weiß (`test/teile.test.js`).

### Wissensbuch: Wer weiß was

Das Glossar sagt, was die Figur weiß und woher. Das Wissensbuch sagt dasselbe für die Leute des Reviers, damit kein NPC im Spiel etwas anspricht, das nie zu ihm gelangt ist (etwa ein Gespräch der Figur mit jemand anderem). Es steht als Abschnitt in der Spoilerdatei (oder in einer eigenen Datei `03_wissensbuch_SPOILER.md`; beides nie im Repository):

```
## Wer weiß was
*Stand: Tag 9 · Figur: Probefigur*
### Jost
- Die Probefigur fragt nach den Lichtern am Weiher. (erlebt, Tag 4)
### Ortwin
- Die Probefigur fragt nach den Lichtern am Weiher. (von Jost, Tag 6; Treffen in der Kapelle)
- Ein neuer Wegwart reitet durch Rohrdorf. (Gerücht, Tag 7; die Fuhrleute reden darüber)
```

(Die erfundene Welt aus `test/wissensbuch.test.js`. Was in keiner Zeile einer Person steht, weiß sie nicht.)

Jede Zeile endet mit der Herkunft: `erlebt` (war dabei), `von X` (X hat es erzählt: eine Figur des Buchs oder die Spielerfigur), `Gerücht` (aufgeschnappt; nach `;` steht, woher). Dazu der Welttag; nach `;` darf ein Grund stehen. Dieselbe Sache steht in jedem Abschnitt in denselben Worten, denn die Prüfung vergleicht Wörter: Bei kurzen Sätzen müssen alle Inhaltswörter wiederkehren, bei längeren darf je fünf eines fehlen.

Prüfung: `node pruefen.js 03_spielleitung_SPOILER.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md` (die Spoilerdatei ist Daten und Spoilerdatei zugleich; das Glossar dazu, damit Wissen der Figur zählt). Gesperrt wird, wenn

- `von X` keine Kette hat: X hat dieselbe Sache nicht in seinem Abschnitt (oder erst später), hat sie der Spielerfigur nicht erzählt (kein Posten „von X“ im Glossar), oder ist die Spielerfigur und wusste sie laut Glossar und Spielstand nicht; X ist niemand (kein Abschnitt, keine Quelle im Glossar, nicht die Figur); die Kette läuft im Kreis,
- ein Gerücht keinen Grund hat, ein Tag nach dem Stand liegt, eine Zeile keine Herkunft hat, eine Figur zwei Abschnitte hat, der Spielstand fehlt.

Hinweise: `erlebt`, ohne dass eine Zeile des Spielstands oder der Spoilerdatei die Figur bei der Sache nennt (war sie dabei?); `von X` zwischen zwei Figuren des Reviers ohne eine Zeile, die beide zusammen nennt, und ohne Grund (wann haben sie gesprochen?); eine Figur, die weder Spielstand noch Spoilerdatei kennt. `test/wissensbuch.test.js` prüft das an der erfundenen Welt.

Die Spielleitung führt das Buch beim Sitzungsende nach: Wer in einer Szene dabei war, bekommt sie als `erlebt`; wer etwas weitererzählt, gibt es mit `von` und Tag weiter. Im Spiel spricht ein NPC nur an, was in seinem Abschnitt steht.

Wortvergleich: Wörter werden ohne Umlaute und Groß-/Kleinschreibung verglichen; Beugungen gelten als gleich, wenn Wortanfang und Länge nahe beieinander liegen („überfallen“ und „Überfall“, nicht „Hain“ und „Haken“). Wer einen Begriff neu einführt, trägt ihn zuerst in den Spielstand ein.

## Versionen

Wie beim Würfelkasten lädt die Spielleitung einen festen Stand (Commit oder Tag). Eine neue Fassung gilt erst, wenn der Weltenhüter sie im Regelwerk einträgt. Kartentisch 1.0, Gepäck 1.0, Logbuch 1.0, Rast 1.0, Glossar 1.0, Wissensbuch 1.0, Spielerbuch 1.0; seit Regelwerk 3.0 gilt ein Stand für alle Dateien. Die Regelwerke liegen unter `docs/`, was sich geändert hat, in `docs/aenderungen.md`.
