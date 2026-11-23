import * as T from 'three';
import { Arcadia } from './arcadia.js';

const $ = s => document.querySelector(s), KEY = 'deadlight.save.v1', S = 3;
const NAMES = ['The Entry', 'Ward B', 'The Cistern', 'Boiler Room', 'Below'];
const SIZE = [6, 8, 10, 12, 14], FUSES = [3, 3, 4, 4, 5];
let sv = { level: 1, best: {}, nm: false, q: 1 };
try { Object.assign(sv, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sv)); } catch {} };
const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ---------- renderer ----------
const R = new T.WebGLRenderer({ canvas: $('#c'), antialias: false, powerPreference: 'high-performance' });
const sc = new T.Scene(), cam = new T.PerspectiveCamera(72, 1, .1, 60);
cam.rotation.order = 'YXZ'; sc.add(cam);
sc.background = new T.Color(0x040306); sc.fog = new T.FogExp2(0x040306, .085);
sc.add(new T.AmbientLight(0x4a3f5c, .9));
const torch = new T.SpotLight(0xffe2b0, 18, 30, .5, .6, 1); torch.position.set(0, 0, 0);
cam.add(torch, torch.target); torch.target.position.set(0, 0, -1);
function fit() {
  R.setPixelRatio(Math.min(devicePixelRatio || 1, sv.q ? 1.5 : 1));
  R.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
}
new ResizeObserver(fit).observe(document.body); addEventListener('resize', fit); fit();

function tex(base, n) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < n; i++) {
    x.fillStyle = `rgba(0,0,0,${Math.random() * .3})`;
    const s = Math.random() * 12 + 2; x.fillRect(Math.random() * 128, Math.random() * 128, s, s * (Math.random() * 4 + 1));
  }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
}
const wallM = new T.MeshStandardMaterial({ map: tex('#5a534b', 700), roughness: .95 });
const floorT = tex('#3a342e', 900), ceilT = tex('#2b2824', 400);
const floorM = new T.MeshStandardMaterial({ map: floorT, roughness: 1 }), ceilM = new T.MeshStandardMaterial({ map: ceilT, roughness: 1 });
const wallG = new T.BoxGeometry(S, 3.4, S);

// ---------- audio ----------
let AC;
function audio() {
  if (AC) { AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 200;
  const g = AC.createGain(); g.gain.value = .1;
  [55, 55.6, 82.4].forEach(fr => { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); });
  f.connect(g).connect(AC.destination);
}
function tone(f0, f1, d, v, type = 'sine') {
  if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(AC.destination); o.start(); o.stop(t + d + .05);
}

// ---------- maze ----------
function gen(n) {
  const M = 2 * n + 1, g = Array.from({ length: M }, () => Array(M).fill(1)), st = [[1, 1]]; g[1][1] = 0;
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const d = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(([a, b]) => x + a > 0 && y + b > 0 && x + a < M - 1 && y + b < M - 1 && g[y + b][x + a] === 1).sort(() => Math.random() - .5);
    if (!d.length) { st.pop(); continue; }
    const [a, b] = d[0]; g[y + b / 2][x + a / 2] = 0; g[y + b][x + a] = 0; st.push([x + a, y + b]);
  }
  for (let i = 0; i < n * 3; i++) { // knock out some walls so there are loops to run in circles
    const x = 1 + (Math.random() * (M - 2) | 0), y = 1 + (Math.random() * (M - 2) | 0);
    if (g[y][x] && ((!g[y][x - 1] && !g[y][x + 1]) || (!g[y - 1][x] && !g[y + 1][x]))) g[y][x] = 0;
  }
  return g;
}
function bfs(g, x, y) {
  const M = g.length, d = Array.from({ length: M }, () => Array(M).fill(1e9)), q = [[x, y]]; d[y][x] = 0;
  for (let i = 0; i < q.length; i++) {
    const [a, b] = q[i];
    for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const X = a + u, Y = b + v;
      if (g[Y]?.[X] === 0 && d[Y][X] > d[b][a] + 1) { d[Y][X] = d[b][a] + 1; q.push([X, Y]); }
    }
  }
  return d;
}

// ---------- game state ----------
let st = 'menu', W, L, lv = 1, nm = false;
const p = { x: 0, z: 0, yaw: 0, pitch: 0, bat: 100, sta: 100, tired: false, t: 0, step: 0, moving: false, run: false };
const keys = {}, look = { x: 0, y: 0 }, joy = { x: 0, y: 0 };
let lightOn = true, heart = 0, items = [], foes = [], got = 0, need = 0, unlocked = false, exitM;
const tile = v => Math.floor(v / S + .5);
const wall = (x, z) => L.g[tile(z)]?.[tile(x)] !== 0;
const hit = (x, z) => wall(x + .35, z) || wall(x - .35, z) || wall(x, z + .35) || wall(x, z - .35);
const pick = a => a[Math.random() * a.length | 0];
function los(ax, az, bx, bz) {
  const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .6);
  for (let i = 1; i < n; i++) if (wall(ax + (bx - ax) * i / n, az + (bz - az) * i / n)) return false;
  return true;
}

function build(l) {
  lv = l; const n = SIZE[l - 1], M = 2 * n + 1, g = gen(n), c = (M - 1) / 2 * S;
  if (W) sc.remove(W); W = new T.Group(); sc.add(W);
  let count = 0; g.forEach(r => r.forEach(v => count += v));
  const im = new T.InstancedMesh(wallG, wallM, count), m4 = new T.Matrix4(); let k = 0;
  g.forEach((r, j) => r.forEach((v, i) => { if (v) { m4.setPosition(i * S, 1.7, j * S); im.setMatrixAt(k++, m4); } }));
  W.add(im);
  floorT.repeat.set(M, M); ceilT.repeat.set(M, M);
  const fl = new T.Mesh(new T.PlaneGeometry(M * S, M * S), floorM); fl.rotation.x = -Math.PI / 2; fl.position.set(c, 0, c);
  const ce = new T.Mesh(new T.PlaneGeometry(M * S, M * S), ceilM); ce.rotation.x = Math.PI / 2; ce.position.set(c, 3.4, c);
  W.add(fl, ce);
  const dist = bfs(g, 1, 1), cells = [];
  for (let j = 1; j < M; j += 2) for (let i = 1; i < M; i += 2) cells.push([i, j, dist[j][i]]);
  cells.sort((a, b) => b[2] - a[2]);
  L = { g, M, cells: cells.map(a => [a[0], a[1]]) };
  const free = cells.slice(4).filter(a => a[2] > 5).sort(() => Math.random() - .5).map(a => [a[0], a[1]]);
  const exit = L.cells[0]; exitM = new T.Mesh(new T.BoxGeometry(2.2, 2.8, .3), new T.MeshBasicMaterial({ color: 0x8c1d18 }));
  exitM.position.set(exit[0] * S, 1.4, exit[1] * S); W.add(exitM);
  need = FUSES[l - 1]; got = 0; unlocked = false; items = [];
  for (let i = 0; i < need + Math.ceil(n / 3); i++) {
    const f = i < need, [x, z] = free[i];
    const m = new T.Mesh(f ? new T.BoxGeometry(.35, .6, .35) : new T.BoxGeometry(.3, .5, .3), new T.MeshBasicMaterial({ color: f ? 0xf0a23a : 0x6fbf73 }));
    m.position.set(x * S, 1, z * S); W.add(m); items.push({ m, f });
  }
  foes = [];
  const nf = l >= 4 ? 2 : 1;
  for (let i = 0; i < nf; i++) {
    const m = new T.Group(), body = new T.Mesh(new T.CylinderGeometry(.3, .45, 2.2, 8), new T.MeshStandardMaterial({ color: 0x0b0a0c }));
    const head = new T.Mesh(new T.SphereGeometry(.28, 8, 8), new T.MeshStandardMaterial({ color: 0xcfc8b8 })); head.position.y = 1.35;
    const eyeM = new T.MeshBasicMaterial({ color: 0xff2a1a });
    [-.1, .1].forEach(x => { const e = new T.Mesh(new T.SphereGeometry(.04, 6, 6), eyeM); e.position.set(x, 1.4, -.25); m.add(e); });
    body.position.y = 1.1; m.add(body, head);
    const s = L.cells[Math.floor(L.cells.length * (.3 + i * .25))]; m.position.set(s[0] * S, 0, s[1] * S); W.add(m);
    foes.push({ m, alert: 0, cd: 0, wp: null, field: null, grace: 7 + i * 4 });
  }
  p.x = S; p.z = S; p.yaw = g[1][2] === 0 ? -Math.PI / 2 : Math.PI; p.pitch = 0; p.bat = 100; p.sta = 100; p.t = 0; lightOn = true;
}

// ---------- UI ----------
let btns = [];
function panel(h, sub, b) {
  btns = b; $('#panel').innerHTML = `<h1>${h}</h1><p>${sub}</p>` + b.map((x, i) => `<button data-i="${i}">${x[0]}</button>`).join('');
  $('#ui').hidden = false; $('#hud').hidden = true; $('#tc').hidden = true; $('#panel button')?.focus();
}
$('#panel').addEventListener('click', e => { const i = e.target.dataset?.i; if (i != null) { audio(); btns[i][1](); } });
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2600); }
const fs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
function menu() {
  st = 'menu'; if (document.pointerLockElement) document.exitPointerLock();
  const b = [];
  if (sv.level > 1) b.push([`Continue: ${NAMES[sv.level - 1]}`, () => { nm = false; go(sv.level); }]);
  b.push(['New game', () => { nm = false; sv.level = 1; save(); go(1); }]);
  if (sv.nm) b.push(['Nightmare run', () => { nm = true; go(1); }]);
  b.push(['Controls', controls], [`Graphics: ${sv.q ? 'High' : 'Low'}`, () => { sv.q = +!sv.q; save(); fit(); menu(); }], ['Fullscreen', fs]);
  panel('Deadlight', 'The power is out. Something is walking the halls. Find the fuses and get out.', b);
}
function controls() {
  panel('Controls', 'Move: WASD or arrows. Look: mouse. Run: Shift. Flashlight: F or click. Pause: Esc or P. Fullscreen: G. On touch: left thumb moves, right thumb looks.', [['Back', menu]]);
}
function go(l) {
  audio(); build(l); st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch;
  $('#lvl').textContent = `${nm ? 'Nightmare ' : ''}Level ${l}: ${NAMES[l - 1]}`; hud(); toast(`Restore ${need} fuses, then find the exit.`);
  if (!touch) $('#c').requestPointerLock?.();
}
function pause() {
  if (st !== 'play') return; st = 'pause'; if (document.pointerLockElement) document.exitPointerLock();
  panel('Paused', `${NAMES[lv - 1]}. Fuses ${got}/${need}.`, [['Resume', () => { st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch; if (!touch) $('#c').requestPointerLock?.(); }], ['Main menu', menu]]);
}
function die() {
  st = 'dead'; if (document.pointerLockElement) document.exitPointerLock();
  tone(900, 200, .8, .4, 'sawtooth'); tone(1300, 100, .8, .3, 'square'); Arcadia.onGameOver(lv);
  panel('It found you.', `${NAMES[lv - 1]}. Fuses ${got}/${need}.`, [['Try again', () => go(lv)], ['Main menu', menu]]);
}
function clear() {
  st = 'clear'; if (document.pointerLockElement) document.exitPointerLock();
  const s = Math.round(p.t), id = (nm ? 'n' : '') + lv; if (!sv.best[id] || s < sv.best[id]) sv.best[id] = s;
  Arcadia.onLevelComplete(lv, s, nm);
  if (lv < 5) { if (!nm) sv.level = Math.max(sv.level, lv + 1); save(); panel('Level cleared', `${s} seconds. Best ${sv.best[id]}.`, [['Next level', () => go(lv + 1)], ['Main menu', menu]]); }
  else { sv.nm = true; save(); panel('You made it out.', `${s} seconds. Nightmare run unlocked: faster stalkers, shorter battery.`, [['Main menu', menu]]); }
}
function hud() {
  $('#fuse').textContent = `Fuses ${got}/${need}`; $('#bat').style.width = p.bat + '%'; $('#sta').style.width = p.sta + '%';
}

// ---------- input ----------
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyF' && st === 'play') lightOn = !lightOn;
  if (e.code === 'KeyG') fs();
  if (e.code === 'KeyP' || e.code === 'Escape') pause();
});
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('mousemove', e => { if (document.pointerLockElement) { look.x += e.movementX; look.y += e.movementY; } });
$('#c').addEventListener('mousedown', () => { if (st === 'play') { if (!document.pointerLockElement && !touch) $('#c').requestPointerLock?.(); else lightOn = !lightOn; } });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && st === 'play' && !touch) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); AC?.suspend(); } else AC?.resume(); });
{ const ids = {}, tc = $('#tc');
  tc.addEventListener('pointerdown', e => {
    if (e.target !== tc) return; tc.setPointerCapture(e.pointerId);
    ids[e.pointerId] = { j: e.clientX < innerWidth / 2, x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY };
  });
  tc.addEventListener('pointermove', e => {
    const o = ids[e.pointerId]; if (!o) return;
    if (o.j) { joy.x = Math.max(-1, Math.min(1, (e.clientX - o.ox) / 50)); joy.y = Math.max(-1, Math.min(1, (e.clientY - o.oy) / 50)); }
    else { look.x += (e.clientX - o.x) * 1.6; look.y += (e.clientY - o.y) * 1.6; o.x = e.clientX; o.y = e.clientY; }
  });
  const up = e => { if (ids[e.pointerId]?.j) joy.x = joy.y = 0; delete ids[e.pointerId]; };
  tc.addEventListener('pointerup', up); tc.addEventListener('pointercancel', up);
  $('#run').addEventListener('pointerdown', () => keys.Shift = true); $('#run').addEventListener('pointerup', () => keys.Shift = false);
  $('#lt').addEventListener('pointerdown', () => { if (st === 'play') lightOn = !lightOn; });
}

// ---------- update ----------
function foe(e, dt) {
  const ex = e.m.position.x, ez = e.m.position.z, d = Math.hypot(p.x - ex, p.z - ez);
  if (e.grace > 0) { e.grace -= dt; return d; }
  const was = e.alert > 0;
  if ((d < (lightOn ? 14 : 9) && los(ex, ez, p.x, p.z)) || d < 3 || (p.run && p.moving && d < 11)) e.alert = 4; else e.alert -= dt;
  const chase = e.alert > 0; if (chase && !was) tone(90, 45, .7, .3, 'sawtooth');
  const ei = tile(ex), ej = tile(ez); e.cd -= dt;
  if (!chase && (!e.wp || e.field?.[ej]?.[ei] <= 0)) { e.wp = pick(L.cells); e.cd = 0; }
  if (e.cd <= 0) { e.cd = .3; const t = chase ? [tile(p.x), tile(p.z)] : e.wp; e.field = bfs(L.g, t[0], t[1]); }
  let best = e.field[ej][ei], bx = ei, bz = ej;
  for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const w = e.field[ej + v]?.[ei + u]; if (w < best) { best = w; bx = ei + u; bz = ej + v; } }
  const sp = chase ? Math.min(4.6, 3 + .3 * lv) * (nm ? 1.2 : 1) : 1.7, tx = bx * S - ex, tz = bz * S - ez, td = Math.hypot(tx, tz) || 1;
  e.m.position.x += tx / td * sp * dt; e.m.position.z += tz / td * sp * dt;
  e.m.rotation.y = Math.atan2(p.x - ex, p.z - ez) + Math.PI; e.m.position.y = Math.sin(performance.now() / 300) * .05;
  return d;
}
function tick(dt) {
  p.t += dt; p.yaw -= look.x * .0022; p.pitch = Math.max(-1.2, Math.min(1.2, p.pitch - look.y * .0022)); look.x = look.y = 0;
  let mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  p.moving = ml > .1; p.run = (keys.ShiftLeft || keys.ShiftRight || keys.Shift) && p.moving && !p.tired && p.sta > 0;
  p.sta = p.run ? p.sta - 22 * dt : Math.min(100, p.sta + 14 * dt);
  if (p.sta <= 0) p.tired = true; if (p.tired && p.sta > 25) p.tired = false;
  const sp = p.run ? 5.4 : 3.2, c = Math.cos(p.yaw), s = Math.sin(p.yaw);
  const dx = (mx * c + mz * s) * sp * dt, dz = (-mx * s + mz * c) * sp * dt;
  if (!hit(p.x + dx, p.z)) p.x += dx; if (!hit(p.x, p.z + dz)) p.z += dz;
  if (p.moving) { p.step += dt * (p.run ? 3.4 : 2.2); if (p.step > 1) { p.step = 0; tone(90, 55, .07, .05, 'triangle'); } }
  cam.position.set(p.x, 1.6 + (p.moving ? Math.sin(p.t * (p.run ? 13 : 9)) * .04 : 0), p.z); cam.rotation.set(p.pitch, p.yaw, 0);
  if (lightOn && p.bat > 0) p.bat = Math.max(0, p.bat - .7 * (nm ? 1.4 : 1) * dt);
  let near = 99; for (const e of foes) near = Math.min(near, foe(e, dt));
  const fl = p.bat < 15 || (near < 7 && Math.random() < .08) ? (Math.random() < .5 ? .15 : 1) : 1;
  torch.intensity = lightOn && p.bat > 0 ? 18 * fl : 0;
  for (const it of items) if (it.m.visible) {
    it.m.rotation.y += dt * 2; it.m.position.y = 1 + Math.sin(p.t * 2) * .1;
    if (Math.hypot(p.x - it.m.position.x, p.z - it.m.position.z) < 1.3) {
      it.m.visible = false; tone(600, 1000, .18, .15);
      if (it.f) { got++; if (got === need) { unlocked = true; exitM.material.color.set(0x4fbf6a); toast('Power restored. Find the exit.'); } else toast(`Fuse ${got}/${need}`); }
      else { p.bat = Math.min(100, p.bat + 35); toast('Battery found'); }
      hud();
    }
  }
  if (unlocked && Math.hypot(p.x - exitM.position.x, p.z - exitM.position.z) < 1.8) return clear();
  if (near < 1) return die();
  heart -= dt; const dn = Math.max(0, 1 - near / 14);
  if (dn > 0 && heart <= 0) { heart = .9 - dn * .5; tone(70, 35, .2, .1 + dn * .4); }
  $('#vig').style.opacity = dn; hud();
}

// ---------- boot ----------
const clock = new T.Clock();
(function loop() {
  requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .05);
  if (st === 'play') tick(dt); R.render(sc, cam);
})();
Arcadia.init().finally(() => { menu(); $('#load').remove(); });
