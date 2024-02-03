import { optimize, CustomPlugin, PluginConfig } from 'svgo';
import exposeWorkerActions from '../../utils/exposeWorkerActions';
import { ProcessorOptimizeConfig, RenderableSVG } from '../../types';

const createDimensionsExtractor = () => {
  const dimensions = { width: 0, height: 0 };
  const plugin: CustomPlugin = {
    name: 'extract-dimensions',
    fn() {
      return {
        element: {
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

interface ExposeWorkerActionsArgs {
  source: string;
  optimizeConfig: ProcessorOptimizeConfig;
}

exposeWorkerActions({
  ready: () => true,

  optimize: ({
    source,
    optimizeConfig,
  }: ExposeWorkerActionsArgs): RenderableSVG => {
    const plugins: PluginConfig[] = [];

    for (const [name] of Object.entries(optimizeConfig.plugins)) {
      plugins.push({
        // Bit of a cheat on the types here.
        name: name as 'cleanupAttrs',
        params: {},
      });
    }

    const [dimensions, dimensionsExtractor] = createDimensionsExtractor();
    plugins.push(dimensionsExtractor);

    return {
      source: optimize(source, {
        plugins,
        js2svg: { pretty: Boolean(optimizeConfig.pretty), indent: '\t' },
      }).data,
      ...dimensions,
    };
  },

  getDimensions: ({
    source,
  }: {
    source: string;
  }): { width: number; height: number } => {
    const [dimensions, dimensionsExtractor] = createDimensionsExtractor();
    optimize(source, { plugins: [dimensionsExtractor] });
    return dimensions;
  },
});
