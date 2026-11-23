/* Arcadia fullscreen controls. Uses the browser API first; embedded environments may disallow it. */
(function(){
"use strict";
function mount({button,stage,message}){
 if(!button||!stage)return;
 const write=(text)=>{if(message){message.textContent=text;message.hidden=!text;}};
 const sync=()=>{const active=!!document.fullscreenElement,wide=stage.classList.contains("arcadia-theater");button.textContent=active?"⤢ Exit fullscreen":wide?"⤢ Exit theater":"⛶ Fullscreen";button.setAttribute("aria-pressed",String(active||wide));};
 button.addEventListener("click",async()=>{
  if(document.fullscreenElement){try{await document.exitFullscreen();write("");}catch{write("Unable to exit fullscreen. Press Esc.")}sync();return;}
  if(stage.classList.contains("arcadia-theater")){stage.classList.remove("arcadia-theater");write("");sync();return;}
  // Fullscreen the player shell, not the embedded game, so the exit control remains visible.
  try{
   if(typeof stage.requestFullscreen!=="function"||document.fullscreenEnabled===false)throw new Error("Fullscreen unavailable");
   await stage.requestFullscreen({navigationUI:"hide"});
   write("");
  }catch{
   stage.classList.add("arcadia-theater");
   write("This embed doesn't permit browser fullscreen. Expanded player mode is active instead.");
  }
  sync();
 });
 document.addEventListener("fullscreenchange",sync);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&stage.classList.contains("arcadia-theater")){stage.classList.remove("arcadia-theater");write("");sync();}});
 sync();
}
window.ArcadiaFullscreen={mount};
})();
