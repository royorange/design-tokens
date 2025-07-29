# 发布配置指南

## 需要配置的 GitHub Secrets

### 1. NPM_TOKEN
用于发布包到 npm

获取方式：
1. 登录 https://www.npmjs.com/
2. 点击头像 → Access Tokens
3. Generate New Token → Classic Token
4. 选择 "Publish" 权限
5. 复制 token

配置方式：
1. 进入 GitHub 仓库 Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `NPM_TOKEN`
4. Value: 粘贴你的 npm token

### 2. PUB_CREDENTIALS
用于发布 Flutter 包到 pub.dev

获取方式：
1. 本地运行 `flutter pub login`
2. 按照提示在浏览器中授权
3. 找到 credentials 文件：
   - macOS/Linux: `~/.pub-cache/credentials.json`
   - Windows: `%APPDATA%\Pub\Cache\credentials.json`
4. 复制整个文件内容

配置方式：
1. 进入 GitHub 仓库 Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `PUB_CREDENTIALS`
4. Value: 粘贴 credentials.json 的完整内容

## 验证发布权限

### NPM
确保你的 npm 账号有发布以下包的权限：
- @wisburg/design-tokens-css
- @wisburg/design-tokens-tailwind

### pub.dev
确保你的 pub.dev 账号有发布以下包的权限：
- wisburg_design_tokens

## 手动发布命令

如果 GitHub Actions 失败，可以本地手动发布：

```bash
# NPM 包
cd packages/css && npm publish --access public
cd packages/tailwind && npm publish --access public

# Flutter 包
cd packages/flutter && flutter pub publish
```

## 常见问题

1. **401 Unauthorized**：token 无效或过期
2. **403 Forbidden**：没有发布权限
3. **409 Conflict**：版本已存在，需要更新版本号