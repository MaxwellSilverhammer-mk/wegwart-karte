// Prüft die Rechnung des Händlertischs (handel.js): Preise, Wechselgeld aus Beutel und Kasse, Schulden, Zeile für die Spielleitung.
// Erfundene Welt der Tests (test/handel-beispiel.js), keine Daten einer Figur.
'use strict';
var assert = require('assert'), path = require('path');
var h = require(path.join(__dirname, '..', 'handel.js'));
var beispiel = require(path.join(__dirname, 'handel-beispiel.js'));
var n = 0;
function pruefe(name, f) { f(); n++; console.log('ok  ' + name); }

pruefe('Preise in Common', function () {
  assert.strictEqual(h.wert({ ga: 1, sm: 5 }), 150);
  assert.strictEqual(h.wert('2 GA 3 SM 4 KM'), 234);
  assert.strictEqual(h.wert(1.5), 150);
  assert.strictEqual(h.wert({ pm: 1, em: 1 }), 1050);
  assert.strictEqual(h.betrag(234), '2 GA, 3 SM, 4 KM');
  assert.strictEqual(h.betrag(5), '5 KM');
});

pruefe('Wer genau zahlen kann, zahlt genau', function () {
  var a = h.ausgleich({ ga: 12, sm: 3 }, { ga: 3, sm: 18, km: 40 }, 100);
  assert.deepStrictEqual(a.P, { ga: 1 }); assert.deepStrictEqual(a.C, {}); assert.strictEqual(a.fehlt, 0);
});

pruefe('Eine Kerze mit Silber: Wechselgeld aus der Kasse', function () {
  var a = h.ausgleich({ ga: 12, sm: 3 }, { ga: 3, sm: 18, km: 40 }, 1);
  assert.deepStrictEqual(a.P, { sm: 1 }); assert.deepStrictEqual(a.C, { km: 9 });
});

pruefe('Beutel reicht nicht', function () {
  var a = h.ausgleich({ ga: 12, sm: 3 }, {}, 1500);
  assert.strictEqual(a.fehlt, 270); assert.deepStrictEqual(a.P, { ga: 12, sm: 3 });
});

pruefe('Kein Wechselgeld: der Rest bleibt beim Händler', function () {
  var a = h.ausgleich({ ga: 2 }, { sm: 1 }, 85);
  assert.deepStrictEqual(a.P, { ga: 1 }); assert.deepStrictEqual(a.C, { sm: 1 }); assert.strictEqual(a.uebrig, 5);
});

pruefe('Händler zahlt aus der Kasse, sonst bleibt er schuldig', function () {
  var a = h.haendlerZahlt({ ga: 3, sm: 18, km: 40 }, { ga: 12 }, 25);
  assert.deepStrictEqual(a.P, { sm: 2, km: 5 }); assert.strictEqual(a.fehlt, 0);
  var b = h.haendlerZahlt({ sm: 1 }, {}, 25);
  assert.deepStrictEqual(b.P, { sm: 1 }); assert.strictEqual(b.fehlt, 15);
  var c = h.haendlerZahlt({ ga: 1 }, { km: 5 }, 95);
  assert.deepStrictEqual(c.P, { ga: 1 }); assert.deepStrictEqual(c.C, { km: 5 }); assert.strictEqual(c.fehlt, 0);
  var d = h.haendlerZahlt({ ga: 1 }, {}, 95);
  assert.strictEqual(d.fehlt, 95, 'zahlt nie zu viel');
});

pruefe('Großer Betrag mit vielen Münzen bleibt schnell', function () {
  var t0 = Date.now(), a = h.ausgleich({ ga: 400, sm: 90, km: 90 }, { ga: 50, sm: 50, km: 50 }, 15037);
  assert.strictEqual(a.fehlt, 0); assert.ok(Date.now() - t0 < 1500, 'zu langsam');
});

pruefe('Beispiel: kaufen, verkaufen, Zeile', function () {
  var H = h.vorbereiten(beispiel), korb = {};
  var ration = H.waren.filter(function (w) { return w.name === 'Ration'; })[0];
  var kerze = H.waren.filter(function (w) { return w.name === 'Kerze'; })[0];
  var karten = H.dinge.filter(function (d) { return d.name === 'Kartenspiel'; })[0];
  korb[ration.id] = 2; korb[kerze.id] = 1; korb[karten.id] = 1;
  var r = h.rechne(H, korb);
  assert.strictEqual(r.Rw, 101); assert.strictEqual(r.Lw, 25); assert.strictEqual(r.D, 76);
  assert.strictEqual(r.L, r.R, 'Waage im Lot'); assert.ok(r.imLot);
  assert.strictEqual(r.last1, r.last0 + 2);
  var z = h.zeileHandschlag(H, r);
  assert.ok(/^Handel #4 · bei Ilse, Rohrdorf · kauft 2 × Ration \(1 GA\), Kerze \(1 KM\) · verkauft Kartenspiel \(2 SM, 5 KM\)/.test(z), z);
  assert.ok(/Beutel danach /.test(z) && /trägt danach /.test(z), z);
  console.log('    ' + z);
  assert.ok(/^Handel #4 · feilscht bei Ilse/.test(h.zeileFeilschen(H, r)));
});

pruefe('Feilschen geht um jeden Betrag, einmal je Besuch', function () {
  var H = h.vorbereiten(beispiel), korb = {};
  var kerze = H.waren.filter(function (w) { return w.name === 'Kerze'; })[0];
  korb[kerze.id] = 1;
  assert.strictEqual(h.zeileFeilschen(H, h.rechne(H, korb)), 'Handel #4 · feilscht bei Ilse, Rohrdorf · Korb: kauft Kerze (1 KM) · Wert 1 KM gegen nichts');
  assert.strictEqual(H.gefeilscht, false);
  var D2 = JSON.parse(JSON.stringify(beispiel)); D2.haendler.gefeilscht = true;
  assert.strictEqual(h.vorbereiten(D2).gefeilscht, true);
});

pruefe('Was Ilse nicht kauft, kommt nicht auf die Waage', function () {
  var H = h.vorbereiten(beispiel);
  var schwert = H.dinge.filter(function (d) { return d.name === 'Kurzschwert'; })[0];
  assert.strictEqual(schwert.ankauf, null);
});

console.log(n + ' Prüfungen bestanden.');
