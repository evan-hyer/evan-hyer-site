# Feature Specification: Solo-maintainer branch workflow

Feature ID: 006-solo-workflow. Authored: 2026-09-20. Status: Merge settings configured; enforcement blocked by GitHub plan.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Keep changes reviewable and tested without requiring another person to approve the sole author's work.

## User scenarios and acceptance

### US1: Ship a focused PR (P1)

Priority reflects the value of this independently testable journey. Verification: [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md).

1. Given a PR, when verify passes and the author inspects the diff, then it can be squash merged without another reviewer.
2. Given a merged PR, when GitHub cleanup runs, then its remote feature branch is deleted.

### US2: Protect main when supported (P1)

Priority reflects the value of this independently testable journey. Verification: [.github/rulesets/main.json](../../.github/rulesets/main.json).

1. Given an active imported ruleset, when a direct or force push targets main, then applicable rules block it.
2. Given a failing or stale PR, when merge is attempted, then the required check blocks it.

## Requirements

- FR-001: Routine work MUST use a feature branch, PR, successful verify job, and self-review.
- FR-002: Merge preferences MUST allow squash only and delete merged branches.
- FR-003: A solo workflow MUST NOT require a second-person approval or code-owner review.
- FR-004: The prepared ruleset MUST require PRs, resolved conversations, up-to-date CI, and linear history and prevent force pushes/deletion.
- FR-005: Documentation MUST distinguish configured preferences from active enforcement.
- FR-006: Repository visibility MUST remain private absent a separate owner request.

## Edge cases

GitHub returned 403 for both rulesets and branch protection. Local hooks and CI cannot substitute for server-side enforcement. Never require deploy as a PR check because it is skipped. The owner retains the ability to edit rules even without a routine bypass actor.

## Measurable outcomes

- SC-001: Settings readback confirms squash-only merges, branch deletion, and update-branch availability.
- SC-002: The saved rules require zero approvals and verify from GitHub Actions.
- SC-003: Pending: a supported plan and imported ruleset produce active main enforcement.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
