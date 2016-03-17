
/// <reference path="../../_references.ts"/>

module powerbi.visuals {
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import PixelConverter = jsCommon.PixelConverter;
    import ISize = shapes.ISize;
    import DonutConstructorOptions = powerbi.visuals.DonutConstructorOptions;
    import DonutArcDescriptor = powerbi.visuals.DonutArcDescriptor;
    import DonutDataPoint = powerbi.visuals.DonutDataPoint;
    import DonutLayout = powerbi.visuals.DonutLayout;
    import DonutChart = powerbi.visuals.DonutChart;
    export interface DonutChartSettings {
        /**
         * The duration for a long animation displayed after a user interaction with an interactive chart. 
         */
        chartRotationAnimationDuration?: number;
        /**
         * The duration for a short animation displayed after a user interaction with an interactive chart.
         */
        legendTransitionAnimationDuration?: number;
    }
    export interface DonutDataGMO {
        dataPointsToDeprecate: DonutDataPoint[];
        dataPoints: DonutArcDescriptor[]; // The data points will be culled based on viewport size to remove invisible slices
        unCulledDataPoints: DonutDataPoint[]; // The unculled data points will never be culled
        dataPointsToEnumerate?: LegendDataPoint[];
        legendData: LegendData;
        hasHighlights: boolean;
        dataLabelsSettings: VisualDataLabelsSettings;
        legendObjectProperties?: DataViewObject;
        maxValue?: number;
        visibleGeometryCulled?: boolean;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
        primaryMeasureSum?: number;
        secondaryMeasureSum?: number;
    }
    export interface InteractivityState {
        interactiveLegend: DonutChartInteractiveLegend;
        valueToAngleFactor: number; // Ratio between 360 and the sum of the angles
        sliceAngles: number[]; // Saves the angle to rotate of each slice
        currentRotate: number; // Keeps how much the donut is rotated by
        interactiveChosenSliceFinishedSetting: boolean; // flag indicating whether the chosen interactive slice was set
        lastChosenInteractiveSliceIndex: number; // keeps the index of the selected slice
        donutCenter: { // center of the chart
            x: number; y: number;
        };
        totalDragAngleDifference: number; // keeps how much of a rotation happened in the drag
        previousDragAngle: number; // previous angle of the drag event
        currentIndexDrag: number; // index of the slice that is currently showing in the legend 
        previousIndexDrag: number; // index of the slice that was showing in the legend before current drag event
    }
    export var DonutChartGMOProperties = {
        general: {
            formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },
        },
        dataPoint: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            detailedLegend: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'detailedLegend' },
            legendDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'legendDisplayUnits' },
            legendPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'legendPrecision' },
        },
        // MAQCode
        show: { objectName: 'GMODonutTitle', propertyName: 'show' },
        titleText: { objectName: 'GMODonutTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'GMODonutTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'GMODonutTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'GMODonutTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'GMODonutTitle', propertyName: 'tooltipText' },

        // Indicators code
        Indicators: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'show' },

            PrimaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'PrimaryMeasure' },
            Threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Threshold' },
            Total_threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Total_threshold' },
        },

        SMIndicator: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'show' },
            SecondaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SecondaryMeasure' },
            SMThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMThreshold' },
            SMTotalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMTotalThreshold' },
        }
    };
    export var detailedLegendType: IEnumType = createEnumType([
        { value: 'None', displayName: 'None' },
        { value: 'Value', displayName: 'Value' },
        { value: 'Percentage', displayName: 'Percentage' },
        { value: 'Both', displayName: 'Both' }
    ]);
    export class DonutChartInteractiveLegend {
        private static LegendContainerClassName = 'legend-container';
        private static LegendItemClassName = 'legend-item';
        public static InteractiveLegendClassName = 'donutLegend';
        private static LegendContainerSelector = '.legend-container';
        private static LegendItemSelector = '.legend-item';
        private static LegendItemCategoryClassName = 'category';
        private static LegendItemPercentageClassName = 'percentage';
        private static LegendSecondaryClassName = 'secondary';
        private static MaxLegendItemBoxSize = 160;
        private static ItemMargin = 10; // Margin between items
        private static MinimumSwipeDX = 15; // Minimup swipe gesture to create a change in the legend
        private static MinimumItemsInLegendForCycled = 3; // Minimum items in the legend before we cycle it
        private donutChart: DonutChartGMO;
        private legendContainerParent: D3.Selection;
        private legendContainer: D3.Selection;
        private legendContainerWidth: number;
        private data: DonutDataPoint[];
        private colors: IDataColorPalette;
        private visualInitOptions: VisualInitOptions;
        public noOfLegends: number = 0;
        public noOfColumns: number = 0;
        private currentNumberOfLegendItems: number;
        private currentIndex: number;
        private leftMostIndex: number;
        private rightMostIndex: number;
        private currentXOffset: number;
        private legendItemsPositions: { startX: number; boxWidth: number; }[];
        private legendTransitionAnimationDuration: number;

        constructor(donutChart: DonutChartGMO, legendContainer: D3.Selection, colors: IDataColorPalette, visualInitOptions: VisualInitOptions, settings?: DonutChartSettings) {
            this.legendContainerParent = legendContainer;
            this.colors = colors;
            this.donutChart = donutChart;
            this.visualInitOptions = visualInitOptions;
            this.legendItemsPositions = [];

            this.legendTransitionAnimationDuration = settings && settings.legendTransitionAnimationDuration ? settings.legendTransitionAnimationDuration : 0;
        }

        public drawLegend(donutObject: DonutDataGMO, dataViews: any, legendContainerHeight: any, parentViewPort: any): void {
            this.data = donutObject.unCulledDataPoints;
            this.currentNumberOfLegendItems = this.data.length;
            this.currentIndex = 0;
            this.leftMostIndex = 0;
            this.rightMostIndex = this.data.length - 1;
            var displayUnits, modelPrecisionValue;
            var precisionValue = DonutChartGMO.prototype.getLegendDispalyUnits(dataViews, 'labelPrecision');
            if (!precisionValue) {
                if ((this.data.length > 0) && (this.data[0].tooltipInfo.length > 1) && (this.data[0].tooltipInfo[1].value.indexOf('.') > -1))
                    modelPrecisionValue = this.data[0].tooltipInfo[1].value.split('.')[1].length;
            }
            else {
                modelPrecisionValue = precisionValue;
            }

            if (modelPrecisionValue > 20)
                modelPrecisionValue = 20;
            if (precisionValue > 20)
                precisionValue = 20;
            if (DonutChartGMO.prototype.getLegendDispalyUnits(dataViews, 'labelDisplayUnits')) {
                displayUnits = DonutChartGMO.prototype.getLegendDispalyUnits(dataViews, 'labelDisplayUnits');
            }
            else {
                displayUnits = 0;
            }

            if (this.legendContainerParent.select(DonutChartInteractiveLegend.LegendContainerSelector).empty()) {
                this.legendContainer = this.legendContainerParent.append('div').classed(DonutChartInteractiveLegend.LegendContainerClassName, true);
            }

            var legendItems = this.legendContainer.selectAll(DonutChartInteractiveLegend.LegendItemSelector).data(this.data);
            var legendContainerWidth = this.legendContainerWidth = this.legendContainer.node().getBoundingClientRect().width;
            var initialXOffset = legendContainerWidth / (legendContainerWidth / 2 * this.currentNumberOfLegendItems); //Set Initial off set value by dividing total with by twice the no. of legend items
            var currX = initialXOffset;
            this.currentXOffset = initialXOffset;

            // Given the legend item div, create the item values (category, percentage and measure) on top of it.
            var createLegendItem = (itemDiv: JQuery, datum: DonutDataPoint) => {
                var itemType: string = '';
                if ($(itemDiv[0]).hasClass('titleLegendText')) {
                    itemType = 'Title';
                }
                // position the legend item
                if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'Top') {
                    this.legendContainer.style({ 'position': 'absolute', 'height': '', 'text-align': 'left', 'top': '', 'transform': '', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                            //'margin-right': DonutChartInteractiveLegend.ItemMargin + 'px',
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'TopCenter') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '100%', 'height': '', 'text-align': 'center', 'top': '', 'transform': '', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',=
                            'left': currX,
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'Bottom') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '100%', 'height': '', 'text-align': 'left', 'top': '100%', 'transform': 'translate(0, -40%)', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'BottomCenter') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '100%', 'height': '', 'text-align': 'center', 'top': '100%', 'transform': 'translate(0, -40%)', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'Left') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '', 'height': '100%', 'text-align': 'left', 'top': '', 'transform': '', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                            'float': 'left',
                            'clear': 'both',
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'LeftCenter') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '', 'height': '100%', 'text-align': 'left', 'top': '50%', 'transform': 'translate(0, -50%)', 'left': '' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                            'float': 'left',
                            'clear': 'both',
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'Right') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '', 'height': '100%', 'text-align': 'left', 'top': '', 'transform': 'translate(-75%, 0)', 'left': '85%' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                            'float': 'left',
                            'clear': 'both',
                        });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['position'] === 'RightCenter') {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '', 'height': '100%', 'text-align': 'left', 'top': '50%', 'transform': 'translate(0, -50%)', 'left': '85%' });
                    itemDiv
                        .css({
                            'display': 'inline-block',
                            //'position': 'absolute',
                            'left': currX,
                            'float': 'left',
                            'clear': 'both',

                        });
                }
                else {
                    this.legendContainer.style({ 'position': 'absolute', 'width': '100%', 'height': '', 'text-align': 'left', 'top': '', 'transform': '', 'left': '' });
                    itemDiv
                        .css({
                            //'position': 'absolute',
                            'display': 'inline-block',
                            'left': currX,
                            //'margin-right': DonutChartInteractiveLegend.ItemMargin + 'px',
                        });

                }
                var isSecondaryMeasure, secondaryMeasureIndex, secondaryColumnName;
                for (var i = 0; i < dataViews.metadata.columns.length; i++) {
                    if (dataViews.metadata.columns[i].roles.hasOwnProperty('SecondaryMeasure')) {
                        isSecondaryMeasure = true;
                        secondaryMeasureIndex = i;
                        secondaryColumnName = dataViews.metadata.columns[i].displayName;
                        break;
                    }
                }
                if (itemType !== 'Title') {

                    // Add the category, percentage and value
                    var itemCategory: string;
                    var showDetail = false;
                    if (datum.tooltipInfo && datum.tooltipInfo[1]) {
                        for (var i = 0; i < dataViews.metadata.columns.length; i++) {
                            if (dataViews.metadata.columns[i].roles && dataViews.metadata.columns[i].roles.hasOwnProperty('Series')) {
                                showDetail = true;
                                break;
                            }
                        }
                        if (!showDetail) {
                            itemCategory = valueFormatter.format(datum.label);
                        } else {
                            itemCategory = valueFormatter.format(datum.label) + '-' + datum.tooltipInfo[1].value;
                        }

                    } else {
                        itemCategory = valueFormatter.format(datum.label);
                    }
                    var isPrimaryPercentage;
                    var itemValue = valueFormatter.format(datum.measure, datum.measureFormat);
                    var itemPercentage = valueFormatter.format(datum.percentage, '0.00 %;-0.00 %;0.00 %');
                    var itemColor = datum.color;
                    var indicatorValue = dataViews.categorical.values[0].values[index];
                    var formattedValue;
                    if (datum.measureFormat && datum.measureFormat.search('%') > 0) {
                        formattedValue = itemValue;
                        isPrimaryPercentage = true;
                    }
                    else {
                        isPrimaryPercentage = false;
                        if (isNaN(parseInt(indicatorValue, 10))) {
                            formattedValue = '';
                        }
                        else {
                            formattedValue = DonutChartGMO.prototype.format(parseInt(indicatorValue, 10), displayUnits, modelPrecisionValue, 'sample');
                            if (isNaN(parseInt(itemValue, 10)) || isNaN(parseInt(itemValue[itemValue.length - 1], 10)))
                                formattedValue = this.addSpecialCharacters(formattedValue, itemValue);
                        }
                    }
                    // console.log(formattedValue);
                    if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['detailedLegend']) {
                        if (donutObject.legendObjectProperties['detailedLegend'] === "None") {
                            formattedValue = '';
                            itemPercentage = '';
                        } else if (donutObject.legendObjectProperties['detailedLegend'] === "Value") {
                            itemPercentage = '';
                        } else if (donutObject.legendObjectProperties['detailedLegend'] === "Percentage") {
                            formattedValue = '';
                        }
                    } else {

                        formattedValue = '';
                        itemPercentage = '';
                    }
                    // Create basic spans for width calculations
                    //var itemValueSpan = DonutChartInteractiveLegend.createBasicLegendItemSpan(DonutChartInteractiveLegend.LegendItemValueClassName, itemValue, 11);

                    var itemCategorySpan = DonutChartInteractiveLegend.createBasicLegendItemSpan(DonutChartInteractiveLegend.LegendItemCategoryClassName, itemCategory, PixelConverter.fromPointToPixel(donutObject.legendData.fontSize), donutObject.legendData.labelColor);
                    var itemPercentageSpan = DonutChartInteractiveLegend.createBasicValueItemSpan(DonutChartInteractiveLegend.LegendItemPercentageClassName, formattedValue, itemPercentage, donutObject.legendData.fontSize, dataViews, indicatorValue, isPrimaryPercentage);

                    var secondaryIndex;

                    for (var i = 0; i < dataViews.categorical.values.length; i++) {
                        if (dataViews.categorical.values[i].source.roles.hasOwnProperty('SecondaryMeasure')) {

                            secondaryIndex = i;
                        }
                    }

                    if (isSecondaryMeasure) {

                        var isPercentage;
                        var secondaryValue = valueFormatter.format(dataViews.categorical.values[secondaryIndex].values[index], dataViews.metadata.columns[secondaryMeasureIndex].format);
                        var secondaryIndicator = dataViews.categorical.values[secondaryIndex].values[index];
                        var secondaryFormattedValue;
                        if (dataViews.metadata.columns[secondaryMeasureIndex].format && dataViews.metadata.columns[secondaryMeasureIndex].format.search('%') > 0) {
                            secondaryFormattedValue = secondaryValue;
                            isPercentage = true;
                        }
                        else {
                            isPercentage = false;
                            if (isNaN(parseInt(secondaryIndicator, 10))) {
                                secondaryFormattedValue = '';
                            }
                            else {
                                secondaryFormattedValue = DonutChartGMO.prototype.format(parseInt(secondaryIndicator, 10), displayUnits, precisionValue, 'sample');
                                if (isNaN(parseInt(secondaryValue, 10)) || isNaN(parseInt(secondaryValue[secondaryValue.length - 1], 10)))
                                    secondaryFormattedValue = this.addSpecialCharacters(secondaryFormattedValue, secondaryValue);
                            }
                        }
                        //if (dataViews.categorical.values.length>index){
                        var secondaryValueSpan = DonutChartInteractiveLegend.createBasicSecondaryItemSpan(DonutChartInteractiveLegend.LegendSecondaryClassName, secondaryFormattedValue, donutObject.legendData.fontSize, dataViews, secondaryIndicator, isPercentage);
                        var secondarySpanWidth = DonutChartInteractiveLegend.spanWidth(secondaryValueSpan);
                        var secondarySpanHeight = DonutChartInteractiveLegend.spanHeight(secondaryValueSpan);
                        DonutChartInteractiveLegend.createLegendItemSpan(secondaryValueSpan);
                        // itemDiv.append(secondaryValueSpan);
                        //    }
                    }
                    else {
                        secondarySpanWidth = 0;
                        secondarySpanHeight = 0;
                    }
                    // itemCategorySpan.text(itemCategorySpan.text() + String.fromCharCode(parseInt('&#9650;', 16)));
                    // Calculate Legend Box size according to widths and set the width accordingly
                    // var valueSpanWidth = DonutChartInteractiveLegend.spanWidth(itemValueSpan);
                    var categorySpanWidth = DonutChartInteractiveLegend.spanWidth(itemCategorySpan);
                    var categorySpanHeight = DonutChartInteractiveLegend.spanHeight(itemCategorySpan);
                    var precentageSpanWidth = DonutChartInteractiveLegend.spanWidth(itemPercentageSpan);
                    var percentageSpanHeight = DonutChartInteractiveLegend.spanHeight(itemPercentageSpan);
                    if (categorySpanWidth < secondarySpanWidth)
                        var sampleCategoryWidth = secondarySpanWidth;
                    else
                        sampleCategoryWidth = categorySpanWidth;
                    var currentLegendBoxWidth = DonutChartInteractiveLegend.legendBoxSize(sampleCategoryWidth, precentageSpanWidth);
                    var currentLegendBoxHeight = categorySpanHeight + percentageSpanHeight + secondarySpanHeight + 3;
                    this.noOfLegends = legendContainerHeight / currentLegendBoxHeight;
                    this.noOfColumns = this.currentNumberOfLegendItems / (this.noOfLegends - 1);

                    itemDiv.css({ 'width': currentLegendBoxWidth, 'height': currentLegendBoxHeight });

                    // Calculate margins so that all the spans will be placed 
                    var getLeftValue = (spanWidth: number) => {
                        return currentLegendBoxWidth + currX + 10;//when percentage and value exists,deduct margin-left(10) value to provide gap between value and %
                        // return currentLegendBoxWidth - spanWidth > 0 ? (currentLegendBoxWidth - spanWidth) / 2 : 0;
                    };
                    // var marginLeftValue = getLeftValue(valueSpanWidth);
                    var marginLeftCategory = getLeftValue(categorySpanWidth);
                    // Create the actual spans with the right styling and margins so it will be center aligned and add them
                    DonutChartInteractiveLegend.createLegendItemSpan(itemCategorySpan).css('color', itemColor);
                    //DonutChartInteractiveLegend.createLegendItemSpan(itemValueSpan, marginLeftValue);
                    DonutChartInteractiveLegend.createLegendItemSpan(itemPercentageSpan);
                     
                    // itemDiv.append('<g><circle attr="cx:10;cy:10;r:5;" style="fill:red;"></circle></g>');
                    itemDiv.append(itemCategorySpan);
                    itemDiv.append(itemPercentageSpan);
                    //  itemDiv.append(itemValueSpan);
                    itemDiv.append(secondaryValueSpan);

                }
                else {

                    itemCategory = donutObject.legendData.title;
                    for (var i = 0; i < dataViews.metadata.columns.length; i++) {
                        if (dataViews.metadata.columns[i].roles.hasOwnProperty('Y')) {

                            var primaryMesureColumnName = dataViews.metadata.columns[i].displayName;
                            break;
                        }
                    }
    
                    // Create basic spans for width calculations
                    //var itemValueSpan = DonutChartInteractiveLegend.createBasicLegendItemSpan(DonutChartInteractiveLegend.LegendItemValueClassName, itemValue, 11);

                    var itemCategorySpan = DonutChartInteractiveLegend.createBasicLegendTitleSpan(DonutChartInteractiveLegend.LegendItemCategoryClassName, itemCategory, PixelConverter.fromPointToPixel(donutObject.legendData.fontSize));

                    var itemPercentageSpan = DonutChartInteractiveLegend.createBasicTitleItemSpan(DonutChartInteractiveLegend.LegendItemCategoryClassName, PixelConverter.fromPointToPixel(donutObject.legendData.fontSize), primaryMesureColumnName);
                    if (isSecondaryMeasure) {
                        var secondaryValueSpan = DonutChartInteractiveLegend.createBasicTitleItemSpan(DonutChartInteractiveLegend.LegendItemCategoryClassName, PixelConverter.fromPointToPixel(donutObject.legendData.fontSize), secondaryColumnName);

                    }
                    var categorySpanWidth = DonutChartInteractiveLegend.spanWidth(itemCategorySpan);
                    var precentageSpanWidth = DonutChartInteractiveLegend.spanWidth(itemPercentageSpan);
                    var currentLegendBoxWidth = DonutChartInteractiveLegend.legendBoxSize(categorySpanWidth, precentageSpanWidth);
                    var secondarySpanWidth = DonutChartInteractiveLegend.spanWidth(secondaryValueSpan);
                    itemDiv.css('width', currentLegendBoxWidth);

                    // Calculate margins so that all the spans will be placed 
                    var getLeftValue = (spanWidth: number) => {
                        return currentLegendBoxWidth + currX + 10;//when percentage and value exists,deduct margin-left(10) value to provide gap between value and %

                    };
                    // var marginLeftValue = getLeftValue(valueSpanWidth);
                    var marginLeftCategory = getLeftValue(categorySpanWidth);

                    // Create the actual spans with the right styling and margins so it will be center aligned and add them
                    DonutChartInteractiveLegend.createLegendItemSpan(itemCategorySpan).css('color', itemColor);
                    if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['detailedLegend']) {
                        if (donutObject.legendObjectProperties['detailedLegend'] === "None") {
                            DonutChartInteractiveLegend.createLegendItemSpan(itemPercentageSpan).css('display', 'none');
                        }
                        else {
                            DonutChartInteractiveLegend.createLegendItemSpan(itemPercentageSpan).css('visibility', 'visible');
                        }
                    }
                    else {
                        DonutChartInteractiveLegend.createLegendItemSpan(itemPercentageSpan).css('display', 'none');
                    }
                    itemDiv.append(itemCategorySpan);
                    itemDiv.append(itemPercentageSpan);
                    itemDiv.append(secondaryValueSpan);
                }
                this.legendItemsPositions.push({
                    startX: currX,
                    boxWidth: currentLegendBoxWidth,
                });
                currX += currentLegendBoxWidth + DonutChartInteractiveLegend.ItemMargin;
            };
            this.legendContainer.selectAll('.donutLegendArrow').remove();
            if ($(this.legendContainer[0][0].childNodes).length)
                $(this.legendContainer[0][0]).empty();
            // this.legendContainer.selectAll('.titleLegendText').remove();
            if (donutObject.legendData.title) {
                this.legendContainer.append('div')
                    .classed('titleLegendText', true)
                    .classed(DonutChartInteractiveLegend.LegendItemClassName, true);
                if (donutObject.legendObjectProperties === undefined) {
                    this.legendContainer.select('.titleLegendText').style({ 'white-space': 'nowrap' });
                }
                else if (donutObject.legendObjectProperties && donutObject.legendObjectProperties['detailedLegend'] === undefined) {
                    this.legendContainer.select('.titleLegendText').style({ 'white-space': 'nowrap' });
                }
                else if (donutObject.legendObjectProperties['show'] === true && donutObject.legendObjectProperties['detailedLegend'] === "None") {
                    this.legendContainer.select('.titleLegendText').style({ 'white-space': 'nowrap' });
                }

                else {
                    this.legendContainer.select('.titleLegendText').style({ 'white-space': '' });
                }
                createLegendItem($(this.legendContainer[0][0].childNodes[0]), this.data[0]);

            }
            // Create the Legend Items

            if (donutObject.legendObjectProperties && ((donutObject.legendObjectProperties['position'] === 'Left') || (donutObject.legendObjectProperties['position'] === 'RightCenter') || (donutObject.legendObjectProperties['position'] === 'Right') || (donutObject.legendObjectProperties['position'] === 'LeftCenter'))) {
                var top: number = 0;
                this.noOfColumns = this.data.length / (this.noOfLegends - 1);
                var widthOfSingleLegendPoint = 0,
                    heightOfSingleLegendPoint = 0;

                var index: number = 0;
                for (var iCount = 0; iCount < this.noOfColumns; iCount++) {
                    this.legendContainer.append('div').classed('column' + (iCount + 1), true);
                    for (var iLegend = 0; (iLegend < this.noOfLegends - 1) && (index < this.data.length); iLegend++ , index++) {
                        this.legendContainer.select('.column' + (iCount + 1)).append('div').attr('data-legend-index', index).classed(DonutChartInteractiveLegend.LegendItemClassName, true);
                        createLegendItem($(this.legendContainer[0]).find('[data-legend-index=' + index + ']'), this.data[index]);

                    }
                    if (iCount) {
                        if ((donutObject.legendObjectProperties['position'] === 'RightCenter') || (donutObject.legendObjectProperties['position'] === 'Right')) {
                            this.legendContainer.select('.column' + (iCount + 1)).style({ 'float': 'right' });
                        } else {
                            this.legendContainer.select('.column' + (iCount + 1)).style({ 'float': 'left' });
                        }
                    }
                    else {
                        if ((donutObject.legendObjectProperties['position'] === 'RightCenter') || (donutObject.legendObjectProperties['position'] === 'Right')) {
                            this.legendContainer.select('.column' + (iCount + 1)).style({ 'clear': 'both', 'float': 'right' });
                        } else {
                            this.legendContainer.select('.column' + (iCount + 1)).style({ 'clear': 'both', 'float': 'left' });
                        }
                    }
                }
                var top: number = 0;
                this.noOfLegends = 0;
                for (var index = 0; index < this.data.length; index++) {
                    if (top < (legendContainerHeight)) {// - $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').height())
                        top += $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').height();
                        // console.log('legend item height' + top);
                        // console.log('legend height' + legendContainerHeight);
                        this.noOfLegends++;
                        continue;
                    }
                    else {
                        break;
                    }
                }
                if (this.legendContainer[0]) {
                    widthOfSingleLegendPoint = $(this.legendContainer[0]).find('[data-legend-index=' + 0 + ']').width();
                    if (this.noOfColumns < 1) {
                        this.noOfColumns = 1;
                    }
                    this.legendContainer.style({ 'width': Math.floor(this.noOfColumns) * widthOfSingleLegendPoint + 'px', 'height': '100%' });
                }

                legendItems.exit().remove();
                // Assign interactions on the legend
                this.assignInteractions();
            }
            else {
                for (var index = 0; index < this.data.length; index++) {
                    //  $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').empty();
                    this.legendContainer.append('div').attr('data-legend-index', index).classed(DonutChartInteractiveLegend.LegendItemClassName, true); // assign index for later use.classed(DonutChartInteractiveLegend.LegendItemClassName, true);
                    createLegendItem($(this.legendContainer[0]).find('[data-legend-index=' + index + ']'), this.data[index]);
                }
                var top: number = 0;
                this.noOfLegends = 0;
                for (var index = 0; index < this.data.length; index++) {
                    if (top < (legendContainerHeight)) {// - $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').height())
                        top += $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').height();
                        console.log('legend item height' + top);
                        console.log('legend height' + legendContainerHeight);
                        this.noOfLegends++;
                        continue;
                    }
                    else {
                        break;
                    }
                }

                var left = 0, currIndex = 0;
                for (var index = 0; index < this.data.length; index++) {
                    if (left < (parentViewPort.width - $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').width())) {
                        // $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').css('display', 'inline-block');
                        left = parseInt($(this.legendContainer[0]).find('[data-legend-index=' + index + ']').css('left').split('px')[0], 10);
                        left += $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').width();
                        currIndex = index;
                        continue;
                    }
                    else {
                        while (index < this.data.length) {
                            //  $(this.legendContainer[0]).find('[data-legend-index=' + index + ']').css('display', 'none');
                            index++;
                        }
                        break;
                    }
                }
                if (0 === currIndex) {
                    currIndex = 1;
                }
                var noOfRows = this.data.length / currIndex;
                if (noOfRows < 1) {
                    noOfRows = 1;
                }
                if (this.legendContainer[0]) {
                    heightOfSingleLegendPoint = $(this.legendContainer[0]).find('[data-legend-index=' + 0 + ']').height();
                    this.legendContainer.style({ 'height': Math.floor(noOfRows) * heightOfSingleLegendPoint + 'px', 'width': '100%' });
                }
            }
            legendItems.exit().remove();
            // Assign interactions on the legend
            this.assignInteractions();
        }
        public updateLegend(sliceIndex): void {
            if (this.currentNumberOfLegendItems <= 1) return; // If the number of labels is one no updates are needed
            this.currentIndex = sliceIndex;
            // "rearrange" legend items if needed, so we would have contnious endless scrolling
            this.updateLabelBlocks(sliceIndex);
        }

        private assignInteractions() {
            var currentDX = 0; // keep how much drag had happened
            var hasChanged = false; // flag to indicate if we changed the "center" value in the legend. We only change it once per swipe.

            var dragStart = () => {
                currentDX = 0; // start of drag gesture
                hasChanged = false;
            };

            var dragMove = () => {
                currentDX += d3.event.dx;
                // Detect if swipe occured and if the index already changed in this drag
                if (hasChanged || Math.abs(currentDX) < DonutChartInteractiveLegend.MinimumSwipeDX) return;

                var dragDirectionLeft = (currentDX < 0);
                this.dragLegend(dragDirectionLeft);
                hasChanged = true;
            };

            var drag = d3.behavior.drag()
                .origin(Object)
                .on('drag', dragMove)
                .on('dragstart', dragStart);

            this.legendContainer
                .style({
                    'touch-action': 'none',
                    'cursor': 'pointer'

                })
                .call(drag);
        }

        private dragLegend(dragDirectionLeft: boolean): void {

            if (this.currentNumberOfLegendItems > (DonutChartInteractiveLegend.MinimumItemsInLegendForCycled - 1)) {
                this.currentIndex = this.getCyclingCurrentIndex(dragDirectionLeft);
            } else {
                if (this.shouldChangeIndexInNonCycling(dragDirectionLeft)) {
                    if (dragDirectionLeft) {
                        this.currentIndex++;
                    } else {
                        this.currentIndex--;
                    }
                }
            }
            this.donutChart.setInteractiveChosenSlice(this.currentIndex);
        }

        private shouldChangeIndexInNonCycling(dragDirectionLeft: boolean): boolean {
            if ((this.currentIndex === 0 && !dragDirectionLeft) || (this.currentIndex === (this.currentNumberOfLegendItems - 1) && dragDirectionLeft)) {
                return false;
            }
            return true;
        }

        private getCyclingCurrentIndex(dragDirectionLeft: boolean): number {
            var dataLen = this.data.length;
            var delta = dragDirectionLeft ? 1 : -1;
            var newIndex = (this.currentIndex + delta) % (dataLen || 1); // modolu of negative number stays negative on javascript
            return (newIndex < 0) ? newIndex + dataLen : newIndex;
        }

        private updateLegendItemsBlocks(rightSidedShift: boolean, numberOfLegendItemsBlocksToShift: number) {
            var legendContainer$ = $(this.legendContainer[0]);

            if (rightSidedShift) {
                var smallestItem = legendContainer$.find('[data-legend-index=' + this.leftMostIndex + ']');
                smallestItem.remove().insertAfter(legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']'));
                var newX = parseInt(legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']').css('left').split('px')[0], 10) + legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']').width() + DonutChartInteractiveLegend.ItemMargin;
                // this.legendItemsPositions[this.leftMostIndex].startX = newX;
                smallestItem.css('left', newX);

                this.rightMostIndex = this.leftMostIndex;
                this.leftMostIndex = (this.leftMostIndex + 1) % this.data.length;
            } else {
                var highestItem = legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']');
                highestItem.remove().insertBefore(legendContainer$.find('[data-legend-index=' + this.leftMostIndex + ']'));
                var newX = this.legendItemsPositions[this.leftMostIndex].startX - this.legendItemsPositions[this.rightMostIndex].boxWidth - DonutChartInteractiveLegend.ItemMargin;
                this.legendItemsPositions[this.rightMostIndex].startX = newX;
                highestItem.css('left', newX);

                this.leftMostIndex = this.rightMostIndex;
                this.rightMostIndex = (this.rightMostIndex - 1) === -1 ? (this.legendItemsPositions.length - 1) : (this.rightMostIndex - 1);
            }

            if ((numberOfLegendItemsBlocksToShift - 1) !== 0) {
                this.updateLegendItemsBlocks(rightSidedShift, (numberOfLegendItemsBlocksToShift - 1));
            }
        }

        /** Update the legend items, allowing for endless rotation */
        private updateLabelBlocks(index: number) {

            if (this.currentNumberOfLegendItems > DonutChartInteractiveLegend.MinimumItemsInLegendForCycled) {
                // The idea of the four if's is to keep two labels before and after the current one so it will fill the screen.

                // If the index of the slice is the highest currently availble add 2 labels "ahead" of it
                if (this.rightMostIndex === index) this.updateLegendItemsBlocks(true, 2);

                // If the index of the slice is the lowest currently availble add 2 labels "before" it
                if (this.leftMostIndex === index) this.updateLegendItemsBlocks(false, 2);

                // If the index of the slice is the second highest currently availble add a labels "ahead" of it
                if (this.rightMostIndex === (index + 1) || ((this.rightMostIndex === 0) && (index === (this.currentNumberOfLegendItems - 1)))) this.updateLegendItemsBlocks(true, 1);

                // If the index of the slice is the second lowest currently availble add a labels "before" it
                if (this.leftMostIndex === (index - 1) || ((this.leftMostIndex === (this.currentNumberOfLegendItems - 1) && (index === 0)))) this.updateLegendItemsBlocks(false, 1);

            } else {

                if (this.currentNumberOfLegendItems === DonutChartInteractiveLegend.MinimumItemsInLegendForCycled) {
                    // If the index of the slice is the highest currently availble add a label "ahead" of it
                    if (this.rightMostIndex === index) this.updateLegendItemsBlocks(true, 1);

                    // If the index of the slice is the lowest currently availble add a label "before" it
                    if (this.leftMostIndex === index) this.updateLegendItemsBlocks(false, 1);
                }
            }
        }

        private static createBasicLegendItemSpan(spanClass: string, text: string, fontSize: number, color: any): JQuery {
            var size = fontSize + 6;
            return $('<span/>').html('<span style="font-size:' + size + 'px;">&#9679;</span><span style="white-space:nowrap;font-size:' + fontSize + 'px;color:' + color + '" class="' + spanClass + '"title="' + text + '">' + text + '</span>');

        }
        private static createBasicLegendTitleSpan(spanClass: string, text: string, fontSize: number): JQuery {
            return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px;" class="' + spanClass + '" title="' + text + '">' + text + '</span>');

        }
        private static createBasicSecondaryItemSpan(spanClass: string, value: string, fontSize: number, dataview: any, secondaryIndicator: any, isPercentage: any) {
            var indicatorFontSize = PixelConverter.fromPointToPixel(fontSize - 2);
            fontSize = PixelConverter.fromPointToPixel(fontSize);
            if (DonutChartGMO.prototype.getShowStatus(dataview, 'show', 'SMIndicator')) {
                if (DonutChartGMO.prototype.getShowStatus(dataview, 'SecondaryMeasure', 'SMIndicator'))
                    var threshold_Value = 0;

                else {
                    threshold_Value = DonutChartGMO.prototype.getStatus(dataview, 'SMThreshold', 'SMIndicator');
                    if (isPercentage)
                        threshold_Value = threshold_Value / 100;
                }
                if (!isPercentage) {
                    secondaryIndicator = parseInt(secondaryIndicator, 10);
                }
                if (threshold_Value <= secondaryIndicator) {
                    return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px"></span></span><span style="color:green;font-size:' + indicatorFontSize + 'px;margin-right: 2px;margin-left: 3px;">&#9650;</span>');
                }
                else {
                    return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px"></span></span><span style="color:red;font-size:' + indicatorFontSize + 'px;margin-right: 2px;margin-left: 3px;">&#9660;</span>');
                }
            }
            else {
                return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px"></span></span>');
            }
        }
        private static createBasicValueItemSpan(spanClass: string, value: string, percentage: string, fontSize: number, dataview: any, indicatorValue, isPercentage: any): JQuery {
            var indicatorFontSize = PixelConverter.fromPointToPixel(fontSize - 2);
            fontSize = PixelConverter.fromPointToPixel(fontSize);

            if (value === '' && percentage === '') {
                return $('');
            } else {
                if (DonutChartGMO.prototype.getShowStatus(dataview, 'show', 'Indicators')) {
                    if (DonutChartGMO.prototype.getShowStatus(dataview, 'PrimaryMeasure', 'Indicators'))
                        var threshold_Value = 0;

                    else {
                        threshold_Value = DonutChartGMO.prototype.getStatus(dataview, 'Threshold', 'Indicators');

                        if (isPercentage) {
                            threshold_Value = threshold_Value / 100;

                        }
                    }
                    if (!isPercentage) {
                        indicatorValue = parseInt(indicatorValue, 10);
                    }

                    if (threshold_Value <= indicatorValue) {
                        return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px" title="' + percentage + '">' + percentage + '</span></span><span style="color:green;font-size:' + indicatorFontSize + 'px;margin-right: 2px;margin-left: 3px;">&#9650;</span>');
                    }
                    else {
                        return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px" title="' + percentage + '">' + percentage + '</span></span><span style="color:red;font-size:' + indicatorFontSize + 'px;margin-right: 2px;margin-left: 3px;">&#9660;</span>');
                    }
                }
                else {
                    return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span title="' + value + '">' + value + '</span><span style="margin-left:5px" title="' + percentage + '">' + percentage);
                }
            }
        }
        private static createBasicTitleItemSpan(spanClass: string, fontSize: number, title: string): JQuery {

            return $('<span/>').html('<span style="white-space:nowrap;font-size:' + fontSize + 'px" class="' + spanClass + '"><span>' + title + '</span>').css({ 'visibility': 'visible', 'display': 'block', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'width': '100%' });

        }

        /** This method alters the given span and sets it to the final legen item span style. */
        private static createLegendItemSpan(existingSpan: JQuery): JQuery {
            existingSpan
                .css({
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis',
                    'display': 'inline-block',
                    'width': '100%'
                });
            return existingSpan;
        }

        /** Caclulte entire legend box size according to its building spans */
        private static legendBoxSize(categorySpanWidth: number, precentageSpanWidth: number): number {
            //var categorySpanWidthboxSize = valueSpanWidth > categorySpanWidth ? valueSpanWidth : categorySpanWidth;
            var boxSize = categorySpanWidth > precentageSpanWidth ? categorySpanWidth : precentageSpanWidth;
            boxSize = boxSize > DonutChartInteractiveLegend.MaxLegendItemBoxSize ? DonutChartInteractiveLegend.MaxLegendItemBoxSize : (boxSize + 2);
            return boxSize;
        }

        private static FakeElementSpan: JQuery;
        private static spanWidth(span: JQuery): any {
            if (!this.FakeElementSpan) {
                this.FakeElementSpan = $('<span>').hide().appendTo(document.body);
            }
            this.FakeElementSpan.empty();
            this.FakeElementSpan.append(span);
            return this.FakeElementSpan.width();
        }
        private static spanHeight(span: JQuery): any {
            if (!this.FakeElementSpan) {
                this.FakeElementSpan = $('<span>').hide().appendTo(document.body);
            }
            this.FakeElementSpan.empty();
            this.FakeElementSpan.append(span);
            return this.FakeElementSpan.height();
        }
        public addSpecialCharacters(sKMBValue, title) {
            var displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length;
            //Append characters front
            if (isNaN(parseInt(title[0], 10))) {
                for (var iLoop = 0; iLoop < title.length; iLoop++) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialcharacters += title[iLoop];
                    }
                    else break;
                }
                displayValue = specialcharacters + sKMBValue;
            }
            //Append characters end
            if (isNaN(parseInt(title[title.length - 1], 10))) {
                var specialarray = [], index: number = 0;
                for (var iLoop = titlelength - 1; iLoop >= 0; iLoop--) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialarray[index] = title[iLoop];
                        index++;
                    }
                    else break;
                }
                for (var iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) {
                    specialcharacters += specialarray[iLoop];
                }
                displayValue = sKMBValue + specialcharacters;
            }
            // if (isNaN(parseInt(title[0])) || isNaN(parseInt(title[title.length - 1])))

            return displayValue.trim();
        }
    }

    module DonutChartConversion {

        interface ConvertedDataPoint {
            identity: SelectionId;
            measureFormat: string;
            measureValue: MeasureAndValue;
            highlightMeasureValue: MeasureAndValue;
            index: number;
            label: any;
            categoryLabel: string;
            color: string;
            seriesIndex?: number;
        };

        interface MeasureAndValue {
            measure: number;
            value: number;
        }

        export class DonutChartConverter {
            private dataViewCategorical: DataViewCategorical;
            private dataViewMetadata: DataViewMetadata;
            private highlightsOverflow: boolean;
            private total: number;
            private primaryMeasureTotal: number;
            private secondaryMeasureTotal: number;
            private primaryMeasureIndex: number = -1;
            private secondaryMeasureIndex: number = -1;
            private highlightTotal: number;
            private grouped: DataViewValueColumnGroup[];
            private isMultiMeasure: boolean;
            private isSingleMeasure: boolean;
            private isDynamicSeries: boolean;
            private seriesCount: number;
            private categoryIdentities: DataViewScopeIdentity[];
            private categoryValues: any[];
            private allCategoryObjects: DataViewObjects[];
            private categoryColumnRef: data.SQExpr[];
            private legendDataPoints: LegendDataPoint[];
            private colorHelper: ColorHelper;
            private categoryFormatString: string;
            public hasHighlights: boolean;
            public dataPoints: DonutDataPoint[];
            public legendData: LegendData;
            public dataLabelsSettings: VisualDataLabelsSettings;
            public legendObjectProperties: DataViewObject;
            public maxValue: number;
            public constructor(dataView: DataView, colors: IDataColorPalette, defaultDataPointColor?: string) {
                var dataViewCategorical = dataView.categorical;
                this.dataViewCategorical = dataViewCategorical;
                this.dataViewMetadata = dataView.metadata;
                this.seriesCount = dataViewCategorical.values ? dataViewCategorical.values.length : 0;
                this.colorHelper = new ColorHelper(colors, donutChartProps.dataPoint.fill, defaultDataPointColor);
                this.maxValue = 0;
                if (dataViewCategorical.categories && dataViewCategorical.categories.length > 0) {
                    var category = dataViewCategorical.categories[0];
                    this.categoryIdentities = category.identity;
                    this.categoryValues = category.values;
                    this.allCategoryObjects = category.objects;
                    //this.categoryColumnRef = category.identityFields;
                    this.categoryFormatString = valueFormatter.getFormatString(category.source, donutChartProps.general.formatString);
                }

                var grouped = this.grouped = dataViewCategorical && dataViewCategorical.values ? dataViewCategorical.values.grouped() : undefined;
                this.isMultiMeasure = grouped && grouped.length > 0 && grouped[0].values && grouped[0].values.length > 1;
                this.isSingleMeasure = grouped && grouped.length === 1 && grouped[0].values && grouped[0].values.length === 1;
                this.isDynamicSeries = !!(dataViewCategorical.values && dataViewCategorical.values.source);
                this.hasHighlights = this.seriesCount > 0 && !_.isEmpty(dataViewCategorical.values) && !!dataViewCategorical.values[0].highlights;
                this.highlightsOverflow = false;
                this.total = 0;
                this.primaryMeasureTotal = 0;
                this.secondaryMeasureTotal = 0;
                this.primaryMeasureIndex = -1;
                this.secondaryMeasureIndex = -1;
                this.highlightTotal = 0;
                this.dataPoints = [];
                this.legendDataPoints = [];
                this.dataLabelsSettings = null;
                // Assuming here that seriesCount can have maximum value 2 (primary measure and secondary measure)

                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    var localSum = 0;
                    for (var measureIndex = 0; measureIndex < seriesData.values.length; measureIndex++) {
                        localSum += Math.abs(seriesData.values[measureIndex]);
                        this.total += Math.abs(seriesData.values[measureIndex]);
                        this.highlightTotal += this.hasHighlights ? Math.abs(seriesData.highlights[measureIndex]) : 0;
                    }
                    if (seriesData && seriesData.source && seriesData.source.roles && seriesData.source.roles.hasOwnProperty('Y')) {
                        this.primaryMeasureTotal = localSum;
                        this.primaryMeasureIndex = seriesIndex;
                    }
                    else if (seriesData && seriesData.source && seriesData.source.roles && seriesData.source.roles.hasOwnProperty('SecondaryMeasure')) {
                        this.secondaryMeasureTotal = localSum;
                        this.secondaryMeasureIndex = seriesIndex;
                    }
                }
                this.secondaryMeasureTotal = AxisHelper.normalizeNonFiniteNumber(this.secondaryMeasureTotal);
                this.primaryMeasureTotal = AxisHelper.normalizeNonFiniteNumber(this.primaryMeasureTotal);

                this.total = AxisHelper.normalizeNonFiniteNumber(this.total);
                this.highlightTotal = AxisHelper.normalizeNonFiniteNumber(this.highlightTotal);
            }

            private static normalizedMeasureAndValue(measureAndValue: MeasureAndValue): MeasureAndValue {
                var normalized: MeasureAndValue = $.extend(true, {}, measureAndValue);
                normalized.measure = AxisHelper.normalizeNonFiniteNumber(normalized.measure);
                normalized.value = AxisHelper.normalizeNonFiniteNumber(normalized.value);
                return normalized;
            }

            public fetchPrimaryMeasureTotal(): number {
                return this.primaryMeasureTotal;
            }
            public fetchSecondaryMeasureTotal(): number {
                return this.secondaryMeasureTotal;
            }
            public convert(): void {
                var convertedData: ConvertedDataPoint[];
                if (this.total !== 0) {
                    // We render based on categories, series, or measures in that order of preference
                    if (this.categoryValues) {
                        convertedData = this.convertCategoricalWithSlicing();
                    }
                    else if (this.isDynamicSeries) {
                        // Series but no category.
                        convertedData = this.convertSeries();
                    }
                    else {
                        // No category or series; only measures.
                        convertedData = this.convertMeasures();
                    }
                }
                else {
                    convertedData = [];
                }

                // Check if any of the highlight values are > non-highlight values
                var highlightsOverflow = false;
                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount && !highlightsOverflow; i++) {
                    var point = convertedData[i];
                    if (Math.abs(point.highlightMeasureValue.measure) > Math.abs(point.measureValue.measure)) {
                        highlightsOverflow = true;
                    }
                }

                // Create data labels settings
                this.dataLabelsSettings = this.convertDataLabelSettings();

                var dataViewMetadata = this.dataViewMetadata;
                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        this.legendObjectProperties = <DataViewObject>objects['legend'];
                    }
                }

                this.dataPoints = [];
                var formatStringProp = donutChartProps.general.formatString;
                var prevPointColor: string;

                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount; i++) {
                    var point = convertedData[i];

                    // Normalize the values here and then handle tooltip value as infinity
                    var normalizedHighlight = DonutChartConverter.normalizedMeasureAndValue(point.highlightMeasureValue);
                    var normalizedNonHighlight = DonutChartConverter.normalizedMeasureAndValue(point.measureValue);

                    var measure = normalizedNonHighlight.measure;
                    var percentage = (this.total > 0) ? normalizedNonHighlight.value / this.total : 0.0;
                    var highlightRatio = 0;
                    if (normalizedNonHighlight.value > this.maxValue)
                        this.maxValue = normalizedNonHighlight.value;
                    if (normalizedHighlight.value > this.maxValue)
                        this.maxValue = normalizedHighlight.value;

                    if (this.hasHighlights) {
                        // When any highlight value is greater than the corresponding non-highlight value
                        // we just render all of the highlight values and discard the non-highlight values.
                        if (highlightsOverflow) {
                            measure = normalizedHighlight.measure;

                            percentage = (this.highlightTotal > 0) ? normalizedHighlight.value / this.highlightTotal : 0.0;
                            highlightRatio = 1;
                        }
                        else {
                            highlightRatio = normalizedHighlight.value / normalizedNonHighlight.value;
                        }

                        if (!highlightRatio) {
                            highlightRatio = DonutChart.EffectiveZeroValue;
                        }
                    }

                    var categoryValue = point.categoryLabel;
                    var categorical = this.dataViewCategorical;
                    var valueIndex: number = categorical.categories ? null : i;
                    valueIndex = point.seriesIndex !== undefined ? point.seriesIndex : valueIndex;
                    var valuesMetadata = categorical.values[valueIndex].source;
                    var value: number = point.measureValue.measure;
                    var highlightedValue: number = this.hasHighlights && point.highlightMeasureValue.value !== 0 ? point.highlightMeasureValue.measure : undefined;
                    var tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, categorical, categoryValue, value, null, null, valueIndex, i, highlightedValue);
                    var strokeWidth = prevPointColor === point.color && value && value > 0 ? 1 : 0;
                    prevPointColor = value && value > 0 ? point.color : prevPointColor;
                    this.dataPoints.push({
                        identity: point.identity,
                        measure: measure,
                        measureFormat: point.measureFormat,
                        percentage: percentage,
                        index: point.index,
                        label: categoryValue,//point.label,
                        highlightRatio: highlightRatio,
                        selected: false,
                        tooltipInfo: tooltipInfo,
                        color: point.color,
                        strokeWidth: strokeWidth,
                        labelFormatString: valuesMetadata.format,
                    });
                }

                this.legendData = this.convertLegendData();
            }
            private getLegendTitle(): string {
                if (this.total !== 0) {
                    // If category exists, we render title using category source. If not, we render title
                    // using measure.
                    var dvValuesSourceName = this.dataViewCategorical.values && this.dataViewCategorical.values.source
                        ? this.dataViewCategorical.values.source.displayName : "";
                    var dvCategorySourceName = this.dataViewCategorical.categories && this.dataViewCategorical.categories.length > 0 && this.dataViewCategorical.categories[0].source
                        ? this.dataViewCategorical.categories[0].source.displayName : "";
                    if (this.categoryValues) {
                        return dvCategorySourceName;
                    }
                    else {
                        return dvValuesSourceName;
                    }
                }
                else {
                    return "";
                }
            }
            private convertCategoricalWithSlicing(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;

                var formatStringProp = donutChartProps.general.formatString;
                var dataPoints: ConvertedDataPoint[] = [];
                // if (-1 === this.primaryMeasureIndex) {
                //     return dataPoints;
                // }
                for (var categoryIndex = 0, categoryCount = this.categoryValues.length; categoryIndex < categoryCount; categoryIndex++) {
                    var categoryValue = this.categoryValues[categoryIndex];
                    var thisCategoryObjects = this.allCategoryObjects ? this.allCategoryObjects[categoryIndex] : undefined;
                    var legendIdentity = SelectionId.createWithId(this.categoryIdentities[categoryIndex]);
                    var color = this.colorHelper.getColorForSeriesValue(thisCategoryObjects, this.categoryColumnRef, categoryValue);
                    var categoryLabel = valueFormatter.format(categoryValue, this.categoryFormatString);
                    // Series are either measures in the multi-measure case, or the single series otherwise
                    for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                        // var seriesIndex = this.primaryMeasureIndex;
                        var seriesData = dataViewCategorical.values[seriesIndex];

                        var label = this.isSingleMeasure
                            ? categoryLabel
                            : converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);

                        var nonHighlight = seriesData.values[categoryIndex] || 0;
                        var highlight = this.hasHighlights ? seriesData.highlights[categoryIndex] || 0 : 0;

                        var measure: string;
                        var seriesGroup: any;

                        if (this.isMultiMeasure) {
                            measure = seriesData.source.queryName;
                        }
                        else if (seriesData.identity)
                            seriesGroup = seriesData;

                        var identity: SelectionId = SelectionIdBuilder.builder()
                            .withCategory(dataViewCategorical.categories[0], categoryIndex)
                            .withSeries(seriesGroup, seriesGroup)
                            .withMeasure(measure)
                            .createSelectionId();
                        var dataPoint: ConvertedDataPoint = {
                            identity: identity,
                            measureFormat: valueFormatter.getFormatString(seriesData.source, formatStringProp, true),
                            measureValue: <MeasureAndValue>{
                                measure: nonHighlight,
                                value: Math.abs(nonHighlight),

                            },
                            highlightMeasureValue: <MeasureAndValue>{
                                measure: highlight,
                                value: Math.abs(highlight),

                            },
                            index: categoryIndex * this.seriesCount + seriesIndex,
                            label: label,
                            categoryLabel: categoryLabel,
                            color: color,
                            seriesIndex: seriesIndex
                        };
                        dataPoints.push(dataPoint);
                        if (!(seriesData.source.roles.hasOwnProperty('Y'))) {
                            dataPoints.pop();
                        }
                    }
                    this.legendDataPoints.push({
                        label: categoryLabel,
                        color: color,
                        icon: LegendIcon.Box,
                        identity: legendIdentity,
                        selected: false
                    });
                }

                return dataPoints;
            }
            private convertMeasures(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = donutChartProps.general.formatString;
                // var measureIndex = this.primaryMeasureIndex;
                // if (-1 === this.primaryMeasureIndex) {
                //     return dataPoints;
                // }
                for (var measureIndex = 0; measureIndex < this.seriesCount; measureIndex++) {
                    var measureData = dataViewCategorical.values[measureIndex];
                    var measureFormat = valueFormatter.getFormatString(measureData.source, formatStringProp, true);
                    var measureLabel = measureData.source.displayName;
                    var identity = SelectionId.createWithMeasure(measureData.source.queryName);

                    debug.assert(measureData.values.length > 0, 'measure should have data points');
                    debug.assert(!this.hasHighlights || measureData.highlights.length > 0, 'measure with highlights should have highlight data points');
                    var nonHighlight = measureData.values[0] || 0;
                    var highlight = this.hasHighlights ? measureData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForMeasure(measureData.source.objects, measureData.source.queryName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: measureFormat,
                        measureValue: <MeasureAndValue>{
                            measure: nonHighlight,
                            value: Math.abs(nonHighlight),
                        },
                        highlightMeasureValue: <MeasureAndValue>{
                            measure: highlight,
                            value: Math.abs(highlight),
                        },
                        index: measureIndex,
                        label: measureLabel,
                        categoryLabel: measureLabel,
                        color: color
                    };
                    dataPoints.push(dataPoint);
                    if (!(measureData.source.roles.hasOwnProperty('Y'))) {
                        dataPoints.pop();
                    }
                    this.legendDataPoints.push({
                        label: dataPoint.label,
                        color: dataPoint.color,
                        icon: LegendIcon.Box,
                        identity: dataPoint.identity,
                        selected: false
                    });
                }
                return dataPoints;
            }
            private convertSeries(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = donutChartProps.general.formatString;
                // var seriesIndex = this.primaryMeasureIndex;
                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    // if (-1 === this.primaryMeasureIndex) {
                    //     return dataPoints;
                    // }
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    var seriesFormat = valueFormatter.getFormatString(seriesData.source, formatStringProp, true);
                    var label = converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);
                    var identity = SelectionId.createWithId(seriesData.identity);
                    var seriesName = converterHelper.getSeriesName(seriesData.source);
                    var objects = this.grouped && this.grouped[seriesIndex] && this.grouped[seriesIndex].objects;

                    debug.assert(seriesData.values.length > 0, 'measure should have data points');
                    debug.assert(!this.hasHighlights || seriesData.highlights.length > 0, 'measure with highlights should have highlight data points');
                    var nonHighlight = seriesData.values[0] || 0;
                    var highlight = this.hasHighlights ? seriesData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForSeriesValue(objects, dataViewCategorical.values.identityFields, seriesName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: seriesFormat,
                        measureValue: <MeasureAndValue>{
                            measure: nonHighlight,
                            value: Math.abs(nonHighlight),

                        },
                        highlightMeasureValue: <MeasureAndValue>{
                            measure: highlight,
                            value: Math.abs(highlight),

                        },
                        index: seriesIndex,
                        label: label,
                        categoryLabel: label,
                        color: color,
                        seriesIndex: seriesIndex
                    };
                    dataPoints.push(dataPoint);
                    if (!(seriesData.source.roles.hasOwnProperty('Y'))) {
                        dataPoints.pop();
                    }
                    this.legendDataPoints.push({
                        label: dataPoint.label,
                        color: dataPoint.color,
                        icon: LegendIcon.Box,
                        identity: dataPoint.identity,
                        selected: false
                    });
                }
                return dataPoints;
            }
            private convertDataLabelSettings(): VisualDataLabelsSettings {
                var dataViewMetadata = this.dataViewMetadata;
                var dataLabelsSettings = dataLabelUtils.getDefaultDonutLabelSettings();

                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        // Handle lables settings
                        var labelsObj = <DataLabelObject>objects['labels'];
                        if (labelsObj) {
                            dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, dataLabelsSettings);
                        }
                    }
                }

                return dataLabelsSettings;
            }
            private convertLegendData(): LegendData {
                return {
                    dataPoints: this.legendDataPoints,
                    labelColor: LegendData.DefaultLegendLabelFillColor,
                    title: this.getLegendTitle(),
                    fontSize: SVGLegend.DefaultFontSizeInPt,
                };
            }
        }
    }

    export class DonutChartGMO implements IVisual {
        /**
          * Informs the System what it can do
          * Fields, Formatting options, data reduction & QnA hints
          */
        // MAQCode
        private root: D3.Selection;
        private dataView: DataView;
        private titleSize: number = 12;
        private updateCount: number = 0;
        public isPrimaryMeasureSelected: any = false;
        public isSecondaryMeasureSelected: any = false;
        public isPrimaryMeasurePercentage: any = false;
        public isSecondaryMeasurePercentage: any = false;
        public primaryMeasureSum: number = 0;
        public secondaryMeasureName: string = "";
        public secondaryMeasureSum: number = 0;
        public isLegendFieldSelected: any = false;
        public isDetailsFieldSelected: any = false;
        public primaryMeasureSpecialCharacter: string = "";
        public primaryMeasureSpecialCharacterIndex: number = -1;    // 0 refers to starting of datavalue, 1 indicates last in data value
        public secondaryMeasureSpecialCharacter: string = "";
        public secondaryMeasureSpecialCharacterIndex: number = -1; // 0 refers to starting of datavalue, 1 indicates last in data value
        public detailLabelsColor: any;
        public detailLabelsDisplayUnits: any;
        public detailLabelsDecimalPlaces: any;
        public detailLabelsTextSize: any;
        public detailLabelsShowSummary: any;
        public primaryMeasureSummaryText: any;
        private static ClassName = 'donutChart';
        private static InteractiveLegendClassName = 'donutLegend';
        private static DrillDownAnimationDuration = 1000;
        private static OuterArcRadiusRatio = 0.9;
        private static InnerArcRadiusRatio = 0.8;
        private static OpaqueOpacity = 1.0;
        private static SemiTransparentOpacity = 0.6;
        private static defaultSliceWidthRatio: number = 0.48;
        private static invisibleArcLengthInPixels: number = 3;
        private static sliceClass: ClassAndSelector = createClassAndSelector('slice');
        private static sliceHighlightClass: ClassAndSelector = createClassAndSelector('slice-highlight');
        private static twoPi = 2 * Math.PI;
        public static InteractiveLegendContainerHeight = 70;
        public static EffectiveZeroValue = 0.000000001; // Very small multiplier so that we have a properly shaped zero arc to animate to/from.
        public static PolylineOpacity = 0.5;
        public dataViews: DataView[];
        private sliceWidthRatio: number;
        private svg: D3.Selection;
        private mainGraphicsContext: D3.Selection;
        private labelGraphicsContext: D3.Selection;
        private clearCatcher: D3.Selection;
        private legendContainer: D3.Selection;
        private parentViewport: IViewport;
        private currentViewport: IViewport;
        private formatter: ICustomValueFormatter;
        private data: DonutDataGMO;
        private pie: D3.Layout.PieLayout;
        private arc: D3.Svg.Arc;
        private outerArc: D3.Svg.Arc;
        private radius: number;
        private previousRadius: number;
        private key: any;
        private colors: IDataColorPalette;
        private style: IVisualStyle;
        private drilled: boolean;
        private allowDrilldown: boolean;
        private options: VisualInitOptions;
        private isInteractive: boolean;
        private interactivityState: InteractivityState;
        private chartRotationAnimationDuration: number;
        private interactivityService: IInteractivityService;
        private behavior: IInteractiveBehavior;
        private legend: ILegend;
        private hasSetData: boolean;
        private isScrollable: boolean;
        private disableGeometricCulling: boolean;
        private hostService: IVisualHostServices;
        private settings: DonutChartSettings;
        private tooltipsEnabled: boolean;
        private donutProperties: DonutChartProperties;
        private maxHeightToScaleDonutLegend: number;
        //global variables for indicators
        private show: any;
        private PrimaryMeasure: any;
        private Threshold: number;
        private Total_Threshold: number;
        private SecondaryMeasure: any;
        private SMThreshold: number;
        private SMTotalThreshold: number;
        public customLegendHeight: any = 0;
        public customLegendWidth: any = 0;
        /**
         * Note: Public for testing.
         */
        public animator: IDonutChartAnimator;
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: data.createDisplayNameGetter('Role_DisplayName_Legend'),
                    description: data.createDisplayNameGetter('Role_DisplayName_LegendDescription')
                },
                {
                    name: 'Y',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Primary Measure',//data.createDisplayNameGetter('Role_DisplayName_Values'),
                    description: 'Primary Measure', //data.createDisplayNameGetter('Role_DisplayName_ValuesDescription'),
                    requiredTypes: [{ numeric: true }, { integer: true }],
                },
                {
                    name: 'SecondaryMeasure',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Secondary Measure',//data.createDisplayNameGetter('Role_DisplayName_Values'),
                    description: 'Secondary Measure', //data.createDisplayNameGetter('Role_DisplayName_ValuesDescription'),
                    requiredTypes: [{ numeric: true }, { integer: true }],
                },

            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                    },
                },
                legend: {
                    displayName: data.createDisplayNameGetter('Visual_Legend'),
                    description: data.createDisplayNameGetter('Visual_LegendDescription'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        position: {
                            displayName: data.createDisplayNameGetter('Visual_LegendPosition'),
                            description: data.createDisplayNameGetter('Visual_LegendPositionDescription'),
                            type: { enumeration: legendPosition.type }
                        },
                        showTitle: {
                            displayName: data.createDisplayNameGetter('Visual_LegendShowTitle'),
                            description: data.createDisplayNameGetter('Visual_LegendShowTitleDescription'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: data.createDisplayNameGetter('Visual_LegendName'),
                            description: data.createDisplayNameGetter('Visual_LegendNameDescription'),
                            type: { text: true },
                            suppressFormatPainterCopy: true
                        },
                        labelColor: {
                            displayName: data.createDisplayNameGetter('Visual_LegendTitleColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { formatting: { fontSize: true } }
                        },
                        detailedLegend: {
                            displayName: 'Primary Measure',
                            description: 'Displaying the legend details based on selection',
                            type: { enumeration: detailedLegendType },
                            suppressFormatPainterCopy: true
                        },
                        labelDisplayUnits: {
                            displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                            description: data.createDisplayNameGetter('Visual_DisplayUnitsDescription'),
                            placeHolderText: '0',
                            type: { formatting: { labelDisplayUnits: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelPrecision: {
                            displayName: data.createDisplayNameGetter('Visual_Precision'),
                            description: data.createDisplayNameGetter('Visual_PrecisionDescription'),
                            placeHolderText: data.createDisplayNameGetter('Visual_Precision_Auto'),
                            type: { numeric: true },
                            suppressFormatPainterCopy: true,
                        },
                    }
                },
                dataPoint: {
                    displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                    description: data.createDisplayNameGetter('Visual_DataPointDescription'),
                    properties: {
                        fill: {
                            displayName: data.createDisplayNameGetter('Visual_Fill'),
                            type: { fill: { solid: { color: true } } }
                        }
                    }
                },
                labels: {
                    displayName: data.createDisplayNameGetter('Visual_DetailLabels'),
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            description: data.createDisplayNameGetter('Visual_LabelsFillDescription'),
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                            description: data.createDisplayNameGetter('Visual_DisplayUnitsDescription'),
                            type: { formatting: { labelDisplayUnits: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelPrecision: {
                            displayName: data.createDisplayNameGetter('Visual_Precision'),
                            description: data.createDisplayNameGetter('Visual_PrecisionDescription'),
                            placeHolderText: data.createDisplayNameGetter('Visual_Precision_Auto'),
                            type: { numeric: true },
                            suppressFormatPainterCopy: true,
                        },
                        fontSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { formatting: { fontSize: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelStyle: {
                            displayName: data.createDisplayNameGetter('Visual_LabelStyle'),
                            type: { enumeration: labelStyle.type }
                        },
                        showSummary: {
                            displayName: 'Show Summary',
                            type: { bool: true }
                        },
                        primaryMeasureSummaryText: {
                            displayName: 'Summary Text',
                            type: { text: true }
                        },
                    },
                },
                GMODonutTitle: {
                    displayName: 'Donut Title',
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
                            description: 'Font color for the GMO Donut title',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for the GMO Donut title',
                            type: { formatting: { fontSize: true } }
                        },
                        backgroundColor: {
                            displayName: 'Background color',
                            description: 'Background color for the GMO Donut title',
                            type: { fill: { solid: { color: true } } }
                        },
                        tooltipText: {
                            displayName: 'Tooltip Text',
                            description: 'Tooltip text for the GMO Donut title',
                            type: { text: true }
                        }
                    }
                },
                //Indicators Code
                Indicators: {
                    displayName: 'Primary Indicators',
                    description: 'Display Indicators options',
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        PrimaryMeasure: {
                            displayName: 'Sign Indicator',
                            description: 'Indicator based on sign for Primary Measure',
                            placeHolderText: true,
                            type: { bool: true }
                        },
                        Threshold: {
                            displayName: 'Threshold',
                            description: 'Threshold value for Primary Measure',
                            type: { numeric: true }
                        },
                        Total_Threshold: {
                            displayName: 'Total Value Threshold',
                            description: 'Threshold value for primary measure total',
                            type: { numeric: true }
                        },
                    },
                },

                SMIndicator: {
                    displayName: 'Secondary Indicators',
                    description: 'Display Indicators options',
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        SecondaryMeasure: {
                            displayName: 'Sign Indicator',
                            description: 'Indicator for Secondary Measure',
                            type: { bool: true }
                        },
                        SMThreshold: {
                            displayName: 'Threshold',
                            description: 'Threshold value for Secondary Measure',
                            type: { numeric: true }
                        },

                        SMTotalThreshold: {
                            displayName: 'Total Value Threshold',
                            description: 'Threshold value for secondary measure total',
                            type: { numeric: true }
                        },
                    },
                },
            },
            dataViewMappings: [{
                conditions: [
                    { 'Category': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 } },//'Series': { max: 0 },
                    { 'Category': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 } }//'Series': { min: 1, max: 1 },
                ],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        group: {
                            by: 'Series',
                            select: [{ bind: { to: 'Y' } }, { bind: { to: 'SecondaryMeasure' } }],
                            dataReductionAlgorithm: { top: {} }
                        }
                    },
                    rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                },
            }],
            // MAQCode
            suppressDefaultTitle: true,
            sorting: {
                default: {},
            },
            supportsHighlight: true,
            drilldown: {
                roles: ['Category']
            },
        };
        constructor(options?: DonutConstructorOptions) {
            if (options) {
                this.sliceWidthRatio = options.sliceWidthRatio;
                this.animator = options.animator;
                this.isScrollable = options.isScrollable ? options.isScrollable : false;
                this.disableGeometricCulling = options.disableGeometricCulling ? options.disableGeometricCulling : false;
                this.behavior = options.behavior;
                this.tooltipsEnabled = options.tooltipsEnabled;
                if (options.smallViewPortProperties) {
                    this.maxHeightToScaleDonutLegend = options.smallViewPortProperties.maxHeightToScaleDonutLegend;
                }
            }
            if (this.sliceWidthRatio == null) {
                this.sliceWidthRatio = DonutChartGMO.defaultSliceWidthRatio;
            }
        }

        public static converter(dataView: DataView, colors: IDataColorPalette, defaultDataPointColor?: string, viewport?: IViewport, disableGeometricCulling?: boolean, interactivityService?: IInteractivityService): DonutDataGMO {
            var converter = new DonutChartConversion.DonutChartConverter(dataView, colors, defaultDataPointColor);
            converter.convert();
            var primaryMeasureSum = converter.fetchPrimaryMeasureTotal()
                , secondaryMeasureSum = converter.fetchSecondaryMeasureTotal();
            var d3PieLayout = d3.layout.pie()
                .sort(null)
                .value((d: DonutDataPoint) => {
                    return d.percentage;
                });
            if (interactivityService) {
                interactivityService.applySelectionStateToData(converter.dataPoints);
                interactivityService.applySelectionStateToData(converter.legendData.dataPoints);
            }
            var culledDataPoints = (!disableGeometricCulling && viewport) ? DonutChart.cullDataByViewport(converter.dataPoints, converter.maxValue, viewport) : converter.dataPoints;
            return {
                dataPointsToDeprecate: culledDataPoints,
                dataPoints: d3PieLayout(culledDataPoints),
                unCulledDataPoints: converter.dataPoints,
                dataPointsToEnumerate: converter.legendData.dataPoints,
                legendData: converter.legendData,
                hasHighlights: converter.hasHighlights,
                dataLabelsSettings: converter.dataLabelsSettings,
                legendObjectProperties: converter.legendObjectProperties,
                maxValue: converter.maxValue,
                visibleGeometryCulled: converter.dataPoints.length !== culledDataPoints.length,
                primaryMeasureSum: primaryMeasureSum,
                secondaryMeasureSum: secondaryMeasureSum,
            };
        }

        public init(options: VisualInitOptions) {
            // MAQCode
            this.root = d3.select(options.element.get(0));
            this.options = options;
            var element = options.element;
            // Ensure viewport is empty on init
            element.empty();
            this.parentViewport = options.viewport;
            // avoid deep copy
            this.currentViewport = {
                height: options.viewport.height,
                width: options.viewport.width,
            };

            this.formatter = valueFormatter.format;
            this.data = {
                dataPointsToDeprecate: [],
                dataPointsToEnumerate: [],
                dataPoints: [],
                unCulledDataPoints: [],
                legendData: { title: "", dataPoints: [], fontSize: SVGLegend.DefaultFontSizeInPt },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultDonutLabelSettings(),
            };
            this.drilled = false;
            // Leaving this false for now, will depend on the datacategory in the future
            this.allowDrilldown = false;
            this.style = options.style;
            this.colors = this.style.colorPalette.dataColors;
            this.radius = 0;
            this.isInteractive = options.interactivity && options.interactivity.isInteractiveLegend;
            var donutChartSettings = this.settings;
            // MAQCode
            d3.select(element.get(0))
                .append('div')
                .classed('Title_Div_Text', true)
                .style({ 'width': '100%', 'display': 'inline-block' })
                // .style({'width':'100%', 'display':'inline-block', 'position':'absolute'})
                .html('<div class = "GMODonutTitleDiv" style = "max-width: 80%; display: inline-block">' + '</div>'
                + '<span class = "GMODonutTitleIcon" style = "width: 2%; display: none; cursor: pointer; position: absolute">&nbsp(&#063;)</span>');

            if (this.behavior) {
                this.interactivityService = createInteractivityService(options.host);
            }
            this.legend = createLegend(element, options.interactivity && options.interactivity.isInteractiveLegend, this.interactivityService, this.isScrollable);

            this.hostService = options.host;

            // if (this.isInteractive) {
            this.chartRotationAnimationDuration = (donutChartSettings && donutChartSettings.chartRotationAnimationDuration) ? donutChartSettings.chartRotationAnimationDuration : 0;

            // Create interactive legend
            var legendContainer = this.legendContainer = d3.select(element.get(0))
                .append('div')
                .classed(DonutChartGMO.InteractiveLegendClassName, true);
            this.interactivityState = {
                interactiveLegend: new DonutChartInteractiveLegend(this, legendContainer, this.colors, options, this.settings),
                valueToAngleFactor: 0,
                sliceAngles: [],
                currentRotate: 0,
                interactiveChosenSliceFinishedSetting: false,
                lastChosenInteractiveSliceIndex: 0,
                totalDragAngleDifference: 0,
                currentIndexDrag: 0,
                previousIndexDrag: 0,
                previousDragAngle: 0,
                donutCenter: { x: 0, y: 0 },
            };
            //   }

            this.svg = d3.select(element.get(0))
                .append('svg')
                .style('position', 'relative')
                .classed(DonutChartGMO.ClassName, true);

            if (this.behavior)
                this.clearCatcher = appendClearCatcher(this.svg);

            this.mainGraphicsContext = this.svg.append('g');
            this.mainGraphicsContext.append("g")
                .classed('slices', true);

            this.labelGraphicsContext = this.svg
                .append("g")
                .classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);

            this.pie = d3.layout.pie()
                .sort(null)
                .value((d: DonutDataPoint) => {
                    return d.percentage;

                });
            d3.select(element.get(0))
                .append('div')
                .classed('errorMessage', true)
                .text("Please select 'Primary Measure' value")
                .style({ 'display': 'none' });

            //tarang
            d3.select(element.get(0))
                .append('div')
                .classed('SummarizedDiv', true);
        }

        public update(options: VisualUpdateOptions): void {
            // MAQCode 
            this.updateCount++;
            this.dataView = options.dataViews[0];
            this.isPrimaryMeasureSelected = false;
            this.isSecondaryMeasureSelected = false;
            this.isLegendFieldSelected = false;
            this.isDetailsFieldSelected = false;
            var legendProperties;
            this.isPrimaryMeasurePercentage = false;
            this.isSecondaryMeasurePercentage = false;
            this.root.select('.legend').style({ 'display': 'inherit' });
            this.root.select('.donutLegend').style({ 'display': 'block' });
            this.primaryMeasureSpecialCharacter = "";
            this.primaryMeasureSpecialCharacterIndex = -1;
            this.secondaryMeasureSpecialCharacter = "";
            this.secondaryMeasureSpecialCharacterIndex = -1;
            var valueWithSpecialCharacter = "";
            if (this.dataView && this.dataView.categorical && this.dataView.categorical.categories && this.dataView.categorical.categories.length > 0) {
                this.isLegendFieldSelected = true;
            }
            if (this.dataView && this.dataView.categorical && this.dataView.categorical.values) {
                if (this.dataView.categorical.values.source) {
                    this.isDetailsFieldSelected = true;
                }
                for (var iCount = 0; iCount < this.dataView.categorical.values.length; iCount++) {
                    valueWithSpecialCharacter = "";
                    if (this.dataView.categorical.values[iCount].source
                        && this.dataView.categorical.values[iCount].source.roles
                        && this.dataView.categorical.values[iCount].source.roles.hasOwnProperty('Y')) {
                        this.isPrimaryMeasureSelected = true;
                        valueWithSpecialCharacter = valueFormatter.format(2, this.dataView.categorical.values[iCount].source.format);
                        valueWithSpecialCharacter = valueWithSpecialCharacter + "";
                        valueWithSpecialCharacter = valueWithSpecialCharacter.replace(/\s+/g, '');
                        if (-1 === this.primaryMeasureSpecialCharacterIndex) {
                            if (isNaN(parseInt(valueWithSpecialCharacter.charAt(0), 10))) {
                                for (var iCounts = 0; iCounts < valueWithSpecialCharacter.indexOf("2"); iCounts++) {
                                    this.primaryMeasureSpecialCharacter = this.primaryMeasureSpecialCharacter + valueWithSpecialCharacter.charAt(iCounts);
                                }
                                this.primaryMeasureSpecialCharacterIndex = 0;
                            }
                            else {
                                if (valueWithSpecialCharacter.length > 1 && isNaN(parseInt(valueWithSpecialCharacter.charAt(valueWithSpecialCharacter.length - 1), 10))) {
                                    for (var iLength = valueWithSpecialCharacter.length - 1; iLength >= 0; iLength--) {
                                        if (isNaN(parseInt(valueWithSpecialCharacter.charAt(iLength), 10))) {
                                            this.primaryMeasureSpecialCharacter = valueWithSpecialCharacter.charAt(iLength) + this.primaryMeasureSpecialCharacter;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    this.primaryMeasureSpecialCharacterIndex = 1;
                                    if ("%" === this.primaryMeasureSpecialCharacter) {

                                        this.isPrimaryMeasurePercentage = true;
                                    }
                                }
                            }
                        }
                    }
                    else if (this.dataView.categorical.values[iCount].source
                        && this.dataView.categorical.values[iCount].source.roles
                        && this.dataView.categorical.values[iCount].source.roles.hasOwnProperty('SecondaryMeasure')) {
                        this.secondaryMeasureName = this.dataView.categorical.values[iCount].source.displayName;
                        this.isSecondaryMeasureSelected = true;
                        valueWithSpecialCharacter = valueFormatter.format(2, this.dataView.categorical.values[iCount].source.format);
                        valueWithSpecialCharacter = valueWithSpecialCharacter + "";
                        valueWithSpecialCharacter = valueWithSpecialCharacter.replace(/\s+/g, '');
                        if (-1 === this.secondaryMeasureSpecialCharacterIndex) {
                            if (isNaN(parseInt(valueWithSpecialCharacter.charAt(0), 10))) {
                                for (var iCounted = 0; iCounted < valueWithSpecialCharacter.indexOf("2"); iCounted++) {
                                    this.secondaryMeasureSpecialCharacter = this.secondaryMeasureSpecialCharacter + valueWithSpecialCharacter.charAt(iCounted);
                                }
                                this.secondaryMeasureSpecialCharacterIndex = 0;
                            }
                            else {
                                if (valueWithSpecialCharacter.length > 1 && isNaN(parseInt(valueWithSpecialCharacter.charAt(valueWithSpecialCharacter.length - 1), 10))) {
                                    for (var iLengths = valueWithSpecialCharacter.length - 1; iLengths >= 0; iLengths--) {
                                        if (isNaN(parseInt(valueWithSpecialCharacter.charAt(iLengths), 10))) {
                                            this.secondaryMeasureSpecialCharacter = valueWithSpecialCharacter.charAt(iLengths) + this.secondaryMeasureSpecialCharacter;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    this.secondaryMeasureSpecialCharacterIndex = 1;
                                    if ("%" === this.secondaryMeasureSpecialCharacter) {

                                        this.isSecondaryMeasurePercentage = true;
                                    }
                                }
                            }

                        }

                    }
                }
            }

            // Viewport resizing
            var viewport = options.viewport;
            this.parentViewport = viewport;
            // this.root.selectAll('.errorMessage').remove();
            // this.root.select('.legend').style({ 'display': '' });
            this.root.select('.errorMessage').style({ 'display': 'none' });
            this.root.select('.donutChart').style({ 'display': '' });
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
            this.root.selectAll('.SummarizedDivContainer').remove();

            debug.assertValue(options, 'options');
            var dataViews = this.dataViews = options.dataViews;
            if (dataViews && dataViews.length > 0 && dataViews[0].categorical) {
                var defaultDataPointColor = undefined;
                this.data = DonutChartGMO.converter(dataViews[0], this.colors, defaultDataPointColor, this.currentViewport, this.disableGeometricCulling, this.interactivityService);
               
                // this.data.showAllDataPoints = showAllDataPoints;
                // this.data.defaultDataPointColor = defaultDataPointColor;
                this.renderLegend(dataViews[0], $(this.root[0]).height());
                // if (dataViewMetadata && dataViewMetadata.objects && dataViewMetadata.objects['legend'] && dataViewMetadata.objects['legend']['position']) {
                //     if (dataViewMetadata.objects['legend']['position'] === 'Left' || dataViewMetadata.objects['legend']['position'] === 'LeftCenter' || dataViewMetadata.objects['legend']['position'] === 'Right' || dataViewMetadata.objects['legend']['position'] === 'RightCenter')
                //         this.addLegends();
                // }

            }

            else {
                this.data = {
                    dataPointsToDeprecate: [],
                    dataPointsToEnumerate: [],
                    dataPoints: [],
                    unCulledDataPoints: [],
                    legendData: { title: "", dataPoints: [] },
                    hasHighlights: false,
                    dataLabelsSettings: dataLabelUtils.getDefaultDonutLabelSettings(),
                };
            }

            this.initViewportDependantProperties();
            this.initDonutProperties();
            // MAQCode
            // this.root.select('.legend').style({ 'position': 'relative' });
            this.root.select('.SummarizedDiv').style({ 'display': 'block' });

            // Add component for displaying Error Message                
            if (!this.isPrimaryMeasureSelected) {

                var legendWidth = this.root.select('.legend').attr('width')
                    , legendStyle = this.root.select('.legend').attr('style')
                    , legendTop
                    , legendLeft
                    , arrStyleTop = legendStyle.split('top:')
                    , arrStyleLeft = legendStyle.split('left:');
                if (2 === arrStyleTop.length) {
                    legendTop = arrStyleTop[1].split('px')[0];
                }
                else {
                    legendTop = 0;
                }
                if (2 === arrStyleLeft.length) {
                    legendLeft = arrStyleLeft[1].split('px')[0];
                }
                else {
                    legendLeft = 0;
                }

                this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                this.root.select('.donutChart').style({ 'display': 'none' });
                this.root.select('.legend').style({ 'display': 'none' });
                this.root.select('.donutLegend').style({ 'display': 'none' });
                this.root.select('.SummarizedDiv').style({ 'display': 'none' });
                this.root.select('.errorMessage').style({
                    'display': 'block', 'text-align': 'center'
                    , 'top': this.parentViewport.height / 2 + 10 + 'px', 'position': 'relative'
                    , 'width': '100%'
                });
                if (!!legendProperties && legendProperties['show']) {
                    var legendPosition = legendProperties.position;
                    switch (legendPosition) {
                        case 'Bottom':
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'top': parseInt(legendTop, 10) / 2 + 'px', 'width': '100%' });
                            break;
                        case 'Left':
                            this.root.select('.errorMessage').style({ 'padding': '0px 0px 0px ' + legendWidth + 'px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'Right':
                            this.root.select('.errorMessage').style({ 'padding': '0px ' + legendWidth + 'px' + ' 0px 0px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'BottomCenter':
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'top': parseInt(legendTop, 10) / 2 + 'px', 'width': '100%' });
                            break;
                        case 'LeftCenter':
                            this.root.select('.errorMessage').style({ 'padding': '0px 0px 0px ' + legendWidth + 'px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'RightCenter':
                            this.root.select('.errorMessage').style({ 'padding': '0px ' + legendWidth + 'px' + ' 0px 0px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        default:
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'width': '100%' });
                            break;
                    }
                }
            }
            else {
                this.root.select('.errorMessage').style({ 'display': 'none' });
                // var formattedPrimaryMeasureSum     = this.format(this.data.primaryMeasureSum,1000,null);
                //  this.root.select('.primaryMeasureSum').html(formattedPrimaryMeasureSum);
                //  var formattedSecondaryMeasureSum   =  this.format(this.data.secondaryMeasureSum,1000,null);
                //  this.root.select('.secondaryMeasureSum').html(formattedSecondaryMeasureSum);
                //  this.root.select('.SummarizedDiv').style({'display':'block'});                 
                //  this.root.select('.SummarizedDivContainer').style({'color':this.detailLabelsColor,'font-size': this.detailLabelsTextSize + 'px'});
                //  this.root.select('.TotalText').html(this.primaryMeasureSummaryText);
                //  if(this.isPrimaryMeasurePercentage){
                // 	 this.root.select('.TotalText').style({'display':'none'});
                //  	 this.root.select('.TotalValue').style({'display':'none'});
                //  }
                //  else{
                // 	 this.root.select('.TotalText').style({'display':'block'});
                //  	 this.root.select('.TotalValue').style({'display':'block'});
                //  }
                // }
                this.updateInternal(this.data, options.suppressAnimations);
                if (undefined === this.detailLabelsShowSummary || this.detailLabelsShowSummary) {
                    if (undefined === this.detailLabelsDisplayUnits || 0 === this.detailLabelsDisplayUnits) {
                        this.detailLabelsDisplayUnits = 0;
                    }

                    var formattedPrimaryMeasureSum = "";
                    if (this.detailLabelsDecimalPlaces > 20) {
                        this.detailLabelsDecimalPlaces = 20;
                    }
                    if (this.isPrimaryMeasurePercentage) {
                        formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                        formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + "%";
                    }
                    else {
                        formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                        if (0 === this.primaryMeasureSpecialCharacterIndex) {
                            formattedPrimaryMeasureSum = this.primaryMeasureSpecialCharacter + formattedPrimaryMeasureSum;
                        }
                        else if (1 === this.primaryMeasureSpecialCharacterIndex) {
                            formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + this.primaryMeasureSpecialCharacter;
                        }
                    }
                    if (undefined === this.detailLabelsTextSize) {
                        this.detailLabelsTextSize = 9;
                    }
                    var sizeInPixel = PixelConverter.fromPointToPixel(this.detailLabelsTextSize);
                    var indicatorSize = PixelConverter.fromPointToPixel(this.detailLabelsTextSize - 2);
                    this.root.select('.primaryMeasureSum').html(formattedPrimaryMeasureSum).attr('title', this.data.primaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });
                    this.root.select('.primaryMeasureIndicator').style({ 'font-size': indicatorSize + 'px', 'margin-top': '2px' });
                    this.root.select('.secondaryMeasureIndicator').style({ 'font-size': indicatorSize + 'px', 'margin-top': '2px' });
                    var formattedSecondaryMeasureSum = "";
                    if (this.isSecondaryMeasurePercentage) {
                        formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                        formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + "%";
                    }
                    else {
                        formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                        if (0 === this.secondaryMeasureSpecialCharacterIndex) {
                            formattedSecondaryMeasureSum = this.secondaryMeasureSpecialCharacter + formattedSecondaryMeasureSum;
                        }
                        else if (1 === this.secondaryMeasureSpecialCharacterIndex) {
                            formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + this.secondaryMeasureSpecialCharacter;
                        }
                    }
                    this.root.select('.secondaryMeasureSum').html(formattedSecondaryMeasureSum).attr('title', this.data.secondaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });
                    this.root.select('.SummarizedDiv').style({ 'display': 'block' });
                    this.root.select('.SummarizedDivContainer').style({ 'color': this.detailLabelsColor, 'font-size': sizeInPixel + 'px' });
                    if (undefined === this.primaryMeasureSummaryText) {
                        this.primaryMeasureSummaryText = "Total";
                    }
                    this.root.select('.TotalText').html(this.primaryMeasureSummaryText).style({ 'font-size': sizeInPixel + 'px' });
                    if (this.isPrimaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                        this.root.select('.TotalText').style({ 'display': 'none' });
                        this.root.select('.TotalValue').style({ 'display': 'none' });
                    }
                    else {
                        this.root.select('.TotalText').style({ 'display': 'block' });
                        this.root.select('.TotalValue').style({ 'display': 'block' });
                    }
                    if (this.isSecondaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                        this.root.select('.SecondaryText').style({ 'display': 'none' });
                        this.root.select('.SecondaryValue').style({ 'display': 'none' });
                    }
                    else {
                        this.root.select('.SecondaryText').style({ 'display': 'block' });
                        this.root.select('.SecondaryValue').style({ 'display': 'block' });
                    }
                }
                else {
                    this.root.select('.SummarizedDiv').style({ 'display': 'none' });
                }

                this.hasSetData = true;

                if (dataViews) {
                    var warnings = getInvalidValueWarnings(
                        dataViews,
                        false /*supportsNaN*/,
                        false /*supportsNegativeInfinity*/,
                        false /*supportsPositiveInfinity*/);

                    if (this.data.visibleGeometryCulled) {
                        warnings.unshift(new GeometryCulledWarning());
                    }

                    this.hostService.setWarnings(warnings);
                }
            }
        }

        public onDataChanged(options: VisualDataChangedOptions): void {
            debug.assertValue(options, 'options');

            this.update({
                dataViews: options.dataViews,
                suppressAnimations: options.suppressAnimations,
                viewport: this.currentViewport,
            });
        }

        public onResizing(viewport: IViewport): void {
            this.update({
                dataViews: this.dataViews,
                suppressAnimations: true,
                viewport: viewport,
            });
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            var dataLabelsSettings = this.data && this.data.dataLabelsSettings
                ? this.data.dataLabelsSettings
                : dataLabelUtils.getDefaultDonutLabelSettings();

            switch (options.objectName) {
                case 'legend':
                    this.enumerateLegend(enumeration);
                    break;
                case 'dataPoint':
                    this.enumerateDataPoints(enumeration);
                    break;
                case 'labels':
                    var labelSettingOptions: VisualDataLabelsSettingsOptions = {
                        // objectName: 'showSummary',
                        enumeration: enumeration,
                        dataLabelsSettings: dataLabelsSettings,
                        show: true,
                        displayUnits: true,
                        precision: true,
                        fontSize: true,
                        labelStyle: true,
                        showSummary: this.getShowSummary(this.dataViews[0]),
                        primaryMeasureSummaryText: this.getPrimaryMeasureSummaryText(this.dataViews[0]),
                    };
                    // MAQCode
                    this.enumerateDataLabels(labelSettingOptions);
                    break;
                // MAQCode
                case 'GMODonutTitle':
                    enumeration.pushInstance({
                        objectName: 'GMODonutTitle',
                        displayName: 'Donut title',
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
                // Start of Indicators
                case 'Indicators':
                    this.enumerateIndicator(enumeration, 'Indicators');
                    break;

                case 'SMIndicator':
                    this.enumerateIndicator(enumeration, 'SMIndicator');
                    break;
            }
            return enumeration.complete();
        }

        private enumerateIndicator(enumeration: ObjectEnumerationBuilder, text: string): ObjectEnumerationBuilder {
            var data = this.data;
            if (!data)
                return;
            if (text === 'Indicators') {
                this.show = this.getShowStatus(this.dataViews[0], 'show', text);
                this.PrimaryMeasure = this.getShowStatus(this.dataViews[0], 'PrimaryMeasure', text);
                if (!this.PrimaryMeasure) {
                    this.Threshold = this.getStatus(this.dataViews[0], 'Threshold', text);
                    this.Total_Threshold = this.getStatus(this.dataViews[0], 'Total_Threshold', text);
                }
                else {
                    this.Threshold = null;
                    this.Total_Threshold = null;
                }
                enumeration.pushInstance({
                    selector: null,
                    objectName: 'Indicators',
                    properties: {
                        show: this.show,
                        PrimaryMeasure: this.PrimaryMeasure,
                        Threshold: this.Threshold,
                        Total_Threshold: this.Total_Threshold
                    }
                });
            }
            else {
                this.show = this.getShowStatus(this.dataViews[0], 'show', text);
                this.SecondaryMeasure = this.getShowStatus(this.dataViews[0], 'SecondaryMeasure', text);
                if (!this.SecondaryMeasure) {
                    this.SMThreshold = this.getStatus(this.dataViews[0], 'SMThreshold', text);
                    this.SMTotalThreshold = this.getStatus(this.dataViews[0], 'SMTotalThreshold', text);
                }
                else {
                    this.SMThreshold = null;
                    this.SMTotalThreshold = null;
                }
                enumeration.pushInstance({
                    selector: null,

                    objectName: 'SMIndicator',
                    properties: {
                        show: this.show,
                        SecondaryMeasure: this.SecondaryMeasure,
                        SMThreshold: this.SMThreshold,
                        SMTotalThreshold: this.SMTotalThreshold,
                    }
                });
            }
        }
        // Gets the status of Indicators
        public getShowStatus(dataView: DataView, text: string, category: string): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty(category)) {
                    var showTitle = dataView.metadata.objects[category];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty(text)) {
                        return <IDataLabelSettings>showTitle[text];
                    }
                    else if (text === 'PrimaryMeasure' || 'SecondaryMeasure') {
                        return <IDataLabelSettings>true;
                    }
                } else {
                    return <IDataLabelSettings>false;
                }
            }
            return <IDataLabelSettings>false;
        }
        public getStatus(dataView: DataView, text: string, category: string): number {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty(category)) {
                    var showTitle = dataView.metadata.objects[category];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty(text)) {
                        return showTitle[text];
                    }
                } else {
                    return 0;
                }
            }
            return 0;
        }
        //End of Indicators	
        // MAQCode
        private enumerateDataLabels(options: VisualDataLabelsSettingsOptions): ObjectEnumerationBuilder {
            var formattedPrimaryMeasureSum = "",
                formattedSecondaryMeasureSum = "",
                sizeInPixel;
            if (this.detailLabelsDecimalPlaces > 20) {
                this.detailLabelsDecimalPlaces = 20;
            }
            debug.assertValue(options, 'options');
            debug.assertValue(options.enumeration, 'enumeration');
            if (!options.dataLabelsSettings)
                return;
            var instance: VisualObjectInstance = {
                objectName: 'labels',
                selector: options.selector,
                properties: {},
            };
            if (options.show && options.selector) {
                instance.properties['showSeries'] = options.dataLabelsSettings.show;
            }
            else if (options.show) {
                instance.properties['show'] = options.dataLabelsSettings.show;
            }
            this.detailLabelsColor = instance.properties['color'] = options.dataLabelsSettings.labelColor;
            if (options.displayUnits) {
                this.detailLabelsDisplayUnits = instance.properties['labelDisplayUnits'] = options.dataLabelsSettings.displayUnits;
            }
            if (options.precision) {
                var precision = options.dataLabelsSettings.precision;
                this.detailLabelsDecimalPlaces = instance.properties['labelPrecision'] = precision === dataLabelUtils.defaultLabelPrecision ? null : precision;
                if (this.detailLabelsDecimalPlaces > 20) {
                    this.detailLabelsDecimalPlaces = 20;
                }
            }
            if (options.position) {
                instance.properties['labelPosition'] = options.dataLabelsSettings.position;
                if (options.positionObject) {
                    debug.assert(!instance.validValues, '!instance.validValues');
                    instance.validValues = { 'labelPosition': options.positionObject };
                }
            }
            if (options.labelStyle)
                instance.properties['labelStyle'] = options.dataLabelsSettings.labelStyle;
            if (options.fontSize)
                this.detailLabelsTextSize = instance.properties['fontSize'] = options.dataLabelsSettings.fontSize;
            sizeInPixel = PixelConverter.fromPointToPixel(this.detailLabelsTextSize);
            if (options.labelDensity) {
                var lineChartSettings = <LineChartDataLabelsSettings>options.dataLabelsSettings;
                if (lineChartSettings)
                    instance.properties['labelDensity'] = lineChartSettings.labelDensity;
            }
            // var a=this.dataView.metadata.objects['Labels'];
            // MAQCode
            this.detailLabelsShowSummary = instance.properties['showSummary'] = this.getShowSummary(this.dataViews[0]);
            this.primaryMeasureSummaryText = instance.properties['primaryMeasureSummaryText'] = this.getPrimaryMeasureSummaryText(this.dataViews[0]);
            //Keep show all as the last property of the instance.
            if (options.showAll)
                instance.properties['showAll'] = options.dataLabelsSettings.showLabelPerSeries;
            if (this.detailLabelsShowSummary) {
                // if (0 === this.detailLabelsDisplayUnits) {
                //    this.detailLabelsDisplayUnits = 1000;

                //  }
                if (this.isPrimaryMeasurePercentage) {
                    formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                    formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + "%";
                }
                else {
                    formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                    if (0 === this.primaryMeasureSpecialCharacterIndex) {
                        formattedPrimaryMeasureSum = this.primaryMeasureSpecialCharacter + formattedPrimaryMeasureSum;
                    }
                    else if (1 === this.primaryMeasureSpecialCharacterIndex) {
                        formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + this.primaryMeasureSpecialCharacter;
                    }
                }
                this.root.select('.primaryMeasureSum').html(formattedPrimaryMeasureSum).attr('title', this.data.primaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });
                if (this.isSecondaryMeasurePercentage) {
                    formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                    formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + "%";
                }
                else {
                    formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                    if (0 === this.secondaryMeasureSpecialCharacterIndex) {
                        formattedSecondaryMeasureSum = this.secondaryMeasureSpecialCharacter + formattedSecondaryMeasureSum;
                    }
                    else if (1 === this.secondaryMeasureSpecialCharacterIndex) {
                        formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + this.secondaryMeasureSpecialCharacter;
                    }
                }
                this.root.select('.secondaryMeasureSum').html(formattedSecondaryMeasureSum).attr('title', this.data.secondaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });;
                this.root.select('.SummarizedDiv').style({ 'display': 'block' });
                this.root.select('.SummarizedDivContainer').style({ 'color': this.detailLabelsColor, 'font-size': sizeInPixel + 'px' });
                this.root.select('.TotalText').html(this.primaryMeasureSummaryText).style({ 'font-size': sizeInPixel + 'px' });
                if (this.isPrimaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                    this.root.select('.TotalText').style({ 'display': 'none' });
                    this.root.select('.TotalValue').style({ 'display': 'none' });
                }
                else {
                    this.root.select('.TotalText').style({ 'display': 'block' });
                    this.root.select('.TotalValue').style({ 'display': 'block' });
                }
                if (this.isSecondaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                    this.root.select('.SecondaryText').style({ 'display': 'none' });
                    this.root.select('.SecondaryValue').style({ 'display': 'none' });
                }
                else {
                    this.root.select('.SecondaryText').style({ 'display': 'block' });
                    this.root.select('.SecondaryValue').style({ 'display': 'block' });
                }
            }
            else {
                this.root.select('.SummarizedDiv').style({ 'display': 'none' });
            }
            return options.enumeration.pushInstance(instance);
        }

        // MAQCode
        // This function returns the font colot selected for the title in the format window
        private getTitleFill(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fill1')) {
                        return <Fill>FTitle['fill1'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleFill, { solid: { color: '#333333' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleFill, { solid: { color: '#333333' } });
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
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleBackgroundColor, { solid: { color: 'none' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleBackgroundColor, { solid: { color: 'none' } });
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

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values.source) {
                returnTitleDetails = dataView.categorical.values.source.displayName;
            }
            var iLength = 0;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (var iLength = 0; iLength < dataView.categorical.values.length; iLength++) {
                    if (dataView.categorical.values[iLength].source && dataView.categorical.values[iLength].source.roles.hasOwnProperty('Y')) {
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

        // This function is to perform KMB formatting on values.
        public format(d: number, displayunitValue: number, precisionValue: number, columnType: string) {
            var result: string;
            switch (displayunitValue) {
                case 0:
                    {
                        var prefix = d3.formatPrefix(d);
                        result = d3.round(prefix.scale(d), precisionValue).toFixed(precisionValue) + prefix.symbol.toUpperCase();
                        break;
                    }
                case 1:
                    {
                        result = this.numberWithCommas(d.toFixed(precisionValue));
                        break;
                    }
                case 1000:
                    {
                        result = this.numberWithCommas((d / 1000).toFixed(precisionValue)) + 'K';
                        break;
                    }
                case 1000000:
                    {
                        result = this.numberWithCommas((d / 1000000).toFixed(precisionValue)) + 'M';
                        break;
                    }
                case 1000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000).toFixed(precisionValue)) + 'bn';
                        break;
                    }
                case 1000000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000000).toFixed(precisionValue)) + 'T';
                        break;
                    }
            }
            return result;
            // var prefix = d3.formatPrefix(d);
            // return d3.round(prefix.scale(d),2) + ' ' + prefix.symbol
        }

        public numberWithCommas(x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
            // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        public addSpecialCharacters(sKMBValue, title) {
            var displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length;
            //Append characters front
            if (isNaN(parseInt(title[0], 10))) {
                for (var iLoop = 0; iLoop < title.length; iLoop++) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialcharacters += title[iLoop];
                    }
                    else break;
                }
                displayValue = specialcharacters + sKMBValue;
            }
            //Append characters end
            if (isNaN(parseInt(title[title.length - 1], 10))) {
                var specialarray = [], index: number = 0;
                for (var iLoop = titlelength - 1; iLoop >= 0; iLoop--) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialarray[index] = title[iLoop];
                        index++;
                    }
                    else break;
                }
                for (var iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) {
                    specialcharacters += specialarray[iLoop];
                }
                displayValue = sKMBValue + specialcharacters;
            }
            // if (isNaN(parseInt(title[0])) || isNaN(parseInt(title[title.length - 1])))

            return displayValue.trim();
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

        // This function returns on/off status of the Show Summary properties
        private getShowSummary(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var showTitle = dataView.metadata.objects['labels'];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('showSummary')) {
                        return <IDataLabelSettings>showTitle['showSummary'];
                    }
                } else {
                    return <IDataLabelSettings>true;
                }
            }
            return <IDataLabelSettings>true;
        }

        private getPrimaryMeasureSummaryText(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var text = dataView.metadata.objects['labels'];
                    if (dataView.metadata.objects && text.hasOwnProperty('primaryMeasureSummaryText')) {
                        return <IDataLabelSettings>text['primaryMeasureSummaryText'];
                    }
                } else {
                    return <IDataLabelSettings>"Total";
                }
            }
            return <IDataLabelSettings>"Total";
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
                    return 12;
                }
            }
            return 12;
        }
        private enumerateDataPoints(enumeration: ObjectEnumerationBuilder): void {
            var data = this.data;
            if (!data)
                return;
            var dataPoints = data.dataPointsToEnumerate;
            var dataPointsLength = dataPoints.length;

            for (var i = 0; i < dataPointsLength; i++) {
                var dataPoint = dataPoints[i];
                enumeration.pushInstance({
                    objectName: 'dataPoint',
                    displayName: dataPoint.label,
                    selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector()),
                    properties: {
                        fill: { solid: { color: dataPoint.color } }
                    },
                });
            }
        }

        private enumerateLegend(enumeration: ObjectEnumerationBuilder): ObjectEnumerationBuilder {
            var data = this.data;
            if (!data)
                return;

            var legendObjectProperties: DataViewObjects = { legend: data.legendObjectProperties };

            var show = DataViewObjects.getValue(legendObjectProperties, DonutChartGMOProperties.legend.show, this.legend.isVisible());
            var showTitle = DataViewObjects.getValue(legendObjectProperties, DonutChartGMOProperties.legend.showTitle, this.legend.isVisible());
            var titvarext = DataViewObjects.getValue(legendObjectProperties, DonutChartGMOProperties.legend.titleText, this.data.legendData.title);
            var labelColor = DataViewObject.getValue(legendObjectProperties, legendProps.labelColor, this.data.legendData.labelColor);
            var labelFontSize = DataViewObject.getValue(legendObjectProperties, legendProps.fontSize, this.data.legendData.fontSize);

            var labelPrecision;
            if (this.getLegendDispalyUnits(this.dataView, 'labelPrecision') > 20)
                labelPrecision = 20;
            else
                labelPrecision = this.getLegendDispalyUnits(this.dataView, 'labelPrecision');
            enumeration.pushInstance({
                selector: null,
                objectName: 'legend',
                properties: {
                    show: show,
                    position: LegendPosition[this.legend.getOrientation()],
                    showTitle: showTitle,
                    titleText: titvarext,
                    labelColor: labelColor,
                    fontSize: labelFontSize,
                    detailedLegend: this.getDetailedLegend(this.dataView),
                    labelDisplayUnits: this.getLegendDispalyUnits(this.dataView, 'labelDisplayUnits'),
                    labelPrecision: labelPrecision

                }
            });
        }

        public setInteractiveChosenSlice(sliceIndex: number): void {
            if (this.interactivityState.sliceAngles.length === 0) return;

            this.interactivityState.lastChosenInteractiveSliceIndex = sliceIndex;
            this.interactivityState.interactiveChosenSliceFinishedSetting = false;
            var viewport = this.currentViewport;
            var moduledIndex = sliceIndex % this.data.dataPoints.length;
            var angle = this.interactivityState.sliceAngles[moduledIndex];

            this.svg.select('g')
                .transition()
                .duration(this.chartRotationAnimationDuration)
                .ease('elastic')
                .attr('transform', SVGUtil.translateAndRotate(viewport.width / 2, viewport.height / 2, 0, 0, angle))
                .each('end', () => { this.interactivityState.interactiveChosenSliceFinishedSetting = true; });

            this.interactivityState.currentRotate = angle;
            this.interactivityState.interactiveLegend.updateLegend(moduledIndex);
            // Set the opacity of chosen slice to full and the others to semi-transparent
            this.svg.selectAll('.slice').attr('opacity', (d, index) => {
                return index === moduledIndex ? 1 : 0.6;
            });

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private calculateRadius(): number {
            var viewport = this.currentViewport;
            if (!this.isInteractive && this.data && this.data.dataLabelsSettings.show) {
                // if we have category or data labels, use a sigmoid to blend the desired denominator from 2 to 3.
                // if we are taller than we are wide, we need to use a larger denominator to leave horizontal room for the labels.
                var hw = viewport.height / viewport.width;
                var denom = 2 + (1 / (1 + Math.exp(-5 * (hw - 1))));
                return Math.min(viewport.height, viewport.width) / denom;
            }

            // no labels (isInteractive does not have labels since the interactive legend shows extra info)
            return Math.min(viewport.height, viewport.width) / 2;
        }
        private initViewportDependantProperties(duration: number = 0) {
            // MAQCode

            this.customLegendWidth = parseInt(this.legendContainer.style('width'), 10);
            this.customLegendWidth = $(($(this.legendContainer)[0])[0].childNodes[0]).width();
            if (this.dataView && this.dataView.categorical && this.dataView.categorical.categories) {
                var singleLegendWidth = parseInt(this.legendContainer.select('.legend-container')[0][0].childNodes[1].style['width'], 10);
                var singleLegendHeight = parseInt(this.legendContainer.select('.legend-container')[0][0].childNodes[1].style['height'], 10);
            }
            else {
                singleLegendWidth = parseInt(this.legendContainer.select('.legend-item').style('width'), 10);
                singleLegendHeight = parseInt(this.legendContainer.select('.legend-item').style('height'), 10);
            }
            var legendTitleWidth = parseInt(this.legendContainer.select('.legend-container')[0][0].childNodes[0].style['width'], 10);
            //var noOfLegendsInRow = Math.floor(this.customLegendWidth / singleLegendWidth);
            var noOfRows = Math.ceil(((this.data.dataPointsToDeprecate.length * singleLegendWidth) + legendTitleWidth) / this.customLegendWidth);
            this.customLegendHeight = noOfRows * singleLegendHeight;
            // this.customLegendHeight = $(($(this.legendContainer)[0])[0].childNodes[0]).height();

            if ((this.parentViewport.height - this.titleSize - 40) < 0)
                this.currentViewport.height = this.titleSize + 40 - this.parentViewport.height;
            else
                this.currentViewport.height = this.parentViewport.height - this.titleSize - 40;
            this.currentViewport.width = this.parentViewport.width;
            var legendPosition;
            if (this.data && this.data.legendObjectProperties) {
                legendPosition = this.data.legendObjectProperties['position'];
            }
            if ((this.data && this.data.legendObjectProperties && this.data.legendObjectProperties['show']) || undefined === this.data.legendObjectProperties || undefined === this.data.legendObjectProperties['show']) {
                switch (legendPosition) {
                    case 'Top':
                        this.svg.style({ 'padding': this.customLegendHeight + 'px 0px 0px 0px' });
                        this.currentViewport.height = this.currentViewport.height - this.customLegendHeight;
                        break;

                    case 'Bottom':
                        this.svg.style({ 'padding': '0px 0px ' + this.customLegendHeight + 'px ' + '0px' });
                        this.currentViewport.height = this.currentViewport.height - this.customLegendHeight;
                        break;
                    case 'Left':
                        this.svg.style({ 'padding': '0px 0px 0px ' + this.customLegendWidth + 'px' });
                        this.currentViewport.width = this.currentViewport.width - this.customLegendWidth;

                        break;
                    case 'Right':
                        this.svg.style({ 'padding': '0px ' + this.customLegendWidth + 'px 0px 0px' });
                        this.currentViewport.width = this.currentViewport.width - this.customLegendWidth;

                        break;

                    case 'BottomCenter':
                        this.svg.style({ 'padding': '0px 0px ' + this.customLegendHeight + 'px ' + '0px' });
                        this.currentViewport.height = this.currentViewport.height - this.customLegendHeight;

                        break;
                    case 'LeftCenter':
                        this.svg.style({ 'padding': '0px 0px 0px ' + this.customLegendWidth + 'px' });
                        this.currentViewport.width = this.currentViewport.width - this.customLegendWidth;

                        break;
                    case 'RightCenter':
                        this.svg.style({ 'padding': '0px ' + this.customLegendWidth + 'px 0px 0px' });
                        this.currentViewport.width = this.currentViewport.width - this.customLegendWidth;

                        break;
                    default:
                        this.svg.style({ 'padding': this.customLegendHeight + 'px 0px 0px 0px' });
                        this.currentViewport.height = this.currentViewport.height - this.customLegendHeight;
                        break;
                }

            }
            var viewport = this.currentViewport;
            if (viewport.height < 0)
                viewport.height = 0;
            if (this.isInteractive) {
                viewport.height -= DonutChart.InteractiveLegendContainerHeight;//(this.legendContainer.node().getBoundingClientRect().height + legendMargins.height); // leave space for the legend
            }
            else {
                var legendMargins = this.legend.getMargins();
                if ((viewport.height - legendMargins.height) > 0)
                    viewport.height -= legendMargins.height;
                else
                    viewport.height = legendMargins.height - viewport.height;
                viewport.width -= legendMargins.width;
            }

            this.svg.attr({
                'width': viewport.width,
                'height': viewport.height
            });

            if (this.isInteractive) {
                this.legendContainer
                    .style({
                        'width': '100%',
                        // 'height': DonutChart.InteractiveLegendContainerHeight + 'px',
                        'overflow': 'hidden',
                        'top': 0
                    });
                this.svg
                    .style('top', (this.legendContainer.node().getBoundingClientRect().width + legendMargins.height) + 'px');
            } else {
                this.svg
                    .style('top', legendMargins.height + 'px');
            }

            this.previousRadius = this.radius;
            var radius = this.radius = this.calculateRadius();
            var halfViewportWidth = viewport.width / 2;
            var halfViewportHeight = viewport.height / 2;
            this.arc = d3.svg.arc();
            this.outerArc = d3.svg.arc()
                .innerRadius(radius * DonutChartGMO.OuterArcRadiusRatio)
                .outerRadius(radius * DonutChartGMO.OuterArcRadiusRatio);

            if (this.isInteractive) {
                this.mainGraphicsContext.attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
                this.labelGraphicsContext.attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
            } else {
                this.mainGraphicsContext.transition().duration(duration).attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
                this.labelGraphicsContext.transition().duration(duration).attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
            }
            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private initDonutProperties() {
            this.donutProperties = {
                viewport: this.currentViewport,
                radius: this.radius,
                arc: this.arc.innerRadius(0).outerRadius(this.radius * DonutChartGMO.InnerArcRadiusRatio),
                outerArc: this.outerArc,
                innerArcRadiusRatio: DonutChartGMO.InnerArcRadiusRatio,
                outerArcRadiusRatio: DonutChartGMO.OuterArcRadiusRatio,
                dataLabelsSettings: this.data.dataLabelsSettings,
            };
        }

        private mergeDatasets(first: any[], second: any[]): any[] {
            var secondSet = d3.set();
            second.forEach((d) => {
                secondSet.add(d.identity ? d.identity.getKey() : d.data.identity.getKey());
            });

            var onlyFirst = first.filter((d) => {
                return !secondSet.has(d.identity ? d.identity.getKey() : d.data.identity.getKey());
            }).map((d) => {
                var derived = Prototype.inherit(d);
                derived.percentage === undefined ? derived.data.percentage = 0 : derived.percentage = 0;
                return derived;
            });
            return d3.merge([second, onlyFirst]);
        }

        private updateInternal(data: DonutDataGMO, suppressAnimations: boolean, duration: number = 0) {
            var viewport = this.currentViewport;
            if (this.tooltipsEnabled === void 0) {
                this.tooltipsEnabled = true;
            }
            duration = duration || AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
            if (this.animator) {
                var layout = DonutChartGMO.getLayout(this.radius, this.sliceWidthRatio, viewport, data.dataLabelsSettings);
                var result: DonutChartAnimationResult;
                var shapes: D3.UpdateSelection;
                var highlightShapes: D3.UpdateSelection;
                var labelSettings = data.dataLabelsSettings;
                var labels: Label[] = [];
                if (labelSettings && labelSettings.show) {
                    labels = this.createLabels();
                }
                if (!suppressAnimations) {
                    var animationOptions: DonutChartAnimationOptions = {
                        viewModel: data,
                        colors: this.colors,
                        graphicsContext: this.mainGraphicsContext,
                        labelGraphicsContext: this.labelGraphicsContext,
                        interactivityService: this.interactivityService,
                        layout: layout,
                        radius: this.radius,
                        sliceWidthRatio: this.sliceWidthRatio,
                        viewport: viewport,
                        labels: labels,
                        innerArcRadiusRatio: DonutChartGMO.InnerArcRadiusRatio,
                    };
                    result = this.animator.animate(animationOptions);
                    shapes = result.shapes;
                    highlightShapes = result.highlightShapes;
                }
                if (suppressAnimations || result.failed) {
                    shapes = DonutChart.drawDefaultShapes(this.svg, data, layout, this.colors, this.radius, this.interactivityService && this.interactivityService.hasSelection(), this.sliceWidthRatio, this.data.defaultDataPointColor);
                    highlightShapes = DonutChart.drawDefaultHighlightShapes(this.svg, data, layout, this.colors, this.radius, this.sliceWidthRatio);
                    NewDataLabelUtils.drawDefaultLabels(this.labelGraphicsContext, labels, false, true);
                    NewDataLabelUtils.drawLabelLeaderLines(this.labelGraphicsContext, labels);
                }
                this.assignInteractions(shapes, highlightShapes, data);
                if (this.tooltipsEnabled) {
                    TooltipManager.addTooltip(shapes, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                    TooltipManager.addTooltip(highlightShapes, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                }
            }
            else {
                this.updateInternalToMove(data, duration);
            }

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private createLabels(): Label[] {
            var labelLayout = new DonutLabelLayout({
                maximumOffset: NewDataLabelUtils.maxLabelOffset,
                startingOffset: NewDataLabelUtils.startingLabelOffset
            }, this.donutProperties);

            var labelDataPoints: DonutLabelDataPoint[] = this.createLabelDataPoints();

            return labelLayout.layout(labelDataPoints);
        }

        private createLabelDataPoints(): DonutLabelDataPoint[] {
            var data = this.data;
            var labelDataPoints: DonutLabelDataPoint[] = [];
            var measureFormatterCache = dataLabelUtils.createColumnFormatterCacheManager();
            var alternativeScale: number = null;
            if (data.dataLabelsSettings.displayUnits === 0)
                alternativeScale = <number>d3.max(data.dataPoints, d => Math.abs(d.data.measure));

            for (var i = 0; i < this.data.dataPoints.length; i++) {
                var label = this.createLabelDataPoint(data.dataPoints[i], alternativeScale, measureFormatterCache);
                labelDataPoints.push(label);
            }
            return labelDataPoints;
        }

        private getTextSize(text: string, fontSize: number): ISize {
            var properties = {
                text: text,
                fontFamily: NewDataLabelUtils.LabelTextProperties.fontFamily,
                fontSize: PixelConverter.fromPoint(fontSize),
                fontWeight: NewDataLabelUtils.LabelTextProperties.fontWeight,
            };
            return {
                width: TextMeasurementService.measureSvgTextWidth(properties),
                height: TextMeasurementService.estimateSvgTextHeight(properties),
            };
        }

        private createLabelDataPoint(d: DonutArcDescriptor, alternativeScale: number, measureFormatterCache: IColumnFormatterCacheManager): DonutLabelDataPoint {
            var labelPoint = this.outerArc.centroid(d);
            var labelX = DonutLabelUtils.getXPositionForDonutLabel(labelPoint[0]);
            var labelY = labelPoint[1];
            var labelSettings = this.data.dataLabelsSettings;
            var measureFormatter = measureFormatterCache.getOrCreate(d.data.labelFormatString, labelSettings, alternativeScale);

            var position = labelX < 0 ? 4 : 8;//Left and right values from NewLabelDataPosition
            var pointPosition: LabelParentPoint = {
                point: {
                    x: labelX,
                    y: labelY,
                },
                validPositions: [position],
                radius: 0,
            };

            var outsideFill = labelSettings.labelColor ? labelSettings.labelColor : NewDataLabelUtils.defaultLabelColor;

            var dataLabel: string;
            var dataLabelSize: ISize;
            var categoryLabel: string;
            var categoryLabelSize: ISize;
            var textSize: ISize;
            var labelSettingsStyle = labelSettings.labelStyle;
            var fontSize = labelSettings.fontSize;

            if (labelSettingsStyle === labelStyle.both || labelSettingsStyle === labelStyle.data) {
                dataLabel = measureFormatter.format(d.data.measure);
                dataLabelSize = this.getTextSize(dataLabel, fontSize);
            }
            if (labelSettingsStyle === labelStyle.both || labelSettingsStyle === labelStyle.category) {
                categoryLabel = d.data.label;
                categoryLabelSize = this.getTextSize(categoryLabel, fontSize);
            }
            switch (labelSettingsStyle) {
                case labelStyle.both:
                    var text = categoryLabel + " (" + dataLabel + ")";
                    textSize = this.getTextSize(text, fontSize);
                    break;
                case labelStyle.category:
                    textSize = _.clone(categoryLabelSize);
                    break;
                case labelStyle.data:
                    textSize = _.clone(dataLabelSize);
                    break;
            }
            var leaderLinePoints = DonutLabelUtils.getLabelLeaderLineForDonutChart(d, this.donutProperties, pointPosition.point);
            var leaderLinesSize: ISize[] = DonutLabelUtils.getLabelLeaderLinesSizeForDonutChart(leaderLinePoints);
            return {
                isPreferred: true,
                text: "",
                textSize: textSize,
                outsideFill: outsideFill,
                fontSize: fontSize,
                identity: d.data.identity,
                parentShape: pointPosition,
                insideFill: NewDataLabelUtils.defaultInsideLabelColor,
                parentType: 0,//Point Tag
                alternativeScale: alternativeScale,
                donutArcDescriptor: d,
                angle: (d.startAngle + d.endAngle) / 2 - (Math.PI / 2),
                dataLabel: dataLabel,
                dataLabelSize: dataLabelSize,
                categoryLabel: categoryLabel,
                categoryLabelSize: categoryLabelSize,
                leaderLinePoints: leaderLinePoints,
                linesSize: leaderLinesSize,
            };
        }

        private renderLegend(dataview: any, visualHeight: number): void {
            if (!this.isInteractive) {
                var legendObjectProperties = this.data.legendObjectProperties;
                var legendContainerHeight = visualHeight;
                if (legendObjectProperties) {
                    var legendData = this.data.legendData;
                    LegendData.update(legendData, legendObjectProperties);
                    var position = <string>legendObjectProperties[legendProps.position];
                    var show = <string>legendObjectProperties[legendProps.show];
                    if (position)
                        this.legend.changeOrientation(LegendPosition[position]);
                    if (show) {
                        this.root.selectAll('.donutLegend').style('display', 'block');
                        this.interactivityState.interactiveLegend.drawLegend(this.data, dataview, legendContainerHeight, this.parentViewport);
                    }
                    else
                        this.root.selectAll('.donutLegend').style('display', 'none');
                } else {
                    this.legend.changeOrientation(LegendPosition.Top);
                    this.interactivityState.interactiveLegend.drawLegend(this.data, dataview, legendContainerHeight, this.parentViewport);
                }
            }
        }
        private calculateSliceAngles(): void {
            var angles: number[] = [];
            var data = this.data.dataPoints;

            if (data.length === 0) {
                this.interactivityState.valueToAngleFactor = 0;
                this.interactivityState.sliceAngles = [];
                return;
            }

            var sum = 0;
            for (var i = 0, ilen = data.length; i < ilen; i++) {
                sum += data[i].data.percentage; // value is an absolute number
            }
            debug.assert(sum !== 0, 'sum of slices values cannot be zero');
            this.interactivityState.valueToAngleFactor = 360 / sum; // Calculate the ratio between 360 and the sum to know the angles to rotate by

            var currentAngle = 0;
            for (var i = 0, ilen = data.length; i < ilen; i++) {
                var relativeAngle = data[i].data.percentage * this.interactivityState.valueToAngleFactor;
                currentAngle += relativeAngle;
                angles.push((relativeAngle / 2) - currentAngle);
            }

            this.interactivityState.sliceAngles = angles;
        }
        private assignInteractions(slices: D3.Selection, highlightSlices: D3.Selection, data: DonutDataGMO): void {
            // assign interactions according to chart interactivity type
            if (this.isInteractive) {
                this.assignInteractiveChartInteractions(slices);
            }
            else if (this.interactivityService) {
                var dataPoints = data.dataPoints.map((value: DonutArcDescriptor) => value.data);
                var behaviorOptions: DonutBehaviorOptions = {
                    clearCatcher: this.clearCatcher,
                    slices: slices,
                    highlightSlices: highlightSlices,
                    allowDrilldown: this.allowDrilldown,
                    visual: this,
                    hasHighlights: data.hasHighlights,
                    svg: this.svg
                };

                this.interactivityService.bind(dataPoints, this.behavior, behaviorOptions);
            }
        }

        public setDrilldown(selection?: DonutDataPoint): void {
            if (selection) {
                var d3PieLayout = d3.layout.pie()
                    .sort(null)
                    .value((d: DonutDataPoint) => {
                        return d.percentage;

                    });
                // Drill into the current selection.
                var legendDataPoints: LegendDataPoint[] = [{ label: selection.label, color: selection.color, icon: LegendIcon.Box, identity: selection.identity, selected: selection.selected }];
                var legendData: LegendData = { title: "", dataPoints: legendDataPoints };
                var drilledDataPoints = d3PieLayout(selection.internalDataPoints);
                this.updateInternal({
                    dataPointsToDeprecate: selection.internalDataPoints,
                    dataPoints: drilledDataPoints,
                    unCulledDataPoints: drilledDataPoints.map((value) => value.data),
                    legendData: legendData,
                    hasHighlights: false,
                    dataLabelsSettings: this.data.dataLabelsSettings,
                }, false /* suppressAnimations */, DonutChartGMO.DrillDownAnimationDuration);
            } else {
                // Pop out of drill down to view the "outer" data.
                this.updateInternal(this.data, false /* suppressAnimations */, DonutChartGMO.DrillDownAnimationDuration);
            }
        }

        private assignInteractiveChartInteractions(slice: D3.Selection) {
            var svg = this.svg;
            this.interactivityState.interactiveChosenSliceFinishedSetting = true;
            var svgRect = svg.node().getBoundingClientRect();
            this.interactivityState.donutCenter = { x: svgRect.left + svgRect.width / 2, y: svgRect.top + svgRect.height / 2 }; // Center of the donut chart
            this.interactivityState.totalDragAngleDifference = 0;
            this.interactivityState.currentRotate = 0;
            this.calculateSliceAngles();
            // Set the on click method for the slices so thsete pie chart will turn according to each slice's corresponding angle [the angle its on top]
            slice.on('click', (d: DonutArcDescriptor, clickedIndex: number) => {
                if (d3.event.defaultPrevented) return; // click was suppressed, for example from drag event
                this.setInteractiveChosenSlice(clickedIndex);
            });

            // Set the drag events
            var drag = d3.behavior.drag()
                .origin(Object)
                .on('dragstart', () => this.interactiveDragStart())
                .on('drag', () => this.interactiveDragMove())
                .on('dragend', () => this.interactiveDragEnd());
            svg
                .style('touch-action', 'none')
                .call(drag);
        }

        /**
         * Get the angle (in degrees) of the drag event coordinates.
         * The angle is calculated against the plane of the center of the donut
         * (meaning, when the center of the donut is at (0,0) coordinates).
         */
        private getAngleFromDragEvent(): number {
            var interactivityState = this.interactivityState;

            // get pageX and pageY (coordinates of the drag event) according to event type
            var pageX, pageY;
            var sourceEvent = <any>d3.event.sourceEvent;
            // check if that's a touch event or not
            if (sourceEvent.type.toLowerCase().indexOf('touch') !== -1) {
                if (sourceEvent.touches.length !== 1) return null; // in case there isn't a single touch - return null and do nothing.
                // take the first, single, touch surface.
                var touch = sourceEvent.touches[0];
                pageX = touch.pageX;
                pageY = touch.pageY;
            } else {
                pageX = sourceEvent.pageX;
                pageY = sourceEvent.pageY;
            }

            // Adjust the coordinates, putting the donut center as the (0,0) coordinates
            var adjustedCoordinates = { x: pageX - interactivityState.donutCenter.x, y: -pageY + interactivityState.donutCenter.y };
            // Move to polar axis - take only the angle (theta), and convert to degrees
            var angvaroThePlane = Math.atan2(adjustedCoordinates.y, adjustedCoordinates.x) * 180 / Math.PI;
            return angvaroThePlane;
        }

        private interactiveDragStart(): void {
            this.interactivityState.totalDragAngleDifference = 0;
            this.interactivityState.previousDragAngle = this.getAngleFromDragEvent();
        }

        private interactiveDragMove(): void {
            var data = this.data.dataPoints;
            var viewport = this.currentViewport;
            var interactivityState = this.interactivityState;
            if (interactivityState.interactiveChosenSliceFinishedSetting === true) {
                // get current angle from the drag event
                var currentDragAngle = this.getAngleFromDragEvent();
                if (!currentDragAngle) return; // if no angle was returned, do nothing
                // compare it to the previous drag event angle
                var angleDragDiff = interactivityState.previousDragAngle - currentDragAngle;

                interactivityState.totalDragAngleDifference += angleDragDiff;
                interactivityState.previousDragAngle = currentDragAngle;

                // Rotate the chart by the difference in angles
                interactivityState.currentRotate += angleDragDiff;

                // Rotate the chart to the current rotate angle
                this.svg.select('g')
                    .attr('transform', SVGUtil.translateAndRotate(viewport.width / 2, viewport.height / 2, 0, 0, this.interactivityState.currentRotate));

                var currentHigherLimit = data[0].data.percentage * interactivityState.valueToAngleFactor;
                var currentAngle = interactivityState.currentRotate <= 0 ? (interactivityState.currentRotate * -1) % 360 : (360 - (interactivityState.currentRotate % 360));

                interactivityState.currentIndexDrag = 0;
                //consider making this  ++interactivityState.currentIndexDrag ? then you don't need the if statement, the interactivityState.currentIndexDrag +1 and interactivityState.currentIndexDrag++
                // Check the current index according to the angle 
                var dataLength = data.length;
                while ((interactivityState.currentIndexDrag < dataLength) && (currentAngle > currentHigherLimit)) {
                    if (interactivityState.currentIndexDrag < (dataLength - 1)) {
                        currentHigherLimit += (data[interactivityState.currentIndexDrag + 1].data.percentage * interactivityState.valueToAngleFactor);
                    }
                    interactivityState.currentIndexDrag++;
                }

                // If the index changed update the legend and opacity
                if (interactivityState.currentIndexDrag !== interactivityState.previousIndexDrag) {
                    interactivityState.interactiveLegend.updateLegend(interactivityState.currentIndexDrag);
                    // set the opacticity of the top slice to full and the others to semi-transparent
                    this.svg.selectAll('.slice').attr('opacity', (d, index) => {
                        return index === interactivityState.currentIndexDrag ? DonutChartGMO.OpaqueOpacity : DonutChartGMO.SemiTransparentOpacity;
                    });
                    interactivityState.previousIndexDrag = interactivityState.currentIndexDrag;
                }
            }
        }

        private interactiveDragEnd(): void {
            // If totalDragDifference was changed, means we have a drag event (compared to a click event)
            if (this.interactivityState.totalDragAngleDifference !== 0) {
                this.setInteractiveChosenSlice(this.interactivityState.currentIndexDrag);
                // drag happened - disable click event
                d3.event.sourceEvent.stopPropagation();
            }
        }

        private updateInternalToMove(data: DonutDataGMO, duration: number = 0) {
            // Cache for performance
            var svg = this.svg;
            var pie = this.pie;
            var key = this.key;
            var arc = this.arc;
            var radius = this.radius;
            var previousRadius = this.previousRadius;
            var sliceWidthRatio = this.sliceWidthRatio;

            var existingData = this.svg.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data().map((d: DonutArcDescriptor) => d.data);

            if (existingData.length === 0) {
                existingData = data.dataPointsToDeprecate;
            }

            var is = this.mergeDatasets(existingData, data.dataPointsToDeprecate);

            var slice = svg.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data(pie(data.dataPointsToDeprecate), key);

            slice.enter()
                .insert('path')
                .classed(DonutChartGMO.sliceClass.class, true)
                .each(function (d) { this._current = d; });

            slice = svg.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data(pie(is), key);

            var innerRadius = radius * sliceWidthRatio;
            DonutChart.isSingleColor(data.dataPoints);

            slice
                .style('fill', (d: DonutArcDescriptor) => d.data.color)
                .style('fill-opacity', (d: DonutArcDescriptor) => ColumnUtil.getFillOpacity(d.data.selected, false, false, data.hasHighlights))
                .style('stroke', 'white')
                .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio))
                .style('stroke-width', (d: DonutArcDescriptor) => d.data.strokeWidth)
                .transition().duration(duration)
                .attrTween('d', function (d) {

                    var i = d3.interpolate(this._current, d),
                        k = d3.interpolate(previousRadius * DonutChartGMO.InnerArcRadiusRatio
                            , radius * DonutChartGMO.InnerArcRadiusRatio);
                    this._current = i(0);
                    return function (t) {
                        return arc.innerRadius(innerRadius).outerRadius(k(t))(i(t));
                    };
                });

            slice = svg.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data(pie(data.dataPointsToDeprecate), key);

            slice.exit()
                .transition()
                .delay(duration)
                .duration(0)
                .remove();

            // For interactive chart, there shouldn't be slice labels (as you have the legend).
            if (!this.isInteractive) {
                var labelSettings = data.dataLabelsSettings;
                var labels: Label[] = [];
                if (labelSettings && labelSettings.show) {
                    labels = this.createLabels();
                }
                NewDataLabelUtils.drawDefaultLabels(this.labelGraphicsContext, labels, false, true);
                NewDataLabelUtils.drawLabelLeaderLines(this.labelGraphicsContext, labels);
            }
            var highlightSlices = undefined;
            if (data.hasHighlights) {
                // Draw partial highlight slices.
                highlightSlices = svg
                    .select('.slices')
                    .selectAll('path' + DonutChartGMO.sliceHighlightClass.selector)
                    .data(pie(data.dataPointsToDeprecate), key);

                highlightSlices
                    .enter()
                    .insert('path')
                    .classed(DonutChartGMO.sliceHighlightClass.class, true)
                    .each(function (d) { this._current = d; });

                DonutChart.isSingleColor(data.dataPoints);

                highlightSlices
                    .style('fill', (d: DonutArcDescriptor) => d.data.color)
                    .style('fill-opacity', 1.0)
                    .style('stroke', 'white')
                    .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio, d.data.highlightRatio))
                    .style('stroke-width', (d: DonutArcDescriptor) => d.data.highlightRatio === 0 ? 0 : d.data.strokeWidth)
                    .transition().duration(duration)
                    .attrTween('d', function (d: DonutArcDescriptor) {

                        var i = d3.interpolate(this._current, d),
                            k = d3.interpolate(
                                previousRadius * DonutChartGMO.InnerArcRadiusRatio,
                                DonutChartGMO.getHighlightRadius(radius, sliceWidthRatio, d.data.highlightRatio));
                        this._current = i(0);
                        return function (t) {
                            return arc.innerRadius(innerRadius).outerRadius(k(t))(i(t));
                        };
                    });

                highlightSlices
                    .exit()
                    .transition()
                    .delay(duration)
                    .duration(0)
                    .remove();
            }
            else {
                svg
                    .selectAll('path' + DonutChartGMO.sliceHighlightClass.selector)
                    .transition()
                    .delay(duration)
                    .duration(0)
                    .remove();
            }
            //tarang
            var titleHeight = parseInt(this.root.select('.Title_Div_Text').style('height'), 10);
            // var legendHeight = parseInt(this.root.select('.legend-item').style('height'), 10);
            if (this.getShowTitle(this.dataView)) {
                if (this.data.legendObjectProperties === undefined) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2) + (titleHeight) + parseInt(this.customLegendHeight, 10);
                }
                else if ((this.data.legendObjectProperties['show']) && (this.data.legendObjectProperties['position'] === 'Top' || this.data.legendObjectProperties['position'] === 'TopCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2) + (titleHeight) + parseInt(this.customLegendHeight, 10);
                }
                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Bottom' || this.data.legendObjectProperties['position'] === 'BottomCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height) / 2) - (innerRadius / Math.SQRT2) + (titleHeight) - parseInt(this.customLegendHeight, 10);
                }
                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Left' || this.data.legendObjectProperties['position'] === 'LeftCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2) + parseInt(this.customLegendWidth, 10);
                    var y = ((this.currentViewport.height) / 2) - (innerRadius / Math.SQRT2) + (titleHeight);
                }

                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Right' || this.data.legendObjectProperties['position'] === 'RightCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2) - parseInt(this.customLegendWidth, 10);
                    var y = ((this.currentViewport.height) / 2) - (innerRadius / Math.SQRT2) + (titleHeight);
                }
                else {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2) + (titleHeight);
                }
            }
            else {
                if (this.data.legendObjectProperties === undefined) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2) + parseInt(this.customLegendHeight, 10);

                }
                else if ((this.data.legendObjectProperties['show']) && (this.data.legendObjectProperties['position'] === 'Top' || this.data.legendObjectProperties['position'] === 'TopCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2);
                }
                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Bottom' || this.data.legendObjectProperties['position'] === 'BottomCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height) / 2) - (innerRadius / Math.SQRT2);
                }
                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Left' || this.data.legendObjectProperties['position'] === 'LeftCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2);
                }
                else if (this.data.legendObjectProperties['show'] && (this.data.legendObjectProperties['position'] === 'Right' || this.data.legendObjectProperties['position'] === 'RightCenter')) {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2);
                }
                else {
                    var x = (this.currentViewport.width / 2) - (innerRadius / Math.SQRT2);
                    var y = ((this.currentViewport.height + 50) / 2) - (innerRadius / Math.SQRT2);
                }
            }
            var width = (innerRadius * Math.SQRT2);
            var height = (innerRadius * Math.SQRT2);
            if (this.currentViewport.width > 150 && this.currentViewport.height > 100) {
                this.root.select('.SummarizedDiv')
                    .append('div').style({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': y + 'px',
                        'left': x + 'px',
                        'position': 'absolute',
                        'overflow': 'hidden',
                    }).classed('SummarizedDivContainer', true);

                this.root.select('.SummarizedDivContainer')
                    .append('div')
                    .classed('pContainer', true)
                    .style({
                        'position': 'absolute',
                        'top': '50%',
                        'transform': 'translate(0, -50%)',
                        'width': '100%',
                    });

                if (this.isPrimaryMeasureSelected) {
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('TotalText', true)
                        .text('Total')
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('TotalValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    if (this.getShowStatus(this.dataViews[0], 'show', 'Indicators')) {
                        if (this.getShowStatus(this.dataViews[0], 'PrimaryMeasure', 'Indicators'))
                            var threshold_Value = 0;

                        else {
                            threshold_Value = this.getStatus(this.dataViews[0], 'Total_Threshold', 'Indicators');
                            if (this.isPrimaryMeasurePercentage)
                                threshold_Value = threshold_Value / 100;
                        }
                        if (threshold_Value <= this.data.primaryMeasureSum) {
                            //console.log(this.getStatus(this.dataViews[0], 'Threshold'));
                            this.root.select('.TotalValue')
                                .html('<div class = "primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.primaryMeasureSum + '</div><span class="primaryMeasureIndicator" style="width=15%;                                                    position:absolute;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        }
                        else {
                            this.root.select('.TotalValue')
                                .html('<div class="primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.primaryMeasureSum + '</div><span class = "primaryMeasureIndicator" style="width=15%;                                                     position:absolute;float:left; color:red;margin-left:2px;">&#9660;</span>');
                        }

                    }
                    else {
                        this.root.select('.TotalValue')
                            .html('<div class="primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + this.data.primaryMeasureSum);
                    }
                }
                if (this.isSecondaryMeasureSelected) {
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('SecondaryText', true)
                        .text(this.secondaryMeasureName)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    this.root.select('.pContainer')
                        .append('p')
                        .classed('SecondaryValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    if (this.getShowStatus(this.dataViews[0], 'show', 'SMIndicator')) {
                        if (this.getShowStatus(this.dataViews[0], 'SecondaryMeasure', 'SMIndicator'))
                            var threshold_Value = 0;

                        else {
                            threshold_Value = this.getStatus(this.dataViews[0], 'SMTotalThreshold', 'SMIndicator');
                            if (this.isSecondaryMeasurePercentage)
                                threshold_Value = threshold_Value / 100;
                        }
                        if (threshold_Value <= this.data.secondaryMeasureSum) {
                            //console.log(this.getStatus(this.dataViews[0], 'SMThreshold'));
                            this.root.select('.SecondaryValue')
                                .html('<div class = "secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.secondaryMeasureSum + '</div><span class="secondaryMeasureIndicator"                                        style="width=15%; position:absolute;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        }
                        else {
                            this.root.select('.SecondaryValue')
                                .html('<div class="secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.secondaryMeasureSum + '</div><span class = "secondaryMeasureIndicator"                                        style="width=15%; position:absolute;float:left; color:red;margin-left:2px;">&#9660;</span>');
                        }
                    }
                    else {
                        this.root.select('.SecondaryValue')
                            .html('<div class="secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + this.data.secondaryMeasureSum + '</div>');
                    }
                }
            }
            //tarang end

            this.assignInteractions(slice, highlightSlices, data);
            if (this.tooltipsEnabled) {
                TooltipManager.addTooltip(slice, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                if (data.hasHighlights) {
                    TooltipManager.addTooltip(highlightSlices, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                }
            }

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);

            //  if (this.isInteractive) {
            //this.addInteractiveLegendArrowGMO();
            //this.interactivityState.interactiveLegend.drawLegend(this.data, this.dataViews[0]);
            this.setInteractiveChosenSlice(this.interactivityState.lastChosenInteractiveSliceIndex ? this.interactivityState.lastChosenInteractiveSliceIndex : 0);
            // }
        }

        public static drawDefaultShapes(graphicsContext: D3.Selection, donutData: DonutDataGMO, layout: DonutLayout, colors: IDataColorPalette, radius: number, hasSelection: boolean, sliceWidthRatio: number, defaultColor?: string): D3.UpdateSelection {
            var shapes = graphicsContext.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data(donutData.dataPoints, (d: DonutArcDescriptor) => d.data.identity.getKey());

            shapes.enter()
                .insert('path')
                .classed(DonutChartGMO.sliceClass.class, true);

            DonutChart.isSingleColor(donutData.dataPoints);

            shapes
                .style('fill', (d: DonutArcDescriptor) => d.data.color)
                .style('fill-opacity', (d: DonutArcDescriptor) => ColumnUtil.getFillOpacity(d.data.selected, false, hasSelection, donutData.hasHighlights))
                .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio))
                .style('stroke-width', (d: DonutArcDescriptor) => d.data.strokeWidth)
                .attr(layout.shapeLayout);

            shapes.exit()
                .remove();

            return shapes;
        }

        public static drawDefaultHighlightShapes(graphicsContext: D3.Selection, donutData: DonutDataGMO, layout: DonutLayout, colors: IDataColorPalette, radius: number, sliceWidthRatio: number): D3.UpdateSelection {
            var shapes = graphicsContext.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceHighlightClass.selector)
                .data(donutData.dataPoints.filter((value: DonutArcDescriptor) => value.data.highlightRatio != null), (d: DonutArcDescriptor) => d.data.identity.getKey());

            shapes.enter()
                .insert('path')
                .classed(DonutChartGMO.sliceHighlightClass.class, true)
                .each(function (d) { this._current = d; });

            DonutChart.isSingleColor(donutData.dataPoints);

            shapes
                .style('fill', (d: DonutArcDescriptor) => d.data.color)
                .style('fill-opacity', (d: DonutArcDescriptor) => ColumnUtil.getFillOpacity(d.data.selected, true, false, donutData.hasHighlights))
                .style('stroke', 'white')
                .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio, d.data.highlightRatio))
                .style('stroke-width', (d: DonutArcDescriptor) => d.data.highlightRatio === 0 ? 0 : d.data.strokeWidth)
                .attr(layout.highlightShapeLayout);

            shapes.exit()
                .remove();

            return shapes;
        }

        /**
            Set true to the last data point when all slices have the same color
        */
        public static isSingleColor(dataPoints: DonutArcDescriptor[]): void {
            if (dataPoints.length > 1) {
                var lastPoint = dataPoints.length - 1;
                dataPoints[lastPoint].data.isLastInDonut = dataPoints[lastPoint].data.color === dataPoints[0].data.color;
            }
        }

        public static drawStrokeForDonutChart(radius: number, innerArcRadiusRatio: number, d: DonutArcDescriptor, sliceWidthRatio: number, highlightRatio: number = 1): string {
            var sliceRadius = radius * innerArcRadiusRatio * highlightRatio;
            var sliceArc = (d.endAngle - d.startAngle) * sliceRadius;
            var sectionWithoutStroke: number;
            var sectionWithStroke: number;

            /*Donut chart*/
            if (sliceWidthRatio) {
                var innerRadius = radius * sliceWidthRatio;
                var outerRadius = highlightRatio * radius * (DonutChartGMO.InnerArcRadiusRatio - sliceWidthRatio);
                var innerSliceArc = (d.endAngle - d.startAngle) * innerRadius;
                if (d.data.highlightRatio)
                    sliceArc = (d.endAngle - d.startAngle) * (outerRadius + innerRadius);

                if (d.data.isLastInDonut) {
                    //if all slices have the same color, the stroke of the last slice needs to be drawn on both radiuses
                    return 0 + " " + sliceArc + " " + outerRadius + " " + innerSliceArc + " " + outerRadius;
                }
                sectionWithoutStroke = sliceArc + outerRadius + innerSliceArc;
                sectionWithStroke = outerRadius;
            }

            /*Pie Chart*/
            else {
                if (d.data.isLastInDonut) {
                    //if all slices have the same color, the stroke of the last slice needs to be drawn on both radiuses
                    sectionWithoutStroke = sliceArc;
                    sectionWithStroke = sliceRadius * 2;
                }
                else {
                    sectionWithoutStroke = sliceArc + sliceRadius;
                    sectionWithStroke = sliceRadius;
                }
            }

            return 0 + " " + sectionWithoutStroke + " " + sectionWithStroke;
        }

        public onClearSelection() {
            if (this.interactivityService)
                this.interactivityService.clearSelection();
        }

        public static getLayout(radius: number, sliceWidthRatio: number, viewport: IViewport, labelSettings: VisualDataLabelsSettings): DonutLayout {
            var innerRadius = radius * sliceWidthRatio;
            var arc = d3.svg.arc().innerRadius(innerRadius);
            var arcWithRadius = arc.outerRadius(radius * DonutChartGMO.InnerArcRadiusRatio);
            var fontSize = PixelConverter.fromPoint(labelSettings.fontSize);
            return {
                fontSize: fontSize,
                shapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        return arcWithRadius(d);
                    }
                },
                highlightShapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        var highlightArc = arc.outerRadius(DonutChartGMO.getHighlightRadius(radius, sliceWidthRatio, d.data.highlightRatio));
                        return highlightArc(d);
                    }
                },
                zeroShapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        var zeroWithZeroRadius = arc.outerRadius(innerRadius || DonutChart.EffectiveZeroValue);
                        return zeroWithZeroRadius(d);
                    }
                },
            };
        }

        private static getHighlightRadius(radius: number, sliceWidthRatio: number, highlightRatio: number): number {
            var innerRadius = radius * sliceWidthRatio;
            return innerRadius + highlightRatio * radius * (DonutChartGMO.InnerArcRadiusRatio - sliceWidthRatio);
        }

        public static cullDataByViewport(dataPoints: DonutDataPoint[], maxValue: number, viewport: IViewport): DonutDataPoint[] {
            var estimatedRadius = Math.min(viewport.width, viewport.height) / 2;
            // Ratio of slice too small to show (invisible) = invisbleArcLength / circumference
            var cullRatio = this.invisibleArcLengthInPixels / (estimatedRadius * DonutChartGMO.twoPi);
            var cullableValue = cullRatio * maxValue;
            var culledDataPoints: DonutDataPoint[] = [];
            var prevPointColor: string;
            for (var datapoint in dataPoints) {
                if (datapoint.measure >= cullableValue) {
                    //updates the stroke width
                    datapoint.strokeWidth = prevPointColor === datapoint.color ? 1 : 0;
                    prevPointColor = datapoint.color;
                    culledDataPoints.push(datapoint);
                }
            }

            return culledDataPoints;
        }
        private getDetailedLegend(dataView: DataView) {
            var property: any = [], displayOption: string = 'None';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) {
                    property = dataView.metadata.objects['legend'];
                    if (property && property.hasOwnProperty('detailedLegend')) {
                        displayOption = property['detailedLegend'];
                    }
                }
            }
            return displayOption;
        }
        public getLegendDispalyUnits(dataView: DataView, propertyName: string) {
            var property: any = [], displayOption;
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) {
                    property = dataView.metadata.objects['legend'];
                    if (property && property.hasOwnProperty(propertyName)) {
                        displayOption = property[propertyName];
                    }
                    else if (propertyName === 'labelDisplayUnits')
                        displayOption = 0;
                }
                else if (propertyName === 'labelDisplayUnits')
                    displayOption = 0;
            } else if (propertyName === 'labelDisplayUnits')
                displayOption = 0;
            return displayOption;
        }
    }
}
