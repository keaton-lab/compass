<p align="center">
  <h1 align="center">Compass</h1>
  <p align="center">一个 YAML 文件驱动的个人导航页，Fork → 编辑 → 部署，没有数据库，没有后台</p>
</p>

<p align="center">
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite" alt="Vite"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React"></a>
  <a href="https://hono.dev"><img src="https://img.shields.io/badge/Hono-4-FF6900" alt="Hono"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss" alt="Tailwind CSS"></a>
  <a href="https://github.com/imzhoukunqiang/compass/blob/dev/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-green.svg" alt="License"></a>
</p>

<p align="center">
  <a href="http://compass.coding.gs/">🌐 在线 Demo</a>
</p>

<br>

## 特性

- **YAML 配置** — 所有内容集中在 `public/config.yaml`，改完即生效
- **三种运行模式** — 静态部署、Docker Server、GitHub App 集成
- **运行时图标** — Lucide + Simple Icons 运行时解析，新增图标不用改代码
- **三套主题** — Light / Dark / Ocean，玻璃拟态 UI
- **内置编辑器** — 访问 `/edit` 直接在浏览器中修改配置
- **搜索** — 实时过滤

## 一键部署

<p>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/imzhoukunqiang/compass"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>

  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/imzhoukunqiang/compass"><img src="https://deploy.workers.cloudflare.com/button.svg" alt="Deploy to Cloudflare"></a>
  
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/imzhoukunqiang/compass"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</p>

点击按钮会自动 Fork 本仓库并跳转到对应平台进行部署。

## 使用教程

1. **Fork 本项目** — 点击右上角 Fork 按钮，复制仓库到你的 GitHub 账号
2. **修改配置** — 编辑 `public/config.yaml`，填入你的个人信息和导航链接
3. **连接部署平台** — 在 [Cloudflare Pages](https://pages.cloudflare.com/) / [Vercel](https://vercel.com) / [Netlify](https://www.netlify.com/) 中导入你的 Fork 仓库
4. **等待自动部署** — 平台检测到代码变更会自动构建，完成后即可通过分配的域名访问
5. **绑定自定义域名（可选）** — 在部署平台设置中添加你的域名，解析到对应 CNAME

后续更新只需修改 `public/config.yaml` 并 Push，平台会自动重新部署。也可访问 `/edit` 路径使用内置编辑器在线修改。项目规范统一使用 `.yaml` 后缀。

## 部署

支持三种运行模式:

### 静态模式 (static)
构建产物输出到 `dist/client/`，可直接部署到任何静态托管平台。

| 平台 | 说明 |
|------|------|
| **Cloudflare Pages** | 构建命令 `npm run build:static`，发布目录 `dist/client` |
| **Vercel** | 构建命令 `npm run build:static`，发布目录 `dist/client` |
| **Netlify** | 构建命令 `npm run build:static`，发布目录 `dist/client` |

### Server 模式 (Docker)
支持运行时编辑和保存配置。

### GitHub 模式
通过 GitHub App 集成，支持在线编辑并提交到指定仓库。

详细说明见 [BUILD.md](docs/BUILD.md) 和 [DEV.md](docs/DEV.md)。

## 本地开发

```bash
git clone https://github.com/imzhoukunqiang/compass.git
cd compass && npm install
npm run dev
```

本地开发默认使用单端口开发服务器，打开 `http://localhost:3000`。
`npm run dev` 会在同一个端口下提供前端页面和 `/api/*`，体验接近 Next.js。

详细说明见 [DEV.md](docs/DEV.md)，构建说明见 [BUILD.md](docs/BUILD.md)。

## 配置

编辑 `public/config.yaml` 即可自定义全部内容：

```yaml
profile:
  name: Compass
  avatar: "icon:navigation"
  description: Navigate Your World
  bio: 快速访问常用网站和工具

settings:
  theme: dark        # light | dark | ocean
  showSearch: true

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

### 图标

| 类型 | 来源 | 命名 | 示例 |
|------|------|------|------|
| 通用 | [Lucide](https://lucide.dev) | PascalCase | `Calendar`, `Mail`, `Wrench` |
| 品牌 | [Simple Icons](https://simpleicons.org) | 小写或 kebab-case | `github`, `vercel`, `google-gemini` |

图标在运行时解析，无需手动维护。

## 项目结构

```
src/
├── client/           # React 前端应用
│   ├── components/   # UI 组件
│   ├── pages/        # 页面路由
│   ├── contexts/     # 客户端状态
│   └── services/     # API 服务
├── server/           # Hono 服务端
│   ├── routes/       # API 路由
│   └── index.ts      # 服务入口
└── shared/           # 共享模块
    ├── types.ts      # 类型定义
    ├── themes.ts     # 主题预设
    └── config-yaml.ts # YAML 解析

public/
└── config.yaml       # 唯一配置文件
```

## 技术栈

[Vite](https://vitejs.dev) · [React](https://react.dev) 18 · [React Router](https://reactrouter.com) · [Hono](https://hono.dev) · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Framer Motion](https://www.framer.com/motion) · [Lucide](https://lucide.dev) · [Simple Icons](https://simpleicons.org)

## License

[Apache License 2.0](LICENSE)
