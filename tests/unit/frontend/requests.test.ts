import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getJson, sliceConfig } from '../../../packages/contract/src/index';
import { parseProfile } from '../../../slices/profile/contracts/index';
import {
  parseProject,
  parseProjects,
} from '../../../slices/projects/contracts/index';
import {
  parseInsight,
  parseInsights,
} from '../../../slices/insights/contracts/index';
import { profileRecord, projectCatalog, insightCatalog } from '../fixtures';

const freshSignal = () => new AbortController().signal;
const unavailable = { message: 'This section is temporarily unavailable.' };

describe('frontend BFF response handling', () => {
  it('validates all slice list/detail responses using their owning contracts', async (t) => {
    const cases: Array<[unknown, (value: unknown) => unknown]> = [
      [profileRecord, parseProfile],
      [projectCatalog, parseProjects],
      [projectCatalog[0], parseProject],
      [insightCatalog, parseInsights],
      [insightCatalog[0], parseInsight],
    ];
    for (const [payload, parse] of cases) {
      const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
        Response.json(payload),
      );
      assert.deepEqual(
        await getJson('https://service.example/api/data', freshSignal(), parse),
        payload,
      );
      fetchMock.mock.restore();
    }
  });
  it('never reuses a cached API response, so a retry can recover after a service failure', async (t) => {
    let attempts = 0;
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
      attempts++;
      return attempts === 1
        ? new Response('Unavailable', { status: 503 })
        : Response.json(projectCatalog);
    });
    await assert.rejects(
      getJson(
        'https://service.example/api/projects',
        freshSignal(),
        parseProjects,
      ),
      unavailable,
    );
    assert.deepEqual(
      await getJson(
        'https://service.example/api/projects',
        freshSignal(),
        parseProjects,
      ),
      projectCatalog,
    );
    assert.equal(fetchMock.mock.callCount(), 2);
    for (const call of fetchMock.mock.calls)
      assert.equal(call.arguments[1]?.cache, 'no-store');
  });
  it('distinguishes a missing detail from unavailable services and does not parse error responses', async (t) => {
    for (const [status, message] of [
      [404, 'This page could not be found.'],
      [500, unavailable.message],
      [503, unavailable.message],
    ] as const) {
      const fetchMock = t.mock.method(
        globalThis,
        'fetch',
        async () => new Response('private diagnostics', { status }),
      );
      const parse = t.mock.fn(parseProject);
      await assert.rejects(
        getJson(
          'https://service.example/api/projects/missing',
          freshSignal(),
          parse,
        ),
        { message },
      );
      assert.equal(parse.mock.callCount(), 0);
      fetchMock.mock.restore();
    }
  });
  it('does not expose transport diagnostics to portfolio visitors', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('internal host connection details');
    });
    await assert.rejects(
      getJson(
        'https://service.example/api/profile',
        freshSignal(),
        parseProfile,
      ),
      unavailable,
    );
  });
  it('rejects malformed JSON and invalid fixture contracts without exposing schema internals', async (t) => {
    for (const body of [
      'not JSON',
      JSON.stringify([{ ...projectCatalog[0], demo: true }]),
      JSON.stringify([{ slug: 7 }]),
    ]) {
      const fetchMock = t.mock.method(
        globalThis,
        'fetch',
        async () => new Response(body),
      );
      await assert.rejects(
        getJson(
          'https://service.example/api/projects',
          freshSignal(),
          parseProjects,
        ),
        unavailable,
      );
      fetchMock.mock.restore();
    }
  });
  it('propagates navigation cancellation to the pending fetch without parsing stale data', async (t) => {
    const controller = new AbortController();
    const reason = new Error('Navigation changed');
    const parse = t.mock.fn(parseProfile);
    let requestSignal: AbortSignal | undefined;
    t.mock.method(
      globalThis,
      'fetch',
      (_url: Parameters<typeof fetch>[0], init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal!.addEventListener(
            'abort',
            () => reject(requestSignal!.reason),
            { once: true },
          );
        }),
    );
    const pending = getJson(
      'https://service.example/api/profile',
      controller.signal,
      parse,
    );
    controller.abort(reason);
    await assert.rejects(pending, (error) => error === reason);
    assert.equal(requestSignal?.aborted, true);
    assert.equal(parse.mock.callCount(), 0);
  });
  it('enforces the request deadline and presents a useful timeout message without waiting in real time', async (t) => {
    const deadline = new AbortController();
    t.mock.method(AbortSignal, 'timeout', (milliseconds: number) => {
      assert.equal(milliseconds, 12000);
      return deadline.signal;
    });
    t.mock.method(
      globalThis,
      'fetch',
      (_url: Parameters<typeof fetch>[0], init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init!.signal!.addEventListener(
            'abort',
            () => reject(init!.signal!.reason),
            { once: true },
          );
        }),
    );
    const pending = getJson(
      'https://service.example/api/profile',
      freshSignal(),
      parseProfile,
    );
    deadline.abort(new DOMException('Internal timeout detail', 'TimeoutError'));
    await assert.rejects(pending, {
      message: 'This section took too long to respond. Please try again.',
    });
  });
});

describe('frontend runtime service configuration', () => {
  it('resolves configuration from the remote asset base, not the shell origin', async (t) => {
    const config = {
      bffOrigin: 'https://api.example',
      shellOrigin: 'https://site.example',
    };
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json(config),
    );
    assert.deepEqual(
      await sliceConfig('https://remote.example/releases/v2/', freshSignal()),
      config,
    );
    assert.equal(
      fetchMock.mock.calls[0].arguments[0],
      'https://remote.example/releases/v2/runtime-config.json',
    );
  });
  it('rejects missing origins and unsupported protocols before a BFF request can be made', async (t) => {
    for (const config of [
      null,
      {},
      { bffOrigin: 'https://api.example' },
      { bffOrigin: 'file:///data', shellOrigin: 'https://site.example' },
      { bffOrigin: 'https://api.example', shellOrigin: 42 },
    ]) {
      const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
        Response.json(config),
      );
      await assert.rejects(
        sliceConfig('https://remote.example/', freshSignal()),
        unavailable,
      );
      assert.equal(fetchMock.mock.callCount(), 1);
      fetchMock.mock.restore();
    }
  });
});
