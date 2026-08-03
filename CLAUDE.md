# Design Tokens - 项目指南

> 将 Figma Tokens Studio 的设计 tokens 转换为各平台（CSS、Tailwind、Flutter）可用的规范格式。

## 项目结构

```
design-tokens/
├── tokens/
│   ├── figma/          # Figma Tokens Studio 原始文件（设计师通过 Git 同步）
│   └── transformed/    # 转换后的标准格式
├── packages/
│   ├── css/            # CSS 变量包 (@wisburg/design-tokens-css)
│   ├── tailwind/       # Tailwind 配置包 (@wisburg/design-tokens-tailwind)
│   └── flutter/        # Flutter 包 (wisburg_design_tokens)
├── scripts/
│   ├── transform.js    # Token 格式转换
│   ├── build-css.js    # 生成 CSS 变量
│   ├── build-tailwind.js # 生成 Tailwind 配置
│   ├── build-flutter.js  # 生成 Flutter Dart 文件
│   ├── validate-tokens.js # Token 验证
│   └── version-manager.js # 版本管理
└── .github/workflows/  # CI/CD 自动构建与发布
```

## 核心命令

```bash
pnpm install          # 安装依赖
pnpm run build        # 完整构建（转换 + 各平台）
pnpm run build:transform  # 仅转换 tokens
pnpm run build:flutter    # 仅构建 Flutter
pnpm run build:tailwind   # 仅构建 Tailwind
pnpm run build:css        # 仅构建 CSS
pnpm run test             # 运行所有测试
pnpm run watch            # 监听变化自动构建
```

## 数据流

```
Figma Tokens Studio
       ↓ (Git 同步)
tokens/figma/tokens.json
       ↓ (transform.js)
tokens/transformed/tokens.json
       ↓ (build-*.js)
packages/{css,tailwind,flutter}/
```

## Token 结构

tokens 分为三层主题：
- **global**: 基础原始值（颜色色板、间距、圆角等）
- **light**: 亮色主题语义化 tokens
- **dark**: 暗色主题语义化 tokens

## 版本策略

遵循语义化版本（SemVer）：
- **patch**: 修改 token 值（颜色微调等）
- **minor**: 新增 token
- **major**: 删除或重命名 token（破坏性变更）

```bash
pnpm run version:auto   # 自动判断版本类型（CI 使用）
pnpm run version:patch  # 手动 patch
pnpm run version:minor  # 手动 minor
pnpm run version:major  # 手动 major（破坏性变更需手动）
```

## CI/CD 流程

当 `tokens/figma/**` 或 `scripts/**` 变化时自动触发：
1. 检测变更 → 更新版本号
2. 构建各平台包
3. 发布到 npm（CSS、Tailwind）
4. 发布到 pub.dev（Flutter）
5. 创建 GitHub Release

## 各平台使用方式

### Flutter

```yaml
# pubspec.yaml
dependencies:
  design_tokens:
    git:
      url: https://github.com/wisburg/design-tokens.git
      path: packages/flutter
      ref: v1.0.0
```

```dart
import 'package:design_tokens/design_tokens.dart';
// 使用 DesignTokens.lightTheme / DesignTokens.darkTheme
```

### CSS/Web

```bash
pnpm install @wisburg/design-tokens-css
```

```javascript
import '@wisburg/design-tokens-css/css/variables.css';
// 使用 var(--color-primary-500) 等 CSS 变量
```

### Tailwind

```bash
pnpm install @wisburg/design-tokens-tailwind
```

```javascript
// tailwind.config.js
const tokens = require('@wisburg/design-tokens-tailwind');
module.exports = {
  theme: {
    colors: tokens.colors,
    spacing: tokens.spacing,
  }
};
```

## 开发注意事项

1. **Token 命名规范**: 使用语义化名称（`color.text.primary`），避免颜色名（`color.gray.900`）
2. **修改 scripts/**: 改动构建脚本后需验证各平台输出是否正确
3. **新增 Token 类型**: 需同时更新 transform.js 和各平台的 build 脚本
4. **测试**: 改动后运行 `pnpm run test` 验证
5. **发布**: 由 CI 自动处理，无需手动发布

## 发布凭证配置（GitHub Secrets）

- `NPM_TOKEN`: npm 发布 token
- `PUB_CREDENTIALS`: pub.dev credentials.json 内容
