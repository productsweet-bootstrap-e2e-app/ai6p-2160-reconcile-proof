---
title: "Bootstrap Follow-ups"
id: "BS280-001"
status: backlog
template_type: implementation-task
kind: epic
backlog_state: refining
created: "2026-07-26"
updated: "2026-07-26"
priority: medium
owner: "productsweet-bootstrap-e2e-app"
source: "Product Sweet bootstrap (webapp project type)"
tags:
  - "bootstrap"
  - "follow-up"
related_files:
  - ".agent/current-state.md"
  - ".agent/knowledge.md"
comments: 0
attachments: 0
---

## Summary

Parent epic for the obvious next moves after the Product Sweet bootstrap reaches `complete`. The
bootstrap landed the frontend SPA, the backend tier (AppSync + Lambda + DynamoDB + Cognito), the
deploy workflows, the `.agent/` knowledge folder, and one Note vertical slice —
none of that is yet a real product. This epic groups the follow-ups every freshly bootstrapped
webapp needs.

## Problem Or Opportunity

The bootstrap is intentionally narrow — it creates a working shell with one authenticated CRUD
path, not a finished app. Without a seeded backlog, the user lands at a dead end with the stack
wired up but no obvious next move. This epic is the on-ramp into the normal Product Sweet
refine → todo → doing → done workflow.

## Why This Matters

A bootstrapped project with an empty kanban board is unusable. The seeded children give the user
explicit next moves: verify the deploy reaches the live URL end-to-end (frontend AND backend), add
a second entity following the additive data-model contract, harden auth, set branch protection, and
(conditionally) supply real values for any placeholder secrets. Each child can be closed without
doing the work — none of the seeds are mandatory — but each one represents a known follow-up that
would otherwise be forgotten.

## Scope

In scope: refine and (where the user agrees) implement the seeded children.

Out of scope: feature-level customisation, real content authoring, design-system tuning. Those are
project-specific work the user authors fresh tasks for.

## Current State And Evidence

- The bootstrap left `current-state.md > Bootstrap Decisions` populated with the framework, entity,
  repo, domain, AWS account, owner, feature-flag id, and bootstrap id — start there.
- The first deploy reached `https://pending-first-deploy.example/` (verified during bootstrap completion).
- All seeded children carry `backlog_state: refining` so review is required before they enter
  `todo`.

## Proposed Design / Approach

Refine the children one at a time. For each:

1. Open the seed; confirm the recommendation still applies to your project.
2. If it does — flip `backlog_state` to `ready`, then promote to `todo` when you have a concrete
   implementation plan.
3. If it does not — close the seed with a note explaining why.

## Architecture Impact

No. Refining the seeded backlog does not change system boundaries. Children that involve
infrastructure or schema changes (e.g. add-an-entity, branch protection) re-evaluate this on their
own.

## Determinism Considerations

Refinement is a human / agent activity over markdown files. No ambient inputs.

## Stages

```yaml
- stage_id: S1
  title: "Verify the slice and grow the data model"
  status: designed
  summary: "Confirm the deploy actually reaches the live URL end-to-end (frontend + backend), then add a second entity following the additive single-table contract."
  child_task_ids:
    - "BS280-002"
  depends_on_stage: []

- stage_id: S2
  title: "Harden the app for real use"
  status: stub
  summary: "Harden auth, set branch protection, supply values for placeholder secrets."
  child_task_ids:
    - "BS280-003"
    - "BS280-004"
    - "BS280-005"
    - "BS280-006"
  depends_on_stage:
    - S1
```

## Verification Plan

This epic is verified by its children — when every child is `closed` or `done`, the epic can flip
to `done`.

## Questions

```yaml
- question: "Are there project-specific follow-ups the bootstrap could not have known about (custom auth flows, third-party integrations, additional entities)? If yes, author fresh tasks under this epic."
  status: open
  thread: []
```

## Documentation Update Plan

- `.agent/current-state.md`: when this epic moves to `done`, flip `phase` from `bootstrapping` to
  `live` (the bootstrap may have already done this — confirm).
- `.agent/knowledge.md`: as the project takes shape, fill in the `<!-- -->` placeholders.

## Risks / Dependencies / Open Questions

- **Risk: seeds go stale.** Close seeds that no longer apply rather than leaving them open.
- **Risk: seeds are too opinionated.** Each child is `backlog_state: refining` — close any seed the
  project does not need; the bootstrap deliberately does not move children to `todo`.

## Completion Notes

Fill this in when the epic is closed.

- Outcome:
- Verification actually run:
- Documentation updated:
- Follow-up tasks created:

## Definition of Done Gate

This epic cannot transition to `status: done` until every child is closed (`status: done` or
`backlog_state: closed`).
