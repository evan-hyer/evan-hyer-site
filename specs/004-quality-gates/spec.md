# Feature Specification: Business tests and CI verification

Feature ID: 004-quality-gates. Authored: 2026-09-20. Status: Implemented; Windows and Linux CI passed.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Catch business, integration, runtime, and infrastructure regressions before release.

## User scenarios and acceptance

### US1: Detect behavior regressions (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/unit/frontend/requests.test.ts](../../tests/unit/frontend/requests.test.ts).

1. Given invalid inputs, when tests run, then expected statuses, safe errors, and immutable responses are asserted.
2. Given canceled work, when an old response completes, then obsolete UI state is not resurrected.

### US2: Verify actual boundaries (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/lambda.test.ts](../../tests/lambda.test.ts).

1. Given a production build, when preview tests run, then independent frameworks, routes, and recovery work.
2. Given an HTTP API v2 event, when the actual Lambda adapter handles it, then the owning response contract is preserved.

## Requirements

- FR-001: Unit tests MUST cover filtering, length/type boundaries, missing records, contract validation, and fixture immutability.
- FR-002: Frontend tests MUST distinguish loading/empty/error and cover retry, deadlines, cancellation, and navigation.
- FR-003: Browser tests MUST cover runtime separation, standalone operation, history, refresh, accessibility, and outages.
- FR-004: CDK and release tests MUST validate security, costs, ordering, and failure handling without AWS writes.
- FR-005: CI MUST check formatting, types, tests, coverage, builds, synthesis, and both browser modes before deployment.
- FR-006: Coverage claims MUST identify their module scope and MUST NOT imply whole-app correctness.

## Edge cases

Do not parse HTTP error bodies as success payloads or expose transport/schema diagnostics. Skipped deployment is expected on PRs. Successful synthesis does not prove live cloud permissions. Chromium coverage does not establish Firefox/WebKit behavior.

## Measurable outcomes

- SC-001: Baseline: 75 non-browser tests pass.
- SC-002: Baseline: 22 Chromium cases pass in each server mode.
- SC-003: The declared business gate enforces 90% lines and 95% branches/functions.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
