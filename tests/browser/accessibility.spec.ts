import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const [name, width, height] of [
  ['desktop', 1280, 900],
  ['mobile', 390, 844],
] as const) {
  test('section and detail accessibility at ' + name, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    for (const [path, heading] of [
      ['/profile', 'Hello, I’m Evan Hyer.'],
      ['/projects', 'Common Ground'],
      ['/projects/common-ground', 'The takeaway'],
      ['/insights', 'The space between components'],
      ['/insights/small-contracts-strong-boundaries', 'Test the disagreement'],
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole('heading', { name: heading, exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, path).toEqual([]);
      if (
        path === '/projects/common-ground' ||
        path === '/insights/small-contracts-strong-boundaries'
      ) {
        await page.screenshot({
          path:
            'test-results/' + path.split('/')[1] + '-detail-' + name + '.png',
          fullPage: true,
        });
      }
    }
  });
}
