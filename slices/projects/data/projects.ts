import type { ProjectData } from '../contracts/index';
export const projects: ProjectData[] = [
  {
    slug: 'common-ground',
    title: 'Common Ground',
    category: 'Design systems',
    summary:
      'A shared visual language. Room for every team to make it their own.',
    tags: ['Design systems', 'Frontend'],
    year: '2026',
    color: 'sage',
    kind: 'orbit',
    demo: true,
    challenge:
      'How can independent teams build a coherent experience without moving in lockstep?',
    approach: [
      'Start with a small vocabulary of colors, type, and spacing.',
      'Share accessible component source while keeping product decisions close to each team.',
      'Document the boundaries as carefully as the components.',
    ],
    outcome:
      'This fictional case study explores a design system that supports independent delivery. No client work or measured business results are claimed.',
  },
  {
    slug: 'field-notes',
    title: 'Field Notes',
    category: 'Product exploration',
    summary: 'A quieter place to capture the things worth coming back to.',
    tags: ['Product', 'Frontend'],
    year: '2026',
    color: 'clay',
    kind: 'lines',
    demo: true,
    challenge:
      'Useful ideas often disappear into busy tools. What would a calmer collection experience look like?',
    approach: [
      'Make capture the smallest possible interaction.',
      'Organize around topics instead of rigid folders.',
      'Use generous space and readable type to help ideas breathe.',
    ],
    outcome:
      'An illustrative product concept for a personal knowledge library. The interface is a demonstration, not a released product.',
  },
  {
    slug: 'connected-pieces',
    title: 'Connected Pieces',
    category: 'System architecture',
    summary:
      'Independent applications, brought together in one considered experience.',
    tags: ['Architecture', 'Frontend'],
    year: '2026',
    color: 'blue',
    kind: 'blocks',
    demo: true,
    challenge:
      'Can applications evolve on their own while still feeling like parts of one whole?',
    approach: [
      'Define a narrow, framework-neutral mounting contract.',
      'Let each application own its data and rendering runtime.',
      'Design loading and failure as local states instead of global interruptions.',
    ],
    outcome:
      'A demonstration of modular frontend architecture. The principles are reflected in this site’s independently running sections.',
  },
  {
    slug: 'small-signals',
    title: 'Small Signals',
    category: 'Data & interaction',
    summary: 'Turning a wall of information into a few meaningful next steps.',
    tags: ['Product', 'Data'],
    year: '2025',
    color: 'sand',
    kind: 'grid',
    demo: true,
    challenge:
      'Dashboards can overwhelm the people they are meant to help. Which signals deserve attention?',
    approach: [
      'Choose a small set of questions before drawing charts.',
      'Group information around the decisions it supports.',
      'Use accessible contrast and clear labels for every state.',
    ],
    outcome:
      'A fictional dashboard study that explores information hierarchy. All example concepts and outcomes are illustrative.',
  },
];
