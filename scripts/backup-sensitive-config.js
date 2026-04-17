#!/usr/bin/env node
/**
 * Backup sensitive config files after sanitizing secrets.
 * Generates *.sanitized versions that are safe to commit.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_ROOT = path.resolve(__dirname, '..');
const TARGETS = ['settings.json', 'config.json'];

// Patterns that indicate a secret value
const SECRET_PATTERNS = [
  /^sk-[a-zA-Z0-9_-]{20,}$/, // Anthropic / Kimi API keys
  /^ghp_[a-zA-Z0-9]{30,}$/, // GitHub PATs
  /^[A-Za-z0-9_-]{20,}$/, // Generic long tokens (heuristic)
];

const KNOWN_SECRET_KEYS = [
  /token/i,
  /key/i,
  /secret/i,
  /password/i,
  /auth/i,
  /credential/i,
  /api.?key/i,
];

function looksLikeSecret(key, value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('YOUR_') && value.endsWith('_HERE')) return false;
  // Skip pure numbers to avoid false positives like token counts
  if (/^\d+$/.test(value)) return false;
  const keyMatches = KNOWN_SECRET_KEYS.some((p) => p.test(key));
  const valueMatches = SECRET_PATTERNS.some((p) => p.test(value));
  return keyMatches || valueMatches;
}

function sanitize(obj, keyPath = '') {
  if (typeof obj === 'string') {
    if (looksLikeSecret(keyPath, obj)) {
      const placeholderKey = keyPath
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .toUpperCase();
      return `YOUR_${placeholderKey}_HERE（${keyPath}，请替换为真实值）`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, idx) => sanitize(item, `${keyPath}[${idx}]`));
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = sanitize(v, keyPath ? `${keyPath}.${k}` : k);
    }
    return result;
  }

  return obj;
}

function main() {
  for (const file of TARGETS) {
    const sourcePath = path.join(CONFIG_ROOT, file);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`[skip] ${file} not found.`);
      continue;
    }

    const raw = fs.readFileSync(sourcePath, 'utf8');
    const parsed = JSON.parse(raw);
    const sanitized = sanitize(parsed);
    const outputName = `${file}.sanitized`;
    const outputPath = path.join(CONFIG_ROOT, outputName);

    fs.writeFileSync(outputPath, JSON.stringify(sanitized, null, 2) + '\n');
    console.log(`[generated] ${outputName}`);
  }

  console.log('\nDone. You can safely commit the *.sanitized files.');
}

main();
