# AI Travel Experience Designer - バックエンド API

このプロジェクトは、「AI Travel Experience Designer」アプリケーションのバックエンドサービスです。
**FastAPI** を使用して構築されており、**Google Gemini** を活用した AI による旅行プランニングやメディア生成機能を提供するための REST API です。
データベースには **SQLite** を使用し、**Litestream** を用いて Google Cloud Storage (GCS) にリアルタイムでレプリケーションすることで、Cloud Run 上での永続化を実現しています。

## 主な機能

- **旅行プランニング**: ユーザーのモード（シニア、ファミリー、インフルエンサー、アクティブなど）に基づいた、特徴的な旅行プラン案の生成。
- **行程表（Itinerary）の生成**: 選択されたプラン案に基づいて、詳細な1日のスケジュールを作成。
- **メディア機能（スタブ）**: 動画生成連携のためのプレースホルダー実装。
- **多言語対応**: 英語 ('en') と日本語 ('ja') のレスポンスに対応。
- **DB 永続化**: Litestream による GCS への自動レプリケーションと起動時のリストア。

## 前提条件

- Python 3.12 以上
- **Google Cloud プロジェクト**（**Vertex AI API** が有効であること）
- Vertex AI へのアクセス権限を持つ**サービスアカウント**（例: `Vertex AI ユーザー` ロール）
- ローカル開発用の**サービスアカウント キー (JSON)**
- **Cloud Storage バケット**（画像アップロード用、および DB バックアップ用）

## Cloud Storage (GCS) の設定について

画像のアップロード先および Litestream のレプリカ先として Google Cloud Storage を使用します。

### 推奨設定
*   **バケット名**: グローバルで一意な名前（例: `your-project-id-assets` および `your-project-id-db-replica`）
*   **ロケーション**: バックエンド（Cloud Run / Vertex AI）と同じリージョンを推奨します（例: `us-central1`, `asia-northeast1`）。
*   **権限**:
    *   資産用バケット: `allUsers` に `Storage Object Viewer` 権限（または公開アクセス設定）
    *   DBレプリカ用バケット: 実行用サービスアカウントに `Storage Object Admin` 権限

## セットアップ

1.  **バックエンドディレクトリに移動します:**
    ```bash
    cd repos/google-hackathon-2026-backend
    ```

2.  **仮想環境の作成 (推奨):**
    ```bash
    python3.12 -m venv .venv
    source .venv/bin/activate  # Windowsの場合: .venv\bin\activate
    ```

3.  **依存関係のインストール:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **環境設定:**
    
    本アプリケーションは認証に **Google Cloud サービスアカウント** を使用します。

    *   環境設定ファイルの例をコピーして作成します:
        ```bash
        cp .env.example .env
        ```
    *   サービスアカウントの JSON キーファイルをプロジェクト内に配置します（例: `service-account.json`）。
    *   `.env` ファイルを編集し、以下の項目を設定します:
        ```env
        GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
        
        # Google Cloud Project ID
        GCP_PROJECT_ID=your-project-id
        GCP_LOCATION=asia-northeast1
        
        # Region for Vertex AI (LLM)
        VERTEX_AI_LOCATION=us-central1
        
        # GCS Configuration (Assets)
        GCS_BUCKET_NAME=your-assets-bucket-name

        # Litestream Configuration (DB Persistence)
        # 起動時にGCSからリストアし、実行中にレプリケーションを行うためのURL
        # ローカル開発でレプリケーションを行わない場合は空のままでOK
        REPLICA_URL=gcs://your-db-replica-bucket-name/db
        DATABASE_PATH=./app/data/app.db
        ```

## サーバーの起動

### ローカルでの通常起動 (Litestream なし)
SQLite を直接使用して起動します。

```bash
mkdir -p app/data
DATABASE_PATH=./app/data/app.db python3.12 -m uvicorn main:app --reload
```

### Docker を使用した起動 (Litestream あり)
Litestream コンテナとして起動します（`REPLICA_URL` が設定されている場合、GCS との同期が行われます）。

```bash
docker build -t backend-api .
docker run -p 8080:8080 --env-file .env backend-api
```

## デプロイ (Google Cloud Run)

このアプリケーションは **Google Cloud Run** での実行を想定して設計されています。

### 1. Google Cloud 初期設定

`gcloud` CLI を使用して、プロジェクトとリージョンを設定します。

```bash
# ログイン (ブラウザが開きます)
gcloud auth login

# プロジェクト ID の設定
gcloud config set project your-project-id

# デフォルトリージョンの設定 (例: 東京)
gcloud config set run/region asia-northeast1

# 必要な API の有効化
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    storage.googleapis.com
```

### 2. Artifact Registry リポジトリの作成

コンテナイメージを格納するためのリポジトリを Artifact Registry に作成します。

```bash
gcloud artifacts repositories create backend-repo \
    --repository-format=docker \
    --location=asia-northeast1 \
    --description="Docker repository for backend API"
```

### 3. サービスアカウントの設定

Cloud Run サービスに付与する、最小権限のサービスアカウントを作成・設定します。<br>
なお、Default Compute service accountには、Artifact Registr

```bash
# サービスアカウントの作成
# gcloud iam service-accounts create backend-api-sa \
#     --display-name="Backend API Service Account"

# Vertex AI ユーザーロールの付与 (LLM 利用のため)
# gcloud projects add-iam-policy-binding your-project-id \
#     --member="serviceAccount:backend-api-sa@your-project-id.iam.gserviceaccount.com" \
#     --role="roles/aiplatform.user"

# Storage オブジェクト管理者ロールの付与 (GCS 読み書きのため)
# gcloud projects add-iam-policy-binding your-project-id \
#     --member="serviceAccount:backend-api-sa@your-project-id.iam.gserviceaccount.com" \
#     --role="roles/storage.objectAdmin"
```

### 4. コンテナイメージのビルドとプッシュ

`gcloud builds` を使用して、Artifact Registry にイメージをビルド・プッシュします。

```bash
gcloud builds submit --tag asia-northeast1-docker.pkg.dev/your-project-id/backend-repo/backend-api .
```

### 5. Cloud Run へのデプロイ

作成したサービスアカウントと環境変数を指定してデプロイします。

```bash
gcloud run deploy backend-api \
  --image asia-northeast1-docker.pkg.dev/your-project-id/backend-repo/backend-api \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

*注: データベースの永続化には Litestream を使用しているため、`REPLICA_URL` の設定が正しく行われていることを確認してください。*

## API ドキュメント

サーバーの起動後、以下の URL からインタラクティブな API ドキュメント（Swagger UI）にアクセスできます:
**http://localhost:8000/docs**

## プロジェクト構造

```
app/
├── api/
│   └── endpoints/    # ルートハンドラー
├── models/           # Pydantic スキーマ
├── services/         # ビジネスロジック
└── database.py       # SQLAlchemy & WAL 修正
litestream.yml        # Litestream 設定
run.sh                # Cloud Run 起動スクリプト
Dockerfile            # Litestream インストール済み Docker イメージ
main.py               # エントリーポイント
```
