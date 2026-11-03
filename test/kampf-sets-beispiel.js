// Beispiel für die Kampfkarte 1.11: ein Kampf auf einem Kachelset, erfunden. Dieselben Zeilen wie immer, dazu `gelaende`;
// `?` ist, was die Figur noch nicht sieht, `zeichnung` ändert nur das Bild. Keine Namen aus einem Spielstand.
'use strict';
var BODEN = [
  '.....dd......:::....~~~~~~',
  '..O..d.....:::::...i~~~~~~',
  '............:::....i~~~~~~',
  '...LLLLLL..........ii~~~~~',
  '...LllhhL...........i~~~~~',
  '...LlrllL...x.......eeeeee',
  '...L????L...........i~~~~~',
  '...L????L.........ii~~~~~~',
  '...LL+LLL.......u.i~~~~~~~',
  '..........o........i~~~~~~',
  '.O......k.......O..i~~~~~~',
  '............//.....ii~~~~~'
];
var HOEHE = [
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000',
  '00000000000000000000000000'
];
var FIGUR = { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', feld: '8/J', bewegung: 9, tp: [22, 27],
  waffen: [{ name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] }],
  zauber: [{ name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 }],
  aktionen: [{ name: 'Hilfe', wirkung: 'Vorteil für den Nächsten, der das Ziel angreift' }] };
module.exports = {
  ganz: { kampf: 'beispiel-111', nr: 5, ganz: true, gelaende: 'kueste', titel: 'Fischerhütte am Ufer', runde: 1, stand: 'Beispiel 1.11', figur: 'pf', spalten: 26, zeilen: 12,
    boden: BODEN, hoehe: HOEHE, reihenfolge: ['pf', 'r1', 'r2'], zeichnung: { kochtopf: ['6/F'], erloschen: ['17/I'], drehung: { '13/F': 90 } },
    notizen: [{ feld: '6/I', text: 'Tür' }], licht: [{ feld: '10/J', hell: 2, daemmer: 4 }],
    wesen: [FIGUR, { id: 'r1', name: 'Räuber 1', kurz: 'R1', art: 'gegner', feld: '11/H', reichweite: 1.5, bewegung: 9 }, { id: 'r2', name: 'Räuber 2', kurz: 'R2', art: 'gegner', feld: '21/F', reichweite: 1.5, bewegung: 9 }] },
  spaeter: { kampf: 'beispiel-111', nr: 6, runde: 2, aendern: [['5/G', ['llll', 'llTT']]], wesen: [{ id: 'pf', feld: '10/I', tp: [19, 27] }, { id: 'r1', feld: '11/I', zustand: 'verwundet' }, { id: 'r2', feld: '21/F' }] }
};
