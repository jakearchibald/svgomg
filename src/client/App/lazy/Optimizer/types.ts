import { Signal } from '@preact/signals';

export interface PluginConfig {
  [name: string]: {
    enabled: Signal<boolean>;
  };
}

export interface ProcessorPluginConfig {
  [name: string]: {};
}

export interface RenderableSVG {
  source: string;
  width: number;
  height: number;
}
