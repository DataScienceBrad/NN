//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataView.ts - defines a view of data (a plot or data grid).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    var nextViewId = 0;

    function round(value: number)
    {
        value = Math.round(value);

        return value.toLocaleString();
    }

    /** Manages the chart properties and the current chart. */
    export class DataViewClass extends DataChangerClass
    {
        //---- NOTE: these chart-related properties that can be set by the user/client live in the view so that ----
        //---- they persist as the chart type is changed. ----

        //---- constant view attributes ----
        private _canvasColor = "black";
        private _shapeColor = "#0cf";
        private _shapeImageName = null;
        private _userSizeFactor = 1;
        private _separationFactor = 1;
        private _defaultShapeSize = null;
        private _shapeOpacity = 1;
        private _textOpacity = .5;
        private _chartType: string;
        private _canvasWidth = 100;
        private _canvasHeight = 100;
        private _showChartDebugInfo = false;
        private _lightingParams = new bps.Lighting();
        private _ambientFactor = .15;
        private _isAnaglyph = false;
        private _isOrthoCamera = false;
        private _isWireframe = false;
        private _isCullingEnabled = false;
        private _dataMgr: DataMgrClass;
        private _isContinuousDrawing = true;         // when true, forces animation timer to always run (seems like we can get along with it=false)
        _windowMgr = null;
        private _toPercentOverride: number;
        private _isAnimOverride = false;
        private _is3dGridVisible = false;
        private _autoRebuild = true;
        private _hoverParams = new bps.HoverParams();
        private _selectionParams = new bps.SelectionParams();

        private _chartFrameData: bps.ChartFrameData;
        private _colorMapping: bps.ColorMappingData;
        private _animationData: bps.AnimationData;

        private _sizeMapping: bps.SizeMappingData;
        private _textMapping: bps.TextMappingData;
        private _lineMapping: bps.LineMappingData;
        private _imageMapping: bps.ImageMappingData;
        private _facetMapping: bps.FacetMappingData;
        private _xMapping: bps.MappingData;
        private _yMapping: bps.MappingData;
        private _zMapping: bps.MappingData;
        private _hoverPrimaryKey = null;
        private _maxItemCount = 0;
        private _isMaxItemCountEnabled = false;
        private _wasFirstFilteredStage;

        //---- data-related ----
        private _dataFrame: DataFrameClass;
        //private _bindings: any = {};
        private _randomX = [];
        private _randomY = [];

        private _isVaas = false;
        private _chart: BaseGlVisClass;
        private _gl: WebGLRenderingContext;
        private _ctx: CanvasRenderingContext2D;
        private _transformMgr: TransformMgrClass;
        private _drawPrimitive = bps.DrawPrimitive.cube;            //safest default

        private _canvas3dElem: HTMLCanvasElement;
        private _canvas2dElem: HTMLCanvasElement;
        private _svgDoc: SVGSVGElement;
        private _svgChartGroup: SVGGElement;
        private _svgChartFrameGroup: SVGGElement;
        private _memStatsElem: HTMLElement;
        private _animStatsElem: HTMLElement;
        private _mouseStatsElem: HTMLElement;
        private _moveStatsElem: HTMLElement;
        private _drawStatsElem: HTMLElement;
        private _appMgr: AppMgrClass;

        private _viewId = "";
        private _lastHoverPos = null;
        private _lastStatsRebuild = 0;

        constructor(dataMgr: DataMgrClass, appMgr: AppMgrClass, canvas3dElem: HTMLCanvasElement, canvas2dElem: HTMLCanvasElement, svgId: string,
            memStatsElem?: HTMLElement, animStatsElem?: HTMLElement, mouseStatsElem?: HTMLElement, moveStatsElem?: HTMLElement,
            drawStatsElem?: HTMLElement, isVaas?: boolean)
        {
            super();

            this._appMgr = appMgr;
            this._dataMgr = dataMgr;
            this._canvas3dElem = canvas3dElem;
            this._canvas2dElem = canvas2dElem;
            this._svgDoc = <SVGSVGElement><any> document.getElementById(svgId);

            this._memStatsElem = memStatsElem;
            this._animStatsElem = animStatsElem;
            this._mouseStatsElem = mouseStatsElem;
            this._moveStatsElem = moveStatsElem;
            this._drawStatsElem = drawStatsElem;

            this._isVaas = isVaas;
            this._showChartDebugInfo = (!isVaas);
            this._viewId = nextViewId++ + "";

            this._chartFrameData = new bps.ChartFrameData();
            this._animationData = new bps.AnimationData();

            this._colorMapping = new bps.ColorMappingData(null, false, 0);
            this._sizeMapping = new bps.SizeMappingData();
            this._textMapping = new bps.TextMappingData();
            this._lineMapping = new bps.LineMappingData();
            this._imageMapping = new bps.ImageMappingData();
            this._facetMapping = new bps.FacetMappingData();

            this._xMapping = new bps.MappingData();
            this._yMapping = new bps.MappingData();
            this._zMapping = new bps.MappingData();

            //---- create an svg GROUP element for chart to use for all of its SVG shapes ----
            var svgChartGroup = vp.select(this._svgDoc).append("g");
                //.translate(10, 10)          // account for margin bet. svgdoc & canvas 

            this._svgChartGroup = svgChartGroup[0];

            //---- create an svg GROUP element for the chart frame ----
            var svgChartFrameGroup = vp.select(this._svgDoc).append("g")
                .addClass("chartFrameGroup");

            this._svgChartFrameGroup = svgChartFrameGroup[0];

            //---- specify "preserveDrawingBuffer=true" so we can capture images using toDataUrl() ----
            this._gl = glUtils.getContext(canvas3dElem, { preserveDrawingBuffer: true });  // true });
            this._ctx = canvas2dElem.getContext("2d");

            //---- this handles all of our 3D transforms and their variants ----
            this._transformMgr = new TransformMgrClass(this._gl);

            dataMgr.registerForChange("dataFrame", (e) =>
            {
                this._hoverPrimaryKey = null;            // clear this between data sets
                this.onDataFrameChanged();
            });

            //dataMgr.registerForChange("colMappings", (e) => this.onColMappingsChanged());

            this._appMgr.registerForChange("dataMgr", (e) => this._dataMgr = this._appMgr._dataMgr);

            //---- create the default chart ----
            //this.setChartType("Scatter");
        }

        maxItemCount(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._maxItemCount;
            }

            this._maxItemCount = value;
            this.onDataChanged("maxItemCount");
        }

        isMaxItemCountEnabled(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isMaxItemCountEnabled;
            }

            this._isMaxItemCountEnabled = value;
            this.onDataChanged("isMaxItemCountEnabled");
        }

        getAppMgr()
        {
            return this._appMgr;
        }

        getCanvas2d()
        {
            return this._canvas2dElem;
        }

        getCanvas3d()
        {
            return this._canvas3dElem;
        }

        getSvgChartGroup()
        {
            return this._svgChartGroup;
        }

        getSvgChartFrameGroup()
        {
            return this._svgChartFrameGroup;
        }

        getPlotBoundsInPixels()
        {
            var rc = (this._chart) ? this._chart.getPlotBoundsInPixels() : null;
            return rc;
        }

        onCycleEnded(wasFirstFilteredStage: boolean)
        {
            this._wasFirstFilteredStage = wasFirstFilteredStage;

            this.onDataChanged("cycleEnded");
        }

        getIsFirstFilteredStage()
        {
            return this._wasFirstFilteredStage;
        }

        getLastCycleFrameRate()
        {
            return this._chart.lastCycleFrameRate();
        }

        getLastCycleFrameCount()
        {
            return this._chart.lastCycleFrameCount();
        }

        getBuildChartTime()
        {
            return this._chart.getBuildPerfTime("total");
        }

        onMouseLeaveChart()
        {
            this.hoverPrimaryKey(null);
        }

        applyHover(mousePos: any)
        {
            var hp = this._hoverParams;
            //var primaryKey = null;
            var chart = this._chart;
            this._lastHoverPos = mousePos;
            var hpk = null;

            if (chart)
            {
                if (hp.hoverMatch === bps.HoverMatch.point)
                {
                    var ray = this._transformMgr.getRayFromScreenPos(mousePos.x, mousePos.y);
                    var items = chart.hitTestRay(ray, mousePos);
                    if (items && items.length)
                    {
                        hpk = items[0].primaryKey;
                    }
                }
                else if (hp.hoverMatch === bps.HoverMatch.square)
                {
                    var sz = hp.squareSize;
                    if (sz >= 1)
                    {
                        var rcScreen = vp.geom.createRect(mousePos.x - sz / 2, mousePos.y - sz / 2, sz, sz);

                        var boxes = chart.hitTestFromRect(rcScreen, false, true);
                        if (boxes && boxes.length)
                        {
                            var box = boxes[0];
                            hpk = box.primaryKey;
                        }
                    }
                }
            }

            this.hoverPrimaryKey(hpk);

            return hpk;
        }

        hoverPrimaryKey(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._hoverPrimaryKey;
            }

            if (value !== this._hoverPrimaryKey)
            {
                this._hoverPrimaryKey = value;

                this._appMgr.onMouseHover(value);

                //if (this._areToolTipsEnabled)
                //{
                //    this.showToolTipForShape(value);
                //}

                this.onDataChanged("hoverPrimaryKey");
            }
        }

        hitTestRectWithSelect(rcScreen, selectMode?: bps.SelectMode)
        {
            var chart = this._chart;
            if (chart)
            {
                var pointSelect = (rcScreen.width < 3 && rcScreen.height < 3);
                var hp = this._hoverParams;
                var isChartRelative = true;

                if (pointSelect && hp.hoverMatch === bps.HoverMatch.square)
                {
                    //---- use center of rcScreen, and size of hoverSquare ----
                    var sz = hp.squareSize;
                    var cx = rcScreen.left + rcScreen.width / 2;
                    var cy = rcScreen.top + rcScreen.height / 2;

                    rcScreen = vp.geom.createRect(cx - sz / 2, cy - sz / 2, sz, sz);

                    var boxes = chart.hitTestFromRect(rcScreen, isChartRelative, true);
                }
                else
                {
                    var boxes = chart.hitTestFromRect(rcScreen, isChartRelative, false);
                }

                this._dataMgr.updateSelectionFromBoxes(boxes, selectMode);

            }
        }

        /** "shapeIndex" is the index into the current set of sorted shapes.  It is NOT the unsorted "recordIndex". */
        getShapeScreenRect(primaryKey: string)
        {
            var rcScreen = null;

            var bb = this._chart.getShapeBoundingBox(primaryKey);
            if (bb)
            {
                var bounds = new Bounds();
                bounds.x = bb.xMin;
                bounds.y = bb.yMin;
                bounds.width = bb.xMax - bb.xMin;
                bounds.height = bb.yMax - bb.yMin;

                var transform = this._transformMgr.getTransformer();

                var rc = transform.worldBoundsToScreen(bounds);

                //---- round to nearest pixel ----
                rcScreen = vp.geom.createRect(Math.round(rc.left), Math.round(rc.top), Math.round(rc.width), Math.round(rc.height));
            }

            return rcScreen;
        }

        getColumnValues(columnList: string[], primaryKey: string)
        {
            var valueList = [];

            if (primaryKey)
            {
                var record = this._dataFrame.getRecordByPrimaryKey(primaryKey);

                for (var i = 0; i < columnList.length; i++)
                {
                    var colName = columnList[i];
                    var value = record[colName];

                    valueList.push(value);
                }
            }

            return valueList;
        }

        getMostCentralRecord(rcScreen, columnList: string[])
        {
            var colValues = null;
            var recordIndex = null;

            ////---- try fastest point-test first ----
            //var cx = rcScreen.left + rcScreen.width / 2;
            //var cy = rcScreen.top + rcScreen.height;            //  / 2;
            //var mousePos = { x: cx, y: cy };

            //---- try the slower method ----
            var chart = this._chart;
            if (chart)
            {
                var boxes = chart.hitTestFromRect(rcScreen, true, true);
                if (boxes && boxes.length)
                {
                    var box = boxes[0];
                    colValues = this.getColumnValues(columnList, box.primaryKey);
                    recordIndex = box.primaryKey;
                }
            }

            return { colValues: colValues, recordIndex: recordIndex };
        }

        getContext2d()
        {
            return this._ctx;
        }

        formatNum(value: number)
        {
            return value.toFixed(2);
        }

        viewId()
        {
            return this._viewId;
        }

        isVass()
        {
            return this._isVaas;
        }

        //onColMappingsChanged()
        //{
        //    this._bindings = this._dataMgr.getColMappings();

        //    this.onDataChanged("colMappings");
        //}

        onDataFrameChanged()
        {
            this._dataFrame = this._dataMgr.getDataFrame();

            this.onDataChanged("dataFrame");
        }

        buildVis()
        {
            this._chart.markBuildNeeded("buildVis");

            this.rebuildMemStats();
        }

        setChartType(value: string, layout?: string)
        {
            var prevChart = this._chart;

            var chartState: ChartState = null;
            if (prevChart)
            {
                chartState = prevChart.getChartState();

                prevChart.close();
                this._chart = null;
            }

            this._chartType = value;
            var chart: BaseGlVisClass = null;

            var usePartyGen = false;

            if (value === "Flat")
            {
                //usePartyGen = true;

                if (layout === "Circle")
                {
                    if (usePartyGen)
                    {
                        chart = new PartyGenPlotClass(this, this._gl, chartState, "FlatCircle");
                    }
                    else
                    {
                        chart = new FlatCircle(this, this._gl, chartState);
                    }
                }
                else if (layout === "Grid")
                {
                    if (usePartyGen)
                    {
                        chart = new PartyGenPlotClass(this, this._gl, chartState, "FlatGrid");
                    }
                    else
                    {
                        chart = new FlatGrid(this, this._gl, chartState);
                    }
                }
                else if (layout === "Poisson")
                {
                    chart = new PartyGenPlotClass(this, this._gl, chartState, "FlatPoisson");
                }
                else 
                {
                    if (usePartyGen)
                    {
                        chart = new PartyGenPlotClass(this, this._gl, chartState, "FlatRandom");
                    }
                    else
                    {
                        chart = new FlatRandom(this, this._gl, chartState);
                    }
                }
            }
            else if (value === "Scatter")
            {
                if (usePartyGen)
                {
                    chart = new PartyGenPlotClass(this, this._gl, chartState, "Scatter");
                }
                else
                {
                    //---- TEMP EXPERIMENT ONLY ----
                    if (false)      // prevChart instanceof scatterPlotClass)
                    {
                        chart = prevChart;

                        chart.close();
                        chart.init(chartState);
                    }
                    else
                    {
                        chart = new ScatterPlotClass(this, this._gl, chartState);
                    }
                }

            }
            else if (value === "Line")
            {
                chart = new LinePlotClass(this, this._gl, chartState);
            }
            else if (value === "Radial")
            {
                chart = new RadialClass(this, this._gl, chartState);
            }
            else if (value === "Density")
            {
                if (layout === "Circle") 
                {
                    chart = new DensityCircle(this, this._gl, chartState);
                }
                else if (layout === "Grid") 
                {
                    chart = new DensityGrid(this, this._gl, chartState);
                }
                else 
                {
                    chart = new DensityRandom(this, this._gl, chartState);
                }
            }
            else if (value === "Violin")
            {
                chart = new ViolinClass(this, this._gl, chartState);
            }
            else if (value === "Bar")
            {
                if (layout === "Sum")
                {
                    chart = new BarSumClass(this, this._gl, chartState);
                }
                else        // Random or Grid
                {
                    if (usePartyGen)
                    {
                        if (layout === "Random")
                        {
                            chart = new PartyGenPlotClass(this, this._gl, chartState, "BarRandom");
                        }
                        else 
                        {
                            chart = new PartyGenPlotClass(this, this._gl, chartState, "BarGrid");
                        }
                    }
                    else
                    {
                        chart = new BarCountClass(this, this._gl, chartState);
                    }
                }
            }
            else if (value === "Column")
            {
                if (layout === "Sum")
                {
                    chart = new ColumnSumClass(this, this._gl, chartState);
                }
                else        // Random or Grid
                {
                    if (usePartyGen)
                    {
                        if (layout === "Random")
                        {
                            chart = new PartyGenPlotClass(this, this._gl, chartState, "ColumnRandom");
                        }
                        else 
                        {
                            chart = new PartyGenPlotClass(this, this._gl, chartState, "ColumnGrid");
                        }
                    }
                    else
                    {
                        chart = new ColumnCountClass(this, this._gl, chartState);
                    }
                }
            }
            else if (value === "Scatter-3D")
            {
                chart = new ScatterPlot3dClass(this, this._gl, chartState);
            }
            else if (value === "Stacks") 
            {
                chart = new StacksBinClass(this, this._gl, chartState);
            }
            else if (value === "Squarify") 
            {
                chart = new PartyGenPlotClass(this, this._gl, chartState, "FlatSquarify");
            }
            else
            {
                glUtils.error("unknown chart type: " + value);
            }

            this._chart = chart;
            chart._chartOptions = { layout: layout };

            //this._transformer = chart.getTransformer();

            chart.setBounds(0, 0, this._canvasWidth, this._canvasHeight);

            //this._chart.setData(this._dataStream, null, (prevChart == null));

            //---- add debug stats ----
            this.rebuildAnimStats();
            this.rebuildMouseStats();
            this.rebuildMoveStats();
            this.rebuildDrawStats();

            if (chartState && chartState._dataFrame)
            {
                chart.startAnimationIfNeeded();
            }

            chart.registerForChange("facetLayoutChanged", (e) =>
            {
                this.onDataChanged("facetLayoutChanged");
            });

            chart.registerForChange("drawFrameCore", (e) =>
            {
                this._windowMgr.onFrame();
                this.onDataChanged("drawFrameCore");
            });

            chart.registerForChange("drawFrame", (e) =>
            {
                //---- don't update faster than 10x per second ----
                var now = vp.utils.now();
                if ((now - this._lastStatsRebuild) > 100)
                {
                    this.rebuildStats();
                    this._lastStatsRebuild = now;
                }

            });

            this.buildVis();
        }

        getFacetLayouts()
        {
            var fl = <bps.FacetLayoutInfo[]>null;

            var facetHelper = this._chart.getFacetHelper();
            if (facetHelper)
            {
                var bins = facetHelper._binResult.bins;
                fl = [];

                for (var b = 0; b < bins.length; b++)
                {
                    var bin = bins[b];
                    var isFirst = (b === 0);

                    var layout = new bps.FacetLayoutInfo();
                    layout.facelLabel = bin.name;
                    layout.facetIndex = b;
                    layout.plotBounds = this._chart.worldBoundsToSvg(facetHelper._layout.facetBounds[b]);
                    layout.labelBounds = this._chart.worldBoundsToSvg(facetHelper._layout.labelBounds[b]);

                    var sp = new bps.SearchParams();
                    sp.colName = facetHelper._colName;

                    if (bin instanceof beachParty.BinInfoNum)
                    {
                        var numBin = <beachParty.BinInfoNum>bin;
                        sp.minValue = numBin.min;
                        sp.maxValue = numBin.max;
                        sp.searchType = (isFirst) ? bps.TextSearchType.betweenInclusive : bps.TextSearchType.gtrValueAndLeqValue2;
                    }
                    else
                    {
                        var value = (bin.isOther) ? <any>bin.otherKeys : <any>bin.name;
                        sp.minValue = value;
                        sp.maxValue = value;
                        sp.searchType = bps.TextSearchType.exactMatch;
                    }

                    layout.searchParams = sp;
                    fl.push(layout);
                }
            }

            return fl;
        }

        onBuildStarted()
        {
            this._appMgr.onBuildChart();

            this.onDataChanged("buildStarted");
        }

        getIsSelectionOnly()
        {
            return (this._chart) ? this._chart._isSelectionChangeOnly : false;
        }

        rebuildStats()
        {
            if (this._showChartDebugInfo)
            {
                this.rebuildMemStats();
                this.rebuildAnimStats();
                this.rebuildMouseStats();
                this.rebuildMoveStats();
                this.rebuildDrawStats();
            }
        }

        cancelRquestedDraw()
        {
            if (this._chart)
            {
                this._chart.cancelRequestedDraw();
            }
        }

        buildNow(ignoreFilteredStage?: boolean)
        {
            if (this._chart)
            {
                vp.utils.debug("view.buildNow: ignoreFilteredStage=" + ignoreFilteredStage);

                this._chart.markBuildNeeded("buildNow", ignoreFilteredStage);
            }
        }

        getDataMgr()
        {
            return this._dataMgr;
        }

        getChartRepro(): bps.ChartRepro
        {
            return (this._chart) ? this._chart.getChartRepro() : null;
        }

        getChart()
        {
            return this._chart;
        }

        rebuildAnimStats()
        {
            var chart = this._chart;

            if (this._animStatsElem && this._showChartDebugInfo && chart)
            {
                this._animStatsElem.textContent = "ANIM: FPS=" + chart.getFrameRate() + ", toPercent=" + chart._toPercent.toFixed(2) + ", usingPrimaryBuffers=" +
                chart._usingPrimaryBuffers + ", animCycleCount=" + chart._animCycleCount;
            }
        }

        rebuildMoveStats()
        {
            var chart = this._chart;

            if (this._moveStatsElem && this._showChartDebugInfo && chart)
            {
                var perf = chart._buildPerf;

                //var msg = "MOVEFRAME: count=" + round(chart._moveFrameCount) + ", buildChart=" + round(perf.total)
                //    + " ms (layoutPrep=" + round(perf.layoutPrep) + ", preLayout=" + round(perf.preLayout)
                //    + ", layout=" + round(perf.layout) + ", process=" + round(perf.process) +
                //    ", fill=" + round(perf.fill) + ", layoutPost=" + round(perf.layoutPost) + ")";

                var msg = "MOVEFRAME: count=" + round(chart._moveFrameCount) + ", buildChart=" + round(perf.total)
                    + " ms (layoutPrep=" + round(perf.layoutPrep) + ", reorderBuffer=" + round(perf.reorderBuffer)
                    + ", preLayout=" + round(perf.preLayout)
                    + ", layoutEx=" + round(perf.layoutEx) + ", layoutPost=" + round(perf.layoutPost) + ")";

                this._moveStatsElem.textContent = msg;
            }
        }

        rebuildDrawStats()
        {
            var chart = this._chart;

            if (this._drawStatsElem && this._showChartDebugInfo && chart)
            {
                var msg = "DRAWFRAME: count=" + round(chart._drawFrameCount) + " last sec: (" + chart._drawFrameStatsMsg + ")";

                this._drawStatsElem.textContent = msg;
            }
        }

        rebuildMouseStats()
        {
            var chart = this._chart;

            if (this._mouseStatsElem && this._showChartDebugInfo && chart)
            {
                var str = "MOUSE: ";

                if (this._lastHoverPos)
                {
                    str += "xScr=" + Math.floor(this._lastHoverPos.x) + ", yScr=" + Math.floor(this._lastHoverPos.y);
                }

                str += ", hoverPrimaryKey=" + this._hoverPrimaryKey;

                //str += "<br />";

                var rect = chart.getLastRectHitTestInfo();
                if (rect)
                {
                    str += ", RECT-test=" + round(rect.elapsed) + ", found=" + rect.itemsFoundCount;
                }

                var ray = chart.getLastRayHitTestInfo();
                if (ray)
                {
                    str += ", RAY-test=" + round(ray.elapsed) + ", found=" + ray.itemsFoundCount;
                }

                this._mouseStatsElem.innerHTML = str;
            }
        }

        rebuildMemStats()
        {
            var chart = this._chart;
            if (chart)
            {
                //---- add debug title ----
                if (this._memStatsElem && this._showChartDebugInfo)
                {
                    var objName = this.drawingPrimitive();
                    var recordCount = chart.getDataLength();
                    var drawPrimName = bps.DrawPrimitive[chart._drawPrimitive];

                    var titleMsg = "MEMORY: chart=" + this._chartType + ", " + vp.formatters.comma(recordCount) + " " + objName + "s, drawPrimitive=" + drawPrimName + 
                        ", vertices: " + vp.formatters.comma(chart._vertexCount) + 
                        ", arrays: " + (chart.getArrayMemory() / (1000 * 1000)).toFixed(1) + " MB";

                    this._memStatsElem.textContent = titleMsg;
                }
            }
        }

        isDataLoaded()
        {
            return (this._dataFrame != null);
        }

        render()
        {
        }

        shapeOpacity(value?: number)
        {
            if (value === undefined)
            {
                return this._shapeOpacity;
            }

            this._shapeOpacity = value;
            this.onDataChanged("shapeOpacity");
        }

        textOpacity(value?: number)
        {
            if (value === undefined)
            {
                return this._textOpacity;
            }

            this._textOpacity = value;
            this.onDataChanged("textOpacity");
        }

        randomX(value?: number[])
        {
            if (value === undefined)
            {
                return this._randomX;
            }

            this._randomX = value;
            this.onDataChanged("randomX");
        }

        randomY(value?: number[])
        {
            if (value === undefined)
            {
                return this._randomY;
            }

            this._randomY = value;
            this.onDataChanged("randomY");
        }

        //---- these must be SET thru dataMgr ----
        //bindings(): any;
        //bindings(value: any): any;
        //bindings(value?: any): any
        //{
        //    if (value === undefined)
        //    {
        //        return this._bindings;
        //    }

        //    this._bindings = value;
        //    this.onDataChanged("bindings");

        //    return this;
        //}

        //getBindings()
        //{
        //    return this._bindings;
        //}

        showChartDebugInfo(): boolean;
        showChartDebugInfo(value: boolean): any;
        showChartDebugInfo(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._showChartDebugInfo;
            }

            this._showChartDebugInfo = value;

            if (value)
            {
                this.rebuildStats();
            }

            vp.select("#debugPanel").css("display", (value) ? "" : "none");

            this.onDataChanged("showChartDebugInfo");

            return this;
        }

        userSizeFactor(value?: number, animate?: boolean)
        {
            if (value === undefined)
            {
                return this._userSizeFactor;
            }

            this._userSizeFactor = value;
            this.onDataChanged("sizeFactor");

            if (animate)
            {
                this.onDataChanged("sizeFactorWithAnimation");
            }
        }

        separationFactor(value?: number)
        {
            if (value === undefined)
            {
                return this._separationFactor;
            }

            this._separationFactor = value;
            this.onDataChanged("separationFactor");
        }

        getTransformer()
        {
            return this._transformMgr.getTransformer();
        }

        defaultShapeSize(value?: number)
        {
            if (value === undefined)
            {
                return this._defaultShapeSize;
            }

            this._defaultShapeSize = value;
            this.onDataChanged("defaultShapeSize");
        }

        lightingParams(value?: bps.Lighting): any
        {
            if (value === undefined)
            {
                return this._lightingParams;
            }

            this._lightingParams = value;
            this.onDataChanged("lightingParams");

            return this;
        }

        isOrthoCamera(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._isOrthoCamera;
            }

            this._isOrthoCamera = value;
            this.onDataChanged("isOrthoCamera");

            return this;
        }

        isWireframe(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._isWireframe;
            }

            this._isWireframe = value;
            this.onDataChanged("isWireFrame");

            return this;
        }

        isCullingEnabled(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._isCullingEnabled;
            }

            this._isCullingEnabled = value;
            this.onDataChanged("isCullingEnabled");

            return this;
        }

        isContinuousDrawing(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._isContinuousDrawing;
            }

            this._isContinuousDrawing = value;
            this.onDataChanged("isContinuousDrawing");

            return this;
        }

        setBounds(left: number, top: number, width: number, height: number)
        {
            this._canvasWidth = width;
            this._canvasHeight = height;

            if (this._chart)
            {
                this._chart.setBounds(left, top, width, height);
            }
        }

        ambientFactor(value?: number)
        {
            if (value === undefined)
            {
                return this._ambientFactor;
            }

            this._ambientFactor = value;
            this.onDataChanged("ambientFactor");
        }

        isAnaglyph(value?: boolean): any
        {
            if (value === undefined)
            {
                return this._isAnaglyph;
            }

            this._isAnaglyph = value;
            return this;
        }

        drawingPrimitive(value?: bps.DrawPrimitive)
        {
            if (value === undefined)
            {
                var enumName = bps.DrawPrimitive[this._drawPrimitive];
                return enumName;
            }

            if (vp.utils.isString(value))
            {
                value = <bps.DrawPrimitive><any> bps.DrawPrimitive[value];
            }

            this._drawPrimitive = value;

            this.onDataChanged("drawingPrimitive");

            this.rebuildMemStats();
        }

        canvasColor(value?: string)
        {
            if (value === undefined)
            {
                return this._canvasColor;
            }

            this._canvasColor = value;

            //vp.select(this._canvas3dElem)
            //    .css("background", value)
            //    //.css("border", "2px solid gold")

            this.onDataChanged("canvasColor");
        }

        colorMapping(value?: bps.ColorMappingData)
        {
            if (value === undefined)
            {
                return this._colorMapping;
            }

            this._colorMapping = value;

            this.onDataChanged("colorMapping");
        }

        sizeMapping(value?: bps.SizeMappingData)
        {
            if (value === undefined)
            {
                return this._sizeMapping;
            }

            this._sizeMapping = value;

            this.onDataChanged("sizeMapping");
        }

        textMapping(value?: bps.TextMappingData)
        {
            if (value === undefined)
            {
                return this._textMapping;
            }

            this._textMapping = value;

            this.onDataChanged("textMapping");
        }

        lineMapping(value?: bps.LineMappingData)
        {
            if (value === undefined)
            {
                return this._lineMapping;
            }

            this._lineMapping = value;

            this.onDataChanged("lineMapping");
        }

        imageMapping(value?: bps.ImageMappingData)
        {
            if (value === undefined)
            {
                return this._imageMapping;
            }

            this._imageMapping = value;

            this.onDataChanged("imageMapping");
        }

        facetMapping(value?: bps.FacetMappingData)
        {
            if (value === undefined)
            {
                return this._facetMapping;
            }

            this._facetMapping = value;

            this.onDataChanged("facetMapping");
        }

        xMapping(value?: bps.MappingData)
        {
            if (value === undefined)
            {
                return this._xMapping;
            }

            this._xMapping = value;

            this.onDataChanged("xMapping");
        }

        yMapping(value?: bps.MappingData)
        {
            if (value === undefined)
            {
                return this._yMapping;
            }

            this._yMapping = value;

            this.onDataChanged("yMapping");
        }

        zMapping(value?: bps.MappingData)
        {
            if (value === undefined)
            {
                return this._zMapping;
            }

            this._zMapping = value;

            this.onDataChanged("zMapping");
        }

        chartFrameData(value?: bps.ChartFrameData)
        {
            if (value === undefined)
            {
                return this._chartFrameData;
            }

            this._chartFrameData = value;

            this.onDataChanged("chartFrameData");
        }

        animationData(value?: bps.AnimationData)
        {
            if (value === undefined)
            {
                return this._animationData;
            }

            this._animationData = value;

            this.onDataChanged("animationData");
        }

        shapeColor(value?: string)
        {
            if (value === undefined)
            {
                return this._shapeColor;
            }

            this._shapeColor = value;

            this.onDataChanged("shapeColor");
        }

        markBuildNeeded(reason: string)
        {
            if (this._chart)
            {
                this._chart.markBuildNeeded(reason);
            }
        }

        shapeImageName(value?: string)
        {
            if (value === undefined)
            {
                return this._shapeImageName;
            }

            this._shapeImageName = value;

            this.onDataChanged("shapeImageName");
        }

        toPercentOverride(value?: number)
        {
            if (value === undefined)
            {
                return this._toPercentOverride;
            }

            this._toPercentOverride = value;

            this.onDataChanged("toPercentOverride");
        }

        isAnimOverride(value?: boolean)
        {
            if (value === undefined)
            {
                return this._isAnimOverride;
            }

            this._isAnimOverride = value;

            this.onDataChanged("isAnimOverride");
        }

        is3dGridVisible(value?: boolean)
        {
            if (value === undefined)
            {
                return this._is3dGridVisible;
            }

            this._is3dGridVisible = value;

            this.onDataChanged("is3dGridVisible");
        }

        isAutoRebuild(value?: boolean)
        {
            if (value === undefined)
            {
                return this._autoRebuild;
            }

            //this._autoRebuild = value;//TODO: check it line.

            if (!value)
            {
                this.cancelRquestedDraw();
            }

            this.onDataChanged("autoRebuild");
        }

        hoverParams(value?: bps.HoverParams)
        {
            if (value === undefined)
            {
                return this._hoverParams;
            }

            this._hoverParams = value;

            this.onDataChanged("hoverParams");
        }

        selectionParams(value?: bps.SelectionParams)
        {
            if (value === undefined)
            {
                return this._selectionParams;
            }

            this._selectionParams = value;

            this.onDataChanged("selectionParams");
        }

        getTransformMgr()
        {
            return this._transformMgr;
        }
    }
}
