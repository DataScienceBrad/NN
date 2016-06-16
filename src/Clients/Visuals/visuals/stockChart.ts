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
module powerbi.visuals {
    import ValueFormatter = powerbi.visuals.valueFormatter;
    //Model 
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
        displayUnits: number;
        trendLineWidth: number;
        textPrecision: number;
    }
    //object variable which we used in customized color and text through UI options
    export var StockProps = {
        general: {
            LowHighDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'LowHighDataColor' },
            OpenCloseDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'OpenCloseDataColor' },
            LossPriceColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'LossPriceColor' },
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
        }

    };
    //Visual
    export class StockChart implements IVisual {
        //Variables 
        private svg: D3.Selection;
        public rootElement: D3.Selection;
        public errorDiv: D3.Selection;
        public dataView: DataView;
        public ORIGIN_COORD;
        public SVG_SIZE;
        public MARGINS;
        public zoom;
        public toolTipInfo;
        public toolTipInfoLegends;
        public values: StackViewModel;
        public groupLegends: D3.Selection;
        public chart: D3.Selection;
        public groupLegendSelected;
        public legends_height;
        public formatter;

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
                hasLegend: true,
                hasTrend: true,
                hasYAxis: true,
                hasXAxis: true,
                yaxisColor: 'grey',
                xaxisColor: 'grey',
                displayUnits: 0,
                trendLineWidth: 2,
                textPrecision: 0
            };
        }
        //One time setup
        //First time it will be called and made the structure of your visual
        public init(options: VisualInitOptions): void {
            //Create the SVG MainDivision 
            this.rootElement = d3.select(options.element.get(0))
                .append('div')
                .classed('stock_Container', true);
            this.errorDiv = this.rootElement.append('div').classed('StockChartError', true);;
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
            if (this.values && this.values.hasYAxis && this.svg && this.svg.select('g.Stock_yaxis')[0][0]) {
                width -= this.svg.select('g.Stock_yaxis')[0][0].getBoundingClientRect().width / 2;
            }

            this.legends_height = 0;
            if (this.values && this.values.hasLegend)
                this.legends_height = this.rootElement.selectAll('.stock_legends')[0][0].clientHeight;
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
            if (dataView && dataView.categorical && dataView.categorical.values && (dataView.categorical.values.length == 4)) {
                for (var i = 0; i < dataView.categorical.categories[0].values.length; i++) {
                    var rowSet = {};
                    var cat_vals = dataView.metadata.columns;
                    var isPositive = true;
                    for (var k = 0; k < 4; k++) {
                        // Categories
                        var colName = dataView.categorical.categories[0].source.displayName.toLowerCase();
                        var dateVar = dataView.categorical.categories[0].values[i];
                        if (Object.prototype.toString.call(dateVar) === "[object Date]" || Object.prototype.toString.call(dateVar) === "[object Number]") {
                            // it is a date
                            if (isNaN(new Date(dateVar).getTime())) {
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
                        } else if (dataView.categorical.values[k].source.roles['high']) {
                            colName = 'high';
                        } else if (dataView.categorical.values[k].source.roles['open']) {
                            colName = 'open';
                        } else if (dataView.categorical.values[k].source.roles['close']) {
                            colName = 'close';
                        }
                        if (parseFloat(dataView.categorical.values[k].values[i]) <= 0) {
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
                T_TICKS_COUNT = Math.ceil(this.SVG_SIZE.w / 200);

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
                            max_date = DateUtils.addDays(max_date, 7);
                            min_date = DateUtils.addDays(min_date, -7);
                        }
                    }
                    diff_days = (max_date - min_date) / (1000 * 60 * 60 * 24);

                    var XScale = d3.time.scale()
                        //.range([0, this.SVG_SIZE.w-20])
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
                            //.attr('transform', 'translate(' + (this.MARGINS.left) + ',' + this.SVG_SIZE.h + ')');
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

                var YScale = d3.scale.linear()
                    .domain([0, d3.max(viewModel.data.map(function (d) { return d['high']; }))])
                    .range([this.SVG_SIZE.h - 1, 0]);

                if (this.MARGINS) {
                    var yAxisGroup = svgcontainer.append('g')
                        .classed('Stock_yaxis', true)
                        .call(d3.svg.axis()
                            .scale(YScale).innerTickSize(10)
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
                    //.attr("x2", this.SVG_SIZE.w + this.MARGINS.left -20)
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
            var self = this;
            var dataView = this.dataView = options.dataViews[0];
            var viewModel = this.values = StockChart.converter(dataView);
            var objects = null;
            if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }
            if (objects) {
                this.values.Low_HighIndicator = DataViewObjects.getFillColor(objects, StockProps.general.LowHighDataColor, this.values.Low_HighIndicator);
                this.values.IncreasingTrend = DataViewObjects.getFillColor(objects, StockProps.general.OpenCloseDataColor, this.values.IncreasingTrend);
                this.values.DecreasingTrend = DataViewObjects.getFillColor(objects, StockProps.general.LossPriceColor, this.values.DecreasingTrend);
                this.values.hasLegend = DataViewObjects.getValue(objects, StockProps.legends.show, this.values.hasLegend);
                this.values.labelColor = DataViewObjects.getFillColor(objects, StockProps.legends.labelColor, this.values.labelColor);
                this.values.hasTrend = DataViewObjects.getValue(objects, StockProps.trends.hasTrend, this.values.hasTrend);
                this.values.TrendLine = DataViewObjects.getFillColor(objects, StockProps.trends.TrendLineColor, this.values.TrendLine);
                this.values.hasYAxis = DataViewObjects.getValue(objects, StockProps.yAxis.hasYAxis, this.values.hasYAxis);
                this.values.hasXAxis = DataViewObjects.getValue(objects, StockProps.xAxis.hasXAxis, this.values.hasXAxis);
                this.values.yaxisColor = DataViewObjects.getFillColor(objects, StockProps.yAxis.yaxisColor, this.values.yaxisColor);
                this.values.xaxisColor = DataViewObjects.getFillColor(objects, StockProps.xAxis.xaxisColor, this.values.xaxisColor);
                this.values.displayUnits = DataViewObjects.getValue<number>(objects, StockProps.yAxis.displayUnits, this.values.displayUnits);
                this.values.trendLineWidth = DataViewObjects.getValue(objects, StockProps.trends.trendLineWidth, this.values.trendLineWidth);
                this.values.textPrecision = DataViewObjects.getValue(objects, StockProps.yAxis.textPrecision, this.values.textPrecision);
            }

            this.errorDiv.selectAll('span').remove();
            if (viewModel && viewModel.data[0] && viewModel.data[0]['date']) {
                this.groupLegends.selectAll('div').remove();
                this.svg.selectAll('g').remove();
                this.svg.selectAll('path').remove();
                this.svg.selectAll('line').remove();

                var legends_LowHighBlock = this.groupLegends
                    .append('div').attr('title', this.values.legendName)
                    .classed('legends_LowHighBlock', true)

                var textPropertiesLegenName: powerbi.TextProperties = {
                    text: this.values.legendName,
                    fontFamily: "Segoe UI",
                    fontSize: this.values.legendTextSize
                };

                var textPropertiesLegendName2: powerbi.TextProperties = {
                    text: this.values.legendName2,
                    fontFamily: "Segoe UI",
                    fontSize: this.values.legendTextSize
                };

                var title = legends_LowHighBlock
                    .append('div')
                    .classed('title', true)
                    .classed('text', true)
                    .style('font-size', this.values.legendTextSize + 'px')
                    .style('color', this.values.labelColor).text(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesLegenName, (options.viewport.width * 20) / 100));

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
                    .style('color', this.values.labelColor).text(powerbi.TextMeasurementService.getTailoredTextOrDefault(textPropertiesLegendName2, (options.viewport.width * 20) / 100));

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
                            max_date = DateUtils.addDays(max_date, 7);
                            min_date = DateUtils.addDays(min_date, -7);
                        }
                    }

                    var point = [{}];
                    days = (max_date - min_date) / (1000 * 60 * 60 * 24);
                    ratio_day_len = this.SVG_SIZE.w / (days ? days : 1);
                    var MaxHighVal = d3.max(viewModel.data.map(function (d) { return d['high']; }));//Getting the highest value from the data  
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
                        var bottom = (low * this.SVG_SIZE.h) / MaxHighVal;
                        var diffCloseOpen = (this.SVG_SIZE.h * diffCloseOpen) / MaxHighVal;
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
                        var bottom = (open * this.SVG_SIZE.h) / MaxHighVal;
                        var diffCloseOpen = (this.SVG_SIZE.h * diffCloseOpen) / MaxHighVal;
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

                            this.formatter = valueFormatter.create({ format: '0', value: this.values.displayUnits, precision: this.values.textPrecision });
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
                        toolTipInfo.push({ displayName: 'low', value: d3.format(',.' + this.values.textPrecision + 'f')(low) + '' });
                        toolTipInfo.push({ displayName: 'high', value: d3.format(',.' + this.values.textPrecision + 'f')(high) + '' });
                        toolTipInfo.push({ displayName: 'open', value: d3.format(',.' + this.values.textPrecision + 'f')(open) + '' });
                        toolTipInfo.push({ displayName: 'close', value: d3.format(',.' + this.values.textPrecision + 'f')(close) + '' });

                        line[0][0]['cust-tooltip'] = rect[0][0]['cust-tooltip'] = toolTipInfo;
                    }
                }

                // Trend Line
                if (point) {
                    point.splice(0, 1);
                    var d3line2 = d3.svg.line()
                        .x(function (d) { return d.x; })
                        .y(function (d) { return d.y; });

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
                    for (k; k < this.rootElement.selectAll("g.Stock_yaxis>g.tick")[0].length; k++) {
                        if ((this.values && this.values.displayUnits) && this.values.displayUnits > 1)
                            this.rootElement.selectAll("g.Stock_yaxis>g.tick>text")[0][k].innerHTML = this.formatter.format(this.rootElement.selectAll("g.Stock_yaxis>g.tick")[0][k].__data__);
                        else
                            this.rootElement.selectAll("g.Stock_yaxis>g.tick>text")[0][k].innerHTML = d3.format(',.' + this.values.textPrecision + 'f')(this.rootElement.selectAll("g.Stock_yaxis>g.tick")[0][k].__data__);
                    }
                }

                // Adding the tooltip for each rect/line
                TooltipManager.addTooltip(this.rootElement.selectAll('svg.linearSVG>*'), (tooltipEvent: TooltipEvent) => {
                    return tooltipEvent.context['cust-tooltip'];
                }, true);

                // Y-Axis
                if (this.values.hasYAxis && this.svg.select('g.Stock_yaxis')[0][0]) {
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'initial');
                    var c = this.svg.select('g.Stock_yaxis')[0][0].getBoundingClientRect().width;
                    this.svg.style('position', 'relative').style('left', c / 2);

                }
                else {
                    this.svg.style('left', 5);
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'none');
                }
            }
        }

        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI                
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            if (!this.values)
                this.values = StockChart.getDefaultData();

            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            LowHighDataColor: this.values.Low_HighIndicator,
                            OpenCloseDataColor: this.values.IncreasingTrend,
                            LossPriceColor: this.values.DecreasingTrend
                        }
                    });
                    break;
                case 'legends':
                    enumeration.pushInstance({
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
                    enumeration.pushInstance({
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
                    enumeration.pushInstance({
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
                    enumeration.pushInstance({
                        objectName: 'xAxis',
                        displayName: 'X-Axis',
                        selector: null,
                        properties: {
                            show: this.values.hasXAxis,
                            color: this.values.xaxisColor,
                        }
                    });
                    break;
            }

            return enumeration.complete();
        }
        public static capabilities: VisualCapabilities = {

            dataRoles: [
                {
                    name: 'date',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: 'Date',
                },
                {
                    name: 'low',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Low Values',
                }, {
                    name: 'high',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'High Values',
                }, {
                    name: 'open',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Open Values',
                }, {
                    name: 'close',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Close Values',
                },
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        LowHighDataColor: {
                            displayName: 'Baseline indicator',
                            type: { fill: { solid: { color: true } } }
                        },
                        OpenCloseDataColor: {
                            displayName: 'Increasing trend indicator',
                            type: { fill: { solid: { color: true } } }
                        },
                        LossPriceColor: {
                            displayName: 'Decreasing trend indicator',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },
                legends: {
                    displayName: "Legend",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        labelColor: {
                            displayName: data.createDisplayNameGetter('Visual_LegendTitleColor'),
                            type: { fill: { solid: { color: true } } }
                        }
                    }
                },
                trends: {
                    displayName: "Trend Lines",
                    properties: {
                        show: {
                            displayName: 'Trend Line',
                            type: { bool: true }
                        },
                        TrendLineColor: {
                            displayName: 'Trend Line Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        trendLineWidth: {
                            displayName: 'Trend Line Width',
                            description: 'Width of trend line',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true
                        },
                    }
                },
                yAxis: {
                    displayName: "Y-Axis",
                    properties: {
                        show: {
                            displayName: 'Y-Axis',
                            type: { bool: true }
                        },
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        displayUnits: {
                            displayName: 'Display Units',
                            type: { formatting: { labelDisplayUnits: true } },
                        },
                        textPrecision: {
                            displayName: 'Decimal Places',
                            description: 'Enter the precision value between 0 and 4',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true
                        },
                    }
                },
                xAxis: {
                    displayName: "X-Axis",
                    properties: {
                        show: {
                            displayName: 'X-Axis',
                            type: { bool: true }
                        },
                        color: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    }
                },

            },
            dataViewMappings: [{
                conditions: [
                    { 'date': { max: 1 }, 'low': { max: 1 }, 'high': { max: 1 }, 'open': { max: 1 }, 'close': { max: 1 } }, //Maximum no. of values we can provide
                ],
                categorical: {
                    categories: {
                        for: { in: 'date' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        select: [
                            // { bind: { to: 'date' } },
                            { bind: { to: 'low' } },
                            { bind: { to: 'high' } },
                            { bind: { to: 'open' } },
                            { bind: { to: 'close' } },
                        ]
                    },
                },
            }],
            suppressDefaultTitle: false,
        };
    }
}