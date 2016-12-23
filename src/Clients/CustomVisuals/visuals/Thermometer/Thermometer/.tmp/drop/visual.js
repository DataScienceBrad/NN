var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230872;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230872) {
                var Thermometer = (function () {
                    /** This is called once when the visual is initialially created */
                    function Thermometer(options) {
                        this.prevDataViewObjects = {};
                        this.viewport;
                        var svg = this.svg = d3.select(options.element).append('svg').classed('Thermometer', true);
                        options.element.setAttribute("id", "container");
                        var mainGroup = svg.append('g');
                        this.backRect = mainGroup.append('rect');
                        this.backCircle = mainGroup.append('circle');
                        this.fillRect = mainGroup.append('rect');
                        this.fillCircle = mainGroup.append('circle');
                        this.text = mainGroup.append('text');
                        this.tempMarkings = svg.append("g").attr("class", "y axis");
                    }
                    Thermometer.converter = function (dataView, colors) {
                        var series = dataView.categorical.values;
                        return { value: series[0].values[series[0].values.length - 1] };
                    };
                    /** Update is called for data updates, resizes & formatting changes */
                    Thermometer.prototype.update = function (options) {
                        if (!options.dataViews)
                            return;
                        if (0 === options.dataViews.length)
                            return;
                        var dataView = options.dataViews[0];
                        this.dataView = options.dataViews[0];
                        this.data = Thermometer.converter(options.dataViews[0], null);
                        this.data.max = Thermometer.getValue(dataView, 'max', 100);
                        this.data.min = Thermometer.getValue(dataView, 'min', 0);
                        this.data.drawTickBar = Thermometer.getValue(dataView, 'tickBar', true);
                        // to handle value greater than max value
                        if (this.data.value > this.data.max) {
                            this.data.max = Math.ceil(this.data.value);
                        }
                        if (this.data.value < this.data.min) {
                            this.data.min = Math.floor(this.data.value);
                        }
                        var viewport = options.viewport;
                        var height = viewport.height;
                        var width = viewport.width;
                        var duration = 1000;
                        this.svg.attr({ 'height': height, 'width': width });
                        this.draw(width, height, duration);
                    };
                    Thermometer.prototype.draw = function (width, height, duration) {
                        var radius = height * 0.1;
                        var padding = radius * 0.25;
                        this.drawBack(width, height, radius);
                        this.drawFill(width, height, radius, padding, duration);
                        this.drawTicks(width, height, radius, padding);
                        this.drawText(width, height, radius, padding);
                        d3.select("#y axis").remove();
                    };
                    Thermometer.prototype.drawBack = function (width, height, radius) {
                        var rectHeight = height - radius;
                        var fill = Thermometer.getFill(this.dataView, 'border').solid.color; //'D3C8B4';
                        this.backCircle
                            .attr({
                            'cx': width / 2,
                            'cy': rectHeight,
                            'r': radius
                        })
                            .style({
                            'fill': fill
                        });
                        this.backRect
                            .attr({
                            'x': (width - radius) / 2,
                            'y': 0,
                            'width': radius,
                            'height': rectHeight
                        })
                            .style({
                            'fill': fill
                        });
                    };
                    Thermometer.prototype.drawFill = function (width, height, radius, padding, duration) {
                        var innerRadius = radius * 0.8;
                        var fillWidth = innerRadius * 0.7;
                        var ZeroValue = height - (radius * 2) - padding;
                        var fill = Thermometer.getFill(this.dataView, 'fill').solid.color;
                        var min = this.data.min;
                        var max = this.data.max;
                        var value = this.data.value > max ? max : this.data.value;
                        var percentage = (ZeroValue - padding) * ((value - min) / (max - min));
                        var rectHeight = height - radius;
                        this.fillCircle.attr({
                            'cx': width / 2,
                            'cy': rectHeight,
                            'r': innerRadius
                        }).style({
                            'fill': fill
                        });
                        this.fillRect
                            .style({
                            'fill': fill
                        })
                            .attr({
                            'x': (width - fillWidth) / 2,
                            'width': fillWidth,
                        })
                            .attr({
                            'y': ZeroValue - percentage,
                            'height': rectHeight - ZeroValue + percentage
                        });
                    };
                    Thermometer.prototype.drawTicks = function (width, height, radius, padding) {
                        d3.select(".y.axis").attr("visibility", "visible");
                        var y, yAxis;
                        var postFix = Thermometer.getValue(this.dataView, 'postfix', '');
                        console.log(postFix);
                        y = d3.scale.linear().range([height - (radius * 2) - padding, padding]);
                        yAxis = d3.svg.axis().scale(y).ticks(6).orient("right");
                        y.domain([this.data.min, this.data.max]);
                        this.tempMarkings
                            .attr("transform", "translate(" + ((width + radius) / 2 + (radius * 0.15)) + ",0)")
                            .style({
                            'font-size': (radius * 0.03) + 'em',
                            'font-family': 'Segoe UI',
                            'stroke': 'none',
                            'fill': '#333'
                        })
                            .call(yAxis);
                        this.tempMarkings.selectAll('.axis line, .axis path').style({ 'stroke': '#333', 'fill': 'none' });
                        for (var iCount = 0; iCount < document.querySelectorAll('.axis text').length; iCount++) {
                            document.querySelectorAll('.axis text')[iCount].innerHTML = document.querySelectorAll('.axis text')[iCount].innerHTML + ' ' + postFix;
                        }
                        if (!this.data.drawTickBar) {
                            d3.select(".y.axis").attr("visibility", "hidden");
                        }
                    };
                    Thermometer.prototype.drawText = function (width, height, radius, padding) {
                        this.text
                            .text((this.data.value > this.data.max ? this.data.max : this.data.value) | 0)
                            .attr({ 'x': width / 2, y: height - radius, 'dy': '.35em' })
                            .style({
                            'fill': Thermometer.getFill(this.dataView, 'fontColor').solid.color,
                            'text-anchor': 'middle',
                            'font-family': 'Segoe UI',
                            'font-size': (radius * 0.03) + 'em'
                        });
                    };
                    Thermometer.prototype.enumerateObjectInstances = function (options) {
                        var instances = [];
                        var dataView = this.dataView;
                        switch (options.objectName) {
                            case 'config':
                                var config = {
                                    objectName: 'config',
                                    displayName: 'Configurations',
                                    selector: null,
                                    properties: {
                                        fill: Thermometer.getFill(dataView, 'fill'),
                                        border: Thermometer.getFill(dataView, 'border'),
                                        max: Thermometer.getValue(dataView, 'max', 100),
                                        min: Thermometer.getValue(dataView, 'min', 0),
                                        tickBar: Thermometer.getValue(dataView, 'tickBar', true),
                                        fontColor: Thermometer.getFill(dataView, 'fontColor'),
                                        postfix: Thermometer.getValue(dataView, 'postfix', '')
                                    }
                                };
                                instances.push(config);
                                break;
                        }
                        return instances;
                    };
                    Thermometer.getFill = function (dataView, key) {
                        if (dataView) {
                            var objects = dataView.metadata.objects;
                            if (objects) {
                                var config = objects['config'];
                                if (config) {
                                    var fill = config[key];
                                    if (fill)
                                        return fill;
                                }
                            }
                        }
                        if ('fill' === key) {
                            return { solid: { color: '#30ADFF' } };
                        }
                        else if ('fontColor' === key) {
                            return { solid: { color: '#000' } };
                        }
                        return { solid: { color: '#D0EEF7' } };
                    };
                    Thermometer.getValue = function (dataView, key, defaultValue) {
                        if (dataView) {
                            var objects = dataView.metadata.objects;
                            if (objects) {
                                var config = objects['config'];
                                if (config) {
                                    var size = config[key];
                                    if (size != null)
                                        return size;
                                }
                            }
                        }
                        return defaultValue;
                    };
                    return Thermometer;
                }());
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.Thermometer = Thermometer;
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
            plugins.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872 = {
                name: 'PBI_CV_309E6B47_39A5_4681_808F_132AFB230872',
                displayName: 'Thermometer',
                class: 'Thermometer',
                version: '1.0.0',
                apiVersion: '1.1.0',
                create: function (options) { return new powerbi.extensibility.visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872.Thermometer(options); },
                custom: true
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
//# sourceMappingURL=visual.js.map