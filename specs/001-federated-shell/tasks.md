# Tasks: Federated shell and runtime isolation

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Implement routed composition: [apps/shell/src/bootstrap.tsx](../../apps/shell/src/bootstrap.tsx).
- [x] T002 [US1] Configure runtime sharing boundaries: [rspack.config.cjs](../../rspack.config.cjs).
- [x] T003 [US2] Verify outage recovery and repeated roots: [tests/browser/boundaries.spec.ts](../../tests/browser/boundaries.spec.ts).
- [x] T004 [US3] Verify standalone history and disposal: [tests/unit/frontend/standalone.test.ts](../../tests/unit/frontend/standalone.test.ts).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
