/**
 * 作ったものの詳細ポップアップ用：公開リポジトリのスター数と最新コミットの日付を、ビルド時に GitHub から取ってくる。
 *
 * - 対象は projects.js の github が https://github.com/持ち主/リポジトリ の形のもの（「非公開」などは対象外）。
 * - 最新コミットの日付は、既定ブランチの一番新しいコミットを書いた日（author の日付）。
 *   履歴を書き換えて push し直しても変わらないので、リポジトリの「最終 push 日」より実際の更新日に近い。
 * - 日付は日本時間の YYYY.MM.DD。ビルドした時点の情報なので、yonu.work を公開し直すまで更新されない。
 * - 取得に失敗したリポジトリは null を返す（ポップアップに何も出さないだけで、ビルドは止めない）。
 */
import { fetchGithubJson } from './github.js';

const REPO_URL = /^https:\/\/github\.com\/([^/]+)\/([^/?#]+?)\/?$/;
const CACHE_MS = 10 * 60 * 1000;

const toJstDate = (iso) =>
  new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replaceAll('-', '.');

async function load(owner, repo) {
  try {
    const base = `https://api.github.com/repos/${owner}/${repo}`;
    const [info, commits] = await Promise.all([
      fetchGithubJson(base),
      fetchGithubJson(`${base}/commits?per_page=1`),
    ]);
    const committedAt = commits[0]?.commit?.author?.date;
    return {
      stars: info.stargazers_count ?? 0,
      lastCommit: committedAt ? toJstDate(committedAt) : null,
    };
  } catch (error) {
    console.warn(`[githubRepos] ${owner}/${repo} の取得に失敗したため表示しません: ${error.message}`);
    return null;
  }
}

const cache = new Map();

/** { stars, lastCommit } か null（公開リポジトリの URL でない・取得に失敗した） */
export function getRepoStats(url) {
  const match = typeof url === 'string' ? url.match(REPO_URL) : null;
  if (!match) return Promise.resolve(null);
  const [, owner, repo] = match;
  const key = `${owner}/${repo}`;
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.at > CACHE_MS) {
    cache.set(key, { at: Date.now(), promise: load(owner, repo) });
  }
  return cache.get(key).promise;
}
