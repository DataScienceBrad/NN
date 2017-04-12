/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/* Please make sure that this path is correct */

module powerbi.extensibility.visual {
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    //Model 
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
    export interface StackViewModel {
        data: [Object];
        toolTipInfo: TooltipDataItem[];
        toolTipInfoLegends: TooltipDataItem[];
        legendName: string;
        legendName2: string;
        Low_HighIndicator: string;
        IncreasingTrend: string;
        DecreasingTrend: string;
        TrendLine: string;
        IsGrouped: boolean;
        legendTextSize: string;
        labelColor: string;
        legendShowAllDataPoints: boolean;
        legendDefaultColor: string;
        hasLegend: boolean;
        hasTrend: boolean;
        hasYAxis: boolean;
        hasXAxis: boolean;
        yaxisColor: string;
        xaxisColor: string;
        hasBorder: boolean;
        borderColor: string;
        displayUnits: number;
        trendLineWidth: number;
        textPrecision: number;
        format: {};
    }


    //object variable which we used in customized color and text through UI options
    export var StockProps = {
        dataColors: {
            LowHighDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'LowHighDataColor' },
            OpenCloseDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'OpenCloseDataColor' },
            LossPriceColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'LossPriceColor' },
        },
        legends: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'show' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'labelColor' },
        },
        trends: {
            hasTrend: <DataViewObjectPropertyIdentifier>{ objectName: 'trends', propertyName: 'show' },
            TrendLineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'trends', propertyName: 'TrendLineColor' },
            trendLineWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'trends', propertyName: 'trendLineWidth' }
        },
        yAxis: {
            hasYAxis: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'show' },
            yaxisColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'textPrecision' },
        },
        xAxis: {
            hasXAxis: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'show' },
            xaxisColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'color' },
        },
        stockBorder: {
            hasBorder: <DataViewObjectPropertyIdentifier>{ objectName: 'stockBorder', propertyName: 'show' },
            borderColor: <DataViewObjectPropertyIdentifier>{ objectName: 'stockBorder', propertyName: 'color' },
        }

    };
    //Visual
    export class StockChart implements IVisual {
        //Variables 
        public y: any;
        public x: any;
        public dateVar: any;
        private svg: d3.Selection<SVGElement>;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        public rootElement: d3.Selection<SVGElement>;
        public errorDiv: d3.Selection<SVGElement>;
        public dataView: DataView;
        public ORIGIN_COORD;
        public SVG_SIZE: any;
        public MARGINS: any;
        public zoom: any;
        public toolTipInfo: any;
        public toolTipInfoLegends: any;
        public values: StackViewModel;
        public groupLegends: d3.Selection<SVGElement>;
        public chart: d3.Selection<SVGElement>;
        public groupLegendSelected: any;
        public legends_height: any;
        public formatter: any;
        private host: IVisualHost;

        public static getDefaultData(): StackViewModel {
            return {
                data: [{}],
                toolTipInfo: [],
                toolTipInfoLegends: [],
                Low_HighIndicator: 'grey',
                IncreasingTrend: 'green',
                DecreasingTrend: 'red',
                TrendLine: 'rgb(242, 200, 17)',
                IsGrouped: false,
                legendName: 'Increasing Trend',
                legendName2: 'Decreasing Trend',
                legendTextSize: '14',
                labelColor: 'rgb(102, 102, 102)',
                legendDefaultColor: 'grey',
                legendShowAllDataPoints: true,
                hasLegend: false,
                hasTrend: true,
                hasYAxis: true,
                hasXAxis: true,
                yaxisColor: 'grey',
                xaxisColor: 'grey',
                hasBorder: true,
                borderColor: '#666666',
                displayUnits: 0,
                trendLineWidth: 2,
                textPrecision: 0,
                format: {}
            };
        }
        //One time setup
        //First time it will be called and made the structure of your visual
        constructor(options: VisualConstructorOptions) {
            //Create the SVG MainDivision 

            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element)
                .append('div')
                .classed('stock_Container', true);
            this.errorDiv = this.rootElement.append('div').classed('StockChartError', true);


            this.groupLegends = this.rootElement
                .append('div')
                .classed('stock_legends', true);
            this.chart = this.rootElement
                .append('div')
                .classed('chart', true);
            this.svg = this.chart
                .append('svg')
                .classed('linearSVG', true)
                .style('overflow', 'visible');
            this.toolTipInfo = [{ displayName: '', value: '' }];
            this.MARGINS = { top: 10, left: 45, bottom: 40, right: 35 };
            this.ORIGIN_COORD = { x: this.MARGINS.left, y: 480 };
            this.SVG_SIZE = { h: 420, w: 500 };
            this.legends_height = 0;
        }

        //Zoom function implementation to provide responsiveness
        public updateZoom(options): void {
            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;

            var YAxisLabel = d3.max(this.values.data.map(function (d) { return d['high']; }));
            if ((this.values && this.values.displayUnits) && this.values.displayUnits > 1) {
                var formatter = this.formatter;
                YAxisLabel = formatter.format(YAxisLabel);
            }
            else {
                var precision = this.values.textPrecision;
                YAxisLabel = d3.format(',.' + precision + 'f')(YAxisLabel);
            }
            var YAxisLabelTextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                text: YAxisLabel,
                fontFamily: "sans-serif",
                fontSize: '11px'
            };
            var YAxisLabelWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(YAxisLabelTextProperties);
            width = width - YAxisLabelWidth / 2;

            this.legends_height = 0;

            if (this.values && this.values.hasLegend)
                this.legends_height = this.rootElement.selectAll('.stock_legends')[0][0]['clientHeight'];

            this.SVG_SIZE.w = width - this.MARGINS.left - this.MARGINS.right;
            this.SVG_SIZE.h = height - this.MARGINS.top - this.MARGINS.bottom - this.legends_height;
            this.ORIGIN_COORD.y = this.SVG_SIZE.h + this.MARGINS.top;


            if (this.SVG_SIZE.h >= 20 && this.SVG_SIZE.w >= 20) {

                this.svg
                    .attr('height', height)
                    .attr('width', width);
                this.svg.style('display', 'block');
            } else {
                this.svg.style('display', 'none');
                this.groupLegends.selectAll('div').remove();
            }
            this.chart.style('zoom', 1);
        }

        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): StackViewModel {
            var resultSet: StackViewModel = StockChart.getDefaultData();
            resultSet.data.length = 0;
            if (dataView && dataView.categorical && dataView.categorical.values && (dataView.categorical.values.length == 4) && (dataView.categorical.categories)) {

                for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
                    var rowSet = {};
                    var cat_vals = dataView.metadata.columns;
                    var isPositive = true;
                    for (var k = 0; k < 4; k++) {
                        // Categories

                        var colName = dataView.categorical.categories[0].source.displayName.toLowerCase();
                        let dateVar: any = dataView.categorical.categories[0].values[i];
                        if (Object.prototype.toString.call(dateVar) === "[object Date]" || Object.prototype.toString.call(dateVar) === "[object Number]") {
                            // it is a date
                            if (isNaN(new Date(dateVar.toString()).getTime())) {
                                // date is not valid
                                isPositive = false;
                                break;
                            }
                            else {
                                if (colName == "year") {
                                    rowSet['date'] = dateVar + '-01-01';
                                    resultSet.IsGrouped = true;
                                } else {
                                    resultSet.IsGrouped = false;
                                    colName = 'date';
                                    var timezoneffset = (new Date()).getTimezoneOffset() * 60000;
                                    rowSet['date'] = (new Date(dateVar - timezoneffset)).toISOString().substring(0, 10);
                                }
                            }
                        }
                        else {
                            // not a date
                            isPositive = false;
                            break;
                        }

                        // Each values
                        if (dataView.categorical.values[k].source.roles['low']) {
                            colName = 'low';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles['high']) {
                            colName = 'high';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles['open']) {
                            colName = 'open';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles['close']) {
                            colName = 'close';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        }
                        if (parseFloat(dataView.categorical.values[k].values[i].toString()) <= 0) {
                            isPositive = false;
                            break;
                        } else {
                            rowSet[colName] = dataView.categorical.values[k].values[i];
                        }
                    }
                    if (isPositive) {
                        if (parseFloat(rowSet['open']) > parseFloat(rowSet['high']) || parseFloat(rowSet['close']) < parseFloat(rowSet['low']) || parseFloat(rowSet['low']) > parseFloat(rowSet['open']) || parseFloat(rowSet['high']) < parseFloat(rowSet['close']) || parseFloat(rowSet['low']) > parseFloat(rowSet['high'])) {
                            // Do nothing. Invalid data
                        } else {
                            resultSet.data.push(rowSet);
                        }
                    }
                }
            } else {
                return this.getDefaultData();
            }
            return resultSet;
        }

        public createAxis(viewModel: StackViewModel, options: VisualUpdateOptions): void {
            var dateParseFormat = d3.time.format('%Y-%m-%d');
            var dateFormat = d3.time.format("%d-%b-%y");
            var yearFormat = d3.time.format("%Y");
            var svgcontainer = this.svg;
            var T_TICKS_COUNT = Math.ceil(this.SVG_SIZE.h / 75);//7;

            svgcontainer.selectAll("*").remove();
            //Create the Scale we will use for the XAxis 
            try {
                T_TICKS_COUNT = Math.ceil(this.SVG_SIZE.w / 130);

                if (viewModel && viewModel.data[0]['date']) {

                    var max_date: any = new Date(viewModel.data[0]['date']),
                        min_date: any = new Date(viewModel.data[0]['date']),
                        diff_days: number = 0,
                        ratio_day_len;

                    for (var i in viewModel.data) {
                        var dt = new Date(viewModel.data[i]['date']);
                        if (max_date < dt) {
                            max_date = dt;
                        }
                        if (min_date > dt) {
                            min_date = dt;
                        }
                    }

                    if ((max_date - min_date) == 0) {
                        if (viewModel.IsGrouped) {
                            max_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) + 1) + '-01-01');
                            min_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) - 1) + '-01-01');
                        } else {
                            min_date = max_date = dateParseFormat.parse(viewModel.data[0]['date']);
                            max_date = powerbi.extensibility.utils.formatting.dateUtils.addDays(max_date, 7);
                            min_date = powerbi.extensibility.utils.formatting.dateUtils.addDays(min_date, -7);
                        }
                    }
                    diff_days = (max_date - min_date) / (1000 * 60 * 60 * 24);

                    var XScale = d3.time.scale()
                        .range([0, this.SVG_SIZE.w])
                        .domain([min_date, max_date]);

                    var arr = [];
                    var newDate = new Date();
                    newDate = min_date;
                    newDate = new Date(newDate.setDate(newDate.getDate()));
                    var ne = new Date(newDate + '');
                    arr.push(ne);

                    for (var count = 1; count < T_TICKS_COUNT; count++) {
                        newDate = new Date(newDate.setDate(newDate.getDate() + Math.ceil(diff_days / T_TICKS_COUNT)));
                        var date1 = new Date(newDate + '');
                        arr.push(date1);
                    }

                    if (this.MARGINS) {
                        var xAxisGroup = svgcontainer.append('g')
                            .call(
                            d3.svg.axis()
                                .scale(XScale)
                                .tickValues(arr)
                                .tickSize(0)
                                .orient("bottom")
                                .tickFormat(viewModel.IsGrouped ? yearFormat : dateFormat)
                                .tickPadding(12)
                            )
                            .classed('Stock_xaxis', true)
                            .attr('transform', 'translate(' + (this.MARGINS.left) + ',' + (this.SVG_SIZE.h + this.MARGINS.top + 2) + ')');
                    }
                }
            }
            catch (err) {
            }
            try {
                //Create the Scale we will use for the yAxis
                T_TICKS_COUNT = Math.ceil(this.SVG_SIZE.h / 75);
                if (T_TICKS_COUNT <= 1) T_TICKS_COUNT = 2;

                var lowestValue = d3.min(viewModel.data.map(function (d) { return d['low']; }));
                var highestValue = d3.max(viewModel.data.map(function (d) { return d['high']; }));

                var difference = highestValue - lowestValue;

                lowestValue = lowestValue - difference * 0.1;      //0.1 for adding extra 10% vertical space
                highestValue = highestValue + difference * 0.1;      //0.1 for adding extra 10% vertical space

                lowestValue = lowestValue - (lowestValue % 5);      //rounding off value to nearest multiple of 5
                highestValue = highestValue + (5 - (highestValue % 5));       //rounding off value to nearest multiple of 5

                lowestValue = lowestValue < 0 ? 0 : lowestValue;       //Y-axis value not less than 0

                var YScale = d3.scale.linear()
                    .domain([lowestValue, highestValue])
                    .range([this.SVG_SIZE.h - 1, 0]);

                if (this.MARGINS) {
                    var yAxisGroup = svgcontainer.append('g')
                        .classed('Stock_yaxis', true)
                        .call(d3.svg.axis()
                            .scale(YScale)
                            .ticks(T_TICKS_COUNT)
                            .tickSize(0)
                            .orient("left"))
                        .attr('transform', 'translate(' + (this.MARGINS.left - 10) + ',' + (this.MARGINS.top) + ')');
                }
                svgcontainer.selectAll("line.yaxis")
                    .data(YScale.ticks(T_TICKS_COUNT))
                    .enter().append("line")
                    .attr("class", "xAxes")
                    .attr("x1", this.MARGINS.left)
                    .attr("x2", this.SVG_SIZE.w + this.MARGINS.left)
                    .attr("y1", YScale)
                    .attr("y2", YScale)
                    .attr('transform', 'translate(0,' + (this.MARGINS.top) + ')')
                    .style("stroke", "#ccc");
            }
            catch (err) {
            }
        }

        //Drawing the visual	   
        public update(options: VisualUpdateOptions) {
            this.svg.select('.svgFrame').remove();
            this.groupLegends.selectAll('div').remove();
            this.svg.selectAll('g').remove();
            this.svg.selectAll('path').remove();
            this.svg.selectAll('line').remove();

            var self = this;
            var dataView = this.dataView = options.dataViews[0];
            var viewModel = this.values = StockChart.converter(dataView);
            var objects = null;
            if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }
            if (objects) {
                this.values.Low_HighIndicator = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.dataColors.LowHighDataColor, this.values.Low_HighIndicator);
                this.values.IncreasingTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.dataColors.OpenCloseDataColor, this.values.IncreasingTrend);
                this.values.DecreasingTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.dataColors.LossPriceColor, this.values.DecreasingTrend);
                this.values.hasLegend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.legends.show, this.values.hasLegend);
                this.values.labelColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.legends.labelColor, this.values.labelColor);
                this.values.hasTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.trends.hasTrend, this.values.hasTrend);
                this.values.TrendLine = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.trends.TrendLineColor, this.values.TrendLine);
                this.values.hasYAxis = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.yAxis.hasYAxis, this.values.hasYAxis);
                this.values.hasXAxis = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.xAxis.hasXAxis, this.values.hasXAxis);
                this.values.yaxisColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.yAxis.yaxisColor, this.values.yaxisColor);
                this.values.xaxisColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.xAxis.xaxisColor, this.values.xaxisColor);
                this.values.hasBorder = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.stockBorder.hasBorder, this.values.hasBorder);
                this.values.borderColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, StockProps.stockBorder.borderColor, this.values.borderColor);
                this.values.displayUnits = powerbi.extensibility.utils.dataview.DataViewObjects.getValue<number>(objects, StockProps.yAxis.displayUnits, this.values.displayUnits);
                this.values.trendLineWidth = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.trends.trendLineWidth, this.values.trendLineWidth);
                this.values.textPrecision = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, StockProps.yAxis.textPrecision, this.values.textPrecision);
                this.values.textPrecision = this.values.textPrecision > 4 ? 4 : (this.values.textPrecision < 0) ? 0 : this.values.textPrecision;
            }

            this.errorDiv.selectAll('span').remove();
            if (viewModel && viewModel.data[0] && viewModel.data[0]['date']) {


                var legends_LowHighBlock = this.groupLegends
                    .append('div').attr('title', this.values.legendName)
                    .classed('legends_LowHighBlock', true)

                var textPropertiesLegenName: powerbi.extensibility.utils.formatting.TextProperties = {
                    text: this.values.legendName,
                    fontFamily: "Segoe UI",
                    fontSize: this.values.legendTextSize + 'px'
                };

                var textPropertiesLegendName2: powerbi.extensibility.utils.formatting.TextProperties = {
                    text: this.values.legendName2,
                    fontFamily: "Segoe UI",
                    fontSize: this.values.legendTextSize + 'px'
                };

                var title = legends_LowHighBlock
                    .append('div')
                    .classed('title', true)
                    .classed('text', true)
                    .style('font-size', this.values.legendTextSize + 'px')
                    .style('color', this.values.labelColor).text(powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(textPropertiesLegenName, (options.viewport.width * 20) / 100));

                legends_LowHighBlock
                    .append('div')
                    .classed('legend', true)
                    .style('width', this.values.Low_HighIndicator)
                    .style('height', this.values.Low_HighIndicator)
                    .style('border-left', '8px solid transparent')
                    .style('border-right', '8px solid transparent')
                    .style('border-bottom', '8px solid')
                    .style('border-bottom-color', this.values.IncreasingTrend);

                var legends_OpenCloseBlock = this.groupLegends
                    .append('div').attr('title', this.values.legendName2)
                    .classed('legends_OpenCloseBlock', true)
                    .style('display', 'inline-block');

                var textopen = legends_OpenCloseBlock
                    .append('div')
                    .classed('title', true)
                    .classed('text', true)
                    .style('font-size', this.values.legendTextSize + 'px')
                    .style('color', this.values.labelColor).text(powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(textPropertiesLegendName2, (options.viewport.width * 20) / 100));

                legends_OpenCloseBlock
                    .append('div')
                    .classed('legend', true)
                    .style('right', '-35px')
                    .style('width', this.values.Low_HighIndicator)
                    .style('height', this.values.Low_HighIndicator)
                    .style('border-left', '8px solid transparent')
                    .style('border-right', '8px solid transparent')
                    .style('border-top', '8px solid')
                    .style('border-top-color', this.values.DecreasingTrend);

                this.rootElement.selectAll(".stock_legends").style({
                    display: this.values.hasLegend ? 'block' : 'none'
                });


                this.updateZoom(options);

                this.createAxis(viewModel, options);


                if (viewModel && viewModel.data[0]) {
                    var max_date: any = new Date(viewModel.data[0]['date']),
                        min_date: any = new Date(viewModel.data[0]['date']),
                        days = 0,
                        ratio_day_len;

                    for (var i in viewModel.data) {
                        var dt = new Date(viewModel.data[i]['date']);
                        if (max_date < dt) {
                            max_date = dt;
                        }
                        if (min_date > dt) {
                            min_date = dt;
                        }
                    }

                    if ((max_date - min_date) == 0) {
                        var dateParseFormat = d3.time.format('%Y-%m-%d');
                        if (viewModel && viewModel.data[0] && viewModel.IsGrouped) {
                            max_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) + 1) + '-01-01');
                            min_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) - 1) + '-01-01');
                        } else {
                            min_date = max_date = dateParseFormat.parse(viewModel.data[0]['date']);
                            max_date = powerbi.extensibility.utils.formatting.dateUtils.addDays(max_date, 7);
                            min_date = powerbi.extensibility.utils.formatting.dateUtils.addDays(min_date, -7);
                        }
                    }

                    var point = [];
                    days = (max_date - min_date) / (1000 * 60 * 60 * 24);
                    ratio_day_len = this.SVG_SIZE.w / (days ? days : 1);

                    var lowestValue = d3.min(viewModel.data.map(function (d) { return d['low']; }));
                    var highestValue = d3.max(viewModel.data.map(function (d) { return d['high']; }));

                    var difference = highestValue - lowestValue;   //Getting the difference, MaxVal - MinVal 

                    lowestValue = lowestValue - difference * 0.1;      //0.1 for adding extra 10% vertical space
                    highestValue = highestValue + difference * 0.1;      //0.1 for adding extra 10% vertical space

                    lowestValue = lowestValue - (lowestValue % 5);      //rounding off value to nearest multiple of 5
                    highestValue = highestValue + (5 - (highestValue % 5));       //rounding off value to nearest multiple of 5

                    lowestValue = lowestValue < 0 ? 0 : lowestValue;       //Y-axis value not less than 0

                    var differencePadded = highestValue - lowestValue;

                    for (var i in viewModel.data) {
                        var ob = viewModel.data[i],
                            dtDate: any = new Date(ob['date']),
                            diff_days = (dtDate - min_date) / (1000 * 60 * 60 * 24);
                        var x = this.ORIGIN_COORD.x + (diff_days * ratio_day_len)
                            , low = viewModel.data[i]['low']
                            , high = viewModel.data[i]['high']
                            , open = viewModel.data[i]['open']
                            , close = viewModel.data[i]['close']
                            , maximum = d3.max(viewModel.data[i]['high']);

                        //creating stocklines
                        var diffCloseOpen = high - low;
                        var bottom = ((low * this.SVG_SIZE.h) / differencePadded) - ((lowestValue * this.SVG_SIZE.h) / differencePadded);
                        var diffCloseOpen = (this.SVG_SIZE.h * diffCloseOpen) / differencePadded;
                        var bottom = this.ORIGIN_COORD.y - bottom;
                        var line = this.svg
                            .append('line')
                            .classed('Stock_line', true)
                            .attr({
                                x1: x,
                                x2: x,
                                y1: (bottom - diffCloseOpen),
                                y2: bottom,
                            })
                            .style({
                                'stroke-width': '2px',
                                'stroke': this.values.Low_HighIndicator
                            });

                        diffCloseOpen = close - open;
                        var bottom = (open * this.SVG_SIZE.h) / differencePadded - ((lowestValue * this.SVG_SIZE.h) / differencePadded);
                        var diffCloseOpen = (this.SVG_SIZE.h * diffCloseOpen) / differencePadded;
                        var bottom = this.ORIGIN_COORD.y - bottom;
                        var rect = this.svg
                            .append('line')
                            .classed('Stock_rectangle', true)
                            .attr({
                                x1: x,
                                x2: x,
                                y1: (bottom - diffCloseOpen),
                                y2: bottom
                            })
                            .style({
                                'stroke-width': '6px',
                                'stroke': this.values.IncreasingTrend,
                            });
                        var y = bottom - diffCloseOpen;
                        point.push({ x, y });


                        if (this.values) {
                            // Trend line width range
                            if (this.values.hasTrend)
                                this.values.trendLineWidth = this.values.trendLineWidth < 0 ? 0 : (this.values.trendLineWidth > 5 ? 5 : this.values.trendLineWidth);

                            // Precision range
                            if (this.values.hasYAxis)
                                this.values.textPrecision = (this.values.hasYAxis ? ((this.values.textPrecision > 4) ? 4 : (this.values.textPrecision < 0) ? 0 : this.values.textPrecision) : 0);

                            this.formatter = powerbi.extensibility.utils.formatting.valueFormatter.create({ format: '0', value: this.values.displayUnits, precision: this.values.textPrecision });
                        }

                        if (open > close) {
                            rect.style({ 'stroke': this.values.DecreasingTrend })
                        }

                        var low = viewModel.data[i]['low']
                            , high = viewModel.data[i]['high']
                            , open = viewModel.data[i]['open']
                            , close = viewModel.data[i]['close']
                            , date = viewModel.data[i]['date'];
                        var toolTipInfo = [];
                        var tooltiplegendsI = [];
                        var tooltiplegendsD = [];
                        var parseDate = d3.time.format('%Y-%m-%d').parse;
                        var formatDate = d3.time.format("%d-%b-%y");
                        toolTipInfo.push({
                            displayName: viewModel.IsGrouped ? 'Year' : 'Date'
                            , value: viewModel.IsGrouped ? date.substr(0, 4) : formatDate(parseDate(date)) + ''
                        });

                        low = powerbi.extensibility.utils.formatting.valueFormatter.create({ format: viewModel.format['low'] }).format(low);
                        high = powerbi.extensibility.utils.formatting.valueFormatter.create({ format: viewModel.format['high'] }).format(high);
                        open = powerbi.extensibility.utils.formatting.valueFormatter.create({ format: viewModel.format['open'] }).format(open);
                        close = powerbi.extensibility.utils.formatting.valueFormatter.create({ format: viewModel.format['close'] }).format(close);
                        toolTipInfo.push({ displayName: 'low', value: low });
                        toolTipInfo.push({ displayName: 'high', value: high });
                        toolTipInfo.push({ displayName: 'open', value: open });
                        toolTipInfo.push({ displayName: 'close', value: close });

                        line[0][0]['cust-tooltip'] = rect[0][0]['cust-tooltip'] = toolTipInfo;
                    }
                }

                this.svg.append('rect')
                    .classed('svgFrame', true)
                    .attr("x", this.ORIGIN_COORD.x - 8)
                    .attr("y", 0)
                    .attr("height", this.SVG_SIZE.h + 9 < 0 ? 0 : this.SVG_SIZE.h + 9)
                    .attr("width", this.SVG_SIZE.w + 16 < 0 ? 0 : this.SVG_SIZE.w + 16)
                    .style("stroke", this.values.borderColor)
                    .style("fill", "none")
                    .style("stroke-width", '1px')
                    .style('display', this.values.hasBorder ? 'block' : 'none');

                // Trend Line
                if (point) {
                    // point.splice(0, 1);
                    var d3line2 = d3.svg.line()
                        .x(function (d) { return d['x']; })
                        .y(function (d) { return d['y']; });

                    this.svg.append("svg:path").classed('trend_Line', true)
                        .attr("d", d3line2(point))
                        .style("stroke-width", this.values.trendLineWidth)
                        .style("stroke", this.values.TrendLine)
                        .style("fill", "none");
                }
                if (this.values.hasTrend == false)
                    this.rootElement.selectAll('.trend_Line').remove();

                if (this.values.hasXAxis) {
                    this.rootElement.selectAll('g.Stock_xaxis').style('display', 'initial');
                }
                else {
                    this.rootElement.selectAll('g.Stock_xaxis').style('display', 'none');
                }
                this.rootElement.selectAll(('g.Stock_yaxis')).style('fill', this.values.yaxisColor);
                this.rootElement.selectAll(('g.Stock_xaxis')).style('fill', this.values.xaxisColor);

                // Formatting option for y-axis through capabilities
                // Formatting the y-axis
                var k = 0;
                if (this.rootElement.selectAll('g.Stock_yaxis>g.tick') && this.rootElement.selectAll('g.Stock_yaxis>g.tick')[0]) {
                    if ((this.values && this.values.displayUnits) && this.values.displayUnits > 1) {
                        var formatter = this.formatter;
                        this.rootElement.selectAll('g.Stock_yaxis>g.tick>text').each(function (d) {
                            this.textContent = formatter.format(d);
                        });
                    }
                    else {
                        var precision = this.values.textPrecision;
                        this.rootElement.selectAll('g.Stock_yaxis>g.tick>text').each(function (d) {
                            this.textContent = d3.format(',.' + precision + 'f')(d);
                        });
                    }
                }

                this.tooltipServiceWrapper.addTooltip(this.rootElement.selectAll('svg.linearSVG>*'), (tooltipEvent: TooltipEventArgs<number>) => {
                    return tooltipEvent.context['cust-tooltip'];
                }, (tooltipEvent: TooltipEventArgs<number>) => null, true);

                // Y-Axis
                if (this.values.hasYAxis && this.svg.select('g.Stock_yaxis')[0][0]) {
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'initial');
                    var tc = <HTMLElement>this.svg.select('g.Stock_yaxis')[0][0];
                    var c = tc.getBoundingClientRect().width;
                    this.svg.style('position', 'relative');
                    this.svg.style('left', c / 2 + 'px');
                }
                else {
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'none');
                }
            }
        }
        private static getTooltipData(value: any, tab: any, avalue: any, atab: any, bvalue: any, btab: any, cvalue: any, ctab: any, dvalue: any, dtab: any): VisualTooltipDataItem[] {

            return [{
                displayName: value,
                value: tab

            },
                {
                    displayName: avalue,
                    value: atab

                },
                {
                    displayName: bvalue,
                    value: btab

                },
                {
                    displayName: cvalue,
                    value: ctab

                },
                {
                    displayName: dvalue,
                    value: dtab

                }];

        }
        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI                
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            if (!this.values)
                this.values = StockChart.getDefaultData();

            switch (options.objectName) {
                case 'dataColors':
                    enumeration.push({
                        objectName: 'dataColors',
                        displayName: 'Data Colors',
                        selector: null,
                        properties: {
                            LowHighDataColor: this.values.Low_HighIndicator,
                            OpenCloseDataColor: this.values.IncreasingTrend,
                            LossPriceColor: this.values.DecreasingTrend
                        }
                    });
                    break;
                case 'legends':
                    enumeration.push({
                        objectName: 'legends',
                        displayName: 'legends',
                        selector: null,
                        properties: {
                            show: this.values.hasLegend,
                            labelColor: this.values.labelColor,
                        }
                    });
                    break;
                case 'trends':
                    enumeration.push({
                        objectName: 'trends',
                        displayName: 'Trend Line',
                        selector: null,
                        properties: {
                            show: this.values.hasTrend,
                            TrendLineColor: this.values.TrendLine,
                            trendLineWidth: this.values.trendLineWidth
                        }
                    });
                    break;
                case 'yAxis':
                    enumeration.push({
                        objectName: 'yAxis',
                        displayName: 'Y-Axis',
                        selector: null,
                        properties: {
                            show: this.values.hasYAxis,
                            color: this.values.yaxisColor,
                            displayUnits: this.values.displayUnits,
                            textPrecision: this.values.textPrecision
                        }
                    });
                    break;
                case 'xAxis':
                    enumeration.push({
                        objectName: 'xAxis',
                        displayName: 'X-Axis',
                        selector: null,
                        properties: {
                            show: this.values.hasXAxis,
                            color: this.values.xaxisColor,
                        }
                    });
                    break;
                case 'stockBorder':
                    enumeration.push({
                        objectName: 'stockBorder',
                        displayName: 'Stock chart border',
                        selector: null,
                        properties: {
                            show: this.values.hasBorder,
                            color: this.values.borderColor,
                        }
                    });
                    break;
            }

            return enumeration;
        }

    }
}