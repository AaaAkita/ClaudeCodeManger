#!/usr/bin/env node
/**
 * 从 *.sanitized 文件恢复原始配置，并检查是否还有未替换的占位符。
 * Restore original configs from *.sanitized files and warn about remaining placeholders.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_ROOT = path.resolve(__dirname, '..');
const TARGETS = ['settings.json', 'config.json'];
const PLACEHOLDER_PATTERN = /YOUR_[A-Z0-9_]+_HERE[（(]/g;

function restore(file) {
  const sanitizedPath = path.join(CONFIG_ROOT, `${file}.sanitized`);
  const targetPath = path.join(CONFIG_ROOT, file);

  if (!fs.existsSync(sanitizedPath)) {
    console.error(`[skip] ${file}.sanitized 不存在。`);
    return false;
  }

  const content = fs.readFileSync(sanitizedPath, 'utf8');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`[restored] ${file}`);
  return true;
}

function checkPlaceholders(file) {
  const targetPath = path.join(CONFIG_ROOT, file);
  const content = fs.readFileSync(targetPath, 'utf8');
  const matches = content.match(PLACEHOLDER_PATTERN) || [];

  if (matches.length === 0) {
    console.log(`[ok] ${file} 中没有发现占位符。`);
    return true;
  }

  console.warn(`[warn] ${file} 中仍有 ${matches.length} 个占位符未替换：`);
  const unique = [...new Set(matches)];
  for (const p of unique) {
    console.warn(`  - ${p.slice(0, -1)}`); // trim trailing parenthesis
  }
  return false;
}

function main() {
  let allRestored = true;
  let allClean = true;

  for (const file of TARGETS) {
    const restored = restore(file);
    if (!restored) {
      allRestored = false;
      continue;
    }
    const clean = checkPlaceholders(file);
    if (!clean) allClean = false;
  }

  console.log();
  if (!allRestored) {
    console.error('部分文件恢复失败，请检查 *.sanitized 文件是否存在。');
    process.exit(1);
  }

  if (!allClean) {
    console.warn('配置已恢复，但仍有占位符未替换。请在编辑后重新运行此脚本验证。');
    process.exit(2);
  }

  console.log('所有配置已恢复，未发现占位符，可以直接使用。');
}

main();
