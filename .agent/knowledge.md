---
last_updated: "2026-07-26"
---

# Project Knowledge

> Durable principles, conventions, and reference material for this project.
> Volatile state lives in `.agent/current-state.md`.
> Per-task decision history lives in `.kanban/done/{task-id}.md`.
> The C4 model lives in `.agent/c4-model.json`. Design rules come from the Product Sweet
> design system, served by the agent (not stored in this repo).
>
> This file was seeded by the Product Sweet bootstrap (webapp project type).
> Every section below is structural — fill in the project-specific narrative as the project takes shape.

## Contents
- [Project Identity](#project-identity)
- [Goals](#goals)
- [Key Constraints](#key-constraints)
- [Architecture](#architecture)
- [External Backend Contract](#external-backend-contract)
- [Testing Philosophy](#testing-philosophy)
- [C4 Architecture Model](#c4-architecture-model)
- [Toolchain](#toolchain)

## Project Identity

**Name:** AI6P-280 Sacrificial Hello World
**Purpose:** <!-- One or two sentences describing what this web app is for and who it serves. -->

## Goals

<!-- Numbered list of the project's primary goals. Three to five is enough. -->

1. <!-- Goal one -->
2. <!-- Goal two -->
3. <!-- Goal three -->

## Key Constraints

<!-- The non-negotiables: language, hosting, accessibility floor, performance floor, etc.
     The defaults below were captured during bootstrap; edit them as the project evolves. -->

- **Language:** TypeScript across frontend and backend.
- **Hosting:** AWS Amplify Hosting (frontend only) in account
  `352438994403` (region `ap-southeast-2`). The backend is deployed and operated
  outside this project.
- **Repository:** https://github.com/productsweet-bootstrap-e2e-app/ai6p-2160-reconcile-proof
- **Custom domain:** pending-bind-custom-domain
- **Owner:** productsweet-bootstrap-e2e-app
- **Auth:** an EXISTING Cognito user pool owned outside this project. Its sign-up policy,
  app client, and claims are that owner’s contract — this repo consumes them.
- **Accessibility floor:** WCAG 2.2 AA — every shipped surface must pass the contrast,
  focus-visibility, touch-target, and label rules of the Product Sweet design system.
- **Secrets:** AWS SSM Parameter Store (`SecureString`), never in code or environment variables.

## Architecture

### Frontend

The frontend is a **React 19 + Vite 6** single-page application (SPA). All
rendering happens client-side: the build emits an `index.html` + JS bundle +
assets, and every route is served from the same `index.html`. The SPA talks to
the backend through the **`aws-amplify`** client — `generateClient()` for the
AppSync GraphQL API (user-pool auth mode) and `aws-amplify/auth` for Cognito
sign-up / sign-in.

The build pipeline runs `npm run build`, which first regenerates
`src/aws-config.ts` from this project's declared runtime-config contract (read
from SSM by `scripts/gen-aws-config.mjs`) and then runs `vite build` to produce a
`dist/` tree of static files. The GitHub Actions deploy workflow uploads that to
AWS Amplify Hosting on every push to `main`. **Important:** configure the Amplify
rewrite rule so deep links fall through to `index.html`. The declared SSM parameters must already exist in the
target environment before the first deploy — the build fails closed rather than
falling back to the committed placeholder.


### Backend (external — not owned by this project)

This project's backend **already exists and is owned elsewhere**. There is no
`backend/` CDK app, no `deploy-backend.yml`, and no infrastructure in this repo to
deploy. The SPA is a *client* of an existing AppSync + Cognito backend.

- **Nothing here provisions backend resources.** Do not add a `backend/` CDK app to
  this repo — the backend's owner deploys it. If this project ever needs its own
  backend tier, that is a re-platform decision, not an incremental change.
- **The only coupling is the runtime-config contract below.** The SPA reads its
  endpoint + Cognito ids from SSM parameters that the backend's owner (or an
  operator) seeds per environment. This project never writes them.
- **Auth is the external pool's.** Sign-in, the user-pool client, and whatever claim
  the external resolvers authorize on are the external backend's contract — not
  something this repo can change.

### CI/CD

- **GitHub Actions workflows** (committed by the bootstrap):
  - `pr-gate.yml` — the **single required status check** on `main`. Always-on (no `paths:`
    filter), classifies the diff into a content lane or a full build lane in-job, and runs the
    `.kanban` duplicate-task-ID + frontmatter guards on every PR.
  - The frontend deploy + promote workflows (reused from the Product Sweet hosting template) build
    the SPA and deploy it to AWS Amplify Hosting. There is deliberately **no backend deploy
    workflow** — see above.
- **Ordering:** none to manage. The SPA build reads the external backend's SSM
  parameters (`scripts/gen-aws-config.mjs`); they must already exist in the target
  environment before the first deploy.
- **The frontend build FAILS CLOSED on an unreadable parameter.** Because the
  committed `src/aws-config.ts` is a `localhost.invalid` local-dev placeholder that
  is never correct in a deployed environment, `gen-aws-config.mjs` fails the build
  rather than falling back to it. A green build therefore means the config was
  really read — not that it was quietly skipped.
- **OIDC trust:** federated into AWS via `token.actions.githubusercontent.com`, scoped to the
  repository owner and the bootstrap-created deploy role.

## External Backend Contract

The SPA's runtime configuration is a **declared key map**, captured at bootstrap
time and rendered into `scripts/gen-aws-config.mjs`. Each config field the SPA
reads maps to one SSM parameter under a single prefix:

| Config field | SSM parameter |
|---|---|
| `graphqlEndpoint` | `/productsweet-external-smoke/webapp/appsync-url` |
| `userPoolId` | `/productsweet-external-smoke/webapp/user-pool-id` |
| `userPoolClientId` | `/productsweet-external-smoke/webapp/user-pool-client-id` |
| `cognitoWebDomain` | `/productsweet-external-smoke/webapp/cognito-web-domain` |

`region` is not in the map — it is stamped from this project's AWS region
(`ap-southeast-2`).

Rules that bind future work:

1. **The parameters are read, never written, by this repo.** Seeding them per
   environment is the backend owner's / operator's job. The deploy role needs
   `ssm:GetParameter` on every path above in every environment it deploys to.
2. **Values differ per environment because the credentials differ, not the path.**
   The path is identical in every environment; the deploy workflow's assumed role
   decides which account's parameter store it reads. Do not encode an environment
   name into these paths.
3. **`graphqlEndpoint`, `userPoolId`, and `userPoolClientId` are required.** The
   `aws-amplify` client cannot be configured without them, so they are the required
   core of the contract; anything else in the map is an addition this app may use.
4. **Changing the map is a bootstrap-time decision.** There is no retrofit path —
   edit `scripts/gen-aws-config.mjs` and `src/aws-config.ts` together, and keep them
   in agreement or the build will read a parameter the SPA never uses.

## Testing Philosophy

- Every piece of functionality has corresponding tests.
- Tests serve as regression protection — no change should break existing tests without explicit
  justification.
- Build / lint / test gates run in CI on every PR; the same gates run again pre-deploy on `main`.
- Accessibility regressions (contrast, focus visibility, touch-target) are blocking.

## C4 Architecture Model

The project maintains a structured C4 architecture model at `.agent/c4-model.json` — the canonical
source of truth for the project overview, read by the Product Sweet web UI.

### Schema rules
- `schemaVersion` must be `1`.
- `system` is the single root node (System Context level).
- `externalSystems` lists systems outside the project boundary.
- `containers` are the deployable units within the system boundary.
- `components` are grouped under a `containerId` to enable drill-down.
- Every node requires `id`, `name`, and `summary`. `technology`, `responsibilities`, `relatedFiles`,
  and `relationships` are optional.
- Each relationship has `targetId`, `label`, and `direction`
  (`outgoing` | `incoming` | `bidirectional`).

### Maintenance policy
- Any task that changes system boundaries, container responsibilities, integrations, storage, auth
  flow, deployment topology, or major component ownership **must** update `.agent/c4-model.json`.

## Toolchain

<!-- Replace these defaults with the actual toolchain once the project is set up. -->

- **Structure:** flat single root package.json
- **Package manager:** npm
- **TypeScript:** tsconfig.json with `strict: true`
- **Testing:** framework-recommended test runner; cover any custom logic with unit tests
- **Linting:** framework-recommended ESLint config; treat warnings as errors
