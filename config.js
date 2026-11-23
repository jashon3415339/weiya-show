// 尾牙主持大螢幕＋手機遙控器 設定檔
// 在 GitHub 上點這個檔案 → 鉛筆 ✏️ 修改 → Commit，約 10 分鐘生效。
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

  // 可以用遙控器的帳號 → 遙控器上顯示的名字
  // ⚠ 新增或改帳號時，資料庫規則（database.rules.remote-part.txt）也要改成一樣
  remotes: {
    "host@weiya2026.com": "Jason",
    "host2@weiya2026.com": "備援"
  },

  // 嵌進大螢幕的遊戲（網址是相對位置，不用改）
  games: {
    coins: { name: "財神撒金幣", url: "../weiya-coins/screen.html" },
    truefalse: { name: "真的還假的", url: "../weiya-truefalse/screen.html", questions: "../weiya-truefalse/questions.js" }
  },

  // 進財神撒金幣前播的動畫（跟這個檔案放在同一個 repo）
  introVideo: "intro.mp4",
  // 影片音量（跟網頁音樂比）：1 = 原音量，0.4 = 原本的 40%。現場覺得太大聲或太小聲就改這個
  videoVolume: 0.4,

  // 畫面右上角的日期地點
  meta: "2027.1.16（六）・竹北",

  // 大螢幕要不要顯示每一段的時間、上方的流程列（true 顯示、false 不顯示）
  // 時間只是給遙控器的流程清單看，大螢幕上不顯示
  showTime: false,
  showFlow: false,

  // 流程（照 2027 尾牙活動企劃書 17:30 開席版，照順序）
  // game：嵌入遊戲；video:true：進這一段前先播動畫；draw:true：抽獎（多放煙火）；
  // grand:true：頭獎（集氣衝刺）；rules：在卡片上列出玩法
  // 氛圍（畫面＋音樂）會自動判斷：遊戲 → 遊戲風、抽獎／頭獎 → 抽獎風、其他 → 用餐風；
  // 要手動指定就加 mood: "dine" / "draw" / "game"；moodTag 是上方中間的小標籤（"" = 不顯示）
  stages: [
    { t: "16:45", ic: "🏮", h: "歡迎蒞臨", ml: "Welcome · Chào mừng", d: "請到報到處簽到、領麻將紙，再入座", chip: "報到", moodTag: "🏮 歡迎入席" },
    { t: "17:30", ic: "🥂", h: "開場致詞", ml: "Opening · Khai mạc", d: "董事長致詞・各單位主管致詞（邊上菜）", chip: "致詞" },
    { t: "17:55", ic: "🀄", h: "麻將賓果", ml: "Mahjong Bingo · Bingo mạt chược", d: "拿出麻將紙！連成一條線就喊「賓果」", chip: "麻將", mood: "game" },
    { t: "18:20", ic: "🎁", h: "抽獎 第1～3輪", ml: "Lucky Draw · Bốc thăm", d: "Yang ・ Mark ・ CC　｜　🎟️ 全民大樂透巡桌開賣！", chip: "抽獎①", draw: true },
    { t: "18:35", ic: "🤝", h: "感謝貴賓", ml: "Our Guests & Sponsors · Cảm ơn quý khách", d: "介紹客戶與贊助廠商", chip: "貴賓" },
    { t: "18:40", ic: "🎁", h: "抽獎 第4～6輪", ml: "Lucky Draw · Bốc thăm", d: "小Eric ・ Doris ・ Jerry", chip: "抽獎②", draw: true },
    { t: "18:55", ic: "🤔", h: "真的還假的？", ml: "True or False · Thật hay giả", d: "玩法說明", chip: "真假玩法",
      rules: [
        { zh: "掃 QR Code → 選語言 → 輸入本名", sub: "Scan · Quét mã → Language · Ngôn ngữ → Name · Tên" },
        { zh: "題目出現後 10 秒內選 ⭕ 真的 或 ❌ 假的", sub: "10 seconds · 10 giây — True · Thật / False · Giả" },
        { zh: "答對 500 分＋越快越多，最高 1000 分", sub: "Faster = more points · Càng nhanh càng nhiều điểm" },
        { zh: "按下去就不能改！前 10 名有獎金", sub: "No changes · Không đổi được — Top 10 win · Top 10 có thưởng" }
      ] },
    { t: "18:57", ic: "🤔", h: "真的還假的？", ml: "True or False · Thật hay giả", d: "手機作答，越快答對分數越高", chip: "真的還假的", game: "truefalse" },
    { t: "19:10", ic: "🪙", h: "財神撒金幣", ml: "Coin Rush · Thần Tài rải vàng", d: "掃桌上的 QR Code，60 秒狂點！每桌平均點擊數決勝", chip: "財神", game: "coins", video: true, tag: "📱 掃桌上的 QR Code 加入（大螢幕也有）" },
    { t: "19:22", ic: "🎁", h: "抽獎 第7～11輪", ml: "Lucky Draw · Bốc thăm", d: "Del ・ Hedy ・ 大Eric ・ Dick ・ 第7輪主管", chip: "抽獎③", draw: true },
    { t: "19:42", ic: "🍀", h: "最佳幸運兒", ml: "Lucky Star · Người may mắn nhất", d: "用麻將紙號碼抽 2 位，每位 2,000", chip: "幸運兒", draw: true },
    { t: "19:46", ic: "🎁", h: "二獎", ml: "2nd Prize · Giải nhì", d: "CL 抽出 4 位二獎得主", chip: "二獎", draw: true },
    { t: "19:51", ic: "🎟️", h: "全民大樂透開獎", ml: "Lottery Draw · Xổ số", d: "請拿出存根，主持人唸票號", chip: "樂透", draw: true },
    { t: "19:56", ic: "🏆", h: "壓軸頭獎", ml: "Grand Prize · Giải đặc biệt", d: "Vincent 抽頭獎！全場一起集氣！", chip: "頭獎", grand: true },
    { t: "20:02", ic: "💰", h: "主管加碼 13 抽", ml: "Bonus Draw · Bốc thăm thêm", d: "還沒結束！主管加碼紅包", chip: "加碼", draw: true },
    { t: "20:20", ic: "🙏", h: "感謝蒞臨", ml: "Thank you · Cảm ơn", d: "得獎的同仁請到工作區簽名領獎", chip: "散場", moodTag: "" }
  ],

  // 頭獎畫面上的獎項文字
  grandPrize: "現金 60,000 元"
};
