# Compass 迁移基线与实施进度

## 文档说明
- 本文档已合并原 `docs/migration-baseline.md` 与 `docs/refactoring.md`。
- 分支：`refactor/vite-hono-migration`
- 最近核对时间：`2026-04-11`
- 目的：
  - 保留 Next.js 版本的迁移验收基线
  - 记录目标架构与实施范围
  - 对照当前分支真实代码状态，标记已完成、部分完成、未完成事项

## 迁移目标
- 将当前 `Next.js 14 App Router + 双构建模式` 迁移为 `Vite + React SPA + Hono API/BFF`
- 统一运行模式为：
  - `static`：静态托管，前端读取 `/config.yaml`
  - `server`：Hono 提供 API，运行时读写 YAML
  - `github`：Hono 负责 GitHub OAuth / 发布工作流
- 继续以 `YAML / Git` 作为唯一真源，不引入数据库
- 保持单仓库、单应用结构，不拆成 monorepo

## 迁移验收基线

### 旧版关键行为
- 首页：
  - 显示个人信息、分类导航、链接卡片
  - 支持搜索、主题切换、动画开关、响应式布局
- 编辑页 `/edit`：
  - 支持 Profile / Settings / Categories / Links 编辑
  - 支持图标选择、颜色选择、YAML 预览、表单校验
  - `static` 模式导出 YAML
  - `server` 模式登录后保存到服务器
- 图标系统：
  - Lucide 使用 PascalCase
  - 品牌图标使用 lowercase / kebab-case
  - 头像支持 `icon:` 前缀
- 主题系统：
  - `light` / `dark` / `ocean`
  - 客户端状态持久化到 localStorage

### 旧版模式基线
- `static`
  - 构建命令：`npm run build:static`
  - 仅导出静态页面
  - `/edit` 仅支持导出 YAML
- `server`
  - 构建命令：`npm run build:server`
  - 运行时读取 YAML
  - `/edit` 支持登录并保存
- `dev`
  - 旧版本默认偏向静态预览
  - 本地开发无法完整覆盖 server 保存链路

## 目标架构

### 目录结构
- `src/client/`：React 前端应用、页面、路由、组件、上下文
- `src/server/`：Hono 服务入口、路由、认证、配置读写、GitHub 集成
- `src/shared/`：类型、主题、YAML 解析与序列化、图标解析
- `public/config.yaml`：默认配置
- `public/`：静态资源与静态模式暴露的 `config.yaml`
- `scripts/`：开发与构建辅助脚本

### 前后端接口
- React Router 路由：
  - `/`
  - `/edit`
  - `*`
- Hono API：
  - `GET /api/capabilities`
  - `GET /api/config/runtime`
  - `GET /api/config/source`
  - `PUT /api/config/file`
  - `GET /api/session`
  - `POST /api/session`
  - `DELETE /api/session`
  - `GET /api/github/connect`
  - `GET /api/github/callback`
  - `POST /api/github/publish`

### 核心共享接口
- `Config`
- `Profile`
- `Settings`
- `Category`
- `Link`
- `RuntimeMode = 'static' | 'server' | 'github'`
- `Capabilities`
- `GithubPublishPayload`

### 环境变量
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
- `GITHUB_CONFIG_PATH`

## 当前分支真实状态

### 已落地实现
- 已引入 `Vite`、`React Router`、`Hono`、`tsup`、`tsx`
- 已拆分 `tsconfig.json`、`tsconfig.client.json`、`tsconfig.server.json`
- 已建立 `src/client`、`src/server`、`src/shared`
- 已新增 `vite.config.ts`
- 已实现静态模式 `scripts/sync-static-config.mjs`
- 已实现客户端配置加载服务 `src/client/services/config-source.ts`
- 已实现 `capabilities`、`config`、`session` 路由
- 已实现首页与基础路由切换
- 已改造 `Dockerfile`、`docker-compose.yml`、`.env.example`
- 已更新 `README.md`、`docs/BUILD.md`、`docs/DEV.md`

### 当前分支与目标仍有差距
- `/edit` 已迁移为简化版 YAML 编辑器，但尚未恢复旧版可视化编辑能力
- GitHub 模式已具备 OAuth 连接与固定仓库发布能力，但仍缺少端到端回归验证
- 自动化测试依赖已安装，但仓库中没有 Vitest / Playwright 用例

## 进度清单

### 已完成
- [x] 建立迁移分支并记录现有行为基线
- [x] 安装 Vite、React Router、Hono、测试依赖
- [x] 拆分 TypeScript 配置为 client/server
- [x] 建立 `src/client`、`src/server`、`src/shared` 目录
- [x] 迁移共享类型、主题、YAML 校验和序列化逻辑
- [x] 迁移首页和编辑页到 React Router
- [x] 实现静态模式 `public/config.yaml` 同步脚本
- [x] 实现客户端配置加载服务
- [x] 实现 Hono `capabilities`、`config`、`session` 路由
- [x] 恢复 `lint`、`typecheck`、`build:server`
- [x] 改造 Dockerfile 与 docker-compose
- [x] 删除 `next.config.mjs`、旧构建脚本和 API 搬移逻辑
- [x] 删除 `src/app/` 与旧的 `src/server/*.js` 迁移残留
- [x] 将 `npm run dev` 改造为单端口 Hono + Vite middleware 开发模式

### 部分完成
- [ ] 删除 Next 相关依赖与脚本
  - 运行时代码已清理完毕，但仍缺少对“迁移完全收口”的最终验收
- [ ] 对接编辑器三模式按钮与状态流转
  - 按钮已出现，但登录、GitHub 发布、可视化编辑状态机未闭环
- [ ] 更新 README、BUILD、DEV 文档和 `.env.example`
  - 文档已迁移到新架构，但仍有少量描述和实际脚本不一致

### 部分完成（功能）
- [ ] 实现 GitHub App `connect/callback/publish` 路由
  - 已完成固定仓库的 OAuth 连接与发布接口，但仍未按 “GitHub App installation token” 方案实现
- [ ] 完成三模式回归验证
  - `static`、`server` 已完成构建级验证，`github` 缺少真实联调验证

### 未完成
- [ ] 补充 Vitest 单测
- [ ] 补充 Playwright 冒烟测试

## 验证结果

### 已验证命令
- `npm run dev`
  - 结果：成功
  - 说明：单端口开发服务器正常启动，首页与 `/api/capabilities` 均可通过 `:3000` 访问
- `npm run build:static`
  - 结果：成功
  - 说明：可产出 `dist/client/`
- `npm run build:server`
  - 结果：成功
  - 说明：可产出 `dist/server/`
- `npm run lint`
  - 结果：成功
  - 说明：已切换到 TypeScript ESLint
- `npm run typecheck`
  - 结果：成功
- `npm test -- --run`
  - 结果：失败
  - 原因：没有测试文件

### 模式验收状态
- `static`
  - `build:static` 已通过
  - 页面构建成功
  - 仍缺少静态托管与 `/edit` 实操回归
- `server`
  - 构建已通过
  - `/edit` 已支持登录后保存
  - Docker 文件已改造，但尚未完成容器级验证
- `github`
  - OAuth 连接和固定仓库发布接口已实现
  - 尚未完成真实 GitHub 环境联调

## 后续建议

### 第一优先级
- 完成 GitHub 模式真实联调，确认 OAuth 回调与发布链路可用
- 恢复编辑器的可视化能力与模式状态机
- 补齐 Docker 容器级验证，确认 `dist/server/index.mjs` 启动链路正常

### 第二优先级
- 补充 GitHub 发布失败态、断开连接、结果回显等细节体验
- 增加 `static` / `server` / `github` 模式的手工验证记录
- 评估并优化 `simple-icons` 产物体积

### 第三优先级
- 补充 Vitest 与 Playwright 冒烟测试
- 完成 `static` / `server` / `github` 三模式完整回归验证

## 验收标准
- 项目不再依赖 Next 构建链路
- 不再保留 `src/app/` 的迁移残留作为主路径
- `static` / `server` / `github` 三模式均可构建并完成基本回归
- YAML 继续作为唯一内容源

## 迁移假设
- 保持单仓、单应用结构，不拆成 monorepo。
- 保持 React，不迁移到 Vue。
- 本次迁移以功能对齐和三模式统一为第一目标，不追求 SSR/SSG 等价替换。
- GitHub App 模式默认只支持固定仓库、固定分支、固定路径。
- 当前 `/edit` 交互、主题系统、图标规则、YAML 格式均视为必须保留的现有契约。
