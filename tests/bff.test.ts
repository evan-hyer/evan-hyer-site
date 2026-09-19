import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp as profileApp } from '../slices/profile/bff/app';
import { createApp as projectsApp } from '../slices/projects/bff/app';
import { createApp as insightsApp } from '../slices/insights/bff/app';
import { Profile } from '../slices/profile/contracts/index';
import { Projects, Project } from '../slices/projects/contracts/index';
import { Insights, Insight } from '../slices/insights/contracts/index';
const factories = {
  profile: profileApp,
  projects: projectsApp,
  insights: insightsApp,
};
for (const [name, createApp] of Object.entries(factories)) {
  test(name + ': health, contract, CORS, and unknown endpoints', async () => {
    const app = createApp();
    const health = await request(app).get('/health').expect(200);
    assert.equal(health.body.service, name);
    assert.equal(health.body.status, 'ok');
    const data = await request(app)
      .get('/api/' + name)
      .set('Origin', 'http://localhost:3000')
      .expect(200);
    assert.equal(
      data.headers['access-control-allow-origin'],
      'http://localhost:3000',
    );
    ({ profile: Profile, projects: Projects, insights: Insights })[
      name as keyof typeof factories
    ].parse(data.body);
    await request(app)
      .get('/api/missing')
      .expect(404)
      .expect('Content-Type', /json/);
    await request(app)
      .get('/api/' + name + '?unknown=x')
      .expect(400);
  });
  test(name + ': deterministic failures leave health available', async () => {
    const app = createApp({ failRate: 1 });
    await request(app)
      .get('/api/' + name)
      .expect(503);
    await request(app).get('/health').expect(200);
    await request(createApp({ failRate: 0 }))
      .get('/api/' + name)
      .expect(200);
  });
  test(name + ': configurable delay and validation', async () => {
    const start = performance.now();
    await request(createApp({ delayMs: 40 }))
      .get('/api/' + name)
      .expect(200);
    assert.ok(performance.now() - start >= 35);
    assert.throws(() => createApp({ failRate: 2 }));
    assert.throws(() => createApp({ delayMs: -1 }));
  });
}
test('projects: search is case-insensitive, tags combine with search, and empty results are valid', async () => {
  const app = projectsApp();
  const all = await request(app).get('/api/projects').expect(200);
  assert.equal(all.body.length, 4);
  const search = await request(app)
    .get('/api/projects')
    .query({ search: 'COMMON' })
    .expect(200);
  assert.equal(search.body[0].slug, 'common-ground');
  assert.equal(search.body.length, 1);
  const tag = await request(app)
    .get('/api/projects')
    .query({ tag: 'Product' })
    .expect(200);
  assert.equal(tag.body.length, 2);
  assert.ok(
    tag.body.every((p: { tags: string[] }) => p.tags.includes('Product')),
  );
  const combined = await request(app)
    .get('/api/projects')
    .query({ tag: 'Product', search: 'signals' })
    .expect(200);
  assert.equal(combined.body.length, 1);
  assert.equal(combined.body[0].slug, 'small-signals');
  assert.deepEqual(
    (await request(app).get('/api/projects?search=nonexistent').expect(200))
      .body,
    [],
  );
  await request(app).get('/api/projects?search=a&search=b').expect(400);
  await request(app)
    .get('/api/projects')
    .query({ search: 'x'.repeat(201) })
    .expect(400);
});
test('projects: detail lookup, missing, malformed requests', async () => {
  const app = projectsApp();
  Project.parse(
    (await request(app).get('/api/projects/common-ground').expect(200)).body,
  );
  await request(app).get('/api/projects/not-here').expect(404);
  await request(app).get('/api/projects/INVALID').expect(400);
  await request(app).get('/api/projects/%ZZ').expect(400);
  await request(app).get('/api/projects/common-ground?bad=1').expect(400);
});
test('insights: filter, detail, invalid and missing requests', async () => {
  const app = insightsApp();
  const filtered = await request(app)
    .get('/api/insights?topic=Engineering')
    .expect(200);
  assert.equal(filtered.body.length, 1);
  assert.equal(filtered.body[0].topic, 'Engineering');
  Insight.parse(
    (
      await request(app)
        .get('/api/insights/' + filtered.body[0].slug)
        .expect(200)
    ).body,
  );
  assert.deepEqual(
    (await request(app).get('/api/insights?topic=Unknown').expect(200)).body,
    [],
  );
  await request(app)
    .get('/api/insights?topic=Design&topic=Process')
    .expect(400);
  await request(app)
    .get('/api/insights')
    .query({ topic: 'x'.repeat(81) })
    .expect(400);
  await request(app).get('/api/insights/missing').expect(404);
  await request(app).get('/api/insights/BAD').expect(400);
});
test('fixtures explicitly label demo content and reject malformed contracts', async () => {
  for (const [app, schema] of [
    [projectsApp(), Projects],
    [insightsApp(), Insights],
  ] as const) {
    const endpoint = schema === Projects ? 'projects' : 'insights';
    const result = await request(app)
      .get('/api/' + endpoint)
      .expect(200);
    assert.ok(
      result.body.every((item: { demo: boolean }) => item.demo === true),
    );
    assert.equal(schema.safeParse([{ slug: 1 }]).success, false);
  }
});
