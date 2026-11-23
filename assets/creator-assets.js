/* Arcadia Creator Asset Studio: original sprites and curated external libraries. */
(function(global){
'use strict';
const svg=body=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">'+body+'</svg>';
const originals=[
 ['hero','Arcadia Hero','Character',svg('<rect x="25" y="19" width="46" height="58" rx="13" fill="#a18af9"/><rect x="33" y="36" width="10" height="10" rx="3" fill="#fff"/><rect x="54" y="36" width="10" height="10" rx="3" fill="#fff"/><path d="M38 61h20" stroke="#342960" stroke-width="5"/>')],
 ['bot','Copper Bot','Character',svg('<rect x="19" y="27" width="58" height="44" rx="13" fill="#efb76c"/><rect x="29" y="41" width="12" height="10" rx="3" fill="#1f2937"/><rect x="55" y="41" width="12" height="10" rx="3" fill="#1f2937"/><path d="M48 14v13" stroke="#fbd488" stroke-width="8"/><circle cx="48" cy="12" r="7" fill="#ffde76"/>')],
 ['gem','Energy Gem','Collectible',svg('<path d="M48 7 80 35 65 76 48 89 31 76 16 35Z" fill="#45c9bc"/><path d="M16 35h64L48 89Z" fill="#178f9d"/><path d="M48 7 66 35 48 89 30 35Z" fill="#a0fff0"/>')],
 ['star','Gold Star','Collectible',svg('<path d="m48 7 13 27 28 4-21 21 5 29-25-14-25 14 5-29L7 38l28-4Z" fill="#fbd777" stroke="#ce913d" stroke-width="3"/>')],
 ['slime','Neon Slime','Character',svg('<path d="M12 70V50c0-26 21-41 36-41s36 15 36 41v20c0 13-16 18-36 18S12 83 12 70Z" fill="#62e3a0"/><ellipse cx="34" cy="49" rx="6" ry="10" fill="#16443e"/><ellipse cx="62" cy="49" rx="6" ry="10" fill="#16443e"/><path d="M35 68q13 11 26 0" fill="none" stroke="#16443e" stroke-width="4"/>')],
 ['tree','Forest Tree','Environment',svg('<rect x="40" y="56" width="16" height="32" fill="#956844"/><path d="M48 6 8 65h80Z" fill="#327d64"/><path d="M48 24 21 64h54Z" fill="#4ac28b"/>')],
 ['crate','Tech Crate','Environment',svg('<rect x="12" y="14" width="72" height="69" rx="6" fill="#4f7399"/><path d="M12 29h72M12 67h72M24 14v69M72 14v69" stroke="#abcbe0" stroke-width="6"/><path d="m35 38 14 12-14 12" fill="none" stroke="#a6fcff" stroke-width="5"/>')],
 ['planet','Blue Planet','Background',svg('<circle cx="48" cy="48" r="36" fill="#3d7bcf"/><path d="M20 27q18-15 29-2l-7 18-13 10-14-1M60 55q20-12 22 2L63 78l-20 4Z" fill="#74ddbf"/>')],
 ['asteroid','Asteroid','Environment',svg('<path d="M36 9 63 15 83 38 72 70 42 86 14 64 11 35Z" fill="#8799b7"/><circle cx="38" cy="42" r="10" fill="#5d6b85"/><circle cx="66" cy="53" r="7" fill="#5d6b85"/>')],
 ['flag','Victory Flag','UI',svg('<path d="M25 7v82" stroke="#e1e7fc" stroke-width="8"/><path d="M29 11h51L66 35l14 23H29Z" fill="#a58af7"/>')]
];
const packs=[
 ['New Platformer Pack','Kenney','https://kenney.nl/assets/new-platformer-pack','CC0','2D','🏞️'],
 ['Pixel Platformer','Kenney','https://kenney.nl/assets/pixel-platformer','CC0','Pixel','👾'],
 ['Pixel Platformer Blocks','Kenney','https://kenney.nl/assets/pixel-platformer-blocks','CC0','Pixel','🧱'],
 ['UI Pack','Kenney','https://kenney.nl/assets/ui-pack','CC0','UI','🖱️'],
 ['UI Pack Adventure','Kenney','https://kenney.nl/assets/ui-pack-adventure','CC0','UI','🗺️'],
 ['Pixel UI Pack','Kenney','https://kenney.nl/assets/pixel-ui-pack','CC0','UI','🎛️'],
 ['Abstract Platformer','OpenGameArt','https://opengameart.org/content/abstract-platformer','CC0','2D','🏕️'],
 ['CC0 Assets','OpenGameArt','https://opengameart.org/content/cc0-resources','Per asset','Various','🎨'],
 ['Game Assets','itch.io','https://itch.io/game-assets','Per creator','Various','🧩']
];
/* Vetted source links. Individual OpenGameArt/Freesound works may have distinct license terms. */
packs.push(
 ['UI Audio (50 sounds)','Kenney','https://kenney.nl/assets/ui-audio','CC0','Audio','🔔'],
 ['Interface Sounds','Kenney','https://kenney.nl/assets/interface-sounds','CC0','Audio','🖱️'],
 ['Music Jingles (85 cues)','Kenney','https://kenney.nl/assets/music-jingles','CC0','Music','🎹'],
 ['Music Loops','Kenney','https://kenney.nl/assets/music-loops','CC0','Music','🎶'],
 ['Sci-fi Sounds','Kenney','https://kenney.nl/assets/sci-fi-sounds','CC0','Audio','🪐'],
 ['Impact Sounds','Kenney','https://kenney.nl/assets/impact-sounds','CC0','Audio','💫'],
 ['RPG Audio','Kenney','https://kenney.nl/assets/rpg-audio','CC0','Audio','✨'],
 ['Retro Sounds 1','Kenney','https://kenney.nl/assets/retro-sounds-1','CC0','Retro','👾'],
 ['Retro Sounds 2','Kenney','https://kenney.nl/assets/retro-sounds-2','CC0','Retro','🕹️'],
 ['Digital Audio','Kenney','https://kenney.nl/assets/digital-audio','CC0','Audio','🔊'],
 ['Foley Sounds','Kenney','https://kenney.nl/assets/foley-sounds','CC0','Audio','🍃'],
 ['UI Pack Sci-Fi','Kenney','https://kenney.nl/assets/ui-pack-sci-fi','CC0','UI','🛰️'],
 ['Simple Space','Kenney','https://kenney.nl/assets/simple-space','CC0','2D','🌌'],
 ['Particle Pack','Kenney','https://kenney.nl/assets/particle-pack','CC0','Effects','✨'],
 ['Nature Kit','Kenney','https://kenney.nl/assets/nature-kit','CC0','3D (reference)','🌲'],
 ['Racing Kit','Kenney','https://kenney.nl/assets/racing-kit','CC0','3D (reference)','🏎️'],
 ['12 Music Loops','OpenGameArt','https://opengameart.org/content/12-music-loops','CC0 on this pack','Music','🎵'],
 ['Short Music Loops','OpenGameArt','https://opengameart.org/content/short-loops-background-music-pack','CC0 on this pack','Music','🎼'],
 ['Quobodup CC0 Audio','OpenGameArt','https://opengameart.org/content/qubodup-audio-cc0','Check each item','Audio','🎧'],
 ['Game Sound Search','Freesound','https://freesound.org/search/?q=game','Per sound (filter CC0)','Audio','🔎'],
 ['3D Models','Poly Haven','https://polyhaven.com/models','CC0','3D (reference)','🪨'],
 ['PBR Textures','Poly Haven','https://polyhaven.com/textures','CC0','Textures','🧱'],
 ['Skyboxes / HDRIs','Poly Haven','https://polyhaven.com/hdris','CC0','3D (reference)','🌄'],
 ['Materials & Textures','ambientCG','https://ambientcg.com/','CC0','Textures','🪵']
);
const svgURL=v=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(v);
let project=null,onSave=null,onNotify=null,onSelected=null,onRepaint=null,filter='all';
function applySprite(key){
 const id=onSelected&&onSelected();
 const obj=project&&project.scene&&project.scene.find(o=>o.id===id);
 if(!obj){onNotify&&onNotify('Select an object in Visual Builder before applying a sprite.');return}
 obj.sprite=key;onSave&&onSave(project);onRepaint&&onRepaint();onNotify&&onNotify('Applied sprite to '+obj.name);
}
function render(){
 if(!project)return;
 const container=document.getElementById('asset-results');
 if(!container)return;
 const search=(document.getElementById('asset-search').value||'').trim().toLowerCase();
 container.replaceChildren();
 const imported=Object.keys(project.assets||{}).filter(k=>/\.(png|jpe?g|gif|webp|svg)$/i.test(k));
 const showOriginal=filter==='all'||filter==='starter';
 const showImported=filter==='all'||filter==='imported';
 const showPacks=filter==='all'||filter==='packs';
 const rows=[];
 if(showOriginal)originals.forEach(item=>rows.push({key:'sprites/arcadia-'+item[0]+'.svg',name:item[1],kind:item[2],image:svgURL(item[3]),local:false}));
 if(showImported)imported.forEach(key=>rows.push({key,name:key.split('/').pop(),kind:'Imported',image:project.assets[key],local:true}));
 rows.filter(row=>(row.name+' '+row.kind).toLowerCase().includes(search)).forEach(row=>{
  const card=document.createElement('article');card.className='asset-card';
  const image=document.createElement('img');image.src=row.image;image.alt='';image.loading='lazy';
  const title=document.createElement('strong');title.textContent=row.name;
  const meta=document.createElement('small');meta.textContent=row.local?'Imported sprite · verify rights':'Arcadia original · creator use permitted';
  const button=document.createElement('button');button.className='button secondary';button.type='button';button.textContent='Use on object';
  button.onclick=()=>{
   if(!row.local){project.assets[row.key]=row.image;project.assetMeta??={};project.assetMeta[row.key]={name:row.name,source:'Arcadia Originals',license:'Arcadia original'};}
   applySprite(row.key);
  };
  card.append(image,title,meta,button);container.append(card);
 });
 if(showPacks)packs.filter(row=>row.join(' ').toLowerCase().includes(search)).forEach(row=>{
  const card=document.createElement('article');card.className='asset-card asset-pack';
  const icon=document.createElement('div');icon.className='asset-pack-icon';icon.textContent=row[5];
  const title=document.createElement('strong');title.textContent=row[0];
  const meta=document.createElement('small');meta.textContent=row[1]+' · '+row[3]+' · '+row[4];
  const link=document.createElement('a');link.className='button secondary';link.textContent='Get pack ↗';link.href=row[2];link.target='_blank';link.rel='noopener noreferrer';
  card.append(icon,title,meta,link);container.append(card);
 });
 if(!container.children.length){const no=document.createElement('p');no.textContent='No matching assets found.';container.append(no)}
 document.getElementById('asset-count').textContent=imported.length+' imported sprites · '+originals.length+' starter sprites';
}
async function importImages(files){
 if(!project||!files.length)return;
 if(files.length>12)throw Error('Select up to 12 images at a time.');
 if(Object.keys(project.assets).length+files.length>32)throw Error('Project limit: 32 sprites, including built-in sprites.');
 const result=[];
 for(const file of files){
  if(!/^image\/(png|jpeg|gif|webp)$/.test(file.type)||!/\.(png|jpe?g|gif|webp)$/i.test(file.name))throw Error('Upload PNG, JPEG, GIF or WebP images.');
  if(file.size>350*1024)throw Error(file.name+' is over 350 KB. Resize or optimize it first.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('File reading failed'));reader.readAsDataURL(file)});
  result.push({name:file.name,data});
 }
 project.assetMeta??={};
 for(const item of result){
  const name=item.name.replace(/[^A-Za-z0-9._-]/g,'-').slice(0,70);
  let key='sprites/'+name,n=1;while(project.assets[key]){key='sprites/'+n+'-'+name;n++}
  project.assets[key]=item.data;project.assetMeta[key]={name:item.name,license:'User verification required',source:'User upload'};
 }
 onSave&&onSave(project);render();onNotify&&onNotify('Imported '+result.length+' image(s). Please verify asset rights before publishing.');
}
async function importPack(file){
 if(!project||!file)return;
 if(!/\.zip$/i.test(file.name)||file.size>5*1024*1024)throw Error('Choose a ZIP pack smaller than 5 MB.');
 if(!global.JSZip)throw Error('The ZIP importer could not load. Check your connection and try again.');
 const zip=await global.JSZip.loadAsync(file,{checkCRC32:true});
 const entries=Object.values(zip.files).filter(x=>!x.dir);
 if(entries.length>1200)throw Error('Pack contains too many files for the browser importer.');
 const q=(document.getElementById('asset-zip-filter')?.value||'').toLowerCase().trim();
 const supported=/\.(png|jpe?g|webp|gif)$/i;
 const candidates=entries.filter(x=>{
  const name=x.name.split('/').pop();
  return name&&supported.test(name)&&(!q||x.name.toLowerCase().includes(q))&&x._data&&x._data.uncompressedSize<=350*1024;
 });
 const available=Math.max(0,32-Object.keys(project.assets).length);
 const chosen=candidates.slice(0,Math.min(12,available));
 if(!chosen.length)throw Error('No matching compatible images. Try another ZIP filter or make room in your project.');
 const images=[];
 for(const entry of chosen){
  const extension=entry.name.split('.').pop().toLowerCase();
  const mime=extension==='png'?'image/png':extension==='webp'?'image/webp':extension==='gif'?'image/gif':'image/jpeg';
  const bytes=await entry.async('base64');
  const name=entry.name.split('/').pop().replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,70);
  images.push({name,data:'data:'+mime+';base64,'+bytes});
 }
 project.assetMeta??={};
 for(const image of images){
  let key='sprites/'+image.name,n=1;while(project.assets[key])key='sprites/'+n+++'-'+image.name;
  project.assets[key]=image.data;project.assetMeta[key]={name:image.name,source:'Imported from '+file.name.slice(0,70),license:'User verification required'};
 }
 onSave&&onSave(project);render();
 onNotify&&onNotify('Imported '+images.length+' of '+candidates.length+' matching images. Check each pack’s license before publishing.');
}
function mount(p,opts={}){
 project=p;project.assets??={};project.assetMeta??={};
 onSave=opts.save;onNotify=opts.notify;onSelected=opts.selected;onRepaint=opts.renderScene;
 render();
}
function init(){
 const search=document.getElementById('asset-search');if(!search)return;
 search.addEventListener('input',render);
 document.querySelectorAll('[data-asset-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.assetFilter;document.querySelectorAll('[data-asset-filter]').forEach(b=>b.classList.toggle('active',b===button));render()}));
 const input=document.getElementById('asset-upload');
 input.addEventListener('change',async()=>{try{await importImages(Array.from(input.files))}catch(e){if(onNotify)onNotify(e.message)}finally{input.value=''}});
 const pack=document.getElementById('asset-zip-upload');pack?.addEventListener('change',async()=>{try{await importPack(pack.files[0])}catch(e){if(onNotify)onNotify(e.message)}finally{pack.value=''}});
}
global.ArcadiaCreatorAssets={mount,init,render,packs};
})(window);