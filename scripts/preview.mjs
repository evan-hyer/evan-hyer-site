import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const name = process.argv[2];
const port = { shell: 3000, profile: 3001, projects: 3002, insights: 3003 }[
  name
];
if (!port) throw new Error('Unknown application');
const root = fileURLToPath(new URL('..', import.meta.url));
const dir = path.join(
  root,
  name === 'shell' ? 'apps/shell/dist' : 'slices/' + name + '/dist',
);
const app = express();
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.static(dir));
app.use((req, res) => {
  if (req.method === 'GET' && !path.extname(req.path) && req.accepts('html'))
    res.sendFile(path.join(dir, 'index.html'));
  else res.status(404).json({ error: 'Asset not found' });
});
const server = app.listen(port, '127.0.0.1', () =>
  console.log(name + ' preview: http://localhost:' + port),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    server.close();
    server.closeAllConnections();
  });
