//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    chartFrameHelper.ts - helps a chart to draw the (somewhat complex) chart frame.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    export class chartFrameHelperClass extends dataChangerClass   
    {
         _root: SVGGElement;

        _chartFrame: vp.chartFrame.chartFrameEx;
        _chartFrameData: bps.ChartFrameData;
        _dataMgr: dataMgrClass;
        _transformer: transformerClass;

        _xTickBoxElements: HTMLElement[];
        _yTickBoxElements: HTMLElement[];

        constructor(parent: SVGGElement, dataMgr: dataMgrClass, transformer: transformerClass)
        {
            super();

            var rootW = vp.select(parent).append("g");
            this._root = rootW[0];

            this._dataMgr = dataMgr;
            this._transformer = transformer;

            //---- todo : add switch for facet frames ----
            this.createBigChartFrame();
        }

        selectXBoxByIndex(index: number)
        {
            var xElems = this._xTickBoxElements;
            if (index < 0)
            {
                index += xElems.length;
            }
            else
            {
                //---- true elements start at index=1 ----
                index++;
            }

            var elem = xElems[index];
            var e = { target: elem };

            this.doSearch(e, "X");
        }

        selectYBoxByIndex(index: number)
        {
            var yElems = this._yTickBoxElements;
            if (index < 0)
            {
                index += yElems.length;
            }
            else
            {
                //---- true elements start at index=1 ----
                index++;
            }

            var elem = yElems[index];
            var e = { target: elem };

            this.doSearch(e, "Y");
        }


        chartFrameRoot()
        {
            return this._root;
        }

        createBigChartFrame()
        {
            var svgParent = this._root;

            //---- create placeholder scales to initialize with ----
            var xData = vp.chartFrame.createAxisData(vp.scales.createLinear());
            var yData = vp.chartFrame.createAxisData(vp.scales.createLinear());

            //var daFrame = plotServices.currentTheme().getDrawingAttributes("chartFrame");
            var daFrame = null;     

            vp.select(svgParent)
                .clear()

            //---- create CHART FRAME control ----
            var chartFrame = vp.chartFrame.createChartFrameEx(svgParent, xData, yData)

            this._chartFrame = chartFrame;
        }

        /** converts a WORLD space scale to a SCREEN space scale. */
        cloneScale(oldScale: vp.scales.baseScale, attr: glUtils.glAttributeClass, rangeMin: number, rangeMax: number)
        {
            var myScale = null;
            var scaleType = bps.MappingSpread.normal;
            var oldScaleType = oldScale.scaleType();

            if (oldScaleType == vp.scales.ScaleType.linear)
            {
                if (scaleType == bps.MappingSpread.low)
                {
                    myScale = vp.scales.createLowBias()
                }
                else if (scaleType == bps.MappingSpread.high)
                {
                    myScale = vp.scales.createHighBias()
                }
                else 
                {
                    myScale = vp.scales.createLinear()
                }

                myScale
                    .domainMin(oldScale.domainMin())
                    .domainMax(oldScale.domainMax())
                    .rangeMin(rangeMin)
                    .rangeMax(rangeMax)
            }
            else if (oldScaleType == vp.scales.ScaleType.dateTime)
            {

                myScale = vp.scales.createDate()
                    .domainMin(oldScale.domainMin())
                    .domainMax(oldScale.domainMax())
                    .rangeMin(rangeMin)
                    .rangeMax(rangeMax)
            }
            else        // category
            {
                var catKeys = vp.utils.keys(oldScale.categoryKeys());

                if (oldScaleType == vp.scales.ScaleType.categoryIndex)
                {
                    myScale = vp.scales.createCategoryIndex()
                        .categoryKeys(catKeys)
                }
                else if (oldScaleType == vp.scales.ScaleType.categoryKey)
                {
                    myScale = vp.scales.createCategoryKey()
                        .categoryKeys(catKeys)
                }
                else
                {
                    throw "Unsupported scaleType: " + oldScaleType;
                }

                myScale
                    .range(rangeMin, rangeMax)
            }

            //---- convert expandSpace from 3D units to pixels ----
            var expandSpace = oldScale.expandSpace();
            expandSpace = this._transformer.worldSizeToScreen(expandSpace);

            myScale
                .expandSpace(expandSpace);

            return myScale;
        }

        createAxisData(scale: vp.scales.baseScale, attr: glUtils.glAttributeClass, rangeMin: number, rangeMax: number)
        {
            /// CAUTION: "scale" was built in world space, but rangeMin/rangeMax are in screen pixels.
            
            //---- todo: put a real, user-controllable value here ----
            var tickCount = 9;      // scale.getActualBreaks().length;

            if (scale.scaleType() == vp.scales.ScaleType.categoryIndex)
            {
                tickCount++;
            }

            //---- create special properties added by chartUtils.adjustScaleForBin() ----
            var anyScale = <any>scale;
            var formatter = anyScale._formatter;
            var breaks = anyScale._breaks;
            var labels = anyScale._labels;

            var newScale = this.cloneScale(scale, attr, rangeMin, rangeMax);

            //---- support case where we are scaling with numbers, but have a formatting string from Excel ----
            //---- in this case, ignore the Excel format, and do our own local formatting because when user has filtered view, ----
            //---- we can provide a closer fit to the values shown.  We may revisit this in the future ----
            if (formatter && formatter._colType == "number")
            {
                //---- remove the "General" formatter and create a smarter local formatter below ----
                formatter = null;
            }

            if (breaks && breaks.length)
            {
                var len = breaks.length;

                //---- for bin-related scales, since breaks could be non-linear, we need to ensure mapping is linear ----
                if (anyScale._binResults && !anyScale._useCategoryForBins) 
                {
                    if (!labels)
                    {
                        //---- create labes from original breaks ----
                        labels = breaks.map((data, index) =>
                        {
                            return (formatter) ? formatter(data) : (data + "");
                        });
                    }

                    //---- replace nonlinear breaks with linear breaks ----
                    breaks = vp.data.range(0, len - 1);
                }

                //---- when breaks are specified, they override domainMin/domainMax specifications ----
                newScale
                    .domainMin(breaks[0])
                    .domainMax(breaks[len - 1])
            }
            else if (anyScale._tickCount)
            {
                tickCount = anyScale._tickCount;
            }

            var isCategory = (scale.scaleType() == vp.scales.ScaleType.categoryIndex || scale.scaleType() == vp.scales.ScaleType.categoryKey);
            if (isCategory)
            {
                var catKeys = scale.categoryKeys();
                breaks = (catKeys) ? vp.utils.keys(catKeys) : null;
            }

            var axisData = vp.chartFrame.createAxisData(newScale, null, tickCount, breaks, labels, formatter);
            return axisData;
        }

        close()
        {
            vp.select(this._root)
                .clear();

            //this._chartFrame.close();       
        }

        fadeInOut(show: boolean)
        {
            //var cfd = this._chartFrameData;

            //if (show)
            //{
            //    vp.select(this._chartFrameRoot)
            //        .css("transition", "opacity .25s ease-in-out")
            //        .css("opacity", cfd.opacity + "")
            //}
            //else
            //{
            //    vp.select(this._chartFrameRoot)
            //        .css("transition", "opacity 0s ease-in-out")
            //        .css("opacity", "0")
            //}

        }

        build(width: number, height: number, hideAxes: boolean, usingFacets: boolean, scales: any,
            cfd: bps.ChartFrameData, dc: DrawContext)
        {
            var chartFrame = this._chartFrame;
            this._chartFrameData = cfd;

            //---- adjust width/height for padding ----
            var padding = cfd.padding;

            if (padding)
            {
                vp.select(this._root)
                    .translate(padding.left, padding.top);

                width -= (padding.left + padding.right);
                height -= (padding.top + padding.bottom);
            }

            var xAttr = null;       // attributes.x;
            var yAttr = null;       // attributes.y;

            var xAxisData = this.createAxisData(scales.x, xAttr, 0, width);
            var yAxisData = this.createAxisData(scales.y, yAttr, height, 0);

            vp.select(this._root)
                .css("opacity", cfd.opacity + "")

            chartFrame
                .xAxisData(xAxisData)
                .yAxisData(yAxisData)

            var isGridVisible = (cfd.xAxis.drawGridLines || cfd.yAxis.drawGridLines);

            var showXAxis = ((!hideAxes) && cfd.xAxis.isAxisVisible);
            var showYAxis = ((!hideAxes) && cfd.yAxis.isAxisVisible);

            chartFrame
                .translate(0, 0, true)
                .width(width)
                .height(height)
                .isLeftAxisVisible(showYAxis)
                .isBottomAxisVisible(showXAxis)
                .isTopAxisVisible(false)
                .isRightAxisVisible(false)
                .isGridLinesVisible(isGridVisible && !hideAxes)
                .axesOnOutside(usingFacets)

            if (isGridVisible)
            {
                chartFrame.gridLines()
                    .isXVisible(cfd.xAxis.drawGridLines)
                    .isYVisible(cfd.yAxis.drawGridLines)
            }

            var chartType = dc.toChartType;

            if (!hideAxes)
            {
                var isLeft = true;
                var tickSize = 16;

                var areLeftLabelsClickable = true;      // (this.clickableLabelGroups().indexOf("leftAxis") != -1);
                var areBottomLabelsClickable = true;    // (this.clickableLabelGroups().indexOf("bottomAxis") != -1);

                //---- set options on LEFT AXIS ----
                var leftAxis = chartFrame.leftAxis()
                    .labelOverflow(vp.chartFrame.LabelOverflow.ellipses)

                var xBinResults = (scales.x) ? scales.x._binResults : null;
                var yBinResults = (scales.y) ? scales.y._binResults : null;

                if (dc.nvData.y)
                {
                    var yCol = (dc.yCalcName) ? dc.yCalcName: dc.nvData.y.colName;

                    var yIsCat = (dc.nvData.y.colType == "string");     // || (<any>dc.scales.y)._useCategoryForBins);

                    var yLast = null;
                    var yLastIndex = yAxisData.tickCount() - 1;

                    var showTickBoxes = true;
                    this._yTickBoxElements = [];

                    //--- to minimize movement when possible ----
                    var leftMinWidth = 100;

                    //---- hook the "shaded" event so that we can apply our custom settings on axis labels ----
                    leftAxis
                        .minWidth(leftMinWidth)
                        .isTickBoxesVisible(showTickBoxes) 
                        .onShade((element, record, index, isNew) =>
                        {
                            if (index == 0) 
                            {
                                yLast = null;
                            }

                            if (areLeftLabelsClickable && isNew)
                            {
                                if (vp.dom.hasClass(element, "vpxAxisLabel"))
                                {
                                    vp.select(element)
                                        .attach("click", (e) => this.doSearch(e, "Y"))
                                        .css("cursor", "pointer")
                                        .attr("simpleHighlight", "true")
                                        .addClass("clickableAxisLabel")

                                    yLast = utils.prepElementForSearch(element, yCol, scales.y, yBinResults, index, yLast, yIsCat, record,
                                        "label");
                                }
                                else if (vp.dom.hasClass(element, "vpxAxisTickBox"))
                                {
                                    var tickBarTooltip = null;

                                    if (yBinResults && index > 0)
                                    {
                                        var bin = yBinResults.bins[index - 1];

                                        var itemCount = bin.count;
                                        tickBarTooltip = "Count: " + vp.formatters.formatNumber(itemCount, "0,##0");

                                        if (chartType == "barSumClass")
                                        {
                                            var itemSum = bin.sum;      //  this.computeBinSum(dc, "y", bin.rowIndexes);

                                            tickBarTooltip = "Sum: " + vp.formatters.formatNumber(itemSum, "0,##0") + ", " +
                                                tickBarTooltip;
                                        }
                                    }

                                    vp.select(element)
                                        .attach("click", (e) => this.doSearch(e, "Y"))
                                        .title(tickBarTooltip)

                                    yLast = utils.prepElementForSearch(element, yCol, scales.y, yBinResults, index, yLast, yIsCat, record,
                                        "tickBox");

                                    this._yTickBoxElements[index] = element;
                                }
                            }
                        });
                }

                var isBottom = true;

                //---- set options on BOTTOM AXIS ----
                var bottomAxis = chartFrame.bottomAxis()
                    .labelOverflow(vp.chartFrame.LabelOverflow.ellipses)
                    .labelRotation(vp.chartFrame.LabelRotation.auto)
                    .positiveAutoRotation(false)

                if (dc.nvData.x)
                {
                    var xCol = (dc.xCalcName) ? dc.xCalcName : dc.nvData.x.colName;

                    var xIsCat = (dc.nvData.x.colType == "string");     // || (<any>dc.scales.x)._useCategoryForBins);

                    var xLast = null;
                    var xLastIndex = xAxisData.tickCount() - 1;
                    this._xTickBoxElements = [];

                    bottomAxis
                        .isTickBoxesVisible(showTickBoxes)
                        .onShade((element, record, index, isNew, lastIndex) =>
                        {
                            if (index == 0)
                            {
                                xLast = null;
                            }

                            if (areBottomLabelsClickable && isNew)
                            {
                                if (vp.dom.hasClass(element, "vpxAxisLabel"))
                                {
                                    vp.select(element) 
                                        .attach("click", (e) => this.doSearch(e, "X"))
                                        .css("cursor", "pointer")
                                        .attr("simpleHighlight", "true")
                                        .addClass("clickableAxisLabel")

                                    xLast = utils.prepElementForSearch(element, xCol, scales.x, xBinResults, index, xLast, xIsCat, record,
                                        "label");
                                }
                                else if (vp.dom.hasClass(element, "vpxAxisTickBox"))
                                { 
                                    var tickBarTooltip = null;

                                    if (xBinResults && index > 0)
                                    {
                                        var bin = xBinResults.bins[index - 1];

                                        var itemCount = bin.count;
                                        tickBarTooltip = "Count: " + vp.formatters.formatNumber(itemCount, "0,##0");

                                        if (chartType == "columnSumClass")
                                        {
                                            var itemSum = bin.sum;      //  this.computeBinSum(dc, "x", bin.rowIndexes);

                                            tickBarTooltip = "Sum: " + vp.formatters.formatNumber(itemSum, "0,##0") + ", " +
                                                tickBarTooltip;
                                        }
                                    }

                                    vp.select(element)
                                        .attach("click", (e) => this.doSearch(e, "X"))
                                        .title(tickBarTooltip)

                                    xLast = utils.prepElementForSearch(element, xCol, scales.x, xBinResults, index, xLast, xIsCat, record,
                                        "tickBox");

                                    this._xTickBoxElements[index] = element;
                                }
                            }
                        });
                }
            }

            chartFrame.build();

            var rcPlot = chartFrame.plotAreaBounds();

            if (padding)
            {
                rcPlot.left += padding.left;
                rcPlot.right += padding.left;
                rcPlot.top += padding.top;
                rcPlot.bottom += padding.top;
            }

            return rcPlot;
        }

        doSearch(e, axisName: string)
        {
            var elem = e.target;
            var sp = elem._searchParams;

            this._dataMgr.searchColValue(sp);

            appMgrClass.current.onClickSelection(sp.buttonType, axisName, sp );
        }
    }
}
