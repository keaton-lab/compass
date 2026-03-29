# AGENTS.md - Compass项目智能体编码指南

## 项目概述

**Compass** 是一个基于 Next.js 14 App Router 构建的应用程序，使用 TypeScript、Tailwind CSS 和 Framer Motion。它作为一个带有动画UI组件的仪表板/导航界面。

- **框架**: Next.js 14.2.13 (App Router)
- **语言**: TypeScript（严格模式启用）
- **样式**: Tailwind CSS 3，带有自定义主题
- **动画**: Framer Motion 用于弹簧动画
- **图标**: Lucide React 图标
---

## 构建与开发命令

```bash
# 开发服务器
npm run dev          # http://localhost:3000

# 生产构建
npm run build        # 创建 .next/ 目录

# 启动生产服务器
npm run start        # 运行构建后的应用

# 代码检查
npm run lint         # 运行 Next.js ESLint

# 注意：尚未配置测试框架
```

## 代码风格指南

### 导入约定
- **仅使用相对导入**: 使用 `./` 或 `../`；路径别名 `@/*`（映射到 `src/*`）已配置但尚未使用。
- **包的命名导入**: `import { motion } from 'framer-motion'`
- **本地组件的默认导入**: `import LikeButton from "./like-button"`
- **类型导入**: 始终使用 `import type` 导入 TypeScript 类型：
  ```typescript
  import type { Link } from '../types'
  ```

### 命名约定
- **组件**: 帕斯卡命名法 (`NavigationCard`, `CategorySection`)
- **组件文件**: 组件使用帕斯卡命名法 (`NavigationCard.tsx`)，工具文件使用短横线命名法 (`like-button.tsx`)
- **变量/函数**: 驼峰命名法 (`iconMap`, `handleClick`)
- **接口/类型**: 帕斯卡命名法 (`Link`, `Category`, `TitleContextType`)
- **常量**: 驼峰命名法 (`containerVariants`, `itemVariants`)

### TypeScript 使用
- **严格模式**: 启用（tsconfig.json 中 `strict: true`）
- **不使用 `any`**: 避免使用 `any`；使用正确的类型
- **接口用于数据模型**（优先于 `type` 别名）
- **内联属性接口**用于简单组件：
  ```typescript
  interface NavigationCardProps {
    link: Link;
    color: string;
  }
  ```

### React 组件
- **服务端组件**: 默认（无指令）用于页面/布局
- **客户端组件**: 在顶部添加 `'use client'` 指令以实现交互性
- **默认导出**: 所有组件使用 `export default function ComponentName()`
- **函数声明**: 使用常规函数，而非箭头函数
- **属性解构**: 在函数参数中解构属性

### 错误处理
- 当前实现的最少错误处理
- 自定义钩子验证模式：
  ```typescript
  if (context === undefined) {
    throw new Error('useTitle must be used within a TitleProvider');
  }
  ```
- 未发现 `try/catch` 块或自定义错误类

### 样式与动画
- **Tailwind CSS**: 实用类优先，带有自定义主题于 `tailwind.config.ts`
- **自定义颜色**: 使用 CSS 变量 (`--background`, `--foreground`)
- **Framer Motion**:
  - 用于交错动画的动画变体
  - 弹簧过渡：`{ type: 'spring', stiffness: 400, damping: 25 }`
  - 手势：`whileHover`, `whileTap`, `whileInView`
- **响应式设计**: Tailwind 断点 (`md:`, `lg:`, `xl:`)

## 项目结构

```
compass/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── components/      # React 组件
│   │   │   ├── NavigationCard.tsx
│   │   │   └── CategorySection.tsx
│   │   ├── fonts/          # Geist 字体文件
│   │   ├── nlp/            # （当前为空）
│   │   ├── types/          # TypeScript 接口
│   │   │   └── index.ts
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页
│   │   ├── like-button.tsx # 示例组件
│   │   └── title-context.tsx # React Context
│   └── data/               # 静态数据
│       └── config.json     # 仪表板配置
├── public/                 # 静态资源
└── 根配置文件             # 参见配置文件部分
```

## 配置文件参考

| 文件 | 用途 |
|------|------|
| `package.json` | 依赖项，npm 脚本 |
| `tsconfig.json` | TypeScript 配置，路径别名 `@/*` |
| `.eslintrc.json` | ESLint 规则（Next.js + TypeScript） |
| `tailwind.config.ts` | Tailwind 主题，内容路径 |
| `postcss.config.mjs` | PostCSS 与 Tailwind 插件 |
| `next.config.mjs` | Next.js 配置 |
| `wrangler.toml` | Cloudflare Pages 部署配置 |
| `.gitignore` | Git 忽略模式 |

## 开发工作流程

### 1. 开始开发
```bash
npm run dev
```
- 打开 `http://localhost:3000`
- 启用热重载
- 开发期间运行 ESLint

### 2. 进行更改
- **新组件**: 放置在 `src/app/components/` 中，使用帕斯卡命名法文件名
- **数据更改**: 更新 `src/data/config.json` 以修改仪表板内容
- **样式**: 使用 Tailwind 类；如需可扩展 `tailwind.config.ts` 中的主题
- **动画**: 为复杂动画添加 Framer Motion 变体

### 3. 代码质量
- **代码检查**: 提交前运行 `npm run lint`
- **类型检查**: TypeScript 严格模式在开发期间捕获错误
- **无 Prettier**: 格式化由 ESLint/编辑器处理；如需可添加 `.prettierrc`

### 4. 生产构建
```bash
npm run build
```
- 输出到 `.next/` 目录
- 页面的静态优化
- TypeScript 编译

## 测试（尚未配置）

**当前状态**: 未配置测试框架。
- 无 `*.test.*` 或 `*.spec.*` 文件
- package.json 中无测试脚本
- 无 Jest/Vitest 配置

**给智能体的建议**: 如需添加测试，考虑：
1. 安装 Jest + React Testing Library 或 Vitest
2. 向 package.json 添加 `test` 脚本
3. 遵循现有组件模式用于测试结构

## 智能体特定注意事项

### 智能体应了解的事项
1. **路径别名**: 已配置但未使用；目前优先使用相对导入
2. **客户端边界**: 为交互式组件标记 `'use client'` 指令
3. **动画性能**: 使用 Framer Motion 的 `motion` 组件实现流畅动画
4. **类型安全**: 利用 TypeScript 接口；避免 `any` 类型
5. **数据结构**: 为新功能遵循 `src/app/types/index.ts` 接口

### 应遵循的常见模式
- **组件组合**: 使用 CategorySection + NavigationCard 模式
- **动画变体**: 为复杂动画定义变体对象
- **图标映射**: 通过 `iconMap` 对象将字符串图标映射到 Lucide 组件
- **响应式网格**: 使用具有断点的 Tailwind 网格实用类

### 应避免的陷阱
- ❌ 使用 `any` 类型（已启用严格 TypeScript）
- ❌ 缺少交互式组件的 `'use client'` 指令
- ❌ 文件名大小写不一致（对组件坚持使用帕斯卡命名法）
- ❌ 硬编码颜色（使用主题变量或 Tailwind 类）

## 环境与依赖

- **Node.js**: 未指定版本；使用 LTS 版本
- **npm**: 包管理器（存在 lockfile）
- **关键依赖**: Next.js、React、Tailwind、Framer Motion、Lucide
- **开发依赖**: TypeScript、ESLint、@types 包

## 部署

- **目标**: Cloudflare Pages（配置于 `wrangler.toml`）
- **构建输出**: `.vercel/output/static` 目录
- **兼容性**: 启用 `nodejs_compat` 标志

---

*本文档最后更新：2026年3月29日*  
*有关此项目结构的疑问，请参考 [README.md](./README.md) 或检查源代码模式。*