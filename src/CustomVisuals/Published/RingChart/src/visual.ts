module powerbi.extensibility.visual {

    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    let legendValues: string[];
    legendValues = [];
    let legendValuesTorender: string[];
    legendValuesTorender = [];
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {
                return defaultValue;
            }

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
            objects: DataViewObjects,
            propertyId: DataViewObjectPropertyIdentifier,
            defaultColor?: string): string {
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

            if (!object) {
                return defaultValue;
            }

            let propertyValue: T;
            propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }

    }

    export interface ITooltipDataPoints {
        name: string;
        value: string;
        formatter: string;
    }
    interface IDonutChartViewModel {
        legendData: LegendData;
        dataPoints: IDonutChartDataPoint[];
        dataMax: number;
        settings: IDonutChartSettings;
        primaryMeasureSum: number;
        secondaryMeasureSum: number;
        primaryKPISum: number;
        secondaryKPISum: number;
        isLegendAvailable: boolean;
        isPrimaryMeasureAvailable: boolean;
    }
    interface IDonutChartDataPoint {
        value: PrimitiveValue;
        secondaryValue: PrimitiveValue;
        primaryKPIValue: PrimitiveValue;
        secondaryKPIValue: PrimitiveValue;
        category: string;
        primaryName: string;
        secondaryName: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
        tooltipData: ITooltipDataPoints[];
    }

    interface IDonutChartSettings {
        generalView: {
            opacity: number;
        };
    }

    export interface ILegendConfig {
        show: boolean;
        legendName: string;
        primaryMeasure: string;
        displayUnits: number;
        decimalPlaces: number;
    }

    // Interface for Detail Labels
    export interface IDetailLables {
        show: boolean;
        fontSize: number;
        color: string;
        labelDisplayUnits: number;
        labelPrecision: number;
        labelStyle: string;
    }

    export interface ISummaryLabels {
        show: boolean;
        color: string;
        labelDisplayUnits: number;
        labelPrecision: number;
        fontSize: number;
        text: string;
    }

    export interface ISecondarySummaryLabels {
        color: string;
        labelDisplayUnits: number;
        labelPrecision: number;
        fontSize: number;
    }

    export interface IPrimaryIndicator {
        show: boolean;
        signIndicator: boolean;
        threshold: number;
        totalThreshold: number;
        upArrow: string;
        downArrow: string;
    }
    export interface ISecondaryIndicator {
        show: boolean;
        signIndicator: boolean;
        threshold: number;
        totalThreshold: number;
        upArrow: string;
        downArrow: string;
    }

    export interface IDonutTitle {
        show: boolean;
        titleText: string;
        fill1: string;
        fontSize: number;
        backgroundColor: string;
        tooltipText: string;
    }

    export interface IAnimation {
        show: boolean;
    }

    export interface INodataText {
        textMessage: string;
    }

    export let chartProperties: {
        animation: {
            show: DataViewObjectPropertyIdentifier;
        };
        donutTitle: {
            backgroundColor: DataViewObjectPropertyIdentifier;
            fill1: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            titleText: DataViewObjectPropertyIdentifier;
            tooltipText: DataViewObjectPropertyIdentifier;
        };
        indicators: {
            downArrow: DataViewObjectPropertyIdentifier;
            primaryMeasure: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            threshold: DataViewObjectPropertyIdentifier;
            totalThreshold: DataViewObjectPropertyIdentifier;
            upArrow: DataViewObjectPropertyIdentifier;
        };
        labels: {
            color: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            labelDisplayUnits: DataViewObjectPropertyIdentifier;
            labelPrecision: DataViewObjectPropertyIdentifier;
            labelStyle: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
        };
        legendSettings: {
            decimalPlaces: DataViewObjectPropertyIdentifier;
            displayUnits: DataViewObjectPropertyIdentifier;
            legendName: DataViewObjectPropertyIdentifier;
            primaryMeasure: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
        };
        nodatatext: {
            textMessage: DataViewObjectPropertyIdentifier;
        };
        secondarySummaryLabels: {
            color: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            labelDisplayUnits: DataViewObjectPropertyIdentifier;
            labelPrecision: DataViewObjectPropertyIdentifier;
        };
        smIndicator: {
            downArrow: DataViewObjectPropertyIdentifier;
            secondaryMeasure: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            threshold: DataViewObjectPropertyIdentifier;
            totalThreshold: DataViewObjectPropertyIdentifier;
            upArrow: DataViewObjectPropertyIdentifier;
        };
        summaryLabels: {
            color: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            labelDisplayUnits: DataViewObjectPropertyIdentifier;
            labelPrecision: DataViewObjectPropertyIdentifier;
            show: DataViewObjectPropertyIdentifier;
            text: DataViewObjectPropertyIdentifier;
        };
    };
    chartProperties = {
        animation: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'animation', propertyName: 'show' }
        },
        donutTitle: {
            backgroundColor: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'backgroundColor' },
            fill1: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'fill1' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'fontSize' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'show' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'titleText' },
            tooltipText: <DataViewObjectPropertyIdentifier>{ objectName: 'GMODonutTitle', propertyName: 'tooltipText' }
        },
        indicators: {
            downArrow: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'downArrow' },
            primaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'PrimaryMeasure' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'show' },
            threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Threshold' },
            totalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Total_Threshold' },
            upArrow: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'upArrow' }
        },
        labels:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            labelStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelStyle' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' }
        },
        legendSettings: {
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelPrecision' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelDisplayUnits' },
            legendName: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            primaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'detailedLegend' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' }
        },
        nodatatext: {
            textMessage: <DataViewObjectPropertyIdentifier>{ objectName: 'nodatatext', propertyName: 'textMessage' }
        },
        secondarySummaryLabels:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'secondarySummaryLabels', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'secondarySummaryLabels', propertyName: 'fontSize' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'secondarySummaryLabels',
                propertyName: 'labelDisplayUnits'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'secondarySummaryLabels', propertyName: 'labelPrecision' }
        },
        smIndicator: {
            downArrow: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'downArrow' },
            secondaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SecondaryMeasure' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'show' },
            threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMThreshold' },
            totalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMTotalThreshold' },
            upArrow: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'upArrow' }
        },
        summaryLabels:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'fontSize' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'labelPrecision' },
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'show' },
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'primaryMeasureSummaryText' }
        }
    };

    /* tslint:disable:no-any */
    const d3: any = (<any>window).d3;
    /* tslint:enable:no-any */
    export class DonutChart implements IVisual {
        public groupLegends: d3.Selection<SVGElement>;
        public dataView: DataView;
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private donutChartContainer: d3.Selection<SVGElement>;
        private donutContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private donutDataPoints: IDonutChartDataPoint[];
        private donutChartSettings: IDonutChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private dataViews: DataView;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private currentViewport: IViewport;
        // tslint:disable-next-line:no-any
        private rootElement: any;
        private defaultFontFamily: string;
        private labelFontFamily: string;
        private primaryMeasurePercent: boolean;
        private isSMExists: boolean;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element);
            let svg: d3.Selection<SVGElement>;
            svg = this.svg = d3.select(options.element)
                .style({
                    cursor: 'default'
                })
                .append('svg')
                .classed('ring_donutChart', true);

            this.locale = options.host.locale;
            this.rootElement.append('div')
                .classed('ring_donutTitle', true).style('top', 0);

            // tslint:disable-next-line:no-any
            let oElement: any;
            oElement = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select('.ring_legend'); // ring_legend class is added in index.js

            d3.select(options.element)
                .append('div')
                .classed('ring_SummarizedDiv', true);
            this.defaultFontFamily = 'Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif';
            this.labelFontFamily = 'wf_standard-font, helvetica, arial, sans-serif';
            this.primaryMeasurePercent = false;

        }

        public visualTransform(options: VisualUpdateOptions, host: IVisualHost): IDonutChartViewModel {
            let dataViews: DataView[];
            dataViews = options.dataViews;
            let defaultSettings: IDonutChartSettings;
            defaultSettings = {
                generalView: {
                    opacity: 100
                }
            };
            let viewModel: IDonutChartViewModel;
            viewModel = {
                dataMax: 0,
                dataPoints: [],
                isLegendAvailable: false,
                isPrimaryMeasureAvailable: false,
                legendData: null,
                primaryKPISum: null,
                primaryMeasureSum: null,
                secondaryKPISum: null,
                secondaryMeasureSum: null,
                settings: <IDonutChartSettings>{}
            };

            if (!dataViews
                || !dataViews[0]
                || !dataViews[0].categorical
                || !dataViews[0].categorical.categories
                || !dataViews[0].categorical.categories[0].source
                || !dataViews[0].categorical.values) {
                return viewModel;
            }
            let categorical: DataViewCategorical;
            categorical = dataViews[0].categorical;
            let category: DataViewCategoryColumn;
            category = categorical.categories[0];
            let dataValue: DataViewValueColumn;
            dataValue = categorical.values[0];

            let donutChartDataPoints: IDonutChartDataPoint[];
            donutChartDataPoints = [];
            let dataMax: number;
            let primaryMeasureSum: number = 0;
            let secondaryMeasureSum: number = 0;

            let primarykpiSum: number = 0;
            let secondarykpiSum: number = 0;

            let colorPalette: IColorPalette;
            colorPalette = host.colorPalette;
            let objects: DataViewObjects;
            objects = dataViews[0].metadata.objects;
            let donutChartSettings: IDonutChartSettings;
            donutChartSettings = {
                generalView: {
                    opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity)
                }
            };
            // logic to check if category and primary measure are available
            let isLegendAvailable: boolean = false;
            let isPrimaryMeasureAvailable: boolean = false;
            for (let cat1: number = 0; cat1 < dataViews[0].categorical.categories.length; cat1++) {
                let dataView: DataView;
                dataView = dataViews[0];
                if (dataView.categorical.categories[cat1].source.roles.hasOwnProperty('Category')) {
                    isLegendAvailable = true;
                }
            }
            for (let k: number = 0; k < dataViews[0].categorical.values.length; k++) {
                let dataView: DataView;
                dataView = dataViews[0];
                if (dataView.categorical.values[k].source.roles.hasOwnProperty('Y')) {
                    isPrimaryMeasureAvailable = true;
                }
            }
            let len: number;
            len = Math.max(category.values.length, dataValue.values.length);
            for (let i: number = 0; i < len; i++) {
                let defaultColor: Fill;
                defaultColor = {
                    solid: {
                        color: colorPalette.getColor(category.values[i].toString()).value
                    }
                };

                let donutDataPoint: IDonutChartDataPoint;
                donutDataPoint = {
                    category: '',
                    color: '',
                    primaryKPIValue: '',
                    primaryName: '',
                    secondaryKPIValue: '',
                    secondaryName: '',
                    secondaryValue: '',
                    selectionId: null,
                    tooltipData: [],
                    value: ''
                };
                for (let cat1: number = 0; cat1 < dataViews[0].categorical.categories.length; cat1++) {
                    let dataView: DataView;
                    dataView = dataViews[0];
                    if (dataView.categorical.categories[cat1].source.roles.hasOwnProperty('Category')) {
                        donutDataPoint.category = dataView.categorical.categories[cat1].values[i] ?
                            (dataView.categorical.categories[cat1].values[i].toString()) : '';
                    }
                    let tooltipDataPoint: ITooltipDataPoints;
                    tooltipDataPoint = {
                        formatter: '',
                        name: dataView.categorical.categories[cat1].source.displayName,
                        value: dataView.categorical.categories[cat1].values[i] ?
                            (dataView.categorical.categories[cat1].values[i].toString()) : ''
                    };
                    donutDataPoint.tooltipData.push(tooltipDataPoint);
                }

                for (let k: number = 0; k < dataViews[0].categorical.values.length; k++) {
                    let dataView: DataView;
                    dataView = dataViews[0];
                    let dataVal: PrimitiveValue = dataView.categorical.values[k].values[i];
                    dataVal = dataVal < 0 ? 0 : dataVal;
                    let colName: string;
                    colName = dataView.categorical.values[k].source.displayName ?
                        dataView.categorical.values[k].source.displayName.toString() : '';
                    if (dataView.categorical.values[k].source.roles.hasOwnProperty('Y')) {
                        donutDataPoint.primaryName = colName;
                        donutDataPoint.value = dataVal;
                        primaryMeasureSum += parseFloat(dataVal ? dataVal.toString() : '0');
                    }
                    if (dataView.categorical.values[k].source.roles.hasOwnProperty('SecondaryMeasure')) {
                        donutDataPoint.secondaryName = colName;
                        donutDataPoint.secondaryValue = dataVal;
                        secondaryMeasureSum += parseFloat(dataVal ? dataVal.toString() : '0');
                        this.isSMExists = true;
                    }
                    if (dataView.categorical.values[k].source.roles.hasOwnProperty('PrimaryKPI')) {
                        donutDataPoint.primaryKPIValue = dataVal;
                        primarykpiSum += parseFloat(dataVal ? dataVal.toString() : '0');
                    }
                    if (dataView.categorical.values[k].source.roles.hasOwnProperty('SecondaryKPI')) {
                        donutDataPoint.secondaryKPIValue = dataVal;
                        secondarykpiSum += parseFloat(dataVal ? dataVal.toString() : '0');
                    }
                    let tooltipDataPoint: ITooltipDataPoints;
                    tooltipDataPoint = {
                        formatter: dataView.categorical.values[k].source.format ?
                            dataView.categorical.values[k].source.format : ValueFormatter.DefaultNumericFormat,
                        name: colName,
                        value: dataVal ? dataVal.toString() : '(Blank)'
                    };
                    donutDataPoint.tooltipData.push(tooltipDataPoint);
                }
                donutDataPoint.color = getCategoricalObjectValue<Fill>(category, i, 'dataPoint', 'fill', defaultColor).solid.color;
                donutDataPoint.selectionId = host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId();

                donutChartDataPoints.push(donutDataPoint);
            }
            dataMax = <number>dataValue.maxLocal;

            return {
                dataMax: dataMax,
                dataPoints: donutChartDataPoints,
                isLegendAvailable: isLegendAvailable,
                isPrimaryMeasureAvailable: isPrimaryMeasureAvailable,
                legendData: this.getLegendData(dataViews[0], donutChartDataPoints, host),
                primaryKPISum: primarykpiSum,
                primaryMeasureSum: primaryMeasureSum,
                secondaryKPISum: secondarykpiSum,
                secondaryMeasureSum: secondaryMeasureSum,
                settings: donutChartSettings
            };
        }
        public getLegendData(dataView: DataView, donutChartDataPoints: IDonutChartDataPoint[], host: IVisualHost): LegendData {

            let legendSettings: ILegendConfig;
            legendSettings = this.getLegendSettings(dataView);

            let legendData: LegendData;
            legendData = {
                dataPoints: [],
                fontSize: 8,
                title: legendSettings.legendName
            };

            if (donutChartDataPoints && donutChartDataPoints[0] && donutChartDataPoints[0].primaryName) {
                legendData.primaryTitle = donutChartDataPoints[0].primaryName;
            }

            if (donutChartDataPoints && donutChartDataPoints[0] && donutChartDataPoints[0].secondaryName) {
                legendData.secondaryTitle = donutChartDataPoints[0].secondaryName;
            }

            for (let i: number = 0; i < donutChartDataPoints.length; ++i) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    if (legendData.secondaryTitle) {
                        legendData.dataPoints.push({
                            color: donutChartDataPoints[i].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            identity: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], i).createSelectionId(),
                            label: donutChartDataPoints[i].category,
                            measure: donutChartDataPoints[i].value,
                            secondaryMeasure: donutChartDataPoints[i].secondaryValue,
                            selected: false

                        });
                    } else {
                        legendData.dataPoints.push({
                            color: donutChartDataPoints[i].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            identity: host.createSelectionIdBuilder().withCategory(
                                dataView.categorical.categories[0], i).createSelectionId(),
                            label: donutChartDataPoints[i].category,
                            measure: donutChartDataPoints[i].value,
                            selected: false

                        });
                    }
                }
                legendValues[i] = donutChartDataPoints[i].category;
            }

            return legendData;
        }

        public update(options: VisualUpdateOptions): void {
            this.dataViews = options.dataViews[0];
            let THIS: this;
            THIS = this;
            this.isSMExists = false;

            let viewModel: IDonutChartViewModel;
            viewModel = this.visualTransform(options, this.host);
            this.donutChartSettings = viewModel.settings;

            this.donutDataPoints = viewModel.dataPoints;
            let lablesettings: IDetailLables;
            lablesettings = this.getDetailLable(this.dataViews);
            this.svg.selectAll('*').remove();
            this.rootElement.select('.ring_ErrorMessage').remove();
            this.rootElement.select('.ring_SummarizedDivContainer').remove();
            this.rootElement
                .selectAll('.ring_legend #legendGroup .legendItem, .ring_legend #legendGroup .legendTitle')
                .remove();
            this.rootElement
                .selectAll('.ring_legend #legendGroup .navArrow')
                .remove();
            this.rootElement.selectAll('.ring_donutTitle .ring_donutTitleDiv').remove();

            let noDataMessage: INodataText;
            noDataMessage = this.getNoDataText(this.dataViews);
            let errorMsg: string;
            errorMsg = noDataMessage.textMessage;

            if (!viewModel || !viewModel.isLegendAvailable || !viewModel.isPrimaryMeasureAvailable) {
                const message: string = 'Please select "Primary Measure" and "Legend" values';
                this.rootElement
                    .append('div')
                    .classed('ring_ErrorMessage', true)
                    .text(message)
                    .attr('title', message);

                return;
            } else if (!viewModel.legendData || !viewModel.primaryMeasureSum) {
                this.rootElement
                    .append('div')
                    .classed('ring_ErrorMessage', true)
                    .text(errorMsg)
                    .attr('title', errorMsg);

                return;
            }

            this.dataView = options.dataViews[0];

            let detaillabelprop: IDetailLables;
            detaillabelprop = this.getDetailLable(this.dataViews);
            let legendSettings: ILegendConfig;
            legendSettings = this.getLegendSettings(this.dataViews);
            let summaryLabelSettings: ISummaryLabels;
            summaryLabelSettings = this.getSummaryLabels(this.dataViews);
            let donutTitleSettings: IDonutTitle;
            donutTitleSettings = this.getDonutTitle(this.dataViews);

            let donutWidth: number = options.viewport.width;
            let donutHeight: number = options.viewport.height;

            let donutTitleHeight: number = 0;
            if (donutTitleSettings.show) {
                this.rootElement.select('.ring_donutTitle').style({
                    display: 'block',
                    position: 'absolute'
                });
                let textProperties: TextProperties;
                textProperties = {
                    fontFamily: THIS.defaultFontFamily,
                    fontSize: PixelConverter.fromPoint(donutTitleSettings.fontSize),
                    text: donutTitleSettings.titleText
                };
                let finalText: string;
                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth - 70);
                let titleDiv: d3.Selection<SVGElement>;
                titleDiv = this.rootElement.select('.ring_donutTitle')
                    .append('div')
                    .classed('ring_donutTitleDiv', true)
                    .style({
                        'background-color': donutTitleSettings.backgroundColor,
                        color: donutTitleSettings.fill1,
                        'font-size': PixelConverter.fromPoint(donutTitleSettings.fontSize)
                    })
                    .text(finalText);

                if (donutTitleSettings.tooltipText.trim() !== '') {
                    titleDiv
                        .append('span')
                        .text(' (?)')
                        .attr('title', donutTitleSettings.tooltipText);
                }
                donutTitleHeight = parseFloat($('.ring_donutTitle').css('height'));
                donutHeight = donutHeight - donutTitleHeight;
            }
            this.currentViewport = {
                height: Math.max(0, options.viewport.height - donutTitleHeight),
                width: Math.max(0, options.viewport.width)
            };

            let legendWidth: number = 0;
            let legendHeight: number = 0;

            if (legendSettings.show) {
                this.rootElement.select('.ring_legend').style({
                    top: `${donutTitleHeight}px`
                });
                this.renderLegend(viewModel, this.dataViews);

                legendWidth = parseFloat($('.ring_legend').attr('width'));
                legendHeight = parseFloat($('.ring_legend').attr('height'));
                let legendPos: string;
                legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                if (legendPos === 'top' || legendPos === 'topcenter') {
                    donutHeight = donutHeight - legendHeight <= 0 ? 0 : donutHeight - legendHeight;
                    this.svg.style('margin-top', `${legendHeight + donutTitleHeight}px`);
                } else if (legendPos === 'bottom' || legendPos === 'bottomcenter') {
                    donutHeight = donutHeight - legendHeight <= 0 ? 0 : donutHeight - legendHeight;
                    this.svg.style('margin-top', `${donutTitleHeight}px`);
                } else if (legendPos === 'left' || legendPos === 'leftcenter' || legendPos === 'right' || legendPos === 'rightcenter') {
                    donutWidth = donutWidth - legendWidth <= 0 ? 0 : donutWidth - legendWidth;
                    this.svg.style('margin-top', `${donutTitleHeight}px`);
                } else {
                    this.svg.style('margin-top', `${donutTitleHeight}px`);
                }
            } else {
                const x: string = `${donutTitleHeight}px`;
                this.svg.style('margin-top', x);
                this.svg.style('margin-left', 0);
                this.svg.style('margin-right', 0);
            }

            this.svg.attr({
                height: donutHeight,
                width: donutWidth
            });

            let radius: number;
            radius = Math.min(donutWidth, donutHeight) / 2;

            let outerMultiplier: number = 0.85;
            let innerMultiplier: number = 0.55;

            if (lablesettings.show) {
                outerMultiplier = 0.75;
                innerMultiplier = 0.45;
            }

            // tslint:disable-next-line:no-any
            let arc: any;
            arc = d3.svg.arc()
                .outerRadius(radius * outerMultiplier)
                .innerRadius(radius * innerMultiplier);

            // tslint:disable-next-line:no-any
            let pie: any;
            pie = d3.layout.pie()
                .sort(null)
                // tslint:disable-next-line:no-any
                .value(function (d: any): any { return d.value; });

            let svg: d3.Selection<SVGElement>;
            svg = d3.select('.ring_donutChart').append('svg')
                .attr('width', donutWidth)
                .attr('height', donutHeight)
                .append('g')
                .attr('transform', `translate(${donutWidth / 2},${donutHeight / 2})`);

            // tslint:disable-next-line:no-any
            let g: any;
            g = svg.selectAll('.ring_arc')
                .data(pie(viewModel.dataPoints))
                .enter().append('g')
                .attr('class', 'ring_arc');

            g.append('path')
                .attr('d', arc)
                // tslint:disable-next-line:no-any
                .style('fill', function (d: any): string { return d.data.color; });

            // tslint:disable-next-line:no-any
            let outerArc: any;
            outerArc = d3.svg.arc()
                .outerRadius(radius * 0.82)
                .innerRadius(radius * 0.82);

            // tslint:disable-next-line:no-any
            function midAngle(d: any): any { return d.startAngle + ((d.endAngle - d.startAngle)) / 2; }

            if (lablesettings.show) {
                // tslint:disable-next-line:no-any
                let enteringLabels: any;
                enteringLabels = svg.selectAll('.ring_polyline').data(pie(viewModel.dataPoints)).enter();
                // tslint:disable-next-line:no-any
                let labelGroups: any;
                labelGroups = enteringLabels.append('g')
                    .attr('class', 'ring_polyline')
                    .style('fill', 'none')
                    .style('stroke', 'grey')
                    .style('stroke-width', '1px')
                    .style('opacity', '0.4');

                // tslint:disable-next-line:no-any
                let line: any;
                line = labelGroups.append('polyline')
                    // tslint:disable-next-line:no-any
                    .attr('points', function (d: any): any {
                        // tslint:disable-next-line:no-any
                        let arccentroid: any;
                        arccentroid = arc.centroid(d);
                        // tslint:disable-next-line:no-any
                        let pos: any;
                        pos = outerArc.centroid(d);
                        // tslint:disable-next-line:no-any
                        let pos1: any;
                        pos1 = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 14) * (midAngle(d) < Math.PI ? 1 : -1);
                        let fpos: number[];
                        fpos = [(arccentroid[0] + pos1[0]) / 2, (arccentroid[1] + pos1[1]) / 2];
                        let fpos1: number[];
                        fpos1 = [(fpos[0] + outerArc.centroid(d)[0]) / 2, (fpos[1] + outerArc.centroid(d)[1]) / 2];

                        return [fpos1, outerArc.centroid(d), pos];
                    })
                    // tslint:disable-next-line:no-any
                    .attr('id', function (d: any, i: number): string {
                        return `ring_polyline_${i}`;
                    });

                // tslint:disable-next-line:no-any
                let enteringtext: any;
                enteringtext = svg.selectAll('.ring_labelName').data(pie(viewModel.dataPoints)).enter();
                // tslint:disable-next-line:no-any
                let textGroups: any;
                textGroups = enteringtext.append('g').attr('class', 'ring_labelName');
                let labelcolor: string;
                labelcolor = lablesettings.color;
                let labeltextsize: string;
                labeltextsize = PixelConverter.fromPoint(lablesettings.fontSize);

                // tslint:disable-next-line:no-any
                let label: any;
                label = textGroups
                    .append('text')
                    // tslint:disable-next-line:no-any
                    .attr('x', function (d: any): number {
                        // tslint:disable-next-line:no-any
                        let pos: any;
                        pos = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                        return pos[0];
                    })
                    // tslint:disable-next-line:no-any
                    .attr('y', function (d: any): number {
                        // tslint:disable-next-line:no-any
                        let pos: any;
                        pos = outerArc.centroid(d);

                        return pos[1];
                    })
                    .attr('dy', '.20em')
                    // tslint:disable-next-line:no-any
                    .attr('id', function (d: any, i: number): string {
                        return `ring_label_${i}`;
                    })
                    // tslint:disable-next-line:no-any
                    .text(function (d: any): string {
                        let primaryFormatter: string = ValueFormatter.DefaultNumericFormat;
                        if (THIS.dataViews
                            && THIS.dataViews.categorical
                            && THIS.dataViews.categorical.values
                            && THIS.dataViews.categorical.values[0]) {
                            primaryFormatter = THIS.dataViews.categorical.values[0].source.format ?
                                THIS.dataViews.categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat;
                        }
                        let primaryFormatterVal: number = 0;
                        if (detaillabelprop.labelDisplayUnits === 0) {
                            let alternateFormatter: number;
                            alternateFormatter = parseInt(d.data.value, 10).toString().length;
                            if (alternateFormatter > 9) {
                                primaryFormatterVal = 1e9;
                            } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                primaryFormatterVal = 1e6;
                            } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                                primaryFormatterVal = 1e3;
                            } else {
                                primaryFormatterVal = 10;
                            }
                        }

                        let formatter: IValueFormatter;
                        formatter = ValueFormatter.create({
                            format: primaryFormatter,
                            precision: detaillabelprop.labelPrecision,
                            value: detaillabelprop.labelDisplayUnits === 0 ? primaryFormatterVal : detaillabelprop.labelDisplayUnits
                        });
                        let text: string = '';
                        let summaryvalue: number;
                        summaryvalue = viewModel.primaryMeasureSum;
                        if (detaillabelprop.labelStyle === 'Data') {
                            text = formatter.format((d.data.value));
                        } else if (detaillabelprop.labelStyle === 'Category') {
                            text = d.data.category;
                        } else if (detaillabelprop.labelStyle === 'Percent of total') {
                            let val: string;
                            val = (d.data.value / summaryvalue * 100).toFixed(detaillabelprop.labelPrecision).toString();
                            text = `${val}%`;
                        } else if (detaillabelprop.labelStyle === 'Category, percent of total') {
                            let val: string;
                            val = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${d.data.category} ${val}%`;
                        } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                            let val1: string;
                            val1 = formatter.format(d.data.value);
                            let val2: string;
                            val2 = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${val1} (${val2}%)`;
                        } else if (detaillabelprop.labelStyle === 'Both') {
                            let val: string;
                            val = formatter.format(d.data.value);
                            text = `${d.data.category} ${val}`;
                        } else {
                            let cat: string;
                            cat = d.data.category;
                            let val: string;
                            val = formatter.format(d.data.value);
                            let percentVal: string;
                            percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${cat} ${val} (${percentVal}%)`;
                        }

                        let textProperties: TextProperties;
                        textProperties = {
                            fontFamily: THIS.defaultFontFamily,
                            fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize), // + 'px',
                            text: text
                        };
                        let widthOfText: number;
                        widthOfText = textMeasurementService.measureSvgTextWidth(textProperties);

                        // tslint:disable-next-line:no-any
                        let pos: any;
                        pos = outerArc.centroid(d);

                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                        // r = 1// l = -1
                        // logic to show ellipsis in Data Labels if there is no enough width
                        let position: number;
                        position = (midAngle(d) < Math.PI ? 1 : -1);
                        let textEnd: number;
                        let finalText: string;
                        if (position === 1) {
                            textEnd = pos[0] + widthOfText;
                            if (textEnd > donutWidth / 2) {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth / 2 - pos[0]);
                                if (finalText.length < 4) {
                                    return '';
                                }
                            } else {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, textEnd);
                            }
                        } else if (position === -1) {
                            textEnd = pos[0] + (-1 * widthOfText);
                            if (textEnd < (-1 * donutWidth / 2)) {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, pos[0] + donutWidth / 2);
                                if (finalText.length < 4) {
                                    return '';
                                }
                            } else {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, Math.abs(textEnd));
                            }
                        }
                        if (finalText.indexOf('...') > -1
                            && detaillabelprop.labelStyle !== 'Data'
                            && detaillabelprop.labelStyle !== 'Category'
                            && detaillabelprop.labelStyle !== 'Percent of total') {

                            let firstRowLabel: string;
                            if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                                firstRowLabel = formatter.format(d.data.value);
                            } else {
                                firstRowLabel = d.data.category;
                            }

                            textProperties.text = firstRowLabel;
                            let widthOfText1: number;
                            widthOfText1 = textMeasurementService.measureSvgTextWidth(textProperties);
                            if (position === 1) {
                                let textEnd1: number;
                                textEnd1 = pos[0] + widthOfText1;
                                if (textEnd1 > donutWidth / 2) {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth / 2 - pos[0]);
                                    if (finalText.length < 4) {
                                        return '';
                                    }
                                } else {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, textEnd1);
                                }
                            } else if (position === -1) {
                                let textEnd1: number;
                                textEnd1 = pos[0] + (-1 * widthOfText1);
                                if (textEnd1 < (-1 * donutWidth / 2)) {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, pos[0] + donutWidth / 2);
                                    if (finalText.length < 4) {
                                        return '';
                                    }
                                } else {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, Math.abs(textEnd1));
                                }
                            }
                        }

                        return finalText;
                    })
                    .style(
                    // tslint:disable-next-line:no-any
                    'text-anchor', function (d: any): string {
                        return (midAngle(d)) < Math.PI ? 'start' : 'end';
                    })
                    .style('fill', labelcolor)
                    .style('font-size', labeltextsize)
                    .style('font-family', this.defaultFontFamily)
                    .append('title')
                    // tslint:disable-next-line:no-any
                    .text(function (d: any): string {
                        let formatter: IValueFormatter;
                        formatter = ValueFormatter.create({
                            format: !!THIS.dataViews.categorical.values[0].source.format ?
                                THIS.dataViews.categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat,
                            precision: 0
                        });
                        let summaryvalue: number;
                        summaryvalue = viewModel.primaryMeasureSum;
                        let text: string;
                        if (detaillabelprop.labelStyle === 'Data') {
                            text = formatter.format((d.data.value));
                        } else if (detaillabelprop.labelStyle === 'Category') {
                            text = d.data.category;
                        } else if (detaillabelprop.labelStyle === 'Percent of total') {
                            let percentVal: string;
                            percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${percentVal}%`;
                        } else if (detaillabelprop.labelStyle === 'Category, percent of total') {
                            let cat: string;
                            cat = d.data.category;
                            let percentVal: string;
                            percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${cat} ${percentVal}%`;
                        } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                            let val: string;
                            val = formatter.format(d.data.value);
                            let percentVal: string;
                            percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${val} (${percentVal}%)`;
                        } else if (detaillabelprop.labelStyle === 'Both') {
                            let val: string;
                            val = formatter.format(d.data.value);
                            text = `${d.data.category} ${val}`;
                        } else {
                            let val: string;
                            val = formatter.format(d.data.value);
                            let percentVal: string;
                            percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${d.data.category} ${val} (${percentVal}%)`;
                        }

                        return text;
                    });

                // Logic to add second row labels
                let dataLabels: d3.Selection<SVGElement>;
                dataLabels = this.svg.selectAll('.ring_donutChart g.ring_labelName text');
                // tslint:disable-next-line:no-any
                let dataLabelsArr: any;
                dataLabelsArr = dataLabels && dataLabels[0] ? dataLabels[0] : [];
                let dataLabelArrLen: number;
                dataLabelArrLen = dataLabelsArr.length;
                for (let i: number = 0; i < dataLabelArrLen; i++) {
                    if (detaillabelprop.labelStyle !== 'Data' && detaillabelprop.labelStyle !== 'Category'
                        && detaillabelprop.labelStyle !== 'Percent of total') {
                        // tslint:disable-next-line:no-any
                        let enteringSecondRowtext: any;
                        enteringSecondRowtext = svg.selectAll('.ring_secondaryLabelName').data(pie(viewModel.dataPoints)).enter();
                        // tslint:disable-next-line:no-any
                        let secondarytextGroups: any;
                        secondarytextGroups = enteringSecondRowtext.append('g').attr('class', 'ring_secondaryLabelName');
                        let labelcolor2: string;
                        labelcolor2 = lablesettings.color;
                        let labeltextsize2: string;
                        labeltextsize2 = PixelConverter.fromPoint(lablesettings.fontSize);

                        // tslint:disable-next-line:no-any
                        let secondRowLabel: any;
                        secondRowLabel = secondarytextGroups
                            .append('text')
                            // tslint:disable-next-line:no-any
                            .attr('x', function (d: any): number {
                                // tslint:disable-next-line:no-any
                                let pos: any;
                                pos = outerArc.centroid(d);
                                pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                                return pos[0];
                            })
                            // tslint:disable-next-line:no-any
                            .attr('y', function (d: any): number {
                                // tslint:disable-next-line:no-any
                                let pos: any;
                                pos = outerArc.centroid(d);
                                let text: string;
                                text = d && d.data && d.data.category ? d.data.category : 'sample';
                                let textProperties: TextProperties;
                                textProperties = {
                                    fontFamily: THIS.defaultFontFamily,
                                    fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize),
                                    text: text
                                };
                                let heightOfText: number;
                                heightOfText = textMeasurementService.measureSvgTextHeight(textProperties);

                                return pos[1] + heightOfText / 2 + 5;
                            })
                            .attr('dy', '.20em')
                            // tslint:disable-next-line:no-any
                            .attr('id', function (d: any, j: number): string {
                                return `ring_secondRowLabel_${j}`;
                            })
                            // tslint:disable-next-line:no-any
                            .text(function (d: any): string {
                                let primaryFormatter: string = ValueFormatter.DefaultNumericFormat;
                                if (THIS.dataViews
                                    && THIS.dataViews.categorical
                                    && THIS.dataViews.categorical.values
                                    && THIS.dataViews.categorical.values[0]) {
                                    primaryFormatter = THIS.dataViews.categorical.values[0].source.format ?
                                        THIS.dataViews.categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat;
                                }
                                let primaryFormatterVal: number = 0;
                                if (detaillabelprop.labelDisplayUnits === 0) {
                                    let alternateFormatter: number;
                                    alternateFormatter = parseInt(d.data.value, 10).toString().length;
                                    if (alternateFormatter > 9) {
                                        primaryFormatterVal = 1e9;
                                    } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                        primaryFormatterVal = 1e6;
                                    } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                                        primaryFormatterVal = 1e3;
                                    } else {
                                        primaryFormatterVal = 10;
                                    }
                                }

                                let formatter: IValueFormatter;
                                formatter = ValueFormatter.create({
                                    format: primaryFormatter,
                                    precision: detaillabelprop.labelPrecision,
                                    value: detaillabelprop.labelDisplayUnits === 0 ?
                                        primaryFormatterVal : detaillabelprop.labelDisplayUnits
                                });
                                let text: string = '';
                                let summaryvalue: number;
                                summaryvalue = viewModel.primaryMeasureSum;
                                if (detaillabelprop.labelStyle === 'Category, percent of total') {
                                    let percentVal: string;
                                    percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${percentVal}%`;
                                } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                                    let percentVal: string;
                                    percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `(${percentVal}%)`;
                                } else if (detaillabelprop.labelStyle === 'Both') {
                                    text = `${formatter.format(d.data.value)}`;
                                } else {
                                    let percentVal: string;
                                    percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${formatter.format(d.data.value)} (${percentVal}%)`;
                                }

                                let textProperties: TextProperties;
                                textProperties = {
                                    fontFamily: THIS.defaultFontFamily,
                                    fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize),
                                    text: text
                                };
                                let widthOfText: number;
                                widthOfText = textMeasurementService.measureSvgTextWidth(textProperties);

                                // tslint:disable-next-line:no-any
                                let pos: any;
                                pos = outerArc.centroid(d);

                                pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                                // r = 1// l = -1
                                // logic to show ellipsis in Data Labels if there is no enough width
                                let position: number;
                                position = (midAngle(d) < Math.PI ? 1 : -1);
                                let textEnd: number;
                                let finalText: string;
                                if (position === 1) {
                                    textEnd = pos[0] + widthOfText;
                                    if (textEnd > donutWidth / 2) {
                                        finalText = textMeasurementService
                                            .getTailoredTextOrDefault(textProperties, donutWidth / 2 - pos[0]);
                                        if (finalText.length < 4) {
                                            return '';
                                        }
                                    } else {
                                        finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, textEnd);
                                    }
                                } else if (position === -1) {
                                    textEnd = pos[0] + (-1 * widthOfText);
                                    if (textEnd < (-1 * donutWidth / 2)) {
                                        finalText = textMeasurementService.
                                            getTailoredTextOrDefault(textProperties, pos[0] + donutWidth / 2);
                                        if (finalText.length < 4) {
                                            return '';
                                        }
                                    } else {
                                        finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, Math.abs(textEnd));
                                    }
                                }

                                return finalText;
                            })
                            .style(
                            // tslint:disable-next-line:no-any
                            'text-anchor', function (d: any): string {
                                return (midAngle(d)) < Math.PI ? 'start' : 'end';
                            })
                            .style('fill', labelcolor2)
                            .style('font-size', labeltextsize2)
                            .style('font-family', this.defaultFontFamily)
                            .append('title')
                            // tslint:disable-next-line:no-any
                            .text(function (d: any): string {
                                let formatter: IValueFormatter;
                                formatter = ValueFormatter.create({
                                    format: !!THIS.dataViews.categorical.values[0].source.format ?
                                        THIS.dataViews.categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat,
                                    precision: 0
                                });
                                let summaryvalue: number;
                                summaryvalue = viewModel.primaryMeasureSum;
                                let text: string;

                                if (detaillabelprop.labelStyle === 'Category, percent of total') {
                                    let catName: string;
                                    catName = d.data.category;
                                    let val: string;
                                    val = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${catName} ${val}%`;
                                } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                                    let percentVal: string;
                                    percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${formatter.format(d.data.value)} (${percentVal}%)`;
                                } else if (detaillabelprop.labelStyle === 'Both') {
                                    text = `${d.data.category} ${formatter.format(d.data.value)}`;
                                } else {
                                    let percentVal: string;
                                    percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${d.data.category} ${formatter.format(d.data.value)} (${percentVal}%)`;
                                }

                                return text;
                            });

                        let upperLabelText: string;

                        upperLabelText = dataLabelsArr[i]
                            && dataLabelsArr[i].childNodes
                            && dataLabelsArr[i].childNodes[0]
                            && dataLabelsArr[i].childNodes[0].textContent ?
                            dataLabelsArr[i].childNodes[0].textContent : 'no data';
                        let expString: string = '';
                        if (detaillabelprop.labelStyle === 'Category, percent of total'
                            || detaillabelprop.labelStyle === 'Both') {
                            expString = '(.*)\\s(.+)';
                        } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                            expString = '(.*)\\s\\((.+)\\)';
                        } else {
                            expString = '(.*)\\s(.+)\\s\\((.+)\\)';
                        }
                        let pattern: RegExp;
                        pattern = new RegExp(expString, 'gi');
                        // checking the pattern of the data label inorder to display or not
                        if (!(upperLabelText && upperLabelText.indexOf('...') > -1) && pattern.test(upperLabelText)) {
                            document.getElementById(`ring_secondRowLabel_${i}`).style.display = 'none';
                        }
                    }
                }
            }

            if (lablesettings.show) {
                let labelsLength: number;
                labelsLength = viewModel.dataPoints.length;
                for (let i: number = 0; i < labelsLength; i++) {
                    let obj1: ClientRect;
                    obj1 = document.getElementById(`ring_label_${i}`).getBoundingClientRect();
                    for (let j: number = i + 1; j <= labelsLength - 1; j++) {
                        let obj2: ClientRect;
                        obj2 = document.getElementById(`ring_label_${j}`).getBoundingClientRect();
                        let obj3: ClientRect;
                        let condExpr: boolean = !(obj2.left > obj1.right ||
                            obj2.right < obj1.left ||
                            obj2.top > obj1.bottom ||
                            obj2.bottom < obj1.top);
                        if (detaillabelprop.labelStyle !== 'Data'
                            && detaillabelprop.labelStyle !== 'Category'
                            && detaillabelprop.labelStyle !== 'Percent of total') {
                            obj3 = document.getElementById(`ring_secondRowLabel_${i}`).getBoundingClientRect();
                            condExpr = !(obj2.left > obj1.right ||
                                obj2.right < obj1.left ||
                                obj2.top > obj1.bottom ||
                                obj2.bottom < obj1.top)
                                ||
                                (!(obj2.left > obj3.right ||
                                    obj2.right < obj3.left ||
                                    obj2.top > obj3.bottom ||
                                    obj2.bottom < obj3.top)
                                    && !!document.getElementById(`ring_secondRowLabel_${i}`)
                                    && document.getElementById(`ring_secondRowLabel_${i}`).style.display !== 'none');
                        }
                        if (condExpr) {
                            document.getElementById(`ring_label_${j}`).style.display = 'none';
                            document.getElementById(`ring_polyline_${j}`).style.display = 'none';
                            if (document.getElementById(`ring_secondRowLabel_${j}`)) {
                                document.getElementById(`ring_secondRowLabel_${j}`).style.display = 'none';
                            }
                        }
                    }
                    let legendPos: string;
                    legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                    if (d3.select(`#ring_label_${i}`)[0][0].childNodes.length <= 1) {
                        document.getElementById(`ring_label_${i}`).style.display = 'none';
                        document.getElementById(`ring_polyline_${i}`).style.display = 'none';
                        if (document.getElementById(`ring_secondRowLabel_${i}`)) {
                            document.getElementById(`ring_secondRowLabel_${i}`).style.display = 'none';
                        }
                    }

                    // code to handle data labels cutting issue in top and bottom positions
                    let labelYPos: number = 0;
                    let secondLabelYPos: number = 0;
                    labelYPos = parseFloat($(`#ring_label_${i}`).attr('y'));
                    if (labelYPos && labelYPos < 0) {
                        labelYPos = labelYPos * 0.9;
                        labelYPos = labelYPos - obj1.height + 3; // 0.2em is the dy value. On conversion to px it will be 3px
                        labelYPos = Math.abs(labelYPos);
                    } else {
                        labelYPos = (labelYPos * 0.9) + 3; // 0.2em is the dy value. On conversion to px it will be 3px
                    }
                    secondLabelYPos = Math.abs(parseFloat($(`#ring_secondRowLabel_${i}`).attr('y'))) ?
                        Math.abs(parseFloat($(`#ring_secondRowLabel_${i}`).attr('y'))) + 3 : 0;
                    // 0.2em is the dy value. On conversion to px it will be 3px
                    let visualHeight: number;
                    visualHeight = donutHeight / 2 * 0.9; // 0.9 is the random value for adjusting labels cropping issue
                    if (labelYPos > parseFloat(visualHeight.toString())
                        || (secondLabelYPos > parseFloat(visualHeight.toString()))
                        && document.getElementById(`ring_secondRowLabel_${i}`)
                        && document.getElementById(`ring_secondRowLabel_${i}`).style.display !== 'none') {
                        document.getElementById(`ring_label_${i}`).style.display = 'none';
                        document.getElementById(`ring_polyline_${i}`).style.display = 'none';
                        if (document.getElementById(`ring_secondRowLabel_${i}`)) {
                            document.getElementById(`ring_secondRowLabel_${i}`).style.display = 'none';
                        }
                    }
                }
            }

            this.drawSummaryDiv(radius, options, viewModel, legendHeight, legendWidth, summaryLabelSettings, this.dataViews);
            let arcs: d3.selection.Update<IDonutChartDataPoint>;
            arcs = this.svg.selectAll('.ring_arc').data(viewModel.dataPoints);

            this.tooltipServiceWrapper
                .addTooltip(
                this.svg.selectAll('.ring_arc'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null
                );

            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;

            // This must be an anonymous function instead of a lambda because
            // d3 uses 'this' as the reference to the element that was clicked.
            arcs.on('click', function (d: IDonutChartDataPoint): void {
                // tslint:disable-next-line:no-any
                selectionManager.select(d.selectionId).then((ids: any[]) => {
                    // tslint:disable-next-line:no-any
                    function CompareIds(legendData: any): number {
                        if (ids.length) {
                            if (legendData.identity.key === ids[0].key) {
                                return 1;
                            } else {
                                return 0.5;
                            }
                        } else {
                            return 1;
                        }
                    }
                    // tslint:disable-next-line:no-any
                    let legend: any;
                    legend = THIS.rootElement.selectAll('.ring_legend .legendItem');
                    // tslint:disable-next-line:no-any
                    legend.attr('fill-opacity', (d1: any) => {
                        return CompareIds(d1);
                    });

                    arcs.attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });
                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                });

                (<Event>d3.event).stopPropagation();
            });
            this.addLegendSelection();
            // tslint:disable-next-line:no-any
            $('.ring_legend #legendGroup').on('click.load', '.navArrow', function (): any {
                THIS.addLegendSelection();
            });
            this.rootElement.on('click', () => this.selectionManager.clear().then(
                () => this.rootElement.selectAll('.ring_legend .legendItem').attr('fill-opacity', 1),
                this.rootElement.selectAll('.ring_arc').attr('fill-opacity', 1)
            ));

            // Animation of ring chart arcs
            let animationSettings: IAnimation;
            animationSettings = this.getAnimation(this.dataViews);
            if (animationSettings.show) {
                let donutArcPath: d3.Selection<SVGElement>;
                donutArcPath = this.svg.selectAll('.ring_arc path');
                donutArcPath.on('mouseover', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(radius * innerMultiplier * 1.08)
                            .outerRadius(radius * outerMultiplier * 1.08));
                });
                donutArcPath.on('mouseout', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(radius * innerMultiplier)
                            .outerRadius(radius * outerMultiplier));
                });
            }
        }

        public drawSummaryDiv(
            radius: number, options: VisualUpdateOptions,
            viewModel: IDonutChartViewModel, legendHeight: number,
            legendWidth: number, summaryLabelSettings: ISummaryLabels,
            dataViews: DataView): void {
            if (summaryLabelSettings.show) {
                if (viewModel.primaryMeasureSum) {
                    let pmIndicator: IPrimaryIndicator;
                    pmIndicator = this.getPrimaryIndicator(dataViews);
                    let smIndicator: ISecondaryIndicator;
                    smIndicator = this.getSecondaryIndicator(dataViews);
                    let donutTitleSettings: IDonutTitle;
                    donutTitleSettings = this.getDonutTitle(this.dataViews);
                    let secondarySummarySettings: ISecondarySummaryLabels;
                    secondarySummarySettings = this.getSecondarySummaryLabels(this.dataViews);
                    this.rootElement.select('.ring_SummarizedDiv').style({ display: 'block' });
                    let sliceWidthRatio: number;
                    sliceWidthRatio = 0.50;
                    let innerRadius: number;
                    innerRadius = radius * sliceWidthRatio;
                    let halfViewPortWidth: number;
                    halfViewPortWidth = options.viewport.width / 2;
                    let halfViewPortHeight: number;
                    halfViewPortHeight = options.viewport.height / 2;
                    let x: number;
                    let y: number;
                    let primaryFormatterVal: number = 0;
                    if (summaryLabelSettings.labelDisplayUnits === 0) {
                        let alternateFormatter: number;
                        alternateFormatter = parseInt(viewModel.primaryMeasureSum.toString(), 10).toString().length;
                        if (alternateFormatter > 9) {
                            primaryFormatterVal = 1e9;
                        } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                            primaryFormatterVal = 1e6;
                        } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                            primaryFormatterVal = 1e3;
                        } else {
                            primaryFormatterVal = 10;
                        }
                    }

                    let primaryFormatter: IValueFormatter;
                    primaryFormatter = ValueFormatter.create({
                        format: options.dataViews[0].categorical.values[0].source.format ?
                            options.dataViews[0].categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat,
                        precision: summaryLabelSettings.labelPrecision,
                        value: summaryLabelSettings.labelDisplayUnits === 0 ?
                            primaryFormatterVal : summaryLabelSettings.labelDisplayUnits
                    });
                    let primaryTooltipFormatter: IValueFormatter;
                    primaryTooltipFormatter = ValueFormatter.create({
                        format: options.dataViews[0].categorical.values[0].source.format ?
                            options.dataViews[0].categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat
                    });
                    let donutTitleHeight: number = 0;
                    if (donutTitleSettings.show) {
                        donutTitleHeight = parseFloat($('.ring_donutTitle').css('height'));
                    }
                    let position: string;
                    position = 'position';
                    if (!this.legendObjectProperties) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) +
                            parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties.hasOwnProperty('show')
                        && (this.legendObjectProperties[position] === 'Top'
                            || this.legendObjectProperties[position] === 'TopCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2)
                            + parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties.hasOwnProperty('show')
                        && (this.legendObjectProperties[position] === 'Bottom'
                            || this.legendObjectProperties[position] === 'BottomCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2)
                            - parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties.hasOwnProperty('show')
                        && (this.legendObjectProperties[position] === 'Left'
                            || this.legendObjectProperties[position] === 'LeftCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2) + parseInt(legendWidth.toString(), 10) / 2;
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties.hasOwnProperty('show')
                        && (this.legendObjectProperties[position] === 'Right'
                            || this.legendObjectProperties[position] === 'RightCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2) - parseInt(legendWidth.toString(), 10) / 2;
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    }

                    let widthBox: number;
                    widthBox = (innerRadius * Math.SQRT2);
                    let heightBox: number;
                    heightBox = (innerRadius * Math.SQRT2);
                    if (this.currentViewport.width > 150 && this.currentViewport.height > 100) {
                        let boxHeight: string;
                        boxHeight = `${heightBox}px`;
                        this.rootElement.select('.ring_SummarizedDiv')
                            .append('div').style({
                                color: summaryLabelSettings.color,
                                'font-family': this.defaultFontFamily,
                                'font-size': PixelConverter.fromPoint(summaryLabelSettings.fontSize),
                                height: `${heightBox}px`,
                                left: `${x}px`,
                                overflow: 'hidden',
                                position: 'absolute',
                                top: `${y}px`,
                                width: `${widthBox}px`
                            }).classed('ring_SummarizedDivContainer', true);
                        this.rootElement.select('.ring_SummarizedDivContainer')
                            .append('div')
                            .classed('ring_pContainer', true)
                            .style({
                                position: 'absolute',
                                top: '50%',
                                transform: 'translate(0, -50%)',
                                width: '100%'
                            });
                        this.rootElement.select('.ring_pContainer')
                            .append('p')
                            .classed('ring_TotalText', true)
                            .text(summaryLabelSettings.text)
                            .style({
                                overflow: 'hidden',
                                'text-overflow': 'ellipsis',
                                'text-align': 'center',
                                'vertical-align': 'middle',
                                margin: '0', 'white-space': 'nowrap'
                            })
                            .attr('title', summaryLabelSettings.text);
                        this.rootElement.select('.ring_pContainer')
                            .append('p')
                            .classed('ring_TotalValue', true)
                            .style({
                                overflow: 'hidden',
                                'text-overflow': 'ellipsis',
                                'text-align': 'center',
                                'vertical-align': 'middle',
                                margin: '0', 'white-space': 'nowrap'
                            });
                        if (pmIndicator.show) {
                            let thresholdValue: number = 0;
                            if (viewModel.primaryKPISum) {
                                thresholdValue = viewModel.primaryKPISum;
                                if (dataViews && dataViews.categorical && dataViews.categorical.values
                                    && dataViews.categorical.values[0] && dataViews.categorical.values[0].source
                                    && dataViews.categorical.values[0].source.format
                                    && dataViews.categorical.values[0].source.format.toString().indexOf('%') > -1) {
                                    this.primaryMeasurePercent = true;
                                    thresholdValue = thresholdValue / 100;
                                }
                            } else {
                                if (!pmIndicator.signIndicator) {
                                    thresholdValue = pmIndicator.totalThreshold;
                                    if (dataViews && dataViews.categorical && dataViews.categorical.values
                                        && dataViews.categorical.values[0] && dataViews.categorical.values[0].source
                                        && dataViews.categorical.values[0].source.format
                                        && dataViews.categorical.values[0].source.format.toString().indexOf('%') > -1) {
                                        this.primaryMeasurePercent = true;
                                        thresholdValue = thresholdValue / 100;
                                    }
                                }
                            }
                            let upColor: string;
                            let downColor: string;
                            upColor = pmIndicator.upArrow;
                            downColor = pmIndicator.downArrow;
                            let indicator: string;
                            let selectedColor: string;
                            if (thresholdValue <= viewModel.primaryMeasureSum) {
                                indicator = '\u25B2'; // unicode for up arrow
                                selectedColor = upColor;
                            } else {
                                indicator = '\u25BC'; // unicode for down arrow
                                selectedColor = downColor;
                            }
                            // tslint:disable-next-line:no-any
                            let element: any;
                            element = this.rootElement.select('.ring_TotalValue');
                            element.append('div')
                                .classed('ring_primaryMeasureSum', true)
                                .text(primaryFormatter.format(viewModel.primaryMeasureSum))
                                .attr('title', primaryTooltipFormatter.format(viewModel.primaryMeasureSum));

                            element.append('span')
                                .classed('ring_primaryMeasureIndicator', true)
                                .text(indicator)
                                .style('color', selectedColor);
                        } else {
                            this.rootElement.select('.ring_TotalValue')
                                .append('div')
                                .classed('ring_primaryMeasureSum', true)
                                .text(primaryFormatter.format(viewModel.primaryMeasureSum))
                                .attr('title', primaryTooltipFormatter.format(viewModel.primaryMeasureSum));
                        }
                    }
                    let secondaryFormatter: IValueFormatter;
                    if (viewModel && viewModel.secondaryMeasureSum) {
                        let secondaryFormatterVal: number = 0;
                        if (secondarySummarySettings.labelDisplayUnits === 0) {
                            let alternateFormatter: number;
                            alternateFormatter = parseInt(viewModel.secondaryMeasureSum.toString(), 10).toString().length;
                            if (alternateFormatter > 9) {
                                secondaryFormatterVal = 1e9;
                            } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                secondaryFormatterVal = 1e6;
                            } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                                secondaryFormatterVal = 1e3;
                            } else {
                                secondaryFormatterVal = 10;
                            }
                        }

                        secondaryFormatter = ValueFormatter.create({
                            format: options.dataViews[0].categorical.values[1].source.format ?
                                options.dataViews[0].categorical.values[1].source.format : ValueFormatter.DefaultNumericFormat,
                            precision: secondarySummarySettings.labelPrecision,
                            value: secondarySummarySettings.labelDisplayUnits === 0 ?
                                secondaryFormatterVal : secondarySummarySettings.labelDisplayUnits
                        });
                        let secondaryTooltipFormatter: IValueFormatter;
                        secondaryTooltipFormatter = ValueFormatter.create({
                            format: options.dataViews[0].categorical.values[1].source.format ?
                                options.dataViews[0].categorical.values[1].source.format : ValueFormatter.DefaultNumericFormat
                        });

                        let isSecondaryPercentage: boolean = false;
                        if (dataViews && dataViews.categorical && dataViews.categorical.values
                            && dataViews.categorical.values[1]
                            && dataViews.categorical.values[1].source
                            && dataViews.categorical.values[1].source.format
                            && dataViews.categorical.values[1].source.format.toString().indexOf('%') > -1) {
                            isSecondaryPercentage = true;
                        }
                        let secondaryFontSize: number;
                        secondaryFontSize = secondarySummarySettings.fontSize;
                        let secondaryColor: string;
                        secondaryColor = secondarySummarySettings.color;

                        this.rootElement.select('.ring_pContainer')
                            .append('p')
                            .classed('ring_SecondaryText', true)
                            .text(options.dataViews[0].categorical.values[1].source.displayName)
                            .style({
                                color: secondaryColor,
                                'font-size': PixelConverter.fromPoint(secondaryFontSize),
                                margin: '0',
                                overflow: 'hidden',
                                'text-align': 'center',
                                'text-overflow': 'ellipsis',
                                'vertical-align': 'middle',
                                'white-space': 'nowrap'
                            })
                            .attr('title', options.dataViews[0].categorical.values[1].source.displayName);
                        this.rootElement.select('.ring_pContainer')
                            .append('p')
                            .classed('ring_SecondaryValue', true)
                            .style({
                                color: secondaryColor,
                                'font-size': PixelConverter.fromPoint(secondaryFontSize),
                                margin: '0',
                                overflow: 'hidden',
                                'text-align': 'center',
                                'text-overflow': 'ellipsis',
                                'vertical-align': 'middle',
                                'white-space': 'nowrap'
                            });
                        if (smIndicator.show) {
                            let smThreshold: number = 0;
                            if (viewModel.secondaryKPISum) {
                                smThreshold = viewModel.secondaryKPISum;
                            } else {
                                if (!smIndicator.signIndicator) {
                                    smThreshold = smIndicator.totalThreshold;
                                    if (isSecondaryPercentage) {
                                        smThreshold = smThreshold / 100;
                                    }
                                }
                            }

                            let upColor: string;
                            let downColor: string;
                            upColor = smIndicator.upArrow;
                            downColor = smIndicator.downArrow;
                            let indicator: string;
                            let selectedColor: string;
                            if (smThreshold <= viewModel.secondaryMeasureSum) {
                                indicator = '\u25B2'; // unicode for up arrow
                                selectedColor = upColor;
                            } else {
                                indicator = '\u25BC'; // unicode for down arrow
                                selectedColor = downColor;
                            }
                            // tslint:disable-next-line:no-any
                            let element: any;
                            element = this.rootElement.select('.ring_SecondaryValue');

                            element.append('div')
                                .classed('ring_secondaryMeasureSum', true)
                                .text(secondaryFormatter.format(viewModel.secondaryMeasureSum))
                                .attr('title', secondaryTooltipFormatter.format(viewModel.secondaryMeasureSum));

                            element.append('span')
                                .classed('ring_secondaryMeasureIndicator', true)
                                .text(indicator)
                                .style('color', selectedColor);
                        } else {
                            this.rootElement.select('.ring_SecondaryValue')
                                .append('div')
                                .classed('ring_secondaryMeasureSum', true)
                                .text(secondaryFormatter.format(viewModel.secondaryMeasureSum))
                                .attr('title', secondaryTooltipFormatter.format(viewModel.secondaryMeasureSum));
                        }
                    }
                    let pContainerDivWidth: number;
                    pContainerDivWidth = parseFloat(this.rootElement.select('.ring_pContainer').style('width'));

                    let formattedPrimaryMeasureSumTextProperties: TextProperties;
                    formattedPrimaryMeasureSumTextProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(summaryLabelSettings.fontSize),
                        text: primaryFormatter.format(viewModel.primaryMeasureSum)
                    };
                    let formattedPrimaryMeasureSumTextPropertiesWidth: number;
                    formattedPrimaryMeasureSumTextPropertiesWidth = textMeasurementService
                        .measureSvgTextWidth(formattedPrimaryMeasureSumTextProperties);

                    let formattedSecondaryMeasureSumTextPropertiesWidth: number;
                    if (secondaryFormatter) {
                        let formattedSecondaryMeasureSumTextProperties: TextProperties;
                        formattedSecondaryMeasureSumTextProperties = {
                            fontFamily: 'Segoe UI',
                            fontSize: PixelConverter.fromPoint(secondarySummarySettings.fontSize),
                            text: secondaryFormatter.format(viewModel.secondaryMeasureSum)
                        };
                        formattedSecondaryMeasureSumTextPropertiesWidth = textMeasurementService
                            .measureSvgTextWidth(formattedSecondaryMeasureSumTextProperties);
                    }
                    let measureArrowProperties: TextProperties;
                    measureArrowProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(summaryLabelSettings.fontSize),
                        text: 'ABC'
                    };
                    let measureArrowWidth: number;
                    measureArrowWidth = textMeasurementService.measureSvgTextWidth(measureArrowProperties);
                    let availableWidth: number = pContainerDivWidth - measureArrowWidth;
                    if (this.rootElement.select('.ring_primaryMeasureIndicator')[0][0] !== null) {
                        if (formattedPrimaryMeasureSumTextPropertiesWidth
                            + parseFloat(this.rootElement.select('.ring_primaryMeasureIndicator').style('width')) * 2
                            > pContainerDivWidth) {
                            let display: string = 'visible';
                            if (availableWidth < 2) {
                                availableWidth = availableWidth === 0 ? 0 : availableWidth;
                                display = 'hidden';
                            }
                            $('.ring_primaryMeasureSum').css('width', `${availableWidth}px`);
                            this.rootElement.select('.ring_primaryMeasureIndicator').style('visibility', display);
                        }
                    }

                    let sMArrowProperties: TextProperties;
                    sMArrowProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(secondarySummarySettings.fontSize),
                        text: 'ABC'
                    };
                    let measureArrowWidth2: number;
                    measureArrowWidth2 = textMeasurementService.measureSvgTextWidth(sMArrowProperties);
                    let availableWidth2: number = pContainerDivWidth - measureArrowWidth2;
                    if (this.rootElement.select('.ring_secondaryMeasureIndicator')[0][0] !== null) {
                        if (formattedSecondaryMeasureSumTextPropertiesWidth
                            + parseFloat(this.rootElement.select('.ring_secondaryMeasureIndicator').style('width')) * 2
                            > pContainerDivWidth) {
                            let display: string = 'visible';
                            if (availableWidth2 < 2) {
                                availableWidth2 = availableWidth2 === 0 ? 0 : availableWidth2;
                                display = 'hidden';
                            }
                            $('.ring_secondaryMeasureSum').css('width', `${availableWidth2}px`);
                            this.rootElement.select('.ring_secondaryMeasureIndicator').style('visibility', display);
                        }
                    }

                    let pContainerDivHeight: number;
                    pContainerDivHeight = parseFloat(this.rootElement.select('.ring_pContainer').style('height'));
                    let summarizedDivHeight: number;
                    summarizedDivHeight = parseFloat(this.rootElement.select('.ring_SummarizedDivContainer').style('height'));
                    if (summarizedDivHeight < pContainerDivHeight) {
                        this.rootElement.select('.ring_TotalText').style({ display: 'none' });
                        if (summarizedDivHeight < pContainerDivHeight / 1.2) {
                            this.rootElement.select('.ring_SecondaryText').style({ display: 'none' });
                            if (summarizedDivHeight < pContainerDivHeight / 2) {
                                this.rootElement.select('.ring_SecondaryValue').style({ display: 'none' });
                            } else {
                                this.rootElement.select('.ring_SecondaryValue').style({ display: 'block' });
                            }
                        } else {
                            this.rootElement.select('.ring_SecondaryText').style({ display: 'block' });
                        }
                    } else {
                        this.rootElement.select('.ring_TotalText').style({ display: 'block' });
                    }
                }
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];
            let legendConfigs: ILegendConfig;
            legendConfigs = this.getLegendSettings(this.dataViews);
            let detaillabelprop: IDetailLables;
            detaillabelprop = this.getDetailLable(this.dataViews);
            let summaryLabels: ISummaryLabels;
            summaryLabels = this.getSummaryLabels(this.dataViews);
            let secondarySummaryLabels: ISecondarySummaryLabels;
            secondarySummaryLabels = this.getSecondarySummaryLabels(this.dataViews);
            let pmIndicator: IPrimaryIndicator;
            pmIndicator = this.getPrimaryIndicator(this.dataViews);
            let smIndicator: ISecondaryIndicator;
            smIndicator = this.getSecondaryIndicator(this.dataViews);
            let donutTitle: IDonutTitle;
            donutTitle = this.getDonutTitle(this.dataViews);
            let animationProps: IAnimation;
            animationProps = this.getAnimation(this.dataViews);
            let noDataProps: INodataText;
            noDataProps = this.getNoDataText(this.dataViews);

            switch (objectName) {
                case 'legend':
                    objectEnumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: legendConfigs.show,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true
                                ),
                            titleText: legendConfigs.legendName,
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null
                                ),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject
                                .getValue(
                                this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8
                                ),
                            detailedLegend: legendConfigs.primaryMeasure,
                            labelDisplayUnits: legendConfigs.displayUnits,
                            labelPrecision: legendConfigs.decimalPlaces
                        }
                    });
                    break;
                case 'dataPoint':
                    for (const donutDataPoint of this.donutDataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: donutDataPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: donutDataPoint.color
                                    }
                                }
                            },
                            selector: donutDataPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case 'labels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: detaillabelprop.show,
                            color: detaillabelprop.color,
                            labelDisplayUnits: detaillabelprop.labelDisplayUnits,
                            labelPrecision: detaillabelprop.labelPrecision,
                            fontSize: detaillabelprop.fontSize,
                            labelStyle: detaillabelprop.labelStyle
                        },
                        selector: null
                    });
                    break;
                case 'summaryLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: summaryLabels.show,
                            color: summaryLabels.color,
                            labelDisplayUnits: summaryLabels.labelDisplayUnits,
                            labelPrecision: summaryLabels.labelPrecision,
                            fontSize: summaryLabels.fontSize,
                            primaryMeasureSummaryText: summaryLabels.text
                        },
                        selector: null
                    });
                    break;
                case 'secondarySummaryLabels':
                    if (this.isSMExists) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                color: secondarySummaryLabels.color,
                                labelDisplayUnits: secondarySummaryLabels.labelDisplayUnits,
                                labelPrecision: secondarySummaryLabels.labelPrecision,
                                fontSize: secondarySummaryLabels.fontSize
                            },
                            selector: null
                        });
                    }
                    break;
                case 'GMODonutTitle':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: donutTitle.show,
                            titleText: donutTitle.titleText,
                            fill1: donutTitle.fill1,
                            fontSize: donutTitle.fontSize,
                            backgroundColor: donutTitle.backgroundColor,
                            tooltipText: donutTitle.tooltipText
                        },
                        selector: null
                    });
                    break;
                case 'Indicators':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: pmIndicator.show,
                            PrimaryMeasure: pmIndicator.signIndicator,
                            Threshold: pmIndicator.threshold,
                            Total_Threshold: pmIndicator.totalThreshold,
                            upArrow: pmIndicator.upArrow,
                            downArrow: pmIndicator.downArrow
                        },
                        selector: null
                    });
                    break;

                case 'SMIndicator':
                    if (this.isSMExists) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                show: smIndicator.show,
                                SecondaryMeasure: smIndicator.signIndicator,
                                SMThreshold: smIndicator.threshold,
                                SMTotalThreshold: smIndicator.totalThreshold,
                                upArrow: smIndicator.upArrow,
                                downArrow: smIndicator.downArrow
                            },
                            selector: null
                        });
                    }
                    break;

                case 'animation':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: animationProps.show
                        },
                        selector: null
                    });
                    break;

                case 'nodatatext':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            textMessage: noDataProps.textMessage
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

        private addLegendSelection(): void {
            let currentThis: this;
            currentThis = this;
            // tslint:disable-next-line:no-any
            let legends: any;
            legends = this.rootElement.selectAll('.ring_legend .legendItem');
            let selectionManager: ISelectionManager;
            selectionManager = this.selectionManager;
            // tslint:disable-next-line:no-any
            legends.on('click', function (d: any): void {
                // tslint:disable-next-line:no-any
                selectionManager.select(d.identity).then((ids: any[]) => {
                    // tslint:disable-next-line:no-any
                    function CompareIds(arcData: any): number {
                        if (ids.length) {
                            if (arcData.selectionId.key === ids[0].key) {
                                return 1;
                            } else {
                                return 0.5;
                            }
                        } else {
                            return 1;
                        }
                    }
                    // tslint:disable-next-line:no-any
                    let arcs: any;
                    arcs = currentThis.rootElement.selectAll('.ring_arc');
                    // tslint:disable-next-line:no-any
                    arcs.attr('fill-opacity', (d1: any) => {
                        return CompareIds(d1);
                    });
                    legends.attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });

                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private renderLegend(viewModel: IDonutChartViewModel, dataViews: DataView): void {
            let legendSettings: ILegendConfig;
            legendSettings = this.getLegendSettings(dataViews);
            let pmIndicatorSettings: IPrimaryIndicator;
            pmIndicatorSettings = this.getPrimaryIndicator(dataViews);
            let smIndicatorSettings: ISecondaryIndicator;
            smIndicatorSettings = this.getSecondaryIndicator(dataViews);
            let primaryFormat: string = ValueFormatter.DefaultNumericFormat;
            let secondaryFormat: string = ValueFormatter.DefaultNumericFormat;
            let primaryFormatter: IValueFormatter;
            let secondaryFormatter: IValueFormatter;
            let primaryTooltipFormatter: IValueFormatter;
            let primaryPercentFormatter: IValueFormatter;
            let secondaryTooltipFormatter: IValueFormatter;
            if (!viewModel
                || !viewModel.legendData) {
                return;
            }
            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects
                    .getObject(this.dataView.metadata.objects, 'legend', {});
            }

            let legendData: LegendData;
            legendData = viewModel.legendData;
            let legendDataTorender: LegendData;
            legendDataTorender = {
                dataPoints: [],
                fontSize: 8,
                title: legendData.title
            };

            legendDataTorender.primaryUpArrowColor = pmIndicatorSettings.upArrow;
            legendDataTorender.primaryDownArrowColor = pmIndicatorSettings.downArrow;

            legendDataTorender.secondaryUpArrowColor = smIndicatorSettings.upArrow;
            legendDataTorender.secondaryDownArrowColor = smIndicatorSettings.downArrow;

            if (legendData.primaryTitle) {
                legendDataTorender.primaryTitle = legendData.primaryTitle;
                primaryFormat = dataViews.categorical.values[0].source.format ?
                    dataViews.categorical.values[0].source.format : ValueFormatter.DefaultNumericFormat;
                legendDataTorender.primaryType = legendSettings.primaryMeasure;
            }
            if (legendData.secondaryTitle) {
                legendDataTorender.secondaryTitle = legendData.secondaryTitle;
                secondaryFormat = dataViews.categorical.values[1].source.format ?
                    dataViews.categorical.values[1].source.format : ValueFormatter.DefaultNumericFormat;

                secondaryTooltipFormatter = ValueFormatter.create({
                    format: secondaryFormat,
                    precision: legendSettings.decimalPlaces
                });
            }

            for (let j: number = 0; j < legendData.dataPoints.length; j++) {
                let primaryData: string;
                let measureTooltip: string;
                let percentData: number;
                let secondaryMeasureData: string;
                let secondaryMeasureTooltipData: string;

                let primaryFormatterVal: number = 0;
                if (legendSettings.displayUnits === 0) {
                    let alternateFormatter: number;
                    alternateFormatter = parseInt(legendData.dataPoints[j].measure, 10).toString().length;
                    if (alternateFormatter > 9) {
                        primaryFormatterVal = 1e9;
                    } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                        primaryFormatterVal = 1e6;
                    } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                        primaryFormatterVal = 1e3;
                    } else {
                        primaryFormatterVal = 10;
                    }
                }

                if (legendDataTorender.primaryType === 'Value') {
                    primaryFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces,
                        value: legendSettings.displayUnits === 0 ? primaryFormatterVal : legendSettings.displayUnits
                    });
                    primaryTooltipFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces
                    });

                    primaryData = primaryFormatter.format(legendData.dataPoints[j].measure);
                    measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);

                } else if (legendDataTorender.primaryType === 'Percentage') {
                    primaryPercentFormatter = ValueFormatter.create({
                        precision: legendSettings.decimalPlaces,
                        value: 0
                    });
                    percentData = legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100;
                    primaryData = `${primaryPercentFormatter.format(percentData)}%`;
                    measureTooltip = primaryData;

                } else if (legendDataTorender.primaryType === 'Both') {
                    primaryFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces,
                        value: legendSettings.displayUnits === 0 ? primaryFormatterVal : legendSettings.displayUnits
                    });
                    primaryPercentFormatter = ValueFormatter.create({
                        precision: legendSettings.decimalPlaces,
                        value: 0
                    });
                    primaryTooltipFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces
                    });

                    let formattedPrimaryVal: string;
                    formattedPrimaryVal = primaryFormatter.format(legendData.dataPoints[j].measure);
                    let formattedPrimaryPercentVal: string;
                    formattedPrimaryPercentVal = primaryPercentFormatter
                        .format((legendData.dataPoints[j].measure / viewModel.primaryMeasureSum) * 100);
                    primaryData = `${formattedPrimaryVal} ${formattedPrimaryPercentVal}%`;
                    let formattedPriTooltipVal: string;
                    formattedPriTooltipVal = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);
                    let formattedPriTooltipPercentVal: string;
                    formattedPriTooltipPercentVal = primaryPercentFormatter
                        .format(legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100);
                    measureTooltip = `${formattedPriTooltipVal} ${formattedPriTooltipPercentVal}%`;
                } else {
                    primaryFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces
                    });
                    primaryTooltipFormatter = ValueFormatter.create({
                        format: primaryFormat,
                        precision: legendSettings.decimalPlaces
                    });

                    primaryData = primaryFormatter.format(legendData.dataPoints[j].measure);
                    measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);
                }

                if (legendData.secondaryTitle) {
                    let secondaryFormatterVal: number = 0;
                    if (legendSettings.displayUnits === 0) {
                        let alternateFormatter: number;
                        alternateFormatter = parseInt(legendData.dataPoints[j].secondaryMeasure, 10).toString().length;
                        if (alternateFormatter > 9) {
                            secondaryFormatterVal = 1e9;
                        } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                            secondaryFormatterVal = 1e6;
                        } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                            secondaryFormatterVal = 1e3;
                        } else {
                            secondaryFormatterVal = 10;
                        }
                    }
                    secondaryFormatter = ValueFormatter.create({
                        format: secondaryFormat,
                        precision: legendSettings.decimalPlaces,
                        value: legendSettings.displayUnits === 0 ? secondaryFormatterVal : legendSettings.displayUnits
                    });

                    secondaryMeasureData = secondaryFormatter.format(legendData.dataPoints[j].secondaryMeasure);
                    secondaryMeasureTooltipData = secondaryTooltipFormatter.format(legendData.dataPoints[j].secondaryMeasure);
                    let primaryIndicatorVal: PrimitiveValue;
                    primaryIndicatorVal = this.isPrimaryIndicator(
                        legendData.dataPoints[j].measure, dataViews, viewModel.dataPoints[j].primaryKPIValue
                    );
                    primaryIndicatorVal = primaryIndicatorVal !== undefined ? primaryIndicatorVal : '';
                    let secondaryIndicatorVal: PrimitiveValue;
                    secondaryIndicatorVal = this.isSecondaryIndicator(
                        legendData.dataPoints[j].secondaryMeasure, dataViews, viewModel.dataPoints[j].secondaryKPIValue);
                    secondaryIndicatorVal = secondaryIndicatorVal !== undefined ? secondaryIndicatorVal : '';
                    legendDataTorender.dataPoints.push({
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: legendData.dataPoints[j].identity,
                        label: legendData.dataPoints[j].label,
                        measure: primaryData,
                        primaryIndicator: primaryIndicatorVal,
                        primaryTooltip: measureTooltip,
                        secondaryIndicator: secondaryIndicatorVal,
                        secondaryMeasure: secondaryMeasureData,
                        secondaryTooltip: secondaryMeasureTooltipData,
                        selected: false
                    });
                } else {
                    let primaryIndicatorVal: PrimitiveValue;
                    primaryIndicatorVal = this.isPrimaryIndicator(
                        legendData.dataPoints[j].measure, dataViews, viewModel.dataPoints[j].primaryKPIValue
                    );
                    primaryIndicatorVal = primaryIndicatorVal !== undefined ? primaryIndicatorVal : '';
                    legendDataTorender.dataPoints.push({
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: legendData.dataPoints[j].identity,
                        label: legendData.dataPoints[j].label,
                        measure: primaryData,
                        primaryIndicator: primaryIndicatorVal,
                        primaryTooltip: measureTooltip,
                        selected: false
                    });

                    legendValuesTorender[j] = legendValues[j];
                }
                if (this.legendObjectProperties) {
                    powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                    let legendPos: string;
                    legendPos = powerbi.extensibility.utils.chart.legend.legendProps.position;
                    let position: string;
                    position = <string>this.legendObjectProperties[legendPos];
                    if (position) {
                        this.legend.changeOrientation(LegendPosition[position]);
                    }
                }

                this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
                powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
            }
        }

        // tslint:disable-next-line:no-any
        private isPrimaryIndicator(indicatorValue: any, dataview: DataView, primaryKPI: PrimitiveValue): boolean {
            let isPrimaryIndicator: boolean;
            let isPercentage: boolean;
            let primaryIndicator: IPrimaryIndicator;
            primaryIndicator = this.getPrimaryIndicator(dataview);
            for (const val of dataview.categorical.values) {
                if (val.source.roles.hasOwnProperty('Y')) {
                    if (val.source.format && val.source.format.search('%') > 0) {
                        isPercentage = true;
                    }
                    break;
                }
            }

            if (primaryIndicator.show) {
                let thresholdValue: number = 0;
                if (primaryKPI) {
                    thresholdValue = parseFloat(primaryKPI.toString());
                    if (isPercentage) {
                        thresholdValue = thresholdValue / 100;
                    }
                } else {
                    if (primaryIndicator.signIndicator) {
                        thresholdValue = 0;
                    } else {
                        thresholdValue = primaryIndicator.threshold;

                        if (isPercentage) {
                            thresholdValue = thresholdValue / 100;
                        }
                    }
                }

                if (!isPercentage) {
                    indicatorValue = parseInt(indicatorValue, 10);
                }

                if (thresholdValue <= indicatorValue) {
                    isPrimaryIndicator = true;
                } else {
                    isPrimaryIndicator = false;
                }
            }

            return isPrimaryIndicator;
        }
        // tslint:disable-next-line:no-any
        private isSecondaryIndicator(secondaryIndicator: any, dataview: DataView, secondaryKPI: PrimitiveValue): boolean {
            let isSecondaryIndicator: boolean;
            let isPercentage: boolean;
            let smIndicator: ISecondaryIndicator;
            smIndicator = this.getSecondaryIndicator(dataview);

            for (const val of dataview.categorical.values) {
                if (val.source.roles.hasOwnProperty('SecondaryMeasure')) {
                    if (val.source.format && val.source.format.search('%') > 0) {
                        isPercentage = true;
                    }
                    break;
                }
            }

            if (smIndicator.show) {
                let thresholdValue: number = 0;
                if (secondaryKPI) {
                    thresholdValue = parseFloat(secondaryKPI.toString());
                    if (isPercentage) {
                        thresholdValue = thresholdValue / 100;
                    }
                } else {
                    if (smIndicator.signIndicator) {
                        thresholdValue = 0;
                    } else {
                        thresholdValue = smIndicator.threshold;
                        if (isPercentage) {
                            thresholdValue = thresholdValue / 100;
                        }
                    }
                }

                if (!isPercentage) {
                    secondaryIndicator = parseInt(secondaryIndicator, 10);
                }
                if (thresholdValue <= secondaryIndicator) {
                    isSecondaryIndicator = true;
                } else {
                    isSecondaryIndicator = false;
                }
            }

            return isSecondaryIndicator;
        }

        private getDefaultLegendSettings(dataView: DataView): ILegendConfig {

            return {
                decimalPlaces: 0,
                displayUnits: 0,
                legendName: dataView.categorical.categories[0].source.displayName,
                primaryMeasure: 'None',
                show: true
            };
        }

        private getLegendSettings(dataView: DataView): ILegendConfig {
            let objects: DataViewObjects = null;
            let legendSetting: ILegendConfig;
            legendSetting = this.getDefaultLegendSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) {
                return legendSetting;
            }
            objects = dataView.metadata.objects;
            legendSetting.show = DataViewObjects.getValue(objects, chartProperties.legendSettings.show, legendSetting.show);
            legendSetting.legendName = DataViewObjects.getValue(
                objects, chartProperties.legendSettings.legendName, legendSetting.legendName);
            legendSetting.primaryMeasure = DataViewObjects.getValue(
                objects, chartProperties.legendSettings.primaryMeasure, legendSetting.primaryMeasure);
            legendSetting.displayUnits = DataViewObjects.getValue(
                objects, chartProperties.legendSettings.displayUnits, legendSetting.displayUnits);
            legendSetting.decimalPlaces = DataViewObjects.getValue(
                objects, chartProperties.legendSettings.decimalPlaces, legendSetting.decimalPlaces);

            legendSetting.decimalPlaces = legendSetting.decimalPlaces < 0
                ? 0 : legendSetting.decimalPlaces > 4 ? 4 : legendSetting.decimalPlaces;

            return legendSetting;
        }

        private getDefaultDetailLable(): IDetailLables {

            return <IDetailLables>{
                color: 'grey',
                fontSize: 9,
                labelDisplayUnits: 0,
                labelPrecision: 0,
                labelStyle: 'Category',
                show: true
            };
        }

        private getDetailLable(dataView: DataView): IDetailLables {
            let objects: DataViewObjects = null;
            let labelSettings: IDetailLables;
            labelSettings = this.getDefaultDetailLable();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultDetailLable();
            }
            objects = dataView.metadata.objects;
            labelSettings.show = DataViewObjects.getValue(objects, chartProperties.labels.show, labelSettings.show);
            labelSettings.color = DataViewObjects.getFillColor(objects, chartProperties.labels.color, labelSettings.color);
            labelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, chartProperties.labels.labelDisplayUnits, labelSettings.labelDisplayUnits);
            labelSettings.labelPrecision = DataViewObjects.getValue(
                objects, chartProperties.labels.labelPrecision, labelSettings.labelPrecision);
            labelSettings.labelPrecision = labelSettings.labelPrecision < 0 ?
                0 : (labelSettings.labelPrecision) > 4 ? 4 : (labelSettings.labelPrecision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, chartProperties.labels.fontSize, labelSettings.fontSize);
            labelSettings.labelStyle = DataViewObjects.getValue(objects, chartProperties.labels.labelStyle, labelSettings.labelStyle);

            return labelSettings;
        }

        private getDefaultSummaryLabel(): ISummaryLabels {

            return {
                color: '#777777',
                fontSize: 12,
                labelDisplayUnits: 0,
                labelPrecision: 0,
                show: true,
                text: 'Total'
            };
        }

        private getSummaryLabels(dataView: DataView): ISummaryLabels {
            let objects: DataViewObjects = null;
            let summaryLabelSettings: ISummaryLabels;
            summaryLabelSettings = this.getDefaultSummaryLabel();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultSummaryLabel();
            }
            objects = dataView.metadata.objects;
            summaryLabelSettings.show = DataViewObjects.getValue(objects, chartProperties.summaryLabels.show, summaryLabelSettings.show);
            summaryLabelSettings.color = DataViewObjects.getFillColor(
                objects, chartProperties.summaryLabels.color, summaryLabelSettings.color);
            summaryLabelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, chartProperties.summaryLabels.labelDisplayUnits, summaryLabelSettings.labelDisplayUnits);
            summaryLabelSettings.labelPrecision = DataViewObjects.getValue(
                objects, chartProperties.summaryLabels.labelPrecision, summaryLabelSettings.labelPrecision);
            summaryLabelSettings.labelPrecision = summaryLabelSettings.labelPrecision < 0 ?
                0 : (summaryLabelSettings.labelPrecision) > 4 ? 4 : (summaryLabelSettings.labelPrecision);
            summaryLabelSettings.fontSize = DataViewObjects.getValue(
                objects, chartProperties.summaryLabels.fontSize, summaryLabelSettings.fontSize);
            summaryLabelSettings.text = DataViewObjects.getValue(
                objects, chartProperties.summaryLabels.text, summaryLabelSettings.text);

            return summaryLabelSettings;
        }

        private getDefaultSecondarySummaryLabel(): ISecondarySummaryLabels {

            return {
                color: '#777777',
                fontSize: 12,
                labelDisplayUnits: 0,
                labelPrecision: 0
            };
        }

        private getSecondarySummaryLabels(dataView: DataView): ISecondarySummaryLabels {
            let objects: DataViewObjects = null;
            let secondarySummaryLabelSettings: ISecondarySummaryLabels;
            secondarySummaryLabelSettings = this.getDefaultSecondarySummaryLabel();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultSecondarySummaryLabel();
            }
            objects = dataView.metadata.objects;
            secondarySummaryLabelSettings.color = DataViewObjects.getFillColor(
                objects, chartProperties.secondarySummaryLabels.color, secondarySummaryLabelSettings.color);
            secondarySummaryLabelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, chartProperties.secondarySummaryLabels.labelDisplayUnits, secondarySummaryLabelSettings.labelDisplayUnits);
            secondarySummaryLabelSettings.labelPrecision = DataViewObjects.getValue(
                objects, chartProperties.secondarySummaryLabels.labelPrecision, secondarySummaryLabelSettings.labelPrecision);
            secondarySummaryLabelSettings.labelPrecision = secondarySummaryLabelSettings.labelPrecision < 0 ?
                0 : (secondarySummaryLabelSettings.labelPrecision) > 4 ?
                    4 : (secondarySummaryLabelSettings.labelPrecision);
            secondarySummaryLabelSettings.fontSize = DataViewObjects.getValue(
                objects, chartProperties.secondarySummaryLabels.fontSize, secondarySummaryLabelSettings.fontSize);

            return secondarySummaryLabelSettings;
        }

        private getDefaultPrimaryIndicator(): IPrimaryIndicator {

            return {
                downArrow: '#FF0000',
                show: false,
                signIndicator: false,
                threshold: null,
                totalThreshold: null,
                upArrow: '#228B22'
            };
        }

        private getPrimaryIndicator(dataView: DataView): IPrimaryIndicator {
            let objects: DataViewObjects = null;
            let primaryIndicatorSettings: IPrimaryIndicator;
            primaryIndicatorSettings = this.getDefaultPrimaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return primaryIndicatorSettings;
            }
            objects = dataView.metadata.objects;
            primaryIndicatorSettings.show = DataViewObjects.getValue(
                objects, chartProperties.indicators.show, primaryIndicatorSettings.show);
            primaryIndicatorSettings.signIndicator = DataViewObjects.getValue(
                objects, chartProperties.indicators.primaryMeasure, primaryIndicatorSettings.signIndicator);
            if (!primaryIndicatorSettings.signIndicator) {
                primaryIndicatorSettings.threshold = DataViewObjects.getValue(
                    objects, chartProperties.indicators.threshold, primaryIndicatorSettings.threshold);
                primaryIndicatorSettings.totalThreshold = DataViewObjects.getValue(
                    objects, chartProperties.indicators.totalThreshold, primaryIndicatorSettings.totalThreshold);
            }
            primaryIndicatorSettings.upArrow = DataViewObjects.getFillColor(
                objects, chartProperties.indicators.upArrow, primaryIndicatorSettings.upArrow);
            primaryIndicatorSettings.downArrow = DataViewObjects.getFillColor(
                objects, chartProperties.indicators.downArrow, primaryIndicatorSettings.downArrow);

            return primaryIndicatorSettings;
        }

        private getDefaultSecondaryIndicator(): ISecondaryIndicator {

            return {
                downArrow: '#FF0000',
                show: false,
                signIndicator: false,
                threshold: null,
                totalThreshold: null,
                upArrow: '#228B22'
            };
        }

        private getSecondaryIndicator(dataView: DataView): ISecondaryIndicator {
            let objects: DataViewObjects = null;
            let secIndicatorSettings: ISecondaryIndicator;
            secIndicatorSettings = this.getDefaultSecondaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return secIndicatorSettings;
            }
            objects = dataView.metadata.objects;
            secIndicatorSettings.show = DataViewObjects
                .getValue(objects, chartProperties.smIndicator.show, secIndicatorSettings.show);
            secIndicatorSettings.signIndicator = DataViewObjects
                .getValue(objects, chartProperties.smIndicator.secondaryMeasure, secIndicatorSettings.signIndicator);
            if (!secIndicatorSettings.signIndicator) {
                secIndicatorSettings.threshold = DataViewObjects
                    .getValue(objects, chartProperties.smIndicator.threshold, secIndicatorSettings.threshold);
                secIndicatorSettings.totalThreshold = DataViewObjects
                    .getValue(objects, chartProperties.smIndicator.totalThreshold, secIndicatorSettings.totalThreshold);
            }
            secIndicatorSettings.upArrow = DataViewObjects.getFillColor(
                objects, chartProperties.smIndicator.upArrow, secIndicatorSettings.upArrow);
            secIndicatorSettings.downArrow = DataViewObjects
                .getFillColor(objects, chartProperties.smIndicator.downArrow, secIndicatorSettings.downArrow);

            return secIndicatorSettings;
        }

        private getDefaultDonutTitle(dataView: DataView): IDonutTitle {
            let titleText: string = '';
            if (dataView && dataView.categorical) {
                if (dataView.categorical.values && dataView.categorical.values[0] && dataView.categorical.values[0].values) {
                    titleText += dataView.categorical.values[0].source.displayName;
                }
                if (dataView.categorical.categories && dataView.categorical.categories[0] && dataView.categorical.categories[0].values) {
                    let displayName: string;
                    displayName = dataView.categorical.categories[0].source.displayName;
                    titleText += ` by ${displayName}`;
                }
            }

            return {
                backgroundColor: '#fff',
                fill1: '#333333',
                fontSize: 12,
                show: true,
                titleText: titleText,
                tooltipText: 'Your tooltip text goes here'
            };
        }
        private getDonutTitle(dataView: DataView): IDonutTitle {
            let objects: DataViewObjects = null;
            let donutTitleSettings: IDonutTitle;
            donutTitleSettings = this.getDefaultDonutTitle(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) {
                return donutTitleSettings;
            }
            objects = dataView.metadata.objects;
            donutTitleSettings.show = DataViewObjects.getValue(objects, chartProperties.donutTitle.show, donutTitleSettings.show);
            donutTitleSettings.titleText = DataViewObjects.getValue(
                objects, chartProperties.donutTitle.titleText, donutTitleSettings.titleText);
            donutTitleSettings.fill1 = DataViewObjects.getFillColor(objects, chartProperties.donutTitle.fill1, donutTitleSettings.fill1);
            donutTitleSettings.fontSize = DataViewObjects.getValue(
                objects, chartProperties.donutTitle.fontSize, donutTitleSettings.fontSize);
            donutTitleSettings.backgroundColor = DataViewObjects.getFillColor(
                objects, chartProperties.donutTitle.backgroundColor, donutTitleSettings.backgroundColor);
            donutTitleSettings.tooltipText = DataViewObjects.getValue(
                objects, chartProperties.donutTitle.tooltipText, donutTitleSettings.tooltipText);

            return donutTitleSettings;
        }

        private getDefaultAnimation(): IAnimation {

            return {
                show: false
            };
        }

        private getAnimation(dataView: DataView): IAnimation {
            let objects: DataViewObjects = null;
            let animationSettings: IAnimation;
            animationSettings = this.getDefaultAnimation();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return animationSettings;
            }
            objects = dataView.metadata.objects;
            animationSettings.show = DataViewObjects.getValue(objects, chartProperties.animation.show, animationSettings.show);

            return animationSettings;
        }

        private getDefaultNoDataText(): INodataText {

            return {
                textMessage: ''
            };
        }

        private getNoDataText(dataView: DataView): INodataText {
            let objects: DataViewObjects = null;
            let textMessage: INodataText;
            textMessage = this.getDefaultNoDataText();
            if (!dataView.metadata || !dataView.metadata.objects) {

                return textMessage;
            }
            objects = dataView.metadata.objects;
            textMessage.textMessage = DataViewObjects.getValue(objects, chartProperties.nodatatext.textMessage, textMessage.textMessage);

            return textMessage;
        }

        private getDecimalPlacesCount(value: number): number {
            let decimalPlacesCount: number = 0;
            if (value) {
                let valArr: string[];
                valArr = value.toString().split('.');
                if (valArr[1]) {
                    decimalPlacesCount = valArr[1].length > 4 ? 4 : valArr[1].length;
                }
            }

            return decimalPlacesCount;
        }

        // tslint:disable-next-line:no-any
        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let tooltipDataPointsFinal: VisualTooltipDataItem[];
            tooltipDataPointsFinal = [];
            let tooltipDataPoints: ITooltipDataPoints[];
            tooltipDataPoints = value.data.tooltipData;
            let tooltipDataSize: number;
            tooltipDataSize = tooltipDataPoints.length;
            let i: number = 0;
            for (; i < tooltipDataSize; i++) {
                let tooltipData: VisualTooltipDataItem;
                tooltipData = {
                    displayName: '',
                    value: ''
                };
                tooltipData.displayName = tooltipDataPoints[i].name;
                let formattingString: string;
                formattingString = tooltipDataPoints[i].formatter
                    ? tooltipDataPoints[i].formatter : ValueFormatter.DefaultNumericFormat;
                let formatter: IValueFormatter;
                formatter = ValueFormatter.create({
                    format: formattingString
                });
                if (isNaN(parseFloat(tooltipDataPoints[i].value))) {
                    tooltipData.value = tooltipDataPoints[i].value;
                } else {
                    tooltipData.value = formatter.format(parseFloat(tooltipDataPoints[i].value));
                }
                tooltipDataPointsFinal.push(tooltipData);
            }

            return tooltipDataPointsFinal;
        }
    }
}
