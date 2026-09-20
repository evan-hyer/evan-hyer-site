import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';
import {
  releaseConfiguration,
  assetPolicy,
  names,
} from '../../scripts/release';
const output = () => ({
  EvanHyerSite: Object.fromEntries(
    names.flatMap((name) => [
      [name + 'Url', `https://${name}.cloudfront.net`],
      [name + 'Bucket', `evan-hyer-site-111111111111-us-east-1-${name}`],
      [name + 'Distribution', 'E12345'],
      ...(name === 'shell'
        ? []
        : [
            [
              name + 'ApiUrl',
              `https://${name}.execute-api.us-east-1.amazonaws.com`,
            ],
          ]),
    ]),
  ),
});
test('release configuration wires each remote to its own API and publishes shell last', () => {
  const source = output();
  const plan = releaseConfiguration(source);
  assert.deepEqual(
    plan.map((p) => p.name),
    ['profile', 'projects', 'insights', 'shell'],
  );
  for (const item of plan.slice(0, 3))
    assert.deepEqual(item.config, {
      bffOrigin: source.EvanHyerSite[item.name + 'ApiUrl'],
      shellOrigin: source.EvanHyerSite.shellUrl,
    });
  assert.deepEqual(plan[3].config.remotes, {
    profile: 'https://profile.cloudfront.net/mf-manifest.json',
    projects: 'https://projects.cloudfront.net/mf-manifest.json',
    insights: 'https://insights.cloudfront.net/mf-manifest.json',
  });
});
test('invalid deployment outputs fail before publication', () => {
  for (const invalid of [undefined, {}, { EvanHyerSite: {} }])
    assert.throws(() => releaseConfiguration(invalid));
  for (const url of [
    'http://localhost:3000',
    'https://example.com/path',
    'https://user:secret@example.com',
    'javascript:alert(1)',
    'https://example.com?token=secret',
  ]) {
    const data = output();
    data.EvanHyerSite.projectsUrl = url;
    assert.throws(() => releaseConfiguration(data));
  }
  const duplicate = output();
  duplicate.EvanHyerSite.projectsUrl = duplicate.EvanHyerSite.shellUrl;
  assert.throws(() => releaseConfiguration(duplicate), /own origin/);
  const missing = output();
  delete missing.EvanHyerSite.projectsApiUrl;
  assert.throws(() => releaseConfiguration(missing));
});
test('release ordering makes assets available before manifests and documents', () => {
  assert.ok(
    assetPolicy('main.abcdef1234.js').order <
      assetPolicy('mf-manifest.json').order,
  );
  assert.ok(
    assetPolicy('runtime-config.json').order <
      assetPolicy('mf-manifest.json').order,
  );
  assert.ok(
    assetPolicy('mf-manifest.json').order < assetPolicy('index.html').order,
  );
  assert.match(assetPolicy('remoteEntry.12345678.js').cache, /immutable/);
  for (const file of [
    'index.html',
    'mf-manifest.json',
    'runtime-config.json',
    'remoteEntry.js',
    'favicon.svg',
  ])
    assert.match(assetPolicy(file).cache, /no-cache/);
  for (const file of ['main.abcdef1234.js.map', 'mf-stats.json'])
    assert.equal(assetPolicy(file).publish, false);
  for (const file of ['../secret', '/absolute', 'a\\b'])
    assert.throws(() => assetPolicy(file));
});
test('the actual CloudFront function rewrites routes but never masks missing assets', () => {
  const rewrite = runInNewContext(
    readFileSync('infra/spa-rewrite.js', 'utf8') + '\nhandler;',
  );
  for (const path of [
    '/',
    '/projects',
    '/projects/track-changes',
    '/insights/',
    '/does-not-exist',
  ]) {
    const request = {
      uri: path,
      querystring: { search: { value: 'apex' } },
      headers: { host: { value: 'example.com' } },
    };
    assert.equal(rewrite({ request }), request);
    assert.equal(request.uri, '/index.html');
    assert.equal(request.querystring.search.value, 'apex');
  }
  for (const path of [
    '/main.abc.js',
    '/runtime-config.json',
    '/mf-manifest.json',
    '/missing.js',
    '/favicon.svg',
  ])
    assert.equal(rewrite({ request: { uri: path } }).uri, path);
});
