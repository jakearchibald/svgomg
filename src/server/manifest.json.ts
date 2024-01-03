import iconURL from '../client/imgs/icon.png';
import maskableIconURL from '../client/imgs/maskable.png';

export function manifestJSON() {
  return {
    name: 'SVGOMG',
    scope: './',
    icons: [
      {
        src: iconURL,
        sizes: '600x600',
      },
      {
        src: maskableIconURL,
        sizes: '600x600',
        purpose: 'maskable',
      },
    ],
    background_color: '#bababa',
    display: 'standalone',
    start_url: './',
    theme_color: '#303f9f',
  };
}
