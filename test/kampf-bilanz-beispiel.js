// Beispiel für die Kampfkarte 1.9: die Kampfbilanz nach dem Kampf, erfunden (Dammbrücke am Rohrgraben, die Szene des Probezugs 1.8,
// nachgebaut): ein Dammweg über einen Graben mit Planken, Schilf an den Ufern; nach drei Runden liegt der Köter, der Vorläufer hat sich
// im Graben ergeben, der Treiber ist in den Nebel geflohen, der Fuhrmann sitzt im Gras. `runde: 'vorbei'` und `bilanz` mit allem, was
// die Spielleitung freigibt; die Wunden kommen aus `tp` der Figur und des Gefolges. Keine Namen aus einem Spielstand.
'use strict';
function z(s) { if (s.length !== 30) throw new Error('Zeile hat ' + s.length + ': ' + s); return s; }
module.exports = {
  nr: 7, titel: 'Dammbrücke am Rohrgraben', runde: 'vorbei', stand: 'Beispiel 1.9', figur: 'pf', spalten: 30, zeilen: 12,
  lage: ['Nebel über dem Graben', 'Abend'],
  //         123456789012345678901234567890
  boden: [
    'ggggggggggggdd,,ddgggggggggggg', 'ggggggggggggdd,,ddgggggggggggg', 'ggggggggggggdd,,ddgOgggggggggg', 'ggggggggggggdd,,ddgggggggggggg',
    'ggggggggggggdd,,ddgggggggggggg', 'eeeeeeeeeeeeee==eeeeeeeeeeeeee', 'eeeeeeeeeeeeee==eeeeeeeeeeeeeO', 'ggggggggggggdd,,ddgggggggggggg',
    'ggggggggggggdd,,ddgggggggggggg', 'gggggggOggggdd,,ddgggggggggggg', 'ggggggggggggdd,,ddgggggggggggg', 'ggggggggggggdd,,ddgggggggggggg'
  ].map(z),
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 17, y: 6, bewegung: 9, tp: [22, 27], waffen: [{ name: 'Langschwert', bonus: 4, schaden: '1W8+2', typ: 'Hieb', reichweite: 1.5 }] },
    { id: 'ta', name: 'Tamsin', kurz: 'TA', art: 'gefolge', x: 16, y: 8, tp: [4, 11], zustand: 'verwundet' },
    { id: 'v', name: 'Vorläufer', kurz: 'V', art: 'gegner', x: 16, y: 7, zustand: 'schwer verletzt', zustaende: ['ergibt sich', 'liegend'] },
    { id: 'kt', name: 'Köter', kurz: 'KÖ', art: 'gegner', x: 18, y: 7, zustand: 'tot' },
    { id: 'fu', name: 'Fuhrmann', kurz: 'FU', art: 'npc', x: 29, y: 8, notiz: 'sitzt im Gras, Hände oben' }
  ],
  notizen: [{ x: 16, y: 6, text: 'Planke', fortschritt: [1, 2] }, { x: 3, y: 6, text: 'Dammweg' }],
  bilanz: {
    ausgang: 'Der Weg ist frei', satz: 'Der Karren steht, der Hund liegt, zwei Mann sind weg.',
    gegner: [{ id: 'kt', stand: 'gefallen', ep: 25 }, { id: 'v', stand: 'ergibt sich', ep: 25, text: 'ergibt sich, schwer verletzt' }, { name: 'Treiber', stand: 'geflohen', ep: 25, text: 'geflohen, ohne Waffe' }],
    anteile: [{ name: 'Probefigur', ep: 38 }, { name: 'Tamsin', ep: 37 }],
    beute: [{ text: 'Armbrust im Gras, 28/F', zeichen: 'stich' }, 'Karren mit Ochse und Fracht', { text: 'Beutel noch nicht durchsucht', zeichen: 'suchen' }],
    gefangene: ['Vorläufer, im Graben'],
    wunden: [{ id: 'pf', tp: [22, 27] }, { id: 'ta', tp: [4, 11], text: 'ein Bolzen im Arm' }],
    verbrauch: [{ text: 'Zauberplatz 2. Grades', zeichen: 'wirkung', weg: true }, { text: 'zwei Bolzen des Treibers im Graben', zeichen: 'stich' }],
    zeit: '3 Runden, kaum zwanzig Herzschläge',
    knoepfe: [{ text: 'Durchsuchen', prompt: 'Probefigur durchsucht den Köter und den Vorläufer, eine Minute je Körper' }, { text: 'Weiter', prompt: 'Weiter', haupt: true }]
  }
};
