// Erfundene Welt (wie in den anderen Tests): der Keller der Alten Eiche in Rohrdorf, Runde 3, mit den Feldern der
// Kampfkarte 1.2 (Stufe A): Waffen der Figur, Reichweite der Gegner, Reihenfolge, Ziel, Uhren und Lage. Keine Daten
// einer echten Figur; die Waffen sind Beispiele nach PHB.
module.exports = {
  nr: 9, titel: 'Keller der Alten Eiche', runde: 3, stand: 'Stand: Tag 8, Nacht', figur: 'pf',
  ziel: 'Jost und das Zollfass aus dem Keller bringen',
  uhren: [{ name: 'Fackel', rest: 2 }, { name: 'Wache', rest: 0 }],
  lage: ['dämmrig', 'nass: am Wasser ist der Boden glatt'],
  reihenfolge: ['r2', 'g', 'pf', 'r1', 'r3', 's', 'j'],
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
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 4, y: 5, bewegung: 9,
      waffen: [
        { name: 'Langschwert', bonus: 4, schaden: '1W8+2', typ: 'Hieb', reichweite: 1.5 },
        { name: 'Dolch, geworfen', bonus: 4, schaden: '1W4+2', typ: 'Stich', reichweite: [6, 18] },
        { name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18, zauber: true }
      ] },
    { id: 'g', name: 'Gesine', kurz: 'G', art: 'gefolge', x: 5, y: 4, reichweite: 3, notiz: 'Glefe' },
    { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 7, y: 5, zustand: 'am Boden' },
    { id: 'r2', name: 'Räuber 2', art: 'gegner', x: 9, y: 3, reichweite: 3, notiz: 'Spieß' },
    { id: 'r3', name: 'Räuber 3', art: 'gegner', x: 6, y: 7, zustand: 'verwundet' },
    { id: 's', name: 'Schütze', kurz: 'S', art: 'gegner', x: 14, y: 3, notiz: 'Armbrust', bewegung: 9 },
    { id: 'j', name: 'Jost der Wirt', art: 'npc', x: 9, y: 2 }
  ],
  licht: [{ x: 8, y: 3, hell: 4, daemmer: 8 }],
  notizen: [{ x: 12, y: 4, text: 'Tür' }, { x: 22, y: 9, text: 'Tür, zu' }],
  hinweis: 'Die Fackel an der Wand brennt noch.'
};
