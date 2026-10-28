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

  /* ---------- Zeichen (seite/zeichen.js) ---------- */
// ZEICHEN-ANFANG (gemeinsam für inventar.js und handel.js; ändern nur in seite/zeichen.js, dann node seite/zeichen.js --einbauen)
  var ZEICHEN = {
    schwert: ['M20 4v5l-9 7l-4 4l-3 -3l4 -4l7 -9l5 0', 'M6.5 11.5l6 6'],
    dolch: ['M20 4l-1.5 6.5l-6 6l-3 -3l6 -6z', 'M20 4l-9 9', 'M8.5 12.5l5 5', 'M11 15l-5 5', 'M5.5 20.5h.01'],
    saebel: ['M20 3c0 7 -4 12 -10 15l-2 -2c5 -3 8 -7 9 -13z', 'M9 17l-4 4', 'M6 15l4 4'],
    axt: ['M13 9l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385', 'M6.66 15.66l-3.32 -3.32a1.25 1.25 0 0 1 .42 -2.044l3.24 -1.296l6 -6l3 3l-6 6l-1.296 3.24a1.25 1.25 0 0 1 -2.044 .42'],
    kolben: ['M4 20l7.5 -7.5', 'M16 3l3.5 1.5l1.5 3.5l-1.5 3.5l-3.5 1.5l-3.5 -1.5l-1.5 -3.5l1.5 -3.5z'],
    keule: ['M4 20l2 -3l6 -9c2 -3 6 -4 8 -2c2 2 1 6 -2 8l-9 6z'],
    speer: ['M4 20l11 -11', 'M20 4l-2 6l-4 -4z'],
    glefe: ['M4 20l10 -10', 'M14 10c-1 -4 2 -7 6 -7c0 4 -2 7 -5 8', 'M14 10l2 2'],
    bogen: ['M6 3c7 3 7 15 0 18', 'M6 3v18', 'M6 12h13', 'M16 9l3 3l-3 3'],
    armbrust: ['M3 8c4 -4 14 -4 18 0', 'M3 8h18', 'M12 4v17', 'M9 21h6', 'M12 15h4'],
    bolzen: ['M6 18l12 -12', 'M18 6h-4m4 0v4', 'M8 16l-2 1m2 -1l1 2', 'M6 18l-2 2'],
    koecher: ['M8 9h8v11a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M11 9v-7m3 7v-6m-6 6v-5', 'M8 15h8'],
    schild: ['M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3'],
    ruestung: ['M6 4l6 2l6 -2v9c0 4 -3 7 -6 8c-3 -1 -6 -4 -6 -8z', 'M9 4c0 2 1 3 3 3s3 -1 3 -3', 'M12 7v14'],
    kettenhemd: ['M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0', 'M9 12h.01m3 0h.01m3 0h.01m-4.5 3h.01m3 0h.01m-4.5 3h.01m3 0h.01m3 0h.01'],
    kleidung: ['M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0'],
    mantel: ['M16 3l-4 5l-4 -5', 'M12 19a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-8.172a2 2 0 0 1 .586 -1.414l.828 -.828a2 2 0 0 0 .586 -1.414v-2.172a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v2.172a2 2 0 0 0 .586 1.414l.828 .828a2 2 0 0 1 .586 1.414v8.172a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2', 'M20 13h-3a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3', 'M4 17h3a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-3', 'M12 19v-11'],
    kostuem: ['M13.192 9h6.616a2 2 0 0 1 1.992 2.183l-.567 6.182a4 4 0 0 1 -3.983 3.635h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183', 'M15 13h.01', 'M18 13h.01', 'M15 16.5c1 .667 2 .667 3 0', 'M8.632 15.982a4.037 4.037 0 0 1 -.382 .018h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183h6.616a2 2 0 0 1 2 2', 'M6 8h.01', 'M9 8h.01', 'M6 12c.764 -.51 1.528 -.63 2.291 -.36'],
    verkleidung: ['M3 11h18', 'M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4', 'M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M10 17h4'],
    laute: ['M4 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'M9 15h.01', 'M12.5 11.5l7.5 -7.5', 'M18 3l3 3'],
    floete: ['M3 19l16 -16', 'M5 21l16 -16', 'M3 19l2 2m14 -18l2 2', 'M9 15h.01m3 -3h.01m3 -3h.01'],
    trommel: ['M4 8a8 3 0 0 0 16 0a8 3 0 0 0 -16 0v9a8 3 0 0 0 16 0v-9', 'M7 10.5v6m10 -6v6', 'M3 3l5 4m13 -4l-5 4'],
    horn: ['M4 18c0 -7 7 -13 15 -14', 'M8 20c2 -6 7 -10 12 -11', 'M19 4a1.5 2.5 0 1 1 1 5', 'M4 18a2 2 0 0 0 4 2'],
    seil: ['M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0', 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M20 12c0 4 -1 7 -4 9'],
    kerze: ['M9 21h6v-10a1 1 0 0 0 -1 -1h-4a1 1 0 0 0 -1 1l0 10', 'M12 2l1.465 1.638a2 2 0 1 1 -3.015 .099l1.55 -1.737'],
    laterne: ['M8 9h8v8a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M9 9v-2h6v2', 'M9 7a3 3 0 0 1 6 0', 'M12 16c-1.5 -1.5 -.5 -3 0 -4c.5 1 1.5 2.5 0 4', 'M9 21h6'],
    fackel: ['M12 21v-9', 'M9 12h6', 'M9 11c-1 -3 0 -5 3 -8c3 3 4 5 3 8', 'M12 10c-1 -1 -1 -2 0 -3c1 1 1 2 0 3'],
    decke: ['M5 12a2.5 4 0 1 0 5 0a2.5 4 0 1 0 -5 0', 'M7.5 8h11a2.5 4 0 0 1 0 8h-11'],
    schlafsack: ['M5 12a2.5 4 0 1 0 5 0a2.5 4 0 1 0 -5 0', 'M7.5 8h11a2.5 4 0 0 1 0 8h-11', 'M12 8v8m4 -8v8'],
    netz: ['M4 4l16 16', 'M20 4l-16 16', 'M12 4l8 8l-8 8l-8 -8z'],
    rucksack: ['M5 18v-6a6 6 0 0 1 6 -6h2a6 6 0 0 1 6 6v6a3 3 0 0 1 -3 3h-8a3 3 0 0 1 -3 -3', 'M10 6v-1a2 2 0 1 1 4 0v1', 'M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4', 'M11 10h2'],
    schlauch: ['M9 3h6l-1 3c4 2 5 5 5 9a5 5 0 0 1 -5 5h-4a5 5 0 0 1 -5 -5c0 -4 1 -7 5 -9z', 'M9 6h6'],
    werkzeug: ['M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5'],
    striegel: ['M3 21v-4a4 4 0 1 1 4 4h-4', 'M21 3a16 16 0 0 0 -12.8 10.2', 'M21 3a16 16 0 0 1 -10.2 12.8', 'M10.6 9a9 9 0 0 1 4.4 4.4'],
    boot: ['M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1', 'M4 18l-1 -3h18l-1 3', 'M11 12h7l-7 -9v9', 'M8 7l-2 5'],
    kette: ['M9 15l6 -6', 'M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464', 'M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463'],
    kompass: ['M8 16l2 -6l6 -2l-2 6l-6 2', 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 3l0 2', 'M12 19l0 2', 'M3 12l2 0', 'M19 12l2 0'],
    schluessel: ['M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0', 'M15 9h.01'],
    ration: ['M18 4a3 3 0 0 1 2 5.235v8.765a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-8.764a3 3 0 0 1 1.824 -5.231h12.176v-.005'],
    fisch: ['M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571', 'M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504', 'M18 11v.01', 'M11.5 10.5c-.667 1 -.667 2 0 3'],
    kraut: ['M5 21c.5 -4.5 2.5 -8 7 -10', 'M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3l.014 0'],
    schale: ['M4 8h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1'],
    trank: ['M9 3l6 0', 'M10 9l4 0', 'M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6'],
    flasche: ['M10 5h4v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2', 'M14 3.5c0 1.626 .507 3.212 1.45 4.537l.05 .07a8.093 8.093 0 0 1 1.5 4.694v6.199a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-6.2c0 -1.682 .524 -3.322 1.5 -4.693l.05 -.07a7.823 7.823 0 0 0 1.45 -4.537', 'M7 14.803a2.4 2.4 0 0 0 1 -.803a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 1 -.805'],
    brief: ['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10', 'M3 7l9 6l9 -6'],
    zettel: ['M13 20l7 -7', 'M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7'],
    siegel: ['M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M13 17.5v4.5l2 -1.5l2 1.5v-4.5', 'M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73', 'M6 9l12 0', 'M6 12l3 0', 'M6 15l2 0'],
    rolle: ['M17 20h-11a3 3 0 0 1 0 -6h11a3 3 0 0 0 0 6h1a3 3 0 0 0 3 -3v-11a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8'],
    karte: ['M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13', 'M9 4v13', 'M15 7v13'],
    buch: ['M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6l0 13', 'M12 6l0 13', 'M21 6l0 13'],
    tinte: ['M8 9h8v9a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z', 'M7 9h10', 'M10 9v-3h4v3', 'M12 14v2'],
    feder: ['M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4', 'M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4'],
    wachs: ['M15 9l6 -6', 'M4 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M10 14h.01'],
    kohle: ['M4 17l12 -12l3 3l-12 12l-4 1z', 'M15 6l2 2'],
    beutel: ['M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5', 'M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4'],
    muenze: ['M3 13a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M12 7.5a6 6 0 1 1 5 10'],
    ring: ['M6 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M9 6l3 -3l3 3l-3 3z'],
    juwel: ['M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5', 'M10 12l-2 -2.2l.6 -1'],
    perle: ['M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'M9.5 10.5a3 3 0 0 1 2 -1.5', 'M4 19c2 1 14 1 16 0'],
    band: ['M4 8c5 -3 11 -3 16 0v8c-5 -3 -11 -3 -16 0z', 'M4 12c5 -3 11 -3 16 0'],
    'band-blau': ['M4 8c5 -3 11 -3 16 0v8c-5 -3 -11 -3 -16 0z', 'M4 12c5 -3 11 -3 16 0'],
    flagge: ['M5 14h14l-4.5 -4.5l4.5 -4.5h-14v16'],
    scheibe: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0'],
    seide: ['M6 4h12', 'M6 20h12', 'M8 4v16', 'M16 4v16', 'M8 8h8m-8 4h8m-8 4h8'],
    schwimmer: ['M12 3v4m0 14v-4', 'M8 12a4 6 0 1 0 8 0a4 6 0 1 0 -8 0', 'M8 12h8'],
    tuch: ['M3 5h18', 'M6 5v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2v-13', 'M6 11h12'],
    karten: ['M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001', 'M15 4h1a1 1 0 0 1 1 1v3.5', 'M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374'],
    buendel: ['M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5', 'M12 12l8 -4.5', 'M12 12l0 9', 'M12 12l-8 -4.5', 'M16 5.25l-8 4.5'],
    punkt: ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0']
  };
  // Seltenheit wie bei D&D Beyond: Farbe des Rings und des Namens; gewöhnlich bleibt Tinte
  var SELTENHEIT = {
    gewoehnlich: ['gewöhnlich', ''], ungewoehnlich: ['ungewöhnlich', '#3f7a2f'], selten: ['selten', '#2a62a8'],
    sehr_selten: ['sehr selten', '#6a3fa8'], legendaer: ['legendär', '#c7641a']
  };
  // Marken: ein kleines Zeichen unten rechts am Plättchen [Beschriftung, Füllung, Strich, Bild (Pfade in 12 × 12)]
  var MARKEN = {
    siegel: ['gesiegelt', '#9b2f22', '#f3d9a6', ['M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0']],
    beschaedigt: ['beschädigt', '#efe2c3', '#3b3028', ['M3 2l3 4l-2 1l3 3']],
    benannt: ['benannt', '#c9a227', '#5a4a1a', ['M6 2.5l1.1 2.3l2.5 .3l-1.8 1.7l.5 2.5l-2.3 -1.2l-2.3 1.2l.5 -2.5l-1.8 -1.7l2.5 -.3z']],
    unbekannt: ['unbekannt', '#efe2c3', '#3b3028', ['M4.3 4.5a1.7 1.7 0 1 1 2.4 1.6c-.5 .3 -.7 .6 -.7 1.2', 'M6 9.3h.01']]
  };
  // Zeichen aus Art und Namen raten, wenn das Ding kein `ikone` trägt: [Muster, Zeichen, nur für diese Arten]
  var RATEN = [
    [/dolch|messer/i, 'dolch', ['waffe']], [/krumms|säbel|saebel/i, 'saebel', ['waffe']], [/schwert|klinge/i, 'schwert', ['waffe']],
    [/axt|beil/i, 'axt', ['waffe', 'werkzeug']], [/kolben|morgenstern/i, 'kolben', ['waffe']], [/keule|knüppel/i, 'keule', ['waffe']],
    [/armbrust/i, 'armbrust', ['waffe']], [/köcher/i, 'koecher'], [/bolzen|pfeil/i, 'bolzen', ['waffe']], [/bogen/i, 'bogen', ['waffe']],
    [/glefe/i, 'glefe', ['waffe']], [/speer|pike|lanze|spieß/i, 'speer', ['waffe']], [/schild/i, 'schild', ['waffe', 'ruestung']],
    [/kettenhemd|panzerhemd/i, 'kettenhemd', ['ruestung']], [/mantel|umhang/i, 'mantel'], [/verkleidung|maske|schminke/i, 'verkleidung'],
    [/flöte|pfeife/i, 'floete'], [/laute|harfe|fiedel|leier/i, 'laute'], [/trommel/i, 'trommel'], [/horn/i, 'horn', ['instrument', 'werkzeug']],
    [/laterne/i, 'laterne'], [/fackel/i, 'fackel'], [/kerze/i, 'kerze'], [/schlafsack/i, 'schlafsack'], [/decke/i, 'decke'],
    [/schwimmer/i, 'schwimmer'], [/netz/i, 'netz'], [/striegel|bürste|kardätsche/i, 'striegel'],
    [/tinte/i, 'tinte'], [/feder/i, 'feder'], [/wachs/i, 'wachs'], [/kohle|stift|kreide/i, 'kohle'],
    [/siegelbrief|urkunde/i, 'siegel'], [/zettel|notiz|streifen/i, 'zettel'], [/schriftrolle|rolle/i, 'rolle'], [/buch/i, 'buch', ['papier', 'wertsache', 'sonstiges', 'fund']],
    [/karte/i, 'karte'], [/schlüssel/i, 'schluessel'], [/kompass/i, 'kompass'], [/kette|fessel/i, 'kette'],
    [/blaues band/i, 'band-blau'], [/band/i, 'band'], [/flagge|banner|wimpel/i, 'flagge'], [/\bring\b/i, 'ring'],
    [/juwel|edelstein|rubin|smaragd|saphir/i, 'juwel'], [/perle/i, 'perle'], [/scheibe/i, 'scheibe'], [/seide|faser/i, 'seide'],
    [/münz|geldbeutel|beutel mit/i, 'beutel'], [/aal|fisch/i, 'fisch'], [/flasche/i, 'flasche'], [/trank|elixier/i, 'trank'],
    [/schlauch|wasser/i, 'schlauch'], [/schlamm|salbe|schale/i, 'schale'], [/kraut|kräuter/i, 'kraut'], [/tuch|leinen/i, 'tuch'],
    [/wetzstein|schleifstein/i, 'werkzeug'], [/rucksack|tasche|ranzen/i, 'rucksack'], [/bündel/i, 'buendel']
  ];
  var ARTZEICHEN = {
    waffe: 'schwert', ruestung: 'ruestung', kleidung: 'kleidung', kostuem: 'kostuem', instrument: 'laute', werkzeug: 'werkzeug',
    schreibzeug: 'feder', licht: 'kerze', seil: 'seil', behaelter: 'rucksack', schlafzeug: 'decke', tierbedarf: 'striegel', boot: 'boot',
    ration: 'ration', proviant: 'schlauch', trank: 'trank', papier: 'rolle', brief: 'brief', karte: 'karte',
    zeichen: 'band', andenken: 'flagge', fund: 'perle', wertsache: 'beutel', spiel: 'karten', sonstiges: 'buendel'
  };
  // Arten, bei denen der Name das Zeichen nicht ändert (ein Hanfseil bleibt ein Seil, Rationen bleiben Rationen)
  var FEST = { seil: 1, ration: 1, spiel: 1, boot: 1 };
  function ikoneVon(d) {
    if (d.ikone && ZEICHEN[d.ikone]) return d.ikone;
    if (!FEST[d.art]) for (var i = 0; i < RATEN.length; i++) {
      var r = RATEN[i];
      if (r[0].test(d.name || '') && (!r[2] || r[2].indexOf(d.art) >= 0)) return r[1];
    }
    return ARTZEICHEN[d.art] || 'punkt';
  }
  function seltenheitVon(d) { return SELTENHEIT[d.seltenheit] ? d.seltenheit : 'gewoehnlich'; }
  // Das Zeichen eines Dings als Strichbild; `px` ist die Kantenlänge
  function zeichenSvg(d, px) {
    var p = ZEICHEN[ikoneVon(d)] || ZEICHEN.punkt;
    return '<svg class="wgZ" viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      p.map(function (q) { return '<path d="' + q + '"/>'; }).join('') + '</svg>';
  }
  // Die Marke eines Dings, 14 × 14, oder leer
  function markeSvg(d) {
    var m = MARKEN[d.marke];
    if (!m) return '';
    return '<svg class="wgMk" viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><circle cx="6" cy="6" r="5.5" fill="' + m[1] + '" stroke="' + m[2] + '" stroke-width="1"/>' +
      m[3].map(function (q) { return '<path d="' + q + '" fill="none" stroke="' + m[2] + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'; }).join('') + '</svg>';
  }
  // Das Plättchen: Zeichen in einem Ring in der Farbe der Seltenheit, Marke unten rechts, Anzahl unten links;
  // groesse: 'k' (klein, Händlertisch), '' (Zeile), 'g' (groß, Fenster)
  function plaettchen(d, groesse, anzahl) {
    var s = SELTENHEIT[seltenheitVon(d)], px = groesse === 'g' ? 72 : groesse === 'k' ? 28 : 38, z = groesse === 'g' ? 44 : groesse === 'k' ? 18 : 24;
    return '<span class="wgPl' + (groesse ? ' wgPl' + groesse.toUpperCase() : '') + '" style="width:' + px + 'px;height:' + px + 'px' + (s[1] ? ';--selten:' + s[1] : '') + '">' +
      zeichenSvg(d, z) + markeSvg(d) + (anzahl != null && anzahl !== 1 ? '<b class="wgAnz">' + anzahl + '</b>' : '') + '</span>';
  }
  var ZEICHEN_CSS = '.wgPl{position:relative;display:inline-grid;place-items:center;flex-shrink:0;border-radius:50%;color:var(--ink,#3b3028);background:rgba(59,48,40,.06);box-shadow:inset 0 0 0 1.5px var(--selten,rgba(59,48,40,.45))}' +
    '.wgPl .wgZ{display:block}.wgMk{position:absolute;right:-2px;bottom:-2px}' +
    '.wgAnz{position:absolute;left:-3px;bottom:-4px;min-width:16px;padding:0 4px;box-sizing:border-box;font:600 12px/16px ui-monospace,Menlo,Consolas,monospace;color:#efe2c3;background:var(--ink,#3b3028);border-radius:8px;text-align:center}' +
    '.wgPlG .wgMk{width:20px;height:20px;right:0;bottom:0}.wgPlK .wgMk{width:12px;height:12px;right:-3px;bottom:-3px}.wgPlK .wgAnz{font-size:11px;line-height:14px;min-width:14px;left:-4px}';
// ZEICHEN-ENDE

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
        anzahl: w.anzahl == null ? Infinity : anzahlVon(w), kg: zahl(w.kg), notiz: w.notiz || '', ikone: w.ikone, marke: w.marke, seltenheit: w.seltenheit });
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
          ankauf: d.ankauf == null ? null : wert(d.ankauf), anzahl: anzahlVon(d), kg: zahl(d.kg), notiz: d.ankaufNotiz || '', ikone: d.ikone, marke: d.marke, seltenheit: d.seltenheit });
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
          plaettchen(x, 'k') + '<span class="hdN"' + (SELTENHEIT[seltenheitVon(x)][1] ? ' style="color:' + SELTENHEIT[seltenheitVon(x)][1] + '"' : '') + '>' + (typ === 'd' && x.anzahl > 1 ? '<b>' + Math.max(0, frei) + '</b> ' : '') + esc(x.name) + menge + bei +
          (x.notiz ? '<span class="hdNz">' + esc(x.notiz) + '</span>' : '') + '</span><span class="hdF"></span><span class="hdP">' + (betrag(preis) || 'umsonst') + '</span></button></li>';
      });
      h += '</ul>';
    });
    if (typ === 'd') {
      var nein = H.dinge.filter(function (d) { return d.ankauf == null; });
      if (nein.length) {
        h += '<button type="button" class="hdK hdKlein" data-k="nein" aria-expanded="false">kauft ' + esc(H.kurz) + ' nicht (' + nein.length + ')</button><ul class="hdL hdNein" hidden>';
        nein.forEach(function (d) { h += '<li>' + zeichenSvg(d, 16) + '<span>' + (d.anzahl > 1 ? d.anzahl + ' ' : '') + esc(d.name) + '</span></li>'; });
        h += '</ul>';
      }
    }
    return h;
  }
  function ladung(H, korb, r, seite, mitMuenzen, neu) {
    var h = '', liste = seite === 'r' ? r.kauft : r.verkauft;
    liste.forEach(function (p) {
      h += '<button type="button" class="hdC" data-c="' + p.x.id + '" title="' + esc((p.n > 1 ? p.n + ' × ' : '') + p.x.name) + '" aria-label="' +
        esc((p.n > 1 ? p.n + ' × ' : '') + p.x.name + ', zurücknehmen') + '">' + zeichenSvg(p.x, 18) + (p.n > 1 ? '<b>' + p.n + '</b>' : '') + '</button>';
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
    '.hdZ .wgPl{align-self:center}.hdNein .wgZ,.hdC .wgZ,.hdGeist .wgZ{flex-shrink:0;align-self:center;vertical-align:-3px}',
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
  ].join('') + ZEICHEN_CSS;

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
      g.className = 'hdGeist'; g.innerHTML = zeichenSvg(x, 16) + '<span>' + esc(x.name) + '</span>';
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
      vorbereiten: vorbereiten, rechne: rechne, zeileHandschlag: zeileHandschlag, zeileFeilschen: zeileFeilschen, zeilen: zeilen, ZEICHEN: ZEICHEN };
  } else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
