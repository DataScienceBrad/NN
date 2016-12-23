module powerbi.extensibility.visual {
    export class Visual implements IVisual {
        private target: HTMLElement;
        private cloudChart: any;
        private renderMAQVisual: any;
        private viewport: IViewport;
        private svg: d3.Selection < SVGElement > ;
        private settings: any;
        public dataView: DataView;
        private prevDataViewObjects: any = {};

        constructor(options: VisualConstructorOptions) {
            this.viewport;
            this.target = options.element;
            let svg = this.svg = d3.select(options.element).append('div').classed('cloudChart', true);
            options.element.setAttribute("id", "cloudChart");
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            document.getElementById('cloudChart').innerHTML = "";
            let dataView = options.dataViews[0];
            if (!dataView)
                return;
            let settingsChanged = this.getSettings(dataView.metadata.objects);
            if (!this.cloudChart || settingsChanged || ((options.type & VisualUpdateType.Resize) || options.type & VisualUpdateType.ResizeEnd)) {
                this.svg.selectAll("*").remove();
                this.cloudChart = renderMAQVisual(dataView, this.settings);
            }
        }

        public destroy(): void {}


        @logExceptions()
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
                            legendEnable: this.settings.legendEnable
                        }
                    });
                    break;
                case 'Line':
                    objectEnumeration.push({
                        objectName: options.objectName,
                        displayName: 'Line',
                        selector: null,
                        properties: {
                            column1: this.settings.column1,
                            column2: this.settings.column2,
                            column3: this.settings.column3,
                            column4: this.settings.column4,
                            column5: this.settings.column5,
                            bullet1: this.settings.bullet1,
                            bullet2: this.settings.bullet2,
                            bullet3: this.settings.bullet3,
                            bullet4: this.settings.bullet4,
                            bullet5: this.settings.bullet5
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

                        }
                    });
                    break;


            };
            return objectEnumeration;
        }

        @logExceptions()
        private getSettings(objects: DataViewObjects): boolean {
            var settingsChanged = false;

            if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                    legendValues: getValue < boolean > (objects, 'Legend', 'legendValues', true),
                    legendEnable: getValue < boolean > (objects, 'Legend', 'legendEnable', true),
                    column1: getValue < Fill > (objects, 'Line', 'column1', {
                        solid: {
                            color: "#2560b7"
                        }
                    }).solid.color,
                    column2: getValue < Fill > (objects, 'Line', 'column2', {
                        solid: {
                            color: "#3bc8ff"
                        }
                    }).solid.color,
                    column3: getValue < Fill > (objects, 'Line', 'column3', {
                        solid: {
                            color: "#ef3c25"
                        }
                    }).solid.color,
                    column4: getValue < Fill > (objects, 'Line', 'column4', {
                        solid: {
                            color: "#f7a041"
                        }
                    }).solid.color,
                    column5: getValue < Fill > (objects, 'Line', 'column5', {
                        solid: {
                            color: "#aaeeee"
                        }
                    }).solid.color,
                    bullet1: getValue < Fill > (objects, 'Line', 'bullet1', {
                        solid: {
                            color: "#ff0066"
                        }
                    }).solid.color,
                    bullet2: getValue < Fill > (objects, 'Line', 'bullet2', {
                        solid: {
                            color: "#eeaaee"
                        }
                    }).solid.color,
                    bullet3: getValue < Fill > (objects, 'Line', 'bullet3', {
                        solid: {
                            color: "#55BF3B"
                        }
                    }).solid.color,
                    bullet4: getValue < Fill > (objects, 'Line', 'bullet4', {
                        solid: {
                            color: "#DF5353"
                        }
                    }).solid.color,
                    bullet5: getValue < Fill > (objects, 'Line', 'bullet5', {
                        solid: {
                            color: "#7798BF"
                        }
                    }).solid.color,
                    xAxisEnableLabels: getValue < boolean > (objects, 'XAxis', 'xAxisEnableLabels', true),
                    xAXisFontSize: getValue < number > (objects, 'XAxis', 'xAXisFontSize', 10),
                    yAxisEnableLabels: getValue < Fill > (objects, 'YAxis', 'yAxisEnableLabels', true),
                    yAXisFontSize: getValue < number > (objects, 'YAxis', 'yAXisFontSize', 10)
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;

            return settingsChanged;
        }
    }

    export function logExceptions(): MethodDecorator {
        return function(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor < Function > ): TypedPropertyDescriptor < Function > {

            return {
                value: function() {
                    try {
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }
            }
        }
    }
}