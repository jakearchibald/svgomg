import { Signal } from '@preact/signals';

export interface PluginConfig {
  [name: string]: {
    enabled: Signal<boolean>;
  };
}

export interface ClonablePluginConfig {
  [name: string]: {
    enabled: boolean;
  };
}
