# Tasks: Business tests and CI verification

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Cover business and transport rules: [tests/unit/frontend/requests.test.ts](../../tests/unit/frontend/requests.test.ts).
- [x] T002 [US1] Enforce scoped coverage thresholds: [package.json](../../package.json).
- [x] T003 [US2] Exercise Lambda HTTP API adapters: [tests/lambda.test.ts](../../tests/lambda.test.ts).
- [x] T004 [US2] Assert infrastructure configuration: [tests/infra/stacks.test.ts](../../tests/infra/stacks.test.ts).
- [x] T005 [US2] Run verification before deployment: [.github/workflows/ci.yml](../../.github/workflows/ci.yml).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
