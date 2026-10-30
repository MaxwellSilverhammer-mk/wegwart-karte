// Beispiel für die Kampfkarte 1.5 (Stufe B): eine Brücke über tiefes Wasser, ein Zollhaus mit Dach (Höhe 2) und Leiter,
// Nebel am rechten Rand, die Figur liegend auf der Brücke, Bonusaktionen (Heilung, Inspiration, Zweitwaffe), ein Unbeteiligter,
// und ein Ausschnitt mit `ursprung`, 36 × 16 Felder, in dem die Figur in der Mitte steht, damit alle vier Pfeile zum
// Blättern erscheinen. Erfundener Ort (Zollbrücke am Schwarzen Graben), erfundene Figur mit den Werten einer Barden-Stufe 4,
// keine Namen aus einem Spielstand.
'use strict';
function z(s) { if (s.length !== 36) throw new Error('Zeile hat ' + s.length + ': ' + s); return s; }
module.exports = {
  nr: 14, titel: 'Zollbrücke am Schwarzen Graben', runde: 3, stand: 'Beispiel 1.5', figur: 'pf', spalten: 36, zeilen: 16, ursprung: [10, 'C'],
  ziel: 'Über die Brücke, bevor der Schütze nachlädt',
  uhren: [{ name: 'Nebel', rest: 2 }],
  lage: ['früher Morgen', 'die Planken sind glatt'],
  reihenfolge: ['sch', 'pf', 'zo', 'r1', 'ha', 'hu', 'fa'],
  //            1234567890123456789012345678901234567890
  boden: [
    'gggggggggggggd~~~~ggggggggggggggg???',
    'gggggggggggggd~~~~ggggg######ggggg??',
    'gggggggggggggd~~~~ggggg#====#ggggg??',
    'ggggggggggggdd~~~~ggggg#====/gggg???',
    'gggggggggggggd~~~~ggggg#====#ggggg??',
    'ggggggggggggg,~~~~,gggg######ggggg??',
    'eeeeeeeeeeeee,~~~~,eeoeeeeeeeeeeg???',
    'eeeeeeeeeeeeee====eeeeeeeeeeeeeeg???',
    'eeeeeeeeeeeeee====eeeeeeeeeeeeeeg???',
    'eeeeeeeeeeeee,~~~~,eeeoeeeeeeeeeg???',
    'gggggggggggg,,~~~~,gggggggggggggg???',
    'gggggggggggmm,~~~~,ggggggggggggggg??',
    'gggggggggmmmmd~~~~dgggggggggggggg???',
    'ggggggggmmmmmd~~~~ddggggggggggggg???',
    'ggggggggmmmmdd~~~~ddgggggggggggg????',
    'gggggggggmmddd~~~~ddgggggggggggg????'
  ].map(z),
  hoehe: [
    '000000000000000000000000000000000000',
    '000000000000000000000002222220000000',
    '000000000000000000000002222220000000',
    '0000000000000000000000022222b0000000',
    '000000000000000000000002222220000000',
    '000000000000000000000002222220000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000',
    '000000000000000000000000000000000000'
  ].map(z),
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 16, y: 8, bewegung: 9, tp: [14, 27], zustaende: ['liegend'],
      waffen: [
        { name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] },
        { name: 'Dolch', bonus: 4, schaden: '1W4+2', typ: 'Stich', modi: [{ name: 'Nahkampf', reichweite: 1.5 }, { name: 'geworfen', reichweite: [6, 18] }] }
      ],
      zauber: [
        { name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 },
        { name: 'Zielsicherer Schlag', mit: 'waffe', typ: 'gleißend' },
        { name: 'Dissonant Whispers', rettung: 'WEI', sg: 12, schaden: '3W6', typ: 'psychisch', reichweite: 18, wirkung: 'halb bei Erfolg; muss mit seiner Reaktion fliehen' }
      ],
      // seit 1.5: Bonusaktionen; Healing Word steht hier, nicht mehr unter `zauber`
      bonus: [
        { name: 'Healing Word', art: 'heilung', ziel: 'jedes', reichweite: 18, heilung: '2W4+2', wirkung: 'Grad 1' },
        { name: 'Bardische Inspiration', art: 'inspiration', ziel: ['gefolge', 'gegner', 'npc', 'tier'], reichweite: 18, wirkung: 'W6; ein Wesen, das dich hört' },
        { name: 'Dolch', art: 'waffe', ziel: 'gegner', waffe: 'Dolch' }
      ] },
    { id: 'ha', name: 'Hanno', kurz: 'H', art: 'gefolge', x: 14, y: 9, tp: [3, 11], zustand: 'schwer verletzt' },
    { id: 'zo', name: 'Zöllner', kurz: 'ZÖ', art: 'gegner', x: 20, y: 8, reichweite: 3, notiz: 'Spieß' },
    { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 19, y: 10, zustand: 'angeschlagen' },
    { id: 'sch', name: 'Schütze', kurz: 'S', art: 'gegner', x: 26, y: 4, notiz: 'Armbrust, auf dem Dach' },
    { id: 'hu', name: 'Hund', kurz: 'HU', art: 'gegner', x: 21, y: 9 },
    { id: 'fa', name: 'Fährmann', kurz: 'FÄ', art: 'npc', x: 12, y: 11, notiz: 'duckt sich hinter dem Kahn' }
  ],
  notizen: [{ x: 16, y: 10, text: 'Brücke' }, { x: 26, y: 2, text: 'Zollhaus' }, { x: 29, y: 5, text: 'Leiter' }],
  hinweis: 'Beispiel 1.5: Tipp auf „Healing Word“, dann auf Hanno; „Aufstehen“ abwählen, um liegen zu bleiben.'
};
