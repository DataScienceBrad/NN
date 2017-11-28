// JavaScript source code
module powerbi.extensibility.visual {
    //Model
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    const pxLiteral: string = 'px';
    const qualitativeState1ValueLiteral: string = 'QualitativeState1Value';
    const qualitativeState2ValueLiteral: string = 'QualitativeState2Value';
    const yLiteral: string = 'Y';
    const minValueLiteral: string = 'MinValue';
    const maxValueLiteral: string = 'MaxValue';
    const targetValueLiteral: string = 'TargetValue';
    const closingParenthesisLiteral: string = ')';
    const percentageLiteral: string = '%';
    const spaceLiteral: string = ' ';
    export interface ILinearGauge {
        titleLabel: string;
        subTitleLabel: string;
        showLabel: boolean;
        colorActual: string;
        colorComparison: string;
        states: number[];
        value: number;
        target: number;
        comparison: number;
        actual: number;
        percentage: number;
        min: number;
        max: number;
        trendValue1: number;
        trendValue2: number;
        actualFormat: string;
        targetFormat: string;
        trend1Format: string;
        trend2Format: string;
        minFormat: string;
        maxFormat: string;
        selector: data.Selector;
        toolTipInfo: ITooltipDataItem[];
        golbalValueMin: number;
        targetSet: boolean;
    }

    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }

    interface ICardFormatSetting {
        showTitle: boolean;
        labelSettings: {
            show: boolean;
            position: number;
            displayUnits: number;
            precision: number;
            labelColor: string;
            // tslint:disable-next-line:no-any
            formatterOptions: any;
        };
        textSize: number;
        wordWrap: boolean;
    }

    //object variable which we used in customized color and text through UI options
    interface IGeneral {
        ActualFillColor: DataViewObjectPropertyIdentifier;
        ComparisonFillColor: DataViewObjectPropertyIdentifier;
    }

    interface IColor {
        objectName: string;
        propertyName: string;
    }

    interface ILabelPrecision {
        objectName: string;
        propertyName: string;
    }

    interface ILabelDisplayUnits {
        objectName: string;
        propertyName: string;
    }

    interface ILabels {
        color: IColor;
        labelPrecision: ILabelPrecision;
        labelDisplayUnits: ILabelDisplayUnits;
    }

    interface IColor2 {
        objectName: string;
        propertyName: string;
    }

    interface ILabelPrecisionTrend {
        objectName: string;
        propertyName: string;
    }

    interface ILabelDisplayUnitsTrend {
        objectName: string;
        propertyName: string;
    }

    interface ITrendlabels {
        color: IColor2;
        labelPrecision_trend: ILabelPrecisionTrend;
        labelDisplayUnits_trend: ILabelDisplayUnits;
    }

    interface ILinearGaugeProps {
        general: IGeneral;
        labels: ILabels;
        trendlabels: ITrendlabels;
    }

    export let linearGaugeProps: ILinearGaugeProps = {
        general: {
            ActualFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ActualFillColor' },
            ComparisonFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ComparisonFillColor' }
        },
        labels: {
            color: { objectName: 'labels', propertyName: 'color' },
            labelPrecision: { objectName: 'labels', propertyName: 'labelPrecision' },
            labelDisplayUnits: { objectName: 'labels', propertyName: 'labelDisplayUnits' }
        },
        trendlabels: {
            color: { objectName: 'labels', propertyName: 'color' },
            labelPrecision_trend: { objectName: 'labels', propertyName: 'labelPrecision' },
            labelDisplayUnits_trend: { objectName: 'labels', propertyName: 'labelDisplayUnits' }
        }
    };

    interface ICategoryLabels {
        show: DataViewObjectPropertyIdentifier;
        color: DataViewObjectPropertyIdentifier;
        fontSize: DataViewObjectPropertyIdentifier;
    }

    interface ILabels2 {
        color: DataViewObjectPropertyIdentifier;
        labelPrecision: DataViewObjectPropertyIdentifier;
        labelDisplayUnits: DataViewObjectPropertyIdentifier;
        fontSize: DataViewObjectPropertyIdentifier;
    }

    interface ITrendlabels2 {
        color: DataViewObjectPropertyIdentifier;
        labelPrecision: DataViewObjectPropertyIdentifier;
        labelDisplayUnits: DataViewObjectPropertyIdentifier;
        fontSize: DataViewObjectPropertyIdentifier;
    }

    interface IWordWrap {
        show: DataViewObjectPropertyIdentifier;
    }

    interface ICardProps {
        categoryLabels: ICategoryLabels;
        labels: ILabels2;
        trendlabels: ITrendlabels2;
        wordWrap: IWordWrap;
    }

    export let cardProps: ICardProps = {
        categoryLabels: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'show'
            },
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'color'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'fontSize'
            }
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'fontSize'
            }

        },
        trendlabels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'fontSize'
            }
        },
        wordWrap: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'wordWrap',
                propertyName: 'show'
            }
        }
    };
    let globalminValue: number = 0;
    let globalminLength: number = 0;
    let globalTargetValue: number = 0;
    let globalTargetWidth: number = 0;

    //Visual
    export class LinearGauge implements IVisual {
        private selectionIdBuilder: ISelectionIdBuilder;
        private host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private prevDataViewObjects: DataViewObjects = {};
        // tslint:disable-next-line:no-any
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        private svgLinear: d3.Selection<SVGElement>;
        private svgLinearNext: d3.Selection<SVGElement>;
        private svgTitle: d3.Selection<SVGElement>;
        private svgSubtitle: d3.Selection<SVGElement>;
        private actual: d3.Selection<SVGElement>;
        private percentage: d3.Selection<SVGElement>;
        private dataView: DataView;
        private data: ILinearGauge;
        private min: d3.Selection<SVGElement>;
        private max: d3.Selection<SVGElement>;
        private targetText: d3.Selection<SVGElement>;
        private trendValue1: d3.Selection<SVGElement>;
        private trendValue2: d3.Selection<SVGElement>;
        private heading: d3.Selection<SVGElement>;
        private subHeading: d3.Selection<SVGElement>;
        private cardFormatSetting: ICardFormatSetting;
        private cardFormatSettingTrend: ICardFormatSetting;
        private selectionManager: ISelectionManager;
        public static getDefaultData(): ILinearGauge {
            return {
                colorActual: 'orange',
                colorComparison: 'lightgrey',
                titleLabel: '',
                subTitleLabel: '',
                showLabel: true,
                states: [],
                min: 0,
                max: 1,
                value: 0,
                target: 0,
                comparison: 0,
                actual: 0,
                percentage: 0,
                trendValue1: 0,
                trendValue2: 0,
                actualFormat: '',
                targetFormat: '',
                minFormat: '',
                maxFormat: '',
                trend1Format: '',
                trend2Format: '',
                toolTipInfo: [],
                golbalValueMin: 10,
                targetSet: false,
                selector: null
            };
        }
        // tslint:disable-next-line:no-any
        public getDefaultLabelSettings(show: boolean, labelColor: string, labelPrecision: number, format: any): {
            show: boolean;
            position: number;
            displayUnits: number;
            precision: number;
            labelColor: string;
            // tslint:disable-next-line:no-any
            formatterOptions: any;
        } {
            let defaultCountLabelPrecision: number;
            defaultCountLabelPrecision = 0;
            let defaultDecimalLabelPrecision: number;
            defaultDecimalLabelPrecision = 2;
            let defaultLabelColor: string;
            defaultLabelColor = '#777777';
            let precision: number;
            let hasDots: (value: PrimitiveValue, format?: string, allowFormatBeautification?: boolean) => string;
            precision = 0;
            if (show === void 0) {
                show = false;
            }
            if (format) {
                hasDots = powerbi.extensibility.utils.formatting.valueFormatter.format;
            }
            precision = defaultCountLabelPrecision;
            if (labelPrecision) {
                precision = labelPrecision;
            } else if (hasDots) {
                precision = defaultDecimalLabelPrecision;
            }

            return {
                show: show,
                position: 0 /* Above */,
                displayUnits: 0,
                precision: precision,
                labelColor: labelColor || defaultLabelColor,
                formatterOptions: null
            };
        }

        // tslint:disable-next-line:no-any
        public getDefaultLabelSettingsTrend(show: boolean, labelColor: string, labelPrecisionTrend: number, format: any): {
            show: boolean;
            position: number;
            displayUnits: number;
            precision: number;
            labelColor: string;
            // tslint:disable-next-line:no-any
            formatterOptions: any;
        } {
            let defaultCountLabelPrecision: number;
            defaultCountLabelPrecision = 0;
            let defaultDecimalLabelPrecision: number;
            defaultDecimalLabelPrecision = 2;
            let defaultLabelColor: string;
            defaultLabelColor = '#777777';
            let precision: number = 0;
            let hasDots: boolean;
            if (show === void 0) {
                show = false;
            }
            if (format) {
                hasDots = powerbi.extensibility.utils.formatting.numberFormat.getCustomFormatMetadata(format).hasDots;
            }
            precision = defaultCountLabelPrecision;
            if (labelPrecisionTrend) {
                precision = labelPrecisionTrend;
            } else if (hasDots) {
                precision = defaultDecimalLabelPrecision;
            }

            return {
                show: show,
                position: 0 /* Above */,
                displayUnits: 0,
                precision: precision,
                labelColor: labelColor || defaultLabelColor,
                formatterOptions: null
            };
        }

        public getDefaultFormatSettings(): ICardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettings(true, 'black', 0, undefined),
                wordWrap: false
            };
        }
        public getDefaultFormatSettings_trend(): ICardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettingsTrend(true, 'black', 0, undefined),
                wordWrap: false
            };
        }

        //First time it will be called and made the structure of your visual
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.heading = d3.select(options.element)
                .style({
                    cursor: 'default'
                })
                .append('div')
                .classed('mainTitle', true);
            this.actual = d3.select(options.element)
                .append('text')
                .classed('data_total', true)
                .text('');
            this.percentage = d3.select(options.element)
                .append('text')
                .classed('data_percentage', true)
                .text('');
            this.svg = d3.select(options.element)
                .append('div')
                .classed('imagetab', true);
            this.svgLinear = this.svg
                .append('div');
            this.svgLinearNext = this.svg
                .append('div');
            this.trendValue1 = this.svgLinear
                .append('div')
                .classed('trendvalue1', true);
            this.trendValue2 = this.svgLinearNext
                .append('div')
                .classed('trendvalue2', true);
            this.svg = d3.select(options.element)
                .append('svg')
                .classed('linearSVG', true)
                .style('width', '100%');
            this.svgLinear = this.svg
                .append('g');
            let titleLabels: d3.Selection<SVGElement>;
            titleLabels = this.svgLinear
                .append('g')
                .style('text-anchor', 'end');
            this.svgTitle = titleLabels
                .append('text')
                .classed('title', true);
            this.svgSubtitle = titleLabels
                .append('text')
                .attr('dy', '1em')
                .classed('subtitle', true);
            this.min = d3.select(options.element)
                .append('div')
                .classed('scale', true)
                .text(0);
            this.targetText = d3.select(options.element)
                .append('div')
                .classed('targetText', true);
        }
        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): ILinearGauge {
            let data: ILinearGauge;
            data = LinearGauge.getDefaultData();
            if (!dataView.categorical || !dataView) {
                return;
            }
            // tslint:disable-next-line:no-any
            let toolTipItems: any[];
            toolTipItems = [];
            if (dataView.categorical.values === undefined) {
                return;
            }
            let actualFlag: boolean;
            actualFlag = false;
            let maxFlag: boolean;
            maxFlag = false;
            let values: DataViewValueColumns;
            values = dataView.categorical.values;
            if (values === undefined) {
                return;
            }
            let iCounter: number;
            for (iCounter = 0; iCounter < values.length; iCounter++) {
                let col: DataViewMetadataColumn;
                col = dataView.categorical.values[iCounter].source;
                let value: PrimitiveValue;
                value = values[iCounter].values[0] || 0;
                let pushToTooltips: boolean;
                pushToTooltips = false;
                if (col.roles[yLiteral]) { // we are matching the role and populating value
                    data.actualFormat = col.format;
                    data.actual = <number>value;
                    actualFlag = true;
                    pushToTooltips = true; // pass the value as true to make it as a tooltip
                }
                if (col.roles[minValueLiteral]) {
                    data.minFormat = col.format;
                    data.min = <number>value;
                }
                if (col.roles[maxValueLiteral]) {
                    data.maxFormat = col.format;
                    maxFlag = true;
                    data.max = <number>value;
                }
                if (col.roles[targetValueLiteral]) {
                    data.targetSet = true;
                    data.targetFormat = col.format;
                    data.target = <number>value;
                    pushToTooltips = true;
                }
                if (col.roles[qualitativeState1ValueLiteral]) {
                    data.trendValue1 = <number>value;
                    data.trend1Format = col.format;
                }
                if (col.roles[qualitativeState2ValueLiteral]) {
                    data.trendValue2 = <number>value;
                    data.trend2Format = col.format;
                }
                if (pushToTooltips) {
                    toolTipItems.push({
                        value: value,
                        metadata: values[iCounter]
                    });
                }
            }
            if (!maxFlag && actualFlag && data.actual > 0) {
                data.max = data.actual * 2;
            }
            if (data.max === 0) {
                data.max = 1;
            }

            return data; //Data object we are returning here to the update function
        }

        private format(d: number, displayunitValue: number, precisionValue: number, format: string): string {
            let displayUnits: number;
            displayUnits = displayunitValue;
            let primaryFormatterVal: number;
            primaryFormatterVal = 0;
            if (displayUnits === 0) {
                let alternateFormatter: number;
                alternateFormatter = parseInt(d.toString(), 10).toString().length;
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
            // tslint:disable-next-line:no-any
            let formatter: any;
            if (format) {
                if (format.indexOf(percentageLiteral) >= 0) {
                    formatter = ValueFormatter.create({
                        value: 0,
                        precision: precisionValue,
                        format: format
                    });
                } else {
                    formatter = ValueFormatter.create({
                        value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                        precision: precisionValue,
                        format: format
                    });
                }
            } else {
                formatter = ValueFormatter.create({
                    value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                    precision: precisionValue
                });
            }
            let formattedValue: string;
            formattedValue = formatter.format(d);

            return formattedValue;
        }

        //Drawing the visual
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.cardFormatSetting = this.getDefaultFormatSettings();
            this.cardFormatSettingTrend = this.getDefaultFormatSettings_trend();
            // tslint:disable-next-line:no-any
            let labelSettings: any;
            labelSettings = null;
            let dataView: DataView;
            dataView = this.dataView = options.dataViews[0];
            if (dataView === undefined) {
                return;
            }
            if (!dataView.metadata || !dataView) {
                return;
            }
            let settingsChanged: boolean;
            settingsChanged = this.getSettings(dataView.metadata.objects);
            let value: PrimitiveValue;
            if (dataView) {
                if (dataView.single) {
                    value = dataView.single.value;
                }
                if (!dataView.metadata || !dataView) {
                    return;
                }
                let dataViewMetadata: DataViewMetadata;
                dataViewMetadata = dataView.metadata;
            }
            labelSettings = this.settings;
            if (!options.dataViews || !options.dataViews[0]) {
                return;
            }
            // var dataView = this.dataView = options.dataViews[0];
            let viewport: IViewport;
            viewport = options.viewport; //We will get width and height from viewport object.
            this.data = LinearGauge.converter(dataView); //calling Converter function

            let maxValue: number;
            maxValue =
                Math.max(Math.abs(this.data.target), Math.abs(this.data.value), Math.abs(this.data.comparison), Math.abs(this.data.max));
            if (this.data.states.length === 0) {
                this.data.states = [Math.ceil(maxValue) / 3, (Math.ceil(maxValue) / 3) * 2, Math.ceil(maxValue)];
            }
            let sortedRanges: number[];
            sortedRanges = this.data.states.slice().sort(d3.descending);
            let titleWidth: number;
            titleWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth({
                fontFamily: 'tahoma',
                fontSize: '16px',
                text: this.data.titleLabel
            });
            let showSubtitle: boolean;
            showSubtitle = (this.data.subTitleLabel.length > 0);
            let subtitleWidth: number;
            subtitleWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth({
                fontFamily: 'tahoma',
                fontSize: '12px',
                text: this.data.subTitleLabel
            });
            let precisionValue: number;
            precisionValue = 0;
            let displayunitValue: number;
            displayunitValue = 0;
            let color: string;
            color = 'black';
            let precisionValueTrend: number;
            precisionValueTrend = 0;
            let height: number;
            height = viewport.height;
            let width: number;
            width = viewport.width - 20;
            let modHeight: number;
            modHeight = height / 12;
            this.svg
                .attr({
                    height: viewport.height / 11,
                    width: viewport.width
                });
            if (this.data.showLabel) {
                const translateMinusTenLiteral: string = 'translate(-10,';
                this.svgTitle
                    .style('display', 'none')
                    .attr('transform', translateMinusTenLiteral + ((20) + (showSubtitle ? 0 : 10)) + closingParenthesisLiteral)
                    .text(this.data.titleLabel);
                // tslint:disable-next-line:prefer-template
                this.svgLinear.attr('transform', 'translate(' + (10) + ',5)');
                this.data.subTitleLabel = '-';
                if (showSubtitle) {
                    this.svgSubtitle
                        .style('display', 'none')
                        // tslint:disable-next-line:prefer-template
                        .attr('transform', 'translate(-10,' + ((height / 23) + 1) + closingParenthesisLiteral)
                        .text(this.data.subTitleLabel);
                } else {
                    this.svgSubtitle.style('display', 'none');
                }
            } else {
                this.svgTitle.style('display', 'none');
                this.svgSubtitle.style('display', 'none');
                this.svgLinear.attr('transform', 'translate(10,5)');
            }
            if (this.settings.markerWidth !== undefined) {
                if (this.settings.markerWidth > 4) {
                    this.settings.markerWidth = 4;
                } else if (this.settings.markerWidth < 0) {
                    this.settings.markerWidth = 0;
                }
                precisionValue = this.settings.markerWidth;
            }
            if (this.settings.lineWidth !== undefined) {
                if (this.settings.lineWidth > 4) {
                    this.settings.lineWidth = 4;
                } else if (this.settings.lineWidth < 0) {
                    this.settings.lineWidth = 0;
                }
                precisionValueTrend = this.settings.lineWidth;
            }
            let percentageVal: PrimitiveValue;
            let actualVal: string;
            // tslint:disable-next-line:no-any
            let minVal: any;
            // tslint:disable-next-line:no-any
            let targetVal: any;
            let trend1Val: string;
            let trend2Val: string;
            if (this.data.target === 0) {
                percentageVal = 0;
            } else {
                percentageVal = ((this.data.actual * 100) / this.data.target).toFixed(2);
            }
            actualVal = this.format(this.data.actual, this.settings.labelDisplayUnits, precisionValue, this.data.actualFormat);

            minVal = this.format(this.data.min, this.settings.labelDisplayUnits, precisionValue, this.data.minFormat);

            targetVal = this.format(this.data.target, this.settings.labelDisplayUnits, precisionValue, this.data.targetFormat);

            let formatter: utils.formatting.IValueFormatter;
            formatter = ValueFormatter.create({ format: '#,0.00', value: 0, precision: 0 });
            let iLoopIterator: number;
            for (iLoopIterator = 0; iLoopIterator < this.data.toolTipInfo.length; iLoopIterator++) {
                this.data.toolTipInfo[iLoopIterator].value = formatter.format(this.data.toolTipInfo[iLoopIterator].value);
            }
            trend1Val = this.format(this.data.trendValue1, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend1Format);

            trend2Val = this.format(this.data.trendValue2, this.settings.trendDisplayUnits, precisionValueTrend, this.data.trend2Format);

            this.actual.text(actualVal); //Using values which are stored in data object
            this.percentage.text((percentageVal) + percentageLiteral);
            this.min.text(minVal);
            let upArrow: string;
            upArrow = '&#8599;';
            // tslint:disable-next-line:no-any
            let arrowClassTV1: any;
            // tslint:disable-next-line:no-any
            let arrowClassTV2: any;
            let customwidth: string;
            customwidth = (window.getComputedStyle($(this.svg[0][0])[0]).width).slice(0, -2);
            let wifth: number;
            wifth = Number(customwidth) - 20;
            let percen: number;
            percen = (((this.data.target - this.data.min) * 100) / (this.data.max - this.data.min));
            percen = (isNaN(percen)) ? 0 : percen;
            let passingValue: number;
            passingValue = (((wifth * percen) / 100) <= 0) ? 0 : ((wifth * percen) / 100);
            let passingTextvalue: number;
            passingTextvalue = (wifth * (percen - 2)) / 100;
            //Scale on X-axis
            let actualFont: number;
            actualFont = ((width + height) / 22);
            let percentageFont: number;
            percentageFont = actualFont / 2.5;
            let topMargin: string;
            topMargin = (height / 7) + pxLiteral;
            this.actual.style('font-size', actualFont + pxLiteral);
            this.actual.style('color', this.settings.DataColor);
            this.actual.style('margin-right', percentageFont + pxLiteral);
            this.percentage.style('font-size', percentageFont + pxLiteral);
            this.percentage.style('padding-top', (percentageFont + 5) + pxLiteral);
            this.percentage.style('color', this.settings.DataColor);
            let trendValue1Text: string;
            let trendValue2Text: string;
            let indexQualStatVal1: number;
            let indexQualStatVal2: number;
            let flagQualStatVal1: boolean = false;
            let indexActual: number = -1;
            let indexTarget: number = -1;
            let flagQualStatVal2: boolean = false;
            let lengthColumn: number;
            lengthColumn = options.dataViews[0].metadata.columns.length;
            //Populating Trend Value 1 and Trend Value 2 data
            if (!dataView.metadata || !dataView) {
                return;
            }
            let ite: number;
            for (ite = 0; ite < lengthColumn; ite++) {
                if (dataView.metadata.columns[ite].roles[qualitativeState1ValueLiteral] === true) {
                    flagQualStatVal1 = true;
                    indexQualStatVal1 = ite;
                }
                if (dataView.metadata.columns[ite].roles[qualitativeState2ValueLiteral] === true) {
                    flagQualStatVal2 = true;
                    indexQualStatVal2 = ite;
                }
                if (dataView.metadata.columns[ite].roles[yLiteral] === true) {
                    indexActual = ite;
                }
                if (dataView.metadata.columns[ite].roles[targetValueLiteral] === true) {
                    indexTarget = ite;
                }
            }
            if (flagQualStatVal1) {
                trendValue1Text = dataView.metadata.columns[indexQualStatVal1].displayName;
            } else {
                trendValue1Text = '';
            }
            if (flagQualStatVal2) {
                trendValue2Text = dataView.metadata.columns[indexQualStatVal2].displayName;
            } else {
                trendValue2Text = '';
            }
            //Adding css dynamically to make the component responsive, all values are calculated from Viewport value
            this.heading.style('margin-top', topMargin);
            this.trendValue1.style('font-size', percentageFont + pxLiteral);
            this.trendValue1.style('color', this.settings.trendColor);
            this.trendValue1.style('text-align', 'right');
            this.trendValue2.style('font-size', percentageFont + pxLiteral);
            this.trendValue2.style('color', this.settings.trendColor);
            this.trendValue2.style('text-align', 'right');
            let scale: d3.scale.Linear<number, number>;
            scale = d3.scale.linear()
                .domain([0, Math.max(sortedRanges[0], this.data.target, this.data.value)])
                .range([0, width]);

            if (flagQualStatVal1) {
                this.trendValue1.style('display', 'inline');
                this.trendValue1.select('span.trendvalue1arrow').remove();
                this.trendValue1.select('span').remove();
                this.trendValue1.append('span')
                    .classed('trendvalue1arrow', true)
                    .html(upArrow);
                this.trendValue1.append('span').text(trend1Val + spaceLiteral + trendValue1Text);
                if (this.data.trendValue1 < 0) {
                    //$('.trendvalue1arrow').css('Transform','rotate(90deg)');
                    if ((document.querySelectorAll('.trendvalue1arrow')).length !== 0) {
                        arrowClassTV1 = document.querySelectorAll('.trendvalue1arrow');
                        arrowClassTV1[0].style.transform = 'rotate(90deg)';
                        arrowClassTV1[0].style.display = 'inline-block';
                    }
                }
            } else {
                this.trendValue1.style('display', 'none');
            }
            if (flagQualStatVal2) {
                this.trendValue2.style('display', 'inline');
                this.trendValue2.select('span.trendvalue2arrow').remove();
                this.trendValue2.select('span').remove();
                this.trendValue2.append('span')
                    .classed('trendvalue2arrow', true)
                    .html(upArrow);
                this.trendValue2.append('span').text(trend2Val + spaceLiteral + trendValue2Text);
                if (this.data.trendValue2 < 0) {
                    if ((document.querySelectorAll('.trendvalue2arrow')).length !== 0) {
                        arrowClassTV2 = document.querySelectorAll('.trendvalue2arrow');
                        arrowClassTV2[0].style.transform = 'rotate(90deg)';
                        arrowClassTV2[0].style.display = 'inline-block';
                    }
                }
            } else {
                this.trendValue2.style('display', 'none');
            }
            if ((document.querySelectorAll('.trendvalue1arrow')).length !== 0) {
                arrowClassTV1 = document.querySelectorAll('.trendvalue1arrow');
                arrowClassTV1[0].style.fontSize = percentageFont + 4 + pxLiteral;
            }
            if ((document.querySelectorAll('.trendvalue2arrow')).length !== 0) {
                arrowClassTV2 = document.querySelectorAll('.trendvalue2arrow');
                arrowClassTV2[0].style.fontsize = percentageFont + 4 + pxLiteral;
            }
            //Ranges
            let range: d3.selection.Update<number>;
            range = this.svgLinear.selectAll('rect.range')
                .data(sortedRanges);
            range.enter()
                .append('rect')
                // tslint:disable-next-line:no-any
                .attr('class', function (d: any, i: number): string {
                    // tslint:disable-next-line:prefer-template
                    return 'range s' + i;
                });
            range
                .attr('x', 0)
                .attr('width', function (d: number): number {
                    return (Math.abs(scale(d) - scale(0)));
                })
                .attr('height', modHeight)
                .style('fill', this.settings.ComparisonFillColor);
            //Comparison measure
            this.svgLinear.selectAll('rect.measure').remove();
            if (this.data.comparison > 0) {
                let comparison: d3.Selection<SVGElement>;
                comparison = this.svgLinear
                    .append('rect')
                    .classed('measure', true)
                    .style('fill', this.settings.ComparisonFillColor);
                comparison
                    .attr('width', scale(this.data.comparison))
                    .attr('height', (modHeight / 3))
                    .attr('x', 0)
                    .attr('y', (modHeight / 3));
            }
            let percent: number;
            percent = (((this.data.actual - this.data.min) * 100) / (this.data.max - this.data.min));
            percent = (isNaN(percent)) ? 0 : percent;
            let actual: number;
            actual = (((width * percent) / 100) <= 0) ? 0 : ((width * percent) / 100);
            actual = (isNaN(actual)) ? 0 : actual;
            //Main measure
            let measure: d3.Selection<SVGElement>;
            measure = this.svgLinear
                .append('rect')
                .classed('measure', true)
                .style('fill', this.settings.ActualFillColor);
            if (this.data.actual < this.data.max) {
                measure
                    .attr('width', actual)
                    .attr('height', modHeight)
                    .attr('x', 0)
                    .attr('y', 0);
            } else {
                measure
                    .attr('width', width)
                    .attr('height', modHeight)
                    .attr('x', 0)
                    .attr('y', 0);
            }
            if (this.data.max <= this.data.min) {
                measure.style('display', 'none');
            }
            //Target markers
            this.svgLinear.selectAll('line.marker').remove();
            let marker: d3.Selection<SVGElement>;
            marker = this.svgLinear
                .append('line')
                .classed('marker', true)
                .style('stroke', 'black');
            let startingPoint: number;
            startingPoint = 0;
            let minvalueWidth: number;
            minvalueWidth = 0;
            let tiltend: number;
            let customMin: string;
            customMin = (window.getComputedStyle($(this.min[0][0])[0]).width).slice(0, -2);
            startingPoint = Number(customMin) + 10;
            globalminLength = startingPoint;
            let customsvgWidth: string;
            customsvgWidth = (window.getComputedStyle($(this.svg[0][0])[0]).width).slice(0, -2);
            let fullsvgWidth: number;
            fullsvgWidth = Number(customsvgWidth) - 20;
            minvalueWidth = (fullsvgWidth * (((this.data.target - this.data.min) * 100) / (this.data.max - this.data.min))) / 100;
            globalTargetWidth = minvalueWidth;
            // tslint:disable-next-line:no-any
            let targetValueText: any;
            targetValueText = targetVal;
            let targetTextwidth: number;
            targetTextwidth = 9 * targetValueText.length + 10;
            let flag: boolean;
            flag = false;
            if (globalTargetWidth < globalminLength || passingValue < (targetTextwidth + startingPoint)) {
                tiltend = globalminLength + 10;
                flag = true;
            } else {
                tiltend = passingValue;
                flag = false;
            }
            marker
                .attr({
                    x1: passingValue,
                    y1: 0,
                    x2: passingValue,
                    y2: modHeight
                });
            this.svgLinear.selectAll('line.markerTilt').remove();
            let tiltmarker: d3.Selection<SVGElement>;
            tiltmarker = this.svgLinear
                .append('line')
                .classed('markerTilt', true)
                .style('stroke', 'black');
            tiltmarker
                .attr({
                    x1: passingValue,
                    y1: modHeight,
                    x2: (tiltend),
                    y2: (modHeight + 10)
                });
            if (globalTargetWidth > globalminLength) {
                this.svgLinear.selectAll('line.markerTilt').remove();
            }
            //Target Text
            let customWidth: string;
            customWidth = (window.getComputedStyle($(this.svg[0][0])[0]).width).slice(0, -2);
            let iWidth: number;
            iWidth = Number(customWidth) - 10;
            let percen2: number;
            percen2 = (((this.data.target - this.data.min) * 100) / (this.data.max - this.data.min));
            percen2 = (isNaN(percen2)) ? 0 : percen2;
            let passingValue2: number;
            passingValue2 = (((iWidth * percen2) / 100) <= 0) ? 0 : ((iWidth * percen2) / 100);
            let diff: number;
            diff = iWidth - passingValue2 + 20;
            if (flag === false) {
                this.targetText.selectAll('span.markerTarget').remove();
                this.svgLinear.selectAll('text.markerTarget').remove();
                if (diff >= 20) {
                    let markerText: d3.Selection<SVGElement>;
                    markerText = this.targetText
                        .append('span')
                        .classed('markerTarget', true)
                        .text(targetVal)
                        .style('float', 'right')
                        .style('color', 'Black')
                        .style('margin-right', diff + pxLiteral);
                } else {
                    let markerText: d3.Selection<SVGElement>;
                    markerText = this.targetText
                        .append('span')
                        .classed('markerTarget', true)
                        .text(targetVal)
                        .style('float', 'right')
                        .style('color', 'Black')
                        .style('display', 'none');
                }
            } else {
                this.targetText.selectAll('span.markerTarget').remove();
                this.svgLinear.selectAll('text.markerTarget').remove();
                let markerText: d3.Selection<SVGElement>;
                markerText = this.svgLinear
                    .append('text')
                    .classed('markerTarget', true)
                    .style('color', 'black')
                    .style('text-anchor', 'start')
                    .text(targetVal);
                markerText
                    .attr('width', 1)
                    .attr('height', modHeight)
                    .attr('x', tiltend)
                    .attr('y', (modHeight + 20))
                    .attr('overflow', 'visible !important');
                this.targetText.style('display', 'none');
            }
            // tslint:disable-next-line:no-any
            function numberWithCommas(x: any): string {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            if (this.data.target < this.data.min || !(this.data.targetSet)) {
                this.svgLinear.selectAll('text.markerTarget').remove();
                this.svgLinear.selectAll('line.marker').remove();
                this.svgLinear.selectAll('line.markerTilt').remove();
            }
            if (this.data.target > this.data.max) {
                this.svgLinear.selectAll('.marker').style('display', 'none');
                this.targetText.style('display', 'none');
                this.svgLinear.selectAll('line.marker').remove();
                this.svgLinear.selectAll('line.markerTilt').remove();
                this.svgLinear.selectAll('text.markerTarget').remove();
            } else {
                this.svgLinear.selectAll('.marker').style('display', 'block');
                this.targetText.style('display', 'block');
            }
            let formatterActual: utils.formatting.IValueFormatter;
            formatterActual =
                ValueFormatter.create({
                    format: this.data.actualFormat ? this.data.actualFormat : ValueFormatter.DefaultNumericFormat,
                    value: 0, precision: this.getDecimalPlacesCount(this.data.actual)
                });
            let formatterTarget: utils.formatting.IValueFormatter;
            formatterTarget =
                ValueFormatter.create({
                    format: this.data.targetFormat ? this.data.targetFormat : ValueFormatter.DefaultNumericFormat,
                    value: 0, precision: this.getDecimalPlacesCount(this.data.target)
                });
            if (indexTarget === -1 && indexActual > -1) {
                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.measure'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getOneTooltipData
                        (dataView.metadata.columns[indexActual].displayName, formatterActual.format(this.data.actual)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);

                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.range'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getOneTooltipData
                        (dataView.metadata.columns[indexActual].displayName, formatterActual.format(this.data.actual)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);

            } else if (indexActual === -1 && indexTarget > -1) {
                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.measure'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getOneTooltipData
                        (dataView.metadata.columns[indexTarget].displayName, formatterActual.format(this.data.target)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);

                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.range'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getOneTooltipData
                        (dataView.metadata.columns[indexTarget].displayName, formatterActual.format(this.data.target)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);
            } else if (indexActual > -1 && indexTarget > -1) {
                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.measure'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getTwoTooltipData(
                        dataView.metadata.columns[indexActual].displayName, formatterActual.format(this.data.actual),
                        dataView.metadata.columns[indexTarget].displayName, formatterTarget.format(this.data.target)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);

                this.tooltipServiceWrapper.addTooltip(
                    this.svgLinear.selectAll('rect.range'),
                    (tooltipEvent: TooltipEventArgs<number>) => LinearGauge.getTwoTooltipData(
                        dataView.metadata.columns[indexActual].displayName,
                        formatterActual.format(this.data.actual),
                        dataView.metadata.columns[indexTarget].displayName,
                        formatterTarget.format(this.data.target)),
                    (tooltipEvent: TooltipEventArgs<number>) => null);
            }
            globalminValue = minVal;
            globalTargetValue = targetVal;
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
        //Make visual properties available in the property pane in Power BI
        //values which we can customized from property pane in Power BI
        public getSettings(objects: DataViewObjects): boolean {
            let settingsChanged: boolean;
            settingsChanged = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    ComparisonFillColor: getValue<Fill>(objects, 'general', 'ComparisonFillColor', {
                        solid: {
                            color: 'lightgrey'
                        }
                    }).solid.color, // The color of the outer circle.
                    ActualFillColor: getValue<Fill>(objects, 'general', 'ActualFillColor', {
                        solid: {
                            color: 'orange'
                        }
                    }).solid.color, // The color of the fill wave.
                    DataColor: getValue<Fill>(objects, 'labels', 'DataColor', {
                        solid: {
                            color: 'black'
                        }
                    }).solid.color, // The color of the outer circle.
                    labelDisplayUnits: getValue<number>(objects, 'labels', 'labelDisplayUnits', 0),
                    markerWidth: getValue<number>(objects, 'labels', 'markerWidth', 0),
                    trendColor: getValue<Fill>(objects, 'trendLabels', 'trendColor', {
                        solid: {
                            color: 'black'
                        }
                    }).solid.color, // The color of the outer circle.
                    trendDisplayUnits: getValue<number>(objects, 'trendLabels', 'trendDisplayUnits', 0),
                    lineWidth: getValue<number>(objects, 'trendLabels', 'lineWidth', 0)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
        private static getTwoTooltipData(value: string, tab: string, avalue: string, atab: string): VisualTooltipDataItem[] {

            return [{
                displayName: value,
                value: tab
            }, {
                displayName: avalue,
                value: atab
            }];
        }
        private static getOneTooltipData(value: string, tab: string): VisualTooltipDataItem[] {

            return [{
                displayName: value,
                value: tab
            }];
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];
            if (!this.data) {
                this.data = LinearGauge.getDefaultData();
            }
            if (!this.cardFormatSetting) {
                this.cardFormatSetting = this.getDefaultFormatSettings();
            }
            if (!this.cardFormatSettingTrend) {
                this.cardFormatSettingTrend = this.getDefaultFormatSettings_trend();
            }
            let formatSettings: ICardFormatSetting;
            formatSettings = this.cardFormatSetting;
            let cardFormatSettingTrend: ICardFormatSetting;
            cardFormatSettingTrend = this.cardFormatSettingTrend;
            switch (options.objectName) {
                case 'general':
                    objectEnumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ActualFillColor: {
                                solid: {
                                    color: this.settings.ActualFillColor
                                }
                            },
                            ComparisonFillColor: {
                                solid: {
                                    color: this.settings.ComparisonFillColor
                                }
                            }
                        }
                    });
                    break;
                case 'labels':
                    objectEnumeration.push({
                        objectName: 'labels',
                        displayName: 'Labels',
                        selector: null,
                        properties: {
                            DataColor: {
                                solid: {
                                    color: this.settings.DataColor
                                }
                            },
                            labelDisplayUnits: this.settings.labelDisplayUnits,
                            markerWidth: this.settings.markerWidth
                        }
                    });
                    break;
                case 'trendLabels':
                    objectEnumeration.push({
                        objectName: 'trendLabels',
                        displayName: 'Labels',
                        selector: null,
                        properties: {
                            trendColor: {
                                solid: {
                                    color: this.settings.trendColor
                                }
                            },
                            trendDisplayUnits: this.settings.trendDisplayUnits,
                            lineWidth: this.settings.lineWidth
                        }
                    });
                    break;
                default:
            }

            return objectEnumeration;
        }
    }
}
