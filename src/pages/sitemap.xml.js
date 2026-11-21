// 検索エンジン向けのサイトマップ（ビルドで dist/sitemap.xml になる）
// ページを増やしたら paths に追加する。サイトの URL は astro.config.mjs の site を使う。
const paths = ['/'];

export function GET({ site }) {
  // ビルドした日（日本時間）を更新日にする
  const lastmod = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const urls = paths
    .map((path) => `  <url>\n    <loc>${new URL(path, site).href}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
