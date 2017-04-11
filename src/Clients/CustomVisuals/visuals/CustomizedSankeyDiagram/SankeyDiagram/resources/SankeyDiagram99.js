var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var SankeyDiagram1479076594374;
        (function (SankeyDiagram1479076594374) {
            var createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
            var pixelConverterFromPoint = jsCommon.PixelConverter.fromPoint;
            // powerbi
            var TextMeasurementService = powerbi.TextMeasurementService;
            var VisualDataRoleKind = powerbi.VisualDataRoleKind;
            var DataViewObjects = powerbi.DataViewObjects;
            // powerbi.visuals
            var ValueFormatter = powerbi.visuals.valueFormatter;
            var SelectionId = powerbi.visuals.SelectionId;
            var DataColorPalette = powerbi.visuals.DataColorPalette;
            var SVGUtil = powerbi.visuals.SVGUtil;
            var ColorHelper = powerbi.visuals.ColorHelper;
            var TooltipManager = powerbi.visuals.TooltipManager;
            var ObjectEnumerationBuilder = powerbi.visuals.ObjectEnumerationBuilder;
            var appendClearCatcher = powerbi.visuals.appendClearCatcher;
            var createInteractivityService = powerbi.visuals.createInteractivityService;
            //props
            SankeyDiagram1479076594374.SankeyChartProps = {
                linkLabels: {
                    show: { objectName: 'linkLabels', propertyName: 'show' },
                    color: { objectName: 'linkLabels', propertyName: 'color' },
                    fontSize: { objectName: 'linkLabels', propertyName: 'fontSize' },
                    displayUnits: { objectName: 'linkLabels', propertyName: 'displayUnits' },
                    textPrecision: { objectName: 'linkLabels', propertyName: 'textPrecision' }
                }
            };
            ;
            var SankeyDiagram = (function () {
                function SankeyDiagram(constructorOptions) {
                    this.margin = {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    };
                    this.nodeWidth = 21.5;
                    this.curvatureOfLinks = 0.5;
                    if (constructorOptions) {
                        this.svg = constructorOptions.svg;
                        this.margin = constructorOptions.margin || this.margin;
                        this.curvatureOfLinks = constructorOptions.curvatureOfLinks || this.curvatureOfLinks;
                    }
                }
                SankeyDiagram.getProperties = function (capabilities) {
                    var result = {};
                    for (var objectKey in capabilities.objects) {
                        result[objectKey] = {};
                        for (var propKey in capabilities.objects[objectKey].properties) {
                            result[objectKey][propKey] = {
                                objectName: objectKey,
                                propertyName: propKey
                            };
                        }
                    }
                    return result;
                };
                Object.defineProperty(SankeyDiagram.prototype, "textProperties", {
                    get: function () {
                        return {
                            fontFamily: this.root.style("font-family"),
                            fontSize: pixelConverterFromPoint(this.dataView ? this.dataView.settings.fontSize : SankeyDiagram.DefaultSettings.fontSize)
                        };
                    },
                    enumerable: true,
                    configurable: true
                });
                SankeyDiagram.prototype.init = function (visualsInitOptions) {
                    var style = visualsInitOptions.style;
                    if (this.svg) {
                        this.root = this.svg;
                    }
                    else {
                        this.root = d3.select(visualsInitOptions.element.get(0)).append("svg");
                    }
                    this.interactivityService = createInteractivityService(visualsInitOptions.host);
                    this.behavior = SankeyDiagramBehavior.create();
                    this.clearCatcher = appendClearCatcher(this.root);
                    this.colours = style && style.colorPalette ? style.colorPalette.dataColors : new DataColorPalette();
                    this.root.classed(SankeyDiagram.ClassName, true);
                    this.main = this.root.append("g");
                    this.links = this.main.append("g").classed(SankeyDiagram.Links.class, true);
                    this.nodes = this.main.append("g").classed(SankeyDiagram.Nodes.class, true);
                };
                SankeyDiagram.prototype.onClearSelection = function () {
                    if (this.interactivityService) {
                        this.interactivityService.clearSelection();
                    }
                };
                SankeyDiagram.prototype.update = function (visualUpdateOptions) {
                    if (!visualUpdateOptions || !visualUpdateOptions.dataViews) {
                        return;
                    }
                    var dataView = visualUpdateOptions.dataViews[0], sankeyDiagramDataView;
                    this.updateViewport(visualUpdateOptions.viewport);
                    sankeyDiagramDataView = this.converter(dataView);
                    this.computePositions(sankeyDiagramDataView);
                    this.dataView = sankeyDiagramDataView;
                    this.dataViews = visualUpdateOptions.dataViews;
                    this.applySelectionStateToData();
                    this.render(sankeyDiagramDataView);
                };
                SankeyDiagram.prototype.updateViewport = function (viewport) {
                    var height, width;
                    height = this.getPositiveNumber(viewport.height);
                    width = this.getPositiveNumber(viewport.width);
                    this.viewport = {
                        height: this.getPositiveNumber(height - this.margin.top - this.margin.bottom),
                        width: this.getPositiveNumber(width - this.margin.left - this.margin.right)
                    };
                    this.updateElements(height, width);
                };
                /**
                 * Public for testability.
                 */
                SankeyDiagram.prototype.getPositiveNumber = function (value) {
                    return value < 0 || isNaN(value) || value === null || value === Infinity || value === -Infinity ? 0 : value;
                };
                SankeyDiagram.prototype.updateElements = function (height, width) {
                    this.root.attr({
                        "height": height,
                        "width": width
                    });
                    this.main.attr("transform", SVGUtil.translate(this.margin.left, this.margin.top));
                };
                SankeyDiagram.prototype.converter = function (dataView) {
                    var _this = this;
                    if (!dataView || !dataView.categorical || !dataView.categorical.categories || !dataView.categorical.categories[0] || !dataView.categorical.categories[1] || !dataView.categorical.categories[0].values || !dataView.categorical.categories[1].values) {
                        return {
                            nodes: [],
                            links: [],
                            columns: [],
                            settings: {
                                scale: { x: 1, y: 1 },
                                colourOfLabels: SankeyDiagram.DefaultSettings.colourOfLabels,
                                fontSize: SankeyDiagram.DefaultSettings.fontSize
                            }
                        };
                    }
                    var nodes = [], links = [], dataPoints = [], sourceCategory = dataView.categorical.categories[0], categories = sourceCategory.values, secondCategories = dataView.categorical.categories[1].values, valuesColumn = dataView.categorical.values && dataView.categorical.values[0], weightValues = [], allCategories, valueFormatterForCategories, formatOfWeigth = "g", valuesFormatterForWeigth, objects, linksObjects = sourceCategory.objects || [], labelColour, settings, shiftOfColour, selectionIdBuilder = SankeyDiagramSelectionIdBuilder.create();
                    //nodeColorsSettings :nodeColorsSettings;
                    if (valuesColumn && valuesColumn.values && valuesColumn.values.map) {
                        weightValues = valuesColumn.values.map(function (x) {
                            return x ? x : 0;
                        });
                    }
                    selectionIdBuilder.addCategories(dataView.categorical.categories);
                    objects = this.getObjectsFromDataView(dataView);
                    labelColour = this.getColour(SankeyDiagram.Properties["labels"]["fill"], SankeyDiagram.DefaultSettings.colourOfLabels, objects);
                    if (valuesColumn && valuesColumn.source) {
                        formatOfWeigth = ValueFormatter.getFormatString(valuesColumn.source, SankeyDiagram.Properties["general"]["formatString"]);
                    }
                    dataPoints = categories.map(function (item, index) {
                        return {
                            source: item,
                            destination: secondCategories[index],
                            weigth: valuesColumn ? Math.max(weightValues[index] || 0, 0) : 1
                        };
                    });
                    allCategories = categories.concat(secondCategories);
                    valueFormatterForCategories = ValueFormatter.create({
                        format: ValueFormatter.getFormatString(dataView.categorical.categories[0].source, SankeyDiagram.Properties["general"]["formatString"]),
                        value: allCategories[0],
                        value2: allCategories[allCategories.length - 1]
                    });
                    valuesFormatterForWeigth = ValueFormatter.create({
                        format: formatOfWeigth,
                        value: Math.max(d3.max(weightValues) || 1, 1),
                    });
                    allCategories.forEach(function (item, index) {
                        if (!nodes.some(function (node) {
                            if (item === node.label.name) {
                                var selectionId = selectionIdBuilder.createSelectionId(index);
                                node.selectableDataPoints.push(_this.createSelectableDataPoint(selectionId));
                                return true;
                            }
                            return false;
                        })) {
                            var formattedValue = valueFormatterForCategories.format(item), label, selectableDataPoint, textProperties = {
                                text: formattedValue,
                                fontFamily: _this.textProperties.fontFamily,
                                fontSize: _this.textProperties.fontSize
                            };
                            label = {
                                name: item,
                                formattedName: valueFormatterForCategories.format(item),
                                width: TextMeasurementService.measureSvgTextWidth(textProperties),
                                height: TextMeasurementService.estimateSvgTextHeight(textProperties),
                                colour: labelColour
                            };
                            selectableDataPoint = _this.createSelectableDataPoint(selectionIdBuilder.createSelectionId(index));
                            nodes.push({
                                label: label,
                                links: [],
                                inputWeight: 0,
                                outputWeight: 0,
                                width: _this.nodeWidth,
                                height: 0,
                                colour: SankeyDiagram.DefaultColourOfNode,
                                tooltipInfo: [],
                                selectableDataPoints: [selectableDataPoint]
                            });
                        }
                    });
                    for (var i = 0; i < nodes.length; i++) {
                        //nodes[i].colour = this.colours.getColorByIndex(Math.floor(i * shiftOfColour)).value;
                        if (nodes[i].label.formattedName.indexOf("1-") !== -1) {
                            nodes[i].colour = "#176B5D";
                        }
                        else if (nodes[i].label.formattedName.indexOf("2-") !== -1) {
                            nodes[i].colour = "#2298A6";
                        }
                        else if (nodes[i].label.formattedName.indexOf("3-") !== -1) {
                            nodes[i].colour = "#4EB7AC";
                        }
                        else if (nodes[i].label.formattedName.indexOf("4-") !== -1) {
                            nodes[i].colour = "#EC5635";
                        }
                        else if (nodes[i].label.formattedName.indexOf("5-") !== -1) {
                            nodes[i].colour = "#C3232E";
                        }
                        else {
                            nodes[i].colour = "#000";
                        }
                    }
                    /*
                    nodes.forEach((node: SankeyDiagramNode, index: number) => {
                        node.colour = this.colours.getColorByIndex(Math.floor(index * shiftOfColour)).value;
                        /*
                        node.colour = this.getColour(
                            SankeyDiagram.Properties["nodes"]["fill"],
                            SankeyDiagram.DefaultColourOfLink,
                            linksObjects[index]);
                            
                    });
                    */
                    dataPoints.forEach(function (dataPoint, index) {
                        var sourceNode, destinationNode, link, linkColour, selectionId;
                        if (dataPoint.source === dataPoint.destination) {
                            return;
                        }
                        nodes.forEach(function (node) {
                            if (node.label.name === dataPoint.source) {
                                sourceNode = node;
                            }
                            if (node.label.name === dataPoint.destination) {
                                destinationNode = node;
                            }
                        });
                        linkColour = _this.getColour(SankeyDiagram.Properties["links"]["fill"], SankeyDiagram.DefaultColourOfLink, linksObjects[index]);
                        selectionId = selectionIdBuilder.createSelectionId(index);
                        link = {
                            source: sourceNode,
                            destination: destinationNode,
                            weigth: dataPoint.weigth,
                            height: dataPoint.weigth,
                            colour: linkColour,
                            tooltipInfo: _this.getTooltipDataForLink(valuesFormatterForWeigth, sourceNode.label.formattedName, destinationNode.label.formattedName, dataPoint.weigth),
                            identity: selectionId,
                            selected: false
                        };
                        links.push(link);
                        sourceNode.links.push(link);
                        destinationNode.links.push(link);
                        _this.updateValueOfNode(sourceNode);
                        _this.updateValueOfNode(destinationNode);
                        sourceNode.tooltipInfo = _this.getTooltipForNode(valuesFormatterForWeigth, sourceNode.label.formattedName, sourceNode.inputWeight ? sourceNode.inputWeight : sourceNode.outputWeight);
                        destinationNode.tooltipInfo = _this.getTooltipForNode(valuesFormatterForWeigth, destinationNode.label.formattedName, destinationNode.inputWeight ? destinationNode.inputWeight : destinationNode.outputWeight);
                    });
                    settings = this.parseSettings(objects);
                    settings.colourOfLabels = labelColour;
                    return {
                        nodes: nodes,
                        links: links,
                        settings: settings,
                        columns: []
                    };
                };
                SankeyDiagram.prototype.createSelectableDataPoint = function (selectionId, isSelected) {
                    if (isSelected === void 0) { isSelected = false; }
                    return {
                        identity: selectionId,
                        selected: isSelected
                    };
                };
                SankeyDiagram.prototype.getObjectsFromDataView = function (dataView) {
                    if (!dataView || !dataView.metadata || !dataView.metadata.columns || !dataView.metadata.objects) {
                        return null;
                    }
                    return dataView.metadata.objects;
                };
                SankeyDiagram.prototype.getColour = function (properties, defaultColor, objects) {
                    var colorHelper;
                    colorHelper = new ColorHelper(this.colours, properties, defaultColor);
                    return colorHelper.getColorForMeasure(objects, "");
                };
                SankeyDiagram.prototype.getTooltipDataForLink = function (valueFormatter, sourceNodeName, destinationNodeName, linkWeight) {
                    var formattedLinkWeight;
                    if (valueFormatter && valueFormatter.format) {
                        formattedLinkWeight = valueFormatter.format(linkWeight);
                    }
                    else {
                        formattedLinkWeight = linkWeight.toString();
                    }
                    return [
                        {
                            displayName: SankeyDiagram.RoleNames.rows,
                            value: sourceNodeName
                        },
                        {
                            displayName: SankeyDiagram.RoleNames.columns,
                            value: destinationNodeName
                        },
                        {
                            displayName: SankeyDiagram.RoleNames.values,
                            value: formattedLinkWeight
                        }
                    ];
                };
                SankeyDiagram.prototype.updateValueOfNode = function (node) {
                    node.inputWeight = node.links.reduce(function (previousValue, currentValue) {
                        return previousValue + (currentValue.destination === node ? currentValue.weigth : 0);
                    }, 0);
                    node.outputWeight = node.links.reduce(function (previousValue, currentValue) {
                        return previousValue + (currentValue.source === node ? currentValue.weigth : 0);
                    }, 0);
                };
                SankeyDiagram.prototype.getTooltipForNode = function (valueFormatter, nodeName, nodeWeight) {
                    var formattedNodeWeigth;
                    if (valueFormatter && valueFormatter.format) {
                        formattedNodeWeigth = valueFormatter.format(nodeWeight);
                    }
                    else {
                        formattedNodeWeigth = nodeWeight.toString();
                    }
                    return [
                        {
                            displayName: "Name",
                            value: nodeName
                        },
                        {
                            displayName: SankeyDiagram.RoleNames.values,
                            value: formattedNodeWeigth
                        }
                    ];
                };
                SankeyDiagram.prototype.parseSettings = function (objects) {
                    var isVisibleLabels = false;
                    isVisibleLabels = DataViewObjects.getValue(objects, SankeyDiagram.Properties["labels"]["show"], SankeyDiagram.DefaultSettings.isVisibleLabels);
                    return {
                        isVisibleLabels: isVisibleLabels,
                        scale: {
                            x: SankeyDiagram.DefaultSettings.scale.x,
                            y: SankeyDiagram.DefaultSettings.scale.y
                        },
                        colourOfLabels: SankeyDiagram.DefaultSettings.colourOfLabels,
                        fontSize: DataViewObjects.getValue(objects, SankeyDiagram.Properties["labels"]["fontSize"], SankeyDiagram.DefaultSettings.fontSize)
                    };
                };
                SankeyDiagram.prototype.computePositions = function (sankeyDiagramDataView) {
                    var _this = this;
                    var maxXPosition, maxColumn, columns;
                    maxXPosition = this.computeXPositions(sankeyDiagramDataView);
                    this.sortNodesByX(sankeyDiagramDataView.nodes);
                    columns = this.getColumns(sankeyDiagramDataView.nodes);
                    maxColumn = this.getMaxColumn(columns);
                    sankeyDiagramDataView.settings.scale.x = this.getScaleByAxisX(maxXPosition);
                    sankeyDiagramDataView.settings.scale.y = this.getScaleByAxisY(maxColumn.sumValueOfNodes);
                    this.scalePositionsByAxes(sankeyDiagramDataView.nodes, columns, sankeyDiagramDataView.settings.scale, this.viewport.height);
                    this.computeYPosition(sankeyDiagramDataView.nodes, sankeyDiagramDataView.settings.scale.y);
                    sankeyDiagramDataView.nodes.forEach(function (node, i) {
                        var textHeight = TextMeasurementService.estimateSvgTextHeight({
                            text: node.label.formattedName,
                            fontFamily: _this.textProperties.fontFamily,
                            fontSize: _this.textProperties.fontSize
                        });
                        node.left = node.x + _this.getLabelPositionByAxisX(node);
                        node.right = node.left + (sankeyDiagramDataView.settings.scale.x - node.width) - SankeyDiagram.NodeMargin;
                        node.top = node.y + node.height / 2;
                        node.bottom = node.top + textHeight;
                        node.label.maxWidth = sankeyDiagramDataView.settings.scale.x - node.width - SankeyDiagram.NodeMargin * 2;
                    });
                    sankeyDiagramDataView.nodes.forEach(function (node1) {
                        sankeyDiagramDataView.nodes.forEach(function (node2) {
                            if (node1.x <= node2.x) {
                                return;
                            }
                            if (SankeyDiagram.isIntersect(node1, node2)) {
                                node1.label.maxWidth = (sankeyDiagramDataView.settings.scale.x - node1.width) / 2 - SankeyDiagram.NodeMargin;
                                node2.label.maxWidth = (sankeyDiagramDataView.settings.scale.x - node2.width) / 2 - SankeyDiagram.NodeMargin;
                            }
                        });
                    });
                };
                SankeyDiagram.isIntersect = function (a, b) {
                    return Math.max(a.left, b.left) < Math.min(a.right, b.right) && Math.max(a.top, b.top) < Math.min(a.bottom, b.bottom);
                };
                SankeyDiagram.prototype.computeXPositions = function (sankeyDiagramDataView) {
                    var nodes = sankeyDiagramDataView.nodes, nextNodes = [], previousNodes = [], x = 0, isRecursiveDependencies = false;
                    while (nodes.length > 0) {
                        nextNodes = [];
                        nodes.forEach(function (node) {
                            node.x = x;
                            node.links.forEach(function (link) {
                                if (node === link.source && node !== link.destination) {
                                    if (nextNodes.every(function (item) {
                                        return item !== link.destination;
                                    })) {
                                        nextNodes.push(link.destination);
                                    }
                                }
                            });
                        });
                        isRecursiveDependencies = nextNodes.length === previousNodes.length && previousNodes.every(function (previousNode) {
                            return nextNodes.some(function (nextNode) {
                                return nextNode === previousNode;
                            });
                        });
                        if (isRecursiveDependencies) {
                            previousNodes.forEach(function (element) {
                                element.x = x;
                                x++;
                            });
                            nodes = [];
                        }
                        else {
                            nodes = nextNodes;
                            previousNodes = nodes;
                            x++;
                        }
                    }
                    return x - 1;
                };
                SankeyDiagram.prototype.getScaleByAxisX = function (numberOfColumns) {
                    if (numberOfColumns === void 0) { numberOfColumns = 1; }
                    return this.getPositiveNumber((this.viewport.width - this.nodeWidth) / numberOfColumns);
                };
                /**
                 * Public for testability.
                 */
                SankeyDiagram.prototype.sortNodesByX = function (nodes) {
                    return nodes.sort(function (firstNode, secondNode) {
                        return firstNode.x - secondNode.x;
                    });
                };
                /**
                 * Public for testability.
                 */
                SankeyDiagram.prototype.getColumns = function (nodes) {
                    var columns = [], currentX = -Number.MAX_VALUE;
                    nodes.forEach(function (node, index) {
                        if (currentX !== node.x) {
                            columns.push({
                                countOfNodes: 0,
                                sumValueOfNodes: 0
                            });
                            currentX = node.x;
                        }
                        if (columns[node.x]) {
                            columns[node.x].sumValueOfNodes += Math.max(node.inputWeight, node.outputWeight);
                            columns[node.x].countOfNodes++;
                        }
                    });
                    return columns;
                };
                /**
                 * Public for testability.
                 */
                SankeyDiagram.prototype.getMaxColumn = function (columns) {
                    if (columns === void 0) { columns = []; }
                    var currentMaxColumn = { sumValueOfNodes: 0, countOfNodes: 0 };
                    columns.forEach(function (column) {
                        if (column && column.sumValueOfNodes > currentMaxColumn.sumValueOfNodes) {
                            currentMaxColumn = column;
                        }
                    });
                    return currentMaxColumn;
                };
                SankeyDiagram.prototype.getScaleByAxisY = function (sumValueOfNodes) {
                    return this.getPositiveNumber((this.viewport.height - this.getAvailableSumNodeMarginByY()) / sumValueOfNodes);
                };
                SankeyDiagram.prototype.getAvailableSumNodeMarginByY = function () {
                    return this.viewport ? this.viewport.height * SankeyDiagram.NodeBottomMargin / 100 : 0;
                };
                SankeyDiagram.prototype.scalePositionsByAxes = function (nodes, columns, scale, viewportHeight) {
                    var shiftByAxisY = 0, currentX = 0, index = 0;
                    nodes.forEach(function (node) {
                        var offsetByY = 0, availableHeight = 0;
                        if (currentX !== node.x) {
                            currentX = node.x;
                            shiftByAxisY = 0;
                            index = 0;
                        }
                        if (columns[currentX]) {
                            availableHeight = viewportHeight - columns[currentX].sumValueOfNodes * scale.y;
                            offsetByY = availableHeight / columns[currentX].countOfNodes;
                        }
                        node.x *= scale.x;
                        node.height = Math.max(node.inputWeight, node.outputWeight) * scale.y;
                        node.y = shiftByAxisY + offsetByY * index;
                        shiftByAxisY += node.height;
                        index++;
                    });
                };
                // TODO: Update this method to improve a distribution by height.
                SankeyDiagram.prototype.computeYPosition = function (nodes, scale) {
                    nodes.forEach(function (node) {
                        node.links = node.links.sort(function (firstLink, secondLink) {
                            var firstY, secondY;
                            firstY = firstLink.source === node ? firstLink.destination.y : firstLink.source.y;
                            secondY = secondLink.source === node ? secondLink.destination.y : secondLink.source.y;
                            return firstY - secondY;
                        });
                        var shiftByAxisYOfLeftLink = 0, shiftByAxisYOfRightLink = 0;
                        node.links.forEach(function (link) {
                            var shiftByAxisY = 0;
                            link.height = link.weigth * scale;
                            if (link.source.x < node.x || link.destination.x < node.x) {
                                shiftByAxisY = shiftByAxisYOfLeftLink;
                                shiftByAxisYOfLeftLink += link.height;
                            }
                            else if (link.source.x > node.x || link.destination.x > node.x) {
                                shiftByAxisY = shiftByAxisYOfRightLink;
                                shiftByAxisYOfRightLink += link.height;
                            }
                            if (link.source === node) {
                                link.dySource = shiftByAxisY;
                            }
                            else if (link.destination === node) {
                                link.dyDestination = shiftByAxisY;
                            }
                        });
                    });
                };
                SankeyDiagram.prototype.applySelectionStateToData = function () {
                    this.interactivityService.applySelectionStateToData(this.getSelectableDataPoints());
                };
                SankeyDiagram.prototype.getSelectableDataPoints = function () {
                    var dataPoints = this.dataView.links;
                    this.dataView.nodes.forEach(function (node) {
                        dataPoints = dataPoints.concat(node.selectableDataPoints);
                    });
                    return dataPoints;
                };
                SankeyDiagram.prototype.render = function (sankeyDiagramDataView) {
                    var nodesSelection, linksSelection;
                    linksSelection = this.renderLinks(sankeyDiagramDataView);
                    this.renderTooltip(linksSelection);
                    nodesSelection = this.renderNodes(sankeyDiagramDataView);
                    this.renderTooltip(nodesSelection);
                    this.bindSelectionHandler(nodesSelection, linksSelection);
                    this.updateSelectionState(nodesSelection, linksSelection);
                };
                SankeyDiagram.prototype.renderNodes = function (sankeyDiagramDataView) {
                    var _this = this;
                    var nodesEnterSelection, nodesSelection, nodeElements;
                    nodeElements = this.main.select(SankeyDiagram.Nodes.selector).selectAll(SankeyDiagram.Node.selector);
                    nodesSelection = nodeElements.data(sankeyDiagramDataView.nodes.filter(function (x) { return x.height > 0; }));
                    nodesEnterSelection = nodesSelection.enter().append("g");
                    nodesSelection.attr("transform", function (node) {
                        return SVGUtil.translate(node.x, node.y);
                    }).classed(SankeyDiagram.Node.class, true);
                    nodesEnterSelection.append("rect").classed(SankeyDiagram.NodeRect.class, true);
                    nodesEnterSelection.append("text").classed(SankeyDiagram.NodeLabel.class, true);
                    nodesSelection.select(SankeyDiagram.NodeRect.selector).style({
                        "fill": function (node) { return node.colour; },
                        "stroke": function (node) { return d3.rgb(node.colour).darker(1.5); }
                    }).attr({
                        x: 0,
                        y: 0,
                        height: function (node) { return node.height; },
                        width: function (node) { return node.width; }
                    });
                    nodesSelection.select(SankeyDiagram.NodeLabel.selector).attr({
                        x: function (node) { return node.left - node.x; },
                        y: function (node) { return node.top - node.y; },
                        dy: "0.35em"
                    }).style("fill", function (node) { return node.label.colour; }).style("font-size", this.textProperties.fontSize).style("display", function (node) {
                        var isNotVisibleLabel = false, labelPositionByAxisX = _this.getCurrentPositionOfLabelByAxisX(node);
                        isNotVisibleLabel = labelPositionByAxisX >= _this.viewport.width || labelPositionByAxisX <= 0 || (node.height + SankeyDiagram.NodeMargin) < node.label.height;
                        if (isNotVisibleLabel || !sankeyDiagramDataView.settings.isVisibleLabels || node.label.maxWidth < SankeyDiagram.MinWidthOfLabel) {
                            return "none";
                        }
                        return null;
                    }).style("text-anchor", function (node) {
                        if (_this.isLabelLargerThanWidth(node)) {
                            return "end";
                        }
                        return null;
                    }).text(function (node) {
                        if (node.label.width > node.label.maxWidth) {
                            return TextMeasurementService.getTailoredTextOrDefault({
                                text: node.label.formattedName,
                                fontFamily: _this.textProperties.fontFamily,
                                fontSize: _this.textProperties.fontSize
                            }, node.label.maxWidth);
                        }
                        return node.label.formattedName;
                    });
                    nodesSelection.exit().remove();
                    return nodesSelection;
                };
                SankeyDiagram.prototype.getLabelPositionByAxisX = function (node) {
                    if (this.isLabelLargerThanWidth(node)) {
                        return -(SankeyDiagram.LabelMargin);
                    }
                    return node.width + SankeyDiagram.LabelMargin;
                };
                SankeyDiagram.prototype.isLabelLargerThanWidth = function (node) {
                    var shiftByAxisX = node.x + node.width + SankeyDiagram.LabelMargin;
                    return shiftByAxisX + node.label.width > this.viewport.width;
                };
                SankeyDiagram.prototype.getCurrentPositionOfLabelByAxisX = function (node) {
                    var labelPositionByAxisX = this.getLabelPositionByAxisX(node);
                    labelPositionByAxisX = labelPositionByAxisX > 0 ? labelPositionByAxisX + node.x + node.label.width + node.width : node.x - labelPositionByAxisX - node.label.width - node.width;
                    return labelPositionByAxisX;
                };
                SankeyDiagram.prototype.renderLinks = function (sankeyDiagramDataView) {
                    var _this = this;
                    var linkLabelSettings = this.getLinkLabelsSettings(this.dataViews[0]);
                    var linksSelection, linksElements;
                    var numberOfLinks = sankeyDiagramDataView.links.length;
                    linksElements = this.main.select(SankeyDiagram.Links.selector).selectAll(SankeyDiagram.Link.selector);
                    linksSelection = linksElements.data(sankeyDiagramDataView.links.filter(function (x) { return x.height > 0; }));
                    linksSelection.enter().append("path").classed(SankeyDiagram.Link.class, true);
                    linksSelection.attr("d", function (link) {
                        return _this.getSvgPath(link);
                    }).style({
                        "stroke-width": function (link) { return link.height; },
                        "stroke": function (link) { return link.colour; }
                    });
                    linksSelection.attr("id", function (link, i) {
                        return "linkPath" + (i + 1);
                    });
                    linksSelection.exit().remove();
                    //debugger;    
                    this.root.selectAll('.linkLabel').remove();
                    if (linkLabelSettings.show) {
                        var mainContext = this.root.select("g");
                        var startOffsetValue = 0;
                        var formatter = visuals.valueFormatter.create({ format: '0', value: linkLabelSettings.displayUnits, precision: linkLabelSettings.textPrecision });
                        for (var i = 0; i < sankeyDiagramDataView.links.length; i++) {
                            if (i <= (numberOfLinks / 2)) {
                                startOffsetValue = (((i + 1) % 5) / (numberOfLinks) * 100) + 5;
                            }
                            else {
                                startOffsetValue = (100 - ((i + 1) * 2));
                            }
                            mainContext.append("svg:text").append("textPath").attr("xlink:href", "#linkPath" + (i + 1)).classed("linkLabel", true).text(formatter.format(sankeyDiagramDataView.links[i].weigth)).style("text-anchor", "middle").style("font-size", linkLabelSettings.fontSize + "px").style("fill", linkLabelSettings.color).attr("startOffset", startOffsetValue + "%");
                        }
                    } //show
                    /*
                   this.root.selectAll('g > .links > text > .linkLabel')
                       .style('font-size',linkLabelSettings.fontSize)
                       .style('fill',linkLabelSettings.color)
                   */
                    //.setAttribute('fill', linkLabelSettings.color);
                    //this.root.selectAll('g > .links > text > .linkLabel')
                    //.setAttribute('fill', linkLabelSettings.color);
                    return linksSelection;
                };
                SankeyDiagram.prototype.getSvgPath = function (link) {
                    var x0, x1, xi, x2, x3, y0, y1;
                    if (link.destination.x < link.source.x) {
                        x0 = link.source.x;
                        x1 = link.destination.x + link.destination.width;
                    }
                    else {
                        x0 = link.source.x + link.source.width;
                        x1 = link.destination.x;
                    }
                    xi = d3.interpolateNumber(x0, x1);
                    x2 = xi(this.curvatureOfLinks);
                    x3 = xi(1 - this.curvatureOfLinks);
                    y0 = link.source.y + link.dySource + link.height / 2;
                    y1 = link.destination.y + link.dyDestination + link.height / 2;
                    return "M " + x0 + " " + y0 + " C " + x2 + " " + y0 + ", " + x3 + " " + y1 + ", " + x1 + " " + y1;
                };
                SankeyDiagram.prototype.renderTooltip = function (selection) {
                    TooltipManager.addTooltip(selection, function (tooltipEvent) {
                        return tooltipEvent.data.tooltipInfo;
                    });
                };
                SankeyDiagram.prototype.updateSelectionState = function (nodesSelection, linksSelection) {
                    sankeyDiagramUtils.updateFillOpacity(nodesSelection, this.interactivityService, false);
                    sankeyDiagramUtils.updateFillOpacity(linksSelection, this.interactivityService, true);
                };
                SankeyDiagram.prototype.bindSelectionHandler = function (nodesSelection, linksSelection) {
                    if (!this.interactivityService || !this.dataView) {
                        return;
                    }
                    var behaviorOptions = {
                        nodes: nodesSelection,
                        links: linksSelection,
                        clearCatcher: this.clearCatcher,
                        interactivityService: this.interactivityService
                    };
                    this.interactivityService.bind(this.getSelectableDataPoints(), this.behavior, behaviorOptions, {
                        overrideSelectionFromData: true
                    });
                };
                SankeyDiagram.prototype.enumerateObjectInstances = function (options) {
                    var enumeration = new ObjectEnumerationBuilder();
                    var linkLabelsSettings = this.getLinkLabelsSettings(this.dataViews[0]);
                    //var nodeColorsSettings: nodeColorsSettings = this.getNodeColorsSettings(this.dataViews[0]);
                    if (!this.dataView) {
                        return [];
                    }
                    switch (options.objectName) {
                        case "labels": {
                            this.enumerateLabels(enumeration);
                            break;
                        }
                        case 'linkLabels':
                            enumeration.pushInstance({
                                objectName: 'linkLabels',
                                displayName: 'Link Labels',
                                selector: null,
                                properties: {
                                    show: linkLabelsSettings.show,
                                    color: linkLabelsSettings.color,
                                    fontSize: linkLabelsSettings.fontSize,
                                    displayUnits: linkLabelsSettings.displayUnits,
                                    textPrecision: linkLabelsSettings.textPrecision,
                                }
                            });
                            break;
                        case "links": {
                            this.enumerateLinks(enumeration);
                            break;
                        }
                    }
                    return enumeration.complete();
                };
                SankeyDiagram.prototype.enumerateLabels = function (enumeration) {
                    var settings = this.dataView.settings, labels;
                    if (!settings) {
                        return;
                    }
                    labels = {
                        objectName: "labels",
                        displayName: "labels",
                        selector: null,
                        properties: {
                            show: settings.isVisibleLabels,
                            fill: settings.colourOfLabels,
                            fontSize: settings.fontSize
                        }
                    };
                    enumeration.pushInstance(labels);
                };
                SankeyDiagram.prototype.enumerateLinks = function (enumeration) {
                    var links = this.dataView.links;
                    if (!links || !(links.length > 0)) {
                        return;
                    }
                    links.forEach(function (link) {
                        enumeration.pushInstance({
                            objectName: "links",
                            displayName: "" + link.source.label.formattedName + " - " + link.destination.label.formattedName,
                            selector: ColorHelper.normalizeSelector(link.identity.getSelector(), false),
                            properties: {
                                fill: { solid: { color: link.colour } }
                            }
                        });
                    });
                };
                /*
                private enumerateNodes(enumeration: ObjectEnumerationBuilder): void {
                    var links: SankeyDiagramLink[] = this.dataView.links;
        
                    if (!links || !(links.length > 0)) {
                        return;
                    }
        
                    links.forEach((link: SankeyDiagramLink) => {
                        enumeration.pushInstance({
                            objectName: "links",
                            displayName: `${link.source.label.formattedName} - ${link.destination.label.formattedName}`,
                            selector: ColorHelper.normalizeSelector(link.identity.getSelector(), false),
                            properties: {
                                fill: { solid: { color: link.colour } }
                            }
                        });
                    });
                }
                */
                SankeyDiagram.prototype.getLinkLabelsSettings = function (dataView) {
                    //debugger;
                    var objects = null;
                    var labelSettings = this.getDefaultLinkLabelsSettings();
                    if (!dataView.metadata || !dataView.metadata.objects)
                        return labelSettings;
                    objects = dataView.metadata.objects;
                    var linkLabelsProperties = SankeyDiagram1479076594374.SankeyChartProps;
                    labelSettings.show = DataViewObjects.getValue(objects, linkLabelsProperties.linkLabels.show, labelSettings.show);
                    labelSettings.color = DataViewObjects.getFillColor(objects, linkLabelsProperties.linkLabels.color, labelSettings.color);
                    labelSettings.fontSize = DataViewObjects.getValue(objects, linkLabelsProperties.linkLabels.fontSize, labelSettings.fontSize);
                    labelSettings.displayUnits = DataViewObjects.getValue(objects, linkLabelsProperties.linkLabels.displayUnits, labelSettings.displayUnits);
                    labelSettings.textPrecision = DataViewObjects.getValue(objects, linkLabelsProperties.linkLabels.textPrecision, labelSettings.textPrecision);
                    labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
                    return labelSettings;
                };
                /*
                private getNodeColorsSettings(dataView: DataView): nodeColorsSettings {
                    //debugger;
                    var objects: DataViewObjects = null;
                    var nodeColorsSettings: nodeColorsSettings = this.getDefaultNodeColorsSettings();
                    
                    if (!dataView.metadata || !dataView.metadata.objects)
                        return nodeColorsSettings;
        
                    objects = dataView.metadata.objects;
                    var nodeColorsProperties = SankeyChartProps;
                    
                    nodeColorsSettings.color1 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color1, nodeColorsSettings.color1);
                    nodeColorsSettings.color2 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color2, nodeColorsSettings.color2);
                    nodeColorsSettings.color3 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color3, nodeColorsSettings.color3);
                    nodeColorsSettings.color4 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color4, nodeColorsSettings.color4);
                    nodeColorsSettings.color5 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color5, nodeColorsSettings.color5);
                    nodeColorsSettings.color6 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color6, nodeColorsSettings.color6);
                    nodeColorsSettings.color7 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color7, nodeColorsSettings.color7);
                    nodeColorsSettings.color8 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color8, nodeColorsSettings.color8);
                    nodeColorsSettings.color9 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color9, nodeColorsSettings.color9);
                    nodeColorsSettings.color10 = DataViewObjects.getFillColor(objects, nodeColorsProperties.nodeColors.color10, nodeColorsSettings.color10);
                    
                    return nodeColorsSettings;
                }
                */
                SankeyDiagram.prototype.getDefaultLinkLabelsSettings = function () {
                    return {
                        show: true,
                        color: '#000',
                        fontSize: 16,
                        displayUnits: 0,
                        textPrecision: 0,
                    };
                };
                SankeyDiagram.ClassName = "sankeyDiagram";
                SankeyDiagram.Node = createClassAndSelector("node");
                SankeyDiagram.Nodes = createClassAndSelector("nodes");
                SankeyDiagram.NodeRect = createClassAndSelector("nodeRect");
                SankeyDiagram.NodeLabel = createClassAndSelector("nodeLabel");
                SankeyDiagram.Links = createClassAndSelector("links");
                SankeyDiagram.Link = createClassAndSelector("link");
                SankeyDiagram.DefaultColourOfNode = "rgb(62, 187, 162)";
                SankeyDiagram.DefaultColourOfLink = "black";
                SankeyDiagram.DefaultSettings = {
                    isVisibleLabels: false,
                    scale: { x: 1, y: 1 },
                    colourOfLabels: "black",
                    fontSize: 12
                };
                SankeyDiagram.MinWidthOfLabel = 21;
                SankeyDiagram.NodeBottomMargin = 5; // 5%
                SankeyDiagram.NodeMargin = 5;
                SankeyDiagram.LabelMargin = 4;
                SankeyDiagram.RoleNames = {
                    rows: "Source",
                    columns: "Destination",
                    values: "Weight"
                };
                SankeyDiagram.capabilities = {
                    dataRoles: [
                        {
                            name: SankeyDiagram.RoleNames.rows,
                            kind: VisualDataRoleKind.Grouping,
                            displayName: SankeyDiagram.RoleNames.rows
                        },
                        {
                            name: SankeyDiagram.RoleNames.columns,
                            kind: VisualDataRoleKind.Grouping,
                            displayName: SankeyDiagram.RoleNames.columns
                        },
                        {
                            name: SankeyDiagram.RoleNames.values,
                            kind: VisualDataRoleKind.Measure,
                            displayName: SankeyDiagram.RoleNames.values
                        }
                    ],
                    dataViewMappings: [{
                        conditions: [
                            { "Source": { min: 0, max: 1 }, "Destination": { min: 0, max: 1 }, "Weight": { min: 0, max: 0 } },
                            { "Source": { min: 0, max: 1 }, "Destination": { min: 0, max: 1 }, "Weight": { min: 1, max: 1 } }
                        ],
                        categorical: {
                            categories: {
                                select: [
                                    { bind: { to: SankeyDiagram.RoleNames.rows } },
                                    { bind: { to: SankeyDiagram.RoleNames.columns } }
                                ],
                                dataReductionAlgorithm: { top: {} }
                            },
                            values: {
                                for: { in: SankeyDiagram.RoleNames.values }
                            }
                        }
                    }],
                    objects: {
                        general: {
                            displayName: "General",
                            properties: {
                                formatString: { type: { formatting: { formatString: true } } }
                            }
                        },
                        labels: {
                            displayName: "Data labels",
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                fill: {
                                    displayName: "Fill",
                                    type: { fill: { solid: { color: true } } }
                                },
                                fontSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                }
                            }
                        },
                        linkLabels: {
                            displayName: "Link labels",
                            description: 'Display link label options',
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                color: {
                                    displayName: "Color",
                                    description: 'Select color for link labels',
                                    type: { fill: { solid: { color: true } } }
                                },
                                fontSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                },
                                displayUnits: {
                                    displayName: 'Display Units',
                                    description: 'Select units (millions, billions, etc.)',
                                    type: { formatting: { labelDisplayUnits: true } }
                                },
                                textPrecision: {
                                    displayName: 'Decimal Places',
                                    description: 'Select the number of decimal places to display',
                                    type: { numeric: true }
                                },
                            }
                        },
                        /*
                        nodeColors: {
                            displayName: "Node Colors",
                            description: 'Select Node Colors',
                            properties: {
                                color1: {
                                    displayName: "Color 1",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color2: {
                                    displayName: "Color 2",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color3: {
                                    displayName: "Color 3",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color4: {
                                    displayName: "Color 4",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color5: {
                                    displayName: "Color 5",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color6: {
                                    displayName: "Color 6",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color7: {
                                    displayName: "Color 7",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color8: {
                                    displayName: "Color 8",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color9: {
                                    displayName: "Color 9",
                                    type: { fill: { solid: { color: true } } }
                                },
                                color10: {
                                    displayName: "Color 10",
                                    type: { fill: { solid: { color: true } } }
                                }
                            }
                        },
                        */
                        links: {
                            displayName: "Links",
                            properties: {
                                fill: {
                                    displayName: "Fill",
                                    type: { fill: { solid: { color: true } } }
                                }
                            }
                        }
                    }
                };
                SankeyDiagram.Properties = SankeyDiagram.getProperties(SankeyDiagram.capabilities);
                return SankeyDiagram;
            })();
            SankeyDiagram1479076594374.SankeyDiagram = SankeyDiagram;
            var SankeyDiagramSelectionIdBuilder = (function () {
                function SankeyDiagramSelectionIdBuilder() {
                    this.identities = [];
                }
                SankeyDiagramSelectionIdBuilder.create = function () {
                    return new SankeyDiagramSelectionIdBuilder();
                };
                SankeyDiagramSelectionIdBuilder.prototype.addCategories = function (categories) {
                    var _this = this;
                    categories.forEach(function (category) {
                        _this.addCategory(category);
                    });
                };
                SankeyDiagramSelectionIdBuilder.prototype.addCategory = function (category) {
                    var queryName = category && category.source ? category.source.queryName : undefined;
                    this.identities.push({
                        identity: category.identity || [],
                        queryName: queryName
                    });
                };
                SankeyDiagramSelectionIdBuilder.prototype.getIdentityById = function (id) {
                    var identity, queryName;
                    for (var i = 0; i < this.identities.length; i++) {
                        var amountOfIdentities = this.identities[i].identity.length;
                        if (id > amountOfIdentities - 1) {
                            id -= amountOfIdentities;
                        }
                        else {
                            identity = this.identities[i].identity[id];
                            queryName = this.identities[i].queryName;
                            break;
                        }
                    }
                    return { identity: identity, queryName: queryName };
                };
                SankeyDiagramSelectionIdBuilder.prototype.createSelectionId = function (id) {
                    var identity = this.getIdentityById(id), measureId;
                    measureId = identity.identity ? identity.identity.key : undefined;
                    return SelectionId.createWithIdAndMeasureAndCategory(identity.identity, measureId, identity.queryName);
                };
                return SankeyDiagramSelectionIdBuilder;
            })();
            SankeyDiagram1479076594374.SankeyDiagramSelectionIdBuilder = SankeyDiagramSelectionIdBuilder;
            var SankeyDiagramBehavior = (function () {
                function SankeyDiagramBehavior() {
                    this.createAnEmptySelectedDataPoints();
                }
                SankeyDiagramBehavior.create = function () {
                    return new SankeyDiagramBehavior();
                };
                SankeyDiagramBehavior.prototype.bindEvents = function (behaviorOptions, selectionHandler) {
                    this.behaviorOptions = behaviorOptions;
                    this.selectionHandler = selectionHandler;
                    this.bindClickEventToNodes();
                    this.bindClickEventToLinks();
                    this.bindClickEventToClearCatcher();
                };
                SankeyDiagramBehavior.prototype.bindClickEventToNodes = function () {
                    var _this = this;
                    this.behaviorOptions.nodes.on("click", function (node) {
                        var selectableDataPoints = node.selectableDataPoints;
                        _this.clearSelection();
                        if (!sankeyDiagramUtils.areDataPointsSelected(_this.selectedDataPoints, selectableDataPoints)) {
                            selectableDataPoints.forEach(function (subDataPoint) {
                                _this.selectionHandler.handleSelection(subDataPoint, true);
                            });
                            _this.selectedDataPoints = selectableDataPoints;
                        }
                        else {
                            _this.createAnEmptySelectedDataPoints();
                        }
                    });
                };
                SankeyDiagramBehavior.prototype.bindClickEventToLinks = function () {
                    var _this = this;
                    this.behaviorOptions.links.on("click", function (link) {
                        _this.selectionHandler.handleSelection(link, d3.event.ctrlKey);
                        _this.createAnEmptySelectedDataPoints();
                    });
                };
                SankeyDiagramBehavior.prototype.bindClickEventToClearCatcher = function () {
                    var _this = this;
                    this.behaviorOptions.clearCatcher.on("click", function () {
                        _this.clearSelection();
                        _this.createAnEmptySelectedDataPoints();
                    });
                };
                SankeyDiagramBehavior.prototype.clearSelection = function () {
                    this.selectionHandler.handleClearSelection();
                };
                SankeyDiagramBehavior.prototype.createAnEmptySelectedDataPoints = function () {
                    this.selectedDataPoints = [];
                };
                SankeyDiagramBehavior.prototype.renderSelection = function (hasSelection) {
                    sankeyDiagramUtils.updateFillOpacity(this.behaviorOptions.links, this.behaviorOptions.interactivityService, hasSelection);
                    sankeyDiagramUtils.updateFillOpacity(this.behaviorOptions.nodes, this.behaviorOptions.interactivityService, hasSelection);
                };
                return SankeyDiagramBehavior;
            })();
            SankeyDiagram1479076594374.SankeyDiagramBehavior = SankeyDiagramBehavior;
            var sankeyDiagramUtils;
            (function (sankeyDiagramUtils) {
                function getFillOpacity(selected, highlight, hasSelection, hasPartialHighlights) {
                    if ((hasPartialHighlights && !highlight) || (hasSelection && !selected)) {
                        return true;
                    }
                    return false;
                }
                sankeyDiagramUtils.getFillOpacity = getFillOpacity;
                function isTheDataPointNode(dataPoint) {
                    var node = dataPoint;
                    return node.selectableDataPoints && node.selectableDataPoints.length ? true : false;
                }
                sankeyDiagramUtils.isTheDataPointNode = isTheDataPointNode;
                function isDataPointSelected(dataPoint) {
                    var node = dataPoint, link = dataPoint, selected = false;
                    if (isTheDataPointNode(dataPoint)) {
                        node.selectableDataPoints.forEach(function (selectableDataPoint) {
                            selected = selected || selectableDataPoint.selected;
                        });
                    }
                    else if (link.identity) {
                        selected = link.selected;
                    }
                    return selected;
                }
                sankeyDiagramUtils.isDataPointSelected = isDataPointSelected;
                function updateFillOpacity(selection, interactivityService, hasSelection) {
                    if (hasSelection === void 0) { hasSelection = false; }
                    var hasHighlights = false;
                    if (interactivityService) {
                        hasHighlights = interactivityService.hasSelection();
                    }
                    selection.classed("selected", function (dataPoint) {
                        var isDataPointSelected = sankeyDiagramUtils.isDataPointSelected(dataPoint), isTheDataPointNode = sankeyDiagramUtils.isTheDataPointNode(dataPoint), selected;
                        selected = !isTheDataPointNode && hasSelection ? !isDataPointSelected : isDataPointSelected;
                        return sankeyDiagramUtils.getFillOpacity(selected, false, hasSelection, !selected && hasHighlights);
                    });
                }
                sankeyDiagramUtils.updateFillOpacity = updateFillOpacity;
                function areDataPointsSelected(selectedDataPoints, dataPoints) {
                    if (!dataPoints || !selectedDataPoints || dataPoints.length !== selectedDataPoints.length) {
                        return false;
                    }
                    return selectedDataPoints.every(function (selectedDataPoint) {
                        return dataPoints.some(function (dataPoint) {
                            return selectedDataPoint && dataPoint && selectedDataPoint.identity && dataPoint.identity && selectedDataPoint.identity.equals(dataPoint.identity);
                        });
                    });
                }
                sankeyDiagramUtils.areDataPointsSelected = areDataPointsSelected;
            })(sankeyDiagramUtils = SankeyDiagram1479076594374.sankeyDiagramUtils || (SankeyDiagram1479076594374.sankeyDiagramUtils = {}));
        })(SankeyDiagram1479076594374 = visuals.SankeyDiagram1479076594374 || (visuals.SankeyDiagram1479076594374 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.SankeyDiagram1479076594374 = {
                name: 'SankeyDiagram1479076594374',
                class: 'SankeyDiagram1479076594374',
                capabilities: powerbi.visuals.SankeyDiagram1479076594374.SankeyDiagram.capabilities,
                custom: true,
                create: function (options) { return new powerbi.visuals.SankeyDiagram1479076594374.SankeyDiagram(options); },
                apiVersion: null
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
