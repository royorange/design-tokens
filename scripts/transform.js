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
  // 使用 token-transformer 处理引用
  const resolved = await transformTokens(tokens, ['global', 'light', 'dark'], {
    expandTypography: true,
    expandShadow: true,
    expandComposition: true,
    preserveRawValue: false,
    resolveReferences: true
  });

  return resolved;
}

/**
 * 生成平台无关的标准 tokens
 */
function generateStandardTokens(resolved) {
  const standard = {
    primitive: {
      color: {},
      spacing: {},
      radius: {},
      fontSize: {}
    },
    semantic: {
      light: {},
      dark: {}
    },
    component: {
      light: {},
      dark: {}
    }
  };

  // 提取原始值
  if (resolved.global) {
    standard.primitive.color = resolved.global.color || {};
    standard.primitive.spacing = resolved.global.spacing || {};
    standard.primitive.radius = resolved.global.radius || {};
    standard.primitive.fontSize = resolved.global.fontSize || {};
  }

  // 提取语义化 tokens
  ['light', 'dark'].forEach(theme => {
    if (resolved[theme]) {
      standard.semantic[theme] = resolved[theme].semantic || {};
      standard.component[theme] = resolved[theme].component || {};
    }
  });

  return standard;
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

  // 分别保存各层
  await fs.writeJSON(
    path.join(OUTPUT_PATH, 'primitive.json'),
    tokens.primitive,
    { spaces: 2 }
  );

  await fs.writeJSON(
    path.join(OUTPUT_PATH, 'semantic.json'),
    tokens.semantic,
    { spaces: 2 }
  );

  await fs.writeJSON(
    path.join(OUTPUT_PATH, 'component.json'),
    tokens.component,
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
    
    // 3. 生成标准格式
    const standardTokens = generateStandardTokens(resolved);
    console.log('✅ Standard format generated');
    
    // 4. 保存结果
    await saveTransformedTokens(standardTokens);
    
    return standardTokens;
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main, loadTokens, transformToStandardFormat, generateStandardTokens };