import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { RequestError } from './request-error';
export interface FailureMode {
  delayMs?: number;
  failRate?: number;
}
export function baseApp(name: string, mode: FailureMode = {}) {
  const delayMs =
    mode.delayMs ?? Number(process.env[name.toUpperCase() + '_DELAY_MS'] || 0);
  const failRate =
    mode.failRate ??
    Number(process.env[name.toUpperCase() + '_FAIL_RATE'] || 0);
  if (
    !Number.isFinite(delayMs) ||
    delayMs < 0 ||
    delayMs > 30000 ||
    !Number.isFinite(failRate) ||
    failRate < 0 ||
    failRate > 1
  )
    throw new Error(
      'Invalid failure mode: delay must be 0–30000 ms and fail rate 0–1.',
    );
  const app = express();
  app.disable('x-powered-by');
  const origins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003'
  ).split(',');
  app.use(cors({ origin: origins }));
  app.get('/health', (_req, res) =>
    res.json({ service: name, status: 'ok', delayMs, failRate }),
  );
  app.use('/api', (_req, res, next) => {
    const respond = () => {
      if (res.destroyed) return;
      if (Math.random() < failRate)
        res
          .status(503)
          .json({ error: 'Demonstration service failure. Please retry.' });
      else next();
    };
    if (delayMs) {
      const timer = setTimeout(respond, delayMs);
      res.on('close', () => clearTimeout(timer));
    } else respond();
  });
  return app;
}
export function finishApp(app: ReturnType<typeof baseApp>) {
  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof RequestError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(error instanceof URIError ? 400 : 500).json({
      error:
        error instanceof URIError
          ? 'Invalid URL.'
          : 'Unexpected service error.',
    });
  };
  app.use(errors);
  return app;
}
export function listen(
  app: ReturnType<typeof baseApp>,
  name: string,
  defaultPort: number,
) {
  const port = Number(process.env[name.toUpperCase() + '_PORT'] || defaultPort);
  const server = app.listen(port, '127.0.0.1', () =>
    console.log(name + ' BFF: http://localhost:' + port),
  );
  for (const signal of ['SIGINT', 'SIGTERM'] as const)
    process.on(signal, () => {
      server.close();
      server.closeAllConnections();
    });
}
