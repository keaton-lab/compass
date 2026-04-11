# 主题系统文档

## 概述

Compass 当前采用 `shared 主题预设 + client Context + CSS 变量` 的组合方案，支持 `light`、`dark`、`ocean` 三种主题，并通过 localStorage 持久化。

## 架构总览

```text
src/shared/themes.ts
  -> 定义主题预设与颜色令牌

src/client/contexts/SettingsContext.tsx
  -> 管理主题状态、持久化、跨标签页同步、DOM 应用

src/client/globals.css
  -> 提供默认变量、主题变量映射和过渡样式

src/client/components/ThemeToggle.tsx
  -> 提供主题切换 UI

src/client/main.tsx
  -> 首屏挂载前写入 data-theme，减少闪烁
```

## 核心文件

| 文件 | 职责 |
|------|------|
| `src/shared/themes.ts` | 主题预设、默认主题、类型守卫 |
| `src/client/contexts/SettingsContext.tsx` | 主题状态、localStorage、跨标签页同步 |
| `src/client/globals.css` | CSS 变量、主题样式、切换过渡 |
| `src/client/components/ThemeToggle.tsx` | 默认/紧凑/移动端主题切换 UI |
| `src/client/main.tsx` | 启动前设置 `data-theme` |
| `tailwind.config.ts` | 暴露 CSS 变量到 Tailwind 颜色系统 |

## 主题预设

主题定义位于 `src/shared/themes.ts`，每个主题包含：
- `id`
- `label`
- `isDark`
- `colors`
- `iconColors`

其中 `colors` 会映射到：
- `--background`
- `--foreground`
- `--panel`
- `--panel-strong`
- `--panel-border`
- `--muted`
- `--text-primary`
- `--text-secondary`
- `--bg-secondary`
- `--accent`
- `--accent-alpha`
- `--accent-border`

## 运行机制

### 1. 首屏主题初始化

`src/client/main.tsx` 会在 React 挂载前读取本地保存的主题，并立即设置到 `document.documentElement.dataset.theme`，尽量减少首屏主题闪烁。

### 2. Context 状态管理

`src/client/contexts/SettingsContext.tsx` 负责：
- 管理当前主题、布局、动画、搜索等设置
- 从 `localStorage` 恢复设置
- 在设置变化后写回 `localStorage`
- 监听 `storage` 事件实现跨标签页同步
- 将主题同步到 DOM 的 `data-theme`、`dark` class 和 CSS 变量

### 3. CSS 变量映射

`src/client/globals.css` 定义默认变量，并为 `light`、`dark`、`ocean` 三个主题分别覆盖变量值。

组件统一消费这些变量，例如：

```tsx
<div className="text-[var(--text-secondary)] bg-[var(--panel)]" />
```

## ThemeToggle

`src/client/components/ThemeToggle.tsx` 提供三种模式：
- 默认模式：桌面固定按钮组
- `compact`：紧凑下拉菜单
- `mobileOnly`：移动端弹层切换

切换主题后会调用 `setTheme()`，由 Context 完成状态更新与 DOM 应用。

## 新增主题

如需新增主题，按这个顺序修改：

1. 在 `src/shared/themes.ts` 中新增 `ThemePreset`
2. 在 `src/shared/types.ts` 中确认 `ThemePreset['id']` 覆盖新主题
3. 在 `src/client/globals.css` 中添加对应 `[data-theme='...']` 变量映射
4. 确认 `ThemeToggle` UI 是否需要新的图标或文案

## 故障排查

### 主题切换无效果

检查：
1. `<html>` 是否有正确的 `data-theme`
2. `src/client/globals.css` 是否定义了对应主题变量
3. `SettingsContext` 是否正确调用了 `applyTheme`

### 首屏主题闪烁

检查：
1. `src/client/main.tsx` 是否在挂载前设置了 `data-theme`
2. localStorage 中保存的主题值是否有效
3. 是否有同步逻辑覆盖了启动阶段的主题

### 跨标签页不同步

检查：
1. localStorage key 是否仍为 `compass-settings`
2. `storage` 事件监听是否被移除或覆盖
3. 新增字段是否经过了 `normalizeSettings`
