
module powerbi.extensibility.visual {

    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    var legendValues = {};
    var legendValuesTorender = {};
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
	import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    var series = [];
    interface QuadrantChartViewModel {
        legendData: LegendData;
        dataPoints: QuadrantChartDataPoint[];
    };

    interface QuadrantChartDataPoint {
        category: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    };

    function findLegend(array, n, x) {
        var i;
        for (i = 0; i < n; i++) {
            if (array[i].name === x) {
                return i;
            }
        }
        return -1;
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): QuadrantChartViewModel {
        if (!options.dataViews)
            return;
        if (!options.dataViews[0])
            return;
        if (!options.dataViews[0].categorical)
            return;
        let dataViews = options.dataViews[0];
        let categorical: any;
        categorical = options.dataViews[0].categorical;
        let category: any;
        if(categorical.categories){
            category = categorical.categories[0];
        }
        else{
            category = categorical.values[0];
        }
        let QuadrantChartDataPoints: QuadrantChartDataPoint[] = [];
        let dataMax: number;
        let colorPalette: IColorPalette = host.colorPalette;
        let objects = options.dataViews[0];
        for (let iIterator = 0; iIterator < series.length; iIterator++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(series[iIterator].name).value
                }
            }
            QuadrantChartDataPoints.push({
                category: series[iIterator].name,
                color: getCategoricalObjectValue<Fill>(category, iIterator, 'legendColors', 'legendColor', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder().withCategory(category, iIterator).createSelectionId()
            });
        }
        return {
            legendData: context.getLegendData(dataViews, QuadrantChartDataPoints, host),
            dataPoints: QuadrantChartDataPoints
        };
    }

    export class QuadrantChart implements IVisual {
        private target: HTMLElement;
        private bubbleChartWithAxis: any;
        public host: IVisualHost;
        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        private settings: any;
        public dataView: any;
        private quadrantChartPoints: QuadrantChartDataPoint[];
        private selectionManager: ISelectionManager;
        private prevDataViewObjects: any = {}; // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        public groupLegends: d3.Selection<SVGElement>;
        private legendData;
        private currentViewport: IViewport;
        private rootElement;
        

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            this.rootElement = d3.select(options.element);
            let svg = this.svg = this.rootElement.append('div').classed('container', true);
            svg.attr("id", "container");
            var oElement: any = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select('.legend').style('top',0);
        }

        public getLegendData(dataView: DataView, QuadrantChartDataPoints: any, host:IVisualHost): LegendData {
            var SelectionId:powerbi.visuals.ISelectionId;
            var sTitle = "";
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0] && dataView.categorical.categories[0].source) {
                sTitle = dataView.categorical.categories[0].source.displayName;
            }
            var legendData: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: sTitle
            };
            for (var i = 0; i < QuadrantChartDataPoints.length; ++i) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    legendData.dataPoints.push({
                        label: QuadrantChartDataPoints[i].category,
                        color: QuadrantChartDataPoints[i].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                    });
                }
                legendValues[i] = QuadrantChartDataPoints[i].category;
            }
            return legendData;
        }

        public update(options: VisualUpdateOptions) {
            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            this.rootElement.select('.MAQChartsSvgRoot').remove();
            //document.getElementById('container').innerHTML = "";
            let width = options.viewport.width;
            let height = options.viewport.height;
            this.svg.attr({
                width: width,
                height: height
            });
            var skipFlag = 0;
            // Grab the dataview object
            if (!options.dataViews || 0 === options.dataViews.length || !options.dataViews[0].categorical)
                return;
            this.dataView = options.dataViews[0];
            //data binding:start
            var assignData = [-1, -1, -1, -1];
            var iCounter, jCounter;
            
            for (iCounter = 0; iCounter < this.dataView.categorical.values.length; iCounter++) {
                if (this.dataView.categorical.values[iCounter].source.roles.xAxis) {
                    assignData[0] = iCounter;
                }
                else if (this.dataView.categorical.values[iCounter].source.roles.yAxis) {
                    assignData[1] = iCounter;
                }
                else if (this.dataView.categorical.values[iCounter].source.roles.radialAxis) {
                    assignData[2] = iCounter;
                }
            }
            if(this.dataView.categorical.categories !== undefined)
            assignData[3] = 0;
           
            var dataViewObject = this.dataView.categorical;
            var isLegends = true, isRadius = true;
            if (-1 === assignData[0] || -1 === assignData[1]) {
                this.rootElement.select('.legend #legendGroup').selectAll('*').style('visibility','hidden');
                return;
            }
            else{
                this.rootElement.selectAll('.legend #legendGroup').selectAll('*').style('visibility','visible');
            }
            var legendNumbers = 0;
            //if the whole column is null
            var loopctr1 = 0, loopctr2 = 0, iColLength;
            iColLength = dataViewObject.values[assignData[0]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.values[assignData[0]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.values[assignData[0]].values[loopctr2] !== "") {
                    break;
                }
                loopctr2++;
            }
            if (loopctr1 === iColLength || loopctr2 === iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height })
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data for x-axis contain only null.");
                return;
            }
            //vacant the visual if x-axis contains negative values.
            loopctr = 0;
            while (loopctr < iColLength && (dataViewObject.values[assignData[0]].values[loopctr] === null || dataViewObject.values[assignData[0]].values[loopctr] === "" || (typeof (dataViewObject.values[assignData[0]].values[loopctr]) === 'number' && (dataViewObject.values[assignData[0]].values[loopctr] >= 0)))) {
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height })
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                return;
            }

            //check for all nulls in y-axis
            var loopctr1 = 0, loopctr2 = 0;
            iColLength = dataViewObject.values[assignData[1]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.values[assignData[1]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.values[assignData[1]].values[loopctr2] !== "") {
                    break;
                }
                loopctr2++;
            }
            if (loopctr1 === iColLength || loopctr2 === iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height })
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data for y-axis contain only null.");
                return;
            }
            //vacant the visual if y-axis contains negative values.
            loopctr = 0;
            while (loopctr < iColLength && (dataViewObject.values[assignData[1]].values[loopctr] === null || dataViewObject.values[assignData[1]].values[loopctr] === "" || (typeof (dataViewObject.values[assignData[1]].values[loopctr]) === 'number' && (dataViewObject.values[assignData[1]].values[loopctr] >= 0)))) {
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height })
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                return;
            }
            if (-1 === assignData[2]) {
                isRadius = false;
            }
            //if we have radius axis, check for negative numbers, or all nulls
            else {
                var loopctr = 0;
                //check for all null
                var loopctr1 = 0, loopctr2 = 0;
                iColLength = dataViewObject.values[assignData[2]].values.length;
                while (loopctr1 < iColLength) {
                    if (dataViewObject.values[assignData[2]].values[loopctr1] !== null) {
                        break;
                    }
                    loopctr1++;
                }
                while (loopctr2 < iColLength) {
                    if (dataViewObject.values[assignData[2]].values[loopctr2] !== "") {
                        break;
                    }
                    loopctr2++;
                }
                if (loopctr1 === iColLength || loopctr2 === iColLength) {
                    $("#container").removeAttr('style');
                    d3.select('#container').append('svg').attr({ "width": width, "height": height })
                    d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data for radius-axis contain only null.");
                    return;
                }
                //check for negative numbers
                loopctr = 0;
                while (loopctr < iColLength && (dataViewObject.values[assignData[2]].values[loopctr] === "" || dataViewObject.values[assignData[2]].values[loopctr] === null || (typeof (dataViewObject.values[assignData[2]].values[loopctr]) === 'number' && (dataViewObject.values[assignData[2]].values[loopctr] >= 0)))) {
                    loopctr++;
                }
                if (loopctr !== iColLength) {
                    $("#container").removeAttr('style');
                    d3.select('#container').append('svg').attr({ "width": width, "height": height })
                    d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                    return;
                }
            }

            
            if (-1 === assignData[3]) {
                isLegends = false;
            }
            //check for all nulls in legend-axis
            else {
                var loopctr1 = 0, loopctr2 = 0;
                iColLength = dataViewObject.categories[assignData[3]].values.length;
                while (loopctr1 < iColLength) {
                    if (dataViewObject.categories[assignData[3]].values[loopctr1] !== null) {
                        break;
                    }
                    loopctr1++;
                }
                while (loopctr2 < iColLength) {
                    if (dataViewObject.categories[assignData[3]].values[loopctr2] !== "") {
                        break;
                    }
                    loopctr2++;
                }
                if (loopctr1 === iColLength || loopctr2 === iColLength) {
                    $("#container").removeAttr('style');
                    d3.select('#container').append('svg').attr({ "width": width, "height": height })
                    d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data for legend-axis contain only null.");
                    return;
                }
            }
            loopctr = 0;
            var length1 = dataViewObject.values[assignData[0]].values.length; skipFlag = 0;
            while (loopctr < length1) {
                if (dataViewObject.values[assignData[0]].values[loopctr] === null || dataViewObject.values[assignData[0]].values[loopctr] === "" || dataViewObject.values[assignData[1]].values[loopctr] === null
                    || dataViewObject.values[assignData[1]].values[loopctr] === "" || (assignData[2] !== -1 && (dataViewObject.values[assignData[2]].values[loopctr] === null || dataViewObject.values[assignData[2]].values[loopctr] === "")) ||
                    (assignData[3] !== -1 && (dataViewObject.categories[assignData[3]].values[loopctr] === null || dataViewObject.categories[assignData[3]].values[loopctr] === ""))) {
                    skipFlag++;
                }
                loopctr++;
            }
            if (skipFlag === length1) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height });
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("No data available");
                return;
            }
            series = [];
            for (jCounter = 0; jCounter < dataViewObject.values[0].values.length; jCounter++) {
                var objSeries = {
                    "name": "",
                    "data": {
                        "scaleX": [],
                        "scaleY": [],
                        "radius": []
                    }
                };
                if (options.dataViews[0].categorical.categories !== undefined) {
                    if (dataViewObject.categories[0].values[jCounter] !== null && dataViewObject.categories[0].values[jCounter] !== "") {
                        var legendIndex = findLegend(series, legendNumbers, (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA'));

                        if (legendIndex === -1) {
                            objSeries.name = (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA');
                            series[legendNumbers] = objSeries;
                            legendIndex = legendNumbers;
                            legendNumbers++;
                        }
                        series[legendIndex].data.scaleX.push(dataViewObject.values[assignData[0]].values[jCounter]);
                        series[legendIndex].data.scaleY.push(dataViewObject.values[assignData[1]].values[jCounter]);
                        series[legendIndex].data.radius.push((isRadius ? dataViewObject.values[assignData[2]].values[jCounter] : 4));
                    }
                }
                else {
                    var legendIndex = findLegend(series, legendNumbers, (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA'));

                    if (legendIndex === -1) {
                        objSeries.name = (isLegends ? dataViewObject.categories[0].values[jCounter] : 'NA');
                        series[legendNumbers] = objSeries;
                        legendIndex = legendNumbers;
                        legendNumbers++;
                    }
                    series[legendIndex].data.scaleX.push(dataViewObject.values[assignData[0]].values[jCounter]);
                    series[legendIndex].data.scaleY.push(dataViewObject.values[assignData[1]].values[jCounter]);
                    series[legendIndex].data.radius.push((isRadius ? dataViewObject.values[assignData[2]].values[jCounter] : 4));

                }
            }
            var This = this;
            //data binding: end
            let viewModel: QuadrantChartViewModel = visualTransform(options, this.host, This);

            if (!viewModel)
                return;
            if (series.length <= 0) //Return if the query returns no rows.
            {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height })
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("No data available");
                return;
            }
            this.quadrantChartPoints = viewModel.dataPoints;
      
            var settingsChanged = this.getSettings(this.dataView.metadata.objects); // workaround because of sdk bug that doesn't notify when only style has changed
            
            this.renderLegend(viewModel);

            if (!this.bubbleChartWithAxis || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                this.bubbleChartWithAxis = MAQDrawChart(this.dataView, this.settings, viewModel, series, assignData, ValueFormatter, textMeasurementService);
            }

            this.addBubbleSelection(this.selectionManager, viewModel);    

            this.addLegendSelection();
            $('#legendGroup').on('click.load','.navArrow',function(){
                This.addLegendSelection();
            });

            this.rootElement
                .on('click', () => this.selectionManager.clear().then(() => this.rootElement.selectAll('.legendItem').attr('opacity', 1), this.rootElement.selectAll('svg .MAQCharts-plotArea circle').attr('opacity', 1)));
        }

        private addBubbleSelection(selectionManager, viewModel){
            var This = this;
            let bubbles = this.svg.selectAll('svg .MAQCharts-plotArea circle').data(viewModel.dataPoints);

            bubbles.on('click', function (d:any) {
                selectionManager.select(d.selectionId).then((ids: any[]) => {
                    function CompareIds(legendData) {
                        if (ids.length) {
                            if (legendData.identity.key == ids[0].key) {
                                return 1;
                            }
                            else {
                                return 0.5;
                            }
                        }
                        else {
                            return 1;
                        }
                    }
                    var legend: any = This.rootElement.selectAll('.legendItem');
                    legend.attr('opacity', (d) => {
                        return CompareIds(d);
                    })

                    bubbles.attr({
                        'opacity': ids.length > 0 ? 0.5 : 1
                    });
                    d3.select(this).attr({
                        'opacity': 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private addLegendSelection(){
            var This = this;
            var legends = this.rootElement.selectAll('.legendItem');
            var selectionManager = this.selectionManager;

            legends.on('click', function (d) {
                selectionManager.select(d.identity).then((ids: any[]) => {
                    function CompareIds(arcData) {
                        if (ids.length) {
                            if (arcData.selectionId.key == ids[0].key) {
                                return 1;
                            }
                            else {
                                return 0.5;
                            }
                        }
                        else {
                            return 1;
                        }
                    }
                    var arcs: any = This.rootElement.selectAll('svg .MAQCharts-plotArea circle');
                    arcs.attr('opacity', (d) => {
                        return CompareIds(d);
                    })
                    legends.attr({
                        'opacity': ids.length > 0 ? 0.5 : 1
                    });

                    d3.select(this).attr({
                        'opacity': 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        private renderLegend(viewModel: QuadrantChartViewModel): void {
            if (!viewModel || !viewModel.legendData)
                return;
            if (this.dataView && this.dataView.metadata)
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(this.dataView.metadata.objects, "legend", {});
            var legendData:LegendData = viewModel.legendData;
            var legendDataTorender: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: legendData.title
            };
            for (var j = 0; j < legendData.dataPoints.length; j++) {

                    legendDataTorender.dataPoints.push({
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                    legendValuesTorender[j] = legendValues[j];
            }
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                var position: string = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                if (position)
                    this.legend.changeOrientation(LegendPosition[position]);
            }
            this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case "legendColors":
                    for (let QuadrantChartPoint of this.quadrantChartPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: QuadrantChartPoint.category,
                            properties: {
                                legendColor: {
                                    solid: {
                                        color: QuadrantChartPoint.color
                                    }
                                }
                            },
                            selector: QuadrantChartPoint.selectionId.getSelector()
                        });
                    }
                    break;
                    
                case 'legend':
                    objectEnumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: this.settings.showLegend,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8)
                        }
                    });
                    break;
                case "quadrantNames":
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showQuadrants,
                            quadrant1: this.settings.quadrant1,
                            quadrant2: this.settings.quadrant2,
                            quadrant3: this.settings.quadrant3,
                            quadrant4: this.settings.quadrant4,
                            quadrantDivisionX: this.settings.quadrantDivisionX,
                            quadrantDivisionY: this.settings.quadrantDivisionY,
                            type: this.settings.type
                        },
                        selector: null
                    });
                    break;
                case "xAxis":
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showxAxis,
                            titleEnable: this.settings.showxAxisTitle,
                            titleText: this.settings.xTitleText,
                            label: this.settings.showxAxisLabel,
                            displayUnits: this.settings.xDisplayUnits,
                            textPrecision: this.settings.xTextPrecision
                        },
                        selector: null
                    });
                    break;
                case "yAxis":
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showyAxis,
                            titleEnable: this.settings.showyAxisTitle,
                            titleText: this.settings.yTitleText,
                            label: this.settings.showyAxisLabel,
                            displayUnits: this.settings.yDisplayUnits,
                            textPrecision: this.settings.yTextPrecision
                        },
                        selector: null
                    });
                    break;
            }
            return objectEnumeration;
        }

        public destroy(): void {
        }

        private getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    //Quadrant
                    showLegend: getValue<boolean>(objects, 'legend', 'show', true),
                    showQuadrants: getValue<boolean>(objects, 'quadrantNames', 'show', true),
                    type: getValue<boolean>(objects, 'quadrantNames', 'type', false),
                    quadrant1: getValue<string>(objects, 'quadrantNames', 'quadrant1', "Quadrant1"),
                    quadrant2: getValue<string>(objects, 'quadrantNames', 'quadrant2', "Quadrant2"),
                    quadrant3: getValue<string>(objects, 'quadrantNames', 'quadrant3', "Quadrant3"),
                    quadrant4: getValue<string>(objects, 'quadrantNames', 'quadrant4', "Quadrant4"),
                    //X-Axis and Y-Axis
                    showxAxis: getValue<boolean>(objects, 'xAxis', 'show', true),
                    showyAxis: getValue<boolean>(objects, 'yAxis', 'show', true),
                    showxAxisTitle: getValue<boolean>(objects, 'xAxis', 'titleEnable', true),
                    showyAxisTitle: getValue<boolean>(objects, 'yAxis', 'titleEnable', true),
                    showxAxisLabel: getValue<boolean>(objects, 'xAxis', 'label', true),
                    showyAxisLabel: getValue<boolean>(objects, 'yAxis', 'label', true),
                    xTitleText: getValue<string>(objects, 'xAxis', 'titleText', "X"),
                    yTitleText: getValue<string>(objects, 'yAxis', 'titleText', "Y"),
                    xDisplayUnits: getValue<number>(objects, 'xAxis', 'displayUnits', 0),
                    yDisplayUnits: getValue<number>(objects, 'yAxis', 'displayUnits', 0),
                    xTextPrecision: getValue<number>(objects, 'xAxis', 'textPrecision', 0) < 0 ? 0 : getValue<number>(objects, 'xAxis', 'textPrecision', 0) > 4 ? 4 : getValue<number>(objects, 'xAxis', 'textPrecision', 0),
                    yTextPrecision: getValue<number>(objects, 'yAxis', 'textPrecision', 0) < 0 ? 0 : getValue<number>(objects, 'yAxis', 'textPrecision', 0) > 4 ? 4 : getValue<number>(objects, 'yAxis', 'textPrecision', 0),
                    //Quadrant division lines
                    quadrantDivisionX: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionX', -1),
                    quadrantDivisionY: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionY', -1)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }
}