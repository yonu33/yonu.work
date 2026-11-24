# yonu.work

yonu のポートフォリオサイト（https://yonu.work/）です。作ったもの・活動の記録・記事をまとめています。

Astro と Tailwind CSS で作った 1 ページの静的サイトで、Cloudflare Pages で公開しています。

## 内容の更新

ほとんどの内容は `src/data/` のファイルを書き換えるだけで更新できます。

| 変えたいもの | ファイル |
| --- | --- |
| プロフィール・技術スタック・連絡先 | `src/data/profile.js` |
| 作ったもの | `src/data/projects.js` |
| これまでの記録 | `src/data/history.js` |
| GitHub の使用言語 | ビルド時に公開リポジトリから自動で集計（`src/lib/githubLanguages.js`）。CSS・HTML などは除く。取得に失敗したら `src/data/githubLanguages.js` の予備の値。ビルド環境に `GITHUB_TOKEN` を設定すると、GitHub の取得回数の制限に当たりにくくなる |
| 記事・発信 | 自動で取得（下の「記事一覧」） |
| 相互リンク・このサイトへのリンク | `src/components/MutualLinks.astro` |
| トップのチケット（SNS リンク・発券情報） | `src/components/Hero.astro` |
| サイトの説明文（検索結果や SNS で共有したときに出る文） | `src/layouts/Layout.astro` |

### 作ったもの（`projects.js`）

| 項目 | 内容 |
| --- | --- |
| `tags` | カードの表面に出す主な技術（2〜3 個） |
| `stack` | 詳細に出す技術の表（`Frontend` などの見出しは自由） |
| `github` | リポジトリの URL。`"非公開"` にするとリンクを出さない |
| `article` | 解説記事の URL（任意） |
| `site` | 公開中のサイトの URL（任意）。詳細に「サイトを開く」が出る |

### これまでの記録（`history.js`）

古い順に書きます。サイトでは新しい順に並び、年ごとに見出しが入ります。最初に表示するのは新しい 5 件だけで、それより古いものは「過去の履歴をすべて表示」で開きます（件数は `src/pages/index.astro` の `VISIBLE_HISTORY`）。

### 記事一覧

記事はビルド時に Qiita（`yonu`）・Zenn（`yonu`）・note（`yonu33`）から自動で取得し、新しい順に最大 4 件表示します（`src/lib/articles.js`）。

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
```

`npm run build` は、Cloudflare Pages でのビルドのために、最初に `npm install --legacy-peer-deps` を実行します。

## 公開

`main` に push すると、Cloudflare Pages が自動でビルドして公開します。

| ファイル | 内容 |
| --- | --- |
| `public/_headers` | セキュリティ関連のヘッダーと、`/_astro/` 以下（CSS・JS）の長期キャッシュ |
| `public/robots.txt` | 検索エンジン向けの設定 |
| `src/pages/sitemap.xml.js` | `sitemap.xml` をビルド時に作る。ページを増やしたら `paths` に追加する |
| `src/pages/404.astro` | 存在しない URL のときのページ |

アクセス解析は Cloudflare Web Analytics を使っています（ダッシュボードで設定。コードの変更は不要）。

## 構成

```
src/
  pages/        トップ（index.astro）、404、sitemap.xml
  layouts/      ページ共通の枠（ヘッダー、左右の目次、スマホの下部ナビ、<head>）
  components/   トップのチケット、記事、相互リンク、フッター、テーマ切り替え
  data/         サイトの内容（プロフィール・作ったもの・記録・記事の予備リスト）
  lib/          記事一覧の取得
  styles/       見た目（末尾の「文字サイズの底上げ」で文字の大きさをまとめて調整）
  assets/icons/ SNS のアイコン
public/         そのまま配信するファイル（アイコン画像、_headers、robots.txt）
```
