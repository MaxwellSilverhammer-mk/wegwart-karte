/*
 * Wegwart-Händlertisch – Handel für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Handel: Probefigur bei Bodo in Rohrdorf</h2>
 *   <div id="handel">Auslage lädt … Falls nicht, schreib Handel.</div>
 *   <script>var HANDEL={nr:3, ort:'Rohrdorf', stand:'Stand: Tag 8', haendler:{name:'Bodo', …}, gepaeck:{…}}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/handel.js';document.head.appendChild(s);<\/script>
 *
 * Eine Waage auf Pergament: links liegt, was die Figur gibt, rechts, was der Händler gibt.
 * Ware kommt durch Antippen oder Ziehen auf die Schalen; die Münzen legt der Tisch selbst auf,
 * mit Wechselgeld aus Beutel und Kasse. Steht die Waage im Lot, schickt „Handschlag“ eine Zeile
 * „Handel #nr · …“ per sendPrompt an die Spielleitung; „Feilschen“ schickt den Korb, und die Spielleitung
 * stellt den Würfelkasten (Überzeugen). `gepaeck` hat die Form des Gepäcks
 * (inventar.js), dazu je Ding `ankauf`: was dieser Händler dafür zahlt. Alle Felder in der README.
 */
(function () {
  'use strict';

  var VERSION = '1.0';
  var ruhig = typeof window !== 'undefined' && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Arten, Gruppen und Münzen wie im Gepäck (inventar.js) ---------- */
  var DINGART = {
    waffe: ['sword', 'waffen'], ruestung: ['shield', 'waffen'], kleidung: ['shirt', 'kleidung'], kostuem: ['masks-theater', 'kleidung'],
    instrument: ['music', 'instrumente'],
    werkzeug: ['tool', 'ausruestung'], schreibzeug: ['pencil', 'ausruestung'], licht: ['flame', 'ausruestung'], seil: ['spiral', 'ausruestung'], behaelter: ['backpack', 'ausruestung'],
    schlafzeug: ['bed', 'ausruestung'], tierbedarf: ['horse', 'ausruestung'], boot: ['sailboat', 'ausruestung'],
    ration: ['baguette', 'proviant'], proviant: ['bottle', 'proviant'], trank: ['flask', 'proviant'],
    papier: ['file-text', 'papiere'], brief: ['mail', 'papiere'], karte: ['map', 'papiere'],
    zeichen: ['bookmark', 'zeichen'], andenken: ['flag', 'zeichen'], fund: ['search', 'zeichen'], wertsache: ['diamond', 'zeichen'],
    spiel: ['cards', 'sonstiges'], sonstiges: ['point', 'sonstiges']
  };
  var GRUPPEN = [['waffen', 'Waffen und Rüstung'], ['kleidung', 'Kleidung'], ['instrumente', 'Instrumente'], ['ausruestung', 'Ausrüstung'],
    ['proviant', 'Proviant'], ['papiere', 'Papiere'], ['zeichen', 'Zeichen und Fundstücke'], ['sonstiges', 'Sonstiges']];
  var MUENZEN = [
    ['pm', 'Highlord', 'Highlords', '#9aa3ab', '#d9dee2'],
    ['ga', 'Goldadmiral', 'Goldadmirale', '#a67c1a', '#e8c766'],
    ['em', 'Bright Ship', 'Bright Ships', '#8f8450', '#d6cb8e'],
    ['sm', 'Silber', 'Silber', '#7d8085', '#cfd2d6'],
    ['km', 'Common', 'Common', '#8a4b2a', '#d49a6a']
  ];
  // Alles wird in Common gerechnet (Regelwerk 7.5): 1 Highlord = 10 Goldadmirale = 20 Bright Ships = 100 Silber = 1000 Common
  var KM = { pm: 1000, ga: 100, em: 50, sm: 10, km: 1 };
  var ORD = ['pm', 'ga', 'em', 'sm', 'km'];
  var KURZ = { pm: 'PM', ga: 'GA', em: 'EM', sm: 'SM', km: 'KM' };
  var INF = 1e9, MAXW = 11;

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function kg(n) { return String(Math.round(n * 10) / 10).replace('.', ',') + ' kg'; }
  function ikon(name, gr) { return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>'; }
  function artVon(a) { return DINGART[a] || DINGART.sonstiges; }
  function anzahlVon(d) { return d.anzahl == null ? 1 : Math.max(0, Math.floor(zahl(d.anzahl, 1))); }
  function genitiv(n) { return /[sßxzSXZ]$/.test(n) ? n + '’' : n + 's'; }
  function grenzen(t) {
    if (!t || !t.staerke) return null;
    var s = zahl(t.staerke) * (zahl(t.faktor, 1) || 1);
    return [s * 2.5, s * 5, s * 7.5];
  }
  function lastStufe(w, g) {
    if (!g) return '';
    return w > g[2] ? 'zu schwer' : w > g[1] ? 'schwer belastet' : w > g[0] ? 'belastet' : 'unbelastet';
  }

  // Ein Preis als Münzen {ga:1, sm:5}, als Text „1 GA 5 SM“ oder als Zahl (Goldadmirale) → Common
  function wert(g) {
    if (g == null || g === '') return 0;
    if (typeof g === 'number') return Math.round(g * 100);
    var s = 0;
    if (typeof g === 'string') {
      var m, re = /(\d+(?:[.,]\d+)?)\s*(pm|ga|em|sm|km)\b/gi;
      while ((m = re.exec(g))) s += parseFloat(m[1].replace(',', '.')) * KM[m[2].toLowerCase()];
      return Math.round(s);
    }
    ORD.forEach(function (k) { s += zahl(g[k]) * KM[k]; });
    return Math.round(s);
  }
  // Common → „1 GA, 2 SM, 5 KM“ (Goldadmiral, Silber, Common, wie in der Statuszeile)
  function betrag(v) {
    v = Math.max(0, Math.round(v));
    var t = [], ga = Math.floor(v / 100), sm = Math.floor((v % 100) / 10), km = v % 10;
    if (ga) t.push(ga + ' GA');
    if (sm) t.push(sm + ' SM');
    if (km) t.push(km + ' KM');
    return t.join(', ');
  }
  function muenzen(m) { // Münzbestand {ga:2, sm:1} → „2 GA, 1 SM“
    var t = [];
    ORD.forEach(function (k) { if (zahl(m[k]) > 0) t.push(zahl(m[k]) + ' ' + KURZ[k]); });
    return t.join(', ');
  }
  function summe(m) { var s = 0; ORD.forEach(function (k) { s += zahl(m && m[k]) * KM[k]; }); return s; }
  function bestand(m) { var r = {}; ORD.forEach(function (k) { var n = Math.max(0, Math.floor(zahl(m && m[k]))); if (n) r[k] = n; }); return r; }
  function verrechne(a, b, f) { var r = {}; ORD.forEach(function (k) { var n = zahl(a[k]) + f * zahl(b[k]); if (n) r[k] = n; }); return r; }
  function leer(m) { return !summe(m); }

  /* ---------- Wechselgeld ---------- */
  // Kleinste Münzzahl für jede Summe bis S aus einem begrenzten Bestand (beschränkter Rucksack)
  function zerlege(b, S) {
    var best = [], s, j;
    for (s = 0; s <= S; s++) best.push(s ? INF : 0);
    var wahl = [];
    ORD.forEach(function (k) {
      var d = KM[k], c = Math.min(Math.floor(zahl(b[k])), Math.floor(S / d)), neu = best.slice(), w = [];
      for (s = 0; s <= S; s++) w.push(0);
      if (c > 0) for (s = d; s <= S; s++) for (j = 1; j <= c && j * d <= s; j++) {
        var x = best[s - j * d];
        if (x < INF && x + j < neu[s]) { neu[s] = x + j; w[s] = j; }
      }
      wahl.push(w); best = neu;
    });
    return { best: best, wahl: wahl };
  }
  function nimm(z, s) {
    var r = {};
    for (var i = ORD.length - 1; i >= 0; i--) { var j = z.wahl[i][s]; if (j) { r[ORD[i]] = j; s -= j * KM[ORD[i]]; } }
    return r;
  }
  // Der Zahler legt P auf, der Empfänger gibt C zurück, P − C = D. Wer genau zahlen kann, zahlt genau;
  // sonst das kleinste P, zu dem es Wechselgeld gibt. fehlt: was dem Zahler fehlt; uebrig: was keiner wechseln kann.
  function ausgleich(zahler, empfaenger, D) {
    var r = { P: {}, C: {}, fehlt: 0, uebrig: 0 };
    zahler = bestand(zahler); empfaenger = bestand(empfaenger);
    if (D <= 0) return r;
    var tot = summe(zahler);
    if (tot < D) { r.P = zahler; r.fehlt = D - tot; return r; }
    var maxd = 0, s, c;
    ORD.forEach(function (k) { if (zahler[k]) maxd = Math.max(maxd, KM[k]); });
    var S = Math.min(tot, D + maxd), a = zerlege(zahler, S), b = zerlege(empfaenger, S - D);
    for (s = D; s <= S; s++) if (a.best[s] < INF && b.best[s - D] < INF) { r.P = nimm(a, s); r.C = nimm(b, s - D); return r; }
    for (s = D; s <= S; s++) if (a.best[s] < INF) {
      for (c = s - D; c >= 0; c--) if (b.best[c] < INF) { r.P = nimm(a, s); r.C = nimm(b, c); r.uebrig = s - D - c; return r; }
    }
    return r;
  }
  // Ein Händler zahlt nie zu viel: Kann er nicht genau zahlen, zahlt er, was er genau hat, und bleibt den Rest schuldig.
  function haendlerZahlt(kasse, beutel, D) {
    var r = ausgleich(kasse, beutel, D);
    if (!r.uebrig) return r;
    var k = bestand(kasse), a = zerlege(k, D);
    for (var s = D; s >= 0; s--) if (a.best[s] < INF) return { P: nimm(a, s), C: {}, fehlt: D - s, uebrig: 0 };
    return { P: {}, C: {}, fehlt: D, uebrig: 0 };
  }

  /* ---------- Daten ---------- */
  function vorbereiten(D) {
    var h = D.haendler || {}, G = D.gepaeck || {};
    var H = {
      nr: D.nr, ort: D.ort || h.ort || '', stand: D.stand || '', hinweis: D.hinweis || '',
      name: h.name || 'Händler', kurz: h.kurz || h.name || 'Händler', art: h.art || '', glossar: h.glossar || '',
      gefeilscht: !!h.gefeilscht, kasse: bestand(h.kasse), beutel: bestand(G.geld),
      waren: [], dinge: [], traeger: [], figurIndex: -1
    };
    (h.waren || []).forEach(function (w, i) {
      if (!w || !w.name) return;
      H.waren.push({ id: 'w' + i, name: w.name, art: DINGART[w.art] ? w.art : 'sonstiges', preis: wert(w.preis),
        anzahl: w.anzahl == null ? Infinity : anzahlVon(w), kg: zahl(w.kg), notiz: w.notiz || '' });
    });
    (G.traeger || []).forEach(function (t) {
      if (!t || !t.name || t.art === 'lager') return;
      var ti = H.traeger.length, w = 0;
      (t.dinge || []).forEach(function (d) { if (d && d.name) w += zahl(d.kg) * anzahlVon(d); });
      H.traeger.push({ name: t.name, art: t.art, g: grenzen(t), last: w });
      if (t.art === 'figur' && H.figurIndex < 0) H.figurIndex = ti;
      (t.dinge || []).forEach(function (d, di) {
        if (!d || !d.name || !anzahlVon(d)) return;
        H.dinge.push({ id: 'd' + ti + '-' + di, name: d.name, art: DINGART[d.art] ? d.art : 'sonstiges', ti: ti,
          ankauf: d.ankauf == null ? null : wert(d.ankauf), anzahl: anzahlVon(d), kg: zahl(d.kg), notiz: d.ankaufNotiz || '' });
      });
    });
    if (H.figurIndex < 0 && H.traeger.length) H.figurIndex = 0;
    return H;
  }

  /* ---------- Rechnen ---------- */
  function rechne(H, korb) {
    var r = { kauft: [], verkauft: [], Lw: 0, Rw: 0, kgDazu: 0, kgWeg: 0, links: {}, rechts: {}, fehlt: 0, schuldig: 0, uebrig: 0 };
    H.waren.forEach(function (w) {
      var n = korb[w.id] || 0;
      if (!n) return;
      r.kauft.push({ x: w, n: n }); r.Rw += w.preis * n; r.kgDazu += w.kg * n;
    });
    H.dinge.forEach(function (d) {
      var n = korb[d.id] || 0;
      if (!n) return;
      r.verkauft.push({ x: d, n: n }); r.Lw += d.ankauf * n;
      if (d.ti === H.figurIndex) r.kgWeg += d.kg * n;
    });
    r.D = r.Rw - r.Lw;
    var a;
    if (r.D > 0) { a = ausgleich(H.beutel, H.kasse, r.D); r.links = a.P; r.rechts = a.C; r.fehlt = a.fehlt; r.uebrig = a.uebrig; }
    else if (r.D < 0) { a = haendlerZahlt(H.kasse, H.beutel, -r.D); r.rechts = a.P; r.links = a.C; r.schuldig = a.fehlt; }
    r.L = r.Lw + summe(r.links); r.R = r.Rw + summe(r.rechts);
    r.beutel = verrechne(verrechne(H.beutel, r.links, -1), r.rechts, 1);
    r.kasse = verrechne(verrechne(H.kasse, r.links, 1), r.rechts, -1);
    var t = H.traeger[H.figurIndex];
    r.last0 = t ? t.last : 0; r.last1 = r.last0 + r.kgDazu - r.kgWeg; r.g = t ? t.g : null;
    r.leer = !r.kauft.length && !r.verkauft.length;
    r.imLot = !r.leer && r.L === r.R;
    return r;
  }
  function posten(liste) {
    return liste.map(function (p) { return (p.n > 1 ? p.n + ' × ' : '') + p.x.name + ' (' + (betrag(((p.x.preis != null ? p.x.preis : p.x.ankauf) || 0) * p.n) || 'umsonst') + ')'; }).join(', ');
  }
  function zeileHandschlag(H, r) {
    var t = ['Handel #' + (H.nr != null ? H.nr : '?'), 'bei ' + H.kurz + (H.ort ? ', ' + H.ort : '')];
    if (r.kauft.length) t.push('kauft ' + posten(r.kauft));
    if (r.verkauft.length) t.push('verkauft ' + posten(r.verkauft));
    if (r.D > 0) { t.push('zahlt ' + muenzen(r.links)); if (!leer(r.rechts)) t.push('bekommt ' + muenzen(r.rechts) + ' zurück'); }
    else if (r.D < 0) { if (!leer(r.rechts)) t.push('bekommt ' + muenzen(r.rechts)); if (!leer(r.links)) t.push('gibt ' + muenzen(r.links) + ' zurück'); }
    else t.push('Tausch ohne Münzen');
    if (r.uebrig) t.push(betrag(r.uebrig) + ' bleiben bei ' + H.kurz + ' (kein Wechselgeld)');
    if (r.schuldig) t.push(H.kurz + ' bleibt ' + betrag(r.schuldig) + ' schuldig');
    t.push('Beutel danach ' + (muenzen(r.beutel) || 'leer'));
    if (r.g || r.kgDazu || r.kgWeg) t.push('trägt danach ' + kg(r.last1) + (r.g ? ' (' + lastStufe(r.last1, r.g) + ')' : ''));
    return t.join(' · ');
  }
  function zeileFeilschen(H, r) {
    var t = [];
    if (r.kauft.length) t.push('kauft ' + posten(r.kauft));
    if (r.verkauft.length) t.push('verkauft ' + posten(r.verkauft));
    return 'Handel #' + (H.nr != null ? H.nr : '?') + ' · feilscht bei ' + H.kurz + (H.ort ? ', ' + H.ort : '') + ' · Korb: ' + t.join('; ') +
      ' · Wert ' + (betrag(r.Rw) || 'nichts') + ' gegen ' + (betrag(r.Lw) || 'nichts');
  }

  /* ---------- Zeichnen ---------- */
  function muenzenSvg(art, n, w) {
    var m = MUENZEN.filter(function (x) { return x[0] === art; })[0], k = Math.max(1, Math.min(6, Math.ceil(Math.log(n + 1) / Math.log(2.2)))), s = '';
    for (var i = 0; i < k; i++) s += '<ellipse cx="17" cy="' + (30 - i * 4.2) + '" rx="13" ry="5" fill="' + m[4] + '" stroke="' + m[3] + '" stroke-width="1.4"/>';
    s += '<ellipse cx="17" cy="' + (30 - (k - 1) * 4.2) + '" rx="8" ry="2.6" fill="none" stroke="' + m[3] + '" stroke-width="1"/>';
    return '<svg viewBox="0 0 34 38" width="' + (w || 30) + '" height="' + Math.round((w || 30) * 38 / 34) + '" aria-hidden="true">' + s + '</svg>';
  }
  function beutelHtml(m, leerText) {
    var h = '', da = MUENZEN.filter(function (x) { return zahl(m[x[0]]) > 0; });
    if (!da.length) return '<p class="hdLeer">' + esc(leerText || 'leer') + '</p>';
    da.forEach(function (x) { var n = zahl(m[x[0]]); h += '<span class="hdM">' + muenzenSvg(x[0], n, 24) + '<span><b>' + n + '</b> ' + esc(n === 1 ? x[1] : x[2]) + '</span></span>'; });
    return h;
  }
  function geruest(H) {
    var h = '<div class="hdKopf"><p class="hdT">Bei ' + esc(H.name) + '</p><p class="hdS">' + esc([H.art, H.ort].filter(Boolean).join(' in ')) +
      (H.stand ? (H.art || H.ort ? ' · ' : '') + esc(H.stand) : '') + '</p>' + (H.hinweis ? '<p class="hdKl">' + esc(H.hinweis) + '</p>' : '') + '</div>';
    h += '<div class="hdWaage" aria-hidden="true"><svg class="hdSvg" height="184"></svg>' +
      '<div class="hdSchale" data-seite="l"><div class="hdLade"></div><div class="hdTief"></div><p class="hdWert"></p></div>' +
      '<div class="hdSchale" data-seite="r"><div class="hdLade"></div><div class="hdTief"></div><p class="hdWert"></p></div></div>';
    h += '<div class="hdSum" aria-live="polite"></div>';
    h += '<div class="hdKnoepfe"><button type="button" class="hdK hdHaupt" data-k="hand">Handschlag ↗</button>' +
      (H.gefeilscht ? '' : '<button type="button" class="hdK" data-k="feilsch">Feilschen ↗</button>') +
      '<button type="button" class="hdK" data-k="leer">Waage leeren</button></div><p class="hdFehler" hidden></p>';
    h += '<div class="hdSpalten"><section class="hdBlock" aria-label="' + esc(genitiv(H.kurz)) + ' Auslage"><p class="hdH">' + ikon('building-store', 18) + esc(genitiv(H.kurz)) + ' Auslage</p>' +
      '<div class="hdListe" data-liste="w"></div><p class="hdG">' + esc(genitiv(H.kurz)) + ' Kasse</p><div class="hdMz" data-mz="kasse"></div></section>' +
      '<section class="hdBlock" aria-label="Dein Gepäck"><p class="hdH">' + ikon('backpack', 18) + 'Dein Gepäck</p>' +
      '<div class="hdListe" data-liste="d"></div><p class="hdG">Dein Beutel</p><div class="hdMz" data-mz="beutel"></div></section></div>';
    if (H.glossar) h += '<button type="button" class="hdK hdKlein" data-glossar="' + esc(H.glossar) + '">Glossar ' + esc(H.glossar) + ' ↗</button>';
    return h;
  }
  function zeilen(H, korb, typ) {
    var liste = typ === 'w' ? H.waren : H.dinge.filter(function (d) { return d.ankauf != null; });
    var h = '', mehrereTraeger = typ === 'd' && H.traeger.length > 1;
    if (!liste.length) h += '<p class="hdLeer">' + (typ === 'w' ? 'Heute liegt nichts aus.' : esc(H.kurz) + ' kauft nichts von dem, was du dabeihast.') + '</p>';
    GRUPPEN.forEach(function (gr) {
      var ds = liste.filter(function (x) { return artVon(x.art)[1] === gr[0]; });
      if (!ds.length) return;
      h += '<p class="hdG">' + gr[1] + '</p><ul class="hdL">';
      ds.forEach(function (x) {
        var frei = x.anzahl - (korb[x.id] || 0), preis = typ === 'w' ? x.preis : x.ankauf, aus = frei <= 0;
        var menge = typ === 'w' ? (x.anzahl === Infinity ? '' : ' <i class="hdDa">· ' + (aus ? 'alles auf der Waage' : frei + ' da') + '</i>') : '';
        var bei = mehrereTraeger && H.traeger[x.ti] && H.traeger[x.ti].art !== 'figur' ? ' <i class="hdDa">· bei ' + esc(H.traeger[x.ti].name) + '</i>' : '';
        h += '<li><button type="button" class="hdZ" data-q="' + x.id + '"' + (aus ? ' aria-disabled="true"' : '') +
          ' aria-label="' + esc(x.name + ', ' + (betrag(preis) || 'umsonst') + (typ === 'w' ? ', auf die Waage legen' : ', anbieten')) + '">' +
          ikon(artVon(x.art)[0], 17) + '<span class="hdN">' + (typ === 'd' && x.anzahl > 1 ? '<b>' + Math.max(0, frei) + '</b> ' : '') + esc(x.name) + menge + bei +
          (x.notiz ? '<span class="hdNz">' + esc(x.notiz) + '</span>' : '') + '</span><span class="hdF"></span><span class="hdP">' + (betrag(preis) || 'umsonst') + '</span></button></li>';
      });
      h += '</ul>';
    });
    if (typ === 'd') {
      var nein = H.dinge.filter(function (d) { return d.ankauf == null; });
      if (nein.length) {
        h += '<button type="button" class="hdK hdKlein" data-k="nein" aria-expanded="false">kauft ' + esc(H.kurz) + ' nicht (' + nein.length + ')</button><ul class="hdL hdNein" hidden>';
        nein.forEach(function (d) { h += '<li>' + ikon(artVon(d.art)[0], 16) + '<span>' + (d.anzahl > 1 ? d.anzahl + ' ' : '') + esc(d.name) + '</span></li>'; });
        h += '</ul>';
      }
    }
    return h;
  }
  function ladung(H, korb, r, seite, mitMuenzen, neu) {
    var h = '', liste = seite === 'r' ? r.kauft : r.verkauft;
    liste.forEach(function (p) {
      h += '<button type="button" class="hdC" data-c="' + p.x.id + '" title="' + esc((p.n > 1 ? p.n + ' × ' : '') + p.x.name) + '" aria-label="' +
        esc((p.n > 1 ? p.n + ' × ' : '') + p.x.name + ', zurücknehmen') + '">' + ikon(artVon(p.x.art)[0], 16) + (p.n > 1 ? '<b>' + p.n + '</b>' : '') + '</button>';
    });
    if (mitMuenzen) {
      var m = seite === 'r' ? r.rechts : r.links;
      ORD.forEach(function (k) {
        if (!m[k]) return;
        h += '<span class="hdMs' + (neu ? ' hdNeu' : '') + '" title="' + m[k] + ' ' + KURZ[k] + '">' + muenzenSvg(k, m[k], 22) + '<small>' + m[k] + '</small></span>';
      });
    }
    return h;
  }
  function summeHtml(H, r) {
    var t = [];
    if (r.leer) return '<p class="hdKl">Leg Ware auf die Waage: antippen oder auf eine Schale ziehen.</p>';
    if (r.D > 0) {
      if (r.fehlt) t.push('<p class="hdWarn">Dein Beutel reicht nicht: Es fehlen ' + betrag(r.fehlt) + '.</p>');
      else t.push('<p>Du zahlst <b>' + muenzen(r.links) + '</b>' + (!leer(r.rechts) ? ' · ' + esc(H.kurz) + ' gibt <b>' + muenzen(r.rechts) + '</b> zurück' : '') + '</p>');
      if (r.uebrig) t.push('<p class="hdWarn">' + esc(H.kurz) + ' kann nicht wechseln: ' + betrag(r.uebrig) + ' bleiben bei ' + esc(H.kurz) + '.</p>');
    } else if (r.D < 0) {
      if (!leer(r.rechts)) t.push('<p>' + esc(H.kurz) + ' zahlt dir <b>' + muenzen(r.rechts) + '</b>' + (!leer(r.links) ? ' · du gibst <b>' + muenzen(r.links) + '</b> zurück' : '') + '</p>');
      if (r.schuldig) t.push('<p class="hdWarn">' + esc(genitiv(H.kurz)) + ' Kasse reicht nicht: ' + esc(H.kurz) + ' bliebe dir ' + betrag(r.schuldig) + ' schuldig. Nimm Ware dazu oder lass dir einen Schuldschein geben.</p>');
    } else t.push('<p>Ware gegen Ware: Das geht glatt auf.</p>');
    if (!r.fehlt) t.push('<p class="hdKl">Beutel danach: ' + (muenzen(r.beutel) || 'leer') + (r.g || r.kgDazu || r.kgWeg ? ' · du trägst ' + kg(r.last1) + (r.g ? ', ' + lastStufe(r.last1, r.g) : '') : '') + '</p>');
    if (r.g && r.last1 > r.g[0] && r.last1 > r.last0) t.push('<p class="hdWarn">Über ' + Math.round(r.g[0]) + ' kg bist du belastet' + (r.last1 > r.g[1] ? ', über ' + Math.round(r.g[1]) + ' kg schwer belastet' : '') + '.</p>');
    return t.join('');
  }

  var CSS = [
    '.hd{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--matt:#8f806c;--rot:#8e3b22;--gruen:#56662f;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);--ms:#c9a24a;--ms2:#6e5212;',
    'position:relative;background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .hd{--pg:#d8c9a3}@media (prefers-color-scheme:dark){:root:not([data-mode]) .hd{--pg:#d8c9a3}}',
    '.hd p{margin:0}.hd [hidden]{display:none!important}.hd b{font-weight:600}',
    '.hdIn{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:12px}',
    '.hdT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.hdS,.hdKl,.hdDa{font-style:italic;color:var(--ink2)}.hdS{font-size:17px}.hdKl{font-size:15px}.hdDa{font-size:15px}',
    '.hdWaage{position:relative;height:184px;margin:0 -10px;user-select:none;-webkit-user-select:none}',
    '.hdSvg{position:absolute;left:0;top:0;overflow:visible}',
    '.hdSvg text{font-family:"EB Garamond",Georgia,serif;font-style:italic;font-size:15px;fill:var(--ink2)}',
    '.hdSchale{position:absolute;display:flex;flex-direction:column;align-items:center;border-radius:10px}',
    '.hdLade{width:100%;height:58px;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-content:flex-start;align-items:flex-end;gap:4px 3px;padding:0 8px;box-sizing:border-box;overflow:visible}',
    '.hdTief{height:12px}.hdWert{font-size:15px;font-style:italic;white-space:nowrap;margin-top:1px!important;color:var(--ink2)}',
    '.hdZiel .hdLade{outline:2px dashed var(--rot);outline-offset:2px;border-radius:8px}',
    '.hd button.hdC{all:unset;position:relative;box-sizing:border-box;width:28px;height:26px;display:inline-flex;align-items:center;justify-content:center;background:#f7eedb;border:1px solid var(--rahmen);border-radius:6px;cursor:grab;color:var(--ink);touch-action:manipulation;-webkit-touch-callout:none}',
    '.hd button.hdC b{position:absolute;right:-6px;top:-8px;font-size:12px;font-weight:600;line-height:15px;min-width:15px;text-align:center;background:var(--ink);color:#f7eedb;border-radius:8px;padding:0 3px;box-sizing:border-box}',
    '.hdMs{display:inline-flex;align-items:flex-end;gap:1px}.hdMs small{font-size:12px;line-height:1;margin-bottom:2px}',
    '.hdNeu{animation:hdFall .38s cubic-bezier(.3,1.4,.6,1) both}@keyframes hdFall{from{transform:translateY(-22px);opacity:0}to{transform:none;opacity:1}}',
    '.hdPop{animation:hdPop .28s ease-out both}@keyframes hdPop{from{transform:scale(.4)}to{transform:none}}',
    '.hdSum{display:flex;flex-direction:column;gap:3px;min-height:48px;font-size:17px}.hdWarn{color:var(--rot);font-size:15px}',
    '.hdKnoepfe{display:flex;flex-wrap:wrap;gap:8px}',
    '.hd .hdK{all:unset;cursor:pointer;box-sizing:border-box;font-family:inherit;font-size:16px;line-height:1.3;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:5px 12px;text-align:center}',
    '.hd .hdK:hover{background:rgba(59,48,40,.07)}.hd .hdK:focus-visible,.hd button.hdZ:focus-visible,.hd button.hdC:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.hd .hdK.hdHaupt{background:var(--ink);color:#f7eedb;border-color:var(--ink)}.hd .hdK.hdHaupt:hover{background:#2b231c}',
    '.hd .hdK.hdKlein{font-size:15px;padding:2px 10px;align-self:flex-start}',
    '.hdFehler{color:var(--rot);font-size:15px}',
    '.hdSpalten{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;border-top:1.5px solid var(--rahmen);padding-top:12px}',
    '@media (min-width:600px){.hdSpalten{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px}}',
    '.hdBlock{display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.hdH{display:flex;align-items:center;gap:7px;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:20px}',
    '.hdG{font-style:italic;font-size:15px;color:var(--rot);margin-top:6px!important}',
    '.hdL{list-style:none;margin:0;padding:0}',
    '.hd button.hdZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:baseline;gap:8px;padding:3px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.4;touch-action:manipulation;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}',
    '.hd button.hdZ:hover{background:rgba(59,48,40,.07)}',
    '.hd button.hdZ[aria-disabled="true"]{color:var(--matt);cursor:default}.hd button.hdZ[aria-disabled="true"]:hover{background:none}',
    '.hdZ .ti{flex-shrink:0;align-self:center;color:var(--ink2)}',
    '.hdN{min-width:0}.hdNz{display:block;font-style:italic;font-size:15px;color:var(--ink2);line-height:1.3}',
    '.hdF{flex:1;min-width:14px;border-bottom:1.5px dotted var(--linie);transform:translateY(-4px)}',
    '.hdP{white-space:nowrap;font-size:16px}',
    '.hdNein li{display:flex;align-items:center;gap:8px;padding:2px 4px;color:var(--matt);font-size:16px}',
    '.hdMz{display:flex;flex-wrap:wrap;gap:4px 16px}.hdDanach{flex-basis:100%}.hdM{display:inline-flex;align-items:flex-end;gap:5px;font-size:16px}',
    '.hdLeer{font-style:italic;color:var(--ink2);font-size:15px}',
    '.hdGeist{position:absolute;z-index:5;pointer-events:none;display:flex;align-items:center;gap:6px;background:#f7eedb;border:1px solid var(--ink);border-radius:7px;padding:3px 8px;font-size:15px;color:var(--ink);white-space:nowrap}',
    '.hdFlug{transition:transform .34s cubic-bezier(.5,0,.6,1),opacity .34s}',
    '.hdFertig .hdZ,.hdFertig .hdC{pointer-events:none}.hdFertig .hdKnoepfe{display:none}',
    '@media (prefers-reduced-motion:reduce){.hdNeu,.hdPop{animation:none}.hdFlug{transition:none}}'
  ].join('');

  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  /* ---------- Die Waage ---------- */
  function geo(W) {
    return { W: W, cx: W / 2, py: 40, half: Math.min(W * 0.31, 175), pw: Math.min(W * 0.33, 168), rim: 74, H: 184 };
  }
  function waageSvg(svg) {
    svg.innerHTML = '<text class="hdTl" x="10" y="18">du gibst</text><text class="hdTr" y="18" text-anchor="end"></text>' +
      '<path class="hdFuss" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.4"/><rect class="hdPfosten" width="8" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.2"/>' +
      '<path class="hdSkala" fill="none" stroke="var(--ms2)" stroke-width="1.2"/>' +
      '<path class="hdKetteL" fill="none" stroke="var(--ms2)" stroke-width="1.1" stroke-dasharray="2.5 1.5"/><path class="hdKetteR" fill="none" stroke="var(--ms2)" stroke-width="1.1" stroke-dasharray="2.5 1.5"/>' +
      '<path class="hdSchaleL" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.4"/><path class="hdSchaleR" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.4"/>' +
      '<g class="hdBalken"><path class="hdStab" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.3"/>' +
      '<path class="hdZunge" d="M0 0V-27M-3.5 -21L0 -29L3.5 -21" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>' +
      '<circle class="hdHakenL" r="3.2" fill="var(--pg)" stroke="var(--ms2)" stroke-width="1.3"/><circle class="hdHakenR" r="3.2" fill="var(--pg)" stroke="var(--ms2)" stroke-width="1.3"/>' +
      '<circle r="6.5" fill="var(--ms)" stroke="var(--ms2)" stroke-width="1.4"/><circle r="2" fill="var(--ms2)"/></g>';
  }

  function einbauen(el, D) {
    schriftLaden();
    var H = vorbereiten(D), korb = {}, r = null, gezahlt = false, gesendet = false, zahlUhr = null;
    if (D.korb) {
      var k1 = D.korb.kauft || {}, k2 = D.korb.verkauft || {};
      H.waren.forEach(function (w) { if (k1[w.name]) korb[w.id] = Math.min(k1[w.name], w.anzahl); });
      H.dinge.forEach(function (d) { if (d.ankauf != null && k2[d.name] && !korb[d.id]) korb[d.id] = Math.min(k2[d.name], d.anzahl); });
    }
    el.className = 'hd';
    el.innerHTML = '<style>' + CSS + '</style><div class="hdIn">' + geruest(H) + '</div>';
    var $ = function (s) { return el.querySelector(s); };
    var waage = $('.hdWaage'), svg = $('.hdSvg'), sch = { l: $('.hdSchale[data-seite="l"]'), r: $('.hdSchale[data-seite="r"]') };
    var fehler = $('.hdFehler');
    waageSvg(svg);
    var S = {};
    ['hdTr', 'hdFuss', 'hdPfosten', 'hdSkala', 'hdKetteL', 'hdKetteR', 'hdSchaleL', 'hdSchaleR', 'hdBalken', 'hdStab', 'hdZunge', 'hdHakenL', 'hdHakenR']
      .forEach(function (c) { S[c] = svg.querySelector('.' + c); });
    S.hdTr.textContent = H.kurz + ' gibt';

    /* Stellung zeichnen */
    var winkel = 0, tempo = 0, ziel = 0, laeuft = false, vorschau = null;
    function stelle(a) {
      var g = geo(waage.clientWidth || 360), rad = a * Math.PI / 180, dx = g.half * Math.cos(rad), dy = g.half * Math.sin(rad);
      var E = { l: { x: g.cx - dx, y: g.py - dy }, r: { x: g.cx + dx, y: g.py + dy } };
      svg.setAttribute('width', g.W); svg.setAttribute('viewBox', '0 0 ' + g.W + ' ' + g.H);
      S.hdTr.setAttribute('x', g.W - 10);
      S.hdPfosten.setAttribute('x', g.cx - 4); S.hdPfosten.setAttribute('y', g.py); S.hdPfosten.setAttribute('height', g.H - 24 - g.py);
      S.hdFuss.setAttribute('d', 'M' + (g.cx - 46) + ' ' + (g.H - 4) + 'L' + (g.cx - 26) + ' ' + (g.H - 24) + 'H' + (g.cx + 26) + 'L' + (g.cx + 46) + ' ' + (g.H - 4) + 'Z');
      var sk = '', R0 = 34;
      [-10, -5, 0, 5, 10].forEach(function (t) {
        var q = t * Math.PI / 180, l = t ? 4 : 7;
        sk += 'M' + (g.cx + R0 * Math.sin(q)).toFixed(1) + ' ' + (g.py - R0 * Math.cos(q)).toFixed(1) + 'L' + (g.cx + (R0 + l) * Math.sin(q)).toFixed(1) + ' ' + (g.py - (R0 + l) * Math.cos(q)).toFixed(1);
      });
      var q1 = -13 * Math.PI / 180, q2 = 13 * Math.PI / 180;
      sk += 'M' + (g.cx + R0 * Math.sin(q1)).toFixed(1) + ' ' + (g.py - R0 * Math.cos(q1)).toFixed(1) + 'A' + R0 + ' ' + R0 + ' 0 0 1 ' + (g.cx + R0 * Math.sin(q2)).toFixed(1) + ' ' + (g.py - R0 * Math.cos(q2)).toFixed(1);
      S.hdSkala.setAttribute('d', sk);
      S.hdBalken.setAttribute('transform', 'translate(' + g.cx.toFixed(1) + ',' + g.py + ') rotate(' + a.toFixed(2) + ')');
      S.hdStab.setAttribute('d', 'M' + (-g.half) + ' -2.4L0 -5.5L' + g.half + ' -2.4V2.4L0 5.5L' + (-g.half) + ' 2.4Z');
      S.hdHakenL.setAttribute('cx', -g.half); S.hdHakenR.setAttribute('cx', g.half);
      S.hdZunge.setAttribute('stroke', r && r.imLot && gezahlt ? 'var(--gruen)' : 'var(--ink)');
      ['l', 'r'].forEach(function (s) {
        var e = E[s], rim = e.y + g.rim, x0 = e.x - g.pw / 2, x1 = e.x + g.pw / 2, K = s === 'l' ? S.hdKetteL : S.hdKetteR, P = s === 'l' ? S.hdSchaleL : S.hdSchaleR;
        K.setAttribute('d', 'M' + e.x.toFixed(1) + ' ' + (e.y + 3).toFixed(1) + 'L' + (x0 + 5).toFixed(1) + ' ' + rim.toFixed(1) + 'M' + e.x.toFixed(1) + ' ' + (e.y + 3).toFixed(1) + 'L' + (x1 - 5).toFixed(1) + ' ' + rim.toFixed(1));
        P.setAttribute('d', 'M' + x0.toFixed(1) + ' ' + rim.toFixed(1) + 'Q' + e.x.toFixed(1) + ' ' + (rim + 22).toFixed(1) + ' ' + x1.toFixed(1) + ' ' + rim.toFixed(1) + 'Z');
        sch[s].style.left = x0.toFixed(1) + 'px'; sch[s].style.top = (e.y + 12).toFixed(1) + 'px'; sch[s].style.width = g.pw.toFixed(1) + 'px';
      });
    }
    function zielwinkel() {
      if (!r) return 0;
      var L = r.Lw + (gezahlt ? summe(r.links) : 0), R = r.Rw + (gezahlt ? summe(r.rechts) : 0);
      if (vorschau) { if (vorschau.s === 'l') L += vorschau.w; else R += vorschau.w; }
      if (L === R) return 0;
      var t = (R - L) / Math.max(L, R);
      return (t < 0 ? -1 : 1) * Math.sqrt(Math.min(1, Math.abs(t))) * MAXW;
    }
    function schritt() {
      tempo += (ziel - winkel) * 0.085; tempo *= 0.8; winkel += tempo;
      if (Math.abs(ziel - winkel) < 0.02 && Math.abs(tempo) < 0.02) { winkel = ziel; tempo = 0; laeuft = false; }
      stelle(winkel);
      if (laeuft) requestAnimationFrame(schritt);
    }
    function wiege() {
      ziel = zielwinkel();
      if (ruhig || typeof requestAnimationFrame !== 'function') { winkel = ziel; stelle(winkel); return; }
      if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); }
    }

    /* Inhalt zeichnen */
    function schalen(neu) {
      sch.l.querySelector('.hdLade').innerHTML = ladung(H, korb, r, 'l', gezahlt, neu);
      sch.r.querySelector('.hdLade').innerHTML = ladung(H, korb, r, 'r', gezahlt, neu);
      sch.l.querySelector('.hdWert').textContent = betrag(gezahlt ? r.L : r.Lw) || '';
      sch.r.querySelector('.hdWert').textContent = betrag(gezahlt ? r.R : r.Rw) || '';
    }
    function alles(neuId) {
      r = rechne(H, korb);
      $('[data-liste="w"]').innerHTML = zeilen(H, korb, 'w');
      $('[data-liste="d"]').innerHTML = zeilen(H, korb, 'd');
      $('[data-mz="kasse"]').innerHTML = beutelHtml(H.kasse, 'leer') + (r.leer ? '' : '<p class="hdKl hdDanach">danach: ' + (muenzen(r.kasse) || 'leer') + '</p>');
      $('[data-mz="beutel"]').innerHTML = beutelHtml(H.beutel, 'leer') + (r.leer || r.fehlt ? '' : '<p class="hdKl hdDanach">danach: ' + (muenzen(r.beutel) || 'leer') + '</p>');
      $('.hdSum').innerHTML = summeHtml(H, r);
      schalen(false);
      if (neuId) { var c = el.querySelector('.hdC[data-c="' + neuId + '"]'); if (c && !ruhig) c.classList.add('hdPop'); }
      wiege();
    }
    function aenderung(neuId) {
      fehler.hidden = true;
      gezahlt = false; clearTimeout(zahlUhr);
      alles(neuId);
      zahlUhr = setTimeout(function () { gezahlt = true; schalen(true); wiege(); }, ruhig ? 0 : 650);
    }
    function frei(id) {
      var x = H.waren.concat(H.dinge).filter(function (y) { return y.id === id; })[0];
      if (!x) return null;
      return { x: x, n: x.anzahl - (korb[id] || 0), seite: id.charAt(0) === 'w' ? 'r' : 'l' };
    }
    function dazu(id) {
      var f = frei(id);
      if (!f || f.n <= 0 || (f.x.ankauf === null && f.seite === 'l')) return false;
      korb[id] = (korb[id] || 0) + 1; aenderung(id); return true;
    }
    function weg(id, alle) {
      if (!korb[id]) return;
      korb[id] = alle ? 0 : korb[id] - 1;
      if (!korb[id]) delete korb[id];
      aenderung();
    }

    /* Flug und Ziehen */
    function geist(x, html) {
      var g = document.createElement('div');
      g.className = 'hdGeist'; g.innerHTML = ikon(artVon(x.art)[0], 16) + '<span>' + esc(x.name) + '</span>';
      el.appendChild(g); return g;
    }
    function setze(g, cx, cy) { var rr = el.getBoundingClientRect(); g.style.left = (cx - rr.left - 16) + 'px'; g.style.top = (cy - rr.top - 16) + 'px'; }
    function fliege(vonEl, seite, x) {
      if (ruhig || !vonEl) return;
      var a = vonEl.getBoundingClientRect(), b = sch[seite].querySelector('.hdLade').getBoundingClientRect(), g = geist(x);
      setze(g, a.left + 24, a.top + a.height / 2);
      var dx = b.left + b.width / 2 - (a.left + 24), dy = b.top + b.height - 14 - (a.top + a.height / 2);
      g.classList.add('hdFlug');
      requestAnimationFrame(function () { requestAnimationFrame(function () { g.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.7)'; g.style.opacity = '0.2'; }); });
      setTimeout(function () { g.remove(); }, 380);
    }
    function ueber(cx, cy) {
      var t = null;
      ['l', 'r'].forEach(function (s) {
        var b = sch[s].getBoundingClientRect();
        if (cx > b.left - 18 && cx < b.right + 18 && cy > b.top - 30 && cy < b.bottom + 12) t = s;
      });
      return t;
    }
    var zug = null, klickWeg = false;
    function beginne(cx, cy) {
      var f = frei(zug.q);
      if (!f) { zug = null; return; }
      zug.aktiv = true; zug.f = f; zug.g = geist(f.x); setze(zug.g, cx, cy);
      if (navigator.vibrate && zug.touch) { try { navigator.vibrate(8); } catch (e) { /* egal */ } }
    }
    function bewege(cx, cy) {
      setze(zug.g, cx, cy);
      var s = ueber(cx, cy), passt = zug.ausSchale ? false : s === zug.f.seite;
      ['l', 'r'].forEach(function (k) { sch[k].classList.toggle('hdZiel', passt && k === s); });
      var vs = passt ? { s: s, w: zug.f.seite === 'r' ? zug.f.x.preis : zug.f.x.ankauf } : null;
      if (JSON.stringify(vs) !== JSON.stringify(vorschau)) { vorschau = vs; wiege(); }
    }
    function lasse(cx, cy) {
      var s = ueber(cx, cy), z = zug;
      sch.l.classList.remove('hdZiel'); sch.r.classList.remove('hdZiel');
      vorschau = null;
      if (z.g) z.g.remove();
      if (z.ausSchale) { if (s !== z.f.seite) weg(z.q, true); else wiege(); }
      else if (s === z.f.seite) { if (!dazu(z.q)) wiege(); }
      else wiege();
      klickWeg = true; setTimeout(function () { klickWeg = false; }, 60);
    }
    function abbrechen() { if (zug) { clearTimeout(zug.timer); if (zug.g) zug.g.remove(); } zug = null; vorschau = null; sch.l.classList.remove('hdZiel'); sch.r.classList.remove('hdZiel'); wiege(); }
    function quelle(t) {
      var q = t.closest ? t.closest('[data-q],[data-c]') : null;
      if (!q || q.getAttribute('aria-disabled') === 'true' || gesendet) return null;
      return { el: q, q: q.getAttribute('data-q') || q.getAttribute('data-c'), ausSchale: q.hasAttribute('data-c') };
    }
    el.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'touch' || ev.button) return;
      var q = quelle(ev.target);
      if (!q) return;
      zug = q; zug.x0 = ev.clientX; zug.y0 = ev.clientY; zug.aktiv = false;
    });
    document.addEventListener('pointermove', function (ev) {
      if (!zug || zug.touch || ev.pointerType === 'touch') return;
      if (!zug.aktiv && Math.abs(ev.clientX - zug.x0) + Math.abs(ev.clientY - zug.y0) > 6) beginne(ev.clientX, ev.clientY);
      if (zug && zug.aktiv) { ev.preventDefault(); bewege(ev.clientX, ev.clientY); }
    });
    document.addEventListener('pointerup', function (ev) {
      if (!zug || zug.touch || ev.pointerType === 'touch') return;
      if (zug.aktiv) lasse(ev.clientX, ev.clientY);
      zug = null;
    });
    el.addEventListener('touchstart', function (ev) {
      if (ev.touches.length > 1) { abbrechen(); return; }
      var q = quelle(ev.target);
      if (!q) return;
      var p = ev.touches[0];
      zug = q; zug.touch = true; zug.x0 = p.clientX; zug.y0 = p.clientY; zug.aktiv = false;
      zug.timer = setTimeout(function () { if (zug && !zug.aktiv) beginne(zug.x0, zug.y0); }, 220);
    }, { passive: true });
    el.addEventListener('touchmove', function (ev) {
      if (!zug || !zug.touch) return;
      var p = ev.touches[0];
      if (zug.aktiv) { ev.preventDefault(); bewege(p.clientX, p.clientY); }
      else if (Math.abs(p.clientX - zug.x0) + Math.abs(p.clientY - zug.y0) > 10) { clearTimeout(zug.timer); zug = null; }
    }, { passive: false });
    el.addEventListener('touchend', function (ev) {
      if (!zug || !zug.touch) return;
      clearTimeout(zug.timer);
      if (zug.aktiv) { ev.preventDefault(); var p = ev.changedTouches[0]; lasse(p.clientX, p.clientY); }
      zug = null;
    });
    el.addEventListener('touchcancel', abbrechen);

    /* Tippen und Knöpfe */
    function sag(t) { fehler.textContent = t; fehler.hidden = false; }
    el.addEventListener('click', function (ev) {
      if (klickWeg || gesendet) return;
      var t = ev.target, k = t.closest ? t.closest('[data-k]') : null;
      if (k) {
        var was = k.getAttribute('data-k');
        if (was === 'nein') {
          var ul = k.nextElementSibling, auf = k.getAttribute('aria-expanded') !== 'true';
          k.setAttribute('aria-expanded', String(auf)); if (ul) ul.hidden = !auf; return;
        }
        if (was === 'leer') { korb = {}; aenderung(); return; }
        if (r.leer) { sag('Leg erst etwas auf die Waage.'); return; }
        if (was === 'feilsch') { senden(zeileFeilschen(H, r)); return; }
        if (was === 'hand') {
          if (r.fehlt) { sag('Dein Beutel reicht nicht: Es fehlen ' + betrag(r.fehlt) + '. Nimm etwas herunter.'); return; }
          senden(zeileHandschlag(H, r)); return;
        }
      }
      var g = t.closest ? t.closest('[data-glossar]') : null;
      if (g) { if (typeof sendPrompt === 'function') sendPrompt('Glossar ' + g.getAttribute('data-glossar')); return; }
      var c = t.closest ? t.closest('[data-c]') : null;
      if (c) { weg(c.getAttribute('data-c'), false); return; }
      var q = t.closest ? t.closest('[data-q]') : null;
      if (q && q.getAttribute('aria-disabled') !== 'true') {
        var f = frei(q.getAttribute('data-q'));
        if (f && dazu(f.x.id)) fliege(el.querySelector('[data-q="' + f.x.id + '"]') || q, f.seite, f.x);
      }
    });
    function senden(zeile) {
      if (typeof sendPrompt === 'function') {
        gesendet = true; el.classList.add('hdFertig');
        $('.hdSum').insertAdjacentHTML('beforeend', '<p class="hdKl">Abgeschickt. Die Spielleitung erzählt, wie der Handel ausgeht.</p>');
        sendPrompt(zeile);
      } else sag('Schreib das in den Chat: ' + zeile);
    }

    if (typeof ResizeObserver === 'function') new ResizeObserver(function () { stelle(winkel); }).observe(waage);
    else window.addEventListener('resize', function () { stelle(winkel); });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-glossar]'), function (x) { x.remove(); });
    stelle(0);
    aenderung();
  }

  function start() {
    var el = document.getElementById('handel'), D = window.HANDEL;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Der Händlertisch ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { version: VERSION, wert: wert, betrag: betrag, muenzen: muenzen, ausgleich: ausgleich, haendlerZahlt: haendlerZahlt,
      vorbereiten: vorbereiten, rechne: rechne, zeileHandschlag: zeileHandschlag, zeileFeilschen: zeileFeilschen };
  } else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
