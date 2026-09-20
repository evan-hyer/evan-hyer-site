# Feature Specification: Verified public GitHub projects

Feature ID: 003-github-projects. Authored: 2026-09-20. Status: Implemented and verified.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Replace fictional projects with Evan's publicly verifiable GitHub work.

## User scenarios and acceptance

### US1: Explore real repositories (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts).

1. Given the homepage, when projects load, then its first three curated repositories appear.
2. Given a detail, when following source links, then repository and README belong to the corresponding evan-hyer project.

### US2: Narrow the catalog (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/unit/backend/provenance.test.ts](../../tests/unit/backend/provenance.test.ts).

1. Given search and tag filters, when both are set, then results satisfy both in editorial order.
2. Given no matches, when Clear filters is selected, then the complete catalog returns.

## Requirements

- FR-001: The catalog MUST contain reviewed public original repositories with source review dates.
- FR-002: Each project MUST link to a matching repository and source README under the evan-hyer owner.
- FR-003: Duplicate slugs/repositories, unsafe URLs, mismatched sources, and fictional labels MUST be rejected.
- FR-004: Search MUST be trimmed, case-insensitive literal matching across title, summary, and tags; tag matching MUST be exact.
- FR-005: Homepage summary MUST show at most three entries without mutating catalog data.
- FR-006: Known source limitations MUST be disclosed; measured outcomes MUST NOT be invented.

## Edge cases

Exclude dependencygraphforsf because it is a fork. Exclude sf-commit-studio because direct requests returned 404. Disclose Svelte's stylesheet TODO. Search length is at most 200 and tag length at most 80; repeated parameters are invalid.

## Measurable outcomes

- SC-001: All four projects have valid matching source links and demo=false.
- SC-002: Every offered tag has a catalog result.
- SC-003: Combined results equal the stable intersection of separate search/tag results.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
