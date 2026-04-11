# Compass 迁移至 Vite + React + Hono 的实施方案

## Summary
- 迁移目标是把当前 `Next.js 14 App Router + 双构建模式` 改为 `Vite + React SPA + Hono API/BFF`，同时保留并统一 3 种运行模式：`static`、`server`、`github`。
- 本次迁移不引入数据库，继续以 `YAML / Git` 作为唯一真源。
- 仓库保持“单应用内聚”结构，不拆 workspace，不做多包 monorepo。
- 迁移后前端负责渲染和编辑体验，Hono 负责文件写入、登录会话、GitHub App 授权与提交。
- 本次方案默认接受首页从 Next 的服务端渲染迁移为 Vite 驱动的客户端应用；若后续必须恢复预渲染 HTML，再作为独立二期。

## Target Architecture
- 目标目录结构调整为：
  - `src/client/`：React 应用入口、页面、路由、上下文、组件、编辑器 UI
  - `src/server/`：Hono 服务入口、API 路由、认证、YAML 文件读写、GitHub App 集成
  - `src/shared/`：类型、主题、YAML 规范化、校验、序列化、运行模式常量
  - `src/config.yaml`：默认配置文件，继续保留
  - `public/`：静态资源、favicon、字体、静态模式下暴露的 `config.yaml`
  - `scripts/`：开发脚本、静态配置同步脚本、构建脚本
- React 路由采用 `react-router-dom`：
  - `/`：首页
  - `/edit`：编辑器
  - `*`：404
- Hono 路由统一放在 `/api/*`：
  - `GET /api/capabilities`
  - `GET /api/config/runtime`
  - `GET /api/config/source`
  - `PUT /api/config/file`
  - `GET /api/session`
  - `POST /api/session/login`
  - `DELETE /api/session`
  - `GET /api/github/connect`
  - `GET /api/github/callback`
  - `POST /api/github/publish`
- 运行模式定义：
  - `static`：前端直接读取部署产物中的 `public/config.yaml`，编辑器仅支持导出 YAML
  - `server`：前端通过 Hono API 读取运行时配置并保存到挂载文件
  - `github`：前端通过 Hono API 发起 GitHub App 授权并提交到固定仓库的 `src/config.yaml`
- 配置加载策略固定为：
  - 静态模式从 `/config.yaml` 拉取并在浏览器解析
  - server/github 模式从 `/api/config/runtime` 获取 JSON 配置
  - 所有 YAML 解析、规范化、序列化规则只保留一套，放在 `src/shared/config-*` 模块

## Public Interfaces And Env Changes
- 保留的核心数据结构：
  - `Config`
  - `Profile`
  - `Settings`
  - `Category`
  - `Link`
- 新增共享接口：
  - `RuntimeMode = 'static' | 'server' | 'github'`
  - `Capabilities`：描述当前模式、是否允许登录、是否允许文件保存、是否允许 GitHub 发布
  - `GithubPublishPayload`：包含 `yamlContent`、可选提交说明
- 环境变量调整为：
  - `COMPASS_RUNTIME_MODE=static|server|github`
  - `COMPASS_CONFIG_PATH`
  - `COMPASS_ADMIN_TOKEN`
  - `COMPASS_SESSION_SECRET`
  - `APP_BASE_URL`
  - `GITHUB_APP_ID`
  - `GITHUB_APP_PRIVATE_KEY`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_REPO_OWNER`
  - `GITHUB_REPO_NAME`
  - `GITHUB_REPO_BRANCH`
  - `GITHUB_CONFIG_PATH=src/config.yaml`
- GitHub 模式默认只支持固定仓库、固定分支、固定配置路径，不做多仓库选择。

## Detailed Migration Flow
1. 建立迁移基线。
- 冻结当前 `main/dev` 分支功能，建立迁移分支。
- 记录现有行为基线：首页渲染、主题切换、搜索、`/edit` 编辑、静态构建、Docker 保存。
- 将当前文档中的“静态模式 / server 模式 / GitHub 模式”行为写成验收基线，后续逐项回归。

2. 引入新基础设施，但暂不删除 Next 代码。
- 安装新依赖：`vite`、`@vitejs/plugin-react`、`react-router-dom`、`hono`、`@hono/node-server`、`vite-tsconfig-paths`、`tsx`、`tsup`、`concurrently`。
- 安装测试依赖：`vitest`、`jsdom`、`@testing-library/react`、`@testing-library/user-event`、`@playwright/test`。
- 移除旧依赖：`next`、`eslint-config-next`、`@next/env`、`server-only`。
- 将 TypeScript 配置拆为：
  - `tsconfig.json`：共享基础配置
  - `tsconfig.client.json`：Vite/React
  - `tsconfig.server.json`：Hono/Node
- 新增 `vite.config.ts`，配置 React、路径别名、开发代理 `/api -> Hono`。
- 保留 `tailwind.config.ts` 与 `postcss.config.mjs`，仅更新扫描路径到 `src/client/**/*`、`src/shared/**/*`。

3. 重组代码目录。
- 将 `src/app/components`、`src/app/contexts`、`src/app/themes`、`src/app/icon-types.ts`、`src/app/resolve-config-icons.ts`、`src/app/types` 迁到 `src/client` 或 `src/shared`。
- 将 `src/app/api/*` 迁到 `src/server/routes/*`。
- 将 `src/server/auth.js`、`src/server/env.js`、`src/server/config-store.js`、`src/server/runtime.js` 转为 TypeScript 并保留职责。
- 新增 `src/shared/config-schema.ts`、`src/shared/config-normalize.ts`、`src/shared/config-yaml.ts`，统一 YAML 解析和序列化。
- 删除对 `src/app/load-config.ts` 的依赖，把“加载配置”拆成客户端服务和服务端服务两套入口。

4. 迁移 React 应用入口。
- 用 `index.html + src/client/main.tsx` 取代 Next `layout.tsx`。
- 用 `src/client/App.tsx` 取代 `page.tsx + layout.tsx` 的组合职责。
- 用 `react-router-dom` 创建 `HomePage`、`EditPage`、`NotFoundPage`。
- 将原本 `metadata`、主题引导脚本和全局样式迁移到：
  - `index.html`：基础 title、meta、根节点
  - `src/client/theme/theme-bootstrap.ts`：主题启动逻辑
  - `src/client/main.tsx`：挂载时执行主题初始化
- 将 `next/dynamic` 替换为 `React.lazy + Suspense`。
- 将 `next/image` 替换为标准 `<img>`，保留尺寸和降级逻辑。
- 将 `next/navigation` 依赖替换为 React Router API。

5. 迁移配置与图标加载链路。
- 共享 YAML 校验和规范化逻辑由 `src/shared` 提供，前后端共用。
- 静态模式在构建前执行 `scripts/sync-static-config.mjs`，把 `src/config.yaml` 复制到 `public/config.yaml`。
- React 前端新增 `src/client/services/config-source.ts`：
  - `static` 模式读取 `/config.yaml` 并在浏览器内解析
  - `server/github` 模式请求 `/api/config/runtime`
- 保留现有图标运行时解析能力，但全部改为客户端完成，避免再依赖 Next 服务器组件。
- 首页和编辑页都只依赖统一的 `useRuntimeConfig()` 或 loader 函数，不再直连文件系统。

6. 迁移编辑器能力。
- 保留现有 `/edit` UI、状态管理、YAML 编辑器交互和表单结构。
- 把 `canSaveToServer` 替换为通用 `Capabilities` 响应。
- 编辑器按钮按模式切换：
  - `static`：显示复制/下载 YAML
  - `server`：显示登录并保存到服务器
  - `github`：显示授权 GitHub 并发布
- 新增“发布状态”状态机，统一处理登录、授权、提交、失败提示。
- 将登录态检查从 Next API 改为 Hono `/api/session`。

7. 实现 Hono 服务。
- 新建 `src/server/index.ts` 作为 Hono 入口，开发环境监听端口，生产环境提供 API 和静态资源。
- 新建 `src/server/routes/capabilities.ts`、`config.ts`、`session.ts`、`github.ts`。
- `capabilities` 根据 `COMPASS_RUNTIME_MODE` 和环境变量返回当前可用能力。
- `config` 路由负责读取 YAML、转换 JSON、在 `server` 模式下写回文件。
- `session` 路由负责 admin token 登录和签名 cookie。
- `github` 路由负责 GitHub App OAuth state、callback、installation token、提交 `config.yaml` 到固定仓库。
- 统一错误格式：`{ error: string }`，成功格式：`{ ok: true, ... }`。

8. 完成构建与部署改造。
- 根脚本调整为：
  - `dev`：并行启动 Vite 和 Hono，默认 `server` 模式
  - `dev:static`
  - `dev:server`
  - `dev:github`
  - `build`
  - `build:static`
  - `build:server`
  - `build:github`
  - `preview`
  - `lint`
  - `test`
  - `test:e2e`
- `build:static` 流程固定为：
  - 同步 `public/config.yaml`
  - 执行 `vite build`
- `build:server` / `build:github` 流程固定为：
  - 执行 `vite build`
  - 用 `tsup` 打包 `src/server/index.ts` 到 `dist/server`
- Dockerfile 改为复制：
  - `dist/client`
  - `dist/server`
  - `src/config.yaml`
- Hono 在生产中负责：
  - 提供 `/api/*`
  - 在 `server/github` 模式下托管 `dist/client`
- 静态托管平台仅部署 `dist/client`。

9. 移除 Next 残留并收口文档。
- 删除 `next.config.mjs`、`src/app/api`、`.next` 相关构建假设、`scripts/build.mjs` 中的 API 挪移逻辑。
- 删除 `scripts/dev.mjs` 和 `scripts/server-entry.js` 的 Next 专用实现。
- 更新 `README.md`、`docs/BUILD.md`、`docs/DEV.md`，明确 Vite/Hono 的 3 模式用法。
- 补充 `.env.example`，列出 server 和 GitHub 模式必需变量。

## Dependency And Config Changes
- 删除依赖：
  - `next`
  - `eslint-config-next`
  - `@next/env`
  - `server-only`
- 保留依赖：
  - `react`
  - `react-dom`
  - `typescript`
  - `tailwindcss`
  - `postcss`
  - `js-yaml`
  - `framer-motion`
  - `lucide-react`
  - `simple-icons`
  - `radix-ui`
- 新增运行时依赖：
  - `vite`
  - `@vitejs/plugin-react`
  - `react-router-dom`
  - `hono`
  - `@hono/node-server`
- 新增构建与开发依赖：
  - `vite-tsconfig-paths`
  - `tsx`
  - `tsup`
  - `concurrently`
- 新增测试依赖：
  - `vitest`
  - `jsdom`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `@playwright/test`
- 配置文件改动：
  - 新增 `vite.config.ts`
  - 新增 `tsconfig.client.json`
  - 新增 `tsconfig.server.json`
  - 保留并修改 `tailwind.config.ts`
  - 保留 `postcss.config.mjs`
  - 删除 `next.config.mjs`

## Todo Checklist
- [ ] 建立迁移分支并记录现有行为基线
- [ ] 安装 Vite、React Router、Hono、测试依赖
- [ ] 删除 Next 相关依赖与脚本
- [ ] 拆分 TypeScript 配置为 client/server
- [ ] 新建 `vite.config.ts` 和新的 npm scripts
- [ ] 建立 `src/client`、`src/server`、`src/shared` 目录
- [ ] 迁移共享类型、主题、YAML 校验和序列化逻辑
- [ ] 迁移首页和编辑页到 React Router
- [ ] 替换 `next/dynamic`、`next/image`、`next/navigation`
- [ ] 实现静态模式 `public/config.yaml` 同步脚本
- [ ] 实现客户端配置加载服务
- [ ] 实现 Hono `capabilities`、`config`、`session` 路由
- [ ] 实现 GitHub App `connect/callback/publish` 路由
- [ ] 对接编辑器三模式按钮与状态流转
- [ ] 改造 Dockerfile 与 docker-compose
- [ ] 删除 `next.config.mjs`、旧构建脚本和 API 搬移逻辑
- [ ] 更新 README、BUILD、DEV 文档和 `.env.example`
- [ ] 补充 Vitest 单测
- [ ] 补充 Playwright 冒烟测试
- [ ] 完成三模式回归验证

## Validation And Test Plan
- 单元测试使用 `Vitest + Testing Library`，覆盖：
  - YAML 解析、规范化、序列化
  - 主题设置恢复与本地存储同步
  - 编辑器关键状态切换
  - `Capabilities` 驱动下的按钮显隐
  - Hono `config/session/github` 路由的成功与失败返回
- 接口测试使用 `Vitest` 直接调用 Hono `app.request()`，覆盖：
  - 未登录保存返回 401
  - `server` 模式写入 YAML 成功
  - `static` 模式保存接口不可用
  - GitHub 发布请求在缺少凭据、installation 无权限、仓库不存在时正确报错
- E2E 冒烟测试使用 `Playwright`，覆盖：
  - 首页加载、搜索、主题切换
  - `/edit` 表单编辑和 YAML 视图同步
  - `static` 模式下复制/下载 YAML
  - `server` 模式下登录后保存并刷新可见变更
  - `github` 模式下点击发布、跳转授权、回调后展示发布成功或失败
- 手工验证清单必须覆盖：
  - `build:static` 产物可在纯静态服务器运行
  - `build:server` Docker 容器可读取挂载 YAML
  - GitHub App 模式能向固定仓库提交 `src/config.yaml`
  - 图标解析、主题切换、移动端布局、动画开关无回归
  - 旧配置文件无需变更即可直接使用
- 迁移完成的验收标准：
  - 项目中不再存在 Next 构建依赖
  - 不再需要“构建时移走 `src/app/api`”
  - 同一套前端可在 `static/server/github` 3 模式下运行
  - YAML 仍是唯一内容源，GitHub 模式提交后能触发原有 CI/CD

## Assumptions
- 保持单仓、单应用结构，不拆成 monorepo。
- 保持 React，不迁移到 Vue。
- 本次迁移以功能对齐和三模式统一为第一目标，不追求 SSR/SSG 等价替换。
- GitHub App 模式默认只支持固定仓库、固定分支、固定路径。
- 当前 `/edit` 交互、主题系统、图标规则、YAML 格式均视为必须保留的现有契约。
