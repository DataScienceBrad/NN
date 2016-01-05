///-----------------------------------------------------------------------------------------------------------------
/// chartHostHelper.ts.  Copyright (c) 2015 Microsoft Corporation.
///    Helper code for hosting of BeachParty chart within an iframe.
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module bps
{
    export class ChartHostHelperClass extends BaseHostHelperClass
    {
        static instance: ChartHostHelperClass;

        private data: any;

        _clientAppId: string;

        constructor(bpsChartOrIFrameId: string, bpsDomain?: string, baseServerDir?: string, fromDomain?: string,
            clientAppId?: string, isDivHost?: boolean)
        {
            super(bpsChartOrIFrameId, bpsDomain, baseServerDir, fromDomain, "chartHost", isDivHost);

            this._clientAppId = clientAppId;

            ChartHostHelperClass.instance = this;
        }

        preprocessMsg(msgBlock)
        {
            var processIt = false;

            if (msgBlock.fromHost === "appHost")
            {
                this.processMsgFromAppHost(msgBlock);
            }
            else //if (msgBlock.visId == this._chartId)
            {
                if (msgBlock.msg === "engineLoaded")
                {
                    this.onIFrameLoaded();
                }

                processIt = true;
            } 
             
            return processIt;
        }

        processMsgFromAppHost(msgBlock) 
        {
            //debug("===> Got cmd from HOST in client app: cmd=" + msgBlock.cmd);

            if (msgBlock.cmd === "setData") 
            { 
                var data = <any>JSON.parse(msgBlock.param);
                var wdParams = <bps.WorkingDataParams>JSON.parse(msgBlock.param2);

                //(<any>window).bar.ski = 3;

                this.setData(data, wdParams); 
            }
        }

        getIFrameSrc(baseServerDir: string): string
        {
            // var src = baseServerDir + "/beachParty/apps/default.html?vaas=true&visid=" + this._chartId;
            // return src;

            return "";
        }

        /** get the data associated with the specified column names (normal or system) in the current sort order. 
         the system column names include:
         *  _primaryKey
         *  _selected
         *  _filtered
         *  _randomX
         *  _randomY
         */
        public getDataVectors(vectorNames: string[], callback)
        {
            var names = JSON.stringify(vectorNames);
            this.postVisMsg("getDataVectors", names, null, null, null, null, false, callback, true);
        }

        /** sets the selected shapes using the specified vector.  The "vectorType" describes the content of the
        vector (bit vector in the current sort order, bit vector in the natural order, or an array of natural order
        primary keys (which can be in any order)).  FYI, the current sort order can be determined from the system "_primaryKey" vector.
        "changeSource" is an optional parameter for tracking the source of a selection change.
         */
        public setSelection(vector: any[], vectorType: VectorType, changeSource = "client")
        {
            var strVector = JSON.stringify(vector);
            this.postVisMsg("setSelection", strVector, VectorType[vectorType], changeSource);
        }

        /** specifies how data should be binned (divided up into buckets for counting or summing) for a particular column. */
        public getBinData(value: MappingData, callback)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("getBinData", str, null, null, null, null, false, callback, true);
        }

        /** get the array of ValueMapEntry's for the specified column. */
        public getValueMap(colName: string, maxValues: number, callback) 
        {
            this.postVisMsg("getValueMap", colName, maxValues + "", undefined, undefined, undefined, null, callback);
        }

        /** search for (and select) records, matching "value" and "maxValue" on the column "colName".  The searchType specifes the 
        type of search to be performed.  The "searchAction" can be used to return the matching objects instead of selecting them. */
        public search(colName: string, value: string, maxValue?: string, searchType = TextSearchType.contains,
            searchAction = SearchAction.selectMatches, searchRawValues?: boolean, callback?: any)
        {
            var sp = new SearchParams();
            sp.colName = colName;
            sp.minValue = value;
            sp.maxValue = maxValue;
            sp.searchType = searchType;
            sp.searchAction = searchAction;
            sp.searchRawValues = searchRawValues;

            var strSP = JSON.stringify(sp);
            this.postVisMsg("search", strSP, undefined, undefined, undefined, undefined, false, callback);
        }

        /** sort the data based on the specifed column name and sort direction. */
        public sortData(colName: string, isSortAscending: boolean)
        {
            this.postVisMsg("sortData", colName, isSortAscending + "");
        }

        /** enables or disables explicit control over the max item or bin count for the current chart. */
        public setMaxItemCount(enabled: boolean, maxCount: number)
        {
            this.postVisMsg("setMaxItemCount", enabled + "", maxCount + "");
        }

        /** when set to true, operations on the 3D transform wheel can result continuous rotations.  When set to false, this is disabled. */
        public setWheelInertia(value: boolean)
        {
            this.postVisMsg("setWheelInertia", value + "");
        }

        /** set the background color of the CHART to the specified HTML color string. */
        public setBackground(value: string)
        {
            this.postVisMsg("setBackground", value);
        }

        /** set the background color of the CANVAS (shape area) to the specified HTML color string. */
        public setCanvasColor(value: string)
        {
            this.postVisMsg("setCanvasColor", value);
        }

        /** set the static color of the shapes.  The will be overridden when color mapping is active. */
        public setShapeColor(value: string)
        {
            this.postVisMsg("setShapeColor", value);
        }

        /** sets the image used to draw each shape.  Refer to the BeachParty App for a list of supported image names. */
        public setShapeImage(imgSrc: string)
        {
            this.postVisMsg("setShapeImage", imgSrc);
        }

        /** When true (the default), changes to chart properties will result in the scheduling of a chart rebuild and draw cycle.  When false, the chart will only
         * be rebuilt/redrawn when explictly requested. 
         */
        public setAutoRebuild(value: boolean, rebuildNow: boolean, skipFilterSecondStage?: boolean)
        {
            this.postVisMsg("setAutoRebuild", value + "", rebuildNow + "", skipFilterSecondStage + "");
        }

        /** internal method used to relay a change to the browser's localstorage to the BPS engine. */
        public onLocalStorageChange()
        {
            this.postVisMsg("onLocalStorageChange");
        }

        /** controls whether 3D transform wheel should be shown during 3D transform mode. */
        public showWheelDuringTransformMode(value?: boolean)
        {
            this.postVisMsg("showWheelDuringTransformMode", value+"");
        }

        /** used to specify options and parameters for drawing the chart's frame (axes, tickmarks, labels, etc.) */
        public setChartFrameData(value: ChartFrameData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setChartFrameData", str);
        }

        /** used to specify parameters for shape animation and staggering. */
        public setAnimationData(value: AnimationData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setAnimationData", str);
        }

        /** used to specify the color mapping settings (column, color palette name, etc). */
        public setColorMapping(value: ColorMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setColorMapping", str);
        }

        /** add the text as a style sheet to modify that appearance of the chart. */
        public addStyleSheet(text: string)
        {
            this.postVisMsg("addStyleSheet", text);
        }

        /** render the specified URL of a webpage. */
        public renderWebPageToPng(pageUrl: string, width: number, height: number, msTimeout: number, callback)
        {
            this.postVisMsg("renderWebPageToPng", pageUrl, width+"", height+"", msTimeout+"", undefined, undefined, callback, true);
        }

        /** used to specify the size mapping settings (column, etc). */
        public setSizeMapping(value: SizeMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setSizeMapping", str);
        }

        /** used to specify the text mapping settings (column, etc). */
        public setTextMapping(value: TextMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setTextMapping", str);
        }

        /** used to specify the line mapping settings (column, etc). */
        public setLineMapping(value: LineMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setLineMapping", str);
        }

        /** used to specify the shape (image) mapping settings (column, etc). */
        public setImageMapping(value: ImageMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setImageMapping", str);
        }

        /** used to specify the facet binning settings (column, # of facets). */
        public setFacetMapping(value: FacetMappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setFacetMapping", str);
        }

        /** used to specify the X-axis  binning settings (column name, # of bins, etc.) */
        public setXMapping(value: MappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setXMapping", str);
        }

        /** used to specify the Y-axis  binning settings (column name, # of bins, etc.) */
        public setYMapping(value: MappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setYMapping", str);
        }

        /** used to specify the Z-axis  binning settings (column name, # of bins, etc.) */
        public setZMapping(value: MappingData)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setZMapping", str);
        }

        /** get the most recent set of engine trace records. */
        public getEngineEvents(callback)
        {
            this.postVisMsg("getEngineEvents", null, null, null, null, null, null, callback, true);
        }
        
        /** get the estimated memory use of the major engine objects. */
        public getMemoryUse(callback)
        {
            this.postVisMsg("getMemoryUse", null, null, null, null, null, null, callback, true);
        }

        /** gets the column values for the specified record, and also returns its screen bounds in the chart layout. */
        public getRecordAndBounds(primaryKey: string, colNames: string[], callback)
        {
            var str = JSON.stringify(colNames);
            this.postVisMsg("getRecordAndBounds", primaryKey, str, null, null, null, null, callback, true);
        }

        /** gets the plot and rotation area bounds */
        public getPlotBounds(callback)
        {
            this.postVisMsg("getPlotBounds", null, null, null, null, null, null, callback, true);
        }

        /** specifies if the 3D transform wheel should be shown, or not. */
        public setShowing3DWheel(value: boolean)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setShowing3DWheel", str);
        }

        /** internal method used for debugging animation and staggering. */
        public setToPercentOverride(value: number)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setToPercentOverride", str);
        }

        /** internal method used for debugging animation and staggering. */
        public setAnimOverride(value: boolean)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setAnimOverride", str);
        }

        /** get the record that is closest to the center of the rectangle "rcScreen" (specified in screen coordinates).  Returns the values of 
         * the specified columns for that record.  When information is recived by the client, the "callback" is called. 
         */
        public getMostCentralRecord(rcScreen: any, columnNames: string[], callback)
        {
            //---- cannot stringify ClientRect, so convert to a simple obj ----
            var rc = { left: rcScreen.left, top: rcScreen.top, width: rcScreen.width, height: rcScreen.height };

            var jsonRc = JSON.stringify(rc);
            var jsonCols = JSON.stringify(columnNames);
            this.postVisMsg("getMostCentralRecord", jsonRc, jsonCols, null, null, null, false, callback);
        }

        /* set the size factor for all shapes.  The default value is "1".  This enables the user to specify relative size changes for the shapes in the 
         * current chart. */
        public setSizeFactor(value: number, animate: boolean)
        {
            this.postVisMsg("setSizeFactor", value + "", animate + "");
        }

        /* set the size-to-size separation factor used by layout-style views. */
        public setSeparationFactor(value: number)
        {
            this.postVisMsg("setSeparationFactor", value + "");
        }

        /* set the default shape size (in pixels), for charts that use default sized shapes (like Scatter).  This
         * override's the system's calculation of the default shape size, based on the shape count and the bounds
         * of the chart.  */
        public setDefaultShapeSize(value: number)
        {
            this.postVisMsg("setDefaultShapeSize", value + "");
        }

        /** set the static opacity of shapes.  This ia a value between 0 (completely transparent) and 1 (completely solid).  This value is 
          * combined with the opacity mapping value computed for each shape, when opacity mapping is active. */
        public setShapeOpacity(value: number)
        {
            this.postVisMsg("setShapeOpacity", value + "");
        }

        /** sets the opacity of text drawn when text mapping is active. */
        public setTextOpacity(value: number)
        {
            this.postVisMsg("setTextOpacity", value + "");
        }

        /** When this is true, frames are continually drawn for the chart.  When false, frames are only drawn when they are needed.  The (safer) default is 
         to draw continually. */
        public setContinuousDrawing(value: boolean)
        {
            this.postVisMsg("setContinuousDrawing", value + "");
        }

        /** this is an internal method used to test the time it takes to send a message from the client to BPS and back again. */
        public testRoundTripTime(callback)
        {
            debug("sending: ROUND TRIP TEST");
            this.postVisMsg("testRoundTripTime", null, null, null, null, null, true, callback, true);
        }

        /** sets the type of chart and layout to be drawn.  "chartType" can be thought of as the outer layout type and "layout" can be thought of as the inner layout
         type - how shapes are layed out within each outer layout group.  Refer to the BeachParty app to see the available chartType and Layout values. */
        public setChartType(chartType: string, layout: string)
        {
            this.postVisMsg("setChartType", chartType, layout);
        }

        /** helper function to retreive the preLoad data associated with the specified known data source
         * and use it to load that data. */
        public loadKnownData(name: string, callback?: any)
        {
            this.postVisMsg("loadKnownData", name, null, null, null, null, null, callback, true);
        }

        /** loads the specified working data, and call the callback if one is specified. */
        public loadData(dataLoad: WorkingDataParams, callback?: any)
        {
            var str = JSON.stringify(dataLoad);
            this.postVisMsg("loadData", str, null, null, null, null, null, callback);
        }

        /** Used to load data directly into the chart engine.  data can be one of: 
        dataFrame, array of records, CSV text, or JSON text.  DataFrame is the fastest and preferred format.    
        If optional "preload" is supplied, it is used to control how the text data is interpreted and loaded. */
        public setData(data: any, dataLoad?: WorkingDataParams, callback?: any)
        {
            var strData = JSON.stringify(data);
            var strParams = JSON.stringify(dataLoad);

            this.postVisMsg("setData", strData, strParams, undefined, undefined, undefined, undefined, callback);
        }

        //TODO: check.
        public updateDataView(data: any, dataLoad?: WorkingDataParams, callback?: any): void {
            var strParams = JSON.stringify(dataLoad);

            if (data) {
                this.data = data;
            }

            this.postVisMsg("setData", data || this.data, strParams, undefined, undefined, undefined, undefined, callback);
        }

        /** get the system part of the view data (as SystemViewData). When the data has been received, 
         * the "callback" will be called. */
        public getSystemViewData(getSnapshot: boolean, getReproData: boolean, callback) 
        {
            this.postVisMsg("getSystemViewData", getSnapshot + "", getReproData + "", undefined, undefined, undefined, null, callback);
        }

        /** set the system part of the view data. */
        public setSystemViewData(svd: SystemViewData, callback?: any)
        {
            var svdStr = JSON.stringify(svd);
            this.postVisMsg("setSystemViewData", svdStr, undefined, undefined, undefined, undefined, undefined, callback, true);
        }

        /** simulate a click in the specified x-axis tick box.  this will initiate a search for the specified data range of the current view. */
        public selectXTickBox(index: number)
        {
            this.postVisMsg("selectXTickBox", index + "");
        }

        /** simulate a click in the specified x-axis tick box.  this will initiate a search for the specified data range of the current view. */
        public selectYTickBox(index: number)
        {
            this.postVisMsg("selectYTickBox", index + "");
        }

        /** select the shapes within the canvas rectangle. */
        public rectSelect(rcBand: ClientRect)
        {
            var strRect = JSON.stringify(rcBand);
            this.postVisMsg("rectSelect", strRect);
        }

        /** When set to true, a few lines of diagnostic information are displayed and constantly updated in the upper right of the plot. */
        public setChartDebugInfo(value: any)
        {
            this.postVisMsg("setChartDebugInfo", value);
        }

        /** Controls the type of shape used to draw each unit in a unit chart. For maximum speed, "cube" is best for 3D charts; "quad" is best for normal 2D charts; 
         * "point" is best for 2D charts with massive amounts of shapes (> 100,000). */
        public setDrawingPrimitive(value: DrawPrimitive)
        {
            this.postVisMsg("setDrawingPrimitive", value.toString());
        }

        /** When set to true, charts are drawn using a orthographic camera.  When false, a perspective camera is used.  The orthographic camera is not yet 
         fully supported. */
        public setOrthoCamera(value: any)
        {
            this.postVisMsg("setOrthoCamera", value);
        }

        /** Sets the 3D lighting parameters. */
        public setLightingParams(value: bps.Lighting)
        {
            var str = JSON.stringify(value);
            this.postVisMsg("setLightingParams", str);
        }

        /** When true, shapes are with outlines, rather than solid shapes */
        public setUseWireframe(value: boolean)
        {
            this.postVisMsg("setUseWireframe", value + "");
        }

        /** When true, triangles not facing the camera are skipped during rendering */
        public setUseCulling(value: boolean)
        {
            this.postVisMsg("setUseCulling", value + "");
        }

        /** When true, the 3D box around the shapes is visible. */
        public set3dGridVisible(value: boolean)
        {
            this.postVisMsg("set3dGridVisible", value + "");
        }

        /** this controls the hover operation (how shapes are detected under the mouse/pointer).  Note that turning off hover will disable tooltips.  */
        public setHoverParams(params: HoverParams)
        {
            var str = JSON.stringify(params);
            this.postVisMsg("setHoverParams", str);
        }

        /** this controls the hover operation (how shapes are detected under the mouse/pointer).  Note that turning off hover will disable tooltips.  */
        public applyHover(x: number, y: number, returnRecord: boolean, colNames?: any[], callback?: any)
        {
            var strColNames = JSON.stringify(colNames);

            this.postVisMsg("applyHover", x+"", y+"", returnRecord+"", strColNames, undefined, undefined, callback, true);
        }

        ///** when true, tooltips for each shape are enabled. */
        //public setUseTooltips(value: any)
        //{
        //    this.postVisMsg("setUseTooltips", value);
        //}

        /** this controls how UNSELECTED and SELECTED shapes are drawn when one or more shapes are selected. */
        public setSelectionParams(params: SelectionParams)
        {
            var str = JSON.stringify(params);
            this.postVisMsg("setSelectionParams", str);
        }

        /** this controls how new selections are combined with the previous selection. */
        public setSelectionMode(mode: SelectMode)
        {
            var str = JSON.stringify(mode);
            this.postVisMsg("setSelectionMode", str);
        }

        /** specifies whether or not mouse/touch gestures for tranformations are enabled.  When true, gestures like pinch zoom, drag pan, and wheel operations are active. */
        public setUseTransforms(value: boolean)
        {
            this.postVisMsg("setUseTransforms", value+"");
        }

        /** Resets the 3D transform and inertia to their default values. */
        public resetTransform()
        {
            this.postVisMsg("resetTransform");
        }

        /** clear the selection, such that no records are selected. */
        public clearSelection()
        {
            this.postVisMsg("clearSelection");
        }

        /** reset the FILTER and the SELECTION, such that no records are filtered out and no records are selected. */
        public resetFilter()
        {
            this.postVisMsg("resetFilter");
        }

        /** filter OUT the UNSELECTED records. */
        public isolateSelection()
        {
            this.postVisMsg("isolateSelection");
        }

        /** filter OUT the SELECTED records. */
        public excludeSelection()
        {
            this.postVisMsg("excludeSelection");
        }
    }

    export function debug(msg)
    {
        var w = <any>window;
        var vp = w.vp;

        if (false)      // vp && vp.utils && vp.utils.debug)
        {
            vp.utils.debug(msg);
        }
        else if (console && console.log)
        {
            console.log("[bps]: " + msg);
        }
    }

    export enum MappingSpread
    {
        normal,
        low,
        high,
    }

    export enum BinSorting
    {
        none,
        ascending,
        descending,
    }

    /** the delimiters that separate tags in a column value. */
    export enum TagDelimiter
    {
        none,
        semi,
        comma,
        space,
    }

    export var TagDelimiters = [null, ";", ",", " "];

    /** parameters for mapping column data to attributes, facets, and axes. */
    export class MappingData
    {
        colName: string;

        //---- binning ----
        binCount: number;
        isBinCountSoft: boolean;                // when true, system can change binCount for nicer numbers
        binSorting: BinSorting;
        forceCategory: boolean;
        tagDelimiter: TagDelimiter;             // if != None, then bin on the full set of tag values rather than the column values

        //---- scaling ----
        spread: MappingSpread;

        //---- legend info ----
        useNiceNumbers: boolean;
        minBreak: number;                        // set the starting break value (must be <= minData)
        maxBreak: number;                        // set the ending break value (must be >= maxData)
        breaks: any[];                           // overrides normally determined breaks.  Dates should be specified as numbers here (+myDate).  
        labels: string[];                        // overrides the normal conversion of a break to a string
        formatting: string;                      // optional: specifies how to format the value (e.g., "#,##0.000" for number or "mmm-yy" for date)
        customScalingCallback: any;              // client should pass as a string (func.toString())

        /** this should be set to the bound set of values (from current or a previous filter setting). */
        boundColInfo: ColInfo;                 

        constructor(colName = "", binCount = 9)
        {
            this.colName = colName;
            this.binCount = binCount;
            //this.maxCategoryBins = 32;
            this.binSorting = BinSorting.none;
            this.forceCategory = false;
            this.spread = MappingSpread.normal;
            this.customScalingCallback = null;
            this.breaks = null;
            this.customScalingCallback = null;
            this.useNiceNumbers = false;
            this.boundColInfo = null;
        }
    }

    export class SizeMappingData extends MappingData
    {
        /// NOTE: sizePalette should only contain values between 0 and 1. 
        sizePalette: any[];
        isContinuous: boolean;      // not currently supported by BeachParty app

        constructor(binCount = 9)
        {
            super("", binCount);

            this.sizePalette = [.25, .5, .75, 1];
            this.isContinuous = false;
        }
    }

    export class LineMappingData extends MappingData
    {
        color: string;
        opacity: number;
        size: number;
        lineStyle: string;

        constructor(binCount = 9)
        {
            super("", binCount);

            this.color = "white";
            this.opacity = 1;
            this.size = 1;
            this.lineStyle = "solid";
        }
    }

    export class TextMappingData extends MappingData
    {
        fontDesc: string;
        color: string;
        opacity: number;
        maxTextLength: number;
        maxShapes: number;

        constructor(binCount = 9)
        {
            super("", binCount);

            this.fontDesc = "12px Tahoma";
            this.color = "white";
            this.opacity = .5;
            this.maxTextLength = 100;
        }
    }

    export class ImageMappingData extends MappingData
    {
        imagePalette: string[];

        constructor(binCount = 9)
        {
            super("", binCount);

            this.imagePalette = ["filled circle", "filled square", "filled triangle" , "circle", "square", "triangle"];
        }
    }

    export class ColorMappingData extends MappingData
    {
        isContinuous: boolean;
        colorPalette: any[];

        //---- color palette description (not used by chart engine) ----
        paletteName: string;
        isReversed: boolean;      
        stepsRequested: number;

        constructor(paletteName = "RdBu", isContinuous = false, stepsRequested = 7, isReversed?: boolean)
        {
            super();

            this.paletteName = paletteName;
            this.isContinuous = isContinuous;
            this.stepsRequested = stepsRequested;
            this.isReversed = isReversed;

            this.colorPalette = null;
        }
    }

    export class SearchParams
    {
        colName: string;
        minValue: any;
        maxValue: any;
        searchType: TextSearchType;
        searchAction: SearchAction;
        searchRawValues: boolean;
    }

    export class FacetLayoutInfo
    {
        plotBounds: ClientRect;     // screen rect (relative to beginning of chart)
        labelBounds: ClientRect;     // screen rect (relative to beginning of chart)
        facetIndex: number;
        facelLabel: string;

        //---- search parameters to be used when label is clicked ----
        searchParams: SearchParams;
    }

    export class FacetMappingData extends MappingData
    {
        facetBounds: any[];       // array of screen rect's that describe position of facets relative to beginning of chart

        constructor(binCount = 9)
        {
            super("", binCount);

            this.facetBounds = null;        // if null, system will layout bounds
        }
    }

    export class AxisData
    {
        isAxisVisible: boolean;
        drawTicks: boolean;
        drawLabels: boolean;
        drawGridLines: boolean;

        constructor()
        {
            this.isAxisVisible = true;
            this.drawTicks = true;
            this.drawLabels = true;
            this.drawGridLines = false;
        }
    }

    export class ChartFrameData
    {
        opacity: number;
        labelColor: string;
        tickColor: string;
        padding: any;               // optional: .left, .top, .right, .bottom padding added to chartFrame

        xAxis: AxisData;
        yAxis: AxisData;
        zAxis: AxisData;

        constructor()
        {
            this.opacity = 1;
            this.labelColor = "white";
            this.tickColor = "white";
            this.padding = null;

            this.xAxis = new AxisData();
            this.yAxis = new AxisData();
            this.zAxis = new AxisData();
        }
    }

    export enum TextSearchType
    {
        exactMatch,
        startsWith,
        contains,
        lessThan,
        lessThanEqual,
        greaterThan,
        greaterThanEqual,
        betweenInclusive,
        gtrValueAndLeqValue2,
        notEqual,
    }

    export enum SearchAction
    {
        selectMatches,
        returnMatches,
    }

    export enum EaseFunction
    {
        none,
        quadratic,
        cubic,
        quartic,
        quintic,
        exponential,
        sine,
        circle,
    }

    export enum EaseType
    {
        in,
        out,
        inOut,
    }

    export class AnimationData
    {
        isAnimationEnabled: boolean;
        animationDuration: number;
        isStaggeringEnabled: boolean;
        maxStaggerTime: number;
        easeFunction: EaseFunction;
        easeType: EaseType;

        constructor()
        {
            this.isAnimationEnabled = true;
            this.animationDuration = .45;           // .35
            this.isStaggeringEnabled = true;           
            this.maxStaggerTime = .45;              // .35
            this.easeFunction = EaseFunction.quadratic;
            this.easeType = EaseType.out;
        }
    }

    export enum DrawPrimitive
    {
        auto,               // auto: client-app will pick best option for chartType
        point,
        triangle,
        quad,
        cube,
        smartCube,          // renders same 3 vertices 12 times
        line,
        thickLine,
    }

    export class ColMappings
    {
        x: bps.MappingData;
        y: bps.MappingData;
        z: bps.MappingData;

        color: bps.ColorMappingData;
        facet: bps.FacetMappingData;
        size: bps.SizeMappingData;
        text: bps.TextMappingData;
        image: bps.ImageMappingData;

        constructor(x: string, y: string, color?: string)
        {
            this.x = new MappingData(x);
            this.y = new MappingData(y);
            this.color = new ColorMappingData(color, false, 5, false);
        }
    }

    //export enum FieldType
    //{
    //    auto,       // let system figure it out
    //    date,
    //    numeric,
    //    category,
    //}

    export class PreloadField
    {
        name: string;
        description: string;
        calcFieldExp: string;
        fieldType: string;          // string, number, date
        formatting: string;         // optional: specifies how to format the value (e.g., "#,##0.000" for number or "mmm-yy" for date)
        sortedValues: string[];
        valueMap: ValueMapEntry[];

        constructor(name: string, desc: string, calcFieldExp?: string, fieldType?: string, sortedValues?: string[], formatting?: string)
        {
            this.name = name;
            this.description = desc;
            this.calcFieldExp = calcFieldExp;
            this.fieldType = fieldType;
            this.sortedValues = sortedValues;
            this.formatting = formatting;
            this.valueMap = null;
        }
    }

    export enum FileType
    {
        delimited,
        json,
        sql,
    }

    /** parameters that specify the working data: which data to load and how it should be transformed. */
    export class WorkingDataParams
    {
        dataName: string;           // name used to identify this data (when multiple data sources are open)

        //---- info for opening the data source  ----
        filePath: string;           // or SQL connection string
        fileType: FileType;         // delimited, json, sql
        separator: string;          // for CSV files
        hasHeader: boolean;         // for CSV files
        tableName: string;          // SQL table name
        fileSource: string;         // known, local, url, sql
        primaryKeyCol: string;      // column containing a unique IO for every record

        //---- data transform ----
        queryString: string;        // SQL query
        maxRecords: number;         // max data records to send back to client

        fieldList: PreloadField[];  // fields to include (include calc fields)
        mergeFieldList: boolean;    // if true, fieldList is merged with existing fields; if false, fieldList defines the visible fields

        /** When this exp evaluates to true, the specified records will be removed from the data set, before the data is loaded. */
        prefilter: string;          // initial filter

        /** this is used to expand records to match each value in a multiValue column */
        multiValueCol: string;      // this is experimental

        filteredOutKeys: string[];      // primary keys of FILTERED-OUT records
        selectedKeys: string[];         // primary keys of SELECTED records

        constructor(dataName?: string, path?: string, fileSource?: string)
        {
            this.dataName = dataName;
            this.filePath = path;
            this.fileSource = fileSource;
            this.primaryKeyCol = null;

            this.hasHeader = true;
            this.fileType = FileType.delimited;
            this.fieldList = [];
        }

        addField(name: string, desc: string, calcFieldExp?: string, fieldType?: string, sortedValues?: string[])
        {
            var pf = new PreloadField(name, desc, calcFieldExp, fieldType, sortedValues);
            this.fieldList.push(pf);
        }

        getField(name: string)
        {
            var fix = <PreloadField>null;

            for (var i = 0; i < this.fieldList.length; i++)
            {
                var fi = this.fieldList[i];
                if (fi.name === name)
                {
                    fix = fi;
                    break;
                }
            }

            return fix;
        }

    }

    /** Preloaded settings for data files. Users should also be able to create these by saving their current view.
    This also is how we represent the full state of an insight, to be persisted between sessions. */
    export class Preload extends WorkingDataParams
    {
        //---- info defining a VIEW (chart) of the data ----
        worldTransform: Float32Array;
        rotationInertia: number[];          // x, y, z 

        colMappings: ColMappings;
        chartName: string;
        subLayout: string;
        shapeColor: string;
        shapeImage: string;
        tooltipFieldList: string[];
        isXGridVisible: boolean;
        isYGridVisible: boolean;
        isZGridVisible: boolean;
        shapeOpacity: number;
        sizeFactor: number;
        separationFactor: number;
        dataTips: DataTipData[];
        sortCol: string;
        isSortAscending: boolean;

        //---- METADATA starts here ----

        /** User-defined name for this preload. */
        name: string;

        /** User-supplied description of this preload. */
        description: string;

        /** Should this be shown in the "File Open" UX?  (is this a 'favorites' data set?) */
        showInFileOpen: boolean;

        /** who create this INSIGHT or PRELOAD. */
        addedBy: string;

        /** when this INSIGHT/PRELOAD was created. */
        dateAdded: Date;

        recordCount: number;
        entityTypeCount: number;     // this is set to "1" for flat files
        hasTimeData: boolean;

        constructor(name?: string, path?: string, description?: string, x?: string, y?: string, color?: string, chart?: string, subLayout?: string)
        {
            super(name, path);

            this.name = name;
            this.description = description;

            this.tooltipFieldList = null;
            this.showInFileOpen = true;
            //this.addedBy = "rfernand";
            this.hasTimeData = false;
            this.dateAdded = new Date();

            this.colMappings = new ColMappings(x, y, color);
            this.chartName = chart;
            this.subLayout = subLayout;
        }
    }

    /** This is the subset of InsightData that is managed by the chart engine. */
    export class SystemViewData
    {
        //---- properties that can be read and written to the chart engine ----
        filteredOutKeys: string[];
        selectedKeys: string[];
        worldTransform: Float32Array;
        rotationInertia: number[];          // x, y, z 

        //---- properties that can only be read from the chart engine ----
        imageAsUrl: string;
        chartRepro: ChartRepro;
    }

    export enum LoadAction
    {
        all,
        selection,
        filter,
        view,
        data,
    }

    export enum NotesSource
    {
        none,
        name,
        notes,
        both,
    }

    export class InsightData 
    {
        preload: bps.Preload;

        imageAsUrl: string;
        chartRepro: bps.ChartRepro;

        //---- client properties that must be persisted but are not included in the chart state ----
        searchText: string;
        searchColumn: string;
        isDetailsPanelOpen: boolean;
        isSortPanelOpen: boolean;
        isAppPanelOpen: boolean;
        isColorPanelOpen: boolean;
        isSlicerPanelOpen: boolean;
        isShowing3DWheel: boolean;

        name: string;
        notes: string;
        loadAction: LoadAction;

        //---- notes panel information ----
        notesSource: NotesSource;
        notesBounds: any;

        constructor(insightName = "", notes = "")
        {
            this.preload = new Preload("", null, "");

            this.name = insightName;
            this.notes = notes;
            this.loadAction = LoadAction.all;
            this.notesSource = NotesSource.both;
        }
    }

    export enum MarkerType
    {
        circleFill,
        rectFill,
        triangleFill,
        separator,
        circleOutline,
        rectOutline,
        triangleOutline,
    }

    export class ColInfo
    {
        name: string;               // name of column 
        colType: string;            // string, number, date
        calcFieldExp: string;       // for defining a renamed column or true calculated field expression
        desc: string;               // description of column (for display to user)
        min: number;                // for non-string colType
        max: number;                // for non-string colType
        sortedKeys: string[];       // for strings colType: contains a list of unique values for column, in desired sort order (always in SCRUBBED values - not orig)

        constructor(name: string, desc: string, colType: string, sortedkeys: string[], min?: number, max?: number)
        {
            this.name = name;
            this.colType = colType;
            this.calcFieldExp = null;
            this.desc = desc;
            this.sortedKeys = sortedkeys;
            this.min = min;
            this.max = max;
        }
    }

    //---- for reading/changing values associated with a column ----
    export class ValueMapEntry
    {
        originalValue: string;          // found in original table/column on various rows
        valueCount: number;             // # of times this value occurs in all rows of associated column
        newValue: string;               // the new value to replace the original value when data is loaded
    }

    export class AmbientLight
    {
        lightFactor: number;
        color: number[];

        constructor()
        {
            this.lightFactor = .25;
            this.color = [1, 1, 1];     // white
        }
    }

    export class DirectionalLight extends AmbientLight
    {
        direction: number[];

        constructor()
        {
            super();

            this.lightFactor = 1;
        }
    }

    /// currently, this is not supported from the client...
    export class Lighting
    {
        isLightingEnabled: boolean;

        ambientLight: AmbientLight;
        light1: DirectionalLight;
        light2: DirectionalLight;

        constructor()
        {
            this.ambientLight = new AmbientLight();

            //---- currently, these lights are defined in the cubeVertexShader.c shader ----
            this.light1 = new DirectionalLight();
            this.light2 = new DirectionalLight();
        }
    }

    /** 10 floats (80 bytes). */
    export class LayoutResult
    {
        x: number;
        y: number;
        z: number;
        width: number;
        height: number;
        depth: number;
        colorIndex: number;
        imageIndex: number;
        opacity: number;
        theta: number;
    }

    /** Information to rebuild chart as SVG, etc. */
    export class ChartRepro
    {
        xFactor: number;        // used to scale from 3D units to pixels
        yFactor: number;        // used to scale from 3D units to pixels
        zFactor: number;        // used to scale from 3D units to pixels
        layoutResults: LayoutResult[];
    }

    export enum ChartType
    {
        Bar,
        Column,
        Flat,
        Density,
        Line,
        Radial,
        Scatter,
        Scatter3D,
        Stacks,
        StacksBin,
        Violin,
    }

    export enum Layout
    {
        Random,         
        Grid,
        Circle,
        Poisson,
        Squarify,
    }

    export enum HoverMatch
    {
        none,
        point,
        square,
    }

    export enum HoverEffect
    {
        /** this means that hover has no visual effect on shapes. */
        none,

        /** this means that hover shape will be drawn on top with this color. */
        setColor,

        /** this means that hover shape will be drawn on top with its original color. */
        sameColor,
    }

    export class HoverParams
    {
        hoverMatch: HoverMatch;
        squareSize: number;
        hoverEffect: HoverEffect;
        hoverColor: string;        // applied when hoverEffect == SetColor

        constructor()
        {
            this.hoverMatch = HoverMatch.point;
            this.squareSize = 10;
            this.hoverEffect = HoverEffect.sameColor;
            this.hoverColor = "purple";  
        }
    }

    /** Engine events that client can subscribe to.  NOTE: this list may be out of date.  Caller can use a string in place 
    of ChartEvent when subscribing to an event.   */
    export enum ChartEvent
    {
        /** triggered when the chart engine is loaded in the iframe. */
        engineLoaded,

        /** triggered when an error occurs in the chart engine. */
        engineError,

        /** triggered when a dataFrame is loaded.  */
        dataFrameLoaded,

        /** triggered when the selection in the chart is changed. */
        selectionChanged,

        /** triggered when the selection is changed by dragging a rectangle around shapes. */
        onRectSelection,

        /** triggered when tickBar, axis label, or facet label is clicked to change the selection. */
        onClickSelection,

        /** triggered when the filter in the chart is changed. */
        filterChanged,

        /** trigger when user pressed mouse button, pointer, or touches inside the chart. */
        mouseDown,

        /** triggered when mouse/pointer is moved over a new shape or empty space. */
        mouseHover,

        /** triggered when user invokes a context menu on the chart. */
        contextMenu,

        /** triggered when user presses ESCAPE key while chart has focus. */
        escapeKey,

        /** triggered when chart being drawn changes the value of maxItemCount. */
        maxItemCount,

        /** triggered at end of animation cycle. */
        frameStats,
    }

    export enum ColorEffect
    {
        none,
        setColor,
        adjustHue,
        adjustSaturation,
        adjustValue,
    }

    /** this can be applied to SELECTED and UNSELECTED shapes. */
    export class ColorParams
    {
        colorEffect: ColorEffect;
        color: string;
        rgb: number[];              // will be computed on demand from "color"
        colorFactor: number;

        constructor(colorEffect = ColorEffect.none, color = "yellow", colorFactor = .25)
        {
            this.colorEffect = colorEffect;
            this.color = color;
            this.colorFactor = colorFactor;
        }
    }

    export class SelectionParams
    {
        unselectedParams: ColorParams;
        selectedParams: ColorParams;

        constructor()
        {
            this.unselectedParams = new ColorParams(ColorEffect.adjustSaturation, "yellow", .20);
            this.selectedParams = new ColorParams(ColorEffect.setColor, "yellow", .20);
        }
    }

    export enum VectorType
    {
        sortOrder,
        naturalOrder,
        primaryKeyList,
    }

    export class DataTipData
    {
        text: string;     // text displayed when this data was extracted
        offset: any;      // optional: offset within parent canvas (if not bound to a record)
        colName: string;   // optional: name of column this is bound to;
        primaryKey: string;        // optional: primary key of record that this is bound to
    }

    export function createBpsHelper(bpsChartOrIFrameId: string, bpsDomain?: string, baseServerDir?: string, fromDomain?: string, clientAppId?: string)
    {
        var helper = new ChartHostHelperClass(bpsChartOrIFrameId, bpsDomain, baseServerDir, fromDomain, clientAppId);
        return helper;
    }

    export enum SelectMode
    {
        normal,
        additive,
        subtractive,
        intersection,
        nonIntersection,
    }

}