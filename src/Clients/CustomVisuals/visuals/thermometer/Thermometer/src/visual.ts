module powerbi.extensibility.visual {

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
        private mainGroup: d3.Selection<SVGElement>;
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
            if(dataView && dataView.categorical) {
                var series = dataView.categorical.values;
                if(series && 0 !== series.length) {
                    var value:any = series[0].values[series[0].values.length - 1];
                    if (!(isFinite(value) && parseFloat(value) == value)) {
                        return {value:0}
                    }
                    return { value: series[0].values[series[0].values.length - 1] }
                }
            }
            return {value:0};
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.viewport;
            let svg = this.svg = d3.select(options.element).append('svg').classed('Thermometer', true);
            options.element.setAttribute("id", "container");
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
            this.data.max = Thermometer.getValue(this.dataView, 'max', 100);
            this.data.min = Thermometer.getValue(this.dataView, 'min', 0);
            this.data.drawTickBar = Thermometer.getValue(this.dataView, 'tickBar', true);
            // to handle value greater than max value
            if (this.data.value > this.data.max) {
                this.data.max = Math.ceil(this.data.value);
            }
            if (this.data.value < this.data.min) {
                this.data.min = Math.floor(this.data.value);
            }
            if (this.data.min >= this.data.max) {
                this.data.min = this.data.max-1;
            }
            if (this.dataView.metadata.objects && this.dataView.metadata.objects['config']) {
                this.dataView.metadata.objects['config']['max'] = this.data.max;
                this.dataView.metadata.objects['config']['min'] = this.data.min;
            }
            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;
            var duration = 1000;

            this.svg.attr({ 'height': height, 'width': width });
            this.draw(width, height, duration);
        }

        public draw(width: number, height: number, duration: number) {
            this.svg.selectAll("*").remove();
            this.mainGroup = this.svg.append('g');
            this.backRect = this.mainGroup.append('rect');
            this.backCircle = this.mainGroup.append('circle');
            this.fillRect = this.mainGroup.append('rect');
            this.fillCircle = this.mainGroup.append('circle');
            this.text = this.mainGroup.append('text');
            this.tempMarkings = this.svg.append("g").attr("class", "y axis");
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
            var value: any = this.data.value > max ? max : this.data.value;
            //check if value is a number 
            if (!(isFinite(value) && parseFloat(value) == value)) {
                var date = Date.parse(value);
                if (!isNaN(date)) {
                    this.data.value = 0;
                    this.data.max = Thermometer.getValue(this.dataView, 'max', 100);
                    this.data.min = Thermometer.getValue(this.dataView, 'min', 0);
                }
                min = 0;
                max = 100;
                value = 0;
           }
            
            var percentage = (ZeroValue - padding) * ((value - min) / (max - min))
            var rectHeight = height - radius;
            if (isNaN(rectHeight)) {
                rectHeight = 0;
            }
            if (isNaN(percentage)) {
                percentage = 0;
            }
            this.fillCircle.attr({
                'cx': width / 2,
                'cy': rectHeight,
                'r': innerRadius
            }).style({
                    'fill': fill
                });
            if (rectHeight !== 0 && percentage !== 0) {
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
                    });
            }
            
        }

        private drawTicks(width: number, height: number, radius: number, padding: number) {
            d3.select(".y.axis").attr("visibility", "visible");
            var y, yAxis;
            var postFix = Thermometer.getValue(this.dataView, 'postfix', '');
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
            for (var iCount = 0; iCount < document.querySelectorAll('.axis text').length; iCount++) {
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
                            max: Thermometer.getValue<number>(dataView, 'max', this.data.max),
                            min: Thermometer.getValue<number>(dataView, 'min', this.data.min),
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