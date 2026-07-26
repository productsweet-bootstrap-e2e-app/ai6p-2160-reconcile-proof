---
last_updated: "2026-07-26"
phase: bootstrapping
health: green
tests_passing: 0
active_objectives: ["BS280-001"]
blockers: []
---

# Current State

> Volatile snapshot of what is shipped, what is in flight, and what is broken.
> Stable architecture and decisions live in `.agent/knowledge.md`.
> Canonical architecture model lives in `.agent/c4-model.json`. Design rules come from the
> Product Sweet design system, served by the agent.
>
> This file was seeded by the Product Sweet bootstrap (webapp project type). The frontmatter
> `phase` field starts at `bootstrapping` and flips to `live` automatically when the bootstrap
> reaches the `complete` node.

## Contents
- [At a Glance](#at-a-glance)
- [Bootstrap Decisions](#bootstrap-decisions)
- [Shipped Capabilities](#shipped-capabilities)
- [Not Yet Shipped](#not-yet-shipped)
- [Current Objectives](#current-objectives)
- [Blockers](#blockers)
- [Entry Points for Agents](#entry-points-for-agents)

## At a Glance
- **Phase:** Bootstrapping — the project was just provisioned and the hello-world site is live.
- **Health:** Green — initial build passed; one Note vertical slice, no real content yet.
- **Next up:** Refine the seeded `Bootstrap Follow-ups` epic in `.kanban/backlog/`.
- **Blockers:** None.

## Bootstrap Decisions

Captured at bootstrap time and pinned here so the project starts with real context, not boilerplate:

- **Project Type:** webapp
- **Framework:** react-vite
- **Backend:** external (this project provisions no backend)
- **Entity (iteration 1):** Note
- **GitHub Repo:** https://github.com/productsweet-bootstrap-e2e-app/ai6p-2160-reconcile-proof
- **Default Branch:** `main`
- **AWS Account:** `352438994403`
- **AWS Region:** `ap-southeast-2`
- **Amplify App ID:** `pending-amplify-create`
- **Live URL:** https://pending-first-deploy.example/
- **Custom Domain:** pending-bind-custom-domain
- **Owner:** productsweet-bootstrap-e2e-app
- **Bootstrap Feature Flag:** `bs-ai6p-2160-2026-07-26T02-12-36Z`
- **Bootstrap ID:** `bs-ai6p-2160-2026-07-26T02-12-36Z`

## Shipped Capabilities

### Frontend
- React + Vite SPA on AWS Amplify app `pending-amplify-create` connected to `main`, with an SPA
  rewrite rule so deep links resolve to `index.html`.
- One authenticated CRUD path over a Note entity (sign in, create, list).
- Auto-build on `main` is disabled — the deploy workflow is the only release path.

### Backend (external)
- **No backend infrastructure is provisioned or owned by this project.** The SPA is a
  client of an already-existing AppSync + Cognito backend deployed and operated
  elsewhere. There is no `backend/` CDK app and no `deploy-backend.yml`.
- The SPA's runtime config is read from SSM at build time under
  `/productsweet-external-smoke/webapp` — see `.agent/knowledge.md` "External Backend
  Contract" for the field → parameter map.
- The frontend build **fails closed** if a declared parameter cannot be read, so a
  green deploy means the config was genuinely resolved.
- Observability, alarms, and cost budgets for the backend tier belong to whoever owns
  it. This project's own signals are the Amplify build/deploy history.

### Repository Shape
- Default branch `main`; always-on `pr-gate` required check + `.kanban` / `.agent` lane structure
  committed with this `current-state.md`, the seeded `Bootstrap Follow-ups` epic, and the
  always-seeded follow-up tasks.

## Not Yet Shipped

- Real content. The app currently ships a single Note hello-world slice.
- Custom domain — the site is on the `*.amplifyapp.com` fallback; bind a real domain via the `Bind a custom domain` task seeded in `.kanban/backlog/`.
- Branch protection on `main` (`Set up branch protection on main` task seeded in `.kanban/backlog/`).
- Verification that every declared runtime-config parameter exists in every target
  environment (`Verify the first deploy and the external backend contract` task seeded in
  `.kanban/backlog/`).
- Any feature secret — every declared secret has an SSM placeholder; supply real values first.

## Current Objectives

- Refine the seeded `Bootstrap Follow-ups` epic and promote children to `todo` once they have a
  real implementation plan.

## Blockers

None today.

## Entry Points for Agents

- This file (`.agent/current-state.md`) — what is shipped right now.
- `.agent/knowledge.md` — durable principles + key constraints + the data-model contract.
- Product Sweet design system — design rules (binding), served by the agent.
- `.agent/c4-model.json` — architecture (canonical).
- `.kanban/backlog/` — work waiting for review.
- `.kanban/intake/` — captured ideas / bugs / requests not yet refined into dev tasks.
