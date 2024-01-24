const actions = {
  ready: () => true,
};

addEventListener('message', (event) => {
  const { action, returnPort, ...args } = event.data;

  try {
    // @ts-ignore: Sorry, can't be arsed with you today
    const result = actions[action](args);
    returnPort.postMessage({ action: 'done', result });
  } catch (error: any) {
    returnPort.postMessage({ action: 'error', message: error.message });
  }
});
