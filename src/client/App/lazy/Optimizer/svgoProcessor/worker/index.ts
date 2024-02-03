import { optimize, CustomPlugin, PluginConfig } from 'svgo';
import exposeWorkerActions from '../../utils/exposeWorkerActions';
import { ClonablePluginConfig } from '../../types';

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
  pluginConfig: ClonablePluginConfig;
}

exposeWorkerActions({
  ready: () => true,

  compress: ({ source, pluginConfig }: ExposeWorkerActionsArgs): string => {
    const plugins: PluginConfig[] = [];

    for (const [name, settings] of Object.entries(pluginConfig)) {
      if (!settings.enabled) continue;
      plugins.push({
        // Bit of a cheat on the types here.
        name: name as 'cleanupAttrs',
        params: {},
      });
    }

    return optimize(source, { plugins }).data;
  },

  getDimensions: ({
    source,
  }: {
    source: string;
  }): { width: number; height: number } => {
    const [dimensions, plugin] = createDimensionsExtractor();
    optimize(source, { plugins: [plugin] });
    return dimensions;
  },
});
