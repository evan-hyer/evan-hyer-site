# Implementation Plan: Business tests and CI verification

Input: [spec.md](spec.md). Recorded: 2026-09-20. Status: Implemented; Windows and Linux CI passed.

## Design and technical context

Use Node tests through tsx, Supertest HTTP adapters, real Lambda event invocation, and CDK assertions. Use Playwright and axe against development and static preview servers. Keep the verify job unconditional and credentials-free; deploy depends on successful verification.

The baseline is a TypeScript npm-workspace monorepo on Node 24. Exact framework, tooling, and infrastructure versions are in package-lock.json. Source ownership:

- [package.json](../../package.json)
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
- [tests/unit/backend/catalogs.test.ts](../../tests/unit/backend/catalogs.test.ts)
- [tests/unit/frontend/requests.test.ts](../../tests/unit/frontend/requests.test.ts)
- [tests/lambda.test.ts](../../tests/lambda.test.ts)
- [tests/infra/stacks.test.ts](../../tests/infra/stacks.test.ts)

## Constitution check

This design preserves slice ownership, neutral framework boundaries, supportable content, and explicit verification. Failure states remain observable; cloud prerequisites are not marked complete by offline tests. The solo PR convention is usable without another reviewer, while the unavailable enforcement is disclosed.

## Validation and evidence

- [tests/unit/frontend/requests.test.ts](../../tests/unit/frontend/requests.test.ts) maps to the corresponding acceptance story.
- [tests/lambda.test.ts](../../tests/lambda.test.ts) maps to the corresponding acceptance story.

Run applicable commands from the [quickstart](../quickstart.md). The [verification record](../../docs/VERIFICATION.md) describes established results. [Shared contracts](../contracts.md) are subordinate to the executable slice schemas.

## Tradeoffs and limitations

Do not parse HTTP error bodies as success payloads or expose transport/schema diagnostics. Skipped deployment is expected on PRs. Successful synthesis does not prove live cloud permissions. Chromium coverage does not establish Firefox/WebKit behavior.

See the [decision record](../research.md) for cross-feature alternatives. No additional infrastructure or live validation is implied by this retrospective plan.
