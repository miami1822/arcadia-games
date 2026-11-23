/* Arcadia Host Adapter v0.1.0.
 * Attach to a trusted iframe; origin is checked before any local operation.
 * The demo hosts its own first-party games, never untrusted community code.
 */
(function(global){'use strict';
class ArcadiaHost {
 constructor(iframe,{gameId,onEvent=()=>{}}={}){if(!iframe||!gameId)throw Error('Need iframe and gameId');this.iframe=iframe;this.gameId=gameId;this.onEvent=onEvent;this.channelId=null;this.origin=global.location.origin;this._handler=e=>this._receive(e);global.addEventListener('message',this._handler)}
 _receive(e){if(e.source!==this.iframe.contentWindow||e.origin!==this.origin)return;const m=e.data;if(!m||m.__arcadia!==1||m.protocol!==1||m.gameId!==this.gameId||typeof m.channelId!=='string')return;
 if(m.type==='HELLO'){this.channelId=m.channelId;this._post({type:'WELCOME',capabilities:{storage:'local',scores:'local',achievements:'local',accounts:false}});this.onEvent({type:'connected',gameId:this.gameId});return}
 if(m.channelId!==this.channelId)return;
 if(m.type==='REQUEST'){let result,error,ok=true;try{result=global.ArcadiaSDK.localOperation(this.gameId,m.method,m.payload||{})}catch(e){ok=false;error=e.message}this._post({type:'RESPONSE',requestId:m.requestId,ok,result,error});if(ok&&['scores.submit','achievements.unlock'].includes(m.method))this.onEvent({type:m.method,gameId:this.gameId,payload:m.payload,result});return}
 if(['READY','SESSION','GAME_EVENT','FULLSCREEN_REQUEST'].includes(m.type)){this.onEvent({type:m.type,gameId:this.gameId,details:m});if(m.type==='FULLSCREEN_REQUEST')this.iframe.requestFullscreen?.().catch(()=>{})}
 }
 _post(obj){if(!this.channelId)return;this.iframe.contentWindow?.postMessage({__arcadia:1,protocol:1,gameId:this.gameId,channelId:this.channelId,...obj},this.origin)}
 sendEvent(name,data={}){this._post({type:'EVENT',name,data})}
 destroy(){global.removeEventListener('message',this._handler);this.channelId=null}
}
global.ArcadiaHost=ArcadiaHost;
})(window);
