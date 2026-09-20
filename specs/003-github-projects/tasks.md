# Tasks: Verified public GitHub projects

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Record sources and exclusions: [docs/SOURCES.md](../../docs/SOURCES.md).
- [x] T002 [US1] Populate four public projects: [slices/projects/data/projects.ts](../../slices/projects/data/projects.ts).
- [x] T003 [US1] Enforce provenance and uniqueness: [slices/projects/contracts/index.ts](../../slices/projects/contracts/index.ts).
- [x] T004 [US2] Verify filter invariants and useful tags: [tests/unit/backend/provenance.test.ts](../../tests/unit/backend/provenance.test.ts).
- [x] T005 [US1] Assert rendered repository/README targets: [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
