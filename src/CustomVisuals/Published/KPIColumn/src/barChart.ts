module powerbi.extensibility.visual {

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    /* do not update*/
    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) { return defaultValue; }

            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];

            let object: DataViewObject;
            object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object: DataViewObject;
                object = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map: DataViewObjectMap;
                map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill;
            value = getValue(objects, propertyId);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object) { return defaultValue; }

            // tslint:disable-next-line:no-any
            let propertyValue: any;
            propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) { return defaultValue; }

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) { return defaultColor; }

            return value.solid.color;
        }

    }
    // powerbi.extensibility.utils.formatting
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    /* do not update*/
    interface IBarChartViewModel {
        dataPoints: IBarChartDataPoint[];
        dataMax: number;
        fytarget: number;
        settings: IBarChartSettings;
    }

    interface IBarChartDataPoint {

        value: PrimitiveValue;
        ytd: PrimitiveValue;
        forecasted: PrimitiveValue;
        category: string;
        color: string;
        selectionId: ISelectionId;
    }

    interface IBarChartSettings {
        enableAxis: {
            show: boolean;
        };
    }

    // tslint:disable-next-line:no-any
    export let chartProperties: any = {
        legendSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            labelSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' }
        },
        zoneSettings: {
            zone1Value: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone1Value' },
            zone2Value: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone2Value' },
            zone1Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone1Color' },
            zone2Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone2Color' },
            zone3Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone3Color' },
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'defaultColor' }
        },
        yAxisConfig: {
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fill' },
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'decimalPlaces' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'displayUnits' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontSize' }
        },
        yTDConfig: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'show' },
            lineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'lineColor' },
            strokeSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'strokeSize' }
        },
        fullTargetConfig: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'show' },
            lineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'lineColor' },
            strokeSize: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'strokeSize' }
        },
        dataLabels: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'show' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'fontColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'fontSize' },
            valueDecimal: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'valueDecimal' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'displayUnits' }
        }
    };

    export interface IZoneSettings {
        zone1Value: number;
        zone2Value: number;
        zone1Color: string;
        zone2Color: string;
        zone3Color: string;
        defaultColor: string;
    }

    export interface IYAxisSettings {
        fontColor: string;
        fontSize: number;
        decimalPlaces: number;
        displayUnits: number;
    }

    export interface ITargetSettings {
        show: boolean;
        lineColor: string;
        strokeSize: number;
    }

    export interface ILegendSettings {
        show: boolean;
        labelSize: number;
        labelColor: string;
    }
    export interface IDataLabels {
        show: boolean;
        fontColor: string;
        fontSize: number;
        valueDecimal: number;
        displayUnits: number;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: BarChart): IBarChartViewModel {
        let dataViews: DataView[];
        dataViews = options.dataViews;

        let zoneSettings: IZoneSettings;
        zoneSettings = context.getZoneSettings(dataViews[0]);
        let defaultSettings: IBarChartSettings;
        defaultSettings = {
            enableAxis: {
                show: false
            }
        };
        let viewModel: IBarChartViewModel;
        viewModel = {

            dataPoints: [],
            dataMax: 0,
            fytarget: 0,
            settings: <IBarChartSettings>{}
        };
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values) { return viewModel; }

        // let formatTime = d3.time.format("%b %Y");
        let categorical: DataViewCategorical;
        categorical = dataViews[0].categorical;
        context.setYtdTarget = 0;
        let category: DataViewCategoryColumn = null;
        let forecasted: DataViewCategoryColumn = null;

        let categoryRoleLiteral: string;
        let forecastedRoleLiterral: string;
        let measureRoleLiteral: string;
        let fytargetLiteral: string;
        let ytdtargetLiteral: string;

        categoryRoleLiteral = 'category';
        forecastedRoleLiterral = 'forecasted';
        measureRoleLiteral = 'measure';
        fytargetLiteral = 'fytarget';
        ytdtargetLiteral = 'ytdtarget';

        for (let iCounter: number = 0; iCounter < categorical.categories.length; iCounter++) {
            if (categorical.categories[iCounter].source.roles[categoryRoleLiteral]) {
                category = categorical.categories[iCounter];
            } else if (categorical.categories[iCounter].source.roles[forecastedRoleLiterral]) {
                forecasted = categorical.categories[iCounter];
            }
        }

        let dataValue: DataViewValueColumn = null;
        let fytarget: PrimitiveValue = null;
        let targetValue: DataViewValueColumn = null;

        for (let iCounter: number = 0; iCounter < categorical.values.length; iCounter++) {
            if (categorical.values[iCounter].source.roles[measureRoleLiteral]) {
                BarChart.thisObj.measureFormat = options.dataViews[0].categorical.values[iCounter].source.format;
                //this.measureFormat = options.dataViews[0].categorical.values[iCounter].source.format;
                dataValue = categorical.values[iCounter];
            } else if (categorical.values[iCounter].source.roles[fytargetLiteral]) {
                fytarget = categorical.values[iCounter].maxLocal;
                context.isTargetAvailable = true;
                context.targetText = categorical.values[iCounter].source.displayName ? categorical.values[iCounter].source.displayName : '';
            } else if (categorical.values[iCounter].source.roles[ytdtargetLiteral]) {
                BarChart.thisObj.targetFormat = options.dataViews[0].categorical.values[iCounter].source.format;
                context.setYtdTarget = 1;
                targetValue = categorical.values[iCounter];
                context.isITAvailable = true;
                context.itText = categorical.values[iCounter].source.displayName ? categorical.values[iCounter].source.displayName : '';
            }
        }

        let barChartDataPoints: IBarChartDataPoint[];
        barChartDataPoints = [];
        let dataMax: number;

        // let colorPalette: IColorPalette = host.colorPalette;
        let objects: DataViewObjects;
        objects = dataViews[0].metadata.objects;
        let barChartSettings: IBarChartSettings;
        barChartSettings = {
            enableAxis: {
                show: getValue<boolean>(objects, 'enableAxis', 'show', defaultSettings.enableAxis.show)
            }
        };

        let i: number;
        i = 0;
        let len: number;
        len = 0;
        for (i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
            let defaultColor: string;
            if (targetValue) {
                let colorValue: number;
                colorValue = <number>dataValue.values[i] / <number>targetValue.values[i];
                if (colorValue < zoneSettings.zone1Value / 100) {
                    defaultColor = zoneSettings.zone1Color;
                } else if (colorValue < zoneSettings.zone2Value / 100) {
                    defaultColor = zoneSettings.zone2Color;
                } else {
                    defaultColor = zoneSettings.zone3Color;
                }
            } else {
                defaultColor = zoneSettings.defaultColor;
            }
            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({ format: options.dataViews[0].categorical.categories[0].source.format });

            barChartDataPoints.push({
                category: formatter.format(category.values[i]),
                forecasted: forecasted ? forecasted.values[i] : null,
                value: dataValue.values[i],
                ytd: targetValue ? targetValue.values[i] : null,
                color: defaultColor,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId()
            });
        }
        let yAxisHeight: void;
        yAxisHeight =
            category.values.forEach((element: number) => {
                // tslint:disable-next-line:no-any
                let measureTextProperties: any;
                measureTextProperties = {
                    text: category.values[element],
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: '12px'
                };
                let yAxisWidth: number;
                yAxisWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
            });
        let dataValMax: number = 0;
        let targetValMax: number = 0;
        let fytargetValMax: number = 0;
        if (!!dataValue && !!dataValue.maxLocal) {
            dataValMax = <number>dataValue.maxLocal;
        }
        if (!!targetValue && !!targetValue.maxLocal) {
            targetValMax = <number>targetValue.maxLocal;
        }
        if (fytarget) {
            fytargetValMax = <number>fytarget;
        }
        dataMax = Math.max(dataValMax, targetValMax, fytargetValMax);

        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax,
            fytarget: <number>fytarget,
            settings: barChartSettings
        };
    }

    export class BarChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private barChartContainer: d3.Selection<SVGElement>;
        private barContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private targetLines: d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        private barDataPoints: IBarChartDataPoint[];
        private barChartSettings: IBarChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private dataViews: DataView;
        private yAxisFormatter: IValueFormatter;
        public setYtdTarget: number;
        private baseDiv: d3.Selection<SVGElement>;
        private rootDiv: d3.Selection<SVGElement>;
        public measureFormat: string;
        public targetFormat: string;
        public isTargetAvailable: boolean;
        public targetText: string;
        public isITAvailable: boolean;
        public itText: string;
        public static thisObj: BarChart;
        // tslint:disable-next-line:no-any
        public static config: any = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.5,
            margins: {
                top: 0,
                right: 0,
                bottom: 90,
                left: 50
            },
            xAxisFontMultiplier: 0.04
        };

        public getDecimalPlacesCount(value: string): number {
            let decimalPlaces: number = 0;
            if (value && value.split('.').length > 1) {
                decimalPlaces = value.split('.')[1].length;
            }

            return decimalPlaces;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.rootDiv = d3.select(options.element)
                .append('div')
                .classed('rootDiv', true);

            this.rootDiv.append('div')
                .classed('legend', true);

            this.baseDiv = this.rootDiv
                .append('div')
                .classed('baseDiv', true);

            let svg: d3.Selection<SVGElement>;
            svg = this.svg = this.baseDiv
                .append('svg')
                .classed('barChart', true)
                .style('width', 0);

            this.locale = options.host.locale;

            this.yAxis = svg.append('g')
                .classed('yAxis', true);

            this.xAxis = svg.append('g')
                .classed('xAxis', true);

            this.barContainer = svg.append('g')
                .classed('barContainer', true);

            this.targetLines = svg.append('g')
                .classed('targetLines', true);
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.svg.attr({
                width: 0,
                height: 0
            });
            this.baseDiv.style('width', 0);

            let measureRoleLiteral: string;
            let ytdtargetLiteral: string;
            let pxLiteral: string;
            let doubleSpaceLiteral: string;

            measureRoleLiteral = 'measure';
            ytdtargetLiteral = 'ytdtarget';
            pxLiteral = 'px';
            doubleSpaceLiteral = '  ';

            BarChart.thisObj = this;
            this.isITAvailable = false;
            this.itText = '';
            this.targetText = '';
            this.isTargetAvailable = false;
            let dataView: DataView;
            dataView = this.dataViews = options.dataViews[0];
            this.xAxis.selectAll('*').remove();
            this.yAxis.selectAll('*').remove();
            this.targetLines.selectAll('*').remove();
            this.svg.selectAll('.barContainer').selectAll('*').remove();
            this.rootDiv.selectAll('.legend .legendItem,.legend .legendItem1').remove();

            for (let iCounter: number = 0; iCounter < dataView.categorical.values.length; iCounter++) {
                if (dataView.categorical.values[iCounter].source.roles[measureRoleLiteral]) {
                    this.measureFormat = options.dataViews[0].categorical.values[iCounter].source.format;

                } else if (dataView.categorical.values[iCounter].source.roles[ytdtargetLiteral]) {
                    this.targetFormat = options.dataViews[0].categorical.values[iCounter].source.format;

                }
            }

            if (options.viewport.height > 100) {
                let viewModel: IBarChartViewModel;
                viewModel = visualTransform(options, this.host, this);
                let settings: IBarChartSettings;
                settings = this.barChartSettings = viewModel.settings;
                this.barDataPoints = viewModel.dataPoints;
                let width: number;
                width = options.viewport.width;
                let height: number;
                height = options.viewport.height;
                let yAxisConfig: IYAxisSettings;
                yAxisConfig = this.getYAxisSettings(this.dataViews);
                let fullTargetConfig: ITargetSettings;
                fullTargetConfig = this.getFullTargetSettings(this.dataViews);
                let yTDTargetConfig: ITargetSettings;
                yTDTargetConfig = this.getYTDSettings(this.dataViews);
                let legendSettings: ILegendSettings;
                legendSettings = this.getLegendSettings(this.dataViews);
                let dataLabels: IDataLabels;
                dataLabels = this.getDataLabelSettings(this.dataViews);

                if (viewModel.dataMax === 0) {
                    return;
                } else {
                    let legendHeight: number = 0;
                    if (legendSettings.show) {
                        if (this.isITAvailable || this.isTargetAvailable) {
                            let legendItemWidth: number;
                            if (this.isITAvailable && this.isTargetAvailable) {
                                legendItemWidth = (options.viewport.width) / 2 - 60 > 0 ? (options.viewport.width) / 2 - 60 : 0;
                            } else if (this.isITAvailable) {
                                legendItemWidth = options.viewport.width - legendSettings.labelSize - 30;
                            } else if (this.isTargetAvailable) {
                                legendItemWidth = options.viewport.width - legendSettings.labelSize - 30;
                            }

                            // this is for solid line
                            let iTargetText: string = this.isITAvailable ? this.itText : '';
                            let ytdtargetTextProps: TextProperties;
                            ytdtargetTextProps = {
                                text: iTargetText,
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            iTargetText = textMeasurementService.getTailoredTextOrDefault(ytdtargetTextProps, legendItemWidth);
                            let ytdtargetHeight: number;
                            ytdtargetHeight = textMeasurementService.measureSvgTextHeight(ytdtargetTextProps);

                            // this is for dashed line
                            let fyTargetText: string = this.isTargetAvailable ? this.targetText : '';
                            let fytargetTextProps: TextProperties;
                            fytargetTextProps = {
                                text: fyTargetText,
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            fyTargetText = textMeasurementService.getTailoredTextOrDefault(fytargetTextProps, legendItemWidth);
                            let fyTargetTextHeight: number;
                            fyTargetTextHeight = textMeasurementService.measureSvgTextHeight(fytargetTextProps);

                            if (this.isITAvailable && this.isTargetAvailable) {
                                legendHeight = ytdtargetHeight;

                                // this is for solid line
                                this.rootDiv.select('.legend')
                                    .append('div')
                                    .classed('legendItem', true)
                                    .style({
                                        'max-width': options.viewport.width / 2 + pxLiteral
                                    })
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .style({
                                        'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                        width: legendSettings.labelSize + pxLiteral,
                                        height: '1px',
                                        'background-color': legendSettings.labelColor
                                    })
                                    .attr('title', this.itText);

                                // this is for individual target legend
                                this.rootDiv.select('.legend div')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(doubleSpaceLiteral + iTargetText)
                                    .attr('title', this.itText)
                                    .style({
                                        'margin-left': '5px',
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'max-width': legendItemWidth + pxLiteral
                                    });

                                // this is for dashed line
                                this.rootDiv.select('.legend')
                                    .append('div')
                                    .classed('legendItem1', true)
                                    .style({
                                        'max-width': options.viewport.width / 2 + pxLiteral
                                    })
                                    .append('span')
                                    .text('---')
                                    .classed('legendInnerPart', true)
                                    .style({
                                        // 'width': legendSettings.labelSize + 'px',
                                        'min-width': '20px',
                                        color: legendSettings.labelColor,
                                        'line-height': fyTargetTextHeight + pxLiteral,
                                        'font-size': legendSettings.labelSize + pxLiteral
                                    })
                                    .attr('title', this.targetText);

                                // this is for target legend
                                this.rootDiv.select('.legend .legendItem1')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(fyTargetText)
                                    .attr('title', this.targetText)
                                    .style({
                                        'margin-left': '5px',
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'max-width': legendItemWidth + pxLiteral
                                    });

                            } else if (this.isITAvailable) {
                                legendHeight = ytdtargetHeight;
                                // this is for solid line
                                this.rootDiv.select('.legend')
                                    .append('div')
                                    .classed('legendItem', true)
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .style({
                                        'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                        width: legendSettings.labelSize + pxLiteral,
                                        height: '1px',
                                        'background-color': legendSettings.labelColor
                                    })
                                    .attr('title', this.itText);

                                // this is for individual target legend
                                this.rootDiv.select('.legend div')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(doubleSpaceLiteral + iTargetText)
                                    .attr('title', this.itText)
                                    .style({
                                        'margin-left': '5px',
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            } else if (this.isTargetAvailable) {
                                legendHeight = fyTargetTextHeight;

                                // this is for dashed line
                                this.rootDiv.select('.legend')
                                    .append('div')
                                    .classed('legendItem1', true)
                                    .append('span')
                                    .text('---')
                                    .classed('legendInnerPart', true)
                                    .style({
                                        // 'width': legendSettings.labelSize + 'px',
                                        'min-width': '20px',
                                        color: legendSettings.labelColor,
                                        'line-height': fyTargetTextHeight + pxLiteral,
                                        'font-size': legendSettings.labelSize + pxLiteral
                                    })
                                    .attr('title', this.targetText);

                                // this is for target legend
                                this.rootDiv.select('.legend .legendItem1')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(fyTargetText)
                                    .attr('title', this.targetText)
                                    .style({
                                        'margin-left': '5px',
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'max-width': legendItemWidth + pxLiteral
                                    });

                            }
                        }
                    }
                    height = height - legendHeight > 0 ? height - legendHeight : 0;

                    this.svg.attr({
                        width: width,
                        height: height
                    });
                    // tslint:disable-next-line:no-any
                    let margins: any;
                    margins = BarChart.config.margins;
                    height -= margins.bottom;

                    let displayVal: number = 0;
                    if (yAxisConfig.displayUnits === 0) {
                        let valLen: number;
                        valLen = viewModel.dataMax.toString().length;
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
                    if (options.dataViews[0].categorical.values[0].source.format &&
                        options.dataViews[0].categorical.values[0].source.format.indexOf('%') !== -1) {
                        this.yAxisFormatter = valueFormatter.create({
                            format: options.dataViews[0].categorical.values[0].source.format,
                            value: yAxisConfig.displayUnits === 0 ? 0 : yAxisConfig.displayUnits,
                            precision: yAxisConfig.decimalPlaces
                        });
                    } else {
                        this.yAxisFormatter = valueFormatter.create({
                            format: options.dataViews[0].categorical.values[0].source.format,
                            value: yAxisConfig.displayUnits === 0 ? displayVal : yAxisConfig.displayUnits,
                            precision: yAxisConfig.decimalPlaces
                        });
                    }
                    let formattedMaxMeasure: string;
                    formattedMaxMeasure = this.yAxisFormatter.format(parseFloat(viewModel.dataMax.toString()) * 1.1);
                    let measureTextProperties: TextProperties;
                    measureTextProperties = {
                        text: formattedMaxMeasure,
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: '12px'
                    };
                    let yAxisWidth: number;
                    yAxisWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                    margins.left = yAxisWidth + 10;

                    this.yAxis.style({
                        'stroke-width': '0.01em',
                        fill: yAxisConfig.fontColor
                    });

                    // X-scale
                    // tslint:disable-next-line:no-any
                    let xScale: any;
                    xScale = d3.scale.ordinal()
                        .domain(viewModel.dataPoints.map((d: IBarChartDataPoint) => d.category))
                        .rangeBands([margins.left, width], 0.2, 0.3);

                    let barWidths: number;
                    barWidths = xScale.rangeBand();
                    let dynamicWidth: number;

                    if (barWidths < 17) {
                        dynamicWidth = width + (viewModel.dataPoints.length * (17 - barWidths));
                        xScale.rangeBands([margins.left, dynamicWidth], 0.2, 0.3);
                        this.rootDiv.select('.baseDiv').style('width', dynamicWidth + pxLiteral);
                        this.rootDiv.select('.barChart').style('width', dynamicWidth + pxLiteral);
                    } else {
                        if (barWidths >= 35) {
                            height = height + 20;
                        }
                        dynamicWidth = width;
                        xScale.rangeBands([margins.left, dynamicWidth], 0.2, 0.3);
                        this.rootDiv.select('.baseDiv').style('width', dynamicWidth + pxLiteral);
                        this.rootDiv.select('.barChart').style('width', dynamicWidth + pxLiteral);
                    }

                    // Y scale
                    // tslint:disable-next-line:no-any
                    let yScale: any;
                    yScale = d3.scale.linear()
                        .domain([0, viewModel.dataMax * 1.1])
                        .range([height, 10]);

                    let xTargetAxis: d3.Selection<SVGElement>;
                    xTargetAxis = this.targetLines.append('line')
                        .classed('xTargetAxis', true);
                    if (fullTargetConfig.show && viewModel.fytarget) {
                        // tslint:disable-next-line:no-any
                        let yVal: any;
                        yVal = yScale(<number>viewModel.fytarget);
                        xTargetAxis.attr({
                            x1: margins.left,
                            y1: yVal,
                            x2: dynamicWidth,
                            y2: yVal,
                            stroke: fullTargetConfig.lineColor,
                            'stroke-width': fullTargetConfig.strokeSize
                        })
                            .append('title')
                            .text(viewModel.fytarget);

                        xTargetAxis.style('stroke-dasharray', '7,7');
                    } else {
                        xTargetAxis.attr({
                            'stroke-width': 0
                        });
                    }

                    // Format Y Axis labels and render Y Axis labels
                    // tslint:disable-next-line:no-any
                    let yAxis: any;
                    yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .tickFormat(this.yAxisFormatter.format)
                        .ticks(options.viewport.height / 80);

                    let translateLeft: string = '';
                    translateLeft = 'translate(';
                    translateLeft += margins.left;
                    translateLeft += ',0)';

                    this.yAxis.attr('transform', translateLeft)
                        .call(yAxis);

                    this.yAxis.selectAll('path')
                        .style({ stroke: 'black', fill: 'none', 'stroke-width': '0px', 'shape-rendering': 'crispEdges' });

                    // Draw Y Axis grid lines
                    let yTitleTooltip: IValueFormatter;
                    yTitleTooltip = valueFormatter.create({
                        format: options.dataViews[0].categorical.values[0].source.format
                    });
                    // tslint:disable-next-line:no-any
                    let yTicks: any;
                    yTicks = this.svg.selectAll('.yAxis .tick');
                    yTicks.append('title')
                        .text((d: string) => {
                            return yTitleTooltip.format(d);
                        });
                    let tickLeng: number;
                    tickLeng = yTicks.size();
                    let i: number = 0;
                    for (i = 0; i < tickLeng; i++) {
                        let yCoordinate: string;
                        yCoordinate = yTicks[0][i].getAttribute('transform')
                            .substring(12, yTicks[0][i].getAttribute('transform').length - 1);
                        if (parseFloat(yCoordinate) !==
                            (viewModel.fytarget && yScale(<number>viewModel.fytarget)) || !fullTargetConfig.show) {
                            this.yAxis.append('line')
                                .classed('yAxisGrid', true).attr({
                                    x1: 0,
                                    y1: yCoordinate,
                                    x2: dynamicWidth,
                                    y2: yCoordinate,
                                    stroke: '#ccc',
                                    'stroke-width': 0.5
                                });
                        }
                    }

                    let barData: IBarChartDataPoint[];
                    barData = [];
                    let barforecastedData: IBarChartDataPoint[];
                    barforecastedData = [];
                    let len: number = 0;
                    for (i = 0, len = viewModel.dataPoints.length; i < len; i++) {
                        if (viewModel.dataPoints[i].forecasted !== 1) {
                            barData.push(viewModel.dataPoints[i]);
                        } else {
                            barforecastedData.push(viewModel.dataPoints[i]);
                        }
                    }
                    // bars
                    // tslint:disable-next-line:no-any
                    let bars: any;
                    bars = this.barContainer.selectAll('.bar').data(barData);
                    bars.enter()
                        .append('rect')
                        .classed('bar', true);
                    bars.attr({
                        width: xScale.rangeBand(),
                        // tslint:disable-next-line:no-any
                        height: function (d: any): number {
                            return height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value);
                        },
                        // tslint:disable-next-line:no-any
                        y: function (d: any): any {
                            return yScale(<number>d.value);
                        },
                        // tslint:disable-next-line:no-any
                        x: function (d: any): void { return xScale(d.category); },
                        // tslint:disable-next-line:no-any
                        fill: (d: any): void => d.color
                    });
                    // tslint:disable-next-line:no-any
                    let barforecasted: any;
                    barforecasted = this.barContainer.selectAll('.barforecasted').data(barforecastedData);
                    barforecasted.enter()
                        .append('rect')
                        .classed('barforecasted', true);

                    barforecasted.attr({
                        width: xScale.rangeBand(),
                        // tslint:disable-next-line:no-any
                        height: function (d: any): number {
                            return height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value);
                        },
                        // tslint:disable-next-line:no-any
                        y: function (d: any): any {
                            return yScale(<number>d.value);
                        },
                        // tslint:disable-next-line:no-any
                        x: (d: any): any => xScale(d.category),
                        // tslint:disable-next-line:no-any
                        fill: (d: any): any => d.color,
                        'fill-opacity': 0.5,
                        // tslint:disable-next-line:no-any
                        stroke: (d: any): any => d.color,
                        'stroke-width': 1
                    });
                    this.barContainer.selectAll('.barforecasted').style('stroke-dasharray', '10,5');
                    barforecasted.exit()
                        .remove();

                    // tslint:disable-next-line:no-any
                    let lineDataPoints: any;
                    lineDataPoints = [];
                    for (i = 0, len = viewModel.dataPoints.length; i < len; i++) {
                        if (viewModel.dataPoints[i].ytd || viewModel.dataPoints[i].ytd === 0) {
                            lineDataPoints.push({
                                x1: xScale(viewModel.dataPoints[i].category) + (xScale.rangeBand() / 2),
                                y1: yScale(<number>viewModel.dataPoints[i].ytd)
                            });
                        }
                    }
                    let linePoints: string = '';

                    for (i = 0; i < lineDataPoints.length; i++) {
                        linePoints += lineDataPoints[i].x1;
                        linePoints += ',';
                        linePoints += lineDataPoints[i].y1;
                        linePoints += ' ';
                    }

                    let ytdLine: d3.Selection<SVGElement>;
                    ytdLine = this.targetLines.append('polyline')
                        .classed('ytdLine', true);

                    if (yTDTargetConfig.show) {
                        ytdLine.attr({
                            stroke: yTDTargetConfig.lineColor,
                            'stroke-width': yTDTargetConfig.strokeSize,
                            points: linePoints,
                            fill: 'none'
                        });
                    } else {
                        ytdLine.attr({
                            'stroke-width': 0
                        });
                    }

                    // X-axis
                    let xAxis: d3.svg.Axis;
                    xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient('bottom');

                    let translateHeight: string = '';
                    translateHeight = 'translate(0, ';
                    translateHeight += height;
                    translateHeight += ')';
                    this.xAxis.attr('transform', translateHeight)
                        .call(xAxis);

                    this.xAxis.selectAll('path')
                        .style({ stroke: 'black', fill: 'none', 'stroke-width': '0px' });

                    this.svg.selectAll('.xAxis .tick').append('title')
                        // tslint:disable-next-line:no-any
                        .text(function (d: any): string {
                            return d.toString();
                        });

                    translateHeight = 'translate(-10, ';
                    translateHeight += height;
                    translateHeight += ')';
                    if (barWidths < 35) {
                        this.xAxis.attr('transform', translateHeight);
                        this.svg.selectAll('.xAxis .tick text')
                            // tslint:disable-next-line:no-any
                            .text(function (d: any): string {
                                if (d.toString().length <= 13) {
                                    return d.toString();
                                } else {
                                    let textProperties: TextProperties;
                                    textProperties = {
                                        text: d.toString(),
                                        fontFamily: 'sans-serif',
                                        fontSize: '12px'
                                    };

                                    return textMeasurementService.getTailoredTextOrDefault(textProperties, 70);
                                }
                            })
                            .attr('transform', 'rotate(-45)')
                            .style('text-anchor', 'end');
                    } else {
                        let boxes: d3.Selection<SVGElement>;
                        boxes = this.svg.selectAll('.barContainer rect');
                        if (boxes[0].length) {
                            let barWidthValue: number;
                            barWidthValue = parseInt(boxes.attr('width'), 10);
                            // tslint:disable-next-line:no-any
                            let xTicksLabels: any;
                            xTicksLabels = this.svg.selectAll('.xAxis .tick text')[0];
                            len = xTicksLabels.length - 1;
                            while (len >= 0) {
                                // tslint:disable-next-line:no-any
                                let xAxisLabel: any;
                                xAxisLabel = xTicksLabels[len];
                                xAxisLabel.style.textAnchor = 'middle';
                                textMeasurementService.wordBreak(xAxisLabel, barWidthValue, 50);
                                len--;
                            }
                        }
                    }
                    // data labels
                    if (dataLabels.show) {
                        let measureFormat: string;
                        measureFormat = this.measureFormat;
                        let targetLinesHeight: string;
                        targetLinesHeight = $('.xTargetAxis').attr('y1');
                        let displayValLabels: number = 0;
                        if (dataLabels.displayUnits === 0) {
                            let valLen: number;
                            valLen = viewModel.dataMax.toString().length;
                            if (valLen > 9) {
                                displayValLabels = 1e9;
                            } else if (valLen <= 9 && valLen > 6) {
                                displayValLabels = 1e6;
                            } else if (valLen <= 6 && valLen >= 4) {
                                displayValLabels = 1e3;
                            } else {
                                displayValLabels = 10;
                            }
                        }
                        let formatter: IValueFormatter;
                        formatter = ValueFormatter.create({
                            format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat,
                            value: dataLabels.displayUnits === 0 ? displayValLabels : dataLabels.displayUnits,
                            precision: dataLabels.valueDecimal
                        });
                        // tslint:disable-next-line:no-any
                        let labelMargin: any;
                        labelMargin = { top: 20, right: 10, left: 2 };
                        this.barContainer
                            .append('g')
                            .classed('labelGraphicContext', true)
                            .selectAll('text')
                            .data(viewModel.dataPoints)
                            .enter()
                            .append('text')
                            .style('fill', dataLabels.fontColor)
                            .style('text-anchor', 'middle')
                            .style('display', 'inline')
                            // tslint:disable-next-line:no-any
                            .text(function (d: any): string {
                                let labelFormattedText: string;
                                labelFormattedText = formatter.format(d.value);
                                let tp: TextProperties;
                                tp = {
                                    text: labelFormattedText,
                                    fontFamily: 'sans-serif',
                                    fontSize: dataLabels.fontSize + pxLiteral
                                };

                                return textMeasurementService.getTailoredTextOrDefault(tp, barWidths);
                            })
                            .attr({
                                // tslint:disable-next-line:no-any
                                x: (d: any): any => xScale(d.category) + xScale.rangeBand() / 2 + 2,
                                // tslint:disable-next-line:no-any
                                y: (d: any): any => yScale(<number>d.value) - 4,
                                'font-size': dataLabels.fontSize + pxLiteral,
                                'font-weight': 'bold'
                            });

                        //if labels cross height then place inside bars
                        $('.labelGraphicContext').find('text').each(function (): void {
                            let labelHeight: number;
                            labelHeight = $(this).height();
                            let barlabel: string;
                            barlabel = $(this).attr('y');
                            let diff: number;
                            diff = parseInt(barlabel, 10) - 0;
                            if (diff < labelHeight) {
                                $(this).attr('y', parseInt(barlabel, 10));
                            }
                        });
                    }
                    // var tooltipdata = dataView.categorical.categories.
                    this.tooltipServiceWrapper.addTooltip(
                        this.barContainer.selectAll('.bar,.barforecasted'),
                        (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                        (tooltipEvent: TooltipEventArgs<number>) => null);

                    let selectionManager: ISelectionManager;
                    selectionManager = this.selectionManager;
                    let allowInteractions: boolean;
                    allowInteractions = this.host.allowInteractions;

                    // This must be an anonymous function instead of a lambda because
                    // d3 uses 'this' as the reference to the element that was clicked.
                    // tslint:disable-next-line:no-any
                    bars.on('click', function (d: any): void {
                        // Allow selection only if the visual is rendered in a view that supports interactivity (e.g. Report)
                        if (allowInteractions) {
                            selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                bars.attr({
                                    'fill-opacity': ids.length > 0 ? BarChart.config.transparentOpacity : BarChart.config.solidOpacity
                                });

                                d3.select(this).attr({
                                    'fill-opacity': BarChart.config.solidOpacity
                                });
                            });
                            (<Event>d3.event).stopPropagation();
                        }
                    });
                    bars.exit()
                        .remove();
                }
            }
            this.svg.on(
                'click',
                () => this.selectionManager.clear().then(() => this.svg.selectAll('.bar').attr('fill-opacity', 1)));

        }

        public getZoneSettings(dataView: DataView): IZoneSettings {
            let objects: DataViewObjects = null;
            let zoneSetting: IZoneSettings;
            zoneSetting = this.getDefaultZoneSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return zoneSetting; }

            objects = dataView.metadata.objects;
            zoneSetting.zone1Value = DataViewObjects.getValue(objects, chartProperties.zoneSettings.zone1Value, zoneSetting.zone1Value);
            zoneSetting.zone2Value = DataViewObjects.getValue(objects, chartProperties.zoneSettings.zone2Value, zoneSetting.zone2Value);
            zoneSetting.zone1Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone1Color, zoneSetting.zone1Color);
            zoneSetting.zone2Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone2Color, zoneSetting.zone2Color);
            zoneSetting.zone3Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone3Color, zoneSetting.zone3Color);
            zoneSetting.defaultColor = DataViewObjects.getFillColor(
                objects, chartProperties.zoneSettings.defaultColor, zoneSetting.defaultColor);

            return zoneSetting;
        }

        public getDefaultZoneSettings(): IZoneSettings {
            return {
                defaultColor: '#01B8AA',
                zone1Value: 90,
                zone2Value: 101,
                zone1Color: '#fd625e',
                zone2Color: '#f5d33f',
                zone3Color: '#01b8aa'
            };
        }

        private getYAxisSettings(dataView: DataView): IYAxisSettings {
            let objects: DataViewObjects = null;
            let yAxisSetting: IYAxisSettings;
            yAxisSetting = this.getDefaultYAxisSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return yAxisSetting; }

            objects = dataView.metadata.objects;
            yAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.yAxisConfig.fontColor, yAxisSetting.fontColor);
            yAxisSetting.fontSize = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.fontSize, yAxisSetting.fontSize);
            yAxisSetting.displayUnits = DataViewObjects.getValue(
                objects, chartProperties.yAxisConfig.displayUnits, yAxisSetting.displayUnits);
            yAxisSetting.decimalPlaces = DataViewObjects.getValue(
                objects, chartProperties.yAxisConfig.decimalPlaces, yAxisSetting.decimalPlaces);
            if (yAxisSetting.decimalPlaces > 4) {
                yAxisSetting.decimalPlaces = 4;
            } else if (yAxisSetting.decimalPlaces < 0) {
                yAxisSetting.decimalPlaces = 0;
            }

            return yAxisSetting;
        }

        public getDefaultYAxisSettings(): IYAxisSettings {
            return {
                fontColor: '#000000',
                fontSize: 12,
                displayUnits: 0,
                decimalPlaces: 0
            };
        }

        private getYTDSettings(dataView: DataView): ITargetSettings {
            let objects: DataViewObjects = null;
            let yTDSetting: ITargetSettings;
            yTDSetting = this.getDefaultTargetSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return yTDSetting; }

            objects = dataView.metadata.objects;
            yTDSetting.show = DataViewObjects.getValue(objects, chartProperties.yTDConfig.show, yTDSetting.show);
            yTDSetting.lineColor = DataViewObjects.getFillColor(objects, chartProperties.yTDConfig.lineColor, yTDSetting.lineColor);
            yTDSetting.strokeSize = DataViewObjects.getValue(objects, chartProperties.yTDConfig.strokeSize, yTDSetting.strokeSize);
            if (yTDSetting.strokeSize > 5) {
                yTDSetting.strokeSize = 5;
            } else if (yTDSetting.strokeSize < 1) {
                yTDSetting.strokeSize = 1;
            }

            return yTDSetting;
        }

        private getFullTargetSettings(dataView: DataView): ITargetSettings {
            let objects: DataViewObjects = null;
            let fullTargetSettings: ITargetSettings;
            fullTargetSettings = this.getDefaultTargetSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return fullTargetSettings; }

            objects = dataView.metadata.objects;
            fullTargetSettings.show = DataViewObjects.getValue(objects, chartProperties.fullTargetConfig.show, fullTargetSettings.show);
            fullTargetSettings.lineColor = DataViewObjects.getFillColor(
                objects, chartProperties.fullTargetConfig.lineColor, fullTargetSettings.lineColor);
            fullTargetSettings.strokeSize = DataViewObjects.getValue(
                objects, chartProperties.fullTargetConfig.strokeSize, fullTargetSettings.strokeSize);

            if (fullTargetSettings.strokeSize > 5) {
                fullTargetSettings.strokeSize = 5;
            } else if (fullTargetSettings.strokeSize < 1) {
                fullTargetSettings.strokeSize = 1;
            }

            return fullTargetSettings;
        }

        public getDefaultTargetSettings(): ITargetSettings {
            return {
                show: true,
                lineColor: '#808080',
                strokeSize: 1
            };
        }

        public getDefaultLegendSettings(): ILegendSettings {
            return {
                show: true,
                labelColor: '#000',
                labelSize: 12
            };
        }
        public getLegendSettings(dataView: DataView): ILegendSettings {
            let legendSettings: ILegendSettings;
            legendSettings = this.getDefaultLegendSettings();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return legendSettings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let legendProps: any;
            legendProps = chartProperties.legendSettings;
            legendSettings.show = DataViewObjects.getValue(objects, legendProps.show, legendSettings.show);
            legendSettings.labelColor = DataViewObjects.getFillColor(objects, legendProps.labelColor, legendSettings.labelColor);
            legendSettings.labelSize = DataViewObjects.getValue(objects, legendProps.labelSize, legendSettings.labelSize);

            return legendSettings;
        }
        public getDataLabelSettings(dataView: DataView): IDataLabels {
            let dataLabelsSettings: IDataLabels;
            dataLabelsSettings = this.getDefaultDataLabelSettings();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return dataLabelsSettings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let dataProps: any;
            dataProps = chartProperties.dataLabels;
            dataLabelsSettings.show = DataViewObjects.getValue(objects, dataProps.show, dataLabelsSettings.show);
            dataLabelsSettings.fontColor = DataViewObjects.getFillColor(objects, dataProps.fontColor, dataLabelsSettings.fontColor);
            dataLabelsSettings.fontSize = DataViewObjects.getValue(objects, dataProps.fontSize, dataLabelsSettings.fontSize);
            dataLabelsSettings.displayUnits = DataViewObjects.getValue(objects, dataProps.displayUnits, dataLabelsSettings.displayUnits);
            dataLabelsSettings.valueDecimal = DataViewObjects.getValue(objects, dataProps.valueDecimal, dataLabelsSettings.valueDecimal);
            if (dataLabelsSettings.valueDecimal > 4) {
                dataLabelsSettings.valueDecimal = 4;
            } else if (dataLabelsSettings.valueDecimal < 0) {
                dataLabelsSettings.valueDecimal = 0;
            }

            return dataLabelsSettings;
        }
        public getDefaultDataLabelSettings(): IDataLabels {
            return {
                show: false,
                fontColor: '#7c7c7c',
                fontSize: 11,
                displayUnits: 0,
                valueDecimal: 0
            };
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let zoneSetting: IZoneSettings;
            zoneSetting = this.getZoneSettings(this.dataViews);
            let yAxisConfigs: IYAxisSettings;
            yAxisConfigs = this.getYAxisSettings(this.dataViews);
            let yTDConfigs: ITargetSettings;
            yTDConfigs = this.getYTDSettings(this.dataViews);
            let fullYearConfigs: ITargetSettings;
            fullYearConfigs = this.getFullTargetSettings(this.dataViews);
            let legendConfig: ILegendSettings;
            legendConfig = this.getLegendSettings(this.dataViews);
            let dataLabels: IDataLabels;
            dataLabels = this.getDataLabelSettings(this.dataViews);
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];
            switch (objectName) {
                case 'yAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            fill: yAxisConfigs.fontColor,
                            displayUnits: yAxisConfigs.displayUnits,
                            decimalPlaces: yAxisConfigs.decimalPlaces
                        },
                        selector: null
                    });
                    break;

                case 'fullYearTarget':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: fullYearConfigs.show,
                            lineColor: fullYearConfigs.lineColor,
                            strokeSize: fullYearConfigs.strokeSize
                        },
                        selector: null
                    });
                    break;

                case 'yTDTarget':
                    if (this.setYtdTarget) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                show: yTDConfigs.show,
                                lineColor: yTDConfigs.lineColor,
                                strokeSize: yTDConfigs.strokeSize
                            },
                            selector: null
                        });
                        break;
                    }

                case 'zoneSettings':
                    if (this.setYtdTarget) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                zone1Value: zoneSetting.zone1Value,
                                zone2Value: zoneSetting.zone2Value,
                                defaultColor: zoneSetting.defaultColor,
                                zone1Color: zoneSetting.zone1Color,
                                zone2Color: zoneSetting.zone2Color,
                                zone3Color: zoneSetting.zone3Color
                            },
                            selector: null
                        });
                        break;
                    }

                case 'legend':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: legendConfig.show,
                            labelColor: legendConfig.labelColor,
                            fontSize: legendConfig.labelSize
                        },
                        selector: null
                    });
                    break;

                case 'dataLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: dataLabels.show,
                            fontColor: dataLabels.fontColor,
                            fontSize: dataLabels.fontSize,
                            displayUnits: dataLabels.displayUnits,
                            valueDecimal: dataLabels.valueDecimal
                        },
                        selector: null
                    });
                    break;
                default:
                    break;

            }

            return objectEnumeration;
        }

        public destroy(): void {
            // Perform any cleanup tasks here
        }

        // tslint:disable-next-line:no-any
        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let language: string;
            language = getLocalizedString(this.locale, 'LanguageKey');
            let measureFormat: string;
            measureFormat = this.measureFormat;
            let targetFormat: string;
            targetFormat = this.targetFormat;
            let ytdDisplayName: string = '';
            let ytdTarget: string;
            ytdTarget = 'ytdtarget';
            // tslint:disable-next-line:no-any
            this.dataViews.metadata.columns.forEach((element: any) => {
                if (element.roles[ytdTarget]) {
                    ytdDisplayName = element.displayName;
                }
            });
            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({
                format: measureFormat ? measureFormat : ValueFormatter.DefaultNumericFormat
            });
            if (value.ytd) {
                let formatter1: IValueFormatter;
                formatter1 = ValueFormatter.create({
                    format: targetFormat ? targetFormat : ValueFormatter.DefaultNumericFormat
                });

                return [{
                    displayName: value.category,
                    value: formatter.format(value.value)

                },
                {
                    displayName: ytdDisplayName,
                    value: formatter1.format(value.ytd)
                }];
            } else {

                return [{
                    displayName: value.category,
                    value: formatter.format(value.value)
                }];
            }

        }

    }
}
