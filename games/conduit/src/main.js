import { Arcadia } from './arcadia.js';
const $ = s => document.querySelector(s), KEY = 'conduit.save.v1', NL = 30;
let sv = { stars: {}, daily: {}, snd: 1 };
try { Object.assign(sv, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sv)); } catch {} };
const cv = $('#c'), X = cv.getContext('2d'); let W = 0, H = 0, dirty = 1;
function fit() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; X.setTransform(d, 0, 0, d, 0, 0); dirty = 1; }
new ResizeObserver(fit).observe(document.body); fit();

let AC;
function audio() { if (AC) { AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
function tone(f0, f1, d, v, type = 'triangle', delay = 0) {
  if (!AC || !sv.snd) return; const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .05);
}

// ---- puzzle generation: build a random spanning tree, then scramble the tiles. Always solvable. ----
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rot = m => ((m << 1) | (m >> 3)) & 15, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const steps = (m, t) => { for (let k = 0; k < 4; k++) { if (m === t) return k; m = rot(m); } return 0; };
function gen(n, seed) {
  const r = rng(seed), tgt = Array(n * n).fill(0), seen = Array(n * n).fill(0), s = r() * n * n | 0; seen[s] = 1;
  const list = [s];
  while (list.length) {
    const i = r() < .5 ? list.length - 1 : r() * list.length | 0, c = list[i], x = c % n, y = c / n | 0, nb = [];
    for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]) nb.push(d); }
    if (!nb.length) { list.splice(i, 1); continue; }
    const d = nb[r() * nb.length | 0], c2 = (y + DY[d]) * n + x + DX[d]; tgt[c] |= 1 << d; tgt[c2] |= 1 << ((d + 2) % 4); seen[c2] = 1; list.push(c2);
  }
  let cur, par;
  do { cur = tgt.map(m => { let k = r() * 4 | 0; for (; k--;) m = rot(m); return m; }); par = 0; cur.forEach((m, i) => par += steps(m, tgt[i])); } while (par < n);
  return { n, tgt, cur, init: cur.slice(), par, src: s, off: Array(n * n).fill(0), moves: 0 };
}
function light() {
  const { n, cur, src } = G, lit = new Set([src]), q = [src];
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % n, y = c / n | 0;
    for (let d = 0; d < 4; d++) if (cur[c] & (1 << d)) {
      const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
      const c2 = ny * n + nx; if (!lit.has(c2) && cur[c2] & (1 << ((d + 2) % 4))) { lit.add(c2); q.push(c2); }
    }
  }
  return lit;
}

// ---- state ----
let st = 'menu', G = null, lit = new Set(), cursor = 0, mode = 'level', lvl = 1;
const sizeOf = l => Math.min(8, 3 + Math.floor((l - 1) / 5)), today = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const starStr = n => '★'.repeat(n || 0) + '☆'.repeat(3 - (n || 0));
function begin(m, l) {
  audio(); mode = m; lvl = l; G = m === 'daily' ? gen(7, +today() + 7777) : gen(sizeOf(l), l * 9973 + 13); G.id = m === 'daily' ? 'd' + today() : l;
  lit = light(); st = 'play'; cursor = G.src; $('#ui').hidden = true; $('#hud').hidden = false; $('#bar').hidden = false; hud(); dirty = 1;
}
function hud() {
  $('#t1').textContent = mode === 'daily' ? 'Daily puzzle' : `Level ${lvl}`;
  $('#t2').textContent = `${G.n}x${G.n}   Moves ${G.moves}   Par ${G.par}`;
}
function rotate(c, dir) {
  if (st !== 'play') return; const before = lit.size;
  G.cur[c] = dir > 0 ? rot(G.cur[c]) : rot(rot(rot(G.cur[c]))); G.off[c] = dir > 0 ? -Math.PI / 2 : Math.PI / 2; G.moves++;
  lit = light(); tone(300, 380, .06, .08, 'square'); if (lit.size > before) tone(600, 800, .12, .08);
  hud(); dirty = 1; if (lit.size === G.n * G.n) win();
}
function win() {
  st = 'won'; const s = G.moves <= G.par ? 3 : G.moves <= G.par * 1.4 + 2 ? 2 : 1;
  const book = mode === 'daily' ? sv.daily : sv.stars; book[G.id] = Math.max(book[G.id] || 0, s); save();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, .25, .1, 'triangle', i * .12)); Arcadia.onLevelComplete(G.id, G.moves, false);
  setTimeout(() => panel('Powered', `${starStr(s)}  ${G.moves} moves, par ${G.par}.`,
    mode === 'daily' ? [['Main menu', menu]] : [lvl < NL ? ['Next level', () => begin('level', lvl + 1)] : ['Main menu', menu], ['Retry', () => begin('level', lvl)], ['Levels', levels]]), 700);
}

// ---- drawing ----
let Lay = { cell: 1, ox: 0, oy: 0 };
function draw() {
  X.fillStyle = '#1b1f3b'; X.fillRect(0, 0, W, H); if (!G || st === 'menu') return;
  const n = G.n, bs = Math.max(120, Math.min(W - 24, H - 150)), cell = bs / n, ox = (W - bs) / 2, oy = 55 + (H - 120 - bs) / 2; Lay = { cell, ox, oy };
  for (let c = 0; c < n * n; c++) {
    const x = ox + (c % n) * cell + cell / 2, y = oy + (c / n | 0) * cell + cell / 2, on = lit.has(c), m = G.cur[c];
    X.fillStyle = on ? '#2d3668' : '#252a52'; X.beginPath(); X.roundRect(x - cell / 2 + 2, y - cell / 2 + 2, cell - 4, cell - 4, cell * .12); X.fill();
    if (c === cursor && st === 'play') { X.strokeStyle = '#3fb8af'; X.lineWidth = 2; X.stroke(); }
    const deg = [1, 2, 4, 8].filter(b => m & b).length;
    if (on && deg === 1 && c !== G.src) { X.fillStyle = 'rgba(255,230,140,.2)'; X.beginPath(); X.arc(x, y, cell * .45, 0, 6.283); X.fill(); }
    X.save(); X.translate(x, y); X.rotate(G.off[c]); X.strokeStyle = on ? '#f4c95d' : '#5a5f86'; X.lineWidth = cell * .15; X.lineCap = 'round';
    X.beginPath(); for (let d = 0; d < 4; d++) if (m & (1 << d)) { X.moveTo(0, 0); X.lineTo(DX[d] * cell / 2.1, DY[d] * cell / 2.1); } X.stroke(); X.restore();
    if (c === G.src) { X.fillStyle = '#3fb8af'; X.save(); X.translate(x, y); X.rotate(.785); X.fillRect(-cell * .15, -cell * .15, cell * .3, cell * .3); X.restore(); }
    else if (deg === 1) { X.fillStyle = on ? '#fff2b3' : '#3a3f6b'; X.strokeStyle = on ? '#f4c95d' : '#5a5f86'; X.lineWidth = 3; X.beginPath(); X.arc(x, y, cell * .16, 0, 6.283); X.fill(); X.stroke(); }
  }
}
function pointer(e, dir) {
  if (st !== 'play') return; const { cell, ox, oy } = Lay, rx = e.clientX - ox, ry = e.clientY - oy, n = G.n;
  if (rx < 0 || ry < 0 || rx >= cell * n || ry >= cell * n) return; cursor = (ry / cell | 0) * n + (rx / cell | 0); if (dir) rotate(cursor, dir); dirty = 1;
}
cv.addEventListener('pointerdown', e => { audio(); pointer(e, e.button === 2 || e.shiftKey ? -1 : 1); });
cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pointer(e, 0); });
cv.addEventListener('contextmenu', e => e.preventDefault());

// ---- UI ----
let btns = [];
function panel(h, sub, b, extra = '') {
  btns = b; $('#panel').innerHTML = `<h1>${h}</h1><p>${sub}</p>${extra}` + b.map((x, i) => `<button data-i="${i}">${x[0]}</button>`).join('');
  $('#ui').hidden = false; $('#hud').hidden = true; $('#bar').hidden = true; $('#panel button:not(:disabled)')?.focus();
}
$('#panel').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; audio(); if (b.dataset.l) begin('level', +b.dataset.l); else btns[b.dataset.i][1](); });
const fs = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
const nextLevel = () => { for (let i = 1; i <= NL; i++) if (!sv.stars[i]) return i; return NL; };
function menu() {
  st = 'menu'; const dn = sv.daily['d' + today()];
  panel('Conduit', 'Rotate the tiles to carry power from the teal source to every lamp. Fewer moves earn more stars.',
    [[`Play: level ${nextLevel()}`, () => begin('level', nextLevel())], ['Levels', levels], [`Daily puzzle<small>${dn ? 'Done today ' + starStr(dn) : 'A new 7x7 every day'}</small>`, () => begin('daily', 0)],
      ['Controls', () => panel('Controls', 'Click or tap a tile to turn it clockwise. Right-click, Shift-click or Q turns it back. Keyboard: arrows move, Space turns, R resets, Esc pauses, G is fullscreen.', [['Back', menu]])],
      [`Sound: ${sv.snd ? 'On' : 'Off'}`, () => { sv.snd = +!sv.snd; save(); menu(); }], ['Fullscreen', fs]]);
}
function levels() {
  const top = nextLevel(); let g = '<div class="grid">';
  for (let i = 1; i <= NL; i++) g += `<button data-l="${i}"${i > top ? ' disabled' : ''}>${i}<small>${starStr(sv.stars[i])}</small></button>`; g += '</div>';
  panel('Levels', 'Clear a level to unlock the next.', [['Back', menu]], g);
}
function pause() { if (st !== 'play') return; st = 'pause'; panel('Paused', `${$('#t1').textContent}, ${G.moves} moves.`, [['Resume', () => { st = 'play'; $('#ui').hidden = true; $('#hud').hidden = false; $('#bar').hidden = false; dirty = 1; }], ['Levels', levels], ['Main menu', menu]]); }
$('#reset').addEventListener('click', () => { if (st === 'play') { G.cur = G.init.slice(); G.moves = 0; G.off.fill(0); lit = light(); hud(); dirty = 1; } });
$('#pause').addEventListener('click', pause);
addEventListener('keydown', e => {
  if (e.code === 'KeyG') fs(); if (e.code === 'Escape' || e.code === 'KeyP') pause(); if (st !== 'play') return;
  const n = G.n, x = cursor % n, y = cursor / n | 0, mv = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] }[e.code];
  if (mv) { cursor = Math.max(0, Math.min(n - 1, y + mv[1])) * n + Math.max(0, Math.min(n - 1, x + mv[0])); dirty = 1; }
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); rotate(cursor, e.shiftKey ? -1 : 1); } if (e.code === 'KeyQ') rotate(cursor, -1); if (e.code === 'KeyR') $('#reset').click();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); AC?.suspend(); } else { AC?.resume(); dirty = 1; } });

let last = performance.now();
(function loop(n) {
  requestAnimationFrame(loop); const dt = Math.min((n - last) / 1000, .05); last = n;
  if (G) for (let i = 0; i < G.off.length; i++) if (G.off[i]) { G.off[i] *= Math.max(0, 1 - dt * 16); if (Math.abs(G.off[i]) < .01) G.off[i] = 0; dirty = 1; }
  if (dirty) { dirty = 0; draw(); }
})(last);
Arcadia.init().finally(() => { menu(); $('#load').remove(); });
