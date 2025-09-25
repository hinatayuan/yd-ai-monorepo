import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

runNodeScript('scripts/build-packages.mjs');
runNodeScript('scripts/build-app.mjs');

const distRoot = join(process.cwd(), 'apps', 'yd-app', 'dist');
const port = process.env.PORT ? Number(process.env.PORT) : 4173;

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon']
]);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = normalize(url.pathname);
  if (pathname === '/' || pathname === '\\') {
    pathname = '/index.html';
  }

  const filePath = join(distRoot, pathname);

  try {
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const content = readFileSync(filePath);
    const type = mimeTypes.get(extname(filePath)) ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Server error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.listen(port, () => {
  console.log(`开发服务器已启动：http://localhost:${port}`);
});

function runNodeScript(file) {
  const result = spawnSync('node', [file], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
