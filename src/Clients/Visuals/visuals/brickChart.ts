module powerbi.visuals {
    var BrickChartDefaultLegendFontSize: number = 8;
    var BrickChartDefaultLegendShow: boolean = true;
    var BrickChartLegendShowProp: DataViewObjectPropertyIdentifier = { objectName: "legend", propertyName: "show" };
    var BrickChartGeneralFormatStringProp: DataViewObjectPropertyIdentifier = { objectName: 'general', propertyName: 'formatString' };
    
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

    export interface BrickChartValues {
        categories: {};
        borderColor: string;
        dataPoints: BrickChartDataPoint[];
        legendData: LegendData;
        valueFormatter: IValueFormatter;
        settings: BrickChartPlotSettings;
    }

    export class BrickChart implements IVisual {
        //Variables
        private svg: D3.Selection;
        public data: BrickChartValues;
        public dataView: DataView;
        public groupLegends: D3.Selection;
        public matrix: D3.Selection;
        public rootElement: D3.Selection;
        public svgs: {};
        public tooltip;
        public groupLegendSelected;
        public zoom;
        public toolTipInfo;
        public myStyles: D3.Selection;
        public randColor: [string];
        private currentViewport: IViewport;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;

        public static getDefaultData(): BrickChartValues {
            return {
                categories: {}
                , borderColor: '#555'
                , randColor: ['']
                , dataPoints: null
                , legendData: null
                , settings: { showLegend: BrickChartDefaultLegendShow }
                , valueFormatter: null
            };
        }                       

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            this.legend = createLegend(options.element, false, null, true);

            this.rootElement = d3.select(options.element.get(0))
                .append('div').attr('style', 'position:relative;margin:auto;')
                .classed('brickchart_topContainer', true);

            this.initRandColor(options);
            this.initLegends(options);
            this.initMatrix(options);
            this.updateZoom(options);
            this.updateStyleColor();
            this.toolTipInfo = [{ displayName: '', value: '' }];

        }

        public initLegends(options: VisualInitOptions): void {
            // Making the parent div
            this.groupLegends = this.rootElement
                .append('div')
                .classed('legends', true);
        }

        public initMatrix(options: VisualInitOptions): void {
            var self = this;
            //Making the div for Square grid
            this.matrix = this.rootElement
                .append('div')
                .classed('matrix', true);

            this.svg = this.matrix
                .append('svg')
                .classed('svg', true);  
                 
            //Making squares
            this.svgs = {};            
            for (var row = 0; row < 10; row++) {
                for (var col = 0; col < 10; col++) {
                    var svg = this.svg
                        .append('rect')
                        .attr('x', (21 * col))
                        .attr('y', (21 * row))
                        .attr('width', 21)
                        .attr('height', 21)
                        .attr('fill', 'none')
                        .classed('linearSVG', true);
                    svg[0][0]['cust_id'] = row + ':' + col;
                    this.svgs[row + ':' + col] = svg[0][0];


                    svg[0][0].onmouseover = function (e) {
                        var ele = e['srcElement'] || e['target'];

                        if (ele["cust_leg_val"] === '') {
                            self.toolTipInfo[0].displayName = '';
                            self.toolTipInfo[0].value = '';
                        } else {
                            self.toolTipInfo[0].displayName = ele["cust_leg_name"];
                            self.toolTipInfo[0].value = BrickChart.numberWithCommas(ele["cust_leg_val"]);
                        }
                        TooltipManager.ToolTipInstance.currentTooltipData = this.toolTipInfo;
                    };
                }
            }
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
        public initRandColor(options: VisualInitOptions): void {
            var MAX_LEGENDS = 70;
            var style = ""
                , letters = '0123456789ABCDEF'.split(''), color = '#';
            this.randColor = [''];
            this.randColor.pop();
            this.randColor.push('#01B8AA');
            this.randColor.push('#374649');
            this.randColor.push('#FD625E');
            this.randColor.push('#F2C80F');
            this.randColor.push('#5F6B6D');
            this.randColor.push('#8AD4EB');
            this.randColor.push('#FE9666');
            this.randColor.push('#A66999');
            this.randColor.push('#3599B8');
            this.randColor.push('#DFBFBF');
            this.randColor.push('#6d635f');
            this.randColor.push('#eba98a');
            this.randColor.push('#66d5fe');
            this.randColor.push('#99a669');
            this.randColor.push('#b85e35');
            this.randColor.push('#bfdfbf');
            this.randColor.push('#b82b01');
            this.randColor.push('#493c37');
            this.randColor.push('#5efd6e');
            this.randColor.push('#9f0ff2');
            this.randColor.push('#FB8281');
            this.randColor.push('#F4D25A');
            this.randColor.push('#7F898A');
            this.randColor.push('#A4DDEE');
            this.randColor.push('#FDAB89');
            this.randColor.push('#B687AC');
            this.randColor.push('#28738A');
            this.randColor.push('#A78F8F');
            this.randColor.push('#168980');
            this.randColor.push('#B59525');

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
        public static converter(dataView: DataView): BrickChartValues {
            var data: BrickChartValues = BrickChart.getDefaultData();
            data.dataPoints = [];

            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.values) {
                var legends = dataView.categorical.categories[0].values;
                var values = dataView.categorical.values[0].values;

                var categorySourceFormatString = valueFormatter.getFormatString(dataView.categorical.categories[0].source, BrickChartGeneralFormatStringProp);
                var minValue: number = Math.min(0, d3.min(values));

                var dataSet = {};
                for (var i = 0; i < legends.length; i++) {
                    dataSet[legends[i]] = {};
                    dataSet[legends[i]]["value"] = values[i];

                    var formattedCategoryValue = valueFormatter.format(legends[i], categorySourceFormatString);
                    var tooltipInfo: TooltipDataItem[] = [];

                    data.dataPoints.push({
                        label: legends[i],
                        value: values[i],
                        color: 'black',
                        selector: SelectionId.createWithId(dataView.categorical.categories[0].identity[i]),
                        tooltipInfo: tooltipInfo
                    });
                }
                data.categories = dataSet;
            }
            data.legendData = BrickChart.getLegendData(dataView, data.dataPoints);
            data.settings = BrickChart.parseLegendSettings(dataView);

            return data;
        }

        private static getLegendData(dataView: DataView, BrickChartDataPoints: BrickChartDataPoint[]): LegendData {
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
                        value: BrickChartDataPoints[i].value,
                        icon: LegendIcon.Box,
                        selected: false,
                        identity: SelectionId.createWithId(dataView.categorical.categories[0].identity[i], false)
                    });
                }
            }
            return legendData;
        }
        private static parseLegendSettings(dataView: DataView): BrickChartPlotSettings {
            var objects: DataViewObjects;
            if (!dataView)
                objects = null;
            else if (dataView && dataView.metadata)
                objects = dataView.metadata.objects;
            return { showLegend: DataViewObjects.getValue(objects, BrickChartLegendShowProp, BrickChartDefaultLegendShow) };
        }
        
        
        //Updates the zoom
        public updateZoom(options): void {
            var WIDTH = 211
                , HEIGHT = 211;
            var viewport = options.viewport;
            var orient = this.legend.getOrientation();
            var height = viewport.height, width = viewport.width;

            if (this.legend.isVisible()) {
                if (orient == 0 || orient == 1 || orient == 5 || orient == 6) {
                    height -= (this.data ? this.legend.getMargins().height : 0);
                    this.rootElement.classed('brickOrientationLeft', false);
                    this.rootElement.classed('brickOrientationRight', false);
                    this.rootElement.style('left', 0).style('right', 0);
                    if (this.currentViewport != null) {
                        var x = (this.currentViewport.width - this.currentViewport.height) / 2;
                        if (x < 0 && (orient == 0 || orient == 5))
                            this.rootElement.style('top', -x + this.legend.getMargins().height + 'px');
                        else if (x < 0 && (orient == 1 || orient == 6))
                            this.rootElement.style('top', -x + 'px');
                    }
                }
                else if (orient == 2 || orient == 7) {
                    width -= (this.data ? this.legend.getMargins().width : 0);
                    this.rootElement.classed('brickOrientationLeft', false).classed('brickOrientationRight', true);
                    var x = (this.currentViewport.width - this.currentViewport.height) / 2;
                    if (x > 0)
                        this.rootElement.style('right', this.legend.getMargins().width + x + 'px');
                    else {
                        this.rootElement.style('top', -x + 'px');
                        this.rootElement.style('right', this.legend.getMargins().width + 'px');
                    }
                }
                else if (orient == 3 || orient == 8) {
                    width -= (this.data && this.data.settings.showLegend ? this.legend.getMargins().width : 0);
                    this.rootElement.classed('brickOrientationLeft', true).classed('brickOrientationRight', false);
                    var x = (this.currentViewport.width - this.currentViewport.height) / 2;
                    if (x > 0)
                        this.rootElement.style('left', this.legend.getMargins().width + x + 'px');
                    else
                        this.rootElement.style('top', -x + 'px');
                }
            }
            else {
                this.rootElement.classed('brickOrientationRight', false).classed('brickOrientationLeft', false).style('left', 0);
                if (this.currentViewport != null) {
                    var x = (this.currentViewport.height - this.currentViewport.width) / 2;
                    if (x > 0)
                        this.rootElement.style('top', x + 'px');
                }
            }
            this.zoom = Math.min(width / WIDTH, height / HEIGHT) - 0.03;
            if (navigator.userAgent.indexOf('Firefox/') > 0)
                this.matrix.style('transform', 'Scale(' + this.zoom + ')');
            else
                this.matrix.style('zoom', this.zoom);
        }
        
        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            var dataView = this.dataView = options.dataViews[0];
            this.data = BrickChart.converter(dataView);
            var dataSet = {};
            dataSet = this.data.categories;
            var sum = this.calculateSum(dataSet);

            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            
            //Assigning css color class to the squares
            var last = 0, category = 0;

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
                            }
                            last += cnt;
                        }
                    }
                }
            }
            else {
                for (var index = 0; index < 100; index++) {
                    var row = Math.floor((last + index) / 10);
                    var col = (last + index) % 10;
                    if (!this.svgs[col + ':' + row]) { break; }
                    this.svgs[col + ':' + row].setAttribute("class", "linearSVG category-clr");
                    this.svgs[col + ':' + row]["cust_leg_ind"] = '';
                    this.svgs[col + ':' + row]["cust_leg_name"] = '';
                    this.svgs[col + ':' + row]["cust_leg_val"] = '';
                }
            }

            var objects = null;

            if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata && options.dataViews[0].metadata.objects) {
                objects = options.dataViews[0].metadata.objects

                this.data.settings.showLegend = DataViewObjects.getValue(objects, { objectName: 'legend', propertyName: 'show' }, this.data.settings.showLegend);
                this.data.borderColor = DataViewObjects.getFillColor(objects, { objectName: 'general', propertyName: 'borderColor' }, this.data.borderColor);
                this.data.legendData.title = DataViewObjects.getValue(objects, { objectName: 'legend', propertyName: 'titleText' }, this.data.legendData.title);

                this.rootElement.select("svg.svg")
                    .selectAll("rect")
                    .style('stroke', this.data.borderColor);

                var ind = 0;
                for (var k in this.data.categories) {
                    var tmp = this.randColor[ind];
                    var clr = DataViewObjects.getFillColor(objects,
                        { objectName: 'dataPoint_' + ind, propertyName: k }, '');
                    ind++;
                }
            }
            this.renderLegend(this.data, this.randColor, sum);
            this.updateViewPortAccordingToLegend();

            TooltipManager.addTooltip(this.matrix, (tooltipEvent: TooltipEvent) => this.toolTipInfo, true);//Adding visual tips
            this.updateZoom(options);
        }


        private renderLegend(BrickChartData: BrickChartValues, n: string[], sum: number): void {
            if (!BrickChartData || !BrickChartData.legendData)
                return;

            if (this.dataView && this.dataView.metadata)
                this.legendObjectProperties = DataViewObjects.getObject(this.dataView.metadata.objects, "legend", {});


            var legendData: LegendData = BrickChartData.legendData;

            var legendDataTorender: LegendData = {
                fontSize: BrickChartDefaultLegendFontSize,
                dataPoints: [],
                title: legendData.title
            };

            for (var j = 0; j < legendData.dataPoints.length; j++) {
                var cnt = Math.round(100 * ((legendData.dataPoints[j].value) / sum));
                if (cnt > 0) {
                    legendDataTorender.dataPoints.push({
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        value: legendData.dataPoints[j].value,
                        icon: LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                }
            }

            var i = 0;
            legendDataTorender.dataPoints.forEach(function (ele) { ele.color = n[i++]; });

            if (this.legendObjectProperties) {
                LegendData.update(legendDataTorender, this.legendObjectProperties);

                var position: string = <string>this.legendObjectProperties[legendProps.position];

                if (position)
                    this.legend.changeOrientation(LegendPosition[position]);//
            }

            this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
            Legend.positionChartArea(this.rootElement, this.legend);

        }

        private updateViewPortAccordingToLegend(): void {
            var legendMargins: IViewport = this.legend.getMargins(),
                legendPosition: LegendPosition;
            if (!this.legendObjectProperties) return;
            legendPosition = LegendPosition[<string>this.legendObjectProperties[legendProps.position]];
            switch (legendPosition) {
                case LegendPosition.Top:
                case LegendPosition.TopCenter:
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter: {
                    this.currentViewport.height -= legendMargins.height;
                    break;
                }
                case LegendPosition.Left:
                case LegendPosition.LeftCenter:
                case LegendPosition.Right:
                case LegendPosition.RightCenter: {
                    this.currentViewport.width -= legendMargins.width;
                    break;
                }
                default:
                    break;
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            if (!this.data)
                this.data = BrickChart.getDefaultData();

            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            borderColor: this.data.borderColor,
                        }
                    });
                    break;

                case 'legend':
                    enumeration.pushInstance({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.data.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: DataViewObject.getValue(this.legendObjectProperties, legendProps.showTitle, true),
                            titleText: this.data.legendData ? this.data.legendData.title : '',
                            labelColor: DataViewObject.getValue(this.legendObjectProperties, legendProps.labelColor, null),
                            fontSize: DataViewObject.getValue(this.legendObjectProperties, legendProps.fontSize, BrickChartDefaultLegendFontSize)
                        }
                    });
                    break;
            }

            return enumeration.complete();
        }

               
        //Capabilities what this visualization can do
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category', // This will be the name of role and we can find element in an object with the role
                    kind: VisualDataRoleKind.Grouping, //Type of value
                    displayName: 'Category', // it will display as measure header name
                },
                {
                    name: 'Value',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Value',
                }
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        borderColor: {
                            displayName: 'Border Color',
                            type: { fill: { solid: { color: true } } }
                        }
                    },
                },
                legend: {
                    displayName: 'Legend',
                    description: 'Display legend options',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        position: {
                            displayName: 'Position',
                            description: 'Select location for the legend',
                            type: { enumeration: legendPosition.type }
                        },
                        showTitle: {
                            displayName: 'Title',
                            description: 'Display title for legend',
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Legend Name',
                            description: 'Title text',
                            type: { text: true },
                            suppressFormatPainterCopy: true
                        },
                        labelColor: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            type: { formatting: { fontSize: true } }
                        }
                    }
                }
            },
            dataViewMappings: [{
                conditions: [
                    { 'Category': { max: 1 }, 'Value': { max: 1 } }, //Maximum no. of values we can provide
                ],
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'Category' } },
                            { bind: { to: 'Value' } }
                        ]
                    },
                },
            }],
            suppressDefaultTitle: false,
        };
    }
}