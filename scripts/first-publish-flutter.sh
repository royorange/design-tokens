#!/bin/bash

# 首次发布 Flutter 包到 pub.dev

set -e

echo "🚀 首次发布 Flutter 包到 pub.dev..."

# 1. 进入 Flutter 包目录
cd packages/flutter

# 2. 检查是否已登录
echo "🔐 检查 pub.dev 登录状态..."
if [ ! -f ~/Library/Application\ Support/dart/pub-credentials.json ]; then
    echo "❌ 未登录 pub.dev，请先运行: flutter pub login"
    exit 1
fi

# 3. 验证包
echo "🔍 验证包内容..."
flutter pub publish --dry-run

# 4. 询问是否继续
echo ""
read -p "✅ 验证通过，是否继续发布？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 5. 正式发布
    echo "📤 发布到 pub.dev..."
    flutter pub publish --force
    
    echo ""
    echo "✅ 发布成功！"
    echo ""
    echo "📋 后续步骤："
    echo "1. 将 pub-credentials.json 内容添加到 GitHub Secrets (PUB_CREDENTIALS)"
    echo "2. 之后的版本将通过 CI/CD 自动发布"
    echo ""
    echo "🔗 查看包: https://pub.dev/packages/wisburg_design_tokens"
else
    echo "❌ 发布已取消"
fi