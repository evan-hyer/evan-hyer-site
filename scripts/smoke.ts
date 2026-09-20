import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { releaseConfiguration } from './release';
import { parseProfile } from '../slices/profile/contracts/index';
import { parseProjects } from '../slices/projects/contracts/index';
import { parseInsights } from '../slices/insights/contracts/index';
const releases = releaseConfiguration(
  JSON.parse(readFileSync(process.argv[2] || 'cdk-outputs.json', 'utf8')),
);
async function get(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  assert.equal(response.status, 200, url);
  return response;
}
for (const release of releases) {
  assert.deepEqual(
    await (await get(release.url + '/runtime-config.json')).json(),
    release.config,
  );
  assert.match(
    await (
      await get(
        release.url +
          (release.name === 'shell'
            ? '/projects/track-changes'
            : '/' + release.name),
      )
    ).text(),
    /<html/i,
  );
  const missing = await fetch(release.url + '/deliberately-missing.js', {
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    [403, 404].includes(missing.status),
    'Missing assets must not return SPA HTML',
  );
  if (release.name !== 'shell') {
    const manifest = await (
      await get(release.url + '/mf-manifest.json')
    ).json();
    await get(release.url + '/' + manifest.metaData.remoteEntry.name);
    const origin = release.config.bffOrigin!;
    assert.equal((await (await get(origin + '/health')).json()).status, 'ok');
    ({
      profile: parseProfile,
      projects: parseProjects,
      insights: parseInsights,
    })[release.name](await (await get(origin + '/api/' + release.name)).json());
  }
}
console.log(
  'Deployed routes, runtime configuration, manifests, assets, and API contracts passed.',
);
