/**
 * 公開リポジトリで使っている言語の割合を、ビルド時に GitHub から集計する（「自分について」の Languages on GitHub 用）。
 *
 * - 対象は自分が持っている公開リポジトリ（フォークとアーカイブは除く）。割合はコードの量（バイト数）で、GitHub と同じ数え方。
 * - CSS・HTML・Dockerfile のような、プログラミング言語とは言いにくいものは除いてから割合を出す。
 * - 取得に失敗したら src/data/githubLanguages.js の予備の値を使う（ビルドは止めない）。
 * - GitHub への問い合わせは src/lib/github.js（環境変数 GITHUB_TOKEN があれば使う）。
 */
import { fallbackLanguages } from '../data/githubLanguages.js';
import { fetchGithubJson } from './github.js';

const USER = 'yonu33';
/** 表示する言語の数（多い順） */
const LIMIT = 5;
const EXCLUDE = new Set(['CSS', 'SCSS', 'HTML', 'Dockerfile', 'Makefile', 'Procfile']);
const CACHE_MS = 10 * 60 * 1000;

async function load() {
  try {
    const repos = await fetchGithubJson(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner`);
    const totals = {};
    for (const repo of repos.filter((r) => !r.fork && !r.archived)) {
      const languages = await fetchGithubJson(repo.languages_url);
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
