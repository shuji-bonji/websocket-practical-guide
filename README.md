<!-- [![Build and Deploy](https://github.com/shuji-bonji/fact-checklist/actions/workflows/deploy.yml/badge.svg)](https://github.com/shuji-bonji/fact-checklist/actions/workflows/deploy.yml) -->

[![SvelteKit](https://img.shields.io/badge/SvelteKit-v2.16-red?logo=svelte&labelColor=000)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Svelte5](https://img.shields.io/badge/-Svelte%205-%23ff3e00?logo=svelte&logoColor=ffffff)](https://svelte.dev/)
[![CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](https://claude.ai)

# WebSocket Learning Project

ブラウザ標準WebSocket APIを中心としたリアルタイムWebアプリケーション学習プロジェクト。SvelteKit + TypeScript + MDsveXで構築された学習サイトです。

## 📚 プロジェクト概要

- **学習目標**: ブラウザ標準WebSocket APIをマスターし、PWA対応のリアルタイムWebアプリケーションを構築する
- **総学習時間**: 約50-60時間の構造化されたカリキュラム
- **技術スタック**: SvelteKit + TypeScript + MDsveX + Vite + Prism.js

## 🛠️ 開発環境セットアップ

### 前提条件

- Node.js (推奨: v20以上)
- npm (推奨: v8以上) または pnpm または yarn

### インストール

```bash
# 依存関係のインストール
npm install
```

## 🚀 開発コマンド

### 基本コマンド

```bash
# 開発サーバーの起動
npm run dev

# 開発サーバーを起動してブラウザで開く
npm run dev -- --open

# プロダクションビルド
npm run build

# プロダクションビルドのプレビュー
npm run preview
```

### コード品質・テスト

```bash
# TypeScript型チェック（Svelte含む）
npm run check

# 型チェックをwatch modeで実行
npm run check:watch

# ESLint + Prettierでコードチェック
npm run lint

# Prettierでコードフォーマット
npm run format
```

### SvelteKit固有

```bash
# SvelteKitの同期（自動実行されます）
npm run prepare
```

## 🏗️ サイト構成（MDsveX + SvelteKit）

### ディレクトリ構造

```
src/
├── routes/                 # SvelteKitページ・ルート
│   ├── +page.svelte       # トップページ
│   └── +layout.svelte     # 共通レイアウト
├── lib/                   # 再利用可能なコンポーネント・ユーティリティ
│   └── index.ts           # ライブラリエクスポート
├── app.html               # HTMLテンプレート
└── app.d.ts               # TypeScript型定義

memo/                      # 学習コンテンツ（Markdown）
├── curriculum.md          # メインカリキュラム
├── socket.md              # WebSocket基礎
├── end-to-end-hop-by-hop.md
└── ... (その他の学習資料)

static/                    # 静的ファイル
└── favicon.png
```

### MDsveX統合

MDsveXにより、Markdown内でSvelteコンポーネントを使用可能：

```markdown
# 学習コンテンツ

<script>
  import WebSocketDemo from '$lib/components/WebSocketDemo.svelte';
</script>

## WebSocketデモ

<WebSocketDemo />

通常のMarkdownテキストとSvelteコンポーネントを組み合わせることができます。
```

### ファイル拡張子

- `.svelte` - 通常のSvelteコンポーネント
- `.svx` - MDsveX（Markdown + Svelte）ファイル
- 両方の拡張子が `svelte.config.js` で設定済み

### ルーティング

SvelteKitのfile-based routingを使用：

```
src/routes/
├── +page.svelte          # / (トップページ)
├── about/
│   └── +page.svelte      # /about
├── phase1/
│   ├── +page.svelte      # /phase1 (Phase 1概要)
│   └── introduction/
│       └── [lesson]/
│           └── +page.svx # /phase1/introduction/[lesson] (学習コンテンツ)
└── +layout.svelte        # 全ページ共通レイアウト
```

## 📖 学習コンテンツの構成

### 1. カリキュラム構造

`memo/curriculum.md` に50-60時間の体系的なカリキュラムを用意：

- WebSocket入門（5-7時間）
- ネットワーク技術（6.5-7.5時間）
- WebSocket API基本構造（5-6時間）
- データ通信（6-7時間）
- 高度なトピック（8-10時間）
- テスト手法（5-6時間）
- 実践プロジェクト（15-20時間）

### 2. 学習フェーズ

1. **Phase 1**: WebSocket API基礎
2. **Phase 2**: RxJSパターンからSvelteストアへの移行
3. **Phase 3**: PWA統合とプロダクション対応
4. **Phase 4**: Socket.IO等の応用技術（オプション）

## 🎯 主な学習目標

- **ブラウザ標準WebSocket API**の完全理解
- SvelteKitでのリアルタイムアプリケーション構築
- PWA + WebSocketの統合実装
- 適切なサブプロトコル設計
- プロダクションレベルのセキュリティ・スケーラビリティ

## 🔧 技術仕様

- **フロントエンド**: SvelteKit 2.16.x + TypeScript 5.x
- **ビルドツール**: Vite 6.2.x
- **ドキュメント**: MDsveX 0.12.x
- **コード品質**: ESLint 9.18.x + Prettier 3.4.x
- **型チェック**: svelte-check 4.x
- **シンタックスハイライト**: Prism.js 1.30.x
- **図表作成**: Mermaid 11.7.x

## 📝 開発時の注意点

- 型安全性確保のため、コミット前に `npm run check` を実行
- コード品質維持のため `npm run lint` でチェック
- `memo/` ディレクトリの学習資料を参考にWebSocket実装
- ネイティブWebSocket APIの理解を優先し、その後にライブラリを学習

## 🤖 Claude Code開発者向け

### 必須参照ドキュメント

- **[CLAUDE.md](./CLAUDE.md)** - 開発指針とPhase別実装戦略
- **[memo/claude-code-phases.md](./memo/claude-code-phases.md)** - 詳細な実装ガイド
- **[memo/websocket-environments.md](./memo/websocket-environments.md)** - 環境戦略と技術詳細
- **[memo/deployment-strategy.md](./memo/deployment-strategy.md)** - デプロイメント戦略

### Phase別開発指針

Phase別開発では必ず対応する環境制約を確認してください：

- **Phase 1**: GitHub Pages互換（サーバーレス）
- **Phase 2**: ローカル開発（Docker + Node.js）
- **Phase 3**: テスト統合（モック + E2E）
- **Phase 4**: 本番デプロイ（Vercel + Railway）
