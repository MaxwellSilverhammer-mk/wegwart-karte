// Rendert die Karte ohne Browser: SVG, Zeichenliste und Überlappungsprüfung.
'use strict';
var fs = require('fs'), path = require('path');
var karte = require(path.join(__dirname, '..', 'karte.js'));
// Kartendaten: KARTE_DATEN=<datei.js> oder daten/fuerchtegott.js (nicht im Repository)
var daten = require(process.env.KARTE_DATEN || path.join(__dirname, '..', 'daten', 'fuerchtegott.js'));
var e = karte.zeichne(JSON.parse(JSON.stringify(daten)));
fs.writeFileSync(path.join(__dirname, 'karte.svg'), e.svg);
fs.writeFileSync(path.join(__dirname, 'liste.json'), JSON.stringify({ W: e.breite, H: e.hoehe, liste: e.liste }));

function box(t) {
  var zeilen = String(t.t).split('\n'), breit = Math.max.apply(0, zeilen.map(function (z) { return z.length; })) * t.gr * (t.kursiv ? 0.44 : 0.47);
  var x0 = t.anker === 'middle' ? t.x - breit / 2 : t.anker === 'end' ? t.x - breit : t.x;
  return { x0: x0, x1: x0 + breit, y0: t.y - t.gr * 0.78, y1: t.y + t.gr * 0.25 + (zeilen.length - 1) * t.gr * 1.1, t: t };
}
function schnitt(a, b) { return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1; }
var texte = e.liste.filter(function (x) { return x.typ === 'text'; });
var orte = e.liste.filter(function (x) { return x.typ === 'ort'; });
var kaesten = e.liste.filter(function (x) { return x.typ === 'kasten'; }).map(function (k) { return { x0: k.x, x1: k.x + k.b, y0: k.y, y1: k.y + k.h }; });
['standard', 'zoom'].forEach(function (modus) {
  var sicht = texte.filter(function (t) { return modus === 'zoom' || t.rang !== 2; }).map(box);
  var probleme = [];
  for (var i = 0; i < sicht.length; i++) {
    for (var j = i + 1; j < sicht.length; j++) if (schnitt(sicht[i], sicht[j])) probleme.push('Text/Text: „' + sicht[i].t.t.replace(/\n/g, ' ') + '“ × „' + sicht[j].t.t.replace(/\n/g, ' ') + '“');
    orte.forEach(function (o) { if (schnitt(sicht[i], { x0: o.x - 16, x1: o.x + 16, y0: o.y - 18, y1: o.y + 10 })) probleme.push('Text/Ort: „' + sicht[i].t.t.replace(/\n/g, ' ') + '“ × ' + o.id); });
    kaesten.forEach(function (k) { if (schnitt(sicht[i], k)) probleme.push('Text/Titel: „' + sicht[i].t.t.replace(/\n/g, ' ') + '“'); });
    var b = sicht[i];
    if (b.x0 < 26 || b.x1 > e.breite - 26 || b.y0 < 26 || b.y1 > e.hoehe - 26) probleme.push('Rand: „' + b.t.t.replace(/\n/g, ' ') + '“');
  }
  console.log(modus + ': ' + (probleme.length ? '\n  ' + probleme.join('\n  ') : 'keine Überlappungen'));
});
console.log('Größe', e.breite, '×', e.hoehe, '· SVG', Math.round(e.svg.length / 1024), 'KB · Maßstab am Handy', (380 / e.breite).toFixed(2));
