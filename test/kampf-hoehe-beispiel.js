// Erfundene Welt (wie in den anderen Tests): die alte Warte über Rohrdorf, Runde 1. Eine Terrasse 3 m über dem Weg
// mit Brustwehr, eine Treppe im Osten, eine Geröllrampe im Westen; nichts aus einem echten Revier.
function zeile(a, b, c, d, e) { var z = a + b + c + d + e; if (z.length !== 36) throw new Error('Zeile hat ' + z.length + ' Zeichen: ' + z); return z; }
module.exports = {
  nr: 2, titel: 'Die alte Warte', runde: 1, stand: 'Stand: Tag 9, Vormittag', figur: 'pf',
  boden: [
    //    1–10          11–14   15–25          26   27–36
    zeile('??????????', '####', '...........', '#', '??????????'), // A  Turmstumpf, Terrasse, Ostwand
    zeile('..........', '#??#', '...........', '#', '..........'), // B
    zeile('..........', '#??#', '...........', '#', '..........'), // C
    zeile('........::', ':...', '...........', '#', '..........'), // D  Geröll der Bresche 9–11
    zeile('........::', ':...', '...........', '#', '##........'), // E
    zeile('..........', '#ooo', 'oooooooooo.', '+', '/#........'), // F  Brustwehr 12–24, Durchgang 26, oberste Stufe 27
    zeile('..........', '....', '...........', '.', '/#........'), // G  unter der Kante; Stufe 27
    zeile('..O.......', '....', '...........', '.', '..........'), // H  Fuß der Treppe 27
    zeile('..........', '....', '...........', '.', '....O.....'), // I
    zeile('.........:', ':...', '....o......', '.', '..........'), // J  Geröll, ein Findling
    zeile('..........', '....', '...........', '.', '..........'), // K  Weg
    zeile('..........', '....', '...........', '.', '..........')  // L  Weg
  ],
  hoehe: [
    zeile('0000000000', '2222', '22222222222', '2', '0000000000'), // A
    zeile('0000000000', '2222', '22222222222', '2', '0000000000'), // B
    zeile('0000000000', '2222', '22222222222', '2', '0000000000'), // C
    zeile('000000000b', 'b222', '22222222222', '2', '0000000000'), // D  Geröllrampe b (Ebene 1, Rampe)
    zeile('000000000b', 'b222', '22222222222', '2', '0000000000'), // E
    zeile('0000000000', '2222', '22222222222', '2', 'c000000000'), // F  Treppe oben c (Ebene 2, Treppe)
    zeile('0000000000', '0000', '00000000000', '0', 'b000000000'), // G  Treppe Mitte b (Ebene 1)
    zeile('0000000000', '0000', '00000000000', '0', '0000000000'), // H
    zeile('0000000000', '0000', '00000000000', '0', '0000000000'), // I
    zeile('0000000000', '0000', '00000000000', '0', '0000000000'), // J
    zeile('0000000000', '0000', '00000000000', '0', '0000000000'), // K
    zeile('0000000000', '0000', '00000000000', '0', '0000000000')  // L
  ],
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 18, y: 11, bewegung: 9 },
    { id: 'g', name: 'Gesine', kurz: 'G', art: 'gefolge', x: 16, y: 11, notiz: 'Glefe, Reichweite 3 m' },
    { id: 'r1', name: 'Räuber 1', art: 'gegner', x: 15, y: 5, notiz: 'Armbrust, hinter der Brustwehr' },
    { id: 'r2', name: 'Räuber 2', art: 'gegner', x: 21, y: 5 },
    { id: 'h', name: 'Hauptmann', kurz: 'H', art: 'gegner', x: 25, y: 6, notiz: 'hält den Treppenkopf' }
  ],
  notizen: [{ x: 13, y: 3, text: 'Turm' }, { x: 9, y: 4, text: 'Bresche' }, { x: 27, y: 8, text: 'Treppe' }, { x: 3, y: 12, text: 'Weg' }],
  hinweis: 'Die Terrasse liegt 3 m über dem Weg.'
};
