# Flutter 使用示例

## 基础配置

### 1. 添加依赖

```yaml
# pubspec.yaml
dependencies:
  design_tokens:
    path: ../packages/flutter  # 本地开发
    # 或使用 Git
    # git:
    #   url: https://github.com/your-org/design-tokens.git
    #   path: packages/flutter
```

### 2. 应用主题

```dart
import 'package:flutter/material.dart';
import 'package:design_tokens/design_tokens.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Design Tokens Demo',
      theme: DesignTokens.lightTheme,
      darkTheme: DesignTokens.darkTheme,
      themeMode: ThemeMode.system,
      home: HomePage(),
    );
  }
}
```

## 使用 ColorScheme

### 标准用法（推荐）

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Container(
      color: colorScheme.surface,
      child: Text(
        'Hello World',
        style: TextStyle(
          color: colorScheme.onSurface,
        ),
      ),
    );
  }
}
```

### 直接访问颜色

```dart
class ColorfulCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColorSchemes.primary100,
      child: Padding(
        padding: EdgeInsets.all(DesignTokens.spacing.md),
        child: Column(
          children: [
            Icon(
              Icons.star,
              color: AppColorSchemes.primary500,
              size: 48,
            ),
            SizedBox(height: DesignTokens.spacing.sm),
            Text(
              'Premium Feature',
              style: TextStyle(
                color: AppColorSchemes.primary700,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 自定义组件示例

### 1. 自定义按钮

```dart
class TokenButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isPrimary;

  const TokenButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isPrimary = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final colors = isPrimary
        ? (backgroundColor: AppColorSchemes.primary500, textColor: AppColorSchemes.white)
        : (backgroundColor: AppColorSchemes.neutral200, textColor: AppColorSchemes.neutral900);

    return Material(
      color: colors.backgroundColor,
      borderRadius: BorderRadius.circular(DesignTokens.radius.md),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(DesignTokens.radius.md),
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: DesignTokens.spacing.s4,
            vertical: DesignTokens.spacing.s3,
          ),
          child: Text(
            text,
            style: TextStyle(
              color: colors.textColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}
```

### 2. 自定义卡片

```dart
class TokenCard extends StatelessWidget {
  final Widget child;
  final bool isElevated;

  const TokenCard({
    Key? key,
    required this.child,
    this.isElevated = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      decoration: BoxDecoration(
        color: isElevated 
          ? (isDark ? AppColorSchemes.neutral800 : AppColorSchemes.neutral50)
          : Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(DesignTokens.radius.lg),
        border: Border.all(
          color: isDark ? AppColorSchemes.neutral700 : AppColorSchemes.neutral300,
          width: 1,
        ),
        boxShadow: isElevated ? [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ] : null,
      ),
      padding: EdgeInsets.all(DesignTokens.spacing.s4),
      child: child,
    );
  }
}
```

### 3. 主题感知组件

```dart
class ThemedStatusIndicator extends StatelessWidget {
  final String status;

  const ThemedStatusIndicator({
    Key? key,
    required this.status,
  }) : super(key: key);

  Color _getStatusColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    switch (status.toLowerCase()) {
      case 'success':
        return isDark ? Color(0xFF4ADE80) : Color(0xFF22C55E);
      case 'warning':
        return isDark ? Color(0xFFFBBF24) : Color(0xFFF59E0B);
      case 'error':
        return isDark ? Color(0xFFF87171) : Color(0xFFEF4444);
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor(context);
    
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: DesignTokens.spacing.s3,
        vertical: DesignTokens.spacing.s2,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(DesignTokens.radius.full),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: DesignTokens.spacing.s2),
          Text(
            status,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
```

## 完整页面示例

```dart
class TokenDemoPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Design Tokens Demo'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(DesignTokens.spacing.s4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 标题部分
            Text(
              'Components',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: DesignTokens.spacing.s4),
            
            // 按钮示例
            Text(
              'Buttons',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: DesignTokens.spacing.s2),
            Row(
              children: [
                TokenButton(
                  text: 'Primary',
                  onPressed: () {},
                ),
                SizedBox(width: DesignTokens.spacing.s3),
                TokenButton(
                  text: 'Secondary',
                  onPressed: () {},
                  isPrimary: false,
                ),
              ],
            ),
            SizedBox(height: DesignTokens.spacing.s6),
            
            // 卡片示例
            Text(
              'Cards',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: DesignTokens.spacing.s2),
            TokenCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Standard Card',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  SizedBox(height: DesignTokens.spacing.s2),
                  Text(
                    'This is a card using design tokens.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            SizedBox(height: DesignTokens.spacing.s3),
            TokenCard(
              isElevated: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Elevated Card',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  SizedBox(height: DesignTokens.spacing.s2),
                  Text(
                    'This card has elevation and shadow.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            SizedBox(height: DesignTokens.spacing.s6),
            
            // 状态指示器
            Text(
              'Status Indicators',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: DesignTokens.spacing.s2),
            Wrap(
              spacing: DesignTokens.spacing.s2,
              children: [
                ThemedStatusIndicator(status: 'Success'),
                ThemedStatusIndicator(status: 'Warning'),
                ThemedStatusIndicator(status: 'Error'),
                ThemedStatusIndicator(status: 'Info'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

## 最佳实践

1. **优先使用 Theme**：通过 `Theme.of(context)` 访问颜色和样式
2. **语义化命名**：使用 `DesignTokens.spacing.md` 而非硬编码数值
3. **响应式设计**：根据 `Theme.of(context).brightness` 适配明暗主题
4. **组件复用**：创建使用 tokens 的可复用组件
5. **避免硬编码**：所有颜色、间距、圆角都应使用 tokens