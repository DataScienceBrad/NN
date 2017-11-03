module powerbi.extensibility.visual {
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    export interface IViewModel {
        value: number;
        color?: string;
        min?: number;
        max?: number;
        drawTickBar?: boolean;
    }

    export class CylindricalGauge implements IVisual {

        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        private div: d3.Selection<SVGElement>;
        private topCircle: d3.Selection<SVGElement>;
        private bottomCircle: d3.Selection<SVGElement>;
        private backCircle: d3.Selection<SVGElement>;
        private backRect: d3.Selection<SVGElement>;
        private fillCircle: d3.Selection<SVGElement>;
        private fillRect: d3.Selection<SVGElement>;
        private tempMarkings: d3.Selection<SVGElement>;
        private text: d3.Selection<SVGElement>;
        private data: IViewModel;
        public dataView: DataView;
        private textPosition: number;
        private enableAxis: boolean = true;
        private valueFormatter: utils.formatting.IValueFormatter;
        private labels: VisualObjectInstance;

        public static converter(dataView: DataView, colors: IColorPalette): IViewModel {
            if (!dataView.categorical || !dataView.categorical.values) {
                return;
            }
            const series: DataViewValueColumns = dataView.categorical.values;
            if (series && series.length > 0) {
                return {
                    value: <number>series[0].values[series[0].values.length - 1]
                };
            }
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.div = d3.select(options.element).append('div').classed('cylindricalGaugeBody', true);
            this.svg = this.div.append('svg').classed('CylindricalGauge', true);
            options.element.setAttribute('id', 'container');
            const mainGroup: d3.Selection<SVGElement> = this.svg.append('g');
            this.backRect = mainGroup.append('rect');
            this.backCircle = mainGroup.append('ellipse');
            this.fillRect = mainGroup.append('rect');
            this.fillCircle = mainGroup.append('ellipse');
            this.tempMarkings = this.svg.append('g').attr('class', 'yLabels axis');
            this.topCircle = mainGroup.append('ellipse');
            this.bottomCircle = mainGroup.append('ellipse');
            this.text = mainGroup.append('text');

        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions): void {
            if (!options.dataViews || 0 === options.dataViews.length) {
                return;
            }
            const dataView: DataView = options.dataViews[0];
            this.dataView = options.dataViews[0];

            this.data = CylindricalGauge.converter(options.dataViews[0], null);
            if (!this.data) {
                return;
            }
            if (options.dataViews[0].categorical.values[0].source.format &&
                options.dataViews[0].categorical.values[0].source.format.indexOf('%') !== -1) {
                this.data.max = CylindricalGauge.getValue(dataView, 'max', 1);
            } else {
                this.data.max = CylindricalGauge.getValue(dataView, 'max', 100);
            }

            this.data.min = CylindricalGauge.getValue(dataView, 'min', 0);
            this.data.drawTickBar = CylindricalGauge.getValue(dataView, 'tickBar', true);

            // to handle invalid datatypes
            if (typeof (this.data.value) === 'string' || typeof (this.data.value) === 'object') {
                this.data.value = 0;
            }

            // to handle value greater than max value
            if (this.data.value > this.data.max) {
                this.data.max = Math.ceil(this.data.value);
            }
            if (this.data.value < this.data.min) {
                this.data.min = Math.floor(this.data.value);
            }

            // to handle extreme cases where min is greater than max
            if (this.data.min >= this.data.max) {
                this.data.max = this.data.min + 10;
            }
            this.getFormatter(options);
            const viewport: IViewport = options.viewport;
            const height: number = viewport.height;
            const width: number = viewport.width;
            const visualheight: number = (height > 155 ? height - 5 : 150);

            const measureTextProperties: TextProperties = {
                text: 'ss',
                fontFamily: 'Segoe UI',
                fontSize: `${CylindricalGauge.getValue(this.dataView, 'fontSize', 25)}px`
            };
            let labelHeight: number = 0;
            labelHeight = textMeasurementService.measureSvgTextHeight(measureTextProperties);

            this.svg.attr({
                height: visualheight,
                width: width
            });

            this.div.style({
                height: `${height}px`,
                width: `${width}px`
            });
            //render on basis of label position
            if (CylindricalGauge.getValue(this.dataView, 'labelPosition', 'out').toString() === 'in') {
                this.draw(width, visualheight);
            } else {
                this.draw(width, visualheight - labelHeight + 15);
            }
            //adding ellipsis for ticks
            const tickstarting: number = parseInt(d3.select('.yLabels.axis').attr('transform').split('(')[1].split(',')[0], 10);
            const measureTextProperties1: TextProperties = {
                text: d3.selectAll('.tick:last-of-type text').text(),
                fontFamily: 'Segoe UI',
                fontSize: '14px'
            };

            let tickwidth: number = 0;
            tickwidth = textMeasurementService.measureSvgTextWidth(measureTextProperties1);
            const thisContext: this = this;
            const ticks: d3.selection.Group = this.svg.selectAll('.tick text')[0];
            ticks.forEach((element: EventTarget) => {
                // tslint:disable-next-line:no-any
                let ele: any;
                ele = element;
                ele.textContent = thisContext.getTMS(ele.textContent, 14, tickwidth +
                    (options.viewport.width - (tickwidth + tickstarting + 9)));
            });
        }
        private getFormatter(options: VisualUpdateOptions): void {
            //formatter for ticks
            let displayVal: number = 0;
            if (CylindricalGauge.getValue(this.dataView, 'ticksDisplayUnits', 0) === 0) {
                const valLen: number = this.data.max.toString().length;
                if (valLen > 9) {
                    displayVal = 1e9;
                } else if (valLen <= 9 && valLen > 6) {
                    displayVal = 1e6;
                } else if (valLen <= 6 && valLen >= 4) {
                    displayVal = 1e3;
                } else {
                    displayVal = 10;
                }
            }
            if (options.dataViews[0].categorical.values[0].source.format &&
                options.dataViews[0].categorical.values[0].source.format.indexOf('%') !== -1) {
                this.valueFormatter = ValueFormatter.create({
                    format: options.dataViews[0].categorical.values[0].source.format,
                    value: CylindricalGauge.getValue(this.dataView, 'displayUnits', 0) === 0 ?
                        0 : CylindricalGauge.getValue(this.dataView, 'displayUnits', 0),
                    precision: CylindricalGauge.getValue(this.dataView, 'decimalValue', 0)
                });
            } else {
                this.valueFormatter = ValueFormatter.create({
                    format: options.dataViews[0].categorical.values[0].source.format,
                    value: CylindricalGauge.getValue(this.dataView, 'displayUnits', 0) === 0 ?
                        displayVal : CylindricalGauge.getValue(this.dataView, 'displayUnits', 0),
                    precision: CylindricalGauge.getValue(this.dataView, 'decimalValue', 0)
                });
            }
        }
        public draw(width: number, height: number): void {
            const radius: number = 100;
            const padding: number = radius * 0.25;
            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, padding);

            if (this.data.drawTickBar && width > 230) {
                this.enableAxis = true;
                this.drawTicks(width, height, radius, padding);
            } else {
                d3.select('.yLabels.axis').attr('visibility', 'hidden');
                this.enableAxis = false;
            }

            this.drawText(width, height, radius, padding);
            d3.select('#yLabels axis').remove();
        }

        public drawBack(width: number, height: number, radius: number): void {
            const rectHeight: number = height - radius / 2;
            const fill: string = CylindricalGauge.getFill(this.dataView, 'border').solid.color;
            this.backCircle
                .attr({
                    cx: (width / 2) + (radius / 2) - 50,
                    cy: rectHeight,
                    rx: width / 4,
                    ry: 20
                })
                .style({
                    fill: fill,
                    stroke: this.shadeColor(fill, -20),
                    'stroke-width': '10px'
                });

            this.topCircle
                .attr({
                    cx: (width / 2) + (radius / 2) - 50,
                    cy: 30,
                    rx: width / 4,
                    ry: 20
                })
                .style({
                    fill: fill,
                    'stroke-width': 2,
                    stroke: this.shadeColor(fill, 15)
                });

            this.backRect
                .attr({
                    x: width / 2 - width / 4,
                    y: 27,
                    width: width / 2,
                    height: rectHeight - 19
                })
                .style({
                    fill: fill
                });
        }

        public drawFill(width: number, height: number, radius: number, padding: number): void {
            const fill: string = CylindricalGauge.getFill(this.dataView, 'fill').solid.color;
            const min: number = this.data.min;
            const max: number = this.data.max;
            const value: number = this.data.value > max ? max : this.data.value;
            const rectHeight: number = height - radius / 2;
            // 30 since we are providing value of cy for top circle as 30.
            const percentage: number = (rectHeight - 30) * ((value - min) / (max - min));
            this.fillCircle.attr({
                cx: (width / 2) + (radius / 2) - 50,
                cy: rectHeight,
                rx: width / 4,
                ry: 20
            }).style({
                fill: fill
            });

            const yPos: number = rectHeight - percentage;
            this.textPosition = yPos + percentage - 15;
            this.bottomCircle.attr({
                cx: (width / 2) + (radius / 2) - 50,
                cy: yPos,
                rx: width / 4,
                ry: 20
            }).style({
                fill: fill,
                'stroke-width': 2,
                stroke: this.shadeColor(fill, 15)
            });

            this.fillRect
                .style({
                    fill: fill
                })
                .attr({
                    x: width / 2 - width / 4,
                    width: width / 2
                })
                .attr({
                    y: yPos,
                    height: percentage
                });
        }

        private shadeColor(col: string, amt: number): string {
            let usePound: boolean = false;
            if (col[0] === '#') {
                col = col.slice(1);
                usePound = true;
            }
            const num: number = parseInt(col, 16);
            let r: number = (num >> 16) + amt;
            if (r > 255) {
                r = 255;
            } else if (r < 0) {
                r = 0;
            }

            let b: number = ((num >> 8) & 0x00FF) + amt;
            if (b > 255) {
                b = 255;
            } else if (b < 0) {
                b = 0;
            }

            let g: number = (num & 0x0000FF) + amt;
            if (g > 255) {
                g = 255;
            } else if (g < 0) {
                g = 0;
            }

            return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
        }

        private drawTicks(width: number, height: number, radius: number, padding: number): void {
            d3.select('.yLabels.axis').attr('visibility', 'visible');
            // tslint:disable-next-line:no-any
            let y: any; let yAxis: any;
            y = d3.scale.linear().range([height - radius / 2, padding]);
            yAxis = d3.svg.axis().scale(y).ticks(4).orient('right').tickFormat(this.valueFormatter.format);

            y.domain([this.data.min, this.data.max]).nice();
            this.tempMarkings
                .attr('transform', `${'translate('}${(width / 2 + width / 4 + 10)}${', 2)'}`)
                .style({
                    'font-family': 'Segoe UI',
                    'font-size': '14px',
                    stroke: 'none',
                    fill: CylindricalGauge.getFill(this.dataView, 'tickColor').solid.color
                })
                .call(yAxis);

            if (height) {
                this.tempMarkings.selectAll('.axis line, .axis path').style({
                    stroke: CylindricalGauge.getFill(this.dataView, 'tickColor').solid.color,
                    fill: 'none'
                });
            }
            //tooltip information adding
            const tooptipFormatter: utils.formatting.IValueFormatter = ValueFormatter.create({
                format: this.dataView.categorical.values[0].source.format
            });
            d3.selectAll('.yLabels.axis>.tick')
                .append('title')
                .text(function (d: string): string {
                    return tooptipFormatter.format(d);
                });
        }

        private drawText(width: number, height: number, radius: number, padding: number): void {
            this.text
                .classed('labeltext', true)
                .text(this.getTMS(this.valueFormatter.format(this.data.value > this.data.max ? this.data.max : this.data.value),
                                  CylindricalGauge.getValue(this.dataView, 'fontSize', 25), width / 2))

                .style({
                    fill: CylindricalGauge.getFill(this.dataView, 'dataColor').solid.color,
                    'text-anchor': 'middle',
                    'font-family': 'Segoe UI',
                    'font-size': `${CylindricalGauge.getValue(this.dataView, 'fontSize', 25)}px`
                });
            //tooltip information adding
            const tooptipFormatter: utils.formatting.IValueFormatter = ValueFormatter.create({
                format: this.dataView.categorical.values[0].source.format
            });
            this.text.append('title')
                .text(tooptipFormatter.format(this.data.value > this.data.max ? this.data.max : this.data.value));
            //label position in/out
            if (CylindricalGauge.getValue(this.dataView, 'labelPosition', 'out').toString() === 'in') {
                d3.select('.labeltext')
                    .attr({
                        x: width / 2,
                        y: this.textPosition,
                        dy: '-.35em'
                    });
            } else {
                if (CylindricalGauge.getValue(this.dataView, 'fontSize', 25) > 17) {
                    d3.select('.labeltext')
                        .attr({
                            x: width / 2,
                            y: height - radius / 2 + 50,
                            dy: '.45em'

                        });
                } else {
                    d3.select('.labeltext')
                        .attr({
                            x: width / 2,
                            y: height - radius / 2 + 45,
                            dy: '-.15em'

                        });
                }
            }
        }
        public getTMS(stringName: string, textSize: number, width: number): string {
            const measureTextProperties: TextProperties = {
                text: stringName,
                fontFamily: 'Segoe UI',
                fontSize: `${textSize}px`
            };

            return textMeasurementService.getTailoredTextOrDefault(measureTextProperties, width);
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            const instances: VisualObjectInstance[] = [];
            const dataView: DataView = this.dataView;
            switch (options.objectName) {
                case 'config':
                    const config: VisualObjectInstance = {
                        objectName: 'config',
                        displayName: 'Configurations',
                        selector: null,
                        properties: {
                            fill: CylindricalGauge.getFill(dataView, 'fill'),
                            border: CylindricalGauge.getFill(dataView, 'border'),
                            max: this.data.max,
                            min: this.data.min,
                            tickBar: this.enableAxis,
                            tickColor: CylindricalGauge.getFill(dataView, 'tickColor')
                        }
                    };
                    instances.push(config);
                    break;
                case 'labels':
                    this.labels = {
                        objectName: 'labels',
                        displayName: 'Data label',
                        selector: null,
                        properties: {
                            labelPosition: CylindricalGauge.getValue(dataView, 'labelPosition', 'out'),
                            fontSize: CylindricalGauge.getValue(dataView, 'fontSize', 25),
                            dataColor: CylindricalGauge.getFill(dataView, 'dataColor'),
                            displayUnits: CylindricalGauge.getValue(dataView, 'displayUnits', 0),
                            decimalValue: CylindricalGauge.getValue(dataView, 'decimalValue', 0)
                        }
                    };
                    instances.push(this.labels);
                    break;
                default:
                    break;

            }

            return instances;
        }

        private static getFill(dataView: DataView, key: string): Fill {
            if (dataView) {
                const configuration: string = 'config';
                const labelF: string = 'labels';
                const objects: DataViewObject = dataView.metadata.objects;
                if (objects) {
                    const config: DataViewPropertyValue = objects[configuration];
                    if (config) {
                        const fill: Fill = <Fill>config[key];
                        if (fill) {
                            return fill;
                        }
                    }
                }
                if (objects) {
                    const config: DataViewPropertyValue = objects[labelF];
                    if (config) {
                        const fill: Fill = <Fill>config[key];
                        if (fill) {
                            return fill;
                        }
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
            if ('dataColor' === key) {
                return {
                    solid: {
                        color: '#000'
                    }
                };
            }
            if ('tickColor' === key) {
                return {
                    solid: {
                        color: '#000'
                    }
                };
            }

            return {
                solid: {
                    color: '#f1f1f1'
                }
            };
        }

        private static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                const objects: DataViewObject = dataView.metadata.objects;
                if (objects) {
                    const configuration: string = 'config';
                    const config: DataViewPropertyValue = objects[configuration];
                    if (config) {
                        const size: T = <T>config[key];
                        if (size != null) {
                            return size;
                        }
                    }
                }
                if (objects) {
                    const d1: string = 'decimalValue';
                    let config: DataViewPropertyValue;
                    const labelF: string = 'labels';
                    config = objects[labelF];
                    if (config) {
                        if (config[d1] > 4) {
                            config[d1] = 4;
                        } else if (config[d1] < 0) {
                            config[d1] = 0;
                        }
                        const label: T = <T>config[key];
                        if (label != null) {
                            return label;
                        }
                    }
                }
            }

            return defaultValue;
        }
    }
}
