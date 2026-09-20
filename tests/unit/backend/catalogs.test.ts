import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ZodError } from 'zod';
import { RequestError } from '../../../packages/server/src/request-error';
import { listProjects, getProject } from '../../../slices/projects/bff/service';
import { listInsights, getInsight } from '../../../slices/insights/bff/service';
import { getProfile } from '../../../slices/profile/bff/service';
import { projectCatalog, insightCatalog, profileRecord } from '../fixtures';
const slugs = (items: readonly { slug: string }[]) =>
  items.map((item) => item.slug);
const status = (expected: number) => (error: unknown) =>
  error instanceof RequestError && error.status === expected;

describe('project business rules', () => {
  it('returns all projects in editorial order for omitted, empty, and whitespace searches', () => {
    const frozen = Object.freeze(structuredClone(projectCatalog));
    for (const query of [{}, { search: '' }, { search: ' \t ' }, { tag: '' }])
      assert.deepEqual(slugs(listProjects(frozen, query)), [
        'alpha',
        'beta',
        'gamma',
        'delta',
      ]);
    assert.deepEqual(frozen, projectCatalog);
  });
  for (const [search, expected] of [
    ['  HARBOR  ', ['alpha']],
    ['CHARTS', ['beta']],
    ['frontend', ['alpha', 'gamma']],
    ['C++', ['delta']],
    ['secret-search-term', []],
    ['does not exist', []],
  ] as const)
    it('searches public title, summary, and tags literally: ' + search, () => {
      assert.deepEqual(
        slugs(listProjects(projectCatalog, { search })),
        expected,
      );
    });
  it('combines search and exact tag membership with AND rather than OR', () => {
    assert.deepEqual(slugs(listProjects(projectCatalog, { tag: 'Product' })), [
      'beta',
      'delta',
    ]);
    assert.deepEqual(
      slugs(listProjects(projectCatalog, { search: 'charts', tag: 'Product' })),
      ['beta'],
    );
    assert.deepEqual(
      listProjects(projectCatalog, { search: 'Beacon', tag: 'Frontend' }),
      [],
    );
    assert.deepEqual(listProjects(projectCatalog, { tag: 'product' }), []);
    assert.deepEqual(listProjects(projectCatalog, { tag: 'Unknown' }), []);
  });
  it('accepts the length boundaries but rejects oversized, repeated, non-string, and unknown filters', () => {
    assert.deepEqual(
      listProjects(projectCatalog, {
        search: 'x'.repeat(200),
        tag: 'y'.repeat(80),
      }),
      [],
    );
    for (const query of [
      { search: 'x'.repeat(201) },
      { tag: 'x'.repeat(81) },
      { search: ['a', 'b'] },
      { tag: ['Product'] },
      { search: 1 },
      { tag: { value: 'Product' } },
      { topic: 'Design' },
      null,
      [],
      'search=Harbor',
    ])
      assert.throws(() => listProjects(projectCatalog, query), status(400));
  });
  it('detail lookup returns the complete record without mutating or exposing the fixture object', () => {
    const source = structuredClone(projectCatalog);
    const result = getProject(source, 'beta');
    assert.deepEqual(result, projectCatalog[1]);
    result.tags.push('Changed');
    assert.deepEqual(source, projectCatalog);
  });
  it('distinguishes missing projects from invalid detail requests', () => {
    assert.throws(
      () => getProject(projectCatalog, 'missing-project-2'),
      status(404),
    );
    for (const slug of [
      '',
      '..',
      'alpha/beta',
      'ALPHA',
      'alpha_name',
      'alpha--beta',
      '-alpha',
      'alpha-',
    ])
      assert.throws(() => getProject(projectCatalog, slug), status(400));
    assert.throws(
      () => getProject(projectCatalog, 'alpha', { search: 'Harbor' }),
      status(400),
    );
    assert.throws(
      () => getProject(projectCatalog, 'missing', { unknown: 'x' }),
      status(400),
    );
  });
  it('rejects invalid output and fictional records in the GitHub catalog', () => {
    const invalid = {
      ...projectCatalog[0],
      demo: true,
    } as unknown as (typeof projectCatalog)[number];
    assert.throws(() => listProjects([invalid]), ZodError);
    assert.throws(() => getProject([invalid], 'alpha'), ZodError);
  });
});

describe('insight business rules', () => {
  it('keeps editorial order and matches the topic exactly', () => {
    const source = Object.freeze(structuredClone(insightCatalog));
    assert.deepEqual(slugs(listInsights(source)), [
      'first-note',
      'second-note',
      'third-note',
    ]);
    assert.deepEqual(slugs(listInsights(source, { topic: 'Design' })), [
      'first-note',
      'third-note',
    ]);
    assert.deepEqual(slugs(listInsights(source, { topic: '' })), [
      'first-note',
      'second-note',
      'third-note',
    ]);
    for (const topic of ['design', ' Design ', 'Unknown'])
      assert.deepEqual(listInsights(source, { topic }), []);
    assert.deepEqual(source, insightCatalog);
  });
  it('validates topic length, cardinality, type, and unsupported filters', () => {
    assert.deepEqual(
      listInsights(insightCatalog, { topic: 'x'.repeat(80) }),
      [],
    );
    for (const query of [
      { topic: 'x'.repeat(81) },
      { topic: ['Design', 'Engineering'] },
      { topic: 3 },
      { search: 'note' },
      null,
      [],
    ])
      assert.throws(() => listInsights(insightCatalog, query), status(400));
  });
  it('returns a complete article without letting callers mutate fixture paragraphs', () => {
    const source = structuredClone(insightCatalog);
    const result = getInsight(source, 'second-note');
    assert.deepEqual(result, insightCatalog[1]);
    result.body[0].text = 'Changed';
    assert.deepEqual(source, insightCatalog);
  });
  it('distinguishes missing articles, malformed slugs, and unsupported detail queries', () => {
    assert.throws(
      () => getInsight(insightCatalog, 'missing-note'),
      status(404),
    );
    for (const slug of [
      '',
      '..',
      'first/note',
      'FIRST',
      'first_note',
      'first--note',
    ])
      assert.throws(() => getInsight(insightCatalog, slug), status(400));
    assert.throws(
      () => getInsight(insightCatalog, 'first-note', { topic: 'Design' }),
      status(400),
    );
  });
  it('requires positive whole reading times, complete paragraphs, and demonstration labeling', () => {
    for (const changed of [
      { readMinutes: 0 },
      { readMinutes: -1 },
      { readMinutes: 1.5 },
      { demo: false },
      { body: [{ heading: 'Missing text' }] },
    ]) {
      const invalid = {
        ...insightCatalog[0],
        ...changed,
      } as unknown as (typeof insightCatalog)[number];
      assert.throws(() => listInsights([invalid]), ZodError);
      assert.throws(() => getInsight([invalid], 'first-note'), ZodError);
    }
  });
});

describe('profile business rules', () => {
  it('returns a validated profile and protects the fixture from caller mutation', () => {
    const source = structuredClone(profileRecord);
    const result = getProfile(source);
    assert.deepEqual(result, profileRecord);
    result.about.push('Changed');
    assert.deepEqual(source, profileRecord);
  });
  it('rejects unsupported parameters and invalid profile URLs', () => {
    for (const query of [{ search: 'person' }, { name: 'Example' }, null, []])
      assert.throws(() => getProfile(profileRecord, query), status(400));
    assert.throws(
      () => getProfile({ ...profileRecord, linkedin: 'not a URL' }),
      ZodError,
    );
  });
});
