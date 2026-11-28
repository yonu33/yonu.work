/**
 * ビルド時に GitHub の API を呼ぶための共通処理（githubLanguages.js と githubRepos.js で使う）。
 *
 * - 環境変数 GITHUB_TOKEN があれば使う（なくても動くが、GitHub の取得回数の制限に当たりやすい）。
 * - トークンで断られたとき（期限切れの 401、ほかの組織がトークンでの読み取りを制限している 403 / 404 など）は、
 *   トークンなしでもう一度取る。公開リポジトリの情報はトークンなしでも読めるので、トークンの不調でサイトが変わらない。
 * - 応答が遅いときは TIMEOUT_MS で打ち切る。失敗したら例外を投げるので、呼ぶ側で予備の値に切り替える。
 */
const TIMEOUT_MS = 8000;

const request = (url, token) => {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yonu.work-build' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
};

export async function fetchGithubJson(url) {
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined;
  if (token) {
    const res = await request(url, token);
    if (res.ok) return res.json();
    if (![401, 403, 404].includes(res.status)) throw new Error(`${res.status} ${url}`);
    console.warn(`[github] トークンで ${res.status} が返ったため、トークンなしで取り直します: ${url}`);
  }
  const res = await request(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
