/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
 interface IdefaultSetting {
    fontSize: number;
    maxRows: number;
    sortKey: number;
    sortOrder: string;
    apiUrl: string;
    isCustomRedirect: boolean;
    columnNumber: number;
}
module powerbi.extensibility.visual {

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export class Grid implements IVisual {
        public errorMsg: d3.Selection<SVGAElement>;
        public dataView: DataView;
        public host: IVisualHost;
        private svg: d3.Selection<SVGAElement>;
        private xAxis: d3.Selection<SVGAElement>;
        private selectionManager: ISelectionManager;
        private target: HTMLElement;
        private gridVisual : void;
        private viewport: IViewport;
        private settings : IdefaultSetting;
        private prevDataViewObjects : DataViewObjects;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            //this.viewport;
            this.target = options.element;

            this.svg = this.svg = d3.select(options.element).append('div')
                .classed('DataDiv', true)
                .attr('id', 'KPIGrid');
        }

        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) : VisualUpdateOptions {

            let dataViews : DataView[];
            dataViews  = options.dataViews;

            if (!dataViews || 0 === dataViews.length || !dataViews[0].table) {
               return;
            }

            const dataView: DataView = options.dataViews[0];
            let flag: number = 0;
            for (i = 0; i < dataView.table.columns.length; i++) {
                if (dataView.table.columns[i].roles.hasOwnProperty('Values')) {
                    flag = 1;
                    break;
                }
            }

            d3.selectAll('#htmlChunk').remove();
            if (!flag) {
                this.svg.selectAll('*').remove();
                const htmlChunk: string = 'Please select Values';
                d3.select('.DataDiv').style('overflow', 'visible');
                d3.select('.DataDiv')
                    .append('div')
                    .attr('id', 'htmlChunk')
                    .style('margin-top', `${options.viewport.height / 2}px`)
                    .style('margin-left', `10px`)
                    .style('text-align', 'center')
                    .style('font-size', `20px`)
                    .text(htmlChunk);

                return;
            }
            d3.select('.DataDiv').style('overflow', 'auto');
            const settingsChanged: boolean = this.getSettings(dataView.metadata.objects);
            if (!this.gridVisual || settingsChanged
                || ((options.type && VisualUpdateType.Resize) || options.type && VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll('*').remove();
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

            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'GridConfig':
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

                    default:
                    {
                        break;
                    }
            }

            return objectEnumeration;
        }

        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }

        private getSettings(objects: DataViewObjects): boolean {
            let settingsChanged: boolean = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    fontSize: getValue<number>(objects, 'GridConfig', 'fontSize', 12),
                    maxRows: getValue<number>(objects, 'GridConfig', 'maxRows', 5),
                    sortKey: getValue<number>(objects, 'GridConfig', 'sortKey', 1),
                    sortOrder: getValue<string>(objects, 'GridConfig', 'sortOrder', 'ASC'),
                    apiUrl: getValue<string>(objects, 'GridConfig', 'apiUrl', 'https://jsonplaceholder.typicode.com/posts/'),
                    isCustomRedirect: getValue<boolean>(objects, 'GridConfig', 'isCustomRedirect', false),
                    columnNumber: getValue<number>(objects, 'GridConfig', 'columnNumber', 1)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
    }
}
