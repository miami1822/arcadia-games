/* Sprite Sheet Cutter for Arcadia Creator: turn imported sheets into real usable 2D sprites. */
(function(global){
'use strict';
let project=null,save=null,notify=null;
function validateDimensions(width,height,count){
 if(![width,height,count].every(Number.isSafeInteger)||width<8||height<8||width>512||height>512||count<1||count>16)throw Error('Frames must be 8–512 px, with 1–16 frames per batch.');
}
async function slice(file,frameWidth,frameHeight,count){
 validateDimensions(frameWidth,frameHeight,count);
 if(!file||!/\.(png|jpe?g|webp)$/i.test(file.name)||!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('Select a PNG, JPEG, or WebP sprite sheet.');
 if(file.size>2*1024*1024)throw Error('Sprite sheets must be under 2 MB.');
 const object=URL.createObjectURL(file),image=new Image();
 try{
  const loaded=await new Promise((resolve,reject)=>{
   image.onload=()=>resolve(image);image.onerror=()=>reject(Error('The sprite sheet could not be read.'));
   image.src=object;
  });
  if(image.naturalWidth>4096||image.naturalHeight>4096)throw Error('Maximum sprite sheet resolution is 4096 × 4096.');
  const columns=Math.floor(image.naturalWidth/frameWidth),rows=Math.floor(image.naturalHeight/frameHeight);
  if(!columns||!rows)throw Error('Frame size must fit inside the image.');
  const available=columns*rows,usable=Math.min(count,available);
  if(Object.keys(project.assets||{}).length+usable>32)throw Error('Project maximum is 32 assets. Remove some before slicing.');
  const base=file.name.replace(/\.(png|jpe?g|webp)$/i,'').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,45)||'sheet';
  const canvas=document.createElement('canvas');canvas.width=frameWidth;canvas.height=frameHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:false});if(!ctx)throw Error('Canvas is unavailable.');
  ctx.imageSmoothingEnabled=false;
  const frames=[];
  for(let i=0;i<usable;i++){
   const x=(i%columns)*frameWidth,y=Math.floor(i/columns)*frameHeight;
   ctx.clearRect(0,0,frameWidth,frameHeight);ctx.drawImage(loaded,x,y,frameWidth,frameHeight,0,0,frameWidth,frameHeight);
   const data=canvas.toDataURL('image/png');
   if(data.length>350*1024)throw Error('An individual frame exceeds 350 KB. Reduce frame dimensions.');
   const name=base+'-frame-'+String(i+1).padStart(2,'0')+'.png';
   let key='sprites/'+name,n=1;while(project.assets[key])key='sprites/'+n+++'-'+name;
   frames.push({key,data,name});
  }
  const currentBytes=JSON.stringify(project).length,extraBytes=frames.reduce((n,f)=>n+f.data.length,0);
  if(currentBytes+extraBytes>4_200_000)throw Error('Browser project is near its storage limit. Export a backup or reduce imported sprites.');
  project.assetMeta??={};
  for(const frame of frames){project.assets[frame.key]=frame.data;project.assetMeta[frame.key]={name:frame.name,source:'Frames from '+file.name.slice(0,70),license:'Verify sprite sheet license',category:'2D sprite sheet'}}
  save?.(project);
  notify?.('Imported '+frames.length+' usable 2D frame(s). Select a scene object and apply them from Original sprites / My imports.');
  return frames.length;
 }finally{URL.revokeObjectURL(object)}
}
function init(){
 const button=document.getElementById('sheet-import');
 button?.addEventListener('click',async()=>{
  const file=document.getElementById('sheet-upload')?.files?.[0];
  const status=document.getElementById('sheet-status');
  const w=Number(document.getElementById('sheet-width')?.value),h=Number(document.getElementById('sheet-height')?.value),count=Number(document.getElementById('sheet-count')?.value);
  if(!project){if(status)status.textContent='Open an Arcadia project first.';return}
  button.disabled=true;if(status)status.textContent='Cutting frames…';
  try{const total=await slice(file,w,h,count);if(status)status.textContent=total+' frames added to this project.';global.ArcadiaCreatorAssets?.render()}catch(e){if(status)status.textContent='Could not slice: '+e.message;notify?.(e.message)}
  finally{button.disabled=false}
 });
}
function mount(p,opts={}){project=p;save=opts.save;notify=opts.notify}
function unmount(){project=null;save=null;notify=null}
global.ArcadiaCreatorSpritesheet={mount,unmount,init,validateDimensions,slice};
})(window);