import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../../../apps/shell/src/routing';
import { internalNavigation } from '../../../packages/contract/src/index';
import { visibleProjects } from '../../../slices/projects/src/presentation';
import { projectCatalog } from '../fixtures';

describe('frontend route selection', () => {
  it('identifies the homepage as the composite summary route', () => {
    assert.deepEqual(resolveRoute('/'), {
      current: undefined,
      isHome: true,
      valid: true,
      relativeRoute: '/',
    });
  });
  for (const name of ['profile', 'projects', 'insights'] as const)
    it(
      'selects only ' +
        name +
        ' for its section, with or without a trailing slash',
      () => {
        for (const path of ['/' + name, '/' + name + '/'])
          assert.deepEqual(resolveRoute(path), {
            current: name,
            isHome: false,
            valid: true,
            relativeRoute: '/',
          });
      },
    );
  it('passes a relative detail route to the correct owning remote', () => {
    for (const name of ['projects', 'insights'] as const)
      for (const suffix of ['', '/'])
        assert.deepEqual(resolveRoute('/' + name + '/an-example' + suffix), {
          current: name,
          isHome: false,
          valid: true,
          relativeRoute: '/an-example',
        });
  });
  it('rejects unknown sections, profile details, nested details, and lookalike section prefixes', () => {
    for (const path of [
      '/unknown',
      '/profile/biography',
      '/projects/a/b',
      '/insights/a/b',
      '/projects-old',
      '//projects',
      'projects',
      '',
    ])
      assert.equal(resolveRoute(path).valid, false, path);
  });
});

describe('frontend link behavior', () => {
  it('uses the navigation callback exactly once for an ordinary primary-button click', (t) => {
    const preventDefault = t.mock.fn();
    const navigate = t.mock.fn();
    internalNavigation(
      {
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        preventDefault,
      },
      '/projects/alpha',
      navigate,
    );
    assert.equal(preventDefault.mock.callCount(), 1);
    assert.deepEqual(
      navigate.mock.calls.map((call) => call.arguments),
      [['/projects/alpha']],
    );
  });
  it('preserves browser behavior for modified clicks and non-primary buttons', (t) => {
    for (const changed of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
      { button: 2 },
    ]) {
      const preventDefault = t.mock.fn();
      const navigate = t.mock.fn();
      internalNavigation(
        {
          button: 0,
          metaKey: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          ...changed,
          preventDefault,
        },
        '/insights',
        navigate,
      );
      assert.equal(preventDefault.mock.callCount(), 0);
      assert.equal(navigate.mock.callCount(), 0);
    }
  });
});

describe('frontend project presentation', () => {
  it('shows exactly the first three editorial projects on the homepage without changing the catalog', () => {
    const source = Object.freeze(structuredClone(projectCatalog));
    assert.deepEqual(
      visibleProjects(source, 'summary')?.map((p) => p.slug),
      ['alpha', 'beta', 'gamma'],
    );
    assert.deepEqual(source, projectCatalog);
  });
  it('shows all results when browsing and does not pad short summaries', () => {
    assert.deepEqual(
      visibleProjects(projectCatalog, 'full')?.map((p) => p.slug),
      ['alpha', 'beta', 'gamma', 'delta'],
    );
    assert.deepEqual(
      visibleProjects(projectCatalog.slice(0, 1), 'summary')?.map(
        (p) => p.slug,
      ),
      ['alpha'],
    );
  });
  it('keeps loading distinct from a successful empty search result', () => {
    for (const mode of ['summary', 'full'] as const) {
      assert.equal(visibleProjects(undefined, mode), undefined);
      assert.deepEqual(visibleProjects([], mode), []);
    }
  });
});
