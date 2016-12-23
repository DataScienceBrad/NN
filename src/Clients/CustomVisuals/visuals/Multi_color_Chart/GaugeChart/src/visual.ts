/// <amd-dependency path='liquidFillGauge'>
module powerbi.extensibility.visual {
    /*
       /**
         * Interface for LiftChart viewmodel.
         *
         * @interface
         * @property {LiftChartDataPoint[]} dataPoints - Set of data points the visual will render.
         * @property {number} dataMax                 - Maximum data value in the set of data points.
         */
    interface GaugeChartViewModel {
        dataPoints: GaugeChartDataPoint[];
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
    interface GaugeChartDataPoint {
        value: number;
        category: string;
        color: string;
        selectionId: ISelectionId;
    };
    /**
     * Interface for LiftChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     */
    /**
        * Function that converts queried data into a view model that will be used by the visual.
        *
        * @function
        * @param {VisualUpdateOptions} options - Contains references to the size of the container
        *                                        and the dataView which contains all the data
        *                                        the visual had queried.
        * @param {IVisualHost} host            - Contains references to the host which contains services
        */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): GaugeChartViewModel {
        if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].categorical)
            return;
        let dataViews = options.dataViews;
        let categorical = options.dataViews[0].categorical;
        let category = categorical.categories[0];
        let GaugeChartDataPoints: GaugeChartDataPoint[] = [];
        let dataMax: number;
        let colorPalette: IColorPalette = createColorPalette(host.colors).reset();
        var dataViewObject = Object.getPrototypeOf(dataViews[0]);
        var assignData = [0, 1];
        if (dataViews[0].metadata.columns[0].roles["measure"] && dataViewObject.categorical.categories[1]) {
            assignData[0] = 1; assignData[1] = 0;
        }
        for (let iIterator = 0; iIterator < dataViewObject.categorical.categories[assignData[0]].values.length; iIterator++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(dataViewObject.categorical.categories[assignData[0]].values[iIterator]).value
                }
            }
            GaugeChartDataPoints.push({
                category: dataViewObject.categorical.categories[assignData[0]].values[iIterator],
                value: dataViewObject.categorical.categories[assignData[1]] ? dataViewObject.categorical.categories[assignData[1]].values[iIterator]: 0,
                color: getCategoricalObjectValue<Fill>(category, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, iIterator)
                    .createSelectionId()
            });
        }
        return {
            dataPoints: GaugeChartDataPoints
        };
    }
    export class Visual implements IVisual {
        private GaugeChartPoint: any;
        private target: HTMLElement;
        private gauge: any;
        public host: IVisualHost;
        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        private settings: any;
        public dataView: DataView;
        private gaugeChartPoints: GaugeChartDataPoint[];
        private renderMAQVisual: any;
        private xAxis: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
        private prevDataViewObjects: any = {}; // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            let svg = this.svg = d3.select(options.element).append('div').classed('gaugeChart', true);
            options.element.setAttribute("id", "gaugeChart");
        }
        @logExceptions()
        public update(options: VisualUpdateOptions) {
            if (!options.viewport)
                return;
            document.getElementById('gaugeChart').innerHTML = "";
            if (0 === options.dataViews.length)
                return;
                
            var dataView = options.dataViews[0];
            var roles = {
                    "category": -1,
                    "measure": -1
                }
            var obj, data = [], jCount, iCount, keys;
            for(iCount = 0;iCount<dataView.metadata.columns.length;iCount++){
                keys = Object.keys(dataView.metadata.columns[iCount].roles);
                for(jCount=0;jCount<keys.length;jCount++){
                    roles[keys[jCount]] = iCount;
                }
            }
            if (-1 == roles.category || -1 === roles.measure)
                return;
            let width = options.viewport.width;
            let height = options.viewport.height;
            var dataView = options.dataViews[0];
            let viewModel: GaugeChartViewModel = visualTransform(options, this.host);
            if (!viewModel)
                return;
            this.gaugeChartPoints = viewModel.dataPoints;
            this.svg.attr({
                width: width,
                height: height
            });
            // Grab the dataview object
            if (options.dataViews && options.dataViews[0] && options.dataViews[0].tree.root.children) {
                var dataView = options.dataViews[0];
                let viewModel: GaugeChartViewModel = visualTransform(options, this.host);
                if (!viewModel)
                    return;
                var settingsChanged = this.getSettings(dataView.metadata.objects); // workaround because of sdk bug that doesn't notify when only style has changed
                if (dataView.metadata.columns.length < 2)
                    return;
                if (!this.gauge || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                    this.svg.selectAll("*").remove();
                    this.gauge = MAQDrawChart(dataView, this.settings, viewModel);
                } else {
                    // This means we have a gauge and the only thing that changed was the data.
                    this.gauge.update(dataView.single.value)
                }
            }
            else {
                return;
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
                case "colorSelector":
                    for (let GaugeChartPoint of this.gaugeChartPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: GaugeChartPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: GaugeChartPoint.color
                                    }
                                }
                            },
                            selector: GaugeChartPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case "RangeValues":
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            LabelColor: { solid: { color: this.settings.LabelColor } }
                        },
                        selector: null
                    });
                    break;
            }
            return objectEnumeration;
        }
        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }
        // Reads in settings values from the DataViewObjects and returns a settings object that the liquidFillGauge library understands
        @logExceptions()
        private getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    legendValues: getValue<string>(objects, 'Legend', 'legendValues', "Awareness:10,Knowledge:20,Liking:40,Preference:60,Conviction:80,Purchase:100"),
                    //Min and max value
                    gaugeMinVal: 0,
                    gaugeMaxVal: 0,
                    //Pointer
                    gaugeTarget: 0,
                    gaugeTargetHeight: 0,
                    gaugeTargetWidth: 0,
                    TargetColor: 'transparent',
                    //Label
                    LabelColor: getValue<Fill>(objects, 'RangeValues', 'LabelColor', { solid: { color: "#707070" } }).solid.color
                    // Legendfill: getValue<Fill>(objects, 'ColorSelector', 'Legendfill', { solid: { color: "red" } }).solid.color
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