import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const port = Number(process.env.PORT) || 8080;
const root = resolve('dist');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

async function sendFile(response, filePath) {
  const extension = extname(filePath);
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const safePath = urlPath === '/' ? '/index.html' : urlPath;
    const filePath = join(root, safePath);

    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        return sendFile(response, filePath);
      }
    } catch {
      // Fall through to SPA fallback.
    }

    const indexHtml = await readFile(join(root, 'index.html'));
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(indexHtml);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Server error: ${error.message}`);
  }
});

server.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});