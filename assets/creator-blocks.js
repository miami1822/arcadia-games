/* Arcadia Creator Block Studio: Blockly 13.5.0 + custom game logic. */
(function(global){
'use strict';
let workspace=null, activeProject=null, changeCallback=null, loading=false, timer=null, installed=false;
const text=(v)=>JSON.stringify(String(v));
function block(type,message,args,color,hat=false,output=false){
 const definition={type,message0:message,args0:args||[],colour:color,tooltip:message.replace(/%[0-9]+/g,'').trim()};
 if(output)definition.output=null;
 else if(!hat){definition.previousStatement=null;definition.nextStatement=null}
 return definition;
}
function define(){
 if(installed)return;
 if(!global.Blockly||!global.javascript||!global.javascript.javascriptGenerator)throw Error('Blockly scripts have not loaded.');
 const Blockly=global.Blockly, gen=global.javascript.javascriptGenerator;
 const value=(b,g,n,fallback)=>g.valueToCode(b,n,g.ORDER_NONE)||fallback;
 const statement=(b,g)=>g.statementToCode(b,'DO')||'';
 const def=[
  block('ac_start','when game starts %1',[{type:'input_statement',name:'DO'}],285,true),
  block('ac_update','every frame %1',[{type:'input_statement',name:'DO'}],285,true),
  block('ac_collect','when a coin is collected %1',[{type:'input_statement',name:'DO'}],285,true),
  block('ac_hit','when player hits a hazard %1',[{type:'input_statement',name:'DO'}],285,true),
  block('ac_finish','when level finishes %1',[{type:'input_statement',name:'DO'}],285,true),
  block('ac_key','when key %1 is pressed %2',[{type:'field_dropdown',name:'KEY',options:[['Space',' '],['Left','arrowleft'],['Right','arrowright'],['Up','arrowup'],['A','a'],['D','d'],['W','w']]},{type:'input_statement',name:'DO'}],285,true),
  block('ac_move','move player X %1 Y %2',[{type:'input_value',name:'X',check:'Number'},{type:'input_value',name:'Y',check:'Number'}],235),
  block('ac_jump','jump strength %1',[{type:'input_value',name:'N',check:'Number'}],235),
  block('ac_speed','set movement speed %1',[{type:'input_value',name:'N',check:'Number'}],235),
  block('ac_gravity','set gravity %1',[{type:'input_value',name:'N',check:'Number'}],235),
  block('ac_color','set player color %1',[{type:'field_dropdown',name:'COLOR',options:[['Purple','#a68bff'],['Blue','#60a5fa'],['Green','#34d399'],['Red','#fb7185'],['Yellow','#fbbf24'],['White','#ffffff']]}],165),
  block('ac_message','show message %1',[{type:'input_value',name:'TEXT'}],165),
  block('ac_spawn','spawn coin at x %1 y %2',[{type:'input_value',name:'X',check:'Number'},{type:'input_value',name:'Y',check:'Number'}],175),
  block('ac_score_add','change score by %1',[{type:'input_value',name:'N',check:'Number'}],38),
  block('ac_score_set','set score to %1',[{type:'input_value',name:'N',check:'Number'}],38),
  block('ac_unlock','unlock achievement %1',[{type:'field_input',name:'ID',text:'first-win'}],38),
  block('ac_save','save game slot %1',[{type:'field_input',name:'SLOT',text:'progress'}],38),
  block('ac_sound','play sound %1',[{type:'field_dropdown',name:'SOUND',options:[['Coin','coin'],['Jump','jump'],['Win','win'],['Hit','hit']]}],105),
  block('ac_play_audio','play audio asset %1',[{type:'field_input',name:'PATH',text:'audio/arcadia-coin.wav'}],105),
  block('ac_music_loop','loop music asset %1',[{type:'field_input',name:'PATH',text:'audio/arcadia-ambient-pulse.wav'}],105),
  block('ac_music_stop','stop background music',[],105),
  block('ac_is_key','key %1 held?',[{type:'field_dropdown',name:'KEY',options:[['Space',' '],['Left','arrowleft'],['Right','arrowright'],['Up','arrowup'],['A','a'],['D','d']]}],210,false,true),
  block('ac_score','current score',[],38,false,true),
  block('ac_player_x','player X',[],235,false,true),
  block('ac_player_y','player Y',[],235,false,true)
 ];
 Blockly.defineBlocksWithJsonArray(def);
 const on={ac_start:'start',ac_update:'update',ac_collect:'collect',ac_hit:'hit',ac_finish:'finish'};
 for(const [type,event] of Object.entries(on)){gen.forBlock[type]=(b,g)=>'ArcadiaLogic.on('+text(event)+', function(){\n'+statement(b,g)+'});\n'}
 gen.forBlock.ac_key=(b,g)=>'ArcadiaLogic.on('+text('key:'+b.getFieldValue('KEY'))+', function(){\n'+statement(b,g)+'});\n';
 gen.forBlock.ac_move=(b,g)=>'ArcadiaLogic.move('+value(b,g,'X','0')+','+value(b,g,'Y','0')+');\n';
 gen.forBlock.ac_jump=(b,g)=>'ArcadiaLogic.jump('+value(b,g,'N','12')+');\n';
 gen.forBlock.ac_speed=(b,g)=>'ArcadiaLogic.setSpeed('+value(b,g,'N','4')+');\n';
 gen.forBlock.ac_gravity=(b,g)=>'ArcadiaLogic.setGravity('+value(b,g,'N','0.5')+');\n';
 gen.forBlock.ac_color=b=>'ArcadiaLogic.setColor('+text(b.getFieldValue('COLOR'))+');\n';
 gen.forBlock.ac_message=(b,g)=>'ArcadiaLogic.message('+value(b,g,'TEXT','""')+');\n';
 gen.forBlock.ac_spawn=(b,g)=>'ArcadiaLogic.spawnCoin('+value(b,g,'X','300')+','+value(b,g,'Y','200')+');\n';
 gen.forBlock.ac_score_add=(b,g)=>'ArcadiaLogic.addScore('+value(b,g,'N','10')+');\n';
 gen.forBlock.ac_score_set=(b,g)=>'ArcadiaLogic.setScore('+value(b,g,'N','0')+');\n';
 gen.forBlock.ac_unlock=b=>'ArcadiaLogic.unlock('+text(b.getFieldValue('ID'))+');\n';
 gen.forBlock.ac_save=b=>'ArcadiaLogic.save('+text(b.getFieldValue('SLOT'))+');\n';
 gen.forBlock.ac_sound=b=>'ArcadiaLogic.sound('+text(b.getFieldValue('SOUND'))+');\n';
 gen.forBlock.ac_play_audio=b=>'ArcadiaLogic.playAudio('+text(b.getFieldValue('PATH'))+');\n';
 gen.forBlock.ac_music_loop=b=>'ArcadiaLogic.playMusic('+text(b.getFieldValue('PATH'))+');\n';
 gen.forBlock.ac_music_stop=()=>'ArcadiaLogic.stopMusic();\n';
 gen.forBlock.ac_is_key=(b,g)=>['ArcadiaLogic.isKeyDown('+text(b.getFieldValue('KEY'))+')',g.ORDER_FUNCTION_CALL];
 gen.forBlock.ac_score=(b,g)=>['ArcadiaLogic.score()',g.ORDER_FUNCTION_CALL];
 gen.forBlock.ac_player_x=(b,g)=>['ArcadiaLogic.playerX()',g.ORDER_FUNCTION_CALL];
 gen.forBlock.ac_player_y=(b,g)=>['ArcadiaLogic.playerY()',g.ORDER_FUNCTION_CALL];
 // All Blockly standard loops get an upper bound in the sandbox, preventing most accidental infinite loops.
 gen.INFINITE_LOOP_TRAP='if (++window.__arcadiaBlockIterations > 15000) throw Error("Block loop limit reached");\n';
 installed=true;
}
const toolbox={kind:'categoryToolbox',contents:[
 {kind:'category',name:'⚡ Events',colour:'#b174fa',contents:['ac_start','ac_update','ac_collect','ac_hit','ac_finish','ac_key'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'↗ Motion',colour:'#60a5fa',contents:['ac_move','ac_jump','ac_speed','ac_gravity','ac_is_key','ac_player_x','ac_player_y'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'✦ Looks & Effects',colour:'#d58ae5',contents:['ac_color','ac_message','ac_spawn'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'★ Scores & Saves',colour:'#f0ba55',contents:['ac_score_add','ac_score_set','ac_score','ac_unlock','ac_save'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'♫ Sound',colour:'#e183b6',contents:['ac_sound','ac_play_audio','ac_music_loop','ac_music_stop'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'⌛ Control',colour:'#f8a16b',contents:['controls_if','controls_repeat_ext','controls_whileUntil','controls_for'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'◇ Logic',colour:'#75c6ba',contents:['logic_boolean','logic_compare','logic_operation','logic_negate'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'＋ Math',colour:'#75b5c9',contents:['math_number','math_arithmetic','math_random_int','math_modulo'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'Aa Text',colour:'#80bc7e',contents:['text','text_join'].map(type=>({kind:'block',type}))},
 {kind:'category',name:'▤ Variables',colour:'#f3a364',custom:'VARIABLE'}
]};
function seed(ws){
 const start=ws.newBlock('ac_start');start.initSvg();start.render();start.moveBy(70,50);
 const message=ws.newBlock('ac_message');message.initSvg();message.render();
 start.getInput('DO').connection.connect(message.previousConnection);
 const txt=ws.newBlock('text');txt.setFieldValue('Welcome to Arcadia!', 'TEXT');txt.initSvg();txt.render();
 message.getInput('TEXT').connection.connect(txt.outputConnection);
 const collected=ws.newBlock('ac_collect');collected.initSvg();collected.render();collected.moveBy(70,230);
 const sound=ws.newBlock('ac_sound');sound.initSvg();sound.render();collected.getInput('DO').connection.connect(sound.previousConnection);
}
function save(){
 if(!workspace||!activeProject||loading)return;
 try{
  activeProject.blockState=global.Blockly.serialization.workspaces.save(workspace);
  activeProject.blockCode='window.__arcadiaBlockIterations=0;\n'+global.javascript.javascriptGenerator.workspaceToCode(workspace);
  activeProject.blockUpdatedAt=Date.now();
  const code=document.getElementById('blocks-code');
  if(code)code.textContent=activeProject.blockCode||'// Add some blocks to start generating JavaScript';
  document.getElementById('blocks-status').textContent='✓ Blocks saved';
  changeCallback?.(activeProject);
 }catch(e){document.getElementById('blocks-status').textContent='Code generation error: '+e.message}
}
function mount(project,onChange){
 if(!global.Blockly||!global.javascript?.javascriptGenerator){document.getElementById('blocks-status').textContent='Blockly is unavailable. Check your connection and reload.';return false}
 define();activeProject=project;changeCallback=onChange;
 if(!workspace){
  workspace=global.Blockly.inject('blockly-editor',{toolbox,trashcan:true,scrollbars:true,move:{scrollbars:true,drag:true,wheel:true},zoom:{controls:true,wheel:true,startScale:.85,maxScale:2,minScale:.4,scaleSpeed:1.1},grid:{spacing:25,length:3,colour:'#313b53',snap:true},renderer:'zelos',theme:global.Blockly.Theme.defineTheme('arcadia',{base:global.Blockly.Themes.Dark,componentStyles:{workspaceBackgroundColour:'#111a2c',toolboxBackgroundColour:'#192339',flyoutBackgroundColour:'#26314a',flyoutOpacity:0.98,scrollbarColour:'#596584',insertionMarkerColour:'#ac8bff',insertionMarkerOpacity:.5,cursorColour:'#a48cf5'}})});
  workspace.addChangeListener(e=>{if(loading||e.isUiEvent||e.type===global.Blockly.Events.FINISHED_LOADING)return;clearTimeout(timer);timer=setTimeout(save,180)});
 }
 loading=true;workspace.clear();
 try{if(project.blockState)global.Blockly.serialization.workspaces.load(project.blockState,workspace);else seed(workspace)}
 catch(e){workspace.clear();document.getElementById('blocks-status').textContent='Unable to restore blocks: '+e.message}
 loading=false;save();
 setTimeout(()=>global.Blockly.svgResize(workspace),0);
 return true;
}
function resize(){if(workspace)global.Blockly.svgResize(workspace)}
function unmount(){clearTimeout(timer);if(workspace)save();activeProject=null;changeCallback=null}
global.ArcadiaCreatorBlocks={mount,unmount,resize,compile:()=>{if(workspace)save();return activeProject?.blockCode||''}};
})(window);