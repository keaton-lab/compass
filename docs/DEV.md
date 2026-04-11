# 本地开发

## 环境要求

- Node.js `>= 22.12.0`
- npm `>= 10`

```bash
npm install
```

## 启动开发服务器

### Server 模式

```bash
npm run dev
```

行为：

- `/` 通过 Astro SSR 渲染
- `/edit` 作为独立页面加载编辑器
- `/api/*` 可直接联调
- 默认注入 `COMPASS_ADMIN_TOKEN=dev-token`

### Static 模式

```bash
npm run dev:static
```

行为：

- 首页按静态模式读取构建期配置
- `/edit` 只保留本地编辑与导出 YAML
- 可用来验证纯静态托管场景

## 生产构建验证

```bash
npm run typecheck
npm run lint
npm run build:static
npm run build:server
```

## 能力说明

### 保存到服务器

满足以下条件后可用：

- 运行在 `server` 模式
- 配置了 `COMPASS_ADMIN_TOKEN`
- 已在编辑器中登录

### GitHub 发布

GitHub 发布不再是独立运行模式，而是 `server` 模式下的可选能力。

满足以下条件后可用：

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`

## 配置文件

- 默认路径：`public/config.yaml`
- 可通过 `COMPASS_CONFIG_PATH` 指向外挂 YAML
- 开发时 `npm run sync:static` 会把 `public/config.local.yaml` 同步到 `public/config.yaml`

## 目录结构

```text
src/
├── layouts/          # Astro 布局
├── pages/            # 页面与 API 路由
├── client/           # React 组件、islands、编辑器
├── server/           # 运行时能力与 YAML 读写
└── shared/           # 共享类型、主题、图标解析
```
