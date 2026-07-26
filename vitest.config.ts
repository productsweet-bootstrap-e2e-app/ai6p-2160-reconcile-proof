import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test harness seeded by Product Sweet bootstrap (AI6P-2113).
//
// **jsdom has no layout engine.** It can tell you a component rendered, what
// text it produced, and how it responds to events. It cannot tell you anything
// about geometry — clipping, overflow, scroll, element size or position all
// report as zero or empty. A green suite here does NOT mean the UI looks right.
// Geometry-dependent defects need a real browser or a live measurement; do not
// chase them with a jsdom test, and do not treat this suite's silence on them
// as coverage.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Report coverage without enforcing a threshold. A threshold on a project
    // with one exemplar test fires immediately and teaches the tenant to
    // disable it on day one — which is worse than no threshold at all. Add one
    // when there is a suite worth defending.
    coverage: {
      reporter: ['text-summary'],
    },
  },
});
