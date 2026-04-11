# 构建文档

## 静态导出

```bash
npm run build
# 或
npm run build:static
```

产物输出到 `out/` 目录。

适合 Cloudflare Pages、Netlify 等静态托管。

静态模式下首页和 `/edit` 都会预渲染，但 `/edit` 只负责编辑和导出 YAML，不提供后台保存接口。

## Docker Server 构建

```bash
npm run build:server
```

这个命令只负责生成 Docker 镜像所需的 `standalone` 产物，不提供本地 `npm start` 启动。

页面按请求读取 YAML，修改挂载配置文件后刷新即可看到新内容。`/edit` 登录后可直保存到运行时配置文件。项目规范统一使用 `.yaml` 后缀。

默认配置路径统一为 `public/config.yaml`。在 Docker 容器内对应绝对路径 `/app/public/config.yaml`，开发和运行阶段保持一致；只有在你明确设置 `COMPASS_CONFIG_PATH` 时才会覆盖这个默认值。

注意：server 模式必须提供 `COMPASS_ADMIN_TOKEN`，否则进程不会启动。`COMPASS_SESSION_SECRET` 可选，未设置时会自动生成临时值。

## Docker 部署

### 构建镜像

```bash
docker build -t compass .
```

### 启动容器

生产环境建议显式设置 `COMPASS_SESSION_SECRET`，否则重启后现有登录会话会失效。

```bash
docker run -d \
  -p 3000:3000 \
  -e COMPASS_ADMIN_TOKEN=change-me \
  -e COMPASS_SESSION_SECRET=change-me-too \
  -v /path/to/config.yaml:/app/public/config.yaml \
  compass
```

### 使用 Docker Compose

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
docker compose up --build
```

修改 `docker-compose.yml` 中的口令后启动。Compose 默认也会把宿主机的 `./docker/config.yaml` 挂载到容器内的 `/app/public/config.yaml`。

## 构建目标

通过 `COMPASS_BUILD_TARGET` 环境变量指定：
- `static` - 静态导出
- `server` - Docker 用 Node 服务产物

通常由 npm script 自动设置，一般无需手动指定。

## 静态导出原理

静态导出构建时，构建脚本会临时排除 `src/app/api`，这样既保留了 server 模式的原生 API，又不会破坏 `next export`。

## 常用命令

```bash
npm run build:static   # 静态导出
npm run build:server   # Docker 服务构建
npm run lint           # ESLint 检查
```
