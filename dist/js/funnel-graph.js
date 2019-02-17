(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FunnelGraph = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.areEqual = exports.getDefaultColors = exports.generateLegendBackground = void 0;

var generateLegendBackground = function generateLegendBackground(color) {
  var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'horizontal';

  if (typeof color === 'string') {
    return "background-color: ".concat(color);
  }

  if (color.length === 1) {
    return "background-color: ".concat(color[0]);
  }

  return "background-image: linear-gradient(".concat(direction === 'horizontal' ? 'to right, ' : '').concat(color.join(', '), ")");
};

exports.generateLegendBackground = generateLegendBackground;
var defaultColors = ['#FF4589', '#FF5050', '#05DF9D', '#4FF2FD', '#2D9CDB', '#A0BBFF', '#FFD76F', '#F2C94C', '#FF9A9A', '#FFB178'];

var getDefaultColors = function getDefaultColors(number) {
  var colors = [].concat(defaultColors);
  var colorSet = [];

  for (var i = 0; i < number; i++) {
    // get a random color
    var index = Math.abs(Math.round(Math.random() * (colors.length - 1))); // push it to the list

    colorSet.push(colors[index]); // and remove it, so that it is not chosen again

    colors.splice(index, 1);
  }

  return colorSet;
};
/*
    Used in comparing existing values to value provided on update
    It is limited to comparing arrays on purpose
    Name is slightly unusual, in order not to be confused with Lodash method
 */


exports.getDefaultColors = getDefaultColors;

var areEqual = function areEqual(value, newValue) {
  // If values are not of the same type
  var type = Object.prototype.toString.call(value);
  if (type !== Object.prototype.toString.call(newValue)) return false;
  if (type !== '[object Array]') return false;
  if (value.length !== newValue.length) return false;

  for (var i = 0; i < value.length; i++) {
    if (value[i] !== newValue[i]) return false;
  }

  return true;
};

exports.areEqual = areEqual;

},{}],2:[function(require,module,exports){
"use strict";

module.exports = require('./main').default;

},{"./main":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _number = require("./number");

var _path = require("./path");

var _graph = require("./graph");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FunnelGraph =
/*#__PURE__*/
function () {
  function FunnelGraph(options) {
    _classCallCheck(this, FunnelGraph);

    this.containerSelector = options.container;
    this.gradientDirection = options.gradientDirection && options.gradientDirection === 'vertical' ? 'vertical' : 'horizontal';
    this.direction = options.direction && options.direction === 'vertical' ? 'vertical' : 'horizontal';
    this.labels = FunnelGraph.getLabels(options);
    this.subLabels = FunnelGraph.getSubLabels(options);
    this.values = FunnelGraph.getValues(options);
    this.percentages = this.createPercentages();
    this.colors = options.data.colors || (0, _graph.getDefaultColors)(this.is2d() ? this.getSubDataSize() : 2);
    this.displayPercent = options.displayPercent || false;
    this.height = options.height;
    this.width = options.width;
  }
  /**
  An example of a two-dimensional funnel graph
  #0..................
                     ...#1................
                                         ......
  #0********************#1**                    #2.........................#3 (A)
                            *******************
                                                #2*************************#3 (B)
                                                #2+++++++++++++++++++++++++#3 (C)
                            +++++++++++++++++++
  #0++++++++++++++++++++#1++                    #2-------------------------#3 (D)
                                         ------
                     ---#1----------------
  #0-----------------
    Main axis is the primary axis of the graph.
   In a horizontal graph it's the X axis, and Y is the cross axis.
   However we use the names "main" and "cross" axis,
   because in a vertical graph the primary axis is the Y axis
   and the cross axis is the X axis.
    First step of drawing the funnel graph is getting the coordinates of points,
   that are used when drawing the paths.
    There are 4 paths in the example above: A, B, C and D.
   Such funnel has 3 labels and 3 subLabels.
   This means that the main axis has 4 points (number of labels + 1)
   One the ASCII illustrated graph above, those points are illustrated with a # symbol.
   */


  _createClass(FunnelGraph, [{
    key: "getMainAxisPoints",
    value: function getMainAxisPoints() {
      var size = this.getDataSize();
      var points = [];
      var fullDimension = this.isVertical() ? this.getHeight() : this.getWidth();

      for (var i = 0; i <= size; i++) {
        points.push((0, _number.roundPoint)(fullDimension * i / size));
      }

      return points;
    }
  }, {
    key: "getCrossAxisPoints",
    value: function getCrossAxisPoints() {
      var points = [];
      var fullDimension = this.getFullDimension(); // get half of the graph container height or width, since funnel shape is symmetric
      // we use this when calculating the "A" shape

      var dimension = fullDimension / 2;

      if (this.is2d()) {
        var totalValues = this.getValues2d();
        var max = Math.max.apply(Math, _toConsumableArray(totalValues)); // duplicate last value

        totalValues.push(_toConsumableArray(totalValues).pop()); // get points for path "A"

        points.push(totalValues.map(function (value) {
          return (0, _number.roundPoint)((max - value) / max * dimension);
        })); // percentages with duplicated last value

        var percentagesFull = this.getPercentages2d();
        var pointsOfFirstPath = points[0];

        for (var i = 1; i < this.getSubDataSize(); i++) {
          var p = points[i - 1];
          var newPoints = [];

          for (var j = 0; j < this.getDataSize(); j++) {
            newPoints.push((0, _number.roundPoint)( // eslint-disable-next-line comma-dangle
            p[j] + (fullDimension - pointsOfFirstPath[j] * 2) * (percentagesFull[j][i - 1] / 100)));
          } // duplicate the last value as points #2 and #3 have the same value on the cross axis


          newPoints.push([].concat(newPoints).pop());
          points.push(newPoints);
        } // add points for path "D", that is simply the "inverted" path "A"


        points.push(pointsOfFirstPath.map(function (point) {
          return fullDimension - point;
        }));
      } else {
        // As you can see on the visualization above points #2 and #3 have the same cross axis coordinate
        // so we duplicate the last value
        var _max = Math.max.apply(Math, _toConsumableArray(this.values));

        var values = _toConsumableArray(this.values).concat(_toConsumableArray(this.values).pop()); // if the graph is simple (not two-dimensional) then we have only paths "A" and "D"
        // which are symmetric. So we get the points for "A" and then get points for "D" by subtracting "A"
        // points from graph cross dimension length


        points.push(values.map(function (value) {
          return (0, _number.roundPoint)((_max - value) / _max * dimension);
        }));
        points.push(points[0].map(function (point) {
          return fullDimension - point;
        }));
      }

      return points;
    }
  }, {
    key: "getGraphType",
    value: function getGraphType() {
      return this.values && this.values[0] instanceof Array ? '2d' : 'normal';
    }
  }, {
    key: "is2d",
    value: function is2d() {
      return this.getGraphType() === '2d';
    }
  }, {
    key: "isVertical",
    value: function isVertical() {
      return this.direction === 'vertical';
    }
  }, {
    key: "getDataSize",
    value: function getDataSize() {
      return this.values.length;
    }
  }, {
    key: "getSubDataSize",
    value: function getSubDataSize() {
      return this.values[0].length;
    }
  }, {
    key: "getFullDimension",
    value: function getFullDimension() {
      return this.isVertical() ? this.getWidth() : this.getHeight();
    }
  }, {
    key: "addLabels",
    value: function addLabels() {
      var _this = this;

      this.container.style.position = 'relative';
      var holder = document.createElement('div');
      holder.setAttribute('class', 'svg-funnel-js__labels');
      this.percentages.forEach(function (percentage, index) {
        var labelElement = document.createElement('div');
        labelElement.setAttribute('class', "svg-funnel-js__label label-".concat(index + 1));
        var title = document.createElement('div');
        title.setAttribute('class', 'label__title');
        title.textContent = _this.labels[index] || '';
        var value = document.createElement('div');
        value.setAttribute('class', 'label__value');
        var valueNumber = _this.is2d() ? _this.getValues2d()[index] : _this.values[index];
        value.textContent = (0, _number.formatNumber)(valueNumber);
        var percentageValue = document.createElement('div');
        percentageValue.setAttribute('class', 'label__percentage');

        if (percentage !== 100) {
          percentageValue.textContent = "".concat(percentage.toString(), "%");
        }

        labelElement.appendChild(value);
        labelElement.appendChild(title);

        if (_this.displayPercent) {
          labelElement.appendChild(percentageValue);
        }

        holder.appendChild(labelElement);
      });
      this.container.appendChild(holder);
    }
  }, {
    key: "addSubLabels",
    value: function addSubLabels() {
      var _this2 = this;

      if (this.subLabels) {
        var subLabelsHolder = document.createElement('div');
        subLabelsHolder.setAttribute('class', 'svg-funnel-js__subLabels');
        var subLabelsHTML = '';
        this.subLabels.forEach(function (subLabel, index) {
          subLabelsHTML += "<div class=\"svg-funnel-js__subLabel svg-funnel-js__subLabel-".concat(index + 1, "\">\n    <div class=\"svg-funnel-js__subLabel--color\" \n        style=\"").concat((0, _graph.generateLegendBackground)(_this2.colors[index], _this2.gradientDirection), "\"></div>\n    <div class=\"svg-funnel-js__subLabel--title\">").concat(subLabel, "</div>\n</div>");
        });
        subLabelsHolder.innerHTML = subLabelsHTML;
        this.container.appendChild(subLabelsHolder);
      }
    }
  }, {
    key: "createContainer",
    value: function createContainer() {
      if (!this.containerSelector) {
        throw new Error('Container is missing');
      }

      this.container = document.querySelector(this.containerSelector);
      this.container.classList.add('svg-funnel-js');
      this.graphContainer = document.createElement('div');
      this.graphContainer.classList.add('svg-funnel-js__container');
      this.container.appendChild(this.graphContainer);

      if (this.direction === 'vertical') {
        this.container.classList.add('svg-funnel-js--vertical');
      }
    }
  }, {
    key: "getValues2d",
    value: function getValues2d() {
      var values = [];
      this.values.forEach(function (valueSet) {
        values.push(valueSet.reduce(function (sum, value) {
          return sum + value;
        }, 0));
      });
      return values;
    }
  }, {
    key: "getPercentages2d",
    value: function getPercentages2d() {
      var percentages = [];
      this.values.forEach(function (valueSet) {
        var total = valueSet.reduce(function (sum, value) {
          return sum + value;
        }, 0);
        percentages.push(valueSet.map(function (value) {
          return (0, _number.roundPoint)(value * 100 / total);
        }));
      });
      return percentages;
    }
  }, {
    key: "createPercentages",
    value: function createPercentages() {
      var values = [];

      if (this.is2d()) {
        values = this.getValues2d();
      } else {
        values = _toConsumableArray(this.values);
      }

      var max = Math.max.apply(Math, _toConsumableArray(values));
      return values.map(function (value) {
        return (0, _number.roundPoint)(value * 100 / max);
      });
    }
  }, {
    key: "applyGradient",
    value: function applyGradient(svg, path, colors, index) {
      var defs = svg.querySelector('defs') === null ? FunnelGraph.createSVGElement('defs', svg) : svg.querySelector('defs');
      var gradientName = "funnelGradient-".concat(index);
      var gradient = FunnelGraph.createSVGElement('linearGradient', defs, {
        id: gradientName
      });

      if (this.gradientDirection === 'vertical') {
        FunnelGraph.setAttrs(gradient, {
          x1: '0',
          x2: '0',
          y1: '0',
          y2: '1'
        });
      }

      var numberOfColors = colors.length;

      for (var i = 0; i < numberOfColors; i++) {
        FunnelGraph.createSVGElement('stop', gradient, {
          'stop-color': colors[i],
          offset: "".concat(Math.round(100 * i / (numberOfColors - 1)), "%")
        });
      }

      FunnelGraph.setAttrs(path, {
        fill: "url(\"#".concat(gradientName, "\")"),
        stroke: "url(\"#".concat(gradientName, "\")")
      });
    }
  }, {
    key: "makeSVG",
    value: function makeSVG() {
      var svg = FunnelGraph.createSVGElement('svg', this.graphContainer, {
        width: this.getWidth(),
        height: this.getHeight()
      });
      var valuesNum = this.getCrossAxisPoints().length - 1;

      for (var i = 0; i < valuesNum; i++) {
        var path = FunnelGraph.createSVGElement('path', svg);
        var color = this.is2d() ? this.colors[i] : this.colors;
        var fillMode = typeof color === 'string' || color.length === 1 ? 'solid' : 'gradient';

        if (fillMode === 'solid') {
          FunnelGraph.setAttrs(path, {
            fill: color,
            stroke: color
          });
        } else if (fillMode === 'gradient') {
          this.applyGradient(svg, path, color, i + 1);
        }

        svg.appendChild(path);
      }

      this.graphContainer.appendChild(svg);
    }
  }, {
    key: "getSVG",
    value: function getSVG() {
      var svg = this.container.querySelector('svg');

      if (!svg) {
        throw new Error('No SVG found inside of the container');
      }

      return svg;
    }
  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.width || this.graphContainer.clientWidth;
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.height || this.graphContainer.clientHeight;
    }
    /*
        A funnel segment is draw in a clockwise direction.
        Path 1-2 is drawn,
        then connected with a straight vertical line 2-3,
        then a line 3-4 is draw (using YNext points going in backwards direction)
        then path is closed (connected with the starting point 1).
         1---------->2
        ^           |
        |           v
        4<----------3
         On the graph on line 20 it works like this:
        A#0, A#1, A#2, A#3, B#3, B#2, B#1, B#0, close the path.
         Points for path "B" are passed as the YNext param.
     */

  }, {
    key: "createPath",
    value: function createPath(index) {
      var X = this.getMainAxisPoints();
      var Y = this.getCrossAxisPoints()[index];
      var YNext = this.getCrossAxisPoints()[index + 1];
      var str = "M".concat(X[0], ",").concat(Y[0]);

      for (var i = 0; i < X.length - 1; i++) {
        str += (0, _path.createCurves)(X[i], Y[i], X[i + 1], Y[i + 1]);
      }

      str += " L".concat(_toConsumableArray(X).pop(), ",").concat(_toConsumableArray(YNext).pop());

      for (var _i = X.length - 1; _i > 0; _i--) {
        str += (0, _path.createCurves)(X[_i], YNext[_i], X[_i - 1], YNext[_i - 1]);
      }

      str += ' Z';
      return str;
    }
    /*
        In a vertical path we go counter-clockwise
         1<----------4
        |           ^
        v           |
        2---------->3
     */

  }, {
    key: "createVerticalPath",
    value: function createVerticalPath(index) {
      var X = this.getCrossAxisPoints()[index];
      var XNext = this.getCrossAxisPoints()[index + 1];
      var Y = this.getMainAxisPoints();
      var str = "M".concat(X[0], ",").concat(Y[0]);

      for (var i = 0; i < X.length - 1; i++) {
        str += (0, _path.createVerticalCurves)(X[i], Y[i], X[i + 1], Y[i + 1]);
      }

      str += " L".concat(_toConsumableArray(XNext).pop(), ",").concat(_toConsumableArray(Y).pop());

      for (var _i2 = X.length - 1; _i2 > 0; _i2--) {
        str += (0, _path.createVerticalCurves)(XNext[_i2], Y[_i2], XNext[_i2 - 1], Y[_i2 - 1]);
      }

      str += ' Z';
      return str;
    }
  }, {
    key: "draw",
    value: function draw() {
      this.createContainer();
      this.makeSVG();
      var svg = this.getSVG();
      this.addLabels();

      if (this.is2d()) {
        this.addSubLabels();
      }

      var paths = svg.querySelectorAll('path');

      for (var i = 0; i < paths.length; i++) {
        var d = this.isVertical() ? this.createVerticalPath(i) : this.createPath(i);
        paths[i].setAttribute('d', d);
      }
    }
    /*
        Methods
     */

  }, {
    key: "gradientMakeVertical",
    value: function gradientMakeVertical() {
      if (this.gradientDirection === 'vertical') return true;
      this.gradientDirection = 'vertical';
      var gradients = this.graphContainer.querySelectorAll('linearGradient');
      gradients.forEach(function (gradient) {
        FunnelGraph.setAttrs(gradient, {
          x1: '0',
          x2: '0',
          y1: '0',
          y2: '1'
        });
      });
      return true;
    }
  }, {
    key: "gradientMakeHorizontal",
    value: function gradientMakeHorizontal() {
      if (this.gradientDirection === 'horizontal') return true;
      this.gradientDirection = 'horizontal';
      var gradients = this.graphContainer.querySelectorAll('linearGradient');
      gradients.forEach(function (gradient) {
        FunnelGraph.removeAttrs(gradient, 'x1', 'x2', 'y1', 'y2');
      });
      return true;
    }
  }, {
    key: "gradientToggleDirection",
    value: function gradientToggleDirection() {
      if (this.gradientDirection === 'horizontal') {
        this.gradientMakeVertical();
      } else {
        this.gradientMakeHorizontal();
      }
    }
  }], [{
    key: "getSubLabels",
    value: function getSubLabels(options) {
      if (!options.data) {
        throw new Error('Data is missing');
      }

      var data = options.data;
      if (typeof data.subLabels === 'undefined') return [];
      return data.subLabels;
    }
  }, {
    key: "getLabels",
    value: function getLabels(options) {
      if (!options.data) {
        throw new Error('Data is missing');
      }

      var data = options.data;
      if (typeof data.labels === 'undefined') return [];
      return data.labels;
    }
  }, {
    key: "getValues",
    value: function getValues(options) {
      if (!options.data) {
        return [];
      }

      var data = options.data;

      if (data instanceof Array) {
        if (Number.isInteger(data[0])) {
          return data;
        }

        return data.map(function (item) {
          return item.value;
        });
      }

      if (_typeof(data) === 'object') {
        return options.data.values;
      }

      return [];
    }
  }, {
    key: "createSVGElement",
    value: function createSVGElement(element, container, attributes) {
      var el = document.createElementNS('http://www.w3.org/2000/svg', element);

      if (_typeof(attributes) === 'object') {
        FunnelGraph.setAttrs(el, attributes);
      }

      if (typeof container !== 'undefined') {
        container.appendChild(el);
      }

      return el;
    }
  }, {
    key: "setAttrs",
    value: function setAttrs(element, attributes) {
      if (_typeof(attributes) === 'object') {
        Object.keys(attributes).forEach(function (key) {
          element.setAttribute(key, attributes[key]);
        });
      }
    }
  }, {
    key: "removeAttrs",
    value: function removeAttrs(element) {
      for (var _len = arguments.length, attributes = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        attributes[_key - 1] = arguments[_key];
      }

      attributes.forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    }
  }]);

  return FunnelGraph;
}();

var _default = FunnelGraph;
exports.default = _default;

},{"./graph":1,"./number":4,"./path":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatNumber = exports.roundPoint = void 0;

var roundPoint = function roundPoint(number) {
  return Math.round(number * 10) / 10;
};

exports.roundPoint = roundPoint;

var formatNumber = function formatNumber(number) {
  return Number(number).toFixed().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

exports.formatNumber = formatNumber;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVerticalCurves = exports.createCurves = void 0;

var _number = require("./number");

var createCurves = function createCurves(x1, y1, x2, y2) {
  return " C".concat((0, _number.roundPoint)((x2 + x1) / 2), ",").concat(y1, " ") + "".concat((0, _number.roundPoint)((x2 + x1) / 2), ",").concat(y2, " ").concat(x2, ",").concat(y2);
};

exports.createCurves = createCurves;

var createVerticalCurves = function createVerticalCurves(x1, y1, x2, y2) {
  return " C".concat(x1, ",").concat((0, _number.roundPoint)((y2 + y1) / 2), " ") + "".concat(x2, ",").concat((0, _number.roundPoint)((y2 + y1) / 2), " ").concat(x2, ",").concat(y2);
};

exports.createVerticalCurves = createVerticalCurves;

},{"./number":4}]},{},[2])(2)
});
