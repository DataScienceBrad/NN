var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230872;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230872) {
                /**
                 * Singleton reference of ColorPalette.
                 *
                 * @instance
                 */
                var colorManager;
                /**
                 * Factory method for creating a ColorPalette.
                 *
                 * @function
                 * @param {IColorInfo[]} colors - Array of ColorInfo objects that contain
                 *                                hex values for colors.
                 */
                function createColorPalette(colors) {
                    if (!colorManager)
                        colorManager = new ColorPalette(colors);
                    return colorManager;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.createColorPalette = createColorPalette;
                var ColorPalette = (function () {
                    function ColorPalette(colors) {
                        this.colorPalette = {};
                        this.colorIndex = 0;
                        this.colors = colors;
                    }
                    /**
                     * Gets color from colorPalette and returns an IColorInfo
                     *
                     * @function
                     * @param {string} key - Key of assign color in colorPalette.
                     */
                    ColorPalette.prototype.getColor = function (key) {
                        var color = this.colorPalette[key];
                        if (color) {
                            return color;
                        }
                        var colors = this.colors;
                        color = this.colorPalette[key] = colors[this.colorIndex++];
                        if (this.colorIndex >= colors.length) {
                            this.colorIndex = 0;
                        }
                        return color;
                    };
                    /**
                     * resets colorIndex to 0
                     *
                     * @function
                     */
                    ColorPalette.prototype.reset = function () {
                        this.colorIndex = 0;
                        return this;
                    };
                    /**
                     * Clears colorPalette of cached keys and colors
                     *
                     * @function
                     */
                    ColorPalette.prototype.clear = function () {
                        this.colorPalette = {};
                    };
                    return ColorPalette;
                }());
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230872;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230872) {
                ;
                ;
                function visualTransform(options, host) {
                    if (!options.dataViews)
                        return;
                    if (!options.dataViews[0])
                        return;
                    if (!options.dataViews[0].categorical)
                        return;
                    var dataViews = options.dataViews;
                    var categorical;
                    categorical = options.dataViews[0].categorical;
                    var category;
                    category = categorical.categories[0];
                    var pyramidChartDataPoints = [];
                    var colorPalette = PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.createColorPalette(host.colors).reset();
                    var objects = options.dataViews[0];
                    for (var iIterator = 0; iIterator < category.values.length; iIterator++) {
                        var defaultColor = {
                            solid: {
                                color: colorPalette.getColor(category.values[iIterator]).value
                            }
                        };
                        pyramidChartDataPoints.push({
                            category: category.values[iIterator],
                            color: PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.getCategoricalObjectValue(category, iIterator, 'sectionColors', 'sColors', defaultColor).solid.color,
                            selectionId: host.createSelectionIdBuilder().withCategory(category, iIterator).createSelectionId()
                        });
                    }
                    return {
                        dataPoints: pyramidChartDataPoints
                    };
                }
                var PyramidChart = (function () {
                    /** This is called once when the visual is initialially created */
                    function PyramidChart(options) {
                        this.label = {};
                        this.path = {};
                        this.lines = {};
                        this.prevDataViewObjects = {};
                        this.color = {};
                        this.host = options.host;
                        this.selectionManager = options.host.createSelectionManager();
                        var svg = this.svg = d3.select(options.element).append('svg').classed('PyramidChart', true);
                        options.element.setAttribute("id", "container");
                    }
                    /** Update is called for data updates, resizes & formatting changes */
                    PyramidChart.prototype.update = function (options) {
                        var temp;
                        this.svg.selectAll("*").remove();
                        this.mainGroup = this.svg.append('g');
                        if (!options.dataViews)
                            return;
                        if (0 === options.dataViews.length)
                            return;
                        this.dataView = options.dataViews[0];
                        if (!this.dataView.categorical || !Object.getPrototypeOf(this.dataView.categorical).categories || !Object.getPrototypeOf(this.dataView.categorical).categories[0] || !Object.getPrototypeOf(this.dataView.categorical).categories[1])
                            return;
                        // Color format option
                        // Sorting
                        for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                            for (var j = i + 1; j < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; j++) {
                                if (Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i] < Object.getPrototypeOf(this.dataView.categorical).categories[1].values[j]) {
                                    temp = Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i];
                                    Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i] = Object.getPrototypeOf(this.dataView.categorical).categories[1].values[j];
                                    Object.getPrototypeOf(this.dataView.categorical).categories[1].values[j] = temp;
                                    temp = Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i];
                                    Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i] = Object.getPrototypeOf(this.dataView.categorical).categories[0].values[j];
                                    Object.getPrototypeOf(this.dataView.categorical).categories[0].values[j] = temp;
                                }
                            }
                        }
                        for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                            this.path[i] = this.mainGroup.append('path');
                            this.label[i] = this.mainGroup.append('text');
                            this.lines[i] = this.mainGroup.append('path');
                        }
                        var viewModel = visualTransform(options, this.host);
                        if (!viewModel)
                            return;
                        this.pyramidChartPoints = viewModel.dataPoints;
                        for (var i = 0; i < this.pyramidChartPoints.length; i++) {
                            this.color[i] = this.pyramidChartPoints[i].color;
                        }
                        var viewport = options.viewport;
                        var height = viewport.height;
                        var width = viewport.width;
                        var duration = 1;
                        this.svg.attr({ 'height': height, 'width': width });
                        this.draw(width, height, duration);
                    };
                    PyramidChart.prototype.calculateTangent = function (x1, y1, x2, y2) {
                        return (y2 - y1) / (x2 - x1);
                    };
                    PyramidChart.prototype.draw = function (width, height, duration) {
                        var availWidth = width, availHeight = height, sumValues = 0;
                        var marginWidth = availWidth * 0.2, marginHeight = availHeight * 0.2;
                        var mainGroup = this.mainGroup;
                        var dataView = this.dataView;
                        //draw pyramid sections
                        this.tangentLeft = this.calculateTangent(availHeight - marginHeight / 2, marginWidth / 2, marginHeight / 2, availWidth / 2);
                        this.tangentRight = this.calculateTangent(availHeight - marginHeight / 2, availWidth - marginWidth / 2, marginHeight / 2, availWidth / 2);
                        var calculatedXLeft = 0, calculatedY = 0, calculatedXRight = 0, calculatedHeight = 0, calculatedWidth = 0;
                        var oAttrPyramid = {
                            x1: marginWidth / 2,
                            y1: availHeight - marginHeight / 2,
                            x2: availWidth - marginWidth / 2,
                            y2: availHeight - marginHeight / 2,
                            x3: 0,
                            y3: 0,
                            x4: 0,
                            y4: 0
                        };
                        var oAttrLabel = {
                            x: marginWidth / 2,
                            y: availHeight - marginHeight / 2,
                            text: ''
                        };
                        for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                            sumValues = sumValues + Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i];
                        }
                        var pointsParameters = "";
                        var sumHeight = 0;
                        var textBox;
                        for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                            //draw sections
                            calculatedHeight = (availHeight - marginHeight) * Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i] / sumValues;
                            sumHeight += calculatedHeight;
                            calculatedY = availHeight - sumHeight - marginHeight / 2;
                            0;
                            calculatedXLeft = availWidth / 2 - this.tangentLeft * (marginHeight / 2 - calculatedY);
                            calculatedXRight = availWidth / 2 - this.tangentRight * (marginHeight / 2 - calculatedY);
                            oAttrPyramid.x3 = calculatedXRight;
                            oAttrPyramid.y3 = calculatedY;
                            oAttrPyramid.x4 = calculatedXLeft;
                            oAttrPyramid.y4 = calculatedY;
                            pointsParameters = "M" + oAttrPyramid.x1 + "," + oAttrPyramid.y1 + "," + oAttrPyramid.x2 + "," + oAttrPyramid.y2 + "," + oAttrPyramid.x3 + "," + oAttrPyramid.y3 + "," + oAttrPyramid.x4 + "," + oAttrPyramid.y4 + "Z";
                            oAttrLabel.text = Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i];
                            oAttrLabel.x = availWidth - oAttrPyramid.x1;
                            oAttrLabel.y = (oAttrPyramid.y1 + oAttrPyramid.y4) / 2;
                            var xCord, yCord, pointsParametersArray, textBox, xToolTip, yToolTip;
                            this.path[i].attr({ 'd': pointsParameters, 'text': Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i] + ": " + Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i], 'color': this.color[i] })
                                .style({ 'fill': this.color[i], 'stroke': this.color[i], 'stroke-width': '1' });
                            this.path[i].on("mouseover", function (d) {
                                pointsParametersArray = this.getAttribute('d').slice(1, this.getAttribute('d').length - 1).split(',');
                                yCord = (parseFloat(pointsParametersArray[1]) + parseFloat(pointsParametersArray[5])) / 2;
                                mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px' });
                                textBox = document.getElementById('toolTip').getBoundingClientRect();
                                mainGroup.append('rect').attr({ 'width': textBox.width + 10, 'height': textBox.height + 5, 'x': d3.mouse(this)[0] + 10, 'y': d3.mouse(this)[1] - 26.5, 'id': 'toolTipRect' }).style({ 'fill': 'white', 'stroke': this.attributes.color.textContent, 'stroke-width': '1' });
                                d3.select("#toolTip").remove();
                                mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px', 'fill': 'black' });
                            })
                                .on("mouseout", function () { d3.select("#toolTip").remove(); d3.select("#toolTipRect").remove(); })
                                .on("mousemove", function () {
                                d3.select("#toolTip").remove();
                                d3.select("#toolTipRect").remove();
                                pointsParametersArray = this.getAttribute('d').slice(1, this.getAttribute('d').length - 1).split(',');
                                yCord = (parseFloat(pointsParametersArray[1]) + parseFloat(pointsParametersArray[5])) / 2;
                                mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px' });
                                textBox = document.getElementById('toolTip').getBoundingClientRect();
                                mainGroup.append('rect').attr({ 'width': textBox.width + 10, 'height': textBox.height + 5, 'x': d3.mouse(this)[0] + 10, 'y': d3.mouse(this)[1] - 26.5, 'id': 'toolTipRect' }).style({ 'fill': 'white', 'stroke': this.attributes.color.textContent });
                                d3.select("#toolTip").remove();
                                mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px', 'fill': 'black' });
                            });
                            oAttrPyramid.x1 = oAttrPyramid.x4;
                            oAttrPyramid.x2 = oAttrPyramid.x3;
                            oAttrPyramid.y1 = oAttrPyramid.y4;
                            oAttrPyramid.y2 = oAttrPyramid.y3;
                            //draw labels
                            this.label[i].text(oAttrLabel.text).attr({ 'x': oAttrLabel.x, 'y': oAttrLabel.y, 'font-size': "2vw" });
                            this.label[i].append("svg:title").text(Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i] + ": " + Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i]);
                            var lineParameters = "M" + availWidth / 2 + "," + oAttrLabel.y + "," + oAttrLabel.x + "," + (oAttrLabel.y - 4) + "Z";
                            this.lines[i].attr({ 'd': lineParameters })
                                .style({ 'fill': this.color[i], 'stroke': this.color[i], 'stroke-width': '1' });
                        }
                    };
                    PyramidChart.prototype.enumerateObjectInstances = function (options) {
                        var objectName = options.objectName;
                        var objectEnumeration = [];
                        switch (options.objectName) {
                            case "sectionColors":
                                for (var _i = 0, _a = this.pyramidChartPoints; _i < _a.length; _i++) {
                                    var pyramidChartPoint = _a[_i];
                                    objectEnumeration.push({
                                        objectName: objectName,
                                        displayName: pyramidChartPoint.category,
                                        properties: {
                                            sColors: {
                                                solid: {
                                                    color: pyramidChartPoint.color
                                                }
                                            }
                                        },
                                        selector: pyramidChartPoint.selectionId.getSelector()
                                    });
                                }
                                break;
                        }
                        return objectEnumeration;
                    };
                    return PyramidChart;
                }());
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.PyramidChart = PyramidChart;
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230872;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230872) {
                /**
                 * Gets property value for a particular object.
                 *
                 * @function
                 * @param {DataViewObjects} objects - Map of defined objects.
                 * @param {string} objectName       - Name of desired object.
                 * @param {string} propertyName     - Name of desired property.
                 * @param {T} defaultValue          - Default value of desired property.
                 */
                function getValue(objects, objectName, propertyName, defaultValue) {
                    if (objects) {
                        var object = objects[objectName];
                        if (object) {
                            var property = object[propertyName];
                            if (property !== undefined) {
                                return property;
                            }
                        }
                    }
                    return defaultValue;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.getValue = getValue;
                /**
                 * Gets property value for a particular object in a category.
                 *
                 * @function
                 * @param {DataViewCategoryColumn} category - List of category objects.
                 * @param {number} index                    - Index of category object.
                 * @param {string} objectName               - Name of desired object.
                 * @param {string} propertyName             - Name of desired property.
                 * @param {T} defaultValue                  - Default value of desired property.
                 */
                function getCategoricalObjectValue(category, index, objectName, propertyName, defaultValue) {
                    var categoryObjects = category.objects;
                    if (categoryObjects) {
                        var categoryObject = categoryObjects[index];
                        if (categoryObject) {
                            var object = categoryObject[objectName];
                            if (object) {
                                var property = object[propertyName];
                                if (property !== undefined) {
                                    return property;
                                }
                            }
                        }
                    }
                    return defaultValue;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.getCategoricalObjectValue = getCategoricalObjectValue;
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872_DEBUG = {
                name: 'PBI_CV_309E6B47_39A5_4681_808F_132AFB230872_DEBUG',
                displayName: 'Pyramid chart',
                class: 'PyramidChart',
                version: '1.0.0',
                apiVersion: '1.1.0',
                create: function (options) { return new powerbi.extensibility.visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.PyramidChart(options); },
                custom: true
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
//# sourceMappingURL=visual.js.map