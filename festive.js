// 喜慶過年風 音效庫（原創，全部用瀏覽器即時合成：鼓、鑼、鈸、木魚、嗩吶、鞭炮）
// 大螢幕和兩個遊戲共用：<script src="../weiya-show/festive.js"></script>
// 用法：FestiveAudio.sfx.gong()、FestiveAudio.music('party')、FestiveAudio.setVolume(0.8) …
(function () {
  'use strict';
  if (window.FestiveAudio) return;
  // 遊戲嵌在大螢幕裡時，直接用大螢幕那一套（大螢幕已經點過「開始」，聲音已解鎖，音量也一起控制）
  try { if (window.parent !== window && window.parent.FestiveAudio) { window.FestiveAudio = window.parent.FestiveAudio; return; } } catch (e) {}
  let ctx = null, master = null, comp = null, noiseBuf = null, vol = 1;
  const groups = {};      // 音樂分軌：party / game，各自一個 gain 用來淡入淡出
  let current = null, step = 0, nextT = 0, timer = null;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = vol;
    // 壓縮器：讓鼓、鑼、嗩吶的大小聲比較一致，不會某一下特別刺耳
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .25;
    master.connect(comp); comp.connect(ctx.destination);
    const n = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const a = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
    for (const k of ['party', 'game', 'dine']) { const g = ctx.createGain(); g.gain.value = 0; g.connect(master); groups[k] = g; }
    return ctx;
  }
  const N = m => 440 * Math.pow(2, (m - 69) / 12);
  const R = (a, b) => a + Math.random() * (b - a);
  function env(g, t, peak, a, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, .0002), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function osc(type, f, dest, t, len) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + len + .05); return o; }
  function noise(dest, t, len, filterType, freq, q) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; if (q) f.Q.value = q;
    s.connect(f); f.connect(dest); s.start(t, Math.random()); s.stop(t + len + .05); return f;
  }
  function gainNode(dest, v) { const g = ctx.createGain(); g.gain.value = v == null ? 1 : v; g.connect(dest || master); return g; }

  // ---------- 樂器 ----------
  // 堂鼓「咚」
  function drum(dest, t, v = .8, pitch = 1, len = .35) {
    const g = gainNode(dest, 0); env(g, t, v, .005, len);
    const o = osc('sine', 150 * pitch, g, t, len); o.frequency.exponentialRampToValueAtTime(52 * pitch, t + len * .7);
    const g2 = gainNode(dest, 0); env(g2, t, v * .35, .002, .06); noise(g2, t, .08, 'lowpass', 700);
  }
  const bigDrum = (dest, t, v = 1) => drum(dest, t, v, .72, .9);
  // 木魚／梆子「叩」
  function woodblock(dest, t, v = .35, f = 1150) {
    const g = gainNode(dest, 0); env(g, t, v, .002, .07); osc('sine', f, g, t, .1);
    const g2 = gainNode(dest, 0); env(g2, t, v * .5, .001, .03); noise(g2, t, .04, 'bandpass', f * 2.2, 6);
  }
  // 鈸「鏘」
  function cymbal(dest, t, v = .35, len = .7) {
    const g = gainNode(dest, 0); env(g, t, v, .003, len);
    noise(g, t, len, 'highpass', 4200);
    const g2 = gainNode(dest, 0); env(g2, t, v * .25, .002, len * .5);
    [587, 829, 1183, 1571].forEach(f => osc('square', f * R(.99, 1.01), g2, t, len * .5));
  }
  // 小鑼「嘡」：音高往上飄（京劇小鑼的感覺）
  function smallGong(dest, t, v = .3) {
    const g = gainNode(dest, 0); env(g, t, v, .004, .55);
    const o = osc('sine', 820, g, t, .6); o.frequency.linearRampToValueAtTime(1010, t + .25);
    const o2 = osc('triangle', 1640, g, t, .6); o2.frequency.linearRampToValueAtTime(2010, t + .25);
  }
  // 大鑼「哐～」
  function gong(dest, t, v = .7, len = 3) {
    [[98, 1], [147, .7], [208, .55], [262, .4], [331, .3], [419, .2]].forEach(([f, k]) => {
      const g = gainNode(dest, 0); env(g, t, v * k * .5, .01, len * R(.7, 1));
      const o = osc('sine', f, g, t, len); o.frequency.exponentialRampToValueAtTime(f * .96, t + len);
    });
    const g = gainNode(dest, 0); env(g, t, v * .4, .003, .35); noise(g, t, .4, 'lowpass', 1500);
  }
  // 嗩吶：鋸齒波＋方波、帶通濾波、顫音，起音稍微從下面滑上來
  function suona(dest, m, t, len, v = .12) {
    const f = N(m), g = gainNode(dest, 0);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03);
    g.gain.setValueAtTime(v, t + Math.max(.04, len - .06)); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = .9; bp.connect(g);
    const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 3200; pk.gain.value = 6; pk.connect(bp);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.8; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .018, t + Math.min(.3, len));
    lfo.connect(lg); lfo.start(t); lfo.stop(t + len + .05);
    for (const [type, k] of [['sawtooth', 1], ['square', .5]]) {
      const o = ctx.createOscillator(), og = ctx.createGain(); og.gain.value = k; o.type = type;
      o.frequency.setValueAtTime(f * .955, t); o.frequency.exponentialRampToValueAtTime(f, t + .06);
      lg.connect(o.frequency); o.connect(og); og.connect(pk); o.start(t); o.stop(t + len + .05);
    }
  }
  // 古箏撥弦：快起音、慢慢消失，起音音高稍微高一點再落下
  function guzheng(dest, m, t, v = .16, len = 1.4) {
    const f = N(m), g = gainNode(dest, 0); env(g, t, v, .004, len);
    const o = osc('triangle', f * 1.008, g, t, len); o.frequency.exponentialRampToValueAtTime(f, t + .08);
    const g2 = gainNode(dest, 0); env(g2, t, v * .35, .003, len * .4); osc('sine', f * 2, g2, t, len * .4);
    const g3 = gainNode(dest, 0); env(g3, t, v * .3, .001, .02); noise(g3, t, .03, 'bandpass', f * 3, 4);
  }
  // 碰鈴「叮」
  function bell(dest, t, v = .08) { const g = gainNode(dest, 0); env(g, t, v, .002, 1.6); osc('sine', 2093, g, t, 1.6); const g2 = gainNode(dest, 0); env(g2, t, v * .4, .002, .8); osc('sine', 3136, g2, t, .8); }
  // 鞭炮：一串隨機的劈啪聲
  function firecrackers(dest, t, len = 2.5, density = 34, v = .5) {
    const n = Math.floor(len * density);
    for (let i = 0; i < n; i++) {
      const tt = t + Math.pow(Math.random(), .8) * len, g = gainNode(dest, 0);
      env(g, tt, v * R(.3, 1), .001, R(.02, .06)); noise(g, tt, .08, 'highpass', R(900, 2600));
    }
  }

  // ---------- 背景音樂（原創旋律，五聲音階） ----------
  const _ = 0;
  const SONGS = {
    // 用餐：輕鬆的古箏＋碰鈴，鼓點很輕，不吵大家吃飯聊天
    dine: {
      stepLen: .3, inst: 'guzheng',
      mel: [79, _, 76, _, 74, 76, _, 72, 74, _, _, _, 69, _, 72, _, 74, _, 76, 79, _, 76, 74, _, 72, _, 69, _, 67, _, _, _,
            72, _, 74, _, 76, _, 79, 76, 74, _, 72, _, 74, _, _, _, 76, 74, 72, _, 69, _, 72, 69, 67, _, _, _, _, _, _, _],
      bass: [43, 48, 45, 50],
      arp: [55, 62, 67, 62],
      perc(d, s, t) {
        const b = s % 8;
        if (b === 0) drum(d, t, .18, .9, .3);
        if (b === 0 || b === 6) woodblock(d, t, .07, 950);
        if (s % 16 === 8) bell(d, t, .06);
        if (s % 2 === 1) guzheng(d, this.arp[(s >> 1) % 4], t, .05, .7);
      }
    },
    // 喜慶：120 BPM，八分音符一格，32 格一輪；「咚 咚 鏘」鑼鼓點
    party: {
      stepLen: .25,
      mel: [67, _, 69, _, 72, 74, 76, _, 74, 72, 69, _, 72, _, _, _, 76, _, 79, _, 76, 74, 72, _, 69, 72, 74, _, 67, _, _, _,
            72, _, 74, 76, 79, _, 76, _, 74, 76, 74, 72, 69, _, _, _, 67, 69, 72, _, 74, _, 76, 74, 72, _, 69, _, 67, _, _, _],
      bass: [43, 48, 45, 43, 48, 45, 43, 43],
      perc(d, s, t) {
        const b = s % 8;
        if (b === 0) drum(d, t, .7);
        if (b === 2) drum(d, t, .45);
        if (b === 4) { cymbal(d, t, .22, .45); }
        if (b === 6) drum(d, t, .55);
        if (b % 2 === 1) woodblock(d, t, .12);
        if (s % 32 === 16) smallGong(d, t, .18);
      }
    },
    // 緊張：「急急風」快板鑼鼓，嗩吶短句
    game: {
      stepLen: .14,
      mel: [62, _, 65, _, 67, _, _, _, 69, 67, 65, _, 62, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _,
            67, _, 69, _, 72, _, _, _, 74, 72, 69, _, 67, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
      bass: [38, 38, 41, 43],
      perc(d, s, t) {
        const b = s % 8;
        drum(d, t, b === 0 ? .65 : b === 4 ? .5 : .22, 1.1, .2);
        if (b === 0) smallGong(d, t, .14);
        if (b === 4) cymbal(d, t, .15, .25);
        if (s % 64 === 0) gong(d, t, .35, 2.2);
      }
    }
  };
  function sched() {
    if (!current) return;
    const S = SONGS[current], d = groups[current];
    while (nextT < ctx.currentTime + .25) {
      const len = S.mel.length, s = step % len, m = S.mel[s];
      if (m) {
        if (S.inst === 'guzheng') guzheng(d, m, nextT, .15);
        else { let k = 1; while (k < 4 && !S.mel[(s + k) % len]) k++; suona(d, m, nextT, S.stepLen * k * .95, current === 'party' ? .11 : .08); }
      }
      if (s % 8 === 0) { const bm = S.bass[(s / 8) % S.bass.length]; const g = gainNode(d, 0); env(g, nextT, S.inst === 'guzheng' ? .14 : .22, .02, S.stepLen * 7); osc('triangle', N(bm), g, nextT, S.stepLen * 8); }
      S.perc(d, s, nextT);
      step++; nextT += S.stepLen;
    }
  }
  function fade(g, v, sec) { const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + sec); }
  // name：'party'、'game' 或 null（全部淡出）
  function music(name, sec = 1.2) {
    if (!init()) return;
    for (const k in groups) fade(groups[k], k === name ? 1 : 0, sec);
    if (name && name !== current) { current = name; step = 0; nextT = ctx.currentTime + .1; }
    if (!name) setTimeout(() => { if (Object.values(groups).every(g => g.gain.value < .01)) current = null; }, sec * 1000 + 100);
    if (!timer) timer = setInterval(sched, 50);
  }

  // ---------- 音效（遊戲和大螢幕共用） ----------
  const now = () => (init(), ctx.currentTime);
  const sfx = {
    tick() { if (!init()) return; woodblock(master, now(), .4); },                        // 倒數最後幾秒
    join() { if (!init()) return; woodblock(master, now(), .22, 1500); },                 // 有人加入
    drum() { if (!init()) return; drum(master, now(), .8); },                             // 倒數 3、2、1
    chang() { if (!init()) return; const t = now(); cymbal(master, t, .35); smallGong(master, t, .3); },  // 題目出現「鏘」
    gong() { if (!init()) return; gong(master, now(), .8); },                             // 時間到
    start() { if (!init()) return; const t = now(); bigDrum(master, t, 1); gong(master, t + .02, .7); cymbal(master, t + .02, .35); },
    roll(sec = 1.8) { if (!init()) return; const t = now(); let tt = 0, k = 0; while (tt < sec) { drum(master, t + tt, .25 + .5 * tt / sec, 1.15, .18); tt += Math.max(.045, .12 - k * .004); k++; } cymbal(master, t + sec, .4); },
    fanfare() {                                                                            // 公布、冠軍：咚咚鏘＋嗩吶＋鞭炮
      if (!init()) return; const t = now();
      drum(master, t, .9); drum(master, t + .18, .7); cymbal(master, t + .36, .4); smallGong(master, t + .36, .3);
      [72, 74, 76, 79, 81, 84].forEach((m, i) => suona(master, m, t + .5 + i * .11, i === 5 ? .9 : .13, .14));
      firecrackers(master, t + .5, 1.6, 28, .35);
    },
    firecrackers(sec = 2.5) { if (!init()) return; firecrackers(master, now(), sec); }
  };
  // 頭獎集氣：鼓越打越快、鈸越來越大聲、最後嗩吶往上衝
  function riser(sec = 9) {
    if (!init()) return; const t = ctx.currentTime;
    let tt = 0, gap = .5;
    while (tt < sec) { drum(master, t + tt, .3 + .6 * tt / sec, 1, .25); if (tt > sec * .6) woodblock(master, t + tt + gap / 2, .15); tt += gap; gap = Math.max(.05, gap * .93); }
    const g = gainNode(master, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + sec); g.gain.linearRampToValueAtTime(0, t + sec + .05); noise(g, t, sec, 'highpass', 5000);
    const mid = t + sec * .55, ln = sec * .45;
    [64, 67, 69, 72, 74, 76, 79, 81, 84].forEach((m, i, a) => suona(master, m, mid + i * ln / a.length, ln / a.length * .95, .06 + i * .012));
  }
  // 頭獎爆開：大鑼＋大鼓＋鈸＋鞭炮＋嗩吶號角
  function boom() {
    if (!init()) return; const t = ctx.currentTime;
    bigDrum(master, t, 1); gong(master, t, 1, 4); cymbal(master, t, .5, 1.4);
    firecrackers(master, t + .1, 3.5, 40, .45);
    [[72, 0, .2], [76, .2, .2], [79, .4, .2], [84, .6, 1.4]].forEach(([m, d, l]) => { suona(master, m, t + .3 + d, l, .16); suona(master, m - 12, t + .3 + d, l, .1); });
    drum(master, t + 2.3, .9); drum(master, t + 2.5, .7); cymbal(master, t + 2.7, .45); smallGong(master, t + 2.7, .3);
  }

  window.FestiveAudio = {
    init, music, sfx, riser, boom,
    ready: () => !!ctx && ctx.state === 'running',
    setVolume(v) { vol = Math.max(0, Math.min(1, +v || 0)); if (master) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(vol, t + .15); } },
    volume: () => vol
  };
  // 瀏覽器規定要先點一下才能出聲：第一次點擊時自動啟動
  addEventListener('pointerdown', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true });
})();
