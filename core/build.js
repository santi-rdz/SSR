import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { bundle } from './bundler.js';

/**
 * Ejecuta el build completo: bundlea client components y compila Tailwind.
 * @param {string} root - Directorio raiz del proyecto
 */
export async function build(root) {
  const config = {
    componentsDirs: [
      path.join(root, 'src/components'),
      path.join(root, 'src/pages'),
    ],
    outDir: path.join(root, 'public/js'),
    tempDir: path.join(root, '.tmp-entries'),
    cssInput: path.join(root, 'src/input.css'),
    cssOutput: path.join(root, 'public/css/styles.css'),
  };

  console.log('[build] Starting...\n');

  fs.mkdirSync(path.dirname(config.cssOutput), { recursive: true });

  await bundle(config);

  console.log('[build] Compiling Tailwind CSS...');
  execSync(`npx @tailwindcss/cli -i ${config.cssInput} -o ${config.cssOutput}`, {
    stdio: 'inherit',
    cwd: root,
  });

  console.log('\n[build] Done.');
}
