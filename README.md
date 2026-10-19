# Wegwart-Karte

Kartentisch für die geteilte Welt „Hold der Seeprinzen“, ein D&D-5e-Textabenteuer mit Claude als Spielleitung. Die Datei `karte.js` zeichnet aus Kartendaten eine Pergamentkarte in ein Visualizer-Widget: Orte, Wege mit Reisezeiten, Gebiete, Küste und Notizen. Wer einen Ort antippt, sieht, was die Figur über ihn weiß, und die Karte zoomt hinein. Ein Knopf fragt die Spielleitung per `sendPrompt` nach dem Glossareintrag.

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

## Spoilerschutz

Die Karte darf nur zeigen, was die Figur weiß. Dafür gibt es drei Sperren:

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

Wortvergleich: Wörter werden ohne Umlaute und Groß-/Kleinschreibung verglichen; Beugungen gelten als gleich, wenn Wortanfang und Länge nahe beieinander liegen („überfallen“ und „Überfall“, nicht „Hain“ und „Haken“). Wer einen Begriff neu einführt, trägt ihn zuerst in den Spielstand ein.

## Versionen

Wie beim Würfelkasten lädt die Spielleitung einen festen Stand (Commit oder Tag). Eine neue Fassung gilt erst, wenn der Weltenhüter sie im Regelwerk einträgt.
