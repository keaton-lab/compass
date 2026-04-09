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

## Server 模式

```bash
npm run build:server
npm start
```

页面按请求读取 YAML，修改挂载配置文件后刷新即可看到新内容。`/edit` 登录后可直保存到运行时配置文件。

## Docker 部署

### 构建镜像

```bash
docker build -t compass .
```

### 启动容器

```bash
docker run -d \
  -p 3000:3000 \
  -e COMPASS_CONFIG_PATH=/data/config.yml \
  -e COMPASS_ADMIN_TOKEN=change-me \
  -e COMPASS_SESSION_SECRET=change-me-too \
  -v /path/to/config.yml:/data/config.yml \
  compass
```

### 使用 Docker Compose

```bash
mkdir -p docker
cp src/config.yaml docker/config.yml
docker compose up --build
```

修改 `docker-compose.yml` 中的口令后启动。

## 构建目标

通过 `COMPASS_BUILD_TARGET` 环境变量指定：
- `static` - 静态导出
- `server` - Node 服务

通常由 npm script 自动设置，一般无需手动指定。

## 静态导出原理

静态导出构建时，构建脚本会临时排除 `src/app/api`，这样既保留了 server 模式的原生 API，又不会破坏 `next export`。

## 常用命令

```bash
npm run build:static   # 静态导出
npm run build:server    # Server 模式构建
npm start              # 运行 server 模式
npm run lint           # ESLint 检查
```
