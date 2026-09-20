# Implementation Plan: Solo-maintainer branch workflow

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Merge settings configured; enforcement blocked by GitHub plan.

## Design and technical context

Configure supported repository preferences now. Save an importable active ruleset with exact main target, no bypass actors, and observed GitHub Actions integration 15368. Preserve privacy and disclose the plan prerequisite. Add a concise PR self-review template.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [.github/rulesets/main.json](../../.github/rulesets/main.json)
- [.github/pull_request_template.md](../../.github/pull_request_template.md)
- [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md)
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) maps to the corresponding acceptance story.
- [.github/rulesets/main.json](../../.github/rulesets/main.json) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

GitHub returned 403 for both rulesets and branch protection. Local hooks and CI cannot substitute for server-side enforcement. Never require deploy as a PR check because it is skipped. The owner retains the ability to edit rules even without a routine bypass actor.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
