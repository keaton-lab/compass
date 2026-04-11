<p align="center">
  <h1 align="center">Compass</h1>
  <p align="center">一个 YAML 文件驱动的个人导航页，首页静态优先，编辑页按需客户端化。</p>
</p>

<p align="center">
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Astro-6-ff5d01?logo=astro" alt="Astro"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React"></a>
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
- **双页架构** — `/` 为 Astro 首页，`/edit` 为独立 React 编辑器
- **静态与 SSR** — 首页支持静态导出，也支持 server 模式下运行时 SSR
- **运行时图标** — Lucide + Simple Icons 运行时解析，新增图标不用改代码
- **三套主题** — Light / Dark / Ocean，玻璃拟态 UI
- **内置编辑器** — 访问 `/edit` 直接在浏览器中修改配置
- **按需能力** — GitHub 发布是 `server` 模式下的可选能力，不再是独立运行模式

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

## 运行模式

### 静态模式

- 构建命令: `npm run build:static`
- 产物目录: `dist/client`
- 首页输出为完整静态 HTML
- `/edit` 保留本地编辑与导出 YAML 能力

### Server 模式

- 构建命令: `npm run build:server`
- 产物目录: `dist/client` + `dist/server`
- `/` 在运行时读取 YAML 并 SSR
- `/edit` 可按能力开启登录保存与 GitHub 发布

详细说明见 [BUILD.md](docs/BUILD.md) 和 [DEV.md](docs/DEV.md)。

## 本地开发

```bash
git clone https://github.com/imzhoukunqiang/compass.git
cd compass && npm install
npm run dev
```

要求 Node.js `>= 22.12.0`。

本地开发默认跑 `server` 模式，打开 `http://localhost:3000`。

```bash
npm run dev:static
```

可切到静态模式验证首页静态导出行为。

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
├── client/           # React 组件、islands 与编辑器
│   ├── components/   # UI 组件
│   ├── islands/      # 首页局部交互岛
│   ├── pages/        # 编辑器页面
│   ├── contexts/     # 客户端状态
│   └── services/     # API 服务
├── layouts/          # Astro 布局
├── pages/            # Astro 页面与 API 路由
├── server/           # 服务端配置与能力封装
└── shared/           # 共享模块
    ├── types.ts      # 类型定义
    ├── themes.ts     # 主题预设
    └── config-yaml.ts # YAML 解析

public/
└── config.yaml       # 唯一配置文件
```

## 技术栈

[Astro](https://astro.build) · [React](https://react.dev) 19 · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Lucide](https://lucide.dev) · [Simple Icons](https://simpleicons.org)

## License

[Apache License 2.0](LICENSE)
