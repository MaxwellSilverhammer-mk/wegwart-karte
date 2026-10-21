// Prüft Textgrammatik, Rundlauf, Zeichnen und die Prüfung des Glossars an einer erfundenen Mini-Welt. Das Glossar ist
// selbst Spielstand (in eigener Datei): gesperrt wird, was gegen Form, Namen, Lore oder Verweise verstößt; Wörter, die
// sonst nur in der Spoilerdatei stehen, sind ein Hinweis. Läuft ohne private Dateien.
'use strict';
var path = require('path');
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var glossar = require(path.join(__dirname, '..', 'glossar.js'));

var SPIELSTAND = [
  '# Probefigur – Spielstand · Stand: Welttag 9, 9. Patchwall 576 CY',
  '## Der Auftrag',
  '- Der Vogt von Mühlfurt schickt die Probefigur, die Brücke bei Rohrdorf zu prüfen. Frist: Tag 20. Lohn: 40 Goldadmirale.',
  '- EP: 350/900 bis Stufe 3. Stufe 2 seit Tag 4.',
  '## Für die Spielleitung',
  '- Für andere Spieler heißt sie „🎭 Probefigur“. Die Sitzung 2 begann an Tag 7.',
  '## Inventar',
  'Trägt selbst, rund 7 kg: Kurzschwert 1 kg, Lederrüstung 5 kg, 2 Rationen 1 kg, Brief des Vogts.',
  '## Karte (was die Probefigur kennt)',
  '- Mühlfurt – Rohrdorf 3 Stunden über die Landstraße. Der Schwarze Weiher liegt eine Stunde nördlich von Rohrdorf (Bodo).',
  '## Was bisher geschah',
  '- Tag 1: Der Vogt gab der Probefigur einen Brief: „Wer dies trägt, spricht für Mühlfurt.“',
  '- Tag 3: Bodo, der Wirt der Alten Eiche, erzählte: Beim Schwarzen Weiher brennen nachts Lichter. Er sah sie zuletzt bei Vollmond. Im Dorf heißt das **Lichter am Weiher**.',
  '- Tag 5: Fischer Jost bringt am Tag 12 Netze nach Rohrdorf. Die Probefigur versprach Jost, ihn nicht zu verraten.',
  '- Tag 8: Ein Fuhrmann erzählte von 🎭 Wenzel Hartlieb, einem Wegwart mit einer grauen Stute, der in Rohrdorf nach Lichtern fragte; Post für ihn nimmt der Wirt der Alten Eiche an.',
  '- Tag 8: Jaro Brandt 🩸, der Schläger des Zöllners, schlug die Probefigur an der Brücke nieder.',
  '## Glossar',
  'Das Glossar steht in 02_glossar.md.'
].join('\n');
var SPOILER = [
  '# SPOILER',
  '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Ortwin.',
  '- Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.',
  '- Die Lichter am Weiher sind Laternen der Kultisten. Jaro Brandt ist Ortwins Neffe ☠️.',
  '### Die Kapelle Sankt Nebel',
  '- Der Kult nennt sie **Sankt Nebel**; ihr Schatz ist der **Nebelkelch**.'
].join('\n');
var TEXT = [
  '# Glossar',
  '*Stand: Tag 9 · Gefahr nach Stufe 2 · Figur: Probefigur*',
  '',
  '### Personen',
  '- **Bodo** · Ort: Rohrdorf · siehe: Schwarzen Weiher',
  '  Wirt der Alten Eiche in Rohrdorf.',
  '  - Wirt der Alten Eiche in Rohrdorf. (gesehen, Tag 3)',
  '  - Beim Schwarzen Weiher brennen nachts Lichter, zuletzt bei Vollmond. (von Bodo, Tag 3)',
  '- **Jost** (freundlich) · Logbuch: Die Brücke bei Rohrdorf',
  '  Fischer in Rohrdorf.',
  '  - Bringt am Tag 12 Netze nach Rohrdorf. (von Jost, Tag 5)',
  '- **🎭 Wenzel Hartlieb** (unklar) · Post: Rohrdorf – der Wirt der Alten Eiche nimmt sie an',
  '  Wegwart mit einer grauen Stute.',
  '  - Fragte in Rohrdorf nach Lichtern. (von Fuhrmann, Tag 8)',
  '- **Jaro Brandt** 🩸 (feindlich)',
  '  - Der Schläger des Zöllners, schlug dich an der Brücke nieder. (gesehen, Tag 8)',
  '',
  '### Orte',
  '- **Schwarzer Weiher** · auch: Schwarzen Weiher · Ort: Schwarzer Weiher · siehe: Lichter am Weiher',
  '  - Eine Stunde nördlich von Rohrdorf. (von Bodo, Tag 3)',
  '',
  '### Dinge',
  '- **Brief des Vogts**',
  '  - „Wer dies trägt, spricht für Mühlfurt.“ (gelesen: Brief des Vogts, Tag 1)',
  '',
  '### Gerüchte',
  '- **Lichter am Weiher**',
  '  - Beim Schwarzen Weiher brennen nachts Lichter. (Gerücht von Bodo, Tag 3)',
  ''
].join('\n');
var KARTE = { orte: [{ id: 'muehlfurt', name: 'Mühlfurt' }, { id: 'rohrdorf', name: 'Rohrdorf' }, { id: 'weiher', name: 'Schwarzer Weiher' }] };
var INVENTAR = { traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', dinge: [{ name: 'Brief des Vogts', art: 'brief' }] }] };
var QUESTLOG = { auftraege: [{ id: 'bruecke', titel: 'Die Brücke bei Rohrdorf' }] };
var FIGUREN = ['Probefigur', 'Wenzel Hartlieb'];

function pruefe(text, extra) {
  var g = glossar.ausText(text);
  var q = Object.assign({ spielstand: SPIELSTAND + '\n\n' + text, namenKorpus: SPIELSTAND, spoiler: SPOILER, karte: KARTE, inventar: INVENTAR, questlog: QUESTLOG, figuren: FIGUREN, probleme: g.probleme }, extra || {});
  return wissen.pruefe(g.D, glossar.SCHEMA, q, glossar.zusatz);
}
function nach(text, eintrag, zeile) { return text.replace(new RegExp('(- \\*\\*' + eintrag + '\\*\\*[^\\n]*\\n(?:  [^\\n]*\\n)*)'), '$1' + zeile + '\n'); }

var fehlgeschlagen = 0;
function ok(bed, name, sonst) { console.log((bed ? 'ok  ' : 'FEHL') + ' ' + name + (bed ? '' : ' – ' + (sonst || ''))); if (!bed) fehlgeschlagen++; }

// Grammatik und Rundlauf
var P = glossar.ausText(TEXT);
ok(P.probleme.length === 0, 'Text wird ohne Probleme gelesen', P.probleme.join(' | '));
ok(P.D.heute === 9 && P.D.neuSeit === undefined && P.D.stufe === 2 && P.D.figur === 'Probefigur' && P.D.eintraege.length === 7, 'Kopfzeile: Tag, Stufe, Figur; 7 Einträge');
var b = P.D.eintraege[0], wz = P.D.eintraege[2], jb = P.D.eintraege[3];
ok(b.ort === 'Rohrdorf' && b.siehe[0] === 'Schwarzen Weiher' && b.kurz === 'Wirt der Alten Eiche in Rohrdorf' && b.wissen[1].bekannt === 'gehoert' && b.wissen[1].quelle === 'Bodo' && b.wissen[1].tag === 3, 'Eintrag Bodo: Ort, siehe, Kurzzeile, Posten mit Herkunft und Tag');
ok(wz.spieler === true && wz.name === 'Wenzel Hartlieb' && wz.haltung === 'unklar' && wz.post.ort === 'Rohrdorf' && /Wirt/.test(wz.post.wie), '🎭, Haltung und Post werden gelesen');
ok(jb.gefahr === 'hart' && jb.haltung === 'feind', '🩸 und Haltung in einer Kopfzeile');
ok(P.D.eintraege[5].wissen[0].bekannt === 'gelesen' && P.D.eintraege[6].wissen[0].bekannt === 'geruecht' && P.D.eintraege[6].wissen[0].quelle === 'Bodo', 'Herkunft gelesen: und Gerücht von');
var wieder = glossar.alsText(P.D), P2 = glossar.ausText(wieder);
ok(JSON.stringify(P2.D) === JSON.stringify(P.D) && P2.probleme.length === 0, 'Rundlauf Text → Objekt → Text → Objekt bleibt gleich');
var A = glossar.alsAuszug(P.D, 'Bodo'), AT = glossar.alsText(A), PA = glossar.ausText(AT);
ok(PA.D.auszug === true && PA.D.gesamt === 7 && PA.D.eintraege.length === 1 && PA.D.eintraege[0].name === 'Bodo', 'Auszug als Text: „Auszug: 1 von 7“ und ein Eintrag');

// Suche für „Glossar <Stichwort>“: ohne Artikel, Teilnamen, Wortanfänge; mehrere Treffer als Auswahl
function gefunden(q) { var f = glossar.finde(P.D, q); return f.eintrag ? f.eintrag.name : (f.auswahl.length ? 'Auswahl: ' + f.auswahl.join('; ') : ''); }
ok(gefunden('Bodo') === 'Bodo' && gefunden('bodo') === 'Bodo', 'Suche: genau, auch klein geschrieben');
ok(gefunden('der Jost') === 'Jost', 'Suche: ohne Artikel', gefunden('der Jost'));
ok(gefunden('Hartlieb') === 'Wenzel Hartlieb' && gefunden('Brandt') === 'Jaro Brandt', 'Suche: ein Teil des Namens');
ok(gefunden('Vogt') === 'Brief des Vogts' && gefunden('Lichtern') === 'Lichter am Weiher', 'Suche: Wortanfang mit abgeschnittener Endung');
ok(gefunden('Weiher') === 'Auswahl: Schwarzer Weiher; Lichter am Weiher', 'Suche: mehrere Treffer als Auswahl', gefunden('Weiher'));
ok(gefunden('Niemand') === '' && gefunden('Bo') === '', 'Suche: nichts Erfundenes, keine Treffer aus zwei Buchstaben', gefunden('Bo'));
ok(glossar.alsAuszug(P.D, 'Hartlieb').eintraege[0].name === 'Wenzel Hartlieb', 'Auszug nimmt die Suche');

// Dokumente für die Glossar-Seite: Rundlauf Objekt → Dokumente → Objekt
var docs = glossar.alsDokumente(P.D), meta = docs.filter(function (d) { return d.sammlung === 'meta'; })[0];
var wieder2 = glossar.ausDokumenten(meta.daten, docs.filter(function (d) { return d.sammlung === 'glossar'; }));
ok(docs.length === 8 && meta.daten.anzahl === 7 && meta.daten.stufe === 2 && wieder2.eintraege.length === 7 && wieder2.eintraege[0].id === 'bodo' && wieder2.eintraege[2].spieler === true && glossar.alsText(wieder2) === glossar.alsText(P.D), 'Dokumente: 7 Einträge und meta, aus den Dokumenten entsteht derselbe Text');

// Saubere Daten gehen durch, auch der Auszug
var r0 = pruefe(TEXT);
ok(r0.ok, 'Saubere Daten gehen durch', r0.fehler.join(' | '));
var rA = pruefe(AT);
ok(rA.ok, 'Auszug geht durch, auch mit Verweis nach draußen', rA.fehler.join(' | '));

// Gesperrt
var sperren = {
  'Neuer Eintrag mit Namen aus der Spoilerdatei': TEXT.replace('### Orte', '- **Ortwin**\n  - Führer des Kults. (von Bodo, Tag 3)\n\n### Orte'),
  'Name aus der Spoilerdatei als Quelle': nach(TEXT, 'Bodo', '  - Kennt den Weiher. (von Ortwin, Tag 3)'),
  'Quelle, die der Spielstand nicht kennt': nach(TEXT, 'Bodo', '  - Kennt den Weiher. (von Grete, Tag 3)'),
  'Gehörtes ohne Quelle': nach(TEXT, 'Bodo', '  - Kennt den Weiher. (gehört, Tag 3)'),
  'Posten ohne Herkunft': nach(TEXT, 'Bodo', '  - Kennt den Weiher.'),
  'Selbst Gesehenes mit fremder Quelle': nach(TEXT, 'Bodo', '  - Kennt den Weiher. (gesehen, von Jost, Tag 3)'),
  'Lore: Tag nach heute': nach(TEXT, 'Jost', '  - Bringt Netze. (von Jost, Tag 12)'),
  'Stand liegt vor dem jüngsten Posten': TEXT.replace('Stand: Tag 9', 'Stand: Tag 7'),
  'Lore: Gefahr nach alter Stufe': TEXT.replace('Gefahr nach Stufe 2', 'Gefahr nach Stufe 1'),
  'Gefahr ohne Stufe im Kopf': TEXT.replace(' · Gefahr nach Stufe 2', ''),
  'Name doppelt': TEXT.replace('### Orte', '- **Bodo**\n  - Wirt. (gesehen, Tag 3)\n\n### Orte'),
  '🎭 für die eigene Figur': TEXT.replace('### Orte', '- **🎭 Probefigur**\n  - Die Probefigur. (gesehen, Tag 1)\n\n### Orte'),
  'Lore: 🎭-Figur, die die Chronik nicht kennt': TEXT.replace('- **Bodo**', '- **🎭 Bodo**'),
  'siehe auf einen Eintrag, den es nicht gibt': TEXT.replace('siehe: Schwarzen Weiher', 'siehe: Alte Eiche'),
  'siehe auf sich selbst': TEXT.replace('siehe: Schwarzen Weiher', 'siehe: Bodo'),
  'Ort, der nicht auf der Karte steht': TEXT.replace('Ort: Rohrdorf', 'Ort: Mühlfurt; Alte Eiche').replace('Ort: Mühlfurt; Alte Eiche', 'Ort: Alte Eiche'),
  'Ort aus der Spoilerdatei': TEXT.replace('Ort: Rohrdorf', 'Ort: Kapelle'),
  'Logbuchverweis auf einen Auftrag, den es nicht gibt': TEXT.replace('Logbuch: Die Brücke bei Rohrdorf', 'Logbuch: Die versunkene Kapelle'),
  'Haltung, die es nicht gibt': TEXT.replace('(freundlich)', '(verliebt)'),
  'Rubrik, die es nicht gibt': TEXT.replace('### Gerüchte', '### Götter'),
  'Eintrag vor der ersten Rubrik': TEXT.replace('### Personen\n', '').replace('- **Bodo**', '- **Bodo**'),
  'Kopffeld, das es nicht gibt': TEXT.replace('· Ort: Rohrdorf', '· Geheim: versunkene Kapelle'),
  'Spoiler: hervorgehobener Begriff der Spoilerdatei in einem Posten': nach(TEXT, 'Lichter am Weiher', '  - Der Kelch im Weiher soll der Nebelkelch sein. (von Bodo, Tag 3)'),
  'Spoiler: Überschrift der Spoilerdatei in der Kurzzeile': TEXT.replace('  Wirt der Alten Eiche in Rohrdorf.', '  Wirt der Alten Eiche in Rohrdorf, kennt Sankt Nebel.'),
  'Eintrag ohne Posten': TEXT.replace('  - Der Schläger des Zöllners, schlug dich an der Brücke nieder. (gesehen, Tag 8)\n', ''),
  'ohne Spoilerdatei': 'ohneSpoiler',
  'ohne Spielstand': 'ohneStand'
};
Object.keys(sperren).forEach(function (name) {
  var f = sperren[name], r = f === 'ohneSpoiler' ? pruefe(TEXT, { spoiler: '' }) : f === 'ohneStand' ? pruefe(TEXT, { spielstand: '', namenKorpus: '' }) : pruefe(f);
  ok(!r.ok, 'gesperrt: ' + name + (r.ok ? '' : ' → ' + r.fehler[0].slice(0, 110)), 'DURCHGELASSEN');
});

// Nur Hinweis: Spoilerwörter und ein Gefahrzeichen ohne Stelle im Spielstand
var rH = pruefe(nach(TEXT, 'Lichter am Weiher', '  - Die Lichter sind Laternen der Kultisten. (von Bodo, Tag 3)'));
ok(rH.ok && rH.hinweise.some(function (x) { return /kultisten/.test(x) && /laternen/.test(x); }), 'Hinweis: Wörter, die sonst nur in der Spoilerdatei stehen, werden vorgelegt (kultisten, laternen)', rH.fehler.join(' | '));
var rG = pruefe(TEXT.replace('- **Bodo**', '- **Bodo** ☠️'));
ok(rG.ok && rG.hinweise.some(function (x) { return /Bodo/.test(x) && /☠️/.test(x); }), 'Hinweis: ☠️ ohne Stelle im Spielstand bei diesem Namen', rG.fehler.join(' | '));
var rO = pruefe(TEXT, { karte: undefined, inventar: undefined, questlog: undefined, figuren: undefined });
ok(rO.ok && rO.hinweise.some(function (x) { return /ungeprüft/.test(x); }), 'Ohne Karte, Gepäck, Logbuch und Figuren nur Hinweise, keine Sperre');

// Laufzeitsperre und Zeichnen
var D2 = glossar.ausText(TEXT + '- **Ortwin**\n  - Führer des Kults.\n').D;
var html = glossar.zeichne(D2);
ok(glossar.sichtbar(D2).length === 7 && html.indexOf('Ortwin') < 0, 'Laufzeitsperre: ein Eintrag ohne gültigen Posten wird nicht gezeichnet');
ok(html.indexOf('🎭 Wenzel Hartlieb') >= 0 && html.indexOf('eingeschätzt auf Stufe 2') >= 0 && html.indexOf('Nachfragen') < 0 && html.indexOf('Brief an') < 0, 'Zeichnen: 🎭, Gefahr mit Stufe, keine Spielhandlungen im Tisch');
ok(html.indexOf('data-prompt="Questlog"') >= 0 && html.indexOf('data-prompt="Karte"') >= 0 && html.indexOf('data-prompt="Inventar"') >= 0, 'Zeichnen: Knöpfe zu Logbuch, Karte und Gepäck');
var hA = glossar.zeichne(PA.D);
ok(hA.indexOf('data-prompt="Glossar Schwarzen Weiher"') >= 0 && hA.indexOf('Auszug: 1 von 7 Einträgen') >= 0 && hA.indexOf('data-prompt="Glossar"') >= 0, 'Auszug: Verweis nach draußen fragt die Spielleitung, Knopf zum ganzen Glossar');

console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfungen fehlgeschlagen' : 'Alle Prüfungen bestanden');
process.exit(fehlgeschlagen ? 1 : 0);
