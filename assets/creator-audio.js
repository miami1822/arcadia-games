/* Arcadia Creator Audio Lab. Original programmatically synthesized WAVs plus browser-local audio uploads. */
(function(global){
'use strict';
const SAMPLE_RATE=11025;
const originals=[
 {id:'coin',name:'Crystal Coin',category:'SFX',duration:.24,icon:'✦',notes:[784,1175],style:'chime'},
 {id:'jump',name:'Soft Jump',category:'SFX',duration:.20,icon:'↥',notes:[300,540],style:'sweep'},
 {id:'success',name:'Level Complete',category:'SFX',duration:.65,icon:'🏁',notes:[523,659,784,1047],style:'arpeggio'},
 {id:'hit',name:'Gentle Bump',category:'SFX',duration:.26,icon:'◆',notes:[270,130],style:'noise'},
 {id:'click',name:'Menu Click',category:'SFX',duration:.09,icon:'⌁',notes:[680],style:'chime'},
 {id:'select',name:'UI Confirm',category:'SFX',duration:.18,icon:'✓',notes:[580,870],style:'arpeggio'},
 {id:'error',name:'UI Error',category:'SFX',duration:.32,icon:'!',notes:[290,230],style:'arpeggio'},
 {id:'powerup',name:'Power Up',category:'SFX',duration:.45,icon:'⚡',notes:[330,660,990],style:'sweep'},
 {id:'portal',name:'Portal Hum',category:'SFX',duration:.55,icon:'◈',notes:[180,310],style:'pulse'},
 {id:'footstep',name:'Footstep',category:'SFX',duration:.13,icon:'◌',notes:[110],style:'noise'},
 {id:'ambient-pulse',name:'Arcade Pulse',category:'Music',duration:2.20,icon:'♫',notes:[220,330,392,440,392,330,294,330],style:'loop'},
 {id:'calm-circuit',name:'Calm Circuit',category:'Music',duration:2.20,icon:'♬',notes:[261.6,329.6,392,329.6,293.7,349.2,392,349.2],style:'loop'},
 {id:'mystery-lights',name:'Mystery Lights',category:'Music',duration:2.20,icon:'♩',notes:[196,247,294,247,220,262,330,262],style:'loop'}
];
const B64SIZE=350*1024;
let project=null,save=null,notify=null,filter='all',player=null,playingKey=null;
const audioKey=item=>'audio/arcadia-'+item.id+'.wav';
function makeWave(item){
 const length=Math.max(1,Math.round(item.duration*SAMPLE_RATE));
 const bytes=new Uint8Array(44+length*2),view=new DataView(bytes.buffer);
 const write=(at,s)=>{for(let i=0;i<s.length;i++)bytes[at+i]=s.charCodeAt(i)};
 write(0,'RIFF');view.setUint32(4,36+length*2,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);
 view.setUint16(22,1,true);view.setUint32(24,SAMPLE_RATE,true);view.setUint32(28,SAMPLE_RATE*2,true);view.setUint16(32,2,true);
 view.setUint16(34,16,true);write(36,'data');view.setUint32(40,length*2,true);
 let seed=42;
 for(let i=0;i<length;i++){
  const t=i/SAMPLE_RATE,progress=i/(length-1||1),notes=item.notes;
  let value=0;
  if(item.style==='loop'){
   const at=Math.min(notes.length-1,Math.floor(progress*notes.length));
   const freq=notes[at],phase=t*2*Math.PI;
   const pulse=Math.pow(Math.max(0,Math.sin(Math.PI*progress*notes.length)),1.8);
   value=(Math.sin(phase*freq)*.6+Math.sin(phase*(freq/2))*.23+Math.sin(phase*freq*2)*.08)*(.12+.22*pulse);
   value*=Math.min(1,t*25,(item.duration-t)*25);
  }else if(item.style==='noise'){
   seed=(1664525*seed+1013904223)>>>0;
   const noise=(seed/4294967295)*2-1,env=Math.pow(1-progress,3);
   value=(noise*.65+Math.sin(t*2*Math.PI*(notes[0]||110))*.25)*env*.55;
  }else{
   const index=item.style==='arpeggio'?Math.min(notes.length-1,Math.floor(progress*notes.length)):0;
   const frequency=item.style==='sweep'?notes[0]+(notes[notes.length-1]-notes[0])*progress:notes[index];
   const env=Math.sin(Math.PI*Math.min(1,progress)) * Math.pow(1-progress,.4);
   value=(Math.sin(2*Math.PI*t*frequency)+.18*Math.sin(4*Math.PI*t*frequency))*.43*env;
  }
  view.setInt16(44+i*2,Math.max(-32767,Math.min(32767,Math.round(value*32767))),true);
 }
 let binary='';const step=8192;
 for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));
 return 'data:audio/wav;base64,'+btoa(binary);
}
function stop(){
 if(player){player.pause();player.currentTime=0;player=null}playingKey=null;
}
function play(data,key){
 if(!data)return;
 stop();
 try{
  player=new Audio(data);player.volume=.55;player.loop=false;playingKey=key;
  player.addEventListener('ended',()=>{player=null;playingKey=null},{once:true});
  player.play().catch(()=>{notify?.('Sound preview was blocked. Click Play again after interacting with the page.');stop()});
 }catch(e){notify?.('Could not play audio: '+e.message)}
}
function addOriginal(item){
 if(!project)return;
 project.assets??={};project.assetMeta??={};
 const key=audioKey(item);
 const preexisting=!!project.assets[key],available=Object.keys(project.assets).length;
 if(!preexisting&&available>=32){notify?.('Project is at its 32-asset limit.');return}
 const data=makeWave(item);
 if(data.length>B64SIZE){notify?.('Audio exceeds this version’s storage limit.');return}
 project.assets[key]=data;
 project.assetMeta[key]={name:item.name,source:'Arcadia Original Audio',license:'Original in Arcadia Creator',category:item.category,originalId:item.id};
 save?.(project);notify?.(item.name+' added to your project. Use '+key+' in the Play Audio block.');
 render();
}
function makeCard(title,meta,icon,buttons,extra=''){
 const el=document.createElement('article');el.className='asset-card audio-card';
 const visual=document.createElement('div');visual.className='asset-pack-icon audio-icon';visual.textContent=icon;
 const name=document.createElement('strong');name.textContent=title;
 const info=document.createElement('small');info.textContent=meta;
 el.append(visual,name,info);
 if(extra){const p=document.createElement('p');p.textContent=extra;el.append(p)}
 for(const b of buttons)el.append(b);
 return el;
}
function button(text,click,cls='secondary'){
 const b=document.createElement('button');b.className='button '+cls;b.type='button';b.textContent=text;b.onclick=click;return b;
}
function render(){
 const list=document.getElementById('audio-results');if(!list||!project)return;
 const q=(document.getElementById('audio-search').value||'').trim().toLowerCase();list.replaceChildren();
 const current=project.assets||{};
 const rows=originals.filter(a=>(filter==='all'||filter.toLowerCase()===a.category.toLowerCase())&&(a.name+' '+a.category+' '+a.id).toLowerCase().includes(q));
 for(const item of rows){
  const key=audioKey(item),loaded=!!current[key];
  list.append(makeCard(item.name,'Arcadia original · '+item.category+' · '+item.duration.toFixed(1)+'s',item.icon,[
   button('▶ Preview',()=>play(loaded?current[key]:makeWave(item),key)),
   button(loaded?'✓ Added':'＋ Add to game',()=>addOriginal(item),loaded?'secondary':'primary')
  ]));
 }
 const imported=Object.keys(current).filter(k=>/^audio\//.test(k)&&!/^audio\/arcadia-/.test(k));
 for(const key of imported.filter(k=>(filter==='all'||filter==='imported')&&k.toLowerCase().includes(q))){
  list.append(makeCard(key.slice(6),'Imported · '+(project.assetMeta?.[key]?.license||'license to verify'),'♫',[
   button('▶ Preview',()=>play(current[key],key)),
   button('Copy path',()=>copy(key))
  ]));
 }
 if(!list.children.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='No audio matches your search.';list.append(empty)}
 const sources=document.getElementById('audio-pack-results');
 if(sources){
  sources.replaceChildren();
  const packages=(global.ArcadiaCreatorAssets?.packs||[]).filter(item=>['Audio','Music','Retro'].includes(item[4]));
  for(const item of packages.filter(item=>item.join(' ').toLowerCase().includes(q))){
   const card=makeCard(item[0],item[1]+' · '+item[3]+' · '+item[4],item[5],[]);
   card.classList.add('asset-pack');
   const link=document.createElement('a');
   link.className='button secondary';link.textContent='Download at source ↗';link.href=item[2];
   link.target='_blank';link.rel='noopener noreferrer';
   card.append(link);sources.append(card);
  }
  if(!sources.children.length){const none=document.createElement('p');none.className='hint';none.textContent='No audio source packs match this search.';sources.append(none)}
 }

 const counter=document.getElementById('audio-count');
 counter.textContent=Object.keys(current).filter(k=>/^audio\//.test(k)).length+' sounds in your project · '+originals.length+' ready-to-use originals';
}
function copy(key){
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(key).then(()=>notify?.('Copied '+key)).catch(()=>notify?.('Use this path in a Play Audio block: '+key))}
 else notify?.('Use this path in a Play Audio block: '+key);
}
async function readAudio(files){
 if(!files.length)return;const fresh=[];
 if(files.length>8)throw Error('Import up to 8 sound files at a time.');
 if(Object.keys(project.assets||{}).length+files.length>32)throw Error('Maximum 32 game assets. Remove some before importing.');
 for(const file of files){
  if(!/\.(wav|mp3|ogg)$/i.test(file.name)||!/^audio\/(wav|x-wav|wave|mpeg|mp3|ogg)$/.test(file.type))throw Error('Only WAV, MP3, and OGG files are supported.');
  if(file.size>350*1024)throw Error(file.name+' exceeds 350 KB. Compress or trim it first.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('File reading failed'));reader.readAsDataURL(file)});
  fresh.push({name:file.name,data:String(data)});
 }
 project.assetMeta??={};project.assets??={};
 for(const item of fresh){
  const name=item.name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,64);
  let key='audio/'+name,n=1;while(project.assets[key]){key='audio/'+n+'-'+name;n++}
  project.assets[key]=item.data;project.assetMeta[key]={name:item.name,source:'User audio upload',license:'Verify license and attribution',category:'Audio'};
 }
 save?.(project);render();notify?.('Imported '+fresh.length+' audio file(s). Check each file’s rights before publishing.');
}
async function importZip(file){
 if(!file)return;
 if(!global.JSZip)throw Error('ZIP library did not load.');
 if(file.size>5*1024*1024)throw Error('Audio ZIP pack must be under 5 MB.');
 const archive=await global.JSZip.loadAsync(file,{checkCRC32:true});
 const entries=Object.values(archive.files).filter(f=>!f.dir);
 if(entries.length>1200)throw Error('ZIP contains too many files.');
 const q=(document.getElementById('audio-zip-filter').value||'').trim().toLowerCase();
 const good=entries.filter(f=>/\.(wav|mp3|ogg)$/i.test(f.name)&&f._data?.uncompressedSize<=350*1024&&(!q||f.name.toLowerCase().includes(q)));
 const available=Math.min(8,32-Object.keys(project.assets||{}).length);
 const chosen=good.slice(0,available);
 if(!chosen.length)throw Error('No matching small audio files. Filter filenames or trim/compress the pack.');
 const sounds=[];
 for(const e of chosen){
  const ext=e.name.split('.').pop().toLowerCase();
  const mime=ext==='mp3'?'audio/mpeg':ext==='ogg'?'audio/ogg':'audio/wav';
  const base64=await e.async('base64');
  sounds.push({name:e.name.split('/').pop(),data:'data:'+mime+';base64,'+base64});
 }
 project.assets??={};project.assetMeta??={};
 for(const item of sounds){
  const name=item.name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,64);
  let key='audio/'+name,n=1;while(project.assets[key])key='audio/'+n+++'-'+name;
  project.assets[key]=item.data;project.assetMeta[key]={name:item.name,source:'Imported from '+file.name.slice(0,64),license:'Verify original pack license',category:'Audio'};
 }
 save?.(project);render();notify?.('Imported '+sounds.length+' sound(s) of '+good.length+' eligible. Use audio paths in Play Audio blocks.');
}
function init(){
 document.getElementById('audio-search')?.addEventListener('input',render);
 document.querySelectorAll('[data-audio-filter]').forEach(b=>b.addEventListener('click',()=>{
  filter=b.dataset.audioFilter;
  document.querySelectorAll('[data-audio-filter]').forEach(n=>n.classList.toggle('active',n===b));render();
 }));
 const upload=document.getElementById('audio-upload');
 upload?.addEventListener('change',async()=>{try{await readAudio([...upload.files])}catch(e){notify?.(e.message)}finally{upload.value=''}});
 const zip=document.getElementById('audio-zip-upload');
 zip?.addEventListener('change',async()=>{try{await importZip(zip.files[0])}catch(e){notify?.(e.message)}finally{zip.value=''}});
}
function mount(p,opts={}){
 stop();project=p;save=opts.save;notify=opts.notify;project.assets??={};project.assetMeta??={};render();
}
function unmount(){stop();project=null;save=null;notify=null}
global.ArcadiaCreatorAudio={mount,unmount,init,render,originals,makeWave};
})(window);
