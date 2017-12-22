/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
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
    'use strict';

    // in order to improve the performance, one can update the <head> only in the initial rendering.
    // set to 'true' if you are using different packages to create the widgets
    const updateHTMLHead: boolean = false;
    const renderVisualUpdateType: number[] = [
        VisualUpdateType.Resize,
        VisualUpdateType.ResizeEnd,
        VisualUpdateType.Resize + VisualUpdateType.ResizeEnd
    ];

    export interface IClusterSettings {
        scaling: boolean;
        epsilon: number;
        minptsClust: number;
        steepThres: number;
    }

    export interface IPlotSettings {
        title: string;
        plotColor: string;
    }

    export interface IAxisSettings {
        title: string;
        zeroline: boolean;
        labels: boolean;
        grid: boolean;
        gridCol: string;
        gridWidth: number;
        axisBaseLine: boolean;
        axisBaseLineCol: string;
        axisBaseLineWidth: number;
    }

    export class ClusteringUsingOPTICS implements IVisual {
        private rootElement: HTMLElement;
        private headNodes: Node[];
        private bodyNodes: Node[];
        private clusterSettings: IClusterSettings;
        public plotSettings: IPlotSettings;
        public xAxisSettings: IAxisSettings;
        public yAxisSettings: IAxisSettings;

        public constructor(options: VisualConstructorOptions) {
            if (options && options.element) {
                this.rootElement = options.element;
            }
            this.headNodes = [];
            this.bodyNodes = [];

            this.clusterSettings = {
                scaling: false,
                epsilon: 1,
                minptsClust: 10,
                steepThres: 0.08
            };

            this.plotSettings = {

                title: 'Clusters',
                plotColor: '#FFFFFF'
            };

            this.xAxisSettings = {
                title: 'X',
                zeroline: true,
                labels: true,
                grid: true,
                gridCol: '#BFC4C5',
                gridWidth: 0.1,
                axisBaseLine: true,
                axisBaseLineCol: '#000000',
                axisBaseLineWidth: 4
            };

            this.yAxisSettings = {
                title: 'Y',
                zeroline: true,
                labels: true,
                grid: true,
                gridCol: '#BFC4C5',
                gridWidth: 0.1,
                axisBaseLine: true,
                axisBaseLineCol: '#000000',
                axisBaseLineWidth: 4
            };
        }

        public update(options: VisualUpdateOptions): void {
            if (!options ||
                !options.type ||
                !options.viewport ||
                !options.dataViews ||
                options.dataViews.length === 0 ||
                !options.dataViews[0]) {
                return;
            }
            const dataView: DataView = options.dataViews[0];
            this.updateObjects(dataView.metadata.objects);

            let payloadBase64: string = null;
            if (dataView.scriptResult && dataView.scriptResult.payloadBase64) {
                payloadBase64 = dataView.scriptResult.payloadBase64;
            }

            if (renderVisualUpdateType.indexOf(options.type) === -1) {
                if (payloadBase64) {
                    this.injectCodeFromPayload(payloadBase64);
                }
            } else {
                this.onResizing(options.viewport);
            }
        }

        public onResizing(finalViewport: IViewport): void {
            /* add code to handle resizing of the view port */
        }

        private injectCodeFromPayload(payloadBase64: string): void {
            // inject HTML from payload, created in R
            // the code is injected to the 'head' and 'body' sections.
            // if the visual was already rendered, the previous DOM elements are cleared

            ResetInjector();

            if (!payloadBase64) {
                return;
            }

            // create 'virtual' HTML, so parsing is easier
            const el: HTMLHtmlElement = document.createElement('html');
            try {
                el.innerHTML = window.atob(payloadBase64);
            } catch (err) {
                return;
            }

            // if 'updateHTMLHead == false', then the code updates the header data only on the 1st rendering
            // this option allows loading and parsing of large and recurring scripts only once.
            if (updateHTMLHead || this.headNodes.length === 0) {
                while (this.headNodes.length > 0) {
                    const tempNode: Node = this.headNodes.pop();
                    document.head.removeChild(tempNode);
                }
                const headList: NodeListOf<HTMLHeadElement> = el.getElementsByTagName('head');
                if (headList && headList.length > 0) {
                    const head: HTMLHeadElement = headList[0];
                    this.headNodes = ParseElement(head, document.head);
                }
            }

            // update 'body' nodes, under the rootElement
            while (this.bodyNodes.length > 0) {
                const tempNode: Node = this.bodyNodes.pop();
                this.rootElement.removeChild(tempNode);
            }
            const bodyList: NodeListOf<HTMLBodyElement> = el.getElementsByTagName('body');
            if (bodyList && bodyList.length > 0) {
                const body: HTMLBodyElement = bodyList[0];
                this.bodyNodes = ParseElement(body, this.rootElement);
            }

            RunHTMLWidgetRenderer();
        }

        public updateObjects(objects: DataViewObjects): void {
            const scaling: boolean = getValue<boolean>(objects, 'clusterSettings', 'scaling', false);
            let epsilon: number = getValue<number>(objects, 'clusterSettings', 'epsilon', 1);
            epsilon = epsilon < 1 ? 1 : getValue<number>(objects, 'clusterSettings', 'epsilon', 1);
            let minptsClust: number = getValue<number>(objects, 'clusterSettings', 'minptsClust', 10);
            minptsClust = minptsClust < 1 ? 10 : getValue<number>(objects, 'clusterSettings', 'minptsClust', 10);
            let steepThres: number = getValue<number>(objects, 'clusterSettings', 'steepThres', 0.08);
            steepThres = steepThres <= 0 ? 0.08 :
                steepThres >= 1 ? 0.08 : getValue<number>(objects, 'clusterSettings', 'steepThres', 0.08);
            let xGridWidth: number = getValue<number>(objects, 'xaxisSettings', 'xGridWidth', 0.1);
            xGridWidth = xGridWidth < 0.1 ? 0.1 : xGridWidth > 5 ? 0.1 : getValue<number>(objects, 'xaxisSettings', 'xGridWidth', 0.1);
            let xAxisBaseLineWidth: number = getValue<number>(objects, 'xaxisSettings', 'xAxisBaseLineWidth', 4);
            xAxisBaseLineWidth = xAxisBaseLineWidth < 0 ? 4 :
                xAxisBaseLineWidth > 11 ? 4 : getValue<number>(objects, 'xaxisSettings', 'xAxisBaseLineWidth', 4);

            let yGridWidth: number = getValue<number>(objects, 'yaxisSettings', 'yGridWidth', 0.1);
            yGridWidth = yGridWidth < 0.1 ? 0.1 : yGridWidth > 5 ? 0.1 : getValue<number>(objects, 'yaxisSettings', 'yGridWidth', 0.1);
            let yAxisBaseLineWidth: number = getValue<number>(objects, 'yaxisSettings', 'yAxisBaseLineWidth', 4);
            yAxisBaseLineWidth = yAxisBaseLineWidth < 0 ? 4 :
                yAxisBaseLineWidth > 11 ? 4 : getValue<number>(objects, 'yaxisSettings', 'yAxisBaseLineWidth', 4);

            this.clusterSettings = {
                scaling: scaling,
                epsilon: epsilon,
                minptsClust: minptsClust,
                steepThres: steepThres
            };

            this.plotSettings = {
                title: getValue<string>(objects, 'plotSettings', 'title', 'Clusters'),
                plotColor: getValue<string>(objects, 'plotSettings', 'plotColor', '#FFFFFF')
            };
            this.xAxisSettings = {
                title: getValue<string>(objects, 'xaxisSettings', 'xTitle', 'X'),
                zeroline: getValue<boolean>(objects, 'xaxisSettings', 'xZeroline', true),
                labels: getValue<boolean>(objects, 'xaxisSettings', 'xLabels', true),
                grid: getValue<boolean>(objects, 'xaxisSettings', 'xGrid', true),
                gridCol: getValue<string>(objects, 'xaxisSettings', 'xGridCol', '#BFC4C5'),
                gridWidth: xGridWidth,
                axisBaseLine: getValue<boolean>(objects, 'xaxisSettings', 'xAxisBaseLine', true),
                axisBaseLineCol: getValue<string>(objects, 'xaxisSettings', 'xAxisBaseLineCol', '#000000'),
                axisBaseLineWidth: xAxisBaseLineWidth
            };

            this.yAxisSettings = {
                title: getValue<string>(objects, 'yaxisSettings', 'yTitle', 'Y'),
                zeroline: getValue<boolean>(objects, 'yaxisSettings', 'yZeroline', true),
                labels: getValue<boolean>(objects, 'yaxisSettings', 'yLabels', true),
                grid: getValue<boolean>(objects, 'yaxisSettings', 'yGrid', true),
                gridCol: getValue<string>(objects, 'yaxisSettings', 'yGridCol', '#BFC4C5'),
                gridWidth: yGridWidth,
                axisBaseLine: getValue<boolean>(objects, 'yaxisSettings', 'yAxisBaseLine', true),
                axisBaseLineCol: getValue<string>(objects, 'yaxisSettings', 'yAxisBaseLineCol', '#000000'),
                axisBaseLineWidth: yAxisBaseLineWidth
            };

        }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            let objectName: string;
            objectName = options.objectName;
            let objectEnum: VisualObjectInstance[];
            objectEnum = [];
            switch (objectName) {
                case 'clusterSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            scaling: this.clusterSettings.scaling,
                            epsilon: this.clusterSettings.epsilon,
                            minptsClust: this.clusterSettings.minptsClust,
                            steepThres: this.clusterSettings.steepThres

                        },
                        selector: null
                    });
                    break;

                case 'plotSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {

                            title: this.plotSettings.title,
                            plotColor: this.plotSettings.plotColor
                        },
                        selector: null
                    });
                    break;

                case 'xaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            xTitle: this.xAxisSettings.title,
                            xZeroline: this.xAxisSettings.zeroline,
                            xLabels: this.xAxisSettings.labels,
                            xGrid: this.xAxisSettings.grid,
                            xGridCol: this.xAxisSettings.gridCol,
                            xGridWidth: this.xAxisSettings.gridWidth,
                            xAxisBaseLine: this.xAxisSettings.axisBaseLine,
                            xAxisBaseLineCol: this.xAxisSettings.axisBaseLineCol,
                            xAxisBaseLineWidth: this.xAxisSettings.axisBaseLineWidth

                        },
                        selector: null
                    });
                    break;

                case 'yaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {

                            yTitle: this.yAxisSettings.title,
                            yZeroline: this.yAxisSettings.zeroline,
                            yLabels: this.yAxisSettings.labels,
                            yGrid: this.yAxisSettings.grid,
                            yGridCol: this.yAxisSettings.gridCol,
                            yGridWidth: this.yAxisSettings.gridWidth,
                            yAxisBaseLine: this.yAxisSettings.axisBaseLine,
                            yAxisBaseLineCol: this.yAxisSettings.axisBaseLineCol,
                            yAxisBaseLineWidth: this.yAxisSettings.axisBaseLineWidth

                        },
                        selector: null
                    });
                    break;

                default:
                    break;
            }

            return objectEnum;
        }
    }
}
