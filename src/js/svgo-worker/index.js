"use strict";

var svg2js = require('svgo/lib/svgo/svg2js');
var JsApi = require('svgo/lib/svgo/jsAPI.js');
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

function deepAddJsApiProto(arr) {
  for (var item of arr) {
    item.__proto__ = JsApi.prototype;
    if (item.content) deepAddJsApiProto(item.content);
  }
}

function deepClone(obj) {
  // This seems fast enough
  var newObj = JSON.parse(JSON.stringify(obj));
  // But we need to repair the JsApi bits:
  deepAddJsApiProto(newObj.content);
  return newObj;
}

var optimisedPluginsData = optimizePluginsArray(pluginsData);
var parsedSvg;

function getDimensions(parsedSvg) {
  var svgEl = parsedSvg.content[0];

  if (!svgEl.isElem('svg')) {
    return {};
  }

  if (svgEl.hasAttr('width') && svgEl.hasAttr('height')) {
    return {
      width: parseFloat(svgEl.attr('width').value),
      height: parseFloat(svgEl.attr('height').value)
    };
  }

  if (svgEl.hasAttr('viewBox')) {
    let viewBox = svgEl.attr('viewBox').value.split(/(?:,\s*|\s+)/);
    return {
      width: parseFloat(viewBox[2]),
      height: parseFloat(viewBox[3])
    };
  }

  return {};
}

var actions = {
  load(eventData) {
    svg2js(eventData.data, function(p) {
      parsedSvg = p;

      if (parsedSvg.error) {
        throw Error(parsedSvg.error);
      }

      var svgEl = parsedSvg.content[0];

      return getDimensions(parsedSvg);
    });
  },
  process(eventData) {
    var svg = deepClone(parsedSvg);
    plugins(svg, optimisedPluginsData);

    return {
      data: js2svg(svg).data,
      info: getDimensions(svg)
    };
  }
};

self.onmessage = function(event) {
  try {
    self.postMessage({
      id: event.data.id,
      result: actions[event.data.action](event.data)
    });
  }
  catch(e) {
    self.postMessage({
      id: event.data.id,
      error: e.message
    });
  }
};