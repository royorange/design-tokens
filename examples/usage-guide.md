# 使用指南

本文档包含各平台的详细使用示例。

## Flutter 使用示例

### 基础配置

```yaml
# pubspec.yaml
dependencies:
  design_tokens:
    git:
      url: https://github.com/wisburg/design-tokens.git
      path: packages/flutter
      ref: v1.0.0
```

### 应用主题

```dart
import 'package:flutter/material.dart';
import 'package:design_tokens/design_tokens.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: DesignTokens.lightTheme,
      darkTheme: DesignTokens.darkTheme,
      themeMode: ThemeMode.system,
      home: HomePage(),
    );
  }
}
```

### 使用颜色和间距

```dart
// 使用 Theme（推荐）
Container(
  color: Theme.of(context).colorScheme.primary,
  padding: EdgeInsets.all(DesignTokens.spacing.md),
);

// 直接使用
Container(
  decoration: BoxDecoration(
    color: AppColorSchemes.primary500,
    borderRadius: BorderRadius.circular(DesignTokens.radius.md),
  ),
);
```

## Tailwind CSS 使用示例

### 配置

```javascript
// tailwind.config.js
const designTokens = require('@wisburg/design-tokens-tailwind');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,vue}'],
  theme: {
    colors: designTokens.colors,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
  }
};
```

### 使用示例

```html
<!-- 原有类名继续工作 -->
<div class="bg-primary-500 text-white p-4 rounded-md">
  <h2 class="text-2xl font-bold">标题</h2>
  <p class="text-neutral-100 mt-2">内容</p>
</div>

<!-- 响应式设计 -->
<div class="p-4 md:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-900">
  <h1 class="text-xl md:text-2xl lg:text-3xl text-neutral-900 dark:text-white">
    响应式标题
  </h1>
</div>
```

## CSS 变量使用示例

### 基础配置

```javascript
// main.js 或 app.js
import '@wisburg/design-tokens-css/css/variables.css';
```

### 原生 CSS

```css
.button {
  background-color: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--color-primary-600);
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .card {
    background: var(--color-background-elevated);
    border-color: var(--color-border-default);
  }
}
```

### Vue 3 组件

```vue
<template>
  <div class="container">
    <h1 class="title">{{ title }}</h1>
    <button class="primary-button" @click="handleClick">
      点击我
    </button>
  </div>
</template>

<script setup>
import { tokens } from '@wisburg/design-tokens-css';

const title = '使用 Design Tokens';

const handleClick = () => {
  console.log('Primary color:', tokens.colors.primary[500]);
};
</script>

<style scoped>
.container {
  padding: var(--spacing-6);
  background: var(--color-background-base);
}

.title {
  color: var(--color-text-primary);
  font-size: 24px;
  margin-bottom: var(--spacing-4);
}

.primary-button {
  background: var(--color-primary-500);
  color: white;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
}

.primary-button:hover {
  background: var(--color-primary-600);
}
</style>
```

### React 组件

```jsx
import React from 'react';
import { tokens } from '@wisburg/design-tokens-css';

export function Card({ title, children }) {
  // 使用 JS 对象
  const styles = {
    container: {
      backgroundColor: tokens.colors.white,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[4],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    title: {
      color: tokens.colors.neutral[900],
      fontSize: '18px',
      marginBottom: tokens.spacing[2]
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      {children}
    </div>
  );
}

// 或使用 CSS 类
export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      style={{
        '--btn-color': `var(--color-${variant}-500)`
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Styled Components

```jsx
import styled from 'styled-components';

const Button = styled.button`
  background: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Card = styled.div`
  background: var(--color-background-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  
  @media (prefers-color-scheme: dark) {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
  }
`;
```

## 主题切换示例

### React Context

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// 使用
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换到{theme === 'light' ? '暗色' : '亮色'}模式
    </button>
  );
}
```

### Vue 3 Composable

```javascript
// useTheme.js
import { ref, watch } from 'vue';

export function useTheme() {
  const theme = ref('light');

  watch(theme, (newTheme) => {
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  });

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  return {
    theme,
    toggleTheme
  };
}
```

## 最佳实践

### 1. 优先使用语义化 Token

```css
/* ✅ 好 */
.error-message {
  color: var(--color-error-600);
  background: var(--color-error-50);
}

/* ❌ 避免 */
.error-message {
  color: #dc2626;
  background: #fef2f2;
}
```

### 2. 组件化思维

```css
/* 定义组件 Token */
.button {
  /* 使用组件级 Token */
  padding: var(--button-padding-y) var(--button-padding-x);
  border-radius: var(--button-radius);
  
  /* 降级到语义化 Token */
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

### 3. 响应式 Token

```css
:root {
  --container-padding: var(--spacing-4);
}

@media (min-width: 768px) {
  :root {
    --container-padding: var(--spacing-6);
  }
}

.container {
  padding: var(--container-padding);
}
```

## 调试技巧

### 1. 查看所有 CSS 变量

```javascript
// 在控制台运行
const styles = getComputedStyle(document.documentElement);
const cssVars = Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.selectorText === ':root')
  .flatMap(rule => Array.from(rule.style))
  .filter(prop => prop.startsWith('--'));

console.table(cssVars.map(prop => ({
  variable: prop,
  value: styles.getPropertyValue(prop)
})));
```

### 2. Token 验证

```javascript
import { tokens } from '@wisburg/design-tokens-css';

// 验证颜色
console.log('Primary colors:', tokens.colors.primary);

// 验证间距
console.log('Spacing scale:', tokens.spacing);
```

## 迁移指南

### 从硬编码颜色迁移

```css
/* 旧代码 */
.header {
  background: #4f46e5;
  color: #ffffff;
}

/* 新代码 */
.header {
  background: var(--color-primary-500);
  color: var(--color-white);
}
```

### 使用 PostCSS 插件自动迁移

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-replace-values')({
      '#4f46e5': 'var(--color-primary-500)',
      '#ffffff': 'var(--color-white)',
      // 添加更多映射
    })
  ]
};
```