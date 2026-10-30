/*
 * Wegwart-Karte – Kampfkarte für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.2
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Kampfkarte: Keller des Siedehauses, Runde 2</h2>
 *   <div id="kampf">Kampfkarte lädt … Falls nicht, frag nach der Lage als Text.</div>
 *   <script>var KAMPF={nr:3, titel:'Keller des Siedehauses', runde:2, figur:'f', boden:[…], hoehe:[…], wesen:[…]}</script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/kampf.js';document.head.appendChild(s);</script>
 *
 * Raster: 36 × 12 Felder zu 1,5 m (Regelwerk 12.6), Spalten 1–36, Zeilen A–L. Die Karte zeigt nur, was die
 * Figur sieht. Seit 1.1 hat jedes Feld eine Höhenlage (`hoehe`, eine Ziffer je Feld, 1 = 1,5 m): Ebenen sind
 * getönt, Kanten tragen Schatten und Höhenschilder, Spielsteine über dem Boden eine Höhenmarke; Klettern kostet
 * je Ebene ein Feld extra, Treppen (`/`) nicht, Entfernungen zählen das größere Maß aus waagerecht und senkrecht.
 * Seit 1.2 (Stufe A der Vorbilder aus den Taktikspielen): die Waffen der Figur (`waffen`) zeichnen vom gewählten
 * Feld aus ein rotes Reichweitenquadrat, Gegner tragen `reichweite` und bedrohen Felder (gestrichelt, ein Tipp
 * auf den Gegner oder der Knopf „Gefahr“), der Weg warnt vor Gelegenheitsangriffen, eine Lagezeile nennt vor dem
 * Wurf Reichweite, Deckung, Vorteil und Nachteil mit Gründen (ohne SG und RK), eine Initiativleiste (`reihenfolge`)
 * zeigt, wer gehandelt hat und wer noch kommt, und der Kopf trägt Ziel, Uhren und Lage (`ziel`, `uhren`, `lage`).
 * Der Spieler zieht seine Figur und schickt den Zug als „Kampf #nr · …“ per sendPrompt an die Spielleitung.
 * Alle Felder stehen in der README (Abschnitt „Kampf“).
 */
(function () {
  'use strict';

  var VERSION = '1.2';
  var Z = 30;      // Kantenlänge eines Felds in Kartenpunkten
  var RAND = 26;   // Rand für die Beschriftung, auf allen vier Seiten
  var METER = 1.5; // ein Feld, auch eine Höhenstufe
  var ZEILEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var F = { tinte: '#3b3028', gold: '#b08d3a', rot: '#8e3b22', gruen: '#4d5b33', grau: '#76695a', braun: '#6b573f', wasser: '#3f6c84', seicht: '#7f9a8c', holz: '#8b6d45' };
  var HOEHEN_TON = ['', '#ebdfbd', '#e3d3a9', '#dbc795', '#d3bb82']; // Ebene 1 bis 4 (und darüber)

  // Was ein Zeichen im Boden bedeutet. kosten 0: nicht betretbar. stufe: Treppe oder Rampe, Ebenenwechsel ohne Klettern.
  var ARTEN = {
    '.': { name: 'Boden', kosten: 1 },
    '=': { name: 'Planken, Steg, Deck', kosten: 1 },
    '+': { name: 'Tür, Durchgang', kosten: 1 },
    '/': { name: 'Treppe, Rampe (eine Stufe hinauf ohne Klettern)', kosten: 1, stufe: true },
    '^': { name: 'erhöht (Ebene 1, alte Schreibweise)', kosten: 1, erhoeht: true },
    ':': { name: 'schwieriges Gelände (Geröll, Dickicht, Trümmer)', kosten: 2 },
    ',': { name: 'Schlamm, seichtes Wasser, Eis', kosten: 2 },
    '~': { name: 'tiefes Wasser (schwimmen)', kosten: 2, wasser: true },
    'o': { name: 'niedrige Deckung (Fass, Kiste, Mauerrest, Brustwehr): halbe Deckung, drüber ist schwer', kosten: 2, deckung: 'halbe' },
    'O': { name: 'hohe Deckung (Pfeiler, Baum, Karren): Dreiviertel-Deckung, nicht betretbar', kosten: 0, deckung: 'Dreiviertel-' },
    '#': { name: 'Wand, Fels', kosten: 0 },
    'x': { name: 'Hindernis, unpassierbar', kosten: 0 },
    '?': { name: 'nicht zu sehen', kosten: 1, unbekannt: true },
    ' ': { name: 'nicht zu sehen', kosten: 1, unbekannt: true }
  };
  var LEGENDE = [['.', 'Boden'], ['=', 'Planken, Deck'], ['+', 'Tür'], ['/', 'Treppe, Rampe'], [':', 'schwieriges Gelände'], [',', 'Schlamm, seicht, Eis'],
    ['~', 'tiefes Wasser'], ['o', 'halbe Deckung'], ['O', 'Dreiviertel-Deckung'], ['#', 'Wand'], ['x', 'Hindernis'], ['?', 'nicht zu sehen']];
  var ART_WESEN = { figur: F.tinte, gefolge: F.gruen, gegner: F.rot, npc: F.grau, tier: F.braun };
  var ART_NAME = { figur: 'die Figur', gefolge: 'Gefolge, Gefährte', gegner: 'Gegner', npc: 'Unbeteiligte', tier: 'Tier' };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function m(felder) { var v = felder * METER; return (Math.round(v * 2) / 2).toString().replace('.', ',') + ' m'; }
  function feldName(D, x, y) { return (D._ux + x - 1) + '/' + (ZEILEN[(D._uy + y - 2) % 26] || '?'); }

  function lies(D) {
    var sp = Math.max(1, Math.min(60, +D.spalten || 36)), ze = Math.max(1, Math.min(26, +D.zeilen || 12));
    var zeilen = Array.isArray(D.boden) ? D.boden : [];
    var hz = Array.isArray(D.hoehe) ? D.hoehe : null;
    var raster = [], hoehen = [], rampen = [];
    for (var y = 1; y <= ze; y++) {
      var z = String(zeilen[y - 1] == null ? '' : zeilen[y - 1]), r = [], h = [], rz = [];
      var hzz = hz ? String(hz[y - 1] == null ? '' : hz[y - 1]) : '';
      for (var x = 1; x <= sp; x++) {
        var c = zeilen.length ? (z[x - 1] == null ? '?' : z[x - 1]) : '.';
        c = ARTEN[c] ? c : '?';
        var hc = hzz[x - 1], hv = 0, ra = false;
        if (hc >= '0' && hc <= '9') hv = +hc;
        else if (hc >= 'a' && hc <= 'j') { hv = hc.charCodeAt(0) - 97; ra = true; }
        if (ARTEN[c].erhoeht && hv < 1) hv = 1;
        r.push(c); h.push(hv); rz.push(ra);
      }
      raster.push(r); hoehen.push(h); rampen.push(rz);
    }
    var u = Array.isArray(D.ursprung) ? D.ursprung : [1, 'A'];
    D._ux = Math.max(1, +u[0] || 1);
    D._uy = Math.max(1, ZEILEN.indexOf(String(u[1] || 'A').toUpperCase()) + 1 || 1);
    var wesen = (D.wesen || []).filter(function (w) { return w && w.name && isFinite(w.x) && isFinite(w.y); }).map(function (w, i) {
      var k = {}; Object.keys(w).forEach(function (s) { k[s] = w[s]; });
      k.x = +w.x; k.y = +w.y; k.groesse = Math.max(1, Math.min(4, +w.groesse || 1)); k._i = i;
      k.art = ART_WESEN[k.art] ? k.art : 'npc';
      if (!k.kurz) k.kurz = String(k.name).split(/[\s-]+/).filter(function (t) { return t && !/^(der|die|das|des|dem|den|ein|eine|eines|einer|von|vom|zur|zum|am|im|mit|aus|the|of)$/i.test(t); })
        .map(function (t) { return t[0] || ''; }).join('').toUpperCase().slice(0, 3) || '?';
      // seit 1.2: Reichweite in Feldern (Standard 1,5 m, ein Feld) und die Waffen der Figur
      k._r = felder(w.reichweite == null ? METER : w.reichweite);
      k.waffen = (Array.isArray(w.waffen) ? w.waffen : []).map(waffeInfo).filter(function (x) { return !!x; });
      return k;
    });
    var figur = null;
    wesen.forEach(function (w) { if (!figur && (w.id === D.figur || (!D.figur && w.art === 'figur'))) figur = w; });
    if (figur) figur.art = 'figur';
    return { sp: sp, ze: ze, raster: raster, hoehen: hoehen, rampen: rampen, wesen: wesen, figur: figur, ux: D._ux, uy: D._uy };
  }

  // Höhenlage eines Felds (0, wenn außerhalb) und eines Wesens (sein Ankerfeld)
  function hoehe(K, x, y) {
    if (!K || !K.hoehen || x < 1 || y < 1 || y > K.ze || x > K.sp) return 0;
    return K.hoehen[y - 1][x - 1] || 0;
  }
  function hoeheVon(K, w) { return w && isFinite(w.x) && isFinite(w.y) ? hoehe(K, w.x, w.y) : 0; }
  // Rampe oder Treppe: ein Schritt von einer Nachbarebene (eine Stufe hinauf oder hinab) kostet dort nichts extra
  function istStufe(K, x, y) {
    if (!K || x < 1 || y < 1 || y > K.ze || x > K.sp) return false;
    var a = ARTEN[K.raster[y - 1][x - 1]];
    return !!((a && a.stufe) || (K.rampen && K.rampen[y - 1][x - 1]));
  }
  // Was ein Schritt an Höhe bedeutet: klettern (Ebenen hinauf, zu bezahlen), sprung (Ebenen hinab ohne Treppe), sonst 0
  function schritt(K, fx, fy, x, y) {
    var dh = hoehe(K, x, y) - hoehe(K, fx, fy);
    if (!dh) return { klettern: 0, sprung: 0 };
    var sanft = Math.abs(dh) === 1 && (istStufe(K, fx, fy) || istStufe(K, x, y));
    if (dh > 0) return { klettern: sanft ? 0 : dh, sprung: 0 };
    return { klettern: 0, sprung: (sanft || dh === -1) ? 0 : -dh };
  }

  function belegt(K) {
    var b = {};
    K.wesen.forEach(function (w) {
      for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) b[(w.x + dx) + ',' + (w.y + dy)] = w;
    });
    return b;
  }

  // Dijkstra über das Raster: Kosten in Feldern, Diagonale zählt wie gerade (PHB). Hinauf kostet je Ebene ein Feld
  // extra (Klettern: jeder Meter hoch ein Meter extra), außer eine Stufe über Rampe oder Treppe; hinab kostet nichts.
  // Liefert Entfernung und Weg.
  function wege(K, von) {
    var sp = K.sp, ze = K.ze, b = belegt(K), dist = {}, vor = {}, offen = [];
    var schwimmt = !!(von.schwimmen);
    function kosten(fx, fy, x, y) {
      if (x < 1 || y < 1 || x > sp || y > ze) return 0;
      var a = ARTEN[K.raster[y - 1][x - 1]] || ARTEN['?'];
      var k = a.kosten;
      if (!k) return 0;
      if (a.wasser && schwimmt) k = 1;
      var w = b[x + ',' + y];
      if (w && w !== von) { if (w.art === 'gegner') return 0; if (w.art === 'tier' && !w.zahm) return 0; }
      k += schritt(K, fx, fy, x, y).klettern;
      return k;
    }
    var s = von.x + ',' + von.y;
    dist[s] = 0; offen.push([0, von.x, von.y]);
    while (offen.length) {
      offen.sort(function (p, q) { return p[0] - q[0]; });
      var e = offen.shift(), d = e[0], x = e[1], y = e[2];
      if (d > dist[x + ',' + y]) continue;
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        var nx = x + dx, ny = y + dy, k = kosten(x, y, nx, ny);
        if (!k) continue;
        var nd = d + k, key = nx + ',' + ny;
        if (dist[key] == null || nd < dist[key]) { dist[key] = nd; vor[key] = x + ',' + y; offen.push([nd, nx, ny]); }
      }
    }
    return { dist: dist, vor: vor, belegt: b };
  }
  function pfad(W, x, y) {
    var p = [], key = x + ',' + y;
    while (key) { var t = key.split(','); p.unshift([+t[0], +t[1]]); key = W.vor[key]; }
    return p;
  }
  // Was ein Weg an Höhe kostet: geklettert (Ebenen hinauf ohne Treppe) und der tiefste Sprung (zwei Ebenen oder mehr hinab ohne Treppe)
  function pfadHoehe(K, p) {
    var klettern = 0, sprung = 0;
    for (var i = 1; i < p.length; i++) {
      var a = p[i - 1], b = p[i], st = schritt(K, a[0], a[1], b[0], b[1]);
      klettern += st.klettern;
      sprung = Math.max(sprung, st.sprung);
    }
    return { klettern: klettern, sprung: sprung };
  }
  // Abstand Kante zu Kante in Feldern; mit K dreidimensional: das größere Maß aus waagerecht und senkrecht (PHB, Diagonale wie gerade)
  function abstand(a, b, K) {
    var best = Infinity;
    var ga = a.groesse || 1, gb = b.groesse || 1;
    for (var ax = 0; ax < ga; ax++) for (var ay = 0; ay < ga; ay++)
      for (var bx = 0; bx < gb; bx++) for (var by = 0; by < gb; by++)
        best = Math.min(best, Math.max(Math.abs(a.x + ax - b.x - bx), Math.abs(a.y + ay - b.y - by)));
    if (K) best = Math.max(best, Math.abs(hoeheVon(K, a) - hoeheVon(K, b)));
    return best;
  }
  function hoehenText(dh) { return (dh > 0 ? '+' : dh < 0 ? '−' : '') + m(Math.abs(dh)); }
  function feldNameK(K, x, y) { return ((K.ux || 1) + x - 1) + '/' + (ZEILEN[((K.uy || 1) + y - 2) % 26] || '?'); }
  function hochTief(dh) { return m(Math.abs(dh)) + (dh > 0 ? ' höher' : ' tiefer'); }
  function namen(liste) {
    var n = liste.map(function (w) { return w.name; });
    return n.length <= 1 ? n.join('') : n.slice(0, -1).join(', ') + ' und ' + n[n.length - 1];
  }

  /* ---------- Waffen, Reichweite, Gefahr und Deckung (seit 1.2) ---------- */
  // Meter in Felder: 1,5 m ist ein Feld; weniger zählt als ein Feld
  function felder(meter) { var v = +meter; return isFinite(v) && v > 0 ? Math.max(1, Math.round(v / METER)) : 1; }
  // Eine Waffe oder ein Angriffszauber der Figur: `reichweite` in Metern, eine Zahl (Nahkampf, oder Zauber ohne lange
  // Reichweite) oder [normal, lang] (Fernkampf). Mehr als 3 m zählt als Fernkampf (Gegner neben dir geben Nachteil).
  function waffeInfo(w) {
    if (!w || !w.name) return null;
    var rw = w.reichweite, norm, lang = 0;
    if (Array.isArray(rw)) { norm = felder(rw[0]); lang = rw[1] ? felder(rw[1]) : 0; } else norm = felder(rw == null ? METER : rw);
    if (lang && lang <= norm) lang = 0;
    return { name: String(w.name), bonus: isFinite(+w.bonus) && w.bonus !== '' && w.bonus != null ? +w.bonus : null, schaden: w.schaden ? String(w.schaden) : '',
      typ: w.typ ? String(w.typ) : '', r: norm, rl: lang, fern: !!lang || norm > 2, zauber: !!w.zauber };
  }
  function bonusText(b) { return b == null ? '' : (b >= 0 ? '+' : '−') + Math.abs(b); }
  function waffeText(wf) { return (wf.bonus != null ? ' ' + bonusText(wf.bonus) : '') + (wf.schaden ? ' · ' + wf.schaden : '') + (wf.typ ? ' ' + wf.typ : ''); }
  // Wer noch kämpfen kann: bewusstlos, tot, gelähmt oder versteinert bedroht niemanden und schlägt nicht zurück
  function kampffaehig(w) { return !/bewusstlos|ohnmächtig|tot\b|gelähmt|betäubt|versteinert|gefesselt/.test(String(w.zustand || '').toLowerCase()); }
  function liegt(w) { return /boden|liegt|gestürzt/.test(String(w && w.zustand || '').toLowerCase()); }
  function gegnerAktiv(K) { return K.wesen.filter(function (w) { return w.art === 'gegner' && kampffaehig(w); }); }
  // Bedroht ein Wesen das Feld? Innerhalb seiner Reichweite, dreidimensional (PHB), die eigenen Felder nicht
  function bedroht(K, w, x, y) {
    if (!w || !isFinite(w.x) || !isFinite(w.y)) return false;
    for (var dx = 0; dx < w.groesse; dx++) for (var dy = 0; dy < w.groesse; dy++) if (w.x + dx === x && w.y + dy === y) return false;
    return abstand({ x: x, y: y, groesse: 1 }, w, K) <= (w._r || 1);
  }
  // Die Zone eines Wesens: alle betretbaren Felder, die es bedroht, als Schlüssel „x,y“ (Wände und Hindernisse nicht)
  function zone(K, w) {
    var z = {}, r = w._r || 1, g = w.groesse || 1;
    for (var y = Math.max(1, w.y - r); y <= Math.min(K.ze, w.y + g - 1 + r); y++)
      for (var x = Math.max(1, w.x - r); x <= Math.min(K.sp, w.x + g - 1 + r); x++)
        if ((ARTEN[K.raster[y - 1][x - 1]] || ARTEN['?']).kosten && bedroht(K, w, x, y)) z[x + ',' + y] = 1;
    return z;
  }
  // Welche Gegner ein Weg aus ihrer Reichweite heraus verlässt (Gelegenheitsangriff nach PHB), je Gegner einmal;
  // `schritt` ist der Index des Felds, auf dem die Figur die Zone verlässt
  function gelegenheiten(K, p) {
    var out = [];
    if (!p || p.length < 2) return out;
    gegnerAktiv(K).forEach(function (g) {
      for (var i = 1; i < p.length; i++) {
        if (bedroht(K, g, p[i - 1][0], p[i - 1][1]) && !bedroht(K, g, p[i][0], p[i][1])) { out.push({ wesen: g, schritt: i }); return; }
      }
    });
    return out;
  }
  // Felder, durch die die gerade Linie von Feldmitte zu Feldmitte läuft, ohne Anfang und Ende
  function linie(ax, ay, bx, by) {
    var out = [], seen = {}, n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 8;
    for (var i = 1; i < n; i++) {
      var t = i / n, x = Math.round(ax + (bx - ax) * t), y = Math.round(ay + (by - ay) * t), key = x + ',' + y;
      if ((x === ax && y === ay) || (x === bx && y === by) || seen[key]) continue;
      seen[key] = 1; out.push([x, y]);
    }
    return out;
  }
  // Das Feld eines (großen) Ziels, das dem Standort am nächsten liegt
  function naechstesFeld(von, ziel) {
    var best = null, bd = Infinity, g = ziel.groesse || 1;
    for (var dx = 0; dx < g; dx++) for (var dy = 0; dy < g; dy++) {
      var d = Math.max(Math.abs(ziel.x + dx - von.x), Math.abs(ziel.y + dy - von.y));
      if (d < bd) { bd = d; best = [ziel.x + dx, ziel.y + dy]; }
    }
    return best;
  }
  // Deckung des Ziels aus der Geometrie: Wand und Hindernis ganz (3), hohe Deckung Dreiviertel (2), niedrige Deckung und
  // Wesen dazwischen halb (1). Ein Vorschlag; die Spielleitung entscheidet nach PHB (Regelwerk 12.6).
  var DECKUNG_NAME = ['keine', 'halbe', 'Dreiviertel-', 'ganze'], DECKUNG_STERN = ['', '★', '★★', '★★★'], DECKUNG_RK = ['', '+2', '+5', ''];
  function deckung(K, von, ziel) {
    var zf = naechstesFeld(von, ziel), b = belegt(K), stufe = 0, grund = '';
    linie(von.x, von.y, zf[0], zf[1]).forEach(function (f) {
      var x = f[0], y = f[1];
      if (x < 1 || y < 1 || x > K.sp || y > K.ze) return;
      var c = K.raster[y - 1][x - 1], s = 0, g = '';
      if (c === '#' || c === 'x') { s = 3; g = c === '#' ? 'eine Wand' : 'ein Hindernis'; }
      else if (c === 'O') { s = 2; g = 'hohe Deckung'; }
      else if (c === 'o') { s = 1; g = 'niedrige Deckung'; }
      var w = b[x + ',' + y];
      if (w && w !== ziel && w.art !== 'figur' && s < 1) { s = 1; g = w.name; }
      if (s > stufe) { stufe = s; grund = g + ' bei ' + feldNameK(K, x, y); }
    });
    return { stufe: stufe, grund: grund, name: DECKUNG_NAME[stufe], stern: DECKUNG_STERN[stufe], rk: DECKUNG_RK[stufe] };
  }
  // Die Lage eines Angriffs vom Standort `stand` auf `ziel` mit der Waffe `wf`: Reichweite, Deckung, Vorteil und Nachteil
  // mit Gründen und einem Satz je Posten (`warum`). Hilfe für den Spieler, keine Regelentscheidung; SG und RK kommen
  // nicht vor. `liegtSelbst`: die Figur greift vom Boden aus an.
  function angriffsLage(K, stand, ziel, wf, liegtSelbst) {
    var ab = abstand(stand, ziel, K), flach = abstand(stand, ziel), dh = hoeheVon(K, ziel) - hoeheVon(K, stand);
    var L = { abstand: ab, dh: dh, status: 'aus', grund: '', vor: [], nach: [], warum: [], deckung: { stufe: 0, stern: '', name: 'keine' }, netto: 0 };
    var weit = wf.rl || wf.r;
    if (ab <= wf.r) L.status = 'in'; else if (wf.rl && ab <= wf.rl) L.status = 'lang';
    var reichText = 'Reichweite: ' + wf.name + ' reicht ' + m(wf.r) + (wf.rl ? ', mit Nachteil bis ' + m(wf.rl) : '') + '; ' + ziel.name + ' ist ' + m(ab) + ' entfernt' + (dh ? ' (' + hochTief(dh) + ')' : '') + '.';
    L.warum.push(reichText);
    if (L.status === 'aus') {
      L.grund = (flach <= weit && Math.abs(dh) > weit) ? hochTief(dh) : m(ab) + ', ' + wf.name + ' reicht ' + m(weit);
      return L;
    }
    if (L.status === 'lang') { L.nach.push('lange Reichweite'); L.warum.push('Nachteil: Jenseits der normalen Reichweite trifft ein Fernkampfangriff mit Nachteil (PHB).'); }
    var nah = ab <= 1;
    if (liegt(ziel)) {
      if (nah) { L.vor.push('Ziel am Boden'); L.warum.push('Vorteil: Ein Ziel am Boden wird aus 1,5 m mit Vorteil getroffen (PHB).'); }
      else { L.nach.push('Ziel am Boden, aus der Ferne'); L.warum.push('Nachteil: Ein Ziel am Boden ist aus mehr als 1,5 m schwer zu treffen (PHB).'); }
    }
    if (!kampffaehig(ziel)) { L.vor.push('Ziel wehrlos'); L.warum.push('Vorteil: Ein bewusstloses oder gelähmtes Ziel wird mit Vorteil getroffen; ein Treffer aus 1,5 m ist kritisch (PHB).'); }
    if (wf.fern) {
      var neben = gegnerAktiv(K).filter(function (g) { return abstand(stand, g, K) <= 1; });
      if (neben.length) { L.nach.push('Gegner neben dir'); L.warum.push('Nachteil: Ein Fernkampfangriff mit einem Gegner in 1,5 m (' + namen(neben) + ') geht mit Nachteil (PHB).'); }
    }
    if (liegtSelbst) { L.nach.push('du liegst'); L.warum.push('Nachteil: Wer am Boden liegt, greift mit Nachteil an; aufstehen kostet die halbe Bewegung (PHB).'); }
    var dk = deckung(K, stand, ziel);
    L.deckung = dk;
    if (dk.stufe === 3) { L.status = 'aus'; L.grund = 'keine Sichtlinie, ' + dk.grund; L.warum.push('Ganze Deckung: ' + dk.grund + ' liegt zwischen euch; ohne Sichtlinie kein Ziel (PHB).'); return L; }
    if (dk.stufe) L.warum.push((dk.stufe === 2 ? 'Dreiviertel-Deckung: ' : 'Halbe Deckung: ') + dk.grund + ' liegt in der Linie; das gibt dem Ziel ' + dk.rk + ' auf RK und GES-Rettungswürfe. Die Spielleitung entscheidet (12.6).');
    if (L.vor.length && L.nach.length) { L.netto = 0; L.warum.push('Vorteil und Nachteil zugleich heben sich auf (PHB).'); }
    else L.netto = L.vor.length ? 1 : L.nach.length ? -1 : 0;
    return L;
  }
  // Die Lagezeile zum Angriff (HTML) und ihre Kurzform für die Zugzeile
  function lageText(L, wf, ziel) {
    var t = ['Angriff: <b>' + esc(wf.name) + '</b>' + esc(waffeText(wf))];
    if (L.status === 'aus') { t.push('<b>' + esc(ziel.name) + '</b>: außer Reichweite (' + esc(L.grund) + ')'); return t.join(' · '); }
    t.push('<b>' + esc(ziel.name) + '</b>: ' + m(L.abstand) + (L.dh ? ', ' + hochTief(L.dh) : '') + (L.status === 'lang' ? ' · lange Reichweite: Nachteil' : ' · in Reichweite'));
    if (L.deckung.stufe) t.push(esc(L.deckung.name) + ' Deckung ' + L.deckung.stern);
    L.vor.forEach(function (v) { t.push('Vorteil: ' + esc(v)); });
    L.nach.forEach(function (v) { if (v !== 'lange Reichweite') t.push('Nachteil: ' + esc(v)); });
    if (L.vor.length && L.nach.length) t.push('hebt sich auf');
    return t.join(' · ');
  }
  function lageKurz(L, wf, ziel) {
    if (L.status === 'aus') return 'Ziel: ' + ziel.name + ' (außer Reichweite: ' + L.grund + ')';
    var k = [m(L.abstand) + (L.dh ? ', ' + hochTief(L.dh) : '')];
    if (L.status === 'lang') k.push('lange Reichweite');
    if (L.deckung.stufe) k.push(L.deckung.name + ' Deckung');
    L.vor.forEach(function (v) { k.push('Vorteil: ' + v); });
    L.nach.forEach(function (v) { if (v !== 'lange Reichweite') k.push('Nachteil: ' + v); });
    return (wf.zauber ? 'Zauber: ' : 'Angriff: ') + wf.name + ' auf ' + ziel.name + ' (' + k.join('; ') + ')';
  }

  /* ---------- Zeichnen ---------- */
  function px(x) { return RAND + (x - 1) * Z; }
  function py(y) { return RAND + (y - 1) * Z; }

  function feld(K, x, y) {
    var c = K.raster[y - 1][x - 1], h = hoehe(K, x, y), X = px(x), Y = py(y), out = [];
    var id = 'kk' + x + '_' + y;
    if (h > 0 && c !== '#' && c !== '?' && c !== ' ') out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkHo" fill="' + HOEHEN_TON[Math.min(4, h)] + '"/>');
    switch (c) {
      case '#': out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkW"/>'); break;
      case 'x': out.push('<path d="M' + (X + 5) + ' ' + (Y + 5) + 'L' + (X + Z - 5) + ' ' + (Y + Z - 5) + 'M' + (X + Z - 5) + ' ' + (Y + 5) + 'L' + (X + 5) + ' ' + (Y + Z - 5) + '" class="kkX"/>'); break;
      case '~': out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkM"/>' +
        '<path d="M' + (X + 4) + ' ' + (Y + 12) + 'q5 -4 10 0t10 0M' + (X + 6) + ' ' + (Y + 21) + 'q5 -4 10 0t8 0" class="kkWe"/>'); break;
      case ',': out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkS"/>' +
        '<circle cx="' + (X + 9) + '" cy="' + (Y + 10) + '" r="1.3" class="kkP"/><circle cx="' + (X + 20) + '" cy="' + (Y + 19) + '" r="1.3" class="kkP"/>'); break;
      case ':': out.push('<circle cx="' + (X + 8) + '" cy="' + (Y + 9) + '" r="1.6" class="kkP"/><circle cx="' + (X + 19) + '" cy="' + (Y + 14) + '" r="1.6" class="kkP"/><circle cx="' + (X + 11) + '" cy="' + (Y + 22) + '" r="1.6" class="kkP"/>'); break;
      case '=': out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkH"/>' +
        '<path d="M' + X + ' ' + (Y + 10) + 'H' + (X + Z) + 'M' + X + ' ' + (Y + 20) + 'H' + (X + Z) + '" class="kkHl"/>'); break;
      case '+': out.push('<rect x="' + (X + 4) + '" y="' + (Y + 9) + '" width="' + (Z - 8) + '" height="' + (Z - 18) + '" rx="2" class="kkT"/>'); break;
      case '/': out.push('<path d="M' + (X + 5) + ' ' + (Y + 7) + 'H' + (X + Z - 5) + 'M' + (X + 5) + ' ' + (Y + 13) + 'H' + (X + Z - 5) + 'M' + (X + 5) + ' ' + (Y + 19) + 'H' + (X + Z - 5) + 'M' + (X + 5) + ' ' + (Y + 25) + 'H' + (X + Z - 5) + '" class="kkTr"/>'); break;
      case '^': if (!h) out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkE"/>'); break;
      case 'o': out.push('<circle cx="' + (X + Z / 2) + '" cy="' + (Y + Z / 2) + '" r="' + (Z * 0.32) + '" class="kkDo"/>'); break;
      case 'O': out.push('<circle cx="' + (X + Z / 2) + '" cy="' + (Y + Z / 2) + '" r="' + (Z * 0.36) + '" class="kkDO"/>'); break;
      case '?': case ' ': out.push('<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkN"/>'); break;
      default: break;
    }
    return '<g id="' + id + '" data-x="' + x + '" data-y="' + y + '" data-h="' + h + '" class="kkF">' + out.join('') + '<rect x="' + X + '" y="' + Y + '" width="' + Z + '" height="' + Z + '" class="kkK"/></g>';
  }

  // Kanten: wo ein Nachbarfeld höher liegt, bekommt das tiefere Feld an dieser Seite Schatten und Linie;
  // an Treppen nur eine feine Linie. Dazu Höhenschilder, eines je zusammenhängender Kante.
  function kanten(K) {
    var out = [], schilder = [], gesetzt = {};
    var SEITEN = [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']];
    function sichtbar(x, y) { var c = K.raster[y - 1][x - 1]; return c !== '#' && c !== '?' && c !== ' ' && c !== 'x'; }
    var laeufe = {}; // Schlüssel Seite+dh+Zeile (oder Spalte) -> Liste der Felder
    for (var y = 1; y <= K.ze; y++) for (var x = 1; x <= K.sp; x++) {
      if (!sichtbar(x, y)) continue;
      var h = hoehe(K, x, y), X = px(x), Y = py(y);
      SEITEN.forEach(function (s) {
        var nx = x + s[0], ny = y + s[1];
        if (nx < 1 || ny < 1 || nx > K.sp || ny > K.ze || !sichtbar(nx, ny)) return;
        var dh = hoehe(K, nx, ny) - h;
        if (dh <= 0) return;
        var stufe = dh === 1 && (istStufe(K, x, y) || istStufe(K, nx, ny));
        var x1 = s[2] === 'e' ? X + Z : X, y1 = s[2] === 's' ? Y + Z : Y, x2 = s[2] === 'w' ? X : X + Z, y2 = s[2] === 'n' ? Y : Y + Z;
        if (stufe) { out.push('<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="kkSt"/>'); return; }
        var tief = dh >= 2, b = tief ? 12 : 8, st = tief ? [.3, .17, .07] : [.18, .1, .04];
        for (var i = 0; i < 3; i++) {
          var o = i * b / 3, w = b / 3, r;
          if (s[2] === 'n') r = [X, Y + o, Z, w]; else if (s[2] === 's') r = [X, Y + Z - o - w, Z, w]; else if (s[2] === 'w') r = [X + o, Y, w, Z]; else r = [X + Z - o - w, Y, w, Z];
          out.push('<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" class="kkSch" style="opacity:' + st[i] + '"/>');
        }
        out.push('<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="' + (tief ? 'kkKa' : 'kkKs') + '"/>');
        var key = (s[1] ? 'z' + y : 'sp' + x) + s[2] + dh;
        (laeufe[key] = laeufe[key] || []).push([x, y, dh, s[2]]);
      });
    }
    Object.keys(laeufe).forEach(function (key) {
      var l = laeufe[key].sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), lauf = [l[0]];
      function schild(run) {
        // ein Schild je Kante, bei langen Kanten alle sechs Felder eines
        var stellen = run.length <= 6 ? [Math.floor((run.length - 1) / 2)] : [];
        for (var j = 3; j < run.length; j += 6) stellen.push(j);
        stellen.forEach(function (i) {
          var f = run[i], x = f[0], y = f[1];
          if (gesetzt[x + ',' + y]) return;
          gesetzt[x + ',' + y] = 1;
          var t = '+' + m(f[2]), w = t.length * 6.4 + 10, cx = px(x) + Z / 2, cy = py(y) + (f[3] === 'n' ? 11 : f[3] === 's' ? Z - 11 : Z / 2);
          schilder.push('<g class="kkHs"><rect x="' + (cx - w / 2) + '" y="' + (cy - 7) + '" width="' + w + '" height="14" rx="4"/><text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + esc(t) + '</text></g>');
        });
      }
      for (var i = 1; i < l.length; i++) {
        var p = lauf[lauf.length - 1], q = l[i];
        if ((q[0] === p[0] + 1 && q[1] === p[1]) || (q[1] === p[1] + 1 && q[0] === p[0])) lauf.push(q); else { schild(lauf); lauf = [q]; }
      }
      schild(lauf);
    });
    return out.join('') + schilder.join('');
  }

  function wesenSvg(K, w) {
    var X = px(w.x), Y = py(w.y), g = w.groesse, cx = X + Z * g / 2, cy = Y + Z * g / 2, r = Z * g * 0.4;
    var farbe = ART_WESEN[w.art], out = [], h = hoeheVon(K, w);
    out.push('<g class="kkO kkA-' + w.art + '" data-w="' + w._i + '">');
    if (w.art === 'figur') out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 3) + '" class="kkRing"/>');
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + farbe + '" class="kkTok"/>');
    var schrift = Math.max(10, Math.min(16, r * (w.kurz.length > 2 ? 0.75 : 1)));
    out.push('<text x="' + cx + '" y="' + (cy + schrift * 0.36) + '" text-anchor="middle" font-size="' + schrift + '" class="kkTx">' + esc(w.kurz) + '</text>');
    var z = String(w.zustand || '').toLowerCase();
    if (/boden|liegt|gestürzt/.test(z)) out.push('<path d="M' + (cx - r) + ' ' + (cy + r * 0.55) + 'H' + (cx + r) + '" class="kkZu"/>');
    if (/bewusstlos|ohnmächtig|tot/.test(z)) out.push('<path d="M' + (cx - r * 0.7) + ' ' + (cy - r * 0.7) + 'L' + (cx + r * 0.7) + ' ' + (cy + r * 0.7) + 'M' + (cx + r * 0.7) + ' ' + (cy - r * 0.7) + 'L' + (cx - r * 0.7) + ' ' + (cy + r * 0.7) + '" class="kkZu"/>');
    if (/verwundet|verletzt|blut/.test(z)) out.push('<circle cx="' + (cx + r * 0.75) + '" cy="' + (cy - r * 0.75) + '" r="' + Math.max(3, r * 0.22) + '" class="kkBl"/>');
    if (h > 0) {
      var t = m(h), bw = t.length * 5.6 + 8, bx = X + Z * g - bw + 2, by = Y - 6;
      out.push('<g class="kkHm"><rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="12" rx="3"/><text x="' + (bx + bw / 2) + '" y="' + (by + 9) + '" text-anchor="middle">' + esc(t) + '</text></g>');
    }
    out.push('<title>' + esc(w.name) + (h > 0 ? ' · ' + m(h) + ' hoch' : '') + (w.zustand ? ' · ' + esc(w.zustand) : '') + '</title></g>');
    return out.join('');
  }

  function zeichne(D) {
    var K = lies(D), sp = K.sp, ze = K.ze;
    var W = RAND * 2 + sp * Z, H = RAND * 2 + ze * Z, out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(D.titel || 'Kampfkarte') + '">');
    out.push('<style>' + SVG_CSS + '</style>');
    out.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="6" class="kP"/>');
    out.push('<rect x="' + RAND + '" y="' + RAND + '" width="' + (sp * Z) + '" height="' + (ze * Z) + '" class="kkB"/>');
    // Licht
    (D.licht || []).forEach(function (l, i) {
      if (!isFinite(l.x) || !isFinite(l.y)) return;
      var cx = px(+l.x) + Z / 2, cy = py(+l.y) + Z / 2, hell = Math.max(0.5, +l.hell || 4), daemmer = Math.max(hell, +l.daemmer || hell * 2);
      out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (daemmer * Z) + '" class="kkLd"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (hell * Z) + '" class="kkLh"/>');
    });
    // Felder
    for (var y = 1; y <= ze; y++) for (var x = 1; x <= sp; x++) out.push(feld(K, x, y));
    // Rasterlinien
    var g = '';
    for (var i = 0; i <= sp; i++) g += 'M' + px(i + 1) + ' ' + RAND + 'V' + (RAND + ze * Z);
    for (var j = 0; j <= ze; j++) g += 'M' + RAND + ' ' + py(j + 1) + 'H' + (RAND + sp * Z);
    out.push('<path d="' + g + '" class="kkG"/>');
    // Kanten und Höhenschilder
    out.push('<g class="kkKan">' + kanten(K) + '</g>');
    // Beschriftung, oben und unten, links und rechts
    for (x = 1; x <= sp; x++) {
      out.push('<text x="' + (px(x) + Z / 2) + '" y="' + (RAND - 8) + '" text-anchor="middle" class="kkBe">' + (D._ux + x - 1) + '</text>');
      out.push('<text x="' + (px(x) + Z / 2) + '" y="' + (RAND + ze * Z + 17) + '" text-anchor="middle" class="kkBe">' + (D._ux + x - 1) + '</text>');
    }
    for (y = 1; y <= ze; y++) {
      var zb = ZEILEN[(D._uy + y - 2) % 26] || '?';
      out.push('<text x="' + (RAND - 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="end" class="kkBe">' + zb + '</text>');
      out.push('<text x="' + (RAND + sp * Z + 8) + '" y="' + (py(y) + Z / 2 + 4.5) + '" text-anchor="start" class="kkBe">' + zb + '</text>');
    }
    // Notizen als Schilder
    (D.notizen || []).forEach(function (n) {
      if (!n || !isFinite(n.x) || !isFinite(n.y) || !n.text) return;
      var t = String(n.text), w = t.length * 5.9 + 10, cx = px(+n.x) + Z / 2, cy = py(+n.y) + Z - 9;
      out.push('<g class="kkNo"><rect x="' + (cx - w / 2) + '" y="' + (cy - 7) + '" width="' + w + '" height="14" rx="4"/><text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">' + esc(t) + '</text></g>');
    });
    out.push('<g class="kkReich"></g><g class="kkWeg"></g><g class="kkZiel"></g>');
    // Wesen
    K.wesen.forEach(function (w) { out.push(wesenSvg(K, w)); });
    out.push('</svg>');
    var legende = LEGENDE.map(function (l) { return '<span><code>' + esc(l[0] === ' ' ? '␣' : l[0]) + '</code> ' + esc(l[1]) + '</span>'; })
      .concat(['<span><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[1] + '"></i><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[2] + '"></i><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[3] + '"></i> Höhe, je Ebene 1,5 m; Kante mit Schatten</span>'])
      .concat(Object.keys(ART_WESEN).map(function (a) { return '<span><i class="kkLe" style="background:' + ART_WESEN[a] + '"></i> ' + ART_NAME[a] + '</span>'; }))
      .concat(['<span><i class="kkLe kkLeG" style="background:' + F.gold + '"></i> erreichbar, blasser mit Spurt</span>',
        '<span><i class="kkLe kkLeR"></i> Reichweite der Waffe von dort; blasse Gegner sind außer Reichweite</span>',
        '<span><i class="kkLe kkLeZ"></i> bedroht: Reichweite eines Gegners (Tipp auf ihn, oder „Gefahr“ für alle)</span>',
        '<span><i class="kkLe kkLeO"></i> Gelegenheitsangriff beim Verlassen</span>']).join('');
    return { svg: out.join(''), breite: W, hoehe: H, karte: K, legende: legende };
  }

  var SVG_CSS =
    '.kP{fill:#efe2c3}[data-mode="dark"] .kP{fill:#d8c9a3}@media (prefers-color-scheme:dark){:root:not([data-mode]) .kP{fill:#d8c9a3}}' +
    '.kkB{fill:#f4ead0;opacity:.6}.kkG{fill:none;stroke:#3b3028;stroke-opacity:.28;stroke-width:.8}' +
    '.kkBe{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:13px;fill:#3b3028;opacity:.9}' +
    '.kkNo text{font-family:"EB Garamond",Georgia,serif;font-style:italic;font-size:11px;fill:#3b3028}.kkNo rect{fill:#f9f2de;fill-opacity:.92;stroke:#6b573f;stroke-width:.7}.kkNo{pointer-events:none}' +
    '.kkHs text{font-family:"EB Garamond",Georgia,serif;font-size:10.5px;fill:#3b3028}.kkHs rect{fill:#f9f2de;fill-opacity:.9;stroke:#6b573f;stroke-width:.7}.kkHs{pointer-events:none}' +
    '.kkHm text{font-family:"EB Garamond",Georgia,serif;font-size:9.5px;fill:#f6efdd;font-weight:600}.kkHm rect{fill:#3b3028;stroke:#efe2c3;stroke-width:.8}.kkHm{pointer-events:none}' +
    '.kkW{fill:#4a3f33}.kkX{stroke:#4a3f33;stroke-width:2.2;fill:none}.kkM{fill:#b9cfcb}.kkWe{fill:none;stroke:#3f6c84;stroke-width:1.2;opacity:.8}' +
    '.kkS{fill:#cfd7bf}.kkP{fill:#5d6a3a;opacity:.8}.kkH{fill:#e2cf9f}.kkHl{stroke:#8b6d45;stroke-width:.8;opacity:.7}.kkT{fill:#8b6d45;opacity:.9}' +
    '.kkE{fill:#ebdfbd}.kkTr{fill:none;stroke:#6b573f;stroke-width:1.6}.kkDo{fill:#a98a5a;stroke:#6b573f;stroke-width:1.2}.kkDO{fill:#6b573f}' +
    '.kkSch{fill:#3b3028}.kkKa{fill:none;stroke:#3b3028;stroke-width:2.4;stroke-linecap:square}.kkKs{fill:none;stroke:#3b3028;stroke-width:1.4;stroke-linecap:square}.kkSt{fill:none;stroke:#6b573f;stroke-width:1;stroke-dasharray:3 2}' +
    '.kkKan{pointer-events:none}' +
    '.kkN{fill:#8a8276;opacity:.55}.kkK{fill:transparent;cursor:pointer}' +
    '.kkF.kkEr .kkK{fill:#b08d3a;fill-opacity:.22}.kkF.kkSp .kkK{fill:#b08d3a;fill-opacity:.1}.kkF.kkZi .kkK{fill:#8e3b22;fill-opacity:.35}' +
    '.kkLd{fill:#f1d27a;opacity:.14}.kkLh{fill:#f7df8e;opacity:.22}' +
    '.kkO{cursor:pointer}.kkRing{fill:none;stroke:#b08d3a;stroke-width:2.5}.kkTok{stroke:#efe2c3;stroke-width:1.5}.kkO.kkSel .kkTok{stroke:#b08d3a;stroke-width:3}' +
    '.kkTx{fill:#f6efdd;font-family:"EB Garamond",Georgia,serif;font-weight:600;pointer-events:none}.kkZu{stroke:#f6efdd;stroke-width:2.2;fill:none;pointer-events:none}.kkBl{fill:#c0392b;stroke:#efe2c3;stroke-width:1}' +
    '.kkWeg path{fill:none;stroke:#3b3028;stroke-width:2;stroke-dasharray:4 3;opacity:.8}.kkZiel path{fill:none;stroke:#3b3028;stroke-width:2}' +
    // seit 1.2: Reichweite der Waffe, bedrohte Felder, Gelegenheitsangriff, Gegner außer Reichweite
    '.kkReich rect{fill:#8e3b22;fill-opacity:.07;stroke:#8e3b22;stroke-width:2;pointer-events:none}.kkReich rect.kkRl{fill:none;stroke-dasharray:7 4;stroke-width:1.4;stroke-opacity:.8}' +
    '.kkF.kkGz .kkK{stroke:#8e3b22;stroke-width:1.8;stroke-dasharray:5 3}.kkF.kkGzA .kkK{stroke:#8e3b22;stroke-width:1.2;stroke-dasharray:4 3;stroke-opacity:.75}' +
    '.kkWeg .kkOa{fill:#8e3b22;stroke:#efe2c3;stroke-width:1.2}.kkO.kkFern{opacity:.4}.kkO.kkLang{opacity:.7}';

  var UI_CSS =
    '.kk{display:flex;flex-direction:column;gap:10px}' +
    '.kk .kkKopf{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:15px;color:var(--text-primary)}' +
    '.kk .kkKopf small{font-family:inherit;font-size:13px;color:var(--text-secondary)}' +
    '.kk .kkR{overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;border-radius:6px}' +
    '.kk .kkR svg{display:block;height:auto}' +
    '.kk .kkZl{position:sticky;left:0;height:0;width:0;overflow:visible;z-index:1;pointer-events:none}' +
    '.kk .kkZl span{position:absolute;left:0;width:22px;text-align:center;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:13px;line-height:18px;color:#3b3028;background:rgba(239,226,195,.92);border-radius:0 4px 4px 0;transform:translateY(-50%)}' +
    '.kk .kkI{margin:0;font-size:14px;line-height:1.55;color:var(--text-secondary);min-height:44px}' +
    '.kk .kkI b{font-weight:500;color:var(--text-primary)}' +
    '.kk .kkB{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.kk input{flex:1 1 180px;min-width:120px;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--border-300,#c8bda4);border-radius:6px;background:transparent;color:var(--text-primary)}' +
    '.kk .kkL{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;font-size:12px;color:var(--text-secondary)}' +
    '.kk .kkL span{display:flex;align-items:center;gap:6px}.kk .kkL code{font-size:12px;padding:0 4px;border:1px solid var(--border-300,#c8bda4);border-radius:3px}' +
    '.kk .kkLe{display:inline-block;width:12px;height:12px;border-radius:50%}.kk .kkLeH{border-radius:2px;border:1px solid #6b573f;margin-right:-4px}.kk [hidden]{display:none!important}' +
    '.kk.kkFertig .kkB button[data-k="zug"],.kk.kkFertig .kkB button[data-k="bleib"]{opacity:.5;pointer-events:none}' +
    // seit 1.2: Kopf mit Ziel und Uhren, Initiativleiste, Waffen, Lagezeile, Legende
    '.kk .kkKopf2{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;line-height:1.45;color:var(--text-secondary)}.kk .kkKopf2 b{font-weight:500;color:var(--text-primary)}' +
    '.kk .kkIni{display:flex;align-items:center;gap:6px;overflow-x:auto;font-size:13px;color:var(--text-secondary);padding:2px 0}' +
    '.kk .kkIni .kkInL{flex:0 0 auto;margin-right:2px}' +
    '.kk .kkIt{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;color:#f6efdd;font-family:"EB Garamond",Georgia,serif;font-weight:600;font-size:12px;border:2px solid transparent;cursor:pointer;flex:0 0 auto;box-sizing:border-box}' +
    '.kk .kkIt.kkGeh{opacity:.38}.kk .kkIt.kkJetzt{border-color:#b08d3a;box-shadow:0 0 0 2px rgba(176,141,58,.4);cursor:default}.kk .kkIt.kkSelI{border-color:#efe2c3;box-shadow:0 0 0 2px #b08d3a}' +
    '.kk .kkIni .kkInT{flex:0 0 auto;font-size:12px;margin:0 2px}' +
    '.kk .kkB .kkWl{font-size:13px;color:var(--text-secondary)}' +
    '.kk button[aria-pressed="true"]{outline:2px solid #b08d3a;outline-offset:-2px}' +
    '.kk .kkA{margin:0;font-size:14px;line-height:1.55;padding:6px 10px;border-radius:6px;border:1px solid var(--border-300,#c8bda4);color:var(--text-primary)}' +
    '.kk .kkA.kkVor{border-color:#4d5b33;background:rgba(77,91,51,.09)}.kk .kkA.kkNach{border-color:#8e3b22;background:rgba(142,59,34,.09)}.kk .kkA.kkAus{color:var(--text-secondary)}' +
    '.kk .kkA b{font-weight:500}.kk .kkA button{font-size:12px;margin-left:6px}' +
    '.kk .kkWarum{margin:6px 0 0;padding-left:18px;font-size:13px;line-height:1.5;color:var(--text-secondary)}' +
    '.kk .kkOaT{color:#8e3b22;font-weight:500}' +
    '.kk .kkLeG{border-radius:2px;opacity:.6}.kk .kkLeR{border-radius:2px;border:2px solid #8e3b22;background:rgba(142,59,34,.1);box-sizing:border-box}' +
    '.kk .kkLeZ{border-radius:2px;border:2px dashed #8e3b22;box-sizing:border-box}.kk .kkLeO{width:0;height:0;border-radius:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:11px solid #8e3b22}';

  /* ---------- Einbau ins Widget ---------- */
  function schriftLaden() {
    try {
      if (document.getElementById('ktSchrift')) return;
      var l = document.createElement('link');
      l.id = 'ktSchrift'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=IM+Fell+English:ital@0;1&display=swap';
      document.head.appendChild(l);
    } catch (e) { return; }
  }

  function einbauen(el, D) {
    schriftLaden();
    var e = zeichne(D), K = e.karte, W = e.breite, H = e.hoehe, figur = K.figur;
    var liegtFigur = !!(figur && liegt(figur));
    var budget = figur ? Math.max(0, Math.floor((+figur.bewegung || 9) / METER)) : 0;
    if (liegtFigur) budget = Math.floor(budget / 2); // aufstehen kostet die halbe Bewegung (PHB)
    var Wg = figur ? wege(K, figur) : null;
    var waffen = figur ? figur.waffen : [], waffeIdx = 0;
    // Kopf: Ziel, Uhren und Lage (seit 1.2)
    var kopf2 = [];
    if (D.ziel) kopf2.push('<span class="kkZiel"><b>Ziel:</b> ' + esc(D.ziel) + '</span>');
    (Array.isArray(D.uhren) ? D.uhren : []).forEach(function (u) {
      if (!u || !u.name) return;
      var r = +u.rest;
      kopf2.push('<span class="kkUhr"><b>' + esc(u.name) + ':</b> ' + (isFinite(r) ? (r <= 0 ? 'jetzt' : 'noch ' + r + (r === 1 ? ' Runde' : ' Runden')) : esc(u.rest)) + '</span>');
    });
    (Array.isArray(D.lage) ? D.lage : []).forEach(function (l) { if (l) kopf2.push('<span class="kkLage">' + esc(l) + '</span>'); });
    // Initiativleiste (seit 1.2): wer vor der Figur steht, hat in dieser Runde gehandelt
    var reihe = [], ini = '';
    if (Array.isArray(D.reihenfolge)) {
      var byId = {}; K.wesen.forEach(function (w) { if (w.id != null) byId[String(w.id)] = w; });
      D.reihenfolge.forEach(function (id) { var w = byId[String(id)]; if (w && reihe.indexOf(w) < 0) reihe.push(w); });
      var fi = figur ? reihe.indexOf(figur) : -1;
      if (reihe.length) ini = '<div class="kkIni" role="list" aria-label="Reihenfolge"><span class="kkInL">Reihenfolge</span>' + reihe.map(function (w, i) {
        var kl = 'kkIt' + (fi >= 0 && i < fi ? ' kkGeh' : '') + (w === figur ? ' kkJetzt' : ''), was = fi >= 0 && i < fi ? 'hat gehandelt' : w === figur ? 'am Zug' : 'kommt noch';
        return '<span class="' + kl + '" role="listitem" data-w="' + w._i + '" title="' + esc(w.name + ' · ' + was) + '" style="background:' + ART_WESEN[w.art] + '"' + (w !== figur ? ' tabindex="0"' : '') + '>' + esc(w.kurz) + '</span>' +
          (w === figur && i < reihe.length - 1 ? '<span class="kkInT" aria-hidden="true">›</span>' : '');
      }).join('') + '</div>';
    }
    var waffenHtml = waffen.length ? '<div class="kkB kkW"><span class="kkWl">Waffe</span>' + waffen.map(function (w, i) {
      return '<button type="button" data-k="waffe" data-i="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '" title="' + esc(w.name + waffeText(w) + ' · Reichweite ' + m(w.r) + (w.rl ? ' (' + m(w.rl) + ')' : '')) + '">' + esc(w.name) + '</button>';
    }).join('') + '</div>' : '';
    el.classList.add('kk');
    el.innerHTML = '<style>' + UI_CSS + '</style>' +
      '<div class="kkKopf"><span>' + esc(D.titel || 'Kampfkarte') + '</span><small>' + (D.runde ? 'Runde ' + esc(D.runde) + ' · ' : '') +
      (figur ? esc(figur.name) + ' · Bewegung ' + m(budget) : '') + (D.stand ? ' · ' + esc(D.stand) : '') + '</small></div>' +
      (kopf2.length ? '<div class="kkKopf2">' + kopf2.join('') + '</div>' : '') + ini +
      '<div class="kkR"><div class="kkZl" aria-hidden="true"></div>' + e.svg + '</div>' +
      '<p class="kkI" aria-live="polite"></p>' +
      '<p class="kkA" hidden></p>' + waffenHtml +
      '<div class="kkB"><input type="text" maxlength="120" placeholder="und dann … (Angriff, Zauber, Rufen)" aria-label="Was die Figur sonst tut">' +
      '<button type="button" data-k="zug">Zug abschicken</button><button type="button" data-k="bleib">Bleiben</button></div>' +
      '<div class="kkB"><button type="button" data-k="minus" aria-label="Kleiner">−</button><button type="button" data-k="plus" aria-label="Größer">+</button>' +
      '<button type="button" data-k="figur">Zur Figur</button><button type="button" data-k="gefahr" aria-pressed="false" title="Alle Felder, die ein Gegner bedroht">Gefahr</button><button type="button" data-k="leg" aria-expanded="false">Legende</button></div>' +
      '<div class="kkL" hidden>' + e.legende + '</div>';
    var rahmen = el.querySelector('.kkR'), svg = el.querySelector('svg'), info = el.querySelector('.kkI'), eingabe = el.querySelector('input');
    var leg = el.querySelector('.kkL'), bLeg = el.querySelector('[data-k="leg"]'), angriff = el.querySelector('.kkA');
    var zielFeld = null, zielWesen = null, gesendet = false, stufe = 0, gefahrAn = false, warumAn = false;
    var STUFEN = [1, 1.8, 2.8, 4];

    function $(q) { return el.querySelector(q); }
    function feldEl(x, y) { return svg.querySelector('g.kkF[data-x="' + x + '"][data-y="' + y + '"]'); }
    function sag(t) { info.innerHTML = t; }
    function waffe() { return waffen.length ? waffen[Math.min(waffeIdx, waffen.length - 1)] : null; }

    // bedrohte Felder: die Zone des gewählten Gegners (kkGz) und auf „Gefahr“ alle (kkGzA)
    var zonen = {};
    function zoneVon(w) { if (!zonen[w._i]) zonen[w._i] = zone(K, w); return zonen[w._i]; }
    function zeigeZone(w) {
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkGz'), function (f) { f.classList.remove('kkGz'); });
      if (!w || w.art !== 'gegner' || !kampffaehig(w)) return;
      Object.keys(zoneVon(w)).forEach(function (key) { var t = key.split(','), g = feldEl(+t[0], +t[1]); if (g) g.classList.add('kkGz'); });
    }
    function zeigeGefahr(an) {
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkGzA'), function (f) { f.classList.remove('kkGzA'); });
      if (!an) return;
      gegnerAktiv(K).forEach(function (g) { Object.keys(zoneVon(g)).forEach(function (key) { var t = key.split(','), f = feldEl(+t[0], +t[1]); if (f) f.classList.add('kkGzA'); }); });
    }
    // Reichweite der gewählten Waffe vom Standort aus: ein rotes Quadrat (normal), gestrichelt die lange Reichweite;
    // Gegner außer Reichweite werden blass
    function zeigeReich() {
      var g = svg.querySelector('.kkReich'), wf = waffe();
      Array.prototype.forEach.call(svg.querySelectorAll('.kkO.kkFern,.kkO.kkLang'), function (o) { o.classList.remove('kkFern'); o.classList.remove('kkLang'); });
      if (!g) return;
      if (!wf || !figur) { g.innerHTML = ''; return; }
      var s = stand(), gr = s.groesse || 1, out = [];
      [wf.r, wf.rl].forEach(function (r, i) {
        if (!r) return;
        var x1 = Math.max(1, s.x - r), y1 = Math.max(1, s.y - r), x2 = Math.min(K.sp, s.x + gr - 1 + r), y2 = Math.min(K.ze, s.y + gr - 1 + r);
        out.push('<rect x="' + px(x1) + '" y="' + py(y1) + '" width="' + ((x2 - x1 + 1) * Z) + '" height="' + ((y2 - y1 + 1) * Z) + '" rx="3"' + (i ? ' class="kkRl"' : '') + '/>');
      });
      g.innerHTML = out.join('');
      K.wesen.forEach(function (w) {
        if (w === figur || w.art !== 'gegner') return;
        var o = svg.querySelector('.kkO[data-w="' + w._i + '"]'); if (!o) return;
        var ab = abstand(s, w, K);
        if (ab > (wf.rl || wf.r)) o.classList.add('kkFern'); else if (ab > wf.r) o.classList.add('kkLang');
      });
    }

    // erreichbare Felder markieren
    if (Wg) Object.keys(Wg.dist).forEach(function (key) {
      var t = key.split(','), x = +t[0], y = +t[1], d = Wg.dist[key];
      if (!d || Wg.belegt[key]) return;
      var g = feldEl(x, y);
      if (!g) return;
      if (d <= budget) g.classList.add('kkEr'); else if (d <= budget * 2) g.classList.add('kkSp');
    });

    var leiste = el.querySelector('.kkZl');
    function stelle() {
      var breit = rahmen.getBoundingClientRect().width || 380;
      var faktor = STUFEN[stufe];
      if (!stufe) { var minZ = 36; faktor = Math.max(1, minZ / (breit / (W / Z))); }
      svg.style.width = Math.round(breit * faktor) + 'px';
      // Zeilenbuchstaben links, die beim Scrollen stehen bleiben; nur wenn die Karte breiter ist als der Rahmen
      var f = Math.round(breit * faktor) / W, zl = [];
      if (faktor > 1.02) for (var y = 1; y <= K.ze; y++) zl.push('<span style="top:' + Math.round((py(y) + Z / 2) * f) + 'px">' + (ZEILEN[(D._uy + y - 2) % 26] || '?') + '</span>');
      leiste.innerHTML = zl.join('');
    }
    function zurFigur() {
      if (!figur) return;
      var breit = svg.getBoundingClientRect().width || 380, f = breit / W;
      rahmen.scrollLeft = Math.max(0, (px(figur.x) + Z / 2) * f - rahmen.clientWidth / 2);
      rahmen.scrollTop = Math.max(0, (py(figur.y) + Z / 2) * f - rahmen.clientHeight / 2);
    }
    function zeigeWeg(p) {
      var g = svg.querySelector('.kkWeg');
      if (!p || p.length < 2) { g.innerHTML = ''; return; }
      var out = ['<path d="' + p.map(function (q, i) { return (i ? 'L' : 'M') + (px(q[0]) + Z / 2) + ' ' + (py(q[1]) + Z / 2); }).join('') + '"/>'];
      // ein rotes Dreieck, wo die Figur die Reichweite eines Gegners verlässt (Gelegenheitsangriff)
      gelegenheiten(K, p).forEach(function (o) {
        var a = p[o.schritt - 1], b = p[o.schritt], cx = (px(a[0]) + px(b[0])) / 2 + Z / 2, cy = (py(a[1]) + py(b[1])) / 2 + Z / 2;
        out.push('<polygon class="kkOa" points="' + cx + ',' + (cy - 7) + ' ' + (cx + 7) + ',' + (cy + 6) + ' ' + (cx - 7) + ',' + (cy + 6) + '"><title>' + esc('Gelegenheitsangriff: ' + o.wesen.name) + '</title></polygon>');
      });
      g.innerHTML = out.join('');
    }
    function zeigeZiel(x, y) {
      var g = svg.querySelector('.kkZiel');
      g.innerHTML = x ? '<path d="M' + (px(x) + Z / 2) + ' ' + (py(y) + 4) + 'L' + (px(x) + Z - 4) + ' ' + (py(y) + Z / 2) + 'L' + (px(x) + Z / 2) + ' ' + (py(y) + Z - 4) + 'L' + (px(x) + 4) + ' ' + (py(y) + Z / 2) + 'Z"/>' : '';
      Array.prototype.forEach.call(svg.querySelectorAll('.kkF.kkZi'), function (f) { f.classList.remove('kkZi'); });
      if (x) { var f = feldEl(x, y); if (f) f.classList.add('kkZi'); }
    }
    function feldText(x, y) { var h = hoehe(K, x, y); return feldName(D, x, y) + (h > 0 ? ' (' + m(h) + ' hoch)' : ''); }
    function wegText(p) {
      var ph = pfadHoehe(K, p), t = [];
      if (ph.klettern) t.push('klettert ' + m(ph.klettern));
      if (ph.sprung) t.push('springt ' + m(ph.sprung) + ' hinab');
      return t;
    }
    function zielText(von) {
      var ab = abstand(von, zielWesen, K), dh = hoeheVon(K, zielWesen) - hoeheVon(K, von);
      return m(ab) + (dh ? ', ' + m(Math.abs(dh)) + (dh > 0 ? ' höher' : ' tiefer') : '');
    }
    function stand() { return zielFeld ? { x: zielFeld[0], y: zielFeld[1], groesse: figur.groesse } : figur; }
    // Gelegenheitsangriffe auf dem Weg, als Satz („verlässt Räuber 2 und Räuber 3: Gelegenheitsangriffe“)
    function oaText(p, html) {
      var o = gelegenheiten(K, p);
      if (!o.length) return '';
      var s = 'verlässt ' + namen(o.map(function (q) { return q.wesen; })) + ': Gelegenheitsangriff' + (o.length > 1 ? 'e' : '');
      return html ? '<span class="kkOaT">' + esc(s) + '</span>' : s;
    }
    // Die Lage des Angriffs mit der gewählten Waffe auf das gewählte Ziel, vom Zielfeld aus oder vom Stand; null ohne Waffen
    function angriffsZeile(bleibt) {
      var wf = waffe();
      if (!wf || !zielWesen) return null;
      var bewegt = !!zielFeld && !bleibt;
      return { L: angriffsLage(K, bewegt ? stand() : figur, zielWesen, wf, liegtFigur && !bewegt), wf: wf };
    }
    function lage() {
      if (!figur) { sag('Die Figur steht nicht auf der Karte; die Spielleitung erzählt die Lage.'); angriff.hidden = true; return; }
      var t = [], p = zielFeld ? pfad(Wg, zielFeld[0], zielFeld[1]) : null, oa = p ? gelegenheiten(K, p) : [];
      if (zielFeld) {
        var d = Wg.dist[zielFeld[0] + ',' + zielFeld[1]];
        t.push('<b>' + esc(figur.name) + '</b> nach ' + feldText(zielFeld[0], zielFeld[1]) + ' · ' + m(d));
        wegText(p).forEach(function (s) { t.push(/springt/.test(s) ? s + ' (1W6 Wucht je 3 m, am Boden)' : s); });
        if (d > budget) t.push('<b>Spurt</b>');
        var a = ARTEN[K.raster[zielFeld[1] - 1][zielFeld[0] - 1]];
        if (a && a.unbekannt) t.push('ins Ungewisse');
        if (a && a.deckung) t.push(a.deckung + ' Deckung');
        if (liegtFigur) t.push('steht auf (halbe Bewegung)');
        if (oa.length) t.push(oaText(p, true));
      } else {
        var hf = hoeheVon(K, figur);
        t.push('<b>' + esc(figur.name) + '</b> steht auf ' + feldName(D, figur.x, figur.y) + (hf > 0 ? ', ' + m(hf) + ' hoch' : '') + (liegtFigur ? ' und liegt am Boden (aufstehen kostet die halbe Bewegung)' : '') + '. Tippe auf ein Feld, um zu ziehen (bis ' + m(budget) + ', mit Spurt ' + m(budget * 2) + '), oder auf ein Wesen.');
      }
      var A = angriffsZeile(false);
      if (zielWesen && !A) {
        var ab = abstand(stand(), zielWesen, K);
        t.push('Ziel: <b>' + esc(zielWesen.name) + '</b> · ' + zielText(stand()) + (ab <= 1 ? ' (in Reichweite)' : '') + (zielWesen.zustand ? ' · ' + esc(zielWesen.zustand) : '') + (zielWesen.notiz ? ' · ' + esc(zielWesen.notiz) : ''));
      }
      sag(t.join(' · '));
      // die Lagezeile zum Angriff (seit 1.2): grün bei Vorteil, rot bei Nachteil, blass außer Reichweite
      if (A) {
        var L = A.L, warum = L.warum.slice();
        if (oa.length) warum.push('Gelegenheitsangriff: Wer die Reichweite eines Gegners verlässt, fängt dessen Reaktion, außer er nimmt die Aktion Rückzug (PHB).');
        angriff.hidden = false;
        angriff.className = 'kkA' + (L.status === 'aus' ? ' kkAus' : L.netto > 0 ? ' kkVor' : L.netto < 0 ? ' kkNach' : '');
        angriff.innerHTML = lageText(L, A.wf, zielWesen) + (zielWesen.zustand && !liegt(zielWesen) && kampffaehig(zielWesen) ? ' · ' + esc(zielWesen.zustand) : '') +
          (zielWesen.notiz ? ' · ' + esc(zielWesen.notiz) : '') +
          ' <button type="button" data-k="warum" aria-expanded="' + (warumAn ? 'true' : 'false') + '">' + (warumAn ? 'Weniger' : 'Warum?') + '</button>' +
          (warumAn ? '<ul class="kkWarum">' + warum.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '');
      } else { angriff.hidden = true; angriff.innerHTML = ''; }
      zeigeReich();
    }
    function zeile(bleibt) {
      var s = 'Kampf #' + (D.nr || '?') + ' · ' + figur.name, bewegt = !(bleibt || !zielFeld);
      if (!bewegt) s += ' bleibt auf ' + feldName(D, figur.x, figur.y);
      else {
        var d = Wg.dist[zielFeld[0] + ',' + zielFeld[1]], p = pfad(Wg, zielFeld[0], zielFeld[1]);
        s += ' nach ' + feldText(zielFeld[0], zielFeld[1]) + ' · ' + m(d);
        wegText(p).forEach(function (w) { s += ' · ' + w; });
        if (d > budget) s += ' · Spurt';
        var oa = oaText(p, false);
        if (oa) s += ' · ' + oa;
      }
      if (zielWesen) {
        var A = angriffsZeile(!bewegt);
        if (A) s += ' · ' + lageKurz(A.L, A.wf, zielWesen);
        else s += ' · Ziel: ' + zielWesen.name + ' (' + zielText(bewegt ? stand() : figur) + ')';
      }
      var a = (eingabe.value || '').trim();
      if (a) s += ' · ' + a;
      return s;
    }
    function senden(s) {
      if (typeof sendPrompt === 'function') {
        gesendet = true; el.classList.add('kkFertig');
        sag('Abgeschickt: ' + esc(s) + ' · Die Spielleitung erzählt, was geschieht.');
        sendPrompt(s);
      } else sag('Schreib das in den Chat: <b>' + esc(s) + '</b>');
    }

    // ein Wesen als Ziel wählen (Tipp auf den Spielstein oder in der Leiste); noch einmal tippen hebt es auf
    function waehle(w) {
      var alt = svg.querySelector('.kkO.kkSel'); if (alt) alt.classList.remove('kkSel');
      var altI = el.querySelector('.kkIt.kkSelI'); if (altI) altI.classList.remove('kkSelI');
      if (zielWesen === w || !w) zielWesen = null;
      else {
        zielWesen = w;
        var o = svg.querySelector('.kkO[data-w="' + w._i + '"]'); if (o) o.classList.add('kkSel');
        var it = el.querySelector('.kkIt[data-w="' + w._i + '"]'); if (it) it.classList.add('kkSelI');
      }
      zeigeZone(zielWesen);
      lage();
    }
    svg.addEventListener('click', function (ev) {
      if (gesendet) return;
      var t = ev.target;
      var o = t && t.closest ? t.closest('.kkO') : null;
      if (o) {
        var w = K.wesen[+o.getAttribute('data-w')];
        if (w && w !== figur) { waehle(w); return; }
        if (w === figur) { zielFeld = null; zeigeWeg(null); zeigeZiel(0); lage(); return; }
      }
      var f = t && t.closest ? t.closest('g.kkF') : null;
      if (!f || !figur) return;
      var x = +f.getAttribute('data-x'), y = +f.getAttribute('data-y'), key = x + ',' + y;
      if (Wg.belegt[key] && Wg.belegt[key] !== figur) { sag('Da steht schon jemand: <b>' + esc(Wg.belegt[key].name) + '</b>.'); return; }
      var d = Wg.dist[key];
      if (d == null || (!d && x === figur.x && y === figur.y)) { zielFeld = null; zeigeWeg(null); zeigeZiel(0); lage(); return; }
      if (d > budget * 2) { sag('Bis ' + feldText(x, y) + ' sind es ' + m(d) + '; so weit kommst du in einem Zug nicht, auch mit Spurt nicht (' + m(budget * 2) + ').'); return; }
      if (zielFeld && zielFeld[0] === x && zielFeld[1] === y) { zielFeld = null; zeigeWeg(null); zeigeZiel(0); }
      else { zielFeld = [x, y]; zeigeWeg(pfad(Wg, x, y)); zeigeZiel(x, y); }
      lage();
    });
    el.addEventListener('click', function (ev) {
      var it = ev.target && ev.target.closest ? ev.target.closest('.kkIt[data-w]') : null;
      if (it && !gesendet) { var wi = K.wesen[+it.getAttribute('data-w')]; if (wi && wi !== figur) waehle(wi); return; }
      var b = ev.target && ev.target.closest ? ev.target.closest('button[data-k]') : null;
      if (!b) return;
      var k = b.getAttribute('data-k');
      if (k === 'leg') { leg.hidden = !leg.hidden; bLeg.setAttribute('aria-expanded', String(!leg.hidden)); }
      else if (k === 'plus') { stufe = Math.min(STUFEN.length - 1, stufe + 1); stelle(); zurFigur(); }
      else if (k === 'minus') { stufe = Math.max(0, stufe - 1); stelle(); zurFigur(); }
      else if (k === 'figur') zurFigur();
      else if (k === 'gefahr') { gefahrAn = !gefahrAn; b.setAttribute('aria-pressed', String(gefahrAn)); zeigeGefahr(gefahrAn); }
      else if (k === 'waffe') {
        if (gesendet) return;
        waffeIdx = +b.getAttribute('data-i') || 0;
        Array.prototype.forEach.call(el.querySelectorAll('button[data-k="waffe"]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        lage();
      }
      else if (k === 'warum') { warumAn = !warumAn; lage(); }
      else if (k === 'zug' || k === 'bleib') {
        if (!figur) { sag('Ohne Figur auf der Karte gibt es keinen Zug; schreib in den Chat, was sie tut.'); return; }
        if (gesendet) return;
        senden(zeile(k === 'bleib'));
      }
    });
    el.addEventListener('keydown', function (ev) {
      var it = ev.target && ev.target.classList && ev.target.classList.contains('kkIt') ? ev.target : null;
      if (it && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); it.click(); }
    });
    eingabe.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); $('[data-k="zug"]').click(); } });

    if (window.ResizeObserver) new ResizeObserver(stelle).observe(rahmen);
    else window.addEventListener('resize', stelle);
    stelle(); zurFigur(); lage();
    if (D.hinweis) info.innerHTML = esc(D.hinweis) + ' · ' + info.innerHTML;
  }

  function start() {
    var el = document.getElementById('kampf'), D = window.KAMPF;
    if (!el || !D) return;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Die Kampfkarte ließ sich nicht zeichnen: ' + err.message; }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, lies: lies, wege: wege, pfad: pfad, pfadHoehe: pfadHoehe, abstand: abstand, hoehe: hoehe, feldName: feldName,
    felder: felder, waffeInfo: waffeInfo, bedroht: bedroht, zone: zone, gelegenheiten: gelegenheiten, linie: linie, deckung: deckung, angriffsLage: angriffsLage, lageKurz: lageKurz, version: VERSION };
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
