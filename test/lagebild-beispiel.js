// Beispiel für das Lagebild (lagebild.js) aus der erfundenen Welt der Tests: die Probefigur und der Knecht Jost
// am Steg von Rohrdorf, drei Wegelagerer, die Krämerin Ilse hinter ihren Fässern. Keine Daten einer echten Figur.
// Felder heißen wie beim Schach (A1 links oben), ein Feld ist 1,5 m. Gegner tragen ihren Zustand in Worten, keine TP,
// keine Bewegung und keine Reichweiten; die eigenen Leute dürfen sie zeigen. Zustände nur aus der festen Liste mit Ikonen.
module.exports = {
  titel: 'Steg von Rohrdorf',
  stand: 'Runde 2 · du bist dran',
  breite: 10, hoehe: 8, norden: 'oben',
  gelaende: [
    { art: 'wasser', von: 'A7', bis: 'J8', name: 'Der Fluss' },
    { art: 'steg', von: 'E6', bis: 'E8' },
    { art: 'boot', feld: 'F8' },
    { art: 'schilf', von: 'A6', bis: 'C6' },
    { art: 'mauer', von: 'B1', bis: 'D1', name: 'Mauer des Speichers' },
    { art: 'kiste', von: 'G2', bis: 'H2', name: 'Ilses Fässer' },
    { art: 'baum', feld: 'I5', name: 'Die Alte Eiche' },
    { art: 'schutt', feld: 'C3' },
    { art: 'feuer', feld: 'A1', name: 'Brennender Karren' }
  ],
  bereiche: [
    { art: 'zauber', feld: 'G5', r: 2, name: 'Schlaf · 3 m' }
  ],
  wesen: [
    { id: 'du', name: 'Probefigur', art: 'figur', feld: 'D5', zeichen: 'Pr', tp: [14, 17], bewegung: 9, zustaende: ['konzentriert'],
      reichweiten: [{ name: 'Langschwert', m: 1.5 }, { name: 'Starry Wisp', m: 18 }] },
    { id: 'jost', name: 'Jost', art: 'gefolge', feld: 'C5', tp: [9, 11], zustand: 'angeschlagen', zustaende: ['inspiriert'] },
    { id: 'esel', name: 'Grauchen', art: 'tier', feld: 'B4', notiz: 'Esel, trägt das Gepäck' },
    { id: 'ilse', name: 'Ilse', art: 'npc', feld: 'H1', zustaende: ['verängstigt'], notiz: 'kauert hinter den Fässern' },
    { id: 'w1', name: 'Wegelagerer 1', art: 'feind', feld: 'E4', zustand: 'schwer verletzt', notiz: 'Knüppel, humpelt' },
    { id: 'w2', name: 'Wegelagerer 2', art: 'feind', feld: 'G5', zustaende: ['bewusstlos'], notiz: 'schläft (Sleep)' },
    { id: 'w3', name: 'Wegelagerer 3', art: 'feind', feld: 'H4', zustaende: ['flieht'], notiz: 'Kurzbogen' },
    { id: 'hund', name: 'Hofhund', art: 'feind', feld: 'F3', zustand: 'tot' }
  ],
  initiative: ['w3', 'du', 'w1', 'jost', 'w2', 'hund'],
  aktiv: 'du',
  runde: 2
};
