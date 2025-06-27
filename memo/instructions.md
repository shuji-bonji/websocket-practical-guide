# WebSocket学習コンテンツとを提供してください。

## 対象者
TypeScript/JavaScript中級者、RxJS経験者、Svelte学習者、PWA・リアルタイム通信に興味がある開発者  
WebSocketをマスターしたい、またこれらを利用する開発者  
サブプロトコルをはじめとする、PWAなどもセットに、ウェブアプリの作成対象の幅を広げたい開発者  

## リポジトリ
https://github.com/shuji-bonji/websocket-learning


## 学習サイト実装技術

- SveltKit + MDsveX
- TypeScript
- Markdonw, Mermaid
- prettier, eslint
- Github Actons
- GitHub Pages

### 注意事項
Svelteについて古い情報の回答が来るので、バージョンが5以降の最新の仕様を前もって以下から参照をお願いします。
https://svelte.jp/docs/llms

## 実装リポジトリ（SvelteKitアプリ集）

https://github.com/shuji-bonji/websocket-learning-apps

実際のアプリを作る?

### 技術構成
- フロントエンド: Svelte/SvelteKit + TypeScript
- バックエンド: Node.js + TypeScript + WebSocket標準ライブラリ
- テスト: Vitest + Playwright
- PWA: Service Worker + WebSocket統合
- Github Actons
- Vercel ?


（Angular については、今回配慮する必要はない。Svelte学習では必要だがそちらは別プロジェクトとなります。）


```
websocket-learning-apps/
├── chat-app/                  # 最小チャット（双方向通信）
├── rps-game/                  # ジャンケンゲーム（状態同期）
├── location-share/            # 位置共有PWA（Service Worker）
├── shared-lib/                # 共通の型定義やユーティリティ
└── README.md
```


   •  内容：動くサンプル集、各アプリごとに独立実装
   •  開発スタイル：SvelteKit + TypeScript、Rune活用、WebSocket統合
   •  自分の他のアプリ開発時に流用・参考化

## 目標

- Webにてリアルタイム双方向通信を行えるようになる
- サブプロトコルに詳しくなり、適材適所でこれを選択できるようになる。

以下を成果物にする

- 簡単なリアルタイムゲーム
   - リアルタイムジャンケンゲーム
- チャットアプリ
- 位置情報共有アプリ

