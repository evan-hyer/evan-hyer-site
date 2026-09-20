# Shared interface contracts

Authoritative schemas are the slice-owned Zod modules; this document is a readable map, not a second schema implementation.

## Browser composition

`mount(element, { route, mode, navigate, onStatus? }) -> { unmount() }`

- `route` is relative to the selected slice: `/` or `/slug`.
- `mode` is `summary` on the composite homepage and `full` on section/detail pages.
- `navigate` receives a site path. The shell manages history; standalone remotes direct cross-slice navigation to the configured shell origin.
- `unmount` is idempotent. Rendering ownership belongs to the remote.
- Metadata reports the imported framework version. Status includes framework, version, BFF origin, and loading/online/unavailable.
- No React elements, contexts, or Vue component instances cross the interface.

Source: [contract module](../packages/contract/src/index.ts).

## HTTP

| Request                 | Query                                             | Success                            | Failure                                 |
| ----------------------- | ------------------------------------------------- | ---------------------------------- | --------------------------------------- |
| GET /api/profile        | None                                              | Profile object                     | Unsupported query: 400                  |
| GET /api/projects       | Optional single search <=200 characters, tag <=80 | Ordered project array              | Wrong types/repeated/unknown query: 400 |
| GET /api/projects/:slug | None                                              | Complete project                   | Invalid slug/query: 400; absent: 404    |
| GET /api/insights       | Optional single topic <=80                        | Ordered insight array              | Invalid query: 400                      |
| GET /api/insights/:slug | None                                              | Complete article                   | Invalid slug/query: 400; absent: 404    |
| GET /health             | Not used for filtering                            | Service, status, delayMs, failRate | Independent of injected API failure     |

Search is trimmed, case-insensitive, literal substring matching across project title, summary, and tags. Tag/topic matching is exact; search and tag intersect. Empty matches return an empty array with HTTP 200. Detail slugs use lowercase alphanumeric segments separated by single hyphens.

Unknown endpoints return JSON 404. Unexpected errors return generic JSON 500. Failure injection can produce 503 and delays; it defaults off in production. The browser maps errors to visitor-safe messages and uses a twelve-second request deadline.

## Runtime configuration

Shell: `{ remotes: { profile, projects, insights } }`, each value a manifest URL.

Remote: `{ bffOrigin, shellOrigin }`. A remote loads configuration from its own asset base and requests only its own BFF.

Production release configuration is derived from the `EvanHyerSite` CloudFormation outputs: each application's Bucket, Distribution, Url, plus each slice's ApiUrl. Release validation requires bare HTTPS origins and distinct frontend origins. See [release validation](../scripts/release.ts).

## Deployment contract

CI's `verify` job has no AWS identity. The production job consumes its successful build artifact and assumes the repository/environment-bound OIDC role. Mutable configuration, manifests, and HTML follow their immutable assets; the shell publishes last. A missing build dependency aborts before publication. A failed upload stops subsequent publication. Live smoke checks validate public routes, manifests, configuration, and API contracts.
