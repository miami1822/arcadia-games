import { Arcadia } from './arcadia.js';
const $ = s => document.querySelector(s), KEY = 'cinderfall.save.v1', WIN = 600;
let sv = { embers: 0, best: 0, wins: 0, q: 1, meta: {} };
try { Object.assign(sv, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
sv.meta = Object.assign({ hp: 0, dmg: 0, spd: 0 }, sv.meta);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sv)); } catch {} };
const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const cv = $('#c'), X = cv.getContext('2d'); let W = 0, H = 0;
function fit() { const d = Math.min(devicePixelRatio || 1, sv.q ? 2 : 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; X.setTransform(d, 0, 0, d, 0, 0); }
new ResizeObserver(fit).observe(document.body); fit();

let AC;
function audio() { if (AC) { AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
function tone(f0, f1, d, v, type = 'square') {
  if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(AC.destination); o.start(); o.stop(t + d + .05);
}

const TY = [{ c: '#ff7a2f', r: 11, hp: 3, s: 55, d: 8, xp: 1 }, { c: '#ffc23d', r: 8, hp: 2, s: 105, d: 6, xp: 1 }, { c: '#b4361f', r: 20, hp: 18, s: 38, d: 16, xp: 5 }];
const MAXW = 5;
let st = 'menu', p, en, sh, gm, fx, t, kills, sp, shotCd;
const keys = {}, joy = { x: 0, y: 0 };
const rnd = (a, b) => a + Math.random() * (b - a), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function start() {
  const m = sv.meta;
  p = { x: 0, y: 0, hp: 100 * (1 + .15 * m.hp), max: 100 * (1 + .15 * m.hp), xp: 0, lvl: 1, next: 6, spd: 170 * (1 + .08 * m.spd), dmg: 1 + .12 * m.dmg, mag: 70, hurt: 0, ang: 0, face: 0, w: { bolt: 1, orbit: 0, nova: 0 }, nova: 2 };
  en = []; sh = []; gm = []; fx = []; t = 0; kills = 0; sp = 1; shotCd = 0;
  audio(); st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch;
}
function hit(e, d) { e.hp -= d; e.fl = .08; }
function spawn() {
  const k = t > 90 && Math.random() < .15 ? 2 : t > 30 && Math.random() < .35 ? 1 : 0, ty = TY[k], a = rnd(0, 6.283), r = Math.max(W, H) * .6 + 40;
  en.push({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, r: ty.r, hp: ty.hp * (1 + t / 150), s: ty.s * (1 + t / 900), d: ty.d, c: ty.c, xp: ty.xp, fl: 0, ic: 0 });
}
const UP = [
  { n: 'Ember bolt', d: () => `More shots, faster fire (lv ${p.w.bolt + 1})`, ok: () => p.w.bolt < MAXW, f: () => p.w.bolt++ },
  { n: 'Orbit blades', d: () => p.w.orbit ? `Add a blade (lv ${p.w.orbit + 1})` : 'Blades circle you and cut anything close', ok: () => p.w.orbit < MAXW, f: () => p.w.orbit++ },
  { n: 'Shock nova', d: () => p.w.nova ? `Bigger, faster pulse (lv ${p.w.nova + 1})` : 'A pulse knocks enemies back and burns them', ok: () => p.w.nova < MAXW, f: () => p.w.nova++ },
  { n: 'Swift boots', d: () => '+12% move speed', ok: () => 1, f: () => p.spd *= 1.12 },
  { n: 'Spark magnet', d: () => 'Pick up gems from further away', ok: () => 1, f: () => p.mag += 40 },
  { n: 'Heavy hands', d: () => '+20% damage', ok: () => 1, f: () => p.dmg *= 1.2 },
  { n: 'Mend', d: () => 'Restore 40 health', ok: () => 1, f: () => p.hp = Math.min(p.max, p.hp + 40) }
];
function levelUp() {
  st = 'lvl'; p.xp -= p.next; p.lvl++; p.next = Math.floor(6 + p.lvl * 4.5); tone(500, 1000, .25, .12, 'triangle');
  const c = UP.filter(u => u.ok()).sort(() => Math.random() - .5).slice(0, 3);
  panel('Level ' + p.lvl, 'Choose one.', c.map(u => [`${u.n}<small>${u.d()}</small>`, () => { u.f(); st = 'play'; $('#ui').hidden = true; }]));
}
function end(win) {
  st = 'over'; const e = Math.floor(t / 10 + kills / 20 + (win ? 50 : 0)); sv.embers += e; sv.best = Math.max(sv.best, Math.floor(t)); if (win) sv.wins++; save();
  Arcadia.onGameOver(Math.floor(t)); tone(300, 60, .7, .2, 'sawtooth');
  panel(win ? 'Dawn' : 'Overrun', `${win ? 'You held until sunrise.' : 'The swarm closed in.'} ${fmt(t)} survived, ${kills} defeated. +${e} embers.`, [['Go again', start], ['Main menu', menu]]);
}
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function tick(dt) {
  t += dt; p.hurt -= dt; p.ang += dt * 3;
  let mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x, my = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; } if (ml > .1) p.face = Math.atan2(my, mx);
  p.x += mx * p.spd * dt; p.y += my * p.spd * dt;
  sp -= dt; if (sp <= 0 && en.length < 220) { sp = Math.max(.1, .7 - t / 400); for (let i = 0, n = Math.min(1 + t / 90 | 0, 6); i < n; i++) spawn(); }
  shotCd -= dt;
  if (shotCd <= 0 && en.length) {
    let b = null, bd = 420; for (const e of en) { const d = dist(e, p); if (d < bd) { bd = d; b = e; } }
    if (b) { shotCd = .75 / (1 + .15 * (p.w.bolt - 1)); const n = Math.min(1 + (p.w.bolt >= 3) + (p.w.bolt >= 5), 3), a = Math.atan2(b.y - p.y, b.x - p.x);
      for (let i = 0; i < n; i++) { const q = a + (i - (n - 1) / 2) * .18; sh.push({ x: p.x, y: p.y, vx: Math.cos(q) * 520, vy: Math.sin(q) * 520, life: 1, d: p.dmg * 1.6, pierce: p.w.bolt >= 4 ? 2 : 1 }); } tone(700, 400, .06, .04); }
  }
  if (p.w.nova) { p.nova -= dt; if (p.nova <= 0) { p.nova = 3.4 - .4 * p.w.nova; const R = 80 + 28 * p.w.nova; fx.push({ x: p.x, y: p.y, r: 0, R, life: .35, ring: 1 });
    for (const e of en) { const d = dist(e, p); if (d < R) { hit(e, p.dmg * 2); e.x += (e.x - p.x) / (d || 1) * 45; e.y += (e.y - p.y) / (d || 1) * 45; } } tone(120, 40, .25, .1); } }
  for (const s of sh) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    for (const e of en) if (s.life > 0 && dist(s, e) < e.r + 5) { hit(e, s.d); if (--s.pierce <= 0) s.life = 0; } }
  const nb = p.w.orbit ? p.w.orbit + 1 : 0; p.blades = [];
  for (let i = 0; i < nb; i++) { const a = p.ang + i * 6.283 / nb; p.blades.push({ x: p.x + Math.cos(a) * 70, y: p.y + Math.sin(a) * 70 }); }
  for (const e of en) {
    e.ic -= dt; e.fl -= dt; const d = dist(e, p) || 1; e.x += (p.x - e.x) / d * e.s * dt; e.y += (p.y - e.y) / d * e.s * dt;
    for (const b of p.blades) if (e.ic <= 0 && dist(b, e) < e.r + 9) { hit(e, p.dmg * .9); e.ic = .3; }
    if (d < e.r + 12 && p.hurt <= 0) { p.hp -= e.d; p.hurt = .45; tone(160, 80, .12, .12, 'sawtooth'); }
  }
  for (const e of en) if (e.hp <= 0) { kills++; gm.push({ x: e.x, y: e.y, v: e.xp }); for (let i = 0; i < 5; i++) fx.push({ x: e.x, y: e.y, vx: rnd(-90, 90), vy: rnd(-90, 90), life: .4, c: e.c }); }
  en = en.filter(e => e.hp > 0); sh = sh.filter(s => s.life > 0); if (fx.length > 300) fx.splice(0, 100);
  for (const f of fx) { f.life -= dt; if (f.ring) f.r = f.R * (1 - f.life / .35); else { f.x += f.vx * dt; f.y += f.vy * dt; } } fx = fx.filter(f => f.life > 0);
  for (const g of gm) { const d = dist(g, p); if (d < p.mag) { g.x += (p.x - g.x) / d * 320 * dt; g.y += (p.y - g.y) / d * 320 * dt; } if (d < 16) { g.dead = 1; p.xp += g.v; tone(900, 1300, .05, .04, 'triangle'); } }
  gm = gm.filter(g => !g.dead);
  $('#vig').style.opacity = Math.max(0, p.hurt * 2, p.hp < 30 ? .5 : 0);
  $('#hp').style.width = Math.max(0, p.hp / p.max * 100) + '%'; $('#xp').style.width = Math.min(100, p.xp / p.next * 100) + '%';
  $('#info').textContent = `${fmt(t)} / ${fmt(WIN)}   Lv ${p.lvl}   ${kills} defeated`;
  if (p.hp <= 0) end(false); else if (t >= WIN) end(true); else if (p.xp >= p.next) levelUp();
}

function draw() {
  X.fillStyle = '#0e1319'; X.fillRect(0, 0, W, H);
  if (!p) return; const cx = p.x - W / 2, cy = p.y - H / 2;
  X.fillStyle = 'rgba(215,210,200,.12)'; for (let x = -((cx % 80) + 80) % 80; x < W; x += 80) for (let y = -((cy % 80) + 80) % 80; y < H; y += 80) X.fillRect(x, y, 3, 3);
  const circ = (x, y, r, c) => { X.fillStyle = c; X.beginPath(); X.arc(x - cx, y - cy, r, 0, 6.283); X.fill(); };
  for (const g of gm) circ(g.x, g.y, 4, '#5fe3c0');
  for (const e of en) circ(e.x, e.y, e.r, e.fl > 0 ? '#fff' : e.c);
  for (const s of sh) circ(s.x, s.y, 4, '#ffd9a0');
  for (const b of p.blades || []) circ(b.x, b.y, 9, '#d7d2c8');
  for (const f of fx) { if (f.ring) { X.strokeStyle = `rgba(95,227,192,${f.life / .35})`; X.lineWidth = 4; X.beginPath(); X.arc(f.x - cx, f.y - cy, f.r, 0, 6.283); X.stroke(); } else circ(f.x, f.y, 2.5, f.c); }
  circ(p.x, p.y, 13, p.hurt > 0 && Math.floor(p.hurt * 20) % 2 ? '#ff7a2f' : '#d7d2c8');
  circ(p.x + Math.cos(p.face) * 8, p.y + Math.sin(p.face) * 8, 4, '#0e1319');
}

let btns = [];
function panel(h, sub, b) { btns = b; $('#panel').innerHTML = `<h1>${h}</h1><p>${sub}</p>` + b.map((x, i) => `<button data-i="${i}"${x[2] ? ' disabled' : ''}>${x[0]}</button>`).join(''); $('#ui').hidden = false; $('#hud').hidden = true; $('#tc').hidden = true; $('#panel button:not(:disabled)')?.focus(); }
$('#panel').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) { audio(); btns[b.dataset.i][1](); } });
const fs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
function menu() {
  st = 'menu'; panel('Cinderfall', `Survive until dawn (${fmt(WIN)}). Your weapons fire on their own, so move, collect gems and choose upgrades. Best run ${fmt(sv.best)}. Embers ${sv.embers}.`,
    [['Play', start], ['Forge<small>Spend embers on permanent upgrades</small>', forge], ['Controls', () => panel('Controls', 'Move: WASD or arrows. Pause: Esc or P. Fullscreen: G. Levelling up: click a card or press 1, 2 or 3. Touch: drag anywhere to move.', [['Back', menu]])], [`Graphics: ${sv.q ? 'High' : 'Low'}`, () => { sv.q = +!sv.q; save(); fit(); menu(); }], ['Fullscreen', fs]]);
}
function forge() {
  const D = { hp: ['Thick skin', '+15% max health'], dmg: ['Sharp edge', '+12% damage'], spd: ['Light feet', '+8% move speed'] };
  panel('Forge', `Embers ${sv.embers}. Each upgrade stacks to level 5.`, [...Object.keys(D).map(k => { const l = sv.meta[k], c = 15 * (l + 1) ** 2;
    return [`${D[k][0]} (${l}/5)<small>${D[k][1]}${l < 5 ? `, costs ${c}` : ', maxed'}</small>`, () => { if (l < 5 && sv.embers >= c) { sv.embers -= c; sv.meta[k]++; save(); } forge(); }, l >= 5 || sv.embers < c]; }), ['Back', menu]]);
}
function pause() { if (st !== 'play') return; st = 'pause'; panel('Paused', `${fmt(t)} survived.`, [['Resume', () => { st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#tc').hidden = !touch; }], ['Quit run', menu]]); }
addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'KeyG') fs(); if (e.code === 'KeyP' || e.code === 'Escape') pause();
  if (st === 'lvl' && /^Digit[123]$/.test(e.code)) $$(`#panel button`)[+e.code.slice(5) - 1]?.click(); });
const $$ = s => document.querySelectorAll(s);
addEventListener('keyup', e => keys[e.code] = false);
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); AC?.suspend(); } else AC?.resume(); });
{ const tc = $('#tc'); let o = null;
  tc.addEventListener('pointerdown', e => { tc.setPointerCapture(e.pointerId); o = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  tc.addEventListener('pointermove', e => { if (o && e.pointerId === o.id) { joy.x = Math.max(-1, Math.min(1, (e.clientX - o.x) / 50)); joy.y = Math.max(-1, Math.min(1, (e.clientY - o.y) / 50)); } });
  const up = e => { if (o && e.pointerId === o.id) { o = null; joy.x = joy.y = 0; } }; tc.addEventListener('pointerup', up); tc.addEventListener('pointercancel', up); }

let last = performance.now();
(function loop(n) { requestAnimationFrame(loop); const dt = Math.min((n - last) / 1000, .05); last = n; if (st === 'play') tick(dt); draw(); })(last);
Arcadia.init().finally(() => { menu(); $('#load').remove(); });
