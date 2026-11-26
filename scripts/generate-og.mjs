/**
 * OGP 画像（public/og.png, 1200×630）を作るスクリプト。`npm run og` で実行する。
 *
 * scripts/og/og.html を手元のブラウザ（Edge か Chrome）で開いて撮影する。追加のパッケージは使わない。
 * ブラウザの場所を変えるときは、環境変数 OG_BROWSER にブラウザの実行ファイルのパスを入れる。
 * フォント（DotGothic16）を Google Fonts から読むので、インターネットにつながった状態で実行する。
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const template = join(root, 'scripts/og/og.html');
const output = join(root, 'public/og.png');
const WIDTH = 1200;
const HEIGHT = 630;
const PORT = 9400 + Math.floor(Math.random() * 400);

const candidates = [
  process.env.OG_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browserPath = candidates.find((p) => existsSync(p));
if (!browserPath) {
  console.error('Edge か Chrome が見つかりません。環境変数 OG_BROWSER にブラウザのパスを指定してください。');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'og-'));
const browser = spawn(
  browserPath,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'],
  { stdio: 'ignore' },
);

try {
  // ブラウザの起動を待って、開いているタブにつなぐ
  let targets = [];
  for (let i = 0; i < 50 && !targets.some((t) => t.type === 'page'); i++) {
    await sleep(200);
    targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => []);
  }
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('ブラウザに接続できませんでした');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else events.forEach((fn) => fn(msg));
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise((resolve) => events.push((m) => m.method === 'Page.loadEventFired' && resolve()));
  await send('Page.navigate', { url: pathToFileURL(template).href });
  await loaded;

  // フォントと画像の読み込みを待つ（フォントが読めないまま撮らないように確かめる）
  const { result } = await send('Runtime.evaluate', {
    expression: `(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
      return { font: document.fonts.check('96px "DotGothic16"'), images: [...document.images].every((img) => img.naturalWidth > 0) };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (!result.value.font) throw new Error('DotGothic16 を読み込めませんでした（インターネットにつながっているか確認してください）');
  if (!result.value.images) throw new Error('画像を読み込めませんでした');

  const { data } = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
  });
  writeFileSync(output, Buffer.from(data, 'base64'));
  console.log(`作成しました: public/og.png (${WIDTH}×${HEIGHT})`);
  ws.close();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  browser.kill();
  await sleep(500);
  // ブラウザの終了処理中で一時フォルダを消せないことがあるが、画像の作成には関係ないので無視する
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* 一時フォルダは OS の一時領域にあるので、残っても問題ない */
  }
}
