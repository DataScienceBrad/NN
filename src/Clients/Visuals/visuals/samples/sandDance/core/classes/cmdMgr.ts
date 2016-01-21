//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    cmdMgr - manages the recording, dispatch, and playback of cmds.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class CmdMgrClass extends DataChangerClass
    {
        private container: HTMLElement;

        //_cmdHistory = [];
        _pendingVaasCmds = [];
        _clientCmdId = null;

        _appMgr: AppMgrClass;
        _windowMgr: WindowMgrClass;

        constructor(appMgr: AppMgrClass, container: HTMLElement)
        {
            super();

            this.container = container;
            this._appMgr = appMgr;
        }

        /** set when windowMgr is first created (by appMgr). */
        setWindowMgr(windowMgr: WindowMgrClass)
        {
            this._windowMgr = windowMgr;
        }

        addToPendingCmd(msgBlock)
        {
            this._pendingVaasCmds.push(msgBlock);
        }

        processPendingVaasCmds()
        {
            for (var i = 0; i < this._pendingVaasCmds.length; i++)
            {
                var cmd = this._pendingVaasCmds[i];
                this.dispatchCmd(cmd);
            }

            this._pendingVaasCmds = [];
        }

        dispatchCmd(cmdObj: any)
        {
            //---- let windowMgr.onerror handle all errors 
            //try
            {
                if (vp.utils.isArray(cmdObj))
                {
                    //---- dispatch batch of cmds ----
                    for (var i = 0; i < cmdObj.length; i++)
                    {
                        var msgBlock = cmdObj[i];
                        this.dispatchCmdEx(msgBlock);
                    }
                }
                else
                {
                    this.dispatchCmdEx(cmdObj);
                }
            }
            //catch (ex)
            //{
            //    var msgBlock2 = { msg: "error", ex: ex };
            //    this._appMgr.postMessageToParent(msgBlock2);
            //}
        }

        private dispatchCmdEx(msgBlock: any)
        {
            //vp.utils.debug("raw msg/cmd received by engine: " + msgBlock.cmd);

            //---- watch out for msgs from ourself is we are running fullscreen ----
            if (msgBlock.cmd !== undefined)
            {
                //---- do NOT save each cmd - will eat up too much memory ----
                //this._cmdHistory.push(msgBlock);

                var cmd = msgBlock.cmd.toLowerCase();               // allow for user mis-caseing 
                var canvasElem = this._appMgr.getCanvas3dElem();

                //---- process cmd from parent document (usually running VAAS) ----
                if (cmd === "setbackground")
                {
                    vp.select(/*document.body*/this.container)
                        .css("background", msgBlock.param);
                }
                else if (cmd === "setplotbackground")
                {
                    vp.select(canvasElem)
                        .css("background", msgBlock.param);
                }
                else
                {
                    this.processViewCmd(msgBlock);
                }
            }
        }

        private processViewCmd(msgBlock: any)
        {
            this._appMgr.onClientCmdStarted(msgBlock.cmd);

            var view = this._appMgr.getViewByIndex(msgBlock.viewId);
            var transformMgr = view.getTransformMgr();
            var dataMgr = this._appMgr.getDataMgr();
            var dataFrame = dataMgr.getDataFrame();
            var windowMgr = this._appMgr._windowMgr;

            TraceMgrClass.instance.addTrace("msgFromClient", msgBlock.cmd, TraceEventType.point);

            var cmd = msgBlock.cmd.toLowerCase();               // allow for user mis-caseing 
            var boolParam = utils.toBool(msgBlock.param);
            var boolParam2 = utils.toBool(msgBlock.param2);
            var boolParam3 = utils.toBool(msgBlock.param3);

            this._clientCmdId = msgBlock.cmdId;

            if (view)
            {
                if (cmd === "setcanvascolor")
                {
                    view.canvasColor(msgBlock.param);
                }
                else if (cmd === "setshapecolor")
                {
                    view.shapeColor(msgBlock.param);
                }
                else if (cmd === "setsizefactor")
                {
                    var animate = utils.toBool(msgBlock.param2);
                    view.userSizeFactor(+msgBlock.param, animate);
                }
                else if (cmd === "setseparationfactor")
                {
                    view.separationFactor(+msgBlock.param);
                }
                else if (cmd === "setdefaultshapesize")
                {
                    view.defaultShapeSize(+msgBlock.param);
                }
                else if (cmd === "setshapeopacity")
                {
                    view.shapeOpacity(+msgBlock.param);
                }
                else if (cmd === "settextopacity")
                {
                    view.textOpacity(+msgBlock.param);
                }
                else if (cmd === "subscribe")
                {
                    var returnData = boolParam2;
                    var oneTimeOnly = boolParam3;

                    this._appMgr.clientSubscribe(msgBlock.param, returnData, oneTimeOnly);
                }
                else if (cmd === "testroundtriptime")
                {
                    vp.utils.debug("testRoundTrip received");

                    this._appMgr.sendDataChangedToHost("roundTrip");
                }
                else if (cmd === "getsystemviewdata")
                {
                    var getSnapshot = boolParam;
                    var getRepro = boolParam2;
                    this.getSystemViewData(msgBlock.requestId, getSnapshot, getRepro, view);;
                }
                else if (cmd === "getengineevents")
                {
                    var engineEvents = TraceMgrClass.instance.getCmds();
                    var requestId = msgBlock.requestId;

                    this._appMgr.postMessageToParent({ msg: "getEngineEventsResponse", responseId: requestId, engineEvents: engineEvents });
                }
                else if (cmd === "getmemoryuse")
                {
                    var memObjs = <any>{};

                    //---- first build a map of major objects in engine ----
                    var chart = view.getChart();

                    memObjs.dataMgr = dataMgr;
                    memObjs.dataFrame = dataFrame;
                    memObjs.chart = chart;
                    memObjs.view = view;
                    memObjs.appMgr = this._appMgr;
                    memObjs.cmdMgr = this;
                    memObjs.windowMgr = this._windowMgr;
                    memObjs.traceMgr = TraceMgrClass.instance;
                    memObjs.transformer = chart._transformer;
                    memObjs.transformMgr = view.getTransformMgr();
                    memObjs.shareMgr = dataMgr.getShareMgr();
                    memObjs.chartFrameHelper = chart._chartFrameHelper;
                    memObjs.boundingBoxMgr = chart.getBoundingBoxMgr();

                    var memUse = utils.getMemoryUse(memObjs);
                    var requestId = msgBlock.requestId;

                    this._appMgr.postMessageToParent({ msg: "getMemoryUseResponse", responseId: requestId, memUse: memUse });
                }
                else if (cmd === "setsystemviewdata")
                {
                    var svd = <bps.SystemViewData>JSON.parse(msgBlock.param);
                    var filterChanged = false;
                    var requestId = msgBlock.requestId;

                    if (svd.filteredOutKeys)
                    {
                        dataMgr.setFilter(svd.filteredOutKeys);
                        filterChanged = true;
                    }

                    if (svd.selectedKeys)
                    {
                        dataMgr.setSelectionDirect(svd.selectedKeys, "insight");
                    }

                    if (svd.worldTransform)
                    {
                        var matWorld = this.makeMatrix(svd.worldTransform);
                        transformMgr.getTransformer().world(matWorld);
                    }

                    if (svd.rotationInertia)
                    {
                        transformMgr.inertia(svd.rotationInertia);
                    }

                    if (requestId)
                    {
                        this._appMgr.postMessageToParent({ msg: "onSetSystemViewData", responseId: requestId });
                    }
                }
                else if (cmd === "loadknowndata")
                {
                    var requestId = msgBlock.requestId;
                    var name = msgBlock.param;

                    dataMgr.loadKnownAsync(name, null, (df: DataFrameClass) =>
                    {
                        if (requestId)
                        {
                            this._appMgr.postMessageToParent({ msg: "onLoadKnownDataCompleted", responseId: requestId });
                        }
                    });
                }
                else if (cmd === "selectxtickbox")
                {
                    var index = +msgBlock.param;
                    view.getChart()._chartFrameHelper.selectXBoxByIndex(index);
                }
                else if (cmd === "selectytickbox")
                {
                    var index = +msgBlock.param;
                    view.getChart()._chartFrameHelper.selectYBoxByIndex(index);
                }
                else if (cmd === "loaddata")
                {
                    var wdParams = <bps.WorkingDataParams>vp.utils.parseJsonIntoObj(msgBlock.param, new bps.WorkingDataParams());

                    console.log("wdParams: " + wdParams);
// 
                    this.loadDataFromServer(wdParams, msgBlock.requestId, view);
                }
                else if (cmd === "updatedataview")
                {
                    if (msgBlock.param2)
                    {
                        var wdParams = <bps.WorkingDataParams>vp.utils.parseJsonIntoObj(msgBlock.param2, new bps.Preload());
                    }
                    else
                    {
                        var wdParams = new bps.WorkingDataParams();
                    }

                    dataMgr.setDataDirect(msgBlock.param, wdParams);

                    //---- send response ----
                    var requestId = msgBlock.requestId;
                    if (requestId)
                    {
                        this._appMgr.postMessageToParent({ msg: "setDataResponse", responseId: requestId });
                    }
                }
                else if (cmd === "setdata")
                {
                    var data;
                    
                    if (typeof msgBlock.param === "object") {
                        data = msgBlock.param;
                    } else {
                        data = JSON.parse(msgBlock.param);
                    }

                    if (msgBlock.param2)
                    {
                        var wdParams = <bps.WorkingDataParams>vp.utils.parseJsonIntoObj(msgBlock.param2, new bps.Preload());
                    }
                    else
                    {
                        var wdParams = new bps.WorkingDataParams();
                    }

                    dataMgr.setDataDirect(data, wdParams);

                    //---- send response ----
                    var requestId = msgBlock.requestId;
                    if (requestId)
                    {
                        this._appMgr.postMessageToParent({ msg: "setDataResponse", responseId: requestId });
                    }
                }
                else if (cmd === "renderwebpagetopng")
                {
                    var pageUrl = msgBlock.param;
                    var width = +msgBlock.param2;
                    var height = +msgBlock.param3;
                    var msTimeout = +msgBlock.param4;

                    renderWebPageToPng(pageUrl, width, height, msTimeout, (data) =>
                    {
                        //---- send response ----
                        var requestId = msgBlock.requestId;
                        if (requestId)
                        {
                            this._appMgr.postMessageToParent({ msg: "renderWebPageToPngResponse", responseId: requestId, data: data });
                        }
                    });

                }
                else if (cmd === "setcharttype")
                {
                    view.setChartType(msgBlock.param, msgBlock.param2);
                }
                else if (cmd === "addstylesheet")
                {
                    var text = msgBlock.param;
                    vp.dom.createStyleSheet(text);
                }
                else if (cmd === "showwheelduringtransformmode")
                {
                    windowMgr.showWheelDuringTransformMode(boolParam);
                }
                else if (cmd === "setmaxitemcount")
                {
                    var enabled = boolParam;
                    var maxCount = +msgBlock.param2;

                    view.isMaxItemCountEnabled(enabled);
                    view.maxItemCount(maxCount);
                }
                else if (cmd === "setautorebuild")
                {
                    var autoRebuild = boolParam;
                    var buildNow = boolParam2;
                    var skipFilterSecondState = boolParam3;

                    view.isAutoRebuild(autoRebuild);

                    if (buildNow)
                    {
                        view.buildNow(skipFilterSecondState);       //true);
                    }
                }
                else if (cmd === "rectselect")
                {
                    var rcBand = JSON.parse(msgBlock.param);

                    //---- adjust rcBand for offset of 10 in top ----
                    var rcBandAdj = vp.geom.createRect(rcBand.left, rcBand.top, rcBand.width, rcBand.height);

                    view.hitTestRectWithSelect(rcBandAdj);
                    this._appMgr.onRectSelection(rcBandAdj);                
                }
                else if (cmd === "setchartdebuginfo")
                {
                    view.showChartDebugInfo(boolParam);
                }
                else if (cmd === "setlightingparams")
                {
                    var lightParams = JSON.parse(msgBlock.param);
                    view.lightingParams(lightParams);
                }
                else if (cmd === "setchartframedata")
                {
                    var cfd = <bps.ChartFrameData>JSON.parse(msgBlock.param);
                    view.chartFrameData(cfd);
                }
                else if (cmd === "getrecordandbounds")
                {
                    var primaryKey = msgBlock.param;
                    var colNames = <string[]> JSON.parse(msgBlock.param2);
                    var requestId = msgBlock.requestId;

                    var colValues = view.getColumnValues(colNames, primaryKey);
                    var screenBounds = view.getShapeScreenRect(primaryKey);
                    var rcPlot = view.getPlotBoundsInPixels();

                    //---- post result back to client ----
                    var msgBlock4 = {
                        msg: "recordAndBounds", responseId: requestId, colValues: colValues, primaryKey: primaryKey,
                        screenBounds: screenBounds, rcPlot: rcPlot
                    };

                    this._appMgr.postMessageToParent(msgBlock4);
                }
                else if (cmd === "getplotbounds")
                {
                    var requestId = msgBlock.requestId;

                    var rcPlot = view.getPlotBoundsInPixels();
                    var rcRotateRing = this._windowMgr.getRotationBounds();

                    //---- post result back to client ----
                    var msgBlock10 = { msg: "plotBounds", responseId: requestId, rcPlot: rcPlot, rcRotateRing: rcRotateRing   };

                    this._appMgr.postMessageToParent(msgBlock10);
                }
                else if (cmd === "getmostcentralrecord")
                {
                    var rcScreen = <ClientRect>JSON.parse(msgBlock.param);
                    var colList = <string[]>JSON.parse(msgBlock.param2);
                    var requestId = msgBlock.requestId;

                    var result = view.getMostCentralRecord(rcScreen, colList);

                    //---- post result back to client ----
                    var msgBlock3 = { msg: "recordAtScreenPos", responseId: requestId, colValues: result.colValues, recordIndex: result.recordIndex };
                    this._appMgr.postMessageToParent(msgBlock3);
                }
                else if (cmd === "setanimationdata")
                {
                    var ad = <bps.AnimationData>JSON.parse(msgBlock.param);
                    view.animationData(ad);
                }
                else if (cmd === "setcolormapping")
                {
                    var colorMapping = <bps.ColorMappingData>(msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.ColorMappingData();
                    view.colorMapping(colorMapping);
                }
                else if (cmd === "setsizemapping")
                {
                    var sizeMapping = <bps.SizeMappingData>(msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.SizeMappingData();
                    view.sizeMapping(sizeMapping);
                }
                else if (cmd === "settextmapping")
                {
                    var textMapping = <bps.TextMappingData>(msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.TextMappingData();
                    view.textMapping(textMapping);
                }
                else if (cmd === "setlinemapping")
                {
                    var lineMapping = <bps.LineMappingData>(msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.LineMappingData();
                    view.lineMapping(lineMapping);
                }
                else if (cmd === "setshapeimage")
                {
                    view.shapeImageName(msgBlock.param);
                }
                else if (cmd === "settopercentoverride")
                {
                    view.toPercentOverride(msgBlock.param);
                }
                else if (cmd === "setanimoverride")
                {
                    view.isAnimOverride(boolParam);
                }
                else if (cmd === "set3dgridvisible")
                {
                    view.is3dGridVisible(boolParam);
                }
                else if (cmd === "setimagemapping")
                {
                    var imageMapping = <bps.ImageMappingData>JSON.parse(msgBlock.param);
                    view.imageMapping(imageMapping);
                }
                else if (cmd === "setfacetmapping")
                {
                    var facetMapping = <bps.FacetMappingData>JSON.parse(msgBlock.param);
                    view.facetMapping(facetMapping);
                }
                else if (cmd === "setxmapping")
                {
                    var xMapping = <bps.MappingData> (msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.MappingData(null);
                    view.xMapping(xMapping);
                }
                else if (cmd === "onlocalstoragechange")
                {
                    dataMgr.onLocalStorageChange();
                }
                else if (cmd === "getbindata")
                {
                    var mapping = <bps.MappingData>JSON.parse(msgBlock.param);
                    var requestId = msgBlock.requestId;

                    dataMgr.requestBinData(mapping, (binResult) =>
                    {
                        var param = JSON.stringify(binResult);
                        var msgBlock = { msg: "binData", param: param, responseId: requestId };

                        this._appMgr.postMessageToParent(msgBlock);
                    });
                }
                else if (cmd === "setymapping")
                {
                    var yMapping = <bps.MappingData> (msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.MappingData(null);
                    view.yMapping(yMapping);
                }
                else if (cmd === "setzmapping")
                {
                    var zMapping = <bps.MappingData> (msgBlock.param) ? JSON.parse(msgBlock.param) : new bps.MappingData(null);
                    view.zMapping(zMapping);
                }
                else if (cmd === "setdrawingprimitive")
                {
                    var drawPrim = <bps.DrawPrimitive>bps.DrawPrimitive[<string>msgBlock.param];
                    view.drawingPrimitive(drawPrim);
                }
                else if (cmd === "setorthocamera")
                {
                    view.isOrthoCamera(boolParam);
                }
                else if (cmd === "setshowing3dwheel")
                {
                    windowMgr.areTransformsEnabled(boolParam);
                }
                //else if (cmd == "setuselighting")
                //{
                //    view.lightingEnabled(boolParam);
                //}
                else if (cmd === "setusewireframe")
                {
                    view.isWireframe(boolParam);
                }
                else if (cmd === "setuseculling")
                {
                    view.isCullingEnabled(boolParam);
                }
                else if (cmd === "setselection")
                {
                    var vector = <any[]> JSON.parse(msgBlock.param);
                    var vectorType = bps.VectorType[<string>msgBlock.param2];
                    var changeSource = msgBlock.param3;

                    var primaryKeys = dataFrame.getPrimaryKeys(vector, vectorType);
                    dataMgr.setSelectionDirect(primaryKeys, changeSource);
                }
                else if (cmd === "sethoverparams")
                {
                    var hoverParams = <bps.HoverParams> JSON.parse(msgBlock.param);
                    view.hoverParams(hoverParams);
                }
                else if (cmd === "setselectionparams")
                {
                    var selectionParams = <bps.SelectionParams> JSON.parse(msgBlock.param);
                    view.selectionParams(selectionParams);
                }
                else if (cmd === "setselectionmode")
                {
                    var selectMode = <bps.SelectMode> JSON.parse(msgBlock.param);
                    dataMgr.selectMode(selectMode);
                }
                //else if (cmd == "setusetooltips")
                //{
                //    view.areToolTipsEnabled(boolParam);
                //}
                else if (cmd === "setusetransforms")
                {
                    this._windowMgr.areTransformsEnabled(boolParam);
                }
                else if (cmd === "setwheelinertia")
                {
                    transformMgr.isInertiaEnabled(boolParam);
                }
                else if (cmd === "sortdata")
                {
                    dataMgr.sortData(msgBlock.param, utils.toBool(msgBlock.param2));
                }
                else if (cmd === "search")
                {
                    //var colName = msgBlock.param;
                    //var value = msgBlock.param2;
                    //var maxValue = msgBlock.param3;
                    //var searchType = <bps.TextSearchType>msgBlock.param4;
                    //var action = <bps.SearchAction>msgBlock.param5;
                    //var searchRawValues = msgBlock.param6;

                    var searchParams = <bps.SearchParams> JSON.parse(msgBlock.param);

                    var requestId = msgBlock.requestId;
                    var results = dataMgr.searchColValue(searchParams);
                    if (searchParams.searchAction === bps.SearchAction.returnMatches)
                    {
                        var rcPlot = view.getPlotBoundsInPixels();

                        var msgBlockBack = { msg: "searchResults", responseId: requestId, results: results, rcPlot: rcPlot };
                        this._appMgr.postMessageToParent(msgBlockBack);
                    }
                }
                else if (cmd === "applyhover")
                {
                    var x = +msgBlock.param;
                    var y = +msgBlock.param2;
                    var returnRecord = boolParam3;
                    var columns = <string[]>JSON.parse(msgBlock.param4);

                    var primaryKey = view.applyHover({ x: x, y: y });
                    var requestId = msgBlock.requestId;

                    if (returnRecord)
                    {
                        var record = dataFrame.getRecordByPrimaryKey(primaryKey, columns);
                    }   

                    var msgBlockHover =
                        {
                            msg: "applyHoverResults", responseId: requestId, primaryKey: primaryKey, record: record
                        };

                    this._appMgr.postMessageToParent(msgBlockHover);
                }
                else if (cmd === "clearselection")
                {
                    dataMgr.clearSelection();
                }
                else if (cmd === "resetfilter")
                {
                    dataMgr.resetFilter();
                }
                else if (cmd === "resettransform")
                {
                    //---- reset the 3D transform and rotation inertia ----
                    //transformMgr.resetTransform();

                    windowMgr.resetStuff();
                }
                else if (cmd === "isolateselection")
                {
                    dataMgr.isolateSelection();
                }
                else if (cmd === "excludeselection")
                {
                    dataMgr.excludeSelection();
                }
                else if (cmd === "getdatavectors")
                {
                    var names = JSON.parse(msgBlock.param);
                    this.requestDataVectors(dataMgr, names);
                }
                else if (cmd === "getvaluemap")
                {
                    this.getValueMap(dataMgr, msgBlock.param, +msgBlock.param2, msgBlock.requestId);
                }
                else if (cmd === "setcontinuousdrawing")
                {
                    view.isContinuousDrawing(boolParam);
                }
            }
        }

        loadDataFromServer(wdParams: bps.WorkingDataParams, requestId: number, view: DataViewClass)
        {
            var dataMgr = this._appMgr._dataMgr;

            if (!wdParams)
            {
                // ---- file is already loaded; process the properties sync ----
                this.loadDataPost(wdParams, requestId, view);
            }
            else
            {
            //     //---- load file and then process the properties ----
                dataMgr.openPreloadAsync(view._dataFrame._vectorsByName, wdParams, (df: DataFrameClass) =>
                {
                    this.loadDataPost(wdParams, requestId, view);
                });
            }
        }

        loadDataPost(wdParams: bps.WorkingDataParams, requestId: number, view: DataViewClass)
        {
            //---- don't draw twice; let client request the only draw in this sequence ----
            view.cancelRquestedDraw();

            //---- post result back to client ----
            var msgBlock = { msg: "BpsInsightLoaded", responseId: requestId };
            this._appMgr.postMessageToParent(msgBlock);
        }

        makeMatrix(fakeArray: Float32Array)
        {
            var mat = new Float32Array(16);

            for (var i = 0; i < 16; i++)
            {
                mat[i] = fakeArray[i];
            }

            return mat;
        }

        getSystemViewData(requestId: number, getSnapshot: boolean, getRepro: boolean, view: DataViewClass)
        {
            var svd = new bps.SystemViewData();
            var dataMgr = this._appMgr._dataMgr;
            var transformMgr = this._appMgr._windowMgr.getTransformMgr();

            var selectVector = dataMgr.getSelectedVector(false);
            svd.selectedKeys = dataMgr.getDataFrame().vectorToPrimaryKeys(selectVector);

            var filterVector = dataMgr.getFilteredVector(false);
            svd.filteredOutKeys = dataMgr.getDataFrame().vectorToPrimaryKeys(filterVector);

            svd.worldTransform = transformMgr.getTransformer().world();
            svd.rotationInertia = transformMgr.inertia();

            if (getRepro)
            {
                svd.chartRepro = view.getChartRepro();
            }

            //---- did client request a copy of the plot image? ----
            if (getSnapshot)
            {
                var canvas = <HTMLCanvasElement>vp.select(this.container, ".canvas3d")[0];

                //---- PNG is messed up for IE/Chrome/Firefox; JPEG seems to work correctly ----
                svd.imageAsUrl = canvas.toDataURL("image/jpeg", 1);
            }

            //---- post result IMMEDIATELY back to client ----
            var param = JSON.stringify(svd);
            var msgBlock = { msg: "SystemViewData", responseId: requestId, param: param };
            this._appMgr.postMessageToParent(msgBlock);
        }

        requestDataVectors(dataMgr: DataMgrClass, names: string[])
        {
            var nv = <any>{};
            var dataFrame = dataMgr.getDataFrame();

            for (var i = 0; i < names.length; i++)
            {
                var name = names[i];
                nv[name] = dataFrame.getVector(name, false);
            }

            var param = JSON.stringify(nv);
            var msgBlock = { msg: "dataVectors", vectors: param };

            this._appMgr.postMessageToParent(msgBlock);
        }

        getValueMap(dataMgr: DataMgrClass, colName: string, maxRows: number, requestId: string)
        {
            var dataFrame = dataMgr.getDataFrame();
            var valueMap = dataFrame.getValueMap(colName, maxRows);

            var msgBlock = { msg: "valueMap", valueMap: valueMap, responseId: requestId };

            this._appMgr.postMessageToParent(msgBlock);
        }
    }
}
 