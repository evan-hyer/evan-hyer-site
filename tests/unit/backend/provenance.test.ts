import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  Project,
  Projects,
  projectTags,
} from '../../../slices/projects/contracts/index';
import { projects } from '../../../slices/projects/data/projects';
import { listProjects } from '../../../slices/projects/bff/service';
import { projectCatalog } from '../fixtures';
test('public catalog has one verified source per project and every filter is useful', () => {
  Projects.parse(projects);
  assert.deepEqual(
    projects.map((p) => new URL(p.repositoryUrl).pathname),
    [
      '/evan-hyer/track-changes',
      '/evan-hyer/LWC_ObserverPattern',
      '/evan-hyer/ExternalAPIRequest',
      '/evan-hyer/SvelteWebComponent',
    ],
  );
  assert.deepEqual(
    new Set(projects.flatMap((p) => p.tags)),
    new Set(projectTags),
  );
  for (const tag of projectTags)
    assert.ok(listProjects(projects, { tag }).length > 0);
  assert.ok(
    projects.every(
      (p) =>
        p.demo === false && p.sourceUrl.startsWith(p.repositoryUrl + '/blob/'),
    ),
  );
});
test('contracts reject unsafe links, another owner, mismatched source, invalid dates, and fictional labels', () => {
  for (const changed of [
    { repositoryUrl: 'javascript:alert(1)' },
    { repositoryUrl: 'http://github.com/evan-hyer/alpha' },
    { repositoryUrl: 'https://github.com.evil.example/evan-hyer/alpha' },
    { repositoryUrl: 'https://github.com/another/alpha' },
    { repositoryUrl: 'https://github.com/evan-hyer/alpha?x=1' },
    { sourceUrl: 'https://github.com/evan-hyer/beta/blob/main/README.md' },
    { sourceChecked: '2026-02-30' },
    { demo: true },
    { slug: '../alpha' },
  ])
    assert.equal(
      Project.safeParse({ ...projectCatalog[0], ...changed }).success,
      false,
    );
});
test('duplicate slugs and duplicate repositories cannot silently enter the catalog', () => {
  assert.equal(
    Projects.safeParse([projectCatalog[0], projectCatalog[0]]).success,
    false,
  );
  assert.equal(
    Projects.safeParse([
      projectCatalog[0],
      { ...projectCatalog[0], slug: 'another-slug' },
    ]).success,
    false,
  );
  assert.equal(
    Projects.safeParse([
      projectCatalog[0],
      { ...projectCatalog[1], slug: projectCatalog[0].slug },
    ]).success,
    false,
  );
});
test('combined filters are always a stable subset of both individual filters', () => {
  for (const search of [
    '',
    'a',
    'Salesforce',
    'builder',
    'unknown',
    '  CLI  ',
  ]) {
    for (const tag of ['', ...projectTags, 'Unknown']) {
      const combined = listProjects(projects, { search, tag }).map(
        (p) => p.slug,
      );
      const searched = listProjects(projects, { search }).map((p) => p.slug);
      const tagged = new Set(
        listProjects(projects, { tag }).map((p) => p.slug),
      );
      assert.deepEqual(
        combined,
        searched.filter((slug) => tagged.has(slug)),
      );
    }
  }
});
