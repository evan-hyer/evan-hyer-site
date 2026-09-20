import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  standalone,
  type MountOptions,
} from '../../../packages/contract/src/index';

test('standalone navigation replaces roots, preserves route ownership, handles history, and cleans up on exit', (t) => {
  const element = {} as HTMLElement;
  const focus = t.mock.fn();
  const scrollTo = t.mock.fn();
  const assign = t.mock.fn();
  const location = { pathname: '/', assign };
  const events = new Map<string, () => void>();
  const history = {
    pushState: t.mock.fn((_state: object, _title: string, path: string) => {
      location.pathname = path;
    }),
  };
  const globals = {
    document: {
      getElementById: (id: string) => (id === 'app' ? element : { focus }),
    },
    location,
    history,
    window: { scrollTo },
    addEventListener: (name: string, listener: () => void) =>
      events.set(name, listener),
  };
  for (const [key, value] of Object.entries(globals)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const mounts: MountOptions[] = [];
  const unmounts: Array<ReturnType<typeof t.mock.fn>> = [];
  standalone(
    'projects',
    (target, options) => {
      assert.equal(target, element);
      if (mounts.length)
        assert.equal(
          unmounts.at(-1)!.mock.callCount(),
          1,
          'old root must be disposed before mounting',
        );
      mounts.push(options);
      const unmount = t.mock.fn();
      unmounts.push(unmount);
      return { unmount };
    },
    'https://portfolio.example',
  );
  assert.equal(mounts[0].route, '/');
  assert.equal(mounts[0].mode, 'full');
  mounts[0].navigate('/projects/track-changes');
  assert.equal(location.pathname, '/projects/track-changes');
  assert.equal(mounts[1].route, '/track-changes');
  assert.equal(focus.mock.callCount(), 1);
  assert.deepEqual(scrollTo.mock.calls[0].arguments, [0, 0]);
  mounts[1].navigate('/projects');
  assert.equal(mounts[2].route, '/');
  location.pathname = '/projects/external-api-request';
  events.get('popstate')!();
  assert.equal(mounts[3].route, '/external-api-request');
  assert.equal(
    history.pushState.mock.callCount(),
    2,
    'popstate must not add another history entry',
  );
  for (const path of ['/insights', '/projects-other', '/']) {
    mounts[3].navigate(path);
    assert.equal(
      String(assign.mock.calls.at(-1)!.arguments[0]),
      'https://portfolio.example' + path,
    );
    assert.equal(mounts.length, 4);
  }
  events.get('pagehide')!();
  assert.equal(unmounts[3].mock.callCount(), 1);
});
