# Tasks: Profile and demonstration insights

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Record supportable introduction and professional link: [slices/profile/data/profile.ts](../../slices/profile/data/profile.ts).
- [x] T002 [US2] Implement topic/detail services: [slices/insights/bff/service.ts](../../slices/insights/bff/service.ts).
- [x] T003 [US2] Render demonstrative writing: [slices/insights/src/mount.ts](../../slices/insights/src/mount.ts).
- [x] T004 [US2] Verify validation and fixture immutability: [tests/unit/backend/catalogs.test.ts](../../tests/unit/backend/catalogs.test.ts).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
