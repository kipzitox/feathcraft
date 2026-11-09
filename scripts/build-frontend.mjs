import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist-tauri');

// Clean previous output
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// frontend/desktop.html already uses relative paths
const html = readFileSync(join(root, 'frontend', 'desktop.html'), 'utf8');
writeFileSync(join(dist, 'index.html'), html, 'utf8');

// Copy shell assets
cpSync(join(root, 'frontend', 'desktop.css'), join(dist, 'desktop.css'));
cpSync(join(root, 'frontend', 'desktop.js'), join(dist, 'desktop.js'));
cpSync(join(root, 'frontend', 'reskin.js'), join(dist, 'reskin.js'));

// Copy engine (single source of truth: assets/engine)
cpSync(join(root, 'assets', 'engine'), join(dist, 'engine'), { recursive: true });

console.log('Built dist-tauri:', dist);

// Also sync Tauri Android icons (gen/android uses Tauri default otherwise)
const iconSrc = join(root, 'src-tauri', 'icons', 'android');
const iconDst = join(root, 'src-tauri', 'gen', 'android', 'app', 'src', 'main', 'res');
if (existsSync(iconSrc) && existsSync(iconDst)) {
  cpSync(iconSrc, iconDst, { recursive: true, force: true });
  console.log('Synced Android icons');
}

// Patch MainActivity.kt for immersive mode (hide status/nav bars)
const patchScript = join(root, 'scripts', 'patch-android.mjs');
if (existsSync(patchScript)) {
  // run via child process to keep this module sync
  const { execFileSync } = await import('node:child_process');
  try { execFileSync(process.execPath, [patchScript], { stdio: 'inherit' }); } catch (e) { console.warn('patch-android failed:', e.message); }
}
