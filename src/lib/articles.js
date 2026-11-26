/**
 * 記事一覧をビルド時に Qiita / Zenn / note / はてなブログ から取得する。
 *
 * - サムネイルは note は RSS の画像、はてなブログは RSS のアイキャッチ画像（なければ OGP 画像）、
 *   Qiita / Zenn は記事ページの OGP 画像を使う。
 * - 取得に失敗したサービスは、src/data/articles.js の予備リストで補う（ビルドは止めない）。
 * - 開発サーバーでは同じ結果を CACHE_MS の間使い回す。
 */
import { fallbackArticles } from '../data/articles.js';

/** 各サービスのユーザー名 */
const ACCOUNTS = { qiita: 'yonu', zenn: 'yonu', note: 'yonu33' };
/** はてなブログのアドレス */
const HATENA_BLOG = 'https://yonu.hatenablog.jp';
/** 表示する件数（新しい順） */
const LIMIT = 4;
const TIMEOUT_MS = 8000;
const CACHE_MS = 10 * 60 * 1000;

const decodeEntities = (s = '') =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

/** Date / 日付文字列 → "YYYY.MM.DD"（日本時間） */
const formatDate = (value) => {
  const d = new Date(value);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10).replace(/-/g, '.');
};

const fetchText = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};

/** 記事ページの og:image を取る（取れなければ空文字） */
const ogImageOf = async (url) => {
  try {
    const html = await fetchText(url);
    const tag = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i)?.[0] ?? '';
    return decodeEntities(tag.match(/content=["']([^"']+)["']/i)?.[1] ?? '');
  } catch {
    return '';
  }
};

async function fetchQiita() {
  const items = JSON.parse(await fetchText(`https://qiita.com/api/v2/users/${ACCOUNTS.qiita}/items?per_page=${LIMIT}`));
  return Promise.all(
    items.map(async (item) => ({
      platform: 'Qiita',
      title: item.title,
      url: item.url,
      date: formatDate(item.created_at),
      thumbnail: await ogImageOf(item.url),
    })),
  );
}

async function fetchZenn() {
  const data = JSON.parse(await fetchText(`https://zenn.dev/api/articles?username=${ACCOUNTS.zenn}&order=latest`));
  return Promise.all(
    (data.articles ?? []).slice(0, LIMIT).map(async (item) => {
      const url = `https://zenn.dev${item.path}`;
      return {
        platform: 'Zenn',
        title: item.title,
        url,
        date: formatDate(item.published_at),
        thumbnail: await ogImageOf(url),
      };
    }),
  );
}

async function fetchNote() {
  const xml = await fetchText(`https://note.com/${ACCOUNTS.note}/rss`);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, LIMIT);
  return items.map(([, body]) => {
    const pick = (tag) => decodeEntities(body.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]);
    return {
      platform: 'note',
      title: pick('title'),
      url: pick('link'),
      date: formatDate(pick('pubDate')),
      thumbnail: pick('media:thumbnail'),
    };
  });
}

/** はてなブログの RSS を読む（xml は引数で渡せるようにしてある：テスト用） */
export async function fetchHatena(xml) {
  xml ??= await fetchText(`${HATENA_BLOG}/rss`);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, LIMIT);
  return Promise.all(
    items.map(async ([, body]) => {
      const pick = (tag) => decodeEntities(body.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]);
      const url = pick('link');
      const enclosure = decodeEntities(body.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\//)?.[1] ?? '');
      return {
        platform: 'はてなブログ',
        title: pick('title'),
        url,
        date: formatDate(pick('pubDate')),
        thumbnail: enclosure || (url ? await ogImageOf(url) : ''),
      };
    }),
  );
}

const sources = { Qiita: fetchQiita, Zenn: fetchZenn, note: fetchNote, はてなブログ: () => fetchHatena() };

async function load() {
  const results = await Promise.all(
    Object.entries(sources).map(async ([platform, fetcher]) => {
      try {
        return await fetcher();
      } catch (error) {
        console.warn(`[articles] ${platform} の取得に失敗したため予備リストを使います: ${error.message}`);
        return fallbackArticles.filter((a) => a.platform === platform);
      }
    }),
  );
  return results
    .flat()
    .filter((a) => a.title && a.url)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, LIMIT);
}

let cache = null;

/** 新しい順の記事一覧（最大 LIMIT 件） */
export function getArticles() {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = { at: Date.now(), promise: load() };
  }
  return cache.promise;
}
