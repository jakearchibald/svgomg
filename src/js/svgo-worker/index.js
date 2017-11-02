"use strict";
import '../utils/node-globals/global';
import svg2js from 'svgo/lib/svgo/svg2js';
import JsApi from 'svgo/lib/svgo/jsAPI';
import js2svg from 'svgo/lib/svgo/js2svg';
import plugins from 'svgo/lib/svgo/plugins';

// the order is from https://github.com/svg/svgo/blob/master/.svgo.yml
import removeDoctype from 'svgo/plugins/removeDoctype';
import removeXMLProcInst from 'svgo/plugins/removeXMLProcInst';
import removeComments from 'svgo/plugins/removeComments';
import removeMetadata from 'svgo/plugins/removeMetadata';
import removeXMLNS from 'svgo/plugins/removeXMLNS';
import removeEditorsNSData from 'svgo/plugins/removeEditorsNSData';
import cleanupAttrs from 'svgo/plugins/cleanupAttrs';
import minifyStyles from 'svgo/plugins/minifyStyles';
import convertStyleToAttrs from 'svgo/plugins/convertStyleToAttrs';
import cleanupIDs from 'svgo/plugins/cleanupIDs';
import removeRasterImages from 'svgo/plugins/removeRasterImages';
import removeUselessDefs from 'svgo/plugins/removeUselessDefs';
import cleanupNumericValues from 'svgo/plugins/cleanupNumericValues';
import cleanupListOfValues from 'svgo/plugins/cleanupListOfValues';
import convertColors from 'svgo/plugins/convertColors';
import removeUnknownsAndDefaults from 'svgo/plugins/removeUnknownsAndDefaults';
import removeNonInheritableGroupAttrs from 'svgo/plugins/removeNonInheritableGroupAttrs';
import removeUselessStrokeAndFill from 'svgo/plugins/removeUselessStrokeAndFill';
import removeViewBox from 'svgo/plugins/removeViewBox';
import cleanupEnableBackground from 'svgo/plugins/cleanupEnableBackground';
import removeHiddenElems from 'svgo/plugins/removeHiddenElems';
import removeEmptyText from 'svgo/plugins/removeEmptyText';
import convertShapeToPath from 'svgo/plugins/convertShapeToPath';
import moveElemsAttrsToGroup from 'svgo/plugins/moveElemsAttrsToGroup';
import moveGroupAttrsToElems from 'svgo/plugins/moveGroupAttrsToElems';
import collapseGroups from 'svgo/plugins/collapseGroups';
import convertPathData from 'svgo/plugins/convertPathData';
import convertTransform from 'svgo/plugins/convertTransform';
import removeEmptyAttrs from 'svgo/plugins/removeEmptyAttrs';
import removeEmptyContainers from 'svgo/plugins/removeEmptyContainers';
import mergePaths from 'svgo/plugins/mergePaths';
import removeUnusedNS from 'svgo/plugins/removeUnusedNS';
import transformsWithOnePath from 'svgo/plugins/transformsWithOnePath';
import sortAttrs from 'svgo/plugins/sortAttrs';
import removeTitle from 'svgo/plugins/removeTitle';
import removeDesc from 'svgo/plugins/removeDesc';
import removeDimensions from 'svgo/plugins/removeDimensions';
import removeAttrs from 'svgo/plugins/removeAttrs';
import removeElementsByAttr from 'svgo/plugins/removeElementsByAttr';
import addClassesToSVGElement from 'svgo/plugins/addClassesToSVGElement';
import removeStyleElement from 'svgo/plugins/removeStyleElement';
import addAttributesToSVGElement from 'svgo/plugins/addAttributesToSVGElement';

const pluginsData = {
  'removeDoctype': removeDoctype,
  'removeXMLProcInst': removeXMLProcInst,
  'removeComments': removeComments,
  'removeMetadata': removeMetadata,
  'removeXMLNS': removeXMLNS,
  'removeEditorsNSData': removeEditorsNSData,
  'cleanupAttrs': cleanupAttrs,
  'minifyStyles': minifyStyles,
  'convertStyleToAttrs': convertStyleToAttrs,
  'cleanupIDs': cleanupIDs,
  'removeRasterImages': removeRasterImages,
  'removeUselessDefs': removeUselessDefs,
  'cleanupNumericValues': cleanupNumericValues,
  'cleanupListOfValues': cleanupListOfValues,
  'convertColors': convertColors,
  'removeUnknownsAndDefaults': removeUnknownsAndDefaults,
  'removeNonInheritableGroupAttrs': removeNonInheritableGroupAttrs,
  'removeUselessStrokeAndFill': removeUselessStrokeAndFill,
  'removeViewBox': removeViewBox,
  'cleanupEnableBackground': cleanupEnableBackground,
  'removeHiddenElems': removeHiddenElems,
  'removeEmptyText': removeEmptyText,
  'convertShapeToPath': convertShapeToPath,
  'moveElemsAttrsToGroup': moveElemsAttrsToGroup,
  'moveGroupAttrsToElems': moveGroupAttrsToElems,
  'collapseGroups': collapseGroups,
  'convertPathData': convertPathData,
  'convertTransform': convertTransform,
  'removeEmptyAttrs': removeEmptyAttrs,
  'removeEmptyContainers': removeEmptyContainers,
  'mergePaths': mergePaths,
  'removeUnusedNS': removeUnusedNS,
  'transformsWithOnePath': transformsWithOnePath,
  'sortAttrs': sortAttrs,
  'removeTitle': removeTitle,
  'removeDesc': removeDesc,
  'removeDimensions': removeDimensions,
  // Some of these don't have a useful default action
  //'removeAttrs': removeAttrs,
  //'removeElementsByAttr': removeElementsByAttr,
  //'addClassesToSVGElement': addClassesToSVGElement,
  'removeStyleElement': removeStyleElement,
  //'addAttributesToSVGElement': addAttributesToSVGElement,
};

// Arrange plugins by type - this is what plugins() expects
function optimizePluginsArray(plugins) {
  return plugins.map(item => [item]).reduce((arr, item) => {
    const last = arr[arr.length - 1];

    if (last && item[0].type === last[0].type) {
      last.push(item[0]);
    }
    else {
      arr.push(item);
    }
    return arr;
  }, []);
}

const optimisedPluginsData = optimizePluginsArray(Object.values(pluginsData));

function getDimensions(parsedSvg) {
  const svgEl = parsedSvg.content.filter(el => el.isElem('svg'))[0];

  if (!svgEl) {
    return {};
  }

  if (svgEl.hasAttr('width') && svgEl.hasAttr('height')) {
    return {
      width: parseFloat(svgEl.attr('width').value),
      height: parseFloat(svgEl.attr('height').value)
    };
  }

  if (svgEl.hasAttr('viewBox')) {
    const viewBox = svgEl.attr('viewBox').value.split(/(?:,\s*|\s+)/);

    return {
      width: parseFloat(viewBox[2]),
      height: parseFloat(viewBox[3])
    };
  }

  return {};
}

function* multipassCompress(settings) {
  // activate/deactivate plugins
  Object.keys(settings.plugins).forEach(pluginName => {
    pluginsData[pluginName].active = settings.plugins[pluginName];
  });

  // Set floatPrecision across all the plugins
  const floatPrecision = Number(settings.floatPrecision);

  for (const plugin of Object.values(pluginsData)) {
    if (plugin.params && 'floatPrecision' in plugin.params) {
      plugin.params.floatPrecision = floatPrecision;
    }
  }

  const svg = parsedSvg.clone();
  let svgData;
  let previousDataLength;

  while (svgData === undefined || svgData.length != previousDataLength) {
    previousDataLength = svgData && svgData.length;
    plugins(svg, optimisedPluginsData);
    svgData = js2svg(svg, {
      indent: '  ',
      pretty: settings.pretty
    }).data;

    yield {
      data: svgData,
      dimensions: getDimensions(svg)
    };
  }
}

let parsedSvg;
let multipassInstance;

const actions = {
  load({data}) {
    svg2js(data, p => parsedSvg = p);

    if (parsedSvg.error) throw Error(parsedSvg.error);

    return getDimensions(parsedSvg);
  },
  process({settings}) {
    multipassInstance = multipassCompress(settings);
    return multipassInstance.next().value;
  },
  nextPass() {
    return multipassInstance.next().value;
  }
};

self.onmessage = event => {
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
