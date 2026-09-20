# Verification record

Verified locally on Windows with Node 24.12.0 and npm 11.6.2 on September 19-20, 2026.

| Check                                   | Result                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Strict TypeScript                       | Passed                                                                  |
| Production Rspack builds                | Shell, Profile, Projects, Insights passed                               |
| BFF contract and behavior tests         | 13 passed                                                               |
| Development browser coverage            | 22 Chromium cases passed across core, boundary, and accessibility runs  |
| Production static-preview browser suite | 22 passed                                                               |
| Dependency audit                        | Zero known vulnerabilities after the pinned adm-zip override            |
| Formatting                              | Prettier check passed                                                   |
| Visual inspection                       | Desktop/mobile homepages, mobile project detail, desktop insight detail |

## Business unit tests

44 business unit tests pass: 21 frontend and 23 backend, alongside 13 HTTP integration tests. New cases cover GitHub provenance, duplicate catalog records, filter intersection invariants, and standalone history/root cleanup.

Frontend tests cover route ownership and relative detail paths, invalid routes, ordinary versus modified clicks, the three-project summary limit, loading versus empty results, all slice response contracts, retry recovery, HTTP/network/schema errors, request cancellation, deterministic deadlines, and remote-owned runtime configuration.

Backend tests cover case-insensitive literal search across allowed fields, search/tag intersections, exact topic matching, editorial order, filter boundaries and invalid types, missing versus malformed detail requests, fixture immutability, demonstration labels, article reading times, and profile URL validation.

These tests exercise production rule modules without Express listeners, a DOM, or browser processes. Rendering and framework integration remain covered by Playwright. The Node test runner measures 100% lines, branches, and functions for the explicitly selected business modules. CI enforces 90% lines, 95% branches, and 95% functions. This is not whole-application coverage and does not substitute for rendering tests.

## Browser coverage

The browser tests cover:

- Concurrent React 19.3.0, React 18.3.1, and Vue 3.5.43 rendering using imported framework versions.
- Actual default and react18 federation scope contents.
- Independent standalone operation and BFF request ownership.
- Loading only the remote needed for a dedicated route.
- Search, tag/topic filtering, detail navigation, history, direct refresh, empty states, and 404 recovery.
- Blocking each of the three remotes and each BFF, then restoring requests and retrying successfully.
- Shell/standalone runtime configuration failures and recovery.
- Repeated navigation, repeated mounting into the same DOM container, idempotent unmount, and stale request cancellation without hook errors.
- Keyboard skip navigation, reduced motion, responsive overflow checks, and axe accessibility checks for the homepage and all section/detail page types.

A final error-message refinement keeps network and schema diagnostics out of the portfolio UI while retaining friendly 404, unavailable, and timeout states. Relevant production failure/recovery regressions were rerun after that refinement.

Automated accessibility checks reported no violations in the tested states. Browser automation used Chromium; Firefox and WebKit were not run. Remote outages were simulated by blocking browser requests; the BFF tests also exercised deterministic server-side 503 and delay modes.

Saved previews: [desktop homepage](screenshots/home-desktop.png), [mobile homepage](screenshots/home-mobile.png).

Run instructions and ports are in the [README](../README.md). The browser suites start and stop their own seven-service environment.

## AWS and release validation

- Four HTTP API v2 tests invoke the actual Lambda handlers, including filtering, invalid/repeated queries, missing details, CORS, and unsupported methods.
- Fourteen infrastructure/release tests cover private encrypted retained S3 buckets, OAC, HTTPS redirects, cache policy, short logs, bounded Lambda configuration, API throttling/CORS, budget notifications, exact OIDC trust, scoped publication grants, existing-provider import, runtime output validation, SPA rewrites, file upload ordering, and failure short-circuiting. Publication tests use an injected fake AWS command runner; they do not publish anything.
- CDK synthesis bundles all three Node 24 ARM64 functions with local esbuild, without Docker or AWS credentials. Both CloudFormation templates synthesize successfully.
- GitHub production environment is configured with a main-only deployment branch policy. Repository variable `AWS_DEPLOY_ENABLED=false` prevents cloud deployment until account bootstrap and configuration.
- AWS resources have not been deployed. Live IAM authorization, CloudFront propagation, API Gateway integration, and post-deploy smoke checks still require a real AWS deployment. Offline assertions do not prove live cloud permissions.

Updated desktop/mobile screenshots show the real GitHub project catalog. Both development and production preview browser suites exercise those links and the content-hashed production remote entries.
