# AGENTS.md

Compass — YAML 配置驱动的个人导航页，基于 Next.js 16 App Router + React 19。

## 命令

```bash
npm run dev           # 开发服务器（默认 server 模式）
npm run dev:static    # 开发服务器（static 模式）
npm run build         # 静态导出构建（默认）
npm run build:static  # 同上
npm run build:server  # Node 服务构建（输出 standalone）
npm run lint          # ESLint（不含 src/server/**/*.js）
```

- 无测试框架，无 typecheck 脚本
- Node >= 22（见 `.nvmrc`）

## 构建脚本行为（⚠️ 非显而易见）

`scripts/build.mjs` 和 `scripts/dev.mjs` 封装了 `next build` / `next dev`，启动前会自动：

1. 运行 `scripts/generate-static-brand-icons.mjs`，从 `src/app/static-brand-icons.json` 读取品牌图标名列表 → 生成 `src/app/generated/static-brand-icons.ts`
2. 构建脚本会从 `.env*` 文件加载环境变量（手动解析，不走 Next.js 内置 env）

**静态构建时**：脚本会临时把 `src/app/api/` 移到 `.compass-build-cache/app-api-backup/`（Next.js `output: export` 不支持 API routes），构建完自动恢复。不要手动删除 `.compass-build-cache/`。

## 图标系统

运行时解析（`resolve-config-icons.ts`）优先查 Lucide，未命中再查 Simple Icons。**但** footer 里的品牌图标依赖构建时生成的 `STATIC_BRAND_ICONS`。

- **Lucide**：PascalCase（`Calendar`, `Mail`）
- **品牌**：lowercase / kebab-case（`github`, `google-gemini`），来自 `simple-icons`
- 新增**footer 使用的品牌图标**时，必须同时添加到 `src/app/static-brand-icons.json`

## 配置驱动

所有内容来自 `public/config.yaml`：

- server 模式：`COMPASS_CONFIG_PATH` 环境变量指定外挂 YAML 路径
- server 模式**必须**设置 `COMPASS_ADMIN_TOKEN`，否则启动失败
- `/edit` 路由提供可视化 YAML 编辑器（仅 server 模式可保存到服务器）

## 关键目录

```
src/app/              # Next.js App Router（TypeScript / ESM）
  page.tsx            # 主页入口，服务端组件
  layout.tsx          # 根布局，含主题引导脚本
  components/         # UI 组件（PascalCase）
  edit/               # /edit 可视化编辑页
  api/                # API routes（仅 server 模式生效，静态构建时被排除）
  generated/          # 构建时自动生成，勿手动编辑
  static-brand-icons.json  # 构建时品牌图标白名单
  themes/             # light / dark / ocean 主题预设
  types/              # TypeScript 接口
src/server/           # 运行时服务层（CommonJS .js，被 ESLint 忽略）
  env.js              # 环境变量解析与校验
  config-store.js     # YAML 读写
  auth.js / runtime.js
```

## 代码规范

- 组件文件：PascalCase（`ResolvedIcon.tsx`）
- 客户端组件顶部加 `'use client'`，服务端组件无指令
- 导入用相对路径（`./` `../`），项目配置了 `@/*` → `./src/*` 别名但代码中少见使用
- Tailwind `darkMode: 'class'`，自定义断点 `xsm: 390px`
- 主题通过 CSS 变量 + `data-theme` 属性切换，不依赖 Tailwind dark 变体
- 类型导入：`import type { ... }`

## 部署

- **静态模式**：`npm run build` → `out/`，部署到 Cloudflare Pages / Netlify / Vercel
- **Docker/server 模式**：`npm run build:server` → `.next/standalone/`，需设 `COMPASS_BUILD_TARGET=server`
- Docker Compose 挂载 `./docker/config.yaml:/app/public/config.yaml`

## 常见陷阱

| 问题 | 原因 / 解决 |
|------|-------------|
| 图标不显示 | Lucide 用 PascalCase，品牌用 lowercase / kebab-case |
| 新品牌图标在 footer 不显示 | 需添加到 `static-brand-icons.json` 并重新构建 |
| 静态构建报 API route 错误 | `src/app/api/` 应被构建脚本自动隐藏，检查 `.compass-build-cache/` |
| server 模式启动失败 | 缺少 `COMPASS_ADMIN_TOKEN` 环境变量 |
| Docker 修改 YAML 不生效 | 确认 `COMPASS_CONFIG_PATH` 指向容器内挂载文件路径 |