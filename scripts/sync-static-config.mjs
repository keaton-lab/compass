#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 确保 public 目录存在
const publicDir = join(rootDir, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// 复制 config.yaml 到 public/
const srcPath = join(rootDir, 'src', 'config.yaml');
const destPath = join(publicDir, 'config.yaml');

if (existsSync(srcPath)) {
  copyFileSync(srcPath, destPath);
  console.log('✅ 已复制 src/config.yaml 到 public/config.yaml');
} else {
  console.error('❌ 未找到 src/config.yaml');
  process.exit(1);
}
