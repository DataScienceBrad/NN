module powerbi.extensibility.visual {

    export class Grid implements IVisual {
        private svg: d3.Selection < SVGAElement > ;
        private renderMAQVisual: any;
        private xAxis: d3.Selection < SVGAElement > ;
        public dataView: DataView;
        private selectionManager: ISelectionManager;
        public host: IVisualHost;
        private target: HTMLElement;
        private gridVisual: any;
        private viewport: IViewport;
        private settings: any;
        private prevDataViewObjects: any = {};


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
            if (!dataViews || 0 === dataViews.length ||  !dataViews[0].table) {
                return;
            }
            var dataView = options.dataViews[0];
            var dataView = options.dataViews[0];
            var settingsChanged = this.getSettings(dataView.metadata.objects);
            if (!this.gridVisual || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                this.gridVisual = myMAQlibrary(dataView, this.settings);
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
                    fontSize: getValue < number > (objects, 'GridConfig', 'fontSize', 12),
                    maxRows: getValue < number > (objects, 'GridConfig', 'maxRows', 5),
                    sortKey: getValue < number > (objects, 'GridConfig', 'sortKey', 1),
                    sortOrder: getValue < string > (objects, 'GridConfig', 'sortOrder', 'ASC'),
                    apiUrl: getValue < string > (objects, 'GridConfig', 'apiUrl', 'https://jsonplaceholder.typicode.com/posts/'),
                    isCustomRedirect: getValue < boolean > (objects, 'GridConfig', 'isCustomRedirect', false),
                    columnNumber: getValue < number > (objects, 'GridConfig', 'columnNumber', 1)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }
    }
}