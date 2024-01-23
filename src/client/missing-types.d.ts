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
