# AI Travel Experience Designer (AIトラベル・エクスペリエンス・デザイナー)

「AIトラベル・エクスペリエンス・デザイナー」は、ユーザーの漠然とした願望やパーソナリティを基に、AIが「まだ見ぬ旅の可能性」を創造し、その魅力をプレビュー動画としてオンデマンドで自動生成する、次世代の旅行体験プラットフォームです。

## コンセプト

**"Designing Future Memories"**
「情報」ではなく「感情」で旅先を選ぶ新しい体験を提供します。

### 主な機能

1.  **直感的なプロファイル選択**: 「のんびりシニア」「わんぱくファミリー」など、ユーザーの属性に合わせたモード選択。
2.  **AIによる旅の提案**: 漠然とした要望から、具体的な体験コンセプト（例：「歴史散策」「没入する自然」）を提案。
3.  **動画プレビュー**: 行く前から「体験」を味わえる、没入感のある動画プレビュー。
4.  **具体的な旅程作成**: 選択したコンセプトに基づいた、実現可能な詳細スケジュールの生成。

## 技術スタック (Tech Stack)

*   **Frontend**: React (v18), Vite (v7), TypeScript
*   **Styling**: Vanilla CSS (Variables, Glassmorphism design system)
*   **Routing**: React Router DOM (v7)

## 実行方法 (How to Run)

### 必要要件 (Prerequisites)

*   Node.js (v18 or higher recommended)
*   npm

### インストール (Installation)

プロジェクトディレクトリにて、以下のコマンドを実行し依存パッケージをインストールしてください。

```bash
npm install
```

### 開発サーバーの起動 (Start Development Server)

以下のコマンドでローカル開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### ビルド (Build)

本番環境向けのビルドを行う場合は、以下のコマンドを実行します。

```bash
npm run build
```

生成されたファイルは `dist/` ディレクトリに出力されます。

## ディレクトリ構成

*   `src/components`: 再利用可能なUIコンポーネント (Header, Footerなど)
*   `src/pages`: 各画面のページコンポーネント
    *   `Home.tsx`: ランディングページ
    *   `ProfileSelection.tsx`: プロファイル選択画面
    *   `Proposal.tsx`: AI提案画面
    *   `VideoPreview.tsx`: 動画プレビュー画面
    *   `Itinerary.tsx`: 旅程詳細画面
*   `src/styles`: グローバルスタイル (`index.css`)
*   `src/services`: API連携モジュール

## デプロイ (Google Cloud Run)

フロントエンドアプリを Google Cloud Run にデプロイする手順です。

### 1. 準備 (API URL の設定)

フロントエンドがバックエンド API と通信するために、バックエンドの URL を環境変数としてビルド時に注入する必要があります。

### 2. Artifact Registry リポジトリの準備

バックエンドと同じリポジトリ（または新規リポジトリ）を使用します。

```bash
# リポジトリを新規作成する場合
gcloud artifacts repositories create frontend-repo \
    --repository-format=docker \
    --location=asia-northeast1
```

### 3. コンテナイメージのビルドとプッシュ

Cloud Build 設定ファイル (`cloudbuild.yaml`) を使用して、バックエンドの URL を注入しながらビルド・プッシュします。

まず、プロジェクトルートに `cloudbuild.yaml` があることを確認してください。

```bash
# your-backend-url はデプロイ済みのバックエンドの URL (例: https://backend-api-xxx-an.a.run.app/api/v1)
# your-project-id は自身のプロジェクト ID に置き換えてください
gcloud builds submit . \
    --config cloudbuild.yaml \
    --substitutions=_VITE_API_BASE_URL=https://your-backend-url/api/v1,_IMAGE_NAME=asia-northeast1-docker.pkg.dev/your-project-id/frontend-repo/frontend-api
```

### 4. Cloud Run へのデプロイ

```bash
gcloud run deploy frontend-api \
  --image asia-northeast1-docker.pkg.dev/your-project-id/frontend-repo/frontend-api \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

デプロイ完了後に表示される URL にアクセスすると、アプリケーションが公開されています。

---
*注: 静的な SPA を提供するため、Dockerfile 内で Nginx を使用して 8080 ポートでリッスンするように設定されています。*
