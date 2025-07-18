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
  let code = '/// 颜色常量定义\nclass AppColorSchemes {\n';
  
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
  
  return code;
}

/**
 * 生成 ColorScheme
 */
function generateColorSchemes(semantic, primitive) {
  let code = '\n  // Color Schemes\n';
  
  // Light ColorScheme
  code += `  static const ColorScheme lightColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.light,\n`;
  code += `    primary: primary500,\n`;
  code += `    onPrimary: white,\n`;
  code += `    primaryContainer: primary100,\n`;
  code += `    onPrimaryContainer: primary900,\n`;
  code += `    secondary: primary400,\n`;
  code += `    onSecondary: white,\n`;
  code += `    secondaryContainer: primary100,\n`;
  code += `    onSecondaryContainer: primary900,\n`;
  code += `    error: Color(0xFFDC2626),\n`;
  code += `    onError: white,\n`;
  code += `    errorContainer: Color(0xFFFFEBEE),\n`;
  code += `    onErrorContainer: Color(0xFF7F1D1D),\n`;
  code += `    surface: white,\n`;
  code += `    onSurface: neutral900,\n`;
  code += `    surfaceContainerHighest: neutral100,\n`;
  code += `    onSurfaceVariant: neutral700,\n`;
  code += `    outline: neutral400,\n`;
  code += `    outlineVariant: neutral300,\n`;
  code += `    shadow: black,\n`;
  code += `    scrim: black,\n`;
  code += `    inverseSurface: neutral900,\n`;
  code += `    onInverseSurface: white,\n`;
  code += `    inversePrimary: primary300,\n`;
  code += `  );\n\n`;
  
  // Dark ColorScheme
  code += `  static const ColorScheme darkColorScheme = ColorScheme(\n`;
  code += `    brightness: Brightness.dark,\n`;
  code += `    primary: primary400,\n`;
  code += `    onPrimary: primary900,\n`;
  code += `    primaryContainer: primary700,\n`;
  code += `    onPrimaryContainer: primary100,\n`;
  code += `    secondary: primary300,\n`;
  code += `    onSecondary: primary900,\n`;
  code += `    secondaryContainer: primary700,\n`;
  code += `    onSecondaryContainer: primary100,\n`;
  code += `    error: Color(0xFFEF4444),\n`;
  code += `    onError: white,\n`;
  code += `    errorContainer: Color(0xFF991B1B),\n`;
  code += `    onErrorContainer: Color(0xFFFECACA),\n`;
  code += `    surface: neutral900,\n`;
  code += `    onSurface: neutral100,\n`;
  code += `    surfaceContainerHighest: neutral800,\n`;
  code += `    onSurfaceVariant: neutral300,\n`;
  code += `    outline: neutral600,\n`;
  code += `    outlineVariant: neutral700,\n`;
  code += `    shadow: black,\n`;
  code += `    scrim: black,\n`;
  code += `    inverseSurface: neutral100,\n`;
  code += `    onInverseSurface: neutral900,\n`;
  code += `    inversePrimary: primary600,\n`;
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
  
  // 颜色
  code += '  static const colors = _ColorTokens();\n';
  code += '  static const spacing = _SpacingTokens();\n';
  code += '  static const radius = _RadiusTokens();\n';
  
  // Themes
  code += '\n  // Generated themes\n';
  code += '  static ThemeData lightTheme = _generateLightTheme();\n';
  code += '  static ThemeData darkTheme = _generateDarkTheme();\n';
  
  code += '}\n\n';
  
  // Color Tokens
  code += 'class _ColorTokens {\n';
  code += '  const _ColorTokens();\n\n';
  
  // Primitive colors
  code += '  // Primary colors\n';
  code += '  Color get primary => AppColorSchemes.primary500;\n';
  code += '  Color get primaryLight => AppColorSchemes.primary400;\n';
  code += '  Color get primaryDark => AppColorSchemes.primary600;\n';
  
  // Semantic colors
  if (tokens.semantic.light.color) {
    code += '\n  // Semantic colors (light mode defaults)\n';
    const semanticColors = tokens.semantic.light.color;
    if (semanticColors.text) {
      code += '  Color get textPrimary => AppColorSchemes.neutral900;\n';
      code += '  Color get textSecondary => AppColorSchemes.neutral700;\n';
    }
    if (semanticColors.background) {
      code += '  Color get backgroundBase => AppColorSchemes.white;\n';
      code += '  Color get backgroundElevated => AppColorSchemes.neutral50;\n';
    }
  }
  
  code += '}\n\n';
  
  // Spacing Tokens
  code += 'class _SpacingTokens {\n';
  code += '  const _SpacingTokens();\n\n';
  
  if (tokens.primitive.spacing) {
    Object.entries(tokens.primitive.spacing).forEach(([key, config]) => {
      const value = parseInt(config.value);
      code += `  double get s${key} => ${value}.0;\n`;
    });
    
    // 添加语义化命名
    code += '\n  // Semantic spacing\n';
    code += '  double get xs => s1;\n';
    code += '  double get sm => s2;\n';
    code += '  double get md => s4;\n';
    code += '  double get lg => s6;\n';
    code += '  double get xl => s8;\n';
  }
  
  code += '}\n\n';
  
  // Radius Tokens
  code += 'class _RadiusTokens {\n';
  code += '  const _RadiusTokens();\n\n';
  
  if (tokens.primitive.radius) {
    Object.entries(tokens.primitive.radius).forEach(([key, config]) => {
      const value = parseInt(config.value);
      code += `  double get ${key} => ${value}.0;\n`;
    });
  }
  
  code += '}\n';
  
  return code;
}

/**
 * 生成主题定义
 */
function generateThemeDefinitions() {
  let code = '\n// Theme definitions\n';
  
  // Light theme
  code += 'ThemeData _generateLightTheme() {\n';
  code += '  return ThemeData(\n';
  code += '    useMaterial3: true,\n';
  code += '    brightness: Brightness.light,\n';
  code += '    colorScheme: AppColorSchemes.lightColorScheme,\n';
  code += '    scaffoldBackgroundColor: AppColorSchemes.neutral50,\n';
  code += '    appBarTheme: const AppBarTheme(\n';
  code += '      centerTitle: true,\n';
  code += '      elevation: 0,\n';
  code += '      backgroundColor: AppColorSchemes.white,\n';
  code += '      foregroundColor: AppColorSchemes.neutral900,\n';
  code += '    ),\n';
  code += '    elevatedButtonTheme: ElevatedButtonThemeData(\n';
  code += '      style: ElevatedButton.styleFrom(\n';
  code += '        foregroundColor: AppColorSchemes.white,\n';
  code += '        backgroundColor: AppColorSchemes.primary500,\n';
  code += '        shape: RoundedRectangleBorder(\n';
  code += '          borderRadius: BorderRadius.circular(DesignTokens.radius.md),\n';
  code += '        ),\n';
  code += '        padding: EdgeInsets.symmetric(\n';
  code += '          horizontal: DesignTokens.spacing.s4,\n';
  code += '          vertical: DesignTokens.spacing.s3,\n';
  code += '        ),\n';
  code += '      ),\n';
  code += '    ),\n';
  code += '  );\n';
  code += '}\n\n';
  
  // Dark theme
  code += 'ThemeData _generateDarkTheme() {\n';
  code += '  return ThemeData(\n';
  code += '    useMaterial3: true,\n';
  code += '    brightness: Brightness.dark,\n';
  code += '    colorScheme: AppColorSchemes.darkColorScheme,\n';
  code += '    scaffoldBackgroundColor: AppColorSchemes.neutral900,\n';
  code += '    appBarTheme: const AppBarTheme(\n';
  code += '      centerTitle: true,\n';
  code += '      elevation: 0,\n';
  code += '      backgroundColor: AppColorSchemes.neutral900,\n';
  code += '      foregroundColor: AppColorSchemes.white,\n';
  code += '    ),\n';
  code += '    elevatedButtonTheme: ElevatedButtonThemeData(\n';
  code += '      style: ElevatedButton.styleFrom(\n';
  code += '        foregroundColor: AppColorSchemes.white,\n';
  code += '        backgroundColor: AppColorSchemes.primary500,\n';
  code += '        shape: RoundedRectangleBorder(\n';
  code += '          borderRadius: BorderRadius.circular(DesignTokens.radius.md),\n';
  code += '        ),\n';
  code += '        padding: EdgeInsets.symmetric(\n';
  code += '          horizontal: DesignTokens.spacing.s4,\n';
  code += '          vertical: DesignTokens.spacing.s3,\n';
  code += '        ),\n';
  code += '      ),\n';
  code += '    ),\n';
  code += '  );\n';
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
    
    // 生成 ColorScheme
    dartCode += generateColorSchemes(tokens.semantic, tokens.primitive);
    
    // 生成 DesignTokens 类
    dartCode += generateDesignTokensClass(tokens);
    
    // 生成主题定义
    dartCode += generateThemeDefinitions();
    
    // 写入文件
    await fs.writeFile(
      path.join(OUTPUT_PATH, 'design_tokens.dart'),
      dartCode
    );
    
    // 创建 pubspec.yaml
    const pubspecContent = `name: design_tokens
description: Design tokens for Flutter applications
version: 1.0.0

environment:
  sdk: ">=2.17.0 <4.0.0"
  flutter: ">=3.0.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
`;
    
    await fs.writeFile(
      path.join(__dirname, '../packages/flutter/pubspec.yaml'),
      pubspecContent
    );
    
    // 创建导出文件
    const exportContent = `library design_tokens;

export 'src/design_tokens.dart';
`;
    
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