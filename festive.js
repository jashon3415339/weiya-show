// 喜慶過年風 音效庫 v2（原創，全部用瀏覽器即時合成）
// 樂器：嗩吶、古箏、笛子、琵琶、揚琴、編鐘、電子合成；鑼鼓：堂鼓、大鑼、小鑼、鈸、木魚、碰鈴；鞭炮
// 每個環節的音樂 = 旋律 × 主奏樂器 × 鑼鼓節奏 × 速度 × 和聲，設定寫在 config.js 的 music（用 music-lab.html 挑）
// 大螢幕和兩個遊戲共用：<script src="../weiya-show/festive.js"></script>
(function () {
  'use strict';
  if (window.FestiveAudio) return;
  // 遊戲嵌在大螢幕裡時，直接用大螢幕那一套（聲音已解鎖、音量一起控制）
  try { if (window.parent !== window && window.parent.FestiveAudio) { window.FestiveAudio = window.parent.FestiveAudio; return; } } catch (e) {}

  let ctx = null, master = null, noiseBuf = null, vol = 1;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = vol;
    const comp = ctx.createDynamicsCompressor();   // 讓大小聲比較一致
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .25;
    master.connect(comp); comp.connect(ctx.destination);
    const n = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const a = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const N = m => 440 * Math.pow(2, (m - 69) / 12);
  const R = (a, b) => a + Math.random() * (b - a);
  function env(g, t, peak, a, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, .0002), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function osc(type, f, dest, t, len) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + len + .05); return o; }
  function noise(dest, t, len, type, freq, q) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; s.connect(f); f.connect(dest); s.start(t, Math.random()); s.stop(t + len + .05); return f; }
  function G(dest, v) { const g = ctx.createGain(); g.gain.value = v == null ? 1 : v; g.connect(dest || master); return g; }
  function vibrato(t, f, depth, rate, len, delay) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = rate; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * depth, t + (delay || .25)); l.connect(lg); l.start(t); l.stop(t + len + .05); return lg; }

  // ================= 鑼鼓 =================
  function drum(d, t, v = .8, p = 1, len = .35) { const g = G(d, 0); env(g, t, v, .005, len); const o = osc('sine', 150 * p, g, t, len); o.frequency.exponentialRampToValueAtTime(52 * p, t + len * .7); const g2 = G(d, 0); env(g2, t, v * .35, .002, .06); noise(g2, t, .08, 'lowpass', 700); }
  const bigDrum = (d, t, v = 1) => drum(d, t, v, .72, .9);
  function woodblock(d, t, v = .35, f = 1150) { const g = G(d, 0); env(g, t, v, .002, .07); osc('sine', f, g, t, .1); const g2 = G(d, 0); env(g2, t, v * .5, .001, .03); noise(g2, t, .04, 'bandpass', f * 2.2, 6); }
  function cymbal(d, t, v = .35, len = .7) { const g = G(d, 0); env(g, t, v, .003, len); noise(g, t, len, 'highpass', 4200); const g2 = G(d, 0); env(g2, t, v * .25, .002, len * .5); [587, 829, 1183, 1571].forEach(f => osc('square', f * R(.99, 1.01), g2, t, len * .5)); }
  function smallGong(d, t, v = .3) { const g = G(d, 0); env(g, t, v, .004, .55); const o = osc('sine', 820, g, t, .6); o.frequency.linearRampToValueAtTime(1010, t + .25); const o2 = osc('triangle', 1640, g, t, .6); o2.frequency.linearRampToValueAtTime(2010, t + .25); }
  function gong(d, t, v = .7, len = 3) { [[98, 1], [147, .7], [208, .55], [262, .4], [331, .3], [419, .2]].forEach(([f, k]) => { const g = G(d, 0); env(g, t, v * k * .5, .01, len * R(.7, 1)); const o = osc('sine', f, g, t, len); o.frequency.exponentialRampToValueAtTime(f * .96, t + len); }); const g = G(d, 0); env(g, t, v * .4, .003, .35); noise(g, t, .4, 'lowpass', 1500); }
  function bell(d, t, v = .08) { const g = G(d, 0); env(g, t, v, .002, 1.6); osc('sine', 2093, g, t, 1.6); const g2 = G(d, 0); env(g2, t, v * .4, .002, .8); osc('sine', 3136, g2, t, .8); }
  function firecrackers(d, t, len = 2.5, dens = 34, v = .5) { const n = Math.floor(len * dens); for (let i = 0; i < n; i++) { const tt = t + Math.pow(Math.random(), .8) * len, g = G(d, 0); env(g, tt, v * R(.3, 1), .001, R(.02, .06)); noise(g, tt, .08, 'highpass', R(900, 2600)); } }
  // 電子鼓（現代風用）
  function kick(d, t, v = .9) { const g = G(d, 0); env(g, t, v, .002, .32); const o = osc('sine', 120, g, t, .35); o.frequency.exponentialRampToValueAtTime(42, t + .18); }
  function clap(d, t, v = .35) { for (let i = 0; i < 3; i++) { const g = G(d, 0); env(g, t + i * .012, v * (i === 2 ? 1 : .6), .001, i === 2 ? .14 : .02); noise(g, t + i * .012, .16, 'bandpass', 1400, 1.2); } }
  function hat(d, t, v = .12) { const g = G(d, 0); env(g, t, v, .001, .045); noise(g, t, .06, 'highpass', 8000); }

  // ================= 主奏樂器 =================
  const LEADS = {
    // 嗩吶：鋸齒＋方波、帶通、顫音、起音往上滑
    suona(d, m, t, len, v = .12) {
      const f = N(m), g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03); g.gain.setValueAtTime(v, t + Math.max(.04, len - .06)); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = .9; bp.connect(g);
      const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 3200; pk.gain.value = 6; pk.connect(bp);
      const lg = vibrato(t, f, .018, 5.8, len, Math.min(.3, len));
      for (const [type, k] of [['sawtooth', 1], ['square', .5]]) { const o = ctx.createOscillator(), og = ctx.createGain(); og.gain.value = k; o.type = type; o.frequency.setValueAtTime(f * .955, t); o.frequency.exponentialRampToValueAtTime(f, t + .06); lg.connect(o.frequency); o.connect(og); og.connect(pk); o.start(t); o.stop(t + len + .05); }
    },
    // 古箏：撥弦，起音稍高再落下
    guzheng(d, m, t, len, v = .16) { const f = N(m), L = Math.max(1.2, len), g = G(d, 0); env(g, t, v, .004, L); const o = osc('triangle', f * 1.008, g, t, L); o.frequency.exponentialRampToValueAtTime(f, t + .08); const g2 = G(d, 0); env(g2, t, v * .35, .003, L * .4); osc('sine', f * 2, g2, t, L * .4); const g3 = G(d, 0); env(g3, t, v * .3, .001, .02); noise(g3, t, .03, 'bandpass', f * 3, 4); },
    // 笛子：明亮的吹管，帶氣聲和顫音
    dizi(d, m, t, len, v = .1) {
      const f = N(m * 1 + 12 > 96 ? m : m + 12), g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .05); g.gain.setValueAtTime(v, t + Math.max(.06, len - .08)); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      const lg = vibrato(t, f, .012, 5.2, len, .2); const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * .98, t); o.frequency.exponentialRampToValueAtTime(f, t + .05); lg.connect(o.frequency); o.connect(g); o.start(t); o.stop(t + len + .05);
      const o2 = ctx.createOscillator(), g2 = ctx.createGain(); g2.gain.value = .25; o2.type = 'triangle'; o2.frequency.value = f * 2; lg.connect(o2.frequency); o2.connect(g2); g2.connect(g); o2.start(t); o2.stop(t + len + .05);
      const gn = G(d, 0); gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(v * .25, t + .03); gn.gain.exponentialRampToValueAtTime(.0001, t + len); noise(gn, t, len, 'bandpass', f * 1.5, 3);
    },
    // 琵琶：輪指（快速重複撥）
    pipa(d, m, t, len, v = .13) { const f = N(m), n = Math.max(1, Math.floor(len / .055)); for (let i = 0; i < n; i++) { const tt = t + i * .055, g = G(d, 0); env(g, tt, v * (i ? .6 : 1), .002, .16); osc('triangle', f, g, tt, .18); const g2 = G(d, 0); env(g2, tt, v * .25, .001, .05); osc('square', f * 2, g2, tt, .06); } },
    // 揚琴：金屬感的敲弦，兩根弦一起響
    yangqin(d, m, t, len, v = .14) { const f = N(m), L = Math.max(.9, len); for (const k of [1, 1.004]) { const g = G(d, 0); env(g, t, v * .6, .002, L); osc('triangle', f * k, g, t, L); } const g2 = G(d, 0); env(g2, t, v * .3, .001, .25); osc('sine', f * 3, g2, t, .3); },
    // 編鐘：低沉悠遠的鐘聲
    bianzhong(d, m, t, len, v = .14) { const f = N(m - 12), L = Math.max(2, len); [[1, 1], [2.76, .35], [5.4, .15]].forEach(([k, a]) => { const g = G(d, 0); env(g, t, v * a, .003, L / (k > 1 ? 2 : 1)); osc('sine', f * k, g, t, L); }); },
    // 電子合成：現代感的方波主旋律
    synth(d, m, t, len, v = .07) { const f = N(m), g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.setValueAtTime(v * .8, t + Math.max(.02, len - .05)); g.gain.exponentialRampToValueAtTime(.0001, t + len); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(4500, t); lp.frequency.exponentialRampToValueAtTime(1500, t + len); lp.connect(g); for (const k of [1, 1.006]) osc('square', f * k, lp, t, len); },
    none() {}
  };

  // ================= 鑼鼓節奏（每格 = 八分音符，8 格一小節） =================
  const PERCS = {
    none() {},
    light(d, s, t) { const b = s % 8; if (b === 0) drum(d, t, .16, .9, .3); if (b === 0 || b === 6) woodblock(d, t, .07, 950); if (s % 16 === 8) bell(d, t, .06); },
    luogu(d, s, t) { const b = s % 8; if (b === 0) drum(d, t, .7); if (b === 2) drum(d, t, .45); if (b === 4) cymbal(d, t, .22, .45); if (b === 6) drum(d, t, .55); if (b % 2) woodblock(d, t, .1); if (s % 32 === 16) smallGong(d, t, .18); },
    jijifeng(d, s, t) { const b = s % 8; drum(d, t, b === 0 ? .65 : b === 4 ? .5 : .22, 1.1, .2); if (b === 0) smallGong(d, t, .14); if (b === 4) cymbal(d, t, .15, .25); if (s % 64 === 0) gong(d, t, .35, 2.2); },
    lion(d, s, t) { const b = s % 8; if (b % 2 === 0) drum(d, t, b === 0 ? .9 : .6, .8, .4); if (b === 3 || b === 7) drum(d, t, .45, .8, .3); if (b === 2 || b === 6) cymbal(d, t, .25, .35); if (s % 16 === 0) gong(d, t, .3, 1.6); },
    march(d, s, t) { const b = s % 8; if (b === 0 || b === 4) drum(d, t, .7, .9); woodblock(d, t, b % 2 ? .06 : .12, 1300); if (b === 6) { drum(d, t, .35, 1.2, .12); drum(d, t + .06, .35, 1.2, .12); } if (s % 16 === 12) cymbal(d, t, .2, .4); },
    edm(d, s, t) { const b = s % 8; if (b % 2 === 0) kick(d, t, .8); if (b === 2 || b === 6) clap(d, t, .3); hat(d, t, b % 2 ? .12 : .06); if (s % 32 === 0) cymbal(d, t, .2, 1); }
  };

  // ================= 原創旋律（五聲音階，64 格 = 8 小節） =================
  const _ = 0;
  const MELS = {
    A: { name: '歡快跳躍', bass: [43, 43, 38, 43, 43, 40, 38, 43], n: [67,_,71,_,74,_,76,74, 71,_,69,_,67,_,_,_, 69,_,71,_,74,76,79,_, 76,_,74,_,71,_,_,_, 74,_,76,_,79,_,81,79, 76,_,74,_,76,_,_,_, 71,74,76,_,74,71,69,_, 67,_,_,_,_,_,_,_] },
    B: { name: '悠揚抒情', bass: [38, 45, 40, 38, 43, 45, 38, 43], n: [74,_,_,_,76,_,74,71, 69,_,_,_,_,_,_,_, 71,_,74,_,76,_,79,_, 76,_,_,_,_,_,_,_, 79,_,_,76,74,_,71,_, 69,_,71,_,74,_,_,_, 71,_,69,_,67,_,_,_, _,_,_,_,_,_,_,_] },
    C: { name: '熱鬧進行', bass: [43, 38, 43, 38, 43, 40, 38, 43], n: [67,67,_,71,74,_,71,_, 76,76,_,74,71,_,_,_, 69,69,_,71,74,_,76,_, 74,_,71,_,69,_,_,_, 67,67,_,71,74,_,79,_, 81,_,79,_,76,_,74,_, 76,_,74,71,69,_,71,_, 67,_,_,_,_,_,_,_] },
    D: { name: '緊張懸疑', bass: [38, 38, 41, 36, 38, 41, 43, 38], n: [62,_,_,65,_,_,67,_, 69,_,_,_,67,_,65,_, 62,_,_,65,_,_,67,_, 60,_,_,_,_,_,_,_, 62,_,_,65,_,_,69,_, 72,_,_,_,69,_,67,_, 65,_,67,_,65,_,62,_, _,_,_,_,_,_,_,_] },
    E: { name: '衝刺快板', bass: [38, 43, 38, 45, 38, 43, 38, 43], n: [74,76,79,81,79,76,74,71, 74,76,79,81,84,_,81,_, 79,81,79,76,74,76,74,71, 69,71,74,_,76,_,_,_, 74,76,79,81,79,76,74,71, 69,71,74,76,79,_,76,_, 74,76,74,71,69,71,69,67, 67,_,_,_,67,_,_,_] },
    F: { name: '溫馨收尾', bass: [48, 45, 43, 45, 48, 43, 45, 48], n: [72,_,_,_,74,_,76,_, 79,_,_,_,76,_,_,_, 74,_,_,_,72,_,74,_, 69,_,_,_,_,_,_,_, 72,_,_,_,74,_,76,_, 79,_,81,_,79,_,76,_, 74,_,76,_,72,_,_,_, _,_,_,_,_,_,_,_] }
  };

  // ================= 每個環節的預設音樂（config.js 的 music 會覆蓋） =================
  const DEFAULT_SLOTS = {
    welcome:   { name: '迎賓・報到',       mel: 'B', lead: 'guzheng',   perc: 'light',    bpm: 92,  pad: true,  vol: .9 },
    dine:      { name: '用餐・致詞・貴賓', mel: 'F', lead: 'dizi',      perc: 'light',    bpm: 84,  pad: true,  vol: .8 },
    mahjong:   { name: '麻將賓果',         mel: 'C', lead: 'yangqin',   perc: 'march',    bpm: 116, pad: false, vol: 1 },
    draw:      { name: '抽獎',             mel: 'A', lead: 'suona',     perc: 'luogu',    bpm: 126, pad: false, vol: 1 },
    truefalse: { name: '真的還假的',       mel: 'D', lead: 'pipa',      perc: 'jijifeng', bpm: 132, pad: false, vol: 1 },
    coins:     { name: '財神撒金幣',       mel: 'E', lead: 'suona',     perc: 'lion',     bpm: 150, pad: false, vol: 1 },
    grand:     { name: '壓軸頭獎',         mel: 'D', lead: 'bianzhong', perc: 'lion',     bpm: 104, pad: true,  vol: 1 },
    ending:    { name: '散場',             mel: 'F', lead: 'guzheng',   perc: 'light',    bpm: 88,  pad: true,  vol: .85 }
  };
  // 舊名稱相容
  const ALIAS = { party: 'draw', game: 'truefalse' };
  let SLOTS = Object.assign({}, DEFAULT_SLOTS);
  function setSlots(o) { if (!o) return; for (const k in o) SLOTS[k] = Object.assign({}, DEFAULT_SLOTS[k] || {}, o[k]); }
  if (window.WEIYA && window.WEIYA.music) setSlots(window.WEIYA.music);

  // ================= 播放器（兩條軌交叉淡入淡出） =================
  let cur = null;        // { spec, bus, step, nextT, key }
  let timer = null;
  function specKey(s) { return [s.mel, s.lead, s.perc, s.bpm, s.pad, s.vol].join('|'); }
  function tick() {
    if (!cur) return;
    const S = cur.spec, M = MELS[S.mel] || MELS.A, L = LEADS[S.lead] || LEADS.none, P = PERCS[S.perc] || PERCS.none;
    const st = 30 / Math.max(40, Math.min(220, S.bpm || 110));   // 八分音符秒數
    while (cur.nextT < ctx.currentTime + .3) {
      const len = M.n.length, s = cur.step % len, m = M.n[s], t = cur.nextT, d = cur.bus;
      if (m) { let k = 1; while (k < 6 && !M.n[(s + k) % len]) k++; L(d, m, t, st * k * .95); }
      if (s % 8 === 0) {
        const bm = M.bass[(s / 8) % M.bass.length];
        const g = G(d, 0); env(g, t, .2, .02, st * 7); osc('triangle', N(bm), g, t, st * 8);
        if (S.pad) for (const iv of [12, 19, 24]) { const pg = G(d, 0); pg.gain.setValueAtTime(.0001, t); pg.gain.linearRampToValueAtTime(.025, t + st * 2); pg.gain.linearRampToValueAtTime(.0001, t + st * 8); osc('sine', N(bm + iv), pg, t, st * 8); }
      }
      P(d, s, t);
      cur.step++; cur.nextT += st;
    }
  }
  function playSpec(spec, sec = 1.2) {
    if (!init()) return;
    const key = spec ? specKey(spec) : null;
    if (cur && key && cur.key === key) { const t = ctx.currentTime; cur.bus.gain.cancelScheduledValues(t); cur.bus.gain.setValueAtTime(cur.bus.gain.value, t); cur.bus.gain.linearRampToValueAtTime(spec.vol == null ? 1 : spec.vol, t + sec); return; }
    if (cur) { const old = cur.bus, t = ctx.currentTime; old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0, t + sec); setTimeout(() => { try { old.disconnect(); } catch (e) {} }, sec * 1000 + 800); cur = null; }
    if (!spec) return;
    const bus = G(master, 0), t = ctx.currentTime; bus.gain.setValueAtTime(0, t); bus.gain.linearRampToValueAtTime(spec.vol == null ? 1 : spec.vol, t + sec);
    cur = { spec: Object.assign({}, spec), bus, step: 0, nextT: t + .08, key };
    if (!timer) timer = setInterval(tick, 50);
  }
  // name：環節代號（welcome、dine、draw…）或 null（淡出）
  function music(name, sec = 1.2) { if (!name) return playSpec(null, sec); name = ALIAS[name] || name; playSpec(SLOTS[name] || SLOTS.dine, sec); }

  // ================= 音效 =================
  const now = () => (init(), ctx.currentTime);
  const sfx = {
    tick() { if (!init()) return; woodblock(master, now(), .4); },
    join() { if (!init()) return; woodblock(master, now(), .22, 1500); },
    drum() { if (!init()) return; drum(master, now(), .8); },
    chang() { if (!init()) return; const t = now(); cymbal(master, t, .35); smallGong(master, t, .3); },
    gong() { if (!init()) return; gong(master, now(), .8); },
    start() { if (!init()) return; const t = now(); bigDrum(master, t, 1); gong(master, t + .02, .7); cymbal(master, t + .02, .35); },
    roll(sec = 1.8) { if (!init()) return; const t = now(); let tt = 0, k = 0; while (tt < sec) { drum(master, t + tt, .25 + .5 * tt / sec, 1.15, .18); tt += Math.max(.045, .12 - k * .004); k++; } cymbal(master, t + sec, .4); },
    fanfare() { if (!init()) return; const t = now(); drum(master, t, .9); drum(master, t + .18, .7); cymbal(master, t + .36, .4); smallGong(master, t + .36, .3); [72, 74, 76, 79, 81, 84].forEach((m, i) => LEADS.suona(master, m, t + .5 + i * .11, i === 5 ? .9 : .13, .14)); firecrackers(master, t + .5, 1.6, 28, .35); },
    firecrackers(sec = 2.5) { if (!init()) return; firecrackers(master, now(), sec); }
  };
  function riser(sec = 9) {
    if (!init()) return; const t = ctx.currentTime; let tt = 0, gap = .5;
    while (tt < sec) { drum(master, t + tt, .3 + .6 * tt / sec, 1, .25); if (tt > sec * .6) woodblock(master, t + tt + gap / 2, .15); tt += gap; gap = Math.max(.05, gap * .93); }
    const g = G(master, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .05); noise(g, t, sec, 'highpass', 5000);
    const mid = t + sec * .55, ln = sec * .45; [64, 67, 69, 72, 74, 76, 79, 81, 84].forEach((m, i, a) => LEADS.suona(master, m, mid + i * ln / a.length, ln / a.length * .95, .06 + i * .012));
  }
  function boom() {
    if (!init()) return; const t = ctx.currentTime;
    bigDrum(master, t, 1); gong(master, t, 1, 4); cymbal(master, t, .5, 1.4); firecrackers(master, t + .1, 3.5, 40, .45);
    [[72, 0, .2], [76, .2, .2], [79, .4, .2], [84, .6, 1.4]].forEach(([m, d, l]) => { LEADS.suona(master, m, t + .3 + d, l, .16); LEADS.suona(master, m - 12, t + .3 + d, l, .1); });
    drum(master, t + 2.3, .9); drum(master, t + 2.5, .7); cymbal(master, t + 2.7, .45); smallGong(master, t + 2.7, .3);
  }

  window.FestiveAudio = {
    init, music, playSpec, setSlots, sfx, riser, boom,
    slots: () => SLOTS, defaults: () => DEFAULT_SLOTS,
    options: {
      mel: Object.fromEntries(Object.entries(MELS).map(([k, v]) => [k, v.name])),
      lead: { suona: '嗩吶', guzheng: '古箏', dizi: '笛子', pipa: '琵琶', yangqin: '揚琴', bianzhong: '編鐘', synth: '電子合成', none: '（不要主旋律）' },
      perc: { none: '（不要鑼鼓）', light: '輕柔木魚碰鈴', luogu: '喜慶鑼鼓「咚咚鏘」', march: '輕快進行', jijifeng: '急急風（快板）', lion: '舞獅大鼓', edm: '電子舞曲鼓' }
    },
    ready: () => !!ctx && ctx.state === 'running',
    setVolume(v) { vol = Math.max(0, Math.min(1, +v || 0)); if (master) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(vol, t + .15); } },
    volume: () => vol
  };
  addEventListener('pointerdown', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true });
})();
