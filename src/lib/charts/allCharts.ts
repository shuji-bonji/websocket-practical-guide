// 全ページで使用するMermaidチャート定義

/**
 * Mermaidチャート定義の型
 */
export type MermaidChart = string;

// チャット系チャート
export const chatSequenceDiagram: MermaidChart = `
sequenceDiagram
    participant A as 👤 送信者
    participant G as WebSocketゲートウェイ
    participant R as メッセージルーター
    participant D as メッセージDB
    participant B as 👤 受信者
    
    A->>G: メッセージ送信
    G->>R: メッセージ検証
    R->>D: メッセージ保存
    D-->>R: 保存完了
    R->>G: 配信リスト取得
    G->>B: リアルタイム配信
    G->>A: 送信完了通知
    
    Note over A,B: 平均遅延 < 100ms
    Note over D: 永続化保証
`;

export const qualityControlDiagram: MermaidChart = `
sequenceDiagram
    participant C as クライアント
    participant S as WebSocketサーバー
    participant Q as 品質監視
    participant A as 適応制御
    
    C->>S: 品質統計送信
    S->>Q: 品質分析
    Q->>A: 品質低下検知
    A->>S: ビットレート調整指示
    S->>C: 品質設定変更
    C->>C: エンコード設定適用
    
    Note over C,A: 動的品質調整
    Note over Q: RTT, パケットロス, ジッター監視
`;

// IoT系チャート
export const iotAutomationDiagram: MermaidChart = `
sequenceDiagram
    participant S as 🌡️ 温度センサー
    participant G as ゲートウェイ
    participant R as 自動化ルール
    participant A as スマート照明
    participant U as ユーザーアプリ

    S->>G: 温度データ (25°C)
    G->>R: 条件チェック
    R->>R: ルール評価: 温度 > 24°C
    R->>A: 照明調光指示
    A->>G: アクション実行確認
    G->>U: 状態変更通知
    
    U->>G: 手動オーバーライド
    G->>R: ルール一時停止
    G->>A: 手動制御モード
    
    Note over G,A: ユーザー優先制御
`;

// データストリーミング系チャート
export const performanceOptimizationDiagram: MermaidChart = `
sequenceDiagram
    participant DS as データソース
    participant CACHE as キャッシュ層
    participant WS as WebSocketサーバー
    participant CLIENT as クライアント

    Note over DS,CLIENT: 目標レイテンシ < 10ms
    
    DS->>CACHE: データ更新 (1ms)
    CACHE->>CACHE: 差分計算 (2ms)
    CACHE->>WS: 変更通知 (1ms)
    WS->>CLIENT: リアルタイム配信 (3ms)
    
    Note over DS,CLIENT: 合計レイテンシ: 7ms
`;

export const hftDiagram: MermaidChart = `
sequenceDiagram
    participant MKT as 市場データ
    participant AGG as データ集約
    participant WS as WebSocketサーバー
    participant HFT as HFTクライアント
    participant UI as 一般UI

    MKT->>AGG: 市場価格更新
    
    par 高頻度取引フロー
        AGG->>AGG: バッチ処理 (10ms)
        AGG->>WS: 差分データ配信
        
        alt HFTクライアント
            WS->>HFT: 即座配信 (< 1ms)
            HFT->>HFT: アルゴリズム判定
        else 一般クライアント
            WS->>UI: バッファ済み配信 (100ms)
            UI->>UI: UI更新
        end
    end
    
    Note over MKT,UI: 優先度ベース配信
`;

// 基本アーキテクチャ系チャート
export const basicArchitectureDiagram: MermaidChart = `
graph TB
    subgraph "クライアント層"
        A[📱 モバイルアプリ] --> G[WebSocketゲートウェイ]
        B[💻 Webアプリ] --> G
        C[🖥️ デスクトップアプリ] --> G
    end
    
    subgraph "アプリケーション層"
        G --> H[🔄 メッセージルーター]
        H --> I[👥 ルーム管理]
        H --> J[🔐 認証・認可]
        H --> K[🔔 通知エンジン]
    end
    
    subgraph "データ層"
        I --> L[💾 メッセージDB]
        J --> M[👤 ユーザーDB]
        K --> N[📤 通知キュー]
    end
    
    subgraph "外部サービス"
        K --> O[📲 プッシュ通知]
        K --> P[📧 メール通知]
    end
    
    style G fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#e3f2fd
    style J fill:#fff3e0
    style K fill:#fce4ec
`;

// チャット系追加チャート
export const groupChatRoomDiagram: MermaidChart = `
graph LR
    subgraph "ルーム A"
        A1[👤 ユーザー1] --> RA[WebSocketコネクション]
        A2[👤 ユーザー2] --> RA
        A3[👤 ユーザー3] --> RA
    end
    
    subgraph "ルーム B"
        B1[👤 ユーザー4] --> RB[WebSocketコネクション]
        B2[👤 ユーザー5] --> RB
    end
    
    RA --> M[メッセージルーター]
    RB --> M
    
    M --> RM[ルーム管理]
    RM --> AC[アクセス制御]
    RM --> MM[メンバー管理]
    RM --> PM[権限管理]
    
    style RA fill:#e3f2fd
    style RB fill:#e8f5e8
    style M fill:#f3e5f5
    style RM fill:#fff3e0
`;

export const webrtcHybridDiagram: MermaidChart = `
graph TD
    subgraph "発信者側"
        A[👤 発信者] --> A1[📹 カメラ/マイク]
        A1 --> A2[WebRTC Peer]
    end
    
    subgraph "シグナリングサーバー"
        S[WebSocketサーバー] --> S1[🔄 SDP交換]
        S1 --> S2[🧭 ICE候補交換]
        S2 --> S3[📞 通話状態管理]
    end
    
    subgraph "受信者側"
        B[👤 受信者] --> B1[📺 スピーカー/ディスプレイ]
        B1 --> B2[WebRTC Peer]
    end
    
    A2 -.->|直接P2P通信| B2
    A2 -->|シグナリング| S
    B2 -->|シグナリング| S
    
    subgraph "メディアサーバー (SFU)"
        M[📡 Selective Forwarding Unit]
        M1[🔄 ストリーム分配]
        M2[📊 品質適応制御]
    end
    
    A2 -.->|大人数通話時| M
    M -.-> B2
    
    style S fill:#f3e5f5
    style M fill:#e8f5e8
    style A2 fill:#e3f2fd
    style B2 fill:#e3f2fd
`;

export const horizontalScalingDiagram: MermaidChart = `
graph TB
    subgraph "ロードバランサー層"
        LB[🔄 ロードバランサー]
    end
    
    subgraph "WebSocketサーバー群"
        LB --> WS1[WebSocketサーバー1]
        LB --> WS2[WebSocketサーバー2]
        LB --> WS3[WebSocketサーバー3]
        LB --> WS4[WebSocketサーバー4]
    end
    
    subgraph "メッセージブローカー"
        WS1 --> MB[📤 Redis Pub/Sub]
        WS2 --> MB
        WS3 --> MB
        WS4 --> MB
    end
    
    subgraph "データストレージ"
        MB --> MQ[メッセージキュー]
        MQ --> DB1[💾 メッセージDB]
        MQ --> DB2[💾 ユーザーDB]
    end
    
    subgraph "キャッシュ層"
        WS1 --> CACHE[⚡ Redisキャッシュ]
        WS2 --> CACHE
        WS3 --> CACHE
        WS4 --> CACHE
    end
    
    style LB fill:#f3e5f5
    style MB fill:#e8f5e8
    style CACHE fill:#fff3e0
`;

// PWA系チャート
export const pwaOfflineOnlineDiagram: MermaidChart = `
sequenceDiagram
    participant UI as PWA UI
    participant SW as Service Worker
    participant WS as WebSocketサーバー
    participant CACHE as キャッシュ
    participant QUEUE as 送信キュー

    Note over UI,QUEUE: オンライン状態
    UI->>WS: WebSocket接続
    WS->>UI: リアルタイムデータ
    UI->>CACHE: データキャッシュ
    
    Note over UI,QUEUE: オフライン移行
    UI->>SW: 接続失敗検知
    SW->>CACHE: キャッシュからデータ取得
    CACHE->>UI: オフラインデータ表示
    UI->>QUEUE: 送信データ蓄積
    
    Note over UI,QUEUE: オンライン復帰
    SW->>WS: 接続復旧
    QUEUE->>WS: 蓄積データ送信
    WS->>UI: 最新データ同期
    SW->>CACHE: キャッシュ更新
`;

// 通知系チャート
export const notificationFlowDiagram: MermaidChart = `
sequenceDiagram
    participant T as イベントトリガー
    participant E as 通知エンジン
    participant D as 配信サーバー
    participant C as クライアント
    participant P as プッシュサービス

    T->>E: イベント発生
    E->>E: ユーザー設定確認
    E->>E: メッセージ生成
    
    alt オンラインユーザー
        E->>D: WebSocket配信
        D->>C: リアルタイム通知
        C-->>D: 受信確認
    else オフラインユーザー
        E->>P: プッシュ通知
        P->>C: デバイス通知
        C-->>P: 受信確認
    end
    
    E->>E: 配信ログ記録
    
    Note over T,P: マルチチャネル配信保証
`;

export const alertEscalationDiagram: MermaidChart = `
sequenceDiagram
    participant M as 監視システム
    participant A as アラートエンジン
    participant T as チーム
    participant E as エスカレーション
    participant L as リーダー

    M->>A: 異常検知
    A->>A: 重要度判定
    
    alt 低重要度
        A->>T: Slack通知
        T-->>A: 確認 (30分以内)
    else 中重要度
        A->>T: WebSocket + プッシュ通知
        T-->>A: 確認 (15分以内)
        
        alt 未対応時
            A->>E: エスカレーション実行
            E->>L: 緊急通知
        end
    else 高重要度
        A->>T: 全チャネル緊急通知
        A->>E: 即座にエスカレーション
        A->>L: リーダー直接通知
    end
    
    Note over M,L: 重要度別対応フロー
`;

export const syncConflictResolutionDiagram: MermaidChart = `
sequenceDiagram
    participant A as クライアントA
    participant B as クライアントB
    participant S as 同期サーバー
    participant R as 競合解決エンジン

    Note over A,R: 同期競合シナリオ
    
    A->>S: データ更新 (v1 -> v2)
    B->>S: データ更新 (v1 -> v3)
    
    S->>R: 競合検知 (v2 vs v3)
    R->>R: 競合解決アルゴリズム実行
    
    alt Last Writer Wins
        R->>S: v3を採用 (最新タイムスタンプ)
        S->>A: v3に更新指示
        S->>B: v3確認
    else Merge Resolution
        R->>S: v2とv3をマージしてv4生成
        S->>A: v4に更新指示
        S->>B: v4に更新指示
    else User Resolution
        R->>A: 競合解決UI表示
        A->>R: ユーザー選択
        R->>S: 選択結果適用
        S->>B: 解決結果配信
    end
    
    Note over A,R: 一貫性復旧完了
`;

// 金融系チャート
export const ultraLowLatencyTradingDiagram: MermaidChart = `
sequenceDiagram
    participant M as 市場データ
    participant P as 価格エンジン
    participant A as アルゴ取引
    participant R as リスクエンジン
    participant O as 注文システム
    participant E as 取引所

    Note over M,E: 目標遅延: 1ms以下
    
    M->>P: 価格更新 (10μs)
    P->>P: 価格計算 (50μs)
    P->>A: シグナル送信 (20μs)
    
    A->>A: 取引判定 (100μs)
    A->>R: リスクチェック (50μs)
    R->>R: ポジション確認 (30μs)
    R->>O: 注文承認 (20μs)
    
    O->>E: 注文送信 (200μs)
    E->>O: 約定通知 (300μs)
    O->>A: 約定確認 (50μs)
    
    Note over M,E: 合計遅延: 830μs
    
    par WebSocket配信
        P->>WebSocket: 価格配信 (並行)
        O->>WebSocket: 約定配信 (並行)
        WebSocket->>Trader: UI更新 (並行)
    end
    
    Note over M,E: ハードウェア最適化・専用回線使用
`;

// 医療系チャート
export const patientMonitoringDiagram: MermaidChart = `
sequenceDiagram
    participant P as 患者
    participant M as 医療機器
    participant G as ゲートウェイ
    participant W as WebSocketサーバー
    participant N as 看護師ステーション
    participant D as 医師

    P->>M: バイタルサイン測定
    M->>G: 生体データ送信 (1秒間隔)
    G->>G: データ検証・正規化
    
    G->>W: リアルタイムデータ配信
    W->>N: 監視画面更新
    
    alt 正常値の場合
        Note over P,D: 通常監視継続
    else 異常値検知
        G->>W: 緊急アラート
        W->>N: 即座通知
        W->>D: 医師呼び出し
        N->>W: アラート確認
        D->>W: 対応指示
        W->>N: 指示配信
    else 重篤な異常
        G->>W: 最高優先度アラート
        W->>N: 緊急通知
        W->>D: 緊急呼び出し
        W->>Emergency: 緊急チーム召集
    end
    
    Note over P,D: 継続的リアルタイム監視
    Note over G,W: 患者安全最優先設計
`;

// セキュリティ系チャート
export const idsIpsThreatResponseDiagram: MermaidChart = `
sequenceDiagram
    participant A as 攻撃者
    participant N as ネットワーク
    participant IDS as IDS/IPSセンサー
    participant WS as WebSocketサーバー
    participant SOC as SOCアナリスト
    participant AUTO as 自動対応システム

    A->>N: 悪意のあるトラフィック
    N->>IDS: パケット監視
    IDS->>IDS: シグネチャ照合・異常検知
    
    alt 既知の攻撃パターン
        IDS->>AUTO: 即座ブロック指示
        AUTO->>N: 自動ファイアウォール更新
        IDS->>WS: 高優先度アラート
        WS->>SOC: リアルタイム通知
    else 未知の異常行動
        IDS->>WS: 中優先度アラート
        WS->>SOC: 分析要求通知
        SOC->>IDS: 詳細調査指示
        IDS->>WS: 調査結果配信
        SOC->>AUTO: 対応策指示
    end
    
    AUTO->>WS: 対応完了通知
    WS->>SOC: 状況更新配信
    
    Note over A,AUTO: リアルタイム脅威対応
    Note over IDS,SOC: 人間とAIの協調防御
`;

export const complianceMonitoringDiagram: MermaidChart = `
sequenceDiagram
    participant S as システム操作
    participant L as ログ収集
    participant C as コンプライアンスエンジン
    participant W as WebSocket配信
    participant A as 監査担当者
    participant R as 規制当局

    S->>L: 操作ログ生成
    L->>C: リアルタイムログ送信
    C->>C: 規制要件チェック
    
    alt SOX法対応
        C->>C: 財務関連操作検証
        C->>W: SOX違反候補検知
        W->>A: 即座アラート配信
    else GDPR対応
        C->>C: 個人データアクセス監視
        C->>W: GDPR違反可能性通知
        W->>A: プライバシー担当者通知
    else PCI DSS対応
        C->>C: カード情報取り扱い監視
        C->>W: PCI違反検知
        W->>A: セキュリティ担当者通知
    end
    
    A->>C: 違反確認・調査
    C->>W: 調査結果配信
    W->>A: 対応状況更新
    
    alt 重大違反の場合
        A->>R: 規制当局への報告
        R->>A: 報告受理確認
    end
    
    Note over S,R: 自動コンプライアンス監視
`;

// シミュレーション系チャート
export const distributedComputingSimulationDiagram: MermaidChart = `
sequenceDiagram
    participant C as クライアント
    participant M as マスターサーバー
    participant W1 as ワーカー1
    participant W2 as ワーカー2
    participant W3 as ワーカー3

    C->>M: シミュレーション開始要求
    M->>M: 計算タスク分割
    
    par 並列計算
        M->>W1: 物理オブジェクト群A
        M->>W2: 物理オブジェクト群B
        M->>W3: 物理オブジェクト群C
    end
    
    par 計算実行
        W1->>W1: 物理演算実行
        W2->>W2: 物理演算実行
        W3->>W3: 物理演算実行
    end
    
    par 結果送信
        W1->>M: 計算結果A
        W2->>M: 計算結果B
        W3->>M: 計算結果C
    end
    
    M->>M: 結果統合・整合性チェック
    M->>C: 統合結果配信
    C->>C: 描画・表示更新
    
    Note over C,W3: 60FPS目標での高速処理
`;

export const molecularDynamicsSimulationDiagram: MermaidChart = `
sequenceDiagram
    participant UI as ユーザーUI
    participant WS as WebSocketサーバー
    participant MD as MD計算エンジン
    participant GPU as GPU並列処理
    participant VIS as 可視化エンジン

    UI->>WS: 分子系パラメータ設定
    WS->>MD: 初期分子配置生成
    MD->>GPU: 力場計算開始
    
    loop 分子動力学ステップ
        GPU->>GPU: 分子間相互作用計算
        GPU->>GPU: 運動方程式積分
        GPU->>MD: 座標・速度更新
        
        alt 可視化フレーム
            MD->>WS: 分子座標データ
            WS->>VIS: リアルタイム描画
            VIS->>UI: 分子構造表示更新
        end
        
        alt 解析フレーム
            MD->>WS: 熱力学量計算
            WS->>UI: 温度・圧力・エネルギー更新
        end
    end
    
    MD->>WS: シミュレーション完了
    WS->>UI: 最終結果・軌跡データ
    
    Note over UI,VIS: 原子レベルの動的挙動観察
`;

export const wasmHighSpeedComputationDiagram: MermaidChart = `
sequenceDiagram
    participant JS as JavaScript
    participant WASM as WebAssembly
    participant MEM as 線形メモリ
    participant WS as WebSocket

    JS->>WASM: 計算パラメータ転送
    WASM->>MEM: メモリ領域確保
    MEM->>WASM: データ配置完了
    
    loop 高速計算ループ
        WASM->>WASM: ネイティブ速度計算
        WASM->>MEM: 中間結果書き込み
        
        alt 進捗報告
            WASM->>JS: 計算進捗通知
            JS->>WS: プログレス配信
        end
    end
    
    WASM->>MEM: 最終結果書き込み
    MEM->>JS: 結果データ取得
    JS->>WS: 計算完了・結果配信
    
    Note over JS,WS: C/C++/Rustレベルの高速計算
    Note over MEM: ゼロコピーデータ転送
`;

// VR・メタバース系チャート
export const vrSpatialPartitioningDiagram: MermaidChart = `
sequenceDiagram
    participant U1 as ユーザー1
    participant U2 as ユーザー2
    participant S1 as サーバー1(区画A)
    participant S2 as サーバー2(区画B)
    participant LB as 負荷分散器
    participant SM as 状態管理

    Note over U1,SM: 空間移動シナリオ
    
    U1->>S1: 位置更新 (区画A内)
    S1->>SM: 状態同期
    S1->>U2: 近接ユーザーに配信
    
    U1->>S1: 区画境界接近
    S1->>LB: 区画移動準備
    LB->>S2: ハンドオーバー準備
    
    U1->>S1: 区画B移動
    S1->>S2: ユーザー状態転送
    S2->>U1: 接続切り替え完了
    S1->>S2: 履歴データ転送
    
    U1->>S2: 新区画での位置更新
    S2->>SM: 状態同期
    S2->>U2: 区画間ユーザー配信
    
    Note over U1,SM: シームレス区画移動完了
    Note over S1,S2: 負荷分散による スケーラビリティ確保
`;

export const nftTradingDiagram: MermaidChart = `
sequenceDiagram
    participant B as 買い手
    participant M as マーケットプレイス
    participant S as スマートコントラクト
    participant E as エスクロー
    participant Se as 売り手
    participant W as WebSocket配信

    B->>M: NFT購入オファー
    M->>S: スマートコントラクト実行
    S->>E: 資金エスクロー
    E->>W: 取引開始通知
    W->>Se: 売り手に通知
    
    Se->>M: オファー受諾
    M->>S: 所有権移転実行
    S->>S: NFT移転確認
    S->>E: 資金リリース指示
    
    E->>Se: 売り手に資金送金
    E->>M: ロイヤリティ分配
    M->>W: 取引完了配信
    
    par リアルタイム更新
        W->>B: 所有権取得通知
        W->>Se: 売却完了通知
        W->>Market: 市場価格更新
    end
    
    Note over B,W: ブロックチェーン透明性
    Note over S,E: スマートコントラクト自動実行
`;
