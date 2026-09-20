# Recorded design decisions

Retrospective decisions, not a claim of contemporaneous research logs.

| Decision                                       | Rationale                                                                   | Alternative and tradeoff                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| npm workspaces and direct Rspack configuration | Keep the requested TypeScript monorepo and explicit federation setup        | A higher-level framework could reduce configuration but obscure runtime separation |
| Framework-neutral mounting                     | React 19, React 18, and Vue retain their own rendering roots                | Passing framework components would couple runtimes                                 |
| Share React UI source per consumer             | Reuse visual primitives without cross-major singleton coupling              | A single compiled shared UI runtime can bind hooks to the wrong React              |
| Reviewed GitHub snapshot                       | Deterministic content, no browser token or live API availability dependency | Live GitHub queries would need rate-limit and availability handling                |
| Express apps adapted to Lambda                 | Reuse validation and business rules locally and in HTTP API v2              | Separate cloud handlers risk behavior drift                                        |
| Four private S3/CloudFront origins             | Preserve standalone origins and simple remote asset resolution              | One path-prefixed distribution needs more asset/path routing work                  |
| HTTP APIs and ARM64 Lambda                     | Small usage-based backend without VPC/NAT/database                          | Always-on compute introduces idle cost                                             |
| Content hashes, asset-first publication        | Keep old clients' chunks available during release                           | Destructive sync can break open sessions; retained assets need eventual cleanup    |
| PRs with zero external approvals               | A sole author can ship while keeping CI and a reviewable diff               | Requiring another reviewer would block normal maintenance                          |

Sources and evidence: [content provenance](../docs/SOURCES.md), [architecture](../docs/ARCHITECTURE.md), [verification](../docs/VERIFICATION.md), [AWS operations and official references](../docs/AWS.md), [Spec Kit](https://github.com/github/spec-kit), and [GitHub rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

Known limits: no production traffic benchmark or live AWS permission test has been performed. Chromium was tested, not Firefox/WebKit. Server-side branch enforcement on this private repository is unavailable under the current GitHub plan; a saved ruleset does not enforce itself.
