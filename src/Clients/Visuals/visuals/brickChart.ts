module powerbi.visuals {

    export interface BrickChartValues {
        categories: {};
        hasLegend: boolean;
        legendTextSize: number;
        titleText: string;
        showTitle: boolean;
        labelColor: string;
        borderColor: string;
        legendFill: string;
        legendShowAllDataPoints: boolean;
        legendDefaultColor: string;
        randColor: any[];
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
        public randColor: any[];

        public static getDefaultData(): BrickChartValues {
            return {
                categories: {}
                , hasLegend: true
                , legendTextSize: 11
                , titleText: "Category"
                , showTitle: true
                , labelColor: 'rgb(102,102,102)'
                , legendDefaultColor: 'gray'
                , legendFill: 'gray'
                , borderColor: '#555'
                , legendShowAllDataPoints: true
                , randColor: ['']
            };
        }                       

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            this.rootElement = d3.select(options.element.get(0))
                .append('div')
                .classed('brickchart_topContainer', true);
            this.initRandColor(options);
            this.initLegends(options);
            this.initMatrix(options);
            this.initTooltip(options);
            this.updateZoom(options);
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
            this.groupLegendSelected = false;
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


                    svg[0][0].onmousemove = function (e) {
                        var ele = e['srcElement'] || e['target'];
                        self.toolTipInfo[0].displayName = ele["cust_leg_name"];
                        self.toolTipInfo[0].value = ele["cust_leg_val"] + '';
                        TooltipManager.ToolTipInstance.currentTooltipData = this.toolTipInfo;
                    };
                }
            }
        }

        public highlightLegend(self, ind): void {
            var clsRect = 'category-clr' + ind;
            if (self.groupLegendSelected == false || (self.groupLegendSelected !== false && clsRect !== self.groupLegendSelected)) {
                this.rootElement.selectAll("svg>rect").classed("highlight", true);
                this.rootElement.selectAll(".legend").classed("highlight", true);
                this.rootElement.selectAll("svg>rect." + clsRect).classed("highlight", false);
                this.rootElement.selectAll(".leg-grp" + ind).classed("highlight", false);

                self.groupLegendSelected = clsRect;
            }
            else {
                self.groupLegendSelected = false;
                this.rootElement.selectAll("svg>rect").classed("highlight", false);
                this.rootElement.selectAll(".legend").classed("highlight", false);
            }
        }
        
        // Random colors logic
        public initRandColor(options: VisualInitOptions): void {
            var MAX_LEGENDS = 20;
            var style = ""
                , letters = '0123456789ABCDEF'.split(''), color = '#';
            this.randColor = new Array();
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

            for (var index = 1; index <= MAX_LEGENDS; index++) {
                color = "#";
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                this.randColor.push(color);
            }
        }
        public updateStyleColor() {
            if (!this.myStyles) {
                this.myStyles = this.rootElement
                    .append('style')
                    .attr('id', 'legends_clr');
            }
            if ($(".brickchart_topContainer .category-clr1").length) {
                for (var index = 1; index <= this.randColor.length; index++) {
                    var color = this.randColor[index - 1];
                    this.rootElement.selectAll(".brickchart_topContainer .category-clr" + index).attr('style', 'fill:' + color + ';background:' + color + ';stroke:' + this.data.borderColor);
                }
            }
            else {

                this.rootElement.selectAll(".brickchart_topContainer svg>rect").attr('style', ';stroke:' + this.data.borderColor);
            }
        }
        public initTooltip(options: VisualInitOptions): void {
            this.tooltip = this.matrix.append('div')
                .classed('c_tooltip', true)
                .html('');
            this.tooltip[0][0].onmouseover = function (e) {
            };
        }
        
        // Updates the legends and return the sums
        public updateLegends(dataSet): number {
            var sum = 0, index = 1;
            var self = this;
            this.groupLegends.html("");

            var title = this.groupLegends
                .append('div')
                .classed('title', true)
                .classed('text', true);

            for (var c in dataSet) {
                var div = this.groupLegends
                    .append('div')
                    .classed('legend leg-grp' + index, true);

                div.append('div')
                    .classed('category' + ' category-clr' + index, true);

                div.append('div').text(c.length <= 10 ? c : c.substr(0, 8) + '...')
                    .classed('text', true)
                    .attr('title', c);

                div[0][0]['cust_leg_ind'] = index;
                div[0][0]['cust_leg_name'] = c;
                div[0][0]['cust_leg_value'] = dataSet[c]['value'];

                sum += dataSet[c].value;
                index++;
            }
            return sum;
        }
        
        //Convertor Function       
        public static converter(dataView: DataView): BrickChartValues {
            var data: BrickChartValues = BrickChart.getDefaultData();

            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.values) {
                var legends = dataView.categorical.categories[0].values;
                var values = dataView.categorical.values[0].values;

                var dataSet = {};
                for (var i = 0; i < legends.length; i++) {
                    dataSet[legends[i]] = {};
                    dataSet[legends[i]]["value"] = values[i];
                    dataSet[legends[i]]["identity"] = (dataView.table['identity'] ? dataView.table.identity[i] : 0);
                }
                data.categories = dataSet;
            }
            return data;//Data object we are returning here to the update function
        }
        
        //Updates the zoom
        public updateZoom(options): void {
            var WIDTH = 211
                , HEIGHT = 211;
            var viewport = options.viewport;
            var height = viewport.height
                - (this.data && this.data['hasLegend'] ? this.rootElement.select(".legends")[0][0].offsetHeight : 0);
            var width = viewport.width;
            this.zoom = Math.min(width / WIDTH, height / HEIGHT);
            if (navigator.userAgent.indexOf('Firefox/') > 0)
                this.matrix.style('transform', 'Scale(' + this.zoom + ')');
            else
                this.matrix.style('zoom', this.zoom);
        }
        
        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            var dataView = this.dataView = options.dataViews[0];
            this.data = BrickChart.converter(dataView); //calling Converter function
            var dataSet = this.data.categories;
            var sum = this.updateLegends(dataSet);
                      
            //Assigning css color class to the squares
            var last = 0, category = 0;
            for (var legend in dataSet) {
                var cnt = Math.round(100 * (dataSet[legend].value / sum));
                category++;
                for (var index = 0; index < cnt; index++) {
                    if (index >= 100) break;
                    var row = Math.floor((last + index) / 10);
                    var col = (last + index) % 10;
                    if (!this.svgs[col + ':' + row]) { break; }
                    this.svgs[col + ':' + row].setAttribute("class", "linearSVG category-clr" + category);
                    this.svgs[col + ':' + row]["cust_leg_ind"] = category;
                    this.svgs[col + ':' + row]["cust_leg_name"] = legend;
                    this.svgs[col + ':' + row]["cust_leg_val"] = dataSet[legend]['value'];
                }
                last += cnt;
            }
            //Assigning class and storing the category names and corresponding values 
            for (var i = last; i < 100; i++) {
                var row = Math.floor((i) / 10);
                var col = (i) % 10;
                this.svgs[col + ':' + row].setAttribute("class", "linearSVG category-clr" + category);
                this.svgs[col + ':' + row]["cust_leg_ind"] = category;
                this.svgs[col + ':' + row]["cust_leg_name"] = legend;
                this.svgs[col + ':' + row]["cust_leg_val"] = (legend ? dataSet[legend]['value'] : 0);
            }

            var objects = null;
            if (options.dataViews[0] && options.dataViews[0].metadata && options.dataViews[0].metadata.objects) {
                objects = options.dataViews[0].metadata.objects

                this.data.hasLegend = DataViewObjects.getValue(objects, { objectName: 'legends', propertyName: 'show' }, this.data.hasLegend);
                this.data.legendTextSize = DataViewObjects.getValue(objects, { objectName: 'legends', propertyName: 'fontSize' }, this.data.legendTextSize);
                this.data.titleText = DataViewObjects.getValue(objects, { objectName: 'legends', propertyName: 'titleText' }, this.data.titleText);
                this.data.showTitle = DataViewObjects.getValue(objects, { objectName: 'legends', propertyName: 'showTitle' }, this.data.showTitle);
                this.data.labelColor = DataViewObjects.getFillColor(objects, { objectName: 'legends', propertyName: 'labelColor' }, this.data.labelColor);
                this.data.borderColor = DataViewObjects.getFillColor(objects, { objectName: 'general', propertyName: 'borderColor' }, this.data.borderColor);

                var ind = 0;
                for (var k in this.data.categories) {
                    var tmp = this.randColor[ind];
                    var clr = DataViewObjects.getFillColor(objects,
                        { objectName: 'dataPoint_' + ind, propertyName: k }, '');
                    ind++;
                }
            }        
            // hide/show legend information
            this.groupLegends.style('display', (this.data.hasLegend ? 'block' : 'none'));
            
            // update the legend font size / color
            this.rootElement.selectAll(".legends .text")
                .style({
                    'font-size': this.data.legendTextSize + 'px'
                    , 'color': this.data.labelColor
                });
            
            // update the legend title text and show/hide the legend title
            if ($(".brickchart_topContainer .category-clr1").length == 0) {
                this.data.showTitle = false;
            }
            this.rootElement.selectAll(".legends .title")
                .style('display', (this.data.showTitle ? 'inline-block' : 'none'))[0][0].innerHTML = this.data.titleText;
                
            //update the tooltip
            TooltipManager.addTooltip(this.matrix, (tooltipEvent: TooltipEvent) => this.toolTipInfo, true);//Adding visual tips
                        
            this.updateZoom(options);
            this.updateStyleColor();
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

                case 'legends':
                    enumeration.pushInstance({
                        objectName: 'legends',
                        displayName: 'legends',
                        selector: null,
                        properties: {
                            show: this.data.hasLegend,
                            fontSize: this.data.legendTextSize,
                            showTitle: this.data.showTitle,
                            titleText: this.data.titleText,
                            labelColor: this.data.labelColor
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
                legends: {
                    displayName: "Legend",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        showTitle: {
                            displayName: 'Legend Title',
                            description: data.createDisplayNameGetter('Visual_LegendShowTitleDescription'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: data.createDisplayNameGetter('Visual_LegendName'),
                            description: 'Legend title text',
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
