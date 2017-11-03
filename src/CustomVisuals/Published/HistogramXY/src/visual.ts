
module powerbi.extensibility.visual {
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export class Visual implements IVisual {    
        private target: HTMLElement;
        private histogram: any;

        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        private settings: any;
        public dataView: DataView;
        
        private prevDataViewObjects: any = {}; // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.

        constructor(options: VisualConstructorOptions) {
            let svg = this.svg = d3.select(options.element).append('div').classed('container', true);
            options.element.setAttribute("id", "container");
        }
        
        @logExceptions()
        public update(options: VisualUpdateOptions) {
           document.getElementById('container').innerHTML = "";
           let width = options.viewport.width;
           let height = options.viewport.height;
           this.svg.attr({
                width: width,
                height: height
            });
            // Grab the dataview object
            if (0 === options.dataViews.length)
                return;
            if (options.dataViews && options.dataViews.length > 0) {
                var dataView = options.dataViews[0];
                var settingsChanged = this.getSettings(dataView.metadata.objects); // workaround because of sdk bug that doesn't notify when only style has changed
                if (!this.histogram || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                    this.svg.selectAll("*").remove();
                    this.histogram = MAQDrawChart(dataView, this.settings,options.viewport,valueFormatter);
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
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
                
            switch (objectName) {
                case "points":
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
                case "bars":
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.settings.showBars ,
                            barTooltip: this.settings.barTooltip,
                            barColor: { solid: { color: this.settings.barColor } } 
                        },
                        selector: null
                    });
                    break;
                case "xAxis":
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
                case "yAxisLeft":
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
                case "yAxisRight":
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
                case "gridLines":
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
               
           }
            return objectEnumeration;
        }

        public destroy(): void {
        }

        // Reads in settings values from the DataViewObjects and returns a settings object that the liquidFillGauge library understands
        @logExceptions()
        private getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;
            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
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
                    pointColor: getValue<Fill>(objects, 'points', 'pointColor', { solid: { color: "#3261BA" } }).solid.color,
                    barTooltip: getValue<boolean>(objects, 'bars', 'barTooltip', true),
                    barColor: getValue<Fill>(objects, 'bars', 'barColor', { solid: { color: "#008000" } }).solid.color,
                    //title
                    xTitleText: getValue<string>(objects, 'xAxis', 'titleText', "X"),
                    yTitleTextLeft: getValue<string>(objects, 'yAxisLeft', 'titleText', "Histogram count"),
                    yTitleTextRight: getValue<string>(objects, 'yAxisRight', 'titleText', "Y"),
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

    export function logExceptions(): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
            : TypedPropertyDescriptor<Function> {

            return {
                value: function () {
                    try {
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        throw e;
                    }
                }
            }
        }
    }
}