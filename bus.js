// 大螢幕 ⇄ 遙控器 的通訊層
// 正式：Firebase Realtime Database 的 remote/ 區塊
// 試玩（?demo 或沒填 Firebase）：同一台電腦、同一個瀏覽器的分頁之間互傳
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const STALE_MS = 8000;

export async function createBus(C, role) {
  const q = new URLSearchParams(location.search);
  const noFb = !C.firebase || !C.firebase.apiKey || /PASTE/.test(C.firebase.apiKey);
  if (q.has('demo') || noFb) return localBus(C, role);
  try { return await firebaseBus(C, role); }
  catch (e) { console.error(e); const b = localBus(C, role); b.loadError = String(e && e.message || e); return b; }
}

function nameOf(C, email) {
  if (!email) return '';
  const m = C.remotes || {};
  return m[email] || m[email.toLowerCase()] || email.split('@')[0];
}

// ---------------- Firebase ----------------
async function firebaseBus(C, role) {
  const [{ initializeApp }, A, D] = await Promise.all([
    import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-database.js')
  ]);
  const app = initializeApp(C.firebase);
  const auth = A.getAuth(app);
  const db = D.getDatabase(app);
  let off = 0, user = null, resolved = false;
  D.onValue(D.ref(db, '.info/serverTimeOffset'), s => { off = s.val() || 0; });
  const now = () => Date.now() + off;
  const userCbs = [];
  A.onAuthStateChanged(auth, u => {
    user = u ? { email: u.email, uid: u.uid, name: nameOf(C, u.email) } : null; resolved = true;
    userCbs.forEach(f => f(user));
  });
  const onConnected = cb => D.onValue(D.ref(db, '.info/connected'), s => cb(!!s.val()));
  const err = e => console.warn('[bus]', e && e.code || e);

  const bus = {
    demo: false, now, nameOf: e => nameOf(C, e),
    onUser(cb) { userCbs.push(cb); if (resolved) cb(user); },
    login: (e, p) => A.signInWithEmailAndPassword(auth, e.trim(), p),
    logout: () => A.signOut(auth),
    onConnected,
    // ---- 大螢幕 ----
    async listenCmds(cb) {
      await D.set(D.ref(db, 'remote/cmds'), null).catch(err);
      const seen = new Set(), t0 = now() - 2000;
      D.onChildAdded(D.query(D.ref(db, 'remote/cmds'), D.orderByChild('t'), D.startAt(t0)), snap => {
        const c = snap.val(); D.remove(snap.ref).catch(err);
        if (!c || seen.has(snap.key)) return; seen.add(snap.key);
        if (typeof c.t === 'number' && c.t < now() - STALE_MS) return; // 斷線期間積壓的舊指令不執行
        cb(Object.assign({ id: snap.key }, c));
      }, err);
    },
    publishState(s) { return D.set(D.ref(db, 'remote/state'), Object.assign({}, s, { t: D.serverTimestamp() })).catch(err); },
    screenPresence() {
      const r = D.ref(db, 'remote/screen');
      onConnected(ok => { if (!ok) return; D.onDisconnect(r).remove(); D.set(r, { by: user && user.email || '', t: D.serverTimestamp() }).catch(err); });
      setInterval(() => D.update(r, { t: D.serverTimestamp() }).catch(err), 10000);
    },
    onRemotes(cb) { D.onValue(D.ref(db, 'remote/remotes'), s => { const v = s.val() || {}; cb(Object.values(v).map(x => x.name)); }, err); },
    // ---- 遙控器 ----
    sendCmd(a, v) {
      const r = D.push(D.ref(db, 'remote/cmds'));
      D.set(r, { a, v: v === undefined ? null : v, by: user ? user.name : '?', t: D.serverTimestamp() }).catch(e => { err(e); bus._onSendErr && bus._onSendErr(e); });
      return r.key;
    },
    onState(cb) { D.onValue(D.ref(db, 'remote/state'), s => cb(s.val()), e => { err(e); cb(null, e); }); },
    onScreen(cb) { D.onValue(D.ref(db, 'remote/screen'), s => { const v = s.val(); cb(v); }, err); },
    remotePresence() {
      const r = D.ref(db, 'remote/remotes/' + user.uid + '_' + Math.random().toString(36).slice(2, 7));
      onConnected(ok => { if (!ok) return; D.onDisconnect(r).remove(); D.set(r, { name: user.name, t: D.serverTimestamp() }).catch(err); });
    }
  };
  return bus;
}

// ---------------- 同瀏覽器試玩 ----------------
function localBus(C, role) {
  const bc = new BroadcastChannel('weiya-remote');
  const me = Math.random().toString(36).slice(2, 8);
  const user = { email: 'demo@local', uid: me, name: role === 'remote' ? '試玩遙控器' : '大螢幕' };
  const H = {};
  const on = (type, f) => (H[type] = H[type] || []).push(f);
  bc.onmessage = e => { const m = e.data || {}; (H[m.type] || []).forEach(f => f(m)); };
  const post = m => bc.postMessage(m);
  const now = () => Date.now();
  let lastState = null, screenT = 0;
  const remotesSeen = {};
  return {
    demo: true, now, nameOf: e => nameOf(C, e),
    onUser(cb) { setTimeout(() => cb(user), 0); },
    login: async () => user, logout: async () => {},
    onConnected(cb) { setTimeout(() => cb(true), 0); },
    listenCmds(cb) { on('cmd', m => cb(m.c)); },
    publishState(s) { lastState = Object.assign({}, s, { t: now() }); post({ type: 'state', s: lastState }); },
    screenPresence() {
      const beat = () => post({ type: 'screen', s: { by: 'demo', t: now() } });
      beat(); setInterval(beat, 2000);
      on('hello', () => { beat(); if (lastState) post({ type: 'state', s: lastState }); });
    },
    onRemotes(cb) {
      on('rem', m => { remotesSeen[m.id] = { name: m.name, t: now() }; });
      setInterval(() => { const n = now(); cb(Object.values(remotesSeen).filter(x => n - x.t < 6000).map(x => x.name)); }, 2000);
    },
    sendCmd(a, v) {
      const id = 'c' + now().toString(36) + Math.random().toString(36).slice(2, 5);
      post({ type: 'cmd', c: { id, a, v: v === undefined ? null : v, by: user.name, t: now() } });
      return id;
    },
    onState(cb) { on('state', m => cb(m.s)); post({ type: 'hello' }); },
    onScreen(cb) {
      on('screen', m => { screenT = m.s.t; cb(m.s); });
      setInterval(() => { if (now() - screenT > 6000) cb(null); }, 2000);
    },
    remotePresence() { const beat = () => post({ type: 'rem', id: me, name: user.name }); beat(); setInterval(beat, 2000); }
  };
}
