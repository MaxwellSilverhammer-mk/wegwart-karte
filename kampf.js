/*
 * Wegwart-Karte – Kampfkarte für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.1
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
 * Der Spieler zieht seine Figur und schickt den Zug als „Kampf #nr · …“ per sendPrompt an die Spielleitung.
 * Alle Felder stehen in der README (Abschnitt „Kampf“).
 */
(function () {
  'use strict';

  var VERSION = '1.1';
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
      return k;
    });
    var figur = null;
    wesen.forEach(function (w) { if (!figur && (w.id === D.figur || (!D.figur && w.art === 'figur'))) figur = w; });
    if (figur) figur.art = 'figur';
    return { sp: sp, ze: ze, raster: raster, hoehen: hoehen, rampen: rampen, wesen: wesen, figur: figur };
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
    out.push('<g class="kkWeg"></g><g class="kkZiel"></g>');
    // Wesen
    K.wesen.forEach(function (w) { out.push(wesenSvg(K, w)); });
    out.push('</svg>');
    var legende = LEGENDE.map(function (l) { return '<span><code>' + esc(l[0] === ' ' ? '␣' : l[0]) + '</code> ' + esc(l[1]) + '</span>'; })
      .concat(['<span><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[1] + '"></i><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[2] + '"></i><i class="kkLe kkLeH" style="background:' + HOEHEN_TON[3] + '"></i> Höhe, je Ebene 1,5 m; Kante mit Schatten</span>'])
      .concat(Object.keys(ART_WESEN).map(function (a) { return '<span><i class="kkLe" style="background:' + ART_WESEN[a] + '"></i> ' + ART_NAME[a] + '</span>'; })).join('');
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
    '.kkWeg path{fill:none;stroke:#3b3028;stroke-width:2;stroke-dasharray:4 3;opacity:.8}.kkZiel path{fill:none;stroke:#3b3028;stroke-width:2}';

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
    '.kk.kkFertig .kkB button[data-k="zug"],.kk.kkFertig .kkB button[data-k="bleib"]{opacity:.5;pointer-events:none}';

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
    var budget = figur ? Math.max(0, Math.floor((+figur.bewegung || 9) / METER)) : 0;
    var Wg = figur ? wege(K, figur) : null;
    el.classList.add('kk');
    el.innerHTML = '<style>' + UI_CSS + '</style>' +
      '<div class="kkKopf"><span>' + esc(D.titel || 'Kampfkarte') + '</span><small>' + (D.runde ? 'Runde ' + esc(D.runde) + ' · ' : '') +
      (figur ? esc(figur.name) + ' · Bewegung ' + m(budget) : '') + (D.stand ? ' · ' + esc(D.stand) : '') + '</small></div>' +
      '<div class="kkR"><div class="kkZl" aria-hidden="true"></div>' + e.svg + '</div>' +
      '<p class="kkI" aria-live="polite"></p>' +
      '<div class="kkB"><input type="text" maxlength="120" placeholder="und dann … (Angriff, Zauber, Rufen)" aria-label="Was die Figur sonst tut">' +
      '<button type="button" data-k="zug">Zug abschicken</button><button type="button" data-k="bleib">Bleiben</button></div>' +
      '<div class="kkB"><button type="button" data-k="minus" aria-label="Kleiner">−</button><button type="button" data-k="plus" aria-label="Größer">+</button>' +
      '<button type="button" data-k="figur">Zur Figur</button><button type="button" data-k="leg" aria-expanded="false">Legende</button></div>' +
      '<div class="kkL" hidden>' + e.legende + '</div>';
    var rahmen = el.querySelector('.kkR'), svg = el.querySelector('svg'), info = el.querySelector('.kkI'), eingabe = el.querySelector('input');
    var leg = el.querySelector('.kkL'), bLeg = el.querySelector('[data-k="leg"]');
    var zielFeld = null, zielWesen = null, gesendet = false, stufe = 0;
    var STUFEN = [1, 1.8, 2.8, 4];

    function $(q) { return el.querySelector(q); }
    function feldEl(x, y) { return svg.querySelector('g.kkF[data-x="' + x + '"][data-y="' + y + '"]'); }
    function sag(t) { info.innerHTML = t; }

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
      g.innerHTML = p && p.length > 1 ? '<path d="' + p.map(function (q, i) { return (i ? 'L' : 'M') + (px(q[0]) + Z / 2) + ' ' + (py(q[1]) + Z / 2); }).join('') + '"/>' : '';
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
    function lage() {
      if (!figur) { sag('Die Figur steht nicht auf der Karte; die Spielleitung erzählt die Lage.'); return; }
      var t = [];
      if (zielFeld) {
        var d = Wg.dist[zielFeld[0] + ',' + zielFeld[1]];
        t.push('<b>' + esc(figur.name) + '</b> nach ' + feldText(zielFeld[0], zielFeld[1]) + ' · ' + m(d));
        wegText(pfad(Wg, zielFeld[0], zielFeld[1])).forEach(function (s) { t.push(/springt/.test(s) ? s + ' (1W6 Wucht je 3 m, am Boden)' : s); });
        if (d > budget) t.push('<b>Spurt</b>');
        var a = ARTEN[K.raster[zielFeld[1] - 1][zielFeld[0] - 1]];
        if (a && a.unbekannt) t.push('ins Ungewisse');
        if (a && a.deckung) t.push(a.deckung + ' Deckung');
      } else {
        var hf = hoeheVon(K, figur);
        t.push('<b>' + esc(figur.name) + '</b> steht auf ' + feldName(D, figur.x, figur.y) + (hf > 0 ? ', ' + m(hf) + ' hoch' : '') + '. Tippe auf ein Feld, um zu ziehen (bis ' + m(budget) + ', mit Spurt ' + m(budget * 2) + '), oder auf ein Wesen.');
      }
      if (zielWesen) {
        var ab = abstand(stand(), zielWesen, K);
        t.push('Ziel: <b>' + esc(zielWesen.name) + '</b> · ' + zielText(stand()) + (ab <= 1 ? ' (in Reichweite)' : '') + (zielWesen.zustand ? ' · ' + esc(zielWesen.zustand) : '') + (zielWesen.notiz ? ' · ' + esc(zielWesen.notiz) : ''));
      }
      sag(t.join(' · '));
    }
    function zeile(bleibt) {
      var s = 'Kampf #' + (D.nr || '?') + ' · ' + figur.name;
      if (bleibt || !zielFeld) s += ' bleibt auf ' + feldName(D, figur.x, figur.y);
      else {
        var d = Wg.dist[zielFeld[0] + ',' + zielFeld[1]];
        s += ' nach ' + feldText(zielFeld[0], zielFeld[1]) + ' · ' + m(d);
        wegText(pfad(Wg, zielFeld[0], zielFeld[1])).forEach(function (w) { s += ' · ' + w; });
        if (d > budget) s += ' · Spurt';
      }
      if (zielWesen) s += ' · Ziel: ' + zielWesen.name + ' (' + zielText(zielFeld && !bleibt ? stand() : figur) + ')';
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

    svg.addEventListener('click', function (ev) {
      if (gesendet) return;
      var t = ev.target;
      var o = t && t.closest ? t.closest('.kkO') : null;
      if (o) {
        var w = K.wesen[+o.getAttribute('data-w')];
        if (w && w !== figur) {
          var alt = svg.querySelector('.kkO.kkSel'); if (alt) alt.classList.remove('kkSel');
          if (zielWesen === w) zielWesen = null; else { zielWesen = w; o.classList.add('kkSel'); }
          lage(); return;
        }
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
      var b = ev.target && ev.target.closest ? ev.target.closest('button[data-k]') : null;
      if (!b) return;
      var k = b.getAttribute('data-k');
      if (k === 'leg') { leg.hidden = !leg.hidden; bLeg.setAttribute('aria-expanded', String(!leg.hidden)); }
      else if (k === 'plus') { stufe = Math.min(STUFEN.length - 1, stufe + 1); stelle(); zurFigur(); }
      else if (k === 'minus') { stufe = Math.max(0, stufe - 1); stelle(); zurFigur(); }
      else if (k === 'figur') zurFigur();
      else if (k === 'zug' || k === 'bleib') {
        if (!figur) { sag('Ohne Figur auf der Karte gibt es keinen Zug; schreib in den Chat, was sie tut.'); return; }
        if (gesendet) return;
        senden(zeile(k === 'bleib'));
      }
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

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, lies: lies, wege: wege, pfad: pfad, pfadHoehe: pfadHoehe, abstand: abstand, hoehe: hoehe, feldName: feldName, version: VERSION };
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
