import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const result = spawnSync(
  process.execPath,
  [require.resolve('@playwright/test/cli'), 'test'],
  { stdio: 'inherit', env: { ...process.env, TEST_PREVIEW: '1' } },
);
process.exit(result.status || 0);
