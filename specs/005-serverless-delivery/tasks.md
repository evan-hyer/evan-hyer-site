# Tasks: CloudFront and serverless AWS delivery

Inputs: [spec](spec.md), [plan](plan.md), and [contracts](../contracts.md). Checked boxes reflect observed completion, not a claimed historical sequence. IDs are local to this feature; US labels refer to its acceptance stories.

## Implementation and verification

- [x] T001 [US1] Define private CDN origins and serverless APIs: [infra/site-stack.ts](../../infra/site-stack.ts).
- [x] T002 [US2] Define exact OIDC trust: [infra/identity-stack.ts](../../infra/identity-stack.ts).
- [x] T003 [US2] Implement tested publication ordering: [scripts/publish.ts](../../scripts/publish.ts).
- [x] T004 [US3] Document costs and rollback: [docs/AWS.md](../../docs/AWS.md).
- [ ] T005 [US2] Bootstrap a real account and configure variables: [docs/AWS.md](../../docs/AWS.md).
- [ ] T006 [US1] Deploy and smoke-test public endpoints: [scripts/smoke.ts](../../scripts/smoke.ts).

## Dependencies and evidence

Review the specification and contracts before editing source. Implement the smallest testable story, run its checks, and update evidence before merging. Refer to the [baseline verification](../../docs/VERIFICATION.md) for established results. Open tasks need new evidence: saved configuration and offline tests do not establish live AWS or GitHub enforcement.
