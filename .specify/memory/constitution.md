# Evan Hyer Site Constitution

Version: 1.0.0. Adopted: 2026-09-20.

This constitution records the principles of the existing implementation and governs future specifications. It was authored retrospectively; no earlier Spec Kit execution or test-first sequence is asserted.

## Principles

1. **Own the vertical slice.** Profile, Projects, and Insights own their UI, HTTP BFF, contracts, and data. Each remains independently runnable. The shell owns composition and browser history.
2. **Respect runtime boundaries.** Exchange a framework-neutral mount contract, never framework elements or contexts. Compatible React dependencies may share a scope; incompatible majors must not.
3. **Publish supportable content.** Career claims require evidence. Public GitHub projects link to their sources. Fictional writing remains labeled. Private repositories and credentials never enter shipped content.
4. **Make failure local and recoverable.** A failed remote or API must not disable healthy sections. Abort work and dispose roots on navigation. Provide accessible loading, failure, empty, and retry states.
5. **Verify meaningful behavior.** Business tests cover validation, filtering, boundaries, and cancellation. Browser tests verify actual runtimes and journeys. Infrastructure assertions verify security and cost settings; offline synthesis is not evidence of a live deployment.
6. **Keep operations small and explicit.** Prefer usage-based services without idle infrastructure. Private S3 is served through CloudFront. Deployment uses short-lived OIDC credentials, verified artifacts, and bounded API/compute settings. Budget alerts are not spending caps.
7. **Use a workable solo workflow.** Feature branch, PR, successful CI, self-review, squash merge. No second-person approval is required. Document any platform limitation preventing server-side enforcement.

## Change governance

A feature specification states user outcomes, requirements, acceptance scenarios, and exclusions. Its plan identifies concrete modules, contracts, alternatives, and validation. Tasks reference those requirements and actual paths. Mark a task complete only with implementation or verification evidence; leave account-dependent work open.

Changes to these principles must explain their effect on existing features. Amend this document and the affected specifications in the same PR. Update the version when principles change. Existing user instructions remain authoritative; this document does not create an additional permission gate.
