import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {sectors} from './state.js';
export const WORLD_RADIUS=57;
const catalog=['craft-racer','craft-speederb','craft-miner','hangar-roundglass','machine-generator','meteor-detailed','pipe-ring','craterlarge'];
const templates={};
export async function loadModels(onProgress){
 const loader=new GLTFLoader();
 let n=0;
 await Promise.all(catalog.map(async id=>{try{const gltf=await loader.loadAsync('./assets/'+id+'.glb');templates[id]=gltf.scene}catch(e){console.warn('Model fallback',id,e)}finally{onProgress?.(++n/catalog.length)}}));
}
export function model(id,fallback){const t=templates[id];return t?t.clone(true):fallback()}
function rng(seed){let a=seed;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
function mat(hex,emissive=0,emissiveIntensity=0){return new THREE.MeshStandardMaterial({color:hex,metalness:.6,roughness:.43,emissive,emissiveIntensity})}
export function mesh(geo,m){let o=new THREE.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;return o}
export function buildWorld(scene,index){
 const s=sectors[index], group=new THREE.Group(),rand=rng(s.seed);
 scene.background=new THREE.Color(s.sky);scene.fog=new THREE.FogExp2(s.fog,.0083);
 const floor=mesh(new THREE.PlaneGeometry(350,350,1,1),mat(s.ground));floor.rotation.x=-Math.PI/2;floor.position.y=-.5;floor.castShadow=false;group.add(floor);
 const grid=new THREE.GridHelper(130,26,s.accent,0x496079);grid.position.y=-.43;grid.material.transparent=true;grid.material.opacity=.16;group.add(grid);
 const path=mesh(new THREE.PlaneGeometry(13,112),new THREE.MeshStandardMaterial({color:0x303943,metalness:.55,roughness:.7}));path.rotation.x=-Math.PI/2;path.position.y=-.44;path.castShadow=false;group.add(path);
 for(let i=0;i<15;i++){const z=-51+i*7.2;const line=mesh(new THREE.BoxGeometry(.08,.025,2.4),mat(s.accent,s.accent,.8));line.position.set(0,-.37,z);line.castShadow=false;group.add(line)}
 const props=[];const compact=matchMedia('(pointer:coarse)').matches;
 for(let i=0;i<(compact?20:44);i++){
  let x=(rand()-.5)*128,z=(rand()-.5)*128;if(Math.abs(x)<9&&z>-50&&z<50)continue;
  const choice=rand(),id=choice<.5?'meteor-detailed':choice<.63?'craterlarge':choice<.78?'machine-generator':choice<.9?'pipe-ring':'hangar-roundglass';
  let o=model(id,()=>mesh(new THREE.IcosahedronGeometry(1,1),mat(0x4e657a))); const scale=id==='meteor-detailed'?1.2+rand()*2.5:id==='hangar-roundglass'?2.5:1.8+rand()*1.2;
  o.scale.setScalar(scale);o.position.set(x,id==='meteor-detailed'?-1:-.35,z);o.rotation.y=rand()*6.28;
  group.add(o);props.push(o);
 }
 // Tall towers and animated light rings give distant silhouettes without texture downloads.
 for(let i=0;i<(compact?10:18);i++){const theta=i*2.39996,r=66+rand()*51,x=Math.cos(theta)*r,z=Math.sin(theta)*r,h=8+rand()*28;
  const tower=mesh(new THREE.CylinderGeometry(.6+rand()*1.4,2.2+rand()*1.5,h,6),mat(0x3d4550));tower.position.set(x,h/2-.6,z);group.add(tower);
  const beacon=mesh(new THREE.CylinderGeometry(1.1,1.1,.15,8),mat(s.accent,s.accent,2));beacon.position.set(x,h-.4,z);group.add(beacon);
 }
 const starsGeo=new THREE.BufferGeometry(),verts=[];for(let i=0;i<(compact?150:300);i++){let x=(rand()-.5)*300,y=12+rand()*100,z=(rand()-.5)*300;verts.push(x,y,z)}
 starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xc0f9ff,size:.4,sizeAttenuation:true,transparent:true,opacity:.85}));group.add(stars);
 const gate=new THREE.Group();let ring=mesh(new THREE.TorusGeometry(5.8,.24,8,48),mat(0x296274,s.accent,.4));ring.position.y=5.3;gate.add(ring);
 const inner=mesh(new THREE.TorusGeometry(4.8,.08,5,48),mat(s.accent,s.accent,1.7));inner.position.y=5.3;gate.add(inner);
 for(const x of [-5.8,5.8]){let p=mesh(new THREE.CylinderGeometry(.65,.95,7,8),mat(0x414f56));p.position.set(x,3.1,0);gate.add(p)}
 gate.position.set(0,-.25,-48);group.add(gate);
 const gatePortal=mesh(new THREE.CircleGeometry(4.55,48),new THREE.MeshBasicMaterial({color:s.accent,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));gatePortal.position.set(0,5.05,-48);group.add(gatePortal);
 const glows=[];for(let i=0;i<(compact?12:22);i++){const x=(rand()-.5)*110,z=(rand()-.5)*100,ball=mesh(new THREE.IcosahedronGeometry(.09+rand()*.12),new THREE.MeshBasicMaterial({color:s.accent}));ball.position.set(x,1+rand()*3,z);group.add(ball);glows.push({mesh:ball,offset:rand()*6.3})}
 scene.add(group);
 return {group,gate,gatePortal,inner,glows,accent:s.accent,dispose(){scene.remove(group)}};
}
export function makeShip(){const ship=new THREE.Group();let body=model('craft-racer',()=>mesh(new THREE.ConeGeometry(1,3,4),mat(0x9fe8ed)));body.scale.setScalar(1.65);body.rotation.y=Math.PI;ship.add(body);
 const canopy=mesh(new THREE.SphereGeometry(.44,12,8),mat(0x1a789a,0x46b4e2,.8));canopy.scale.set(1,.28,1.5);canopy.position.set(0,.65,-.15);ship.add(canopy);
 for(const x of [-1.05,1.05]){let thruster=mesh(new THREE.ConeGeometry(.3,1.6,9),new THREE.MeshBasicMaterial({color:0x83f8e8,transparent:true,opacity:.66,depthWrite:false}));thruster.rotation.x=Math.PI/2;thruster.position.set(x,.12,1.45);ship.add(thruster)}
 ship.position.y=1.3;return ship}
export function makeDrone(index){const group=new THREE.Group();let body=model(index%2?'craft-speederb':'craft-miner',()=>mesh(new THREE.OctahedronGeometry(.9),mat(0xfa659d)));body.scale.setScalar(1.22);group.add(body);let eye=mesh(new THREE.SphereGeometry(.18,8,8),new THREE.MeshBasicMaterial({color:0xff7c9b}));eye.position.set(0,.45,.6);group.add(eye);return group}
export function makePickup(type,color){let g=new THREE.Group(),m=mat(color,color,1.3);const core=mesh(new THREE.OctahedronGeometry(type==='fragment'?.68:.48,0),m);g.add(core);let halo=mesh(new THREE.TorusGeometry(type==='fragment'?.96:.73,.035,6,24),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));halo.rotation.x=.5;g.add(halo);g.userData={core,halo};return g}
