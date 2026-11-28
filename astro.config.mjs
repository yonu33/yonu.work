import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// @fontsource のフォント CSS から、古いブラウザ向けの .woff の指定を外す（今のブラウザは .woff2 だけ読む）。
// 指定が残っていると、使われない .woff ファイルまでビルド結果に入り、CSS も長くなる
const woff2Only = {
  name: 'fontsource-woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource/') || !id.endsWith('.css')) return null;
    return { code: code.replace(/,\s*url\([^)]*\.woff\) format\('woff'\)/g, ''), map: null };
  },
};

export default defineConfig({
  site: 'https://yonu.work',
  integrations: [tailwind()],
  vite: {
    plugins: [woff2Only],
    build: {
      // フォントは小さくても CSS に埋め込まない（埋め込むと、最初に読む CSS が大きくなって表示が遅れる）
      assetsInlineLimit: (filePath) => (/\.woff2?$/.test(filePath) ? false : undefined),
    },
  },
});
