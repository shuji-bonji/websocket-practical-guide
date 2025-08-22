interface Window {
  __mermaidInitPromise?: Promise<{
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, chart: string) => Promise<{ svg: string }>;
  }>;
}
