# 构建文档

## 运行模式

Compass 现在只有两种运行模式：

### 1. `static`

```bash
npm run build:static
```

- 输出目录：`dist/client/`
- 生成 `dist/client/index.html` 和 `dist/client/edit/index.html`
- 首页在构建期读取 `public/config.yaml` 并生成完整 HTML
- `/edit` 仍可本地编辑和导出 YAML，但不会直接写回服务器

### 2. `server`

```bash
npm run build:server
```

- 输出目录：`dist/client/` + `dist/server/`
- 运行入口：`dist/server/entry.mjs`
- `/` 在运行时读取 YAML 并 SSR
- `/edit` 是独立客户端页面
- 登录保存和 GitHub 发布都属于 `server` 模式下的可选能力

## 静态部署

适用于 Cloudflare Pages、Vercel、Netlify 和任意静态托管：

```bash
npm run build:static
```

发布目录：

```text
dist/client
```

## Server 部署

### 本地运行构建产物

```bash
npm run build:server
node dist/server/entry.mjs
```

### Docker 示例

```bash
docker build -t compass .

docker run -d \
  -p 3000:3000 \
  -e COMPASS_RUNTIME_MODE=server \
  -e COMPASS_ADMIN_TOKEN=change-me \
  -e COMPASS_SESSION_SECRET=change-me-too \
  -v /path/to/config.yaml:/app/public/config.yaml \
  compass
```

## 环境变量

| 变量 | 说明 | 默认值 | 必需 |
|------|------|--------|------|
| `COMPASS_RUNTIME_MODE` | 运行模式（`static` / `server`） | 自动推断 | 否 |
| `COMPASS_CONFIG_PATH` | 运行时配置文件路径 | `public/config.yaml` | 否 |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 | - | 仅开启保存能力时需要 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | 随机生成 | 否 |
| `PORT` | 服务端口 | `3000` | 否 |
| `APP_BASE_URL` | GitHub OAuth 回调基准地址 | 请求地址推断 | 否 |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | - | 仅开启 GitHub 发布时需要 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | - | 仅开启 GitHub 发布时需要 |
| `GITHUB_REPO_OWNER` | 目标仓库所有者 | - | 仅开启 GitHub 发布时需要 |
| `GITHUB_REPO_NAME` | 目标仓库名称 | - | 仅开启 GitHub 发布时需要 |
| `GITHUB_REPO_BRANCH` | 目标分支 | `main` | 否 |
| `GITHUB_CONFIG_PATH` | 仓库内配置路径 | `public/config.yaml` | 否 |

## 常用命令

```bash
npm run build:static
npm run build:server
npm run typecheck
npm run lint
```
