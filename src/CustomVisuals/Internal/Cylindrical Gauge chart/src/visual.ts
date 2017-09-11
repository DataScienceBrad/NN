module powerbi.extensibility.visual {
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    export interface ViewModel {
        value: number;
        color?: string;
        min?: number;
        max?: number;
        drawTickBar?: boolean;
        fontSize?: number;
        interval?: number;
        drawTargetLine?: boolean;
    }

    export class CylindericalGauge implements IVisual {
        private viewport: IViewport;
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        private div: d3.Selection<SVGElement>;
        private topCircle: d3.Selection<SVGElement>;
        private bottomCircle: d3.Selection<SVGElement>;
        private targetCircle: d3.Selection<SVGElement>;
        private backCircle: d3.Selection<SVGElement>;
        private backRect: d3.Selection<SVGElement>;
        private fillCircle: d3.Selection<SVGElement>;
        private fillRect: d3.Selection<SVGElement>;
        private tempMarkings: d3.Selection<SVGElement>;
        private text: d3.Selection<SVGElement>;
        private data: ViewModel;
        public dataView: DataView;
        private prevDataViewObjects: any = {};
        private enableAxis: boolean = true;

        public static converter(dataView: DataView, colors: IColorPalette): ViewModel {
            if (!dataView.categorical || !dataView.categorical.values) {
                return
            }
            var series = dataView.categorical.values;
            if (series && series.length > 0)
                return {
                    value: <number>series[0].values[series[0].values.length - 1]
                }
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.div = d3.select(options.element).append('div').classed('cylindericalGaugeBody', true);
            this.svg = this.div.append('svg').classed('CylindericalGauge', true);
            options.element.setAttribute("id", "container");
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || 0 === options.dataViews.length)
                return;
            var viewport = options.viewport;
            var width = options.viewport.width;
            var height = options.viewport.height;
            this.div.style({
                'height': height + 'px',
                'width': width + 'px',
            });

            this.svg.attr({
                'height': height,
                'width': width,
            });

            d3.select('.cylindericalGaugeBody').style("overflow-y", "auto");
            var dataView = options.dataViews[0];
            this.dataView = options.dataViews[0];
            this.svg.selectAll("*").remove();
            var mainGroup = this.svg.append('g');
            this.backRect = mainGroup.append('rect');
            this.backCircle = mainGroup.append('ellipse');
            this.fillRect = mainGroup.append('rect');
            this.fillCircle = mainGroup.append('ellipse');
            this.tempMarkings = this.svg.append("g").attr("class", "yLabels axis");
            this.topCircle = mainGroup.append('ellipse');
            this.bottomCircle = mainGroup.append('ellipse');
            this.targetCircle = mainGroup.append('ellipse');
            this.text = mainGroup.append('text');

            if (!dataView.categorical || !dataView.categorical.values || dataView.categorical.values.length < 2) {

                d3.select('#container').attr({ "style": null });
                this.svg.selectAll("*").remove();
                d3.select('#container').append('svg').attr({ "width": width, "height": height });

                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Select data for both the fields");
                d3.select('.cylindericalGaugeBody').style("overflow-y", "hidden");
                return;
            }
            this.data = CylindericalGauge.converter(options.dataViews[0], null);
            if (!this.data) {
                return;
            }

            // to handle invalid datatypes
            if (typeof (this.data.value) !== 'number' || typeof (dataView.categorical.values[1].values[0]) !== 'number') {
                d3.select('#container').attr({ "style": null });
                this.svg.selectAll("*").remove();
                d3.select('#container').append('svg').attr({ "width": width, "height": height });

                d3.select('svg').append('text').attr({ "x": width / 2, "y": height / 2, "font-size": "20px", "text-anchor": "middle" }).text("Data type not supported");
                d3.select('.cylindericalGaugeBody').style("overflow-y", "hidden");
                return;
            }

            var iActual, iTarget, iMax, iMin, iDiff, iMinimum, iMaximum;
            var iNumofInterval, iTemp;
            iActual = this.data.value;
            iTemp = iActual.toFixed(0) / 1;
            if (iActual !== iTemp) {
                iActual = iActual.toFixed(1) / 1;
            }
            iTarget = dataView.categorical.values[1].values[0];
            iTemp = iTarget.toFixed(0) / 1;
            if (iTarget !== iTemp) {
                iTarget = iTarget.toFixed(1) / 1;
            }
            if (iTarget >= 0 && iActual >= 0) {
                iMin = 0;
                iMax = (iActual > iTarget) ? iActual : iTarget;
            }
            else {
                if (iTarget > iActual) {
                    iMax = iTarget;
                    iMin = iActual;
                }
                else if (iTarget < iActual) {
                    iMin = iTarget;
                    iMax = iActual;
                }
                else {
                    iMin = iActual - 5;
                    iMax = iActual;
                }
            }
            this.data.max = CylindericalGauge.getValue(dataView, 'max', iMax);
            this.data.min = CylindericalGauge.getValue(dataView, 'min', iMin);
            this.data.drawTickBar = CylindericalGauge.getValue(dataView, 'tickBar', true);
            this.data.fontSize = <number>CylindericalGauge.getValue(dataView, 'fontSize', 25);
            this.data.drawTargetLine = CylindericalGauge.getValue(dataView, 'showTarget', false);
            if (iMax > this.data.max) {
                this.data.max = iMax;
            }
            if (this.data.min > iMin) {
                this.data.min = iMin;
            }
            iTemp = this.data.min;
            if (this.data.min !== <any>iTemp.toFixed(0) / 1) {
                this.data.min = <any>iTemp.toFixed(1) / 1;
            }
            iTemp = this.data.max;
            if (this.data.max !== <any>iTemp.toFixed(0) / 1) {
                this.data.max = <any>iTemp.toFixed(1) / 1;
            }
            if ((this.data.max - this.data.min) > 0.5) {
                var setInterval = (this.data.max - this.data.min) / 5;
            }
            else {
                var setInterval = 0.1;
            }
            if (setInterval !== <any>setInterval.toFixed(0) / 1) {
                setInterval = <any>setInterval.toFixed(1) / 1;
            }

            var iComputeInterval = <number>CylindericalGauge.getValue(dataView, 'interval', setInterval);

            if (iComputeInterval !== <any>iComputeInterval.toFixed(0) / 1) {
                iComputeInterval = <any>iComputeInterval.toFixed(1) / 1;
            }
            if (iComputeInterval < 0) {
                iComputeInterval = setInterval;
            }
            iNumofInterval = (this.data.max - this.data.min) / iComputeInterval;
            var iThreshold = 12;
            if (iNumofInterval <= 1) {
                iComputeInterval = (this.data.max - this.data.min);
                this.data.interval = iComputeInterval;
            }
            if (iNumofInterval <= 4) {
                var visualheight = height > 155 ? height - 5 : 150;
            }
            else if (iNumofInterval < 7) {
                var visualheight = height > 310 ? height - 5 : 305;
            }
            else if (iNumofInterval < 13) {
                var visualheight = height > 620 ? height - 5 : 615;
            }
            else {
                iComputeInterval = (this.data.max - this.data.min) / 12;
                if (iComputeInterval !== <any>iComputeInterval.toFixed(0) / 1) {
                    iComputeInterval = <any>iComputeInterval.toFixed(1) / 1;
                }
                if (this.data.max - this.data.min !== 0) {
                    var iCount = 12;
                    while ((this.data.max - this.data.min) / iComputeInterval > 12) {
                        iCount--;
                        iComputeInterval = (this.data.max - this.data.min) / iCount;
                        if (iComputeInterval !== <any>iComputeInterval.toFixed(0) / 1) {
                            iComputeInterval = <any>iComputeInterval.toFixed(1) / 1;
                        }
                    }
                }
                var visualheight = height > 620 ? height - 5 : 615;
            }
            this.data.interval = iComputeInterval;
            iNumofInterval = (this.data.max - this.data.min) / iComputeInterval;
            this.div.style({
                'height': height + 'px',
                'width': width + 'px'
            });

            this.svg.attr({
                'height': visualheight,
                'width': width
            });
            this.draw(width, visualheight, this.data.max, this.data.min, iTarget, iComputeInterval, iNumofInterval);
        }

        public overlapping(width: number, space: number, fXCoord: number, fYCoord: number, sText: string) {
            let textProperties: TextProperties = {
                text: sText,
                fontFamily: 'Segoe UI',
                fontSize: this.data.fontSize + "px"
            };
            var fTextWidth, iTextHeight;
            fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);

            if (width - space >= fTextWidth) {
                this.svg.append("text")
                    .attr({ "x": (fXCoord) + "px", "y": (fYCoord + iTextHeight / 8) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                    .style({
                        'font-family': 'Segoe UI',
                        'stroke': 'none',
                        'fill': '#333'
                    })
                    .text(sText)
                    .append("svg:title")
                    .text(function (d) { return sText });
            }
            else {
                var sNewText;
                var iNumofCharsAllowed, iNumofChars, fAvailSpace, fCharSpace;
                iNumofChars = sText.length;
                fAvailSpace = width - fXCoord;
                if (iNumofChars) {
                    fCharSpace = fTextWidth / iNumofChars;
                }
                if (fCharSpace) {
                    iNumofCharsAllowed = fAvailSpace / fCharSpace;
                }
                if (iNumofCharsAllowed > 3) {
                    sNewText = sText.substring(0, iNumofCharsAllowed - 2) + "...";
                }
                else if (iNumofCharsAllowed > 1) {
                    sNewText = sText.substring(0, 1) + "..."
                }
                else {
                    sNewText = "..."
                }
                this.svg.append("text")
                    .attr({ "x": (width / 2 + width / 4 + 18) + "px", "y": (fYCoord + iTextHeight / 8) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                    .text(sNewText)
                    .append("svg:title")
                    .text(function (d) { return sText });
            }
        }

        /** This function calls other functions to draw the chart*/
        public draw(width: number, height: number, iMaxm: number, iMinm: number, tar: number, iComputeInterval: number, iNumofInterval: number) {
            var radius = 100;
            var padding = radius * 0.25;
            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, padding);
            if (this.data.min !== 0 || this.data.max !== 0) {
                if (this.data.drawTickBar && width > 230) {
                    this.enableAxis = true;
                    this.drawTicks(width, height, radius, padding, iComputeInterval, iNumofInterval);
                } else {
                    d3.select(".yLabels.axis").attr("visibility", "hidden");
                    this.enableAxis = false;
                }
            }
            if (this.data.drawTargetLine) {
                this.drawTargetLine1(width, height, radius, padding, tar);
            }
            this.drawTarget(width, height, radius, padding, iMaxm, iMinm, tar);
            this.drawText(width, height, radius, padding);
            d3.select("#yLabels axis").remove();
        }

        /** This function draws the background of the chart*/
        public drawBack(width: number, height: number, radius: number) {
            var rectHeight = height - radius / 2;
            var fill = CylindericalGauge.getFill(this.dataView, 'border').solid.color;
            this.backCircle
                .attr({
                    'cx': (width / 2) + (radius / 2) - 50,
                    'cy': rectHeight,
                    'rx': width / 4,
                    'ry': 20
                })
                .style({
                    'fill': fill,
                    'stroke': fill.toString(),
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
                    'y': 27,
                    'width': width / 2,
                    'height': rectHeight - 19,
                })
                .style({
                    'fill': fill
                });
        }

        /** This function draws the marker fo target on the cylinder*/
        public drawTargetLine1(width: number, height: number, radius: number, padding: number, tar: number) {
            var yPos;
            var fill = CylindericalGauge.getFill(this.dataView, 'targetColor').solid.color;
            var min = this.data.min;
            var max = this.data.max;
            var rectHeight = height - radius / 2;
            var percentage;
            if (max - min !== 0) {
                percentage = (rectHeight - 30) * ((tar - min) / (max - min));
            }
            else {
                percentage = (rectHeight - 30);
            }
            yPos = rectHeight - percentage;
            this.targetCircle.attr({
                'cx': (width / 2) + (radius / 2) - 50,
                'cy': yPos,
                'rx': width / 4,
                'ry': 20
            }).style({
                'fill': "transparent",
                'stroke-width': 2,
                'stroke': fill.toString()
            });
        }

        /** This function fills the cylinder */
        public drawFill(width: number, height: number, radius: number, padding: number) {
            var fill = CylindericalGauge.getFill(this.dataView, 'fill').solid.color;
            var min = this.data.min;
            var max = this.data.max;
            var value = this.data.value > max ? max : this.data.value;
            var rectHeight = height - radius / 2;
            if (max - min !== 0) {
                var percentage = (rectHeight - 30) * ((value - min) / (max - min));
            }
            else {
                var percentage = (rectHeight - 30);
            }

            this.fillCircle.attr({
                'cx': (width / 2) + (radius / 2) - 50,
                'cy': rectHeight,
                'rx': width / 4,
                'ry': 20
            }).style({
                'fill': fill
            });
            var yPos = rectHeight - percentage;
            this.bottomCircle.attr({
                'cx': (width / 2) + (radius / 2) - 50,
                'cy': yPos,
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
                    'height': percentage
                });
        }

        private shadeColor(col: string, amt: number) {
            var usePound = false;
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
            var num = parseInt(col, 16);
            var r = (num >> 16) + amt;
            if (r > 255) {
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

        /** This function draws the ticks and tick labels for the chart */
        private drawTicks(width: number, height: number, radius: number, padding: number, iComputeInterval: number, iNumofInterval: number) {
            d3.select(".yLabels.axis").attr("visibility", "visible");
            var sText;
            var y, yAxis;
            var postFix = CylindericalGauge.getValue(this.dataView, 'postfix', '');
            var iTemp1 = iComputeInterval, iTemp2 = this.data.max, iTemp3 = this.data.min;
            var flag = 0;
            var iNumofInterval1 = Math.floor(iNumofInterval);
            if (iComputeInterval !== <any>iTemp1.toFixed(0) / 1 || this.data.max !== <any>iTemp2.toFixed(0) / 1 || this.data.min !== <any>iTemp3.toFixed(0) / 1) {
                flag = 1;
            }
            if (this.data.max !== <any>iTemp2.toFixed(0) / 1) {
                sText = (this.data.max).toFixed(1) + " " + postFix;
            }
            else {
                sText = this.data.max + " " + postFix;
            }

            var iTextHeight;
            let textProperties: TextProperties = {
                text: "9",
                fontFamily: 'Segoe UI',
                fontSize: this.data.fontSize + "px"
            };
            iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);
            var pos1, pos2, rectHeight, percentage;
            rectHeight = height - radius / 2;
            percentage = (rectHeight - 30) * ((this.data.min + ((iNumofInterval1) * iComputeInterval) - this.data.min) / (this.data.max - this.data.min));
            pos1 = rectHeight - percentage;
            percentage = (rectHeight - 30) * ((this.data.max - this.data.min) / (this.data.max - this.data.min));
            pos2 = rectHeight - percentage;

            if (iNumofInterval1 === 1 && this.data.min + iComputeInterval !== this.data.max) {

                percentage = (rectHeight - 30) * ((this.data.min + ((iNumofInterval1) * iComputeInterval) - this.data.min) / (this.data.max - this.data.min));
                pos1 = rectHeight - percentage;
                percentage = (rectHeight - 30) * ((this.data.max - this.data.min) / (this.data.max - this.data.min));
                pos2 = rectHeight - percentage;
                if ((this.data.min + ((iNumofInterval1) * iComputeInterval) < this.data.max) && pos1 - pos2 <= iTextHeight / 2) {
                    y = d3.scale.linear().domain([this.data.min, this.data.max]).range([height - radius / 2, padding]);
                    yAxis = d3.svg.axis().scale(y).tickValues(d3.range(this.data.min, this.data.max - iComputeInterval, iComputeInterval)).tickFormat(function (d) {
                        return d;
                    }).orient("right");

                    this.tempMarkings
                        .attr("transform", "translate(" + (width / 2 + width / 4 + 10) + ", 2)")
                        .style({
                            'font-family': 'Segoe UI',
                            'font-size': (this.data.fontSize * 20) / 40 + "px",
                            'stroke': 'none',
                            'fill': '#333'
                        })
                        .call(yAxis);

                    this.tempMarkings.selectAll("text").remove();

                    if (height)
                        this.tempMarkings.selectAll('.axis line, .axis path').style({
                            'stroke': '#333',
                            'fill': 'none'
                        });

                    var iCounter = 0, iPrev = this.data.min;
                    sText = this.data.min + iComputeInterval + " " + postFix;
                    this.svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", width / 2 + width / 4 + 10)
                        .attr("y1", pos1)
                        .attr("x2", width / 2 + width / 4 + 15)
                        .attr("y2", pos1 + 18);
                    this.svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", width / 2 + width / 4 + 19)
                        .attr("y1", pos1 + 18)
                        .attr("x2", width / 2 + width / 4 + 15)
                        .attr("y2", pos1 + 18);

                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 20, pos1 + 18, sText);
                    if (this.data.max !== <any>iTemp2.toFixed(0) / 1) {
                        sText = (this.data.max).toFixed(1) + " " + postFix;
                    }
                    else {
                        sText = this.data.max + " " + postFix;
                    }
                    sText = this.data.min + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = 0;
                    var yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    sText = this.data.max + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = (rectHeight - 30);
                    yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);

                }
                else {
                    y = d3.scale.linear().domain([this.data.min, this.data.max]).range([height - radius / 2, padding]);
                    yAxis = d3.svg.axis().scale(y).tickValues(d3.range(this.data.min, this.data.max, iComputeInterval)).tickFormat(function (d) {
                        return d;
                    }).orient("right");
                    this.tempMarkings
                        .attr("transform", "translate(" + (width / 2 + width / 4 + 10) + ", 2)")
                        .style({
                            'font-family': 'Segoe UI',
                            'font-size': (this.data.fontSize * 20) / 40 + "px",
                            'stroke': 'none',
                            'fill': '#333'
                        })
                        .call(yAxis);

                    this.tempMarkings.selectAll("text").remove();
                    if (height)
                        this.tempMarkings.selectAll('.axis line, .axis path').style({
                            'stroke': '#333',
                            'fill': 'none'
                        });
                    var iCounter = 0, iPrev = this.data.min;
                    if (flag) {
                        iPrev = <any>iPrev.toFixed(1) / 1;
                    }
                    for (iCounter = 1; iCounter < iNumofInterval; iCounter++) {
                        rectHeight = height - radius / 2;
                        percentage = (rectHeight - 30) * ((iPrev + iComputeInterval - this.data.min) / (this.data.max - this.data.min));
                        var yPos = rectHeight - percentage;
                        var iTemp = iPrev + iComputeInterval;
                        if (flag) {
                            iTemp = <any>iTemp.toFixed(1) / 1;
                            iPrev = <any>iPrev.toFixed(1) / 1;
                        }
                        sText = iTemp + " " + postFix;
                        iPrev = iPrev + iComputeInterval;

                        this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    }
                    if (this.data.max !== <any>iTemp2.toFixed(0) / 1) {
                        sText = (this.data.max).toFixed(1) + " " + postFix;
                    }
                    else {
                        sText = this.data.max + " " + postFix;
                    }
                    sText = this.data.min + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = 0;
                    var yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    sText = this.data.max + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = (rectHeight - 30);
                    yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                }
            }
            else {
                percentage = (rectHeight - 30) * ((this.data.min + ((iNumofInterval1) * iComputeInterval) - this.data.min) / (this.data.max - this.data.min));
                pos1 = rectHeight - percentage;
                percentage = (rectHeight - 30) * ((this.data.max - this.data.min) / (this.data.max - this.data.min));
                pos2 = rectHeight - percentage;

                if ((this.data.min + ((iNumofInterval1) * iComputeInterval) < this.data.max) && pos1 - pos2 <= iTextHeight / 2) {
                    y = d3.scale.linear().domain([this.data.min, this.data.max]).range([height - radius / 2, padding]);
                    yAxis = d3.svg.axis().scale(y).tickValues(d3.range(this.data.min, this.data.max - iComputeInterval, iComputeInterval)).tickFormat(function (d) {
                        return d;
                    }).orient("right");
                    this.tempMarkings
                        .attr("transform", "translate(" + (width / 2 + width / 4 + 10) + ", 2)")
                        .style({
                            'font-family': 'Segoe UI',
                            'font-size': (this.data.fontSize * 20) / 40 + "px",
                            'stroke': 'none',
                            'fill': '#333'
                        })
                        .call(yAxis);

                    this.tempMarkings.selectAll("text").remove();
                    if (height)
                        this.tempMarkings.selectAll('.axis line, .axis path').style({
                            'stroke': '#333',
                            'fill': 'none'
                        });
                    var iCounter = 0, iPrev = this.data.min;
                    if (flag) {
                        iPrev = <any>iPrev.toFixed(1) / 1;
                    }
                    for (iCounter = 1; iCounter < iNumofInterval - 1; iCounter++) {
                        rectHeight = height - radius / 2;
                        percentage = (rectHeight - 30) * ((iPrev + iComputeInterval - this.data.min) / (this.data.max - this.data.min));
                        var yPos = rectHeight - percentage;
                        var iTemp = iPrev + iComputeInterval;
                        if (flag) {
                            iTemp = <any>iTemp.toFixed(1) / 1;
                            iPrev = <any>iPrev.toFixed(1) / 1;
                        }
                        sText = iTemp + " " + postFix;
                        iPrev = iPrev + iComputeInterval;

                        this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    }
                    if (this.data.max !== <any>iTemp2.toFixed(0) / 1) {
                        sText = (this.data.max).toFixed(1) + " " + postFix;
                    }
                    else {
                        sText = this.data.max + " " + postFix;
                    }
                    sText = this.data.min + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = 0;
                    var yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    sText = this.data.max + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = (rectHeight - 30);
                    yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);

                }
                else {
                    y = d3.scale.linear().domain([this.data.min, this.data.max]).range([height - radius / 2, padding]);
                    yAxis = d3.svg.axis().scale(y).tickValues(d3.range(this.data.min, this.data.max, iComputeInterval)).tickFormat(function (d) {
                        return d;
                    }).orient("right");
                    this.tempMarkings
                        .attr("transform", "translate(" + (width / 2 + width / 4 + 10) + ", 2)")
                        .style({
                            'font-family': 'Segoe UI',
                            'font-size': (this.data.fontSize * 20) / 40 + "px",
                            'stroke': 'none',
                            'fill': '#333'
                        })
                        .call(yAxis);

                    this.tempMarkings.selectAll("text").remove();
                    if (height)
                        this.tempMarkings.selectAll('.axis line, .axis path').style({
                            'stroke': '#333',
                            'fill': 'none'
                        });
                    var iCounter = 0, iPrev = this.data.min;
                    if (flag) {
                        iPrev = <any>iPrev.toFixed(1) / 1;
                    }
                    for (iCounter = 1; iCounter < iNumofInterval; iCounter++) {
                        rectHeight = height - radius / 2;
                        percentage = (rectHeight - 30) * ((iPrev + iComputeInterval - this.data.min) / (this.data.max - this.data.min));
                        var yPos = rectHeight - percentage;
                        var iTemp = iPrev + iComputeInterval;
                        if (flag) {
                            iTemp = <any>iTemp.toFixed(1) / 1;
                            iPrev = <any>iPrev.toFixed(1) / 1;
                        }
                        sText = iTemp + " " + postFix;
                        iPrev = iPrev + iComputeInterval;

                        this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    }
                    if (this.data.max !== <any>iTemp2.toFixed(0) / 1) {
                        sText = (this.data.max).toFixed(1) + " " + postFix;
                    }
                    else {
                        sText = this.data.max + " " + postFix;
                    }
                    sText = this.data.min + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = 0;
                    var yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                    sText = this.data.max + " " + postFix;
                    rectHeight = height - radius / 2;
                    percentage = (rectHeight - 30);
                    yPos = rectHeight - percentage;
                    this.overlapping(width, (width / 2 + width / 4 + 18), width / 2 + width / 4 + 18, yPos, sText);
                }
            }
        }

        /** This function draws the tick for target and target label at left side of cylinder */
        private drawTarget(width: number, height: number, radius: number, padding: number, iMaxm: number, iMinm: number, tar: number) {
            var postFix = CylindericalGauge.getValue(this.dataView, 'postfix', '');
            var rectHeight = height - radius / 2;
            if (iMaxm - iMinm !== 0) {
                var percentage = (rectHeight - 30) * ((tar - iMinm) / (iMaxm - iMinm));
            }
            else {
                var percentage = (rectHeight - 30);
            }

            var yPos = rectHeight - percentage;
            if (tar !== <any>tar.toFixed(1) / 1) {
                tar = <any>tar.toFixed(1) / 1;
            }
            var sText = tar + " " + postFix;
            var fTextWidth, iTextHeight;
            let textProperties: TextProperties = {
                text: sText,
                fontFamily: 'Segoe UI',
                fontSize: this.data.fontSize / 2 + "px"
            };
            fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);
            if (width / 4 - fTextWidth - 20 >= 0) {
                this.svg.append("line")
                    .style("stroke", "black")
                    .attr("x1", width / 2 - width / 4 - 8)
                    .attr("y1", yPos)
                    .attr("x2", width / 2 - width / 4)
                    .attr("y2", yPos);
                this.svg.append("text")
                    .attr({ "x": (width / 4 - fTextWidth - 20) + "px", "y": (yPos + (iTextHeight / 8)) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                    .text(tar + " " + postFix)
                    .append("svg:title")
                    .text(function (d) { return sText });
            }
            else {
                var sNewText;
                var iNumofCharsAllowed, iNumofChars, fAvailSpace, fCharSpace;
                iNumofChars = sText.length;
                fAvailSpace = width / 4;
                if (iNumofChars) {
                    fCharSpace = fTextWidth / iNumofChars;
                }
                if (fCharSpace) {
                    iNumofCharsAllowed = fAvailSpace / fCharSpace;
                }
                if (sText.length < 3) {
                    sNewText = sText;
                    this.svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", width / 2 - width / 4 - 6)
                        .attr("y1", yPos)
                        .attr("x2", width / 2 - width / 4)
                        .attr("y2", yPos);
                    this.svg.append("text")
                        .attr({ "x": (1) + "px", "y": (yPos + (iTextHeight / 8)) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                        .text(sNewText)
                        .append("svg:title")
                        .text(function (d) { return sText });
                }
                if (iNumofCharsAllowed > 3 && sText.length > 3) {
                    sNewText = sText.substring(0, iNumofCharsAllowed - 2) + "...";
                    this.svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", width / 2 - width / 4 - 6)
                        .attr("y1", yPos)
                        .attr("x2", width / 2 - width / 4)
                        .attr("y2", yPos);
                    this.svg.append("text")
                        .attr({ "x": (1) + "px", "y": (yPos + (iTextHeight / 8)) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                        .text(sNewText)
                        .append("svg:title")
                        .text(function (d) { return sText });

                }
                else if (iNumofCharsAllowed > 2) {
                    sNewText = sText.substring(0, 1) + "..."
                    this.svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", width / 2 - width / 4 - 6)
                        .attr("y1", yPos)
                        .attr("x2", width / 2 - width / 4)
                        .attr("y2", yPos);
                    this.svg.append("text")
                        .attr({ "x": (1) + "px", "y": (yPos + (iTextHeight / 8)) + "px", "font-size": (this.data.fontSize * 20) / 40, "text-anchor": "left" })
                        .text(sNewText)
                        .append("svg:title")
                        .text(function (d) { return sText });
                }
            }
        }

        private drawText(width: number, height: number, radius: number, padding: number) {
            var postFix = CylindericalGauge.getValue(this.dataView, 'postfix', '');
            var iTemp = this.data.value;
            if (iTemp !== <any>iTemp.toFixed(1) / 1) {
                iTemp = <any>iTemp.toFixed(1) / 1;
            }
            var sText = iTemp + " " + postFix;
            var fTextWidth, iTextHeight;
            let textProperties: TextProperties = {
                text: sText,
                fontFamily: 'Segoe UI',
                fontSize: this.data.fontSize + "px"
            };
            fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);
            if (width > fTextWidth) {
                this.text
                    .text((sText))
                    .attr({
                        'x': width / 2,
                        'y': height - radius / 2 + 40,
                        'dy': '.35em'
                    })
                    .style({
                        'fill': 'black',
                        'text-anchor': 'middle',
                        'font-family': 'Segoe UI',
                        'font-size': (this.data.fontSize * 20) / 40 + "px"
                    })
                    .append("svg:title")
                    .text(function (d) { return sText });
            }
            else {
                var sNewText;
                var iNumofCharsAllowed, iNumofChars, fAvailSpace, fCharSpace;
                iNumofChars = sText.length;
                fAvailSpace = width;
                if (iNumofChars) {
                    fCharSpace = fTextWidth / iNumofChars;
                }
                if (fCharSpace) {
                    iNumofCharsAllowed = fAvailSpace / fCharSpace;
                }
                if (iNumofCharsAllowed > 3) {
                    sNewText = sText.substring(0, iNumofCharsAllowed - 2) + "...";
                }
                else if (iNumofCharsAllowed > 1) {
                    sNewText = sText.substring(0, 1) + "..."
                }
                else {
                    sNewText = "..."
                }
                this.text
                    .text(sNewText)
                    .attr({
                        'x': width / 2,
                        'y': height - radius / 2 + 40,
                        'dy': '.35em'
                    })
                    .style({
                        'fill': 'black',
                        'text-anchor': 'middle',
                        'font-family': 'Segoe UI',
                        'font-size': (this.data.fontSize * 20) / 40 + "px"
                    })
                    .append("svg:title")
                    .text(function (d) { return sText });
            }
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
                            max: this.data.max,
                            min: this.data.min,
                            interval: this.data.interval,
                            tickBar: this.enableAxis,
                            fontSize: this.data.fontSize,
                            postfix: CylindericalGauge.getValue<string>(dataView, 'postfix', ''),
                            showTarget: this.data.drawTargetLine,
                            targetColor: CylindericalGauge.getFill(dataView, 'targetColor')
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
                return {
                    solid: {
                        color: '#84bde2'
                    }
                };
            }
            else if ('targetColor' === key) {
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