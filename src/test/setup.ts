// Vitest setup — seeded by Product Sweet bootstrap (AI6P-2113).
//
// `@testing-library/jest-dom` adds the DOM matchers (`toBeInTheDocument`,
// `toHaveTextContent`, …). `cleanup` unmounts between tests so one test's DOM
// cannot leak into the next — without it, `getByRole` starts finding elements
// from a previous test and failures read as impossible.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
