import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const args = process.argv.slice(2);
function getArgValue(flag: string): string | undefined {
  const eqPrefix = `${flag}=`;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1]) return args[i + 1];
    if (args[i].startsWith(eqPrefix)) return args[i].slice(eqPrefix.length);
  }
  return undefined;
}

const cliPort = Number(getArgValue('--port'));
const envPort = Number(process.env.PORT);
const defaultAppPort = Number(process.env.DEFAULT_APP_PORT) || 3000;
const nginxPort = Number(process.env.NGINX_PORT) || 0;
const resolvedEnvPort = envPort && (!nginxPort || envPort !== nginxPort) ? envPort : defaultAppPort;
const PORT = (Number.isFinite(cliPort) && cliPort > 0) ? cliPort : resolvedEnvPort;
const HOST = getArgValue('--host') || '0.0.0.0';

const app = express();
app.disable('x-powered-by');

app.get(['/', '/index.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const htmlPath = path.join(publicDir, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  const envUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
  const reqProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const reqHost = req.get('host');
  const origin = envUrl || (reqHost ? `${reqProto}://${reqHost}` : '');
  if (origin) {
    html = html.replace(/https:\/\/my-study-room-0710\.web\.app/g, origin);
  }
  res.send(html);
});

app.get(['/admin', '/admin/'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/sw.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(publicDir, 'sw.js'));
});

app.get('/manifest.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(publicDir, 'manifest.json'));
});

app.use(
  express.static(publicDir, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
    },
  })
);

app.use((_req, res) => {
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Study Room server listening on http://${HOST}:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  console.error(`Server failed to bind ${HOST}:${PORT}:`, err.message);
  process.exit(1);
});
