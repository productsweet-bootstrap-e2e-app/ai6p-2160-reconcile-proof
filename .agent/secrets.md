---
title: "Project Secrets"
generated_by: "Product Sweet bootstrap (webapp project type)"
generated_at: "2026-07-26"
bootstrap_id: "bs-ai6p-2160-2026-07-26T02-12-36Z"
product_prefix: "productsweet"
---

# Project Secrets

Every secret slot the Product Sweet bootstrap provisioned for this project. Values are placeholders — replace them before the consuming code path reaches production.

SSM paths follow the per-tenant scheme `/productsweet/projects/ai6p-280-sacrificial/<secretName>`.

> Generated at bootstrap. Refresh this file after secret rotations.

## Platform-default secrets

Slots Product Sweet itself uses to operate against this project. The operator does not declare them — the bootstrap seeds them automatically. They render in the wizard read-only with a `platform-required` badge.

| Name | SSM path | Purpose | Follow-up task |
|---|---|---|---|
| `repo-token` | `/productsweet/projects/ai6p-280-sacrificial/repo-token` | Platform-default repo-token placeholder (AI6P-311 F4). Rotated post-bootstrap. | `BS280-005` |
| `webhook-secret` | `/productsweet/projects/ai6p-280-sacrificial/webhook-secret` | Platform-default webhook HMAC secret placeholder (AI6P-311 F5). | `BS280-006` |

**Rotation:** the repo-token slot is filled by the tenant-credential surface; the webhook-secret slot is filled by the inbound-webhook bootstrap on first sync. Until rotated, the placeholder value (`PLACEHOLDER:` prefix) makes a not-yet-rotated state self-documenting in any log that surfaces the value.

## Backend-published configuration (not secrets)

The backend CDK deploy publishes non-secret configuration the frontend build reads, as plain SSM `String` parameters under `/productsweet/projects/ai6p-280-sacrificial/webapp/`:

- `appsync-url` — the AppSync GraphQL endpoint.
- `user-pool-id` — the Cognito user-pool id.
- `user-pool-client-id` — the Cognito user-pool web-client id.

These are written by `deploy-backend.yml` after `cdk deploy` and read by the SPA build
(`scripts/gen-aws-config.mjs`). They are configuration, not credentials — do not store secrets here.

## User-declared secrets

Secrets the operator declared in the bootstrap wizard. Each row has a seeded "Supply value for `<name>`" follow-up task under `.kanban/backlog/`; the table below links each row to its follow-up by id.

_None declared._

## Reserved names

The wizard and the secrets handler both refuse the following names because they collide with GitHub-injected or AWS-injected env vars in the workflow runner:

- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## What you still need to supply

Walk `.kanban/backlog/` and complete every seeded "Supply value for `<name>`" task. The "Bootstrap follow-ups" epic groups them; closing them moves this project from "bootstrapped" to "live".
