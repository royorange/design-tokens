const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

/**
 * Flutter 构建脚本
 * 生成 Dart 文件，包含 ColorScheme 和 ThemeData
 */

const TOKENS_PATH = path.join(__dirname, '../tokens/transformed/tokens.json');
const OUTPUT_PATH = path.join(__dirname, '../packages/flutter/lib');

// 确保输出目录存在
fs.ensureDirSync(OUTPUT_PATH);

/**
 * 将 hex 颜色转换为 Flutter Color
 */
function hexToFlutterColor(hex) {
  const cleanHex = hex.replace('#', '');
  return `Color(0xFF${cleanHex.toUpperCase()})`;
}

/**
 * 生成颜色常量
 */
function generateColorConstants(colors) {
  let code = '/// 颜色常量定义\nclass AppColors {\n';
  
  // 生成原始颜色
  Object.entries(colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'object' && !shades.value) {
      code += `\n  // ${_.startCase(colorName)} Colors\n`;
      Object.entries(shades).forEach(([shade, config]) => {
        const varName = `${colorName}${shade}`;
        code += `  static const Color ${varName} = ${hexToFlutterColor(config.value)};\n`;
      });
    } else if (shades.value) {
      code += `  static const Color ${colorName} = ${hexToFlutterColor(shades.value)};\n`;
    }
  });
  
  code += '}\n';
  return code;
}

/**
 * 生成间距常量
 */
function generateSpacingConstants(spacing) {
  let code = '\n/// 间距常量定义\nclass AppSpacing {\n';
  
  if (spacing) {
    Object.entries(spacing).forEach(([key, config]) => {
      const value = parseInt(config.value);
      code += `  static const double spacing${key} = ${value}.0;\n`;
    });
  }
  
  code += '}\n';
  return code;
}

/**
 * 生成圆角常量
 */
function generateRadiusConstants(radius) {
  let code = '\n/// 圆角常量定义\nclass AppRadius {\n';
  
  if (radius) {
    Object.entries(radius).forEach(([key, config]) => {
      const value = parseInt(config.value);
      code += `  static const double ${key} = ${value}.0;\n`;
    });
  }
  
  code += '}\n';
  return code;
}

/**
 * 生成字体大小常量
 */
function generateFontSizeConstants(fontSize) {
  let code = '\n/// 字体大小常量定义\nclass AppFontSizes {\n';
  
  if (fontSize) {
    Object.entries(fontSize).forEach(([key, config]) => {
      const value = parseInt(config.value);
      // 处理数字开头的 key
      const dartKey = key.match(/^\d/) ? 'size' + key : key;
      code += `  static const double ${dartKey} = ${value}.0;\n`;
    });
  }
  
  code += '}\n';
  return code;
}

/**
 * 生成语义化颜色 ThemeExtension
 */
function generateSemanticColors(semantic) {
  if (!semantic || !semantic.light || !semantic.dark) {
    return '';
  }
  
  let code = '\n/// 语义化颜色 Theme Extension\n';
  code += '@immutable\n';
  code += 'class AppColorsExtension extends ThemeExtension<AppColorsExtension> {\n';
  code += '  const AppColorsExtension({\n';
  
  // 收集所有语义化字段（从 light 和 dark 中取并集）
  const fields = new Set();
  
  ['light', 'dark'].forEach(theme => {
    if (semantic[theme] && semantic[theme].color) {
      Object.entries(semantic[theme].color).forEach(([category, items]) => {
        Object.entries(items).forEach(([key, config]) => {
          const fieldName = `${category}${_.upperFirst(key)}`;
          fields.add(fieldName);
        });
      });
    }
  });
  
  // 生成构造函数参数
  fields.forEach((name) => {
    code += `    required this.${name},\n`;
  });
  
  code += '  });\n\n';
  
  // 生成字段
  fields.forEach((name) => {
    code += `  final Color ${name};\n`;
  });
  
  // 生成 copyWith 方法
  code += '\n  @override\n';
  code += '  AppColorsExtension copyWith({\n';
  fields.forEach((name) => {
    code += `    Color? ${name},\n`;
  });
  code += '  }) {\n';
  code += '    return AppColorsExtension(\n';
  fields.forEach((name) => {
    code += `      ${name}: ${name} ?? this.${name},\n`;
  });
  code += '    );\n';
  code += '  }\n';
  
  // 生成 lerp 方法
  code += '\n  @override\n';
  code += '  AppColorsExtension lerp(ThemeExtension<AppColorsExtension>? other, double t) {\n';
  code += '    if (other is! AppColorsExtension) {\n';
  code += '      return this;\n';
  code += '    }\n';
  code += '    return AppColorsExtension(\n';
  fields.forEach((name) => {
    code += `      ${name}: Color.lerp(${name}, other.${name}, t)!,\n`;
  });
  code += '    );\n';
  code += '  }\n';
  
  // 生成 light 主题静态实例
  code += '\n  /// Light theme colors\n';
  code += '  static const light = AppColorsExtension(\n';
  if (semantic.light && semantic.light.color) {
    Object.entries(semantic.light.color).forEach(([category, items]) => {
      Object.entries(items).forEach(([key, config]) => {
        const fieldName = `${category}${_.upperFirst(key)}`;
        // 优先使用 rawValue（包含引用），如果没有则使用 value
        const rawValue = config.rawValue || config.value;
        
        if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
          // 处理引用 - 例如 {color.neutral.900} -> AppColors.neutral900
          const ref = rawValue.slice(1, -1); // 移除花括号
          const parts = ref.split('.');
          if (parts[0] === 'color') {
            if (parts.length === 2) {
              // 例如 {color.white} -> AppColors.white
              code += `    ${fieldName}: AppColors.${parts[1]},\n`;
            } else if (parts.length === 3) {
              // 例如 {color.neutral.900} -> AppColors.neutral900
              code += `    ${fieldName}: AppColors.${parts[1]}${parts[2]},\n`;
            }
          }
        } else if (rawValue.startsWith('#')) {
          code += `    ${fieldName}: ${hexToFlutterColor(rawValue)},\n`;
        }
      });
    });
  }
  code += '  );\n';
  
  // 生成 dark 主题静态实例
  code += '\n  /// Dark theme colors\n';
  code += '  static const dark = AppColorsExtension(\n';
  if (semantic.dark && semantic.dark.color) {
    Object.entries(semantic.dark.color).forEach(([category, items]) => {
      Object.entries(items).forEach(([key, config]) => {
        const fieldName = `${category}${_.upperFirst(key)}`;
        // 优先使用 rawValue（包含引用），如果没有则使用 value
        const rawValue = config.rawValue || config.value;
        
        if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
          // 处理引用
          const ref = rawValue.slice(1, -1);
          const parts = ref.split('.');
          if (parts[0] === 'color') {
            if (parts.length === 2) {
              code += `    ${fieldName}: AppColors.${parts[1]},\n`;
            } else if (parts.length === 3) {
              code += `    ${fieldName}: AppColors.${parts[1]}${parts[2]},\n`;
            }
          }
        } else if (rawValue.startsWith('#')) {
          code += `    ${fieldName}: ${hexToFlutterColor(rawValue)},\n`;
        }
      });
    });
  }
  code += '  );\n';
  
  code += '}\n';
  
  return code;
}

/**
 * 生成组件 tokens
 */
function generateComponentTokens(component) {
  if (!component || (!component.light && !component.dark)) {
    return '';
  }
  
  let code = '\n/// 组件级别 Tokens\n';
  
  // 收集所有组件类型
  const componentTypes = new Set();
  ['light', 'dark'].forEach(theme => {
    if (component[theme]) {
      Object.keys(component[theme]).forEach(type => componentTypes.add(type));
    }
  });
  
  // 为每个组件类型生成 token 类
  componentTypes.forEach(componentType => {
    if (componentType === 'button') {
      // 收集所有按钮属性
      const buttonProps = new Map();
      
      // 从 light 和 dark 主题中收集所有可能的属性
      ['light', 'dark'].forEach(theme => {
        if (component[theme] && component[theme].button) {
          const button = component[theme].button;
          
          // 处理 primary 变体中的颜色属性
          if (button.primary) {
            Object.entries(button.primary).forEach(([key, value]) => {
              if (typeof value === 'object' && value.type === 'color') {
                // 将 background-hover 转换为 backgroundHover
                const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                const propName = `primary${_.upperFirst(camelKey)}`;
                buttonProps.set(propName, 'color');
              }
            });
          }
          
          // 处理其他顶层属性（如 padding, radius）
          Object.entries(button).forEach(([key, value]) => {
            if (key !== 'primary' && typeof value === 'object' && value.type) {
              buttonProps.set(key, value.type);
            }
          });
        }
      });
      
      // 生成 ButtonTokens 类
      code += 'class ButtonTokens {\n';
      code += '  const ButtonTokens({\n';
      
      // 生成构造函数参数
      buttonProps.forEach((type, key) => {
        const propName = key.replace(/-/g, '_');
        if (type === 'color') {
          code += `    required this.${propName},\n`;
        }
      });
      
      // 添加间距和圆角属性
      code += '    required this.paddingX,\n';
      code += '    required this.paddingY,\n';
      code += '    required this.radius,\n';
      
      code += '  });\n\n';
      
      // 生成字段
      buttonProps.forEach((type, key) => {
        const propName = key.replace(/-/g, '_');
        if (type === 'color') {
          code += `  final Color ${propName};\n`;
        }
      });
      
      code += '  final double paddingX;\n';
      code += '  final double paddingY;\n';
      code += '  final double radius;\n';
      
      // 生成 light 静态实例
      if (component.light && component.light.button) {
        code += '\n  static const light = ButtonTokens(\n';
        
        const lightButton = component.light.button;
        
        // 处理 primary 变体的颜色属性
        if (lightButton.primary) {
          const colorProps = [];
          Object.entries(lightButton.primary).forEach(([key, config]) => {
            if (config && config.type === 'color') {
              colorProps.push([key, config]);
            }
          });
          
          // 按键名排序
          colorProps.sort((a, b) => a[0].localeCompare(b[0]));
          
          colorProps.forEach(([key, config]) => {
            // 将 background-hover 转换为 backgroundHover
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            const propName = `primary${_.upperFirst(camelKey)}`;
            const rawValue = config.rawValue || config.value;
            
            if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
              const ref = rawValue.slice(1, -1);
              const parts = ref.split('.');
              if (parts[0] === 'color') {
                if (parts.length === 2) {
                  code += `    ${propName}: AppColors.${parts[1]},\n`;
                } else if (parts.length === 3) {
                  code += `    ${propName}: AppColors.${parts[1]}${parts[2]},\n`;
                }
              }
            } else if (rawValue.startsWith('#')) {
              code += `    ${propName}: ${hexToFlutterColor(rawValue)},\n`;
            }
          });
        }
        
        // 处理间距和圆角
        if (lightButton.padding) {
          const paddingX = lightButton.padding.x;
          const paddingY = lightButton.padding.y;
          
          if (paddingX) {
            const rawValue = paddingX.rawValue || paddingX.value;
            if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
              const ref = rawValue.slice(1, -1).replace('spacing.', '');
              code += `    paddingX: AppSpacing.spacing${ref},\n`;
            } else {
              code += `    paddingX: ${paddingX.value}.0,\n`;
            }
          }
          
          if (paddingY) {
            const rawValue = paddingY.rawValue || paddingY.value;
            if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
              const ref = rawValue.slice(1, -1).replace('spacing.', '');
              code += `    paddingY: AppSpacing.spacing${ref},\n`;
            } else {
              code += `    paddingY: ${paddingY.value}.0,\n`;
            }
          }
        }
        
        if (lightButton.radius) {
          const rawValue = lightButton.radius.rawValue || lightButton.radius.value;
          if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
            const ref = rawValue.slice(1, -1).replace('radius.', '');
            code += `    radius: AppRadius.${ref},\n`;
          } else {
            code += `    radius: ${lightButton.radius.value}.0,\n`;
          }
        }
        
        code += '  );\n';
      }
      
      // 生成 dark 静态实例
      if (component.dark && component.dark.button) {
        code += '\n  static const dark = ButtonTokens(\n';
        
        const darkButton = component.dark.button;
        
        // 处理 primary 变体的颜色属性
        if (darkButton.primary) {
          const colorProps = [];
          Object.entries(darkButton.primary).forEach(([key, config]) => {
            if (config && config.type === 'color') {
              colorProps.push([key, config]);
            }
          });
          
          // 按键名排序
          colorProps.sort((a, b) => a[0].localeCompare(b[0]));
          
          colorProps.forEach(([key, config]) => {
            // 将 background-hover 转换为 backgroundHover
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            const propName = `primary${_.upperFirst(camelKey)}`;
            const rawValue = config.rawValue || config.value;
            
            if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
              const ref = rawValue.slice(1, -1);
              const parts = ref.split('.');
              if (parts[0] === 'color') {
                if (parts.length === 2) {
                  code += `    ${propName}: AppColors.${parts[1]},\n`;
                } else if (parts.length === 3) {
                  code += `    ${propName}: AppColors.${parts[1]}${parts[2]},\n`;
                }
              }
            } else if (rawValue.startsWith('#')) {
              code += `    ${propName}: ${hexToFlutterColor(rawValue)},\n`;
            }
          });
        }
        
        // Dark 主题可能没有定义间距和圆角，使用 light 的值
        if (component.light && component.light.button && component.light.button.padding) {
          const paddingX = component.light.button.padding.x;
          const paddingY = component.light.button.padding.y;
          
          if (paddingX) {
            const rawValue = paddingX.rawValue || paddingX.value;
            if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
              const ref = rawValue.slice(1, -1).replace('spacing.', '');
              code += `    paddingX: AppSpacing.spacing${ref},\n`;
            } else {
              code += `    paddingX: ${paddingX.value}.0,\n`;
            }
          }
          
          if (paddingY) {
            const rawValue = paddingY.rawValue || paddingY.value;
            if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
              const ref = rawValue.slice(1, -1).replace('spacing.', '');
              code += `    paddingY: AppSpacing.spacing${ref},\n`;
            } else {
              code += `    paddingY: ${paddingY.value}.0,\n`;
            }
          }
        }
        
        if (component.light && component.light.button && component.light.button.radius) {
          const rawValue = component.light.button.radius.rawValue || component.light.button.radius.value;
          if (typeof rawValue === 'string' && rawValue.startsWith('{')) {
            const ref = rawValue.slice(1, -1).replace('radius.', '');
            code += `    radius: AppRadius.${ref},\n`;
          } else {
            code += `    radius: ${component.light.button.radius.value}.0,\n`;
          }
        }
        
        code += '  );\n';
      }
      
      code += '}\n';
    }
  });
  
  return code;
}

/**
 * 生成 ColorScheme
 */
function generateColorSchemes(semantic, primitive) {
  let code = '\n/// Material 3 ColorScheme definitions\nclass AppColorSchemes {\n';
  
  // Light ColorScheme
  code += `  static const ColorScheme lightColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.light,\n`;
  code += `    primary: AppColors.primary500,\n`;
  code += `    onPrimary: AppColors.white,\n`;
  code += `    primaryContainer: AppColors.primary100,\n`;
  code += `    onPrimaryContainer: AppColors.primary900,\n`;
  code += `    secondary: AppColors.primary400,\n`;
  code += `    onSecondary: AppColors.white,\n`;
  code += `    secondaryContainer: AppColors.primary100,\n`;
  code += `    onSecondaryContainer: AppColors.primary900,\n`;
  code += `    error: AppColors.error600,\n`;
  code += `    onError: AppColors.white,\n`;
  code += `    errorContainer: AppColors.error50,\n`;
  code += `    onErrorContainer: AppColors.error900,\n`;
  code += `    surface: AppColors.white,\n`;
  code += `    onSurface: AppColors.neutral900,\n`;
  code += `    surfaceContainerHighest: AppColors.neutral100,\n`;
  code += `    onSurfaceVariant: AppColors.neutral700,\n`;
  code += `    outline: AppColors.neutral400,\n`;
  code += `    outlineVariant: AppColors.neutral300,\n`;
  code += `    shadow: AppColors.black,\n`;
  code += `    scrim: AppColors.black,\n`;
  code += `    inverseSurface: AppColors.neutral900,\n`;
  code += `    onInverseSurface: AppColors.white,\n`;
  code += `    inversePrimary: AppColors.primary300,\n`;
  code += `  );\n\n`;
  
  // Dark ColorScheme
  code += `  static const ColorScheme darkColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.dark,\n`;
  code += `    primary: AppColors.primary400,\n`;
  code += `    onPrimary: AppColors.primary900,\n`;
  code += `    primaryContainer: AppColors.primary700,\n`;
  code += `    onPrimaryContainer: AppColors.primary100,\n`;
  code += `    secondary: AppColors.primary300,\n`;
  code += `    onSecondary: AppColors.primary900,\n`;
  code += `    secondaryContainer: AppColors.primary700,\n`;
  code += `    onSecondaryContainer: AppColors.primary100,\n`;
  code += `    error: AppColors.error500,\n`;
  code += `    onError: AppColors.white,\n`;
  code += `    errorContainer: AppColors.error800,\n`;
  code += `    onErrorContainer: AppColors.error200,\n`;
  code += `    surface: AppColors.neutral900,\n`;
  code += `    onSurface: AppColors.neutral100,\n`;
  code += `    surfaceContainerHighest: AppColors.neutral800,\n`;
  code += `    onSurfaceVariant: AppColors.neutral300,\n`;
  code += `    outline: AppColors.neutral600,\n`;
  code += `    outlineVariant: AppColors.neutral700,\n`;
  code += `    shadow: AppColors.black,\n`;
  code += `    scrim: AppColors.black,\n`;
  code += `    inverseSurface: AppColors.neutral100,\n`;
  code += `    onInverseSurface: AppColors.neutral900,\n`;
  code += `    inversePrimary: AppColors.primary600,\n`;
  code += `  );\n`;
  
  code += '}\n';
  return code;
}

/**
 * 生成 DesignTokens 类
 */
function generateDesignTokensClass(tokens) {
  let code = '\n/// Design Tokens 直接访问\n';
  code += 'class DesignTokens {\n';
  code += '  // Private constructor to prevent instantiation\n';
  code += '  DesignTokens._();\n\n';
  
  code += '  // Token collections\n';
  code += '  static const colors = AppColors;\n';
  code += '  static const spacing = AppSpacing;\n';
  code += '  static const radius = AppRadius;\n';
  code += '  static const fontSize = AppFontSizes;\n';
  code += '  static const colorSchemes = AppColorSchemes;\n';
  
  // 只有在有语义化颜色时才添加
  if (tokens.semantic && tokens.semantic.color) {
    code += '\n  // Semantic color extensions\n';
    code += '  static const lightColorExtension = AppColorsExtension.light;\n';
    code += '  static const darkColorExtension = AppColorsExtension.dark;\n';
  }
  
  // 只有在有组件 tokens 时才添加
  if (tokens.component) {
    code += '\n  // Component tokens\n';
    // 检查是否有按钮组件
    if ((tokens.component.light && tokens.component.light.button) || 
        (tokens.component.dark && tokens.component.dark.button)) {
      code += '  static const lightButtonTokens = ButtonTokens.light;\n';
      code += '  static const darkButtonTokens = ButtonTokens.dark;\n';
    }
  }
  
  code += '}\n';
  
  return code;
}


/**
 * 主构建函数
 */
async function buildFlutter() {
  try {
    console.log('🔄 Building Flutter package...');
    
    // 读取 tokens
    const tokens = await fs.readJSON(TOKENS_PATH);
    
    // 生成 design_tokens.dart
    let dartCode = '// Generated by Design Tokens - DO NOT EDIT\n';
    dartCode += '// Last updated: ' + new Date().toISOString() + '\n\n';
    dartCode += "import 'package:flutter/material.dart';\n\n";
    
    // 生成颜色常量
    dartCode += generateColorConstants(tokens.primitive.color);
    
    // 生成间距常量
    dartCode += generateSpacingConstants(tokens.primitive.spacing);
    
    // 生成圆角常量
    dartCode += generateRadiusConstants(tokens.primitive.radius);
    
    // 生成字体大小常量
    dartCode += generateFontSizeConstants(tokens.primitive.fontSize);
    
    // 生成语义化颜色 ThemeExtension
    if (tokens.semantic) {
      dartCode += generateSemanticColors(tokens.semantic);
    }
    
    // 生成组件 tokens
    dartCode += generateComponentTokens(tokens.component);
    
    // 生成 ColorScheme
    dartCode += generateColorSchemes(tokens.semantic, tokens.primitive);
    
    // 生成 DesignTokens 类
    dartCode += generateDesignTokensClass(tokens);
    
    // 写入文件
    await fs.writeFile(
      path.join(OUTPUT_PATH, 'design_tokens.dart'),
      dartCode
    );
    
    console.log('✅ Flutter package built successfully');
    
  } catch (error) {
    console.error('❌ Flutter build failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  buildFlutter();
}

module.exports = { buildFlutter };