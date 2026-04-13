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

## 特性

- **YAML 配置驱动**: 默认读取 `public/config.yaml`，也支持 `COMPASS_CONFIG_PATH`
- **双运行模式**: 支持静态导出，也支持 `server` 模式按请求读取和保存 YAML
- **零数据库**: 不依赖外部服务，适合个人主页和导航站
- **运行时图标**: Lucide + Simple Icons 运行时解析，新增图标不用改代码
- **三套主题**: `light` / `dark` / `ocean`
- **内置编辑器**: `/edit` 可视化编辑 YAML，`server` 模式下登录后可直接保存
- **搜索与布局设置**: 支持搜索开关、网格/列表布局和动画开关

## 一键部署

<p>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/imzhoukunqiang/compass"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/imzhoukunqiang/compass"><img src="https://deploy.workers.cloudflare.com/button.svg" alt="Deploy to Cloudflare"></a>
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/imzhoukunqiang/compass"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</p>

点击按钮会自动 Fork 本仓库并跳转到对应平台进行部署。

## 快速开始

### 1. 安装依赖

```bash
git clone https://github.com/imzhoukunqiang/compass.git
cd compass
npm install
```

### 2. 本地启动

默认开发命令是 `server` 模式：

```bash
COMPASS_ADMIN_TOKEN=change-me npm run dev
```

打开 `http://localhost:3000`，访问：

- `/` 查看首页
- `/edit` 进入编辑器

如果你只想验证静态模式：

```bash
npm run dev:static
```

### 3. 修改配置

编辑 `public/config.yaml`，填入个人信息、分类和链接。

静态部署场景下，修改后需要重新构建；`server` 模式下刷新页面即可读取最新 YAML。

### 4. 选择部署方式

- 静态托管：`npm run build`
- Docker / Node 服务：`npm run build:server`

## 本地开发

| 命令 | 模式 | 说明 |
|------|------|------|
| `npm run dev` | `server` | 默认开发模式 |
| `npm run dev:server` | `server` | 与 `npm run dev` 等价 |
| `npm run dev:static` | `static` | 静态预览模式 |
| `npm run lint` | - | ESLint 检查 |

详细说明见 [DEV.md](docs/DEV.md)，构建说明见 [BUILD.md](docs/BUILD.md)。

## 配置

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

### 图标

| 类型 | 来源 | 命名 | 示例 |
|------|------|------|------|
| 通用 | [Lucide](https://lucide.dev) | PascalCase | `Calendar`, `Mail`, `Wrench` |
| 品牌 | [Simple Icons](https://simpleicons.org) | 小写或 kebab-case | `github`, `vercel`, `google-gemini` |

头像也可以直接填写图标名，例如 `avatar: "navigation"`。图标在运行时解析，无需预生成 manifest。

## 编辑器与保存

`/edit` 页面始终可用，但保存能力取决于运行模式：

- `static` 模式：可编辑和导出 YAML，不提供服务端保存
- `server` 模式且设置了 `COMPASS_ADMIN_TOKEN`：可登录后直接保存到运行时配置文件

相关环境变量：

| 变量 | 说明 |
|------|------|
| `COMPASS_CONFIG_PATH` | 自定义配置文件路径 |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥，生产环境建议显式设置 |

## 项目结构

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

## 构建与部署

| 命令 | 目标 | 输出 |
|------|------|------|
| `npm run build` | 静态导出 | `out/` |
| `npm run build:static` | 静态导出 | `out/` |
| `npm run build:server` | Node standalone | `.next/standalone` |

静态部署适合 Cloudflare Pages、Netlify 等平台；`server` 构建适合 Docker 挂载 YAML 持久化。

## 技术栈

[Next.js](https://nextjs.org) 16 · [React](https://react.dev) 19 · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Framer Motion](https://www.framer.com/motion) · [Lucide](https://lucide.dev) · [Simple Icons](https://simpleicons.org)

## License

[Apache License 2.0](LICENSE)
