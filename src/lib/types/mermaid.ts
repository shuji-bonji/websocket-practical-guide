export interface MermaidConfig {
  startOnLoad?: boolean;
  theme?: string;
  themeVariables?: Record<string, unknown>;
  flowchart?: Record<string, unknown>;
  sequence?: Record<string, unknown>;
  [key: string]: unknown;
}
