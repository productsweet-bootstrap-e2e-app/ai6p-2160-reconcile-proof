# AI6P-280 Sacrificial Hello World — web app (frontend)

A React + Vite single-page app wired to this tenant's AppSync GraphQL API and
Cognito user pool, bootstrapped by Product Sweet (AI6P-1611 webapp starter).

- **Live:** https://pending-first-deploy.example/
- **Framework:** React + Vite 5
- **Hosting:** AWS Amplify (account `352438994403`)
- **Backend:** see `../../backend/` (AppSync + Lambda + DynamoDB + Cognito CDK app)
- **Managed by:** Product Sweet bootstrap

## Local development

```bash
npm ci
npm run dev            # local dev server (http://localhost:5173)
npm run build          # produce dist/ (deployable static output)
npm run preview        # serve the built output locally
npm run gen:tokens     # regenerate src/tokens.css from .agent/design-tokens.json
npm run build:preview  # produce dist-preview/ — the standalone /__preview harness (no AWS)
```

`npm run dev` uses the local-development placeholder backend config in
`src/aws-config.ts` (the API calls will fail until you point it at a real
backend) — deploy the backend first to exercise the full CRUD path.

## Design tokens & the /__preview harness

This project starts **styled and token-driven**. A single W3C Design Tokens
(DTCG) file, `.agent/design-tokens.json`, is the source of truth for colour,
typography, and spacing.

- `scripts/gen-tokens-css.mjs` projects the token file into `src/tokens.css` as
  `:root { --ps-…: … }` CSS custom properties (the Product Sweet `--ps-`
  convention). It runs automatically inside `npm run build` / `build:preview`;
  run `npm run gen:tokens` after editing the token file during local dev.
- `src/base.css` (imported by `src/main.tsx`) and the specimen kit both consume
  only those `--ps-*` variables, so **editing `.agent/design-tokens.json`
  restyles the whole app and the preview with no code change.**
- **`/__preview`** is a standalone component-isolation harness: `preview.html` →
  `src/preview/preview.tsx` renders the token-driven specimen kit
  (`src/preview/specimens.tsx`) listed in `src/preview/manifest.tsx`. Build it in
  isolation with `npm run build:preview` (output: `dist-preview/`) — it pulls in
  **no** Amplify / AppSync / Cognito wiring, so it builds with zero AWS/env
  inputs. Grow the manifest to add specimens.

## Backend wiring

The SPA needs the AppSync endpoint + Cognito pool/client ids, which only exist
**after** the backend CDK app deploys. The ordering is automated:

1. `.github/workflows/deploy-backend.yml` runs `cdk deploy` of `../../backend/`
   and publishes the stack outputs (AppSync URL, user-pool id, user-pool client
   id) to SSM under `/productsweet/projects/ai6p-280-sacrificial/webapp/`.
2. On the frontend build, `npm run build` first runs
   `scripts/gen-aws-config.mjs`, which reads those SSM parameters and rewrites
   `src/aws-config.ts` before `vite build`.

So **deploy the backend before the first frontend deploy.** If SSM is
unreachable (local dev), the build keeps the committed placeholder config so it
still succeeds.

## Deployment

Pushes to `main` trigger the frontend deploy workflow (reused from the Product
Sweet hosting template), which builds the SPA and triggers an AWS Amplify
`RELEASE` job. The Amplify app is configured with an SPA redirect rule so
client-side routes resolve to `/index.html`. Higher environments are promoted
by the `promote-<env>.yml` workflows, dispatched by the Product Sweet webapp
with the reviewed commit pinned. PRs are gated by the always-on `pr-gate.yml`.
