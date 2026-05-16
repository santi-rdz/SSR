#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const TARGET_DIR = process.cwd();
const PEER_DEPS = ['react', 'react-dom', 'express', 'esbuild', 'tailwindcss', '@tailwindcss/cli'];

const command = process.argv[2];

if (command === 'init') {
  init();
} else if (command === 'build') {
  runBuild();
} else if (command === 'dev') {
  runDev();
} else {
  console.log('Usage: mini-ssr <init|build|dev>');
  process.exit(1);
}

// ── Build ──────────────────────────────────────────

async function runBuild() {
  const { build } = await import('../core/build.js');
  await build(TARGET_DIR);
}

// ── Dev ────────────────────────────────────────────

async function runDev() {
  await runBuild();

  const loaderPath = path.join(__dirname, '..', 'core', 'register-loader.js');
  const serverPath = path.join(TARGET_DIR, 'server.js');

  let serverProcess = null;

  function startServer() {
    if (serverProcess) serverProcess.kill();
    serverProcess = spawn('node', ['--import', loaderPath, serverPath], {
      stdio: 'inherit',
      cwd: TARGET_DIR,
    });
  }

  startServer();

  const srcDir = path.join(TARGET_DIR, 'src');
  fs.watch(srcDir, { recursive: true }, async (event, filename) => {
    if (!filename) return;
    console.log(`\n[dev] ${filename} changed, rebuilding...`);
    try {
      await runBuild();
      startServer();
    } catch (err) {
      console.error('[dev] Build error:', err.message);
    }
  });

  process.on('SIGINT', () => {
    if (serverProcess) serverProcess.kill();
    process.exit(0);
  });
}

// ── Init ───────────────────────────────────────────

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
    pkg.scripts.dev = pkg.scripts.dev || 'mini-ssr dev';
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
  console.log('  pnpm dev\n');
}
