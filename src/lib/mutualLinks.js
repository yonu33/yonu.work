/**
 * 相互リンクのサイト名・紹介文・アイコンを、ビルド時に各サイトから自動で取得する。
 *
 * - サイト名は <title>（なければ og:title）、紹介文は <meta name="description">（なければ og:description）。
 * - アイコンは相手のサーバーの画像に直リンクする（画像のコピーは置かない）。
 *   相手のサイトは作り直すたびに画像の URL が変わることがあるので、iconFrom の指定に従って
 *   ビルドのたびにページから今の URL を探す。icon に URL が書いてあれば、それをそのまま使う。
 * - 取得できなかったもの（書かれていない・通信に失敗した）は、src/data/mutualLinks.js の値を使う。
 *   アイコンが見つからなければ、カードには名前の頭文字が出る。
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

const attr = (tag, name) => decodeEntities(tag?.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2] ?? '');

const metaContent = (html, key) => {
  const tag = (html.match(/<meta\b[^>]*>/gi) ?? []).find((m) =>
    new RegExp(`(?:name|property)\\s*=\\s*["']${key}["']`, 'i').test(m),
  );
  return attr(tag, 'content');
};

/** HTML から説明文を取り出す（description → og:description の順）。なければ空文字 */
export function descriptionOf(html) {
  return metaContent(html, 'description') || metaContent(html, 'og:description');
}

/** HTML からサイト名を取り出す（<title> → og:title の順）。なければ空文字 */
export function siteNameOf(html) {
  return decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || metaContent(html, 'og:title');
}

/**
 * iconFrom の指定に従って、ページからアイコン画像の URL（絶対 URL）を探す。なければ空文字。
 *   { meta: 'og:image' }   … その meta タグの content
 *   { img: 'site-logo' }   … この文字列を含む <img> の src（class 名やファイル名の一部で探す）
 */
export function iconUrlOf(html, iconFrom, pageUrl) {
  let src = '';
  if (iconFrom?.meta) src = metaContent(html, iconFrom.meta);
  if (iconFrom?.img) {
    const tag = (html.match(/<img\b[^>]*>/gi) ?? []).find((t) => t.includes(iconFrom.img));
    src = attr(tag, 'src');
  }
  if (!src) return '';
  try {
    return new URL(src, pageUrl).href;
  } catch {
    return '';
  }
}

async function fetchSiteInfo(site) {
  try {
    const res = await fetch(site.url, {
      headers: { 'User-Agent': 'yonu.work-build (+https://yonu.work/)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const html = await res.text();
    return {
      siteName: siteNameOf(html),
      description: descriptionOf(html),
      icon: site.iconFrom ? iconUrlOf(html, site.iconFrom, res.url || site.url) : '',
    };
  } catch (error) {
    console.warn(`[mutualLinks] ${site.url} の情報を取得できませんでした: ${error.message}`);
    return { siteName: '', description: '', icon: '' };
  }
}

async function load() {
  return Promise.all(
    mutualLinks.map(async (site) => {
      const fetched = await fetchSiteInfo(site);
      return {
        ...site,
        siteName: fetched.siteName || site.siteName || '',
        description: fetched.description || site.description || '',
        icon: site.icon || fetched.icon || '',
      };
    }),
  );
}

let cache = null;

/** サイト名・紹介文・アイコンを最新にした相互リンクの一覧（並びは src/data/mutualLinks.js のとおり） */
export function getMutualLinks() {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), promise: load() };
  }
  return cache.promise;
}
