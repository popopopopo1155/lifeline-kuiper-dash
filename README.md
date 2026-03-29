# 生活必需品価格インテリジェンス・ダッシュボード

プレミアム・ミニマリズムを追求した、生活必需品の在庫・価格管理ダッシュボード。
統計データ（e-Stat）と市場価格をAIが分析し、最適な購入タイミングを提案します。

## 🌟 主な機能
- **価格インテリジェンス**: e-Statの実データに基づき、現在の価格が統計的に安値圏かどうかを判定。
- **在庫シミュレーター**: 世帯人数に合わせた消費スピードを計算し、欠品予定日を予測。
- **AIコンシェルジュ**: Gemini 1.5 Flashによる、パーソナライズされた「今日のアドバイス」。
- **マルチソース検索**: 楽天APIを活用した最新の市場価格取得。

## 🛠 開発環境のセットアップ
1. 依存関係のインストール: `npm install`
2. ローカルサーバー起動: `npm run dev`

## 🚀 Vercel へのデプロイ
このプロジェクトは Vercel Serverless Functions を活用してバックエンド（APIプロキシ）を動作させます。

### 1. GitHubへのプッシュ
```bash
git init
git remote add origin https://github.com/popopopopo1155/[リポジトリ名].git
git add .
git commit -m "Initial deploy to Vercel"
git push -u origin main
```

### 2. Vercelでの環境変数設定
Vercelのプロジェクト設定（Settings > Environment Variables）で以下の値を設定してください：

- `RAKUTEN_APP_ID`: 楽天のアプリID
- `VITE_ESTAT_APP_ID`: e-StatのappId（ブラウザで使用するため `VITE_` プリフィックスが必要）
- `GEMINI_API_KEY`: Google AI StudioのAPIキー
- `KEEPA_API_KEY`: KeepaのAPIキー（任意）

### 3. デプロイ完了
GitHubと連携すれば、メインブランチへのプッシュで自動的にデプロイされます。

---
Developed by popopopopo1155 & AI
