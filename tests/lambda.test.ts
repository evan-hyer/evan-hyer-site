import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handler as profile } from '../slices/profile/bff/lambda';
import { handler as projects } from '../slices/projects/bff/lambda';
import { handler as insights } from '../slices/insights/bff/lambda';
import { Profile } from '../slices/profile/contracts/index';
import { Projects } from '../slices/projects/contracts/index';
import { Insights } from '../slices/insights/contracts/index';
async function invoke(handler: typeof profile, path: string, method = 'GET') {
  const [rawPath, rawQueryString = ''] = path.split('?');
  const response = await handler(
    {
      version: '2.0',
      routeKey: '$default',
      rawPath,
      rawQueryString,
      headers: {
        host: 'example.execute-api.us-east-1.amazonaws.com',
        origin: 'http://localhost:3000',
      },
      requestContext: {
        stage: '$default',
        requestId: 'unit-test',
        http: {
          method,
          path: rawPath,
          sourceIp: '127.0.0.1',
          protocol: 'HTTP/1.1',
        },
      },
      isBase64Encoded: false,
    },
    {} as Parameters<typeof handler>[1],
    () => {},
  );
  return {
    ...response,
    json: response.body
      ? JSON.parse(
          Buffer.from(
            response.body,
            response.isBase64Encoded ? 'base64' : 'utf8',
          ).toString(),
        )
      : undefined,
  };
}
for (const [name, handler, schema] of [
  ['profile', profile, Profile],
  ['projects', projects, Projects],
  ['insights', insights, Insights],
] as const) {
  test(
    name +
      ': actual Lambda adapter serves HTTP API v2 events, contracts, health, and errors',
    async () => {
      const data = await invoke(handler, '/api/' + name);
      assert.equal(data.statusCode, 200);
      schema.parse(data.json);
      assert.equal(
        data.headers['access-control-allow-origin'],
        'http://localhost:3000',
      );
      assert.equal((await invoke(handler, '/health')).json.status, 'ok');
      assert.equal(
        (await invoke(handler, '/api/' + name + '?unknown=1')).statusCode,
        400,
      );
      assert.equal((await invoke(handler, '/missing')).statusCode, 404);
      assert.equal(
        (await invoke(handler, '/api/' + name, 'POST')).statusCode,
        404,
      );
    },
  );
}
test('Lambda adapter preserves encoded filters, repeated query validation, and detail errors', async () => {
  const search = await invoke(
    projects,
    '/api/projects?search=TRACK%20CHANGES&tag=CLI',
  );
  assert.equal(search.statusCode, 200);
  assert.deepEqual(
    search.json.map((p: { slug: string }) => p.slug),
    ['track-changes'],
  );
  assert.equal(
    (await invoke(projects, '/api/projects?search=a&search=b')).statusCode,
    400,
  );
  assert.equal(
    (await invoke(projects, '/api/projects/track-changes')).json.title,
    'Track Changes',
  );
  assert.equal(
    (await invoke(projects, '/api/projects/unknown')).statusCode,
    404,
  );
  assert.equal((await invoke(projects, '/api/projects/%ZZ')).statusCode, 400);
});
