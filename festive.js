// 喜慶過年風 音效庫 v2（原創，全部用瀏覽器即時合成）
// 樂器：嗩吶、古箏、笛子、琵琶、揚琴、編鐘、電子合成；鑼鼓：堂鼓、大鑼、小鑼、鈸、木魚、碰鈴；鞭炮
// 每個環節的音樂 = 旋律 × 主奏樂器 × 鑼鼓節奏 × 速度 × 和聲，設定寫在 config.js 的 music（用 music-lab.html 挑）
// 大螢幕和兩個遊戲共用：<script src="../weiya-show/festive.js"></script>
(function () {
  'use strict';
  if (window.FestiveAudio) return;
  // 遊戲嵌在大螢幕裡時，直接用大螢幕那一套（聲音已解鎖、音量一起控制）
  try { if (window.parent !== window && window.parent.FestiveAudio) { window.FestiveAudio = window.parent.FestiveAudio; return; } } catch (e) {}

  let ctx = null, master = null, musicBus = null, noiseBuf = null, vol = 1, ducked = false;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = vol;
    const comp = ctx.createDynamicsCompressor();   // 讓大小聲比較一致
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .25;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = ducked ? DUCK : 1; musicBus.connect(master);   // 背景音樂專用（講話時壓低）
    const n = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const a = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
    return ctx;
  }
  let DUCK = .12;   // 主持人講話時背景音樂剩多少（0.12 = 12%）
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
    // 鋼琴：清楚的起音＋自然衰減（電影感致詞用）
    piano(d, m, t, len, v = .16) { const f = N(m), L = Math.max(1.6, len * 1.4); [[1, 1, 'triangle'], [2, .3, 'sine'], [3, .12, 'sine']].forEach(([k, a, ty]) => { const g = G(d, 0); env(g, t, v * a, .004, L / k); osc(ty, f * k, g, t, L); }); const g = G(d, 0); env(g, t, v * .2, .001, .03); noise(g, t, .04, 'bandpass', f * 4, 2); },
    // 弦樂：慢慢拉起來的合奏聲
    strings(d, m, t, len, v = .07) { const f = N(m), L = Math.max(.4, len), g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.35, L * .5)); g.gain.setValueAtTime(v, t + Math.max(.36, L - .2)); g.gain.linearRampToValueAtTime(.0001, t + L + .3); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.connect(g); const lg = vibrato(t, f, .006, 5, L + .3, .3); for (const k of [1, 1.004, .996]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * k; lg.connect(o.frequency); o.connect(lp); o.start(t); o.stop(t + L + .35); } },
    // 銅管：頒獎典禮的號角和弦
    brass(d, m, t, len, v = .09) { const f = N(m), L = Math.max(.25, len), g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .05); g.gain.setValueAtTime(v * .85, t + Math.max(.06, L - .08)); g.gain.exponentialRampToValueAtTime(.0001, t + L + .1); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(2600, t + .08); lp.connect(g); for (const k of [1, 1.005]) osc('sawtooth', f * k, lp, t, L + .1); },
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
    // 電影感懸疑：定音鼓滾奏＋心跳低鼓，每 4 小節一次鈸聲往上推
    cine(d, s, t) { const b = s % 8; if (b === 0) drum(d, t, .75, .6, .9); if (b === 3) drum(d, t, .35, .6, .5); if (b === 4) drum(d, t, .5, .62, .7); if (s % 32 >= 28) drum(d, t, .25 + (s % 32 - 28) * .12, .7, .2); if (s % 32 === 0) { const g = G(d, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + 1.5); g.gain.linearRampToValueAtTime(0, t + 1.6); noise(g, t, 1.6, 'highpass', 5000); } },
    // 心跳：很輕的低鼓，只營造期待感
    pulse(d, s, t) { const b = s % 8; if (b === 0) drum(d, t, .4, .55, .5); if (b === 1) drum(d, t, .25, .55, .4); if (s % 16 === 8) woodblock(d, t, .05, 800); },
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
    G: { name: '神祕期待', bass: [38, 38, 34, 36, 38, 38, 41, 40], n: [74,_,_,_,_,_,72,_, 69,_,_,_,_,_,_,_, 74,_,_,_,77,_,76,_, 72,_,_,_,_,_,_,_, 69,_,_,_,72,_,74,_, 76,_,_,_,74,_,_,_, 72,_,69,_,67,_,_,_, 69,_,_,_,_,_,_,_] },
    H: { name: '隆重頒獎', bass: [48, 48, 41, 43, 48, 45, 41, 43], n: [72,_,_,76,79,_,_,_, 84,_,_,_,79,_,_,_, 81,_,79,_,76,_,74,_, 76,_,_,_,72,_,_,_, 72,_,_,76,79,_,_,_, 84,_,_,_,86,_,84,_, 81,_,79,_,77,_,76,_, 72,_,_,_,_,_,_,_] },
    I: { name: '溫暖頒獎', bass: [48, 45, 41, 43, 48, 45, 41, 43], n: [76,_,_,_,79,_,_,_, 81,_,79,_,76,_,_,_, 74,_,_,_,76,_,72,_, 74,_,_,_,_,_,_,_, 76,_,_,_,79,_,_,_, 84,_,81,_,79,_,_,_, 77,_,76,_,74,_,72,_, 72,_,_,_,_,_,_,_] },
    F: { name: '溫馨收尾', bass: [48, 45, 43, 45, 48, 43, 45, 48], n: [72,_,_,_,74,_,76,_, 79,_,_,_,76,_,_,_, 74,_,_,_,72,_,74,_, 69,_,_,_,_,_,_,_, 72,_,_,_,74,_,76,_, 79,_,81,_,79,_,76,_, 74,_,76,_,72,_,_,_, _,_,_,_,_,_,_,_] }
  };

  // ================= 每個環節的預設音樂（config.js 的 music 會覆蓋） =================
  // pad：true = 柔和和弦、'strings' = 弦樂鋪底
  const DEFAULT_SLOTS = {
    welcome:    { name: '迎賓・報到（維持原本）',   mel: 'B', lead: 'guzheng',   perc: 'light',    bpm: 92,  pad: true,      vol: .9 },
    speech:     { name: '開場致詞（電影感鋼琴弦樂）', mel: 'B', lead: 'piano',     perc: 'none',     bpm: 72,  pad: 'strings', vol: .8 },
    dine:       { name: '用餐・感謝貴賓',           mel: 'F', lead: 'dizi',      perc: 'light',    bpm: 84,  pad: true,      vol: .8 },
    mahjong:    { name: '麻將賓果（輕快遊戲）',     mel: 'C', lead: 'yangqin',   perc: 'march',    bpm: 116, pad: false,     vol: .7 },
    drawPrep:   { name: '抽獎・準備（暖場節奏）',   mel: 'A', lead: 'suona',     perc: 'luogu',    bpm: 120, pad: false,     vol: .9 },
    drawA:      { name: '抽獎中 A（節奏懸疑）',     mel: 'D', lead: 'pipa',      perc: 'jijifeng', bpm: 124, pad: false,     vol: .9 },
    drawB:      { name: '抽獎中 B（鼓點加強）',     mel: 'D', lead: 'synth',     perc: 'lion',     bpm: 132, pad: true,      vol: .9 },
    drawC:      { name: '抽獎中 C（電影感期待）',   mel: 'G', lead: 'strings',   perc: 'cine',     bpm: 100, pad: 'strings', vol: 1 },
    luckyPrep:  { name: '最佳幸運兒・揭曉前（神祕）', mel: 'G', lead: 'bianzhong', perc: 'pulse',    bpm: 84,  pad: 'strings', vol: .9 },
    luckyWin:   { name: '最佳幸運兒・慶祝',         mel: 'A', lead: 'yangqin',   perc: 'luogu',    bpm: 128, pad: true,      vol: .9 },
    secondPrep: { name: '二獎・抽獎前（強烈期待）', mel: 'G', lead: 'brass',     perc: 'cine',     bpm: 96,  pad: 'strings', vol: 1 },
    secondDraw: { name: '二獎・抽獎中（高級緊張）', mel: 'D', lead: 'strings',   perc: 'cine',     bpm: 112, pad: 'strings', vol: 1 },
    truefalse:  { name: '真的還假的（沒載入音檔時的備用）', mel: 'D', lead: 'pipa', perc: 'jijifeng', bpm: 132, pad: false, vol: .8 },
    coins:      { name: '財神撒金幣・遊戲中',       mel: 'E', lead: 'suona',     perc: 'lion',     bpm: 150, pad: false,     vol: .85 },
    coinsFinal: { name: '財神撒金幣・最後 10 秒',   mel: 'E', lead: 'suona',     perc: 'jijifeng', bpm: 176, pad: false,     vol: 1 },
    grandWait:  { name: '頭獎・揭曉前',             mel: 'G', lead: 'bianzhong', perc: 'pulse',    bpm: 80,  pad: 'strings', vol: .8 },
    grandWin:   { name: '頭獎・揭曉高潮',           mel: 'H', lead: 'brass',     perc: 'luogu',    bpm: 124, pad: 'strings', vol: 1 },
    award:      { name: '頭獎・上台領獎拍照',       mel: 'I', lead: 'piano',     perc: 'light',    bpm: 92,  pad: 'strings', vol: .55 },
    bonus:      { name: '有沒有人要加碼？（懸念）', mel: 'G', lead: 'pipa',      perc: 'pulse',    bpm: 96,  pad: true,      vol: .8 },
    ending:     { name: '感謝蒞臨・散場',           mel: 'F', lead: 'guzheng',   perc: 'light',    bpm: 88,  pad: true,      vol: .8 }
  };
  // 舊名稱相容
  const ALIAS = { party: 'drawPrep', game: 'truefalse', draw: 'drawPrep', grand: 'grandWait' };
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
        if (S.pad === 'strings') for (const iv of [12, 19, 24]) LEADS.strings(d, bm + iv, t, st * 7.5, .03);
        else if (S.pad) for (const iv of [12, 19, 24]) { const pg = G(d, 0); pg.gain.setValueAtTime(.0001, t); pg.gain.linearRampToValueAtTime(.025, t + st * 2); pg.gain.linearRampToValueAtTime(.0001, t + st * 8); osc('sine', N(bm + iv), pg, t, st * 8); }
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
    const bus = G(musicBus, 0), t = ctx.currentTime; bus.gain.setValueAtTime(0, t); bus.gain.linearRampToValueAtTime(spec.vol == null ? 1 : spec.vol, t + sec);
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
    firecrackers(sec = 2.5) { if (!init()) return; firecrackers(master, now(), sec); },
    // 掌聲：很多隨機拍手聲疊在一起，先變大再慢慢收
    applause(sec = 4, v = .35) { if (!init()) return; const t = now(), n = Math.floor(sec * 70); for (let i = 0; i < n; i++) { const tt = t + Math.random() * sec, k = Math.min(1, tt - t) * Math.min(1, (t + sec - tt) / 1.2); const g = G(master, 0); env(g, tt, v * k * R(.3, 1), .001, R(.03, .08)); noise(g, tt, .1, 'bandpass', R(900, 2400), 1.5); } },
    // 歡呼：寬頻的人聲感噪音隆起
    cheer(sec = 2.5, v = .14) { if (!init()) return; const t = now(); for (const f of [700, 1200, 1900]) { const g = G(master, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + sec); const bp = noise(g, t, sec, 'bandpass', f, 2.5); bp.frequency.linearRampToValueAtTime(f * 1.15, t + .4); } },
    // 一般抽獎揭曉：大鼓＋鈸＋銅管和弦＋歡呼掌聲（短而有力）
    reveal() { if (!init()) return; const t = now(); bigDrum(master, t, 1); cymbal(master, t, .5, 1.2); [67, 71, 74, 79].forEach(m => LEADS.brass(master, m, t + .02, .9, .07)); sfx.cheer(2.2); setTimeout(() => sfx.applause(3.2, .3), 250); },
    // 最佳幸運兒：優雅的上行琶音＋鐘聲＋和弦
    revealElegant() { if (!init()) return; const t = now(); [67, 71, 74, 79, 83, 86].forEach((m, i) => LEADS.guzheng(master, m, t + i * .07, 1.2, .14)); bell(master, t + .45, .12); [72, 76, 79, 84].forEach(m => LEADS.strings(master, m, t + .45, 1.6, .05)); drum(master, t + .45, .7, .7, .8); setTimeout(() => sfx.applause(3.5, .28), 600); },
    // 二獎：大鑼＋大鼓＋隆重銅管＋鞭炮＋掌聲
    revealBig() { if (!init()) return; const t = now(); bigDrum(master, t, 1); gong(master, t, .9, 3.5); cymbal(master, t, .5, 1.6); [[60, 0], [67, 0], [72, 0], [76, 0], [79, .35], [84, .35]].forEach(([m, d]) => LEADS.brass(master, m, t + d, 1.4 - d, .07)); firecrackers(master, t + .2, 2.4, 30, .3); sfx.cheer(3); setTimeout(() => sfx.applause(4, .32), 300); },
    // 麻將賓果：木魚連打＋鏘
    bingo() { if (!init()) return; const t = now(); [0, .08, .16, .24].forEach((d, i) => woodblock(master, t + d, .3, 1100 + i * 150)); cymbal(master, t + .34, .4); smallGong(master, t + .34, .3); LEADS.suona(master, 79, t + .36, .5, .12); },
    // 金幣「叮」
    coin() { if (!init()) return; const t = now(); for (const [f, d] of [[1975, 0], [2637, .07]]) { const g = G(master, 0); env(g, t + d, .1, .002, .35); osc('sine', f, g, t + d, .4); } }
  };
  // 頭獎揭曉：鼓聲＋弦樂慢慢堆高（sec 秒），然後大鑼＋銅管號角＋煙火鞭炮＋歡呼
  function grandBuild(sec = 6) {
    if (!init()) return; const t = ctx.currentTime; let tt = 0, gap = .45;
    while (tt < sec) { drum(master, t + tt, .25 + .6 * tt / sec, .65, .5); tt += gap; gap = Math.max(.06, gap * .9); }
    [50, 57, 62, 66, 69].forEach((m, i) => { const g = G(master, 0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05 + i * .01, t + sec); g.gain.linearRampToValueAtTime(.0001, t + sec + .1); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(3500, t + sec); lp.connect(g); for (const k of [1, 1.005]) osc('sawtooth', N(m) * k, lp, t, sec + .1); });
    const g = G(master, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .05); noise(g, t, sec, 'highpass', 5000);
  }
  function grandHit() {
    if (!init()) return; const t = ctx.currentTime;
    bigDrum(master, t, 1); gong(master, t, 1, 4.5); cymbal(master, t, .55, 1.8);
    [[60, 0, 1.6], [64, 0, 1.6], [67, 0, 1.6], [72, 0, 1.6], [72, 1.7, .25], [76, 1.95, .25], [79, 2.2, 1.8], [84, 2.2, 1.8], [67, 2.2, 1.8]].forEach(([m, d, l]) => LEADS.brass(master, m, t + d, l, .075));
    firecrackers(master, t + .2, 3.5, 36, .35); sfx.cheer(3.5, .16); setTimeout(() => sfx.applause(5, .32), 400);
  }
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
    init, music, playSpec, setSlots, sfx, riser, boom, grandBuild, grandHit,
    // 主持人講話：背景音樂壓到 level（音效不受影響）
    duck(on, level, sec = .6) { ducked = !!on; if (level != null) DUCK = level; if (!musicBus) return; const t = ctx.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t); musicBus.gain.linearRampToValueAtTime(ducked ? DUCK : 1, t + sec); },
    isDucked: () => ducked,
    current: () => cur && cur.spec,
    slots: () => SLOTS, defaults: () => DEFAULT_SLOTS,
    options: {
      mel: Object.fromEntries(Object.entries(MELS).map(([k, v]) => [k, v.name])),
      lead: { suona: '嗩吶', guzheng: '古箏', dizi: '笛子', pipa: '琵琶', yangqin: '揚琴', bianzhong: '編鐘', piano: '鋼琴', strings: '弦樂', brass: '銅管', synth: '電子合成', none: '（不要主旋律）' },
      perc: { none: '（不要鑼鼓）', light: '輕柔木魚碰鈴', pulse: '心跳低鼓（期待感）', cine: '電影感定音鼓', luogu: '喜慶鑼鼓「咚咚鏘」', march: '輕快進行', jijifeng: '急急風（快板）', lion: '舞獅大鼓', edm: '電子舞曲鼓' },
      pad: { false: '不要', true: '柔和和弦', strings: '弦樂鋪底' }
    },
    ready: () => !!ctx && ctx.state === 'running',
    setVolume(v) { vol = Math.max(0, Math.min(1, +v || 0)); if (master) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(vol, t + .15); } },
    volume: () => vol
  };
  addEventListener('pointerdown', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true });
})();
