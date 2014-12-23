"use strict";

var svg2js = require('svgo/lib/svgo/svg2js');
var JsApi = require('svgo/lib/svgo/jsAPI.js');
var js2svg = require('svgo/lib/svgo/js2svg');
var plugins = require('svgo/lib/svgo/plugins');

var pluginsData = {
  removeDoctype: require('svgo/plugins/removeDoctype'),
  removeXMLProcInst: require('svgo/plugins/removeXMLProcInst'),
  removeComments: require('svgo/plugins/removeComments'),
  removeMetadata: require('svgo/plugins/removeMetadata'),
  removeEditorsNSData: require('svgo/plugins/removeEditorsNSData'),
  cleanupAttrs: require('svgo/plugins/cleanupAttrs'),
  convertStyleToAttrs: require('svgo/plugins/convertStyleToAttrs'),
  removeRasterImages: require('svgo/plugins/removeRasterImages'),
  cleanupNumericValues: require('svgo/plugins/cleanupNumericValues'),
  convertColors: require('svgo/plugins/convertColors'),
  removeUnknownsAndDefaults: require('svgo/plugins/removeUnknownsAndDefaults'),
  removeNonInheritableGroupAttrs: require('svgo/plugins/removeNonInheritableGroupAttrs'),
  removeUselessStrokeAndFill: require('svgo/plugins/removeUselessStrokeAndFill'),
  removeViewBox: require('svgo/plugins/removeViewBox'),
  cleanupEnableBackground: require('svgo/plugins/cleanupEnableBackground'),
  removeHiddenElems: require('svgo/plugins/removeHiddenElems'),
  removeEmptyText: require('svgo/plugins/removeEmptyText'),
  convertShapeToPath: require('svgo/plugins/convertShapeToPath'),
  moveElemsAttrsToGroup: require('svgo/plugins/moveElemsAttrsToGroup'),
  moveGroupAttrsToElems: require('svgo/plugins/moveGroupAttrsToElems'),
  collapseGroups: require('svgo/plugins/collapseGroups'),
  convertPathData: require('svgo/plugins/convertPathData'),
  convertTransform: require('svgo/plugins/convertTransform'),
  removeEmptyAttrs: require('svgo/plugins/removeEmptyAttrs'),
  removeEmptyContainers: require('svgo/plugins/removeEmptyContainers'),
  mergePaths: require('svgo/plugins/mergePaths'),
  cleanupIDs: require('svgo/plugins/cleanupIDs'),
  removeUnusedNS: require('svgo/plugins/removeUnusedNS'),
  transformsWithOnePath: require('svgo/plugins/transformsWithOnePath'),
  sortAttrs: require('svgo/plugins/sortAttrs'),
  removeTitle: require('svgo/plugins/removeTitle'),
  removeDesc: require('svgo/plugins/removeDesc')
};

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


function cloneParsedSvg(obj) {
  // This seems fast enough
  var newObj = JSON.parse(JSON.stringify(obj));

  // But we need to repair the JsApi bits:
  newObj.content.forEach(function addJsApiProto(item) {
    item.__proto__ = JsApi.prototype;
    if (item.content) {
      item.content.forEach(addJsApiProto);
    }
  });

  return newObj;
}

var optimisedPluginsData = optimizePluginsArray(
  Object.keys(pluginsData).map(p => pluginsData[p])
);
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
  load({data}) {
    svg2js(data, function(p) {
      parsedSvg = p;

      if (parsedSvg.error) {
        throw Error(parsedSvg.error);
      }

      var svgEl = parsedSvg.content[0];

      return getDimensions(parsedSvg);
    });
  },
  process({settings}) {
    // activate/deactivate plugins
    Object.keys(settings.plugins).forEach(function(pluginName) {
      pluginsData[pluginName].active = settings.plugins[pluginName];
    });

    var svg = cloneParsedSvg(parsedSvg);
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