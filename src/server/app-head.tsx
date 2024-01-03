import fontURL from '../client/fonts/code-latin.woff2';

export function AppHead() {
  return (
    <>
      <title>SVGOMG - SVGO's Missing GUI</title>
      <meta name="theme-color" content="#303f9f" />
      <link rel="preload" crossorigin="" as="font" href={fontURL} />
    </>
  );
}
