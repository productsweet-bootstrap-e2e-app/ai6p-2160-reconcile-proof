---
title: "Replace The Starter Scaffold With The Migrated Surface"
id: "BS280-003"
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
  - "frontend"
  - "legacy-migration"
related_files:
  - "src/App.tsx"
  - "src/graphql.ts"
  - "src/main.tsx"
  - ".agent/knowledge.md"
comments: 0
attachments: 0
---

## Summary

Replace the seeded Note vertical-slice scaffold with the real routes,
screens, and GraphQL operations of the app being migrated onto this project.

## Problem Or Opportunity

This project was bootstrapped in **external backend mode** — the backend already exists,
so the SPA is a client of a schema this repo did not define. The seeded scaffold
(`src/App.tsx`, `src/graphql.ts`) is a *starting shape*: it demonstrates sign-in and one
authenticated read/write, but its operations name a `Note` type the
existing backend almost certainly does not have.

That means the scaffold **compiles and deploys but does not work** against the real
backend. It is scaffolding to be replaced, not a feature to be extended.

## Why This Matters

Leaving the scaffold in place is the failure mode that makes a migration look finished
while nothing works: sign-in succeeds (the pool is real), then every query fails against
a type that does not exist. Replacing the operations first — before any UI polish —
makes the app either genuinely working or loudly broken, with nothing in between.

## Scope

- Replace `src/graphql.ts` operations with the real operations from the existing
  backend's schema.
- Replace `src/App.tsx` with the migrated route/screen surface.
- Keep `src/main.tsx`'s Amplify configuration reading from `src/aws-config.ts` — never
  hardcode an endpoint or pool id.
- Wire any additional declared config fields (beyond the required three) that the
  migrated app needs.

## Out Of Scope

- Changing the external backend's schema. If the migrated app needs a field the API
  does not expose, that is a request to the backend's owner.
- Re-introducing a `backend/` CDK app in this repo. This project does not own a backend.

## Current State And Evidence

- Seeded scaffold: `src/App.tsx` + `src/graphql.ts` — one create + one list over
  Note.
- Runtime config contract: `.agent/knowledge.md > External Backend Contract`.
- Amplify wiring: `src/main.tsx`, reading `awsConfig` from `src/aws-config.ts`
  (regenerated from SSM at build time).

## Proposed Design / Approach

Work backwards from the existing backend's schema: enumerate the operations the migrated
app needs, write those first, and only then bring the screens across. Migrate route by
route so each step is deployable.

## Architecture Impact

Likely none — the container model (one SPA, an external API, an external pool) does not
change when the SPA's own screens do. Update `.agent/c4-model.json` if the migration adds
a genuinely new integration (a second API, a file store, an analytics service).

## Determinism Considerations

Frontend-only. If any migrated screen depends on the current time or on random ids,
inject them so the behaviour is testable.

## Implementation Plan

1. Enumerate the existing backend's operations the migrated app needs.
2. Replace `src/graphql.ts` with those operations.
3. Migrate routes one at a time, deploying after each.
4. Delete the Note scaffold once nothing references it.
5. Confirm no endpoint or pool id is hardcoded anywhere (`grep` for the values).

## Verification Plan

- Every migrated route renders and its data round-trips against the real backend.
- No Note references remain.
- No literal endpoint / user-pool id appears outside the generated `src/aws-config.ts`.

## Questions

```yaml
- question: "Which routes and behaviours are in scope for the first deployable slice, and what is the acceptance evidence for each?"
  status: open
  thread: []
```

## Documentation Update Plan

- `.agent/current-state.md`: record which routes are migrated as they land.
- `.agent/c4-model.json`: only if a new integration appears.

## Risks / Dependencies / Open Questions

- **Dependency: the existing backend's schema.** Read it, do not guess it.
- **Risk: a partially-migrated app that looks complete.** Track the route list
  explicitly so "done" is countable.

## Completion Notes

Fill this in when the task is done.

- Outcome:
- Verification actually run:
- Documentation updated:
- Follow-up tasks created:

## Definition of Done Gate

1. The seeded Note scaffold is gone.
2. Every in-scope route round-trips against the external backend in a deployed environment.
