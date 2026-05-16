import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { scanClientComponents } from './scanner.js';

/**
 * Genera el codigo de entrada para hidratar un client component en el browser.
 * Busca todos los nodos con data-hydrate="Name" y monta React sobre ellos.
 * @param {import('./scanner.js').ClientComponent} component
 * @returns {string} Codigo JSX del entry point
 */
function generateHydrationEntry({ name, filePath }) {
  const importPath = filePath.replace(/\\/g, '/');
  return `import { hydrateRoot } from 'react-dom/client';
import ${name} from '${importPath}';

document.querySelectorAll('[data-hydrate="${name}"]').forEach(el => {
  const props = JSON.parse(el.dataset.props || '{}');
  hydrateRoot(el, <${name} {...props} />);
});
`;
}

/**
 * Bundlea todos los client components encontrados usando esbuild.
 * Genera un archivo JS por componente en outDir.
 * @param {Object} config
 * @param {string[]} config.componentsDirs - Directorios a escanear
 * @param {string} config.outDir - Directorio de salida (public/js)
 * @param {string} config.tempDir - Directorio temporal para entry points
 */
export async function bundle({ componentsDirs, outDir, tempDir }) {
  const clients = scanClientComponents(componentsDirs);

  if (clients.length === 0) {
    console.log('[bundler] No client components found.');
    return;
  }

  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const entryPoints = clients.map((component) => {
    const entryPath = path.join(tempDir, `${component.name}.jsx`);
    fs.writeFileSync(entryPath, generateHydrationEntry(component));
    return entryPath;
  });

  await esbuild.build({
    entryPoints,
    bundle: true,
    outdir: outDir,
    format: 'esm',
    jsx: 'automatic',
    minify: process.env.NODE_ENV === 'production',
    splitting: true,
  });

  fs.rmSync(tempDir, { recursive: true, force: true });

  const names = clients.map((c) => c.name).join(', ');
  console.log(`[bundler] ${clients.length} client component(s): ${names}`);
}
