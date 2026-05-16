import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { bundle } from 'mini-ssr';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const config = {
  componentsDirs: [
    path.join(ROOT, 'src/components'),
    path.join(ROOT, 'src/pages'),
  ],
  outDir: path.join(ROOT, 'public/js'),
  tempDir: path.join(ROOT, '.tmp-entries'),
  cssInput: path.join(ROOT, 'src/input.css'),
  cssOutput: path.join(ROOT, 'public/css/styles.css'),
};

async function build() {
  console.log('[build] Starting...\n');

  fs.mkdirSync(path.dirname(config.cssOutput), { recursive: true });

  await bundle(config);

  console.log('[build] Compiling Tailwind CSS...');
  execSync(`npx @tailwindcss/cli -i ${config.cssInput} -o ${config.cssOutput}`, {
    stdio: 'inherit',
  });

  console.log('\n[build] Done.');
}

build().catch((err) => {
  console.error('[build] Error:', err);
  process.exit(1);
});
