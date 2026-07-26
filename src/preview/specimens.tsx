/**
 * Token-driven specimen components for the `/__preview` harness.
 *
 * Every visual property that a design direction controls (colour, font,
 * weight, size, spacing) is read from a `--ps-*` CSS custom property — the
 * same variables `src/tokens.css` emits from `.agent/design-tokens.json` and
 * the same contract the platform preview (`render-sheet.ts`) uses. So editing
 * the token file restyles these specimens (and the real app) with no code
 * change. The kit is deliberately small (typography, buttons, card, inputs,
 * swatches) and data-free so the harness always builds; later preview stages
 * grow the manifest, not this contract.
 */
import type { CSSProperties, ReactElement } from 'react';

const card: CSSProperties = {
  background: 'var(--ps-color-surface-muted)',
  border: '1px solid var(--ps-color-border)',
  borderRadius: '8px',
  padding: 'var(--ps-space-md)',
  color: 'var(--ps-color-ink)',
};

const btnBase: CSSProperties = {
  font: 'inherit',
  fontWeight: 'var(--ps-weight-bold)' as unknown as number,
  padding: 'var(--ps-space-sm) var(--ps-space-md)',
  borderRadius: '6px',
  border: '1px solid var(--ps-color-primary)',
  cursor: 'pointer',
};

const field: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: 'var(--ps-space-md)',
};

const input: CSSProperties = {
  font: 'inherit',
  padding: 'var(--ps-space-sm)',
  border: '1px solid var(--ps-color-border)',
  borderRadius: '6px',
  background: 'var(--ps-color-surface)',
  color: 'var(--ps-color-ink)',
};

export function TypographySpecimen(): ReactElement {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--ps-font-heading)',
          fontWeight: 'var(--ps-weight-bold)' as unknown as number,
          fontSize: 'var(--ps-size-heading)',
          color: 'var(--ps-color-ink)',
          margin: 0,
        }}
      >
        Heading — the quick brown fox
      </h3>
      <p
        style={{
          fontFamily: 'var(--ps-font-body)',
          fontSize: 'var(--ps-size-body)',
          fontWeight: 'var(--ps-weight-regular)' as unknown as number,
          color: 'var(--ps-color-ink-muted)',
          margin: 'var(--ps-space-sm) 0 0',
        }}
      >
        Body copy — jumps over the lazy dog. Typography, colour, and spacing are
        driven entirely by design tokens.
      </p>
    </div>
  );
}

export function ButtonsSpecimen(): ReactElement {
  return (
    <div style={{ display: 'flex', gap: 'var(--ps-space-sm)' }}>
      <button
        type="button"
        style={{ ...btnBase, background: 'var(--ps-color-primary)', color: 'var(--ps-color-on-primary)' }}
      >
        Primary
      </button>
      <button
        type="button"
        style={{ ...btnBase, background: 'transparent', color: 'var(--ps-color-primary)' }}
      >
        Secondary
      </button>
    </div>
  );
}

export function CardSpecimen(): ReactElement {
  return (
    <article style={card}>
      <h4
        style={{
          fontFamily: 'var(--ps-font-heading)',
          fontWeight: 'var(--ps-weight-bold)' as unknown as number,
          margin: '0 0 var(--ps-space-sm)',
        }}
      >
        Card title
      </h4>
      <p style={{ color: 'var(--ps-color-ink-muted)', margin: 0 }}>
        A surface for grouped content — background, border, and padding all come
        from tokens.
      </p>
    </article>
  );
}

export function FormInputsSpecimen(): ReactElement {
  return (
    <form style={{ maxWidth: '20rem' }}>
      <div style={field}>
        <label htmlFor="specimen-name" style={{ fontWeight: 'var(--ps-weight-bold)' as unknown as number }}>
          Full name
        </label>
        <input id="specimen-name" type="text" placeholder="Ada Lovelace" style={input} />
      </div>
      <div style={field}>
        <label htmlFor="specimen-role" style={{ fontWeight: 'var(--ps-weight-bold)' as unknown as number }}>
          Role
        </label>
        <select id="specimen-role" style={input}>
          <option>Engineer</option>
          <option>Designer</option>
        </select>
      </div>
    </form>
  );
}

const SWATCH_VARS = [
  '--ps-color-surface',
  '--ps-color-surface-muted',
  '--ps-color-border',
  '--ps-color-ink-muted',
  '--ps-color-ink',
  '--ps-color-primary',
  '--ps-color-on-primary',
] as const;

export function ColourSwatchesSpecimen(): ReactElement {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ps-space-sm)' }}>
      {SWATCH_VARS.map((v) => (
        <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              display: 'block',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--ps-color-border)',
              background: `var(${v})`,
            }}
          />
          <span style={{ fontSize: '10px', color: 'var(--ps-color-ink-muted)' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
