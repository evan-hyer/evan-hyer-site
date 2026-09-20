# Tasks: Solo-maintainer branch workflow

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Configure and read back merge preferences: [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md).
- [x] T002 [US1] Add self-review PR template: [.github/pull_request_template.md](../../.github/pull_request_template.md).
- [x] T003 [US2] Save protection rules and record plan limitation: [.github/rulesets/main.json](../../.github/rulesets/main.json).
- [ ] T004 [US2] Enable a supported plan and import rules: [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md).
- [ ] T005 [US2] Verify live main enforcement: [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
