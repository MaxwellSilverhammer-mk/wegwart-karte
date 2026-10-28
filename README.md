# Wegwart-Karte

Pergament-Tische für die geteilte Welt „Hold der Seeprinzen“, ein D&D-5e-Textabenteuer mit Claude als Spielleitung. Alle zeigen nur, was die Figur weiß, und werden vorher mit derselben Prüfung freigegeben:

- **Kartentisch** (`karte.js`): Pergamentkarte mit Orten, Wegen und Reisezeiten, Gebieten, Küste und Notizen. Wer einen Ort antippt, sieht, was die Figur über ihn weiß, und die Karte zoomt hinein. Ein Knopf fragt die Spielleitung per `sendPrompt` nach dem Glossareintrag.
- **Gepäck** (`inventar.js`): Geldbeutel, Rationen, Traglast je Träger und die Dinge, die die Figur bei sich hat, jedes mit einer Pixel-Ikone und seinen Werten (Abschnitt „Gepäck“).
- **Logbuch** (`questlog.js`): Fristleiste mit Mondphasen aus dem Weltkalender, Termine, Aufträge mit Etappen, gegebenes Wort und Erfahrung (Abschnitt „Logbuch“).
- **Rast** (`rast.js`): Rastübersicht im Stil des Würfelkastens mit Trefferwürfeln, Lied der Erholung, Essen, Klassenfähigkeiten, Zaubern und Zaubervorbereitung (Abschnitt „Rast“).
- **Handel** (`handel.js`): Händlertisch mit einer Waage: Ware antippen oder auf die Schalen ziehen, die Münzen mit Wechselgeld legt der Tisch selbst auf; Daten in der Form des Gepäcks (Abschnitt „Handel“).
- **Titel** (`titel.js`): Titelbildschirm zu Beginn einer Sitzung, ein Ölgemälde, das sich selbst malt, mit Menü und Spielständen, ein Platz je Figur (Abschnitt „Titel“).
- **Lagebild** (`lagebild.js`): die Lage im Kampf auf Pergament, Feld für Feld (1 Feld = 1,5 m): Gelände, Wesen mit ihrem Zustand in Worten, Bereiche von Zaubern oder Feuer, die Reihenfolge der Initiative. Tippen zeigt Entfernungen; es schickt nichts von selbst (Abschnitt „Lagebild“).
- **Glossar** (`glossar.js`): alle Schlüsselwörter nach Personen, Gruppen, Orten, Dingen und Gerüchten, mit dem, was die Figur weiß, Posten für Posten mit Herkunft und Welttag, aus `02_glossar.md`, dem Glossar-Abschnitt des Spielstands in eigener Datei (Abschnitt „Glossar“). Die Knöpfe „Glossar … ↗“ der anderen Tische führen hierher. Dieselbe Datei füllt das Glossar im Spielerbuch.
- **Spielerbuch** (`seite/buch.html`, gebaut mit `seite/bauen.js`): eine Seite je Figur, ein Artefakt mit Datenbank, mit Glossar, Logbuch, Gepäck, Karte und „Was bisher geschah“; die Tische sind eingebaut (Abschnitt „Das Spielerbuch“).
- **Wissensbuch** (`wissensbuch.js`, nur Prüfung): Wer weiß was im Revier, Figur für Figur mit Herkunft und Welttag, in der Spoilerdatei; die Prüfung sperrt Wissen ohne Weg (Abschnitt „Wissensbuch“).

## Aufruf

```html
<h2 class="sr-only">Karte: Rund um Rohrdorf</h2>
<div id="karte">Karte lädt …</div>
<script>var KARTE={titel:'Rund um Rohrdorf', stand:'Stand: Tag 8', orte:[…], wege:[…]}</script>
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
| `kartenquelle`, `trassenname` | Legendentexte für rote Tinte („Karte des Vogts“) und die geplante Trasse |
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
<h2 class="sr-only">Inventar: Probefigurs Gepäck</h2>
<div id="gepaeck">Gepäck lädt …</div>
<script>var INVENTAR={titel:'Probefigurs Gepäck', stand:'Stand: Tag 8', geld:{ga:3, sm:5}, traeger:[…]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/inventar.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `titel`, `stand` | Kopf des Pergaments; `figur` (Name, frei) |
| `geld` | Münzen der Hold: `pm` Highlord, `ga` Goldadmiral, `em` Bright Ship, `sm` Silber, `km` Common |
| `esser` | wie viele von den Rationen essen (Standard 1); daraus „reicht X Tage“ |
| `traeger[]` | `id`, `name`, `art` (`figur`, `gefolge`, `lasttier`, `reittier`, `lager`), `dinge[]`; dazu `namen`, `staerke` und `faktor` (Traglast nach Regelwerk 9.5: STÄ × Faktor × 2,5 / 5 / 7,5 kg; Lasttiere Faktor 2), `ort` |
| `dinge[]` | `name`, `art`; dazu `namen`, `anzahl`, `kg` (je Stück), `pixel` (eine eigene Ikone, siehe unten) oder `ikone` (eine aus der Sammlung), die Werte `angriff` („+4“), `schaden` („1W8+2 Hieb“), `zweihand` („1W10+2“), `reichweite` („24/96 m“), `rk`, `merkmale` (Liste, etwa `['Laden', 'zweihändig']`), `vorrat` (`[jetzt]` oder `[jetzt, höchstens]`: Ladungen, Munition, Meter Seil, Seiten Tinte) mit `einheit`, `wirkung` (was es regeltechnisch tut, kurz), `zustand` („zerbrochen“, „nass“), außerdem `wortlaut` (Text eines Schriftstücks) und `glossar` (Stichwort für den Knopf „Glossar …“). `notiz`, `herkunft` und `quelle` nimmt der Tisch an, zeigt sie aber nicht (seit 2.0): Was die Figur über ein Ding weiß, steht im Glossar. |

- Arten der Dinge: `waffe`, `ruestung`, `kleidung`, `kostuem`, `instrument`, `werkzeug`, `schreibzeug`, `licht`, `seil`, `behaelter`, `schlafzeug`, `tierbedarf`, `boot`, `ration`, `proviant`, `trank`, `papier`, `brief`, `karte`, `zeichen`, `andenken`, `fund`, `wertsache`, `spiel`, `sonstiges`. Sie bestimmen Zeichen und Gruppe.
- Rationen sind Dinge der Art `ration`; der Kopf zählt sie je Träger. Ein `lager` (etwas, das nicht im Gepäck ist) ist eingeklappt.
- Jede Zeile zeigt eine Pixel-Ikone (32 × 32, im Stil alter Taktikspiele), den Namen mit dem Zustand darunter, rechts den wichtigsten Wert (Vorrat, sonst Schaden, sonst RK) und das Gewicht; eine Anzahl über 1 steht an der Ikone. Antippen öffnet ein Fenster mit der Ikone in doppelter Größe, allen Werten, den Merkmalen, bei Schriftstücken dem Wortlaut (eingeklappt) und dem Glossarknopf. Die Rationen oben zeigen die Ikone der Rationen im Gepäck, gestapelt.
- **Eigene Ikonen:** Ein besonderes Stück trägt seine Ikone im Feld `pixel`: 32 Zeilen zu 32 Zeichen, mit `|` verbunden; `.` ist durchsichtig, `k` die Kontur, jedes andere Zeichen eine Farbe aus `FARBEN` (Materialien mit vier Stufen von hell bis tief: Stahl, Eisen, Rost, Gold, Holz, Dunkelholz, Leder, Papier, Rot, Blau, Grün, Gelb, Knochen, Tuch, Hanf, Stein, Wasser, Flamme, Tinte, Teer, Lila, Schildpatt, Weiß). 16 × 16 geht auch und wird verdoppelt. Gleiche Raster stehen nur einmal im Tisch. Die Prüfung prüft Form und Farben; was darauf zu sehen ist, liest die Spielleitung selbst gegen die Spoilerdatei (Regelwerk 4.4, 4.8).
- **Sammlung:** Ohne `pixel` und `ikone` rät der Tisch eine Ikone aus Art und Namen (Dolch, Säbel, Armbrust, Köcher, Laterne, Tinte, Schlüssel, Schlafsack …; „Bogen“ nur bei Waffen), sonst gilt die Art. Vorhanden: schwert, dolch, saebel, axt, kolben, keule, speer, glefe, bogen, armbrust, bolzen, koecher, schild, ruestung, kettenhemd, kleidung, mantel, kostuem, verkleidung, laute, floete, trommel, horn, seil, kerze, laterne, fackel, decke, schlafsack, netz, rucksack, schlauch, werkzeug, striegel, boot, kette, kompass, schluessel, ration, fisch, kraut, schale, trank, flasche, brief, zettel, siegel, rolle, karte, buch, tinte, feder, wachs, kohle, beutel, muenze, ring, juwel, perle, band, band-blau, flagge, scheibe, seide, schwimmer, tuch, karten, buendel, punkt.
- **Zeichnen** mit `seite/pixel.js` (Formen mit Licht von links oben, Kontur von selbst; die Sammlung steht in `seite/pixel-sammlung.js`):
  - `node seite/pixel.js` gibt `FARBEN` und `IKONEN` für inventar.js aus; `node seite/pixel.js --bogen bogen.png` zeichnet die Sammlung als Bogen.
  - `node seite/pixel.js --ding zeichnung.js --png neu.png` zeichnet die Ikonen aus einer Zeichnungsdatei, gibt sie als json `{Name: Raster}` aus und schreibt die Karte „Neu im Gepäck“ (jede Ikone vierfach auf ihrer Kachel, 152 × 152 Pixel je Ikone). Eine Zeichnungsdatei:

```js
module.exports = function (ikone) {
  ikone('Brasks Dolch', function (z) {
    z.von('dolch');                                  // von der Sammlung ausgehen, oder leer anfangen
    z.balken(12.6, 19.4, 6.4, 25.6, 3.6, 'hanf');    // Griff aus Hirschhorn (Material mit Licht und Schatten)
    z.punkt(5, 26, 'gold.hell');                     // ein Messingnagel im Knauf (Detail in einer Farbe)
  });
};
```

  - Formen: `rechteck`, `ellipse`, `ring`, `kugel` (rund schattiert), `vieleck`, `balken`, `klinge`, `kurve`, `linie`, `flaeche`; Details: `punkt`, `punkte`, `strich`, `raster` (mit Legende); Löschen: `weg`, `wegRechteck`; Ausgehen von: `von` (Sammlung), `vonRaster` (einer fertigen Ikone, etwa der alten eines Dings, das sich verändert hat). `node seite/pixel.js --raster raster.json --png karte.png` zeichnet fertige Raster als Karte.
- Gepäckdaten im Chat (Inventar hier, Händlertisch) kommen ohne `pixel`; dort zeigen die Dinge Ikonen der Sammlung.

## Logbuch

```html
<h2 class="sr-only">Questlog: Probefigurs Logbuch</h2>
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
<h2 class="sr-only">Rast: Probefigur in der Alten Eiche</h2>
<div id="rast">Rastübersicht lädt …</div>
<script>var RAST={nr:7,figur:'Probefigur',ort:'Alte Eiche',tp:[15,21],tw:[2,3,8],kon:1,plaetze:[[3,4],[2,2]],lied:{name:'Lied der Erholung',w:6}}</script>
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

Beispielnachrichten: „Rast #7 · Kurze Rast · Trefferwürfel 2 × W8+1: 5+1, 3+1 = 10 · Lied der Erholung W6: 4 · TP 8 → 21/21 · Trefferwürfel übrig 0/3 · isst eine Ration“ und „Rast #8 · Lange Rast · isst vorher eine Ration · danach Aid (Grad 2) auf die Probefigur, Jost und die Stute · Stute versorgt (Hafer oder Weide)“. Die lange Rast ist ein Plan: Was in der Nacht geschieht und was am Morgen zurückkommt, erzählt die Spielleitung.

## Handel

Der Händlertisch ist eine Waage auf Pergament. Links liegt, was die Figur gibt, rechts, was der Händler gibt. Antippen legt ein Stück auf die Schale, Antippen auf der Schale nimmt es zurück; mit der Maus lässt es sich sofort ziehen, mit dem Finger nach kurzem Halten, damit der Chat sich weiter scrollen lässt. Die Waage kippt nach dem Wert der Ware, dann legt der Tisch die Münzen selbst auf, mit Wechselgeld aus Beutel und Kasse, bis sie im Lot steht. Reicht der Beutel nicht, bleibt sie schief; reicht die Kasse nicht, bleibt der Händler den Rest schuldig. „Handschlag“ schickt das Ergebnis als „Handel #nr · …“ an die Spielleitung, „Feilschen“ den Korb, um jeden Betrag; die Nummer teilt sich den Zähler mit dem Würfelkasten. Die Regeln dazu stehen im Regelwerk (10.1, 4.9).

```html
<h2 class="sr-only">Handel: Probefigur bei Ilse in Rohrdorf</h2>
<div id="handel">Auslage lädt … Falls nicht, schreib Handel.</div>
<script>var HANDEL={nr:4,ort:'Rohrdorf',stand:'Stand: Tag 8',haendler:{name:'Ilse',art:'Krämerin',kasse:{ga:3,sm:18,km:40},waren:[…]},gepaeck:{geld:{ga:12,sm:3},traeger:[…]}}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/handel.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `nr` | Nummer wie beim Würfelkasten |
| `ort`, `stand`, `hinweis` | Kopf des Pergaments; `hinweis` ist ein Satz der Spielleitung, etwa zu Preisen vor Ort |
| `haendler` | `name`, `kurz` (Rufname für „Ilse gibt“), `art` (Krämerin, Wirt …), `kasse` (Münzen wie im Gepäck: was der Händler heute zahlen kann), `waren[]`, `gefeilscht` (`true`, wenn in diesem Besuch schon gefeilscht wurde; dann fehlt der Knopf), `glossar` (Stichwort für den Knopf „Glossar …“) |
| `waren[]` | `name`, `art` (wie im Gepäck), `preis` (Münzen `{ga, sm, km}`, Text „1 GA 5 SM“ oder eine Zahl in Goldadmiralen), `anzahl` (ohne: genug), `kg` (je Stück), `notiz` |
| `gepaeck` | das Gepäck der Figur in der Form von `tische/gepaeck` (inventar.js): `geld`, `traeger[]` mit `dinge[]`. Träger der Art `lager` zählen nicht. Dazu je Ding `ankauf`: was dieser Händler dafür zahlt, und `ankaufNotiz`. Ohne `ankauf` kauft er es nicht; der Tisch zeigt es eingeklappt. |
| `korb` | `{kauft: {Name: Anzahl}, verkauft: {Name: Anzahl}}`: legt Waren schon auf die Waage, etwa nach dem Feilschen |

- Die Preise rechnet die Spielleitung vorher aus (Liste, Ort, Neigung, Feilschen); der Tisch rechnet nur zusammen. Neigung, Härte und Lager des Händlers kommen nicht in die Daten, denn alles in den Daten kann der Spieler lesen (Regelwerk 4.8). Die Kasse zeigt der Tisch offen.
- Gekauftes zählt für die Traglast der Figur (`staerke`, `faktor` am Träger der Art `figur`, wie im Gepäck).
- Wechselgeld: Wer genau zahlen kann, zahlt genau; sonst der kleinste Betrag, zu dem es Wechselgeld gibt, mit den wenigsten Münzen. Kann keiner wechseln, bleibt der Rest beim Händler. Ein Händler zahlt nie zu viel: Kann er nicht genau zahlen, bleibt er den Rest schuldig.

Beispielnachrichten: „Handel #4 · bei Ilse, Rohrdorf · kauft 2 × Ration (1 GA), Kerze (1 KM) · verkauft Kartenspiel (2 SM, 5 KM) · zahlt 1 GA · bekommt 2 SM, 4 KM zurück · Beutel danach 11 GA, 5 SM, 4 KM · trägt danach 16,5 kg (unbelastet)“ und „Handel #5 · feilscht bei Ilse, Rohrdorf · Korb: kauft Kerze (1 KM) · Wert 1 KM gegen nichts“. Nach dem Feilschen stellt die Spielleitung den Würfelkasten (Überzeugen) und danach den Tisch neu, mit den neuen Preisen, dem Korb und `gefeilscht: true`. Der Händlertisch braucht wie die Rast keine Prüfung durch pruefen.js; die Spielleitung liest Waren und Notizen selbst gegen die Spoilerdatei. Ins Spielerbuch kommt er nicht. `test/handel.test.js` prüft die Rechnung an der erfundenen Welt (`test/handel-beispiel.js`).

## Titel

Der Titelbildschirm steht am Anfang jeder Sitzung (Regelwerk 4.10). Ein Ölgemälde malt sich selbst, grob bis fein: eine Bucht der Hold am Abend, ein Schiff vor der untergehenden Sonne, Weg und Steg im Vordergrund, zuletzt die Goldlettern „Hold der Seeprinzen“. Darunter das Menü: **Spiel laden** öffnet die Spielstände, ein Platz je Figur mit Datum und Lunas Phase, Ort, Frist und Erfahrung, dazu ein freier Platz; „Laden“ schickt „Spiel laden: <Name>“. Daneben stehen der Link zum Spielerbuch, die Befehle als Knöpfe (jeder schickt sein Wort) und „Wie wird gespielt?“, das „(Wie wird gespielt?)“ schickt. Das Menü geht sofort; das Bild braucht auf dem Handy etwa zehn Sekunden, bei reduzierter Bewegung erscheint es fertig.

```html
<h2 class="sr-only">Titelbildschirm: Hold der Seeprinzen</h2>
<div id="titel">Titelbild lädt … Falls nicht, schreib „Spiel laden“.</div>
<script>var TITEL={fuss:'Regelwerk 3.6 · Welttag 9 · 9. Patchwall 576 CY', buch:'https://claude.ai/artifact/…', befehle:['Questlog','Glossar','Karte','Inventar'], figuren:[{name:'Probefigur', zeile:'Barde 2 · Wegwart', ort:'Rohrdorf, Alte Eiche', datum:'9. Patchwall 576', tageszeit:'Abend', welttag:9, frist:[9,28,'Die Brücke bei Rohrdorf'], ep:[450,900,3,300], sitzung:4, held:true}]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/titel.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `figuren[]` | je eigener Figur ein Platz: `name` (Pflicht), `zeile` (Klasse und Stufe, Herkunft), `ort`, `datum`, `tageszeit`, `welttag` (daraus Lunas Phase, Regelwerk 8.1), `frist: [heute, Frist, wofür]`, `ep: [Stand, Grenze, nächste Stufe, Grenze der jetzigen Stufe]` (der Balken läuft von der jetzigen Stufe an), `sitzung` (die zuletzt beendete), `held` (`true` bei Heldenmut), `laden` (was „Laden“ schickt, sonst „Spiel laden: <name>“) |
| `buch` | Link zum Spielerbuch; ohne ihn fehlt der Knopf |
| `befehle` | Befehle als Knöpfe, z. B. `['Questlog', 'Glossar', 'Karte', 'Inventar']` |
| `fuss` | eine Zeile unter dem Menü, etwa Regelwerk, Welttag und Datum |
| `einfuehrung` | `false` blendet „Wie wird gespielt?“ aus (für Spieler ohne Einführung, Regelwerk 4.1) |
| `frei` | Text des freien Platzes (sonst „Für eine neue Figur oder einen Nachfolger“); `false` blendet ihn aus |

- Was in `TITEL` steht, kann der Spieler lesen: nur eigene Figuren, nur aus dem Spielstand (Regelwerk 4.8, 4.10). pruefen.js prüft den Titel nicht.
- Im Chat stehen nur die vier Zeilen. Szene, Malwerk (Pinselstriche in vier Lagen nach Hertzmann, Relief, Lasur und Firnis) und Lettern stecken ganz in `titel.js`; die Lettern sind aus IM Fell (Igino Marini, SIL Open Font License 1.1) als Pfade eingebacken und brauchen keine Schrift. Das Menü nutzt IM Fell English von Google Fonts, das `titel.js` selbst nachlädt, sonst Georgia. `canvas[data-fertig]` zeigt, dass das Bild fertig ist.
- Ohne `sendPrompt` (etwa in einer Vorschau außerhalb des Chats) sagt ein Hinweis, was ein Knopf im Spiel schicken würde.
- `node test/titel.test.js` lädt den Titel mit diesem Aufruf in Chromium (Playwright) und prüft Menü, Spielstände, Nachrichten und das fertige Bild an einer erfundenen Figur.

## Lagebild

Das Lagebild zeigt die Lage in einem Kampf, so wie die Figur sie sieht: ein Pergament mit Feldern, die wie beim Schach heißen (A1 links oben; ein Feld ist 1,5 m, nach PHB 2014 fünf Fuß), darauf Gelände, Wesen als Marken mit zwei Buchstaben, Bereiche von Zaubern, Feuer oder Nebel, dazu die Reihenfolge der Initiative mit dem, wer dran ist. Antippen eines Wesens zeigt Art, Feld, Zustand und die Entfernung zur eigenen Figur; Antippen eines freien Felds Name, Gelände, Bereich und Entfernung, damit der Spieler schreiben kann „ich gehe nach G5“. Entfernungen zählen nach PHB 2014 jedes Feld als eins, auch schräg. Das Lagebild schickt nichts von selbst; nur der Glossarknopf fragt wie beim Kartentisch nach einem Eintrag. Die Spielleitung stellt es neu, wenn sich die Lage ändert, und erzählt den Kampf wie immer (Regelwerk 12.1).

```html
<h2 class="sr-only">Lagebild: Steg von Rohrdorf, Runde 2</h2>
<div id="lagebild">Lagebild lädt … Falls nicht, frag nach der Lage als Text.</div>
<script>var LAGEBILD={titel:'Steg von Rohrdorf', stand:'Runde 2 · du bist dran', norden:'oben', gelaende:[{art:'wasser',von:'A7',bis:'J8',name:'Der Fluss'},{art:'steg',von:'E6',bis:'E8'},{art:'kiste',von:'G2',bis:'H2',name:'Ilses Fässer'}], bereiche:[{art:'zauber',feld:'G5',r:2,name:'Schlaf · 3 m'}], wesen:[{id:'du',name:'Probefigur',art:'figur',feld:'D5',tp:[14,17]},{id:'jost',name:'Jost',art:'gefolge',feld:'C5',tp:[9,11],zustand:'angeschlagen'},{id:'w1',name:'Wegelagerer 1',art:'feind',feld:'E4',zustand:'schwer verletzt',notiz:'Knüppel, humpelt'},{id:'w2',name:'Wegelagerer 2',art:'feind',feld:'G5',zustaende:['schläft']}], initiative:['w1','du','jost','w2'], aktiv:'du', runde:2}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/lagebild.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `titel`, `stand` | Kopf: Ort oder Szene, dazu Runde und wer dran ist |
| `breite`, `hoehe` | Felder je Seite, Standard 10 × 8; `breite` bis 160 (240 m), `hoehe` bis 30. Ab 11 Spalten scrollt das Lagebild seitlich (ein Feld 36 px), die Zeilenzahlen bleiben links stehen, und darunter liegt eine Übersicht der ganzen Lage mit dem sichtbaren Ausschnitt: Antippen springt dorthin, „Zu dir“ zurück. Zu Beginn steht der Ausschnitt bei dem, der dran ist. Die lange Seite gehört waagerecht; über 16 Zeilen wird es auf dem Handy sehr hoch. Spalten nach Z heißen AA, AB … wie in einer Tabelle |
| `feld` | Meter je Feld, Standard 1,5 |
| `norden` | `oben`, `rechts`, `unten` oder `links`: zeichnet den Kompass; ohne ihn keinen |
| `gelaende[]` | `art`, ein Feld (`feld: 'C3'`) oder ein Rechteck (`von: 'A7', bis: 'J8'`), `name` (sonst der Name der Art). Arten: `mauer`, `fels`, `kiste`, `schutt`, `wasser`, `schlamm`, `schilf`, `baum`, `busch`, `grube`, `feuer`, `steg`, `pfahl`, `boot`, `tuer`; die Legende sagt zu jeder, was sie in der Regel bedeutet (versperrt, schwieriges Gelände, Deckung) |
| `bereiche[]` | `art` (`zauber`, `feuer`, `nebel`, `licht`, `dunkel`), `name`, dazu ein Kreis mit `feld` und `r` (Felder um die Mitte; ein Feld liegt im Kreis, wenn seine Mitte höchstens `r` Felder entfernt ist, also die Achsen, nicht die Ecken) oder eine Liste `felder: ['C3', 'C4']`. Sleep mit 6 m Radius ist `r: 4` |
| `wesen[]` | `id`, `name` (Pflicht), `art` (`figur` für die eigene Figur, `gefolge`, `tier`, `npc`, `feind`), `feld` (oder `x`, `y` ab 1 wie die Beschriftung), `zeichen` (bis zu drei Zeichen auf der Marke, sonst die ersten zwei Buchstaben, bei „Wegelagerer 3“ „W3“), `groesse` (Felder je Seite, 1 bis 3; die Lage ist das Feld links oben), `zustand` (die Verwundung in Worten: `unversehrt`, `angeschlagen`, `schwer verletzt`, `tot`; ein Ring um die Marke, tot grau mit Kreuz), `zustaende` (Liste aus der festen Reihe unten; jeder Zustand hat eine Ikone), `tp: [jetzt, höchstens]` nur für `figur`, `gefolge` und `tier`, `notiz` (was die Figur sieht: „Kurzbogen“, „humpelt“) |
| `bewegung` | restliche Bewegung in Metern, nur für `figur`, `gefolge` und `tier`. Beim aktiven Wesen tönt das Lagebild die Felder, die es damit erreicht, mit einer Linie um den Rand: jedes Feld zählt eins, auch schräg; schwieriges Gelände (`schutt`, `schlamm`, `schilf`, `busch`, `wasser`, `kiste`) und Felder anderer Wesen kosten doppelt; `mauer`, `fels`, `grube`, `baum`, `pfahl`, `tuer` und Gegner versperren, Tote nicht; enden darf man nur auf einem freien Feld (PHB 2014). Ein angetipptes Feld sagt „erreichst du mit 6 m“ oder „zu weit: 10,5 m, du hast noch 9 m“ |
| `reichweiten` | `[{name, m}]`, nur für `figur`, `gefolge` und `tier`: Waffen und Zauber, etwa `{name:'Glefe', m:3}`, `{name:'Starry Wisp', m:18}`. Antippen des Wesens zeigt je Reichweite einen Knopf; er tönt die Felder in dieser Entfernung (jedes Feld eins, auch schräg), immer nur eine zugleich |
| `initiative` | ids in der Reihenfolge, wie die Figur sie kennt (alle Würfe sind offen, Regelwerk 12.1); ohne sie die Reihenfolge von `wesen` |
| `aktiv`, `runde` | wer dran ist (goldener Ring) und die Runde |

- **Spoilerschutz** (Regelwerk 4.8, 6.3, 12.1): Es gibt keine Felder für TP, RK, Angriffe oder Werte der Gegner; ihr Zustand steht in Worten, wie die Erzählung ihn gibt. Die Prüfung `pruefen(D)` in `lagebild.js` lehnt jedes Feld ab, das die Tabelle nicht kennt, und `tp`, `bewegung` und `reichweiten` bei Gegnern und Leuten; was ein Gegner kann, zeigt die Erzählung. Zustände dürfen alle tragen, denn was einem Gegner widerfährt, sieht die Figur. Namen, Notizen und Bereiche liest die Spielleitung selbst gegen die Spoilerdatei, wie beim Händlertisch; pruefen.js prüft das Lagebild nicht. Ins Spielerbuch kommt es nicht: Eine Lage gilt nur in der Szene.
- **Zustände mit Ikonen:** Jeder Zustand hat eine feste Ikone, eine runde Plakette am Rand der Marke (rechts oben, links oben, rechts unten, links unten; ab fünf trägt die vierte „+n“), dieselbe in der Reihe der Initiative und in der Legende. Die Farbe sagt die Gruppe: violett Kontrolle, Tinte Sinne, grün Gift, rot Feuer, braun Haltung, gold und blau Gutes. Die Reihe: `geblendet` (Auge, durchgestrichen), `taub` (Ohr, durchgestrichen), `unsichtbar` (gestrichelter Kreis), `versteckt` (geschlossenes Auge), `vergiftet` (Tropfen), `brennt` (Flamme), `bezaubert` (Herz), `verängstigt` (Ausrufezeichen), `gepackt` (zwei Ringe), `festgesetzt` (Netz), `gelähmt` (zwei Balken), `betäubt` (Spirale), `kampfunfähig` (Kreis, durchgestrichen), `bewusstlos` (Zz; auch Schlaf durch Sleep; die Marke wird blass), `versteinert` (Stein; blass), `liegend` (liegende Gestalt), `ergibt sich` (weiße Fahne), `flieht` (Pfeil fort), `konzentriert` (Ziel), `inspiriert` (Note). Andere Wörter lehnt die Prüfung ab; was dazu zu sagen ist, steht in `notiz`.
- Was die Figur nicht sieht, steht nicht in den Daten: kein versteckter Schütze, kein Hinterhalt. Er erscheint, wenn er zuschlägt oder bemerkt wird.
- Pergament, Tinte und Schriften wie beim Kartentisch; im dunklen Modus ist das Pergament gedämpft. Die Reihe der Wesen ist Text mit eigenem Hintergrund, kein Knopf (vgl. die Nachbesserung von titel.js in `docs/aenderungen.md`).
- `node test/lagebild.test.js` prüft Felder, Entfernungen, Zeichnung und Formprüfung in Node und, wenn Playwright da ist, die Bedienung in Chromium an der erfundenen Welt (`test/lagebild-beispiel.js`, und für große Karten `test/lagebild-weit.js`: ein Schuss aus 180 m).

## Glossar

Eine Datei `02_glossar.md`: der Glossar-Abschnitt des Spielstands in eigener Datei, als Text (Grammatik unten), den der Tisch selbst liest. Zwei Formen aus derselben Datei:

- **Auszug** (Kopfzeile mit `Auszug: 1 von 64`): ein Eintrag mit allen Posten, aufgeklappt. Querverweise auf Einträge, die nicht mitkommen, fragen die Spielleitung („Glossar <Name> ↗“), der Fuß „Ganzes Glossar ↗“ ebenso. Das ist die Antwort auf **Glossar <Stichwort>** und auf die Knöpfe „Glossar … ↗“ der anderen Tische. `node glossar.js --auszug "<Name>" 02_glossar.md` schreibt den Text (Anführungszeichen bei Namen mit Leerzeichen).
- **Ganzes Glossar**: alle Einträge mit Kurzzeile, Haltung und Gefahrzeichen, nach Rubriken, mit Suche; ein Tipp klappt den Eintrag an Ort und Stelle auf, Querverweise springen hin. Als Widget nur auf Wunsch („Glossar hier“), weil die ganze Datei durch den Chat geht; die Antwort auf **Glossar** ohne Stichwort ist der Link zum Spielerbuch (unten), das dieselbe Form zeigt. Der Fuß „Ganzes Glossar ↗“ eines Auszugs schickt „Glossar“.

Aufruf im Widget, der Text unverändert zwischen den Tags:

```html
<h2 class="sr-only">Glossar: was die Probefigur weiß, Stand Tag 9</h2>
<div id="glossar">Glossar lädt … Falls nicht, frag nach dem Glossar als Text.</div>
<script type="text/plain" id="glossar-text">
*Stand: Tag 9 · Gefahr nach Stufe 2 · Figur: Probefigur*

### Personen
- **Bodo** (freundlich) · auch: der Wirt · Ort: Rohrdorf · Logbuch: Die Brücke bei Rohrdorf · siehe: Jost
  Wirt der Alten Eiche in Rohrdorf.
  - Wirt der Alten Eiche in Rohrdorf. (gesehen, Tag 3)
  - Beim Schwarzen Weiher brennen nachts Lichter, zuletzt bei Vollmond. (von Bodo, Tag 3)
</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/glossar.js';document.head.appendChild(s);</script>
```

| Zeile | Form |
|---|---|
| Kopf | `*Stand: Tag 9 · Gefahr nach Stufe 2 · Figur: Probefigur*`, beim Auszug dazu `Auszug: 1 von 7`. `Gefahr nach Stufe`: die Stufe der Figur, auf der 🩸 und ☠️ eingeschätzt sind (Regelwerk 12.2); Pflicht, sobald ein Zeichen vorkommt |
| Rubrik | `### Personen`, `### Gruppen`, `### Orte`, `### Dinge`, `### Gerüchte` |
| Eintrag | `- **Name** ☠️ (Haltung) · auch: …; … · Ort: … · Logbuch: …; … · siehe: …; … · Post: Ort – wie`. 🎭 vor dem Namen: Figur eines anderen Spielers. Hinter dem Namen 🩸 (harter Gegner) oder ☠️ (jenseits der Stufe). Haltung in Klammern: verbündet, freundlich, feindlich, gefangen, tot, vermisst, unklar; sie ist der Eindruck der Figur, nicht die Wahrheit. Felder trennt ` · `, Listen trennt `; ` (Namen und Titel tragen Kommas). `auch:` weitere Schreibweisen aus dem Spielstand (Suche, Querverweise, Stichwörter der anderen Tische), `Ort:` Name auf der Karte, `Logbuch:` Titel von Aufträgen, `siehe:` andere Einträge, `Post:` wo ein Brief die Person erreicht |
| Kurzzeile | eingerückt, ohne `- `: eine Zeile, die in der Liste unter dem Namen steht |
| Posten | `  - Text. (Herkunft, Tag n)`: ein bis zwei Sätze, Zitate in „…“. Herkunft: `gesehen`, `von X`, `gelesen: X`, `laut X` (eine Karte), `Gerücht`, `Gerücht von X`. Tag: der Welttag, an dem die Figur es erfuhr |

Was vor der ersten Rubrik steht, übergeht der Tisch bis auf die Kopfzeile (Hinweise für die Spielleitung). Der Tisch zeigt die Posten nach Tag, jeden mit Herkunft; die Gefahr nur als Zeichen am Namen, dessen Beschriftung die Stufe nennt („jenseits deiner Stufe (eingeschätzt auf Stufe 3)“); die Haltung als Satz der Figur („Die Probefigur hält Jaro Brandt für feindlich.“). Knöpfe: Orte haben **Karte ↗**, Dinge **Gepäck ↗**, Einträge mit `Logbuch:` **Logbuch ↗**. Spielhandlungen (nachfragen, einen Brief schreiben) gibt es im Glossar nicht; sie gehören an den Spieltisch (Regelwerk 5, 17.5).

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
| `sl/_spielstand`, `sl/_spoiler`, `sl/_uebergabe` | Ablage der Spielleitung (Regelwerk 3.5, Werkstatt 21.4 und 21.5): Kopien von Spielstand und Spoilerdatei und die Übergabe eines Zwischenhalts, je mit `datei`, `text`, `zeichen`, `sha256`, `geschrieben`, die Kopien dazu mit `projekt` (Größe des Projektwissens nach dem Schreiben) und `sitzung`; kein Archiv, das Buch zeigt sie nicht |

- Bauen: `node seite/bauen.js --seite --titel "Probefigurs Buch" > buch.gebaut.html` (`--titel` ist der Titel vor dem Laden, sonst „Spielerbuch“; baut `glossar.js`, `karte.js`, `inventar.js`, `questlog.js` und die Zeichen aus `seite/ikonen.svg`, Tabler Icons, MIT, ein). Veröffentlichen mit dem Artifact-Werkzeug und `capabilities: {db: {rules: [{path: "", read: "view", write: "owner"}, {path: "sl", read: "owner", write: "owner"}]}}`. Eine neue Fassung der Tische heißt: neu bauen, dieselbe Adresse neu veröffentlichen.
- Füllen: `node seite/bauen.js --db <ordner> 02_glossar.md 02_karte.json 02_inventar.json 02_questlog.json 02_geschichte.md --sl 03_archiv.md` schreibt `<ordner>/<sammlung>/<id>.json` (die Art jeder Datei erkennt es selbst; Karte, Gepäck und Logbuch als `.json` oder als Markdown mit json-Block; die Geschichte in Abschnitten `### Sitzung …` unter `# Was bisher geschah`, das Archiv in `## …`) und `meta/buch` (`--stand`, `--stufe`, `--titel` überschreiben). Spielleitungswissen nimmt es nur über `--sl` an: Dateien `03_…`, ein „# Archiv der Spielleitung“ oder ein Wissensbuch als gewöhnliche Datei lehnt es ab, ebenso eine Datei, die keine Geschichte ist.
- Einspielen: `node seite/bauen.js --batches <ordner> --alt <db-ordner> versionen.txt` schreibt je Zeile ein `writes`-Array für ArtifactData `batch` (höchstens 50 Schreibvorgänge und etwa 900 KB je Batch): `set` mit `file_path` und, wo das Dokument schon besteht, `if_version`; Einträge, die es nicht mehr gibt, als `delete`. `--alt` (der Ordner, den `list` mit `out_dir` gefüllt hat) lässt unveränderte Dokumente weg. `versionen.txt` ist der Text der `list`-Ergebnisse davor (Zeilen `- "id"  750 bytes  version 3  "…/glossar/id.json"`), denn die Dateien von `out_dir` tragen keine Version; json `{"glossar/id": 3}` geht auch. `list` liefert ohne `query.limit` nur 100 Dokumente: für das Glossar `limit` 1000. Die Ablage (`sl/_…`) schreibt und löscht `--batches` nie.
- Zurück: `node seite/bauen.js --zurueck <db-ordner> <ordner>` liest, was ArtifactData mit `out_dir` gespeichert hat, und schreibt `02_glossar.md`, `02_karte.json`, `02_inventar.json`, `02_questlog.json`, `02_geschichte.md` und `03_archiv.md` zum Bearbeiten und Prüfen; aus der Ablage dazu `02_spielstand.md`, `03_spielleitung_SPOILER.md` und `uebergabe.md`, mit Meldung, von wann sie sind und ob die Prüfsumme stimmt. Hin und zurück ändert nichts (geprüft).
- Kopien: `node seite/bauen.js --kopie <ordner> --projekt <größe> --sitzung "Sitzung 11" [--sitzungsende] 02_spielstand.md 03_spielleitung_SPOILER.md versionen.txt` legt `sl/_spielstand` und `sl/_spoiler` an und schreibt eine Zeile für ArtifactData `batch`, mit `if_version`, wo die Versionen die Kopie kennen; `--sitzungsende` löscht dabei die Übergabe. `--projekt` ist `knowledge_size` aus `project_info`, gleich nach dem Schreiben ins Projekt. Über 250 KiB lehnt es ab (die Grenze eines Dokuments).
- Übergabe: `node seite/bauen.js --uebergabe <ordner> uebergabe.md versionen.txt` legt `sl/_uebergabe` an, ebenso mit einer Zeile für `batch`.
- `node glossar.js --liste 02_glossar.md` schreibt die Stichwortliste für den Spielstand (je Eintrag Name, Haltung, Zeichen, Kurzzeile, `auch:`).

## Spoilerschutz

Kartentisch, Gepäck und Logbuch dürfen nur zeigen, was die Figur weiß. Für die Karte gibt es drei Sperren:

1. **Kartendaten kommen aus dem Spielstand**, nie aus der Spoilerdatei. Alles, was im `KARTE`-Objekt steht, ist im Widget lesbar, auch ohne gezeichnet zu werden. Darum gibt es keine versteckten Felder: Die Prüfung lehnt jedes Feld ab, das die Tabelle oben nicht kennt.
2. **Laufzeitsperre:** `karte.js` zeichnet nur Orte und Wege, deren `bekannt` `gesehen`, `karte` oder `gehoert` ist. Jeder Ort zeigt beim Antippen seine Herkunft: „Selbst gesehen.“, „Aus der Karte des Vogts.“ oder „Vom Hörensagen (Bodo).“
3. **Prüfung vor jeder Änderung:** `node pruefen.js kartendaten.js 02_spielstand.md 03_spielleitung_SPOILER.md` gibt die Daten frei oder sperrt sie. Die Spoilerdatei wird dabei nur gelesen, nie ausgegeben. Gesperrt wird, wenn
   - ein Ortsname (oder eine Schreibweise aus `namen`) nicht im Spielstand steht,
   - ein Wort oder eine Zahl aus Notizen, Beschriftungen, Gebiets- und Küstennamen nicht im Spielstand steht; steht es in der Spoilerdatei, sagt die Meldung das,
   - eine `id` ein Wort enthält, das nur die Spoilerdatei kennt,
   - eine Reisezeit in keiner Spielstandzeile steht, die beide Orte und die Zahl mit Stunden nennt („Rohrdorf – Mühlfurt 3 Stunden“, „vier Stunden“ zählt auch),
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

(Die erfundene Welt aus `test/wissensbuch.test.js`. Was zu Leben, Handwerk und Ort einer Person gehört, weiß sie ohnehin; von heiklen Dingen weiß sie nur, was in ihrem Abschnitt steht, Regelwerk 5.1.)

Jede Zeile endet mit der Herkunft: `erlebt` (war dabei), `von X` (X hat es erzählt: eine Figur des Buchs oder die Spielerfigur), `Gerücht` (aufgeschnappt; nach `;` steht, woher). Dazu der Welttag; nach `;` darf ein Grund stehen. Wissen von vor Welttag 1 steht auf Tag 1 mit dem Grund „vor dem Auftrag“: `(erlebt, Tag 1; vor dem Auftrag)`. Dieselbe Sache steht in jedem Abschnitt in denselben Worten, denn die Prüfung vergleicht Wörter: Bei kurzen Sätzen müssen alle Inhaltswörter wiederkehren, bei längeren darf je fünf eines fehlen.

Prüfung: `node pruefen.js 03_spielleitung_SPOILER.md 02_spielstand.md 03_spielleitung_SPOILER.md 02_geschichte.md 02_glossar.md` (die Spoilerdatei ist Daten und Spoilerdatei zugleich; das Glossar dazu, damit Wissen der Figur zählt). Gesperrt wird, wenn

- `von X` keine Kette hat: X hat dieselbe Sache nicht in seinem Abschnitt (oder erst später), hat sie der Spielerfigur nicht erzählt (kein Posten „von X“ im Glossar), oder ist die Spielerfigur und wusste sie laut Glossar und Spielstand nicht; X ist niemand (kein Abschnitt, keine Quelle im Glossar, nicht die Figur); die Kette läuft im Kreis,
- ein Gerücht keinen Grund hat, ein Tag nach dem Stand liegt, eine Zeile keine Herkunft hat, eine Figur zwei Abschnitte hat, der Spielstand fehlt.

Hinweise: `erlebt`, ohne dass eine Zeile des Spielstands oder der Spoilerdatei die Figur bei der Sache nennt (war sie dabei?); `von X` zwischen zwei Figuren des Reviers ohne eine Zeile, die beide zusammen nennt, und ohne Grund (wann haben sie gesprochen?); eine Figur, die weder Spielstand noch Spoilerdatei kennt. `test/wissensbuch.test.js` prüft das an der erfundenen Welt.

Die Spielleitung führt das Buch beim Sitzungsende nach: Wer in einer Szene dabei war, bekommt sie als `erlebt`; wer etwas weitererzählt, gibt es mit `von` und Tag weiter. Im Spiel spricht ein NPC heikle Dinge nur an, wenn sie in seinem Abschnitt stehen (Regelwerk 5.1).

Wortvergleich: Wörter werden ohne Umlaute und Groß-/Kleinschreibung verglichen; Beugungen gelten als gleich, wenn Wortanfang und Länge nahe beieinander liegen („überfallen“ und „Überfall“, nicht „Hain“ und „Haken“). Wer einen Begriff neu einführt, trägt ihn zuerst in den Spielstand ein.

## Werkzeuge holen

Die Prüfung und das Spielerbuch laufen in der Arbeitsumgebung der Spielleitung (Node), im Stand `tische_stand` aus der Weltchronik:

```sh
curl -sL https://codeload.github.com/MaxwellSilverhammer-mk/wegwart-karte/tar.gz/<STAND> | tar xz   # legt wegwart-karte-<STAND>/ an
# oder: git clone -q https://github.com/MaxwellSilverhammer-mk/wegwart-karte && git -C wegwart-karte checkout -q <STAND>
```

Aus der Shell sind jsDelivr und raw.githubusercontent.com oft gesperrt, GitHub selbst nicht (geprüft am 21.10.2026). Die Widgets im Chat laden dagegen über jsDelivr. Geht keins von beiden, gilt die Wortregel aus Regelwerk 4.8.

## Versionen

Wie beim Würfelkasten lädt die Spielleitung einen festen Stand (Commit oder Tag). Eine neue Fassung gilt erst, wenn der Weltenhüter sie im Regelwerk einträgt. Kartentisch 1.0, Gepäck 2.1 (Ikonen 32 × 32 und eigene Ikonen, seit Regelwerk 3.8), Logbuch 1.0, Rast 1.0, Handel 1.0, Glossar 1.0, Wissensbuch 1.0, Spielerbuch 1.1 (Ablage seit Regelwerk 3.5), Titel 1.0 (seit Regelwerk 3.6), Lagebild 1.3 (Bewegung, Reichweiten, Ikonen für Zustände, große Karten; Vorschlag, gilt erst mit dem Regelwerk, das es nennt); seit Regelwerk 3.0 gilt ein Stand für alle Dateien. Die Regelwerke liegen unter `docs/`, was sich geändert hat, in `docs/aenderungen.md`.
