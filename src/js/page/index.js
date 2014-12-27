'use strict';

require("6to5/lib/6to5/transformation/transformers/es6-generators/runtime");

var SvgFile = require('./svg-file');

var utils = require('./utils');
var svgo = require('./svgo');
var svgOuput = new (require('./ui/svg-output'));
var codeOutput = new (require('./ui/code-output'));
var downloadButton = new (require('./ui/download-button'));
var results = new (require('./ui/results'));

document.querySelector('.status').appendChild(results.container);
//document.body.appendChild(downloadButton.container);
document.querySelector('.output').appendChild(svgOuput.container);
//document.body.appendChild(codeOutput.container);

var pluginInputs = Array.prototype.slice.call(
  document.querySelectorAll('.settings .plugins input')
);
var miscInputs = Array.prototype.slice.call(
  document.querySelectorAll('.settings .misc input')
);

function getSettings() {
  var settings = {
    plugins: {}
  };
  
  miscInputs.forEach(function(inputEl) {
    settings[inputEl.name] = inputEl.checked;
  });

  pluginInputs.forEach(function(inputEl) {
    settings.plugins[inputEl.name] = inputEl.checked;
  });

  return settings;
}

(async function() {
  var input = new SvgFile(await utils.get('test-svgs/tiger.svg'));
  var inputLoadPromise = input.text.then(t => svgo.load(t));
  var outputSvg;

  async function compress(inputSvg, settings) {
    var loadResult = await inputLoadPromise;

    if (settings.original) {
      svgOuput.setSvg(await inputSvg.url(), loadResult.width, loadResult.height);
      results.update(
        await inputSvg.size(settings.gzip),
        await inputSvg.size(settings.gzip)
      );
      return;
    }

    results.working();

    async function update() {
      if (outputSvg) outputSvg.release();
      outputSvg = new SvgFile(svgoResult.data);
      
      svgOuput.setSvg(await outputSvg.url(), svgoResult.info.width, svgoResult.info.height);
      codeOutput.setCode(svgoResult.data);
      downloadButton.setDownload(inputSvg.name, await outputSvg.url());

      results.update(
        await inputSvg.size(settings.gzip),
        await outputSvg.size(settings.gzip)
      );
    }

    var svgoResult = await svgo.process(settings);
    update();

    if (settings.multipass) {
      while (svgoResult = await svgo.nextPass()) {
        update();
      }
    }
  }

  var settingsEl = document.querySelector('.settings');

  settingsEl.addEventListener('mousedown', function(event) {
    event.preventDefault();
  });

  settingsEl.addEventListener('change', function(event) {
    compress(input, getSettings());
  });


  compress(input, getSettings());
}());