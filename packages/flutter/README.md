# Wisburg Design Tokens

Flutter design tokens for Wisburg applications. Auto-generated from Figma design system.

## Installation

```yaml
dependencies:
  wisburg_design_tokens: ^1.0.0
```

## Usage

### Basic Usage

```dart
import 'package:wisburg_design_tokens/design_tokens.dart';

// Access tokens directly
Container(
  color: AppColors.primary500,
  padding: EdgeInsets.all(AppSpacing.spacing4),
  child: Text(
    'Hello',
    style: TextStyle(
      fontSize: AppFontSizes.base,
      color: AppColors.white,
    ),
  ),
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(AppRadius.md),
  ),
);
```

### Using with Material Theme

The package provides basic ColorSchemes, but you should create your own complete theme:

```dart
import 'package:flutter/material.dart';
import 'package:wisburg_design_tokens/design_tokens.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: AppColorSchemes.lightColorScheme,
    
    // Customize components using design tokens
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.white,
      foregroundColor: AppColors.neutral900,
      elevation: 0,
    ),
    
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary500,
        foregroundColor: AppColors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: AppSpacing.spacing4,
          vertical: AppSpacing.spacing3,
        ),
      ),
    ),
    
    // ... other component themes
  );
}

// Use in your app
MaterialApp(
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  // ...
);
```

### Using through DesignTokens class

```dart
// All tokens are also accessible through the DesignTokens class
final primaryColor = DesignTokens.colors.primary500;
final buttonPadding = DesignTokens.spacing.spacing4;
final borderRadius = DesignTokens.radius.md;
```

## Available Tokens

- **Colors**: Primary, neutral, and semantic colors
- **Spacing**: Consistent spacing values (0-16)
- **Border Radius**: From none to full
- **Font Sizes**: From xs to 4xl
- **Color Schemes**: Pre-configured Material 3 color schemes

## Updates

This package is automatically updated when design tokens change in Figma.

## License

MIT