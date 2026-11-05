/*
 * Wegwart-Titel – Titelbildschirm für die geteilte Welt „Die Wege von Oerik“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Titelbildschirm: Die Wege von Oerik</h2>
 *   <div id="titel">Titelbild lädt … Falls nicht, schreib „Spiel laden“.</div>
 *   <script>var TITEL={fuss:'…', buch:'…', befehle:['Questlog', …], figuren:[{name:'Probefigur', …}]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/titel.js';document.head.appendChild(s);<\/script>
 *
 * Ein Ölgemälde malt sich selbst, grob bis fein: eine Weltlandschaft in der Dämmerung unter Luna und
 * Celene, Wegweiser und Laterne im Vordergrund, zuletzt die Goldlettern „Die Wege von Oerik“. Darunter das
 * Menü mit Spiel laden, Spielerbuch und Befehlen; Spiel laden öffnet die Spielstände, ein Platz je
 * Figur. Knöpfe schicken ihr Wort per sendPrompt. Bei reduzierter Bewegung erscheint das Bild fertig;
 * canvas[data-fertig] zeigt, dass es fertig ist. Die Lettern sind aus IM Fell (Igino Marini,
 * SIL Open Font License 1.1) als Pfade eingebacken. Felder: README, Abschnitt „Titel“.
 * Szene, Malwerk und Lettern stehen ganz in dieser Datei; im Spiel ändert die Spielleitung nur die Daten.
 */
(function () {
function start(T, root) {
T=T||{};
root.textContent='';
if(!document.querySelector('link[data-ts-schrift]')){var lk=document.createElement('link');lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&display=swap';lk.setAttribute('data-ts-schrift','');document.head.appendChild(lk);}
var css=document.createElement('style');
css.textContent='#titel{max-width:1040px;margin:0 auto;font-family:"IM Fell English",Georgia,"Times New Roman",serif;color:#e6d6ae}'
+'#titel .ts-bild{display:block;width:100%;height:auto;background:#17110c;border-radius:4px 4px 0 0}'
+'#titel .ts-panel{background:#17110c;border-radius:0 0 4px 4px;padding:6px 13px 13px}'
+'#titel .ts-innen{border:1px solid rgba(168,134,74,.55);border-top:none;padding:14px 12px 12px;min-height:212px;display:flex;flex-direction:column;align-items:center}'
+'#titel button{font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;margin:0;box-shadow:none}'
+'#titel .ts-haupt{font-family:"IM Fell English SC",Georgia,serif;font-size:25px;color:#ecc66c;padding:8px 22px;min-height:48px;letter-spacing:.03em;border-radius:6px}'
+'#titel .ts-haupt:hover,#titel .ts-cmd:hover,#titel .ts-klein:hover,#titel .ts-zurueck:hover{color:#fff0c4;background:rgba(236,198,108,.08)}'
+'#titel button:focus-visible,#titel a:focus-visible{outline:1px solid #a8864a;outline-offset:2px}'
+'#titel .ts-raute{display:inline-block;width:7px;height:7px;border:1px solid #a8864a;transform:rotate(45deg);margin:0 12px 5px;vertical-align:middle}'
+'#titel .ts-regel{width:62%;border-top:1px solid rgba(168,134,74,.45);margin:8px 0 10px}'
+'#titel .ts-befehle{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 4px;max-width:420px}'
+'#titel .ts-cmd{font-family:"IM Fell English SC",Georgia,serif;font-size:18px;color:#d9b866;padding:8px 10px;min-height:44px;border-radius:6px;text-decoration:none;display:inline-flex;align-items:center}'
+'#titel .ts-klein{font-size:15px;font-style:italic;color:#b8a27a;padding:8px 10px;min-height:40px;border-radius:6px;margin-top:4px}'
+'#titel .ts-fuss{font-size:13px;color:#8f7d5c;margin-top:6px;text-align:center}'
+'#titel .ts-kopf{font-family:"IM Fell English SC",Georgia,serif;font-size:22px;color:#ecc66c;margin:2px 0 2px}'
+'#titel .ts-unter{font-size:14px;font-style:italic;color:#a8946c;margin-bottom:10px}'
+'#titel .ts-slot{display:block;box-sizing:border-box;width:100%;max-width:440px;text-align:left;background:#2a1f15;color:#e6d6ae;border:1px solid #a8864a;border-radius:6px;padding:11px 14px 12px;margin:0 0 10px}'
+'#titel button.ts-slot:hover{background:#35281b!important;border-color:#ecc66c}'
+'#titel .ts-slot span{display:block}'
+'#titel .ts-datum{font-size:14px;color:#c4ad80;display:flex!important;align-items:center;gap:7px}'
+'#titel .ts-mond{width:18px;height:18px;flex:none}'
+'#titel .ts-name{font-family:"IM Fell English SC",Georgia,serif;font-size:23px;line-height:1.15;margin:3px 0 1px;color:#ecc66c}'
+'#titel .ts-zeile{font-size:15px;color:#e6d6ae}'
+'#titel .ts-ort{font-size:15px;color:#d8c69c;font-style:italic;margin-bottom:6px}'
+'#titel .ts-balken{font-size:13px;color:#c4ad80;margin-top:5px}'
+'#titel .ts-spur{height:5px;background:#4a3a26;border-radius:3px;margin-top:3px;overflow:hidden}'
+'#titel .ts-spur i{display:block;height:100%;background:#d9b866}'
+'#titel .ts-sfuss{display:flex!important;justify-content:space-between;align-items:baseline;gap:8px;font-size:14px;color:#c4ad80;margin-top:9px;border-top:1px solid rgba(168,134,74,.4);padding-top:7px}'
+'#titel .ts-laden{font-family:"IM Fell English SC",Georgia,serif;font-size:17px;color:#ecc66c;white-space:nowrap}'
+'#titel .ts-leer{background:none;border:1px dashed rgba(168,134,74,.55);color:#a8946c}'
+'#titel .ts-leer .ts-name{color:#b8a27a;font-size:19px}'
+'#titel .ts-leer .ts-zeile{color:#8f7d5c;font-style:italic}'
+'#titel .ts-zurueck{font-family:"IM Fell English SC",Georgia,serif;font-size:18px;color:#d9b866;padding:8px 14px;min-height:44px;border-radius:6px}'
+'#titel .ts-sicht{animation:tsauf .35s ease-out}@keyframes tsauf{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'
+'#titel .ts-hinweis{font-size:14px;font-style:italic;color:#c4ad80;text-align:center;padding:10px 6px 2px}'
+'@media (prefers-reduced-motion:reduce){#titel .ts-sicht{animation:none}}'
/* Die Chat-Ansicht der Android-App (helles Design) zwingt Knöpfen ihre eigene Schrift- und Hintergrundfarbe auf.
   Darum stehen die Farben aller Knöpfe und ihres Inhalts hier noch einmal mit !important, auch als Textfüllfarbe,
   und die Spielstandkarte ist dunkel mit heller Schrift: Fällt ihr Hintergrund weg, bleibt sie trotzdem lesbar. */
+'#titel button,#titel button *{-webkit-text-fill-color:currentColor!important}'
+'#titel .ts-haupt{color:#ecc66c!important}'
+'#titel .ts-cmd,#titel .ts-zurueck{color:#d9b866!important}'
+'#titel .ts-klein{color:#b8a27a!important}'
+'#titel .ts-haupt:hover,#titel .ts-cmd:hover,#titel .ts-klein:hover,#titel .ts-zurueck:hover{color:#fff0c4!important}'
+'#titel button.ts-slot{color:#e6d6ae!important;background:#2a1f15!important}'
+'#titel .ts-slot .ts-name{color:#ecc66c!important}'
+'#titel .ts-slot .ts-zeile{color:#e6d6ae!important}#titel .ts-slot .ts-ort{color:#d8c69c!important}'
+'#titel .ts-slot .ts-datum,#titel .ts-slot .ts-balken,#titel .ts-slot .ts-sfuss{color:#c4ad80!important}'
+'#titel .ts-slot .ts-laden{color:#ecc66c!important}'
+'#titel .ts-slot.ts-leer{color:#a8946c!important;background:none!important}'
+'#titel .ts-leer .ts-name{color:#b8a27a!important}'
+'#titel .ts-leer .ts-zeile{color:#8f7d5c!important}';
root.appendChild(css);
var cv=document.createElement('canvas');cv.width=1040;cv.height=780;cv.className='ts-bild';cv.setAttribute('role','img');
cv.setAttribute('aria-label','Ölgemälde: Weltlandschaft in der Dämmerung unter den zwei Monden von Oerth. Vorn auf einer Anhöhe steht an einer Wegkreuzung ein verwitterter Wegweiser mit drei leeren Armen und einer brennenden Laterne, daneben ein alter Meilenstein; die Wege laufen als helle Bänder in die Tiefe, rechts rahmt ein krummer Baum das Bild. Dahinter Felder, ein dunkler Waldrücken und ein Fluss in großer S-Kurve mit einer kleinen Stadt und wenigen Lichtern. In der Ferne links ein Gebirge mit rosigem Schnee, rechts ein Streifen Meer mit einem winzigen Segel. Am Himmel die silberne Luna und die kleine aquamarine Celene, darüber in Blattgold „Die Wege von Oerik“.');
root.appendChild(cv);
var pn=document.createElement('div');pn.className='ts-panel';root.appendChild(pn);
var inn=document.createElement('div');inn.className='ts-innen';pn.appendChild(inn);
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e;}
var hin=document.createElement('div');hin.className='ts-hinweis';hin.hidden=true;pn.appendChild(hin);
function send(t){if(typeof sendPrompt==='function'){sendPrompt(t);return true;}hin.textContent='Im Spiel schickt dieser Knopf „'+t+'“ in den Chat.';hin.hidden=false;return false;}
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
function mondName(a){return a==0?'Dunkelmond':a<7?'zunehmende Sichel':a==7?'erstes Viertel':a<14?'zunehmender Mond':a==14?'Vollmond':a<21?'abnehmender Mond':a==21?'letztes Viertel':'abnehmende Sichel';}
function mond(wt){var c=document.createElement('canvas');c.width=36;c.height=36;c.className='ts-mond';var a=((wt-25)%28+28)%28,f=a/28;c.setAttribute('role','img');c.setAttribute('aria-label','Luna: '+mondName(a));
var x=c.getContext('2d'),r=15,k=Math.cos(2*Math.PI*f),zu=f<0.5,si=k>0;x.fillStyle='#120d09';x.beginPath();x.arc(18,18,r,0,6.3);x.fill();
if(a!=0){x.fillStyle='#f3e3b4';x.beginPath();x.arc(18,18,r-1,-Math.PI/2,Math.PI/2,!zu);x.ellipse(18,18,(r-1)*Math.abs(k),r-1,0,Math.PI/2,-Math.PI/2,zu===si);x.fill();}
x.strokeStyle='#a8864a';x.lineWidth=1.5;x.beginPath();x.arc(18,18,r,0,6.3);x.stroke();return c;}
function balken(t,q){var w=el('span','ts-balken',t),s=el('span','ts-spur'),i=document.createElement('i');i.style.width=Math.round(Math.max(0,Math.min(1,q))*100)+'%';s.appendChild(i);w.appendChild(s);return w;}
function zeig(n){inn.textContent='';n.classList.add('ts-sicht');inn.appendChild(n);}
function menue(){var m=el('div');m.style.cssText='display:flex;flex-direction:column;align-items:center;width:100%';
var h=el('button','ts-haupt');h.appendChild(el('span','ts-raute'));h.appendChild(document.createTextNode('Spiel laden'));h.appendChild(el('span','ts-raute'));h.onclick=staende;m.appendChild(h);
m.appendChild(el('div','ts-regel'));
var g=el('div','ts-befehle');
if(T.buch){var a=el('a','ts-cmd','Spielerbuch');a.href=T.buch;a.target='_blank';a.rel='noopener';g.appendChild(a);}
(T.befehle||[]).forEach(function(b){var e=el('button','ts-cmd',b);e.onclick=function(){send(b);};g.appendChild(e);});
m.appendChild(g);
if(T.einfuehrung!==false){var k=el('button','ts-klein','Wie wird gespielt?');k.onclick=function(){send('(Wie wird gespielt?)');};m.appendChild(k);}
if(T.fuss)m.appendChild(el('div','ts-fuss',T.fuss));
zeig(m);}
function staende(){var w=el('div');w.style.cssText='display:flex;flex-direction:column;align-items:center;width:100%';
w.appendChild(el('div','ts-kopf','Spielstände'));w.appendChild(el('div','ts-unter','Ein Platz je Figur'));
var erst=null;(T.figuren||[]).forEach(function(f){var b=el('button','ts-slot');b.setAttribute('aria-label','Spielstand von '+f.name+' laden');
var d=el('span','ts-datum');if(f.welttag)d.appendChild(mond(f.welttag));d.appendChild(document.createTextNode((f.datum||'')+(f.tageszeit?' · '+f.tageszeit:'')));b.appendChild(d);
b.appendChild(el('span','ts-name',f.name));if(f.zeile)b.appendChild(el('span','ts-zeile',f.zeile));if(f.ort)b.appendChild(el('span','ts-ort',f.ort));
if(f.frist)b.appendChild(balken('Tag '+f.frist[0]+' von '+f.frist[1]+(f.frist[2]?' · '+f.frist[2]:''),f.frist[0]/f.frist[1]));
if(f.ep){var e0=f.ep[3]||0;b.appendChild(balken('EP '+fmt(f.ep[0])+' von '+fmt(f.ep[1])+(f.ep[2]?' bis Stufe '+f.ep[2]:''),(f.ep[0]-e0)/(f.ep[1]-e0)));}
var s=el('span','ts-sfuss');s.appendChild(el('span','',(f.sitzung?'Nach Sitzung '+f.sitzung:'')+(f.held?' · ✦ Heldenmut':'')));var l=el('span','ts-laden','Laden ↗');s.appendChild(l);b.appendChild(s);
b.onclick=function(){if(b.getAttribute('data-l'))return;b.setAttribute('data-l','1');l.textContent='Wird geladen …';if(!send(f.laden||('Spiel laden: '+f.name))){b.removeAttribute('data-l');l.textContent='Laden ↗';}};
w.appendChild(b);if(!erst)erst=b;});
if(T.frei!==false){var v=el('div','ts-slot ts-leer');v.appendChild(el('span','ts-name','Freier Platz'));v.appendChild(el('span','ts-zeile',T.frei||'Für eine neue Figur oder einen Nachfolger'));w.appendChild(v);}
var z=el('button','ts-zurueck','‹ Zurück');z.onclick=menue;w.appendChild(z);
zeig(w);if(erst)erst.focus({preventScroll:true});}
menue();
var W=1040,H=780,N=W*H,V=cv.getContext('2d');
var RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var S=20261105,i;
function rnd(){S=S+0x6D2B79F5|0;var t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(a,b){return a+(b-a)*rnd();}
function mk(){var c=document.createElement('canvas');c.width=W;c.height=H;return c;}
function sp(c,p,cl){var n=p.length,i,a,b,d,e;c.moveTo(p[0][0],p[0][1]);if(n<2)return;for(i=0;i<(cl?n:n-1);i++){a=p[(i-1+n)%n];b=p[i];d=p[(i+1)%n];e=p[(i+2)%n];if(!cl){if(i==0)a=b;if(i+2>=n)e=d;}c.bezierCurveTo(b[0]+(d[0]-a[0])/6,b[1]+(d[1]-a[1])/6,d[0]-(e[0]-b[0])/6,d[1]-(e[1]-b[1])/6,d[0],d[1]);}if(cl)c.closePath();}
function fl(c,p,f){c.beginPath();sp(c,p,1);c.fillStyle=f;c.fill();}
function ln(c,p,w,s){c.beginPath();sp(c,p,0);c.lineWidth=w;c.strokeStyle=s;c.lineCap='round';c.lineJoin='round';c.stroke();}
function LG(c,x0,y0,x1,y1,st){var g=c.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)g.addColorStop(st[i],st[i+1]);return g;}
function RG(c,x,y,r,st){var g=c.createRadialGradient(x,y,0,x,y,r);for(var i=0;i<st.length;i+=2)g.addColorStop(st[i],st[i+1]);return g;}
function glow(c,x,y,r,col,a,op){c.save();c.globalCompositeOperation=op||'source-over';c.fillStyle=RG(c,x,y,r,[0,'rgba('+col+','+a+')',0.45,'rgba('+col+','+(a*0.4)+')',1,'rgba('+col+',0)']);c.fillRect(x-r,y-r,2*r,2*r);c.restore();}
function eg(c,x,y,sx,r,col,a,op){c.save();c.translate(x,y);c.scale(sx,1);glow(c,0,0,r,col,a,op);c.restore();}
function hx(s){return[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];}
function dcol(th,s){return'rgb('+Math.round(128+127*Math.cos(2*th))+','+Math.round(128+127*Math.sin(2*th))+','+s+')';}
function mixc(a,b,t){t=t<0?0:t>1?1:t;return'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')';}
var OC=mk(),O=OC.getContext('2d'),REF=mk(),R=REF.getContext('2d'),DIRC=mk(),D=DIRC.getContext('2d'),RFL=mk(),F=RFL.getContext('2d'),HV=mk(),Hc=HV.getContext('2d');
var A=[],BG=[],bgMask=null,DM=null;
function prepB(s,v){var K=s.K;v=v||0.12;s.bo=[];s.bl=[];s.bc=[];s.ba=[];for(var b=0;b<K;b++){s.bo.push(((b+0.5)/K*2-1)*0.8+rr(-0.1,0.1));s.bl.push(rr(0.5,1));s.bc.push(rr(1-v,1+v));s.ba.push(rr(0.35,0.85));}}
function mkst(p,w,col,al,hb,K,v){var st={p:p,R:w/2,c:hx(col),al:al,hb:hb,K:K};prepB(st,v||0.08);return st;}
function clampA(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;if(a>0.12&&a<=Math.PI/2)a=0.12;else if(a>Math.PI/2&&a<Math.PI-0.12)a=Math.PI-0.12;return a;}
function at(t,u){var n=t.pts.length-1,f=Math.max(0,Math.min(n-0.0001,u*n)),i=Math.floor(f),g=f-i,a=t.pts[i],b=t.pts[i+1];return[a[0]+(b[0]-a[0])*g,a[1]+(b[1]-a[1])*g,a[2]+(b[2]-a[2])*g];}
function grow(arr,x,y,ang,L,bw,d){var sg=[[x,y,bw]],cx=x,cy=y,a=ang,m=4,k;for(k=1;k<=m;k++){a=clampA(a+rr(-0.2,0.2));cx+=Math.cos(a)*L/m;cy+=Math.sin(a)*L/m;sg.push([cx,cy,Math.max(0.7,bw*(1-0.72*k/m))]);}arr.push(sg);if(d>0){var nc=Math.floor(rr(1,3.3));for(var j=0;j<nc;j++){var q=sg[1+Math.floor(rr(0,m-1))],sd=rnd()<0.5?-1:1;grow(arr,q[0],q[1],clampA(a+sd*rr(0.3,0.9)),L*rr(0.32,0.6),Math.max(0.7,q[2]*0.75),d-1);}}}
function mkTree(x,by,h,w,lean,nb){var t={h:h,pts:[],br:[]},n=10,i,u,bend=rr(-0.03,0.03)*h;for(i=0;i<=n;i++){u=i/n;t.pts.push([x+lean*h*u+bend*Math.sin(u*Math.PI),by-h*u,Math.max(1,w*(1-0.68*u)*(u<0.12?1+Math.pow((0.12-u)/0.12,2)*0.9:1))]);}for(i=0;i<nb;i++){u=rr(0.4,0.93);var sd=i%2?1:-1,p=at(t,u),ang=clampA(-Math.PI/2+sd*rr(0.35,1.15)),L=h*rr(0.1,0.28)*(1.15-u*0.5);grow(t.br,p[0],p[1],ang,L,Math.max(1,p[2]*rr(0.3,0.55)),2);}return t;}
function trunkPath(c,t){var n=t.pts.length,i,p,tp=t.pts[n-1];c.beginPath();for(i=0;i<n;i++){p=t.pts[i];if(i)c.lineTo(p[0]-p[2]/2,p[1]);else c.moveTo(p[0]-p[2]/2,p[1]+3);}c.lineTo(tp[0]-tp[2]*0.2,tp[1]-tp[2]*1.8);c.lineTo(tp[0]+tp[2]*0.32,tp[1]-tp[2]*1.2);for(i=n-1;i>=0;i--){p=t.pts[i];c.lineTo(p[0]+p[2]/2,p[1]+(i?0:3));}c.closePath();}
function dirTree(t){trunkPath(D,t);D.fillStyle=dcol(Math.PI/2,235);D.fill();D.lineCap='round';t.br.forEach(function(sg){for(var k=1;k<sg.length;k++){var a=Math.atan2(sg[k][1]-sg[k-1][1],sg[k][0]-sg[k-1][0]);D.beginPath();D.moveTo(sg[k-1][0],sg[k-1][1]);D.lineTo(sg[k][0],sg[k][1]);D.lineWidth=sg[k][2]+5;D.strokeStyle=dcol(a,225);D.stroke();}});}
function tstr(t,col,hb,K,rim){var pts=t.pts.map(function(p){return[p[0],p[1]];}),w0=t.pts[0][2],tp=t.pts[t.pts.length-1],st={p:pts,R:w0/2,c:hx(col),al:1,hb:hb,K:K,op:1,ws:t.pts.map(function(p){return p[2]/w0;})};prepB(st,0.1);A.push(st);A.push(mkst([[tp[0],tp[1]+1],[tp[0]-tp[2]*0.1,tp[1]-tp[2]*0.8],[tp[0]-tp[2]*0.25,tp[1]-tp[2]*1.7]],tp[2]*0.7,col,1,hb,0));t.br.forEach(function(sg){A.push(mkst(sg.map(function(p){return[p[0],p[1]];}),Math.max(1,sg[0][2]*1.05),col,1,hb,sg[0][2]>5?2:0));});
if(rim){var uu=rim.u0||0,u1=rim.u1||1,sc=440/Math.max(120,t.h);while(uu<u1){var ue=Math.min(u1,uu+rr(0.04,0.14)*sc),pp=[];for(var q=0;q<=4;q++){var pq=at(t,uu+(ue-uu)*q/4);pp.push([pq[0]+rim.side*pq[2]*rr(0.37,0.43),pq[1]]);}A.push(mkst(pp,(rim.w||1.8)*rr(0.6,1),rim.c,rim.a*rr(0.35,1),hb+10,0));uu=ue+rr(0.02,0.09)*sc;}}}
function cloud(c,x0,x1,y,th,top,mid,bot,a,n){c.save();c.globalAlpha=a;c.beginPath();for(var i=0;i<n;i++){var u=n>1?i/(n-1):0.5,x=x0+(x1-x0)*u+rr(-8,8),ry=th*rr(0.4,1)*(0.45+0.55*Math.sin(Math.max(0.05,u)*Math.PI)),rx=(x1-x0)/n*rr(0.9,1.7),yy=y+rr(-th*0.25,th*0.25);c.moveTo(x+rx,yy);c.ellipse(x,yy,rx,ry,0,0,6.29);}c.fillStyle=LG(c,0,y-th,0,y+th,[0,top,0.55,mid,1,bot]);c.fill();c.restore();}
function isW(x,y){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return false;var j=4*(y*W+x),b=DM[j+2];return b>=198&&b<=212&&DM[j]>235;}
function poly(c,P){c.beginPath();c.moveTo(P[0][0],P[0][1]);for(var k=1;k<P.length;k++)c.lineTo(P[k][0],P[k][1]);c.closePath();}
var HZ=362,CX=520,FOC=900,EYE=4.9,SUX=590;
var LU=[905,136,52],CE=[116,206,17],LAT=[303,568];
var LAY=[[15,2,10,0,0.96,3,52],[7,2,12,34,0.97,3,60],[3.4,1,10,32,0.98,2,68],[1.8,1,8,24,0.98,0,76]];
var MK=[[15,225,565,376,0.62],[530,362,1030,526,0.7],[540,520,930,704,0.85],[170,440,480,735,0.7],[15,376,540,530,0.85],[15,650,190,780,0.8],[600,700,920,780,0.8]];
var VG=0.2,GC=[30,22,20];
var ZS={},ZN='',S0=S;
function zs(n){ZS[ZN]=S;if(ZS[n]===undefined){var h=S0|0;for(var k=0;k<n.length;k++)h=Math.imul(h^n.charCodeAt(k),16777619);ZS[n]=h;}ZN=n;S=ZS[n];}
function lerp(a,b,t){return a+(b-a)*t;}
function k01(v){return v<0?0:v>1?1:v;}
function m3(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function rgbs(c){return'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')';}
function pig(c,a){var l=1+rr(-a,a);return[c[0]*l+rr(-3,3),c[1]*l+rr(-3,3),c[2]*l+rr(-3,3)];}
function ms(p,w,c,al,hb,K,v,ws){var s={p:p,R:w/2,c:typeof c=='string'?hx(c):c,al:al>1?1:al,hb:Math.max(90,Math.min(230,hb)),K:K||0};prepB(s,v||0.08);if(ws)s.ws=ws;if(al>=1)s.op=1;A.push(s);return s;}
function h2(i,j){var t=Math.imul(i*374761393+j*668265263^S0,1274126177);t=Math.imul(t^t>>>13,1103515245);return((t^t>>>16)>>>0)/4294967296;}
function vn(x,y){var i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);var a=h2(i,j),b=h2(i+1,j),c=h2(i,j+1),d=h2(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y){return 0.55*vn(x,y)+0.3*vn(x*2.1+3,y*2.1+7)+0.15*vn(x*4.3+1,y*4.3+5);}
function kr(P,m){var o=[],n=P.length,i,j;for(i=0;i<n-1;i++){var a=P[i>0?i-1:0],b=P[i],c=P[i+1],d=P[i+2<n?i+2:n-1];for(j=0;j<m;j++){var t=j/m,t2=t*t,t3=t2*t;o.push([0.5*(2*b[0]+(c[0]-a[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(3*b[0]-a[0]-3*c[0]+d[0])*t3),0.5*(2*b[1]+(c[1]-a[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(3*b[1]-a[1]-3*c[1]+d[1])*t3)]);}}o.push(P[n-1].slice());return o;}
function stift(Z,rxf,ryf){var L=[],Q=[],k;for(k=0;k<Z.length;k++){var a=Z[k>0?k-1:0],b=Z[k<Z.length-1?k+1:k],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,nx=-dy/m,ny=dx/m,y=Z[k][1],rx=rxf(y,k),ry=ryf(y,k),q=Math.sqrt(rx*rx*nx*nx+ry*ry*ny*ny)||1,ox=rx*rx*nx/q,oy=ry*ry*ny/q;L.push([Z[k][0]+ox,Z[k][1]+oy]);Q.push([Z[k][0]-ox,Z[k][1]-oy]);}return{L:L,Q:Q,P:L.concat(Q.slice().reverse())};}
function pfad(P){var f=new Path2D();f.moveTo(P[0][0],P[0][1]);for(var k=1;k<P.length;k++)f.lineTo(P[k][0],P[k][1]);f.closePath();return f;}
function schl(P){var f=new Path2D();sp(f,P,1);return f;}
var IDC=mk(),IC=IDC.getContext('2d'),IDD=null;
function idf(f,n){IC.fillStyle='rgb('+n*16+',0,0)';IC.fill(f);}
function idAt(x,y){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return 0;return IDD[4*(y*W+x)]>>4;}
function dunstF(x){var u=k01(1-Math.abs(x-SUX)/480);return x<SUX?m3([150,138,176],[226,178,150],u):m3([138,146,186],[226,178,150],u);}
function AP(c,x,y){var t=k01(1-(y-HZ)/250);return m3(c,dunstF(x),t*t*0.84);}
function wl(x,y,r){var d=Math.hypot(x-LAT[0],(y-LAT[1])*(y>LAT[1]?0.72:1));return k01(1-d/(r||170));}
function P3(X,Y,Z){return[CX+FOC*X/Z,HZ+FOC*(EYE-Y)/Z];}
function sZ(y){return(y-HZ)/EYE;}
var FZ=kr([[770,708],[838,668],[905,630],[893,598],[828,574],[768,540],[700,536],[640,510],[584,498],[548,474],[574,448],[640,434],[692,418],[760,412],[806,398],[786,388],[752,381],[736,372]],10);
var FB=stift(FZ,function(y,k){return Math.max(1.5,0.09*(y-HZ))*(1+0.26*Math.sin(k*0.19)+0.14*Math.sin(k*0.47+1))+Math.max(0,k-FZ.length+12)*0.5;},function(y,k){return Math.max(1.05,0.09*(y-HZ)/3.1)*(1+0.26*Math.sin(k*0.19)+0.14*Math.sin(k*0.47+1))+Math.max(0,k-FZ.length+12)*0.03;});
var VGK=[[-20,574],[110,582],[250,592],[400,610],[540,636],[690,672],[850,704],[1060,716]];
function rW(y){return 0.143*(y-HZ);}
function rH(y){return 0.143*(y-HZ)*(y-HZ)/FOC;}
var WV=stift(kr([[352,682],[392,712],[452,752],[530,806]],8),rW,rH),WL=stift(kr([[352,682],[270,666],[170,640],[60,616],[-40,598]],8),rW,rH),WR=stift(kr([[352,682],[450,674],[560,668],[650,667],[718,670]],8),rW,rH);
var WEG2=kr([[690,676],[706,658],[730,640],[746,616],[728,588],[672,556],[644,534],[632,522]],8),WEG3=kr([[664,462],[700,452],[742,442],[790,440],[836,428],[884,424]],6),WEG4=kr([[14,478],[70,454],[126,448],[176,432],[232,430],[286,414]],6);
var BAND={},FELD=[],HECKE=[],GTR=[],KAMM=[];
var W1=[[-30,470],[40,458],[108,474],[186,470],[258,490],[336,492],[398,510],[450,520],[482,562],[300,610],[-30,610]],W2=[[-30,502],[48,492],[136,514],[226,516],[306,536],[388,530],[462,552],[528,556],[572,582],[604,604],[616,626],[566,652],[300,652],[-30,642]];
function ober(P,x,n){for(var k=0;k<n;k++)if(x<P[k+1][0])return lerp(P[k][1],P[k+1][1],(x-P[k][0])/(P[k+1][0]-P[k][0]));return P[n][1];}
function streif(x0,x1,y,th,ct,cb,a){var p=[],k,n=14,ph=rr(0,6.3),u,e;for(k=0;k<=n;k++){u=k/n;e=Math.pow(Math.sin(Math.max(0.02,u)*Math.PI),0.7);p.push([lerp(x0,x1,u),y-th*e*(0.55+0.45*Math.sin(u*9+ph))]);}for(k=n;k>=0;k--){u=k/n;e=Math.pow(Math.sin(Math.max(0.02,u)*Math.PI),0.7);p.push([lerp(x0,x1,u),y+th*0.45*e*(0.6+0.4*Math.sin(u*13+ph*2))]);}R.save();R.globalAlpha=a;R.beginPath();sp(R,p,1);R.fillStyle=LG(R,0,y-th,0,y+th*0.5,[0,ct,1,cb]);R.fill();R.restore();}
function himmel(){zs('himmeld');
D.fillStyle=dcol(0,95);D.fillRect(0,0,W,HZ+2);
R.fillStyle=LG(R,0,0,0,HZ+2,[0,'#0b0d2c',0.18,'#11123a',0.36,'#1c1b4b',0.52,'#2f2860',0.66,'#4d3a6e',0.77,'#7a4f74',0.86,'#b06c74',0.93,'#d88f72',1,'#efb07a']);R.fillRect(0,0,W,HZ+2);
eg(R,SUX,HZ,4.6,170,'255,190,120',0.55);eg(R,SUX,HZ,5.4,44,'255,226,170',0.75);
R.fillStyle=LG(R,0,0,W,0,[0,'rgba(120,70,120,0.2)',0.3,'rgba(120,70,120,0)',0.72,'rgba(60,70,130,0)',1,'rgba(60,70,130,0.42)']);R.fillRect(0,230,W,134);
[[-40,330,118,12,'#14143f','#1c1a4e',0.55],[330,760,262,8,'#3c2f62','#5a4070',0.5],[660,1080,232,7,'#2c2a5e','#3c3366',0.5],[-40,470,270,9,'#3e3064','#6b4670',0.6],[540,1080,292,9,'#4a3866','#a8667a',0.7],[230,800,314,7,'#6e4a70','#e09a7a',0.72],[-40,430,332,7,'#7c5272','#d48c7c',0.7],[650,1080,338,6,'#8a5c74','#e0a488',0.75],[420,770,350,4,'#d88f76','#ffd7a0',0.7]].forEach(function(q){streif(q[0],q[1],q[2],q[3],q[4],q[5],q[6]);});}
function gebirge(){zs('gebirge');var GB=HZ+8,TR=[];
function mi(a,b){var x=(a[0]+b[0])/2,d=(a[1]+b[1])/2,h=(a[2]+b[2])/2,L=Math.hypot(a[0]-b[0],a[2]-b[2],(a[1]-b[1])*0.4),r=h2(Math.round(x*3.1),Math.round((d+h)*3.1)),q=h2(Math.round(x*3.1)+91,Math.round((d-h)*3.1)+17);return[x+(q-0.5)*L*0.2,d,Math.max(0,h+(r-0.4)*L*0.34)];}
function te(a,b,c,n){if(!n){TR.push([a,b,c]);return;}var u=mi(a,b),v=mi(b,c),w=mi(c,a);n--;te(a,u,w,n);te(u,b,v,n);te(w,v,c,n);te(u,v,w,n);}
[[60,62,96,70,80,10,30,3],[150,90,100,90,90,-10,34,4],[252,70,98,80,90,16,30,3],[345,54,92,80,90,10,28,3],[430,30,86,70,80,10,22,3],[500,13,80,50,50,6,16,2],[190,116,66,100,110,10,60,4],[92,84,60,90,84,16,50,4],[306,80,58,84,96,12,50,4],[396,44,52,70,84,10,36,3],[30,48,28,60,62,14,24,3],[138,44,26,62,66,-10,24,3],[246,40,24,66,70,10,22,3],[350,28,22,58,70,10,20,3],[452,14,20,46,56,6,14,2]].forEach(function(m){var P=[m[0],m[2],m[1]],L=[m[0]-m[3],m[2],0],Q=[m[0]+m[4],m[2],0],F=[m[0]+m[5],m[2]-m[6],0];te(L,P,F,m[7]);te(F,P,Q,m[7]);});
TR.sort(function(a,b){return(b[0][1]+b[1][1]+b[2][1])-(a[0][1]+a[1][1]+a[2][1]);});
TR.forEach(function(t,i){var a=t[0],b=t[1],c=t[2],ux=b[0]-a[0],ud=b[1]-a[1],uh=b[2]-a[2],vx=c[0]-a[0],vd=c[1]-a[1],vh=c[2]-a[2],nx=ud*vh-uh*vd,nd=uh*vx-ux*vh,nh=ux*vd-ud*vx;if(nh<0){nx=-nx;nd=-nd;nh=-nh;}var m=Math.hypot(nx,nd,nh)||1;nx/=m;nd/=m;nh/=m;
var lit=k01(nx*0.86-nd*0.28+nh*0.34),h=(a[2]+b[2]+c[2])/3,dm=(a[1]+b[1]+c[1])/3,sn=k01((h-54+26*(h2(Math.round(a[0]*2),Math.round(b[0]*2))-0.5))/6)*k01((nh-0.16)/0.2),l=Math.pow(lit,1.15),col=m3(m3([62,76,128],[170,114,134],l),m3([132,150,204],[255,224,216],Math.pow(lit,0.8)),sn),ae=0.1+0.5*Math.pow(1-k01(h/62),1.7)+dm/100*0.2;
col=m3(col,[190,164,186],k01(ae));var f=new Path2D(),X=function(v){return v[0];},Y=function(v){return GB-v[2]-v[1]*0.22;};f.moveTo(X(a),Y(a));f.lineTo(X(b),Y(b));f.lineTo(X(c),Y(c));f.closePath();
var s=rgbs(col);R.fillStyle=s;R.strokeStyle=s;R.lineWidth=0.7;R.fill(f);R.stroke(f);
var an=Math.atan2((nx*nx+nd*nd)/nh/nh-0.22*nd/nh,nx/nh+1e-4);D.strokeStyle=D.fillStyle=dcol(an,192);D.lineWidth=0.7;D.fill(f);D.stroke(f);
var z='rgb(16,'+(i&255)+','+(i>>8)+')';IC.fillStyle=IC.strokeStyle=z;IC.lineWidth=0.7;IC.fill(f);
if(sn>0.5||l>0.72){var cx=(X(a)+X(b)+X(c))/3,cy=(Y(a)+Y(b)+Y(c))/3;GTR.push({i:i,x:cx,y:cy,lit:lit,sn:sn,an:an,L:Math.hypot(X(b)-X(a),Y(b)-Y(a))});}});}
function ebene(){zs('ebene');var f=new Path2D();f.rect(-5,HZ,W+10,H-HZ+5);
R.fillStyle=LG(R,0,HZ,0,700,[0,'#d4af98',0.05,'#bda48f',0.12,'#94907c',0.22,'#6a705a',0.4,'#4a5640',0.65,'#374233',1,'#242e26']);R.fillRect(0,HZ,W,H-HZ);
D.fillStyle=dcol(0,130);D.fillRect(0,HZ,W,H-HZ);idf(f,2);
R.fillStyle=LG(R,0,0,W,0,[0,'rgba(92,88,140,0.34)',0.42,'rgba(92,88,140,0)',0.66,'rgba(70,92,100,0)',1,'rgba(70,92,100,0.42)']);R.fillRect(0,HZ,W,130);
var mp=[[628,HZ-0.5],[668,HZ+7],[722,HZ+11],[768,HZ+12],[806,HZ+18],[852,HZ+24],[900,HZ+25],[944,HZ+31],[1000,HZ+28],[1046,HZ+33]],s=new Path2D();sp(s,mp,0);s.lineTo(1046,HZ-0.5);s.closePath();BAND.meer=s;
R.fillStyle=LG(R,628,0,1040,0,[0,'#eec08e',0.14,'#cf9f90',0.34,'#84849f',0.6,'#566890',1,'#465a86']);R.fill(s);D.fillStyle=dcol(0,205);D.fill(s);idf(s,3);}
function fern(x0,x1,y0,y1,amp,sc,c0,c1,dy,id){var T=[],k,m=Math.ceil((x1-x0)/10),ph=rr(0,99);for(k=0;k<=m;k++){var u=k/m,x=lerp(x0,x1,u);T.push([x,lerp(y0,y1,u)-amp*(fbm(x/sc+ph,ph)-0.45)*2*Math.pow(Math.sin(Math.max(0.03,u)*Math.PI),0.4)]);}
var f=new Path2D();sp(f,T,0);f.lineTo(x0,y0+dy);f.closePath();R.save();R.clip(f);c0=hx(c0);c1=hx(c1);for(k=0;k<7;k++){var g=new Path2D();sp(g,T,0);g.lineTo(x1,H);g.lineTo(x0,H);g.closePath();R.save();R.translate(0,k*dy/7);R.fillStyle=rgbs(m3(c0,c1,k/6));R.fill(g);R.restore();}for(k=0;k<Math.ceil((x1-x0)/24);k++){var fx=rr(x0,x1),fy=lerp(y0,y1,(fx-x0)/(x1-x0))+rr(1,dy*0.8);eg(R,fx,fy,rr(2.4,5.4),rr(2.6,6.5),rnd()<0.68?'38,54,84':'170,160,168',rr(0.2,0.42));}R.restore();D.fillStyle='rgb(255,128,0)';D.fill(f);idf(f,id);KAMM.push({T:T,c:c0,id:id});return f;}
function kamm(n,P,c0,c1,dy,ds,id){var f=schl(P),ym=1e9;P.forEach(function(q){if(q[1]<ym)ym=q[1];});R.fillStyle=LG(R,0,ym,0,ym+dy,[0,c0,1,c1]);R.fill(f);D.fillStyle=dcol(0,ds);D.fill(f);idf(f,id);BAND[n]=f;return f;}
function flur(f,id,H0,E0,al,Xc,Zc,a0,a1,b0,b1,da,db,leer,pal,hf){var ca=Math.cos(al),sa=Math.sin(al),a=a0;function pt(a,b){var X=Xc+a*ca+b*sa,Z=Zc-a*sa+b*ca;return[CX+FOC*X/Z,H0+FOC*E0/Z,FOC/Z];}
R.save();R.clip(f);D.save();D.clip(f);
while(a<a1){var a2=a+da*rr(0.6,1.5),b=b0+rr(0,db);while(b<b1){var b2=b+db*rr(0.6,1.6),Q=[pt(a,b),pt(a2,b),pt(a2,b2),pt(a,b2)],cx=(Q[0][0]+Q[2][0])/2,cy=(Q[0][1]+Q[2][1])/2;if(rnd()>leer){var c=AP(pig(hx(pal[Math.floor(rr(0,pal.length))]),0.09),cx,cy);c=m3(c,[24,26,30],0.34*k01((vn(cx/120+4,cy/40)-0.34)*3)+0.16*k01((cy-590)/90));R.fillStyle=rgbs(c);wq(R,Q);R.fill();var an=Math.atan2(Q[1][1]-Q[0][1],Q[1][0]-Q[0][0]);D.fillStyle=dcol(an,150);poly(D,Q);D.fill();FELD.push({Q:Q,c:c,id:id,an:an});}
if(rnd()<hf)HECKE.push([Q[0],Q[1],id]);if(rnd()<hf*0.8)HECKE.push([Q[1],Q[2],id]);b=b2;}a=a2;}
R.restore();D.restore();}
var PAL=['#465236','#535c3c','#3b4831','#5e5f44','#696648','#323e2d','#4a4532'];
function wq(c,Q){var i,j,s=Q[0][2];c.beginPath();c.moveTo(Q[0][0],Q[0][1]);for(i=0;i<4;i++){var a=Q[i],b=Q[(i+1)%4],m=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/m,ny=(b[0]-a[0])/m;for(j=1;j<4;j++){var o=(h2(Math.round(a[0]+b[0])+j,Math.round(a[1]+b[1]))-0.5)*Math.min(5,s*2.6);c.lineTo(lerp(a[0],b[0],j/4)+nx*o,lerp(a[1],b[1],j/4)+ny*o);}c.lineTo(b[0],b[1]);}c.closePath();}
function huegel(){zs('ebenefeld');var f,pe=new Path2D();pe.rect(380,HZ+4,680,110);flur(pe,2,HZ,150,-0.2,300,3000,-6000,9000,-1400,16000,520,720,0.2,['#7d8064','#8e8c6c','#6f7658','#9a9472','#74705a'],0);
zs('kaemme');fern(-30,560,355,367,7,44,'#8a93b6','#ada6b6',30,4);fern(-30,590,352,392,16,62,'#7586ac','#a8a4ba',44,4);
fern(40,520,362,396,12,40,'#6677a0','#9c9cb2',40,4);
fern(-30,430,374,398,16,46,'#586c92','#90949f',46,4);
fern(120,572,388,424,12,36,'#4e658a','#868f98',44,4);
fern(-30,380,398,412,14,42,'#465e78','#7c8a88',46,4);
fern(180,566,410,438,11,34,'#3f586c','#748480',46,4);
zs('flurB');f=kamm('b',[[-30,430],[70,420],[170,434],[280,424],[390,440],[490,456],[566,482],[530,524],[300,546],[-30,536]],'#3e5044','#5c6a4e',90,125,5);
flur(f,5,HZ-60,150,0.26,-150,840,-520,620,-240,560,86,72,0.14,PAL,0.54);
zs('flurC');f=kamm('c',[[1060,424],[985,410],[905,424],[835,438],[775,456],[728,486],[800,524],[1060,566]],'#3d4f42','#5a684c',110,125,6);
flur(f,6,HZ-46,150,-0.42,170,800,-300,420,-240,420,100,80,0.15,PAL,0.42);
zs('flurT');var g=new Path2D();g.moveTo(530,742);sp(g,[[530,742],[530,470],[610,452],[700,444],[790,470],[880,540],[1060,580],[1060,742]],0);g.closePath();
R.fillStyle=LG(R,0,445,0,700,[0,'#55634a',0.4,'#424f3a',1,'#29352a']);R.fill(g);D.fillStyle=dcol(0,125);D.fill(g);idf(g,7);BAND.tal=g;
flur(g,7,HZ-22,150,-0.32,120,520,-420,560,-180,520,64,52,0.08,PAL,0.62);}
function fluss(){zs('wasser');var f=pfad(FB.P),y,k;BAND.fluss=f;R.save();R.lineCap='round';for(k=0;k<FZ.length-1;k+=2){var q=FZ[k],e=FZ[Math.min(FZ.length-1,k+2)],s=q[1]-HZ;[0.3,0.2,0.12].forEach(function(b){R.strokeStyle='rgba(16,22,18,0.09)';R.lineWidth=Math.max(2,s*b);R.beginPath();R.moveTo(q[0],q[1]);R.lineTo(e[0],e[1]);R.stroke();});}R.restore();
R.save();R.clip(f);for(y=HZ;y<H;y+=2){var u=(y-HZ)/(H-HZ),off=Math.sin(y*0.37+Math.sin(y*0.09)*3)*(0.5+u*5),sy=Math.max(0,HZ-0.3*(y-HZ));R.drawImage(RFL,0,sy,W,1.6,off,y,W,2);}
R.fillStyle=LG(R,0,405,0,710,[0,'rgba(40,50,88,0)',0.4,'rgba(40,50,88,0.36)',1,'rgba(26,36,66,0.7)']);R.fillRect(0,HZ,W,H-HZ);R.restore();
D.fillStyle=dcol(0,205);D.fill(f);idf(f,8);}
function wald(){zs('wald');var f=schl(W1);R.fillStyle=LG(R,0,460,0,600,[0,'#1c2a26',0.6,'#26342c',1,'#2c3a30']);R.fill(f);D.fillStyle='rgb(255,128,0)';D.fill(f);idf(f,9);
f=schl(W2);R.fillStyle=LG(R,0,496,0,640,[0,'#141f1a',0.5,'#101a15',1,'#0c130f']);R.fill(f);D.fill(f);idf(f,12);}
function weg(B,c0,c1,y0,y1,id){var f=pfad(B.P),k;R.fillStyle=LG(R,0,y0,0,y1,[0,c0,1,c1]);R.fill(f);idf(f,id);for(k=0;k<B.L.length-1;k++){var a=B.L[k],b=B.L[k+1],c=B.Q[k+1],e=B.Q[k],an=Math.atan2(b[1]-a[1],b[0]-a[0]);D.fillStyle=dcol(an,185);D.beginPath();D.moveTo(a[0],a[1]);D.lineTo(b[0],b[1]);D.lineTo(c[0],c[1]);D.lineTo(e[0],e[1]);D.closePath();D.fill();}return f;}
var FELS=[[58,702,66,38],[132,756,88,46],[648,744,72,36],[868,748,60,30]];
function felsR(q){var x=q[0],y=q[1],w=q[2],h=q[3],n=8,P=[],i;for(i=0;i<=n;i++){var a=Math.PI*(1-i/n),r=rr(0.84,1.14);P.push([x+Math.cos(a)*w/2*r,y-Math.sin(a)*h*r*(i%2?1:0.84)]);}var C=[x+rr(-0.14,0.14)*w,y-h*rr(0.52,0.68)],Bs=[[x+w*0.5,y+h*0.05],[x+w*0.1,y+h*0.13],[x-w*0.34,y+h*0.1],[x-w*0.5,y+h*0.04]],all=P.concat(Bs),f=pfad(all),m=all.length;R.save();R.translate(0,h*0.12);R.scale(1,1);eg(R,x,y,1.7,h*0.42,'6,4,3',0.72);R.restore();R.fillStyle='#2a2626';R.fill(f);D.fillStyle='rgb(255,128,0)';D.fill(f);idf(f,13);for(i=0;i<m;i++){var p=all[i],e=all[(i+1)%m],mx=(p[0]+e[0])/2-C[0],my=(p[1]+e[1])/2-C[1],mm=Math.hypot(mx,my)||1,lit=k01(0.36+0.42*mx/mm-0.34*my/mm+rr(-0.08,0.08)),wf=wl((p[0]+e[0])/2,(p[1]+e[1])/2,170);R.fillStyle=rgbs(m3(m3([20,18,20],[84,88,104],lit),[172,118,72],wf*wf*k01(0.5+0.5*mx/mm)));R.beginPath();R.moveTo(C[0],C[1]);R.lineTo(p[0],p[1]);R.lineTo(e[0],e[1]);R.closePath();R.fill();}}
function vorne(){zs('vorn');var f=new Path2D(),i,x,y,s;sp(f,VGK,0);f.lineTo(1060,800);f.lineTo(-20,800);f.closePath();BAND.vorn=f;
R.fillStyle=LG(R,0,574,0,790,[0,'#493727',0.22,'#3a2b1d',0.55,'#2a1e14',1,'#18110b']);R.fill(f);D.fillStyle=dcol(0,135);D.fill(f);idf(f,10);
R.save();R.clip(f);for(i=0;i<80;i++){x=rr(-20,1060);y=rr(585,790);s=sZ(y);var q=rnd(),c=q<0.45?'20,14,10':q<0.68?'40,28,28':q<0.88?'74,58,36':'58,50,42';eg(R,x,y,rr(2.6,4.6),s*rr(0.2,0.6),c,rr(0.3,0.5));}
IC.save();IC.clip(f);D.save();D.clip(f);var w1=weg(WL,'#7a776e','#6e6252',590,690,11),w2=weg(WR,'#7c766c','#6e6050',640,700,11),w3=weg(WV,'#6e5a44','#352a20',680,790,11),wg=new Path2D();IC.restore();D.restore();wg.addPath(w1);wg.addPath(w2);wg.addPath(w3);R.clip(wg);R.translate(LAT[0]+14,688);R.scale(1,0.42);R.fillStyle=RG(R,0,0,210,[0,'rgba(228,166,98,0.82)',0.3,'rgba(214,146,86,0.56)',0.65,'rgba(176,122,78,0.2)',1,'rgba(160,110,70,0)']);R.fillRect(-250,-250,500,500);R.restore();FELS.forEach(felsR);}
function scene(){himmel();gebirge();F.drawImage(REF,0,0);ebene();huegel();fluss();wald();vorne();
R.fillStyle=RG(R,W*0.5,H*0.46,W*0.74,[0,'rgba(0,0,0,0)',0.62,'rgba(0,0,0,0.05)',1,'rgba(0,0,0,0.38)']);R.fillRect(0,0,W,H);
IDD=IC.getImageData(0,0,W,H).data;}
function krone(x,y,r,c,l){var n=r<2.2?1:r<5?3:6,cy=y-r*0.95,i;for(i=0;i<n;i++){var ox=n>1?rr(-0.66,0.66)*r:0,oy=n>1?rr(-0.55,0.45)*r:0,L=r*rr(0.25,0.46),an=rr(-0.5,0.5);ms([[x+ox-L,cy+oy-an*L],[x+ox+L,cy+oy+an*L]],r*rr(0.7,1.05),pig(c,0.1),0.95,146,r>5?2:0);}if(l){var sg=x<SUX?1:-1;ms([[x+sg*r*0.1,cy-r*0.55],[x+sg*r*0.66,cy-r*0.2]],Math.max(0.8,r*0.3),pig(l,0.08),0.5,158);}}
function laeufe(Z,fn){var o=[],c=[];Z.forEach(function(q){if(fn(q))c.push(q);else{if(c.length>1)o.push(c);c=[];}});if(c.length>1)o.push(c);return o;}
function kette(Z,wf,cf,al,hb,lo,hi,gap){var i=0,n=Z.length;while(i<n-1){var e=Math.min(n-1,i+Math.floor(rr(lo,hi))),p=Z.slice(i,e+1);if(p.length>1){var ws=[],w0=0,j;for(j=0;j<p.length;j++){var q=p[Math.min(p.length-1,j+1)],o=p[Math.max(0,j-1)],an=Math.abs(q[0]-o[0])/(Math.hypot(q[0]-o[0],q[1]-o[1])||1),w=wf(p[j][1])*lerp(1,0.5,an);if(w>w0)w0=w;ws.push(w);}for(j=0;j<ws.length;j++)ws[j]=Math.max(0.15,ws[j]/w0);var c=cf(p[0][0],p[0][1]);ms(p,w0,c,al,hb,0,0,ws);}i=e+Math.floor(rr(gap,gap+2));}}
function gebirgStriche(){zs('gebirge');GTR.forEach(function(t){var x=t.x|0,y=t.y|0,o=4*(y*W+x);if(IDD[o+1]+IDD[o+2]*256!=t.i||IDD[o]>>4!=1)return;if(rnd()>(t.sn>0.5?0.7:0.25))return;var L=Math.max(1.6,t.L*rr(0.4,0.7)),dx=Math.cos(t.an),dy=Math.sin(t.an);if(dy<0){dx=-dx;dy=-dy;}var c=t.sn>0.5?m3([150,166,214],[255,232,224],t.lit):[202,146,150];ms([[x-dx*L,y-dy*L],[x+dx*L,y+dy*L]],rr(0.9,1.8),pig(c,0.03),t.sn>0.5?rr(0.45,0.8):rr(0.25,0.45),t.sn>0.5?146:134);});}
function ferne(){zs('ferne');var k,RD=R.getImageData(0,0,W,H).data;
KAMM.forEach(function(K){K.T.forEach(function(q,i){var n=Math.floor(rr(0,3)),j,nx=K.T[i+1];if(nx&&rnd()<0.3&&idAt(q[0],q[1]+1)==K.id)ms([[q[0],q[1]+0.6],[nx[0],nx[1]+0.6]],rr(0.8,1.2),m3([226,190,190],K.c,0.45),rr(0.12,0.28),128);for(j=0;j<n;j++){var x=q[0]+rr(-6,6),y=q[1]+rr(-0.3,1.4);if(idAt(x,y)!=K.id)continue;ms([[x-rr(0.8,2.4),y],[x+rr(0.8,2.4),y+rr(-0.3,0.3)]],rr(0.9,1.5),pig(m3(K.c,[28,36,58],0.3),0.05),rr(0.35,0.65),128);}});});
for(k=0;k<170;k++){var bx=rr(0,572),by=rr(396,446);if(idAt(bx,by)!=4)continue;krone(bx,by,rr(0.9,1.8),AP([30,44,50],bx,by),null);}
for(k=0;k<620;k++){var y=HZ+2+Math.pow(rnd(),1.4)*100,x=rr(0,W),id=idAt(x,y);if(id==3||id==1||id==0)continue;var t=(y-HZ)/100,L=1.5+t*9*rr(0.3,1),o=4*((y|0)*W+(x|0)),q=rnd(),c=[RD[o],RD[o+1],RD[o+2]];c=q<0.5?m3(c,[226,206,172],rr(0.05,0.2)):m3(c,[44,50,56],rr(0.08,0.26));ms([[x-L,y],[x+L,y+rr(-0.4,0.4)]],rr(0.8,1.4)+t*0.5,pig(c,0.04),rr(0.3,0.65),128);}
FELD.forEach(function(f){var Q=f.Q,mx=(Q[0][0]+Q[2][0])/2,my=(Q[0][1]+Q[2][1])/2;if(idAt(mx,my)!=f.id)return;var s=(Q[0][2]+Q[2][2])/2;if(s<0.85||rnd()<0.2)return;var dk=m3(f.c,[20,18,14],0.36),hl=m3(f.c,[176,164,120],0.2),n=Math.min(14,Math.floor(s*6.5)),u,i;for(i=1;i<n;i++){u=i/n+rr(-0.012,0.012);var a=[lerp(Q[0][0],Q[3][0],u),lerp(Q[0][1],Q[3][1],u)],b=[lerp(Q[1][0],Q[2][0],u),lerp(Q[1][1],Q[2][1],u)];if(idAt(a[0],a[1])!=f.id||idAt(b[0],b[1])!=f.id)continue;var ua=rr(0,0.14),ub=rr(0.86,1);ms([[lerp(a[0],b[0],ua),lerp(a[1],b[1],ua)],[lerp(a[0],b[0],ub),lerp(a[1],b[1],ub)]],Math.max(0.8,s*0.42),i%2?dk:hl,rr(0.28,0.5),136,0);}});
HECKE.forEach(function(e){var a=e[0],b=e[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),s=(a[2]+b[2])/2,st=Math.max(3.6,s*5.6),t=rr(0,0.1);while(t<1){var x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);if(idAt(x,y)==e[2]&&rnd()>0.1){var r=s*rr(1.6,4.6),c0=rnd()<0.5?[22,30,24]:[32,38,26],c=m3(c0,AP(c0,x,y),0.62);if(y>HZ+24)krone(x,y,r,c,y>HZ+70&&rnd()<0.6?m3([76,82,54],AP([76,82,54],x,y),0.62):null);}t+=st*rr(0.7,1.5)/L;}});}
function waldStriche(){zs('wald');var k,x,y,r;
for(k=0;k<1500;k++){x=rr(-10,625);y=rr(452,655);var id=idAt(x,y);if(id!=9&&id!=12)continue;var top=id==9?ober(W1,x,7):ober(W2,x,8),tie=k01((y-top)/70);r=(id==9?3:4.2)*rr(0.75,1.3)*(1+(y-470)*0.004);var c=id==9?m3([20,30,30],[28,38,36],rr(0,1)):m3([13,21,17],[21,30,23],rr(0,1)),hl=rnd()<0.42*(1-tie)?(id==9?[44,56,54]:[40,52,44]):null;krone(x,y+r*0.9,r,c,hl);}
for(k=0;k<70;k++){x=rr(560,700);y=rr(575,655);if(idAt(x,y)!=7||Math.hypot(x-600,(y-610)*1.5)>rr(30,90))continue;r=rr(2.6,6);krone(x,y+r*0.8,r,[20,29,23],rnd()<0.6?[60,72,52]:null);}
for(k=0;k<180;k++){var q=rnd()<0.42;x=rr(-10,q?490:620);y=q?ober(W1,x,7):ober(W2,x,8);if(idAt(x,y+2)!=(q?9:12))continue;r=(q?3.4:4.8)*rr(0.8,1.4);krone(x,y+r*0.5,r,q?[28,38,34]:[20,30,24],rnd()<0.6?(q?[66,78,72]:[58,72,58]):null);}}
function wege(){zs('wege');var Z2=WEG2.filter(function(q){return idAt(q[0],q[1])==7;});kette(Z2,function(y){return Math.max(1.2,0.042*(y-HZ));},function(x,y){return m3(pig(AP([132,120,98],x,y),0.05),[110,114,136],0.1);},0.95,150,6,16,0);kette(Z2,function(y){return Math.max(0.8,0.012*(y-HZ));},function(x,y){return AP([64,54,44],x,y);},0.5,142,4,9,3);kette(WEG3,function(y){return Math.max(0.9,0.03*(y-HZ));},function(x,y){return pig(AP([140,128,106],x,y),0.04);},0.55,144,4,10,2);laeufe(WEG4,function(q){return idAt(q[0],q[1])==5;}).forEach(function(Z){kette(Z,function(y){return Math.max(0.9,0.024*(y-HZ));},function(x,y){return pig(AP([130,122,106],x,y),0.04);},0.6,144,5,11,2);});}
function flussF(t,x){var c=flussG(t);return x>660&&t<0.3?m3(c,[176,154,170],k01((x-660)/150)*0.72*(1-t/0.3)):c;}
function flussG(t){return t<0.22?m3([255,238,206],[248,206,172],t/0.22):t<0.5?m3([248,206,172],[138,124,174],(t-0.22)/0.28):m3([138,124,174],[58,72,116],(t-0.5)/0.5);}
function flussStriche(){zs('wasser');var k=0,n=FZ.length,x,y,LL;
while(k<n-2&&(idAt(FB.L[k][0],FB.L[k][1]+2)>=10||idAt(FB.Q[k][0],FB.Q[k][1]+2)>=10||idAt(FZ[k][0],FZ[k][1])!=8))k++;k+=8;var k00=k;while(k<n-1){var e9=Math.min(n-1,k+Math.floor(rr(4,9))),p9=FZ.slice(k,e9+1),w9=[],w0=0,j9;for(j9=k;j9<=e9;j9++){var w8=Math.hypot(FB.L[j9][0]-FB.Q[j9][0],FB.L[j9][1]-FB.Q[j9][1]);w9.push(w8);if(w8>w0)w0=w8;}for(j9=0;j9<w9.length;j9++)w9[j9]=Math.max(0.12,w9[j9]/w0*0.92);if(k==k00){w9[0]*=0.15;w9[1]*=0.6;}var t9=k01((FZ[(k+e9)>>1][1]-HZ)/330),c9=flussF(t9,FZ[(k+e9)>>1][0]);ms(p9,w0,pig(c9,0.03),0.8,t9<0.45?164:136,3,0.09,w9);if(e9>=n-1)break;k=e9-1;}
for(k=0;k<n-1;k++){var L=FB.L,Q=FB.Q,lo=L[k][1]>Q[k][1]?L:Q,hi=lo===L?Q:L,y0=FZ[k][1],s=y0-HZ;if(rnd()<0.5&&s>10)ms([lo[k],lo[k+1]],Math.max(0.8,s*rr(0.005,0.012)),AP([16,20,20],lo[k][0],y0),0.7,140);if(s>30&&rnd()<0.45){var tr=rr(0.08,0.3),a0=[lerp(hi[k][0],FZ[k][0],tr),lerp(hi[k][1],y0,tr)],b0=[a0[0]+rr(3,9)*(rnd()<0.5?1:-1),a0[1]+rr(-0.3,0.3)];ms([a0,b0],Math.max(1,s*0.014),AP([44,42,62],a0[0],y0),0.4,134);}if(rnd()<0.6&&s>24){var e1=rnd()<0.55?lo:hi,ox=rr(-1,1)*s*0.03,oy=(e1===lo?1:-1)*rr(0,s*0.012),gx=e1[k][0]+ox,gy=e1[k][1]+oy;var ig=idAt(gx,gy+2);if(ig==7||ig==8||ig==5||ig==6||ig==2){var r=s*rr(0.012,0.04);krone(gx,gy+r*0.4,r,AP([18,26,20],gx,y0),rnd()<0.5?AP([66,74,50],gx,y0):null);}}}
laeufe(FZ,function(q){return q[1]<440&&q[0]<790;}).forEach(function(Z){kette(Z,function(y){return Math.max(0.9,(y-HZ)*0.03);},function(x,y){return pig(m3([255,246,222],[210,190,190],k01((x-660)/130)),0.01);},0.8,178,2,6,3);});
for(k=0;k<640;k++){var i=Math.floor(rr(0,n)),c=FZ[i];y=c[1]+rr(-1,1)*Math.max(1,(c[1]-HZ)*0.028);x=c[0]+rr(-1,1)*(c[1]-HZ)*0.085;if(!isW(x,y))continue;LL=rr(1.6,4)+(y-HZ)*rr(0.015,0.055);var t8=k01((y-HZ)/330),q=rnd(),dk8=q<0.34&&t8>0.14,cc=dk8?m3(flussF(t8,x),[38,42,84],0.3):m3(flussF(t8,x),[255,246,228],0.34);ms([[x-LL,y],[x+LL,y+rr(-0.3,0.3)]],rr(0.8,1.5)+(y-HZ)*0.0035,pig(cc,0.03),rr(0.22,0.5),dk8?132:156);}
for(k=0;k<60;k++){y=rr(585,650);x=LU[0]+rr(-1,1)*rr(2,24);if(!isW(x,y))continue;LL=rr(2,7);ms([[x-LL,y],[x+LL,y+rr(-0.4,0.4)]],rr(0.9,1.6),[196,208,232],rr(0.3,0.72),168);}
for(k=0;k<70;k++){x=LU[0]+rr(-1,1)*(rr(1,5)+6*rnd());y=rr(HZ+1.5,HZ+30);if(idAt(x,y)!=3)continue;LL=rr(1.4,4.5);ms([[x-LL,y],[x+LL,y]],rr(0.8,1.3),[212,220,238],rr(0.35,0.75),162);}
for(k=0;k<320;k++){x=rr(630,1036);y=rr(HZ+1,HZ+30);if(idAt(x,y)!=3)continue;LL=rr(3,16);var uu=k01((x-630)/280);ms([[x-LL,y],[x+LL,y]],rr(0.8,1.4),pig(m3([255,212,160],rnd()<0.5?[92,110,158]:[62,78,122],uu),0.04),rr(0.25,0.55),146);}
ms([[628,HZ+0.3],[1030,HZ+0.3]],1.2,[70,66,104],0.5,130);
var KUE=kr([[648,HZ+4],[668,HZ+7],[722,HZ+11],[768,HZ+12],[806,HZ+18],[852,HZ+24],[900,HZ+25],[944,HZ+31],[1000,HZ+28],[1030,HZ+31]],6);kette(KUE,function(){return 1.2;},function(x,y){return m3([240,210,170],[186,178,170],k01((x-630)/380));},0.5,146,2,5,1);kette(KUE.map(function(q){return[q[0],q[1]+1.8];}),function(){return 1.7;},function(x,y){return m3([120,104,92],[52,60,62],k01((x-630)/300));},0.5,132,2,6,1);}
function segel(){zs('segel');var x=782,y=HZ+11;ms([[x-5.4,y+0.2],[x+5,y+0.5]],2,[32,26,40],1,150,0,0,[0.5,1,1,0.6]);ms([[x+0.3,y],[x+0.2,y-14]],0.9,[36,28,40],1,150);ms([[x-0.4,y-1.2],[x-0.5,y-13.4]],7,[255,230,184],1,190,0,0,[1,0.84,0.52,0.14]);ms([[x+1.5,y-1.6],[x+1.2,y-8.4]],2.2,[150,120,140],0.9,156,0,0,[1,0.7,0.2]);ms([[x-1,y+1.6],[x+0.8,y+5.4]],1.1,[255,220,176],0.65,150);}
function stadt(){zs('stadt');var d=[46,46,70],dd=[36,36,58],u=[255,186,104],x0=616,y0=484,k;function dk(c,x,y){return AP(c,x,y);}
ms([[x0-46,y0+5],[x0-20,y0],[x0+20,y0-1],[x0+50,y0+6]],9,AP([22,28,24],x0,y0),1,146);
function hs(x,yb,w,h,r){ms([[x,yb+5],[x,yb-h]],w,dk(d,x,yb),1,148,0,0,[1,1]);ms([[x-w*0.62,yb-h+0.4],[x+w*0.62,yb-h+0.1]],r*1.5,dk(dd,x,yb),1,148,0,0,[0.06,1,0.06]);ms([[x-w*0.44,yb-h-r*0.2],[x-w*0.05,yb-h-r*0.5]],0.7,[236,190,160],0.4,156);}
[[-30,4,6,2.4,2.4],[-24.5,2.5,5,5.4,2.6],[-19,1,7,3.4,3],[-12.5,-0.6,5.4,6.6,3],[-7.5,-1,5,4.6,2.6],[6.5,-2,6.4,5.2,3],[13,-1,4.6,8,2.4],[18.5,0,7,3.8,3.2],[25,2,5,5.2,2.6],[30.5,3.4,6.4,2.8,2.4],[36,5,4.6,2,1.8]].forEach(function(q){hs(x0+q[0],y0+q[1],q[2],q[3],q[4]);});
ms([[x0-2,y0+2],[x0-2,y0-25]],7.4,dk(dd,x0,y0),1,148,0,0,[1,1]);var j;for(j=0;j<3;j++)ms([[x0-4.9+j*2.9,y0-24.4],[x0-4.9+j*2.9,y0-27]],1.5,dk(dd,x0,y0),1,150,0,0,[1,1]);ms([[x0-5.4,y0+1],[x0-5.4,y0-24]],0.8,[244,196,158],0.45,158);
ms([[x0+12,y0-6],[x0+12,y0-14]],3.4,dk(dd,x0,y0),1,148,0,0,[1,1]);ms([[x0+12,y0-13.6],[x0+12,y0-24]],4.2,dk(dd,x0,y0),1,150,0,0,[1,0.5,0.06]);
for(k=0;k<14;k++){var bx=x0+rr(-44,48),by=y0+rr(4,8.5);krone(bx,by,rr(1.8,3.2),AP([20,26,22],bx,by),null);}
[[-2,-20,1.5,2.4],[-16,-5,1.1,1.7],[8,-8,1.1,1.7],[-24,-1,1,1.5],[17,-4,1.1,1.6],[27,0,1,1.4]].forEach(function(q){ms([[x0+q[0],y0+q[1]],[x0+q[0],y0+q[1]+q[3]]],q[2],u,1,184,0,0,[1,1]);});
for(k=0;k<30;k++){var x=rr(578,664),y=rr(494,514);if(!isW(x,y))continue;var LL=rr(1,3.4);ms([[x-LL,y],[x+LL,y]],rr(0.9,1.4),rnd()<0.55?[30,30,50]:[255,190,116],rr(0.3,0.6),150);}
ms([[632,522],[622,492]],5.2,AP([120,112,104],625,500),1,152,0,0,[1,1]);ms([[634.6,521.4],[624.6,492]],1.3,AP([22,22,34],625,500),0.92,144);ms([[629.5,522],[619.6,492.5]],0.8,AP([206,188,160],622,500),0.6,158);}
function gestirn(M,hell,dunkel,ph,mar,hbm){var r=M[2],x0=M[0],y0=M[1],d=Math.hypot(SUX-x0,HZ+70-y0),ax=(SUX-x0)/d,ay=(HZ+70-y0)/d,si=Math.sin(ph),co=Math.cos(ph),row=-r+0.6;
function ma(u,v){if(!mar)return 0;var e=Math.exp(-Math.pow((u+0.22)/0.72,2)-Math.pow((v+0.1)/0.62,2)),a=fbm(u*2.3+mar[0],v*2.3+mar[1]),b=fbm(u*7+3,v*7+11);return k01((a-0.5+0.26*e-0.08)*3.4)*0.2*(0.5+e)+k01((b-0.6)*3.4)*0.07;}
while(row<r){var hw=Math.sqrt(r*r-row*row),x=-hw;while(x<hw-0.1){var x2=Math.min(hw,x+rr(2.2,3.8)),xm=(x+x2)/2,nx=xm/r,ny=row/r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),li=nx*ax*si+ny*ay*si+nz*co,tt=Math.pow(k01(li*1.24+0.03),0.66);var c=m3(dunkel,hell,tt*(1-ma(nx,ny)));ms([[x0+x,y0+row],[x0+x2,y0+row+rr(-0.12,0.12)]],2,pig(c,0.012),1,Math.round(hbm*tt+126*(1-tt)),0,0.02,[1,1]);if(x2>=hw)break;x=x2-0.5;}row+=1.2;}
var a0=Math.atan2(ay,ax),pts=[],k;for(k=-16;k<=16;k++){var an=a0+k/16*1.25;pts.push([x0+Math.cos(an)*(r-0.6),y0+Math.sin(an)*(r-0.6)]);}ms(pts,M[2]>30?2.2:1.5,m3(hell,[255,255,255],0.2),0.82,hbm+6);}
function sterne(){zs('sterne');var n=0,g=[];for(var k=0;k<400&&n<30;k++){var x=rr(20,1020),y=Math.pow(rnd(),1.3)*232+20,ok=!(Math.hypot(x-LU[0],y-LU[1])<LU[2]+34||Math.hypot(x-CE[0],y-CE[1])<CE[2]+22||(x>205&&x<835&&y>30&&y<256));g.forEach(function(q){if(Math.hypot(q[0]-x,q[1]-y)<46)ok=false;});if(!ok)continue;g.push([x,y]);n++;var b=rr(0.35,1);ms([[x,y],[x+0.9,y+0.2]],rr(1,1.6)*(0.7+b*0.4),rnd()<0.2?[255,226,196]:[214,222,244],0.35+0.5*b,150);}}
function heide(x,y,s,wf){var w=s*rr(0.14,0.34),n=Math.floor(rr(12,26)),i;ms([[x-w*0.8,y+w*0.05],[x+w*0.8,y-w*0.02]],w*0.34,[20,14,12],0.55,132,0,0,[0.2,1,1,0.2]);for(i=0;i<n;i++){var a=rr(-1,1),ox=a*w,hh=w*0.62*Math.sqrt(1-a*a)*rr(0.3,1),t=hh/(w*0.62+0.01),q=rnd(),cc=m3(q<0.5?[26,19,20]:[36,26,26],q<0.82?[58,42,44]:[76,56,68],t);cc=m3(cc,[232,150,76],wf*wf*0.8);if(wf<0.1&&t>0.8&&a>-0.2&&rnd()<0.4)cc=m3(cc,[104,114,146],0.45);var L=Math.max(1,s*rr(0.012,0.03)),an=rr(-2.2,-0.9);ms([[x+ox,y-hh],[x+ox+Math.cos(an)*L*2,y-hh+Math.sin(an)*L*2]],Math.max(0.9,s*rr(0.014,0.03)),pig(cc,0.1),0.92,148+t*12);}}
function gras(x,y,s,wf,hl){var n=Math.floor(rr(3,8)),i;for(i=0;i<n;i++){var ox=rr(-0.1,0.1)*s,hh=s*rr(0.07,0.24),le=rr(-0.32,0.36),t=rnd(),cc=t<0.55?[46,37,23]:t<0.85?[66,54,32]:[34,28,20];cc=m3(cc,[244,172,90],wf*wf*0.9);if(hl&&rnd()<0.3)cc=m3(cc,hl,0.3);ms([[x+ox,y+1],[x+ox+le*hh*0.4,y-hh*0.55],[x+ox+le*hh,y-hh]],Math.max(0.9,s*0.015),pig(cc,0.08),0.92,150,0,0,[1,0.8,0.5,0.15]);}}
function stein(x,y,r,wf){var f=wf*wf,c=m3([46,42,40],[108,82,58],f),hi=m3([104,112,136],[244,182,112],f);ms([[x-r*1.1,y+r*0.1],[x+r*1.1,y+r*0.05]],r*0.8,[14,10,8],0.8,132,0,0,[0.3,1,1,0.3]);ms([[x-r*0.9,y-r*0.26],[x+r*0.9,y-r*0.34]],r*1.05,pig(c,0.08),1,150,2,0.14,[0.35,1,0.95,0.35]);ms([[x-r*0.3,y-r*0.66],[x+r*0.62,y-r*0.72]],Math.max(0.9,r*0.26),pig(hi,0.05),0.62,170,0,0,[0.2,1,0.2]);}
function fels(q){var x=q[0],y=q[1],w=q[2],h=q[3],i,f=wl(x,y,170);f*=f;for(i=0;i<5;i++){var u=rr(0.1,0.92),a=rr(-0.28,0.38);ms([[x+a*w,y-h*u],[x+a*w+rr(1,6),y-h*u+rr(-3,1)]],rr(1,1.8),m3([86,94,118],[240,178,112],f),rr(0.28,0.55),168);}for(i=0;i<4;i++){var cx=x+rr(-0.3,0.3)*w,cy=y-rr(0.15,0.7)*h;ms([[cx,cy],[cx+rr(-0.08,0.08)*w,cy+rr(0.1,0.26)*h]],rr(0.9,1.5),[12,10,10],0.72,138);}for(i=0;i<9;i++){var lx=x+rr(-0.4,0.4)*w,ly=y-rr(0.1,0.8)*h;ms([[lx-1,ly],[lx+rr(0.5,2),ly+rr(-1,1)]],rr(1,2),rnd()<0.5?[64,66,52]:[90,88,70],rr(0.3,0.6),150);}ms([[x-0.46*w,y-0.34*h],[x-0.3*w,y-0.66*h]],Math.max(0.9,h*0.03),[70,130,134],0.16,158);for(i=0;i<12;i++)gras(x+rr(-0.62,0.62)*w,y+rr(0,h*0.2),h*2.2,f);}
function bret(a,b,c,e,n,m,fn,hb){var i,j;for(i=0;i<n;i++){var u=(i+0.5)/n,sw=Math.hypot(lerp(a[0],b[0],0.5)-lerp(e[0],c[0],0.5),lerp(a[1],b[1],0.5)-lerp(e[1],c[1],0.5))/n*1.55;for(j=0;j<m;j++){var v0=j/m,v1=Math.min(1,(j+1)/m+0.02),p0=[lerp(lerp(a[0],e[0],u),lerp(b[0],c[0],u),v0),lerp(lerp(a[1],e[1],u),lerp(b[1],c[1],u),v0)],p1=[lerp(lerp(a[0],e[0],u),lerp(b[0],c[0],u),v1),lerp(lerp(a[1],e[1],u),lerp(b[1],c[1],u),v1)],cc=fn(u,(v0+v1)/2,(p0[0]+p1[0])/2,(p0[1]+p1[1])/2);ms([p0,p1],Math.max(0.9,sw),pig(cc,0.06),1,hb+rr(-4,6),0,0,[1,1]);}}}
function holz(c,kalt,warm,x,y){var f=wl(x,y,95);c=m3(c,[226,140,66],f*f*warm);return m3(c,[140,152,184],kalt);}
function arm(Y,dx,dz,L,tilt,gm){var X0=-2.878,Z0=14,h=0.095,e=[X0+dx*L,Z0+dz*L],m=[X0+dx*L*0.84,Z0+dz*L*0.84],a=P3(X0,Y+h,Z0),b=P3(m[0],Y+h+tilt*0.84,m[1]),c=P3(m[0],Y-h+tilt*0.84,m[1]),f=P3(X0,Y-h,Z0),tip=P3(e[0],Y+tilt,e[1]),i;
function fn(u,v,x,y){var base=m3([96,88,82],[58,50,46],u*0.8+0.1*Math.sin(v*17+Y*9)),gr=0.5+0.5*Math.sin(u*21+v*4+Y*5);base=m3(base,[36,30,28],gr*0.34);if(h2(Math.round(u*7)+3,Math.round(v*9+Y*20))>0.84)base=m3(base,[136,134,134],0.32);return holz(base,0.1*(1-u)*gm,0.9,x,y);}
bret(a,b,c,f,7,6,fn,150);bret(b,tip,tip,c,5,3,fn,150);
ms([a,b],1.2,holz([136,136,146],0.16,0.8,a[0],a[1]),0.8,170);ms([b,tip],1.1,[146,146,156],0.72,170);ms([f,c],1.2,holz([22,18,16],0,0.8,f[0],f[1]),0.9,144);ms([c,tip],1,[24,18,16],0.85,144);
for(i=0;i<5;i++){var u1=rr(0.05,0.55),u2=u1+rr(0.15,0.4),v=rr(0.2,0.8);ms([[lerp(lerp(a[0],f[0],v),lerp(b[0],c[0],v),u1),lerp(lerp(a[1],f[1],v),lerp(b[1],c[1],v),u1)],[lerp(lerp(a[0],f[0],v),lerp(b[0],c[0],v),u2),lerp(lerp(a[1],f[1],v),lerp(b[1],c[1],v),u2)]],rr(0.7,1.1),[26,20,18],rr(0.45,0.8),142);}
ms([[lerp(a[0],b[0],0.08),a[1]+rr(-1,1)],[lerp(f[0],c[0],0.08),f[1]+rr(-1,1)]],2.2,[24,20,18],0.9,150,0,0,[1,1]);}
function meilenstein(){zs('stein');var x=224,yb=706,H0=70,W0=26,tl=-0.03,i,j,ws=[1.26,1.22,1.06,1.03,1.01,1,0.99,0.96,0.86,0.58];
ms([[x-W0*0.7,yb+4],[x+W0*0.84,yb+3]],15,[14,10,8],0.8,132,0,0,[0.2,1,1,0.2]);
ms([[x,yb],[x+tl*H0,yb-H0]],W0,[58,54,52],1,150,0,0,ws);
for(j=0;j<200;j++){var u=rr(-0.94,0.94),v=rr(0.02,0.985),pf=ws[Math.min(9,Math.floor(v*9.99))];if(Math.abs(u)>pf*0.98)continue;var px=x+tl*H0*v+u*W0/2,py=yb-H0*v+(1-u*u)*2.2,L=rr(1.1,3),an=rr(0,6.28),wf=wl(px,py,170),nz=Math.sqrt(Math.max(0,1-u*u)),li=k01(0.22+0.62*(u*0.72+nz*0.5)),kl=m3([24,22,26],[98,94,92],li),c=m3(kl,[226,160,92],wf*wf*k01(u*0.9+0.42)),q=rnd();if(q<0.14)c=m3(c,[18,16,16],0.5);else if(q<0.26)c=m3(c,[126,122,112],0.26);else if(q<0.31)c=m3(c,[86,92,60],0.45);if(v>0.84)c=m3(c,[146,158,190],(v-0.84)*2.4);ms([[px-Math.cos(an)*L,py-Math.sin(an)*L*0.8],[px+Math.cos(an)*L,py+Math.sin(an)*L*0.8]],rr(1.3,2.5),pig(c,0.05),0.86,156+v*14);}
function ring(v,w,c,al,hb){var yr=yb-H0*v,xr=x+tl*H0*v,hw=W0/2*ws[Math.min(9,Math.floor(v*9.99))]*0.96;ms([[xr-hw,yr],[xr-hw*0.5,yr+2.3],[xr,yr+3],[xr+hw*0.5,yr+2.3],[xr+hw,yr]],w,c,al,hb,0,0,[1,1]);}
ring(0.13,1.5,[20,18,18],0.7,140);ring(0.145,0.9,[120,108,92],0.45,156);ring(0.8,1.6,[20,18,18],0.72,140);ring(0.815,0.9,[128,124,120],0.5,158);ring(0.71,1.1,[24,22,22],0.5,142);
var rp=[],lp=[];for(i=1;i<=9;i++){var v2=i/9.6;rp.push([x+tl*H0*v2+ws[i]*W0/2-0.7,yb-H0*v2]);lp.push([x+tl*H0*v2-ws[i]*W0/2+0.7,yb-H0*v2]);}ms(rp,1.6,[226,160,94],0.62,174);ms(lp.slice(0,8),1.4,[14,12,12],0.8,144);ms(lp.slice(5,9),1,[96,160,164],0.26,160);
ms([[x+tl*H0*0.965-W0*0.17,yb-H0*0.975],[x+tl*H0*0.98,yb-H0*1.002],[x+tl*H0*0.965+W0*0.19,yb-H0*0.97]],1.7,[168,176,202],0.78,180);
for(j=0;j<16;j++){var gx=x+rr(-W0*1.1,W0*1.1);gras(gx,yb+rr(1,7),sZ(yb)*0.8,wl(gx,yb,170)*0.9);}}
function wegweiser(){zs('holz');var X=-2.878,Z=14,fu=P3(X,0,Z),to=P3(X,3.22,Z),xc=fu[0],i;
ms([[xc-15,fu[1]+5],[xc+18,fu[1]+4]],13,[14,10,8],0.82,132,0,0,[0.2,1,1,0.2]);
function pf(a,b,c0,kalt,warm,wid){bret([xc+a,fu[1]+1],[xc+a,to[1]],[xc+b,to[1]],[xc+b,fu[1]+1],wid,16,function(u,v,x,y){var g=0.5+0.5*Math.sin(u*23+v*5+a);return holz(m3(c0,[26,20,16],g*0.36),kalt,warm,x,y);},150);}
pf(-6,0.5,[78,70,64],0.02,1.1,5);pf(0.5,5.5,[38,34,34],0.06,0.04,4);
ms([[xc+0.5,fu[1]],[xc+0.5,to[1]]],1,[18,14,10],0.85,144);
for(i=0;i<9;i++){var yy=rr(to[1]+10,fu[1]-14),ll=rr(10,40);ms([[xc+rr(-5,4),yy],[xc+rr(-5,4),yy+ll]],rr(0.8,1.3),[18,14,12],rr(0.5,0.9),142);}
for(i=0;i<9;i++){var yb=rr(to[1]+6,fu[1]-8),ee=rr(8,24);ms([[xc+5.2,yb],[xc+5.2,yb+ee]],1.1,[120,134,170],rr(0.35,0.75),166);}
ms([[xc-6.4,to[1]+0.8],[xc-0.5,to[1]-1.6],[xc+5.8,to[1]+0.2]],2.6,[108,114,136],0.95,170);ms([[xc-6.5,to[1]+2.8],[xc+5.9,to[1]+2.8]],1.1,[20,16,14],0.8,144);
arm(2.26,0.75,-0.66,1.05,-0.05,0.6);arm(2.62,0.9,0.43,1.2,0.02,1);arm(2.98,-0.93,0.36,1.15,0.03,1);
for(i=0;i<16;i++){var m1=rr(-5.5,5),m2=fu[1]-rr(1,26);ms([[xc+m1,m2],[xc+m1+rr(-1.5,1.5),m2-rr(1,4)]],rr(1,2.2),pig(rnd()<0.6?[44,52,32]:[60,66,38],0.1),rr(0.5,0.85),150);}for(i=0;i<14;i++){var gx=xc+rr(-22,24);gras(gx,fu[1]+rr(0,7),sZ(fu[1])*0.8,wl(gx,fu[1],170));}
for(i=0;i<4;i++){gx=xc+rr(-20,22);stein(gx,fu[1]+rr(4,10),rr(2.6,5.4),wl(gx,fu[1],170));}}
function laterne(){zs('holz');var x=LAT[0],y0=547,y1=573,xp=329;
ms([[xp,523],[x-1,523]],2.5,[24,18,16],1,150);ms([[xp,544],[xp-9,534],[xp-20,525]],1.9,[28,22,16],1,150);ms([[xp-1,522.2],[x,522.2]],0.9,[180,120,70],0.7,166);ms([[x-1,523],[x-5,520],[x-7,524],[x-4,527]],1.3,[26,20,16],0.95,150);
var A0=A.length,sf=1.24;ms([[x,523],[x,533]],1.5,[22,18,14],1,150);
ms([[x,531],[x,537]],3.4,[30,24,18],1,152,0,0,[0.7,1,0.7]);
ms([[x,547.5],[x,536.5]],19,[30,24,20],1,156,0,0,[1,0.9,0.62,0.36,0.22]);ms([[x-8,546],[x-3,538]],1.5,[250,170,90],0.75,172);ms([[x+2,537.5],[x+7,545]],1.4,[126,136,168],0.8,170);
function gl(u,v){var d=Math.hypot((u-0.5)*1.3,(v-0.58)*1.05),t=k01(1-d*1.75);return m3([232,120,40],[255,246,206],Math.min(1,t*t*1.05));}
var i,j;for(i=0;i<8;i++){for(j=0;j<8;j++){var u=(i+0.5)/8,v=(j+0.5)/8,xx=x+(u-0.5)*14.5,yy=lerp(y0,y1,v);ms([[xx-0.2,yy-1.9],[xx+0.2,yy+1.9]],2.5,gl(u,v),1,180+Math.round(14*(1-Math.abs(u-0.5)*2)),0,0,[1,1]);}}
[[-7.8,1.9],[-2.6,1],[2.6,1],[7.8,1.9]].forEach(function(b){ms([[x+b[0],y0-0.5],[x+b[0],y1+0.5]],b[1],[18,14,10],1,156,0,0,[1,1]);});
ms([[x-8.8,y0-0.2],[x-4,y0+1],[x,y0+1.4],[x+4,y0+1],[x+8.8,y0-0.2]],2.2,[24,18,14],1,158,0,0,[1,1]);ms([[x-9.6,y1+0.2],[x-4,y1+1.5],[x,y1+1.9],[x+4,y1+1.5],[x+9.6,y1+0.2]],3,[22,16,12],1,158,0,0,[1,1]);ms([[x-7,y1+2.4],[x,y1+4],[x+7,y1+2.4]],1,[248,170,92],0.5,166);
ms([[x-1,y1-11],[x+0.6,y1-5]],3.6,[255,254,236],1,204,0,0,[0.5,1,0.5]);for(i=A0;i<A.length;i++){var st=A[i];st.R*=sf;st.p=st.p.map(function(q){return[x+(q[0]-x)*sf,523+(q[1]-523)*sf];});}}
var BAUM=[];
function zweig(x,y,a,L,w,d,kru){var n=Math.max(3,Math.round(L/15)),p=[[x,y]],i,c=x,e=y;for(i=1;i<=n;i++){a+=rr(-0.3,0.3)+kru;c+=Math.cos(a)*L/n;e+=Math.sin(a)*L/n;p.push([c,e]);}BAUM.push({p:p,w:w,tip:d<=0});if(d>0){var m=d>1?3:2;for(i=0;i<m;i++){var q=1+Math.floor(rr(0.25,1)*(n-1));zweig(p[q][0],p[q][1],a+(i%2?1:-1)*rr(0.42,1.0),L*rr(0.42,0.68),w*(1-q/n*0.6)*rr(0.5,0.72),d-1,kru*1.1);}}}
function laub(x,y,rx,ry,n){var i;for(i=0;i<n;i++){var a=rr(0,6.28),e=Math.sqrt(rnd()),ox=Math.cos(a)*e*rx,oy=Math.sin(a)*e*ry,t=k01(0.5-oy/ry*0.5),q=rnd(),c=m3(q<0.5?[14,18,14]:[20,24,17],q<0.6?[32,38,26]:[42,44,30],t*t),L=rr(1.2,3.8),an=rr(-0.7,0.7);ms([[x+ox-L,y+oy-an*L],[x+ox+L,y+oy+an*L]],rr(1.4,3.4),pig(c,0.1),0.95,148+t*14);if(t>0.72&&ox>-rx*0.3&&rnd()<0.26)ms([[x+ox,y+oy-1.2],[x+ox+rr(1,3),y+oy-1.4]],rr(0.9,1.5),rnd()<0.8?[116,128,152]:[120,110,76],rr(0.4,0.75),166);}}
function baum(){zs('baum');BAUM=[];var i,k;BAUM.push({p:[[1012,772],[1016,726],[1004,680],[972,636],[956,596],[964,556],[952,522]],w:36,ws:[1.34,1,0.8,0.68,0.62,0.56,0.46]});
zweig(966,618,-2.82,104,15,3,0.045);zweig(958,574,-2.5,92,13,3,-0.015);zweig(962,552,-1.2,66,10,2,-0.04);zweig(952,524,-1.95,76,10,3,-0.05);zweig(1004,682,-0.55,46,9,2,-0.05);
var bl=[];BAUM.forEach(function(b){var p=b.p,n=p.length,ws=b.ws,j;if(!ws){ws=[];for(j=0;j<n;j++)ws.push(Math.max(0.16,1-0.8*Math.pow(j/(n-1),0.86)));}ms(p,b.w,[16,12,11],1,150,b.w>12?4:b.w>5?2:0,0.16,ws);
if(b.w>6){var nb=Math.round(b.w*(b.w>20?5:2.4));for(j=0;j<nb;j++){var q9=Math.floor(rr(0,n-1.01)),g9=rr(0,1),a9=p[q9],c9=p[q9+1],dx9=c9[0]-a9[0],dy9=c9[1]-a9[1],m9=Math.hypot(dx9,dy9)||1,w9=b.w*lerp(ws[q9],ws[q9+1],g9)/2,o9=rr(-0.86,0.86),x9=lerp(a9[0],c9[0],g9)-dy9/m9*o9*w9,y9=lerp(a9[1],c9[1],g9)+dx9/m9*o9*w9,L9=rr(4,13)*(b.w>20?1.3:1),cs9=dx9/m9,sn9=dy9/m9,hl9=k01(-dy9/m9*0)+k01((dx9>0?o9:-o9)*-1);ms([[x9-cs9*L9,y9-sn9*L9],[x9+cs9*L9+rr(-0.8,0.8),y9+sn9*L9]],rr(0.9,2.2),rnd()<0.34?[8,6,6]:m3([38,30,26],[62,62,74],hl9*0.7),rr(0.45,0.85),rnd()<0.34?140:158,0,0,[0.3,1,0.3]);}}
if(b.w>2.5){var t=rr(0,0.2);while(t<0.9){var e=Math.min(1,t+rr(0.05,0.16)),q0=Math.floor(t*(n-1)),q1=Math.min(n-1,Math.ceil(e*(n-1))),seg=p.slice(q0,q1+1).map(function(r,j){var w=b.w*ws[q0+j]/2,dx=p[Math.min(n-1,q0+j+1)][1]-p[Math.max(0,q0+j-1)][1],dy=-(p[Math.min(n-1,q0+j+1)][0]-p[Math.max(0,q0+j-1)][0]),m=Math.hypot(dx,dy)||1;if(dy>0){dx=-dx;dy=-dy;}return[r[0]+dx/m*w*0.62,r[1]+dy/m*w*0.62];});if(seg.length>1)ms(seg,Math.max(0.9,b.w*0.08),[84,94,122],rr(0.16,0.42),160);t=e+rr(0.12,0.42);}}
if(b.tip)bl.push(p[n-1]);});
bl.forEach(function(q){laub(q[0],q[1],rr(11,20),rr(7,13),Math.floor(rr(18,34)));});
for(k=0;k<30;k++){gras(rr(976,1036),rr(742,774),70,0,[120,130,156]);}
for(k=0;k<12;k++){heide(rr(960,1036),rr(748,776),70,0);}}
function vornStriche(){zs('vorn');var k,x,y,s,wf,id,KH=[112,122,150];
for(k=0;k<3000;k++){x=rr(-10,1050);y=rr(578,782);id=idAt(x,y);if(id!=10)continue;s=sZ(y);wf=wl(x,y,170);var n1=vn(x/88+5,y/34+1),n2=vn(x/26+1,y/13+7),q=rnd(),c=q<0.3?[30,21,14]:q<0.56?[52,38,24]:q<0.78?[40,31,27]:q<0.92?[64,52,34]:[46,40,36];c=m3(c,[14,10,8],k01(0.6-n1)*0.9);c=m3(c,[86,70,44],k01(n1-0.56)*1.1);if(wf<0.3&&n2>0.62)c=m3(c,[92,98,118],0.2);c=m3(c,[150,96,54],wf*wf*0.8);var L=s*rr(0.05,0.24)*(1-wf*0.55),w=s*rr(0.025,0.075)*(1-wf*0.4),dy2=rr(-0.12,0.12)*L;ms([[x-L,y-dy2],[x,y+rr(-0.05,0.05)*L],[x+L,y+dy2]],w,pig(c,0.09),rr(0.42,0.8),126+Math.floor(n2*24),2,0.16);}
for(k=0;k<2800;k++){x=rr(-10,1050);y=rr(576,782);id=idAt(x,y);if(id!=10)continue;s=sZ(y);wf=wl(x,y,170);var nah=idAt(x,y-s*0.3)==11||idAt(x,y+s*0.3)==11||idAt(x-s*0.45,y)==11||idAt(x+s*0.45,y)==11,di=vn(x/64+2,y/30);if(!nah&&di<0.34)continue;q=rnd();if(q<0.42&&di>0.44)heide(x,y,s,wf);else if(q<0.96)gras(x,y,s,wf,wf<0.2?KH:null);else stein(x,y,s*rr(0.04,0.11),wf);}
[WV,WL,WR].forEach(function(B){[0.42,-0.42].forEach(function(o){var i=0;while(i<B.L.length-2){var e=Math.min(B.L.length-1,i+Math.floor(rr(1,4))),p=[],j;for(j=i;j<=e;j++){var a=B.L[j],b=B.Q[j],u=0.5+o*0.5+rr(-0.03,0.03);p.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u)]);}if(p.length>1&&idAt(p[0][0],p[0][1])==11&&rnd()<0.74){var my=p[0][1],f=wl(p[0][0],my,170);ms(p,Math.max(1,sZ(my)*rr(0.02,0.05)),m3([34,28,24],[132,92,54],f*f),rr(0.22,0.46),140,1);}i=e+Math.floor(rr(1,3));}});
for(var k=0;k<B.L.length-1;k++){[B.L,B.Q].forEach(function(E){if(rnd()<0.3)return;var x=E[k][0],y=E[k][1],s=sZ(y),i0=idAt(x,y);if(i0!=10&&i0!=11)return;var wf=wl(x,y,170);if(rnd()<0.72)gras(x+rr(-5,5),y+rr(-1,4),s,wf,wf<0.2?KH:null);else heide(x,y+rr(0,3),s*0.8,wf);});}});
for(k=0;k<1500;k++){x=rr(-10,800);y=rr(590,782);if(idAt(x,y)!=11)continue;s=sZ(y);wf=wl(x,y,170);var r=s*rr(0.006,0.03),c=m3(rnd()<0.5?[106,100,88]:[46,38,30],[252,190,118],wf*wf*0.82);if(wf<0.2&&rnd()<0.2)c=m3(c,[122,130,156],0.4);var an=rr(-0.4,0.4);ms([[x-r*1.4,y-an*r],[x+r*1.4,y+an*r]],Math.max(0.9,r),pig(c,0.08),rr(0.28,0.72),rnd()<0.5?156:140);}
for(k=0;k<70;k++){x=rr(0,860);for(y=570;y<720;y+=2){if(idAt(x,y)==10||idAt(x,y)==11)break;}if(y>=720)continue;var hh=rr(4,11);ms([[x,y+2],[x+rr(-2,2),y-hh]],rr(1,1.8),[40,32,26],0.92,150);if(rnd()<0.6)ms([[x+0.6,y-2],[x+rr(-2,2),y-hh]],0.9,[108,118,146],0.5,162);}}
function felsen(){zs('stein');FELS.forEach(fels);}
function schatten(){zs('holz');ms([[342,680],[396,681],[462,684]],11,[26,17,12],0.34,132,2,0.1,[0.9,1,1.25,1.5,1.2]);ms([[340,680],[384,680.5]],7,[20,13,9],0.42,130,0,0,[1,0.9,0.3]);ms([[214,710],[176,724],[128,744]],19,[10,7,6],0.3,130,0,0,[0.8,1,1,0.75,0.3]);}
function touches(){DM=D.getImageData(0,0,W,H).data;
gebirgStriche();ferne();wege();flussStriche();segel();stadt();waldStriche();sterne();zs('mond');
gestirn(LU,[224,228,244],[24,26,62],Math.PI/3,[13.7,4.2],190);gestirn(CE,[128,232,238],[18,40,66],Math.PI/3,0,182);
vornStriche();felsen();schatten();meilenstein();wegweiser();laterne();baum();zs('pinsel');}
function glaze(){zs('glasur');
var T=mk(),t=T.getContext('2d'),k;for(k=0;k<70;k++){var y=rr(372,500),x=rr(-20,1060),mt=1-(y-372)/170;eg(t,x,y,rr(4,9),rr(4,9),k%3?'214,190,190':'176,180,206',0.03+0.05*mt);}t.globalCompositeOperation='destination-out';t.fillStyle='#000';t.fill(BAND.vorn);t.fill(schl(W1));t.fill(schl(W2));O.drawImage(T,0,0);
O.save();O.fillStyle=LG(O,0,HZ-46,0,HZ+60,[0,'rgba(226,178,160,0)',0.5,'rgba(232,186,164,0.14)',1,'rgba(214,176,170,0)']);O.fillRect(0,HZ-46,W,106);O.restore();
glow(O,LU[0],LU[1],150,'176,190,226',0.13,'screen');glow(O,LU[0],LU[1],76,'200,212,240',0.13,'screen');glow(O,CE[0],CE[1],58,'120,226,210',0.13,'screen');
glow(O,LAT[0],LAT[1],150,'255,136,60',0.24,'screen');glow(O,LAT[0],LAT[1],56,'255,180,100',0.42,'screen');glow(O,LAT[0],LAT[1],20,'255,232,180',0.55,'screen');
eg(O,LAT[0]+8,688,3,50,'255,150,76',0.18,'screen');
[[612,455],[596,474],[624,476]].forEach(function(q){glow(O,q[0],q[1],6,'255,190,110',0.22,'screen');});glow(O,779,HZ+4,10,'255,214,170',0.28,'screen');}
var TXT=[{"it":0,"role":"regel","glyphs":[{"d":"M204.4 64.1L322.4 61.1L322.4 67.1ZM329.4 64.1L336.4 57.1L343.4 64.1L336.4 71.1Z","b":[204.4,57.1,343.4,71.1]},{"d":"M835.6 64.1L717.6 61.1L717.6 67.1ZM696.6 64.1L703.6 57.1L710.6 64.1L703.6 71.1Z","b":[696.6,57.1,835.6,71.1]}]},{"it":1,"role":"ober","glyphs":[{"d":"M373.9 37.8L372.7 35.8L369.5 35.3L368.6 34.6L368.9 34L369.5 33.6L374.3 32.6L379.3 32.5L382.1 32.9L385.3 32.8L387.2 33L390.3 33.6L396.2 36.2L397.1 36.9L400.7 41.6L401.5 43.6L401.9 45.6L402.8 47.5L403.5 52.3L403.3 56.3L402.9 57.8L400 64.2L397.2 68.2L393 72.8L391.7 73.7L388.4 75.3L384.9 76.1L382.4 76.9L375 77.9L369.5 78L366.2 77.4L361.7 78.2L360.4 78.1L359.4 77.7L358.7 76.9L358.4 76.2L358.4 75.4L358.6 75L359.7 74.2L363.2 73L364.2 72.4L365.3 71.1L366.1 69.5L367.9 64L369.6 56.6L371.5 51.9L371.9 46.8L373.7 40.7L374 38.9ZM372.7 71L373.8 73.6L374.9 74.5L377.6 75.3L379.5 74.8L382 73.1L383.9 72.3L386.9 69.5L387.7 67.7L389.2 66.1L392.6 60.6L393.9 55.5L394.7 53.6L395 50.6L394.8 47.8L393.6 43.9L393.4 42.4L392.8 41.2L390.5 37.3L389.3 36.2L387.9 35.3L386.2 35L383 33.9L382.2 34.2L381.8 34.7L381 38L380.7 40.9L380.1 42.9L380 44.6L379.1 46.3L376.4 56.7L375.6 58.9L375.1 61.8L373.6 66.3L372.7 69.9Z","b":[358.4,32.5,403.5,78.2]},{"d":"M404.9 76.5L405 74.7L405.4 73.6L406.6 71L408 68.8L409.4 65.5L410.8 63.6L411.6 61.3L412.8 59L412.7 58.2L412.4 57.7L411.8 57.3L410.5 57.3L408.1 58.8L406.7 59.1L407.1 57.7L407.8 56.9L412.5 53L414.6 52.4L417.6 50.8L418.8 50.8L419.9 51.1L420.1 51.5L420.2 52.6L420 54.2L418.2 57.8L417.8 59.1L416.9 60.6L413.9 68.3L412.8 69.9L412.7 70.7L412.9 71.5L413.3 72L414.1 72.3L414.8 72.1L417.9 70.2L419.4 69.6L420.4 69.5L419.9 70.9L414.7 76.1L410.8 78.1L408.9 78.5L407.2 78.5L405.6 77.8L405.2 77.4ZM418.6 36.2L419.3 34.6L420.2 33.8L421.5 33.3L423.4 33.3L424.5 33.5L425.1 34L425.9 35.7L426 37.1L425.3 39.1L424.4 40.3L423.1 40.7L421.8 40.7L420.3 40.1L419.3 39L418.7 37.5Z","b":[404.9,33.3,426.0,78.5]},{"d":"M422.9 71.5L423.5 69.7L425.8 64.4L426.7 61.5L428.3 59.4L429.6 56.3L433.8 51.7L434.9 50.9L435.8 50.6L439.1 50.6L440.9 51.5L443 53.1L444.2 55.1L444.5 57.8L444.2 59.4L443.2 60.6L440.5 62.4L435.7 64.5L430.2 64.9L429.4 66.3L428.8 69.2L428.7 70.1L429.1 72.1L429.8 73.3L431 73.7L433.1 73.6L433.6 73.4L434.8 72.2L437.4 70.9L438 70.6L439.7 70.5L439.2 72.2L438.1 73.5L436.9 74.4L435.6 75L434.8 75.6L433.3 76.1L431.1 77.5L427 77.9L425.2 77.2L423.8 75.6L423 73.7ZM431.6 62.3L432.3 62.8L433.6 62.7L435.1 62L436.6 60.9L439.2 58.1L439.7 56.7L439.8 55.1L439.3 54.6L438 54.5L435.9 56L432.9 59.4L432 61.1Z","b":[422.9,50.6,444.5,77.9]},{"d":"M467 76.2L467.3 73.4L469.3 66.5L469.5 63.6L469.3 62.6L470.7 60.3L470.7 58.7L471.3 56.2L472 50.5L474.1 40.9L474.1 40.5L473.5 39.7L470.1 37.6L469 36.7L468.8 35.9L468.9 35.3L469.9 34.4L474.4 34.6L485.4 34.2L486.1 34.3L486.6 34.6L486.8 35.2L486.7 36.4L486 37.2L483.1 38.1L481.8 39L480.6 40.5L479.7 42.4L479.6 45L478.9 46.8L478.1 51.8L476.3 56.7L475.2 63L474.9 63.7L476.1 63.9L477.3 63.7L478.2 63.3L480.2 61.4L481.3 60.7L481.9 59.3L485 55.4L485.7 54L489.6 50.2L491.9 47.2L493.7 45.7L495.6 43.2L496.4 41.1L496.3 39.1L495.4 37.5L492.8 35.6L492.4 34.9L492.8 34.3L493.6 33.9L495.4 33.8L500.2 34.7L503.2 34.4L505.6 34.3L508.9 33.9L510.3 34.3L510.6 34.9L510.3 36.3L509.5 36.9L505.3 37.8L504.3 38.5L503.5 39.5L501.6 43.7L501.3 45L501.2 47.2L500.4 49L500.2 50.3L499.5 52L498 58.6L496.8 61.2L496.8 62.4L497.1 62.8L498.2 63.2L498.8 63.1L499.8 62.2L502.6 58.4L506.5 54.7L510.5 49.6L513.1 47.1L514.3 45.3L517.5 42L519.2 39.2L519.5 38L519.3 37.5L517.6 37.2L516 36.4L515.5 35.5L515.7 35.1L516.2 34.7L517.3 34.4L523.1 34.4L527 33.8L529.2 34.3L530.6 35.1L530.9 36.2L530.7 36.8L528.8 38.4L523.8 40.7L523 41.4L519.6 45.4L517.6 47L516.3 48.6L515 49.8L511.6 54.1L505.8 59.3L501.3 64.4L498.2 67.3L493.3 73.5L490.6 76L489.6 76.4L488.7 76.5L487.8 75.8L487.7 74.8L487.9 73.7L489.4 70.2L490.6 64L493.2 55.8L493.7 53L493.9 50.1L493.8 49.6L493.4 49.4L488.4 54L485.4 58.1L483.5 59.9L477.7 67.7L474.9 70.8L470.9 76.5L469.7 77.2L468.4 77.3L467.4 77.2L467 76.5Z","b":[467.0,33.8,530.9,77.3]},{"d":"M515.7 71.5L516.3 69.7L518.6 64.4L519.5 61.5L521.1 59.4L522.5 56.3L526.6 51.7L527.7 50.9L528.6 50.6L531.9 50.6L533.7 51.5L535.8 53.1L537 55.1L537.3 57.8L537 59.4L536 60.6L533.3 62.4L528.5 64.5L523 64.9L522.3 66.3L521.6 69.2L521.6 70.1L521.9 72.1L522.6 73.3L523.8 73.7L525.9 73.6L526.4 73.4L527.6 72.2L530.2 70.9L530.9 70.6L532.5 70.5L532 72.2L530.9 73.5L529.7 74.4L528.4 75L527.6 75.6L526.1 76.1L523.9 77.5L519.9 77.9L518 77.2L516.6 75.6L515.8 73.7ZM524.4 62.3L525.2 62.8L526.4 62.7L527.9 62L529.4 60.9L532.1 58.1L532.6 56.7L532.6 55.1L532.1 54.6L530.8 54.5L528.7 56L525.8 59.4L524.8 61.1Z","b":[515.7,50.6,537.3,77.9]},{"d":"M528.5 93.6L528.7 92.1L529.2 90.7L530.5 88.9L532.1 87.1L534 85.9L538.6 84.6L539.5 84.1L539.8 83.5L538.8 81.1L539.4 77.3L541.5 75.5L543.1 73.1L543 72.5L541.3 70.8L540.5 68.3L540.3 67.3L540.4 62.9L542.2 57.8L544 54.8L547.4 51.5L548.8 50.6L550.3 50.2L551.3 50.1L554.7 50.7L558.5 51.8L563.6 52.3L564.5 52.6L564.9 54.3L564.6 55.5L564.1 55.8L562.9 55.8L560 55.2L559.3 55.6L558.9 59.6L557.8 63.4L556 67.1L553.9 70.3L552.3 71.8L551.1 72.7L547.4 73.8L546.3 74.4L544.4 75.8L544.1 76.1L544 76.7L544.1 79L546.1 81.4L549.5 82.4L552 83.6L554.5 84L556 84.6L559 86.5L560.8 88.6L561.9 90.9L561.8 92.7L560.9 94.9L558.9 97.7L557.7 98.7L555.9 99.8L552.3 100.7L543 101L535 100.7L531.2 98.9L530.3 98.1L528.9 95.6ZM534.4 93.8L535.5 96.4L537 97.5L539.4 98.4L545.6 99.4L551.7 98.5L553.4 97.4L555.9 96.7L556.5 92.8L556.2 92.2L554.4 90.3L551.9 88.5L548.1 87L544.9 86.1L543.7 86.1L539 87.4L536 89.5L535.4 90.2L534.7 91.6ZM544.6 69.8L544.7 71.4L545.1 72L545.7 72.3L546.6 72L548.9 69.6L551.5 65.4L553.4 61.5L555.2 55.5L555.1 53.8L553.9 52.3L551.8 52.5L548.2 57.6L545.7 63.4L545.5 65.4L544.7 67.2Z","b":[528.5,50.1,564.9,101.0]},{"d":"M562.6 71.5L563.2 69.7L565.5 64.4L566.4 61.5L568 59.4L569.4 56.3L573.6 51.7L574.6 50.9L575.6 50.6L578.8 50.6L580.6 51.5L582.8 53.1L583.9 55.1L584.3 57.8L583.9 59.4L582.9 60.6L580.2 62.4L575.5 64.5L569.9 64.9L569.2 66.3L568.5 69.2L568.5 70.1L568.8 72.1L569.5 73.3L570.7 73.7L572.8 73.6L573.4 73.4L574.5 72.2L577.1 70.9L577.8 70.6L579.5 70.5L579 72.2L577.8 73.5L576.6 74.4L575.3 75L574.5 75.6L573 76.1L570.9 77.5L566.8 77.9L564.9 77.2L563.6 75.6L562.7 73.7ZM571.3 62.3L572.1 62.8L573.3 62.7L574.8 62L576.3 60.9L579 58.1L579.5 56.7L579.5 55.1L579 54.6L577.7 54.5L575.6 56L572.7 59.4L571.7 61.1Z","b":[562.6,50.6,584.3,77.9]},{"d":"M605.4 74.1L604.2 69.1L604.5 67.3L605.9 63.4L607.4 61L609.3 59.1L609.7 58.1L609.4 57.3L608.9 56.8L608.1 56.5L606.7 56.5L605.2 57.6L603.8 59.6L603 60.5L601.9 60.8L601.2 60.7L600.8 60.4L600.5 59.3L600.9 57.6L604.7 52L606.3 51.1L615.6 50.6L617.4 50.9L618.1 51.5L618.3 51.9L618.4 52.5L616.7 55.5L613.6 58.2L612.5 59.6L611.3 62L610.4 64.6L610.2 67.6L610.6 69.8L611.8 71.8L613.3 72.9L615.9 72.4L618.4 71.1L622.7 65L623.5 63.1L623.8 61.6L623.3 56.2L623.5 54.3L624.1 52.5L625 51.8L626.2 51.4L627.3 51.5L628.3 52L629 53.5L629.1 55.7L628.6 58.2L627.6 61.1L624.6 67L618.4 74.6L614.7 76.7L612.7 77.4L610.6 77.6L609.5 77.4L607.9 76.6L606.6 75.5Z","b":[600.5,50.6,629.1,77.6]},{"d":"M631.3 71.1L631.6 67.5L632.3 63.6L634.5 57.4L635.2 56.3L638 53.4L639 51.9L641.5 50.3L644.3 49.9L646.7 50.3L649.6 52.3L650.7 53.6L651.3 55L651.2 59.2L650.5 61.7L650.1 65.1L649 67.5L647.6 71.8L646.3 73.8L642 77.4L639.5 77.7L635.8 77.6L634.4 76.9L632.9 75.3L631.7 72.9ZM636.1 70.4L636.3 72.2L636.8 73.7L637.9 74.8L638.9 75L641 73.1L642.6 70.8L643.3 68.8L645.2 65.6L646 63.2L646.4 60.8L647.1 59.7L647.4 56.8L647.2 55.2L646.6 54L645.4 52.5L643.3 53.3L642.4 54.1L641.8 54.8L641.5 56.2L640.4 57.7L639.5 59.8L638.6 63.4L637.9 64.8L637.4 67L636.5 68.9Z","b":[631.3,49.9,651.3,77.7]},{"d":"M655.2 77L655.8 74.3L657.4 70.5L658.2 68.1L659.4 66.3L660.4 63.6L661.3 61L661.7 59L661.5 57.2L661.1 56.5L660.2 56.2L659.5 56.4L659.1 56.8L656.9 59.6L656 59.8L655.6 59.7L655.7 58.7L656.8 56.9L657.9 55.7L661 52.7L662.8 51.9L664 51.9L665.2 52.2L666.2 53L668.5 55.8L670.3 55.2L673 53L676.4 51L678.1 51.3L679.6 52.1L680.6 53.4L681.1 54.8L680.8 57.9L679.5 62L678.2 64.2L677.8 66.3L676 70.2L675.3 73L675.6 74L676 74.4L676.6 74.5L677.2 74.4L679.4 72L680.5 71.4L681.4 71.4L681.6 71.7L681.2 72.8L678.5 74.5L676.6 76.3L672.9 78.1L671.8 78.3L670.6 78L669.5 77.3L668.8 76.3L668.6 75L668.8 73.6L670.1 71.5L671.7 67.8L674.3 62.8L675.9 58.6L675.7 57L675.3 56.1L674.2 55.2L673 54.8L670.7 56.2L669.3 57.6L666.8 61.6L665.7 62.7L662.5 70.3L659.7 74.9L658.4 78.1L657.5 78.6L656.1 78.6L655.6 78.4L655.3 78Z","b":[655.2,51.0,681.6,78.6]}]},{"it":0,"role":"titel","glyphs":[{"d":"M243.7 190L244.5 185.7L244.5 183.3L242.4 172.4L242.3 166.8L243.1 160L245.4 147.9L246.5 136.6L247.4 133.8L251.7 128.3L255.6 121.8L258.4 118.9L263.7 114.6L268.5 108L271.5 105L281.5 98.3L291.3 92.5L295 90.7L306.1 86.7L308.7 86.2L314.4 86.1L320.7 84.6L324.8 84.1L339.4 83.8L344.5 84.4L352.2 86L359.8 88L363.6 89.5L366.8 91.8L375.5 100.1L386.3 106.5L391.6 110.8L393.5 113.4L396.2 119.1L400.5 124.4L402.6 127.6L405.9 133.9L407.8 138.7L408.7 142.6L409.2 149.7L411.6 158L412.2 169.2L412.1 177.1L411.5 181.9L410.3 186.3L407.8 191.8L398.3 209.4L393.7 213.8L389.5 220L385 224L376.6 233.4L374.2 235.6L371.4 237.3L360.9 241.2L353.9 244.7L346.3 246.1L337.6 249.1L331.4 249.4L316.4 246.9L303.7 246.4L299.2 245.8L296.2 245L290.6 242.1L283 239.9L280.4 237.9L274.3 231.5L271.7 229.9L265.6 227.2L262.6 224.4L258 216.9L251.2 203.4L244.8 196L243.9 193.4ZM267.2 165.6L267.9 169.4L271.4 176.2L272.5 179.1L272.9 181.8L273.2 187.7L273.9 190.3L274.9 192.2L278.6 197L279.3 199.1L279.9 203.4L280.7 205.7L283.7 209.4L288.3 217.2L290.6 219.8L293.3 222.2L304 229.8L311.8 233.8L319.1 236.2L324.2 236.9L328.5 236.8L337.5 234.8L349.3 233.1L352.8 231.6L363.7 225L366.8 222.4L369.4 219.2L378 203.6L379.2 200.6L382.6 190L384.3 178.5L384.3 171.1L384.9 165.8L384.7 163.2L382.9 157.8L377.9 147L376.6 139.7L374.1 134.2L372.2 127L370.2 123L366.5 117.7L361.7 112.3L356.4 107.3L351.4 103.5L346.5 101.1L337.6 99.6L334.6 97.3L332.3 96L324.9 93.8L319.7 93.2L313.5 93.7L305.7 95.3L299.9 97.4L297.4 99.1L293.6 102.7L285.4 109.3L276.7 118L274.4 121.2L272.4 125.3L270.9 129.7L269.7 134.6L268.3 146.5L268.4 159.3Z","b":[242.3,83.8,412.2,249.4]},{"d":"M425.7 197L426.9 184.4L428.2 178L431.2 169.8L435.7 161.6L440.7 155.1L446.4 149.8L450.7 146.8L463.3 139.9L466.6 139L478.3 139L482.9 139.5L487.2 140.9L497.9 145.7L501.7 148.1L509.8 155.5L511.3 157.5L512.7 160.3L515.6 168.8L516.3 172.9L515.7 175.2L514.3 176.6L512.1 177.8L506.4 178.9L487 179.9L478.5 179.5L471.3 180.5L469.3 180.4L464.4 179.4L452.8 179.5L450.2 180L448.4 180.8L446.5 182.5L446 184.4L445.5 188.9L445.6 194.4L446.3 197.5L447.8 201L452.3 209.3L455.2 213.5L459.3 217.5L464.2 220.5L470.7 223.3L474.1 224.4L479.4 225L485.1 225L491.2 224.2L496.2 223.1L501.7 221L508.6 217L511.5 216.7L512.1 217.1L512.5 218.6L512.5 221.3L511.9 224.8L510.2 229.2L507.9 232.5L505.7 234.6L503.1 236.4L494.4 241.6L488 244.8L484 246L476.1 247.1L471.8 247.2L466.7 246.6L461.5 245.5L456.4 243.7L451.5 241.2L447 238.2L442.9 234.7L438.9 230.2L435.6 225.6L432.4 219.9L429.8 214.3L428 209.4ZM447.7 167.1L448.1 170.1L449.3 173.2L449.7 173.5L455.1 173.4L467.4 171.7L480.1 171.9L488.1 170.3L491.3 169L492.3 168L493.3 166.4L493.7 164.5L493.6 161.9L492.8 158.9L491.3 156.3L489.3 154.1L486.5 151.9L483.4 150.3L479.6 148.9L475.6 148.2L472 148.2L468.4 149L463.8 150.5L459.8 152.3L457.1 154L455.4 155.7L452.7 159.9L449 163.9L448 165.7Z","b":[425.7,139.0,516.3,247.2]},{"d":"M529.9 239.4L530 239L533 236.7L542.7 230.2L543.3 230.2L543.9 229.3L544.6 226.2L545.4 214.2L545.5 200.6L546 192L545 180.5L543.5 175.3L541.5 172.1L537.3 167L531.6 160.8L529.7 159.4L531.5 157.9L533.6 155.5L536.7 153.3L540.3 151.8L547.3 149.7L555.1 145.2L558.1 144.1L561.5 144.3L563.9 146.1L565.1 148.3L565.9 153.3L566.7 155.5L567.1 156.2L567.9 156.6L570.5 156.3L572.6 155.4L581.5 149.3L585 147.7L593.8 146.1L595.9 146.4L598 147.5L599.8 149.2L601.3 151.7L602.7 155.8L603.3 159.5L603 163.1L601.9 166.9L600.3 170L598.4 172.1L596.6 173.2L594.6 173.8L592.3 174L590.1 173.7L588.1 172.9L584 169L581.6 167.5L576.7 166.3L572.6 166.3L569.3 167.7L565.6 171L563.4 174.3L562.4 177.8L562 183.3L562.7 196.6L562.4 205.2L562.6 220.7L563 223L565.9 228.9L568.9 232.3L572.2 234.2L578.9 236.4L581.2 237.9L582.6 240.1L583.1 242.7L583 243.8L581.8 244.7L575.5 245.8L564.6 245.6L556.1 246.8L549 246L541.1 246.6L535 245.2L531 243.4L530 241.7Z","b":[529.7,144.1,603.3,246.8]},{"d":"M625.9 245.9L618 246.5L615.7 245.1L615.1 242L616.9 238.9L620 237.5L624.7 236.7L626.4 236.1L627.9 235L628.9 233L630.3 223.3L632.1 213.9L632.6 189L631.5 180.4L631.3 171.8L630.5 168.9L629.5 167L628.1 165.5L623.3 162.4L621.3 160.7L619 156.8L618.9 155.7L620 154.7L626.7 151.7L638.7 145.9L641.9 145.3L646.5 145.6L650.8 147.3L651.9 151.4L650.9 162.7L650.5 183.1L649.7 194.5L650.3 206.1L650 218.8L651.2 230.8L651.9 233.5L652.5 234.2L655.4 235.4L660.7 236.6L661.8 236.6L662.7 237.9L663.3 239.7L663.4 242.6L662.5 244.7L661.4 245.7L659.7 246.5L657.6 246.9L654.9 246.9L647.7 246L632.8 245.7ZM625.7 99.8L627.8 96L633.4 90.6L635.9 89.1L638.9 88.7L650.5 91.4L652.6 96.1L653 99L653.1 101.7L652.6 104.2L651.9 106L650.7 107.7L649.1 109.1L644.5 112.2L641.8 113.5L639 114.2L635.8 114.2L633.2 113.8L631.3 113L629.7 111.7L627.7 109.3L626.2 106.7L625.6 104.6Z","b":[615.1,88.7,663.4,246.9]},{"d":"M674.7 245.2L674.8 241.3L675.6 240.6L679 238.3L688.7 234.3L692.1 231.5L693.8 229.1L695.1 226.2L696.3 222.5L696.9 219.3L696.8 216.1L695.2 207L696.2 200.2L695.5 194L695.6 189.8L696 185.6L697.4 179L697.9 174.5L697.8 159.9L698.3 152.8L698 145.6L698.3 143.7L699.3 141.3L700.7 139.9L699.7 138.6L698.1 132.5L699.2 120.8L698.6 113.7L698.6 108.4L697.9 105.5L696.2 102.7L686.6 92.1L686.2 91.3L686.5 88.4L686.9 87.4L687.7 86.9L696.2 85.4L703.5 83.1L706.6 82.6L709.8 82.9L713.9 84.3L716.9 87L716.5 93.1L717.7 104.5L717.1 115.6L717.7 148.1L716.7 154.5L716.7 160L715 164.6L714.5 167.3L714.6 172.1L715.5 175.5L716.5 176.4L717.4 176.7L720.8 175.7L726.6 171.5L735.5 166.8L739.6 162.9L741.8 159.6L743.1 156.6L742.9 155.6L740.4 151.2L739.5 148.8L739.2 147.1L739.6 145.7L745.1 144.9L755.4 145.1L772.6 143.9L777 144.2L779.5 145.3L781.3 147.4L781.5 148.8L778.6 151.9L774.3 154L762.9 158L756.1 161.1L753.6 162.8L749.8 166.7L743.6 170.7L742.4 172.2L741.8 174.1L741.6 176.7L741.9 179.3L743 182.7L744.6 185.4L751.4 193L756.3 201L761.7 206.1L767.1 215.1L772.6 222.3L777.5 227.5L780.5 229.9L783.2 231.4L792.8 235.3L795.9 237.2L797.4 239.1L797.7 241L797.4 243.5L796.4 244.7L791.8 245.2L785.7 245L774.2 243.6L771.9 243.8L763.6 245.4L756.1 245.9L750.3 245.8L746.4 244.5L745.8 243.7L744.9 241.5L744.8 239.5L745.1 237.1L750.2 233.8L752 232.2L752.8 230.6L752.5 229.1L747.1 223L744 214.5L739.6 209.5L735.7 203.2L731.4 199L724.9 191.8L722.4 190.1L718.9 189.1L717.8 189.5L717.3 190.2L717.6 192L717.2 193.9L715.3 199.4L714.8 202L714.9 206.7L716.1 214.9L714.9 223.5L715.2 227.8L716.6 231.5L719.2 234.4L722 235.6L730.9 237.9L730.8 242L729.7 244.8L726.9 245.9L723.8 246.2L712.1 244.9L694 245.5L682.3 246.4L679.6 246.2L678 245.8L676.3 246.3Z","b":[674.7,82.6,797.7,246.4]}]}];
function goldAt(u){var G=[[0,[250,226,156]],[0.3,[238,194,100]],[0.62,[206,148,58]],[1,[140,92,32]]];u=u<0?0:u>1?1:u;for(var k=1;k<G.length;k++)if(u<=G[k][0]){var a=G[k-1],b=G[k],t=(u-a[0])/(b[0]-a[0]);return[a[1][0]+(b[1][0]-a[1][0])*t,a[1][1]+(b[1][1]-a[1][1])*t,a[1][2]+(b[1][2]-a[1][2])*t];}return G[G.length-1][1];}
function c2h(c){var s='#';for(var k=0;k<3;k++){var v=Math.max(0,Math.min(255,Math.round(c[k])));s+=(v<16?'0':'')+v.toString(16);}return s;}
function letter(P,b,it,big){var w=b[2]-b[0],h=Math.max(8,b[3]-b[1]),x,y,k,sh=big?1:0.7,sl=it?0.22:0,st=big?3:2.4;
O.save();O.translate(6*sh,7*sh);O.fillStyle='rgba(12,7,4,0.5)';O.fill(P);O.translate(2*sh,2*sh);O.fillStyle='rgba(12,7,4,0.3)';O.fill(P);O.restore();
O.fillStyle='#7c5418';O.fill(P);Hc.fillStyle=gy(172);Hc.fill(P);
O.save();O.clip(P);Hc.save();Hc.clip(P);
for(x=b[0]-4;x<b[2]+h*sl+4;x+=rr(st*0.8,st*1.25)){y=b[1]-4-rr(0,18);while(y<b[3]+4){var L=rr(10,24)*(big?1.2:0.8),y2=y+L,u=((y+y2)/2-b[1])/h,c=goldAt(u+rr(-0.06,0.06)),v=rr(0.92,1.08),xa=x-(y-b[1])*sl,xb=x-(y2-b[1])*sl;dS(mkst([[xa+rr(-0.6,0.6),y],[(xa+xb)/2+rr(-0.8,0.8),(y+y2)/2],[xb+rr(-0.6,0.6),y2]],st*rr(1.1,1.6),c2h([c[0]*v,c[1]*v,c[2]*v]),rr(0.75,0.95),Math.round(166+(1-Math.max(0,Math.min(1,u)))*24+rr(-4,4)),2,0.07));y=y2-rr(2,6);}}
O.lineJoin='round';O.save();O.translate(2.4*sh,2.6*sh);O.lineWidth=3*sh;O.strokeStyle='rgba(255,242,196,0.7)';O.stroke(P);O.restore();
O.save();O.translate(-2.2*sh,-2.4*sh);O.lineWidth=3*sh;O.strokeStyle='rgba(92,54,12,0.55)';O.stroke(P);O.restore();
Hc.save();Hc.translate(2*sh,2*sh);Hc.lineWidth=2.4;Hc.strokeStyle=gy(190);Hc.stroke(P);Hc.restore();
O.restore();Hc.restore();
O.lineJoin='round';O.lineWidth=big?3.6:2.8;O.strokeStyle='rgba(16,9,5,0.94)';O.stroke(P);Hc.lineJoin='round';Hc.lineWidth=big?3.6:2.8;Hc.strokeStyle=gy(146);Hc.stroke(P);
for(k=0;k<(big?3:1);k++){var gx=b[0]+w*rr(0.15,0.6),gq=b[1]+h*rr(0.06,0.3);if(O.isPointInPath(P,gx,gq))dS(mkst([[gx,gq],[gx+rr(1,3),gq+rr(-1,1)]],rr(2,3.4),'#fff6d8',0.9,198,0));}}
function TT(){var Q=[],k=0;TXT.forEach(function(l){l.glyphs.forEach(function(g){Q.push([new Path2D(g.d),g.b,l.it,l.role=='titel']);});});
function step(){if(k>=Q.length){setTimeout(fin,0);return;}var q=Q[k++];letter(q[0],q[1],q[2],q[3]);if(!RM)V.drawImage(OC,0,0);setTimeout(step,RM?0:35);}step();}
function box(a,t,rd){var x,y,o,s,iv=1/(2*rd+1);for(y=0;y<H;y++){o=y*W;s=0;for(x=-rd;x<=rd;x++)s+=a[o+(x<0?0:x>W-1?W-1:x)];for(x=0;x<W;x++){t[o+x]=s*iv;var xa=x+rd+1,xb=x-rd;s+=a[o+(xa>W-1?W-1:xa)]-a[o+(xb<0?0:xb)];}}for(x=0;x<W;x++){s=0;for(y=-rd;y<=rd;y++)s+=t[(y<0?0:y>H-1?H-1:y)*W+x];for(y=0;y<H;y++){a[y*W+x]=s*iv;var ya=y+rd+1,yb=y-rd;s+=t[(ya>H-1?H-1:ya)*W+x]-t[(yb<0?0:yb)*W+x];}}}
function cs(v){return v<0?0:v>255?255:v|0;}
function rgb(c,f){return'rgb('+cs(c[0]*f)+','+cs(c[1]*f)+','+cs(c[2]*f)+')';}
function gy(v){v=v|0;return'rgb('+v+','+v+','+v+')';}
function rs(p,st){var o=[[p[0][0],p[0][1]]],n=p.length,a=p[0],i,j,m,t,u,b,c,L;if(n<2){o.push([p[0][0]+0.6,p[0][1]+0.2]);return o;}
function qd(a,c,b){L=Math.hypot(c[0]-a[0],c[1]-a[1])+Math.hypot(b[0]-c[0],b[1]-c[1]);m=Math.max(1,Math.ceil(L/st));for(j=1;j<=m;j++){t=j/m;u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);}}
for(i=1;i<n-1;i++){b=[(p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2];qd(a,p[i],b);a=b;}
c=[(a[0]+p[n-1][0])/2,(a[1]+p[n-1][1])/2];qd(a,c,p[n-1]);return o;}
function prf(t){return(t<0.12?0.58+3.5*t:1)*(t>0.62?1-0.82*Math.pow((t-0.62)/0.38,1.5):1);}
function pg(P,Rd,wp){var n=P.length,Lf=[],Rt=[],ac2=[0],tot=0,i;for(i=1;i<n;i++){tot+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);ac2.push(tot);}for(i=0;i<n;i++){var a=P[i>0?i-1:0],b=P[i<n-1?i+1:n-1],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,nx=-dy/m,ny=dx/m,tt=tot>0?ac2[i]/tot:0.5,w=Rd*(wp?(function(){var f=tt*(wp.length-1),q=Math.min(wp.length-2,Math.floor(f)),g=f-q;return(wp[q]+(wp[q+1]-wp[q])*g)*(tt>0.95?1-(tt-0.95)/0.05*0.45:1);})():prf(tt));Lf.push([P[i][0]+nx*w,P[i][1]+ny*w]);Rt.push([P[i][0]-nx*w,P[i][1]-ny*w]);}return[Lf,Rt];}
function pth(c,G){var Lf=G[0],Rt=G[1],i;c.beginPath();c.moveTo(Lf[0][0],Lf[0][1]);for(i=1;i<Lf.length;i++)c.lineTo(Lf[i][0],Lf[i][1]);for(i=Rt.length-1;i>=0;i--)c.lineTo(Rt[i][0],Rt[i][1]);c.closePath();}
function bp(c,G,f,m){var Lf=G[0],Rt=G[1];c.beginPath();for(var i=0;i<m;i++){var x=Rt[i][0]+(Lf[i][0]-Rt[i][0])*f,y=Rt[i][1]+(Lf[i][1]-Rt[i][1])*f;if(i)c.lineTo(x,y);else c.moveTo(x,y);}}
function dS(s,oc,hc){oc=oc||O;if(hc===undefined)hc=Hc;var Rd=s.R,al=s.al,K=s.K,P=rs(s.p,Math.max(1.2,Math.min(Rd*0.5,6))),G=pg(P,Rd,s.ws),n=P.length;
oc.globalAlpha=s.op?1:al*(K>1?0.9:0.96);oc.fillStyle=rgb(s.c,1);pth(oc,G);oc.fill();
if(hc){hc.fillStyle=gy(s.hb);pth(hc,G);hc.fill();if(s.hb>136&&Rd>1.2){hc.lineWidth=1;hc.strokeStyle=gy(s.hb+8);hc.stroke();}}
if(K>0&&n>2){var bw=Math.max(0.8,2*Rd/K*1.15);oc.lineWidth=bw;if(hc)hc.lineWidth=bw*0.6;for(var b=0;b<K;b++){var f=(s.bo[b]+1)/2,m=Math.max(2,Math.floor(n*s.bl[b]));bp(oc,G,f,m);oc.globalAlpha=al*s.ba[b];oc.strokeStyle=rgb(s.c,s.bc[b]);oc.stroke();if(hc&&b%2==0){bp(hc,G,f,m);hc.strokeStyle=gy(s.hb+(s.bc[b]>1?9:-9));hc.stroke();}}}
oc.globalAlpha=1;}
function inM(x,y){var f=0;for(var q=0;q<MK.length;q++){var m=MK[q];if(x>=m[0]&&x<=m[2]&&y>=m[1]&&y<=m[3])f=f?Math.min(f,m[4]):m[4];}return f;}
scene();touches();
var rdat=R.getImageData(0,0,W,H).data,R0=new Float32Array(N),G0=new Float32Array(N),B0=new Float32Array(N);
for(i=0;i<N;i++){R0[i]=rdat[4*i];G0[i]=rdat[4*i+1];B0[i]=rdat[4*i+2];}
DM=D.getImageData(0,0,W,H).data;
var LC=new Float32Array(N),tq=new Float32Array(N);for(i=0;i<N;i++)LC[i]=0.3*R0[i]+0.59*G0[i]+0.11*B0[i];for(i=0;i<3;i++)box(LC,tq,9);
var QT=new Float32Array(256);for(i=0;i<256;i++)QT[i]=Math.sqrt(i)*16;
Hc.fillStyle='#808080';Hc.fillRect(0,0,W,H);
O.fillStyle='#2a1e17';O.fillRect(0,0,W,H);O.lineCap='round';O.lineJoin='round';Hc.lineCap='round';Hc.lineJoin='round';
for(i=0;i<22;i++){O.save();O.translate(rr(0,W),rr(0,H));O.scale(rr(1,2.6),1);glow(O,0,0,rr(60,140),rnd()<0.5?'60,40,30':'24,20,30',rr(0.3,0.5));O.restore();}
for(i=0;i<70;i++){var x0=rr(-60,W+60),y0=rr(-60,H+60),an=rr(-0.4,0.4),l=rr(90,240),u0={p:[[x0,y0],[x0+Math.cos(an)*l*0.5+rr(-10,10),y0+Math.sin(an)*l*0.5+rr(-8,8)],[x0+Math.cos(an)*l,y0+Math.sin(an)*l]],R:rr(8,18),c:[rr(40,70),rr(28,46),rr(24,40)],al:rr(0.15,0.32),hb:Math.floor(rr(118,128)),K:4};prepB(u0,0.12);dS(u0);}
var li=0,ST=[],si=0,bgd=0,LN=LAY.length;
function layer(){
if(li==LN-1&&!bgd){bgd=1;bgPass();}
if(li>=LN){ST=A;si=0;li=99;setTimeout(chunk,0);return;}
var L=LAY[li],Rr=L[0],br=Float32Array.from(R0),bg=Float32Array.from(G0),bb=Float32Array.from(B0),tp=new Float32Array(N),rad=Math.max(1,Math.round(Rr*0.45)),k,x,y,j;
for(k=0;k<3;k++){box(br,tp,rad);box(bg,tp,rad);box(bb,tp,rad);}
var lum=tp;for(j=0;j<N;j++)lum[j]=0.3*br[j]+0.59*bg[j]+0.11*bb[j];
var C0=O.getImageData(0,0,W,H).data,C=new Float32Array(N*3),qr=new Float32Array(N),qg=new Float32Array(N),qb=new Float32Array(N);for(j=0;j<N;j++){C[3*j]=QT[C0[4*j]];C[3*j+1]=QT[C0[4*j+1]];C[3*j+2]=QT[C0[4*j+2]];qr[j]=Math.sqrt(br[j]>0?br[j]:0)*16;qg[j]=Math.sqrt(bg[j]>0?bg[j]:0)*16;qb[j]=Math.sqrt(bb[j]>0?bb[j]:0)*16;}
var st=Math.max(2,Math.round(Rr)),T=L[3];ST=[];
for(var gy0=0;gy0<H;gy0+=st)for(var gx0=0;gx0<W;gx0+=st){
var im=inM(gx0,gy0);if(li==LN-1&&!im)continue;
var sum=0,mx=-1,mi=0,cn=0;
for(y=gy0;y<Math.min(H,gy0+st);y++)for(x=gx0;x<Math.min(W,gx0+st);x++){j=y*W+x;var e=Math.abs(qr[j]-C[3*j])+Math.abs(qg[j]-C[3*j+1])+Math.abs(qb[j]-C[3*j+2]);sum+=e;cn++;if(e>mx){mx=e;mi=j;}}
if(sum/cn>T*(im?im:(li==LN-2?1.25:1))){var so=mkS(mi%W,(mi/W)|0,Rr,L[1],L[2],br,bg,bb,lum,C,qr,qg,qb,L[6],li);so.al=L[4];so.K=L[5];prepB(so,so.v);ST.push(so);}}
for(k=ST.length-1;k>0;k--){j=Math.floor(rnd()*(k+1));var tt=ST[k];ST[k]=ST[j];ST[j]=tt;}
si=0;li++;setTimeout(chunk,0);}
function mkS(x0,y0,Rd,mn,mxl,br,bg,bb,lum,C,qr,qg,qb,sth,lv){
var i0=y0*W+x0,cr=br[i0],cg=bg[i0],cb=bb[i0],sr=qr[i0],sg=qg[i0],sb=qb[i0],p=[[x0,y0]],x=x0,y=y0,lx=0,ly=0,ms0=DM[4*i0+2]/255,sky=y0<HZ-6,v=sky?0.035:0.11,lm=sky?(Rd>10?1.9:1.5):(ms0>=0.75&&y0>HZ?1.3:1),ml=Math.round(mxl*lm);
for(var k=1;k<=ml;k++){
var ix=x|0,iy=y|0;if(ix<1||iy<1||ix>=W-1||iy>=H-1)break;
var j=iy*W+ix;
if(k>mn){var dc=Math.abs(qr[j]-sr)+Math.abs(qg[j]-sg)+Math.abs(qb[j]-sb);if(dc>sth)break;var dR=Math.abs(qr[j]-C[3*j])+Math.abs(qg[j]-C[3*j+1])+Math.abs(qb[j]-C[3*j+2]);if(dR<dc)break;}
var ms=DM[4*j+2]/255,mdx=0,mdy=0;if(sky&&ms>=0.85)ms=0.37;if(ms>0.02){var th=Math.atan2(DM[4*j+1]-128,DM[4*j]-128)/2;mdx=Math.cos(th);mdy=Math.sin(th);}if(sky&&ms<0.5){mdx=1;mdy=0;}
var gx=lum[j+1]-lum[j-1],gyy=lum[j+W]-lum[j-W],gm=Math.sqrt(gx*gx+gyy*gyy),dx,dy,thr=Rd>10?3.2:1.6;
if(ms>=0.75){dx=mdx;dy=mdy;if(gm>thr){var ex=-gyy/gm,ey=gx/gm;if(ex*dx+ey*dy<0){ex=-ex;ey=-ey;}dx=0.8*dx+0.2*ex;dy=0.8*dy+0.2*ey;}}
else if(gm>=thr){dx=-gyy/gm;dy=gx/gm;}
else if(ms>0.02){dx=mdx;dy=mdy;}
else{var cx=0,cy=0,cm=0;if(ix>3&&iy>3&&ix<W-4&&iy<H-4){cx=LC[j+3]-LC[j-3];cy=LC[j+3*W]-LC[j-3*W];cm=Math.sqrt(cx*cx+cy*cy);}if(cm>0.8){dx=-cy/cm;dy=cx/cm;}else{dx=1;dy=rr(-0.06,0.06);}}
var m0=Math.hypot(dx,dy)||1;dx/=m0;dy/=m0;
if(lx*dx+ly*dy<0){dx=-dx;dy=-dy;}
if(k>1){dx=0.6*dx+0.4*lx;dy=0.6*dy+0.4*ly;var m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;}
x+=Rd*dx;y+=Rd*dy;p.push([x,y]);lx=dx;ly=dy;}
var vv=1+rr(-0.05,0.05),n1=rr(-4,4),tj=rr(-4,4),c=[cr*vv+n1+tj,cg*vv+n1,cb*vv+n1-tj],Lc=Math.max(0,(0.3*c[0]+0.59*c[1]+0.11*c[2])/255);
return{p:p,R:Rd*rr(0.78,1.14),c:c,hb:sky?Math.round(124+lv*2+10*Lc+rr(-3,3)):Math.round(112+lv*4+30*Math.pow(Lc,1.3)+rr(-4,4)),v:v};}
function bgPass(){if(!BG.length)return;var TB=mk(),tb=TB.getContext('2d');tb.lineCap='round';tb.lineJoin='round';BG.forEach(function(st){dS(st,tb,null);});if(bgMask)bgMask(tb);O.drawImage(TB,0,0);}
function chunk(){O.lineCap='round';O.lineJoin='round';Hc.lineCap='round';Hc.lineJoin='round';var t0=performance.now();while(si<ST.length&&performance.now()-t0<20)dS(ST[si++]);if(!RM)V.drawImage(OC,0,0);if(si<ST.length)setTimeout(chunk,0);else if(li==99)setTimeout(TT,0);else setTimeout(layer,0);}
function frame(c){var f=13;c.fillStyle='#1e140c';c.fillRect(0,0,W,f);c.fillRect(0,H-f,W,f);c.fillRect(0,0,f,H);c.fillRect(W-f,0,f,H);c.fillStyle='#3a2716';c.fillRect(0,0,W,4);c.fillRect(0,0,4,H);c.strokeStyle='#a8864a';c.lineWidth=3;c.strokeRect(f+1.5,f+1.5,W-2*f-3,H-2*f-3);c.strokeStyle='rgba(255,226,160,0.45)';c.lineWidth=1;c.strokeRect(f+0.5,f+0.5,W-2*f-1,H-2*f-1);}
function fin(){glaze();var img=O.getImageData(0,0,W,H),d=img.data,hd=Hc.getImageData(0,0,W,H).data,h=new Float32Array(N),tp=new Float32Array(N),x,y,j;
for(y=0;y<H;y++)for(x=0;x<W;x++){j=y*W+x;h[j]=hd[4*j]+2.4*(Math.sin(x*1.7)+Math.sin(y*1.7+((x>>1)&1)*1.6));}
box(h,tp,1);box(h,tp,1);
var lx=-0.42,ly=-0.58,lz=0.7,lm=Math.hypot(lx,ly,lz);lx/=lm;ly/=lm;lz/=lm;var hx2=lx,hy2=ly,hz2=lz+1,hm=Math.hypot(hx2,hy2,hz2);hx2/=hm;hy2/=hm;hz2/=hm;
var LF=new Uint8ClampedArray(256);for(j=0;j<256;j++)LF[j]=255*Math.pow(j/255,0.95);
for(y=1;y<H-1;y++){var ks=y<HZ?0.013:0.02;for(x=1;x<W-1;x++){j=y*W+x;var o=4*j,kv=VG*Math.max(0,Math.min(1,(127-h[j])/36));if(kv>0){d[o]+=(GC[0]-d[o])*kv;d[o+1]+=(GC[1]-d[o+1])*kv;d[o+2]+=(GC[2]-d[o+2])*kv;}var nx=-(h[j+1]-h[j-1])*ks,ny=-(h[j+W]-h[j-W])*ks,nm=1/Math.sqrt(nx*nx+ny*ny+1),df=(nx*lx+ny*ly+lz)*nm,sh=1+(df-lz)*1.1,spc=(nx*hx2+ny*hy2+hz2)*nm;spc=spc>0?Math.pow(spc,46)*24:0;d[o]=LF[cs(d[o]*sh*1.03+spc)];d[o+1]=LF[cs(d[o+1]*sh*0.99+spc*0.96)];d[o+2]=LF[cs(d[o+2]*sh*0.9+spc*0.85)];}}
O.putImageData(img,0,0);frame(O);V.drawImage(OC,0,0);cv.setAttribute('data-fertig','1');}
if(!RM)V.drawImage(OC,0,0);setTimeout(layer,0);
}

(function warten(n) {
  var wurzel = document.getElementById('titel');
  var T = typeof TITEL !== 'undefined' ? TITEL : window.TITEL;
  if (T && wurzel) {
    try { start(T, wurzel); } catch (e) { wurzel.textContent = 'Der Titelbildschirm hat einen Fehler (' + e.message + '). Schreib „Spiel laden“.'; }
    return;
  }
  if (n < 60) setTimeout(function () { warten(n + 1); }, 50);
})(0);
})();
