/* Arcadia Creator 3D Model Lab: original procedural GLB models, validated imports and model preview.
 * Stage/import/export only: the existing playable 2D platformer does not execute a 3D game engine.
 */
(function(global){
'use strict';
const prefabs=[
 {id:'crate',name:'Cargo Crate',category:'Props',icon:'📦'},
 {id:'tree',name:'Low-poly Tree',category:'Nature',icon:'🌳'},
 {id:'crystal',name:'Energy Crystal',category:'Pickups',icon:'💎'},
 {id:'platform',name:'Floating Platform',category:'World',icon:'🟪'},
 {id:'robot',name:'Friendly Bot',category:'Characters',icon:'🤖'},
 {id:'rock',name:'Rock Formation',category:'Nature',icon:'🪨'},
 {id:'tower',name:'Observation Tower',category:'World',icon:'🏢'},
 {id:'spaceship',name:'Scout Ship',category:'Vehicles',icon:'🚀'}
];
const packs=[
 {name:'Nature Kit',source:'Kenney',category:'Environment',license:'CC0',url:'https://kenney.nl/assets/nature-kit',icon:'🌲'},
 {name:'Platformer Kit',source:'Kenney',category:'Characters & Tiles',license:'CC0',url:'https://kenney.nl/assets/platformer-kit',icon:'🕹️'},
 {name:'Space Kit',source:'Kenney',category:'Sci-Fi',license:'CC0',url:'https://kenney.nl/assets/space-kit',icon:'🛰️'},
 {name:'Modular Space Kit',source:'Kenney',category:'Sci-Fi',license:'CC0',url:'https://kenney.nl/assets/modular-space-kit',icon:'🌌'},
 {name:'City Kit',source:'Kenney',category:'Buildings',license:'CC0',url:'https://kenney.nl/assets/city-kit-commercial',icon:'🏙️'},
 {name:'Poly Haven Models',source:'Poly Haven',category:'Realistic',license:'CC0',url:'https://polyhaven.com/models',icon:'🪑'},
 {name:'ambientCG Materials',source:'ambientCG',category:'Textures',license:'CC0',url:'https://ambientcg.com/',icon:'🧱'},
 {name:'Quaternius Universal Assets',source:'Quaternius',category:'Low-poly',license:'Check pack terms',url:'https://quaternius.com/',icon:'🧩'}
];
const MAX_GLB_BYTES=1_250_000,MAX_ASSETS=32;
let project=null,save=null,notify=null,url=null,filter='all',selectedKey=null;
function addTriangle(target,a,b,c){
 const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
 const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,len=Math.hypot(nx,ny,nz)||1;
 for(const point of [a,b,c]){target.positions.push(...point);target.normals.push(nx/len,ny/len,nz/len)}
}
function geometry(type){
 const a={positions:[],normals:[]},tri=(x,y,z)=>addTriangle(a,x,y,z);
 if(type==='box'){
  const p=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
  for(const [q,w,e,r] of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]){tri(p[q],p[w],p[e]);tri(p[q],p[e],p[r])}
 }else if(type==='octahedron'){
  const top=[0,.75,0],bottom=[0,-.75,0],ring=[[.5,0,0],[0,0,.5],[-.5,0,0],[0,0,-.5]];
  for(let k=0;k<4;k++){const n=(k+1)%4;tri(top,ring[k],ring[n]);tri(bottom,ring[n],ring[k])}
 }else if(type==='cylinder'||type==='cone'){
  const radius=.5,steps=12,topHeight=.5,bottomHeight=-.5,topRadius=type==='cone'?0:radius;
  for(let k=0;k<steps;k++){
   const r=k*Math.PI*2/steps,s=(k+1)*Math.PI*2/steps;
   const a1=[Math.cos(r)*radius,bottomHeight,Math.sin(r)*radius],a2=[Math.cos(s)*radius,bottomHeight,Math.sin(s)*radius];
   const b1=[Math.cos(r)*topRadius,topHeight,Math.sin(r)*topRadius],b2=[Math.cos(s)*topRadius,topHeight,Math.sin(s)*topRadius];
   if(topRadius){tri(a1,b1,b2);tri(a1,b2,a2);tri([0,topHeight,0],b2,b1)}else tri(a1,b1,a2);
   tri([0,bottomHeight,0],a1,a2);
  }
 }else if(type==='sphere'){
  const steps=12,rings=7;
  const point=(a,b)=>[Math.sin(a)*Math.cos(b)*.5,Math.cos(a)*.5,Math.sin(a)*Math.sin(b)*.5];
  for(let lat=0;lat<rings;lat++)for(let lon=0;lon<steps;lon++){
   const t=lat*Math.PI/rings,v=(lat+1)*Math.PI/rings,r=lon*Math.PI*2/steps,w=(lon+1)*Math.PI*2/steps;
   tri(point(t,r),point(v,r),point(v,w));tri(point(t,r),point(v,w),point(t,w))
  }
 }
 return a;
}
const part=(shape,color,translation=[0,0,0],scale=[1,1,1])=>({shape,color,translation,scale});
function partsFor(id){
 switch(id){
 case 'crate':return [part('box','#475e89',[0,0,0]),part('box','#9fcfe6',[0,.4,0],[1.08,.14,1.08])];
 case 'tree':return [part('cylinder','#8b603c',[0,.5,0],[.35,1.8,.35]),part('cone','#3faf87',[0,1.6,0],[2,2.1,2]),part('cone','#26735d',[0,2.5,0],[1.55,2,1.55])];
 case 'crystal':return [part('octahedron','#4ce2d1',[0,0,0],[1.5,2,1.5]),part('box','#4455a8',[0,-.95,0],[1.3,.24,1.3])];
 case 'platform':return [part('box','#5a61a9',[0,0,0],[3,.45,2]),part('box','#ac9df6',[0,.29,0],[3.05,.12,2.05])];
 case 'robot':return [part('box','#eda95f',[0,.75,0],[.85,1.2,.55]),part('box','#ffd47d',[0,1.65,0],[1,.8,.75]),part('box','#31445d',[-.2,1.7,.4],[.15,.16,.08]),part('box','#31445d',[.2,1.7,.4],[.15,.16,.08]),part('cylinder','#a1bccb',[0,2.25,0],[.07,.4,.07]),part('sphere','#a9f5ff',[0,2.5,0],[.22,.22,.22])];
 case 'rock':return [part('octahedron','#8596aa',[0,.2,0],[2,1.2,1.7]),part('octahedron','#657d92',[.7,.05,-.7],[1,.8,1])];
 case 'tower':return [part('box','#596b87',[0,1,0],[1.5,2,1.5]),part('box','#aab9d2',[0,2.1,0],[2,.22,2]),part('cylinder','#b3d4ea',[0,2.8,0],[.6,1.25,.6]),part('cone','#8d82c4',[0,3.65,0],[1.1,.8,1.1])];
 case 'spaceship':return [part('octahedron','#7a9fcf',[0,.45,0],[1.1,.6,2.6]),part('box','#4e5d89',[0,.35,0],[3,.15,1]),part('sphere','#a4f9fc',[0,.65,.2],[.75,.45,.8])];
 default:throw Error('Unknown Arcadia 3D model');
 }
}
function colorValue(hex){
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
}
function makeGLB(id){
 const parts=partsFor(id),json={asset:{version:'2.0',generator:'Arcadia Creator Original 3D Kit'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],buffers:[{byteLength:0}],bufferViews:[],accessors:[]};
 const arrays=[];let size=0;
 function bytes(view){
  const raw=new Uint8Array(view.buffer,view.byteOffset,view.byteLength),padded=Math.ceil(raw.byteLength/4)*4,b=new Uint8Array(padded);b.set(raw);const index=json.bufferViews.length;
  json.bufferViews.push({buffer:0,byteOffset:size,byteLength:raw.byteLength,target:34962});
  arrays.push(b);size+=padded;return index;
 }
 for(const p of parts){
  const g=geometry(p.shape),pos=new Float32Array(g.positions),norm=new Float32Array(g.normals);
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<g.positions.length;i+=3)for(let k=0;k<3;k++){min[k]=Math.min(min[k],g.positions[i+k]);max[k]=Math.max(max[k],g.positions[i+k])}
  const pv=bytes(pos),nv=bytes(norm),pa=json.accessors.length,na=pa+1;
  json.accessors.push({bufferView:pv,componentType:5126,count:pos.length/3,type:'VEC3',min,max});
  json.accessors.push({bufferView:nv,componentType:5126,count:norm.length/3,type:'VEC3'});
  const mat=json.materials.length,mesh=json.meshes.length,node=json.nodes.length;
  json.materials.push({pbrMetallicRoughness:{baseColorFactor:[...colorValue(p.color),1],metallicFactor:.12,roughnessFactor:.78},doubleSided:true});
  json.meshes.push({primitives:[{attributes:{POSITION:pa,NORMAL:na},material:mat,mode:4}]});
  json.nodes.push({mesh,translation:p.translation,scale:p.scale});
  json.scenes[0].nodes.push(node);
 }
 json.buffers[0].byteLength=size;
 const encoder=new TextEncoder(),encoded=encoder.encode(JSON.stringify(json)),jsonSize=Math.ceil(encoded.byteLength/4)*4;
 const total=12+8+jsonSize+8+size;
 const buffer=new ArrayBuffer(total),output=new Uint8Array(buffer),view=new DataView(buffer);
 view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,total,true);
 view.setUint32(12,jsonSize,true);view.setUint32(16,0x4e4f534a,true);
 output.fill(32,20,20+jsonSize);output.set(encoded,20);
 const base=20+jsonSize;view.setUint32(base,size,true);view.setUint32(base+4,0x004e4942,true);
 let offset=base+8;for(const bytes of arrays){output.set(bytes,offset);offset+=bytes.byteLength}
 return new Blob([buffer],{type:'model/gltf-binary'});
}
function verifyGLB(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<28||buffer.byteLength>MAX_GLB_BYTES)throw Error('Use a self-contained GLB smaller than 1.25 MB.');
 const v=new DataView(buffer);
 if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==buffer.byteLength)throw Error('Invalid GLB header or file length.');
 const n=v.getUint32(12,true);
 if(v.getUint32(16,true)!==0x4e4f534a||n>buffer.byteLength-20||n<10)throw Error('Missing valid GLB JSON chunk.');
 let meta;try{meta=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,n)).trim())}catch{throw Error('Could not parse GLB JSON.')}
 if(!meta.asset||String(meta.asset.version).split('.')[0]!=='2')throw Error('Only glTF 2.0 GLB models are supported.');
 if(!Array.isArray(meta.meshes)||!meta.meshes.length||meta.meshes.length>250||((meta.nodes||[]).length>500))throw Error('GLB contains no supported meshes or has too many scene elements.');
 if((meta.buffers||[]).some(x=>x.uri&&!x.uri.startsWith('data:'))||(meta.images||[]).some(x=>x.uri&&!x.uri.startsWith('data:')))throw Error('Model references external textures or buffers. Export a self-contained GLB.');
 if((meta.extensionsRequired||[]).some(x=>!['KHR_materials_unlit','KHR_texture_transform','KHR_mesh_quantization'].includes(x)))throw Error('Model requires compression or an unsupported glTF extension.');
 return {meshes:meta.meshes.length,nodes:(meta.nodes||[]).length,triangles:Math.round((meta.accessors||[]).reduce((n,x)=>n+(x.count||0),0)/3)};
}
function toData(blob){
 return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(String(fr.result));fr.onerror=()=>reject(Error('Reading model failed'));fr.readAsDataURL(blob)});
}
function blobFromData(data){
 const parts=String(data).split(',');
 if(parts.length!==2||!/^data:model\/gltf-binary;base64$/i.test(parts[0]))throw Error('Invalid 3D asset encoding.');
 const raw=atob(parts[1]);if(raw.length>MAX_GLB_BYTES)throw Error('Model is too large.');
 const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 return new Blob([bytes],{type:'model/gltf-binary'});
}
function safeFile(name){return name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,70)}
function put(key,data,meta){
 if(!project)return false;
 project.assets??={};project.assetMeta??={};
 if(!project.assets[key]&&Object.keys(project.assets).length>=MAX_ASSETS){notify?.('Project has reached the 32-asset limit.');return false}
 project.assets[key]=data;project.assetMeta[key]=meta;save?.(project);render();return true;
}
function setPreview(key,blob,details){
 const viewer=document.getElementById('three-model-viewer'),status=document.getElementById('three-preview-status');
 if(!viewer||!status)return;
 if(url){URL.revokeObjectURL(url);url=null}
 url=URL.createObjectURL(blob);viewer.setAttribute('src',url);viewer.setAttribute('alt',details);
 selectedKey=key;status.textContent=details;
 document.getElementById('three-selected-path').textContent=key||'Preview only';
}
async function openAsset(key){
 if(!project?.assets?.[key])return;
 try{
  const blob=blobFromData(project.assets[key]),buffer=await blob.arrayBuffer(),info=verifyGLB(buffer);
  setPreview(key,blob,key+' · '+info.meshes+' meshes');
 }catch(err){notify?.('Could not preview model: '+err.message)}
}
async function selectPrefab(item){
 try{
  const blob=makeGLB(item.id),buffer=await blob.arrayBuffer();
  verifyGLB(buffer);
  const key='models/arcadia-'+item.id+'.glb';
  setPreview(key,blob,item.name+' · original 3D starter model');
 }catch(err){notify?.('Preview failed: '+err.message)}
}
async function addPrefab(item){
 try{
  const key='models/arcadia-'+item.id+'.glb',blob=makeGLB(item.id),buffer=await blob.arrayBuffer();
  verifyGLB(buffer);
  if(!put(key,await toData(blob),{name:item.name,source:'Arcadia Creator 3D Starter Kit',license:'Arcadia original',category:item.category}))return;
  setPreview(key,blob,item.name+' · ready to export');
  notify?.(item.name+' added to project models. It will be included in your ZIP.');
 }catch(err){notify?.('Adding model failed: '+err.message)}
}
async function importModel(file){
 if(!file)return;
 if(!/\.glb$/i.test(file.name)||file.size>MAX_GLB_BYTES)throw Error('Import a standalone .glb smaller than 1.25 MB.');
 const data=await file.arrayBuffer(),info=verifyGLB(data);
 const blob=new Blob([data],{type:'model/gltf-binary'}),encoded=await toData(blob);
 let key='models/'+safeFile(file.name),i=1;
 while(project.assets[key])key='models/'+i+++'-'+safeFile(file.name);
 const ok=put(key,encoded,{name:file.name,source:'User imported GLB',license:'Verify original source and attribution',category:'3D Model'});
 if(ok){setPreview(key,blob,key+' · '+info.meshes+' meshes · '+(file.size/1024).toFixed(0)+' KB');notify?.('Imported '+file.name+'. You can preview and export it; 3D gameplay support is a separate future milestone.')}
}
async function importZIP(file){
 if(!file)return;
 if(!global.JSZip)throw Error('ZIP importer unavailable.');
 if(!/\.zip$/i.test(file.name)||file.size>5*1024*1024)throw Error('Choose a ZIP smaller than 5 MB.');
 const archive=await global.JSZip.loadAsync(file,{checkCRC32:true});
 const entries=Object.values(archive.files).filter(x=>!x.dir);
 if(entries.length>1200)throw Error('ZIP contains too many files.');
 const query=(document.getElementById('three-zip-filter')?.value||'').toLowerCase().trim();
 const found=entries.filter(x=>/\.glb$/i.test(x.name)&&(!query||x.name.toLowerCase().includes(query))&&x._data?.uncompressedSize<=MAX_GLB_BYTES);
 if(!found.length)throw Error('No small, self-contained GLB files matched this pack.');
 let added=0,issues=0;
 for(const entry of found.slice(0,Math.min(5,MAX_ASSETS-Object.keys(project.assets||{}).length))){
  try{
   const bytes=await entry.async('uint8array');verifyGLB(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
   const keyName=safeFile(entry.name.split('/').pop()),blob=new Blob([bytes],{type:'model/gltf-binary'});
   let key='models/'+keyName,n=1;while(project.assets[key])key='models/'+n+++'-'+keyName;
   if(put(key,await toData(blob),{name:keyName,source:'Imported from '+file.name.slice(0,60),license:'Verify pack license',category:'3D Model'}))added++;
  }catch{issues++}
 }
 notify?.('Imported '+added+' GLB model(s). Skipped '+issues+' unsupported model(s). Use smaller files or convert to standalone GLB if necessary.');
 render();
}
function button(label,fn,kind='secondary'){
 const b=document.createElement('button');b.type='button';b.className='button '+kind;b.textContent=label;b.onclick=fn;return b;
}
function render(){
 if(!project)return;
 const node=document.getElementById('three-model-results');if(!node)return;
 const q=(document.getElementById('three-search')?.value||'').trim().toLowerCase();node.replaceChildren();
 const originals=filter==='all'||filter==='starter';
 if(originals)for(const item of prefabs.filter(i=>(i.name+' '+i.category).toLowerCase().includes(q))){
  const card=document.createElement('article');card.className='asset-card asset-pack';
  const art=document.createElement('div');art.className='asset-pack-icon';art.textContent=item.icon;
  const title=document.createElement('strong');title.textContent=item.name;
  const meta=document.createElement('small');meta.textContent='Original GLB · '+item.category;
  const actions=document.createElement('div');actions.className='asset-3d-card-actions';
  actions.append(button('Preview',()=>selectPrefab(item)),button(project.assets?.['models/arcadia-'+item.id+'.glb']?'✓ In project':'＋ Add GLB',()=>addPrefab(item),'primary'));
  card.append(art,title,meta,actions);node.append(card);
 }
 if(filter==='all'||filter==='imported'){
  for(const key of Object.keys(project.assets||{}).filter(k=>/^models\/.*\.glb$/i.test(k)&&k.toLowerCase().includes(q))){
   const card=document.createElement('article');card.className='asset-card asset-pack';
   const art=document.createElement('div');art.className='asset-pack-icon';art.textContent='◈';
   const title=document.createElement('strong');title.textContent=key.split('/').pop();
   const meta=document.createElement('small');meta.textContent=String(project.assetMeta?.[key]?.license||'Verify license');
   card.append(art,title,meta,button('Inspect 3D',()=>openAsset(key)));node.append(card);
  }
 }
 if(filter==='all'||filter==='packs')for(const pack of packs.filter(x=>(x.name+' '+x.source+' '+x.category).toLowerCase().includes(q))){
  const card=document.createElement('article');card.className='asset-card asset-pack';
  const art=document.createElement('div');art.className='asset-pack-icon';art.textContent=pack.icon;
  const title=document.createElement('strong');title.textContent=pack.name;
  const meta=document.createElement('small');meta.textContent=pack.source+' · '+pack.license+' · '+pack.category;
  const link=document.createElement('a');link.className='button secondary';link.href=pack.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open source ↗';
  card.append(art,title,meta,link);node.append(card);
 }
 if(!node.children.length){const info=document.createElement('p');info.className='hint';info.textContent='No matching models.';node.append(info)}
 const count=Object.keys(project.assets||{}).filter(k=>/^models\/.*\.glb$/i.test(k)).length;
 document.getElementById('three-count').textContent=count+' local GLB files · '+prefabs.length+' original 3D starters';
}
function init(){
 const input=document.getElementById('three-upload'),zip=document.getElementById('three-zip-upload');
 input?.addEventListener('change',async()=>{try{await importModel(input.files[0])}catch(err){notify?.(err.message)}finally{input.value=''}});
 zip?.addEventListener('change',async()=>{try{await importZIP(zip.files[0])}catch(err){notify?.(err.message)}finally{zip.value=''}});
 document.getElementById('three-search')?.addEventListener('input',render);
 document.querySelectorAll('[data-three-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.threeFilter;document.querySelectorAll('[data-three-filter]').forEach(x=>x.classList.toggle('active',x===btn));render()}));
 document.getElementById('three-download')?.addEventListener('click',async()=>{
  if(!selectedKey||!project?.assets?.[selectedKey]){notify?.('Add the selected starter model or select an imported model first.');return}
  const blob=blobFromData(project.assets[selectedKey]);const a=document.createElement('a'),u=URL.createObjectURL(blob);
  a.href=u;a.download=selectedKey.split('/').pop();document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
 });
}
function mount(p,opts={}){
 project=p;save=opts.save;notify=opts.notify;project.assets??={};project.assetMeta??={};render();
 const first=Object.keys(project.assets).find(k=>/^models\/.*\.glb$/.test(k));
 if(first)openAsset(first);else selectPrefab(prefabs[0]);
}
function unmount(){
 if(url)URL.revokeObjectURL(url);url=null;
 document.getElementById('three-model-viewer')?.removeAttribute('src');
 project=null;save=null;notify=null;selectedKey=null;
}
global.ArcadiaCreatorThreeD={mount,unmount,init,render,makeGLB,verifyGLB,prefabs,packs};
})(window);