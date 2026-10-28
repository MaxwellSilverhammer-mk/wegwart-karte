// Großes Beispiel für das Lagebild (lagebild.js), erfundene Welt der Tests: ein Schuss aus gut 180 m. Die Probefigur
// und Jost auf dem Weg durchs Schilf, der Schütze am Waldrand im Osten. 124 Spalten zu 1,5 m, das Lagebild scrollt.
module.exports = {
  titel: 'Weg am Schilfmeer',
  stand: 'Runde 1 · du bist dran',
  breite: 124, hoehe: 10, norden: 'oben',
  gelaende: [
    { art: 'schilf', von: 'A1', bis: 'CZ2' }, { art: 'schilf', von: 'A9', bis: 'CZ10' },
    { art: 'wasser', von: 'AK1', bis: 'AT3', name: 'Tümpel' },
    { art: 'busch', von: 'BE4', bis: 'BF5' }, { art: 'fels', feld: 'CK6', name: 'Findling' },
    { art: 'baum', von: 'DE1', bis: 'DE10', name: 'Waldrand' }, { art: 'busch', von: 'DF1', bis: 'DT10' }
  ],
  wesen: [
    { id: 'du', name: 'Probefigur', art: 'figur', feld: 'B5', zeichen: 'Pr', tp: [14, 17], bewegung: 9,
      reichweiten: [{ name: 'Starry Wisp', m: 18 }, { name: 'Leichte Armbrust', m: 24 }, { name: 'Armbrust, weit', m: 96 }] },
    { id: 'jost', name: 'Jost', art: 'gefolge', feld: 'B6', tp: [11, 11] },
    { id: 's', name: 'Schütze', art: 'feind', feld: 'DR5', notiz: 'Langbogen, halb im Gebüsch' }
  ],
  initiative: ['du', 's', 'jost'],
  aktiv: 'du', runde: 1
};
