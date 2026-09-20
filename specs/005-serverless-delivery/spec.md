# Feature Specification: CloudFront and serverless AWS delivery

Feature ID: 005-serverless-delivery. Authored: 2026-09-20. Status: Implemented and synthesized; live AWS deployment pending.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Prepare public HTTPS hosting through private storage and low-idle-cost services managed by CDK.

## User scenarios and acceptance

### US1: Visit the deployed portfolio (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/infra/release.test.ts](../../tests/infra/release.test.ts).

1. Given deployed infrastructure, when its CloudFront URL is opened, then the shell is publicly accessible while S3 remains private.
2. Given a detail refresh, when the CDN routes it, then index.html loads; missing JavaScript remains an error.

### US2: Promote verified artifacts (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/infra/publish.test.ts](../../tests/infra/publish.test.ts).

1. Given a missing build dependency, when publishing is attempted, then no AWS upload occurs.
2. Given an upload failure, when publication stops, then later applications are not promoted.

### US3: Control operational footprint (P2)

Priority reflects the value of this independently testable journey. Verification: [tests/infra/stacks.test.ts](../../tests/infra/stacks.test.ts).

1. Given a synthesized stack, when inspected, then no VPC, NAT, database, or provisioned capacity exists.
2. Given a budget email, when configured, then spend notification thresholds are included; actual notification delivery remains a live check.

## Requirements

- FR-001: Four frontends MUST use private encrypted S3 behind CloudFront OAC.
- FR-002: Three slice BFFs MUST use Node 24 ARM64 Lambda behind HTTP APIs with owning-origin CORS.
- FR-003: Production MUST use OIDC bound to the repository production environment and verified frontend artifacts.
- FR-004: Publishing MUST validate outputs, upload immutable assets before mutable entry metadata, and publish shell last.
- FR-005: Lambda MUST use 256 MB and ten-second timeouts; API rate/burst MUST be two/five; logs MUST expire in seven days.
- FR-006: Deployment MUST stay disabled until AWS bootstrap/configuration; the workflow MUST require a budget email.
- FR-007: Live smoke checks MUST verify routes, manifests, configuration, and API contracts.

## Edge cases

Default CloudFront certificates use AWS's fixed security policy. No custom domain is included. Budgets/throttles are not hard spending caps. Retained buckets/assets cost storage. Multi-app publication is not atomic. Existing GitHub OIDC providers must be imported.

## Measurable outcomes

- SC-001: Offline templates and resource assertions pass without Docker or AWS credentials.
- SC-002: Release tests prove preflight validation and upload-failure short circuiting.
- SC-003: Pending: a real deployment produces shellUrl and passes public smoke checks.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
