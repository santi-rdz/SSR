#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const TARGET_DIR = process.cwd();

const command = process.argv[2];

if (command !== 'init') {
  console.log('Usage: mini-ssr init');
  process.exit(1);
}

/**
 * Copia un directorio recursivamente, sin sobreescribir archivos existentes.
 * @param {string} src
 * @param {string} dest
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  + ${path.relative(TARGET_DIR, destPath)}`);
    } else {
      console.log(`  ~ ${path.relative(TARGET_DIR, destPath)} (ya existe, se omite)`);
    }
  }
}

console.log('\nmini-ssr init\n');
copyDir(TEMPLATE_DIR, TARGET_DIR);

// Agregar scripts al package.json si existe
const pkgPath = path.join(TARGET_DIR, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.type = pkg.type || 'module';
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = pkg.scripts.build || 'node --import mini-ssr/loader build.js';
  pkg.scripts.dev = pkg.scripts.dev || 'node --import mini-ssr/loader build.js && node --import mini-ssr/loader --watch server.js';
  pkg.scripts.start = pkg.scripts.start || 'node --import mini-ssr/loader server.js';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('\n  + scripts agregados a package.json');
}

console.log('\nListo. Ejecuta:\n');
console.log('  pnpm build');
console.log('  pnpm start\n');
