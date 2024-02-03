import presetDefault from 'svgo/plugins/preset-default';
import { builtin } from 'svgo/lib/builtin';

const virtualModuleId = 'virtual:svgo-plugin-data';
const resolvedVirtualModuleId = '\0' + virtualModuleId;

const inPresetDefault = new Set(presetDefault.groupedPlugins);

const plugins = new Set(
  // Start with plugins from presets, since they have a preferred order
  builtin.flatMap((plugin) => plugin.groupedPlugins || []),
);

// Add the rest
for (const plugin of builtin) {
  if (plugin.groupedPlugins) continue;
  plugins.add(plugin);
}

const svgoPluginData = Object.fromEntries(
  [...plugins].map((plugin) => {
    return [
      plugin.name,
      {
        title: plugin.title,
        default: inPresetDefault.has(plugin),
      },
    ];
  }),
);

export default function svgoPluginDataPlugin() {
  return {
    name: 'svgo-plugin-data-plugin', // required, will show up in warnings and errors
    resolveId(id) {
      if (id !== virtualModuleId) return;
      return resolvedVirtualModuleId;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return;
      return `export default ${JSON.stringify(svgoPluginData)}`;
    },
  };
}
