/* Arcadia responsive player fullscreen + embedded fallback */
(()=>{"use strict";
function mount({button,stage,message}){
 if(!button||!stage)return;
 const write=t=>{if(message){message.textContent=t;message.hidden=!t}};
 const active=()=>document.fullscreenElement===stage;
 const sync=()=>{const expanded=stage.classList.contains("arcadia-theater");const on=active()||expanded;button.textContent=on?"⤢ Exit fullscreen":"⛶ Fullscreen";button.setAttribute("aria-pressed",String(on));document.body.classList.toggle("arcadia-player-expanded",on)};
 button.addEventListener("click",async()=>{
  if(active()){try{await document.exitFullscreen()}catch{write("Press Esc to exit fullscreen.")}sync();return}
  if(stage.classList.contains("arcadia-theater")){stage.classList.remove("arcadia-theater");write("");sync();return}
  try{
   if(!stage.requestFullscreen||document.fullscreenEnabled===false)throw Error("Fullscreen is restricted");
   await stage.requestFullscreen({navigationUI:"hide"});write("");
  }catch(e){stage.classList.add("arcadia-theater");write("Browser fullscreen is restricted here; expanded player mode is active.");}
  sync();
 });
 document.addEventListener("fullscreenchange",sync);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&stage.classList.contains("arcadia-theater")){stage.classList.remove("arcadia-theater");write("");sync()}});
 sync();
}
window.ArcadiaFullscreen={mount};
})();
