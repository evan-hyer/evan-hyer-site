import { z } from 'zod';
export const names = ['profile', 'projects', 'insights', 'shell'] as const;
export type AppName = (typeof names)[number];
const origin = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.origin === value &&
      !url.username &&
      !url.password
    );
  }, 'Expected a bare HTTPS origin');
const outputs = z.object(
  Object.fromEntries(
    names.flatMap((name) => [
      [name + 'Url', origin],
      [
        name + 'Bucket',
        z
          .string()
          .regex(
            /^evan-hyer-site-\d{12}-[a-z0-9-]+-(shell|profile|projects|insights)$/,
          ),
      ],
      [name + 'Distribution', z.string().regex(/^[A-Z0-9]+$/)],
      ...(name === 'shell' ? [] : [[name + 'ApiUrl', origin]]),
    ]),
  ),
);
export function releaseConfiguration(value: unknown) {
  const parsed = z.object({ EvanHyerSite: outputs }).parse(value)
    .EvanHyerSite as Record<string, string>;
  const domains = names.map((name) => parsed[name + 'Url']);
  if (new Set(domains).size !== names.length)
    throw new Error('Each frontend needs its own origin');
  return names.map((name) => ({
    name,
    directory: name === 'shell' ? 'apps/shell/dist' : `slices/${name}/dist`,
    bucket: parsed[name + 'Bucket'],
    distribution: parsed[name + 'Distribution'],
    url: parsed[name + 'Url'],
    config:
      name === 'shell'
        ? {
            remotes: Object.fromEntries(
              names
                .filter((n) => n !== 'shell')
                .map((n) => [n, parsed[n + 'Url'] + '/mf-manifest.json']),
            ),
          }
        : { bffOrigin: parsed[name + 'ApiUrl'], shellOrigin: parsed.shellUrl },
  }));
}
export function assetPolicy(file: string) {
  if (file.includes('..') || file.startsWith('/') || file.includes('\\'))
    throw new Error('Invalid asset path');
  if (file.endsWith('.map') || file === 'mf-stats.json')
    return { publish: false, order: 0, cache: '' };
  const immutable = /\.[a-f0-9]{8,}\.(?:js|css|woff2?|png|svg)$/.test(file);
  return {
    publish: true,
    order:
      file === 'index.html'
        ? 3
        : file === 'mf-manifest.json'
          ? 2
          : file === 'runtime-config.json'
            ? 1
            : 0,
    cache: immutable
      ? 'public,max-age=31536000,immutable'
      : 'no-cache,max-age=0,must-revalidate',
  };
}
