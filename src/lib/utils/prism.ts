// Prism.js configuration and initialization
import Prism from 'prismjs';

// Import language definitions
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';

// Manual highlighting configuration
Prism.manual = true;

/**
 * Highlight all code blocks on the page
 */
export function highlightAll(): void {
	if (typeof window !== 'undefined') {
		Prism.highlightAll();
	}
}

/**
 * Highlight a specific code element
 * @param element - The code element to highlight
 */
export function highlightElement(element: HTMLElement): void {
	if (typeof window !== 'undefined' && element) {
		Prism.highlightElement(element);
	}
}

/**
 * Highlight code string
 * @param code - Code string to highlight
 * @param language - Language for highlighting
 * @returns Highlighted HTML
 */
export function highlight(code: string, language: string = 'javascript'): string {
	if (typeof window !== 'undefined') {
		return Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);
	}
	return code;
}

export default Prism;
