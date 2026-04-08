<p align="center">
  <h1 align="center">Compass</h1>
  <p align="center">一个 YAML 文件驱动的个人导航页，Fork → 编辑 → 部署，没有数据库，没有后台</p>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?logo=tailwindcss" alt="Tailwind CSS"></a>
  <a href="https://github.com/imzhoukunqiang/compass/blob/dev/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-green.svg" alt="License"></a>
</p>

<p align="center">
  <a href="http://compass.coding.gs/">🌐 在线 Demo</a>
</p>

<br>

## 特性

- **YAML 配置** — 所有内容集中在 `src/config.yaml`，改完即生效
- **零数据库** — 纯静态站点，不依赖任何后端服务
- **3000+ 图标** — Lucide + Simple Icons 自动按需生成，无需手动管理
- **三套主题** — Light / Dark / Ocean，玻璃拟态 UI
- **内置编辑器** — 访问 `/edit` 直接在浏览器中修改配置
- **搜索** — 实时过滤

## 一键部署

<p>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/imzhoukunqiang/compass"><img src="https://vercel.com/button" alt="Deploy with Vercel"></a>

  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/imzhoukunqiang/compass"><img src="https://deploy.workers.cloudflare.com/button.svg" alt="Deploy to Cloudflare Pages"></a>
  
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/imzhoukunqiang/compass"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</p>

点击按钮会自动 Fork 本仓库并跳转到对应平台进行部署。

## 使用教程

1. **Fork 本项目** — 点击右上角 Fork 按钮，复制仓库到你的 GitHub 账号
2. **修改配置** — 编辑 `src/config.yaml`，填入你的个人信息和导航链接
3. **连接部署平台** — 在 [Cloudflare Pages](https://pages.cloudflare.com/) / [Vercel](https://vercel.com) / [Netlify](https://www.netlify.com/) 中导入你的 Fork 仓库
4. **等待自动部署** — 平台检测到代码变更会自动构建，完成后即可通过分配的域名访问
5. **绑定自定义域名（可选）** — 在部署平台设置中添加你的域名，解析到对应 CNAME

后续更新只需修改 `config.yaml` 并 Push，平台会自动重新部署。也可访问 `/edit` 路径使用内置编辑器在线修改。

## 部署

构建产物输出到 `out/`（Next.js 静态导出），可直接部署到任何静态托管平台。

| 平台 | 说明 |
|------|------|
| **Cloudflare Pages** | 构建命令 `npm run build`，输出目录 `out` |
| **Vercel** | Next.js 原生支持，零配置 |
| **Netlify** | 构建命令 `npm run build`，发布目录 `out` |

## 本地开发

```bash
git clone https://github.com/imzhoukunqiang/compass.git
cd compass && npm install
npm run dev
```

打开 `http://localhost:3000`，开发服务器会监听 `config.yaml` 变更并自动重新生成图标。

## 配置

编辑 `src/config.yaml` 即可自定义全部内容：

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
| 品牌 | [Simple Icons](https://simpleicons.org) | 小写 | `github`, `vercel`, `youtube` |

图标从 `config.yaml` 自动提取生成到 `icons-manifest.ts`，无需手动维护。

## 项目结构

```
src/
├── config.yaml              # 唯一配置文件
├── app/
│   ├── page.tsx             # 主页（服务端读取 YAML）
│   ├── components/          # UI 组件
│   ├── contexts/            # 客户端状态
│   ├── themes/              # 主题预设
│   ├── types/               # 类型定义
│   ├── globals.css          # 全局样式
│   └── edit/                # 可视化编辑
└── data/
    └── icons-manifest.ts    # 自动生成（勿手动编辑）
```

## 工作流

修改 `config.yaml` → 提交 → 平台自动构建部署。也可通过 `/edit` 页面在线编辑后导出 YAML。

## 技术栈

[Next.js](https://nextjs.org) 14 · [React](https://react.dev) 18 · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Framer Motion](https://www.framer.com/motion) · [Lucide](https://lucide.dev) · [Simple Icons](https://simpleicons.org)

## License

[Apache License 2.0](LICENSE)
