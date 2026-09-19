import type { InsightData } from '../contracts/index';
export const insights: InsightData[] = [
  {
    slug: 'the-space-between-components',
    title: 'The space between components',
    topic: 'Design',
    excerpt:
      'A good interface is more than a collection of well-made parts. It’s how those parts relate.',
    date: '2026-08-20',
    readMinutes: 3,
    demo: true,
    body: [
      {
        heading: 'Relationships do the work',
        text: 'A button can be beautifully made and still feel wrong in a page. The space around it, the words before it, and the expectation it creates all shape the interaction. Design systems become useful when they describe these relationships as clearly as they describe the individual pieces.',
      },
      {
        heading: 'Begin with a rhythm',
        text: 'A modest spacing scale can create a dependable rhythm across an interface. That rhythm helps a reader distinguish a new thought from a supporting detail. Consistency is useful because it gives the exceptions something to stand out against.',
      },
      {
        heading: 'Leave room for context',
        text: 'The most helpful shared rules leave room for local judgment. A compact tool and a long article need different densities, even if they belong to the same product. Shared principles can connect them without forcing them into the same arrangement.',
      },
    ],
  },
  {
    slug: 'small-contracts-strong-boundaries',
    title: 'Small contracts, strong boundaries',
    topic: 'Engineering',
    excerpt:
      'Why the most useful interface between teams might also be the smallest.',
    date: '2026-08-06',
    readMinutes: 4,
    demo: true,
    body: [
      {
        heading: 'Agree on the doorway',
        text: 'Independent applications need a clear way to meet. A small mounting interface is one example: an element to render into, a route to display, and a way to ask for navigation. Everything behind that doorway can remain an implementation choice.',
      },
      {
        heading: 'Own the whole experience',
        text: 'A boundary is more useful when it includes data access and failure states. If a section owns its own requests, it can also own the explanation when those requests fail. That keeps a local problem from becoming a site-wide interruption.',
      },
      {
        heading: 'Test the disagreement',
        text: 'The happy path is only one part of a contract. Try an unavailable service, a slower response, and a route that no longer exists. These disagreements reveal whether the boundary is real or merely a diagram.',
      },
    ],
  },
  {
    slug: 'make-room-for-curiosity',
    title: 'Make room for curiosity',
    topic: 'Process',
    excerpt:
      'Small experiments are a practical way to turn an interesting question into something you can learn from.',
    date: '2026-07-24',
    readMinutes: 3,
    demo: true,
    body: [
      {
        heading: 'Ask a smaller question',
        text: 'An experiment becomes easier to finish when it answers one question. Instead of redesigning a whole workflow, try improving the first decision. A narrow question makes it easier to see what changed and what remains uncertain.',
      },
      {
        heading: 'Make something you can discuss',
        text: 'A rough interface often starts a more useful conversation than an abstract proposal. People can point to a label, try a sequence, or explain what they expected. The artifact gives everyone a shared reference.',
      },
      {
        heading: 'Keep the learning',
        text: 'The experiment does not need to become a product to be valuable. A short note about what surprised you can be enough. Over time, these small observations become a useful record of how your thinking changed.',
      },
    ],
  },
];
