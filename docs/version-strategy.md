# 版本管理策略

## 版本号规范

我们遵循语义化版本规范 (Semantic Versioning)：

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: 破坏性变更
- **MINOR**: 新增功能（向后兼容）
- **PATCH**: 修复问题（向后兼容）

## 自动版本判断规则

当运行 `npm run version:auto` 时，系统会自动分析 token 变化并决定版本号：

### 🔴 Major 版本（破坏性变更 - 需手动确认）

**重要**：自动模式不会直接更新到 major 版本，需要手动运行 `npm run version:major`

以下情况建议使用 major 版本：

1. **删除 token**
   ```json
   // 之前
   "color.primary.500": { "value": "#4F46E5" }
   
   // 之后
   // token 被删除了
   ```

2. **重命名 token**
   ```json
   // 之前
   "color.brand": { "value": "#4F46E5" }
   
   // 之后
   "color.primary": { "value": "#4F46E5" }
   ```

3. **改变 token 结构**
   ```json
   // 之前
   "spacing": "16px"
   
   // 之后
   "spacing": {
     "value": "16",
     "type": "spacing"
   }
   ```

### 🟡 Minor 版本（新功能）

以下情况会自动触发 minor 版本更新：

1. **新增 token**
   ```json
   // 新增了一个颜色
   "color.success": { "value": "#10B981" }
   ```

2. **新增 token 类别**
   ```json
   // 新增了阴影系统
   "shadow": {
     "sm": { "value": "0 1px 2px rgba(0,0,0,0.05)" },
     "md": { "value": "0 4px 6px rgba(0,0,0,0.1)" }
   }
   ```

3. **新增主题变体**
   ```json
   // 新增了 high-contrast 主题
   "high-contrast": {
     "color": { ... }
   }
   ```

4. **检测到删除/重命名（但自动降级为 minor）**
   ```bash
   # 自动模式检测到破坏性变更时会提示：
   ⚠️  检测到可能的破坏性变更 (删除或重命名)
   📌 建议手动运行 `npm run version:major` 如果这是有意的破坏性变更
   📌 否则将作为 minor 版本处理
   ```

### 🟢 Patch 版本（修复）

以下情况会触发 patch 版本更新：

1. **修改 token 值**
   ```json
   // 之前
   "color.primary.500": { "value": "#4F46E5" }
   
   // 之后
   "color.primary.500": { "value": "#4338CA" }  // 颜色微调
   ```

2. **修复拼写错误**（值不变）
   ```json
   // 之前
   "colro.primary": { "value": "#4F46E5" }
   
   // 之后
   "color.primary": { "value": "#4F46E5" }  // 需要手动处理为 patch
   ```

## 使用指南

### 自动版本（推荐）

```bash
# CI/CD 中使用
npm run version:auto

# 输出示例 1 - 常规更新：
# 📊 Token 变更分析:
#   ✅ 新增: 3 个
#      - color.success
#      - color.warning
#      - spacing.7
# 🟡 检测到新增 token
# ✅ Version updated: 1.0.0 → 1.1.0

# 输出示例 2 - 检测到破坏性变更：
# 📊 Token 变更分析:
#   ❌ 删除: 2 个
#      - color.brand
#      - spacing.xxl
# ⚠️  检测到可能的破坏性变更 (删除或重命名)
# 📌 建议手动运行 `npm run version:major` 如果这是有意的破坏性变更
# 📌 否则将作为 minor 版本处理
# ✅ Version updated: 1.0.0 → 1.1.0
```

### 手动版本

当自动判断不准确时，可以手动指定：

```bash
# 修复 bug
npm run version:patch

# 新增功能
npm run version:minor

# 破坏性变更
npm run version:major
```

### 检查是否需要更新

```bash
npm run version:check
# 输出: yes 或 no
```

## CI/CD 集成

在 GitHub Actions 中已配置自动版本更新：

```yaml
- name: Check and update version
  run: |
    npm run version:auto
    git add -A
    git commit -m "chore: bump version [skip ci]"
```

## 版本发布流程

1. **设计师更新 Figma**
   - 修改 tokens
   - 同步到 GitHub

2. **CI/CD 自动处理**
   - 检测变更类型
   - 更新版本号
   - 构建各平台包
   - 创建 Git tag
   - 发布到 npm

3. **开发者更新**
   - 收到更新通知
   - 查看变更日志
   - 更新依赖版本

## 特殊情况处理

### 1. 紧急修复

如果需要紧急修复但不想触发自动版本：

```bash
# 手动设置 patch 版本
npm run version:patch

# 或直接编辑 package.json
```

### 2. 预发布版本

```bash
# 创建 beta 版本
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0
```

### 3. 跳过版本更新

在 commit message 中添加 `[skip version]`：

```bash
git commit -m "chore: update docs [skip version]"
```

## 版本回滚

如果发现问题需要回滚：

```bash
# 1. 查看版本历史
git tag -l

# 2. 回滚到特定版本
git checkout v1.0.0

# 3. 创建修复分支
git checkout -b hotfix/1.0.1

# 4. 修复后发布
npm run version:patch
```

## 版本通知

### Slack 通知

可以在 CI/CD 中添加 Slack 通知：

```yaml
- name: Notify Slack
  if: steps.version.outputs.VERSION_CHANGED == 'true'
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "🎨 Design Tokens 更新到 v${{ steps.version.outputs.VERSION }}"
```

### 邮件通知

通过 GitHub Actions 发送邮件通知相关团队。

## 最佳实践

1. **定期审查**
   - 每月审查版本历史
   - 确保版本号符合变更程度

2. **变更日志**
   - 每次版本更新都要有清晰的说明
   - 在 Release notes 中列出所有变更

3. **测试验证**
   - Major 版本发布前通知所有团队
   - 提供迁移指南

4. **版本锁定**
   - 生产环境使用精确版本
   - 开发环境可以使用范围版本