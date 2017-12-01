/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {

    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects)
                return defaultValue;

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }
        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill = getValue(objects, propertyId);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }
    }
    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object)
                return defaultValue;

            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined)
                return defaultValue;

            return propertyValue;
        }
    }

    interface BarChartViewModel {
        dataPoints: BarChartDataPoint[];
        dataMax: number;
        name: string;
    }
    interface BarChartDataPoint {
        value: number;
        category: string;
        format: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    }
    export interface MeasureTitle {
        fontSize: number;
        color: string;
    }
    export interface LabelSettings {
        fontSize: number;
        color: string;
        displayUnits: number;
        textPrecision: number;
    }
    export interface AnimationSettings {
        duration: number;
    }


    let props = {
        measureTitle: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'measureTitle', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'measureTitle', propertyName: 'fontSize' },
        },
        labelSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'textPrecision' },
        },
        animationSettings: {
            duration: <DataViewObjectPropertyIdentifier>{ objectName: 'animationSettings', propertyName: 'duration' }
        },
    };

    function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object = objects[objectName];
            if (object) {
                let property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }

    function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects = category.objects;

        if (categoryObjects) {
            let categoryObject: DataViewObject = categoryObjects[index];
            if (categoryObject) {
                let object = categoryObject[objectName];
                if (object) {
                    let property: T = object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }
        return defaultValue;
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, measureIndex: number): BarChartViewModel {
        let dataViews = options.dataViews;

        let viewModel: BarChartViewModel = {
            dataPoints: [],
            dataMax: 0,
            name: ''
        };

        if (!dataViews || !dataViews[0] || !dataViews[0].categorical || !dataViews[0].categorical.categories || !dataViews[0].categorical.categories[0].source || !dataViews[0].categorical.values) {
            return viewModel;
        }

        if (measureIndex > options.dataViews[0].categorical.values.length - 1) {
            measureIndex = 0;
        }
        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[measureIndex];
        let mName = categorical.values[measureIndex].source.displayName;

        let barChartDataPoints: BarChartDataPoint[] = [];
        let dataMax: number;

        let colorPalette: powerbi.extensibility.IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;

        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(<string>category.values[i]).value
                }
            };

            barChartDataPoints.push({
                category: <string>category.values[i],
                value: <number>dataValue.values[i],
                format: dataValue.source.format,
                color: getCategoricalObjectValue<Fill>(category, i, 'colorSelector', 'fill', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId()

            });
        }
        dataMax = <number>dataValue.maxLocal;

        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax,
            name: mName
        };
    }

    export class BarChart implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private svg: d3.Selection<SVGElement>;
        private div1: d3.Selection<SVGElement>;
        private div2: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private horizBarChartContainer: d3.Selection<SVGElement>;
        private horizBarContainer: d3.Selection<SVGElement>;
        private measureTitle: d3.Selection<SVGElement>;
        private horizBars: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
        private barDataPoints: BarChartDataPoint[];
        private yAxis: d3.Selection<SVGElement>;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private yAxisMeasures: d3.Selection<SVGElement>;
        private rotationId: number;
        private frameId: number;
        private measureUpdateCounter: number;
        private viewModel: BarChartViewModel;
        private width: number;
        private height: number;
        private margin: number;
        private xScale;
        private rotationCount: number;
        private horizBarChart;
        private options: VisualUpdateOptions;
        private measureCount: number;
        private dataviews: DataView;
        private rootElement: d3.Selection<SVGElement>;

        static Config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.5,
            margins: {
                top: 0,
                right: 20,
                bottom: 25,
                left: 20,
            },
        };

        constructor(options: VisualConstructorOptions) {
            this.measureUpdateCounter = 0;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element);
            let div1 = this.div1 = this.rootElement.append('div')
                .classed('rootDiv', true).style("xoverflow", "visible");
            let div2 = this.div2 = div1.append('div')
                .classed('baseDiv', true);

            let svg = this.svg = div2
                .append('svg')
                .classed('horizBarChart', true);

            this.measureTitle = svg.append('text')
                .classed('measureTitle', true);

            this.horizBarContainer = svg.append('g')
                .classed('horizBarContainer', true);

            this.yAxis = svg.append('g')
                .classed('yAxis', true);

            this.yAxisMeasures = svg.append('g')
                .classed('yAxisMeasures', true);

        }

        public update(options: VisualUpdateOptions) {

            this.options = options;
            this.dataviews = options.dataViews[0];

            clearInterval(this.frameId);
            clearInterval(this.rotationId);
            this.horizBarContainer.selectAll('*').remove();
            this.yAxis.selectAll('*').remove();
            this.yAxisMeasures.selectAll('*').remove();

            this.viewModel = visualTransform(options, this.host, this.measureUpdateCounter);
            this.barDataPoints = this.viewModel.dataPoints;

            let measureTitle: MeasureTitle = this.getMeasureTitle(this.dataviews);
            let animationSettings: AnimationSettings = this.getAnimationSettings(this.dataviews);
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataviews);

            this.svg.attr({
                width: options.viewport.width,
                height: options.viewport.height
            });

            this.horizBarChart = $('.horizBarChart');
            this.horizBarChart.css('transform', 'rotateX(' + 0 + 'deg)');

            this.width = options.viewport.width;
            this.height = options.viewport.height;

            this.yAxis.style({
                'font-size': labelSettings.fontSize + 'px', 'fill': labelSettings.color
            });
            this.yAxisMeasures.style({
                'font-size': labelSettings.fontSize + 'px', 'fill': labelSettings.color
            });

            let titleProperties: TextProperties = {
                text: this.viewModel.name,
                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                fontSize: measureTitle.fontSize + 'px'
            };
            // measure title
            this.svg.select('.measureTitle')
                .attr('transform', 'translate(' + 20 + ',' + (measureTitle.fontSize) + ')')
                .attr('font-size', measureTitle.fontSize + 'px')
                .attr('fill', measureTitle.color);

            let textHeight = textMeasurementService.measureSvgTextHeight(titleProperties);

            this.rootElement.select('.rootDiv').style('height', options.viewport.height + 'px');
            this.rootElement.select('.baseDiv').style('width', '100%');

            this.margin = 15 / 100;

            this.xScale = d3.scale.ordinal()
                .domain(this.viewModel.dataPoints.map(d => d.category))
                .rangeBands([BarChart.Config.margins.top + textHeight, this.height], 0.2, 0.3);

            let barHeight = this.xScale.rangeBand();

            if (barHeight < 20) {
                this.height = options.viewport.height + (this.viewModel.dataPoints.length * (20 - barHeight));
                this.width = options.viewport.width - 20;
                this.xScale.rangeBands([BarChart.Config.margins.top + textHeight, this.height], 0.2, 0.3);
                this.div1.select('.baseDiv').style('height', this.height + 'px');
                this.div1.select('.horizBarChart').style('height', this.height + 'px');
            }
            else {
                this.height = options.viewport.height;
                this.width = options.viewport.width;
                this.xScale.rangeBands([BarChart.Config.margins.top + textHeight, this.height], 0.2, 0.3);
                this.div1.select('.baseDiv').style('height', this.height + 'px');
                this.div1.select('.horizBarChart').style('height', this.height + 'px');
            }

            let yAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient('left');

            this.yAxis.attr('transform', 'translate(' + this.margin * this.width + ',0)')
                .call(yAxis);

            this.measureCount = options.dataViews[0].categorical.values.length;
            this.renderVisual();

            if (this.measureCount > 1) {
                clearInterval(this.rotationId);
                this.rotationId = setInterval(() => this.rotation(), animationSettings.duration * 1000);
                // Click functionality
                $(".horizBarChart").on("click", () => {
                    clearInterval(this.rotationId);
                    this.rotation();
                    this.rotationId = setInterval(() => this.rotation(), animationSettings.duration * 1000);
                });
            }
        }

        public rotation() {
            this.rotationCount = 1;
            clearInterval(this.frameId);
            this.frameId = setInterval(() => this.frame(), 5);
        }

        public frame() {
            if (this.rotationCount === 90) {
                this.measureUpdateCounter++;
                if (this.measureUpdateCounter >= this.measureCount) {
                    this.measureUpdateCounter = 0;
                }

                this.rotationCount = -90;
                this.viewModel = visualTransform(this.options, this.host, this.measureUpdateCounter);
                this.renderVisual();
            }
            else if (this.rotationCount === 0) {
                clearInterval(this.frameId);
            }
            else {
                this.rotationCount++;
                this.horizBarChart.css('transform', 'rotateX(' + -this.rotationCount + 'deg)');
            }
        }

        public renderVisual() {
            let This = this;
            let width = this.width;
            let measureTitle: MeasureTitle = this.getMeasureTitle(this.dataviews);
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataviews);
            let yScale = d3.scale.linear()
                .domain([0, this.viewModel.dataMax])
                .range([this.width, (this.margin * this.width * 2)]);

            let titleProperties: TextProperties = {
                text: this.viewModel.name,
                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                fontSize: measureTitle.fontSize + 'px'
            };

            $('.measureTitle').text(textMeasurementService.getTailoredTextOrDefault(titleProperties, this.width - 30));

            let bars = this.horizBarContainer.selectAll('.bar').data(this.viewModel.dataPoints);
            bars.enter()
                .append('rect')
                .classed('bar', true);

            // bars
            bars.attr({
                width: d => (this.width - yScale(parseFloat(d.value + ''))) < 0 ? 0 : (this.width - yScale(d.value)),
                height: this.xScale.rangeBand(),
                y: d => this.xScale(d.category),
                x: d => this.margin * this.width,
                fill: d => d.color,
                'fill-opacity': BarChart.Config.solidOpacity,
            });

            let barHeight = +bars.attr('height');

            if (this.width > 90) {
                this.yAxisMeasures.selectAll('text').remove();
                let measureValue = this.yAxisMeasures.selectAll('text').data(this.viewModel.dataPoints);
                let measureLabel = measureValue.enter()
                    .append('text')
                    .classed('measureValue', true);

                // measure value
                measureLabel.attr({
                    dy: '0.32em',
                    y: d => this.xScale(d.category) + (barHeight * 0.5),
                    x: d => this.width - (this.margin * this.width) + 10
                })
                    .text(function (d) {
                        debugger;
                        let formatter;
                        let displayVal = 0;
                        if (labelSettings.displayUnits === 0) {
                            let valLen = This.viewModel.dataMax.toString().length;
                            if (valLen > 9) {
                                displayVal = 1e9;
                            } else if (valLen <= 9 && valLen > 6) {
                                displayVal = 1e6;
                            } else if (valLen <= 6 && valLen >= 4) {
                                displayVal = 1e3;
                            } else {
                                displayVal = 10;
                            }
                        }
                        if (d.format && d.format.indexOf('%') !== -1) {
                            formatter = ValueFormatter.create({
                                format: d.format,
                                value: labelSettings.displayUnits === 0 ? 0 : labelSettings.displayUnits,
                                precision: labelSettings.textPrecision
                            });
                        }
                        else {
                            formatter = ValueFormatter.create({
                                format: d.format,
                                value: labelSettings.displayUnits === 0 ? displayVal : labelSettings.displayUnits,
                                precision: labelSettings.textPrecision
                            });
                        }

                        let measureProperties: TextProperties = {
                            text: formatter.format(d.value),
                            fontFamily: 'sans-serif',
                            fontSize: labelSettings.fontSize + 'px'
                        };
                        return textMeasurementService.getTailoredTextOrDefault(measureProperties, width / 9);
                    });
                measureValue.append('title').text(function (d) {
                    return d.value;
                });
            }

            // Changing the text to ellipsis if the width of the window is small
            for (let i = 0; i < this.viewModel.dataPoints.length; i++) {
                let labelProperties: TextProperties = {
                    text: this.viewModel.dataPoints[i].category,
                    fontFamily: 'sans-serif',
                    fontSize: labelSettings.fontSize + 'px'
                };
                let newDataLabel = textMeasurementService.getTailoredTextOrDefault(labelProperties, this.width / 9);
                if ($('.tick text') && $('.tick text')[i]) {
                    $('.tick text')[i].textContent = newDataLabel;
                }
            }

            this.tooltipServiceWrapper.addTooltip(this.horizBarContainer.selectAll('.bar'),
                (tooltipEvent: TooltipEventArgs<number>) => BarChart.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);

            let selectionManager = this.selectionManager;
            bars.exit()
                .remove();
        }


        private getDefaultMeasureTitle(): MeasureTitle {
            return {
                color: '#666666',
                fontSize: 20,
            };
        }

        private getDefaultLabelSettings(): LabelSettings {
            return {
                color: '#000',
                fontSize: 12,
                displayUnits: 0,
                textPrecision: 0
            };
        }

        public getDefaultAnimationSettings(): AnimationSettings {
            return {
                duration: 6
            };
        }

        private getMeasureTitle(dataView: DataView): MeasureTitle {
            let objects: DataViewObjects = null;
            let title: MeasureTitle = this.getDefaultMeasureTitle();
            if (!dataView.metadata || !dataView.metadata.objects)
                return title;
            objects = dataView.metadata.objects;
            let currentmeasurelabelprop = props;
            title.color = DataViewObjects.getFillColor(objects, currentmeasurelabelprop.measureTitle.color, title.color);
            title.fontSize = DataViewObjects.getValue(objects, currentmeasurelabelprop.measureTitle.fontSize, title.fontSize);
            return title;
        }

        private getLabelSettings(dataView: DataView): LabelSettings {
            let objects: DataViewObjects = null;
            let labelSettings: LabelSettings = this.getDefaultLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects)
                return labelSettings;
            objects = dataView.metadata.objects;
            let labelProps = props;
            labelSettings.color = DataViewObjects.getFillColor(objects, labelProps.labelSettings.color, labelSettings.color);
            labelSettings.fontSize = DataViewObjects.getValue(objects, labelProps.labelSettings.fontSize, labelSettings.fontSize);
            labelSettings.fontSize = labelSettings.fontSize > 30 ? 30 : labelSettings.fontSize;
            labelSettings.displayUnits = DataViewObjects.getValue(objects, labelProps.labelSettings.displayUnits, labelSettings.displayUnits);
            labelSettings.textPrecision = DataViewObjects.getValue(objects, labelProps.labelSettings.textPrecision, labelSettings.textPrecision);
            return labelSettings;
        }

        public getAnimationSettings(dataView: DataView): AnimationSettings {
            let objects: DataViewObjects = null;
            let settings: AnimationSettings = this.getDefaultAnimationSettings();
            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            let properties = props;
            settings.duration = DataViewObjects.getValue(objects, properties.animationSettings.duration, settings.duration);
            settings.duration = settings.duration < 2 ? 2 : settings.duration > 20 ? 20 : settings.duration;
            return settings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            let animationSettings: AnimationSettings = this.getAnimationSettings(this.dataviews);
            let measureTitle: MeasureTitle = this.getMeasureTitle(this.dataviews);
            let labels: LabelSettings = this.getLabelSettings(this.dataviews);

            switch (objectName) {
                case 'animationSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Delay (seconds)',
                        selector: null,
                        properties: {
                            duration: animationSettings.duration
                        }
                    });
                    break;
                case 'labelSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            color: labels.color,
                            fontSize: labels.fontSize,
                            displayUnits: labels.displayUnits,
                            textPrecision: labels.textPrecision
                        },
                        selector: null
                    });
                    break;
                case 'measureTitle':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            color: measureTitle.color,
                            fontSize: measureTitle.fontSize,
                        },
                        selector: null
                    });
                    break;
                case 'colorSelector':
                    for (let barDataPoint of this.barDataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: barDataPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: barDataPoint.color
                                    }
                                }
                            },
                            selector: barDataPoint.selectionId.getSelector()

                        });
                    }
                    break;
            }
            return objectEnumeration;
        }

        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value.category,
                value: value.value.toString(),
                color: value.color
            }];
        }
    }
}