/* Run with: node --test tests/creator-sdk-bridge.test.cjs */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function source(p){return fs.readFileSync(path.join(root,p),'utf8')}
function browser(){
 const values=new Map(), listeners=new Map();
 const w={
  localStorage:{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)},
  addEventListener:(name,cb)=>{const l=listeners.get(name)||new Set();l.add(cb);listeners.set(name,l)},
  removeEventListener:(name,cb)=>listeners.get(name)?.delete(cb),
  parent:null,document:{documentElement:{}},
  location:{origin:'https://arcadia.example'},console
 };
 w.parent=w;
 const context=vm.createContext({window:w,console,setTimeout,clearTimeout,queueMicrotask,Math,Date,JSON,Promise,MessageChannel:class {}});
 for(const p of ['sdk/arcadia-sdk.js','assets/creator-playtest-bridge.js','assets/creator-preview-runtime.js']){
  vm.runInContext(source(p),context,{filename:p});
 }
 return {w,values};
}
const project='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const nonce='0123456789abcdef0123456789abcdef';
test('SDK local operations remain backward compatible',async()=>{
 const {w}=browser();
 const api=new w.ArcadiaSDK({gameId:'sample-game'});
 await api.storage.save('slot-1',{level:3});
 assert.equal((await api.storage.load('slot-1')).level,3);
 assert.equal((await api.scores.submit(500)).record.score,500);
 assert.equal((await api.achievements.unlock('first-win')).id,'first-win');
 api.destroy();
});
test('private port supports sandbox save/load, score, achievement and clear',async()=>{
 const {w,values}=browser();
 const frame={addEventListener(){},removeEventListener(){}};
 const host=new w.ArcadiaCreatorPlaytestBridge({iframe:frame,projectId:project,nonce});
 const gameId='preview-'+project;
 const client=new w.ArcadiaSDK({gameId,previewMode:true});
 const posted=[];
 const port={onmessage:null,start(){},close(){},postMessage:m=>queueMicrotask(()=>host._receive(m))};
 host._port={onmessage:null,close(){},postMessage:m=>{posted.push(m);queueMicrotask(()=>port.onmessage({data:m}))}};
 client.attachPreviewPort(port,nonce);
 const slot=await client.storage.save('slot-one',{level:7});
 assert.equal(slot.storage,'local');
 assert.equal((await client.storage.load('slot-one')).level,7);
 assert.equal((await client.scores.submit(950)).record.score,950);
 await client.achievements.unlock('first-win');
 const snap=host.snapshot();
 assert.equal(snap.saves.length,1);
 assert.equal(snap.scores[0].score,950);
 assert.equal(snap.achievements[0].id,'first-win');
 const before=posted.length;
 host._receive({__arcadiaPreview:1,protocol:1,type:'REQUEST',gameId,nonce:'wrong',requestId:999,method:'storage.list',payload:{}});
 assert.equal(posted.length,before,'wrong nonce was ignored');
 await assert.rejects(client._rpc('projects.read',{}),/not allowed/i);
 await assert.rejects(client.storage.save('oversized',{bytes:'x'.repeat(50000)}),/48 KB/i);
 assert([...values.keys()].every(k=>k.startsWith('arcadia:v1:'+gameId+':')));
 const second=new w.ArcadiaCreatorPlaytestBridge({iframe:frame,projectId:'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',nonce});
 assert.equal(second.snapshot().saves.length,0,'other project cannot see saved data');
 host.clear();
 assert.equal(host.snapshot().scores.length,0);
 assert.equal(host.snapshot().achievements.length,0);
 assert.equal(host.snapshot().saves.length,0);
 client.destroy();host.destroy();second.destroy();
});
test('injected SDK scripts parse, remain sandbox-compatible and escape titles',()=>{
 const {w}=browser();
 const sdkSource=source('sdk/arcadia-sdk.js');
 const raw='<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'"></head><body><script>window.gameLoaded=true;</script></body></html>';
 const opts={sdkSource,projectId:project,nonce,title:'Title </script><h1>unsafe</h1>'};
 const preview=w.ArcadiaCreatorRuntime.preview(raw,opts);
 const standalone=w.ArcadiaCreatorRuntime.standalone(raw,opts);
 for(const doc of [preview,standalone]){
  const scripts=[...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,2);
  for(const [,script] of scripts)assert.doesNotThrow(()=>new vm.Script(script));
  assert(!doc.includes('<h1>unsafe</h1>'),'title injection was escaped');
 }
 assert(preview.includes('preview-'+project));
 assert(standalone.includes('game-'+project));
});
