// 尾牙主持大螢幕＋手機遙控器 設定檔
// 在 GitHub 上點這個檔案 → 鉛筆 ✏️ 修改 → Commit，約 10 分鐘生效。
// ⚠ 這個檔案是公開的（任何人都能看到），主管加碼的金額、名單這類「不能劇透」的資料不要寫在這裡。
window.WEIYA = {
  // Firebase（跟所有尾牙遊戲共用 weiya-2026 專案）
  firebase: {
    apiKey: "AIzaSyAONdwzgIzxjFT0-eDIoKekToNUh4bMcC0",
    authDomain: "weiya-2026-15529.firebaseapp.com",
    databaseURL: "https://weiya-2026-15529-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "weiya-2026-15529",
    appId: "1:925908014479:web:6218bf40ad3ee80162e7fa"
  },

  // 大螢幕登入用的主持人帳號（遊戲也要這個帳號）
  hostEmail: "host@weiya2026.com",

  // 可以用遙控器的帳號 → 遙控器上顯示的名字（資料庫規則也要有一樣的帳號）
  remotes: {
    "host@weiya2026.com": "Jason",
    "host2@weiya2026.com": "備援"
  },

  // 手機遙控器：按住多久才執行（毫秒）
  holdMs: 800,
  // 麻將牌要按住多久（毫秒）。牌一張接一張抽，覺得 0.8 秒太慢可以改短，例如 500
  mjHoldMs: 800,

  // 嵌進大螢幕的遊戲（網址是相對位置，不用改）
  games: {
    coins: { name: "財神撒金幣", url: "../weiya-coins/screen.html" },
    truefalse: { name: "真的還假的", url: "../weiya-truefalse/screen.html", questions: "../weiya-truefalse/questions.js" }
  },

  // 進財神撒金幣前播的動畫
  // ⏳ 待提供：目前的 intro.mp4 是「英雄漫畫版」，你說版本不對；收到正確的檔案後再換。
  introVideo: "intro.mp4",
  videoVolume: 0.4,          // 影片音量（跟網頁音樂比）

  // 主持人講話時（遙控器「🎤 講話」或鍵盤 T），背景音樂剩多少：0.12 = 12%
  talkVolume: 0.12,

  // 「真的還假的」開場和遊戲用的音檔（你提供的《Way Back Then》）
  // src：網站上的音檔，任何電腦打開都有。要換歌：上傳新檔案後改這個檔名，
  // 或在大螢幕右下角按「🎵 載入音檔」選檔案（只對那台電腦有效，會優先使用）。
  // ⚠ 這首歌有版權，repo 是公開的；收到下架通知的話，把檔案刪掉、src 改成 "" 就好。
  tfTrack: {
    src: "tf-track.mp3",
    titleAt: 10,             // 開場第幾秒出現「真的還假的」大標題
    talkAfter: 4,            // 標題出現後幾秒，音樂降到講話音量
    talkVol: 0.15,           // 主持人講話時的音量
    loopFrom: 12, loopTo: 66,            // 講話、等待時播放的段落（秒）
    tension: [69, 79, 89],               // 10 秒作答時輪流使用的高潮段落起點（秒）
    answerVol: 0.6, lastVol: 0.75, revealVol: 0.3,
    boardFrom: 103                       // 排行榜時從第幾秒播
  },

  // 獎項金額（照企劃書）
  prizes: { "頭獎": 60000, "二獎": 36000, "三獎": 18000, "四獎": 13000, "五獎": 8000 },

  // 麻將賓果實際使用的牌（可增減；每張只能抽出一次）
  // 預設：萬子 1～9、筒子 1～9、條子 1～9、東南西北中發白 = 34 種
  // ⏳ 實際用哪些牌、幾張還沒確認，確認後改這裡。
  mahjong: {
    suits: ["m", "p", "s", "z"],           // m 萬、p 筒、s 條、z 字牌（東南西北中發白）；不要的拿掉
    copies: 1                               // 同一種牌有幾張（1 = 每種一張）
  },

  // 畫面右上角的日期地點
  meta: "2027.1.16（六）・竹北",
  showTime: false,
  showFlow: false,

  // 流程（照 2027 尾牙活動企劃書 17:30 開席版）
  // type：card（一般）／board（麻將投影板）／draw（抽獎，有準備、抽獎中、揭曉三階段）／tfIntro（真的還假的開場）／grand（頭獎）
  // music：用哪一組音樂（名稱見 festive.js 或 music-lab.html）
  stages: [
    { t: "16:45", ic: "🏮", h: "歡迎蒞臨", ml: "Welcome · Chào mừng", d: "請到報到處簽到、領麻將紙，再入座", chip: "報到", music: "welcome", mood: "dine", moodTag: "" },
    { t: "17:30", ic: "🥂", h: "開場致詞", ml: "Opening Remarks · Phát biểu khai mạc", d: "董事長致詞・各單位主管致詞", chip: "致詞", music: "speech", mood: "dine", moodTag: "" },
    { t: "17:55", type: "board", ic: "🀄", h: "麻將賓果", ml: "Mahjong Bingo · Bingo mạt chược", chip: "麻將", music: "mahjong", mood: "game", moodTag: "" },

    { t: "18:20", type: "draw", round: 1, by: "Yang", prizes: [["四獎", 1], ["五獎", 2]], variant: "A", chip: "抽獎 1" },
    { t: "18:25", type: "draw", round: 2, by: "Mark", prizes: [["三獎", 1], ["四獎", 1], ["五獎", 2]], variant: "B", chip: "抽獎 2" },
    { t: "18:30", type: "draw", round: 3, by: "CC", prizes: [["三獎", 1], ["四獎", 1], ["五獎", 2]], variant: "C", chip: "抽獎 3" },

    { t: "18:35", ic: "🤝", h: "感謝貴賓", ml: "Our Guests & Sponsors · Cảm ơn quý khách", d: "介紹客戶與贊助廠商", chip: "貴賓", music: "dine", mood: "dine", moodTag: "" },

    { t: "18:40", type: "draw", round: 4, by: "小Eric", prizes: [["三獎", 1], ["四獎", 1], ["五獎", 2]], variant: "A", chip: "抽獎 4" },
    { t: "18:45", type: "draw", round: 5, by: "Doris", prizes: [["三獎", 1], ["四獎", 1], ["五獎", 2]], variant: "B", chip: "抽獎 5" },
    { t: "18:50", type: "draw", round: 6, by: "Jerry", prizes: [["三獎", 1], ["四獎", 1], ["五獎", 2]], variant: "C", chip: "抽獎 6" },

    { t: "18:55", type: "tfIntro", h: "真的還假的？", ml: "TRUE OR FALSE · THẬT HAY GIẢ", chip: "真假開場", mood: "game", moodTag: "",
      rules: [
        { zh: "掃 QR Code，選語言，輸入本名", sub: "Scan the QR code · Quét mã QR — choose language, enter your name" },
        { zh: "題目出現後 10 秒內，選 ⭕ 真的 或 ❌ 假的", sub: "10 seconds — True or False · 10 giây — Thật hay Giả" },
        { zh: "按下去就不能改！", sub: "No changes after you tap · Bấm rồi không đổi được" },
        { zh: "答對 500 分＋越快越多，最高 1000 分", sub: "Faster = more points · Càng nhanh càng nhiều điểm" },
        { zh: "總分前 10 名有獎金", sub: "Top 10 win prizes · Top 10 có thưởng" }
      ] },
    { t: "18:57", ic: "🤔", h: "真的還假的？", ml: "True or False · Thật hay giả", d: "手機作答，越快答對分數越高", chip: "真的還假的", game: "truefalse", music: "truefalse", mood: "game", moodTag: "" },
    { t: "19:10", ic: "🪙", h: "財神撒金幣", ml: "Coin Rush · Thần Tài rải vàng", d: "掃桌上的 QR Code，60 秒狂點！每桌平均點擊數決勝", chip: "財神", game: "coins", video: true, music: "coins", mood: "game", moodTag: "", tag: "📱 掃桌上的 QR Code 加入（大螢幕也有）" },

    { t: "19:22", type: "draw", round: 7, by: "", prizes: [["三獎", 1], ["四獎", 2], ["五獎", 2]], variant: "A", chip: "抽獎 7", note: "⏳ 第 7 輪抽獎人待補（Gino 已離職）" },
    { t: "19:26", type: "draw", round: 8, by: "Del", prizes: [["三獎", 1], ["四獎", 2], ["五獎", 2]], variant: "B", chip: "抽獎 8" },
    { t: "19:30", type: "draw", round: 9, by: "Hedy", prizes: [["三獎", 1], ["四獎", 2], ["五獎", 2]], variant: "C", chip: "抽獎 9", note: "⏳ 份數待福委核對" },
    { t: "19:34", type: "draw", round: 10, by: "大Eric", prizes: [["三獎", 1], ["四獎", 3], ["五獎", 3]], variant: "A", chip: "抽獎 10", note: "⏳ 份數待福委核對" },
    { t: "19:38", type: "draw", round: 11, by: "Dick", prizes: [["三獎", 1], ["四獎", 3], ["五獎", 3]], variant: "B", chip: "抽獎 11", note: "⏳ 份數待福委核對" },

    { t: "19:42", type: "draw", kind: "lucky", h: "最佳幸運兒", ml: "Lucky Star · Người may mắn nhất", by: "", sub: "用麻將紙號碼抽出 2 位", prizes: [["最佳幸運兒", 2, 2000]], chip: "幸運兒" },
    { t: "19:46", type: "draw", kind: "second", h: "二獎", ml: "2nd Prize · Giải nhì", by: "CL", prizes: [["二獎", 4]], chip: "二獎" },
    { t: "19:51", type: "draw", kind: "lottery", h: "全民大樂透開獎", ml: "Lottery Draw · Xổ số", by: "", sub: "請拿出存根，主持人唸票號", prizes: [], variant: "A", chip: "樂透" },
    { t: "19:56", type: "grand", h: "頭獎", ml: "GRAND PRIZE · GIẢI ĐẶC BIỆT", prizeText: "現金 60,000 元", chip: "頭獎", mood: "draw", moodTag: "" },
    { t: "20:02", type: "draw", kind: "bonus", h: "有沒有人要加碼？", ml: "Any more surprises? · Còn bất ngờ nào nữa không?", by: "", prizes: [], chip: "加碼？" },
    { t: "20:20", ic: "🙏", h: "感謝蒞臨", ml: "Thank you · Cảm ơn quý vị", d: "得獎的同仁請到工作區簽名領獎", chip: "散場", music: "ending", mood: "dine", moodTag: "" }
  ],

  // 每個環節的音樂（用 music-lab.html 試聽挑選後，把產生的設定貼在這裡；留空 = 用預設）
  music: {}
};
