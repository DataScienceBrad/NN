module powerbi.extensibility.visual {
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import Selection = d3.Selection;
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import Legend = powerbi.extensibility.utils.chart.legend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import SVGUtil = powerbi.extensibility.utils.svg;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export class LegendSettings {
        public show: boolean = false;
        public position: string = 'Right';
        public showTitle: boolean = false;
        public titleText: string = '';
        public labelColor: string = '#000000';
        public fontSize: number = 8;
    }
    export interface IProgressIndicatorValues {
        actual: number;
        target: number;
        ringWidth: number;
        actualColor: string;
        targetColor: string;
        isPie: boolean;
        toolTipInfo: ITooltipDataItem[];
        toolTipColumn: ITooltipDataItem[];
        actualFormat: string;
        targetFormat: string;
        targetTooltip: number;
    }
    export class CircularGaugeSettings extends DataViewObjectsParser {
        public legend: LegendSettings = new LegendSettings();
    }
    export interface ICircularGaugeViewModel {
        dataView: DataView;
        settings: CircularGaugeSettings;
        legendData: LegendData;
    }
    interface ICardFormatSetting {
        showTitle: boolean;
        textSize: number;
        labelSettings: {
            show: boolean | void,
            precision: number,
            labelColor: string,
            fontSize: number
        };
        wordWrap: boolean;
    }

    module Selectors {
        export const className: ClassAndSelector = createClassAndSelector('circularGauge');
        export const chart: ClassAndSelector = createClassAndSelector('chart');
        export const chartLine: ClassAndSelector = createClassAndSelector('chart-line');
        export const label: ClassAndSelector = createClassAndSelector('label');
        export const legendItems: ClassAndSelector = createClassAndSelector('legendItem');
        export const legendTitle: ClassAndSelector = createClassAndSelector('legendTitle');
    }

    //object variable which we used in customized color and text through UI options
    export let progressIndicatorProps: {
        general: {
            ActualFillColor: DataViewObjectPropertyIdentifier;
            ComparisonFillColor: DataViewObjectPropertyIdentifier;
        };
        custom: {
            show: {
                objectName: string;
                propertyName: string;
            };
            ringWidth: {
                objectName: string;
                propertyName: string;
            };
        };
        labels: {
            color: DataViewObjectPropertyIdentifier;
            labelPrecision: {
                objectName: string;
                propertyName: string;
            };
            fontSize: {
                objectName: string;
                propertyName: string;
            };
        };
        legend: {
            labelColor: DataViewObjectPropertyIdentifier;
            FillColor1: DataViewObjectPropertyIdentifier;
            FillColor2: DataViewObjectPropertyIdentifier;
            FillColor3: DataViewObjectPropertyIdentifier;
            FillColor4: DataViewObjectPropertyIdentifier;
        };
    } = {
        general: {
            ActualFillColor: <DataViewObjectPropertyIdentifier>{
                objectName: 'general',
                propertyName: 'ActualFillColor'
            },
            ComparisonFillColor: <DataViewObjectPropertyIdentifier>{
                objectName: 'general',
                propertyName: 'ComparisonFillColor'
            }
        },
        custom: {
            show: {
                objectName: 'custom',
                propertyName: 'show'
            },
            ringWidth: {
                objectName: 'custom',
                propertyName: 'ringWidth'
            }
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'colors'
            },
            labelPrecision: {
                objectName: 'labels',
                propertyName: 'labelPrecision'
            },
            fontSize: {
                objectName: 'labels',
                propertyName: 'fontSize'
            }
        },
        legend: {
            labelColor: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'labelColor'
            },
            FillColor1: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'value1'
            },
            FillColor2: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'value2'
            },
            FillColor3: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'value3'
            },
            FillColor4: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'value4'
            }
        }
    };
    //Visual
    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }
    export interface IRange {
        range1: number;
        value1: string;
        range2: number;
        value2: string;
        range3: number;
        value3: string;
        range4: number;
        value4: string;
    }
    export class CircularGauge implements IVisual {
        //Variables
        public canvas: d3.Selection<SVGElement>;
        public group: d3.Selection<SVGElement>;
        public groupInner: d3.Selection<SVGElement>;
        public dataView: DataView;
        public data: IProgressIndicatorValues;
        public toolTipData: ITooltipDataItem[];
        public range: IRange;
        private viewport: IViewport;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private svg: d3.Selection<SVGElement>;
        private root: d3.Selection<SVGElement>;
        private percentage: string;
        private cardFormatSetting: ICardFormatSetting;
        private container: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private prevDataViewObjects: DataViewObjects = {};
        private settings: {
            colors: string,
            labelPrecision: number,
            fontSize: number
        };
        private legend: ILegend;
        private interactivityService: IInteractivityService;
        private isInteractiveChart: boolean = false;
        private viewModel: ICircularGaugeViewModel;
        private body: Selection<{}>;
        private h1: number;
        private h2: number;
        private h3: number;
        private h4: number;
        private showLegend: boolean = false;
        //One time setup
        //First time it will be called and made the structure of your visual
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.svg = this.root.append('svg')
                .classed('circularSVG', true)
                .style('overflow', 'visible');
            this.container = this.svg.append('g');
            this.group = this.container.append('g');
            this.group.append('path').attr('id', 'a123');
            this.groupInner = this.container.append('g');
            this.groupInner.append('path').attr('id', 'a1234');
            this.groupInner.append('text');
            this.groupInner.append('line').attr('id', 'line1');
            this.groupInner.append('line').attr('id', 'line2');

            this.body = d3.select(options.element)
                .style({
                    cursor: 'default'
                });
            this.legend = createLegend(
                $(options.element),
                this.isInteractiveChart,
                this.interactivityService,
                true,
                null
            );
        }//Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): IProgressIndicatorValues {
            const data: IProgressIndicatorValues = CircularGauge.getDefaultData();
            if (dataView && dataView.categorical) {
                const len: number = dataView.table.rows[0].length;
                let iCount: number;
                let toolTipCount: number = 0;
                for (iCount = 0; iCount < len; iCount++) {
                    if (dataView.metadata.columns[iCount].roles.hasOwnProperty('ActualValue')) {
                        data.actual = <number>dataView.table.rows[0][iCount];
                        data.actualFormat = ((dataView.metadata.columns[iCount].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                    if (dataView.metadata.columns[iCount].roles.hasOwnProperty('TargetValue')) {
                        data.targetTooltip = data.target = <number>dataView.table.rows[0][iCount];
                        data.targetFormat = ((dataView.metadata.columns[iCount].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                    if (dataView.metadata.columns[iCount].roles.hasOwnProperty('Tooltip')) {
                        data.toolTipColumn[toolTipCount] = {
                            displayName: <string>dataView.metadata.columns[iCount].displayName,
                            value: <string>dataView.table.rows[0][iCount]
                        };
                        toolTipCount++;
                    }
                }
                if (data.target === -1) {
                    data.target = data.actual;
                    data.targetTooltip = 0;
                }

            }

            return data; //Data object we are returning here to the update function
        }
        public static getDefaultData(): IProgressIndicatorValues {
            return {
                actual: 0,
                target: -1,
                ringWidth: 20,
                actualColor: '#374649',
                targetColor: '#01B8AA',
                isPie: true,
                toolTipInfo: [],
                toolTipColumn: [],
                actualFormat: '',
                targetFormat: '',
                targetTooltip: 0
            };
        }
        private static getFill(dataView: DataView, key: string): Fill {
            if (dataView) {
                const objects: DataViewObjects = dataView.metadata.objects;
                if (objects) {
                    const generalText: string = 'general';
                    const dataColors: DataViewPropertyValue = objects[generalText];
                    if (dataColors) {
                        const fill: Fill = <Fill>dataColors[key];
                        if (fill) {
                            return fill;
                        }
                    }
                    const legendText: string = 'legend';
                    const legend: DataViewPropertyValue = objects[legendText];
                    if (legend) {
                        const fill: Fill = <Fill>legend[key];
                        if (fill) {
                            return fill;
                        }
                    }
                }
            }
            switch (key) {
                case 'value1':
                    return { solid: { color: '#01B8AA' } };
                case 'value2':
                    return { solid: { color: '#D73411' } };
                case 'value3':
                    return { solid: { color: '#E57518' } };
                case 'value4':
                    return { solid: { color: '#FAE320' } };
                case 'ComparisonFillColor':
                    return { solid: { color: '#01B8AA' } };
                case 'ActualFillColor':
                    return { solid: { color: '#374649' } };
                default:
                    return { solid: { color: '#D0EEF7' } };
            }
        }

        private static getValue<T>(dataView: DataView, objectName: string, key: string, defaultValue: T): T {
            if (dataView) {
                const objects: DataViewObjects = dataView.metadata.objects;
                if (objects) {
                    const config: DataViewObject = objects[objectName];
                    if (config) {
                        const size: T = <T>config[key];
                        if (size != null) {
                            return size;
                        }
                    }
                }
            }

            return defaultValue;
        }
        private static getLegendValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                const objects: DataViewObjects = dataView.metadata.objects;
                if (objects) {
                    const legendText: string = 'legend';
                    const legend: DataViewObject = objects[legendText];
                    if (legend) {
                        const value: T = <T>legend[key];
                        if (value != null) {
                            return value;
                        }
                    }
                }
            }

            return defaultValue;
        }

        //Drawing the visual
        public update(options: VisualUpdateOptions): void {
            this.viewport = options.viewport;
            const dataView: DataView = this.dataView = options.dataViews[0];
            const data2: IProgressIndicatorValues = this.data = CircularGauge.converter(dataView); //calling Converter function
            this.svg
                .selectAll('.legend #legendGroup .legendItem, .legend #legendGroup .legendTitle, .legend #legendGroup .naletrow')
                .empty();
            const data: number = data2.actual;
            const max: number = data2.target;
            $('.errmsg').remove();
            let checkActual: boolean = false;
            if (dataView && dataView.categorical) {
                for (let i: number = 0; i < dataView.metadata.columns.length; i++) {
                    if (options.dataViews[0].metadata.columns[i].roles.hasOwnProperty('ActualValue')) {
                        checkActual = true;
                    }
                }
                if (!checkActual) {
                    this.showMsg('Please select "Actual value" field', 180);

                    return;
                } else {
                    $('#line1').attr('display', 'visible');
                    $('#line2').attr('display', 'visible');
                }
            }

            if (data < 0 || max < 0) {
                this.showMsg('Negative values are not supported.', 250);

                return;
            }
            if (typeof (data) === 'object' || typeof (max) === 'object') {
                this.showMsg('Data format is not supported.', 170);

                return;
            }
            const viewport: IViewport = options.viewport;
            const settingsChanged: boolean = this.getSettings(dataView.metadata.objects);
            this.cardFormatSetting = this.getDefaultFormatSettings();
            let labelSettings: {
                show: boolean | void,
                precision: number,
                labelColor: string,
                fontSize: number
            } = null;
            let objects: DataViewObjects = null;
            let showDataLabel: boolean = true;
            if (this.dataView && this.dataView.metadata) {
                objects = this.dataView.metadata.objects;
            }
            if (objects) {
                labelSettings = this.cardFormatSetting.labelSettings;
                labelSettings.labelColor = DataViewObjects
                    .getFillColor(objects, progressIndicatorProps.labels.color, labelSettings.labelColor);
                labelSettings.precision = DataViewObjects
                    .getValue(objects, progressIndicatorProps.labels.labelPrecision, labelSettings.precision);
                // The precision can't go below 0
                if (labelSettings.precision != null) {
                    this.cardFormatSetting.labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                }
                this.data.isPie = DataViewObjects
                    .getValue(objects, progressIndicatorProps.custom.show, this.data.isPie);
                this.data.ringWidth = DataViewObjects
                    .getValue(objects, progressIndicatorProps.custom.ringWidth, this.data.ringWidth);
                this.cardFormatSetting.labelSettings.fontSize = DataViewObjects
                    .getValue(objects, progressIndicatorProps.labels.fontSize, labelSettings.fontSize);
                const label: string = 'labels';
                const show: string = 'show';
                const legendText: string = 'legend';
                const labels: DataViewObject = dataView.metadata.objects[label];
                if (labels) {
                    if (labels[show] != null) {
                        showDataLabel = <boolean>labels[show];
                    }
                }
                const legend: DataViewObject = dataView.metadata.objects[legendText];
                if (legend) {
                    if (legend[show] != null) {
                        this.showLegend = <boolean>legend[show];
                    }
                }
            }

            let percentCompleted: number = (data2.actual / max);
            percentCompleted = isNaN(percentCompleted) ||
                 !isFinite(percentCompleted) ?
                ((data2.actual > max) ? 1 : 0) : (percentCompleted > 1) ? 1 : ((percentCompleted < 0) ? 0 : percentCompleted);

            this.cardFormatSetting
                .labelSettings
                .precision = this.cardFormatSetting.labelSettings.precision < 4 ? this.cardFormatSetting.labelSettings.precision : 4;
            if (this.cardFormatSetting.labelSettings.precision > 4) {
                this.cardFormatSetting.labelSettings.precision = 0;
            }
            this.settings.labelPrecision = this.cardFormatSetting.labelSettings.precision;
            const percentage: string = (percentCompleted * 100).toFixed(this.cardFormatSetting.labelSettings.precision);
            const fontSize: number = this.cardFormatSetting.labelSettings.fontSize;
            let textProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                text: `${percentage}%`,
                fontFamily: 'sans-serif',
                fontSize: `${((4 / 3) * fontSize)}px`
                //fontSize: fontSize + 'pt'
            };
            const textWidth: number = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
            const textHeight: number = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextHeight(textProperties);

            const settings: CircularGaugeSettings = CircularGaugeSettings.parse<CircularGaugeSettings>(dataView);

            //By default, only category-1
            this.range = {
                range1: 0,
                value1: CircularGauge.getFill(this.dataView, 'value1').solid.color,
                range2: 0,
                value2: CircularGauge.getFill(this.dataView, 'value2').solid.color,
                range3: 0,
                value3: CircularGauge.getFill(this.dataView, 'value3').solid.color,
                range4: 0,
                value4: CircularGauge.getFill(this.dataView, 'value4').solid.color
            };

            this.data.actualColor = CircularGauge.getFill(this.dataView, 'ActualFillColor').solid.color;
            this.data.targetColor = CircularGauge.getFill(this.dataView, 'ComparisonFillColor').solid.color;

            this.range.range1 = CircularGauge.getValue(this.dataView, 'legend', 'range1', null);
            if (this.range.range1 !== null && this.range.range1 >= 100 || this.range.range1 <= 0) {
                this.range.range1 = null;
            }
            this.range.range2 = CircularGauge.getValue(this.dataView, 'legend', 'range2', null);
            if (this.range.range1 === null && this.range.range2 !== null) {
                this.range.range2 = null;
            } else if (this.range.range2 <= this.range.range1 || this.range.range2 > 100) {
                this.range.range2 = null;
            }

            this.range.range3 = CircularGauge.getValue(this.dataView, 'legend', 'range3', null);
            if (this.range.range2 === null && this.range.range3 !== null) {
                this.range.range3 = null;
            } else if (this.range.range3 <= this.range.range2 || this.range.range3 > 100) {
                this.range.range3 = null;
            }

            //Category-4, being the last category, always ends at maximum value
            this.range.range4 = 100;

            const xnum: number = this.range.range4;
            const legendData: Legend.LegendData = this.createLegendData(this.dataView, this.host, settings);
            this.viewModel = {
                dataView: this.dataView,
                settings: settings,
                legendData: legendData
            };

            let height: number = viewport.height;
            let width: number = viewport.width;
            this.svg.attr('width', `${width}px`);
            this.svg.attr('height', `${height}px`);
            this.renderLegend();

            for (let i: number = 0; i < legendData.dataPoints.length; i++) {
                if (i === 0) {
                    if (parseInt(percentage, 10) >= 0 && parseInt(percentage, 10) <= this.h1) {
                        this.data.targetColor = this.range.value1;
                    }
                } else if (i === 1) {
                    if (parseInt(percentage, 10) > this.h1 && parseInt(percentage, 10) <= this.h2) {
                        this.data.targetColor = this.range.value2;
                    }
                } else if (i === 2) {
                    if (parseInt(percentage, 10) > this.h2 && parseInt(percentage, 10) <= this.h3) {
                        this.data.targetColor = this.range.value3;
                    }
                } else if (i === 3) {
                    if (parseInt(percentage, 10) > this.h3 && parseInt(percentage, 10) <= this.h4) {
                        this.data.targetColor = this.range.value4;
                    }
                }
            }
            height = viewport.height;
            width = viewport.width;
            this.svg.attr('width', width)
                .attr('height', height);
            this.data.actualColor = powerbi.extensibility.utils.dataview.DataViewObjects
                .getFillColor(objects, progressIndicatorProps.general.ActualFillColor, this.data.actualColor);
            if (!this.showLegend) {
                this.data.targetColor = powerbi.extensibility.utils.dataview.DataViewObjects
                    .getFillColor(objects, progressIndicatorProps.general.ComparisonFillColor, '#01B8AA');
            }
            let outerRadius: number = ((((width / 2) - (textWidth + 17)) <
            ((height / 2) - (textHeight)) ? ((width / 2) - (textWidth + 17)) : ((height / 2) - (textHeight))));

            outerRadius = outerRadius - (outerRadius * 0.1);
            let innerRadius: number;
            this.data.ringWidth = this.data.ringWidth < 1 ? 1 : this.data.ringWidth;
            innerRadius = outerRadius - this.data.ringWidth;
            // tslint:disable-next-line:no-any
            let arc: any;
            // tslint:disable-next-line:no-any
            let arc1: any;
            let dataLabelText: string = `${percentage}%`;
            const dataLabelStyle: string = CircularGauge.getValue<string>(dataView, 'labels', 'labelStyle', 'Percentage');
            let index: number;
            for (let i: number = 0; i < options.dataViews[0].metadata.columns.length; i++) {
                if (options.dataViews[0].metadata.columns[i].roles.hasOwnProperty('ActualValue')) {
                    index = i;
                }
            }
            let precision: number = DataViewObjects
                .getValue(
                    this.dataView.metadata.objects,
                    progressIndicatorProps.labels.labelPrecision,
                    this.cardFormatSetting.labelSettings.precision);
            precision = precision < 5 ? precision : 5;
            const dataCopy: string = this.formatValues(data, CircularGauge.getValue<string>(dataView, 'labels', 'labelUnit', 'Auto'));
            const iValueFormatter: IValueFormatter = valueFormatter.create({ format: options.dataViews[0].metadata.columns[index].format });
            const dataCopy1: string = iValueFormatter.format(data);
            let tooltipText: string;
            switch (dataLabelStyle) {
                case 'Percentage':
                    dataLabelText = `${percentage}%`;
                    tooltipText = `${percentage}%`;
                    break;
                case 'Category':
                    dataLabelText = options.dataViews[0].metadata.columns[0].displayName;
                    tooltipText = options.dataViews[0].metadata.columns[0].displayName;
                    break;
                case 'DataValue':
                    dataLabelText = dataCopy;
                    tooltipText = dataCopy1;
                    break;
                case 'DatavaluePercentage':
                    dataLabelText = `${dataCopy},${percentage}%`;
                    tooltipText = `${dataCopy1},${percentage}%`;
                    break;
                case 'CategoryDatavalue':
                    dataLabelText = `${options.dataViews[0].metadata.columns[0].displayName}, ${dataCopy}`;
                    tooltipText = `${options.dataViews[0].metadata.columns[0].displayName}, ${dataCopy1}`;
                    break;
                case 'CategoryPercentage':
                    dataLabelText = `${options.dataViews[0].metadata.columns[0].displayName}, ${percentage}%`;
                    tooltipText = `${options.dataViews[0].metadata.columns[0].displayName}, ${percentage}%`;
                    break;
                case 'All':
                    dataLabelText = `${options.dataViews[0].metadata.columns[0].displayName}, ${dataCopy}, ${percentage}%`;
                    tooltipText = `${options.dataViews[0].metadata.columns[0].displayName}, ${dataCopy1}, ${percentage}%`;
                    break;
                default:
            }
            textProperties = {
                text: dataLabelText,
                fontFamily: 'sans-serif',
                fontSize: `${((4 / 3) * fontSize)}px`
            };
            const fTextWidth: number = textMeasurementService.measureSvgTextWidth(textProperties);
            const iTextHeight: number = textMeasurementService.measureSvgTextHeight(textProperties);
            const spaceAvailable: number = viewport.width / 2 - outerRadius * 1.1;
            const iNumofChars: number = dataLabelText.length;
            const fCharSpace: number = fTextWidth / iNumofChars;
            const iNumofCharsAllowed: number = spaceAvailable / fCharSpace;
            let sTextNew: string = dataLabelText;
            if (iNumofCharsAllowed <= iNumofChars) {
                sTextNew = `${dataLabelText.substring(0, iNumofCharsAllowed - 2)}...`;
            }
            const textPropertiesNew: TextProperties = {
                text: sTextNew,
                fontFamily: 'Segoe UI',
                fontSize: `${((4 / 3) * fontSize)}px`
            };
            const fTextWidthNew: number = textMeasurementService.measureSvgTextWidth(textPropertiesNew);
            const iTextHeightNew: number = textMeasurementService.measureSvgTextHeight(textPropertiesNew);
            if (innerRadius > 0.5 && showDataLabel && iNumofCharsAllowed >= 3) {
                if (!this.data.isPie) {
                    innerRadius = 0;
                }
                arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(2 * Math.PI * percentCompleted)
                    .endAngle(2 * Math.PI);
                arc1 = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI * percentCompleted);
                this.group.select('#a123')
                    .attr('d', arc)
                    .attr('fill', this.data.actualColor);
                this.groupInner.select('#a1234')
                    .attr('d', arc1)
                    .attr('fill', this.data.targetColor);
                const c: number[] = arc1.centroid(2 * Math.PI);
                const x: number = c[0];
                const y: number = c[1];
                // pythagorean theorem for hypotenuse
                const h: number = Math.sqrt(x * x + y * y);
                let y1: number;
                if (percentCompleted > 0.5) {
                    y1 = (((y / h) * outerRadius * 1.1) + (textHeight / 3));
                } else {
                    y1 = ((y / h) * outerRadius * 1.1) + (textHeight / 3);
                }
                this.groupInner
                    .select('text')
                    .attr('x', ((x / h) * outerRadius * 1.1) + 17)
                    .attr('y', y1)
                    .attr('text-anchor', 'start')
                    .attr('font-size', `${fontSize}pt`)
                    .text(sTextNew)
                    .attr('fill', this.cardFormatSetting.labelSettings.labelColor)
                    .append('text:title')
                    .text(tooltipText);

                this.groupInner.select('line#line1')
                    .attr('x1', (x / h) * outerRadius * 1.02)
                    .attr('y1', (y / h) * outerRadius * 1.02)
                    .attr('x2', ((x / h) * outerRadius * 1.1))
                    .attr('y2', (y / h) * outerRadius * 1.1)
                    .attr('style', 'stroke:#DDDDDD;stroke-width:1');
                this.groupInner.select('line#line2')
                    .attr('x1', (x / h) * outerRadius * 1.1)
                    .attr('y1', (y / h) * outerRadius * 1.1)
                    .attr('x2', ((x / h) * outerRadius * 1.1) + 15)
                    .attr('y2', (y / h) * outerRadius * 1.1)
                    .attr('style', 'stroke:#DDDDDD;stroke-width:1');
                if (percentCompleted < 0.10 || percentCompleted > 0.90) {
                    this.groupInner.select('text').attr('x', ((x / h) * outerRadius * 1.1) + 39);
                    this.groupInner.select('line#line2').attr('x2', ((x / h) * outerRadius * 1.1) + 35);
                }
            } else {
                outerRadius = (width / 2) < (height / 2) ? width / 2 : height / 2;
                outerRadius = outerRadius - (outerRadius * 0.1);
                if (this.data.isPie) {
                    this.data.ringWidth = this.data.ringWidth < 15 ? 15 : this.data.ringWidth;
                    innerRadius = outerRadius - this.data.ringWidth;
                } else {
                    innerRadius = 0;
                }
                arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(2 * Math.PI * percentCompleted)
                    .endAngle(2 * Math.PI);
                arc1 = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI * percentCompleted);
                this.group.select('#a123')
                    .attr('d', arc)
                    .attr('fill', this.data.actualColor);
                this.groupInner.select('#a1234')
                    .attr('d', arc1)
                    .attr('fill', this.data.targetColor);
                this.groupInner
                    .select('text')
                    .attr('font-size', 0);
                this.groupInner.select('line#line1')
                    .attr('style', 'stroke-width:0');
                this.groupInner.select('line#line2')
                    .attr('style', 'stroke-width:0');
            }
            this.group.select('#a123')
                .attr('fill', this.data.actualColor)
                .on('mouseover', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius * 1.08)
                            .startAngle(2 * Math.PI * percentCompleted)
                            .endAngle(2 * Math.PI));
                })
                .on('mouseout', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', arc);
                });

            this.groupInner.select('#a1234')
                .attr('fill', this.data.targetColor)
                .on('mouseover', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius * 1.08)
                            .startAngle(0)
                            .endAngle(2 * Math.PI * percentCompleted));
                })
                .on('mouseout', function (): void {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr('d', arc1);
                });

            this.group.attr('transform', `translate(${(width / 2)},${(height / 2)})`);
            this.groupInner.attr('transform', `translate(${(width / 2)},${(height / 2)})`);
            let actualIndex: number;
            let targetIndex: number;
            for (let i: number = 0; i < options.dataViews[0].metadata.columns.length; i++) {
                if (options.dataViews[0].metadata.columns[i].roles.hasOwnProperty('ActualValue')) {
                    actualIndex = i;
                } else {
                    targetIndex = i;
                }
            }
            const tValueFormatter: IValueFormatter = valueFormatter
                .create({ format: options.dataViews[0].metadata.columns[targetIndex].format });
            const target1: string = tValueFormatter.format(this.data.targetTooltip);
            this.data.toolTipInfo[0] = {
                displayName: 'Target',
                value: target1
            };
            let aValueFormatter: IValueFormatter = valueFormatter.create({ format: options.dataViews[0].metadata.columns[index].format });
            const actual1: string = aValueFormatter.format(data);
            this.data.toolTipInfo[1] = {
                displayName: 'Actual',
                value: actual1
            };
            this.data.toolTipInfo[2] = {
                displayName: 'Percentage Remaining',
                value: `${(100 - parseFloat(percentage))}%`
            };
            this.data.toolTipInfo[3] = {
                displayName: 'Percentage Completed',
                value: `${(parseFloat(percentage))}%`
            };
            const len: number = this.data.toolTipColumn.length;
            let iCount: number = 0;
            const tooltipIndexes: number[] = [];
            for (let i: number = 0; i < dataView.metadata.columns.length; i++) {
                if (dataView.metadata.columns[i].roles.hasOwnProperty('Tooltip')) {
                    tooltipIndexes.push(i);
                }
            }
            while (iCount < len) {
                aValueFormatter = valueFormatter
                    .create({ format: options.dataViews[0].metadata.columns[tooltipIndexes[iCount]].format });
                const tooltipVal: string = aValueFormatter.format(this.data.toolTipColumn[iCount].value);
                this.data.toolTipInfo[iCount + 4] = {
                    displayName: this.data.toolTipColumn[iCount].displayName,
                    value: tooltipVal
                };
                iCount++;
            }

            this.tooltipServiceWrapper
                .addTooltip(
                    this.container.selectAll('path#a123'),
                    (tooltipEvent: TooltipEventArgs<number>) => this.data.toolTipInfo,
                    (tooltipEvent: TooltipEventArgs<number>) => null);

            this.tooltipServiceWrapper
                .addTooltip(
                    this.container.selectAll('path#a1234'),
                    (tooltipEvent: TooltipEventArgs<number>) => this.data.toolTipInfo,
                    (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        public getDefaultFormatSettings(): ICardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettings(true, this.settings.colors, 0),
                wordWrap: false
            };
        }
        public getDefaultLabelSettings(show: void | boolean, labelColor: string, labelPrecision : number): {
                show: boolean | void,
                precision: number,
                labelColor: string,
                fontSize: number
            } {
            const defaultLabelPrecision: number = 0;
            const defaultLabelColor: string = '#777777';
            if (show === void 0) {
                show = false;
            }
            const fontSize: number = 9;

            return {
                show: show,
                precision: labelPrecision || defaultLabelPrecision,
                labelColor: labelColor || defaultLabelColor,
                fontSize: fontSize
            };
        }

        public renderLegend(): void {
            if (!this.viewModel) {
                return;
            }
            if (!this.viewModel.legendData) {
                return;
            }
            const position: LegendPosition = this.viewModel.settings.legend.show
                ? LegendPosition[this.viewModel.settings.legend.position]
                : LegendPosition.None;
            this.legend.changeOrientation(position);

            this.legend.drawLegend(this.viewModel.legendData, _.clone(this.viewport));
            Legend.positionChartArea(this.svg, this.legend);
            this.svg.style('margin', 0);
            switch (this.legend.getOrientation()) {
                case LegendPosition.Left:
                case LegendPosition.LeftCenter:
                    this.svg.style('margin-left', `${parseInt($('.legend').css('width'), 10)}px`);
                case LegendPosition.Right:
                case LegendPosition.RightCenter:
                    this.viewport.width -= this.legend.getMargins().width;
                    break;
                case LegendPosition.Top:
                case LegendPosition.TopCenter:
                    this.svg.style('margin-top', `${parseInt($('.legend').css('height'), 10)}px`);
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter:
                    this.viewport.height -= 1.9 * this.legend.getMargins().height;
                    break;
                default:
            }
        }

        public getSettings(objects: DataViewObjects): boolean {
            let settingsChanged: boolean = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    colors: getValue(objects, 'labels', 'colors', 'grey'), // The color of the outer circle.
                    labelPrecision: getValue<number>(objects, 'labels', 'labelPrecision', 0),
                    fontSize: getValue<number>(objects, 'labels', 'fontSize', 15)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const enumeration: VisualObjectInstance[] = [];
            const a: IProgressIndicatorValues = CircularGauge.getDefaultData();
            const dataView: DataView = this.dataView;
            if (!this.data) {
                this.data = CircularGauge.getDefaultData();
            }
            if (!this.cardFormatSetting) {
                this.cardFormatSetting = this.getDefaultFormatSettings();
            }
            const formatSettings: ICardFormatSetting = this.cardFormatSetting;
            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ActualFillColor: this.data.actualColor,
                            ComparisonFillColor: this.data.targetColor
                        }
                    });
                    break;
                case 'custom':
                    enumeration.push({
                        objectName: 'custom',
                        displayName: 'Donut Chart',
                        selector: null,
                        properties: {
                            show: this.data.isPie,
                            ringWidth: this.data.ringWidth
                        }
                    });
                    break;
                case 'labels':
                    let showLabel: boolean = true;
                    const label: string = 'labels';
                    if (dataView.metadata.objects && dataView.metadata.objects[label]) {
                        const labels: DataViewObject = dataView.metadata.objects[label];
                        const show: string = 'show';
                        if (labels[show] != null) {
                            showLabel = <boolean>labels[show];
                        }
                    }
                    enumeration.push({
                        objectName: 'labels',
                        displayName: 'Data label',
                        selector: null,
                        properties: {
                            show: showLabel,
                            colors: this.settings.colors,
                            labelPrecision: this.settings.labelPrecision,
                            labelUnit: CircularGauge.getValue<string>(dataView, 'labels', 'labelUnit', 'Auto'),
                            labelStyle: CircularGauge.getValue<string>(dataView, 'labels', 'labelStyle', 'Percentage'),
                            fontSize: this.settings.fontSize
                        }
                    });
                    break;
                case 'legend':
                    enumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: CircularGauge.getLegendValue<boolean>(dataView, 'show', false),
                            position: CircularGauge.getLegendValue<string>(dataView, 'position', 'Right'),
                            showTitle: CircularGauge.getLegendValue<boolean>(dataView, 'showTitle', false),
                            titleText: CircularGauge.getLegendValue<string>(dataView, 'titleText', null),
                            labelColor: DataViewObjects
                                .getFillColor(this.dataView.metadata.objects, progressIndicatorProps.legend.labelColor, '#000000'),
                            range1: this.range.range1,
                            value1: CircularGauge.getFill(this.dataView, 'value1'),
                            range2: this.range.range2,
                            value2: CircularGauge.getFill(this.dataView, 'value2'),
                            range3: this.range.range3,
                            value3: CircularGauge.getFill(this.dataView, 'value3'),
                            range4: 100,
                            value4: CircularGauge.getFill(this.dataView, 'value4')
                        }

                    });
                    break;
                default:
            }

            return enumeration;
        }

        private getLowRangeData(): number[] {
            const low: number[] = [];
            for (let k: number = 0; k < 4; k++) {
                if (k === 0) {
                    if (this.data !== null) {
                        low.push(0);
                    }
                } else if (k === 1) {
                    if (this.range.range1 !== null) {
                        low.push(this.range.range1);
                    }
                } else if (k === 2) {
                    if (this.range.range2 !== null) {
                        low.push(this.range.range2);
                    }
                } else if (k === 3) {
                    if (this.range.range3 !== null) {
                        low.push(this.range.range3);
                    }
                }
            }

            return low;
        }

        private getHighRangeData(): number[] {
            const high: number[] = [];
            for (let k: number = 0; k < 4; k++) {
                if (k === 0) {
                    if (this.range.range1 !== null) {
                        high.push(this.range.range1);
                    }
                } else if (k === 1) {
                    if (this.range.range2 !== null) {
                        high.push(this.range.range2);
                    }
                } else if (k === 2) {
                    if (this.range.range3 !== null) {
                        high.push(this.range.range3);
                    }
                } else if (k === 3) {
                    if (this.data !== null) {
                        high.push(100);
                    }
                }
            }

            return high;
        }

        private createLegendData(dataView: DataView, host: IVisualHost, settings: CircularGaugeSettings): LegendData {
            const legendData: LegendData = {
                fontSize: this.viewport.height * 0.025,
                dataPoints: [],
                title: settings.legend.showTitle ? (settings.legend.titleText) : null,
                labelColor: settings.legend.labelColor
            };
            const low: number[] = this.getLowRangeData();
            const high: number[] = this.getHighRangeData();
            this.h1 = high[0] ? parseInt(high[0].toString(), 10) : NaN;
            this.h2 = high[1] ? parseInt(high[1].toString(), 10) : NaN;
            this.h3 = high[2] ? parseInt(high[2].toString(), 10) : NaN;
            this.h4 = high[3] ? parseInt(high[3].toString(), 10) : NaN;
            let i: number = 0;
            const label: string[] = [];
            while (low[i] < 100 && i < 4) {
                label.push((i + 1).toString());
                i++;
            }
            if (low[i] === 100 && high[i] === 100 && i < 4) {
                label.push((i + 1).toString());
            }
            const fillColor: string[] = [this.range.value1,
            this.range.value2,
            this.range.value3,
            this.range.value4];
            const defaultColor: string[] = ['#D73411', '#E57518', '#FAE320', '#7EDA22'];
            legendData.dataPoints = label.map(
                (typeMeta: string, index: number): LegendDataPoint => {
                    return {
                        label: `${low[parseInt(typeMeta, 10) - 1]}% - ${high[parseInt(typeMeta, 10) - 1]}%`,
                        color: fillColor[parseInt(typeMeta, 10) - 1],
                        icon: LegendIcon.Circle,
                        selected: false,
                        identity: host.createSelectionIdBuilder()
                            .withCategory(null, index)
                            .withMeasure(typeMeta)
                            .createSelectionId()
                    };
                });

            return legendData;
        }

        private showMsg(errmsg: string, errmsgwidth: number): void {
            $('#a123').removeAttr('d');
            $('#a1234').removeAttr('d');
            $('.circularSVG text').empty();
            $('#line1').attr('display', 'none');
            $('#line2').attr('display', 'none');
            $('.legend g').empty();
            const errorMessage: string = errmsg;
            const errorMessageWidth: number = errmsgwidth;
            this.root.append('span')
                .classed('errmsg', true)
                .text(errorMessage)
                .style('font-size', '12px')
                .style({ display: 'block' })
                .style('height', this.viewport.height - 20)
                .style('line-height', `${this.viewport.height - 20}px`)
                .style('margin', '0 auto')
                .style('width', `${errorMessageWidth}px`);
        }
        private formatValues(value: number, format: string): string {
            let index: number;
            for (let i: number = 0; i < this.dataView.metadata.columns.length; i++) {
                if (this.dataView.metadata.columns[i].roles.hasOwnProperty('ActualValue')) {
                    index = i;
                }
            }
            switch (format) {
                case 'Auto':
                    const aValueFormatter: IValueFormatter = valueFormatter
                    .create({ value: value,
                        precision: this.settings.labelPrecision,
                        format: this.dataView.metadata.columns[index].format });

                    return aValueFormatter.format(value);
                case 'Thousands':
                    const kValueFormatter: IValueFormatter = valueFormatter
                        .create({ value: 1001,
                            precision: this.settings.labelPrecision,
                            format: this.dataView.metadata.columns[index].format });

                    return kValueFormatter.format(value);
                case 'Millions':
                    const mValueFormatter: IValueFormatter = valueFormatter
                        .create({ value: 1e6,
                            precision: this.settings.labelPrecision,
                            format: this.dataView.metadata.columns[index].format });

                    return mValueFormatter.format(value);
                case 'Billions':
                    const bValueFormatter: IValueFormatter = valueFormatter
                        .create({ value: 1e9,
                            precision: this.settings.labelPrecision,
                            format: this.dataView.metadata.columns[index].format });

                    return bValueFormatter.format(value);
                case 'Trillions':
                    const tValueFormatter: IValueFormatter = valueFormatter
                        .create({ value: 1e12,
                            precision: this.settings.labelPrecision,
                            format: this.dataView.metadata.columns[index].format });

                    return tValueFormatter.format(value);
                default:
                    const dValueFormatter: IValueFormatter = valueFormatter
                    .create({ value: 1,
                        precision: this.settings.labelPrecision,
                        format: this.dataView.metadata.columns[index].format });

                    return dValueFormatter.format(value);
            }
        }
    }
}
