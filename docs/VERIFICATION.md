# Verification record

Verified locally on Windows with Node 24.12.0 and npm 11.6.2 on September 19, 2026.

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

Added 39 unit tests: 20 frontend and 19 backend. All pass, alongside the 13 existing HTTP integration tests.

Frontend tests cover route ownership and relative detail paths, invalid routes, ordinary versus modified clicks, the three-project summary limit, loading versus empty results, all slice response contracts, retry recovery, HTTP/network/schema errors, request cancellation, deterministic deadlines, and remote-owned runtime configuration.

Backend tests cover case-insensitive literal search across allowed fields, search/tag intersections, exact topic matching, editorial order, filter boundaries and invalid types, missing versus malformed detail requests, fixture immutability, demonstration labels, article reading times, and profile URL validation.

These tests exercise production rule modules without Express listeners, a DOM, or browser processes. Rendering and framework integration remain covered by Playwright. No new dependencies were needed.

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
