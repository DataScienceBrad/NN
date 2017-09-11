module powerbi.extensibility.visual {

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    export class Grid implements IVisual {
        private svg: d3.Selection<SVGAElement>;
        private renderMAQVisual: any;
        private xAxis: d3.Selection<SVGAElement>;
        public dataView: DataView;
        private selectionManager: ISelectionManager;
        public host: IVisualHost;
        private target: HTMLElement;
        private gridVisual: any;
        private viewport: IViewport;
        private settings: any;
        private prevDataViewObjects: any = {};
        public hasSparkline;
        public hasBarchart;
        public hasGauage;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.viewport;
            this.target = options.element;
            let svg = this.svg = d3.select(options.element).append('div')
                .classed('DataDiv', true)
                .attr("id", "KPIGrid");
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
            var dataViews = options.dataViews;
            if (!dataViews || 0 === dataViews.length || !dataViews[0].table) {
                return;
            }
            this.hasSparkline = false;
            this.hasBarchart = false;
            this.hasGauage = false;
            var dataView = options.dataViews[0];
            this.dataView = options.dataViews[0];
            let column, sparkColumns = 0, barColumns = 0, gaugeColumns = 0;
            if (dataView.table && dataView.table.columns) {
                for (var count = 0; count < dataView.table.columns.length; count++) {
                    column = dataView.table.columns[count];
                    if (column.roles['SparkLine'])
                        sparkColumns++;
                    if (column.roles['Barchart'])
                        barColumns++;
                    if (column.roles['Gauge'])
                        gaugeColumns++;
                }
                if (sparkColumns === 3)
                    this.hasSparkline = true;
                if (barColumns === 3)
                    this.hasBarchart = true;
                if (gaugeColumns > 0)
                    this.hasGauage = true;
            }
            var settingsChanged = this.getSettings(dataView.metadata.objects);
            if (!this.gridVisual || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                this.gridVisual = myMAQlibrary(dataView, this.settings, valueFormatter);
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
                case "GridConfig":
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Font Updates',
                        selector: null,
                        properties: {
                            fontSize: this.settings.fontSize,
                            maxRows: this.settings.maxRows,
                            sortKey: this.settings.sortKey,
                            sortOrder: this.settings.sortOrder,
                            isCustomRedirect: this.settings.isCustomRedirect,
                            apiUrl: this.settings.apiUrl,
                            columnNumber: this.settings.columnNumber
                        }
                    });
                    break;
                case "Sparkline":
                    if (this.hasSparkline) {
                        objectEnumeration.push({
                            objectName: "Sparkline",
                            displayName: 'Sparkline options',
                            selector: null,
                            properties: {
                                fill: getFillValue(this.dataView.metadata.objects, "Sparkline","fill", "red")
                            }
                        });
                    }
                    break;
                case "Barchart":
                    if (this.hasBarchart) {
                        objectEnumeration.push({
                            objectName: "Barchart",
                            displayName: 'Barchart options',
                            selector: null,
                            properties: {
                                fill: getFillValue(this.dataView.metadata.objects, "Barchart","fill", "steelblue")
                            }
                        });
                    }
                    break;
                case "LinearGauge":
                    if (this.hasGauage) {
                        objectEnumeration.push({
                            objectName: "LinearGauge",
                            displayName: 'Linear Gauge options',
                            selector: null,
                            properties: {
                                fill: getFillValue(this.dataView.metadata.objects, "LinearGauge", "fill", "orange"),
                                ComparisonColor: getFillValue(this.dataView.metadata.objects, "LinearGauge", "ComparisonColor", "lightgrey"),
                            }
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
                    fontSize: getValue<number>(objects, 'GridConfig', 'fontSize', 12),
                    maxRows: getValue<number>(objects, 'GridConfig', 'maxRows', 5),
                    sortKey: getValue<number>(objects, 'GridConfig', 'sortKey', 1),
                    sortOrder: getValue<string>(objects, 'GridConfig', 'sortOrder', 'ASC'),
                    apiUrl: getValue<string>(objects, 'GridConfig', 'apiUrl', 'https://jsonplaceholder.typicode.com/posts/'),
                    isCustomRedirect: getValue<boolean>(objects, 'GridConfig', 'isCustomRedirect', false),
                    columnNumber: getValue<number>(objects, 'GridConfig', 'columnNumber', 1),
                    sparklineColor: getFillValue(this.dataView.metadata.objects, "Sparkline", "fill", "red"),
                    barchartColor: getFillValue(this.dataView.metadata.objects, "Barchart", "fill", "steelblue"),
                    gaugeActualColor: getFillValue(this.dataView.metadata.objects, "LinearGauge", "fill", "orange"),
                    gaugeComparisonColor: getFillValue(this.dataView.metadata.objects, "LinearGauge", "ComparisonColor", "lightgrey")
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }
}