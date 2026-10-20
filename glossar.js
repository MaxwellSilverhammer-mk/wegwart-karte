/*
 * Wegwart-Glossar – Glossar für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0 (Entwurf)
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Glossar: was Fürchtegott weiß, Stand Tag 12</h2>
 *   <div id="glossar">Glossar lädt … Falls nicht, frag nach dem Glossar als Text.</div>
 *   <script>var GLOSSAR={titel:'Glossar', stand:'Stand: Tag 12', heute:12, neuSeit:9, eintraege:[…]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/glossar.js';document.head.appendChild(s);<\/script>
 *
 * Pergament wie der Kartentisch, in drei Formen aus derselben Datei 02_glossar.md:
 *   Stichwortliste (liste: true): alle Schlüsselwörter nach Personen, Gruppen, Orten, Dingen und
 *     Gerüchten mit Suche und Rubriken; ein Tipp auf ein Stichwort fragt die Spielleitung nach dem Eintrag.
 *   Auszug (auszug: true): ein Eintrag mit allem, was die Figur weiß, Posten für Posten mit Herkunft
 *     (selbst gesehen, von wem gehört, gelesen, von einer Karte, Gerücht) und Welttag.
 *   Ganzes Glossar: alle Einträge mit Posten, Querverweise öffnen an Ort und Stelle.
 * „Nachfragen“ schreibt das Schlüsselwort ins Spiel (Regelwerk 5). Die Daten kommen aus dem Spielstand
 * und werden vorher mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '1.0';

  /* ---------- Arten ---------- */
  // Art → [Tabler-Icon, Einzahl, Mehrzahl]
  var ART = {
    person: ['user', 'Person', 'Personen'], gruppe: ['users', 'Gruppe', 'Gruppen'], ort: ['map-pin', 'Ort', 'Orte'],
    ding: ['package', 'Ding', 'Dinge'], geruecht: ['speakerphone', 'Gerücht', 'Gerüchte']
  };
  var REIHE = ['person', 'gruppe', 'ort', 'ding', 'geruecht'];
  // Herkunft eines Wissenspostens → [Tabler-Icon, Beschriftung]; {q} ist die Quelle
  var BEKANNT = {
    gesehen: ['eye', 'selbst gesehen'], gehoert: ['ear', 'von {q}'], gelesen: ['file-text', 'gelesen: {q}'],
    karte: ['map', 'laut {q}'], geruecht: ['wind', 'Gerücht']
  };
  var HALTUNG = { verbuendet: 'verbündet', freund: 'freundlich', feind: 'feindlich', gefangen: 'gefangen', tot: 'tot', vermisst: 'vermisst', unklar: 'unklar' };
  var GEFAHR = { hart: ['droplet', 'harter Gegner'], toedlich: ['skull', 'jenseits deiner Stufe'] };
  var TISCH = { ort: ['Karte', 'Karte'], ding: ['Inventar', 'Gepäck'] };

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Glossar',
    wurzel: 'glossar',
    felder: {
      glossar: { titel: 'text', stand: 'text', heute: 'zahl', neuSeit: 'zahl', figur: 'text', liste: 'ja', auszug: 'ja', gesamt: 'zahl', auf: 'id', eintraege: 'eintrag[]' },
      eintrag: { id: 'id', name: 'text', namen: 'text[]', art: 'eintragsart', kurz: 'text', spieler: 'ja', haltung: 'haltung', gefahr: 'gefahr', neu: 'ja', ort: 'text', logbuch: 'text[]', siehe: 'text[]', post: 'post', wissen: 'wissen[]' },
      wissen: { text: 'text', bekannt: 'bekannt', quelle: 'text', tag: 'zahl' },
      post: { ort: 'text', wie: 'text' }
    },
    wahl: { eintragsart: REIHE, bekannt: Object.keys(BEKANNT), haltung: Object.keys(HALTUNG), gefahr: Object.keys(GEFAHR) },
    pflicht: { glossar: ['titel', 'stand', 'heute', 'eintraege'], eintrag: ['id', 'name', 'art'], wissen: ['text', 'bekannt'], post: ['ort'] },
    // Namen, die wörtlich (oder in einer Schreibweise aus „namen“) im Spielstand stehen müssen
    namen: { eintrag: 'name' },
    // Texte, die eine Stelle im Spielstand belegen muss (Anteil der Inhaltswörter)
    belege: { eintrag: { kurz: 0.7 }, wissen: { text: 0.7 }, post: { ort: 0.7, wie: 0.7 } },
    // Felder, die eine Person, ein Schriftstück oder einen Titel nennen; sie müssen im Spielstand vorkommen
    quellen: { wissen: ['quelle'], eintrag: ['logbuch', 'ort', 'siehe'] },
    // Zahlen, die im Spielstand stehen müssen
    zahlen: { glossar: ['heute', 'neuSeit'], wissen: ['tag'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  var AKZENT = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(AKZENT, '');
  }
  function stichwort(s) { return norm(s).replace(/🎭/g, '').replace(/[„“"‚‘]/g, '').replace(/\s+/g, ' ').trim(); }
  // Zitate „…“ und *Fremdworte* stehen kursiv, wie im Spiel (Regelwerk 3)
  function prosa(s) {
    return esc(s).replace(/„([^“]+)“/g, '<i>„$1“</i>').replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  }
  function anzeigeName(e) { return (e.spieler ? '🎭 ' : '') + esc(e.name); }
  function gueltig(w) {
    if (!w || typeof w.text !== 'string' || !BEKANNT[w.bekannt]) return false;
    if ((w.bekannt === 'gehoert' || w.bekannt === 'gelesen' || w.bekannt === 'karte') && !w.quelle) return false;
    return true;
  }
  // Laufzeitsperre: Einträge ohne gültige Art werden nicht gezeigt; mit Posten nur, wenn ein Posten gültig ist.
  // In der Stichwortliste haben Einträge keine Posten; dann zählt nur Name und Art.
  function sichtbar(D) {
    return (D.eintraege || []).filter(function (e) {
      if (!e || typeof e.id !== 'string' || !e.name || !ART[e.art]) return false;
      return D.liste ? true : Array.isArray(e.wissen) && e.wissen.some(gueltig);
    });
  }
  function istNeu(D, tag) { return typeof D.neuSeit === 'number' && typeof tag === 'number' && tag >= D.neuSeit; }
  function hatNeues(D, e) {
    if (e.neu === true) return true;
    return Array.isArray(e.wissen) && e.wissen.some(function (w) { return gueltig(w) && istNeu(D, w.tag); });
  }
  function herkunft(w) {
    var b = BEKANNT[w.bekannt], t = b[1].replace('{q}', w.quelle || '');
    if (w.bekannt === 'geruecht' && w.quelle) t += ', ' + w.quelle;
    if (w.bekannt === 'gesehen' && w.quelle) t = w.quelle;
    return t;
  }
  function suchtext(e) {
    return norm([e.name].concat(e.namen || [], [e.kurz || ''], (e.wissen || []).map(function (w) { return (w.text || '') + ' ' + (w.quelle || ''); })).join(' '));
  }
  function findeName(karte, name) {
    var n = stichwort(name);
    return karte[n] || null;
  }

  /* ---------- Zeichnen ---------- */
  // Ein Querverweis öffnet den Eintrag an Ort und Stelle, wenn er in den Daten steht, sonst fragt er die Spielleitung danach
  function verweis(karte, name, icon) {
    var z = findeName(karte, name);
    if (z) return '<button type="button" class="glK" data-ziel="' + esc(z.id) + '">' + (icon ? ikon(icon, 14) + ' ' : '') + anzeigeName(z) + '</button>';
    return '<button type="button" class="glK" data-prompt="' + esc('Glossar ' + name) + '">' + (icon ? ikon(icon, 14) + ' ' : '') + esc(name) + ' ↗</button>';
  }
  function zeileHtml(D, e, i) {
    var neu = hatNeues(D, e);
    return ikon(ART[e.art][0], 17) + '<span class="glN">' + anzeigeName(e) +
      (e.gefahr && GEFAHR[e.gefahr] ? ' <i class="ti ti-' + GEFAHR[e.gefahr][0] + ' glGef" title="' + esc(GEFAHR[e.gefahr][1]) + '" aria-label="' + esc(GEFAHR[e.gefahr][1]) + '"></i>' : '') +
      (e.haltung && HALTUNG[e.haltung] ? ' <em class="glH">' + esc(HALTUNG[e.haltung]) + '</em>' : '') +
      (neu ? ' <em class="glNeu">neu</em>' : '') +
      (e.kurz ? '<small>' + prosa(e.kurz) + '</small>' : '') + '</span>';
  }
  function eintragHtml(D, e, i, karte) {
    var id = 'gl' + i;
    if (D.liste) {
      return '<li class="glE" data-id="' + esc(e.id) + '"><button type="button" class="glZ" data-prompt="' + esc('Glossar ' + e.name) + '">' +
        zeileHtml(D, e, i) + '<i class="glPlus" aria-hidden="true">↗</i></button></li>';
    }
    var h = '<li class="glE" data-id="' + esc(e.id) + '"><button type="button" class="glZ" aria-expanded="false" aria-controls="' + id + '">' +
      zeileHtml(D, e, i) + '<i class="glPlus" aria-hidden="true">+</i></button>';
    h += '<div class="glD" id="' + id + '" hidden>';
    // Wissen, Posten für Posten, in der Reihenfolge, in der die Figur es erfuhr
    var wissen = e.wissen.filter(gueltig).map(function (w, k) { return { w: w, k: k }; });
    wissen.sort(function (a, b) {
      var ta = typeof a.w.tag === 'number' ? a.w.tag : -1, tb = typeof b.w.tag === 'number' ? b.w.tag : -1;
      return ta - tb || a.k - b.k;
    });
    h += '<ul class="glW">';
    wissen.forEach(function (x) {
      var w = x.w, b = BEKANNT[w.bekannt];
      h += '<li class="' + esc(w.bekannt) + '">' + ikon(b[0], 16) + '<span>' + prosa(w.text) + '<small>' + esc(herkunft(w)) +
        (typeof w.tag === 'number' ? ' · Tag ' + w.tag : '') + (istNeu(D, w.tag) ? ' <em class="glNeu">neu</em>' : '') + '</small></span></li>';
    });
    h += '</ul>';
    // Querverweise: Ort, siehe auch, Logbuch, Post
    var quer = '';
    if (e.ort && stichwort(e.ort) !== stichwort(e.name)) quer += verweis(karte, e.ort, 'map-pin');
    (e.siehe || []).forEach(function (s) { if (stichwort(s) !== stichwort(e.name)) quer += verweis(karte, s); });
    if (quer) h += '<p class="glKl">Siehe auch</p><p class="glQ">' + quer + '</p>';
    if (e.logbuch && e.logbuch.length) {
      h += '<p class="glKl">Im Logbuch: ' + e.logbuch.map(esc).join(', ') + ' <button type="button" class="glK" data-prompt="Questlog">Logbuch ↗</button></p>';
    }
    if (e.post && e.post.ort) h += '<p class="glKl">Post: ' + esc(e.post.ort) + (e.post.wie ? ', ' + esc(e.post.wie) : '') + '</p>';
    // Knöpfe ins Spiel: Nachfragen (Regelwerk 5), Brief (17.5), der Tisch, auf dem das Stichwort liegt
    var sp = '<button type="button" class="glK glFrag" data-prompt="' + esc(e.name) + '">Nachfragen ↗</button>';
    if (e.post && e.post.ort) sp += '<button type="button" class="glK" data-prompt="' + esc('Brief an ' + (e.spieler ? '🎭 ' : '') + e.name) + '">Brief an ' + anzeigeName(e) + ' ↗</button>';
    if (TISCH[e.art]) sp += '<button type="button" class="glK" data-prompt="' + TISCH[e.art][0] + '">' + TISCH[e.art][1] + ' ↗</button>';
    h += '<p class="glQ glSp">' + sp + '</p><p class="glKl glFragKl">Nachfragen heißt: ' + esc(D.figur || 'Die Figur') + ' fragt jemanden in der Szene danach. Das kostet Spielzeit und kann sich herumsprechen.</p>';
    return h + '</div></li>';
  }

  function zeichne(D) {
    var E = sichtbar(D), karte = {};
    E.forEach(function (e) { karte[stichwort(e.name)] = e; (e.namen || []).forEach(function (n) { if (!karte[stichwort(n)]) karte[stichwort(n)] = e; }); });
    var neu = E.filter(function (e) { return hatNeues(D, e); }).length;
    var kopf = D.auszug
      ? ' · Auszug: ' + E.length + (D.gesamt ? ' von ' + zahl(D.gesamt) + ' Einträgen' : E.length === 1 ? ' Eintrag' : ' Einträge')
      : ' · ' + E.length + (E.length === 1 ? ' Stichwort' : ' Stichwörter') + (neu ? ' · ' + neu + ' neu' + (typeof D.neuSeit === 'number' ? ' seit Tag ' + D.neuSeit : '') : '');
    var h = '<div class="glKopf"><p class="glT">' + esc(D.titel || 'Glossar') + '</p><p class="glS">' + esc(D.stand || '') + kopf + '</p></div>';
    if (!E.length) return h + '<p class="glLeer">Noch kein Stichwort. Fett gedruckte Wörter im Spiel landen hier.</p>';
    if (!D.auszug) {
      h += '<div class="glSuche">' + ikon('search', 18) + '<input type="search" class="glIn" aria-label="Stichwort suchen" placeholder="Stichwort suchen" autocomplete="off"></div>';
      h += '<div class="glChips" role="group" aria-label="Rubriken"><button type="button" class="glC" data-art="" aria-pressed="true">Alle</button>';
      REIHE.forEach(function (a) {
        var n = E.filter(function (e) { return e.art === a; }).length;
        if (n) h += '<button type="button" class="glC" data-art="' + a + '" aria-pressed="false">' + ART[a][2] + ' <b>' + n + '</b></button>';
      });
      if (neu) h += '<button type="button" class="glC" data-art="neu" aria-pressed="false">neu <b>' + neu + '</b></button>';
      h += '</div>';
      if (D.liste) h += '<p class="glKl">Tippe ein Stichwort, dann zeigt die Spielleitung den Eintrag.</p>';
    }
    var nr = 0;
    REIHE.forEach(function (a) {
      var es = E.filter(function (e) { return e.art === a; });
      if (!es.length) return;
      h += '<section class="glR" data-art="' + a + '" aria-label="' + ART[a][2] + '"><p class="glG">' + ART[a][2] + '</p><ul class="glL">';
      es.forEach(function (e) { h += eintragHtml(D, e, nr++, karte); });
      h += '</ul></section>';
    });
    h += '<p class="glLeer glNix" hidden>Nichts gefunden.</p>';
    if (D.auszug) h += '<p class="glQ"><button type="button" class="glK" data-prompt="Glossar">Alle Stichwörter ↗</button></p>';
    return h;
  }

  var CSS = [
    '.gl{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .gl{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .gl{--pg:#d8c9a3}}',
    '.gl p{margin:0}.gl [hidden]{display:none!important}',
    '.glIn0{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 12px;display:flex;flex-direction:column;gap:12px}',
    '.glT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.glS,.glKl{font-style:italic;color:var(--ink2)}.glS{font-size:17px}.glKl{font-size:15px}',
    '.glSuche{display:flex;align-items:center;gap:8px;border-bottom:1.5px solid var(--rahmen);padding:2px 4px 4px;color:var(--ink2)}',
    '.gl input.glIn{all:unset;flex:1;min-width:0;font-family:inherit;font-size:17px;color:var(--ink);line-height:1.4}',
    '.gl input.glIn::placeholder{color:var(--ink2);opacity:.8;font-style:italic}',
    '.gl input.glIn::-webkit-search-cancel-button{-webkit-appearance:none}',
    '.glChips{display:flex;flex-wrap:wrap;gap:6px}',
    '.gl button.glC{all:unset;cursor:pointer;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:999px;padding:1px 11px;line-height:1.5}',
    '.gl button.glC b{font-weight:400;color:var(--ink2)}',
    '.gl button.glC[aria-pressed="true"]{background:var(--ink);color:var(--pg)}.gl button.glC[aria-pressed="true"] b{color:var(--pg)}',
    '.gl button.glC:focus-visible,.gl button.glZ:focus-visible,.gl .glK:focus-visible,.gl input.glIn:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.glR{border-top:1.5px solid var(--rahmen);padding-top:8px}',
    '.glG{font-style:italic;font-size:15px;color:var(--rot);margin-bottom:2px!important}',
    '.glL{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}',
    '.gl button.glZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:flex-start;gap:8px;padding:4px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.35}',
    '.gl button.glZ:hover{background:rgba(59,48,40,.07)}',
    '.gl button.glZ[aria-expanded="true"]{background:rgba(142,59,34,.09)}',
    '.glZ .ti{flex-shrink:0;margin-top:4px;color:var(--ink2)}',
    '.glN{flex:1;min-width:0;display:block}.glN small{display:block;font-size:15px;font-style:italic;color:var(--ink2);line-height:1.3}',
    '.glH{font-style:italic;font-size:14px;color:var(--ink2);border:1px solid var(--linie);border-radius:4px;padding:0 5px;white-space:nowrap}',
    '.glNeu{font-style:normal;font-variant:small-caps;font-size:14px;color:var(--rot);letter-spacing:.04em}',
    '.glGef{color:var(--rot);font-size:16px;vertical-align:-2px}',
    '.glPlus{font-style:normal;color:var(--rot);font-size:17px;margin-top:1px}',
    '.glD{margin:2px 4px 10px 29px;padding:4px 0 2px 12px;border-left:2px solid var(--rot);display:flex;flex-direction:column;gap:8px;font-size:16px}',
    '.glW{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}',
    '.glW li{display:flex;gap:8px;align-items:flex-start;line-height:1.4}',
    '.glW li .ti{flex-shrink:0;margin-top:3px;color:var(--ink2)}',
    '.glW li.gehoert .ti,.glW li.geruecht .ti{color:var(--rot)}',
    '.glW li span{min-width:0}.glW small{display:block;font-style:italic;font-size:14px;color:var(--ink2)}',
    '.glW li.geruecht span>span{font-style:italic}',
    '.glQ{display:flex;flex-wrap:wrap;gap:6px}.glSp{margin-top:2px}',
    '.gl .glK{all:unset;cursor:pointer;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:1px 10px;line-height:1.5}',
    '.gl .glK:hover{background:rgba(59,48,40,.07)}',
    '.gl .glK .ti{vertical-align:-2px}',
    '.gl .glFrag{border-color:var(--rot);color:var(--rot)}',
    '.glFragKl{font-size:14px}',
    '.glLeer{font-style:italic;color:var(--ink2);font-size:15px}'
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

  function einbauen(el, D) {
    schriftLaden();
    el.className = 'gl';
    el.innerHTML = '<style>' + CSS + '</style><div class="glIn0">' + zeichne(D) + '</div>';
    var E = sichtbar(D), texte = {};
    E.forEach(function (e) { texte[e.id] = suchtext(e); });
    var art = '', suche = '';
    function oeffne(li, auf) {
      var b = li.querySelector('button.glZ'), d = b && document.getElementById(b.getAttribute('aria-controls') || '');
      if (!b || !d) return;
      if (auf === undefined) auf = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(auf));
      d.hidden = !auf;
      var plus = b.querySelector('.glPlus');
      if (plus) plus.textContent = auf ? '−' : '+';
    }
    function filtere() {
      var treffer = 0;
      Array.prototype.forEach.call(el.querySelectorAll('.glR'), function (r) {
        var n = 0;
        Array.prototype.forEach.call(r.querySelectorAll('.glE'), function (li) {
          var e = E.filter(function (x) { return x.id === li.getAttribute('data-id'); })[0];
          var ok = !!e && (art === '' || (art === 'neu' ? hatNeues(D, e) : e.art === art)) && (!suche || texte[e.id].indexOf(suche) >= 0);
          li.hidden = !ok;
          if (ok) n++;
        });
        r.hidden = !n;
        treffer += n;
      });
      var nix = el.querySelector('.glNix');
      if (nix) nix.hidden = treffer > 0;
    }
    var input = el.querySelector('input.glIn');
    if (input) input.addEventListener('input', function () { suche = norm(input.value).trim(); filtere(); });
    el.addEventListener('click', function (ev) {
      var t = ev.target, z;
      if (!t.closest) return;
      if ((z = t.closest('[data-prompt]'))) { if (typeof sendPrompt === 'function') sendPrompt(z.getAttribute('data-prompt')); return; }
      if ((z = t.closest('[data-ziel]'))) {
        var li = el.querySelector('.glE[data-id="' + z.getAttribute('data-ziel').replace(/"/g, '') + '"]');
        if (!li) return;
        // Querverweis: Filter lösen, Ziel aufklappen und hinscrollen
        if (li.hidden || (li.closest('.glR') || {}).hidden) {
          art = ''; suche = ''; if (input) input.value = '';
          Array.prototype.forEach.call(el.querySelectorAll('.glC'), function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-art') === '')); });
          filtere();
        }
        oeffne(li, true);
        if (li.scrollIntoView) li.scrollIntoView({ block: 'start', behavior: 'smooth' });
        var b = li.querySelector('button.glZ'); if (b && b.focus) b.focus({ preventScroll: true });
        return;
      }
      if ((z = t.closest('button.glC'))) {
        art = z.getAttribute('data-art');
        Array.prototype.forEach.call(el.querySelectorAll('.glC'), function (c) { c.setAttribute('aria-pressed', String(c === z)); });
        filtere();
        return;
      }
      if ((z = t.closest('button.glZ'))) oeffne(z.closest('.glE'));
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-prompt], .glFragKl'), function (x) { x.remove(); });
    if (D.auf) {
      var start = el.querySelector('.glE[data-id="' + String(D.auf).replace(/"/g, '') + '"]');
      if (start) { oeffne(start, true); if (!D.auszug && start.scrollIntoView) start.scrollIntoView({ block: 'start' }); }
    } else if (D.auszug && E.length === 1) oeffne(el.querySelector('.glE'), true);
  }

  function start() {
    var el = document.getElementById('glossar'), D = window.GLOSSAR;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Glossar ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  /* ---------- Ableitungen aus der Datei (Node) ---------- */
  function satzende(s) { s = String(s || '').trim(); return /[.!?“”]$/.test(s) ? s : s + '.'; }
  // Textfassung (Rückfall ohne Widget, Regelwerk 4; auch die Form des Abschnitts „Glossar“ im Spielstand)
  function alsText(D) {
    var E = sichtbar(D), aus = [];
    REIHE.forEach(function (a) {
      var es = E.filter(function (e) { return e.art === a; });
      if (!es.length) return;
      aus.push('### ' + ART[a][2]);
      es.forEach(function (e) {
        var w = (e.wissen || []).filter(gueltig).map(function (x) { return satzende(x.text) + ' (' + herkunft(x) + (typeof x.tag === 'number' ? ', Tag ' + x.tag : '') + ')'; });
        aus.push('- **' + (e.spieler ? '🎭 ' : '') + e.name + '**' + (e.gefahr === 'toedlich' ? ' ☠️' : e.gefahr === 'hart' ? ' 🩸' : '') + ': ' + (e.kurz ? satzende(e.kurz) + ' ' : '') + w.join(' '));
      });
    });
    return aus.join('\n');
  }
  // Stichwortliste: dieselben Einträge ohne Posten, mit „neu“ statt der Tage
  function alsListe(D) {
    var L = { titel: D.titel, stand: D.stand, heute: D.heute, neuSeit: D.neuSeit, figur: D.figur, liste: true, eintraege: [] };
    Object.keys(L).forEach(function (k) { if (L[k] === undefined) delete L[k]; });
    sichtbar(D).forEach(function (e) {
      var x = { id: e.id, name: e.name, art: e.art };
      ['namen', 'kurz', 'spieler', 'haltung', 'gefahr'].forEach(function (k) { if (e[k] !== undefined) x[k] = e[k]; });
      if (hatNeues(D, e)) x.neu = true;
      L.eintraege.push(x);
    });
    return L;
  }
  // Auszug: ein Eintrag mit Posten, aufgeklappt
  function alsAuszug(D, id) {
    var E = sichtbar(D), e = E.filter(function (x) { return x.id === id || stichwort(x.name) === stichwort(id) || (x.namen || []).some(function (n) { return stichwort(n) === stichwort(id); }); })[0];
    if (!e) return null;
    var A = { titel: D.titel, stand: D.stand, heute: D.heute, neuSeit: D.neuSeit, figur: D.figur, auszug: true, gesamt: E.length, auf: e.id, eintraege: [e] };
    Object.keys(A).forEach(function (k) { if (A[k] === undefined) delete A[k]; });
    return A;
  }

  /* ---------- Zusatzprüfung für pruefen.js ---------- */
  // Lore- und Verweisprüfung: Stand und Tage, Herkunft je Posten, 🎭-Figuren gegen die Chronik, Gefahrzeichen,
  // Querverweise auf Einträge, Karte, Gepäck und Logbuch, wenn deren Daten mitgegeben sind; Stichwortliste gegen die Daten.
  function glossarStichwoerter(stand) {
    var m = stand.split(/\n(?=## )/).filter(function (t) { return /^## Glossar/.test(t); })[0];
    if (!m) return null;
    return (m.match(/\*\*([^*]+)\*\*/g) || []).map(function (x) { return stichwort(x.slice(2, -2)); });
  }
  // Ein Eintrag passt zu einem Schlüsselwort, wenn es gleich lautet oder mit ihm beginnt („Magister Sevrin, der Rote Mann“, „Hennek und Jaro“)
  function passtStichwort(stich, name) {
    var n = stichwort(name);
    return !!n && stich.some(function (s) { return s === n || s.indexOf(n + ',') === 0 || s.indexOf(n + ' und ') === 0 || s.indexOf(n + ' oder ') === 0; });
  }
  function zusatz(D, h) {
    var fehler = [], hinweise = [], heute = D.heute, q = h.quellen || {};
    var E = Array.isArray(D.eintraege) ? D.eintraege.filter(function (e) { return e && typeof e === 'object'; }) : [];
    var ids = {}, namen = {}, byName = {};
    E.forEach(function (e) {
      if (typeof e.id === 'string') ids[e.id] = e;
      if (e.name) byName[stichwort(e.name)] = e;
      (e.namen || []).forEach(function (n) { if (typeof n === 'string' && !byName[stichwort(n)]) byName[stichwort(n)] = e; });
    });
    var st = /tag\s+(\d+)/i.exec(D.stand || '');
    if (st && +st[1] !== heute) fehler.push('Stand „' + D.stand + '“ passt nicht zu heute (Tag ' + heute + ').');
    if (typeof D.neuSeit === 'number' && D.neuSeit > heute) fehler.push('Lore: „neuSeit“ (Tag ' + D.neuSeit + ') liegt nach heute (Tag ' + heute + ').');
    if (D.liste && D.auszug) fehler.push('„liste“ und „auszug“ schließen sich aus.');
    if (D.auszug && typeof D.gesamt !== 'number') hinweise.push('Auszug ohne „gesamt“: Der Kopf kann nicht sagen, wie viele Einträge das ganze Glossar hat.');
    if (D.auf && !ids[D.auf]) fehler.push('„auf“ nennt den Eintrag „' + D.auf + '“, den es in den Daten nicht gibt.');
    var stich = glossarStichwoerter(h.stand);
    if (!stich) hinweise.push('Der Spielstand hat keinen Abschnitt „## Glossar“; Stichwörter nur gegen den ganzen Spielstand geprüft.');
    var karte = q.karte && Array.isArray(q.karte.orte) ? q.karte.orte : null, inventar = q.inventar && Array.isArray(q.inventar.traeger) ? q.inventar : null;
    var questlog = q.questlog && Array.isArray(q.questlog.auftraege) ? q.questlog : null;
    var figuren = Array.isArray(q.figuren) ? q.figuren : q.figuren && Array.isArray(q.figuren.figuren) ? q.figuren.figuren : null;
    if (!karte) hinweise.push('Ohne Kartendaten (02_karte.md) bleiben Ortsverweise ungeprüft.');
    if (!questlog) hinweise.push('Ohne Logbuchdaten (02_questlog.md) bleiben Logbuchverweise ungeprüft.');
    if (!inventar) hinweise.push('Ohne Gepäckdaten (02_inventar.md) bleiben Dinge ungeprüft.');
    var orteNamen = {}, dingNamen = [], titel = [];
    (karte || []).forEach(function (o) { if (o && o.name) orteNamen[stichwort(o.name)] = o; (o && o.namen || []).forEach(function (n) { orteNamen[stichwort(n)] = o; }); if (o && o.id) orteNamen['#' + o.id] = o; });
    ((inventar || {}).traeger || []).forEach(function (t) { (t && t.dinge || []).forEach(function (d) { if (d && d.name) dingNamen.push(stichwort(d.name)); (d && d.namen || []).forEach(function (n) { dingNamen.push(stichwort(n)); }); }); });
    ((questlog || {}).auftraege || []).forEach(function (a) { if (a && a.titel) titel.push(stichwort(a.titel)); });
    if (figuren && !figuren.length) hinweise.push('Die Figurenliste der Chronik ist leer.');
    var figurNamen = (figuren || []).map(function (f) { return stichwort(typeof f === 'string' ? f : f && (f.name || f.id) || ''); });
    E.forEach(function (e, i) {
      var wo = 'Eintrag „' + (e.name || e.id || i + 1) + '“';
      var n = stichwort(e.name || '');
      if (namen[n]) fehler.push(wo + ': Der Name kommt mehrfach vor.'); namen[n] = true;
      if (/🎭/.test(e.name || '')) fehler.push(wo + ': 🎭 gehört nicht in den Namen; der Tisch setzt es, wenn „spieler“ true ist.');
      if (stich && e.name && !passtStichwort(stich, e.name) && !(e.namen || []).some(function (x) { return passtStichwort(stich, x); }))
        fehler.push(wo + ': steht nicht als Schlüsselwort (fett) im Glossar des Spielstands.');
      if (e.spieler) {
        if (D.figur && n === stichwort(D.figur)) fehler.push(wo + ': Die eigene Figur bekommt nie 🎭 (Regelwerk 3).');
        if (figuren && figurNamen.indexOf(n) < 0 && !(e.namen || []).some(function (x) { return figurNamen.indexOf(stichwort(x)) >= 0; })) fehler.push('Lore: ' + wo + ' trägt 🎭, steht aber nicht unter figuren in der Weltchronik.');
        if (!figuren) hinweise.push(wo + ': 🎭 ungeprüft, weil keine Figurenliste der Chronik mitgegeben ist.');
      }
      if (e.gefahr) {
        // Das Zeichen muss im Spielstand bei diesem Namen stehen: kurz hinter dem Namen oder in einer Zeile, die mit dem Namen beginnt
        var zeichen = e.gefahr === 'toedlich' ? '☠️' : '🩸';
        var zeile = h.stand.split('\n').some(function (z) {
          var nz = h.norm(z), p = nz.indexOf(h.norm(e.name)), pz = nz.indexOf(zeichen);
          if (p < 0 || pz < 0) return false;
          return (pz > p && pz - p - e.name.length < 40) || /^\s*[-*]?\s*\*\*/.test(z) && nz.indexOf(h.norm(e.name)) < 12;
        });
        if (!zeile) fehler.push('Lore: ' + wo + ' trägt „' + e.gefahr + '“, aber im Spielstand steht ' + zeichen + ' nicht bei diesem Namen (Regelwerk 3).');
      }
      var w = Array.isArray(e.wissen) ? e.wissen : [];
      if (D.liste) {
        if (w.length) fehler.push(wo + ': Die Stichwortliste trägt keine Posten; die gehören ins ganze Glossar und in den Auszug.');
        ['siehe', 'logbuch', 'post', 'ort'].forEach(function (k) { if (e[k] !== undefined) fehler.push(wo + ': „' + k + '“ gehört nicht in die Stichwortliste.'); });
      } else {
        if (e.neu !== undefined) fehler.push(wo + ': „neu“ gibt es nur in der Stichwortliste; sonst zählen die Tage der Posten.');
        if (!w.some(gueltig)) fehler.push(wo + ': ohne gültigen Wissensposten; der Tisch zeigt den Eintrag nicht.');
      }
      w.forEach(function (x, k) {
        if (!x || typeof x !== 'object') return;
        var wx = wo + ', Posten ' + (k + 1);
        if ((x.bekannt === 'gehoert' || x.bekannt === 'gelesen' || x.bekannt === 'karte') && !x.quelle) fehler.push(wx + ': „' + x.bekannt + '“ braucht eine Quelle (wer, welches Schriftstück, welche Karte).');
        if (x.bekannt === 'gesehen' && x.quelle && !/^selbst/i.test(x.quelle)) fehler.push(wx + ': Selbst Gesehenes nennt keine Quelle; von jemandem Erzähltes ist „gehoert“.');
        if (typeof x.tag === 'number' && x.tag > heute) fehler.push('Lore: ' + wx + ': Tag ' + x.tag + ' liegt nach heute (Tag ' + heute + ').');
        if (typeof x.tag === 'number' && x.tag < 1) fehler.push(wx + ': Tag ' + x.tag + ' gibt es nicht.');
      });
      (e.siehe || []).forEach(function (s) {
        if (typeof s !== 'string') return;
        if (stichwort(s) === n) fehler.push(wo + ': verweist auf sich selbst.');
        else if (!byName[stichwort(s)] && !D.auszug) fehler.push(wo + ': „siehe“ nennt „' + s + '“, das es im Glossar nicht gibt.');
      });
      if (typeof e.ort === 'string' && karte && !orteNamen[stichwort(e.ort)]) fehler.push(wo + ': „ort“ nennt „' + e.ort + '“, das in den Kartendaten nicht vorkommt.');
      if (e.art === 'ort' && karte && !orteNamen[n] && !(e.namen || []).some(function (x) { return !!orteNamen[stichwort(x)]; })) hinweise.push(wo + ': Ort ohne Stelle auf der Karte. Fehlt die Lage noch, ist das richtig so.');
      if (e.art === 'ding' && inventar && dingNamen.indexOf(n) < 0 && !(e.namen || []).some(function (x) { return dingNamen.indexOf(stichwort(x)) >= 0; })) hinweise.push(wo + ': Ding ohne Stück im Gepäck. Verbraucht, abgegeben oder nur gesehen? Dann ist das richtig so.');
      (e.logbuch || []).forEach(function (t) { if (questlog && titel.indexOf(stichwort(t)) < 0) fehler.push(wo + ': „logbuch“ nennt „' + t + '“, aber so heißt kein Auftrag in 02_questlog.md.'); });
    });
    // Stichwortliste gegen das ganze Glossar: gleiche Einträge, gleiche Kurzzeilen, „neu“ passt zu den Tagen
    if (q.liste && !D.liste) {
      var soll = alsListe(D), ist = q.liste.eintraege || [];
      if (!q.liste.liste) fehler.push('Stichwortliste: dem zweiten json-Block fehlt „liste“: true.');
      if (ist.length !== soll.eintraege.length) fehler.push('Stichwortliste: ' + ist.length + ' Einträge, das Glossar hat ' + soll.eintraege.length + '.');
      soll.eintraege.forEach(function (s) {
        var x = ist.filter(function (y) { return y && y.id === s.id; })[0];
        if (!x) { fehler.push('Stichwortliste: Eintrag „' + s.name + '“ fehlt.'); return; }
        ['name', 'art', 'kurz', 'haltung', 'gefahr', 'spieler', 'neu'].forEach(function (k) {
          if (JSON.stringify(x[k]) !== JSON.stringify(s[k])) fehler.push('Stichwortliste: „' + s.name + '“ (' + k + ') weicht vom Glossar ab. Mit „node glossar.js --liste 02_glossar.md“ neu erzeugen.');
        });
      });
      ['stand', 'heute', 'neuSeit'].forEach(function (k) { if (JSON.stringify(q.liste[k]) !== JSON.stringify(D[k])) fehler.push('Stichwortliste: „' + k + '“ weicht vom Glossar ab.'); });
    } else if (!D.liste && !D.auszug) hinweise.push('Ohne Stichwortliste (zweiter json-Block) bleibt der Befehl „Glossar“ ungeprüft.');
    return { fehler: fehler, hinweise: hinweise };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { zeichne: zeichne, alsText: alsText, alsListe: alsListe, alsAuszug: alsAuszug, sichtbar: sichtbar, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION };
    // Aufruf: node glossar.js --liste|--text|--auszug <id> 02_glossar.md
    if (typeof require !== 'undefined' && require.main === module) {
      var fs = require('fs'), args = process.argv.slice(2), was = args[0], datei = args[args.length - 1];
      var text = fs.readFileSync(datei, 'utf8'), m = text.match(/```json\s*([\s\S]*?)```/);
      var D = JSON.parse(m ? m[1] : text);
      if (was === '--text') process.stdout.write(alsText(D) + '\n');
      else if (was === '--liste') process.stdout.write(JSON.stringify(alsListe(D)) + '\n');
      else if (was === '--auszug') { var A = alsAuszug(D, args[1]); if (!A) { console.error('Kein Eintrag „' + args[1] + '“.'); process.exit(1); } process.stdout.write(JSON.stringify(A) + '\n'); }
      else { console.error('Aufruf: node glossar.js --liste|--text|--auszug <id> 02_glossar.md'); process.exit(2); }
    }
  } else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
