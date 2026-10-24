/* ------------------------------------------------------------------
   サイトの中身はこのファイルだけ編集すればOKです。
   ※ 現在の作品・URL・メールアドレスはすべて仮のものです。
     ご自身の作品情報に差し替えてください。
------------------------------------------------------------------- */

window.SITE = {
  name: "mamochi",
  email: "hello@example.com",
  links: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "X", url: "https://x.com/" },
    { label: "LINE STORE", url: "https://store.line.me/" },
  ],
};

/*  type: "web" | "game" | "sticker"
    thumb: サムネイルの自動生成パラメータ（画像を使う場合は image: "assets/img/xxx.png" を追加） */
window.WORKS = [
  {
    id: "tsumiki",
    type: "web",
    title: "Tsumiki",
    titleJa: "つみき",
    year: 2025,
    summary: "5〜20人のチームのための、軽いタスク管理。",
    description:
      "多機能すぎるツールに疲れた小さなチーム向けに、「今日やること」と「誰が持っているか」だけに絞ったタスク管理。ドラッグで並べ替え、Slack通知、週次のふりかえりレポートまで。",
    role: "企画 / UIデザイン / フロント・バックエンド",
    stack: ["Next.js", "TypeScript", "Supabase", "Vercel"],
    url: "#",
    thumb: { layout: "kanban", accent: "#2B4BFF", seed: 11 },
  },
  {
    id: "kondate",
    type: "web",
    title: "Kondate Note",
    titleJa: "こんだてノート",
    year: 2024,
    summary: "献立を決めると、買い物リストが勝手にできる。",
    description:
      "1週間分の献立をカレンダーに置くだけで、材料を集計して売り場順の買い物リストを生成。家族で共有でき、冷蔵庫の在庫も差し引きます。",
    role: "企画 / デザイン / 実装",
    stack: ["React", "Firebase", "PWA"],
    url: "#",
    thumb: { layout: "calendar", accent: "#E2553A", seed: 23 },
  },
  {
    id: "yoyaku",
    type: "web",
    title: "Yoyaku Box",
    titleJa: "よやくボックス",
    year: 2024,
    summary: "個人サロンのための予約・顧客管理システム。",
    description:
      "電話とメモ帳で予約を受けていた美容サロンのために制作。LINEからの予約受付、リマインド配信、売上ダッシュボードを備え、予約の取りこぼしを大幅に減らしました。",
    role: "要件定義 / 設計 / 実装 / 運用",
    stack: ["Laravel", "MySQL", "LINE Messaging API"],
    url: "#",
    thumb: { layout: "dashboard", accent: "#0F8F6B", seed: 37 },
  },
  {
    id: "shift",
    type: "web",
    title: "Shift Pocket",
    titleJa: "シフトポケット",
    year: 2023,
    summary: "アルバイトのシフト希望を、スマホで集めて自動で組む。",
    description:
      "飲食店のシフト作成にかかっていた毎月数時間を短縮。希望提出・自動割り当て・交代申請までをひとつの画面に。",
    role: "設計 / 実装",
    stack: ["Vue", "Go", "PostgreSQL"],
    url: "#",
    thumb: { layout: "list", accent: "#8A4DFF", seed: 52 },
  },

  {
    id: "mochihop",
    type: "game",
    title: "Mochi Hop",
    titleJa: "もちホップ",
    year: 2025,
    summary: "だんごをよけて跳ねつづける、ワンボタンのランゲーム。",
    description:
      "スペースキーかタップだけで遊べるエンドレスランナー。だんだん速くなるだんご串を、もちが跳んでよけます。このページの上で、そのまま遊べます。",
    role: "ゲームデザイン / プログラム / ドット絵",
    stack: ["HTML5 Canvas", "JavaScript"],
    url: "#play",
    playable: true,
    thumb: { scene: "hop", seed: 3 },
  },
  {
    id: "neonkitchen",
    type: "game",
    title: "Neon Kitchen",
    titleJa: "ネオンキッチン",
    year: 2024,
    summary: "制限時間内に注文をさばく、せわしない料理パズル。",
    description:
      "流れてくる注文に合わせて具材を組み合わせるアクションパズル。1ステージ90秒、全30ステージ。ローカル2人協力プレイ対応。",
    role: "企画 / プログラム / UI",
    stack: ["Unity", "C#"],
    url: "#",
    thumb: { scene: "kitchen", seed: 8 },
  },
  {
    id: "hoshinomichi",
    type: "game",
    title: "Hoshi no Michi",
    titleJa: "ほしのみち",
    year: 2023,
    summary: "星座を一筆書きでつなぐ、静かなパズル。",
    description:
      "夜空の星を一筆書きでつないで星座を完成させるパズル。全60問。BGMは自作で、寝る前に遊べるように音もゆっくりめ。",
    role: "企画 / プログラム / サウンド",
    stack: ["Godot", "GDScript"],
    url: "#",
    thumb: { scene: "stars", seed: 19 },
  },

  {
    id: "mamochi-daily",
    type: "sticker",
    title: "まもちの毎日",
    titleJa: "Mamochi Daily",
    year: 2025,
    summary: "いちばん使いやすい、日常のあいさつ40個。",
    description: "おはよう・ありがとう・OKなど、毎日のやりとりで使える定番セット。",
    role: "キャラクターデザイン / イラスト",
    stack: ["40個", "Procreate"],
    url: "https://store.line.me/",
    set: "daily",
  },
  {
    id: "mamochi-keigo",
    type: "sticker",
    title: "まもち 敬語ver.",
    titleJa: "Mamochi Polite",
    year: 2024,
    summary: "職場や目上の人にも送れる、ていねいなまもち。",
    description: "「承知しました」「お疲れさまです」など、仕事のやりとりで使える敬語スタンプ。",
    role: "キャラクターデザイン / イラスト",
    stack: ["24個", "Procreate"],
    url: "https://store.line.me/",
    set: "keigo",
  },
  {
    id: "mamochi-season",
    type: "sticker",
    title: "まもち 季節のごあいさつ",
    titleJa: "Mamochi Seasons",
    year: 2023,
    summary: "桜もち、よもぎもち、きなこもち。季節で味が変わります。",
    description: "お正月からクリスマスまで、季節の行事に合わせたごあいさつスタンプ。",
    role: "キャラクターデザイン / イラスト",
    stack: ["16個", "Illustrator"],
    url: "https://store.line.me/",
    set: "season",
  },
];

/* LINEスタンプのセット。eyes / mouth / extra の組み合わせで表情を描きます。
   eyes: dot | happy | sleepy | sparkle | wink | cross | tear
   mouth: smile | open | flat | o | wavy | cat
   extra: heart | sweat | bang | zzz | sparkle | anger | null */
window.STICKER_SETS = {
  daily: {
    body: "#FFFFFF",
    label: "#FF5A1F",
    stickers: [
      { label: "おはよう", eyes: "sleepy", mouth: "o", extra: "sparkle" },
      { label: "ありがとう", eyes: "happy", mouth: "open", extra: "heart" },
      { label: "OK!", eyes: "wink", mouth: "smile", extra: null },
      { label: "えっ", eyes: "dot", mouth: "o", extra: "bang" },
      { label: "おつかれ", eyes: "sleepy", mouth: "wavy", extra: "sweat" },
      { label: "すき", eyes: "sparkle", mouth: "cat", extra: "heart" },
      { label: "ごめんね", eyes: "tear", mouth: "wavy", extra: null },
      { label: "ねむい", eyes: "sleepy", mouth: "flat", extra: "zzz" },
    ],
  },
  keigo: {
    body: "#FFFFFF",
    label: "#2B4BFF",
    stickers: [
      { label: "承知です", eyes: "dot", mouth: "smile", extra: null },
      { label: "お疲れさまです", eyes: "happy", mouth: "smile", extra: "sparkle" },
      { label: "恐縮です", eyes: "cross", mouth: "wavy", extra: "sweat" },
      { label: "確認します", eyes: "dot", mouth: "flat", extra: null },
      { label: "助かります", eyes: "sparkle", mouth: "open", extra: "heart" },
      { label: "失礼します", eyes: "happy", mouth: "o", extra: null },
      { label: "了解です!", eyes: "wink", mouth: "open", extra: "bang" },
      { label: "感謝です", eyes: "happy", mouth: "cat", extra: "heart" },
    ],
  },
  season: {
    body: "#FFD9E0",
    label: "#0F8F6B",
    stickers: [
      { label: "あけおめ", eyes: "happy", mouth: "open", extra: "sparkle", body: "#FFFFFF" },
      { label: "はるだ", eyes: "sparkle", mouth: "smile", extra: "heart", body: "#FFD9E0" },
      { label: "あつい…", eyes: "cross", mouth: "wavy", extra: "sweat", body: "#CFE6B8" },
      { label: "おつきみ", eyes: "sleepy", mouth: "cat", extra: null, body: "#F6E2A8" },
      { label: "ハロウィン", eyes: "wink", mouth: "open", extra: "bang", body: "#FFC9A3" },
      { label: "さむい", eyes: "tear", mouth: "flat", extra: null, body: "#E3ECF7" },
      { label: "メリクリ", eyes: "happy", mouth: "smile", extra: "sparkle", body: "#FFFFFF" },
      { label: "よいお年を", eyes: "happy", mouth: "cat", extra: "heart", body: "#FFD9E0" },
    ],
  },
};
