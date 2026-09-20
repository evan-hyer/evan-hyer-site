# Implementation Plan: Federated shell and runtime isolation

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Implemented and verified.

## Design and technical context

Use direct Rspack enhanced federation with runtime manifest registration. Alias JSX/runtime imports to each consumer's React installation. Compile shared React UI source per consumer. Pass relative route and summary/full mode from shell; remote roots use idempotent cleanup.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [apps/shell/src/bootstrap.tsx](../../apps/shell/src/bootstrap.tsx)
- [apps/shell/src/routing.ts](../../apps/shell/src/routing.ts)
- [packages/contract/src/index.ts](../../packages/contract/src/index.ts)
- [packages/ui/src/index.tsx](../../packages/ui/src/index.tsx)
- [rspack.config.cjs](../../rspack.config.cjs)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts) maps to the corresponding acceptance story.
- [tests/browser/boundaries.spec.ts](../../tests/browser/boundaries.spec.ts) maps to the corresponding acceptance story.
- [tests/unit/frontend/standalone.test.ts](../../tests/unit/frontend/standalone.test.ts) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

Malformed config, missing assets, repeated mounts, late responses, modified clicks, unknown routes, and browser back/forward are separate acceptance cases.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
