
module powerbi.extensibility.visual {
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    var series = [];
    interface QuadrantChartViewModel {
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
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): QuadrantChartViewModel {
        if (!options.dataViews)
            return;
        if (!options.dataViews[0])
            return;
        if (!options.dataViews[0].categorical)
            return;
        let dataViews = options.dataViews;
        let categorical: any;
        categorical = options.dataViews[0].categorical;
        let category: any;
        category = categorical.categories[0];
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
        private static maxRadius: number;
        private static minRadius: number;
        private prevDataViewObjects: any = {}; // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            let svg = this.svg = d3.select(options.element).append('div').classed('container', true);
            options.element.setAttribute("id", "container");
        }
        @logExceptions()
        public update(options: VisualUpdateOptions) {
            document.getElementById('container').innerHTML = "";
            let width = options.viewport.width;
            let height = options.viewport.height;
            this.svg.attr({
                width: width,
                height: height
            });
            var skipFlag = 0;
            // Grab the dataview object
            if (!options.dataViews || 0 === options.dataViews.length || !options.dataViews[0].categorical) {
                return;
            }
            this.dataView = options.dataViews[0];
            //data binding:start
            var assignData = [-1, -1, -1, -1];
            var iCounter, jCounter;
            for (iCounter = 0; iCounter < this.dataView.metadata.columns.length; iCounter++) {
                if (this.dataView.metadata.columns[iCounter].roles.xAxis) {
                    assignData[0] = iCounter;
                }
                else if (this.dataView.metadata.columns[iCounter].roles.yAxis) {
                    assignData[1] = iCounter;
                }
                else if (this.dataView.metadata.columns[iCounter].roles.radialAxis) {
                    assignData[2] = iCounter;
                }
                else if (this.dataView.metadata.columns[iCounter].roles.legendAxis) {
                    assignData[3] = iCounter;
                }
            }
            if (-1 === assignData[0] || -1 === assignData[1]) {
                return;
            }
            var dataViewObject = Object.getPrototypeOf(this.dataView.categorical);
            var isLegends = true, isRadius = true;

            //if the whole x-axis column is null
            var loopctr1 = 0, loopctr2 = 0;
            var iColLength;
            iColLength = dataViewObject.categories[assignData[0]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.categories[assignData[0]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.categories[assignData[0]].values[loopctr2] !== "") {
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

            //check for data types other than number for x-axis
            loopctr = 0;
            while (loopctr < iColLength) {
                if (dataViewObject.categories[assignData[0]].values[loopctr] !== null && dataViewObject.categories[assignData[0]].values[loopctr] !== "" && typeof (dataViewObject.categories[assignData[0]].values[loopctr]) !== 'number') {
                    break;
                }
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height });
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                return;
            }


            //check for all nulls in y-axis
            var loopctr1 = 0, loopctr2 = 0;
            iColLength = dataViewObject.categories[assignData[1]].values.length;
            while (loopctr1 < iColLength) {
                if (dataViewObject.categories[assignData[1]].values[loopctr1] !== null) {
                    break;
                }
                loopctr1++;
            }
            while (loopctr2 < iColLength) {
                if (dataViewObject.categories[assignData[1]].values[loopctr2] !== "") {
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
            //check for data types other than number for y-axis
            loopctr = 0;
            while (loopctr < iColLength) {
                if (dataViewObject.categories[assignData[1]].values[loopctr] !== null && dataViewObject.categories[assignData[1]].values[loopctr] !== "" && typeof (dataViewObject.categories[assignData[1]].values[loopctr]) !== 'number') {
                    break;
                }
                loopctr++;
            }
            if (loopctr !== iColLength) {
                $("#container").removeAttr('style');
                d3.select('#container').append('svg').attr({ "width": width, "height": height });
                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                return;
            }

            //for radius-axis
            if (-1 === assignData[2]) {
                isRadius = false;
            }
            //if we have radius axis, check for all nulls
            else {
                var loopctr = 0;
                //check for all null
                var loopctr1 = 0, loopctr2 = 0;
                iColLength = dataViewObject.categories[assignData[2]].values.length;
                while (loopctr1 < iColLength) {
                    if (dataViewObject.categories[assignData[2]].values[loopctr1] !== null) {
                        break;
                    }
                    loopctr1++;
                }
                while (loopctr2 < iColLength) {
                    if (dataViewObject.categories[assignData[2]].values[loopctr2] !== "") {
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
                loopctr = 0;
                while (loopctr < iColLength) {
                    if (dataViewObject.categories[assignData[2]].values[loopctr] !== null && dataViewObject.categories[assignData[2]].values[loopctr] !== "" && typeof (dataViewObject.categories[assignData[2]].values[loopctr]) !== 'number') {
                        break;
                    }
                    loopctr++;
                }
                if (loopctr !== iColLength) {
                    $("#container").removeAttr('style');
                    d3.select('#container').append('svg').attr({ "width": width, "height": height });
                    d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data not supported");
                    return;
                }
            }
            //check for data types other than number for radius-axis


            var legendNumbers = 0;
            //legend-axis
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
            var length1 = dataViewObject.categories[assignData[0]].values.length; skipFlag = 0;
            while (loopctr < length1) {
                if (dataViewObject.categories[assignData[0]].values[loopctr] === null || dataViewObject.categories[assignData[1]].values[loopctr] === null || (assignData[2] !== -1 && dataViewObject.categories[assignData[2]].values[loopctr] === null) || (assignData[3] !== -1 && dataViewObject.categories[assignData[3]].values[loopctr] === null)) {
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
            for (jCounter = 0; jCounter < dataViewObject.categories[0].values.length; jCounter++) {
                var objSeries = {
                    "name": "",
                    "data": {
                        "scaleX": [],
                        "scaleY": [],
                        "radius": []
                    }
                };
                if (assignData[3] !== -1) {

                    if (dataViewObject.categories[assignData[3]].values[jCounter] !== null && dataViewObject.categories[assignData[3]].values[jCounter] !== "" && (dataViewObject.categories[assignData[0]].values[jCounter] !== null && dataViewObject.categories[assignData[0]].values[jCounter] !== "" &&
                        dataViewObject.categories[assignData[1]].values[jCounter] !== null && dataViewObject.categories[assignData[1]].values[jCounter] !== "") && ((assignData[2] === -1 || (dataViewObject.categories[assignData[2]].values[jCounter] !== null && dataViewObject.categories[assignData[2]].values[jCounter] !== "")))) {
                        var legendIndex = findLegend(series, legendNumbers, (isLegends ? dataViewObject.categories[assignData[3]].values[jCounter] : 'NA'));
                        if (legendIndex === -1) {
                            objSeries.name = (isLegends ? dataViewObject.categories[assignData[3]].values[jCounter] : 'NA');
                            series[legendNumbers] = objSeries;
                            legendIndex = legendNumbers;
                            legendNumbers++;
                        }
                        series[legendIndex].data.scaleX.push(dataViewObject.categories[assignData[0]].values[jCounter]);
                        series[legendIndex].data.scaleY.push(dataViewObject.categories[assignData[1]].values[jCounter]);
                        series[legendIndex].data.radius.push((isRadius ? dataViewObject.categories[assignData[2]].values[jCounter] : 4));
                        if (assignData[2] !== -1) {
                            if (QuadrantChart.maxRadius === undefined || dataViewObject.categories[assignData[2]].values[jCounter] > QuadrantChart.maxRadius) {
                                QuadrantChart.maxRadius = dataViewObject.categories[assignData[2]].values[jCounter];
                            }
                            if (QuadrantChart.minRadius === undefined || dataViewObject.categories[assignData[2]].values[jCounter] < QuadrantChart.minRadius) {
                                QuadrantChart.minRadius = dataViewObject.categories[assignData[2]].values[jCounter];
                            }
                        }
                    }
                }
                else {
                    var legendIndex = findLegend(series, legendNumbers, (isLegends ? dataViewObject.categories[assignData[3]].values[jCounter] : 'NA'));

                    if (legendIndex === -1) {
                        objSeries.name = (isLegends ? dataViewObject.categories[assignData[3]].values[jCounter] : 'NA');
                        series[legendNumbers] = objSeries;
                        legendIndex = legendNumbers;
                        legendNumbers++;
                    }
                    series[legendIndex].data.scaleX.push(dataViewObject.categories[assignData[0]].values[jCounter]);
                    series[legendIndex].data.scaleY.push(dataViewObject.categories[assignData[1]].values[jCounter]);
                    series[legendIndex].data.radius.push((isRadius ? dataViewObject.categories[assignData[2]].values[jCounter] : 4));
                    if (assignData[2] !== -1) {
                        if (QuadrantChart.maxRadius === undefined || dataViewObject.categories[assignData[2]].values[jCounter] > QuadrantChart.maxRadius) {
                            QuadrantChart.maxRadius = dataViewObject.categories[assignData[2]].values[jCounter];
                        }
                        if (QuadrantChart.minRadius === undefined || dataViewObject.categories[assignData[2]].values[jCounter] < QuadrantChart.minRadius) {
                            QuadrantChart.minRadius = dataViewObject.categories[assignData[2]].values[jCounter];
                        }
                    }
                }
            }
            if (assignData[2] === -1) {
                QuadrantChart.maxRadius = 1;
                QuadrantChart.minRadius = 1;
            }
            //data binding: end
            let viewModel: QuadrantChartViewModel = visualTransform(options, this.host);
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
            if (!this.bubbleChartWithAxis || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {

                this.svg.selectAll("*").remove();
                this.bubbleChartWithAxis = MAQDrawChart(this.dataView, this.settings, viewModel, series, assignData, ValueFormatter, QuadrantChart.maxRadius, QuadrantChart.minRadius);
            }

        }

        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        @logExceptions()
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
                            quadrantDivisionY: this.settings.quadrantDivisionY
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
                            label: this.settings.showxAxisLabel
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
                            label: this.settings.showyAxisLabel
                        },
                        selector: null
                    });
                    break;
            }
            return objectEnumeration;
        }

        public destroy(): void {
        }

        @logExceptions()
        private getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    //Quadrant
                    showQuadrants: getValue<boolean>(objects, 'quadrantNames', 'show', true),
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
                    //Quadrant division lines
                    quadrantDivisionX: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionX', undefined),
                    quadrantDivisionY: getValue<number>(objects, 'quadrantNames', 'quadrantDivisionY', undefined)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }

    export function logExceptions(): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
            : TypedPropertyDescriptor<Function> {

            return {
                value: function () {
                    try {
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }
            }
        }
    }
}