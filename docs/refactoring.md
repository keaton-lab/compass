# Compass 架构重构状态

## 文档说明

- 最近核对时间：`2026-04-11`
- 当前主线方案：`Astro + React`
- 本文档用于记录当前有效架构、已完成事项和仍待补齐的工作

## 历史说明

- 仓库中曾短暂尝试过 `Vite + React + Hono` 的自组装方案。
- 这条路线已经放弃，不再作为当前实现或后续演进方向。
- 当前代码与构建链路以 Astro 为准，相关说明请同时参考 [README.md](../README.md)、[BUILD.md](./BUILD.md) 和 [DEV.md](./DEV.md)。

## 当前架构

### 页面结构

- `/`
  - Astro 页面负责输出首页 HTML
  - `static` 模式下构建期直接生成完整页面
  - `server` 模式下运行时读取 YAML 并 SSR
- `/edit`
  - 独立 React 编辑器页面
  - 只在该路由加载编辑器相关客户端代码
- `/api/*`
  - 由 Astro API routes 承载
  - 复用 `src/server/` 中的运行时能力与配置读写逻辑

### 目录基线

- `src/pages/`
  - Astro 页面与 API 路由
- `src/layouts/`
  - 页面布局与首屏样式注入
- `src/client/`
  - React 组件、首页 islands、编辑器页面与客户端服务
- `src/server/`
  - 运行模式、配置读写、GitHub 发布、能力判定
- `src/shared/`
  - YAML、类型、图标解析、主题等共享逻辑

### 运行模式

- `static`
  - 首页静态导出
  - `/edit` 支持本地编辑和导出 YAML
- `server`
  - 首页运行时 SSR
  - `/edit` 可按能力开启登录保存和 GitHub 发布

## 当前已完成

- 已完成首页与编辑页的双页拆分，不再依赖单入口 SPA。
- 已完成 Astro 静态导出与 server 构建双链路。
- 已完成首页静态优先渲染，首页不再首屏拉取全量配置再组装。
- 已完成首页首屏样式优化，避免首次打开时的裸 HTML 闪烁。
- 已完成编辑页与首页代码路径拆分，重量级编辑器逻辑不进入首页首屏。
- 已完成运行时图标解析，继续支持 Lucide 和 Simple Icons。
- 已完成构建与开发脚本收口到 Astro CLI。
- 已完成依赖升级到当前兼容的长期维护版本线：
  - Astro `6`
  - React `19`
  - TypeScript `5.9`
  - Tailwind CSS `3.4 LTS`
  - ESLint `9`

## 仍待补齐

### 功能层

- `/edit` 目前仍以 YAML 编辑为主，旧版更完整的可视化编辑体验尚未全部恢复。
- GitHub 发布能力仍需要真实环境联调与失败态回归。

### 工程层

- 仓库里仍未补充真正的 Vitest / Playwright 用例。
- Docker 与部署文档需要再做一次容器级实跑验证。

## 本轮已验证

- `npm run typecheck`
  - 结果：通过
- `npm run lint`
  - 结果：通过
- `npm run build:static`
  - 结果：通过
  - 说明：生成 `dist/client/index.html` 与 `dist/client/edit/index.html`
- `npm run build:server`
  - 结果：通过
  - 说明：成功生成 `dist/server/entry.mjs`

## 后续建议

### 第一优先级

- 补 Playwright 冒烟测试，至少覆盖首页首屏、主题恢复和 `/edit` 打开。
- 给 GitHub 发布能力补一轮真实环境验证。

### 第二优先级

- 继续恢复编辑器可视化能力，而不只是 YAML 文本编辑。
- 为首页 islands 增加更细的包体和交互回归检查。

### 第三优先级

- 补容器化运行验证和部署样例。
- 继续收紧未使用依赖与历史脚本。
