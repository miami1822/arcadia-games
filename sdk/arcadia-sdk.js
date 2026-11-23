/* Arcadia Game SDK v0.1.0 — no external dependencies.
 * Anonymous local-first adapter; this release does NOT claim remote accounts/cloud saves.
 * Usage: const arcadia = new ArcadiaSDK({gameId:'my-game', version:'1.0.0', allowedParentOrigins:[location.origin]});
 */
(function(global){
'use strict';
const PROTOCOL=1, PREFIX='arcadia:v1:', MAX_SCORE=100000000;
const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_-]{1,63}$/.test(id);
const copy=obj=>JSON.parse(JSON.stringify(obj));
function storageKey(gameId,collection){return PREFIX+gameId+':'+collection}
function read(gameId,collection,fallback){try{const v=JSON.parse(global.localStorage.getItem(storageKey(gameId,collection)));return v===null?copy(fallback):v}catch{return copy(fallback)}}
function write(gameId,collection,value){global.localStorage.setItem(storageKey(gameId,collection),JSON.stringify(value));return true}
function localOperation(gameId,method,payload){
 const {slot,value,id,metadata,score,limit,mode}=payload||{};
 switch(method){
 case 'storage.save': {if(!validId(slot))throw Error('Invalid save slot');const data=read(gameId,'saves',{});data[slot]={value:copy(value),updatedAt:new Date().toISOString()};write(gameId,'saves',data);return {slot,updatedAt:data[slot].updatedAt,storage:'local'}}
 case 'storage.load': {if(!validId(slot))throw Error('Invalid save slot');const data=read(gameId,'saves',{});return data[slot]?copy(data[slot].value):null}
 case 'storage.remove': {if(!validId(slot))throw Error('Invalid save slot');const data=read(gameId,'saves',{});delete data[slot];write(gameId,'saves',data);return true}
 case 'storage.list':return Object.keys(read(gameId,'saves',{}));
 case 'scores.submit': {if(!Number.isFinite(score)||score<0||score>MAX_SCORE)throw Error('Invalid score');const list=read(gameId,'scores',[]);const record={score:Math.floor(score),mode:typeof mode==='string'?mode.slice(0,48):'default',metadata:metadata||{},createdAt:new Date().toISOString(),id:Math.random().toString(36).slice(2,12)};list.push(record);list.sort((a,b)=>b.score-a.score);write(gameId,'scores',list.slice(0,100));return {record,rank:list.findIndex(e=>e.id===record.id)+1,storage:'local'}}
 case 'scores.top':return read(gameId,'scores',[]).slice(0,Math.max(1,Math.min(100,Number(limit)||10)));
 case 'achievements.unlock': {if(!validId(id))throw Error('Invalid achievement id');const all=read(gameId,'achievements',{});if(!all[id]){all[id]={id,metadata:metadata||{},unlockedAt:new Date().toISOString()};write(gameId,'achievements',all)}return copy(all[id])}
 case 'achievements.list':return Object.values(read(gameId,'achievements',{}));
 default:throw Error('Unsupported SDK operation: '+method);
 }
}
class ArcadiaSDK{
 constructor({gameId,version='1.0.0',allowedParentOrigins=[]}={}){
  if(!validId(gameId))throw Error('ArcadiaSDK requires a gameId: 2-64 lowercase letters, digits, hyphens, or underscores');
  this.gameId=gameId;this.version=version;this.protocol=PROTOCOL;this.connected=false;this.capabilities={storage:'local',scores:'local',achievements:'local',accounts:false};this._id='ac_'+Math.random().toString(36).slice(2,12);this._counter=0;this._manifest=null;this._pending=new Map();this._handlers=new Map();this._allowed=new Set(allowedParentOrigins.filter(o=>typeof o==='string'&&o!=='*'&&o!=='null'));
  this._parent=global.parent!==global?global.parent:null;
  this._messageHandler=e=>this._receive(e);global.addEventListener('message',this._messageHandler);
  if(this._parent&&this._allowed.size)queueMicrotask(()=>this._hello());
  this.storage={save:(slot,value)=>this._rpc('storage.save',{slot,value}),load:slot=>this._rpc('storage.load',{slot}),remove:slot=>this._rpc('storage.remove',{slot}),list:()=>this._rpc('storage.list',{})};
  this.scores={submit:(score,{mode='default',metadata={}}={})=>this._rpc('scores.submit',{score,mode,metadata}),top:(limit=10)=>this._rpc('scores.top',{limit})};
  this.achievements={unlock:(id,metadata={})=>this._rpc('achievements.unlock',{id,metadata}),list:()=>this._rpc('achievements.list',{})};
  this.session={start:()=>this._notify('SESSION',{action:'start'}),pause:()=>this._notify('SESSION',{action:'pause'}),resume:()=>this._notify('SESSION',{action:'resume'}),end:(details={})=>this._notify('SESSION',{action:'end',details})};
  this.ui={fullscreen:()=>{const el=global.document.documentElement;if(!global.document.fullscreenElement&&el.requestFullscreen)return el.requestFullscreen().catch(()=>{this._notify('FULLSCREEN_REQUEST',{});return false});if(global.document.fullscreenElement&&global.document.exitFullscreen)return global.document.exitFullscreen();return Promise.resolve(false)},exitFullscreen:()=>global.document.exitFullscreen?.()||Promise.resolve(false)};
 }
 _send(type,other={}){if(!this._parent)return;for(const origin of this._allowed){this._parent.postMessage({__arcadia:1,protocol:PROTOCOL,type,gameId:this.gameId,channelId:this._id,...other},origin)}}
 _hello(){this._send('HELLO',{version:this.version})}
 _receive(e){if(!this._parent||e.source!==this._parent||!this._allowed.has(e.origin))return;const m=e.data;if(!m||m.__arcadia!==1||m.protocol!==PROTOCOL||m.channelId!==this._id||m.gameId!==this.gameId)return;
  if(m.type==='WELCOME'){this.connected=true;this.capabilities={...this.capabilities,...(m.capabilities||{})};this._dispatch('connected',{capabilities:this.capabilities});if(this._manifest)this._notify('READY',{manifest:this._manifest});return}
  if(m.type==='RESPONSE'){const pending=this._pending.get(m.requestId);if(!pending)return;clearTimeout(pending.timer);this._pending.delete(m.requestId);if(m.ok)pending.resolve(m.result);else pending.reject(Error(m.error||'Arcadia host request failed'));return}
  if(m.type==='EVENT'&&typeof m.name==='string')this._dispatch(m.name,m.data||{});
 }
 async _rpc(method,payload){if(!this.connected)return localOperation(this.gameId,method,payload);const requestId=++this._counter;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this._pending.delete(requestId);reject(Error('Arcadia host timed out'))},4000);this._pending.set(requestId,{resolve,reject,timer});this._send('REQUEST',{requestId,method,payload})})}
 _notify(type,payload){this._send(type,payload);return true}
 ready(manifest={}){this._manifest={title:String(manifest.title||this.gameId).slice(0,128),features:Array.isArray(manifest.features)?manifest.features:[]};if(this.connected)this._notify('READY',{manifest:this._manifest});return this}
 on(event,fn){if(typeof fn!=='function')throw Error('Callback must be a function');const set=this._handlers.get(event)||new Set();set.add(fn);this._handlers.set(event,set);return()=>this.off(event,fn)}
 off(event,fn){this._handlers.get(event)?.delete(fn)}
 emit(name,data={}){if(typeof name!=='string'||name.length>90)throw Error('Invalid event name');this._notify('GAME_EVENT',{name,data})}
 _dispatch(name,data){for(const cb of this._handlers.get(name)||[]){try{cb(data)}catch(e){console.error('Arcadia event listener failed',e)}}}
 getEnvironment(){return {gameId:this.gameId,version:this.version,protocol:PROTOCOL,connected:this.connected,capabilities:{...this.capabilities}}}
 destroy(){global.removeEventListener('message',this._messageHandler);for(const p of this._pending.values()){clearTimeout(p.timer);p.reject(Error('SDK destroyed'))}this._pending.clear();this._handlers.clear()}
}
ArcadiaSDK.version='0.1.0';ArcadiaSDK.localOperation=localOperation;
global.ArcadiaSDK=ArcadiaSDK;
})(window);
