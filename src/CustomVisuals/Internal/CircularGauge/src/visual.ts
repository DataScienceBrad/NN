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
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface VisualDataLabelsSettingsOptions {
        show: boolean;
        enumeration: any;
        dataLabelsSettings: any;
        precision?: boolean;
        fontSize?: boolean;
        instances: any
    }
    export class LegendSettings {
        show: boolean = true;
        position: string = "Right";
        showTitle: boolean = false;
        titleText: string = "";
        labelColor: string = "#000000";
        fontSize: number = 8;
    }
    export interface ProgressIndicatorValues {
        actual: number;
        target: number;
        ringWidth: number;
        actualColor: string;
        targetColor: string;
        isPie: boolean;
        toolTipInfo: TooltipDataItem[];
        toolTipColumn: TooltipDataItem[];
        actualFormat: string;
        targetFormat: string;
    }
    export class CircularGaugeSettings extends DataViewObjectsParser {
        legend: LegendSettings = new LegendSettings();
    }
    export interface CircularGaugeViewModel {
        dataView: DataView;
        settings: CircularGaugeSettings;
        legendData: LegendData;
    }
    interface CardFormatSetting {
        showTitle: boolean;
        textSize: number;
        labelSettings: any;
        wordWrap: boolean;
    }

    module Selectors {
        export const ClassName: ClassAndSelector = createClassAndSelector("circularGauge");
        export const Chart: ClassAndSelector = createClassAndSelector("chart");
        export const ChartLine: ClassAndSelector = createClassAndSelector("chart-line");
        export const Body: ClassAndSelector = createClassAndSelector("circularGauge-body");
        export const Label: ClassAndSelector = createClassAndSelector("label");
        export const LegendItems: ClassAndSelector = createClassAndSelector("legendItem");
        export const LegendTitle: ClassAndSelector = createClassAndSelector("legendTitle");
    }

    //object variable which we used in customized color and text through UI options
    export var progressIndicatorProps = {
        general: {
            ActualFillColor: <DataViewObjectPropertyIdentifier>{
                objectName: 'general',
                propertyName: 'ActualFillColor'
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
            },
        },
        dataColors: {
            FillColor1: <DataViewObjectPropertyIdentifier>{
                objectName: 'dataColors',
                propertyName: 'value1'
            },
            FillColor2: <DataViewObjectPropertyIdentifier>{
                objectName: 'dataColors',
                propertyName: 'value2'
            },
            FillColor3: <DataViewObjectPropertyIdentifier>{
                objectName: 'dataColors',
                propertyName: 'value3'
            },
            FillColor4: <DataViewObjectPropertyIdentifier>{
                objectName: 'dataColors',
                propertyName: 'value4'
            }
        },
        legend: {
            labelColor: <DataViewObjectPropertyIdentifier>{
                objectName: 'legend',
                propertyName: 'labelColor'
            }
        }
    };
    //Visual
    export interface TooltipDataItem {
        displayName: string;
        value: string;
    }
    export interface Range {
        range1: number;
        range2: number;
        range3: number;
        range4: number;
    }
    export class CircularGauge implements IVisual {
        //Variables 
        public range: Range;
        private viewport: IViewport;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private svg: d3.Selection<SVGElement>;
        private root: d3.Selection<SVGElement>;
        private percentage: string;
        public canvas: d3.Selection<SVGElement>;
        public group: d3.Selection<SVGElement>;
        public groupInner: d3.Selection<SVGElement>;
        public dataView: DataView;
        public data: ProgressIndicatorValues;
        private cardFormatSetting: CardFormatSetting;
        private container: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private prevDataViewObjects: any = {};
        private settings: any;
        private legend: ILegend;
        private interactivityService: IInteractivityService;
        private isInteractiveChart: boolean = false;
        private viewModel: CircularGaugeViewModel;
        private CircularGaugeDiv: Selection<any>;
        private body: Selection<any>;
        public toolTipData: TooltipDataItem[];
        private static LegendPropertyIdentifier: DataViewObjectPropertyIdentifier = {
            objectName: "legend",
            propertyName: "fill"
        };
        public getDefaultFormatSettings(): CardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettings(true, this.settings, 0),
                wordWrap: false,
            };
        }
        public getDefaultLabelSettings(show, labelColor, labelPrecision) {
            var defaultLabelPrecision = 0;
            var defaultLabelColor = "#777777";
            if (show === void 0) {
                show = false;
            }
            var fontSize = 9;
            return {
                show: show,
                precision: labelPrecision || defaultLabelPrecision,
                labelColor: labelColor || defaultLabelColor,
                fontSize: fontSize,
            };
        }
        public static getDefaultData(): ProgressIndicatorValues {
            return {
                actual: 0,
                target: -1,
                ringWidth: 20,
                actualColor: "#45C1F0",
                targetColor: "#45C1F0",
                isPie: true,
                toolTipInfo: [],
                toolTipColumn: [],
                actualFormat: '',
                targetFormat: '',
            };
        }

        private createLegendData(dataView: DataView, host: IVisualHost, settings: CircularGaugeSettings): LegendData {
            const legendData: LegendData = {
                fontSize: this.viewport.height * 0.025,
                dataPoints: [],
                title: settings.legend.showTitle ? (settings.legend.titleText) : null,
                labelColor: settings.legend.labelColor
            };
            var low = [0, this.range.range1, this.range.range2, this.range.range3];
            var high = [this.range.range1, this.range.range2, this.range.range3, 100];
            var i = 0;
            var label = [];
            while (low[i] != 100 && i < 4) {
                label.push((i + 1).toString());
                i++;
            }
            var fillColor = [progressIndicatorProps.dataColors.FillColor1, progressIndicatorProps.dataColors.FillColor2, progressIndicatorProps.dataColors.FillColor3, progressIndicatorProps.dataColors.FillColor4];
            var defaultColor = ["#D73411", "#E57518", "#FAE320", "#7EDA22"];
            legendData.dataPoints = label.map(
                (typeMeta: string, index: number): LegendDataPoint => {
                    return {
                        label: (low[parseInt(typeMeta) - 1] + '-' + high[parseInt(typeMeta) - 1]) as string,
                        color: DataViewObjects.getFillColor(this.dataView.metadata.objects, fillColor[index], defaultColor[index]),
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

        //One time setup
        //First time it will be called and made the structure of your visual
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.svg = this.root.append('svg')
                .style('overflow', 'visible');
            this.container = this.svg.append('g');
            this.group = this.container.append('g');
            this.group.append('path').attr('id', 'a123');
            this.groupInner = this.container.append('g');
            this.groupInner.append('path').attr('id', 'a1234');
            this.groupInner.append('text');
            this.groupInner.append('line').attr('id', 'line1');
            this.groupInner.append('line').attr('id', 'line2');

            this.body = d3.select(options.element);
            this.CircularGaugeDiv = this.body.append("div")
                .classed(Selectors.Body.class, true);

            this.legend = createLegend($(options.element),
                this.isInteractiveChart,
                this.interactivityService,
                true,
                null);
        }
        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): ProgressIndicatorValues {
            var data: ProgressIndicatorValues = CircularGauge.getDefaultData();
            if (dataView && dataView.categorical) {
                let len = dataView.table.rows[0].length;
                var iCount, toolTipCount = 0;
                for (iCount = 0; iCount < len; iCount++) {
                    if (dataView.metadata.columns[iCount].roles['ActualValue']) {
                        data.actual = <number>dataView.table.rows[0][iCount];
                        data.actualFormat = ((dataView.metadata.columns[iCount].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                    if (dataView.metadata.columns[iCount].roles['TargetValue']) {
                        data.target = <number>dataView.table.rows[0][iCount];
                        data.targetFormat = ((dataView.metadata.columns[iCount].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                    if (dataView.metadata.columns[iCount].roles['Tooltip']) {
                        data.toolTipColumn[toolTipCount] = {
                            displayName: <string>dataView.metadata.columns[iCount].displayName,
                            value: <string>dataView.table.rows[0][iCount]
                        }
                        toolTipCount++;
                    }
                }
                if(data.target == -1){
                    data.target = data.actual;
                }

            }
           
            return data; //Data object we are returning here to the update function
        }
        //Drawing the visual	   
        public update(options: VisualUpdateOptions) {
            this.viewport = options.viewport;
            var dataView = this.dataView = options.dataViews[0];
            
            var data2 = this.data = CircularGauge.converter(dataView); //calling Converter function	
            
            var data = data2.actual;
            var max = data2.target;
            var viewport = options.viewport;
            let settingsChanged = this.getSettings(dataView.metadata.objects);
            this.cardFormatSetting = this.getDefaultFormatSettings();
            var labelSettings = null;
            var objects = null;
            var showDataLabel = true;
            if (this.dataView && this.dataView.metadata) {
                objects = this.dataView.metadata.objects;
            }
            if (objects) {
                labelSettings = this.cardFormatSetting.labelSettings;
                labelSettings.labelColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.labels.color, labelSettings.labelColor);
                labelSettings.precision = DataViewObjects.getValue(objects, progressIndicatorProps.labels.labelPrecision, labelSettings.precision);
                // The precision can't go below 0
                if (labelSettings.precision != null) {
                    this.cardFormatSetting.labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                }
                this.data.isPie = DataViewObjects.getValue(objects, progressIndicatorProps.custom.show, this.data.isPie);
                this.data.ringWidth = DataViewObjects.getValue(objects, progressIndicatorProps.custom.ringWidth, this.data.ringWidth);
                this.cardFormatSetting.labelSettings.fontSize = DataViewObjects.getValue(objects, progressIndicatorProps.labels.fontSize, labelSettings.fontSize);
            
                var labels = dataView.metadata.objects['labels'];
                if (labels)
                    if (labels['show'] != null)
                        showDataLabel = <boolean>labels['show'];
            }
            var percentCompleted = (data / max);
            percentCompleted = isNaN(percentCompleted) || !isFinite(percentCompleted) ? 0 : (percentCompleted > 1) ? 1 : ((percentCompleted < 0) ? 0 : percentCompleted);
            this.cardFormatSetting.labelSettings.precision = this.cardFormatSetting.labelSettings.precision < 5 ? this.cardFormatSetting.labelSettings.precision : 5;
            if (this.cardFormatSetting.labelSettings.precision > 5) {
                this.cardFormatSetting.labelSettings.precision = 0;
            }
            this.settings.labelPrecision = this.cardFormatSetting.labelSettings.precision;
            var percentage = (percentCompleted * 100).toFixed(this.cardFormatSetting.labelSettings.precision);
            var fontSize = this.cardFormatSetting.labelSettings.fontSize;
            var textProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                text: percentage + '%',
                fontFamily: "sans-serif",
                fontSize: ((4 / 3) * fontSize) + 'px'
                //fontSize: fontSize + 'pt'
            };
            var textWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
            var textHeight = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextHeight(textProperties);

            const settings: CircularGaugeSettings = CircularGaugeSettings.parse<CircularGaugeSettings>(dataView);

            //By default, only category-1
            this.range = {
                range1: 100,
                range2: 100,
                range3: 100,
                range4: 100
            };

            this.range.range1 = CircularGauge.getValue(this.dataView, 'range1', 100);
            if (this.range.range1 <= 0) this.range.range1 = 0;
            else if (this.range.range1 > 100) this.range.range1 = 100;

            this.range.range2 = CircularGauge.getValue(this.dataView, 'range2', 100);
            if (this.range.range2 <= this.range.range1) this.range.range2 = this.range.range1 + 1;
            else if (this.range.range2 > 100) this.range.range2 = 100;

            this.range.range3 = CircularGauge.getValue(this.dataView, 'range3', 100);
            if (this.range.range3 <= this.range.range2) this.range.range3 = this.range.range2 + 1;
            else if (this.range.range3 > 100) this.range.range3 = 100;

            //Category-4, being the last category, always ends at maximum value
            this.range.range4 = 100;
            let legendData = this.createLegendData(this.dataView, this.host, settings);
            this.viewModel = {
                dataView: this.dataView,
                settings: settings,
                legendData: legendData
            }
            this.renderLegend();
            d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - this.viewport.height);

            if (parseInt(percentage) >= 0 && parseInt(percentage) <= this.range.range1) {
                this.data.targetColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.dataColors.FillColor1, "#D73411");
            }
            else if (parseInt(percentage) > this.range.range1 && parseInt(percentage) <= this.range.range2) {
                this.data.targetColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.dataColors.FillColor2, "#E57518");
            }
            else if (parseInt(percentage) > this.range.range2 && parseInt(percentage) <= this.range.range3) {
                this.data.targetColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.dataColors.FillColor3, "#FAE320");
            }
            else {
                this.data.targetColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.dataColors.FillColor4, "#7EDA22");
            };
            var height = viewport.height;
            var width = viewport.width;
            this.svg.attr('width', width)
                .attr('height', height);
            this.data.actualColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.general.ActualFillColor, '#45C1F0');
            var outerRadius = ((((width / 2) - (textWidth + 17)) < ((height / 2) - (textHeight)) ? ((width / 2) - (textWidth + 17)) : ((height / 2) - (textHeight))));
            outerRadius = outerRadius - (outerRadius * 0.1);
            var innerRadius;
            this.data.ringWidth = this.data.ringWidth < 15 ? 15 : this.data.ringWidth;
            innerRadius = outerRadius - this.data.ringWidth;
            var arc, arc1, biggerArc, biggerArc1;
            var dataLabelText = percentage + "%";
            var dataLabelStyle = CircularGauge.getValue<string>(dataView, 'labelStyle', 'Percentage');

            switch (dataLabelStyle) {
                case "Percentage":
                    dataLabelText = percentage + "%";
                    break;
                case "Category":
                    dataLabelText = options.dataViews[0].metadata.columns[0].displayName;
                    break;
                case "DataValue":
                    dataLabelText = this.formatValues(data, CircularGauge.getValue<string>(dataView, 'labelUnit', 'None'));
                    break;
                case "DatavaluePercentage":
                    dataLabelText = this.formatValues(data, CircularGauge.getValue<string>(dataView, 'labelUnit', 'None'))+", "+percentage+"%";
                    break;
                case "CategoryDatavalue":
                    dataLabelText = options.dataViews[0].metadata.columns[0].displayName +", "+this.formatValues(data, CircularGauge.getValue<string>(dataView, 'labelUnit', 'None'));
                    break;
                case "CategoryPercentage":
                    dataLabelText = options.dataViews[0].metadata.columns[0].displayName +", "+percentage + "%";
                    break;
                case "All":
                    dataLabelText = options.dataViews[0].metadata.columns[0].displayName+", "+this.formatValues(data, CircularGauge.getValue<string>(dataView, 'labelUnit', 'None'))+", "+percentage + "%";
                    break;
                
            }
            textProperties = {
                text: dataLabelText,
                fontFamily: "sans-serif",
                fontSize: ((4 / 3) * fontSize) + 'px'
                //fontSize: fontSize + 'pt'
            };
            var fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            var iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);
            let spaceAvailable = viewport.width/2 - outerRadius*1.1;
            let iNumofChars = dataLabelText.length;
            let fCharSpace = fTextWidth / iNumofChars;
            let iNumofCharsAllowed = spaceAvailable / fCharSpace;
            let sTextNew = dataLabelText;
            if (iNumofCharsAllowed <= iNumofChars)
                sTextNew = dataLabelText.substring(0, iNumofCharsAllowed - 2) + "...";
            let textPropertiesNew: TextProperties = {
                text: sTextNew,
                fontFamily: 'Segoe UI',
                fontSize: ((4 / 3) * fontSize) + 'px'
            };
            let fTextWidthNew = textMeasurementService.measureSvgTextWidth(textPropertiesNew);
            let iTextHeightNew = textMeasurementService.measureSvgTextHeight(textPropertiesNew);
            if (innerRadius > 15 && showDataLabel && iNumofCharsAllowed >= 3) {
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
                var c = arc1.centroid(2 * Math.PI),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);
                var y1;
                if (percentCompleted > 0.5)
                    y1 = (((y / h) * outerRadius * 1.1) + (textHeight / 3));
                else
                    y1 = ((y / h) * outerRadius * 1.1) + (textHeight / 3);
                this.groupInner
                    .select("text")
                    .attr('x', ((x / h) * outerRadius * 1.1) + 17)
                    .attr('y', y1)
                    .attr("text-anchor", "start")
                    .attr('font-size', fontSize + 'pt')
                    .text(sTextNew)
                    .attr('fill', this.cardFormatSetting.labelSettings.labelColor);
                this.groupInner.select("line#line1")
                    .attr("x1", (x / h) * outerRadius * 1.02)
                    .attr("y1", (y / h) * outerRadius * 1.02)
                    .attr("x2", ((x / h) * outerRadius * 1.1))
                    .attr("y2", (y / h) * outerRadius * 1.1)
                    .attr('style', "stroke:#DDDDDD;stroke-width:1");
                this.groupInner.select("line#line2")
                    .attr("x1", (x / h) * outerRadius * 1.1)
                    .attr("y1", (y / h) * outerRadius * 1.1)
                    .attr("x2", ((x / h) * outerRadius * 1.1) + 15)
                    .attr("y2", (y / h) * outerRadius * 1.1)
                    .attr('style', "stroke:#DDDDDD;stroke-width:1");
                if (percentCompleted < 0.10 || percentCompleted > 0.90) {
                    this.groupInner.select("text").attr('x', ((x / h) * outerRadius * 1.1) + 39);
                    this.groupInner.select("line#line2").attr("x2", ((x / h) * outerRadius * 1.1) + 35);
                }
            } else {
                outerRadius = (width / 2) < (height / 2) ? width / 2 : height / 2;
                outerRadius = outerRadius - (outerRadius * 0.1);
                var innerRadius;
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
                    .select("text")
                    .attr('font-size', 0 + 'pt');
                this.groupInner.select("line#line1")
                    .attr('style', "stroke-width:0");
                this.groupInner.select("line#line2")
                    .attr('style', "stroke-width:0");
            }
            var prevColor;
            this.group.select('#a123')
                .attr('fill', this.data.actualColor)
                .on("mouseover", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("d", d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius * 1.08)
                            .startAngle(2 * Math.PI * percentCompleted)
                            .endAngle(2 * Math.PI));
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("d", arc)
                });

            this.groupInner.select('#a1234')
                .attr('fill', this.data.targetColor)
                .on("mouseover", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("d", d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius * 1.08)
                            .startAngle(0)
                            .endAngle(2 * Math.PI * percentCompleted));
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .attr("d", arc1)
                });

            this.group.attr('transform', 'translate(' + ((width / 2)) + ',' + ((height / 2)) + ')');
            this.groupInner.attr('transform', 'translate(' + ((width / 2)) + ',' + ((height / 2)) + ')');

            this.data.toolTipInfo[0] = {
                displayName: 'Target',
                value: this.data.targetFormat + this.data.target
            }
            this.data.toolTipInfo[1] = {
                displayName: 'Actual',
                value: this.data.actualFormat + this.data.actual
            }
            this.data.toolTipInfo[2] = {
                displayName: 'Percentage Remaining',
                value: (100 - parseFloat(percentage)) + '%'
            }
            let len = this.data.toolTipColumn.length, 
                iCount = 0;
            while(iCount<len){
                this.data.toolTipInfo[iCount+3] = {
                    displayName: this.data.toolTipColumn[iCount].displayName,
                    value: this.data.toolTipColumn[iCount].value
                }
                iCount++;
            }

            this.tooltipServiceWrapper.addTooltip(this.container.selectAll('path#a123'),
                (tooltipEvent: TooltipEventArgs<number>) => this.data.toolTipInfo,
                (tooltipEvent: TooltipEventArgs<number>) => null);
            this.tooltipServiceWrapper.addTooltip(this.container.selectAll('path#a1234'),
                (tooltipEvent: TooltipEventArgs<number>) => this.data.toolTipInfo,
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        private formatValues(value: number, format: string): string {
            var precision = DataViewObjects.getValue(this.dataView.metadata.objects, progressIndicatorProps.labels.labelPrecision, this.cardFormatSetting.labelSettings.precision);
            precision = precision < 5 ? precision : 5
            switch (format) {
                case "Thousands":
                    let kValueFormatter = valueFormatter.create({ value: 1001, precision });
                    return kValueFormatter.format(value);
                case "Millions":
                    let mValueFormatter = valueFormatter.create({ value: 1e6, precision });
                    return mValueFormatter.format(value);
                case "Billions":
                    let bValueFormatter = valueFormatter.create({ value: 1e9, precision });
                    return bValueFormatter.format(value);
                case "Trillions":
                    let tValueFormatter = valueFormatter.create({ value: 1e12, precision });
                    return tValueFormatter.format(value);
                default:
                    return value.toString();
            }
        }

        private renderLegend(): void {

            if (!this.viewModel)
                return;
            if (!this.viewModel.legendData) {
                return;
            }
            let position: LegendPosition = this.viewModel.settings.legend.show
                ? LegendPosition[this.viewModel.settings.legend.position]
                : LegendPosition.None;
            this.legend.changeOrientation(position);

            this.legend.drawLegend(this.viewModel.legendData, _.clone(this.viewport));
            Legend.positionChartArea(this.CircularGaugeDiv, this.legend);
            this.svg.style('margin', 0);
            switch (this.legend.getOrientation()) {
                case LegendPosition.Left:
                case LegendPosition.LeftCenter:
                    this.svg.style('margin-left', parseInt($(".legend").css('width')));
                case LegendPosition.Right:
                case LegendPosition.RightCenter:
                    this.viewport.width -= this.legend.getMargins().width;
                    break;
                case LegendPosition.Top:
                case LegendPosition.TopCenter:
                    this.svg.style('margin-top', parseInt($(".legend").css('height')));
                    d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - this.legend.getMargins().height);
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter:
                    this.viewport.height -= 2 * this.legend.getMargins().height;
                    d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - this.legend.getMargins().height);
                    break;
            }
        }

        private getDefaultTooltipData(value: any, tab: any, avalue: any, atab: any, cvalue: any, ctab: any): VisualTooltipDataItem[] {
            return [{
                displayName: value,
                value: tab
            }, {
                displayName: avalue,
                value: atab
            },
            {
                displayName: cvalue,
                value: ctab
            }
            ];
        }
        public getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    colors: getValue<Fill>(objects, 'labels', 'colors', "grey"), // The color of the outer circle.
                    labelPrecision: getValue<number>(objects, 'labels', 'labelPrecision', 0),
                    fontSize: getValue<number>(objects, 'labels', 'fontSize', 15),
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI                
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            let a = CircularGauge.getDefaultData();
            var dataView = this.dataView;
            if (!this.data)
                this.data = CircularGauge.getDefaultData();
            if (!this.cardFormatSetting)
                this.cardFormatSetting = this.getDefaultFormatSettings();
            var formatSettings = this.cardFormatSetting;
            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ActualFillColor: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.general.ActualFillColor, a.actualColor)
                        }
                    });
                    break;
                case 'custom':
                    enumeration.push({
                        objectName: "custom",
                        displayName: "Donut Chart",
                        selector: null,
                        properties: {
                            show: this.data.isPie,
                            ringWidth: this.data.ringWidth
                        }
                    });
                    break;
                case 'labels':
                    var showLabel = true;
                    if (dataView.metadata.objects && dataView.metadata.objects['labels']){
                        var labels = dataView.metadata.objects['labels'];
                        if (labels['show'] != null)
                            showLabel = <boolean>labels['show'];
                    }    
                    enumeration.push({
                        objectName: "labels",
                        displayName: "Data label",
                        selector: null,
                        properties: {
                            show: showLabel,
                            colors: this.settings.colors,
                            labelPrecision: this.settings.labelPrecision,
                            labelUnit: CircularGauge.getValue<string>(dataView, 'labelUnit', 'None'),
                            labelStyle: CircularGauge.getValue<string>(dataView, 'labelStyle', 'Percentage'),
                            fontSize: this.settings.fontSize
                        }
                    });
                    break;
                case 'ranges':
                    enumeration.push({
                        objectName: 'ranges',
                        displayName: 'Ranges',
                        selector: null,
                        properties: {
                            range1: CircularGauge.getValue<number>(dataView, 'range1', null),
                            range2: CircularGauge.getValue<number>(dataView, 'range2', null),
                            range3: CircularGauge.getValue<number>(dataView, 'range3', null),
                            range4: CircularGauge.getValue<number>(dataView, 'range4', null)
                        }
                    });
                    break;
                case 'dataColors':
                    enumeration.push({
                        objectName: 'dataColors',
                        displayName: 'Data Colors',
                        selector: null,
                        properties: {
                            value1: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.dataColors.FillColor1, "#D73411"),
                            value2: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.dataColors.FillColor2, "#E57518"),
                            value3: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.dataColors.FillColor3, "#FAE320"),
                            value4: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.dataColors.FillColor4, "#7EDA22")
                        }
                    });
                    break;
                case 'legend':
                    enumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: CircularGauge.getLegendValue<boolean>(dataView, 'show', true),
                            position: CircularGauge.getLegendValue<string>(dataView, 'position', 'Right'),
                            showTitle: CircularGauge.getLegendValue<boolean>(dataView, 'showTitle', false),
                            titleText: CircularGauge.getLegendValue<string>(dataView, 'titleText', null),
                            labelColor: DataViewObjects.getFillColor(this.dataView.metadata.objects, progressIndicatorProps.legend.labelColor, "#000000")
                        }
                        
                    });
                    break;
            }
            return enumeration;
        }

        private static getFill(dataView: DataView, key): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var dataColors = objects['dataColors'];
                    if (dataColors) {
                        var fill = <Fill>dataColors[key];
                        if (fill)
                            return fill;
                    }
                    var legend = objects['legend'];
                    if (legend) {
                        var fill = <Fill>legend[key];
                        if (fill)
                            return fill;
                    }
                }
            }
            switch (key) {
                case 'value1':
                    return { solid: { color: '#D0EEF7' } };
                case 'value2':
                    return { solid: { color: '#D5F3B6' } };
                case 'value3':
                    return { solid: { color: '#ECCA90' } };
                case 'value4':
                    return { solid: { color: '#F9A99B' } };
                default:
                    return { solid: { color: '#D0EEF7' } };
            }
        }

        private static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var size = <T>config[key];
                        if (size != null)
                            return size;
                    }
                    var ranges = objects['ranges'];
                    if (ranges) {
                        var range = <T>ranges[key];
                        if (range)
                            return range;
                    }
                    var legend = objects['legend'];
                    if (legend) {
                        var value = <T>legend[key];
                        if (value != null)
                            return value;
                    }
                    var labels = objects['labels'];
                    if (labels) {
                        var value = <T>labels[key];
                        if (value != null)
                            return value;
                    }
                }
            }
            return defaultValue;
        }
        private static getLegendValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var legend = objects['legend'];
                    if (legend) {
                        var value = <T>legend[key];
                        if (value != null)
                            return value;
                    }
                }
            }
            return defaultValue;
        }

    }
}