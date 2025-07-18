const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

/**
 * Tailwind CSS 构建脚本
 * 生成与现有配置兼容的 tokens
 */

const TOKENS_PATH = path.join(__dirname, '../tokens/transformed/tokens.json');
const OUTPUT_PATH = path.join(__dirname, '../packages/tailwind');

// 确保输出目录存在
fs.ensureDirSync(OUTPUT_PATH);

/**
 * 转换颜色格式
 */
function processColors(colors) {
  const result = {};
  
  Object.entries(colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'object' && !shades.value) {
      result[colorName] = {};
      Object.entries(shades).forEach(([shade, config]) => {
        result[colorName][shade] = config.value;
      });
    } else if (shades.value) {
      result[colorName] = shades.value;
    }
  });
  
  return result;
}

/**
 * 转换间距值
 */
function processSpacing(spacing) {
  const result = {};
  
  Object.entries(spacing).forEach(([key, config]) => {
    // 保持数字键名以兼容 p-4, m-8 等类名
    result[key] = `${config.value}px`;
  });
  
  // 添加额外的语义化命名
  result.xs = result['1'];
  result.sm = result['2'];
  result.md = result['4'];
  result.lg = result['6'];
  result.xl = result['8'];
  result['2xl'] = result['12'];
  result['3xl'] = result['16'];
  
  return result;
}

/**
 * 转换圆角值
 */
function processBorderRadius(radius) {
  const result = {};
  
  Object.entries(radius).forEach(([key, config]) => {
    result[key] = config.value === '9999' ? '9999px' : `${config.value}px`;
  });
  
  return result;
}

/**
 * 生成语义化颜色
 */
function generateSemanticColors(semantic) {
  const result = {};
  
  // Light mode semantic colors
  if (semantic.light?.color) {
    const lightColors = semantic.light.color;
    
    if (lightColors.background) {
      result.surface = lightColors.background.base?.value || '#FFFFFF';
      result['surface-elevated'] = lightColors.background.elevated?.value || '#F8FAFC';
    }
    
    if (lightColors.text) {
      result['text-primary'] = lightColors.text.primary?.value || '#111827';
      result['text-secondary'] = lightColors.text.secondary?.value || '#6B7280';
      result['text-disabled'] = lightColors.text.disabled?.value || '#9CA3AF';
    }
    
    if (lightColors.border) {
      result['border-default'] = lightColors.border.default?.value || '#D1D5DB';
      result['border-focus'] = lightColors.border.focus?.value || '#4F46E5';
    }
  }
  
  return result;
}

/**
 * 生成 Tailwind 配置
 */
async function buildTailwindConfig(tokens) {
  // 处理原始 tokens
  const colors = processColors(tokens.primitive.color);
  const spacing = processSpacing(tokens.primitive.spacing);
  const borderRadius = processBorderRadius(tokens.primitive.radius);
  
  // 生成语义化颜色
  const semanticColors = generateSemanticColors(tokens.semantic);
  
  // 组合配置
  const config = {
    colors: {
      ...colors,
      // 添加额外的兼容颜色
      transparent: 'transparent',
      current: 'currentColor',
      
      // 补充缺失的颜色定义以保持兼容
      emerald: require('tailwindcss/colors').emerald,
      slate: require('tailwindcss/colors').slate,
      zinc: require('tailwindcss/colors').zinc,
      sky: require('tailwindcss/colors').sky,
      indigo: require('tailwindcss/colors').indigo,
      
      // 自定义颜色
      accent: '#4d62e5',
      
      // 添加缺失的颜色定义
      secondary: {
        50: '#F8FAFC',
        100: '#ffffff',
        150: '#F3F4F6',
        200: '#f7f9fb',
        250: '#F3F4F6',
        300: '#f0f5f9',
        400: '#e1ebf5',
      },
      
      red: {
        50: '#FFEBEE',
        100: '#FFCDD2',
        200: '#EF9A9A',
        300: '#EF5350',
        400: '#DC2626',
        500: '#C73039',
        600: '#A62830',
        700: '#852026',
        800: '#691A1E',
        900: '#3E0C0E'
      },
      
      blue: {
        50: '#F2F7FF',
        100: '#E6F0FF',
        200: '#CFE2FF',
        300: '#96C0FF',
        400: '#6BA6FF',
        500: '#2B7FFF',
        600: '#0065FF',
        700: '#0357D8',
        800: '#0047B3',
        900: '#003E9C'
      },
      
      cyan: {
        50: '#E6FEF8',
        100: '#B5F5EC',
        200: '#87E8DE',
        300: '#5CDBD3',
        400: '#36CFC9',
        500: '#13C2C2',
        600: '#08979C',
        700: '#006D75',
        800: '#00474F',
        900: '#002329'
      },
      
      green: {
        50: '#F6FFED',
        100: '#D9F7BE',
        200: '#B7EB8F',
        300: '#95DE64',
        400: '#73D13D',
        500: '#52C41A',
        600: '#389E0D',
        700: '#237804',
        800: '#135200',
        900: '#092B00',
      },
      
      orange: {
        50: '#FFF7E6',
        100: '#FFE7BA',
        200: '#FFD591',
        300: '#FFC069',
        400: '#FFA940',
        500: '#FA8C16',
        600: '#D46B08',
        700: '#AD4E00',
        800: '#873800',
        900: '#612500',
      },
      
      yellow: {
        50: '#FEFFE6',
        100: '#FFFFB8',
        200: '#FFF77E',
        300: '#FFF566',
        400: '#FADB14',
        500: '#EBCC07',
        600: '#D4B106',
        700: '#AD8B00',
        800: '#876800',
        900: '#614700'
      },
      
      purple: {
        ...require('tailwindcss/colors').purple,
        100: '#f7f0ff',
        200: '#d8bfff',
        300: '#6B35EC',
      },
      
      trade: {
        long: {
          50: '#FFF5F6',
          200: '#FF5361',
          400: '#FF5361',
          900: '#2A191A'
        },
        short: {
          50: '#F0FFFB',
          200: '#09D274',
          400: '#09D274',
          900: '#0F1B15'
        }
      },
      
      background: {
        100: '#F8FAFC',
        200: '#F2F3F5'
      }
    },
    
    spacing,
    borderRadius,
    
    // 语义化颜色作为 CSS 变量
    semanticColors,
    
    // 组件 tokens
    components: generateComponentTokens(tokens.component)
  };
  
  return config;
}

/**
 * 生成组件 tokens
 */
function generateComponentTokens(componentTokens) {
  const components = {};
  
  // 处理 light 和 dark 主题的组件
  ['light', 'dark'].forEach(theme => {
    if (componentTokens[theme]) {
      Object.entries(componentTokens[theme]).forEach(([componentName, componentConfig]) => {
        if (!components[componentName]) {
          components[componentName] = {};
        }
        components[componentName][theme] = componentConfig;
      });
    }
  });
  
  return components;
}

/**
 * 生成 index.js
 */
function generateIndexFile(config) {
  let content = '// Generated by Design Tokens - DO NOT EDIT\n';
  content += '// Last updated: ' + new Date().toISOString() + '\n\n';
  content += 'const colors = require(\'tailwindcss/colors\');\n\n';
  
  content += 'module.exports = {\n';
  content += '  colors: ' + JSON.stringify(config.colors, null, 2).replace(/"require\('tailwindcss\/colors'\)\.(\w+)"/g, 'colors.$1') + ',\n\n';
  content += '  spacing: ' + JSON.stringify(config.spacing, null, 2) + ',\n\n';
  content += '  borderRadius: ' + JSON.stringify(config.borderRadius, null, 2) + ',\n\n';
  content += '  semanticColors: ' + JSON.stringify(config.semanticColors, null, 2) + ',\n\n';
  
  // Plugin for CSS variables
  content += '  plugin: function({ addBase, theme }) {\n';
  content += '    addBase({\n';
  content += '      \':root\': {\n';
  
  // 添加 CSS 变量
  Object.entries(config.semanticColors).forEach(([key, value]) => {
    content += `        '--color-${key}': '${value}',\n`;
  });
  
  content += '      },\n';
  content += '    });\n';
  content += '  }\n';
  content += '};\n';
  
  return content;
}

/**
 * 生成 TypeScript 定义
 */
function generateTypeDefinitions() {
  let content = '// Generated by Design Tokens - DO NOT EDIT\n\n';
  content += 'export interface DesignTokens {\n';
  content += '  colors: Record<string, string | Record<string, string>>;\n';
  content += '  spacing: Record<string, string>;\n';
  content += '  borderRadius: Record<string, string>;\n';
  content += '  semanticColors: Record<string, string>;\n';
  content += '  plugin: (helpers: any) => void;\n';
  content += '}\n\n';
  content += 'declare const tokens: DesignTokens;\n';
  content += 'export default tokens;\n';
  
  return content;
}

/**
 * 主构建函数
 */
async function buildTailwind() {
  try {
    console.log('🔄 Building Tailwind package...');
    
    // 读取 tokens
    const tokens = await fs.readJSON(TOKENS_PATH);
    
    // 生成配置
    const config = await buildTailwindConfig(tokens);
    
    // 写入主文件
    await fs.writeFile(
      path.join(OUTPUT_PATH, 'index.js'),
      generateIndexFile(config)
    );
    
    // 写入 TypeScript 定义
    await fs.writeFile(
      path.join(OUTPUT_PATH, 'index.d.ts'),
      generateTypeDefinitions()
    );
    
    // 创建 package.json
    const packageJson = {
      name: '@wisburg/design-tokens-tailwind',
      version: '1.0.0',
      description: 'Design tokens for Tailwind CSS',
      main: 'index.js',
      types: 'index.d.ts',
      peerDependencies: {
        'tailwindcss': '>=3.0.0'
      },
      dependencies: {
        'tailwindcss': '^3.0.0'
      }
    };
    
    await fs.writeJSON(
      path.join(OUTPUT_PATH, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
    
    // 创建示例配置
    const exampleConfig = `// Example tailwind.config.js
const designTokens = require('@wisburg/design-tokens-tailwind');

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    // 直接使用 design tokens
    colors: designTokens.colors,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
    
    extend: {
      // 可以添加额外的自定义值
    }
  },
  plugins: [
    designTokens.plugin, // 添加 CSS 变量支持
  ],
};
`;
    
    await fs.writeFile(
      path.join(OUTPUT_PATH, 'tailwind.config.example.js'),
      exampleConfig
    );
    
    console.log('✅ Tailwind package built successfully');
    
  } catch (error) {
    console.error('❌ Tailwind build failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  buildTailwind();
}

module.exports = { buildTailwind };