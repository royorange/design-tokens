const fs = require('fs-extra');
const path = require('path');

/**
 * Token 验证脚本
 * 确保 tokens 格式正确且引用有效
 */

const TOKENS_PATH = path.join(__dirname, '../tokens/figma/tokens.json');

/**
 * 验证颜色格式
 */
function isValidColor(value) {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbaRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
  return hexRegex.test(value) || rgbaRegex.test(value);
}

/**
 * 验证数字值
 */
function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * 验证引用
 */
function isValidReference(value) {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}

/**
 * 验证 token
 */
function validateToken(token, path) {
  const errors = [];
  
  if (!token.value) {
    errors.push(`Missing value at ${path}`);
    return errors;
  }
  
  if (!token.type) {
    errors.push(`Missing type at ${path}`);
    return errors;
  }
  
  // 如果是引用，暂时跳过验证
  if (isValidReference(token.value)) {
    return errors;
  }
  
  // 根据类型验证值
  switch (token.type) {
    case 'color':
      if (!isValidColor(token.value)) {
        errors.push(`Invalid color value "${token.value}" at ${path}`);
      }
      break;
      
    case 'spacing':
    case 'borderRadius':
    case 'fontSizes':
      if (!isValidNumber(token.value)) {
        errors.push(`Invalid numeric value "${token.value}" at ${path}`);
      }
      break;
      
    default:
      // 其他类型暂时不验证
      break;
  }
  
  return errors;
}

/**
 * 递归验证 tokens
 */
function validateTokensRecursive(obj, path = []) {
  let errors = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = [...path, key].join('.');
    
    if (value && typeof value === 'object') {
      if (value.value !== undefined && value.type !== undefined) {
        // 这是一个 token
        errors = errors.concat(validateToken(value, currentPath));
      } else {
        // 这是一个容器，继续递归
        errors = errors.concat(validateTokensRecursive(value, [...path, key]));
      }
    }
  });
  
  return errors;
}

/**
 * 主验证函数
 */
async function validateTokens() {
  try {
    console.log('🔍 Validating tokens...\n');
    
    // 检查文件是否存在
    if (!await fs.pathExists(TOKENS_PATH)) {
      console.error('❌ Tokens file not found at:', TOKENS_PATH);
      process.exit(1);
    }
    
    // 读取 tokens
    const tokensRaw = await fs.readFile(TOKENS_PATH, 'utf8');
    let tokens;
    
    // 验证 JSON 格式
    try {
      tokens = JSON.parse(tokensRaw);
    } catch (error) {
      console.error('❌ Invalid JSON format:', error.message);
      process.exit(1);
    }
    
    // 验证结构
    const requiredSets = ['global'];
    const missingSets = requiredSets.filter(set => !tokens[set]);
    
    if (missingSets.length > 0) {
      console.error('❌ Missing required token sets:', missingSets.join(', '));
      process.exit(1);
    }
    
    // 递归验证所有 tokens
    let allErrors = [];
    Object.entries(tokens).forEach(([setName, setTokens]) => {
      console.log(`Validating "${setName}" tokens...`);
      const errors = validateTokensRecursive(setTokens, [setName]);
      allErrors = allErrors.concat(errors);
    });
    
    // 报告结果
    if (allErrors.length > 0) {
      console.error('\n❌ Validation failed with errors:\n');
      allErrors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    } else {
      console.log('\n✅ All tokens are valid!');
      
      // 统计信息
      const stats = getTokenStats(tokens);
      console.log('\n📊 Token Statistics:');
      console.log(`  - Token sets: ${Object.keys(tokens).length}`);
      console.log(`  - Total tokens: ${stats.total}`);
      console.log(`  - Colors: ${stats.colors}`);
      console.log(`  - Spacing: ${stats.spacing}`);
      console.log(`  - Border radius: ${stats.borderRadius}`);
      console.log(`  - Font sizes: ${stats.fontSizes}`);
    }
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    process.exit(1);
  }
}

/**
 * 获取 token 统计信息
 */
function getTokenStats(tokens) {
  const stats = {
    total: 0,
    colors: 0,
    spacing: 0,
    borderRadius: 0,
    fontSizes: 0
  };
  
  function countTokens(obj) {
    Object.values(obj).forEach(value => {
      if (value && typeof value === 'object') {
        if (value.type) {
          stats.total++;
          switch (value.type) {
            case 'color':
              stats.colors++;
              break;
            case 'spacing':
              stats.spacing++;
              break;
            case 'borderRadius':
              stats.borderRadius++;
              break;
            case 'fontSizes':
              stats.fontSizes++;
              break;
          }
        } else {
          countTokens(value);
        }
      }
    });
  }
  
  Object.values(tokens).forEach(setTokens => {
    countTokens(setTokens);
  });
  
  return stats;
}

// 如果直接运行此脚本
if (require.main === module) {
  validateTokens();
}

module.exports = { validateTokens };