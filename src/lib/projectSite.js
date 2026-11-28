/**
 * 作ったものの詳細ポップアップ用：公開サイト（projects.js の site）から og:image の URL をビルド時に取得する。
 *
 * - projects.js に image が直接書かれていればそちらを優先し、未指定のときだけ site の og:image を探す。
 * - 画像は公開サイトの URL にそのままリンクする（リポジトリにコピーは置かない）。
 * - 取得できない・og:image がないときは空文字を返す（ポップアップに画像枠を出さないだけで、ビルドは止めない）。
 */
import { iconUrlOf } from './mutualLinks.js';

const TIMEOUT_MS = 8000;
const CACHE_MS = 10 * 60 * 1000;

async function load(siteUrl) {
  try {
    const res = await fetch(siteUrl, {
      headers: { 'User-Agent': 'yonu.work-build (+https://yonu.work/)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const html = await res.text();
    return iconUrlOf(html, { meta: 'og:image' }, res.url || siteUrl);
  } catch (error) {
    console.warn(`[projectSite] ${siteUrl} の og:image を取得できませんでした: ${error.message}`);
    return '';
  }
}

const cache = new Map();

/** site の og:image の絶対 URL（なければ空文字） */
export function getProjectSiteImage(siteUrl) {
  if (!siteUrl) return Promise.resolve('');
  const hit = cache.get(siteUrl);
  if (!hit || Date.now() - hit.at > CACHE_MS) {
    cache.set(siteUrl, { at: Date.now(), promise: load(siteUrl) });
  }
  return cache.get(siteUrl).promise;
}
