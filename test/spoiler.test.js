// Prüft die Spoilerprüfung an einer erfundenen Mini-Welt: Was im Spielstand steht, geht durch;
// alles aus der Spoilerdatei oder aus dem Nichts wird gesperrt. Läuft ohne private Dateien.
// Die echten Kartendaten einer Figur prüft die Spielleitung mit pruefen.js in ihrem Projekt.
'use strict';
var path = require('path');
var karte = require(path.join(__dirname, '..', 'karte.js'));

var SPIELSTAND = [
  '# Probekarte – Spielstand der Probefigur · Stand: Tag 3',
  '## Karte (was sie kennt)',
  '- Hafenstadt – Mühlfurt 5 Stunden auf der Küstenstraße. Die Furt ist nachts gesperrt.',
  '- Mühlfurt – Zur Alten Eiche 3 Stunden über den Damm; der Wirt heißt Bodo.',
  '- Kanu Mühlfurt – Rohrdorf vier Stunden (laut Fischer Jost).',
  '- Hinter Rohrdorf liegt der Schwarze Weiher, von dem die Alte Grit erzählt hat; noch nicht gesehen.',
  '- Der Weg von der Alten Eiche zum Kapellenhügel steht auf der Karte des Vogts.',
  '- Gerücht: Beim Weiher sollen nachts Lichter brennen (Grit).'
].join('\n');
var SPOILER = [
  '# SPOILER',
  '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Ortwin.',
  '- Rohrdorf – Schwarzer Weiher 2 Stunden mit dem Kanu. Kapellenhügel – Weiher 1 Stunde über den Geheimpfad.',
  '- Das Dorf Nesselbrook kennt die Figur noch nicht.'
].join('\n');

function daten() {
  return {
    titel: 'Probekarte', stand: 'Stand: Tag 3', kartenquelle: 'Karte des Vogts',
    orte: [
      { id: 'hafenstadt', name: 'Hafenstadt', x: 0, y: 0, art: 'stadt', bekannt: 'gesehen' },
      { id: 'muehlfurt', name: 'Mühlfurt', x: 5, y: 0, art: 'furt', bekannt: 'gesehen', notiz: 'Die Furt ist nachts gesperrt.' },
      { id: 'eiche', name: 'Zur Alten Eiche', namen: ['Alten Eiche'], x: 7, y: 2, art: 'gasthaus', bekannt: 'gesehen', notiz: 'Wirt Bodo.' },
      { id: 'rohrdorf', name: 'Rohrdorf', x: 6, y: 4, art: 'pfahldorf', bekannt: 'gesehen' },
      { id: 'weiher', name: 'Schwarzer Weiher', namen: ['Schwarze Weiher', 'Schwarzen Weiher'], x: 7, y: 6, art: 'stelle', bekannt: 'gehoert', quelle: 'Grit', notiz: 'Nachts sollen Lichter brennen (Grit). Noch nicht gesehen.' },
      { id: 'kapelle', name: 'Kapellenhügel', x: 10, y: 3, art: 'ruine', bekannt: 'karte' }
    ],
    wege: [
      { von: 'hafenstadt', nach: 'muehlfurt', art: 'strasse', bekannt: 'gesehen', zeit: '5 h' },
      { von: 'muehlfurt', nach: 'eiche', art: 'damm', bekannt: 'gesehen', zeit: '3 h' },
      { von: 'muehlfurt', nach: 'rohrdorf', art: 'wasser', bekannt: 'gehoert', quelle: 'Jost', zeit: '4 h Kanu' },
      { von: 'eiche', nach: 'kapelle', art: 'pfad', bekannt: 'karte' }
    ],
    notizen: [{ ort: 'weiher', text: 'Lichter (Grit)' }]
  };
}

var faelle = {
  'Ort, der nur in der Spoilerdatei steht': function (d) { d.orte.push({ id: 'nesselbrook', name: 'Nesselbrook', x: 12, y: 8, art: 'dorf', bekannt: 'karte' }); },
  'Notiz mit Namen aus der Spoilerdatei': function (d) { d.notizen.push({ ort: 'weiher', text: 'Kultführer Ortwin' }); },
  'Reisezeit, die nur die Spielleitung kennt': function (d) { d.wege.push({ von: 'rohrdorf', nach: 'weiher', art: 'wasser', bekannt: 'gehoert', quelle: 'Grit', zeit: '2 h Kanu' }); },
  'Weg, den keine Spielstandzeile verbindet': function (d) { d.wege.push({ von: 'kapelle', nach: 'weiher', art: 'pfad', bekannt: 'karte' }); },
  'falsche Reisezeit': function (d) { d.wege[0].zeit = '7 h'; },
  'unbekanntes Feld mit Geheimtext': function (d) { d.orte[0].geheim = 'versunkene Kapelle'; },
  'Hörensagen ohne Quelle': function (d) { delete d.orte[4].quelle; },
  'Quelle, die der Spielstand nicht kennt': function (d) { d.orte[4].quelle = 'Ortwin'; },
  'Spoilername in der id': function (d) { d.orte.push({ id: 'nesselbrook-furt', name: 'Mühlfurt', x: 5, y: 1, art: 'furt', bekannt: 'karte' }); },
  'ungültige Herkunft': function (d) { d.orte[0].bekannt = 'spoiler'; },
  'Wort, das nirgends steht': function (d) { d.orte[1].notiz += ' Wirt Zebulon.'; },
  'Zahl, die nirgends steht': function (d) { d.orte[1].notiz += ' 73 Stunden.'; },
  'Gebietsname aus der Spoilerdatei': function (d) { d.gebiete = [{ art: 'wald', name: 'Geheimpfad', punkte: [[0, 0], [1, 0], [1, 1]] }]; },
  'Weg zu einem Ort, der nicht in den Orten steht': function (d) { d.wege.push({ von: 'eiche', nach: 'nesselbrook', art: 'pfad', bekannt: 'karte' }); },
  'Notiz ohne Ort und Lage': function (d) { d.notizen.push({ text: 'Lichter' }); },
  'ohne Spoilerdatei': null,
  'ohne Spielstand': null
};

var fehlgeschlagen = 0;
var echt = karte.pruefen(daten(), { spielstand: SPIELSTAND, spoiler: SPOILER });
console.log((echt.ok ? 'ok  ' : 'FEHL') + ' saubere Kartendaten gehen durch' + (echt.ok ? '' : ': ' + echt.fehler.join(' | ')));
if (!echt.ok) fehlgeschlagen++;
Object.keys(faelle).forEach(function (name) {
  var d = daten(), q = { spielstand: SPIELSTAND, spoiler: SPOILER };
  if (faelle[name]) faelle[name](d);
  if (name === 'ohne Spoilerdatei') q.spoiler = '';
  if (name === 'ohne Spielstand') q.spielstand = '';
  var r = karte.pruefen(d, q);
  console.log((r.ok ? 'FEHL' : 'ok  ') + ' ' + name + (r.ok ? ' – DURCHGELASSEN' : ' → ' + r.fehler[0]));
  if (r.ok) fehlgeschlagen++;
});

// Laufzeitsperre: Was keine gültige Herkunft hat, wird nicht gezeichnet
var d2 = daten();
d2.orte.push({ id: 'nesselbrook', name: 'Nesselbrook', x: 12, y: 8, art: 'dorf', bekannt: 'geheim' });
d2.wege.push({ von: 'eiche', nach: 'nesselbrook', art: 'pfad' });
var e = karte.zeichne(d2);
var leck = e.svg.indexOf('Nesselbrook') >= 0 || e.orte.some(function (o) { return o.id === 'nesselbrook'; }) || e.liste.filter(function (x) { return x.typ === 'weg'; }).length !== 4;
console.log((leck ? 'FEHL' : 'ok  ') + ' Laufzeitsperre: Ort und Weg ohne gültige Herkunft erscheinen nicht');
if (leck) fehlgeschlagen++;

console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfungen fehlgeschlagen' : 'Alle Prüfungen bestanden');
process.exit(fehlgeschlagen ? 1 : 0);
