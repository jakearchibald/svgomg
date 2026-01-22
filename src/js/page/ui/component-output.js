import { strToEl } from '../utils.js';
import { generateReactComponentFromSvg } from '../svg-to-jsx.js';

const suggestNameFromFilename = (filename) => {
  if (!filename) return '';
  const base = filename.replace(/\.[a-z\d]+$/i, '');
  return base
    .replace(/[^a-zA-Z\d]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const getFileExtension = (fileName) => {
  if (fileName.toLowerCase().endsWith('.tsx')) return 'tsx';
  if (fileName.toLowerCase().endsWith('.jsx')) return 'jsx';
  return 'txt';
};

const saveTextFile = async ({ fileName, content }) => {
  const showSaveFilePicker = window.showSaveFilePicker;

  if (showSaveFilePicker) {
    const extension = getFileExtension(fileName);
    const handle = await showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: extension.toUpperCase(),
          accept: { 'text/plain': [`.${extension}`] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const pre = document.createElement('pre');
  pre.textContent = text;
  document.body.append(pre);
  getSelection().removeAllRanges();

  const range = document.createRange();
  range.selectNode(pre);
  getSelection().addRange(range);
  document.execCommand('copy');
  getSelection().removeAllRanges();
  pre.remove();
};

export default class ComponentOutput {
  constructor() {
    // prettier-ignore
    this.container = strToEl(
      '<div class="component-output">' +
        '<div class="component-output-toolbar">' +
          '<label class="component-output-field">' +
            '<span class="component-output-label">Name</span>' +
            '<input class="component-output-input component-output-name" type="text" spellcheck="false" placeholder="e.g. NewFeature" />' +
          '</label>' +
          '<label class="component-output-field">' +
            '<span class="component-output-label">Format</span>' +
            '<select class="component-output-input component-output-format">' +
              '<option value="tsx" selected>TSX</option>' +
              '<option value="jsx">JSX</option>' +
            '</select>' +
          '</label>' +
          '<label class="component-output-toggle">' +
            '<input class="component-output-currentcolor" type="checkbox" />' +
            'currentColor' +
          '</label>' +
          '<button class="unbutton component-output-btn component-output-generate" type="button">Generate</button>' +
          '<button class="unbutton component-output-btn component-output-save" type="button" disabled>Save</button>' +
          '<button class="unbutton component-output-btn component-output-copy" type="button" disabled>Copy</button>' +
        '</div>' +
        '<div class="component-output-messages">' +
          '<div class="component-output-error" role="status" aria-live="polite"></div>' +
          '<div class="component-output-status" role="status" aria-live="polite"></div>' +
        '</div>' +
        '<textarea class="component-output-text" readonly spellcheck="false"></textarea>' +
      '</div>'
    );

    this._svgFile = null;
    this._generated = null;
    this._autoRegenerate = false;

    this._nameInput = this.container.querySelector('.component-output-name');
    this._formatSelect = this.container.querySelector(
      '.component-output-format'
    );
    this._currentColorInput = this.container.querySelector(
      '.component-output-currentcolor'
    );
    this._generateBtn = this.container.querySelector(
      '.component-output-generate'
    );
    this._saveBtn = this.container.querySelector('.component-output-save');
    this._copyBtn = this.container.querySelector('.component-output-copy');
    this._errorEl = this.container.querySelector('.component-output-error');
    this._statusEl = this.container.querySelector('.component-output-status');
    this._textArea = this.container.querySelector('.component-output-text');

    this._nameInput.addEventListener('input', () => this._onOptionsChange());
    this._formatSelect.addEventListener('change', () =>
      this._onOptionsChange()
    );
    this._currentColorInput.addEventListener('change', () =>
      this._onOptionsChange()
    );

    this._generateBtn.addEventListener('click', () => this._generate());
    this._saveBtn.addEventListener('click', () => this._save());
    this._copyBtn.addEventListener('click', () => this._copy());
  }

  setInputFilename(filename) {
    if (!this._nameInput.value.trim()) {
      this._nameInput.value = suggestNameFromFilename(filename);
    }
  }

  setSvg(svgFile) {
    this._svgFile = svgFile;

    if (this._autoRegenerate) {
      this._generate({ preserveStatus: true });
    } else {
      this._setGenerated(null);
    }
  }

  reset() {
    this._svgFile = null;
    this._setGenerated(null);
    this._setError(null);
    this._setStatus(null);
    this._autoRegenerate = false;
  }

  _onOptionsChange() {
    if (!this._autoRegenerate) {
      this._setGenerated(null);
      return;
    }

    this._generate({ preserveStatus: true });
  }

  _setError(message) {
    this._errorEl.textContent = message || '';
  }

  _setStatus(message) {
    this._statusEl.textContent = message || '';
  }

  _setGenerated(nextGenerated) {
    this._generated = nextGenerated;
    this._textArea.value = nextGenerated?.componentSource ?? '';
    const hasGenerated = Boolean(nextGenerated);
    this._saveBtn.disabled = !hasGenerated;
    this._copyBtn.disabled = !hasGenerated;
  }

  _generate({ preserveStatus = false } = {}) {
    if (!preserveStatus) {
      this._setError(null);
      this._setStatus(null);
    }

    const name = this._nameInput.value;
    const svgMarkup = this._svgFile?.text;

    if (!svgMarkup) {
      this._setGenerated(null);
      this._setError('Load an SVG first.');
      return;
    }

    try {
      const generated = generateReactComponentFromSvg(name, svgMarkup, {
        typescript: this._formatSelect.value === 'tsx',
        convertPaintToCurrentColor: this._currentColorInput.checked,
      });

      this._autoRegenerate = true;
      this._setGenerated(generated);
      this._setError(null);
      if (!preserveStatus) this._setStatus(`Generated ${generated.fileName}`);
    } catch (error) {
      this._setGenerated(null);
      this._setError(
        error instanceof Error ? error.message : 'Failed to generate component.'
      );
    }
  }

  async _save() {
    if (!this._generated) return;

    this._setError(null);
    this._setStatus(null);

    try {
      await saveTextFile({
        fileName: this._generated.fileName,
        content: this._generated.componentSource,
      });
      this._setStatus(`Saved ${this._generated.fileName}`);
    } catch (error) {
      this._setError(
        error instanceof Error ? error.message : 'Failed to save file.'
      );
    }
  }

  async _copy() {
    if (!this._generated) return;

    this._setError(null);
    this._setStatus(null);

    try {
      await copyText(this._generated.componentSource);
      this._setStatus(`Copied ${this._generated.fileName}`);
    } catch (error) {
      this._setError(
        error instanceof Error ? error.message : 'Failed to copy.'
      );
    }
  }
}
