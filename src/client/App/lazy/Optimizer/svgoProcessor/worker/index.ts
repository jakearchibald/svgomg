import { optimize, CustomPlugin } from 'svgo/dist/svgo.browser.js';

const createDimensionsExtractor = () => {
  const dimensions = { width: 0, height: 0 };
  const plugin: CustomPlugin = {
    name: 'extract-dimensions',
    fn() {
      return {
        element: {
          // Node, parentNode
          enter({ name, attributes }, { type }) {
            if (name === 'svg' && type === 'root') {
              if (
                attributes.width !== undefined &&
                attributes.height !== undefined
              ) {
                dimensions.width = Number.parseFloat(attributes.width);
                dimensions.height = Number.parseFloat(attributes.height);
              } else if (attributes.viewBox !== undefined) {
                const viewBox = attributes.viewBox.split(/,\s*|\s+/);
                dimensions.width = Number.parseFloat(viewBox[2]);
                dimensions.height = Number.parseFloat(viewBox[3]);
              }
            }
          },
        },
      };
    },
  };

  return [dimensions, plugin] as const;
};

const actions = {
  ready: () => true,

  getDimensions: ({
    source,
  }: {
    source: string;
  }): { width: number; height: number } => {
    const [dimensions, plugin] = createDimensionsExtractor();
    optimize(source, { plugins: [plugin] });
    return dimensions;
  },
};

addEventListener('message', (event) => {
  const { action, returnPort, ...args } = event.data;

  try {
    // @ts-ignore: Sorry, can't be arsed with you today
    const result = actions[action](args);
    returnPort.postMessage({ action: 'done', result });
  } catch (error: any) {
    returnPort.postMessage({ action: 'error', message: error.message });
  }
});
