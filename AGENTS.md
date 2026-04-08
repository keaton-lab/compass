# AGENTS.md - Compass 项目智能体编码指南

**Compass** 是一个基于 Next.js 14 App Router 的个人导航仪表板，使用 YAML 配置驱动内容，支持动态图标生成和多主题。

---

## 关键命令

```bash
npm run dev     # 开发服务器（自动监视 config.yaml 变更并重新生成图标）
npm run build   # 生产构建（prebuild → generate-icons-manifest.js → next build）
npm run lint    # ESLint 检查
```

> **注意**：无测试框架，无 typecheck 脚本。

---

## 图标系统（⚠️ 重要）

图标通过 `scripts/generate-icons-manifest.js` 从 `src/config.yaml` **自动生成**到 `src/data/icons-manifest.ts`。

- **永远不要手动编辑** `src/data/icons-manifest.ts`
- 添加图标：在 `config.yaml` 中使用图标名称，`npm run dev` 自动重新生成
- **Lucide 图标**：PascalCase（如 `Calendar`, `Mail`）
- **品牌图标**：lowercase（如 `github`, `vercel`），来自 `simple-icons`
- 头像格式：`avatar: "icon:navigation"`（带 `icon:` 前缀）

---

## 配置驱动架构

所有内容来自 `src/config.yaml`：

```yaml
profile:
  name: Compass
  avatar: "icon:navigation"
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
    icon: Calendar   # Lucide
    color: "#3b82f6"
    links:
      - id: github
        name: GitHub
        url: https://github.com
        icon: github   # 品牌
```

**页面加载流程**：`page.tsx`（服务端）→ 读取 `config.yaml` → 传给 `ClientLayout` → `SettingsContext` 管理客户端状态

---

## 项目结构

```
src/
├── app/
│   ├── page.tsx             # 主页（服务端组件）
│   ├── layout.tsx           # 根布局
│   ├── components/          # React 组件（PascalCase）
│   ├── contexts/            # SettingsContext
│   ├── themes/              # light/dark/ocean 主题预设
│   ├── types/               # TypeScript 接口
│   └── globals.css          # 全局样式 + CSS 变量
├── data/
│   ├── config.yaml          # 唯一配置源
│   └── icons-manifest.ts    # 自动生成（只读）
```

---

## 代码规范

- **组件文件**：PascalCase（`NavigationCard.tsx`）
- **服务端组件**：默认无指令；客户端组件：顶部加 `"use client"`
- **相对导入**：`./` 或 `../`
- **类型导入**：`import type { Config } from './types'`
- **Tailwind CSS**：`darkMode: 'class'`（通过类名切换）
- **响应式断点**：`xsm` (390px), `sm`, `md`, `lg`, `xl`

---

## 部署

- **目标**：Cloudflare Pages（`wrangler.toml` 配置 `pages_build_output_dir = "out"`）
- **构建输出**：`out/`（Next.js 静态导出）
- **构建命令**：`npm run build`（已包含 `prebuild`）

---

## 开发陷阱速查

| 问题 | 解决 |
|------|------|
| 图标不显示 | 检查命名（Lucide 用 PascalCase，品牌图标用小写） |
| 修改 config.yaml 后图标未更新 | 确保 `npm run dev` 在运行 |
| 主题不生效 | 检查 `settings.theme` 是否为 `light`/`dark`/`ocean` |
