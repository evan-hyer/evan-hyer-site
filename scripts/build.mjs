import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
for (const name of process.argv[2]
  ? [process.argv[2]]
  : ['shell', 'profile', 'projects', 'insights']) {
  if (!['shell', 'profile', 'projects', 'insights'].includes(name))
    throw new Error('Unknown app');
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL('../node_modules/@rspack/cli/bin/rspack.js', import.meta.url),
      ),
      'build',
      '--config',
      'rspack.config.cjs',
      '--mode',
      'production',
    ],
    { cwd: root, stdio: 'inherit', env: { ...process.env, APP: name } },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
