# 依赖管理指南

本文档详细说明了各平台如何集成 Design Tokens。

## Flutter 依赖配置

### 推荐方式：Git 依赖

```yaml
# pubspec.yaml
dependencies:
  design_tokens:
    git:
      url: https://github.com/wisburg/design-tokens.git
      path: packages/flutter
      ref: v1.0.0  # 推荐使用版本标签
```

### 版本管理策略

1. **使用版本标签（推荐）**
   ```yaml
   ref: v1.0.0  # 锁定到特定版本，最稳定
   ```

2. **使用分支**
   ```yaml
   ref: main  # 始终获取最新版本
   ref: develop  # 使用开发分支
   ```

3. **使用 commit hash**
   ```yaml
   ref: 7c3d5f2  # 锁定到特定提交，用于调试
   ```

### 私有仓库配置

如果仓库是私有的，需要配置 SSH：

```yaml
dependencies:
  design_tokens:
    git:
      url: git@github.com:wisburg/design-tokens.git  # 使用 SSH URL
      path: packages/flutter
      ref: v1.0.0
```

配置 SSH key：
```bash
# 1. 生成 SSH key（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 将公钥添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出，添加到 GitHub Settings → SSH keys
```

### 更新依赖

```bash
# 更新到最新版本
flutter pub upgrade design_tokens

# 或者清理缓存后重新获取
flutter pub cache clean
flutter pub get
```

## NPM 包依赖配置

### 公开包（发布到 npm）

```bash
# 安装 React 包
npm install @wisburg/design-tokens-react

# 安装 Tailwind 包
npm install @wisburg/design-tokens-tailwind
```

### GitHub 包（私有或公开）

```bash
# 使用 GitHub 作为源
npm install github:wisburg/design-tokens#v1.0.0

# 或者指定子包路径
npm install github:wisburg/design-tokens#main -- packages/react
```

### 在 package.json 中配置

```json
{
  "dependencies": {
    "@wisburg/design-tokens-react": "^1.0.0",
    "@wisburg/design-tokens-tailwind": "^1.0.0",
    
    // 或使用 GitHub
    "design-tokens-react": "github:wisburg/design-tokens#v1.0.0",
    "design-tokens-tailwind": "github:wisburg/design-tokens#v1.0.0"
  }
}
```

### 私有 npm registry

如果使用私有 npm registry：

```bash
# 配置 registry
npm config set @wisburg:registry https://npm.pkg.github.com

# 配置认证
npm login --scope=@wisburg --registry=https://npm.pkg.github.com
```

## 版本更新通知

### Flutter 项目

创建 `tools/check_design_tokens.dart`:

```dart
import 'dart:io';
import 'package:yaml/yaml.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> main() async {
  // 读取当前版本
  final pubspec = File('pubspec.yaml').readAsStringSync();
  final yaml = loadYaml(pubspec);
  final currentRef = yaml['dependencies']['design_tokens']['git']['ref'];
  
  // 获取最新版本
  final response = await http.get(
    Uri.parse('https://api.github.com/repos/wisburg/design-tokens/releases/latest')
  );
  
  if (response.statusCode == 200) {
    final latest = json.decode(response.body)['tag_name'];
    
    if (currentRef != latest) {
      print('⚠️  New design tokens version available: $latest (current: $currentRef)');
      print('📦 Update pubspec.yaml:');
      print('   ref: $latest');
    } else {
      print('✅ Design tokens are up to date');
    }
  }
}
```

### React/Next.js 项目

添加到 `package.json`:

```json
{
  "scripts": {
    "check-tokens": "npm outdated @wisburg/design-tokens-react @wisburg/design-tokens-tailwind"
  }
}
```

## 自动化更新

### Dependabot 配置

创建 `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # NPM 依赖
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "design-tokens"
    
  # Flutter 依赖
  - package-ecosystem: "pub"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "design-tokens"
```

### Renovate 配置

创建 `renovate.json`:

```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPackagePatterns": ["@wisburg/design-tokens"],
      "groupName": "design tokens",
      "automerge": true,
      "automergeType": "pr"
    }
  ],
  "git-submodules": {
    "enabled": true
  }
}
```

## 故障排除

### Flutter 常见问题

1. **缓存问题**
   ```bash
   flutter pub cache clean
   rm -rf .dart_tool/
   flutter pub get
   ```

2. **版本冲突**
   ```yaml
   dependency_overrides:
     design_tokens:
       git:
         url: https://github.com/wisburg/design-tokens.git
         path: packages/flutter
         ref: v1.0.0
   ```

3. **私有仓库认证失败**
   - 确保 SSH key 已添加到 GitHub
   - 使用 `ssh -T git@github.com` 测试连接

### NPM 常见问题

1. **清理缓存**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **版本锁定**
   ```json
   {
     "overrides": {
       "@wisburg/design-tokens-react": "1.0.0"
     }
   }
   ```

## 最佳实践

1. **版本策略**
   - 生产环境：使用具体版本标签 (v1.0.0)
   - 开发环境：可以使用分支 (develop)
   - 测试特定修复：使用 commit hash

2. **更新频率**
   - 设置每周检查更新
   - 重要更新通过 Slack/邮件通知
   - 非破坏性更新可以自动合并

3. **多项目管理**
   - 使用 monorepo 管理多个项目
   - 统一版本管理策略
   - 批量更新工具

4. **回滚策略**
   - 保留最近 3 个版本的标签
   - 记录每个版本的变更日志
   - 提供快速回滚脚本