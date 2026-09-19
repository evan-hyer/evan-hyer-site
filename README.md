# Evan Hyer’s personal website

A client-rendered portfolio composed from three independent vertical slices. Each slice owns its UI, HTTP BFF, runtime schemas, and demonstration fixtures.

## Run on Windows

Node 24 and npm are required. In PowerShell:

```powershell
cd C:\Users\Evan\evan-hyer-site
npm ci
npm run dev
```

Open **http://localhost:3000**. Press **Ctrl+C** in the terminal to stop the service group. The runner starts Node processes directly, without detached windows. If an individual service exits, the other services stay available.

| App      | Frontend              | BFF                   | Framework    |
| -------- | --------------------- | --------------------- | ------------ |
| Shell    | http://localhost:3000 | —                     | React 19.3.0 |
| Profile  | http://localhost:3001 | http://localhost:4001 | React 19.3.0 |
| Projects | http://localhost:3002 | http://localhost:4002 | React 18.3.1 |
| Insights | http://localhost:3003 | http://localhost:4003 | Vue 3.5.43   |

All listeners bind to the loopback address. No Docker, hosts-file changes, accounts, or API keys are needed.

## Commands

| Command                           | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`                     | All seven services                                                         |
| `npm run dev:shell`               | Shell frontend                                                             |
| `npm run dev:profile`             | Profile frontend and BFF                                                   |
| `npm run dev:projects`            | Projects frontend and BFF                                                  |
| `npm run dev:insights`            | Insights frontend and BFF                                                  |
| `npm run dev:projects:web`        | Only Projects frontend; also available for Profile and Insights            |
| `npm run dev:projects:bff`        | Only Projects BFF; also available for Profile and Insights                 |
| `npm run typecheck`               | Strict TypeScript check across applications, contracts, and tests          |
| `npm test`                        | All unit tests followed by HTTP integration tests                          |
| `npm run test:unit`               | Frontend and backend business unit tests; no servers or browser            |
| `npm run test:unit:frontend`      | Routing, navigation, summaries, requests, cancellation, and error handling |
| `npm run test:unit:backend`       | Catalog filtering, validation, detail lookup, and response contracts       |
| `npm run test:integration`        | Existing HTTP endpoint, CORS, health, delay, and failure tests             |
| `npm run build`                   | Four independent production frontend outputs                               |
| `npm run build -w @site/projects` | Build only Projects; other frontend workspace names work too               |
| `npm run preview`                 | Four static production previews plus the three BFFs                        |
| `npm run test:e2e`                | Playwright suite against automatically started development services        |
| `npm run test:e2e:preview`        | Same suite against production outputs; run build first                     |
| `npm run check`                   | Type check, unit/integration tests, and production build                   |

Unit tests live in `tests/unit/frontend` and `tests/unit/backend`. They use Node’s built-in test runner and synthetic catalogs. Frontend fetches and request deadlines are mocked, so unit tests need no network, open ports, browser, or real-time timeout waits. Backend services accept a catalog argument and run independently of Express. The production UI and HTTP adapters call the same tested functions.

Before browser tests, install Chromium once:

```powershell
npx playwright install chromium
```

Stop any manually running services before starting an E2E suite: it reserves ports 3000–3003 and 4001–4003 and manages its own servers. Reports are written to `playwright-report/`, with failure traces and desktop/mobile screenshots in `test-results/`.

The BFFs run TypeScript through Node’s `--import tsx` hook in both dev and preview. They are read-only fixture servers, not deployment infrastructure.

## Configuration

Each frontend reads its own JSON configuration at runtime. Change these files without editing frontend source:

- `apps/shell/public/runtime-config.json`: the three full `mf-manifest.json` URLs.
- `slices/<name>/public/runtime-config.json`: that slice’s `bffOrigin` and standalone `shellOrigin`.

Development serves the public files directly. A production build copies them into each `dist/`; edit the corresponding `dist/runtime-config.json` to reconfigure a built artifact without rebuilding. Use HTTP(S) origins without trailing slashes. Each app is served at its origin root. HTML scripts use root-relative paths, and remote chunks resolve relative to their remote entry through `publicPath: "auto"`.

Each remote frontend requests only its own BFF. Shell loads remote code and configuration but does not request portfolio data. The standalone “Visit the full site” link and cross-slice navigation use `shellOrigin`.

BFF settings are environment variables:

| Variable                                         | Default                              | Meaning                                       |
| ------------------------------------------------ | ------------------------------------ | --------------------------------------------- |
| `PROFILE_PORT`, `PROJECTS_PORT`, `INSIGHTS_PORT` | 4001, 4002, 4003                     | BFF listen ports                              |
| `<SLICE>_DELAY_MS`                               | 0                                    | API delay, from 0 to 30000 ms                 |
| `<SLICE>_FAIL_RATE`                              | 0                                    | Probability of API 503 responses, from 0 to 1 |
| `CORS_ORIGINS`                                   | localhost/127.0.0.1 frontend origins | Comma-separated allowed frontend origins      |

Example:

```powershell
$env:PROJECTS_DELAY_MS = "1500"
$env:PROJECTS_FAIL_RATE = "1"
npm run dev:projects:bff
# Stop with Ctrl+C, then reset and restart:
Remove-Item Env:PROJECTS_DELAY_MS, Env:PROJECTS_FAIL_RATE
npm run dev:projects:bff
```

`/health` stays available and reports the service name and configured failure mode. API responses time out in the UI after 12 seconds and can be retried. Remote loading also has a 12-second UI deadline.

For a manual resilience demonstration, run web and BFF commands in separate terminals, stop only one, and reload the shell. Restore the service and use its local **Try again** button. Automated tests block individual remote/BFF requests to check the same failure boundaries without disrupting other tests.

## Routes and APIs

Shell routes: `/`, `/profile`, `/projects`, `/projects/:slug`, `/insights`, and `/insights/:slug`. Unknown routes have a recovery link. Each standalone app supports its corresponding section and detail URLs, including direct refresh.

- `GET /api/profile`
- `GET /api/projects?search=signals&tag=Product`
- `GET /api/projects/:slug`
- `GET /api/insights?topic=Engineering`
- `GET /api/insights/:slug`
- `GET /health` on every BFF

Search is case-insensitive and matches project title, summary, and tags. Tag/topic matches are exact. Unknown filters return an empty array. Duplicate, oversized, or unsupported query parameters return 400; unknown slugs return 404. Fixtures and returned payloads are validated using slice-owned Zod schemas.

## Repository

```text
apps/shell/             Navigation, history, remote loading, development diagnostics
slices/profile/        React 19 frontend + BFF + contracts + fixtures
slices/projects/       React 18 frontend + BFF + contracts + fixtures
slices/insights/       Vue frontend + BFF + contracts + fixtures
packages/contract/     Framework-neutral mount contract and request lifecycle helpers
packages/ui/           React component source compiled against each consumer’s runtime
packages/tokens/       Shared Tailwind theme, visual primitives, standalone reset
packages/server/       Express transport, CORS, health, and failure-mode infrastructure
scripts/               Rspack builds, seven-service runner, static preview server
tests/                 HTTP contract tests and browser integration tests
docs/                  Architecture, source notes, verification record
```

Build outputs live in `apps/shell/dist` and `slices/{profile,projects,insights}/dist`. Every remote emits `mf-manifest.json` and `remoteEntry.js`.

All installed versions are exact and recorded in `package-lock.json`; the UI peer dependency deliberately accepts both supported React majors. An `adm-zip: 0.6.1` override fixes an advisory in Module Federation’s transitive type-generation tooling. Federation-generated type downloads are disabled; the workspace owns the mount contract.

## Content and scope

The profile uses Evan Hyer’s name and the supplied public LinkedIn link. Career history and employer claims are intentionally absent because they were not verified. Introductory copy describes this portfolio; it is not a sourced professional biography.

Projects and insights are visibly labeled **demonstration content**. Replace their slice-owned fixtures with approved real material before treating the site as a record of professional work. See [source notes](docs/SOURCES.md).

The architecture panel appears only in development. It reports actual imported framework versions, configured remote origins, and the state of each mounted slice’s BFF requests. It is excluded from the production interface.

Authentication, CMS editing, persistence, contact submission, AWS infrastructure, and deployment are outside this version’s scope.
