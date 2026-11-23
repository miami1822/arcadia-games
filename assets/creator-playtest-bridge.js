/* Arcadia Creator's sandboxed, per-project Playtest bridge.
 * The preview iframe has an opaque origin. The host never trusts window messages
 * from that origin: only a dedicated MessagePort delivered to the current iframe
 * may request a small set of local SDK operations. Never expose Creator project data.
 */
(function(global){
'use strict';
const SDK_METHODS=new Set(['storage.save','storage.load','storage.remove','storage.list','scores.submit','scores.top','achievements.unlock','achievements.list']);
const ID_PATTERN=/^[a-z0-9][a-z0-9_-]{1,63}$/;
const MAX_REQUEST_BYTES=65536, MAX_SAVE_BYTES=49152;
const MAX_REQUESTS_WINDOW=60, WINDOW_MS=10000;
function isRecord(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
function asJSONSize(value){const json=JSON.stringify(value);if(json===undefined)throw Error('Invalid JSON payload');return json.length}
function safeId(value){return typeof value==='string'&&ID_PATTERN.test(value)&&!['__proto__','constructor','prototype'].includes(value)}
function safeError(err){return err instanceof Error?err.message:'Unable to process request'}
function namespace(projectId){if(typeof projectId!=='string'||!/^[a-z0-9-]{12,48}$/.test(projectId))throw Error('Invalid Creator project');return 'preview-'+projectId}
function operation(gameId,method,payload){
 if(!SDK_METHODS.has(method))throw Error('SDK method not allowed in Playtest');
 if(!isRecord(payload))throw Error('Invalid request payload');
 if(asJSONSize(payload)>MAX_REQUEST_BYTES)throw Error('Request exceeds the Playtest size limit');
 if(method==='storage.save'||method==='storage.load'||method==='storage.remove'){
  if(!safeId(payload.slot))throw Error('Invalid save slot');
  if(method==='storage.save'){
   if(asJSONSize(payload.value)>MAX_SAVE_BYTES)throw Error('Save exceeds 48 KB');
   const slots=global.ArcadiaSDK.localOperation(gameId,'storage.list',{});
   if(!slots.includes(payload.slot)&&slots.length>=16)throw Error('Maximum 16 Playtest save slots');
  }
 }
 if(method==='achievements.unlock'){if(!safeId(payload.id))throw Error('Invalid achievement ID');const unlocked=global.ArcadiaSDK.localOperation(gameId,'achievements.list',{});if(unlocked.length>=64&&!unlocked.some(item=>item.id===payload.id))throw Error('Maximum 64 Playtest achievements')}
 if(method==='achievements.unlock'&&payload.metadata!==undefined&&asJSONSize(payload.metadata)>4096)throw Error('Achievement metadata too large');
 if(method==='scores.submit'&&payload.metadata!==undefined&&asJSONSize(payload.metadata)>4096)throw Error('Score metadata too large');
 return global.ArcadiaSDK.localOperation(gameId,method,payload);
}
class ArcadiaCreatorPlaytestBridge{
 constructor({iframe,projectId,nonce,onChange=()=>{}}){
  if(!iframe||typeof nonce!=='string'||nonce.length<24)throw Error('Invalid Playtest bridge configuration');
  this.iframe=iframe;this.gameId=namespace(projectId);this.nonce=nonce;this.onChange=onChange;
  this.connected=false;this.events=[];this._port=null;this._closed=false;this._recent=[];
  this._onLoad=()=>this._attach();
  iframe.addEventListener('load',this._onLoad);
 }
 _attach(){
  if(this._closed)return;
  if(this._port){this._port.onmessage=null;this._port.close();this._port=null}
  this.connected=false;
  const frameWindow=this.iframe.contentWindow;
  if(!frameWindow||typeof MessageChannel!=='function'){this._emit('error','MessageChannel unavailable');return}
  const channel=new MessageChannel();
  this._port=channel.port1;
  channel.port1.onmessage=e=>this._receive(e.data);
  channel.port1.start();
  try{
   // targetOrigin="*" is mandatory for opaque sandbox origins. The private port,
   // current-frame window reference, and unpredictable nonce provide isolation.
   frameWindow.postMessage({__arcadiaPreview:1,protocol:1,type:'PORT',gameId:this.gameId,nonce:this.nonce},'*',[channel.port2]);
  }catch(err){channel.port1.close();this._port=null;this._emit('error',safeError(err))}
 }
 _emit(type,details){const e={type,details,time:new Date().toLocaleTimeString()};this.events.unshift(e);this.events.length=Math.min(this.events.length,16);this.onChange(e)}
 _receive(m){
  if(this._closed||!isRecord(m)||m.__arcadiaPreview!==1||m.protocol!==1||m.gameId!==this.gameId||m.nonce!==this.nonce)return;
  if(m.type==='CONNECTED'){this.connected=true;this._emit('connected','SDK bridge connected');return}
  if(m.type==='TEST_RESULT'){this._emit(m.ok?'test-passed':'test-failed',m.ok?'Saved, loaded, scored and unlocked through the sandbox':String(m.error||'SDK test failed'));return}
  if(m.type==='READY'||m.type==='SESSION'||m.type==='GAME_EVENT'){this._emit(m.type.toLowerCase(),m.type==='SESSION'?String(m.payload&&m.payload.action||'session'):m.type==='GAME_EVENT'?String(m.payload&&m.payload.name||'event'):'Game ready');return}
  if(m.type!=='REQUEST'||!Number.isSafeInteger(m.requestId)||m.requestId<1)return;
  const now=Date.now();this._recent=this._recent.filter(t=>now-t<WINDOW_MS);this._recent.push(now);
  let result,ok=true,error;
  try{
   if(this._recent.length>MAX_REQUESTS_WINDOW)throw Error('Playtest request limit reached');
   result=operation(this.gameId,m.method,m.payload);
  }catch(err){ok=false;error=safeError(err)}
  try{this._port.postMessage({__arcadiaPreview:1,protocol:1,gameId:this.gameId,nonce:this.nonce,type:'RESPONSE',requestId:m.requestId,ok,result,error})}catch{}
  if(ok&&['storage.save','storage.remove','scores.submit','achievements.unlock'].includes(m.method))this._emit('data',m.method);
 }
 runTest(){
  if(!this.connected||!this._port)return false;
  this._port.postMessage({__arcadiaPreview:1,protocol:1,gameId:this.gameId,type:'RUN_TEST',nonce:this.nonce});
  return true;
 }
 snapshot(){
  const get=(method,payload={})=>operation(this.gameId,method,payload);
  return {saves:get('storage.list'),scores:get('scores.top',{limit:5}),achievements:get('achievements.list')};
 }
 clear(){
  const key='arcadia:v1:'+this.gameId+':';
  ['saves','scores','achievements'].forEach(part=>global.localStorage.removeItem(key+part));
  this._emit('data','Cleared this project’s SDK test data');
 }
 destroy(){
  this._closed=true;this.iframe.removeEventListener('load',this._onLoad);
  if(this._port){this._port.onmessage=null;this._port.close();this._port=null}
  this.connected=false;
 }
}
global.ArcadiaCreatorPlaytestBridge=ArcadiaCreatorPlaytestBridge;
})(window);
