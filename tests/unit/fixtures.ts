import type { ProjectData } from '../../slices/projects/contracts/index';
import type { InsightData } from '../../slices/insights/contracts/index';
import type { ProfileData } from '../../slices/profile/contracts/index';

function project(slug: string, overrides: Partial<ProjectData>): ProjectData {
  return {
    slug,
    title: slug,
    category: 'Study',
    summary: 'Example',
    tags: [],
    year: '2026',
    color: 'sage',
    kind: 'orbit',
    challenge: 'A question',
    approach: ['One step'],
    outcome: 'An observation',
    demo: false,
    repositoryUrl: 'https://github.com/evan-hyer/' + slug,
    sourceUrl: 'https://github.com/evan-hyer/' + slug + '/blob/main/README.md',
    sourceChecked: '2026-09-19',
    ...overrides,
  };
}
export const projectCatalog: ProjectData[] = [
  project('alpha', {
    title: 'Harbor',
    summary: 'Calm layouts',
    tags: ['Design systems', 'Frontend'],
  }),
  project('beta', {
    title: 'Beacon',
    summary: 'Insightful charts',
    tags: ['Data', 'Product'],
  }),
  project('gamma', {
    title: 'Atlas',
    summary: 'Portable interfaces',
    tags: ['Frontend'],
    challenge: 'secret-search-term',
  }),
  project('delta', {
    title: 'C++ Notes',
    summary: 'Capture research',
    tags: ['Product'],
  }),
];
function insight(slug: string, topic: string): InsightData {
  return {
    slug,
    title: slug,
    topic,
    excerpt: 'An observation',
    date: '2026-01-01',
    readMinutes: 3,
    body: [{ heading: 'A thought', text: 'Example article text.' }],
    demo: true,
  };
}
export const insightCatalog: InsightData[] = [
  insight('first-note', 'Design'),
  insight('second-note', 'Engineering'),
  insight('third-note', 'Design'),
];
export const profileRecord: ProfileData = {
  name: 'Example Person',
  role: 'A personal portfolio',
  introduction: 'Welcome.',
  linkedin: 'https://www.linkedin.com/in/example',
  about: ['A short introduction.'],
  interests: ['Interfaces'],
};
