// Beispiel für die Kampfkarte 1.10: ein Kampf über mehrere Karten, erfunden. Die erste Karte bringt Boden, Höhe und die Figur mit ihren
// Waffen; jede weitere nennt, was sich geändert hat. `ganzRunde2` ist dieselbe Runde, wie sie vor 1.10 ganz getippt worden wäre: Sie muss
// Zeichen für Zeichen dasselbe zeigen. Keine Namen aus einem Spielstand.
'use strict';
var BODEN = [
  'gggggggg~~~~gggggggggggggggggggggggg',
  'gggdgggg~~~~ggggggggggg####ggggggggg',
  'gggggggg~~~~ggggggggggg#==#ggggggggg',
  'gggggggg~~~~ggggOgggggg#==#ggggggdgg',
  'gggggggg~~~~ggggggggggg#+##ggggggggg',
  'eeeeeeee====eeeeeeeeeeeeeeeeeeeeeeee',
  'eeeeeeee====eeeeeeeeeeeeeeeeeeeeeeee',
  'gggggggg~~~~gggggggggggggggggggggggg',
  'gggOgggg~~~~ggggggoggggggggggggggggg',
  'gggggggg~~~~ggggggggggggggggggggggdg',
  'gggggggg~~~~gggggggggggggggggOgggggg',
  'gggggdgg~~~~gggggggggggggggggggggggg'
];
var HOEHE = [
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000111100',
  '000000000000000000000000000000111100',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000',
  '000000000000000000000000000000000000'
];
function probefigur(feld, tp) {
  return { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', feld: feld, bewegung: 9, tp: tp,
    waffen: [
      { name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] },
      { name: 'Dolch', bonus: 4, schaden: '1W4+2', typ: 'Stich', leicht: true, modi: [{ name: 'Nahkampf', reichweite: 1.5 }, { name: 'geworfen', reichweite: [6, 18] }] }
    ],
    zauber: [{ name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 }],
    bonus: [{ name: 'Healing Word', art: 'heilung', ziel: 'jedes', reichweite: 18, heilung: '2W4+2', wirkung: 'Grad 1' }],
    aktionen: [{ name: 'Hilfe', wirkung: 'Vorteil für den Nächsten, der das Ziel angreift' }] };
}
var TAMSIN = { id: 'ta', name: 'Tamsin', kurz: 'TA', art: 'gefolge', tp: [11, 11], notiz: 'Kurzbogen' };
var HUND = { id: 'br', name: 'Brock', kurz: 'BR', art: 'tier', zahm: true };
var SPAEHER = { id: 'sp', name: 'Späher', kurz: 'SP', art: 'gegner', reichweite: 1.5, bewegung: 9, notiz: 'Knüppel' };
var TREIBER = { id: 'tr', name: 'Treiber', kurz: 'TR', art: 'gegner', reichweite: 1.5, bewegung: 9, notiz: 'Armbrust' };
var DRITTER = { id: 'd3', name: 'Dritter', kurz: 'D3', art: 'gegner', reichweite: 1.5, bewegung: 9, notiz: 'kam aus dem Haus' };
function mit(o, felder) { var k = {}; Object.keys(o).forEach(function (s) { k[s] = o[s]; }); Object.keys(felder).forEach(function (s) { k[s] = felder[s]; }); return k; }

var ID = 'pf-s1-1';
var runde1 = { kampf: ID, nr: 3, titel: 'Furt am Mühlbach', runde: 1, stand: 'Beispiel 1.10', figur: 'pf', lage: ['Abenddämmerung'], ziel: 'Den Karren über die Furt bringen',
  reihenfolge: ['sp', 'pf', 'ta', 'br', 'tr'], boden: BODEN, hoehe: HOEHE,
  notizen: [{ feld: '25/E', text: 'Tür' }], licht: [{ feld: '19/I', hell: 2, daemmer: 4 }],
  wesen: [probefigur('14/F', [27, 27]), mit(TAMSIN, { feld: '13/G' }), mit(HUND, { feld: '12/F' }), mit(SPAEHER, { feld: '20/F' }), mit(TREIBER, { feld: '30/D' })] };
// Runde 2: nur, was sich geändert hat. Die Figur zog, der Späher zog und ist verwundet, der Treiber zog, ein Dritter kam dazu; Tamsin und Brock stehen noch.
var runde2 = { kampf: ID, nr: 6, runde: 2, reihenfolge: ['sp', 'pf', 'ta', 'd3', 'br', 'tr'],
  wesen: [{ id: 'pf', feld: '17/F', tp: [22, 27] }, { id: 'sp', feld: '18/F', zustand: 'verwundet' }, { id: 'tr', feld: '28/E' }, mit(DRITTER, { feld: '25/G' })] };
// Dieselbe Runde 2, wie sie vor 1.10 ganz getippt worden wäre
var ganzRunde2 = { nr: 6, titel: 'Furt am Mühlbach', runde: 2, stand: 'Beispiel 1.10', figur: 'pf', lage: ['Abenddämmerung'], ziel: 'Den Karren über die Furt bringen',
  reihenfolge: ['sp', 'pf', 'ta', 'd3', 'br', 'tr'], boden: BODEN, hoehe: HOEHE,
  notizen: [{ x: 25, y: 5, text: 'Tür' }], licht: [{ x: 19, y: 9, hell: 2, daemmer: 4 }],
  wesen: [mit(probefigur('', [22, 27]), { feld: undefined, x: 17, y: 6 }), mit(TAMSIN, { x: 13, y: 7 }), mit(HUND, { x: 12, y: 6 }),
    mit(SPAEHER, { x: 18, y: 6, vorher: [20, 6], zustand: 'verwundet' }), mit(TREIBER, { x: 28, y: 5, vorher: [30, 4] }), mit(DRITTER, { x: 25, y: 7, neu: true })] };
// Runde 3: Die Tür brennt, Brock läuft weg, der Späher liegt, der Dritte wird nicht mehr gesehen
var runde3 = { kampf: ID, nr: 9, runde: 3, ziel: null, aendern: [['25/E', ':']],
  wesen: [{ id: 'br', weg: true }, { id: 'sp', zustand: 'tot' }, { id: 'd3', gesehen: false }] };
// Ein neuer Ausschnitt ohne neue Figur: nur der Osten, 12 × 6 ab 25/D
var ausschnitt = { kampf: ID, nr: 11, runde: 4, spalten: 12, zeilen: 6, ursprung: [25, 'D'],
  boden: BODEN.slice(3, 9).map(function (z) { return z.substr(24, 12); }), hoehe: HOEHE.slice(3, 9).map(function (z) { return z.substr(24, 12); }),
  wesen: [{ id: 'pf', feld: '26/F' }] };
// Das Ende des Kampfes
var bilanz = { kampf: ID, nr: 13, runde: 'vorbei', bilanz: { ausgang: 'Der Weg ist frei', satz: 'Die Furt gehört euch.', gegner: [{ id: 'sp', stand: 'gefallen', ep: 50 }, { id: 'tr', stand: 'geflohen', ep: 25 }], ep: 75, zeit: '4 Runden' } };

module.exports = { ID: ID, BODEN: BODEN, HOEHE: HOEHE, runde1: runde1, runde2: runde2, ganzRunde2: ganzRunde2, runde3: runde3, ausschnitt: ausschnitt, bilanz: bilanz };
