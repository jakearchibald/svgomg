export function createFileURL(data, type) {
  return window.URL.createObjectURL(
    new Blob([data], { type })
  );
}
