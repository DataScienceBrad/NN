module powerbi.extensibility.visual {
    //Model	   
    import tooltip = powerbi.extensibility.utils.tooltip;
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface VisualDataLabelsSettingsOptions {
        show: boolean;
        enumeration: any;
        dataLabelsSettings: any;
        precision ? : boolean;
        fontSize ? : boolean;
        instances: any
    }
    export interface ProgressIndicatorValues {
        actual: number;
        target: number;
        ringWidth: number;
        actualColor: string;
        targetColor: string;
        isPie: boolean;
        toolTipInfo: TooltipDataItem[];
        actualFormat: string;
        targetFormat: string;
    }
    interface CardFormatSetting {
        showTitle: boolean;
        textSize: number;
        labelSettings: any;
        wordWrap: boolean;
    }
    //object variable which we used in customized color and text through UI options
    export var progressIndicatorProps = {
        general: {
            ActualFillColor: < DataViewObjectPropertyIdentifier > {
                objectName: 'general',
                propertyName: 'ActualFillColor'
            },
            ComparisonFillColor: < DataViewObjectPropertyIdentifier > {
                objectName: 'general',
                propertyName: 'ComparisonFillColor'
            },
        },
        custom: {
            show: {
                objectName: 'custom',
                propertyName: 'show'
            },
            ringWidth: {
                objectName: 'custom',
                propertyName: 'ringWidth'
            }
        },
        labels: {
            color: < DataViewObjectPropertyIdentifier > {
                objectName: 'labels',
                propertyName: 'colors'
            },
            labelPrecision: {
                objectName: 'labels',
                propertyName: 'labelPrecision'
            },
            fontSize: {
                objectName: 'labels',
                propertyName: 'fontSize'
            },
        },
    };
    //Visual
    export interface TooltipDataItem {
        displayName: string;
        value: string;
    }
    export class CircularGauge implements IVisual {
        //Variables 
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private svg: d3.Selection < SVGElement > ;
        private root: d3.Selection < SVGElement > ;
        private percentage: string;
        public canvas: d3.Selection < SVGElement > ;
        public group: d3.Selection < SVGElement > ;
        public groupInner: d3.Selection < SVGElement > ;
        public dataView: DataView;
        public data: ProgressIndicatorValues;
        private cardFormatSetting: CardFormatSetting;
        private container: d3.Selection < SVGElement > ;
        private host: IVisualHost;
        private prevDataViewObjects: any = {};
        private settings: any;
        public getDefaultFormatSettings(): CardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettings(true, this.settings, 0),
                wordWrap: false,
            };
        }
        public getDefaultLabelSettings(show, labelColor, labelPrecision) {
            var defaultLabelPrecision = 0;
            var defaultLabelColor = "#777777";
            if (show === void 0) {
                show = false;
            }
            var fontSize = 9;
            return {
                show: show,
                precision: labelPrecision || defaultLabelPrecision,
                labelColor: labelColor || defaultLabelColor,
                fontSize: fontSize,
            };
        }
        public static getDefaultData(): ProgressIndicatorValues {
            return {
                actual: 0,
                target: 100,
                ringWidth: 20,
                actualColor: '#374649',
                targetColor: '#01B8AA',
                isPie: true,
                toolTipInfo: [],
                actualFormat: '',
                targetFormat: '',
            };
        }
        //One time setup
        //First time it will be called and made the structure of your visual
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.svg = this.root.append('svg')
                .style('overflow', 'visible');
            this.container = this.svg.append('g');
            this.group = this.container.append('g');
            this.group.append('path').attr('id', 'a123');
            this.groupInner = this.container.append('g');
            this.groupInner.append('path').attr('id', 'a1234');
            this.groupInner.append('text');
            this.groupInner.append('line').attr('id', 'line1');
            this.groupInner.append('line').attr('id', 'line2');
        }
        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): ProgressIndicatorValues {
            var data: ProgressIndicatorValues = CircularGauge.getDefaultData();
            if (dataView && dataView.categorical) {
                if (dataView.metadata && dataView.table.rows[0].length == 2) {
                    if (dataView.metadata.columns[0].roles['ActualValue']) {
                        data.actual = < number > dataView.table.rows[0][0];
                        data.target = < number > dataView.table.rows[0][1];
                        data.actualFormat = ((dataView.metadata.columns[0].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                        data.targetFormat = ((dataView.metadata.columns[1].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    } else {
                        data.actual = < number > dataView.table.rows[0][1];
                        data.target = < number > dataView.table.rows[0][0];
                        data.actualFormat = ((dataView.metadata.columns[1].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                        data.targetFormat = ((dataView.metadata.columns[0].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                } else if (dataView.metadata && dataView.table.rows[0].length == 1) {
                    if (dataView.metadata.columns[0].roles['ActualValue']) {
                        data.actual = < number > dataView.table.rows[0][0];
                        data.target = data.actual;
                        data.actualFormat = ((dataView.metadata.columns[0].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    } else {
                        data.actual = 0;
                        data.target = < number > dataView.table.rows[0][0];
                        data.targetFormat = ((dataView.metadata.columns[0].format === '\\$#,0;(\\$#,0);\\$#,0') ? '$' : '');
                    }
                }
            }
            return data; //Data object we are returning here to the update function
        }
        //Drawing the visual	   
        public update(options: VisualUpdateOptions) {
            var dataView = this.dataView = options.dataViews[0];
            var data2 = this.data = CircularGauge.converter(dataView); //calling Converter function			            
            var data = data2.actual;
            var max = data2.target;
            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;
            let settingsChanged = this.getSettings(dataView.metadata.objects);
            this.svg.attr('width', width)
                .attr('height', height);
            this.cardFormatSetting = this.getDefaultFormatSettings();
            var labelSettings = null;
            var objects = null;
            if (this.dataView && this.dataView.metadata) {
                objects = this.dataView.metadata.objects;
            }
            if (objects) {
                labelSettings = this.cardFormatSetting.labelSettings;
                labelSettings.labelColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, progressIndicatorProps.labels.color, labelSettings.labelColor);
                labelSettings.precision = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, progressIndicatorProps.labels.labelPrecision, labelSettings.precision);
                // The precision can't go below 0
                if (labelSettings.precision != null) {
                    this.cardFormatSetting.labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                }
                this.data.actualColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, progressIndicatorProps.general.ActualFillColor, this.data.actualColor);
                this.data.targetColor = powerbi.extensibility.utils.dataview.DataViewObjects.getFillColor(objects, progressIndicatorProps.general.ComparisonFillColor, this.data.targetColor);
                this.data.isPie = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, progressIndicatorProps.custom.show, this.data.isPie);
                this.data.ringWidth = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, progressIndicatorProps.custom.ringWidth, this.data.ringWidth);
                this.cardFormatSetting.labelSettings.fontSize = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, progressIndicatorProps.labels.fontSize, labelSettings.fontSize);
            }
            var percentCompleted = (data / max);
            percentCompleted = isNaN(percentCompleted) || !isFinite(percentCompleted) ? 0 : (percentCompleted > 1) ? 1 : ((percentCompleted < 0) ? 0 : percentCompleted);
            this.cardFormatSetting.labelSettings.precision = this.cardFormatSetting.labelSettings.precision < 4 ? this.cardFormatSetting.labelSettings.precision : 4;
            if (this.cardFormatSetting.labelSettings.precision > 4) {
                this.cardFormatSetting.labelSettings.precision = 0;
            }
            this.settings.labelPrecision = this.cardFormatSetting.labelSettings.precision;
            var percentage = (percentCompleted * 100).toFixed(this.cardFormatSetting.labelSettings.precision);
            var fontSize = this.cardFormatSetting.labelSettings.fontSize;
            var textProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                text: percentage + '%',
                fontFamily: "sans-serif",
                fontSize: ((4 / 3) * fontSize) + 'px'
                //fontSize: fontSize + 'pt'
            };
            var textWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
            var textHeight = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextHeight(textProperties);
            var outerRadius = ((((width / 2) - (textWidth + 17)) < ((height / 2) - (textHeight)) ? ((width / 2) - (textWidth + 17)) : ((height / 2) - (textHeight))));
            outerRadius = outerRadius - (outerRadius * 0.1);
            var innerRadius;
            this.data.ringWidth = this.data.ringWidth < 15 ? 15 : this.data.ringWidth;
            innerRadius = outerRadius - this.data.ringWidth;
            var arc, arc1;
            if (innerRadius > 15) {
                if (!this.data.isPie) {
                    innerRadius = 0;
                }
                arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI);
                arc1 = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI * percentCompleted);
                this.group.select('#a123')
                    .attr('d', arc)
                    .attr('fill', this.data.actualColor);
                this.groupInner.select('#a1234')
                    .attr('d', arc1)
                    .attr('fill', this.data.targetColor);
                var c = arc1.centroid(2 * Math.PI),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);
                var y1;
                if (percentCompleted > 0.5)
                    y1 = (((y / h) * outerRadius * 1.1) + (textHeight / 3));
                else
                    y1 = ((y / h) * outerRadius * 1.1) + (textHeight / 3);
                this.groupInner
                    .select("text")
                    .attr('x', ((x / h) * outerRadius * 1.1) + 17)
                    .attr('y', y1)
                    .attr("text-anchor", "start")
                    .attr('font-size', fontSize + 'pt')
                    .text(percentage + "%")
                    .attr('fill', this.cardFormatSetting.labelSettings.labelColor);
                this.groupInner.select("line#line1")
                    .attr("x1", (x / h) * outerRadius * 1.02)
                    .attr("y1", (y / h) * outerRadius * 1.02)
                    .attr("x2", ((x / h) * outerRadius * 1.1))
                    .attr("y2", (y / h) * outerRadius * 1.1)
                    .attr('style', "stroke:#DDDDDD;stroke-width:1");
                this.groupInner.select("line#line2")
                    .attr("x1", (x / h) * outerRadius * 1.1)
                    .attr("y1", (y / h) * outerRadius * 1.1)
                    .attr("x2", ((x / h) * outerRadius * 1.1) + 15)
                    .attr("y2", (y / h) * outerRadius * 1.1)
                    .attr('style', "stroke:#DDDDDD;stroke-width:1");
                if (percentCompleted < 0.10 || percentCompleted > 0.90) {
                    this.groupInner.select("text").attr('x', ((x / h) * outerRadius * 1.1) + 39);
                    this.groupInner.select("line#line2").attr("x2", ((x / h) * outerRadius * 1.1) + 35);
                }
            } else {
                outerRadius = (width / 2) < (height / 2) ? width / 2 : height / 2;
                outerRadius = outerRadius - (outerRadius * 0.1);
                var innerRadius;
                if (this.data.isPie) {
                    this.data.ringWidth = this.data.ringWidth < 15 ? 15 : this.data.ringWidth;
                    innerRadius = outerRadius - this.data.ringWidth;
                } else {
                    innerRadius = 0;
                }
                arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI);
                arc1 = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(0)
                    .endAngle(2 * Math.PI * percentCompleted);
                this.groupInner
                    .select("text")
                    .attr('font-size', 0 + 'pt');
                this.groupInner.select("line#line1")
                    .attr('style', "stroke-width:0");
                this.groupInner.select("line#line2")
                    .attr('style', "stroke-width:0");
            }
            this.group.select('#a123')
                .attr('d', arc)
                .attr('fill', this.data.actualColor);
            this.groupInner.select('#a1234')
                .attr('d', arc1)
                .attr('fill', this.data.targetColor);
            this.group.attr('transform', 'translate(' + ((width / 2)) + ',' + ((height / 2)) + ')');
            this.groupInner.attr('transform', 'translate(' + ((width / 2)) + ',' + ((height / 2)) + ')');
            this.data.toolTipInfo[1] = {
                displayName: 'Actual',
                value: this.data.actualFormat + this.data.actual
            }
            this.data.toolTipInfo[0] = {
                displayName: 'Target',
                value: this.data.targetFormat + this.data.target
            }
            this.data.toolTipInfo[2] = {
                displayName: 'Percentage Remaining',
                value: (100 - parseFloat(percentage)) + '%'
            }
            this.tooltipServiceWrapper.addTooltip(this.container.selectAll('path#a123'),
                (tooltipEvent: TooltipEventArgs < number > ) => CircularGauge.getTooltipData(this.data.toolTipInfo[1].displayName, this.data.toolTipInfo[1].value, this.data.toolTipInfo[0].displayName, this.data.toolTipInfo[0].value, this.data.toolTipInfo[2].displayName, this.data.toolTipInfo[2].value),
                (tooltipEvent: TooltipEventArgs < number > ) => null);
            this.tooltipServiceWrapper.addTooltip(this.container.selectAll('path#a1234'),
                (tooltipEvent: TooltipEventArgs < number > ) => CircularGauge.getTooltipData(this.data.toolTipInfo[1].displayName, this.data.toolTipInfo[1].value, this.data.toolTipInfo[0].displayName, this.data.toolTipInfo[0].value, this.data.toolTipInfo[2].displayName, this.data.toolTipInfo[2].value),
                (tooltipEvent: TooltipEventArgs < number > ) => null);
        }
        private static getTooltipData(value: any, tab: any, avalue: any, atab: any, cvalue: any, ctab: any): VisualTooltipDataItem[] {
            return [{
                    displayName: value,
                    value: tab
                }, {
                    displayName: avalue,
                    value: atab
                },
                {
                    displayName: cvalue,
                    value: ctab
                }
            ];
        }
        public getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    colors: getValue < Fill > (objects, 'labels', 'colors', "grey"), // The color of the outer circle.
                    labelPrecision: getValue < number > (objects, 'labels', 'labelPrecision', 0),
                    fontSize: getValue < number > (objects, 'labels', 'fontSize', 15),
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI                
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            if (!this.data)
                this.data = CircularGauge.getDefaultData();
            if (!this.cardFormatSetting)
                this.cardFormatSetting = this.getDefaultFormatSettings();
            var formatSettings = this.cardFormatSetting;
            switch (options.objectName) {
                case 'general':
                    enumeration.push({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ActualFillColor: this.data.actualColor,
                            ComparisonFillColor: this.data.targetColor,
                        }
                    });
                    break;
                case 'custom':
                    enumeration.push({
                        objectName: "custom",
                        displayName: "Donut Chart",
                        selector: null,
                        properties: {
                            show: this.data.isPie,
                            ringWidth: this.data.ringWidth
                        }
                    });
                    break;
                case 'labels':
                    enumeration.push({
                        objectName: "labels",
                        displayName: "Data label",
                        selector: null,
                        properties: {
                            colors: this.settings.colors,
                            labelPrecision: this.settings.labelPrecision,
                            fontSize: this.settings.fontSize
                        }
                    });
                    break;
            }
            return enumeration;
        }
    }
}