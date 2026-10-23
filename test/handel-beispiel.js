// Beispiel für den Händlertisch (handel.js) aus der erfundenen Welt der Tests: die Probefigur bei der Krämerin Ilse in Rohrdorf.
// `gepaeck` hat die Form des Gepäcks (inventar.js); `ankauf` ist, was Ilse für ein Ding zahlt. Ohne `ankauf` kauft sie es nicht.
module.exports = {
  nr: 4, ort: 'Rohrdorf', stand: 'Stand: Tag 8',
  hinweis: 'Stadtware kostet hier mehr; Fisch und Felle nimmt Ilse gern.',
  haendler: {
    name: 'Ilse', art: 'Krämerin',
    kasse: { ga: 3, sm: 18, km: 40 },
    waren: [
      { name: 'Ration', art: 'ration', preis: { sm: 5 }, anzahl: 6, kg: 1 },
      { name: 'Kerze', art: 'licht', preis: { km: 1 }, anzahl: 12 },
      { name: 'Lampenöl (Flasche)', art: 'licht', preis: { sm: 1 }, anzahl: 3, kg: 0.5 },
      { name: 'Hanfseil 15 m', art: 'seil', preis: { ga: 1 }, anzahl: 1, kg: 5 },
      { name: 'Wetzstein', art: 'werkzeug', preis: { km: 1 }, anzahl: 2, kg: 0.5 },
      { name: 'Decke', art: 'schlafzeug', preis: { sm: 5 }, anzahl: 1, kg: 1.5 },
      { name: 'Pergament', art: 'schreibzeug', preis: { sm: 1 }, anzahl: 5 },
      { name: 'Tinte (Fläschchen)', art: 'schreibzeug', preis: { ga: 15 }, anzahl: 1, notiz: 'aus der Stadt, darum teurer' },
      { name: 'Schreibfeder', art: 'schreibzeug', preis: { km: 2 }, anzahl: 4 }
    ]
  },
  gepaeck: {
    titel: 'Gepäck der Probefigur', stand: 'Stand: Tag 8',
    geld: { ga: 12, sm: 3 },
    traeger: [
      { id: 'figur', name: 'Probefigur', art: 'figur', staerke: 13, dinge: [
        { name: 'Wanderstab', art: 'waffe', kg: 2 },
        { name: 'Kurzschwert', art: 'waffe', kg: 1, herkunft: 'vom Räuber an der Brücke' },
        { name: 'Reisekleidung', art: 'kleidung', kg: 2 },
        { name: 'Lederrüstung', art: 'ruestung', kg: 5 },
        { name: 'Kartenspiel', art: 'spiel', ankauf: { sm: 2, km: 5 } },
        { name: 'Räucheraal', art: 'proviant', anzahl: 3, kg: 0.5, ankauf: { km: 4 } },
        { name: 'Fuchsfell', art: 'fund', kg: 1, ankauf: { sm: 3 } },
        { name: 'Ration', art: 'ration', anzahl: 1, kg: 1 },
        { name: 'Brief des Vogts', art: 'brief' },
        { name: 'Laterne', art: 'licht', kg: 1, ankauf: { sm: 2, km: 5 } }
      ] }
    ]
  }
};
