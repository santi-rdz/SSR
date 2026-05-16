#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const TARGET_DIR = process.cwd();
const command = process.argv[2];

if (command === 'init') {
  init();
} else if (command === 'build') {
  runBuild();
} else {
  console.log('Usage: mini-ssr <init|build>');
  process.exit(1);
}

// ── Build ──────────────────────────────────────────

async function runBuild() {
  const { build } = await import('../core/build.js');
  await build(TARGET_DIR);
}

// ── Init ───────────────────────────────────────────

const PEER_DEPS = ['express', 'esbuild', 'tailwindcss', '@tailwindcss/cli'];

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y') || answer.toLowerCase().startsWith('s'));
    });
  });
}

function detectPM() {
  if (fs.existsSync(path.join(TARGET_DIR, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(TARGET_DIR, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

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
      console.log(`  ~ ${path.relative(TARGET_DIR, destPath)} (ya existe)`);
    }
  }
}

async function init() {
  console.log('\nmini-ssr init\n');

  copyDir(TEMPLATE_DIR, TARGET_DIR);

  const pkgPath = path.join(TARGET_DIR, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.type = pkg.type || 'module';
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.build = pkg.scripts.build || 'mini-ssr build';
    pkg.scripts.dev = pkg.scripts.dev || 'mini-ssr build && node --import mini-ssr/loader --watch server.js';
    pkg.scripts.start = pkg.scripts.start || 'node --import mini-ssr/loader server.js';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('\n  + scripts agregados a package.json');
  }

  const shouldInstall = await ask(`\nInstalar dependencias? (${PEER_DEPS.join(', ')}) [s/n] `);

  if (shouldInstall) {
    const pm = detectPM();
    const cmd = `${pm} add ${PEER_DEPS.join(' ')}`;
    console.log(`\n  > ${cmd}\n`);
    execSync(cmd, { stdio: 'inherit', cwd: TARGET_DIR });
  }

  console.log('\nListo. Ejecuta:\n');
  console.log('  pnpm build');
  console.log('  pnpm start\n');
}
