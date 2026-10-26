/*
 * Wegwart-Gepäck – Inventar für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Inventar: Probefigurs Gepäck</h2>
 *   <div id="gepaeck">Gepäck lädt …</div>
 *   <script>var INVENTAR={titel:'Probefigurs Gepäck', stand:'Stand: Tag 8', geld:{ga:3,sm:5}, traeger:[…]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/inventar.js';document.head.appendChild(s);<\/script>
 *
 * Pergament wie der Kartentisch: Geldbeutel, Rationen, Traglast je Träger und die Dinge,
 * die die Figur bei sich hat, jedes mit einer Pixel-Ikone. Die Zeile zeigt rechts den wichtigsten Wert
 * (Vorrat, Schaden, RK, Anzahl), wer ein Ding antippt, sieht seine Werte: Angriff, Schaden, Reichweite,
 * Merkmale, Vorrat, Wirkung, Zustand, bei Schriftstücken den Wortlaut. Was die Figur über ein Ding weiß
 * und woher es stammt, steht im Glossar; der Tisch zeigt notiz, herkunft und quelle nicht (seit 2.0).
 * Die Daten kommen aus dem Spielstand und werden vorher mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '2.0';

  /* ---------- Arten und Gruppen ---------- */
  // Art → [Tabler-Icon, Gruppe]
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
  var TRAEGERART = { figur: 'user', gefolge: 'user', lasttier: 'horse', reittier: 'horse', lager: 'home' };
  var MUENZEN = [
    ['pm', 'Highlord', 'Highlords', '#9aa3ab', '#d9dee2'],
    ['ga', 'Goldadmiral', 'Goldadmirale', '#a67c1a', '#e8c766'],
    ['em', 'Bright Ship', 'Bright Ships', '#8f8450', '#d6cb8e'],
    ['sm', 'Silber', 'Silber', '#7d8085', '#cfd2d6'],
    ['km', 'Common', 'Common', '#8a4b2a', '#d49a6a']
  ];
  var WERT = { pm: 10, ga: 1, em: 0.5, sm: 0.1, km: 0.01 };

  /* ---------- Pixel-Ikonen (16 × 16, aus seite/pixel.js) ---------- */
  // Jede Zeile ein Rasterstreifen, '.' durchsichtig, Buchstaben nach FARBEN. Neu zeichnen: node seite/pixel.js
  var FARBEN = {"k":"#1d1a24","s":"#e4e8ef","S":"#a3aec0","d":"#5f6a7e","w":"#c8894a","W":"#7a4a24","g":"#f2c94c","G":"#b07d1e","r":"#c8412f","R":"#7d1f16","l":"#a8693c","L":"#6b3f22","p":"#f4ead2","P":"#cdb98e","b":"#4a7cc4","B":"#253f78","n":"#5ea152","N":"#2f6230","o":"#efe6c8","O":"#b9aa83","f":"#ffae2a","F":"#fff2a6","c":"#9a9ca8","C":"#5e606b","h":"#d2bb80","H":"#8f7748","e":"#2c3350","m":"#8e866f","M":"#5e584a","t":"#3d8c8a","T":"#1f5654","y":"#f6e27a"};
  var IKONEN = {
      "schwert": ".............kk.|............kssk|............ksSk|...........ksSk.|..........ksSk..|.........ksSk...|........ksSk....|...kk..ksSk.....|..kGgkksSk......|...kGgsSk.......|...kWWgk........|..kWWkGgk.......|.kWWk.kGgk......|kGgk...kk.......|kgGk............|.kk.............",
      "dolch": "................|................|.............k..|............ksk.|...........ksSk.|..........ksSk..|.....k...ksSk...|....kGk.ksSk....|.....kGksSk.....|.....kkGkk......|....kLlkGk......|...kLlk.k.......|..kLlk..........|.kgGk...........|..kk............|................",
      "saebel": "................|.............kk.|............ksSk|............ksSk|...........ksSk.|...........ksSk.|..........ksSk..|.........ksSk...|.....k..ksSk....|....kgkksSk.....|.....kgkkk......|.....kWWk.......|....kWWkgk......|...kWWk.k.......|..kgkk..........|...k............",
      "kolben": "................|...........k....|.........kkdkk..|........kSSsSSk.|........kSsSSSk.|.......kdSSSSSdk|........kSSSSSk.|........kSSSSSk.|.......kwWkdkk..|......kwWk.k....|.....kwWk.......|....kwWk........|...kwWk.........|..kwWk..........|.kdkk...........|..k.............",
      "armbrust": "................|..............k.|.............ksk|.....kk.....ksk.|....kcWk...ksk..|....kcwWk.kWwk..|....kckwWkWwk...|...kck.kwWwk....|...kck.kWwWk....|...kckkWwkwWk...|...kckWwk.kwWk..|..kckWwk...kwWk.|..kcWwk.....kwk.|..kcwk.......k..|...kk...........|................",
      "bolzen": "................|.............k..|...........kksk.|..........kSsk..|..........kwSk..|.........kwkk...|........kwk.....|.......kwk......|......kwk.......|.....kwk........|....kwk.........|..kkwk..........|.krwk...........|.kRrk...........|..kk............|................",
      "glefe": "............k...|...........ksk..|..........kssk..|.........ksSsk..|........ksSSk...|........ksSk....|.........kWk....|........kWk.....|.......kWk......|......kWk.......|.....kWk........|....kWk.........|...kWk..........|..kWk...........|.kWk............|..k.............",
      "ruestung": "................|................|..kkk......kkk..|.klllkkkkkklllk.|.klllllLllllllk.|.klglllLllllglk.|.klllglLlgllllk.|.klllllLllllllk.|..kklllLllllkk..|...klglLlgllk...|...klllLllllk...|...klllLllllk...|...klglLlgllk...|...klllLllllk...|....kkkkkkkk....|................",
      "kleidung": "................|................|................|..kkkk....kkkk..|.kbbbbkkkkbbbbk.|.kbbbbbBBbbbbbk.|.kbbbbbBbbbbbbk.|.kbbbbbbbbbbbbk.|.kbbbbbbbbbbbbk.|.kbbbbbbbbbbbbk.|..kkLLLLLLLLkk..|...kbbbbbbbbk...|...kbbbbbbbbk...|...kbbbbbbbbk...|....kkkkkkkk....|................",
      "mantel": ".kkkWWWWWWWWkkk.|kWWWWWWWWWWWWWWk|.kkkkMmmmmMkkkk.|....kMCCkmMk....|....kMCCkmMk....|....kMmmmmMk....|...kMmmmmmmMk...|...kMmmmMmmMk...|..kMmmmmMmmmMk..|..kMmmmmMmmmMk..|..kMmmmmMmmmMk..|..kMmmmmMmmmMk..|..kMmmmmMmmmMk..|..kMMMMMMMMMMk..|...kkkkkkkkkk...|................",
      "kostuem": "................|..kk........kk..|.kggkkkkkkkkggk.|.kggknnnnnnkggk.|..kknnnnnnnnkk..|..knnnnnnnnnnk..|..knkkknnkkknk..|.knnkkknnkkknnk.|.knnnnnnnnnnnnk.|.knnnnnnnnnnnnk.|..kknnnnnnnnkk..|....kNNNNNNk....|.....kkkkkk.....|................|................|................",
      "laute": "............kkk.|...........kLLLk|...........kLLLk|...........kLLLk|..........kWPkk.|.........kWPk...|....kkkkkWPk....|...kwwwwWPk.....|..kwwwwwPk......|.kwwwwwwPwk.....|.kwwWkkPwwk.....|.kwwwkPwwwk.....|.kwwwPwwwwk.....|..kwPwwwwk......|...kwwwwk.......|....kkkk........",
      "floete": "................|................|..kkkkkkkkkkkk..|.kWWWWWWWWWWWWk.|.khhHHhhHHhhHHk.|.krrrrrrrrrrrrk.|.kRRRRRRRRRRRRk.|.khhHHhhHHhhHHk.|.khhHHhhHHhhkk..|.khhHHhhHHkk....|.khhHHhhkk......|.khhHHkk........|.khhkk..........|..kk............|................|................",
      "seil": "................|................|................|....kkkkkkkk....|...khhhhhhhhk...|..khhHHHHHHhhk..|..khHHkkkkHHhk..|.khhHk....kHhhk.|.khHk......kHhk.|.khhHk....kHhhk.|..khHHkkkkHHhk..|..khhHHHHHHhhk..|...khhhhhhhhkhk.|....kkkkkkkkkhk.|.............khk|..............k.",
      "kerze": "................|.......kk.......|......kffk......|......kffk......|......kFFk......|......kffk......|......kkkk......|.....kpppPk.....|.....kpppPk.....|.....kpppPk.....|.....kpppPk.....|.....kpppPk.....|.....kpppPk.....|....kkpppPkk....|...kGGGGGGGGk...|....kkkkkkkk....",
      "laterne": ".......kk.......|......kSSk......|.....kddddk.....|....kkddddkk....|...kddddddddk...|....kGGGGGGk....|....kGFFFFGk....|....kGFffFGk....|....kGFffFGk....|....kGFffFGk....|....kGFffFGk....|....kGFFFFGk....|....kGGGGGGk....|...kddddddddk...|....kkkkkkkk....|................",
      "decke": "................|................|.....kkkkkkkk...|...kkrrrggrrRk..|..krrRrrggrRRRk.|..krrRrrggrRRRk.|.krrrRrrggrRRRk.|.krrrRrrggrRRRk.|.krrrRrrggRRRRRk|.krrrRrrggrRRRk.|.krrrRrrggrRRRk.|..krrRrrggrRRRk.|..krrRrrggrRRRk.|...kkrrrggrrRk..|.....kkkkkkkk...|................",
      "netz": "................|................|...k..k..k..k...|..kckkckkckkck..|.kckcckcckcckck.|.kckcckcckcckck.|..kckkckkckkck..|.kckcckcckcckck.|.kckcckcckcckck.|..kckkckkckkck..|.kckcckcckcckck.|.kckcckcckcckck.|..kckkckkckkck..|...k..k..k..k...|................|................",
      "rucksack": "......kkkk......|.....kLLLLk.....|....kkllllkk....|...kllllllllk...|..kllllllllllk..|..kllllllllllk..|..kllllllllllk..|..klLLLLLLLLlk..|..klLLLggLLLlk..|..klLLLggLLLlk..|..kllllllllllk..|..kllLLLLLLllk..|..kllLLLLLLllk..|..kllLLLLLLllk..|..kllllllllllk..|...kkkkkkkkkk...",
      "schlauch": "......kkkk......|.....kWWWWk.....|......kLLk......|......kLLk......|......kLLk......|.....kkLLkk.....|...kkllllllkk...|..kLLLLLLLLLLk..|..kllwlllllllk..|..kllllllllllk..|..kllllllllllk..|..kllllllllllk..|...kllllllllk...|....kllllllk....|.....kkkkkk.....|................",
      "werkzeug": "................|................|......kkkkkk....|....kkmmmmmmk...|...kmmMmmmmmmk..|..kmmmmmmMmmmk..|.kmmMmmmmmmmmMk.|.kmmmmmmmmmMMk..|..kMMMMMMMMMk...|...kkkkkkkkk....|................|................|................|................|................|................",
      "striegel": "................|................|................|................|....kkkkkkkk....|..kkWWWWWWWWkk..|.kwwwwwwwwwwwwk.|.kwwwwwwwwwwwwk.|.kwwwwwwwwwwwwk.|.kWWWWWWWWWWWWk.|.kHkHkHkHkHkHk..|.kHkHkHkHkHkHk..|.kHkHkHkHkHkHk..|..k.k.k.k.k.k...|................|................",
      "boot": "................|..........k.....|.........kwk....|........kwk.....|........kwk.....|.......kwWk.....|.k....kwkWk...k.|kwkkkkkwkWkkkkwk|kwwwwwwwwwwwwwwk|.kWwwwwwwwwwwWk.|..kWWwWWWWWWWk..|.kkkwkkkkkkkkkk.|kttttttttttttttk|kttttttttttttttk|.kkkkkkkkkkkkkk.|................",
      "wasser": "................|.......kk.......|......kttk......|.....kttttk.....|.....ktkktk.....|....kttttttk....|...kttttttttk...|...kttttttttk...|..ktttsttttttk..|..kttttttttttk..|...kttttttttk...|...kttttttttk...|...kttttttttk...|....kttttttk....|.....kkkkkk.....|................",
      "ration": "................|................|................|................|................|....kkkkkkkk....|..kkgggWggggkk..|.kwgWgggWgWggwk.|.kgggWggWggWggk.|kwwggWgggggWgwwk|.kwwggggggggwwk.|.kwwwwwwwwwwwwk.|..kkwwwwwwwwkk..|....kkkkkkkk....|................|................",
      "fisch": "................|................|................|................|..............kk|....kkkkkkk..kSS|..kkSSSSSSSkkSSk|.kSkSSSSSSSSSSk.|.kSSSsssssSSSSk.|.ksshhhhhhhhsSSk|..kkSsssssSkkkSS|....kkkkkkk...kk|................|................|................|................",
      "kraut": "................|.......k.k......|......knknk.....|.....knkNk......|......kNnk......|.....kLLLLk.....|....khhhhhhk....|....kllllllk....|...kllllllllk...|..kllwlllllllk..|..kllllllllllk..|..kllllllllllk..|...kllllllllk...|....kllllllk....|.....kkkkkk.....|................",
      "schale": "................|................|................|................|................|....kkkkkkkk....|..kkmmmmmmmmkk..|.kmmMMMMMMMMmmk.|kmmMMMMMMMMMMmmk|.kOOOOOOOOOOOOk.|..kOoOoOoOoOOk..|...kOOOOOOOOk...|....kkOOOOkk....|......kkkk......|................|................",
      "trank": "......kkkk......|.....kWWWWk.....|.....kWWWWk.....|.....kttttk.....|.....kttttk.....|.....kttttk.....|.....kttttk.....|....kttttttk....|...kttttttttk...|...kttstttttk...|..ktttsttttttk..|...kttttttttk...|...kttttttttk...|....kttttttk....|.....kkkkkk.....|................",
      "brief": "................|................|................|.kkkkkkkkkkkkkk.|kPppppppppppppPk|kpPppppppppppPpk|kppPppppppppPppk|kpppPPppppPPpppk|kpppppPrrPpppppk|kppppprRrrpppppk|kpppppprrppppppk|kppppppppppppppk|kPPPPPPPPPPPPPPk|.kkkkkkkkkkkkkk.|................|................",
      "siegel": "................|..kkkkkkkkkkkk..|.kpppppppppppPk.|.kpppppppppppPk.|.kppPPPPPPPPpPk.|.kpppppppppppPk.|.kppPPPPPPPPpPk.|.kpppppppppppPk.|.kppPPPPPppppPk.|.kppppppprrrrPk.|.kppppppprgrrPk.|.kppppppprrRrPk.|.kppppppprrrrPk.|.kpppppppbpbpPk.|..kkkkkkbkkkbk..|.......kbk.kbk..",
      "rolle": "................|..kkkkkkkkkkkk..|.kPPPPPPPPPPPPk.|..kPpppppppppk..|..kPpppppppppk..|..kPpPPPPPPppk..|..kPpppppppppk..|..kPpPPPPPPPpk..|..kPpppppppppk..|..kPpPPPPPpppk..|..kPpppppppppk..|..kPpPPPPPPppk..|..kPpppppppppk..|.kPPPPPPPPPPPPk.|..kkkkkkkkkkkk..|................",
      "karte": "................|................|.kkkkkkkkkkkkkk.|kpppPppppPpppppk|kpppPppppPpppppk|kpnnPpppbPbbpppk|kpnnnpppbbbppppk|kppnPpppbPpprppk|kpppPppppPprrrpk|kpppPppppPpprppk|kPPPPPPPPPPPPPPk|.kkkkkkkkkkkkkk.|................|................|................|................",
      "tinte": ".............kk.|............kppk|...........kpkPk|...........kpPk.|....kkkk..kpPk..|...kWWWWkkpPk...|...keeeekpkPk...|...keeeekpPk....|...keeeepPk.....|..keeeepPk......|.keebeeeeek.....|.keeeeeeeek.....|.keeeeeeeek.....|..keeeeeek......|...kkkkkk.......|................",
      "feder": "............kk..|...........kppk.|..........kppPk.|.........kppPk..|........kppPk...|.......kppPk....|......kppPk.....|.....kppPk......|....kpPPk.......|....kPPk........|...kPkk.........|..kek...........|...k............|................|................|................",
      "wachs": "................|................|................|.......k........|......kRk.......|...kkkkkRkkkk...|..krrrrrrRrrRk..|..krFFFFrrrrRk..|..krrrrrrrrrRk..|..krrrrrrrrrRk..|..kRRRRRRRRRRk..|..kRRRRRRRRRRk..|..kRRRRRRRRRRk..|...kkkkkkkkkk...|................|................",
      "kohle": "................|................|.............k..|............kek.|...........keCk.|..........keCk..|.........keCk...|........keCk....|.......keCk.....|......keCk......|.....keCk.......|....keCk........|...keCk.........|..keCk..........|.keek...........|..kk............",
      "beutel": "................|......kkkk......|.....kllllk.....|.....kllllk.....|.....kLLLLk.....|.....kLLLLk.....|....kggggggk....|...kllllllllk...|..kllwlllllllk..|..klllwllllllk..|.kllllllllllllk.|..klllllllgllk..|..kllllllgGglk..|...kllllllglk...|....kllllllk....|.....kkkkkk.....",
      "muenze": "................|................|.....kkkkkk.....|....kggggggk....|...kggggggggk...|..kgggGGGGgggk..|..kggGggggGggk..|..kggGgrggGggk..|..kggGggggGggk..|..kggGggggGggk..|..kgggGGGGgggk..|...kggggggggk...|....kggggggk....|.....kkkkkk.....|................|................",
      "schluessel": "................|................|...kkkk.........|..kGGGGk........|.kGGkkGGk.......|.kGGkkGGk.......|.kGGkkGGk.......|..kGGGGGk.......|...kkkkgGk......|.......kgGk..k..|........kgGkkGk.|.........kgGGk..|..........kgGk..|.........kGGgGk.|..........kkkk..|................",
      "band": "................|................|................|....kkk..kkk....|...knnnkknnnk...|..knnnnNNnnnnk..|.knnNnnNNnnNnnk.|..knnnnNNnnnnk..|...knnnnnnnnk...|....kknkknkk....|.....knkknk.....|....knk..knk....|....knk..knk....|...knk....knk...|...knk....knk...|....k......k....",
      "band-blau": "................|................|................|....kkk..kkk....|...kbbbkkbbbk...|..kbbbbBBbbbbk..|.kbbBbbBBbbBbbk.|..kbbbbBBbbbbk..|...kbbbbbbbbk...|....kkbkkbkk....|.....kbkkbk.....|....kbk..kbk....|....kbk..kbk....|...kbk....kbk...|...kbk....kbk...|....k......k....",
      "flagge": "................|...kkkkkkkkkk...|..kWbbbbbbBBBk..|..kWbbbbbbBBBBk.|..kWbbsssbBBBBk.|..kWbbsssbBBBBk.|..kWbbsssbBBBBk.|..kWBBBBBBBBBBk.|..kWBBBBBBBBBk..|..kWkkkkkkkkk...|..kWk...........|..kWk...........|..kWk...........|..kWk...........|..kWk...........|...k............",
      "perle": "................|................|......kkkk......|....kknnnnkk....|...knnnnnnnnk...|...knssnnnnnk...|..knnnnnnNNnnk..|..knNnnnnNNNnk..|..knNnnnkNNNnk..|..knNNNkkkNNnk..|...kNNkkkkNNk...|...knNNNNNNnk...|....kknnnnkk....|......kkkk......|................|................",
      "scheibe": "................|......kkkk......|....kkooookk....|...kooooooook...|..kooooooooook..|..kooooooooook..|.koooookkoooook.|.kookooooookOok.|.kooooooooooOok.|.kooooooooooOok.|..kOoooooooOOk..|..koOoooooOOok..|...koOOOOOOok...|....kkooookk....|......kkkk......|................",
      "kompass": "......kkkk......|.....kGGGGk.....|.....kGGGGk.....|....kkGGGGkk....|...kGGGttGGGk...|..kGGttppCtGGk..|..kGtppprpCtGk..|.kGGtppprpCtGGk.|.kGtppprpppCtGk.|.kGtppprpppptGk.|.kGGtppCppptGGk.|..kGtpCpppptGk..|..kGGttppttGGk..|...kGGGttGGGk...|....kkGGGGkk....|......kkkk......",
      "seide": "................|................|..........k.....|......k..kRk....|.....krk.kRk.k..|.....krkkRk.krk.|....krk.kRkkrk..|....krkkRkkrrk..|...krk.kRrrrk...|...krkkRrkkrk...|..krkkkrkkrk....|..krkrrkkrk.....|.krkrkRkkrk.....|..krkRkkrk......|...k.k..k.......|................",
      "schwimmer": "................|................|................|.kkkkkkkkkkkkkk.|khhhhhhhhhhhhhhk|.kkhkkkkhkkkwwwk|.kwwwk.khk.kwWwk|.kwWwkkwwwkkwwwk|.kwwwkkwWwkkwwwk|.kwwwkkwwwkkwwwk|.kwwwkkwwwk.kkk.|..kkk.kwwwk.....|.......kkk......|................|................|................",
      "tuch": "................|................|..kkkkkkkkkkk...|.kpppppppppppk..|.kppppppppppppk.|.kppMpppppppPpk.|.kpppppppMppppk.|.kpPppppMMppppk.|.kppppppppppPpk.|.kpppppPppppppk.|..kpppppppPpppk.|...kPPPPPPPPPk..|....kkkkkkkkk...|................|................|................",
      "karten": "................|......kkkkkkkk..|.....kPPPPPPPPk.|..kkkkppppppppk.|.kppppppppppppk.|.kppppppprppppk.|.kppppppprrpppk.|.kppppppprrpppk.|.kpppppppprpppk.|.kppppppppppppk.|.kppkkppppppppk.|.kppkpppppppppk.|.kppppppppkkkk..|.kppppppppk.....|..kkkkkkkk......|................",
      "punkt": "................|................|................|................|......kkkk......|.....kcccck.....|....kcscccck....|....kcccccck....|....kcccccck....|....kcccccck....|.....kcccck.....|......kkkk......|................|................|................|................"
  };
  // Ikone nach Art und Namen raten, wenn das Ding keine „ikone“ trägt
  var RATEN = [
    [/dolch|messer/i, 'dolch'], [/krumms|säbel|saebel/i, 'saebel'], [/schwert|klinge/i, 'schwert'], [/kolben|keule|knüppel/i, 'kolben'],
    [/armbrust/i, 'armbrust'], [/bolzen|köcher|pfeil/i, 'bolzen'], [/glefe|speer|pike/i, 'glefe'],
    [/mantel|umhang/i, 'mantel'], [/flöte|pfeife/i, 'floete'], [/laute|harfe|fiedel/i, 'laute'],
    [/laterne/i, 'laterne'], [/kerze|fackel/i, 'kerze'], [/netz/i, 'netz'], [/striegel|bürste/i, 'striegel'],
    [/tinte/i, 'tinte'], [/feder/i, 'feder'], [/wachs/i, 'wachs'], [/kohle|stift|kreide/i, 'kohle'],
    [/siegelbrief|urkunde/i, 'siegel'], [/karte/i, 'karte'], [/schlüssel/i, 'schluessel'], [/kompass/i, 'kompass'],
    [/blaues band/i, 'band-blau'], [/band/i, 'band'], [/flagge|banner|wimpel/i, 'flagge'], [/perle|stein\b|edelstein/i, 'perle'],
    [/scheibe/i, 'scheibe'], [/seide|faser/i, 'seide'], [/schwimmer/i, 'schwimmer'], [/münz|beutel mit/i, 'beutel'],
    [/aal|fisch/i, 'fisch'], [/schlauch|wasser/i, 'schlauch'], [/schlamm|salbe|schale/i, 'schale'], [/kraut|kräuter/i, 'kraut'],
    [/tuch|leinen/i, 'tuch'], [/wetzstein|schleifstein/i, 'werkzeug'], [/rucksack|tasche/i, 'rucksack']
  ];
  var ARTIKONE = {
    waffe: 'schwert', ruestung: 'ruestung', kleidung: 'kleidung', kostuem: 'kostuem', instrument: 'laute', werkzeug: 'werkzeug',
    schreibzeug: 'feder', licht: 'kerze', seil: 'seil', behaelter: 'rucksack', schlafzeug: 'decke', tierbedarf: 'striegel', boot: 'boot',
    ration: 'ration', proviant: 'schlauch', trank: 'trank', papier: 'rolle', brief: 'brief', karte: 'karte',
    zeichen: 'band', andenken: 'flagge', fund: 'perle', wertsache: 'beutel', spiel: 'karten', sonstiges: 'punkt'
  };
  // Arten, bei denen der Name die Ikone nicht ändern soll (ein Hanfseil bleibt ein Seil)
  var FEST = { seil: 1, ruestung: 1, boot: 1, ration: 1, spiel: 1, kostuem: 1, schlafzeug: 0 };
  function ikoneVon(d) {
    if (d.ikone && IKONEN[d.ikone]) return d.ikone;
    if (!FEST[d.art]) for (var i = 0; i < RATEN.length; i++) if (RATEN[i][0].test(d.name || '')) return RATEN[i][1];
    return ARTIKONE[d.art] || 'punkt';
  }
  var pixelCache = {}, benutzt = {};
  // Jede Ikone steht einmal als <symbol> im Tisch; die Zeilen verweisen nur darauf
  function pixel(name) {
    if (!IKONEN[name]) name = 'punkt';
    benutzt[name] = true;
    return '<svg class="gpPx" viewBox="0 0 16 16" width="32" height="32" aria-hidden="true"><use href="#gpx-' + name + '"/></svg>';
  }
  function symbol(name) {
    if (pixelCache[name]) return pixelCache[name];
    var z = (IKONEN[name] || IKONEN.punkt).split('|'), wege = {}, s = '';
    // Je Farbe ein Pfad aus waagrechten Streifen
    z.forEach(function (r, y) {
      var x = 0;
      while (x < r.length) {
        var c = r[x], n = 1;
        while (x + n < r.length && r[x + n] === c) n++;
        if (c !== '.') wege[c] = (wege[c] || '') + 'M' + x + ' ' + y + 'h' + n + 'v1h-' + n + 'z';
        x += n;
      }
    });
    Object.keys(wege).forEach(function (c) { s += '<path fill="' + FARBEN[c] + '" d="' + wege[c] + '"/>'; });
    return (pixelCache[name] = '<symbol id="gpx-' + name + '" viewBox="0 0 16 16" shape-rendering="crispEdges">' + s + '</symbol>');
  }

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Inventar',
    wurzel: 'inventar',
    felder: {
      inventar: { titel: 'text', stand: 'text', figur: 'text', geld: 'geld', esser: 'zahl', traeger: 'traeger[]' },
      geld: { pm: 'zahl', ga: 'zahl', em: 'zahl', sm: 'zahl', km: 'zahl' },
      traeger: { id: 'id', name: 'text', namen: 'text[]', art: 'traegerart', staerke: 'zahl', faktor: 'zahl', ort: 'text', dinge: 'ding[]' },
      ding: { name: 'text', namen: 'text[]', art: 'dingart', ikone: 'ikone', anzahl: 'zahl', kg: 'zahl',
        angriff: 'text', schaden: 'text', zweihand: 'text', reichweite: 'text', rk: 'zahl', merkmale: 'text[]',
        vorrat: 'zahlen', einheit: 'text', wirkung: 'text', zustand: 'text',
        notiz: 'text', herkunft: 'text', quelle: 'text', wortlaut: 'text', glossar: 'text' }
    },
    wahl: { traegerart: Object.keys(TRAEGERART), dingart: Object.keys(DINGART), ikone: Object.keys(IKONEN) },
    pflicht: { inventar: ['titel', 'stand', 'traeger'], geld: [], traeger: ['id', 'name', 'art'], ding: ['name', 'art'] },
    // Werte, deren Zahlen im Spielstand stehen müssen, prüft der Wortschatz mit (jede Zahl in einem Text)
    // Namen, die wörtlich (oder in einer Schreibweise aus „namen“) im Spielstand stehen müssen
    namen: { traeger: 'name', ding: 'name' },
    // Texte, die eine Stelle im Spielstand belegen muss (Anteil der Inhaltswörter)
    belege: { ding: { notiz: 0.7, herkunft: 0.7, wortlaut: 0.9 } },
    // Felder, die eine Person oder Quelle nennen; sie muss im Spielstand vorkommen
    quellen: { ding: ['quelle', 'glossar'] }
  };

  /* ---------- Hilfen ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function zahl(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function kg(n) {
    var r = Math.round(n * 10) / 10;
    return String(r).replace('.', ',') + ' kg';
  }
  function ikon(name, gr) {
    return '<i class="ti ti-' + name + '" aria-hidden="true"' + (gr ? ' style="font-size:' + gr + 'px"' : '') + '></i>';
  }
  function anzahlVon(d) { return d.anzahl == null ? 1 : Math.max(0, zahl(d.anzahl, 1)); }
  function gewicht(d) { return zahl(d.kg) * anzahlVon(d); }
  function vorratText(d) {
    var v = d.vorrat;
    if (!Array.isArray(v) || !v.length) return '';
    return v[0] + (v.length > 1 ? '/' + v[1] : '') + (d.einheit ? (d.einheit === 'm' ? ' m' : ' ' + d.einheit) : '');
  }
  // Der eine Wert, der rechts in der Zeile steht, wie die Haltbarkeit im Taktikspiel
  function hauptwert(d) {
    var v = vorratText(d);
    if (v) return v;
    if (d.schaden) return String(d.schaden).split(' ')[0];
    if (d.rk) return 'RK ' + d.rk;
    return '';
  }
  // Werte für das Fenster beim Antippen: [Beschriftung, Wert, breit]
  function werteVon(d) {
    var w = [];
    if (d.angriff) w.push(['Angriff', d.angriff]);
    if (d.schaden) w.push(['Schaden', d.schaden]);
    if (d.zweihand) w.push(['Zweihändig', d.zweihand]);
    if (d.reichweite) w.push(['Reichweite', d.reichweite]);
    if (d.rk) w.push(['RK', String(d.rk)]);
    var v = vorratText(d);
    if (v) w.push(['Vorrat', v]);
    if (anzahlVon(d) !== 1) w.push(['Anzahl', String(anzahlVon(d))]);
    if (d.kg) w.push(['Gewicht', kg(gewicht(d))]);
    if (d.wirkung) w.push(['Wirkung', d.wirkung, true]);
    if (d.zustand) w.push(['Zustand', d.zustand, true]);
    // Nur das Gewicht allein ist kein Fenster wert: es steht schon in der Zeile
    return w.length === 1 && w[0][0] === 'Gewicht' ? [] : w;
  }
  function grenzen(t) {
    if (!t.staerke) return null;
    var f = zahl(t.faktor, 1) || 1, s = zahl(t.staerke) * f;
    return [s * 2.5, s * 5, s * 7.5];
  }
  function lastStufe(w, g) {
    if (!g) return '';
    if (w > g[2]) return 'zu schwer';
    if (w > g[1]) return 'schwer belastet';
    if (w > g[0]) return 'belastet';
    return 'unbelastet';
  }

  /* ---------- Zeichnen ---------- */
  function muenzenSvg(art, n) {
    var m = MUENZEN.filter(function (x) { return x[0] === art; })[0], k = Math.max(1, Math.min(6, Math.ceil(Math.log(n + 1) / Math.log(2.2)))), s = '';
    for (var i = 0; i < k; i++) {
      var y = 30 - i * 4.2;
      s += '<ellipse cx="17" cy="' + y + '" rx="13" ry="5" fill="' + m[4] + '" stroke="' + m[3] + '" stroke-width="1.4"/>';
    }
    var top = 30 - (k - 1) * 4.2;
    s += '<ellipse cx="17" cy="' + top + '" rx="8" ry="2.6" fill="none" stroke="' + m[3] + '" stroke-width="1"/>';
    return '<svg viewBox="0 0 34 38" width="30" height="34" aria-hidden="true">' + s + '</svg>';
  }
  function lastSvg(w, g) {
    var B = 300, max = g[2], x = function (v) { return Math.max(0, Math.min(B, v / max * B)); };
    var s = '<svg viewBox="-6 0 ' + (B + 12) + ' 40" width="100%" preserveAspectRatio="none" aria-hidden="true" style="display:block;height:40px">';
    s += '<rect x="0" y="12" width="' + x(g[0]) + '" height="8" fill="var(--gpW1)"/>';
    s += '<rect x="' + x(g[0]) + '" y="12" width="' + (x(g[1]) - x(g[0])) + '" height="8" fill="var(--gpW2)"/>';
    s += '<rect x="' + x(g[1]) + '" y="12" width="' + (B - x(g[1])) + '" height="8" fill="var(--gpW3)"/>';
    s += '<rect x="0" y="12" width="' + x(w) + '" height="8" fill="var(--ink)" opacity="0.78"/>';
    s += '<path d="M0 12V20M' + B + ' 12V20M' + x(g[0]) + ' 9V23M' + x(g[1]) + ' 9V23" stroke="var(--ink)" stroke-width="1.4" fill="none"/>';
    s += '<path d="M' + x(w) + ' 10l-4.5 -7h9z" fill="var(--rot)"/>';
    s += '</svg>';
    return s;
  }
  function zeichne(D) {
    benutzt = {};
    var traeger = (D.traeger || []).filter(function (t) { return t && t.name; });
    var h = '';
    h += '<div class="gpKopf"><p class="gpT">' + esc(D.titel || 'Gepäck') + '</p>' + (D.stand ? '<p class="gpS">' + esc(D.stand) + '</p>' : '') + '</div>';

    // Geldbeutel
    var G = D.geld || {}, muenzen = MUENZEN.filter(function (m) { return zahl(G[m[0]]) > 0; });
    if (muenzen.length || D.geld) {
      var wert = 0;
      MUENZEN.forEach(function (m) { wert += zahl(G[m[0]]) * WERT[m[0]]; });
      h += '<div class="gpBlock"><p class="gpH">' + ikon('coins', 18) + 'Geldbeutel</p><div class="gpMz">';
      if (!muenzen.length) h += '<p class="gpLeer">leer</p>';
      muenzen.forEach(function (m) {
        var n = zahl(G[m[0]]);
        h += '<div class="gpM">' + muenzenSvg(m[0], n) + '<span><b>' + n + '</b> ' + esc(n === 1 ? m[1] : m[2]) + '</span></div>';
      });
      h += '</div>';
      if (muenzen.length > 1) h += '<p class="gpKl">zusammen ' + String(Math.round(wert * 100) / 100).replace('.', ',') + ' Goldadmirale wert</p>';
      h += '</div>';
    }

    // Rationen
    var rat = [], summe = 0;
    traeger.forEach(function (t) {
      var n = 0;
      (t.dinge || []).forEach(function (d) { if (d && d.art === 'ration') n += anzahlVon(d); });
      if (n) rat.push({ t: t, n: n });
      if (t.art !== 'lager') summe += n;
    });
    if (rat.length) {
      var esser = Math.max(1, zahl(D.esser, 1));
      h += '<div class="gpBlock"><p class="gpH">' + ikon('baguette', 18) + 'Rationen</p><div class="gpRat">';
      rat.forEach(function (r) {
        var brote = '';
        for (var i = 0; i < Math.min(r.n, 8); i++) brote += pixel('ration').replace('class="gpPx"', 'class="gpPxK"');
        h += '<span class="gpRz"><span class="gpBrot">' + brote + (r.n > 8 ? '<small>+' + (r.n - 8) + '</small>' : '') + '</span>' +
          '<span>' + r.n + ' ' + (r.t.art === 'figur' ? 'dabei' : r.t.art === 'lager' ? esc(r.t.name.replace(/^In /, 'in ')) : 'bei ' + esc(r.t.name)) + '</span></span>';
      });
      h += '</div><p class="gpKl">' + (summe ? 'reicht ' + Math.floor(summe / esser) + (Math.floor(summe / esser) === 1 ? ' Tag' : ' Tage') + (esser > 1 ? ' für ' + esser + ' Esser' : '') : 'nichts zu essen im Gepäck') + '</p></div>';
    }

    // Träger
    var nr = 0;
    traeger.forEach(function (t, ti) {
      var dinge = (t.dinge || []).filter(function (d) { return d && d.name; });
      var g = t.art === 'lager' ? null : grenzen(t), w = 0;
      dinge.forEach(function (d) { w += gewicht(d); });
      var zu = t.art === 'lager', inhalt = 'gpInh' + ti;
      h += '<section class="gpTr" aria-label="' + esc(t.name) + '"><div class="gpTk">' + ikon(TRAEGERART[t.art] || 'user', 22) +
        '<div style="flex:1;min-width:0"><p class="gpTn">' + esc(t.name) + '</p><p class="gpKl">' +
        (zu ? 'nicht im Gepäck · ' + dinge.length + (dinge.length === 1 ? ' Ding' : ' Dinge') + (t.ort ? ' · ' + esc(t.ort) : '') : 'trägt ' + kg(w) + (g ? ' · ' + lastStufe(w, g) : '') + (t.ort ? ' · ' + esc(t.ort) : '')) +
        '</p></div>' + (zu ? '<button type="button" class="gpK gpAuf" aria-expanded="false" aria-controls="' + inhalt + '">zeigen</button>' : '') + '</div>' +
        '<div id="' + inhalt + '"' + (zu ? ' hidden' : '') + '>';
      if (g) {
        h += '<div class="gpLast">' + lastSvg(w, g) + '<div class="gpLz"><span>0</span><span style="left:' + (g[0] / g[2] * 100) + '%">' + Math.round(g[0]) + '</span>' +
          '<span style="left:' + (g[1] / g[2] * 100) + '%">' + Math.round(g[1]) + '</span><span style="left:100%">' + Math.round(g[2]) + ' kg</span></div></div>';
      }
      GRUPPEN.forEach(function (gr) {
        var ds = dinge.filter(function (d) { return (DINGART[d.art] || DINGART.sonstiges)[1] === gr[0]; });
        if (!ds.length) return;
        h += '<p class="gpG">' + gr[1] + '</p><ul class="gpL">';
        ds.forEach(function (d) {
          var n = anzahlVon(d), id = 'gp' + ti + '-' + (nr++), werte = werteVon(d), mehr = werte.length || d.wortlaut || d.glossar;
          h += '<li><button type="button" class="gpZ" data-i="' + id + '"' + (mehr ? ' aria-expanded="false" aria-controls="' + id + '"' : ' disabled') + '>' +
            '<span class="gpIk">' + pixel(ikoneVon(d)) + (n !== 1 ? '<b class="gpAnz">' + n + '</b>' : '') + '</span>' +
            '<span class="gpN">' + esc(d.name) + (d.zustand ? '<small class="gpZu">' + esc(d.zustand) + '</small>' : '') + '</span>' +
            '<span class="gpF"></span><span class="gpH1">' + esc(hauptwert(d)) + '</span><span class="gpW">' + (d.kg ? kg(gewicht(d)) : '–') + '</span></button>';
          if (mehr) {
            h += '<div class="gpD" id="' + id + '" hidden>';
            if (werte.length) {
              h += '<dl class="gpSt">';
              werte.forEach(function (w) { h += '<div' + (w[2] ? ' class="gpBreit"' : '') + '><dt>' + w[0] + '</dt><dd>' + esc(w[1]) + '</dd></div>'; });
              h += '</dl>';
            }
            if (d.merkmale && d.merkmale.length) h += '<p class="gpMm">' + d.merkmale.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</p>';
            if (d.wortlaut) h += '<details class="gpWl"><summary>Wortlaut</summary><blockquote>' + esc(d.wortlaut) + '</blockquote></details>';
            if (d.glossar) h += '<button type="button" class="gpK" data-glossar="' + esc(d.glossar) + '">Glossar ' + esc(d.glossar) + ' ↗</button>';
            h += '</div>';
          }
          h += '</li>';
        });
        h += '</ul>';
      });
      if (!dinge.length) h += '<p class="gpLeer">nichts</p>';
      h += '</div></section>';
    });
    var defs = Object.keys(benutzt).map(symbol).join('');
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + defs + '</defs></svg>' + h;
  }

  var CSS = [
    '.gp{--pg:#efe2c3;--ink:#3b3028;--ink2:#5a4a3a;--rot:#8e3b22;--rahmen:#8b6d45;--linie:rgba(59,48,40,.28);--gpW1:rgba(93,106,58,.22);--gpW2:rgba(147,121,58,.30);--gpW3:rgba(142,59,34,.24);',
    'background:var(--pg);color:var(--ink);border:3px solid var(--rahmen);border-radius:14px;padding:5px;font-family:"EB Garamond",Garamond,Georgia,serif;font-size:17px;line-height:1.45}',
    '[data-mode="dark"] .gp{--pg:#d8c9a3}',
    '@media (prefers-color-scheme:dark){:root:not([data-mode]) .gp{--pg:#d8c9a3}}',
    '.gp p{margin:0}.gp [hidden]{display:none!important}',
    '.gpIn{border:1px solid var(--rahmen);border-radius:9px;padding:14px 16px 10px;display:flex;flex-direction:column;gap:14px}',
    '.gpT{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:27px;line-height:1.1}',
    '.gpS,.gpKl{font-style:italic;color:var(--ink2)}',
    '.gpS{font-size:17px}.gpKl{font-size:15px}',
    '.gpBlock{display:flex;flex-direction:column;gap:6px}',
    '.gpH{display:flex;align-items:center;gap:7px;font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:19px}',
    '.gpMz{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpM{display:flex;align-items:flex-end;gap:6px}.gpM b{font-weight:600;font-size:19px}',
    '.gpRat{display:flex;flex-wrap:wrap;gap:6px 18px}',
    '.gpRz{display:inline-flex;align-items:center;gap:6px}',
    '.gpBrot{display:inline-flex;gap:1px;color:var(--ink)}.gpBrot small{font-size:13px;margin-left:3px}',
    '.gpTr{border-top:1.5px solid var(--rahmen);padding-top:12px;display:flex;flex-direction:column;gap:4px}',
    '.gpTk{display:flex;align-items:center;gap:10px}',
    '.gpTn{font-family:"IM Fell English","EB Garamond",Georgia,serif;font-size:22px;line-height:1.15}',
    '.gpLast{position:relative;padding-bottom:16px;margin:2px 4px 4px}',
    '.gpLz{position:absolute;left:0;right:0;bottom:0;height:16px;font-size:13px;font-style:italic;color:var(--ink2)}',
    '.gpLz span{position:absolute;transform:translateX(-50%);white-space:nowrap}.gpLz span:first-child{transform:none}.gpLz span:last-child{transform:translateX(-100%)}',
    '.gpG{font-style:italic;font-size:15px;color:var(--rot);margin-top:6px!important}',
    '.gpL{list-style:none;margin:0;padding:0}',
    '.gp button.gpZ{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:baseline;gap:8px;padding:3px 4px;border-radius:5px;cursor:pointer;color:var(--ink);font-family:inherit;font-size:17px;line-height:1.4}',
    '.gp button.gpZ:disabled{cursor:default}',
    '.gp button.gpZ:not(:disabled):hover{background:rgba(59,48,40,.07)}',
    '.gp button.gpZ:focus-visible,.gp .gpK:focus-visible{outline:2px solid var(--rot);outline-offset:1px}',
    '.gp button.gpZ[aria-expanded="true"]{background:rgba(142,59,34,.09)}',
    '.gp button.gpZ{align-items:center}',
    '.gpIk{position:relative;flex-shrink:0;width:36px;height:36px;display:grid;place-items:center;border-radius:6px;background:linear-gradient(180deg,#3a4a6e,#26304d);box-shadow:inset 0 0 0 1px #8fa3cf,0 0 0 1px #141a2b}',
    '.gpPxK{display:block;width:22px;height:22px}',
    '.gpPx{display:block;width:32px;height:32px;image-rendering:pixelated}',
    '.gpAnz{position:absolute;right:-4px;bottom:-5px;min-width:15px;padding:0 3px;box-sizing:border-box;font:700 12px/15px ui-monospace,Menlo,Consolas,monospace;color:#fff;background:#26304d;border:1px solid #8fa3cf;border-radius:4px;text-align:center}',
    '.gpN{min-width:0;display:flex;flex-direction:column;line-height:1.2}',
    '.gpZu{font-style:italic;font-size:14px;color:var(--ink2)}',
    '.gpF{flex:1;min-width:10px;border-bottom:1.5px dotted var(--linie);align-self:center}',
    '.gpH1{white-space:nowrap;font:600 15px ui-monospace,Menlo,Consolas,monospace;color:var(--ink);letter-spacing:-.02em}',
    '.gpH1:empty{display:none}',
    '.gpW{white-space:nowrap;font-style:italic;font-size:15px;color:var(--ink2);min-width:46px;text-align:right}',
    '.gpD{margin:4px 2px 10px 48px;padding:8px 10px;border-radius:8px;background:linear-gradient(180deg,#34446a,#232c48);color:#eef2fb;box-shadow:inset 0 0 0 1px #8fa3cf,0 0 0 1px #141a2b;display:flex;flex-direction:column;gap:8px;font-size:15px}',
    '.gpSt{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:4px 18px;margin:0}',
    '.gpSt div{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid rgba(143,163,207,.35);padding-bottom:2px;min-width:0}',
    '.gpSt div.gpBreit{grid-column:1/-1;flex-direction:column;gap:0}',
    '.gpSt dt{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b9c6e6;white-space:nowrap}',
    '.gpSt dd{margin:0;font:600 15px ui-monospace,Menlo,Consolas,monospace;color:#fff;text-align:right;white-space:nowrap}',
    '.gpSt div.gpBreit dd{font:400 15px/1.35 "EB Garamond",Georgia,serif;text-align:left}',
    '.gpMm{display:flex;flex-wrap:wrap;gap:4px}.gpMm span{font-size:13px;padding:0 7px;border:1px solid #8fa3cf;border-radius:999px;color:#dfe6f7}',
    '.gpWl summary{cursor:pointer;font-size:14px;color:#b9c6e6;letter-spacing:.06em;text-transform:uppercase}',
    '.gpWl blockquote{margin:6px 0 0;padding:6px 10px;background:#efe2c3;color:#2f2519;border-radius:5px;font:italic 16px/1.45 "EB Garamond",Georgia,serif;white-space:pre-line}',
    '.gpD .gpK{color:#eef2fb;border-color:#8fa3cf}.gpD .gpK:hover{background:rgba(255,255,255,.08)}',
    '.gpD .gpK:focus-visible{outline-color:#f2c94c}',
    '.gp .gpAuf{align-self:center;flex-shrink:0}',
    '.gp .gpK{all:unset;cursor:pointer;align-self:flex-start;font-family:inherit;font-size:15px;color:var(--ink);border:1px solid var(--rahmen);border-radius:6px;padding:2px 10px}',
    '.gp .gpK:hover{background:rgba(59,48,40,.07)}',
    '.gpLeer{font-style:italic;color:var(--ink2);font-size:15px}'
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
    el.className = 'gp';
    el.innerHTML = '<style>' + CSS + '</style><div class="gpIn">' + zeichne(D) + '</div>';
    el.addEventListener('click', function (ev) {
      var t = ev.target;
      var auf0 = t.closest ? t.closest('.gpAuf') : null;
      if (auf0) {
        var ziel = document.getElementById(auf0.getAttribute('aria-controls')), offen = auf0.getAttribute('aria-expanded') !== 'true';
        auf0.setAttribute('aria-expanded', String(offen)); auf0.textContent = offen ? 'verbergen' : 'zeigen';
        if (ziel) ziel.hidden = !offen;
        return;
      }
      var g = t.closest ? t.closest('[data-glossar]') : null;
      if (g) { if (typeof sendPrompt === 'function') sendPrompt('Glossar ' + g.getAttribute('data-glossar')); return; }
      var b = t.closest ? t.closest('button.gpZ') : null;
      if (!b || b.disabled) return;
      var d = document.getElementById(b.getAttribute('data-i'));
      if (!d) return;
      var auf = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(auf));
      d.hidden = !auf;
    });
    if (typeof sendPrompt !== 'function') Array.prototype.forEach.call(el.querySelectorAll('[data-glossar]'), function (x) { x.remove(); });
  }

  function start() {
    var el = document.getElementById('gepaeck'), D = window.INVENTAR;
    if (!el || !D) return false;
    try { einbauen(el, D); } catch (err) { el.textContent = 'Das Gepäck ließ sich nicht zeichnen: ' + err.message; }
    return true;
  }

  // Zusatzprüfung für pruefen.js: Geld und Traglast mit dem Spielstand abgleichen (nur Hinweise)
  function zusatz(D, h) {
    var hinweise = [], zeilen = h.stand.split('\n');
    var NAMEN = { pm: 'highlord|pm', ga: 'goldadmiral|ga', em: 'bright ship|em', sm: 'silber|sm', km: 'common|km' };
    Object.keys(D.geld || {}).forEach(function (k) {
      var n = D.geld[k];
      if (!n || !NAMEN[k]) return;
      var re = new RegExp('(^|[^0-9])' + n + ' ?(' + NAMEN[k] + ')', 'i');
      if (!zeilen.some(function (z) { return re.test(h.norm(z)); })) hinweise.push('Geld: ' + n + ' ' + k.toUpperCase() + ' steht so nicht im Spielstand. Stimmt der Betrag?');
    });
    (D.traeger || []).forEach(function (t) {
      if (!t || t.art === 'lager' || !Array.isArray(t.dinge)) return;
      var w = 0;
      t.dinge.forEach(function (d) { if (d) w += zahl(d.kg) * anzahlVon(d); });
      var re = /rund (\d+(?:,\d+)?) kg/i, treffer = zeilen.filter(function (z) { return z.indexOf(t.name) >= 0 && re.test(z); })[0];
      if (treffer) {
        var soll = parseFloat(treffer.match(re)[1].replace(',', '.'));
        if (Math.abs(soll - w) > 1) hinweise.push('Traglast ' + t.name + ': die Dinge wiegen ' + kg(w) + ', der Spielstand sagt rund ' + kg(soll) + '.');
      }
    });
    return { hinweise: hinweise };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION };
  else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
