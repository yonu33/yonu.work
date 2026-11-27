/**
 * ビルド時に GitHub の API を呼ぶための共通処理（githubLanguages.js と githubRepos.js で使う）。
 *
 * - 環境変数 GITHUB_TOKEN があれば使う（なくても動くが、GitHub の取得回数の制限に当たりやすい）。
 * - 応答が遅いときは TIMEOUT_MS で打ち切る。失敗したら例外を投げるので、呼ぶ側で予備の値に切り替える。
 */
const TIMEOUT_MS = 8000;

export async function fetchGithubJson(url) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yonu.work-build' };
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
