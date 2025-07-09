import { base } from '$app/paths';

/**
 * Creates a properly prefixed href for internal links
 * @param path - The internal path (e.g., '/phase1/introduction')
 * @returns The prefixed path for GitHub Pages deployment
 */
export function href(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    // External links - return as-is
    return path;
  }

  if (path.startsWith('#')) {
    // Hash links - return as-is
    return path;
  }

  // Internal links - add base path
  return `${base}${path}`;
}

/**
 * Creates a properly prefixed src for assets
 * @param assetPath - The asset path (e.g., '/images/logo.png')
 * @returns The prefixed asset path
 */
export function asset(assetPath: string): string {
  if (
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://') ||
    assetPath.startsWith('//')
  ) {
    // External assets - return as-is
    return assetPath;
  }

  // Internal assets - add base path
  return `${base}${assetPath}`;
}
