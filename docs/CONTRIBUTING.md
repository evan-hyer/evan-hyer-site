# Solo-maintainer workflow

Create a short-lived branch, make a focused change, open a PR to main, inspect the diff and test results, then squash merge it yourself. Another person's approval is not required. Keep the PR title meaningful: it becomes the squash commit title.

## Configured settings

- Squash merge enabled; merge commits and rebase merge disabled.
- Merged branches automatically deleted.
- GitHub's Update branch option enabled.
- Production deployment environment restricted to main.
- Existing CI runs on every PR and on main; production deployment remains separately disabled until AWS bootstrap.

## Enforcement limitation

On September 20, 2026, GitHub returned HTTP 403 for both repository rulesets and main branch protection: "Upgrade to GitHub Pro or make this repository public to enable this feature."

The repository remains private. The following protection is saved in [.github/rulesets/main.json](../.github/rulesets/main.json) for import after GitHub Pro is enabled, but is **not currently enforced**:

- Require a PR with zero approving reviews.
- Require all review conversations resolved.
- Require the GitHub Actions `verify` check and an up-to-date branch.
- Require linear history; block force pushes and main deletion.
- No routine bypass actors, including the owner.

Neither a PR template, local hook, nor a workflow can substitute for server-side branch protection. Direct pushes remain technically possible on the current plan. No paid subscription or visibility change was made.

## Enable enforcement later

After upgrading, open repository Settings > Rules > Rulesets and import the JSON file. Confirm active enforcement, main as the target, and `verify` from GitHub Actions as the required check. Review any future ruleset schema changes before import.

Do not require code-owner approval or last-push approval for a one-person repository. Do not require the `deploy` check: it is intentionally skipped for PRs and when AWS deployment is disabled. Keep `verify` as a stable, unconditional job name. If it must change, update the required rule with the workflow change.

For an emergency, the owner can edit the rule in Settings. Record the reason and restore it promptly; do not keep an everyday admin bypass. With no bypass configured, the owner must normally use PRs too.

## Routine commands

```powershell
git switch main
git pull --ff-only
git switch -c feat/short-description
# Implement and run checks appropriate to the change.
git add .
git commit -m "Describe the behavior change"
git push -u origin feat/short-description
```

Open a PR, wait for `verify`, review your own changes, and choose Squash and merge. For docs-only work, check formatting and relative links; CI still runs the complete suite. Update the relevant [feature specifications](../specs/README.md) when requirements or interfaces change.

References: [rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository) and [available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).
