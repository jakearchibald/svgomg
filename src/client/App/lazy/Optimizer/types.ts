import { Signal } from '@preact/signals';

export interface PluginConfig {
  [name: string]: {
    enabled: Signal<boolean>;
  };
}

export interface ProcessorPluginConfig {
  [name: string]: {};
}
