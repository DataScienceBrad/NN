    module powerbi.extensibility.visual {
        import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
        import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
        import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
        import Polygon = powerbi.extensibility.utils.svg.shapes.IPolygon;
        import EnumExtensions = powerbi.extensibility.utils.type.EnumExtensions;

        import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
        import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
        import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
        import appendClearCatcher = powerbi.extensibility.utils.interactivity.appendClearCatcher;
        import SVGLegend = powerbi.extensibility.utils.chart.legend.SVGLegend;
        import Prototype = powerbi.extensibility.utils.type.Prototype;
        import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
        import LegendBehavior = powerbi.extensibility.utils.chart.legend.LegendBehavior;
        import LegendBehaviorOptions = powerbi.extensibility.utils.chart.legend.LegendBehaviorOptions;
        import SVGUtil = powerbi.extensibility.utils.svg;
        import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
        import AxisHelper = powerbi.extensibility.utils.chart.axis;
        import IAxisProperties = powerbi.extensibility.utils.chart.axis.IAxisProperties;
        import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
        import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
        import IDataLabelSettings = powerbi.extensibility.utils.chart.dataLabel.IDataLabelSettings;
        import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
        import DataViewObject = powerbi.extensibility.utils.dataview.DataViewObject;
        

        export interface IGMOLegend {
            getMargins(): IViewport;
            isVisible(): boolean;
            changeOrientation(orientation: LegendPosition): void;
            getOrientation(): LegendPosition;
            drawLegend(data: LegendData, viewport: IViewport);
            drawLegendInternal(data: LegendData, viewport: IViewport, width: boolean, detailedLegend: any);
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
            private maxLegendTextLength;
            private orientation: LegendPosition;
            private viewport: IViewport;
            private parentViewport: IViewport;
            private svg: d3.Selection<SVGElement>;
            private group: d3.Selection<SVGElement>;
            private clearCatcher: d3.Selection<SVGElement>;
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
                data.dataPoints.forEach(element => {
                    newDataPoints.push(Prototype.inherit(element));
                });

                /* 
                for (var dp in data.dataPoints) {
                    newDataPoints.push(Prototype.inherit(dp));
                }*/
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
                    this.changeOrientation(LegendPosition.Top);
                }
                if (this.getOrientation() === LegendPosition.None) {
                    data.dataPoints = [];
                }
                // Adding back the workaround for Legend Left/Right position for Map
                var mapControl = this.element.children(".mapControl");
                if (mapControl.length > 0 && !this.isTopOrBottom(this.orientation)) {
                    mapControl.css("display", "inline-block");
                }
                this.calculateViewport(data, detailedLegend);
                var layout = this.calculateLayout(data, autoWidth, detailedLegend);
                var titleLayout = layout.title;
                var titleData = titleLayout ? [titleLayout] : [];
                var hasSelection = this.interactivityService && powerbi.extensibility.utils.interactivity.dataHasSelection(data.dataPoints);
                this.group
                    .selectAll(GMOSVGLegend.LegendItem.selector).remove();
                this.group
                    .selectAll(GMOSVGLegend.LegendTitle.selector).remove();
                var group = this.group;
    
                //transform the wrapping group if position is centered
                if (this.isCentered(this.orientation)) {
                    var centerOffset = 0;
                    if (this.isTopOrBottom(this.orientation)) {
                        centerOffset = Math.max(0,(this.parentViewport.width - this.visibleLegendWidth) / 2);
                        group.attr('transform', powerbi.extensibility.utils.svg.translate(centerOffset, 0));
                    }
                    else {
                        centerOffset = Math.max((this.parentViewport.height - this.visibleLegendHeight) / 2);
                        group.attr('transform', powerbi.extensibility.utils.svg.translate(0, centerOffset));
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
                    
                    legendTitle.exit().remove();
                }
                if (data.dataPoints.length) {
                    var virtualizedDataPoints = data.dataPoints.slice(this.legendDataStartIndex, this.legendDataStartIndex + layout.numberOfItems);
                    var iconRadius = powerbi.extensibility.utils.formatting.textMeasurementService.estimateSvgTextHeight(GMOSVGLegend.getTextProperties(false, '', this.data.fontSize)) / GMOSVGLegend.LegendIconRadiusFactor;
                    iconRadius = (this.legendFontSizeMarginValue > GMOSVGLegend.DefaultTextMargin) && iconRadius > GMOSVGLegend.LegendIconRadius
                        ? iconRadius :
                        GMOSVGLegend.LegendIconRadius;
                    var legendItems = group
                        .selectAll(GMOSVGLegend.LegendItem.selector)
                        .data(virtualizedDataPoints,(d: LegendDataPoint) => d.identity.getKey());
                    var itemsEnter = legendItems.enter()
                        .append('g')
                        .classed(GMOSVGLegend.LegendItem.class, true);
    
                    itemsEnter
                        .append('circle')
                        .classed(GMOSVGLegend.LegendIcon.class, true);
    
                    itemsEnter
                        .append('text').text((d: LegendDataPoint) => d.tooltip).attr({
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
                    
                    var textElement = legendItems.selectAll('.legend > #legendGroup > .legendItem > .legendText');
                    if(textElement.length){
                        for(var i = 0; i < textElement.length ; i++){
                            powerbi.extensibility.utils.formatting.textMeasurementService.wordBreak(textElement[i][0], this.maxLegendTextLength, 60);
                            var tSpanElements = textElement[i][0].childNodes.length;
                                for(var j = 0; j < tSpanElements; j++){
                                    textElement[i][0].childNodes[j].setAttribute('x',textElement[i][0].getAttribute('x'));
                                }
                            if(textElement[i][0].childNodes && textElement[i][0].childNodes[0]){
                                textElement[i][0].childNodes[0].setAttribute('y',0);
                            }
                        }
                    }
    
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
                    var titlewidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
                    var primaryTitleWidth: number = 0;
                    if (this.data['primaryTitle'])
                        primaryTitleWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize));
                    width = titlewidth > primaryTitleWidth ? titlewidth : primaryTitleWidth;
                    if (titlewidth > maxMeasureLength || primaryTitleWidth > maxMeasureLength) {
    
                        text = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(textProperties, maxMeasureLength);
                        width = maxMeasureLength;
                        if (this.data['primaryTitle']) {
                            this.primaryTitle = this.data['primaryTitle'] = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), maxMeasureLength);
                        }
                    }
                    else {
                        this.primaryTitle = this.data['primaryTitle'];
                    }
    
                    if (isHorizontal)
                        width += GMOSVGLegend.TitlePadding;
                    else {
                        if (width < maxMeasureLength) {
                            text = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(textProperties, titlewidth);
                            if (this.data['primaryTitle']) {
                                this.primaryTitle = this.data['primaryTitle'] = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(GMOSVGLegend.getTextProperties(true, this.data['primaryTitle'], this.data.fontSize), width);
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
                        //startIndex: null,
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
                    if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage")) {
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
                        if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage")) {
                            translateY = title.y * 2;
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
                this.maxLegendTextLength = maxTextLength;
    
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
                    var labelwidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
                    var primaryWidth = 0;
                    if (detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both") {
    
                        if (detailedLegend === "Value") {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize));
                        }
                        else if (detailedLegend === "Percentage") {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize));
                        }
                        else {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize));
                        }
                    }
                    var width = labelwidth > primaryWidth ? labelwidth : primaryWidth;
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
                        var text = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(
                            textProperties,
                            maxTextLength);
                        dp.label = text;
                        if (detailedLegend === "Value") {
                            dp.measure = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(
                                GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize),
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
                var fixedHorizontalIconShift = GMOSVGLegend.TextAndIconPadding + GMOSVGLegend.LegendIconRadius;
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
                    else if (this.data['primaryTitle']) {
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
                    var textProperties: any;
                    textProperties = GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize);
                    var labelwidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(textProperties);
                    var primaryWidth = 0;
                    if (detailedLegend === "Value" || detailedLegend === "Percentage" || detailedLegend === "Both") {
    
                        if (detailedLegend === "Value") {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize));
                        }
                        else if (detailedLegend === "Percentage") {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp['percentage'], this.data.fontSize));
                        }
                        else {
                            primaryWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(GMOSVGLegend.getTextProperties(false, dp.measure + ' ' + dp['percentage'], this.data.fontSize));
                        }
                    }
                    var width = labelwidth > primaryWidth ? labelwidth : primaryWidth;
                    width += 15;//indicators
                    if (width > maxHorizontalSpaceUsed) {
                        maxHorizontalSpaceUsed = width;
                    }
    
                    if (width > maxHorizontalSpaceAvaliable) {
                        var text = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(
                            GMOSVGLegend.getTextProperties(false, dp.label, this.data.fontSize),
                            maxHorizontalSpaceAvaliable);
                        dp.label = text;
                        if (detailedLegend === "Value") {
                            dp.measure = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(
                                GMOSVGLegend.getTextProperties(false, dp.measure, this.data.fontSize),
                                maxHorizontalSpaceAvaliable);
                        }
                    }
                    else {
                        if (detailedLegend === "Value") {
                            dp.measure = dp.measure;
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
                    .on('click',(d: NavigationArrow) => {
                    var pos = this.legendDataStartIndex;
                    this.legendDataStartIndex = d.type === NavigationArrowType.Increase
                        ? pos + this.arrowPosWindow : pos - this.arrowPosWindow;
                    this.drawLegendInternal(this.data, this.parentViewport, false, this.detailedLegend);
                })
                    .classed(GMOSVGLegend.NavigationArrow.class, true)
                    .append('path');
                arrows
                    .attr('transform',(d: NavigationArrow) => SVGUtil.translate(d.x, d.y))
                    .select('path')
                    .attr({
                    'd': (d: NavigationArrow) => d.path,
                    'transform': (d: NavigationArrow) => d.rotateTransform
                });
    
                if (this.isTopOrBottom(this.orientation)) {
                    var legendGroupHeight = parseInt(this.svg.style('height'), 10);
                    var translateY = 0;
                    if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage")) {
                        translateY = legendGroupHeight / 3;
                    }
                    else if ((detailedLegend === undefined || detailedLegend === "None")) {
                        translateY = 3.5;
                    }
                    arrows
                        .attr('transform',(d: NavigationArrow) => SVGUtil.translate(d.x, translateY))
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
                        if ((detailedLegend === "Both" || detailedLegend === "Value" || detailedLegend === "Percentage")) {
                            translateY = title.y * 2 + this.legendFontSizeMarginDifference;
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
                            this.svg.select('.navArrow').attr('transform',(d: NavigationArrow) => SVGUtil.translate(d.x, translateY));
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
                data.dataPoints.forEach(element => {
                    element.tooltip = element.label;
                });

                /*
                for (var dataPoint in data.dataPoints) {
                    dataPoint.tooltip = dataPoint.label;
                }*/
            }
        }
        
        //////////////////////////
        
        export type IColumnChartAnimatorGMO = IAnimator<IAnimatorOptions, ColumnChartAnimationOptionsGMO, ColumnChartAnimationResult>;
        
        export interface ColumnChartAnimationOptionsGMO extends IAnimationOptions {
            viewModel: StackedChartGMOData;
            series: d3.UpdateSelection;
            layout: IColumnLayout;
            itemCS: ClassAndSelector;
            mainGraphicsContext: d3.Selection<SVGElement>;
            viewPort: IViewport;
        }
        
        export interface ColumnAxisOptionsGMO {
            xScale: d3.scale.Scale;
            yScale: d3.Scale.Scale;
            seriesOffsetScale?: D3.Scale.Scale;
            columnWidth: number;
            /** Used by clustered only since categoryWidth !== columnWidth */
            categoryWidth?: number;
            isScalar: boolean;
            margin: powerbi.extensibility.utils.svg.IMargin;
        }
        
        export interface LabelDataPointGMO {
            textSize: ISizeGMO;
            isPreferred: boolean;
            parentType: LabelDataPointParentTypeGMO;
            parentShape;
            hasBackground?: boolean;
            text: string;
            tooltip?: string;
            insideFill: string;
            outsideFill: string;
            identity: ISelectionId;
            key?: string;
            fontSize?: number;
            secondRowText?: string;
            weight?: number;
            hasBeenRendered?: boolean;
            labelSize?: ISizeGMO;
        }
        /*
        export interface LabelParentPolygonGMO {
            polygon: Polygon;
            validPositions: NewPointLabelPosition[];
        }
        
        export interface LabelParentRectGMO {
            rect: powerbi.extensibility.utils.svg.IRect;
            orientation: NewRectOrientationGMO;
            validPositions: RectLabelPosition[];
        }
        */
        
        export interface ColumnChartDrawInfoGMO {
            eventGroup: d3.Selection<SVGElement>;
            shapesSelection: d3.Selection<SVGElement>;
            viewport: IViewport;
            axisOptions: ColumnAxisOptionsGMO;
            labelDataPoints: LabelDataPointGMO[];
        }
        
        export interface ColumnChartContextGMO {
            height: number;
            width: number;
            duration: number;
            hostService: IVisualHostServices;
            margin: powerbi.extensibility.utils.svg.IMargin;
            /** A group for graphics can be placed that won't be clipped to the data area of the chart. */
            //unclippedGraphicsContext: d3.Selection<SVGElement>;
            /** A SVG for graphics that should be clipped to the data area, e.g. data bars, columns, lines */
            mainGraphicsContext: d3.Selection<SVGElement>;
            layout: CategoryLayout;
            animator: IColumnChartAnimatorGMO;
            onDragStart?: (datum: ColumnChartDataPoint) => void;
            interactivityService: IInteractivityService;
            viewportHeight: number;
            viewportWidth: number;
            is100Pct: boolean;
            isComboChart: boolean;
        }
        
        export interface CartesianSmallViewPortPropertiesGMO {
            hideLegendOnSmallViewPort: boolean;
            hideAxesOnSmallViewPort: boolean;
            MinHeightLegendVisible: number;
            MinHeightAxesVisible: number;
        }
        
        export interface CartesianVisualRenderResultGMO {
            dataPoints: SelectableDataPoint[];
            behaviorOptions: any;
            labelDataPoints: LabelDataPointGMO[];
            labelsAreNumeric: boolean;
            labelDataPointGroups?: LabelDataPointGroupGMO[];
        }
        
        export interface LabelDataPointGroupGMO {
            labelDataPoints: LabelDataPointGMO[];
            maxNumberOfLabels: number;
        }
        
        export const enum RectLabelPositionGMO {
            None = 0,
            InsideCenter = 1,
            InsideBase = 2,
            InsideEnd = 4,
            OutsideBase = 8,
            OutsideEnd = 16,
            
            All =
            InsideCenter |
            InsideBase |
            InsideEnd |
            OutsideBase |
            OutsideEnd,
            
            InsideAll =
            InsideCenter |
            InsideBase |
            InsideEnd,
        }
        
        export interface IColumnChartStrategyGMO {
            setData(data: ColumnChartData): void;
            setupVisualProps(columnChartProps: ColumnChartContextGMO): void;
            setXScale(is100Pct: boolean, forcedTickCount?: number, forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureXDomain?: NumberRange): IAxisProperties;
            setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, ensureYDomain?: NumberRange): IAxisProperties;
            drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO;
            selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
            getClosestColumnIndex(x: number, y: number): number;
        }
        
        export class CartesianChartGMO {
            public static MinOrdinalRectThickness = 20;
            public static MinScalarRectThickness = 2;
            public static OuterPaddingRatio = 0.4;
            public static InnerPaddingRatio = 0.2;
            private static FontSize = 11;
            private static FontSizeString = PixelConverter.toString(CartesianChartGMO.FontSize);
            
            public static AxisTextProperties: TextProperties = {
                fontFamily: powerbi.extensibility.utils.formatting.font.Family.regular.css,
                fontSize: CartesianChartGMO.FontSizeString,
            };
            
            public static getPreferredCategorySpan(categoryCount: number, categoryThickness: number, noOuterPadding?: boolean): number {
                var span = (categoryThickness * categoryCount);
                if (noOuterPadding)
                    return span;
                return span + (categoryThickness * CartesianChartGMO.OuterPaddingRatio * 2);
            }
            
            public static getIsScalar(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, type: ValueTypeDescriptor, scalarKeys?: ScalarKeys): boolean {
                if (!CartesianChartGMO.supportsScalar(type, scalarKeys))
                    return false;
    
                var axisTypeValue = powerbi.extensibility.utils.dataview.DataViewObjects.getValue(objects, propertyId);
                if (!objects || axisTypeValue == null)
                    return true;
    
                return (axisTypeValue === axisType.scalar);
            }
            
            private static supportsScalar(type: ValueTypeDescriptor, scalarKeys?: ScalarKeys): boolean {
                // if scalar key is present, it supports scalar
                if (scalarKeys && !_.isEmpty(scalarKeys.values))
                    return true;
    
                // otherwise does not support scalar if the type is non-numeric.
                return !powerbi.extensibility.utils.chart.axis.isOrdinal(type);
            }
            
            private static getMinInterval(seriesList: CartesianSeries[]): number {
                var minInterval = Number.MAX_VALUE;
                if (seriesList.length > 0) {
                    var series0data = seriesList[0].data.filter(d => !d.highlight);
                    for (var i = 0, ilen = series0data.length - 1; i < ilen; i++) {
                        minInterval = Math.min(minInterval, Math.abs(series0data[i + 1].categoryValue - series0data[i].categoryValue));
                    }
                }
                return minInterval;
            }
            
            public static getCategoryThickness(seriesList: CartesianSeries[], numCategories: number, plotLength: number, domain: number[], isScalar: boolean, trimOrdinalDataOnOverflow: boolean): number {
                var thickness;
                if (numCategories < 2)
                    thickness = plotLength * (1 - CartesianChartGMO.OuterPaddingRatio);
                else if (isScalar && domain && domain.length > 1) {
                    // the smallest interval defines the column width.
                    var minInterval = CartesianChartGMO.getMinInterval(seriesList);
                    var domainSpan = domain[domain.length - 1] - domain[0];
                    // account for outside padding
                    var ratio = minInterval / (domainSpan + (minInterval * CartesianChartGMO.OuterPaddingRatio * 2));
                    thickness = plotLength * ratio;
                    thickness = Math.max(thickness, CartesianChartGMO.MinScalarRectThickness);
                }
                else {
                    // Divide the available width up including outer padding (in terms of category thickness) on
                    // both sides of the chart, and categoryCount categories. Reverse math:
                    // availableWidth = (categoryThickness * categoryCount) + (categoryThickness * (outerPadding * 2)),
                    // availableWidth = categoryThickness * (categoryCount + (outerPadding * 2)),
                    // categoryThickness = availableWidth / (categoryCount + (outerpadding * 2))
                    thickness = plotLength / (numCategories + (CartesianChartGMO.OuterPaddingRatio * 2));
                    if (trimOrdinalDataOnOverflow) {
                        thickness = Math.max(thickness, CartesianChartGMO.MinOrdinalRectThickness);
                    }
                }
                
                // spec calls for using the whole plot area, but the max rectangle thickness is "as if there were three categories"
                // (outerPaddingRatio has the same units as '# of categories' so they can be added)
                var maxRectThickness = plotLength / (3 + (CartesianChartGMO.OuterPaddingRatio * 2));
    
                thickness = Math.min(thickness, maxRectThickness);
    
                if (!isScalar && numCategories >= 3 && trimOrdinalDataOnOverflow) {
                    return Math.max(thickness, CartesianChartGMO.MinOrdinalRectThickness);
                }
    
                return thickness;
            }
            
            public static getLayout(data: StackedChartGMOData, options: CategoryLayoutOptions): CategoryLayout {
                var categoryCount = options.categoryCount,
                    availableWidth = options.availableWidth,
                    domain = options.domain,
                    trimOrdinalDataOnOverflow = options.trimOrdinalDataOnOverflow,
                    isScalar = !!options.isScalar,
                    isScrollable = !!options.isScrollable;
    
                var categoryThickness = CartesianChartGMO.getCategoryThickness(data ? data.series : null, categoryCount, availableWidth, domain, isScalar, trimOrdinalDataOnOverflow);
    
                // Total width of the outer padding, the padding that exist on the far right and far left of the chart.
                var totalOuterPadding = categoryThickness * CartesianChartGMO.OuterPaddingRatio * 2;
    
                // visibleCategoryCount will be used to discard data that overflows on ordinal-axis charts.
                // Needed for dashboard visuals            
                var calculatedBarCount = powerbi.extensibility.utils.type.Double.floorWithPrecision((availableWidth - totalOuterPadding) / categoryThickness);
                var visibleCategoryCount = Math.min(calculatedBarCount, categoryCount);
                var willScroll = visibleCategoryCount < categoryCount && isScrollable;
    
                var outerPaddingRatio = CartesianChartGMO.OuterPaddingRatio;
                if (!isScalar && !willScroll) {
                    // use dynamic outer padding to improve spacing when we have few categories
                    var oneOuterPadding = (availableWidth - (categoryThickness * visibleCategoryCount)) / 2;
                    outerPaddingRatio = oneOuterPadding / categoryThickness;
                }
    
                // If scrollable, visibleCategoryCount will be total categories
                if (!isScalar && isScrollable)
                    visibleCategoryCount = categoryCount;
    
                return {
                    categoryCount: visibleCategoryCount,
                    categoryThickness: categoryThickness,
                    outerPaddingRatio: outerPaddingRatio,
                    isScalar: isScalar
                };
            }
        }
        
        export class ColumnChartGMO {
            public static SeriesClasses: powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector('series');
            public static stackedValidLabelPositions: RectLabelPositionGMO[] = [RectLabelPositionGMO.InsideCenter, RectLabelPositionGMO.InsideEnd, RectLabelPositionGMO.InsideBase];
            public static getLabelFill(labelColor: string, isInside: boolean, isCombo: boolean): string {
                if (labelColor) {
                    return labelColor;
                }
                if (isInside && !isCombo) {
                    return powerbi.extensibility.utils.chart.dataLabel.utils.defaultInsideLabelColor;
                }
                return powerbi.extensibility.utils.chart.dataLabel.utils.defaultLabelColor;
            }
            public static getInteractiveColumnChartDomElement(element: JQuery): HTMLElement {
                return element.children("svg").get(0);
            }
            public static sliceSeries(series: StackedChartGMOSeries[], endIndex: number, startIndex: number = 0): StackedChartGMOSeries[] {
                var newSeries: StackedChartGMOSeries[] = [];
                if (series && series.length > 0) {
                    for (var i = 0, len = series.length; i < len; i++) {
                        var iNewSeries = newSeries[i] = Prototype.inherit(series[i]);
                        // TODO: [investigate] possible perf improvement.
                        // if data[n].categoryIndex > endIndex implies data[n+1].categoryIndex > endIndex
                        // then we could short circuit the filter loop.
                        iNewSeries.data = series[i].data.filter(d => d.categoryIndex >= startIndex && d.categoryIndex < endIndex);
                    }
                }
                return newSeries;
            }
        }
        ////////////////////////////////////
        
        export class StackedChartGMOStrategy implements IColumnChartStrategyGMO {
            private static classes = {
                item: {
                    class: 'column',
                    selector: '.column'
                },
                highlightItem: {
                    class: 'highlightColumn',
                    selector: '.highlightColumn'
                },
            };
    
            private data: StackedChartGMOData;
            private graphicsContext: ColumnChartContextGMO;
            private width: number;
            private height: number;
            private margin: powerbi.extensibility.utils.svg.IMargin;
            private xProps: IAxisProperties;
            private yProps: IAxisProperties;
            private categoryLayout: CategoryLayout;
            private columnsCenters: number[];
            private columnSelectionLineHandle: d3.Selection<SVGElement>;
            private animator: IColumnChartAnimatorGMO;
            private interactivityService: IInteractivityService;
            private viewportHeight: number;
            private viewportWidth: number;
            private layout: IColumnGMOLayout;
            private isComboChart: boolean;
    
            public setupVisualProps(columnChartProps: ColumnChartContextGMO): void {
                this.graphicsContext = columnChartProps;
                this.margin = columnChartProps.margin;
                this.width = this.graphicsContext.width;
                this.height = this.graphicsContext.height;
                this.categoryLayout = columnChartProps.layout;
                this.animator = columnChartProps.animator;
                this.interactivityService = columnChartProps.interactivityService;
                this.viewportHeight = columnChartProps.viewportHeight;
                this.viewportWidth = columnChartProps.viewportWidth;
                this.isComboChart = columnChartProps.isComboChart;
            }
    
            public setData(data: ColumnChartData) {
                this.data = data;
            }
    
            public setXScale(is100Pct: boolean, forcedTickCount?: number, forcedXDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties {
                var width = this.width;
    
                var forcedXMin, forcedXMax;
    
                if (forcedXDomain && forcedXDomain.length === 2) {
                    forcedXMin = forcedXDomain[0];
                    forcedXMax = forcedXDomain[1];
                }
    
                var props = this.xProps = this.getCategoryAxis(
                    this.data,
                    width,
                    this.categoryLayout,
                    false,
                    forcedXMin,
                    forcedXMax,
                    axisScaleType,
                    axisDisplayUnits,
                    axisPrecision
                    );
                props.values = this.xProps.values = this.data.categories;
                return props;
            }
            
            public getCategoryAxis(
                data: StackedChartGMOData,
                size: number,
                layout: CategoryLayout,
                isVertical: boolean,
                forcedXMin?: DataViewPropertyValue,
                forcedXMax?: DataViewPropertyValue,
                axisScaleType?: string,
                axisDisplayUnits?: number,
                axisPrecision?: number,
                ensureXDomain?: NumberRange): IAxisProperties {
    
                var categoryThickness = layout.categoryThickness;
                var isScalar = layout.isScalar;
                var outerPaddingRatio = layout.outerPaddingRatio;
                var domain = AxisHelper.createDomain(data.series, data.categoryMetadata ? data.categoryMetadata.type : ValueType.fromDescriptor({ text: true }), isScalar, [forcedXMin, forcedXMax], ensureXDomain);
                var axisProperties = AxisHelper.createAxis({
                    pixelSpan: size,
                    dataDomain: domain,
                    metaDataColumn: data.categoryMetadata,
                    formatString: powerbi.extensibility.utils.formatting.valueFormatter.getFormatString(data.categoryMetadata, columnChartProps.general.formatString),
                    outerPadding: categoryThickness * outerPaddingRatio,
                    isCategoryAxis: true,
                    isScalar: isScalar,
                    isVertical: isVertical,
                    categoryThickness: categoryThickness,
                    useTickIntervalForDisplayUnits: true,
                    getValueFn: (index, type) => this.lookupXValue(data, index, type, isScalar),
                    scaleType: axisScaleType,
                    axisDisplayUnits: axisDisplayUnits,
                    axisPrecision: axisPrecision
                });
    
                // intentionally updating the input layout by ref
                layout.categoryThickness = axisProperties.categoryThickness;
    
                return axisProperties;
            }
            
            public lookupXValue(data: StackedChartGMOData, index: number, type: ValueType, isScalar: boolean): any {
                debug.assertValue(data, 'data');
                debug.assertValue(type, 'type');
    
                var isDateTime = AxisHelper.isDateTime(type);
    
                if (isScalar) {
                    if (isDateTime)
                        return new Date(index);
    
                    // index is the numeric value
                    return index;
                }
    
                if (type.text) {
                    debug.assert(index < data.categories.length, 'category index out of range');
                    return data.categories[index];
                }
    
                if (data && data.series && data.series.length > 0) {
                    var firstSeries = data.series[0];
                    if (firstSeries) {
                        var seriesValues = firstSeries.data;
                        if (seriesValues) {
                            if (data.hasHighlights)
                                index = index * 2;
                            var dataAtIndex = seriesValues[index];
                            if (dataAtIndex) {
                                if (isDateTime && dataAtIndex.categoryValue != null)
                                    return new Date(dataAtIndex.categoryValue);
                                return dataAtIndex.categoryValue;
                            }
                        }
                    }
                }
    
                return index;
            }
            
            public calcValueDomain(data, is100pct) {
                var defaultNumberRange = {
                    min: 0,
                    max: 10
                };
    
                if (data.length === 0)
                    return defaultNumberRange;
    
                // Can't use AxisHelper because Stacked layout has a slightly different calc, (position - valueAbs)
                var min = d3.min<ColumnChartSeries, number>(data, d => d3.min<ColumnChartDataPoint, number>(d.data, e => e.position - e.valueAbsolute));
                var max = d3.max<ColumnChartSeries, number>(data, d => d3.max<ColumnChartDataPoint, number>(d.data, e => e.position));
    
                if (is100pct) {
                    min = powerbi.extensibility.utils.type.Double.roundToPrecision(min, 0.0001);
                    max = powerbi.extensibility.utils.type.Double.roundToPrecision(max, 0.0001);
                }
    
                return {
                    min: min,
                    max: max,
                };
            }
    
            public setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number, y1ReferenceLineValue?: number): IAxisProperties {
    
                var height = this.height;
                var valueDomain = this.calcValueDomain(this.data.series, is100Pct);
                var valueDomainArr = [valueDomain.min, valueDomain.max];
                var combinedDomain = AxisHelper.combineDomain(forcedYDomain, valueDomainArr, y1ReferenceLineValue);
                var shouldClamp = AxisHelper.scaleShouldClamp(combinedDomain, valueDomainArr);
                var metadataColumn = this.data.valuesMetadata[0];
                powerbi.extensibility.utils.formatting.valueFormatter.getFormatString(this.data.valuesMetadata[0], columnChartProps.general.formatString)
                var formatString = is100Pct ?
                    this.graphicsContext.hostService.getLocalizedString('Percentage')
                    : powerbi.extensibility.utils.formatting.valueFormatter.getFormatString(metadataColumn, columnChartProps.general.formatString);
    
                this.yProps = AxisHelper.createAxis({
                    pixelSpan: height,
                    dataDomain: combinedDomain,
                    metaDataColumn: metadataColumn,
                    formatString: formatString,
                    outerPadding: 0,
                    isScalar: true,
                    isVertical: true,
                    forcedTickCount: forcedTickCount,
                    useTickIntervalForDisplayUnits: true,
                    isCategoryAxis: false,
                    scaleType: axisScaleType,
                    axisDisplayUnits: axisDisplayUnits,
                    axisPrecision: axisPrecision,
                    is100Pct: is100Pct,
                    shouldClamp: shouldClamp,
                });
    
                return this.yProps;
            }
    
            public StackedChartGMOStrategyGetLayout (data, axisOptions) {
                var columnWidth = axisOptions.columnWidth;
                var isScalar = axisOptions.isScalar;
                var xScale = axisOptions.xScale;
                var yScale = axisOptions.yScale;
                var xScaleOffset = 0;
                if (isScalar)
                    xScaleOffset = columnWidth / 2;
    
                // d.position is the top left corner (for drawing) - set in columnChart.converter
                // for positive values, this is the previous stack position + the new value,
                // for negative values it is just the previous stack position
    
                return {
                    shapeLayout: {
                        width: (d: ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => yScale(d.position),
                        height: (d: ColumnChartDataPoint) => yScale(d.position - d.valueAbsolute) - yScale(d.position),
                    },
                    shapeLayoutWithoutHighlights: {
                        width: (d: ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => yScale(d.originalPosition),
                        height: (d: ColumnChartDataPoint) => yScale(d.originalPosition - d.originalValueAbsolute) - yScale(d.originalPosition),
                    },
                    zeroShapeLayout: {
                        width: (d: ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => d.value >= 0 ? yScale(d.position - d.valueAbsolute) : yScale(d.position),
                        height: (d: ColumnChartDataPoint) => 0
                    },
                };
            }
            
            public ColumnUtilDrawSeries(data, graphicsContext, axisOptions) {
                var colGroupSelection = graphicsContext.selectAll(ColumnChartGMO.SeriesClasses.selector);
                var series = colGroupSelection.data(data.series,(d: ColumnChartSeries) => d.key);
    
                series
                    .enter()
                    .append('g')
                    .classed(ColumnChartGMO.SeriesClasses.class, true);
                    
                series
                    .style({
                        fill: (d: ColumnChartSeries) => d.color, 
                    });
                    
                series
                    .exit()
                    .remove();
    
                return series;
            }
            
            public ColumnUtilDrawDefaultShapes(data, series, layout, itemCS, filterZeros, hasSelection) {
                var dataSelector: (d: ColumnChartSeries) => any[];
                if (filterZeros) {
                    dataSelector = (d: ColumnChartSeries) => {
                        var filteredData = _.filter(d.data,(datapoint: ColumnChartDataPoint) => !!datapoint.value);
                        return filteredData;
                    };
                }
                else {
                    dataSelector = (d: ColumnChartSeries) => d.data;
                }
    
                var shapeSelection = series.selectAll(itemCS.selector);
                var shapes = shapeSelection.data(dataSelector, (d: ColumnChartDataPoint) => d.key);
    
                shapes.enter()
                    .append("rect")
                    .attr("class",(d: ColumnChartDataPoint) => itemCS.class.concat(d.highlight ? " highlight" : ""));
    
                shapes
                    .style("fill-opacity", (d: ColumnChartDataPoint) => ColumnUtil.getFillOpacity(d.selected, d.highlight, hasSelection, data.hasHighlights))
                    .style("fill", (d: ColumnChartDataPoint) => d.color !== data.series[d.seriesIndex].color ? d.color : null)  // PERF: Only set the fill color if it is different than series.
                    .attr(layout.shapeLayout);
    
                shapes
                    .exit()
                    .remove();
    
                return shapes;
            }
            
            public drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO {
                var data = this.data;
                debug.assertValue(data, 'data could not be null or undefined');
    
                this.columnsCenters = null; // invalidate the columnsCenters so that will be calculated again
                var categoryWidth;
                if ((this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio)) < 0) {
                    categoryWidth = 0;
                }
                else {
                    categoryWidth = (this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio));
                }
    
                var axisOptions: ColumnAxisOptions = {
                    columnWidth: this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio),
                    xScale: this.xProps.scale,
                    yScale: this.yProps.scale,
                    isScalar: this.categoryLayout.isScalar,
                    margin: this.margin,
                };
                //debugger;
                var stackedColumnLayout = this.layout = this.StackedChartGMOStrategyGetLayout(data, axisOptions);
                var dataLabelSettings = data.labelSettings;
                var labelDataPoints: LabelDataPointGMO[] = [];
                if (dataLabelSettings && dataLabelSettings.show) {
                    labelDataPoints = this.createLabelDataPoints();
                }
    
                var result: ColumnChartAnimationResult;
                var shapes: D3.UpdateSelection;
                var series = this.ColumnUtilDrawSeries(data, this.graphicsContext.mainGraphicsContext, axisOptions);
                
                if (this.animator && useAnimation) {
                    result = this.animator.animate({
                        viewModel: data,
                        series: series,
                        layout: stackedColumnLayout,
                        itemCS: StackedChartGMOStrategy.classes.item,
                        interactivityService: this.interactivityService,
                        mainGraphicsContext: this.graphicsContext.mainGraphicsContext,
                        viewPort: { height: this.height, width: this.width }
                    });
                    shapes = result.shapes;
                }
                if (!this.animator || !useAnimation || result.failed) {
                    shapes = this.ColumnUtilDrawDefaultShapes(data, series, stackedColumnLayout, StackedChartGMOStrategy.classes.item, !this.animator, this.interactivityService && this.interactivityService.hasSelection());
                }
    
                ColumnUtil.applyInteractivity(shapes, this.graphicsContext.onDragStart);
    
                return {
                    eventGroup: this.graphicsContext.mainGraphicsContext,
                    shapesSelection: shapes,
                    viewport: { height: this.height, width: this.width },
                    axisOptions,
                    labelDataPoints: labelDataPoints,
                };
            }
            
            public setChosenColumnOpacity(mainGraphicsContext: d3.Selection<SVGElement>, columnGroupSelector: string, selectedColumnIndex: number, lastColumnIndex: number): void {
                var series = mainGraphicsContext.selectAll(ColumnChartGMO.SeriesClasses.selector);
                var lastColumnUndefined = typeof lastColumnIndex === 'undefined';
                // find all columns that do not belong to the selected column and set a dimmed opacity with a smooth animation to those columns
                series.selectAll("rect" + columnGroupSelector).filter((d: ColumnChartDataPoint) => {
                    return (d.categoryIndex !== selectedColumnIndex) && (lastColumnUndefined || d.categoryIndex === lastColumnIndex);
                }).transition().style('fill-opacity', 0.4);
    
                // set the default opacity for the selected column
                series.selectAll("rect" + columnGroupSelector).filter((d: ColumnChartDataPoint) => {
                    return d.categoryIndex === selectedColumnIndex;
                }).style('fill-opacity', 1.0);
            }
    
            public selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void {
                this.setChosenColumnOpacity(this.graphicsContext.mainGraphicsContext, StackedChartGMOStrategy.classes.item.selector, selectedColumnIndex, lastSelectedColumnIndex);
                this.moveHandle(selectedColumnIndex);
            }
    
            public getClosestColumnIndex(x: number, y: number): number {
                return ColumnUtil.getClosestColumnIndex(x, this.getColumnsCenters());
            }
    
            /**
             * Get the chart's columns centers (x value).
             */
            private getColumnsCenters(): number[] {
                if (!this.columnsCenters) { // lazy creation
                    var categoryWidth: number = this.categoryLayout.categoryThickness * (1 - CartesianChartGMO.InnerPaddingRatio);
                    // use the axis scale and first series data to get category centers
                    if (this.data.series.length > 0) {
                        var xScaleOffset = 0;
                        if (!this.categoryLayout.isScalar)
                            xScaleOffset = categoryWidth / 2;
                        var firstSeries = this.data.series[0];
                        this.columnsCenters = firstSeries.data.map(d => this.xProps.scale(this.categoryLayout.isScalar ? d.categoryValue : d.categoryIndex) + xScaleOffset);
                    }
                }
                return this.columnsCenters;
            }
    
            private moveHandle(selectedColumnIndex: number) {
                var columnCenters = this.getColumnsCenters();
                var x = columnCenters[selectedColumnIndex];
                if (!this.columnSelectionLineHandle) {
                    var handle = this.columnSelectionLineHandle = this.graphicsContext.mainGraphicsContext.append('g');
                    handle.append('line')
                        .classed('interactive-hover-line', true)
                        .attr({
                        x1: x,
                        x2: x,
                        y1: 0,
                        y2: this.height,
                    });
    
                    handle.append('circle')
                        .attr({
                        cx: x,
                        cy: this.height,
                        r: '6px',
                    })
                        .classed('drag-handle', true);
                }
                else {
                    var handle = this.columnSelectionLineHandle;
                    handle.select('line').attr({ x1: x, x2: x });
                    handle.select('circle').attr({ cx: x });
                }
            }
    
            public static getLayout(data: ColumnChartData, axisOptions: ColumnAxisOptions): IColumnLayout {
                var columnWidth = axisOptions.columnWidth;
                var isScalar = axisOptions.isScalar;
                var xScale = axisOptions.xScale;
                var yScale = axisOptions.yScale;
                var xScaleOffset = 0;
                if (isScalar)
                    xScaleOffset = columnWidth / 2;
    
                // d.position is the top right corner for bars - set in columnChart.converter
                // for positive values, this is the previous stack position + the new value,
                // for negative values it is just the previous stack position
                return {
                    shapeLayout: {
                        width: (d: powerbi.extensibility. ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => yScale(d.position),
                        height: (d: ColumnChartDataPoint) => yScale(d.position - d.valueAbsolute) - yScale(d.position),
                    },
                    shapeLayoutWithoutHighlights: {
                        width: (d: ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => yScale(d.originalPosition),
                        height: (d: ColumnChartDataPoint) => yScale(d.originalPosition - d.originalValueAbsolute) - yScale(d.originalPosition),
                    },
                    zeroShapeLayout: {
                        width: (d: ColumnChartDataPoint) => columnWidth,
                        x: (d: ColumnChartDataPoint) => xScale(isScalar ? d.categoryValue : d.categoryIndex) - xScaleOffset,
                        y: (d: ColumnChartDataPoint) => d.value >= 0 ? yScale(d.position - d.valueAbsolute) : yScale(d.position),
                        height: (d: ColumnChartDataPoint) => 0
                    },
                };
            }
    
            private createLabelDataPoints(): LabelDataPointGMO[] {
                var labelDataPoints: LabelDataPointGMO[] = [];
                var data = this.data;
                var series = data.series;
                var formattersCache = powerbi.extensibility.utils.chart.dataLabel.utils.createColumnFormatterCacheManager();
                var shapeLayout = this.layout.shapeLayout;
    
                for (var currentSeriesIndex in series) {
                    var currentSeries = series[currentSeriesIndex];
                    var labelSettings = currentSeries.labelSettings ? currentSeries.labelSettings : data.labelSettings;
                    if (!labelSettings.show)
                        continue;    
                    var axisFormatter: number = NewDataLabelUtils.getDisplayUnitValueFromAxisFormatter(this.yProps.formatter, labelSettings);
                    for (var dataPointIndex in currentSeries.data) {
                        var dataPoint = currentSeries.data[dataPointIndex];
                        if ((data.hasHighlights && !dataPoint.highlight) || dataPoint.value == null) {
                            continue;
                        }
    
                        // Calculate parent rectangle   
                        var parentRect: powerbi.extensibility.utils.svg.IRect = {
                            left: shapeLayout.x(dataPoint),
                            top: shapeLayout.y(dataPoint),
                            width: shapeLayout.width(dataPoint),
                            height: shapeLayout.height(dataPoint),
                        };
    
                        // Calculate label text
                        var formatString = undefined;
    
                        if (this.graphicsContext.is100Pct) {
                            formatString = powerbi.extensibility.utils.chart.dataLabel.utils.hundredPercentFormat;
                        }
                        else {
                            formatString = dataPoint.labelFormatString;
                        }
                        var formatter = formattersCache.getOrCreate(formatString, labelSettings, axisFormatter);
                        var text = powerbi.extensibility.utils.chart.dataLabel.utils.getLabelFormattedText(formatter.format(dataPoint.value));
    
                        // Calculate text size
                        var properties: TextProperties = {
                            text: text,
                            fontFamily: powerbi.extensibility.utils.chart.dataLabel.utils.LabelTextProperties.fontFamily,
                            fontSize: PixelConverter.fromPoint(labelSettings.fontSize || powerbi.extensibility.utils.chart.dataLabel.utils.DefaultFontSizeInPt),
                            fontWeight: powerbi.extensibility.utils.chart.dataLabel.utils.LabelTextProperties.fontWeight,
                        };
                        var textWidth = powerbi.extensibility.utils.formatting.textMeasurementService.measureSvgTextWidth(properties);
                        var textHeight = powerbi.extensibility.utils.formatting.textMeasurementService.estimateSvgTextHeight(properties, true /* tightFitForNumeric */);
                       
                        labelDataPoints.push({
                            isPreferred: true,
                            text: text,
                            textSize: {
                                width: textWidth,
                                height: textHeight,
                            },
                            outsideFill: ColumnChartGMO.getLabelFill(labelSettings.labelColor, false, this.isComboChart),
                            insideFill: ColumnChartGMO.getLabelFill(labelSettings.labelColor, true, this.isComboChart),
                            parentType: LabelDataPointParentTypeGMO.Rectangle,
                            parentShape: {
                                rect: parentRect,
                                orientation: dataPoint.value >= 0 ? NewRectOrientationGMO.VerticalBottomBased : NewRectOrientationGMO.VerticalTopBased,
                                validPositions: ColumnChartGMO.stackedValidLabelPositions,
                            },
                            identity: dataPoint.identity,
                            fontSize: labelSettings.fontSize || powerbi.extensibility.utils.chart.dataLabel.utils.DefaultFontSizeInPt,
                        });
                    }
                }
    
                return labelDataPoints;
            }
        }
    
        export const enum NewRectOrientationGMO {
            /** Rectangle with no specific orientation. */
            None,
            /** Vertical rectangle with base at the bottom. */
            VerticalBottomBased,
            /** Vertical rectangle with base at the top. */
            VerticalTopBased,
            /** Horizontal rectangle with base at the left. */
            HorizontalLeftBased,
            /** Horizontal rectangle with base at the right. */
            HorizontalRightBased,
        }
        
        export interface LabelParentRect {
            /** The rectangle this data label belongs to */
            rect: powerbi.extensibility.utils.svg.IRect;
            /** The orientation of the parent rectangle */
            orientation: NewRectOrientationGMO;
            /** Valid positions to place the label ordered by preference */
            validPositions: RectLabelPosition[];
        }
        /*
        export interface LabelDataPoint {
            textSize: ISize;
            isPreferred: boolean;
            parentType: LabelDataPointParentTypeGMO;
            parentShape: LabelParentRect | LabelParentPoint | LabelParentPolygon;
            hasBackground?: boolean;
            text: string;
            tooltip?: string;
            insideFill: string;
            outsideFill: string;
            identity: powerbi.visuals.SelectionId;
            key?: string;
            fontSize?: number;
            secondRowText?: string;
            weight?: number;
            hasBeenRendered?: boolean;
            labelSize?: ISize;
        }
        */
        
        export interface ISizeGMO {
                width: number;
                height: number;
        }
        
        export const enum LabelDataPointParentTypeGMO {
            /* parent shape of data label is a point*/
            Point,
            
            /* parent shape of data label is a rectangle*/
            Rectangle,
            
            /* parent shape of data label is a polygon*/
            Polygon
        }
        
        export interface StackedChartGMOConstructorOptions extends CartesianVisualConstructorOptions {
            chartType: StackedChartGMOType;
            animator: IColumnChartAnimatorGMO;
        }
    
        export interface StackedChartGMOData extends CartesianData {
            categoryFormatter: IValueFormatter;
            series: StackedChartGMOSeries[];
            valuesMetadata: DataViewMetadataColumn[];
            legendData: LegendData;
            hasHighlights: boolean;
            categoryMetadata: DataViewMetadataColumn;
            scalarCategoryAxis: boolean;
            labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
            axesLabels: ChartAxesLabels;
            hasDynamicSeries: boolean;
            isMultiMeasure: boolean;
            defaultDataPointColor?: string;
            showAllDataPoints?: boolean;
    
        }
        export interface ColumnGMOBehaviorOptions {
            datapoints: SelectableDataPoint[];
            bars: d3.Selection<SVGElement>;
            mainGraphicsContext: d3.Selection<SVGElement>;
            hasHighlights: boolean;
            viewport: IViewport;
            axisOptions: ColumnAxisOptions;
            showLabel: boolean;
        }
        export interface StackedChartGMOSeries extends CartesianSeries {
            displayName: string;
            key: string;
            index: number;
            data: StackedChartGMODataPoint[];
            identity: ISelectionId;
            color: string;
            labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
        }
    
        export interface StackedChartGMODataPoint extends CartesianDataPoint, SelectableDataPoint, TooltipEnabledDataPoint, LabelEnabledDataPoint {
            categoryValue: number;
            /** Adjusted for 100% stacked if applicable */
            value: number;
            /** The top (column) or right (bar) of the rectangle, used for positioning stacked rectangles */
            position: number;
            valueAbsolute: number;
            /** Not adjusted for 100% stacked */
            valueOriginal: number;
            seriesIndex: number;
            labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
            categoryIndex: number;
            color: string;
            /** The original values from the highlighted rect, used in animations */
            originalValue: number;
            originalPosition: number;
            originalValueAbsolute: number;
    
            /** 
             * True if this data point is a highlighted portion and overflows (whether due to the highlight
             * being greater than original or of a different sign), so it needs to be thinner to accomodate. 
             */
            drawThinner?: boolean;
            key: string;
            lastSeries?: boolean;
            chartType: ColumnChartType;
        }
    
        var flagBar: number = 1 << 1;
        var flagColumn: number = 1 << 2;
        var flagClustered: number = 1 << 3;
        var flagStacked: number = 1 << 4;
        var flagStacked100: number = flagStacked | (1 << 5);
    
        
        
        export enum StackedChartGMOType {
            clusteredBar = flagBar | flagClustered,
            clusteredColumn = flagColumn | flagClustered,
            hundredPercentStackedBar = flagBar | flagStacked100,
            hundredPercentStackedColumn = flagColumn | flagStacked100,
            stackedBar = flagBar | flagStacked,
            stackedColumn = flagColumn | flagStacked,
        }
    
        export interface ColumnAxisGMOOptions {
            xScale: D3.Scale.Scale;
            yScale: D3.Scale.Scale;
            seriesOffsetScale?: D3.Scale.Scale;
            columnWidth: number;
            /** Used by clustered only since categoryWidth !== columnWidth */
            categoryWidth?: number;
            isScalar: boolean;
            margin: powerbi.extensibility.utils.svg.IMargin;
        }
    
        export interface IColumnGMOLayout {
            shapeLayout: {
                width: (d: StackedChartGMODataPoint) => number;
                x: (d: StackedChartGMODataPoint) => number;
                y: (d: StackedChartGMODataPoint) => number;
                height: (d: StackedChartGMODataPoint) => number;
            };
            shapeLayoutWithoutHighlights: {
                width: (d: StackedChartGMODataPoint) => number;
                x: (d: StackedChartGMODataPoint) => number;
                y: (d: StackedChartGMODataPoint) => number;
                height: (d: StackedChartGMODataPoint) => number;
            };
            zeroShapeLayout: {
                width: (d: StackedChartGMODataPoint) => number;
                x: (d: StackedChartGMODataPoint) => number;
                y: (d: StackedChartGMODataPoint) => number;
                height: (d: StackedChartGMODataPoint) => number;
            };
        }
    
        export interface StackedChartGMOContext {
            height: number;
            width: number;
            duration: number;
            hostService: IVisualHostServices;
            margin: powerbi.extensibility.utils.svg.IMargin;
            mainGraphicsContext: d3.Selection<SVGElement>;
            labelGraphicsContext: d3.Selection<SVGElement>;
            layout: CategoryLayout;
            animator: IColumnChartAnimatorGMO;
            onDragStart?: (datum: StackedChartGMODataPoint) => void;
            interactivityService: IInteractivityService;
            viewportHeight: number;
            viewportWidth: number;
            is100Pct: boolean;
            isComboChart: boolean;
        }
    
        export interface IStackedChartGMOStrategy {
            setData(data: StackedChartGMOData): void;
            setupVisualProps(columnChartProps: ColumnChartContextGMO): void;
            setXScale(is100Pct: boolean, forcedTickCount?: number, forcedXDomain?: any[], axisScavarype?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties;
            setYScale(is100Pct: boolean, forcedTickCount?: number, forcedYDomain?: any[], axisScaleType?: string, axisDisplayUnits?: number, axisPrecision?: number): IAxisProperties;
            drawColumns(useAnimation: boolean): ColumnChartDrawInfoGMO;
            selectColumn(selectedColumnIndex: number, lastSelectedColumnIndex: number): void;
            getClosestColumnIndex(x: number, y: number): number;
        }
    
        export interface IColumnChartConverterGMOStrategy {
            getLegend(colors: IDataColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo;
            getValueBySeriesAndCategory(series: number, category: number): number;
            getMeasureNameByIndex(series: number, category: number): string;
            hasHighlightValues(series: number): boolean;
            getHighlightBySeriesAndCategory(series: number, category: number): number;
        }
    
        export interface LegendSeriesGMOInfo {
            legend: LegendData;
            seriesSources: DataViewMetadataColumn[];
            seriesObjects: DataViewObjects[][];
        }
    
        export interface ColumnChartDrawGMOInfo {
            shapesSelection: d3.Selection<SVGElement>;
            viewport: IViewport;
            axisOptions: ColumnAxisOptions;
            labelDataPoints: LabelDataPoint[];
        }
        var RoleNames = {
            category: 'Category',
            series: 'Series',
            y: 'Y',
        };
    
        export var StackedChartGMOProps = {
            dataPoint: {
                defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
                fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
                showAllDataPoints: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'showAllDataPoints' },
            },
            general: {
                formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },
            },
            sampleFilter: {
                show: { objectName: 'sampleFilter', propertyName: 'show' },
            },
            categoryAxis: {
                axisType: <DataViewObjectPropertyIdentifier>{ objectName: 'categoryAxis', propertyName: 'axisType' },
            },
            textWrap: {
                show: { objectName: 'textWrap', propertyName: 'show' }
            },
            measureTitles: {
                ellipses: { objectName: 'measureTitles', propertyName: 'ellipses' },
            },        
            legend: {
                labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
                labelDisplayUnit: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelDisplayUnit' },
                labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelPrecision' },
                primaryMeasureOnoff: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'primaryMeasureOnoff' },
            },
            plotArea: {
                image: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'image' },
                transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'plotArea', propertyName: 'transparency' },
            },
            title: {
                tooltipText: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'tooltipText' },
                showTooltip: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'showTooltip' },
            },
            // MAQCode
            show: { objectName: 'GMOColumnChartTitle', propertyName: 'show' },
            titleText: { objectName: 'GMOColumnChartTitle', propertyName: 'titleText' },
            titleFill: { objectName: 'GMOColumnChartTitle', propertyName: 'fill1' },
            titleBackgroundColor: { objectName: 'GMOColumnChartTitle', propertyName: 'backgroundColor' },
            titleFontSize: { objectName: 'GMOColumnChartTitle', propertyName: 'fontSize' },
            tooltipText: { objectName: 'GMOColumnChartTitle', propertyName: 'tooltipText' },
            
            totalLabels: {
                show: { objectName: 'totalLabels', propertyName: 'show' },
                titleText: { objectName: 'totalLabels', propertyName: 'titleText' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'color' },
                displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'labelDisplayUnits' },
                textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'labelPrecision' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'totalLabels', propertyName: 'fontSize' },
            },
            secondaryLabels: {
                titleText: { objectName: 'secondaryLabels', propertyName: 'titleText' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'color' },
                displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelDisplayUnits' },
                textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelPrecision' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'fontSize' },
            },
            tertiaryLabels: {
                titleText: { objectName: 'tertiaryLabels', propertyName: 'titleText' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'color' },
                displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'labelDisplayUnits' },
                textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'labelPrecision' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'tertiaryLabels', propertyName: 'fontSize' },
            },
            quaternaryLabels: {
                titleText: { objectName: 'quaternaryLabels', propertyName: 'titleText' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'color' },
                displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'labelDisplayUnits' },
                textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'labelPrecision' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'quaternaryLabels', propertyName: 'fontSize' },
            },
        };
        export interface sampleFilterSettings {
            show: boolean;
        };
        export interface textWrapSettings {
            show: boolean;
        };
        export interface measureTitlesSettings {
            ellipsesStrength: number;
        };
        export interface totalLabelSettings {
            show: boolean;
            titleText: string;
            color: string;
            displayUnits: number;
            textPrecision: number;
            fontSize: number;
        };
        export interface secondaryLabelSettings {
            titleText: string;
            color: string;
            displayUnits: number;
            textPrecision: number;
            fontSize: number;
        };
        export interface tertiaryLabelSettings {
            titleText: string;
            color: string;
            displayUnits: number;
            textPrecision: number;
            fontSize: number;
        };
        export interface quaternaryLabelSettings {
            titleText: string;
            color: string;
            displayUnits: number;
            textPrecision: number;
            fontSize: number;
        };
        
        
        /**
         * Renders a stacked and clustered column chart.
         */
        export class StackedChartGMO implements IVisual {
            private root: d3.Selection<SVGElement>;
            private updateCount: number = 0;
            private static ColumnChartClassName = 'StackedChartGMO';
            public static SeriesClasses: powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector('series');
            private legend: IGMOLegend;
            private static MainGraphicsContextClassName = 'mainGraphicsContext';
            private AxisGraphicsContextClassName = 'axisGraphicsContext';
            private y1AxisReferenceLines: DataViewObjectMap;
            private sharedColorPalette: SharedColorPalette;
            private background: VisualBackground;
            private svg: d3.Selection<SVGElement>;
            private barsCenters: number[];
            private svgScrollable: d3.Selection<SVGElement>;
            private mainGraphicsContext: d3.Selection<SVGElement>;
            private labelGraphicsContext: d3.Selection<SVGElement>;
            private axisGraphicsContext: d3.Selection<SVGElement>;
            private axisGraphicsContextScrollable: d3.Selection<SVGElement>;
            private xAxisGraphicsContext: d3.Selection<SVGElement>;
            private backgroundGraphicsContext: d3.Selection<SVGElement>;
            private y1AxisGraphicsContext: d3.Selection<SVGElement>;
            private clearCatcher: d3.Selection<SVGElement>;
            private mainGraphicsG: d3.Selection<SVGElement>;
            private xAxisProperties: IAxisProperties;
            private yAxisProperties: IAxisProperties;
            public isLegendValue: boolean = false;
            private isAxistype: boolean;
            private isSameAxis: boolean;
            private isSecondaryMeasure: boolean = false;
            private isPrimaryMeasure: boolean;
            private ScrollBarWidth = 10;
            private data: StackedChartGMOData;
            private style: IVisualStyle;
            private colors: IDataColorPalette;
            private static AxisFontSize = 11;
            private yAxisOrientation: string;
            private scrollY: boolean;
            private scrollX: boolean;
            private textProperties: TextProperties = {
                fontFamily: 'wf_segoe-ui_normal',
                fontSize: PixelConverter.toString(StackedChartGMO.AxisFontSize),
            };
            private chartType: ColumnChartType;
            private columnChart: IStackedChartGMOStrategy;
            private hostService: IVisualHostServices;
            private cartesianVisualHost: ICartesianVisualHost;
            private legendObjectProperties: DataViewObject;
			private removeFlags: number[];
    
            private layerLegendData: LegendData;
            private legendLabelFontSize: number;
            private interactivity: InteractivityOptions;
            private cartesianSmallViewPortProperties: CartesianSmallViewPortPropertiesGMO;
            private options: VisualInitOptions;
            private static LabelDisplayUnitsDefault: number = 0;
            private lastInteractiveSelectedColumnIndex: number;
            private interactivityService: IInteractivityService;
            private dataView: DataView;
            public dataViews: DataView[];
            private dataViewCat: DataViewCategorical;
            private categoryAxisType: string;
            private hasCategoryAxis: boolean;
            private yAxisIsCategorical: boolean;
            private bottomMarginLimit: number;
            private leftRightMarginLimit: number;
            private isXScrollBarVisible: boolean;
            private isYScrollBarVisible: boolean;
            private animator: IColumnChartAnimatorGMO;
            private isScrollable: boolean;
            private tooltipsEnabled: boolean;
            private element: JQuery;
            private seriesLabelFormattingEnabled: boolean;
            private isComboChart: boolean;
            private categoryAxisProperties: DataViewObject;
            private valueAxisProperties: DataViewObject;
            public visualOptions: CalculateScaleAndDomainOptions;
            private categoryAxisHasUnitType: boolean;
            private valueAxisHasUnitType: boolean;
            private static LegendLabelFontSizeDefault: number = 9;
            private _margin: powerbi.extensibility.utils.svg.IMargin;
            private get margin(): powerbi.extensibility.utils.svg.IMargin {
                return this._margin || { left: 0, right: 0, top: 0, bottom: 0 };
            }
    
            private set margin(value: powerbi.extensibility.utils.svg.IMargin) {
                this._margin = $.extend({}, value);
                this._viewportIn = StackedChartGMO.substractMargin(this.viewport, this.margin);
            }
    
            private _viewport: IViewport;
            private get viewport(): IViewport {
                return this._viewport || { width: 0, height: 0 };
            }
    
            private set viewport(value: IViewport) {
                this._viewport = $.extend({}, value);
                this._viewportIn = StackedChartGMO.substractMargin(this.viewport, this.margin);
            }
    
            private _viewportIn: IViewport;
            private get viewportIn(): IViewport {
                return this._viewportIn || this.viewport;
            }
    
            private get legendViewport(): IViewport {
                return this.legend.getMargins();
            }
            /*constructor(options: StackedChartGMOConstructorOptions) {    
                this.categoryAxisType = null;
                this.tooltipsEnabled = true;
            }*/
            private static substractMargin(viewport: IViewport, margin: powerbi.extensibility.utils.svg.IMargin): IViewport {
                return {
                    width: Math.max(viewport.width - (margin.left + margin.right), 0),
                    height: Math.max(viewport.height - (margin.top + margin.bottom), 0)
                };
            }
            public static customizeQuery(options: CustomizeQueryOptions): void {
                var dataViewMapping = options.dataViewMappings[0];
                if (!dataViewMapping || !dataViewMapping.categorical || !dataViewMapping.categorical.categories)
                    return;
    
                dataViewMapping.categorical.dataVolume = 4;
    
                var dataViewCategories = <data.CompiledDataViewRoleForMappingWithReduction>dataViewMapping.categorical.categories;
                var categoryItems = dataViewCategories.for.in.items;
                if (!_.isEmpty(categoryItems)) {
                    var categoryType = categoryItems[0].type;
    
                    var objects: DataViewObjects;
                    if (dataViewMapping.metadata)
                        objects = dataViewMapping.metadata.objects;
    
                    if (CartesianChartGMO.getIsScalar(objects, columnChartProps.categoryAxis.axisType, categoryType)) {
                        dataViewCategories.dataReductionAlgorithm = { sample: {} };
                    }
                }
            }
    
            public static getSortableRoles(options: VisualSortableOptions): string[] {
                var dataViewMapping = options.dataViewMappings[0];
                if (!dataViewMapping || !dataViewMapping.categorical || !dataViewMapping.categorical.categories)
                    return null;
    
                var dataViewCategories = <data.CompiledDataViewRoleForMappingWithReduction>dataViewMapping.categorical.categories;
                var categoryItems = dataViewCategories.for.in.items;
                if (!_.isEmpty(categoryItems)) {
                    var categoryType = categoryItems[0].type;
    
                    var objects: DataViewObjects;
                    if (dataViewMapping.metadata)
                        objects = dataViewMapping.metadata.objects;
    
                    //TODO: column chart should be sortable by X if it has scalar axis
                    // But currenly it doesn't support this. Return 'category' once
                    // it is supported.
                    if (!CartesianChartGMO.getIsScalar(objects, columnChartProps.categoryAxis.axisType, categoryType)) {
                        return ['Category', 'Y'];
                    }
                }
    
                return null;
            }
    
            public updateVisualMetadata(x: IAxisProperties, y: IAxisProperties, margin) {
                this.xAxisProperties = x;
                this.yAxisProperties = y;
                this.margin = margin;
            }                
            
            public static capabilities: VisualCapabilities = {
                
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
                                description: 'Select the location for legend',
                                type: { enumeration: legendPosition.type },
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
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                placeHolderText: '0',
                                type: { formatting: { labelDisplayUnits: true } },
                                suppressFormatPainterCopy: true,
                            },
                            labelPrecision: {
                                displayName: 'Precision',
                                type: { numeric: true },
                                suppressFormatPainterCopy: true,
                            },
                            primaryMeasureOnoff: {
                                displayName: "Primary Measure On/Off",
                                type: { bool: true }
                            },
                        }
                    },
                    categoryAxis: {
                        displayName: 'X Axis',
                        properties: {
                            show: {
                                displayName: 'Show',
                                type: { bool: true },
                            },
                            position: {
                                displayName: 'Position',
                                type: { enumeration: yAxisPosition.type },
                            },
                            axisScale: {
                                displayName: 'Scale type',
                                type: { enumeration: axisScale.type }
                            },
                            start: {
                                displayName: 'Start',
                                type: { numeric: true },
                                placeHolderText: 'Auto',
                                suppressFormatPainterCopy: true,
                            },
                            end: {
                                displayName: 'End',
                                placeHolderText: 'Auto',
                                type: { numeric: true },
                                suppressFormatPainterCopy: true,
                            },
                            axisType: {
                                displayName: 'Type',
                                type: { enumeration: axisType.type },
                            },
                            showAxisTitle: {
                                displayName: 'Title',
                                description: 'Title for X-Axis',
                                type: { bool: true }
                            },
                            axisStyle: {
                                displayName: 'Style',
                                type: { enumeration: axisStyle.type }
                            },
                            labelColor: {
                                displayName: 'Color',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'DisplayUnits',
                                type: { formatting: { labelDisplayUnits: true } },
                            },
                            labelPrecision: {
                                displayName: 'Decimal places',
                                placeHolderText: 'Auto',
                                type: { numeric: true },
                            },
                        }
                    },
                    sampleFilter: {
                        displayName: 'Sample filter',
                        properties: {
                            show:{
                                displayName: 'Show',
                                type: { bool: true },
                            }
                        }
                    },
                    textWrap: {
                        displayName: 'X-Axis text wrap',
                        properties: {
                            show:{
                                displayName: 'Show',
                                type: { bool: true },
                            }
                        }
                    },
                    measureTitles: {
                        displayName: 'Measure Titles',
                        properties: {
                            ellipses:{
                                displayName: 'Ellipses strength',
                                type: { text: true },
                                suppressFormatPainterCopy: true
                            }
                        }
                    },
                    valueAxis: {
                        displayName: 'Y Axis',
                        properties: {
                            show: {
                                displayName: 'Show',
                                type: { bool: true },
                            },
                            position: {
                                displayName: 'Position',
                                description: 'Select left or right',
                                type: { enumeration: yAxisPosition.type },
                            },
                            axisScale: {
                                displayName: 'Scale type',
                                type: { enumeration: axisScale.type }
                            },
                            start: {
                                displayName: 'Start',
                                type: { numeric: true },
                                placeHolderText: 'Auto',
                                suppressFormatPainterCopy: true,
                            },
                            end: {
                                displayName: 'End',
                                type: { numeric: true },
                                placeHolderText: 'Auto',
                                suppressFormatPainterCopy: true,
                            },
                            intersection: {
                                displayName: 'Intersection',
                                type: { numeric: true },
                                placeHolderText: 'Auto',
                            },
                            showAxisTitle: {
                                displayName: 'Title',
                                description: 'Title for Y-Axis',
                                type: { bool: true }
                            },
                            axisStyle: {
                                displayName: 'Style',
                                type: { enumeration: axisStyle.type }
                            },
                            labelColor: {
                                displayName: 'Color',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                type: { formatting: { labelDisplayUnits: true } },
                            },
                            labelPrecision: {
                                displayName: 'Decimal places',
                                placeHolderText: 'Auto',
                                type: { numeric: true },
                            },
    
                        }
                    },
                    dataPoint: {
                        displayName: 'Data colors',
                        description: 'Display data color options',
                        properties: {
                            defaultColor: {
                                displayName: 'Default color',
                                type: { fill: { solid: { color: true } } }
                            },
                            showAllDataPoints: {
                                displayName: 'Show All',
                                type: { bool: true }
                            },
                            fill: {
                                displayName: 'Color',
                                type: { fill: { solid: { color: true } } }
                            },
                            fillRule: {
                                displayName: 'Gradient',
                                type: { fillRule: {} },
                                rule: {
                                    inputRole: 'Gradient',
                                    output: {
                                        property: 'fill',
                                        selector: ['Category'],
                                    },
                                },
                            }
                        }
                    },
                    labels: {
                        displayName: 'Data labels',
                        description: 'Display data label options',
                        properties: {
                            show: {
                                displayName: 'Show',
                                type: { bool: true }
                            },
                            showSeries: {
                                displayName: 'Show',
                                type: { bool: true }
                            },
                            color: {
                                displayName: 'Color',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display units',
                                type: { formatting: { labelDisplayUnits: true } },
                                suppressFormatPainterCopy: true
                            },
                            labelPrecision: {
                                displayName: 'Decimal places',
                                placeHolderText: 'Auto',
                                type: { numeric: true },
                                suppressFormatPainterCopy: true
                            },
                            showAll: {
                                displayName: 'ShowAll',
                                type: { bool: true }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                type: { formatting: { fontSize: true } }
                            },
                        },
                    },
                    totalLabels: {
                        displayName: 'Total Labels',
                        description: 'Display total label options',
                        properties: {
                            show: {
                                displayName: 'Show',
                                type: { bool: true }
                            },
                            titleText: {
                                displayName: 'Title Text',
                                description: 'Total title text',
                                type: { text: true },
                                suppressFormatPainterCopy: true
                            },
                            color: {
                                displayName: 'Color',
                                description: 'Select color for total labels',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                description: 'Select units (millions, billions, etc.)',
                                type: { formatting: { labelDisplayUnits: true } }
                            },
                            labelPrecision: {
                                displayName: 'Decimal Places',
                                description: 'Select the number of decimal places to display',
                                type: { numeric: true }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                description: 'Font size for labels',
                                type: { formatting: { fontSize: true } }
                            },
                        },
                    },
                    secondaryLabels: {
                        displayName: 'Secondary Labels',
                        description: 'Display secondary label options',
                        properties: {
                            titleText: {
                                displayName: 'Title Text',
                                description: 'Secondary title text',
                                type: { text: true },
                                suppressFormatPainterCopy: true
                            },
                            color: {
                                displayName: 'Color',
                                description: 'Select color for secondary labels',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                description: 'Select units (millions, billions, etc.)',
                                type: { formatting: { labelDisplayUnits: true } }
                            },
                            labelPrecision: {
                                displayName: 'Decimal Places',
                                description: 'Select the number of decimal places to display',
                                type: { numeric: true }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                type: { formatting: { fontSize: true } }
                            },
                        },
                    },
                    tertiaryLabels: {
                        displayName: 'Tertiary Labels',
                        description: 'Display tertiary label options',
                        properties: {
                            titleText: {
                                displayName: 'Title Text',
                                description: 'Tertiary title text',
                                type: { text: true },
                                suppressFormatPainterCopy: true
                            },
                            color: {
                                displayName: 'Color',
                                description: 'Select color for tertiary labels',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                description: 'Select units (millions, billions, etc.)',
                                type: { formatting: { labelDisplayUnits: true } }
                            },
                            labelPrecision: {
                                displayName: 'Decimal Places',
                                description: 'Select the number of decimal places to display',
                                type: { numeric: true }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                type: { formatting: { fontSize: true } }
                            },
                        },
                    },
                    quaternaryLabels: {
                        displayName: 'Quaternary Labels',
                        description: 'Display quarternary label options',
                        properties: {
                            titleText: {
                                displayName: 'Title Text',
                                description: 'Quarternary title text',
                                type: { text: true },
                                suppressFormatPainterCopy: true
                            },
                            color: {
                                displayName: 'Color',
                                description: 'Select color for quaternary labels',
                                type: { fill: { solid: { color: true } } }
                            },
                            labelDisplayUnits: {
                                displayName: 'Display Units',
                                description: 'Select units (millions, billions, etc.)',
                                type: { formatting: { labelDisplayUnits: true } }
                            },
                            labelPrecision: {
                                displayName: 'Decimal Places',
                                description: 'Select the number of decimal places to display',
                                type: { numeric: true }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                type: { formatting: { fontSize: true } }
                            },
                        },
                    },
                    // indicators 
                    PMIndicator: {
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
                            PMThreshold: {
                                displayName: 'Threshold',
                                description: 'Threshold value for Primary Measure',
                                type: { numeric: true }
                            },
                        },
                    },
                    GMOColumnChartTitle: {
                        displayName: 'Stacked Chart Title',
                        properties: {
                            show: {
                                displayName: data.createDisplayNameGetter('Visual_Show'),
                                type: { bool: true }
                            },
                            titleText: {
                                displayName: 'Title Text',
                                description: 'The name of the visual',
                                type: { text: true }
                            },
                            fill1: {
                                displayName: 'Font color',
                                description: 'Font color for the GMO Stacked Chart title',
                                type: { fill: { solid: { color: true } } }
                            },
                            fontSize: {
                                displayName: 'Text Size',
                                description: 'Font size for the GMO Stacked Chart title',
                                type: { formatting: { fontSize: true } }
                            },
                            backgroundColor: {
                                displayName: 'Background color',
                                description: 'Background color for the GMO Stacked Chart title',
                                type: { fill: { solid: { color: true } } }
                            },
                            tooltipText: {
                                displayName: 'Tooltip Text',
                                description: 'Tooltip text for the GMO Stacked Chart title',
                                type: { text: true }
                            }
                        }
                    },
                    plotArea: {
                        displayName: data.createDisplayNameGetter('Visual_Plot'),
                        properties: {
                            transparency: {
                                displayName: data.createDisplayNameGetter('Visual_Background_Transparency'),
                                type: { numeric: true },
                            },
                            image: {
                                type: { image: {} },
                            },
                        },
                    },
                    title: {
                        displayName: 'Title',
                        properties: {
                            showTooltip: {
                                displayName: data.createDisplayNameGetter('Visual_Show'),
                                type: { bool: true }
                            },
                            tooltipText: {
                                displayName: 'Tooltip Text',
                                description: 'Tooltip text for the GMO  title',
                                type: { text: true }
                            }
    
                        },
                    }
                },
                // go here
                dataRoles: [
                    {
                        name: 'Category',
                        kind: VisualDataRoleKind.Grouping,
                        displayName: 'Axis',
                    }, {
                        name: 'Series',
                        kind: VisualDataRoleKind.Grouping,
                        displayName: 'Legend',
                    }, {
                        name: 'Y',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Primary Measure',
                        description: 'Primary Measure',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }, {
                        name: 'SecondaryMeasure',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Secondary Measure',
                        description: 'Secondary Measure',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }, {
                        name: 'TertiaryMeasure',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Tertiary Measure',
                        description: 'Tertiary Measure',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }, {
                        name: 'QuaternaryMeasure',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Quaternary Measure',
                        description: 'Quaternary Measure',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }, {
                        name: 'SampleSize',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Sample Size',
                        description: 'Sample Size',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }, {
                        name: 'Gradient',
                        kind: VisualDataRoleKind.Measure,
                        displayName: 'Gradient',
                        requiredTypes: [{ numeric: true }, { integer: true }],
                    }
                ],
                dataViewMappings: [{
                    conditions: [
                        { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 }, 'TertiaryMeasure': { max: 1 }, 'QuaternaryMeasure': { max: 1 }, 'SampleSize': { max: 1 }, 'Gradient': { max: 1 }}
                    ],
                    categorical: {
                        categories: {
                            for: { in: 'Category' },
                            dataReductionAlgorithm: { top: {} }
                        },
                        values: {
                            group: {
                                by: 'Series',
                                select: [{ for: { in: 'Y' } }, { bind: { to: 'Gradient' } }],
                                dataReductionAlgorithm: { top: {} }
                            }            
                        },
                        rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                    }
                },
                //Secondary measure
                {
                    conditions: [
                        { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 }, 'TertiaryMeasure': { max: 1 }, 'QuaternaryMeasure': { max: 1 }, 'SampleSize': { max: 1 }, 'Gradient': { max: 1 }}
                    ],
                    categorical: {
                        values: {
                            select: [{ bind: { to: 'SecondaryMeasure' } }]
                        },
                        rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                    }
                },
                //Sample size
                {
                    conditions: [
                        { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 }, 'TertiaryMeasure': { max: 1 }, 'QuaternaryMeasure': { max: 1 }, 'SampleSize': { max: 1 }, 'Gradient': { max: 1 } }
                    ],
                    categorical: {
                        values: {
                            select: [{ bind: { to: 'SampleSize' } }]
                        },
                        rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                    }
                },
                //Ternary measure
                {
                    conditions: [
                        { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 }, 'TertiaryMeasure': { max: 1 }, 'QuaternaryMeasure': { max: 1 }, 'SampleSize': { max: 1 }, 'Gradient': { max: 1 }}
                    ],
                    categorical: {
                        values: {
                            select: [{ bind: { to: 'TertiaryMeasure' } }]
                        },
                        rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                    }
                },
                //Quarternary measure
                {
                    conditions: [
                        { 'Category': { max: 1 }, 'Series': { max: 1 }, 'Y': { max: 1 }, 'SecondaryMeasure': { max: 1 }, 'TertiaryMeasure': { max: 1 }, 'QuaternaryMeasure': { max: 1 }, 'SampleSize': { max: 1 }, 'Gradient': { max: 1 }}
                    ],
                    categorical: {
                        values: {
                            select: [{ bind: { to: 'QuaternaryMeasure' } }]
                        },
                        rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                    }
                }
                ],
                // MAQCode
                suppressDefaultTitle: true,
                supportsHighlight: true,
                sorting: {
                    default: {},
                },
                drilldown: {
                    roles: ['Category']
                },
            };
    
            constructor(options: VisualConstructorOptions) {
                this.root = d3.select(options.element);
                this.style = options.style;
                this.viewport = _.clone(options.viewport);
                this.hostService = options.host;
                this.interactivity = options.interactivity;
                this.colors = this.style.colorPalette.dataColors;
                this.interactivityService = powerbi.extensibility.utils.interactivity.createInteractivityService(this.hostService);
                this.options = options;
    
                d3.select(options.element)
                    .append('div')
                    .classed('Title_Div_Text', true)
                    .style({ 'width': '100%', 'display': 'inline-block', 'position': 'static' })
                    .html('<div class = "GMOColumnChartTitleDiv" style = "max-width: 80%; overflow: hidden; -ms-text-overflow: ellipsis;-o-text-overflow: ellipsis; text-overflow: ellipsis; white-space: nowrap; display: inline-block">' + '</div>'
                    + '<span class = "GMOColumnChartTitleIcon" style = "width: 2%; cursor: pointer; position: absolute">&nbsp(&#063;)</span>');
                d3.select(options.element)
                    .append('div')
                    .classed('EmptyDiv', true)
                    .style({ 'width': '100%', 'position': 'relative', 'visibility': 'hidden', 'height': '8px' })
                    .html('.');
    
                d3.select(options.element)
                    .append('div')
                    .classed('errorMessage', true)
                    .text("Please select 'Primary Measure' value")
                    .style({
                    'display': 'none', 'text-align': 'center'
                    , 'top': this.viewport.height / 2 + 'px', 'position': 'relative'
                    , 'width': '100%'
                });
    
                this.svg = d3.select(options.element)
                    .append('svg')
                    .style('position', 'absolute').classed('cartesianChart', true);
                this.margin = {
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1
                };
                this.yAxisOrientation = yAxisPosition.left;
                var element = this.element = options.element;
                element.addClass(StackedChartGMO.ColumnChartClassName);
                this.adjustMargins();
                var showLinesOnX = this.scrollY = true;
    
                var showLinesOnY = this.scrollX = true;
    
                this.mainGraphicsContext = this.svg.append('g').classed('columnChartMainGraphicsContext', true);
                this.labelGraphicsContext = this.svg.append('g').classed(NewDataLabelUtils.labelGraphicsContextClass.class, true);
                var axisGraphicsContext = this.axisGraphicsContext = this.svg.append('g')
                    .classed(this.AxisGraphicsContextClassName, true);
    
                this.svgScrollable = this.svg.append('svg')
                    .classed('svgScrollable', true)
                    .style('overflow', 'hidden');
    
                var axisGraphicsContextScrollable = this.axisGraphicsContextScrollable = this.svgScrollable.append('g')
                    .classed(this.AxisGraphicsContextClassName, true);
    
                this.clearCatcher = appendClearCatcher(this.axisGraphicsContextScrollable);
                var axisGroup = showLinesOnX ? axisGraphicsContextScrollable : axisGraphicsContext;
    
                this.backgroundGraphicsContext = axisGraphicsContext.append('svg:image');
                this.xAxisGraphicsContext = axisGroup.append('g').attr('class', 'x axis');
                this.y1AxisGraphicsContext = axisGroup.append('g').attr('class', 'y axis');
    
                this.xAxisGraphicsContext.classed('showLinesOnAxis', showLinesOnX);
                this.y1AxisGraphicsContext.classed('showLinesOnAxis', showLinesOnY);
    
                this.xAxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnX);
                this.y1AxisGraphicsContext.classed('hideLinesOnAxis', !showLinesOnY);
                this.interactivityService = powerbi.extensibility.utils.interactivity.createInteractivityService(this.hostService);
                this.isComboChart = false;
                this.mainGraphicsG = this.axisGraphicsContextScrollable.append('g')
                    .classed(StackedChartGMO.MainGraphicsContextClassName, true);
                this.mainGraphicsContext = this.mainGraphicsG.append('svg');
                this.sharedColorPalette = new SharedColorPalette(options.style.colorPalette.dataColors);
                this.legend = new GMOSVGLegend(element, LegendPosition.Top, this.interactivityService, true);
            }
            public update(options: VisualUpdateOptions) {
                //data labels
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext > .dataLabels >.dataLabel').remove();
                //total, secondary, tertiary and quarternay
                this.root.selectAll('.cartesianChart > .measureLabelTitle').remove();
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .totalLabels').remove();
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .secLabels').remove();
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .terLabels').remove();
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .quatLabels').remove();
                
                this.updateCount++;
                debug.assertValue(options, 'options');
                this.isPrimaryMeasure = false;
                this.isLegendValue = false;
                this.isAxistype = false;
                this.isSecondaryMeasure = false;
                this.isSameAxis = false;
                var dataViews = options.dataViews;
                this.viewport = (options.viewport);
                var iterator = 0, axisIterator = 0, legendIterator = 0;
                if (!dataViews || 0 === dataViews.length) {
                    this.updateCount = 0;
                    this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' });
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.svg.style({ 'display': 'none' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    return;
                }
                else if (dataViews.length !== 0 && dataViews[0].metadata.columns.length === 0){
                    this.updateCount = 0;
                    this.root.select('.errorMessage')[0][0].innerHTML = 'No data available';
                    this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' });
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.svg.style({ 'display': 'none' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    return;
                }
                else if (dataViews[0].categorical.categories && dataViews[0].categorical.categories[0].values.length == 0 && dataViews[0].categorical.values && dataViews[0].categorical.values[0].values.length == 0){
                    this.updateCount = 0;
                    this.root.select('.errorMessage')[0][0].innerHTML = 'No data available';
                    this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' });
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.svg.style({ 'display': 'none' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    return;
                }  
                
                if (dataViews[0] && dataViews[0].metadata && dataViews[0].metadata.columns) {
                    for (var i = 0; i < dataViews[0].metadata.columns.length; i++) {
                        if (dataViews[0].metadata.columns[i].roles && dataViews[0].metadata.columns[i].roles.hasOwnProperty('Y')) {
                            this.isPrimaryMeasure = true;
                        }
                        if (dataViews[0].metadata.columns[i].roles && dataViews[0].metadata.columns[i].roles.hasOwnProperty('Category') && !axisIterator) {
                            this.isAxistype = true;
                            var axisName = dataViews[0].metadata.columns[i].displayName;
                            axisIterator++;
    
                        }
                        if (dataViews[0].metadata.columns[i].roles && dataViews[0].metadata.columns[i].roles.hasOwnProperty('Series') && !legendIterator) {
                            var legendName = dataViews[0].metadata.columns[i].displayName;
                            legendIterator++;
                        }
                    }
                }
                var resize: boolean = false;
                if (this.dataView && this.dataView === options.dataViews[0]) {
                    resize = true;
                }
                this.dataView = options.dataViews[0];
                this.dataViews = options.dataViews;
                
                this.chartType = ColumnChartType.hundredPercentStackedColumn;
                this.svg.selectAll('.columnChartMainGraphicsContext').remove();
                this.mainGraphicsContext = this.svg.append('g').classed('columnChartMainGraphicsContext', true);
                this.axisGraphicsContextScrollable.selectAll('.' + StackedChartGMO.MainGraphicsContextClassName).remove();
                this.mainGraphicsG = this.axisGraphicsContextScrollable.append('g')
                    .classed(StackedChartGMO.MainGraphicsContextClassName, true);
                this.mainGraphicsContext = this.mainGraphicsG.append('svg');
    
                if (axisName === legendName)
                    this.isSameAxis = true;
                else
                    this.isSameAxis = false;
                 
                if (!this.isPrimaryMeasure) {
                    this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' });
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.svg.style({ 'display': 'none' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    return;
                }
                else {
                    this.root.select('.errorMessage').style({ 'display': 'none' });
                    this.root.select('.legend').style({ 'display': 'inherit' });
                    this.svg.style({ 'display': 'block' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'inline-block' });
                }
    
                if (dataViews[0] && dataViews[0].categorical && dataViews[0].categorical.values && dataViews[0].categorical.values.source && dataViews[0].categorical.values.source.roles) {
                    if (dataViews[0].categorical.values.source.roles.hasOwnProperty('Series'))
                        this.isLegendValue = true;
                }
                
                if (dataViews && dataViews.length > 0) {
                    this.populateObjectProperties(dataViews);
                }
                // MAQ Code
                var GMOColumnChartTitleOnOffStatus: IDataLabelSettings = false
                    , titleText: IDataLabelSettings = ""
                    , tooltiptext: IDataLabelSettings = ""
                    , titlefontsize
    
                    , titlecolor: IDataLabelSettings
                    , titlebgcolor: IDataLabelSettings;
    
                if (this.getShowTitle(this.dataView)) {
                    GMOColumnChartTitleOnOffStatus = true;
                }
    
                if (this.getTitleText(this.dataView)) {
                    titleText = this.getTitleText(this.dataView);
                }
    
                if (this.getTooltipText(this.dataView)) {
                    tooltiptext = this.getTooltipText(this.dataView);
                }
    
                titlefontsize = this.getTitleSize(this.dataView);
                if (!titlefontsize) titlefontsize = 12;
    
                if (this.getTitleFill(this.dataView)) {
                    titlecolor = this.getTitleFill(this.dataView).solid.color;
                }
                if (this.getTitleBgcolor(this.dataView)) {
                    titlebgcolor = this.getTitleBgcolor(this.dataView).solid.color;
                    if ("none" === titlebgcolor) {
                        titlebgcolor = "#ffffff";
                    }
                }
                this.root.select('.GMOColumnChartTitleDiv')
                    .text(titleText);
    
                this.root.select('.GMOColumnChartTitleIcon').style({ 'display': 'none' });
    
                if ("" !== tooltiptext && (1 !== this.updateCount || "" !== titleText)) {
                    this.root.select('.GMOColumnChartTitleIcon')
                        .style({ 'display': 'inline-block' })
                        .attr('title', tooltiptext);
                }
    
                // MAQ Code Ends
                this.setData(dataViews);
                if (this.data.categories.length == 0) {
                    this.updateCount = 0;
                    this.root.select('.errorMessage')[0][0].innerHTML = 'Statistically Insignificant Data';
                    this.root.select('.errorMessage').style({ 'display': 'block', 'top': this.viewport.height / 2 + 'px' });
                    this.root.select('.legend').style({ 'display': 'none' });
                    this.svg.style({ 'display': 'none' });
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    return;
                }
                
                if (dataViews && dataViews.length > 0) {
                    var dataViewMetadata = dataViews[0].metadata;
                    var dataView = dataViews[0];
                    if (dataViewMetadata) {
                        this.y1AxisReferenceLines = DataViewObjects.getUserDefinedObjects(dataViewMetadata.objects, 'y1AxisReferenceLine');
                        this.background = {
                            image: DataViewObjects.getValue<ImageValue>(dataView.metadata.objects, scatterChartProps.plotArea.image),
                            transparency: DataViewObjects.getValue(dataView.metadata.objects, scatterChartProps.plotArea.transparency, visualBackgroundHelper.getDefaultTransparency()),
                        };
                    }
                }
                if (options && options.dataViews[0] && options.dataViews[0].metadata) {
                    var xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(options.dataViews[0].metadata);
                    var valueAxisProperties = CartesianHelper.getValueAxisProperties(options.dataViews[0].metadata);
                }
                this.visualOptions = {
                    viewport: this.viewport,
                    margin: this.margin,
                    forcedXDomain: [xAxisCardProperties ? xAxisCardProperties['start'] : null, xAxisCardProperties ? xAxisCardProperties['end'] : null],
                    forceMerge: valueAxisProperties && valueAxisProperties['secShow'] === false,
                    showCategoryAxisLabel: true,
                    showValueAxisLabel: true,
                    trimOrdinalDataOnOverflow: undefined,
                    categoryAxisScaleType: xAxisCardProperties && xAxisCardProperties['axisScale'] != null ? <string>xAxisCardProperties['axisScale'] : axisScale.linear,
                    valueAxisScaleType: valueAxisProperties && valueAxisProperties['axisScale'] != null ? <string>valueAxisProperties['axisScale'] : axisScale.linear,
                    categoryAxisDisplayUnits: xAxisCardProperties && xAxisCardProperties['labelDisplayUnits'] != null ? <number>xAxisCardProperties['labelDisplayUnits'] : 0,
                    valueAxisDisplayUnits: valueAxisProperties && valueAxisProperties['labelDisplayUnits'] != null ? <number>valueAxisProperties['labelDisplayUnits'] : 0,
                    categoryAxisPrecision: xAxisCardProperties ? CartesianHelper.getPrecision(xAxisCardProperties['labelPrecision']) : null,
                    valueAxisPrecision: valueAxisProperties ? CartesianHelper.getPrecision(valueAxisProperties['labelPrecision']) : null,
                    playAxisControlLayout: undefined,
                };
    
                if (GMOColumnChartTitleOnOffStatus && (titleText || tooltiptext)) {
                    this.root.select('.Title_Div_Text').style({ 'display': 'inline-block', 'background-color': titlebgcolor, 'font-size': PixelConverter.fromPointToPixel(titlefontsize) + 'px', 'color': titlecolor });
    
                    var legendPosition = parseFloat(this.root.select('.legend').attr('orientation'));
                    var customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height'));
                    var legendHeight = parseFloat(this.root.select('.legend').style('height'));
                    var legendWidth = parseFloat(this.root.select('.legend').style('width'));
    
                    if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                        legendHeight = 0;
    
                    }
                    if (isNaN(customTitleHeight)) {
                        customTitleHeight = 0;
                    }
                    customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight);
                    legendHeight = PixelConverter.fromPointToPixel(legendHeight);
                    if (1 === legendPosition || 6 === legendPosition) {
                        this.root.select('.legend').style({ 'padding-top': 0 + 'px' });
                    }
                    else {
                        this.root.select('.legend').style({ 'padding-top': 0 + 'px' });
                    }
                    var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                    if (isBarChart) {
                        if (this.isSecondaryMeasure && legendIterator === 1)
                            this.svg.style({ 'position': 'absolute', 'padding-top': (10) + "px" });
                        else
                            this.svg.style({ 'position': 'absolute', 'padding-top': 0 + 'px' });
                    }
                    else {
                        this.svg.style({ 'position': 'absolute', 'padding-top': 0 + 'px' });
                    }
                }
                else {
                    this.root.select('.Title_Div_Text').style({ 'display': 'none' });
                    this.root.select('.legend').style({ 'padding': '0px' });
                    this.svg.style({ 'position': 'absolute' });
                }
    
                if (!(this.options.interactivity && this.options.interactivity.isInteractiveLegend)) {
                    this.renderLegend();
                }
                this.margin = this.visualOptions.margin;
                this.calculateAxesProperties(this.visualOptions);
                
                this.render(true, resize);
                
            }
            private shouldRenderAxis(axisProperties: IAxisProperties, propertyName: string = "show"): boolean {
                if (!axisProperties) {
                    return false;
                }
                else if (axisProperties.isCategoryAxis && (!this.categoryAxisProperties || this.categoryAxisProperties[propertyName] == null || this.categoryAxisProperties[propertyName])) {
                    return axisProperties.values && axisProperties.values.length > 0;
                }
                else if (!axisProperties.isCategoryAxis && (!this.valueAxisProperties || this.valueAxisProperties[propertyName] == null || this.valueAxisProperties[propertyName])) {
                    return axisProperties.values && axisProperties.values.length > 0;
                }
    
                return false;
            }
            private populateObjectProperties(dataViews: DataView[]) {
                if (dataViews && dataViews.length > 0) {
                    var dataViewMetadata = dataViews[0].metadata;
    
                    if (dataViewMetadata) {
                        this.legendObjectProperties = DataViewObjects.getObject(dataViewMetadata.objects, 'legend', {});
                    }
                    else {
                        this.legendObjectProperties = {};
                    }
                    this.categoryAxisProperties = this.getCategoryAxisProperties(dataViewMetadata);
                    this.valueAxisProperties = this.getValueAxisProperties(dataViewMetadata);
                    var axisPosition = this.valueAxisProperties['position'];
                    this.yAxisOrientation = axisPosition ? axisPosition.toString() : yAxisPosition.left;
                }
            }
            private getValueAxisProperties(dataViewMetadata: DataViewMetadata, axisTitleOnByDefault?: boolean): DataViewObject {
                var toReturn: DataViewObject = {};
                if (!dataViewMetadata)
                    return toReturn;
    
                var objects = dataViewMetadata.objects;
    
                if (objects) {
                    var valueAxisObject = objects['valueAxis'];
                    if (valueAxisObject) {
                        toReturn = {
                            show: valueAxisObject['show'],
                            position: valueAxisObject['position'],
                            axisScale: valueAxisObject['axisScale'],
                            start: valueAxisObject['start'],
                            end: valueAxisObject['end'],
                            showAxisTitle: valueAxisObject['showAxisTitle'] == null ? axisTitleOnByDefault : valueAxisObject['showAxisTitle'],
                            axisStyle: valueAxisObject['axisStyle'],
                            axisColor: valueAxisObject['axisColor'],
                            secShow: valueAxisObject['secShow'],
                            secPosition: valueAxisObject['secPosition'],
                            secAxisScale: valueAxisObject['secAxisScale'],
                            secStart: valueAxisObject['secStart'],
                            secEnd: valueAxisObject['secEnd'],
                            secShowAxisTitle: valueAxisObject['secShowAxisTitle'],
                            secAxisStyle: valueAxisObject['secAxisStyle'],
                            labelDisplayUnits: valueAxisObject['labelDisplayUnits'],
                        };
                    }
                }
                return toReturn;
            }
    
            private getCategoryAxisProperties(dataViewMetadata: DataViewMetadata, axisTitleOnByDefault?: boolean): DataViewObject {
                var toReturn: DataViewObject = {};
                if (!dataViewMetadata)
                    return toReturn;
    
                var objects = dataViewMetadata.objects;
    
                if (objects) {
                    var categoryAxisObject = objects['categoryAxis'];
    
                    if (categoryAxisObject) {
                        toReturn = {
                            show: categoryAxisObject['show'],
                            axisType: categoryAxisObject['axisType'],
                            axisScale: categoryAxisObject['axisScale'],
                            axisColor: categoryAxisObject['axisColor'],
                            start: categoryAxisObject['start'],
                            end: categoryAxisObject['end'],
                            showAxisTitle: categoryAxisObject['showAxisTitle'] == null ? axisTitleOnByDefault : categoryAxisObject['showAxisTitle'],
                            axisStyle: categoryAxisObject['axisStyle'],
                            labelDisplayUnits: categoryAxisObject['labelDisplayUnits']
                        };
                    }
                }
                return toReturn;
            }
            private renderLegend(): void {
                var legendData: LegendData = { title: "", dataPoints: [] };
                var legend: IGMOLegend = this.legend;
    
                this.layerLegendData = this.data.legendData;
                if (this.layerLegendData) {
                    legendData.title = this.layerLegendData.title || "";
                    legendData.labelColor = this.layerLegendData.labelColor;
                    legendData.dataPoints = legendData.dataPoints.concat(this.layerLegendData.dataPoints || []);
                    legendData.fontSize = this.legendLabelFontSize ? this.legendLabelFontSize : StackedChartGMO.LegendLabelFontSizeDefault;
                    if (this.layerLegendData.grouped) {
                        legendData.grouped = true;
                    }
                }
                var legendProperties = this.legendObjectProperties;
                var showPrimaryMeasure;
                if (this.isPrimaryMeasure) {
                    showPrimaryMeasure = 'Value';
                }
                else {
                    showPrimaryMeasure = 'None';
                }
                if (this.layerLegendData) {
                    if (this.isPrimaryMeasure) {
                        legendData['primaryTitle'] = this.getLegendTitle('primaryTitle', showPrimaryMeasure);
                    }
                }
    
                if (legendProperties) {
                    LegendData.update(legendData, legendProperties);
                    var position = <string>legendProperties[legendProps.position];
    
                    if (position)
                        legend.changeOrientation(LegendPosition[position]);
                }
                else {
                    legend.changeOrientation(LegendPosition.Top);
                }
    
                if ((legendData.dataPoints.length === 1 && !legendData.grouped) || this.hideLegends()) {
                    legendData.dataPoints = [];
                }
                legend.drawLegendInternal(
                    legendData, this.viewport, true, showPrimaryMeasure /* perform auto width */);
                
                var customTitleHeight = isNaN(parseFloat(this.root.select('.Title_Div_Text').style('height'))) ? 0 : parseFloat(this.root.select('.Title_Div_Text').style('height'));
                legend['viewport'].height += customTitleHeight;
                Legend.positionChartArea(this.svg, legend);
            }
            
            public getLegendTitle(name, showPrimaryMeasure): string {
                switch (name) {
                    case 'title':
                        // If category exists, we render title using category source. If not, we render title
                        // using measure.
                               
                        var dvCategorySourceName = this.dataView.categorical.categories && this.dataView.categorical.categories.length > 0 && this.dataView.categorical.categories[0].source
                            ? this.dataView.categorical.categories[0].source.displayName : "";
                        if (this.dataView.categorical.categories[0].values) {
                            return dvCategorySourceName;
                        }
                        break;
                    case 'primaryTitle':
                        var source = this.dataView.categorical.values && (this.dataView.categorical.values[0].source || this.dataView.categorical.values[1].source);
                        var dvValuesSourceName: string = '';
                        if (source && showPrimaryMeasure && showPrimaryMeasure !== 'None') {
                            var index: number = this.dataView.categorical.values[0].source.roles.hasOwnProperty('Y') ? 0 : 1;
                            dvValuesSourceName = this.dataView.categorical.values[index].source.displayName;
                        }
    
                        return dvValuesSourceName;
                        break;
                }
            }
            private hideLegends(): boolean {
                if (this.cartesianSmallViewPortProperties) {
                    if (this.cartesianSmallViewPortProperties.hideLegendOnSmallViewPort && (this.viewport.height < this.cartesianSmallViewPortProperties.MinHeightLegendVisible)) {
                        return true;
                    }
                }
                return false;
            }
            private getCategoryLayout(numCategoryValues: number, options: CalculateScaleAndDomainOptions): CategoryLayout {
                var availableWidth: number;
                var legendPosition = parseFloat(this.root.select('.legend').attr('orientation'));
    
                var customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height'));
                if (isNaN(customTitleHeight)) {
                    customTitleHeight = 0;
                }
    
                var legendHeight = parseFloat(this.root.select('.legend').style('height'));
                var legendWidth = parseFloat(this.root.select('.legend').style('width'));
    
                customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight);
    
                legendHeight = PixelConverter.fromPointToPixel(legendHeight);
                if (EnumExtensions.hasFlag(this.chartType, flagBar)) {
                    if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                        legendHeight = 0;
                    }
                    if(this.viewport.height>(this.margin.top + this.margin.bottom + customTitleHeight + legendHeight)){
                        availableWidth = this.viewport.height - (this.margin.top + this.margin.bottom + customTitleHeight + legendHeight);
                    }else{
                        availableWidth = -(this.viewport.height - (this.margin.top + this.margin.bottom + customTitleHeight + legendHeight));
                    }
                    
                }
                else {
                    if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(2 === legendPosition || 3 === legendPosition || 7 === legendPosition || 8 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                        legendWidth = 0;
                    }
                    if( this.viewport.width > (this.margin.left + this.margin.right + customTitleHeight + legendWidth)){
                        availableWidth = this.viewport.width - (this.margin.left + this.margin.right + customTitleHeight +legendWidth);
                    }else{
                        availableWidth = -(this.viewport.width - (this.margin.left + this.margin.right + customTitleHeight +legendWidth));
                    }
                    
                }
    
                var metaDataColumn = this.data ? this.data.categoryMetadata : undefined;
                var categoryDataType: ValueType = AxisHelper.getCategoryValueType(metaDataColumn);
                var isScalar = this.data ? this.data.scalarCategoryAxis : false;
                var domain = AxisHelper.createDomain(this.data.series, categoryDataType, isScalar, options.forcedXDomain);
                return CartesianChartGMO.getLayout(
                    this.data,
                    {
                        availableWidth: availableWidth,
                        categoryCount: numCategoryValues,
                        domain: domain,
                        isScalar: isScalar,
                        isScrollable: this.isScrollable,
                        trimOrdinalDataOnOverflow: options.trimOrdinalDataOnOverflow
                    });
            }
    public applyUserMinMax(isScalar: boolean, dataView: DataViewCategorical, xAxisCardProperties: DataViewObject): DataViewCategorical {
            if (isScalar) {
                let min = xAxisCardProperties['start'];
                let max = xAxisCardProperties['end'];

                return ColumnUtil.transformDomain(dataView, min, max);
            }

            return dataView;
        }
            public converter(
                dataViewAll: DataView[],
                dataView: DataViewCategorical,
                colors: IDataColorPalette,
                is100PercentStacked: boolean,
                isScalar: boolean = false,
                dataViewMetadata: DataViewMetadata = null,
                chartType?: ColumnChartType,
                interactivityService?: IInteractivityService): StackedChartGMOData {
                debug.assertValue(dataView, 'dataView');
                debug.assertValue(colors, 'colors');
                if (chartType == ColumnChartType.hundredPercentStackedBar || chartType == ColumnChartType.hundredPercentStackedColumn) {
                    is100PercentStacked = true;
                } else {
                    is100PercentStacked = false;
                }
                var xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(dataViewAll[0].metadata);
                var valueAxisProperties = CartesianHelper.getValueAxisProperties(dataViewAll[0].metadata);
                isScalar = CartesianHelper.isScalar(isScalar, xAxisCardProperties);
                dataView = ColumnUtil.applyUserMinMax(isScalar, dataView, xAxisCardProperties);
    
                var converterStrategy = new ColumnChartConverterHelper(dataView);
                var sampleFilterSettings: sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]);
                var categoryInfo = converterHelper.getPivotedCategories(dataView, columnChartProps.general.formatString);
                var categories = categoryInfo.categories,
                    categoryFormatter: IValueFormatter = categoryInfo.categoryFormatter,
                    categoryIdentities: DataViewScopeIdentity[] = categoryInfo.categoryIdentities,
                    categoryMetadata: DataViewMetadataColumn = dataView.categories && dataView.categories.length > 0 ? dataView.categories[0].source : undefined;
                var labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings = powerbi.extensibility.utils.chart.dataLabel.utils.getDefaultColumnLabelSettings(is100PercentStacked || EnumExtensions.hasFlag(chartType, flagStacked));
               
                var defaultLegendLabelColor = LegendData.DefaultLegendLabelFillColor;
                var defaultDataPointColor = undefined;
                var showAllDataPoints = undefined;
                if (dataViewMetadata && dataViewMetadata.objects) {
                    var objects = dataViewMetadata.objects;
    
                    defaultDataPointColor = DataViewObjects.getFillColor(objects, columnChartProps.dataPoint.defaultColor);
                    showAllDataPoints = DataViewObjects.getValue<boolean>(objects, columnChartProps.dataPoint.showAllDataPoints);
                    defaultLegendLabelColor = DataViewObjects.getFillColor(objects, columnChartProps.legend.labelColor, LegendData.DefaultLegendLabelFillColor);
    
                    var labelsObj = <powerbi.extensibility.utils.chart.dataLabel.DataLabelObject>objects['labels'];
                    
                    powerbi.extensibility.utils.chart.dataLabel.utils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
                    labelSettings.precision = 4;
                }
    
                // Allocate colors
                var legendAndSeriesInfo = converterStrategy.getLegend(colors, defaultLegendLabelColor, defaultDataPointColor);
                var legend: LegendDataPoint[] = legendAndSeriesInfo.legend.dataPoints;
                var seriesSources: DataViewMetadataColumn[] = legendAndSeriesInfo.seriesSources;
    
                // Determine data points
                var result = StackedChartGMO.createDataPoints(
                    dataView,
                    categories,
                    categoryIdentities,
                    legend,
                    legendAndSeriesInfo.seriesObjects,
                    converterStrategy,
                    labelSettings,
                    is100PercentStacked,
                    isScalar,
                    converterHelper.categoryIsAlsoSeriesRole(dataView, RoleNames.series, RoleNames.category),
                    categoryInfo.categoryObjects,
                    defaultDataPointColor,
                    chartType,
                    categoryMetadata);
                    
                var columnSeries: StackedChartGMOSeries[] = result.series;
				this.removeFlags = [];
                if(sampleFilterSettings.show){
                    var dataSeries = columnSeries.slice(0);
                    var dataCategories = categories.slice(0);
                    var aggregatedValues = [];
                    var sampleSize;
                    sampleSize = -9999;
                    if (dataViewAll[2] && dataViewAll[2].categorical && dataViewAll[2].categorical.values) {
                        for(var i = 0; i < dataViewAll[2].categorical.values[0].values.length; i++){
                            if(dataViewAll[2].categorical.values[0].values[i] !== null){
                                sampleSize = dataViewAll[2].categorical.values[0].values[i];
                                break;
                            }
                        }
                        for(var k = 0; k < dataCategories.length; k++){ //16
                            var sum = 0;
                            for (var i = 0; i < dataSeries.length; i++){ //14
                                for(var j = 0; j < dataCategories.length; j++){ //16
                                    if(dataSeries[i].data[j]){
                                        if(dataSeries[i].data[j].categoryValue == dataCategories[k]){
                                            sum = sum + dataSeries[i].data[j].valueOriginal;
                                            break;
                                        }
                                    }
                                    else{
                                        break;
                                    }
                                }
                            }
                            aggregatedValues.push(sum);
                        }
                        var newCategoryIndex = -1;
                        for(var k = aggregatedValues.length - 1; k >= 0; k--){ //16
                            if(aggregatedValues[k]<sampleSize){
								this.removeFlags.push(k);
                                for (var i = 0; i < dataSeries.length; i++){ //14
                                    for(var j = 0; j < dataCategories.length; j++){ //16
                                        if(dataSeries[i].data[j]){
                                            if(dataSeries[i].data[j].categoryValue == dataCategories[k]){
                                                dataSeries[i].data.splice(j,1);
                                                break;
                                            }
                                        }
                                        else{
                                            break;
                                        }
                                    }
                                }
                                aggregatedValues.splice(k,1);
                                dataCategories.splice(k,1);
                                //--k;
                            } //if
                        }
                        
                        var newCategoryIndex = -1;
                        for(var k = 0; k < aggregatedValues.length; k++){ //16
                            newCategoryIndex++;
                            for (var i = 0; i < dataSeries.length; i++){ //14
                                for(var j = 0; j < dataCategories.length; j++){ //16
                                    if(dataSeries[i].data[j]){
                                        if(dataSeries[i].data[j].categoryValue == dataCategories[k]){
                                            dataSeries[i].data[j].categoryIndex = newCategoryIndex;
                                            break;
                                        }
                                    }
                                    else{
                                        break;
                                    }
                                }
                            }
                        }
                            
                        
                    }
                }
                
                var valuesMetadata: DataViewMetadataColumn[] = [];
                for (var j = 0, jlen = legend.length; j < jlen; j++) {
                    valuesMetadata.push(seriesSources[j]);
                }
    
                var labels = converterHelper.createAxesLabels(xAxisCardProperties, valueAxisProperties, categoryMetadata, valuesMetadata);
    
                if (!EnumExtensions.hasFlag(chartType, flagColumn)) {
                    // Replace between x and y axes
                    var temp = labels.xAxisLabel;
                    labels.xAxisLabel = labels.yAxisLabel;
                    labels.yAxisLabel = temp;
                }
                return {
                    categories: sampleFilterSettings.show ? dataCategories : categories,
                    categoryFormatter: categoryFormatter,
                    series: sampleFilterSettings.show ? dataSeries : columnSeries,
                    valuesMetadata: valuesMetadata,
                    legendData: legendAndSeriesInfo.legend,
                    hasHighlights: result.hasHighlights,
                    categoryMetadata: categoryMetadata,
                    scalarCategoryAxis: isScalar,
                    labelSettings: labelSettings,
                    axesLabels: { x: labels.xAxisLabel, y: labels.yAxisLabel },
                    hasDynamicSeries: result.hasDynamicSeries,
                    isMultiMeasure: result.isMultiMeasure,
                    defaultDataPointColor: defaultDataPointColor,
                    showAllDataPoints: showAllDataPoints,
                };
            }
    
            private static canSupportOverflow(chartType: ColumnChartType, seriesCount: number): boolean {
                return !EnumExtensions.hasFlag(chartType, flagStacked) || seriesCount === 1;
            }
            
            private static getCategoryValueType(metadataColumn, isScalar?) {
                if (metadataColumn && StackedChartGMO.columnDataTypeHasValue(metadataColumn.type))
                    return metadataColumn.type;
                if (isScalar) {
                    return powerbi.ValueType.fromDescriptor({ numeric: true });
                }
                return powerbi.ValueType.fromDescriptor({ text: true });
            }
            
            private static columnDataTypeHasValue(dataType) {
                return dataType && (dataType.bool || dataType.numeric || dataType.text || dataType.dateTime);
            }
            
            private static isDateTime(type) {
                return !!(type && type.dateTime);
            }
                
            private static normalizeNonFiniteNumber(value: number) {
                if (isNaN(value))
                    return null;
                else if (value === Number.POSITIVE_INFINITY)
                    return Number.MAX_VALUE;
                else if (value === Number.NEGATIVE_INFINITY)
                    return -Number.MAX_VALUE;
                return value;
            }
            
            private static getStackedMultiplier(rawValues, // This is a 2D array of values that is series x category
                categoryIndex) {
                debug.assertValue(rawValues, 'rawValues');
                var pos = 0, neg = 0;
                for (var seriesIndex = 0, seriesCount = rawValues.length; seriesIndex < seriesCount; seriesIndex++) {
                    var value = rawValues[seriesIndex][categoryIndex];
                    value = StackedChartGMO.normalizeNonFiniteNumber(value);
                    if (value > 0)
                        pos += value;
                    else if (value < 0)
                        neg -= value;
                }
                var absTotal = pos + neg;
                return {
                    pos: pos ? (pos / absTotal) / pos : 1,
                    neg: neg ? (neg / absTotal) / neg : 1,
                };
            }
    
            private static createDataPoints(
                dataViewCat: DataViewCategorical,
                categories: any[],
                categoryIdentities: DataViewScopeIdentity[],
                legend: LegendDataPoint[],
                seriesObjectsList: DataViewObjects[][],
                converterStrategy: ColumnChartConverterHelper,
                defaultLabelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings,
                is100PercentStacked: boolean,
                isScalar: boolean = false,
                isCategoryAlsoSeries?: boolean,
                categoryObjectsList?: DataViewObjects[],
                defaultDataPointColor?: string,
                chartType?: ColumnChartType,
                categoryMetadata?: DataViewMetadataColumn): { series: StackedChartGMOSeries[]; hasHighlights: boolean; hasDynamicSeries: boolean; isMultiMeasure: boolean } {
                is100PercentStacked = true;
                
                var grouped = dataViewCat && dataViewCat.values ? dataViewCat.values.grouped() : undefined;
                var categoryCount = categories.length;
                var seriesCount = legend.length;
                var columnSeries: StackedChartGMOSeries[] = [];
    
                if (seriesCount < 1 || categoryCount < 1)
                    return { series: columnSeries, hasHighlights: false, hasDynamicSeries: false, isMultiMeasure: false };
    
                var dvCategories = dataViewCat.categories;
                categoryMetadata = (dvCategories && dvCategories.length > 0)
                    ? dvCategories[0].source
                    : null;
    
                var categoryType = StackedChartGMO.getCategoryValueType(categoryMetadata);
                var isDateTime = StackedChartGMO.isDateTime(categoryType);
                var baseValuesPos = [], baseValuesNeg = [];
    
                var rawValues: number[][] = [];
                var rawHighlightValues: number[][] = [];
    
                var hasDynamicSeries = !!(dataViewCat.values && dataViewCat.values.source);
                var isMultiMeasure = !hasDynamicSeries && seriesCount > 1;
    
                var highlightsOverflow = false; // Overflow means the highlight larger than value or the signs being different
                var hasHighlights = converterStrategy.hasHighlightValues(0);
                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var seriesValues = [];
                    var seriesHighlightValues = [];
                    for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                        var value = converterStrategy.getValueBySeriesAndCategory(seriesIndex, categoryIndex);
                        seriesValues[categoryIndex] = value;
                        if (hasHighlights) {
                            var highlightValue = converterStrategy.getHighlightBySeriesAndCategory(seriesIndex, categoryIndex);
                            seriesHighlightValues[categoryIndex] = highlightValue;
                            // There are two cases where we don't use overflow logic; if all are false, use overflow logic appropriate for the chart.
                            if (!((value >= 0 && highlightValue >= 0 && value >= highlightValue) || // Both positive; value greater than highlight
                                (value <= 0 && highlightValue <= 0 && value <= highlightValue))) { // Both negative; value less than highlight
                                highlightsOverflow = true;
                            }
                        }
                    }
                    rawValues.push(seriesValues);
                    if (hasHighlights) {
                        rawHighlightValues.push(seriesHighlightValues);
                    }
                }
    
                if (highlightsOverflow && !StackedChartGMO.canSupportOverflow(chartType, seriesCount)) {
                    highlightsOverflow = false;
                    hasHighlights = false;
                    rawValues = rawHighlightValues;
                }
    
                var dataPointObjects: DataViewObjects[] = categoryObjectsList,
                    formatStringProp = columnChartProps.general.formatString;
                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var seriesDataPoints: StackedChartGMODataPoint[] = [],
                        legendItem = legend[seriesIndex],
                        seriesLabelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings;
    
                    if (!hasDynamicSeries) {
                        var labelsSeriesGroup = grouped && grouped.length > 0 && grouped[0].values ? grouped[0].values[seriesIndex] : null;
                        var labelObjects = (labelsSeriesGroup && labelsSeriesGroup.source && labelsSeriesGroup.source.objects) ? <powerbi.extensibility.utils.chart.dataLabel.DataLabelObject>labelsSeriesGroup.source.objects['labels'] : null;
                        if (labelObjects) {
                            seriesLabelSettings = Prototype.inherit(defaultLabelSettings);
                            powerbi.extensibility.utils.chart.dataLabel.utils.updateLabelSettingsFromLabelsObject(labelObjects, seriesLabelSettings);
                        }
                    }
    
                    columnSeries.push({
                        displayName: legendItem.label,
                        key: 'series' + seriesIndex,
                        index: seriesIndex,
                        data: seriesDataPoints,
                        identity: legendItem.identity,
                        color: legendItem.color,
                        labelSettings: seriesLabelSettings,
                    });
    
                    if (seriesCount > 1)
                        dataPointObjects = seriesObjectsList[seriesIndex];
                    var metadata = dataViewCat.values[seriesIndex].source;
    
                    for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                        if (seriesIndex === 0) {
                            baseValuesPos.push(0);
                            baseValuesNeg.push(0);
                        }
    
                        var value = StackedChartGMO.normalizeNonFiniteNumber(rawValues[seriesIndex][categoryIndex]);
                        if (value == null) {
                            // Optimization: Ignore null dataPoints from the fabricated category/series combination in the self cross-join.
                            // However, we must retain the first series because it is used to compute things like axis scales, and value lookups.
                            if (seriesIndex > 0)
                                continue;
                        }
    
                        var originalValue: number = value;
                        var categoryValue = categories[categoryIndex];
    
                        // ignore variant measures
                        if (isDateTime && categoryValue != null && !(categoryValue instanceof Date))
                            continue;
    
                        if (isDateTime && categoryValue)
                            categoryValue = categoryValue.getTime();
                        if (isScalar && (categoryValue == null || isNaN(categoryValue)))
                            continue;
    
                        var multipliers: ValueMultiplers;
                        if (is100PercentStacked)
                            multipliers = StackedChartGMO.getStackedMultiplier(rawValues, categoryIndex);
    
                        var unadjustedValue = value,
                            isNegative = value < 0;
    
                        if (multipliers) {
                            if (isNegative)
                                value *= multipliers.neg;
                            else
                                value *= multipliers.pos;
                        }
    
                        var valueAbsolute = Math.abs(value);
                        var position: number;
                        if (isNegative) {
                            position = baseValuesNeg[categoryIndex];
    
                            if (!isNaN(valueAbsolute))
                                baseValuesNeg[categoryIndex] -= valueAbsolute;
                        }
                        else {
                            if (!isNaN(valueAbsolute))
                                baseValuesPos[categoryIndex] += valueAbsolute;
    
                            position = baseValuesPos[categoryIndex];
                        }
    
                        var seriesGroup = grouped && grouped.length > seriesIndex && grouped[seriesIndex].values ? grouped[seriesIndex].values[0] : null;
                        var category = dataViewCat.categories && dataViewCat.categories.length > 0 ? dataViewCat.categories[0] : null;
                        var ISelectionBldr : powerbi.extensibility.ISelectionIdBuilder;
                        var identity = ISelectionBldr
                                        .withCategory(category, categoryIndex)
                                        .withSeries(dataViewCat.values, seriesGroup)
                                        .withMeasure(converterStrategy.getMeasureNameByIndex(seriesIndex))
                                        .createSelectionId();
    
                        var rawCategoryValue = categories[categoryIndex];
                        var color = StackedChartGMO.getDataPointColor(legendItem, categoryIndex, dataPointObjects);
                        var tooltipInfo: TooltipDataItem[] =  powerbi.extensibility.  TooltipBuilder.createTooltipInfo(formatStringProp, dataViewCat, rawCategoryValue, originalValue, null, null, seriesIndex, categoryIndex);
                        var series = columnSeries[seriesIndex];
                        var dataPointLabelSettings = (series.labelSettings) ? series.labelSettings : defaultLabelSettings;
                        var labelColor = dataPointLabelSettings.labelColor;
                        var lastValue = undefined;
                        //Stacked column/bar label color is white by default (except last series)
                        if ((EnumExtensions.hasFlag(chartType, flagStacked))) {
                            lastValue = this.getStackedLabelColor(isNegative, seriesIndex, seriesCount, categoryIndex, rawValues);
                            labelColor = (lastValue || (seriesIndex === seriesCount - 1 && !isNegative)) ? labelColor : powerbi.extensibility.utils.chart.dataLabel.utils.defaultInsideLabelColor;
                        }
    
                        var dataPoint: StackedChartGMODataPoint = {
                            categoryValue: categoryValue,
                            value: value,
                            position: position,
                            valueAbsolute: valueAbsolute,
                            valueOriginal: unadjustedValue,
                            seriesIndex: seriesIndex,
                            labelSettings: dataPointLabelSettings,
                            categoryIndex: categoryIndex,
                            color: color,
                            selected: false,
                            originalValue: value,
                            originalPosition: position,
                            originalValueAbsolute: valueAbsolute,
                            identity: identity,
                            key: identity.getKey(),
                            tooltipInfo: tooltipInfo,
                            labelFill: labelColor,
                            labelFormatString: metadata.format,
                            lastSeries: lastValue,
                            chartType: chartType
                        };
    
                        seriesDataPoints.push(dataPoint);
    
                        if (hasHighlights) {
                            var valueHighlight = rawHighlightValues[seriesIndex][categoryIndex];
                            var unadjustedValueHighlight = valueHighlight;
    
                            var highlightedTooltip: boolean = true;
                            if (valueHighlight === null) {
                                valueHighlight = 0;
                                highlightedTooltip = false;
                            }
    
                            if (is100PercentStacked) {
                                valueHighlight *= multipliers.pos;
                            }
                            var absoluteValueHighlight = Math.abs(valueHighlight);
                            var highlightPosition = position;
    
                            if (valueHighlight > 0) {
                                highlightPosition -= valueAbsolute - absoluteValueHighlight;
                            }
                            else if (valueHighlight === 0 && value > 0) {
                                highlightPosition -= valueAbsolute;
                            }
    
                            var highlightIdentity = ISelectionId.createWithHighlight(identity);
                            var rawCategoryValue = categories[categoryIndex];
                            var highlightedValue: number = highlightedTooltip ? valueHighlight : undefined;
                            var tooltipInfo: TooltipDataItem[] =  TooltipBuilder.createTooltipInfo(formatStringProp, dataViewCat, rawCategoryValue, originalValue, null, null, seriesIndex, categoryIndex, highlightedValue);
    
                            if (highlightedTooltip) {
                                // Override non highlighted data point
                                dataPoint.tooltipInfo = tooltipInfo;
                            }
    
                            var highlightDataPoint: StackedChartGMODataPoint = {
                                categoryValue: categoryValue,
                                value: valueHighlight,
                                position: highlightPosition,
                                valueAbsolute: absoluteValueHighlight,
                                valueOriginal: unadjustedValueHighlight,
                                seriesIndex: seriesIndex,
                                labelSettings: dataPointLabelSettings,
                                categoryIndex: categoryIndex,
                                color: color,
                                selected: false,
                                highlight: true,
                                originalValue: value,
                                originalPosition: position,
                                originalValueAbsolute: valueAbsolute,
                                drawThinner: highlightsOverflow,
                                identity: highlightIdentity,
                                key: highlightIdentity.getKey(),
                                tooltipInfo: tooltipInfo,
                                labelFormatString: metadata.format,
                                labelFill: labelColor,
                                lastSeries: lastValue,
                                chartType: chartType
                            };
    
                            seriesDataPoints.push(highlightDataPoint);
                        }
                    }
                }
    
                return {
                    series: columnSeries,
                    hasHighlights: hasHighlights,
                    hasDynamicSeries: hasDynamicSeries,
                    isMultiMeasure: isMultiMeasure,
                };
            }
    
            private static getDataPointColor(
                legendItem: LegendDataPoint,
                categoryIndex: number,
                dataPointObjects?: DataViewObjects[]): string {
                debug.assertValue(legendItem, 'legendItem');
                debug.assertValue(categoryIndex, 'categoryIndex');
                debug.assertAnyValue(dataPointObjects, 'dataPointObjects');
    
                if (dataPointObjects) {
                    var colorOverride = DataViewObjects.getFillColor(dataPointObjects[categoryIndex], columnChartProps.dataPoint.fill);
                    if (colorOverride)
                        return colorOverride;
                }
    
                return legendItem.color;
            }
    
            private static getStackedLabelColor(isNegative: boolean, seriesIndex: number, seriesCount: number, categoryIndex: number, rawValues: number[][]): boolean {
                var lastValue = !(isNegative && seriesIndex === seriesCount - 1 && seriesCount !== 1);
                //run for the next series and check if current series is last
                for (var i = seriesIndex + 1; i < seriesCount; i++) {
                    var nextValues = StackedChartGMO.normalizeNonFiniteNumber(rawValues[i][categoryIndex]);
                    if ((nextValues !== null) && (((!isNegative || (isNegative && seriesIndex === 0)) && nextValues > 0) || (isNegative && seriesIndex !== 0))) {
                        lastValue = false;
                        break;
                    }
                }
                return lastValue;
            }
    
            public static getInteractiveColumnChartDomElement(element: JQuery): HTMLElement {
                return element.children("svg").get(0);
            }
    
            public setData(dataViews: DataView[]): void {
                debug.assertValue(dataViews, "dataViews");
                var is100PctStacked = EnumExtensions.hasFlag(this.chartType, flagStacked100);
                this.data = {
                    dataView: [],
                    categories: [],
                    categoryFormatter: null,
                    series: [],
                    valuesMetadata: [],
                    legendData: null,
                    hasHighlights: false,
                    categoryMetadata: null,
                    scalarCategoryAxis: false,
                    labelSettings: powerbi.extensibility.utils.chart.dataLabel.utils.getDefaultColumnLabelSettings(is100PctStacked || EnumExtensions.hasFlag(this.chartType, flagStacked)),
                    axesLabels: { x: null, y: null },
                    hasDynamicSeries: false,
                    defaultDataPointColor: null,
                    isMultiMeasure: false,
                };
    
                if (dataViews.length > 0) {
                    var dataView = this.dataView = dataViews[0];
    
                    if (dataView && dataView.categorical) {
                        var dataViewCat = this.dataViewCat = dataView.categorical;
                        var dvCategories = dataViewCat.categories;
                        var categoryMetadata = (dvCategories && dvCategories.length > 0)
                            ? dvCategories[0].source
                            : null;
                        var categoryType = AxisHelper.getCategoryValueType(categoryMetadata);
    
                        this.data = this.converter(
                            this.dataViews,
                            dataViewCat,
                            this.colors,
                            is100PctStacked,
                            CartesianChartGMO.getIsScalar(dataView.metadata ? dataView.metadata.objects : null, columnChartProps.categoryAxis.axisType, categoryType),
                            dataView.metadata,
                            this.chartType,
                            this.interactivityService);
                    }
                }
                this.columnChart = new StackedChartGMOStrategy();
            }
    
            public calculateLegend(): LegendData {
                // if we're in interactive mode, return the interactive legend 
                if (this.interactivity && this.interactivity.isInteractiveLegend) {
                    return this.createInteractiveLegendDataPoints(0);
                }
                var legendData = this.data ? this.data.legendData : null;
                var legendDataPoints = legendData ? legendData.dataPoints : [];
    
                if (_.isEmpty(legendDataPoints))
                    return null;
    
                return legendData;
            }
    
            public hasLegend(): boolean {
                return this.data && (this.data.hasDynamicSeries || (this.data.series && this.data.series.length > 1));
            }
    
            public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
                var enumeration: VisualObjectInstance[] = [];
                var sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]);
                var textWrapSettings: textWrapSettings = this.getTextWrapSettings(this.dataViews[0]);
                var measureTitlesSettings: measureTitlesSettings = this.getMeasureTitlesSettings(this.dataViews[0]);
                var totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
                var secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]);
                var tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]);
                var quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]);
                
                
                switch (options.objectName) {
                    case 'dataPoint':
                        var categoricalDataView: DataViewCategorical = this.data && this.dataViewCat ? this.dataViewCat : null;
                        if (! powerbi.extensibility.utils.formatting.  GradientUtils.hasGradientRole(categoricalDataView))
                            this.enumerateDataPoints(enumeration);
                        break;
                    case 'categoryAxis':
                        this.getCategoryAxisValues(enumeration);
                        break;
                    case 'sampleFilter':
                        enumeration.push({
                            objectName: 'sampleFilter',
                            displayName: 'Sample filter',
                            selector: null,
                            properties: {
                                show: sampleFilterSettings.show,
                            }
                        });
                        break;    
                    case 'textWrap':
                        enumeration.push({
                            objectName: 'textWrap',
                            displayName: 'X-Axis text wrap',
                            selector: null,
                            properties: {
                                show: textWrapSettings.show,
                            }
                        });
                        break; 
                    case 'measureTitles':
                        enumeration.push({
                            objectName: 'measureTitles',
                            displayName: 'Measure Titles',
                            selector: null,
                            properties: {
                                ellipses: measureTitlesSettings.ellipsesStrength,
                            }
                        });
                        break;       
                    case 'valueAxis':
                        this.getValueAxisValues(enumeration);
                        break;
                    case 'plotArea':
                        visualBackgroundHelper.enumeratePlot(enumeration, this.background);
                        break;
                    case 'categoryLabels':
                        if (this.data)
                            powerbi.extensibility.utils.chart.dataLabel.utils.enumerateCategoryLabels(enumeration, this.data.labelSettings, true);
                        else
                            powerbi.extensibility.utils.chart.dataLabel.utils.enumerateCategoryLabels(enumeration, null, true);
                        break;
                    case 'labels':
                        this.enumerateDataLabels(enumeration);
                        break;
                        
                    case 'totalLabels':
                        enumeration.push({
                            objectName: 'totalLabels',
                            displayName: 'Total Labels',
                            selector: null,
                            properties: {                            
                                show: totalLabelSettings.show,
                                titleText: totalLabelSettings.titleText,
                                color: totalLabelSettings.color,                            
                                labelDisplayUnits: totalLabelSettings.displayUnits,
                                labelPrecision: totalLabelSettings.textPrecision,
                                fontSize: totalLabelSettings.fontSize                            
                            }
                        });
                        break;
                    case 'secondaryLabels':
                        enumeration.push({
                            objectName: 'secondaryLabels',
                            displayName: 'Secondary Labels',
                            selector: null,
                            properties: {
                                titleText: secondaryLabelSettings.titleText,                          
                                color: secondaryLabelSettings.color,
                                labelDisplayUnits: secondaryLabelSettings.displayUnits,
                                labelPrecision: secondaryLabelSettings.textPrecision,
                                fontSize: secondaryLabelSettings.fontSize                            
                            }
                        });
                        break;
                    case 'tertiaryLabels':
                        enumeration.push({
                            objectName: 'tertiaryLabels',
                            displayName: 'Tertiary Labels',
                            selector: null,
                            properties: {
                                titleText: tertiaryLabelSettings.titleText,                           
                                color: tertiaryLabelSettings.color,
                                labelDisplayUnits: tertiaryLabelSettings.displayUnits,
                                labelPrecision: tertiaryLabelSettings.textPrecision,
                                fontSize: tertiaryLabelSettings.fontSize                            
                            }
                        });
                        break;
                    case 'quaternaryLabels':
                        enumeration.push({
                            objectName: 'quaternaryLabels',
                            displayName: 'Quaternary Labels',
                            selector: null,
                            properties: {
                                titleText: quaternaryLabelSettings.titleText,                         
                                color: quaternaryLabelSettings.color,
                                labelDisplayUnits: quaternaryLabelSettings.displayUnits,
                                labelPrecision: quaternaryLabelSettings.textPrecision,
                                fontSize: quaternaryLabelSettings.fontSize                            
                            }
                        });
                        break;        
                    case 'legend':
                        this.getLegendValue(enumeration);
                        break;
                    // MAQCode
                    case 'GMOColumnChartTitle':
                        enumeration.push({
                            objectName: 'GMOColumnChartTitle',
                            displayName: 'Stacked Chart title',
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
    
                }
                return enumeration;
            }
            private getLegendValue(enumeration: ObjectEnumerationBuilder): void {
                if (!this.hasLegend())
                    return;
                var show = DataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.show, this.legend.isVisible());
                var showTitle = DataViewObject.getValue<boolean>(this.legendObjectProperties, legendProps.showTitle, true);
                var primaryMeasureOnOff = this.getShowPrimaryMeasure(this.dataView);
                var titleText = DataViewObject.getValue<string>(this.legendObjectProperties, legendProps.titleText, this.layerLegendData ? this.layerLegendData.title : '');
                var legendLabelColor = DataViewObject.getValue<string>(this.legendObjectProperties, legendProps.labelColor, LegendData.DefaultLegendLabelFillColor);
                this.legendLabelFontSize = DataViewObject.getValue<number>(this.legendObjectProperties, legendProps.fontSize, StackedChartGMO.LegendLabelFontSizeDefault);
    
                var labelDisplayUnits = this.getLegendDispalyUnits(this.dataViews[0], 'labelDisplayUnits');
                var labelPrecision = this.getLegendDispalyUnits(this.dataViews[0], 'labelPrecision');
    
                if (labelPrecision && labelPrecision > 20) {
                    labelPrecision = 20;
                }
                enumeration.push({
                    selector: null,
                    properties: {
                        show: show,
                        position: LegendPosition[this.legend.getOrientation()],
                        showTitle: showTitle,
                        titleText: titleText,
                        labelColor: legendLabelColor,
                        fontSize: this.legendLabelFontSize
                    },
                    objectName: 'legend'
                });
            }
            
            private getSampleFilterSettings(dataView: DataView): sampleFilterSettings {
                var objects: DataViewObjects = null;
                var sampleFilterSetting: sampleFilterSettings = this.getDefaultSampleFilterSettings();
    
                if (!dataView.metadata || !dataView.metadata.objects)
                    return sampleFilterSetting;
    
                objects = dataView.metadata.objects;
                var sampleFilterProperties = StackedChartGMOProps;
                sampleFilterSetting.show = DataViewObjects.getValue(objects, sampleFilterProperties.sampleFilter.show, sampleFilterSetting.show);
    
                return sampleFilterSetting;
            }
            
            private getTextWrapSettings(dataView: DataView): textWrapSettings {
                var objects: DataViewObjects = null;
                var textWrapSetting: textWrapSettings = this.getDefaultTextWrapSettings();
    
                if (!dataView.metadata || !dataView.metadata.objects)
                    return textWrapSetting;
    
                objects = dataView.metadata.objects;
                var wrapTextProperties = StackedChartGMOProps;
                textWrapSetting.show = DataViewObjects.getValue(objects, wrapTextProperties.textWrap.show, textWrapSetting.show);
    
                return textWrapSetting;
            }
            
            private getMeasureTitlesSettings(dataView: DataView): measureTitlesSettings {
                var objects: DataViewObjects = null;
                var measureTitlesSettings: measureTitlesSettings = this.getDefaultMeasureTitlesSettings();
    
                if (!dataView.metadata || !dataView.metadata.objects)
                    return measureTitlesSettings;
    
                objects = dataView.metadata.objects;
                var measureTitlesProperties = StackedChartGMOProps;
                measureTitlesSettings.ellipsesStrength = DataViewObjects.getValue(objects, measureTitlesProperties.measureTitles.ellipses, measureTitlesSettings.ellipsesStrength);
    
                return measureTitlesSettings;
            }
            
            private getTotalLabelSettings(dataView: DataView): totalLabelSettings {
                var objects: DataViewObjects = null;
                var labelSettings: totalLabelSettings = this.getDefaultTotalLabelSettings();
    
                if (!dataView.metadata || !dataView.metadata.objects)
                    return this.getDefaultTotalLabelSettings();
    
                objects = dataView.metadata.objects;
                var totalLabelsProperties = StackedChartGMOProps;
                labelSettings.show = DataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.show, labelSettings.show);
                labelSettings.titleText = DataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.titleText, labelSettings.titleText);
                labelSettings.textPrecision = DataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.textPrecision, labelSettings.textPrecision);
                labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
                labelSettings.fontSize = DataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.fontSize, labelSettings.fontSize);
                labelSettings.displayUnits = DataViewObjects.getValue(objects, totalLabelsProperties.totalLabels.displayUnits, labelSettings.displayUnits);
                labelSettings.color = DataViewObjects.getFillColor(objects, totalLabelsProperties.totalLabels.color, labelSettings.color);
    
                return labelSettings;
            }
            
            private getSecondaryLabelSettings(dataView: DataView): secondaryLabelSettings {
                var objects: DataViewObjects = null;
                var labelSettings: secondaryLabelSettings = this.getDefaultSecondaryLabelSettings();
                
                if(dataView.categorical.values){
                    labelSettings.titleText = dataView.categorical.values[0].source.displayName;
                }
                if (!dataView.metadata || !dataView.metadata.objects)
                    return labelSettings;
    
                objects = dataView.metadata.objects;
                var secondaryLabelsProperties = StackedChartGMOProps;
                labelSettings.titleText = DataViewObjects.getValue(objects, secondaryLabelsProperties.secondaryLabels.titleText, labelSettings.titleText);
                labelSettings.textPrecision = DataViewObjects.getValue(objects, secondaryLabelsProperties.secondaryLabels.textPrecision, labelSettings.textPrecision);
                labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
                labelSettings.fontSize = DataViewObjects.getValue(objects, secondaryLabelsProperties.secondaryLabels.fontSize, labelSettings.fontSize);
                labelSettings.displayUnits = DataViewObjects.getValue(objects, secondaryLabelsProperties.secondaryLabels.displayUnits, labelSettings.displayUnits);
                labelSettings.color = DataViewObjects.getFillColor(objects, secondaryLabelsProperties.secondaryLabels.color, labelSettings.color);
    
                return labelSettings;
            }
            
            private getTertiaryLabelSettings(dataView: DataView): tertiaryLabelSettings {
                var objects: DataViewObjects = null;
                var labelSettings: tertiaryLabelSettings = this.getDefaultTertiaryLabelSettings();
                
                if(dataView.categorical.values){
                    labelSettings.titleText = dataView.categorical.values[0].source.displayName;
                }
                if (!dataView.metadata || !dataView.metadata.objects)
                    return labelSettings;
    
                objects = dataView.metadata.objects;
                var tertiaryLabelsProperties = StackedChartGMOProps;
                labelSettings.titleText = DataViewObjects.getValue(objects, tertiaryLabelsProperties.tertiaryLabels.titleText, labelSettings.titleText);
                labelSettings.textPrecision = DataViewObjects.getValue(objects, tertiaryLabelsProperties.tertiaryLabels.textPrecision, labelSettings.textPrecision);
                labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
                labelSettings.fontSize = DataViewObjects.getValue(objects, tertiaryLabelsProperties.tertiaryLabels.fontSize, labelSettings.fontSize);
                labelSettings.displayUnits = DataViewObjects.getValue(objects, tertiaryLabelsProperties.tertiaryLabels.displayUnits, labelSettings.displayUnits);
                labelSettings.color = DataViewObjects.getFillColor(objects, tertiaryLabelsProperties.tertiaryLabels.color, labelSettings.color);
    
                return labelSettings;
            }
            
            private getQuaternaryLabelSettings(dataView: DataView): quaternaryLabelSettings {
                var objects: DataViewObjects = null;
                var labelSettings: quaternaryLabelSettings = this.getDefaultQuaternaryLabelSettings();
                
                if(dataView.categorical.values){
                    labelSettings.titleText = dataView.categorical.values[0].source.displayName;
                }
                if (!dataView.metadata || !dataView.metadata.objects)
                    return labelSettings;
    
                objects = dataView.metadata.objects;
                var quaternaryLabelsProperties = StackedChartGMOProps;
                labelSettings.titleText = DataViewObjects.getValue(objects, quaternaryLabelsProperties.quaternaryLabels.titleText, labelSettings.titleText);
                labelSettings.textPrecision = DataViewObjects.getValue(objects, quaternaryLabelsProperties.quaternaryLabels.textPrecision, labelSettings.textPrecision);
                labelSettings.textPrecision = labelSettings.textPrecision < 0 ? 0 : (labelSettings.textPrecision > 20 ? 20 : labelSettings.textPrecision);
                labelSettings.fontSize = DataViewObjects.getValue(objects, quaternaryLabelsProperties.quaternaryLabels.fontSize, labelSettings.fontSize);
                labelSettings.displayUnits = DataViewObjects.getValue(objects, quaternaryLabelsProperties.quaternaryLabels.displayUnits, labelSettings.displayUnits);
                labelSettings.color = DataViewObjects.getFillColor(objects, quaternaryLabelsProperties.quaternaryLabels.color, labelSettings.color);
    
                return labelSettings;
            }
            
            public getDefaultSampleFilterSettings(): sampleFilterSettings {
                return {
                    show: false
                }
            }
            
            public getDefaultTextWrapSettings(): textWrapSettings {
                return {
                    show: false
                }
            }
            
            public getDefaultMeasureTitlesSettings(): measureTitlesSettings {
                return {
                    ellipsesStrength: 60
                }
            }
            
            public getDefaultTotalLabelSettings(): totalLabelSettings {
                return {
                    show: true,
                    titleText: 'Total',
                    color: '#777',
                    displayUnits: 0,
                    textPrecision: 0,
                    fontSize: 9,
                }
            }
            
            public getDefaultSecondaryLabelSettings(): secondaryLabelSettings {
                return {
                    titleText: '',
                    color: '#777',
                    displayUnits: 0,
                    textPrecision: 0,
                    fontSize: 9,
                }
            }
            
            public getDefaultTertiaryLabelSettings(): tertiaryLabelSettings {
                return {
                    titleText: '',
                    color: '#777',
                    displayUnits: 0,
                    textPrecision: 0,
                    fontSize: 9,
                }
            }
            
            public getDefaultQuaternaryLabelSettings(): quaternaryLabelSettings {
                return {
                    titleText: '',
                    color: '#777',
                    displayUnits: 0,
                    textPrecision: 0,
                    fontSize: 9,
                }
            }
            
            //Get Measure value
            public measureValue(measure, measureFormat, legendObjectProperties, modelingPrecision) {
                var displayUnits, modelPrecisionValue: number = 0;
                if (legendObjectProperties && legendObjectProperties['labelPrecision']) {
                    var precisionValue = legendObjectProperties['labelPrecision'];
                    if (!precisionValue) {
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
                    formattedValue = this.format(parseInt(measure, 10), displayUnits, modelPrecisionValue, 'sample');
                    if (isNaN(parseInt(itemValue, 10)) || isNaN(parseInt(itemValue[itemValue.length - 1], 10)))
                        formattedValue = this.addSpecialCharacters(formattedValue, itemValue);
                }
                return formattedValue;
            }
            // This function is to perform KMB formatting on values
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
            private getCategoryAxisValues(enumeration: ObjectEnumerationBuilder): void {
                if (!this.categoryAxisProperties) {
                    return;
                }
                var supportedType = axisType.both;
                var isScalar = false;
                var logPossible = false;
                var scaleOptions = [axisScale.log, axisScale.linear];//until options can be update in propPane, show all options
    
                if (!isScalar) {
                    if (this.categoryAxisProperties) {
                        this.categoryAxisProperties['start'] = null;
                        this.categoryAxisProperties['end'] = null;
                    }
                }
    
                var instance: VisualObjectInstance = {
                    selector: null,
                    properties: {},
                    objectName: 'categoryAxis',
                    validValues: {
                        axisScale: scaleOptions
                    }
                };
    
                instance.properties['show'] = this.categoryAxisProperties && this.categoryAxisProperties['show'] != null ? this.categoryAxisProperties['show'] : true;
                if (supportedType === axisType.both) {
                    instance.properties['axisType'] = isScalar ? axisType.scalar : axisType.categorical;
                }
                if (isScalar) {
                    instance.properties['axisScale'] = (this.categoryAxisProperties && this.categoryAxisProperties['axisScale'] != null && logPossible) ? this.categoryAxisProperties['axisScale'] : axisScale.linear;
                    instance.properties['start'] = this.categoryAxisProperties ? this.categoryAxisProperties['start'] : null;
                    instance.properties['end'] = this.categoryAxisProperties ? this.categoryAxisProperties['end'] : null;
                    instance.properties['labelDisplayUnits'] = this.categoryAxisProperties && this.categoryAxisProperties['labelDisplayUnits'] != null ? this.categoryAxisProperties['labelDisplayUnits'] : StackedChartGMO.LabelDisplayUnitsDefault;
                }
                instance.properties['showAxisTitle'] = this.categoryAxisProperties && this.categoryAxisProperties['showAxisTitle'] != null ? this.categoryAxisProperties['showAxisTitle'] : true;
    
                enumeration
                    .push(instance)
                    .push({
                    selector: null,
                    properties: {
                        axisStyle: this.categoryAxisProperties && this.categoryAxisProperties['axisStyle'] ? this.categoryAxisProperties['axisStyle'] : axisStyle.showTitleOnly,
                        labelColor: this.categoryAxisProperties ? this.categoryAxisProperties['labelColor'] : null
                    },
    
                    objectName: 'categoryAxis',
                    validValues: {
                        axisStyle: this.categoryAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly]
                    }
                });
            }
    
            //todo: wrap all these object getters and other related stuff into an interface
            private getValueAxisValues(enumeration: ObjectEnumerationBuilder): void {
                var scaleOptions = [axisScale.log, axisScale.linear];  //until options can be update in propPane, show all options
                var logPossible = false;
    
                var instance: VisualObjectInstance = {
                    selector: null,
                    properties: {},
                    objectName: 'valueAxis',
                    validValues: {
                        axisScale: scaleOptions,
                        secAxisScale: scaleOptions
                    }
                };
    
                instance.properties['show'] = this.valueAxisProperties && this.valueAxisProperties['show'] != null ? this.valueAxisProperties['show'] : true;
                instance.properties['axisScale'] = (this.valueAxisProperties && this.valueAxisProperties['axisScale'] != null && logPossible) ? this.valueAxisProperties['axisScale'] : axisScale.linear;
                instance.properties['start'] = this.valueAxisProperties ? this.valueAxisProperties['start'] : null;
                instance.properties['end'] = this.valueAxisProperties ? this.valueAxisProperties['end'] : null;
                instance.properties['showAxisTitle'] = this.valueAxisProperties && this.valueAxisProperties['showAxisTitle'] != null ? this.valueAxisProperties['showAxisTitle'] : true;
                instance.properties['labelDisplayUnits'] = this.valueAxisProperties && this.valueAxisProperties['labelDisplayUnits'] != null ? this.valueAxisProperties['labelDisplayUnits'] : StackedChartGMO.LabelDisplayUnitsDefault;
    
                enumeration
                    .push(instance)
                    .push({
                    selector: null,
                    properties: {
                        axisStyle: this.valueAxisProperties && this.valueAxisProperties['axisStyle'] != null ? this.valueAxisProperties['axisStyle'] : axisStyle.showTitleOnly,
                        labelColor: this.valueAxisProperties ? this.valueAxisProperties['labelColor'] : null
                    },
    
                    objectName: 'valueAxis',
                    validValues: {
                        axisStyle: this.valueAxisHasUnitType ? [axisStyle.showTitleOnly, axisStyle.showUnitOnly, axisStyle.showBoth] : [axisStyle.showTitleOnly]
                    },
                });
            }
            private enumerateDataLabels(enumeration: ObjectEnumerationBuilder): void {
                var data = this.data,
                    labelSettings = this.data.labelSettings,
                    seriesCount = data.series.length,
                    showLabelPerSeries = !data.hasDynamicSeries && (seriesCount > 1 || !data.categoryMetadata) && this.seriesLabelFormattingEnabled;
                    var labelsObj = this.dataView.metadata.objects ? <powerbi.extensibility.utils.chart.dataLabel.DataLabelObject>this.dataView.metadata.objects['labels'] : null;
                    labelSettings.precision = labelsObj ? labelsObj.labelPrecision : 0;
                    
                //Draw default settings
                powerbi.extensibility.utils.chart.dataLabel.utils.enumerateDataLabels(this.getLabelSettingsOptions(enumeration, labelSettings, null, showLabelPerSeries));
    
                if (seriesCount === 0)
                    return;
    
                //Draw series settings
                if (showLabelPerSeries && labelSettings.showLabelPerSeries) {
                    for (var i = 0; i < seriesCount; i++) {
                        var series = data.series[i],
                            labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings = (series.labelSettings) ? series.labelSettings : this.data.labelSettings;
    
                        enumeration.pushContainer({ displayName: series.displayName });
                        powerbi.extensibility.utils.chart.dataLabel.utils.enumerateDataLabels(this.getLabelSettingsOptions(enumeration, labelSettings, series));
                        enumeration.popContainer();
                    }
                }
            }
            // MAQ Code
            // This function returns on/off status of the funnel title properties
            private getShowTitle(dataView: DataView): IDataLabelSettings {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var showTitle = dataView.metadata.objects['GMOColumnChartTitle'];
                        if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) {
                            return <IDataLabelSettings>showTitle['show'];
                        }
                    } else {
                        return <IDataLabelSettings>true;
                    }
                }
                return <IDataLabelSettings>true;
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
                    if (dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var titletext = dataView.metadata.objects['GMOColumnChartTitle'];
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
            // This function returns the tool tip text given for the tooltip in the format window
            private getTooltipText(dataView: DataView): IDataLabelSettings {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var tooltiptext = dataView.metadata.objects['GMOColumnChartTitle'];
                        if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) {
                            return <IDataLabelSettings>tooltiptext['tooltipText'];
                        }
                    } else {
                        return <IDataLabelSettings>'Your tooltip text goes here';
                    }
                }
                return <IDataLabelSettings>'Your tooltip text goes here';
            }
            // MAQCode
            // This function returns the font colot selected for the title in the format window
            private getTitleFill(dataView: DataView): Fill {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var FTitle = dataView.metadata.objects['GMOColumnChartTitle'];
                        if (FTitle && FTitle.hasOwnProperty('fill1')) {
                            return <Fill>FTitle['fill1'];
                        }
                    } else {
                        return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleFill, { solid: { color: '#333333' } });
                    }
                }
                return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleFill, { solid: { color: '#333333' } });
            }
    
            // This function returns the background color selected for the title in the format window
            private getTitleBgcolor(dataView: DataView): Fill {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var FTitle = dataView.metadata.objects['GMOColumnChartTitle'];
                        if (FTitle && FTitle.hasOwnProperty('backgroundColor')) {
                            return <Fill>FTitle['backgroundColor'];
                        }
                    } else {
                        return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleBackgroundColor, { solid: { color: 'none' } });
                    }
                }
                return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, StackedChartGMOProps.titleBackgroundColor, { solid: { color: 'none' } });
            }
    
            // This function returns the funnel title font size selected for the title in the format window
            private getTitleSize(dataView: DataView) {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('GMOColumnChartTitle')) {
                        var FTitle = dataView.metadata.objects['GMOColumnChartTitle'];
                        if (FTitle && FTitle.hasOwnProperty('fontSize')) {
                            return FTitle['fontSize'];
                        }
                    } else {
                        return 12;
                    }
                }
                return 12;
            }
            // This function returns on/off status of the legend show primary measure
            private getShowPrimaryMeasure(dataView: DataView): IDataLabelSettings {
                if (dataView && dataView.metadata && dataView.metadata.objects) {
                    if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('legend')) {
                        var showTitle = dataView.metadata.objects['legend'];
                        if (dataView.metadata.objects && showTitle.hasOwnProperty('primaryMeasureOnoff')) {
                            return <IDataLabelSettings>showTitle['primaryMeasureOnoff'];
                        }
                    } else {
                        return <IDataLabelSettings>true;
                    }
                }
                return <IDataLabelSettings>true;
            }
    
            private getLabelSettingsOptions(enumeration: ObjectEnumerationBuilder, labelSettings: powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettings, series?: StackedChartGMOSeries, showAll?: boolean): VisualDataLabelsSettingsOptions {
                return {
                    enumeration: enumeration,
                    dataLabelsSettings: labelSettings,
                    show: true,
                    displayUnits: !EnumExtensions.hasFlag(this.chartType, flagStacked100),
                    precision: true,
                    selector: series && series.identity ? series.identity.getSelector() : null,
                    showAll: showAll,
                    fontSize: true,
                };
            }
    
            private enumerateDataPoints(enumeration: ObjectEnumerationBuilder): void {
                var data = this.data;
                if (!data)
                    return;
    
                var seriesCount = data.series.length;
    
                if (seriesCount === 0)
                    return;
    
                if (data.hasDynamicSeries || seriesCount > 1 || !data.categoryMetadata) {
                    for (var i = 0; i < seriesCount; i++) {
                        var series = data.series[i];
                        enumeration.push({
                            objectName: 'dataPoint',
                            displayName: series.displayName,
                            selector: ColorHelper.normalizeSelector(series.identity.getSelector()),
                            properties: {
                                fill: { solid: { color: series.color } }
                            },
                        });
                    }
                }
                else {
                    // For single-category, single-measure column charts, the user can color the individual bars.
                    var singleSeriesData = data.series[0].data;
                    var categoryFormatter = data.categoryFormatter;
    
                    // Add default color and show all slices
                    enumeration.push({
                        objectName: 'dataPoint',
                        selector: null,
                        properties: {
                            defaultColor: { solid: { color: data.defaultDataPointColor || this.colors.getColorByIndex(0).value } }
                        }
                    }).push({
                        objectName: 'dataPoint',
                        selector: null,
                        properties: {
    
                            showAllDataPoints: !!data.showAllDataPoints
                        }
                    });
                    for (var i = 0; i < singleSeriesData.length; i++) {
                        var singleSeriesDataPoints = singleSeriesData[i],
                            categoryValue: any = data.categories[i];
                        enumeration.push({
                            objectName: 'dataPoint',
                            displayName: categoryFormatter ? categoryFormatter.format(categoryValue) : categoryValue,
                            selector: ColorHelper.normalizeSelector(singleSeriesDataPoints.identity.getSelector(), /*isSingleSeries*/true),
                            properties: {
                                fill: { solid: { color: singleSeriesDataPoints.color } }
                            },
                        });
                    }
                }
            }
    
            public calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[] {
                
                var totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
                var secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]);
                var tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]);
                var quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]);
                   
                var data = this.data;
                var legendPosition = parseFloat(this.root.select('.legend').attr('orientation'));
    
                var customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height'));
                var customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height'));
                if (isNaN(customTitleHeight)) {
                    customTitleHeight = 0;
                }
    
                var legendHeight = parseFloat(this.root.select('.legend').style('height'));
                var legendWidth = parseFloat(this.root.select('.legend').style('width'));
                if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                    legendHeight = 0;
                }
                customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight);
                
                legendHeight = PixelConverter.fromPointToPixel(legendHeight);
                this.viewport = options.viewport;
                
                var margin = options.margin;
                
                var origCatgSize = (data && data.categories) ? data.categories.length : 0;
                var chartLayout: CategoryLayout = data ? this.getCategoryLayout(origCatgSize, options) : {
                    categoryCount: 0,
                    categoryThickness: CartesianChartGMO.MinOrdinalRectThickness - 50,
                    outerPaddingRatio: CartesianChartGMO.OuterPaddingRatio,
                    isScalar: false
                };
    
                this.categoryAxisType = chartLayout.isScalar ? axisType.scalar : null;
    
                if (data && !chartLayout.isScalar && !this.isScrollable && options.trimOrdinalDataOnOverflow) {
                    // trim data that doesn't fit on dashboard
                    var catgSize = Math.min(origCatgSize, chartLayout.categoryCount);
                    if (catgSize !== origCatgSize) {
                        data = Prototype.inherit(data);
                        data.series = ColumnChartGMO.sliceSeries(data.series, catgSize);
                        data.categories = data.categories.slice(0, catgSize);
                    }
                }
                this.columnChart.setData(data);
                
                var preferredPlotArea = this.getPreferredPlotArea(chartLayout.isScalar, chartLayout.categoryCount, chartLayout.categoryThickness);
    
                /* preferredPlotArea would be same as currentViewport width when there is no scrollbar. 
                 In that case we want to calculate the available plot area for the shapes by subtracting the margin from available viewport */
                 
                if ((preferredPlotArea.width === this.viewport.width) && this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    if(preferredPlotArea.width>(margin.left + margin.right + legendWidth)){
                         preferredPlotArea.width -= (margin.left + margin.right + legendWidth);
                    }else{
                         preferredPlotArea.width =(margin.left + margin.right + legendWidth) - preferredPlotArea.width;
                    }
                   
                }
                else if (preferredPlotArea.width === this.viewport.width) {
                    if(preferredPlotArea.width>(margin.left + margin.right)){
                         preferredPlotArea.width -= (margin.left + margin.right);
                    }else{
                         preferredPlotArea.width = (margin.left + margin.right) - preferredPlotArea.width;
                    }
                    
                }
                
                var numberOfMeasures = (totalLabelSettings.show? 1 : 0) + 
                    (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) +
                    (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) +
                    (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0);
                
                var customHeight;
                
                switch(numberOfMeasures){
                    case 0 : customHeight = 0;
                        break;
                    case 1 : customHeight = 25;
                        break;
                    case 2 : customHeight = 50;
                        break;
                    case 3 : customHeight = 75;
                        break;
                    case 4 : customHeight = 100;
                        break;           
                }
                
                if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    if(preferredPlotArea.height>(margin.top + margin.bottom + customTitleHeight + customHeight)){
                        preferredPlotArea.height -= (margin.top + margin.bottom + customTitleHeight + customHeight);
                    }else{
                        preferredPlotArea.height = (margin.top + margin.bottom + customTitleHeight + customHeight)- preferredPlotArea.height;
                    }
                    
                }
                else {
                     if(preferredPlotArea.height>(margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight)){
                       preferredPlotArea.height -= (margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight);
                    }else{
                        preferredPlotArea.height = (margin.top + margin.bottom + customTitleHeight + customHeight + legendHeight) - preferredPlotArea.height;
                    }
                    
                }
    
                var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                var is100Pct = EnumExtensions.hasFlag(this.chartType, flagStacked100);
    
                // When the category axis is scrollable the height of the category axis and value axis will be different
                // The height of the value axis would be same as viewportHeight 
                var chartContext: ColumnChartContextGMO = {
                    height: preferredPlotArea.height,
                    width: preferredPlotArea.width,
                    duration: 0,
                    hostService: this.hostService,
                    mainGraphicsContext: this.mainGraphicsContext,
                    labelGraphicsContext: this.labelGraphicsContext,
                    margin: this.margin,
                    layout: chartLayout,
                    animator: this.animator,
                    interactivityService: this.interactivityService,
                    viewportHeight: this.viewport.height,
                    viewportWidth: this.viewport.width,
                    is100Pct: is100Pct,
                    isComboChart: this.isComboChart,
                };
                this.ApplyInteractivity(chartContext);
                this.columnChart.setupVisualProps(chartContext);
    
                this.xAxisProperties = this.columnChart.setXScale(
                    is100Pct,
                    options.forcedTickCount,
                    options.forcedXDomain,
                    options.categoryAxisScaleType,
                    options.categoryAxisDisplayUnits,
                    options.categoryAxisPrecision);
    
                this.yAxisProperties = this.columnChart.setYScale(
                    is100Pct,
                    options.forcedTickCount,
                    options.forcedYDomain,
                    options.valueAxisScaleType,
                    options.valueAxisDisplayUnits,
                    options.valueAxisPrecision);
    
                if (options.showCategoryAxisLabel && this.xAxisProperties.isCategoryAxis || options.showValueAxisLabel && !this.xAxisProperties.isCategoryAxis) {
                    this.xAxisProperties.axisLabel = data.axesLabels.x;
                }
                else {
                    this.xAxisProperties.axisLabel = null;
                }
                if (options.showValueAxisLabel && !this.yAxisProperties.isCategoryAxis || options.showCategoryAxisLabel && this.yAxisProperties.isCategoryAxis) {
                    this.yAxisProperties.axisLabel = data.axesLabels.y;
                }
                else {
                    this.yAxisProperties.axisLabel = null;
                }
    
                return [this.xAxisProperties, this.yAxisProperties];
            }
    
            public getPreferredPlotArea(isScalar: boolean, categoryCount: number, categoryThickness: number): IViewport {
                var viewport: IViewport = {
                    height: this.viewport.height,
                    width: this.viewport.width
                };
                if (this.isScrollable && !isScalar) {
                    var preferredWidth = CartesianChartGMO.getPreferredCategorySpan(categoryCount, categoryThickness);
                    if (EnumExtensions.hasFlag(this.chartType, flagBar)) {
                        viewport.height = Math.max(preferredWidth, viewport.height);
                    }
                    else
                        viewport.width = Math.max(preferredWidth, viewport.width);
                }
                return viewport;
            }
    
            private ApplyInteractivity(chartContext: ColumnChartContextGMO): void {
                var interactivity = this.interactivity;
                if (interactivity) {
                    if (interactivity.dragDataPoint) {
                        chartContext.onDragStart = (datum: StackedChartGMODataPoint) => {
                            if (!datum.identity)
                                return;
    
                            this.hostService.onDragStart({
                                event: <any>d3.event,
                                data: {
                                    data: datum.identity.getSelector()
                                }
                            });
                        };
                    }
    
                    if (interactivity.isInteractiveLegend) {
                        var dragMove = () => {
                            var mousePoint = d3.mouse(this.mainGraphicsContext[0][0]); // get the x and y for the column area itself
                            var x: number = mousePoint[0];
                            var y: number = mousePoint[1];
                            var index: number = this.columnChart.getClosestColumnIndex(x, y);
                            this.selectColumn(index);
                        };
    
                        var ColumnChartSvg: EventTarget = ColumnChartGMO.getInteractiveColumnChartDomElement(this.element);
    
                        //set click interaction on the visual
                        this.svg.on('click', dragMove);
                        //set click interaction on the background
                        d3.select(ColumnChartSvg)
                            .on('click', dragMove)
                            .style('touch-action', 'none');
                        var drag = d3.behavior.drag()
                            .origin(Object)
                            .on("drag", dragMove);
                        //set drag interaction on the visual
                        this.svg.call(drag);
                        //set drag interaction on the background
                        d3.select(ColumnChartSvg).call(drag);
                    }
                }
            }
    
            private selectColumn(indexOfColumnSelected: number, force: boolean = false): void {
                if (!force && this.lastInteractiveSelectedColumnIndex === indexOfColumnSelected) return; // same column, nothing to do here
    
                var legendData: LegendData = this.createInteractiveLegendDataPoints(indexOfColumnSelected);
                var legendDataPoints: LegendDataPoint[] = legendData.dataPoints;
                this.cartesianVisualHost.updateLegend(legendData);
                if (legendDataPoints.length > 0) {
                    this.columnChart.selectColumn(indexOfColumnSelected, this.lastInteractiveSelectedColumnIndex);
                }
                this.lastInteractiveSelectedColumnIndex = indexOfColumnSelected;
            }
    
            private createInteractiveLegendDataPoints(columnIndex: number): LegendData {
                var data = this.data;
                if (!data || _.isEmpty(data.series))
                    return { dataPoints: [] };
    
                var formatStringProp = columnChartProps.general.formatString;
                var legendDataPoints: LegendDataPoint[] = [];
                var category = data.categories && data.categories[columnIndex];
                var allSeries = data.series;
                var dataPoints = data.legendData && data.legendData.dataPoints;
                var converterStrategy = new ColumnChartConverterHelper(this.dataViewCat);
    
                for (var i = 0, len = allSeries.length; i < len; i++) {
                    var measure = converterStrategy.getValueBySeriesAndCategory(i, columnIndex);
                    var valueMetadata = data.valuesMetadata[i];
                    var formattedLabel = converterHelper.getFormattedLegendLabel(valueMetadata, this.dataViewCat.values, formatStringProp);
                    var dataPointColor: string;
                    if (allSeries.length === 1) {
                        var series = allSeries[0];
                        dataPointColor = series.data.length > columnIndex && series.data[columnIndex].color;
                    } else {
                        dataPointColor = dataPoints.length > i && dataPoints[i].color;
                    }
    
                    legendDataPoints.push({
                        color: dataPointColor,
                        icon: LegendIcon.Box,
                        label: formattedLabel,
                        category: data.categoryFormatter ? data.categoryFormatter.format(category) : category,
                        measure: valueFormatter.format(measure, valueFormatter.getFormatString(valueMetadata, formatStringProp)),
                        identity: SelectionId.createNull(),
                        selected: false
                    });
                }
    
                return { dataPoints: legendDataPoints };
            }
    
            public overrideXScale(xProperties: IAxisProperties): void {
                this.xAxisProperties = xProperties;
            }
            public calculateAxes(
                categoryAxisProperties: DataViewObject,
                valueAxisProperties: DataViewObject,
                textProperties: TextProperties,
                scrollbarVisible: boolean): IAxisProperties[] {
    
                var visualOptions: CalculateScaleAndDomainOptions = {
                    viewport: this.viewport,
                    margin: this.margin,
                    forcedXDomain: [categoryAxisProperties ? categoryAxisProperties['start'] : null, categoryAxisProperties ? categoryAxisProperties['end'] : null],
                    forceMerge: valueAxisProperties && valueAxisProperties['secShow'] === false,
                    showCategoryAxisLabel: false,
                    showValueAxisLabel: false,
                    categoryAxisScaleType: categoryAxisProperties && categoryAxisProperties['axisScale'] != null ? <string>categoryAxisProperties['axisScale'] : null,
                    valueAxisScaleType: valueAxisProperties && valueAxisProperties['axisScale'] != null ? <string>valueAxisProperties['axisScale'] : null,
                    valueAxisDisplayUnits: valueAxisProperties && valueAxisProperties['labelDisplayUnits'] != null ? <number>valueAxisProperties['labelDisplayUnits'] : StackedChartGMO.LabelDisplayUnitsDefault,
                    categoryAxisDisplayUnits: categoryAxisProperties && categoryAxisProperties['labelDisplayUnits'] != null ? <number>categoryAxisProperties['labelDisplayUnits'] : StackedChartGMO.LabelDisplayUnitsDefault,
                    trimOrdinalDataOnOverflow: false
                };
    
                if (valueAxisProperties) {
                    visualOptions.forcedYDomain = AxisHelper.applyCustomizedDomain([valueAxisProperties['start'], valueAxisProperties['end']], visualOptions.forcedYDomain);
                }
                visualOptions.showCategoryAxisLabel = (!!categoryAxisProperties && !!categoryAxisProperties['showAxisTitle']);
    
                visualOptions.showValueAxisLabel = true;
    
                var width = this.viewport.width - (this.margin.left + this.margin.right);
    
                var axes = this.calculateAxesProperties(visualOptions);
                axes[0].willLabelsFit = AxisHelper.LabelLayoutStrategy.willLabelsFit(
                    axes[0],
                    width,
                    TextMeasurementService.measureSvgTextWidth,
                    textProperties);
    
                // If labels do not fit and we are not scrolling, try word breaking
                axes[0].willLabelsWordBreak = (!axes[0].willLabelsFit && !scrollbarVisible) && AxisHelper.LabelLayoutStrategy.willLabelsWordBreak(
                    axes[0], this.margin, width, TextMeasurementService.measureSvgTextWidth,
                    TextMeasurementService.estimateSvgTextHeight, TextMeasurementService.getTailoredTextOrDefault,
                    textProperties);
                return axes;
            }
            public render(suppressAnimations: boolean, resize: boolean): CartesianVisualRenderResultGMO {
                
                var maxMarginFactor = this.getMaxMarginFactor();
                this.leftRightMarginLimit = this.viewport.width * maxMarginFactor;
                var bottomMarginLimit = this.bottomMarginLimit = Math.max(25, Math.ceil(this.viewport.height * maxMarginFactor));
    
                // reset defaults
                this.margin.top = 8;
                this.margin.bottom = bottomMarginLimit;
                this.margin.right = 0;
                
                this.yAxisIsCategorical = this.yAxisProperties.isCategoryAxis;
                this.hasCategoryAxis = this.yAxisIsCategorical ? this.yAxisProperties && this.yAxisProperties.values.length > 0 : this.xAxisProperties && this.xAxisProperties.values.length > 0;
    
                var renderXAxis = this.shouldRenderAxis(this.xAxisProperties);
                var renderY1Axis = this.shouldRenderAxis(this.yAxisProperties);
    
                var mainAxisScale;
                this.isXScrollBarVisible = false;
                this.isYScrollBarVisible = false;
                var tickLabelMargins;
                var axisLabels: ChartAxesLabels;
                var chartHasAxisLabels: boolean;
    
                var yAxisOrientation = this.yAxisOrientation;
                var showY1OnRight = yAxisOrientation === yAxisPosition.right;
    
                var doneWithMargins = false,
                    maxIterations = 2,
                    numIterations = 0;
                    
                while (!doneWithMargins && numIterations < maxIterations) {
                    numIterations++;
                    tickLabelMargins = AxisHelper.getTickLabelMargins(
                        { width: this.viewportIn.width, height: this.viewport.height }, this.leftRightMarginLimit,
                        TextMeasurementService.measureSvgTextWidth, TextMeasurementService.measureSvgTextHeight, { x: this.xAxisProperties, y1: this.yAxisProperties },
                        this.bottomMarginLimit, this.textProperties,
                        this.isXScrollBarVisible || this.isYScrollBarVisible, showY1OnRight,
                        renderXAxis, renderY1Axis, false);
                    // We look at the y axes as main and second sides, if the y axis orientation is right so the main side represents the right side
                    var maxMainYaxisSide = showY1OnRight ? tickLabelMargins.yRight : tickLabelMargins.yLeft,
                        maxSecondYaxisSide = showY1OnRight ? tickLabelMargins.yLeft : tickLabelMargins.yRight,
                        xMax = tickLabelMargins.xMax;
    
                    maxMainYaxisSide += 10;
                    maxSecondYaxisSide += 10;
                    xMax += 12;
                    if (showY1OnRight && renderY1Axis) {
                        maxSecondYaxisSide += 20;
                    }
    
                    if (!showY1OnRight && renderY1Axis) {
                        maxMainYaxisSide += 20;
                    }
    
                    if (this.hideAxisLabels()) {
                        this.xAxisProperties.axisLabel = null;
                        this.yAxisProperties.axisLabel = null;
                    }
                    this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties);
    
                    axisLabels = { x: this.xAxisProperties.axisLabel, y: this.yAxisProperties.axisLabel, y2: null };
                    chartHasAxisLabels = (axisLabels.x != null) || (axisLabels.y != null || axisLabels.y2 != null);
    
                    if (axisLabels.x != null)
                        xMax += 18;
    
                    if (axisLabels.y != null)
                        maxMainYaxisSide += 20;
    
                    if (axisLabels.y2 != null)
                        maxSecondYaxisSide += 20;
    
                    this.margin.left = showY1OnRight ? maxSecondYaxisSide : maxMainYaxisSide;
                    this.margin.right = showY1OnRight ? maxMainYaxisSide : maxSecondYaxisSide;
                    this.margin.bottom = xMax;
    
                    // re-calculate the axes with the new margins
                    var previousTickCountY1 = this.yAxisProperties.values.length;
                    this.calculateAxes(this.categoryAxisProperties, this.valueAxisProperties, this.textProperties, true);
    
                    // the minor padding adjustments could have affected the chosen tick values, which would then need to calculate margins again
                    // e.g. [0,2,4,6,8] vs. [0,5,10] the 10 is wider and needs more margin.
                    if (this.yAxisProperties.values.length === previousTickCountY1)
                        doneWithMargins = true;
                }
                var columnChartDrawInfo = this.columnChart.drawColumns(!suppressAnimations /* useAnimations */);
                
                if (this.viewportIn.width === 0 || this.viewportIn.height === 0) {
                    return;
                }
    
                if (this.tooltipsEnabled)
                    TooltipManager.addTooltip(columnChartDrawInfo.shapesSelection,(tooltipEvent: TooltipEvent) => tooltipEvent.data.tooltipInfo);
                var allDataPoints: StackedChartGMODataPoint[] = [];
                var behaviorOptions: ColumnGMOBehaviorOptions = undefined;
                //debugger;
                var data = this.data;
                
                if (this.interactivityService) {
                    //var series = this.dataViewCat.values;
                    //for (var i = 0, ilen = series.length; i < ilen; i++) {
                    //    allDataPoints = allDataPoints.concat(series[i].values[0]);
                    for (var i = 0, ilen = data.series.length; i < ilen; i++) {
                        allDataPoints = allDataPoints.concat(data.series[i].data);
                    }
                }
                
                
                
                this.renderChart(mainAxisScale, this.xAxisProperties, this.yAxisProperties, tickLabelMargins, chartHasAxisLabels, axisLabels, suppressAnimations);
                
                this.updateAxis();
                
                //data labels
                if(this.data.labelSettings.show){
                    var dataLabelPoints = [];
                    for (var a = 0; a < columnChartDrawInfo.labelDataPoints.length; a++) {
                        var DataLabelValue = parseFloat(columnChartDrawInfo.labelDataPoints[a].text);
                        if(DataLabelValue > 0){
                            dataLabelPoints.push(columnChartDrawInfo.labelDataPoints[a].text)
                        }
                    }
                    var allBoxes = this.root.selectAll('.mainGraphicsContext > svg > g > rect');
                    var allBoxesLength = allBoxes[0].length-1;
                    var boxWidth = parseFloat(allBoxes[0][0].width.baseVal.valueAsString);
                    var dataLabelSvg = this.root.select('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext')
                        .append('g')
                        .classed('dataLabels',true)
                    
                    var objects = this.dataView.metadata.objects;
                    var labelsObj = <powerbi.extensibility.utils.chart.dataLabel.DataLabelObject>objects['labels'];
                    var precision = labelsObj.labelPrecision;
                    
                    while(allBoxesLength >= 0){
                        var boxHeight = parseFloat(allBoxes[0][allBoxesLength].height.baseVal.valueAsString);
                        var boxX = parseFloat(allBoxes[0][allBoxesLength].x.baseVal.valueAsString);
                        var boxY = parseFloat(allBoxes[0][allBoxesLength].y.baseVal.valueAsString);
                        var boxCenterX = boxX + boxWidth/2;
                        var boxCenterY = boxY + boxHeight/2;                    
                        var formattedDataLabelText = this.format(parseFloat(dataLabelPoints[allBoxesLength]), 1, precision, 'sample');
                        
                        var dataLabelText = dataLabelSvg
                            .append('text')
                            .classed('dataLabel',true)
                            .attr('x',boxCenterX)
                            .attr('y',boxCenterY+3)
                            .attr('text-anchor','middle')
                            .attr('font-size',this.data.labelSettings.fontSize)
                            .text(formattedDataLabelText+'%')
                            
                        var dataLabelBBox = dataLabelText.node().getBBox();
                        if(boxX + boxWidth < dataLabelBBox.x + dataLabelBBox.width || boxY + boxHeight < dataLabelBBox.y + dataLabelBBox.height) {
                                dataLabelText.text('');
                        }
                        allBoxesLength--
                    }
                    this.root.selectAll('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext > .dataLabels > .dataLabel').style('fill', this.data.labelSettings.labelColor);
                    this.root.selectAll('.svgScrollable > .axisGraphicsContext > .mainGraphicsContext > .dataLabels > .dataLabel').style('font-family', 'wf_standard-font,helvetica,arial,sans-serif');
                }
                //total, secondary, tertiary and quarternay
                var sampleFilterSettings: sampleFilterSettings = this.getSampleFilterSettings(this.dataViews[0]);
                //var textWrapSettings: textWrapSettings = this.getTextWrapSettings(this.dataViews[0]); 
                var measureTitlesSettings: measureTitlesSettings = this.getMeasureTitlesSettings(this.dataViews[0]);
                var totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
                var secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]);
                var tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]);
                var quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]);     
                
                var dataCategories = this.data.categories;
                var dataSeries = this.data.series;
                var aggregatedValues = [];
                var aggregatedSecValues = [];
                var aggregatedTerValues = [];
                var aggregatedQuatValues = [];
                var tempAggregatedQuatValues = [];
                var tempAggregatedTerValues = [];
                var tempAggregatedSecValues = [];
                
                var sampleSize;
                sampleSize = -9999;
                
                var numberOfMeasures = (totalLabelSettings.show? 1 : 0) + 
                    (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) +
                    (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) +
                    (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0);
                    
                    
                var measureCounter = numberOfMeasures, yAxisForLabels = 20, yAxisMultiplier = 27;
                
                var noAxis = false;
                if(dataCategories.length === 1 && dataCategories[0] === null){
                    noAxis = true;
                }
                
                var maxLabelTextWidth = measureTitlesSettings.ellipsesStrength;
                
                if(totalLabelSettings.show){
                    if (this.dataViews[2] && this.dataViews[2].categorical && this.dataViews[2].categorical.values) {
                        for(var i = 0; i < this.dataViews[2].categorical.values[0].values.length; i++){
                            if(this.dataViews[2].categorical.values[0].values[i] !== null){
                                sampleSize = this.dataViews[2].categorical.values[0].values[i];
                                break;
                            }
                        }
                    }
                    if(noAxis){
                        if(dataSeries.length !== 0){
                            var sum = 0;
                            for (var i = 0; i < dataSeries.length; i++){ //14
                                    if(dataSeries[i].data[0]){
                                        sum = sum + this.data.series[i].data[0].valueOriginal;
                                    }
                            }
                            aggregatedValues.push(sum);
                        }
                    }
                    else{
                        for(var k = 0; k < dataCategories.length; k++){ //16
                            var sum = 0;
                            for (var i = 0; i < dataSeries.length; i++){ //14
                                for(var j = 0; j < dataCategories.length; j++){ //16
                                    if(dataSeries[i].data[j]){
                                        if(dataSeries[i].data[j].categoryValue == dataCategories[k]){
                                            sum = sum + this.data.series[i].data[j].valueOriginal;
                                            break;
                                        }
                                    }
                                    else{
                                        break;
                                    }
                                }
                            }
                            aggregatedValues.push(sum);
                        }
                    }
                    var totalTitleTextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: totalLabelSettings.titleText,
                        fontFamily: "wf_segoe-ui_Semibold",
                        fontSize: '12px'
                    };
                    var totalTitleText = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(totalTitleTextProperties, maxLabelTextWidth);
                    
                    this.root.select('.cartesianChart')
                        .append('text')
                        .classed('measureLabelTitle',true)
                        .attr('x',1)
                        .attr('y',yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter))
                        .attr('font-size','12px')
                        .attr('font-family','wf_segoe-ui_Semibold')
                        .attr('fill','#777')
                        .text(totalTitleText)
                        .append('title')
                        .text(totalLabelSettings.titleText)
                }
                
                //secondary
                if(this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values){
                    if(noAxis){
                        var totalValuesLength = this.dataViews[1].categorical.values.length;
                        var sumSec;
                        sumSec = 0;
                        for (var i = 0; i < totalValuesLength; i++){ //14
                                    sumSec = sumSec + this.dataViews[1].categorical.values[i].values[0];
                        }
                        aggregatedSecValues.push(sumSec);
                    }
                    else{
                        aggregatedSecValues = this.dataViews[1].categorical.values[0].values;
                    }
                    
					tempAggregatedSecValues = aggregatedSecValues.slice(0);
					if(this.removeFlags.length > 0){
						this.spliceMeasures(tempAggregatedSecValues);
					}
					
                    var secMeasuretextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: secondaryLabelSettings.titleText,
                        fontFamily: "wf_segoe-ui_Semibold",
                        fontSize: '12px'
                    };
                    var secMeasuretext = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(secMeasuretextProperties, maxLabelTextWidth);    
                    this.root.select('.cartesianChart')
                        .append('text')
                        .attr('x',1)
                        .attr('y',yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter))
                        .classed('measureLabelTitle',true)
                        .attr('font-size','12px')
                        .attr('font-family','wf_segoe-ui_Semibold')
                        .attr('fill','#777')
                        .text(secMeasuretext)
                        .append('title')
                        .text(secondaryLabelSettings.titleText)
                }
                
                //tertiary
                if(this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values){
                    if(noAxis){
                        var totalValuesLength = this.dataViews[3].categorical.values.length;
                        var sumTer;
                        sumTer = 0;
                        for (var i = 0; i < totalValuesLength; i++){ //14
                                    sumTer = sumTer + this.dataViews[3].categorical.values[i].values[0];
                        }
                        aggregatedTerValues.push(sumTer);
                    }
                    else{
                        aggregatedTerValues = this.dataViews[3].categorical.values[0].values;
                    }
                    
					tempAggregatedTerValues = aggregatedTerValues.slice(0);
					if(this.removeFlags.length > 0){
						this.spliceMeasures(tempAggregatedTerValues);
					}
					
                    var terMeasuretextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: tertiaryLabelSettings.titleText,
                        fontFamily: "wf_segoe-ui_Semibold",
                        fontSize: '12px'
                    };
                    var terMeasuretext = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(terMeasuretextProperties, maxLabelTextWidth);    
                    this.root.select('.cartesianChart')
                        .append('text')
                        .attr('x',1)
                        .attr('y',yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter))
                        .classed('measureLabelTitle',true)
                        .attr('font-size','12px')
                        .attr('font-family','wf_segoe-ui_Semibold')
                        .attr('fill','#777')
                        .text(terMeasuretext)
                        .append('title')
                        .text(tertiaryLabelSettings.titleText)
                }
                
                //quarternary
                if(this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values){
                    if(noAxis){
                        var totalValuesLength = this.dataViews[4].categorical.values.length;
                        var sumQuat;
                        sumQuat = 0;
                        for (var i = 0; i < totalValuesLength; i++){ //14
                                    sumQuat = sumQuat + this.dataViews[4].categorical.values[i].values[0];
                        }
                        aggregatedQuatValues.push(sumQuat);
                        noAxis = true;
                    }
                    else{
                        aggregatedQuatValues = this.dataViews[4].categorical.values[0].values;
                    }
					
                    tempAggregatedQuatValues = aggregatedQuatValues.slice(0);
					if(this.removeFlags.length > 0){
						this.spliceMeasures(tempAggregatedQuatValues);
					}
					
                    var quatMeasuretextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: quaternaryLabelSettings.titleText,
                        fontFamily: "wf_segoe-ui_Semibold",
                        fontSize: '12px'
                    };
                    var quatMeasuretext = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(quatMeasuretextProperties, maxLabelTextWidth);
                    this.root.select('.cartesianChart')
                        .append('text')
                        .attr('x',1)
                        .attr('y',yAxisForLabels - numberOfMeasures + (yAxisMultiplier * --measureCounter))
                        .classed('measureLabelTitle',true)
                        .attr('font-size','12px')
                        .attr('font-family','wf_segoe-ui_Semibold')
                        .attr('fill','#777')
                        .text(quatMeasuretext)
                        .append('title')
                        .text(quaternaryLabelSettings.titleText)
                }
                
                var boxes = this.root.selectAll('.mainGraphicsContext > svg > g:last-child > rect');
                var xTicks = this.root.selectAll('.axisGraphicsContext > .x > .tick');
                var barWidthValue = parseInt(boxes[0][0].width.baseVal.valueAsString);
                
                var len;
                if(dataCategories.length === 1 && dataCategories[0] === null){
                    len = 0;
                }
                else{
                    len = xTicks[0].length-1;
                }
                
                while(len >= 0){
                    var xAxisValue;
                    var yAxisValue = 32;
                    if(noAxis){
                        var barXValue = parseInt(boxes[0][0].x.baseVal.valueAsString);
                        xAxisValue = barXValue + barWidthValue/2; 
                    }
                    else{
                        xAxisValue = xTicks[0][len].getAttribute('transform').match(/translate\(([^)]+)\)/)[1] ? parseInt(xTicks[0][len].getAttribute('transform').match(/translate\(([^)]+)\)/)[1]) : 0;
                    }
                    
                    //total
                    if(totalLabelSettings.show){
                        var formattedTotalText = this.format(parseInt(aggregatedValues[len], 10), totalLabelSettings.displayUnits, totalLabelSettings.textPrecision, 'sample');
                        
                        if(sampleSize != -9999 && sampleSize > aggregatedValues[len]){
                            formattedTotalText = formattedTotalText + '*';
                        }
                        
                        yAxisValue = yAxisValue - 27;
                        
                        var DatatextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                            text: formattedTotalText,
                            fontFamily: "Segoe UI",
                            fontSize: totalLabelSettings.fontSize +'px'
                        };
                        var totalText = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(DatatextProperties,barWidthValue);
                        this.root.select('.svgScrollable > .axisGraphicsContext')
                            .append('text')
                            .classed('totalLabels',true)
                            .attr('x',xAxisValue)
                            .attr('y',yAxisValue)
                            .attr('text-anchor','middle')
                            .attr('font-size',totalLabelSettings.fontSize)
                            .text(totalText)
                    }
                    
                    //secondary        
                    if(this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values){
                        var formatString = '0';
                            formatString = this.dataViews[1].categorical.values[0].source.format;
                        var formatter = valueFormatter.create({ format: formatString, value: secondaryLabelSettings.displayUnits, precision: secondaryLabelSettings.textPrecision });
                        var formattedSecondaryText;
                        if(tempAggregatedSecValues[len] !== null){
                            formattedSecondaryText = formatter.format(tempAggregatedSecValues[len]);
                        }
                        else{
                            formattedSecondaryText = "0"
                        }         
                        
                        yAxisValue = yAxisValue - 27;
                        
                        var secDatatextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: formattedSecondaryText,
                        fontFamily: "Segoe UI",
                        fontSize: secondaryLabelSettings.fontSize +'px'
                        };
                        var secText = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(secDatatextProperties,barWidthValue);
                        this.root.select('.svgScrollable > .axisGraphicsContext')
                            .append('text')
                            .classed('secLabels',true)
                            .attr('x',xAxisValue)
                            .attr('y',yAxisValue)
                            .attr('text-anchor','middle')
                            .attr('font-size',secondaryLabelSettings.fontSize)
                            .text(secText);
                    }
                    
                    //tertiary
                    if(this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values){
                        var formatString = '0';
                            formatString = this.dataViews[3].categorical.values[0].source.format;
                        var formatter = valueFormatter.create({ format: formatString, value: tertiaryLabelSettings.displayUnits, precision: tertiaryLabelSettings.textPrecision });
                        var formattedTertiaryText;
                        if(tempAggregatedTerValues[len] !== null){
                            formattedTertiaryText = formatter.format(tempAggregatedTerValues[len]);
                        }
                        else{
                            formattedTertiaryText = "0"
                        }        
                        
                        yAxisValue = yAxisValue - 27;
                         
                        var terDatatextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: formattedTertiaryText,
                        fontFamily: "Segoe UI",
                        fontSize: tertiaryLabelSettings.fontSize +'px'
                        };
                        var terText = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(terDatatextProperties,barWidthValue);
                        this.root.select('.svgScrollable > .axisGraphicsContext')
                            .append('text')
                            .classed('terLabels',true)
                            .attr('x',xAxisValue)
                            .attr('y',yAxisValue)
                            .attr('text-anchor','middle')
                            .attr('font-size',tertiaryLabelSettings.fontSize)
                            .text(terText);
                    }        
                          
                    //quarternary
                    if(this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values){
                        var formatString = '0';
                            formatString = this.dataViews[4].categorical.values[0].source.format;
                        var formatter = valueFormatter.create({ format: formatString, value: quaternaryLabelSettings.displayUnits, precision: quaternaryLabelSettings.textPrecision });
                        var formattedQuaternaryText;
                        if(tempAggregatedQuatValues[len] !== null){
                            formattedQuaternaryText = formatter.format(tempAggregatedQuatValues[len]);
                        }
                        else{
                            formattedQuaternaryText = "0"
                        }    
                        
                        yAxisValue = yAxisValue - 27;
                             
                        var quatDatatextProperties: powerbi.extensibility.utils.formatting.TextProperties = {
                        text: formattedQuaternaryText,
                        fontFamily: "Segoe UI",
                        fontSize: quaternaryLabelSettings.fontSize +'px'
                        };
                        var quatText = powerbi.extensibility.utils.formatting.textMeasurementService.getTailoredTextOrDefault(quatDatatextProperties,barWidthValue);
                        this.root.select('.svgScrollable > .axisGraphicsContext')
                            .append('text')
                            .classed('quatLabels',true)
                            .attr('x',xAxisValue)
                            .attr('y',yAxisValue)
                            .attr('text-anchor','middle')
                            .attr('font-size',quaternaryLabelSettings.fontSize)
                            .text(quatText);
                    }
                    len--;
                }
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .totalLabels').style('fill', totalLabelSettings.color);
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .secLabels').style('fill', secondaryLabelSettings.color);
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .terLabels').style('fill', tertiaryLabelSettings.color);
                this.root.selectAll('.svgScrollable > .axisGraphicsContext > .quatLabels').style('fill', quaternaryLabelSettings.color);
                //total, secondary, tertiary and quarternary
                
                if (!this.data)
                    return;   
                if (this.viewportIn.width > 0 && this.viewportIn.height > 0) {
                    this.mainGraphicsContext.attr('width', this.viewportIn.width)
                        .attr('height',(this.viewportIn.height));
                    var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                    if (!resize) {
                        if (isBarChart) {
                            var xZeroTick = this.xAxisGraphicsContext;
                            var xTransform = this.xAxisGraphicsContext.attr('transform');
                            var height: number = 0;
                            if (isNaN((parseInt(xTransform.split(' ')[1])))) {
                                height = (parseInt(xTransform.split(',')[1]));
                            }
                            else {
                                height = (parseInt(xTransform.split(' ')[1]));
                            }
                            this.mainGraphicsContext
                                .attr('height', height);
                        }
                        else {
                            var yZeroTick = this.y1AxisGraphicsContext.selectAll('g.tick').filter((data) => data === 0);
                            if(yZeroTick[0].length != 0){
                                var yTransform = yZeroTick.attr('transform');
                                var height: number = 0;
                                if (isNaN((parseInt(yTransform.split(' ')[1])))) {
                                    height = (parseInt(yTransform.split(',')[1]));
                                }
                                else {
                                    height = (parseInt(yTransform.split(' ')[1]));
                                }
                                this.mainGraphicsContext
                                    .attr('height', height);
                            }
                            
                        }
                    }
                }
                else {
                    this.mainGraphicsContext.attr('width', 0)
                        .attr('height', 0);
                }
                
                var isLegendPresent = false;
                var legendPosition = parseFloat(this.root.select('.legend').attr('orientation'));
                var customTitleHeight = parseFloat(this.root.select('.Title_Div_Text').style('height'));
                var legendHeight = parseFloat(this.root.select('.legend').style('height'));
                customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight);
                legendHeight = PixelConverter.fromPointToPixel(legendHeight);
                if (isNaN(legendHeight) || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
    
                    legendHeight = 0;
                }
                for (var i = 0; i < this.dataViews[0].metadata.columns.length; i++) {
                    if (this.dataViews && this.dataViews[0].metadata && this.dataViews[0].metadata.columns[i].roles && this.dataViews[0].metadata.columns[i].roles.hasOwnProperty('Series')) {
                        isLegendPresent = true;
                        break;
                    }
                    else {
                        isLegendPresent = false;
                    }
                }
                if (this.isSecondaryMeasure && isLegendPresent) {
                    this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 40)');
                    this.xAxisGraphicsContext
                        .attr('transform', SVGUtil.translate(0, this.viewportIn.height + 40));
                    this.y1AxisGraphicsContext
                        .attr('transform', SVGUtil.translate(showY1OnRight ? this.viewportIn.width : 0, 40));
                }
                else {
                    this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 20)');
                    this.xAxisGraphicsContext
                        .attr('transform', SVGUtil.translate(0, this.viewportIn.height + 20));
                    this.y1AxisGraphicsContext
                        .attr('transform', SVGUtil.translate(showY1OnRight ? this.viewportIn.width : 0, 20));
    
                }
                if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && isBarChart) {
                    this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10 - customTitleHeight + 33.333 - legendHeight + 67 - 40)); //67 = initial Legend Height; 33.33 = initial Title Height
                }
                else if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && !isBarChart) {
                    this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10));
                }
                else if (!isLegendPresent && isBarChart) {
                    this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10 - customTitleHeight + 33.33));
                }
                else {
                    this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10));
                }
    
                if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter' || this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    this.svg.selectAll('.mainGraphicsContext').attr('transform', 'translate(0, 20)');
                    this.xAxisGraphicsContext
                        .attr('transform', SVGUtil.translate(0, this.viewportIn.height + 20));
                    this.y1AxisGraphicsContext
                        .attr('transform', SVGUtil.translate(showY1OnRight ? this.viewportIn.width : 0, 20));
    
                    if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && isBarChart) {
                        this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10 - customTitleHeight + 33.333)); // 33.33 = initial Title Height
                    }
                    else if (((this.isSecondaryMeasure && isLegendPresent) || (!this.isSecondaryMeasure && isLegendPresent)) && !isBarChart) {
                        this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10));
                    }
                    else {
                        this.axisGraphicsContext.attr('transform', SVGUtil.translate(this.margin.left, -10));
                    }
                }
                
                var legendHeight = parseFloat(this.root.select('.legend').style('height'))+10;
                
                if (isNaN(legendHeight) || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                    legendHeight = 0;
                    if (!this.legendObjectProperties['show']){
                        this.root.select('.navArrow').remove();
                    }
                }
                if(legendPosition === 0 || legendPosition ===5){
                    this.svg.style('margin-top',legendHeight+'px');
                }
                
                
                behaviorOptions = {
                    datapoints: allDataPoints,
                    bars: columnChartDrawInfo.shapesSelection,
                    hasHighlights: data.hasHighlights,
                    mainGraphicsContext: this.mainGraphicsContext,
                    viewport: columnChartDrawInfo.viewport,
                    axisOptions: columnChartDrawInfo.axisOptions,
                    showLabel: data.labelSettings.show
                };
                this.addUnitTypeToAxisLabel(this.xAxisProperties, this.yAxisProperties);
                SVGUtil.flushAllD3TransitionsIfNeeded(this.options);
                
                return { dataPoints: allDataPoints, behaviorOptions: behaviorOptions, labelDataPoints: columnChartDrawInfo.labelDataPoints, labelsAreNumeric: true };
            }
			
			public spliceMeasures(measure : any[]){
				if(this.removeFlags.length){
					for(var i = 0; i < this.removeFlags.length; i++){
						measure.splice(this.removeFlags[i],1);
					}
				}
			}
			
            private getMaxMarginFactor(): number {
                return this.options.style.maxMarginFactor || 0.25;
            }
    
            private hideAxisLabels(): boolean {
                if (this.cartesianSmallViewPortProperties) {
                    if (this.cartesianSmallViewPortProperties.hideAxesOnSmallViewPort
                        && ((this.viewport.height) < this.cartesianSmallViewPortProperties.MinHeightAxesVisible)
                        && !this.options.interactivity.isInteractiveLegend) {
                        return true;
                    }
                }
                return false;
            }
            private renderBackground() {
                this.backgroundGraphicsContext
                    .attr('width', 0)
                    .attr('height', 0);
            }
            private renderChart(
                mainAxisScale: any,
                xAxis: IAxisProperties,
                yAxis: IAxisProperties,
                tickLabelMargins: any,
                chartHasAxisLabels: boolean,
                axisLabels: ChartAxesLabels,
                suppressAnimations: boolean,
                scrollScale?: any,
                extent?: number[]) {
                var bottomMarginLimit = this.bottomMarginLimit;
                var leftRightMarginLimit = this.leftRightMarginLimit;
                var duration = AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
                this.renderBackground();
                var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                //hide show x-axis here
                
                xAxis.axis.orient("bottom");
                if (!xAxis.willLabelsFit)
                    xAxis.axis.tickPadding(10);

                var textWrapSettings: textWrapSettings = this.getTextWrapSettings(this.dataViews[0]);     

                if(textWrapSettings.show){
                    xAxis.willLabelsWordBreak = true;
                }    
                else{
                    xAxis.willLabelsWordBreak = false;
                }

                var xAxisGraphicsElement = this.xAxisGraphicsContext;
                if (duration) {
                    xAxisGraphicsElement
                        .transition()
                        .duration(duration)
                        .call(xAxis.axis)
                        .call(this.darkenZeroLine);
                }
                else {
                    xAxisGraphicsElement
                        .call(xAxis.axis)
                        .call(this.darkenZeroLine);
                }
                var xZeroTick = xAxisGraphicsElement.selectAll('g.tick').filter((data) => data === 0);
                var xAllTicks = xAxisGraphicsElement.selectAll('g.tick');
                var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                if (xZeroTick) {
                    var xZeroColor = this.getValueAxisFill();
                    if (xZeroColor) {
                        isBarChart ? xZeroTick.selectAll('line').style({ 'display': 'none' }) : xZeroTick.selectAll('line').style({ 'display': 'none' });
                        isBarChart ? xAllTicks.selectAll('line').style({ 'display': 'none' }) : xAllTicks.selectAll('line').style({ 'display': 'none' });
                    }
                }

                var xAxisTextNodes = xAxisGraphicsElement.selectAll('text');
                if (xAxis.willLabelsWordBreak) {
                    xAxisTextNodes
                        .call(AxisHelper.LabelLayoutStrategy.wordBreak, xAxis, bottomMarginLimit);
                } else {
                    xAxisTextNodes
                        .call(AxisHelper.LabelLayoutStrategy.rotate,
                        bottomMarginLimit,
                        TextMeasurementService.getTailoredTextOrDefault,
                        CartesianChartGMO.AxisTextProperties,
                        !xAxis.willLabelsFit && AxisHelper.isOrdinalScale(xAxis.scale),                        
                        bottomMarginLimit === tickLabelMargins.xMax,
                        xAxis,
                        this.margin,
                        this.isXScrollBarVisible || this.isYScrollBarVisible);
                }
                if (!duration) {
                    xAxisGraphicsElement.selectAll('text')
                    .append('title')
                    .text((d, i) => xAxis.values[i]);
                }
                xAxisGraphicsElement.selectAll('g.tick').selectAll('line').style({ 'display': 'none' })
                    
                if (this.shouldRenderAxis(xAxis)) {
                    this.xAxisGraphicsContext.selectAll('*').style('visibility','visible');
                    
                }
                else {
                    this.xAxisGraphicsContext.selectAll('*').style('visibility','hidden');
                }
    
                if (this.shouldRenderAxis(yAxis)) {
                    var yAxisOrientation = this.yAxisOrientation;
    
                    yAxis.axis
                        .tickSize(-this.viewportIn.width)
                        .tickPadding(10)
                        .orient(yAxisOrientation.toLowerCase());
    
                    var y1AxisGraphicsElement = this.y1AxisGraphicsContext;
                    if (duration) {
                        y1AxisGraphicsElement
                            .transition()
                            .duration(duration)
                            .call(yAxis.axis)
                            .call(this.darkenZeroLine);
                    }
                    else {
                        y1AxisGraphicsElement
                            .call(yAxis.axis)
                            .call(this.darkenZeroLine);
                    }
    
                    var yZeroTick = y1AxisGraphicsElement.selectAll('g.tick').filter((data) => data === 0);
                    var yAllTicks = y1AxisGraphicsElement.selectAll('g.tick');
                    if (yZeroTick) {
                        var yZeroColor = this.getCategoryAxisFill();
                        if (yZeroColor) {
                            isBarChart ? yZeroTick.selectAll('line').style({ 'display': 'none' }) : yZeroTick.selectAll('line').style({ 'display': 'inline' });
                            isBarChart ? yAllTicks.selectAll('line').style({ 'display': 'none' }) : yAllTicks.selectAll('line').style({ 'display': 'inline' });
                        }
                    }
                    if (tickLabelMargins.yLeft >= leftRightMarginLimit) {
                        y1AxisGraphicsElement.selectAll('text')
                            .call(AxisHelper.LabelLayoutStrategy.clip,
                            // Can't use padding space to render text, so subtract that from available space for ellipses calculations
                            leftRightMarginLimit - 40,
                            TextMeasurementService.svgEllipsis);
                    }
    
                    // TODO: clip (svgEllipsis) the Y2 labels
                }
                else {
                    this.y1AxisGraphicsContext.selectAll('*').remove();
                }
                // Axis labels
                //TODO: Add label for second Y axis for combo chart
                if (chartHasAxisLabels) {
                    var hideXAxisTitle = !this.shouldRenderAxis(xAxis, "showAxisTitle");
                    var hideYAxisTitle = !this.shouldRenderAxis(yAxis, "showAxisTitle");
                    var hideY2AxisTitle = this.valueAxisProperties && this.valueAxisProperties["secShowAxisTitle"] != null && this.valueAxisProperties["secShowAxisTitle"] === false;
                    this.renderAxesLabels(axisLabels, this.legend.getMargins().height, hideXAxisTitle, hideYAxisTitle, hideY2AxisTitle);
                }
                else {
                    this.axisGraphicsContext.selectAll('.xAxisLabel').remove();
                    this.axisGraphicsContext.selectAll('.yAxisLabel').remove();
                }
            }
            private darkenZeroLine(g: d3.Selection<SVGElement>): void {
                var zeroTick = g.selectAll('g.tick').filter((data) => data === 0).node();
                if (zeroTick) {
                    d3.select(zeroTick).select('line').classed('zero-line', true);
                }
            }
            private getValueAxisFill(): Fill {
                if (this.dataView && this.dataView.metadata.objects) {
                    var label = this.dataView.metadata.objects['valueAxis'];
                    if (label)
                        return <Fill>label['axisColor'];
                }
    
                return { solid: { color: '#333' } };
            }
    
            private getCategoryAxisFill(): Fill {
                if (this.data && this.dataView.metadata.objects) {
                    var label = this.dataView.metadata.objects['categoryAxis'];
                    if (label) {
                        return <Fill>label['axisColor'];
                    }
                }
                return { solid: { color: '#333' } };
            }
            private renderAxesLabels(axisLabels: ChartAxesLabels, legendMargin: number, hideXAxisTitle: boolean, hideYAxisTitle: boolean, hideY2AxisTitle: boolean): void {
                this.axisGraphicsContext.selectAll('.xAxisLabel').remove();
                this.axisGraphicsContext.selectAll('.yAxisLabel').remove();
    
                var margin = this.margin;
                var width = this.viewportIn.width;
                var height = this.viewportIn.height;
                var fontSize = StackedChartGMO.AxisFontSize;
                var yAxisOrientation = this.yAxisOrientation;
                var showY1OnRight = yAxisOrientation === yAxisPosition.right;
                var isBarChart = EnumExtensions.hasFlag(this.chartType, flagBar);
                var translateHeight = height - fontSize - 2;
                if (isBarChart) {
                    translateHeight += 25;
                }
    
                if (!hideXAxisTitle) {
                    var xAxisLabel = this.axisGraphicsContext.append("text")
                        .style("text-anchor", "middle")
                        .text(axisLabels.x)
                        .call((text: d3.Selection<SVGElement>) => {
                        text.each(function () {
                            var text = d3.select(this);
                            text.attr({
    
                                "class": "xAxisLabel",
                                "transform": SVGUtil.translate(width / 2, translateHeight)
                            });
                        });
                    });
                    xAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                        width,
                        TextMeasurementService.svgEllipsis);
                }
    
                if (!hideYAxisTitle) {
                    var yAxisLabel = this.axisGraphicsContext.append("text")
                        .style("text-anchor", "middle")
                        .text(axisLabels.y)
                        .call((text: d3.Selection<SVGElement>) => {
                        text.each(function () {
                            var text = d3.select(this);
                            text.attr({
    
                                "class": "yAxisLabel",
                                "transform": "rotate(-90)",
                                "y": showY1OnRight ? width + margin.right - fontSize : -margin.left,
                                "x": -((height - margin.top - legendMargin) / 2),
                                "dy": "1em"
                            });
    
                        });
                    });
                    yAxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                        height - (margin.bottom + margin.top),
                        TextMeasurementService.svgEllipsis);
                }
    
                if (!hideY2AxisTitle && axisLabels.y2) {
                    var y2AxisLabel = this.axisGraphicsContext.append("text")
                        .style("text-anchor", "middle")
                        .text(axisLabels.y2)
                        .call((text: d3.Selection<SVGElement>) => {
                        text.each(function () {
                            var text = d3.select(this);
                            text.attr({
    
                                "class": "yAxisLabel",
                                "transform": "rotate(-90)",
                                "y": showY1OnRight ? -margin.left : width + margin.right - fontSize,
                                "x": -((height - margin.top - legendMargin) / 2),
                                "dy": "1em"
                            });
    
                        });
                    });
                    y2AxisLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                        height - (margin.bottom + margin.top),
                        TextMeasurementService.svgEllipsis);
                }
            }
            private adjustMargins(): void {
                // Adjust margins if ticks are not going to be shown on either axis
                var xAxis = this.element.find('.x.axis');
    
                if (AxisHelper.getRecommendedNumberOfTicksForXAxis(this.viewportIn.width) === 0
                    && AxisHelper.getRecommendedNumberOfTicksForYAxis(this.viewportIn.height) === 0) {
                    this.margin = {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    };
                    xAxis.hide();
                } else {
                    xAxis.show();
                }
            }
    
            private updateAxis(): void {
                var totalLabelSettings: totalLabelSettings = this.getTotalLabelSettings(this.dataViews[0]); 
                var secondaryLabelSettings: secondaryLabelSettings = this.getSecondaryLabelSettings(this.dataViews[1]);
                var tertiaryLabelSettings: tertiaryLabelSettings = this.getTertiaryLabelSettings(this.dataViews[3]);
                var quaternaryLabelSettings: quaternaryLabelSettings = this.getQuaternaryLabelSettings(this.dataViews[4]); 
                    
                var legendPosition = parseFloat(this.root.select('.legend').attr('orientation'));
                var customTitleHeight = this.root.select('.Title_Div_Text') && this.root.select('.Title_Div_Text').style('height') && parseFloat(this.root.select('.Title_Div_Text').style('height'));
                if (isNaN(customTitleHeight)) {
                    customTitleHeight = 0;
                }
                var legendHeight = parseFloat(this.root.select('.legend').style('height'));
                
                var legendWidth = parseFloat(this.root.select('.legend').style('width'));
                
                var numberOfMeasures = (totalLabelSettings.show? 1 : 0) + 
                    (this.dataViews[1] && this.dataViews[1].categorical && this.dataViews[1].categorical.values ? 1 : 0) +
                    (this.dataViews[3] && this.dataViews[3].categorical && this.dataViews[3].categorical.values ? 1 : 0) +
                    (this.dataViews[4] && this.dataViews[4].categorical && this.dataViews[4].categorical.values ? 1 : 0);
                
                var customHeight;
                
                switch(numberOfMeasures){
                    case 0 : customHeight = 0;
                        break;
                    case 1 : customHeight = 25;
                        break;
                    case 2 : customHeight = 50;
                        break;
                    case 3 : customHeight = 75;
                        break;
                    case 4 : customHeight = 100;
                        break;           
                }
                
                if (isNaN(legendHeight) || isNaN(legendWidth) || 0 === legendWidth || !(0 === legendPosition || 5 === legendPosition || 1 === legendPosition || 6 === legendPosition) || !this.legendObjectProperties['show'] || !this.isLegendValue) {
                    legendHeight = 0;
                }
                customTitleHeight = PixelConverter.fromPointToPixel(customTitleHeight);
                legendHeight = PixelConverter.fromPointToPixel(legendHeight);
                this.adjustMargins();
                if (this.viewportIn.height < (customTitleHeight + legendHeight + customHeight)) {
                    this.viewportIn.height = (customTitleHeight + legendHeight + customHeight) - this.viewportIn.height;
                }
                else {
                    this.viewportIn.height -= (customTitleHeight + legendHeight + customHeight);
                }
                var yAxisOrientation = this.yAxisOrientation;
                var showY1OnRight = yAxisOrientation === yAxisPosition.right;
    
                var heightDifference = this.viewport.height - legendHeight;
                if (heightDifference < 0) {
                    heightDifference = legendHeight - this.viewport.height;
                } 
                var widthDifference = this.viewport.width - legendWidth;
                if (widthDifference < 0) {
                    widthDifference = -(this.viewport.width - legendWidth);
                } 
                
                this.svg.attr({
                    'width': this.viewport.width,
                    'height': heightDifference
                });
    
                this.svgScrollable.attr({
                    'width': this.viewport.width,
                    'height': heightDifference
                });
    
                if (this.legendObjectProperties && (this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    this.svgScrollable.attr({
                        'width': widthDifference,
                        'height': heightDifference
                    });
                }
                this.svgScrollable.attr({
                    'x': 0
                });
                this.axisGraphicsContextScrollable.attr('transform', SVGUtil.translate(this.margin.left, -10 + customHeight));
    
                if (this.isXScrollBarVisible) {
                    this.svgScrollable.attr({
                        'x': this.margin.left
                    });
                    this.axisGraphicsContextScrollable.attr('transform', SVGUtil.translate(0, this.margin.top));
                    this.svgScrollable.attr('width', this.viewportIn.width);
                    this.svg.attr('width', this.viewport.width)
                        .attr('height', this.viewport.height + this.ScrollBarWidth);
                }
                else if (this.isYScrollBarVisible) {
                    this.svgScrollable.attr('height', this.viewportIn.height + this.margin.top);
                    this.svg.attr('width', this.viewport.width + this.ScrollBarWidth)
                        .attr('height', this.viewport.height);
                }
            }
            private getUnitType(xAxis: IAxisProperties) {
                if (xAxis.formatter &&
                    xAxis.formatter.displayUnit &&
                    xAxis.formatter.displayUnit.value > 1)
                    return xAxis.formatter.displayUnit.title;
                return null;
            }
    
            private addUnitTypeToAxisLabel(xAxis: IAxisProperties, yAxis: IAxisProperties): void {
                var unitType = this.getUnitType(xAxis);
                if (xAxis.isCategoryAxis) {
                    this.categoryAxisHasUnitType = unitType !== null;
                }
                else {
                    this.valueAxisHasUnitType = unitType !== null;
                }
    
                if (xAxis.axisLabel && unitType) {
                    if (xAxis.isCategoryAxis) {
                        xAxis.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, xAxis.axisLabel, unitType);
                    }
                    else {
                        xAxis.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, xAxis.axisLabel, unitType);
                    }
                }
    
                unitType = this.getUnitType(yAxis);
    
                if (!yAxis.isCategoryAxis) {
                    this.valueAxisHasUnitType = unitType !== null;
                }
                else {
                    this.categoryAxisHasUnitType = unitType !== null;
                }
    
                if (yAxis.axisLabel && unitType) {
                    if (!yAxis.isCategoryAxis) {
                        yAxis.axisLabel = AxisHelper.createAxisLabel(this.valueAxisProperties, yAxis.axisLabel, unitType);
                    }
                    else {
                        yAxis.axisLabel = AxisHelper.createAxisLabel(this.categoryAxisProperties, yAxis.axisLabel, unitType);
                    }
                }
            }
            public onClearSelection(): void {
                if (this.interactivityService) {
                    this.interactivityService.clearSelection();
                }
            }
    
            public getVisualCategoryAxisIsScalar(): boolean {
                return this.data ? this.data.scalarCategoryAxis : false;
            }
    
            public getSupportedCategoryAxisType(): string {
                var metaDataColumn = this.data ? this.data.categoryMetadata : undefined;
                var valueType = AxisHelper.getCategoryValueType(metaDataColumn);
                var isOrdinal = AxisHelper.isOrdinal(valueType);
                return isOrdinal ? axisType.categorical : axisType.both;
            }
    
            public setFilteredData(startIndex: number, endIndex: number): CartesianData {
                var data = Prototype.inherit(this.data);
                data.series = ColumnChartGMO.sliceSeries(data.series, endIndex, startIndex);
                data.categories = data.categories.slice(startIndex, endIndex);
                this.columnChart.setData(data);
                return data;
            }
    
            public static getLabelFill(labelColor: string, isInside: boolean, isCombo: boolean): string {
                if (labelColor) {
                    return labelColor;
                }
                if (isInside && !isCombo) {
                    return powerbi.extensibility.utils.chart.dataLabel.utils.defaultInsideLabelColor;
                }
                return powerbi.extensibility.utils.chart.dataLabel.utils.defaultLabelColor;
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
    
        class ColumnChartConverterHelper implements IColumnChartConverterStrategy {
            private dataView: DataViewCategorical;
    
            constructor(dataView: DataViewCategorical) {
                this.dataView = dataView;
            }
    
            public getLegend(colors: IDataColorPalette, defaultLegendLabelColor: string, defaultColor?: string): LegendSeriesInfo {
                var legend: LegendDataPoint[] = [];
                var seriesSources: DataViewMetadataColumn[] = [];
                var seriesObjects: DataViewObjects[][] = [];
                var grouped: boolean = false;
    
                var colorHelper = new ColorHelper(colors, columnChartProps.dataPoint.fill, defaultColor);
                var legendTitle = undefined;
                if (this.dataView && this.dataView.values) {
                    var allValues = this.dataView.values;
                    var valueGroups = allValues.grouped();
    
                    var hasDynamicSeries = !!(allValues && allValues.source);
    
                    var formatStringProp = columnChartProps.general.formatString;
                    for (var valueGroupsIndex = 0, valueGroupsLen = valueGroups.length; valueGroupsIndex < valueGroupsLen; valueGroupsIndex++) {
                        var valueGroup = valueGroups[valueGroupsIndex],
                            valueGroupObjects = valueGroup.objects,
                            values = valueGroup.values;
    
                        for (var valueIndex = 0, valuesLen = values.length; valueIndex < 1; valueIndex++) {
                            var series = values[valueIndex];
                            var source = series.source;
                            seriesSources.push(source);
                            seriesObjects.push(series.objects);
    
                            var selectionId = series.identity ?
                                SelectionId.createWithIdAndMeasure(series.identity, source.queryName) :
                                SelectionId.createWithMeasure(this.getMeasureNameByIndex(valueIndex));
    
                            var label = converterHelper.getFormattedLegendLabel(source, allValues, formatStringProp);
    
                            var color = hasDynamicSeries
                                ? colorHelper.getColorForSeriesValue(valueGroupObjects || source.objects, allValues.identityFields, source.groupName)
                                : colorHelper.getColorForMeasure(valueGroupObjects || source.objects, source.queryName);
    
                            legend.push({
                                icon: LegendIcon.Box,
                                color: color,
                                label: label,
                                identity: selectionId,
                                selected: false,
                                tooltip: label,
                                measure: '',
                                secondarymeasure: '',
                                percentage: '',
                                percentageTooltip: '',
                                measureTooltip: '',
                                secondaryMeasureTooltip: '',
                                primaryIndicator: '',
                                secondaryIndicator: ''
                            });
    
                            if (series.identity && source.groupName !== undefined) {
                                grouped = true;
                            }
                        }
                    }
    
                    var dvValues = this.dataView.values;
                    legendTitle = dvValues && dvValues.source ? dvValues.source.displayName : "";
                }
    
                var legendData: LegendData = {
                    title: legendTitle,
                    primaryTitle: '',
                    secondaryTitle: '',
                    dataPoints: legend,
                    grouped: grouped,
                    labelColor: defaultLegendLabelColor,
                };
    
                return {
                    legend: legendData,
                    seriesSources: seriesSources,
                    seriesObjects: seriesObjects,
                };
            }
    
            public getValueBySeriesAndCategory(series: number, category: number): number {
                return parseFloat(this.dataView.values[series].values[category] ? this.dataView.values[series].values[category].toString() : "0");
            }
    
            public getMeasureNameByIndex(index: number): string {
                return this.dataView.values[index].source.queryName;
            }
    
            public hasHighlightValues(series: number): boolean {
                var column = this.dataView && this.dataView.values ? this.dataView.values[series] : undefined;
                return column && !!column.highlights;
            }
    
            public getHighlightBySeriesAndCategory(series: number, category: number): number {
                return parseFloat(this.dataView.values[series].highlights[category] ? this.dataView.values[series].highlights[category].toString() : "0");
            }
        }
    }