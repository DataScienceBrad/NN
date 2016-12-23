module powerbi.extensibility.visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230872  {

    export interface ViewModel {
        value: number;
        color?: string;
        min?: number;
        max?: number;
        drawTickBar?: boolean;
    }

    export class Thermometer implements IVisual {

        private viewport: IViewport;
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        private backCircle: d3.Selection<SVGElement>;
        private backRect: d3.Selection<SVGElement>;
        private fillCircle: d3.Selection<SVGElement>;
        private fillRect: d3.Selection<SVGElement>;
        private tempMarkings: d3.Selection<SVGElement>;
        private text: d3.Selection<SVGElement>;
        private data: ViewModel;
        public dataView: DataView;

        private prevDataViewObjects: any = {};

        public static converter(dataView: DataView, colors: IDataColorPalette): ViewModel {
            var series = dataView.categorical.values;
            return { value: series[0].values[series[0].values.length - 1] }
        }


        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.viewport;
            let svg = this.svg = d3.select(options.element).append('svg').classed('Thermometer', true);
            options.element.setAttribute("id", "container");
            var mainGroup = svg.append('g');
            this.backRect = mainGroup.append('rect');
            this.backCircle = mainGroup.append('circle');
            this.fillRect = mainGroup.append('rect');
            this.fillCircle = mainGroup.append('circle');
            this.text = mainGroup.append('text');
            this.tempMarkings = svg.append("g").attr("class", "y axis");

        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews)
                return;
            if (0 === options.dataViews.length)
                return;
            var dataView = options.dataViews[0];
            this.dataView = options.dataViews[0];
            this.data = Thermometer.converter(options.dataViews[0], null);
            this.data.max = Thermometer.getValue(dataView, 'max', 100);
            this.data.min = Thermometer.getValue(dataView, 'min', 0);
            this.data.drawTickBar = Thermometer.getValue(dataView, 'tickBar', true);
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

            this.svg.attr({ 'height': height, 'width': width });
            this.draw(width, height, duration);
        }

        public draw(width: number, height: number, duration: number) {
            var radius = height * 0.1;
            var padding = radius * 0.25;
            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, padding, duration);
            this.drawTicks(width, height, radius, padding);
            this.drawText(width, height, radius, padding);
            d3.select("#y axis").remove();
            
        }

        public drawBack(width: number, height: number, radius: number) {
            var rectHeight = height - radius;
            var fill = Thermometer.getFill(this.dataView, 'border').solid.color;//'D3C8B4';
            this.backCircle
                .attr({
                    'cx': width / 2,
                    'cy': rectHeight,
                    'r': radius
                })
                .style({
                    'fill': fill
                });

            this.backRect
                .attr({
                    'x': (width - radius) / 2,
                    'y': 0,
                    'width': radius,
                    'height': rectHeight
                })
                .style({
                    'fill': fill
                })
        }

        public drawFill(width: number, height: number, radius: number, padding: number, duration: number) {
            var innerRadius = radius * 0.8;
            var fillWidth = innerRadius * 0.7;
            var ZeroValue = height - (radius * 2) - padding;
            var fill = Thermometer.getFill(this.dataView, 'fill').solid.color;

            var min = this.data.min;
            var max = this.data.max;
            var value = this.data.value > max ? max : this.data.value;

            var percentage = (ZeroValue - padding) * ((value - min) / (max - min))

            var rectHeight = height - radius;
            this.fillCircle.attr({
                'cx': width / 2,
                'cy': rectHeight,
                'r': innerRadius
            }).style({
                    'fill': fill
                });

            this.fillRect
                .style({
                    'fill': fill
                })
                .attr({
                    'x': (width - fillWidth) / 2,
                    'width': fillWidth,
                })
                .attr({
                    'y': ZeroValue - percentage,
                    'height': rectHeight - ZeroValue + percentage
                })
        }

        private drawTicks(width: number, height: number, radius: number, padding: number) {
                d3.select(".y.axis").attr("visibility", "visible");
                var y, yAxis;
                var postFix = Thermometer.getValue(this.dataView, 'postfix', '');
                console.log(postFix);
                y = d3.scale.linear().range([height - (radius * 2) - padding, padding]);
                yAxis = d3.svg.axis().scale(y).ticks(6).orient("right");
                y.domain([this.data.min, this.data.max]);
                this.tempMarkings
                    .attr("transform", "translate(" + ((width + radius) / 2 + (radius * 0.15)) + ",0)")
                    .style({
                        'font-size': (radius * 0.03) + 'em',
                        'font-family': 'Segoe UI',
                        'stroke': 'none',
                        'fill': '#333'
                    })
                    .call(yAxis);
                this.tempMarkings.selectAll('.axis line, .axis path').style({ 'stroke': '#333', 'fill': 'none' });
                for(var iCount = 0; iCount < document.querySelectorAll('.axis text').length; iCount++) {
                    document.querySelectorAll('.axis text')[iCount].innerHTML = document.querySelectorAll('.axis text')[iCount].innerHTML + ' ' + postFix;
                }

                if (!this.data.drawTickBar) {
                    d3.select(".y.axis").attr("visibility", "hidden");
                }
       }

        private drawText(width: number, height: number, radius: number, padding: number) {
            this.text
                .text((this.data.value > this.data.max ? this.data.max : this.data.value) | 0)
                .attr({ 'x': width / 2, y: height - radius, 'dy': '.35em' })
                .style({
                    'fill': Thermometer.getFill(this.dataView, 'fontColor').solid.color,
                    'text-anchor': 'middle',
                    'font-family': 'Segoe UI',
                    'font-size': (radius * 0.03) + 'em'
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
                            fill: Thermometer.getFill(dataView, 'fill'),
                            border: Thermometer.getFill(dataView, 'border'),
                            max: Thermometer.getValue<number>(dataView, 'max', 100),
                            min: Thermometer.getValue<number>(dataView, 'min', 0),
                            tickBar: Thermometer.getValue<boolean>(dataView, 'tickBar', true),
                            fontColor: Thermometer.getFill(dataView, 'fontColor'),
                            postfix: Thermometer.getValue<string>(dataView, 'postfix', '')
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
                        var fill = <Fill>config[key];
                        if (fill)
                            return fill;
                    }
                }
            }
            if ('fill' === key) {
                return { solid: { color: '#30ADFF' } };
            } else if ('fontColor' === key) {
                return { solid: { color: '#000' } };
            }
            return { solid: { color: '#D0EEF7' } };
        }

        private static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var size = <T>config[key];
                        if (size != null)
                            return size;
                    }
                }
            }
            return defaultValue;
        }
    }

}