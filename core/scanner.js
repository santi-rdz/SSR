import fs from 'fs';
import path from 'path';

const JSX_EXTENSIONS = new Set(['.jsx', '.js', '.tsx']);
const USE_CLIENT = /^['"]use client['"];?\s*$/;

/**
 * @typedef {Object} ClientComponent
 * @property {string} name - Nombre del componente (sin extension)
 * @property {string} filePath - Ruta absoluta al archivo
 */

/**
 * Escanea directorios en busca de componentes con la directiva 'use client'.
 * @param {string[]} dirs - Directorios a escanear
 * @returns {ClientComponent[]}
 */
export function scanClientComponents(dirs) {
  const clients = [];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir, { recursive: true })) {
      const ext = path.extname(file);
      if (!JSX_EXTENSIONS.has(ext)) continue;

      const filePath = path.join(dir, file);
      const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0].trim();

      if (USE_CLIENT.test(firstLine)) {
        clients.push({
          name: path.basename(file, ext),
          filePath,
        });
      }
    }
  }

  return clients;
}
