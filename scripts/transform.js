const fs = require('fs-extra');
const path = require('path');
const { transformTokens } = require('token-transformer');

/**
 * Token 转换主逻辑
 * 将 Figma Tokens Studio 格式转换为标准格式
 */

const INPUT_PATH = path.join(__dirname, '../tokens/figma/tokens.json');
const OUTPUT_PATH = path.join(__dirname, '../tokens/transformed');

// 确保输出目录存在
fs.ensureDirSync(OUTPUT_PATH);

/**
 * 读取并解析 tokens
 */
async function loadTokens() {
  try {
    const tokensRaw = await fs.readFile(INPUT_PATH, 'utf8');
    return JSON.parse(tokensRaw);
  } catch (error) {
    console.error('Error loading tokens:', error);
    throw error;
  }
}

/**
 * 转换 tokens 到标准格式
 */
async function transformToStandardFormat(tokens) {
  const transformerOptions = {
    expandTypography: true,
    expandShadow: true,
    expandComposition: true,
    expandBorder: true,
    preserveRawValue: true,  // 保留原始值，这样可以看到引用
    throwErrorWhenNotResolved: false,
    resolveReferences: true
  };

  // 分别处理每个主题以保持结构
  const result = {};
  
  // 处理 global tokens
  const globalResolved = await transformTokens(tokens, ['global'], [], transformerOptions);
  result.global = globalResolved;
  
  // 处理 light 主题
  const lightResolved = await transformTokens(tokens, ['global', 'light'], [], transformerOptions);
  result.light = lightResolved;
  
  // 处理 dark 主题
  const darkResolved = await transformTokens(tokens, ['global', 'dark'], [], transformerOptions);
  result.dark = darkResolved;

  return result;
}

/**
 * 保存转换后的 tokens
 */
async function saveTransformedTokens(tokens) {
  // 保存完整的 tokens
  await fs.writeJSON(
    path.join(OUTPUT_PATH, 'tokens.json'),
    tokens,
    { spaces: 2 }
  );

  console.log('✅ Tokens transformed successfully');
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔄 Starting token transformation...');
    
    // 1. 加载原始 tokens
    const rawTokens = await loadTokens();
    console.log('✅ Tokens loaded');
    
    // 2. 转换格式
    const resolved = await transformToStandardFormat(rawTokens);
    console.log('✅ References resolved');
    
    // 调试：查看 resolved 结构
    console.log('Resolved structure:', Object.keys(resolved));
    
    // 3. 保存结果
    await saveTransformedTokens(resolved);
    
    return resolved;
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main, loadTokens, transformToStandardFormat };