// Wissensprüfung für Inventar und Questlog (Node, nur bei der Spielleitung).
// Grundsatz wie beim Kartentisch: Was ein Widget zeigt, muss im Spielstand stehen. Jedes Wort und jede
// Zahl wird dort belegt, Namen und Quellen müssen vorkommen, längere Einträge brauchen eine Stelle im
// Spielstand, die sie trägt (Belegprüfung). Was nur in der Spoilerdatei steht, sperrt die Freigabe.
// Dazu kommen die Prüfungen des jeweiligen Tisches (zusatz), beim Questlog der Lore-Check gegen den
// Weltkalender. Die Spoilerdatei wird nur gelesen, nie ausgegeben.
'use strict';

/* ---------- Wortvergleich (wie im Kartentisch) ---------- */
var AKZENT = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
function norm(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(AKZENT, '');
}
function woerterVon(s) { return norm(s).match(/[a-z]{3,}/g) || []; }
function wortschatz(s) {
  var ws = { exakt: {}, fach: {} };
  woerterVon(s).forEach(function (w) {
    if (ws.exakt[w]) return;
    ws.exakt[w] = true;
    (ws.fach[w.slice(0, 3)] = ws.fach[w.slice(0, 3)] || []).push(w);
  });
  return ws;
}
function verwandt(a, b) {
  var n = 0, m = Math.min(a.length, b.length), lang = Math.max(a.length, b.length);
  while (n < m && a.charCodeAt(n) === b.charCodeAt(n)) n++;
  return n >= Math.min(4, m) && lang - n <= (m < 5 ? 2 : 3);
}
function kennt(ws, w, alsAnfang) {
  if (ws.exakt[w]) return true;
  return (ws.fach[w.slice(0, 3)] || []).some(function (x) { return verwandt(w, x) || (alsAnfang && w.length >= 4 && x.indexOf(w) === 0); });
}
var ZAHLWORT = { 1: 'eine|einer|einen|ein|eins', 2: 'zwei', 3: 'drei', 4: 'vier', 5: 'fuenf', 6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun', 10: 'zehn', 11: 'elf', 12: 'zwoelf' };
function zahlBekannt(stand, nStand, z) {
  z = String(z);
  if (new RegExp('(^|[^0-9.,])' + z + '([^0-9]|$)').test(stand)) return true;
  if (z.length > 3) {
    var punkt = z.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (new RegExp('(^|[^0-9])' + punkt.replace(/\./g, '\\.') + '([^0-9]|$)').test(stand)) return true;
  }
  return !!ZAHLWORT[+z] && new RegExp('(^|[^a-z])(' + ZAHLWORT[+z] + ')([^a-z]|$)').test(nStand);
}
function regexText(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function kommtVor(text, form) {
  form = norm(form).trim();
  return !!form && new RegExp('(^|[^a-z0-9])' + regexText(form) + '(s|es|n|en|e|er|ern|em)?([^a-z0-9]|$)').test(text);
}

/* ---------- Belegprüfung ---------- */
// Füllwörter zählen nicht als Inhalt; was übrig bleibt, muss eine Stelle im Spielstand tragen.
var FUELL = {};
('aber alle allem allen aller alles also auch auf aus bei beim bin bis bist dann das dass dein deine deinem deinen deiner dem den denn der des die dies diese diesem diesen dieser doch dort dich dir durch eine einem einen einer eines etwa etwas euch euer fuer gegen hat hatte hier ihm ihn ihnen ihr ihre ihrem ihren ist jede jedem jeden jeder jetzt kann kein keine keinen mehr mich mir mit nach nicht noch nun nur oder ohne sehr sein seine seinem seinen seiner seit sich sie sind soll sollen schon ueber und uns unter vom von vor war waren was weil wenn wer wie wird wir wo zum zur zwischen wieder dabei damit darauf davon dazu hinter immer bereits einmal sowie')
  .split(' ').forEach(function (w) { FUELL[w] = true; });
function inhalt(text) { return woerterVon(text).filter(function (w) { return w.length >= 4 && !FUELL[w]; }); }
// Einheiten sind die Zeilen des Spielstands (Absätze, Listenpunkte). Ein Eintrag wird Satz für Satz
// geprüft: Jeder Satz braucht eine Zeile, die den geforderten Anteil seiner Inhaltswörter trägt.
// So lässt sich nichts aus verstreuten Wörtern neu zusammensetzen.
function einheiten(stand) {
  var aus = [];
  stand.split('\n').forEach(function (zeile, i) {
    if (zeile.trim()) aus.push({ zeile: i + 1, ws: wortschatz(zeile) });
  });
  return aus;
}
function saetze(text) { return String(text).split(/(?<=[.!?;])\s+/).filter(function (x) { return x.trim(); }); }
function belegSatz(satz, E) {
  var w = inhalt(satz);
  if (!w.length) return { anteil: 1, zeile: 0 };
  var best = { anteil: 0, zeile: 0 };
  for (var i = 0; i < E.length; i++) {
    var n = 0;
    w.forEach(function (x) { if (kennt(E[i].ws, x)) n++; });
    var a = n / w.length;
    if (a > best.anteil) best = { anteil: a, zeile: E[i].zeile };
    if (best.anteil === 1) return best;
  }
  return best;
}
function beleg(text, E) {
  var schwach = { anteil: 1, zeile: 0, satz: '' };
  saetze(text).forEach(function (satz) {
    var b = belegSatz(satz, E);
    if (b.anteil < schwach.anteil) schwach = { anteil: b.anteil, zeile: b.zeile, satz: satz };
  });
  return schwach;
}

// Nähe zur Spoilerdatei: Teilt ein Satz ein Paar benachbarter Inhaltswörter mit der Spoilerdatei
// („verrät … Figur“, „versunkene Kapelle“), muss der Spielstand dieselben Wörter in derselben Reihenfolge
// nah beieinander haben (höchstens drei Inhaltswörter Abstand). Sonst klingt der Satz nach der Spoilerdatei.
function stamm(w) { return w.slice(0, 5); }
function paare(text, weite) {
  var aus = [];
  saetze(text).forEach(function (satz) {
    var w = inhalt(satz).map(stamm);
    for (var i = 0; i < w.length; i++) for (var j = i + 1; j <= i + weite && j < w.length; j++) aus.push(w[i] + '|' + w[j]);
  });
  return aus;
}
function paarSatz(text, weite) {
  var p = {};
  text.split('\n').forEach(function (z) { paare(z, weite).forEach(function (x) { p[x] = true; }); });
  return p;
}

/* ---------- Glossar des Spielstands ---------- */
function glossarStichwoerter(stand) {
  var m = stand.split(/\n(?=## )/).filter(function (t) { return /^## Glossar/.test(t); })[0];
  if (!m) return null;
  var aus = [];
  (m.match(/\*\*([^*]+)\*\*/g) || []).forEach(function (x) { aus.push(norm(x.slice(2, -2)).trim()); });
  return aus;
}

/* ---------- Prüfung ---------- */
var ALLGEMEIN = ['selbst gesehen', 'selbst erlebt', 'selbst gelesen', 'selbst gehört', 'geruecht', 'gerücht'];

function pruefe(D, schema, quellen, zusatz) {
  quellen = quellen || {};
  var fehler = [], hinweise = [], schon = {}, texte = [], ids = {}, zaehl = {};
  function melde(liste, s) { if (!schon[s]) { schon[s] = true; liste.push(s); } }
  var stand = String(quellen.spielstand || ''), spoiler = String(quellen.spoiler || '');
  if (!stand.trim()) melde(fehler, 'Spielstand fehlt: Ohne ihn lässt sich nichts belegen.');
  if (!spoiler.trim()) melde(fehler, 'Spoilerdatei fehlt: Ohne sie keine Freigabe.');
  var wStand = wortschatz(stand), wSpoiler = wortschatz(spoiler), nStand = norm(stand), E = einheiten(stand);
  var glossar = glossarStichwoerter(stand), pStand = paarSatz(stand, 3), pSpoiler = paarSatz(spoiler, 1);
  if (!D || typeof D !== 'object' || Array.isArray(D)) return { ok: false, fehler: ['Daten fehlen oder sind kein Objekt.'], hinweise: [], zaehl: zaehl };

  var F = schema.felder, W = schema.wahl || {}, P = schema.pflicht || {};
  function name(typ, o, i) {
    var t = o && typeof o === 'object' ? (o.name || o.titel || o.id || (o.text ? String(o.text).slice(0, 40) + (String(o.text).length > 40 ? '…' : '') : '')) : '';
    return { traeger: 'Träger', ding: 'Ding', auftrag: 'Auftrag', etappe: 'Etappe', termin: 'Termin', wort: 'Wort', geld: 'Geld' }[typ] + ' ' + (t ? '„' + t + '“' : i + 1);
  }
  function wert(v, typ, wo) {
    if (v === undefined) return;
    if (/\[\]$/.test(typ)) {
      var t = typ.slice(0, -2);
      if (!Array.isArray(v)) { melde(fehler, (wo || schema.name) + ': muss eine Liste sein'); return; }
      v.forEach(function (x, i) { wert(x, t, F[t] ? (wo ? wo + ' › ' : '') + name(t, x, i) : wo); });
      return;
    }
    if (F[typ]) { objekt(v, typ, wo); return; }
    if (W[typ]) { if (W[typ].indexOf(v) < 0) melde(fehler, wo + ': „' + v + '“ ist nicht erlaubt (' + W[typ].join(', ') + ')'); return; }
    if (typ === 'text') { if (typeof v !== 'string') melde(fehler, wo + ': muss Text sein'); else texte.push({ t: v, wo: wo }); return; }
    if (typ === 'id') { if (typeof v !== 'string' || !/^[a-z0-9_-]+$/.test(v)) melde(fehler, wo + ': id nur aus Kleinbuchstaben, Ziffern, - und _'); else texte.push({ t: v, wo: wo, id: true }); return; }
    if (typ === 'zahl') { if (typeof v !== 'number' || !isFinite(v) || v < 0) melde(fehler, wo + ': muss eine Zahl ab 0 sein'); return; }
    if (typ === 'zahlen') { if (!Array.isArray(v) || !v.every(function (x) { return typeof x === 'number' && isFinite(x); })) melde(fehler, wo + ': muss eine Liste aus Zahlen sein'); return; }
    if (typ === 'ja') { if (typeof v !== 'boolean') melde(fehler, wo + ': muss true oder false sein'); return; }
  }
  function objekt(o, typ, wo) {
    var wurzel = typ === schema.wurzel;
    if (!wo) wo = schema.name || 'Daten';
    if (!o || typeof o !== 'object' || Array.isArray(o)) { melde(fehler, wo + ': muss ein Objekt sein'); return; }
    zaehl[typ] = (zaehl[typ] || 0) + 1;
    Object.keys(o).forEach(function (k) {
      var ft = F[typ][k];
      if (!ft) { melde(fehler, wo + ': Feld „' + k + '“ gibt es nicht. Alles in den Daten steht lesbar im Widget.'); return; }
      if (/\[\]$/.test(ft) && F[ft.slice(0, -2)]) wert(o[k], ft, wurzel ? '' : wo);
      else wert(o[k], ft, wo + ' (' + k + ')');
    });
    (P[typ] || []).forEach(function (k) { if (o[k] === undefined) melde(fehler, wo + ': „' + k + '“ fehlt'); });
    if (typeof o.id === 'string') { if (ids[typ + ':' + o.id]) melde(fehler, wo + ': id „' + o.id + '“ kommt mehrfach vor'); ids[typ + ':' + o.id] = true; }

    // Namen: wörtlich im Spielstand (oder eine Schreibweise aus „namen“)
    var nf = (schema.namen || {})[typ];
    if (nf && typeof o[nf] === 'string') {
      var formen = [o[nf]].concat(Array.isArray(o.namen) ? o.namen : []).filter(function (f) { return typeof f === 'string'; });
      if (!formen.some(function (f) { return kommtVor(nStand, f); })) melde(fehler, wo + ': Der Name steht nicht im Spielstand (Schreibweise in „namen“ ergänzen oder zuerst in den Spielstand eintragen)');
    }
    // Belege: längere Texte brauchen eine tragende Stelle im Spielstand
    var bf = (schema.belege || {})[typ] || {};
    Object.keys(bf).forEach(function (k) {
      if (typeof o[k] !== 'string') return;
      var b = beleg(o[k], E);
      var nah = paare(o[k], 1).filter(function (x) { return pSpoiler[x] && !pStand[x]; });
      if (nah.length) melde(fehler, wo + ' (' + k + '): klingt nach der Spoilerdatei. Das Wortpaar „' + nah[0].replace('|', ' … ') + '“ steht dort, im Spielstand nicht. Näher am Spielstand formulieren oder es zuerst dort eintragen, wenn die Figur es weiß.');
      if (b.anteil < bf[k]) melde(fehler, wo + ' (' + k + '): nicht belegt: „' + (b.satz.length > 60 ? b.satz.slice(0, 60) + '…' : b.satz) + '“. Die beste Stelle im Spielstand (Zeile ' + b.zeile + ') trägt nur ' + Math.round(b.anteil * 100) + ' % der Inhaltswörter dieses Satzes, nötig sind ' + Math.round(bf[k] * 100) + ' %.');
    });
    // Quellen und Glossar-Stichwörter
    ((schema.quellen || {})[typ] || []).forEach(function (k) {
      var vs = Array.isArray(o[k]) ? o[k] : typeof o[k] === 'string' ? [o[k]] : [];
      vs.forEach(function (v) {
        if (typeof v !== 'string') return;
        if (k === 'glossar') {
          var n = norm(v).trim();
          var ok = glossar ? glossar.some(function (g) { return g === n || g.indexOf(n + ',') === 0 || g.indexOf(n + ' ') === 0 || kommtVor(g, n); }) : kommtVor(nStand, v);
          if (!ok) melde(fehler, wo + ': Glossar-Stichwort „' + v + '“ steht nicht im Glossar des Spielstands');
          return;
        }
        v.split(/,\s*|\s+und\s+/).forEach(function (teil) {
          teil = teil.trim();
          if (!teil || ALLGEMEIN.indexOf(norm(teil)) >= 0 || ALLGEMEIN.indexOf(teil.toLowerCase()) >= 0) return;
          if (!kommtVor(nStand, teil)) melde(fehler, wo + ' (' + k + '): „' + teil + '“ steht nicht im Spielstand');
        });
      });
    });
    // Zahlenfelder, die im Spielstand stehen müssen (Tage, Fristen)
    ((schema.zahlen || {})[typ] || []).forEach(function (k) {
      if (typeof o[k] === 'number' && !zahlBekannt(stand, nStand, o[k])) melde(fehler, wo + ' (' + k + '): Zahl ' + o[k] + ' steht nicht im Spielstand');
    });
  }
  objekt(D, schema.wurzel, '');

  // Wortschatz: jedes Wort und jede Zahl aus dem Spielstand, nichts aus der Spoilerdatei
  texte.forEach(function (x) {
    woerterVon(x.t).forEach(function (w) {
      if (x.id) { if (!kennt(wStand, w, true) && kennt(wSpoiler, w, true)) melde(fehler, x.wo + ': id „' + x.t + '“ enthält „' + w + '“ aus der Spoilerdatei'); return; }
      if (kennt(wStand, w)) return;
      if (kennt(wSpoiler, w)) melde(fehler, x.wo + ': „' + w + '“ steht nur in der Spoilerdatei');
      else melde(fehler, x.wo + ': „' + w + '“ steht nicht im Spielstand');
    });
    if (!x.id) (x.t.match(/\d+/g) || []).forEach(function (z) {
      if (!zahlBekannt(stand, nStand, z)) melde(fehler, x.wo + ': Zahl ' + z + ' steht nicht im Spielstand');
    });
  });

  if (typeof zusatz === 'function') {
    var z = zusatz(D, { stand: stand, nStand: nStand, norm: norm, kommtVor: kommtVor, zahlBekannt: zahlBekannt, kennt: kennt, wStand: wStand, woerterVon: woerterVon }) || {};
    (z.fehler || []).forEach(function (f) { melde(fehler, f); });
    (z.hinweise || []).forEach(function (h) { melde(hinweise, h); });
  }
  return { ok: fehler.length === 0, fehler: fehler, hinweise: hinweise, zaehl: zaehl };
}

module.exports = { pruefe: pruefe, norm: norm, woerterVon: woerterVon, wortschatz: wortschatz, kennt: kennt, zahlBekannt: zahlBekannt, kommtVor: kommtVor, beleg: beleg, einheiten: einheiten };
