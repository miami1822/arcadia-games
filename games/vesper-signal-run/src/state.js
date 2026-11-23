export const SAVE_KEY='arcadia-vesper-v1';
export const sectors=[
 {name:'THE GLASS WASTE',sky:0x172532,fog:0x273545,ground:0x59616b,accent:0x8edbd4,fragments:7,drones:3,seed:140},
 {name:'THE IRON VEIL',sky:0x282a34,fog:0x46414a,ground:0x665e58,accent:0xe1b691,fragments:9,drones:5,seed:275},
 {name:'THE LAST LIGHT',sky:0x253344,fog:0x405362,ground:0x797166,accent:0xf4d5a1,fragments:11,drones:7,seed:990}
];
export function loadSave(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return {best:Number(raw.best)||0,wins:Number(raw.wins)||0,checkpoint:raw.checkpoint&&Number.isInteger(raw.checkpoint.sector)&&raw.checkpoint.sector>=0&&raw.checkpoint.sector<3?raw.checkpoint:null}}catch{return {best:0,wins:0,checkpoint:null}}}
export function writeSave(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch{}}
export function newRun(){return {sector:0,health:100,maxHealth:100,energy:100,maxEnergy:100,score:0,combo:0,collected:0,boost:1,pulseRange:1,pulseCooldown:0,invuln:0,elapsed:0}}
export const arcadiaAdapter={
 version:'placeholder-1', submitScore(){/* Local scores only until Arcadia publishes an API contract. */},
 unlockAchievement(){/* Intentionally does not call a platform endpoint. */},
 saveProgress(){/* Local storage is the authoritative save in v1. */}};
