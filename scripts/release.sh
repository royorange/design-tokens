#!/bin/bash

# 发布脚本 - 手动创建版本和 tag

set -e

echo "🚀 开始发布流程..."

# 1. 确保在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ 错误：必须在 main 分支发布"
    exit 1
fi

# 2. 确保工作区干净
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 错误：工作区有未提交的更改"
    exit 1
fi

# 3. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 4. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 5. 运行测试
echo "🧪 运行测试..."
pnpm test || true

# 6. 更新版本
echo "🔢 选择版本更新类型："
echo "  1) patch (修复: 1.0.0 → 1.0.1)"
echo "  2) minor (功能: 1.0.0 → 1.1.0)"
echo "  3) major (破坏性: 1.0.0 → 2.0.0)"
echo "  4) auto (自动判断)"
read -p "请选择 (1-4): " choice

case $choice in
    1) VERSION_TYPE="patch";;
    2) VERSION_TYPE="minor";;
    3) VERSION_TYPE="major";;
    4) VERSION_TYPE="auto";;
    *) echo "❌ 无效选择"; exit 1;;
esac

echo "📝 更新版本..."
pnpm run version:$VERSION_TYPE

# 7. 获取新版本号
VERSION=$(node -p "require('./package.json').version")
echo "✅ 新版本: v$VERSION"

# 8. 构建所有包
echo "🔨 构建所有平台..."
pnpm run build

# 9. 提交版本更新
echo "💾 提交版本更新..."
git add -A
git commit -m "chore: release v$VERSION" || true

# 10. 创建 tag
echo "🏷️  创建 Git tag..."
git tag -a "v$VERSION" -m "Release v$VERSION

$(git log --pretty=format:"- %s" $(git describe --tags --abbrev=0)..HEAD)"

# 11. 推送到远程
echo "📤 推送到 GitHub..."
git push origin main
git push origin "v$VERSION"

echo "✅ 发布完成！"
echo ""
echo "📋 下一步："
echo "1. 检查 GitHub Actions 是否正常运行"
echo "2. 等待 CI/CD 自动发布到 npm 和 pub.dev"
echo "3. 在项目中更新依赖："
echo "   Flutter: wisburg_design_tokens: ^$VERSION"
echo "   NPM: @wisburg/design-tokens-css@$VERSION"
echo ""
echo "🔗 查看发布: https://github.com/royorange/design-tokens/releases/tag/v$VERSION"