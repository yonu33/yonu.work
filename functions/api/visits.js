/**
 * アクセスカウンター（Cloudflare Pages Functions）。フッターの半券の「No. 000123」に使う。
 *
 *   GET  /api/visits → いまの数を返す            { "count": 123 }
 *   POST /api/visits → 1 増やして、増やした後の数を返す { "count": 124 }
 *
 * - 数は D1 データベース yonu-work-counter の counters 表に入っている（表の定義は db/schema.sql）。
 * - Pages の設定で、この D1 を DB という名前でつないでおく必要がある（README の「アクセスカウンター」）。
 *   つながっていないときは 503 を返し、ページ側は何も表示しない。
 * - 1 日 1 回だけ数える判定はブラウザ側（Footer.astro）でしている。ここでは数えるだけ。
 * - よそのサイトから増やされないよう、POST は yonu.work（と Pages のプレビュー、手元の確認用）からだけ受け付ける。
 */

const ALLOWED_ORIGIN = /^https:\/\/((www\.)?yonu\.work|([a-z0-9-]+\.)?yonu-astro-page\.pages\.dev)$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'counter is not configured' }, 503);
  const row = await env.DB.prepare("SELECT value FROM counters WHERE name = 'visits'").first();
  return json({ count: row?.value ?? 0 });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'counter is not configured' }, 503);
  if (!ALLOWED_ORIGIN.test(request.headers.get('Origin') ?? '')) return json({ error: 'forbidden' }, 403);
  // 読んでから書くのではなく 1 回の UPDATE で増やすので、同時にアクセスされても数がずれない
  const row = await env.DB.prepare("UPDATE counters SET value = value + 1 WHERE name = 'visits' RETURNING value").first();
  return json({ count: row?.value ?? 0 });
}
