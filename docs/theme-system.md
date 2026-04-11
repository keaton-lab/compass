# 主题系统文档

## 概述

Compass 当前采用 `共享主题预设 + Astro 启动脚本 + React SettingsContext + CSS 变量` 的组合方案，支持 `light`、`dark`、`ocean` 三种主题，并通过 localStorage 持久化。

## 架构总览

```text
src/shared/themes.ts
  -> 定义主题预设与颜色令牌

src/layouts/BaseLayout.astro
  -> 在 HTML 输出阶段注入主题初始化脚本与关键样式

src/client/contexts/SettingsContext.tsx
  -> 管理主题状态、持久化、跨标签页同步、DOM 应用

src/client/globals.css
  -> 提供默认变量、主题变量映射和过渡样式

src/client/components/ThemeToggle.tsx
src/client/islands/ThemeToggleIsland.tsx
  -> 提供桌面和移动端主题切换 UI
```

## 核心文件

| 文件 | 职责 |
|------|------|
| `src/shared/themes.ts` | 主题预设、默认主题、类型守卫 |
| `src/layouts/BaseLayout.astro` | 页面级主题初始化脚本、critical CSS、样式 preload |
| `src/client/contexts/SettingsContext.tsx` | 主题状态、localStorage、同标签页/跨标签页同步 |
| `src/client/globals.css` | CSS 变量、主题样式、切换过渡 |
| `src/client/components/ThemeToggle.tsx` | 主题切换 UI |
| `src/client/islands/ThemeToggleIsland.tsx` | 首页主题切换 island |
| `tailwind.config.ts` | 暴露 CSS 变量到 Tailwind 颜色系统 |

## 运行机制

### 1. 首屏主题初始化

`src/layouts/BaseLayout.astro` 会在 HTML 输出时内联一段极早执行的脚本：

- 读取 `localStorage` 中的 `compass-settings`
- 恢复上次主题
- 立刻写入 `<html data-theme="...">`
- 同步 `color-scheme`

这样首页在 CSS 外链真正生效前，也能先落到接近最终主题，减少闪烁。

### 2. Context 状态管理

`src/client/contexts/SettingsContext.tsx` 负责：

- 管理当前主题、布局、动画、搜索等设置
- 从 `localStorage` 恢复设置
- 在设置变化后写回 `localStorage`
- 通过 `storage` 和自定义事件同步主题
- 将主题同步到 DOM 的 `data-theme`、`dark` class 和 CSS 变量

### 3. CSS 变量映射

`src/client/globals.css` 定义默认变量，并为 `light`、`dark`、`ocean` 三个主题覆盖变量值。

组件统一消费这些变量，例如：

```tsx
<div className="text-[var(--text-secondary)] bg-[var(--panel)]" />
```

## ThemeToggle

`src/client/components/ThemeToggle.tsx` 提供两类展示形态：

- `compact`：紧凑型菜单切换
- `mobileOnly`：移动端弹层切换

首页通过 `ThemeToggleIsland` 把它挂载成局部 island，编辑页则继续走完整客户端状态。

## 故障排查

### 主题切换无效果

检查：

1. `<html>` 是否有正确的 `data-theme`
2. `src/client/globals.css` 是否定义了对应主题变量
3. `SettingsContext` 是否正确调用了 `applyTheme`

### 首屏主题闪烁

检查：

1. `src/layouts/BaseLayout.astro` 是否注入了主题脚本
2. localStorage 中保存的主题值是否有效
3. 首页 critical CSS 和主题变量是否保持一致

### 跨标签页不同步

检查：

1. localStorage key 是否仍为 `compass-settings`
2. `storage` 事件监听是否被移除或覆盖
3. 自定义事件 `compass-theme-sync` 是否正常触发
