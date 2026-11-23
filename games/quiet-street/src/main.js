import * as T from 'three';
import { Arcadia } from './arcadia.js';
const $ = s => document.querySelector(s), KEY = 'quietstreet.save.v1', S = 2.5;
const MAP = [
  '#########################', '#......#.......#........#', '#......#.......#........#', '#......D.......D........#', '#......#.......#........#',
  '###D#######D#######D#####', '#.......................#', '#.......................#', '###D#######D#######D#####',
  '#......#.......#........#', '#......#.......#........#', '#......D.......D........#', '#......#.......#........#',
  '#S.....#...H...#...H....#', '#########B###############', '#########X###############', '#########################'];
const ACTS = [{ n: 'Act 1: The Basement Key', keys: 1, walk: 1.9, chase: 3.3, trap: 40, bias: .35 }, { n: 'Act 2: Two Keys', keys: 2, walk: 2.1, chase: 3.6, trap: 28, bias: .5 }, { n: 'Act 3: Three Keys', keys: 3, walk: 2.3, chase: 3.9, trap: 18, bias: .65 }];
let sv = { act: 1, heat: {}, hides: 0, q: 1 };
try { Object.assign(sv, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sv)); } catch {} };
const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ---- renderer ----
const R = new T.WebGLRenderer({ canvas: $('#c'), antialias: false, powerPreference: 'high-performance' });
const sc = new T.Scene(), cam = new T.PerspectiveCamera(72, 1, .1, 50); cam.rotation.order = 'YXZ'; sc.add(cam);
sc.background = new T.Color(0x070605); sc.fog = new T.FogExp2(0x070605, .07); sc.add(new T.AmbientLight(0x5a4c40, 1));
const torch = new T.SpotLight(0xffe2b0, 18, 30, .5, .6, 1); cam.add(torch, torch.target); torch.target.position.set(0, 0, -1);
function fit() { R.setPixelRatio(Math.min(devicePixelRatio || 1, sv.q ? 1.5 : 1)); R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
new ResizeObserver(fit).observe(document.body); fit();
function tex(base, n) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < n; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .25})`; const s = Math.random() * 10 + 2; x.fillRect(Math.random() * 128, Math.random() * 128, s * 4, s / 2); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t; }
const wallM = new T.MeshStandardMaterial({ map: tex('#76624e', 500), roughness: .95 }), floorT = tex('#4a3426', 700), ceilT = tex('#3a3028', 200);
const doorM = new T.MeshStandardMaterial({ color: 0x7a4b2a, roughness: .9 }), wardM = new T.MeshStandardMaterial({ color: 0x3b2a1d, roughness: .9 });

// ---- audio ----
let AC;
function audio() { if (AC) { AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; const g = AC.createGain(); g.gain.value = .07;
  [50, 50.5, 75].forEach(fr => { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); }); f.connect(g).connect(AC.destination); }
function tone(f0, f1, d, v, type = 'sine') { if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(AC.destination); o.start(); o.stop(t + d + .05); }

// ---- map helpers ----
const ch = (i, j) => MAP[j]?.[i] ?? '#', tile = v => Math.floor(v / S + .5);
let op = new Set();
const solid = (i, j) => { const c = ch(i, j); return c === '#' || c === 'H' || (c === 'D' && !op.has(i + ',' + j)) || (c === 'B' && !op.has('B')); };
const wall = (x, z) => solid(tile(x), tile(z)), hit = (x, z) => wall(x + .35, z) || wall(x - .35, z) || wall(x, z + .35) || wall(x, z - .35);
const pass = (i, j) => 'SD.'.includes(ch(i, j));
function bfs(x, y) { const d = MAP.map(r => Array(r.length).fill(1e9)), q = [[x, y]]; d[y][x] = 0;
  for (let i = 0; i < q.length; i++) { const [a, b] = q[i]; for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = a + u, Y = b + v; if (pass(X, Y) && d[Y][X] > d[b][a] + 1) { d[Y][X] = d[b][a] + 1; q.push([X, Y]); } } } return d; }
const floors = []; MAP.forEach((r, j) => [...r].forEach((c, i) => { if (c === '.') floors.push([i, j]); }));
const pick = a => a[Math.random() * a.length | 0];
function los(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / .6); for (let i = 1; i < n; i++) if (wall(ax + (bx - ax) * i / n, az + (bz - az) * i / n)) return false; return true; }

// ---- state ----
let st = 'menu', W, act = 1, A, items = [], trapL = [], cans = [], doorM_ = {}, nb, keys_ = 0, heat = {}, trapT = 0, cdTh = 0, hid = null, stun = 0, noise = 0, nTick = 0, heart = 0, lightOn = true, foot = 0, hT = 0;
const p = { x: 0, z: 0, yaw: 0, pitch: 0, bat: 100, run: false, crouch: false, moving: false }, K = {}, look = { x: 0, y: 0 }, joy = { x: 0, y: 0 };
function build(a) {
  act = a; A = ACTS[a - 1]; if (W) sc.remove(W); W = new T.Group(); sc.add(W); op = new Set(); doorM_ = {}; items = []; trapL = []; cans = []; keys_ = 0; heat = {}; trapT = A.trap; hid = null; stun = 0; noise = 0;
  const C = MAP[0].length, Rr = MAP.length, cx = (C - 1) / 2 * S, cz = (Rr - 1) / 2 * S, g = new T.BoxGeometry(S, 3.2, S); let n = 0; MAP.forEach(r => [...r].forEach(c => n += c === '#'));
  const im = new T.InstancedMesh(g, wallM, n), m4 = new T.Matrix4(); let k = 0;
  MAP.forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') { m4.setPosition(i * S, 1.6, j * S); im.setMatrixAt(k++, m4); }
    if (c === 'D' || c === 'B') { const ew = ch(i - 1, j) === '#'; const m = new T.Mesh(new T.BoxGeometry(ew ? S : .3, 3, ew ? .3 : S), c === 'B' ? new T.MeshStandardMaterial({ color: 0x555a60, roughness: .5 }) : doorM); m.position.set(i * S, 1.5, j * S); W.add(m); doorM_[c === 'B' ? 'B' : i + ',' + j] = m; }
    if (c === 'H') { const m = new T.Mesh(new T.BoxGeometry(S * .8, 2.6, S * .8), wardM); m.position.set(i * S, 1.3, j * S); W.add(m); } }));
  W.add(im); floorT.repeat.set(C, Rr); ceilT.repeat.set(C, Rr);
  const fl = new T.Mesh(new T.PlaneGeometry(C * S, Rr * S), new T.MeshStandardMaterial({ map: floorT, roughness: 1 })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0, cz);
  const ce = new T.Mesh(new T.PlaneGeometry(C * S, Rr * S), new T.MeshStandardMaterial({ map: ceilT, roughness: 1 })); ce.rotation.x = Math.PI / 2; ce.position.set(cx, 3.2, cz); W.add(fl, ce);
  const far = floors.filter(([i, j]) => !(j >= 13)).sort(() => Math.random() - .5);
  for (let i = 0; i < A.keys + 1; i++) { const [x, z] = far[i], key = i < A.keys; const m = new T.Mesh(new T.BoxGeometry(.3, .15, .5), new T.MeshBasicMaterial({ color: key ? 0xe8b04a : 0x8fae8b })); m.position.set(x * S, .5, z * S); W.add(m); items.push({ m, key }); }
  const nm = new T.Group(), coat = new T.Mesh(new T.BoxGeometry(.8, 1.5, .5), new T.MeshStandardMaterial({ color: 0x3d4a4a })), head = new T.Mesh(new T.SphereGeometry(.28, 8, 8), new T.MeshStandardMaterial({ color: 0xc9a27e })), hat = new T.Mesh(new T.CylinderGeometry(.34, .34, .12, 8), new T.MeshStandardMaterial({ color: 0x1b1b1b }));
  coat.position.y = 1.1; head.position.y = 2.1; hat.position.y = 2.38; const legs = new T.Mesh(new T.BoxGeometry(.6, .8, .35), new T.MeshStandardMaterial({ color: 0x222 })); legs.position.y = .4; nm.add(coat, head, hat, legs);
  nm.position.set(11 * S, 0, 6.5 * S); W.add(nm); nb = { m: nm, s: 'patrol', t: 0, wp: null, field: null, cd: 0, last: null, fx: 0, fz: 1, lost: 0, grace: 6 };
  p.x = S; p.z = 13 * S; p.yaw = -Math.PI / 2; p.pitch = 0; p.bat = 100; lightOn = true;
}

// ---- UI ----
let btns = [];
function panel(h, sub, b) { btns = b; $('#panel').innerHTML = `<h1>${h}</h1><p>${sub}</p>` + b.map((x, i) => `<button data-i="${i}">${x[0]}</button>`).join(''); $('#ui').hidden = false; $('#hud').hidden = true; $('#tc').hidden = true; $('#panel button')?.focus(); }
$('#panel').addEventListener('click', e => { const i = e.target.dataset?.i; if (i != null) { audio(); btns[i][1](); } });
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2600); }
const fs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
const lock = () => { if (!touch) $('#c').requestPointerLock?.(); }, unlock = () => document.pointerLockElement && document.exitPointerLock();
function menu() { st = 'menu'; unlock(); const b = []; if (sv.act > 1) b.push([`Continue: ${ACTS[sv.act - 1].n}`, () => go(sv.act)]);
  b.push(['New game', () => { sv.act = 1; save(); go(1); }], ['Controls', () => panel('Controls', 'Move: WASD. Look: mouse. Shift: run (loud). C: crouch (silent). E: use doors, wardrobes, the basement. Click or T: throw a can to lure him. F: flashlight. Esc or P: pause. G: fullscreen. On touch the buttons sit at the right.', [['Back', menu]])], [`Graphics: ${sv.q ? 'High' : 'Low'}`, () => { sv.q = +!sv.q; save(); fit(); menu(); }], ['Fullscreen', fs]);
  panel('Quiet Street', 'Mr. Marrow goes out at night, or says he does. Get into his house and open the basement. He remembers where you have been.', b); }
function go(a) { audio(); build(a); st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch; $('#act').textContent = A.n; toast(`Find ${A.keys} key${A.keys > 1 ? 's' : ''}, then open the basement.`); lock(); }
function pause() { if (st !== 'play') return; st = 'pause'; unlock(); panel('Paused', A.n, [['Resume', () => { st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch; lock(); }], ['Main menu', menu]]); }
function caught() { st = 'dead'; unlock(); remember(); tone(800, 150, .8, .35, 'sawtooth'); Arcadia.onGameOver(act); panel('Caught.', 'He walks you home. Next time he will check the places you used.', [['Try again', () => go(act)], ['Main menu', menu]]); }
function won() { st = 'clear'; unlock(); remember(); Arcadia.onLevelComplete(act, 0, false); tone(523, 1047, .6, .15, 'triangle');
  if (act < 3) { sv.act = act + 1; save(); panel('You got through.', `Down the stairs. ${ACTS[act].n} is next.`, [['Next act', () => go(act + 1)], ['Main menu', menu]]); }
  else { sv.act = 1; save(); panel('The basement.', 'You found what he was hiding. To be continued.', [['Main menu', menu]]); } }
function remember() { const e = Object.entries(heat).sort((a, b) => b[1] - a[1]).slice(0, 30), n = {}; for (const k in sv.heat) n[k] = sv.heat[k] * .8; for (const [k, v] of e) n[k] = (n[k] || 0) + v;
  sv.heat = Object.fromEntries(Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 40)); save(); }

// ---- input ----
addEventListener('keydown', e => { K[e.code] = true; if (st === 'play') { if (e.code === 'KeyF') lightOn = !lightOn; if (e.code === 'KeyE') use(); if (e.code === 'KeyT') thr(); } if (e.code === 'KeyG') fs(); if (e.code === 'KeyP' || e.code === 'Escape') pause(); });
addEventListener('keyup', e => K[e.code] = false);
addEventListener('mousemove', e => { if (document.pointerLockElement) { look.x += e.movementX; look.y += e.movementY; } });
$('#c').addEventListener('mousedown', () => { if (st === 'play') { if (!document.pointerLockElement && !touch) lock(); else thr(); } });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && st === 'play' && !touch) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); AC?.suspend(); } else AC?.resume(); });
{ const ids = {}, tc = $('#tc');
  tc.addEventListener('pointerdown', e => { if (e.target !== tc) return; tc.setPointerCapture(e.pointerId); ids[e.pointerId] = { j: e.clientX < innerWidth / 2, x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY }; });
  tc.addEventListener('pointermove', e => { const o = ids[e.pointerId]; if (!o) return; if (o.j) { joy.x = Math.max(-1, Math.min(1, (e.clientX - o.ox) / 50)); joy.y = Math.max(-1, Math.min(1, (e.clientY - o.oy) / 50)); } else { look.x += (e.clientX - o.x) * 1.6; look.y += (e.clientY - o.y) * 1.6; o.x = e.clientX; o.y = e.clientY; } });
  const up = e => { if (ids[e.pointerId]?.j) joy.x = joy.y = 0; delete ids[e.pointerId]; }; tc.addEventListener('pointerup', up); tc.addEventListener('pointercancel', up);
  $('#run').addEventListener('pointerdown', () => K.Shift = true); $('#run').addEventListener('pointerup', () => K.Shift = false);
  $('#use').addEventListener('pointerdown', () => st === 'play' && use()); $('#thr').addEventListener('pointerdown', () => st === 'play' && thr()); $('#lt').addEventListener('pointerdown', () => st === 'play' && (lightOn = !lightOn)); }

// ---- actions ----
const dP = (i, j) => Math.hypot(p.x - i * S, p.z - j * S);
function makeNoise(x, z, r) { tone(200, 100, .08, .04, 'triangle'); if (nb.s !== 'chase' && Math.hypot(nb.m.position.x - x, nb.m.position.z - z) < r) { nb.s = 'inv'; nb.last = [tile(x), tile(z)]; nb.t = 7; nb.cd = 0; } }
function use() {
  if (hid) { const [i, j] = hid; hid = null; p.x = i * S; p.z = (j - 1) * S; toast('Out.'); return; }
  for (let j = 0; j < MAP.length; j++) for (let i = 0; i < MAP[j].length; i++) {
    const c = ch(i, j); if (dP(i, j) > 2.9) continue;
    if (c === 'H') { hid = [i, j]; sv.hides++; p.x = i * S; p.z = j * S; toast('Hiding. E to leave.'); return; }
    if (c === 'D' && !op.has(i + ',' + j)) { op.add(i + ',' + j); W.remove(doorM_[i + ',' + j]); tone(150, 90, .25, .1, 'sawtooth'); makeNoise(i * S, j * S, 12); return; }
    if (c === 'B' && !op.has('B')) { if (keys_ >= A.keys) { op.add('B'); W.remove(doorM_.B); tone(120, 60, .4, .12, 'square'); toast('The basement is open.'); } else toast(`Locked. ${keys_}/${A.keys} keys.`); return; }
  }
}
function thr() { if (cdTh > 0 || hid) return; cdTh = 1.5; const m = new T.Mesh(new T.SphereGeometry(.12, 6, 6), new T.MeshBasicMaterial({ color: 0xcccccc })), d = new T.Vector3(); cam.getWorldDirection(d);
  m.position.copy(cam.position); W.add(m); cans.push({ m, v: d.multiplyScalar(10).add(new T.Vector3(0, 2.5, 0)) }); }

// ---- neighbor ----
function nbUpdate(dt) {
  const m = nb.m.position; nb.t -= dt; nb.cd -= dt; if (nb.grace > 0) { nb.grace -= dt; return Math.hypot(p.x - m.x, p.z - m.z); }
  const d = Math.hypot(p.x - m.x, p.z - m.z), vis = !hid && los(m.x, m.z, p.x, p.z), dot = ((p.x - m.x) * nb.fx + (p.z - m.z) * nb.fz) / (d || 1), range = (lightOn ? 15 : 10) * (p.crouch ? .6 : 1);
  if (vis && ((d < range && dot > .25) || d < 2.5)) { if (nb.s !== 'chase') { tone(120, 50, .6, .3, 'sawtooth'); toast('He saw you!'); } nb.s = 'chase'; nb.lost = 0; nb.last = [tile(p.x), tile(p.z)]; nb.cd = 0; }
  else if (nb.s === 'chase') { nb.lost += dt; if (nb.lost > 3) { nb.s = 'search'; nb.t = 10; } }
  if ((nb.s === 'search' || nb.s === 'inv') && hid && Math.hypot(hid[0] * S - m.x, hid[1] * S - m.z) < 3 && Math.random() < Math.min(.9, .25 + sv.hides * .05) * dt * 3) return 0;
  if ((nb.s === 'search' || nb.s === 'inv') && nb.t <= 0) nb.s = 'patrol';
  const mi = tile(m.x), mj = tile(m.z);
  let tgt = nb.s === 'chase' ? [tile(p.x), tile(p.z)] : nb.last && nb.s !== 'patrol' ? nb.last : nb.wp;
  if (nb.s === 'patrol' && (!nb.wp || (nb.field && nb.field[mj][mi] <= 0))) { const hot = Object.keys(sv.heat).concat(Object.keys(heat)); nb.wp = hot.length && Math.random() < A.bias ? pick(hot).split(',').map(Number) : pick(floors); tgt = nb.wp; nb.cd = 0; }
  if (nb.s === 'search' && nb.field && nb.field[mj][mi] <= 0) { const w = [[11, 13], [19, 13]]; nb.last = Math.random() < Math.min(.8, .2 + sv.hides * .05) ? pick(w).map((v, i) => i ? v - 1 : v) : pick(floors); nb.cd = 0; }
  if (nb.cd <= 0 && tgt && pass(tgt[0], tgt[1])) { nb.cd = .3; nb.field = bfs(tgt[0], tgt[1]); }
  if (!nb.field) return d;
  let best = nb.field[mj][mi], bx = mi, bz = mj;
  for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const w = nb.field[mj + v]?.[mi + u]; if (w < best) { best = w; bx = mi + u; bz = mj + v; } }
  if (ch(bx, bz) === 'D' && !op.has(bx + ',' + bz)) { op.add(bx + ',' + bz); W.remove(doorM_[bx + ',' + bz]); tone(150, 90, .25, .1, 'sawtooth'); }
  const sp = nb.s === 'chase' ? A.chase : A.walk, tx = bx * S - m.x, tz = bz * S - m.z, td = Math.hypot(tx, tz) || 1;
  m.x += tx / td * sp * dt; m.z += tz / td * sp * dt; nb.fx = tx / td; nb.fz = tz / td; nb.m.rotation.y = Math.atan2(nb.fx, nb.fz) + Math.PI; return d;
}
function tick(dt) {
  p.yaw -= look.x * .0022; p.pitch = Math.max(-1.2, Math.min(1.2, p.pitch - look.y * .0022)); look.x = look.y = 0; cdTh -= dt; stun -= dt;
  p.crouch = !!K.KeyC; let mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0) + joy.x, mz = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0) + joy.y; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  p.moving = ml > .1 && !hid && stun <= 0; p.run = !!(K.ShiftLeft || K.ShiftRight || K.Shift) && p.moving && !p.crouch;
  if (p.moving) { const sp = p.run ? 4.6 : p.crouch ? 1.4 : 2.6, c = Math.cos(p.yaw), s = Math.sin(p.yaw), dx = (mx * c + mz * s) * sp * dt, dz = (-mx * s + mz * c) * sp * dt; if (!hit(p.x + dx, p.z)) p.x += dx; if (!hit(p.x, p.z + dz)) p.z += dz; }
  noise = p.moving ? (p.run ? 9 : p.crouch ? 0 : 3.5) : 0; nTick -= dt; if (noise && nTick <= 0) { nTick = .4; makeNoise(p.x, p.z, noise); }
  cam.position.set(p.x, (p.crouch ? 1.0 : 1.6) + (p.moving ? Math.sin(performance.now() / (p.run ? 80 : 120)) * .03 : 0), p.z); cam.rotation.set(p.pitch, p.yaw, 0);
  if (lightOn && p.bat > 0) p.bat = Math.max(0, p.bat - .5 * dt); torch.intensity = lightOn && p.bat > 0 ? 18 : 0;
  hT -= dt; if (hT <= 0 && !hid) { hT = .5; const k = tile(p.x) + ',' + tile(p.z); heat[k] = (heat[k] || 0) + 1; }
  trapT -= dt; if (trapT <= 0) { trapT = A.trap; const e = Object.entries({ ...sv.heat, ...heat }).sort((a, b) => b[1] - a[1]); const c = e.map(a => a[0].split(',').map(Number)).find(([i, j]) => ch(i, j) === '.' && dP(i, j) > 6);
    if (c && trapL.length < 3 + act) { const m = new T.Mesh(new T.CylinderGeometry(.5, .5, .06, 10), new T.MeshStandardMaterial({ color: 0x6a1f14, emissive: 0x200603 })); m.position.set(c[0] * S, .04, c[1] * S); W.add(m); trapL.push({ m, i: c[0], j: c[1] }); } }
  for (const t of trapL) if (!hid && Math.hypot(p.x - t.m.position.x, p.z - t.m.position.z) < .8) { stun = 2.5; tone(200, 40, .3, .3, 'square'); makeNoise(t.m.position.x, t.m.position.z, 18); toast('A trap! He will hear that.'); W.remove(t.m); t.dead = 1; } trapL = trapL.filter(t => !t.dead);
  for (const c of cans) { c.v.y -= 9 * dt; c.m.position.addScaledVector(c.v, dt); if (c.m.position.y < .1 || wall(c.m.position.x, c.m.position.z)) { c.dead = 1; tone(300, 120, .15, .1, 'square'); makeNoise(c.m.position.x, c.m.position.z, 14); W.remove(c.m); } } cans = cans.filter(c => !c.dead);
  for (const it of items) if (it.m.visible) { it.m.rotation.y += dt * 2; if (Math.hypot(p.x - it.m.position.x, p.z - it.m.position.z) < 1.2 && !hid) { it.m.visible = false; tone(600, 1000, .15, .12, 'triangle'); if (it.key) { keys_++; toast(`Key ${keys_}/${A.keys}`); } else { p.bat = Math.min(100, p.bat + 40); toast('Battery'); } } }
  const d = nbUpdate(dt); if (d < 1.2 && !hid && nb.grace <= 0 || d === 0) return caught();
  if (op.has('B') && dP(9, 15) < 1.8) return won();
  const nm = nb.m.position; foot -= dt; if (foot <= 0 && d < 14 && nb.grace <= 0) { foot = nb.s === 'chase' ? .3 : .55; tone(70, 45, .08, .12 * (1 - d / 14)); }
  heart -= dt; const dn = Math.max(0, 1 - d / 12); if (dn > 0 && heart <= 0) { heart = .9 - dn * .5; tone(70, 35, .2, .08 + dn * .3); }
  $('#vig').style.opacity = nb.s === 'chase' ? .5 + dn * .4 : dn * .5; $('#bat').style.width = p.bat + '%'; $('#noise').style.width = Math.min(100, noise * 11) + '%';
  $('#keys').textContent = `Keys ${keys_}/${A.keys}`; $('#state').textContent = hid ? 'Hidden' : nb.s === 'chase' ? 'Spotted!' : nb.s === 'inv' ? 'He heard something' : nb.s === 'search' ? 'He is looking for you' : 'Unseen';
}
const clock = new T.Clock();
(function loop() { requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .05); if (st === 'play') tick(dt); R.render(sc, cam); })();
Arcadia.init().finally(() => { menu(); $('#load').remove(); });
