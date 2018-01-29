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

    export class SlopeChart implements IVisual {
        private rootElement: HTMLElement;
        private headNodes: Node[];
        private bodyNodes: Node[];

        public slopeColorSettings: ISlopeColor;
        public yAxisSettings: IYAxis;
        public interceptSettings: Intercept;

        public constructor(options: VisualConstructorOptions) {
            if (options && options.element) {
                this.rootElement = options.element;
            }
            this.headNodes = [];
            this.bodyNodes = [];
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
            this.slopeColorSettings = this.getSlopeColors(dataView);
            this.yAxisSettings = this.getyAxis(dataView);
            this.interceptSettings = this.getintercept(dataView);

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

        public getDefaultSlopeColors(): ISlopeColor {
            return {
                upColor: '#00ba38',
                downColor: '#f8766d',
                neutralColor: '#F2C80F'
            };
        }
        public getDefaultyAxis(): IYAxis {
            return {
                yTitle: '',
                yGrid: false,
                yGridCol: 'Grey50'
            };
        }
        public getDefaultintercept(): Intercept {
            return {
                intercept1Color: 'black',
                intercept1Title: '',
                intercept2Title: '',
                intercept2Color: 'black'
            };
        }

        public getSlopeColors(dataView: DataView): ISlopeColor {
            const slopeColorSettings: ISlopeColor = this.getDefaultSlopeColors();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return slopeColorSettings;
            }
            objects = dataView.metadata.objects;
            slopeColorSettings.upColor = DataViewObjects.getFillColor(objects, chartProp.SlopeColor.upColor, slopeColorSettings.upColor);
            slopeColorSettings.downColor =
            DataViewObjects.getFillColor(objects, chartProp.SlopeColor.downColor, slopeColorSettings.downColor);
            slopeColorSettings.neutralColor =
            DataViewObjects.getFillColor(objects, chartProp.SlopeColor.neutralColor, slopeColorSettings.neutralColor);

            return slopeColorSettings;
        }

        public getyAxis(dataView: DataView): IYAxis {
            const yAxisSettings: IYAxis = this.getDefaultyAxis();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return yAxisSettings;
            }
            objects = dataView.metadata.objects;
            yAxisSettings.yTitle = DataViewObjects.getValue(objects, chartProp.YAxis.yTitle, yAxisSettings.yTitle);
            yAxisSettings.yGrid = DataViewObjects.getValue(objects, chartProp.YAxis.yGrid, yAxisSettings.yGrid);
            yAxisSettings.yGridCol = DataViewObjects.getValue(objects, chartProp.YAxis.yGridCol, yAxisSettings.yGridCol);

            return yAxisSettings;
        }

        public getintercept(dataView: DataView): Intercept {
            const interceptSettings: Intercept = this.getDefaultintercept();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return interceptSettings;
            }
            objects = dataView.metadata.objects;
            interceptSettings.intercept1Color =
            DataViewObjects.getFillColor(objects, chartProp.Intercept.intercept1Color, interceptSettings.intercept1Color);
            interceptSettings.intercept2Color =
            DataViewObjects.getFillColor(objects, chartProp.Intercept.intercept2Color, interceptSettings.intercept2Color);
            interceptSettings.intercept1Title =
            DataViewObjects.getValue(objects, chartProp.Intercept.intercept1Title, interceptSettings.intercept1Title);
            interceptSettings.intercept2Title =
            DataViewObjects.getValue(objects, chartProp.Intercept.intercept2Title, interceptSettings.intercept2Title);

            return interceptSettings;
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
            let props: { [propertyName: string]: DataViewPropertyValue; };
            switch (objectName) {
                case 'SlopeColor':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            upColor: this.slopeColorSettings.upColor,
                            downColor: this.slopeColorSettings.downColor,
                            neutralColor: this.slopeColorSettings.neutralColor
                        },
                        selector: null
                    });
                    break;
                    case 'yAxis':
                    props = {};
                    props[`yTitle`] = this.yAxisSettings.yTitle;
                    props[`yGrid`] = this.yAxisSettings.yGrid;
                    if (this.yAxisSettings.yGrid) {
                        props[`yGridCol`] = this.yAxisSettings.yGridCol;
                    }
                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;
                    case 'intercept':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            intercept1Color: this.interceptSettings.intercept1Color,
                            intercept2Color: this.interceptSettings.intercept2Color,
                            intercept1Title: this.interceptSettings.intercept1Title,
                            intercept2Title: this.interceptSettings.intercept2Title
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
