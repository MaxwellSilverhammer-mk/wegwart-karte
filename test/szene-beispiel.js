'use strict';
// Die erfundene Welt für test/szene.test.js: Arbeitsordner des Buchs (Glossar, Geschichte, Logbuch), Ordner der Ablage
// (Spielstand, Spoilerdatei, Wissensbuch, Werkbank) und Sitzungsnotizen. Was nur Werkbank, Wissensbuch und Spoilerdatei
// wissen, steht in GEHEIM: Mit --ohne-sl darf davon nichts im Blatt stehen.
var fs = require('fs'), path = require('path');

var BUCH = {
  '02_glossar.md': [
    '# Glossar',
    '*Stand: Tag 9 · Gefahr nach Stufe 2 · Figur: Probefigur*',
    '',
    '### Personen',
    '- **Bodo** (freundlich) · auch: der Wirt · Ort: Rohrdorf · Logbuch: Die Lichter am Weiher',
    '  Wirt der Alten Eiche in Rohrdorf.',
    '  - Wirt der Alten Eiche in Rohrdorf. (gesehen, Tag 3)',
    '  - Beim Schwarzen Weiher brennen nachts Lichter, zuletzt bei Vollmond. (von Bodo, Tag 3)',
    '- **Jost** (unklar) · Ort: Schwarzer Weiher',
    '  Fischer am Weiher, fährt nachts nicht mehr hinaus.',
    '  - Fischt nachts nicht mehr. (von Jost, Tag 4)',
    '- **Wenzel Hartlieb** (unklar) · auch: der Zöllner',
    '  Zöllner an der Brücke, ein alter Mann.',
    '  - Sah zu, als Jaro Brandt dich niederschlug. (gesehen, Tag 8)',
    '- **Jaro Brandt** ☠️ (feindlich) · auch: Jaro',
    '  Schläger an der Brücke.',
    '  - Schlug dich an der Brücke nieder. (gesehen, Tag 8)',
    '- **🎭 Gerlind von Aue** (freundlich)',
    '  Eine Reisende mit Laute, Figur eines anderen Spielers.',
    '  - Hat in der Alten Eiche einen Brief für dich dagelassen. (von Bodo, Tag 7)',
    '- **Ida** (freundlich)',
    '  Magd in der Alten Eiche.',
    '  - Bringt morgens Suppe. (gesehen, Tag 3)',
    '- **Ole Kramer** · Ort: Rohrdorf',
    '  Fuhrmann aus Rohrdorf.',
    '  - Fährt jeden Markttag nach Mühlfurt. (von Bodo, Tag 5)',
    '- **Ole Wendt**',
    '  Einer der Fährleute am Weiher.',
    '  - Setzt für zwei Kupfer über. (gesehen, Tag 4)',
    '- **Bo** (freundlich)',
    '  Bodos Hund.',
    '  - Bellt jeden Fremden an. (gesehen, Tag 3)',
    '',
    '### Orte',
    '- **Rohrdorf**',
    '  Dorf an der Brücke.',
    '  - Ein Dorf mit Gasthaus, Brücke und Zoll. (gesehen, Tag 3)',
    '- **Schwarzer Weiher**',
    '  Weiher hinter dem Schilf.',
    '  - Am Weiher sollen nachts Lichter brennen. (von Bodo, Tag 3)',
    '- **Hof Brandt**',
    '  Ein Hof an der Straße nach Mühlfurt.',
    '  - Ein Hof mit hohem Zaun. (gesehen, Tag 8)'
  ].join('\n') + '\n',
  '02_geschichte.md': [
    '# Was bisher geschah',
    '',
    '### Sitzung 1, Tag 3 bis 5',
    '**Ankunft in Rohrdorf.** Die Probefigur kehrt in der Alten Eiche ein. Bodo zapft ein Bier und erzählt vom Schwarzen Weiher, wo nachts Lichter brennen. Ida bringt Suppe.',
    '**Am Weiher.** Jost flickt ein Netz und sagt: „Nachts fahre ich nicht mehr hinaus.“ Ole Wendt setzt die Probefigur für zwei Kupfer über.',
    'Bodos Hund Bo läuft bis zum Ufer mit und bellt den Fährmann an.',
    '',
    '### Sitzung 2, Tag 7 bis 9',
    '**Die Brücke.** An der Brücke wartet Jaro Brandt. Er schlägt die Probefigur nieder; der Zöllner Wenzel Hartlieb sieht zu und rührt sich nicht.',
    '**Zurück in der Eiche.** Bodo gibt der Probefigur einen Brief, den Gerlind von Aue dagelassen hat. Hartliebs Leute trinken am Nebentisch.'
  ].join('\n') + '\n',
  '02_questlog.json': JSON.stringify({
    titel: 'Logbuch', stand: 'Stand: Tag 9', heute: 9, welttag: 9,
    termine: [{ tag: 14, text: 'Vollmond: Lichter am Weiher', mond: 'voll' }],
    auftraege: [
      { id: 'lichter', titel: 'Die Lichter am Weiher', art: 'neben', status: 'offen', text: 'Bodo will wissen, wer am Schwarzen Weiher nachts Licht macht.',
        glossar: ['Bodo', 'Schwarzer Weiher'], etappen: [{ text: 'Jost am Weiher nach den Lichtern gefragt (Tag 4).' }, { text: 'Bei Vollmond am Weiher wachen.' }] },
      // ohne text: Das Feld ist freiwillig (README, Logbuch)
      { id: 'bruecke', titel: 'Die Brücke bei Rohrdorf', art: 'faden', status: 'offen', glossar: ['Jaro Brandt'] },
      { id: 'suppe', titel: 'Suppe für Ida', art: 'neben', status: 'erledigt', text: 'Ida brauchte Kräuter.', etappen: [{ text: 'Kräuter gebracht (Tag 5).', erledigt: true }] }
    ],
    wort: [
      { an: 'Bodo', text: 'Ich sehe bei Vollmond am Weiher nach.', status: 'offen' },
      { von: 'Jost', text: 'Er rudert dich hinüber, wenn es hell ist.', status: 'offen' },
      { an: 'Ida', text: 'Kräuter bringe ich morgen.', status: 'eingeloest' }
    ]
  }, null, 1) + '\n'
};

var ABLAGE = {
  '02_spielstand.md': [
    '# Spielstand Probefigur',
    '*Regelwerk 4.9 · Stand: Welttag 9*',
    '',
    '## Jetzt: Zustand zu Beginn von Sitzung 3',
    '*Tag 9 · Abend · Alte Eiche in Rohrdorf · TP 9/14*',
    '- Bodo steht am Tresen; Ida bringt Suppe.',
    '- Jost ist am Weiher; Jaro Brandt ist nicht zu sehen.',
    'Titelbildschirm: Bodo winkt im Bild.',
    '',
    '## Der Auftrag',
    '- Bodo will wissen, wer am Schwarzen Weiher nachts Licht macht.'
  ].join('\n') + '\n',
  'werkbank.md': [
    '# Werkbank Probefigur',
    '**Stehende Dinge für Sitzung 2** · Bodo ist ein Mann',
    '**Stehende Dinge für Sitzung 3** · Bodo ist ein Mann mit Glatze · Jost ist ein Mann · Gerlind von Aue ist eine Frau, die nie den Hut abnimmt **Vor dem Abschicken** Statuszeile prüfen.'
  ].join('\n') + '\n',
  '03_spielleitung_SPOILER.md': [
    '# SPOILER Probefigur',
    '',
    '## Geheimnisse',
    '- Im Schwarzen Weiher liegt die versunkene Kapelle des Kults; der Kultführer heißt Hilmar.',
    '- Jost ist ein Spitzel des Kults und verrät die Probefigur an Tag 14.',
    '',
    '## Reaktionen',
    '- **Jost** (wenn die Probefigur nach der Kapelle fragt): lügt schlecht und schaut zum Wasser.',
    '- **Bodo** (wenn Jost erwähnt wird): wird still.',
    '',
    '## Stand',
    '### Stand nach Sitzung 1',
    '- **Jost:** fürchtet Hilmar.',
    '### Stand nach Sitzung 2',
    '- **Jost:** hat Hilmar von der Probefigur erzählt; rudert sie zur Kapelle, wenn sie fragt.',
    '- **Wenzel Hartlieb:** nimmt Silber von Jaro Brandt.',
    '**Neigung** Bodo +1 → +2 · Jost 0 → −1',
    '',
    '## Zeitleiste',
    '- **Tag 6:** Jost trifft Hilmar in der Kapelle.',
    '- **Jost, Tag 14:** lockt die Probefigur zum Weiher, wenn der Kult es will.'
  ].join('\n') + '\n',
  'wissensbuch.md': [
    '*Stand: Tag 9 · Figur: Probefigur*',
    '## Wer weiß was',
    '### Bodo',
    '- Die Probefigur fragt nach dem Schwarzen Weiher. (erlebt, Tag 3)',
    '### Jost',
    '- Die Probefigur fragt nach den Lichtern am Weiher. (erlebt, Tag 4)',
    '- Hilmar weiß von der Probefigur. (erlebt, Tag 6)'
  ].join('\n') + '\n'
};

var NOTIZEN = [
  '# Sitzungsnotizen, Sitzung 3',
  '- Bodo stellt der Probefigur Suppe hin, ohne Geld zu nehmen.',
  '- Jost wartet am Steg; er hat Angst vor dem Vollmond.'
].join('\n') + '\n';

// Wörter, die nur Werkbank, Wissensbuch oder Spoilerdatei kennen
var GEHEIM = ['Kapelle', 'Hilmar', 'Spitzel', 'Kult', 'Glatze', 'Hut abnimmt', 'lügt', 'Silber', 'still', 'lockt'];

// Schreibt die Welt nach <dir>/arbeit, <dir>/ablage und <dir>/notizen.md; aendern(datei, text) darf einzelne Dateien abwandeln
function schreibe(dir, aendern) {
  var a = path.join(dir, 'arbeit'), b = path.join(dir, 'ablage');
  fs.mkdirSync(a, { recursive: true }); fs.mkdirSync(b, { recursive: true });
  function hin(ordner, name, text) {
    if (aendern) text = aendern(name, text);
    if (text !== null) fs.writeFileSync(path.join(ordner, name), text);
  }
  Object.keys(BUCH).forEach(function (n) { hin(a, n, BUCH[n]); });
  Object.keys(ABLAGE).forEach(function (n) { hin(b, n, ABLAGE[n]); });
  hin(dir, 'notizen.md', NOTIZEN);
  return { buch: a, ablage: b, notizen: path.join(dir, 'notizen.md') };
}

module.exports = { BUCH: BUCH, ABLAGE: ABLAGE, NOTIZEN: NOTIZEN, GEHEIM: GEHEIM, schreibe: schreibe };
