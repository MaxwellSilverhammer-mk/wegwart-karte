/*
 * Wegwart-Titel – Titelbildschirm für die geteilte Welt „Hold der Seeprinzen“
 * Version 1.0
 *
 * Aufruf in einem Visualizer-Widget:
 *   <h2 class="sr-only">Titelbildschirm: Hold der Seeprinzen</h2>
 *   <div id="titel">Titelbild lädt … Falls nicht, schreib „Spiel laden“.</div>
 *   <script>var TITEL={fuss:'…', buch:'…', befehle:['Questlog', …], figuren:[{name:'Probefigur', …}]}<\/script>
 *   <script>var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/<konto>/wegwart-karte@<stand>/titel.js';document.head.appendChild(s);<\/script>
 *
 * Ein Ölgemälde malt sich selbst, grob bis fein: eine Bucht der Hold am Abend, ein Schiff vor der
 * Sonne, Weg und Steg im Vordergrund, zuletzt die Goldlettern „Hold der Seeprinzen“. Darunter das
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
+'#titel .ts-slot{display:block;box-sizing:border-box;width:100%;max-width:440px;text-align:left;background:#eadcb8;color:#2b1d10;border:1px solid #8a6a3a;border-radius:6px;padding:11px 14px 12px;margin:0 0 10px}'
+'#titel button.ts-slot:hover{background:#f2e6c6}'
+'#titel .ts-slot span{display:block}'
+'#titel .ts-datum{font-size:14px;color:#5b4428;display:flex!important;align-items:center;gap:7px}'
+'#titel .ts-mond{width:18px;height:18px;flex:none}'
+'#titel .ts-name{font-family:"IM Fell English SC",Georgia,serif;font-size:23px;line-height:1.15;margin:3px 0 1px;color:#2b1d10}'
+'#titel .ts-zeile{font-size:15px;color:#4a3620}'
+'#titel .ts-ort{font-size:15px;color:#4a3620;font-style:italic;margin-bottom:6px}'
+'#titel .ts-balken{font-size:13px;color:#5b4428;margin-top:5px}'
+'#titel .ts-spur{height:5px;background:#cdb88d;border-radius:3px;margin-top:3px;overflow:hidden}'
+'#titel .ts-spur i{display:block;height:100%;background:#8c5a1a}'
+'#titel .ts-sfuss{display:flex!important;justify-content:space-between;align-items:baseline;gap:8px;font-size:14px;color:#5b4428;margin-top:9px;border-top:1px solid rgba(138,106,58,.35);padding-top:7px}'
+'#titel .ts-laden{font-family:"IM Fell English SC",Georgia,serif;font-size:17px;color:#7a4410;white-space:nowrap}'
+'#titel .ts-leer{background:none;border:1px dashed rgba(168,134,74,.55);color:#a8946c}'
+'#titel .ts-leer .ts-name{color:#b8a27a;font-size:19px}'
+'#titel .ts-leer .ts-zeile{color:#8f7d5c;font-style:italic}'
+'#titel .ts-zurueck{font-family:"IM Fell English SC",Georgia,serif;font-size:18px;color:#d9b866;padding:8px 14px;min-height:44px;border-radius:6px}'
+'#titel .ts-sicht{animation:tsauf .35s ease-out}@keyframes tsauf{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'
+'#titel .ts-hinweis{font-size:14px;font-style:italic;color:#c4ad80;text-align:center;padding:10px 6px 2px}'
+'@media (prefers-reduced-motion:reduce){#titel .ts-sicht{animation:none}}'
/* Die Chat-Ansicht der Android-App (helles Design) zwingt Knöpfen ihre eigene Schriftfarbe auf.
   Darum stehen die Farben aller Knöpfe und ihres Inhalts hier noch einmal mit !important, auch als Textfüllfarbe. */
+'#titel button,#titel button *{-webkit-text-fill-color:currentColor!important}'
+'#titel .ts-haupt{color:#ecc66c!important}'
+'#titel .ts-cmd,#titel .ts-zurueck{color:#d9b866!important}'
+'#titel .ts-klein{color:#b8a27a!important}'
+'#titel .ts-haupt:hover,#titel .ts-cmd:hover,#titel .ts-klein:hover,#titel .ts-zurueck:hover{color:#fff0c4!important}'
+'#titel button.ts-slot{color:#2b1d10!important}'
+'#titel .ts-slot .ts-name{color:#2b1d10!important}'
+'#titel .ts-slot .ts-zeile,#titel .ts-slot .ts-ort{color:#4a3620!important}'
+'#titel .ts-slot .ts-datum,#titel .ts-slot .ts-balken,#titel .ts-slot .ts-sfuss{color:#5b4428!important}'
+'#titel .ts-slot .ts-laden{color:#7a4410!important}'
+'#titel button.ts-leer{color:#a8946c!important}'
+'#titel .ts-leer .ts-name{color:#b8a27a!important}'
+'#titel .ts-leer .ts-zeile{color:#8f7d5c!important}';
root.appendChild(css);
var cv=document.createElement('canvas');cv.width=1040;cv.height=780;cv.className='ts-bild';cv.setAttribute('role','img');
cv.setAttribute('aria-label','Ölgemälde: Abend über einer Bucht der Hold. Ein Schiff liegt vor Anker vor der untergehenden Sonne, links führt ein Weg an einem toten Baum und einem Wegweiser vorbei zu einem Steg, am fernen Ufer eine Stadt mit Leuchtturm. Darüber in goldenen Lettern: Hold der Seeprinzen.');
root.appendChild(cv);
var pn=document.createElement('div');pn.className='ts-panel';root.appendChild(pn);
var inn=document.createElement('div');inn.className='ts-innen';pn.appendChild(inn);
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e;}
var hin=document.createElement('div');hin.className='ts-hinweis';hin.hidden=true;pn.appendChild(hin);
function send(t){if(typeof sendPrompt==='function'){sendPrompt(t);return true;}hin.textContent='Im Spiel schickt dieser Knopf „'+t+'“ in den Chat.';hin.hidden=false;return false;}
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
function mondName(a){return a==0?'Dunkelmond':a<7?'zunehmende Sichel':a==7?'erstes Viertel':a<14?'zunehmender Mond':a==14?'Vollmond':a<21?'abnehmender Mond':a==21?'letztes Viertel':'abnehmende Sichel';}
function mond(wt){var c=document.createElement('canvas');c.width=36;c.height=36;c.className='ts-mond';var a=((wt-25)%28+28)%28,f=a/28;c.setAttribute('role','img');c.setAttribute('aria-label','Luna: '+mondName(a));
var x=c.getContext('2d'),r=15,k=Math.cos(2*Math.PI*f),zu=f<0.5,si=k>0;x.fillStyle='#5b4428';x.beginPath();x.arc(18,18,r,0,6.3);x.fill();
if(a!=0){x.fillStyle='#fbf1d0';x.beginPath();x.arc(18,18,r-1,-Math.PI/2,Math.PI/2,!zu);x.ellipse(18,18,(r-1)*Math.abs(k),r-1,0,Math.PI/2,-Math.PI/2,zu===si);x.fill();}
x.strokeStyle='#5b4428';x.lineWidth=1.5;x.beginPath();x.arc(18,18,r,0,6.3);x.stroke();return c;}
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
var S=20261025,i;
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
var HZ=486,SX=772,WLY=513;
var LAY=[[15,2,10,0,0.96,3,52],[7,2,12,34,0.97,3,60],[3.4,1,10,32,0.98,2,68],[1.8,1,8,24,0.98,0,76]];
var MK=[[488,320,740,530,0.6],[0,592,480,780,1],[320,560,480,720,0.75],[740,690,1040,780,1],[140,HZ-100,320,HZ+4,0.8],[560,HZ-14,1000,HZ+44,0.85]];
var VG=0.2,GC=[34,22,16];
var SS=1.12,SCX=615,SCY=513;
function tp(p){return[SCX+(p[0]-SCX)*SS,SCY+(p[1]-SCY)*SS];}
function tl(P){return P.map(tp);}
var SHIP=tl([[514,486],[520,491],[527,501],[533,509],[540,513],[600,515],[660,515],[690,513],[699,507],[705,497],[709,486],[712,474],[713,462],[709,457],[686,456.5],[664,457.5],[662,467],[652,483],[640,485],[600,487.5],[570,486],[564,481],[561,475],[548,473.5],[532,474],[524,478]]);
var STERN=tl([[652,483],[662,467],[664,457.5],[686,456.5],[709,457],[713,462],[712,474],[709,486],[705,497],[699,507],[690,513],[660,515]]);
var MASTS=[[566,488,392],[616,489,356],[672,458,402]].map(function(m){var a=tp([m[0],m[1]]),b=tp([m[0],m[2]]);return[a[0],a[1],b[1]];});
var YARDS=[[540,592,436,6],[550,582,410,4.4],[580,652,424,6.6],[592,640,390,4.8]].map(function(y){var a=tp([y[0],y[2]]),b=tp([y[1],y[2]]);return[a[0],b[0],a[1],y[3]*SS];});
var LATEEN=tl([[648,450],[698,400]]);
var BOW=tl([[516,483],[474,466]]);
var PENN=tl([[616,355],[602,352],[586,355],[570,351],[556,353]]);
var LANT=tp([714.5,455]);
var RIG=[[[566,394],[475,467]],[[616,358],[528,482]],[[672,404],[618,410]],[[616,358],[709,457]],[[566,398],[552,486]],[[566,398],[580,486]],[[616,364],[598,487]],[[616,364],[634,485]],[[672,406],[660,459]],[[672,406],[688,457]],[[672,404],[711,458]]].map(tl);
var RIMS=[[[713,463],[712,474],[709,486],[705,497]],[[665,457.5],[686,456.5],[709,457]],[[570,486],[600,487.5],[648,484.5]],[[526,476],[548,473.5],[560,475]],[[653,483],[662,467],[664,459]]].map(tl);
var TOWN=[[146,6,14,'g'],[158,10,12,'g'],[169,7,16,'f'],[184,13,10,'g'],[193,8,14,'g'],[206,22,8,'t'],[214,10,14,'g'],[227,7,12,'f'],[238,12,13,'g'],[250,8,16,'g'],[265,6,12,'f'],[276,9,10,'g']];
var LIGHTS=[[150,HZ-6],[188,HZ-12],[218,HZ-8],[243,HZ-11],[257,HZ-5]];
var MB=[[690,790],[750,746],[850,728],[970,720],[1060,716],[1060,790]];
var FOC=900,EYE=6;
function P3(X,Y,Z){return[520+FOC*X/Z,HZ+FOC*(EYE-Y)/Z];}
var BANK=[[-34,0.7,54],[-22,0.8,44],[-13,1.0,35],[-8,1.15,29.5],[-5.6,1.3,26.6],[-3.4,1.35,24.6],[-2.9,1.45,21],[-2.4,1.8,16],[-2.0,2.3,12],[-1.8,2.6,9.6],[-1.7,2.8,8]];
var BTOP=BANK.map(function(p){return P3(p[0],p[1],p[2]);});
var BFOOT=BANK.slice(5).map(function(p){return P3(p[0]+0.5,0,p[2]);});
var LAND=BTOP.concat([[BTOP[BTOP.length-1][0],830],[-40,830],[-40,BTOP[0][1]]]);
var BFACE=BTOP.slice(5).concat(BFOOT.slice().reverse());
var RB=[[-5.6,2.95,8.6],[-8.6,2.4,14.5],[-7.8,1.75,21.5],[-4.2,1.3,26]];
var RCN=[],ROAD=(function(){function bz(t,k){var u=1-t;return u*u*u*RB[0][k]+3*u*u*t*RB[1][k]+3*u*t*t*RB[2][k]+t*t*t*RB[3][k];}var L=[],Rr=[];for(var q=0;q<=48;q++){var t=q/48,X=bz(t,0),Y=bz(t,1),Z=bz(t,2),t2=Math.min(1,t+0.01),t1=Math.max(0,t-0.01),dX=bz(t2,0)-bz(t1,0),dZ=bz(t2,2)-bz(t1,2),m=Math.hypot(dX,dZ)||1,nx=dZ/m,nz=-dX/m;RCN.push([X,Y,Z,nx,nz]);L.push(P3(X-nx,Y,Z-nz));Rr.push(P3(X+nx,Y,Z+nz));}return L.concat(Rr.reverse());})();
function rpt(q,o,dy){var c=RCN[q];return P3(c[0]+c[3]*o,c[1]+(dy||0),c[2]+c[4]*o);}
var PL=[-4.2,26],PU=[0.0797,0.9968],PN=[0.9968,-0.0797],PLEN=15,PDY=1.3,PSTS=[0.6,3.6,6.6,9.6,12.6];
function pp(s,o,Y){return P3(PL[0]+PU[0]*s+PN[0]*o,Y,PL[1]+PU[1]*s+PN[1]*o);}
function pz(s,o){return PL[1]+PU[1]*s+PN[1]*o;}
var DECK=[pp(0,-1,PDY),pp(PLEN,-1,PDY),pp(PLEN,1,PDY),pp(0,1,PDY)],SIDE=[pp(0,1,PDY),pp(PLEN,1,PDY),pp(PLEN,1,PDY-0.32),pp(0,1,PDY-0.32)];
function pierRefl(c){c.fillStyle='#120d0b';PSTS.concat([PLEN-0.15]).forEach(function(s){var a=pp(s,0.95,0),b=pp(s,0.95,-1.05),w=FOC*0.24/pz(s,0.95);c.fillRect(a[0]-w/2,a[1],w,b[1]-a[1]);});poly(c,[pp(0,1,-1.0),pp(PLEN,1,-1.0),pp(PLEN,1,-1.32),pp(0,1,-1.32)]);c.fill();}
var SGQ=(function(){var best=0,d=99;for(var q=0;q<RCN.length;q++){var e=Math.abs(RCN[q][2]-19);if(e<d){d=e;best=q;}}return best;})();
var SGB=(function(){var c=RCN[SGQ];return[c[0]+c[3]*2.4,c[1],c[2]+c[4]*2.4];})();
var T1=mkTree(84,602,262,17,0.03,5);
function shipBody(c,col){poly(c,SHIP);c.fillStyle=col;c.fill();}
function shipSpars(c,col){c.strokeStyle=col;c.lineCap='round';MASTS.forEach(function(m){c.lineWidth=3.4;c.beginPath();c.moveTo(m[0],m[1]);c.lineTo(m[0],m[2]);c.stroke();});YARDS.forEach(function(y){c.lineWidth=y[3];c.beginPath();c.moveTo(y[0],y[2]);c.lineTo(y[1],y[2]);c.stroke();});c.lineWidth=3.8;c.beginPath();c.moveTo(LATEEN[0][0],LATEEN[0][1]);c.lineTo(LATEEN[1][0],LATEEN[1][1]);c.stroke();c.lineWidth=2.8;c.beginPath();c.moveTo(BOW[0][0],BOW[0][1]);c.lineTo(BOW[1][0],BOW[1][1]);c.stroke();}
function town(c,wall,roof,lit){TOWN.forEach(function(h){var x=h[0],w=h[2],top=HZ-2-h[1];c.fillStyle=wall;c.fillRect(x,top,w,h[1]+3);c.fillStyle=roof;if(h[3]=='g'){c.beginPath();c.moveTo(x-1,top);c.lineTo(x+w/2,top-w*0.5);c.lineTo(x+w+1,top);c.closePath();c.fill();}else if(h[3]=='t'){c.beginPath();c.moveTo(x-1,top);c.lineTo(x+w/2,top-20);c.lineTo(x+w+1,top);c.closePath();c.fill();}else{c.beginPath();c.moveTo(x-1,top);c.lineTo(x+w+1,top-3);c.lineTo(x+w+1,top+1);c.closePath();c.fill();}});
c.fillStyle=wall;c.fillRect(296,HZ-74,9,74);c.fillStyle=roof;c.beginPath();c.moveTo(294,HZ-74);c.lineTo(300.5,HZ-88);c.lineTo(307,HZ-74);c.closePath();c.fill();
if(lit){c.fillStyle='#ffd890';c.fillRect(298,HZ-71,5,5);LIGHTS.forEach(function(l){c.fillStyle='#e8ac60';c.fillRect(l[0],l[1],2.6,2.6);});}}
function scene(){var y,g;
D.fillStyle=dcol(0,95);D.fillRect(0,0,W,HZ);D.fillStyle=dcol(0,205);D.fillRect(0,HZ,W,H-HZ);
R.fillStyle=LG(R,0,0,0,HZ,[0,'#0b1127',0.2,'#111935',0.4,'#1d2547',0.58,'#363a5e',0.74,'#6a4c68',0.88,'#b8705f',0.96,'#e39c6b',1,'#f2bd86']);R.fillRect(0,0,W,HZ+2);
R.save();R.translate(520,186);R.scale(1,0.34);g=R.createRadialGradient(0,0,0,0,0,480);g.addColorStop(0,'rgba(6,8,22,0.34)');g.addColorStop(0.7,'rgba(6,8,22,0.16)');g.addColorStop(1,'rgba(6,8,22,0)');R.fillStyle=g;R.fillRect(-480,-480,960,960);R.restore();
eg(R,SX,HZ,3.4,240,'255,186,124',0.55);eg(R,SX,HZ-4,3.8,74,'255,224,168',0.72);
cloud(R,560,1080,328,9,'#19203e','#262b4a','#43395a',0.5,8);
cloud(R,-40,560,372,14,'#2b2d52','#45405f','#9c6a78',0.55,9);
cloud(R,470,1080,408,12,'#463858','#8a5a66','#e09070',0.7,8);
cloud(R,-40,640,438,9,'#583f56','#a06a68','#e8a070',0.55,8);
cloud(R,560,1060,458,6,'#e8a070','#ffcc90','#ffdba4',0.45,7);
R.fillStyle='#ffe9b8';R.beginPath();R.ellipse(SX,HZ+1,26,14,0,Math.PI,2*Math.PI);R.fill();
fl(R,[[-20,HZ+2],[-20,HZ-62],[70,HZ-78],[150,HZ-66],[232,HZ-84],[300,HZ-60],[380,HZ-42],[450,HZ-26],[520,HZ-13],[580,HZ-4],[620,HZ+2]],'#4b3b5b');
fl(R,[[-20,HZ+2],[-20,HZ-32],[90,HZ-38],[200,HZ-28],[320,HZ-17],[420,HZ-8],[480,HZ+2]],'#33283f');
R.fillStyle=LG(R,0,HZ-70,0,HZ+2,[0,'rgba(200,160,170,0)',1,'rgba(214,166,156,0.3)']);R.fillRect(0,HZ-70,W,72);
F.save();F.translate(0,2*HZ);F.scale(1,-1);F.drawImage(REF,0,0,W,HZ,0,0,W,HZ);F.restore();
var TC=mk(),tc=TC.getContext('2d');town(tc,'#2a2135','#221a2c',1);R.drawImage(TC,0,0);
F.save();F.globalAlpha=0.38;F.translate(0,2*HZ);F.scale(1,-1);F.drawImage(TC,0,0);F.restore();
D.fillStyle='rgb(255,128,0)';D.fillRect(140,HZ-100,170,100);
F.save();F.beginPath();F.rect(0,WLY,W,H-WLY);F.clip();F.translate(0,2*WLY);F.scale(1,-1);shipBody(F,'#16100e');shipSpars(F,'#1a1311');F.restore();
pierRefl(F);
for(y=HZ;y<H;y+=2){var u=(y-HZ)/(H-HZ),amp=0.6+u*u*7+rnd()*u*3,off=Math.sin(y*0.37+Math.sin(y*0.09)*3)*amp+rr(-0.5,0.5)*u*4,sy=Math.min(H-2,Math.max(HZ,y+Math.floor(rr(-1,2)*u*3)));R.globalAlpha=0.92-u*0.25;R.drawImage(RFL,0,sy,W,2,off,y,W,2);}R.globalAlpha=1;
R.fillStyle=LG(R,0,HZ,0,H,[0,'rgba(20,18,34,0.1)',0.4,'rgba(14,14,28,0.35)',1,'rgba(8,8,16,0.7)']);R.fillRect(0,HZ,W,H-HZ);
eg(R,SX,HZ+110,0.34,190,'255,170,110',0.3,'screen');
shipBody(R,'#1a1311');poly(R,STERN);R.fillStyle='#1e1614';R.fill();
D.fillStyle='rgb(255,128,0)';poly(D,SHIP);D.fill();
fl(R,MB,'#141210');D.beginPath();sp(D,MB,1);D.fillStyle=dcol(0,150);D.fill();
R.fillStyle=LG(R,0,800,0,575,[0,'#14100d',0.65,'#1b1613',1,'#2a2228']);poly(R,LAND);R.fill();D.fillStyle=dcol(0,140);poly(D,LAND);D.fill();
R.fillStyle=LG(R,0,660,0,790,[0,'#2c2018',1,'#1c1511']);poly(R,BFACE);R.fill();D.fillStyle='rgb(255,128,0)';poly(D,BFACE);D.fill();
R.fillStyle=LG(R,0,790,0,640,[0,'#2a221c',0.55,'#352c26',1,'#4a4044']);poly(R,ROAD);R.fill();D.fillStyle='rgb(255,128,0)';poly(D,ROAD);D.fill();
R.fillStyle='#463e48';poly(R,DECK);R.fill();var pa=Math.atan2(DECK[3][1]-DECK[0][1],DECK[3][0]-DECK[0][0]);D.fillStyle=dcol(pa,190);poly(D,DECK);D.fill();
R.fillStyle='#241b17';poly(R,SIDE);R.fill();var sa=Math.atan2(SIDE[1][1]-SIDE[0][1],SIDE[1][0]-SIDE[0][0]);D.fillStyle=dcol(sa,170);poly(D,SIDE);D.fill();
dirTree(T1);
for(i=0;i<60;i++){var rx=rr(760,1034),rh=rr(40,140),ry=rr(724,778);D.beginPath();D.moveTo(rx,ry);D.lineTo(rx+rr(-8,8),ry-rh);D.lineWidth=6;D.strokeStyle=dcol(Math.PI/2,220);D.stroke();}
R.fillStyle=RG(R,W*0.55,H*0.42,W*0.74,[0,'rgba(0,0,0,0)',0.62,'rgba(0,0,0,0.08)',1,'rgba(0,0,0,0.4)']);R.fillRect(0,0,W,H);}
function seg(P,f0,f1){var n=P.length-1,o=[];for(var q=0;q<=4;q++){var f=(f0+(f1-f0)*q/4)*n,k=Math.min(n-1,Math.floor(f)),g=f-k;o.push([P[k][0]+(P[k+1][0]-P[k][0])*g,P[k][1]+(P[k+1][1]-P[k][1])*g]);}return o;}
function broken(P,w,col,a,hb){var u=rr(0,0.12);while(u<0.95){var e=Math.min(1,u+rr(0.12,0.32));A.push(mkst(seg(P,u,e),w*rr(0.7,1),col,a*rr(0.5,1),hb,0));u=e+rr(0.05,0.2);}}
function touches(){var k,x,y;DM=D.getImageData(0,0,W,H).data;
A.push(mkst(tl([[530,502],[600,503.5],[660,503],[704,499]]),1.8,'#3a2c26',0.8,150,0));
broken(tl([[600,503.5],[660,503],[704,499]]),1.3,'#c07a4c',0.55,166);
RIG.forEach(function(r){A.push(mkst(r,0.9,'#2c2220',0.55,140,0));});
MASTS.forEach(function(m){A.push(mkst([[m[0],m[1]],[m[0],m[2]]],3.4,'#120c0a',1,150,0));broken([[m[0]+1.8,m[1]-6],[m[0]+1.8,m[2]+8]],1.1,'#e8a06a',0.55,168);});
A.push(mkst(BOW,2.8,'#140e0c',1,150,0));
YARDS.forEach(function(y){A.push(mkst([[y[0],y[2]],[y[1],y[2]]],y[3],'#2e2624',0.97,150,1));broken([[y[0]+3,y[2]-y[3]*0.3],[y[1]-2,y[2]-y[3]*0.3]],y[3]*0.3,'#c89878',0.5,164);A.push(mkst([[y[1]-6,y[2]-y[3]*0.1],[y[1]-1,y[2]-y[3]*0.1]],y[3]*0.5,'#f0b07a',0.45,170,0));});
A.push(mkst(LATEEN,4,'#2a221f',0.97,150,1));broken([[LATEEN[0][0]+1.5,LATEEN[0][1]-2],[LATEEN[1][0]+1,LATEEN[1][1]-1.5]],1.2,'#d8a07a',0.5,164);
A.push(mkst(PENN,3.4,'#9c3624',0.95,165,0));A.push(mkst(PENN.slice(0,3),1.1,'#e8845a',0.6,174,0));
RIMS.forEach(function(p){broken(p,1.6,'#f0a868',0.7,172);});
A.push(mkst([[LANT[0],LANT[1]-3],[LANT[0],LANT[1]+3]],5.6,'#ffcf7a',1,188,0));A.push(mkst([[LANT[0],LANT[1]-1],[LANT[0],LANT[1]+1]],2.2,'#fff4d4',1,196,0));
A.push(mkst([[SX-30,HZ-1.5],[SX,HZ-6],[SX+30,HZ-1.5]],5.5,'#fff0c4',0.92,196,0));A.push(mkst([[SX-46,HZ+0.5],[SX+74,HZ+0.5]],1.6,'#ffe2a8',0.55,184,0));
tstr(T1,'#15111a',156,5,{c:'#d08a5e',side:1,a:0.72,w:2.4,u0:0.06,u1:0.95});
var LP=new Path2D();LP.moveTo(LAND[0][0],LAND[0][1]);for(k=1;k<LAND.length;k++)LP.lineTo(LAND[k][0],LAND[k][1]);LP.closePath();var RP=new Path2D();RP.moveTo(ROAD[0][0],ROAD[0][1]);for(k=1;k<ROAD.length;k++)RP.lineTo(ROAD[k][0],ROAD[k][1]);RP.closePath();
broken(BTOP.slice(0,6),2,'#5e5262',0.5,160);broken(BFOOT,1.3,'#a898a8',0.45,164);
for(k=0;k<11;k++){var bq=rr(0,BFOOT.length-1.01),bi=Math.floor(bq),bt=bq-bi,bv=rr(0.15,0.9),ta=BTOP[5+bi],tb=BTOP[6+bi],fa=BFOOT[bi],fb=BFOOT[bi+1],tx2=ta[0]+(tb[0]-ta[0])*bt,ty2=ta[1]+(tb[1]-ta[1])*bt,fx2=fa[0]+(fb[0]-fa[0])*bt,fy2=fa[1]+(fb[1]-fa[1])*bt,sx3=tx2+(fx2-tx2)*bv,sy3=ty2+(fy2-ty2)*bv,sr=rr(2,4.5);A.push(mkst([[sx3-sr,sy3],[sx3+sr,sy3+rr(-1,1)]],sr*1.2,rnd()<0.5?'#2e261f':'#26201a',0.85,152,1));A.push(mkst([[sx3-sr*0.5,sy3-sr*0.45],[sx3+sr*0.6,sy3-sr*0.5]],0.9,'#9a6a46',0.3,164,0));}
for(k=0;k<BTOP.length-6;k++){for(var j=0;j<7;j++){var bt2=rr(0,1),ga=BTOP[5+k],gb2=BTOP[6+k],gx3=ga[0]+(gb2[0]-ga[0])*bt2,gy3=ga[1]+(gb2[1]-ga[1])*bt2,hh3=rr(5,13)*(gy3>720?1.5:1);A.push(mkst([[gx3-2,gy3+1],[gx3+hh3*0.25,gy3-hh3*0.5],[gx3+hh3*0.55,gy3-hh3*0.8]],1.2,rnd()<0.5?'#2a281c':'#363222',0.9,150,0));if(rnd()<0.4)A.push(mkst([[gx3+hh3*0.3,gy3-hh3*0.55],[gx3+hh3*0.55,gy3-hh3*0.8]],0.9,'#d0905e',0.5,166,0));}}
for(k=0;k<140;k++){x=rr(-10,420);y=rr(592,780);if(!R.isPointInPath(LP,x,y)||R.isPointInPath(RP,x,y))continue;var nearR=R.isPointInPath(RP,x,y-14)||R.isPointInPath(RP,x,y+14)||R.isPointInPath(RP,x-16,y)||R.isPointInPath(RP,x+16,y);if(!nearR&&rnd()<0.55)continue;var zg=FOC*4/Math.max(30,y-HZ),th2=FOC*rr(0.08,0.32)/zg,nb2=Math.floor(rr(2,7));for(var j=0;j<nb2;j++){var bx2=x+rr(-1,1)*th2*0.6,lean2=rr(-0.35,0.35);A.push(mkst([[bx2,y+1],[bx2+lean2*th2*0.5,y-th2*0.5],[bx2+lean2*th2,y-th2]],Math.max(0.9,FOC*0.012/zg),rnd()<0.5?'#2a281c':'#363222',0.9,150,0));if(rnd()<0.18)A.push(mkst([[bx2+lean2*th2*0.6+0.6,y-th2*0.6],[bx2+lean2*th2+0.6,y-th2]],0.9,'#c88a62',0.4,166,0));}if(nearR&&rnd()<0.14){var sr2=FOC*rr(0.05,0.11)/zg;A.push(mkst([[x-sr2,y+2],[x+sr2,y+2]],sr2*1.1,'#24201c',0.9,152,1));A.push(mkst([[x-sr2*0.5,y+2-sr2*0.45],[x+sr2*0.4,y+2-sr2*0.5]],0.9,'#5a5050',0.35,162,0));}}
for(k=0;k<26;k++){x=rr(0,330);y=BTOP.length?0:0;var bq2=rr(0,4.99),bj=Math.floor(bq2),bu=bq2-bj,pa2=BTOP[bj],pb2=BTOP[bj+1],gx=pa2[0]+(pb2[0]-pa2[0])*bu,gyy=pa2[1]+(pb2[1]-pa2[1])*bu;A.push(mkst([[gx,gyy+2],[gx+rr(-2,2),gyy-rr(4,10)]],rr(1,1.6),rnd()<0.5?'#2e2a22':'#3c3428',0.9,150,0));if(rnd()<0.45)A.push(mkst([[gx+0.8,gyy-2],[gx+rr(-2,2),gyy-rr(5,9)]],0.9,'#c88a62',0.5,168,0));}
[-0.42,0.42].forEach(function(o){var q=2;while(q<RCN.length-3){var e=Math.min(RCN.length-2,q+Math.floor(rr(3,7))),pts=[];for(var j=q;j<=e;j++)pts.push(rpt(j,o));var zm=RCN[Math.floor((q+e)/2)][2];A.push(mkst(pts,Math.max(0.9,FOC*0.11/zm),'#1c1714',0.55,146,0));q=e+Math.floor(rr(1,3));}});
[[16,-0.42,0.8],[33,0.42,0.6]].forEach(function(pd){var c=RCN[pd[0]],tx3=c[4]*-1,tz3=c[3],o=pd[1],L2=pd[2],a1=P3(c[0]+c[3]*o-c[4]*0*1+(-c[4])*0,c[1],c[2]),p1=P3(c[0]+c[3]*o+c[4]*L2*0,c[1],c[2]);var q0=P3(c[0]+c[3]*o+c[4]*-L2,c[1],c[2]-c[3]*-L2),q1=P3(c[0]+c[3]*o-c[4]*-L2,c[1],c[2]+c[3]*-L2);var dX=-c[4],dZ=c[3];q0=P3(c[0]+c[3]*o-dX*L2,c[1],c[2]+c[4]*o-dZ*L2);q1=P3(c[0]+c[3]*o+dX*L2,c[1],c[2]+c[4]*o+dZ*L2);var col=c[2]<17?'#262a40':'#3c3450',w2=FOC*0.22/c[2];A.push(mkst([q0,[(q0[0]+q1[0])/2,(q0[1]+q1[1])/2],q1],w2,col,0.72,138,0));A.push(mkst([[q0[0]+w2*0.2,q0[1]-w2*0.3],[q1[0]-w2*0.2,q1[1]-w2*0.3]],Math.max(0.8,w2*0.14),c[2]<17?'#4a4e6a':'#8a6a78',0.35,148,0));});
A.push(mkst([pp(0,-1.05,PDY+0.02),pp(0,1.05,PDY+0.02)],Math.max(1.5,FOC*0.12/26),'#1a1310',0.95,150,0));
for(k=2;k<RCN.length-2;k+=3){if(rnd()<0.6){var zq=RCN[k][2],p0=rpt(k,rr(-0.25,0.25)),pl=FOC*rr(0.2,0.5)/zq;A.push(mkst([[p0[0]-pl,p0[1]],[p0[0]+pl,p0[1]+rr(-0.4,0.4)]],Math.max(0.9,FOC*0.06/zq),k>RCN.length*0.55?'#5a5058':'#3c322a',0.4,152,1));}}
[-1,1].forEach(function(sd){for(var j=1;j<RCN.length-1;j++){if(rnd()<0.55)continue;var zt=RCN[j][2],p=rpt(j,sd*rr(0.95,1.15)),hh=FOC*rr(0.15,0.35)/zt;A.push(mkst([[p[0],p[1]+1],[p[0]+rr(-0.3,0.3)*hh,p[1]-hh]],Math.max(1,FOC*0.03/zt),rnd()<0.5?'#2e2a20':'#3a3424',0.85,150,0));if(sd>0&&rnd()<0.35)A.push(mkst([[p[0]+0.6,p[1]-1],[p[0]+rr(-0.2,0.3)*hh,p[1]-hh*0.9]],0.9,'#c88a62',0.45,166,0));}});
broken(RCN.slice(Math.floor(RCN.length*0.45)).map(function(c,j){return rpt(Math.floor(RCN.length*0.45)+j,0.98);}),1.4,'#b88a68',0.45,164);
var gb=P3(SGB[0],SGB[1],SGB[2]),gt=P3(SGB[0],SGB[1]+2.1,SGB[2]),gw=FOC*0.13/SGB[2];
var pw={p:[gb,gt],R:gw/2,c:hx('#1c1510'),al:1,hb:150,K:0,op:1,ws:[1,1]};prepB(pw);A.push(pw);
A.push(mkst([[gt[0],gt[1]+1],[gt[0],gt[1]-gw*1.2]],gw*0.7,'#1c1510',1,150,0));
[[1.88,0.86,0.5,0.9],[1.6,-0.82,0.56,0.8]].forEach(function(r){var a0=P3(SGB[0],SGB[1]+r[0],SGB[2]),a1=P3(SGB[0]+r[1]*r[3],SGB[1]+r[0],SGB[2]+r[2]*r[3]),bw=FOC*0.17/SGB[2];A.push(mkst([a0,[(a0[0]+a1[0])/2,(a0[1]+a1[1])/2],a1],bw,'#2a2018',1,152,1));A.push(mkst([[a0[0]+(r[1]>0?2:-2),a0[1]-bw*0.42],[a1[0]-(r[1]>0?3:-3),a1[1]-bw*0.42]],1.2,r[1]>0?'#e0a06a':'#a87a58',r[1]>0?0.62:0.42,168,0));});
broken([[gb[0]+gw*0.4,gb[1]-2],[gt[0]+gw*0.4,gt[1]+2]],1.1,'#d8945e',0.55,168);
for(k=0;k<9;k++){var sx2=gb[0]+rr(-gw*2.5,gw*2.5);A.push(mkst([[sx2,gb[1]+1],[sx2+rr(-3,3),gb[1]-rr(5,13)]],1.2,'#2e2a20',0.9,150,0));}
for(k=0;k<120;k++){var r1=rnd();y=HZ+4+(H-70-HZ)*Math.pow(r1,1.6);var dep=(y-HZ)/(H-HZ);x=SX+(rnd()+rnd()+rnd()-1.5)/1.5*(12+dep*150);if(!isW(x,y))continue;if(dep>0.45&&rnd()<0.35)continue;var len=rr(3,8)+dep*rr(5,20),tl2=rr(-0.06,0.06)*len;A.push(mkst([[x-len,y-tl2],[x+rr(-0.3,0.3)*len,y+rr(-0.8,0.8)],[x+len,y+tl2]],rr(1.2,2.2)+dep*rr(0.4,2),rnd()<0.5?'#ffc58a':'#f29c62',rr(0.3,0.78),176,1));}
for(k=0;k<12;k++){y=rr(HZ+6,HZ+70);x=300.5+rr(-2,2);if(!isW(x,y))continue;A.push(mkst([[x-rr(1,4),y],[x+rr(1,4),y]],rr(1,1.8),'#ffd080',rr(0.3,0.6),170,0));}
for(k=0;k<16;k++){y=rr(WLY+4,WLY+64);x=LANT[0]+rr(-2,2);if(!isW(x,y))continue;A.push(mkst([[x-rr(1,5),y],[x+rr(1,5),y]],rr(1,2),'#ffc070',rr(0.3,0.6),172,0));}
for(k=0;k<40;k++){var cy0=rr(HZ+10,H-60),cx0=rr(0,W);if(Math.abs(cx0-SX)<100||!isW(cx0,cy0))continue;A.push(mkst([[cx0,cy0],[cx0+rr(8,26),cy0]],rr(1.1,2),'#8a7ea0',rr(0.16,0.32),164,1));}
for(k=1;k<=32;k++){var sv=k*0.46;if(sv>PLEN-0.2)break;var zq2=pz(sv,0),l0=pp(sv,-0.98,PDY),l1=pp(sv,0.98,PDY);A.push(mkst([l0,l1],Math.max(0.8,FOC*0.035/zq2),'#211a18',0.6,150,0));if(k%3==1){var h0=pp(sv+0.06,-0.3,PDY),h1=pp(sv+0.06,0.95,PDY);A.push(mkst([h0,h1],Math.max(0.7,FOC*0.02/zq2),'#c89070',0.28,166,0));}}
A.push(mkst([pp(0,-1,PDY),pp(PLEN,-1,PDY)],1.4,'#1e1714',0.7,148,0));
broken([pp(0.2,1,PDY),pp(PLEN*0.5,1,PDY),pp(PLEN,1,PDY)],1.5,'#e0a070',0.62,172);
A.push(mkst([pp(PLEN,-1,PDY),pp(PLEN,1,PDY)],1.4,'#f0b07a',0.7,174,0));
A.push(mkst([pp(0.2,1,PDY-0.32),pp(PLEN,1,PDY-0.32)],1,'#140e0c',0.7,146,0));
PSTS.forEach(function(sv){var zq3=pz(sv,0.95),t0=pp(sv,0.95,PDY-0.3),b0=pp(sv,0.95,0),w=FOC*0.24/zq3,st={p:[t0,b0],R:w/2,c:hx('#1a1310'),al:1,hb:150,K:0,op:1,ws:[1,1]};prepB(st);A.push(st);A.push(mkst([[t0[0]+w*0.36,t0[1]+1],[b0[0]+w*0.36,b0[1]-(b0[1]-t0[1])*0.25]],Math.max(0.8,w*0.22),'#d8945e',0.5,166,0));var rl=FOC*0.42/zq3;A.push(mkst([[b0[0]-rl,b0[1]+0.5],[b0[0]+rl,b0[1]+0.5]],1.2,'#b8a6b8',0.45,164,0));A.push(mkst([[b0[0]-rl*0.6,b0[1]+FOC*0.08/zq3],[b0[0]+rl*0.7,b0[1]+FOC*0.08/zq3]],1,'#8a7ea0',0.35,160,0));});
[[0.12,-1.08,1.25,2.05],[0.12,1.08,0,2.05],[PLEN-0.15,0.95,0,1.95]].forEach(function(b){var zb=pz(b[0],b[1]),bt=pp(b[0],b[1],b[3]),bb=pp(b[0],b[1],b[2]),w=FOC*0.26/zb,st={p:[bb,bt],R:w/2,c:hx('#1a1310'),al:1,hb:152,K:0,op:1,ws:[1,1]};prepB(st);A.push(st);A.push(mkst([[bt[0]+w*0.36,bt[1]+1],[bb[0]+w*0.36,bb[1]-2]],Math.max(0.8,w*0.22),'#e0a070',0.55,168,0));A.push(mkst([[bt[0]-w*0.4,bt[1]],[bt[0]+w*0.45,bt[1]]],Math.max(1,w*0.3),'#c89070',0.45,170,0));});for(k=0;k<60;k++){var bx=rr(760,1036),by=rr(726,778),hh=rr(40,140),lean=rr(-0.2,0.25),tx=bx+lean*hh;A.push(mkst([[bx,by],[bx+lean*hh*0.4,by-hh*0.55],[tx,by-hh]],rr(1.6,3),rnd()<0.5?'#22241a':'#2e2c20',0.95,150,0));if(rnd()<0.6)A.push(mkst([[bx+lean*hh*0.5,by-hh*0.6],[tx,by-hh]],1,'#e0956a',0.55,170,0));}
}
function glaze(){O.fillStyle=LG(O,0,HZ-60,0,HZ+30,[0,'rgba(196,170,186,0)',0.65,'rgba(214,180,186,0.14)',1,'rgba(196,170,186,0)']);O.fillRect(0,HZ-60,W,90);
glow(O,SX,HZ-5,70,'255,212,150',0.16,'screen');glow(O,LANT[0],LANT[1],14,'255,196,120',0.34,'screen');glow(O,300.5,HZ-69,11,'255,214,140',0.3,'screen');
LIGHTS.forEach(function(l){glow(O,l[0]+1.3,l[1]+1.3,5,'255,190,110',0.22,'screen');});}
var TXT=[{"it":0,"role":"regel","glyphs":[{"d":"M165.5 104.5L321.5 102.4L321.5 106.6ZM328.5 104.5L335.5 97.5L342.5 104.5L335.5 111.5Z","b":[165.5,97.5,342.5,111.5]},{"d":"M876.4 104.5L720.4 102.4L720.4 106.6ZM699.4 104.5L706.4 97.5L713.4 104.5L706.4 111.5Z","b":[699.4,97.5,876.4,111.5]}]},{"it":1,"role":"ober","glyphs":[{"d":"M356 126Q356 126 356 125Q356 125 356 125Q356 125 357 125Q357 125 358 125Q359 125 359 125Q360 125 360 125Q361 125 361 124Q361 124 362 123L383 69Q383 69 383 68Q384 68 384 68Q384 67 383 67Q382 67 382 67Q381 67 381 67Q380 67 379 67Q378 67 377 67Q377 67 376 67Q376 67 376 67Q376 66 376 66Q376 66 376 66Q376 66 376 65Q377 65 377 65Q377 65 378 65Q378 65 378 65Q379 65 379 65Q381 65 383 65Q384 66 386 66Q389 66 393 65Q396 65 400 65Q400 65 400 65Q400 65 400 65Q400 65 400 65Q400 65 400 66Q400 66 400 66Q400 66 399 66Q399 66 398 66Q397 67 397 67Q396 67 396 67Q396 67 395 67Q395 67 394 67Q394 67 393 67Q393 67 392 67Q392 67 392 67Q392 68 391 69L383 91Q383 91 382 91Q382 92 382 92Q382 93 383 93Q383 93 383 93H408Q409 93 409 93Q410 93 410 92L419 69Q419 68 419 68Q419 67 419 67Q419 67 418 67Q418 67 418 67Q417 66 417 66Q416 66 415 67Q414 67 414 67Q414 67 413 67Q413 67 413 67Q412 67 412 66Q412 65 413 65Q413 65 413 65Q414 65 414 65Q417 65 419 65Q421 65 423 65Q424 65 426 65Q427 65 428 65Q430 65 431 65Q432 65 433 65Q434 65 434 65Q435 65 435 65Q435 65 435 65Q436 65 436 65Q436 66 435 66Q435 67 434 67Q434 67 433 67Q433 67 432 67Q431 67 431 67Q430 66 430 66Q429 66 429 67Q428 68 427 69L408 119Q407 120 407 121Q406 122 406 122Q406 123 406 123Q406 123 407 123Q407 124 407 124Q408 124 408 124H413Q414 124 414 124Q415 124 415 125Q415 125 414 126Q414 126 414 126H412Q411 126 409 126Q407 125 406 125Q404 125 401 126Q399 126 397 126Q394 126 393 126Q391 126 390 126Q390 126 389 126Q389 126 389 125Q389 125 389 125Q389 124 389 124Q390 124 390 124Q391 124 392 124Q393 124 394 124Q395 124 397 124Q397 124 398 123Q398 122 399 121L407 98Q408 98 408 98Q408 97 408 97Q408 97 408 96Q407 96 407 96H383Q382 96 382 96Q381 96 381 96Q380 96 380 96Q380 97 379 98L371 121Q370 121 370 122Q370 122 370 123Q370 123 370 124Q370 124 371 124Q371 124 372 124Q372 124 372 124Q373 124 373 124Q373 124 374 124Q375 124 375 124Q376 124 377 124Q377 124 378 124Q378 124 379 124Q379 124 379 125Q379 125 378 126Q378 126 377 126H362Q361 126 360 126Q358 127 357 127Q356 127 356 127Q356 126 356 126Z","b":[355.5,64.6,435.8,126.7]},{"d":"M435 119Q435 120 435 121Q435 122 436 122Q436 123 437 124Q438 124 439 124Q440 124 440 124Q441 124 442 123Q443 123 443 122Q444 121 445 120Q447 118 449 115Q451 112 453 108Q454 105 455 102Q456 98 456 95Q456 94 456 93Q456 92 455 91Q455 90 454 89Q453 89 452 89Q450 89 448 91Q445 93 442 97Q440 100 438 104Q437 107 436 111Q435 115 435 119ZM450 86Q453 86 455 87Q457 89 459 91Q460 93 460 96Q461 99 461 101Q461 104 460 107Q459 110 458 113Q457 116 455 118Q453 121 451 123Q449 125 446 126Q443 127 440 127Q438 127 437 126Q435 125 434 124Q433 122 432 120Q431 119 430 117Q430 116 430 115Q430 115 430 114Q430 113 430 112Q430 112 430 111Q430 109 430 106Q431 103 432 100Q434 97 435 95Q437 92 440 90Q442 88 445 87Q447 86 450 86Z","b":[429.7,86.1,460.7,126.7]},{"d":"M467 119Q469 116 470 112Q472 108 474 104Q476 99 478 95Q480 91 481 87Q483 83 485 79Q487 75 488 72Q488 72 489 71Q489 71 489 70Q489 70 489 70Q489 69 488 69Q487 69 487 69Q486 69 486 69Q484 69 483 69Q481 69 480 68Q480 68 480 68Q480 67 480 67Q481 67 481 67Q481 67 482 67Q482 67 482 67Q484 67 487 67Q489 67 491 67Q493 67 494 67Q495 67 495 68Q496 68 496 68Q496 69 496 69Q496 70 496 70Q495 71 495 72Q490 83 484 95Q479 107 474 118Q474 119 474 119Q474 119 474 120Q474 120 474 120Q474 120 475 120Q476 120 476 120Q477 119 478 119Q479 118 480 117Q481 116 482 115Q482 115 483 115Q483 115 483 115Q483 115 483 115Q483 116 483 117Q481 118 479 120Q478 122 476 123Q474 124 472 125Q470 126 469 126Q467 126 467 126Q466 125 466 124Q466 123 466 122Q467 120 467 119Z","b":[465.8,66.7,495.9,126.2]},{"d":"M497 117Q497 119 498 121Q500 122 502 122Q504 122 505 121Q507 120 508 119Q510 118 511 116Q513 115 514 114Q515 113 516 112Q517 110 518 109Q519 108 520 106Q521 105 522 104Q523 102 523 99Q524 97 524 95Q525 95 525 94Q525 93 525 93Q525 92 524 91Q524 88 521 88Q519 88 516 90Q514 91 511 94Q508 96 506 99Q503 102 501 106Q500 109 498 112Q497 115 497 117ZM523 114Q522 115 522 116Q522 117 521 118Q521 119 521 119Q521 120 521 121Q521 121 522 120Q523 120 524 119Q526 118 527 117Q528 116 529 115Q530 115 530 115Q530 115 530 115Q530 115 530 115Q530 115 530 115Q529 116 529 117Q528 117 527 118Q526 119 525 119Q525 120 524 121Q523 121 523 122Q522 122 522 122Q521 123 521 123Q520 123 520 124Q519 124 519 124Q518 125 516 125Q515 125 514 125Q513 125 513 125Q513 124 513 124Q513 124 513 123Q513 122 514 121Q514 120 514 119Q515 119 515 118Q515 117 515 117Q516 116 516 116Q516 115 516 115Q516 114 516 114Q516 114 516 114Q516 114 516 114Q515 115 514 116Q513 117 512 118Q511 119 509 120Q508 121 506 122Q505 123 504 124Q503 124 502 125Q500 126 499 126Q498 126 497 126Q495 126 494 125Q493 125 492 123Q491 122 491 121Q491 120 491 120Q491 115 492 110Q494 106 496 102Q499 97 502 94Q506 91 510 89Q513 88 515 87Q518 87 520 87Q521 87 523 87Q524 87 525 88Q525 88 526 88Q527 89 527 90Q528 90 528 89Q528 89 528 88L536 70Q537 70 537 69Q537 69 537 69Q537 68 536 68Q535 67 534 67Q533 67 531 67Q530 66 529 66Q529 66 529 66Q529 66 529 66Q529 66 529 65Q530 65 530 65Q531 65 531 65Q531 65 532 65Q532 65 533 65Q534 65 535 66Q536 66 537 66Q538 66 538 66Q538 66 539 66Q540 66 541 66Q542 67 543 67Q544 67 544 68Q544 69 543 69Q543 70 543 71Q542 72 542 73Q541 74 541 75Z","b":[491.0,65.2,543.8,126.2]},{"d":"M566 117Q566 119 567 121Q568 122 570 122Q572 122 574 121Q575 120 577 119Q578 118 580 116Q581 115 582 114Q583 113 584 112Q585 110 586 109Q587 108 588 106Q589 105 590 104Q591 102 592 99Q592 97 593 95Q593 95 593 94Q593 93 593 93Q593 92 593 91Q592 88 590 88Q587 88 585 90Q582 91 579 94Q577 96 574 99Q572 102 570 106Q568 109 567 112Q566 115 566 117ZM591 114Q591 115 590 116Q590 117 590 118Q589 119 589 119Q589 120 589 121Q589 121 590 120Q591 120 593 119Q594 118 595 117Q597 116 598 115Q598 115 598 115Q598 115 598 115Q599 115 599 115Q599 115 598 115Q598 116 597 117Q596 117 595 118Q595 119 594 119Q593 120 592 121Q592 121 591 122Q591 122 590 122Q590 123 589 123Q588 123 588 124Q587 124 587 124Q586 125 585 125Q583 125 582 125Q581 125 581 125Q581 124 581 124Q581 124 581 123Q582 122 582 121Q582 120 583 119Q583 119 583 118Q583 117 584 117Q584 116 584 116Q584 115 585 115Q585 114 585 114Q585 114 584 114Q584 114 584 114Q583 115 582 116Q581 117 580 118Q579 119 577 120Q576 121 575 122Q573 123 572 124Q571 124 570 125Q569 126 568 126Q567 126 566 126Q564 126 562 125Q561 125 560 123Q560 122 560 121Q559 120 559 120Q559 115 561 110Q562 106 565 102Q567 97 571 94Q574 91 579 89Q581 88 583 87Q586 87 589 87Q590 87 591 87Q592 87 593 88Q594 88 594 88Q595 89 596 90Q596 90 596 89Q596 89 597 88L605 70Q605 70 605 69Q605 69 605 69Q605 68 604 68Q603 67 602 67Q601 67 600 67Q598 66 598 66Q597 66 597 66Q597 66 597 66Q597 66 598 65Q598 65 598 65Q599 65 599 65Q600 65 600 65Q601 65 602 65Q603 65 604 66Q605 66 605 66Q606 66 606 66Q607 66 608 66Q609 66 610 66Q611 67 611 67Q612 67 612 68Q612 69 612 69Q611 70 611 71Q610 72 610 73Q609 74 609 75Z","b":[559.3,65.2,612.2,126.2]},{"d":"M617 100Q617 101 619 101Q620 101 622 101Q623 100 625 100Q627 99 629 98Q631 97 633 95Q635 94 636 92Q637 90 637 88Q637 86 636 86Q635 85 634 85Q632 85 631 86Q630 86 628 87Q627 88 626 89Q625 89 624 90Q623 91 622 92Q621 93 620 95Q619 96 618 97Q617 99 617 100ZM617 103Q616 103 616 104Q615 105 615 106Q614 108 614 109Q614 110 614 111Q614 113 614 115Q615 117 616 119Q617 120 618 121Q620 123 622 123Q624 123 625 122Q626 121 627 120Q628 119 629 118Q630 117 630 116Q631 115 631 115Q631 114 632 114Q632 114 632 114Q632 115 632 115Q632 117 631 118Q631 120 629 122Q628 123 627 124Q625 125 624 126Q623 126 623 127Q622 127 621 127Q620 127 619 127Q619 127 618 127Q617 127 615 127Q614 126 613 125Q611 125 610 123Q609 122 609 121Q608 120 608 119Q608 119 607 118Q607 117 607 116Q607 115 607 114Q607 111 608 108Q608 105 609 103Q610 102 610 101Q611 100 611 99Q612 97 613 96Q614 95 614 94Q616 92 618 90Q620 89 622 87Q625 86 627 85Q630 84 633 84Q634 84 636 84Q637 85 639 86Q640 86 641 88Q642 89 642 91Q642 94 641 96Q640 98 638 99Q636 100 633 101Q631 102 628 102Q625 103 622 103Q619 103 617 103Z","b":[607.0,84.1,642.5,127.2]},{"d":"M646 123Q646 122 646 121Q647 120 647 119Q648 117 648 116Q649 115 649 114Q650 111 651 108Q652 105 653 103Q654 101 655 100Q655 98 656 97Q656 95 657 93Q657 92 657 91Q657 91 657 90Q656 90 656 90Q655 90 655 91Q654 91 653 92Q652 93 651 95Q650 96 650 97Q649 97 649 97Q648 98 648 98Q648 98 648 97Q647 97 647 97Q647 96 648 95Q648 94 649 93Q650 92 651 90Q652 89 653 88Q655 86 656 86Q658 85 660 85Q661 85 662 85Q662 86 662 87Q662 87 662 88Q662 89 662 89Q662 90 661 91Q661 93 660 95Q660 96 659 98Q659 100 658 101Q658 102 658 102Q657 103 657 104Q657 104 658 104Q658 104 658 104Q658 104 658 104Q659 103 659 103Q660 102 660 102Q661 101 661 100Q661 100 662 99Q662 99 662 98Q665 96 667 93Q670 90 673 88Q673 87 674 87Q675 86 676 86Q677 86 678 85Q679 85 680 85Q681 85 682 85Q683 86 684 86Q685 87 686 88Q686 89 686 90Q686 91 686 92Q686 92 685 93Q685 94 684 94Q683 94 683 94Q682 94 681 94Q680 93 680 93Q680 92 679 91Q679 90 679 90Q679 89 679 88Q678 88 678 88Q677 88 675 89Q674 90 673 91Q671 93 670 95Q668 97 667 99Q665 102 663 105Q661 108 659 111Q659 111 658 113Q658 114 657 116Q656 118 655 119Q655 121 654 123Q653 125 652 126Q651 127 649 127Q648 127 647 126Q646 125 646 123Z","b":[646.1,85.0,686.4,126.9]}]},{"it":0,"role":"titel","glyphs":[{"d":"M71 174Q71 170 73 166Q74 162 76 158Q79 154 82 151Q85 148 88 146Q92 144 95 144Q98 143 102 143Q107 143 111 144Q115 146 119 148Q120 148 121 148Q122 149 123 150Q124 151 125 152Q126 152 127 153Q127 153 128 153Q128 153 128 153Q128 153 129 152Q129 151 129 151Q130 150 130 149Q130 148 131 148Q131 148 131 147Q131 147 131 147Q131 147 132 147Q132 147 133 147Q133 148 133 148Q133 149 133 149Q133 150 133 150V151Q133 151 133 151Q133 152 133 153Q133 153 133 154Q133 154 133 154V175Q133 175 132 175Q131 176 131 176Q130 176 130 175Q130 175 129 174Q129 172 128 170Q128 167 127 165Q126 162 124 159Q122 156 119 153Q116 151 113 149Q110 147 108 147Q102 147 100 148Q95 149 93 152Q90 154 87 158Q87 159 86 160Q86 162 85 164Q85 165 85 167Q84 168 84 169Q84 173 86 176Q88 180 90 182Q93 185 97 187Q100 188 103 190Q106 191 110 192Q113 193 116 195Q119 196 122 197Q124 199 127 201Q129 203 132 206Q135 209 137 213Q139 217 141 221Q142 225 142 229Q142 237 139 243Q137 249 132 253Q127 258 121 260Q114 262 107 262Q103 262 99 262Q94 262 91 260Q87 259 84 257Q81 255 78 252Q77 252 77 251Q76 251 76 251Q74 251 74 252Q73 253 73 254Q73 255 72 255Q72 256 70 256L72 234Q73 233 73 231Q73 230 73 229Q73 228 74 228Q75 228 75 229Q76 231 76 232Q77 233 77 235Q77 236 77 237Q78 238 78 239Q80 242 82 245Q84 248 86 250Q88 252 91 254Q94 256 98 257Q100 258 103 258Q105 258 107 258Q109 258 111 258Q114 257 117 255Q122 252 124 248Q127 244 127 238Q127 234 126 231Q124 227 121 224Q118 220 114 217Q111 215 107 214Q104 212 101 211Q98 210 94 209Q91 207 87 205Q84 202 80 198Q71 188 71 174Z","b":[70.3,143.5,141.9,262.4]},{"d":"M193 221 207 220Q210 220 212 219Q214 217 215 216Q216 214 216 211Q216 209 217 207Q218 206 218 206Q219 206 219 206V210Q219 213 219 217Q219 221 219 223Q219 226 219 229Q220 232 220 235Q220 235 220 236Q219 237 219 238Q219 239 219 240Q219 241 218 241Q217 241 217 240Q217 239 217 238Q216 237 216 236Q216 234 215 233Q215 231 214 230Q214 229 214 229Q213 227 211 226Q209 226 206 225Q203 225 200 225Q198 224 196 224H193Q192 224 191 225Q191 225 191 227V255Q191 258 193 259H218Q219 259 221 259Q223 258 223 258Q225 258 225 257Q226 256 227 255Q227 254 228 253Q228 252 229 250Q230 249 231 247Q231 246 232 246Q232 245 233 245Q234 245 234 245V257Q234 258 234 259Q234 259 234 260Q234 261 233 262Q233 262 231 262Q223 262 216 262Q208 262 201 262Q193 262 185 262Q176 262 166 262Q164 262 164 261Q164 260 165 259Q166 259 167 259Q167 259 168 258Q170 258 171 258Q172 258 173 258Q175 258 175 258Q177 258 177 255V194Q177 193 177 191Q177 189 176 188Q175 187 175 187L164 186Q162 186 162 184Q162 184 163 183Q163 183 164 183H177Q185 183 193 183Q200 183 207 183H218Q220 183 221 183Q222 183 224 183Q225 183 226 183Q227 183 228 183Q228 183 229 183Q229 184 229 185Q229 185 229 186Q229 187 229 187V201Q229 201 229 201Q228 201 227 200Q227 199 226 197Q225 195 224 194Q223 192 223 191Q222 189 220 189Q219 188 217 187Q215 187 213 187Q211 187 210 186Q209 186 207 186Q205 186 203 186Q200 186 198 186Q195 186 194 186Q192 186 191 187Q191 188 191 190V219Q191 220 192 220Q192 221 193 221Z","b":[162.5,182.7,234.5,262.4]},{"d":"M284 221 298 220Q302 220 303 219Q305 217 306 216Q307 214 307 211Q308 209 309 207Q309 206 310 206Q311 206 311 206V210Q311 213 310 217Q310 221 310 223Q310 226 311 229Q311 232 311 235Q311 235 311 236Q311 237 311 238Q311 239 310 240Q310 241 309 241Q309 241 308 240Q308 239 308 238Q308 237 307 236Q307 234 306 233Q306 231 306 230Q305 229 305 229Q304 227 302 226Q300 226 297 225Q295 225 292 225Q289 224 287 224H284Q283 224 283 225Q282 225 282 227V255Q282 258 284 259H309Q311 259 312 259Q314 258 315 258Q316 258 317 257Q318 256 318 255Q318 254 319 253Q320 252 321 250Q321 249 322 247Q323 246 323 246Q324 245 325 245Q326 245 326 245V257Q326 258 326 259Q326 259 325 260Q325 261 325 262Q324 262 323 262Q314 262 307 262Q300 262 292 262Q284 262 276 262Q267 262 257 262Q256 262 256 261Q256 260 257 259Q257 259 258 259Q259 259 260 258Q261 258 262 258Q264 258 265 258Q266 258 267 258Q269 258 269 255V194Q269 193 269 191Q268 189 267 188Q267 187 267 187L255 186Q254 186 254 184Q254 184 254 183Q254 183 255 183H269Q276 183 284 183Q292 183 298 183H310Q311 183 312 183Q314 183 315 183Q316 183 318 183Q319 183 319 183Q320 183 320 183Q320 184 321 185Q321 185 321 186Q321 187 321 187V201Q321 201 320 201Q319 201 319 200Q318 199 317 197Q317 195 316 194Q315 192 314 191Q313 189 312 189Q310 188 308 187Q307 187 305 187Q303 187 301 186Q301 186 299 186Q297 186 294 186Q291 186 289 186Q286 186 285 186Q283 186 283 187Q282 188 282 190V219Q282 220 283 220Q284 221 284 221Z","b":[253.8,182.7,325.9,262.4]},{"d":"M347 261Q347 261 348 260Q348 259 349 259Q349 259 349 259Q350 259 350 259H353Q354 259 355 259Q357 259 358 259Q359 259 359 258Q359 257 359 257V188Q359 187 357 187Q356 186 354 186Q352 186 350 186Q348 186 347 186Q346 185 346 184Q346 184 347 183Q347 183 348 183Q349 183 350 183H354Q362 183 369 183Q377 182 384 182Q387 182 389 182Q392 182 395 183Q397 183 399 184Q401 184 404 186Q406 187 408 189Q410 190 412 193Q413 195 414 198Q415 201 415 204Q415 206 415 208Q415 209 415 210Q414 212 414 213Q413 214 412 216Q410 218 408 220Q406 222 403 224Q401 225 399 225Q397 226 395 226Q393 226 391 227Q389 227 386 227Q384 227 382 226Q379 226 378 226Q377 226 376 226Q375 226 375 226Q373 227 373 228Q373 229 373 230V258Q373 258 374 259Q375 259 375 259H380Q382 259 383 259Q384 259 385 260Q386 260 386 261Q386 262 385 262Q384 262 384 263Q383 263 382 263Q382 263 379 262Q377 262 375 262Q372 262 370 262Q368 262 367 262H357H348Q348 262 348 262Q347 261 347 261ZM373 223Q374 224 375 224Q376 224 377 224Q378 224 378 224Q379 224 380 224Q382 224 384 224Q386 224 387 223Q390 223 392 221Q394 219 396 216Q398 214 399 211Q400 208 400 205Q400 203 400 201Q399 199 398 197Q397 194 394 192Q392 189 389 188Q386 187 383 186Q380 186 376 186Q375 186 374 186Q373 186 373 186L372 187V221Q372 222 372 222Q373 223 373 223Z","b":[346.2,182.3,415.3,262.6]},{"d":"M459 188Q459 188 459 190Q459 191 460 193Q460 194 460 195Q460 197 460 197V219Q460 220 461 221Q461 221 462 221Q462 221 463 221Q464 221 465 221Q466 221 466 221Q469 221 472 220Q476 219 479 218Q482 217 484 215Q486 212 487 209Q488 206 488 201Q488 194 483 189Q480 186 475 185Q471 183 465 183Q462 183 461 185Q459 186 459 188ZM484 260Q484 259 486 258H492Q492 258 493 258Q494 258 494 258Q495 258 495 257Q495 257 494 256Q489 249 483 241Q477 233 471 226Q471 225 470 225Q470 225 470 225L461 224H461Q460 224 460 225V250Q460 253 461 255Q461 257 463 257Q464 258 465 258Q467 258 468 258Q469 258 470 259Q471 259 471 260Q471 261 470 262Q469 262 469 262H436Q435 262 434 262Q434 261 434 260Q434 260 435 259Q436 259 438 259Q440 258 442 258Q444 258 445 258Q447 257 447 257V254Q447 250 447 247Q446 243 446 240Q446 237 446 233Q446 229 446 224V198V188Q446 187 446 187Q446 186 446 186Q445 185 445 185Q445 185 445 185Q445 185 445 185H437Q436 185 435 185Q434 184 434 183Q434 183 434 183Q434 183 434 183Q434 182 434 182Q434 181 435 181H476Q482 181 487 182Q492 183 496 186Q499 189 501 193Q504 197 504 203Q504 207 503 210Q502 212 501 214Q500 216 498 217Q496 219 494 221Q493 221 492 221Q491 222 490 222Q489 223 489 223Q488 223 488 224Q488 224 489 226Q491 228 492 230Q494 233 496 235Q498 238 500 241Q502 243 504 245Q505 247 506 247Q508 249 510 251Q512 253 515 255Q517 256 520 257Q523 258 526 259Q527 260 527 261Q527 262 526 262Q526 262 525 262H494H489Q489 262 488 262Q487 262 486 262Q485 262 485 261Q484 261 484 260Z","b":[433.6,181.1,526.7,262.0]},{"d":"M565 188V252Q565 253 565 253Q565 254 566 255Q566 256 566 257Q567 257 567 257H576Q577 257 578 258Q579 259 579 260Q579 260 578 261Q577 262 576 262H551Q549 262 547 262Q546 262 544 262Q543 262 541 262Q540 262 540 262Q539 262 539 260Q539 259 540 258Q542 258 543 258Q545 258 546 258Q548 258 548 258Q549 257 550 257Q551 257 551 254V188Q551 188 550 187Q549 186 548 186Q546 186 545 186Q544 187 542 187Q541 187 540 186Q539 186 538 186Q538 186 538 185Q537 184 538 183Q538 182 539 182Q540 182 541 182Q542 182 543 182H572Q574 182 575 182Q576 182 576 182Q577 182 577 183Q577 185 575 186Q574 186 571 186Q569 186 567 187Q565 187 565 188Z","b":[537.5,181.5,578.6,262.2]},{"d":"M606 262Q605 262 604 262Q603 262 602 262Q601 261 601 261Q600 260 600 259Q600 258 600 258Q601 257 601 257Q604 257 606 256Q607 256 609 256Q610 255 611 254Q611 252 612 249Q612 242 612 235Q612 227 613 221Q613 216 613 211Q614 206 614 201Q614 200 614 200Q614 199 614 198Q613 198 613 197Q612 196 611 194Q610 193 609 192Q608 191 608 191Q607 190 606 189Q604 188 602 188Q601 187 600 186Q599 186 599 184Q599 183 599 183Q600 183 601 182Q601 182 602 182Q603 182 603 182Q604 182 604 182Q605 182 605 182Q606 182 606 182Q607 183 607 183H616Q616 183 617 183Q618 184 618 184Q624 191 630 197Q636 204 642 210Q648 217 654 223Q660 229 666 236Q666 236 667 237Q667 237 667 237Q668 237 668 237Q669 237 669 237Q669 236 669 236V216V209Q669 206 669 203Q669 200 669 198Q669 195 668 193Q668 191 667 190Q666 188 664 187Q661 187 659 186Q657 186 655 185Q653 185 653 184Q653 182 656 182H687Q688 182 688 183Q688 184 687 185Q685 185 682 186Q680 187 678 188Q676 190 675 192Q674 194 674 196Q674 199 674 203V260Q674 261 673 262Q672 262 672 262Q671 262 670 260Q669 260 668 258Q666 256 663 253Q660 250 657 246Q653 242 649 238Q645 234 641 229Q637 225 633 221Q629 217 626 213Q623 210 620 207Q620 206 619 206Q618 206 617 208Q617 210 617 211Q617 212 617 214Q617 215 617 218Q617 220 617 222Q618 224 618 227Q618 229 618 230Q618 232 618 233V237Q618 239 618 242Q618 244 618 246Q618 249 619 250Q619 252 620 253Q621 255 622 255Q623 256 625 256Q626 256 628 256Q629 256 630 257Q632 257 632 257Q633 258 633 260Q633 260 633 261Q633 261 632 262Z","b":[598.7,181.5,688.4,262.0]},{"d":"M709 260Q709 260 710 259Q711 258 711 257Q712 256 713 254Q714 253 715 251L747 196Q748 194 749 193Q750 191 750 190Q750 189 749 189Q748 188 747 188Q745 188 742 189Q739 189 736 189Q733 189 730 189Q727 190 725 190Q724 190 722 190Q720 191 718 191Q717 192 715 194Q713 196 712 198Q711 199 709 201Q708 202 707 202Q706 202 706 201Q706 201 706 200V199Q706 199 707 197Q707 196 708 195Q709 193 710 191Q711 189 713 187Q714 185 714 184Q715 183 716 182Q716 182 716 181Q716 180 717 179Q717 178 718 177Q718 177 719 177Q720 177 720 178Q720 179 720 180Q721 182 721 183Q722 184 723 184H729H735Q738 184 741 184Q744 184 748 184Q751 183 754 183Q757 183 760 183Q761 183 764 183Q766 182 767 182Q769 182 769 184Q769 185 768 187Q767 189 766 191L731 252Q730 254 730 255Q730 256 730 256Q730 257 731 257Q732 258 733 258H755Q757 258 759 256Q761 255 763 254Q765 252 766 250Q768 247 769 245Q770 243 771 242Q771 240 772 239Q772 238 773 238Q773 238 773 239Q773 240 773 241Q773 242 773 243Q773 245 773 246Q773 247 773 247Q773 247 773 248Q773 249 772 250Q772 250 772 251Q772 252 772 252Q772 252 772 253Q772 254 772 255Q772 256 772 257Q771 258 771 258Q771 260 771 261Q770 262 768 262Q767 262 766 262Q765 262 764 262H728H719Q717 262 715 262Q712 262 711 262Q710 262 710 262Q709 261 709 260Z","b":[705.9,176.6,773.3,262.2]},{"d":"M823 221 837 220Q840 220 842 219Q843 217 844 216Q845 214 846 211Q846 209 847 207Q847 206 848 206Q849 206 849 206V210Q849 213 849 217Q848 221 848 223Q848 226 849 229Q849 232 849 235Q849 235 849 236Q849 237 849 238Q849 239 848 240Q848 241 848 241Q847 241 846 240Q846 239 846 238Q846 237 846 236Q845 234 845 233Q844 231 844 230Q843 229 843 229Q842 227 840 226Q838 226 836 225Q833 225 830 225Q827 224 825 224H823Q821 224 821 225Q821 225 821 227V255Q821 258 822 259H847Q849 259 851 259Q852 258 853 258Q854 258 855 257Q856 256 856 255Q857 254 857 253Q858 252 859 250Q860 249 860 247Q861 246 861 246Q862 245 863 245Q864 245 864 245V257Q864 258 864 259Q864 259 864 260Q863 261 863 262Q862 262 861 262Q853 262 845 262Q838 262 830 262Q823 262 814 262Q806 262 795 262Q794 262 794 261Q794 260 795 259Q796 259 796 259Q797 259 798 258Q799 258 800 258Q802 258 803 258Q804 258 805 258Q807 258 807 255V194Q807 193 807 191Q806 189 806 188Q805 187 805 187L794 186Q792 186 792 184Q792 184 792 183Q792 183 793 183H807Q815 183 822 183Q830 183 836 183H848Q849 183 851 183Q852 183 853 183Q855 183 856 183Q857 183 857 183Q858 183 858 183Q859 184 859 185Q859 185 859 186Q859 187 859 187V201Q859 201 858 201Q857 201 857 200Q857 199 856 197Q855 195 854 194Q853 192 852 191Q852 189 850 189Q849 188 847 187Q845 187 843 187Q841 187 839 186Q839 186 837 186Q835 186 832 186Q830 186 827 186Q825 186 823 186Q821 186 821 187Q821 188 821 190V219Q821 220 821 220Q822 221 823 221Z","b":[792.0,182.7,864.0,262.4]},{"d":"M892 262Q891 262 890 262Q889 262 888 262Q887 261 887 261Q886 260 886 259Q886 258 886 258Q887 257 887 257Q890 257 892 256Q893 256 895 256Q896 255 897 254Q897 252 898 249Q898 242 898 235Q898 227 899 221Q899 216 899 211Q900 206 900 201Q900 200 900 200Q900 199 900 198Q899 198 899 197Q898 196 897 194Q896 193 895 192Q894 191 894 191Q893 190 892 189Q890 188 888 188Q887 187 886 186Q885 186 885 184Q885 183 885 183Q886 183 887 182Q887 182 888 182Q889 182 889 182Q890 182 890 182Q891 182 891 182Q892 182 892 182Q893 183 893 183H902Q902 183 903 183Q904 184 904 184Q910 191 916 197Q922 204 928 210Q934 217 940 223Q946 229 952 236Q952 236 953 237Q953 237 953 237Q954 237 954 237Q955 237 955 237Q955 236 955 236V216V209Q955 206 955 203Q955 200 955 198Q955 195 954 193Q954 191 953 190Q952 188 950 187Q947 187 945 186Q943 186 941 185Q939 185 939 184Q939 182 942 182H973Q974 182 974 183Q974 184 973 185Q971 185 969 186Q966 187 964 188Q962 190 961 192Q960 194 960 196Q960 199 960 203V260Q960 261 959 262Q958 262 958 262Q957 262 956 260Q955 260 954 258Q952 256 949 253Q946 250 943 246Q939 242 935 238Q931 234 927 229Q923 225 919 221Q915 217 912 213Q909 210 906 207Q906 206 905 206Q904 206 903 208Q903 210 903 211Q903 212 903 214Q903 215 903 218Q903 220 903 222Q904 224 904 227Q904 229 904 230Q904 232 904 233V237Q904 239 904 242Q904 244 904 246Q904 249 905 250Q905 252 906 253Q907 255 908 255Q909 256 911 256Q912 256 914 256Q915 256 916 257Q918 257 918 257Q919 258 919 260Q919 260 919 261Q919 261 918 262Z","b":[884.8,181.5,974.4,262.0]}]}];
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
