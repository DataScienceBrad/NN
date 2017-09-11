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
/* Important Information--kindly install the plugin Allow Control Allow Origin from google chrome for cors*/

import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;
module powerbi.extensibility.visual {
    //working fine- This method is called in this code for conversion to base64 image
    function convertToBase64(url, imageDiv, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
    export interface ViewModel {
        value: number;
        color?: string;
        min?: number;
        max?: number;
        drawTickBar?: boolean;
        url: string;
    }
    export class Visual implements IVisual {
        private target: any;
        private data: ViewModel;
        private cheight;
        private cwidth;
        private host: IVisualHost;
        public dataView: DataView;
        private text: d3.Selection<SVGElement>;
        private svg: d3.Selection<SVGElement>;
        private viewport: IViewport;
        constructor(options: VisualConstructorOptions) {
            this.viewport;
            tooltip.createTooltipServiceWrapper(options.host.tooltipService,
                options.element);
            this.target = d3.select(options.element);
            options.element.setAttribute("id", "container");
            let bodyElement = d3.select("this.target");
            let imageDiv = bodyElement;
            options.element.setAttribute("id", "container");
            let tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element); // options is from the VisualConstructorOptions.
            tooltipServiceWrapper.hide();
            tooltipServiceWrapper.addTooltip<TooltipEnabledDataPoint>(imageDiv, (eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                return eventArgs.data.tooltipInfo;
            })
        }
        public update(options: VisualUpdateOptions) {
            this.dataView = options.dataViews[0];
            let dataViews = options.dataViews;
            let categorical = dataViews[0].categorical;
            let dataValue = categorical.values[0].values;
            let bodyElement = d3.select("body");
            let div1 = d3.select("outer");
            let viewport = options.viewport;
            let height = viewport.height;
            let width = viewport.width;
            let x = 10;
            let y = 10;
            if (height > width) {
                x = width;
                y = width;
            }
            else if (width > height) {
                x = height;
                y = height;
            }
            else {
                x = width;
                y = height;
            }
            let imageDiv = bodyElement
                .html("")
                .append("img")
                .style({
                    "width": x + 'px',
                    "height": y + 'px'
                })
                .classed("visual", true)
                .data([{
                    tooltipInfo: [{
                        displayName: dataViews[0].categorical.values[0].source.displayName,
                        value: dataValue[0]
                    }]
                }]);
            imageDiv.attr("src", "data:image/png;base64,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");
            let u = Visual.getValue<string>(this.dataView, 'url', '');
            let str = u;
            let result1 = str.search("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=\b)");
            let result2 = str.search("(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)");
            if (result2 != -1) {
                let s;
                convertToBase64(str, imageDiv, function (mybase64) {
                    if (s != null) {
                        s = null;
                        s = mybase64;
                    }
                    s = mybase64;
                    let imageDiv = bodyElement
                        .html("")
                        .classed("visual", true)
                        .data([{
                            tooltipInfo: [{
                                displayName: dataViews[0].categorical.values[0].source.displayName,
                                value: dataValue[0]
                            }]
                        }]);
                    let image = jQuery('#imageDiv');
                    let parent = jQuery('#div1');
                    imageDiv.append("img")
                        .style({
                            "width": x + 'px',
                            "height": y + 'px',
                        })
                        .attr("src", s);
                });
            }
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            let instances: VisualObjectInstance[] = [];
            let dataView = this.dataView;
            switch (options.objectName) {
                case 'config':
                    let config: VisualObjectInstance = {
                        objectName: 'config',
                        displayName: 'Configurations',
                        selector: null,
                        properties: {
                            url: Visual.getValue<string>(dataView, 'url', ''),
                        }
                    };
                    instances.push(config);
                    break;
            }
            return instances;
        }
        private static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                let objects = dataView.metadata.objects;
                if (objects) {
                    let config = objects['config'];
                    if (config) {
                        let size = <T>config[key];
                        if (size != null)
                            return size;
                    }
                }
            }
            return defaultValue;
        }
    }
}