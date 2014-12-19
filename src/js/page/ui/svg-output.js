var utils = require('../utils');

function SvgOutput() {
  this.container = utils.strToEl('<div class="svg-output"></div>');
  this._svgContainer = utils.strToEl('<div class="svg"></div>');
  this._state = {};

  this.container.appendChild(this._svgContainer);
}

var SvgOutputProto = SvgOutput.prototype;

SvgOutputProto.setSvg = function(svgStr) {
  this._svgContainer.innerHTML = svgStr;
};

module.exports = SvgOutput;