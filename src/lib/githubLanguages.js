/**
 * 公開リポジトリで使っている言語の割合を、ビルド時に GitHub から集計する（「自分について」の Languages on GitHub 用）。
 *
 * - 対象は自分が持っている公開リポジトリ（フォークとアーカイブは除く）。割合はコードの量（バイト数）で、GitHub と同じ数え方。
 * - CSS・HTML・Dockerfile のような、プログラミング言語とは言いにくいものは除いてから割合を出す。
 * - 取得に失敗したら src/data/githubLanguages.js の予備の値を使う（ビルドは止めない）。
 * - 環境変数 GITHUB_TOKEN があれば使う（なくても動くが、GitHub の取得回数の制限に当たりやすい）。
 */
import { fallbackLanguages } from '../data/githubLanguages.js';

const USER = 'yonu33';
/** 表示する言語の数（多い順） */
const LIMIT = 5;
const EXCLUDE = new Set(['CSS', 'SCSS', 'HTML', 'Dockerfile', 'Makefile', 'Procfile']);
const TIMEOUT_MS = 8000;
const CACHE_MS = 10 * 60 * 1000;

const fetchJson = async (url) => {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yonu.work-build' };
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

async function load() {
  try {
    const repos = await fetchJson(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner`);
    const totals = {};
    for (const repo of repos.filter((r) => !r.fork && !r.archived)) {
      const languages = await fetchJson(repo.languages_url);
      for (const [name, bytes] of Object.entries(languages)) {
        if (!EXCLUDE.has(name)) totals[name] = (totals[name] ?? 0) + bytes;
      }
    }
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    if (sum === 0) throw new Error('no languages');
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, LIMIT)
      .map(([name, bytes]) => ({ name, percent: Math.round((bytes / sum) * 1000) / 10 }));
  } catch (error) {
    console.warn(`[githubLanguages] 取得に失敗したため予備の値を使います: ${error.message}`);
    return fallbackLanguages;
  }
}

let cache = null;

/** 多い順の言語と割合（%）。最大 LIMIT 件 */
export function getGithubLanguages() {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), promise: load() };
  }
  return cache.promise;
}
