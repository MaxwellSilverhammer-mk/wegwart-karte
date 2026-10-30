// Beispiel für die Kampfkarte 1.3: Kacheln (Erde, Gras, Schlamm, Eis, Dickicht, seichtes und tiefes Wasser), eine Böschung,
// Waffen mit Modi, Zauber (einer mit Waffe), Zustände mit Plakette und Wunden. Erfundener Ort (Furt am Mühlbach), erfundene
// Figur mit den Werten einer Barden-Stufe 4 ohne Namen aus einem Spielstand.
'use strict';
function z(s) { if (s.length !== 20) throw new Error('Zeile hat ' + s.length + ': ' + s); return s; }
module.exports = {
  nr: 11, titel: 'Furt am Mühlbach', runde: 2, stand: 'Beispiel 1.3', figur: 'pf', spalten: 20, zeilen: 8,
  ziel: 'Über die Furt, bevor die Räuber nachsetzen',
  uhren: [{ name: 'Nebel', rest: 3 }],
  lage: ['Morgengrauen', 'der Bach ist eiskalt'],
  reihenfolge: ['r3', 'pf', 'r1', 'r2', 'r4'],
  boden: [
    'ggggggggeeee....eeee',
    'gggddgggeeee....eeee',
    'ggggggggeeee..../eee',
    'mmgggggg,,,,,.../eee',
    '~~~~~,,,,,,,~~~~~~~~',
    '~~~~~~~,,,,,~~~~~~~~',
    'iiggggg,,,,,ggggggee',
    'iiggggggggggggggggee'
  ].map(z),
  hoehe: [
    '00000000000000002222',
    '00000000000000002222',
    '00000000000000001222',
    '00000000000000001222',
    '00000000000000000000',
    '00000000000000000000',
    '00000000000000000000',
    '00000000000000000000'
  ].map(z),
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 9, y: 3, bewegung: 9,
      waffen: [
        { name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] },
        { name: 'Dolch', bonus: 4, schaden: '1W4+2', typ: 'Stich', modi: [{ name: 'Nahkampf', reichweite: 1.5 }, { name: 'geworfen', reichweite: [6, 18] }] }
      ],
      zauber: [
        { name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 },
        { name: 'Zielsicherer Schlag', mit: 'waffe', typ: 'gleißend' },
        // seit 1.4: Zauber mit Rettungswurf und Heilung
        { name: 'Dissonant Whispers', rettung: 'WEI', sg: 12, schaden: '3W6', typ: 'psychisch', reichweite: 18, wirkung: 'halb bei Erfolg; muss mit seiner Reaktion fliehen' },
        { name: 'Healing Word', heilung: '2W4+2', reichweite: 18 }
      ], tp: [8, 27] },
    { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 7, y: 2, zustaende: ['ergibt sich'], notiz: 'hat den Spieß fallen lassen' },
    { id: 'r2', name: 'Räuber 2', art: 'gegner', x: 11, y: 2, zustand: 'schwer verletzt, am Boden', zustaende: ['vergiftet'] },
    { id: 'r3', name: 'Räuber 3', art: 'gegner', x: 18, y: 3, reichweite: 3, notiz: 'Spieß, auf der Böschung' },
    { id: 'r4', name: 'Räuber 4', art: 'gegner', x: 4, y: 7, zustaende: ['bewusstlos'] },
    { id: 'h', name: 'Hanno', kurz: 'H', art: 'gefolge', x: 10, y: 4, zustaende: ['inspiriert', 'liegend', 'vergiftet', 'verängstigt', 'gepackt'] }
  ],
  notizen: [{ x: 10, y: 5, text: 'Furt' }, { x: 18, y: 2, text: 'Böschung' }],
  hinweis: 'Beispiel 1.3: Tipp zweimal auf das Langschwert (beidhändig), dann auf Zielsicherer Schlag; Räuber 1 ergibt sich und bedroht nichts.'
};
