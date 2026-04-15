# 本地开发

## 开发模式

Compass 现在有两种开发模式：

| 命令 | 模式 | 说明 |
|------|------|------|
| `npm run dev` | `server` | 默认开发模式，启用 `/api` 与 `/edit` 在线保存能力 |
| `npm run dev:server` | `server` | 与 `npm run dev` 等价 |
| `npm run dev:static` | `static` | 静态预览模式，不提供在线保存接口 |

开发前先安装依赖：

```bash
npm install
```

## 推荐本地流程

### 1. Server 模式开发

如果你要调试 `/edit` 登录、保存 YAML、运行时配置读取，使用：

```bash
COMPASS_ADMIN_TOKEN=change-me npm run dev
```

说明：

- `npm run dev` 默认就是 `server` 模式
- 未设置 `COMPASS_ADMIN_TOKEN` 时，页面仍可打开，但 `/edit` 不会启用服务器保存
- `COMPASS_SESSION_SECRET` 可选；未设置时会自动生成临时值，重启后登录态会失效

### 2. Static 模式预览

如果你要确认静态导出行为，使用：

```bash
npm run dev:static
```

此模式下：

- 首页按静态站点方式运行
- `/edit` 只能编辑和导出 YAML
- `/api` 保存接口不可用

## 配置文件

默认配置文件路径为：

```bash
public/config.yaml
```

在 `server` 模式下，也可以通过环境变量改为外挂文件：

```bash
COMPASS_CONFIG_PATH=/absolute/path/to/config.yaml
```

如果传入相对路径，会相对于项目根目录解析。

## 常用检查

```bash
npm run lint
```

项目当前没有测试框架，也没有单独的 `typecheck` 脚本。

## 开发注意事项

- 图标为运行时解析：Lucide 使用 PascalCase，如 `Calendar`；品牌图标使用小写或 kebab-case，如 `github`、`google-gemini`
- 配置文件统一使用 `.yaml`
- `npm run dev` 和 `npm run build:server` 都会先生成静态品牌图标映射
- `static` 与 `server` 的差异主要在 API 和在线保存，不在 YAML 结构
