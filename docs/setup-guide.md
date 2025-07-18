# Design Tokens 设置指南

本指南将帮助你从零开始配置 Figma + Tokens Studio 设计系统。

## 1. Figma 设置

### 安装 Tokens Studio 插件

1. 打开 Figma
2. 进入 Community → Plugins
3. 搜索 "Tokens Studio for Figma"
4. 点击 "Install" 安装插件

### 配置 Tokens Studio

1. 在 Figma 文件中运行 Tokens Studio 插件
2. 点击 Settings (齿轮图标)
3. 选择 "Sync" 标签
4. 选择 "GitHub" 作为同步方式

### GitHub 同步配置

1. 生成 GitHub Personal Access Token:
   - 访问 GitHub Settings → Developer settings → Personal access tokens
   - 生成新 token，勾选 `repo` 权限
   
2. 在 Tokens Studio 中配置:
   ```
   Repository: your-org/design-tokens
   Branch: main
   File Path: tokens/figma/tokens.json
   ```

3. 点击 "Save" 保存配置

## 2. Token 组织结构

### 推荐的 Token 集合

在 Tokens Studio 中创建以下 Token Sets：

1. **Global** - 原始值
   - Colors (基础色板)
   - Spacing (间距系统)
   - Typography (字体大小)
   - Radius (圆角)

2. **Light** - 亮色主题
   - Semantic (语义化颜色)
   - Component (组件样式)

3. **Dark** - 暗色主题
   - Semantic (语义化颜色)
   - Component (组件样式)

### Token 命名规范

```
原始层：
color.primary.500
spacing.4
radius.md

语义层：
color.text.primary
color.background.elevated
spacing.padding.medium

组件层：
button.padding.x
card.radius
input.border.color
```

## 3. 颜色系统配置

### 基础色板

```json
{
  "color": {
    "primary": {
      "50": "#EAEAFD",
      "100": "#CBC9F8",
      "500": "#4F46E5",
      "900": "#2B00B0"
    },
    "neutral": {
      "50": "#E9EBEE",
      "100": "#D3D4D8",
      "900": "#121212"
    }
  }
}
```

### 语义化颜色

```json
{
  "semantic": {
    "color": {
      "text": {
        "primary": "{color.neutral.900}",
        "secondary": "{color.neutral.700}"
      },
      "background": {
        "base": "{color.white}",
        "elevated": "{color.neutral.50}"
      }
    }
  }
}
```

## 4. 设计师工作流

### 创建新 Token

1. 在 Figma 中选择元素
2. 打开 Tokens Studio
3. 点击对应的属性（如 Fill）
4. 创建或选择 token

### 更新 Token

1. 在 Tokens Studio 中找到 token
2. 修改值
3. 点击 "Push to GitHub"
4. 填写提交信息

### 预览效果

1. 使用 Tokens Studio 的主题切换
2. 查看不同主题下的效果
3. 确认无误后推送

## 5. 开发者集成

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/design-tokens.git
cd design-tokens

# 安装依赖
npm install

# 构建 tokens
npm run build

# 监听变化
npm run watch
```

### 在项目中使用

**Flutter:**
```yaml
dependencies:
  design_tokens:
    git:
      url: https://github.com/wisburg/design-tokens.git
      path: packages/flutter
      ref: v1.0.0  # 推荐：使用版本标签
      # ref: main  # 或者：始终使用最新版本
      # ref: 7c3d5f2  # 或者：锁定到特定 commit
```

**CSS/Web (React/Vue/Next.js/Nuxt):**
```bash
npm install @wisburg/design-tokens-css
# 或从 GitHub 安装（私有仓库）
npm install github:wisburg/design-tokens#main
```

**Tailwind:**
```javascript
// tailwind.config.js
const tokens = require('design-tokens/packages/tailwind');
```

## 6. 最佳实践

### Token 命名

1. 使用描述性名称而非颜色名
   - ✅ `color.text.primary`
   - ❌ `color.gray.900`

2. 保持层级清晰
   - ✅ `spacing.padding.small`
   - ❌ `paddingSmall`

3. 使用一致的命名模式
   - ✅ `color.background.base`
   - ❌ `bg-color-main`

### 版本管理

1. 使用语义化版本号
2. 在重大更改前通知团队
3. 保留弃用 token 至少一个版本

### 协作

1. 设计师负责 token 值的更新
2. 开发者负责构建脚本的维护
3. 定期 review token 使用情况

## 7. 故障排除

### Tokens Studio 同步失败

1. 检查 GitHub token 权限
2. 确认仓库和分支名称
3. 查看 Tokens Studio 控制台错误

### 构建失败

1. 检查 token 格式是否正确
2. 运行 `npm run test:tokens` 验证
3. 查看 CI/CD 日志

### 样式不生效

1. 确认已导入最新版本
2. 检查 token 引用路径
3. 清除缓存重新构建

## 8. 进阶配置

### 自定义转换

编辑 `scripts/transform.js` 添加自定义逻辑：

```javascript
// 自定义颜色转换
function customColorTransform(token) {
  // 添加透明度变体
  return {
    ...token,
    '10': addOpacity(token.value, 0.1),
    '20': addOpacity(token.value, 0.2)
  };
}
```

### 添加新平台

1. 创建新的构建脚本 `scripts/build-[platform].js`
2. 在 `package.json` 添加构建命令
3. 更新 CI/CD 配置

### 性能优化

1. 使用 token 分片加载
2. 实现按需构建
3. 缓存转换结果