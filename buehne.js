#!/usr/bin/env node
// Bühnen und Profile der Kampfkarte (Regelwerk 12.6, Werkstatt 12.6), nur bei der Spielleitung.
// Eine Bühne ist die feste Karte eines Schauplatzes, ein Profil sind die Kampfdaten einer Figur. Beide liegen wie die Spoilerdatei in der
// Ablage des Spielerbuchs (sl/_buehne-<id>, sl/_profil-<figur>), nie im Repository. Eine Bühne darf mehr wissen als die Figur: In den
// Aufruf der Karte kommt nur, was die Figur sieht, denn den kann der Spieler lesen (4.8). Dieses Werkzeug schneidet das heraus.
//   node buehne.js --pruefe <bühne.json> [--spielstand <02.md> --spoiler <03.md> [--weitere <a.md,b.md>]]
//   node buehne.js --zeige <bühne.json> [--ausschnitt <name|5/A,20,12>]
//   node buehne.js --karte <bühne.json> --kampf <id> --nr <n> [--ausschnitt …] [--offen a,b] [--profil <profil.json>] [--feld <19/H>] [--tp <jetzt>]
//                  [--wesen <wesen.json>] [--runde <n>] [--stand "…"] [--titel "…"] [--spielstand … --spoiler … [--weitere …] [--gesehen "Altar,Priester"]]
//   node buehne.js --karte <bühne.json> --kampf <id> --nr <n> --weiter --ausschnitt … [--offen a,b] [--spielstand … --spoiler …]   neuer Ausschnitt mitten im Kampf
//   node buehne.js --aufdecken <bühne.json> <gruppe> [--ausschnitt …] [--offen a,b]
//   node buehne.js --profil <profil.json>
// Rückgabe 0 mit FREIGEGEBEN, sonst 1 mit GESPERRT und der Liste der Fehler. Die Spoilerdatei wird nur gelesen, nie ausgegeben.
// Alle Felder stehen in der README (Abschnitt „Bühnen und Profile“).
'use strict';
var fs = require('fs'), path = require('path');
var kampf = require(path.join(__dirname, 'kampf.js'));
var ZEILEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', BREITE_MAX = 60, HOEHE_MAX = 26;

function name(x, y) { return x + '/' + (ZEILEN[y - 1] || '?'); }
function kurz(o) {
  // So knapp, wie die Spielleitung es tippt: Schlüssel ohne Anführungszeichen, Text in einfachen
  if (Array.isArray(o)) return '[' + o.map(kurz).join(',') + ']';
  if (o && typeof o === 'object') return '{' + Object.keys(o).filter(function (k) { return o[k] !== undefined; }).map(function (k) { return (/^[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*$/.test(k) ? k : JSON.stringify(k)) + ':' + kurz(o[k]); }).join(',') + '}';
  if (typeof o === 'string') return "'" + o.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  return JSON.stringify(o);
}
// Der Zeichenmotor der Kachelsets, nur wenn eine Bühne ein Gelände trägt
function motor() { return require(path.join(__dirname, 'kacheln.js')); }
function setVon(B) { return motor().sets.filter(function (x) { return x.id === String(B.gelaende); })[0] || null; }
function gruppeInfo(B, g) { var i = (B.gruppen || {})[g]; return typeof i === 'string' ? { name: i } : i || null; }
function groesse(B) { var z = B.boden || []; return { sp: z.reduce(function (m, r) { return Math.max(m, String(r).length); }, 0), ze: z.length }; }
function zeichenAn(B, f) { var a = kampf.feldAusName(f); return a && B.boden[a[1] - 1] ? B.boden[a[1] - 1][a[0] - 1] : undefined; }
function gruppeAn(B, x, y) { var z = (B.verdeckt || [])[y - 1], c = z ? z[x - 1] : null; return c && c !== '.' && c !== ' ' ? c : null; }

// Der Ausschnitt: ein Name aus `ausschnitte`, „5/A,20,12“ oder die ganze Bühne
function ausschnittVon(B, a) {
  var g = groesse(B);
  if (a == null || a === '') return { x: 1, y: 1, b: g.sp, h: g.ze, name: 'ganz' };
  var c = (B.ausschnitte || {})[a], n = a;
  if (!c) { c = String(a).split(','); n = String(a); }
  var f = kampf.feldAusName(c[0]);
  if (!f || !(+c[1] > 0) || !(+c[2] > 0)) return null;
  return { x: f[0], y: f[1], b: +c[1], h: +c[2], name: n };
}
function imAusschnitt(c, x, y) { return x >= c.x && y >= c.y && x < c.x + c.b && y < c.y + c.h; }

// Prüft eine Bühne oder eine frei gezeichnete Karte (dasselbe Format)
function pruefe(B) {
  var fehler = [], hinweise = [];
  if (!B || !Array.isArray(B.boden) || !B.boden.length) return { ok: false, fehler: ['`boden` fehlt'], hinweise: hinweise };
  if (!B.id) fehler.push('`id` fehlt');
  if (!B.titel) fehler.push('`titel` fehlt');
  var g = groesse(B), arten = kampf.arten;
  // Das Gelände: Das Set muss jedes Zeichen zeichnen, sonst steht auf der Karte etwas anderes, als die Bühne meint (`g` und `,` kennt kein Set, `m` nur Sumpf und Wüste)
  var set = null;
  if (B.gelaende != null) {
    if (kampf.gelaende.indexOf(String(B.gelaende)) < 0) fehler.push('das Gelände „' + B.gelaende + '“ gibt es nicht; es gibt ' + kampf.gelaende.join(', '));
    else {
      set = setVon(B);
      var fremd = {}, M = motor(), inSet = function (c) { return c === 'm' ? (set.ordnung || '').indexOf('m') >= 0 : !!M.kachelVon(set, c); };
      B.boden.forEach(function (r, i) { String(r).split('').forEach(function (c, x) { if (arten[c] && !inSet(c)) (fremd[c] = fremd[c] || []).push(name(x + 1, i + 1)); }); });
      Object.keys(fremd).forEach(function (c) { fehler.push('„' + c + '“ zeichnet das Set „' + B.gelaende + '“ nicht: ' + fremd[c].slice(0, 4).join(', ') + (fremd[c].length > 4 ? ' und ' + (fremd[c].length - 4) + ' mehr' : '')); });
    }
  }
  if (g.sp > BREITE_MAX || g.ze > HOEHE_MAX) fehler.push('Bühne ' + g.sp + ' × ' + g.ze + ': höchstens ' + BREITE_MAX + ' × ' + HOEHE_MAX + ' Felder (mehr zeichnet die Karte nicht; ein großer Ort bekommt mehrere Schauplätze)');
  B.boden.forEach(function (r, i) {
    r = String(r);
    if (r.length !== g.sp) fehler.push('Zeile ' + (ZEILEN[i] || i + 1) + ' hat ' + r.length + ' statt ' + g.sp + ' Zeichen');
    r.split('').forEach(function (c, x) { if (!arten[c]) fehler.push('unbekanntes Zeichen „' + c + '“ bei ' + name(x + 1, i + 1)); });
  });
  if (Array.isArray(B.hoehe)) {
    if (B.hoehe.length !== g.ze) fehler.push('`hoehe` hat ' + B.hoehe.length + ' statt ' + g.ze + ' Zeilen');
    B.hoehe.forEach(function (r, i) {
      r = String(r);
      if (r.length !== g.sp) fehler.push('Höhe, Zeile ' + (ZEILEN[i] || i + 1) + ' hat ' + r.length + ' statt ' + g.sp + ' Zeichen');
      r.split('').forEach(function (c, x) { if (!/[0-9a-j]/.test(c)) fehler.push('unbekannte Höhe „' + c + '“ bei ' + name(x + 1, i + 1)); });
    });
  }
  // verdeckt: dieselben Zeilen; `.` ist immer zu sehen, ein Buchstabe nennt die Gruppe, die erst offen sein muss
  if (B.verdeckt) {
    if (!Array.isArray(B.verdeckt) || B.verdeckt.length !== g.ze) fehler.push('`verdeckt` braucht ' + g.ze + ' Zeilen');
    (B.verdeckt || []).forEach(function (r, i) {
      r = String(r);
      if (r.length !== g.sp) fehler.push('Verdeckt, Zeile ' + (ZEILEN[i] || i + 1) + ' hat ' + r.length + ' statt ' + g.sp + ' Zeichen');
      r.split('').forEach(function (c, x) { if (c !== '.' && c !== ' ' && !gruppeInfo(B, c)) fehler.push('Gruppe „' + c + '“ bei ' + name(x + 1, i + 1) + ' steht nicht in `gruppen`'); });
    });
  }
  Object.keys(B.gruppen || {}).forEach(function (k) {
    var info = gruppeInfo(B, k);
    if (!info) return;
    if (info.aussehen != null && (String(info.aussehen).length !== 1 || !arten[info.aussehen])) fehler.push('Gruppe „' + k + '“: `aussehen` muss ein Zeichen des Bodens sein, nicht „' + info.aussehen + '“');
    if (info.abgeschlossen && info.aussehen == null) hinweise.push('Gruppe „' + k + '“ ist abgeschlossen und zeigt `?`: Der Spieler sieht, dass dort etwas ist; `aussehen` tarnt sie');
  });
  function feldOk(f, was) {
    var a = kampf.feldAusName(f);
    if (!a || a[0] < 1 || a[1] < 1 || a[0] > g.sp || a[1] > g.ze) { fehler.push(was + ': Feld „' + f + '“ liegt nicht auf der Bühne'); return false; }
    return true;
  }
  function zeichenOk(e, was) {
    if (!feldOk(e.feld, was) || !e.zeichen) return;
    var c = zeichenAn(B, e.feld);
    if (String(e.zeichen).indexOf(c) < 0) fehler.push(was + ': bei ' + e.feld + ' steht „' + c + '“, nicht „' + e.zeichen + '“');
  }
  (B.merkmale || []).forEach(function (m) { if (!m || !m.name) fehler.push('ein Merkmal hat keinen Namen'); else zeichenOk(m, 'Merkmal „' + m.name + '“'); });
  // `zeichnung`: was nur das Bild ändert; das Feld muss auf der Bühne liegen und das passende Zeichen tragen
  var ZQ = B.zeichnung || {};
  [['kochtopf', 'r'], ['erloschen', 'ru'], ['gerefft', 'O'], ['luken', '/'], ['dach', ''], ['hang', '']].forEach(function (a) {
    (ZQ[a[0]] || []).forEach(function (f) { zeichenOk({ feld: f, zeichen: a[1] }, '`zeichnung.' + a[0] + '`'); });
  });
  Object.keys(ZQ.drehung || {}).forEach(function (f) { feldOk(f, '`zeichnung.drehung`'); });
  (ZQ.stroemung || []).forEach(function (e) { feldOk(e[0], '`zeichnung.stroemung`'); });
  ['gosse', 'planen', 'kran'].forEach(function (n) { (ZQ[n] || []).forEach(function (e) { feldOk(e[0], '`zeichnung.' + n + '`'); feldOk(e[1], '`zeichnung.' + n + '`'); }); });
  // Der Szenenzettel: was schon erzählt ist, je mit Feld und Zeichen
  (B.szene || []).forEach(function (s) { if (!s || !s.text) fehler.push('eine Zeile des Szenenzettels hat keinen Text'); else zeichenOk(s, 'Szene „' + s.text + '“'); });
  if (!(B.merkmale || []).length && !(B.szene || []).length) hinweise.push('weder Merkmale noch Szenenzettel: nichts bindet die Karte an die Erzählung');
  (B.eingaenge || []).forEach(function (e) {
    if (!e || !feldOk(e.feld, 'Eingang „' + (e && e.name) + '“')) return;
    var c = zeichenAn(B, e.feld);
    if (arten[c] && !arten[c].kosten) fehler.push('Eingang „' + e.name + '“ bei ' + e.feld + ' ist nicht betretbar');
  });
  Object.keys(B.ausschnitte || {}).forEach(function (a) {
    var c = ausschnittVon(B, a);
    if (!c) { fehler.push('Ausschnitt „' + a + '“ ist unlesbar, gemeint ist ["5/A", 20, 12]'); return; }
    if (c.x + c.b - 1 > g.sp || c.y + c.h - 1 > g.ze) fehler.push('Ausschnitt „' + a + '“ ragt über die Bühne hinaus');
  });
  // Erreichbarkeit: Jedes betretbare Feld muss von einem Eingang aus zu erreichen sein, auch über Wasser, nicht durch Wände
  var offen = {}, start = [];
  function geht(x, y) { var z = B.boden[y - 1], c = z ? z[x - 1] : null; return !!c && !!arten[c] && !!arten[c].kosten && !arten[c].unbekannt; }
  (B.eingaenge || []).forEach(function (e) { var a = kampf.feldAusName(e && e.feld); if (a && geht(a[0], a[1])) start.push(a); });
  if (!start.length) for (var y0 = 1; y0 <= g.ze && !start.length; y0++) for (var x0 = 1; x0 <= g.sp && !start.length; x0++) if (geht(x0, y0)) start.push([x0, y0]);
  while (start.length) {
    var p = start.pop(), k = p[0] + ',' + p[1];
    if (offen[k]) continue;
    offen[k] = 1;
    for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) if ((dx || dy) && geht(p[0] + dx, p[1] + dy) && !offen[(p[0] + dx) + ',' + (p[1] + dy)]) start.push([p[0] + dx, p[1] + dy]);
  }
  var zu = [];
  for (var y = 1; y <= g.ze; y++) for (var x = 1; x <= g.sp; x++) {
    if (!geht(x, y) || offen[x + ',' + y]) continue;
    var gr = gruppeAn(B, x, y), info = gr ? gruppeInfo(B, gr) : null;
    if (!(info && info.abgeschlossen)) zu.push(name(x, y));
  }
  if (zu.length) fehler.push('eingeschlossen, kein Weg dorthin: ' + zu.slice(0, 8).join(', ') + (zu.length > 8 ? ' und ' + (zu.length - 8) + ' mehr' : ''));
  return { ok: !fehler.length, fehler: fehler, hinweise: hinweise, groesse: g };
}

// Was die Figur sieht: der Ausschnitt ohne verdeckte Gruppen, die nicht offen sind
function sicht(B, c, offen) {
  offen = offen || [];
  var boden = [], hoehe = [], flach = true;
  for (var y = c.y; y < c.y + c.h; y++) {
    var r = '', h = '';
    for (var x = c.x; x < c.x + c.b; x++) {
      var gr = gruppeAn(B, x, y), zu = gr && offen.indexOf(gr) < 0, hc = (B.hoehe && B.hoehe[y - 1] ? B.hoehe[y - 1][x - 1] : '0') || '0';
      var tarn = zu ? gruppeInfo(B, gr) : null;
      r += zu ? (tarn && tarn.aussehen) || '?' : (B.boden[y - 1] || '')[x - 1] || '?';
      h += zu ? '0' : hc;
      if (!zu && hc !== '0') flach = false;
    }
    boden.push(r); hoehe.push(h);
  }
  function sichtbar(f) { var a = kampf.feldAusName(f); if (!a || !imAusschnitt(c, a[0], a[1])) return false; var gr = gruppeAn(B, a[0], a[1]); return !gr || offen.indexOf(gr) >= 0; }
  var notizen = (B.merkmale || []).filter(function (m) { return m && m.schild && sichtbar(m.feld) && (!m.gruppe || offen.indexOf(m.gruppe) >= 0); }).map(function (m) { return { feld: m.feld, text: m.name }; });
  var licht = (B.licht || []).filter(function (l) { return l && sichtbar(l.feld); });
  // Auch die Zeichnung verrät nichts: Was in einer verdeckten Gruppe oder außerhalb des Ausschnitts liegt, bleibt weg (Rechtecke, wenn beide Ecken sichtbar sind oder außerhalb liegen)
  var Q = B.zeichnung || {}, zn = {};
  ['kochtopf', 'erloschen', 'gerefft', 'luken', 'dach', 'hang'].forEach(function (n) { var l = (Q[n] || []).filter(sichtbar); if (l.length) zn[n] = l; });
  Object.keys(Q.drehung || {}).forEach(function (f) { if (sichtbar(f)) { zn.drehung = zn.drehung || {}; zn.drehung[f] = Q.drehung[f]; } });
  var st = (Q.stroemung || []).filter(function (e) { return sichtbar(e[0]); }); if (st.length) zn.stroemung = st;
  function keinGeheimnis(f) { var a = kampf.feldAusName(f); if (!a) return false; var gr = gruppeAn(B, a[0], a[1]); return !gr || offen.indexOf(gr) >= 0; }
  function ueberlappt(e) { var a = kampf.feldAusName(e[0]), b = kampf.feldAusName(e[1]); return !!a && !!b && Math.max(a[0], b[0]) >= c.x && Math.min(a[0], b[0]) < c.x + c.b && Math.max(a[1], b[1]) >= c.y && Math.min(a[1], b[1]) < c.y + c.h; }
  ['gosse', 'planen', 'kran'].forEach(function (n) { var l = (Q[n] || []).filter(function (e) { return ueberlappt(e) && keinGeheimnis(e[0]) && keinGeheimnis(e[1]); }); if (l.length) zn[n] = l; });
  ['dachboden', 'unterDeck', 'unterWasser'].forEach(function (n) { if (Q[n]) zn[n] = true; });
  return { boden: boden, hoehe: flach ? null : hoehe, notizen: notizen, licht: licht, zeichnung: Object.keys(zn).length ? zn : null };
}

// Die Wörter, die der Spieler lesen wird, gegen Spielstand und Spoilerdatei
function woerterPruefen(texte, q) {
  var wissen = require(path.join(__dirname, 'wissen.js'));
  var stand = wissen.wortschatz(q.spielstand), spoiler = wissen.wortschatz(q.spoiler), fehler = [], hinweise = [];
  texte.forEach(function (t) {
    wissen.woerterVon(t).forEach(function (w) {
      if (wissen.kennt(stand, w, true)) return;
      if (wissen.kennt(spoiler, w, false)) fehler.push('„' + t + '“: das Wort steht nur in der Spoilerdatei');
      else hinweise.push('„' + t + '“: „' + w + '“ steht nicht im Spielstand');
    });
  });
  return { fehler: fehler.filter(function (f, i, a) { return a.indexOf(f) === i; }), hinweise: hinweise.filter(function (f, i, a) { return a.indexOf(f) === i; }) };
}

function profilPruefen(P) {
  var fehler = [];
  if (!P || !P.id || !P.name) return { ok: false, fehler: ['`id` oder `name` fehlt'] };
  var K = kampf.lies({ spalten: 1, zeilen: 1, boden: ['.'], figur: P.id, wesen: [Object.assign({}, P, { gefolge: undefined, x: 1, y: 1 })] }), f = K.figur;
  ['waffen', 'zauber', 'bonus', 'aktionen'].forEach(function (a) {
    var soll = Array.isArray(P[a]) ? P[a].length : 0;
    if (soll !== f[a].length) fehler.push('`' + a + '`: ' + soll + ' angegeben, die Karte liest ' + f[a].length);
  });
  if (!f.waffen.length && !f.zauber.length) fehler.push('weder Waffen noch Zauber: Die Karte zeigt dann keine Lagezeile');
  (P.gefolge || []).forEach(function (g) { if (!g || !g.id || !g.name) fehler.push('ein Gefährte hat keine `id` oder keinen `name`'); });
  return { ok: !fehler.length, fehler: fehler, figur: f };
}

// Die erste Karte eines Kampfes
function karte(B, o) {
  o = o || {};
  var c = ausschnittVon(B, o.ausschnitt);
  if (!c) throw new Error('Ausschnitt „' + o.ausschnitt + '“ gibt es nicht');
  var s = sicht(B, c, o.offen);
  // `weiter`: ein neuer Ausschnitt in einem laufenden Kampf. Figur, Wesen und Titel liegen im Browser; der Ursprung und die Listen gelten neu.
  if (o.weiter) {
    var W = { kampf: o.kampf, nr: o.nr, spalten: c.b, zeilen: c.h, ursprung: [c.x, ZEILEN[c.y - 1]], boden: s.boden };
    if (s.hoehe) W.hoehe = s.hoehe;
    W.notizen = s.notizen; W.licht = s.licht;
    if (B.gelaende && s.zeichnung) W.zeichnung = s.zeichnung;
    return { daten: W, ausschnitt: c, sicht: s };
  }
  var K = { kampf: o.kampf, nr: o.nr, ganz: true, titel: o.titel || B.titel, runde: o.runde, stand: o.stand };
  if (B.gelaende) K.gelaende = B.gelaende;
  if (B.gelaende && s.zeichnung) K.zeichnung = s.zeichnung;
  if (o.profil) K.figur = o.profil.id;
  K.spalten = c.b; K.zeilen = c.h;
  if (c.x !== 1 || c.y !== 1) K.ursprung = [c.x, ZEILEN[c.y - 1]];
  K.boden = s.boden;
  if (s.hoehe) K.hoehe = s.hoehe;
  if (s.notizen.length) K.notizen = s.notizen;
  if (s.licht.length) K.licht = s.licht;
  var wesen = [];
  if (o.profil) {
    var f = {}; Object.keys(o.profil).forEach(function (k) { if (k !== 'gefolge' && k !== 'tpMax') f[k] = o.profil[k]; });
    f.art = 'figur';
    if (o.feld) f.feld = o.feld;
    if (o.tp != null && o.profil.tpMax) f.tp = [+o.tp, o.profil.tpMax];
    wesen.push(f);
  }
  var nachId = {}, weitere = o.wesen || [];
  weitere.forEach(function (w) { if (w && w.id != null) nachId[w.id] = w; });
  // Gefährten und Tiere stehen im Profil, ihr Feld und ihre TP in `wesen`; nur, wer dabei ist, kommt auf die Karte
  ((o.profil && o.profil.gefolge) || []).forEach(function (g) {
    var w = nachId[g.id];
    if (!w) return;
    var k = {}; Object.keys(g).forEach(function (s0) { k[s0] = g[s0]; }); Object.keys(w).forEach(function (s0) { k[s0] = w[s0]; });
    wesen.push(k); delete nachId[g.id];
  });
  weitere.forEach(function (w) { if (w && (w.id == null || nachId[w.id])) wesen.push(w); });
  K.wesen = wesen;
  return { daten: K, ausschnitt: c, sicht: s };
}

// Eine verdeckte Gruppe wird sichtbar: der Eintrag für `aendern`, kleinster Kasten um die Gruppe, `_` lässt stehen, was nicht dazugehört
function aufdecken(B, g, o) {
  o = o || {};
  var c = ausschnittVon(B, o.ausschnitt), felder = [];
  if (!c) throw new Error('Ausschnitt „' + o.ausschnitt + '“ gibt es nicht');
  for (var y = c.y; y < c.y + c.h; y++) for (var x = c.x; x < c.x + c.b; x++) if (gruppeAn(B, x, y) === g) felder.push([x, y]);
  if (!felder.length) return null;
  var x0 = Math.min.apply(0, felder.map(function (f) { return f[0]; })), x1 = Math.max.apply(0, felder.map(function (f) { return f[0]; }));
  var y0 = Math.min.apply(0, felder.map(function (f) { return f[1]; })), y1 = Math.max.apply(0, felder.map(function (f) { return f[1]; }));
  var boden = [], hoehe = [], flach = true;
  for (var yy = y0; yy <= y1; yy++) {
    var r = '', h = '';
    for (var xx = x0; xx <= x1; xx++) {
      if (gruppeAn(B, xx, yy) === g) { var hc = (B.hoehe && B.hoehe[yy - 1] ? B.hoehe[yy - 1][xx - 1] : '0') || '0'; r += B.boden[yy - 1][xx - 1]; h += hc; if (hc !== '0') flach = false; }
      else { r += '_'; h += '_'; }
    }
    boden.push(r); hoehe.push(h);
  }
  var eintrag = [name(x0, y0), boden.length === 1 ? boden[0] : boden];
  if (!flach) eintrag.push(hoehe.length === 1 ? hoehe[0] : hoehe);
  var neueSchilder = (B.merkmale || []).filter(function (m) { var a = m && m.schild ? kampf.feldAusName(m.feld) : null; return a && imAusschnitt(c, a[0], a[1]) && (gruppeAn(B, a[0], a[1]) === g || m.gruppe === g); }).map(function (m) { return { feld: m.feld, text: m.name }; });
  var neuesLicht = (B.licht || []).filter(function (l) { var a = l ? kampf.feldAusName(l.feld) : null; return a && imAusschnitt(c, a[0], a[1]) && gruppeAn(B, a[0], a[1]) === g; });
  var vor = sicht(B, c, o.offen).zeichnung, nach = sicht(B, c, (o.offen || []).concat([g])).zeichnung;
  return { eintrag: eintrag, schilder: neueSchilder, licht: neuesLicht, zeichnung: JSON.stringify(vor) !== JSON.stringify(nach) ? nach : null };
}

// Karte mit Spalten und Zeilen, zum Lesen für die Spielleitung
function zeige(B, c) {
  var aus = B.gelaende ? ['  Gelände: ' + B.gelaende] : [], kopf1 = '      ', kopf2 = '      ';
  for (var x = c.x; x < c.x + c.b; x++) { kopf1 += x % 10 === 0 ? String(x / 10 % 10) : ' '; kopf2 += String(x % 10); }
  aus.push(kopf1, kopf2);
  for (var y = c.y; y < c.y + c.h; y++) {
    var r = B.boden[y - 1].substr(c.x - 1, c.b), v = '';
    for (var x2 = c.x; x2 < c.x + c.b; x2++) v += gruppeAn(B, x2, y) || '.';
    var h = B.hoehe && B.hoehe[y - 1] ? B.hoehe[y - 1].substr(c.x - 1, c.b) : '';
    aus.push('  ' + ZEILEN[y - 1] + '   ' + r + (/[^0]/.test(h) ? '   Höhe ' + h : '') + (/[^.]/.test(v) ? '   verdeckt ' + v : ''));
  }
  (B.merkmale || []).forEach(function (m) { var a = kampf.feldAusName(m.feld); if (a && imAusschnitt(c, a[0], a[1])) aus.push('  ' + m.feld + ': ' + m.name); });
  return aus.join('\n');
}

module.exports = { pruefe: pruefe, karte: karte, aufdecken: aufdecken, profilPruefen: profilPruefen, woerterPruefen: woerterPruefen, ausschnittVon: ausschnittVon, kurz: kurz, zeige: zeige };

if (require.main === module) {
  var a = process.argv.slice(2), opt = {}, frei = [];
  for (var i = 0; i < a.length; i++) {
    if (a[i].indexOf('--') === 0) {
      var sch = a[i].slice(2);
      if (i + 1 < a.length && a[i + 1].indexOf('--') !== 0) opt[sch] = a[++i]; else opt[sch] = true;
    } else frei.push(a[i]);
  }
  var lade = function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); };
  var ende = function (ok, kopf, fehler, hinweise) {
    console.log((ok ? 'FREIGEGEBEN' : 'GESPERRT') + ' · ' + kopf);
    (fehler || []).forEach(function (f) { console.log('  ✗ ' + f); });
    (hinweise || []).forEach(function (h) { console.log('  · ' + h); });
    return ok ? 0 : 1;
  };
  var quellen = function () {
    if (!opt.spielstand || !opt.spoiler) return null;
    var stand = fs.readFileSync(opt.spielstand, 'utf8');
    if (opt.weitere) String(opt.weitere).split(',').forEach(function (f) { stand += '\n\n' + fs.readFileSync(f, 'utf8'); });
    // Was die Figur gerade erst sieht, steht noch nicht im Spielstand; die Spielleitung nennt es ausdrücklich
    if (opt.gesehen) stand += '\n\n' + String(opt.gesehen).split(',').join('\n');
    return { spielstand: stand, spoiler: fs.readFileSync(opt.spoiler, 'utf8') };
  };
  var offenListe = opt.offen ? String(opt.offen).split(',') : [];
  var rc = 2;
  try {
    if (opt.pruefe) {
      var B = lade(opt.pruefe), r = pruefe(B), q0 = quellen();
      if (q0 && r.groesse) {
        var t0 = [B.titel].concat((B.merkmale || []).filter(function (m) { return m && m.schild && !m.gruppe && (function () { var p = kampf.feldAusName(m.feld); return p && !gruppeAn(B, p[0], p[1]); })(); }).map(function (m) { return m.name; }));
        var w0 = woerterPruefen(t0, q0);
        r.fehler = r.fehler.concat(w0.fehler); r.hinweise = r.hinweise.concat(w0.hinweise); r.ok = !r.fehler.length;
      }
      rc = ende(r.ok, (B.titel || B.id || 'Bühne') + (r.groesse ? ' · ' + r.groesse.sp + ' × ' + r.groesse.ze : '') + ' · Kampfkarte ' + kampf.version, r.fehler, r.hinweise);
    } else if (opt.zeige) {
      var B2 = lade(opt.zeige), c2 = ausschnittVon(B2, opt.ausschnitt);
      console.log(zeige(B2, c2));
      rc = 0;
    } else if (opt.karte) {
      var B3 = lade(opt.karte), r3 = pruefe(B3), P = opt.profil ? lade(opt.profil) : null, fehler3 = r3.fehler.slice(), hin3 = r3.hinweise.slice();
      if (opt.weiter && (P || opt.wesen)) fehler3.push('--weiter schreibt nur den neuen Ausschnitt; Figur und Wesen stehen schon im Browser');
      else if (P) { var rp = profilPruefen(P); fehler3 = fehler3.concat(rp.fehler); }
      if (!opt.kampf) fehler3.push('--kampf fehlt, etwa pf-s19-1');
      if (opt.nr == null || opt.nr === true) fehler3.push('--nr fehlt, die nächste Wurfnummer');
      var wesen3 = opt.wesen ? lade(opt.wesen) : [];
      var k3 = karte(B3, { weiter: !!opt.weiter, titel: typeof opt.titel === 'string' ? opt.titel : null, ausschnitt: opt.ausschnitt, offen: offenListe, profil: P, feld: opt.feld, tp: opt.tp, wesen: wesen3, kampf: opt.kampf, nr: +opt.nr, runde: opt.runde == null ? undefined : (isNaN(+opt.runde) ? opt.runde : +opt.runde), stand: opt.stand });
      var q3 = quellen();
      if (q3) {
        var t3 = [k3.daten.titel].concat(k3.sicht.notizen.map(function (n) { return n.text; }), wesen3.map(function (w) { return w && w.name; })).filter(Boolean);
        var w3 = woerterPruefen(t3, q3);
        fehler3 = fehler3.concat(w3.fehler); hin3 = hin3.concat(w3.hinweise);
      }
      (k3.daten.wesen || []).forEach(function (w) { if (w.feld == null) hin3.push('„' + (w.name || w.id) + '“ hat noch kein Feld'); });
      rc = ende(!fehler3.length, B3.titel + ' · Ausschnitt ' + k3.ausschnitt.name + ': ' + k3.ausschnitt.b + ' × ' + k3.ausschnitt.h + ' ab ' + name(k3.ausschnitt.x, k3.ausschnitt.y) + ' · Kampfkarte ' + kampf.version, fehler3, hin3);
      if (!rc) console.log('var KAMPF=' + kurz(k3.daten));
    } else if (opt.aufdecken) {
      var B4 = lade(opt.aufdecken), g4 = frei[0], e4 = aufdecken(B4, g4, { ausschnitt: opt.ausschnitt, offen: offenListe });
      if (!e4) { console.log('GESPERRT · Gruppe „' + g4 + '“ liegt nicht in diesem Ausschnitt'); rc = 1; }
      else {
        console.log('aendern:[' + kurz(e4.eintrag) + ']');
        if (e4.schilder.length) {
          var offen4 = offenListe.concat([g4]), c4 = ausschnittVon(B4, opt.ausschnitt);
          console.log('notizen:' + kurz(sicht(B4, c4, offen4).notizen));
        }
        if (e4.licht.length) {
          var offen5 = offenListe.concat([g4]), c5 = ausschnittVon(B4, opt.ausschnitt);
          console.log('licht:' + kurz(sicht(B4, c5, offen5).licht));
        }
        if (e4.zeichnung) console.log('zeichnung:' + kurz(e4.zeichnung));
        rc = 0;
      }
    } else if (opt.profil) {
      var P5 = lade(opt.profil), r5 = profilPruefen(P5);
      rc = ende(r5.ok, 'Profil ' + (P5.name || P5.id) + (r5.figur ? ' · ' + r5.figur.waffen.length + ' Waffen, ' + r5.figur.zauber.length + ' Zauber, ' + r5.figur.bonus.length + ' Bonusaktionen, ' + r5.figur.aktionen.length + ' Aktionen' : ''), r5.fehler);
    } else {
      console.error('Aufruf: node buehne.js --pruefe <bühne.json> · --zeige <bühne.json> · --karte <bühne.json> --kampf <id> --nr <n> · --aufdecken <bühne.json> <gruppe> · --profil <profil.json>');
    }
  } catch (e) { console.log('GESPERRT · ' + e.message); rc = 1; }
  process.exit(rc);
}
