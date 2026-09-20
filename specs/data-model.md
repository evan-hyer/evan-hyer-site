# Data model and ownership

All portfolio data is read-only, in source control, and validated on the BFF/frontend boundaries. There is no database, contact submission, or authentication store.

| Entity                | Owner               | Fields and invariants                                                                                                                           |
| --------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile               | Profile slice       | name, role, introduction, linkedin URL, about paragraphs, interests; strict object                                                              |
| Project               | Projects slice      | slug, title, category, summary, tags, year, cover color/kind, challenge, approach, outcome, demo=false, repositoryUrl, sourceUrl, sourceChecked |
| Insight               | Insights slice      | slug, title, topic, excerpt, date, positive integer readMinutes, body heading/text paragraphs, demo=true                                        |
| Runtime status        | Each mounted remote | framework, imported version, BFF origin, loading/online/unavailable                                                                             |
| Release configuration | Deployment tooling  | Four frontend origins/buckets/distributions and three API origins                                                                               |
| Branch policy         | Repository settings | main target, PR requirement, verify check, zero review approvals, force-push/deletion prevention                                                |

Project slugs and repository URLs are unique across the catalog. Repository links must use HTTPS and the evan-hyer GitHub owner; source links must belong to the same repository under a blob path. Source review dates must be valid ISO dates. The current snapshot contains Track Changes, LWC Observer Patterns, External API Request, and Svelte Web Component.

The profile's role is a portfolio label, not an employment assertion. Insight dates are fixture metadata, not historical publication evidence. Project outcomes describe documented scope/limitations, not measured business results.

UI filter state is transient. A new request replaces loading/result/error state, and cancellation prevents stale responses updating an unmounted view. Source catalog objects are not exposed for callers to mutate: response parsing returns validated copies.

Schemas: [Profile](../slices/profile/contracts/index.ts), [Project](../slices/projects/contracts/index.ts), [Insight](../slices/insights/contracts/index.ts).
