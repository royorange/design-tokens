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
      // 处理以数字开头的键名（如 2xl）
      const dartKey = /^\d/.test(key) ? `radius${key.charAt(0).toUpperCase() + key.slice(1)}` : key;
      code += `  static const double ${dartKey} = ${value}.0;\n`;
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
 * 生成字体系列常量
 */
function generateFontFamilyConstants(fontFamily) {
  let code = '/// 字体系列定义\n';
  code += 'class AppFontFamily {\n';
  
  Object.entries(fontFamily).forEach(([key, config]) => {
    const constantName = _.camelCase(key);
    code += `  static const String ${constantName} = '${config.value}';\n`;
  });
  
  code += '}\n';
  return code;
}

/**
 * 解析颜色引用
 */
function resolveColorReference(value, tokens) {
  if (!value) return 'AppColors.black';
  
  // 如果已经是 Color 格式
  if (value.startsWith('Color(')) return value;
  
  // 如果是十六进制
  if (value.startsWith('#')) return hexToFlutterColor(value);
  
  // 如果是引用格式 {color.primary.500}
  if (value.startsWith('{') && value.endsWith('}')) {
    const ref = value.slice(1, -1);
    const parts = ref.split('.');
    
    // 从 tokens 中解析实际值
    let current = tokens;
    for (const part of parts) {
      current = current?.[part];
      if (!current) break;
    }
    
    if (current?.value) {
      // 递归解析，处理嵌套引用
      return resolveColorReference(current.value, tokens);
    }
    
    // 如果解析失败，尝试直接映射到 AppColors
    if (parts[0] === 'color') {
      if (parts.length === 2) {
        return `AppColors.${parts[1]}`;
      } else if (parts.length === 3) {
        return `AppColors.${parts[1]}${parts[2]}`;
      }
    }
  }
  
  // 默认返回
  return 'AppColors.black';
}

/**
 * 生成 Material 3 ColorScheme
 */
function generateColorSchemes(tokens) {
  let code = '\n/// Material 3 ColorScheme definitions\nclass AppColorSchemes {\n';
  
  // Light ColorScheme - 注意新结构中语义化颜色直接在 light 层下
  const light = tokens.light || {};
  code += `  static const ColorScheme lightColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.light,\n`;
  code += `    primary: ${resolveColorReference(light.primary?.default?.value, tokens)},\n`;
  code += `    onPrimary: ${resolveColorReference(light.primary?.on?.value, tokens)},\n`;
  code += `    primaryContainer: ${resolveColorReference(light.primary?.container?.value, tokens)},\n`;
  code += `    onPrimaryContainer: ${resolveColorReference(light.primary?.onContainer?.value, tokens)},\n`;
  code += `    secondary: ${resolveColorReference(light.secondary?.default?.value, tokens)},\n`;
  code += `    onSecondary: ${resolveColorReference(light.secondary?.on?.value, tokens)},\n`;
  code += `    secondaryContainer: ${resolveColorReference(light.secondary?.container?.value, tokens)},\n`;
  code += `    onSecondaryContainer: ${resolveColorReference(light.secondary?.onContainer?.value, tokens)},\n`;
  code += `    tertiary: ${resolveColorReference(light.tertiary?.default?.value, tokens)},\n`;
  code += `    onTertiary: ${resolveColorReference(light.tertiary?.on?.value, tokens)},\n`;
  code += `    tertiaryContainer: ${resolveColorReference(light.tertiary?.container?.value, tokens)},\n`;
  code += `    onTertiaryContainer: ${resolveColorReference(light.tertiary?.onContainer?.value, tokens)},\n`;
  code += `    error: ${resolveColorReference(light.error?.default?.value, tokens)},\n`;
  code += `    onError: ${resolveColorReference(light.error?.on?.value, tokens)},\n`;
  code += `    errorContainer: ${resolveColorReference(light.error?.container?.value, tokens)},\n`;
  code += `    onErrorContainer: ${resolveColorReference(light.error?.onContainer?.value, tokens)},\n`;
  code += `    surface: ${resolveColorReference(light.surface?.default?.value, tokens)},\n`;
  code += `    onSurface: ${resolveColorReference(light.surface?.on?.value, tokens)},\n`;
  // surfaceVariant is deprecated in Flutter 3.18+, commented out but kept for reference
  // code += `    surfaceVariant: ${resolveColorReference(light.surface?.variant?.value, tokens)},\n`;
  code += `    onSurfaceVariant: ${resolveColorReference(light.surface?.onVariant?.value, tokens)},\n`;
  // background and onBackground are deprecated in Flutter 3.18+, commented out but kept for reference
  // code += `    background: ${resolveColorReference(light.background?.default?.value, tokens)},\n`;
  // code += `    onBackground: ${resolveColorReference(light.background?.on?.value, tokens)},\n`;
  code += `    outline: ${resolveColorReference(light.outline?.default?.value, tokens)},\n`;
  code += `    outlineVariant: ${resolveColorReference(light.outline?.variant?.value, tokens)},\n`;
  code += `    shadow: ${resolveColorReference(light.shadow?.default?.value, tokens)},\n`;
  code += `    scrim: ${resolveColorReference(light.scrim?.default?.value, tokens)},\n`;
  code += `    inverseSurface: ${resolveColorReference(light.inverseSurface?.default?.value, tokens)},\n`;
  code += `    onInverseSurface: ${resolveColorReference(light.inverseSurface?.on?.value, tokens)},\n`;
  code += `    inversePrimary: ${resolveColorReference(light.inversePrimary?.default?.value, tokens)},\n`;
  code += `    surfaceContainerLowest: ${resolveColorReference(light.surface?.lowest?.value, tokens)},\n`;
  code += `    surfaceContainerLow: ${resolveColorReference(light.surface?.lowest?.value, tokens)},\n`;
  code += `    surfaceContainer: ${resolveColorReference(light.surface?.default?.value, tokens)},\n`;
  code += `    surfaceContainerHigh: ${resolveColorReference(light.surface?.high?.value, tokens)},\n`;
  code += `    surfaceContainerHighest: ${resolveColorReference(light.surface?.highest?.value, tokens)},\n`;
  code += `  );\n\n`;
  
  // Dark ColorScheme - 注意新结构中语义化颜色直接在 dark 层下
  const dark = tokens.dark || {};
  code += `  static const ColorScheme darkColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.dark,\n`;
  code += `    primary: ${resolveColorReference(dark.primary?.default?.value, tokens)},\n`;
  code += `    onPrimary: ${resolveColorReference(dark.primary?.on?.value, tokens)},\n`;
  code += `    primaryContainer: ${resolveColorReference(dark.primary?.container?.value, tokens)},\n`;
  code += `    onPrimaryContainer: ${resolveColorReference(dark.primary?.onContainer?.value, tokens)},\n`;
  code += `    secondary: ${resolveColorReference(dark.secondary?.default?.value, tokens)},\n`;
  code += `    onSecondary: ${resolveColorReference(dark.secondary?.on?.value, tokens)},\n`;
  code += `    secondaryContainer: ${resolveColorReference(dark.secondary?.container?.value, tokens)},\n`;
  code += `    onSecondaryContainer: ${resolveColorReference(dark.secondary?.onContainer?.value, tokens)},\n`;
  code += `    tertiary: ${resolveColorReference(dark.tertiary?.default?.value, tokens)},\n`;
  code += `    onTertiary: ${resolveColorReference(dark.tertiary?.on?.value, tokens)},\n`;
  code += `    tertiaryContainer: ${resolveColorReference(dark.tertiary?.container?.value, tokens)},\n`;
  code += `    onTertiaryContainer: ${resolveColorReference(dark.tertiary?.onContainer?.value, tokens)},\n`;
  code += `    error: ${resolveColorReference(dark.error?.default?.value, tokens)},\n`;
  code += `    onError: ${resolveColorReference(dark.error?.on?.value, tokens)},\n`;
  code += `    errorContainer: ${resolveColorReference(dark.error?.container?.value, tokens)},\n`;
  code += `    onErrorContainer: ${resolveColorReference(dark.error?.onContainer?.value, tokens)},\n`;
  code += `    surface: ${resolveColorReference(dark.surface?.default?.value, tokens)},\n`;
  code += `    onSurface: ${resolveColorReference(dark.surface?.on?.value, tokens)},\n`;
  // surfaceVariant is deprecated in Flutter 3.18+, commented out but kept for reference
  // code += `    surfaceVariant: ${resolveColorReference(dark.surface?.variant?.value, tokens)},\n`;
  code += `    onSurfaceVariant: ${resolveColorReference(dark.surface?.onVariant?.value, tokens)},\n`;
  // background and onBackground are deprecated in Flutter 3.18+, commented out but kept for reference
  // code += `    background: ${resolveColorReference(dark.background?.default?.value, tokens)},\n`;
  // code += `    onBackground: ${resolveColorReference(dark.background?.on?.value, tokens)},\n`;
  code += `    outline: ${resolveColorReference(dark.outline?.default?.value, tokens)},\n`;
  code += `    outlineVariant: ${resolveColorReference(dark.outline?.variant?.value, tokens)},\n`;
  code += `    shadow: ${resolveColorReference(dark.shadow?.default?.value, tokens)},\n`;
  code += `    scrim: ${resolveColorReference(dark.scrim?.default?.value, tokens)},\n`;
  code += `    inverseSurface: ${resolveColorReference(dark.inverseSurface?.default?.value, tokens)},\n`;
  code += `    onInverseSurface: ${resolveColorReference(dark.inverseSurface?.on?.value, tokens)},\n`;
  code += `    inversePrimary: ${resolveColorReference(dark.inversePrimary?.default?.value, tokens)},\n`;
  code += `    surfaceContainerLowest: ${resolveColorReference(dark.surface?.lowest?.value, tokens)},\n`;
  code += `    surfaceContainerLow: ${resolveColorReference(dark.surface?.lowest?.value, tokens)},\n`;
  code += `    surfaceContainer: ${resolveColorReference(dark.surface?.default?.value, tokens)},\n`;
  code += `    surfaceContainerHigh: ${resolveColorReference(dark.surface?.high?.value, tokens)},\n`;
  code += `    surfaceContainerHighest: ${resolveColorReference(dark.surface?.highest?.value, tokens)},\n`;
  code += `  );\n`;
  
  code += '}\n';
  return code;
}

/**
 * 生成 Material 3 Surface Extension
 */
function generateSurfaceExtension(tokens) {
  const light = tokens.light || {};
  const dark = tokens.dark || {};
  
  let code = '\n/// Material 3 Surface Extension\n';
  code += '@immutable\n';
  code += 'class SurfaceColorsExtension extends ThemeExtension<SurfaceColorsExtension> {\n';
  
  // Constructor
  code += '  const SurfaceColorsExtension({\n';
  code += '    required this.surfaceLowest,\n';
  code += '    required this.surface,\n';
  code += '    required this.surfaceHigh,\n';
  code += '    required this.surfaceHighest,\n';
  code += '  });\n\n';
  
  // Fields
  code += '  final Color surfaceLowest;\n';
  code += '  final Color surface;\n';
  code += '  final Color surfaceHigh;\n';
  code += '  final Color surfaceHighest;\n';
  
  // copyWith method
  code += '\n  @override\n';
  code += '  SurfaceColorsExtension copyWith({\n';
  code += '    Color? surfaceLowest,\n';
  code += '    Color? surface,\n';
  code += '    Color? surfaceHigh,\n';
  code += '    Color? surfaceHighest,\n';
  code += '  }) {\n';
  code += '    return SurfaceColorsExtension(\n';
  code += '      surfaceLowest: surfaceLowest ?? this.surfaceLowest,\n';
  code += '      surface: surface ?? this.surface,\n';
  code += '      surfaceHigh: surfaceHigh ?? this.surfaceHigh,\n';
  code += '      surfaceHighest: surfaceHighest ?? this.surfaceHighest,\n';
  code += '    );\n';
  code += '  }\n';
  
  // lerp method
  code += '\n  @override\n';
  code += '  SurfaceColorsExtension lerp(ThemeExtension<SurfaceColorsExtension>? other, double t) {\n';
  code += '    if (other is! SurfaceColorsExtension) {\n';
  code += '      return this;\n';
  code += '    }\n';
  code += '    return SurfaceColorsExtension(\n';
  code += '      surfaceLowest: Color.lerp(surfaceLowest, other.surfaceLowest, t)!,\n';
  code += '      surface: Color.lerp(surface, other.surface, t)!,\n';
  code += '      surfaceHigh: Color.lerp(surfaceHigh, other.surfaceHigh, t)!,\n';
  code += '      surfaceHighest: Color.lerp(surfaceHighest, other.surfaceHighest, t)!,\n';
  code += '    );\n';
  code += '  }\n';
  
  // Light theme static instance
  code += '\n  /// Light theme surface colors\n';
  code += '  static final light = SurfaceColorsExtension(\n';
  code += `    surfaceLowest: ${resolveColorReference(light.surface?.lowest?.value, tokens)},\n`;
  code += `    surface: ${resolveColorReference(light.surface?.default?.value, tokens)},\n`;
  code += `    surfaceHigh: ${resolveColorReference(light.surface?.high?.value, tokens)},\n`;
  code += `    surfaceHighest: ${resolveColorReference(light.surface?.highest?.value, tokens)},\n`;
  code += '  );\n';
  
  // Dark theme static instance
  code += '\n  /// Dark theme surface colors\n';
  code += '  static final dark = SurfaceColorsExtension(\n';
  code += `    surfaceLowest: ${resolveColorReference(dark.surface?.lowest?.value, tokens)},\n`;
  code += `    surface: ${resolveColorReference(dark.surface?.default?.value, tokens)},\n`;
  code += `    surfaceHigh: ${resolveColorReference(dark.surface?.high?.value, tokens)},\n`;
  code += `    surfaceHighest: ${resolveColorReference(dark.surface?.highest?.value, tokens)},\n`;
  code += '  );\n';
  
  code += '}\n';
  return code;
}

/**
 * 生成语义化颜色 ThemeExtension
 */
function generateSemanticColors(tokens) {
  const lightColors = tokens.light?.color || {};
  const darkColors = tokens.dark?.color || {};
  
  // 收集所有语义化颜色（排除 Material 已有的）
  const excludeKeys = ['primary', 'secondary', 'tertiary', 'error', 'surface', 'background', 'outline', 'inverseSurface', 'inversePrimary', 'shadow', 'scrim'];
  const semanticKeys = Object.keys(lightColors).filter(key => !excludeKeys.includes(key));
  
  if (semanticKeys.length === 0) return '';
  
  let code = '\n/// 语义化颜色 Theme Extension\n';
  code += '@immutable\n';
  code += 'class AppColorsExtension extends ThemeExtension<AppColorsExtension> {\n';
  
  // Constructor
  code += '  const AppColorsExtension({\n';
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        code += `    required this.${_.camelCase(key + '_' + prop)},\n`;
      });
    }
  });
  code += '  });\n\n';
  
  // Fields
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        code += `  final Color ${_.camelCase(key + '_' + prop)};\n`;
      });
    }
  });
  
  // copyWith method
  code += '\n  @override\n';
  code += '  AppColorsExtension copyWith({\n';
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        code += `    Color? ${_.camelCase(key + '_' + prop)},\n`;
      });
    }
  });
  code += '  }) {\n';
  code += '    return AppColorsExtension(\n';
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        const name = _.camelCase(key + '_' + prop);
        code += `      ${name}: ${name} ?? this.${name},\n`;
      });
    }
  });
  code += '    );\n';
  code += '  }\n';
  
  // lerp method
  code += '\n  @override\n';
  code += '  AppColorsExtension lerp(ThemeExtension<AppColorsExtension>? other, double t) {\n';
  code += '    if (other is! AppColorsExtension) {\n';
  code += '      return this;\n';
  code += '    }\n';
  code += '    return AppColorsExtension(\n';
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        const name = _.camelCase(key + '_' + prop);
        code += `      ${name}: Color.lerp(${name}, other.${name}, t)!,\n`;
      });
    }
  });
  code += '    );\n';
  code += '  }\n';
  
  // Light theme static instance
  code += '\n  /// Light theme colors\n';
  code += '  static const light = AppColorsExtension(\n';
  semanticKeys.forEach(key => {
    const props = lightColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        code += `    ${_.camelCase(key + '_' + prop)}: ${resolveColorReference(props[prop]?.value, tokens)},\n`;
      });
    }
  });
  code += '  );\n';
  
  // Dark theme static instance
  code += '\n  /// Dark theme colors\n';
  code += '  static const dark = AppColorsExtension(\n';
  semanticKeys.forEach(key => {
    const props = darkColors[key];
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(prop => {
        code += `    ${_.camelCase(key + '_' + prop)}: ${resolveColorReference(props[prop]?.value, tokens)},\n`;
      });
    }
  });
  code += '  );\n';
  
  code += '}\n';
  return code;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔄 Building Flutter package...');
    
    // 1. 读取 tokens
    const tokens = await fs.readJSON(TOKENS_PATH);
    
    // 读取原始 tokens 文件用于解析引用
    const originalTokensPath = path.join(__dirname, '../tokens/figma/tokens.json');
    const originalTokens = await fs.readJSON(originalTokensPath);
    
    // 2. 生成 Dart 代码
    let dartCode = `// Generated by Design Tokens - DO NOT EDIT
// Last updated: ${new Date().toISOString()}

import 'package:flutter/material.dart';
`;
    
    // 生成颜色常量
    if (tokens.global?.color) {
      dartCode += '\n' + generateColorConstants(tokens.global.color);
    }
    
    // 生成间距常量
    if (tokens.global?.spacing) {
      dartCode += '\n' + generateSpacingConstants(tokens.global.spacing);
    }
    
    // 生成圆角常量
    if (tokens.global?.radius) {
      dartCode += '\n' + generateRadiusConstants(tokens.global.radius);
    }
    
    // 生成字体大小常量
    if (tokens.global?.fontSize) {
      dartCode += '\n' + generateFontSizeConstants(tokens.global.fontSize);
    }
    
    // 生成字体系列常量
    if (tokens.global?.fontFamily) {
      dartCode += '\n' + generateFontFamilyConstants(tokens.global.fontFamily);
    }
    
    // 生成语义化颜色扩展
    dartCode += generateSemanticColors(originalTokens);
    
    // 生成 ColorScheme - 传入原始 tokens 用于解析引用
    dartCode += generateColorSchemes(originalTokens);
    
    // 3. 保存文件
    const outputFile = path.join(OUTPUT_PATH, 'design_tokens.dart');
    await fs.writeFile(outputFile, dartCode);
    
    console.log('✅ Flutter package built successfully');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };