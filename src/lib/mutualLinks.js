/**
 * 相互リンクの紹介文を、ビルド時に各サイトから自動で取得する。
 *
 * - 各サイトの <meta name="description">（なければ og:description）を使う。
 * - 取得できなかったサイト（説明文がない・通信に失敗した）は、src/data/mutualLinks.js の description を使う。
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

/** HTML から説明文を取り出す（description → og:description の順）。なければ空文字 */
export function descriptionOf(html) {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const contentOf = (key) => {
    const tag = metas.find((m) => new RegExp(`(?:name|property)\\s*=\\s*["']${key}["']`, 'i').test(m));
    return decodeEntities(tag?.match(/content\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] ?? '');
  };
  return contentOf('description') || contentOf('og:description');
}

async function fetchDescription(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'yonu.work-build (+https://yonu.work/)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return descriptionOf(await res.text());
  } catch (error) {
    console.warn(`[mutualLinks] ${url} の説明文を取得できませんでした: ${error.message}`);
    return '';
  }
}

async function load() {
  return Promise.all(
    mutualLinks.map(async (site) => ({
      ...site,
      description: (await fetchDescription(site.url)) || site.description || '',
    })),
  );
}

let cache = null;

/** 紹介文を最新にした相互リンクの一覧（並びは src/data/mutualLinks.js のとおり） */
export function getMutualLinks() {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), promise: load() };
  }
  return cache.promise;
}
