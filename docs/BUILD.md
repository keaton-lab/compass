# 构建文档

## 运行模式

Compass 支持三种运行模式:

### 1. Static 模式
适用于静态托管平台(Cloudflare Pages、Vercel、Netlify 等)

```bash
npm run build:static
```

**产物**: `dist/client/`
**特点**:
- 纯静态文件,无需服务器
- 配置文件在构建时嵌入
- `/edit` 仅支持导出 YAML

### 2. Server 模式
适用于 Docker 部署,支持运行时编辑

```bash
npm run build:server
```

**产物**: `dist/client/` + `dist/server/`
**特点**:
- Hono 服务器
- 运行时读取 YAML
- `/edit` 支持登录并保存到服务器
- 必需环境变量: `COMPASS_ADMIN_TOKEN`

### 3. GitHub 模式
支持通过 GitHub App 集成在线编辑并提交到仓库

```bash
npm run build:github
```

**产物**: `dist/client/` + `dist/server/`
**特点**:
- Hono 服务器
- GitHub App OAuth 授权
- 配置提交到指定仓库
- 需要配置 GitHub App 相关环境变量

## 静态部署

### Cloudflare Pages
```bash
# 构建命令
npm run build:static

# 发布目录
dist/client
```

### Vercel
```bash
# 构建命令
npm run build:static

# 发布目录
dist/client
```

### Netlify
```bash
# 构建命令
npm run build:static

# 发布目录
dist/client
```

## Docker 部署

### 构建镜像

```bash
docker build -t compass .
```

### 启动容器 (Server 模式)

```bash
docker run -d \
  -p 3000:3000 \
  -e COMPASS_RUNTIME_MODE=server \
  -e COMPASS_ADMIN_TOKEN=change-me \
  -e COMPASS_SESSION_SECRET=change-me-too \
  -v /path/to/config.yaml:/app/src/config.yaml \
  compass
```

### 使用 Docker Compose

```bash
# 准备配置文件
mkdir -p docker
cp src/config.yaml docker/config.yaml

# 修改 docker-compose.yml 中的口令后启动
docker compose up --build
```

## 环境变量

| 变量 | 说明 | 默认值 | 必需 |
|------|------|--------|------|
| `COMPASS_RUNTIME_MODE` | 运行模式 (static/server/github) | static | 否 |
| `COMPASS_CONFIG_PATH` | 配置文件路径 | src/config.yaml | 否 |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 | - | server 模式必需 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | 随机生成 | 否 |
| `PORT` | 服务端口 | 3000 | 否 |
| `GITHUB_APP_ID` | GitHub App ID | - | github 模式必需 |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App 私钥 | - | github 模式必需 |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | - | github 模式必需 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | - | github 模式必需 |
| `GITHUB_REPO_OWNER` | 目标仓库所有者 | - | github 模式必需 |
| `GITHUB_REPO_NAME` | 目标仓库名称 | - | github 模式必需 |
| `GITHUB_REPO_BRANCH` | 目标分支 | main | 否 |
| `GITHUB_CONFIG_PATH` | 配置文件路径 | src/config.yaml | 否 |

## 常用命令

```bash
npm run build:static   # 静态构建
npm run build:server   # Docker 服务构建
npm run build:github   # GitHub 模式构建
npm run lint           # ESLint 检查
npm run typecheck      # TypeScript 类型检查
```
