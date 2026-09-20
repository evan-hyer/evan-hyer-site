# Specification index

These are retrospective, Spec Kit-style specifications for the site, authored on September 20, 2026 against implementation commit `1a548f9`. They organize the actual requirements, design decisions, tasks, and evidence using the specification / plan / tasks structure described by [GitHub Spec Kit](https://github.com/github/spec-kit). They are original project documentation, not generated CLI output or a reconstructed commit history.

| Feature                                                    | Status                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| [001 Federated shell](001-federated-shell/spec.md)         | Implemented and browser-verified                                     |
| [002 Profile and insights](002-profile-insights/spec.md)   | Implemented; insights are demonstrations                             |
| [003 GitHub projects](003-github-projects/spec.md)         | Implemented from a reviewed public snapshot                          |
| [004 Quality gates](004-quality-gates/spec.md)             | Implemented; local and Linux CI passed                               |
| [005 Serverless delivery](005-serverless-delivery/spec.md) | Implemented and synthesized; live AWS deployment pending             |
| [006 Solo repository workflow](006-solo-workflow/spec.md)  | Merge settings configured; branch enforcement blocked by GitHub plan |

Start with the [constitution](../.specify/memory/constitution.md). Each feature has `spec.md`, `plan.md`, and `tasks.md`. Shared [contracts](contracts.md), [data model](data-model.md), [decision record](research.md), and [quickstart](quickstart.md) avoid contradictory copies of cross-feature interfaces.

Task IDs are scoped to their feature. Checked boxes describe work evidenced by the current repository, not proof that tasks were performed in the listed order. Specification numbers are logical feature identifiers, not claims that those branches historically existed. Open AWS and GitHub-plan tasks are intentionally unfinished.

For future features, create the next numbered directory on a feature branch, specify observable outcomes first, record technical decisions in its plan, and track implementation/verification in its tasks. Update source links and the evidence record as behavior changes. This repository does not install the Specify CLI or agent command integrations; initialize those separately if you want the actual Spec Kit commands.
