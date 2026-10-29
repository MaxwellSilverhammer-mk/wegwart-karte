// Erfundene Welt (wie in den anderen Tests): Keller der Alten Eiche in Rohrdorf, Runde 2.
module.exports = {
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
    { id: 'h', name: 'Hund Wotan', kurz: 'W', art: 'tier', x: 3, y: 6, zahm: true },
    { id: 'g', name: 'Gesine', kurz: 'G', art: 'gefolge', x: 5, y: 4 },
    { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 14, y: 3, zustand: 'verwundet' },
    { id: 'r2', name: 'Räuber 2', art: 'gegner', x: 17, y: 6 },
    { id: 'b', name: 'Bär', kurz: 'B', art: 'tier', groesse: 2, x: 26, y: 2, zustand: 'am Boden' },
    { id: 'j', name: 'Jost der Wirt', art: 'npc', x: 9, y: 2 }
  ],
  licht: [{ x: 8, y: 3, hell: 4, daemmer: 8 }],
  notizen: [{ x: 12, y: 4, text: 'Tür' }, { x: 22, y: 9, text: 'Tür, zu' }],
  hinweis: 'Die Fackel an der Wand brennt noch.'
};
