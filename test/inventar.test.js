// Gepäck 2.0: Pixel-Ikonen, Werte statt Erzählung
'use strict';
var path = require('path'), assert = require('assert');
var inv = require(path.join(__dirname, '..', 'inventar.js'));
var wissen = require(path.join(__dirname, '..', 'wissen.js'));
var n = 0;
function ok(name, f) { f(); n++; console.log('ok  ' + name); }

var D = {
  titel: 'Probefigurs Gepäck', stand: 'Stand: Tag 8', geld: { ga: 3 },
  traeger: [{ id: 'selbst', name: 'Probefigur', art: 'figur', staerke: 12, dinge: [
    { name: 'Kurzschwert', art: 'waffe', kg: 1, angriff: '+5', schaden: '1W6+3 Stich', notiz: 'Vom Großvater, rostig am Heft.' },
    { name: 'Seil', art: 'seil', kg: 5, vorrat: [12, 15], einheit: 'm', herkunft: 'Von Ilse, Tag 3.' },
    { name: 'Zauberstab', art: 'wertsache', ikone: 'kohle', vorrat: [3, 7], einheit: 'Ladungen' },
    { name: 'Lederrüstung', art: 'ruestung', kg: 5, rk: 11 },
    { name: 'Brief an Bodo', art: 'brief', wortlaut: 'Komm heim.', glossar: 'Bodo' },
    { name: 'Rationen', art: 'ration', anzahl: 3, kg: 0.5 },
    { name: 'Kerze', art: 'licht' }
  ] }]
};
var h = inv.zeichne(D);

ok('Notiz und Herkunft erscheinen nicht', function () {
  assert(h.indexOf('Großvater') < 0);
  assert(h.indexOf('Von Ilse') < 0);
});
ok('Hauptwert rechts: Schaden, Vorrat mit Höchstwert, RK', function () {
  assert(/class="gpH1">1W6\+3</.test(h));
  assert(/class="gpH1">12\/15 m</.test(h));
  assert(/class="gpH1">3\/7 Ladungen</.test(h));
  assert(/class="gpH1">RK 11</.test(h));
});
ok('Werte im Fenster, Wortlaut eingeklappt, Glossarknopf', function () {
  assert(h.indexOf('<dt>Angriff</dt><dd>+5</dd>') >= 0);
  assert(h.indexOf('<dt>Schaden</dt><dd>1W6+3 Stich</dd>') >= 0);
  assert(/<details class="gpWl"><summary>Wortlaut<\/summary><blockquote>Komm heim\.<\/blockquote>/.test(h));
  assert(h.indexOf('data-glossar="Bodo"') >= 0);
});
ok('Ikonen: geraten, nach Art, ausdrücklich; jede nur einmal als Symbol', function () {
  assert(h.indexOf('#gpx-saebel') < 0 && h.indexOf('#gpx-schwert') >= 0);
  assert(h.indexOf('#gpx-seil') >= 0 && h.indexOf('#gpx-ruestung') >= 0 && h.indexOf('#gpx-kohle') >= 0);
  assert(h.indexOf('#gpx-brief') >= 0 && h.indexOf('#gpx-kerze') >= 0);
  assert.strictEqual((h.match(/<symbol id="gpx-ration"/g) || []).length, 1);
});
ok('Anzahl als Zahl an der Ikone', function () { assert(/<b class="gpAnz">3<\/b>/.test(h)); });
ok('Ein Ding ohne Werte hat kein Fenster', function () {
  assert(/<button[^>]*disabled>(?:(?!<button)[^])*Kerze/.test(h));
  assert(!/<button[^>]*disabled>(?:(?!<button)[^])*Kurzschwert/.test(h));
});
ok('Schema: unbekannte Ikone wird abgelehnt', function () {
  var X = JSON.parse(JSON.stringify(D));
  X.traeger[0].dinge[2].ikone = 'zauberstab-gibt-es-nicht';
  var r = wissen.pruefe(X, inv.SCHEMA, { spielstand: 'Probefigur Kurzschwert Seil Zauberstab Lederrüstung Brief an Bodo Rationen Kerze', spoiler: 'x' });
  assert(r.fehler.some(function (f) { return /ist nicht erlaubt/.test(f); }));
});
console.log(n + ' Prüfungen bestanden.');
