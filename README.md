# mamochi — portfolio

ウェブシステム・ゲーム・LINEスタンプを紹介するポートフォリオサイト。ビルド不要の静的サイトです（HTML / CSS / JS のみ）。

## 確認方法

`index.html` をブラウザで開くだけで動きます。ローカルサーバーで見る場合：

```sh
npx serve .   # または python3 -m http.server
```

## 内容の編集

作品情報は **`assets/js/data.js` だけ** 編集すれば反映されます。

| 項目 | 内容 |
| --- | --- |
| `SITE` | 名前、メールアドレス、SNSリンク |
| `WORKS` | 作品の一覧（`type`: `web` / `game` / `sticker`） |
| `STICKER_SETS` | LINEスタンプの表情の組み合わせ |

- サムネイルはパラメータから自動生成しています。実際のスクリーンショットを使う場合は、作品に `image: "assets/img/xxx.png"` を追加してください。
- `playable: true` の作品は、ページ内のミニゲームへ移動します。

## 構成

```
index.html
assets/css/style.css   デザイン（ライト／ダーク対応）
assets/js/data.js      作品データ
assets/js/main.js      描画・インタラクション・ミニゲーム
```

## 公開

GitHub Pages の場合：リポジトリの Settings → Pages で、ブランチのルート (`/`) を指定するだけで公開できます。

> 更新したのに古い表示のままになる場合は、`index.html` の `?v=20261024g` の部分（3か所）を新しい文字に変えてください。ブラウザが新しいファイルを読み直します。
