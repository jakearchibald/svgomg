import renderToString from 'preact-render-to-string';
import { App } from '../client/app';
import { AppHead } from './app-head';
import { manifestJSON } from './manifest.json';

type RenderResult =
  | { type: 'html'; html: string; head?: string }
  | { type: 'json'; body: string };

export function render(url: string): RenderResult {
  if (url === 'manifest.json') {
    return { type: 'json', body: JSON.stringify(manifestJSON()) };
  }

  const html = renderToString(<App />);
  const head = renderToString(<AppHead />);
  return { type: 'html', html, head };
}
