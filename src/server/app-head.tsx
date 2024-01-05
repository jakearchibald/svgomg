import fontURL from '../client/fonts/code-latin.woff2';
import iconURL from '../client/imgs/icon.png';

const title = `SVGOMG - SVGO's Missing GUI`;
const description = 'Easy & visual compression of SVG images.';
const origin = import.meta.env.PROD ? 'https://jakearchibald.github.io' : '';

export function AppHead() {
  return (
    <>
      <title>{title}</title>
      <meta name="theme-color" content="#303f9f" />
      <link rel="preload" crossorigin="" as="font" href={fontURL} />
      <link rel="manifest" href="manifest.json" />
      <link rel="icon" href={iconURL} />
      <meta name="twitter:card" content="summary" />
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${origin}${iconURL}`} />
      <meta property="og:title" content={title} />
    </>
  );
}
