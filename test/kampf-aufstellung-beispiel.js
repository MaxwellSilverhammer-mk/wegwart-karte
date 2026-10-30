// Beispiel für die Kampfkarte 1.8 (Stufe C): ein geplanter Hinterhalt vor dem Initiativewurf, erfunden. Der Hohlweg am Köhlerhag
// läuft von West nach Ost (Erde, Ebene 0); zu beiden Seiten Böschungen und der Hag auf Ebene 1 (Gras, Dickicht), im Südwesten die
// Köhlerhütte mit einer Tür, die der Köhler gerade verrammelt (Notiz mit Fortschritt „Tür 1/3“), im Hohlweg ein Lockkarren und ein
// Mauerrest als Deckung. Die Aufstellungsfelder (`aufstellung`) liegen hinter dem Mauerrest und auf der Südböschung; die Figur, ihre
// Gefährtin (Gefolge, `aufstellen: true`) und ihr Hund (Tier, zahm, `aufstellen: true`) stehen noch an der Hütte und werden gesetzt.
// Alle fünf Arten sind da: Figur, Gefolge, Gegner (zwei gesehen, einer außer Sicht), Unbeteiligter, Tier. Keine Reihenfolge, denn
// die Initiative ist noch nicht gewürfelt. Keine Namen aus einem Spielstand.
'use strict';
function z(s) { if (s.length !== 30) throw new Error('Zeile hat ' + s.length + ': ' + s); return s; }
module.exports = {
  nr: 31, titel: 'Hinterhalt am Köhlerhag', runde: 0, stand: 'Beispiel 1.8', figur: 'pf', spalten: 30, zeilen: 14,
  ziel: 'Den Karren im Hohlweg stellen, bevor er den Hag verlässt',
  uhren: [{ name: 'Karren', rest: 3 }],
  lage: ['Abenddämmerung', 'Wind von Osten: man hört die Räder schon'],
  hinweis: 'Noch ist niemand in Reichweite.',
  //         123456789012345678901234567890
  boden: [
    'ddgggggddgggggggggdddgggggdggg',
    'dgggggggggggggggggggdgggggggdg',
    'ggggggggggggggggggggggggggggdg',
    'gggggggggggggggggggggOgggggggg',
    'gggggggggggggggggggggggggggggg',
    'ggggggggggggoooggggggggggggggg',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'eeeeeeeeeeeeOeeeeeeeeeeeeeeeee',
    'gggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggg',
    'ggg####ggggggggggggggggggggddg',
    'ggg#==#ggggggggggggdgggggggggg',
    'ggg#==+ggggggggggggggggggggggg',
    'ggg####gggggggggggggggdddggggg'
  ].map(z),
  // Böschungen und Hag auf Ebene 1, der Hohlweg auf Ebene 0; keine Treppen, die Böschung ist eine Kante mit Schatten
  hoehe: [
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '000000000000000000000000000000',
    '000000000000000000000000000000',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111',
    '111111111111111111111111111111'
  ].map(z),
  // hinter dem Mauerrest (Zeile E) und auf der Südböschung (Zeile I)
  aufstellung: [
    { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 },
    { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }
  ],
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 8, y: 10, bewegung: 9, tp: [27, 27],
      waffen: [
        { name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] },
        { name: 'Dolch', bonus: 4, schaden: '1W4+2', typ: 'Stich', leicht: true, modi: [{ name: 'Nahkampf', reichweite: 1.5 }, { name: 'geworfen', reichweite: [6, 18] }] }
      ],
      zauber: [
        { name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 },
        { name: 'Zielsicherer Schlag', mit: 'waffe', typ: 'gleißend' },
        { name: 'Dissonant Whispers', rettung: 'WEI', sg: 12, schaden: '3W6', typ: 'psychisch', reichweite: 18, wirkung: 'halb bei Erfolg; muss mit seiner Reaktion fliehen; Taube sind nicht betroffen' },
        { name: 'Sleep', reichweite: 27, wirkung: '5W8 TP in einer Kugel von 6 m, die Schwächsten zuerst' }
      ],
      bonus: [
        { name: 'Healing Word', art: 'heilung', ziel: 'jedes', reichweite: 18, heilung: '2W4+2', wirkung: 'Grad 1' },
        { name: 'Bardische Inspiration', art: 'inspiration', ziel: ['gefolge', 'gegner', 'npc', 'tier'], reichweite: 18, wirkung: 'W6; ein Wesen, das dich hört' },
        { name: 'Dolch', art: 'waffe', ziel: 'gegner', waffe: 'Dolch' }
      ],
      aktionen: [{ name: 'Hilfe', wirkung: 'Vorteil für den Nächsten, der das Ziel angreift' }, { name: 'Ausweichen', wirkung: 'Angriffe gegen dich mit Nachteil, GES-Rettungswürfe mit Vorteil' }] },
    // seit 1.8: `aufstellen: true` lässt die Gefährtin und den Hund mit aufstellen; die Figur immer
    { id: 'ta', name: 'Tamsin', kurz: 'TA', art: 'gefolge', x: 7, y: 10, tp: [9, 11], aufstellen: true, notiz: 'Kurzbogen, kennt den Hag' },
    { id: 'br', name: 'Brock', kurz: 'BR', art: 'tier', x: 8, y: 11, zahm: true, aufstellen: true, notiz: 'Hund, knurrt nach Osten' },
    { id: 'sp', name: 'Späher', kurz: 'SP', art: 'gegner', x: 26, y: 8, reichweite: 1.5, bewegung: 9, notiz: 'geht dem Karren voraus, Knüppel' },
    { id: 'tr', name: 'Treiber', kurz: 'TR', art: 'gegner', x: 29, y: 7, notiz: 'Armbrust über der Schulter' },
    { id: 'ds', name: 'Dritter', kurz: 'D3', art: 'gegner', x: 24, y: 4, gesehen: false, notiz: 'bog vorhin in den Hag ab' },
    { id: 'jo', name: 'Köhler Jorin', kurz: 'JO', art: 'npc', x: 5, y: 10, notiz: 'will nur seine Hütte heil behalten' }
  ],
  // seit 1.8: `fortschritt: [1, 3]` zeigt „Tür 1/3“ mit Balken: der Köhler verrammelt seine Tür, drei Runden braucht er
  notizen: [{ x: 7, y: 13, text: 'Tür', fortschritt: [1, 3] }, { x: 13, y: 8, text: 'Lockkarren' }, { x: 13, y: 6, text: 'Mauerrest' }, { x: 2, y: 7, text: 'Hohlweg' }]
};
