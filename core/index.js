/**
 * mini-ssr — API publica del framework.
 *
 * @example
 * import { configure, renderPage } from 'mini-ssr';
 *
 * configure({ layout: RootLayout, componentsDirs: ['src/components'] });
 * const html = renderPage(Page, props, { title: 'Home' });
 */
export { renderPage, configure } from './renderer.jsx';
export { bundle } from './bundler.js';
export { build } from './build.js';
export { scanClientComponents } from './scanner.js';
