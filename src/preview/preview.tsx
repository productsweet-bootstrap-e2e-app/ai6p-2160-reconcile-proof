/**
 * Standalone entry for the `/__preview` harness (`preview.html`).
 *
 * Mounts the token-driven specimen kit with `src/tokens.css` applied — NO
 * Amplify, NO AppSync, NO Cognito, no `aws-config`. This is what the
 * standalone `build:preview` target bundles, so the harness builds with zero
 * AWS/env inputs. Restyle by editing `.agent/design-tokens.json` and
 * re-running `scripts/gen-tokens-css.mjs`.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens.css';
import { PreviewApp } from './PreviewApp';

createRoot(document.getElementById('preview-root')!).render(
  <StrictMode>
    <PreviewApp />
  </StrictMode>,
);
