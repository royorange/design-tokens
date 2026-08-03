const fs = require('fs');
const path = require('path');

/**
 * 构建产物校验
 * 检查各平台产物存在、可加载、且不含坏值（undefined / NaN / 双单位）
 */

const errors = [];

// CSS 产物
const cssFile = path.join(__dirname, '../packages/css/css/variables.css');
if (!fs.existsSync(cssFile)) {
  errors.push('CSS: variables.css 不存在');
} else {
  const css = fs.readFileSync(cssFile, 'utf8');
  const badValues = css.match(/:\s*(undefined|NaN|null|[\d.]+%px|[\d.]+pxpx)\s*;/g);
  if (badValues) {
    errors.push(`CSS: 发现坏值 ${JSON.stringify(badValues.slice(0, 5))}`);
  }
}

// Tailwind 产物
try {
  const tailwind = require('../packages/tailwind');
  for (const key of ['colors', 'spacing', 'borderRadius', 'fontSize']) {
    if (!tailwind[key] || Object.keys(tailwind[key]).length === 0) {
      errors.push(`Tailwind: 缺少 ${key}`);
    }
  }
  const flat = JSON.stringify(tailwind);
  if (/undefinedpx|NaN|%px/.test(flat)) {
    errors.push('Tailwind: 发现坏值（undefined/NaN/%px）');
  }
} catch (e) {
  errors.push(`Tailwind: 无法加载 index.js - ${e.message}`);
}

// Flutter 产物（编译检查由 CI 中的 dart analyze 负责）
const dartFile = path.join(__dirname, '../packages/flutter/lib/design_tokens.dart');
if (!fs.existsSync(dartFile)) {
  errors.push('Flutter: design_tokens.dart 不存在');
} else {
  const dart = fs.readFileSync(dartFile, 'utf8');
  if (/Color\(0x[0-9A-Fa-f]{0,7}\)|undefined|NaN/.test(dart)) {
    errors.push('Flutter: 发现坏值（无效颜色/undefined/NaN）');
  }
}

if (errors.length > 0) {
  console.error('❌ 产物校验失败:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('✅ 所有平台产物校验通过');
