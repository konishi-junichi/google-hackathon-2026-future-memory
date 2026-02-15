#!/bin/bash
set -e

# データベースのパスを環境変数から取得（デフォルトは /app/data/app.db）
export DATABASE_PATH="${DATABASE_PATH:-/app/data/app.db}"
DB_DIR=$(dirname "$DATABASE_PATH")
mkdir -p "$DB_DIR"

# 起動時に GCS からデータベースを復元（失敗してもアプリケーションは起動させる）
if [ -n "$REPLICA_URL" ]; then
    echo "Restoring database from $REPLICA_URL..."
    litestream restore -if-db-not-exists -if-replica-exists -o "$DATABASE_PATH" "$REPLICA_URL" || echo "Restore failed or no replica found, starting fresh."
fi

# Litestream を経由してアプリケーションを起動
# litestream replicate コマンドは、指定されたコマンド（uvicorn）をサブプロセスとして実行し、
# データベースの変更をリアルタイムでレプリケーションします。
exec litestream replicate -exec "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"
