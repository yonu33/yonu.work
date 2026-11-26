// 相互リンク。上から順に表示する。
//
// icon は public/mutual/ に置いた 96×96 の画像（表示は 48×48）。相手のサイトの画像は、
// サイトを作り直すたびに URL が変わることが多いので、直リンクせずに縮小コピーを置いている。
// iconSource は取得元（相手がアイコンを変えたら、ここから取り直す）。
// icon を書かなければ、名前の頭文字を表示する。
//
// 2026-11-26 時点で、どのサイトにも直リンク・転載を禁止する記載はなかった
// （montblank.fun は「アイコン・バナーは直リンクして大丈夫」と明記）。
export const mutualLinks = [
  {
    name: "柴犬被り 氏",
    url: "https://memo.shibadogcap.com/",
    icon: "/mutual/shibadogcap.png",
    iconSource: "https://memo.shibadogcap.com/ （ブログのアバター）",
  },
  {
    name: "トラマト 氏",
    url: "https://toramutton.me/",
    icon: "/mutual/toramutton.png",
    iconSource: "https://toramutton.me/ （OGP 画像）",
  },
  {
    name: "えぬぴー 氏",
    url: "https://negapainter.work/",
    icon: "/mutual/negapainter.png",
    iconSource: "https://negapainter.work/ （トップページのメイン画像）",
  },
  {
    name: "そらい 氏",
    url: "https://sudo-sorai.dev/",
    icon: "/mutual/sorai.png",
    iconSource: "https://sudo-sorai.dev/ （Profile の写真を正方形に切り抜き）",
  },
  {
    name: "まろん。 氏",
    url: "https://montblank.fun/",
    icon: "/mutual/montblank.png",
    iconSource: "https://montblank.fun/icon.png （配布されているアイコン）",
  },
];
