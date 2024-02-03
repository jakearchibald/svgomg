import { Signal } from '@preact/signals';

export interface OptimizeConfig {
  pretty: { enabled: Signal<boolean> };
  plugins: {
    [name: string]: {
      enabled: Signal<boolean>;
    };
  };
}

export interface ProcessorOptimizeConfig {
  pretty?: {};
  plugins: { [name: string]: {} };
}

export interface RenderableSVG {
  source: string;
  width: number;
  height: number;
}
