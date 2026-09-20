# Implementation Plan: CloudFront and serverless AWS delivery

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Implemented and synthesized; live AWS deployment pending.

## Design and technical context

Provision a separate identity stack and site stack using a project-scoped CloudFormation execution policy. Hash production remote entries. Generate runtime JSON from outputs, promote tested frontend artifacts, wait for invalidations, and smoke test. Document revert-based rollback and account-wide budget alerts.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [infra/site-stack.ts](../../infra/site-stack.ts)
- [infra/identity-stack.ts](../../infra/identity-stack.ts)
- [scripts/bootstrap.ps1](../../scripts/bootstrap.ps1)
- [scripts/publish.ts](../../scripts/publish.ts)
- [scripts/smoke.ts](../../scripts/smoke.ts)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [tests/infra/release.test.ts](../../tests/infra/release.test.ts) maps to the corresponding acceptance story.
- [tests/infra/publish.test.ts](../../tests/infra/publish.test.ts) maps to the corresponding acceptance story.
- [tests/infra/stacks.test.ts](../../tests/infra/stacks.test.ts) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

Default CloudFront certificates use AWS's fixed security policy. No custom domain is included. Budgets/throttles are not hard spending caps. Retained buckets/assets cost storage. Multi-app publication is not atomic. Existing GitHub OIDC providers must be imported.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
