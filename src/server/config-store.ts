import fs from 'fs';
import type { Config } from '@/shared/types';
import { parseConfigYaml, serializeConfig } from '@/shared/config-yaml';
import { resolveConfigPath } from './env';

/**
 * 读取配置文件源码
 */
export function readConfigSource() {
  const configPath = resolveConfigPath();

  if (!fs.existsSync(configPath)) {
    throw new Error(`配置文件不存在：${configPath}`);
  }

  return {
    configPath,
    fileContents: fs.readFileSync(configPath, 'utf8'),
  };
}

/**
 * 加载配置文件
 */
export function loadConfigFile(): Config {
  const { fileContents } = readConfigSource();
  return parseConfigYaml(fileContents);
}

/**
 * 保存配置到 YAML 文件
 */
export function saveConfigYaml(config: Config): Config {
  const configPath = resolveConfigPath();
  const directoryPath = path.dirname(configPath);

  // 确保目录存在
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // 序列化并保存
  const yamlContent = serializeConfig(config);
  fs.writeFileSync(configPath, yamlContent, 'utf8');

  return config;
}

import path from 'path';

/**
 * 获取配置文件路径
 */
export function getConfigPath(): string {
  return resolveConfigPath();
}
