/**
 * Custom ESM loader hook para Node.js.
 * Intercepta imports de archivos .jsx/.tsx y los transpila con esbuild
 * para que Node pueda ejecutarlos directamente.
 *
 * Se registra via core/register-loader.js usando node:module register().
 * @see https://nodejs.org/api/module.html#customization-hooks
 */

import { transformSync } from 'esbuild';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const jsxExtensions = ['.jsx', '.tsx'];

/**
 * Hook de carga de modulos. Transpila .jsx/.tsx a JS usando esbuild.
 * @param {string} url - URL del modulo (file://, node:, etc.)
 * @param {Object} context - Contexto del loader
 * @param {Function} nextLoad - Siguiente loader en la cadena
 * @returns {Object} Modulo transformado o delegado al siguiente loader
 */
export function load(url, context, nextLoad) {
  if (!url.startsWith('file://')) {
    return nextLoad(url, context);
  }

  const filePath = fileURLToPath(url);
  const ext = filePath.slice(filePath.lastIndexOf('.'));

  if (jsxExtensions.includes(ext)) {
    const source = readFileSync(filePath, 'utf-8');
    const { code } = transformSync(source, {
      loader: ext === '.tsx' ? 'tsx' : 'jsx',
      jsx: 'automatic',
      format: 'esm',
      target: 'node18',
    });
    return { format: 'module', source: code, shortCircuit: true };
  }

  return nextLoad(url, context);
}
