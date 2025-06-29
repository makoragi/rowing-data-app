# Rowing Data Visualization

Rowing Data Visualization は、ボートトレーニングのセッションデータを分析できる React アプリです。サンプル CSV の読み込みやファイルアップロードに対応し、グラフや地図表示で走行データを確認できます。

## セットアップ

依存パッケージをインストールし、開発サーバーを起動します。

```bash
npm install
npm start
```

ブラウザで http://localhost:3000 を開くとアプリが動作します。

### ビルド

本番用ビルドを `build/` フォルダーに生成します。

```bash
npm run build
```

### テスト

テストスイートを実行します。

```bash
npm test
```

### デプロイ

`master` ブランチに push すると GitHub Actions がビルドを行い、GitHub Pages が自動更新されます。

## 使い方

- `public/data` に CSV を追加し、`public/available_files.json` に登録すると選択肢として表示されます。
- アップロード画面から手元の CSV を読み込んで即座に可視化することもできます。

## 主な機能

- カレンダーまたはリストからセッションを選択可能
- 距離・速度・ストロークレートのグラフ表示
- ホバー時に表示されるツールチップをオン/オフ切り替え
- OpenStreetMap タイルを利用した航路の地図表示
- CSV データをアップロードしてその場で解析
