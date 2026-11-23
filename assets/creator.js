/* Arcadia Creator Alpha — local-first game editor.
 * Drafts are browser-only. This app does not claim to provide authentication
 * or a server-side game publishing/moderation service.
 */
(function(){
'use strict';
var STORAGE_KEY='arcadia-creator-projects-v1';
var MAX_IMPORT_BYTES=3*1024*1024;
var projects=readProjects(),activeId=null,editorTab='visual',activeFile='index.html',selectedObjectId=null,dragging=null;
var $=function(id){return document.getElementById(id)};
var escapeHTML=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})};
var uid=function(){return (self.crypto&&crypto.randomUUID?crypto.randomUUID():'arc-'+Date.now()+'-'+Math.random().toString(36).slice(2))};
var clamp=function(v,min,max){return Math.max(min,Math.min(max,v))};
var current=function(){return projects.find(function(p){return p.id===activeId})||null};
var timer,playtestBridge=null;
var sdkSourcePromise=fetch('sdk/arcadia-sdk.js',{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error('SDK source unavailable');return r.text()});
function toast(msg){var el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(timer);timer=setTimeout(function(){el.hidden=true},3600)}
function readProjects(){try{var p=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(p)?p.filter(function(x){return x&&x.id&&x.title&&x.scene&&x.files}):[]}catch(err){return []}}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(projects));$('save-state').textContent='Saved locally · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});return true}catch(err){$('save-state').textContent='Storage limit reached';toast('Browser storage is full. Export your game to keep a backup.');return false}}
function touch(p){p.updatedAt=Date.now();persist()}
function makeObject(type,x,y){var defaults={player:{w:38,h:46,color:'#a68bff',name:'Player'},platform:{w:170,h:22,color:'#6959ac',name:'Platform'},coin:{w:25,h:25,color:'#ffd36b',name:'Coin'},hazard:{w:50,h:30,color:'#ff7389',name:'Hazard'},goal:{w:45,h:64,color:'#60e5ae',name:'Finish'}};var o=defaults[type]||defaults.platform;return {id:uid(),type:type,name:o.name,x:x,y:y,w:o.w,h:o.h,color:o.color}}
function starterScene(){return [makeObject('platform',0,502),makeObject('player',70,441),makeObject('platform',280,408),makeObject('coin',345,366),makeObject('hazard',545,475),makeObject('platform',630,355),makeObject('coin',705,315),makeObject('goal',886,438)].map(function(o,i){if(i===0){o.w=960;o.h=38}return o})}
function codeFiles(){return {
'index.html':'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My Arcadia Game</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<main><h1>My Arcadia Game</h1><canvas id="game" width="800" height="450"></canvas><p>Move with arrow keys · collect stars</p></main>\n<script src="game.js"><\/script>\n</body>\n</html>',
'style.css':'* { box-sizing:border-box; }\nbody { margin:0; background:#10172a; color:#eae8ff; font:16px system-ui,sans-serif; text-align:center; }\nmain { padding:16px; }\nh1 { font-size:23px; }\ncanvas { width:min(100%,800px); height:auto; border:2px solid #575080; background:#111b34; border-radius:12px; }\np { color:#b9b5d0; }',
'game.js':'const canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\nlet x=70, y=230, score=0;\nconst keys = {};\naddEventListener("keydown", e => { keys[e.key] = true; if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault(); });\naddEventListener("keyup", e => { keys[e.key] = false; });\nfunction frame() {\n  if(keys.ArrowLeft || keys.a) x-=4;\n  if(keys.ArrowRight || keys.d) x+=4;\n  if(keys.ArrowUp || keys.w) y-=4;\n  if(keys.ArrowDown || keys.s) y+=4;\n  x=Math.max(0,Math.min(765,x));\n  y=Math.max(0,Math.min(414,y));\n  ctx.clearRect(0,0,canvas.width,canvas.height);\n  ctx.fillStyle="#a990ff";ctx.fillRect(x,y,35,35);\n  ctx.fillStyle="#ffcc70";ctx.beginPath();ctx.arc(480,220,15,0,Math.PI*2);ctx.fill();\n  ctx.fillStyle="#fff";ctx.font="20px sans-serif";ctx.fillText("Create your own game!",16,30);\n  requestAnimationFrame(frame);\n}\nframe();'
}}
function createProject(name,mode){var now=Date.now();return {id:uid(),title:name,mode:mode==='code'?'code':'visual',scene:starterScene(),files:codeFiles(),assets:{},description:'',genre:'Arcade',controls:'Arrow keys or A/D to move, Space to jump',rights:false,school:false,createdAt:now,updatedAt:now,testedAt:null}}
function ago(t){var minutes=Math.max(0,Math.round((Date.now()-t)/60000));if(minutes<1)return 'Just now';if(minutes<60)return minutes+'m ago';if(minutes<1440)return Math.floor(minutes/60)+'h ago';return new Date(t).toLocaleDateString()}
function show(view){['home','projects','editor','publish'].forEach(function(v){$('view-'+v).hidden=v!==view});document.querySelectorAll('[data-view]').forEach(function(n){if(n.classList.contains('nav')){n.classList.toggle('active',n.dataset.view===view)}});$('crumb').textContent=({home:'CREATOR HUB',projects:'MY PROJECTS',editor:'GAME STUDIO',publish:'RELEASE CENTER'})[view];if(view==='home')renderHome();if(view==='projects')renderProjects();if(view==='editor')renderEditor();if(view==='publish')renderRelease();window.scrollTo({top:0,behavior:'instant'})}
function card(p){return '<article class="project-card"><div class="cover" aria-hidden="true">'+(p.mode==='visual'?'🎮':'💻')+'</div><div class="project-body"><h3>'+escapeHTML(p.title)+'</h3><div class="project-meta">'+(p.mode==='visual'?'Visual game':'Code game')+' · Updated '+ago(p.updatedAt)+'</div><div class="project-actions"><span class="tag">LOCAL DRAFT</span><div><button class="button secondary" data-open="'+p.id+'">Open ↗</button></div></div><div class="project-actions"><button class="text-btn" data-duplicate="'+p.id+'">Duplicate</button><button class="text-btn" data-export="'+p.id+'">Export</button><button class="text-btn" data-delete="'+p.id+'">Delete</button></div></div></article>'}
function renderHome(){var count=projects.length;var metric=[['PROJECTS',count],['VISUAL GAMES',projects.filter(function(p){return p.mode==='visual'}).length],['CODE GAMES',projects.filter(function(p){return p.mode==='code'}).length]];$('metrics').innerHTML=metric.map(function(m){return '<div class="metric"><small>'+m[0]+'</small><strong>'+m[1]+'</strong></div>'}).join('');$('recent-projects').innerHTML=count?projects.slice().sort(function(a,b){return b.updatedAt-a.updatedAt}).slice(0,3).map(card).join(''):'<div class="empty"><div class="empty-icon">✨</div><h2>Your first game starts here</h2><p>Create a project to start building.</p><button class="button primary" id="empty-home-create">Create your first game</button></div>';var b=$('empty-home-create');if(b)b.addEventListener('click',openDialog)}
function renderProjects(){var s=$('search-projects').value.trim().toLowerCase();var arr=projects.filter(function(p){return p.title.toLowerCase().includes(s)});var sort=$('sort-projects').value;arr.sort(sort==='old'?function(a,b){return a.updatedAt-b.updatedAt}:sort==='name'?function(a,b){return a.title.localeCompare(b.title)}:function(a,b){return b.updatedAt-a.updatedAt});$('all-projects').innerHTML=arr.length?arr.map(card).join(''):'<div class="empty"><h2>No projects found</h2><p>Create a new game or change your search.</p></div>'}
function openProject(id){activeId=id;selectedObjectId=null;var p=current();editorTab=p&&p.mode==='code'?'code':'visual';show('editor')}
function duplicate(id){var src=projects.find(function(p){return p.id===id});if(!src)return;var p=JSON.parse(JSON.stringify(src));p.id=uid();p.title=src.title+' (copy)';p.createdAt=p.updatedAt=Date.now();p.testedAt=null;p.scene.forEach(function(o){o.id=uid()});projects.unshift(p);persist();renderProjects();toast('Project duplicated')}
function removeProject(id){var p=projects.find(function(x){return x.id===id});if(!p)return;if(!confirm('Delete "'+p.title+'"? This cannot be undone unless you exported a backup.'))return;projects=projects.filter(function(x){return x.id!==id});if(activeId===id){activeId=null}persist();renderProjects();toast('Project deleted')}
var dialog=$('create-dialog');
function openDialog(mode){$('new-name').value='';$('import-file').value='';dialog.querySelector('input[value="'+(mode||'visual')+'"]').checked=true;syncImport();dialog.showModal();$('new-name').focus()}
function closeDialog(){dialog.close()}
function syncImport(){$('import-wrap').hidden=dialog.querySelector('input[name="new-mode"]:checked').value!=='import'}
async function importGame(file,name){if(!file)throw new Error('Choose an HTML or ZIP file.');if(file.size>MAX_IMPORT_BYTES)throw new Error('The alpha import limit is 3 MB.');var p=createProject(name,'code');if(/\.html?$/i.test(file.name)){p.files['index.html']=await file.text();p.files['style.css']='';p.files['game.js']='';return p}if(!/\.zip$/i.test(file.name))throw new Error('Choose a .html or .zip file.');if(!window.JSZip)throw new Error('ZIP import library could not load. You can import a single HTML file instead.');var zip=await JSZip.loadAsync(file,{checkCRC32:true});var entries=Object.values(zip.files).filter(function(e){return !e.dir});if(entries.length>50)throw new Error('ZIP has too many files for alpha import (maximum 50).');var total=0,files={},assets={};for(var i=0;i<entries.length;i++){var entry=entries[i],path=entry.name.replace(/\\/g,'/');if(path.startsWith('/')||path.split('/').includes('..')||path.includes('\0'))throw new Error('ZIP contains an invalid file path.');var declared=entry._data&&entry._data.uncompressedSize;if(Number.isFinite(declared)&&declared>MAX_IMPORT_BYTES-total)throw new Error('The uncompressed ZIP is larger than 3 MB.');var bytes=await entry.async('uint8array');total+=bytes.byteLength;if(total>MAX_IMPORT_BYTES)throw new Error('The uncompressed ZIP is larger than 3 MB.');if(/\.(html?|css|js|json|txt)$/i.test(path)){files[path]=new TextDecoder().decode(bytes)}else if(/\.(png|jpe?g|gif|webp|svg|mp3|ogg|wav)$/i.test(path)){var base=await entry.async('base64');var mime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav'}[path.split('.').pop().toLowerCase()];assets[path]='data:'+mime+';base64,'+base}}var index=Object.keys(files).find(function(s){return s==='index.html'})||Object.keys(files).find(function(s){return /(^|\/)index\.html$/i.test(s)});if(!index)throw new Error('ZIP must contain index.html.');if(index!=='index.html'){var prefix=index.slice(0,-'index.html'.length);var nf={},na={};Object.keys(files).forEach(function(k){nf[k.startsWith(prefix)?k.slice(prefix.length):k]=files[k]});Object.keys(assets).forEach(function(k){na[k.startsWith(prefix)?k.slice(prefix.length):k]=assets[k]});files=nf;assets=na}p.files=Object.assign({'index.html':'','style.css':'','game.js':''},files);p.assets=assets;return p}
$('create-form').addEventListener('submit',async function(e){e.preventDefault();var name=$('new-name').value.trim();if(!name){toast('Add a game name first');return}var mode=dialog.querySelector('input[name="new-mode"]:checked').value;var btn=$('create-submit');btn.disabled=true;try{var p=mode==='import'?await importGame($('import-file').files[0],name):createProject(name,mode);projects.unshift(p);activeId=p.id;selectedObjectId=null;editorTab=p.mode==='visual'?'visual':'code';if(!persist()){projects.shift();activeId=null;return}closeDialog();show('editor');toast('Project created in this browser')}catch(err){toast(err.message||'Import failed')}finally{btn.disabled=false}});
$('close-dialog').addEventListener('click',closeDialog);$('cancel-dialog').addEventListener('click',closeDialog);dialog.querySelectorAll('input[name="new-mode"]').forEach(function(r){r.addEventListener('change',syncImport)});
['new-top','new-hero','new-project','new-empty'].forEach(function(id){$(id).addEventListener('click',function(){openDialog()})});
$('start-visual').addEventListener('click',function(){openDialog('visual')});$('start-code').addEventListener('click',function(){openDialog('code')});
document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.view)})});
document.addEventListener('click',function(e){var t=e.target.closest('[data-open],[data-duplicate],[data-delete],[data-export]');if(!t)return;if(t.dataset.open)openProject(t.dataset.open);else if(t.dataset.duplicate)duplicate(t.dataset.duplicate);else if(t.dataset.delete)removeProject(t.dataset.delete);else if(t.dataset.export){var p=projects.find(function(x){return x.id===t.dataset.export});if(p)exportGame(p)}});
$('search-projects').addEventListener('input',renderProjects);$('sort-projects').addEventListener('change',renderProjects);
function renderEditor(){
 var p=current();
 $('editor-empty').hidden=!!p;$('editor-active').hidden=!p;
 if(!p)return;
 $('project-title').value=p.title;
 if(p.mode==='code'&&['visual','blocks'].includes(editorTab))editorTab='code';
 if(p.mode==='visual'&&editorTab==='code')editorTab='visual';
 setTab(editorTab);
}
function convertToCode(){
 var p=current();if(!p)return;
 if(p.mode==='code'){setTab('code');return}
 if(!confirm('Convert your visual scene and blocks into editable HTML/JavaScript? This is one-way: changes in Code Studio will not update the original blocks.'))return;
 if(editorTab==='blocks')ArcadiaCreatorBlocks.unmount();
 p.files['index.html']=visualHTML(p);
 p.files['style.css']='';
 p.files['game.js']='';
 p.mode='code';activeFile='index.html';
 touch(p);toast('Converted to editable HTML/JavaScript. The original block snapshot is retained.');
 setTab('code');
}
function setTab(tab){
 var p=current();if(!p)return;
 if(tab==='code'&&p.mode==='visual'){convertToCode();return}
 if((tab==='visual'||tab==='blocks')&&p.mode==='code'){toast('This is now a code project. Block and scene edits cannot safely reconstruct your JavaScript.');return}
 if(editorTab==='blocks'&&tab!=='blocks')ArcadiaCreatorBlocks.unmount();
 if(tab!=='preview'&&playtestBridge){playtestBridge.destroy();playtestBridge=null;$('game-preview').srcdoc=''}
 editorTab=tab;
 document.querySelectorAll('[data-editor-tab]').forEach(function(btn){
  btn.classList.toggle('active',btn.dataset.editorTab===tab);
  btn.setAttribute('aria-selected',String(btn.dataset.editorTab===tab));
 });
 ['visual','blocks','assets','code','preview'].forEach(function(v){$('workspace-'+v).hidden=v!==tab});
 if(tab==='visual'){renderScene();renderInspector();$('editor-mode-label').textContent='VISUAL BUILDER'}
 if(tab==='blocks'){
  $('editor-mode-label').textContent='BLOCK STUDIO';
  ArcadiaCreatorBlocks.mount(p,function(obj){touch(obj)});
 }
 if(tab==='assets'){
  $('editor-mode-label').textContent='ASSET LIBRARY';
  ArcadiaCreatorAssets.mount(p,{save:function(obj){touch(obj)},notify:toast,selected:function(){return selectedObjectId},renderScene:renderScene});
 }
 if(tab==='code'){$('editor-mode-label').textContent='CODE STUDIO';renderCode()}
 if(tab==='preview'){$('editor-mode-label').textContent='PLAYTEST';refreshPreview()}
}
document.querySelectorAll('[data-editor-tab]').forEach(function(btn){btn.addEventListener('click',function(){setTab(btn.dataset.editorTab)})});
$('blocks-convert').addEventListener('click',convertToCode);
ArcadiaCreatorAssets.init();
$('project-title').addEventListener('change',function(){var p=current();if(!p)return;p.title=$('project-title').value.trim()||'Untitled Game';$('project-title').value=p.title;touch(p)});
function renderCode(){var p=current();if(!p)return;document.querySelectorAll('[data-file]').forEach(function(b){b.classList.toggle('active',b.dataset.file===activeFile)});$('file-label').textContent=activeFile;$('code-input').value=p.files[activeFile]||''}
document.querySelectorAll('[data-file]').forEach(function(b){b.addEventListener('click',function(){activeFile=b.dataset.file;renderCode()})});
$('code-input').addEventListener('input',function(){var p=current();if(!p)return;p.files[activeFile]=$('code-input').value;touch(p)});
$('code-input').addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var t=e.target,s=t.selectionStart;t.setRangeText('  ',t.selectionStart,t.selectionEnd,'end');t.dispatchEvent(new Event('input'))}});
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();var p=current();if(p){persist();toast('Saved to this browser')}}});
var canvas=$('scene-canvas'),ctx=canvas.getContext('2d');
function drawObject(o){ctx.fillStyle=o.color||'#a88bff';ctx.shadowColor=o.color||'#a88bff';ctx.shadowBlur=o.type==='coin'?15:0;if(o.type==='coin'){ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h/2,Math.min(o.w,o.h)/2,0,Math.PI*2);ctx.fill()}else{ctx.fillRect(o.x,o.y,o.w,o.h)}ctx.shadowBlur=0;if(o.type==='goal'){ctx.fillStyle='#fff';ctx.font='27px system-ui';ctx.fillText('⚑',o.x+9,o.y+35)}if(o.id===selectedObjectId){ctx.setLineDash([7,5]);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.strokeRect(o.x-4,o.y-4,o.w+8,o.h+8);ctx.setLineDash([])}}
function renderScene(){var p=current();if(!p)return;var gr=ctx.createLinearGradient(0,0,0,540);gr.addColorStop(0,'#1d2549');gr.addColorStop(1,'#0c1325');ctx.fillStyle=gr;ctx.fillRect(0,0,960,540);ctx.strokeStyle='#ffffff0d';ctx.lineWidth=1;for(var x=0;x<=960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,540);ctx.stroke()}for(var y=0;y<=540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke()}p.scene.forEach(drawObject);$('object-list').innerHTML=p.scene.map(function(o){return '<button type="button" data-select-object="'+o.id+'" class="'+(o.id===selectedObjectId?'selected':'')+'">'+({'player':'🟣','platform':'▬','coin':'✦','hazard':'◆','goal':'⚑'}[o.type]||'▪')+' '+escapeHTML(o.name)+'</button>'}).join('')}
function position(e){var r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*540/r.height}}
canvas.addEventListener('pointerdown',function(e){var p=current();if(!p||editorTab!=='visual')return;var pos=position(e);var arr=p.scene.slice().reverse();var hit=arr.find(function(o){return pos.x>=o.x&&pos.x<=o.x+o.w&&pos.y>=o.y&&pos.y<=o.y+o.h});selectedObjectId=hit?hit.id:null;dragging=hit?{id:hit.id,dx:pos.x-hit.x,dy:pos.y-hit.y}:null;if(hit)canvas.setPointerCapture(e.pointerId);renderScene();renderInspector()});
canvas.addEventListener('pointermove',function(e){if(!dragging)return;var p=current(),o=p&&p.scene.find(function(a){return a.id===dragging.id});if(!o)return;var pos=position(e);o.x=Math.round(clamp(pos.x-dragging.dx,0,960-o.w));o.y=Math.round(clamp(pos.y-dragging.dy,0,540-o.h));renderScene();renderInspectorValues(o)});
function endDrag(){if(dragging){dragging=null;var p=current();if(p)touch(p)}}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
$('object-list').addEventListener('click',function(e){var btn=e.target.closest('[data-select-object]');if(!btn)return;selectedObjectId=btn.dataset.selectObject;renderScene();renderInspector()});
document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(){var p=current();if(!p)return;var o=makeObject(b.dataset.add,140+Math.round(Math.random()*180),140+Math.round(Math.random()*150));if(o.type==='player'&&p.scene.some(function(a){return a.type==='player'})){toast('This scene already has a player. You can remove it first.');return}p.scene.push(o);selectedObjectId=o.id;touch(p);renderScene();renderInspector()})});
function renderInspector(){var p=current(),o=p&&p.scene.find(function(a){return a.id===selectedObjectId});$('object-form').hidden=!o;$('inspector-empty').hidden=!!o;if(o)renderInspectorValues(o)}
function renderInspectorValues(o){if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#object-form'))return;$('obj-name').value=o.name;$('obj-x').value=o.x;$('obj-y').value=o.y;$('obj-w').value=o.w;$('obj-h').value=o.h;$('obj-color').value=/^#[0-9a-fA-F]{6}$/.test(o.color)?o.color:'#a88bff'}
$('object-form').addEventListener('submit',function(e){e.preventDefault()});
['name','x','y','w','h','color'].forEach(function(k){$('obj-'+k).addEventListener('change',function(){var p=current(),o=p&&p.scene.find(function(a){return a.id===selectedObjectId});if(!o)return;var value=$('obj-'+k).value;if(k==='name')o.name=value.slice(0,48)||o.type;else if(k==='color')o.color=value;else o[k]=Math.round(clamp(Number(value)||0,k==='w'||k==='h'?8:0,k==='x'||k==='w'?960:540));o.x=clamp(o.x,0,960-o.w);o.y=clamp(o.y,0,540-o.h);touch(p);renderScene();renderInspector()})});
$('remove-object').addEventListener('click',function(){var p=current();if(!p)return;p.scene=p.scene.filter(function(o){return o.id!==selectedObjectId});selectedObjectId=null;touch(p);renderScene();renderInspector()});
/* This function is copied into exported HTML and executes in an isolated frame. */
function visualRuntime(){
'use strict';
var scene=window.ARCADIA_SCENE||[];
var canvas=document.getElementById('arcadia-game'),ctx=canvas.getContext('2d');
var objs=scene.map(function(o){return Object.assign({},o)});
var player=objs.find(function(o){return o.type==='player'})||{x:40,y:40,w:36,h:44,color:'#ad9aff'};
var spawn={x:player.x,y:player.y},keys={},velocity=0,score=0,done=false,last=performance.now(),sdk=window.arcadiaGame||null;
if(sdk)sdk.session.start();
function intersect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function reset(){player.x=spawn.x;player.y=spawn.y;velocity=0}
addEventListener('keydown',function(e){keys[e.key.toLowerCase()]=true;if(['arrowleft','arrowright','arrowup',' ','a','d','w'].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false});
function loop(time){
 var dt=Math.min((time-last)/16.667,2);last=time;
 if(!done){
  var move=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0);
  player.x=Math.max(0,Math.min(960-player.w,player.x+move*4.2*dt));
  var floors=objs.filter(function(o){return o.type==='platform'});
  var previousBottom=player.y+player.h;
  velocity=Math.min(velocity+.54*dt,13);
  player.y+=velocity*dt;
  var grounded=false;
  floors.forEach(function(o){if(velocity>=0&&player.x+player.w>o.x&&player.x<o.x+o.w&&previousBottom<=o.y+8&&player.y+player.h>=o.y){player.y=o.y-player.h;velocity=0;grounded=true}});
  if((keys[' ']||keys.arrowup||keys.w)&&grounded){velocity=-11.7}
  if(player.y>580)reset();
  objs.forEach(function(o){if(o.type==='coin'&&!o.collected&&intersect(player,o)){o.collected=true;score+=10;if(sdk&&score===10)sdk.achievements.unlock('first-coin').catch(function(){})}if(o.type==='hazard'&&intersect(player,o))reset();if(o.type==='goal'&&intersect(player,o)){done=true;if(sdk){sdk.achievements.unlock('level-complete').catch(function(){});sdk.scores.submit(score,{mode:'platformer'}).catch(function(){});sdk.session.end({score:score,result:'completed'})}}});
 }
 var gradient=ctx.createLinearGradient(0,0,0,540);gradient.addColorStop(0,'#1b2444');gradient.addColorStop(1,'#0d1526');ctx.fillStyle=gradient;ctx.fillRect(0,0,960,540);
 ctx.fillStyle='#ffffff10';for(var j=0;j<30;j++){ctx.fillRect((j*157)%960,(j*97)%310,2,2)}
 objs.forEach(function(o){if(o.type==='player'||o.collected)return;ctx.fillStyle=o.color;if(o.type==='coin'){ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h/2,o.w/2,0,Math.PI*2);ctx.fill()}else{ctx.fillRect(o.x,o.y,o.w,o.h)}if(o.type==='goal'){ctx.fillStyle='#fff';ctx.font='32px system-ui';ctx.fillText('⚑',o.x+7,o.y+37)}});
 ctx.fillStyle=player.color;ctx.fillRect(player.x,player.y,player.w,player.h);
 ctx.font='bold 23px system-ui';ctx.fillStyle='#ffffff';ctx.fillText('SCORE: '+score,25,38);
 if(done){ctx.fillStyle='#070b18c9';ctx.fillRect(0,0,960,540);ctx.textAlign='center';ctx.fillStyle='#b9a5ff';ctx.font='bold 52px system-ui';ctx.fillText('LEVEL COMPLETE!',480,260);ctx.fillStyle='#fff';ctx.font='24px system-ui';ctx.fillText('Final score: '+score,480,303)}
 requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
}
function safetyCSP(){return "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:;\">"}
function safeInline(s){return String(s||'').replace(/<\/script/gi,'<\\/script').replace(/<\/style/gi,'<\\/style')}
function visualHTML(p){var scene=JSON.stringify(p.scene).replace(/</g,'\\u003c');return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+safetyCSP()+'<title>'+escapeHTML(p.title)+'</title><style>*{box-sizing:border-box}body{background:#0b1020;margin:0;color:#fff;font-family:system-ui,sans-serif;display:grid;min-height:100vh;place-items:center}canvas{width:100%;height:auto;max-height:100vh;object-fit:contain}div{width:100%;max-width:960px}</style></head><body><div><canvas width="960" height="540" id="arcadia-game"></canvas></div><script>window.ARCADIA_SCENE='+scene+';('+visualRuntime.toString()+')();</script></body></html>'}
function normalizePath(path){return String(path||'').replace(/^\.\//,'').replace(/^\//,'')}
function codeHTML(p){var html=p.files['index.html']||'',seenCss=false,seenJs=false;
html=html.replace(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi,function(full,path){var name=normalizePath(path);if(Object.hasOwn(p.files,name)&&/\.css$/i.test(name)){if(name==='style.css')seenCss=true;return '<style>'+safeInline(p.files[name])+'</style>'}return full});
html=html.replace(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script\s*>/gi,function(full,path){var name=normalizePath(path);if(Object.hasOwn(p.files,name)&&/\.js$/i.test(name)){if(name==='game.js')seenJs=true;return '<script>'+safeInline(p.files[name])+'</script>'}return full});
html=html.replace(/(<(?:img|audio|source)\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi,function(full,start,path,end){var data=p.assets&&p.assets[normalizePath(path)];return data?start+data+end:full});
if(!seenCss&&p.files['style.css'])html=html.replace(/<\/head>/i,'<style>'+safeInline(p.files['style.css'])+'</style></head>');
if(!seenJs&&p.files['game.js'])html=html.replace(/<\/body>/i,'<script>'+safeInline(p.files['game.js'])+'</script></body>');
if(!/<head[\s>]/i.test(html))html='<head>'+safetyCSP()+'</head>'+html;
else html=html.replace(/<head([^>]*)>/i,'<head$1>'+safetyCSP());
return html
}
function previewHTML(p){return p.mode==='visual'?visualHTML(p):codeHTML(p)}
function previewNonce(){var bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes,function(b){return b.toString(16).padStart(2,'0')}).join('')}
function renderSDKPanel(event){
 var p=current(),status=$('sdk-status'),feedback=$('sdk-feedback');
 if(!p||!playtestBridge){status.textContent='Not running';return}
 status.textContent=playtestBridge.connected?'● Connected':'◌ Connecting…';
 if(event)feedback.textContent=event.time+' · '+String(event.details||event.type).slice(0,240);
 var data;
 try{data=playtestBridge.snapshot()}catch(error){feedback.textContent='SDK storage unavailable: '+error.message;return}
 function update(id,items,format){var node=$(id);node.replaceChildren();if(!items.length){var empty=document.createElement('li');empty.textContent='None yet';node.appendChild(empty);return}items.forEach(function(item){var li=document.createElement('li');li.textContent=format(item);node.appendChild(li)})}
 update('sdk-saves',data.saves,function(x){return x});
 update('sdk-scores',data.scores,function(x){return String(x.score)+' points · '+String(x.mode||'default').slice(0,40)});
 update('sdk-achievements',data.achievements,function(x){return String(x.id||'achievement').slice(0,64)});
}
async function refreshPreview(){
 var p=current();if(!p)return;
 if(playtestBridge){playtestBridge.destroy();playtestBridge=null}
 var iframe=$('game-preview'),id=p.id;
 $('sdk-status').textContent='Loading…';$('sdk-feedback').textContent='Starting sandbox and SDK…';
 try{
  var sdkSource=await sdkSourcePromise;
  if(current()?.id!==id||editorTab!=='preview')return;
  var nonce=previewNonce();
  var bridge=new ArcadiaCreatorPlaytestBridge({iframe,projectId:id,nonce,onChange:function(event){if(playtestBridge===bridge)renderSDKPanel(event)}});
  playtestBridge=bridge;
  iframe.srcdoc=ArcadiaCreatorRuntime.preview(previewHTML(p),{sdkSource,projectId:id,nonce,title:p.title});
  p.testedAt=Date.now();persist();renderSDKPanel();
 }catch(error){$('sdk-status').textContent='Unavailable';$('sdk-feedback').textContent='Cannot initialize SDK: '+error.message;toast('Playtest failed: '+error.message)}
}
$('sdk-run-test').addEventListener('click',function(){
 if(!playtestBridge||!playtestBridge.runTest()){toast('Open Playtest and wait for the SDK connection.');return}
 $('sdk-feedback').textContent='Running SDK test in the game sandbox…';
});
$('sdk-refresh').addEventListener('click',function(){renderSDKPanel();toast('SDK data refreshed')});
$('sdk-clear').addEventListener('click',function(){
 if(!playtestBridge)return;
 if(!confirm('Clear saves, scores, and achievements for this game’s Playtest? Other projects are unaffected.'))return;
 try{playtestBridge.clear();renderSDKPanel()}catch(error){toast('Unable to clear Playtest data: '+error.message)}
});
$('preview-top').addEventListener('click',function(){setTab('preview')});$('refresh-preview').addEventListener('click',refreshPreview);$('fullscreen-preview').addEventListener('click',function(){var f=$('preview-wrap');if(f.requestFullscreen)f.requestFullscreen().catch(function(){toast('Fullscreen was blocked by this browser')})});
$('release-top').addEventListener('click',function(){show('publish')});
function checks(p){return [['Game has a title',!!p.title.trim()],['Game has a description',!!p.description.trim()],['Rights declaration completed',!!p.rights],['Includes '+(p.mode==='visual'?'a player and finish zone':'an index.html file'),p.mode==='visual'?(p.scene.some(function(o){return o.type==='player'})&&p.scene.some(function(o){return o.type==='goal'})):!!(p.files['index.html']||'').trim()],['Preview opened for playtesting',!!p.testedAt]]}
function renderRelease(){var p=current();$('release-empty').hidden=!!p;$('release-active').hidden=!p;if(!p)return;$('release-title').value=p.title;$('release-description').value=p.description||'';$('release-genre').value=p.genre||'Arcade';$('release-controls').value=p.controls||'';$('release-rights').checked=!!p.rights;$('release-school').checked=!!p.school;var items=checks(p);$('release-checks').innerHTML=items.map(function(pair){return '<div class="check-item"><span class="'+(pair[1]?'yes':'no')+'">'+(pair[1]?'✓':'○')+'</span><span>'+escapeHTML(pair[0])+'</span></div>'}).join('')}
$('release-form').addEventListener('submit',function(e){e.preventDefault();var p=current();if(!p)return;p.title=$('release-title').value.trim()||p.title;p.description=$('release-description').value.trim();p.genre=$('release-genre').value;p.controls=$('release-controls').value.trim();p.rights=$('release-rights').checked;p.school=$('release-school').checked;touch(p);renderRelease();toast('Release details saved locally')});
async function exportGame(p){
 if(!p)return;
 var filename=(p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'arcadia-game')+'.zip';
 var meta={name:p.title,description:p.description,genre:p.genre,controls:p.controls,schoolReviewRequested:p.school,rightsDeclared:p.rights,generatedBy:'Arcadia Creator Alpha',arcadiaSDK:'0.1.0',exportedAt:new Date().toISOString()};
 try{
  var sdkSource=await sdkSourcePromise;
  var options={sdkSource,projectId:p.id,title:p.title};
  if(!window.JSZip){
   var html=ArcadiaCreatorRuntime.standalone(previewHTML(p),options);
   download(new Blob([html],{type:'text/html'}),filename.replace(/\.zip$/i,'.html'));
   toast('ZIP library unavailable. Exported a standalone HTML game with the SDK.');
   return;
  }
  var zip=new JSZip();
  if(p.mode==='visual'){
   zip.file('index.html',ArcadiaCreatorRuntime.standalone(visualHTML(p),options));
  }else{
   Object.keys(p.files).forEach(function(key){
    if(!key||key.split('/').includes('..')||key.startsWith('/'))return;
    zip.file(key,key==='index.html'?ArcadiaCreatorRuntime.standalone(p.files[key],options):p.files[key]);
   });
   Object.keys(p.assets||{}).forEach(function(key){
    var data=p.assets[key],parts=data.split(',');
    if(parts.length===2&&!key.split('/').includes('..')&&!key.startsWith('/'))zip.file(key,parts[1],{base64:true});
   });
  }
  zip.file('arcadia-release.json',JSON.stringify(meta,null,2));
  var blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});
  download(blob,filename);toast('Game exported with Arcadia SDK included. Keep this ZIP as a backup.');
 }catch(err){toast('Export failed: '+(err.message||'unknown error'))}
}
function download(blob,filename){var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000)}
$('export-top').addEventListener('click',function(){exportGame(current())});$('release-export').addEventListener('click',function(){var p=current();if(!p)return;var complete=checks(p).every(function(c){return c[1]});if(!complete)toast('Exporting draft. Finish the checklist before submitting to Arcadia.');exportGame(p)});
show('home');
})();