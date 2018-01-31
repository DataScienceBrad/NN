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
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    /* do not update*/
    interface IBarChartViewModel {
        dataPoints: IBarChartDataPoint[];
        dataMax: number;
        dataMin: number;
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
        // tslint:disable-next-line:no-any
        tooltip: any;
    }

    interface IBarChartSettings {
        enableAxis: {
            show: boolean;
        };
    }

    // tslint:disable-next-line:no-any
    export let chartProperties: any = {
        enableAxis: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'enableAxis', propertyName: 'show' }
        },
        legendSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            labelSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            title: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'title' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontFamily' }
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
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontSize' },
            gridLines: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'gridLines' },
            start: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'start' },
            end: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'end' }
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
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'fontFamily' },
            valueDecimal: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'valueDecimal' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'displayUnits' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'dataLabels', propertyName: 'position' }
        },
        analytics: {
            min: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'min' },
            lineColorMin: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'lineColorMin' },
            strokeSizeMin: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'strokeSizeMin' },
            max: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'max' },
            lineColorMax: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'lineColorMax' },
            strokeSizeMax: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'strokeSizeMax' },
            avg: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'avg' },
            lineColorAvg: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'lineColorAvg' },
            strokeSizeAvg: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'strokeSizeAvg' },
            median: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'median' },
            lineColorMedian: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'lineColorMedian' },
            strokeSizeMedian: <DataViewObjectPropertyIdentifier>{ objectName: 'analytics', propertyName: 'strokeSizeMedian' }
        },
        horizontal: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'horizontal', propertyName: 'show' }
        },
        backgroundImage: {
            imageUrl: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundImage', propertyName: 'imageUrl' },
            transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundImage', propertyName: 'transparency' }
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
        gridLines: boolean;
        start: number;
        end: number;
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
        title: boolean;
        fontFamily: string;
    }
    export interface IDataLabels {
        show: boolean;
        fontColor: string;
        fontSize: number;
        fontFamily: string;
        valueDecimal: number;
        displayUnits: number;
        position: string;
    }
    export interface IBackgroundImage {
        imageUrl: string;
        transparency: number;
    }
    export interface IAnalyticsSettings {
        min: boolean;
        lineColorMin: string;
        strokeSizeMin: number;
        max: boolean;
        lineColorMax: string;
        strokeSizeMax: number;
        avg: boolean;
        lineColorAvg: string;
        strokeSizeAvg: number;
        median: boolean;
        lineColorMedian: string;
        strokeSizeMedian: number;
    }
    export interface IHorizontal {
        show: boolean;
    }
    export interface ITooltipDataPoints {
        name: string;
        value: string;
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
            dataMin: 0,
            fytarget: 0,
            settings: <IBarChartSettings>{}
        };
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values) { return viewModel; }
        let categorical: DataViewCategorical;
        categorical = dataViews[0].categorical;
        context.setYtdTarget = 0;
        let category: DataViewCategoryColumn = null;
        let forecasted: DataViewCategoryColumn = null;
        const tooltip: DataViewCategoryColumn = null;
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
        const tooltipData: string = 'tooltipData';
        const tooltipValues: ITooltipDataPoints[] = [];
        let cnt: number = 0;
        let lengthValues: number = 1;
        for (let iCounter: number = 0; iCounter < categorical.categories.length; iCounter++) {
            if (categorical.categories[iCounter].source.roles[categoryRoleLiteral]) {
                category = categorical.categories[iCounter];
            } else if (categorical.categories[iCounter].source.roles[forecastedRoleLiterral]) {
                forecasted = categorical.categories[iCounter];
            }
        }
        for (let iCounter: number = 0; iCounter < categorical.values.length; iCounter++) {
            if (categorical.values[iCounter].source.roles[tooltipData]) {
                cnt++;
                lengthValues = categorical.values[iCounter].values.length;
                for (let jCnt: number = 0; jCnt < categorical.values[iCounter].values.length; jCnt++) {
                    const tooltipDataPoint: ITooltipDataPoints = {
                        name: categorical.values[iCounter].source.displayName,
                        value: <string>categorical.values[iCounter].values[jCnt]
                    };
                    tooltipValues.push(tooltipDataPoint);
                }
            }
        }
        // tslint:disable-next-line:no-any
        const tooltips: any = [];

        for (let j: number = 0; j < lengthValues; j++) {
            // tslint:disable-next-line:no-any
            const newValues: any = [];
            for (let iCnt: number = 0; iCnt < cnt; iCnt++) {
                if (iCnt === 0) {
                    newValues.push(tooltipValues[j]);
                } else {
                    newValues.push(tooltipValues[j + iCnt * lengthValues]);
                }
            }
            tooltips.push(newValues);
        }
        // tslint:disable-next-line:no-any
        let values: any = [];

        let dataValue: DataViewValueColumn = null;
        let fytarget: PrimitiveValue = null;
        let targetValue: DataViewValueColumn = null;
        let sum: number = 0;
        let length: number = 0;
        for (let iCounter: number = 0; iCounter < categorical.values.length; iCounter++) {
            if (categorical.values[iCounter].source.roles[measureRoleLiteral]) {
                length = categorical.values[iCounter].values.length;
                // tslint:disable-next-line:no-any
                categorical.values[iCounter].values.forEach(function (d: any, iVal: number): void {
                    if (iVal === 0) {
                        context.min = d;
                        context.max = d;
                    }
                    if (d < context.min) {
                        context.min = d;
                    }
                    if (d > context.max) {
                        context.max = d;
                    }
                    values.push(d);
                    sum = sum + d;
                });
                BarChart.thisObj.measureFormat = options.dataViews[0].categorical.values[iCounter].source.format;
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
        values = values.sort();
        const median: number = 0;
        if (values.length % 2 === 0) {
            context.median = (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
        } else {
            context.median = values[Math.floor(values.length / 2)];
        }
        context.average = sum / length;
        let barChartDataPoints: IBarChartDataPoint[];
        barChartDataPoints = [];
        let dataMax: number;
        let dataMin: number;
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
            const newValues: ITooltipDataPoints[] = [];
            for (let j: number = 0; j < cnt; j++) {
                if (j === 0) {
                    newValues.push(tooltipValues[i]);
                } else {
                    newValues.push(tooltipValues[i + j * lengthValues]);
                }
            }
            barChartDataPoints.push({
                category: formatter.format(category.values[i]),
                forecasted: forecasted ? forecasted.values[i] : null,
                value: dataValue.values[i],
                ytd: targetValue ? targetValue.values[i] : null,
                color: defaultColor,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId(),
                tooltip: newValues
            });
        }
        const fontstyle: string = 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif';
        let yAxisHeight: void;
        yAxisHeight =
            category.values.forEach((element: number) => {
                // tslint:disable-next-line:no-any
                let measureTextProperties: any;
                measureTextProperties = {
                    text: category.values[element],
                    fontFamily: fontstyle,
                    fontSize: '12px'
                };
                let yAxisWidth: number;
                yAxisWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
            });
        let dataValMax: number = 0;
        let targetValMax: number = 0;
        let fytargetValMax: number = 0;
        let dataValMin: number = 0;
        let targetValMin: number = 0;
        let fytargetValMin: number = 0;
        if (!!dataValue && !!dataValue.maxLocal) {
            dataValMax = <number>dataValue.maxLocal;
        }
        if (!!targetValue && !!targetValue.maxLocal) {
            targetValMax = <number>targetValue.maxLocal;
        }
        if (fytarget) {
            fytargetValMax = <number>fytarget;
        }
        if (!!dataValue && !!dataValue.minLocal) {
            dataValMin = <number>dataValue.minLocal;
        }
        if (!!targetValue && !!targetValue.minLocal) {
            targetValMin = <number>targetValue.minLocal;
        }
        if (fytarget) {
            fytargetValMin = <number>fytarget;
        }
        dataMax = Math.max(dataValMax, targetValMax, fytargetValMax);
        dataMin = Math.min(dataValMin, targetValMin, fytargetValMin);
        dataMin = dataMin < 0 ? 0 : dataMin;

        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax,
            dataMin: dataMin,
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
        public min: number = 0;
        public max: number = 0;
        public average: number = 0;
        public median: number = 0;
        public bContainer: d3.Selection<SVGElement>;
        public yMin: number = 0;
        public yMax: number = 0;
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
            const fontstyle: string = 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif';
            let measureRoleLiteral: string;
            let ytdtargetLiteral: string;
            let pxLiteral: string;
            let doubleSpaceLiteral: string;
            const labelYVal: number = 5;

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
            this.rootDiv.selectAll
                ('.legend .yTDTargetLegend,.legend .fullYearTargetLegend, .minLegend, .maxLegend, .avgLegend, .medianLegend').remove();
            for (let iCounter: number = 0; iCounter < dataView.categorical.values.length; iCounter++) {
                if (dataView.categorical.values[iCounter].source.roles[measureRoleLiteral]) {
                    this.measureFormat = options.dataViews[0].categorical.values[iCounter].source.format;

                } else if (dataView.categorical.values[iCounter].source.roles[ytdtargetLiteral]) {
                    this.targetFormat = options.dataViews[0].categorical.values[iCounter].source.format;

                }
            }
            this.min = 0;
            this.max = 0;
            if (options.viewport.height > 100) {
                let viewModel: IBarChartViewModel;
                viewModel = visualTransform(options, this.host, this);
                this.yMin = viewModel.dataMin;
                this.yMax = viewModel.dataMax;
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
                let analytics: IAnalyticsSettings;
                analytics = this.getAnalyticsSettings(this.dataViews);
                let horizontal: IHorizontal;
                horizontal = this.getHorizontalSettings(this.dataViews);
                let backgroundImage: IBackgroundImage;
                backgroundImage = this.getBackgroundImageSettings(this.dataViews);
                if (viewModel.dataMax === 0) {
                    return;
                } else {
                    let legendHeight: number = 0;
                    let legendNumber: number = 0;
                    if (legendSettings.show) {
                        if (analytics.min || analytics.max || analytics.avg) {
                            legendNumber = legendNumber + 1;
                        }

                        let legendItemWidth: number;
                        if (this.isITAvailable && this.isTargetAvailable) {
                            legendNumber = legendNumber + 2;
                            legendItemWidth = (options.viewport.width) / 2 - 60 > 0 ? (options.viewport.width) / 2 - 60 : 0;
                        } else {
                            legendNumber = legendNumber + 1;
                            legendItemWidth = options.viewport.width - legendSettings.labelSize - 30;
                        }

                        // this is for solid line
                        let iTargetText: string = this.isITAvailable ? this.itText : '';
                        let ytdtargetTextProps: TextProperties;
                        let sampleTargetTextProps: TextProperties;
                        sampleTargetTextProps = {
                            text: 'Sample Test',
                            fontFamily: fontstyle,
                            fontSize: legendSettings.labelSize + pxLiteral
                        };
                        ytdtargetTextProps = {
                            text: iTargetText,
                            fontFamily: fontstyle,
                            fontSize: legendSettings.labelSize + pxLiteral
                        };
                        iTargetText = textMeasurementService.getTailoredTextOrDefault(ytdtargetTextProps, legendItemWidth);
                        let ytdtargetHeight: number;
                        ytdtargetHeight = textMeasurementService.measureSvgTextHeight(sampleTargetTextProps);

                        // this is for dashed line
                        let fyTargetText: string = this.isTargetAvailable ? this.targetText : '';
                        let fytargetTextProps: TextProperties;
                        fytargetTextProps = {
                            text: fyTargetText,
                            fontFamily: fontstyle,
                            fontSize: legendSettings.labelSize + pxLiteral
                        };
                        fyTargetText = textMeasurementService.getTailoredTextOrDefault(fytargetTextProps, legendItemWidth);
                        let fyTargetTextHeight: number;
                        fyTargetTextHeight = textMeasurementService.measureSvgTextHeight(fytargetTextProps);

                        if (this.isITAvailable && yTDTargetConfig.show) {
                            // this is for solid line
                            legendHeight = ytdtargetHeight;
                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('yTDTargetLegend', true)
                                .append('span')
                                .classed('legendInnerPart', true)
                                .style({
                                    'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                    width: legendSettings.labelSize + pxLiteral,
                                    height: '1px',
                                    'background-color': legendSettings.labelColor,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', this.itText);
                            if (legendSettings.title) {
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
                                        'font-family': legendSettings.fontFamily,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            }
                        }
                        if (this.isTargetAvailable && fullTargetConfig.show) {
                            legendHeight = fyTargetTextHeight;
                            // this is for dashed line
                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('fullYearTargetLegend', true)
                                .append('span')
                                .text('---')
                                .classed('legendInnerPart', true)
                                .style({
                                    'margin-left': '5px',
                                    color: legendSettings.labelColor,
                                    'line-height': fyTargetTextHeight + pxLiteral,
                                    'font-size': legendSettings.labelSize + pxLiteral,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', this.targetText);
                        }
                        if (legendSettings.title) {
                            // this is for target legend
                            this.rootDiv.select('.legend .fullYearTargetLegend')
                                .append('span')
                                .classed('legendInnerPart', true)
                                .text(fyTargetText)
                                .attr('title', this.targetText)
                                .style({
                                    'margin-left': '5px',
                                    'font-size': legendSettings.labelSize + pxLiteral,
                                    color: legendSettings.labelColor,
                                    'font-family': legendSettings.fontFamily,
                                    'max-width': legendItemWidth + pxLiteral
                                });
                        }

                        if (analytics.min) {
                            let minLineText: string = 'Min';
                            let minLineProp: TextProperties;
                            minLineProp = {
                                text: 'Min',
                                fontFamily: fontstyle,
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            minLineText = textMeasurementService.getTailoredTextOrDefault(minLineProp, legendItemWidth);
                            let minLineTextHeight: number;
                            minLineTextHeight = textMeasurementService.measureSvgTextHeight(minLineProp);
                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('minLegend', true)
                                .style({
                                    'max-width': options.viewport.width / 2 + pxLiteral
                                })
                                .append('span')
                                .classed('legendInnerPart', true)
                                .style({
                                    'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                    width: legendSettings.labelSize + pxLiteral,
                                    height: '1px',
                                    'background-color': analytics.lineColorMin,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', 'Min Line');
                            if (legendSettings.title) {
                                this.rootDiv.select('.legend .minLegend')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(minLineText)
                                    .attr('title', 'Min')
                                    .style({
                                        'margin-left': '5px',
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'font-family': legendSettings.fontFamily,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            }
                        }
                        if (analytics.max) {
                            let maxLineText: string = 'Max';
                            let maxLineProp: TextProperties;
                            maxLineProp = {
                                text: 'Max',
                                fontFamily: fontstyle,
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            maxLineText = textMeasurementService.getTailoredTextOrDefault(maxLineProp, legendItemWidth);
                            let maxLineTextHeight: number;
                            maxLineTextHeight = textMeasurementService.measureSvgTextHeight(maxLineProp);

                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('maxLegend', true)
                                .style({
                                    'max-width': options.viewport.width / 2 + pxLiteral
                                })
                                .append('span')
                                .classed('legendInnerPart', true)
                                .style({
                                    height: '1px',
                                    'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                    width: legendSettings.labelSize + pxLiteral,
                                    'background-color': analytics.lineColorMax,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', 'Max Line');
                            if (legendSettings.title) {
                                this.rootDiv.select('.legend .maxLegend')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(maxLineText)
                                    .attr('title', 'Max')
                                    .style({
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'margin-left': '5px',
                                        'font-family': legendSettings.fontFamily,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            }
                        }
                        if (analytics.avg) {

                            let avgLineText: string = 'Avg';
                            let avgLineProp: TextProperties;
                            avgLineProp = {
                                text: 'Avg',
                                fontFamily: fontstyle,
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            avgLineText = textMeasurementService.getTailoredTextOrDefault(avgLineProp, legendItemWidth);
                            let avgLineTextHeight: number;
                            avgLineTextHeight = textMeasurementService.measureSvgTextHeight(avgLineProp);
                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('avgLegend', true)
                                .style({
                                    'max-width': options.viewport.width / 2 + pxLiteral
                                })
                                .append('span')
                                .classed('legendInnerPart', true)
                                .style({
                                    height: '1px',
                                    'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                    width: legendSettings.labelSize + pxLiteral,
                                    'background-color': analytics.lineColorAvg,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', 'Average Line');
                            if (legendSettings.title) {
                                this.rootDiv.select('.legend .avgLegend')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(avgLineText)
                                    .attr('title', 'Average')
                                    .style({
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'margin-left': '5px',
                                        'font-family': legendSettings.fontFamily,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            }
                        }
                        if (analytics.median) {

                            let medianLineText: string = 'Median';
                            let medianLineProp: TextProperties;
                            medianLineProp = {
                                text: 'Median',
                                fontFamily: fontstyle,
                                fontSize: legendSettings.labelSize + pxLiteral
                            };
                            medianLineText = textMeasurementService.getTailoredTextOrDefault(medianLineProp, legendItemWidth);
                            let medianLineTextHeight: number;
                            medianLineTextHeight = textMeasurementService.measureSvgTextHeight(medianLineProp);
                            this.rootDiv.select('.legend')
                                .append('div')
                                .classed('medianLegend', true)
                                .style({
                                    'max-width': options.viewport.width / 2 + pxLiteral
                                })
                                .append('span')
                                .classed('legendInnerPart', true)
                                .style({
                                    height: '1px',
                                    'margin-top': ytdtargetHeight / 2 + pxLiteral,
                                    width: legendSettings.labelSize + pxLiteral,
                                    'background-color': analytics.lineColorMedian,
                                    'font-family': legendSettings.fontFamily
                                })
                                .attr('title', 'Median Line');
                            if (legendSettings.title) {
                                this.rootDiv.select('.legend .medianLegend')
                                    .append('span')
                                    .classed('legendInnerPart', true)
                                    .text(medianLineText)
                                    .attr('title', 'Median')
                                    .style({
                                        'font-size': legendSettings.labelSize + pxLiteral,
                                        color: legendSettings.labelColor,
                                        'margin-left': '5px',
                                        'font-family': legendSettings.fontFamily,
                                        'max-width': legendItemWidth + pxLiteral
                                    });
                            }
                        }
                    }
                    const legendInnerPart: JQuery = $('.legendInnerPart');
                    if (legendInnerPart.length > 0) {
                        const dimension: ClientRect = $(legendInnerPart)[legendInnerPart.length - 1].getBoundingClientRect();
                        legendHeight = dimension.height + dimension.top;
                    } else {
                        legendHeight = 0;
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
                    const yAxisStartLength: number = yAxisConfig.start.toString().length;
                    const yAxisEndLength: number = yAxisConfig.end.toString().length;
                    const yAxisFormatMaxValue: number = yAxisStartLength > yAxisEndLength ? yAxisConfig.start : yAxisConfig.end;
                    const dataSetMaxLength: number = viewModel.dataMax.toString().length;
                    const dataSetMinLength: number = viewModel.dataMin.toString().length;
                    const dataSetFormatMaxValue: number = dataSetMaxLength > dataSetMinLength ? viewModel.dataMax : viewModel.dataMin;
                    const maxValue: number = yAxisFormatMaxValue.toString().length > dataSetFormatMaxValue.toString().length
                        ? yAxisFormatMaxValue : dataSetFormatMaxValue;
                    formattedMaxMeasure = this.yAxisFormatter.format(parseFloat(maxValue.toString()) * 1.1);
                    let measureTextProperties: TextProperties;
                    measureTextProperties = {
                        text: formattedMaxMeasure,
                        fontFamily: fontstyle,
                        fontSize: '12px'
                    };
                    let yAxisWidth: number;
                    yAxisWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                    margins.left = yAxisWidth + 10;
                    this.yAxis.style({
                        'stroke-width': '0.01em',
                        fill: yAxisConfig.fontColor
                    });
                    // tslint:disable-next-line:no-any
                    let bars: any;
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
                        .domain([<number>yAxisConfig.start, <number>yAxisConfig.end * 1.1])
                        .range([<number>height, 10]);

                    let xTargetAxis: d3.Selection<SVGElement>;
                    xTargetAxis = this.targetLines.append('line')
                        .classed('xTargetAxis', true);
                    if (fullTargetConfig.show && viewModel.fytarget) {
                        let yVal: number;
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

                        let targetLineDataLabel: d3.Selection<SVGElement>;
                        targetLineDataLabel = this.targetLines.append('text').text(this.yAxisFormatter.format(viewModel.fytarget))
                            .classed('TargetdataLabel', true);
                        targetLineDataLabel.attr({
                            x: margins.left,
                            y: yVal - labelYVal,
                            fill: fullTargetConfig.lineColor
                        });
                        targetLineDataLabel.append('title').text(viewModel.fytarget);

                        xTargetAxis.style('stroke-dasharray', '7,7');
                    } else {
                        xTargetAxis.attr({
                            'stroke-width': 0
                        });
                    }
                    if (analytics.min) {
                        let minLine: d3.Selection<SVGElement>;
                        minLine = this.targetLines.append('line')
                            .classed('minLine', true);
                        let yValMin: number;
                        yValMin = yScale(<number>this.min);
                        minLine.attr({
                            x1: margins.left,
                            y1: yValMin,
                            x2: dynamicWidth,
                            y2: yValMin,
                            stroke: analytics.lineColorMin,
                            'stroke-width': analytics.strokeSizeMin
                        });

                        let minLinedataLabel: d3.Selection<SVGElement>;
                        minLinedataLabel = this.targetLines.append('text').text(this.yAxisFormatter.format(this.min))
                            .classed('minLinedataLabel', true);
                        minLinedataLabel.attr({
                            x: margins.left,
                            y: yValMin - labelYVal,
                            fill: analytics.lineColorMin
                        });
                        minLinedataLabel.append('title').text(this.min);

                    }
                    if (analytics.max) {
                        let maxLine: d3.Selection<SVGElement>;
                        maxLine = this.targetLines.append('line')
                            .classed('maxLine', true);
                        let yValMax: number;
                        yValMax = yScale(<number>this.max);
                        maxLine.attr({
                            x1: margins.left,
                            y1: yValMax,
                            x2: dynamicWidth,
                            y2: yValMax,
                            stroke: analytics.lineColorMax,
                            'stroke-width': analytics.strokeSizeMax
                        });

                        let maxLinedataLabel: d3.Selection<SVGElement>;
                        maxLinedataLabel = this.targetLines.append('text').text(this.yAxisFormatter.format(this.max))
                            .classed('maxLinedataLabel', true);
                        maxLinedataLabel.attr({
                            x: margins.left,
                            y: yValMax - labelYVal,
                            fill: analytics.lineColorMax
                        });
                        maxLinedataLabel.append('title').text(this.max);
                    }
                    if (analytics.avg) {
                        let avgLine: d3.Selection<SVGElement>;
                        avgLine = this.targetLines.append('line')
                            .classed('avgLine', true);
                        let yValAvg: number;
                        yValAvg = yScale(<number>this.average);
                        avgLine.attr({
                            x1: margins.left,
                            y1: yValAvg,
                            x2: dynamicWidth,
                            y2: yValAvg,
                            stroke: analytics.lineColorAvg,
                            'stroke-width': analytics.strokeSizeAvg
                        });

                        let avgLinedataLabel: d3.Selection<SVGElement>;
                        avgLinedataLabel = this.targetLines.append('text').text(this.yAxisFormatter.format(this.average))
                            .classed('maxLinedataLabel', true);
                        avgLinedataLabel.attr({
                            x: margins.left,
                            y: yValAvg - labelYVal,
                            fill: analytics.lineColorAvg
                        });
                        avgLinedataLabel.append('title').text(this.average);
                    }
                    if (analytics.median) {
                        let medianLine: d3.Selection<SVGElement>;
                        medianLine = this.targetLines.append('line')
                            .classed('medianLine', true);
                        // tslint:disable-next-line:no-any
                        let yValMedian: any;
                        yValMedian = yScale(<number>this.median);
                        medianLine.attr({
                            x1: margins.left,
                            y1: yValMedian,
                            x2: dynamicWidth,
                            y2: yValMedian,
                            stroke: analytics.lineColorMedian,
                            'stroke-width': analytics.strokeSizeMedian
                        });

                        let medianLinedataLabel: d3.Selection<SVGElement>;
                        medianLinedataLabel = this.targetLines.append('text').text(this.yAxisFormatter.format(this.median))
                            .classed('medianLinedataLabel', true);
                        medianLinedataLabel.attr({
                            x: margins.left,
                            y: yValMedian - labelYVal,
                            fill: analytics.lineColorMedian
                        });
                        medianLinedataLabel.append('title').text(this.median);
                    }
                    this.svg.selectAll('.xAxisText').remove();
                    // Format Y Axis labels and render Y Axis labels
                    // tslint:disable-next-line:no-any
                    let yAxis: any;
                    yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .tickFormat(this.yAxisFormatter.format)
                        .ticks(options.viewport.height / 80);

                    const translate: number = margins.left;

                    let translateLeft: string = '';
                    translateLeft = 'translate(';
                    translateLeft += translate;
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
                            if (yAxisConfig.gridLines) {
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
                    }
                    // tslint:disable-next-line:no-any
                    const chartBackground: any = this.barContainer.append('image')
                        .attr('xline:href', backgroundImage.imageUrl);

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

                    bars = this.barContainer.selectAll('.bar').data(barData);
                    bars.enter()
                        .append('rect')
                        .classed('bar', true);
                    bars.attr({
                        width: xScale.rangeBand(),
                        // tslint:disable-next-line:no-any
                        height: 0,
                        // tslint:disable-next-line:no-any
                        y: yScale(yAxisConfig.start),
                        // tslint:disable-next-line:no-any
                        x: function (d: any): any { return xScale(d.category); },
                        // tslint:disable-next-line:no-any
                        fill: (d: any): void => d.color
                    })
                        .transition()
                        .duration(1000)
                        .ease('linear')
                        .attr({
                            // tslint:disable-next-line:no-any
                            y: function (d: any): any {
                                return yScale(<number>d.value);
                            },
                            // tslint:disable-next-line:no-any
                            height: function (d: any): number {
                                return height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value);
                            }
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
                        height: 0,
                        // tslint:disable-next-line:no-any
                        y: yScale(yAxisConfig.start),
                        // tslint:disable-next-line:no-any
                        x: (d: any): any => xScale(d.category),
                        // tslint:disable-next-line:no-any
                        fill: (d: any): any => d.color,
                        'fill-opacity': 0.5,
                        // tslint:disable-next-line:no-any
                        stroke: (d: any): any => d.color,
                        'stroke-width': 1
                    })
                        .transition()
                        .duration(1000)
                        .ease('linear')
                        .attr({
                            // tslint:disable-next-line:no-any
                            y: function (d: any): any {
                                return yScale(<number>d.value);
                            },
                            // tslint:disable-next-line:no-any
                            height: function (d: any): number {
                                return height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value);
                            }
                        });

                    this.barContainer.selectAll('.barforecasted').style('stroke-dasharray', '10,5');

                    // tslint:disable-next-line:no-any
                    barforecasted.on('click', function (d: any): void {
                        // Allow selection only if the visual is rendered in a view that supports interactivity (e.g. Report)
                        if (allowInteractions) {
                            selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                                bars.attr({
                                    'fill-opacity': ids.length > 0 ? BarChart.config.transparentOpacity : BarChart.config.solidOpacity
                                });

                                barforecasted.attr({
                                    'fill-opacity': BarChart.config.transparentOpacity
                                });

                                if (ids.length > 0) {
                                    d3.select(this).attr({
                                        'fill-opacity': 1
                                    });
                                }

                            });
                            (<Event>d3.event).stopPropagation();
                        }
                    });

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

                                barforecasted.attr({
                                    'fill-opacity': BarChart.config.transparentOpacity
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

                    barforecasted.exit()
                        .remove();

                    chartBackground.attr({
                        x: margins.left,
                        y: 10,
                        height: $('.yAxis')[0].getBoundingClientRect().height + pxLiteral,
                        width: (dynamicWidth - margins.left) + pxLiteral,
                        opacity: backgroundImage.transparency / 100,
                        preserveAspectRatio: 'none'
                    });
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
                        if (yTDTargetConfig.show) {
                            let circle: d3.Selection<SVGElement>;
                            circle = this.targetLines.append('circle').attr({
                                cx: lineDataPoints[i].x1,
                                cy: lineDataPoints[i].y1,
                                r: yTDTargetConfig.strokeSize + 1
                            });
                        }
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
                            .classed('dataLabel', true)
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
                                    fontFamily: dataLabels.fontFamily,
                                    fontSize: dataLabels.fontSize + pxLiteral
                                };

                                return textMeasurementService.getTailoredTextOrDefault(tp, barWidths);
                            })
                            .attr({
                                // tslint:disable-next-line:no-any
                                x: (d: any): any => xScale(d.category) + xScale.rangeBand() / 2 + 2,
                                // tslint:disable-next-line:no-any
                                y: (d: any): any => dataLabels.position === 'insideCenter' ?
                                    yScale(<number>d.value - (<number>d.value - <number>yAxisConfig.start) / 2)
                                    + (dataLabels.fontSize / 2) : dataLabels.position === 'insideEnd' ? yScale(<number>d.value) +
                                        (dataLabels.fontSize / 2) + 10
                                        : yScale(yAxisConfig.start) + (dataLabels.fontSize / 2) - 10,
                                'font-size': dataLabels.fontSize + pxLiteral,
                                'font-weight': 'bold',
                                'font-family': dataLabels.fontFamily,
                                'text-anchor': 'middle'
                            }).append('title').text((d: IBarChartDataPoint): number => <number>d.value);

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
                            if (parseInt(barlabel, 10) + labelHeight > yScale(<number>yAxisConfig.start) &&
                             dataLabels.position !== 'insideBase') {
                                $(this).hide();
                            }
                        });
                    }

                    this.tooltipServiceWrapper.addTooltip(
                        this.barContainer.selectAll('.bar,.barforecasted'),
                        (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                        (tooltipEvent: TooltipEventArgs<number>) => null);

                    let selectionManager: ISelectionManager;
                    selectionManager = this.selectionManager;
                    let allowInteractions: boolean;
                    allowInteractions = this.host.allowInteractions;
                }
            }
            this.svg.on(
                'click',
                () => this.selectionManager.clear().then(() => this.svg.selectAll('.bar').attr('fill-opacity', 1)));

        }

        public getHorizontalSettings(dataView: DataView): IHorizontal {
            let objects: DataViewObjects = null;
            let horizontalSetting: IHorizontal;
            horizontalSetting = this.getDefaultHorizontalSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return horizontalSetting; }
            objects = dataView.metadata.objects;
            horizontalSetting.show = DataViewObjects.getValue(objects, chartProperties.horizontal.show, horizontalSetting.show);

            return horizontalSetting;
        }

        public getDefaultHorizontalSettings(): IHorizontal {
            return {
                show: false
            };
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
            yAxisSetting.gridLines = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.gridLines, yAxisSetting.gridLines);
            yAxisSetting.start = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.start, yAxisSetting.start);
            yAxisSetting.end = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.end, yAxisSetting.end);
            if (yAxisSetting.start > this.yMin) {
                yAxisSetting.start = this.yMin;
            }
            if (yAxisSetting.start < 0) {
                yAxisSetting.start = this.yMin;
            }
            if (yAxisSetting.end < this.yMax) {
                yAxisSetting.end = this.yMax;
            }
            if (yAxisSetting.decimalPlaces > 4) {
                yAxisSetting.decimalPlaces = 4;
            } else if (yAxisSetting.decimalPlaces < 0) {
                yAxisSetting.decimalPlaces = 0;
            }

            return yAxisSetting;
        }

        private getAnalyticsSettings(dataView: DataView): IAnalyticsSettings {
            let objects: DataViewObjects = null;
            let analyticsSettings: IAnalyticsSettings;
            analyticsSettings = this.getDefaultAnalyticsSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return analyticsSettings; }

            objects = dataView.metadata.objects;
            analyticsSettings.min = DataViewObjects.getValue(objects, chartProperties.analytics.min, analyticsSettings.min);
            analyticsSettings.lineColorMin = DataViewObjects.getFillColor
                (objects, chartProperties.analytics.lineColorMin, analyticsSettings.lineColorMin);
            analyticsSettings.strokeSizeMin = DataViewObjects.getValue
                (objects, chartProperties.analytics.strokeSizeMin, analyticsSettings.strokeSizeMin) > 5 ? 5
                : DataViewObjects.getValue
                    (objects, chartProperties.analytics.strokeSizeMin, analyticsSettings.strokeSizeMin);
            analyticsSettings.max = DataViewObjects.getValue(objects, chartProperties.analytics.max, analyticsSettings.max);
            analyticsSettings.lineColorMax = DataViewObjects.getFillColor
                (objects, chartProperties.analytics.lineColorMax, analyticsSettings.lineColorMax);
            analyticsSettings.strokeSizeMax = DataViewObjects.getValue
                (objects, chartProperties.analytics.strokeSizeMax, analyticsSettings.strokeSizeMax) > 5 ? 5
                : DataViewObjects.getValue
                    (objects, chartProperties.analytics.strokeSizeMax, analyticsSettings.strokeSizeMax);
            analyticsSettings.avg = DataViewObjects.getValue(objects, chartProperties.analytics.avg, analyticsSettings.avg);
            analyticsSettings.lineColorAvg = DataViewObjects.getFillColor
                (objects, chartProperties.analytics.lineColorAvg, analyticsSettings.lineColorAvg);
            analyticsSettings.strokeSizeAvg = DataViewObjects.getValue
                (objects, chartProperties.analytics.strokeSizeAvg, analyticsSettings.strokeSizeAvg) > 5 ? 5
                : DataViewObjects.getValue
                    (objects, chartProperties.analytics.strokeSizeAvg, analyticsSettings.strokeSizeAvg);
            analyticsSettings.median = DataViewObjects.getValue(objects, chartProperties.analytics.median, analyticsSettings.median);
            analyticsSettings.lineColorMedian = DataViewObjects.getFillColor
                (objects, chartProperties.analytics.lineColorMedian, analyticsSettings.lineColorMedian);
            analyticsSettings.strokeSizeMedian = DataViewObjects.getValue
                (objects, chartProperties.analytics.strokeSizeMedian, analyticsSettings.strokeSizeMedian) > 5 ? 5
                : DataViewObjects.getValue(objects, chartProperties.analytics.strokeSizeMedian, analyticsSettings.strokeSizeMedian);

            analyticsSettings.strokeSizeAvg = analyticsSettings.strokeSizeAvg < 1 ? 1 : analyticsSettings.strokeSizeAvg;
            analyticsSettings.strokeSizeMin = analyticsSettings.strokeSizeMin < 1 ? 1 : analyticsSettings.strokeSizeMin;
            analyticsSettings.strokeSizeMax = analyticsSettings.strokeSizeMax < 1 ? 1 : analyticsSettings.strokeSizeMax;
            analyticsSettings.strokeSizeMedian = analyticsSettings.strokeSizeMedian < 1 ? 1 : analyticsSettings.strokeSizeMedian;

            return analyticsSettings;
        }

        public getDefaultAnalyticsSettings(): IAnalyticsSettings {
            return {
                min: false,
                lineColorMin: 'black',
                strokeSizeMin: 1,
                max: false,
                lineColorMax: 'black',
                strokeSizeMax: 1,
                avg: false,
                lineColorAvg: 'black',
                strokeSizeAvg: 1,
                median: false,
                lineColorMedian: 'black',
                strokeSizeMedian: 1
            };
        }

        public getDefaultYAxisSettings(): IYAxisSettings {
            return {
                fontColor: '#000000',
                fontSize: 12,
                displayUnits: 0,
                decimalPlaces: 0,
                gridLines: true,
                start: 0,
                end: this.yMax
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

        private getBackgroundImageSettings(dataView: DataView): IBackgroundImage {
            let objects: DataViewObjects = null;
            let backgroundImageSettings: IBackgroundImage;
            backgroundImageSettings = this.getDefaultBackgroundImageSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return backgroundImageSettings; }
            objects = dataView.metadata.objects;
            backgroundImageSettings.imageUrl = DataViewObjects.getValue
                (objects, chartProperties.backgroundImage.imageUrl, backgroundImageSettings.imageUrl);
            backgroundImageSettings.transparency = DataViewObjects.getValue
                (objects, chartProperties.backgroundImage.transparency, backgroundImageSettings.transparency);

            return backgroundImageSettings;
        }

        public getDefaultTargetSettings(): ITargetSettings {
            return {
                show: true,
                lineColor: '#808080',
                strokeSize: 1
            };
        }
        public getDefaultBackgroundImageSettings(): IBackgroundImage {
            return {
                imageUrl: '',
                transparency: 50
            };
        }

        public getDefaultLegendSettings(): ILegendSettings {
            return {
                show: true,
                labelColor: '#000',
                labelSize: 12,
                fontFamily: 'Segoe UI',
                title: true
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
            legendSettings.title = DataViewObjects.getValue(objects, legendProps.title, legendSettings.title);
            legendSettings.fontFamily = DataViewObjects.getValue(objects, legendProps.fontFamily, legendSettings.fontFamily);

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
            dataLabelsSettings.fontFamily = DataViewObjects.getValue(objects, dataProps.fontFamily, dataLabelsSettings.fontFamily);
            dataLabelsSettings.displayUnits = DataViewObjects.getValue(objects, dataProps.displayUnits, dataLabelsSettings.displayUnits);
            dataLabelsSettings.valueDecimal = DataViewObjects.getValue(objects, dataProps.valueDecimal, dataLabelsSettings.valueDecimal);
            dataLabelsSettings.position = DataViewObjects.getValue(objects, dataProps.position, dataLabelsSettings.position);
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
                fontFamily: 'Segoe UI',
                displayUnits: 0,
                valueDecimal: 0,
                position: 'insideEnd'
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
            let analytics: IAnalyticsSettings;
            analytics = this.getAnalyticsSettings(this.dataViews);
            let horizontal: IHorizontal;
            horizontal = this.getHorizontalSettings(this.dataViews);
            let backgroundImage: IBackgroundImage;
            backgroundImage = this.getBackgroundImageSettings(this.dataViews);
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
                            decimalPlaces: yAxisConfigs.decimalPlaces,
                            gridLines: yAxisConfigs.gridLines,
                            start: yAxisConfigs.start,
                            end: yAxisConfigs.end
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
                case 'analytics':
                    const obj: {} = {};
                    obj[`min`] = analytics.min;
                    if (analytics.min) {
                        obj[`lineColorMin`] = analytics.lineColorMin;
                        obj[`strokeSizeMin`] = analytics.strokeSizeMin;
                    }
                    obj[`max`] = analytics.max;
                    if (analytics.max) {
                        obj[`lineColorMax`] = analytics.lineColorMax;
                        obj[`strokeSizeMax`] = analytics.strokeSizeMax;
                    }
                    obj[`avg`] = analytics.avg;
                    if (analytics.avg) {
                        obj[`lineColorAvg`] = analytics.lineColorAvg;
                        obj[`strokeSizeAvg`] = analytics.strokeSizeAvg;
                    }
                    obj[`median`] = analytics.median;
                    if (analytics.median) {
                        obj[`lineColorMedian`] = analytics.lineColorMedian;
                        obj[`strokeSizeMedian`] = analytics.strokeSizeMedian;
                    }
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: obj,
                        selector: null
                    });
                    break;

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
                            fontSize: legendConfig.labelSize,
                            title: legendConfig.title,
                            fontFamily: legendConfig.fontFamily
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
                            fontFamily: dataLabels.fontFamily,
                            displayUnits: dataLabels.displayUnits,
                            valueDecimal: dataLabels.valueDecimal,
                            position: dataLabels.position
                        },
                        selector: null
                    });
                    break;
                case 'backgroundImage':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            imageUrl: backgroundImage.imageUrl,
                            transparency: backgroundImage.transparency
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
            const tooltipDataPoints: VisualTooltipDataItem[] = [];
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
                tooltipDataPoints.push(
                {
                    displayName: value.category,
                    value: formatter.format(value.value)
                },
                {
                    displayName: ytdDisplayName,
                    value: formatter1.format(value.ytd)
                });
            } else {
                tooltipDataPoints.push({
                    displayName: value.category,
                    value: formatter.format(value.value)
                });
            }
            for (const iCounter of value.tooltip) {
                const tooltipData: VisualTooltipDataItem = {
                    displayName: '',
                    value: ''
                };
                tooltipData.displayName = iCounter.name.toString();
                tooltipData.value = iCounter.value.toString();
                tooltipDataPoints.push(tooltipData);
            }

            return tooltipDataPoints;

        }

    }
}
