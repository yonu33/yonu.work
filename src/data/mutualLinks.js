// 相互リンク。上から順に表示する。カードの見出しはサイト名、その横に name（敬称略）を出す。
//
// サイト名・紹介文・アイコンは、ビルド時に各サイトから自動で取得する（src/lib/mutualLinks.js）。
// ここの siteName / description は、取得できなかったときの予備。
// 紹介文が長い場合はカードで 2 行に省略し、カーソルを乗せると全文が出る。
//
// アイコンは相手のサーバーの画像に直リンクする（他の人の画像のコピーはリポジトリに置かない）。
//   icon     … URL が変わらない画像（配布されているアイコンや GitHub のアイコン）はここに直接書く
//   iconFrom … 作り直すたびに URL が変わる画像は、ページからの探し方を書く
//              { meta: 'og:image' } その meta タグの画像 / { img: '文字列' } その文字列を含む <img>
// どちらも見つからなければ、名前の頭文字を表示する。
//
// 2026-11-26 時点で、どのサイトにも直リンクを禁止する記載はなかった
// （montblank.fun は「アイコン・バナーは直リンクして大丈夫」と明記）。
export const mutualLinks = [
  {
    name: "柴犬被り",
    siteName: "しばかぶメモ",
    url: "https://memo.shibadogcap.com/",
    description: "初心者のよわよわメモ",
    iconFrom: { img: "site-logo" }, // ブログのアバター
  },
  {
    name: "トラマト",
    siteName: "トラマトのホームページ",
    url: "https://toramutton.me/",
    description: "日常と技術の、ごちゃまぜ記録",
    iconFrom: { meta: "og:image" },
  },
  {
    name: "えぬぴー",
    siteName: "Np's pages",
    url: "https://negapainter.work/",
    description: "ニンテンドースイッチの自作ソフトや3D, 2Dのキャラ制作, ウェブ, AtCoder, CTFなど浅く広く気が向いたらやってます.",
    iconFrom: { img: "/_astro/hero." }, // トップページのメイン画像
  },
  {
    name: "そらい",
    siteName: "Sorai",
    url: "https://sudo-sorai.dev/",
    description: "Web Front / Game Developer",
    // サイトの写真はスクリプトで読み込まれ、ページから URL を探せないので GitHub のアイコン
    icon: "https://github.com/sorai-loop.png",
  },
  {
    name: "まろん。",
    siteName: "まろん｡のポートフォリオ",
    url: "https://montblank.fun/",
    description: "JavaScript / TypeScript / Web を触っている大学生の個人開発勢です。主にOSS開発とネタ開発をしています。フロントエンドよりもバックエンドのほうが得意です。最近は開発バイトしてます。",
    icon: "https://montblank.fun/icon.png", // 配布されているアイコン（直リンク可と明記）
  },
];
