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

  // 提取原始值 - 从 global 集合中
  if (resolved.global) {
    standard.primitive.color = resolved.global.color || {};
    standard.primitive.spacing = resolved.global.spacing || {};
    standard.primitive.radius = resolved.global.radius || {};
    standard.primitive.fontSize = resolved.global.fontSize || {};
  }

  // 提取 light 主题的语义化和组件 tokens
  if (resolved.light) {
    // Light 主题的 semantic tokens
    if (resolved.light.semantic) {
      standard.semantic.light = resolved.light.semantic;
    }
    // Light 主题的 component tokens
    if (resolved.light.component) {
      standard.component.light = resolved.light.component;
    }
  }

  // 提取 dark 主题的语义化和组件 tokens
  if (resolved.dark) {
    // Dark 主题的 semantic tokens
    if (resolved.dark.semantic) {
      standard.semantic.dark = resolved.dark.semantic;
    }
    // Dark 主题的 component tokens
    if (resolved.dark.component) {
      standard.component.dark = resolved.dark.component;
    }
  }

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
    
    // 调试：查看 resolved 结构
    console.log('Resolved structure:', Object.keys(resolved));
    
    // 调试：查看更详细的结构
    if (resolved.global) {
      console.log('Global keys:', Object.keys(resolved.global));
    }
    if (resolved.light) {
      console.log('Light keys:', Object.keys(resolved.light));
      if (resolved.light.semantic) {
        console.log('Light semantic:', JSON.stringify(resolved.light.semantic, null, 2).substring(0, 200));
      }
    }
    if (resolved.dark) {
      console.log('Dark keys:', Object.keys(resolved.dark));
    }
    
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