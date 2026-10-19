// Prüft die Wissensprüfung für Inventar und Questlog an einer erfundenen Mini-Welt: Was im Spielstand
// steht, geht durch; alles aus der Spoilerdatei, aus dem Nichts oder gegen den Weltkalender wird gesperrt.
// Läuft ohne private Dateien. Die echten Daten einer Figur prüft die Spielleitung mit pruefen.js.
'use strict';
var path = require('path');
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var inventar = require(path.join(__dirname, '..', 'inventar.js'));
var questlog = require(path.join(__dirname, '..', 'questlog.js'));

var SPIELSTAND = [
  '# Probefigur – Spielstand · Stand: Welttag 9, 9. Patchwall 576 CY',
  '## Der Auftrag',
  '- Der Vogt von Mühlfurt schickt die Probefigur, die Brücke bei Rohrdorf zu prüfen. Frist: Tag 20. Lohn: 40 Goldadmirale.',
  '- EP: 350/900 bis Stufe 3.',
  '## Für die Spielleitung',
  '- Inventar und Questlog als Pergament: „Gepäck der Probefigur“ und „Logbuch“.',
  '## Inventar',
  'Trägt selbst, rund 7 kg: Kurzschwert 1 kg, Lederrüstung 5 kg, 2 Rationen 1 kg, Brief des Vogts.',
  'Geldbeutel: 12 Goldadmirale, 4 Silber.',
  '## Was bisher geschah',
  '- Der Vogt gab der Probefigur einen Brief: „Wer dies trägt, spricht für Mühlfurt.“',
  '- Bodo, der Wirt der Alten Eiche, erzählte: Beim Schwarzen Weiher brennen nachts Lichter. Er sah sie zuletzt bei Vollmond.',
  '- Fischer Jost bringt am Tag 12 Netze nach Rohrdorf.',
  '- Die Probefigur versprach Jost, ihn nicht zu verraten.',
  '## Glossar',
  '### Personen',
  '- **Bodo**: Wirt der Alten Eiche.',
  '- **Jost**: Fischer in Rohrdorf.',
  '### Dinge',
  '- **Brief des Vogts**: „Wer dies trägt, spricht für Mühlfurt.“'
].join('\n');
var SPOILER = [
  '# SPOILER',
  '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Ortwin.',
  '- Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.',
  '- Die Lichter am Weiher sind Laternen der Kultisten.'
].join('\n');

function inv() {
  return {
    titel: 'Gepäck der Probefigur', stand: 'Stand: Tag 9', geld: { ga: 12, sm: 4 },
    traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', staerke: 12, dinge: [
      { name: 'Kurzschwert', art: 'waffe', kg: 1 },
      { name: 'Lederrüstung', art: 'ruestung', kg: 5 },
      { name: 'Rationen', art: 'ration', anzahl: 2, kg: 0.5 },
      { name: 'Brief des Vogts', art: 'brief', wortlaut: 'Wer dies trägt, spricht für Mühlfurt.', herkunft: 'Der Vogt gab der Probefigur einen Brief.', glossar: 'Brief des Vogts' }
    ] }]
  };
}
function ql() {
  return {
    titel: 'Logbuch', stand: 'Stand: Tag 9', heute: 9, frist: 20, welttag: 9, ep: [350, 900, 3],
    termine: [
      { tag: 11, text: 'Vollmond: Lichter beim Schwarzen Weiher.', quelle: 'Bodo', mond: 'voll' },
      { tag: 12, text: 'Fischer Jost bringt Netze nach Rohrdorf.', quelle: 'Jost' },
      { tag: 20, text: 'Frist des Vogts.' }
    ],
    auftraege: [
      { id: 'bruecke', titel: 'Die Brücke bei Rohrdorf', art: 'haupt', status: 'offen', von: 'Der Vogt von Mühlfurt', frist: 20, lohn: '40 Goldadmirale',
        text: 'Die Brücke bei Rohrdorf prüfen.', quelle: 'Vogt', glossar: ['Bodo'],
        etappen: [{ text: 'Beim Schwarzen Weiher brennen nachts Lichter.', quelle: 'Bodo' }] }
    ],
    wort: [{ an: 'Jost', text: 'Ihn nicht zu verraten.', status: 'gehalten' }]
  };
}
function pruefe(art, d, q) {
  var m = art === 'inventar' ? inventar : questlog;
  return wissen.pruefe(d, m.SCHEMA, q || { spielstand: SPIELSTAND, spoiler: SPOILER }, m.zusatz);
}

var faelle = {
  inventar: {
    'Ding, das nur in der Spoilerdatei steht': function (d) { d.traeger[0].dinge.push({ name: 'Kultführer Ortwins Siegel', art: 'wertsache' }); },
    'Notiz mit Wort aus der Spoilerdatei': function (d) { d.traeger[0].dinge[0].notiz = 'Gefunden bei den Kultisten.'; },
    'Notiz, die verstreute Wörter neu zusammensetzt': function (d) { d.traeger[0].dinge[3].notiz = 'Bodo bringt den Brief nach Rohrdorf.'; },
    'Wortlaut, der so nirgends steht': function (d) { d.traeger[0].dinge[3].wortlaut = 'Wer dies trägt, zahlt in Rohrdorf keinen Zoll.'; },
    'Glossar-Stichwort, das es nicht gibt': function (d) { d.traeger[0].dinge[0].glossar = 'Kurzschwert'; },
    'Quelle, die der Spielstand nicht kennt': function (d) { d.traeger[0].dinge[0].quelle = 'Ortwin'; },
    'unbekanntes Feld mit Geheimtext': function (d) { d.traeger[0].dinge[0].geheim = 'versunkene Kapelle'; },
    'ungültige Art': function (d) { d.traeger[0].dinge[0].art = 'zauberding'; },
    'Name, der nirgends steht': function (d) { d.traeger[0].dinge.push({ name: 'Goldene Sanduhr', art: 'wertsache' }); },
    'Zahl, die nirgends steht': function (d) { d.traeger[0].dinge[0].notiz = 'Kostete 73 Goldadmirale.'; },
    'Spoilername in der id': function (d) { d.traeger[0].id = 'ortwin'; },
    'ohne Spoilerdatei': 'ohneSpoiler',
    'ohne Spielstand': 'ohneStand'
  },
  questlog: {
    'Termin aus der Spoilerdatei': function (d) { d.termine.push({ tag: 12, text: 'Jost verrät die Probefigur.' }); },
    'Etappe, die die Spoilerdatei umschreibt': function (d) { d.auftraege[0].etappen.push({ text: 'Die Lichter am Weiher sind Laternen.' }); },
    'Etappe mit Spoilerwort': function (d) { d.auftraege[0].etappen.push({ text: 'Die versunkene Kapelle finden.' }); },
    'Lore: falscher Vollmond': function (d) { d.termine[0].tag = 12; },
    'Lore: Vollmond im Text an einem anderen Tag': function (d) { d.termine[1].text = 'Vollmond: Fischer Jost bringt Netze nach Rohrdorf.'; },
    'Lore: falsche Stufengrenze': function (d) { d.ep = [350, 1000, 3]; },
    'Erfahrung, die nicht im Spielstand steht': function (d) { d.ep = [500, 900, 3]; },
    'Stand passt nicht zu heute': function (d) { d.stand = 'Stand: Tag 10'; },
    'Frist, die nicht im Spielstand steht': function (d) { d.frist = 21; },
    'Wort an jemanden, den es nicht gibt': function (d) { d.wort.push({ an: 'Ortwin', text: 'Ihn nicht zu verraten.', status: 'offen' }); },
    'unbelegter Auftragstext': function (d) { d.auftraege[0].text = 'Jost bewacht die Brücke bei Rohrdorf für den Wirt.'; },
    'ungültiger Status': function (d) { d.auftraege[0].status = 'geheim'; },
    'Mond ohne Welttag': function (d) { delete d.welttag; },
    'ohne Spoilerdatei': 'ohneSpoiler'
  }
};

var fehlgeschlagen = 0;
['inventar', 'questlog'].forEach(function (art) {
  var echt = pruefe(art, art === 'inventar' ? inv() : ql());
  console.log((echt.ok ? 'ok  ' : 'FEHL') + ' ' + art + ': saubere Daten gehen durch' + (echt.ok ? '' : ': ' + echt.fehler.join(' | ')));
  if (!echt.ok) fehlgeschlagen++;
  Object.keys(faelle[art]).forEach(function (name) {
    var d = art === 'inventar' ? inv() : ql(), q = { spielstand: SPIELSTAND, spoiler: SPOILER }, f = faelle[art][name];
    if (f === 'ohneSpoiler') q.spoiler = '';
    else if (f === 'ohneStand') q.spielstand = '';
    else f(d);
    var r = pruefe(art, d, q);
    console.log((r.ok ? 'FEHL' : 'ok  ') + ' ' + art + ': ' + name + (r.ok ? ' – DURCHGELASSEN' : ' → ' + r.fehler[0]));
    if (r.ok) fehlgeschlagen++;
  });
});

// Weltkalender: Daten und Mond (Regelwerk 8.1)
var kal = [
  [1, '1. Patchwall 576 CY', 'zunehmende Sichel'], [11, '11. Patchwall 576 CY', 'Vollmond'], [25, '25. Patchwall 576 CY', 'Dunkelmond'],
  [85, '1. Needfest 577 CY', null], [92, '1. Fireseek 577 CY', null], [365, '1. Patchwall 577 CY', null], [39, '11. Ready\'reat 576 CY', 'Vollmond']
];
kal.forEach(function (k) {
  var d = questlog.datumText(k[0]), m = questlog.mondName(questlog.mondPhase(k[0])), ok = d === k[1] && (!k[2] || m === k[2]);
  console.log((ok ? 'ok  ' : 'FEHL') + ' Weltkalender: Welttag ' + k[0] + ' = ' + d + ', ' + m);
  if (!ok) fehlgeschlagen++;
});

console.log(fehlgeschlagen ? fehlgeschlagen + ' Prüfungen fehlgeschlagen' : 'Alle Prüfungen bestanden');
process.exit(fehlgeschlagen ? 1 : 0);
