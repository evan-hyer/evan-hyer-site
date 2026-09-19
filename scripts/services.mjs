import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const [mode = 'dev', only, webOnly] = process.argv.slice(2);
if (
  !['dev', 'preview'].includes(mode) ||
  (only && !['shell', 'profile', 'projects', 'insights'].includes(only))
)
  throw new Error(
    'Usage: services.mjs dev|preview [shell|profile|projects|insights]',
  );
const names = only ? [only] : ['shell', 'profile', 'projects', 'insights'];
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 750).unref();
}
function start(args, name, extra = {}) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extra },
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(name, error);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(
        name +
          ' exited (' +
          code +
          '). Other services remain running; restart this service in a separate terminal.',
      );
      if (
        children.every(
          (process) => process.exitCode !== null || process.signalCode !== null,
        )
      )
        stop(code || 1);
    }
  });
}
for (const name of names) {
  if (mode === 'dev')
    start(
      [
        fileURLToPath(
          new URL('../node_modules/@rspack/cli/bin/rspack.js', import.meta.url),
        ),
        'serve',
        '--config',
        'rspack.config.cjs',
        '--mode',
        'development',
      ],
      name,
      { APP: name },
    );
  else start(['scripts/preview.mjs', name], name);
  if (name !== 'shell' && webOnly !== 'web')
    start(
      ['--import', 'tsx', 'slices/' + name + '/bff/index.ts'],
      name + ' BFF',
    );
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
