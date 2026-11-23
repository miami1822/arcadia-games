/* Hollow Frontier — Arcadia Edition v0.1.0
   Original, self-contained browser survival prototype for Lucion Games.
   No external assets, network requests, payments or dependencies. */
(()=>{
'use strict';
const stage=document.getElementById('game-stage');
if(!stage)return;
const VERSION=1, STORAGE='hollow-frontier-worlds-v1', CW=960,CH=820, W=2400,H=1800, DAY_SECONDS=180;
const COSTS={scanner:{wood:5,stone:3,scrap:2},campfire:{wood:4,stone:3},generator:{wood:8,stone:5,scrap:2},collector:{wood:6,stone:2,scrap:4},lamp:{stone:2,scrap:3},wall:{wood:4,stone:2}};
const LABELS={scanner:'Signal scanner',campfire:'Campfire',generator:'Generator',collector:'Collector',lamp:'Floodlight',wall:'Barricade'};
const ICONS={wood:'🌲',stone:'🪨',scrap:'⚙',berry:'🫐',lumen:'✧'};
const css=`
#hf{color:#e7f2ec;width:min(1120px,100%);font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.35;--hf-accent:#a8ffba;--hf-edge:#32534b}
#hf *{box-sizing:border-box}#hf button{cursor:pointer;font:inherit}#hf button:focus-visible{outline:2px solid #d9ffba;outline-offset:2px}
#hf .hf-shell{background:#071c20;border:1px solid #3c615a;border-radius:18px;overflow:hidden;box-shadow:0 20px 70px #0005}
#hf .hf-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 16px;background:#0c282c;border-bottom:1px solid #31514c}
#hf .hf-title{font-weight:900;letter-spacing:.14em;font-size:16px}#hf .hf-title small{display:block;color:#a5bbb1;font-size:9px;letter-spacing:.25em;font-weight:700}
#hf .hf-status{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px}#hf .hf-chip{border:1px solid #446259;padding:6px 9px;border-radius:99px;background:#17353a}
#hf .hf-btn{background:#203f42;color:#e4f5eb;padding:9px 12px;border:1px solid #4b6964;border-radius:9px;min-height:38px;font-weight:700;font-size:12px}
#hf .hf-btn:hover{background:#315950}#hf .hf-btn[disabled]{cursor:not-allowed;opacity:.43}#hf .hf-primary{background:#d4fd9b;color:#112922;border-color:#d4fd9b}#hf .hf-primary:hover{background:#bbed85;color:#112922}
#hf .hf-game{display:grid;grid-template-columns:minmax(0,1fr) 224px}#hf .hf-viewport{position:relative;background:#0b252c;min-width:0}
#hf canvas{display:block;width:100%;height:auto;touch-action:none;cursor:crosshair;image-rendering:auto}
#hf .hf-message{position:absolute;bottom:12px;left:12px;right:12px;pointer-events:none;text-align:center;color:#efffed;text-shadow:0 2px 6px #001b18;font-size:13px;font-weight:700}
#hf .hf-sidebar{background:#102d31;border-left:1px solid #36574f;display:flex;flex-direction:column;gap:0;min-width:0}
#hf .hf-panel{padding:11px 13px;border-bottom:1px solid #34534a}#hf .hf-panel h3{font-size:11px;letter-spacing:.11em;color:#a4ceba;margin:0 0 8px;text-transform:uppercase}
#hf .hf-stat{display:flex;justify-content:space-between;gap:6px;font-size:12px;margin:5px 0}#hf .hf-meter{height:6px;border-radius:10px;overflow:hidden;background:#274740}#hf .hf-meter>i{display:block;height:100%;background:#8be2a6}
#hf .hf-items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;font-size:12px}#hf .hf-items span{background:#1d3d3d;border-radius:7px;padding:6px}
#hf .hf-build{display:grid;grid-template-columns:1fr 1fr;gap:5px}#hf .hf-build button{min-height:44px;font-size:11px;padding:5px;text-align:left}#hf .hf-build small{display:block;color:#b4c9b9;font-weight:400;font-size:9px}
#hf .hf-footer{background:#0b2529;border-top:1px solid #35554f;padding:9px 12px;display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:11px;color:#b9d1c7}
#hf .hf-prompt{font-size:12px;color:#d4efa9;margin:8px 0 0}#hf .hf-home{padding:27px 24px 34px;min-height:460px;background:radial-gradient(circle at 75% 10%,#224b42,#082025 64%)}
#hf .hf-kicker{font-size:11px;letter-spacing:.22em;color:#b4e19f;text-transform:uppercase;font-weight:800}#hf .hf-home h2{font-size:clamp(27px,4.5vw,42px);color:#f0ffe8;margin:10px 0}#hf .hf-home p{max-width:620px;color:#b9d0c7;line-height:1.6}
#hf .hf-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:25px}#hf .hf-slot{background:#14363a;border:1px solid #4f7067;border-radius:14px;padding:17px;min-height:166px;text-align:left;color:#e7f7e8}
#hf .hf-slot:hover{border-color:#d3ffa3;background:#214842}#hf .hf-slot strong{display:block;font-size:16px;margin-top:18px;overflow-wrap:anywhere}#hf .hf-slot small{display:block;color:#accbbe;margin-top:10px}#hf .hf-slot .hf-slotnum{font-size:10px;color:#b7dbad;letter-spacing:.15em}
#hf .hf-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
#hf .hf-overlay{position:absolute;inset:0;background:#06181ceB;display:flex;align-items:center;justify-content:center;padding:18px;z-index:2}
#hf .hf-modal{background:linear-gradient(155deg,#15353b,#0b232b);border:1px solid #658276;padding:27px;border-radius:16px;max-width:540px;box-shadow:0 20px 80px #0008}
#hf .hf-modal h2{font-size:clamp(23px,4vw,33px);line-height:1.14;color:#eaffd6;margin:9px 0 14px}#hf .hf-modal p{color:#c9e0d3;line-height:1.65}#hf .hf-modal .hf-actions{margin-top:25px}
#hf .hf-legend{position:absolute;top:10px;left:10px;background:#08252bcF;border:1px solid #4b7465;border-radius:9px;padding:7px 10px;font-weight:800;color:#ecffdf;font-size:11px;pointer-events:none}
#hf .hf-touch{display:none;position:absolute;left:10px;bottom:28px;z-index:1;gap:4px;grid-template-columns:repeat(3,43px);grid-template-rows:repeat(2,40px)}
#hf .hf-touch button{background:#102b32dd;color:#edffeb;border:1px solid #b2dfb0;border-radius:9px;min-width:40px;min-height:39px;touch-action:none;font-size:16px}
#hf .hf-touch .up{grid-column:2}#hf .hf-touch .left{grid-column:1;grid-row:2}#hf .hf-touch .down{grid-column:2;grid-row:2}#hf .hf-touch .right{grid-column:3;grid-row:2}
#hf .hf-touchact{display:none;position:absolute;bottom:28px;right:10px;z-index:1;gap:6px}#hf .hf-touchact button{background:#173c3ede;border:1px solid #b1dfae;color:#f6ffe9;border-radius:999px;width:58px;height:48px;font-size:10px;font-weight:900;touch-action:none}
#hf .hf-toast{position:absolute;top:46px;right:10px;background:#102b2de6;color:#d8f8d2;border:1px solid #5c8967;border-radius:9px;padding:9px;font-size:12px;max-width:230px;pointer-events:none}
@media(max-width:820px){#hf .hf-game{grid-template-columns:1fr}#hf .hf-sidebar{border-left:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#hf .hf-slots{grid-template-columns:1fr}#hf .hf-slot{min-height:110px}#hf .hf-home{padding:23px 18px}#hf .hf-panel{border-right:1px solid #34534a}#hf .hf-touch,#hf .hf-touchact{display:grid}#hf .hf-legend{font-size:9px}#hf .hf-message{bottom:4px;font-size:11px}}
@media(max-width:440px){#hf .hf-build{grid-template-columns:1fr 1fr}#hf .hf-modal{padding:17px}#hf .hf-footer{font-size:10px}#hf .hf-sidebar{grid-template-columns:1fr 1fr}}
`;
const sheet=document.createElement('style');sheet.textContent=css;document.head.append(sheet);
stage.replaceChildren();
const root=document.createElement('div');root.id='hf';stage.append(root);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function rng(seed){let s=seed|0;return ()=>{s=(Math.imul(1664525,s)+1013904223)|0;return (s>>>0)/4294967296}}
const safeStore={load(){try{return JSON.parse(localStorage.getItem(STORAGE))||{}}catch{return {}}},save(data){try{localStorage.setItem(STORAGE,JSON.stringify(data));return true}catch{return false}}};
let worlds=safeStore.load(),current=null,slot=null,keys=new Set(),ctx=null,canvas=null,lastFrame=0,raf=0,lastUi=0,saveTimer=0,spawnTimer=0,toastTimer=0,overlay=null,buildMode=null,sceneNodes=[],enemies=[],fx=[],camera={x:0,y:0},message='',messageEnds=0,showHelp=true;
const phases=[
 {title:'THE FRONTIER INCIDENT',speaker:'MERIDIAN RECOVERY ARCHIVE',lines:['Decades ago, an experimental energy network went dark in a remote wilderness. No rescue team ever returned.','You are Recovery Team Seven. Your transport lost power above the forest. Find shelter before nightfall.']},
 {title:'THE FIRST SIGNAL',speaker:'UNKNOWN TRANSMISSION',lines:['...is anyone receiving this? Station Nine is still online. Stay away from the central relay.','The network hears every machine you turn on. We thought it was only power. We were wrong.']},
 {title:'BENEATH THE TREES',speaker:'RESEARCH LOG 042',lines:['Lumen is responding to our activity. The creatures are not random visitors: something is protecting the network.','Find the abandoned testing facility and recover a crystal sample. It may reveal how to contact the outside world.']},
 {title:'THE NEXT EXPEDITION',speaker:'FRONTIER JOURNAL',lines:['You have a foothold, supplies and the first clue. The larger Meridian mystery remains unsolved.','The story continues in future chapters. Your settlement and discoveries remain yours.']}
];
function makeNodes(seed,expedition=false){const r=rng(seed^(expedition?0x71ac5:0));const out=[];
 const count=expedition?110:230;
 for(let i=0;i<count;i++){let x=100+r()*(W-200),y=100+r()*(H-200);if(!expedition&&Math.hypot(x-650,y-720)<180)continue;
 const v=r(),type=expedition&&v>.89?'lumen':v<.46?'wood':v<.70?'stone':v<.84?'scrap':'berry';
 out.push({id:i,x:Math.round(x),y:Math.round(y),type,qty:type==='wood'?3:type==='stone'?3:1,respawn:0});}
 return out;
}
function newWorld(index){const seed=(Date.now()+Math.floor(Math.random()*1000000))>>>0;return {v:VERSION,seed,name:`Frontier ${index+1}`,day:1,clock:.17,scene:'home',player:{x:650,y:720,hp:100,hunger:100,stamina:100},inv:{wood:9,stone:6,scrap:2,berry:3,lumen:0},nodes:makeNodes(seed),expNodes:makeNodes(seed,true),buildings:[{kind:'campfire',x:680,y:735,fuel:0}],tool:false,relay:false,chapter:0,expNights:0,expActive:false,discoveries:['The Arrival'],played:0,lastSaved:Date.now()};}
function alertUser(t,secs=3){message=t;messageEnds=performance.now()+secs*1000;const to=document.querySelector('#hf .hf-toast');if(to)to.textContent=t}
function makeHome(){cancelAnimationFrame(raf);current=null;slot=null;enemies=[];overlay=null;keys.clear();
root.innerHTML=`<div class="hf-shell"><div class="hf-top"><div class="hf-title">HOLLOW FRONTIER <small>ARCADIA EDITION · LUCION GAMES</small></div><span class="hf-chip">SURVIVAL · MYSTERY · SCI-FI</span></div><section class="hf-home"><span class="hf-kicker">The wilderness remembers</span><h2>Choose your frontier.</h2><p>Survive the night, uncover Meridian's secrets and build a lasting automated settlement. Your progress is stored locally on this browser. Three independent worlds are free.</p><div class="hf-slots" id="hf-slots"></div><div class="hf-actions"><button type="button" class="hf-btn" data-action="help">Controls &amp; guide</button></div><p id="hf-storage-note" style="font-size:12px;color:#a3c9ad">Progress is stored on this device only. Clearing browser data can erase worlds; cloud sync and multiplayer are planned for the full game.</p></section></div>`;
 const list=root.querySelector('#hf-slots');for(let i=0;i<3;i++){const w=worlds[i],b=document.createElement('button');b.className='hf-slot';b.type='button';b.dataset.action='slot';b.dataset.index=i;
 b.innerHTML=`<span class="hf-slotnum">WORLD SLOT ${i+1} · FREE</span><strong>${w?escape(w.name):'+ New world'}</strong><small>${w?`Day ${w.day} · ${w.buildings?.length||0} structures · ${w.relay?'Signal restored':'Uncharted'}`:'Start a new survival story'}</small>`;list.append(b)}
}
function save(){if(current===null||slot===null)return;current.lastSaved=Date.now();worlds[slot]=current;if(!safeStore.save(worlds)){alertUser('Save unavailable: browser storage is blocked or full.',7);return false}return true}
function start(index){slot=index;current=worlds[index]||newWorld(index);if(!Array.isArray(current.expNodes))current.expNodes=makeNodes(current.seed,true);
 current.inv.lumen??=0;current.player.stamina??=100;current.expNights??=0;
 worlds[index]=current;enemies=[];spawnTimer=0;saveTimer=0;buildMode=null;keys.clear();renderGame();lastFrame=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
 if(!current.chapter)showScene(0);else alertUser('Welcome back to '+current.name);
}
function renderGame(){root.innerHTML=`<div class="hf-shell"><div class="hf-top"><div class="hf-title">HOLLOW FRONTIER <small>ARCADIA EDITION · LUCION GAMES</small></div><div class="hf-status"><span class="hf-chip" id="hf-day">DAY 1</span><span class="hf-chip" id="hf-phase">DAYLIGHT</span><button class="hf-btn" data-action="save">Save</button><button class="hf-btn" data-action="menu">Worlds</button></div></div><div class="hf-game"><div class="hf-viewport" id="hf-viewport"><canvas id="hf-canvas" width="${CW}" height="${CH}" tabindex="0" aria-label="Hollow Frontier game world. Move with WASD or arrow keys, E to gather, Space to scan nearby resources."></canvas><div class="hf-legend" id="hf-legend">✦ REACH THE RELAY TOWER</div><div class="hf-toast" id="hf-toast" hidden></div><div class="hf-message" id="hf-message"></div><div class="hf-touch"><button type="button" class="up" data-key="arrowup" aria-label="Move up">▲</button><button type="button" class="left" data-key="arrowleft" aria-label="Move left">◀</button><button type="button" class="down" data-key="arrowdown" aria-label="Move down">▼</button><button type="button" class="right" data-key="arrowright" aria-label="Move right">▶</button></div><div class="hf-touchact"><button type="button" data-action="gather">GATHER</button><button type="button" data-action="scan">SCAN</button></div></div><aside class="hf-sidebar"><div class="hf-panel"><h3>Survival</h3><div class="hf-stat"><span>Health</span><span id="hf-hp">100</span></div><div class="hf-meter"><i id="hf-hp-meter" style="width:100%"></i></div><div class="hf-stat"><span>Hunger</span><span id="hf-hunger">100</span></div><div class="hf-meter"><i id="hf-hunger-meter" style="width:100%;background:#e9c781"></i></div><div class="hf-stat"><span>Stamina</span><span id="hf-stamina">100</span></div><div class="hf-meter"><i id="hf-stamina-meter" style="width:100%;background:#83bfe3"></i></div></div><div class="hf-panel"><h3>Backpack</h3><div class="hf-items" id="hf-items"></div><div class="hf-actions"><button class="hf-btn" data-action="eat">Eat berries</button><button class="hf-btn" data-action="scannercraft">Craft scanner</button></div></div><div class="hf-panel"><h3>Build near your character</h3><div class="hf-build" id="hf-build"></div></div><div class="hf-panel"><h3>Engineering &amp; story</h3><div id="hf-power" class="hf-stat"></div><div class="hf-actions"><button class="hf-btn" data-action="fuel">Fuel generator</button><button class="hf-btn" data-action="journal">Journal</button><button class="hf-btn" data-action="expedition">Expedition</button></div><p class="hf-prompt" id="hf-prompt"></p></div></aside></div><div class="hf-footer"><span>WASD / arrows · E gather · Space scan · Shift sprint · Click to place · J journal</span><span id="hf-save-status">Local autosave active</span></div></div>`;
 canvas=root.querySelector('#hf-canvas');ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;
 const build=root.querySelector('#hf-build');for(const k of ['campfire','generator','collector','lamp','wall']){const b=document.createElement('button');b.className='hf-btn';b.type='button';b.dataset.action='build';b.dataset.kind=k;b.innerHTML=escape(LABELS[k])+`<small>${Object.entries(COSTS[k]).map(([m,v])=>v+' '+m).join(' · ')}</small>`;build.append(b)}
 canvas.addEventListener('pointerdown',clickCanvas);canvas.focus({preventScroll:true});updateUI();}
function canSpend(price){return Object.entries(price).every(([k,v])=>(current.inv[k]||0)>=v)}
function spend(price){if(!canSpend(price)){alertUser('Not enough materials: '+Object.entries(price).map(([k,v])=>`${v} ${k}`).join(', '));return false}for(const[k,v]of Object.entries(price))current.inv[k]-=v;return true}
function build(kind,x,y){if(!current||current.scene!=='home'){alertUser('Return home to build your settlement.');return}
 if(Math.hypot(x-current.player.x,y-current.player.y)>170){alertUser('Build within reach of your character.');return}
 if(current.buildings.some(b=>Math.hypot(b.x-x,b.y-y)<56)){alertUser('Choose a clear space for this structure.');return}
 if(!spend(COSTS[kind]))return;
 current.buildings.push({kind,x:Math.round(x),y:Math.round(y),fuel:0,tick:0});buildMode=null;alertUser(LABELS[kind]+' placed.');save();updateUI();}
function clickCanvas(e){if(overlay)return;const bounds=canvas.getBoundingClientRect();const x=(e.clientX-bounds.left)*CW/bounds.width+camera.x;const y=(e.clientY-bounds.top)*CH/bounds.height+camera.y;
 if(buildMode){build(buildMode,x,y);return}
 const enemy=enemies.find(en=>Math.hypot(en.x-x,en.y-y)<32);if(enemy)alertUser('A strange creature is nearby. Find light or move away.');else interact();}
function sceneData(){return current.scene==='expedition'?current.expNodes:current.nodes}
function nearestNode(){let best=null,d=72;for(const n of sceneData()){if(n.qty<1)continue;const z=dist(current.player,n);if(z<d){d=z;best=n}}return best}
function gather(){if(!current||overlay)return;const p=current.player;
 if(current.scene==='home'&&!current.relay&&Math.hypot(p.x-1410,p.y-850)<90){
 if(spend({scrap:12,stone:8})){current.relay=true;current.chapter=1;current.discoveries.push('The First Signal');save();showScene(1);updateUI()}return;}
 const n=nearestNode();if(!n){if(current.scene==='home'&&Math.hypot(p.x-1410,p.y-850)<95&&current.relay){alertUser('Relay online. Meridian files are logged in your journal.');return}alertUser('Move closer to a tree, rock, supply crate or berries.');return}
 n.qty--;current.inv[n.type]=(current.inv[n.type]||0)+1;if(n.qty===0)n.respawn=current.day+1;
 if(n.type==='lumen'&&!current.discoveries.includes('Lumen Sample')){current.discoveries.push('Lumen Sample');if(current.relay){current.chapter=Math.max(current.chapter,2);showScene(2)}}
 alertUser('Collected '+(ICONS[n.type]||'✦')+' '+n.type);updateUI();}
function interact(){gather()}
function scan(){if(!current||overlay)return;if(!current.tool){alertUser('Craft a signal scanner from your backpack first.');return}
 const now=performance.now();if(current.lastScan&&now-current.lastScan<1200)return;current.lastScan=now;
 let nearest=null,range=260;for(const n of sceneData()){if(n.qty<1)continue;const d=dist(n,current.player);if(d<range){range=d;nearest=n}}
 fx.push({x:current.player.x,y:current.player.y,age:0,kind:'scan'});
 if(nearest)alertUser('Scanner detects '+nearest.type+' nearby ('+Math.round(range)+' m).');else alertUser('No resource signals nearby. Keep exploring.');
}
function supplyPower(){let gens=current.buildings.filter(b=>b.kind==='generator'&&b.fuel>0);let uses=current.buildings.filter(b=>b.kind==='collector'||b.kind==='lamp').length;return {available:gens.length*3,used:uses,active:gens.length*3>=uses&&gens.length>0,gens}}
function fuel(){const gen=current?.buildings.find(b=>b.kind==='generator');if(!gen){alertUser('Build a generator before adding fuel.');return}if(!spend({wood:3})){return}gen.fuel=Math.min(300,(gen.fuel||0)+90);alertUser('Generator fueled: +90 seconds.');updateUI()}
function eat(){if((current?.inv.berry||0)<1){alertUser('Gather berries in the wilderness first.');return}current.inv.berry--;current.player.hunger=clamp(current.player.hunger+28,0,100);current.player.hp=clamp(current.player.hp+6,0,100);alertUser('You ate some berries.');updateUI()}
function startExpedition(){if(!current)return;if(current.scene==='expedition'){current.scene='home';current.player.x=660;current.player.y=710;current.expActive=false;enemies=[];alertUser('Returned to your settlement.');save();updateUI();return}
 if(!current.relay){alertUser('Restore the relay tower before entering the expedition zone.');return}
 current.scene='expedition';current.player.x=450;current.player.y=450;current.expActive=true;current.expNights=0;enemies=[];alertUser('Expedition started. Gather Lumen and survive the night!');save();updateUI();}
function updateUI(){if(!current||!root.querySelector('#hf-items'))return;const p=current.player, q=supplyPower();
 const it=root.querySelector('#hf-items');it.replaceChildren();for(const k of ['wood','stone','scrap','berry','lumen']){const el=document.createElement('span');el.textContent=(ICONS[k]||'✦')+' '+k+': '+(current.inv[k]||0);it.append(el)}
 for(const k of ['hp','hunger','stamina']){const el=root.querySelector('#hf-'+k),meter=root.querySelector('#hf-'+k+'-meter');if(el)el.textContent=Math.ceil(p[k]);if(meter)meter.style.width=p[k]+'%'}
 root.querySelector('#hf-day').textContent=`DAY ${current.day}`;root.querySelector('#hf-phase').textContent=(current.clock>=.66?'NIGHTFALL':'DAYLIGHT')+(current.scene==='expedition'?' · EXPEDITION':'');
 root.querySelector('#hf-power').textContent=`⚡ ${q.available} power / ${q.used} demand · ${q.gens.length} generators fueled`;
 root.querySelector('#hf-prompt').textContent=buildMode?'Click a clear space near your character to place '+LABELS[buildMode]+'.':current.scene==='expedition'?'Collect Lumen crystals. Return with the Expedition button.':!current.relay?'Find the eastern relay tower. Restore it using 12 scrap and 8 stone.':'Explore the Frontier, automate your camp and uncover Lumen.';
 root.querySelector('[data-action="expedition"]').textContent=current.scene==='home'?'Begin expedition':'Return to camp';
 root.querySelector('[data-action="scannercraft"]').textContent=current.tool?'Scanner ✓':'Craft scanner';
 for(const b of root.querySelectorAll('[data-action="build"]')){b.disabled=!canSpend(COSTS[b.dataset.kind])||current.scene!=='home'}
 root.querySelector('[data-action="scannercraft"]').disabled=current.tool||!canSpend(COSTS.scanner);
 const obj=root.querySelector('#hf-legend');obj.textContent=current.scene==='expedition'?'✦ EXPEDITION · RECOVER LUMEN':current.relay?'✦ MERIDIAN RELAY RESTORED':'✦ FIND THE EASTERN RELAY TOWER';
}
function showScene(id){overlay={id,page:0};drawOverlay()}
function drawOverlay(){if(!overlay)return;root.querySelector('.hf-overlay')?.remove();const s=phases[overlay.id],back=document.createElement('div');back.className='hf-overlay';back.innerHTML=`<section class="hf-modal" role="dialog" aria-modal="true" aria-label="Story scene"><span class="hf-kicker">${escape(s.speaker)}</span><h2>${escape(s.title)}</h2><p>${escape(s.lines[overlay.page])}</p><div class="hf-actions"><button class="hf-btn hf-primary" data-action="nextscene">${overlay.page<s.lines.length-1?'Continue':'Begin survival'} →</button><button class="hf-btn" data-action="skipscene">Skip scene</button></div></section>`;root.querySelector('#hf-viewport').append(back);back.querySelector('button').focus()}
function finishScene(){const id=overlay?.id;overlay=null;root.querySelector('.hf-overlay')?.remove();if(id===0){current.chapter=1;current.discoveries??=[];if(!current.discoveries.includes('The Arrival'))current.discoveries.push('The Arrival')}updateUI();save();canvas?.focus({preventScroll:true})}
function storyJournal(){if(!current)return;const items=current.discoveries||[];
 const modal=document.createElement('div');modal.className='hf-overlay';modal.innerHTML=`<section class="hf-modal" role="dialog" aria-modal="true" aria-label="Frontier journal"><span class="hf-kicker">FRONTIER JOURNAL</span><h2>Recovered evidence</h2><p>Meridian Initiative attempted to harness Lumen. Something in the wilderness responded.</p><p>${items.map(x=>'✧ '+escape(x)).join('<br>')}</p><p style="font-size:12px;color:#bad3c6">Each save slot preserves its own discoveries and story choices. More chapters are planned.</p><button class="hf-btn hf-primary" data-action="closejournal">Return to world</button></section>`;
 root.querySelector('#hf-viewport').append(modal);overlay={journal:true};}
function keyHandler(e,down){const k=e.key.toLowerCase();if(!current)return;
 if(['arrowup','arrowdown','arrowleft','arrowright',' ','shift','e','j','w','a','s','d','escape'].includes(k)&&e.target?.tagName!=='INPUT')e.preventDefault();
 if(down){if(overlay){if(k==='escape')overlay.journal?closeJournal():finishScene();else if(k==='enter'&&overlay.id!==undefined)nextScene();return}
 if(k==='e')interact();else if(k===' '){scan()}else if(k==='j')storyJournal();else if(k==='escape')buildMode=null;}
 if(down)keys.add(k);else keys.delete(k);
}
function nextScene(){if(!overlay||overlay.id===undefined)return;const s=phases[overlay.id];if(++overlay.page>=s.lines.length)finishScene();else drawOverlay()}
function closeJournal(){overlay=null;root.querySelector('.hf-overlay')?.remove();canvas?.focus({preventScroll:true})}
function takeAction(action,el){if(action==='slot'){start(Number(el.dataset.index));return}if(action==='menu'){save();makeHome();return}if(action==='save'){save();alertUser('World saved on this browser.');return}
 if(action==='gather'){gather();return}if(action==='scan'){scan();return}if(action==='build'){buildMode=el.dataset.kind;alertUser('Placement: click an empty space near your character.');updateUI();return}
 if(action==='eat'){eat();return}if(action==='fuel'){fuel();return}if(action==='journal'){storyJournal();return}if(action==='closejournal'){closeJournal();return}if(action==='nextscene'){nextScene();return}if(action==='skipscene'){finishScene();return}if(action==='expedition'){startExpedition();return}
 if(action==='scannercraft'){if(current&&!current.tool&&spend(COSTS.scanner)){current.tool=true;alertUser('Signal scanner crafted! Press Space to scan.');updateUI()}return}
 if(action==='help'){root.querySelector('.hf-home p').textContent='Move with WASD or arrow keys; Shift to sprint; E (or GATHER) to collect nearby resources; Space (or SCAN) to detect resources after crafting a signal scanner. Use the build menu to select a structure, then click near your character. Click an existing world to continue it. All progress autosaves on this browser.';return;}
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)takeAction(b.dataset.action,b)});
root.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-key]');if(b){keys.add(b.dataset.key);e.preventDefault()}});
for(const t of ['pointerup','pointercancel','pointerleave'])root.addEventListener(t,e=>{const b=e.target.closest('[data-key]');if(b)keys.delete(b.dataset.key)});
window.addEventListener('keydown',e=>keyHandler(e,true));window.addEventListener('keyup',e=>keyHandler(e,false));
window.addEventListener('blur',()=>keys.clear());window.addEventListener('pagehide',save);
function beginDay(){current.day++;current.clock=0;for(const n of sceneData())if(n.qty===0&&n.respawn<=current.day)n.qty=n.type==='wood'?3:n.type==='stone'?3:1;
 if(current.scene==='expedition'){current.expNights++;if(current.expNights>=2&&!current.discoveries.includes('Survived the Wilds')){current.discoveries.push('Survived the Wilds');current.inv.lumen+=2;alertUser('Expedition survived! +2 Lumen crystals',6)}}
 enemies=[];alertUser('Day '+current.day+' begins. The creatures retreat.');save();updateUI();}
function update(dt){const p=current.player, prevClock=current.clock,night=prevClock>=.66;
 current.clock+=dt/DAY_SECONDS;if(current.clock>=1)beginDay();
 current.played=(current.played||0)+dt;
 const ax=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 const ay=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 const moving=ax||ay;const sprint=keys.has('shift')&&p.stamina>1&&moving;
 const speed=sprint?248:170;
 if(moving&&!overlay){const f=Math.hypot(ax,ay)||1;p.x=clamp(p.x+ax/f*speed*dt,30,W-30);p.y=clamp(p.y+ay/f*speed*dt,30,H-30)}
 p.stamina=clamp(p.stamina+(sprint?-25:14)*dt,0,100);
 p.hunger=clamp(p.hunger-(moving?0.24:0.13)*dt,0,100);
 if(p.hunger<=0)p.hp=clamp(p.hp-1.8*dt,0,100);
 if(p.hp<=0){p.hp=80;p.hunger=65;p.x=650;p.y=720;current.scene='home';enemies=[];current.inv.scrap=Math.max(0,current.inv.scrap-2);alertUser('Recovery beacon activated. You returned to camp.',6);save()}
 if(current.scene==='home'){
  const q=supplyPower();for(const g of q.gens)g.fuel=Math.max(0,g.fuel-dt);
  if(q.active)for(const b of current.buildings){if(b.kind==='collector'){b.tick=(b.tick||0)+dt;if(b.tick>14){b.tick=0;current.inv.wood++;current.inv.stone++;alertUser('Collector produced wood and stone.')}}}
 }
 spawnTimer+=dt;if(night&&spawnTimer>Math.max(6,13-current.day*.3)&&enemies.length<11){spawnTimer=0;const angle=Math.random()*Math.PI*2;const x=clamp(p.x+Math.cos(angle)*410,20,W-20),y=clamp(p.y+Math.sin(angle)*410,20,H-20);enemies.push({x,y,hp:2+(current.day>5?1:0),speed:48+Math.random()*22,hit:0});}
 if(night&&!overlay){const q=supplyPower(),noise=current.scene==='home'?current.buildings.filter(b=>b.kind==='collector'||b.kind==='generator').length:0;
 for(const e of enemies){let target=p,closest=dist(e,p);
 if(current.scene==='home'&&q.active){const nearLamp=current.buildings.some(b=>b.kind==='lamp'&&Math.hypot(e.x-b.x,e.y-b.y)<170);if(nearLamp){e.x+=(e.x-p.x)*dt*.08;e.y+=(e.y-p.y)*dt*.08;}}
 if(noise>0&&Math.random()<dt*.15){const g=current.buildings.find(b=>b.kind==='generator');if(g){target=g;closest=dist(e,g)}}
 const d=closest||1;e.x+=(target.x-e.x)/d*e.speed*dt;e.y+=(target.y-e.y)/d*e.speed*dt;e.hit=(e.hit||0)+dt;
 if(dist(e,p)<27&&e.hit>.85){p.hp=clamp(p.hp-7,0,100);e.hit=0;fx.push({x:p.x,y:p.y,age:0,kind:'hit'});}
 }}
 for(const f of fx)f.age+=dt;fx=fx.filter(x=>x.age<.5);
 saveTimer+=dt;if(saveTimer>15){saveTimer=0;save();}
 lastUi+=dt;if(lastUi>.35){lastUi=0;updateUI()}
 if(message&&performance.now()>messageEnds){message='';const t=root.querySelector('#hf-toast');if(t)t.hidden=true}else if(message){const t=root.querySelector('#hf-toast');if(t){t.hidden=false;t.textContent=message}}
 const m=root.querySelector('#hf-message');if(m)m.textContent=nearestNode()?'Press E to gather nearby '+nearestNode().type:current.scene==='home'&&!current.relay&&Math.hypot(p.x-1410,p.y-850)<90?'Press E to repair Meridian Relay (12 scrap · 8 stone)':buildMode?'Click nearby to place '+LABELS[buildMode]:night?'Stay alert. Creatures roam after dark.':'';
}
function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function bar(x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h)}
function draw(){if(!ctx||!current)return;const p=current.player;
 camera.x=clamp(p.x-CW/2,0,W-CW);camera.y=clamp(p.y-CH/2,0,H-CH);
 ctx.clearRect(0,0,CW,CH);ctx.save();ctx.translate(-camera.x,-camera.y);
 const night=clamp((current.clock-.59)/.14,0,1),dawn=clamp((.11-current.clock)/.11,0,1),dark=Math.max(night,dawn*.5);
 ctx.fillStyle=current.scene==='home'?'#315c49':'#304e51';ctx.fillRect(0,0,W,H);
 const sx=Math.floor(camera.x/80)*80,sy=Math.floor(camera.y/80)*80;
 for(let x=sx;x<camera.x+CW+90;x+=80)for(let y=sy;y<camera.y+CH+90;y+=80){const h=(Math.sin(x*.017+y*.013+current.seed)+Math.cos(y*.02-x*.011))*0.5;
  ctx.fillStyle=h>.22?'#38634b':h<-.3?'#294f46':'#32594b';ctx.fillRect(x,y,80,80);
  if(h>.2){circle(x+20,y+48,2,'#577c56');circle(x+65,y+17,2,'#6f8e68')}}
 // paths and landmarks
 if(current.scene==='home'){
  ctx.strokeStyle='#847c59';ctx.lineWidth=33;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(650,720);ctx.quadraticCurveTo(1030,680,1410,850);ctx.stroke();
  ctx.strokeStyle='#b2a078';ctx.lineWidth=2;ctx.setLineDash([14,14]);ctx.stroke();ctx.setLineDash([]);
  bar(1350,792,112,105,'#263d43');bar(1360,805,92,80,'#4e6862');bar(1382,748,40,60,'#394b50');bar(1395,716,14,36,current.relay?'#a9ffa0':'#ffbe74');
  circle(1410,851,40,'#1c4e50');circle(1410,851,26,current.relay?'#a2dca5':'#dba96d');circle(1410,851,12,'#2e5450');
  ctx.fillStyle='#e6ffe6';ctx.font='bold 16px system-ui';ctx.fillText('MERIDIAN RELAY',1334,696);
 }else{
  bar(360,380,180,105,'#334a4d');bar(375,392,149,82,'#506967');circle(450,435,27,'#74c6bd');ctx.fillStyle='#f3ffd0';ctx.font='bold 15px system-ui';ctx.fillText('LUMEN SITE',384,365);
 }
 // grass and harvestable resources
 for(const n of sceneData()){if(!n.qty)continue;if(n.x<camera.x-45||n.x>camera.x+CW+45||n.y<camera.y-45||n.y>camera.y+CH+45)continue;
 if(n.type==='wood'){circle(n.x+2,n.y+8,22,'#1d4637');circle(n.x-8,n.y-3,21,'#2b7956');circle(n.x+10,n.y-10,23,'#34835b');circle(n.x,yFix(n.y-16),11,'#469566')}
 else if(n.type==='stone'){circle(n.x,n.y,21,'#536d68');circle(n.x-7,n.y-5,14,'#7b9184')}
 else if(n.type==='scrap'){bar(n.x-15,n.y-12,28,28,'#6c786f');bar(n.x-13,n.y-12,18,8,'#d2a364');circle(n.x+9,n.y+7,5,'#eacb7e')}
 else if(n.type==='berry'){circle(n.x,n.y,13,'#427e55');circle(n.x-5,n.y-5,4,'#ae99f6');circle(n.x+6,n.y+3,4,'#ae99f6')}
 else if(n.type==='lumen'){circle(n.x,n.y,20,'#376a70');circle(n.x,n.y,10,'#7df3f2');circle(n.x,n.y,4,'#edfff9')}
 }
 if(current.scene==='home')for(const b of current.buildings){if(b.x<camera.x-40||b.x>camera.x+CW+40||b.y<camera.y-40||b.y>camera.y+CH+40)continue;
  if(b.kind==='campfire'){circle(b.x,b.y,21,'#655342');circle(b.x,b.y,11,'#ecb371');circle(b.x,b.y-5,6,'#ffe6a0')}
  if(b.kind==='generator'){bar(b.x-27,b.y-22,55,44,'#71877d');bar(b.x-21,b.y-16,42,32,'#263d48');circle(b.x,b.y,10,b.fuel>0?'#b8ffa4':'#d77e5c')}
  if(b.kind==='collector'){bar(b.x-25,b.y-20,50,42,'#688477');bar(b.x-18,b.y-12,36,21,'#395b57');circle(b.x,b.y,8,'#bddf9a')}
  if(b.kind==='lamp'){circle(b.x,b.y,10,'#819b8e');circle(b.x,b.y,6,'#fff7b0')}
  if(b.kind==='wall'){bar(b.x-27,b.y-8,55,18,'#957a57');for(let k=-20;k<=20;k+=13)bar(b.x+k,b.y-11,5,25,'#634e3b')}
 }
 // characters and creatures
 for(const e of enemies){circle(e.x+3,e.y+8,18,'#163a35');circle(e.x,e.y,14,'#152d3b');circle(e.x-5,e.y-3,3,'#b6f3c3');circle(e.x+5,e.y-3,3,'#b6f3c3');}
 circle(p.x+3,p.y+10,14,'#1e4741');circle(p.x,p.y,13,'#d5e1d7');circle(p.x,p.y-7,8,'#7eb0b2');circle(p.x+4,p.y-8,3,'#edffeb');
 if(current.tool){circle(p.x+16,p.y-7,5,'#bfecc7')}
 for(const f of fx){ctx.strokeStyle=f.kind==='scan'?'#a2fbec':'#ffb5a2';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,12+f.age*60,0,Math.PI*2);ctx.stroke()}
 // world boundary
 ctx.strokeStyle='#8bb79b';ctx.lineWidth=10;ctx.strokeRect(0,0,W,H);ctx.restore();
 // day/night shade and warm lights
 if(dark>0){bar(0,0,CW,CH,`rgba(5,14,29,${dark*.72})`);if(current.scene==='home')for(const b of current.buildings){if(b.kind!=='campfire'&&b.kind!=='lamp')continue;const q=supplyPower();if(b.kind==='lamp'&&!q.active)continue;const xx=b.x-camera.x,yy=b.y-camera.y;if(xx< -240||xx>CW+240||yy<-240||yy>CH+240)continue;
 const g=ctx.createRadialGradient(xx,yy,8,xx,yy,b.kind==='campfire'?150:225);g.addColorStop(0,'rgba(252,205,119,.39)');g.addColorStop(1,'rgba(250,213,153,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(xx,yy,b.kind==='campfire'?150:225,0,Math.PI*2);ctx.fill()}
 const xx=p.x-camera.x,yy=p.y-camera.y;const glow=ctx.createRadialGradient(xx,yy,5,xx,yy,125);glow.addColorStop(0,'rgba(202,244,209,.28)');glow.addColorStop(1,'rgba(180,240,215,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(xx,yy,125,0,Math.PI*2);ctx.fill()}
 // minimap
 const mx=CW-157,my=16,mw=140,mh=96;bar(mx-5,my-5,mw+10,mh+10,'#072b30dd');bar(mx,my,mw,mh,'#31594b');
 for(const n of sceneData()){if(n.type==='lumen'&&n.qty>0)circle(mx+n.x/W*mw,my+n.y/H*mh,2,'#b6fcf0')}
 if(current.scene==='home'){circle(mx+1410/W*mw,my+850/H*mh,4,current.relay?'#b4fc99':'#ffd89a');for(const b of current.buildings)circle(mx+b.x/W*mw,my+b.y/H*mh,1.6,'#effeaf')}
 circle(mx+p.x/W*mw,my+p.y/H*mh,3,'#f5fffd');ctx.fillStyle='#efffd9';ctx.font='bold 9px system-ui';ctx.fillText('FRONTIER MAP',mx+8,my+13);
}
function yFix(n){return n}
function frame(now){if(!current)return;const dt=Math.min(.045,Math.max(0,(now-lastFrame)/1000));lastFrame=now;if(!overlay)update(dt);draw();raf=requestAnimationFrame(frame)}
makeHome();
// Browser-local debugging interface used by automated smoke tests; never changes server data.
if(location.protocol!=='https:'||['localhost','127.0.0.1'].includes(location.hostname))window.HollowFrontierTest={start,save,get:()=>current,days:()=>current?.day,advance:seconds=>{for(let i=0;i<Math.ceil(seconds/.04);i++)if(current&&!overlay)update(.04)}};
})();