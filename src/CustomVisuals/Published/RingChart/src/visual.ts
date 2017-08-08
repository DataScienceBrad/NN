module powerbi.extensibility.visual {

    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    let legendValues = {};
    let legendValuesTorender = {};
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

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects,
            propertyId: DataViewObjectPropertyIdentifier,
            defaultColor?: string): string {
            let value: Fill = getValue(objects, propertyId);
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

            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill = DataViewObject.getValue(objects, propertyName);
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

    // Interface for Detail Lables
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

    export let chartProperties = {
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

    let d3 = (<any>window).d3;

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): IDonutChartViewModel {
        let dataViews = options.dataViews;
        let defaultSettings: IDonutChartSettings = {
            generalView: {
                opacity: 100
            }
        };
        let viewModel: IDonutChartViewModel = {
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
        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];

        let donutChartDataPoints: IDonutChartDataPoint[] = [];
        let dataMax: number;
        let primaryMeasureSum = 0;
        let secondaryMeasureSum = 0;

        let primarykpiSum = 0;
        let secondarykpiSum = 0;

        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
        let donutChartSettings: IDonutChartSettings = {

            generalView: {
                opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity)
            }
        };
        // logic to check if category and primary measure are available
        let isLegendAvailable = false;
        let isPrimaryMeasureAvailable = false;
        for (let cat1 = 0; cat1 < dataViews[0].categorical.categories.length; cat1++) {
            let dataView: DataView = dataViews[0];
            if (dataView.categorical.categories[cat1].source.roles['Category']) {
                isLegendAvailable = true;
            }
        }
        for (let k = 0; k < dataViews[0].categorical.values.length; k++) {
            let dataView: DataView = dataViews[0];
            if (dataView.categorical.values[k].source.roles['Y']) {
                isPrimaryMeasureAvailable = true;
            }
        }
        let len = Math.max(category.values.length, dataValue.values.length);
        for (let i = 0; i < len; i++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(category.values[i].toString()).value
                }
            };

            let donutDataPoint: IDonutChartDataPoint = {
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
            for (let cat1 = 0; cat1 < dataViews[0].categorical.categories.length; cat1++) {
                let dataView: DataView = dataViews[0];
                if (dataView.categorical.categories[cat1].source.roles['Category']) {
                    donutDataPoint.category = dataView.categorical.categories[cat1].values[i] ?
                        (dataView.categorical.categories[cat1].values[i].toString()) : '';
                }
                let tooltipDataPoint: ITooltipDataPoints = {
                    formatter: '',
                    name: dataView.categorical.categories[cat1].source.displayName,
                    value: dataView.categorical.categories[cat1].values[i] ?
                        (dataView.categorical.categories[cat1].values[i].toString()) : ''
                };
                donutDataPoint.tooltipData.push(tooltipDataPoint);
            }

            for (let k = 0; k < dataViews[0].categorical.values.length; k++) {
                let dataView: DataView = dataViews[0];
                if (dataView.categorical.values[k].source.roles['Y']) {
                    donutDataPoint.primaryName = dataView.categorical.values[k].source.displayName;
                    donutDataPoint.value = (Number(dataView.categorical.values[k].values[i]));
                    primaryMeasureSum += parseFloat(dataView.categorical.values[k].values[i] ?
                        dataView.categorical.values[k].values[i].toString() : '0');
                }
                if (dataView.categorical.values[k].source.roles['SecondaryMeasure']) {
                    donutDataPoint.secondaryName = dataView.categorical.values[k].source.displayName;
                    donutDataPoint.secondaryValue = (Number(dataView.categorical.values[k].values[i]));
                    secondaryMeasureSum += parseFloat(dataView.categorical.values[k].values[i] ?
                        dataView.categorical.values[k].values[i].toString() : '0');
                    context.isSMExists = true;
                }
                if (dataView.categorical.values[k].source.roles['PrimaryKPI']) {
                    donutDataPoint.primaryKPIValue = (Number(dataView.categorical.values[k].values[i]));
                    primarykpiSum += parseFloat(dataView.categorical.values[k].values[i] ?
                        dataView.categorical.values[k].values[i].toString() : '0');
                }
                if (dataView.categorical.values[k].source.roles['SecondaryKPI']) {
                    donutDataPoint.secondaryKPIValue = (Number(dataView.categorical.values[k].values[i]));
                    secondarykpiSum += parseFloat(dataView.categorical.values[k].values[i] ?
                        dataView.categorical.values[k].values[i].toString() : '0');
                }
                let tooltipDataPoint: ITooltipDataPoints = {
                    formatter: dataView.categorical.values[k].source.format ? dataView.categorical.values[k].source.format : '',
                    name: dataView.categorical.values[k].source.displayName,
                    value: dataView.categorical.values[k].values[i] ? (dataView.categorical.values[k].values[i].toString()) : ''
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
            legendData: context.getLegendData(dataViews[0], donutChartDataPoints, host),
            primaryKPISum: primarykpiSum,
            primaryMeasureSum: primaryMeasureSum,
            secondaryKPISum: secondarykpiSum,
            secondaryMeasureSum: secondaryMeasureSum,
            settings: donutChartSettings
        };
    }

    export class DonutChart implements IVisual {
        public groupLegends: d3.Selection<SVGElement>;
        public dataView: any;
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
        private dataViews;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private legendData;
        private currentViewport: IViewport;
        private settings: any;
        private rootElement;
        private defaultFontFamily: string;
        private labelFontFamily: string;
        private primaryMeasurePercent: boolean;
        private isSMExists: boolean;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element);
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('donutChart', true);

            this.locale = options.host.locale;
            this.rootElement.append('div')
                .classed('donutTitle', true).style('top', 0);

            let oElement: any = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select('.legend');

            d3.select(options.element)
                .append('div')
                .classed('SummarizedDiv', true);
            this.defaultFontFamily = 'Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif';
            this.labelFontFamily = 'wf_standard-font, helvetica, arial, sans-serif';
            this.primaryMeasurePercent = false;

        }

        public getLegendData(dataView: DataView, donutChartDataPoints: any, host: IVisualHost): LegendData {

            let legendSettings: ILegendConfig = this.getLegendSettings(dataView);
            // let SelectionId: powerbi.visuals.ISelectionId;
            let sTitle = '';
            let secondaryMeasure = [];
            let primaryTitle;
            let secondaryTitle;

            let legendData: LegendData = {
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

            for (let i = 0; i < donutChartDataPoints.length; ++i) {
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

        public update(options: VisualUpdateOptions) {
            this.dataViews = options.dataViews[0];
            let THIS = this;
            this.isSMExists = false;

            let viewModel: IDonutChartViewModel = visualTransform(options, this.host, this);
            let settings = this.donutChartSettings = viewModel.settings;

            this.donutDataPoints = viewModel.dataPoints;
            let lablesettings: IDetailLables = this.getDetailLable(this.dataViews);
            this.svg.selectAll('*').remove();
            this.rootElement.select('.ErrorMessage').remove();
            this.rootElement.select('.SummarizedDivContainer').remove();
            this.rootElement
                .selectAll('.legend #legendGroup .legendItem, .legend #legendGroup .legendTitle, .legend #legendGroup .navArrow')
                .remove();
            this.rootElement.selectAll('.donutTitle .donutTitleDiv, .donutTitle .donutTitleTooltip').remove();

            let noDataMessage: INodataText = this.getNoDataText(this.dataViews);
            let errorMsg = noDataMessage.textMessage;

            if (!viewModel || !viewModel.isLegendAvailable || !viewModel.isPrimaryMeasureAvailable) {
                let htmlChunk = '<div class="ErrorMessage"' +
                    'title="Please select Primary Measure and Legend values">Please select "Primary Measure" and "Legend" values</div>';
                $('#sandbox-host').append(htmlChunk);

                return;
            } else if (!viewModel.legendData || !viewModel.primaryMeasureSum) {
                let htmlChunk = `<div class="ErrorMessage" title="${errorMsg}">${errorMsg}</div>`;
                $('#sandbox-host').append(htmlChunk);

                return;
            }

            this.dataView = options.dataViews[0];

            let detaillabelprop: IDetailLables = this.getDetailLable(this.dataViews);
            let legendSettings: ILegendConfig = this.getLegendSettings(this.dataViews);
            let summaryLabelSettings: ISummaryLabels = this.getSummaryLabels(this.dataViews);
            let donutTitleSettings: IDonutTitle = this.getDonutTitle(this.dataViews);

            let donutWidth = options.viewport.width;
            let donutHeight = options.viewport.height;

            let donutTitleHeight = 0;
            if (donutTitleSettings.show) {
                this.rootElement.select('.donutTitle').style({
                    display: 'block',
                    position: 'absolute'
                });
                let textProperties: TextProperties = {
                    fontFamily: THIS.defaultFontFamily,
                    fontSize: PixelConverter.fromPoint(donutTitleSettings.fontSize),
                    text: donutTitleSettings.titleText
                };
                let finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth - 70);
                this.rootElement.select('.donutTitle')
                    .append('div')
                    .classed('donutTitleDiv', true)
                    .style({
                        'background-color': donutTitleSettings.backgroundColor,
                        color: donutTitleSettings.fill1,
                        'font-size': PixelConverter.fromPoint(donutTitleSettings.fontSize)
                    })
                    .text(finalText)
                    .append('span')
                    .text(' (?)')
                    .attr('title', donutTitleSettings.tooltipText);
                donutTitleHeight = parseFloat($('.donutTitle').css('height'));
                donutHeight = donutHeight - donutTitleHeight;
            }
            this.currentViewport = {
                height: Math.max(0, options.viewport.height - donutTitleHeight),
                width: Math.max(0, options.viewport.width)
            };

            let legendWidth = 0;
            let legendHeight = 0;

            if (legendSettings.show) {
                this.rootElement.select('.legend').style({
                    top: `${donutTitleHeight}px`
                });
                this.renderLegend(viewModel, this.dataViews);

                legendWidth = parseFloat($('.legend').attr('width'));
                legendHeight = parseFloat($('.legend').attr('height'));
                let legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
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
                let x = `${donutTitleHeight}px`;
                this.svg.style('margin-top', x);
                this.svg.style('margin-left', 0);
                this.svg.style('margin-right', 0);
            }

            this.svg.attr({
                height: donutHeight,
                width: donutWidth
            });

            let radius = Math.min(donutWidth, donutHeight) / 2;

            let getAngle = function (d) {
                return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
            };

            let outerMultiplier = 0.85;
            let innerMultiplier = 0.55;

            if (lablesettings.show) {
                outerMultiplier = 0.75;
                innerMultiplier = 0.45;
            }

            let arc = d3.svg.arc()
                .outerRadius(radius * outerMultiplier)
                .innerRadius(radius * innerMultiplier);

            let pie = d3.layout.pie()
                .sort(null)
                .value(function (d) { return d.value; });

            let svg = d3.select('.donutChart').append('svg')
                .attr('width', donutWidth)
                .attr('height', donutHeight)
                .append('g')
                .attr('transform', `translate(${donutWidth / 2},${donutHeight / 2})`);

            let g = svg.selectAll('.arc')
                .data(pie(viewModel.dataPoints))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .style('fill', function (d) { return d.data.color; });

            let outerArc = d3.svg.arc()
                .outerRadius(radius * 0.82)
                .innerRadius(radius * 0.82);

            function midAngle(d) { return d.startAngle + ((d.endAngle - d.startAngle)) / 2; }

            if (lablesettings.show) {
                let enteringLabels = svg.selectAll('.polyline').data(pie(viewModel.dataPoints)).enter();
                let labelGroups = enteringLabels.append('g')
                    .attr('class', 'polyline')
                    .style('fill', 'none')
                    .style('stroke', 'grey')
                    .style('stroke-width', '1px')
                    .style('opacity', '0.4');

                let line = labelGroups.
                    append('polyline')
                    .attr('points', function (d) {
                        let arccentroid = arc.centroid(d);
                        let pos = outerArc.centroid(d);
                        let pos1 = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 14) * (midAngle(d) < Math.PI ? 1 : -1);
                        let fpos = [(arccentroid[0] + pos1[0]) / 2, (arccentroid[1] + pos1[1]) / 2];
                        let fpos1 = [(fpos[0] + outerArc.centroid(d)[0]) / 2, (fpos[1] + outerArc.centroid(d)[1]) / 2];

                        return [fpos1, outerArc.centroid(d), pos];
                    })
                    .attr('id', function (d, i) {
                        return `polyline_${i}`;
                    });

                let enteringtext = svg.selectAll('.labelName').data(pie(viewModel.dataPoints)).enter();
                let textGroups = enteringtext.append('g').attr('class', 'labelName');
                let labelcolor = lablesettings.color;
                let labeltextsize = PixelConverter.fromPoint(lablesettings.fontSize); // + 'px';

                let label = textGroups
                    .append('text')
                    .attr('x', function (d) {
                        let pos = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                        return pos[0];
                    })
                    .attr('y', function (d) {
                        let pos = outerArc.centroid(d);

                        return pos[1];
                    })
                    .attr('dy', '.20em')

                    .attr('id', function (d, i) {
                        return `label_${i}`;
                    })
                    .text(function (d) {
                        let primaryFormatter = '';
                        if (THIS.dataViews
                            && THIS.dataViews.categorical
                            && THIS.dataViews.categorical.values
                            && THIS.dataViews.categorical.values[0]) {
                            primaryFormatter = THIS.dataViews.categorical.values[0].source.format ?
                                THIS.dataViews.categorical.values[0].source.format : '';
                        }
                        let primaryFormatterVal = 0;
                        if (detaillabelprop.labelDisplayUnits === 0) {
                            let alternateFormatter = parseInt(d.data.value, 10).toString().length;
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

                        let formatter = ValueFormatter.create({
                            format: primaryFormatter,
                            precision: detaillabelprop.labelPrecision,
                            value: detaillabelprop.labelDisplayUnits === 0 ? primaryFormatterVal : detaillabelprop.labelDisplayUnits
                        });
                        let text = '';
                        let summaryvalue = viewModel.primaryMeasureSum;
                        if (detaillabelprop.labelStyle === 'Data') {
                            text = formatter.format((d.data.value));
                        } else if (detaillabelprop.labelStyle === 'Category') {
                            text = d.data.category;
                        } else if (detaillabelprop.labelStyle === 'Percent of total') {
                            let val = (d.data.value / summaryvalue * 100).toFixed(detaillabelprop.labelPrecision).toString();
                            text = `${val}%`;
                        } else if (detaillabelprop.labelStyle === 'Category, percent of total') {
                            let val = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${d.data.category} (${val}%)`;
                        } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                            let val1 = formatter.format(d.data.value);
                            let val2 = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${val1} (${val2}%)`;
                        } else if (detaillabelprop.labelStyle === 'Both') {
                            let val = formatter.format(d.data.value);
                            text = `${d.data.category} (${val})`;
                        } else {
                            let cat = d.data.category;
                            let val = formatter.format(d.data.value);
                            let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${cat} (${val}) (${percentVal}%)`;
                        }

                        let textProperties: TextProperties = {
                            fontFamily: THIS.defaultFontFamily,
                            fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize), // + 'px',
                            text: text
                        };
                        let widthOfText = textMeasurementService.measureSvgTextWidth(textProperties);

                        let pos = outerArc.centroid(d);

                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                        // r = 1// l = -1
                        // logic to show ellipsis in Data Labels if there is no enough width
                        let position = (midAngle(d) < Math.PI ? 1 : -1);
                        let textEnd;
                        let finalText;
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

                            let firstRowLabel;
                            if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                                firstRowLabel = formatter.format(d.data.value);
                            } else {
                                firstRowLabel = d.data.category;
                            }

                            textProperties.text = firstRowLabel;
                            let widthOfText1 = textMeasurementService.measureSvgTextWidth(textProperties);
                            if (position === 1) {
                                let textEnd1 = pos[0] + widthOfText1;
                                if (textEnd1 > donutWidth / 2) {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth / 2 - pos[0]);
                                    if (finalText.length < 4) {
                                        return '';
                                    }
                                } else {
                                    finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, textEnd1);
                                }
                            } else if (position === -1) {
                                let textEnd1 = pos[0] + (-1 * widthOfText1);
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
                    'text-anchor', function (d) {
                        return (midAngle(d)) < Math.PI ? 'start' : 'end';
                    })
                    .style('fill', labelcolor)
                    .style('font-size', labeltextsize)
                    .style('font-family', this.defaultFontFamily)

                    .append('title')
                    .text(function (d) {
                        let formatter = ValueFormatter.create({
                            format: THIS.dataViews.categorical.values[0].source.format,
                            precision: 0
                        });
                        let summaryvalue = viewModel.primaryMeasureSum;
                        let text;
                        if (detaillabelprop.labelStyle === 'Data') {
                            text = formatter.format((d.data.value));
                        } else if (detaillabelprop.labelStyle === 'Category') {
                            text = d.data.category;
                        } else if (detaillabelprop.labelStyle === 'Percent of total') {
                            let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${percentVal}%`;
                        } else if (detaillabelprop.labelStyle === 'Category, percent of total') {
                            let cat = d.data.category;
                            let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${cat} (${percentVal}%)`;
                        } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                            let val = formatter.format(d.data.value);
                            let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${val} (${percentVal}%)`;
                        } else if (detaillabelprop.labelStyle === 'Both') {
                            let val = formatter.format(d.data.value);
                            text = `${d.data.category} (${val})`;
                        } else {
                            let val = formatter.format(d.data.value);
                            let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                            text = `${d.data.category} (${val}) (${percentVal}%)`;
                        }

                        return text;
                    });

                // Logic to add second row labels
                let dataLabels = this.svg.selectAll('.donutChart g.labelName text');
                let dataLabelsArr = dataLabels && dataLabels[0] ? dataLabels[0] : [];
                let dataLabelArrLen = dataLabelsArr.length;
                for (let i = 0; i < dataLabelArrLen; i++) {
                    if (detaillabelprop.labelStyle !== 'Data' && detaillabelprop.labelStyle !== 'Category'
                        && detaillabelprop.labelStyle !== 'Percent of total') {
                        let enteringSecondRowtext = svg.selectAll('.secondaryLabelName').data(pie(viewModel.dataPoints)).enter();
                        let secondarytextGroups = enteringSecondRowtext.append('g').attr('class', 'secondaryLabelName');
                        let labelcolor2 = lablesettings.color;
                        let labeltextsize2 = PixelConverter.fromPoint(lablesettings.fontSize);

                        let secondRowLabel = secondarytextGroups
                            .append('text')
                            .attr('x', function (d) {
                                let pos = outerArc.centroid(d);
                                pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                                return pos[0];
                            })
                            .attr('y', function (d) {
                                let pos = outerArc.centroid(d);
                                let text = d && d.data && d.data.category ? d.data.category : 'sample';
                                let textProperties: TextProperties = {
                                    fontFamily: THIS.defaultFontFamily,
                                    fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize), // + 'px',
                                    text: text
                                };
                                let heightOfText = textMeasurementService.measureSvgTextHeight(textProperties);

                                return pos[1] + heightOfText / 2 + 5;
                            })
                            .attr('dy', '.20em')

                            .attr('id', function (d, j) {
                                return `secondRowLabel_${j}`;
                            })
                            .text(function (d) {
                                let primaryFormatter = '';
                                if (THIS.dataViews
                                    && THIS.dataViews.categorical
                                    && THIS.dataViews.categorical.values
                                    && THIS.dataViews.categorical.values[0]) {
                                    primaryFormatter = THIS.dataViews.categorical.values[0].source.format ?
                                        THIS.dataViews.categorical.values[0].source.format : '';
                                }
                                let primaryFormatterVal = 0;
                                if (detaillabelprop.labelDisplayUnits === 0) {
                                    let alternateFormatter = parseInt(d.data.value, 10).toString().length;
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

                                let formatter = ValueFormatter.create({
                                    format: primaryFormatter,
                                    precision: detaillabelprop.labelPrecision,
                                    value: detaillabelprop.labelDisplayUnits === 0 ?
                                        primaryFormatterVal : detaillabelprop.labelDisplayUnits
                                });
                                let text = '';
                                let summaryvalue = viewModel.primaryMeasureSum;
                                if (detaillabelprop.labelStyle === 'Category, percent of total'
                                    || detaillabelprop.labelStyle === 'Data value, percent of total') {
                                    let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `(${percentVal}%)`;
                                } else if (detaillabelprop.labelStyle === 'Both') {
                                    text = `(${formatter.format(d.data.value)})`;
                                } else {
                                    let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `(${formatter.format(d.data.value)}) (${percentVal}%)`;
                                }

                                let textProperties: TextProperties = {
                                    fontFamily: THIS.defaultFontFamily,
                                    fontSize: PixelConverter.fromPoint(detaillabelprop.fontSize), // + 'px',
                                    text: text
                                };
                                let widthOfText = textMeasurementService.measureSvgTextWidth(textProperties);

                                let pos = outerArc.centroid(d);

                                pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                                // r = 1// l = -1
                                // logic to show ellipsis in Data Labels if there is no enough width
                                let position = (midAngle(d) < Math.PI ? 1 : -1);
                                let textEnd;
                                let finalText;
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
                            'text-anchor', function (d) {
                                return (midAngle(d)) < Math.PI ? 'start' : 'end';
                            })
                            .style('fill', labelcolor2)
                            .style('font-size', labeltextsize2)
                            .style('font-family', this.defaultFontFamily)
                            .append('title')
                            .text(function (d) {
                                let formatter = ValueFormatter.create({
                                    format: THIS.dataViews.categorical.values[0].source.format,
                                    precision: 0
                                });
                                let summaryvalue = viewModel.primaryMeasureSum;
                                let text;

                                if (detaillabelprop.labelStyle === 'Category, percent of total') {
                                    let catName = d.data.category;
                                    let val = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${catName} (${val}%)`;
                                } else if (detaillabelprop.labelStyle === 'Data value, percent of total') {
                                    let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${formatter.format(d.data.value)} (${percentVal}%)`;
                                } else if (detaillabelprop.labelStyle === 'Both') {
                                    text = `${d.data.category} (${formatter.format(d.data.value)})`;
                                } else {
                                    let percentVal = (d.data.value / summaryvalue * 100).toFixed(2).toString();
                                    text = `${d.data.category} (${formatter.format(d.data.value)}) (${percentVal}%)`;
                                }

                                return text;
                            });

                        let upperLabelText: any;
                        upperLabelText = dataLabelsArr[i]
                            && dataLabelsArr[i].childNodes
                            && dataLabelsArr[i].childNodes[0]
                            && dataLabelsArr[i].childNodes[0].textContent ?
                            dataLabelsArr[i] && dataLabelsArr[i].childNodes
                            && dataLabelsArr[i].childNodes[0] && dataLabelsArr[i].childNodes[0].textContent : 'no data';
                        let expString = '';
                        if (detaillabelprop.labelStyle === 'Category, percent of total'
                            || detaillabelprop.labelStyle === 'Data value, percent of total'
                            || detaillabelprop.labelStyle === 'Both') {
                            expString = '(.*)\\s\\((.+)\\)'; // <title>(.*)\\((.+)\\)<\/title>';
                        } else {
                            expString = '(.*)\\s\\((.+)\\)\\s\\((.+)\\)'; // <title>(.*)\\((.+)\\)<\/title>';
                        }
                        let pattern = new RegExp(expString, 'gi');
                        // checking the pattern of the data label inorder to display or not
                        if (!(upperLabelText && upperLabelText.indexOf('...') > -1) && pattern.test(upperLabelText)) {
                            document.getElementById(`secondRowLabel_${i}`).style.display = 'none';
                        }
                    }
                }
            }

            if (lablesettings.show) {
                let labelsLength = viewModel.dataPoints.length;
                for (let i = 0; i < labelsLength; i++) {
                    let obj1 = document.getElementById(`label_${i}`).getBoundingClientRect();
                    for (let j = i + 1; j <= labelsLength - 1; j++) {
                        let obj2 = document.getElementById(`label_${j}`).getBoundingClientRect();
                        let obj3;
                        let condExpr = !(obj2.left > obj1.right ||
                            obj2.right < obj1.left ||
                            obj2.top > obj1.bottom ||
                            obj2.bottom < obj1.top);
                        if (detaillabelprop.labelStyle !== 'Data'
                            && detaillabelprop.labelStyle !== 'Category'
                            && detaillabelprop.labelStyle !== 'Percent of total') {
                            obj3 = document.getElementById(`secondRowLabel_${i}`).getBoundingClientRect();
                            condExpr = !(obj2.left > obj1.right ||
                                obj2.right < obj1.left ||
                                obj2.top > obj1.bottom ||
                                obj2.bottom < obj1.top)
                                ||
                                (!(obj2.left > obj3.right ||
                                    obj2.right < obj3.left ||
                                    obj2.top > obj3.bottom ||
                                    obj2.bottom < obj3.top)
                                    && !!document.getElementById(`secondRowLabel_${i}`)
                                    && document.getElementById(`secondRowLabel_${i}`).style.display !== 'none');
                        }
                        if (condExpr) {
                            document.getElementById(`label_${j}`).style.display = 'none';
                            document.getElementById(`polyline_${j}`).style.display = 'none';
                            if (document.getElementById(`secondRowLabel_${j}`)) {
                                document.getElementById(`secondRowLabel_${j}`).style.display = 'none';
                            }
                        }
                    }
                    let legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                    if (d3.select(`#label_${i}`)[0][0].childNodes.length <= 1) {
                        document.getElementById(`label_${i}`).style.display = 'none';
                        document.getElementById(`polyline_${i}`).style.display = 'none';
                        if (document.getElementById(`secondRowLabel_${i}`)) {
                            document.getElementById(`secondRowLabel_${i}`).style.display = 'none';
                        }
                    }

                    // code to handle data labels cutting issue in top and bottom positions
                    let labelYPos: any = 0;
                    let secondLabelYPos: any = 0;
                    labelYPos = $(`#label_${i}`).attr('y');
                    if (labelYPos && labelYPos.indexOf('-') > -1) {
                        labelYPos = parseFloat(labelYPos) * 0.9;
                        labelYPos = labelYPos - obj1.height + 3; // 0.2em is the dy value. On conversion to px it will be 3px
                        labelYPos = Math.abs(labelYPos);
                    } else {
                        labelYPos = parseFloat(labelYPos) * 0.9 + 3; // 0.2em is the dy value. On conversion to px it will be 3px
                    }
                    secondLabelYPos = Math.abs(parseFloat($(`#secondRowLabel_${i}`).attr('y'))) ?
                        Math.abs(parseFloat($(`#secondRowLabel_${i}`).attr('y'))) + 3 : 0;
                    // 0.2em is the dy value. On conversion to px it will be 3px
                    let visualHeight: any = donutHeight / 2 * 0.9; // 0.9 is the random value for adjusting labels cropping issue
                    if (labelYPos > parseFloat(visualHeight)
                        || (secondLabelYPos > parseFloat(visualHeight))
                        && document.getElementById(`secondRowLabel_${i}`)
                        && document.getElementById(`secondRowLabel_${i}`).style.display !== 'none') {
                        document.getElementById(`label_${i}`).style.display = 'none';
                        document.getElementById(`polyline_${i}`).style.display = 'none';
                        if (document.getElementById(`secondRowLabel_${i}`)) {
                            document.getElementById(`secondRowLabel_${i}`).style.display = 'none';
                        }
                    }
                }
            }

            this.drawSummaryDiv(radius, options, viewModel, legendHeight, legendWidth, summaryLabelSettings, this.dataViews);
            let arcs = this.svg.selectAll('.arc').data(viewModel.dataPoints);

            this.tooltipServiceWrapper
                .addTooltip(
                this.svg.selectAll('.arc'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null
                );

            let selectionManager = this.selectionManager;

            // This must be an anonymous function instead of a lambda because
            // d3 uses 'this' as the reference to the element that was clicked.
            arcs.on('click', function (d) {
                selectionManager.select(d.selectionId).then((ids: any[]) => {
                    function CompareIds(legendData) {
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
                    let legend: any = THIS.rootElement.selectAll('.legendItem');
                    legend.attr('fill-opacity', (d1) => {
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
            $('#legendGroup').on('click.load', '.navArrow', function () {
                THIS.addLegendSelection();
            });
            this.rootElement.on('click', () => this.selectionManager.clear().then(
                () => this.rootElement.selectAll('.legendItem').attr('fill-opacity', 1),
                this.rootElement.selectAll('.arc').attr('fill-opacity', 1)
            ));

            // Animation of ring chart arcs
            let animationSettings: IAnimation = this.getAnimation(this.dataViews);
            if (animationSettings.show) {
                let donutArcPath = this.svg.selectAll('.arc path');
                donutArcPath.on('mouseover', function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(radius * innerMultiplier * 1.08)
                            .outerRadius(radius * outerMultiplier * 1.08));
                });
                donutArcPath.on('mouseout', function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(radius * innerMultiplier)
                            .outerRadius(radius * outerMultiplier));
                });
            }

        }

        public drawSummaryDiv(radius, options, viewModel, legendHeight, legendWidth, summaryLabelSettings, dataViews) {
            if (summaryLabelSettings.show) {
                if (viewModel.primaryMeasureSum) {
                    let pmIndicator: IPrimaryIndicator = this.getPrimaryIndicator(dataViews);
                    let smIndicator: ISecondaryIndicator = this.getSecondaryIndicator(dataViews);
                    let donutTitleSettings: IDonutTitle = this.getDonutTitle(this.dataViews);
                    let secondarySummarySettings: ISecondarySummaryLabels = this.getSecondarySummaryLabels(this.dataViews);
                    this.rootElement.select('.SummarizedDiv').style({ display: 'block' });
                    let sliceWidthRatio = 0.50;
                    let innerRadius = radius * sliceWidthRatio;
                    let halfViewPortWidth = options.viewport.width / 2;
                    let halfViewPortHeight = options.viewport.height / 2;
                    let x;
                    let y;
                    let primaryFormatterVal = 0;
                    if (summaryLabelSettings.labelDisplayUnits === 0) {
                        let alternateFormatter = parseInt(viewModel.primaryMeasureSum, 10).toString().length;
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

                    let primaryFormatter = ValueFormatter.create({
                        format: options.dataViews[0].categorical.values[0].source.format ?
                            options.dataViews[0].categorical.values[0].source.format : '',
                        precision: summaryLabelSettings.labelPrecision,
                        value: summaryLabelSettings.labelDisplayUnits === 0 ?
                            primaryFormatterVal : summaryLabelSettings.labelDisplayUnits
                    });
                    let primaryTooltipFormatter = ValueFormatter.create({
                        format: options.dataViews[0].categorical.values[0].source.format ?
                            options.dataViews[0].categorical.values[0].source.format : '',
                        precision: 0
                    });
                    let donutTitleHeight = 0;
                    if (donutTitleSettings.show) {
                        donutTitleHeight = parseFloat($('.donutTitle').css('height'));
                    }
                    if (!this.legendObjectProperties) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) +
                            parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if ((this.legendObjectProperties['show'])
                        && (this.legendObjectProperties['position'] === 'Top'
                            || this.legendObjectProperties['position'] === 'TopCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2)
                            + parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties['show']
                        && (this.legendObjectProperties['position'] === 'Bottom'
                            || this.legendObjectProperties['position'] === 'BottomCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2)
                            - parseInt(legendHeight.toString(), 10) / 2 + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties['show']
                        && (this.legendObjectProperties['position'] === 'Left'
                            || this.legendObjectProperties['position'] === 'LeftCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2) + parseInt(legendWidth.toString(), 10) / 2;
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else if (this.legendObjectProperties['show']
                        && (this.legendObjectProperties['position'] === 'Right'
                            || this.legendObjectProperties['position'] === 'RightCenter')) {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2) - parseInt(legendWidth.toString(), 10) / 2;
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    } else {
                        x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                        y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(donutTitleHeight.toString(), 10) / 2;
                    }

                    let widthBox = (innerRadius * Math.SQRT2);
                    let heightBox = (innerRadius * Math.SQRT2);
                    if (this.currentViewport.width > 150 && this.currentViewport.height > 100) {
                        let boxHeight = `${heightBox}px`;
                        this.rootElement.select('.SummarizedDiv')
                            .append('div').style({
                                color: summaryLabelSettings.color,
                                'font-family': this.defaultFontFamily,
                                'font-size': PixelConverter.fromPoint(summaryLabelSettings.fontSize), // + 'px',
                                height: `${heightBox}px`,
                                left: `${x}px`,
                                overflow: 'hidden',
                                position: 'absolute',
                                top: `${y}px`,
                                width: `${widthBox}px`
                            }).classed('SummarizedDivContainer', true);
                        this.rootElement.select('.SummarizedDivContainer')
                            .append('div')
                            .classed('pContainer', true)
                            .style({
                                position: 'absolute',
                                top: '50%',
                                transform: 'translate(0, -50%)',
                                width: '100%'
                            });
                        this.rootElement.select('.pContainer')
                            .append('p')
                            .classed('TotalText', true)
                            .text(summaryLabelSettings.text)
                            .style({
                                overflow: 'hidden',
                                'text-overflow': 'ellipsis',
                                'text-align': 'center',
                                'vertical-align': 'middle',
                                margin: '0', 'white-space': 'nowrap'
                            })
                            .attr('title', summaryLabelSettings.text);
                        this.rootElement.select('.pContainer')
                            .append('p')
                            .classed('TotalValue', true)
                            .style({
                                overflow: 'hidden',
                                'text-overflow': 'ellipsis',
                                'text-align': 'center',
                                'vertical-align': 'middle',
                                margin: '0', 'white-space': 'nowrap'
                            });
                        if (pmIndicator.show) {
                            let thresholdValue = 0;
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
                            let upColor;
                            let downColor;
                            upColor = pmIndicator.upArrow;
                            downColor = pmIndicator.downArrow;
                            let htmlChunk;
                            if (thresholdValue <= viewModel.primaryMeasureSum) {
                                htmlChunk = `<div class="primaryMeasureSum" ` +
                                    `title ="${primaryTooltipFormatter.format(viewModel.primaryMeasureSum)}">` +
                                    `${primaryFormatter.format(viewModel.primaryMeasureSum)}</div>` +
                                    `<span class="primaryMeasureIndicator" style="color:${upColor}">&#9650;</span>`;
                            } else {
                                htmlChunk = `<div class="primaryMeasureSum" ` +
                                    `title ="${primaryTooltipFormatter.format(viewModel.primaryMeasureSum)}">` +
                                    `${primaryFormatter.format(viewModel.primaryMeasureSum)}</div>` +
                                    `<span class="primaryMeasureIndicator" style="color:${downColor}">&#9660;</span>`;
                            }
                            this.rootElement.select('.TotalValue').html(htmlChunk);
                        } else {
                            let htmlChunk = `<div class="primaryMeasureSum" ` +
                                `title ="${primaryTooltipFormatter.format(viewModel.primaryMeasureSum)}">` +
                                `${primaryFormatter.format(viewModel.primaryMeasureSum)}</div>`;
                            this.rootElement.select('.TotalValue').html(htmlChunk);
                        }
                    }
                    let secondaryFormatter;
                    if (viewModel && viewModel.secondaryMeasureSum) {
                        let secondaryFormatterVal = 0;
                        if (secondarySummarySettings.labelDisplayUnits === 0) {
                            let alternateFormatter = parseInt(viewModel.secondaryMeasureSum, 10).toString().length;
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
                                options.dataViews[0].categorical.values[1].source.format : '',
                            precision: secondarySummarySettings.labelPrecision,
                            value: secondarySummarySettings.labelDisplayUnits === 0 ?
                                secondaryFormatterVal : secondarySummarySettings.labelDisplayUnits
                        });
                        let secondaryTooltipFormatter = ValueFormatter.create({
                            format: options.dataViews[0].categorical.values[1].source.format ?
                                options.dataViews[0].categorical.values[1].source.format : '',
                            precision: 0
                        });

                        let isSecondaryPercentage = false;
                        if (dataViews && dataViews.categorical && dataViews.categorical.values
                            && dataViews.categorical.values[1]
                            && dataViews.categorical.values[1].source
                            && dataViews.categorical.values[1].source.format
                            && dataViews.categorical.values[1].source.format.toString().indexOf('%') > -1) {
                            isSecondaryPercentage = true;
                        }
                        let secondaryFontSize = secondarySummarySettings.fontSize;
                        let secondaryColor = secondarySummarySettings.color;

                        this.rootElement.select('.pContainer')
                            .append('p')
                            .classed('SecondaryText', true)
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
                        this.rootElement.select('.pContainer')
                            .append('p')
                            .classed('SecondaryValue', true)
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
                        let htmlChunk;
                        if (smIndicator.show) {
                            let smThreshold = 0;
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

                            let upColor;
                            let downColor;
                            upColor = smIndicator.upArrow;
                            downColor = smIndicator.downArrow;
                            if (smThreshold <= viewModel.secondaryMeasureSum) {
                                htmlChunk = `<div class="secondaryMeasureSum" ` +
                                    `title ="${secondaryTooltipFormatter.format(viewModel.secondaryMeasureSum)}">` +
                                    `${secondaryFormatter.format(viewModel.secondaryMeasureSum)}</div>` +
                                    `<span class="secondaryMeasureIndicator" style="color:${upColor}">&#9650;</span>`;
                            } else {
                                htmlChunk = `<div class="secondaryMeasureSum" ` +
                                    `title ="${secondaryTooltipFormatter.format(viewModel.secondaryMeasureSum)}">` +
                                    `${secondaryFormatter.format(viewModel.secondaryMeasureSum)}</div>` +
                                    `<span class="secondaryMeasureIndicator" style="color:${downColor}">&#9660;</span>`;
                            }
                            this.rootElement.select('.SecondaryValue').html(htmlChunk);
                        } else {
                            htmlChunk = `<div class="secondaryMeasureSum" ` +
                                `title ="${secondaryTooltipFormatter.format(viewModel.secondaryMeasureSum)}">` +
                                `${secondaryFormatter.format(viewModel.secondaryMeasureSum)}</div>`;
                            this.rootElement.select('.SecondaryValue').html(htmlChunk);
                        }
                    }
                    let pContainerDivWidth = parseFloat(this.rootElement.select('.pContainer').style('width'));

                    let formattedPrimaryMeasureSumTextProperties: TextProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(summaryLabelSettings.fontSize),
                        text: primaryFormatter.format(viewModel.primaryMeasureSum)
                    };
                    let formattedPrimaryMeasureSumTextPropertiesWidth = textMeasurementService
                        .measureSvgTextWidth(formattedPrimaryMeasureSumTextProperties);

                    let formattedSecondaryMeasureSumTextPropertiesWidth;
                    if (secondaryFormatter) {
                        let formattedSecondaryMeasureSumTextProperties: TextProperties = {
                            fontFamily: 'Segoe UI',
                            fontSize: PixelConverter.fromPoint(secondarySummarySettings.fontSize),
                            text: secondaryFormatter.format(viewModel.secondaryMeasureSum)
                        };
                        formattedSecondaryMeasureSumTextPropertiesWidth = textMeasurementService
                            .measureSvgTextWidth(formattedSecondaryMeasureSumTextProperties);
                    }
                    let measureArrowProperties: TextProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(summaryLabelSettings.fontSize),
                        text: 'ABC'
                    };
                    let measureArrowWidth = textMeasurementService.measureSvgTextWidth(measureArrowProperties);
                    let availableWidth = pContainerDivWidth - measureArrowWidth;
                    if (this.rootElement.select('.primaryMeasureIndicator')[0][0] !== null) {
                        if (formattedPrimaryMeasureSumTextPropertiesWidth
                            + parseFloat(this.rootElement.select('.primaryMeasureIndicator').style('width')) * 2 > pContainerDivWidth) {
                            let display = 'visible';
                            if (availableWidth < 2) {
                                availableWidth = availableWidth === 0 ? 0 : availableWidth;
                                display = 'hidden';
                            }
                            $('.primaryMeasureSum').css('width', `${availableWidth}px`);
                            this.rootElement.select('.primaryMeasureIndicator').style('visibility', display);
                        }
                    }

                    let sMArrowProperties: TextProperties = {
                        fontFamily: 'Segoe UI',
                        fontSize: PixelConverter.fromPoint(secondarySummarySettings.fontSize),
                        text: 'ABC'
                    };
                    let measureArrowWidth2 = textMeasurementService.measureSvgTextWidth(sMArrowProperties);
                    let availableWidth2 = pContainerDivWidth - measureArrowWidth2;
                    if (this.rootElement.select('.secondaryMeasureIndicator')[0][0] !== null) {
                        if (formattedSecondaryMeasureSumTextPropertiesWidth
                            + parseFloat(this.rootElement.select('.secondaryMeasureIndicator').style('width')) * 2 > pContainerDivWidth) {
                            let display = 'visible';
                            if (availableWidth2 < 2) {
                                availableWidth2 = availableWidth2 === 0 ? 0 : availableWidth2;
                                display = 'hidden';
                            }
                            $('.secondaryMeasureSum').css('width', `${availableWidth2}px`);
                            this.rootElement.select('.secondaryMeasureIndicator').style('visibility', display);
                        }
                    }

                    let pContainerDivHeight = parseFloat(this.rootElement.select('.pContainer').style('height'));
                    let summarizedDivHeight = parseFloat(this.rootElement.select('.SummarizedDivContainer').style('height'));
                    if (summarizedDivHeight < pContainerDivHeight) {
                        this.rootElement.select('.TotalText').style({ display: 'none' });
                        if (summarizedDivHeight < pContainerDivHeight / 1.2) {
                            this.rootElement.select('.SecondaryText').style({ display: 'none' });
                            if (summarizedDivHeight < pContainerDivHeight / 2) {
                                this.rootElement.select('.SecondaryValue').style({ display: 'none' });
                            } else {
                                this.rootElement.select('.SecondaryValue').style({ display: 'block' });
                            }
                        } else {
                            this.rootElement.select('.SecondaryText').style({ display: 'block' });
                        }
                    } else {
                        this.rootElement.select('.TotalText').style({ display: 'block' });
                    }
                }
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            let legendConfigs: ILegendConfig = this.getLegendSettings(this.dataViews);
            let detaillabelprop: IDetailLables = this.getDetailLable(this.dataViews);
            let summaryLabels: ISummaryLabels = this.getSummaryLabels(this.dataViews);
            let secondarySummaryLabels: ISecondarySummaryLabels = this.getSecondarySummaryLabels(this.dataViews);
            let pmIndicator: IPrimaryIndicator = this.getPrimaryIndicator(this.dataViews);
            let smIndicator: ISecondaryIndicator = this.getSecondaryIndicator(this.dataViews);
            let donutTitle: IDonutTitle = this.getDonutTitle(this.dataViews);
            let animationProps: IAnimation = this.getAnimation(this.dataViews);
            let noDataProps: INodataText = this.getNoDataText(this.dataViews);

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
                    for (let donutDataPoint of this.donutDataPoints) {
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

        private addLegendSelection() {
            let currentThis = this;
            let legends = this.rootElement.selectAll('.legendItem');
            let selectionManager = this.selectionManager;
            legends.on('click', function (d) {
                selectionManager.select(d.identity).then((ids: any[]) => {
                    function CompareIds(arcData) {
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
                    let arcs: any = currentThis.rootElement.selectAll('.arc');
                    arcs.attr('fill-opacity', (d1) => {
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
            let legendSettings: ILegendConfig = this.getLegendSettings(dataViews);
            let pmIndicatorSettings: IPrimaryIndicator = this.getPrimaryIndicator(dataViews);
            let smIndicatorSettings: ISecondaryIndicator = this.getSecondaryIndicator(dataViews);
            let primaryFormat = '';
            let secondaryFormat = '';
            let primaryFormatter;
            let secondaryFormatter;
            let primaryTooltipFormatter;
            let primaryPercentFormatter;
            let secondaryTooltipFormatter;
            if (!viewModel
                || !viewModel.legendData) {
                return;
            }
            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects
                    .getObject(this.dataView.metadata.objects, 'legend', {});
            }

            let legendData: LegendData = viewModel.legendData;
            let legendDataTorender: LegendData = {
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
                primaryFormat = dataViews.categorical.values[0].source.format ? dataViews.categorical.values[0].source.format : '';
                legendDataTorender.primaryType = legendSettings.primaryMeasure;
            }
            if (legendData.secondaryTitle) {
                legendDataTorender.secondaryTitle = legendData.secondaryTitle;
                secondaryFormat = dataViews.categorical.values[1].source.format ? dataViews.categorical.values[1].source.format : '';

                secondaryTooltipFormatter = ValueFormatter.create({
                    format: secondaryFormat,
                    precision: legendSettings.decimalPlaces
                });
            }

            for (let j = 0; j < legendData.dataPoints.length; j++) {
                let primaryData;
                let measureTooltip;
                let percentData;
                let secondaryMeasureData;
                let secondaryMeasureTooltipData;

                let primaryFormatterVal = 0;
                if (legendSettings.displayUnits === 0) {
                    let alternateFormatter = parseInt(legendData.dataPoints[j].measure, 10).toString().length;
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

                    let formattedPrimaryVal = primaryFormatter.format(legendData.dataPoints[j].measure);
                    let formattedPrimaryPercentVal = primaryPercentFormatter
                        .format((legendData.dataPoints[j].measure / viewModel.primaryMeasureSum) * 100);
                    primaryData = `${formattedPrimaryVal} ${formattedPrimaryPercentVal}%`;
                    // primaryData = primaryFormatter.format(legendData.dataPoints[j].measure) + ' '
                    //     + primaryPercentFormatter.format((legendData.dataPoints[j].measure / viewModel.primaryMeasureSum) * 100) + '%';
                    let formattedPriTooltipVal = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);
                    let formattedPriTooltipPercentVal = primaryPercentFormatter
                        .format(legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100);
                    measureTooltip = `${formattedPriTooltipVal} ${formattedPriTooltipPercentVal}%`;
                    // measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure) + ' '
                    //     + primaryPercentFormatter.format(legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100) + '%';
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
                    let secondaryFormatterVal = 0;
                    if (legendSettings.displayUnits === 0) {
                        let alternateFormatter = parseInt(legendData.dataPoints[j].secondaryMeasure, 10).toString().length;
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
                    legendDataTorender.dataPoints.push({
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: legendData.dataPoints[j].identity,
                        label: legendData.dataPoints[j].label,
                        measure: primaryData,
                        primaryIndicator: this.isPrimaryIndicator(
                            legendData.dataPoints[j].measure, dataViews, viewModel.dataPoints[j].primaryKPIValue
                        ),
                        primaryTooltip: measureTooltip,
                        secondaryIndicator: this.isSecondaryIndicator(
                            legendData.dataPoints[j].secondaryMeasure, dataViews, viewModel.dataPoints[j].secondaryKPIValue
                        ),
                        secondaryMeasure: secondaryMeasureData,
                        secondaryTooltip: secondaryMeasureTooltipData,
                        selected: false
                    });
                } else {
                    legendDataTorender.dataPoints.push({
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: legendData.dataPoints[j].identity,
                        label: legendData.dataPoints[j].label,
                        measure: primaryData,
                        primaryIndicator: this.isPrimaryIndicator(
                            legendData.dataPoints[j].measure, dataViews, viewModel.dataPoints[j].primaryKPIValue
                        ),
                        primaryTooltip: measureTooltip,
                        selected: false
                    });

                    legendValuesTorender[j] = legendValues[j];
                }
                if (this.legendObjectProperties) {
                    powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                    let legendPos = powerbi.extensibility.utils.chart.legend.legendProps.position;
                    let position: string = <string>this.legendObjectProperties[legendPos];
                    if (position) {
                        this.legend.changeOrientation(LegendPosition[position]);
                    }
                }

                this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
                powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
            }
        }

        private isPrimaryIndicator(indicatorValue, dataview, primaryKPI) {
            let isPrimaryIndicator;
            let isPercentage;
            let primaryIndicator: IPrimaryIndicator = this.getPrimaryIndicator(dataview);
            for (let val of dataview.categorical.values) {
                if (val.source.roles.hasOwnProperty('Y')) {
                    if (val.source.format && val.source.format.search('%') > 0) {
                        isPercentage = true;
                    }
                    break;
                }
            }

            if (primaryIndicator.show) {
                let thresholdValue = 0;
                if (primaryKPI) {
                    thresholdValue = parseFloat(primaryKPI);
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
            } else {
                isPrimaryIndicator = '';
            }

            return isPrimaryIndicator;
        }
        private isSecondaryIndicator(secondaryIndicator, dataview, secondaryKPI) {
            let isSecondaryIndicator: any;
            let isPercentage: any;
            let smIndicator: ISecondaryIndicator = this.getSecondaryIndicator(dataview);

            for (let val of dataview.categorical.values) {
                if (val.source.roles.hasOwnProperty('SecondaryMeasure')) {
                    if (val.source.format && val.source.format.search('%') > 0) {
                        isPercentage = true;
                    }
                    break;
                }
            }

            if (smIndicator.show) {
                let thresholdValue = 0;
                if (secondaryKPI) {
                    thresholdValue = secondaryKPI;
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
            } else {
                isSecondaryIndicator = '';
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
            let legendSetting: ILegendConfig = this.getDefaultLegendSettings(dataView);
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
            let labelSettings: IDetailLables = this.getDefaultDetailLable();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultDetailLable();
            }
            objects = dataView.metadata.objects;
            let detaillabelprop = chartProperties;
            labelSettings.show = DataViewObjects.getValue(objects, detaillabelprop.labels.show, labelSettings.show);
            labelSettings.color = DataViewObjects.getFillColor(objects, detaillabelprop.labels.color, labelSettings.color);
            labelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, detaillabelprop.labels.labelDisplayUnits, labelSettings.labelDisplayUnits);
            labelSettings.labelPrecision = DataViewObjects.getValue(
                objects, detaillabelprop.labels.labelPrecision, labelSettings.labelPrecision);
            labelSettings.labelPrecision = labelSettings.labelPrecision < 0 ?
                0 : (labelSettings.labelPrecision) > 4 ? 4 : (labelSettings.labelPrecision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, detaillabelprop.labels.fontSize, labelSettings.fontSize);
            labelSettings.labelStyle = DataViewObjects.getValue(objects, detaillabelprop.labels.labelStyle, labelSettings.labelStyle);

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
            let summaryLabelSettings: ISummaryLabels = this.getDefaultSummaryLabel();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultSummaryLabel();
            }
            objects = dataView.metadata.objects;
            let detaillabelprop = chartProperties;
            summaryLabelSettings.show = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.show, summaryLabelSettings.show);
            summaryLabelSettings.color = DataViewObjects.getFillColor(
                objects, detaillabelprop.summaryLabels.color, summaryLabelSettings.color);
            summaryLabelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, detaillabelprop.summaryLabels.labelDisplayUnits, summaryLabelSettings.labelDisplayUnits);
            summaryLabelSettings.labelPrecision = DataViewObjects.getValue(
                objects, detaillabelprop.summaryLabels.labelPrecision, summaryLabelSettings.labelPrecision);
            summaryLabelSettings.labelPrecision = summaryLabelSettings.labelPrecision < 0 ?
                0 : (summaryLabelSettings.labelPrecision) > 4 ? 4 : (summaryLabelSettings.labelPrecision);
            summaryLabelSettings.fontSize = DataViewObjects.getValue(
                objects, detaillabelprop.summaryLabels.fontSize, summaryLabelSettings.fontSize);
            summaryLabelSettings.text = DataViewObjects.getValue(
                objects, detaillabelprop.summaryLabels.text, summaryLabelSettings.text);

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
            let secondarySummaryLabelSettings: ISecondarySummaryLabels = this.getDefaultSecondarySummaryLabel();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return this.getDefaultSecondarySummaryLabel();
            }
            objects = dataView.metadata.objects;
            let detaillabelprop = chartProperties.secondarySummaryLabels;
            secondarySummaryLabelSettings.color = DataViewObjects.getFillColor(
                objects, detaillabelprop.color, secondarySummaryLabelSettings.color);
            secondarySummaryLabelSettings.labelDisplayUnits = DataViewObjects.getValue(
                objects, detaillabelprop.labelDisplayUnits, secondarySummaryLabelSettings.labelDisplayUnits);
            secondarySummaryLabelSettings.labelPrecision = DataViewObjects.getValue(
                objects, detaillabelprop.labelPrecision, secondarySummaryLabelSettings.labelPrecision);
            secondarySummaryLabelSettings.labelPrecision = secondarySummaryLabelSettings.labelPrecision < 0 ?
                0 : (secondarySummaryLabelSettings.labelPrecision) > 4 ?
                    4 : (secondarySummaryLabelSettings.labelPrecision);
            secondarySummaryLabelSettings.fontSize = DataViewObjects.getValue(
                objects, detaillabelprop.fontSize, secondarySummaryLabelSettings.fontSize);

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
            let primaryIndicatorSettings: IPrimaryIndicator = this.getDefaultPrimaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return primaryIndicatorSettings;
            }
            objects = dataView.metadata.objects;
            let chartIndicatorProp = chartProperties.indicators;
            primaryIndicatorSettings.show = DataViewObjects.getValue(objects, chartIndicatorProp.show, primaryIndicatorSettings.show);
            primaryIndicatorSettings.signIndicator = DataViewObjects.getValue(
                objects, chartIndicatorProp.primaryMeasure, primaryIndicatorSettings.signIndicator);
            if (!primaryIndicatorSettings.signIndicator) {
                primaryIndicatorSettings.threshold = DataViewObjects.getValue(
                    objects, chartIndicatorProp.threshold, primaryIndicatorSettings.threshold);
                primaryIndicatorSettings.totalThreshold = DataViewObjects.getValue(
                    objects, chartIndicatorProp.totalThreshold, primaryIndicatorSettings.totalThreshold);
            }
            primaryIndicatorSettings.upArrow = DataViewObjects.getFillColor(
                objects, chartIndicatorProp.upArrow, primaryIndicatorSettings.upArrow);
            primaryIndicatorSettings.downArrow = DataViewObjects.getFillColor(
                objects, chartIndicatorProp.downArrow, primaryIndicatorSettings.downArrow);

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
            let secIndicatorSettings: ISecondaryIndicator = this.getDefaultSecondaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return secIndicatorSettings;
            }
            objects = dataView.metadata.objects;
            let chartIndicatorProp = chartProperties.smIndicator;
            secIndicatorSettings.show = DataViewObjects
                .getValue(objects, chartIndicatorProp.show, secIndicatorSettings.show);
            secIndicatorSettings.signIndicator = DataViewObjects
                .getValue(objects, chartIndicatorProp.secondaryMeasure, secIndicatorSettings.signIndicator);
            if (!secIndicatorSettings.signIndicator) {
                secIndicatorSettings.threshold = DataViewObjects
                    .getValue(objects, chartIndicatorProp.threshold, secIndicatorSettings.threshold);
                secIndicatorSettings.totalThreshold = DataViewObjects
                    .getValue(objects, chartIndicatorProp.totalThreshold, secIndicatorSettings.totalThreshold);
            }
            secIndicatorSettings.upArrow = DataViewObjects.getFillColor(objects, chartIndicatorProp.upArrow, secIndicatorSettings.upArrow);
            secIndicatorSettings.downArrow = DataViewObjects
                .getFillColor(objects, chartIndicatorProp.downArrow, secIndicatorSettings.downArrow);

            return secIndicatorSettings;
        }

        private getDefaultDonutTitle(dataView: DataView): IDonutTitle {
            let titleText = '';
            if (dataView && dataView.categorical) {
                if (dataView.categorical.values && dataView.categorical.values[0] && dataView.categorical.values[0].values) {
                    titleText += dataView.categorical.values[0].source.displayName;
                }
                if (dataView.categorical.categories && dataView.categorical.categories[0] && dataView.categorical.categories[0].values) {
                    let displayName = dataView.categorical.categories[0].source.displayName;
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
            let donutTitleSettings: IDonutTitle = this.getDefaultDonutTitle(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) {
                return donutTitleSettings;
            }
            objects = dataView.metadata.objects;
            let chartIndicatorProp = chartProperties.donutTitle;
            donutTitleSettings.show = DataViewObjects.getValue(objects, chartIndicatorProp.show, donutTitleSettings.show);
            donutTitleSettings.titleText = DataViewObjects.getValue(objects, chartIndicatorProp.titleText, donutTitleSettings.titleText);
            donutTitleSettings.fill1 = DataViewObjects.getFillColor(objects, chartIndicatorProp.fill1, donutTitleSettings.fill1);
            donutTitleSettings.fontSize = DataViewObjects.getValue(objects, chartIndicatorProp.fontSize, donutTitleSettings.fontSize);
            donutTitleSettings.backgroundColor = DataViewObjects.getFillColor(
                objects, chartIndicatorProp.backgroundColor, donutTitleSettings.backgroundColor);
            donutTitleSettings.tooltipText = DataViewObjects.getValue(
                objects, chartIndicatorProp.tooltipText, donutTitleSettings.tooltipText);

            return donutTitleSettings;
        }

        private getDefaultAnimation(): IAnimation {

            return {
                show: false
            };
        }

        private getAnimation(dataView: DataView): IAnimation {
            let objects: DataViewObjects = null;
            let animationSettings: IAnimation = this.getDefaultAnimation();
            if (!dataView.metadata || !dataView.metadata.objects) {

                return animationSettings;
            }
            objects = dataView.metadata.objects;
            let chartIndicatorProp = chartProperties.animation;
            animationSettings.show = DataViewObjects.getValue(objects, chartIndicatorProp.show, animationSettings.show);

            return animationSettings;
        }

        private getDefaultNoDataText(): INodataText {

            return {
                textMessage: ''
            };
        }

        private getNoDataText(dataView: DataView): INodataText {
            let objects: DataViewObjects = null;
            let textMessage: INodataText = this.getDefaultNoDataText();
            if (!dataView.metadata || !dataView.metadata.objects) {

                return textMessage;
            }
            objects = dataView.metadata.objects;
            let chartIndicatorProp = chartProperties.nodatatext;
            textMessage.textMessage = DataViewObjects.getValue(objects, chartIndicatorProp.textMessage, textMessage.textMessage);

            return textMessage;
        }

        private getDecimalPlacesCount(value: number): number {
            let decimalPlacesCount: number = 0;
            if (value) {
                let valArr = value.toString().split('.');
                if (valArr[1]) {
                    decimalPlacesCount = valArr[1].length > 4 ? 4 : valArr[1].length;
                }
            }

            return decimalPlacesCount;
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let tooltipDataPointsFinal: VisualTooltipDataItem[] = [];
            let tooltipDataPoints = value.data.tooltipData;
            let tooltipDataSize = tooltipDataPoints.length;
            let i = 0;
            for (; i < tooltipDataSize; i++) {
                let tooltipData: VisualTooltipDataItem = {
                    displayName: '',
                    value: ''
                };
                tooltipData.displayName = tooltipDataPoints[i].name;
                let decimalPlaces: number = this.getDecimalPlacesCount(tooltipDataPoints[i].value);
                let formattingString = tooltipDataPoints[i].formatter
                    ? tooltipDataPoints[i].formatter : ValueFormatter.DefaultNumericFormat;
                let formatter = ValueFormatter.create({
                    format: formattingString,
                    value: 0,
                    precision: decimalPlaces
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
