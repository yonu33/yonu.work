// 「自分について」の Languages on GitHub は、ビルド時に GitHub から自動で集計する（src/lib/githubLanguages.js）。
// ここは取得に失敗したときだけ使う予備の値（2026-11-24 時点の集計）。
export const fallbackLanguages = [
  { name: "TypeScript", percent: 65.9 },
  { name: "Astro", percent: 21.6 },
  { name: "JavaScript", percent: 8.3 },
  { name: "Python", percent: 4.1 },
];
