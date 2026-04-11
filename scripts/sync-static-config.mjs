#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 加载 .env.local 环境变量
config({ path: join(rootDir, '.env.local') });

// 获取配置文件路径（支持 COMPASS_CONFIG_PATH 环境变量）
const configPathEnv = process.env.COMPASS_CONFIG_PATH;
const DEFAULT_CONFIG_PATH = join(rootDir, 'public', 'config.yaml');

// 解析配置文件路径
const configPath = configPathEnv
  ? (configPathEnv.startsWith('/') ? configPathEnv : resolve(rootDir, configPathEnv))
  : DEFAULT_CONFIG_PATH;

// 如果配置文件不存在，抛出错误
if (!existsSync(configPath)) {
  console.error(`❌ 未找到配置文件：${configPath}`);
  console.error(`   请创建该文件，或设置 COMPASS_CONFIG_PATH 环境变量指向现有配置文件`);
  process.exit(1);
}

// 确保配置文件的目录存在（对于相对路径）
const configDir = dirname(configPath);
if (!existsSync(configDir)) {
  mkdirSync(configDir, { recursive: true });
}

console.log(`✅ 配置文件已就绪：${configPath}`);