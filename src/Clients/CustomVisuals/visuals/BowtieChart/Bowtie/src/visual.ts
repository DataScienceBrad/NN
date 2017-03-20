module powerbi.extensibility.visual {
    import IVisual = powerbi.extensibility.visual.IVisual;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

    import SelectionManager = powerbi.extensibility.ISelectionManager
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import SelectionId = powerbi.visuals.ISelectionId;
    import IDataColorPalette = powerbi.extensibility.IColorPalette;
    import IDataLabelSettings = powerbi.extensibility.utils.chart.dataLabel.IDataLabelSettings;
    import VisualDataLabelsSettings = powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    //tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;

    var AsterPlotVisualClassName: string = 'Bowtie';
    export var BowtieProps = {
        general: {
            ArcFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ArcFillColor' },
        },
        show: { objectName: 'GMODonutTitle', propertyName: 'show' },
        titleText: { objectName: 'GMODonutTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'GMODonutTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'GMODonutTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'GMODonutTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'GMODonutTitle', propertyName: 'tooltipText' },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'textPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
        },
        Aggregatelabels: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'textPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'fontSize' },
            Indicator: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'Indicator' },
            signIndicator: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'signIndicator' },
            Threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Aggregatelabels', propertyName: 'Threshold' },
        }
    };

    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface TooltipDataItem {
        displayName: string;
        value: string;
    }

    export interface BowtieData {
        dataPoints: BowtieDataPoint[];
        valueFormatter: IValueFormatter;
        legendObjectProps: DataViewObject;
        labelSettings: any,//VisualDataLabelsSettings;
        AggregatelabelSettings: AggregatelabelSettings;
        chartType: string;
        aggregatedSum: number;
        ArcFillColor: string;
    }

    export interface BowtieDataPoint {
        color: string;
        DestCategoryLabel: string;
        SourceCategoryLabel: string;
        selector: SelectionId;
        value: number;
        SourceArcWidth: number;
        DestCatArcWidth: number;
        srcValue: number;
    }

    export interface AggregatelabelSettings {
        color: string;
        displayUnits: number;
        textPrecision: number;
        Indicator: boolean;
        fontSize: number;
        Threshold: number;
        signIndicator: boolean;
    }
    export class BowtieChart implements IVisual {
        public host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private svg: d3.Selection<SVGElement>;
        private BowtieMainContainer: d3.Selection<SVGElement>;
        private BowtieChartAggregated: d3.Selection<SVGElement>;
        private BowtieChartDestination: d3.Selection<SVGElement>;
        private DestinationSVG: d3.Selection<SVGElement>;
        private BowtieChartSVGDestination: d3.Selection<SVGElement>;
        private BowtieChartSVGSource: d3.Selection<SVGElement>;
        private BowtieChartSource: d3.Selection<SVGElement>;
        private BowtieChartError: d3.Selection<SVGElement>;
        private mainGroupElement: d3.Selection<SVGElement>;
        private BowtieChartHeadings: d3.Selection<SVGElement>;
        private centerText: d3.Selection<SVGElement>;
        private colors: IDataColorPalette;
        private selectionManager: ISelectionManager;
        private dataView: DataView;
        private dataViews: DataView[];
        private legend: ILegend;
        private data: BowtieData;
        private currentViewport: IViewport;
        private convertedData: BowtieData;
        private metricName: string;
        private sourceName: string;
        private destinationName: string;
        private root: d3.Selection<SVGElement>;
        private titleSize: number = 12;
        private updateCount: number = 0;
        private prevIndicator = false;
        private isNegative = false;
        private formatString = '0';

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.root = d3.select(options.element);

            var container: d3.Selection<SVGElement> = this.BowtieMainContainer = d3.select(options.element)
                .append('div')
                .classed('BowtieMainContainer', true);

            container
                .append('div')
                .classed('Title_Div_Text', true)
                .style({ 'width': '100%', 'display': 'inline-block' })
                .html('<div class = "GMODonutTitleDiv" style = "max-width: 80%; display: inline-block">' + '</div>'
                + '<span class = "GMODonutTitleIcon" style = "width: 2%; display: none; cursor: pointer;">&nbsp(&#063;)</span>');


            var BowtieChartError: d3.Selection<SVGElement> = this.BowtieChartError = container
                .append('div')
                .classed('BowtieChartError', true);

            var BowtieChartHeadings: d3.Selection<SVGElement> = this.BowtieChartHeadings = container
                .append('div')
                .classed('BowtieChartHeadings', true);

            var BowtieChartSource: d3.Selection<SVGElement> = this.BowtieChartSource = container
                .append('div')
                .classed('BowtieChartSource', true);

            var BowtieChartSVGSource: d3.Selection<SVGElement> = this.BowtieChartSVGSource = container
                .append('div')
                .classed('BowtieChartSVGSource', true);

            var BowtieChartAggregated: d3.Selection<SVGElement> = this.BowtieChartAggregated = container
                .append('div')
                .classed('BowtieChartAggregated', true);

            var BowtieChartSVGDestination: d3.Selection<SVGElement> = this.BowtieChartSVGDestination = container
                .append('div')
                .classed('BowtieChartSVGDestination', true);

            var BowtieChartDestination: d3.Selection<SVGElement> = this.BowtieChartDestination = container
                .append('div')
                .classed('BowtieChartDestination', true);
        }

        private getDefaultBowtieData(): BowtieData {
            return <BowtieData>{
                dataPoints: [],
                legendObjectProps: {},
                valueFormatter: null,
                labelSettings: dataLabelUtils.getDefaultLabelSettings(),
                AggregatelabelSettings: this.getDefaultAggregateLabelSettings(),
                chartType: 'HalfBowtie',
                aggregatedSum: 0,
                ArcFillColor: '#0099FF',
            };
        }

        public getDefaultAggregateLabelSettings(): AggregatelabelSettings {
            return {
                Indicator: false,
                color: 'black',
                displayUnits: 0,
                textPrecision: 0,
                fontSize: 9,
                Threshold: 0,
                signIndicator: false
            }
        }

        public converter(dataView: DataView, colors: IDataColorPalette, host: IVisualHost): BowtieData {
            var asterDataResult: BowtieData = this.getDefaultBowtieData();
            var isHalfBowtie: boolean;
            var isFullBowtie: boolean;
            if (!this.dataViewContainsCategory(dataView) || dataView.categorical.categories.length < 1)
                return asterDataResult;
            else if (dataView.categorical.categories.length == 1) {
                isHalfBowtie = true;
            } else if (dataView.categorical.categories.length == 2) {
                isFullBowtie = true;
            }

            var catDv: DataViewCategorical = dataView && dataView.categorical;
            var catDestination = catDv && catDv.categories && catDv.categories[0];
            var catSource;
            if (isFullBowtie) {
                catSource = catDv && catDv.categories && catDv.categories[1];
            }

            var catDestValues = catDestination && catDestination.values;
            var catSourceValues = catSource ? catSource.values : null;
            var values = catDv && catDv.values;

            if (values) {
                this.formatString = values[0].source.format;
            }

            this.metricName = values && values[0] && values[0].source.displayName;
            this.destinationName = catDestination && catDestination.source && catDestination.source.displayName;
            this.sourceName = catSource ? catSource.source.displayName : '';

            var aggregatedSum = 0;
            if (values && values[0]) {
                aggregatedSum = d3.sum(values[0].values, function (d: number) {
                    if (d && d > 0) {
                        return d;
                    }
                    else {
                        return 0;
                    }
                });
            }
            asterDataResult.labelSettings.precision = 0;
            asterDataResult.labelSettings = this.getLabelSettings(dataView, asterDataResult.labelSettings);
            asterDataResult.AggregatelabelSettings = this.getAggregateLabelSettings(dataView);
            asterDataResult.chartType = isFullBowtie ? 'FullBowtie' : isHalfBowtie ? 'HalfBowtie' : null;
            asterDataResult.aggregatedSum = aggregatedSum;

            if (!catDestValues || catDestValues.length < 1 || !values || values.length < 1 || !asterDataResult.chartType) {
                this.isNegative = false;
                return asterDataResult;
            }

            var formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
            // Populating source and destination values and their aggregations
            // Destination
            var arrDestination = [];
            for (var i = 0, length = catDestValues.length; i < length; i++) {
                if (values[0] && values[0].values && values[0].values.length > 0) {
                    var category = catDestValues[i];
                    category = category ? category : "(Blank)";
                    var sCategory = "";
                    var destArcWidth = 0;
                    var destCatSum;
                    destCatSum = 0;
                    for (var j = 0; j < length; j++) {
                        var value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;
                            return;
                        }
                        var innerCat = catDestValues[j];
                        innerCat = (innerCat ? catDestValues[j] : "(Blank)");
                        if (innerCat == category)
                            destCatSum += value;
                    }
                    if (aggregatedSum > 0) {
                        destArcWidth = destCatSum / aggregatedSum;
                    }

                    if (arrDestination.indexOf(category) == -1 && destCatSum != 0) {
                        if (Date.parse(category.toString()) && (formatter.format(category) != 'dddd MMMM %d yyyy')) {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: formatter.format(category),
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                value: destCatSum,
                                srcValue: 0
                            });
                        } else {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: category.toString(),
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: host.createSelectionIdBuilder().withCategory(catDestination, i).createSelectionId(),
                                value: destCatSum,
                                srcValue: 0
                            });
                        }
                        arrDestination.push(category);
                    }
                }
            }

            if (asterDataResult.chartType == "FullBowtie") {
                var arrSource = [];
                for (var i = 0, srcLength = catSourceValues && catSourceValues.length; i < length; i++) {
                    var currentValue = values[0].values[i];
                    var category: string | number | boolean | Date = catSourceValues[i];
                    var destArcWidth = 0;
                    var destCatSum;
                    destCatSum = 0;
                    category = category ? category : "(Blank)";
                    for (var j = 0; j < srcLength; j++) {
                        var value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;
                            return;
                        }
                        var innerCat: string | number | boolean | Date = catSourceValues[j];
                        innerCat = (innerCat ? catSourceValues[j] : "(Blank)");
                        if (innerCat == category)
                            destCatSum += value;
                    }
                    if (aggregatedSum > 0)
                        destArcWidth = destCatSum / aggregatedSum;

                    if (arrSource.indexOf(category) == -1 && destCatSum != 0) {
                        if (Date.parse(category.toString()) && (formatter.format(category) != 'dddd MMMM %d yyyy')) {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: null,
                                SourceCategoryLabel: formatter.format(category),
                                DestCatArcWidth: null,
                                SourceArcWidth: destArcWidth,
                                color: '',
                                selector: null,
                                value: 0,
                                srcValue: destCatSum
                            });
                        } else {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: null,
                                SourceCategoryLabel: category.toString(),
                                DestCatArcWidth: null,
                                SourceArcWidth: destArcWidth,
                                color: '',
                                selector: null,
                                value: 0,
                                srcValue: destCatSum
                            });
                        }
                        arrSource.push(category);
                    }
                }
            }
            return asterDataResult;
        }

        private getLabelSettings(dataView: DataView, labelSettings: VisualDataLabelsSettings): VisualDataLabelsSettings {
            var objects: DataViewObjects = null;

            if (!dataView.metadata || !dataView.metadata.objects)
                return labelSettings;

            objects = dataView.metadata.objects;
            var asterPlotLabelsProperties = BowtieProps;

            labelSettings.precision = DataViewObjects.getValue(objects, asterPlotLabelsProperties.labels.textPrecision, labelSettings.precision);
            labelSettings.precision = labelSettings.precision < 0 ? 0 : (labelSettings.precision > 20 ? 20 : labelSettings.precision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, asterPlotLabelsProperties.labels.fontSize, labelSettings.fontSize);
            labelSettings.displayUnits = DataViewObjects.getValue(objects, asterPlotLabelsProperties.labels.displayUnits, labelSettings.displayUnits);
            labelSettings.labelColor = DataViewObjects.getFillColor(objects, asterPlotLabelsProperties.labels.color, labelSettings.labelColor);

            return labelSettings;
        }


        private getAggregateLabelSettings(dataView: DataView): AggregatelabelSettings {
            var objects: DataViewObjects = null;
            var labelSettings: AggregatelabelSettings = this.getDefaultAggregateLabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return this.getDefaultAggregateLabelSettings();

            objects = dataView.metadata.objects;
            var asterPlotLabelsProperties = BowtieProps;

            labelSettings.textPrecision = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.textPrecision, labelSettings.textPrecision);
            labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.fontSize, labelSettings.fontSize);
            labelSettings.displayUnits = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.displayUnits, labelSettings.displayUnits);
            labelSettings.color = DataViewObjects.getFillColor(objects, asterPlotLabelsProperties.Aggregatelabels.color, labelSettings.color);
            labelSettings.Indicator = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.Indicator, labelSettings.Indicator);
            labelSettings.signIndicator = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.signIndicator, labelSettings.signIndicator);
            labelSettings.Threshold = DataViewObjects.getValue(objects, asterPlotLabelsProperties.Aggregatelabels.Threshold, labelSettings.Threshold);

            return labelSettings;
        }

        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value[0].displayName.toString(),
                value: value[0].value.toString()
            },
                {
                    displayName: value[1].displayName.toString(),
                    value: value[1].value.toString()
                }];
        }

        private clearData(isLargeDataSet): void {
            // Headings
            this.BowtieChartHeadings.selectAll('div').remove();

            // Aggregated Sum settings
            this.BowtieChartAggregated.select('div').remove();
            this.BowtieChartSVGDestination.selectAll('svg').remove();
            this.BowtieChartSVGSource.selectAll('svg').remove();

            // Destination Settings 
            this.BowtieChartDestination.selectAll('div').remove();

            // Source Settings 
            this.BowtieChartSource.selectAll('div').remove();

            // Show Error Message
            this.BowtieChartError.selectAll('span').remove();
            this.BowtieMainContainer.style('width', this.currentViewport.width + 'px');
            this.BowtieMainContainer.style('height', this.currentViewport.height + 'px');

            var errorMessage = "";
            var errorMessageWidth = 0;
            if (!this.isNegative) {
                errorMessage = "Please select non-empty 'Value', 'Source', and/or 'Destination'.";
                errorMessageWidth = 335;
            } else {
                errorMessage = "Negative values are not supported.";
                errorMessageWidth = 195;
            }

            if (isLargeDataSet) {
                errorMessage = "Too many values. Try selecting more filters and/or increasing size of the visual.";
                errorMessageWidth = 565;
            }

            this.BowtieChartError.append('span')
                .html(errorMessage)
                .style('font-size', '12px')
                .style({ 'display': 'block' })
                .style('height', this.currentViewport.height - 20)
                .style('line-height', this.currentViewport.height - 20 + 'px')
                .style('margin', '0 auto')
                .style('width', errorMessageWidth + 'px');
        }

        public update(options: VisualUpdateOptions) {
            this.updateCount++;
            if (!options.dataViews || !options.dataViews[0]) return;

            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };

            var dataView: DataView = this.dataView = options.dataViews[0];
            this.dataViews = options.dataViews;
            var convertedData: BowtieData = this.data = this.converter(dataView, this.colors, this.host);

            if (!convertedData || !convertedData.dataPoints || convertedData.dataPoints.length == 0) {
                this.clearData(false);
                return;
            } else {
                this.BowtieChartError.selectAll('span').style('display', 'none');
            }

            // Custom Tooltip Code            
            var viewport = options.viewport;
            this.root.select('.errorMessage').style({ 'display': 'none' });
            this.root.select('.donutChartGMO').style({ 'display': '' });
            var GMODonutTitleOnOffStatus: IDataLabelSettings = false
                , titleText: string = ""
                , tooltiptext: string = ""
                , titlefontsize
                , titleHeight: number
                , titlecolor: string
                , titlebgcolor: string;

            if (this.getShowTitle(this.dataView)) {
                GMODonutTitleOnOffStatus = true;
            }
            if (this.getTitleText(this.dataView)) {
                titleText = String(this.getTitleText(this.dataView));
            }
            if (this.getTooltipText(this.dataView)) {
                tooltiptext = String(this.getTooltipText(this.dataView));
            }
            titlefontsize = this.getTitleSize(this.dataView);
            if (!titlefontsize) titlefontsize = 12;
            this.titleSize = titlefontsize;
            if (GMODonutTitleOnOffStatus && (titleText || tooltiptext)) {
                titleHeight = titlefontsize;
            }
            else { titleHeight = 0; }

            if (this.getTitleFill(this.dataView)) {
                titlecolor = this.getTitleFill(this.dataView).solid.color;
            }
            if (this.getTitleBgcolor(this.dataView)) {
                titlebgcolor = this.getTitleBgcolor(this.dataView).solid.color;
                if ("none" === titlebgcolor) {
                    titlebgcolor = "#ffffff";
                }
            }
            if (!GMODonutTitleOnOffStatus) {
                this.root.select('.Title_Div_Text').style({ 'display': 'none' });
            }
            else {
                this.root.select('.Title_Div_Text').style({ 'display': 'inline-block', 'background-color': titlebgcolor, 'font-size': PixelConverter.fromPointToPixel(titlefontsize) + 'px', 'color': titlecolor });
            }

            this.root.select('.GMODonutTitleDiv')
                .text(titleText);

            this.root.select('.GMODonutTitleIcon').style({ 'display': 'none' });

            if ("" !== tooltiptext && (1 !== this.updateCount || "" !== titleText)) {
                this.root.select('.GMODonutTitleIcon')
                    .style({ 'display': 'inline-block' })
                    .attr('title', tooltiptext);
            }

            var formatter = valueFormatter.create({ format: this.formatString, value: convertedData.labelSettings.displayUnits, precision: convertedData.labelSettings.precision });
            var aggregateFormatter = valueFormatter.create({ format: this.formatString, value: convertedData.AggregatelabelSettings.displayUnits, precision: convertedData.AggregatelabelSettings.textPrecision });
            this.data.ArcFillColor = DataViewObjects.getFillColor(this.dataView.metadata.objects, BowtieProps.general.ArcFillColor, this.data.ArcFillColor);

            var heightOfTitle = 0;
            if (this.root.select(".GMODonutTitleDiv")) {
                heightOfTitle = isNaN(parseFloat(this.root.select(".GMODonutTitleDiv").style("height"))) ? 0 : parseFloat(this.root.select(".GMODonutTitleDiv").style("height"));
            }
            var BowtieChartAggregatedWidthPercentage = 12;
            var BowtieChartSVGDestinationWidthPercentage = 60;
            var BowtieChartDestinationWidthPercentage = 26;
            var fontSize = PixelConverter.fromPointToPixel(convertedData.labelSettings.fontSize) + "px";
            var aggregateFontSize = PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) + "px";
            var showHeading = true;

            if (convertedData.chartType == 'HalfBowtie') {

                this.BowtieChartSource.style('display', 'none');
                this.BowtieChartSVGSource.style('display', 'none');
                this.BowtieMainContainer.style('width', this.currentViewport.width + 'px');
                this.BowtieMainContainer.style('height', this.currentViewport.height + 'px');
                this.BowtieChartAggregated.style('width', BowtieChartAggregatedWidthPercentage + '%');
                this.BowtieChartAggregated.style('margin-right', '1%');
                this.BowtieChartSVGDestination.style('width', BowtieChartSVGDestinationWidthPercentage + '%');
                this.BowtieChartSVGDestination.style('margin-right', '1%');
                this.BowtieChartDestination.style('width', BowtieChartDestinationWidthPercentage + '%');

                // Chart Headings
                var textPropertiesDestSourceName: TextProperties = {
                    text: this.destinationName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesDestSourceValue: TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                this.BowtieChartHeadings.selectAll('div').remove();
                this.BowtieChartHeadings.append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2 - 1) + '%')
                    .style('margin-right', '1%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'HalfBowtieDestSourceName')
                    .style('margin-left', (BowtieChartSVGDestinationWidthPercentage + BowtieChartAggregatedWidthPercentage + 2) + '%')
                    .append('span')
                    .attr('title', this.destinationName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                this.BowtieChartHeadings.append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2) + '%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'HalfBowtieDestSourceVal')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                //updated    
                var heightOfHeadings = 0;
                if (this.root.select(".BowtieChartHeadings")) {
                    heightOfHeadings = parseFloat(this.root.select(".BowtieChartHeadings").style("height"));
                }
                var numberOfValues = convertedData.dataPoints.length;
                var avaialableHeight = this.currentViewport.height - heightOfHeadings - heightOfTitle - 15;
                var category = convertedData.dataPoints[0].DestCategoryLabel;

                var textPropertiesForLabel: TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var numberOfValuesHeight = TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) * numberOfValues;
                if (numberOfValuesHeight > avaialableHeight) {
                    avaialableHeight = numberOfValuesHeight;
                    this.root.select('.BowtieMainContainer').style('overflow-y', 'auto');
                }
                else {
                    this.root.select('.BowtieMainContainer').style('overflow-y', 'hidden');
                }
                this.root.select('.BowtieMainContainer').style('overflow-x', 'hidden');
                //updated  

                var divisionHeight = avaialableHeight / numberOfValues;

                this.BowtieChartAggregated.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartDestination.style('height', avaialableHeight + 'px');

                // Aggregated Sum settings
                this.BowtieChartAggregated.select('div').remove();
                this.BowtieChartSVGDestination.selectAll('svg').remove();
                this.BowtieChartSVGSource.selectAll('svg').remove();

                var textPropertiesAggregateValue: TextProperties = {
                    text: aggregateFormatter.format(convertedData.aggregatedSum),
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textPropertiesMetricName: TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var AggregatedSum =
                    this.BowtieChartAggregated.append('div')
                        .attr('id', 'divAggregatedSum')
                        .style('float', 'right')
                        .style('text-align', 'right');

                AggregatedSum.append('div').append('span')
                    .attr('title', this.metricName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesMetricName, (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100))

                var aggregatedValue = AggregatedSum.append('div');
                aggregatedValue.append('span')
                    .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesAggregateValue, ((this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100) - PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));
                AggregatedSum
                    .style('font-size', aggregateFontSize)
                    .style('color', convertedData.AggregatelabelSettings.color);

                // Indicator logic
                var color = 'green';
                if (this.prevIndicator == false && convertedData.AggregatelabelSettings.Indicator) {
                    convertedData.AggregatelabelSettings.signIndicator = true;
                } else if (convertedData.AggregatelabelSettings.Indicator == false) {
                    convertedData.AggregatelabelSettings.signIndicator = false;
                }

                if (convertedData.AggregatelabelSettings.signIndicator) {
                    convertedData.AggregatelabelSettings.Threshold = 0;
                }

                if (convertedData.AggregatelabelSettings.Indicator) {
                    if (convertedData.AggregatelabelSettings.signIndicator) {
                        color = convertedData.aggregatedSum > 0 ? 'green' : 'red';
                    } else {
                        color = convertedData.aggregatedSum >= convertedData.AggregatelabelSettings.Threshold ? 'green' : 'red';
                    }
                    aggregatedValue.append('span')
                        .style('color', color)
                        .style('font-size', aggregateFontSize)
                        .style('margin-left', '2px')
                        .style('margin-bottom', '-1px')
                        .attr('id', 'indicator')
                        .html('&#9650');
                } else {
                    aggregatedValue.select('span#indicator').remove();
                }
                this.prevIndicator = convertedData.AggregatelabelSettings.Indicator;

                var divHeight = 0;
                if (this.root.select("#divAggregatedSum")) {
                    divHeight = parseFloat(this.root.select("#divAggregatedSum").style("height"));
                }
                AggregatedSum.style('margin-top', (avaialableHeight / 2 - divHeight / 2) + 'px');

                // Destination Settings 
                this.BowtieChartDestination.selectAll('div').remove();
                var numberOfValues = convertedData.dataPoints.length;
                var divisionHeight = avaialableHeight / numberOfValues;

                var fBranchHeight = avaialableHeight / 12;
                var fBranchHeight1 = avaialableHeight / 12;


                // checking for large datasets                
                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    if ((convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight) < 1) {
                        fBranchHeight1 = fBranchHeight1 + 0.25;
                    }
                }

                if (fBranchHeight1 > avaialableHeight) {
                    this.clearData(true);
                    return;
                }

                var fStartX = 0;
                var fStartY = avaialableHeight / 2 - fBranchHeight1 / 2;
                var fEndX = (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100;
                var fEndY = 0;
                var fCurveFactor = 0.65;
                var svg = this.BowtieChartSVGDestination
                    .append('svg')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    var category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].value);

                    var oDiv = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('margin-right', '1%')
                        .style('width', '49%');
                    var oDiv1 = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', '50%');

                    var textPropertiesForLabel: TextProperties = {
                        text: category,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: TextProperties = {
                        text: value,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    showHeading = true;
                    this.BowtieChartDestination.style('display', 'block');
                    oDiv.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                        .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel)
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');

                    oDiv1.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                        .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');

                    var percentage = convertedData.dataPoints[iDiv].value / convertedData.aggregatedSum;
                    fEndY = iDiv * (avaialableHeight / numberOfValues) + divisionHeight / 2;
                    var fPipeArea = Math.abs(fEndX - fStartX);
                    var height = convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight;
                    height = height < 1 ? 1 : height;
                    fStartY += (height / 2);
                    if (iDiv > 0) {
                        if ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) > 1) {
                            fStartY += ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) / 2);
                        }
                        else {
                            fStartY += 0.5;
                        }
                    }

                    var d = 'M ' + fStartX + ' ' + fStartY + ' C ' + (fStartX + (fPipeArea * fCurveFactor)) + ' ' + fStartY +
                        ' ' + (fEndX - fPipeArea * fCurveFactor) + ' ' + fEndY + ' ' + fEndX + ' ' + fEndY;

                    var path = svg
                        .append('path')
                        .attr('d', d)
                        .attr('stroke', this.data.ArcFillColor)
                        .attr('fill', 'none')
                        .attr('stroke-width', height);

                    var toolTipInfo: TooltipDataItem[] = [];
                    toolTipInfo.push({
                        displayName: category,
                        value: value,
                    });

                    path[0][0]['cust-tooltip'] = toolTipInfo;
                }
                if (!showHeading) {
                    this.BowtieChartHeadings.selectAll('div').remove();
                }
            } else {
                BowtieChartAggregatedWidthPercentage = 9;
                BowtieChartSVGDestinationWidthPercentage = 25;
                BowtieChartDestinationWidthPercentage = 19;

                this.BowtieChartSource.style('display', 'block');
                this.BowtieChartSVGSource.style('display', 'block');
                this.BowtieMainContainer.style('width', this.currentViewport.width + 'px');
                this.BowtieMainContainer.style('height', this.currentViewport.height + 'px');
                this.BowtieMainContainer.style('float', 'left');
                this.BowtieChartAggregated.style('width', BowtieChartAggregatedWidthPercentage + '%');
                this.BowtieChartAggregated.style('margin-right', '0%');
                this.BowtieChartSVGDestination.style('width', BowtieChartSVGDestinationWidthPercentage + '%');
                this.BowtieChartSVGDestination.style('margin-right', '1%');
                this.BowtieChartDestination.style('width', BowtieChartDestinationWidthPercentage + '%');
                this.BowtieChartSVGSource.style('width', BowtieChartSVGDestinationWidthPercentage + '%');
                this.BowtieChartSVGSource.style('margin-left', '1%');
                this.BowtieChartSource.style('width', BowtieChartDestinationWidthPercentage + '%');
                this.BowtieChartSource.style('margin-left', '1%');

                // Chart Headings
                var textPropertiesDestSourceName: TextProperties = {
                    text: this.destinationName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesDestSourceValue: TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesSourceName: TextProperties = {
                    text: this.sourceName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                this.BowtieChartHeadings.selectAll('div').remove();
                this.BowtieChartHeadings.append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2) + '%')
                    .style('margin-left', '1%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieDestSourceName')
                    .append('span')
                    .attr('title', this.sourceName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                this.BowtieChartHeadings
                    .append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2 - 1) + '%')
                    .style('float', 'left')
                    .style('text-align', 'right')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieDestSourceValue')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                var margin = BowtieChartSVGDestinationWidthPercentage * 2 + BowtieChartAggregatedWidthPercentage + 3;
                this.BowtieChartHeadings.append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2) + '%')
                    .style('float', 'left')
                    .style('margin-left', margin + '%')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieSourceName')
                    .attr('title', this.destinationName)
                    .append('span').html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                this.BowtieChartHeadings.append('div')
                    .style('width', (BowtieChartDestinationWidthPercentage / 2 - 1) + '%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieSourceValue')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                var heightOfHeadings = 0;
                if (this.root.select(".BowtieChartHeadings")) {
                    heightOfHeadings = parseFloat(this.root.select(".BowtieChartHeadings").style("height"));
                }
                var avaialableHeight = this.currentViewport.height - heightOfHeadings - heightOfTitle - 10;


                // Checking whether height is increased or not
                var numberOfValues = 0;
                var numberOfValuesSource = 0;
                for (var k = 0; k < convertedData.dataPoints.length; k++) {
                    if (convertedData.dataPoints[k].DestCategoryLabel != null)
                        numberOfValues++;
                    if (convertedData.dataPoints[k].SourceCategoryLabel != null) {
                        numberOfValuesSource++;
                    }
                }

                var category = convertedData.dataPoints[0].DestCategoryLabel;
                var textPropertiesForLabel: TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var numberOfValuesHeight = TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) * (numberOfValues > numberOfValuesSource ? numberOfValues : numberOfValuesSource);

                if (numberOfValuesHeight > avaialableHeight) {
                    avaialableHeight = numberOfValuesHeight;
                    this.root.select('.BowtieMainContainer').style('overflow-y', 'auto');
                }
                else {
                    this.root.select('.BowtieMainContainer').style('overflow-y', 'hidden');
                }
                this.root.select('.BowtieMainContainer').style('overflow-x', 'hidden');

                // Checking whether height is increased or not              
                var divisionHeight = avaialableHeight / (convertedData.dataPoints.length - numberOfValues);

                var category = convertedData.dataPoints[numberOfValues].SourceCategoryLabel;
                var textPropertiesForLabel: TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                this.BowtieChartAggregated.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGSource.style('height', avaialableHeight + 'px');
                this.BowtieChartSource.style('height', avaialableHeight + 'px');

                // Aggregated Sum settings 
                this.BowtieChartAggregated.select('div').remove();
                this.BowtieChartSVGDestination.selectAll('svg').remove();
                this.BowtieChartSVGSource.selectAll('svg').remove();

                var textPropertiesAggregateValue: TextProperties = {
                    text: aggregateFormatter.format(convertedData.aggregatedSum),
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textPropertiesMetricName: TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textWidth = TextMeasurementService.measureSvgTextWidth(textPropertiesAggregateValue);
                var AggregatedSum =
                    this.BowtieChartAggregated.append('div')
                        .attr('id', 'divAggregatedSum')
                        .style('width', (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100 + 'px')
                        .style('text-align', 'center');
                AggregatedSum.append('div').append('span')
                    .attr('title', this.metricName)
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesMetricName, (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100))
                var aggregatedValue = AggregatedSum.append('div');

                aggregatedValue.append('span')
                    .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                    .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesAggregateValue, ((this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100) - PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));

                AggregatedSum
                    .style('font-size', aggregateFontSize)
                    .style('color', convertedData.AggregatelabelSettings.color);

                // Indicator logic
                var color = 'green';
                if (this.prevIndicator == false && convertedData.AggregatelabelSettings.Indicator) {
                    convertedData.AggregatelabelSettings.signIndicator = true;
                } else if (convertedData.AggregatelabelSettings.Indicator == false) {
                    convertedData.AggregatelabelSettings.signIndicator = false;
                }

                if (convertedData.AggregatelabelSettings.signIndicator) {
                    convertedData.AggregatelabelSettings.Threshold = 0;
                }

                if (convertedData.AggregatelabelSettings.Indicator) {
                    if (convertedData.AggregatelabelSettings.signIndicator) {
                        color = convertedData.aggregatedSum > 0 ? 'green' : 'red';
                    } else {
                        color = convertedData.aggregatedSum >= convertedData.AggregatelabelSettings.Threshold ? 'green' : 'red';
                    }
                    aggregatedValue.append('span')
                        .style('color', color)
                        .style('font-size', aggregateFontSize)
                        .style('margin-left', '2px')
                        .style('margin-bottom', '-1px')
                        .attr('id', 'indicator')
                        .html('&#9650');
                } else {
                    aggregatedValue.select('span#indicator').remove();
                }
                this.prevIndicator = convertedData.AggregatelabelSettings.Indicator;

                var divHeight = 0;
                if (this.root.select("#divAggregatedSum")) {
                    divHeight = parseFloat(this.root.select("#divAggregatedSum").style("height"));
                }
                AggregatedSum.style('margin-top', (avaialableHeight / 2 - divHeight / 2) + 'px');

                // Destination Settings
                this.BowtieChartDestination.selectAll('div').remove();
                var numberOfValues = 0;
                for (var k = 0; k < convertedData.dataPoints.length; k++) {
                    if (convertedData.dataPoints[k].DestCategoryLabel != null)
                        numberOfValues++;
                }
                var divisionHeight = avaialableHeight / numberOfValues;
                var fBranchHeight = avaialableHeight / 12;
                var fBranchHeight1 = avaialableHeight / 12;

                // checking for large datasets                
                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    if ((convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight) < 1) {
                        fBranchHeight1 = fBranchHeight1 + 0.25;
                    }
                }

                if (fBranchHeight1 > avaialableHeight) {
                    this.clearData(true);
                    return;
                }

                var fStartX = 0;
                var fStartY = avaialableHeight / 2 - fBranchHeight1 / 2;
                var fEndX = (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100;
                var fEndY = 0;
                var fCurveFactor = 0.65;
                var svg = this.BowtieChartSVGDestination
                    .append('svg')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    var category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].value);
                    var oDiv = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', '50%')
                        .style('margin-right', '1%');

                    var oDiv1 = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', '49%');

                    var textPropertiesForLabel: TextProperties = {
                        text: convertedData.dataPoints[iDiv].DestCategoryLabel,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: TextProperties = {
                        text: formatter.format(convertedData.dataPoints[iDiv].value),
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    this.BowtieChartDestination.style('display', 'block');
                    oDiv.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                        .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel)
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');

                    oDiv1.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                        .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');

                    var percentage = convertedData.dataPoints[iDiv].value / convertedData.aggregatedSum;
                    fEndY = iDiv * (avaialableHeight / numberOfValues) + divisionHeight / 2;
                    var fPipeArea = Math.abs(fEndX - fStartX);
                    var height = convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight > 1 ? convertedData.dataPoints[iDiv].DestCatArcWidth * fBranchHeight : 1;
                    fStartY += (height / 2);
                    if (iDiv > 0) {
                        if ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) > 1) {
                            fStartY += ((convertedData.dataPoints[iDiv - 1].DestCatArcWidth * fBranchHeight) / 2);
                        }
                        else {
                            fStartY += 0.5;
                        }
                    }
                    var d = 'M ' + fStartX + ' ' + fStartY + ' C ' + (fStartX + (fPipeArea * fCurveFactor)) + ' ' + fStartY +
                        ' ' + (fEndX - fPipeArea * fCurveFactor) + ' ' + fEndY + ' ' + fEndX + ' ' + fEndY;

                    var path = svg
                        .append('path')
                        .attr('d', d)
                        .attr('stroke', this.data.ArcFillColor)
                        .attr('fill', 'none')
                        .attr('stroke-width', height);

                    var toolTipInfo: TooltipDataItem[] = [];
                    toolTipInfo.push({
                        displayName: category,
                        value: value,
                    });

                    path[0][0]['cust-tooltip'] = toolTipInfo;
                }

                // Source Settings               
                this.BowtieChartSource.selectAll('div').remove();
                fBranchHeight = avaialableHeight / 12;
                fBranchHeight1 = avaialableHeight / 12;

                // checking for large datasets                
                for (var iDiv = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                    if ((convertedData.dataPoints[iDiv].SourceArcWidth * fBranchHeight) < 1) {
                        fBranchHeight1 = fBranchHeight1 + 0.25;
                    }
                }

                if (fBranchHeight1 > avaialableHeight) {
                    this.clearData(true);
                    return;
                }

                var fStartX = 0;
                var fStartY = 0;
                var fEndX = (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100;
                var fEndY = avaialableHeight / 2 - fBranchHeight1 / 2;
                var fCurveFactor = 0.25;

                var divisionHeight = avaialableHeight / (convertedData.dataPoints.length - numberOfValues);
                var svg = this.BowtieChartSVGSource
                    .append('svg')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                    var category = convertedData.dataPoints[iDiv].SourceCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].srcValue);
                    var oDiv = this.BowtieChartSource
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', '50%')
                        .style('margin-right', '1%');

                    var oDiv1 = this.BowtieChartSource
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', '49%');

                    var textPropertiesForLabel: TextProperties = {
                        text: category,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: TextProperties = {
                        text: value,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    this.BowtieChartSource.style('display', 'block');
                    oDiv.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                        .attr('title', convertedData.dataPoints[iDiv].SourceCategoryLabel)
                        .style('float', 'left')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');

                    oDiv1.append('span')
                        .html(TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                        .attr('title', formatter.format(convertedData.dataPoints[iDiv].srcValue))
                        .style('float', 'right')
                        .style('font-size', fontSize)
                        .style('color', convertedData.labelSettings.labelColor)
                        .style('line-height', divisionHeight + 'px');


                    // Code for SVG Path
                    var percentage = convertedData.dataPoints[iDiv].srcValue / convertedData.aggregatedSum;
                    fStartY = ((iDiv - numberOfValues) * divisionHeight) + divisionHeight / 2;
                    var fPipeArea = Math.abs(fStartX - fEndX);

                    var height = (convertedData.dataPoints[iDiv].SourceArcWidth * fBranchHeight);
                    height = height > 1 ? height : 1;
                    fEndY += (height / 2);

                    if (iDiv > numberOfValues) {
                        if ((convertedData.dataPoints[iDiv - 1].SourceArcWidth * fBranchHeight) > 1) {
                            fEndY += ((convertedData.dataPoints[iDiv - 1].SourceArcWidth * fBranchHeight) / 2);
                        }
                        else {
                            fEndY += 0.5;
                        }
                    }
                    var d = 'M ' + fStartX + ' ' + fStartY + ' C ' + (fEndX - (fPipeArea * fCurveFactor)) + ' ' + fStartY +
                        ' ' + (fStartX + (fPipeArea * fCurveFactor)) + ' ' + fEndY + ' ' + fEndX + ' ' + fEndY;

                    var path = svg
                        .append('path')
                        .attr('d', d)
                        .attr('stroke', this.data.ArcFillColor)
                        .attr('fill', 'none')
                        .attr('stroke-width', height);

                    var toolTipInfo: TooltipDataItem[] = [];
                    toolTipInfo.push({
                        displayName: category,
                        value: value,
                    });

                    path[0][0]['cust-tooltip'] = toolTipInfo;
                }
            }

            // Adding the tooltip for each path
            this.tooltipServiceWrapper.addTooltip(d3.selectAll('svg>*'), (tooltipEvent: TooltipEventArgs<number>) => {
                return tooltipEvent.context['cust-tooltip'];
            }, (tooltipEvent: TooltipEventArgs<number>) => null, true);
        }
        private dataViewContainsCategory(dataView: DataView) {
            return dataView &&
                dataView.categorical &&
                dataView.categorical.categories &&
                dataView.categorical.categories[0];
        }

        // This function returns on/off status of the funnel title properties
        private getShowTitle(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var showTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) {
                        return <IDataLabelSettings>showTitle['show'];
                    }
                } else {
                    return<IDataLabelSettings>true;
                }
            }
            return <IDataLabelSettings>true;
        }

        /* This function returns the title text given for the title in the format window */
        private getTitleText(dataView: DataView): IDataLabelSettings {
            var returnTitleValues: string, returnTitleLegend: string, returnTitleDetails: string, returnTitle: string, tempTitle: string;
            returnTitleValues = "";
            returnTitleLegend = "";
            returnTitleDetails = "";
            returnTitle = "";
            tempTitle = "";
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var titletext = dataView.metadata.objects['GMODonutTitle'];
                    if (titletext && titletext.hasOwnProperty('titleText')) {
                        return titletext['titleText'];
                    }
                }
            }

            var iLength = 0;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (var iLength = 0; iLength < dataView.categorical.values.length; iLength++) {
                    if (dataView.categorical.values[iLength].source && dataView.categorical.values[iLength].source.roles && dataView.categorical.values[iLength].source.roles.hasOwnProperty('Value')) {
                        if (dataView.categorical.values[iLength].source.displayName) {
                            returnTitleValues = dataView.categorical.values[iLength].source.displayName;
                            break;
                        }
                    }
                }
            }
            if (dataView && dataView.categorical && dataView.categorical.categories) {
                returnTitleLegend = dataView.categorical.categories[0].source.displayName;
            }

            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[1]) {
                returnTitleDetails = dataView.categorical.categories[1].source.displayName;
            }

            if ("" !== returnTitleValues) {
                tempTitle = " by ";
            }
            if ("" !== returnTitleLegend && "" !== returnTitleDetails) {
                tempTitle = tempTitle + returnTitleLegend + " and " + returnTitleDetails;
            }
            else if ("" === returnTitleLegend && "" === returnTitleDetails) {
                tempTitle = "";
            }
            else {
                // means one in empty and other is non empty
                tempTitle = tempTitle + returnTitleLegend + returnTitleDetails;
            }

            returnTitle = returnTitleValues + tempTitle;
            return returnTitle;
        }

        // This function returns the tool tip text given for the tooltip in the format window
        private getTooltipText(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var tooltiptext = dataView.metadata.objects['GMODonutTitle'];
                    if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) {
                        return <IDataLabelSettings>tooltiptext['tooltipText'];
                    }
                } else {
                    return <IDataLabelSettings>'Your tooltip text goes here';
                }
            }
            return <IDataLabelSettings>'Your tooltip text goes here';
        }

        // This function returns the font colot selected for the title in the format window
        private getTitleFill(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fill1')) {
                        return <Fill>FTitle['fill1'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, BowtieProps.titleFill, { solid: { color: '#333333' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, BowtieProps.titleFill, { solid: { color: '#333333' } });
        }

        // This function returns the background color selected for the title in the format window
        private getTitleBgcolor(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('backgroundColor')) {
                        return <Fill>FTitle['backgroundColor'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, BowtieProps.titleBackgroundColor, { solid: { color: 'none' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, BowtieProps.titleBackgroundColor, { solid: { color: 'none' } });
        }

        // This function returns the funnel title font size selected for the title in the format window
        private getTitleSize(dataView: DataView) {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fontSize')) {
                        return FTitle['fontSize'];
                    }
                } else {
                    return 9;
                }
            }
            return 9;
        }

        // This function retruns the values to be displayed in the property pane for each object.
        // Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
        // validation and return other values/defaults
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ArcFillColor: this.data.ArcFillColor,
                        }
                    });
                    break;
                case 'GMODonutTitle':
                    enumeration.push({
                        objectName: 'GMODonutTitle',
                        displayName: 'Bowtie title',
                        selector: null,
                        properties: {
                            show: this.getShowTitle(this.dataViews[0]),
                            titleText: this.getTitleText(this.dataViews[0]),
                            tooltipText: this.getTooltipText(this.dataViews[0]),
                            fill1: this.getTitleFill(this.dataViews[0]),
                            backgroundColor: this.getTitleBgcolor(this.dataViews[0]),
                            fontSize: this.getTitleSize(this.dataViews[0]),
                        }
                    });
                    break;
                case 'labels':
                    enumeration.push({
                        objectName: 'labels',
                        displayName: 'Data Labels',
                        selector: null,
                        properties: {
                            color: this.data.labelSettings.labelColor,
                            displayUnits: this.data.labelSettings.displayUnits,
                            textPrecision: this.data.labelSettings.precision,
                            fontSize: this.data.labelSettings.fontSize
                        }
                    });
                    break;
                case 'Aggregatelabels':
                    enumeration.push({
                        objectName: 'Aggregatelabels',
                        displayName: 'Summary Label Settings',
                        selector: null,
                        properties: {
                            color: this.data.AggregatelabelSettings.color,
                            displayUnits: this.data.AggregatelabelSettings.displayUnits,
                            textPrecision: this.data.AggregatelabelSettings.textPrecision,
                            fontSize: this.data.AggregatelabelSettings.fontSize,
                            Indicator: this.data.AggregatelabelSettings.Indicator,
                            signIndicator: this.data.AggregatelabelSettings.signIndicator,
                            Threshold: this.data.AggregatelabelSettings.Threshold,
                        }
                    });
                    break;
            }
            return enumeration;
        }
    }
}