# 本地开发

## 一、启动开发服务器

本地开发统一使用静态预览模式：

```bash
npm install
npm run dev
```

`/edit` 页面可以编辑和导出 YAML，但不会直接保存到文件。

---

## 二、构建与生产运行

### 1. 静态导出

```bash
npm run build
# 产物输出到 out/ 目录
```

可直接用任意静态服务器托管：

```bash
npx serve out
# 或
python -m http.server 8080 -d out
```

### 2. Docker 生产镜像构建

```bash
npm run build:server
```

这个命令用于生成 Docker 所需的 `standalone` 产物，不再提供本地 `npm start` 启动方式。

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
  -e COMPASS_ADMIN_TOKEN=your-secret \
  -e COMPASS_SESSION_SECRET=another-secret \
  -v /path/to/config.yaml:/app/src/config.yaml \
  compass
```

### 3. 使用 Docker Compose

```bash
# 准备配置文件
mkdir -p docker
cp src/config.yaml docker/config.yaml

# 修改 docker-compose.yml 中的口令后启动
docker compose up --build
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `COMPASS_CONFIG_PATH` | 配置文件路径 | `src/config.yaml` |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令（server 模式必需） | 无 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥（可选，未设置时自动生成） | 随机值 |

---

## 备注

- 图标在运行时解析，修改 YAML 中的图标名称后刷新即可生效
- Docker 模式缺少 `COMPASS_ADMIN_TOKEN` 时容器会直接拒绝启动
- 配置文件统一使用 `.yaml` 后缀
