// Svelte action for syntax highlighting
import { highlightElement } from '$lib/utils/prism';

interface HighlightOptions {
	language?: string;
	autoHighlight?: boolean;
}

/**
 * Svelte action to highlight code blocks
 * @param node - The element to apply highlighting to
 * @param options - Configuration options
 */
export function highlight(node: HTMLElement, options: HighlightOptions = {}) {
	const { language = 'javascript', autoHighlight = true } = options;

	function doHighlight() {
		// Add language class if not present
		if (language && !node.classList.contains(`language-${language}`)) {
			node.classList.add(`language-${language}`);
		}

		// Highlight the element
		highlightElement(node);
	}

	// Highlight immediately if autoHighlight is true
	if (autoHighlight) {
		// Small delay to ensure DOM is ready
		setTimeout(doHighlight, 10);
	}

	return {
		update(newOptions: HighlightOptions) {
			Object.assign(options, newOptions);
			if (options.autoHighlight) {
				doHighlight();
			}
		},
		destroy() {
			// Cleanup if needed
		}
	};
}
