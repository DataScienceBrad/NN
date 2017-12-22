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

    export interface ISettings {
        parameterSettings: string;
        units: number;
        decay: number;
        maxitr: number;
        epochs: number;
        size: number;
        confLevel: number;
        confInterval: boolean;
    }

    export interface IPlotSettings {
        title: string;
        plotColor: string;
        fline: string;
        hline: string;
        flineText: string;
        hlineText: string;
        confText: string;
        confCol: string;
    }

    export interface IXaxisSettings {
        xTitle: string;
        xZeroline: boolean;
        xLabels: boolean;
        xGrid: boolean;
        xGridCol: string;
        xGridWidth: number;
        xAxisBaseLine: boolean;
        xAxisBaseLineCol: string;
        xAxisBaseLineWidth: number;
    }

    export interface IYaxisSettings {
        yTitle: string;
        yZeroline: boolean;
        yLabels: boolean;
        yGrid: boolean;
        yGridCol: string;
        yGridWidth: number;
        yAxisBaseLine: boolean;
        yAxisBaseLineCol: string;
        yAxisBaseLineWidth: number;
    }
    const updateHTMLHead: boolean = false;
    const renderVisualUpdateType: number[] = [
        VisualUpdateType.Resize,
        VisualUpdateType.ResizeEnd,
        VisualUpdateType.Resize + VisualUpdateType.ResizeEnd
    ];

    export class ForecastingUsingNN implements IVisual {
        private rootElement: HTMLElement;
        private headNodes: Node[];
        private bodyNodes: Node[];

        public plotSettings: IPlotSettings;
        public xaxisSettings: IXaxisSettings;
        public yaxisSettings: IYaxisSettings;
        public isettings: ISettings;

        public constructor(options: VisualConstructorOptions) {
            if (options && options.element) {
                this.rootElement = options.element;
            }
            this.headNodes = [];
            this.bodyNodes = [];

            this.isettings = {
                parameterSettings: 'Auto',
                decay: 0.0009,
                units: 10,
                maxitr: 500,
                epochs: 20,
                size: 20,
                confInterval: false,
                confLevel: 0.80
            };

            this.plotSettings = {

                title: 'Forecast',
                plotColor: '#FFFFFF',
                fline: '#F2C80F',
                hline: '#01B8AA',
                flineText: 'prediction',
                hlineText: 'observed',
                confCol: 'Gray95',
                confText: 'Confidence'
            };

            this.xaxisSettings = {
                xTitle: 'X',
                xZeroline: true,
                xLabels: true,
                xGrid: true,
                xGridCol: '#BFC4C5',
                xGridWidth: 0.1,
                xAxisBaseLine: true,
                xAxisBaseLineCol: '#000000',
                xAxisBaseLineWidth: 4
            };

            this.yaxisSettings = {
                yTitle: 'Values',
                yZeroline: true,
                yLabels: true,
                yGrid: true,
                yGridCol: '#BFC4C5',
                yGridWidth: 0.1,
                yAxisBaseLine: true,
                yAxisBaseLineCol: '#000000',
                yAxisBaseLineWidth: 4
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
            let units: number = getValue<number>(objects, 'settings', 'units', 10);
            units = units <= 0 ? 10 : getValue<number>(objects, 'settings', 'units', 10);
            let decay: number = getValue<number>(objects, 'settings', 'decay', 0.009);
            decay = decay < 0 ? 0.009 : decay > 1 ? 0.009 : getValue<number>(objects, 'settings', 'decay', 0.009);
            let maxitr: number = getValue<number>(objects, 'settings', 'maxitr', 500);
            maxitr = maxitr <= 0 ? 500 : getValue<number>(objects, 'settings', 'maxitr', 500);
            let epochs: number = getValue<number>(objects, 'settings', 'epochs', 20);
            epochs = epochs <= 0 ? 20 : getValue<number>(objects, 'settings', 'epochs', 20);
            let size : number = getValue<number>(objects, 'settings', 'size', 20);
            size = size >= 0 ? 20 : getValue<number>(objects, 'settings', 'size', 20);
            let confLevel : number = getValue<number>(objects, 'settings', 'confLevel', 0.80);
            confLevel = confLevel < 0 ? 0.80 : confLevel > 1 ? 0.80 : getValue<number>(objects, 'settings', 'confLevel', 0.80);

            let xGridWidth: number = getValue<number>(objects, 'xaxisSettings', 'xGridWidth', 0.1);
            xGridWidth = xGridWidth < 0 ? 0.1 : xGridWidth > 5 ? 0.1 : getValue<number>(objects, 'xaxisSettings', 'xGridWidth', 0.1);
            let xAxisBaseLineWidth: number = getValue<number>(objects, 'xaxisSettings', 'xAxisBaseLineWidth', 4);
            xAxisBaseLineWidth = xAxisBaseLineWidth < 0 ? 4 :
            xAxisBaseLineWidth > 11 ? 4 : getValue<number>(objects, 'xaxisSettings', 'xAxisBaseLineWidth', 4);

            let yGridWidth: number = getValue<number>(objects, 'yaxisSettings', 'yGridWidth', 0.1);
            yGridWidth = yGridWidth < 0 ? 0.1 : yGridWidth > 5 ? 0.1 : getValue<number>(objects, 'yaxisSettings', 'yGridWidth', 0.1);
            let yAxisBaseLineWidth: number = getValue<number>(objects, 'yaxisSettings', 'yAxisBaseLineWidth', 4);
            yAxisBaseLineWidth = yAxisBaseLineWidth < 0 ? 4 :
            yAxisBaseLineWidth > 11 ? 4 : getValue<number>(objects, 'yaxisSettings', 'yAxisBaseLineWidth', 4);

            this.isettings = {
                parameterSettings: getValue<string>(objects, 'settings', 'parameterSettings', 'Auto'),
                units: units,
                decay: decay,
                maxitr: maxitr,
                epochs: epochs,
                size: size,
                confLevel: confLevel,
                confInterval: getValue<boolean>(objects, 'settings', 'confInterval', false)
            };

            this.plotSettings = {
                title: getValue<string>(objects, 'plotSettings', 'title', 'Forecast'),
                plotColor: getValue<string>(objects, 'plotSettings', 'plotColor', '#FFFFFF'),
                fline: getValue<string>(objects, 'plotSettings', 'fline', '#F2C80F'),
                hline: getValue<string>(objects, 'plotSettings', 'hline', '#01B8AA'),
                flineText: getValue<string>(objects, 'plotSettings', 'flineText', 'prediction'),
                hlineText: getValue<string>(objects, 'plotSettings', 'hlineText', 'observed'),
                confCol: getValue<string>(objects, 'plotSettings', 'confCol', 'Gray95'),
                confText: getValue<string>(objects, 'plotSettings', 'confText', 'Confidence')
            };
            this.xaxisSettings = {
                xTitle: getValue<string>(objects, 'xaxisSettings', 'xTitle', 'X'),
                xZeroline: getValue<boolean>(objects, 'xaxisSettings', 'xZeroline', true),
                xLabels: getValue<boolean>(objects, 'xaxisSettings', 'xLabels', true),
                xGrid: getValue<boolean>(objects, 'xaxisSettings', 'xGrid', true),
                xGridCol: getValue<string>(objects, 'xaxisSettings', 'xGridCol', '#BFC4C5'),
                xGridWidth: xGridWidth,
                xAxisBaseLine: getValue<boolean>(objects, 'xaxisSettings', 'xAxisBaseLine', true),
                xAxisBaseLineCol: getValue<string>(objects, 'xaxisSettings', 'xAxisBaseLineCol', '#000000'),
                xAxisBaseLineWidth: xAxisBaseLineWidth
            };

            this.yaxisSettings = {
                yTitle: getValue<string>(objects, 'yaxisSettings', 'yTitle', 'Values'),
                yZeroline: getValue<boolean>(objects, 'yaxisSettings', 'yZeroline', true),
                yLabels: getValue<boolean>(objects, 'yaxisSettings', 'yLabels', true),
                yGrid: getValue<boolean>(objects, 'yaxisSettings', 'yGrid', true),
                yGridCol: getValue<string>(objects, 'yaxisSettings', 'yGridCol', '#BFC4C5'),
                yGridWidth: yGridWidth,
                yAxisBaseLine: getValue<boolean>(objects, 'yaxisSettings', 'yAxisBaseLine', true),
                yAxisBaseLineCol: getValue<string>(objects, 'yaxisSettings', 'yAxisBaseLineCol', '#000000'),
                yAxisBaseLineWidth: yAxisBaseLineWidth
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
                case 'settings':
                    const props: { [propertyName: string]: DataViewPropertyValue; } = {};
                    props[`parameterSettings`] = this.isettings.parameterSettings;
                    if (this.isettings.parameterSettings === 'Auto') {
                        props[`units`] = this.isettings.units;
                    } else {
                        props[`decay`] = this.isettings.decay;
                        props[`maxitr`] = this.isettings.maxitr;
                        props[`units`] = this.isettings.units;
                        props[`epochs`] = this.isettings.epochs;
                        props[`size`] = this.isettings.size;
                    }
                    props[`confInterval`] = this.isettings.confInterval;
                    if (this.isettings.confInterval) {
                        props[`confLevel`] = this.isettings.confLevel;
                    }
                    objectEnum.push({
                        objectName: objectName,
                        properties: props,
                        selector: null
                    });
                    break;

                case 'plotSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            title: this.plotSettings.title,
                            plotColor: this.plotSettings.plotColor,
                            fline: this.plotSettings.fline,
                            hline: this.plotSettings.hline,
                            flineText: this.plotSettings.flineText,
                            hlineText: this.plotSettings.hlineText,
                            confCol: this.plotSettings.confCol,
                            confText: this.plotSettings.confText

                        },
                        selector: null
                    });
                    break;

                case 'xaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            xTitle: this.xaxisSettings.xTitle,
                            xZeroline: this.xaxisSettings.xZeroline,
                            xLabels: this.xaxisSettings.xLabels,
                            xGrid: this.xaxisSettings.xGrid,
                            xGridCol: this.xaxisSettings.xGridCol,
                            xGridWidth: this.xaxisSettings.xGridWidth,
                            xAxisBaseLine: this.xaxisSettings.xAxisBaseLine,
                            xAxisBaseLineCol: this.xaxisSettings.xAxisBaseLineCol,
                            xAxisBaseLineWidth: this.xaxisSettings.xAxisBaseLineWidth

                        },
                        selector: null
                    });
                    break;

                case 'yaxisSettings':
                    objectEnum.push({
                        objectName: objectName,
                        properties: {
                            yTitle: this.yaxisSettings.yTitle,
                            yZeroline: this.yaxisSettings.yZeroline,
                            yLabels: this.yaxisSettings.yLabels,
                            yGrid: this.yaxisSettings.yGrid,
                            yGridCol: this.yaxisSettings.yGridCol,
                            yGridWidth: this.yaxisSettings.yGridWidth,
                            yAxisBaseLine: this.yaxisSettings.yAxisBaseLine,
                            yAxisBaseLineCol: this.yaxisSettings.yAxisBaseLineCol,
                            yAxisBaseLineWidth: this.yaxisSettings.yAxisBaseLineWidth

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
