module powerbi.visuals.samples {
    import ArcDescriptor = D3.Layout.ArcDescriptor;
    import SelectionManager = utility.SelectionManager;
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import ValueFormatter = powerbi.visuals.valueFormatter;
    import PixelConverter = jsCommon.PixelConverter;

    var AsterPlotVisualClassName: string = 'Bowtie';

    export interface BowtieData {
        dataPoints: BowtieDataPoint[];
        valueFormatter: IValueFormatter;
        legendObjectProps: DataViewObject;
        labelSettings: VisualDataLabelsSettings;
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

    export class BowtieChart implements IVisual {
        private svg: D3.Selection;
        private BowtieMainContainer: D3.Selection;
        private BowtieChartAggregated: D3.Selection;
        private BowtieChartDestination: D3.Selection;
        private DestinationSVG: D3.Selection;
        private BowtieChartSVGDestination: D3.Selection;
        private BowtieChartSVGSource: D3.Selection;
        private BowtieChartSource: D3.Selection;
        private BowtieChartError: D3.Selection;
        private mainGroupElement: D3.Selection;
        private BowtieChartHeadings: D3.Selection;
        private centerText: D3.Selection;
        private colors: IDataColorPalette;
        private selectionManager: SelectionManager;
        private dataView: DataView;
        private dataViews: DataView[];
        private hostService: IVisualHostServices;
        private legend: ILegend;
        private data: BowtieData;
        private currentViewport: IViewport;
        private convertedData: BowtieData;
        private metricName: string;
        private sourceName: string;
        private destinationName: string;
        private root: D3.Selection;
        private titleSize: number = 12;
        private updateCount: number = 0;
        private prevIndicator = false;
        private isNegative = false;
        private formatString = '0';

        private getDefaultBowtieData(): BowtieData {
            return <BowtieData>{
                dataPoints: [],
                legendObjectProps: {},
                valueFormatter: null,
                labelSettings: dataLabelUtils.getDefaultDonutLabelSettings(),
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

        public converter(dataView: DataView, colors: IDataColorPalette): BowtieData {
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
                aggregatedSum = d3.sum(values[0].values, function (d) {
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
                    var destCatSum = 0;
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
                        if (Date.parse(category) && (formatter.format(category) != 'dddd MMMM %d yyyy')) {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: formatter.format(category),
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: SelectionId.createWithId(catDestination.identity[i]),
                                value: destCatSum,
                                srcValue: 0
                            });
                        } else {
                            asterDataResult.dataPoints.push({
                                DestCategoryLabel: category,
                                SourceCategoryLabel: null,
                                DestCatArcWidth: destArcWidth,
                                SourceArcWidth: null,
                                color: '',
                                selector: SelectionId.createWithId(catDestination.identity[i]),
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
                    var category = catSourceValues[i];
                    var destArcWidth = 0;
                    var destCatSum = 0;
                    category = category ? category : "(Blank)";
                    for (var j = 0; j < srcLength; j++) {
                        var value = values[0].values[j];
                        if (value < 0) {
                            this.isNegative = true;
                            return;
                        }
                        var innerCat = catSourceValues[j];
                        innerCat = (innerCat ? catSourceValues[j] : "(Blank)");
                        if (innerCat == category)
                            destCatSum += value;
                    }
                    if (aggregatedSum > 0)
                        destArcWidth = destCatSum / aggregatedSum;

                    if (arrSource.indexOf(category) == -1 && destCatSum != 0) {
                        if (Date.parse(category) && (formatter.format(category) != 'dddd MMMM %d yyyy')) {
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
                                SourceCategoryLabel: category,
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

        public init(options: VisualInitOptions): void {
            this.hostService = options.host;
            this.selectionManager = new SelectionManager({ hostServices: options.host });
            var element: JQuery = options.element;
            this.root = d3.select(options.element.get(0));

            var container: D3.Selection = this.BowtieMainContainer = d3.select(element.get(0))
                .append('div')
                .classed('BowtieMainContainer', true);

            container
                .append('div')
                .classed('Title_Div_Text', true)
                .style({ 'width': '100%', 'display': 'inline-block' })
                .html('<div class = "GMODonutTitleDiv" style = "max-width: 80%; display: inline-block">' + '</div>'
                + '<span class = "GMODonutTitleIcon" style = "width: 2%; display: none; cursor: pointer; position: absolute">&nbsp(&#063;)</span>');


            var BowtieChartError: D3.Selection = this.BowtieChartError = container
                .append('div')
                .classed('BowtieChartError', true);

            var BowtieChartHeadings: D3.Selection = this.BowtieChartHeadings = container
                .append('div')
                .classed('BowtieChartHeadings', true);

            var BowtieChartSource: D3.Selection = this.BowtieChartSource = container
                .append('div')
                .classed('BowtieChartSource', true);

            var BowtieChartSVGSource: D3.Selection = this.BowtieChartSVGSource = container
                .append('div')
                .classed('BowtieChartSVGSource', true);

            var BowtieChartAggregated: D3.Selection = this.BowtieChartAggregated = container
                .append('div')
                .classed('BowtieChartAggregated', true);

            var BowtieChartSVGDestination: D3.Selection = this.BowtieChartSVGDestination = container
                .append('div')
                .classed('BowtieChartSVGDestination', true);

            var BowtieChartDestination: D3.Selection = this.BowtieChartDestination = container
                .append('div')
                .classed('BowtieChartDestination', true);
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
            var convertedData: BowtieData = this.data = this.converter(dataView, this.colors);

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
                , titleText: IDataLabelSettings = ""
                , tooltiptext: IDataLabelSettings = ""
                , titlefontsize: number
                , titleHeight: number
                , titlecolor: IDataLabelSettings
                , titlebgcolor: IDataLabelSettings;

            if (this.getShowTitle(this.dataView)) {
                GMODonutTitleOnOffStatus = true;
            }
            if (this.getTitleText(this.dataView)) {
                titleText = this.getTitleText(this.dataView);
            }
            if (this.getTooltipText(this.dataView)) {
                tooltiptext = this.getTooltipText(this.dataView);
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
                var textPropertiesDestSourceName: powerbi.TextProperties = {
                    text: this.destinationName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesDestSourceValue: powerbi.TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                this.BowtieChartHeadings.selectAll('div').remove();
                this.BowtieChartHeadings.append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px')
                    .style('margin-right', '1%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'HalfBowtieDestSourceName')
                    .style('margin-left', (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartAggregatedWidthPercentage + 1)) / 100 + 'px')
                    .append('span')
                    .attr('title', this.destinationName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                this.BowtieChartHeadings.append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'HalfBowtieDestSourceName')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                var heightOfHeadings = 0;
                if (this.root.select(".BowtieChartHeadings")) {
                    heightOfHeadings = parseFloat(this.root.select(".BowtieChartHeadings").style("height"));
                }
                var avaialableHeight = this.currentViewport.height - heightOfHeadings - heightOfTitle - 15;

                // Checking whether height is increased or not
                var numberOfValues = convertedData.dataPoints.length;
                var divisionHeight = avaialableHeight / numberOfValues;
                var category = convertedData.dataPoints[0].DestCategoryLabel;
                var textPropertiesForLabel: powerbi.TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };
                if (divisionHeight <= TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel)) {
                    showHeading = false;
                    avaialableHeight = this.currentViewport.height - 0 - heightOfTitle - 15; // heightOfHeadings will be 0 in this case
                } else {
                    showHeading = true;
                }

                this.BowtieChartAggregated.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartDestination.style('height', avaialableHeight + 'px');

                // Aggregated Sum settings
                this.BowtieChartAggregated.select('div').remove();
                this.BowtieChartSVGDestination.selectAll('svg').remove();
                this.BowtieChartSVGSource.selectAll('svg').remove();

                var textPropertiesAggregateValue: powerbi.TextProperties = {
                    text: aggregateFormatter.format(convertedData.aggregatedSum),
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textPropertiesMetricName: powerbi.TextProperties = {
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
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesMetricName, (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100))

                var aggregatedValue = AggregatedSum.append('div');
                aggregatedValue.append('span')
                    .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesAggregateValue, ((this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100) - PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));
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
                        fBranchHeight1 = fBranchHeight1 + 1;
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
                    .style('width', (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100 + 'px')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    var category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].value);
                    var oDiv = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('margin-right', '1%')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px');
                    var oDiv1 = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px');

                    var textPropertiesForLabel: powerbi.TextProperties = {
                        text: category,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: powerbi.TextProperties = {
                        text: value,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    if (divisionHeight > TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) && showHeading) {
                        showHeading = true;
                        this.BowtieChartDestination.style('display', 'block');
                        oDiv.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');

                        oDiv1.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');
                    } else {
                        showHeading = false;
                        this.BowtieChartDestination.style('display', 'none');
                        fEndX = (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100;
                        this.BowtieChartSVGDestination.style('width', BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage + '%');
                        svg.style('width', (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100 + 'px');
                    }

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
                var textPropertiesDestSourceName: powerbi.TextProperties = {
                    text: this.destinationName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesDestSourceValue: powerbi.TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                var textPropertiesSourceName: powerbi.TextProperties = {
                    text: this.sourceName,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };

                this.BowtieChartHeadings.selectAll('div').remove();
                this.BowtieChartHeadings.append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px')
                    .style('margin-left', '1%')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieDestSourceName')
                    .append('span')
                    .attr('title', this.sourceName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                this.BowtieChartHeadings
                    .append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px')
                    .style('float', 'left')
                    .style('text-align', 'right')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieDestSourceValue')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                var margin = BowtieChartSVGDestinationWidthPercentage * 2 + BowtieChartAggregatedWidthPercentage + 3;
                this.BowtieChartHeadings.append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px')
                    .style('float', 'left')
                    .style('margin-left', (this.currentViewport.width * margin) / 100 + 'px')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieSourceName')
                    .attr('title', this.destinationName)
                    .append('span').html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceName, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100));

                this.BowtieChartHeadings.append('div')
                    .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px')
                    .style('float', 'left')
                    .style('font-size', fontSize)
                    .attr('id', 'FullBowtieSourceValue')
                    .append('span')
                    .attr('title', this.metricName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesDestSourceValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100));

                var heightOfHeadings = 0;
                if (this.root.select(".BowtieChartHeadings")) {
                    heightOfHeadings = parseFloat(this.root.select(".BowtieChartHeadings").style("height"));
                }
                var avaialableHeight = this.currentViewport.height - heightOfHeadings - heightOfTitle - 10;


                // Checking whether height is increased or not
                var numberOfValues = 0;
                for (var k = 0; k < convertedData.dataPoints.length; k++) {
                    if (convertedData.dataPoints[k].DestCategoryLabel != null)
                        numberOfValues++;
                }
                var divisionHeight = avaialableHeight / numberOfValues;
                var category = convertedData.dataPoints[0].DestCategoryLabel;
                var textPropertiesForLabel: powerbi.TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };
                if (divisionHeight <= TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel)) {
                    showHeading = false;
                    avaialableHeight = this.currentViewport.height - 0 - heightOfTitle - 15; // heightOfHeadings will be 0 in this case
                } else {
                    showHeading = true;
                }

                // Checking whether height is increased or not				
                var divisionHeight = avaialableHeight / (convertedData.dataPoints.length - numberOfValues);
                var category = convertedData.dataPoints[numberOfValues].SourceCategoryLabel;
                var textPropertiesForLabel: powerbi.TextProperties = {
                    text: category,
                    fontFamily: "Segoe UI",
                    fontSize: fontSize
                };
                if (divisionHeight <= TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel)) {
                    showHeading = false;
                    avaialableHeight = this.currentViewport.height - 0 - heightOfTitle - 15; // heightOfHeadings will be 0 in this case
                }

                this.BowtieChartAggregated.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartDestination.style('height', avaialableHeight + 'px');
                this.BowtieChartSVGSource.style('height', avaialableHeight + 'px');
                this.BowtieChartSource.style('height', avaialableHeight + 'px');

                // Aggregated Sum settings 
                this.BowtieChartAggregated.select('div').remove();
                this.BowtieChartSVGDestination.selectAll('svg').remove();
                this.BowtieChartSVGSource.selectAll('svg').remove();

                var textPropertiesAggregateValue: powerbi.TextProperties = {
                    text: aggregateFormatter.format(convertedData.aggregatedSum),
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textPropertiesMetricName: powerbi.TextProperties = {
                    text: this.metricName,
                    fontFamily: "Segoe UI",
                    fontSize: aggregateFontSize
                };

                var textWidth = powerbi.TextMeasurementService.measureSvgTextWidth(textPropertiesAggregateValue);
                var AggregatedSum =
                    this.BowtieChartAggregated.append('div')
                        .attr('id', 'divAggregatedSum')
                        .style('width', (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100 + 'px')
                        .style('text-align', 'center');
                AggregatedSum.append('div').append('span')
                    .attr('title', this.metricName)
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesMetricName, (this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100))
                var aggregatedValue = AggregatedSum.append('div');

                aggregatedValue.append('span')
                    .attr('title', aggregateFormatter.format(convertedData.aggregatedSum))
                    .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesAggregateValue, ((this.currentViewport.width * BowtieChartAggregatedWidthPercentage) / 100) - PixelConverter.fromPointToPixel(convertedData.AggregatelabelSettings.fontSize) - 2));

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
                        fBranchHeight1 = fBranchHeight1 + 1;
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
                    .style('width', (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100 + 'px')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = 0; iDiv < numberOfValues; iDiv++) {
                    var category = convertedData.dataPoints[iDiv].DestCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].value);
                    var oDiv = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px')
                        .style('margin-right', '1%');

                    var oDiv1 = this.BowtieChartDestination
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px');

                    var textPropertiesForLabel: powerbi.TextProperties = {
                        text: convertedData.dataPoints[iDiv].DestCategoryLabel,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: powerbi.TextProperties = {
                        text: formatter.format(convertedData.dataPoints[iDiv].value),
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    if (divisionHeight > TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) && showHeading) {
                        showHeading = true;
                        this.BowtieChartDestination.style('display', 'block');
                        oDiv.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                            .attr('title', convertedData.dataPoints[iDiv].DestCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');

                        oDiv1.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].value))
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');
                    } else {
                        showHeading = false;
                        this.BowtieChartDestination.style('display', 'none');
                        fEndX = (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100;
                        this.BowtieChartSVGDestination.style('width', BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage + '%');
                        svg.style('width', (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100 + 'px');
                    }

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
                        fBranchHeight1 = fBranchHeight1 + 1;
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
                    .style('width', (this.currentViewport.width * BowtieChartSVGDestinationWidthPercentage) / 100 + 'px')
                    .style('height', avaialableHeight + 'px');

                for (var iDiv = numberOfValues; iDiv < (convertedData.dataPoints.length); iDiv++) {
                    var category = convertedData.dataPoints[iDiv].SourceCategoryLabel;
                    var value = formatter.format(convertedData.dataPoints[iDiv].srcValue);
                    var oDiv = this.BowtieChartSource
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100 + 'px')
                        .style('margin-right', '1%');

                    var oDiv1 = this.BowtieChartSource
                        .append('div')
                        .style('height', divisionHeight + 'px')
                        .style('width', (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100 + 'px');

                    var textPropertiesForLabel: powerbi.TextProperties = {
                        text: category,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    var textPropertiesForValue: powerbi.TextProperties = {
                        text: value,
                        fontFamily: "Segoe UI",
                        fontSize: fontSize
                    };

                    if (divisionHeight > TextMeasurementService.measureSvgTextHeight(textPropertiesForLabel) && showHeading) {
                        showHeading = true;
                        this.BowtieChartSource.style('display', 'block');
                        oDiv.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForLabel, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2)) / 100))
                            .attr('title', convertedData.dataPoints[iDiv].SourceCategoryLabel)
                            .style('float', 'left')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');

                        oDiv1.append('span')
                            .html(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesForValue, (this.currentViewport.width * (BowtieChartDestinationWidthPercentage / 2 - 1)) / 100))
                            .attr('title', formatter.format(convertedData.dataPoints[iDiv].srcValue))
                            .style('float', 'right')
                            .style('font-size', fontSize)
                            .style('color', convertedData.labelSettings.labelColor)
                            .style('line-height', divisionHeight + 'px');
                    } else {
                        showHeading = false;
                        this.BowtieChartSource.style('display', 'none');
                        fEndX = (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100;
                        this.BowtieChartSVGSource.style('width', BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage + '%');
                        svg.style('width', (this.currentViewport.width * (BowtieChartSVGDestinationWidthPercentage + BowtieChartDestinationWidthPercentage)) / 100 + 'px');
                    }

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
                if (!showHeading) {
                    this.BowtieChartHeadings.selectAll('div').remove();
                }
            }

            // Adding the tooltip for each path
            TooltipManager.addTooltip(this.root.selectAll('svg > path'), (tooltipEvent: TooltipEvent) => {
                return tooltipEvent.context['cust-tooltip'];
            }, true);
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
                    return <IDataLabelSettings>true;
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
                        return <IDataLabelSettings>titletext['titleText'];
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
            return <IDataLabelSettings>returnTitle;
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
            var enumeration = new ObjectEnumerationBuilder();
            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ArcFillColor: this.data.ArcFillColor,
                        }
                    });
                    break;
                case 'GMODonutTitle':
                    enumeration.pushInstance({
                        objectName: 'GMODonutTitle',
                        displayName: 'GMO Bowtie title',
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
                    enumeration.pushInstance({
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
                    enumeration.pushInstance({
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
            return enumeration.complete();
        }

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Source',
                    kind: powerbi.VisualDataRoleKind.Grouping,
                    displayName: 'Source',
                },
                {
                    name: 'Value',
                    kind: powerbi.VisualDataRoleKind.Measure,
                    displayName: 'Value',
                },
                {
                    name: 'Destination',
                    kind: powerbi.VisualDataRoleKind.Grouping,
                    displayName: 'Destination'
                }
            ],
            dataViewMappings: [{
                conditions: [
                    { 'Source': { max: 1 }, 'Value': { max: 1 }, 'Destination': { max: 1 } }
                ],
                categorical: {
                    categories: {
                        for: { in: 'Source' },
                        dataReductionAlgorithm: { top: {} }
                    },

                    values: {
                        select: [
                            { bind: { to: 'Value' } },
                            { bind: { to: 'Destination' } },
                        ]
                    },
                }
            }],
            suppressDefaultTitle: true,
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        ArcFillColor: {
                            displayName: 'Arc Fill Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },
                GMODonutTitle: {
                    displayName: 'GMO Bowtie Title',
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Title Text',
                            description: 'The name of the visual',
                            type: { text: true }
                        },
                        fill1: {
                            displayName: 'Font color',
                            description: 'Font color for the GMO title',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for the GMO title',
                            type: { formatting: { fontSize: true } }
                        },
                        backgroundColor: {
                            displayName: 'Background color',
                            description: 'Background color for the GMO title',
                            type: { fill: { solid: { color: true } } }
                        },
                        tooltipText: {
                            displayName: 'Tooltip Text',
                            description: 'Tooltip text for the GMO title',
                            type: { text: true }
                        }
                    },
                },
                labels: {
                    displayName: "Data Labels",
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        displayUnits: {
                            displayName: 'Display Units',
                            description: 'Select the type of decimal units',
                            type: { formatting: { labelDisplayUnits: true } },
                        },
                        textPrecision: {
                            displayName: 'Decimal Places',
                            description: 'Enter the precision value',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for labels',
                            type: { formatting: { fontSize: true } }
                        }
                    }
                },

                Aggregatelabels: {
                    displayName: "Summary Label Settings",
                    description: "Summary Label Settings",
                    properties: {
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        displayUnits: {
                            displayName: 'Display Units',
                            description: 'Select the type of decimal units',
                            type: { formatting: { labelDisplayUnits: true } },
                        },
                        textPrecision: {
                            displayName: 'Decimal Places',
                            description: 'Enter the precision value',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for labels',
                            type: { formatting: { fontSize: true } }
                        },
                        Indicator: {
                            type: { bool: true }
                        },
                        signIndicator: {
                            displayName: 'Sign Indicator',
                            description: 'Indicator based on sign',
                            placeHolderText: true,
                            type: { bool: true }
                        },
                        Threshold: {
                            displayName: 'Threshold',
                            description: 'Indicator based on threshold value',
                            type: { numeric: true }
                        },
                    }
                },
            },
        };
    }
}