import { optimize } from 'svgo/dist/svgo.browser';

const createDimensionsExtracter = () => {
  const dimensions = {};
  const plugin = {
    type: 'visitor',
    name: 'extract-dimensions',
    fn: () => {
      return {
        element: {
          enter: (node, parentNode) => {
            if (node.name === 'svg' && parentNode.type === 'root') {
              if (node.attributes.width != null && node.attributes.height !== null) {
                dimensions.width = Number.parseFloat(node.attributes.width);
                dimensions.height = Number.parseFloat(node.attributes.height);
              } else if (node.attributes.viewBox != null) {
                const viewBox = node.attributes.viewBox.split(/(?:,\s*|\s+)/);
                dimensions.width = Number.parseFloat(viewBox[2]);
                dimensions.height = Number.parseFloat(viewBox[3]);
              }
            }
          }
        }
      };
    }
  };
  return [dimensions, plugin];
};

function* multipassCompress(settings) {
  // setup plugin list
  const floatPrecision = Number(settings.floatPrecision);
  const plugins = [];
  for (const [pluginName, active] of Object.entries(settings.plugins)) {
    if (active) {
      const plugin = {
        name: pluginName,
        params: {}
      };
      if (plugin.name === 'cleanupNumericValues' && floatPrecision === 0) {
        // 0 almost always breaks images when used on this plugin.
        // Better to allow 0 for everything else, but switch to 1 for this plugin.
        plugin.params.floatPrecision = 1;
      } else {
        plugin.params.floatPrecision = floatPrecision;
      }
      plugins.push(plugin);
    }
  }

  let previousSvg = null;
  let currentSvg = svgInput;

  // multipass optimization
  while (previousSvg == null || previousSvg.length !== currentSvg.length) {
    previousSvg = currentSvg;
    const [dimensions, extractDimensionsPlugin] = createDimensionsExtracter();
    const { data: svgOutput, error } = optimize(currentSvg, {
      plugins: [
        ...plugins,
        extractDimensionsPlugin,
      ],
      js2svg: {
        indent: '  ',
        pretty: settings.pretty
      }
    });
    if (error) {
      throw Error(error);
    }
    currentSvg = svgOutput;
    yield {
      data: svgOutput,
      dimensions
    };
  }
}

let svgInput;
let multipassInstance;

const actions = {
  load({ data }) {
    svgInput = data;
    const [dimensions, extractDimensionsPlugin] = createDimensionsExtracter();
    const { error } = optimize(data, {
      plugins: [extractDimensionsPlugin],
    });
    if (error) {
      throw Error(error);
    }

    return dimensions;
  },
  process({ settings }) {
    multipassInstance = multipassCompress(settings);
    return multipassInstance.next().value;
  },
  nextPass() {
    return multipassInstance.next().value;
  }
};

self.onmessage = event => {
  try {
    self.postMessage({
      id: event.data.id,
      result: actions[event.data.action](event.data)
    });
  }
  catch (e) {
    self.postMessage({
      id: event.data.id,
      error: e.message
    });
  }
};
