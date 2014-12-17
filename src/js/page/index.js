'use strict';

var testSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="5.0 -10.0 100.0 135.0" enable-background="new 0 0 100 100" xml:space="preserve"><g><path d="M35.845,61.275l-10.72-5.09c-1.209-0.572-1.94-1.463-1.94-2.703v-0.318c0-1.24,0.731-2.131,1.94-2.704l10.72-5.089   c0.381-0.191,0.731-0.318,1.177-0.318c1.018-0.031,1.94,0.859,1.94,2.004c0,0.922-0.509,1.559-1.336,1.94l-9.606,4.294l9.606,4.295   c0.827,0.381,1.336,1.113,1.336,2.004c0,1.177-0.922,2.004-2.1,1.972C36.513,61.562,36.163,61.435,35.845,61.275z"/><path d="M41.889,66.047l12.438-25.988c0.35-0.731,0.922-1.113,1.686-1.113c1.018,0,1.876,0.859,1.876,1.813   c0,0.35-0.127,0.7-0.222,0.923L45.229,67.669c-0.35,0.731-0.922,1.113-1.686,1.113c-1.018,0-1.876-0.858-1.876-1.813   C41.667,66.619,41.793,66.27,41.889,66.047z"/><path d="M64.155,45.371l10.72,5.089c1.208,0.573,1.94,1.464,1.94,2.704v0.318c0,1.24-0.731,2.131-1.94,2.703l-10.72,5.09   c-0.381,0.191-0.731,0.318-1.177,0.318c-1.018,0.031-1.94-0.859-1.94-2.004c0-0.923,0.509-1.559,1.336-1.94l9.606-4.295   l-9.606-4.294c-0.827-0.381-1.336-1.113-1.336-2.004c0-1.177,0.923-2.004,2.1-1.973C63.487,45.084,63.837,45.212,64.155,45.371z"/></g><path d="M92.5,21c0-1.657-1.343-3-3-3h-80c-1.657,0-3,1.343-3,3v59c0,1.657,1.343,3,3,3h80c1.657,0,3-1.343,3-3V21z M26,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S24.804,20.833,26,20.833z M20,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S18.804,20.833,20,20.833z M14,20.833  c1.196,0,2.167,0.97,2.167,2.167s-0.97,2.167-2.167,2.167s-2.167-0.97-2.167-2.167S12.804,20.833,14,20.833z M88.5,79h-78V29h78V79z  "/><text x="0.0" y="117.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">Created by buzzyrobot</text><text x="0.0" y="122.5" font-size="5.0" font-weight="bold" font-family="Helvetica Neue, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000">from the Noun Project</text></svg>';
var failString = '<not-svg></ok>';

var svgoWorker = new Worker('js/svgo-worker.js');
var gzipWorker = new Worker('js/gzip-worker.js');

svgoWorker.onmessage = function(event) {
  if (event.data.error) {
    console.log(event.data.error);
    return;
  }

  var svg = event.data.result.data;
  console.log(testSvg.length, svg.length);

  gzipWorker.postMessage({
    data: svg
  });
};

svgoWorker.postMessage({
  data: testSvg
});

gzipWorker.onmessage = function(event) {
  if (event.data.error) {
    console.log(event.data.error);
    return;
  }

  console.log(event.data.result.byteLength);

  var a = document.createElement('a');
  a.textContent = 'download';
  a.download = 'output.svgz';
  a.href = URL.createObjectURL(new Blob([event.data.result], {type: "image/svg+xml"}));
  document.body.appendChild(a);
};