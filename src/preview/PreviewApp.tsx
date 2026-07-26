/**
 * The `/__preview` harness view: renders every specimen the manifest declares,
 * each in a labelled section. Pure + data-free — no routing into the app, no
 * network, no auth. Imports no CSS itself (the `preview.tsx` entry wires
 * `tokens.css`), so it renders in isolation.
 */
import type { ReactElement } from 'react';
import { previewManifest } from './manifest';

const page = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: 'var(--ps-space-lg) var(--ps-space-md)',
  fontFamily: 'var(--ps-font-body)',
  fontSize: 'var(--ps-size-body)',
  color: 'var(--ps-color-ink)',
  background: 'var(--ps-color-surface)',
} as const;

const section = {
  padding: 'var(--ps-space-lg) 0',
  borderTop: '1px solid var(--ps-color-border)',
} as const;

const sectionTitle = {
  fontFamily: 'var(--ps-font-heading)',
  fontSize: 'calc(var(--ps-size-body) * 0.85)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--ps-color-ink-muted)',
  margin: '0 0 var(--ps-space-md)',
} as const;

export function PreviewApp(): ReactElement {
  return (
    <main style={page} data-testid="preview-root">
      <header>
        <h1
          style={{
            fontFamily: 'var(--ps-font-heading)',
            fontWeight: 'var(--ps-weight-bold)' as unknown as number,
            fontSize: 'var(--ps-size-heading)',
            margin: 0,
          }}
        >
          Component preview
        </h1>
        <p style={{ color: 'var(--ps-color-ink-muted)' }}>
          Token-driven specimen kit — restyle by editing{' '}
          <code>.agent/design-tokens.json</code>.
        </p>
      </header>
      {previewManifest.map(({ id, title, Component }) => (
        <section key={id} id={id} style={section} data-specimen={id}>
          <p style={sectionTitle}>{title}</p>
          <Component />
        </section>
      ))}
    </main>
  );
}
