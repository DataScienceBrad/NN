module powerbi.extensibility.visual {

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    /* do not update*/
    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects)
                return defaultValue;

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object = <DataViewObject>objects[objectName];
                return object;
            }
            else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map = <DataViewObjectMap>objects[objectName];
                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill = getValue(objects, propertyId);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object)
                return defaultValue;

            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined)
                return defaultValue;

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }

    }
    // powerbi.extensibility.utils.formatting
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    /* do not update*/
    interface BarChartViewModel {
        dataPoints: BarChartDataPoint[];
        dataMax: number;
        fytarget: number;
        settings: BarChartSettings;
    };

    interface BarChartDataPoint {
        value: PrimitiveValue;
        ytd: PrimitiveValue;
        forecasted: PrimitiveValue;
        category: string;
        color: string;
        selectionId: ISelectionId;
    };

    interface BarChartSettings {
        enableAxis: {
            show: boolean;
        };
    }

    export var chartProperties = {
        zoneSettings: {
            zone1Value: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone1Value' },
            zone2Value: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone2Value' },
            zone1Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone1Color' },
            zone2Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone2Color' },
            zone3Color: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'zone3Color' },
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'zoneSettings', propertyName: 'defaultColor' }
        },
        yAxisConfig: {
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fill' },
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'decimalPlaces' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'displayUnits' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontSize' }
        },
        yTDConfig: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'show' },
            lineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'lineColor' },
            strokeSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yTDTarget', propertyName: 'strokeSize' }
        },
        fullTargetConfig: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'show' },
            lineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'lineColor' },
            strokeSize: <DataViewObjectPropertyIdentifier>{ objectName: 'fullYearTarget', propertyName: 'strokeSize' }
        }
    };

    export interface zoneSettings {
        zone1Value: number;
        zone2Value: number;
        zone1Color: string;
        zone2Color: string;
        zone3Color: string;
        defaultColor: string;
    };

    export interface yAxisSettings {
        fontColor: string;
        fontSize: number;
        decimalPlaces: number;
        displayUnits: number;
    };

    export interface TargetSettings {
        show: boolean;
        lineColor: string;
        strokeSize: number;
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): BarChartViewModel {
        let dataViews = options.dataViews;
        var zoneSettings: zoneSettings = context.getZoneSettings(dataViews[0]);
        let defaultSettings: BarChartSettings = {
            enableAxis: {
                show: false,
            }
        };
        let viewModel: BarChartViewModel = {
            dataPoints: [],
            dataMax: 0,
            fytarget: 0,
            settings: <BarChartSettings>{}
        };
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;

        //let formatTime = d3.time.format("%b %Y");
        let categorical = dataViews[0].categorical;
        context.setYtdTarget = 0;
        let category = null;
        let forecasted = null;
        for(var iCounter = 0; iCounter < categorical.categories.length; iCounter++){
            if(categorical.categories[iCounter].source.roles['category']){
                category = categorical.categories[iCounter];
            }else if(categorical.categories[iCounter].source.roles['forecasted']){
                forecasted = categorical.categories[iCounter];
            }
        }
        
        let dataValue = null;
        let fytarget = null
        let targetValue = null

        for(var iCounter = 0; iCounter < categorical.values.length; iCounter++){
            if(categorical.values[iCounter].source.roles['measure']){
                dataValue = categorical.values[iCounter];
            }else if(categorical.values[iCounter].source.roles['fytarget']){
                fytarget = categorical.values[iCounter].maxLocal;
            }
            else if(categorical.values[iCounter].source.roles['ytdtarget']){
                context.setYtdTarget = 1;
                targetValue = categorical.values[iCounter];
            }
        }

        let barChartDataPoints: BarChartDataPoint[] = [];
        let dataMax: number;

        //let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
        let barChartSettings: BarChartSettings = {
            enableAxis: {
                show: getValue<boolean>(objects, 'enableAxis', 'show', defaultSettings.enableAxis.show),
            }
        };

        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
            let defaultColor;
            if(targetValue){
                let colorValue = <number>dataValue.values[i] / <number>targetValue.values[i];
                if (colorValue < zoneSettings.zone1Value / 100) {
                    defaultColor = zoneSettings.zone1Color;
                }
                else if (colorValue < zoneSettings.zone2Value / 100)
                    defaultColor = zoneSettings.zone2Color;
                else {
                    defaultColor = zoneSettings.zone3Color;
                }
            }
            else{
                defaultColor = zoneSettings.defaultColor;
            }
            var formatter = ValueFormatter.create({ format: 'dddd\, MMMM %d\, yyyy' });

            barChartDataPoints.push({
                category: formatter.format(category.values[i]),
                forecasted: forecasted ? forecasted.values[i] : null,
                value: dataValue.values[i],
                ytd: targetValue ? targetValue.values[i] : null,
                color: defaultColor,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId()
            });
        }
        var yAxisHeight = 
        category.values.forEach(element => {
            let measureTextProperties: TextProperties = {
                text: category.values[element],
                fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                fontSize: "12px"
            };
            var yAxisWidth:number = textMeasurementService.measureSvgTextWidth(measureTextProperties);
        });

        dataMax = Math.max(<number>dataValue.maxLocal, <number>targetValue ? <number>targetValue.maxLocal : 0, <number>fytarget);

        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax,
            fytarget: <number>fytarget,
            settings: barChartSettings,
        };
    }

    export class BarChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private barChartContainer: d3.Selection<SVGElement>;
        private barContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private targetLines: d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        private barDataPoints: BarChartDataPoint[];
        private barChartSettings: BarChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private dataViews;
        private yAxisFormatter;
        private setYtdTarget: number;
        private baseDiv: d3.Selection<SVGElement>;
        private rootDiv: d3.Selection<SVGElement>;
        static config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.5,
            margins: {
                top: 0,
                right: 0,
                bottom: 90,
                left: 50,
            },
            xAxisFontMultiplier: 0.04,
        };
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.rootDiv = d3.select(options.element)
                .append('div')
                .classed('rootDiv',true)
            this.baseDiv = this.rootDiv
                .append('div')
                .classed('baseDiv',true)

            let svg = this.svg = this.baseDiv
                .append('svg')
                .classed('barChart', true);

            this.locale = options.host.locale;

            this.yAxis = svg.append('g')
                .classed('yAxis', true);

            this.xAxis = svg.append('g')
                .classed('xAxis', true);

            this.barContainer = svg.append('g')
                .classed('barContainer', true);

            this.targetLines = svg.append('g')
                .classed('targetLines', true);    

        }

        public update(options: VisualUpdateOptions) {
            var dataView = this.dataViews = options.dataViews[0];

            this.xAxis.selectAll('*').remove();
            this.yAxis.selectAll('*').remove();
            this.targetLines.selectAll('*').remove();
            this.svg.selectAll('.barContainer').selectAll('*').remove();

            if(options.viewport.height > 100){
                let viewModel: BarChartViewModel = visualTransform(options, this.host, this);
                let settings = this.barChartSettings = viewModel.settings;
                this.barDataPoints = viewModel.dataPoints;

                let width = options.viewport.width;
                let height = options.viewport.height;
                let yAxisConfig = this.getYAxisSettings(this.dataViews);
                let fullTargetConfig = this.getFullTargetSettings(this.dataViews);
                let yTDTargetConfig = this.getYTDSettings(this.dataViews);

                this.svg.attr({
                    width: width,
                    height: height
                });
                let margins = BarChart.config.margins;
                height -= margins.bottom;

                this.yAxisFormatter = valueFormatter.create({ format:options.dataViews[0].categorical.values[0].source.format, value: yAxisConfig.displayUnits, precision: yAxisConfig.decimalPlaces });
                let formattedMaxMeasure = this.yAxisFormatter.format(parseFloat(viewModel.dataMax + '') * 1.1);
                let measureTextProperties: TextProperties = {
                    text: formattedMaxMeasure,
                    fontFamily: "Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif",
                    fontSize: "12px"
                };
                var yAxisWidth:number = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                margins.left = yAxisWidth + 10;

                this.yAxis.style({
                    'stroke-width': '0.01em',
                    'fill': yAxisConfig.fontColor,
                });

                
                //X-scale
                let xScale = d3.scale.ordinal()
                    .domain(viewModel.dataPoints.map(d => d.category))
                    .rangeBands([margins.left, width], 0.2, 0.3);
                    
                let barWidths = xScale.rangeBand();
                let dynamicWidth;

                if(barWidths < 17){
                    dynamicWidth = width + (viewModel.dataPoints.length * (17 - barWidths));
                    xScale.rangeBands([margins.left, dynamicWidth], 0.2 , 0.3);
                    this.rootDiv.select('.baseDiv').style('width', dynamicWidth + 'px');
                    this.rootDiv.select('.barChart').style('width', dynamicWidth + 'px');
                }
                else{
                    if(barWidths >= 35){
                        height = height + 20;
                    }
                    dynamicWidth = width;
                    xScale.rangeBands([margins.left, dynamicWidth], 0.2 , 0.3);
                    this.rootDiv.select('.baseDiv').style('width',dynamicWidth+'px');
                    this.rootDiv.select('.barChart').style('width',dynamicWidth+'px');
                }

                //Y scale
                let yScale = d3.scale.linear()
                    .domain([0, viewModel.dataMax * 1.1])
                    .range([height, 10]);

                var xTargetAxis = this.targetLines.append('line')
                        .classed('xTargetAxis', true);

                if (fullTargetConfig.show && viewModel.fytarget) {
                    xTargetAxis.attr({
                        x1: margins.left,
                        y1: yScale(<number>viewModel.fytarget),
                        x2: dynamicWidth,
                        y2: yScale(<number>viewModel.fytarget),
                        stroke: fullTargetConfig.lineColor,
                        'stroke-width': fullTargetConfig.strokeSize,
                        })
                        .append('title')
                            .text(viewModel.fytarget);
                    
                    xTargetAxis.style("stroke-dasharray", "7,7");
                } else {
                    xTargetAxis.attr({
                        'stroke-width': 0,
                    });
                }

                //Format Y Axis labels and render Y Axis labels
                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickFormat(this.yAxisFormatter.format)
                    .ticks(options.viewport.height/80);

                this.yAxis.attr('transform', 'translate('+ margins.left +',0)')
                    .call(yAxis);

                this.yAxis.selectAll('path')
                    .style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '0px', 'shape-rendering': 'crispEdges' });

                //Draw Y Axis grid lines
                let yTicks: any = this.svg.selectAll('.yAxis .tick');
                yTicks.append('title')
                    .text((d)=>{
                        let formattedText = this.yAxisFormatter.format(d)
                        return formattedText;
                    });
                let tickLeng = yTicks.size();
                for (let i = 0; i < tickLeng; i++) {
                    let yCoordinate = yTicks[0][i].getAttribute('transform').substring(12, yTicks[0][i].getAttribute('transform').length - 1);
                    if (parseFloat(yCoordinate) !== (viewModel.fytarget && yScale(<number>viewModel.fytarget)) || !fullTargetConfig.show) {
                        this.yAxis.append('line')
                            .classed('yAxisGrid', true).attr({
                                x1: 0,
                                y1: yCoordinate,
                                x2: dynamicWidth,
                                y2: yCoordinate,
                                stroke: '#ccc',
                                'stroke-width': 0.5
                            })
                    }
                }

                let barData = [], barforecastedData = [];
                for (let i = 0, len = viewModel.dataPoints.length; i < len; i++) {
                    if (viewModel.dataPoints[i].forecasted != 1) {
                        barData.push(viewModel.dataPoints[i]);
                    }
                    else {
                        barforecastedData.push(viewModel.dataPoints[i]);
                    }
                }

                //bars
                let bars = this.barContainer.selectAll('.bar').data(barData);
                bars.enter()
                    .append('rect')
                    .classed('bar', true);
                bars.attr({
                    width: xScale.rangeBand(),
                    height: d => height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value),
                    y: d => yScale(<number>d.value),
                    x: d => xScale(d.category),
                    fill: d => d.color,
                });

                let barforecasted = this.barContainer.selectAll('.barforecasted').data(barforecastedData);
                barforecasted.enter()
                    .append('rect')
                    .classed('barforecasted', true);

                barforecasted.attr({
                    width: xScale.rangeBand(),
                    height: d => height - yScale(<number>d.value) < 0 ? 0 : height - yScale(<number>d.value),
                    y: d => yScale(<number>d.value),
                    x: d => xScale(d.category),
                    fill: d => d.color,
                    'fill-opacity': 0.5,
                    stroke: d => d.color,
                    'stroke-width': 1
                });
                this.barContainer.selectAll('.barforecasted').style("stroke-dasharray", "10,5");
                barforecasted.exit()
                    .remove();

                let lineDataPoints = [];
                for (let i = 0, len = viewModel.dataPoints.length; i < len; i++) {
                    if(viewModel.dataPoints[i].ytd){
                        lineDataPoints.push({
                            x1: xScale(viewModel.dataPoints[i].category) + (xScale.rangeBand() / 2),
                            y1: yScale(<number>viewModel.dataPoints[i].ytd)
                        });
                    }
                }
                let linePoints: string = "";
                for (let i = 0; i < lineDataPoints.length; i++) {
                    linePoints += lineDataPoints[i].x1 + "," + lineDataPoints[i].y1;
                    linePoints += " ";
                }

                var ytdLine = this.targetLines.append('polyline')
                    .classed('ytdLine', true);

                if (yTDTargetConfig.show) {
                    ytdLine.attr({
                        'stroke': yTDTargetConfig.lineColor,
                        'stroke-width': yTDTargetConfig.strokeSize,
                        'points': linePoints,
                        'fill': 'none'
                    });
                }
                else {
                    ytdLine.attr({
                        'stroke-width': 0
                    });
                }

                //X-axis
                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

                this.xAxis.attr('transform', 'translate(0, ' + height + ')')
                    .call(xAxis);


                this.xAxis.selectAll('path')
                    .style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '0px' });


                this.svg.selectAll('.xAxis .tick').append('title')
                    .text(function (d) {
                        return d.toString();
                    });
                
                if(barWidths < 35){
                    this.xAxis.attr('transform', 'translate(-10, ' + height + ')');
                    this.svg.selectAll('.xAxis .tick text')
                        .text(function (d) {
                            if (d.toString().length <= 13) {
                                return d.toString();
                            } else {
                                let textProperties: TextProperties = {
                                    text: d.toString(),
                                    fontFamily: "sans-serif",
                                    fontSize: "12px"
                                };
                                return textMeasurementService.getTailoredTextOrDefault(textProperties, 70)
                            }
                        })
                        .attr('transform', 'rotate(-45)')
                        .style("text-anchor", "end");
                }
                else{
                    var boxes:any = this.svg.selectAll('.barContainer rect');
                    if(boxes[0].length){
                        var barWidthValue = parseInt(boxes.attr('width'));
                        var xTicksLabels = this.svg.selectAll('.xAxis .tick text')[0];
                        var len = xTicksLabels.length-1;
                        while(len >= 0){
                            var xAxisLabel:any = xTicksLabels[len];
                            xAxisLabel.style.textAnchor = 'middle';
                            textMeasurementService.wordBreak(xAxisLabel, barWidthValue, 50);
                            len--;
                        }
                    }
                }
                
                this.tooltipServiceWrapper.addTooltip(this.barContainer.selectAll('.bar,.barforecasted'),
                    (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                    (tooltipEvent: TooltipEventArgs<number>) => null);

                let selectionManager = this.selectionManager;
                let allowInteractions = this.host.allowInteractions;

                // This must be an anonymous function instead of a lambda because
                // d3 uses 'this' as the reference to the element that was clicked.
                bars.on('click', function (d) {
                    // Allow selection only if the visual is rendered in a view that supports interactivity (e.g. Report)
                    if (allowInteractions) {
                        selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                            bars.attr({
                                'fill-opacity': ids.length > 0 ? BarChart.config.transparentOpacity : BarChart.config.solidOpacity
                            });

                            d3.select(this).attr({
                                'fill-opacity': BarChart.config.solidOpacity
                            });
                        });
                        (<Event>d3.event).stopPropagation();
                    }
                });
                bars.exit()
                    .remove();
            }
            this.svg.on('click',
                () => this.selectionManager.clear().then(() => this.svg.selectAll('.bar').attr('fill-opacity', 1)));
            
        }

        private getZoneSettings(dataView: DataView): zoneSettings {
            var objects: DataViewObjects = null;
            var zoneSetting: zoneSettings = this.getDefaultZoneSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return zoneSetting;

            objects = dataView.metadata.objects;
            zoneSetting.zone1Value = DataViewObjects.getValue(objects, chartProperties.zoneSettings.zone1Value, zoneSetting.zone1Value);
            zoneSetting.zone2Value = DataViewObjects.getValue(objects, chartProperties.zoneSettings.zone2Value, zoneSetting.zone2Value);
            zoneSetting.zone1Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone1Color, zoneSetting.zone1Color);
            zoneSetting.zone2Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone2Color, zoneSetting.zone2Color);
            zoneSetting.zone3Color = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.zone3Color, zoneSetting.zone3Color);
            zoneSetting.defaultColor = DataViewObjects.getFillColor(objects, chartProperties.zoneSettings.defaultColor, zoneSetting.defaultColor);
            return zoneSetting;
        }

        public getDefaultZoneSettings(): zoneSettings {
            return {
                defaultColor: '#01B8AA',
                zone1Value: 90,
                zone2Value: 101,
                zone1Color: '#fd625e',
                zone2Color: '#f5d33f',
                zone3Color: '#01b8aa'
            }
        }

        private getYAxisSettings(dataView: DataView): yAxisSettings {
            var objects: DataViewObjects = null;
            var yAxisSetting: yAxisSettings = this.getDefaultYAxisSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return yAxisSetting;

            objects = dataView.metadata.objects;
            yAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.yAxisConfig.fontColor, yAxisSetting.fontColor);
            yAxisSetting.fontSize = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.fontSize, yAxisSetting.fontSize);
            yAxisSetting.displayUnits = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.displayUnits, yAxisSetting.displayUnits);
            yAxisSetting.decimalPlaces = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.decimalPlaces, yAxisSetting.decimalPlaces);
            if (yAxisSetting.decimalPlaces > 4) {
                yAxisSetting.decimalPlaces = 4;
            } else if (yAxisSetting.decimalPlaces < 0) {
                yAxisSetting.decimalPlaces = 0;
            }
            return yAxisSetting;
        }

        public getDefaultYAxisSettings(): yAxisSettings {
            return {
                fontColor: "#000000",
                fontSize: 12,
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        private getYTDSettings(dataView: DataView): TargetSettings {
            var objects: DataViewObjects = null;
            var yTDSetting: TargetSettings = this.getDefaultTargetSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return yTDSetting;

            objects = dataView.metadata.objects;
            yTDSetting.show = DataViewObjects.getValue(objects, chartProperties.yTDConfig.show, yTDSetting.show);
            yTDSetting.lineColor = DataViewObjects.getFillColor(objects, chartProperties.yTDConfig.lineColor, yTDSetting.lineColor);
            yTDSetting.strokeSize = DataViewObjects.getValue(objects, chartProperties.yTDConfig.strokeSize, yTDSetting.strokeSize);
            if (yTDSetting.strokeSize > 5) {
                yTDSetting.strokeSize = 5;
            } else if (yTDSetting.strokeSize < 1) {
                yTDSetting.strokeSize = 1;
            }
            return yTDSetting;
        }

        private getFullTargetSettings(dataView: DataView): TargetSettings {
            var objects: DataViewObjects = null;
            var fullTargetSettings: TargetSettings = this.getDefaultTargetSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return fullTargetSettings;

            objects = dataView.metadata.objects;
            fullTargetSettings.show = DataViewObjects.getValue(objects, chartProperties.fullTargetConfig.show, fullTargetSettings.show);
            fullTargetSettings.lineColor = DataViewObjects.getFillColor(objects, chartProperties.fullTargetConfig.lineColor, fullTargetSettings.lineColor);
            fullTargetSettings.strokeSize = DataViewObjects.getValue(objects, chartProperties.fullTargetConfig.strokeSize, fullTargetSettings.strokeSize);

            if (fullTargetSettings.strokeSize > 5) {
                fullTargetSettings.strokeSize = 5;
            } else if (fullTargetSettings.strokeSize < 1) {
                fullTargetSettings.strokeSize = 1;
            }
            return fullTargetSettings;
        }

        public getDefaultTargetSettings(): TargetSettings {
            return {
                show: true,
                lineColor: '#000',
                strokeSize: 1
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var zoneSetting: zoneSettings = this.getZoneSettings(this.dataViews);
            var yAxisConfigs: yAxisSettings = this.getYAxisSettings(this.dataViews);
            var yTDConfigs: TargetSettings = this.getYTDSettings(this.dataViews);
            var fullYearConfigs: TargetSettings = this.getFullTargetSettings(this.dataViews);
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'yAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            fill: yAxisConfigs.fontColor,
                            displayUnits: yAxisConfigs.displayUnits,
                            decimalPlaces: yAxisConfigs.decimalPlaces
                        },
                        selector: null
                    });
                    break;

                case 'fullYearTarget':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: fullYearConfigs.show,
                            lineColor: fullYearConfigs.lineColor,
                            strokeSize: fullYearConfigs.strokeSize
                        },
                        selector: null
                    });
                    break;

                case 'yTDTarget':
                    if(this.setYtdTarget){
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                show: yTDConfigs.show,
                                lineColor: yTDConfigs.lineColor,
                                strokeSize: yTDConfigs.strokeSize
                            },
                            selector: null
                        });
                        break;
                    }

                case 'zoneSettings':
                    if(this.setYtdTarget){
                        objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            zone1Value: zoneSetting.zone1Value,
                            zone2Value: zoneSetting.zone2Value,
                            defaultColor: zoneSetting.defaultColor,
                            zone1Color: zoneSetting.zone1Color,
                            zone2Color: zoneSetting.zone2Color,
                            zone3Color: zoneSetting.zone3Color
                        },
                        selector: null
                    });
                    break;
                    }

            };

            return objectEnumeration;
        }

        public destroy(): void {
            // Perform any cleanup tasks here
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let language = getLocalizedString(this.locale, "LanguageKey");
            if(value.ytd){
                return [{
                    displayName: value.category,
                    value: value.value.toString()
                },
                {
                    displayName: 'YTD Target',
                    value: value.ytd.toString()
                }];
            }
            else{
                return [{
                    displayName: value.category,
                    value: this.yAxisFormatter.format(value.value)
                }];
            }

        }

    }
}
