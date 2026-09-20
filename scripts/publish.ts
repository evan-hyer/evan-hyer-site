import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { releaseConfiguration, assetPolicy } from './release';
const aws = (...args: string[]) =>
  execFileSync('aws', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
export function publishSite(output: unknown, root = process.cwd(), run = aws) {
  const releases = releaseConfiguration(output).map((release) => ({
    ...release,
    directory: resolve(root, release.directory),
  }));
  // Validate every build before the first upload. No bucket deletions; older clients keep their chunks.
  const plans = releases.map((release) => {
    const files = readdirSync(release.directory, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(
          release.directory,
          join(entry.parentPath, entry.name),
        ).replaceAll('\\', '/'),
      );
    for (const required of [
      'index.html',
      'runtime-config.json',
      ...(release.name === 'shell' ? [] : ['mf-manifest.json']),
    ]) {
      if (!files.includes(required))
        throw new Error('Missing build file: ' + release.name + '/' + required);
    }
    if (release.name !== 'shell') {
      const manifest = JSON.parse(
        readFileSync(join(release.directory, 'mf-manifest.json'), 'utf8'),
      );
      if (!files.includes(manifest.metaData.remoteEntry.name))
        throw new Error('Remote entry is missing');
    }
    return {
      ...release,
      files: files
        .filter((file) => assetPolicy(file).publish)
        .sort((a, b) => assetPolicy(a).order - assetPolicy(b).order),
    };
  });
  for (const release of plans) {
    writeFileSync(
      join(release.directory, 'runtime-config.json'),
      JSON.stringify(release.config, null, 2) + '\n',
    );
    for (const file of release.files) {
      run(
        's3',
        'cp',
        join(release.directory, file),
        `s3://${release.bucket}/${file}`,
        '--cache-control',
        assetPolicy(file).cache,
        '--only-show-errors',
      );
    }
    const result = JSON.parse(
      run(
        'cloudfront',
        'create-invalidation',
        '--distribution-id',
        release.distribution,
        '--paths',
        '/index.html',
        '/runtime-config.json',
        '/mf-manifest.json',
        '/favicon.svg',
        '--output',
        'json',
      ),
    );
    run(
      'cloudfront',
      'wait',
      'invalidation-completed',
      '--distribution-id',
      release.distribution,
      '--id',
      result.Invalidation.Id,
    );
    console.log('Published ' + release.name + ': ' + release.url);
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  publishSite(
    JSON.parse(readFileSync(process.argv[2] || 'cdk-outputs.json', 'utf8')),
  );
}
