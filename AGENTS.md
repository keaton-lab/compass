# AGENTS.md - Compass 项目智能体编码指南

**Compass** 是一个基于 Astro 6 + React 19 的个人导航仪表板，YAML 配置驱动内容，支持静态导出和 SSR 两种模式。

---

## 关键命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | Server 模式开发（默认，SSR） |
| `npm run dev:static` | 静态模式预览 |
| `npm run build` | 静态构建（默认） |
| `npm run build:static` | 静态构建 → `dist/client/` |
| `npm run build:server` | Server 构建 → `dist/client/` + `dist/server/entry.mjs` |
| `npm run typecheck` | `astro check` + `tsc -p tsconfig.server.json` |
| `npm run lint` | ESLint 检查 |
| `npm run test` | Vitest 单元测试 |
| `npm run test:e2e` | Playwright E2E 测试 |

> **Node.js 版本要求**：`>= 22.12.0`

---

## 图标系统（⚠️ 重要）

图标在**运行时解析**，无需构建步骤。

| 类型 | 来源 | 命名规则 | 示例 |
|------|------|----------|------|
| 通用图标 | Lucide | PascalCase | `Calendar`, `Mail`, `Wrench` |
| 品牌图标 | Simple Icons | lowercase 或 kebab-case | `github`, `google-gemini`, `vercel` |

头像格式：`avatar: "navigation"`（直接使用图标名称）

---

## 配置驱动架构

所有内容来自单一 YAML 配置文件：

- **默认路径**：`public/config.yaml`
- **运行时覆盖**：通过 `COMPASS_CONFIG_PATH` 环境变量指定
- **本地开发**：`npm run sync:static` 同步 `public/config.local.yaml` → `public/config.yaml`

```yaml
profile:
  name: Compass
  avatar: "navigation"
  description: Navigate Your World

settings:
  theme: dark        # light | dark | ocean
  showSearch: true
  layout: grid       # grid | list

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
```

---

## 项目结构

```
src/
├── layouts/          # Astro 布局
├── pages/            # 页面与 API 路由（Astro）
├── client/           # React 组件、islands、编辑器
│   ├── components/   # UI 组件
│   ├── islands/      # 首页局部交互岛（Astro islands）
│   ├── pages/        # 编辑器页面（/edit）
│   ├── contexts/     # 客户端状态
│   └── services/     # API 服务
├── server/           # 运行时能力与 YAML 读写
└── shared/           # 共享模块
    ├── types.ts      # 类型定义
    ├── themes.ts     # 主题预设
    └── config-yaml.ts # YAML 解析与验证
```

---

## 构建验证顺序

```bash
npm run typecheck && npm run lint && npm run build:static && npm run build:server
```

---

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `COMPASS_RUNTIME_MODE` | `static` 或 `server` | 否（自动推断） |
| `COMPASS_CONFIG_PATH` | 配置文件路径 | 否（默认 `public/config.yaml`） |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 | server 模式开启保存能力时需要 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | 否（随机生成） |
| `PORT` | 服务端口 | 否（默认 3000） |

开发模式下默认注入 `COMPASS_ADMIN_TOKEN=dev-token`。

---

## 部署

- **静态模式**：`dist/client/` → Cloudflare Pages / Vercel / Netlify
- **Server 模式**：`node dist/server/entry.mjs` 或 Docker
- **Docker 外挂配置**：`-v /path/to/config.yaml:/app/public/config.yaml`

---

## 开发陷阱速查

| 问题 | 解决 |
|------|------|
| 图标不显示 | Lucide 用 PascalCase，品牌图标用 lowercase 或 kebab-case |
| typecheck 报错 | 检查 `tsconfig.server.json` 包含的服务端文件 |
| 静态构建配置不更新 | 运行 `npm run sync:static` 或检查 `config.local.yaml` |
| Docker 配置修改不生效 | 确认 `COMPASS_CONFIG_PATH` 指向挂载文件 |
| 主题无效 | `settings.theme` 必须为 `light` / `dark` / `ocean` |
