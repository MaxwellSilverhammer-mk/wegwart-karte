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
 * die die Figur bei sich hat, jedes mit einer Pixel-Ikone (32 × 32; besondere Stücke mit eigener im Feld pixel).
 * Die Zeile zeigt rechts den wichtigsten Wert
 * (Vorrat, Schaden, RK, Anzahl), wer ein Ding antippt, sieht seine Werte: Angriff, Schaden, Reichweite,
 * Merkmale, Vorrat, Wirkung, Zustand, bei Schriftstücken den Wortlaut. Was die Figur über ein Ding weiß
 * und woher es stammt, steht im Glossar; der Tisch zeigt notiz, herkunft und quelle nicht (seit 2.0).
 * Die Daten kommen aus dem Spielstand und werden vorher mit pruefen.js geprüft (README).
 */
(function () {
  'use strict';

  var VERSION = '2.1';

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

  /* ---------- Pixel-Ikonen (32 × 32, aus seite/pixel.js) ---------- */
  // Ein Raster sind 32 Zeilen zu 32 Zeichen, mit | verbunden: '.' durchsichtig, 'k' die Kontur, sonst eine Farbe aus
  // FARBEN. Die Sammlung steht hier; ein besonderes Stück trägt seine eigene Ikone im Feld `pixel` (Regelwerk 4.4).
  // Neu zeichnen: node seite/pixel.js (Sammlung), node seite/pixel.js --ding zeichnung.js (ein Ding).
  var FARBEN = {"0":"#717480","1":"#4a4c55","2":"#f1dfaa","3":"#d2b77a","4":"#9a7e4a","5":"#64502c","6":"#c7c0a8","7":"#9a927a","8":"#6a6452","9":"#46412f","k":"#1d1a24","a":"#f4f7fb","b":"#c3ccd9","c":"#8592ab","d":"#55607a","e":"#a9adb5","f":"#7d828c","g":"#565a63","h":"#373a41","i":"#e08a4a","j":"#b0592a","l":"#7a3518","m":"#fff4b0","n":"#f5cc4a","o":"#c8911c","p":"#8a5b10","q":"#e3a96c","r":"#b5743c","s":"#80491f","t":"#542c10","u":"#9a6a48","v":"#6e4528","w":"#4a2c18","x":"#d8925a","y":"#a8642f","z":"#76411c","A":"#4f2810","B":"#fffaea","C":"#efe2c2","D":"#cdb98e","E":"#9c8862","F":"#ff8a6a","G":"#da4630","H":"#9a2618","I":"#62140c","J":"#9cc4f5","K":"#5a8ad6","L":"#2f5aa2","M":"#1c3466","N":"#b6e38a","O":"#6cb255","P":"#38773a","Q":"#1f4a26","R":"#fff59a","S":"#f2d64a","T":"#c4a32a","U":"#fffcec","V":"#ecdfba","W":"#c2b087","X":"#8c7c5a","Y":"#d6d8df","Z":"#a6a9b5","!":"#a6efe4","#":"#4cb8b0","$":"#25807c","%":"#14504e","&":"#fffde0","(":"#ffe25a",")":"#ffa22e","*":"#e0581c","+":"#5a6a9a",",":"#36406a","-":"#1f2540","/":"#6a5a4c",":":"#40352c",";":"#26201b","<":"#d9b8ff","=":"#9a6ae0",">":"#5e3aa0","?":"#f0b860","@":"#b97a2c","[":"#6e4214","]":"#ffffff"};
  var IKONEN = {
    "schwert": "................................|................................|...........................kk...|.........................kkabk..|........................kaabdk..|.......................kabbck...|......................kabcbdk...|.....................kabcbdk....|....................kabcbdk.....|...................kabcbdk......|..................kabcbdk.......|.................kabcbdk........|................kabcbdk.........|...............kabcbdk..........|.....k........kabcbdk...........|....knk......kabcbdk............|...kmnok....kabcbdk.............|..knnnpk...kabcbdk..............|...kppnnk.kabcbdk...............|....kknnnkabbbdk................|......knnnbbbdk.................|.......knnnbdk..................|.......kxnnnk...................|......kxAynnnk..................|.....kxyyyznnnkk................|..kkkxAyyAkknnmnk...............|.kmmoyyyAk..kmmnpk..............|km]mnpxAk...knook...............|knmnopzk.....kpk................|knnoppk.......k.................|.kpppk..........................|..kkk...........................",
    "dolch": "................................|................................|................................|................................|..........................k.....|.......................kkkbk....|......................kaabk.....|.....................kabbck.....|....................kabbbdk.....|...................kabcbdk......|..................kabcbdk.......|.................kabcbdk........|................kabcbdk.........|...............kabcbdk..........|.........k....kabcbdk...........|........kmk..kabcbdk............|.......kmnnkkabcbdk.............|.......knnnnabcbdk..............|........knnnnbbdk...............|.........knnnnck................|.........kunnnnk................|........kuvwnnnnk...............|......kkuvwkknnpk...............|.....kmnvwk..kok................|....kmmnok....k.................|....knnopk......................|....koopk.......................|.....kkk........................|................................|................................|................................|................................",
    "saebel": "................................|.............................k..|............................kak.|...........................kack.|...........................kadk.|...........................kbk..|..........................kack..|..........................kadk..|.........................kcck...|........................kacdk...|........................kcck....|.......................kccdk....|......................kccdk.....|.....................kacck......|...................kkacbdk......|..................kaaccdk.......|.......k........kkabcbdk........|......kmk.....kkaaccbdk.........|.....kmnnkkkkkaabccbdk..........|....kmoonnaaaabccbbdk...........|...kmpkknnnbbcccbcdk............|..kmok..knnnbbbcdkk.............|..kmpk..kqnnnbdkk...............|.kmok..kqsbnnnk.................|.kmok.kqrtkknpk.................|.kmokkqrtk..kk..................|.knokqrtk.......................|..k]mosk........................|.knmnok.........................|..koopk.........................|...kkk..........................|................................",
    "axt": ".................kkkk...........|...............kkeeefk..........|..............keaaaaaak.........|.............kaaafffgk..........|............kaafffffgk..........|...........kaaffffffgk..........|...........kefffffffgk.k........|..........keffffffffffkqk.......|..........kefffffffffffqrk......|..........keffffffffffgrrsk.....|..........kfgggggfffffffsk......|...........kkkkkkfffffffgk......|.................kfgfffhk.......|................kqqrffhk........|...............kqrrrsgk.........|..............kqrrrtkk..........|.............kqrrrtk............|............kqrrrtk.............|...........kqrtrtk..............|..........kqrrrtk...............|.........kqrrrtk................|........kqrrrtk.................|.......kqrrrtk..................|......kqrtrtk...................|.....kqrrrtk....................|....kqrrrtk.....................|...kqrrrtk......................|..kqrrrtk.......................|..krrrtk........................|...krtk.........................|....kk..........................|................................",
    "kolben": ".....................k..........|....................kek.........|....................kfk.........|...................keffk........|...................kefgk........|..................keffffkkkkk...|.................ke]]effgeeefk..|................ke]]]efffgffhk..|................ke]]eeffggfhk...|...............kfeeeefffgghk....|...............kfffffffgghhk....|...............kgfffffggghhk....|..............kefffffggghhffk...|.............keffggggghhhhfffk..|.............keffghhhhhhhggghk..|.............keefvkfhhhhkkkkk...|............kfffghkkefgk........|............kugghk.kffhk........|...........kuvwhk...kfk.........|..........kuvwkk....kgk.........|.........kuvwk.......k..........|.......kkuvwk...................|......kxuvwk....................|.....kxAywk.....................|....kxyyyzk.....................|...kxAyyAk......................|..kxyyyAk.......................|...kxyAk........................|...kyAk.........................|....kk..........................|................................|................................",
    "keule": "................................|................................|.......................kkk......|.....................kkqqrkk....|....................kqqrrrqrk...|...................kqrrrrqrsk...|..................kqrrrrtrrrrk..|..................kqtrrrrrrrsk..|.................kqrrrrrrrrrtk..|................kqrrrrrrrrrsk...|...............kqrrrrrrrrrrtk...|..............kqrrrrrrqrrstk....|.............kqrrrrrrtrrtkk.....|............kqrrrrqrrrrtk.......|............kqrrrtrrrstk........|...........kqrrrrrrrtkk.........|..........kqrrrrrrrtk...........|.........kqrrrrrrstk............|........kqrrrrtrtkk.............|........kqrrrrrtk...............|.......kqrrrrrtk................|......kqrrrrstk.................|.....kqrrrrtkk..................|.....kqrrrtk....................|....kqrrrtk.....................|...kqrrrtk......................|..kqrrrtk.......................|..krsstk........................|...kkkk.........................|................................|................................|................................",
    "speer": "................................|.............................k..|..........................kkkbk.|........................kkaack..|.......................kaabcck..|......................kabbcbdk..|.....................kabbcbck...|.....................kabcbbdk...|....................kkacbbdk....|...................k23cccdk.....|..................k2333kkk......|.................k23335k........|.................kq335k.........|................kqrs4k..........|...............kqrtkk...........|..............kqrtk.............|.............kqrtk..............|............kqrtk...............|...........kqrtk................|..........kqrtk.................|.........kqrtk..................|........kqrtk...................|.......kqrtk....................|......kqrtk.....................|.....kqrtk......................|....kqrtk.......................|...kqrtk........................|..kqrtk.........................|.kqrtk..........................|..ksk...........................|...k............................|................................",
    "glefe": "................................|.......................kkkkkkk..|.....................kkaaaaaack.|...................kkaaaabbbck..|..................kaaabbbbbbck..|.................kaabbbbbbbbdk..|................kaabbbbbbbbdk...|...............kaabbbbbbbbdk....|..............kaaabbbbbbbck.....|..............kakabbbbbbbck.....|...............kabbbbbbccdk.....|................kbcbbbdkkk......|................kmnbbdk.........|...............kmnnnck..........|...............knnnpk...........|..............kqrnpk............|.............kqrtkk.............|............kqrtk...............|...........kqrtk................|..........kqrtk.................|.........kqrtk..................|........kqrtk...................|.......kqrtk....................|......kqrtk.....................|.....kqrtk......................|....kqrtk.......................|...kqrtk........................|..kqrtk.........................|.kqrtk..........................|..ksk...........................|...k............................|................................",
    "bogen": "................................|................................|................................|......kkkkkkkkkk................|.....kqqqqqqqqqrkkk.............|.....kVsssssssrrqqrkk...........|......k2kkkkkkrssrrqrkk.........|.......k2k....kkkrsrtxyk........|........k2k......kksxyyyk.......|.........k2k.......kyyyyzk......|..........k2k.......kyyAqk......|...........k2k.......kzqrrk.....|............k2k.......krrsk.....|.............k2k.......kqsk.....|..............k2k......kqrrk....|...............k2k.....krrsk....|................k2k.....kqsk....|.................k2k....kqsk....|..................k2k...kqsk....|...................k2k..kqsk....|....................k2k.kqsk....|.....................k2kkqsk....|......................k2kqsk....|.......................k2qsk....|........................krtk....|.........................kVk....|..........................k.....|................................|................................|................................|................................|................................",
    "armbrust": "................................|................................|................................|..............kkk...............|.............kaabkk.......k.....|.............kb2babk.....kak....|..............k2bbbbkk..kbk.....|..............k2kbcbabkkbk......|...............k2kkbbbbbk.......|...............k2k.kbbbbk.......|...............k2kkqrbbbbk......|...............k2kqrbrbbck......|...............k2qrbrtkbbbk.....|...............kq2brtk.kbbbk....|..............kqrbrtk...kack....|.............kqrr222kkkkkbbbk...|............kqrrrtkk22222kack...|...........kqrrrtk..kkkkk222k...|..........kqrrrtk........kkk....|.........kqrrrtk................|........kqrrrtk.................|.......kqrrrtk..................|......kqrsstk...................|.....kqrtegk....................|....kqrtehk.....................|...kqrsehk......................|..kqrrtsk.......................|.kqrrttk........................|..krrtk.........................|...ksk..........................|....k...........................|................................",
    "bolzen": "................................|.............................k..|..........................kkkfk.|.........................keefk..|........................keffgk..|.......................kefffhk..|......................kefffhk...|.....................kefffhk....|....................kefffhk.....|....................kqffhk......|...................kqrsgk.......|..................kqrtkk........|.................kqrtk..........|................kqrtk...........|...............kqrtk............|..............kqrtk.............|.............kqrtk..............|............kqrtk...............|...........kqrtk................|..........kqrtk.................|.........kqrtk..................|........kqrtk...................|.....kkkqrtk....................|....kGBCrtk.....................|.....kCDFk......................|....kqrDHk......................|...kqstkCk......................|....kkk.k.......................|................................|................................|................................|................................",
    "koecher": "...................k............|............k.....kGk...........|...........kGk...kGkBk..kk......|..........kGrBk..krkk..kqGk.....|...........kqrk..krk...kGkBk....|...........krsk..krk..kqtkk.....|............kqrk.krk..krk.......|............krsk.krk.kqtk.......|.............krkkkrk.krk........|.............ksxxyskkqtk........|............k.kxzzzxyskk........|...........k2kkzzzzzzzxyk.......|...........k33xzyzzzzzzzk.......|............k333yyyyzzzk........|.............kx33yyyyyAk........|............kxyy33yyyzk.........|............kxyyz33yyzk.........|............kxyzyy33xAk.........|...........kxyyzyyy3zk..........|...........kxyyzyyz33k..........|...........kxyyzyyyy3k..........|..........kxyyzyyyyz3k..........|..........kxyyzyyyyz23k.........|..........kxyyzyyyyz25k.........|..........kxyyzyyyyA3k..........|.........kxyyzyyyyzk3k..........|.........kxyyzyyyyz25k..........|.........kxyyyyyyyA3k...........|.........kyzzyyyyz25k...........|..........kkkyzzzz4k............|.............kkkkzk.............|.................k..............",
    "schild": "................................|............kkkkkkkk............|.........kkkeeeeeeefkkk.........|........keeefgggaggfeefk........|......kkefgghqqqqqrfggffkk......|.....keefhsqqrrrsrrqqrsfefk.....|....keffhqsrrrrrsrrrrrsffffk....|....kefaqrsrrrrrsrrrrrsrfagk....|...kefhqrrsrrrrrsrrrrrsrrfffk...|..kefhqrrrsrrrrrsrrrrrsrrrfffk..|..kegqrrrrsrrrrssrrrrrsrrrregk..|..kegqrrrrsrrstffrsrrrsrrrsegk..|.kefhqrrrrsrte]eefgrrrsrrrsfffk.|.kegqrrrrrsse]]eeffgqrsrrrrregk.|.kegqrrrrrste]eefffgrrsrrrrsegk.|.kegqrrrrrsfeeefffgghqsrrrrsegk.|.keaqrrrrrsffffffgghhqsrrrrseak.|.kegqrrrrrsrffffgghhqrsrrrrsegk.|.kegrrrrrrssggggghhhqrsrrrrtegk.|.kfffqrrrrsrrhhhhhhqrrsrrrsefhk.|..kegqrrrrsrrqrhhqqrrrsrrrsegk..|..kegrrrrrsrrrrqsrrrrrsrrrtegk..|..kfffrrrrsrrrrrsrrrrrsrrtefhk..|...kfffrrrsrrrrrsrrrrrsrtefhk...|....keffrrsrrrrrsrrrrrstefgk....|....kffafrsrrrrrsrrrrrsefahk....|.....kfgffsssrrrsrrsstsfghk.....|......kkffsefrssssteeeshkk......|........kfggfeeeeeefgghk........|.........kkkfgggagghkkk.........|............kkkkkkkk............|................................",
    "ruestung": "................................|................................|................................|.......kkkkkk......kkkkkk.......|......kxxxxxyk....kxxxxxyk......|.....kxyyyyyyyk..kxyyyyyyyk.....|....kxyyyyyyyyykkxyyyyyyyyyk....|...kxyyyyyyyyyyxxyyyyyyyyyyyk...|..kxyyyyyyyyyyyyyyyyyyyyyyyyyk..|..kxymyyyyyyyyyyAyyyyyyyyyymzk..|..kxyypyyyyyyyyyAyyyyyyyyyyypk..|..kxyyyyyymyymyyAyymyymyyyyyzk..|..kxymyyyyypyypyAyyypyypyyymzk..|..kyzzpyyyyyyyyyAyyyyyyyyzzzpk..|...kkkkxyyyyyyyyAyyyyyyyzkkkk...|......kxyymyymyyAyymyymyzk......|......kxyyypyypyAyyypyypzk......|......kxyyyyyyyyAyyyyyyyzk......|......kxyymyyyyyAyyyyymyzk......|......kxyyypyyyzAzyyyyypzk......|......kyzzzzzzAmmnyzzzzzAk......|......kuuuuuuuvmnouuuuuuuvk.....|......kvwwwwwwwmnovwwwwwwwk.....|......kxxxxxxxynopxxxxxxyk......|......kxyyyyyyyxAxyyyyyyzk......|......kxyymyymyyAyymyymyzk......|......kxyyypyypyAyyypyypzk......|......kxyyyyyyyyAyyyyyyyzk......|......kyzzzzzzzzAzzzzzzzAk......|.......kkkkkkkkkkkkkkkkkk.......|................................|................................",
    "kettenhemd": "................................|................................|................................|.......kkkkkk.....kkkkkk........|......keeeeefk...keeeeefk.......|.....keefhfefhk.khfefhfefk......|....keefhfefhfekhfefhfefhfk.....|...keefhfefhfefhfefhfefhfefk....|..keefhfefhfefhfefhfefhfefhfk...|..kefhfefhfefhfefhfefhfefhfefk..|..kehfefhfefhfefhfefhfefhfefhk..|..khfefhfefhfefhfefhfefhfefhgk..|..keefhfefhfefhfefhfefhfefhfek..|..kefhfefhfefhfefhfefhfefhfegk..|..kehfefhfefhfefhfefhfefhfefhk..|..khgeghfefhfefhfefhfefhfeghhk..|...kkkkeefhfefhfefhfefhfekkkk...|......kefhfefhfefhfefhfegk......|......kehfefhfefhfefhfefhk......|......khfefhfefhfefhfefhgk......|......keefhfefhfefhfefhfek......|......kefhfefhfefhfefhfegk......|......kehfefhfefhfefhfefhk......|......khfefhfefhfefhfefhgk......|......keefhfefhfefhfefhfek......|......kefhfefhfefhfefhfegk......|......kfhgeghgeghgeghgeghk......|......kxxxxxxxxxxxxxxxxxxyk.....|......kyzzzzzzzzzzzzzzzzzAk.....|.......kkkkkkkkkkkkkkkkkkk......|................................|................................",
    "kleidung": "................................|................................|..........kkk.....kkkk..........|.........kJJKk...kJJJKk.........|.......kkJKKKMk.kJKMKKKkk.......|......kJJKKKKKMkJKMKKKKJKk......|.....kJKKKKKKKKMKMKKKKKKKKk.....|...kkJKKKKKKKKKMKMKKKKKKKKKkk...|..kJJKKKKKKKKKKKMKKKKKKKKKKJKk..|..kJKKKKKKKKKKKKLKKKKKKKKKKKLk..|..kJKKKKKKKKKKKKLKKKKKKKKKKKLk..|..kKKKKKKKKKKKKKLKKKKKKKKKKKMk..|...kJKKKKKKKKKKKLKKKKKKKKKKLk...|...kJKKLKKKKKKKKLKKKKKKKLKKLk...|...kKKMkJKKKKKKKLKKKKKKLkKKMk...|....kLkkJKKKKKKKLKKKKKKLkkLk....|.....k.kJKKKKKKKLKKKKKKLk.k.....|.......kJKKKKKLLLLKKKKKLk.......|.......kKLLLLMmmmnKLLLLMk.......|.......kxxxxxymnnoxxxxxxyk......|.......kyzzzzAmnnoyzzzzzAk......|.......kJJJJJKnoopJJJJJKk.......|.......kJKKKKKJJJJKKKKKLk.......|.......kJKKKKKKKKKKKKKKLk.......|.......kJKKKKKKKKKKKKKKLk.......|.......kJKKKKKKKKKKKKKKLk.......|.......kJKKKKKKKKKKKKKKLk.......|.......kJKKKKKKKKKKKKKKLk.......|.......kKLLLLLLLLLLLLLLMk.......|........kkkkkkkkkkkkkkkk........|................................|................................",
    "mantel": "................................|...............kk...............|..............kYZk..............|............kkYZZZkk............|...........kYYZZZZYZk...........|..........kYZZZZZZZZZk..........|.........kYZZZZ11ZZZZZk.........|........kYZZZZ1111ZZZZZk........|........kYZZZ111111ZZZ0k........|........kYZZZ111111ZZZ0k........|........kYZZZ111111ZZZ0k........|........kYZZZ111111ZZZ0k........|.......kYZZZZ111111ZZZZZk.......|.......kYZZZZZ1111ZZZZZ0k.......|.......kYZZZ00Z11Z00ZZZ0k.......|......kYZZZ0mnZ001mnYZZ0k.......|......kYZZZ0nooooonoYZZZZk......|......kYZZZZZYHHHHH0ZZZZ0k......|......kYZZZZ0YHHHHH0ZZZZ0k......|.....kYZZZZZYHHHHHHY0ZZZZZk.....|.....kY0ZZZZYHHHHHHZ0ZZZZ0k.....|.....kY0ZZZ0YHHHHHHH0ZZZZ0k.....|....kYZ0ZZZ0YHHHHHHH0ZZZZ0k.....|....kYZ0ZZZYHHHHHHHHY0ZZZ0Zk....|....kY0ZZZZYHHHHHHHHY0ZZZZ0k....|....kY0ZZZZYHHHHHHHHY0ZZZZ0k....|...kYZ0ZZZZYHHHHHHHHZ0ZZZZ0Zk...|...kYZ0ZZZYHHHHHHHHHHY0ZZZ00k...|...kZ00000YHHHHHHHHHHZ000001k...|....kkkkkkYkkkkkkkkkkk0kkkkk....|..........k...........k.........|................................",
    "kostuem": "...............kk...............|........kk....kmnk....kk........|.......kmnk...kmnk...kmnk.......|.......knokkkkkopkkkkknok.......|........kGNOSFkkkkNOSSGk........|.......kkNPOPFGkkFGNOFSkk.......|......kNNQFPFGHkOFHOQGNNOk......|.....kNOQSGFGGGFFGGFFINOQSk.....|...kkNOPSSSGHHHHHHHHINOPSSSkk...|..kNNOOOOSSNNNNNOSSNNOOOOSSNOk..|..kNOPPOONNOOPPOONNOOPPOONNOPk..|..kNQSSOOOOOQSSOOOOOQSSOOOOOQk..|..kPSSSSNOOPSSSSNOOPSSSSNOOPSk..|...kNSSNOOOOOSSNOOOOOSSNOOOPk...|...kNNNPOPPOONNOOPPOONNOPPPPk...|...kOOQkPSSOOOOOQSSOOOOPkSSPk...|....kPkkSSSSNOOPSSSSNOOPkkSk....|.....k.kNSSNOOOOOSSNOOOPk.k.....|.......kNNNOOPPOONNOOPPPk.......|.......kOPPPQSSOPPPPQSSPk.......|.......kxxxxxxxxxxxxxxxxyk......|.......kyzzzzzzzzzzzzzzzAk......|.......kNOONNNNNNOONNNNOk.......|.......kPSSOOOOOQSSOOOOPk.......|.......kSSSSNOOPSSSSNOOPk.......|.......kNSSNOOOOOSSNOOOPk.......|.......kNNNOOPPOONNOOPPPk.......|.......kOPPPQSSOPPPPQSSPk.......|........kkkkkkkkkkkkkkkk........|................................|................................|................................",
    "verkleidung": "................................|................................|................................|................................|................................|................................|................................|.....kkkkkkkkkkkkkkkkkkkkk......|....ksssssssssssssssssssssk.....|....kssssssssssssssssssssssk....|...ksssssssssssssssssssssssk....|...kssssvvvssssvvvss]]FGsssk....|...ksssvuuuvssvuuuvFFFGGIsssk...|..ksssvuusuuvvuusuuGGGHHIsssk...|..ksssvussssuussssuvHHIIssssk...|..kqrttttttttttttttttttttttrrk..|..kqrttttttttttttttttttttttrsk..|..kqrttttttttttttttttttttttrsk..|..kqrrrrrrrrrrrrrrrrrrrrrrrrsk..|..kqrrrrrrrrrrrrrrrrrrrrrrrrsk..|..kqrrrrrrrrssssssssrrrrrrrrsk..|..kqrrrrrrrsmmmmmmmnqrrrrrrrsk..|..kqrrrrrrrsmnnnnnnoqrrrrrrrsk..|..kqrrrr:rrsnoooooopqrrr:rrrsk..|..kqrrrrr:rrqqqqqqqqrrr:rrrrsk..|..kqrrrrrrrrrrrrrrrrrrrrrrrrsk..|..kqrrrrrrrrrrrrrrrrrrrrrrrrsk..|..krsssssssssssssssssssssssstk..|...kkkkkkkkkkkkkkkkkkkkkkkkkk...|................................|................................|................................",
    "laute": "................................|................................|................................|..........................k.k...|.......................kkkVkVk..|......................kuuuuuwk..|.....................kuvvvvvwk..|....................kuvvUwwwwk..|...................kuvvUwVkVkVk.|..................kuvvUwVk.k.k..|.................kuvvUwVk.......|.........kkkkkkkkuvvUwVk........|........kqqqqqqruvvUwVk.........|.......kqrrrrrrrrvUwVk..........|......kqrrrrrrrrrUwVk...........|.....kqrrrrrrrrrUrVk............|....kqrrrrrrrrrUrVrrk...........|...kqrrrrrsssrUrVrrsk...........|..kqrrrrrtuvvUrVrrrsk...........|..kqrrrrtv::UvVrrrrsk...........|..kqrrrsu::U:Vqrrrrsk...........|.kqrrrrsvvU:Vwqrrrrsk...........|.krrrrsrrUvVvqrrrrrtk...........|..kqrsurUrVwqrrrrrtk............|..kqrsvvrVqqrrrrrtk.............|..krrrrvwqrrrrrrtk..............|...krrrqqrrrrrrtk...............|....krrrrrrrrrtk................|.....krssrrsstk.................|......kkkrtkkk..................|.........kk.....................|................................",
    "floete": "................................|................................|................................|...kkk.kkk.kkk.kkk.kkk.kkk.kkk..|..k253k253k253k253k253k253k253k.|..k234k234k234k234k234k234k234k.|..k234k234k234k234k234k234k234k.|..k345k345k345k345k345k345k345k.|.kFFFFFFFFFFFFFFFFFFFFFFFFFFFFGk|.kFGGGGGGGGGGGGGGGGGGGGGGGGGGGHk|.kGHHHHHHHHHHHHHHHHHHHHHHHHHHHIk|..k223k223k223k223k223k223k223k.|..k234k234k234k234k234k234k234k.|..k234k234k234k234k234k234k444k.|..k234k234k234k234k234k444k234k.|..k234k234k234k234k444k234k234k.|..k234k234k234k444k234k234k345k.|..k234k234k444k234k234k234kkkk..|..k234k444k234k234k234k345k.....|..k444k234k234k234k234kkkk......|..k234k234k234k234k345k.........|..k234k234k234k234kkkk..........|..k234k234k234k345k.............|..k234k234k234kkkk..............|..k234k234k345k.................|..k234k234kkkk..................|..k234k345k.....................|..k234kkkk......................|..k345k.........................|...kkk..........................|................................|................................",
    "trommel": "..kqsk...................kkqk...|.kqrsrkkk.............kkkqqrsk..|.ksstsqqrkk.........kkqqqssttk..|..kkkkrssqrkkk...kkkqqsstkkkk...|......kkkrsqqrkkkqqqstkkk.......|.........kkrsrqqqrrtkk..........|..........kkkqrsrrskk...........|.........kqqqstkrssqrk..........|........kqrrskkkkkkqskk.........|......kkqssssrrrrrrssrrkk.......|.....kqrtUUUUUUUUUUUUVrrrk......|....kqsUUVVVVVVVVVVVVVUVqrk.....|....krsVWVVVVVVVVVVVVVWXqtFkk...|....kFrrrVWWWWWWWWWWWXqrtF2k3k..|....kF2GrrrrrrrrrrrrrrtF3G2k3k..|....kF2G3F2F3F2F3F2F3F2G3G2k3k..|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kFG3GGG3GGG3GGG3GGG3GGH3k...|....kF3G2G3G2G3G2G3G2G3G2G3k2k..|....kG3H2H3H2H3H2H3H2H3H2H3k2k..|....kqqqqqqqqqqqqqqqqqqqqqrk2k..|....krsssssssssssssssssssstk2k..|....kFFFFFFFFFFFFFFFFFFFFGHkk...|.....kGHGGGGGGGGGGGGGGGHIkk.....|......kkGHHHHHHHHHHHHHIkk.......|........kkkkkkkkkkkkkkk.........|................................|................................",
    "horn": "................................|................................|................................|................................|..................kkkkkkkkk.....|...............kkkUUVmmn:::k....|.............kkUUUVVVVmo:::k....|...........kkUUVVVVVVWmo:::k....|..........kUUVVVVVVVVWmo::::k...|.........kUVVVVUVVVVVWmo::::k...|........kUVVUVVVVVVVVWmo::::k...|.......kUVVVVVVVVVVVVWmo:::k....|......kUVUVVVVVWWWWWWXnoo::k....|.....kUVVVVVWWXkkkkkkkkkk:k.....|.....kUVVVVXkkk..........k......|....kUVVVVXk....................|....kUVVVXk.....................|...kUVVVXk.........k............|...kUVVWk.........kyk...........|...kUVVXk........kyk............|...kUVWk........kyk.............|...kVVXk.......kyk..............|..kymWk......kkyk...............|..kUmmnk...kkxzk................|..kWnnpxkkkxzkk.................|...kVokyyyzkk...................|....kk.kkkk.....................|................................|................................|................................|................................|................................",
    "seil": "................................|................................|................................|............kkkkkkk.............|.........kkk2222223kkk..........|.......kk2223433343223kk........|......k22433344444333423k.......|.....k2333444kkkkk2443333k......|....k23345kk2222224kk34333k.....|...k2345kk22334343323kk3433k....|..k2335kk2343444443433kk3333k...|..k234kk24345kkkkk34343kk234k...|.k2344k2335kk22223kk3333k2433k..|.k2335k245k244444443k344k3334k..|.k234k234kk435kkk334kk233k234k..|.k244k244k244k...k244k244k244k..|.k234k334kk433kkk234kk235k234k..|.k2333k243k344424445k244k2334k..|.k3344k3333kk34445kk2335k2435k..|..k234kk34323kkkkk22345kk234k...|..k3333kk3343222223435kk2335k...|...k3343kk34334343345kk2435k....|....k33323kk2444444kk22334k.....|.....k3333224kkkkk222333333k....|......k344333222223334444333k...|.......kk3443433343445kkk334k...|.........kkk3444445kkk...k333k..|............kkkkkkk.......k233k.|..........................k334kk|...........................k3342|............................k2kk|.............................k..",
    "kerze": "...............k................|..............k)k...............|.............k)))k..............|............k)))))k.............|............k))())k.............|............k)((()k.............|............k)(&()k.............|............k)(&()k.............|.............k)()k..............|..............k)k...............|............kkk:kkkk............|...........kUUUUUUUVk...........|...........kUUVVVVUWk...........|...........kUVVVVVUWk...........|...........kUVVVVVUWk...........|...........kUVVVVVUWk...........|...........kUVVVVVVWk...........|...........kUVVVVVVWk...........|...........kUVVVVVVWk...........|...........kUVVVVVVWk...........|...........kUVVVVVVWk....kkk....|...........kUVVVVVVWk...kmnnk...|...........kUVVVVVVWk..kmpknnk..|..........kkUVVVVVVWk.kmok.kmnk.|.......kkkmnUVVVVVVWmkkmok.kmpk.|......kmmmnoUVVVVVVWmmmnnnkmpk..|.....kmnnnnoVWWWWWWXmnnnnonpk...|.....knnnnnnmmmmmmmmnnnnpkkk....|......knoonnnnnnnnnnnoopk.......|.......kkknooooooooopkkk........|..........kkkkkkkkkkk...........|................................",
    "laterne": ".............kkkkk..............|............keffffk.............|............kfkkkfk.............|............kfkkkfk.............|..........kkkeeeegkkk...........|.........kgggggggggggk..........|........kgggggggggggggk.........|........kgggggggggggggk.........|.......kgggggggggggggggk........|......kgggggggggggggggggk.......|......kgggggggggggggggggk.......|.......keffffffffffffffgk.......|.......kefgggggffgggggfgk.......|.......keg)))))gg)))))egk.......|.......keg)))))gg)))))egk.......|.......keg))))(gg)))))egk.......|.......keg)))((gg())))egk.......|.......keg))(((gg(()))egk.......|.......keg))((&gg(()))egk.......|.......keg))((&gg(()))egk.......|.......keg))((&gg(()))egk.......|.......keg))((&gg(()))egk.......|.......keg)))(&gg())))egk.......|.......keg))))(gg)))))egk.......|.......keg)))))gg)))))egk.......|.......keg)))))gg)))))egk.......|......kkefeeeeeffeeeeefgkk......|.....keeffffffffffffffffefk.....|.....keffffffffffffffffffgk.....|.....kfgggggggggggggggggghk.....|......kkkkkkkkkkkkkkkkkkkk......|................................",
    "fackel": "....................kk..........|...................k))k....k....|..................k))))kk.k(k...|..................k))()))k.k....|.................k)))(()))k.....|.................k))(((())k.k...|.................k)((((())kk(k..|.................k))(&&())k.k...|.................k))(&(())k.....|................k2))))))))k.....|................k224))))kk......|...............k233343kk........|..............k2343334k.........|.............k2333435k4k........|..............k43334k.k.........|..............kq434k4k..........|.............kqrr45kk...........|............kqrrtk4k............|............kqrtk.k.............|...........kqrsk................|..........kqrrtk................|..........kqrtk.................|.........kqrsk..................|........kqrrtk..................|........kqrtk...................|.......kqrsk....................|......kqrrtk....................|......kqrtk.....................|.....kqrsk......................|......krtk......................|.......kk.......................|................................",
    "decke": "................................|................................|................................|................................|................................|................................|...kkkkkkkkkkkkkkkkkkkkkkkkk....|..kFFFFFFFFFFFFFGRRRSFFFFFFGk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|.kFGGGGGGGGGGGGGHRSSTFGGGGGHk...|.kFGGGGGGGGGGGGGHRSSTFGGGGGHk...|.kGGGGGGGGGGGGGGHRSSTFGGGGGHk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|..kIIIIIIIIIIIIIITTTTIIIIIIIk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|.kFGGGGGGGGGGGGGHRSSTFGGGGGHk...|.kGGGGGGGGGGGGGGHRSSTFGGGGGHk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|..kIIIIIIIIIIIIIITTTTIIIIIIIk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|.kFGGGGGGGGGGGGGHRSSTFGGGGGHk...|.kFGGGGGGGGGGGGGHRSSTFGGGGGHk...|.kGGGGGGGGGGGGGGHRSSTFGGGGGHk...|..kFGGGGGGGGGGGGHRSSTFGGGGGHk...|..kGGGGGGGGGGGGGHRSSTFGGGGGHk...|...kGHHHHHHHHHHHISTTTGHHHHHIk...|....kkkkkkkkkkkkkkkkkkkkkkkk....|................................|................................|................................",
    "schlafsack": "................................|................................|................................|................................|................................|................................|................................|................................|.........kkk......kkk...........|...kkkkkkxxykkkkkkxxykkkkk......|..kNNNNNOxyzNNNNNOxyzNNPPPkk....|..kNOOOOPxyzNOOOOPxyzPPPPPPPk...|..kNOOOOPxyzNOOOOPxyzPPNNNPPk...|.kNOOOOOPxyzNOOOOPxyzPNNPNNPPk..|.kNOOOOOPxyzNOOOOPxyzPNPPPNPPk..|.kNOOOOOPyzANOOOOPyzANPPQPPNPk..|.kNOOOOOPmmnNOOOOPmmnNPQQQPNPk..|.kNOOOOOPmnoNOOOOPmnoNPQQQPNPPk.|.kNOOOOOPnopNOOOOPnopNPQQQPNPk..|.kNOOOOOPxxyNOOOOPxxyNPPQPPNPk..|.kNOOOOOPxyzNOOOOPxyzPNPPPNPPk..|.kOOOOOOPxyzNOOOOPxyzPNNPNNPPk..|..kNOOOOPxyzNOOOOPxyzPPNNNPPk...|..kNOOOOPxyzNOOOOPxyzPPPPPPPk...|..kOOOOOPxyzNOOOOPxyzNOPPPkk....|...kOPPPQxyzOPPPPQxyzOPPQk......|....kkkkkyzAkkkkkkyzAkkkk.......|.........kkk......kkk...........|................................|................................|................................|................................",
    "netz": "................................|................................|................................|..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..|.kqqqqqqqqqqqqqqqqqqqqqqqqqqqrk.|.krsssssssssssssssssssssssssstk.|..kkkk3kkk3kkk3kkk3kkk3kkk3kkk..|..k3k3k3k3k3k3k3k3k3k3k3k3k3k...|...k3k.k3k.k3k.k3k.k3k.k3k.k3k..|..k3k3k3k3k3k3k3k3k3k3k3k3k3k...|...k.k3k.k3k.k3k.k3k.k3k.k3k....|....k3k3k3k3k3k3k3k3k3k3k3k3k...|...k3k.k3k.k3k.k3k.k3k.k3k.k....|....k3k3k3k3k3k3k3k3k3k3k3k3k...|.....k3k.k3k.k3k.k3k.k3k.k3k....|....k3k3k3k3k3k3k3k3k3k3k3k3k...|...k3k.k3k.k3k.k3k.k3k.k3k.k....|....k3k3k3k3k3k3k3k3k3k3k3k3k...|.....k3k.k3k.k3k.k3k.k3k.k3k....|....k3k3k3k3k3k3k3k3k3k3k3k3k...|.....k.k3k.k3k.k3k.k3k.k3k.k....|....k3k3k3k3k3k3k3k3k3k3k3k.....|.....k3k.k3k.k3k.k3k.k3k.k3k....|....k3k3k3k3k3k3k3k3k3k3k3k.....|.....k.k3k.k3k.k3k.k3k.k3k......|....k3k3k3k3k3k3k3k3k3k3k3k.....|....kqqrsk3k.k3kkk3k.k3qqrsk....|....kqqrs3k3k3qqrsk3k3kqqrsk....|....krrstk.k.kqqrskk.kkrrstk....|....kssttk...krrstk...kssttk....|.....kkkk....kssttk....kkkk.....|..............kkkk..............",
    "rucksack": "................................|................................|..............kkk...............|.............kzzzk..............|............kzzkzzk.............|..........kkzkkxkkzkk...........|........kkxxyxxyxxyxykk.........|.......kxxyyyyyyyyyyyxyk........|......kxyyyyyyyyyyyyyyyykk......|.....kxxxxxxxxxxxxxxxxxxxyk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kxxxxxxxxxxxxxxxxxxxzk.....|.....kAAxxxxxxmmmnxxxxxyAAk.....|.....kxyAAAxxxmnnoxxyAAAyzk.....|.....kxyyyyAAAmnnoAAAyyyyzk.....|.....kxyyyyyyznoopxyyyyyyzk.....|.....kxyyyyyyyxxxxyyyyyyyzk.....|.....kxyyAAAAAAAAAAAAAAyyzk.....|.....kxyyzzzzzzzzzzzzzzyyzk.....|.....kxyyzzzzzzzzzzzzzzyyzk.....|.....kxyyzzzzzzzzzzzzzzyyzk.....|.....kxyyzzzzzzzzzzzzzzyyzk.....|.....kxyyzzzzzzzzzzzzzzyyzk.....|.....kyzzzzzzzzzzzzzzzzzzAk.....|......kkkkkkkkkkkkkkkkkkkk......|................................",
    "schlauch": "................................|............kkkkkkk.............|...........kqqqqqqrk............|...........kqrrrrrsk............|...........kqrrrrrsk............|...........krssssstk............|...........kzzzzzzzk............|...........kzzzzzzz2kk..........|...........kzzzzzzz333k.........|..........k333333333k33k........|...........kzzzzzzzk.k33k.......|.........kkxzzzzzzzkk.k33k......|........kxxxxxxxyyyyzk.k33k.....|.......kxxxxxxxxxyyyyzk.k3k.....|......kxxxxxxxxxxyyyyzzkk33k....|.....kxxxxxxxxxxyyyyyzzAkk3k....|.....kxxxxxxxxxxyyyyyzzAkk3k....|....kyxxxxxxxxxyyyyyzzzAAk23k...|....kyxxxxxxxxyyyyyyzzzAAk34k...|....kyyxxxxxyyyyyyyzzzzAAkk3k...|....kyyyyyyyyyyyyyzzzzAAAkk3k...|....kyyyyyyyyyyyyzzzzAAAAkk3k...|....kzyyyyyyyyyzzzzzzAAAAkk3k...|.....kzyyyyyyzzzzzzAAAAAk.k3k...|.....kzzzzzzzzzzzzAAAAAAk.k3k...|......kzzzzzzzzzAAAAAAAk..k3k...|.......kAzzzzAAAAAAAAAk...k3k...|........kAAAAAAAAAAAAk....k3k...|.........kkAAAAAAAAkk....k24k...|...........kkkkkkkk......k35k...|..........................kk....|................................",
    "werkzeug": "................................|................................|................................|................................|..........................k.k...|.......................kkk]k]k..|......................k6666]k...|....................kk6777777k..|...................k667677778k..|..................k6766777778k..|................kk67677777778k..|...............k6676777777779k..|..............k6766777777789k...|............kk676777777779kk....|...........k6666777777779k......|..........k6767777777789k.......|........kk676777777779kk........|.......k6666777777779k..........|......k6767777777789k...........|....kk676777777779kk............|...k6666777777779k..............|..k6767777777789k...............|..k67777777779kk................|..k6777777779k..................|..k677777789k...................|..k7777779kk....................|...k78889k......................|....kkkkk.......................|................................|................................|................................|................................",
    "striegel": "................................|................................|................................|................................|................................|............kkkkkkkk............|..........kkxxxxxxxykk..........|.........kxxyyyyyyyyxyk.........|........kxyyyzzzzzzyyyyk........|.......kxyyzAkkkkkkyzyyyk.......|......kxyyAkk......kkyyyyk......|....kkxzzAkkkkkkkkkkkkyzzzkk....|...kqqqqqqqqqqqqqqqqqqqqqqqrk...|..kqrrrrrrrrrrrrrrrrrrrrrrrsk...|..kqrrrrrrrrrrrrrrrrrrrrrrrsk...|..kqrrrrrrrrrrrrrrrrrrrrrrrsk...|..kqrrrrrrrrrrrrrrrrrrrrrrrsk...|..kqrrrrrrrrrrrrrrrrrrrrrrrsk...|..krrrssssssssssssssssssssrsk...|...kqrrrrrrrrrrrrrrrrrrrrrrsk...|...krsssssssssssssssssssssstk...|....k4343434343434343434343k....|....k4343434343434343434343k....|....k4343434343434343434343k....|....k4343434343434343434343k....|....k4343434343434343434343k....|....k4343434343434343434343k....|....k4k4k4k4k4k4k4k4k4k4k4k.....|.....k.k.k.k.k.k.k.k.k.k.k......|................................|................................|................................",
    "boot": ".......................k........|......................kuk.......|.....................kuwk.......|.....................kuwk.......|....................kuwk........|....................kuwk........|...................kuwk.........|...................kuwk.........|..................kuwk..........|..................kuwk..........|.................kuwk...........|.................kuwk...........|................kuwk............|................kuwk............|...............kuwk.............|.kkkkkkkkkkkkkkkvwkkkkkkkkkkkk..|kqqqqqqqqqqqqqqqqqqqqqqqqqqqqrk.|.kttttttttttttttttttttttttttttk.|.krrrrrrrrrrrrrrrrrrrrrrrrrrrtk.|..kqrrrrrrrrrrrrrrrrrrrrrrrrsk..|..kssssssssssssssssssssssssssk..|...kqrrrrrrrrrrrrrrrrrrrrrrsk...|...kssssssssssssssssssssssssk...|...krrrrrrrrrrrrrrrrrrrrrrrtk...|....krsssssssssssssssssssstk....|..kkkk!!!#uv!!!!!!!!!!!!!#kkkk..|.k!!!!###%uw!#############!!!#k.|k!######!uw!###############!##$k|.k#$!$##%uw!##########!###$$$%k.|..kkkk#%uw!$$$$$$$$$$$$$$%kkkk..|......kkkkkkkkkkkkkkkkkkkk......|................................",
    "kette": "................................|......kk................kk......|....kkefkk............kkefkk....|...keeffefk..........keeffefk...|..kefggggffk........kefggggffk..|.kefhkkkkfffk......kefhkkkkfffk.|.kegk....kegk......kegk....kegk.|kefgk....keffk....kefgk....keffk|kffgk....kefhk....kffgk....kefhk|.kegk....kegk......kegk....kegk.|.kfffkkkkefhk......kfffkkkkefhk.|..kffeeeefhk........kffeeeefhk..|...kfffffgk..........kfgfffhk...|....keggggk...........kkgggk....|....kfggggk..........kkkgggk....|.....kggggfk........keffgggk....|......kkfkfk........kfkkkfk.....|.......kfkfk.......kkefffhk.....|.......kfkfk......kefgkkkk......|.......kfegkkk....kfkfk.........|........kegfffkkkkkfkfk.........|........kfkkkefeefffegk.........|........kffffgkegkkefhk.........|.........kkkkfkegffghk..........|............kfkfkkkkk...........|............kffhk...............|.............kkk................|................................|................................|................................|................................|................................",
    "kompass": "...............kk...............|..............kmok..............|.............kmkkmk.............|............kmokkmok............|...........kkkmmmokkk...........|.........kkmmmnnnnmmnkk.........|........kmmnnnnnnnnnnmnk........|.......kmnnnoooooooonnnnk.......|......kmnnopCCCC,CCCnonnnk......|.....kmnnpCCCCCCCCCCCCnnnnk.....|....kmnnpCCCCCCCCCCCCCCnnnnk....|...kmnnpCCCC]CCGGCCCCCCCnnnnk...|...kmnoCCCC]CCCGGCCCCCCCCmnok...|...kmnpCCC]CCCCGGCCCCCCCCnnok...|..kmnoCCCCCCCCCGGCCCCCCCCCmnnk..|..kmnoCCCCCCCCCGGCCCCCCCCCmnok..|..kmnoCCCCCCCCCmnCCCCCCCCCmnok..|..kmnoC,CCCCCCCnoCCCCCCCC,mnok..|..kmnoCCCCCCCCCppCCCCCCCCCmnok..|..kmnoCCCCCCCCCccCCCCCCCCCmnok..|..knnoCCCCCCCCCccCCCCCCCCCmnpk..|...kmnnCCCCCCCCccCCCCCCCCmnok...|...kmnoCCCCCCCCccCCCCCCCCmnok...|...knnnnCCCCCCCccCCCCCCCmnnpk...|....knnnnCCCCCCCCCCCCCCmnnpk....|.....knnnnCCCCCCCCCCCCmnnpk.....|......knnnmnCCCC,CCCmmnnpk......|.......knnnnmmmmmmmmnnnpk.......|........knonnnnnnnnnnopk........|.........kknoooooooopkk.........|...........kkkkkkkkkk...........|................................",
    "schluessel": "................................|.....kkkkkk.....................|...kkmmmmmnkk...................|..kmmnmoonnmnk..................|..kmnmpkknonok..................|.kmnmkk..kkmnnk.................|.kmnpk....knnok.................|.kmok......kmok.................|.kmok.....kkmok.................|.kmnnk...kmmnok.................|.knnokk.kmnnnok.................|..kmnmnkkmnnnok.................|..knonnmmnnnnnnk................|...kknoooooonnnnk...............|.....kkkkkkknnnnnk..............|............knnnnnk.............|.............knnnnnk............|..............knnnnnk...........|...............knnnnnk..........|................knnnnnk.........|.................knnnnnk........|..................knnnnnk.......|...................knnnnnk......|....................kmnnnnk.....|....................kmnnnnnk....|....................knnnnnok....|.....................knnoonok...|......................kokkok....|.......................k..k.....|................................|................................|................................",
    "ration": "................................|................................|................................|...........kkkkkkkkkkkkkkkkk....|..........k22222222222222223k...|..........k23333333333333334k...|..........k23333333333333334k...|..........k23353335333533334k...|..........k23333333333333334k...|....kkkkkkk23333333333333334k...|...k222222233333333333333334k...|...k233333333333333333335334k...|...k233333333333333333333334k...|...k233533353335333333333334k...|...k233333333333333333333334k...|...k233333333333333333335334k...|...k233333333333333333333334k...|...k233533353335333333333345k...|...k2333333333333333344445HHHk..|...k23333333333333334kkkHHHHHk..|...k23333333333333334kkHHHHHVHk.|...k23353335333533345HHHHHVVHIHk|...k233333333333335HHHHHVVHIIkk.|...k23333333333345HHHHHVHIIHk...|...k233333333345HHHHHVVHIHkk....|...k3444444445HHHHHHVHIIkk......|....kkkkkkkkHHHHHHVVHIkk........|...........kHHHHVVHIIk..........|............kHHVHIIkk...........|............kHHHIkk.............|.............kHkk...............|..............k.................",
    "fisch": "................................|................................|................................|................................|................................|................................|..............k.................|.............kck................|............kccck...........k...|.........kkkccccckk........kak..|......kkkaaabbbbbabkkk....kack..|.....kaaabcbbbbbbbbaabk..kabck..|....kabbbbcbbbbbbbbbbbbkkabbdk..|...kabbbbbcbbbcbbcbbcbbaabbck...|..kabb]kbbcbbbbbbbbbbbbbbbbck...|..kabbbbbbcbbbbcbbcbbcbbbbbck...|..kabbbbbbccbbbbbbbbbbbbbbbck...|..kbbbbbbbcbbbbbbbbbbbbbbbbck...|...kaaaaaacaaaaaaaaaaaaacbbck...|....kaaaaacaaaaaaaaaaaakkbbbbk..|.....kaaaacaaaaaaaaaaak..kbbck..|......kkkacaaaaaaaakkk....kbck..|.........kkkkkkkkkk........kck..|............................k...|................................|................................|................................|................................|................................|................................|................................|................................",
    "kraut": "..........k.....kNk.............|.........kNk....kPk....k........|.........kPk....kPk...kNk.......|.........kPkk...kPOk..kPk.......|..........kPOk.kNPk..kPOk.......|.........kNPkk..kPk.kNPk........|..........kkPOk.kPOkkPk.........|..........kNPk.kNkk.kPOk........|...........kPkkkPOkkNkk.........|.........k..kPONPkkkOkk.........|........k3kkNPkkPkNPkk3k........|.........k2kkkPkPkkPk2k.........|.........k23kkPkPkPk24k.........|.........k332222222235k.........|..........k2333333334kk.........|.........kzzzzzzzzzzzzzk........|........k22yyyyyyyyyyy4k........|.......k2222222222333344k.......|......k222222222233333445k......|......k222222222233333445k......|.....k32222242223333344455k.....|.....k33222222333333344455k.....|.....k33333333333333444555k.....|.....k33333333333334444555k.....|.....k43333433333444445555k.....|......k433333334444445555k......|......k444444444444555555k......|.......k4444444445555555k.......|........k55445555555555k........|.........k555555555555k.........|..........kkk555555kkk..........|.............kkkkkk.............",
    "schale": "................................|................................|................................|................................|................................|................................|................................|................................|................................|.........kkkkkkkkkkkkkk.........|.....kkkkqqqqqqqqqqqqqqkkkk.....|...kkqqqqqq6666666667qqqqqqkk...|..kqqq66666777777777766667qqqk..|.kqq667777767777777776777767qqk.|.kqq787777777777767777777789qqk.|.kqqqq78888777777777788889qqqsk.|.krrrqqqqqq7888888889qqqqqqrrtk.|..kqrrrrrqqqqqqqqqqqqqqrrrrrsk..|..krrrrrrrrrrrrrrrrrrrrrrrrrtk..|...kqrrrrrrrrrrrrrrrrrrrrrrsk...|...krrrrrrrrrrrrrrrrrrrrrrrtk...|....krrrrrrrrrrrrrrrrrrrrrtk....|.....krrrrrrrrrrrrrrrrrrrtk.....|......krsrrrrrrrrrrrrrrstk......|.......kkrsrrrrrrrrrrstkk.......|.........kksrrrrrrrrskk.........|..........kssssssssssk..........|..........kssssssssssk..........|...........kkkkkkkkkk...........|................................|................................|................................",
    "trank": "................................|............kkkkkkkk............|...........kqqqqqqqrk...........|...........kqrrrrrrsk...........|...........kqrrrrrrsk...........|...........krsssssstk...........|............k!!!!!#k............|............k!!!!#$k............|............k!!!!#$k............|............k!!!!#$k............|............k!!!!#$k............|...........kk!!!!#$kk...........|..........kFF!!!!$%GGk..........|.........kF]]]FFFFGGGHk.........|........kF]]]]]FFFGGGGHkk.......|.......kFFFFFFFFFFFFFFFFFk......|......kGF]]]]FFFFGGGGGHHIk......|......kFFFFFFFFFGGGGGHHHIk......|......kGFFFFFFFGGGGGGHHHIk......|.....kGGFFFFFFGGGGGGHHHIIIk.....|.....kGGGGGGGGGGGGGGHHHIIIk.....|.....kHGGGGGGGGGGGGHHHIIIIk.....|......kGGGGGGGGGGHHHHHIIIk......|......kHGGGGGGGGHHHHHIIIIk......|......kHHHGGGHHHHHHHIIIIIk......|.......kHHHHHHHHHHIIIIIIk.......|........kHHHHHHHIIIIIIIk........|.........kIIIIIIIIIIIIk.........|..........kIIIIIIIIIIk..........|...........kkIIIIIIkk...........|.............kkkkkk.............|................................",
    "flasche": ".............kkkkkk.............|............kqqqqqrk............|............kqrrrrsk............|............kqrrrrsk............|............krsssstk............|............kNNNNNOk............|............kNOOOOPk............|............kNOOOOPk............|............kNOOOOPk............|............kNOOOOPk............|............kNOOOOPk............|...........kNOOOOOOOk...........|..........kNOOOOOOOOOk..........|..........kNOOOOOOOOPk..........|.........kNOOOOOOOOOOOk.........|........kNOOOOOOOOOOOPk.........|........kNONOOOOOOOOOPk.........|........kNONPPPPPPPPPQk.........|........kNPNBBBBBBBBBCk.........|........kNPNCCCCCCCCCDk.........|........kNPNCCCCCCCCCDk.........|........kNPNC,,,,,,,CDk.........|........kNPNCCCCCCCCCDk.........|........kNPNCCCCCCCCCDk.........|........kNPNDDDDDDDDDEk.........|........kNONNNNNNNNNNOk.........|........kNONOOOOOOOOOPk.........|........kNONOOOOOOOOOPk.........|........kOPNPPPPPPPPPQk.........|.........kkkkkkkkkkkkk..........|................................|................................",
    "brief": "................................|................................|................................|................................|................................|................................|..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..|.kDBBBBBBBBBBBBBBBBBBBBBBBBBBDk.|.kBDCCCCCCCCCCCCCCCCCCCCCCCCDDk.|.kBCDDCCCCCCCCCCCCCCCCCCCCDDCDk.|.kBCCCDCCCCCCCCCCCCCCCCCCDCCCDk.|.kBCCCCDCCCCCCCCCCCCCCCCDCCCCDk.|.kBCCCCCDDCCCCCCCCCCCCDDCCCCCDk.|.kBCCCCCCCDCCDDDDDCCCDCCCCCCCDk.|.kBCCCCCCCCDEF]FGHCCDCCCCCCCCDk.|.kBCCCCCCCCDG]]FGGIDCCCCCCCCCDk.|.kBCCCCCCCCDGFFGGHIBCCCCCCCCCDk.|.kBCCCCCCCCDGGGGHHIBCCCCCCCCCDk.|.kBCCCCCCCCDHHHHHIIBDCCCCCCCCDk.|.kBCCCCCCCDCCIIIIIBCCDCCCCCCCDk.|.kBCCCCCDDCCCBBBBBCCCCDDCCCCCDk.|.kBCCCCDCCCCCCCCCCCCCCCCDCCCCDk.|.kBCCCDCCCCCCCCCCCCCCCCCCDCCCDk.|.kBCDDCCCCCCCCCCCCCCCCCCCCDDCDk.|.kBDCCCCCCCCCCCCCCCCCCCCCCCCDDk.|.kDDDDDDDDDDDDDDDDDDDDDDDDDDDDk.|..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..|................................|................................|................................|................................|................................",
    "zettel": "................................|................................|...........kkkkkkkkkkkkk........|.....kkkkkkBBBBBBBBBBDDDk.......|....kBBBBBBCCCCCCCCCCCDDk.......|....kBCCCCCCCCCCCCCCCCCDk.......|....kBCCCCCCCCCCCCCCCCCCDk......|....kBCCCCCCCC,,,,,,,CCCDk......|....kCCC,,,,,,CCCCCCCCCCDk......|.....kBCCCCCCCCCCCCCCCCCDk......|.....kBCCCCCCCCCCCCCCCCCDk......|.....kBCCCCCCCC,,,,,,,,CDk......|.....kBC,,,,,,,CCCCCCCCCCCk.....|.....kBCCCCCCCCCCCCCCCCCCDk.....|.....kBCCCCCCCCCCCCCCCCCCDk.....|.....kBCCCCCC,,,,,CCCCCCCDk.....|.....kBCC,,,,CCCCCCCCCCCCDk.....|.....kBCCCCCCCCCCCCCCCCCCDk.....|.....kCCCCCCCCCCCCCCCCCCCCCk....|......kBCCCCCCCC,,,,,,,,CCDk....|......kBC,,,,,,,CCCCCCCCCCDk....|......kBCCCCCCCCCCCCCCCCCCDk....|......kBCCCCCCCCCCCCCCCCCCDk....|......kBCCCCCCC,,,,,CCCCCCDk....|......kBCC,,,,,CCCCCCCCCCCCCk...|......kBCCCCCCCCCCCCCCCCCCCDk...|......kBCCCCCCCCCCCCCCCCDDDEk...|......kBCCCCCCCCDDDDDDDEkkkk....|......kCDDDDDDDEkkkkkkkk........|.......kkkkkkkkk................|................................|................................",
    "siegel": "................................|.....kkkkkkkkkkkkkkkkkkkkkk.....|....kBBBBBBBBBBBBBBBBBBBBBCk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCC,,,,,,,,,,,,,,,,CCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCC,,,,,,,,,,,,,,,,CCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCC,,,,,,,,,,,,,,,,CCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCC,,,,,,,,,,,CCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCCCCCCCCCCCCCCDk....|....kBCCCCCCCDDDDDCCCCCCCCDk....|....kBCCCCCCE]FFGGCCCCCCCCDk....|....kBCCCCCE]]]FGGHCCCCCCCDk....|....kBCCCCDFFIIFIIHIBCCCCCDk....|....kBCCCCDGFIFGGIHIBCCCCCDk....|....kBCCCCDGGIGGGIHIBCCCCCDk....|....kBCCCCDHGIIHIIIIBCCCCCDk....|....kBCCCCCDHHHHIIIBCCCCCCDk....|....kCDDDDEJKIIIIIJKCDDDDDEk....|.....kkkkkkJKKkkJJKLkkkkkkk.....|..........kJKLk.kJKLk...........|..........kJKMk.kJKLk...........|.........kJLLk..kKKMk...........|..........kkLk...kLk............|............k.....k.............",
    "rolle": "................................|................................|...k.kkkkkkkkkkkkkkkkkkkkk.k....|..krkBBBBBBBBBBBBBBBBBBBBCkrk...|.kqqrCCCCCCCCCCCCCCCCCCCCEqqrk..|krrrstBCCCCCCCCCCCCCCCCCDrrrstk.|.ksstBCCCCCCCCCCCCCCCCCCCCsstk..|..ktkCDDCCCCCCCCCCCCCCCCDEktk...|...k.kkkBCCCCCCCCCCCCCCDkk.k....|.......kBCCCCCCCCCCCCCCDk.......|.......kBC,,,,,,,,,,,,CDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBC,,,,,,,,,,CCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBC,,,,,,,,,,,,CDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBC,,,,,,,,,,CCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBCCCCCCCCCCCCCCDk.......|.......kBC,,,,,,,,,,,,CDk.......|...k.kkkBCCCCCCDDCCCCCCDkk.k....|..krkBBBCCCCCCDFGBCCCCCCBCkrk...|.kqqrCCCCCCCCCDFHBCCCCCCCEqqrk..|krrrstBCCCCCCCDFHBCCCCCCDrrrstk.|.ksstBCCCCCCCCDFHBCCCCCCCCsstk..|..ktkCDDDDDDDDEFHCDDDDDDDEktk...|...k.kkkkkkkkkkGIkkkkkkkkk.k....|...............kk...............|................................",
    "karte": "................................|................................|................................|................................|..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..|.k!!!!!!BBBDBBBBBBBBDBBBBBBBBCk.|.k!!!!!BCCCDCCCCCCCCDCCCCCCCCDk.|.k!!!!!CCCCDCCCCCCCCDCCCCCCCCDk.|.k!!!!!!CDCDCCPCCCCCDCCCGCCCCDk.|.k!!!!!!!!CDCCCCPCCCDGCGCCGCCDk.|.k!!!!!!!!!DCCCCCCCCGCCCCCCCCDk.|.k!!!!!!!!!DCCCPCCCGDCCC9CCCCDk.|.k!!!!!!!!BDCCCCCCCCDCC9C9CCCDk.|.k!!!!!!!BCDCCCCCCGGDCCCCCCCCDk.|.k!!!!!!BCCDCCCCCCGCDCCCCCCCCDk.|.k!!!!!BCCCDCCCCCCCCDCCCCCCCCDk.|.k!!!!!CCCCDCCCCCGCCDCCCCCCCCDk.|.k!!!!!!CDCDCCCCCGCCDCCCCCCCCDk.|.k!!!!!!!!CDCCCCCCCCDCCCCCCCCDk.|.k!!!!!!!!!DCCGGCCCCDCCCCCCCCDk.|.k!!!!!!!!!DGGCCCCCCDCCCCPCCCDk.|.k!!!!!!!GGDCCCCCCCCDCCCPCCCCDk.|.k!!!!!!!BCDCCCCCCCCDCCCCCPCCDk.|.k!!!!!!BCCDCCCCCCCCDCCCCCCCCDk.|.k!!!!!BCCCDCCCCCCCCDCCCCCCCCDk.|.k!!!!!BCCCDCCCCCCCCDCCCCCCCCDk.|.kBCCCCDDDDDDDDDDDDDDDDDDDDDDEk.|..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..|................................|................................|................................|................................",
    "buch": "................................|................................|.....kkkkkkkkkkkkkkkkkkkkk......|....kIIIFFFFFFFFFFFFFFFFFGk.....|....kIIIGGGGGGGGGGGGGGGGGHk.....|....kIIIGGGGGGGGGGGGGGGGGHkk....|....kIIIGnGGGGGGGGGGGGnGGHBCk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGHHHHGGGGGGGHBDk...|....kIIIGGGGGImnnnGGGGGGGHBDk...|....kIIIGGGGImpFGnnGGGGGGHBDk...|....kIIIGGGHmpFGGGnnFGGGGHBDk...|....kIIIGGGHnFGGGGGnFGGGHICEk...|....kIIIGGGHnGGGGGInFGGHmmmnk...|....kIIIGGGHnnGGGImpFGGHmnnok...|....kIIIGGGGGnnGImpFGGGHnoopk...|....kIIIGGGGGGnnnpFGGGGGFGBCk...|....kIIIGGGGGGFFFFGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGnGGGGGGGGGGGGnGGHBDk...|....kIIIGGGGGGGGGGGGGGGGGHBDk...|....kIIIGGGGGHHGGGGGGGGGGHBDk...|....kIIIHHHHIJKGHHHHHHHHHIBDk...|.....kkkBBBBCJLBBBBBBBBBBBCDk...|.......kCDDDEJLCDDDDDDDDDDDEk...|........kkkkkJLkkkkkkkkkkkkk....|............kKMk................",
    "tinte": "...........................k....|.......................kkkkBk...|.....................kkBBBBDk...|....................kBBCCCDk....|...................kBCCCDDk.....|..................kBCCCDEk......|.................kkBCCDEk.......|................kWBCDDEk........|...............kWBCDCEk.........|..............kWWkDDEk..........|.........kkkkkWWk.kkk...........|........k;;;;;W;;k..............|........k;;;;W;;;+k.............|........k++++++++-k.............|........k+,,,,,,,-k.............|.......k+,,,,,,,,-k.............|......k+]]]]+++,,,-k............|.....k+]]]]]+++,,,--k...........|....k++]]]]+++,,,,---k..........|....k+++]++++,,,,,---k..........|...k,+++++++,,,,,,----k.........|...k,,++++,,,,,,,-----k.........|...k,,,,,,,,,,,,------k.........|...k,,,,,,,,,,--------k.........|....k,,,,,,,,--------k..........|....k----------------k..........|.....k--------------k...........|......k------------k............|.......k----------k.............|........kkkk--kkkk..............|............kk..................|................................",
    "feder": "................................|............................k...|..........................kkBk..|........................kkBBWk..|......................kkBBCWk...|.....................kBDDCWDk...|....................kBCCCDCEk...|...................kBCCCWCDDDk..|..................kBDDCCWCEkk...|.................kBCCCDWCEk.....|................kBCCCCWDDDk.....|................kDDCCWCEkk......|...............kBCCDWCEk........|..............kBCCCWDDDk........|.............kDDCCWCEkk.........|.............kBCDWCEk...........|............kBCCCDDDk...........|...........kBCCCWEkk............|..........kDDCCWEk..............|..........kBCDWEk...............|..........kBCWDDDk..............|.........kBCWEkkk...............|.........kBWkk..................|.........kWk....................|........kCWk....................|........kWk.....................|.......kWk......................|.....kkWk.......................|....k,Wk........................|...k,kk.........................|..k,k...........................|...k............................",
    "wachs": "................................|................................|................................|................................|................................|................................|.....................kk.........|....................kHHk........|...................kHHHHk.......|..................kHHHHHHk......|.................kFFHHHHHk......|................kFFGHHHHk.......|...............kFFGGGHHk........|..............kFFGGGGIk.........|.............kFFGGGGIk..........|............kFFGGGGIk...........|...........kFFGGGGIk............|..........kFFGGGGIk.............|.........kFFGGGGIk.....kk.......|........kFFGGGGIk...kkkGGkkk....|.......kFFGGGGIk...kFFFFFGGHk...|......kFFGGGGIk...kFFFFIIGGHHk..|.....kFFGGGGIk....kFFIIFGIIHHk..|....kFFGGGGIk....kGFFIFGGGIHIIk.|...kFFGGGGIk.....kGGGIGGGHIHIIk.|..kFGGGGGIk.......kGGIIGHIIIIk..|...kGGGGIk........kHHHHIIIIIIk..|....kGGIk..........kIIIIIIIIk...|.....kHk............kkkIIkkk....|......k................kk.......|................................|................................",
    "kohle": "................................|................................|................................|................................|................................|......................k.k.......|.....................k/k/k......|....................k/::k/k.....|...................k/::::k......|..................k/:::/:;k.....|.................k/:::::;k..k...|................k/:::::;k.kk0k..|...............k/:::::;k.k0kkk..|..............k/:::::;k...kkk0k.|.............k/:::::;k....k0kk..|............k/:::::;k......k....|...........k/:::::;k............|..........k/:::::;k.............|.........k/:::::;k..............|........kBCD:::;k...............|.......kBCDC::;k................|......kBCDCCC;k.................|.....kBCDCCCEk..................|....kBCDCCCEk...................|...kBCDCCCEk....................|..kBCCCCCEk.....................|..kCCCCCEk......................|...kCCCEk.......................|....kCEk........................|.....kk.........................|................................|................................",
    "beutel": "................................|................................|................................|.......k..........k.............|......kxk........kxk............|......kyykkkkkkkkxAk............|.......kxxxxxxxxxzk.............|.......kyyyyyyyyyzk.............|........kzzzzzzzzzk.............|........kzzzzzzzzzk.............|......kknnnnnnnnnnnk............|.....kxxxxxxxxxyyyzzk...........|....kxxxxxxxxxxyyyyzzk..........|....kxxxxxxxxxxyyyyzzk..........|...kxxxxxxxxxxyyyyyzzAk.........|...kxxxxxxxxxyyyyyyzzAk.........|..kyxxxxxxxxyyyyyyzzzAAk........|..kyyxxxxxxyyyyyyzzzzAAk........|..kyyyyyyyyyyyyyyzzzAAAk........|..kyyyyyyyyyyyyyzzzzAAAk........|..kyyyyyyyyyyyzzzzzAAAAk..kkkk..|...kyyyyyyyyyzzzzzAAAAk..kmmmnk.|...kzzyyyyzzzzzzzAAAAAk..kmnnok.|....kzzzzzzzzzzAAAAAAk...knoopk.|....kAzzzzzzzAAAAAAAAkkkkkkkkk..|.....kAAAAAAAAAAAAAAkmmmmnk.....|......kkAAAAAAAAAAkkkmmnnok.....|........kkAAAAAAkkkkkmnnnok.....|..........kkkkkkkmmnknooopk.....|...............kmnnnokkkkk......|................knopk...........|.................kkk............",
    "muenze": "................................|................................|.........kkkkkkkk...............|.......kkooooooookk.............|......kooonnnnnnoook............|.....koonnnnnnnnnnook...........|....koonnnnnnnnnnnnook..........|...koonnmmoooooonnnnook.........|...konnmoonnnnnnoonnnok.........|..koonnnonnnnnnnnonnnook........|..konnnonnnnnnnnnnonnnok........|..konnnonnnnnnnnnnonnnok........|..konnnonnnnppnnnnonnnokk.......|..konnnonnnnpnnnnnonnnoook......|..konnnonnnnnnnnnnonnnooook.....|..konnnonnnnnnnnnnonnnoooook....|..koonnnonnnnnnnnonnnoooooook...|...konnnoonnnnnnoonnnoooooook...|...koonnnnoooooonnnnoooooooook..|....koonnnnnnnnnnnnooooooooook..|.....koonnnnnnnnnnoooooooooook..|......kooonnnnnnoooooooooooook..|.......kkooooooooooooooooooook..|.........kkooooooooooooooooook..|...........kooooooooooooooook...|...........kooooooooooooooook...|............kooooooooooooook....|.............kooooooooooook.....|..............kooooooooook......|...............kkooooookk.......|.................kkkkkk.........|................................",
    "ring": "................................|................................|...............k................|.............kkGkk..............|............k]]FGGk.............|...........k]]]FGGHk............|..........kFFFFFGGHIk...........|..........kGFFFGGGHIk...........|..........kGGGGGGHHIk...........|..........kHGGGHHHIIk...........|...........kHHHHIIIk............|...........kkIIIIIokk...........|.........kkmmooIooomnkk.........|........kmmnnnonoonnnmnk........|.......kmnnoopkkkknoonnnk.......|......kmnnmkkk....kkknnnnk......|......kmnmk..........knnok......|.....kmnpk............knnnk.....|.....kmomk.............kmok.....|.....kmok..............kmok.....|.....kmok..............kmok.....|.....kmok..............kmok.....|.....knnnk............kmnpk.....|......kmnnk..........kmnok......|......knnnnkkk....kkkmnnpk......|.......knnnmmnkkkkmmmnnpk.......|........knonnnmmmmnnnopk........|.........kknoooooooopkk.........|...........kkkkkkkkkk...........|................................|................................|................................",
    "juwel": "................................|................................|................................|................................|................................|.........kkkkkkkkkkkkk..........|........kJJJJJJJJJJJJKk.........|.......kJJKKKKKKKKKKKLLk........|......kJJJKK]KKKKKKKKLLKk.......|.....kJJJJK]KKKKKKKKLLLKKk......|....kJKJJJJKKKKKKKKKLLLLKKk.....|...kJKKJJJJKKKKKKKKKLLLLKKKk....|..kJKKJJJJJJKKKKKKKLLLLLLKKKk...|..kLLLLLLLLLJJJJJJJLLLLLLLLLLk..|...kKKKKKKKKJJJJJJJKKKKKKKMkk...|....kKKKKKKKKJJJJJKKKKKKKMk.....|.....kKKKKKKKJJJJJKKKKKKMk......|......kJKKKKKJJJJJKKKKKLk.......|......kKKKKKKJJJJJKKKKKMk.......|.......kKKKKKKJJJKKKKKMk........|........kKKKKKJJJKKKKMk.........|.........kKKKKJJJKKKMk..........|..........kJKKKJKKKLk...........|..........kKKKKJKKKMk...........|...........kKKKJKKMk............|............kKKJKMk.............|.............kKKMk..............|..............kLk...............|...............k................|................................|................................|................................",
    "perle": "................................|................................|................................|................................|.............kkkkkk.............|..........kkkNNOOOOkkk..........|.........kONNNNNNOOOOPk.........|........kNN]]]NNNNOOOOPk........|.......kN]]]]]NNNNOOOOPPk.......|......kNN]]]]]NNNNOOOOOPPk......|.....kON]]]]]]NNNNOOOOOPPQk.....|.....kNN]]]]]NNNNOOOOOPPPQk.....|.....kNNNNNNNNNNOOOOOOPPPQk.....|....kONNNNNNNNNOOOOOOOPPPQQk....|....kOONNNNNNNO;;;OOOPPPPQQk....|....kOOONNNNOO;;;;;OPPPPQQQk....|....kOOOOOOOOO;;;;;OPPPPQQQk....|....kOOOOOOOOO;;;;;PPPPQQQQk....|....kPOOOOOOOOO;;;PPPPQQQQQk....|.....kOOOOOOOOOOPPPPPQQQQQk.....|.....kPPOOOOOPPPPPPPQQQQQQk.....|.....kPPPPPPPPPPPPPQQQQQQQk.....|......kPPPPPPPPPPQQQQQQQQk......|.......kQPPPPPPQQQQQQQQQk.......|........kQQQQQQQQQQQQQQk........|.........kQQQQQQQQQQQQk.........|..........kkkQQQQQQkkk..........|.............kkkkkk.............|................................|................................|................................|................................",
    "band": "................................|................................|................................|................................|.....kkkkkkkk......kkkkkkkk.....|...kkNNNNNNNOkk..kkNNNNNNNOkk...|..kNNOOOOOOOONOkkNNOOOOOOOONOk..|..kNOOPPPPPOOOPkkNOOOPPPPPOOPk..|.kNOOPkkkkkNOONNNOOOPkkkkkNOOOk.|.kNOOPk...kNONNNOOPOPk...kNOOPk.|.kOOOPkkkkkNONNNOOPOPkkkkkNOOQk.|..kNOONNNNNOOOOOOPQOONNNNNOOPk..|..kOPOOOOOOOOPOPPQQOOOOOOOOPQk..|...kkOPPPPPPOOQQQQOOPPPPPPQkk...|.....kkkkkkkNOOPPOOPkkkkkkk.....|..........kNOOPkkNOOOk..........|..........kNOOQkkOOOPk..........|..........kNOPk..kNOPk..........|.........kNOOQk..kOOOOk.........|.........kNOPk....kNOPk.........|........kNOOQk....kOOOOk........|........kNOPk......kNOPk........|.......kNOOQk......kOOOOk.......|.......kNOPk........kNOPk.......|.......kNOQk........kOOPk.......|......kNOPk..........kNOOk......|......kNOQk..........kOOPk......|.....kNOPk............kNOOk.....|.....kOOQk............kOOQk.....|......kPk..............kPk......|.......k................k.......|................................",
    "band-blau": "................................|................................|................................|................................|.....kkkkkkkk......kkkkkkkk.....|...kkJJJJJJJKkk..kkJJJJJJJKkk...|..kJJKKKKKKKKJKkkJJKKKKKKKKJKk..|..kJKKLLLLLKKKLkkJKKKLLLLLKKLk..|.kJKKLkkkkkJKKJJJKKKLkkkkkJKKKk.|.kJKKLk...kJKJJJKKLKLk...kJKKLk.|.kKKKLkkkkkJKJJJKKLKLkkkkkJKKMk.|..kJKKJJJJJKKKKKKLMKKJJJJJKKLk..|..kKLKKKKKKKKLKLLMMKKKKKKKKLMk..|...kkKLLLLLLKKMMMMKKLLLLLLMkk...|.....kkkkkkkJKKLLKKLkkkkkkk.....|..........kJKKLkkJKKKk..........|..........kJKKMkkKKKLk..........|..........kJKLk..kJKLk..........|.........kJKKMk..kKKKKk.........|.........kJKLk....kJKLk.........|........kJKKMk....kKKKKk........|........kJKLk......kJKLk........|.......kJKKMk......kKKKKk.......|.......kJKLk........kJKLk.......|.......kJKMk........kKKLk.......|......kJKLk..........kJKKk......|......kJKMk..........kKKLk......|.....kJKLk............kJKKk.....|.....kKKMk............kKKMk.....|......kLk..............kLk......|.......k................k.......|................................",
    "flagge": "....knk.........................|...k]mnk..k.............k.......|...knnokkkJkk.........kkJkk.....|...koopkJJKJKkk.....kkJJKJKkk...|...kqqrJKKKKKJKkk.kkJJKKKKKJKk..|...kqrsJKKKKKKKJKkJJKKKKKKKKLk..|...kqrsJKKKKKKKKKJKKKKKKKKKKLk..|...kqrsJKKKKKKLKKKKKLKKKKKKKLk..|...kqrsJKKKKKLUKLKLMUJKKKKKKLk..|...kqrsJKKKKKLUUVLUUWJKKKKKKLk..|...kqrsJKKKKKLUVVUVVWJKKKKKKLk..|...kqrsJKKKKKLUVVVVVWJKKKKKKLk..|...kqrsJKKKKKLUVVVVVWJKKKKKKLk..|...kqrsJKKKKKLVVVVVVXJKKKKKKLk..|...kqrsJKKKKKKKVWVWXJKKKKKKKLk..|...kqrsJKKLKKKKJKWJJKKKKLKKKLk..|...kqrsJLMkKLKKKKJKKKKLMkKLKLk..|...kqrsLkk.kkKLKKKKKLMkk.kkKMk..|...kqrsk.....kkKLKLMkk.....kk...|...kqrsk.......kkLkk............|...kqrsk.........k..............|...kqrsk........................|...kqrsk........................|...kqrsk........................|...kqrsk........................|...kqrsk........................|...kqrsk........................|...kqrsk........................|...kqrsk........................|...krstk........................|....kkk.........................|................................",
    "scheibe": "...............k3k..............|...............k3k..............|...............k3k..............|...............k3k..............|.............kkk3kk.............|..........kkkUUVVUVkkk..........|.........kUUUVX::VVUUVk.........|........kUVVVW::::UVVVVk........|.......kUVVVVW::::UVVVVVk.......|......kUVVVVVWWWWWWVVVVVVk......|.....kUVVVVWWVVVVVVWWVVVVVk.....|....kUVVVVWWVVVVVVVVWWVVVVVk....|....kUVVVWWVVVVVVVVVVWWVVVWk....|....kUVVVWVVVVVVXVVVVVWVVVWk....|...kUVVVWVVVVVVVVVVVVVVWVVVVk...|...kUVVVWVVVVVVVVVVVVVVWVVVWk...|...kUVVVWVVVVVVVVVVVVVVWVVVWk...|...kUVVVWVVXVVVVVVVVVXVWVVVWk...|...kUVVVWVVVVVVVVVVVVVVWVVVWk...|...kVVVVWVVVVVVVVVVVVVVWVVVXk...|....kUVVVWVVVVVVVVVVVVWVVVWk....|....kUVVVWWVVVVVVVVVVWWVVVWk....|....kVVVVVWWVVVVXVVVWWVVVVXk....|.....kVVVVVWWVVVVVVWWVVVVXk.....|......kVVVVVVWWWWWWVVVVVXk......|.......kVVVVVVVVVVVVVVVXk.......|........kVVVVVVVVVVVVVXk........|.........kVWWVVVVVVWWXk.........|..........kkkVWWWWXkkk..........|.............kkkkkk.............|................................|................................",
    "seide": "................................|.k..............................|kGk.............................|.kFk............................|.kGk............................|.kGGk..........k................|..kGk.........kFk...............|..kGGk.........k....k...........|...kGk....k..kkkkkkkFk..........|...kGGk..kFkkFFFFFGGGkk.........|....kHk.kkkFGHHHHHkkGGGkk.......|.....k.kFFGIkkkkkGGGkkGGGk......|......kFGIkk.....kkGHkkkGGk.....|.....kFGIk.........kkGk.kGGk....|....kFHIkk...........kGk.kGGk...|...kFIkkFFk...........kGk.kGk...|...kGk.kGGk............kFkFIk...|...kGkk.kGGk...........kFFIk....|...kGGGk.kGGk..........kFHk.....|....kkGGk.kGGk.......kkFGIk.....|......kGGkkkGHkkkkkkkFFHIk......|.......kGGGkkkFFFFFFGHIkk.......|........kkGGGFGGGHHIkkkkFk......|..........kkkGHHIkkk...kGGk.....|.............kkkk.......kHk.....|.........................kFk....|.........................kGGk...|..........................kHk...|...........................kGk..|............................kGk.|.............................k..|................................",
    "schwimmer": "................................|................................|................................|................................|................................|.kk..........................kk.|k24kk......................kk24k|.kk23kk..................kk24kk.|...k333kkk............kkk235k...|....kk3333kkkkkkkkkkkk2335kk....|.....k4kk33332222223335kkk4k....|.....k4k.kkkk344445kkkk..k4k....|.....k4k.....kkk4kk......k4k....|.....k4k.......k4k.......k4k....|....kqqrk......k4k......kqqrk...|...kqqqrsk.....krk.....kqqqrsk..|...kqqqrsk....kqqrk....kqqqrsk..|...kqqqrsk...kqqqrsk...kqqqrsk..|...kqqrrsk...kqqqrsk...kqqrrsk..|...krttttk...kqqrrsk...krttttk..|...krrrstk..krrtttttk..krrrstk..|...ksssttk...krrrstk...ksssttk..|...ktstttk...krrsstk...ktstttk..|....ktttk....ksssttk....ktttk...|.....kkk......ktttk......kkk....|...............ktk..............|................k...............|................................|................................|................................|................................|................................",
    "tuch": "................................|................................|................................|................................|....................kkkkk.......|...............kkkkkUUUUUk......|..........kkkkkUUUUUUUUUUk......|.....kkkkkUUUUUWVVVVVUUUUVk.....|...kkUUUUUVVVVVWVVVVVVVUUUk.....|..kUUVVVVVVVVVVWVVVVVVVVUUk.....|..kVVVVVVVVVVVVWVVVVVVVVVUk.....|...kUVVVVVVVVVVVWVVVVVVVVVVk....|...kUVVVVVVVVVVVWVVVVVVVVVWk....|...kUVVVVVVVVVVVWVVVVVVVVWWWk...|...kUVVVVVVVVVVVWVVVVWWWWVWk....|...kVVVVVVVVVVVVWWWWWVVVVVWk....|....kUVVVVVVWWWWWVVVVVVVVVVVk...|....kUVVWWWWVVVVVWVVVVVVVVVWk...|....kWWWVVVVVVVVVWVVVVVVVVVWk...|....kUVVVVVVVVVVVWVVVVVVVVVWk...|....kVVVVVVVVVVVVWVVVVVVVVVWk...|.....kUVVVVVVVVVVWVVVVVVVVVVVk..|.....kUVVVVVVVVVVWVVVVVVVVVWXk..|.....kUVVVVVVVVVVVWVVVVWWWXkk...|.....kUVVVVVVVVVVVWWWWXkkkk.....|.....kVVVVVVVVVWWWWkkkk.........|......kUVVVWWWXkkkWk............|......kVWWXkkkk...k.............|.......kkkk.....................|................................|................................|................................",
    "karten": "................................|................................|................................|..........kkkkkkkkkkk...........|.........kBBBBBBBBBBCkk.........|.........kBCCCCCCCCCCBCkkk......|.......kkkBCCDCCDCCCCCCBBCkk....|....kkkBBBCCDCGCGDCCCCCCCCBCk...|...kBBBCCCCDCGGGGGDCCCCCCCCEk...|..kBCCCCCCCDCGGGGGDCCCCCCCDk....|..kCCCCCCCCCCCGGGCCCCCCCCCDk....|...kBCCCCCDCCCCGCCCDCCCCCCDk....|...kBCCCCCDCCCCCCCCDCCCCCCDk....|...kBCCCCCDCCCCCCCCDCCCCCCEk....|...kCCCCCCDCCCCCCCCDCCCCCDk.....|....kBCCCCDCCCCCCCCDCCCCCDk.....|....kBCCCCDCCCCCCCCDCCCCCDk.....|....kBCCCCDCCC:CCCCDCCCCCDk.....|....kCCCCCCCC:::CCCCCCCCCEk.....|.....kBCCCCD:::::CDCCCCCDk......|.....kBCCCCDCC:CCCDCCCCCDk......|.....kCCCCCCD:::CDCCCCCCDk......|......kBCCCCCDCCDCCCCCCCDk......|......kBCCCCCCCCCCCCCCCCEk......|......kBCCCCCCCCCCCCCCCDk.......|......kCCCCCDDDDDDDDDDCDk.......|.......kBDDEkkkkkkkkkkCEk.......|.......kDkkk..........kk........|........k.......................|................................|................................|................................",
    "buendel": "................................|................................|................................|................................|......................k.........|..........k..........k3k........|.........k2k........k2k.........|.........k33k......k24k.........|..........k23k....k235k.........|..........k244kkkk245k..........|..........k3xxxxxxxxyk..........|.........kk2xyyyyyyyzkk.........|........k222yzzzzzzzA34k........|.......k2222222222333334k.......|......k222222222223333344k......|.....k22222222222233333445k.....|....k3222222222223333334445k....|....k3222222222233333344455k....|....k3222222222333334444455k....|....k3322222333333443444455k....|....k3333333333344334444555k....|....k3333333334433444445555k....|....k3333333443334444455555k....|....k4433344334444444555555k....|.....k44444444444445555555k.....|......k444444444455555555k......|.......k5444445555555555k.......|........k55555555555555k........|.........kk5555555555kk.........|...........kkkkkkkkkk...........|................................|................................"
  };
  // Ikone nach Art und Namen raten, wenn das Ding weder `pixel` noch `ikone` trägt: [Muster, Ikone, nur für diese Arten]
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
  var ARTIKONE = {
    waffe: 'schwert', ruestung: 'ruestung', kleidung: 'kleidung', kostuem: 'kostuem', instrument: 'laute', werkzeug: 'werkzeug',
    schreibzeug: 'feder', licht: 'kerze', seil: 'seil', behaelter: 'rucksack', schlafzeug: 'decke', tierbedarf: 'striegel', boot: 'boot',
    ration: 'ration', proviant: 'schlauch', trank: 'trank', papier: 'rolle', brief: 'brief', karte: 'karte',
    zeichen: 'band', andenken: 'flagge', fund: 'perle', wertsache: 'beutel', spiel: 'karten', sonstiges: 'buendel'
  };
  // Arten, bei denen der Name die Ikone nicht ändert (ein Hanfseil bleibt ein Seil, Rationen bleiben Rationen)
  var FEST = { seil: 1, ration: 1, spiel: 1, boot: 1 };
  var ARTNAME = {
    waffe: 'Waffe', ruestung: 'Rüstung', kleidung: 'Kleidung', kostuem: 'Kostüm', instrument: 'Instrument', werkzeug: 'Werkzeug',
    schreibzeug: 'Schreibzeug', licht: 'Licht', seil: 'Seil', behaelter: 'Behälter', schlafzeug: 'Schlafzeug', tierbedarf: 'Für Tiere',
    boot: 'Boot', ration: 'Proviant', proviant: 'Proviant', trank: 'Trank', papier: 'Schriftstück', brief: 'Brief', karte: 'Karte',
    zeichen: 'Zeichen', andenken: 'Andenken', fund: 'Fundstück', wertsache: 'Wertsache', spiel: 'Spiel', sonstiges: ''
  };
  function ikoneVon(d) {
    if (d.ikone && IKONEN[d.ikone]) return d.ikone;
    if (!FEST[d.art]) for (var i = 0; i < RATEN.length; i++) {
      var r = RATEN[i];
      if (r[0].test(d.name || '') && (!r[2] || r[2].indexOf(d.art) >= 0)) return r[1];
    }
    return ARTIKONE[d.art] || 'punkt';
  }
  // Ein Raster ist gültig, wenn es 16 oder 32 Zeilen gleicher Länge hat und nur Farben aus FARBEN nutzt
  function rasterFehler(r) {
    if (typeof r !== 'string') return 'Ein Raster ist Text.';
    var z = r.split('|'), n = z.length;
    if (n !== 16 && n !== 32) return 'Ein Raster hat 16 oder 32 Zeilen, dieses ' + n + '.';
    for (var i = 0; i < n; i++) {
      if (z[i].length !== n) return 'Zeile ' + (i + 1) + ' hat ' + z[i].length + ' Zeichen statt ' + n + '.';
      for (var j = 0; j < n; j++) if (z[i][j] !== '.' && !FARBEN[z[i][j]]) return 'Zeichen „' + z[i][j] + '“ in Zeile ' + (i + 1) + ' ist keine Farbe.';
    }
    return '';
  }
  // Das Raster eines Dings: die eigene Ikone, sonst eine aus der Sammlung
  function rasterVon(d) { return d.pixel && !rasterFehler(d.pixel) ? d.pixel : IKONEN[ikoneVon(d)] || IKONEN.punkt; }
  var benutzt = {}, symbolCache = {};
  function kennung(r) { var h = 5381; for (var i = 0; i < r.length; i++) h = ((h << 5) + h + r.charCodeAt(i)) | 0; return 'gpx' + (h >>> 0).toString(36); }
  // Jede Ikone steht einmal als <symbol> im Tisch; die Zeilen verweisen nur darauf
  function pixel(raster, klasse) {
    var id = kennung(raster);
    benutzt[id] = raster;
    return '<svg class="' + (klasse || 'gpPx') + '" viewBox="0 0 32 32" aria-hidden="true"><use href="#' + id + '" width="32" height="32"/></svg>';
  }
  function symbol(id) {
    if (symbolCache[id]) return symbolCache[id];
    var z = benutzt[id].split('|'), n = z.length, wege = {}, s = '';
    // Je Farbe ein Pfad aus waagrechten Streifen
    z.forEach(function (r, y) {
      var x = 0;
      while (x < r.length) {
        var c = r[x], k = 1;
        while (x + k < r.length && r[x + k] === c) k++;
        if (c !== '.') wege[c] = (wege[c] || '') + 'M' + x + ' ' + y + 'h' + k + 'v1h-' + k + 'z';
        x += k;
      }
    });
    Object.keys(wege).forEach(function (c) { s += '<path fill="' + FARBEN[c] + '" d="' + wege[c] + '"/>'; });
    return (symbolCache[id] = '<symbol id="' + id + '" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges">' + s + '</symbol>');
  }

  /* ---------- Schema für die Prüfung (pruefen.js) ---------- */
  var SCHEMA = {
    name: 'Inventar',
    wurzel: 'inventar',
    felder: {
      inventar: { titel: 'text', stand: 'text', figur: 'text', geld: 'geld', esser: 'zahl', traeger: 'traeger[]' },
      geld: { pm: 'zahl', ga: 'zahl', em: 'zahl', sm: 'zahl', km: 'zahl' },
      traeger: { id: 'id', name: 'text', namen: 'text[]', art: 'traegerart', staerke: 'zahl', faktor: 'zahl', ort: 'text', dinge: 'ding[]' },
      ding: { name: 'text', namen: 'text[]', art: 'dingart', ikone: 'ikone', pixel: 'raster', anzahl: 'zahl', kg: 'zahl',
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
    return w;
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
      var raster = null;
      (t.dinge || []).forEach(function (d) { if (d && d.art === 'ration') { n += anzahlVon(d); raster = raster || rasterVon(d); } });
      if (n) rat.push({ t: t, n: n, raster: raster });
      if (t.art !== 'lager') summe += n;
    });
    if (rat.length) {
      var esser = Math.max(1, zahl(D.esser, 1));
      h += '<div class="gpBlock"><p class="gpH">' + ikon('baguette', 18) + 'Rationen</p><div class="gpRat">';
      rat.forEach(function (r) {
        var brote = '';
        for (var i = 0; i < Math.min(r.n, 8); i++) brote += pixel(r.raster, 'gpPxK');
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
          var n = anzahlVon(d), id = 'gp' + ti + '-' + (nr++), werte = werteVon(d), raster = rasterVon(d);
          h += '<li><button type="button" class="gpZ" data-i="' + id + '" aria-expanded="false" aria-controls="' + id + '">' +
            '<span class="gpIk">' + pixel(raster) + (n !== 1 ? '<b class="gpAnz">' + n + '</b>' : '') + '</span>' +
            '<span class="gpN">' + esc(d.name) + (d.zustand ? '<small class="gpZu">' + esc(d.zustand) + '</small>' : '') + '</span>' +
            '<span class="gpF"></span><span class="gpH1">' + esc(hauptwert(d)) + '</span><span class="gpW">' + (d.kg ? kg(gewicht(d)) : '–') + '</span></button>';
          // Das Fenster beim Antippen: die Ikone groß, dann die Werte, der Wortlaut und der Glossarknopf
          h += '<div class="gpD" id="' + id + '" hidden><div class="gpDk"><span class="gpIkG">' + pixel(raster, 'gpPxG') + '</span>' +
            '<p class="gpDn">' + esc(d.name) + (ARTNAME[d.art] ? '<small>' + ARTNAME[d.art] + '</small>' : '') + '</p></div>';
          if (werte.length) {
            h += '<dl class="gpSt">';
            werte.forEach(function (w) { h += '<div' + (w[2] ? ' class="gpBreit"' : '') + '><dt>' + w[0] + '</dt><dd>' + esc(w[1]) + '</dd></div>'; });
            h += '</dl>';
          }
          if (d.merkmale && d.merkmale.length) h += '<p class="gpMm">' + d.merkmale.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</p>';
          if (d.wortlaut) h += '<details class="gpWl"><summary>Wortlaut</summary><blockquote>' + esc(d.wortlaut) + '</blockquote></details>';
          if (d.glossar) h += '<button type="button" class="gpK" data-glossar="' + esc(d.glossar) + '">Glossar ' + esc(d.glossar) + ' ↗</button>';
          h += '</div>';
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
    '.gpBrot{display:inline-flex;align-items:center}.gpBrot small{font-size:13px;margin-left:3px}',
    '.gpPxK{display:block;width:32px;height:32px;image-rendering:pixelated;margin-left:-15px}.gpPxK:first-child{margin-left:0}',
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
    '.gpIk{position:relative;flex-shrink:0;width:38px;height:38px;display:grid;place-items:center;border-radius:6px;background:linear-gradient(180deg,#3a4a6e,#26304d);box-shadow:inset 0 0 0 1px #8fa3cf,0 0 0 1px #141a2b}',
    '.gpPx{display:block;width:32px;height:32px;image-rendering:pixelated}',
    '.gpDk{display:flex;align-items:center;gap:12px}',
    '.gpIkG{flex-shrink:0;width:72px;height:72px;display:grid;place-items:center;border-radius:8px;background:linear-gradient(180deg,#3a4a6e,#26304d);box-shadow:inset 0 0 0 1px #8fa3cf,0 0 0 1px #141a2b}',
    '.gpPxG{display:block;width:64px;height:64px;image-rendering:pixelated}',
    '.gpDn{font:400 19px/1.2 "IM Fell English","EB Garamond",Georgia,serif;color:#fff;display:flex;flex-direction:column;min-width:0}',
    '.gpDn small{font:italic 14px "EB Garamond",Georgia,serif;color:#b9c6e6}',
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
    var hinweise = [], fehler = [], zeilen = h.stand.split('\n');
    // Eigene Ikonen: Form und Farben des Rasters (was darauf zu sehen ist, liest die Spielleitung selbst, Regelwerk 4.4)
    (D.traeger || []).forEach(function (t) {
      (t && Array.isArray(t.dinge) ? t.dinge : []).forEach(function (d) {
        if (!d || d.pixel === undefined) return;
        var f = rasterFehler(d.pixel);
        if (f) fehler.push('Ding „' + d.name + '“ (pixel): ' + f);
      });
    });
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
    return { hinweise: hinweise, fehler: fehler };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { zeichne: zeichne, SCHEMA: SCHEMA, zusatz: zusatz, version: VERSION, IKONEN: IKONEN, FARBEN: FARBEN, ikoneVon: ikoneVon, rasterFehler: rasterFehler };
  else (function warten(n) { if (!start() && n < 60) setTimeout(function () { warten(n + 1); }, 50); })(0);
})();
