// src/lib/types/mermaid.ts

// より正確なMermaid型定義
export interface MermaidSequenceConfig {
	actorBorder?: string;
	actorTextColor?: string;
	actorLineColor?: string;
	signalColor?: string;
	signalTextColor?: string;
	labelBoxBkgColor?: string;
	labelBoxBorderColor?: string;
	labelTextColor?: string;
	loopTextColor?: string;
	noteBorderColor?: string;
	noteBkgColor?: string;
	noteTextColor?: string;
	[key: string]: unknown;
}

export interface MermaidFlowchartConfig {
	useMaxWidth?: boolean;
	htmlLabels?: boolean;
	[key: string]: unknown;
}

export interface MermaidThemeVariables {
	darkMode?: boolean;
	background?: string;
	primaryColor?: string;
	primaryTextColor?: string;
	primaryBorderColor?: string;
	lineColor?: string;
	secondaryColor?: string;
	tertiaryColor?: string;
	mainBkg?: string;
	secondBkg?: string;
	tertiaryBkg?: string;
	[key: string]: unknown;
}

// Mermaidライブラリの実際の型に近い定義
export interface MermaidInitializeConfig {
	startOnLoad?: boolean;
	theme?: 'default' | 'dark' | 'forest' | 'neutral' | string;
	themeVariables?: MermaidThemeVariables;
	flowchart?: MermaidFlowchartConfig;
	sequence?: MermaidSequenceConfig;
	// 他の設定項目（必要に応じて拡張）
	logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
	securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
	maxTextSize?: number;
	fontFamily?: string;
	fontSize?: number;
	[key: string]: unknown;
}

// 後方互換性のためのエイリアス
export type MermaidConfig = MermaidInitializeConfig;
