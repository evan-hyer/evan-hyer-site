# Implementation Plan: Verified public GitHub projects

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Implemented and verified.

## Design and technical context

Keep a reviewed deterministic snapshot, avoiding a browser GitHub token and live API dependency. Zod validates provenance and uniqueness. The pure BFF service returns validated copies. React 18 renders summary/list/detail and normal external source anchors.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [slices/projects/data/projects.ts](../../slices/projects/data/projects.ts)
- [slices/projects/contracts/index.ts](../../slices/projects/contracts/index.ts)
- [slices/projects/bff/service.ts](../../slices/projects/bff/service.ts)
- [slices/projects/src/mount.tsx](../../slices/projects/src/mount.tsx)
- [slices/projects/src/presentation.ts](../../slices/projects/src/presentation.ts)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts) maps to the corresponding acceptance story.
- [tests/unit/backend/provenance.test.ts](../../tests/unit/backend/provenance.test.ts) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

Exclude dependencygraphforsf because it is a fork. Exclude sf-commit-studio because direct requests returned 404. Disclose Svelte's stylesheet TODO. Search length is at most 200 and tag length at most 80; repeated parameters are invalid.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
