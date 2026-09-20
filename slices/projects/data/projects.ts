import { Projects } from '../contracts/index';
// Curated public repository snapshot. See docs/SOURCES.md for selection and provenance.
export const projects = Projects.parse([
  {
    slug: 'track-changes',
    title: 'Track Changes',
    category: 'Developer tooling',
    summary:
      'A Salesforce CLI workflow for finding metadata changes and bringing them into Git.',
    tags: ['Salesforce', 'CLI', 'TypeScript'],
    year: '2026',
    color: 'sage',
    kind: 'orbit',
    challenge:
      'Make Salesforce metadata changes discoverable from the terminal, with a path from inspection to retrieval and commit.',
    approach: [
      'Filter changes by user, date, component type, name, and target org.',
      'Inspect results as a table, JSON, or HTML.',
      'Select metadata, retrieve it, and use the documented commit workflows.',
    ],
    outcome:
      'A public Salesforce CLI plugin. Features are described from its README; no adoption or performance claims are implied.',
    demo: false,
    repositoryUrl: 'https://github.com/evan-hyer/track-changes',
    sourceUrl: 'https://github.com/evan-hyer/track-changes/blob/main/README.md',
    sourceChecked: '2026-09-19',
  },
  {
    slug: 'lwc-observer-patterns',
    title: 'LWC Observer Patterns',
    category: 'Component architecture',
    summary:
      'Three ways to connect Lightning Web Components, with practical logging examples.',
    tags: ['Salesforce', 'LWC', 'JavaScript'],
    year: '2025',
    color: 'clay',
    kind: 'lines',
    challenge:
      'Explore how Lightning Web Components can communicate across different relationships and scopes.',
    approach: [
      'Compare Lightning Message Service with parent-child APIs and custom events.',
      'Use a JavaScript observer service for publisher-subscriber communication.',
      'Explore a logging utility with lightning/logger and a console fallback.',
    ],
    outcome:
      "A learning and reference repository. The README documents Jest tests, but this portfolio does not claim to have independently validated that repository's test suite.",
    demo: false,
    repositoryUrl: 'https://github.com/evan-hyer/LWC_ObserverPattern',
    sourceUrl:
      'https://github.com/evan-hyer/LWC_ObserverPattern/blob/main/README.md',
    sourceChecked: '2026-09-19',
  },
  {
    slug: 'external-api-request',
    title: 'External API Request',
    category: 'Salesforce integration',
    summary:
      'A fluent Apex builder for assembling HTTP requests to external services.',
    tags: ['Salesforce', 'Apex', 'Design patterns'],
    year: '2023',
    color: 'blue',
    kind: 'blocks',
    challenge:
      'Make the configuration of an Apex HTTP request explicit and readable at the call site.',
    approach: [
      'Chain endpoint, method, header, and optional body configuration.',
      'Build the HttpRequest through a nested builder.',
      "Follow the repository's joke-retrieval example for a concrete callout.",
    ],
    outcome:
      'An example of the Builder pattern in Apex. Review the repository before adopting the helper in a production integration.',
    demo: false,
    repositoryUrl: 'https://github.com/evan-hyer/ExternalAPIRequest',
    sourceUrl:
      'https://github.com/evan-hyer/ExternalAPIRequest/blob/main/README.md',
    sourceChecked: '2026-09-19',
  },
  {
    slug: 'svelte-web-component',
    title: 'Svelte Web Component',
    category: 'Frontend exploration',
    summary:
      'A Svelte and Vite experiment in packaging an interface as a standard web component.',
    tags: ['Svelte', 'TypeScript', 'Web components'],
    year: '2023',
    color: 'sand',
    kind: 'grid',
    challenge:
      'Explore embedding a declaratively built interface in a host page through a framework-neutral custom element.',
    approach: [
      'Register an example-app custom element and mount Svelte into its shadow root.',
      'Use a Vite library build to produce an IIFE JavaScript bundle.',
      'Exercise the generated bundle in a separate HTML host page.',
    ],
    outcome:
      'An exploratory implementation. Its README explicitly leaves shadow-root stylesheet handling as a TODO; it is not presented as a finished component library.',
    demo: false,
    repositoryUrl: 'https://github.com/evan-hyer/SvelteWebComponent',
    sourceUrl:
      'https://github.com/evan-hyer/SvelteWebComponent/blob/main/svelte-vite-webcomponent/README.md',
    sourceChecked: '2026-09-19',
  },
]);
