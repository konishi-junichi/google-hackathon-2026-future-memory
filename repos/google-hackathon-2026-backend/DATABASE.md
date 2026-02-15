ご指示に従い、Vertex AI Searchにおける**「検索対象（Searchable）かどうか」**のみに焦点を絞って表記を「〇」か「-」で統一しました。

---

# データベース定義書：Future Memories (Vertex AI Search 検索対象定義版)

## 1. 概要
*   **プラットフォーム**: Google BigQuery
*   **検索エンジン**: Vertex AI Search for Structured Data
*   **対象**: `Plans` テーブルおよび `VideoAssets` テーブル

## 2. テーブル定義詳細

### 2.1. PlanShare (共有された旅行プラン)
ユーザーが「共有する」ボタンを押下した際に格納される、公開用・検索用のプランデータです。

| カラム名 | データ型 | Vertex AI Search<br>(Searchable) | 説明 |
| :--- | :--- | :---: | :--- |
| `plan_id` | STRING | - | UUID (PK) |
| `creator_user_id` | STRING | - | 作成者ユーザーID |
| `title` | STRING | **〇** | プランのタイトル |
| `description` | STRING | **〇** | AIによるプランの魅力解説・概要 |
| `thumbnail_url` | STRING | - | プランの代表画像URL |
| `total_duration_minutes`| INT64 | - | 所要時間（分） |
| `tags` | ARRAY<STRING> | **〇** | 検索用タグ |
| `target_mode` | STRING | - | トラベルモード（カテゴリ） |
| `like_count` | INT64 | - | いいね数 |
| `created_at` | TIMESTAMP | - | 作成日時 |
| **`itinerary`** | **ARRAY<STRUCT>** | - | **行程詳細** |
| &nbsp;&nbsp;`.step_order` | INT64 | - | 順番 |
| &nbsp;&nbsp;`.time` | STRING | - | 時間目安 |
| &nbsp;&nbsp;`.spot_name` | STRING | **〇** | スポット名称 |
| &nbsp;&nbsp;`.location` | GEOGRAPHY | - | 緯度経度 |
| &nbsp;&nbsp;`.type` | STRING | - | スポットタイプ |
| &nbsp;&nbsp;`.note` | STRING | **〇** | 行動メモ・Tips |
| &nbsp;&nbsp;`.ref_video_url` | STRING | - | 紐付けられたSNS動画URL |

### 2.2. VideoAssets (動画資産・インデックス)
AIが「場所名」や「雰囲気」で動画を探すための検索用データです。

| カラム名 | データ型 | Vertex AI Search<br>(Searchable) | 説明 |
| :--- | :--- | :---: | :--- |
| `video_id` | STRING | - | 動画ID (PK) |
| `platform` | STRING | - | プラットフォーム名 |
| `video_url` | STRING | - | 動画リンクURL |
| `poi_name` | STRING | **〇** | 関連するスポット名 |
| `keywords` | ARRAY<STRING> | **〇** | 特徴・雰囲気タグ |
| `location` | GEOGRAPHY | - | 動画撮影地の座標 |
| `created_at` | TIMESTAMP | - | 登録日時 |

---

### その他のテーブル（検索エンジン連携なし）

### 2.3. Users (ユーザー情報)
**実装**: SQLite (`users` table)

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| `id` | INTEGER | ユーザーID (PK, Auto Increment) |
| `username` | STRING | ユーザー名 (Unique) |
| `password_hash` | STRING | パスワードハッシュ |
| `display_name` | STRING | 表示名 |
| `age` | INTEGER | 年齢 |
| `gender` | STRING | 性別 |
| `address` | STRING | 住所 |
| `profile_image_url` | STRING | プロフィール画像URL (GCS) |
| `created_at` | TIMESTAMP | 登録日時 |


### 2.5. PlanFavorites (マイリスト保存済みプラン)
**プラットフォーム**: Google BigQuery
ユーザーが「マイリスト」に保存したプランを管理するテーブルです。元のプランが削除されても残るように、プラン情報をスナップショットとして保持します。

| カラム名 | データ型 | Vertex AI Search<br>(Searchable) | 説明 |
| :--- | :--- | :---: | :--- |
| `favorite_id` | STRING | - | UUID (PK) |
| `user_id` | STRING | - | 保存したユーザーID |
| `plan_id` | STRING | - | 元のプランID (あれば) |
| `title` | STRING | **〇** | プランのタイトル |
| `description` | STRING | **〇** | 概要 |
| `thumbnail_url` | STRING | - | サムネイル |
| `tags` | ARRAY<STRING> | **〇** | タグ |
| `created_at` | TIMESTAMP | - | 保存日時 |
| **`itinerary`** | **ARRAY<STRUCT>** | - | **行程詳細 (PlanShareと同様)** |

### 2.6. UserLikes (いいね履歴)
**プラットフォーム**: Google BigQuery
ユーザーによる「いいね」の履歴を管理し、重複いいねを防止します。

| カラム名 | データ型 | Vertex AI Search<br>(Searchable) | 説明 |
| :--- | :--- | :---: | :--- |
| `like_id` | STRING | - | UUID (PK) |
| `user_id` | STRING | - | ユーザーID |
| `plan_id` | STRING | - | いいねしたプランID |
| `created_at` | TIMESTAMP | - | いいね日時 |

### 2.7. PlanSubInfos (レポート・重複統合・コメント)
**プラットフォーム**: Google BigQuery
既存プランに対する「類似プラン（サブ情報）」や「ユーザーレビュー（コメント）」を格納します。

| カラム名 | データ型 | Vertex AI Search<br>(Searchable) | 説明 |
| :--- | :--- | :---: | :--- |
| `sub_info_id` | STRING | - | UUID (PK) |
| `parent_plan_id` | STRING | - | 親プランID (Plans.plan_id) |
| `info_type` | STRING | - | `REVIEW` (コメント) または `DUPLICATE_MERGE` (類似プラン) |
| `content` | STRING | **〇** | レポート本文 または 類似プランの概要 |
| `user_id` | STRING | - | 投稿者ID |
| `rating` | INT64 | - | 評価 (1-5) ※info_type=REVIEWの場合 |
| `is_duplicate_origin` | BOOL | - | 重複判定によりサブ化されたものか |
| `created_at` | TIMESTAMP | - | 作成日時 |

### 2.8. UserLogs (行動ログ)
**プラットフォーム**: Google BigQuery
| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| `log_id` | STRING | UUID (PK) |
| `user_id` | STRING | ユーザーID |
| `plan_id` | STRING | 対象プランID |
| `action_type` | STRING | 行動種別 (VIEW, SHARE, SEARCH, ETC) |
| `metadata` | STRING | その他詳細情報 (JSON文字列) |
| `timestamp` | TIMESTAMP | 日時 |