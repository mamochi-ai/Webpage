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
    id: "naildesigner",
    type: "web",
    title: "ネイル試着ノート",
    titleJa: "Nail Try-on Note",
    year: 2026,
    summary: "自分の手の写真で、ネイルの色と柄を試せる。",
    description:
      "手の写真に爪の輪郭を指定して、色や柄を合成。ネイリストさんとの相談に使える画像をつくれます。写真は端末の中（Canvas）だけで処理し、外部へは送信しません。作業は自動保存され、元に戻す／比較もできます。",
    role: "企画・制作",
    stack: ["Canvas 2D", "IndexedDB", "JavaScript"],
    url: "https://mamochi-ai.github.io/naildesigner/",
    image: "assets/img/works/naildesigner.webp",
  },
  {
    id: "notepaste",
    type: "web",
    title: "note Paste Studio",
    titleJa: "ノートペースト",
    year: 2026,
    summary: "AIが書いたMarkdown記事を、装飾つきのままnoteへ。",
    description:
      "ChatGPTやClaudeが書いた記事を、見出し・太字・リスト・引用・リンクを保ったままnoteに貼り付けるためのツール。9通りのコピー方式を実機で検証し、「本文を一括コピー → 画像を目印の位置に1枚ずつ」という確実な手順にたどり着きました。iPadのSafariだけで使えます。",
    role: "企画・制作",
    stack: ["Clipboard API", "IndexedDB", "JavaScript"],
    url: "https://mamochi-ai.github.io/notepaste/",
    image: "assets/img/works/notepaste.webp",
  },
  {
    id: "zero-invoice",
    type: "web",
    title: "ゼロ請求書",
    titleJa: "Zero Invoice",
    year: 2026,
    summary: "登録不要。源泉徴収もインボイスも自動で正しく。",
    description:
      "フリーランス・個人事業主のための請求書ツール。源泉徴収税額の自動計算、インボイス（適格請求書）の登録番号チェック、税率ごとの端数処理に対応。請求書・見積書・納品書・領収書をつくってPDFで保存できます。データはブラウザの外に出ません。",
    role: "企画・制作",
    stack: ["JavaScript", "localStorage", "Cloudflare Workers"],
    url: "https://mamochi-ai.github.io/automoney/",
    image: "assets/img/works/zero-invoice.webp",
  },
  {
    id: "study-sakura",
    type: "web",
    title: "My Study",
    titleJa: "マイ・スタディ",
    year: 2026,
    summary: "参考書（PDF）とノートを、机に広げるように並べて勉強。",
    description:
      "本棚から参考書とバインダーを選ぶと、左に参考書、右にノートが広がる勉強アプリ。PDFの範囲を切り取ってノートに貼る、引用する、ページへのリンクを入れる、が一瞬でできます。暗記シート、Apple Pencilの手書きノート、復習マーク、ポモドーロタイマー、学習記録つき。iPadのホーム画面に追加すればオフラインでも使えます。",
    role: "企画・制作",
    stack: ["React", "TypeScript", "pdf.js", "TipTap", "IndexedDB"],
    url: "https://mamochi-ai.github.io/study-sakura/",
    image: "assets/img/works/study-sakura.webp",
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
    id: "maeba-beaver",
    type: "sticker",
    title: "前歯ビーバーの日常",
    titleJa: "Maeba Beaver",
    year: 2026,
    summary: "素直になれない、前歯ビーバーの日常スタンプ。",
    description: "怒っても、照れても、落ち込んでも、なぜか前歯だけは元気いっぱい。素直になれないビーバーの毎日を8個に詰めました。",
    role: "企画・制作",
    stack: ["8個", "スタンプアレンジ対応"],
    url: "https://line.me/S/sticker/36785262",
    set: "daily",
  },
  {
    id: "maeba-beaver-2",
    type: "sticker",
    title: "前歯ビーバーの日常2",
    titleJa: "Maeba Beaver 2",
    year: 2026,
    summary: "キレても、疲れても、燃え尽きても、前歯だけはブレない。",
    description: "前歯ビーバー、第2弾。夏の疲れも、ハロウィンの気分も、これ1つで表現できる8種類セットです。",
    role: "企画・制作",
    stack: ["8個", "スタンプアレンジ対応"],
    url: "https://line.me/S/sticker/36837707",
    set: "daily2",
  },
  {
    id: "honne",
    type: "sticker",
    title: "本音、はみ出てます。",
    titleJa: "Honne, Hamidetemasu",
    year: 2026,
    summary: "笑顔でお返事。でも本音がちらり。",
    description: "「承知しました」「大丈夫です」の裏側を、赤い紙のキャラがこっそり代弁。丁寧だけど正直な24個。",
    role: "企画・制作",
    stack: ["24個", "スタンプアレンジ対応"],
    url: "https://line.me/S/sticker/37345788",
    set: "honne",
  },
];

/* LINEスタンプのセット。画像は assets/img/stickers/<セット>/ に置き、
   cover はサムネイル用、stickers はスタンプ一覧（label は読み上げ用の説明）です。 */
window.STICKER_SETS = {
  daily: {
    bg: "#F6E6D3",
    cover: "main",
    stickers: [
      { src: "01", label: "むかちゃっかふぁいやーだぞ" },
      { src: "02", label: "ひっ！怒られた…" },
      { src: "03", label: "疲れ果てた、むり" },
      { src: "04", label: "ばんがれー！" },
      { src: "05", label: "もっしゃもっしゃ" },
      { src: "06", label: "驚き過ぎて前歯でちゃう" },
      { src: "07", label: "好きすぎて前歯！" },
      { src: "08", label: "もうつくー" },
    ],
  },
  daily2: {
    bg: "#F3E1C7",
    cover: "main",
    stickers: [
      { src: "01", label: "無" },
      { src: "02", label: "お礼に前歯を1本あげる" },
      { src: "03", label: "めっちゃ急いでいます！！" },
      { src: "04", label: "カロリーを欲す" },
      { src: "05", label: "君の前歯の実力はそんなもんじゃない！" },
      { src: "06", label: "残暑に身体が追いつかない" },
      { src: "07", label: "前歯折るぞ！" },
      { src: "08", label: "トリック・オア・トリート" },
    ],
  },
  honne: {
    bg: "#FBE3D8",
    cover: "main",
    stickers: [
      { src: "01", label: "承知しました（納得はしてません）" },
      { src: "02", label: "了解です（一回で覚えられるとは限りません）" },
      { src: "03", label: "喜んで！（喜んではいません）" },
      { src: "04", label: "賛成です（詳しくはわかってません）" },
      { src: "08", label: "検討します（気持ちは決まってます）" },
      { src: "09", label: "大丈夫です（だいぶ無理してます）" },
      { src: "10", label: "気にしてません（しっかり覚えてます）" },
      { src: "12", label: "無理しないでね（私も休みたい）" },
      { src: "13", label: "お疲れさまです（こちらも限界です）" },
      { src: "15", label: "ゆっくりで大丈夫（そろそろお願いします）" },
      { src: "16", label: "怒ってません（まだ整理できてません）" },
      { src: "17", label: "楽しみです（帰る時間も気になります）" },
    ],
  },
};
