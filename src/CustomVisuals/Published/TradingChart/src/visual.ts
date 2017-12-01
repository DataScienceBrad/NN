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

    const dateLiteral: string = 'date';
    const openLiteral: string = 'open';
    const closeLiteral: string = 'close';
    const lowLiteral: string = 'low';
    const highLiteral: string = 'high';

    //Model
    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface ITooltipDataItem {
        displayName: string;
        value: string;
    }
    export interface IStackViewModel {
        data: [Object];
        toolTipInfo: ITooltipDataItem[];
        toolTipInfoLegends: ITooltipDataItem[];
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

    interface IDataColors {
        LowHighDataColor: DataViewObjectPropertyIdentifier;
        OpenCloseDataColor: DataViewObjectPropertyIdentifier;
        LossPriceColor: DataViewObjectPropertyIdentifier;
    }

    interface ILegends {
        show: DataViewObjectPropertyIdentifier;
        labelColor: DataViewObjectPropertyIdentifier;
    }

    interface ITrends {
        hasTrend: DataViewObjectPropertyIdentifier;
        TrendLineColor: DataViewObjectPropertyIdentifier;
        trendLineWidth: DataViewObjectPropertyIdentifier;
    }

    interface IYAxis {
        hasYAxis: DataViewObjectPropertyIdentifier;
        yaxisColor: DataViewObjectPropertyIdentifier;
        displayUnits: DataViewObjectPropertyIdentifier;
        textPrecision: DataViewObjectPropertyIdentifier;
    }

    interface IXAxis {
        hasXAxis: DataViewObjectPropertyIdentifier;
        xaxisColor: DataViewObjectPropertyIdentifier;
    }

    interface IStockBorder {
        hasBorder: DataViewObjectPropertyIdentifier;
        borderColor: DataViewObjectPropertyIdentifier;
    }

    interface IStockProperties {
        dataColors: IDataColors;
        legends: ILegends;
        trends: ITrends;
        yAxis: IYAxis;
        xAxis: IXAxis;
        stockBorder: IStockBorder;
    }

    //object variable which we used in customized color and text through UI options
    export let stockProps: IStockProperties = {
        dataColors: {
            LowHighDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'LowHighDataColor' },
            OpenCloseDataColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'OpenCloseDataColor' },
            LossPriceColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataColors', propertyName: 'LossPriceColor' }
        },
        legends: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'show' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legends', propertyName: 'labelColor' }
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
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'textPrecision' }
        },
        xAxis: {
            hasXAxis: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'show' },
            xaxisColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'color' }
        },
        stockBorder: {
            hasBorder: <DataViewObjectPropertyIdentifier>{ objectName: 'stockBorder', propertyName: 'show' },
            borderColor: <DataViewObjectPropertyIdentifier>{ objectName: 'stockBorder', propertyName: 'color' }
        }

    };
    //Visual
    export class StockChart implements IVisual {
        //Variables
        private svg: d3.Selection<SVGElement>;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        public rootElement: d3.Selection<SVGElement>;
        public errorDiv: d3.Selection<SVGElement>;
        public dataView: DataView;
        public ORIGIN_COORD: {
            x: number,
            y: number
        };
        public SVG_SIZE:
        {
            w: number,
            h: number
        };
        public MARGINS: {
            left: number,
            right: number,
            top: number,
            bottom: number
        };
        // tslint:disable-next-line:no-any
        public toolTipInfo: any;
        public values: IStackViewModel;
        public groupLegends: d3.Selection<SVGElement>;
        public chart: d3.Selection<SVGElement>;
        public legendsHeight: number;
        public formatter: utils.formatting.IValueFormatter;
        private host: IVisualHost;

        public static getDefaultData(): IStackViewModel {
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
            this.legendsHeight = 0;
        }

        //Zoom function implementation to provide responsiveness
        // tslint:disable-next-line:no-any
        public updateZoom(options: any): void {
            let viewport: IViewport;
            viewport = options.viewport;
            let height: number;
            height = viewport.height;
            let width: number;
            width = viewport.width;

            // tslint:disable-next-line:no-any
            let yAxisLabel: any = d3.max(this.values.data.map(function (d: Object): any { return d[highLiteral]; }));
            if ((this.values && this.values.displayUnits) && this.values.displayUnits > 1) {
                // tslint:disable-next-line:no-any
                let formatter: any;
                formatter = this.formatter;
                yAxisLabel = formatter.format(yAxisLabel);
            } else {
                let precision: number;
                precision = this.values.textPrecision;
                yAxisLabel = d3.format(`,.${precision}f`)(yAxisLabel);
            }
            let yAxisLabelTextProperties: powerbi.extensibility.utils.formatting.TextProperties;
            yAxisLabelTextProperties = {
                text: yAxisLabel,
                fontFamily: 'sans-serif',
                fontSize: '11px'
            };
            let yAxisLabelWidth: number;
            yAxisLabelWidth = powerbi.extensibility.utils.formatting.textMeasurementService
                .measureSvgTextWidth(yAxisLabelTextProperties);
            width = width - yAxisLabelWidth / 2;

            this.legendsHeight = 0;

            if (this.values && this.values.hasLegend) {
                const clientHeightLiteral: string = 'clientHeight';
                this.legendsHeight = this.rootElement.selectAll('.stock_legends')[0][0][clientHeightLiteral];
            }

            this.SVG_SIZE.w = width - this.MARGINS.left - this.MARGINS.right;
            this.SVG_SIZE.h = height - this.MARGINS.top - this.MARGINS.bottom - this.legendsHeight;
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
        // tslint:disable-next-line:cyclomatic-complexity
        public static converter(dataView: DataView): IStackViewModel {
            let resultSet: IStackViewModel;
            resultSet = StockChart.getDefaultData();
            resultSet.data.length = 0;
            if (dataView && dataView.categorical &&
                dataView.categorical.values && (dataView.categorical.values.length === 4) && (dataView.categorical.categories)) {

                for (let iIterator: number = 0; iIterator < dataView.categorical.categories[0].values.length; iIterator++) {
                    let rowSet: {};
                    rowSet = {};
                    let isPositive: boolean = true;
                    for (let k: number = 0; k < 4; k++) {
                        // Categories

                        let colName: string = dataView.categorical.categories[0].source.displayName.toLowerCase();
                        // tslint:disable-next-line:no-any
                        let dateVar: any;
                        dateVar = dataView.categorical.categories[0].values[iIterator];
                        if (Object.prototype.toString.call(dateVar) === '[object Date]' ||
                            Object.prototype.toString.call(dateVar) === '[object Number]') {
                            // it is a date
                            if (isNaN(new Date(dateVar.toString()).getTime())) {
                                // date is not valid
                                isPositive = false;
                                break;
                            } else {
                                if (colName === 'year') {
                                    rowSet[dateLiteral] = `${dateVar}-01-01`;
                                    resultSet.IsGrouped = true;
                                } else {
                                    resultSet.IsGrouped = false;
                                    colName = 'date';
                                    let timezoneffset: number;
                                    timezoneffset = (new Date()).getTimezoneOffset() * 60000;
                                    rowSet[dateLiteral] = (new Date(dateVar - timezoneffset)).toISOString().substring(0, 10);
                                }
                            }
                        } else {
                            // not a date
                            isPositive = false;
                            break;
                        }

                        // Each values
                        if (dataView.categorical.values[k].source.roles[lowLiteral]) {
                            colName = 'low';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles[highLiteral]) {
                            colName = 'high';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles[openLiteral]) {
                            colName = 'open';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        } else if (dataView.categorical.values[k].source.roles[closeLiteral]) {
                            colName = 'close';
                            resultSet.format[colName] = dataView.categorical.values[k].source.format;
                        }
                        if (parseFloat(dataView.categorical.values[k].values[iIterator].toString()) <= 0) {
                            isPositive = false;
                            break;
                        } else {
                            rowSet[colName] = dataView.categorical.values[k].values[iIterator];
                        }
                    }
                    if (isPositive) {
                        if (parseFloat(rowSet[openLiteral]) > parseFloat(rowSet[highLiteral]) ||
                            parseFloat(rowSet[closeLiteral]) < parseFloat(rowSet[lowLiteral]) ||
                            parseFloat(rowSet[lowLiteral]) > parseFloat(rowSet[openLiteral]) ||
                            parseFloat(rowSet[highLiteral]) < parseFloat(rowSet[closeLiteral]) ||
                            parseFloat(rowSet[lowLiteral]) > parseFloat(rowSet[highLiteral])) {
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

        public createAxis(viewModel: IStackViewModel, options: VisualUpdateOptions): void {
            let dateParseFormat: d3.time.Format;
            dateParseFormat = d3.time.format('%Y-%m-%d');
            let dateFormat: d3.time.Format;
            dateFormat = d3.time.format('%d-%b-%y');
            let yearFormat: d3.time.Format;
            yearFormat = d3.time.format('%Y');
            let svgcontainer: d3.Selection<SVGElement>;
            svgcontainer = this.svg;
            let ticksCount: number = Math.ceil(this.SVG_SIZE.h / 75); //7;

            svgcontainer.selectAll('*').remove();
            //Create the Scale we will use for the XAxis
            try {
                ticksCount = Math.ceil(this.SVG_SIZE.w / 130);

                if (viewModel && viewModel.data[0][dateLiteral]) {

                    // tslint:disable-next-line:no-any
                    let maxDate: any = new Date(viewModel.data[0][dateLiteral]);
                    // tslint:disable-next-line:no-any
                    let minDate: any = new Date(viewModel.data[0][dateLiteral]);
                    let diffDays: number = 0;
                    let sKey: string;
                    for (sKey in viewModel.data) {
                        if (viewModel.data.hasOwnProperty(sKey)) {
                            let dt: Date;
                            dt = new Date(viewModel.data[sKey][dateLiteral]);
                            if (maxDate < dt) {
                                maxDate = dt;
                            }
                            if (minDate > dt) {
                                minDate = dt;
                            }
                        }
                    }

                    if ((maxDate - minDate) === 0) {
                        if (viewModel.IsGrouped) {
                            maxDate = dateParseFormat.parse(`${(parseInt(viewModel.data[0][dateLiteral].substr('0,4'), 10) + 1)}-01-01`);
                            minDate = dateParseFormat.parse(`${(parseInt(viewModel.data[0][dateLiteral].substr('0,4'), 10) - 1)}-01-01`);
                        } else {
                            minDate = maxDate = dateParseFormat.parse(viewModel.data[0][dateLiteral]);
                            maxDate = powerbi.extensibility.utils.formatting.dateUtils.addDays(maxDate, 7);
                            minDate = powerbi.extensibility.utils.formatting.dateUtils.addDays(minDate, -7);
                        }
                    }
                    diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

                    let xScale: d3.time.Scale<number, number>;
                    xScale = d3.time.scale()
                        .range([0, this.SVG_SIZE.w])
                        .domain([minDate, maxDate]);

                    let arr: Date[];
                    arr = [];
                    let newDate: Date = new Date();
                    newDate = minDate;
                    newDate = new Date(newDate.setDate(newDate.getDate()));
                    // let ne = new Date(newDate + '');
                    let ne: Date;
                    ne = new Date(newDate.toString());

                    arr.push(ne);

                    for (let count: number = 1; count < ticksCount; count++) {
                        newDate = new Date(newDate.setDate(newDate.getDate() + Math.ceil(diffDays / ticksCount)));
                        let date1: Date;
                        date1 = new Date(newDate.toString());
                        arr.push(date1);
                    }

                    if (this.MARGINS) {
                        let xAxisGroup: d3.Selection<SVGElement>;
                        xAxisGroup = svgcontainer.append('g')
                            .call(
                            d3.svg.axis()
                                .scale(xScale)
                                .tickValues(arr)
                                .tickSize(0)
                                .orient('bottom')
                                .tickFormat(viewModel.IsGrouped ? yearFormat : dateFormat)
                                .tickPadding(12)
                            )
                            .classed('Stock_xaxis', true)
                            .attr('transform', `translate(${this.MARGINS.left},${this.SVG_SIZE.h + this.MARGINS.top + 2})`);
                    }
                }
            } catch (err) {
                // empty
            }
            try {
                //Create the Scale we will use for the yAxis
                ticksCount = Math.ceil(this.SVG_SIZE.h / 75);
                if (ticksCount <= 1) {
                    ticksCount = 2;
                }

                // tslint:disable-next-line:no-any
                let lowestValue: any = d3.min(viewModel.data.map(function (d: Object): any { return d[lowLiteral]; }));
                // tslint:disable-next-line:no-any
                let highestValue: any = d3.max(viewModel.data.map(function (d: Object): any { return d[highLiteral]; }));

                let difference: number;
                difference = highestValue - lowestValue;

                lowestValue = lowestValue - difference * 0.1;      //0.1 for adding extra 10% vertical space
                highestValue = highestValue + difference * 0.1;      //0.1 for adding extra 10% vertical space

                lowestValue = lowestValue - (lowestValue % 5);      //rounding off value to nearest multiple of 5
                highestValue = highestValue + (5 - (highestValue % 5));       //rounding off value to nearest multiple of 5

                lowestValue = lowestValue < 0 ? 0 : lowestValue;       //Y-axis value not less than 0

                let yScale: d3.scale.Linear<number, number>;
                yScale = d3.scale.linear()
                    .domain([lowestValue, highestValue])
                    .range([this.SVG_SIZE.h - 1, 0]);

                if (this.MARGINS) {
                    let yAxisGroup: d3.Selection<SVGElement>;
                    yAxisGroup = svgcontainer.append('g')
                        .classed('Stock_yaxis', true)
                        .call(d3.svg.axis()
                            .scale(yScale)
                            .ticks(ticksCount)
                            .tickSize(0)
                            .orient('left'))
                        .attr('transform', `translate(${this.MARGINS.left - 10},${this.MARGINS.top})`);
                }
                svgcontainer.selectAll('line.yaxis')
                    .data(yScale.ticks(ticksCount))
                    .enter().append('line')
                    .attr('class', 'xAxes')
                    .attr('x1', this.MARGINS.left)
                    .attr('x2', this.SVG_SIZE.w + this.MARGINS.left)
                    .attr('y1', yScale)
                    .attr('y2', yScale)
                    .attr('transform', `translate(0,${this.MARGINS.top})`)
                    .style('stroke', '#ccc');
            } catch (err) {
                // empty
            }
        }

        //Drawing the visual
        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.svg.select('.svgFrame').remove();
            this.groupLegends.selectAll('div').remove();
            this.svg.selectAll('g').remove();
            this.svg.selectAll('path').remove();
            this.svg.selectAll('line').remove();

            let self: this;
            self = this;
            let dataView: DataView;
            dataView = this.dataView = options.dataViews[0];
            let viewModel: IStackViewModel;
            viewModel = this.values = StockChart.converter(dataView);
            let objects: DataViewObjects;
            objects = null;
            // tslint:disable-next-line:no-any
            let point: any;
            point = [];
            if (dataView && dataView.metadata) {
                objects = dataView.metadata.objects;
            }
            if (objects) {
                this.values.Low_HighIndicator = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.dataColors.LowHighDataColor, this.values.Low_HighIndicator);
                this.values.IncreasingTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.dataColors.OpenCloseDataColor, this.values.IncreasingTrend);
                this.values.DecreasingTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.dataColors.LossPriceColor, this.values.DecreasingTrend);
                this.values.hasLegend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.legends.show, this.values.hasLegend);
                this.values.labelColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.legends.labelColor, this.values.labelColor);
                this.values.hasTrend = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.trends.hasTrend, this.values.hasTrend);
                this.values.TrendLine = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.trends.TrendLineColor, this.values.TrendLine);
                this.values.hasYAxis = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.yAxis.hasYAxis, this.values.hasYAxis);
                this.values.hasXAxis = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.xAxis.hasXAxis, this.values.hasXAxis);
                this.values.yaxisColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.yAxis.yaxisColor, this.values.yaxisColor);
                this.values.xaxisColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.xAxis.xaxisColor, this.values.xaxisColor);
                this.values.hasBorder = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.stockBorder.hasBorder, this.values.hasBorder);
                this.values.borderColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(
                    objects, stockProps.stockBorder.borderColor, this.values.borderColor);
                this.values.displayUnits = powerbi.extensibility.utils.dataview.DataViewObjects.getValue<number>(
                    objects, stockProps.yAxis.displayUnits, this.values.displayUnits);
                this.values.trendLineWidth = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.trends.trendLineWidth, this.values.trendLineWidth);
                this.values.textPrecision = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(
                    objects, stockProps.yAxis.textPrecision, this.values.textPrecision);
                this.values.textPrecision = this.values.textPrecision > 4 ? 4 :
                    (this.values.textPrecision < 0) ? 0 : this.values.textPrecision;
            }

            this.errorDiv.selectAll('span').remove();
            if (viewModel && viewModel.data[0] && viewModel.data[0][dateLiteral]) {

                let legendsLowHighBlock: d3.Selection<SVGElement>;
                legendsLowHighBlock = this.groupLegends
                    .append('div').attr('title', this.values.legendName)
                    .classed('legendsLowHighBlock', true);

                let textPropertiesLegenName: powerbi.extensibility.utils.formatting.TextProperties;
                textPropertiesLegenName = {
                    text: this.values.legendName,
                    fontFamily: 'Segoe UI',
                    fontSize: `${this.values.legendTextSize}px`
                };

                let textPropertiesLegendName2: powerbi.extensibility.utils.formatting.TextProperties;
                textPropertiesLegendName2 = {
                    text: this.values.legendName2,
                    fontFamily: 'Segoe UI',
                    fontSize: `${this.values.legendTextSize}px`
                };

                let title: d3.Selection<SVGElement>;
                title = legendsLowHighBlock
                    .append('div')
                    .classed('title', true)
                    .classed('text', true)
                    .style('font-size', `${this.values.legendTextSize}px`)
                    .style('color', this.values.labelColor)
                    .text(powerbi.extensibility.utils.formatting.textMeasurementService
                        .getTailoredTextOrDefault(textPropertiesLegenName, (options.viewport.width * 20) / 100));

                legendsLowHighBlock
                    .append('div')
                    .classed('legend', true)
                    .style('width', this.values.Low_HighIndicator)
                    .style('height', this.values.Low_HighIndicator)
                    .style('border-left', '8px solid transparent')
                    .style('border-right', '8px solid transparent')
                    .style('border-bottom', '8px solid')
                    .style('border-bottom-color', this.values.IncreasingTrend);

                let legendsOpenCloseBlock: d3.Selection<SVGElement>;
                legendsOpenCloseBlock = this.groupLegends
                    .append('div').attr('title', this.values.legendName2)
                    .classed('legendsOpenCloseBlock', true)
                    .style('display', 'inline-block');

                let textopen: d3.Selection<SVGElement>;
                textopen = legendsOpenCloseBlock
                    .append('div')
                    .classed('title', true)
                    .classed('text', true)
                    .style('font-size', `${this.values.legendTextSize}px`)
                    .style('color', this.values.labelColor)
                    .text(powerbi.extensibility.utils.formatting.textMeasurementService
                        .getTailoredTextOrDefault(textPropertiesLegendName2, (options.viewport.width * 20) / 100));

                legendsOpenCloseBlock
                    .append('div')
                    .classed('legend', true)
                    .style('right', '-35px')
                    .style('width', this.values.Low_HighIndicator)
                    .style('height', this.values.Low_HighIndicator)
                    .style('border-left', '8px solid transparent')
                    .style('border-right', '8px solid transparent')
                    .style('border-top', '8px solid')
                    .style('border-top-color', this.values.DecreasingTrend);

                this.rootElement.selectAll('.stock_legends').style({
                    display: this.values.hasLegend ? 'block' : 'none'
                });

                this.updateZoom(options);
                this.createAxis(viewModel, options);

                if (viewModel && viewModel.data[0]) {
                    // tslint:disable-next-line:no-any
                    let maxDate: any = new Date(viewModel.data[0][dateLiteral]);
                    // tslint:disable-next-line:no-any
                    let minDate: any = new Date(viewModel.data[0][dateLiteral]);
                    let days: number = 0;
                    // tslint:disable-next-line:no-any
                    let ratioDayLen: any;

                    let sKeyDataSet: string;
                    for (sKeyDataSet in viewModel.data) {
                        if (viewModel.data.hasOwnProperty(sKeyDataSet)) {
                            let dt: Date;
                            dt = new Date(viewModel.data[sKeyDataSet][dateLiteral]);
                            if (maxDate < dt) {
                                maxDate = dt;
                            }
                            if (minDate > dt) {
                                minDate = dt;
                            }
                        }
                    }

                    if ((maxDate - minDate) === 0) {
                        let dateParseFormat: d3.time.Format;
                        dateParseFormat = d3.time.format('%Y-%m-%d');
                        if (viewModel && viewModel.data[0] && viewModel.IsGrouped) {
                            maxDate = dateParseFormat.parse(`${(parseInt(viewModel.data[0][dateLiteral].substr('0,4'), 10) + 1)}-01-01`);
                            minDate = dateParseFormat.parse(`${(parseInt(viewModel.data[0][dateLiteral].substr('0,4'), 10) - 1)}-01-01`);
                        } else {
                            minDate = maxDate = dateParseFormat.parse(viewModel.data[0][dateLiteral]);
                            maxDate = powerbi.extensibility.utils.formatting.dateUtils.addDays(maxDate, 7);
                            minDate = powerbi.extensibility.utils.formatting.dateUtils.addDays(minDate, -7);
                        }
                    }

                    days = (maxDate - minDate) / (1000 * 60 * 60 * 24);
                    ratioDayLen = this.SVG_SIZE.w / (days ? days : 1);

                    // tslint:disable-next-line:no-any
                    let lowestValue: any = d3.min(viewModel.data.map(function (d: Object): any { return d[lowLiteral]; }));
                    // tslint:disable-next-line:no-any
                    let highestValue: any = d3.max(viewModel.data.map(function (d: Object): any { return d[highLiteral]; }));

                    let difference: number;
                    difference = highestValue - lowestValue;   //Getting the difference, MaxVal - MinVal

                    lowestValue = lowestValue - difference * 0.1;      //0.1 for adding extra 10% vertical space
                    highestValue = highestValue + difference * 0.1;      //0.1 for adding extra 10% vertical space

                    lowestValue = lowestValue - (lowestValue % 5);      //rounding off value to nearest multiple of 5
                    highestValue = highestValue + (5 - (highestValue % 5));       //rounding off value to nearest multiple of 5

                    lowestValue = lowestValue < 0 ? 0 : lowestValue;       //Y-axis value not less than 0

                    let differencePadded: number;
                    differencePadded = highestValue - lowestValue;

                    let sDataKey: string;
                    for (sDataKey in viewModel.data) {
                        if (viewModel.data.hasOwnProperty(sDataKey)) {
                            let ob: Object;
                            ob = viewModel.data[sDataKey];
                            // tslint:disable-next-line:no-any
                            let dtDate: any;
                            dtDate = new Date(ob[dateLiteral]);
                            let diffDaysNew: number;
                            diffDaysNew = (dtDate - minDate) / (1000 * 60 * 60 * 24);
                            // tslint:disable-next-line:no-any
                            let x: number;
                            x = this.ORIGIN_COORD.x + (diffDaysNew * ratioDayLen);
                            // tslint:disable-next-line:no-any
                            let low: any;
                            low = viewModel.data[sDataKey][lowLiteral];
                            // tslint:disable-next-line:no-any
                            let high: any;
                            high = viewModel.data[sDataKey][highLiteral];
                            // tslint:disable-next-line:no-any
                            let open: any;
                            open = viewModel.data[sDataKey][openLiteral];
                            // tslint:disable-next-line:no-any
                            let close: any;
                            close = viewModel.data[sDataKey][closeLiteral];

                            //creating stocklines
                            let diffCloseOpen1: number;
                            diffCloseOpen1 = high - low;
                            let bottom1: number;
                            bottom1 = ((low * this.SVG_SIZE.h) / differencePadded) - ((lowestValue * this.SVG_SIZE.h) / differencePadded);
                            let diffCloseOpen: number = (this.SVG_SIZE.h * diffCloseOpen1) / differencePadded;
                            let bottom: number;
                            bottom = this.ORIGIN_COORD.y - bottom1;
                            let line: d3.Selection<SVGElement>;
                            line = this.svg
                                .append('line')
                                .classed('Stock_line', true)
                                .attr({
                                    x1: x,
                                    x2: x,
                                    y1: (bottom - diffCloseOpen),
                                    y2: bottom
                                })
                                .style({
                                    'stroke-width': '2px',
                                    stroke: this.values.Low_HighIndicator
                                });

                            diffCloseOpen = close - open;
                            let bottom2: number;
                            bottom2 = (open * this.SVG_SIZE.h) / differencePadded - ((lowestValue * this.SVG_SIZE.h) / differencePadded);
                            let diffCloseOpenNew: number;
                            diffCloseOpenNew = (this.SVG_SIZE.h * diffCloseOpen) / differencePadded;
                            let bottomNew: number;
                            bottomNew = this.ORIGIN_COORD.y - bottom2;
                            let rect: d3.Selection<SVGElement>;
                            rect = this.svg
                                .append('line')
                                .classed('Stock_rectangle', true)
                                .attr({
                                    x1: x,
                                    x2: x,
                                    y1: (bottomNew - diffCloseOpenNew),
                                    y2: bottomNew
                                })
                                .style({
                                    'stroke-width': '6px',
                                    stroke: this.values.IncreasingTrend
                                });
                            let y: number;
                            y = bottomNew - diffCloseOpenNew;
                            point.push({ x, y });

                            if (this.values) {
                                // Trend line width range
                                if (this.values.hasTrend) {
                                    this.values.trendLineWidth = this.values.trendLineWidth < 0 ? 0 :
                                        (this.values.trendLineWidth > 5 ? 5 : this.values.trendLineWidth);
                                }

                                // Precision range
                                if (this.values.hasYAxis) {
                                    this.values.textPrecision = (this.values.hasYAxis ? ((this.values.textPrecision > 4) ? 4 :
                                        (this.values.textPrecision < 0) ? 0 : this.values.textPrecision) : 0);
                                }

                                this.formatter = powerbi.extensibility.utils.formatting.valueFormatter
                                    .create({ format: '0', value: this.values.displayUnits, precision: this.values.textPrecision });
                            }

                            if (open > close) {
                                rect.style({ stroke: this.values.DecreasingTrend });
                            }

                            // tslint:disable-next-line:no-any
                            let lowNew: any = viewModel.data[sDataKey][lowLiteral];
                            // tslint:disable-next-line:no-any
                            let highNew: any = viewModel.data[sDataKey][highLiteral];
                            // tslint:disable-next-line:no-any
                            let openNew: any = viewModel.data[sDataKey][openLiteral];
                            // tslint:disable-next-line:no-any
                            let closeNew: any;
                            closeNew = viewModel.data[sDataKey][closeLiteral];
                            // tslint:disable-next-line:no-any
                            let dateNew: any;
                            dateNew = viewModel.data[sDataKey][dateLiteral];
                            let toolTipInfoNew: {
                                displayName: string,
                                value: string
                            }[];
                            toolTipInfoNew = [];
                            let parseDate: (input: string) => Date;
                            parseDate = d3.time.format('%Y-%m-%d').parse;
                            let formatDate: d3.time.Format;
                            formatDate = d3.time.format('%d-%b-%y');
                            toolTipInfoNew.push({
                                displayName: viewModel.IsGrouped ? 'Year' : 'Date'
                                , value: viewModel.IsGrouped ? dateNew.substr(0, 4) : formatDate(parseDate(dateNew)).toString()
                            });

                            lowNew = powerbi.extensibility.utils.formatting.valueFormatter
                                .create({ format: viewModel.format[lowLiteral] }).format(lowNew);
                            highNew = powerbi.extensibility.utils.formatting.valueFormatter
                                .create({ format: viewModel.format[highLiteral] }).format(highNew);
                            openNew = powerbi.extensibility.utils.formatting.valueFormatter
                                .create({ format: viewModel.format[openLiteral] }).format(openNew);
                            closeNew = powerbi.extensibility.utils.formatting.valueFormatter
                                .create({ format: viewModel.format[closeLiteral] }).format(close);
                            toolTipInfoNew.push({ displayName: 'low', value: lowNew });
                            toolTipInfoNew.push({ displayName: 'high', value: highNew });
                            toolTipInfoNew.push({ displayName: 'open', value: openNew });
                            toolTipInfoNew.push({ displayName: 'close', value: closeNew });

                            line[0][0]['cust-tooltip'] = rect[0][0]['cust-tooltip'] = toolTipInfoNew;
                        }
                    }
                }

                this.svg.append('rect')
                    .classed('svgFrame', true)
                    .attr('x', this.ORIGIN_COORD.x - 8)
                    .attr('y', 0)
                    .attr('height', this.SVG_SIZE.h + 9 < 0 ? 0 : this.SVG_SIZE.h + 9)
                    .attr('width', this.SVG_SIZE.w + 16 < 0 ? 0 : this.SVG_SIZE.w + 16)
                    .style('stroke', this.values.borderColor)
                    .style('fill', 'none')
                    .style('stroke-width', '1px')
                    .style('display', this.values.hasBorder ? 'block' : 'none');

                // Trend Line
                if (point) {
                    // point.splice(0, 1);
                    let d3line2: d3.svg.Line<[number, number]>;
                    const xLiteral: string = 'x';
                    const yLiteral: string = 'y';
                    d3line2 = d3.svg.line()
                        // tslint:disable-next-line:no-any
                        .x(function (d: [number, number]): any { return d[xLiteral]; })
                        // tslint:disable-next-line:no-any
                        .y(function (d: [number, number]): any { return d[yLiteral]; });

                    this.svg.append('svg:path').classed('trend_Line', true)
                        .attr('d', d3line2(point))
                        .style('stroke-width', this.values.trendLineWidth)
                        .style('stroke', this.values.TrendLine)
                        .style('fill', 'none');
                }
                if (this.values.hasTrend === false) {
                    this.rootElement.selectAll('.trend_Line').remove();
                }

                if (this.values.hasXAxis) {
                    this.rootElement.selectAll('g.Stock_xaxis').style('display', 'initial');
                } else {
                    this.rootElement.selectAll('g.Stock_xaxis').style('display', 'none');
                }
                this.rootElement.selectAll(('g.Stock_yaxis')).style('fill', this.values.yaxisColor);
                this.rootElement.selectAll(('g.Stock_xaxis')).style('fill', this.values.xaxisColor);

                // Formatting option for y-axis through capabilities
                // Formatting the y-axis
                let k: number;
                k = 0;
                if (this.rootElement.selectAll('g.Stock_yaxis>g.tick') && this.rootElement.selectAll('g.Stock_yaxis>g.tick')[0]) {
                    if ((this.values && this.values.displayUnits) && this.values.displayUnits > 1) {
                        // tslint:disable-next-line:no-any
                        let formatter: any;
                        formatter = this.formatter;
                        // tslint:disable-next-line:no-any
                        this.rootElement.selectAll('g.Stock_yaxis>g.tick>text').each(function (d: any): void {
                            this.textContent = formatter.format(d);
                        });
                    } else {
                        let precision: number;
                        precision = this.values.textPrecision;
                        // tslint:disable-next-line:no-any
                        this.rootElement.selectAll('g.Stock_yaxis>g.tick>text').each(function (d: any): void {
                            this.textContent = d3.format(`,.${precision}f`)(d);
                        });
                    }
                }

                this.tooltipServiceWrapper.addTooltip(
                    this.rootElement.selectAll('svg.linearSVG>*'), (tooltipEvent: TooltipEventArgs<number>) => {
                        return tooltipEvent.context['cust-tooltip'];
                    },
                    (tooltipEvent: TooltipEventArgs<number>) => null, true);

                // Y-Axis
                if (this.values.hasYAxis && this.svg.select('g.Stock_yaxis')[0][0]) {
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'initial');
                    let tc: HTMLElement;
                    tc = <HTMLElement>this.svg.select('g.Stock_yaxis')[0][0];
                    let iValue: number;
                    iValue = tc.getBoundingClientRect().width;
                    this.svg.style('position', 'relative');
                    this.svg.style('left', `${iValue / 2}px`);
                } else {
                    this.rootElement.selectAll('g.Stock_yaxis').style('display', 'none');
                }
            }
        }

        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let enumeration: VisualObjectInstance[];
            enumeration = [];
            if (!this.values) {
                this.values = StockChart.getDefaultData();
            }

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
                            labelColor: this.values.labelColor
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
                            color: this.values.xaxisColor
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
                            color: this.values.borderColor
                        }
                    });
                    break;
                default:
            }

            return enumeration;
        }

    }
}
