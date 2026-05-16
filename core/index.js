/**
 * mini-ssr — API publica del framework.
 *
 * @example
 * import { configure, renderPage, bundle } from 'mini-ssr';
 *
 * configure({ layout: RootLayout, componentsDirs: ['src/components'] });
 * const html = renderPage(Page, props, { title: 'Home' });
 */
export { renderPage, configure } from './renderer.jsx';
export { bundle } from './bundler.js';
export { scanClientComponents } from './scanner.js';
