export class ThemeStore {
  private _theme = $state<'light' | 'dark' | 'system'>('system');
  private _mounted = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      if (stored) {
        this._theme = stored;
      }
      this._mounted = true;
      this.applyTheme();

      // システム設定の変更を監視
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this._theme === 'system') {
          this.applyTheme();
        }
      });
    }
  }

  get theme() {
    return this._theme;
  }

  get isDark() {
    if (!this._mounted) return false;

    if (this._theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return this._theme === 'dark';
  }

  get iconName() {
    if (this._theme === 'system') return 'system';
    return this.isDark ? 'moon' : 'sun';
  }

  toggle() {
    // light -> dark -> system -> light のサイクル
    if (this._theme === 'light') {
      this._theme = 'dark';
    } else if (this._theme === 'dark') {
      this._theme = 'system';
    } else {
      this._theme = 'light';
    }

    localStorage.setItem('theme', this._theme);
    this.applyTheme();
  }

  private applyTheme() {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    if (this.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export const themeStore = new ThemeStore();
