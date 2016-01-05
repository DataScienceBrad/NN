//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    appMgr - manages and persists the app state
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class AppMgrClass extends DataChangerClass
    {
        static current = <AppMgrClass> null;

        _appSettings: AppSettingsClass; 
        _canvas3dElem: HTMLCanvasElement;
        _canvas2dElem: HTMLCanvasElement;
        _svgDoc: HTMLElement;

        _windowMgr: WindowMgrClass;
        _dataView: DataViewClass;
        _views: DataViewClass[] = [];
        _dataMgr: DataMgrClass;
        _isVaas = false;
        _visId = "";
        _cmdMgr: CmdMgrClass;
        _preloadMgr: PreloadMgrClass;
        _edition = "client";
        _hostDomain = null;             // the client domain (taken from the URL params)
        _eventSubscriptions = {};
        _maxItemCount = 0;
        _beachPartyDir = null;          // location of beachParty server dir, if hosted direct (in div)
        _isHostedDirect = false;
        _msgBytesReceived = 0;
        _cmdStartTime = vp.utils.now();
        _awaitingFirstCmd = true;       // if next cmd will be the first of an cmd/animation cycle
        _cmdExecTime = 0;
        _traceMgr: TraceMgrClass;

        constructor()
        {
            super(); 

            AppMgrClass.current = this;
        }

        init(canvas3dId: string, canvas2dId: string, svgId: string, fileInfoId: string, width: number, height: number,
            visStatsId?: string, gpuStatsId?: string, hitStatsId?: string, moveStatsId?: string,
            drawStatsId?: string, urlParams?: string)
        {
            window.onerror = (errorMsg, errorUrl, errorLineNum) =>
            {
                //---- always send back errors (some may be too early to see, before subscribe() call can take effect ----
                var msgBlock = { msg: "engineError", errorMsg: errorMsg, errorUrl: errorUrl, errorLineNum: errorLineNum };
                this.postMessageToParent(msgBlock);
            };

            this._traceMgr = new TraceMgrClass();

            this._isHostedDirect = (urlParams != null);

            vp.utils.setDebugId("vaas");
            this._appSettings = new AppSettingsClass();

            this._cmdMgr = new CmdMgrClass(this);

            this.processCmdLineParams(urlParams);

            if (!this._isVaas)
            {
                this.loadSettings();
            }

            //this.saveSettings();

            //---- hook "message" event (msgs from hosting window) ----
            // window.addEventListener("message", (e) =>
            // {
            //     this.dispatchMsgToCmdMgr(e.data);
            // });

            sandDance.iframeBus.addEventListener("message", (e) =>
            {
                this.dispatchMsgToCmdMgr(e.data);
            });

            var visStatsElem = document.getElementById(visStatsId);
            var gpuStatsElem = document.getElementById(gpuStatsId);
            var hitStatsElem = document.getElementById(hitStatsId);
            var moveStatsElem = document.getElementById(moveStatsId);
            var drawStatsElem = document.getElementById(drawStatsId);

            var preloadMgr = new PreloadMgrClass();
            this._preloadMgr = preloadMgr;

            //---- use correct dataMgr ----
            var isClientEdition = (this._edition === "client");
            var dataMgr = new DataMgrClass(this, this._preloadMgr, isClientEdition);
            this._dataMgr = dataMgr;

            this._canvas3dElem = <HTMLCanvasElement> document.getElementById(canvas3dId);
            this._canvas2dElem = <HTMLCanvasElement> document.getElementById(canvas2dId);

            var dataView = new DataViewClass(dataMgr, this, this._canvas3dElem, this._canvas2dElem, svgId, visStatsElem,
                gpuStatsElem, hitStatsElem, moveStatsElem, drawStatsElem, this._isVaas);
            this._dataView = dataView;

            this._views.push(dataView);

            this.hookEventsForHost();

            var svgDoc = document.getElementById(svgId);
            this._svgDoc = svgDoc;

            var fileInfoElem = document.getElementById(fileInfoId);

            var windowMgr = new WindowMgrClass(this, dataView, svgDoc, this._canvas3dElem, dataMgr, fileInfoElem,
                visStatsElem, gpuStatsElem, this._isVaas);
            this._windowMgr = windowMgr;

            this._cmdMgr.setWindowMgr(windowMgr);

            if (!this._isVaas)
            {
                //---- load the DemoVote data initially ----
                windowMgr.openKnown("demovote");

                this.applyAppSettings();

                dataView.setChartType("Scatter");
            }

            windowMgr.registerForChange("activeControls", (e) => 
            {
            });

            windowMgr.registerForChange("showDebugStats", (e) => 
            {
                this.updateAndSaveAppSettings();
            });

            windowMgr.registerForChange("showFileInfo", (e) => 
            {
                this.updateAndSaveAppSettings();
            });

            //window.onresize = (e) => this.layoutWindow(); //TODO: update binding. very important.

            this.layoutWindow(width, height);

            this._cmdMgr.processPendingVaasCmds();

            if (this._isVaas)
            {
                var knownData = this._dataMgr.getKnownData();

                //---- always send back "engineLoaded" event ----
                this.postMessageToParent({ msg: "engineLoaded", knownData: knownData});
            }

        }

        processEngineDroppedText(text: string)
        {
            this.postMessageToParent({ msg: "textDropped", text: text });
        }

        //---- called from this class and from host code (when chart engine is hosted directly in a div) ----
        dispatchMsgToCmdMgr(msg: string)
        {
            //this._msgBytesReceived += msg.length;

            ////---- debug - show how many bytes of msgs received in this session ----
            //var text = "msgBytesReceived: " + vp.formatters.format(this._msgBytesReceived);
            //vp.select("#consoleDiv").text(text);

            var msgBlock = JSON.parse(msg);

            this._cmdMgr.dispatchCmd(msgBlock);
        }

        clientSubscribe(event: string, returnData: boolean, oneTimeOnly: boolean)
        {
            var key = event;

            this._eventSubscriptions[key] = { key: key, returnData: returnData, oneTimeOnly: oneTimeOnly };
        }

        getDataView()
        {
            return this._dataView;
        }

        onBuildChart()
        {
            this.onClientCmdCompleted();
        }

        onClientCmdStarted(cmd: string)
        {
            if (cmd !== "applyHover")
            {
                //vp.utils.debug("starting next cmd, cmd=" + cmd);
            }

            if (this._awaitingFirstCmd)
            {
                if (cmd !== "applyHover" && cmd !== "onLocalStorageChange" && cmd !== "getSystemViewData")
                {
                    this._cmdStartTime = vp.utils.now();
                    this._awaitingFirstCmd = false;

                }
            }
        }

        onClientCmdCompleted()
        {
            if (!this._awaitingFirstCmd)
            {
                this._cmdExecTime = vp.utils.now() - this._cmdStartTime;
                this._awaitingFirstCmd = true;
            }
        }

        hookEventsForHost()
        {
            var dataMgr = this._dataMgr;
            var subscriptions = this._eventSubscriptions;
            
            this._dataView.registerForChange("drawFrameCore", (e) =>
            {
                this.onClientCmdCompleted();
            });

            this._dataView.registerForChange("cycleEnded", (e) =>
            {
            });

            this._dataView.registerForChange("cycleEnded", (e) =>
            {
                //---- PLOT BOUNDS ----
                var key = "plotBounds";
                var options = subscriptions[key];

                if (options)
                {
                    var rcPlot = this._dataView.getPlotBoundsInPixels();
                    if (rcPlot)
                    {
                        var rcRotateRing = this._windowMgr.getRotationBounds();

                        this.postMessageToParent({ msg: key, rcPlot: rcPlot, rcRotateRing: rcRotateRing });
                    }
                }

                //---- FRAME STATS ----
                var key = "frameStats";
                var options = subscriptions[key];

                if (options)
                {
                    var cmdTime = this._cmdExecTime;
                    var lastCycleFrameRate = this._dataView.getLastCycleFrameRate();
                    var lastCycleFrameCount = this._dataView.getLastCycleFrameCount();

                    var buildChartElapsed = this._dataView.getBuildChartTime();
                    var cycleNum = this._dataView.getChart()._animCycleCount;
                    var isFirstFilterStage = this._dataView.getIsFirstFilteredStage();

                    this.postMessageToParent({
                        msg: key, cmdTime: cmdTime, buildChartElapsed: buildChartElapsed,
                        lastCycleFrameRate: lastCycleFrameRate, lastCycleFrameCount: lastCycleFrameCount, cycleNum: cycleNum,
                        isFirstFilterStage: isFirstFilterStage ,
                    });
                }

            });

            this._dataView.registerForChange("facetLayoutChanged", (e) =>
            {
                var key = "facetLayoutChanged";
                var options = subscriptions[key];

                if (options)
                {
                    var facetLayouts = this._dataView.getFacetLayouts();

                    this.postMessageToParent({ msg: key, facetLayouts: facetLayouts });
                }
            });

            dataMgr.registerForChange("dataFrame", (e) =>
            {
                var key = "dataFrameLoaded";
                var options = subscriptions[key];

                if (options)
                {
                    var fn = dataMgr.getFilename();
                    var recordCount = dataMgr.getDataFrame().getRecordCount();
                    var colInfos = (options.returnData) ? dataMgr.getColInfos(true) : null;
                    var origColInfos = (options.returnData) ? dataMgr.getOrigColInfos() : null;
                    var preload = (options.returnData) ? dataMgr.getPreload() : null;

                    this.postMessageToParent({ msg: key, fn: fn, recordCount: recordCount, colInfos: colInfos, origColInfos: origColInfos, preload: preload } );
                }
            });

            this._dataView.registerForChange("buildStarted", (e) =>
            {
                var key = "buildStarted";
                var options = subscriptions[key];

                if (options)
                {
                    var isSelectionChangeOnly = this._dataView.getIsSelectionOnly();

                    this.postMessageToParent({ msg: key, isSelectionChangeOnly: isSelectionChangeOnly });
                }
            });

            dataMgr.registerForChange("selection", (e) =>
            {
                var key = "selectionChanged";
                var options = subscriptions[key];

                if (options)
                {
                    //---- return the "filtered selection" (only selected records that are in the FILTERED-IN records) ----
                    var selectedCount = dataMgr.getSelectedCount(true);
                    var recordCount = dataMgr.getDataFrame().getRecordCount();
                    var selectedRecords = null;

                    if (options.returnData)
                    {
                        selectedRecords = dataMgr.getSelectedRecords(true);
                    }

                    this.postMessageToParent({ msg: key, selectedCount: selectedCount, recordCount: recordCount, selectedRecords: selectedRecords });
                }
            });

            dataMgr.registerForChange("filtered", (e) =>
            {
                var key = "filteredChanged";
                var options = subscriptions[key];

                if (options)
                {
                    var selectedCount = dataMgr.getSelectedCount(true);
                    var filteredInCount = dataMgr.getFilteredInCount();
                    var recordCount = dataMgr.getDataFrame().getRecordCount();

                    var filteredRecords = null;

                    var colInfos = dataMgr.getColInfos(true);

                    if (options.returnData)
                    {
                        filteredRecords = dataMgr.getSelectedRecords();
                    }

                    this.postMessageToParent({
                        msg: key, colInfos: colInfos, filteredInCount: filteredInCount, recordCount: recordCount, selectedCount: selectedCount,
                        filteredRecords: filteredRecords
                    });
                }
            });
        }

        onChartMouseDown(mousePosition, e)
        {
            var key = "mouseDown";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                var ri = this._dataView.hoverPrimaryKey();
                var pk = ri;            // todo: translate to PRIMARY KEY

                this.postMessageToParent({ msg: key, mousePosition: mousePosition, primaryKey: pk});
            }
        }

        onRectSelection(rcSelect)
        {
            var key = "onRectSelection";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                this.postMessageToParent({ msg: key, rcSelect: rcSelect });
            }
        }

        onClickSelection(buttonType: string, axisName: string, searchParams: bps.SearchParams)
        {
            var key = "onClickSelection";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                this.postMessageToParent({ msg: key, buttonType: buttonType, axisName: axisName, searchParams: searchParams });
            }
        }

        setMaxItemCount(maxItems: number)
        {
            if (maxItems !== this._maxItemCount)
            {
                this._maxItemCount = maxItems;

                var key = "maxItemCount";
                var options = this._eventSubscriptions[key];

                if (options)
                {
                    this.postMessageToParent({ msg: key, maxItemCount: maxItems });
                }
            }
        }

        onEscapeKey()
        {
            var key = "escapeKey";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                this.postMessageToParent({ msg: key });
            }
        }

        onContextMenu(isDragSelecting: boolean, mousePosition: any)
        {
            var key = "contextMenu";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                this.postMessageToParent({ msg: key, isDragSelecting: isDragSelecting, mousePosition: mousePosition });
            }
        }

        onMouseHover(primaryKey: string)
        {
            var key = "mouseHover";
            var options = this._eventSubscriptions[key];

            if (options)
            {
                this.postMessageToParent({ msg: key, primaryKey: primaryKey });
            }
        }

        sendDataChangedToHost(name: string, param?:any, param2?:any, param3?:any, param4?: any)
        {
            this.postMessageToParent({ msg: "dataChanged", name: name, param: param, param2: param2, param3: param3, param4: param4 });
        }

        getDataMgr()
        {
            return this._dataMgr;
        }

        getCanvas3dElem()
        {
            return this._canvas3dElem;
        }

        getCanvas2dElem()
        {
            return this._canvas2dElem;
        }

        processCmdLineParams(strParams: string)
        {
            //(<any>window).boo.bar = 3;

            if (strParams) 
            {
                var cmdParams = vp.utils.getCmdParams(strParams);
            }
            else
            {
                //cmdParams = <string> vp.utils.getUrlParams();
                cmdParams = {vaas: "true", visid: "myChart", appstarttime: "1450353920560", hostdomain: "localhost"};
            }
            
            if (cmdParams)
            {
                var keys = vp.utils.keys(cmdParams);
                for (var k = 0; k < keys.length; k++)
                {
                    var key = keys[k];
                    var value = cmdParams[key];

                    if (key === "reset" && value === "true")
                    {
                        //---- delete localStorage for our settings ----
                        // if (localStorage)
                        // {
                        //     localStorage["appSettings"] = "";
                        //     localStorage["controls"] = "";
                        // }
                    }
                    else if (key === "vaas" && value === "true")
                    {
                        this._isVaas = true;
                    }
                    else if (key === "edition")
                    {
                        this._edition = value;
                    }
                    else if (key === "visid")
                    {
                        this._visId = value;
                        vp.utils.setDebugId(value);
                    }
                    else if (key === "hostdomain")
                    {
                        this._hostDomain = value;
                    }
                    else if (key === "bpdir")
                    {
                        this._beachPartyDir = value;
                        vp.utils.debug("this._beachPartyDir set to: " + this._beachPartyDir);
                    }
                    else if (key === "appstarttime")
                    {
                        vp.utils.appStartTime = +value;
                        //vp.utils.debug("HEY, just set appStartTime=" + value);
                    }
                    else  
                    { 
                        //---- convert key/value pair to a set command ----
                        var cmd = "set" + key;
                        var viewId = "0";     // for now, only "0" is supported (single view per VAAS chart 

                        var msgBlock = { cmd: cmd, param: value, viewId: viewId};
                        this._cmdMgr.addToPendingCmd(msgBlock);
                    }
                }
            }

        }

        postMessageToParent(msgObj)
        {
            //---- identify which VAAS inst this msgs is coming from ----
            msgObj.visId = this._visId;
            msgObj.cmdId = this._cmdMgr._clientCmdId;

            TraceMgrClass.instance.addTrace("msgToClient", msgObj.msg, TraceEventType.point);

            var msgStr = JSON.stringify(msgObj);

            //vp.utils.debug("-> postMessageToParent: domain=" + domain + ", msg=" + msgObj.msg);

            //(<any>window).boo.bar = 3;

            if (this._isHostedDirect)
            {
                //---- simulate async of iframe communication ----
                // setTimeout((e) =>
                // {
                //     var anyWin = <any>window;
                //     anyWin.sendToDirectHostHelper(msgStr);
                // }, 1);
            }
            else// if (window.parent && window !== window.parent.window)
            {
                sandDance.hostBus.postMessage(msgStr);
                //window.postMessage(msgStr, domain);
            }
        }

        getViewByIndex(viewId: string)
        {
            var viewX: DataViewClass = null;

            for (var v = 0; v < this._views.length; v++)
            {
                var view = this._views[v];
                if (view.viewId().toString() === viewId.toString())
                {
                    viewX = view;
                    break;
                }
            }

            return viewX;
        }

        applyAppSettings()
        {
            var settings = this._appSettings;

            this._windowMgr.showDebugStats(settings.showDebugStats);
            this._windowMgr.showFileInfo(settings.showFileInfo);
        }

        public layoutWindow(width?: number, height?: number)
        {
            //(<any>window).foo.bar = 3;

            //vp.utils.debug("appMgr.layoutWindow called");
// 
//             if (this._isHostedDirect)
//             {
//                 var divW = vp.select("#" + this._visId);
// 
//                 var width = <number>divW.width();
//                 var height = <number>divW.height();
//             }
//             else
//             {
//                 var width = window.innerWidth - 2;
//                 var height = window.innerHeight - 2;
//             }

            if (!width && !height) {
                let chartBounds = vp.select("#myChart").getBounds(true);

                width = chartBounds.width;
                height = chartBounds.height;
            }

            // width -= 75;//TODO: remove
            // height -= 125;//TODO: remove

            //---- the SVG DOC ----
            vp.select(this._svgDoc)
                .css("width", width + "px")
                .css("height", height + "px");
                //.css("border", "1px solid red")

            var ww = width + 10;   
            var hh = height - 22;

            this._windowMgr.setBounds(0, 0, ww, hh);
            this._dataView.setBounds(0, 0, ww, hh); 
        }

        //buildGettersAndSetters()
        //{
        //    this._getterSetters["persistSession"] = (value) => this.persistSession(value);
        //    this._getterSetters["persistControls"] = (value) => this.persistControls(value);
        //}

        loadSettings()
        {
            console.error("loadSettings");
            
            // if (localStorage)
            // {
            //     var str = localStorage["appSettings"];
            //     if (str && str !== "")
            //     {
            //         this._appSettings = JSON.parse(str);
            //     }
            // }
        }

        saveSettings()
        {
            console.error("saveSettings");
            
            //if (localStorage)
            //{
            //    var str = JSON.stringify(this._appSettings);
            //    localStorage["appSettings"] = str;
            //}
        }

        updateAndSaveAppSettings()
        {
            var settings = this._appSettings;

            settings.showDebugStats = this._windowMgr.showDebugStats();
            settings.showFileInfo = this._windowMgr.showFileInfo();

            this.saveSettings();
        }

        onDataChanged(name: string)
        {
            super.onDataChanged(name);

            this.updateAndSaveAppSettings();
        }

        persistSession(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._appSettings.persistSession;
            }

            this._appSettings.persistSession = value;
            this.onDataChanged("persistSession");
        }

        persistControls(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._appSettings.persistControls;
            }

            this._appSettings.persistControls = value;
            this.onDataChanged("persistControls");
        }
    }

    export class AppSettingsClass
    {
        persistSession = false;
        persistControls = true;
        showDebugStats = true;
        showFileInfo = true;

        constructor()
        {
        }
    }

    export class ControlInfoClass
    {
        controlType: string;
        menuId: string;
        isOpen: boolean;
        x: number;
        y: number;

        constructor(controlType: string, menu: MenuInfoClass, x: number, y: number)
        {
            this.controlType = controlType;
            this.menuId = menu.menuId;
            this.x = x;
            this.y = y;
            this.isOpen = (menu.actionType === ActionType.openSubMenu && (<any>menu)._isOpen);
        }
    }
}