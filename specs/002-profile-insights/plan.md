# Implementation Plan: Profile and demonstration insights

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Implemented and verified.

## Design and technical context

Profile renders with React 19; Insights renders with Vue. Slice-owned Express adapters invoke pure services over validated fixtures. Vue reuses shared visual tokens without importing React components.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [slices/profile/data/profile.ts](../../slices/profile/data/profile.ts)
- [slices/profile/bff/service.ts](../../slices/profile/bff/service.ts)
- [slices/insights/data/insights.ts](../../slices/insights/data/insights.ts)
- [slices/insights/bff/service.ts](../../slices/insights/bff/service.ts)
- [slices/insights/src/mount.ts](../../slices/insights/src/mount.ts)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [tests/bff.test.ts](../../tests/bff.test.ts) maps to the corresponding acceptance story.
- [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

Repeated/oversized topic values are invalid. Fractional or nonpositive reading times fail the article contract. Profile rejects unsupported queries. Insight dates are fixture metadata, not historical publication claims.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
