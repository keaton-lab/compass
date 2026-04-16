# 构建与部署

## 构建目标

Compass 有两种正式构建产物：

| 命令 | 目标 | 产物 | 适用场景 |
|------|------|------|----------|
| `npm run build` | `static` | `out/` | Vercel、Cloudflare Pages、Netlify、任意静态托管 |
| `npm run build:static` | `static` | `out/` | 与 `npm run build` 等价 |
| `npm run build:server` | `server` | `.next/standalone` | Docker / Node 服务部署 |

`COMPASS_BUILD_TARGET` 一般由 npm scripts 自动注入，通常不需要手动设置。

## Static 构建

```bash
npm run build
```

构建完成后：

- 静态文件输出到 `out/`
- 首页与 `/edit` 会一起导出
- `/edit` 仅提供编辑和导出 YAML，不提供服务端保存
- 配置是在构建时读取的，后续修改 `public/config.yaml` 需要重新构建并重新部署

可本地验证静态产物：

```bash
npx serve out
```

构建脚本还会自动：

- 运行 `scripts/generate-static-brand-icons.mjs` 生成 footer 所需的品牌图标映射
- 在静态导出时临时移走 `src/app/api/`，避免 Next.js `output: export` 与 API routes 冲突

## Server 构建

```bash
npm run build:server
```

这个命令生成 Next.js `standalone` 产物，供 Docker 镜像或自托管 Node 服务使用。它不是给传统 `npm start` 流程准备的产物。

在 `server` 模式下：

- 页面会按请求读取 YAML
- `/edit` 可在登录后直接保存到运行时配置文件
- 启动时必须设置 `COMPASS_ADMIN_TOKEN`，否则服务会直接启动失败
- 生产环境强烈建议显式设置 `COMPASS_SESSION_SECRET`

## Docker 部署

### Docker

1. 准备要持久化的配置文件：

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
```

2. 构建镜像：

```bash
docker build -t compass .
```

3. 运行容器：

```bash
docker run -d \
  --name compass \
  -p 3000:3000 \
  -e COMPASS_ADMIN_TOKEN=replace-with-a-strong-token \
  -e COMPASS_SESSION_SECRET=replace-with-a-long-random-secret \
  -v "$(pwd)/docker/config.yaml:/app/public/config.yaml" \
  compass
```

说明：

- 容器内默认配置路径是 `/app/public/config.yaml`
- `COMPASS_ADMIN_TOKEN` 未设置时，容器会直接退出
- 挂载进去的 YAML 文件必须可写，否则 `/edit` 保存会失败
- 如需改用其他挂载路径，请同时设置 `COMPASS_CONFIG_PATH`
- `server` 模式按请求读取配置；修改挂载文件或在 `/edit` 保存后，刷新页面即可看到最新内容

### Docker Compose

1. 初始化配置文件：

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
```

2. 编辑 `docker-compose.yml`，把示例里的 `COMPASS_ADMIN_TOKEN` 和 `COMPASS_SESSION_SECRET` 改成真实值。

3. 启动：

```bash
docker compose up --build -d
```

默认 `docker-compose.yml` 会把宿主机的 `./docker/config.yaml` 挂载到容器内的 `/app/public/config.yaml`。

## Vercel 部署

Vercel 适合静态模式部署，构建产物是 `out/`。

1. 把仓库推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 控制台点击 `Add New -> Project`，导入这个仓库，或直接使用 README 里的 Deploy Button。
3. 保持 `Framework Preset = Next.js`。Vercel 会自动读取 `package.json` 里的 `build` 脚本，也就是 `npm run build`。
4. 如果你手动覆盖构建配置，请使用 `Build Command = npm run build`，`Output Directory = out`。
5. 点击 Deploy。

说明：

- 不要把构建命令改成 `next build` 或 `npx next build`；本项目依赖 `scripts/build.mjs` 先生成品牌图标并处理静态导出前的 API route 隐藏
- 静态部署通常不需要设置 `COMPASS_ADMIN_TOKEN`、`COMPASS_SESSION_SECRET`
- 部署完成后，`/edit` 仍可编辑和导出 YAML，但不能直接保存回服务器
- 修改站点内容时，请更新仓库里的 `public/config.yaml` 并重新部署

## Cloudflare Pages 部署

Cloudflare Pages 同样使用静态模式部署。

### Git 集成

1. 把仓库推送到 GitHub 或 GitLab。
2. 在 Cloudflare 控制台进入 `Workers & Pages -> Create application -> Pages -> Connect to Git`。
3. 选择仓库并进入构建配置页面。
4. 使用以下构建配置：

| 设置项 | 值 |
|--------|----|
| `Framework preset` | `Next.js (Static HTML Export)` 或 `None` |
| `Build command` | `npm run build` |
| `Build output directory` | `out` |
| `Root directory` | 留空，使用仓库根目录 |

5. 点击 Save and Deploy。

说明：

- 不要直接沿用平台默认的 `npx next build`；本项目必须使用 `npm run build`
- 仓库内的 `wrangler.toml` 已把 `pages_build_output_dir` 设为 `out`
- Cloudflare Pages 部署完成后，`/edit` 只能编辑和导出 YAML，不能在线保存
- 修改内容时，请更新仓库里的 `public/config.yaml` 并重新部署

### Wrangler 直传

如果你不想接 Git 集成，也可以先本地构建再上传 `out/`：

```bash
npm install
npm run build
npx wrangler login
npx wrangler pages deploy out --project-name <your-project-name>
```

首次部署时，如项目不存在，可先在 Cloudflare 控制台创建 Pages 项目，或按 Wrangler 提示完成初始化。

## 环境变量

| 变量 | 说明 | 何时需要 |
|------|------|----------|
| `COMPASS_CONFIG_PATH` | 自定义配置文件路径 | 可选，主要用于 `server` 模式 |
| `COMPASS_ADMIN_TOKEN` | `server` 模式启动必需的编辑器登录口令 | `server` 模式必需 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | `server` 模式生产环境强烈建议设置 |
| `PORT` | Node 服务监听端口 | 自托管 Node / Docker 场景可选 |

## 部署提示

- 静态部署平台使用 `out/` 作为发布目录
- `server` 模式更适合 Docker 挂载 YAML 持久化配置
- 静态模式改配置需要重新部署；`server` 模式下刷新页面即可读取最新 YAML
