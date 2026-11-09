import { cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src-tauri', 'icons', 'android');
const dst = join(root, 'src-tauri', 'gen', 'android', 'app', 'src', 'main', 'res');

if (!existsSync(src)) { console.error('icons/android not found; run tauri icon first'); process.exit(1); }
if (!existsSync(dst)) { console.error('gen/android not found; run tauri android init first'); process.exit(1); }
cpSync(src, dst, { recursive: true, force: true });
console.log('Copied', src, '->', dst);
