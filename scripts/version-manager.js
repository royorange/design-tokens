const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const semver = require('semver');

/**
 * 简化的版本管理脚本
 * 使用 Git 提交的方式跟踪 token hash
 */

const ROOT_PACKAGE = path.join(__dirname, '../package.json');
const TOKENS_PATH = path.join(__dirname, '../tokens/figma/tokens.json');
const HASH_FILE = path.join(__dirname, '../tokens/.token-info.json');

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
  const tokensContent = await fs.readFile(TOKENS_PATH, 'utf8');
  // 只计算内容的 hash，忽略格式化差异
  const normalizedContent = JSON.stringify(JSON.parse(tokensContent));
  return crypto.createHash('md5').update(normalizedContent).digest('hex');
}

/**
 * 检查是否需要更新版本
 */
async function shouldUpdateVersion() {
  try {
    const currentHash = await getTokensHash();
    
    // 读取上次的信息
    if (await fs.pathExists(HASH_FILE)) {
      const tokenInfo = await fs.readJSON(HASH_FILE);
      return tokenInfo.hash !== currentHash;
    }
    
    // 首次运行
    return true;
  } catch (error) {
    console.error('Error checking version:', error);
    return true;
  }
}

/**
 * 简单的变更分析
 * 由于没有历史快照，只能通过 Git 历史分析
 */
async function analyzeChangeType() {
  // 检查是否有 tokens 文件的 git 历史
  const { execSync } = require('child_process');
  
  try {
    // 获取上次提交的 tokens 内容
    const lastTokens = execSync(
      `git show HEAD:tokens/figma/tokens.json 2>/dev/null`,
      { encoding: 'utf8' }
    );
    
    const oldTokens = JSON.parse(lastTokens);
    const newTokens = await fs.readJSON(TOKENS_PATH);
    
    // 简单对比
    const oldKeys = Object.keys(JSON.flatten(oldTokens)).sort();
    const newKeys = Object.keys(JSON.flatten(newTokens)).sort();
    
    // 有删除的 key
    const deletedKeys = oldKeys.filter(k => !newKeys.includes(k));
    if (deletedKeys.length > 0) {
      console.log('⚠️  检测到删除的 tokens，建议手动设置 major 版本');
      return 'minor'; // 安全起见，自动只升 minor
    }
    
    // 有新增的 key
    const addedKeys = newKeys.filter(k => !oldKeys.includes(k));
    if (addedKeys.length > 0) {
      console.log('✅ 检测到新增的 tokens');
      return 'minor';
    }
    
    // 只有值变化
    console.log('✏️  检测到 token 值变化');
    return 'patch';
    
  } catch (error) {
    // Git 历史不存在或其他错误，默认 patch
    console.log('ℹ️  无法获取 Git 历史，使用 patch 版本');
    return 'patch';
  }
}

/**
 * 统计 token 数量
 */
async function countTokens() {
  try {
    const tokens = await fs.readJSON(TOKENS_PATH);
    let count = 0;
    
    function countRecursive(obj) {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          if (obj[key].value !== undefined && obj[key].type !== undefined) {
            // 这是一个 token
            count++;
          } else {
            // 递归计数
            countRecursive(obj[key]);
          }
        }
      }
    }
    
    countRecursive(tokens);
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * 扁平化对象用于比较
 */
JSON.flatten = function(data) {
  const result = {};
  
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (let i = 0; i < cur.length; i++) {
        recurse(cur[i], prop + "[" + i + "]");
      }
      if (cur.length === 0) {
        result[prop] = [];
      }
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }
  
  recurse(data, "");
  return result;
};

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
  const packages = ['flutter', 'css', 'tailwind'];
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
  
  // 保存新的 token 信息（这个文件会被提交）
  const newHash = await getTokensHash();
  
  // 获取东八区时间（北京时间）ISO 格式
  const now = new Date();
  const utcTime = now.getTime();
  const beijingTime = new Date(utcTime + (8 * 60 * 60 * 1000));
  // 将 UTC 时间转换为北京时间的 ISO 格式，并替换 Z 为 +08:00
  const formattedTime = beijingTime.toISOString().replace('Z', '+08:00');
  
  const tokenInfo = {
    hash: newHash,
    version: newVersion,
    updatedAt: formattedTime,
    updatedBy: process.env.CI ? 'CI/CD' : 'local',
    tokenCount: await countTokens()
  };
  
  await fs.ensureDir(path.dirname(HASH_FILE));
  await fs.writeJSON(HASH_FILE, tokenInfo, { spaces: 2 });
  
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
  } else if (command === 'info') {
    // 显示 token 信息
    if (await fs.pathExists(HASH_FILE)) {
      const info = await fs.readJSON(HASH_FILE);
      console.log('\n📊 Token Information:');
      console.log(`  Version: ${info.version}`);
      console.log(`  Updated: ${info.updatedAt}`);
      console.log(`  Updated by: ${info.updatedBy}`);
      console.log(`  Token count: ${info.tokenCount}`);
      console.log(`  Hash: ${info.hash}\n`);
    } else {
      console.log('ℹ️  No token information available (first run)');
    }
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