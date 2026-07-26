import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone `/__preview` harness build target — emits ONE self-contained HTML.
//
// Bundles ONLY `preview.html` → `src/preview/preview.tsx` → the token-driven
// specimen kit. It deliberately does NOT run `scripts/gen-aws-config.mjs` or the
// `tsc -b` backend chain the app `build` uses, and the preview entry imports none
// of the app's Amplify/AppSync/Cognito wiring — so the artifact is fully
// self-contained and builds with zero AWS/env inputs. `build:preview` runs
// `scripts/gen-tokens-css.mjs` first so `src/tokens.css` is fresh.
//
// AI6P-2060 S2 — the build emits a SINGLE self-contained file: `singleFileInline`
// inlines every emitted JS/CSS asset into `dist-preview/preview.html` and drops
// the separate `assets/*` files. This lets the ci-runner ship the whole harness
// over its bounded single-line stdout verdict channel (gzip+base64) — no
// multi-file serving, no S3, no new IAM grant on the no-data runner role.

/**
 * Inline every emitted JS chunk and CSS asset into the single HTML document, then
 * delete the now-orphaned asset files, so `dist-preview/` holds exactly one
 * self-contained `.html`. Zero external dependency — a small post-bundle plugin.
 */
function singleFileInline(): Plugin {
  const escapeForRegExp = (s: string): string =>
    s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    name: 'ps-preview-single-file',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlKey = Object.keys(bundle).find((k) => k.endsWith('.html'));
      if (!htmlKey) return;
      const htmlAsset = bundle[htmlKey];
      if (htmlAsset.type !== 'asset') return;
      let html = String(htmlAsset.source);

      for (const [key, chunk] of Object.entries(bundle)) {
        if (key === htmlKey) continue;
        const fileName = escapeForRegExp(chunk.fileName);
        if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
          // Guard against a literal `</script>` in the bundled code closing the tag.
          const code = chunk.code.replace(/<\/(script)/gi, '<\\/$1');
          const scriptTag = new RegExp(
            `<script[^>]*\\bsrc="[^"]*${fileName}"[^>]*></script>`,
          );
          html = html.replace(scriptTag, `<script type="module">${code}</script>`);
          delete bundle[key];
        } else if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
          const css = String(chunk.source);
          const linkTag = new RegExp(
            `<link[^>]*\\bhref="[^"]*${fileName}"[^>]*>`,
          );
          html = html.replace(linkTag, `<style>${css}</style>`);
          delete bundle[key];
        }
      }
      htmlAsset.source = html;
    },
  };
}

export default defineConfig({
  plugins: [react(), singleFileInline()],
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
    // Inline everything into one document: one CSS file (no code-split), one JS
    // chunk (no dynamic-import splitting), and any referenced asset as a data URI.
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      input: 'preview.html',
      output: { inlineDynamicImports: true },
    },
  },
});
