var svg2js = require('svgo/lib/svgo/svg2js');
var jsApi = require('svgo/lib/svgo/jsAPI.js');
var js2svg = require('svgo/lib/svgo/js2svg');
var plugins = require('svgo/lib/svgo/plugins');

var pluginsData = [
  require('svgo/plugins/removeDoctype'),
  require('svgo/plugins/removeXMLProcInst'),
  require('svgo/plugins/removeComments'),
  require('svgo/plugins/removeMetadata'),
  require('svgo/plugins/removeEditorsNSData'),
  require('svgo/plugins/cleanupAttrs'),
  require('svgo/plugins/convertStyleToAttrs'),
  require('svgo/plugins/removeRasterImages'),
  require('svgo/plugins/cleanupNumericValues'),
  require('svgo/plugins/convertColors'),
  require('svgo/plugins/removeUnknownsAndDefaults'),
  require('svgo/plugins/removeNonInheritableGroupAttrs'),
  require('svgo/plugins/removeUselessStrokeAndFill'),
  require('svgo/plugins/removeViewBox'),
  require('svgo/plugins/cleanupEnableBackground'),
  require('svgo/plugins/removeHiddenElems'),
  require('svgo/plugins/removeEmptyText'),
  require('svgo/plugins/convertShapeToPath'),
  require('svgo/plugins/moveElemsAttrsToGroup'),
  require('svgo/plugins/moveGroupAttrsToElems'),
  require('svgo/plugins/collapseGroups'),
  require('svgo/plugins/convertPathData'),
  require('svgo/plugins/convertTransform'),
  require('svgo/plugins/removeEmptyAttrs'),
  require('svgo/plugins/removeEmptyContainers'),
  require('svgo/plugins/mergePaths'),
  require('svgo/plugins/cleanupIDs'),
  require('svgo/plugins/removeUnusedNS'),
  require('svgo/plugins/transformsWithOnePath'),
  require('svgo/plugins/sortAttrs'),
  require('svgo/plugins/removeTitle'),
  require('svgo/plugins/removeDesc')
];

function optimizePluginsArray(plugins) {
  var prev;

  plugins = plugins.map(function(item) {
    return [item];
  });

  plugins = plugins.filter(function(item) {
    if (prev && item[0].type === prev[0].type) {
      prev.push(item[0]);
      return false;
    }

    prev = item;

    return true;

  });

  return plugins;
}

pluginsData = optimizePluginsArray(pluginsData);

self.onmessage = function(event) {
  svg2js(event.data.data, function(svgjs) {
    if (svgjs.error) {
      self.postMessage({
        error: svgjs.error
      });
      return;
    }

    plugins(svgjs, pluginsData);

    var svg = js2svg(svgjs);

    self.postMessage({
      result: svg
    });
  });
};