# AGENTS.md - Compass 项目智能体编码指南

**Compass** 是一个基于 Next.js 14 App Router 的个人导航仪表板，使用 YAML 配置驱动内容，支持动态图标生成和多主题。

---

## 关键命令

```bash
npm run dev           # 开发服务器（默认以 server 能力启动）
npm run build         # 静态导出构建（默认）
npm run build:static  # 静态导出构建
npm run build:server  # Node 服务构建
npm start             # 运行 server 模式
npm run lint    # ESLint 检查
```

> **注意**：无测试框架，无 typecheck 脚本。


## 图标系统（⚠️ 重要）

图标改为**运行时解析**，不再依赖构建前生成 manifest。

- **Lucide 图标**：PascalCase（如 `Calendar`, `Mail`）
- **品牌图标**：lowercase 或 kebab-case（如 `github`, `google-gemini`），来自 `simple-icons`
- 头像格式：`avatar: "icon:navigation"`（带 `icon:` 前缀）
- 新增图标时，直接在 YAML 中写图标名即可

---

## 配置驱动架构

所有内容来自 YAML 配置文件：

- 默认路径：`src/config.yaml`
- server 模式可通过 `COMPASS_CONFIG_PATH` 指向外挂 `config.yml`

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

**页面加载流程**：`page.tsx`（服务端）→ 读取运行时 YAML → 传给 `ClientLayout` → `SettingsContext` 管理客户端状态

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
├── config.yaml              # 默认配置文件
├── server/                  # 运行时模式与 YAML 读写
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

- **静态模式目标**：Cloudflare Pages / Netlify / 任意静态托管
- **静态构建输出**：`out/`
- **Docker 模式目标**：Node 服务 + 外挂 YAML
- **server 构建命令**：`npm run build:server`

---

## 开发陷阱速查

| 问题 | 解决 |
|------|------|
| 图标不显示 | 检查命名（Lucide 用 PascalCase，品牌图标用小写或 kebab-case） |
| Docker 模式修改 YAML 不生效 | 确认 `COMPASS_CONFIG_PATH` 指向挂载文件，刷新页面重试 |
| 主题不生效 | 检查 `settings.theme` 是否为 `light`/`dark`/`ocean` |
