module powerbi.extensibility.visual {
    var legendsEnable = {};
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    /**
     * Interface for LiftChart viewmodel.
     *
     * @interface
     * @property {LiftChartDataPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface LiftChartViewModel {
        dataPoints: LiftChartDataPoint[];
    };
    /**
     * Interface for LiftChart data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface LiftChartDataPoint {
        value: number;
        category: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    };
    /**
     * Interface for LiftChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     */
    interface liftChartSettings {
        enableAxis: {
            show: boolean;
        };
    }
    /**
     * Function that converts queried data into a view model that will be used by the visual.
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): LiftChartViewModel {
        let dataViews = options.dataViews;
        let defaultSettings: liftChartSettings = {
            enableAxis: {
                show: false,
            }
        };
        if (0 === dataViews.length)
            return;
        let categorical = dataViews[0].categorical;
        if (!dataViews[0].categorical || !categorical.categories || 0 === categorical.categories.length || !categorical.values || 0 === categorical.values.length)
            return;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];
        let LiftChartDataPoints: LiftChartDataPoint[] = [];
        let dataMax: number;
        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
        let liftChartSettings: liftChartSettings = {
            enableAxis: {
                show: getValue<boolean>(objects, 'enableAxis', 'show', defaultSettings.enableAxis.show),
            }
        }
        for (let iIterator = 0; iIterator < categorical.values.length; iIterator++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(categorical.values[iIterator].source.displayName).value
                }
            }
            LiftChartDataPoints.push({
                value: <number>dataValue.values[iIterator],
                category: <string>categorical.values[iIterator].source.displayName,
                color: <string>getCategoricalObjectValue<Fill>(category, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, iIterator)
                    .createSelectionId()
            });
        }
        if (Object.keys(legendsEnable).length == 0) {
            for (let iIterator = 0; iIterator < categorical.values.length; iIterator++) {
                legendsEnable[iIterator] = true;
            }
        }
        return {
            dataPoints: LiftChartDataPoints
        };
    }
    export class Visual implements IVisual {
        private svg: d3.Selection<SVGAElement>;
        private renderMAQVisual: any;
        private xAxis: d3.Selection<SVGAElement>;
        private liftChartPoints: LiftChartDataPoint[];
        private liftChartSettings: liftChartSettings;
        private LiftChart: any;
        public dataView: DataView;
        private selectionManager: ISelectionManager;
        public host: IVisualHost;
        private target: HTMLElement;
        private liftVisual: any;
        private viewport: IViewport;
        private settings: any;
        private prevDataViewObjects: any = {};
        public constructTypetwo: any;
        public constructTypefour: any;
        public valueFormatterForCategories: IValueFormatter;
        public static getLegendEnable() {
            return legendsEnable;
        }
        public static setLegendEnable(iCounter, total) {
            legendsEnable[iCounter] = total;
        }
        constructor(options: VisualConstructorOptions) {
            this.constructTypetwo = true;
            this.constructTypefour = false;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            this.target = options.element;
            let svg = this.svg = d3.select(options.element).append('div').classed('liftVisual', true);
            options.element.setAttribute("id", "liftVisual");
        }
        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) {
            let UpdateLoad = true;
            var tragicPragic = false;
            let viewPort = options.viewport;
            if (this.constructTypefour) {
                tragicPragic = true;
            }
            if (this.constructTypetwo === true) {
                this.constructTypetwo = false;
                this.constructTypefour = true;
                UpdateLoad = false;
            }
            if (!options.dataViews || 0 === options.dataViews.length || !options.dataViews[0].table) {
                return;
            }
            document.getElementById('liftVisual').innerHTML = "";
            var dataView = options.dataViews[0];
            let viewModel: LiftChartViewModel = visualTransform(options, this.host);
            if (!viewModel)
                return;
            this.liftChartPoints = viewModel.dataPoints;
            var dataView = options.dataViews[0];
            var formattedDataView;
            var settingsChanged = this.getSettings(dataView.metadata.objects);
            if (!this.liftVisual || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                if (options.dataViews[0].table.rows.length > 1) {
                    this.liftVisual = myMAQlibrary(dataView, viewModel, this.settings, tragicPragic, UpdateLoad, valueFormatter, viewPort);
                }
                else {
                    d3.select('#liftVisual').append('p').text("No data available to plot an intersection").style("margin-left", (options.viewport.width / 2 - options.viewport.width / 15) + 'px').style("margin-top", (options.viewport.height / 2 - options.viewport.height / 15) + 'px');
                }
            }
        }
        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case "Legend":
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            legendValues: this.settings.legendValues,
                            enableLegendClick: this.settings.enableLegendClick
                        }
                    });
                    break;
                case 'Line':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Line',
                        selector: null,
                        properties: {
                            enableStepLine: this.settings.enableStepLine,
                            enableMarker: this.settings.enableMarker,
                            markerWidth: this.settings.markerWidth,
                            lineWidth: this.settings.lineWidth
                        }
                    });
                    break;
                case 'Lift':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Lift',
                        selector: null,
                        properties: {
                            dragWindowWidth: this.settings.dragWindowWidth,
                            dragLineColor: this.settings.dragLineColor,
                            dragLineWidth: this.settings.dragLineWidth,
                            bubbleText: this.settings.bubbleText,
                            bubbleSize: this.settings.bubbleSize,
                        }
                    });
                    break;
                case 'XAxis':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'X Axis',
                        selector: null,
                        properties: {
                            xAxisEnableLabels: this.settings.xAxisEnableLabels,
                            xAXisFontSize: this.settings.xAXisFontSize,
                            xAxisGridLineColor: this.settings.xAxisGridLineColor,
                            xAxisGridLineWidth: this.settings.xAxisGridLineWidth
                        }
                    });
                    break;
                case 'YAxis':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Y Axis',
                        selector: null,
                        properties: {
                            yAxisEnableLabels: this.settings.yAxisEnableLabels,
                            yAXisFontSize: this.settings.yAXisFontSize,
                            yAxisGridLineColor: this.settings.yAxisGridLineColor,
                            yAxisGridLineWidth: this.settings.yAxisGridLineWidth
                        }
                    });
                    break;
                case 'colorSelector':
                    for (let liftChartPoint of this.liftChartPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: liftChartPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: liftChartPoint.color
                                    }
                                }
                            },
                            selector: liftChartPoint.selectionId.getSelector()
                        });
                    }
                    break;
            };
            return objectEnumeration;
        }
        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }
        private getSettings(objects: DataViewObjects): boolean {
            let settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    legendValues: getValue<boolean>(objects, 'Legend', 'legendValues', true),
                    enableLegendClick: getValue<boolean>(objects, 'Legend', 'enableLegendClick', true),
                    enableStepLine: getValue<boolean>(objects, 'Line', 'enableStepLine', true),
                    enableMarker: getValue<boolean>(objects, 'Line', 'enableMarker', true),
                    markerWidth: getValue<number>(objects, 'Line', 'markerWidth', 100),
                    lineWidth: getValue<number>(objects, 'Line', 'lineWidth', 15),
                    dragLineColor: getValue<Fill>(objects, 'Lift', 'dragLineColor', {
                        solid: {
                            color: "#000000"
                        }
                    }).solid.color,
                    dragWindowWidth: getValue<number>(objects, 'Lift', 'dragWindowWidth', 10),

                    dragLineWidth: getValue<number>(objects, 'Lift', 'dragLineWidth', 9),
                    bubbleText: getValue<Fill>(objects, 'Lift', 'bubbleText', {
                        solid: {
                            color: "#ffffff"
                        }
                    }).solid.color,
                    bubbleSize: getValue<number>(objects, 'Lift', 'bubbleSize', 80),
                    xAxisEnableLabels: getValue<boolean>(objects, 'XAxis', 'xAxisEnableLabels', true),
                    xAXisFontSize: getValue<number>(objects, 'XAxis', 'xAXisFontSize', 57),
                    xAxisGridLineColor: getValue<Fill>(objects, 'XAxis', 'xAxisGridLineColor', {
                        solid: {
                            color: "#ffffff"
                        }
                    }).solid.color,
                    xAxisGridLineWidth: getValue<number>(objects, 'XAxis', 'xAxisGridLineWidth', 0),
                    yAxisEnableLabels: getValue<Fill>(objects, 'YAxis', 'yAxisEnableLabels', true),
                    yAXisFontSize: getValue<number>(objects, 'YAxis', 'yAXisFontSize', 30),
                    yAxisGridLineColor: getValue<Fill>(objects, 'YAxis', 'yAxisGridLineColor', {
                        solid: {
                            color: "#000000"
                        }
                    }).solid.color,
                    yAxisGridLineWidth: getValue<number>(objects, 'YAxis', 'yAxisGridLineWidth', 20)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }
}