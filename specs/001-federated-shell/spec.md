# Feature Specification: Federated shell and runtime isolation

Feature ID: 001-federated-shell. Authored: 2026-09-20. Status: Implemented and verified.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Compose three independently runnable slices into one responsive portfolio.

## User scenarios and acceptance

### US1: Browse the composite site (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts).

1. Given the homepage and healthy services, when opened, then Profile, Projects, and Insights render together.
2. Given a detail URL, when refreshed, then its owning slice renders the same detail.

### US2: Recover independently (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/browser/boundaries.spec.ts](../../tests/browser/boundaries.spec.ts).

1. Given a blocked remote, when loading the homepage, then healthy sections remain usable and retry is available.
2. Given recovery, when retry is selected, then the remote mounts without duplicate roots.

### US3: Work standalone (P2)

Priority reflects the value of this independently testable journey. Verification: [tests/unit/frontend/standalone.test.ts](../../tests/unit/frontend/standalone.test.ts).

1. Given a standalone slice, when navigating internally, then its own history and BFF handle the view.
2. Given a cross-slice link, when clicked, then the configured shell receives navigation.

## Requirements

- FR-001: The shell MUST own /, /profile, /projects, /projects/:slug, /insights, and /insights/:slug.
- FR-002: Remotes MUST expose neutral mount/unmount and actual imported runtime metadata; framework elements and contexts MUST NOT cross this boundary.
- FR-003: Shell/Profile React 19 MUST share a compatible default scope; Projects React 18 MUST use react18; Vue MUST own its root.
- FR-004: Dedicated routes MUST load only their needed remote. Failure and retry MUST be per slice.
- FR-005: Navigation MUST abort obsolete requests and dispose roots; repeated unmount MUST be safe.
- FR-006: Visual primitives MUST support keyboard focus, reduced motion, and responsive layouts.

## Edge cases

Malformed config, missing assets, repeated mounts, late responses, modified clicks, unknown routes, and browser back/forward are separate acceptance cases.

## Measurable outcomes

- SC-001: All three imported framework versions render without hook errors.
- SC-002: Blocking any remote leaves other sections usable.
- SC-003: Representative desktop/mobile states have no horizontal overflow or axe violations.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
