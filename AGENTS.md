# AGENTS.md - Compass 项目智能体编码指南

**Compass** 是一个基于 Next.js 14 App Router 的个人导航仪表板，使用 YAML 配置驱动内容，支持动态图标生成和多主题。

---

## 关键命令

```bash
npm run dev     # 开发服务器（自动监视配置变更并重新生成图标）
npm run build   # 生产构建（先执行 prebuild 生成图标清单）
npm run lint    # ESLint 检查
```

> **注意**：无测试框架，无 typecheck 脚本（依靠 IDE/编辑器检查）。

---

## 图标系统（⚠️ 重要）

图标通过 `scripts/generate-icons-manifest.js` 从 `src/data/config.yaml` **自动生成**到 `src/data/icons-manifest.ts`。

- **永远不要手动编辑** `src/data/icons-manifest.ts`
- 添加图标：在 `config.yaml` 中使用图标名称，开发服务器自动重新生成
- **Lucide 图标**：使用 PascalCase（如 `Calendar`, `Mail`, `MessageSquare`）
- **品牌图标**：使用 lowercase（如 `github`, `vercel`, `youtube`），来自 `simple-icons`
- 图标引用格式：
  - 链接/分类图标：直接写名称（如 `icon: Mail`）
  - 头像：`avatar: "icon:navigation"`（带 `icon:` 前缀）

---

## 配置驱动架构

所有内容来自 `src/data/config.yaml`：

```yaml
profile:
  name: Compass
  avatar: "icon:navigation"  # 支持 icon: 前缀
  description: ...
  bio: ...
  repo: "https://github.com/..."

settings:
  theme: dark        # light | dark | ocean
  showSearch: true
  layout: grid       # grid | list
  animations: true

categories:
  - id: daily
    name: Daily
    icon: Calendar   # Lucide 图标
    color: "#3b82f6"
    links:
      - id: github
        name: GitHub
        url: https://github.com
        icon: github   # 品牌图标（simple-icons）
        description: 代码托管平台
```

**页面加载流程**：
1. `page.tsx`（服务端组件）读取 `config.yaml`
2. 传递数据给 `ClientLayout`（客户端组件）
3. `ClientLayout` 使用 `SettingsContext` 管理主题、搜索等客户端状态

---

## 项目结构

```
src/
├── app/
│   ├── components/          # React 组件（PascalCase 文件名）
│   ├── contexts/            # React Context（SettingsContext）
│   ├── themes/              # 主题预设（light/dark/ocean）
│   ├── types/               # TypeScript 接口
│   ├── globals.css          # 全局样式 + CSS 变量
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 主页（服务端，加载 YAML）
│   └── edit/                # 编辑页面
├── data/
│   ├── config.yaml          # 应用配置（内容源）
│   └── icons-manifest.ts    # 生成的图标清单（只读）
```

---

## 代码规范

### 命名
- **组件文件**：PascalCase（如 `NavigationCard.tsx`）
- **工具文件**：kebab-case（如 `like-button.tsx`）
- **类型/接口**：PascalCase
- 使用函数声明而非箭头函数

### 导入
- 相对导入：`./` 或 `../`（`@/*` 已配置但未使用）
- 类型导入：`import type { Config } from './types'`

### React
- **服务端组件**：默认（无指令）
- **客户端组件**：顶部添加 `"use client"`
- 交互组件需要显式标记客户端边界

### TypeScript
- 严格模式启用
- 避免使用 `any`
- 使用接口定义数据模型

---

## 样式与主题

- **Tailwind CSS**：utility-first，自定义主题在 `tailwind.config.ts`
- **暗色模式**：`darkMode: 'class'`（通过类名切换）
- **CSS 变量**：`var(--background)`, `var(--foreground)` 等
- **主题预设**：`src/app/themes/index.ts` 定义 light/dark/ocean 三种主题
- **响应式断点**：`xsm` (390px), `sm`, `md`, `lg`, `xl`
- **玻璃拟态**：使用 `glass-panel`, `glass-panel-strong` 类

---

## 部署

- **目标**：Cloudflare Pages（配置于 `wrangler.toml`）
- **构建输出**：`.vercel/output/static`
- **兼容性标志**：`nodejs_compat`

---

## 开发陷阱速查

| 问题 | 解决 |
|------|------|
| 图标不显示 | 检查命名是否正确（Lucide 用 PascalCase，品牌图标用小写） |
| 修改 config.yaml 后图标未更新 | 确保开发服务器在运行（`npm run dev` 会监视文件变更） |
| 类型错误 | 确保接口与 `config.yaml` 结构匹配，定义在 `src/app/types/index.ts` |
| 主题不生效 | 检查 `settings.theme` 值是否为 `light`/`dark`/`ocean` 之一 |

---

## 新功能开发检查清单

- [ ] 如需新图标，先添加到 `config.yaml` 并重启开发服务器
- [ ] 客户端状态使用 `SettingsContext`
- [ ] 服务端数据通过 props 从 `page.tsx` 传递给 `ClientLayout`
- [ ] 动画使用 Framer Motion，优先使用 spring 过渡
