// 記事一覧は src/lib/articles.js がビルド時に Qiita / Zenn / note から自動で取得する。
// ここは取得に失敗したときだけ使う予備リスト（新しい記事を書いても更新は不要）。
export const fallbackArticles = [
  {
    platform: "Qiita",
    title: "大学メールアドレスによるメール認証システムを作ってDiscordの大学コミュニティに導入した話",
    url: "https://qiita.com/yonu/items/fcaac74ca97eb41835b7",
    date: "2025.12.09",
    thumbnail: "https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4281160%2F476e210c-cc92-4c42-85a9-4e2eea497be0.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&w=1400&fit=max&s=4a68ad2067b25005a9251df71e4179d9"
  },
  {
    platform: "note",
    title: "Visual Studio CodeでRemote SSHのすすめ～自宅でも大学の課題をする方法～【会津大生向け】",
    url: "https://note.com/yonu33/n/n2391204a1fbe",
    date: "2025.11.15",
    thumbnail: "https://assets.st-note.com/production/uploads/images/229398634/rectangle_large_type_2_1f13574cfc3f0f93c4462d0d78cebe99.png?width=1280"
  }
];
