---
title: "Verify The First Deploy And The External Backend Contract"
id: "BS280-002"
status: backlog
template_type: implementation-task
parent_task_id: "BS280-001"
backlog_state: refining
created: "2026-07-26"
updated: "2026-07-26"
priority: high
owner: "productsweet-bootstrap-e2e-app"
source: "Product Sweet bootstrap (webapp seed catalog — external backend mode)"
tags:
  - "bootstrap"
  - "backend"
  - "configuration"
related_files:
  - "scripts/gen-aws-config.mjs"
  - "src/aws-config.ts"
  - ".agent/knowledge.md"
comments: 0
attachments: 0
---

## Summary

Close the loop on the first real deploy: confirm the frontend workflow ran green, that
every SSM parameter in this project's declared runtime-config contract exists and is
readable **in each environment** this app will be deployed to, and that the deployed SPA
genuinely authenticates against the external backend.

## Problem Or Opportunity

The bootstrap reported "first deploy verified", but this project provisions no backend —
its entire coupling to one is a declared key map read from SSM at build time:

| Config field | SSM parameter |
|---|---|
| `graphqlEndpoint` | `/productsweet-external-smoke/webapp/appsync-url` |
| `userPoolId` | `/productsweet-external-smoke/webapp/user-pool-id` |
| `userPoolClientId` | `/productsweet-external-smoke/webapp/user-pool-client-id` |
| `cognitoWebDomain` | `/productsweet-external-smoke/webapp/cognito-web-domain` |

The bootstrap only ever **reads** those parameters; seeding them is the backend owner's /
an operator's job, and nothing in this repo can verify it happened. Until that is checked
per environment, "the app builds" says nothing about whether it works.

## Why This Matters

The frontend build **fails closed** when a declared parameter cannot be read, which turns
a silent breakage into a loud one — but only at deploy time, per environment. A parameter
that exists in the low environment and is missing in a higher one passes every check here
and fails the first promotion.

A subtler failure survives the fail-closed guard: a parameter that exists and holds the
**wrong** value (a stale endpoint, another environment's user pool). The build is green
and the app cannot sign in. Only an authenticated round-trip in the deployed app catches
that, which is why the browser step below is not optional.

## Scope

- Confirm the frontend deploy workflow ran green and Amplify reports a successful job.
- Confirm every declared parameter exists in every target environment's account.
- Confirm the principal that RUNS THE BUILD has `ssm:GetParameter` on those paths in each
  environment. Which principal that is depends on the hosting shape: the GitHub Actions
  **deploy role** when the workflow builds and Amplify only deploys, or the **Amplify
  service role** when Amplify builds the repo directly. Getting the wrong one looks
  identical to a missing parameter.
- Sign in at `https://pending-first-deploy.example/` and perform one authenticated read and one write.

## Out Of Scope

- Creating or changing the parameters — coordinate with whoever owns the backend.
- Changing the key map. That was a bootstrap-time decision; changing it means editing
  `scripts/gen-aws-config.mjs` and `src/aws-config.ts` together.
- Replacing the seeded Note scaffold (its own seeded task covers that).

## Current State And Evidence

- Live URL: `https://pending-first-deploy.example/`
- Repo: `https://github.com/productsweet-bootstrap-e2e-app/ai6p-2160-reconcile-proof`
- Contract + rules: `.agent/knowledge.md > External Backend Contract`.
- Generator: `scripts/gen-aws-config.mjs` (reads the map; fails closed).
- Committed local-dev placeholder: `src/aws-config.ts` (`localhost.invalid` values —
  never correct in a deployed environment).

## Proposed Design / Approach

Read each parameter with the AWS CLI against each environment's account, then prove the
end-to-end path once in the low environment through the deployed app. Record which
account and role produced each result so a later mismatch is diffable.

## Architecture Impact

None — read-only verification. `.agent/c4-model.json` already models the backend as an
external system and the SSM parameters as external configuration.

## Determinism Considerations

The check is ambient (live SSM, live credentials, network, Cognito email delivery) and is
*expected* to give different answers per environment — that is the mechanism, not a flaw.
Record the account + role with each result or the result is unreproducible. Treat any
flake as suspicious and investigate before retrying.

## Implementation Plan

1. Confirm the frontend deploy workflow succeeded and Amplify shows a successful job.
2. For each environment account, `aws ssm get-parameter --name <path>` for every path in
   the table above. Note any that are missing.
3. Confirm the build principal in each environment grants `ssm:GetParameter` on the
   prefix — the deploy role, or the Amplify service role if Amplify builds the repo
   directly. A parameter that exists but is unreadable fails the build identically, and
   the failure names the parameter, not the principal.
4. Open `https://pending-first-deploy.example/`, sign in with a user from the existing pool, and perform one read
   and one write. Confirm the network calls hit the expected endpoint.
5. Record the outcome per environment in Completion Notes.

## Verification Plan

- The frontend deploy is green and `curl -sSf https://pending-first-deploy.example/` returns 200.
- Every declared parameter resolves in every target environment.
- An authenticated read and write succeed against the deployed low environment.

## Questions

```yaml
- question: "Which environments does this app actually target, and who owns seeding the SSM parameters in each?"
  status: open
  thread: []
```

## Documentation Update Plan

- `.agent/current-state.md`: record which environments are verified.
- `.agent/knowledge.md`: only if a rule changed (e.g. a new required config field).

## Risks / Dependencies / Open Questions

- **Dependency: the backend's owner.** If a parameter is missing you cannot create it
  correctly yourself — the value belongs to their deployment.
- **Risk: a right-shaped, wrong-valued parameter.** Fail-closed cannot catch this; only
  the authenticated round-trip does.

## Completion Notes

Fill this in when the task is done.

- Outcome:
- Verification actually run:
- Documentation updated:
- Follow-up tasks created:

## Definition of Done Gate

1. The frontend deploy is green and the live URL serves the SPA.
2. Every declared parameter is confirmed present + readable in every target environment.
3. An authenticated read and write succeed against the deployed low environment.
