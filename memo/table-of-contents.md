# WebSocket学習 目次

## 📖 学習リソース一覧

### 📚 メインカリキュラム
- [**curriculum.md**](./curriculum.md) - WebSocket学習カリキュラム（改訂版：WebSocket API中心）
  - 総学習時間: 約50-60時間
  - 対象者: TypeScript/JavaScript中級者、RxJS経験者、Svelte学習者
  - 最終目標: ブラウザ標準WebSocket APIを使ったPWA対応リアルタイムWebアプリケーション開発

### 🔧 技術解説資料
- [**socket.md**](./socket.md) - WebSocket基礎知識
- [**end-to-end-hop-by-hop.md**](./end-to-end-hop-by-hop.md) - End-to-End vs Hop-by-Hop通信
- [**readystatus-and-colse-code.md**](./readystatus-and-colse-code.md) - WebSocket状態とクローズコード
- [**web_realtime_communication_overview.md**](./web_realtime_communication_overview.md) - Webリアルタイム通信概要

### 📊 用途・プロトコル分析
- [**list-of-websocket-uses.md**](./list-of-websocket-uses.md) - WebSocketの11主要用途カテゴリー
- [**list-of-major-websocket-subprotocols.md**](./list-of-major-websocket-subprotocols.md) - 主要WebSocketサブプロトコル
- [**list-of-webtransport-uses.md**](./list-of-webtransport-uses.md) - WebTransport用途（将来技術）

### 📋 その他
- [**instructions.md**](./instructions.md) - プロジェクト指示・ガイドライン

---

## 🗂️ カリキュラム詳細目次

### Phase 1: 基礎理解 (18.5-21.5時間)

#### **1. WebSocket 入門** (5-7時間)
- 1.1 WebSocketとは何か (1時間)
- 1.2 HTTPの限界とWebSocketの優位性 (1時間)
- 1.3 WebSocketの利用例と適用場面 (2-3時間)
- 1.4 WebSocket vs 他技術の比較理解 (1時間)

#### **2. WebSocket を取り巻くネットワーク技術** (6.5-7.5時間)
- 2.1 WebSocketを理解するためのHTTP基礎 (45分)
- 2.2 OSI参照モデルとWebSocketの位置 (1時間)
- 2.3 HTTP/1.1からHTTP/3までのWebSocket対応 (2時間)
- 2.4 WebSocket接続確立プロセス (1.5-2.5時間)
- 2.5 セキュリティとポート管理 (1時間)

#### **3. WebSocket API の基本構造と仕組み** (5-6時間)
- 3.1 WebSocket接続ライフサイクル (2時間)
- 3.2 イベントベース通信モデル (2時間)
- 3.3 クライアント・サーバー役割分担 (1-2時間)

#### **4. WebSocket API の基本操作** (4-5時間)
- 4.1 WebSocket URL と接続確立 (1時間)
- 4.2 ブラウザ標準WebSocket API実装 (2-3時間)
- 4.3 接続失敗と再接続処理 (1-2時間)

### Phase 2: 実装技術 (17-20時間)

#### **5. WebSocket API データ通信** (6-7時間)
- 5.1 WebSocketオブジェクトとSvelteストア (2-3時間)
- 5.2 データ送受信パターン (2時間)
- 5.3 高度なエラーハンドリング (2-3時間)

#### **6. WebSocket データフレームとサブプロトコル** (6-7時間)
- 6.1 WebSocketフレーム構造 (1-2時間)
- 6.2 バイナリデータ送信 (1-2時間)
- 6.3 WebSocketサブプロトコルの設計 (2-3時間)

#### **7. WebSocket 高度なトピック** (8-10時間)
- 7.1 セキュリティ実装 (3-4時間)
- 7.2 PWAとWebSocketの統合 (3-4時間)
- 7.3 スケーラビリティと負荷対策 (2時間)

### Phase 3: テスト・評価 (8-10時間)

#### **8. テスト手法** (5-6時間)
- 8.1 クライアント側テスト (2-3時間)
- 8.2 サーバー側テスト (1-2時間)
- 8.3 E2Eテスト (1-2時間)

#### **9. 他技術との比較・使い分け** (3-4時間)
- 9.1 代替技術の比較 (2時間)
- 9.2 適用判断基準 (1-2時間)

### Phase 4: 実践開発 (15-20時間)

#### **10. 実践演習プロジェクト** (15-20時間)
- 10.1 基礎プロジェクト: PWA対応リアルタイムチャット (7-10時間)
- 10.2 応用プロジェクト: リアルタイム共同編集システム (8-10時間)

### 応用編 (オプション)

#### **🔧 Socket.IO** (3-5時間)
- Socket.IOを学ぶべき場合
- Socket.IO vs WebSocket API比較
- Socket.IO基本実装（演習）

---

## 🎯 学習段階別習得目標

### 🌱 基礎レベル
- ブラウザ標準WebSocket APIの基本概念理解
- WebSocketの11の主要カテゴリー用途把握
- HTTP/1.1〜HTTP/3でのWebSocket対応違い理解
- End-to-End vs Hop-by-Hop通信の違い理解

### 🚀 中級レベル
- WebSocket vs 他技術の使い分け判断
- 適切なサブプロトコル選択・設計
- プロトコルバージョニング戦略理解

### 💪 実装レベル
- TypeScript + ブラウザ標準WebSocket APIでのクライアント実装
- RxJSパターンでのWebSocket管理
- SvelteKitでのリアルタイムWebアプリケーション構築
- Node.js + 標準`ws`ライブラリでのサーバー構築

### 🏆 応用レベル
- PWA + WebSocket統合アプリケーション開発
- Service Workerでのオフライン対応
- セキュリティを考慮した実装
- スケーラブルなアーキテクチャ設計

### 🎓 マスタレベル
- 技術選定の適切な判断
- プロダクションレベルのPWA + WebSocketアプリ構築
- Socket.IO等応用技術の必要性判断と選択

---

## 📚 推奨学習順序

1. **基礎固め**: curriculum.md の 1〜4章 + 関連資料
2. **実装練習**: curriculum.md の 5〜7章 + コード演習
3. **品質向上**: curriculum.md の 8〜9章 + テスト実装
4. **実践応用**: curriculum.md の 10章 + プロジェクト開発
5. **発展学習**: Socket.IO等の応用技術（必要に応じて）

## 🔗 関連リンク

- [プロジェクトREADME](../README.md)
- [開発ガイド](../CLAUDE.md)
- [SvelteKit公式ドキュメント](https://kit.svelte.dev/docs)
- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455 - WebSocket Protocol](https://tools.ietf.org/html/rfc6455)