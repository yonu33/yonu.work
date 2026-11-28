# yonu.work

yonu のポートフォリオサイト（https://yonu.work/ ）です。作ったもの・活動の記録・記事をまとめています。

Astro と Tailwind CSS で作った 1 ページの静的サイトで、Cloudflare Pages で公開しています。

## 内容の更新

ほとんどの内容は `src/data/` のファイルを書き換えるだけで更新できます。

| 変えたいもの | ファイル |
| --- | --- |
| プロフィール・技術スタック・連絡先 | `src/data/profile.js`。`sameAs` は検索エンジンに「同じ人のアカウント」と伝える一覧で、ページには表示しない（下の「検索エンジン向けの情報」） |
| 作ったもの | `src/data/projects.js` |
| これまでの記録 | `src/data/history.js` |
| GitHub の使用言語 | ビルド時に公開リポジトリから自動で集計（`src/lib/githubLanguages.js`）。CSS・HTML などは除く。取得に失敗したら `src/data/githubLanguages.js` の予備の値 |
| 作ったものの詳細のスター数・最新コミット | ビルド時に各リポジトリから自動で取得（`src/lib/githubRepos.js`）。取得に失敗したら出さない |
| 記事・発信 | 自動で取得（下の「記事一覧」） |
| 相互リンク | `src/data/mutualLinks.js`。サイト名・紹介文・アイコンはビルド時に各サイトから自動で取得し、取れなければ `siteName` / `description` を使う（`src/lib/mutualLinks.js`）。アイコンは相手の画像への直リンクで、他の人の画像のコピーはリポジトリに置かない |
| このサイトへのリンク（相互リンクしてくれる人向けの情報） | `src/components/MutualLinks.astro` |
| トップのチケット（SNS リンク・発券情報） | `src/components/Hero.astro` |
| サイトの説明文（検索結果や SNS で共有したときに出る文） | `src/layouts/Layout.astro` |
| フッター（切符の半券。最終更新日はビルドした日が自動で入る） | `src/components/Footer.astro` |

### 作ったもの（`projects.js`）

| 項目 | 内容 |
| --- | --- |
| `id` | 作品の識別名。`https://yonu.work/#tecupid` のように URL に `#id` を付けると、その作品の詳細を開いた状態で共有できる |
| `tags` | カードの表面に出す主な技術（2〜3 個） |
| `stack` | 詳細に出す技術の表（`Frontend` などの見出しは自由） |
| `image` | 詳細の上部に出す画像の URL またはパス（任意。未指定で `site` があるときは、公開サイトの `og:image` をビルド時に自動で使う。出さないときは `false`） |
| `imageAlt` | `image` の代替テキスト（任意。省略時は「作品名の画面」） |
| `github` | リポジトリの URL。`"非公開"` にするとリンクを出さない。`https://github.com/持ち主/リポジトリ` の形なら、詳細にスター数（1 以上のとき）と最新コミットの日付も出る（ビルドした時点の情報） |
| `article` | 解説記事の URL（任意） |
| `site` | 公開中のサイトの URL（任意）。カードの表面に「公開中」、詳細に「サイトを開く」が出る |

### これまでの記録（`history.js`）

古い順に書きます。サイトでは新しい順に並び、年ごとに見出しが入ります。最初に表示するのは新しい 5 件だけで、それより古いものは「過去の履歴をすべて表示」で開きます（件数は `src/pages/index.astro` の `VISIBLE_HISTORY`）。

各記録には `type`（種類）を必ず入れます。年表の上の絞り込みボタンと、各記録のラベルに使います。入れ忘れたり綴りを間違えたりするとビルドが止まり、どの日付の記録かが表示されます。

```js
{ date: "2026.11.01", type: "organize", text: "『TSKaigi Sendai 2026』にスタッフとして参加", href: "https://..." }
```

| `type` | 表示 |
| --- | --- |
| `organize` | 運営（スタッフ・主催・就任・設立） |
| `talk` | 登壇・参加（LT 会・勉強会など） |
| `compete` | 出場（ハッカソン・コンテスト） |
| `make` | 制作・執筆（サイト・記事・寄稿など） |
| `study` | 学業・資格 |
| `hobby` | 旅・趣味 |

種類を増やしたり名前を変えたりするときは、`history.js` の先頭の `historyTypes` を書き換えます（ボタンはこの順に並びます）。

### 記事一覧

記事はビルド時に Qiita（`yonu`）・Zenn（`yonu`）・note（`yonu33`）・はてなブログ（`yonu.hatenablog.jp`）から自動で取得し、新しい順に最大 4 件表示します（`src/lib/articles.js`）。

- 記事を書いたら、サイトを再デプロイすると反映されます。コードを変えずに再デプロイするには、空のコミットを push するか、Cloudflare のダッシュボードからデプロイをやり直します。

  ```sh
  git commit --allow-empty -m "rebuild: refresh articles"
  git push
  ```

- 取得に失敗したサービスの分は、`src/data/articles.js` の予備リストで表示します（ビルドは止まりません）。

## 開発

Node.js 22.12 以上が必要です。

```sh
npm install
npm run dev       # 開発サーバー（http://localhost:4321）
npm run build     # dist/ に静的ビルド
npm run preview   # ビルド結果をローカルで確認
npm run og        # リンクを貼ったときの画像（public/og.png）を作り直す
```

`npm run build` は、Cloudflare Pages でのビルドのために、最初に `npm install --legacy-peer-deps` を実行します。

### リンクを貼ったときの画像（OGP 画像）

`public/og.png`（1200×630）は、`scripts/og/og.html` を手元のブラウザ（Edge か Chrome）で撮影して作ります。文言やデザインを変えたら `npm run og` で作り直し、`public/og.png` をコミットしてください。フォントを Google Fonts から読むので、インターネットにつながった状態で実行します。ブラウザが見つからないときは、環境変数 `OG_BROWSER` にブラウザのパスを指定します。

## 公開

`main` に push すると、Cloudflare Pages が自動でビルドして公開します。

| ファイル | 内容 |
| --- | --- |
| `public/_headers` | セキュリティ関連のヘッダーと、`/_astro/` 以下（CSS・JS）の長期キャッシュ |
| `public/_redirects` | 以前の構成のページ（`/top`・`/about`・`/projects`）を、トップページの該当セクションへ転送する |
| `public/robots.txt` | 検索エンジン向けの設定 |
| `src/pages/sitemap.xml.js` | `sitemap.xml` をビルド時に作る。ページを増やしたら `paths` に追加する |
| `src/pages/404.astro` | 存在しない URL のときのページ |

アクセス解析は Cloudflare Web Analytics を使っています（ダッシュボードで設定。コードの変更は不要）。

GitHub からの取得（使用言語・リポジトリの情報）は、トークンがなくても動きますが、取得回数の制限に当たると予備の値になったり表示が消えたりします。Cloudflare Pages の環境変数に `GITHUB_TOKEN`（公開リポジトリを読むだけなので、権限なしの fine-grained token で十分）を設定すると安定します（`src/lib/github.js`）。トークンで断られたとき（期限切れ、ほかの組織がトークンでの読み取りを制限している、など）は、トークンなしで取り直します。

### アクセスカウンター

フッターの半券の「No. 000123」は訪問者数です。

| 場所 | 内容 |
| --- | --- |
| `functions/api/visits.js` | Cloudflare Pages Functions の API。`GET /api/visits` で数を返し、`POST` で 1 増やす（POST は yonu.work からだけ受け付ける） |
| `db/schema.sql` | 数を入れる表。D1 データベース `yonu-work-counter`（yonu33 のアカウント）に入っている |
| `src/components/Footer.astro` | 表示。トップページを開いたときに、同じブラウザからは 1 日 1 回だけ数える（ブラウザには数えた日付だけを残す） |

Pages の設定（Settings → Bindings）で、D1 データベース `yonu-work-counter` を変数名 `DB` でつないでいます。つながっていないときや数が取れないときは、番号を出さないだけでページは普通に表示されます。

今の数を見る・直すときは、wrangler で D1 に直接問い合わせます（Cloudflare のアカウントが複数あるので、`npx wrangler whoami` で yonu33 のアカウント ID を確認して指定します）。

```sh
export CLOUDFLARE_ACCOUNT_ID=<yonu33 のアカウント ID>
npx wrangler d1 execute yonu-work-counter --remote --command "SELECT * FROM counters"
npx wrangler d1 execute yonu-work-counter --remote --command "UPDATE counters SET value = 0 WHERE name = 'visits'"
```

`npm run dev`（Astro の開発サーバー）では API が動かないので、番号は出ません。

### 検索エンジン向けの情報

トップページの `<head>` に、構造化データ（JSON-LD）を入れています（`src/layouts/Layout.astro`）。ページには表示されません。

- `WebSite`：検索結果に出すサイト名（`yonu.work`）と説明文
- `Person`：このサイトの持ち主（名前・アイコン・所属）と、同じ人のほかのアカウント（`src/data/profile.js` の `sameAs`）

SNS やブログを増やしたら `sameAs` に URL を足します。公開後は [リッチリザルト テスト](https://search.google.com/test/rich-results) で読み取れているかを確認できます。

## 構成

```
src/
  pages/        トップ（index.astro）、404、sitemap.xml
  layouts/      ページ共通の枠（ヘッダー、左右の目次、スマホの下部ナビ、<head>）
  components/   トップのチケット、記事、相互リンク、フッター、テーマ切り替え
  data/         サイトの内容（プロフィール・作ったもの・記録・相互リンク・記事などの予備の値）
  lib/          ビルド時の取得（記事一覧、GitHub の使用言語とリポジトリの情報、相互リンクのサイト名・紹介文・アイコン）
  styles/       見た目（末尾の「文字サイズの底上げ」で文字の大きさをまとめて調整）
  assets/icons/ SNS のアイコン
functions/      Cloudflare Pages Functions（アクセスカウンターの API）
db/             アクセスカウンター用の D1 データベースの表の定義
public/         そのまま配信するファイル（アイコン画像、OGP 画像、_headers、_redirects、robots.txt）
scripts/        OGP 画像を作るスクリプトとひな形（og/og.html・og/cat.png）
```
