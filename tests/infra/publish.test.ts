import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { publishSite } from '../../scripts/publish';
import { names } from '../../scripts/release';
function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), 'site-publish-test-'));
  t.after(() => {
    assert.ok(
      resolve(root).startsWith(resolve(tmpdir()) + '\\') ||
        resolve(root).startsWith(resolve(tmpdir()) + '/'),
    );
    rmSync(root, { recursive: true, force: true });
  });
  const data: Record<string, string> = {};
  for (const name of names) {
    const directory = join(
      root,
      name === 'shell' ? 'apps/shell/dist' : `slices/${name}/dist`,
    );
    mkdirSync(directory, { recursive: true });
    for (const [file, content] of Object.entries({
      'index.html': '<html></html>',
      'runtime-config.json': '{}',
      'main.12345678.js': '/* bundled */',
      'main.12345678.js.map': '{}',
      'mf-stats.json': '{}',
    }))
      writeFileSync(join(directory, file), content);
    if (name !== 'shell') {
      writeFileSync(join(directory, 'remoteEntry.12345678.js'), '/* remote */');
      writeFileSync(
        join(directory, 'mf-manifest.json'),
        JSON.stringify({
          metaData: { remoteEntry: { name: 'remoteEntry.12345678.js' } },
        }),
      );
    }
    data[name + 'Url'] = `https://${name}.cloudfront.net`;
    data[name + 'ApiUrl'] =
      `https://${name}.execute-api.us-east-1.amazonaws.com`;
    data[name + 'Bucket'] = `evan-hyer-site-111111111111-us-east-1-${name}`;
    data[name + 'Distribution'] = 'E' + name.toUpperCase();
  }
  return { root, output: { EvanHyerSite: data } };
}
test('publisher promotes real files in dependency order, writes deployed config, and waits for each CDN', (t) => {
  const { root, output } = fixture(t);
  const calls: string[][] = [];
  publishSite(output, root, (...args) => {
    calls.push(args);
    return args[1] === 'create-invalidation'
      ? JSON.stringify({ Invalidation: { Id: 'I123' } })
      : '';
  });
  const uploads = calls.filter((args) => args[0] === 's3');
  assert.ok(
    uploads.every(
      (args) =>
        args[1] === 'cp' &&
        !args[3].endsWith('.map') &&
        !args[3].endsWith('mf-stats.json'),
    ),
  );
  assert.match(uploads.at(-1)![3], /shell\/index.html$/);
  for (const name of names) {
    const uploadsForApp = uploads.filter((args) =>
      args[3].includes('-' + name + '/'),
    );
    assert.match(uploadsForApp[0][3], /\.[a-f0-9]{8}\.js$/);
    assert.match(uploadsForApp[0][5], /immutable/);
    assert.match(uploadsForApp.at(-1)![3], /index.html$/);
    assert.match(uploadsForApp.at(-1)![5], /no-cache/);
    const wait = calls.findIndex(
      (args) => args[1] === 'wait' && args.includes('E' + name.toUpperCase()),
    );
    assert.ok(
      wait >
        calls.findIndex((args) =>
          args[3]?.endsWith('-' + name + '/index.html'),
        ),
    );
  }
  assert.deepEqual(
    JSON.parse(
      readFileSync(
        join(root, 'slices/projects/dist/runtime-config.json'),
        'utf8',
      ),
    ),
    {
      bffOrigin: output.EvanHyerSite.projectsApiUrl,
      shellOrigin: output.EvanHyerSite.shellUrl,
    },
  );
});
test('missing remote assets abort the complete publication before any AWS write', (t) => {
  const { root, output } = fixture(t);
  rmSync(join(root, 'slices/insights/dist/remoteEntry.12345678.js'));
  const run = t.mock.fn(() => '');
  assert.throws(
    () => publishSite(output, root, run),
    /Remote entry is missing/,
  );
  assert.equal(run.mock.callCount(), 0);
  assert.equal(
    readFileSync(join(root, 'slices/profile/dist/runtime-config.json'), 'utf8'),
    '{}',
  );
});
test('an upload failure stops promotion before manifests, shell, or invalidations are published', (t) => {
  const { root, output } = fixture(t);
  const run = t.mock.fn(() => {
    throw new Error('Upload failed');
  });
  assert.throws(() => publishSite(output, root, run), /Upload failed/);
  assert.equal(run.mock.callCount(), 1);
});
