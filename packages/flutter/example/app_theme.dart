import 'package:flutter/material.dart';
import 'package:wisburg_design_tokens/wisburg_design_tokens.dart';

/// 应用主题配置示例
/// 展示如何使用 design tokens 构建完整的主题
class AppTheme {
  // Private constructor
  AppTheme._();

  // Light theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: AppColorSchemes.lightColorScheme,
    
    // AppBar主题
    appBarTheme: AppBarTheme(
      centerTitle: true,
      elevation: 0,
      backgroundColor: AppColors.white,
      foregroundColor: AppColors.neutral900,
      titleTextStyle: const TextStyle(
        color: AppColors.neutral900,
        fontSize: AppFontSizes.lg,
        fontWeight: FontWeight.w600,
      ),
    ),
    
    // Navigation rail theme
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: AppColors.white,
      selectedIconTheme: const IconThemeData(color: AppColors.primary500),
      unselectedIconTheme: const IconThemeData(color: AppColors.neutral700),
      selectedLabelTextStyle: const TextStyle(color: AppColors.primary500),
      unselectedLabelTextStyle: const TextStyle(color: AppColors.neutral700),
    ),
    
    // Navigation bar theme
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.white,
      indicatorColor: AppColors.primary100,
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: AppColors.primary500);
        }
        return const IconThemeData(color: AppColors.neutral700);
      }),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            color: AppColors.primary500,
            fontSize: AppFontSizes.xs,
            fontWeight: FontWeight.w500,
          );
        }
        return const TextStyle(
          color: AppColors.neutral700,
          fontSize: AppFontSizes.xs,
        );
      }),
    ),
    
    // Elevated button theme
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: AppColors.white,
        backgroundColor: AppColors.primary500,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing4,
          vertical: AppSpacing.spacing3,
        ),
      ),
    ),
    
    // Text button theme
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary500,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing4,
          vertical: AppSpacing.spacing3,
        ),
      ),
    ),
    
    // Input decoration theme
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.neutral300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.neutral300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.primary500, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: AppColorSchemes.lightColorScheme.error),
      ),
      contentPadding: EdgeInsets.symmetric(
        horizontal: AppSpacing.spacing4,
        vertical: AppSpacing.spacing3,
      ),
    ),
    
    scaffoldBackgroundColor: AppColors.neutral50,
  );

  // Dark theme
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: AppColorSchemes.darkColorScheme,
    
    // AppBar主题
    appBarTheme: AppBarTheme(
      centerTitle: true,
      elevation: 0,
      backgroundColor: AppColors.neutral900,
      foregroundColor: AppColors.white,
      titleTextStyle: const TextStyle(
        color: AppColors.white,
        fontSize: AppFontSizes.lg,
        fontWeight: FontWeight.w600,
      ),
    ),
    
    // Navigation rail theme
    navigationRailTheme: const NavigationRailThemeData(
      backgroundColor: AppColors.neutral900,
      selectedIconTheme: IconThemeData(color: AppColors.white),
      unselectedIconTheme: IconThemeData(color: AppColors.neutral300),
      selectedLabelTextStyle: TextStyle(color: AppColors.white),
      unselectedLabelTextStyle: TextStyle(color: AppColors.neutral300),
    ),
    
    // Navigation bar theme
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.neutral900,
      indicatorColor: AppColors.neutral700,
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: AppColors.white);
        }
        return const IconThemeData(color: AppColors.neutral300);
      }),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            color: AppColors.white,
            fontSize: AppFontSizes.xs,
            fontWeight: FontWeight.w500,
          );
        }
        return const TextStyle(
          color: AppColors.neutral300,
          fontSize: AppFontSizes.xs,
        );
      }),
    ),
    
    // Elevated button theme
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: AppColors.white,
        backgroundColor: AppColors.primary500,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing4,
          vertical: AppSpacing.spacing3,
        ),
      ),
    ),
    
    // Text button theme
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary400,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing4,
          vertical: AppSpacing.spacing3,
        ),
      ),
    ),
    
    // Input decoration theme
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.neutral700),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.neutral700),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.primary500, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: AppColorSchemes.darkColorScheme.error),
      ),
      contentPadding: EdgeInsets.symmetric(
        horizontal: AppSpacing.spacing4,
        vertical: AppSpacing.spacing3,
      ),
    ),
    
    scaffoldBackgroundColor: AppColors.neutral900,
  );
}