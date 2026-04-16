<p align="center">
  <h1 align="center">Compass</h1>
  <p align="center">一个由 YAML 配置驱动的个人导航页，支持静态部署与 Docker 运行时读写，没有数据库</p>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss" alt="Tailwind CSS"></a>
  <a href="https://github.com/imzhoukunqiang/compass/blob/dev/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-green.svg" alt="License"></a>
</p>

<p align="center">
  <a href="http://compass.coding.gs/">在线 Demo</a>
</p>

## 项目介绍

Compass 是一个由 YAML 配置驱动的个人导航页，适合个人主页、浏览器起始页、团队常用链接页。它不依赖数据库，内容都来自一个 `config.yaml`，既可以部署成纯静态站点，也可以在 `server` 模式下运行时读取并保存配置。

### 核心特性

- **YAML 配置驱动**: 默认读取 `public/config.yaml`，也支持 `COMPASS_CONFIG_PATH`
- **双运行模式**: 支持静态导出，也支持 `server` 模式按请求读取和保存 YAML
- **零数据库**: 不依赖外部服务，适合个人主页和导航站
- **运行时图标**: Lucide + Simple Icons 运行时解析，新增图标不用改代码
- **三套主题**: `light` / `dark` / `ocean`
- **内置编辑器**: `/edit` 可视化编辑 YAML，`server` 模式下登录后可直接保存
- **搜索与布局设置**: 支持搜索开关、网格/列表布局和动画开关

### 运行模式

| 模式 | 特点 | 适合场景 |
|------|------|----------|
| `static` | 构建时读取 YAML，输出 `out/` | Vercel、Cloudflare Pages、Netlify 等静态托管 |
| `server` | 运行时读取 YAML，可通过 `/edit` 在线保存 | Docker、自托管 Node 服务 |

### 技术栈

[Next.js](https://nextjs.org) 16 · [React](https://react.dev) 19 · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Framer Motion](https://www.framer.com/motion) · [Lucide](https://lucide.dev) · [Simple Icons](https://simpleicons.org)

## 部署指南

### 选择部署方式

| 方式 | 模式 | `/edit` 在线保存 | 适合场景 |
|------|------|------------------|----------|
| Vercel / Cloudflare Pages / Netlify | `static` | 否 | 最省心的静态托管 |
| Docker / 自托管 Node | `server` | 是 | 需要在运行时挂载 YAML 并直接保存配置 |

- `static` 模式会在构建时读取 YAML，修改配置后需要重新部署
- `server` 模式会按请求读取 YAML，修改挂载文件或通过 `/edit` 保存后刷新即可生效
- `server` 模式启动时必须设置 `COMPASS_ADMIN_TOKEN`

### 一键部署

<p>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/imzhoukunqiang/compass"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/imzhoukunqiang/compass"><img src="https://deploy.workers.cloudflare.com/button.svg" alt="Deploy to Cloudflare"></a>
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/imzhoukunqiang/compass"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</p>

点击按钮会进入对应平台的项目创建或仓库导入流程。

### Docker（server 模式）

1. 准备要持久化的配置文件：

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
```

2. 运行容器：

```bash
docker run -d \
  --name compass \
  -p 3000:3000 \
  -e COMPASS_ADMIN_TOKEN=replace-with-a-strong-token \
  -e COMPASS_SESSION_SECRET=replace-with-a-long-random-secret \
  -v "$(pwd)/docker/config.yaml:/app/public/config.yaml" \
  zhoukq/compass:latest
```

说明：

- 公共镜像地址是 `zhoukq/compass:latest`
- 首次执行 `docker run` 时，如果本地还没有该镜像，Docker 会自动拉取
- `COMPASS_ADMIN_TOKEN` 未设置时，容器会直接退出
- 生产环境请替换所有示例口令，不要直接使用 `change-me`
- 挂载进去的 YAML 文件必须可写，否则 `/edit` 保存会失败
- 如需改用其他路径挂载，请同时设置 `COMPASS_CONFIG_PATH`

如需固定版本，可把 `latest` 改成已发布的具体 tag。普通部署场景不需要本地构建镜像。

### Docker Compose（server 模式）

1. 初始化配置文件：

```bash
mkdir -p docker
cp public/config.yaml docker/config.yaml
```

2. 编辑仓库里的 `docker-compose.yml`，把 `COMPASS_ADMIN_TOKEN` 和 `COMPASS_SESSION_SECRET` 改成真实值。

3. 启动：

```bash
docker compose up -d
```

默认 `docker-compose.yml` 会直接使用 `zhoukq/compass:latest`，并把宿主机的 `./docker/config.yaml` 挂载到容器内的 `/app/public/config.yaml`，之后通过 `/edit` 保存会直接写回这个文件。

### Vercel（static 模式）

1. 把仓库推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 控制台点击 `Add New -> Project`，导入这个仓库，或使用上方 Deploy Button。
3. 保持 `Framework Preset = Next.js`。Vercel 会自动使用 `package.json` 里的 `npm run build`。
4. 如果你手动覆盖构建配置，请填 `Build Command = npm run build`，`Output Directory = out`。
5. 点击 Deploy。

说明：

- Vercel 会在云端自动构建，你不需要在本地执行构建命令
- 不要把构建命令改成 `next build` 或 `npx next build`；本项目依赖自定义构建脚本先生成静态品牌图标并处理 API routes
- 静态部署通常不需要设置 `COMPASS_ADMIN_TOKEN`、`COMPASS_SESSION_SECRET`
- `/edit` 在 Vercel 上只能编辑和导出 YAML，不能在线保存
- 修改内容时，请更新仓库里的 `public/config.yaml` 后重新部署

### Cloudflare Pages（static 模式）

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

- Cloudflare Pages 会在云端自动构建，你不需要在本地执行构建命令
- 不要直接沿用默认的 `npx next build`；本项目必须使用 `npm run build`
- 仓库内的 `wrangler.toml` 已把 `pages_build_output_dir` 设为 `out`
- `/edit` 在 Cloudflare Pages 上只能编辑和导出 YAML，不能在线保存
- 修改内容时，请更新仓库里的 `public/config.yaml` 后重新部署

### 高级方式

- 如果你不想使用 Git 集成，而是想通过 Wrangler 本地构建后直传 Pages，可以查看 [docs/BUILD.md](docs/BUILD.md)
- 如果你正在修改源码并需要验证未发布的 Docker 改动，也可以自行使用仓库里的 `Dockerfile` 构建镜像

### 部署环境变量

| 变量 | 说明 | 何时需要 |
|------|------|----------|
| `COMPASS_CONFIG_PATH` | 自定义配置文件路径 | 可选，主要用于 `server` 模式 |
| `COMPASS_ADMIN_TOKEN` | `server` 模式启动必需的编辑器登录口令 | `server` 模式必需 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | `server` 模式生产环境强烈建议设置 |
| `PORT` | Node 服务监听端口 | 自托管 Node / Docker 场景可选 |

## 使用指南

### 配置文件

编辑 `public/config.yaml` 即可自定义全部内容：

```yaml
profile:
  name: Compass
  avatar: "navigation"
  description: Navigate Your World
  bio: 快速访问常用网站和工具

settings:
  theme: dark
  showSearch: true
  layout: grid
  animations: true

categories:
  - id: daily
    name: Daily
    icon: Calendar
    color: "#3b82f6"
    links:
      - id: github
        name: GitHub
        url: https://github.com
        icon: github
        description: 代码托管平台
```

### 配置规则

- 默认配置文件路径为 `public/config.yaml`
- `server` 模式可通过 `COMPASS_CONFIG_PATH` 指向其他 `.yaml` 文件
- 配置文件统一使用 `.yaml`

### 图标命名

| 类型 | 来源 | 命名 | 示例 |
|------|------|------|------|
| 通用 | [Lucide](https://lucide.dev) | PascalCase | `Calendar`, `Mail`, `Wrench` |
| 品牌 | [Simple Icons](https://simpleicons.org) | 小写或 kebab-case | `github`, `vercel`, `google-gemini` |

头像也可以直接填写图标名，例如 `avatar: "navigation"`。图标在运行时解析，无需预生成 manifest。

### `/edit` 编辑器

`/edit` 页面始终可用，但保存能力取决于运行模式：

- `static` 模式：可编辑和导出 YAML，不提供服务端保存
- `server` 模式：启动时必须设置 `COMPASS_ADMIN_TOKEN`；登录后可直接保存到运行时配置文件

### 配置何时生效

- `static` 模式：修改配置后需要重新构建并重新部署
- `server` 模式：修改挂载的 YAML 文件后刷新页面即可生效
- `server` 模式：通过 `/edit` 保存后会直接写回运行时配置文件

## 开发介绍

如果你要本地开发、二次定制或参与贡献，可以从下面这些入口开始：

| 命令 | 模式 | 说明 |
|------|------|------|
| `npm run dev` | `server` | 默认开发模式 |
| `npm run dev:server` | `server` | 与 `npm run dev` 等价 |
| `npm run dev:static` | `static` | 静态预览模式 |
| `npm run lint` | - | ESLint 检查 |

- 开发环境要求 Node `>=22`
- 本地开发细节见 [docs/DEV.md](docs/DEV.md)
- 构建与部署细节见 [docs/BUILD.md](docs/BUILD.md)

### 项目结构

```text
public/
├── config.yaml              # 默认配置文件
src/
├── app/
│   ├── page.tsx             # 主页（服务端读取 YAML）
│   ├── layout.tsx           # 根布局与主题启动脚本
│   ├── components/          # UI 组件
│   ├── edit/                # 可视化编辑器
│   ├── api/                 # server 模式接口
│   ├── themes/              # 主题预设
│   ├── types/               # 类型定义
│   └── globals.css          # 全局样式
├── server/                  # 运行时配置、鉴权、环境变量
scripts/
├── dev.mjs                  # 开发启动脚本
└── build.mjs                # 静态 / server 构建脚本
```

## License

[Apache License 2.0](LICENSE)
