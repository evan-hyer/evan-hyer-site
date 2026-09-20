# Source and content notes

Resolved and checked during implementation on September 18–19, 2026.

- **Name and professional link:** Evan Hyer and https://www.linkedin.com/in/evan-hyer were supplied by the user’s approved plan. LinkedIn was not retrievable during implementation. No employer, job title, dates of employment, education, location, accomplishments, or availability claims were inferred.
- **Introductory copy:** Original placeholder copy about the portfolio’s purpose. “A personal portfolio” is a presentation label, not a verified employment role.
- **Projects:** Curated snapshots of four public original repositories owned by evan-hyer, verified through the GitHub API and source files on September 19, 2026. No client affiliations, adoption figures, or measured outcomes are claimed.
- **Insights:** Original demonstration articles created for this implementation. Displayed dates and reading times are fixture metadata, not a claim of prior publication.
- **Illustrations:** CSS geometry created for this site; no external photos, logos, fonts, or stock assets.

Technical references:

- [React versions](https://react.dev/versions)
- [Module Federation shared configuration](https://module-federation.io/configure/shared.html)
- [Tailwind PostCSS installation](https://tailwindcss.com/docs/installation/using-postcss)
- Installed Rspack, Module Federation, Playwright, and TypeScript package manifests/types were used to verify current CLI exports and configuration behavior.

The npm registry resolved React 19.3.0, Vue 3.5.43, Rspack 2.2.6, Module Federation enhanced 2.9.0, and Tailwind 4.3.3. Projects intentionally uses React 18.3.1. Exact installed dependency versions are recorded in the lockfile.

The supplied plan referenced Rspack and Module Federation documentation URLs that were not retrievable at their old paths. The implementation uses the installed enhanced Rspack plugin and was verified with actual builds and browser tests.

## Public GitHub project selection

- [Track Changes README](https://github.com/evan-hyer/track-changes/blob/main/README.md): Salesforce CLI metadata filtering, selection, retrieval, commit workflows, and table/JSON/HTML output.
- [LWC Observer Patterns README](https://github.com/evan-hyer/LWC_ObserverPattern/blob/main/README.md): Lightning Message Service, parent-child communication, custom observer service, and logging examples. Its test claims are attributed to its README, not independently verified here.
- [External API Request README](https://github.com/evan-hyer/ExternalAPIRequest/blob/main/README.md): Apex HTTP request builder and example callout.
- [Svelte Web Component README](https://github.com/evan-hyer/SvelteWebComponent/blob/main/svelte-vite-webcomponent/README.md), custom-element source, and Vite config: shadow-root mounting and IIFE library output. The README documents unfinished stylesheet handling.

The public listing also returned `dependencygraphforsf`, which is a fork and was excluded from the original-work showcase. `sf-commit-studio` appeared in the listing, but direct repository and README requests returned 404, so it was excluded rather than publishing a broken or potentially private link. No private repositories or credentials were included in the site.

The catalog is a reviewed, deterministic snapshot, not a live GitHub API feed. Edit `slices/projects/data/projects.ts` when repository content changes, reverify public visibility and source links, update `sourceChecked`, and run the full checks. Contract tests reject duplicate repositories, unsafe or foreign-owner links, mismatched source URLs, and accidental fictional labels. Tags must match the shared filter vocabulary.
