// Beispiel für die Kampfkarte 1.6: die Szene des vierten Probekampfs (Schleusentor am Torfkanal), erfunden nachgebaut: ein
// Kanal von Nord nach Süd, das Schleusentor als Plankensteg darüber, auf dem die Figur liegt; ein Deich im Osten mit Krone auf
// Ebene 2 und Böschungen auf Ebene 1 (mit Schatten), Stufen `/` als Rampe `b` nur an den beiden Treppen; die Wärterhütte im
// Westen; das Torfmoor mit Nebel unten links. Ein Schütze auf der Deichkrone, der Schleusenwärter mit Spieß am Ostende des
// Tors, ein Hund, zwei Torfstecher aus dem Moor, ein Gefolgsmann im Westen, ein Torfmädchen als Unbeteiligte. Die Figur
// trägt die Werte einer Barden-Stufe 4 mit `leicht` am Dolch und `aktionen[]` (seit 1.6). Keine Namen aus einem Spielstand.
'use strict';
function z(s) { if (s.length !== 36) throw new Error('Zeile hat ' + s.length + ': ' + s); return s; }
module.exports = {
  nr: 21, titel: 'Schleusentor am Torfkanal', runde: 2, stand: 'Beispiel 1.6', figur: 'pf', spalten: 36, zeilen: 16,
  ziel: 'Das Tor halten, bis Rolf den Hebel hat',
  uhren: [{ name: 'Nebel', rest: 2 }],
  lage: ['Abenddämmerung', 'die Planken sind nass'],
  reihenfolge: ['sch', 'pf', 'ulf', 'hu', 't1', 'ro', 't2', 'tm'],
  //            123456789012345678901234567890123456
  boden: [
    'gggggggggggggg,~~~~,eegeeegggggggggg',
    'gggggggggggggg,~~~~,eegeeeggggggggdg',
    'ggggggggg####g,~~~~,eegeeegggggggggg',
    'ggggggggg#==#g,~~~~,eegeeeggggOggggg',
    'ggggggggg#==#g,~~~~,eegeeegggggggggg',
    'ggggggggg#+##g,~~~~,eegeeegggggggggg',
    'eeeeeeeeeeeeee,~~~~,eegeeegggggggggg',
    'eeeeeeeeeeeeee=======e/eee/ggggggggg',
    'eeeeeeeeeeeeee,~~~~,eegeeegggggggggg',
    'eeeeeeeeeeeeee,~~~~,eegeeegggggggggg',
    'eeeeeeeeeeeeee,~~~~,eegeeegggggggggg',
    'mmdmmdmmmmmdgg,~~~~,eegeeeggggggOggg',
    '???mdmmdmmdggg,~~~~,eegeeegggggggggg',
    '??????dmmdmggd,~~~~,eegeeeggdggggggg',
    '??????mmdmmgdg,~~~~,eegeeegggdgggdgg',
    '??????mdmmmdgg,~~~~,eegeeegggggggggg'
  ].map(z),
  // Böschungen Ebene 1, Krone Ebene 2; `b` (Ebene 1 als Rampe) nur an den beiden Treppen auf Zeile H
  hoehe: [
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '0000000000000000000000b222b000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000',
    '000000000000000000000012221000000000'
  ].map(z),
  wesen: [
    { id: 'pf', name: 'Probefigur', kurz: 'PF', art: 'figur', x: 17, y: 8, bewegung: 9, tp: [16, 27], zustaende: ['liegend'],
      waffen: [
        { name: 'Langschwert', bonus: 4, typ: 'Hieb', reichweite: 1.5, modi: [{ name: 'einhändig', schaden: '1W8+2' }, { name: 'beidhändig', schaden: '1W10+2' }] },
        // seit 1.6: `leicht` (PHB) erlaubt die Zweitwaffe neben der Angriffsaktion mit dieser Waffe
        { name: 'Dolch', bonus: 4, schaden: '1W4+2', typ: 'Stich', leicht: true, modi: [{ name: 'Nahkampf', reichweite: 1.5 }, { name: 'geworfen', reichweite: [6, 18] }] }
      ],
      zauber: [
        { name: 'Starry Wisp', bonus: 4, schaden: '1W8', typ: 'gleißend', reichweite: 18 },
        { name: 'Zielsicherer Schlag', mit: 'waffe', typ: 'gleißend' },
        { name: 'Dissonant Whispers', rettung: 'WEI', sg: 12, schaden: '3W6', typ: 'psychisch', reichweite: 18, wirkung: 'halb bei Erfolg; muss mit seiner Reaktion fliehen; Taube sind nicht betroffen' },
        { name: 'Command', rettung: 'WEI', sg: 12, reichweite: 18, wirkung: 'ein Wort, nächster Zug' }
      ],
      bonus: [
        { name: 'Healing Word', art: 'heilung', ziel: 'jedes', reichweite: 18, heilung: '2W4+2', wirkung: 'Grad 1' },
        { name: 'Bardische Inspiration', art: 'inspiration', ziel: ['gefolge', 'gegner', 'npc', 'tier'], reichweite: 18, wirkung: 'W6; ein Wesen, das dich hört' },
        { name: 'Dolch', art: 'waffe', ziel: 'gegner', waffe: 'Dolch' }
      ],
      // seit 1.6: Aktionen ohne Ziel; Spurt und Rückzug kennt die Karte selbst
      aktionen: [{ name: 'Hilfe', wirkung: 'Vorteil für den Nächsten, der das Ziel angreift' }, { name: 'Ausweichen', wirkung: 'Angriffe gegen dich mit Nachteil, GES-Rettungswürfe mit Vorteil' }] },
    { id: 'ro', name: 'Rolf', kurz: 'RO', art: 'gefolge', x: 14, y: 9, tp: [5, 11], notiz: 'will zum Hebel am Westufer' },
    { id: 'ulf', name: 'Ulf', kurz: 'U', art: 'gegner', x: 21, y: 8, reichweite: 3, notiz: 'der Schleusenwärter, Spieß' },
    { id: 'hu', name: 'Hund', kurz: 'HU', art: 'gegner', x: 22, y: 9, notiz: 'Ulfs Rüde' },
    { id: 'sch', name: 'Schütze', kurz: 'S', art: 'gegner', x: 25, y: 5, notiz: 'Armbrust, auf der Deichkrone' },
    { id: 't1', name: 'Torfstecher 1', kurz: 'T1', art: 'gegner', x: 12, y: 12, zustand: 'angeschlagen', notiz: 'Torfspaten' },
    { id: 't2', name: 'Torfstecher 2', kurz: 'T2', art: 'gegner', x: 9, y: 13, notiz: 'Torfspaten' },
    { id: 'tm', name: 'Torfmädchen', kurz: 'TM', art: 'npc', x: 22, y: 13, notiz: 'duckt sich am Treidelpfad' }
  ],
  notizen: [{ x: 17, y: 9, text: 'Schleusentor' }, { x: 11, y: 2, text: 'Wärterhütte' }, { x: 25, y: 12, text: 'Deichkrone' }, { x: 4, y: 12, text: 'Torfmoor' }]
};
