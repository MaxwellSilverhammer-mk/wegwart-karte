# Wegwart-Karte

Pergament-Tische für die geteilte Welt „Hold der Seeprinzen“, ein D&D-5e-Textabenteuer mit Claude als Spielleitung. Alle zeigen nur, was die Figur weiß, und werden vorher mit derselben Prüfung freigegeben:

- **Kartentisch** (`karte.js`): Pergamentkarte mit Orten, Wegen und Reisezeiten, Gebieten, Küste und Notizen. Wer einen Ort antippt, sieht, was die Figur über ihn weiß, und die Karte zoomt hinein. Ein Knopf fragt die Spielleitung per `sendPrompt` nach dem Glossareintrag.
- **Gepäck** (`inventar.js`): Geldbeutel, Rationen, Traglast je Träger und die Dinge, die die Figur bei sich hat, jedes mit seinem Zeichen, seiner Seltenheit und seiner Marke und seinen Werten (Abschnitt „Gepäck“).
- **Logbuch** (`questlog.js`): Fristleiste mit Mondphasen aus dem Weltkalender, Termine, Aufträge mit Etappen, gegebenes Wort und Erfahrung (Abschnitt „Logbuch“).
- **Rast** (`rast.js`): Rastübersicht im Stil des Würfelkastens mit Trefferwürfeln, Lied der Erholung, Essen, Klassenfähigkeiten, Zaubern und Zaubervorbereitung (Abschnitt „Rast“).
- **Handel** (`handel.js`): Händlertisch mit einer Waage: Ware antippen oder auf die Schalen ziehen, die Münzen mit Wechselgeld legt der Tisch selbst auf; Daten in der Form des Gepäcks (Abschnitt „Handel“).
- **Titel** (`titel.js`): Titelbildschirm zu Beginn einer Sitzung, ein Ölgemälde, das sich selbst malt, mit Menü und Spielständen, ein Platz je Figur (Abschnitt „Titel“).
- **Kampf** (`kampf.js`): Kampfkarte mit einem Raster von 36 × 12 Feldern zu 1,5 m für Kämpfe, bei denen der Raum zählt (Regelwerk 12.6). Zeigt Gelände, Höhenlage mit Kanten, Deckung, Licht und nur die Wesen, die die Figur sieht; der Spieler tippt ein Feld an, sieht Weg, Entfernung, Klettern und Sprung, seit 1.2 auch die Reichweite seiner Waffe, die Felder, die Gegner bedrohen, Gelegenheitsangriffe am Weg, eine Lagezeile mit Deckung, Vorteil und Nachteil, die Initiativreihenfolge und Ziel und Uhren des Kampfes, seit 1.3 gezeichnete Kacheln je Bodenart, Schatten für die Höhe, Plaketten für Zustände, Waffen mit Modi und Zauber in eigener Zeile, seit 1.4 den blauen Rahmen seiner Bewegung, Pfeile zum Blättern, Auskunft zu jedem Wesen, Zauber mit Rettungswurf und seine TP im Kopf, seit 1.5 Bonusaktionen und Aufstehen, und baut seit 1.6 seinen Zug als Folge von Wegstücken, einer Aktion und einer Bonusaktion in der Reihenfolge der Tipps (Spurt und Rückzug als Aktionen, Geisterstein am aktuellen Stand, Zeichen der Schadensarten wie im Würfelkasten, der breite Knopf „Zug abschicken“), den er per `sendPrompt` schickt; seit 1.7 zeigt die Karte Spuren seit der letzten Karte, wer neu dazukam und wer außer Sicht geriet (Abschnitt „Kampf“).
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
| `dinge[]` | `name`, `art`; dazu `namen`, `anzahl`, `kg` (je Stück), `ikone` (ein Zeichen aus der Sammlung, sonst rät der Tisch), `seltenheit` (`gewoehnlich`, `ungewoehnlich`, `selten`, `sehr_selten`, `legendaer`), `marke` (`siegel`, `beschaedigt`, `benannt`, `unbekannt`), die Werte `angriff` („+4“), `schaden` („1W8+2 Hieb“), `zweihand` („1W10+2“), `reichweite` („24/96 m“), `rk`, `merkmale` (Liste, etwa `['Laden', 'zweihändig']`), `vorrat` (`[jetzt]` oder `[jetzt, höchstens]`: Ladungen, Munition, Meter Seil, Seiten Tinte) mit `einheit`, `wirkung` (was es regeltechnisch tut, kurz), `zustand` („zerbrochen“, „nass“), außerdem `wortlaut` (Text eines Schriftstücks) und `glossar` (Stichwort für den Knopf „Glossar …“). `notiz`, `herkunft` und `quelle` nimmt der Tisch an, zeigt sie aber nicht (seit 2.0): Was die Figur über ein Ding weiß, steht im Glossar. |

- Arten der Dinge: `waffe`, `ruestung`, `kleidung`, `kostuem`, `instrument`, `werkzeug`, `schreibzeug`, `licht`, `seil`, `behaelter`, `schlafzeug`, `tierbedarf`, `boot`, `ration`, `proviant`, `trank`, `papier`, `brief`, `karte`, `zeichen`, `andenken`, `fund`, `wertsache`, `spiel`, `sonstiges`. Sie bestimmen Zeichen und Gruppe.
- Rationen sind Dinge der Art `ration`; der Kopf zählt sie je Träger. Ein `lager` (etwas, das nicht im Gepäck ist) ist eingeklappt.
- Jede Zeile zeigt das Zeichen des Dings auf einem runden Plättchen, den Namen mit dem Zustand darunter, rechts den wichtigsten Wert (Vorrat, sonst Schaden, sonst RK) und das Gewicht; eine Anzahl über 1 steht am Plättchen. Antippen öffnet ein Fenster mit dem Plättchen groß, allen Werten, den Merkmalen, bei Schriftstücken dem Wortlaut (eingeklappt) und dem Glossarknopf. Die Rationen oben zeigen eine Reihe Brote.
- **Zeichen:** Ein Zeichen ist ein Strichbild wie die Zeichen des Würfelkastens (24 × 24, Strich 2, runde Enden, in Tintenfarbe): 35 Tabler Icons (MIT) und 34 eigene im selben Stil, alle in `seite/zeichen.js`. Ohne `ikone` rät der Tisch das Zeichen aus Art und Namen (Dolch, Säbel, Armbrust, Köcher, Laterne, Tinte, Schlüssel, Schlafsack …; „Bogen“ nur bei Waffen), sonst gilt die Art. Vorhanden: schwert, dolch, saebel, axt, kolben, keule, speer, glefe, bogen, armbrust, bolzen, koecher, schild, ruestung, kettenhemd, kleidung, mantel, kostuem, verkleidung, laute, floete, trommel, horn, seil, kerze, laterne, fackel, decke, schlafsack, netz, rucksack, schlauch, werkzeug, striegel, boot, kette, kompass, schluessel, ration, fisch, kraut, schale, trank, flasche, brief, zettel, siegel, rolle, karte, buch, tinte, feder, wachs, kohle, beutel, muenze, ring, juwel, perle, band, band-blau, flagge, scheibe, seide, schwimmer, tuch, karten, buendel, punkt. Eigene Bilder je Stück gibt es nicht mehr (bis 2.1 `pixel`); was ein Stück besonders macht, sagen Seltenheit und Marke.
- **Seltenheit** (`seltenheit`, wie bei D&D Beyond): färbt den Ring des Plättchens und den Namen: ungewöhnlich grün, selten blau, sehr selten violett, legendär orange; gewöhnlich bleibt Tinte (Standard, auch ohne Feld). Im Fenster steht sie als Wert.
- **Marke** (`marke`): ein kleines Zeichen unten rechts am Plättchen: `siegel` (roter Wachspunkt: gesiegelt), `beschaedigt` (Riss), `benannt` (goldener Stern: ein Stück mit Namen oder Geschichte, Erbstück, Geschenk, Beweisstück), `unbekannt` (Fragezeichen: Wirkung noch nicht bekannt). Höchstens eine je Ding; das Fenster nennt sie beim Namen.
- **Sammlung pflegen:** Der Block zwischen `ZEICHEN-ANFANG` und `ZEICHEN-ENDE` steht wörtlich in `seite/zeichen.js`, `inventar.js` und `handel.js`. Ein neues Zeichen kommt in `seite/zeichen.js` (Pfade im Raster 24 wie bei Tabler), dann `node seite/zeichen.js --einbauen`; `node seite/zeichen.js --bogen bogen.html` schreibt einen Bogen zum Ansehen. `test/inventar.test.js` prüft, dass die drei Fassungen gleich sind.
- Der Händlertisch zeigt dieselben Plättchen; Gepäckdaten im Chat (Inventar hier, Händlertisch) sind dieselben wie im Spielerbuch.

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

## Kampf

Die Kampfkarte ist ein Pergamentraster für Kämpfe, bei denen der Raum zählt (Regelwerk 12.6): 36 Felder breit, 12 hoch, 1 Feld = 1,5 m, Spalten 1 bis 36, Zeilen A bis L. Sie zeigt Gelände, Höhenlage, Türen, Deckung, Licht und die Wesen, die die Figur sieht, nichts anderes (Regelwerk 4.8). Seit 1.6 baut der Spieler seinen **Zug als Folge von Schritten**, in der Reihenfolge, in der er sie tut (PHB: die Bewegung darf beliebig geteilt werden, Aktion und Bonusaktion stehen irgendwo dazwischen, nur die Summe zählt): Ein Tipp auf ein Feld ist ein **Wegstück** vom aktuellen Stand dorthin; danach ist das der neue Stand, der blaue Rahmen zeichnet sich von dort neu mit dem Rest der Bewegung (gestrichelt, wenn Spurt gewählt ist; die Felder gold getönt), der Stein der Figur bleibt am Ausgangsfeld, ein **Geisterstein** (Umriss) steht am aktuellen Stand, die Wegstücke sind eine gestrichelte Spur mit Punkten an den Stationen. Je Stück rechnet die Karte Entfernung (jedes Feld 1,5 m, auch diagonal; schwieriges Gelände und Wasser zählen doppelt, eine Ebene hinauf kostet ein Feld extra, Gegner versperren den Weg, durch Gefolge geht es hindurch), Klettern, Sprung und Gelegenheitsangriffe (rotes Dreieck am Weg; je Gegner einmal im ganzen Zug). Ein Tipp auf eine Waffe oder einen Zauber und dann auf einen Stein ist die **Aktion**, ausgeführt vom aktuellen Stand (die erste Waffe wartet von Anfang an, gestrichelt umrandet; ein Tipp auf die wartende Waffe wechselt ihren Modus); danach kann man weiterziehen. Ein Tipp auf eine Bonusaktion und dann auf einen Stein ist die **Bonusaktion**, ebenso vom aktuellen Stand. Höchstens eine Aktion und eine Bonusaktion: Die übrigen Knöpfe werden blass, mit dem Grund als Tipp; ein Tipp auf die gewählte nimmt sie wieder aus dem Zug (bei einer Waffe mit Modi wechselt er den Modus). **Spurt** und **Rückzug** sind Aktionen in der Aktionszeile (PHB): Spurt gibt die Bewegung noch einmal dazu, Rückzug nimmt den folgenden Wegstücken die Gelegenheitsangriffe; weitere Aktionen ohne Ziel (Hilfe, Ausweichen) kommen aus `aktionen[]`. Die **Zweitwaffe** ist nur wählbar, wenn die Aktion ein Angriff mit einer leichten Waffe ist (`waffen[].leicht`); neben einem Zauber (auch dem Zielsicheren Schlag) oder einer Waffe ohne `leicht` ist sie blass. Liegt die Figur, steht **„steht auf“** als erster Chip in der Folge (halbe Bewegung, hebt „Nachteil: du liegst“ auf); abgewählt bleibt sie liegen und kriecht (jedes Feld zählt doppelt). **„Zurück“** nimmt den letzten Schritt weg (ein Tipp auf den Geisterstein das letzte Wegstück); ohne Wegstück „bleibt“ die Figur auf ihrem Feld.

Unter der Karte steht, von oben nach unten und nichts anderes: die **Werkzeuge** in einer schmalen Zeile (`−`, `+`, „Zur Figur“, „Gefahr“, „Legende“); die **Infozeile** nur für das, was die Karte nicht zeigen kann (die Auskunft zum angetippten Wesen: Art, Feld, Entfernung vom aktuellen Stand, Reichweite, Wunde, Zustände, Notiz, bedrohte Felder; „Da steht schon jemand“; „so weit kommst du nicht“, mit dem Hinweis auf Spurt; ein Sprung, Ungewisses, Deckung am Zielfeld; seit 1.8 auf Verlangen die **Hilfezeile**: wer einen Knopf etwa 400 ms hält, mit dem Finger oder der Maus, liest einen Satz zu ihm („Rückzug ist eine Aktion: die Wegstücke danach lösen keine Gelegenheitsangriffe aus.“), und das Loslassen wählt dann nichts; kein stehender Erklärtext, keine Höhe in Worten, die zeigen Schatten, Schilder und Höhenmarken); die **Lagezeile** zum Angriff, nur mit Ziel (Waffe mit Bonus und Würfeln, Entfernung, Deckung, Vorteil und Nachteil mit Gründen, grün bei Vorteil, rot bei Nachteil, die Regel zu jedem Posten als Tipp an der Zeile; SG und RK kommen nicht vor); die Zeile **Aktion** (Waffen mit ihrem Modus-Zeichen, Zauber, Spurt, Rückzug, `aktionen[]`, jeder Knopf mit dem **Zeichen seiner Schadensart**: dieselben 13 Umrisse, die der Würfelkasten je Schadensart zeigt, oder ein Zeichen für Rettungswurf, Heilung, Wirkung; gewählt und mit Ziel gold, wartet auf Ziel gestrichelt, nicht mehr erlaubt blass); die Zeile **Bonusaktion** ebenso; der Kasten **Zug** mit der Folge als Chips in Zugreihenfolge (Weg blau, Aktion gold, Bonusaktion gold gestrichelt, Gelegenheitsangriff rot), „Zurück“, „Weg 7,5 von 9 m“, darunter der Freitext und darunter der breite Knopf **„Zug abschicken“** über die ganze Breite; die **Legende** eingeklappt ganz unten (nur, was auf dieser Karte vorkommt). Nach dem Senden bleibt der Kasten stehen, alles andere wird blass. Über der Karte stehen Ziel, Uhren und Lage des Kampfes, die TP der Figur und die **Reihenfolge** der Initiative (wer vor der Figur steht, hat in dieser Runde gehandelt und ist grau; ein Tipp auf einen Stein dort zählt wie auf der Karte). Vier Pfeile am Kartenrand blättern dorthin, wo die Karte weitergeht; auf dem Handy ist die Karte vergrößert (mindestens 36 Pixel je Feld) und scrollt, der Rahmen ist 520 Pixel hoch. Seit 1.7 zeigt die Karte **Spuren seit der letzten Karte**: Ein Wesen, dessen Zug die Figur gesehen hat, trägt `vorher: [x, y]`, und die Karte zeichnet einen blassen Pfeil vom alten zum neuen Feld mit einem gestrichelten Ring am alten; wer seit der letzten Karte dazukam, trägt `neu: true` und eine Marke „neu“ am Stein; wer außer Sicht geriet, bleibt mit `gesehen: false` als Schatten dort stehen, wo die Figur ihn zuletzt sah (bedroht nichts, versperrt nichts, kein Ziel; die Auskunft sagt es). Alles davon nur, was die Figur gesehen hat (Regelwerk 4.8). Seit 1.8 (Stufe C) tragen die Spielsteine **Formen neben Farben**: die Figur ein Kreis mit goldenem Ring, Gefolge ein Kreis, Gegner eine Raute, Unbeteiligte ein dünner Kreis (heller Kern, dünner Rand, dunkle Schrift), Tiere ein abgerundetes Quadrat; Kürzel, Wundringe, Plaketten, Höhenmarke, „neu“, die Ringe der Ziele und der gestrichelte Schatten außer Sicht sitzen auf jeder Form, und dieselben Formen stehen in der Reihenfolge und in der Legende. Die drei Blässen sind unterscheidbar: außer Reichweite ist der ganze Stein blass, aus dem Kampf (bewusstlos, versteinert, tot) ist er grau, außer Sicht gestrichelt mit durchscheinendem Kern. Notizen können eine **Aufgabe über Runden** tragen (`fortschritt: [2, 3]`): das Schild sagt „Tür 2/3“ und zeigt einen Balken, der sich füllt. Die Spur der Wegstücke hat einen hellen Saum, damit sie auch über Wasser und Planken zu sehen ist; Höhenschilder bleiben in ihrer Fläche (die Schrift wird kleiner, zuletzt fällt das „m“), statt in Nachbarfelder zu ragen. Vor dem Initiativewurf eines geplanten Kampfes (Hinterhalt, Verteidigung) gibt es die **Aufstellung**: `aufstellung: [{x, y}]` tönt Felder blau; die Figur und jedes Wesen der Ihren mit `aufstellen: true` stehen als Chips in einem Kasten „Aufstellung“, ein Tipp auf einen Chip oder einen Stein wählt, wer gesetzt wird, ein Tipp auf ein blaues Feld setzt ihn dorthin (die Figur zuerst, danach ist der Nächste dran, der noch nicht steht; besetzte und graue Felder sagt die Infozeile), und der breite Knopf schickt „Aufstellung: Fürchtegott auf 12/D, Ksshar auf 13/D“, sobald alle auf blauen Feldern stehen (vorher ist er blass und nennt, wer fehlt). In diesem Zustand zeigt die Karte weder Aktion noch Bonusaktion noch den Kasten „Zug“, nur die Aufstellung, die Werkzeuge und die Auskunft zu Gegnern samt ihren Zonen; die Spielleitung würfelt danach die Initiative und stellt die Karte ohne `aufstellung` neu.

Der Knopf schickt die **Zugzeile**, die Folge von links nach rechts: „Kampf #7 · Fürchtegott: steht auf · nach 19/H (3 m) · Angriff: Langschwert, beidhändig auf Ulf (1,5 m) · nach 22/G (4,5 m) · verlässt Ulf: Gelegenheitsangriff · Bonusaktion: Healing Word auf Rolf (6 m) · Weg 7,5 von 9 m · <was sie sonst tut>“; mit Spurt „… · Spurt · nach 30/G (9 m) · Weg 13,5 von 18 m“; je Wegstück dazu „klettert 1,5 m“ oder „springt 3 m hinab“; die Aktion mit ihrer Lage („Angriff: Dolch, geworfen auf Räuber 2 (7,5 m; lange Reichweite; halbe Deckung)“, „Zauber: Dissonant Whispers auf Räuber 2 (3 m; Rettungswurf WEI SG 12)“, außer Reichweite „Angriff: Langschwert auf Ulf (außer Reichweite: 6 m, Langschwert reicht 1,5 m)“); Aktionen ohne Ziel als „Spurt“, „Rückzug“, „Aktion: Hilfe“; ohne Wegstück „Fürchtegott: bleibt auf 4/E · …“, liegend ohne Aufstehen „kriecht nach 10/F (1,5 m)“ und „bleibt liegen auf 4/E“; ohne angetipptes Ziel steht die wartende Waffe oder der Zauber trotzdem in der Zeile („· Zauber: Zielsicherer Schlag mit Langschwert, beidhändig“, seit 1.3.1), eine wartende Bonusaktion als „Bonusaktion: Dolch (Zweitwaffe) (ohne Ziel)“; ohne `waffen` und `zauber` das angetippte Wesen als „Ziel: Räuber 2 (3 m, 3 m höher)“. Die Spielleitung liest die Folge von links nach rechts und erzählt sie so; die Reaktionen der Gegner fallen an der Stelle, an der sie stehen. Die Nummer teilt sich den Zähler mit dem Würfelkasten. Die Spielleitung zieht alle anderen und stellt die Karte nach jeder Runde neu.

```html
<h2 class="sr-only">Kampfkarte: Keller der Alten Eiche, Runde 2</h2>
<div id="kampf">Kampfkarte lädt … Falls nicht, frag nach der Lage als Text.</div>
<script>var KAMPF={nr:7,titel:'Keller der Alten Eiche',runde:2,stand:'Stand: Tag 8, Nacht',figur:'pf',boden:['####################################','#..........#.....o..~~~~~~~~~......#',…],hoehe:['000000000000000000000000000000000000','000000000000000000000000000000000000',…],wesen:[{id:'pf',name:'Probefigur',kurz:'PF',art:'figur',x:4,y:5,bewegung:9},{id:'r1',name:'Räuber 1',art:'gegner',x:14,y:3,zustand:'verwundet'}],licht:[{x:8,y:3,hell:4,daemmer:8}],notizen:[{x:12,y:4,text:'Tür'}]}</script>
<script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/KONTO/wegwart-karte@STAND/kampf.js';document.head.appendChild(s);</script>
```

| Feld | Inhalt |
|---|---|
| `nr` | Nummer wie beim Würfelkasten |
| `titel`, `runde`, `stand`, `hinweis` | Kopf der Karte; `hinweis` ist ein Satz der Spielleitung zur Lage („Die Fackel brennt noch.“), kein Erklärtext zur Bedienung |
| `figur` | `id` des Wesens, das der Spieler zieht; ohne `figur` das erste mit `art: 'figur'` |
| `spalten`, `zeilen` | Größe des Rasters, Standard 36 und 12; `ursprung: [sp, 'A']` beschriftet einen Ausschnitt mit den Nummern des Ganzen (etwa `[37, 'A']` für die rechte Hälfte eines großen Raums) |
| `boden[]` | eine Zeichenkette je Zeile von oben nach unten, ein Zeichen je Feld, seit 1.3 jedes eine gezeichnete Kachel: `.` Steinboden · `=` Planken, Steg, Deck · `e` Erde, Lehm, Weg · `g` Gras, Wiese · `+` Tür · `/` Treppe, Rampe · `:` Geröll, Trümmer (schwieriges Gelände) · `d` Dickicht, Schilf (schwierig) · `,` seichtes Wasser (schwierig) · `m` Schlamm (schwierig) · `i` Eis (schwierig, glatt) · `~` tiefes Wasser (schwimmen) · `o` Fass, Kiste, Mauerrest, Brustwehr (halbe Deckung, drüber ist schwer) · `O` Baum, Pfeiler, Karren (Dreiviertel-Deckung, nicht betretbar) · `#` Wand, Fels · `x` Hindernis · `?` oder Leerzeichen: nicht zu sehen (Nebel) · `^` erhöht (alte Schreibweise für Ebene 1, siehe `hoehe`). Fehlt `boden`, ist alles Steinboden; fehlt ein Zeichen, ist das Feld nicht zu sehen. Die Kachel soll den Raum ohne Legende lesbar machen: Wasser ist blau mit Wellen (seicht hell), Gras grün mit Halmen, Erde ockerfarben mit Krümeln, Planken mit Fugen, Wand aus Mauerwerk. |
| `hoehe[]` | die Höhenlage, dieselben Zeilen wie `boden`, ein Zeichen je Feld: eine Ziffer `0` bis `9` ist die Ebene (1 = 1,5 m), ein Buchstabe `a` bis `j` dieselbe Ebene (`a` = 0, `b` = 1, …) als Rampe oder Treppe: von einer Nachbarebene kostet ein Schritt dorthin (oder von dort) nichts extra. Fehlt `hoehe` oder ein Zeichen, liegt das Feld auf Ebene 0; `^` im Boden zählt als Ebene 1. Böschungen sind Ebenen mit Schatten; Rampe und Treppe nur dort, wo es Stufen gibt. |
| `wesen[]` | `id`, `name` (Beinamen in `notiz`, nicht hier: die Zugzeile schreibt den Namen), `kurz` (bis drei Zeichen auf dem Spielstein, sonst Initialen), `art` (`figur`, `gefolge`, `gegner`, `npc`, `tier`), `x` (Spalte, 1 bis 36), `y` (Zeile, 1 bis 12, A = 1), `groesse` (Felder je Seite, 1 bis 4), `zustaende[]` (seit 1.3, feste Wörter mit Plakette, unten), `zustand` (freier Text in Infozeile und Tipp; „verwundet“, „verletzt“, „angeschlagen“ geben einen goldenen Wundring, „schwer verletzt“, „schwer verwundet“, „sterbend“ einen roten, „tot“ ein Kreuz und einen blassen Stein; Wörter wie „am Boden“, „bewusstlos“, „ergibt sich“ werden als Zustände erkannt), `notiz`; seit 1.7 `vorher: [x, y]` (das Feld auf der vorigen Karte, wenn die Figur den Zug gesehen hat; auch `{x, y}`), `neu: true` (seit der vorigen Karte dazugekommen) und `gesehen: false` (außer Sicht geraten: ein Schatten am letzten bekannten Feld); seit 1.8 `aufstellen: true` bei Gefolge, Tieren und Unbeteiligten, die sich in der Aufstellung mit setzen lassen (die Figur immer, Gegner nie); seit 1.4 `tp: [jetzt, max]` (bei der Figur im Kopf als Zahl und Balken, bei jedem Wesen Wundstufe daraus: unter der Hälfte angeschlagen, unter einem Viertel schwer verletzt, 0 bewusstlos; bei Gegnern nur, wenn die Figur es wissen darf); bei der Figur `bewegung` in Metern (Standard 9), `schwimmen: true` (Wasser kostet dann nicht doppelt), seit 1.2 `waffen[]`, seit 1.3 `zauber[]`, seit 1.5 `bonus[]`, seit 1.6 `aktionen[]` (unten); bei einem Tier `zahm: true`, wenn die Figur durch sein Feld gehen darf; seit 1.2 bei jedem Wesen `reichweite` in Metern (Standard 1,5; Spieß, Glefe und große Wesen 3), so weit die Figur sie erkennt, und bei Gegnern `bewegung` als Schätzung. Die Höhe eines Wesens ist die seines Felds (bei großen Wesen die des Ankerfelds oben links). |
| `zustaende[]` (seit 1.3) | je Wesen die Zustände mit fester Plakette am Rand des Spielsteins (bis drei, dann „+n“), dieselbe in der Reihenfolge und in der Legende; Wortschatz des Lagebilds 1.2: `geblendet`, `taub`, `unsichtbar`, `versteckt` (Sinne, tinte), `vergiftet` (grün), `brennt` (rot), `bezaubert`, `verängstigt`, `gepackt`, `festgesetzt`, `gelähmt`, `betäubt`, `kampfunfähig`, `bewusstlos` (Kontrolle, violett), `versteinert`, `liegend`, `ergibt sich` (weiße Fahne), `flieht` (Haltung, braun), `konzentriert` (blau), `inspiriert` (gold). Wer `bewusstlos`, `gelähmt`, `betäubt`, `kampfunfähig` oder `versteinert` ist, ist wehrlos (Lagezeile: Vorteil); wer das ist, sich ergibt oder flieht, bedroht kein Feld und löst keinen Gelegenheitsangriff aus. `bewusstlos` und `versteinert` zeichnen den Stein blass. |
| `waffen[]` (seit 1.2) | bei der Figur, je Waffe: `name`, `bonus` (Angriffsbonus), `schaden` („1W8+2“), `typ` (Schadensart; sie bestimmt das Zeichen am Knopf: `Hieb`, `Stich`, `Wucht`, `Feuer`, `Kälte`, `Blitz`, `Schall`, `Säure`, `Gift`, `nekrotisch`, `gleißend`, `psychisch`, `Energie` wie im Würfelkasten, Groß- und Kleinschreibung egal; Unbekanntes bekommt gekreuzte Klingen), `reichweite` in Metern: eine Zahl für Nahkampf (1,5; Spieß 3), `[normal, lang]` für Fernkampfwaffen (leichte Armbrust `[24, 96]`, Dolch geworfen `[6, 18]`); seit 1.6 `leicht: true` für eine leichte Waffe (PHB): nur neben der Angriffsaktion mit ihr ist die Zweitwaffe wählbar. Seit 1.3 dazu `modi[]`, je Modus `name` und, was er anders macht (`schaden`, `reichweite`, `bonus`, `typ`): `{name:'Langschwert', bonus:4, typ:'Hieb', reichweite:1.5, modi:[{name:'einhändig', schaden:'1W8+2'}, {name:'beidhändig', schaden:'1W10+2'}]}`, `{name:'Dolch', bonus:4, schaden:'1W4+2', typ:'Stich', leicht:true, modi:[{name:'Nahkampf', reichweite:1.5}, {name:'geworfen', reichweite:[6, 18]}]}`; `modus` wählt vor (Index, Standard 0). Ein Knopf je Waffe trägt das Zeichen der Schadensart und das des Modus (eine Faust einhändig oder Nahkampf, zwei Fäuste beidhändig, Fadenkreuz geworfen oder Schuss; `zeichen: 'faust'`, `'faeuste'`, `'kreuz'` überschreibt die Erkennung am Namen), ein Tipp auf die wartende oder gewählte Waffe wechselt den Modus. Die erste Waffe wartet von Anfang an; alles aus dem Bogenauszug im Spielstand, nichts aus der Spoilerdatei. Ohne `waffen` und `zauber` gibt es keine Lagezeile und kein Reichweitenquadrat. `zauber: true` an einer Waffe gilt weiter (alte Schreibweise für einen Zauber in der Waffenzeile). |
| `zauber[]` (seit 1.3) | bei der Figur die Zauber des Kampfes in derselben Aktionszeile, Felder wie bei `waffen` (`name`, `bonus`, `schaden`, `typ`, `reichweite`): `{name:'Starry Wisp', bonus:4, schaden:'1W8', typ:'gleißend', reichweite:18}`. Seit 1.4 auch ohne Angriffswurf: `rettung:'WEI'` und `sg:12` für einen Zauber mit Rettungswurf (`{name:'Dissonant Whispers', rettung:'WEI', sg:12, schaden:'3W6', typ:'psychisch', reichweite:18, wirkung:'halb bei Erfolg; muss mit seiner Reaktion fliehen'}`; die Lagezeile nennt dann Rettungswurf, Schaden und Wirkung und rechnet nur Reichweite und Sichtlinie, die Zugzeile „Zauber: Dissonant Whispers auf Räuber 2 (3 m; Rettungswurf WEI SG 12)“), `heilung:'2W4+2'` für Heilung, `wirkung` als freier Text für alles andere. Das Zeichen am Knopf ist die Schadensart, sonst das Herz (Heilung), der Schild (Rettungswurf ohne Schaden) oder die Funken (Wirkung). Der SG ist der eigene Zauber-SG vom Bogen, kein verdeckter Wert. `mit: 'waffe'` macht einen Zauber, der mit der gewählten Waffe geführt wird (Zielsicherer Schlag): Reichweite und Schaden kommen von der Waffe in ihrem Modus (die zuletzt angetippte Waffe, unterstrichen markiert), `typ` und `bonus` vom Zauber, wo er sie nennt; die Zugzeile sagt „Zauber: Zielsicherer Schlag mit Langschwert, beidhändig auf Räuber 2 (…)“. Ein Zauber ist keine Angriffsaktion: die Zweitwaffe bleibt daneben blass. Healing Word gehört unter `bonus`. |
| `bonus[]` (seit 1.5) | bei der Figur ihre Bonusaktionen, je `name`, `art` (`heilung`, `inspiration`, `waffe` für die Zweitwaffe, sonst `frei`), `ziel` (ein Wort oder eine Liste: `gefolge`, `figur` für sie selbst, `gegner`, `npc`, `tier`, `jedes` für alle samt ihr selbst, `keins`; Standard `jedes`, bei `waffe` `gegner`, bei `frei` `keins`), `reichweite` in Metern (Standard 18; bei `waffe` die der Waffe), bei `waffe` der Name der Zweitwaffe aus `waffen` (`waffe: 'Dolch'`; Bonus, Schadensart und Nahkampfreichweite kommen von ihr, der Schaden ohne Modifikator, PHB), `heilung` („2W4+2“) und `wirkung` als freier Text: `{name:'Healing Word', art:'heilung', ziel:'jedes', reichweite:18, heilung:'2W4+2'}`, `{name:'Bardische Inspiration', art:'inspiration', ziel:['gefolge','gegner','npc','tier'], reichweite:18, wirkung:'W6; ein Wesen, das dich hört'}`, `{name:'Dolch', art:'waffe', waffe:'Dolch'}`. Eine eigene Zeile unter der Aktion; ein Tipp wählt die Bonusaktion (gestrichelt: wartet), und der **nächste Tipp auf einen Stein** (Karte oder Reihenfolge, auch die Figur selbst) wählt ihr Ziel, vom aktuellen Stand aus; ein unpassendes Wesen sagt die Infozeile; danach wählen Tipps wieder das Ziel der Aktion. Sie steht in der Folge, wo sie getippt wurde, auch vor der Aktion. Die Zweitwaffe (`art: 'waffe'`) ist nur wählbar, wenn die Aktion ein Angriff mit einer Waffe mit `leicht: true` ist (sonst blass, Tipp „nur neben einer leichten Waffe und der Angriffsaktion“); fällt die Aktion aus dem Zug, fällt sie mit. |
| `aktionen[]` (seit 1.6) | bei der Figur weitere Aktionen ohne Ziel, je `name` und `wirkung` (Text für den Tipp), freiwillig `zeichen` (ein Schlüssel der Zeichen: `rettung`, `heilung`, `wirkung`, … sonst die Hand): `[{name:'Hilfe', wirkung:'Vorteil für den Nächsten, der das Ziel angreift'}, {name:'Ausweichen', wirkung:'Angriffe gegen dich mit Nachteil, GES-Rettungswürfe mit Vorteil'}]`. Sie stehen hinter Spurt und Rückzug in der Aktionszeile; die Zugzeile sagt „Aktion: Hilfe“. Spurt und Rückzug kennt die Karte selbst, sie gehören nicht hierher. |
| `ziel`-Regel (seit 1.5) | `ziel` im Kopf nur, wenn das Ziel eindeutig ist: die Figur hat es selbst gesagt oder ein Auftrag gibt es vor; sonst weglassen, das Feld ist freiwillig (Regelwerk 12.6). |
| `reihenfolge[]` (seit 1.2) | die `id`s der sichtbaren Wesen in Initiativreihenfolge; verborgene fehlen (4.8). Die Leiste zeigt sie über der Karte (seit 1.8 jeden Stein in der Form seiner Art), die Figur markiert, alle davor grau (haben in dieser Runde gehandelt), alle danach kommen noch; ein Tipp auf einen Stein zählt wie ein Tipp auf der Karte. Vor dem Initiativewurf (Aufstellung) fehlt sie. |
| `ziel`, `uhren[]`, `lage[]` (seit 1.2) | Kopf der Karte: `ziel` ein Satz, wie die Figur das Ziel des Kampfes versteht („Die Tür halten, bis Pell die Leiter hat“); `uhren` je `name` und `rest` in Runden (0 heißt „jetzt“); `lage` kurze Umstände nach 9.7 und 12 („dämmrig“, „Starker Wind: Fernkampf mit Nachteil“). Nur, was die Figur weiß. |
| `licht[]` | `x`, `y`, `hell` (Felder helles Licht), `daemmer` (Felder Dämmerlicht); nur Darstellung |
| `notizen[]` | `x`, `y`, `text`: ein kurzer Vermerk im Feld, als Schild („Treppe“, „Tür, zu“); seit 1.8 `fortschritt: [2, 3]` (auch `{ist, von}`) für eine Aufgabe über Runden: das Schild sagt „Tür 2/3“ und trägt einen Balken, der sich füllt (grün, wenn voll); der Tipp am Schild nennt „Tür: 2 von 3“ |
| `aufstellung[]` (seit 1.8) | die Felder, auf die sich die Figur und die Ihren vor dem Initiativewurf stellen dürfen, je `{x, y}` (auch `[x, y]`): blau getönt mit Rahmen. Solange das Feld gesetzt ist (und die Figur da), zeigt die Karte statt Aktion, Bonusaktion und Zug den Kasten „Aufstellung“ mit einem Chip je Stein (die Figur, dazu jedes Wesen mit `aufstellen: true`) und dem breiten Knopf, der „Aufstellung: Fürchtegott auf 12/D, Ksshar auf 13/D“ schickt, sobald alle mit allen ihren Feldern auf blauen Feldern stehen. Nach dem Initiativewurf stellt die Spielleitung die Karte ohne `aufstellung` und mit `reihenfolge` neu. Geplante Kämpfe nach W 22.3 (Hinterhalt, Verteidigung); ein Kampf, der die Figur überrascht, hat keine Aufstellung. |

- **Höhe** (seit 1.1, Schatten seit 1.3): Der Schatten ist das Leitzeichen: Wo ein Feld höher liegt als sein Nachbar, fällt auf das tiefere Feld ein Schatten, breiter und dunkler je Ebene Unterschied, Licht von links oben (nach rechts und unten voll, nach links und oben schwächer), dazu eine Linie an der Kante (eine Stufe dünn, zwei und mehr kräftig); jede Ebene über dem Boden ist heller getönt und trägt ein Schild „+1,5 m“, „+3 m“ in ihrer Mitte (eines je zusammenhängender Fläche, neben Spielsteinen und Notizen); an Rampen und Treppen seit 1.6 ein leichter Schatten und die gestrichelte Stufenlinie. Ein Spielstein über dem Boden trägt seine Höhe als Marke; in den Text unter der Karte kommt die Höhe nicht. Der Weg rechnet die Höhe mit: eine Ebene hinauf kostet ein Feld extra (PHB: jeder Meter Klettern ein Meter Bewegung extra), über Rampe oder Treppe nicht; hinab kostet nichts, zwei Ebenen und mehr hinab ohne Treppe sind ein Sprung, den Chip, Infozeile und Zugzeile nennen („springt 3 m hinab“, 1W6 Wucht je 3 m, am Boden). Entfernungen zählen das größere Maß aus waagerecht und senkrecht (PHB, Diagonale wie gerade): Wer 3 m höher steht, ist 3 m entfernt, auch wenn er direkt über einem steht. Ob ein Klettern eine Probe auf Athletik braucht, ob eine Kante Deckung gibt und was ein Sturz tut, entscheidet die Spielleitung nach PHB und Regelwerk 12; die Karte zeigt nur „klettert“ und „springt“.
- Nur Sichtbares: Was in `KAMPF` steht, kann der Spieler lesen. Verborgene Wesen, Fallen und Räume hinter geschlossenen Türen stehen nicht darin; die Spielleitung zeichnet aus dem Grundriss der Spoilerdatei, was die Figur sieht, und ergänzt, sobald sie mehr sieht. pruefen.js prüft die Kampfkarte nicht; die Spielleitung liest die Daten selbst gegen die Spoilerdatei. Ins Spielerbuch kommt sie nicht; sie gilt nur in der Szene.
- **Reichweite und Gefahr** (seit 1.2): Vom Stand der Aktion aus (die wartende Waffe vom aktuellen Stand) zeichnet die Karte die Reichweite der Waffe als rotes Quadrat, die lange Reichweite gestrichelt; Gegner außer Reichweite werden blass, in langer Reichweite halb blass. Ein Tipp auf einen Gegner zeigt die Felder, die er mit `reichweite` bedroht (gestrichelt, dreidimensional nach PHB, ohne Wände), der Knopf „Gefahr“ alle Zonen zugleich; wer wehrlos ist, sich ergibt oder flieht (`zustaende`), bedroht nichts. Verlässt ein Wegstück die Zone eines Gegners, steht dort ein rotes Dreieck, und Chip und Zugzeile sagen „verlässt Räuber 3: Gelegenheitsangriff“ (je Gegner einmal im ganzen Zug; nach der Aktion Rückzug nicht mehr). Das Ziel der Aktion trägt einen roten Ring, das der Bonusaktion einen gestrichelten goldenen.
- **Lagezeile** (seit 1.2): Mit Aktion und Ziel erscheint unter der Infozeile die Lage des Angriffs, vom Stand aus, an dem die Aktion in der Folge steht: Waffe mit Bonus und Schaden, Entfernung und Höhenunterschied, „in Reichweite“, „lange Reichweite: Nachteil“ oder „außer Reichweite“ mit dem Grund („3 m höher“, „keine Sichtlinie, eine Wand bei 12/C“), Deckung aus der Geometrie (halbe ★ durch niedrige Deckung oder ein Wesen in der Linie, Dreiviertel ★★ durch hohe Deckung, ganze durch Wand oder Hindernis), Vorteil (Ziel am Boden aus 1,5 m, Ziel wehrlos) und Nachteil (Ziel am Boden aus der Ferne, Gegner neben dir beim Fernkampf, lange Reichweite, du liegst), beides zugleich hebt sich auf; ist das Ziel Gefolge oder ein Unbeteiligter, steht ein roter Hinweis am Namen („dein eigener Mann“, „ein Unbeteiligter“; seit 1.5, kein Verbot). Die Regel zu jedem Posten steht als Tipp an der Zeile (Maus oder langes Drücken). Die Zeile ist Hilfe für den Spieler, kein Spielwert: SG, RK und Trefferchancen kommen nicht vor, und Deckung, Sichtlinie und Gelegenheitsangriffe entscheidet weiter die Spielleitung nach PHB (Regelwerk 12.6). Licht rechnet sie nicht mit.
- Was die Karte rechnet, ist nur Hilfe: Erreichbarkeit nach Kosten der Felder und Ebenen, Entfernung in Feldern mal 1,5 m, das Budget des Zugs (Bewegung, halb beim Aufstehen oder Kriechen, mit Spurt noch einmal dazu), dazu Reichweiten, Zonen, Deckung und die Lagezeile. Gelegenheitsangriffe, Deckung in der Schusslinie, Reichweiten und was ein Zug kostet, entscheidet die Spielleitung nach PHB und Regelwerk 12. Eine zweite Aktion im Freitext kann die Karte nicht verhindern; die Folge macht aber kenntlich, was Aktion, Bonusaktion und Weg ist.
- Ohne `sendPrompt` sagt der Kasten, was in den Chat zu schreiben wäre. `node test/kampf.test.js` lädt die Karte mit diesem Aufruf in Chromium (Playwright) und prüft Raster, Erreichbarkeit, Weg, Ziel, Höhe, die Folge und die Nachricht an der erfundenen Welt (`test/kampf-beispiel.js`, mit Höhe `test/kampf-hoehe-beispiel.js`, mit Waffen, Zonen, Reihenfolge und Lagezeile `test/kampf-stufe-a-beispiel.js`, mit Kacheln, Modi, Zaubern, Zuständen, Rettungswurf-Zaubern und TP `test/kampf-1-3-beispiel.js`, mit Bonusaktionen, Aufstehen, Hinweis, Ausschnitt und Blättern in alle vier Richtungen `test/kampf-zollbruecke-beispiel.js`, mit der Folge, `leicht`, `aktionen[]`, Böschungen auf Ebene 1, Treppen als Rampe und seit 1.7 mit Spuren, „neu“ und einem Schatten außer Sicht `test/kampf-schleusentor-beispiel.js`, mit Aufstellung, allen fünf Arten als Formen und einer Tür mit Fortschritt `test/kampf-aufstellung-beispiel.js`, seit 1.8).

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
| `sl/_spielstand`, `sl/_spoiler`, `sl/_uebergabe` | Ablage der Spielleitung (Regelwerk 3.5, Werkstatt 21.4 und 21.5): Kopien von Spielstand und Spoilerdatei und die Übergabe eines Zwischenhalts, je mit `datei`, `text`, `zeichen`, `sha256`, `geschrieben`, die Kopien dazu mit `projekt` (Größe des Projektwissens nach dem Schreiben), `dokumente` (die Pfade der Projektdokumente zu dieser Zeit, seit Regelwerk 3.16) und `sitzung`; kein Archiv, das Buch zeigt sie nicht. Die Ablage holt ein `query` mit `where: [["datei", "in", ["02_spielstand.md", "03_spielleitung_SPOILER.md", "uebergabe.md"]]]` und `out_dir` in einem Aufruf, ohne das Archiv |

- Bauen: `node seite/bauen.js --seite --titel "Probefigurs Buch" > buch.gebaut.html` (`--titel` ist der Titel vor dem Laden, sonst „Spielerbuch“; baut `glossar.js`, `karte.js`, `inventar.js`, `questlog.js` und die Zeichen aus `seite/ikonen.svg`, Tabler Icons, MIT, ein). Veröffentlichen mit dem Artifact-Werkzeug und `capabilities: {db: {rules: [{path: "", read: "view", write: "owner"}, {path: "sl", read: "owner", write: "owner"}]}}`. Eine neue Fassung der Tische heißt: neu bauen, dieselbe Adresse neu veröffentlichen.
- Füllen: `node seite/bauen.js --db <ordner> 02_glossar.md 02_karte.json 02_inventar.json 02_questlog.json 02_geschichte.md --sl 03_archiv.md` schreibt `<ordner>/<sammlung>/<id>.json` (die Art jeder Datei erkennt es selbst; Karte, Gepäck und Logbuch als `.json` oder als Markdown mit json-Block; die Geschichte in Abschnitten `### Sitzung …` unter `# Was bisher geschah`, das Archiv in `## …`) und `meta/buch` (`--stand`, `--stufe`, `--titel` überschreiben). Werden nur neue Abschnitte eingespielt (der Abschnitt der Sitzung, das Würfelprotokoll), geben `--reihe-ab n` und `--sl-reihe-ab n` die Nummer des ersten Abschnitts der Datei vor (n = Zahl der Dokumente, die es in `geschichte` bzw. `sl` schon gibt, aus dem `list`-Ergebnis); sonst sortiert das Buch sie an den Anfang. Spielleitungswissen nimmt es nur über `--sl` an: Dateien `03_…`, ein „# Archiv der Spielleitung“ oder ein Wissensbuch als gewöhnliche Datei lehnt es ab, ebenso eine Datei, die keine Geschichte ist.
- Einspielen: `node seite/bauen.js --batches <ordner> --alt <db-ordner> versionen.txt` schreibt je Zeile ein `writes`-Array für ArtifactData `batch` (höchstens 50 Schreibvorgänge und etwa 900 KB je Batch): `set` mit `file_path` und, wo das Dokument schon besteht, `if_version`; Einträge, die es nicht mehr gibt, als `delete`. `--alt` (der Ordner, den `list` mit `out_dir` gefüllt hat) lässt unveränderte Dokumente weg. `versionen.txt` ist der Text der `list`-Ergebnisse davor, wörtlich: die Kopfzeile `N documents from collection "glossar" …`, die Zeilen `- "id"  750 bytes  version 3  "…/glossar/id.json"` und, bei mehr als 50 Dokumenten, die gekürzte Schlusszeile `[172 more saved documents, … (id, version): "id" 11, "id" 2, …]`, aus der `bauen.js` die übrigen Versionen liest (seit Spielerbuch 1.2); die Dateien von `out_dir` tragen keine Version. json `{"glossar/id": 3}` geht auch. Versionen braucht nur, was ersetzt oder gelöscht wird: `meta`, `tische` und `glossar`; `geschichte` und `sl` bekommen nur neue Dokumente. `list` liefert ohne `query.limit` nur 100 Dokumente: für das Glossar `limit` 1000. Die Ablage (`sl/_…`) schreibt und löscht `--batches` nie.
- Zurück: `node seite/bauen.js --zurueck <db-ordner> <ordner>` liest, was ArtifactData mit `out_dir` gespeichert hat, und schreibt `02_glossar.md`, `02_karte.json`, `02_inventar.json`, `02_questlog.json`, `02_geschichte.md` und `03_archiv.md` zum Bearbeiten und Prüfen; aus der Ablage dazu `02_spielstand.md`, `03_spielleitung_SPOILER.md` und `uebergabe.md`, mit Meldung, von wann sie sind und ob die Prüfsumme stimmt; kennt die Kopie die Projektdokumente, dazu `projekt-dokumente.txt` zum Vergleich mit `project_info` (Werkstatt 21.5). Hin und zurück ändert nichts (geprüft).
- Kopien: `node seite/bauen.js --kopie <ordner> --projekt <größe> --dokumente projekt-dokumente.txt --sitzung "Sitzung 11" [--sitzungsende] 02_spielstand.md 03_spielleitung_SPOILER.md versionen.txt` legt `sl/_spielstand` und `sl/_spoiler` an (`--dokumente`: die Pfade aus `project_info`, je Zeile einer) und schreibt eine Zeile für ArtifactData `batch`, mit `if_version`, wo die Versionen die Kopie kennen; `--sitzungsende` löscht dabei die Übergabe. `--projekt` ist `knowledge_size` aus `project_info`, gleich nach dem Schreiben ins Projekt. Über 250 KiB lehnt es ab (die Grenze eines Dokuments).
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

In der Arbeitsumgebung der Claude-App antwortet `codeload.github.com` mit 403, bis das Repository mit dem Werkzeug `add_repo` (Lesen) angemeldet ist; danach geht nur `git`, und ein `git clone --depth 1` liefert HEAD, nicht den Stand (geprüft am 29.10.2026):

```sh
git clone -q --depth 1 https://github.com/MaxwellSilverhammer-mk/wegwart-karte
git -C wegwart-karte fetch -q --depth 1 origin <STAND> && git -C wegwart-karte checkout -q <STAND>
```

## Versionen

Wie beim Würfelkasten lädt die Spielleitung einen festen Stand (Commit oder Tag). Eine neue Fassung gilt erst, wenn der Weltenhüter sie im Regelwerk einträgt. Kartentisch 1.0, Gepäck 3.0 (Umrisszeichen, Seltenheit und Marke, seit Regelwerk 3.10), Logbuch 1.0, Rast 1.0, Handel 1.0, Glossar 1.0, Wissensbuch 1.0, Spielerbuch 1.2 (Ablage seit Regelwerk 3.5; seit Regelwerk 3.16 liest `bauen.js` auch gekürzte `list`-Ergebnisse, spielt mit `--reihe-ab` nur neue Abschnitte ein und schreibt mit `--dokumente` die Projektdokumente in die Kopien), Titel 1.0 (seit Regelwerk 3.6), Kampf 1.6 (1.0 seit Regelwerk 3.15, 1.1 seit 3.17, 1.6 seit 3.19); seit Regelwerk 3.0 gilt ein Stand für alle Dateien. Die Regelwerke liegen unter `docs/`, was sich geändert hat, in `docs/aenderungen.md`.
