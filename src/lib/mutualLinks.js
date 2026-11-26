/**
 * 相互リンクのサイト名と紹介文を、ビルド時に各サイトから自動で取得する。
 *
 * - サイト名は <title>（なければ og:title）、紹介文は <meta name="description">（なければ og:description）。
 * - 取得できなかったもの（書かれていない・通信に失敗した）は、src/data/mutualLinks.js の siteName / description を使う。
 * - 開発サーバーでは同じ結果を CACHE_MS の間使い回す。
 */
import { mutualLinks } from '../data/mutualLinks.js';

const TIMEOUT_MS = 8000;
const CACHE_MS = 10 * 60 * 1000;

const decodeEntities = (s = '') =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const metaContent = (html, key) => {
  const tag = (html.match(/<meta\b[^>]*>/gi) ?? []).find((m) =>
    new RegExp(`(?:name|property)\\s*=\\s*["']${key}["']`, 'i').test(m),
  );
  return decodeEntities(tag?.match(/content\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] ?? '');
};

/** HTML から説明文を取り出す（description → og:description の順）。なければ空文字 */
export function descriptionOf(html) {
  return metaContent(html, 'description') || metaContent(html, 'og:description');
}

/** HTML からサイト名を取り出す（<title> → og:title の順）。なければ空文字 */
export function siteNameOf(html) {
  return decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || metaContent(html, 'og:title');
}

async function fetchSiteInfo(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'yonu.work-build (+https://yonu.work/)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const html = await res.text();
    return { siteName: siteNameOf(html), description: descriptionOf(html) };
  } catch (error) {
    console.warn(`[mutualLinks] ${url} の情報を取得できませんでした: ${error.message}`);
    return { siteName: '', description: '' };
  }
}

async function load() {
  return Promise.all(
    mutualLinks.map(async (site) => {
      const fetched = await fetchSiteInfo(site.url);
      return {
        ...site,
        siteName: fetched.siteName || site.siteName || '',
        description: fetched.description || site.description || '',
      };
    }),
  );
}

let cache = null;

/** サイト名と紹介文を最新にした相互リンクの一覧（並びは src/data/mutualLinks.js のとおり） */
export function getMutualLinks() {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), promise: load() };
  }
  return cache.promise;
}
