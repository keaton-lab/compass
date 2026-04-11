# 本地开发

## 一、启动开发服务器

### 静态模式

```bash
npm install
npm run dev:static
```

访问 `http://localhost:3000`

### Server/GitHub 模式

Server 和 GitHub 模式开发时使用单端口开发服务器，页面和 API 共用 `http://localhost:3000`。

```bash
# Server 模式
npm run dev

# GitHub 模式
GITHUB_CLIENT_ID=xxx \
GITHUB_CLIENT_SECRET=xxx \
GITHUB_REPO_OWNER=owner \
GITHUB_REPO_NAME=repo \
npm run dev:github
```

如果只想跑纯静态前端：

```bash
npm run dev:static
```

访问 `http://localhost:3000`

说明：
- `npm run dev`、`npm run dev:github`、`npm run dev:static` 都通过 Hono 挂载 Vite middleware，只暴露一个端口
- `npm run dev` 默认会为开发环境注入 `COMPASS_ADMIN_TOKEN=dev-token`
- 如果你想自定义口令，可在命令前显式传入 `COMPASS_ADMIN_TOKEN=your-secret`

---

## 二、构建与生产运行

### 1. 静态导出

```bash
npm run build:static
# 产物输出到 dist/client/ 目录
```

可直接用任意静态服务器托管:

```bash
npx serve dist/client
# 或
python -m http.server 8080 -d dist/client
```

### 2. Docker 生产镜像构建

```bash
npm run build:server
docker build -t compass .
```

---

## 三、Docker 构建与运行

### 1. 构建镜像

```bash
docker build -t compass .
```

### 2. 启动容器

```bash
docker run -d \
  -p 3000:3000 \
  -e COMPASS_RUNTIME_MODE=server \
  -e COMPASS_ADMIN_TOKEN=your-secret \
  -e COMPASS_SESSION_SECRET=another-secret \
   -v /path/to/config.yaml:/app/public/config.yaml \
  compass
```

### 3. 使用 Docker Compose

```bash
# 准备配置文件
mkdir -p docker
cp public/config.yaml docker/config.yaml

# 修改 docker-compose.yml 中的口令后启动
docker compose up --build
```

---

## 四、开发模式说明

### 静态模式 (static)
- 前端直接读取 `/config.yaml`
- `/edit` 仅支持编辑和导出 YAML
- 适合静态托管平台

### Server 模式 (server)
- 前端通过 API 读取和保存配置
- `/edit` 支持登录并保存到服务器
- 适合 Docker 部署

### GitHub 模式 (github)
- 通过 GitHub App 授权
- `/edit` 支持发布到指定仓库
- 适合团队协作

---

## 五、环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `COMPASS_RUNTIME_MODE` | 运行模式 | static |
| `COMPASS_CONFIG_PATH` | 配置文件路径 | public/config.yaml |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令（server 模式必需） | 无 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥（可选，未设置时自动生成） | 随机值 |

---

## 六、项目结构

```
src/
├── client/           # React 前端应用
│   ├── components/   # UI 组件
│   ├── pages/        # 页面路由
│   ├── contexts/     # 客户端状态
│   └── services/     # API 服务
├── server/           # Hono 服务端
│   ├── routes/       # API 路由
│   └── index.ts      # 服务入口
└── shared/           # 共享模块
    ├── types.ts      # 类型定义
    ├── themes.ts     # 主题预设
    └── config-yaml.ts # YAML 解析

public/
└── config.yaml       # 唯一配置文件
```

---

## 七、技术栈

- **前端**: Vite + React 18 + React Router + Tailwind CSS
- **后端**: Hono + Node.js
- **图标**: Lucide + Simple Icons (运行时解析)
- **配置**: YAML

---

## 备注

- 图标在运行时解析，修改 YAML 中的图标名称后刷新即可生效
- Docker 模式缺少 `COMPASS_ADMIN_TOKEN` 时容器会直接拒绝启动
- 配置文件统一使用 `.yaml` 后缀
