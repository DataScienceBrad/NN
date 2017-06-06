module powerbi.extensibility.visual {
    var legendValues = {};
    var legendValuesTorender = {};
    var BrickChartDefaultLegendFontSize: number = 8;
    var BrickChartDefaultLegendShow: boolean = true;
    var BrickChartLegendShowProp: DataViewObjectPropertyIdentifier = { objectName: "legend", propertyName: "show" };
    var BrickChartGeneralFormatStringProp: DataViewObjectPropertyIdentifier = { objectName: 'general', propertyName: 'formatString' };
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
	import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import SelectionId = powerbi.visuals.ISelectionId;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    import DataViewObjects = powerbi.DataViewObjects;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    
    //property to show or hide legend
    export interface BrickChartPlotSettings {
        showLegend: boolean;
    }
    
    //Data points for legend generation
    export interface BrickChartDataPoint {
        color: string;
        label: string;
        value: number;
        selector: SelectionId;
        tooltipInfo: TooltipDataItem[];
    }

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

    export interface BrickChartValues {
        categories: {};
        borderColor: string;
        randColor: {};
        toolTipInfo : any[];
        dataPoints: BrickChartDataPoint[];
        legendData: LegendData;
        valueFormatter: IValueFormatter;
        settings: BrickChartPlotSettings;
    }

    export class BrickChart implements IVisual {
        //Variables
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        public host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        public data: BrickChartValues;
        public dataView: DataView;
        public groupLegends: d3.Selection<SVGElement>;
        public matrix: d3.Selection<SVGElement>;
        public root: d3.Selection<SVGElement>;
        public rootElement: d3.Selection<SVGElement>;
        public errorDiv: d3.Selection<SVGElement>;
        public svgs: {};
        public tooltip;
        public groupLegendSelected;
        public zoom;
        public toolTipInfo:any = {};
        public myStyles: d3.Selection<SVGElement>;
        public randColor: [string];
        private currentViewport: IViewport;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private dataSet: any;
        public selectionManager:ISelectionManager;
        public static getDefaultData(): BrickChartValues {
            return {
                categories: {}
                , borderColor: '#555'
                , randColor: ['']
                , dataPoints: null
                , toolTipInfo: []
                , legendData: null
                , settings: { showLegend: BrickChartDefaultLegendShow }
                , valueFormatter: null
            };
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
        /** This is called once when the visual is initialially created */
         constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.root = d3.select(options.element);
            this.rootElement = d3.select(options.element)
                .append('div')
                .classed('brickchart_topContainer', true)
            var oElement: any = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.initRandColor(options);
            this.initMatrix(options);
            this.updateZoom(options);
            this.updateStyleColor();
            this.toolTipInfo = [{ displayName: '', value: '' }];
        }
        public initMatrix(options: VisualConstructorOptions): void {
            var self = this;
            //Making the div for Square grid
            this.matrix = this.rootElement
                .append('div')
                .classed('matrix', true)

            this.svg = this.matrix
                .append('svg')
                .classed('svg', true)
                .attr('width', 211)
                .attr('height', 211);
                 
            
        }

        public static numberWithCommas(x): string {
            var numeric = parseInt(x);
            var decimal = (x + "").split(".")[1];
            if (decimal) {
                return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + decimal.slice(0, 2);
            } else {
                return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }
        
        // Random colors logic
        public initRandColor(options: VisualConstructorOptions): void {
            var MAX_LEGENDS = 70;
            var style = ""
                , letters = '0123456789ABCDEF'.split(''), color = '#';
            this.randColor = ['#01B8AA','#374649','#FD625E','#F2C80F','#5F6B6D','#8AD4EB','#FE9666','#A66999','#3599B8','#DFBFBF','#6d635f','#eba98a','#66d5fe','#99a669'
            ,'#b85e35','#bfdfbf','#b82b01','#493c37','#5efd6e','#9f0ff2','#FB8281','#F4D25A','#7F898A','#A4DDEE','#FDAB89','#B687AC','#28738A','#A78F8F','#168980','#B59525'];
            
            for (var index = 1; index <= MAX_LEGENDS; index++) {
                color = "#";
                var bDuplicateFound = true;
                while (bDuplicateFound) {
                    for (var i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    if (this.randColor.indexOf(color) >= 0) {
                        bDuplicateFound = true;
                    } else {
                        this.randColor.push(color);
                        bDuplicateFound = false;
                    }
                }
            }
        }

        public updateStyleColor() {
            if (!this.myStyles) {
                this.myStyles = this.rootElement
                    .append('style')
                    .attr('id', 'legends_clr');
            }
            
            //  setting the boxes color
            var style = "";
            for (var index = 1; index <= this.randColor.length; index++) {
                var color = this.randColor[index - 1];
                style += ".brickchart_topContainer .category-clr" + index + "{fill:" + color + ";background:" + color + ";}";
            }
            
            //setting the stroke color
            style += ".brickchart_topContainer svg>rect{stroke:" + '#555' + " ;}"

            this.myStyles.html(style);
        }
        
        // Calculate and return the sums
        public calculateSum(dataSet): number {
            var sum = 0, index = 1;
            var self = this;

            for (var c in dataSet) {
                if (parseFloat(dataSet[c].value) > 0)
                    sum += dataSet[c].value;
            }
            return sum;
        }
        
        //Convertor Function       
        public static converter(dataView: DataView, host:IVisualHost): BrickChartValues {
            var data: BrickChartValues = BrickChart.getDefaultData();
            data.dataPoints = [];
            
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.values) {
                var legends:any = dataView.categorical.categories[0].values;
                var values:any = dataView.categorical.values[0].values;

                var categorySourceFormatString = valueFormatter.getFormatString(dataView.categorical.categories[0].source, BrickChartGeneralFormatStringProp);
                var minValue: number = Math.min(0, d3.min(values));
                var dataSet = {};
                
                var formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });
                for (var i = 0; i < legends.length; i++) {
                    dataSet[legends[i]] = {};
                    dataSet[legends[i]]["value"] = values[i];

                    var formattedCategoryValue = valueFormatter.format(legends[i], categorySourceFormatString);
                    var tooltipInfo: TooltipDataItem[] = [];
                    if (Date.parse(legends[i]) && (formatter.format(legends[i]) != 'dddd MMMM %d yyyy')) {
                        data.dataPoints.push({
                            label: formatter.format(legends[i]),
                            value: values[i],
                            color: 'black',
                            selector: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId(),
                            tooltipInfo: tooltipInfo
                        });
                    } else {
                        data.dataPoints.push({
                            label: legends[i],
                            value: values[i],
                            color: 'black',
                            selector: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId(),
                            tooltipInfo: tooltipInfo
                        });
                    }
                }
                data.categories = dataSet;
            }
            data.legendData = BrickChart.getLegendData(dataView, data.dataPoints,host);
            data.settings = BrickChart.parseLegendSettings(dataView);			
            return data;
        }

        private static getLegendData(dataView: DataView, BrickChartDataPoints: BrickChartDataPoint[], host:IVisualHost): LegendData {
            var SelectionId:powerbi.visuals.ISelectionId;
            var sTitle = "";
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0] && dataView.categorical.categories[0].source) {
                sTitle = dataView.categorical.categories[0].source.displayName;
            }
            var legendData: LegendData = {
                fontSize: BrickChartDefaultLegendFontSize,
                dataPoints: [],
                title: sTitle
            };
            for (var i = 0; i < BrickChartDataPoints.length; ++i) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    legendData.dataPoints.push({
                        label: BrickChartDataPoints[i].label,
                        color: BrickChartDataPoints[i].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                    });
                }
                legendValues[i] = BrickChartDataPoints[i].value;
            }
            return legendData;
        }
        private static parseLegendSettings(dataView: DataView): BrickChartPlotSettings {
            var objects: DataViewObjects;
            if (!dataView)
                objects = null;
            else if (dataView && dataView.metadata)
                objects = dataView.metadata.objects;
            return { showLegend:  powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, BrickChartLegendShowProp, BrickChartDefaultLegendShow) };
        }
        
        
        //Updates the zoom
        public updateZoom(options): void {
            var WIDTH = 211
                , HEIGHT = 211;
            var viewport = options.viewport;
            var orient = this.legend.getOrientation();
            var legendHeight = this.legend.getMargins().height;
            var legendWidth = this.legend.getMargins().width;
            if(viewport == undefined) {
                return;
            }
            var legendHeightForZoom = ((this.legend.getMargins().height) * HEIGHT) / viewport.height;
            var legendWidthForZoom = (this.legend.getMargins().width) * WIDTH / viewport.width;
            switch (orient) {
                case 0:
                case 5:
                case 1:
                case 4:
                case 6: {
                    this.rootElement.style('width', '98%');
                    break;
                }
                case 7:
                case 8:
                case 2:
                case 3: {
                    var customWidth = viewport.width - legendWidth;
                    this.rootElement.style('width', customWidth + 'px')
                    WIDTH += legendWidthForZoom + 22;
                    break;
                }
                default:
                    break;
            }
            var height = viewport.height - legendHeight;
            var width = viewport.width - legendHeight;
            this.zoom = Math.min(width / WIDTH, height / HEIGHT) - 0.03;

            if (navigator.userAgent.indexOf('Firefox/') > 0) {
                this.matrix.style('transform', 'Scale(' + this.zoom + ')');
            }
            if (navigator.userAgent.indexOf('Edge/') > 0) {
                this.matrix.style('transform', 'Scale(' + this.zoom + ')');
                if (this.zoom < 1) {
                    this.matrix.style('zoom', this.zoom);
                }
            }
            else {
                this.matrix.style('zoom', this.zoom);
            }

            if (this.zoom < 0.1) {
                this.root.select('.legend').style('display', 'none');
            }
            else {
                this.root.select('.legend').style('display', 'inherit');
            }
            if (this.zoom < 0.06) {
                this.root.select('.matrix').style('display', 'none');
            }
            else {
                this.root.select('.matrix').style('display', 'inline-block')
            }

        }
        
        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            var dataView = this.dataView = options.dataViews[0];
            this.data = BrickChart.converter(dataView,this.host);
            var format = '0';
            var formatter;
            if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values[0] && dataView.categorical.values[0].source) {
                format = dataView.categorical.values[0].source.format;
                formatter = valueFormatter.create({ format: format, precision: 2, allowFormatBeautification: true });
            } else {
                formatter = valueFormatter.create({ value: 0, precision: 2, allowFormatBeautification: true });
            }
            var dataSet = {};
            dataSet = this.data.categories;
            var sum = this.calculateSum(dataSet);

            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            
            this.svg.selectAll("rect").remove();
            this.svgs = {};
            //Making squares
            for (var row = 0; row < 10; row++) {
                for (var col = 0; col < 10; col++) {
                    var svg = this.svg
                        .append('rect')
                        .attr('x',(21 * col))
                        .attr('y',(21 * row))
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none')
                        .classed('linearSVG', true);
                    svg[0][0]['cust_id'] = row + ':' + col;
                    this.svgs[row + ':' + col] = svg[0][0];
                    this.svgs[row + ':' + col].setAttribute("class", "linearSVG category-clr");
                    this.svgs[row + ':' + col]["cust_leg_ind"] = '';
                    this.svgs[row + ':' + col]["cust_leg_name"] = '';
                    this.svgs[row + ':' + col]["cust_leg_val"] = '';
                }
            }
            
            var last = 0, category = 0;
            //Assigning css color class to the squares
            if (this.data.dataPoints.length) {
                for (var k1 = 0; k1 < this.data.dataPoints.length; k1++) {
                    if (this.data.dataPoints[k1].value > 0) {
                        var cnt = Math.round(100 * (this.data.dataPoints[k1].value / sum));
                        if (cnt > 0) {
                            category++;
                            for (var index = 0; index < cnt; index++) {
                                if (index >= 100) break;
                                var row = Math.floor((last + index) / 10);
                                var col = (last + index) % 10;
                                if (!this.svgs[col + ':' + row]) { break; }
                                this.svgs[col + ':' + row].setAttribute("class", "linearSVG category-clr" + category);
                                this.svgs[col + ':' + row]["cust_leg_ind"] = category;
                                this.svgs[col + ':' + row]["cust_leg_name"] = this.data.dataPoints[k1].label;
                                this.svgs[col + ':' + row]["cust_leg_val"] = this.data.dataPoints[k1].value;

                                var toolTipInfo = [];
                                toolTipInfo.push({ displayName: 'category', value: this.data.dataPoints[k1].label + '' });
                                toolTipInfo.push({ displayName: 'value', value: formatter.format(this.data.dataPoints[k1].value) });
                                this.svgs[col + ':' + row]['cust-tooltip'] = toolTipInfo;
                                this.toolTipInfo[k1] = toolTipInfo;
                            }
                            last += cnt;
                        }
                    }
                }
            }

            var objects = null;

            if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata && options.dataViews[0].metadata.objects) {
                objects = options.dataViews[0].metadata.objects

                this.data.settings.showLegend =  powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, { objectName: 'legend', propertyName: 'show' }, this.data.settings.showLegend);
                this.data.borderColor =  powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, { objectName: 'general', propertyName: 'borderColor' }, this.data.borderColor);
                this.data.legendData.title =  powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, { objectName: 'legend', propertyName: 'titleText' }, this.data.legendData.title);

                this.rootElement.select("svg.svg")
                    .selectAll("rect")
                    .style('stroke', this.data.borderColor);

                var ind = 0;
                for (var k in this.data.categories) {
                    var tmp = this.randColor[ind];
                    var clr =  powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects,
                        { objectName: 'dataPoint_' + ind, propertyName: k }, '');
                    ind++;
                }
            }
            this.renderLegend(this.data, this.randColor, sum);
            this.tooltipServiceWrapper.addTooltip(d3.selectAll('svg>*'),(tooltipEvent: TooltipEventArgs<number>) => {
                                return tooltipEvent.context['cust-tooltip'];
                            },  (tooltipEvent: TooltipEventArgs<number>) => null,true);
            this.updateZoom(options);
        }


        private renderLegend(BrickChartData: BrickChartValues, n: string[], sum: number): void {
            if (!BrickChartData || !BrickChartData.legendData)
                return;

            if (this.dataView && this.dataView.metadata)
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(this.dataView.metadata.objects, "legend", {});


            var legendData:LegendData = BrickChartData.legendData;

            var legendDataTorender: LegendData = {
                fontSize: BrickChartDefaultLegendFontSize,
                dataPoints: [],
                title: legendData.title
            };

            for (var j = 0; j < legendData.dataPoints.length; j++) {
                var cnt = Math.round(100 * ((legendValues[j]) / sum));
                if (cnt > 0) {
                    legendDataTorender.dataPoints.push({
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                    legendValuesTorender[j] = legendValues[j];
                }
            }

            var i = 0;
            legendDataTorender.dataPoints.forEach(function (ele) { ele.color = n[i++]; });
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                var position: string = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];

                if (position)
                    this.legend.changeOrientation(LegendPosition[position]);
            }

            this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.rootElement, this.legend);

        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            if (!this.data)
                this.data = BrickChart.getDefaultData();

            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            borderColor: this.data.borderColor,
                        }
                    });
                    break;

                case 'legend':
                    enumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.data.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            titleText: this.data.legendData ? this.data.legendData.title : '',
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, BrickChartDefaultLegendFontSize)
                        }
                    });
                    break;
            }

            return enumeration
        }
    
      
    }
}