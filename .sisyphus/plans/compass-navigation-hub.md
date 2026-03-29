# Compass 导航中心 - 项目计划

## 当前状态评估

### ✅ 现有内容
- **Next.js 14** 项目，使用 TypeScript、Tailwind CSS、Framer Motion
- **配置**：`src/data/config.json` 包含个人资料、设置、类别和链接
- **组件**：
  - `CategorySection.tsx` - 渲染带有动画标题和链接网格的类别
  - `NavigationCard.tsx` - 每个链接的交互式卡片，带有悬停动画
- **类型**：`src/app/types/index.ts` – Config、Category、Link、Profile、Settings 的 TypeScript 接口
- **样式**：基于深色主题的 Tailwind，全局 CSS 变量
- **部署**：Cloudflare Pages 配置（`wrangler.toml`）
- **占位符 UI**：默认 Next.js 教程页面（`app/page.tsx`）尚未集成

### 🔄 缺失内容
- 使用配置和组件的主仪表板 UI
- 搜索功能（通过 `settings.showSearch` 可配置）
- 主题切换（根据 `settings.theme` 的深色/浅色）
- 布局切换（根据 `settings.layout` 的网格/列表）
- 动画切换（根据 `settings.animations`）
- 个人资料部分（头像、姓名、描述、简介）
- 响应式设计优化
- 设置的状态管理（可以是 React Context 或本地存储）
- 可能的后端 API 用于动态配置更新（未来）

## 项目目标

### 最小可行产品 (MVP)
1. 替换 `app/page.tsx` 为仪表板，该仪表板：
   - 读取 `config.json` 并使用现有组件显示所有类别和链接
   - 顶部显示个人资料部分
   - 实现搜索栏（如果 `settings.showSearch` 为 true）
   - 遵循 `settings.layout`（网格/列表）– 列表布局尚未实现
   - 遵循 `settings.theme`（深色/浅色）– 需要主题切换 UI
   - 遵循 `settings.animations` – 可以禁用 Framer Motion 动画
2. 确保跨移动设备、平板电脑、桌面的响应式设计。
3. 可部署到 Cloudflare Pages 并支持静态导出。

### 增强功能（MVP后）
- 编辑模式：允许用户通过 UI 修改类别/链接（需要后端）
- 拖放重新排序类别/链接
- 导入/导出配置（JSON 文件）
- 多用户身份验证（如果需要）
- 浏览器扩展集成（快速访问新标签页）
- 分析（点击跟踪）
- 超出 Lucide 的自定义图标（上传/SVG 支持）

## 实施步骤

### 阶段1：基础
1. **创建仪表板页面**（`app/page.tsx`），导入配置并将类别映射到 CategorySection。
2. **创建个人资料头部组件**（`app/components/ProfileHeader.tsx`）显示个人资料名称、头像、描述。
3. **集成搜索栏**（`app/components/SearchBar.tsx`），跨类别过滤链接。
4. **添加布局切换器** – 新组件 `LayoutToggle`，在网格/列表之间切换。列表布局需要新的 `NavigationList` 组件或调整现有卡片。
5. **添加主题切换器** – 组件用于切换深色/浅色，更新 CSS 变量并将偏好保存到本地存储（覆盖配置）。
6. **添加动画切换器** – 当 `settings.animations` 为 false 时禁用 Framer Motion `animate` 属性。

### 阶段2：状态管理与持久化
7. **创建设置上下文**（`app/contexts/SettingsContext.tsx`）以全局管理主题、布局、动画、搜索查询。
8. **将用户偏好持久化**到本地存储（主题、布局、动画），同时将 config.json 作为默认值。
9. **使配置在内存中可编辑**（React 状态），以便切换立即影响 UI。

### 阶段3：优化与响应式
10. **优化移动端响应式** – 调整网格列数、字体大小、间距。
11. **为初始数据获取添加加载骨架**（尽管配置是本地）。
12. **为搜索结果添加空状态**。
13. **添加微交互**（工具提示、键盘快捷键、焦点指示器）。

### 阶段4：部署与测试
14. **运行代码检查与构建**以确保没有 TypeScript 错误。
15. **测试静态导出**（`next export`）以确保 Cloudflare Pages 兼容性。
16. **通过 `wrangler` 部署到 Cloudflare Pages**。
17. **验证线上部署**是否按预期工作。

## 技术考虑

### 数据流
- 从静态 `config.json` 开始，通过 `import config from '../data/config.json'` 导入。
- 将来可以迁移到 API 路由（`/api/config`）以支持 CRUD 操作。

### 状态管理
- 使用 React Context 管理设置（主题、布局、动画、搜索查询）。轻量级；无需 Redux。
- 如果复杂度增加，考虑使用 `zustand`。

### 动画性能
- Framer Motion 动画是 GPU 加速的，但为低功耗设备提供切换选项。
- 使用 `useReducedMotion` 钩子以支持可访问性。

### 主题
- Tailwind 深色模式类策略：在 `<html>` 上使用 `class="dark"`。
- 在 `dark` 和 `light` 类之间切换，更新本地存储。

### 布局切换
- 网格：当前 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- 列表：单列紧凑卡片，可能需要不同的组件。

### 搜索实现
- 客户端过滤 `category.links` 中的 `name` 和 `description`。
- 对输入进行防抖以提高性能。

## 潜在挑战与缓解措施

| 挑战 | 缓解措施 |
|-----------|------------|
| 配置可能变得庞大（许多链接） | 如果出现性能问题，使用 `react‑virtual` 虚拟化列表。 |
| 主题切换导致闪烁 | 使用 `next‑themes` 或抑制水合警告。 |
| 本地存储与配置默认值 | 加载顺序：localStorage > config.json > 默认值。 |
| 静态导出与动态功能 | 使用仅客户端功能；设置不使用 SSR。 |
| Cloudflare Pages 路由 | 确保 `_routes.json` 或 `_redirects` 用于 SPA 路由。 |

## 成功指标
- 仪表板渲染配置中的所有类别/链接。
- 搜索正确过滤链接。
- 主题切换无需页面重载。
- 布局切换即时改变 UI。
- 设置跨页面重载持久化。
- 移动端视图可用（触摸目标 ≥ 44px）。
- Lighthouse 分数在性能、可访问性、最佳实践、SEO 方面 ≥ 90。

## 时间线估算
- **阶段1**：2–3 天
- **阶段2**：1–2 天  
- **阶段3**：2 天
- **阶段4**：1 天

总计：约 6–8 天的专注开发。

## 下一步立即行动
1. 用显示类别的基本仪表板替换 `app/page.tsx`。
2. 创建 ProfileHeader 组件。
3. 实现搜索栏。

让我们从步骤 1 开始。