# Validate the specification baseline

From the repository root on Windows with Node 24:

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Standalone UIs use ports 3001-3003 and their BFFs use 4001-4003. Stop the service group with Ctrl+C before starting browser suites, which launch their own services.

```powershell
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run infra:synth
npm run test:e2e
npm run test:e2e:preview
npm run format:check
```

Baseline evidence: 44 business unit tests, 13 HTTP tests, four Lambda adapter tests, 14 infrastructure/release tests, and 22 Chromium tests in each browser mode passed for implementation commit 1a548f9. Selected business modules reached 100% measured coverage; the gate requires 90% lines and 95% branches/functions. See [verification](../docs/VERIFICATION.md).

Manual acceptance: search Projects for Track Changes; select Salesforce; open a detail and follow its GitHub link; reload the detail URL; use browser history; check mobile navigation and retry after a blocked remote. Insights remain visibly labeled as demonstrations.

Cloud deployment is separate. Follow [AWS setup](../docs/AWS.md), then validate the generated public CloudFront URL. Do not mark live deployment tasks complete based on local previews or CDK synthesis.

Use the [solo workflow](../docs/CONTRIBUTING.md) for changes. Feature branches and passing checks are the working convention until the private-repository plan supports enforced rules.
