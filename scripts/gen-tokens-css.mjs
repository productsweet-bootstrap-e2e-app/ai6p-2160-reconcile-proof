#!/usr/bin/env node
/**
 * Emit `src/tokens.css` from `.agent/design-tokens.json`.
 *
 * Reads the tenant's W3C Design Tokens (DTCG) file, resolves aliases, and
 * projects the token set into a `:root { --ps-…: … }` block of CSS custom
 * properties. Every downstream stylesheet (the app baseline `src/base.css`
 * and the `/__preview` specimen kit) consumes ONLY those `--ps-*` variables,
 * so restyling the whole project is a one-file token edit.
 *
 * This emitter is deliberately a byte-for-byte match of the platform contract
 * in `shared/src/design-tokens/render-sheet.ts` (the `--ps-` component
 * convention, `.agent/design-tokens-format.md` §5): same variable names, same
 * canonical + shallow-alias precedence, same neutral fallbacks, same font-stack
 * handling. Do NOT invent a second convention here — a divergence is caught by
 * the platform test that pins this output against `renderComponentSheet`.
 *
 * Pure + deterministic: same token file → byte-identical `tokens.css`. No
 * network, no env, no time. Run standalone (`node scripts/gen-tokens-css.mjs`)
 * with zero dependencies, so the harness build needs no install of its own.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const TOKENS_JSON = join(process.cwd(), '.agent', 'design-tokens.json');
const OUT_CSS = join(process.cwd(), 'src', 'tokens.css');

/**
 * Token→CSS-custom-property convention. Order here is the emission order of the
 * `:root` block. Mirrors `CONVENTIONS` in `render-sheet.ts` exactly.
 */
const CONVENTIONS = [
  { cssVar: '--ps-color-surface', path: 'color.base.neutral.0', altPaths: ['color.surface'], fallback: '#ffffff', kind: 'raw' },
  { cssVar: '--ps-color-surface-muted', path: 'color.base.neutral.50', altPaths: ['color.surfaceMuted'], fallback: '#f8fafc', kind: 'raw' },
  { cssVar: '--ps-color-border', path: 'color.base.neutral.200', altPaths: ['color.border'], fallback: '#e2e8f0', kind: 'raw' },
  { cssVar: '--ps-color-ink-muted', path: 'color.base.neutral.500', altPaths: ['color.inkMuted', 'color.textMuted', 'color.muted'], fallback: '#64748b', kind: 'raw' },
  { cssVar: '--ps-color-ink', path: 'color.base.neutral.900', altPaths: ['color.ink', 'color.text'], fallback: '#0f172a', kind: 'raw' },
  { cssVar: '--ps-color-primary', path: 'color.brand.primary', altPaths: ['color.primary'], fallback: '#2563eb', kind: 'raw' },
  { cssVar: '--ps-color-on-primary', path: 'color.brand.onPrimary', altPaths: ['color.onPrimary'], fallback: '#ffffff', kind: 'raw' },
  { cssVar: '--ps-font-body', path: 'typography.family.body', altPaths: ['typography.family.sans', 'font.body', 'font.sans'], fallback: '', kind: 'fontFamily' },
  { cssVar: '--ps-font-heading', path: 'typography.family.heading', altPaths: ['typography.family.body', 'typography.family.sans', 'font.heading', 'font.body', 'font.sans'], fallback: '', kind: 'fontFamily' },
  { cssVar: '--ps-size-body', path: 'typography.size.body', altPaths: ['typography.fontSize.body', 'fontSize.body'], fallback: '16px', kind: 'raw' },
  { cssVar: '--ps-size-heading', path: 'typography.size.heading', altPaths: ['typography.fontSize.heading', 'fontSize.heading'], fallback: '28px', kind: 'raw' },
  { cssVar: '--ps-weight-regular', path: 'typography.weight.regular', altPaths: ['typography.fontWeight.regular', 'fontWeight.regular'], fallback: '400', kind: 'raw' },
  { cssVar: '--ps-weight-bold', path: 'typography.weight.bold', altPaths: ['typography.fontWeight.bold', 'fontWeight.bold'], fallback: '700', kind: 'raw' },
  { cssVar: '--ps-space-sm', path: 'spacing.sm', altPaths: ['space.sm'], fallback: '8px', kind: 'raw' },
  { cssVar: '--ps-space-md', path: 'spacing.md', altPaths: ['space.md'], fallback: '16px', kind: 'raw' },
  { cssVar: '--ps-space-lg', path: 'spacing.lg', altPaths: ['space.lg'], fallback: '32px', kind: 'raw' },
];

const SYSTEM_FONT_STACK = ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'];
const GENERIC_FAMILY = 'sans-serif';

/** Make a token value safe to inline as a CSS declaration value. Mirrors render-sheet `cssSafe`. */
function cssSafe(raw) {
  return String(raw)
    .replace(/\\/g, '')
    .replace(/[;{}<>]/g, '')
    .replace(/url\s*\(/gi, '')
    .replace(/@import/gi, '')
    .replace(/\/\//g, '')
    .trim();
}

/** Quote a font-family name if it needs quoting. Mirrors render-sheet `quoteFamily`. */
function quoteFamily(name) {
  const trimmed = String(name).trim();
  if (trimmed === '') return '';
  return /^-?[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmed) ? trimmed : `"${trimmed.replace(/["\\]/g, '')}"`;
}

/** Turn a fontFamily token value into a CSS font stack with the system stack appended. */
function formatFontFamily(value) {
  const provided = Array.isArray(value)
    ? value.filter((v) => typeof v === 'string')
    : typeof value === 'string'
      ? [value]
      : [];
  const seen = new Set([GENERIC_FAMILY]);
  const stack = [];
  for (const family of [...provided, ...SYSTEM_FONT_STACK]) {
    const clean = cssSafe(family);
    if (clean === '') continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    stack.push(quoteFamily(clean));
  }
  stack.push(GENERIC_FAMILY);
  return stack.join(', ');
}

/** Flatten a DTCG token document to `path -> rawValue` (a node owning `$value` is a token). */
function flattenRaw(node, prefix, out) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    out.set(prefix, node.$value);
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    flattenRaw(child, prefix ? `${prefix}.${key}` : key, out);
  }
}

/** Resolve whole-value `{a.b.c}` alias references (multi-hop, cycle-guarded). */
function resolveAliases(raw) {
  const resolved = new Map();
  const resolveOne = (value, seen) => {
    if (typeof value !== 'string') return value;
    const match = /^\{([^}]+)\}$/.exec(value.trim());
    if (!match) return value;
    const target = match[1];
    if (seen.has(target) || !raw.has(target)) return value; // cycle or dangling → opaque
    seen.add(target);
    return resolveOne(raw.get(target), seen);
  };
  for (const [path, value] of raw) {
    resolved.set(path, resolveOne(value, new Set([path])));
  }
  return resolved;
}

/** Resolve a convention entry to its final CSS value (token value or documented fallback). */
function resolveConvention(entry, tokens) {
  const candidatePaths = [entry.path, ...(entry.altPaths ?? [])];
  let hit;
  for (const p of candidatePaths) {
    if (tokens.has(p)) {
      hit = tokens.get(p);
      break;
    }
  }
  if (entry.kind === 'fontFamily') {
    return formatFontFamily(hit);
  }
  if (hit === undefined) return entry.fallback;
  return cssSafe(hit) || entry.fallback;
}

function main() {
  let doc = {};
  try {
    doc = JSON.parse(readFileSync(TOKENS_JSON, 'utf8'));
  } catch {
    // No token file (or unparseable) → emit the neutral-fallback baseline so the
    // build always produces a usable tokens.css. Matches render-sheet tolerance.
    doc = {};
  }
  const raw = new Map();
  flattenRaw(doc, '', raw);
  const tokens = resolveAliases(raw);

  const lines = CONVENTIONS.map((entry) => `  ${entry.cssVar}: ${resolveConvention(entry, tokens)};`);
  const css = `/* GENERATED by scripts/gen-tokens-css.mjs from .agent/design-tokens.json — do not edit by hand. */\n:root {\n${lines.join('\n')}\n}\n`;

  mkdirSync(dirname(OUT_CSS), { recursive: true });
  writeFileSync(OUT_CSS, css, 'utf8');
  process.stdout.write(`Wrote ${CONVENTIONS.length} --ps-* custom properties to src/tokens.css\n`);
}

main();
