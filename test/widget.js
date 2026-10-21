// Baut den Widget-Code: Kartendaten plus Renderer, leicht verdichtet.
'use strict';
var fs = require('fs'), path = require('path');
var daten = require(process.env.KARTE_DATEN || path.join(__dirname, '..', 'daten', 'fuerchtegott.js'));
var js = fs.readFileSync(path.join(__dirname, '..', 'karte.js'), 'utf8');
js = js.replace(/^\/\*[\s\S]*?\*\/\n/, '').split('\n').map(function (z) { return z.trim(); })
  .filter(function (z) { return z && z.indexOf('//') !== 0 && !/^\/\*.*\*\/$/.test(z); }).map(function (z) { return z.replace(/;\s+\/\/.*$/, ';'); }).join('\n');
var html = '<h2 class="sr-only">Karte mit den Orten, Wegen und Reisezeiten, die die Figur kennt</h2>\n' +
  '<div id="karte">Karte lädt …</div>\n<script>var KARTE=' + JSON.stringify(daten) + ';</script>\n<script>\n' + js + '\n</script>';
fs.writeFileSync(path.join(__dirname, 'widget.html'), html);
console.log('widget.html', Math.round(html.length / 1024), 'KB');
