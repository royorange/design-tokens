const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');

/**
 * 版本管理脚本
 * 自动管理版本号，支持根据 token 变更自动更新版本
 */

const ROOT_PACKAGE = path.join(__dirname, '../package.json');
const TOKENS_PATH = path.join(__dirname, '../tokens/figma/tokens.json');
const VERSION_FILE = path.join(__dirname, '../.version-state.json');

/**
 * 获取当前版本
 */
async function getCurrentVersion() {
  const pkg = await fs.readJSON(ROOT_PACKAGE);
  return pkg.version;
}

/**
 * 计算 tokens 的 hash
 */
async function getTokensHash() {
  const crypto = require('crypto');
  const tokensContent = await fs.readFile(TOKENS_PATH, 'utf8');
  return crypto.createHash('md5').update(tokensContent).digest('hex');
}

/**
 * 检查是否需要更新版本
 */
async function shouldUpdateVersion() {
  try {
    const versionState = await fs.readJSON(VERSION_FILE);
    const currentHash = await getTokensHash();
    return versionState.tokensHash !== currentHash;
  } catch (error) {
    // 第一次运行，文件不存在
    return true;
  }
}

/**
 * 分析变更类型
 * 智能判断规则：
 * - Major: 删除 token、重命名 token、破坏性变更
 * - Minor: 新增 token、新增 token 类别
 * - Patch: 仅修改现有 token 的值
 */
async function analyzeChangeType() {
  try {
    const versionState = await fs.readJSON(VERSION_FILE);
    const oldTokens = versionState.tokensSnapshot || {};
    const newTokens = await fs.readJSON(TOKENS_PATH);
    
    // 深度分析变更
    const changes = analyzeTokenChanges(oldTokens, newTokens);
    
    // 判断版本类型
    if (changes.deletions.length > 0 || changes.renames.length > 0) {
      console.log('⚠️  检测到可能的破坏性变更 (删除或重命名)');
      console.log('📌 建议手动运行 `npm run version:major` 如果这是有意的破坏性变更');
      console.log('📌 否则将作为 minor 版本处理');
      // 自动模式下，破坏性变更降级为 minor，需要手动确认 major
      return 'minor';
    } else if (changes.additions.length > 0) {
      console.log('🟡 检测到新增 token');
      return 'minor';
    } else if (changes.modifications.length > 0) {
      console.log('🟢 检测到值修改');
      return 'patch';
    }
    
    return 'patch'; // 默认
  } catch (error) {
    // 第一次运行，没有历史记录
    console.log('ℹ️  首次运行，使用 patch 版本');
    return 'patch';
  }
}

/**
 * 深度分析 token 变化
 */
function analyzeTokenChanges(oldTokens, newTokens) {
  const changes = {
    additions: [],
    deletions: [],
    modifications: [],
    renames: []
  };
  
  // 递归收集所有 token 路径
  const oldPaths = collectTokenPaths(oldTokens);
  const newPaths = collectTokenPaths(newTokens);
  
  // 查找删除的 token
  oldPaths.forEach(path => {
    if (!newPaths.has(path)) {
      changes.deletions.push(path);
    }
  });
  
  // 查找新增的 token
  newPaths.forEach(path => {
    if (!oldPaths.has(path)) {
      changes.additions.push(path);
    }
  });
  
  // 查找修改的 token
  oldPaths.forEach(path => {
    if (newPaths.has(path)) {
      const oldValue = getTokenValue(oldTokens, path);
      const newValue = getTokenValue(newTokens, path);
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.modifications.push(path);
      }
    }
  });
  
  // 检测可能的重命名（简单启发式：相同值的 token）
  if (changes.deletions.length > 0 && changes.additions.length > 0) {
    changes.deletions.forEach(deletedPath => {
      const deletedValue = getTokenValue(oldTokens, deletedPath);
      changes.additions.forEach(addedPath => {
        const addedValue = getTokenValue(newTokens, addedPath);
        if (JSON.stringify(deletedValue) === JSON.stringify(addedValue)) {
          changes.renames.push({ from: deletedPath, to: addedPath });
        }
      });
    });
  }
  
  // 打印变更摘要
  console.log('\n📊 Token 变更分析:');
  if (changes.additions.length > 0) {
    console.log(`  ✅ 新增: ${changes.additions.length} 个`);
    changes.additions.slice(0, 3).forEach(p => console.log(`     - ${p}`));
    if (changes.additions.length > 3) console.log(`     ... 还有 ${changes.additions.length - 3} 个`);
  }
  if (changes.deletions.length > 0) {
    console.log(`  ❌ 删除: ${changes.deletions.length} 个`);
    changes.deletions.slice(0, 3).forEach(p => console.log(`     - ${p}`));
  }
  if (changes.modifications.length > 0) {
    console.log(`  ✏️  修改: ${changes.modifications.length} 个`);
    changes.modifications.slice(0, 3).forEach(p => console.log(`     - ${p}`));
  }
  if (changes.renames.length > 0) {
    console.log(`  🔄 重命名: ${changes.renames.length} 个`);
    changes.renames.slice(0, 3).forEach(r => console.log(`     - ${r.from} → ${r.to}`));
  }
  
  return changes;
}

/**
 * 收集所有 token 路径
 */
function collectTokenPaths(obj, currentPath = []) {
  const paths = new Set();
  
  function traverse(node, path) {
    if (node && typeof node === 'object') {
      // 检查是否是 token（有 value 属性）
      if (node.value !== undefined) {
        paths.add(path.join('.'));
      } else {
        // 继续遍历
        Object.keys(node).forEach(key => {
          traverse(node[key], [...path, key]);
        });
      }
    }
  }
  
  traverse(obj, currentPath);
  return paths;
}

/**
 * 获取 token 值
 */
function getTokenValue(tokens, path) {
  const parts = path.split('.');
  let current = tokens;
  
  for (const part of parts) {
    if (current && current[part]) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current.value || current;
}

/**
 * 更新版本号
 */
async function updateVersion(type = 'patch') {
  const currentVersion = await getCurrentVersion();
  const newVersion = semver.inc(currentVersion, type);
  
  // 更新主 package.json
  const pkg = await fs.readJSON(ROOT_PACKAGE);
  pkg.version = newVersion;
  await fs.writeJSON(ROOT_PACKAGE, pkg, { spaces: 2 });
  
  // 更新所有子包的版本
  const packages = ['flutter', 'react', 'tailwind'];
  for (const pkgName of packages) {
    const pkgPath = path.join(__dirname, `../packages/${pkgName}/package.json`);
    if (await fs.pathExists(pkgPath)) {
      const subPkg = await fs.readJSON(pkgPath);
      subPkg.version = newVersion;
      await fs.writeJSON(pkgPath, subPkg, { spaces: 2 });
    }
  }
  
  // 更新 Flutter pubspec.yaml
  const pubspecPath = path.join(__dirname, '../packages/flutter/pubspec.yaml');
  if (await fs.pathExists(pubspecPath)) {
    let pubspecContent = await fs.readFile(pubspecPath, 'utf8');
    pubspecContent = pubspecContent.replace(/version:\s*[\d.]+/, `version: ${newVersion}`);
    await fs.writeFile(pubspecPath, pubspecContent);
  }
  
  // 保存版本状态
  const tokensHash = await getTokensHash();
  const tokens = await fs.readJSON(TOKENS_PATH);
  await fs.writeJSON(VERSION_FILE, {
    version: newVersion,
    tokensHash,
    tokensSnapshot: tokens,
    lastUpdated: new Date().toISOString()
  }, { spaces: 2 });
  
  console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
  return newVersion;
}

/**
 * 主函数
 */
async function main() {
  const command = process.argv[2];
  
  if (command === 'check') {
    // 检查是否需要更新
    const shouldUpdate = await shouldUpdateVersion();
    console.log(shouldUpdate ? 'yes' : 'no');
    process.exit(shouldUpdate ? 0 : 1);
  } else if (command === 'auto') {
    // 自动更新版本
    if (await shouldUpdateVersion()) {
      const changeType = await analyzeChangeType();
      await updateVersion(changeType);
    } else {
      console.log('ℹ️  No token changes detected, version unchanged');
    }
  } else if (command === 'patch' || command === 'minor' || command === 'major') {
    // 手动更新版本
    await updateVersion(command);
  } else {
    // 获取当前版本
    const version = await getCurrentVersion();
    console.log(version);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateVersion, getCurrentVersion, shouldUpdateVersion };