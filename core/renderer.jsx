import React from 'react';
import { renderToString } from 'react-dom/server';
import { scanClientComponents } from './scanner.js';

/** @type {React.ComponentType | null} */
let Layout = null;

/** @type {string[]} */
let scanDirs = [];

/**
 * Configura el renderer con el layout y los directorios de componentes.
 * Debe llamarse antes de renderPage().
 * @param {Object} config
 * @param {React.ComponentType} config.layout - Componente layout raiz
 * @param {string[]} config.componentsDirs - Directorios donde buscar client components
 */
export function configure({ layout, componentsDirs }) {
  Layout = layout;
  scanDirs = componentsDirs;
}

/**
 * Renderiza una pagina React a HTML completo, inyectando los scripts
 * de hidratacion solo para los client components detectados.
 * @param {React.ComponentType} Page - Componente de pagina
 * @param {Object} [props={}] - Props para el componente
 * @param {Object} [options={}]
 * @param {string} [options.title] - Titulo del documento HTML
 * @returns {string} HTML completo con DOCTYPE
 */
export function renderPage(Page, props = {}, options = {}) {
  const { title } = options;
  const pageHtml = renderToString(React.createElement(Page, props));

  const clients = scanClientComponents(scanDirs);
  const scripts = clients
    .filter(({ name }) => pageHtml.includes(`data-hydrate="${name}"`))
    .map(({ name }) => `/js/${name}.js`);

  const shell = React.createElement(
    Layout,
    { title, clientScripts: scripts },
    React.createElement('div', { dangerouslySetInnerHTML: { __html: pageHtml } }),
  );

  return '<!DOCTYPE html>' + renderToString(shell);
}
