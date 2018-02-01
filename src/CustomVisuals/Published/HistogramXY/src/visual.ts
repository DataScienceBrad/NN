
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
module powerbi.extensibility.visual {
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export class Visual implements IVisual {
        private target: HTMLElement;
        // tslint:disable-next-line:no-any
        private histogram: any;

        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        // tslint:disable-next-line:no-any
        private settings: any;
        public dataView: DataView;

        // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
        private prevDataViewObjects: {} = {};

        constructor(options: VisualConstructorOptions) {
            let svg: d3.Selection<SVGAElement>;
            svg = this.svg = d3.select(options.element).append('div').classed('container', true);
            options.element.setAttribute('id', 'container');
        }

        @logExceptions()
        public update(options: VisualUpdateOptions): void {
            d3.selectAll('#container').selectAll('*').remove();
            let width: number;
            width = options.viewport.width;
            let height: number;
            height = options.viewport.height;
            this.svg.attr({
                width: width,
                height: height
            });
            // Grab the dataview object
            if (0 === options.dataViews.length) {
                return;
            }
            if (options.dataViews && options.dataViews.length > 0) {
                let dataView: DataView;
                dataView = options.dataViews[0];
                // workaround because of sdk bug that doesn't notify when only style has changed
                let settingsChanged: boolean;
                settingsChanged = this.getSettings(dataView.metadata.objects);
                if (!this.histogram || settingsChanged || ((options.type
                    && VisualUpdateType.Resize) || options.type && VisualUpdateType.ResizeEnd)) {
                    this.svg.selectAll('*').remove();
                    this.histogram = MAQDrawChart(dataView, this.settings, options.viewport, valueFormatter);
                }
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
            let objectName: string;
            objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];

            switch (objectName) {
                case 'points':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showPoints,
                            pointTooltip: this.settings.pointTooltip,
                            pointColor: { solid: { color: this.settings.pointColor } }
                        },
                        selector: null
                    });
                    break;
                case 'bars':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showBars,
                            barTooltip: this.settings.barTooltip,
                            barColor: { solid: { color: this.settings.barColor } }
                        },
                        selector: null
                    });
                    break;
                case 'xAxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            titleEnable: this.settings.showxAxisTitle,
                            titleText: this.settings.xTitleText,
                            label: this.settings.showxAxisLabel
                        },
                        selector: null
                    });
                    break;
                case 'yAxisLeft':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            titleEnable: this.settings.showyAxisLeftTitle,
                            titleText: this.settings.yTitleTextLeft,
                            label: this.settings.showyAxisLeftLabel
                        },
                        selector: null
                    });
                    break;
                case 'yAxisRight':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            titleEnable: this.settings.showyAxisRightTitle,
                            titleText: this.settings.yTitleTextRight,
                            label: this.settings.showyAxisRightLabel
                        },
                        selector: null
                    });
                    break;
                case 'gridLines':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showGridLines,
                            xAxis: this.settings.showxAxisGridLines,
                            yAxis: this.settings.showyAxisGridLines
                        },
                        selector: null
                    });
                    break;
                default:
                    break;

            }

            return objectEnumeration;
        }

        public destroy(): void {
            // empty
        }
        // Reads in settings values from the DataViewObjects and returns a settings object that the liquidFillGauge library understands
        @logExceptions()
        private getSettings(objects: DataViewObjects): boolean {
            let settingsChanged: boolean;
            settingsChanged = false;
            if (typeof this.settings === 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    showPoints: getValue<boolean>(objects, 'points', 'show', true),
                    showBars: getValue<boolean>(objects, 'bars', 'show', true),
                    //title
                    showxAxisTitle: getValue<boolean>(objects, 'xAxis', 'titleEnable', true),
                    showyAxisLeftTitle: getValue<boolean>(objects, 'yAxisLeft', 'titleEnable', true),
                    showyAxisRightTitle: getValue<boolean>(objects, 'yAxisRight', 'titleEnable', true),
                    //label
                    showxAxisLabel: getValue<boolean>(objects, 'xAxis', 'label', true),
                    showyAxisLeftLabel: getValue<boolean>(objects, 'yAxisLeft', 'label', true),
                    showyAxisRightLabel: getValue<boolean>(objects, 'yAxisRight', 'label', true),
                    //grid lines
                    showGridLines: getValue<boolean>(objects, 'gridLines', 'show', true),
                    //point bar
                    pointTooltip: getValue<boolean>(objects, 'points', 'pointTooltip', true),
                    pointColor: getValue<Fill>(objects, 'points', 'pointColor', { solid: { color: '#3261BA' } }).solid.color,
                    barTooltip: getValue<boolean>(objects, 'bars', 'barTooltip', true),
                    barColor: getValue<Fill>(objects, 'bars', 'barColor', { solid: { color: '#008000' } }).solid.color,
                    //title
                    xTitleText: getValue<string>(objects, 'xAxis', 'titleText', 'X'),
                    yTitleTextLeft: getValue<string>(objects, 'yAxisLeft', 'titleText', 'Histogram count'),
                    yTitleTextRight: getValue<string>(objects, 'yAxisRight', 'titleText', 'Y'),
                    //label
                    //grid lines
                    showxAxisGridLines: getValue<boolean>(objects, 'gridLines', 'xAxis', true),
                    showyAxisGridLines: getValue<boolean>(objects, 'gridLines', 'yAxis', true)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
    }

    // tslint:disable-next-line:no-any
    export function logExceptions(): any {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
            // tslint:disable-next-line:no-any
            : any {

            return {

                // tslint:disable-next-line:no-any
                value: function (): any {
                    try {
                        // tslint:disable-next-line:no-invalid-this
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        throw e;
                    }
                }
            };
        };
    }
}
