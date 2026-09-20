import { test, expect } from '@playwright/test';
import type { RemoteModule } from '../../packages/contract/src/index';
interface FederationInstance {
  name: string;
  shareScopeMap: Record<string, Record<string, Record<string, unknown>>>;
  loadRemote(id: string): Promise<RemoteModule>;
}
declare global {
  interface Window {
    __FEDERATION__: { __INSTANCES__: FederationInstance[] };
    testUnmounts?: Array<() => void>;
  }
}
for (const [name, port, title] of [
  ['profile', 3001, 'Thoughtful work.'],
  ['insights', 3003, 'The space between components'],
] as const) {
  test(
    name + ' remote outage is isolated and recoverable',
    async ({ page }) => {
      await page.route('http://localhost:' + port + '/**', (route) =>
        route.abort(),
      );
      await page.goto('/');
      const slot = page.locator('[data-slice="' + name + '"]');
      await expect(slot.getByRole('alert')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Track Changes', exact: true }),
      ).toBeVisible();
      await page.unroute('http://localhost:' + port + '/**');
      await slot.getByRole('button', { name: 'Try again' }).click();
      await expect(
        page.getByRole('heading', { name: new RegExp(title) }).first(),
      ).toBeVisible();
    },
  );
}
test('dedicated routes load only their own remote and BFF', async ({
  page,
}) => {
  const ports = new Set<string>();
  page.on('request', (request) => {
    ports.add(new URL(request.url()).port);
  });
  await page.goto('/projects');
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  expect(ports.has('3002')).toBe(true);
  expect(ports.has('4002')).toBe(true);
  for (const port of ['3001', '3003', '4001', '4003'])
    expect(ports.has(port)).toBe(false);
});
test('React scopes remain separate and mounting the same container is idempotent', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'The space between components',
      exact: true,
    }),
  ).toBeVisible();
  const scopes = await page.evaluate(() => {
    const host = window.__FEDERATION__.__INSTANCES__.find(
      (instance) => instance.name === 'eh_shell',
    )!;
    return Object.fromEntries(
      Object.entries(host.shareScopeMap).map(([scope, packages]) => [
        scope,
        Object.keys(packages.react || {}),
      ]),
    );
  });
  expect(scopes.default).toEqual(['19.3.0']);
  expect(scopes.react18).toEqual(['18.3.1']);
  await page.evaluate(async () => {
    const host = window.__FEDERATION__.__INSTANCES__.find(
      (instance) => instance.name === 'eh_shell',
    )!;
    const dock = document.createElement('section');
    dock.id = 'test-mounts';
    document.body.append(dock);
    window.testUnmounts = [];
    for (const name of ['profile', 'projects', 'insights']) {
      const remote = await host.loadRemote('eh_' + name + '/mount');
      const element = document.createElement('div');
      dock.append(element);
      const options = {
        route: '/',
        mode: 'summary' as const,
        navigate: () => {},
      };
      const old = remote.mount(element, options);
      const latest = remote.mount(element, options);
      old.unmount();
      old.unmount();
      window.testUnmounts.push(() => {
        latest.unmount();
        latest.unmount();
      });
    }
  });
  const dock = page.locator('#test-mounts');
  for (const name of ['profile', 'projects', 'insights'])
    await expect(dock.getByTestId(name + '-content')).toHaveCount(1);
  await expect(
    dock.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await expect(
    dock.getByRole('heading', {
      name: 'The space between components',
      exact: true,
    }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.testUnmounts?.forEach((unmount) => unmount());
  });
  await expect(dock).toHaveText('');
  expect(errors).toEqual([]);
});
test('shell configuration failure has a working retry', async ({ page }) => {
  await page.route('http://localhost:3000/runtime-config.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText(
    'The site configuration could not be loaded.',
  );
  await page.unroute('http://localhost:3000/runtime-config.json');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
});
test('standalone configuration failure recovers and cross-slice links use the shell', async ({
  page,
}) => {
  await page.route('http://localhost:3001/runtime-config.json', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto('http://localhost:3001');
  await expect(
    page.getByRole('heading', { name: 'Unable to start this page' }),
  ).toBeVisible();
  await page.unroute('http://localhost:3001/runtime-config.json');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('link', { name: 'Explore projects' }).click();
  await expect(page).toHaveURL('http://localhost:3000/projects');
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
});
