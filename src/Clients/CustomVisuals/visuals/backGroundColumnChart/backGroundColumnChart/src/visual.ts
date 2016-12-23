module powerbi.extensibility.visual {
    /**
     * Interface for viewmodel.
     *
     * @interface
     * @property {backGroundPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface backGroundModel {
        dataPoints: backGroundPoint[];
    };
    /**
     * Interface for data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface backGroundPoint {
        category: string;
        color: string;
        selectionId: ISelectionId;
    };
    /**
     * Interface for settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     */
    interface backGroundSettings {
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
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): backGroundModel {
        let dataViews = options.dataViews;
        let defaultSettings: backGroundSettings = {
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
        let backGroundPoints: backGroundPoint[] = [];
        let dataMax: number;
        let colorPalette: IColorPalette = createColorPalette(host.colors).reset();
        let objects = dataViews[0].metadata.objects;
        let backGroundSettings: backGroundSettings = {
            enableAxis: {
                show: getValue < boolean > (objects, 'enableAxis', 'show', defaultSettings.enableAxis.show),
            }
        }
        for (let iIterator = 0; iIterator < categorical.categories[0].values.length; iIterator++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(Object.getPrototypeOf(dataViews[0]).tree.root.children[iIterator].name).value
                }
            }
            backGroundPoints.push({
                category: Object.getPrototypeOf(dataViews[0]).tree.root.children[iIterator].name,
                color: getCategoricalObjectValue < Fill > (category, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, iIterator)
                    .createSelectionId()
            });
        }
        return {
            dataPoints: backGroundPoints
        };
    }
    export class Visual implements IVisual {
        private svg: d3.Selection < SVGElement > ;
        private renderMAQVisual: any;
        private xAxis: d3.Selection < SVGElement > ;
        private backGroundPoints: backGroundPoint[];
        private backGroundSettings: backGroundSettings;
        public dataView: DataView;
        private selectionManager: ISelectionManager;
        public host: IVisualHost;
        private target: HTMLElement;
        private chartmultibarDiv: any;
        private viewport: IViewport;
        private settings: any;
        private prevDataViewObjects: any = {};
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            this.target = options.element;
            let svg = this.svg = d3.select(options.element).append('div').classed('chartmultibarDiv', true);
            options.element.setAttribute("id", "chartmultibarDiv");
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
            document.getElementById('chartmultibarDiv').innerHTML = "";
            var dataView = options.dataViews[0];
            let viewModel: backGroundModel = visualTransform(options, this.host);
            if (!viewModel)
                return;
            this.backGroundPoints = viewModel.dataPoints;
            var dataView = options.dataViews[0];
            var settingsChanged = this.getSettings(dataView.metadata.objects);
            if (!this.chartmultibarDiv || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                this.chartmultibarDiv = myMAQlibrary(dataView, viewModel, this.settings);
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
                case 'BackGround':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'BackGround',
                        selector: null,
                        properties: {
                            FirstRow: this.settings.FirstRow,
                            SecondRow: this.settings.SecondRow,
                            ThirdRow: this.settings.ThirdRow,
                            FourthRow: this.settings.FourthRow,
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
                            yAxisDataLabelEnable: this.settings.yAxisDataLabelEnable,
                            yAXisDataLabels: this.settings.yAXisDataLabels,
                            yAXisDataLabelsColor: this.settings.yAXisDataLabelsColor
                        }
                    });
                    break;
                case 'colorSelector':
                    for (let backGroundPoint of this.backGroundPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: backGroundPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: backGroundPoint.color
                                    }
                                }
                            },
                            selector: backGroundPoint.selectionId.getSelector()
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
                    legendValues: getValue < boolean > (objects, 'Legend', 'legendValues', true),
                    enableLegendClick: getValue < boolean > (objects, 'Legend', 'enableLegendClick', true),
                    xAxisEnableLabels: getValue < boolean > (objects, 'XAxis', 'xAxisEnableLabels', true),
                    xAXisFontSize: getValue < number > (objects, 'XAxis', 'xAXisFontSize', 12),
                    yAxisEnableLabels: getValue < Fill > (objects, 'YAxis', 'yAxisEnableLabels', true),
                    yAXisFontSize: getValue < number > (objects, 'YAxis', 'yAXisFontSize', 12),
                    yAxisDataLabelEnable: getValue < Fill > (objects, 'YAxis', 'yAxisDataLabelEnable', true),
                    yAXisDataLabels: getValue < number > (objects, 'YAxis', 'yAXisDataLabels', 12),
                    yAXisDataLabelsColor: getValue < Fill > (objects, 'YAxis', 'yAXisDataLabelsColor', {
                        solid: {
                            color: "#000000"
                        }
                    }).solid.color,
                    FirstRow: getValue < Fill > (objects, 'BackGround', 'FirstRow', {
                        solid: {
                            color: "#F4F3F4"
                        }
                    }).solid.color,
                    SecondRow: getValue < Fill > (objects, 'BackGround', 'SecondRow', {
                        solid: {
                            color: "#F9DCDF"
                        }
                    }).solid.color,
                    ThirdRow: getValue < Fill > (objects, 'BackGround', 'ThirdRow', {
                        solid: {
                            color: "#FEF6E6"
                        }
                    }).solid.color,
                    FourthRow: getValue < Fill > (objects, 'BackGround', 'FourthRow', {
                        solid: {
                            color: "#E8F1DF"
                        }
                    }).solid.color
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }
}