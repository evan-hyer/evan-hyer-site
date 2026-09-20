# Feature Specification: Profile and demonstration insights

Feature ID: 002-profile-insights. Authored: 2026-09-20. Status: Implemented and verified.

Retrospective baseline; no historical Spec Kit execution or feature branch is asserted.

Intent: Present Evan's introduction and public professional link alongside clearly labeled example writing.

## User scenarios and acceptance

### US1: Read the introduction (P1)

Priority reflects the value of this independently testable journey. Verification: [tests/bff.test.ts](../../tests/bff.test.ts).

1. Given the profile, when loaded, then Evan's name and supplied LinkedIn link appear.
2. Given unavailable profile data, when loading fails, then a visitor-safe retry state appears.

### US2: Browse example writing (P2)

Priority reflects the value of this independently testable journey. Verification: [tests/browser/site.spec.ts](../../tests/browser/site.spec.ts).

1. Given the insights list, when Engineering is selected, then only exact-topic matches remain.
2. Given an article detail, when refreshed, then complete paragraphs and the demonstration label remain available.

## Requirements

- FR-001: Profile MUST omit unverified employer, role, or career accomplishments.
- FR-002: Insights MUST be visibly labeled demonstration content in lists and details.
- FR-003: Topic filtering MUST use exact matching and return 200 with an empty array for no matches.
- FR-004: Invalid query/slug requests MUST return 400 and absent details MUST return 404.
- FR-005: Frontends MUST call only their own BFF and validate responses.

## Edge cases

Repeated/oversized topic values are invalid. Fractional or nonpositive reading times fail the article contract. Profile rejects unsupported queries. Insight dates are fixture metadata, not historical publication claims.

## Measurable outcomes

- SC-001: Both slices work standalone and within the shell.
- SC-002: Every insight has demo=true and a positive integer reading time.
- SC-003: Filtering, article navigation, and direct refresh pass both browser modes.

## Boundaries

Follow the [constitution](../../.specify/memory/constitution.md), [shared contracts](../contracts.md), and [data model](../data-model.md). Authentication, CMS editing, contact submission, and application persistence remain excluded. Account-dependent outcomes require live evidence.
