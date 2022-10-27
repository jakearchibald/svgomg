import { optimize } from 'svgo/dist/svgo.browser.js';

const createDimensionsExtractor = () => {
  const dimensions = {};
  const plugin = {
    type: 'visitor',
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

  return [dimensions, plugin];
};

function compress(svgInput, settings) {
  // setup plugin list
  const floatPrecision = Number(settings.floatPrecision);
  const transformPrecision = Number(settings.transformPrecision);
  const plugins = [];

  for (const [name, enabled] of Object.entries(settings.plugins)) {
    if (!enabled) continue;

    const plugin = {
      name,
      params: {},
    };

    // TODO: revisit this
    // 0 almost always breaks images when used on `cleanupNumericValues`.
    // Better to allow 0 for everything else, but switch to 1 for this plugin.
    plugin.params.floatPrecision =
      plugin.name === 'cleanupNumericValues' && floatPrecision === 0
        ? 1
        : floatPrecision;

    plugin.params.transformPrecision = transformPrecision;

    plugins.push(plugin);
  }

  // multipass optimization
  const [dimensions, extractDimensionsPlugin] = createDimensionsExtractor();
  const { data, error } = optimize(svgInput, {
    multipass: settings.multipass,
    plugins: [...plugins, extractDimensionsPlugin],
    js2svg: {
      indent: 2,
      pretty: settings.pretty,
    },
  });

  if (error) throw new Error(error);

  return { data, dimensions };
}

const actions = {
  wrapOriginal({ data }) {
    const [dimensions, extractDimensionsPlugin] = createDimensionsExtractor();
    const { error } = optimize(data, {
      plugins: [extractDimensionsPlugin],
    });

    if (error) throw new Error(error);

    return dimensions;
  },
  process({ data, settings }) {
    return compress(data, settings);
  },
};

self.onmessage = (event) => {
  try {
    self.postMessage({
      id: event.data.id,
      result: actions[event.data.action](event.data),
    });
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      error: error.message,
    });
  }
};
