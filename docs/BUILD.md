# 构建与部署

## 构建目标

Compass 有两种正式构建产物：

| 命令 | 目标 | 产物 | 适用场景 |
|------|------|------|----------|
| `npm run build` | `static` | `out/` | Cloudflare Pages、Netlify、任意静态托管 |
| `npm run build:static` | `static` | `out/` | 与 `npm run build` 等价 |
| `npm run build:server` | `server` | `.next/standalone` | Docker / Node 服务部署 |

`COMPASS_BUILD_TARGET` 一般由 npm scripts 自动注入，通常不需要手动设置。

## 静态导出

```bash
npm run build
```

构建完成后：

- 静态文件输出到 `out/`
- 首页与 `/edit` 会一起导出
- `/edit` 仅提供编辑和导出 YAML，不提供服务端保存

可本地验证静态产物：

```bash
npx serve out
```

静态构建时，脚本会临时移走 `src/app/api`，避免 Next.js 静态导出与 API Route 冲突；构建结束后会自动恢复。

## Server 构建

```bash
npm run build:server
```

这个命令生成 Next.js `standalone` 产物，供 Docker 镜像使用。它不是给本地 `npm start` 准备的传统启动流程。

在 `server` 模式下：

- 页面会按请求读取 YAML
- `/edit` 可在登录后直接保存到运行时配置文件
- 需要 `COMPASS_ADMIN_TOKEN` 才能启用在线保存与登录

## Docker 部署

### 构建镜像

```bash
docker build -t compass .
```

### 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e COMPASS_ADMIN_TOKEN=change-me \
  -e COMPASS_SESSION_SECRET=change-me-too \
  -v /path/to/config.yaml:/app/public/config.yaml \
  compass
```

说明：

- 容器内默认配置路径是 `/app/public/config.yaml`
- 如需改为其他路径，可显式设置 `COMPASS_CONFIG_PATH`
- 生产环境建议始终设置固定的 `COMPASS_SESSION_SECRET`

### Docker Compose

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
docker compose up --build
```

默认 `docker-compose.yml` 会把宿主机的 `./docker/config.yaml` 挂载到容器内的 `/app/public/config.yaml`。

## 环境变量

| 变量 | 说明 | 是否必需 |
|------|------|----------|
| `COMPASS_CONFIG_PATH` | 自定义配置文件路径 | 否 |
| `COMPASS_ADMIN_TOKEN` | `/edit` 登录口令；server 模式启用保存时必需 | server 保存场景必需 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | 否，但生产环境强烈建议设置 |
| `PORT` | Node 服务监听端口 | 否 |

## 部署提示

- 静态部署平台使用 `out/` 作为发布目录
- `server` 模式更适合 Docker 挂载 YAML 持久化配置
- 配置修改后是否即时生效，取决于部署模式：静态模式需要重新构建，server 模式刷新页面即可读取最新 YAML
