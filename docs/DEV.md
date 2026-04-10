# 本地开发

## 启动

```bash
npm install
npm run dev
```

开发模式默认以 server 能力启动，可以直接测试在线保存功能。

需要启用在线保存的话，至少设置管理口令：

```bash
COMPASS_ADMIN_TOKEN=change-me
# 可选：不设置时会自动生成临时会话密钥
COMPASS_SESSION_SECRET=change-me-too
npm run dev
```

## 静态模式预览

```bash
npm run dev:static
```

会关闭在线保存，但页面行为和静态部署一致。

## 环境变量

| 变量 | 作用 |
|------|------|
| `COMPASS_CONFIG_PATH` | 配置文件路径，默认 `src/config.yaml`，可用环境变量覆盖 |
| `COMPASS_ADMIN_TOKEN` | 编辑器登录口令 |
| `COMPASS_SESSION_SECRET` | 会话签名密钥；未设置时启动时自动生成 |

## 备注

- 图标运行时解析，不需要构建前生成 manifest
- server 模式默认读取 `src/config.yaml`
- 可通过 `COMPASS_CONFIG_PATH` 切换到其他 `.yaml` 配置文件
- server 模式缺少 `COMPASS_ADMIN_TOKEN` 时会直接拒绝启动
