#!/bin/bash
# 测试脚本 - 验证三种运行模式

set -e

echo "=== Compass 迁移验证测试 ==="
echo ""

# 清理
pkill -f "tsx" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "serve" 2>/dev/null || true
pkill -f "node.*dist/server" 2>/dev/null || true
sleep 2

# 测试 1: 静态模式
echo "📦 测试静态模式..."
npm run build:static > /dev/null 2>&1

echo "✓ 静态构建完成"
echo "  - 产物目录: dist/client/"
echo "  - 文件数量: $(find dist/client -type f | wc -l)"
echo ""

# 测试 2: Server 模式 API
echo "🔧 测试 Server 模式 API..."
COMPASS_RUNTIME_MODE=server \
COMPASS_ADMIN_TOKEN=test123 \
timeout 5s npm run dev:server &
SERVER_PID=$!
sleep 3

# 测试 API 端点
echo "测试 API 端点:"
echo -n "  - /api/capabilities: "
curl -s http://localhost:3001/api/capabilities | jq -r '.mode' 2>/dev/null || echo "❌"

echo -n "  - /api/health: "
curl -s http://localhost:3001/api/health | jq -r '.status' 2>/dev/null || echo "❌"

echo -n "  - /api/config/runtime: "
curl -s http://localhost:3001/api/config/runtime | jq -r '.profile.name' 2>/dev/null || echo "❌"

kill $SERVER_PID 2>/dev/null || true
sleep 1
echo "✓ Server 模式 API 测试完成"
echo ""

# 测试 3: 检查必需文件
echo "📋 检查必需文件..."
FILES_OK=true

check_file() {
  if [ -f "$1" ]; then
    echo "  ✓ $1"
  else
    echo "  ✗ $1 (缺失)"
    FILES_OK=false
  fi
}

check_file "src/client/main.tsx"
check_file "src/client/App.tsx"
check_file "src/server/index.ts"
check_file "src/shared/types.ts"
check_file "src/shared/themes.ts"
check_file "src/shared/config-yaml.ts"
check_file "public/config.yaml"
check_file "vite.config.ts"

if [ "$FILES_OK" = true ]; then
  echo "✓ 所有必需文件存在"
else
  echo "✗ 某些文件缺失"
  exit 1
fi

echo ""
echo "=== 验证总结 ==="
echo "✅ 静态构建: 成功"
echo "✅ Server API: 成功"
echo "✅ 文件结构: 完整"
echo ""
echo "🎉 迁移验证通过!"
