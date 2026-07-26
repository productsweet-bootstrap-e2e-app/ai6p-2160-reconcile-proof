import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

// Exemplar test seeded by Product Sweet bootstrap (AI6P-2113).
//
// It exists so the whole chain — vitest config, jsdom environment, testing
// library, the `test` script, and the pr-gate step that runs it — is proven by
// the bootstrap's own first deploy, rather than by your first real task
// discovering it does not work. Keep it, extend it, or replace it with better
// tests; do not delete it and leave nothing.
//
// **This test fails if the DOM environment is missing.** `render` needs
// `document`. That is deliberate: a suite misconfigured to run under Node would
// otherwise exit 0 having run nothing, and the gate would go green for the
// wrong reason.
//
// **What jsdom cannot do:** there is no layout engine. Clipping, overflow,
// scrolling, element size and position are all unavailable — every measurement
// reads as zero. Assert on content, roles and behaviour here; verify anything
// geometric in a real browser.

// `App` calls Amplify on mount to decide whether anyone is signed in. Stub it so
// the exemplar exercises YOUR component rather than the network.
vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(async () => {
    throw new Error('not signed in');
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  confirmSignUp: vi.fn(),
}));

vi.mock('aws-amplify/api', () => ({
  generateClient: () => ({ graphql: vi.fn(async () => ({ data: {} })) }),
}));

describe('App', () => {
  it('renders the project heading', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'AI6P-280 Sacrificial Hello World', level: 1 }),
    ).toBeInTheDocument();
  });

  it('shows the sign-in gate when nobody is signed in', async () => {
    render(<App />);
    // Asserted by ROLE and accessible name, not by CSS class or DOM shape — a
    // query that survives restyling, and one that fails if the control stops
    // being reachable to a screen reader.
    expect(
      await screen.findByRole('button', { name: 'Sign in' }),
    ).toBeInTheDocument();
  });

  it('runs in a DOM environment', () => {
    // Explicit rather than implied. If this fails, the suite is running under
    // Node and every other test in the project is meaningless — check
    // `environment: 'jsdom'` in vitest.config.ts before debugging anything else.
    expect(typeof document).toBe('object');
    expect(document.createElement('div')).toBeInstanceOf(Object);
  });
});
