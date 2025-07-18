# Tailwind CSS 使用示例

## 基础配置

### 1. 安装依赖

```bash
npm install @wisburg/design-tokens-tailwind
# 或
yarn add @wisburg/design-tokens-tailwind
```

### 2. 配置 Tailwind

```javascript
// tailwind.config.js
const designTokens = require('@wisburg/design-tokens-tailwind');

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    // 直接替换，保持向后兼容
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
```

## 使用示例

### 1. 基础用法（兼容现有代码）

```html
<!-- 原有类名继续工作 -->
<div class="bg-primary-500 text-white p-4 rounded-md">
  <h2 class="text-2xl font-bold mb-2">标题</h2>
  <p class="text-neutral-100">
    使用原有的颜色命名，如 primary-500, neutral-100 等
  </p>
</div>

<!-- 使用语义化间距 -->
<div class="p-md space-y-sm">
  <div class="p-lg bg-neutral-50 rounded-lg">
    内容区域
  </div>
</div>
```

### 2. 组件示例

#### 按钮组件

```html
<!-- Primary Button -->
<button class="
  bg-primary-500 hover:bg-primary-600 
  text-white font-medium
  px-4 py-3 rounded-md
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  主要按钮
</button>

<!-- Secondary Button -->
<button class="
  bg-neutral-200 hover:bg-neutral-300 
  text-neutral-900 font-medium
  px-4 py-3 rounded-md
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2
">
  次要按钮
</button>

<!-- Outlined Button -->
<button class="
  border-2 border-primary-500 
  text-primary-500 hover:bg-primary-50
  font-medium
  px-4 py-3 rounded-md
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  边框按钮
</button>
```

#### 卡片组件

```html
<!-- 基础卡片 -->
<div class="bg-white rounded-lg border border-neutral-300 p-6">
  <h3 class="text-lg font-semibold text-neutral-900 mb-2">
    卡片标题
  </h3>
  <p class="text-neutral-600">
    这是一个使用 design tokens 的卡片组件示例。
  </p>
</div>

<!-- 悬浮卡片 -->
<div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
  <div class="flex items-center mb-4">
    <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
      <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
      </svg>
    </div>
    <h3 class="ml-3 text-lg font-semibold text-neutral-900">
      功能特性
    </h3>
  </div>
  <p class="text-neutral-600">
    使用阴影和过渡效果创建交互式卡片。
  </p>
</div>
```

#### 表单组件

```html
<!-- 输入框 -->
<div class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-neutral-700 mb-1">
      邮箱地址
    </label>
    <input type="email" class="
      w-full px-3 py-2 
      border border-neutral-300 rounded-md
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      placeholder-neutral-400
    " placeholder="example@email.com">
  </div>
  
  <div>
    <label class="block text-sm font-medium text-neutral-700 mb-1">
      密码
    </label>
    <input type="password" class="
      w-full px-3 py-2 
      border border-neutral-300 rounded-md
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    ">
    <p class="mt-1 text-sm text-neutral-500">
      密码至少需要8个字符
    </p>
  </div>
</div>

<!-- 选择框 -->
<select class="
  w-full px-3 py-2 
  border border-neutral-300 rounded-md
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
  bg-white
">
  <option>选择一个选项</option>
  <option>选项 1</option>
  <option>选项 2</option>
  <option>选项 3</option>
</select>
```

### 3. 布局示例

#### 导航栏

```html
<nav class="bg-white border-b border-neutral-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <span class="text-xl font-bold text-primary-600">Logo</span>
      </div>
      
      <!-- Navigation Links -->
      <div class="hidden sm:flex sm:space-x-8">
        <a href="#" class="
          inline-flex items-center px-1 pt-1 
          border-b-2 border-primary-500
          text-sm font-medium text-neutral-900
        ">
          首页
        </a>
        <a href="#" class="
          inline-flex items-center px-1 pt-1 
          border-b-2 border-transparent
          text-sm font-medium text-neutral-500 
          hover:text-neutral-700 hover:border-neutral-300
          transition-colors duration-200
        ">
          产品
        </a>
        <a href="#" class="
          inline-flex items-center px-1 pt-1 
          border-b-2 border-transparent
          text-sm font-medium text-neutral-500 
          hover:text-neutral-700 hover:border-neutral-300
          transition-colors duration-200
        ">
          关于
        </a>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-4">
        <button class="text-neutral-500 hover:text-neutral-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
        <button class="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
          登录
        </button>
      </div>
    </div>
  </div>
</nav>
```

#### 侧边栏布局

```html
<div class="flex h-screen bg-neutral-50">
  <!-- Sidebar -->
  <div class="w-64 bg-white border-r border-neutral-200">
    <div class="p-6">
      <h2 class="text-lg font-semibold text-neutral-900">菜单</h2>
    </div>
    <nav class="px-4 pb-6">
      <a href="#" class="
        flex items-center px-4 py-2 
        text-sm font-medium rounded-md
        text-white bg-primary-500
      ">
        <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        仪表盘
      </a>
      <a href="#" class="
        flex items-center px-4 py-2 mt-2
        text-sm font-medium rounded-md
        text-neutral-700 hover:bg-neutral-100
      ">
        <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
        用户管理
      </a>
    </nav>
  </div>
  
  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    <div class="p-8">
      <h1 class="text-2xl font-bold text-neutral-900 mb-6">
        页面标题
      </h1>
      <!-- 内容区域 -->
    </div>
  </div>
</div>
```

### 4. 响应式设计

```html
<!-- 响应式网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg border border-neutral-200">
    <h3 class="text-lg font-semibold text-neutral-900 mb-2">特性 1</h3>
    <p class="text-neutral-600">描述文字</p>
  </div>
  <div class="bg-white p-6 rounded-lg border border-neutral-200">
    <h3 class="text-lg font-semibold text-neutral-900 mb-2">特性 2</h3>
    <p class="text-neutral-600">描述文字</p>
  </div>
  <div class="bg-white p-6 rounded-lg border border-neutral-200">
    <h3 class="text-lg font-semibold text-neutral-900 mb-2">特性 3</h3>
    <p class="text-neutral-600">描述文字</p>
  </div>
</div>

<!-- 响应式间距 -->
<div class="p-4 md:p-6 lg:p-8">
  <h2 class="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900">
    响应式标题
  </h2>
  <p class="mt-2 md:mt-4 text-sm md:text-base text-neutral-600">
    响应式文本内容
  </p>
</div>
```

### 5. 暗色模式支持

```html
<!-- 使用 CSS 变量实现暗色模式 -->
<div class="bg-[var(--color-background-base)] text-[var(--color-text-primary)]">
  <div class="p-6 rounded-lg bg-[var(--color-background-elevated)] border border-[var(--color-border-default)]">
    <h3 class="text-lg font-semibold">
      自适应主题
    </h3>
    <p class="mt-2 text-[var(--color-text-secondary)]">
      使用 CSS 变量可以自动适配明暗主题
    </p>
  </div>
</div>

<!-- 或使用 Tailwind 的 dark 模式 -->
<div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
  <div class="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-800">
    <h3 class="text-lg font-semibold">
      Tailwind Dark Mode
    </h3>
    <p class="mt-2 text-neutral-600 dark:text-neutral-400">
      使用 dark: 前缀实现暗色模式
    </p>
  </div>
</div>
```

## Vue/Nuxt 组件示例

```vue
<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-neutral-900">
          {{ title }}
        </h1>
      </div>
    </header>
    
    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          v-for="stat in stats"
          :key="stat.id"
          :title="stat.title"
          :value="stat.value"
          :change="stat.change"
          :icon="stat.icon"
        />
      </div>
      
      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900">
            数据列表
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  名称
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="item in items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {{ item.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': item.status === 'active',
                      'bg-red-100 text-red-800': item.status === 'inactive'
                    }">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button class="text-primary-600 hover:text-primary-900">
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// StatsCard 组件
const StatsCard = {
  props: ['title', 'value', 'change', 'icon'],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0 p-3 rounded-md" 
          :class="{
            'bg-primary-100': change > 0,
            'bg-red-100': change < 0,
            'bg-neutral-100': change === 0
          }">
          <component :is="icon" class="h-6 w-6"
            :class="{
              'text-primary-600': change > 0,
              'text-red-600': change < 0,
              'text-neutral-600': change === 0
            }" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-neutral-500 truncate">
              {{ title }}
            </dt>
            <dd class="flex items-baseline">
              <div class="text-2xl font-semibold text-neutral-900">
                {{ value }}
              </div>
              <div class="ml-2 flex items-baseline text-sm font-semibold"
                :class="{
                  'text-green-600': change > 0,
                  'text-red-600': change < 0,
                  'text-neutral-600': change === 0
                }">
                {{ change > 0 ? '+' : '' }}{{ change }}%
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  `
}
</script>
```

## 最佳实践

1. **使用设计系统的颜色**：避免使用 Tailwind 默认颜色如 `blue-500`，使用 `primary-500`
2. **语义化间距**：使用 `p-md`, `m-lg` 等语义化类名
3. **组件化**：将常用的样式组合封装成组件
4. **响应式优先**：始终考虑移动端体验
5. **可访问性**：确保颜色对比度符合 WCAG 标准