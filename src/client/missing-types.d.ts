interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
}

interface Document {
  startViewTransition(
    updateCallback: () => Promise<void> | void,
  ): ViewTransition;
}

interface CSSStyleDeclaration {
  viewTransitionName: string;
}

interface SVGOPluginData {
  [name: string]: {
    title: string;
    default: boolean;
  };
}

declare module 'virtual:svgo-plugin-data' {
  const value: SVGOPluginData;
  export default value;
}
