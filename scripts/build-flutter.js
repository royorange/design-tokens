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