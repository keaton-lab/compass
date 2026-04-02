# 主题系统文档

## 概述

Compass 采用 **CSS 变量 + data-attribute + React Context** 的多层主题方案，支持浅色、深色和海洋三种主题切换，并具备持久化和跨标签页同步能力。

---

## 架构总览

```
主题预设定义 (themes/index.ts)
        ↓
React Context 状态管理 (contexts/SettingsContext.tsx)
        ↓
CSS 自定义属性切换 (globals.css + layout.tsx)
        ↓
组件消费主题变量 (各组件通过 var(--xxx) 使用)
```

---

## 1. 主题预设定义

**文件位置**: `src/app/themes/index.ts`

定义了 3 个主题预设，每个预设包含 10 个颜色变量：

| 预设 | ID | 说明 |
|------|----|------|
| Light | `light` | 浅色主题（默认） |
| Dark | `dark` | 深色主题 |
| Ocean | `ocean` | 海洋浅色主题 |

### 颜色变量

每个预设的 `colors` 对象包含以下变量：

```typescript
colors: {
  background: string;      // 主背景色
  foreground: string;      // 主文本色
  panel: string;           // 毛玻璃面板背景
  panelStrong: string;    // 强化毛玻璃面板背景
  panelBorder: string;    // 面板边框色
  muted: string;           // 次要文本色
  gridLine: string;        // 背景网格线颜色
  glowA: string;           // 光晕效果 A
  glowB: string;           // 光晕效果 B
}
```

其中 `isDark` 字段用来控制是否在 `<html>` 元素上添加 `dark` class（配合 Tailwind 的 `darkMode: 'class'` 使用）。

---

## 2. 状态管理

**文件位置**: `src/app/contexts/SettingsContext.tsx`

这是主题系统的核心控制器，职责包括：

### 2.1 持久化存储

设置保存在 `localStorage`（key 为 `compass-settings`），通过 `getInitialSettings()` 在组件挂载时 hydrate。

```typescript
function getInitialSettings(): Settings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem('compass-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}
```

### 2.2 跨标签页同步

监听 `StorageEvent`，当其他标签页修改设置时自动同步：

```typescript
useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'compass-settings' && event.newValue) {
      try {
        const newSettings = JSON.parse(event.newValue);
        setSettings(newSettings);
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### 2.3 主题应用函数

`applyTheme()` 函数负责将主题应用到 DOM：

```typescript
function applyTheme(theme: Settings['theme']) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const themePreset = getThemePreset(theme);

  root.dataset.theme = themePreset.id;
  root.classList.toggle('dark', themePreset.isDark);
}
```

当 `settings.theme` 变化时，自动调用 `applyTheme`：

```typescript
useEffect(() => {
  applyTheme(settings.theme);
}, [settings.theme]);
```

这个函数做两件事：
- 设置 `<html>` 的 `data-theme` 属性 → 触发 CSS 变量切换
- 切换 `dark` class → 触发 Tailwind `dark:` 前缀样式

---

## 3. CSS 层

**文件位置**: `src/app/globals.css`

这是实际的颜色映射层。每个主题对应一个 CSS 属性选择器，将 CSS 自定义变量映射到具体颜色值：

### 3.1 Light 主题

```css
[data-theme='light'] {
  --background: #f6f8fb;
  --foreground: #08111f;
  --panel: rgba(255, 255, 255, 0.78);
  --panel-strong: rgba(255, 255, 255, 0.9);
  --panel-border: rgba(15, 23, 42, 0.08);
  --muted: #516076;
  --grid-line: rgba(58, 76, 103, 0.06);
  --glow-a: rgba(41, 121, 255, 0.08);
  --glow-b: rgba(0, 229, 255, 0.07);
}
```

### 3.2 Dark 主题

```css
[data-theme='dark'] {
  --background: #020617;
  --foreground: #e2e8f0;
  --panel: rgba(15, 23, 42, 0.6);
  --panel-strong: rgba(15, 23, 42, 0.8);
  --panel-border: rgba(148, 163, 184, 0.1);
  --muted: #94a3b8;
  --grid-line: rgba(148, 163, 184, 0.08);
  --glow-a: rgba(59, 130, 246, 0.15);
  --glow-b: rgba(139, 92, 246, 0.12);
}
```

### 3.3 Ocean 主题

```css
[data-theme='ocean'] {
  --background: #f0f9ff;
  --foreground: #0c4a6e;
  --panel: rgba(224, 242, 254, 0.7);
  --panel-strong: rgba(186, 230, 253, 0.85);
  --panel-border: rgba(14, 165, 233, 0.12);
  --muted: #334155;
  --grid-line: rgba(14, 165, 233, 0.08);
  --glow-a: rgba(6, 182, 212, 0.1);
  --glow-b: rgba(99, 102, 241, 0.08);
}
```

### 3.4 CSS 变量使用

这些 CSS 变量被广泛使用在：

- `body` 的 `background`、`color`
- 背景的网格线、光晕渐变
- `.glass-panel` / `.glass-panel-strong` 毛玻璃组件样式
- 各组件内联使用 `text-[var(--muted)]`、`text-[var(--foreground)]` 等 Tailwind 任意值语法

---

## 4. Tailwind 配合

**文件位置**: `tailwind.config.ts`

```typescript
darkMode: 'class',
theme: {
  extend: {
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
    },
  },
},
```

- `darkMode: 'class'`：使 Tailwind 的 `dark:` 前缀响应 `<html>` 上的 `.dark` class
- `background` 和 `foreground` 被注册为 Tailwind 颜色，可直接用 `bg-background`、`text-foreground`
- 其余变量（`--panel`、`--muted` 等）则通过 Tailwind 的任意值语法 `var(--xxx)` 使用

---

## 5. 用户交互

**文件位置**: `src/app/components/ThemeToggle.tsx`

`ThemeToggle` 组件提供三种渲染模式：

| 模式 | props | 说明 |
|------|-------|------|
| 默认模式 | 无 | 移动端弹出层 + 桌面端固定胶囊栏 |
| 紧凑模式 | `compact` | 桌面端下拉面板 |
| 仅移动端 | `mobileOnly` | 仅在移动端显示按钮 |

切换时调用 `setTheme(themeId)` → 更新 Context state → 触发 `applyTheme()` → CSS 变量自动切换，页面平滑过渡（body 有 `transition-colors duration-300`）。

---

## 6. 防闪烁机制

**文件位置**: `src/app/layout.tsx`

```typescript
<body className="transition-colors duration-300 [&:has(.theme-flash-fix)]:opacity-100 [&:not(:has(.theme-flash-fix))]:opacity-0">
```

默认 body 透明度为 0，只有在子元素存在 `.theme-flash-fix` class 时才可见。这避免了服务端渲染的默认主题与客户端 hydrate 后的 localStorage 主题不一致时的闪烁问题。

`.theme-flash-fix` 元素在 `SettingsContext` 组件挂载后被添加，确保主题已正确应用后再显示内容。

---

## 7. 添加新主题

### 7.1 在 `src/app/themes/index.ts` 中定义新主题

```typescript
export const customTheme: ThemePreset = {
  id: 'custom',
  name: '自定义主题',
  isDark: false,
  colors: {
    background: '#ffffff',
    foreground: '#000000',
    panel: 'rgba(255, 255, 255, 0.8)',
    panelStrong: 'rgba(255, 255, 255, 0.95)',
    panelBorder: 'rgba(0, 0, 0, 0.1)',
    muted: '#666666',
    gridLine: 'rgba(0, 0, 0, 0.05)',
    glowA: 'rgba(255, 0, 0, 0.1)',
    glowB: 'rgba(0, 0, 255, 0.1)',
  },
};

// 更新 THEME_PRESETS 数组
export const THEME_PRESETS: ThemePreset[] = [
  lightTheme,
  darkTheme,
  oceanTheme,
  customTheme, // 添加新主题
];
```

### 7.2 在 `src/app/globals.css` 中添加 CSS 变量映射

```css
[data-theme='custom'] {
  --background: #ffffff;
  --foreground: #000000;
  --panel: rgba(255, 255, 255, 0.8);
  --panel-strong: rgba(255, 255, 255, 0.95);
  --panel-border: rgba(0, 0, 0, 0.1);
  --muted: #666666;
  --grid-line: rgba(0, 0, 0, 0.05);
  --glow-a: rgba(255, 0, 0, 0.1);
  --glow-b: rgba(0, 0, 255, 0.1);
}
```

### 7.3 更新类型定义（如需要）

如果添加了新的设置字段，在 `src/app/types/index.ts` 中更新 `Settings` 类型。

---

## 8. 最佳实践

### 8.1 使用主题变量

**推荐**：使用 CSS 变量

```tsx
<div className="text-[var(--muted)]">
  次要文本
</div>
```

**不推荐**：硬编码颜色

```tsx
<div className="text-gray-500">
  次要文本
</div>
```

### 8.2 响应主题切换

组件可以通过监听主题变化来执行特定逻辑：

```tsx
import { useSettings } from '@/app/contexts/SettingsContext';

function MyComponent() {
  const { settings } = useSettings();
  const isDark = settings.theme === 'dark';

  return (
    <div className={isDark ? 'text-white' : 'text-black'}>
      内容
    </div>
  );
}
```

### 8.3 平滑过渡

确保主题切换时有平滑的过渡效果：

```css
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 9. 故障排查

### 9.1 主题切换无效果

检查以下几点：
1. `<html>` 元素是否有正确的 `data-theme` 属性
2. `src/app/globals.css` 中是否有对应的主题定义
3. 是否有更高优先级的样式覆盖了 CSS 变量

### 9.2 页面加载时闪烁

确认：
1. `layout.tsx` 中的防闪烁 class 是否正确应用
2. `SettingsContext` 是否正确渲染 `.theme-flash-fix` 元素
3. localStorage 中的设置是否有效

### 9.3 跨标签页同步失败

检查：
1. 是否正确监听 `storage` 事件
2. localStorage key 是否为 `compass-settings`
3. 是否有其他代码覆盖了主题设置

---

## 10. 相关文件清单

| 文件 | 职责 |
|------|------|
| `src/app/themes/index.ts` | 主题预设定义 |
| `src/app/contexts/SettingsContext.tsx` | 状态管理与主题应用 |
| `src/app/globals.css` | CSS 变量映射 |
| `tailwind.config.ts` | Tailwind 主题配置 |
| `src/app/components/ThemeToggle.tsx` | 主题切换 UI 组件 |
| `src/app/layout.tsx` | 根布局与防闪烁机制 |
| `src/app/types/index.ts` | TypeScript 类型定义 |

---

*最后更新：2026年3月30日*
