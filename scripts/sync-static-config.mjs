#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 确保 public 目录存在
const publicDir = join(rootDir, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// 验证 public/config.yaml 存在
const configPath = join(publicDir, 'config.yaml');
if (!existsSync(configPath)) {
  console.error('❌ 未找到 public/config.yaml，请先创建配置文件');
  process.exit(1);
}

console.log('✅ public/config.yaml 已就绪');