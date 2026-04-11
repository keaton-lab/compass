# 迁移基线文档

**分支**: `refactor/vite-hono-migration`
**创建时间**: 2026-04-11
**目的**: 记录 Next.js 版本的行为基线,作为迁移验证依据

---

## 一、构建模式

### 1.1 静态模式 (static)
- **构建命令**: `npm run build:static`
- **产物目录**: `out/`
- **构建目标**: Next.js 静态导出 (`output: 'export'`)
- **特点**:
  - 构建脚本临时排除 `src/app/api`,避免静态导出冲突
  - 首页和 `/edit` 都预渲染
  - `/edit` 仅支持编辑和导出 YAML,无保存接口
  - 配置文件在构建时嵌入产物

### 1.2 Server 模式 (server)
- **构建命令**: `npm run build:server`
- **产物类型**: Next.js standalone
- **特点**:
  - 保留 `src/app/api` 路由
  - 运行时读取 YAML 配置
  - `/edit` 支持登录后保存到服务器
  - 必需环境变量: `COMPASS_ADMIN_TOKEN`
  - 可选环境变量: `COMPASS_SESSION_SECRET`、`COMPASS_CONFIG_PATH`
  - 默认配置路径: `src/config.yaml`

### 1.3 开发模式
- **命令**: `npm run dev`
- **默认模式**: 静态预览
- **特点**:
  - 使用 `scripts/dev.mjs` 启动
  - 支持 `dev:static`、`dev:server` 参数
  - 本地开发不提供服务器保存能力

---

## 二、核心功能清单

### 2.1 首页 (`/`)
- **服务端渲染**: 通过 `page.tsx` 服务端组件
- **配置加载**: `loadResolvedConfig()` 服务端读取 YAML
- **数据传递**: 服务端将 `profile`、`settings`、`categories` 传递给客户端
- **功能点**:
  - ✅ 显示个人信息 (name, avatar, description, bio)
  - ✅ 分类导航 (categories with color, icon)
  - ✅ 链接卡片 (links with icon, description)
  - ✅ 搜索功能 (`showSearch` 控制)
  - ✅ 主题切换 (light/dark/ocean)
  - ✅ 动画控制 (`animations` 设置)
  - ✅ 响应式布局 (xsm/sm/md/lg/xl 断点)

### 2.2 编辑器 (`/edit`)
- **服务端渲染**: 通过 `page.tsx` 服务端组件
- **配置加载**: `loadConfig()` + `loadEditCapabilities()`
- **能力检测**: `canSaveToServer` 根据构建模式返回
- **功能点**:
  - ✅ Profile 编辑 (name, avatar, description, bio, repo)
  - ✅ Settings 编辑 (theme, showSearch, layout, animations)
  - ✅ Categories 编辑 (增删改、排序)
  - ✅ Links 编辑 (增删改、排序)
  - ✅ 图标选择器 (Lucide + Simple Icons)
  - ✅ 颜色选择器
  - ✅ YAML 实时预览
  - ✅ 表单验证
  - ✅ 静态模式: 导出 YAML (复制/下载)
  - ✅ Server 模式: 登录 + 保存到服务器

### 2.3 图标系统
- **运行时解析**: 不依赖构建时生成 manifest
- **图标类型**:
  - Lucide: PascalCase (`Calendar`, `Mail`)
  - Simple Icons: lowercase/kebab-case (`github`, `google-gemini`)
- **解析位置**: 服务端 `resolve-config-icons.ts`
- **组件**: `ResolvedIcon`、`Icon`、`BrandIcon`

### 2.4 主题系统
- **主题预设**: light / dark / ocean
- **实现方式**: 
  - Tailwind `darkMode: 'class'`
  - CSS 变量定义颜色
  - Context 管理状态
- **持久化**: localStorage 存储用户选择

---

## 三、API 路由 (仅 server 模式)

### 3.1 配置管理
- **GET `/api/config`**: 获取当前配置 JSON
- **PUT `/api/config`**: 保存配置到 YAML 文件

### 3.2 会话管理
- **GET `/api/admin/session`**: 检查登录状态
- **POST `/api/admin/session`**: 登录 (验证 `COMPASS_ADMIN_TOKEN`)
- **DELETE `/api/admin/session`**: 登出

---

## 四、关键文件映射

### 4.1 应用入口
- `src/app/layout.tsx` - 根布局
- `src/app/page.tsx` - 首页
- `src/app/edit/page.tsx` - 编辑页
- `src/app/not-found.tsx` - 404 页面

### 4.2 组件目录
- `src/app/components/` - 通用组件
- `src/app/edit/components/` - 编辑器组件
- `src/app/edit/hooks/` - 编辑器 hooks
- `src/app/edit/utils/` - 编辑器工具

### 4.3 状态管理
- `src/app/contexts/SettingsContext.tsx` - 全局设置 Context

### 4.4 配置加载
- `src/app/load-config.ts` - 服务端配置加载入口
- `src/app/resolve-config-icons.ts` - 图标解析
- `src/app/icon-types.ts` - 图标类型定义

### 4.5 服务器端
- `src/server/env.js` - 环境变量管理
- `src/server/runtime.js` - 运行时模式判断
- `src/server/config-store.js` - YAML 文件读写
- `src/server/auth.js` - 认证逻辑

### 4.6 API 路由
- `src/app/api/config/route.ts` - 配置 API
- `src/app/api/admin/session/route.ts` - 会话 API

### 4.7 样式和主题
- `src/app/globals.css` - 全局样式
- `src/app/themes/index.ts` - 主题预设

### 4.8 类型定义
- `src/app/types/index.ts` - 核心类型 (Config, Profile, Settings, Category, Link)

---

## 五、环境变量

| 变量 | 说明 | 默认值 | 必需 |
|------|------|--------|------|
| `COMPASS_BUILD_TARGET` | 构建目标 | `static` | 否 |
| `COMPASS_CONFIG_PATH` | 配置文件路径 | `src/config.yaml` | 否 |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 | - | server 模式必需 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥 | 随机生成 | 否 |

---

## 六、依赖清单

### 6.1 运行时依赖
- `next`: 14.2.35
- `react`: 18.3.1
- `react-dom`: 18.3.1
- `framer-motion`: ^11.18.2
- `js-yaml`: ^4.1.0
- `lucide-react`: ^1.7.0
- `simple-icons`: ^16.14.0
- `radix-ui`: ^1.4.3

### 6.2 开发依赖
- `typescript`: ^5
- `tailwindcss`: ^3.4.1
- `postcss`: ^8
- `eslint`: ^8
- `eslint-config-next`: 14.2.35
- `server-only`: ^0.0.1
- `@types/*` 系列

---

## 七、验证清单

迁移完成后需回归验证:

### 7.1 静态模式
- [ ] `npm run build:static` 成功生成 `out/` 目录
- [ ] 静态服务器能正常托管 `out/`
- [ ] 首页正常显示配置内容
- [ ] `/edit` 可编辑并导出 YAML
- [ ] 图标正常显示 (Lucide + Simple Icons)
- [ ] 主题切换正常
- [ ] 搜索功能正常
- [ ] 响应式布局正常

### 7.2 Server 模式
- [ ] `npm run build:server` 成功生成 standalone 产物
- [ ] Docker 镜像构建成功
- [ ] 容器启动时校验 `COMPASS_ADMIN_TOKEN`
- [ ] 配置从挂载文件读取
- [ ] `/edit` 登录流程正常
- [ ] 保存配置到服务器成功
- [ ] 刷新页面后变更生效

### 7.3 跨模式一致性
- [ ] 相同 `config.yaml` 在两个模式下渲染一致
- [ ] 主题系统行为一致
- [ ] 图标解析规则一致
- [ ] 编辑器 UI 一致

---

## 八、已知限制

1. **无测试**: 当前项目没有自动化测试
2. **无 GitHub 模式**: 当前只有 static 和 server 两种模式
3. **无类型检查脚本**: 没有 `typecheck` npm script
4. **构建脚本复杂**: `scripts/build.mjs` 需要临时移动 API 目录
5. **开发模式受限**: 本地开发无法测试 server 模式保存功能

---

**文档维护**: 迁移过程中如有发现遗漏或变化,请及时更新此文档。
