import fs from 'node:fs/promises';
import express from 'express';
import minimist from 'minimist';
import fetch from 'node-fetch';
import glob from 'fast-glob';

const argv = minimist(process.argv.slice(2));

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const isStaticBuild = argv.static;
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined;

// Create http server
const app = express();

// Add Vite or respective production middlewares
let vite;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

async function serveHTML(url, result, res) {
  let template;

  if (!isProduction) {
    // Always read fresh template in development
    template = await fs.readFile('./index.html', 'utf-8');
    template = await vite.transformIndexHtml(url, template);
  } else {
    template = templateHtml;
  }

  const html = template
    .replace(`<!--app-head-->`, result.head ?? '')
    .replace(`<!--app-html-->`, result.html ?? '');

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
}

async function serveJSON(body, res) {
  res.status(200).set({ 'Content-Type': 'application/json' }).end(body);
}

// Serve HTML
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    let render;
    if (!isProduction) {
      // Always read fresh template in development
      render = (await vite.ssrLoadModule('/src/server/index.tsx')).render;
    } else {
      render = (await import('./dist/server/index.js')).render;
    }

    const result = await render(url);

    if (result.type === 'html') {
      await serveHTML(url, result, res);
      return;
    }

    if (result.type === 'json') {
      await serveJSON(result.body, res);
      return;
    }

    throw new Error(`Unsupported result type: ${result.type}`);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start http server
const server = app.listen(port, async () => {
  if (!isStaticBuild) {
    console.log(`Server started at http://localhost:${port}`);
    return;
  }

  const base = `http://localhost:${port}/`;
  const paths = ['', 'manifest.json'];

  const fetchedResources = await Promise.all(
    paths.map(async (path) => {
      const response = await fetch(base + path);
      return [path, await response.text()];
    }),
  );

  await Promise.all(
    fetchedResources.map(async ([path, body]) => {
      const filePath = `./dist/client/${path || 'index.html'}`;
      await fs.mkdir(filePath.replace(/\/[^/]+$/, ''), {
        recursive: true,
      });
      await fs.writeFile(filePath, body);
    }),
  );

  await fs.cp(
    new URL('./dist/server/assets', import.meta.url),
    new URL('./dist/client/assets', import.meta.url),
    { recursive: true, overwrite: true },
  );

  server.close();
});

