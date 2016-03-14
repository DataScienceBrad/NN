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
/// <reference path="../_references.ts"/>

module powerbi.visuals {
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
        IsGrouped: boolean;
        legendTextSize: string;
        labelColor: string;
        legendShowAllDataPoints: boolean;
        legendDefaultColor: string;
        hasLegend: boolean;
    }
    //object variable which we used in customized color and text through UI options
    export var StockProps = {
        general: {
            LowHighDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'LowHighDataColor' },
            OpenCloseDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'OpenCloseDataColor' },
            LossPriceColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'LossPriceColor' }
        },
        legends: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'show' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'fontSize' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'titleText' },
            titleText1: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'titleText1' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'labelColor' },
        }

    };          
    //Visual
    export class StockChart implements IVisual {
        //Variables 
        private svg: D3.Selection;
        public rootElement: D3.Selection;
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

        public static getDefaultData(): StackViewModel {
            return {            
                //"data":[{"low":10,"open":40,"high":100,"close":60,"date":"2016-02-09"},{"low":20,"open":30,"high":80,"close":50,"date":"2016-02-10"}],
                data: [{}],
                toolTipInfo: [],
                toolTipInfoLegends: [],
                Low_HighIndicator: 'grey',
                IncreasingTrend: 'green',
                DecreasingTrend: 'red',
                IsGrouped: false,
                legendName: 'Low_High Indicator',
                legendName2: 'Open_Close Indicators',
                legendTextSize: '9',
                labelColor: 'rgb(102, 102, 102)',
                legendDefaultColor: 'grey',
                legendShowAllDataPoints: true,
                hasLegend: true
            };
        }     
        //One time setup
        //First time it will be called and made the structure of your visual
        public init(options: VisualInitOptions): void {			
            //Create the SVG MainDivision 
            this.rootElement = d3.select(options.element.get(0))
                .append('div')
                .classed('main_Container', true);
            this.groupLegends = this.rootElement
                .append('div')
                .classed('legends', true);
            this.chart = this.rootElement
                .append('div')
                .classed('chart', true);
            this.svg = this.chart
                .append('svg')
                .classed('linearSVG', true)
                // .style('height', '500px')
                // .style('width', '600px')
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
            this.legends_height = $(".legends").height();
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
            }

            this.chart.style('zoom', 1);
        }
        
        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): StackViewModel {
            var resultSet: StackViewModel = StockChart.getDefaultData();
            resultSet.data.length = 0;
            if (dataView.table && dataView.table.rows) {
                for (var i = 0; i < dataView.table.rows.length; i++) {
                    var rowSet = {};
                    if (dataView.table.rows[i].length < 5) {
                        return this.getDefaultData();
                    }
                    var cat_vals = dataView.metadata.columns;
                    var isPositive = true;
                    for (var j in dataView.table.rows[i]) {
                        //if (isPositive) {
                        var colName = cat_vals[j].displayName;
                        colName = colName.toLowerCase();
                        if (colName == "year") {
                            rowSet['date'] = dataView.table.rows[i][j] + '-01-01';
                            resultSet.IsGrouped = true;
                        }
                        if (colName == "date") {
                            rowSet['date'] = dataView.table.rows[i][j].toISOString().substring(0, 10);
                        }
                        else {
                            if (parseInt(dataView.table.rows[i][j]) <= 0) {
                                isPositive = false;
                                break;
                            } else {
                                rowSet[colName] = dataView.table.rows[i][j];
                            }
                        }
                        //}
                    }
                    if (isPositive) {
                        if (parseInt(rowSet['open']) > parseInt(rowSet['high']) || parseInt(rowSet['close']) < parseInt(rowSet['low']) || parseInt(rowSet['low']) > parseInt(rowSet['open']) || parseInt(rowSet['high']) < parseInt(rowSet['close']) || parseInt(rowSet['low']) > parseInt(rowSet['high'])) {                            
                            // Do nothing. Invalid data
                        } else {
                            resultSet.data.push(rowSet);
                        }

                    }
                }
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
                var newDate = min_date;
                newDate = new Date(newDate.setDate(newDate.getDate()));
                var ne = new Date(newDate + '');
                arr.push(ne);

                for (var count = 1; count < T_TICKS_COUNT; count++) {
                    newDate = new Date(newDate.setDate(newDate.getDate() + Math.ceil(diff_days / T_TICKS_COUNT)));
                    var date1 = new Date(newDate + '');
                    arr.push(date1);
                }
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
                    .classed('Stock_axis', true)
                    //.attr('transform', 'translate(' + (this.MARGINS.left) + ',' + this.SVG_SIZE.h + ')');
                    .attr('transform', 'translate(' + (this.MARGINS.left) + ',' + (this.SVG_SIZE.h + this.MARGINS.top - 2) + ')');
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

                var yAxisGroup = svgcontainer.append('g')
                    .classed('Stock_yaxis', true)
                    .call(d3.svg.axis()
                        .scale(YScale)
                        .ticks(T_TICKS_COUNT)
                        .tickSize(0)
                        .orient("left"))
                    .attr('transform', 'translate(' + (this.MARGINS.left - 10) + ',' + (this.MARGINS.top) + ')');

                svgcontainer.selectAll("line.yaxis")
                    .data(YScale.ticks(T_TICKS_COUNT))
                    .enter().append("line")
                    .attr("class", "x")
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
            var objects = this.dataView.metadata.objects;
            if (objects) {
                this.values.Low_HighIndicator = DataViewObjects.getFillColor(objects, StockProps.general.LowHighDataColor, this.values.Low_HighIndicator);
                this.values.IncreasingTrend = DataViewObjects.getFillColor(objects, StockProps.general.OpenCloseDataColor, this.values.IncreasingTrend);
                this.values.DecreasingTrend = DataViewObjects.getFillColor(objects, StockProps.general.LossPriceColor, this.values.DecreasingTrend);
                this.values.hasLegend = DataViewObjects.getValue(objects, StockProps.legends.show, this.values.hasLegend);
                this.values.legendTextSize = DataViewObjects.getValue(objects, StockProps.legends.fontSize, this.values.legendTextSize);
                this.values.labelColor = DataViewObjects.getFillColor(objects, StockProps.legends.labelColor, this.values.labelColor);
            }	            
            //if (dataView.table && dataView.table.rows[0].length == 5) {                                
            this.groupLegends.html("");

            var legends_LowHighBlock = this.groupLegends
                .append('div')
                .classed('legends_LowHighBlock', true)

            var title = legends_LowHighBlock
                .append('div')
                .classed('title', true)
                .classed('text', true)
                .style('font-size', this.values.legendTextSize + 'pt')
                .style('color', this.values.labelColor);
            title[0][0].innerText = this.values.legendName;

            legends_LowHighBlock
                .append('div')
                .classed('legend', true)
                .style('width', '10px')
                .style('height', '10px')
                .style('background-color', this.values.Low_HighIndicator);

            var legends_OpenCloseBlock = this.groupLegends
                .append('div')
                .classed('legends_OpenCloseBlock', true)
                .style('display', 'inline-block');

            var textopen = legends_OpenCloseBlock
                .append('div')
                .classed('title', true)
                .classed('text', true)
                .style('font-size', this.values.legendTextSize + 'pt')
                .style('color', this.values.labelColor);
            textopen[0][0].innerText = this.values.legendName2;

            legends_OpenCloseBlock
                .append('div')
                .classed('legend', true)
                .style('width', this.values.Low_HighIndicator)
                .style('height', this.values.Low_HighIndicator)
                .style('border-left', '8px solid transparent')
                .style('border-right', '8px solid transparent')
                .style('border-bottom', '8px solid')
                .style('border-bottom-color', this.values.IncreasingTrend);

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

            this.updateZoom(options);
            this.createAxis(viewModel, options);

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
                if (viewModel.IsGrouped) {
                    max_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) + 1) + '-01-01');
                    min_date = dateParseFormat.parse((parseInt(viewModel.data[0]['date'].substr('0,4')) - 1) + '-01-01');
                } else {
                    min_date = max_date = dateParseFormat.parse(viewModel.data[0]['date']);
                    max_date = DateUtils.addDays(max_date, 7);
                    min_date = DateUtils.addDays(min_date, -7);
                }
            }

            days = (max_date - min_date) / (1000 * 60 * 60 * 24);
            ratio_day_len = this.SVG_SIZE.w / (days ? days : 1);
            var MaxHighVal = d3.max(viewModel.data.map(function (d) { return d['high']; }));//Getiing the highest value from the data  
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

                this.svg.selectAll(".legends").style({
                    display: this.values.hasLegend ? 'block' : 'none'
                });
           
                
                // creating open and close values
                if (close > high) {
                    close = high;
                }
                if (open > high) {
                    open = high;
                }
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
                toolTipInfo.push({ displayName: 'low', value: low + '' });
                toolTipInfo.push({ displayName: 'high', value: high + '' });
                toolTipInfo.push({ displayName: 'open', value: open + '' });
                toolTipInfo.push({ displayName: 'close', value: close + '' });

                line[0][0]['cust-tooltip'] = rect[0][0]['cust-tooltip'] = toolTipInfo;
            }
            
            //addint the tooltip for each rect/line
            TooltipManager.addTooltip(d3.selectAll('svg.linearSVG>*'), (tooltipEvent: TooltipEvent) => {
                return tooltipEvent.context['cust-tooltip'];
            }, true);//Adding visual tips
            //}         
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
                            fontSize: this.values.legendTextSize,
                            labelColor: this.values.labelColor,

                        }
                    });
                    break;
            }

            return enumeration.complete();
        }
        public static capabilities: VisualCapabilities = {

            dataRoles: [
                {
                    name: 'date',// This will be the name of role and we can find element in an object with the role
                    kind: VisualDataRoleKind.Grouping,//Type of value
                    displayName: 'Date',// it will display as measure header name
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
                            displayName: 'Low_High Indicator',
                            type: { fill: { solid: { color: true } } }
                        },
                        OpenCloseDataColor: {
                            displayName: 'Increasing trends',
                            type: { fill: { solid: { color: true } } }
                        },
                        LossPriceColor: {
                            displayName: 'Decreasing trends',
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
                        },
                        fontSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { formatting: { fontSize: true } }
                        }
                    }
                }

            },
            dataViewMappings: [{
                conditions: [
                    { 'date': { max: 1 }, 'low': { max: 1 }, 'high': { max: 1 }, 'open': { max: 1 }, 'close': { max: 1 } },//Maximum no. of values we can provide
                ],
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'date' } },
                            { bind: { to: 'low' } },
                            { bind: { to: 'high' } },
                            { bind: { to: 'open' } },
                            { bind: { to: 'close' } },
                            //Binding with the categorical object
                        
                        ]
                    },
                },
            }],
            suppressDefaultTitle: false,
        };


    }
}