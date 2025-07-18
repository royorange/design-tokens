# Wisburg Design Tokens

Flutter design tokens for Wisburg applications. Auto-generated from Figma design system.

## Installation

```yaml
dependencies:
  wisburg_design_tokens: ^1.0.0
```

## Usage

```dart
import 'package:wisburg_design_tokens/design_tokens.dart';

// Use with Material 3
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: AppColorSchemes.lightColorScheme,
  ),
  darkTheme: ThemeData(
    useMaterial3: true,
    colorScheme: AppColorSchemes.darkColorScheme,
  ),
  // ... rest of your app
);

// Access colors directly
Container(
  color: AppColors.primary500,
  padding: EdgeInsets.all(AppSpacing.spacing4),
  child: Text(
    'Hello',
    style: TextStyle(fontSize: AppFontSizes.base),
  ),
);
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