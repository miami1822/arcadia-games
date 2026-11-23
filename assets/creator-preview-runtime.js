/* SDK bootstrap for Creator's opaque-origin preview and self-contained exports. */
(function(global){
'use strict';
function quote(value){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}
function inline(source){return String(source).replace(/<\/script/gi,'<\\/script')}
function header(html,script){
 const tag='<script>'+inline(script)+'</script>';
 if(/<head\b[^>]*>/i.test(html))return html.replace(/<head\b[^>]*>/i,m=>m+tag);
 if(/<html\b[^>]*>/i.test(html))return html.replace(/<html\b[^>]*>/i,m=>m+'<head>'+tag+'</head>');
 return '<!doctype html><html><head>'+tag+'</head><body>'+html+'</body></html>';
}
function gameIdFor(project,prefix){if(typeof project!=='string'||!/^[a-z0-9-]{12,48}$/.test(project))throw Error('Invalid Creator project ID');return prefix+project}
function previewBootstrap(config){
 'use strict';
 const gameId=config.gameId,nonce=config.nonce;
 const sdk=new ArcadiaSDK({gameId,previewMode:true});
 window.arcadiaGame=sdk;
 sdk.ready({title:config.title,features:['storage','scores','achievements','sessions']});
 const expectedOrigin=(()=>{try{return new URL(document.referrer).origin}catch{return null}})();
 const accept=function(event){
  if(event.source!==window.parent||!event.ports||event.ports.length!==1)return;
  if(expectedOrigin&&event.origin!==expectedOrigin)return;
  const m=event.data;
  if(!m||m.__arcadiaPreview!==1||m.protocol!==1||m.type!=='PORT'||m.gameId!==gameId||m.nonce!==nonce)return;
  window.removeEventListener('message',accept);
  const port=event.ports[0];
  sdk.attachPreviewPort(port,nonce);
  port.postMessage({__arcadiaPreview:1,protocol:1,gameId,nonce,type:'CONNECTED'});
  port.addEventListener('message',async e=>{
   const request=e.data;
   if(!request||request.__arcadiaPreview!==1||request.protocol!==1||request.gameId!==gameId||request.nonce!==nonce||request.type!=='RUN_TEST')return;
   try{
    await sdk.storage.save('sdk-test',{level:2,stars:3});
    const loaded=await sdk.storage.load('sdk-test');
    if(!loaded||loaded.level!==2)throw Error('Save/load mismatch');
    await sdk.achievements.unlock('sdk-ready',{description:'Playtest API check'});
    await sdk.scores.submit(250,{mode:'playtest'});
    port.postMessage({__arcadiaPreview:1,protocol:1,gameId,nonce,type:'TEST_RESULT',ok:true});
   }catch(error){
    port.postMessage({__arcadiaPreview:1,protocol:1,gameId,nonce,type:'TEST_RESULT',ok:false,error:String(error&&error.message||error)});
   }
  });
 };
 window.addEventListener('message',accept);
}
function standaloneBootstrap(config){
 if(!window.arcadiaGame){
  window.arcadiaGame=new ArcadiaSDK({gameId:config.gameId});
  window.arcadiaGame.ready({title:config.title,features:['storage','scores','achievements','sessions']});
 }
}
function buildPreview(html,{sdkSource,projectId,nonce,title}){
 if(!sdkSource||typeof nonce!=='string'||nonce.length<24)throw Error('Playtest runtime unavailable');
 const gameId=gameIdFor(projectId,'preview-');
 const bootstrap='('+previewBootstrap.toString()+')('+quote({gameId,nonce,title})+');';
 return header(html,inline(sdkSource)+'\n'+bootstrap);
}
function buildStandalone(html,{sdkSource,projectId,title}){
 if(!sdkSource)throw Error('SDK unavailable');
 const gameId=gameIdFor(projectId,'game-');
 const bootstrap='('+standaloneBootstrap.toString()+')('+quote({gameId,title})+');';
 return header(html,inline(sdkSource)+'\n'+bootstrap);
}
global.ArcadiaCreatorRuntime={preview:buildPreview,standalone:buildStandalone,previewGameId:project=>gameIdFor(project,'preview-')};
})(window);
