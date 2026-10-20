// Prüft die Wissensprüfung für das Glossar an einer erfundenen Mini-Welt: Was im Spielstand steht, geht
// durch; alles aus der Spoilerdatei, aus dem Nichts, gegen den Weltkalender oder gegen die anderen Tische
// wird gesperrt. Läuft ohne private Dateien. Die echten Daten prüft die Spielleitung mit pruefen.js.
'use strict';
var path = require('path');
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var glossar = require(path.join(__dirname, '..', 'glossar.js'));

var SPIELSTAND = [
  '# Probefigur – Spielstand · Stand: Welttag 9, 9. Patchwall 576 CY',
  '## Der Auftrag',
  '- Der Vogt von Mühlfurt schickt die Probefigur, die Brücke bei Rohrdorf zu prüfen. Frist: Tag 20. Lohn: 40 Goldadmirale.',
  '- EP: 350/900 bis Stufe 3.',
  '## Für die Spielleitung',
  '- Für andere Spieler heißt sie „🎭 Probefigur“. Die Sitzung 2 begann an Tag 7.',
  '## Inventar',
  'Trägt selbst, rund 7 kg: Kurzschwert 1 kg, Lederrüstung 5 kg, 2 Rationen 1 kg, Brief des Vogts.',
  '## Karte (was die Probefigur kennt)',
  '- Mühlfurt – Rohrdorf 3 Stunden über die Landstraße. Der Schwarze Weiher liegt eine Stunde nördlich von Rohrdorf (Bodo).',
  '## Was bisher geschah',
  '- Tag 1: Der Vogt gab der Probefigur einen Brief: „Wer dies trägt, spricht für Mühlfurt.“',
  '- Tag 3: Bodo, der Wirt der Alten Eiche, erzählte: Beim Schwarzen Weiher brennen nachts Lichter. Er sah sie zuletzt bei Vollmond.',
  '- Tag 5: Fischer Jost bringt am Tag 12 Netze nach Rohrdorf. Die Probefigur versprach Jost, ihn nicht zu verraten.',
  '- Tag 8: Ein Fuhrmann erzählte von 🎭 Wenzel Hartlieb, einem Wegwart mit einer grauen Stute, der in Rohrdorf nach Lichtern fragte; Post für ihn nimmt der Wirt der Alten Eiche an.',
  '- Tag 8: Jaro Brandt 🩸, der Schläger des Zöllners, schlug die Probefigur an der Brücke nieder.',
  '## Glossar',
  '### Personen',
  '- **Bodo**: Wirt der Alten Eiche in Rohrdorf. Beim Schwarzen Weiher brennen nachts Lichter, zuletzt bei Vollmond (Bodo, Tag 3).',
  '- **Jost**: Fischer in Rohrdorf, bringt am Tag 12 Netze nach Rohrdorf. Du hast ihm versprochen, ihn nicht zu verraten.',
  '- **🎭 Wenzel Hartlieb**: Wegwart mit einer grauen Stute, fragte in Rohrdorf nach Lichtern (Fuhrmann). Post nimmt der Wirt der Alten Eiche an.',
  '- **Jaro Brandt** 🩸: der Schläger des Zöllners, schlug dich an der Brücke nieder.',
  '### Orte',
  '- **Schwarzer Weiher**: eine Stunde nördlich von Rohrdorf (Bodo); dort brennen nachts Lichter (Bodo).',
  '- **Rohrdorf**: Dorf an der Brücke, 3 Stunden von Mühlfurt.',
  '### Dinge',
  '- **Brief des Vogts**: „Wer dies trägt, spricht für Mühlfurt.“ Vom Vogt an Tag 1.',
  '### Gerüchte',
  '- **Lichter am Weiher**: Beim Schwarzen Weiher brennen nachts Lichter (Bodo); ein Fuhrmann erzählte, Wenzel Hartlieb habe danach gefragt.'
].join('\n');
var SPOILER = [
  '# SPOILER',
  '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Ortwin.',
  '- Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.',
  '- Die Lichter am Weiher sind Laternen der Kultisten. Jaro Brandt ist Ortwins Neffe ☠️.'
].join('\n');
var KARTE = { orte: [{ id: 'muehlfurt', name: 'Mühlfurt' }, { id: 'rohrdorf', name: 'Rohrdorf' }, { id: 'weiher', name: 'Schwarzer Weiher' }] };
var INVENTAR = { traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', dinge: [{ name: 'Brief des Vogts', art: 'brief' }] }] };
var QUESTLOG = { auftraege: [{ id: 'bruecke', titel: 'Die Brücke bei Rohrdorf' }] };
var FIGUREN = ['Probefigur', 'Wenzel Hartlieb'];

function gl() {
  return {
    titel: 'Glossar', stand: 'Stand: Tag 9', heute: 9, neuSeit: 7, figur: 'Probefigur',
    eintraege: [
      { id: 'bodo', name: 'Bodo', art: 'person', kurz: 'Wirt der Alten Eiche in Rohrdorf', ort: 'Rohrdorf', siehe: ['Schwarzer Weiher'], wissen: [
        { text: 'Wirt der Alten Eiche in Rohrdorf.', bekannt: 'gesehen', tag: 3 },
        { text: 'Beim Schwarzen Weiher brennen nachts Lichter, zuletzt bei Vollmond.', bekannt: 'gehoert', quelle: 'Bodo', tag: 3 }
      ] },
      { id: 'jost', name: 'Jost', art: 'person', kurz: 'Fischer in Rohrdorf', haltung: 'freund', logbuch: ['Die Brücke bei Rohrdorf'], wissen: [
        { text: 'Bringt am Tag 12 Netze nach Rohrdorf.', bekannt: 'gehoert', quelle: 'Jost', tag: 5 }
      ] },
      { id: 'wenzel', name: 'Wenzel Hartlieb', art: 'person', spieler: true, kurz: 'Wegwart mit einer grauen Stute', post: { ort: 'Rohrdorf', wie: 'Post nimmt der Wirt der Alten Eiche an' }, wissen: [
        { text: 'Fragte in Rohrdorf nach Lichtern.', bekannt: 'gehoert', quelle: 'Fuhrmann', tag: 8 }
      ] },
      { id: 'jaro', name: 'Jaro Brandt', art: 'person', gefahr: 'hart', haltung: 'feind', wissen: [
        { text: 'Der Schläger des Zöllners, schlug dich an der Brücke nieder.', bekannt: 'gesehen', tag: 8 }
      ] },
      { id: 'weiher', name: 'Schwarzer Weiher', art: 'ort', ort: 'Schwarzer Weiher', siehe: ['Lichter am Weiher'], wissen: [
        { text: 'Eine Stunde nördlich von Rohrdorf.', bekannt: 'gehoert', quelle: 'Bodo', tag: 3 }
      ] },
      { id: 'brief', name: 'Brief des Vogts', art: 'ding', wissen: [
        { text: '„Wer dies trägt, spricht für Mühlfurt.“', bekannt: 'gelesen', quelle: 'Brief des Vogts', tag: 1 }
      ] },
      { id: 'lichter', name: 'Lichter am Weiher', art: 'geruecht', wissen: [
        { text: 'Beim Schwarzen Weiher brennen nachts Lichter.', bekannt: 'geruecht', quelle: 'Bodo', tag: 3 }
      ] }
    ]
  };
}
var ALLE = { spielstand: SPIELSTAND, spoiler: SPOILER, karte: KARTE, inventar: INVENTAR, questlog: QUESTLOG, figuren: FIGUREN };
function pruefe(d, q) { return wissen.pruefe(d, glossar.SCHEMA, q || ALLE, glossar.zusatz); }

var faelle = {
  'Eintrag, der nur in der Spoilerdatei steht': function (d) { d.eintraege.push({ id: 'ortwin', name: 'Ortwin', art: 'person', wissen: [{ text: 'Führer des Kults.', bekannt: 'gehoert', quelle: 'Bodo' }] }); },
  'Posten mit Wort aus der Spoilerdatei': function (d) { d.eintraege[0].wissen.push({ text: 'Bodo kennt die Kultisten.', bekannt: 'gehoert', quelle: 'Bodo' }); },
  'Posten, der die Spoilerdatei umschreibt': function (d) { d.eintraege[6].wissen.push({ text: 'Die Lichter am Weiher sind Laternen.', bekannt: 'geruecht' }); },
  'Posten, der verstreute Wörter neu zusammensetzt': function (d) { d.eintraege[1].wissen.push({ text: 'Jost bringt den Brief des Vogts zum Schwarzen Weiher.', bekannt: 'gehoert', quelle: 'Bodo' }); },
  'Kurzzeile, die nirgends belegt ist': function (d) { d.eintraege[1].kurz = 'Jost bewacht die Brücke für den Vogt.'; },
  'Quelle, die der Spielstand nicht kennt': function (d) { d.eintraege[0].wissen[1].quelle = 'Ortwin'; },
  'Gehörtes ohne Quelle': function (d) { delete d.eintraege[0].wissen[1].quelle; },
  'Gelesenes ohne Quelle': function (d) { delete d.eintraege[5].wissen[0].quelle; },
  'Selbst Gesehenes mit fremder Quelle': function (d) { d.eintraege[0].wissen[0].quelle = 'Bodo'; },
  'Lore: Tag nach heute': function (d) { d.eintraege[1].wissen[0].tag = 12; },
  'Lore: neuSeit nach heute': function (d) { d.neuSeit = 10; },
  'Lore: Tag, der nicht im Spielstand steht': function (d) { d.eintraege[0].wissen[0].tag = 4; },
  'Stand passt nicht zu heute': function (d) { d.stand = 'Stand: Tag 8'; },
  'Stichwort, das nicht fett im Glossar steht': function (d) { d.eintraege.push({ id: 'vogt', name: 'Vogt', art: 'person', wissen: [{ text: 'Der Vogt von Mühlfurt.', bekannt: 'gesehen' }] }); },
  'Name doppelt': function (d) { d.eintraege.push({ id: 'bodo2', name: 'Bodo', art: 'person', wissen: [{ text: 'Wirt der Alten Eiche.', bekannt: 'gesehen' }] }); },
  '🎭 im Namen statt in „spieler“': function (d) { d.eintraege[2].name = '🎭 Wenzel Hartlieb'; },
  '🎭 für die eigene Figur': function (d) { d.eintraege.push({ id: 'ich', name: 'Probefigur', art: 'person', spieler: true, wissen: [{ text: 'Die Probefigur.', bekannt: 'gesehen' }] }); },
  'Lore: 🎭-Figur, die die Chronik nicht kennt': function (d) { d.eintraege[0].spieler = true; },
  'Lore: Gefahrzeichen, das der Spielstand nicht trägt': function (d) { d.eintraege[0].gefahr = 'toedlich'; },
  'Lore: ☠️ aus der Spoilerdatei': function (d) { d.eintraege[3].gefahr = 'toedlich'; },
  'siehe auf einen Eintrag, den es nicht gibt': function (d) { d.eintraege[0].siehe = ['Alte Eiche']; },
  'siehe auf ein Spoilerwort': function (d) { d.eintraege[0].siehe = ['versunkene Kapelle']; },
  'siehe auf sich selbst': function (d) { d.eintraege[0].siehe = ['Bodo']; },
  'Ort, der nicht auf der Karte steht': function (d) { d.eintraege[0].ort = 'Alte Eiche'; },
  '„neu“ im ganzen Glossar': function (d) { d.eintraege[0].neu = true; },
  'Stichwortliste mit Posten': function (d) { d.liste = true; },
  'liste und auszug zugleich': function (d) { d.liste = true; d.auszug = true; d.eintraege.forEach(function (e) { delete e.wissen; delete e.siehe; delete e.ort; delete e.logbuch; delete e.post; }); },
  'Logbuchverweis auf einen Auftrag, den es nicht gibt': function (d) { d.eintraege[1].logbuch = ['Die versunkene Kapelle']; },
  'Eintrag ohne gültigen Posten': function (d) { d.eintraege[1].wissen = [{ text: 'Fischer.', bekannt: 'erraten' }]; },
  'unbekanntes Feld mit Geheimtext': function (d) { d.eintraege[0].geheim = 'versunkene Kapelle'; },
  'ungültige Art': function (d) { d.eintraege[0].art = 'goetter'; },
  'ungültige Haltung': function (d) { d.eintraege[0].haltung = 'verliebt'; },
  'Spoilername in der id': function (d) { d.eintraege[0].id = 'ortwins-wirt'; },
  '„auf“ zeigt ins Leere': function (d) { d.auf = 'kapelle'; },
  'Zahl, die nirgends steht': function (d) { d.eintraege[0].wissen[0].text = 'Wirt der Alten Eiche seit 73 Jahren.'; },
  'ohne Spoilerdatei': 'ohneSpoiler',
  'ohne Spielstand': 'ohneStand'
};

var fehlgeschlagen = 0;
var echt = pruefe(gl());
console.log((echt.ok ? 'ok  ' : 'FEHL') + ' glossar: saubere Daten gehen durch' + (echt.ok ? '' : ': ' + echt.fehler.join(' | ')));
if (!echt.ok) fehlgeschlagen++;
Object.keys(faelle).forEach(function (name) {
  var d = gl(), q = { spielstand: SPIELSTAND, spoiler: SPOILER, karte: KARTE, inventar: INVENTAR, questlog: QUESTLOG, figuren: FIGUREN }, f = faelle[name];
  if (f === 'ohneSpoiler') q.spoiler = '';
  else if (f === 'ohneStand') q.spielstand = '';
  else f(d);
  var r = pruefe(d, q);
  console.log((r.ok ? 'FEHL' : 'ok  ') + ' glossar: ' + name + (r.ok ? ' – DURCHGELASSEN' : ' → ' + r.fehler[0]));
  if (r.ok) fehlgeschlagen++;
});

// Ableitungen: Stichwortliste und Auszug gehen durch, eine verfälschte Liste wird gesperrt
var L = glossar.alsListe(gl()), rL = pruefe(L);
console.log((rL.ok ? 'ok  ' : 'FEHL') + ' Stichwortliste (node glossar.js --liste) geht durch' + (rL.ok ? '' : ': ' + rL.fehler.join(' | ')));
if (!rL.ok) fehlgeschlagen++;
var rLq = pruefe(gl(), Object.assign({}, ALLE, { liste: L }));
console.log((rLq.ok ? 'ok  ' : 'FEHL') + ' Glossar mit passender Stichwortliste geht durch' + (rLq.ok ? '' : ': ' + rLq.fehler.join(' | ')));
if (!rLq.ok) fehlgeschlagen++;
var L2 = glossar.alsListe(gl()); L2.eintraege[0].kurz = 'Wirt der Alten Eiche';
var rL2 = pruefe(gl(), Object.assign({}, ALLE, { liste: L2 }));
console.log((rL2.ok ? 'FEHL' : 'ok  ') + ' Stichwortliste, die vom Glossar abweicht' + (rL2.ok ? ' – DURCHGELASSEN' : ' → ' + rL2.fehler[0]));
if (rL2.ok) fehlgeschlagen++;
var A = glossar.alsAuszug(gl(), 'bodo'), rA = pruefe(A);
console.log((rA.ok && A.auf === 'bodo' && A.gesamt === 7 ? 'ok  ' : 'FEHL') + ' Auszug (node glossar.js --auszug bodo) geht durch, auch mit Verweisen auf Einträge außerhalb des Auszugs' + (rA.ok ? '' : ': ' + rA.fehler.join(' | ')));
if (!rA.ok) fehlgeschlagen++;
var hA = glossar.zeichne(A), aok = hA.indexOf('data-prompt="Glossar Schwarzer Weiher"') >= 0 && hA.indexOf('Auszug: 1 von 7 Einträgen') >= 0;
console.log((aok ? 'ok  ' : 'FEHL') + ' Auszug: Verweis nach draußen fragt die Spielleitung („Glossar Schwarzer Weiher“)');
if (!aok) fehlgeschlagen++;
var hL = glossar.zeichne(L), lok = hL.indexOf('data-prompt="Glossar Bodo"') >= 0 && hL.indexOf('glD') < 0 && /glNeu/.test(hL);
console.log((lok ? 'ok  ' : 'FEHL') + ' Stichwortliste: Zeilen fragen die Spielleitung, keine Posten, „neu“ aus den Tagen');
if (!lok) fehlgeschlagen++;

// Ohne die anderen Tische: Querverweise bleiben ungeprüft, die Prüfung sagt das als Hinweis
var ohne = pruefe(gl(), { spielstand: SPIELSTAND, spoiler: SPOILER });
var sagt = ohne.ok && ohne.hinweise.some(function (h) { return /ungeprüft/.test(h); });
console.log((sagt ? 'ok  ' : 'FEHL') + ' glossar: ohne Karte, Gepäck, Logbuch und Figuren nur Hinweise, keine Sperre');
if (!sagt) fehlgeschlagen++;

// Laufzeitsperre: Einträge ohne gültige Art oder ohne gültigen Posten werden nicht gezeigt
var d2 = gl();
d2.eintraege.push({ id: 'x', name: 'Ortwin', art: 'person', wissen: [{ text: 'Führer des Kults.', bekannt: 'erraten' }] });
d2.eintraege.push({ id: 'y', name: 'Kapelle', art: 'kult', wissen: [{ text: 'versunken', bekannt: 'gesehen' }] });
d2.eintraege.push({ id: 'z', name: 'Laterne', art: 'ding', wissen: [{ text: 'der Kultisten', bekannt: 'gehoert' }] });
var sicht = glossar.sichtbar(d2).map(function (e) { return e.id; }), gesperrt = sicht.indexOf('x') < 0 && sicht.indexOf('y') < 0 && sicht.indexOf('z') < 0 && sicht.length === 7;
console.log((gesperrt ? 'ok  ' : 'FEHL') + ' Laufzeitsperre: ungültige Einträge und Posten ohne Quelle werden nicht gezeigt');
if (!gesperrt) fehlgeschlagen++;
var html = glossar.zeichne(d2), versteckt = html.indexOf('Ortwin') < 0 && html.indexOf('Kapelle') < 0 && html.indexOf('der Kultisten') < 0 && html.indexOf('🎭 Wenzel') >= 0;
console.log((versteckt ? 'ok  ' : 'FEHL') + ' Zeichnen: gesperrte Einträge fehlen im HTML, 🎭 steht vor der fremden Figur');
if (!versteckt) fehlgeschlagen++;

// Textfassung
var text = glossar.alsText(gl());
var tok = /### Personen/.test(text) && /\*\*🎭 Wenzel Hartlieb\*\*/.test(text) && /\*\*Jaro Brandt\*\* 🩸/.test(text) && /\(von Bodo, Tag 3\)/.test(text);
console.log((tok ? 'ok  ' : 'FEHL') + ' Textfassung: Rubriken, 🎭, 🩸 und Herkunft je Posten');
if (!tok) fehlgeschlagen++;

console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfungen fehlgeschlagen' : 'Alle Prüfungen bestanden');
process.exit(fehlgeschlagen ? 1 : 0);
