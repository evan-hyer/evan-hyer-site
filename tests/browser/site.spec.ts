import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const loaded = async (page: Page) => {
  await expect(page.getByTestId('profile-content')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'The space between components',
      exact: true,
    }),
  ).toBeVisible();
};
test('homepage mounts React 19, React 18 and Vue together without runtime errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await loaded(page);
  await expect(page.getByTestId('profile-content')).toHaveAttribute(
    'data-version',
    '19.3.0',
  );
  await expect(page.getByTestId('projects-content')).toHaveAttribute(
    'data-version',
    '18.3.1',
  );
  await expect(page.getByTestId('insights-content')).toHaveAttribute(
    'data-version',
    '3.5.43',
  );
  await expect(page.getByTestId('insights-content')).toHaveAttribute(
    'data-framework',
    'Vue',
  );
  if (process.env.TEST_PREVIEW)
    await expect(page.getByText('Development architecture')).toHaveCount(0);
  else {
    await page.getByText('Development architecture').click();
    await expect(page.getByText('Shell: React 19.3.0')).toBeVisible();
    await expect(page.getByText(/React 18.3.1 · BFF online/)).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test('project search, filters, details, browser history and refresh', async ({
  page,
}) => {
  await page.goto('/projects');
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Search projects', { exact: true }).fill('svelte');
  await expect(
    page.getByRole('heading', { name: 'Svelte Web Component', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Search projects', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Salesforce', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('3 projects');
  await page
    .getByRole('heading', { name: 'LWC Observer Patterns', exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects\/lwc-observer-patterns$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'LWC Observer Patterns',
  );
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'View repository on GitHub' }),
  ).toHaveAttribute('href', 'https://github.com/evan-hyer/LWC_ObserverPattern');
  await expect(
    page.getByRole('link', { name: 'Read the source README' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/evan-hyer/LWC_ObserverPattern/blob/main/README.md',
  );
  await expect(
    page.getByRole('heading', { name: 'The question' }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByLabel('Search projects', { exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'LWC Observer Patterns',
  );
});
test('insight topics and article routes', async ({ page }) => {
  await page.goto('/insights');
  await page.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Small contracts, strong boundaries' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The space between components' }),
  ).toHaveCount(0);
  await page
    .getByRole('heading', { name: 'Small contracts, strong boundaries' })
    .click();
  await expect(page).toHaveURL(
    /\/insights\/small-contracts-strong-boundaries$/,
  );
  await expect(
    page.getByRole('heading', { name: 'Agree on the doorway' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Test the disagreement' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '← All insights' }).click();
  await expect(page.getByRole('button', { name: 'All topics' })).toBeVisible();
});
for (const [name, port, heading] of [
  ['profile', 3001, 'Thoughtful work.'],
  ['projects', 3002, 'Track Changes'],
  ['insights', 3003, 'The space between components'],
] as const) {
  test(
    name + ' standalone uses its own BFF and supports direct routes',
    async ({ page }) => {
      const apiUrls: string[] = [];
      page.on('request', (r) => {
        if (r.url().includes('/api/')) apiUrls.push(r.url());
      });
      await page.goto('http://localhost:' + port);
      await expect(
        page.getByRole('heading', { name: new RegExp(heading) }).first(),
      ).toBeVisible();
      if (name !== 'profile') {
        await page.getByRole('heading', { name: heading, exact: true }).click();
        await page.reload();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          heading,
        );
      }
      expect(apiUrls.length).toBeGreaterThan(0);
      expect(
        apiUrls.every((url) =>
          url.startsWith('http://localhost:' + (port + 1000) + '/api/'),
        ),
      ).toBe(true);
    },
  );
}
test('an unavailable remote is isolated and retry recovers', async ({
  page,
}) => {
  await page.route('http://localhost:3002/**', (r) => r.abort());
  await page.goto('/');
  await expect(
    page.getByText('Projects could not be loaded.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByTestId('profile-content')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The space between components' }),
  ).toBeVisible();
  await page.unroute('http://localhost:3002/**');
  await page
    .locator('[data-slice="projects"]')
    .getByRole('button', { name: 'Try again' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
});
for (const [name, port, title] of [
  ['profile', 4001, 'Thoughtful work.'],
  ['projects', 4002, 'Track Changes'],
  ['insights', 4003, 'The space between components'],
] as const) {
  test(
    name + ' BFF failure stays local and retry recovers',
    async ({ page }) => {
      await page.route('http://localhost:' + port + '/api/**', (r) =>
        r.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"error":"demonstration failure"}',
        }),
      );
      await page.goto('/');
      const slot = page.locator('[data-slice="' + name + '"]');
      await expect(slot.getByRole('alert')).toBeVisible();
      const other =
        name === 'projects' ? 'The space between components' : 'Track Changes';
      await expect(
        page.getByRole('heading', { name: other, exact: true }),
      ).toBeVisible();
      await page.unroute('http://localhost:' + port + '/api/**');
      await slot.getByRole('button', { name: 'Try again' }).click();
      await expect(
        page.getByRole('heading', { name: new RegExp(title) }).first(),
      ).toBeVisible();
    },
  );
}
test('repeated mount/unmount cancels stale work without duplicate roots or hook errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await loaded(page);
  for (let i = 0; i < 4; i++) {
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Projects', exact: true })
      .click();
    await expect(
      page.getByLabel('Search projects', { exact: true }),
    ).toBeVisible();
    await page.getByLabel('Search projects', { exact: true }).fill('track');
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Insights', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'All topics' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Evan Hyer home' }).click();
    await loaded(page);
    for (const name of ['profile', 'projects', 'insights'])
      await expect(page.getByTestId(name + '-content')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});
test('late BFF responses cannot resurrect an unmounted slice', async ({
  page,
}) => {
  await page.route('http://localhost:4002/api/**', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await r.continue().catch(() => {});
  });
  await page.goto('/projects');
  await expect(page.getByText('Loading projects…')).toBeVisible();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Insights', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'The space between components' }),
  ).toBeVisible();
  await page.waitForTimeout(1700);
  await expect(page.getByTestId('projects-content')).toHaveCount(0);
});
test('empty search and invalid routes are recoverable', async ({ page }) => {
  await page.goto('/projects');
  await page
    .getByLabel('Search projects', { exact: true })
    .fill('nothing-matches-this');
  await expect(
    page.getByText('No projects match these filters.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await page.goto('/projects/not-a-project');
  await expect(page.getByText('This page could not be found.')).toBeVisible();
  await page.getByRole('link', { name: '← All projects' }).click();
  await expect(
    page.getByRole('heading', { name: 'Track Changes', exact: true }),
  ).toBeVisible();
  await page.goto('/does-not-exist');
  await expect(
    page.getByRole('heading', { name: 'Nothing here just yet.' }),
  ).toBeVisible();
});
test('desktop and mobile accessibility, keyboard navigation, and screenshots', async ({
  page,
}) => {
  await page.goto('/');
  await loaded(page);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const desktop = await new AxeBuilder({ page }).analyze();
  expect(desktop.violations).toEqual([]);
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const mobile = await new AxeBuilder({ page }).analyze();
  expect(mobile.violations).toEqual([]);
  await page.screenshot({
    path: 'test-results/home-mobile.png',
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
});
