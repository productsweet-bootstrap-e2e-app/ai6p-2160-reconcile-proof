#!/usr/bin/env node
// Regenerate `src/aws-config.ts` from SSM before `vite build`.
//
// The parameter set is a DECLARED CONTRACT substituted in by the bootstrap
// materialiser, not a fixed list baked into this script (AI6P-2068). Both backend
// modes flow through the same loop:
//
//   managed  — the project's own CDK backend (`.github/workflows/deploy-backend.yml`)
//              publishes the AppSync URL + Cognito ids under the tenant prefix.
//   external — the backend already exists and is owned elsewhere; the operator
//              seeds these parameters and the bootstrap only ever reads them.
//
// FAIL_CLOSED is the difference that matters. In managed mode a not-yet-deployed
// backend is an expected state, so an unreadable parameter keeps the committed
// `src/aws-config.ts` and the build continues (local dev, first deploy). In
// external mode that committed file is a `localhost.invalid` placeholder that is
// NEVER correct in a deployed environment, so falling back would ship a green
// artifact that cannot reach its backend — the build fails instead.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REGION = 'ap-southeast-2';
const PREFIX = '/productsweet-external-smoke/webapp';
const SSM_PARAMS = {
  graphqlEndpoint: `${PREFIX}/appsync-url`,
  userPoolId: `${PREFIX}/user-pool-id`,
  userPoolClientId: `${PREFIX}/user-pool-client-id`,
  cognitoWebDomain: `${PREFIX}/cognito-web-domain`,
};
const FAIL_CLOSED = true;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'src', 'aws-config.ts');

function readSsm(name) {
  return execFileSync(
    'aws',
    [
      'ssm',
      'get-parameter',
      '--name',
      name,
      '--query',
      'Parameter.Value',
      '--output',
      'text',
      '--region',
      REGION,
    ],
    { encoding: 'utf8' },
  ).trim();
}

function render(config) {
  return (
    '// GENERATED at deploy time by scripts/gen-aws-config.mjs — do not edit by hand.\n' +
    `export const awsConfig = ${JSON.stringify(config, null, 2)} as const;\n`
  );
}

try {
  const config = { region: REGION };
  for (const [field, name] of Object.entries(SSM_PARAMS)) {
    const value = readSsm(name);
    if (!value || value === 'None') {
      throw new Error(`SSM parameter ${name} resolved to an empty value`);
    }
    config[field] = value;
  }
  writeFileSync(outPath, render(config), 'utf8');
  console.log(
    `gen-aws-config: wrote src/aws-config.ts from ${
      Object.keys(SSM_PARAMS).length
    } SSM parameter(s) under ${PREFIX}.`,
  );
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (FAIL_CLOSED) {
    throw new Error(
      `gen-aws-config: could not read the declared runtime-config contract under ${PREFIX} (${message}). ` +
        'This project uses an EXTERNAL backend, so the committed src/aws-config.ts is a local-dev ' +
        'placeholder that would ship a build unable to reach its backend. Seed every declared SSM ' +
        'parameter in this environment (and grant the deploy role ssm:GetParameter on them) and re-run.',
    );
  }
  if (existsSync(outPath)) {
    console.warn(
      `gen-aws-config: could not read SSM outputs (${message}); keeping the committed src/aws-config.ts for this build.`,
    );
  } else {
    throw err;
  }
}
