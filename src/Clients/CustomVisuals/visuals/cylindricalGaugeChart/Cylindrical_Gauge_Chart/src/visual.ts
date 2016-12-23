module powerbi.extensibility.visual {

    export interface ViewModel {
        value: number;
        color ? : string;
        min ? : number;
        max ? : number;
        drawTickBar ? : boolean;
    }

    export class CylindericalGauge implements IVisual {

        private viewport: IViewport;
        private settings: any;
        private svg: d3.Selection < SVGElement > ;
        private topCircle: d3.Selection < SVGElement > ;
        private bottomCircle: d3.Selection < SVGElement > ;
        private backCircle: d3.Selection < SVGElement > ;
        private backRect: d3.Selection < SVGElement > ;
        private fillCircle: d3.Selection < SVGElement > ;
        private fillRect: d3.Selection < SVGElement > ;
        private tempMarkings: d3.Selection < SVGElement > ;
        private text: d3.Selection < SVGElement > ;
        private data: ViewModel;
        public dataView: DataView;

        private prevDataViewObjects: any = {};

        public static converter(dataView: DataView, colors: IDataColorPalette): ViewModel {
            var series = dataView.categorical.values;
            return {
                value: series[0].values[series[0].values.length - 1]
            }
        }


        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.viewport;
            let svg = this.svg = d3.select(options.element).append('svg').classed('CylindericalGauge', true);
            options.element.setAttribute("id", "container");
            var mainGroup = svg.append('g');
            this.backRect = mainGroup.append('rect');
            this.backCircle = mainGroup.append('ellipse');
            this.fillRect = mainGroup.append('rect');
            this.fillCircle = mainGroup.append('ellipse');
            this.tempMarkings = svg.append("g").attr("class", "y axis");
            this.topCircle = mainGroup.append('ellipse');
            this.bottomCircle = mainGroup.append('ellipse');
            this.text = mainGroup.append('text');

        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews)
                return;
            if (0 === options.dataViews.length)
                return;
            var dataView = options.dataViews[0];
            this.dataView = options.dataViews[0];
            this.data = CylindericalGauge.converter(options.dataViews[0], null);
            this.data.max = CylindericalGauge.getValue(dataView, 'max', 100);
            this.data.min = CylindericalGauge.getValue(dataView, 'min', 0);
            this.data.drawTickBar = CylindericalGauge.getValue(dataView, 'tickBar', true);
            // to handle value greater than max value
            if (this.data.value > this.data.max) {
                this.data.max = Math.ceil(this.data.value);
            }
            if (this.data.value < this.data.min) {
                this.data.min = Math.floor(this.data.value);
            }

            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;
            var duration = 1000;

            this.svg.attr({
                'height': height,
                'width': width
            });
            this.draw(width, height, duration);
        }

        public draw(width: number, height: number, duration: number) {
            var radius = 100; //height * 0.1;
            var padding = radius * 0.25;
            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, padding, duration);
            this.drawTicks(width, height, radius, padding);
            this.drawText(width, height, radius, padding);
            d3.select("#y axis").remove();

        }

        public drawBack(width: number, height: number, radius: number) {
            var rectHeight = height - radius;
            var fill = CylindericalGauge.getFill(this.dataView, 'border').solid.color; //'D3C8B4';
            this.backCircle
                .attr({
                    'cx': (width / 2) + (radius / 2) - 50,
                    'cy': rectHeight,
                    'rx': width / 4,
                    'ry': 20
                })
                .style({
                    'fill': fill,
                    'stroke': this.shadeColor(fill, -20),
                    'stroke-width': '10px'
                });

            this.topCircle
                .attr({
                    'cx': (width / 2) + (radius / 2) - 50,
                    'cy': 30,
                    'rx': width / 4,
                    'ry': 20
                })
                .style({
                    'fill': fill,
                    'stroke-width': 2,
                    'stroke': this.shadeColor(fill, 15)
                });

            this.backRect
                .attr({
                    'x': width / 2 - width / 4,
                    'y': 25,
                    'width': width / 2,
                    'height': Math.abs(rectHeight - 15)
                })
                .style({
                    'fill': fill
                })
        }

        public drawFill(width: number, height: number, radius: number, padding: number, duration: number) {
            var innerRadius = radius * 0.8;
            var fillWidth = innerRadius * 0.7;
            var ZeroValue = height - (radius * 2) - padding;
            var fill = CylindericalGauge.getFill(this.dataView, 'fill').solid.color;

            var min = this.data.min;
            var max = this.data.max;
            var value = this.data.value > max ? max : this.data.value;
            var percentage = (ZeroValue - padding + 125) * ((value - min) / (max - min))

            var rectHeight = height - radius;
            this.fillCircle.attr({
                'cx': (width / 2) + (radius / 2) - 50,
                'cy': rectHeight > 30 ? rectHeight : 30,
                'rx': width / 4,
                'ry': 20
            }).style({
                'fill': fill
            });

            var yPos = ZeroValue - percentage + 125;
            this.bottomCircle.attr({
                'cx': (width / 2) + (radius / 2) - 50,
                'cy': yPos > 20 ? yPos : 20,
                'rx': width / 4,
                'ry': 20
            }).style({
                'fill': fill,
                'stroke-width': 2,
                'stroke': this.shadeColor(fill, 15)
            });

            this.fillRect
                .style({
                    'fill': fill
                })
                .attr({
                    'x': width / 2 - width / 4,
                    'width': width / 2,
                })
                .attr({
                    'y': yPos,
                    'height': Math.abs(rectHeight - ZeroValue + percentage - 125)
                })
        }
        private shadeColor(col: string, amt: number) {
            var usePound = false;
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
            var num = parseInt(col, 16);
            var r = (num >> 16) + amt;
            if (r > 255){
                r = 255;
            } else if (r < 0) {
                r = 0;
            }

            var b = ((num >> 8) & 0x00FF) + amt;
            if (b > 255) {
                b = 255;
            } else if (b < 0) {
                b = 0;
            }

            var g = (num & 0x0000FF) + amt;
            if (g > 255) {
                g = 255;
            } else if (g < 0) {
                g = 0;
            }
            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
        }

        private drawTicks(width: number, height: number, radius: number, padding: number) {
            d3.select(".y.axis").attr("visibility", "visible");
            var y, yAxis;
            y = d3.scale.linear().range([height - (radius * 2) - padding + 130, padding]);
            yAxis = d3.svg.axis().scale(y).ticks(4).orient("right");

            y.domain([this.data.min, this.data.max]).nice();
            this.tempMarkings
                .attr("transform", "translate(" + (width / 2 + width / 4 + 10) + ",0)")
                .style({
                    'font-size': '4vw',
                    'font-family': 'Segoe UI',
                    'stroke': 'none',
                    'fill': '#333'
                })
                .call(yAxis);
            this.tempMarkings.selectAll('.axis line, .axis path').style({
                'stroke': '#333',
                'fill': 'none'
            });

            if (!this.data.drawTickBar) {
                d3.select(".y.axis").attr("visibility", "hidden");
            }
        }

        private drawText(width: number, height: number, radius: number, padding: number) {
            this.text
                .text((this.data.value > this.data.max ? this.data.max : this.data.value) | 0)
                .attr({
                    'x': width / 2,
                    y: height - radius + 50,
                    'dy': '.35em'
                })
                .style({
                    'fill': 'black',
                    'text-anchor': 'middle',
                    'font-family': 'Segoe UI',
                    'font-size': '6vw'
                })
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            switch (options.objectName) {
                case 'config':
                    var config: VisualObjectInstance = {
                        objectName: 'config',
                        displayName: 'Configurations',
                        selector: null,
                        properties: {
                            fill: CylindericalGauge.getFill(dataView, 'fill'),
                            border: CylindericalGauge.getFill(dataView, 'border'),
                            max: CylindericalGauge.getValue < number > (dataView, 'max', 100),
                            min: CylindericalGauge.getValue < number > (dataView, 'min', 0),
                            tickBar: CylindericalGauge.getValue < boolean > (dataView, 'tickBar', true)
                        }
                    };
                    instances.push(config);
                    break;
            }

            return instances;
        }

        private static getFill(dataView: DataView, key): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var fill = < Fill > config[key];
                        if (fill)
                            return fill;
                    }
                }
            }
            if ('fill' === key) {
                return {
                    solid: {
                        color: '#84bde2'
                    }
                };
            }
            return {
                solid: {
                    color: '#f1f1f1'
                }
            };
        }

        private static getValue < T > (dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var size = < T > config[key];
                        if (size != null)
                            return size;
                    }
                }
            }
            return defaultValue;
        }
    }

}