'use strict';
require("6to5/lib/6to5/transformation/transformers/es6-generators/runtime");

var testSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="5.0 -10.0 100.0 135.0" enable-background="new 0 0 100 100" xml:space="preserve">' + 
  '<script>localStorage.setItem("foo", "bar")</script>' +
  '<g><path d="M35.845,61.275l-10.72-5.09c-1.209-0.572-1.94-1.463-1.94-2.703v-0.318c0-1.24,0.731-2.131,1.94-2.704l10.72-5.089   c0.381-0.191,0.731-0.318,1.177-0.318c1.018-0.031,1.94,0.859,1.94,2.004c0,0.922-0.509,1.559-1.336,1.94l-9.606,4.294l9.606,4.295   c0.827,0.381,1.336,1.113,1.336,2.004c0,1.177-0.922,2.004-2.1,1.972C36.513,61.562,36.163,61.435,35.845,61.275z"/><path d="M41.889,66.047l12.438-25.988c0.35-0.731,0.922-1.113,1.686-1.113c1.018,0,1.876,0.859,1.876,1.813   c0,0.35-0.127,0.7-0.222,0.923L45.229,67.669c-0.35,0.731-0.922,1.113-1.686,1.113c-1.018,0-1.876-0.858-1.876-1.813   C41.667,66.619,41.793,66.27,41.889,66.047z"/><path d="M64.155,45.371l10.72,5.089c1.208,0.573,1.94,1.464,1.94,2.704v0.318c0,1.24-0.731,2.131-1.94,2.703l-10.72,5.09   c-0.381,0.191-0.731,0.318-1.177,0.318c-1.018,0.031-1.94-0.859-1.94-2.004c0-0.923,0.509-1.559,1.336-1.94l9.606-4.295   l-9.606-4.294c-0.827-0.381-1.336-1.113-1.336-2.004c0-1.177,0.923-2.004,2.1-1.973C63.487,45.084,63.837,45.212,64.155,45.371z"/></g><path d="M92.5,21c0-1.657-1.343-3-3-3h-80c-1.657,0-3,1.343-3,3v59c0,1.657,1.343,3,3,3h80c1.657,0,3-1.343,3-3V21z M26,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S24.804,20.833,26,20.833z M20,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S18.804,20.833,20,20.833z M14,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S12.804,20.833,14,20.833z M88.5,79h-78V29h78V79z  "/><text x="0.0" y="117.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">Created by buzzyrobot</text><text x="0.0" y="122.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">from the Noun Project</text></svg>';
var testSvgNoWidthHeight = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="5.0 -10.0 100.0 135.0" enable-background="new 0 0 100 100" xml:space="preserve">' + 
  '<g><path d="M35.845,61.275l-10.72-5.09c-1.209-0.572-1.94-1.463-1.94-2.703v-0.318c0-1.24,0.731-2.131,1.94-2.704l10.72-5.089   c0.381-0.191,0.731-0.318,1.177-0.318c1.018-0.031,1.94,0.859,1.94,2.004c0,0.922-0.509,1.559-1.336,1.94l-9.606,4.294l9.606,4.295   c0.827,0.381,1.336,1.113,1.336,2.004c0,1.177-0.922,2.004-2.1,1.972C36.513,61.562,36.163,61.435,35.845,61.275z"/><path d="M41.889,66.047l12.438-25.988c0.35-0.731,0.922-1.113,1.686-1.113c1.018,0,1.876,0.859,1.876,1.813   c0,0.35-0.127,0.7-0.222,0.923L45.229,67.669c-0.35,0.731-0.922,1.113-1.686,1.113c-1.018,0-1.876-0.858-1.876-1.813   C41.667,66.619,41.793,66.27,41.889,66.047z"/><path d="M64.155,45.371l10.72,5.089c1.208,0.573,1.94,1.464,1.94,2.704v0.318c0,1.24-0.731,2.131-1.94,2.703l-10.72,5.09   c-0.381,0.191-0.731,0.318-1.177,0.318c-1.018,0.031-1.94-0.859-1.94-2.004c0-0.923,0.509-1.559,1.336-1.94l9.606-4.295   l-9.606-4.294c-0.827-0.381-1.336-1.113-1.336-2.004c0-1.177,0.923-2.004,2.1-1.973C63.487,45.084,63.837,45.212,64.155,45.371z"/></g><path d="M92.5,21c0-1.657-1.343-3-3-3h-80c-1.657,0-3,1.343-3,3v59c0,1.657,1.343,3,3,3h80c1.657,0,3-1.343,3-3V21z M26,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S24.804,20.833,26,20.833z M20,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S18.804,20.833,20,20.833z M14,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S12.804,20.833,14,20.833z M88.5,79h-78V29h78V79z  "/><text x="0.0" y="117.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">Created by buzzyrobot</text><text x="0.0" y="122.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">from the Noun Project</text></svg>';
var failString = '<not-svg></ok>';
var bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" fill-opacity=".2"><path d="M0 1h2v1H1V0H0z" fill="#fff"/><path d="M1 2V0h1v1H0v1z"/></svg>`;

var SvgFile = require('./svg-file');

var svgo = require('./svgo');
var svgOuput = new (require('./ui/svg-output'));
var codeOutput = new (require('./ui/code-output'));
var downloadButton = new (require('./ui/download-button'));
var results = new (require('./ui/results'));

document.body.appendChild(results.container);
document.body.appendChild(downloadButton.container);
document.body.appendChild(svgOuput.container);
document.body.appendChild(codeOutput.container);

var input = new SvgFile(bgSvg);
var inputLoadPromise = input.text.then(t => svgo.load(t));
var outputSvg;

async function compress(inputSvg, settings) {
  var loadResult = await inputLoadPromise;
  var svgoResult = await svgo.process(settings);

  if (outputSvg) outputSvg.release();
  outputSvg = new SvgFile(svgoResult.data);
  
  svgOuput.setSvg(await outputSvg.url(), svgoResult.info.width, svgoResult.info.height);
  codeOutput.setCode(svgoResult.data);
  downloadButton.setDownload(inputSvg.name, await outputSvg.url());

  results.update(
    await inputSvg.compressedSize(),
    await outputSvg.compressedSize()
  );
}

var settingsEl = document.querySelector('.settings');
var pluginInputs = Array.prototype.slice.call(
  document.querySelectorAll('.settings .plugins input')
);

function getSettings() {
  var settings = {
    plugins: {}
  };
  
  pluginInputs.forEach(function(inputEl) {
    settings.plugins[inputEl.name] = inputEl.checked;
  });

  return settings;
}

settingsEl.addEventListener('change', function(event) {
  compress(input, getSettings());
});


compress(input, getSettings());