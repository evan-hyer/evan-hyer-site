import fs from 'node:fs/promises';
const paths = [
  'package.json',
  'apps/shell/package.json',
  ...['profile', 'projects', 'insights'].map(
    (n) => 'slices/' + n + '/package.json',
  ),
];
const manifests = await Promise.all(
  paths.map(async (p) => [p, JSON.parse(await fs.readFile(p, 'utf8'))]),
);
const names = [
  ...new Set(
    manifests.flatMap(([, m]) =>
      Object.entries({ ...m.dependencies, ...m.devDependencies })
        .filter(([, v]) => v === 'latest')
        .map(([k]) => k),
    ),
  ),
];
const versions = Object.fromEntries(
  await Promise.all(
    names.map(async (name) => {
      const r = await fetch('https://registry.npmjs.org/' + name + '/latest');
      if (!r.ok) throw new Error(name + ': ' + r.status);
      return [name, (await r.json()).version];
    }),
  ),
);
for (const [p, m] of manifests) {
  for (const key of ['dependencies', 'devDependencies'])
    for (const name in m[key])
      if (m[key][name] === 'latest') m[key][name] = versions[name];
  await fs.writeFile(p, JSON.stringify(m, null, 2) + '\n');
}
console.log(versions);
