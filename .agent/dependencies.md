---
title: "Project Dependencies"
generated_by: "Product Sweet bootstrap (webapp project type)"
generated_at: "2026-07-26"
framework: "react-vite"
bootstrap_id: "bs-ai6p-2160-2026-07-26T02-12-36Z"
---

# Project Dependencies

Snapshot of every build-time / runtime dependency the Product Sweet bootstrap committed to this project, plus the AWS and GitHub services it depends on. This is a webapp project — a React+Vite SPA (`react-vite/site/`) plus a CDK-deployed backend tier (`backend/`).

The AWS account and region used at bootstrap time are recorded in `.agent/current-state.md`; consult that file rather than duplicating the values here so the two never drift apart.

> Generated at bootstrap. This file is a point-in-time snapshot, not a live mirror — if you add or remove dependencies later, update the relevant `package.json` and refresh this file.

## Framework

- **Framework:** React + Vite 5 (pinned at `^5.0`)
- **Language:** TypeScript
- **Package manager:** npm
- **Toolchain shape:** flat single root package.json

## Framework-required npm packages

These are installed by every React + Vite 5 webapp the bootstrap creates (frontend SPA + the `aws-amplify` client; the backend CDK app pins `aws-cdk-lib` + the AWS SDK DynamoDB clients).

| Package | Notes |
|---|---|
| `react` | framework-required |
| `react-dom` | framework-required |
| `vite` | framework-required |
| `@vitejs/plugin-react` | framework-required |
| `typescript` | framework-required |

## User-declared npm extras

Extra packages the operator added in the bootstrap wizard. The executor filters wizard entries colliding with framework defaults before they reach `package.json`.

_None declared._

## AWS services this project uses

- **AWS Amplify** — hosting + first-party deploy pipeline.
- **AWS IAM** — plan + deploy roles assumed by the deploy workflow via OIDC.
- **AWS SSM Parameter Store** — per-project secret placeholders under `/productsweet/projects/ai6p-280-sacrificial/`.
- **AWS STS** — cross-account `AssumeRole` for the bootstrap orchestrator.

## GitHub services this project uses

- **GitHub Repositories** — the project lives in the bootstrap-created repo.
- **GitHub Actions** — `pr-gate.yml` (the always-on required check) + `deploy-low.yml` + `promote-<env>.yml` (+ `actionlint.yml`).
- **GitHub Actions Secrets** — sealed-box-encrypted runtime secrets injected into workflow runs.
- **GitHub Actions Variables** — non-sensitive runtime config (e.g. the deploy-role ARN).

## What you still need to supply

See `.agent/secrets.md` for the live list of secret placeholders. The seeded follow-up tasks under `.kanban/backlog/` carry the deep-link path for each placeholder; complete those before the project goes live.
