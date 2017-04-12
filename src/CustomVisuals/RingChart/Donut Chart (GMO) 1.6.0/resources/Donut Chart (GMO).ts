module powerbi.visuals {
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import PixelConverter = jsCommon.PixelConverter;
    import ISize = shapes.ISize;
    // import DonutConstructorOptions = powerbi.visuals.DonutConstructorOptions;
    import DonutArcDescriptor = powerbi.visuals.DonutArcDescriptor;
    import DonutDataPoint = powerbi.visuals.DonutDataPoint;
    import DonutLayout = powerbi.visuals.DonutLayout;
    import DonutChart = powerbi.visuals.DonutChart;
    export interface IGMOLegend {
        getMargins(): IViewport;
        isVisible(): boolean;
        changeOrientation(orientation: LegendPosition): void;
        getOrientation(): LegendPosition;
        drawLegend(data: LegendData, viewport: IViewport);
        drawLegendInternal(data: LegendData, viewport: IViewport, width: boolean, detailedLegend: any);
        /**
         * Reset the legend by clearing it
         */
        reset(): void;
    }
    interface TitleLayout {
        x: number;
        y: number;
        text: string;
        width: number;
    }

    const enum NavigationArrowType {
        Increase,
        Decrease
    }

    interface NavigationArrow {
        x: number;
        y: number;
        path: string;
        rotateTransform: string;
        type: NavigationArrowType;
    }

    interface LegendLayout {
        numberOfItems: number;
        title: TitleLayout;
        navigationArrows: NavigationArrow[];
    }
    export class GMOSVGLegend implements IGMOLegend {
        private orientation: LegendPosition;
        private viewport: IViewport;
        private parentViewport: IViewport;
        private svg: D3.Selection;
        private group: D3.Selection;
        private clearCatcher: D3.Selection;
        private element: JQuery;
        private interactivityService: IInteractivityService;
        private legendDataStartIndex = 0;
        private arrowPosWindow = 1;
        private data: LegendData;
        private isScrollable: boolean;
        private primaryTitle: string = '';
        private secondaryTitle: string = '';
        private lastCalculatedWidth = 0;
        private visibleLegendWidth = 0;
        private visibleLegendHeight = 0;
        private legendFontSizeMarginDifference = 0;
        private legendFontSizeMarginValue = 0;
        public legendHeight: number = 0;
        public legendItemWidth: number = 0;
        public static DefaultFontSizeInPt = 8;
        private static LegendIconRadius = 5;
        private static LegendIconRadiusFactor = 5;
        private static MaxTextLength = 60;
        private static MaxTitleLength = 80;
        private static TextAndIconPadding = 5;
        private static TitlePadding = 15;
        private static LegendEdgeMariginWidth = 10;
        private static LegendMaxWidthFactor = 0.3;
        private static TopLegendHeight = 24;
        private static DefaultTextMargin = PixelConverter.fromPointToPixel(GMOSVGLegend.DefaultFontSizeInPt);
        private static DefaultMaxLegendFactor = GMOSVGLegend.MaxTitleLength / GMOSVGLegend.DefaultTextMargin;
        private secondaryExists: number = 0;
        // Navigation Arrow constants
        private static LegendArrowOffset = 10;
        private static LegendArrowHeight = 15;
        private static LegendArrowWidth = 7.5;
        private static LegendArrowTranslateY = 3.5;
        private detailedLegend: string = '';
        private static DefaultFontFamily = 'wf_segoe-ui_normal';
        private static DefaultTitleFontFamily = 'wf_segoe-ui_Semibold';

        private static LegendItem: ClassAndSelector = createClassAndSelector('legendItem');
        private static LegendText: ClassAndSelector = createClassAndSelector('legendText');
        private static LegendIcon: ClassAndSelector = createClassAndSelector('legendIcon');
        private static LegendTitle: ClassAndSelector = createClassAndSelector('legendTitle');
        private static NavigationArrow: ClassAndSelector = createClassAndSelector('navArrow');

        constructor(
            element: JQuery,
            legendPosition: LegendPosition,
            interactivityService: IInteractivityService,
            isScrollable: boolean) {

            this.svg = d3.select(element.get(0)).append('svg').style('position', 'absolute');
            this.svg.style('display', 'inherit');
            this.svg.classed('legend', true);
            if (interactivityService)
                this.clearCatcher = appendClearCatcher(this.svg);
            this.group = this.svg.append('g').attr('id', 'legendGroup');
            this.interactivityService = interactivityService;
            this.isScrollable = isScrollable;
            this.element = element;
            this.changeOrientation(legendPosition);
            this.parentViewport = { height: 0, width: 0 };
            this.calculateViewport([], "");
            this.updateLayout('');
        }

        private updateLayout(detailedLegend) {
            var legendViewport = this.viewport;
            var orientation = this.orientation;

            if (this.data) {
                if (this.isTopOrBottom(this.orientation)) {
                    if ((detailedLegend === 'Value' || detailedLegend === 'Percentage' || detailedLegend === 'Both') && this.secondaryExists) {
                        legendViewport.height = legendViewport.height + 3 * (this.legendFontSizeMarginDifference) + 20;
                    }
                    else if ((detailedLegend === 'Value' || detailedLegend === 'Percentage' || detailedLegend === 'Both') || this.secondaryExists) {
                        legendViewport.height = legendViewport.height + 2 * (this.legendFontSizeMarginDifference) + 20;
                    }

                }
            }
            this.svg.attr({
                'height': legendViewport.height || (orientation === LegendPosition.None ? 0 : this.parentViewport.height),
                'width': legendViewport.width || (orientation === LegendPosition.None ? 0 : this.parentViewport.width)
            });

            var isRight = orientation === LegendPosition.Right || orientation === LegendPosition.RightCenter;
            var isBottom = orientation === LegendPosition.Bottom || orientation === LegendPosition.BottomCenter;
            this.svg.style({
                'left': isRight ? (this.parentViewport.width - legendViewport.width) + 'px' : null,
                'top': isBottom ? (this.parentViewport.height - legendViewport.height) + 'px' : null,
            });
        }

        private calculateViewport(data, detailedLegend): void {
            switch (this.orientation) {
                case LegendPosition.Top:
                case LegendPosition.Bottom:
                case LegendPosition.TopCenter:
                case LegendPosition.BottomCenter:
                    var pixelHeight = PixelConverter.fromPointToPixel(this.data && this.data.fontSize ? this.data.fontSize : SVGLegend.DefaultFontSizeInPt);
                    var fontHeightSize = GMOSVGLegend.TopLegendHeight + (pixelHeight - SVGLegend.DefaultFontSizeInPt);
                    this.viewport = { height: fontHeightSize, width: 0 };
                    return;
                case LegendPosition.Right:
                case LegendPosition.Left:
                case LegendPosition.RightCenter:
                case LegendPosition.LeftCenter:
                    var width = this.lastCalculatedWidth ? this.lastCalculatedWidth : this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor;
                    if (detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") {
                        width = ((data.dataPoints[0]['measure'].length + data.dataPoints[0]['percentage'].length + 1) * this.data.fontSize / 2);
                    }

                    if ((detailedLegend === undefined || detailedLegend === "None") && data.dataPoints[0]['secondarymeasure'] > 0) {
                        width = data.dataPoints[0]['secondarymeasure'].length * this.data.fontSize / 2;
                    }
                    this.viewport = { height: 0, width: width + this.data.fontSize };
                    return;

                case LegendPosition.None:
                    this.viewport = { height: 0, width: 0 };
            }
        }

        public getMargins(): IViewport {
            return this.viewport;
        }

        public isVisible(): boolean {
            return this.orientation !== LegendPosition.None;
        }

        public changeOrientation(orientation: LegendPosition): void {
            if (orientation) {
                this.orientation = orientation;
            } else {
                this.orientation = LegendPosition.Top;
            }
            this.svg.attr('orientation', orientation);
        }

        public getOrientation(): LegendPosition {
            return this.orientation;
        }

        public drawLegend(data: LegendData, viewport: IViewport): void {

            // clone because we modify legend item label with ellipsis if it is truncated
            var clonedData = Prototype.inherit(data);
            var newDataPoints: LegendDataPoint[] = [];
            for (var dp in data.dataPoints) {
                newDataPoints.push(Prototype.inherit(dp));
            }
            clonedData.dataPoints = newDataPoints;

            this.setTooltipToLegendItems(clonedData);
            this.drawLegendInternal(clonedData, viewport, true, "" /* perform auto width */);
        }

        public drawLegendInternal(data: LegendData, viewport: IViewport, autoWidth: boolean, detailedLegend): void {
            var clonedData = Prototype.inherit(data);
            this.data = clonedData;
            this.parentViewport = viewport;
            this.detailedLegend = detailedLegend;
            if (this.interactivityService)
                this.interactivityService.applySelectionStateToData(data.dataPoints);

            if (data.dataPoints.length === 0) {
                this.changeOrientation(LegendPosition.None);
            }

            if (this.getOrientation() === LegendPosition.None) {
                data.dataPoints = [];
            }

            // Adding back the workaround for Legend Left/Right position for Map
            var mapControl = this.element.children(".mapControl");
            if (mapControl.length > 0 && !this.isTopOrBottom(this.orientation)) {
                mapControl.css("display", "inline-block");
            }
            if (data.dataPoints) {
                //Secondary Measure
                for (var index = 0; index < this.data.dataPoints.length; index++) {
                    if (this.data.dataPoints[index]['secondarymeasure'] !== '') {
                        this.secondaryExists = 1;
                        break;
                    }
                    else {
                        this.secondaryExists = 0;
                        continue;
                    }
                }
            }
            this.calculateViewport(data, detailedLegend);

            var layout = this.calculateLayout(data, autoWidth, detailedLegend);
            var titleLayout = layout.title;
            var titleData = titleLayout ? [titleLayout] : [];
            var hasSelection = this.interactivityService && powerbi.visuals.dataHasSelection(data.dataPoints);
            this.group
                .selectAll(GMOSVGLegend.LegendItem.selector).remove();
            this.group
                .selectAll(GMOSVGLegend.LegendTitle.selector).remove();
            var group = this.group;

            //transform the wrapping group if position is centered
            if (this.isCentered(this.orientation)) {
                var centerOffset = 0;
                if (this.isTopOrBottom(this.orientation)) {
                    centerOffset = Math.max(0, (this.parentViewport.width - this.visibleLegendWidth) / 2);
                    group.attr('transform', SVGUtil.translate(centerOffset, 0));
                }
                else {
                    centerOffset = Math.max((this.parentViewport.height - this.visibleLegendHeight) / 2);
                    group.attr('transform', SVGUtil.translate(0, centerOffset));
                }
            }
            else {
                group.attr('transform', null);
            }
            if (titleLayout) {
                var legendTitle = group
                    .selectAll(GMOSVGLegend.LegendTitle.selector)
                    .data(titleData);

                legendTitle.enter()
                    .append('text').attr({
                        'x': (d: TitleLayout) => d.x,
                        'y': (d: TitleLayout) => d.y
                    }).text(titleLayout.text).style({
                        'fill': data.labelColor,
                        'font-size': PixelConverter.fromPoint(data.fontSize),
                        'font-family': GMOSVGLegend.DefaultTitleFontFamily
                    }).classed(GMOSVGLegend.LegendTitle.class, true);

                legendTitle

                    .append('title').text(this.data.title);
                if (data['primaryTitle']) {

                    legendTitle.enter().append('text').text(this.primaryTitle).style({
                        'fill': data.labelColor,
                        'font-size': PixelConverter.fromPoint(data.fontSize),
                        'font-family': GMOSVGLegend.DefaultTitleFontFamily
                    })
                        .attr({
                            'x': (d: TitleLayout) => d.x,
                            'y': (d: TitleLayout) => 2 * d.y + this.legendFontSizeMarginDifference / 2,
                        }).classed(GMOSVGLegend.LegendTitle.class, true);
                    legendTitle.append('title').text(data['primaryTitle']);
                }
                if (data['secondaryTitle']) {
                    var yPosition: number = 0;

                    if (data['primaryTitle']) {
                        yPosition = 3 * titleLayout.y + this.legendFontSizeMarginDifference;
                    }
                    else {
                        yPosition = 2 * titleLayout.y + this.legendFontSizeMarginDifference / 2;
                    }

                    legendTitle.enter().append('text').text(this.secondaryTitle).style({
                        'fill': data.labelColor,
                        'font-size': PixelConverter.fromPoint(data.fontSize),
                        'font-family': GMOSVGLegend.DefaultTitleFontFamily
                    })
                        .attr({
                            'x': (d: TitleLayout) => d.x,
                            'y': (d: TitleLayout) => yPosition,
                        }).classed(GMOSVGLegend.LegendTitle.class, true);
                    legendTitle

                        .append('title').text(data['secondaryTitle']);
                }
                legendTitle.exit().remove();
            }
            if (data.dataPoints.length) {
                var virtualizedDataPoints = data.dataPoints.slice(this.legendDataStartIndex, this.legendDataStartIndex + layout.numberOfItems);
                var iconRadius = TextMeasurementService.estimateSvgTextHeight(GMOSVGLegend.getTextProperties(false, '', this.data.fontSize)) / GMOSVGLegend.LegendIconRadiusFactor;
                iconRadius = (this.legendFontSizeMarginValue > GMOSVGLegend.DefaultTextMargin) && iconRadius > GMOSVGLegend.LegendIconRadius
                ? iconRadius :
                GMOSVGLegend.LegendIconRadius;
                var legendItems = group
                    .selectAll(GMOSVGLegend.LegendItem.selector)
                    .data(virtualizedDataPoints, (d: LegendDataPoint) => d.identity.getKey());
                var itemsEnter = legendItems.enter()
                    .append('g')
                    .classed(GMOSVGLegend.LegendItem.class, true);

                itemsEnter
                    .append('circle')
                    .classed(GMOSVGLegend.LegendIcon.class, true);

                itemsEnter
                    .append('text').text((d: LegendDataPoint) => d.label).attr({
                        'x': (d: LegendDataPoint) => d.textPosition.x,
                        'y': (d: LegendDataPoint) => d.textPosition.y,
                    }).style('fill', data.labelColor)
                    .style('font-size', PixelConverter.fromPoint(data.fontSize))
                    .classed(GMOSVGLegend.LegendText.class, true);
                itemsEnter
                    .append('title')
                    .text((d: LegendDataPoint) => d.tooltip);
                itemsEnter
                    .style({
                        'font-family': GMOSVGLegend.DefaultFontFamily
                    });

                legendItems
                    .select(GMOSVGLegend.LegendIcon.selector)
                    .attr({
                        'cx': (d: LegendDataPoint, i) => d.glyphPosition.x,
                        'cy': (d: LegendDataPoint) => d.glyphPosition.y,
                        'r': iconRadius,
                    })
                    .style({
                        'fill': (d: LegendDataPoint) => {
                            if (hasSelection && !d.selected)
                                return LegendBehavior.dimmedLegendColor;
                            else
                                return d.color;
                        }
                    });
                // Measure Values
                //Primary Measure
                if (detailedLegend === "Value") {
                    itemsEnter.append('g').classed('PMlegendItems', true);
                    itemsEnter.select('.PMlegendItems').append('text').text((d: LegendDataPoint) => d.measure).classed('primaryMeasure', true);
                    itemsEnter.select('.PMlegendItems').append('title').text((d: LegendDataPoint) => d['measureTooltip']);
                }
                else if (detailedLegend === "Percentage") {
                    itemsEnter.append('g').classed('PMlegendItems', true);
                    itemsEnter.select('.PMlegendItems').append('text').text((d: LegendDataPoint) => d['percentage']).classed('primaryMeasure', true);
                    itemsEnter.select('.PMlegendItems').append('title').text((d: LegendDataPoint) => d['percentageTooltip']);
                }
                else if (detailedLegend === "Both") {
                    itemsEnter.append('g').classed('PMlegendItems', true);
                    itemsEnter.select('.PMlegendItems').append('text').text((d: LegendDataPoint) => d.measure).classed('primaryMeasure', true);
                    itemsEnter.select('.PMlegendItems').append('title').text((d: LegendDataPoint) => d['measureTooltip'] + ' ' + d['percentageTooltip']);

                }
                if (this.secondaryExists) {
                    itemsEnter.append('g').classed('SMlegendItems', true);
                    itemsEnter.select('.SMlegendItems').append('text').text((d: LegendDataPoint) => d['secondarymeasure']).classed('secondaryMeasure', true);
                    itemsEnter.select('.SMlegendItems').append('title').text((d: LegendDataPoint) => d['secondaryMeasureTooltip']);

                }
                if (detailedLegend === 'Value' || detailedLegend === 'Percentage' || detailedLegend === 'Both') {
                    if (this.isTopOrBottom(this.orientation)) {
                        legendItems
                            .select('.primaryMeasure')
                            .attr({
                                'x': (d: LegendDataPoint) => d.textPosition.x,
                                'y': (d: LegendDataPoint) => 2 * d.textPosition.y + this.legendFontSizeMarginDifference / 2,
                            })
                            .style({
                                'fill': data.labelColor,
                                'font-size': PixelConverter.fromPoint(data.fontSize)
                            });
                        if (detailedLegend === 'Value') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + 5) + ',' +
                                    ((this.data.fontSize > 10) ? (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + (d.textPosition.y / 2)) : (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize))))
                                    + ') rotate(270 3.75 7.5)'
                            }).classed('PMIndicator', true);
                        }
                        else if (detailedLegend === 'Percentage') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['percentage'], this.data.fontSize)) + 5) + ',' +
                                    ((this.data.fontSize > 10) ? (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['percentage'], this.data.fontSize)) + (d.textPosition.y / 2)) : (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['percentage'], this.data.fontSize))))
                                    + ') rotate(270 3.75 7.5)'
                            }).classed('PMIndicator', true);
                        }
                        else if (detailedLegend === 'Both') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + 5) + ',' +
                                    ((this.data.fontSize > 10) ? (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + (d.textPosition.y / 2)) : (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize))))
                                    + ') rotate(270 3.75 7.5)'
                            }).style('fill', 'green').classed('PMIndicator', true);
                        }
                        if (this.secondaryExists) {
                            legendItems
                                .select('.secondaryMeasure')
                                .attr({
                                    'x': (d: LegendDataPoint) => d.textPosition.x,
                                    'y': (d: LegendDataPoint) => 3 * d.textPosition.y + this.legendFontSizeMarginDifference //d.textPosition.y + (2 * (this.legendFontSizeMarginDifference + 20)),
                                })
                                .style({
                                    'fill': data.labelColor,
                                    'font-size': PixelConverter.fromPoint(data.fontSize)
                                });
                            itemsEnter.select('.SMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + 5) + ',' +
                                    ((this.data.fontSize > 10) ? 2 * (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + (d.textPosition.y / 2)) : 2 * (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize))))
                                    + ') rotate(270 3.75 7.5)'
                            }).classed('SMIndicator', true);
                        }
                    }
                    else {
                        legendItems
                            .select('.primaryMeasure')
                            .attr({
                                'x': (d: LegendDataPoint) => d.textPosition.x,
                                'y': (d: LegendDataPoint) => d.textPosition.y + (this.legendFontSizeMarginDifference / 2) + 20,
                            })
                            .style({
                                'fill': data.labelColor,
                                'font-size': PixelConverter.fromPoint(data.fontSize)
                            });
                        if (detailedLegend === 'Value') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + 5) + ',' + ((d.textPosition.y + (this.legendFontSizeMarginDifference / 2) + 20) - 10) + ') rotate(270 3.75 7.5)'
                            }).classed('PMIndicator', true);
                        }
                        else if (detailedLegend === 'Percentage') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['percentage'], this.data.fontSize)) + 5) + ',' + ((d.textPosition.y + (this.legendFontSizeMarginDifference / 2) + 20) - 10) + ') rotate(270 3.75 7.5)'
                            }).classed('PMIndicator', true);
                        }
                        else if (detailedLegend === 'Both') {
                            itemsEnter.select('.PMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d.measure, this.data.fontSize)) + 5) + ',' + ((d.textPosition.y + (this.legendFontSizeMarginDifference / 2) + 20) - 10) + ') rotate(270 3.75 7.5)'
                            }).classed('PMIndicator', true);
                        }
                        if (this.secondaryExists) {
                            legendItems
                                .select('.secondaryMeasure')
                                .attr({
                                    'x': (d: LegendDataPoint) => d.textPosition.x,
                                    'y': (d: LegendDataPoint) => d.textPosition.y + (this.legendFontSizeMarginDifference) + 40,
                                })
                                .style({
                                    'fill': data.labelColor,
                                    'font-size': PixelConverter.fromPoint(data.fontSize)
                                });
                            itemsEnter.select('.SMlegendItems').append('path').attr({
                                'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                                'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + 5) + ',' + ((d.textPosition.y + (this.legendFontSizeMarginDifference) + 40) - 10) + ') rotate(270 3.75 7.5)'
                            }).classed('SMIndicator', true);
                        }
                    }
                }
                else if (this.secondaryExists) {
                    if (this.isTopOrBottom(this.orientation)) {
                        legendItems
                            .select('.secondaryMeasure')
                            .attr({
                                'x': (d: LegendDataPoint) => d.textPosition.x,
                                'y': (d: LegendDataPoint) => 2 * d.textPosition.y + this.legendFontSizeMarginDifference / 2//d.textPosition.y + (2 * (this.legendFontSizeMarginDifference + 20)),
                            })
                            .style({
                                'fill': data.labelColor,
                                'font-size': PixelConverter.fromPoint(data.fontSize)
                            });
                        itemsEnter.select('.SMlegendItems').append('path').attr({
                            'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                            'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + 5) + ',' +
                                ((this.data.fontSize > 10) ? (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + (d.textPosition.y / 2)) : (TextMeasurementService.measureSvgTextHeight(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize))))
                                + ') rotate(270 3.75 7.5)'
                        }).classed('SMIndicator', true);
                    }
                    else {
                        legendItems
                            .select('.secondaryMeasure')
                            .attr({
                                'x': (d: LegendDataPoint) => d.textPosition.x,
                                'y': (d: LegendDataPoint) => d.textPosition.y + 20 + this.legendFontSizeMarginDifference / 2 
                            })
                            .style({
                                'fill': data.labelColor,
                                'font-size': PixelConverter.fromPoint(data.fontSize)
                            });
                        itemsEnter.select('.SMlegendItems').append('path').attr({
                            'd': (d: LegendDataPoint) => 'M0 0L0 ' + this.data.fontSize + 'L' + this.data.fontSize / 2 + ' ' + this.data.fontSize / 2 + 'Z',
                            'transform': (d: LegendDataPoint) => 'translate(' + (d.textPosition.x + TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, d['secondarymeasure'], this.data.fontSize)) + 5) + ',' + ((d.textPosition.y + 20 + this.legendFontSizeMarginDifference / 2) - 10) + ') rotate(270 3.75 7.5)'
                        }).classed('SMIndicator', true);

                    }
                }
                itemsEnter.select('.PMIndicator').style({
                    'fill': (d: LegendDataPoint) => (d['primaryIndicator'] !== "" ? (d['primaryIndicator'] ? 'green' : 'red') : 'white'),
                    'fill-opacity': (d: LegendDataPoint) => (d['primaryIndicator'] !== "" ? (d['primaryIndicator'] ? '1' : '1') : '0')
                });
                itemsEnter.select('.SMIndicator').style({
                    'fill': (d: LegendDataPoint) => (d['secondaryIndicator'] !== "" ? (d['secondaryIndicator'] ? 'green' : 'red') : 'white'),
                    'fill-opacity': (d: LegendDataPoint) => (d['secondaryIndicator'] !== "" ? (d['secondaryIndicator'] ? '1' : '1') : '0')
                });

                if (this.interactivityService) {
                    var iconsSelection = legendItems.select(GMOSVGLegend.LegendIcon.selector);
                    var behaviorOptions: LegendBehaviorOptions = {
                        legendItems: legendItems,
                        legendIcons: iconsSelection,
                        clearCatcher: this.clearCatcher,
                    };

                    this.interactivityService.bind(data.dataPoints, new LegendBehavior(), behaviorOptions, { isLegend: true });
                }

                legendItems.exit().remove();
                this.updateLayout(detailedLegend);
                this.drawNavigationArrows(layout.navigationArrows, detailedLegend, titleLayout);
            }
        }

        private normalizePosition(points: any[]): void {
            if (this.legendDataStartIndex >= points.length) {
                this.legendDataStartIndex = points.length - 1;
            }

            if (this.legendDataStartIndex < 0) {
                this.legendDataStartIndex = 0;
            }
        }

        private calculateTitleLayout(title: string): TitleLayout {
            var width = 0;
            var hasTitle = !_.isEmpty(title);

            if (hasTitle) {
                var isHorizontal = this.isTopOrBottom(this.orientation);
                var maxMeasureLength: number;

                if (isHorizontal) {
                    var fontSizeMargin = this.legendFontSizeMarginValue > GMOSVGLegend.DefaultTextMargin ? GMOSVGLegend.TextAndIconPadding + this.legendFontSizeMarginDifference : GMOSVGLegend.TextAndIconPadding;
                    var fixedHorizontalIconShift = GMOSVGLegend.TextAndIconPadding + GMOSVGLegend.LegendIconRadius;
                    var fixedHorizontalTextShift = GMOSVGLegend.LegendIconRadius + fontSizeMargin + fixedHorizontalIconShift;
                    maxMeasureLength = this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth;
                }
                else {
                    maxMeasureLength = this.legendFontSizeMarginValue < GMOSVGLegend.DefaultTextMargin ? GMOSVGLegend.MaxTitleLength :
                    GMOSVGLegend.MaxTitleLength + (GMOSVGLegend.DefaultMaxLegendFactor * this.legendFontSizeMarginDifference);
                }
                var textProperties = GMOSVGLegend.getTextProperties(true, title, this.data.fontSize);
                var text = title;
                var titlewidth = TextMeasurementService.measureSvgTextWidth(textProperties);
                var primaryTitleWidth: number = 0, secondaryTitleWidth: number = 0;
                if (this.data['primaryTitle'])
                    primaryTitleWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize));
                if (this.data['secondaryTitle'])
                    secondaryTitleWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, this.data['secondaryTitle'], this.data.fontSize));
                width = titlewidth > primaryTitleWidth ? (titlewidth > secondaryTitleWidth ? titlewidth : secondaryTitleWidth) : (primaryTitleWidth > secondaryTitleWidth ? primaryTitleWidth : secondaryTitleWidth);
                if (titlewidth > maxMeasureLength || primaryTitleWidth > maxMeasureLength || secondaryTitleWidth > maxMeasureLength) {

                    text = TextMeasurementService.getTailoredTextOrDefault(textProperties, maxMeasureLength);
                    width = maxMeasureLength;
                    if (this.data['primaryTitle']) {
                        this.primaryTitle = this.data['primaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), maxMeasureLength);
                    }
                    if (this.data['secondaryTitle']) {
                        this.secondaryTitle = this.data['secondaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['secondaryTitle'], this.data.fontSize), maxMeasureLength);
                    }
                }
                else {
                    this.primaryTitle = this.data['primaryTitle'];
                    this.secondaryTitle = this.data['secondaryTitle'];
                }

                if (isHorizontal)
                    width += GMOSVGLegend.TitlePadding;
                else {
                    var legendWidth = parseFloat(this.svg.style('width'));
                    if (width < maxMeasureLength) {
                        text = TextMeasurementService.getTailoredTextOrDefault(textProperties, legendWidth);
                        if (this.data['primaryTitle']) {
                            this.primaryTitle = this.data['primaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), legendWidth-10);
                        }
                        if (this.data['secondaryTitle']) {
                            this.secondaryTitle = this.data['secondaryTitle'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['secondaryTitle'], this.data.fontSize), legendWidth);
                        }
                    }
                }
                return {
                    x: 0,
                    y: 0,
                    text: text,
                    width: width,
                };
            }
            return null;

        }
        /** Performs layout offline for optimal perfomance */
        private calculateLayout(data: LegendData, autoWidth: boolean, detailedLegend): LegendLayout {
            var dataPoints = data.dataPoints;
            if (data.dataPoints.length === 0) {
                return {
                    startIndex: null,
                    numberOfItems: 0,
                    title: null,
                    navigationArrows: []
                };
            }

            this.legendFontSizeMarginValue = PixelConverter.fromPointToPixel(this.data && this.data.fontSize !== undefined ? this.data.fontSize : SVGLegend.DefaultFontSizeInPt);
            this.legendFontSizeMarginDifference = (this.legendFontSizeMarginValue - GMOSVGLegend.DefaultTextMargin);

            this.normalizePosition(dataPoints);
            if (this.legendDataStartIndex < dataPoints.length) {
                dataPoints = dataPoints.slice(this.legendDataStartIndex);
            }

            var title = this.calculateTitleLayout(data.title);

            var navArrows: NavigationArrow[];
            var numberOfItems: number;
            if (this.isTopOrBottom(this.orientation)) {
                navArrows = this.isScrollable ? this.calculateHorizontalNavigationArrowsLayout(title, detailedLegend) : [];
                numberOfItems = this.calculateHorizontalLayout(dataPoints, title, navArrows, detailedLegend);
            }
            else {
                navArrows = this.isScrollable ? this.calculateVerticalNavigationArrowsLayout(title, detailedLegend) : [];
                numberOfItems = this.calculateVerticalLayout(dataPoints, title, navArrows, autoWidth, detailedLegend);
            }
            return {
                numberOfItems: numberOfItems,
                title: title,
                navigationArrows: navArrows
            };
        }

        private updateNavigationArrowLayout(navigationArrows: NavigationArrow[], remainingDataLength, visibleDataLength, title) {
            if (this.legendDataStartIndex === 0) {
                navigationArrows.shift();
            }

            var lastWindow = this.arrowPosWindow;
            this.arrowPosWindow = visibleDataLength;

            if (navigationArrows && navigationArrows.length > 0 && this.arrowPosWindow === remainingDataLength) {
                this.arrowPosWindow = lastWindow;
                navigationArrows.length = navigationArrows.length - 1;
            }
        }

        private calculateHorizontalNavigationArrowsLayout(title: TitleLayout, detailedLegend): NavigationArrow[] {
            var legendGroupHeight = 0;
            if (this.svg) {
                legendGroupHeight = parseInt(this.svg.style('height'), 10);
            }
            var height = GMOSVGLegend.LegendArrowHeight;
            var width = GMOSVGLegend.LegendArrowWidth;
            var translateY = GMOSVGLegend.LegendArrowTranslateY;

            var data: NavigationArrow[] = [];
            var rightShift = title ? title.x + title.width : 0;
            var arrowLeft = SVGUtil.createArrow(width, height, 180 /*angle*/);
            var arrowRight = SVGUtil.createArrow(width, height, 0 /*angle*/);

            if (this.isTopOrBottom(this.orientation)) {
                if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 0) {
                    translateY = legendGroupHeight / 3;
                }
                else if ((detailedLegend === undefined || detailedLegend === "None") && this.secondaryExists === 1) {
                    translateY = legendGroupHeight / 3;
                }
                else if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 1) {
                    translateY = legendGroupHeight / 3;
                }
            }
            data.push({
                x: rightShift,
                y: translateY,
                path: arrowLeft.path,
                rotateTransform: arrowLeft.transform,
                type: NavigationArrowType.Decrease
            });

            data.push({
                x: this.parentViewport.width - width,
                y: translateY,
                path: arrowRight.path,
                rotateTransform: arrowRight.transform,
                type: NavigationArrowType.Increase
            });

            return data;
        }

        private calculateVerticalNavigationArrowsLayout(title: TitleLayout, detailedLegend): NavigationArrow[] {
            var height = GMOSVGLegend.LegendArrowHeight;
            var width = GMOSVGLegend.LegendArrowWidth;

            var data: NavigationArrow[] = [];
            var rightShift = 40;
            var arrowTop = SVGUtil.createArrow(width, height, 270 /*angle*/);
            var arrowBottom = SVGUtil.createArrow(width, height, 90 /*angle*/);

            if (this.isLeftOrRight(this.orientation)) {
                var translateY = 0;
                var hasTitle = !_.isEmpty(title);

                if (hasTitle) {
                    if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 0) {
                        translateY = title.y * 2;
                    }
                    else if ((detailedLegend === undefined || detailedLegend === "None") && this.secondaryExists === 1) {
                        translateY = title.y * 2;
                    }
                    else if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 1) {
                        translateY = title.y * 3;
                    }
                    else {
                        translateY = height + GMOSVGLegend.LegendArrowOffset / 2;
                    }
                }
                else {
                    translateY = /*height +*/ GMOSVGLegend.LegendArrowOffset / 2;
                }

            }

            data.push({
                x: rightShift,
                y: translateY,
                path: arrowTop.path,
                rotateTransform: arrowTop.transform,
                type: NavigationArrowType.Decrease
            });

            data.push({
                x: rightShift,
                y: this.parentViewport.height - height - 31,
                path: arrowBottom.path,
                rotateTransform: arrowBottom.transform,
                type: NavigationArrowType.Increase
            });

            return data;
        }

        private calculateHorizontalLayout(dataPoints: LegendDataPoint[], title: TitleLayout, navigationArrows: NavigationArrow[], detailedLegend): number {
            debug.assertValue(navigationArrows, 'navigationArrows');
            var HorizontalTextShift = 4;
            var HorizontalIconShift = 11;
            var fontSizeBiggerThenDefault = this.legendFontSizeMarginDifference > 0;
            var fontSizeMargin = fontSizeBiggerThenDefault ? GMOSVGLegend.TextAndIconPadding + this.legendFontSizeMarginDifference : GMOSVGLegend.TextAndIconPadding;
            var fixedTextShift = GMOSVGLegend.LegendIconRadius + fontSizeMargin + HorizontalTextShift;
            var fixedIconShift = HorizontalIconShift + (fontSizeBiggerThenDefault ? this.legendFontSizeMarginDifference : 0);
            var totalSpaceOccupiedThusFar = 0;
            var iconTotalItemPadding = GMOSVGLegend.LegendIconRadius * 2 + fontSizeMargin * 3;
            var numberOfItems: number = dataPoints.length;
            var primaryMeasureLength: number = 0;
            if (detailedLegend === "Value") {
                primaryMeasureLength = dataPoints[0]['measure'].length;
            }
            else if (detailedLegend === "Percentage") {
                primaryMeasureLength = dataPoints[0]['percentage'].length;
            }
            else if (detailedLegend === "Both") {
                primaryMeasureLength = dataPoints[0]['measure'].length + dataPoints[0]['percentage'].length + 1;
            }
            var secondaryMeasurelength: number = 0;
            if (dataPoints[0]['secondarymeasure'].length > 0) {
                secondaryMeasurelength = dataPoints[0]['secondarymeasure'].length;
            }

            if (title) {
                totalSpaceOccupiedThusFar = title.width;
                title.y = fixedTextShift;
            }

            if (this.legendDataStartIndex > 0) {
                totalSpaceOccupiedThusFar += GMOSVGLegend.LegendArrowOffset;
            }

            // This bit expands the max lengh if there are only a few items
            // so longer labels can potentially get more space, and not be
            // ellipsed. 
            var dataPointsLength = dataPoints.length;
            var parentWidth = this.parentViewport.width;
            var maxTextLength = dataPointsLength > 0
                ? (((parentWidth - totalSpaceOccupiedThusFar) - (iconTotalItemPadding * dataPointsLength)) / dataPointsLength) | 0
                : 0;
            maxTextLength = maxTextLength > GMOSVGLegend.MaxTextLength ? maxTextLength : GMOSVGLegend.MaxTextLength;

            for (var i = 0; i < dataPointsLength; i++) {
                var dp = dataPoints[i];

                dp.glyphPosition = {
                    x: totalSpaceOccupiedThusFar + GMOSVGLegend.LegendIconRadius,
                    y: fixedIconShift
                };
                dp.textPosition = {
                    x: totalSpaceOccupiedThusFar + fixedTextShift,
                    y: fixedTextShift
                };

                var textProperties: any;
                textProperties = GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize);
                var labelwidth = TextMeasurementService.measureSvgTextWidth(textProperties);
                var primaryWidth = 0, secondaryWidth = 0;
                if (detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both") {

                    if (detailedLegend === "Value") {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize));
                    }
                    else if (detailedLegend === "Percentage") {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize));
                    }
                    else {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize));
                    }
                }
                if (this.secondaryExists) {
                    secondaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['secondarymeasure'], this.data.fontSize));
                }
                var width = labelwidth > primaryWidth ? (labelwidth > secondaryWidth ? labelwidth : secondaryWidth) : (primaryWidth > secondaryWidth ? primaryWidth : secondaryWidth);
                width += 15;//indicators
                var spaceTakenByItem = 0;
                if (width < maxTextLength) {
                    spaceTakenByItem = iconTotalItemPadding + width;
                    if (detailedLegend === "Value") {
                        dp.measure = dp.measure;
                    }
                    else if (detailedLegend === "Both") {
                        dp.measure = dp.measure + ' ' + dp['percentage'];
                    }
                } else {
                    var text = TextMeasurementService.getTailoredTextOrDefault(
                        textProperties,
                        maxTextLength);
                    dp.label = text;
                    if (detailedLegend === "Value") {
                        dp.measure = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize),
                            maxTextLength);
                    }
                    else if (detailedLegend === "Percentage") {
                        dp['percentage'] = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize),
                            maxTextLength);
                    }
                    else if (detailedLegend === "Both") {
                        dp.measure = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize),
                            maxTextLength);
                    }
                    if (this.secondaryExists) {
                        dp['secondarymeasure'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(false, dp['secondarymeasure'], this.data.fontSize),
                            maxTextLength);
                    }
                    spaceTakenByItem = iconTotalItemPadding + maxTextLength;
                }

                totalSpaceOccupiedThusFar += spaceTakenByItem;

                if (totalSpaceOccupiedThusFar > parentWidth) {
                    numberOfItems = i;
                    break;
                }
            }

            this.visibleLegendWidth = totalSpaceOccupiedThusFar;

            this.updateNavigationArrowLayout(navigationArrows, dataPointsLength, numberOfItems, title);

            return numberOfItems;
        }

        private calculateVerticalLayout(
            dataPoints: LegendDataPoint[],
            title: TitleLayout,
            navigationArrows: NavigationArrow[],
            autoWidth: boolean, detailedLegend): number {
            var fontSizeBiggerThenDefault = this.legendFontSizeMarginDifference > 0;
            var fontFactor = fontSizeBiggerThenDefault ? this.legendFontSizeMarginDifference : 0;
            var verticalLegendHeight = 20 + fontFactor;
            this.legendHeight = verticalLegendHeight;
            var spaceNeededByTitle = 15 + (fontFactor * 1.3);
            var totalSpaceOccupiedThusFar = 0; //verticalLegendHeight;
            var extraShiftForTextAlignmentToIcon = 4 + (fontFactor * 1.3);
            var fixedHorizontalIconShift = GMOSVGLegend.TextAndIconPadding + GMOSVGLegend.LegendIconRadius;//+ (this.legendFontSizeMarginDifference / GMOSVGLegend.LegendIconRadiusFactor);
            var fixedHorizontalTextShift = GMOSVGLegend.LegendIconRadius + GMOSVGLegend.TextAndIconPadding + fixedHorizontalIconShift;
            var maxHorizontalSpaceAvaliable = autoWidth
                ? this.parentViewport.width * GMOSVGLegend.LegendMaxWidthFactor
                - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth
                : this.lastCalculatedWidth
                - fixedHorizontalTextShift - GMOSVGLegend.LegendEdgeMariginWidth;
            var numberOfItems: number = dataPoints.length;

            var maxHorizontalSpaceUsed = 0;
            var parentHeight = this.parentViewport.height;
            if (title) {
                totalSpaceOccupiedThusFar += spaceNeededByTitle;
                title.x = GMOSVGLegend.TextAndIconPadding;
                title.y = spaceNeededByTitle;
                maxHorizontalSpaceUsed = title.width || 0;
                if (this.data['primaryTitle'] && this.data['secondaryTitle'] && detailedLegend !== 'None' && detailedLegend !== undefined) {
                    spaceNeededByTitle = 3 * title.y + this.legendFontSizeMarginDifference / 2;
                    totalSpaceOccupiedThusFar += spaceNeededByTitle;
                }
                else if (this.data['secondaryTitle'] || this.data['primaryTitle']) {
                    spaceNeededByTitle = 2 * title.y + this.legendFontSizeMarginDifference / 2;
                    totalSpaceOccupiedThusFar += spaceNeededByTitle;
                }
                else {
                    totalSpaceOccupiedThusFar += spaceNeededByTitle;
                }
            }
            else {
                totalSpaceOccupiedThusFar += spaceNeededByTitle;
            }

            if (this.legendDataStartIndex > 0)
                totalSpaceOccupiedThusFar += GMOSVGLegend.LegendArrowOffset;

            var dataPointsLength = dataPoints.length;
            for (var index = 0; index < dataPointsLength; index++) {
                if (dataPoints[index]['secondarymeasure'] !== '') {
                    this.secondaryExists = 1;
                    break;
                }
                else {
                    this.secondaryExists = 0;
                    continue;
                }
            }
            for (var i = 0; i < dataPointsLength; i++) {
                var dp = dataPoints[i];

                dp.glyphPosition = {
                    x: fixedHorizontalIconShift,
                    y: totalSpaceOccupiedThusFar + fontFactor
                };
                dp.textPosition = {
                    x: fixedHorizontalTextShift,
                    y: totalSpaceOccupiedThusFar + extraShiftForTextAlignmentToIcon
                };
                if ((detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both")) {
                    totalSpaceOccupiedThusFar = totalSpaceOccupiedThusFar + 20 + (this.legendFontSizeMarginDifference / 2);
                }
                if (this.secondaryExists) {
                    totalSpaceOccupiedThusFar = totalSpaceOccupiedThusFar + 20 + (this.legendFontSizeMarginDifference / 2);
                }
                var textProperties: any;
                textProperties = GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize);
                var labelwidth = TextMeasurementService.measureSvgTextWidth(textProperties);
                var primaryWidth = 0, secondaryWidth = 0;
                if (detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both") {

                    if (detailedLegend === "Value") {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize));
                    }
                    else if (detailedLegend === "Percentage") {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize));
                    }
                    else {
                        primaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize));
                    }
                }
                if (this.secondaryExists) {
                    secondaryWidth = TextMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['secondarymeasure'], this.data.fontSize));
                }
                var width = labelwidth > primaryWidth ? (labelwidth > secondaryWidth ? labelwidth : secondaryWidth) : (primaryWidth > secondaryWidth ? primaryWidth : secondaryWidth);
                width += 15;//indicators
                if (width > maxHorizontalSpaceUsed) {
                    maxHorizontalSpaceUsed = width;
                }

                if (width > maxHorizontalSpaceAvaliable) {
                    var text = TextMeasurementService.getTailoredTextOrDefault(
                        GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize),
                        maxHorizontalSpaceAvaliable);
                    dp.label = text;
                    if (detailedLegend === "Value") {
                        dp.measure = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize),
                            maxHorizontalSpaceAvaliable);
                    }
                    else if (detailedLegend === "Percentage") {
                        dp['percentage'] = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize),
                            maxHorizontalSpaceAvaliable);
                    }
                    else if (detailedLegend === "Both") {
                        dp.measure = TextMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize),
                            maxHorizontalSpaceAvaliable);
                    }
                    if (this.secondaryExists) {
                        dp['secondarymeasure'] = TextMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(false, dp['secondarymeasure'], this.data.fontSize),
                            maxHorizontalSpaceAvaliable);
                    }
                }
                else {
                    if (detailedLegend === "Value") {
                        dp.measure = dp.measure;
                    }
                    else if (detailedLegend === "Both") {
                        dp.measure = dp.measure + ' ' + dp['percentage'];
                    }
                }

                totalSpaceOccupiedThusFar += verticalLegendHeight;

                if (totalSpaceOccupiedThusFar > parentHeight) {
                    numberOfItems = i - 1;
                    break;
                }
            }

            if (autoWidth) {
                if (maxHorizontalSpaceUsed < maxHorizontalSpaceAvaliable) {
                    this.lastCalculatedWidth = this.viewport.width = Math.ceil(maxHorizontalSpaceUsed + fixedHorizontalTextShift + GMOSVGLegend.LegendEdgeMariginWidth);
                } else {
                    this.lastCalculatedWidth = this.viewport.width = Math.ceil(maxHorizontalSpaceAvaliable + fixedHorizontalTextShift + GMOSVGLegend.LegendEdgeMariginWidth);
                }
            }
            else {
                this.viewport.width = this.lastCalculatedWidth;
            }

            this.visibleLegendHeight = totalSpaceOccupiedThusFar - verticalLegendHeight;

            navigationArrows.forEach(d => d.x = this.lastCalculatedWidth / 2);
            this.updateNavigationArrowLayout(navigationArrows, dataPointsLength, numberOfItems, title);

            return numberOfItems;
        }

        private drawNavigationArrows(layout: NavigationArrow[], detailedLegend, title) {
            var arrows = this.group.selectAll(GMOSVGLegend.NavigationArrow.selector)
                .data(layout);

            arrows
                .enter()
                .append('g')
                .on('click', (d: NavigationArrow) => {
                    var pos = this.legendDataStartIndex;
                    this.legendDataStartIndex = d.type === NavigationArrowType.Increase
                    ? pos + this.arrowPosWindow : pos - this.arrowPosWindow;
                    this.drawLegendInternal(this.data, this.parentViewport, false, this.detailedLegend);
                })
                .classed(GMOSVGLegend.NavigationArrow.class, true)
                .append('path');
            arrows
                .attr('transform', (d: NavigationArrow) => SVGUtil.translate(d.x, d.y))
                .select('path')
                .attr({
                    'd': (d: NavigationArrow) => d.path,
                    'transform': (d: NavigationArrow) => d.rotateTransform
                });

            if (this.isTopOrBottom(this.orientation)) {
                var legendGroupHeight = parseInt(this.svg.style('height'), 10);
                var translateY = 0;
                if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 0) {
                    translateY = legendGroupHeight / 3;
                }
                else if ((detailedLegend === undefined || detailedLegend === "None") && this.secondaryExists === 1) {
                    translateY = legendGroupHeight / 3;
                }
                else if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 1) {
                    translateY = legendGroupHeight / 3;
                }
                else if ((detailedLegend === undefined || detailedLegend === "None") && this.secondaryExists === 0) {
                    translateY = 3.5;
                }
                arrows
                    .attr('transform', (d: NavigationArrow) => SVGUtil.translate(d.x, translateY))
                    .select('path')
                    .attr({
                        'd': (d: NavigationArrow) => d.path,
                        'transform': (d: NavigationArrow) => d.rotateTransform
                    });
            }

            if (this.isLeftOrRight(this.orientation)) {
                var translateY = 0;
                var hasTitle = !_.isEmpty(title);

                if (hasTitle) {
                    if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 0) {
                        translateY = title.y * 2 + this.legendFontSizeMarginDifference;
                    }
                    else if ((detailedLegend === undefined || detailedLegend === "None") && this.secondaryExists === 1) {
                        translateY = title.y * 2 + this.legendFontSizeMarginDifference;
                    }
                    else if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage") && this.secondaryExists === 1) {
                        translateY = title.y * 3 + this.legendFontSizeMarginDifference;
                    }
                    else {
                        translateY = GMOSVGLegend.LegendArrowHeight + GMOSVGLegend.LegendArrowOffset / 2;
                    }
                }
                else {
                    translateY = GMOSVGLegend.LegendArrowHeight + GMOSVGLegend.LegendArrowOffset / 2;
                }
                if (this.svg.select('.navArrow')[0][0] !== null) {
                    var t = d3.transform(this.svg.select('.navArrow').attr("transform"));
                    if (t.translate[1] === 0) {
                        this.svg.select('.navArrow').attr('transform', (d: NavigationArrow) => SVGUtil.translate(d.x, translateY));
                    }
                }
            }

            arrows.exit().remove();
        }

        private isTopOrBottom(orientation: LegendPosition) {
            switch (orientation) {
                case LegendPosition.Top:
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter:
                case LegendPosition.TopCenter:
                    return true;
                default:
                    return false;
            }
        }

        private isLeftOrRight(orientation: LegendPosition) {
            switch (orientation) {
                case LegendPosition.Left:
                case LegendPosition.Right:
                case LegendPosition.LeftCenter:
                case LegendPosition.RightCenter:
                    return true;
                default:
                    return false;
            }
        }

        private isCentered(orientation: LegendPosition): boolean {
            switch (orientation) {
                case LegendPosition.BottomCenter:
                case LegendPosition.LeftCenter:
                case LegendPosition.RightCenter:
                case LegendPosition.TopCenter:
                    return true;
                default:
                    return false;
            }
        }

        public reset(): void {
            // Intentionally left blank. 
        }

        private static getTextProperties(isTitle: boolean, text?: string, fontSize?: number): TextProperties {
            return {
                text: text,
                fontFamily: isTitle ? GMOSVGLegend.DefaultTitleFontFamily : GMOSVGLegend.DefaultFontFamily,
                fontSize: PixelConverter.fromPoint(fontSize || SVGLegend.DefaultFontSizeInPt)
            };
        }

        private setTooltipToLegendItems(data: LegendData) {
            //we save the values to tooltip before cut
            for (var dataPoint in data.dataPoints) {
                dataPoint.tooltip = dataPoint.label;
            }
        }
    }
    //ts end

    export interface DonutChartSettings {
        /**
         * The duration for a long animation displayed after a user interaction with an interactive chart. 
         */
        chartRotationAnimationDuration?: number;
        /**
         * The duration for a short animation displayed after a user interaction with an interactive chart.
         */
        legendTransitionAnimationDuration?: number;
    }
    export interface DonutDataGMO {
        dataPointsToDeprecate: DonutDataPoint[];
        dataPoints: DonutArcDescriptor[]; // The data points will be culled based on viewport size to remove invisible slices
        unCulledDataPoints: DonutDataPoint[]; // The unculled data points will never be culled
        dataPointsToEnumerate?: LegendDataPoint[];
        legendData: LegendData;
        hasHighlights: boolean;
        dataLabelsSettings: VisualDataLabelsSettings;
        legendObjectProperties?: DataViewObject;
        maxValue?: number;
        visibleGeometryCulled?: boolean;
        defaultDataPointColor?: string;
        showAllDataPoints?: boolean;
        primaryMeasureSum?: number;
        secondaryMeasureSum?: number;
    }
    export interface InteractivityState {
        interactiveLegend: DonutChartInteractiveLegend;
        valueToAngleFactor: number; // Ratio between 360 and the sum of the angles
        sliceAngles: number[]; // Saves the angle to rotate of each slice
        currentRotate: number; // Keeps how much the donut is rotated by
        interactiveChosenSliceFinishedSetting: boolean; // flag indicating whether the chosen interactive slice was set
        lastChosenInteractiveSliceIndex: number; // keeps the index of the selected slice
        donutCenter: { // center of the chart
            x: number; y: number;
        };
        totalDragAngleDifference: number; // keeps how much of a rotation happened in the drag
        previousDragAngle: number; // previous angle of the drag event
        currentIndexDrag: number; // index of the slice that is currently showing in the legend 
        previousIndexDrag: number; // index of the slice that was showing in the legend before current drag event
    }
    export var DonutChartGMOProperties = {
        general: {
            formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },
        },
        dataPoint: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            detailedLegend: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'detailedLegend' },
            legendDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'legendDisplayUnits' },
            legendPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'legendPrecision' },
        },

        show: { objectName: 'GMODonutTitle', propertyName: 'show' },
        titleText: { objectName: 'GMODonutTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'GMODonutTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'GMODonutTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'GMODonutTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'GMODonutTitle', propertyName: 'tooltipText' },

        // Indicators code
        Indicators: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'show' },

            PrimaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'PrimaryMeasure' },
            Threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Threshold' },
            Total_threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Total_threshold' },
        },

        SMIndicator: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'show' },
            SecondaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SecondaryMeasure' },
            SMThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMThreshold' },
            SMTotalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMTotalThreshold' },
        }
    };
    export var detailedLegendType: IEnumType = createEnumType([
        { value: 'None', displayName: 'None' },
        { value: 'Value', displayName: 'Value' },
        { value: 'Percentage', displayName: 'Percentage' },
        { value: 'Both', displayName: 'Both' }
    ]);
    export class DonutChartInteractiveLegend {
        public static InteractiveLegendClassName = 'donutLegend';
        private static ItemMargin = 10; // Margin between items
        private static MinimumItemsInLegendForCycled = 3; // Minimum items in the legend before we cycle it
        private donutChart: DonutChartGMO;
        private legendContainerParent: D3.Selection;
        private legendContainer: D3.Selection;
        private data: DonutDataPoint[];
        private colors: IDataColorPalette;
        private visualInitOptions: VisualInitOptions;
        public noOfLegends: number = 0;
        public noOfColumns: number = 0;
        private currentNumberOfLegendItems: number;
        private currentIndex: number;
        private leftMostIndex: number;
        private rightMostIndex: number;
        private legendItemsPositions: { startX: number; boxWidth: number; }[];
        private legendTransitionAnimationDuration: number;

        constructor(donutChart: DonutChartGMO, legendContainer: D3.Selection, colors: IDataColorPalette, visualInitOptions: VisualInitOptions, settings?: DonutChartSettings) {
            this.legendContainerParent = legendContainer;
            this.colors = colors;
            this.donutChart = donutChart;
            this.visualInitOptions = visualInitOptions;
            this.legendItemsPositions = [];

            this.legendTransitionAnimationDuration = settings && settings.legendTransitionAnimationDuration ? settings.legendTransitionAnimationDuration : 0;
        }
        public updateLegend(sliceIndex): void {
            if (this.currentNumberOfLegendItems <= 1) return; // If the number of labels is one no updates are needed
            this.currentIndex = sliceIndex;
            // "rearrange" legend items if needed, so we would have contnious endless scrolling
            this.updateLabelBlocks(sliceIndex);
        }
        private updateLegendItemsBlocks(rightSidedShift: boolean, numberOfLegendItemsBlocksToShift: number) {
            var legendContainer$ = $(this.legendContainer[0]);

            if (rightSidedShift) {
                var smallestItem = legendContainer$.find('[data-legend-index=' + this.leftMostIndex + ']');
                smallestItem.remove().insertAfter(legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']'));
                var newX = parseInt(legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']').css('left').split('px')[0], 10) + legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']').width() + DonutChartInteractiveLegend.ItemMargin;
                // this.legendItemsPositions[this.leftMostIndex].startX = newX;
                smallestItem.css('left', newX);

                this.rightMostIndex = this.leftMostIndex;
                this.leftMostIndex = (this.leftMostIndex + 1) % this.data.length;
            } else {
                var highestItem = legendContainer$.find('[data-legend-index=' + this.rightMostIndex + ']');
                highestItem.remove().insertBefore(legendContainer$.find('[data-legend-index=' + this.leftMostIndex + ']'));
                var newX = this.legendItemsPositions[this.leftMostIndex].startX - this.legendItemsPositions[this.rightMostIndex].boxWidth - DonutChartInteractiveLegend.ItemMargin;
                this.legendItemsPositions[this.rightMostIndex].startX = newX;
                highestItem.css('left', newX);

                this.leftMostIndex = this.rightMostIndex;
                this.rightMostIndex = (this.rightMostIndex - 1) === -1 ? (this.legendItemsPositions.length - 1) : (this.rightMostIndex - 1);
            }

            if ((numberOfLegendItemsBlocksToShift - 1) !== 0) {
                this.updateLegendItemsBlocks(rightSidedShift, (numberOfLegendItemsBlocksToShift - 1));
            }
        }

        /** Update the legend items, allowing for endless rotation */
        private updateLabelBlocks(index: number) {

            if (this.currentNumberOfLegendItems > DonutChartInteractiveLegend.MinimumItemsInLegendForCycled) {
                // The idea of the four if's is to keep two labels before and after the current one so it will fill the screen.

                // If the index of the slice is the highest currently availble add 2 labels "ahead" of it
                if (this.rightMostIndex === index) this.updateLegendItemsBlocks(true, 2);

                // If the index of the slice is the lowest currently availble add 2 labels "before" it
                if (this.leftMostIndex === index) this.updateLegendItemsBlocks(false, 2);

                // If the index of the slice is the second highest currently availble add a labels "ahead" of it
                if (this.rightMostIndex === (index + 1) || ((this.rightMostIndex === 0) && (index === (this.currentNumberOfLegendItems - 1)))) this.updateLegendItemsBlocks(true, 1);

                // If the index of the slice is the second lowest currently availble add a labels "before" it
                if (this.leftMostIndex === (index - 1) || ((this.leftMostIndex === (this.currentNumberOfLegendItems - 1) && (index === 0)))) this.updateLegendItemsBlocks(false, 1);

            } else {

                if (this.currentNumberOfLegendItems === DonutChartInteractiveLegend.MinimumItemsInLegendForCycled) {
                    // If the index of the slice is the highest currently availble add a label "ahead" of it
                    if (this.rightMostIndex === index) this.updateLegendItemsBlocks(true, 1);

                    // If the index of the slice is the lowest currently availble add a label "before" it
                    if (this.leftMostIndex === index) this.updateLegendItemsBlocks(false, 1);
                }
            }
        }
        public addSpecialCharacters(sKMBValue, title) {
            var displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length;
            //Append characters front
            if (isNaN(parseInt(title[0], 10))) {
                for (var iLoop = 0; iLoop < title.length; iLoop++) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialcharacters += title[iLoop];
                    }
                    else break;
                }
                displayValue = specialcharacters + sKMBValue;
            }
            //Append characters end
            if (isNaN(parseInt(title[title.length - 1], 10))) {
                var specialarray = [], index: number = 0;
                for (var iLoop = titlelength - 1; iLoop >= 0; iLoop--) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialarray[index] = title[iLoop];
                        index++;
                    }
                    else break;
                }
                for (var iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) {
                    specialcharacters += specialarray[iLoop];
                }
                displayValue = sKMBValue + specialcharacters;
            }
            // if (isNaN(parseInt(title[0])) || isNaN(parseInt(title[title.length - 1])))

            return displayValue.trim();
        }
    }

    module DonutChartConversion {

        interface ConvertedDataPoint {
            identity: SelectionId;
            measureFormat: string;
            measureValue: MeasureAndValue;
            highlightMeasureValue: MeasureAndValue;
            index: number;
            label: any;
            categoryLabel: string;
            color: string;
            seriesIndex?: number;
        };

        interface MeasureAndValue {
            measure: number;
            value: number;
        }

        export class DonutChartConverter {
            private dataViewCategorical: DataViewCategorical;
            private dataViewMetadata: DataViewMetadata;
            private highlightsOverflow: boolean;
            private total: number;
            private primaryMeasureTotal: number;
            private secondaryMeasureTotal: number;
            private primaryMeasureIndex: number = -1;
            private secondaryMeasureIndex: number = -1;
            private highlightTotal: number;
            private grouped: DataViewValueColumnGroup[];
            private isMultiMeasure: boolean;
            private isSingleMeasure: boolean;
            private isDynamicSeries: boolean;
            private seriesCount: number;
            private categoryIdentities: DataViewScopeIdentity[];
            private categoryValues: any[];
            private allCategoryObjects: DataViewObjects[];
            private categoryColumnRef: data.SQExpr[];
            private legendDataPoints: LegendDataPoint[];
            private colorHelper: ColorHelper;
            private categoryFormatString: string;
            public hasHighlights: boolean;
            public dataPoints: DonutDataPoint[];
            public legendData: LegendData;
            public indicatorData;
            public dataLabelsSettings: VisualDataLabelsSettings;
            public legendObjectProperties: DataViewObject;
            public maxValue: number;
            public constructor(dataView: DataView, colors: IDataColorPalette, defaultDataPointColor?: string) {
                this.indicatorData = dataView;
                var dataViewCategorical = dataView.categorical;
                this.dataViewCategorical = dataViewCategorical;
                this.dataViewMetadata = dataView.metadata;
                this.seriesCount = dataViewCategorical.values ? dataViewCategorical.values.length : 0;
                this.colorHelper = new ColorHelper(colors, donutChartProps.dataPoint.fill, defaultDataPointColor);
                this.maxValue = 0;
                if (dataViewCategorical.categories && dataViewCategorical.categories.length > 0) {
                    var category = dataViewCategorical.categories[0];
                    this.categoryIdentities = category.identity;
                    this.categoryValues = category.values;
                    this.allCategoryObjects = category.objects;
                    this.categoryColumnRef = <data.SQExpr[]>category.identityFields;
                    this.categoryFormatString = valueFormatter.getFormatString(category.source, donutChartProps.general.formatString);
                }

                var grouped = this.grouped = dataViewCategorical && dataViewCategorical.values ? dataViewCategorical.values.grouped() : undefined;
                this.isMultiMeasure = grouped && grouped.length > 0 && grouped[0].values && grouped[0].values.length > 1;
                this.isSingleMeasure = grouped && grouped.length === 1 && grouped[0].values && grouped[0].values.length === 1;
                this.isDynamicSeries = !!(dataViewCategorical.values && dataViewCategorical.values.source);
                this.hasHighlights = this.seriesCount > 0 && !_.isEmpty(dataViewCategorical.values) && !!dataViewCategorical.values[0].highlights;
                this.highlightsOverflow = false;
                this.total = 0;
                this.primaryMeasureTotal = 0;
                this.secondaryMeasureTotal = 0;
                this.primaryMeasureIndex = -1;
                this.secondaryMeasureIndex = -1;
                this.highlightTotal = 0;
                this.dataPoints = [];
                this.legendDataPoints = [];
                this.dataLabelsSettings = null;
                // Assuming here that seriesCount can have maximum value 2 (primary measure and secondary measure)

                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    var localSum = 0;
                    for (var measureIndex = 0; measureIndex < seriesData.values.length; measureIndex++) {
                        localSum += Math.abs(parseFloat(seriesData.values[measureIndex].toString()));
                        this.total += Math.abs(parseFloat(seriesData.values[measureIndex].toString()));
                        this.highlightTotal += this.hasHighlights ? Math.abs(parseFloat(seriesData.highlights[measureIndex].toString())) : 0;
                    }
                    if (seriesData && seriesData.source && seriesData.source.roles && seriesData.source.roles.hasOwnProperty('Y')) {
                        this.primaryMeasureTotal = localSum;
                        this.primaryMeasureIndex = seriesIndex;
                    }
                    else if (seriesData && seriesData.source && seriesData.source.roles && seriesData.source.roles.hasOwnProperty('SecondaryMeasure')) {
                        this.secondaryMeasureTotal = localSum;
                        this.secondaryMeasureIndex = seriesIndex;
                    }
                }
                this.secondaryMeasureTotal = AxisHelper.normalizeNonFiniteNumber(this.secondaryMeasureTotal);
                this.primaryMeasureTotal = AxisHelper.normalizeNonFiniteNumber(this.primaryMeasureTotal);
                if (this.dataViewMetadata.objects && this.dataViewMetadata.objects.hasOwnProperty('legend'))
                    this.legendObjectProperties = this.dataViewMetadata.objects['legend']['properties'];
                this.total = AxisHelper.normalizeNonFiniteNumber(this.total);
                this.highlightTotal = AxisHelper.normalizeNonFiniteNumber(this.highlightTotal);
            }

            private static normalizedMeasureAndValue(measureAndValue: MeasureAndValue): MeasureAndValue {
                var normalized: MeasureAndValue = $.extend(true, {}, measureAndValue);
                normalized.measure = AxisHelper.normalizeNonFiniteNumber(normalized.measure);
                normalized.value = AxisHelper.normalizeNonFiniteNumber(normalized.value);
                return normalized;
            }

            public fetchPrimaryMeasureTotal(): number {
                return this.primaryMeasureTotal;
            }
            public fetchSecondaryMeasureTotal(): number {
                return this.secondaryMeasureTotal;
            }
            public convert(): void {
                var convertedData: ConvertedDataPoint[];
                if (this.total !== 0) {
                    // We render based on categories, series, or measures in that order of preference
                    if (this.categoryValues) {
                        convertedData = this.convertCategoricalWithSlicing();
                    }
                    else if (this.isDynamicSeries) {
                        // Series but no category.
                        convertedData = this.convertSeries();
                    }
                    else {
                        // No category or series; only measures.
                        convertedData = this.convertMeasures();
                    }
                }
                else {
                    convertedData = [];
                }

                // Check if any of the highlight values are > non-highlight values
                var highlightsOverflow = false;
                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount && !highlightsOverflow; i++) {
                    var point = convertedData[i];
                    if (Math.abs(point.highlightMeasureValue.measure) > Math.abs(point.measureValue.measure)) {
                        highlightsOverflow = true;
                    }
                }
                var dataViewMetadata = this.dataViewMetadata;
                if (dataViewMetadata) {

                    if (dataViewMetadata.objects) {
                        this.legendObjectProperties = DataViewObjects.getObject(dataViewMetadata.objects, 'legend', {});
                    }
                    else {
                        this.legendObjectProperties = {};
                    }
                }

                this.dataPoints = [];
                var formatStringProp = donutChartProps.general.formatString;
                var prevPointColor: string;

                for (var i = 0, dataPointCount = convertedData.length; i < dataPointCount; i++) {
                    var point = convertedData[i];

                    // Normalize the values here and then handle tooltip value as infinity
                    var normalizedHighlight = DonutChartConverter.normalizedMeasureAndValue(point.highlightMeasureValue);
                    var normalizedNonHighlight = DonutChartConverter.normalizedMeasureAndValue(point.measureValue);

                    var measure = normalizedNonHighlight.measure;
                    var percentage = (this.total > 0) ? normalizedNonHighlight.value / this.total : 0.0;
                    var highlightRatio = 0;
                    if (normalizedNonHighlight.value > this.maxValue)
                        this.maxValue = normalizedNonHighlight.value;
                    if (normalizedHighlight.value > this.maxValue)
                        this.maxValue = normalizedHighlight.value;

                    if (this.hasHighlights) {
                        // When any highlight value is greater than the corresponding non-highlight value
                        // we just render all of the highlight values and discard the non-highlight values.
                        if (highlightsOverflow) {
                            measure = normalizedHighlight.measure;

                            percentage = (this.highlightTotal > 0) ? normalizedHighlight.value / this.highlightTotal : 0.0;
                            highlightRatio = 1;
                        }
                        else {
                            highlightRatio = normalizedHighlight.value / normalizedNonHighlight.value;
                        }

                        if (!highlightRatio) {
                            highlightRatio = DonutChart.EffectiveZeroValue;
                        }
                    }
                    var categoryValue = point.categoryLabel;
                    var categorical = this.dataViewCategorical;
                    var valueIndex: number = categorical.categories ? null : i;
                    valueIndex = point.seriesIndex !== undefined ? point.seriesIndex : valueIndex;
                    var valuesMetadata = categorical.values[valueIndex].source;
                    var value: number = point.measureValue.measure;
                    var highlightedValue: number = this.hasHighlights && point.highlightMeasureValue.value !== 0 ? point.highlightMeasureValue.measure : undefined;
                    var tooltipInfo: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, categorical, categoryValue, value, null, null, valueIndex, i, highlightedValue);

                    

                    var strokeWidth = prevPointColor === point.color && value && value > 0 ? 1 : 0;
                    prevPointColor = value && value > 0 ? point.color : prevPointColor;
                    this.dataPoints.push({
                        identity: point.identity,
                        measure: measure,
                        measureFormat: point.measureFormat,
                        percentage: percentage,
                        index: point.index,
                        label: categoryValue,//point.label,
                        highlightRatio: highlightRatio,
                        selected: false,
                        tooltipInfo: tooltipInfo,
                        color: point.color,
                        strokeWidth: strokeWidth,
                        labelFormatString: valuesMetadata.format,
                    });
                    
                    var displayUnits, modelPrecisionValue;
                    var modelingPrecision: number = 0;
                    
                    if (this.legendObjectProperties && (this.legendObjectProperties['labelPrecision'] || this.legendObjectProperties['labelPrecision'] == 0)) {
                        var precisionValue = this.legendObjectProperties['labelPrecision'];
                        if (!precisionValue && precisionValue != 0) {
                            if (modelingPrecision)
                                modelPrecisionValue = modelingPrecision;
                        }
                        else {
                            modelPrecisionValue = precisionValue;
                        }
                        if (precisionValue > 20)
                            precisionValue = 20;
                    }
                    else {
                        if (modelingPrecision) {
                            modelPrecisionValue = modelingPrecision;
                        }
                        else {
                            modelPrecisionValue = 0;
                        }
                    }
                    
                    var formatter = valueFormatter.create({ format: '0.00 %;-0.00 %;0.00 %', value: 0, precision: modelPrecisionValue });
                    var percentageValue = formatter.format(percentage);
                    
                    this.legendDataPoints[i]['percentage'] = percentageValue;
                    this.legendDataPoints[i]['percentageTooltip'] = percentageValue;
                    
                    if (tooltipInfo.length > 1) {
                        this.legendDataPoints[i]['measureTooltip'] = tooltipInfo[1].value;
                        if (tooltipInfo[1].value.indexOf('.') > -1) {
                            modelingPrecision = tooltipInfo[1].value.split('.')[1].length;
                        }
                    }
                    else {
                        this.legendDataPoints[i]['measureTooltip'] = tooltipInfo[0].value;
                        if (tooltipInfo[0].value.indexOf('.') > -1) {
                            modelingPrecision = tooltipInfo[0].value.split('.')[1].length;
                        }
                    }
                    this.legendDataPoints[i].measure = DonutChartGMO.prototype.measureValue(point.measureValue.value, point.measureFormat, this.legendObjectProperties, modelingPrecision);

                    if (this.secondaryMeasureIndex !== -1) {
                        if (isNaN(parseInt(this.dataViewCategorical.values[this.secondaryMeasureIndex].values[i].toString(), 10))) {
                            this.legendDataPoints[i]['secondarymeasure'] = '(Blank)';
                            this.legendDataPoints[i]['secondaryMeasureTooltip'] = '(Blank)';
                            this.legendDataPoints[i]['secondaryIndicator'] = '';
                        }
                        else {
                            modelingPrecision = 0;
                            var tooltipInfoSecondary: TooltipDataItem[] = TooltipBuilder.createTooltipInfo(formatStringProp, categorical, categoryValue, this.dataViewCategorical.values[this.secondaryMeasureIndex].values[i], null, null, this.secondaryMeasureIndex, i, undefined);
                            this.legendDataPoints[i]['secondaryIndicator'] = this.isSecondaryIndicator(this.dataViewCategorical.values[this.secondaryMeasureIndex].values[i], this.indicatorData);
                            if (tooltipInfoSecondary.length > 1) {
                                this.legendDataPoints[i]['secondaryMeasureTooltip'] = tooltipInfoSecondary[1].value;
                                if (tooltipInfoSecondary[1].value.indexOf('.') > -1) {
                                    modelingPrecision = tooltipInfoSecondary[1].value.split('.')[1].length;
                                }
                            }
                            this.legendDataPoints[i]['secondarymeasure'] = DonutChartGMO.prototype.measureValue(this.dataViewCategorical.values[this.secondaryMeasureIndex].values[i], this.dataViewMetadata.columns[this.secondaryMeasureIndex].format, this.legendObjectProperties, modelingPrecision);

                        }
                    }
                    this.legendDataPoints[i]['primaryIndicator'] = this.isPrimaryIndicator(point.measureValue.value, this.indicatorData);
                }
                // Create data labels settings
                this.dataLabelsSettings = this.convertDataLabelSettings();
                this.legendData = this.convertLegendData();
                //append percentage values to legend data

            }
            private isPrimaryIndicator(indicatorValue, dataview) {
                var isPrimaryIndicator, isPercentage;
                for (var i = 0; i < dataview.categorical.values.length; i++) {
                    if (dataview.categorical.values[i].source.roles.hasOwnProperty('Y')) {
                        if (dataview.categorical.values[i].source.format && dataview.categorical.values[i].source.format.search('%') > 0)
                            isPercentage = true;
                        break;
                    }
                }
                if (DonutChartGMO.prototype.getShowStatus(dataview, 'show', 'Indicators')) {
                    if (DonutChartGMO.prototype.getShowStatus(dataview, 'PrimaryMeasure', 'Indicators'))
                        var threshold_Value = 0;

                    else {
                        threshold_Value = DonutChartGMO.prototype.getStatus(dataview, 'Threshold', 'Indicators');

                        if (isPercentage) {
                            threshold_Value = threshold_Value / 100;

                        }
                    }
                    if (!isPercentage) {
                        indicatorValue = parseInt(indicatorValue, 10);
                    }

                    if (threshold_Value <= indicatorValue) {
                        isPrimaryIndicator = true;
                    }
                    else {
                        isPrimaryIndicator = false;
                    }
                }
                else {
                    isPrimaryIndicator = '';
                }
                return isPrimaryIndicator;
            }
            private isSecondaryIndicator(secondaryIndicator, dataview) {
                var isSecondaryIndicator, isPercentage;
                for (var i = 0; i < dataview.categorical.values.length; i++) {
                    if (dataview.categorical.values[i].source.roles.hasOwnProperty('SecondaryMeasure')) {
                        if (dataview.categorical.values[i].source.format && dataview.categorical.values[i].source.format.search('%') > 0)
                            isPercentage = true;
                        break;
                    }
                }
                if (DonutChartGMO.prototype.getShowStatus(dataview, 'show', 'SMIndicator')) {
                    if (DonutChartGMO.prototype.getShowStatus(dataview, 'SecondaryMeasure', 'SMIndicator'))
                        var threshold_Value = 0;

                    else {
                        threshold_Value = DonutChartGMO.prototype.getStatus(dataview, 'SMThreshold', 'SMIndicator');
                        if (isPercentage)
                            threshold_Value = threshold_Value / 100;
                    }
                    if (!isPercentage) {
                        secondaryIndicator = parseInt(secondaryIndicator, 10);
                    }
                    if (threshold_Value <= secondaryIndicator) {
                        isSecondaryIndicator = true;
                    }
                    else {
                        isSecondaryIndicator = false;
                    }
                }
                else {
                    isSecondaryIndicator = '';
                }
                return isSecondaryIndicator;
            }
            private getLegendTitle(name): string {
                if (this.total !== 0) {
                    switch (name) {
                        case 'title':
                            // If category exists, we render title using category source. If not, we render title
                            // using measure.
                            var dvCategorySourceName = this.dataViewCategorical.categories && this.dataViewCategorical.categories.length > 0 && this.dataViewCategorical.categories[0].source
                                ? this.dataViewCategorical.categories[0].source.displayName : "";
                            if (this.categoryValues) {
                                return dvCategorySourceName;
                            }
                            break;
                        case 'primaryTitle':
                            var dvValuesSourceName: string = '';
                            if (this.primaryMeasureIndex !== -1 && this.legendObjectProperties['detailedLegend'] && this.legendObjectProperties['detailedLegend'] !== 'None') {
                                var index: number = this.primaryMeasureIndex;
                                dvValuesSourceName = this.dataViewCategorical.values[index].source.displayName;
                            }
                            return dvValuesSourceName;
                            break;
                        case 'secondaryTitle':
                            var dvValuesSourceName: string = '';
                            if (this.secondaryMeasureIndex !== -1) {//both measures
                                var index: number = this.secondaryMeasureIndex;
                                dvValuesSourceName = this.dataViewCategorical.values[index].source.displayName;
                            }

                            return dvValuesSourceName;
                            break;
                    }

                }
                else {
                    return "";
                }
            }
            private convertCategoricalWithSlicing(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;

                var formatStringProp = donutChartProps.general.formatString;
                var dataPoints: ConvertedDataPoint[] = [];
                for (var categoryIndex = 0, categoryCount = this.categoryValues.length; categoryIndex < categoryCount; categoryIndex++) {
                    var categoryValue = this.categoryValues[categoryIndex];
                    var thisCategoryObjects = this.allCategoryObjects ? this.allCategoryObjects[categoryIndex] : undefined;
                    var legendIdentity = SelectionId.createWithId(this.categoryIdentities[categoryIndex]);
                    var color = this.colorHelper.getColorForSeriesValue(thisCategoryObjects, this.categoryColumnRef, categoryValue);
                    var categoryLabel = valueFormatter.format(categoryValue, this.categoryFormatString);
                    // Series are either measures in the multi-measure case, or the single series otherwise
                    for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                        var seriesData = dataViewCategorical.values[seriesIndex];

                        var label = this.isSingleMeasure
                            ? categoryLabel
                            : converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);

                        var nonHighlight = seriesData.values[categoryIndex] || 0;
                        var highlight = this.hasHighlights ? seriesData.highlights[categoryIndex] || 0 : 0;

                        var measure: string;
                        var seriesGroup: any;

                        if (this.isMultiMeasure) {
                            measure = seriesData.source.queryName;
                        }
                        else if (seriesData.identity)
                            seriesGroup = seriesData;

                        var identity: SelectionId = SelectionIdBuilder.builder()
                            .withCategory(dataViewCategorical.categories[0], categoryIndex)
                            .withSeries(seriesGroup, seriesGroup)
                            .withMeasure(measure)
                            .createSelectionId();
                        var dataPoint: ConvertedDataPoint = {
                            identity: identity,
                            measureFormat: valueFormatter.getFormatString(seriesData.source, formatStringProp, true),
                            measureValue: <MeasureAndValue>{
                                measure: nonHighlight,
                                value: Math.abs(parseFloat(nonHighlight.toString())),

                            },
                            highlightMeasureValue: <MeasureAndValue>{
                                measure: highlight,
                                value: Math.abs(parseFloat(highlight.toString())),

                            },
                            index: categoryIndex * this.seriesCount + seriesIndex,
                            label: label,
                            categoryLabel: categoryLabel,
                            color: color,
                            seriesIndex: seriesIndex
                        };
                        dataPoints.push(dataPoint);
                        if (!(seriesData.source.roles.hasOwnProperty('Y'))) {
                            dataPoints.pop();
                        }
                    }

                    this.legendDataPoints.push({
                        label: categoryLabel,
                        tooltip: categoryLabel,
                        measure: '',
                        secondarymeasure: '',
                        percentage: '',
                        percentageTooltip: '',
                        measureTooltip: '',
                        secondaryMeasureTooltip: '',
                        color: color,
                        icon: LegendIcon.Circle,
                        identity: legendIdentity,
                        selected: false
                    });
                }

                return dataPoints;
            }

            private convertMeasures(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = donutChartProps.general.formatString;
                for (var measureIndex = 0; measureIndex < this.seriesCount; measureIndex++) {
                    var measureData = dataViewCategorical.values[measureIndex];
                    var measureFormat = valueFormatter.getFormatString(measureData.source, formatStringProp, true);
                    var measureLabel = measureData.source.displayName;
                    var identity = SelectionId.createWithMeasure(measureData.source.queryName);

                    debug.assert(measureData.values.length > 0, 'measure should have data points');
                    debug.assert(!this.hasHighlights || measureData.highlights.length > 0, 'measure with highlights should have highlight data points');
                    var nonHighlight = measureData.values[0] || 0;
                    var highlight = this.hasHighlights ? measureData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForMeasure(measureData.source.objects, measureData.source.queryName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: measureFormat,
                        measureValue: <MeasureAndValue>{
                            measure: nonHighlight,
                            value: Math.abs(parseFloat(nonHighlight.toString())),
                        },
                        highlightMeasureValue: <MeasureAndValue>{
                            measure: highlight,
                            value: Math.abs(parseFloat(highlight.toString())),
                        },
                        index: measureIndex,
                        label: measureLabel,
                        categoryLabel: measureLabel,
                        color: color
                    };
                    dataPoints.push(dataPoint);
                    if (!(measureData.source.roles.hasOwnProperty('Y'))) {
                        dataPoints.pop();
                    }
                    this.legendDataPoints.push({
                        measure: '',
                        secondarymeasure: '',
                        percentage: '',
                        percentageTooltip: '',
                        label: dataPoint.label,
                        tooltip: dataPoint.label,
                        measureTooltip: '',
                        secondaryMeasureTooltip: '',
                        color: dataPoint.color,
                        icon: LegendIcon.Circle,
                        identity: dataPoint.identity,
                        selected: false
                    });
                }
                return dataPoints;
            }
            private convertSeries(): ConvertedDataPoint[] {
                var dataViewCategorical = this.dataViewCategorical;
                var dataPoints: ConvertedDataPoint[] = [];
                var formatStringProp = donutChartProps.general.formatString;
                for (var seriesIndex = 0; seriesIndex < this.seriesCount; seriesIndex++) {
                    var seriesData = dataViewCategorical.values[seriesIndex];
                    var seriesFormat = valueFormatter.getFormatString(seriesData.source, formatStringProp, true);
                    var label = converterHelper.getFormattedLegendLabel(seriesData.source, dataViewCategorical.values, formatStringProp);
                    var identity = SelectionId.createWithId(seriesData.identity);
                    var seriesName = converterHelper.getSeriesName(seriesData.source);
                    var objects = this.grouped && this.grouped[seriesIndex] && this.grouped[seriesIndex].objects;

                    debug.assert(seriesData.values.length > 0, 'measure should have data points');
                    debug.assert(!this.hasHighlights || seriesData.highlights.length > 0, 'measure with highlights should have highlight data points');
                    var nonHighlight = seriesData.values[0] || 0;
                    var highlight = this.hasHighlights ? seriesData.highlights[0] || 0 : 0;

                    var color = this.colorHelper.getColorForSeriesValue(objects, dataViewCategorical.values.identityFields, seriesName);

                    var dataPoint: ConvertedDataPoint = {
                        identity: identity,
                        measureFormat: seriesFormat,
                        measureValue: <MeasureAndValue>{
                            measure: nonHighlight,
                            value: Math.abs(parseFloat(nonHighlight.toString())),

                        },
                        highlightMeasureValue: <MeasureAndValue>{
                            measure: highlight,
                            value: Math.abs(parseFloat(highlight.toString())),

                        },
                        index: seriesIndex,
                        label: label,
                        categoryLabel: label,
                        color: color,
                        seriesIndex: seriesIndex
                    };
                    dataPoints.push(dataPoint);
                    if (!(seriesData.source.roles.hasOwnProperty('Y'))) {
                        dataPoints.pop();
                    }
                    this.legendDataPoints.push({
                        label: dataPoint.label,
                        tooltip: dataPoint.label,
                        color: dataPoint.color,
                        icon: LegendIcon.Circle,
                        identity: dataPoint.identity,
                        measureTooltip: '',
                        secondaryMeasureTooltip: '',
                        measure: '',
                        percentage: '',
                        percentageTooltip: '',
                        secondarymeasure: '',
                        selected: false
                    });
                }
                return dataPoints;
            }
            public convertDataLabelSettings(): VisualDataLabelsSettings {
                var dataViewMetadata = this.dataViewMetadata;
                var dataLabelsSettings = dataLabelUtils.getDefaultDonutLabelSettings();
                var valueIndex: number = 0;

                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects) {
                        // Handle lables settings
                        var labelsObj = <DataLabelObject>objects['labels'];
                        if (labelsObj) {
                            if (labelsObj.labelPrecision > 20) {
                                labelsObj.labelPrecision = 20;
                            }
                            dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, dataLabelsSettings);
                        }
                    }

                }


                return dataLabelsSettings;
            }
            private convertLegendData(): LegendData {
                return {
                    dataPoints: this.legendDataPoints,
                    labelColor: LegendData.DefaultLegendLabelFillColor,
                    title: this.getLegendTitle('title'),
                    primaryTitle: this.getLegendTitle('primaryTitle'),
                    secondaryTitle: this.getLegendTitle('secondaryTitle'),
                    fontSize: SVGLegend.DefaultFontSizeInPt,
                };
            }
        }
    }

    export class DonutChartGMO implements IVisual {
        /**
          * Informs the System what it can do
          * Fields, Formatting options, data reduction & QnA hints
          */

        private root: D3.Selection;
        private dataView: DataView;
        private titleSize: number = 12;
        private updateCount: number = 0;
        public isPrimaryMeasureSelected: any = false;
        public isSecondaryMeasureSelected: any = false;
        public isPrimaryMeasurePercentage: any = false;
        public isSecondaryMeasurePercentage: any = false;
        public primaryMeasureSum: number = 0;
        public secondaryMeasureName: string = "";
        public secondaryMeasureSum: number = 0;
        public isLegendFieldSelected: any = false;
        public isDetailsFieldSelected: any = false;
        public primaryMeasureSpecialCharacter: string = "";
        public primaryMeasureSpecialCharacterIndex: number = -1;    // 0 refers to starting of datavalue, 1 indicates last in data value
        public secondaryMeasureSpecialCharacter: string = "";
        public secondaryMeasureSpecialCharacterIndex: number = -1; // 0 refers to starting of datavalue, 1 indicates last in data value
        public detailLabelsColor: any;
        public detailLabelsDisplayUnits: any;
        public detailLabelsDecimalPlaces: any;
        public detailLabelsTextSize: any;
        public detailLabelsShowSummary: any;
        public primaryMeasureSummaryText: any;
        private static ClassName = 'donutChartGMO';
        private static DrillDownAnimationDuration = 1000;
        private static OuterArcRadiusRatio = 0.9;
        private static InnerArcRadiusRatio = 0.8;
        private static OpaqueOpacity = 1.0;
        private static SemiTransparentOpacity = 0.6;
        private static defaultSliceWidthRatio: number = 0.48;
        private static invisibleArcLengthInPixels: number = 3;
        private static sliceClass: ClassAndSelector = createClassAndSelector('slice');
        private static sliceHighlightClass: ClassAndSelector = createClassAndSelector('slice-highlight');
        private static twoPi = 2 * Math.PI;
        public static InteractiveLegendContainerHeight = 70;
        public static EffectiveZeroValue = 0.000000001; // Very small multiplier so that we have a properly shaped zero arc to animate to/from.
        public static PolylineOpacity = 0.5;
        public dataViews: DataView[];
        private sliceWidthRatio: number;
        private svg: D3.Selection;
        private mainGraphicsContext: D3.Selection;
        private labelGraphicsContext: D3.Selection;
        private clearCatcher: D3.Selection;
        private legendContainer: D3.Selection;
        private parentViewport: IViewport;
        private currentViewport: IViewport;
        private halfViewPortWidth: any;
        private halfViewPortHeight: any;
        private formatter: ICustomValueFormatter;
        private data: DonutDataGMO;
        private pie: D3.Layout.PieLayout;
        private arc: D3.Svg.Arc;
        private outerArc: D3.Svg.Arc;
        private radius: number;
        private previousRadius: number;
        private key: any;
        private colors: IDataColorPalette;
        private style: IVisualStyle;
        private drilled: boolean;
        private allowDrilldown: boolean;
        private options: VisualInitOptions;
        private isInteractive: boolean;
        private interactivityState: InteractivityState;
        private chartRotationAnimationDuration: number;
        private interactivityService: IInteractivityService;
        //ts 
        private legend: IGMOLegend;
        private layerLegendData: LegendData;
        private legendLabelFontSize: number;
        private static LegendLabelFontSizeDefault: number = 9;
        private legendObjectProperties: DataViewObject;
        private _viewport: IViewport;
        private get viewport(): IViewport {
            return this._viewport || { width: 0, height: 0 };
        }
        private cartesianSmallViewPortProperties: CartesianSmallViewPortProperties;
        //ts end
        private hasSetData: boolean;
        private isScrollable: boolean;
        private disableGeometricCulling: boolean;
        private hostService: IVisualHostServices;
        private settings: DonutChartSettings;
        private tooltipsEnabled: boolean;
        private donutProperties: DonutChartProperties;
        private maxHeightToScaleDonutLegend: number;
        //global variables for indicators
        private show: any;
        private PrimaryMeasure: any;
        private Threshold: number;
        private Total_Threshold: number;
        private SecondaryMeasure: any;
        private SMThreshold: number;
        private SMTotalThreshold: number;
        public customLegendHeight: any = 0;
        public customLegendWidth: any = 0;
        private behavior: IInteractiveBehavior;
        /**
         * Note: Public for testing.
         */
        public animator: IDonutChartAnimator;
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: 0,
                    displayName: 'Legend',
                    description: 'The categorical field to show for color'
                },
                {
                    name: 'Y',
                    kind: 1,
                    displayName: 'Primary Measure',
                    description: 'Primary Measure',
                    requiredTypes: [{ numeric: true }, { integer: true }],
                },
                {
                    name: 'SecondaryMeasure',
                    kind: 1,
                    displayName: 'Secondary Measure',
                    description: 'Secondary Measure',
                    requiredTypes: [{ numeric: true }, { integer: true }],
                },

            ],
            objects: {
                general: {
                    displayName: 'General',
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                    },
                },
                legend: {
                    displayName: 'Legend',
                    description: 'Display legend options',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        position: {
                            displayName: 'Position',
                            description: 'Select the location for the legend',
                            type: { enumeration: legendPosition.type }
                        },
                        showTitle: {
                            displayName: 'Title',
                            description: 'Display a title for legend symbols',
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Legend Name',
                            description: 'Title text',
                            type: { text: true },
                            suppressFormatPainterCopy: true
                        },
                        labelColor: {
                            displayName: 'Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            type: { formatting: { fontSize: true } }
                        },
                        detailedLegend: {
                            displayName: 'Primary Measure',
                            description: 'Displaying the legend details based on selection',
                            type: { enumeration: detailedLegendType },
                            suppressFormatPainterCopy: true
                        },
                        labelDisplayUnits: {
                            displayName: 'Display Units',
                            description: 'Select the units (millions, billions, etc.)',
                            placeHolderText: '0',
                            type: { formatting: { labelDisplayUnits: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelPrecision: {
                            displayName: 'Decimal Places',
                            description: 'Select the number of decimal places to display',
                            placeHolderText: 'Auto',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true,
                        },
                    }
                },
                dataPoint: {
                    displayName: 'Data colors',
                    description: 'Display data color options',
                    properties: {
                        fill: {
                            displayName: 'Fill',
                            type: { fill: { solid: { color: true } } }
                        }
                    }
                },
                labels: {
                    displayName: 'Detail Labels',
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        color: {
                            displayName: 'Color',
                            description: 'Select color for data labels',
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: 'Display Units',
                            description: 'Select the units (millions, billions, etc.)',
                            type: { formatting: { labelDisplayUnits: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelPrecision: {
                            displayName: 'Decimal Places',
                            description: 'Select the number of decimal places to display',
                            placeHolderText: 'Auto',
                            type: { numeric: true },
                            suppressFormatPainterCopy: true,
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            type: { formatting: { fontSize: true } },
                            suppressFormatPainterCopy: true,
                        },
                        labelStyle: {
                            displayName: 'Label Style',
                            type: { enumeration: labelStyle.type }
                        },
                        showSummary: {
                            displayName: 'Show Summary',
                            type: { bool: true }
                        },
                        primaryMeasureSummaryText: {
                            displayName: 'Summary Text',
                            type: { text: true }
                        },
                    },
                },
                GMODonutTitle: {
                    displayName: 'Donut Title',
                    properties: {
                        show: {
                            displayName: 'Show',
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Title Text',
                            description: 'The name of the visual',
                            type: { text: true }
                        },
                        fill1: {
                            displayName: 'Font color',
                            description: 'Font color for the Donut title',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for the Donut title',
                            type: { formatting: { fontSize: true } }
                        },
                        backgroundColor: {
                            displayName: 'Background color',
                            description: 'Background color for the Donut title',
                            type: { fill: { solid: { color: true } } }
                        },
                        tooltipText: {
                            displayName: 'Tooltip Text',
                            description: 'Tooltip text for the Donut title',
                            type: { text: true }
                        }
                    }
                },
                //Indicators Code
                Indicators: {
                    displayName: 'Primary Indicators',
                    description: 'Display Indicators options',
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        PrimaryMeasure: {
                            displayName: 'Sign Indicator',
                            description: 'Indicator based on sign for Primary Measure',
                            placeHolderText: true,
                            type: { bool: true }
                        },
                        Threshold: {
                            displayName: 'Threshold',
                            description: 'Threshold value for Primary Measure',
                            type: { numeric: true }
                        },
                        Total_Threshold: {
                            displayName: 'Total Value Threshold',
                            description: 'Threshold value for primary measure total',
                            type: { numeric: true }
                        },
                    },
                },

                SMIndicator: {
                    displayName: 'Secondary Indicators',
                    description: 'Display Indicators options',
                    properties: {
                        show: {
                            type: { bool: true }
                        },
                        SecondaryMeasure: {
                            displayName: 'Sign Indicator',
                            description: 'Indicator for Secondary Measure',
                            type: { bool: true }
                        },
                        SMThreshold: {
                            displayName: 'Threshold',
                            description: 'Threshold value for Secondary Measure',
                            type: { numeric: true }
                        },

                        SMTotalThreshold: {
                            displayName: 'Total Value Threshold',
                            description: 'Threshold value for secondary measure total',
                            type: { numeric: true }
                        },
                    },
                },
            },
            dataViewMappings: [{
                conditions: [
                    { 'Category': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 } },
                    { 'Category': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 } }
                ],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        group: {
                            by: 'Series',
                            select: [{ bind: { to: 'Y' } }, { bind: { to: 'SecondaryMeasure' } }],
                            dataReductionAlgorithm: { top: {} }
                        }
                    },
                    rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                },
            }],

            suppressDefaultTitle: true,
            sorting: {
                default: {},
            },
            supportsHighlight: true,
            drilldown: {
                roles: ['Category']
            },
        };
        constructor(options?: DonutConstructorOptions) {
            if (options) {

                this.sliceWidthRatio = options.sliceWidthRatio;
                this.animator = options.animator;
                this.isScrollable = options.isScrollable ? options.isScrollable : false;
                this.disableGeometricCulling = options.disableGeometricCulling ? options.disableGeometricCulling : false;
                this.tooltipsEnabled = options.tooltipsEnabled;
                if (options.smallViewPortProperties) {
                    this.maxHeightToScaleDonutLegend = options.smallViewPortProperties.maxHeightToScaleDonutLegend;
                }
            }
            if (this.sliceWidthRatio == null) {
                this.sliceWidthRatio = DonutChartGMO.defaultSliceWidthRatio;
            }
        }

        public static converter(dataView: DataView, colors: IDataColorPalette, defaultDataPointColor?: string, viewport?: IViewport, disableGeometricCulling?: boolean, interactivityService?: IInteractivityService): DonutDataGMO {
            var converter = new DonutChartConversion.DonutChartConverter(dataView, colors, defaultDataPointColor);
            converter.convert();
            var primaryMeasureSum = converter.fetchPrimaryMeasureTotal()
                , secondaryMeasureSum = converter.fetchSecondaryMeasureTotal();
            var d3PieLayout = d3.layout.pie()
                .sort(null)
                .value((d: DonutDataPoint) => {
                    return d.percentage;
                });
            if (interactivityService) {
                interactivityService.applySelectionStateToData(converter.dataPoints);
                interactivityService.applySelectionStateToData(converter.legendData.dataPoints);
            }
            var culledDataPoints = (!disableGeometricCulling && viewport) ? DonutChart.cullDataByViewport(converter.dataPoints, converter.maxValue, viewport) : converter.dataPoints;
            return {
                dataPointsToDeprecate: culledDataPoints,
                dataPoints: d3PieLayout(culledDataPoints),
                unCulledDataPoints: converter.dataPoints,
                dataPointsToEnumerate: converter.legendData.dataPoints,
                legendData: converter.legendData,
                hasHighlights: converter.hasHighlights,
                dataLabelsSettings: converter.dataLabelsSettings,
                legendObjectProperties: converter.legendObjectProperties,
                maxValue: converter.maxValue,
                visibleGeometryCulled: converter.dataPoints.length !== culledDataPoints.length,
                primaryMeasureSum: primaryMeasureSum,
                secondaryMeasureSum: secondaryMeasureSum,
            };
        }

        public init(options: VisualInitOptions) {

            this.root = d3.select(options.element.get(0));
            this.options = options;
            var element = options.element;
            // Ensure viewport is empty on init
            element.empty();
            this.viewport = options.viewport;
            this.parentViewport = options.viewport;
            this.behavior = new DonutChartWebBehavior();
            // avoid deep copy
            this.currentViewport = {
                height: options.viewport.height,
                width: options.viewport.width,
            };

            this.formatter = valueFormatter.format;
            this.data = {
                dataPointsToDeprecate: [],
                dataPointsToEnumerate: [],
                dataPoints: [],
                unCulledDataPoints: [],
                legendData: { title: "", dataPoints: [], fontSize: SVGLegend.DefaultFontSizeInPt },
                hasHighlights: false,
                dataLabelsSettings: dataLabelUtils.getDefaultDonutLabelSettings(),
            };
            this.drilled = false;
            // Leaving this false for now, will depend on the datacategory in the future
            this.allowDrilldown = false;
            this.style = options.style;
            this.colors = this.style.colorPalette.dataColors;
            this.radius = 0;
            this.isInteractive = options.interactivity && options.interactivity.isInteractiveLegend;
            var donutChartSettings = this.settings;

            d3.select(element.get(0))
                .append('div')
                .classed('Title_Div_Text', true)
                .style({ 'width': '100%', 'display': 'inline-block' })
                .html('<div class = "GMODonutTitleDiv" style = "max-width: 80%; display: inline-block">' + '</div>'
                + '<span class = "GMODonutTitleIcon" style = "width: 2%; display: none; cursor: pointer; position: absolute">&nbsp(&#063;)</span>');
            this.hostService = options.host;
            if (this.behavior) {
                this.interactivityService = createInteractivityService(options.host);
            }

            this.chartRotationAnimationDuration = (donutChartSettings && donutChartSettings.chartRotationAnimationDuration) ? donutChartSettings.chartRotationAnimationDuration : 0;

            this.legend = new GMOSVGLegend(element, LegendPosition.Top, this.interactivityService, true);
            this.svg = d3.select(element.get(0))
                .append('svg')
                .style('position', 'relative')
                .classed(DonutChartGMO.ClassName, true);

            if (this.behavior)
                this.clearCatcher = appendClearCatcher(this.svg);

            this.mainGraphicsContext = this.svg.append('g');
            this.mainGraphicsContext.append("g")
                .classed('slices', true);

            this.labelGraphicsContext = this.svg
                .append("g")
                .classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);

            this.pie = d3.layout.pie()
                .sort(null)
                .value((d: DonutDataPoint) => {
                    return d.percentage;

                });
            d3.select(element.get(0))
                .append('div')
                .classed('errorMessage', true)
                .text("Please select 'Primary Measure' value")
                .style({ 'display': 'none' });
            d3.select(element.get(0))
                .append('div')
                .classed('SummarizedDiv', true);


        }

        public update(options: VisualUpdateOptions): void {
            this.updateCount++;
            if (!options.dataViews || (options.dataViews.length < 1) || !options.dataViews[0] || !options.dataViews[0].categorical) {
                return;
            }
            this.dataView = options.dataViews[0];
            this.isPrimaryMeasureSelected = false;
            this.isSecondaryMeasureSelected = false;
            this.isLegendFieldSelected = false;
            this.isDetailsFieldSelected = false;
            var legendProperties;
            this.isPrimaryMeasurePercentage = false;
            this.isSecondaryMeasurePercentage = false;
            this.root.select('.legend').style({ 'display': 'inherit' });
            this.root.select('.donutLegend').style({ 'display': 'block' });
            this.primaryMeasureSpecialCharacter = "";
            this.primaryMeasureSpecialCharacterIndex = -1;
            this.secondaryMeasureSpecialCharacter = "";
            this.secondaryMeasureSpecialCharacterIndex = -1;
            var valueWithSpecialCharacter = "";
            if (this.dataView && this.dataView.categorical && this.dataView.categorical.categories && this.dataView.categorical.categories.length > 0) {
                this.isLegendFieldSelected = true;
            }
            if (this.dataView && this.dataView.categorical && this.dataView.categorical.values) {
                if (this.dataView.categorical.values.source) {
                    this.isDetailsFieldSelected = true;
                }

                for (var iCount = 0; iCount < this.dataView.categorical.values.length; iCount++) {
                    valueWithSpecialCharacter = "";
                    if (this.dataView.categorical.values[iCount].source
                        && this.dataView.categorical.values[iCount].source.roles
                        && this.dataView.categorical.values[iCount].source.roles.hasOwnProperty('Y')) {
                        this.isPrimaryMeasureSelected = true;
                        valueWithSpecialCharacter = valueFormatter.format(2, this.dataView.categorical.values[iCount].source.format);
                        valueWithSpecialCharacter = valueWithSpecialCharacter + "";
                        valueWithSpecialCharacter = valueWithSpecialCharacter.replace(/\s+/g, '');
                        if (-1 === this.primaryMeasureSpecialCharacterIndex) {
                            if (isNaN(parseInt(valueWithSpecialCharacter.charAt(0), 10))) {
                                for (var iCounts = 0; iCounts < valueWithSpecialCharacter.indexOf("2"); iCounts++) {
                                    this.primaryMeasureSpecialCharacter = this.primaryMeasureSpecialCharacter + valueWithSpecialCharacter.charAt(iCounts);
                                }
                                this.primaryMeasureSpecialCharacterIndex = 0;
                            }
                            else {
                                if (valueWithSpecialCharacter.length > 1 && isNaN(parseInt(valueWithSpecialCharacter.charAt(valueWithSpecialCharacter.length - 1), 10))) {
                                    for (var iLength = valueWithSpecialCharacter.length - 1; iLength >= 0; iLength--) {
                                        if (isNaN(parseInt(valueWithSpecialCharacter.charAt(iLength), 10))) {
                                            this.primaryMeasureSpecialCharacter = valueWithSpecialCharacter.charAt(iLength) + this.primaryMeasureSpecialCharacter;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    this.primaryMeasureSpecialCharacterIndex = 1;
                                    if ("%" === this.primaryMeasureSpecialCharacter) {

                                        this.isPrimaryMeasurePercentage = true;
                                    }
                                }
                            }
                        }
                    }
                    else if (this.dataView.categorical.values[iCount].source
                        && this.dataView.categorical.values[iCount].source.roles
                        && this.dataView.categorical.values[iCount].source.roles.hasOwnProperty('SecondaryMeasure')) {
                        this.secondaryMeasureName = this.dataView.categorical.values[iCount].source.displayName;
                        this.isSecondaryMeasureSelected = true;
                        valueWithSpecialCharacter = valueFormatter.format(2, this.dataView.categorical.values[iCount].source.format);
                        valueWithSpecialCharacter = valueWithSpecialCharacter + "";
                        valueWithSpecialCharacter = valueWithSpecialCharacter.replace(/\s+/g, '');
                        if (-1 === this.secondaryMeasureSpecialCharacterIndex) {
                            if (isNaN(parseInt(valueWithSpecialCharacter.charAt(0), 10))) {
                                for (var iCounted = 0; iCounted < valueWithSpecialCharacter.indexOf("2"); iCounted++) {
                                    this.secondaryMeasureSpecialCharacter = this.secondaryMeasureSpecialCharacter + valueWithSpecialCharacter.charAt(iCounted);
                                }
                                this.secondaryMeasureSpecialCharacterIndex = 0;
                            }
                            else {
                                if (valueWithSpecialCharacter.length > 1 && isNaN(parseInt(valueWithSpecialCharacter.charAt(valueWithSpecialCharacter.length - 1), 10))) {
                                    for (var iLengths = valueWithSpecialCharacter.length - 1; iLengths >= 0; iLengths--) {
                                        if (isNaN(parseInt(valueWithSpecialCharacter.charAt(iLengths), 10))) {
                                            this.secondaryMeasureSpecialCharacter = valueWithSpecialCharacter.charAt(iLengths) + this.secondaryMeasureSpecialCharacter;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    this.secondaryMeasureSpecialCharacterIndex = 1;
                                    if ("%" === this.secondaryMeasureSpecialCharacter) {

                                        this.isSecondaryMeasurePercentage = true;
                                    }
                                }
                            }

                        }

                    }
                }
            }

            // Viewport resizing
            var viewport = options.viewport;
            this.parentViewport = viewport;
            this.root.select('.errorMessage').style({ 'display': 'none' });
            this.root.select('.donutChartGMO').style({ 'display': '' });
            var GMODonutTitleOnOffStatus: IDataLabelSettings = false
                , titleText: IDataLabelSettings = ""
                , tooltiptext: IDataLabelSettings = ""
                , titlefontsize
                , titleHeight: number
                , titlecolor: IDataLabelSettings
                , titlebgcolor: IDataLabelSettings;

            if (this.getShowTitle(this.dataView)) {
                GMODonutTitleOnOffStatus = true;
            }
            if (this.getTitleText(this.dataView)) {
                titleText = this.getTitleText(this.dataView);
            }
            if (this.getTooltipText(this.dataView)) {
                tooltiptext = this.getTooltipText(this.dataView);
            }
            titlefontsize = this.getTitleSize(this.dataView);
            if (!titlefontsize) titlefontsize = 12;
            this.titleSize = titlefontsize;
            if (GMODonutTitleOnOffStatus && (titleText || tooltiptext)) {
                titleHeight = titlefontsize;
            }
            else { titleHeight = 0; }

            if (this.getTitleFill(this.dataView)) {
                titlecolor = this.getTitleFill(this.dataView).solid.color;
            }
            if (this.getTitleBgcolor(this.dataView)) {
                titlebgcolor = this.getTitleBgcolor(this.dataView).solid.color;
                if ("none" === titlebgcolor) {
                    titlebgcolor = "#ffffff";
                }
            }
            if (!GMODonutTitleOnOffStatus) {
                this.root.select('.Title_Div_Text').style({ 'display': 'none' });
            }
            else {
                this.root.select('.Title_Div_Text').style({ 'display': 'inline-block', 'background-color': titlebgcolor, 'font-size': PixelConverter.fromPointToPixel(titlefontsize) + 'px', 'color': titlecolor });
            }

            this.root.select('.GMODonutTitleDiv')
                .text(titleText);

            this.root.select('.GMODonutTitleIcon').style({ 'display': 'none' });

            if ("" !== tooltiptext && (1 !== this.updateCount || "" !== titleText)) {
                this.root.select('.GMODonutTitleIcon')
                    .style({ 'display': 'inline-block' })
                    .attr('title', tooltiptext);
            }
            this.root.selectAll('.SummarizedDivContainer').remove();
            debug.assertValue(options, 'options');
            var dataViews = this.dataViews = options.dataViews;
            if (dataViews && dataViews.length > 0 && dataViews[0].categorical) {
                var defaultDataPointColor = undefined;
                var dataViewMetadata = this.dataViews[0].metadata;
                if (dataViewMetadata) {
                    var objects: DataViewObjects = dataViewMetadata.objects;
                    if (objects && objects.hasOwnProperty('legend')) {
                        this.data.legendObjectProperties = <DataViewObject>objects['legend'];
                        this.legendObjectProperties = <DataViewObject>objects['legend'];
                    }
                    else {
                        this.legendObjectProperties = {};
                    }
                }
                this.data = DonutChartGMO.converter(dataViews[0], this.colors, defaultDataPointColor, this.currentViewport, this.disableGeometricCulling, this.interactivityService);

                if (!(this.options.interactivity && this.options.interactivity.isInteractiveLegend)) {
                    this.renderLegend();
                }
                if (!this.dataView.categorical.categories) {
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.root.select('.donutLegend').style({ 'display': 'none' });
                }
            }

            else {
                this.data = {
                    dataPointsToDeprecate: [],
                    dataPointsToEnumerate: [],
                    dataPoints: [],
                    unCulledDataPoints: [],
                    legendData: { title: "", dataPoints: [] },
                    hasHighlights: false,
                    dataLabelsSettings: dataLabelUtils.getDefaultDonutLabelSettings(),
                };
            }
            
            this.detailLabelsTextSize = this.data.dataLabelsSettings.fontSize;

            this.detailLabelsDecimalPlaces = (this.data.dataLabelsSettings.precision === dataLabelUtils.defaultLabelPrecision) ? null : this.data.dataLabelsSettings.precision;
            if (this.detailLabelsDecimalPlaces > 20) {
                this.detailLabelsDecimalPlaces = 20;
            }
            this.detailLabelsColor = this.data.dataLabelsSettings.labelColor;
            this.detailLabelsDisplayUnits = this.data.dataLabelsSettings.displayUnits;
            
            this.detailLabelsShowSummary = this.getShowSummary(this.dataViews[0]);
            this.primaryMeasureSummaryText = this.getPrimaryMeasureSummaryText(this.dataViews[0]);

            this.initViewportDependantProperties();
            this.initDonutProperties();

            this.root.select('.SummarizedDiv').style({ 'display': 'block' });

            // Add component for displaying Error Message                
            if (!this.isPrimaryMeasureSelected) {

                var legendWidth = this.root.select('.legend').attr('width')
                    , legendStyle = this.root.select('.legend').attr('style')
                    , legendTop
                    , legendLeft
                    , arrStyleTop = legendStyle.split('top:')
                    , arrStyleLeft = legendStyle.split('left:');
                if (2 === arrStyleTop.length) {
                    legendTop = arrStyleTop[1].split('px')[0];
                }
                else {
                    legendTop = 0;
                }
                if (2 === arrStyleLeft.length) {
                    legendLeft = arrStyleLeft[1].split('px')[0];
                }
                else {
                    legendLeft = 0;
                }
                this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                this.root.select('.donutChartGMO').style({ 'display': 'none' });
                this.root.select('.legend').style({ 'display': 'none' });
                this.root.select('.donutLegend').style({ 'display': 'none' });
                this.root.select('.SummarizedDiv').style({ 'display': 'none' });
                this.root.select('.errorMessage').style({
                    'display': 'block', 'text-align': 'center'
                    , 'top': this.parentViewport.height / 2 + 'px', 'position': 'relative'
                    , 'width': '100%'
                });
                if (!!legendProperties && legendProperties['show']) {
                    var legendPosition = legendProperties.position;
                    switch (legendPosition) {
                        case 'Bottom':
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'top': parseInt(legendTop, 10) / 2 + 'px', 'width': '100%' });
                            break;
                        case 'Left':
                            this.root.select('.errorMessage').style({ 'padding': '0px 0px 0px ' + legendWidth + 'px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'Right':
                            this.root.select('.errorMessage').style({ 'padding': '0px ' + legendWidth + 'px' + ' 0px 0px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'BottomCenter':
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'top': parseInt(legendTop, 10) / 2 + 'px', 'width': '100%' });
                            break;
                        case 'LeftCenter':
                            this.root.select('.errorMessage').style({ 'padding': '0px 0px 0px ' + legendWidth + 'px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        case 'RightCenter':
                            this.root.select('.errorMessage').style({ 'padding': '0px ' + legendWidth + 'px' + ' 0px 0px', 'width': this.parentViewport.width - parseInt(legendWidth, 10) + 'px' });
                            break;
                        default:
                            this.root.select('.errorMessage').style({ 'padding': 0 + 'px', 'width': '100%' });
                            break;
                    }
                }
                return;
            }
            else {
                this.root.select('.errorMessage').style({ 'display': 'none' });

                this.updateInternal(this.data, options.suppressAnimations);
                if (undefined === this.detailLabelsShowSummary || this.detailLabelsShowSummary) {
                    if (undefined === this.detailLabelsDisplayUnits || 0 === this.detailLabelsDisplayUnits) {
                        this.detailLabelsDisplayUnits = 0;
                    }

                    var formattedPrimaryMeasureSum = "";
                    if (this.detailLabelsDecimalPlaces > 20) {
                        this.detailLabelsDecimalPlaces = 20;
                    }
                    if (this.isPrimaryMeasurePercentage) {
                        formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                        formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + "%";
                    }
                    else {
                        formattedPrimaryMeasureSum = this.format(this.data.primaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'PrimaryMeasure');
                        if (0 === this.primaryMeasureSpecialCharacterIndex) {
                            formattedPrimaryMeasureSum = this.primaryMeasureSpecialCharacter + formattedPrimaryMeasureSum;
                        }
                        else if (1 === this.primaryMeasureSpecialCharacterIndex) {
                            formattedPrimaryMeasureSum = formattedPrimaryMeasureSum + this.primaryMeasureSpecialCharacter;
                        }
                    }
                    if (undefined === this.detailLabelsTextSize) {
                        this.detailLabelsTextSize = 9;
                    }
                    var sizeInPixel = PixelConverter.fromPointToPixel(this.detailLabelsTextSize);
                    var indicatorSize = PixelConverter.fromPointToPixel(this.detailLabelsTextSize - 2);
                    this.root.select('.primaryMeasureSum').html(formattedPrimaryMeasureSum).attr('title', this.data.primaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });
                    this.root.select('.primaryMeasureIndicator').style({ 'font-size': indicatorSize + 'px', 'margin-top': '2px' });
                    this.root.select('.secondaryMeasureIndicator').style({ 'font-size': indicatorSize + 'px', 'margin-top': '2px' });
                    var formattedSecondaryMeasureSum = "";
                    if (this.isSecondaryMeasurePercentage) {
                        formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum * 100, 1, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                        formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + "%";
                    }
                    else {
                        formattedSecondaryMeasureSum = this.format(this.data.secondaryMeasureSum, this.detailLabelsDisplayUnits, this.detailLabelsDecimalPlaces, 'SecondaryMeasure');
                        if (0 === this.secondaryMeasureSpecialCharacterIndex) {
                            formattedSecondaryMeasureSum = this.secondaryMeasureSpecialCharacter + formattedSecondaryMeasureSum;
                        }
                        else if (1 === this.secondaryMeasureSpecialCharacterIndex) {
                            formattedSecondaryMeasureSum = formattedSecondaryMeasureSum + this.secondaryMeasureSpecialCharacter;
                        }
                    }
                    this.root.select('.secondaryMeasureSum').html(formattedSecondaryMeasureSum).attr('title', this.data.secondaryMeasureSum).style({ 'font-size': sizeInPixel + 'px' });
                    this.root.select('.SummarizedDiv').style({ 'display': 'block' });
                    this.root.select('.SummarizedDivContainer').style({ 'color': this.detailLabelsColor, 'font-size': sizeInPixel + 'px' });
                    if (undefined === this.primaryMeasureSummaryText) {
                        this.primaryMeasureSummaryText = "Total";
                    }
                    this.root.select('.TotalText').html(this.primaryMeasureSummaryText).style({ 'font-size': sizeInPixel + 'px' });
                    if (this.isPrimaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                        this.root.select('.TotalText').style({ 'display': 'none' });
                        this.root.select('.TotalValue').style({ 'display': 'none' });
                    }
                    else {
                        this.root.select('.TotalText').style({ 'display': 'block' });
                        this.root.select('.TotalValue').style({ 'display': 'block' });
                    }
                    if (this.isSecondaryMeasurePercentage && (this.isLegendFieldSelected || this.isDetailsFieldSelected)) {
                        this.root.select('.SecondaryText').style({ 'display': 'none' });
                        this.root.select('.SecondaryValue').style({ 'display': 'none' });
                    }
                    else {
                        this.root.select('.SecondaryText').style({ 'display': 'block' });
                        this.root.select('.SecondaryValue').style({ 'display': 'block' });
                    }
                    var pContainerDivHeight = parseFloat(this.root.select('.pContainer').style('height'));
                    var pContainerDivWidth = parseFloat(this.root.select('.pContainer').style('width'));
                    var summarizedDivHeight = parseFloat(this.root.select('.SummarizedDivContainer').style('height'));
                    
                    var formattedPrimaryMeasureSumTextProperties: powerbi.TextProperties = {
                        text: formattedPrimaryMeasureSum,
                        fontFamily: "Segoe UI",
                        fontSize: sizeInPixel+"px"
                    };
                    var formattedSecondaryMeasureSumTextProperties: powerbi.TextProperties = {
                        text: formattedSecondaryMeasureSum,
                        fontFamily: "Segoe UI",
                        fontSize: sizeInPixel+"px"
                    };
                    var formattedPrimaryMeasureSumTextPropertiesWidth = powerbi.TextMeasurementService.measureSvgTextWidth(formattedPrimaryMeasureSumTextProperties);
                    var formattedSecondaryMeasureSumTextPropertiesWidth = powerbi.TextMeasurementService.measureSvgTextWidth(formattedSecondaryMeasureSumTextProperties);
                    if(this.root.select('.primaryMeasureIndicator')[0][0] !== null){
                        if(formattedPrimaryMeasureSumTextPropertiesWidth + parseFloat(this.root.select('.primaryMeasureIndicator').style('width'))*2 > pContainerDivWidth){
                            this.root.select('.primaryMeasureIndicator').style('visibility','hidden');
                        }
                        else{
                            this.root.select('.primaryMeasureIndicator').style('visibity','visible');
                        }
                    }
                    if(this.root.select('.secondaryMeasureIndicator')[0][0] !== null){
                        if(formattedSecondaryMeasureSumTextPropertiesWidth + parseFloat(this.root.select('.secondaryMeasureIndicator').style('width'))*2 > pContainerDivWidth){
                            this.root.select('.secondaryMeasureIndicator').style('visibility','hidden');
                        }
                        else{
                            this.root.select('.secondaryMeasureIndicator').style('visibity','visible');
                        }
                    }
                    if(summarizedDivHeight < pContainerDivHeight){
                        this.root.select('.TotalText').style({ 'display': 'none' });
                        if(summarizedDivHeight < pContainerDivHeight/1.5){
                            this.root.select('.SecondaryText').style({ 'display': 'none' });
                            if(summarizedDivHeight < pContainerDivHeight/2){
                                this.root.select('.SecondaryValue').style({ 'display': 'none' });
                            }
                            else{
                                this.root.select('.SecondaryValue').style({ 'display': 'block' });
                            }
                        }
                        else{
                            this.root.select('.SecondaryText').style({ 'display': 'block' });
                        }
                    }
                    else{
                        this.root.select('.TotalText').style({ 'display': 'block' });
                    }
                }
                else {
                    this.root.select('.SummarizedDiv').style({ 'display': 'none' });
                }

                this.hasSetData = true;

                if (dataViews) {
                    var warnings = getInvalidValueWarnings(
                        dataViews,
                        false /*supportsNaN*/,
                        false /*supportsNegativeInfinity*/,
                        false /*supportsPositiveInfinity*/);

                    if (this.data.visibleGeometryCulled) {
                        warnings.unshift(new GeometryCulledWarning());
                    }

                    this.hostService.setWarnings(warnings);
                }
            }
        }
        //Get Measure value
        public measureValue(measure, measureFormat, legendObjectProperties, modelingPrecision) {
            var displayUnits, modelPrecisionValue: number = 0;
            if (legendObjectProperties && (legendObjectProperties['labelPrecision'] || legendObjectProperties['labelPrecision'] == 0)) {
                var precisionValue = legendObjectProperties['labelPrecision'];
                if (!precisionValue && precisionValue != 0) {
                    if (modelingPrecision)
                        modelPrecisionValue = modelingPrecision;
                }
                else {
                    modelPrecisionValue = precisionValue;
                }

                if (modelPrecisionValue > 20)
                    modelPrecisionValue = 20;
                if (precisionValue > 20)
                    precisionValue = 20;
            }
            else {
                if (modelingPrecision) {
                    modelPrecisionValue = modelingPrecision;
                }
                else {
                    modelPrecisionValue = 0;
                }
            }
            if (legendObjectProperties && legendObjectProperties['labelDisplayUnits']) {
                displayUnits = legendObjectProperties['labelDisplayUnits'];
            }
            else {
                displayUnits = 0;
            }

            var itemValue = valueFormatter.format(measure, measureFormat);
            var formattedValue;
            if (measureFormat && measureFormat.search('%') > 0) {
                formattedValue = itemValue;
            }
            else {
                formattedValue = DonutChartGMO.prototype.format(parseInt(measure, 10), displayUnits, modelPrecisionValue, 'sample');
                if (isNaN(parseInt(itemValue, 10)) || isNaN(parseInt(itemValue[itemValue.length - 1], 10)))
                    formattedValue = DonutChartGMO.prototype.addSpecialCharacters(formattedValue, itemValue);
            }
            return formattedValue;
        }
        public onDataChanged(options: VisualDataChangedOptions): void {
            debug.assertValue(options, 'options');

            this.update({
                dataViews: options.dataViews,
                suppressAnimations: options.suppressAnimations,
                viewport: this.currentViewport,
            });
        }

        public onResizing(viewport: IViewport): void {
            this.update({
                dataViews: this.dataViews,
                suppressAnimations: true,
                viewport: viewport,
            });
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            var dataLabelsSettings = this.data && this.data.dataLabelsSettings
                ? this.data.dataLabelsSettings
                : dataLabelUtils.getDefaultDonutLabelSettings();

            switch (options.objectName) {
                case 'legend':
                    this.enumerateLegend(enumeration);
                    break;
                case 'dataPoint':
                    this.enumerateDataPoints(enumeration);
                    break;
                case 'labels':
                    var labelSettingOptions: VisualDataLabelsSettingsOptions = {
                        enumeration: enumeration,
                        dataLabelsSettings: dataLabelsSettings,
                        show: true,
                        displayUnits: true,
                        precision: true,
                        fontSize: true,
                        labelStyle: true,
                        showSummary: this.getShowSummary(this.dataViews[0]),
                        primaryMeasureSummaryText: this.getPrimaryMeasureSummaryText(this.dataViews[0]),
                    };
                    this.enumerateDataLabels(labelSettingOptions);
                    break;
                case 'GMODonutTitle':
                    enumeration.pushInstance({
                        objectName: 'GMODonutTitle',
                        displayName: 'Donut title',
                        selector: null,
                        properties: {
                            show: this.getShowTitle(this.dataViews[0]),
                            titleText: this.getTitleText(this.dataViews[0]),
                            tooltipText: this.getTooltipText(this.dataViews[0]),
                            fill1: this.getTitleFill(this.dataViews[0]),
                            backgroundColor: this.getTitleBgcolor(this.dataViews[0]),
                            fontSize: this.getTitleSize(this.dataViews[0]),
                        }
                    });
                    break;
                // Start of Indicators
                case 'Indicators':
                    this.enumerateIndicator(enumeration, 'Indicators');
                    break;

                case 'SMIndicator':
                    this.enumerateIndicator(enumeration, 'SMIndicator');
                    break;
            }
            return enumeration.complete();
        }

        private enumerateIndicator(enumeration: ObjectEnumerationBuilder, text: string): ObjectEnumerationBuilder {
            var data = this.data;
            if (!data)
                return;
            if (text === 'Indicators') {
                this.show = this.getShowStatus(this.dataViews[0], 'show', text);
                this.PrimaryMeasure = this.getShowStatus(this.dataViews[0], 'PrimaryMeasure', text);
                if (!this.PrimaryMeasure) {
                    this.Threshold = this.getStatus(this.dataViews[0], 'Threshold', text);
                    this.Total_Threshold = this.getStatus(this.dataViews[0], 'Total_Threshold', text);
                }
                else {
                    this.Threshold = null;
                    this.Total_Threshold = null;
                }
                enumeration.pushInstance({
                    selector: null,
                    objectName: 'Indicators',
                    properties: {
                        show: this.show,
                        PrimaryMeasure: this.PrimaryMeasure,
                        Threshold: this.Threshold,
                        Total_Threshold: this.Total_Threshold
                    }
                });
            }
            else {
                this.show = this.getShowStatus(this.dataViews[0], 'show', text);
                this.SecondaryMeasure = this.getShowStatus(this.dataViews[0], 'SecondaryMeasure', text);
                if (!this.SecondaryMeasure) {
                    this.SMThreshold = this.getStatus(this.dataViews[0], 'SMThreshold', text);
                    this.SMTotalThreshold = this.getStatus(this.dataViews[0], 'SMTotalThreshold', text);
                }
                else {
                    this.SMThreshold = null;
                    this.SMTotalThreshold = null;
                }
                enumeration.pushInstance({
                    selector: null,

                    objectName: 'SMIndicator',
                    properties: {
                        show: this.show,
                        SecondaryMeasure: this.SecondaryMeasure,
                        SMThreshold: this.SMThreshold,
                        SMTotalThreshold: this.SMTotalThreshold,
                    }
                });
            }
        }
        // Gets the status of Indicators
        public getShowStatus(dataView: DataView, text: string, category: string): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty(category)) {
                    var showTitle = dataView.metadata.objects[category];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty(text)) {
                        return <IDataLabelSettings>showTitle[text];
                    }
                    else if (text === 'PrimaryMeasure' || 'SecondaryMeasure') {
                        return <IDataLabelSettings>true;
                    }
                } else {
                    return <IDataLabelSettings>false;
                }
            }
            return <IDataLabelSettings>false;
        }
        public getStatus(dataView: DataView, text: string, category: string): number {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty(category)) {
                    var showTitle = dataView.metadata.objects[category];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty(text)) {
                        return parseFloat(showTitle[text].toString());
                    }
                } else {
                    return 0;
                }
            }
            return 0;
        }
        //End of Indicators	

        private enumerateDataLabels(options: VisualDataLabelsSettingsOptions): ObjectEnumerationBuilder {
            var formattedPrimaryMeasureSum = "",
                formattedSecondaryMeasureSum = "";
              
            debug.assertValue(options, 'options');
            debug.assertValue(options.enumeration, 'enumeration');
            if (!options.dataLabelsSettings)
                return;
            var instance: VisualObjectInstance = {
                objectName: 'labels',
                selector: options.selector,
                properties: {},
            };
            if (options.show && options.selector) {
                instance.properties['showSeries'] = options.dataLabelsSettings.show;
            }
            else if (options.show) {
                instance.properties['show'] = options.dataLabelsSettings.show;
            }
            instance.properties['color'] = options.dataLabelsSettings.labelColor;
            if (options.displayUnits) {
                instance.properties['labelDisplayUnits'] = options.dataLabelsSettings.displayUnits;
            }
            if (options.precision) {
                var precision = options.dataLabelsSettings.precision;
                instance.properties['labelPrecision'] = precision === dataLabelUtils.defaultLabelPrecision ? null : precision;
            }
            if (options.position) {
                instance.properties['labelPosition'] = options.dataLabelsSettings.position;
                if (options.positionObject) {
                    debug.assert(!instance.validValues, '!instance.validValues');
                    instance.validValues = { 'labelPosition': options.positionObject };
                }
            }
            if (options.labelStyle)
                instance.properties['labelStyle'] = options.dataLabelsSettings.labelStyle;
            if (options.fontSize)
                instance.properties['fontSize'] = options.dataLabelsSettings.fontSize;
                
            if (options.labelDensity) {
                var lineChartSettings = <LineChartDataLabelsSettings>options.dataLabelsSettings;
                if (lineChartSettings)
                    instance.properties['labelDensity'] = lineChartSettings.labelDensity;
            }
            
            instance.properties['showSummary'] = this.getShowSummary(this.dataViews[0]);
            instance.properties['primaryMeasureSummaryText'] = this.getPrimaryMeasureSummaryText(this.dataViews[0]);
            //Keep show all as the last property of the instance.
            if (options.showAll)
                instance.properties['showAll'] = options.dataLabelsSettings.showLabelPerSeries;
            
            return options.enumeration.pushInstance(instance);
        }


        // This function returns the font colot selected for the title in the format window
        private getTitleFill(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fill1')) {
                        return <Fill>FTitle['fill1'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleFill, { solid: { color: '#333333' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleFill, { solid: { color: '#333333' } });
        }
        // This function returns the background color selected for the title in the format window
        private getTitleBgcolor(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('backgroundColor')) {
                        return <Fill>FTitle['backgroundColor'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleBackgroundColor, { solid: { color: 'none' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, DonutChartGMOProperties.titleBackgroundColor, { solid: { color: 'none' } });
        }
        /* This function returns the title text given for the title in the format window */
        private getTitleText(dataView: DataView): IDataLabelSettings {
            var returnTitleValues: string, returnTitleLegend: string, returnTitleDetails: string, returnTitle: string, tempTitle: string;
            returnTitleValues = "";
            returnTitleLegend = "";
            returnTitleDetails = "";
            returnTitle = "";
            tempTitle = "";
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var titletext = dataView.metadata.objects['GMODonutTitle'];
                    if (titletext && titletext.hasOwnProperty('titleText')) {
                        return <IDataLabelSettings>titletext['titleText'];
                    }
                }
            }

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values.source) {
                returnTitleDetails = dataView.categorical.values.source.displayName;
            }
            var iLength = 0;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (var iLength = 0; iLength < dataView.categorical.values.length; iLength++) {
                    if (dataView.categorical.values[iLength].source && dataView.categorical.values[iLength].source.roles.hasOwnProperty('Y')) {
                        if (dataView.categorical.values[iLength].source.displayName) {
                            returnTitleValues = dataView.categorical.values[iLength].source.displayName;
                            break;
                        }
                    }
                }
            }
            if (dataView && dataView.categorical && dataView.categorical.categories) {
                returnTitleLegend = dataView.categorical.categories[0].source.displayName;
            }

            if ("" !== returnTitleValues) {
                tempTitle = " by ";
            }
            if ("" !== returnTitleLegend && "" !== returnTitleDetails) {
                tempTitle = tempTitle + returnTitleLegend + " and " + returnTitleDetails;
            }
            else if ("" === returnTitleLegend && "" === returnTitleDetails) {
                tempTitle = "";
            }
            else {
                // means one in empty and other is non empty
                tempTitle = tempTitle + returnTitleLegend + returnTitleDetails;
            }

            returnTitle = returnTitleValues + tempTitle;
            return <IDataLabelSettings>returnTitle;
        }

        // This function is to perform KMB formatting on values.
        public format(d: number, displayunitValue: number, precisionValue: number, columnType: string) {
            var result: string;
            switch (displayunitValue) {
                case 0:
                    {
                        var prefix = d3.formatPrefix(d);
                        result = d3.round(prefix.scale(d), precisionValue).toFixed(precisionValue) + prefix.symbol.toUpperCase();
                        break;
                    }
                case 1:
                    {
                        result = this.numberWithCommas(d.toFixed(precisionValue));
                        break;
                    }
                case 1000:
                    {
                        result = this.numberWithCommas((d / 1000).toFixed(precisionValue)) + 'K';
                        break;
                    }
                case 1000000:
                    {
                        result = this.numberWithCommas((d / 1000000).toFixed(precisionValue)) + 'M';
                        break;
                    }
                case 1000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000).toFixed(precisionValue)) + 'bn';
                        break;
                    }
                case 1000000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000000).toFixed(precisionValue)) + 'T';
                        break;
                    }
            }
            return result;
        }

        public numberWithCommas(x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }
        public addSpecialCharacters(sKMBValue, title) {
            var displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length;
            //Append characters front
            if (isNaN(parseInt(title[0], 10))) {
                for (var iLoop = 0; iLoop < title.length; iLoop++) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialcharacters += title[iLoop];
                    }
                    else break;
                }
                displayValue = specialcharacters + sKMBValue;
            }
            //Append characters end
            if (isNaN(parseInt(title[title.length - 1], 10))) {
                var specialarray = [], index: number = 0;
                for (var iLoop = titlelength - 1; iLoop >= 0; iLoop--) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialarray[index] = title[iLoop];
                        index++;
                    }
                    else break;
                }
                for (var iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) {
                    specialcharacters += specialarray[iLoop];
                }
                displayValue = sKMBValue + specialcharacters;
            }

            return displayValue.trim();
        }
        // This function returns the tool tip text given for the tooltip in the format window
        private getTooltipText(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var tooltiptext = dataView.metadata.objects['GMODonutTitle'];
                    if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) {
                        return <IDataLabelSettings>tooltiptext['tooltipText'];
                    }
                } else {
                    return <IDataLabelSettings>'Your tooltip text goes here';
                }
            }
            return <IDataLabelSettings>'Your tooltip text goes here';
        }

        // This function returns on/off status of the funnel title properties
        private getShowTitle(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var showTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) {
                        return <IDataLabelSettings>showTitle['show'];
                    }
                } else {
                    return <IDataLabelSettings>true;
                }
            }
            return <IDataLabelSettings>true;
        }

        // This function returns on/off status of the Show Summary properties
        private getShowSummary(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var showTitle = dataView.metadata.objects['labels'];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('showSummary')) {
                        return <IDataLabelSettings>showTitle['showSummary'];
                    }
                } else {
                    return <IDataLabelSettings>true;
                }
            }
            return <IDataLabelSettings>true;
        }

        private getPrimaryMeasureSummaryText(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var text = dataView.metadata.objects['labels'];
                    if (dataView.metadata.objects && text.hasOwnProperty('primaryMeasureSummaryText')) {
                        return <IDataLabelSettings>text['primaryMeasureSummaryText'];
                    }
                } else {
                    return <IDataLabelSettings>"Total";
                }
            }
            return <IDataLabelSettings>"Total";
        }
        // This function returns the funnel title font size selected for the title in the format window
        private getTitleSize(dataView: DataView) {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMODonutTitle')) {
                    var FTitle = dataView.metadata.objects['GMODonutTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fontSize')) {
                        return FTitle['fontSize'];
                    }
                } else {
                    return 12;
                }
            }
            return 12;
        }
        private enumerateDataPoints(enumeration: ObjectEnumerationBuilder): void {
            var data = this.data;
            if (!data)
                return;
            var dataPoints = data.dataPointsToEnumerate;
            var dataPointsLength = dataPoints.length;

            for (var i = 0; i < dataPointsLength; i++) {
                var dataPoint = dataPoints[i];
                enumeration.pushInstance({
                    objectName: 'dataPoint',
                    displayName: dataPoint.label,
                    selector: ColorHelper.normalizeSelector(dataPoint.identity.getSelector()),
                    properties: {
                        fill: { solid: { color: dataPoint.color } }
                    },
                });
            }
        }

        private enumerateLegend(enumeration: ObjectEnumerationBuilder): ObjectEnumerationBuilder {
            if (!this.dataView.categorical.categories)
                return;
            var show = DataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.show, this.legend.isVisible());
            var showTitle = DataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.showTitle, true);
            var titleText = DataViewObject.getValue<string>(this.legendObjectProperties, legendProps.titleText, this.layerLegendData ? this.layerLegendData.title : '');
            var legendLabelColor = DataViewObject.getValue<string>(this.legendObjectProperties, legendProps.labelColor, LegendData.DefaultLegendLabelFillColor);
            this.legendLabelFontSize = DataViewObject.getValue<number>(this.legendObjectProperties, legendProps.fontSize, this.data.legendData.fontSize);
            var labelPrecision;
            if (this.getLegendDispalyUnits(this.dataView, 'labelPrecision') > 20)
                labelPrecision = 20;
            else
                labelPrecision = this.getLegendDispalyUnits(this.dataView, 'labelPrecision');
            enumeration.pushInstance({
                selector: null,
                properties: {
                    show: show,
                    position: LegendPosition[this.legend.getOrientation()],
                    showTitle: showTitle,
                    titleText: titleText,
                    labelColor: legendLabelColor,
                    fontSize: this.legendLabelFontSize,
                    detailedLegend: this.getDetailedLegend(this.dataView),
                    labelDisplayUnits: this.getLegendDispalyUnits(this.dataView, 'labelDisplayUnits'),
                    labelPrecision: labelPrecision

                },
                objectName: 'legend'
            });

        }

        public setInteractiveChosenSlice(sliceIndex: number): void {
            if (this.interactivityState.sliceAngles.length === 0) return;

            this.interactivityState.lastChosenInteractiveSliceIndex = sliceIndex;
            this.interactivityState.interactiveChosenSliceFinishedSetting = false;
            var viewport = this.currentViewport;
            var moduledIndex = sliceIndex % this.data.dataPoints.length;
            var angle = this.interactivityState.sliceAngles[moduledIndex];

            this.svg.select('g')
                .transition()
                .duration(this.chartRotationAnimationDuration)
                .ease('elastic')
                .attr('transform', SVGUtil.translateAndRotate(viewport.width / 2, viewport.height / 2, 0, 0, angle))
                .each('end', () => { this.interactivityState.interactiveChosenSliceFinishedSetting = true; });

            this.interactivityState.currentRotate = angle;
            this.interactivityState.interactiveLegend.updateLegend(moduledIndex);
            // Set the opacity of chosen slice to full and the others to semi-transparent
            this.svg.selectAll('.slice').attr('opacity', (d, index) => {
                return index === moduledIndex ? 1 : 0.6;
            });

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private calculateRadius(): number {
            var viewport = this.currentViewport;
            if (!this.isInteractive && this.data && this.data.dataLabelsSettings.show) {
                // if we have category or data labels, use a sigmoid to blend the desired denominator from 2 to 3.
                // if we are taller than we are wide, we need to use a larger denominator to leave horizontal room for the labels.
                var hw = viewport.height / viewport.width;
                var denom = 2 + (1 / (1 + Math.exp(-5 * (hw - 1))));
                return Math.min(viewport.height, viewport.width) / denom;
            }

            // no labels (isInteractive does not have labels since the interactive legend shows extra info)
            return Math.min(viewport.height, viewport.width) / 2;
        }
        private initViewportDependantProperties(duration: number = 0) {
            var titleHeight = parseInt(this.root.select('.Title_Div_Text').style('height'), 10);
            if (isNaN(titleHeight)) {
                titleHeight = 0;
            }
            if ((this.parentViewport.height - titleHeight) < 0)
                this.currentViewport.height = 0;
            else
                this.currentViewport.height = this.parentViewport.height - titleHeight;
            this.currentViewport.width = this.parentViewport.width;
            var viewport = this.currentViewport;

            if (this.isInteractive) {
                viewport.height -= DonutChart.InteractiveLegendContainerHeight; // leave space for the legend
            }
            else {
                var legendMargins = this.legend.getMargins();
                if (viewport.height - legendMargins.height < 0)
                    viewport.height = 0;
                else
                    viewport.height -= legendMargins.height;

                if (viewport.width - legendMargins.width < 0)
                    viewport.width = 0;
                else
                    viewport.width -= legendMargins.width;
            }

            this.svg.attr({
                'width': viewport.width,
                'height': viewport.height
            });

            if (this.isInteractive) {
                this.legendContainer
                    .style({
                        'width': '100%',
                        'height': DonutChart.InteractiveLegendContainerHeight + 'px',
                        'overflow': 'hidden',
                        'top': 0
                    });
                this.svg
                    .style('top', DonutChart.InteractiveLegendContainerHeight);
            } else {
                Legend.positionChartArea(this.svg, this.legend);
            }

            this.previousRadius = this.radius;
            var radius = this.radius = this.calculateRadius();
            var halfViewportWidth = this.halfViewPortWidth = viewport.width / 2;
            var halfViewportHeight = this.halfViewPortHeight = viewport.height / 2;

            this.arc = d3.svg.arc();

            this.outerArc = d3.svg.arc()
                .innerRadius(radius * DonutChartGMO.OuterArcRadiusRatio)
                .outerRadius(radius * DonutChartGMO.OuterArcRadiusRatio);

            if (this.isInteractive) {
                this.mainGraphicsContext.attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
                this.labelGraphicsContext.attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
            } else {
                this.mainGraphicsContext.transition().duration(duration).attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
                this.labelGraphicsContext.transition().duration(duration).attr('transform', SVGUtil.translate(halfViewportWidth, halfViewportHeight));
            }

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private initDonutProperties() {
            this.donutProperties = {
                viewport: this.currentViewport,
                radius: this.radius,
                arc: this.arc.innerRadius(0).outerRadius(this.radius * DonutChartGMO.InnerArcRadiusRatio),
                outerArc: this.outerArc,
                innerArcRadiusRatio: DonutChartGMO.InnerArcRadiusRatio,
                outerArcRadiusRatio: DonutChartGMO.OuterArcRadiusRatio,
                dataLabelsSettings: this.data.dataLabelsSettings,
            };
        }

        private mergeDatasets(first: any[], second: any[]): any[] {
            var secondSet = d3.set();
            second.forEach((d) => {
                secondSet.add(d.identity ? d.identity.getKey() : d.data.identity.getKey());
            });

            var onlyFirst = first.filter((d) => {
                return !secondSet.has(d.identity ? d.identity.getKey() : d.data.identity.getKey());
            }).map((d) => {
                    var derived = Prototype.inherit(d);
                    derived.percentage === undefined ? derived.data.percentage = 0 : derived.percentage = 0;
                    return derived;
                });
            return d3.merge([second, onlyFirst]);
        }

        private updateInternal(data: DonutDataGMO, suppressAnimations: boolean, duration: number = 0) {
            var viewport = this.currentViewport;
            if (this.tooltipsEnabled === void 0) {
                this.tooltipsEnabled = true;
            }
            duration = duration || AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
            if (true) {
                var layout = DonutChartGMO.getLayout(this.radius, this.sliceWidthRatio, viewport, data.dataLabelsSettings);
                var result: DonutChartAnimationResult;
                var shapes: D3.UpdateSelection;
                var highlightShapes: D3.UpdateSelection;
                var labelSettings = data.dataLabelsSettings;
                var labels: Label[] = [];
                if (labelSettings && labelSettings.show) {
                    labels = this.createLabels();
                }
                if (!suppressAnimations) {
                    var animationOptions: DonutChartAnimationOptions = {
                        viewModel: data,
                        colors: this.colors,
                        graphicsContext: this.mainGraphicsContext,
                        labelGraphicsContext: this.labelGraphicsContext,
                        interactivityService: this.interactivityService,
                        layout: layout,
                        radius: this.radius,
                        sliceWidthRatio: this.sliceWidthRatio,
                        viewport: viewport,
                        labels: labels,
                        innerArcRadiusRatio: DonutChartGMO.InnerArcRadiusRatio,
                    };
                }
                if (true) {
                    shapes = DonutChartGMO.drawDefaultShapes(this.svg, data, layout, this.colors, this.radius, this.interactivityService && this.interactivityService.hasSelection(), this.sliceWidthRatio, this.data.defaultDataPointColor);
                    highlightShapes = DonutChartGMO.drawDefaultHighlightShapes(this.svg, data, layout, this.colors, this.radius, this.sliceWidthRatio);
                    NewDataLabelUtils.drawDefaultLabels(this.labelGraphicsContext, labels, false, true);
                    NewDataLabelUtils.drawLabelLeaderLines(this.labelGraphicsContext, labels);
                }
                this.assignInteractions(shapes, highlightShapes, data);
                if (this.tooltipsEnabled) {
                    TooltipManager.addTooltip(shapes, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                    TooltipManager.addTooltip(highlightShapes, (tooltipEvent: TooltipEvent) => tooltipEvent.data.data.tooltipInfo);
                }
                this.updateInternalToMove(data, duration);
            }
            else {
                this.updateInternalToMove(data, duration);
            }

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
        }

        private createLabels(): Label[] {
            var labelLayout = new DonutLabelLayout({
                maximumOffset: NewDataLabelUtils.maxLabelOffset,
                startingOffset: NewDataLabelUtils.startingLabelOffset
            }, this.donutProperties);

            var labelDataPoints: DonutLabelDataPoint[] = this.createLabelDataPoints();

            return labelLayout.layout(labelDataPoints);
        }

        private createLabelDataPoints(): DonutLabelDataPoint[] {
            var data = this.data;
            var labelDataPoints: DonutLabelDataPoint[] = [];
            var measureFormatterCache = dataLabelUtils.createColumnFormatterCacheManager();
            var alternativeScale: number = null;
            if (data.dataLabelsSettings.displayUnits === 0)
                alternativeScale = <number>d3.max(data.dataPoints, d => Math.abs(d.data.measure));

            for (var i = 0; i < this.data.dataPoints.length; i++) {
                var label = this.createLabelDataPoint(data.dataPoints[i], alternativeScale, measureFormatterCache);
                labelDataPoints.push(label);
            }
            return labelDataPoints;
        }

        private getTextSize(text: string, fontSize: number): ISize {
            var properties = {
                text: text,
                fontFamily: NewDataLabelUtils.LabelTextProperties.fontFamily,
                fontSize: PixelConverter.fromPoint(fontSize),
                fontWeight: NewDataLabelUtils.LabelTextProperties.fontWeight,
            };
            return {
                width: TextMeasurementService.measureSvgTextWidth(properties),
                height: TextMeasurementService.estimateSvgTextHeight(properties),
            };
        }

        private createLabelDataPoint(d: DonutArcDescriptor, alternativeScale: number, measureFormatterCache: IColumnFormatterCacheManager): DonutLabelDataPoint {
            var labelPoint = this.outerArc.centroid(d);
            var labelX = DonutLabelUtils.getXPositionForDonutLabel(labelPoint[0]);
            var labelY = labelPoint[1];
            var labelSettings = this.data.dataLabelsSettings;
            var measureFormatter = measureFormatterCache.getOrCreate(d.data.labelFormatString, labelSettings, alternativeScale);

            var position = labelX < 0 ? 4 : 8;//Left and right values from NewLabelDataPosition
            var pointPosition: LabelParentPoint = {
                point: {
                    x: labelX,
                    y: labelY,
                },
                validPositions: [position],
                radius: 0,
            };

            var outsideFill = labelSettings.labelColor ? labelSettings.labelColor : NewDataLabelUtils.defaultLabelColor;

            var dataLabel: string;
            var dataLabelSize: ISize;
            var categoryLabel: string;
            var categoryLabelSize: ISize;
            var textSize: ISize;
            var labelSettingsStyle = labelSettings.labelStyle;
            var fontSize = labelSettings.fontSize;

            if (labelSettingsStyle === labelStyle.both || labelSettingsStyle === labelStyle.data) {
                dataLabel = measureFormatter.format(d.data.measure);
                dataLabelSize = this.getTextSize(dataLabel, fontSize);
            }
            if (labelSettingsStyle === labelStyle.both || labelSettingsStyle === labelStyle.category) {
                categoryLabel = d.data.label;
                categoryLabelSize = this.getTextSize(categoryLabel, fontSize);
            }
            switch (labelSettingsStyle) {
                case labelStyle.both:
                    var text = categoryLabel + " (" + dataLabel + ")";
                    textSize = this.getTextSize(text, fontSize);
                    break;
                case labelStyle.category:
                    textSize = _.clone(categoryLabelSize);
                    break;
                case labelStyle.data:
                    textSize = _.clone(dataLabelSize);
                    break;
            }
            var leaderLinePoints = DonutLabelUtils.getLabelLeaderLineForDonutChart(d, this.donutProperties, pointPosition.point);
            var leaderLinesSize: ISize[] = DonutLabelUtils.getLabelLeaderLinesSizeForDonutChart(leaderLinePoints);
            return {
                isPreferred: true,
                text: "",
                textSize: textSize,
                outsideFill: outsideFill,
                fontSize: fontSize,
                identity: d.data.identity,
                parentShape: pointPosition,
                insideFill: NewDataLabelUtils.defaultInsideLabelColor,
                parentType: 0,//Point Tag
                alternativeScale: alternativeScale,
                donutArcDescriptor: d,
                angle: (d.startAngle + d.endAngle) / 2 - (Math.PI / 2),
                dataLabel: dataLabel,
                dataLabelSize: dataLabelSize,
                categoryLabel: categoryLabel,
                categoryLabelSize: categoryLabelSize,
                leaderLinePoints: leaderLinePoints,
                linesSize: leaderLinesSize,
            };
        }
        private renderLegend(): void {

            var legendData: LegendData = { title: "", dataPoints: [] };
            var legend: IGMOLegend = this.legend;

            this.layerLegendData = this.data.legendData;
            if (this.layerLegendData) {
                legendData.title = this.layerLegendData.title || "";
                legendData['primaryTitle'] = this.layerLegendData['primaryTitle'] || "";
                legendData['secondaryTitle'] = this.layerLegendData['secondaryTitle'] || "";
                legendData.labelColor = this.layerLegendData.labelColor;
                legendData.dataPoints = legendData.dataPoints.concat(this.layerLegendData.dataPoints || []);
                legendData.fontSize = this.legendLabelFontSize ? this.legendLabelFontSize : DonutChartGMO.LegendLabelFontSizeDefault;
                if (this.layerLegendData.grouped) {
                    legendData.grouped = true;
                }
            }
            var legendProperties = this.legendObjectProperties;
            if (legendProperties) {
                LegendData.update(legendData, legendProperties);
                var position = <string>legendProperties[legendProps.position];
                var titlevisible = <string>legendProperties['titleText'];
                if (titlevisible || titlevisible === undefined) {
                    legendData['primaryTitle'] = this.layerLegendData['primaryTitle'] || "";
                    legendData['secondaryTitle'] = this.layerLegendData['secondaryTitle'] || "";
                }
                else {
                    legendData.title = "";
                    legendData['primaryTitle'] = "";
                    legendData['secondaryTitle'] = "";
                }
                if (position)
                    legend.changeOrientation(LegendPosition[position]);
            }
            else {
                legend.changeOrientation(LegendPosition.Top);
            }

            if ((legendData.dataPoints.length === 1 && !legendData.grouped) || this.hideLegends()) {
                legendData.dataPoints = [];
            }
            legend.drawLegendInternal(legendData, this.parentViewport, true, this.legendObjectProperties['detailedLegend'] /* perform auto width */);
            Legend.positionChartArea(this.svg, legend);
        }

        private hideLegends(): boolean {
            if (this.cartesianSmallViewPortProperties) {
                if (this.cartesianSmallViewPortProperties.hideLegendOnSmallViewPort && (this.viewport.height < this.cartesianSmallViewPortProperties.MinHeightLegendVisible)) {
                    return true;
                }
            }
            return false;
        }
        // ts end
        private calculateSliceAngles(): void {
            var angles: number[] = [];
            var data = this.data.dataPoints;

            if (data.length === 0) {
                this.interactivityState.valueToAngleFactor = 0;
                this.interactivityState.sliceAngles = [];
                return;
            }

            var sum = 0;
            for (var i = 0, ilen = data.length; i < ilen; i++) {
                sum += data[i].data.percentage; // value is an absolute number
            }
            debug.assert(sum !== 0, 'sum of slices values cannot be zero');
            this.interactivityState.valueToAngleFactor = 360 / sum; // Calculate the ratio between 360 and the sum to know the angles to rotate by

            var currentAngle = 0;
            for (var i = 0, ilen = data.length; i < ilen; i++) {
                var relativeAngle = data[i].data.percentage * this.interactivityState.valueToAngleFactor;
                currentAngle += relativeAngle;
                angles.push((relativeAngle / 2) - currentAngle);
            }

            this.interactivityState.sliceAngles = angles;
        }
        private assignInteractions(slices: D3.Selection, highlightSlices: D3.Selection, data: DonutDataGMO): void {
            // assign interactions according to chart interactivity type
            if (this.isInteractive) {
                this.assignInteractiveChartInteractions(slices);
            }
            else if (this.interactivityService) {
                var dataPoints = data.dataPoints.map((value: DonutArcDescriptor) => value.data);
                var behaviorOptions: DonutBehaviorOptions = {
                    clearCatcher: this.clearCatcher,
                    slices: slices,
                    highlightSlices: highlightSlices,
                    allowDrilldown: this.allowDrilldown,
                    visual: this,
                    hasHighlights: data.hasHighlights,
                    svg: this.svg
                };
                if (this.behavior)
                    this.interactivityService.bind(dataPoints, this.behavior, behaviorOptions);
            }
        }

        public setDrilldown(selection?: DonutDataPoint): void {
            if (selection) {
                var d3PieLayout = d3.layout.pie()
                    .sort(null)
                    .value((d: DonutDataPoint) => {
                        return d.percentage;

                    });
                // Drill into the current selection.
                var legendDataPoints: LegendDataPoint[] = [{ label: selection.label, color: selection.color, icon: LegendIcon.Circle, identity: selection.identity, selected: selection.selected }];
                var legendData: LegendData = { title: "", dataPoints: legendDataPoints };
                var drilledDataPoints = d3PieLayout(selection.internalDataPoints);
                this.updateInternal({
                    dataPointsToDeprecate: selection.internalDataPoints,
                    dataPoints: drilledDataPoints,
                    unCulledDataPoints: drilledDataPoints.map((value) => value.data),
                    legendData: legendData,
                    hasHighlights: false,
                    dataLabelsSettings: this.data.dataLabelsSettings,
                }, false /* suppressAnimations */, DonutChartGMO.DrillDownAnimationDuration);
            } else {
                // Pop out of drill down to view the "outer" data.
                this.updateInternal(this.data, false /* suppressAnimations */, DonutChartGMO.DrillDownAnimationDuration);
            }
        }

        private assignInteractiveChartInteractions(slice: D3.Selection) {
            var svg = this.svg;
            this.interactivityState.interactiveChosenSliceFinishedSetting = true;
            var svgRect = svg.node().getBoundingClientRect();
            this.interactivityState.donutCenter = { x: svgRect.left + svgRect.width / 2, y: svgRect.top + svgRect.height / 2 }; // Center of the donut chart
            this.interactivityState.totalDragAngleDifference = 0;
            this.interactivityState.currentRotate = 0;
            this.calculateSliceAngles();
            // Set the on click method for the slices so thsete pie chart will turn according to each slice's corresponding angle [the angle its on top]
            slice.on('click', (d: DonutArcDescriptor, clickedIndex: number) => {
                if (d3.event.defaultPrevented) return; // click was suppressed, for example from drag event
                this.setInteractiveChosenSlice(clickedIndex);
            });

            // Set the drag events
            var drag = d3.behavior.drag()
                .origin(Object)
                .on('dragstart', () => this.interactiveDragStart())
                .on('drag', () => this.interactiveDragMove())
                .on('dragend', () => this.interactiveDragEnd());
            svg
                .style('touch-action', 'none')
                .call(drag);
        }

        /**
         * Get the angle (in degrees) of the drag event coordinates.
         * The angle is calculated against the plane of the center of the donut
         * (meaning, when the center of the donut is at (0,0) coordinates).
         */
        private getAngleFromDragEvent(): number {
            var interactivityState = this.interactivityState;

            // get pageX and pageY (coordinates of the drag event) according to event type
            var pageX, pageY;
            var sourceEvent = <any>d3.event.sourceEvent;
            // check if that's a touch event or not
            if (sourceEvent.type.toLowerCase().indexOf('touch') !== -1) {
                if (sourceEvent.touches.length !== 1) return null; // in case there isn't a single touch - return null and do nothing.
                // take the first, single, touch surface.
                var touch = sourceEvent.touches[0];
                pageX = touch.pageX;
                pageY = touch.pageY;
            } else {
                pageX = sourceEvent.pageX;
                pageY = sourceEvent.pageY;
            }

            // Adjust the coordinates, putting the donut center as the (0,0) coordinates
            var adjustedCoordinates = { x: pageX - interactivityState.donutCenter.x, y: -pageY + interactivityState.donutCenter.y };
            // Move to polar axis - take only the angle (theta), and convert to degrees
            var angvaroThePlane = Math.atan2(adjustedCoordinates.y, adjustedCoordinates.x) * 180 / Math.PI;
            return angvaroThePlane;
        }

        private interactiveDragStart(): void {
            this.interactivityState.totalDragAngleDifference = 0;
            this.interactivityState.previousDragAngle = this.getAngleFromDragEvent();
        }

        private interactiveDragMove(): void {
            var data = this.data.dataPoints;
            var viewport = this.currentViewport;
            var interactivityState = this.interactivityState;
            if (interactivityState.interactiveChosenSliceFinishedSetting === true) {
                // get current angle from the drag event
                var currentDragAngle = this.getAngleFromDragEvent();
                if (!currentDragAngle) return; // if no angle was returned, do nothing
                // compare it to the previous drag event angle
                var angleDragDiff = interactivityState.previousDragAngle - currentDragAngle;

                interactivityState.totalDragAngleDifference += angleDragDiff;
                interactivityState.previousDragAngle = currentDragAngle;

                // Rotate the chart by the difference in angles
                interactivityState.currentRotate += angleDragDiff;

                // Rotate the chart to the current rotate angle
                this.svg.select('g')
                    .attr('transform', SVGUtil.translateAndRotate(viewport.width / 2, viewport.height / 2, 0, 0, this.interactivityState.currentRotate));

                var currentHigherLimit = data[0].data.percentage * interactivityState.valueToAngleFactor;
                var currentAngle = interactivityState.currentRotate <= 0 ? (interactivityState.currentRotate * -1) % 360 : (360 - (interactivityState.currentRotate % 360));

                interactivityState.currentIndexDrag = 0;
                //consider making this  ++interactivityState.currentIndexDrag ? then you don't need the if statement, the interactivityState.currentIndexDrag +1 and interactivityState.currentIndexDrag++
                // Check the current index according to the angle 
                var dataLength = data.length;
                while ((interactivityState.currentIndexDrag < dataLength) && (currentAngle > currentHigherLimit)) {
                    if (interactivityState.currentIndexDrag < (dataLength - 1)) {
                        currentHigherLimit += (data[interactivityState.currentIndexDrag + 1].data.percentage * interactivityState.valueToAngleFactor);
                    }
                    interactivityState.currentIndexDrag++;
                }

                // If the index changed update the legend and opacity
                if (interactivityState.currentIndexDrag !== interactivityState.previousIndexDrag) {
                    interactivityState.interactiveLegend.updateLegend(interactivityState.currentIndexDrag);
                    // set the opacticity of the top slice to full and the others to semi-transparent
                    this.svg.selectAll('.slice').attr('opacity', (d, index) => {
                        return index === interactivityState.currentIndexDrag ? DonutChartGMO.OpaqueOpacity : DonutChartGMO.SemiTransparentOpacity;
                    });
                    interactivityState.previousIndexDrag = interactivityState.currentIndexDrag;
                }
            }
        }

        private interactiveDragEnd(): void {
            // If totalDragDifference was changed, means we have a drag event (compared to a click event)
            if (this.interactivityState.totalDragAngleDifference !== 0) {
                this.setInteractiveChosenSlice(this.interactivityState.currentIndexDrag);
                // drag happened - disable click event
                d3.event.sourceEvent.stopPropagation();
            }
        }

        private updateInternalToMove(data: DonutDataGMO, duration: number = 0) {
            var radius = this.radius;
            var previousRadius = this.previousRadius;
            var sliceWidthRatio = this.sliceWidthRatio;
            var innerRadius = radius * sliceWidthRatio;


            var titleHeight = parseInt(this.root.select('.Title_Div_Text').style('height'), 10);
            if (isNaN(titleHeight)) {
                titleHeight = 0;
            }

            var legendWidth = this.legend.getMargins().width;
            var legendHeight = this.legend.getMargins().height;
            if (this.getShowTitle(this.dataView)) {
                if (!this.legendObjectProperties) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight + parseInt(legendHeight.toString(), 10);
                }
                else if ((this.legendObjectProperties['show']) && (this.legendObjectProperties['position'] === 'Top' || this.legendObjectProperties['position'] === 'TopCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight + parseInt(legendHeight.toString(), 10);
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Bottom' || this.legendObjectProperties['position'] === 'BottomCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2) + legendWidth; //+ parseInt(this.customLegendWidth, 10);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }

                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2); // - parseInt(this.customLegendWidth,10);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
                else {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
            }
            else {
                if (!this.legendObjectProperties) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight + parseInt(legendHeight.toString(), 10);
                }
                else if ((this.legendObjectProperties['show']) && (this.legendObjectProperties['position'] === 'Top' || this.legendObjectProperties['position'] === 'TopCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight + parseInt(legendHeight.toString(), 10);
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Bottom' || this.legendObjectProperties['position'] === 'BottomCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2) + legendWidth;//parseInt(this.customLegendWidth, 10);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2); // - parseInt(this.customLegendWidth,10);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
                else {
                    var x = this.halfViewPortWidth - (innerRadius / Math.SQRT2);
                    var y = this.halfViewPortHeight - (innerRadius / Math.SQRT2) + titleHeight;
                }
            }
            var width = (innerRadius * Math.SQRT2);
            var height = (innerRadius * Math.SQRT2);
            if (this.currentViewport.width > 150 && this.currentViewport.height > 100) {
                this.root.select('.SummarizedDiv')
                    .append('div').style({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': y + 'px',
                        'left': x + 'px',
                        // 'background-color':'gray',
                        'position': 'absolute',
                        'overflow': 'hidden',
                    }).classed('SummarizedDivContainer', true);

                this.root.select('.SummarizedDivContainer')
                    .append('div')
                    .classed('pContainer', true)
                    .style({
                        'position': 'absolute',
                        'top': '50%',
                        'transform': 'translate(0, -50%)',
                        'width': '100%',
                    });

                if (this.isPrimaryMeasureSelected) {
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('TotalText', true)
                        .text('Total')
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('TotalValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    if (this.getShowStatus(this.dataViews[0], 'show', 'Indicators')) {
                        if (this.getShowStatus(this.dataViews[0], 'PrimaryMeasure', 'Indicators'))
                            var threshold_Value = 0;

                        else {
                            threshold_Value = this.getStatus(this.dataViews[0], 'Total_Threshold', 'Indicators');
                            if (this.isPrimaryMeasurePercentage)
                                threshold_Value = threshold_Value / 100;
                        }
                        if (threshold_Value <= this.data.primaryMeasureSum) {
                            this.root.select('.TotalValue')
                                .html('<div class = "primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.primaryMeasureSum + '</div><span class="primaryMeasureIndicator" style="width=15%;                                                    position:absolute;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        }
                        else {
                            this.root.select('.TotalValue')
                                .html('<div class="primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.primaryMeasureSum + '</div><span class = "primaryMeasureIndicator" style="width=15%;                                                     position:absolute;float:left; color:red;margin-left:2px;">&#9650;</span>');
                        }

                    }
                    else {
                        this.root.select('.TotalValue')
                            .html('<div class="primaryMeasureSum" title = "' + this.data.primaryMeasureSum + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + this.data.primaryMeasureSum);
                    }
                }
                if (this.isSecondaryMeasureSelected) {
                    this.root.select('.pContainer')
                        .append('p')
                        .classed('SecondaryText', true)
                        .text(this.secondaryMeasureName)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    this.root.select('.pContainer')
                        .append('p')
                        .classed('SecondaryValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    if (this.getShowStatus(this.dataViews[0], 'show', 'SMIndicator')) {
                        if (this.getShowStatus(this.dataViews[0], 'SecondaryMeasure', 'SMIndicator'))
                            var threshold_Value = 0;

                        else {
                            threshold_Value = this.getStatus(this.dataViews[0], 'SMTotalThreshold', 'SMIndicator');
                            if (this.isSecondaryMeasurePercentage)
                                threshold_Value = threshold_Value / 100;
                        }
                        if (threshold_Value <= this.data.secondaryMeasureSum) {
                            this.root.select('.SecondaryValue')
                                .html('<div class = "secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.secondaryMeasureSum + '</div><span class="secondaryMeasureIndicator"                                        style="width=15%; position:absolute;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        }
                        else {
                            this.root.select('.SecondaryValue')
                                .html('<div class="secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="max-width:80%; text-overflow: ellipsis;overflow: hidden; display: inline-block">' + this.data.secondaryMeasureSum + '</div><span class = "secondaryMeasureIndicator"                                        style="width=15%; position:absolute;float:left; color:red;margin-left:2px;">&#9650;</span>');
                        }
                    }
                    else {
                        this.root.select('.SecondaryValue')
                            .html('<div class="secondaryMeasureSum" title = "' + this.data.secondaryMeasureSum + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + this.data.secondaryMeasureSum + '</div>');
                    }
                }
            }

            SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
            if (this.isInteractive) {
                this.setInteractiveChosenSlice(this.interactivityState.lastChosenInteractiveSliceIndex ? this.interactivityState.lastChosenInteractiveSliceIndex : 0);
            }
        }

        public static drawDefaultShapes(graphicsContext: D3.Selection, donutData: DonutDataGMO, layout: DonutLayout, colors: IDataColorPalette, radius: number, hasSelection: boolean, sliceWidthRatio: number, defaultColor?: string): D3.UpdateSelection {
            var shapes = graphicsContext.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceClass.selector)
                .data(donutData.dataPoints, (d: DonutArcDescriptor) => d.data.identity.getKey());

            shapes.enter()
                .insert('path')
                .classed(DonutChartGMO.sliceClass.class, true);

            DonutChart.isSingleColor(donutData.dataPoints);

            shapes
                .style('fill', (d: DonutArcDescriptor) => d.data.color)
                .style('fill-opacity', (d: DonutArcDescriptor) => ColumnUtil.getFillOpacity(d.data.selected, false, hasSelection, donutData.hasHighlights))
                .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio))
                .style('stroke-width', (d: DonutArcDescriptor) => d.data.strokeWidth)
                .attr(layout.shapeLayout);

            shapes.exit()
                .remove();

            return shapes;
        }

        public static drawDefaultHighlightShapes(graphicsContext: D3.Selection, donutData: DonutDataGMO, layout: DonutLayout, colors: IDataColorPalette, radius: number, sliceWidthRatio: number): D3.UpdateSelection {
            var shapes = graphicsContext.select('.slices')
                .selectAll('path' + DonutChartGMO.sliceHighlightClass.selector)
                .data(donutData.dataPoints.filter((value: DonutArcDescriptor) => value.data.highlightRatio != null), (d: DonutArcDescriptor) => d.data.identity.getKey());

            shapes.enter()
                .insert('path')
                .classed(DonutChartGMO.sliceHighlightClass.class, true)
                .each(function (d) { this._current = d; });

            DonutChart.isSingleColor(donutData.dataPoints);

            shapes
                .style('fill', (d: DonutArcDescriptor) => d.data.color)
                .style('fill-opacity', (d: DonutArcDescriptor) => ColumnUtil.getFillOpacity(d.data.selected, true, false, donutData.hasHighlights))
                .style('stroke', 'white')
                .style('stroke-dasharray', (d: DonutArcDescriptor) => DonutChart.drawStrokeForDonutChart(radius, DonutChartGMO.InnerArcRadiusRatio, d, sliceWidthRatio, d.data.highlightRatio))
                .style('stroke-width', (d: DonutArcDescriptor) => d.data.highlightRatio === 0 ? 0 : d.data.strokeWidth)
                .attr(layout.highlightShapeLayout);

            shapes.exit()
                .remove();

            return shapes;
        }

        /**
            Set true to the last data point when all slices have the same color
        */
        public static isSingleColor(dataPoints: DonutArcDescriptor[]): void {
            if (dataPoints.length > 1) {
                var lastPoint = dataPoints.length - 1;
                dataPoints[lastPoint].data.isLastInDonut = dataPoints[lastPoint].data.color === dataPoints[0].data.color;
            }
        }

        public static drawStrokeForDonutChart(radius: number, innerArcRadiusRatio: number, d: DonutArcDescriptor, sliceWidthRatio: number, highlightRatio: number = 1): string {
            var sliceRadius = radius * innerArcRadiusRatio * highlightRatio;
            var sliceArc = (d.endAngle - d.startAngle) * sliceRadius;
            var sectionWithoutStroke: number;
            var sectionWithStroke: number;

            /*Donut chart*/
            if (sliceWidthRatio) {
                var innerRadius = radius * sliceWidthRatio;
                var outerRadius = highlightRatio * radius * (DonutChartGMO.InnerArcRadiusRatio - sliceWidthRatio);
                var innerSliceArc = (d.endAngle - d.startAngle) * innerRadius;
                if (d.data.highlightRatio)
                    sliceArc = (d.endAngle - d.startAngle) * (outerRadius + innerRadius);

                if (d.data.isLastInDonut) {
                    //if all slices have the same color, the stroke of the last slice needs to be drawn on both radiuses
                    return 0 + " " + sliceArc + " " + outerRadius + " " + innerSliceArc + " " + outerRadius;
                }
                sectionWithoutStroke = sliceArc + outerRadius + innerSliceArc;
                sectionWithStroke = outerRadius;
            }

            /*Pie Chart*/
            else {
                if (d.data.isLastInDonut) {
                    //if all slices have the same color, the stroke of the last slice needs to be drawn on both radiuses
                    sectionWithoutStroke = sliceArc;
                    sectionWithStroke = sliceRadius * 2;
                }
                else {
                    sectionWithoutStroke = sliceArc + sliceRadius;
                    sectionWithStroke = sliceRadius;
                }
            }

            return 0 + " " + sectionWithoutStroke + " " + sectionWithStroke;
        }

        public onClearSelection() {
            if (this.interactivityService)
                this.interactivityService.clearSelection();
        }

        public static getLayout(radius: number, sliceWidthRatio: number, viewport: IViewport, labelSettings: VisualDataLabelsSettings): DonutLayout {
            var innerRadius = radius * sliceWidthRatio;
            var arc = d3.svg.arc().innerRadius(innerRadius);
            var arcWithRadius = arc.outerRadius(radius * DonutChartGMO.InnerArcRadiusRatio);
            var fontSize = PixelConverter.fromPoint(labelSettings.fontSize);
            return {
                fontSize: fontSize,
                shapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        return arcWithRadius(d);
                    }
                },
                highlightShapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        var highlightArc = arc.outerRadius(DonutChartGMO.getHighlightRadius(radius, sliceWidthRatio, d.data.highlightRatio));
                        return highlightArc(d);
                    }
                },
                zeroShapeLayout: {
                    d: (d: DonutArcDescriptor) => {
                        var zeroWithZeroRadius = arc.outerRadius(innerRadius || DonutChart.EffectiveZeroValue);
                        return zeroWithZeroRadius(d);
                    }
                },
            };
        }

        private static getHighlightRadius(radius: number, sliceWidthRatio: number, highlightRatio: number): number {
            var innerRadius = radius * sliceWidthRatio;
            return innerRadius + highlightRatio * radius * (DonutChartGMO.InnerArcRadiusRatio - sliceWidthRatio);
        }

        public static cullDataByViewport(dataPoints: DonutDataPoint[], maxValue: number, viewport: IViewport): DonutDataPoint[] {
            var estimatedRadius = Math.min(viewport.width, viewport.height) / 2;
            // Ratio of slice too small to show (invisible) = invisbleArcLength / circumference
            var cullRatio = this.invisibleArcLengthInPixels / (estimatedRadius * DonutChartGMO.twoPi);
            var cullableValue = cullRatio * maxValue;
            var culledDataPoints: DonutDataPoint[] = [];
            var prevPointColor: string;
            for (var datapoint in dataPoints) {
                if (datapoint.measure >= cullableValue) {
                    //updates the stroke width
                    datapoint.strokeWidth = prevPointColor === datapoint.color ? 1 : 0;
                    prevPointColor = datapoint.color;
                    culledDataPoints.push(datapoint);
                }
            }

            return culledDataPoints;
        }
        private getDetailedLegend(dataView: DataView) {
            var property: any = [], displayOption: string = 'None';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) {
                    property = dataView.metadata.objects['legend'];
                    if (property && property.hasOwnProperty('detailedLegend')) {
                        displayOption = property['detailedLegend'];
                    }
                }
            }
            return displayOption;
        }
        public getLegendDispalyUnits(dataView: DataView, propertyName: string) {
            var property: any = [], displayOption;
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) {
                    property = dataView.metadata.objects['legend'];
                    if (property && property.hasOwnProperty(propertyName)) {
                        displayOption = property[propertyName];
                    }
                    else if (propertyName === 'labelDisplayUnits')
                        displayOption = 0;
                }
                else if (propertyName === 'labelDisplayUnits')
                    displayOption = 0;
            } else if (propertyName === 'labelDisplayUnits')
                displayOption = 0;
            return displayOption;
        }
    }
}