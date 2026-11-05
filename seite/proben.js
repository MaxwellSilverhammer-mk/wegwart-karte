/*
 * Proben für den Werkzeugkoffer im Eingang nach Oerik: je Tisch ein Beispiel aus der erfundenen Welt der Tests
 * (Rohrdorf, Mühlfurt, die Alte Eiche). Keine Daten einer Figur und nichts aus einem Revier (Regelwerk 4.8).
 */
window.PROBEN = {
  wuerfel: {
    art: 'probe', nr: 1, name: 'Überzeugen', bonus: 6, anlass: 'Bodo glaubt dir', modus: 'vorteil', grund: 'gute Vorbereitung',
    min: 10, minName: 'Silberzunge', held: true, sg: 15
  },
  karte: {
    titel: 'Rund um Rohrdorf', stand: 'Stand: Tag 9', kartenquelle: 'Karte des Vogts',
    orte: [
      { id: 'muehlfurt', name: 'Mühlfurt', x: 0, y: 0, art: 'stadt', bekannt: 'gesehen', notiz: 'Sitz des Vogts, der den Auftrag gab.' },
      { id: 'rohrdorf', name: 'Rohrdorf', x: 10, y: 2, art: 'dorf', bekannt: 'gesehen', notiz: 'Bodo führt hier die Alte Eiche. Jost fischt am Fluss.' },
      { id: 'bruecke', name: 'Brücke bei Rohrdorf', x: 15, y: 0, art: 'furt', bekannt: 'karte', notiz: 'Der Vogt will wissen, wer hier Zoll nimmt.' },
      { id: 'weiher', name: 'Schwarzer Weiher', x: 11, y: -5, art: 'stelle', bekannt: 'gehoert', quelle: 'Bodo', notiz: 'Nachts brennen dort Lichter, sagt Bodo.' }
    ],
    wege: [
      { von: 'muehlfurt', nach: 'rohrdorf', art: 'strasse', bekannt: 'gesehen', zeit: '3 Std.' },
      { von: 'rohrdorf', nach: 'bruecke', art: 'pfad', bekannt: 'karte', zeit: '1,5 Std.' },
      { von: 'rohrdorf', nach: 'weiher', art: 'pfad', bekannt: 'gehoert', quelle: 'Bodo', zeit: '1 Std.' }
    ],
    gebiete: [
      { art: 'wald', name: 'Eichenhang', beschriftung: [4, -4], punkte: [[-2, -7], [7, -8], [8, -2], [1, -1], [-3, -3]] },
      { art: 'felder', punkte: [[3, 3], [9, 4], [8, 8], [2, 8]] }
    ],
    notizen: [{ text: 'Lichter bei Vollmond?', ort: 'weiher', tinte: 'kohle' }]
  },
  gepaeck: {
    titel: 'Gepäck der Probefigur', stand: 'Stand: Tag 9', geld: { ga: 12, sm: 4, km: 7 },
    traeger: [
      { id: 'selbst', name: 'Probefigur', art: 'figur', staerke: 12, dinge: [
        { name: 'Kurzschwert', art: 'waffe', kg: 1, angriff: '+5', schaden: '1W6+3 Stich' },
        { name: 'Großvaters Dolch', art: 'waffe', kg: 0.5, marke: 'benannt', seltenheit: 'ungewoehnlich', zustand: 'rostig', angriff: '+5', schaden: '1W4+3 Stich' },
        { name: 'Lederrüstung', art: 'ruestung', kg: 5, rk: 11 },
        { name: 'Seil', art: 'seil', kg: 5, vorrat: [12, 15], einheit: 'm' },
        { name: 'Rationen', art: 'ration', anzahl: 3, kg: 0.5 },
        { name: 'Kerze', art: 'licht' },
        { name: 'Brief des Vogts', art: 'brief', wortlaut: 'Wer dies trägt, spricht für Mühlfurt.', marke: 'siegel' },
        { name: 'Zerbrochene Scheibe', art: 'fund', marke: 'unbekannt' }
      ] },
      { id: 'stute', name: 'Graue Stute', art: 'reittier', staerke: 16, faktor: 2, dinge: [
        { name: 'Decke', art: 'schlafzeug', kg: 1.5 },
        { name: 'Hafer', art: 'proviant', anzahl: 4, kg: 1 }
      ] }
    ]
  },
  logbuch: {
    titel: 'Logbuch', stand: 'Stand: Tag 9', heute: 9, frist: 20, welttag: 9, ep: [350, 900, 3],
    termine: [
      { tag: 11, text: 'Vollmond: Lichter beim Schwarzen Weiher.', quelle: 'Bodo', mond: 'voll' },
      { tag: 12, text: 'Fischer Jost bringt Netze nach Rohrdorf.', quelle: 'Jost' },
      { tag: 20, text: 'Frist des Vogts.' }
    ],
    auftraege: [
      { id: 'bruecke', titel: 'Die Brücke bei Rohrdorf', art: 'haupt', status: 'offen', von: 'Der Vogt von Mühlfurt', frist: 20, lohn: '40 GA',
        text: 'Die Brücke bei Rohrdorf prüfen.', quelle: 'Vogt',
        etappen: [{ text: 'Beim Schwarzen Weiher brennen nachts Lichter.', quelle: 'Bodo' }] }
    ],
    wort: [{ an: 'Jost', text: 'Ihn nicht zu verraten.', status: 'gehalten' }]
  },
  glossar: [
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
    '  Reisender mit einer grauen Stute.',
    '  - Fragte in Rohrdorf nach Lichtern. (von Fuhrmann, Tag 8)',
    '- **Jaro Brandt** 🩸 (feindlich)',
    '  - Der Schläger des Zöllners, schlug dich an der Brücke nieder. (gesehen, Tag 8)',
    '',
    '### Orte',
    '- **Schwarzer Weiher** · auch: Schwarzen Weiher · siehe: Lichter am Weiher',
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
  ].join('\n'),
  rast: {
    nr: 7, figur: 'Probefigur', ort: 'Rohrdorf, Alte Eiche', tp: [15, 21], tw: [2, 3, 8], kon: 1, plaetze: [[3, 4], [2, 2]],
    ressourcen: [{ name: 'Bardische Inspiration', frei: 1, max: 2, rast: 'lang' }], lied: { name: 'Lied der Erholung', w: 6 },
    essen: { rationen: 1, gepaeck: 3, traeger: 'Graue Stute' }, kurz: true, lang: true, held: false
  },
  handel: {
    nr: 4, ort: 'Rohrdorf', stand: 'Stand: Tag 8',
    hinweis: 'Stadtware kostet hier mehr; Fisch und Felle nimmt Ilse gern.',
    haendler: {
      name: 'Ilse', art: 'Krämerin', kasse: { ga: 3, sm: 18, km: 40 },
      waren: [
        { name: 'Ration', art: 'ration', preis: { sm: 5 }, anzahl: 6, kg: 1 },
        { name: 'Kerze', art: 'licht', preis: { km: 1 }, anzahl: 12 },
        { name: 'Hanfseil 15 m', art: 'seil', preis: { ga: 1 }, anzahl: 1, kg: 5 },
        { name: 'Pergament', art: 'schreibzeug', preis: { sm: 1 }, anzahl: 5 },
        { name: 'Tinte (Fläschchen)', art: 'schreibzeug', preis: { ga: 15 }, anzahl: 1, notiz: 'aus der Stadt, darum teuer' }
      ]
    },
    gepaeck: {
      titel: 'Gepäck der Probefigur', stand: 'Stand: Tag 8', geld: { ga: 12, sm: 3 },
      traeger: [{ id: 'figur', name: 'Probefigur', art: 'figur', staerke: 13, dinge: [
        { name: 'Kurzschwert', art: 'waffe', kg: 1, ankauf: { ga: 5 } },
        { name: 'Lederrüstung', art: 'ruestung', kg: 5 },
        { name: 'Kartenspiel', art: 'spiel', ankauf: { sm: 2, km: 5 } }
      ] }]
    }
  },
  kampf: {
    nr: 7, titel: 'Keller der Alten Eiche', runde: 2, stand: 'Stand: Tag 8, Nacht', figur: 'pf',
    boden: [
      '####################################',
      '#..........#.....o..~~~~~~~~~......#',
      '#..........#........~~~~~~~~~......#',
      '#....o.....+........~~~~~~~~~..O...#',
      '#..........#...::...~~~~~~~~~......#',
      '#..........#...::...,,,,,,,,,......#',
      '#....^^....#......................?#',
      '#....^^....#......................??',
      '#..........##########+#############',
      '#..........#?????????????????????',
      '#..........#?????????????????????',
      '####################################'
    ],
    wesen: [
      { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 4, y: 5, bewegung: 9 },
      { id: 'g', name: 'Gesine', kurz: 'G', art: 'gefolge', x: 5, y: 4 },
      { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 14, y: 3, zustand: 'verwundet' },
      { id: 'r2', name: 'Räuber 2', art: 'gegner', x: 17, y: 6 },
      { id: 'j', name: 'Jost', art: 'npc', x: 9, y: 2 }
    ],
    licht: [{ x: 8, y: 3, hell: 4, daemmer: 8 }],
    notizen: [{ x: 12, y: 4, text: 'Tür' }, { x: 22, y: 9, text: 'Tür, zu' }],
    hinweis: 'Die Fackel an der Wand brennt noch.'
  }
};
