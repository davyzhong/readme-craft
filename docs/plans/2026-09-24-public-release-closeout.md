---
title: Public release closeout
date: 2026-09-24
status: superseded
superseded_by: 2026-09-25-midcycle-freeze-review.md
---

# Public Release Closeout Implementation Plan

> Status note (2026-09-25): This was the preceding closeout plan. The project-wide freeze review and archive plan is now authoritative; unresolved decisions and remaining work must be reconciled there before closure.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task with owner checkpoints. No subagent delegation is assumed.

**Goal:** Close the remaining privacy, documentation, and release-safety gaps so readme-craft can be declared publicly usable and then frozen for maintenance.

**Architecture:** Keep private audit evidence in ignored `.local/`; only publish reviewed, non-sensitive project documentation. Separate current-tree cleanup from any Git-history operation. Harden release automation so version/tag/channel intent is explicit before npm credentials can publish.

**Tech Stack:** Markdown, Git, Node.js 24.15, pnpm, GitHub Actions, npm.

---

## Scope and authorization gates

- This plan does not authorize public npm publication, deployment, secret rotation, repository visibility changes, history rewriting, force-push, or deletion of files/tags.
- Any Git-history cleanup is a separate destructive operation. The owner must explicitly approve its exact refs and method after reviewing the private local audit. Rewriting history cannot guarantee removal from forks, clones, caches, or downloaded archives.
- Updates to `.github/workflows/` are CI/CD changes and require explicit owner approval before implementation.
- English documentation and changes to copyright identity are optional owner decisions, not launch blockers unless the owner says otherwise.
- Do not copy sensitive findings or private values from `.local/` into this public plan.

## Current verified baseline

- `pnpm validate`, `pnpm typecheck`, `pnpm test` (142 tests), `pnpm web:test` (5 tests), and `pnpm check:generated` passed during review.
- `npm pack --dry-run` listed 13 allowlisted package files and did not include `.local/`.
- The private local audit identified residual historical/document references; exact values are deliberately excluded from this public plan.

## Task 1: Decide how to handle existing public-history exposure

**Files:** No repository file changes until the owner decides.

- [ ] Review the private local privacy audit and classify each finding as public/accepted, current-tree-only redaction, or history removal requested.
- [ ] Confirm whether the existing author identity is an intentionally public address; do not expose or paste the address into issues, plans, or logs.
- [ ] If history rewriting is requested, prepare a separate exact-scope plan covering affected refs, backup/recovery, collaborators, tags, GitHub cache/fork limitations, and push strategy; stop for explicit approval before rewriting anything.
- [ ] Record only the non-sensitive decision (accepted residuals / history remediation deferred / separate approved history plan) in the public project status.

**Gate:** Do not describe the privacy separation as complete until the owner has decided how to treat the existing public history.

## Task 2: Remove or authorize current public-document disclosures and stale guidance

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `METHODOLOGY.md`
- Modify: `skill/SKILL.md`
- Modify: `checklist.md`

- [ ] Remove the README pointer to `.local/`; replace the audit-result section with an owner-approved, reproducible public case study or omit it.
- [ ] Remove references to private repository names from public project guidance.
- [ ] Update the methodology's v3 status and the Skill's CLI delivery status to match the current alpha/tool release.
- [ ] Align T15 in Skill/checklist/templates with the frozen rule: top-of-README YAML frontmatter is optional, not mandatory; update obsolete “will be decided in v3” phrasing.
- [ ] Review historical data/metrics and examples for consent and source traceability; preserve valid historical version records with explicit historical labels.

**Verification:** `pnpm validate`; manually check that no public markdown links to `.local/` and that current-version statements agree across README, methodology, checklist, Skill, and `rules.yaml`.

## Task 3: Make npm release automation version- and channel-safe

**Files:**
- Modify (only after explicit CI/CD approval): `.github/workflows/npm-publish.yml`
- Modify if needed: `package.json`
- Modify if needed: `tests/ci.test.ts`

- [ ] Require the pushed tag to match `package.json` version before publishing.
- [ ] Route prereleases to a non-`latest` npm dist-tag; reserve `latest` for an explicitly approved stable release.
- [ ] Add an owner-controlled release approval gate and prefer short-lived trusted publishing over a long-lived token where supported by the configured npm/GitHub accounts.
- [ ] Pin workflow actions to reviewed immutable commit SHAs or document an explicit, automated update policy.
- [ ] Add tests for tag/version mismatch and prerelease channel selection; tests must not publish to npm.
- [ ] Keep `NPM_TOKEN` unset until the release workflow and package contents are reviewed and the owner explicitly authorizes npm publication.

**Verification:** unit/CI tests for the release guard; `npm pack --dry-run --json`; confirm package contents contain no `.local/` files; do not execute `npm publish` as a test.

## Task 4: Final readiness check and close decision

**Files:**
- Update: `README.md` and `CLAUDE.md` only if verified release status changes.

- [ ] Run `pnpm validate && pnpm test && pnpm typecheck && pnpm web:test && pnpm check:generated`.
- [ ] Run `pnpm run build`, `pnpm web:build`, and `npm pack --dry-run --json`; inspect generated artifacts and package allowlist.
- [ ] Confirm no unresolved private-data decision is being represented as “fully clean”; document accepted residual risk without including its sensitive values.
- [ ] Confirm user-facing install paths, alpha/stability status, Action/Web URLs, and npm instructions match what is actually available.
- [ ] Close the project as **maintenance-frozen** only when public-tree cleanup is verified, release automation is safe or explicitly disabled, remaining history exposure has an owner decision, and all checks pass.

## Out of scope for closeout

- New scoring rules, major CLI/Web features, public deployment, or npm publication without separate approval.
- English README unless the owner accepts the ongoing translation-maintenance cost.
- Git-history rewrite or force-push under this plan.
