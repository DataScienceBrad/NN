//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    app.ts - defines app class (that builds and controls BeachParty App UI)
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export var settings: AppSettingsMgr;

    export class AppClass extends beachParty.dataChangerClass
    {
        static buildId = "45";           // increment this at last moment before running "vibe10.bat"
        static instance: AppClass;
        static defaultOpacity = .8;
        static maxCategoryBins = 50;
        static defaultNumericBins = 9;
        static maxPanelHeight = .65 * window.innerHeight;
        static maxPanelWidth = .75 * window.innerWidth;
        static nextSnapShotNum = 1;

        public width: number;
        public height: number;

        private coreApplicationInstance: beachParty.AppMgrClass;

        private saveSettingsHandler: (settings: any, type: sandDance.SettingsType)  => void;
        private loadSettingsHandler: (type: sandDance.SettingsType) => any;

        _chartIsLoaded = false;
        _isOrthoCamera = false;
        _useFacets = false;
        _chartName = "Flat";
        _layoutName = "Random";
        _bpsHelper: bps.chartHostHelperClass;
        _sizeFactor = 1;
        _separationFactor = 1;
        _textOpacity = .5;
        _showColorLegend = true;
        _preloads: bps.Preload[];
        _toPercentOverride = 0;
        _isAnimOverride = false;
        _activeContextMenu: PopupMenuClass;
        _isTransformMode = false;
        _wheelDownTime = 0;
        _searchCol = "";
        _searchValue = "";
        _selectedRecords: any[] = [];
        _insightMgr: InsightMgrClass;
        _dataTipMgr: DataTipMgrClass;
        _initSessionId: string;
        _edition = "client";
        //_currentErrorMsg = null;
        _viewSettings = {};
        _vsCurrent: ViewSettings;
        _machineId: string;
        _sessionId: string;
        _undoMgr: UndoMgrClass;
        _isFirstDataFrameLoad = true;
        _isLoggingEnabled = false;
        _binCountForColumn = {};
        _sumByColumn = "";
        _rotateRing: RotateRingClass;
        _notesPanel: NotesPanelClass;
        _showInsightPanelOnStop = false;
        //_popupClosedTime = {};
        _testMgr: TestMgrClass;
        _chartCycleNum = 0;
        _infoMsgTimer = null;
        _chartUx: ChartUxClass;
        _maxToolTipColumns = 15;                // at 20, we seem to run into a browser limit on total tooltip size
        _facetMgr: FacetMgrClass;
        _selectionMode: bps.SelectMode;
        _rcPlot: ClientRect;
        _rcRotateRing: ClientRect;
        _isEngineDrawing = false;
        _animateDisabledFromUrlParams = false;
        _blankValueStr = "<blank>";
        _fileOpenMgr: FileOpenMgr;
        _autoRebuild = true;
        _actualDrawingPrimitive: bps.DrawPrimitive;
        _prevChartName = null;

        //---- insights ----
        _isInsightLoading = false;
        _insightWaitingForFilterChanged = false;
        //_insightCompletePending = false;

        //---- feedback panel support ----
        _feedbackType: string;
        _feedbackText: string;

        //---- panel management ----
        _detailsPanel = <JsonPanelClass>null;
        _sortPanel = <JsonPanelClass>null;
        _appPanel = <JsonPanelClass>null;
        _colorPanel = <JsonPanelClass>null;
        _facetPanel = <JsonPanelClass>null;
        _chartPanel = <JsonPanelClass>null;
        _slicerPanel = <JsonPanelClass>null;
        _scrubberDialog = <ScrubberDialogClass>null;

        //---- support our APP being hosted in an iframe ----
        _clientAppId = null;
        _hostDomain = null;

        _slicerColName: string;
        _slicerData: beachParty.BinResult;
        _slicerInitialValue = null;
        _slicerControl = <SlicerControlClass>null;

        //---- color mappings (each data type has its own mapping) ----
        _currentColorMapping: bps.ColorMappingData;
        _catColorMapping: bps.ColorMappingData;
        _numColorMapping: bps.ColorMappingData;
        _dateColorMapping: bps.ColorMappingData;
        _colorDataType: string;
        _colorPaletteType = "sequential";

        //---- sorting ----
        _lastScatterXCol = null;
        _lastScatterYCol = null;
        _sortItemCol = null;
        _isItemSortAscending = true;

        _sizeMapping: bps.SizeMappingData;
        _textMapping: bps.TextMappingData;
        _lineMapping: bps.LineMappingData;
        _imageMapping: bps.ImageMappingData;
        _facetMapping: bps.FacetMappingData;

        _xMapping: bps.MappingData;
        _yMapping: bps.MappingData;
        _zMapping: bps.MappingData;

        _colorLegend: ColorLegendClass;
        _sizeLegend: SizeLegendClass;
        _imageLegend: ImageLegendClass;
        _textLegend: TextLegendClass;
        _facetLegend: FacetLegendClass;

        _generalPicker: PopupMenuClass;
        _layoutsByChart: any = {};

        _origColInfos: bps.ColInfo[] = [];              // full set of original columns from table
        _colInfos: bps.ColInfo[] = [];                  // set of SCRUBBED columns (as per preLoad)

        _facetBinAdjuster: NumAdjusterClass;
        _xBinAdjuster: NumAdjusterClass;
        _yBinAdjuster: NumAdjusterClass;
        _zBinAdjuster: NumAdjusterClass;
        //_sizeFactorAdjuster: numAdjusterClass;
        _opacityAdjuster: NumAdjusterClass;
        //_textOpacityAdjuster: numAdjusterClass;

        _filterDesc: SelectionDesc;
        _selectionDesc: SelectionDesc;

        //---- DATA properties ----
        _recordCount = 0;
        _filename = "";
        _selectedCount = 0;
        _filteredInCount = 0;
        _selection = [];

        //_chartMenuItems: any[] = null;

        constructor(saveSettingsHandler: (settings: any, type: sandDance.SettingsType) => void, loadSettingsHandler: (type: sandDance.SettingsType) => any)
        {
            super();

            this.saveSettingsHandler = saveSettingsHandler;
            this.loadSettingsHandler = loadSettingsHandler;

            AppClass.instance = this;

            if (!this.isBrowserModern())
            {
                //---- show old browser message ----
                vp.select("#oldBrowserMsg").css("display", "");

                throw "error - browser now supported";
            }
        }

        public set coreApplication(app: beachParty.AppMgrClass) {
            this.coreApplicationInstance = app;
        }

        run()
        {
            this.appInit();

            this.buildIconBar();

            this.buildBinAdjusters();

            this.buildLegends();

            settings._isSavingSettingsDisabled = true;

            try
            {
                settings.resetAppSettings();

                this.processUrlParams();

                this.buildBigBar();

                settings.loadAppSettings();
            }
            finally
            {
                settings._isSavingSettingsDisabled = false;

                if (this._animateDisabledFromUrlParams)
                {
                    settings.isAnimationEnabled(false);
                }
            }

            // Prevent images from being draggable on Firefox [the "draggable" element attribute stops functioning on Firefox if "-moz-user-select: none" is also set]
            // [see http://stackoverflow.com/questions/12906789/preventing-an-image-from-being-draggable-or-selectable-without-using-js]
            if (vp.utils.isFireFox)
            {
                vp.select("img").attach('dragstart', function (e) { e.preventDefault(); });
            }

            this.preventHtmlSelection();

            //---- prevent overall context menu ----
            document.oncontextmenu = function ()
            {
                return false;
            };

            //document.body.addEventListener("MSHoldVisual", function (e) { e.preventDefault(); }, false);

            this._bpsHelper.subscribe("engineError", true, (msgBlock) =>
            {
                this.showError(msgBlock);
            });

            this._bpsHelper.subscribe("plotBounds", true, (msgBlock) =>
            {
                this.onPlotMoved(msgBlock.rcPlot, msgBlock.rcRotateRing);
            });

            this._bpsHelper.subscribe("buildStarted", true, (msgBlock) =>
            {
                if (!msgBlock.isSelectionChangeOnly)
                {
                    this._dataTipMgr.hideDataTipsBeforeLayout();
                    this._isEngineDrawing = true;
                }
            });

            this._bpsHelper.subscribe(bps.ChartEvent.frameStats, true, (msgBlock) =>
            {
                this._isEngineDrawing = false;

                this._chartCycleNum = msgBlock.cycleNum;

                var memObj = (<any>window.performance).memory;

                var msg = msgBlock.cycleNum + ": " + msgBlock.cmdTime + "." + Math.round(msgBlock.buildChartElapsed)
                    + "." + msgBlock.lastCycleFrameRate;

                if (memObj)
                {
                    msg += "." + vp.formatters.comma(memObj.usedJSHeapSize);
                }

                this.quickStats(msg);

                if (this._testMgr)
                {
                    this._testMgr.reportFrameStats(msgBlock.cmdTime, msgBlock.buildChartElapsed, msgBlock.lastCycleFrameRate,
                        msgBlock.lastCycleFrameCount, msgBlock.cycleNum, msgBlock.cmdId);
                }

                if (!msgBlock.isFirstFilterStage)
                {
                    this._dataTipMgr.updateDataTipsAfterLayout();
                }

                //---- if hosted in browser, trigger client's "onPageLoaded" event ----
                if (window.external)
                {
                    var anyExternal = <any>window.external;
                    if (anyExternal.OnPageLoaded)
                    {
                        anyExternal.OnPageLoaded();
                    }
                }

                if (settings._rememberLastSession)
                {
                    //---- write sessions state (as insight/preload) to localstorage ----
                    settings.saveSessionToLocalStorage();
                }

                //---- switch to lower cost drawPrimitive, if possible ----
                //if (this._drawingPrimitive == bps.DrawPrimitive.cube && ! this.is3DChart(this._chartName))
                //{
                //    setTimeout((e) =>
                //    {
                //        this._bpsHelper.setAutoRebuild(false, false);
                //        this.drawingPrimitive("quad");
                //        this._bpsHelper.setAutoRebuild(true, false);
                //    }, 100);
                //}
            });

            //---- bind data to chart, once engine has been loaded ----
            this._bpsHelper.subscribe("engineLoaded", true, (msgBlock) =>
            {
                this.onEngineLoaded(msgBlock);
            });

            this._bpsHelper.subscribe(bps.ChartEvent.onRectSelection, true, (msgBlock) =>
            {
                var rc = msgBlock.rcSelect;

                this.logAction(Gesture.drag, "canvas", ElementType.canvas, Action.adjust, Target.selection, true,
                    "left", rc.left, "top", rc.top, "width", rc.width, "height", rc.height);
            });

            this._bpsHelper.subscribe(bps.ChartEvent.onClickSelection, true, (msgBlock) =>
            {
                var buttonType = msgBlock.buttonType;
                var searchParams = msgBlock.searchParams;

                this.logAction(Gesture.click, buttonType, ElementType.button, Action.adjust, Target.selection, true,
                    "colName", searchParams.colName, "minValue", searchParams.minValue, "maxValue",
                    searchParams.maxValue, "searchType", searchParams.searchType);

                //---- axis box or label was clicked to select; reflect in selection button ----
                var sd = new SelectionDesc();
                sd.legendSource = msgBlock.axisName;
                sd.selectMode = this._selectionMode;
                sd.searchParams = searchParams;

                this._selectionDesc = sd;
                this.updateSelectionButton("Select", sd);
            });

            this._bpsHelper.subscribe("contextMenu", true, (msgBlock) =>
            {
                //---- for now, we don't need this (using wheel button instead on menu item) ----
                //this.showChartContextMenu(msgBlock.isDragSelecting, msgBlock.mousePosition);

                //alert("got context menu event");
            });

            this._bpsHelper.subscribe("escapeKey", true, (msgBlock) =>
            {
                this.closeAllPopups();

                this.onWindowKeyDown();
            });

            this._bpsHelper.subscribe("mouseDown", true, (msgBlock) =>
            {
                this.closeAllPopups();

                var primaryKey = msgBlock.primaryKey;

                this.pulse3DCircleIfAppropriate();

                //---- create a fake "event" object ----
                // var rc = vp.select("#myChart").getBounds(true);

                //var evt = { which: 1, pageX: rc.left + mousePos.x, pageY: rc.top + mousePos.y, type: "mouse"};

                this.onWindowMouseDown(null);

                vp.utils.debug("client detected chart mouseDown: primaryKey=" + primaryKey);
            });

            this._bpsHelper.subscribe("textDropped", true, (msgBlock) =>
            {
                this._insightMgr.processDroppedText(msgBlock.text);
            });

            this._bpsHelper.subscribe("facetLayoutChanged", true, (msgBlock) =>
            {
                var facetLayouts = <bps.FacetLayoutInfo[]>msgBlock.facetLayouts;

                this._facetMgr.buildLabels(facetLayouts);
            });

            this._dataTipMgr = new DataTipMgrClass();

            this._bpsHelper.subscribe("dataFrameLoaded", true, (msgBlock) =>
            {
                this._filename = msgBlock.fn;
                this._recordCount = msgBlock.recordCount;
                this._colInfos = msgBlock.colInfos;
                this._origColInfos = msgBlock.origColInfos;
                this._fileOpenMgr.preload(msgBlock.preload);

                this.closeScrubberDialog();

                //var pi = this.getPreload(msgBlock.preload);
                //this._selectedSampleName = (pi) ? this._preload.name : "";

                //vp.utils.debug("DATAFRAME msg received: recordCount=" + this._recordCount + ", filename=" + this._filename);

                this._selectedCount = 0;
                this._filteredInCount = this._recordCount;

                settings.saveAppSettings();

                // this.resetMappingsForNewFile(); //TODO: remove ?

                this.onDataChanged("dataFrame");

                if (this._isFirstDataFrameLoad)
                {
                    this._isFirstDataFrameLoad = false;
                    this._isLoggingEnabled = true;

                    //---- we set undo=true in this call to make the current app state the base/home state of undoMgr ----
                    this.logAction(Gesture.none, null, ElementType.none, Action.start, Target.app, true, "machineId", this._machineId, "buildNum", AppClass.buildId);

                    ////---- mark the completion of app init and save the app state as the undo base entry ----
                    //this.createInsight(true, true, (insight) =>
                    //{
                    //    this._undoMgr.push(insight, "inital app state");
                    //});

                    this.makeUIVisible();
                    this.hookLocalStorageChanges();
                }

                //---- EVENT STATS ----
                setInterval((e) =>
                {
                    var msg = "Register=" + beachParty.dcRegisterCount + ", Attach=" + vp.events.eventAttachCount;

                    vp.select("#eventStats")
                        .text(msg);
                }, 1000);
            });

            this._bpsHelper.subscribe("selectionChanged", true, (msgBlock) =>
            {
                this._selectedCount = msgBlock.selectedCount;
                this.onSelectedCountChanged();

                this.selectedRecords(msgBlock.selectedRecords);

                if (vp.utils.isIE)
                {
                    //---- bug workaround - force storage event trigger for IE from OUTER HTML (not IFRAME) ----
                    localStorage["dummy"] = this._sessionId;
                }

                if (this._selectedCount === 0)
                {
                    this._selectionDesc = null;
                }

                this.updateSelectionButton("Select", this._selectionDesc);
            });

            this._bpsHelper.subscribe("filteredChanged", true, (msgBlock) =>
            {
                vp.utils.debug("filteredChanged received from engine");

                this._selectedCount = msgBlock.selectedCount;
                this.onSelectedCountChanged();

                this._filteredInCount = msgBlock.filteredInCount;
                this._colInfos = msgBlock.colInfos;

                //---- alert everyone that should know ----
                this.onFilteredInCountChanged();

                this.updateSelectionButton("Filter", this._filterDesc);

                this.onFilterChangedFromEngine();
            });

            var searchTextElem = <HTMLInputElement>document.getElementById("searchText");
            searchTextElem.onkeyup = (e) =>
            {
                if (e.keyCode === vp.events.keyCodes.enter)
                {
                    //---- select all text on ENTER ----
                    searchTextElem.select();

                    //---- move focus off of text control ----

                    //document.body.focus();
                }

                this.onSearchClick(e);
            };

            searchTextElem.onfocus = (e) =>
            {
                searchTextElem.select();
            };

            this.registerForChange("searchValue", (e) =>
            {
                //vp.utils.debug("got searchValue event change=" + this._searchValue);

                //---- don't set unless it has actually changes (preserve selection in textbox when possible) ----
                if (this._searchValue !== searchTextElem.value)
                {
                    searchTextElem.value = this._searchValue;
                }
            });

            vp.select(window).attach("resize", (e) => //TODO: remove dependency by window!
            {
                this.layoutScreen();

                this.requestFullChartBuild();
            });

            this.layoutScreen();

            if (this._clientAppId)
            {
                this.postMessageToHost({ msg: "clientAppLoaded" });
            }
        }

        public updateDataView(data: any) {
            this._bpsHelper.updateDataView(data, null, () => {
                console.log("updateDataView: " + new Date());
            });
        }

        public update(width: number, height: number): void {
            this.setViewport(width, height);

            this.layoutScreen(width, height);
            this.requestFullChartBuild();
        }

        public setViewport(width: number, height: number): void {
            this.width = width;
            this.height = height;
        }

        pulse3DCircleIfAppropriate()
        {
            //---- if in transform mode, but not showing wheel, pulse the ring to remind user where it is ----
            if (this._isTransformMode && !settings._showWheelDuringTransformMode)
            {
                this._rotateRing.pulse();
            }
        }

        updateSelectionButton(buttonBaseName: string, selectDesc: SelectionDesc)
        {
            var reason = null;
            var toolTip = null;

            var sd = this._selectionDesc;
            if (sd)
            {
                if (sd.rectSelect)
                {
                    reason = "rect select";
                    toolTip = "rect select";
                }
                else
                {
                    var sp = sd.searchParams;
                    var st = sp.searchType;

                    if (vp.utils.isString(st))
                    {
                        st = <bps.TextSearchType><any>bps.TextSearchType[st];
                    }

                    reason = sp.colName;
                    toolTip = "[from " + sd.legendSource + "]:\r\n"
                    + "    ";

                    var minValue = vp.formatters.format(sp.minValue);
                    var maxValue = vp.formatters.format(sp.maxValue);

                    //---- add operator, value, value ----
                    if (st === bps.TextSearchType.betweenInclusive)
                    {
                        toolTip += minValue + " <= " + sp.colName + " <= " + maxValue;
                    }
                    else if (st === bps.TextSearchType.contains)
                    {
                        toolTip += sp.colName + " contains '" + minValue + "'";
                    }
                    else if (st === bps.TextSearchType.exactMatch)
                    {
                        toolTip += sp.colName + " = " + minValue;
                    }
                    else if (st === bps.TextSearchType.greaterThan)
                    {
                        toolTip += sp.colName + " > " + minValue;
                    }
                    else if (st === bps.TextSearchType.greaterThan)
                    {
                        toolTip += sp.colName + " > " + minValue;
                    }
                    else if (st === bps.TextSearchType.gtrValueAndLeqValue2)
                    {
                        toolTip += minValue + " < " + sp.colName + " <= " + maxValue;
                    }
                    else if (st === bps.TextSearchType.lessThan)
                    {
                        toolTip += sp.colName + " < " + minValue;
                    }
                    else if (st === bps.TextSearchType.lessThanEqual)
                    {
                        toolTip += sp.colName + " <= " + minValue;
                    }
                    else if (st === bps.TextSearchType.notEqual)
                    {
                        toolTip += sp.colName + " != " + minValue;
                    }
                    else if (st === bps.TextSearchType.startsWith)
                    {
                        toolTip += sp.colName + " startsWith '" + minValue + "'";
                    }
                }
            }

            this.setBigValue(buttonBaseName, reason, toolTip);
        }

        appInit()
        {
            this._vsCurrent = new ViewSettings();

            if (window.location.hostname === "localhost")
            {
                //---- assume it's a developer machine ----
                AppClass.buildId = "pre" + (1 + (+AppClass.buildId));
            }

            //---- this assumes that our app & BeachParty engine share the same server ----
            this._bpsHelper = bps.createBpsHelper("myChart");

            settings = new AppSettingsMgr(this._bpsHelper, this.saveSettingsHandler, this.loadSettingsHandler);

            this._fileOpenMgr = new FileOpenMgr(this._bpsHelper);

            this._undoMgr = new UndoMgrClass();
            this._undoMgr.registerForChange("undoStack", (e) => this.onUndoStackChange());

            this.onUndoStackChange();

            //---- init logging variables ----
            var sessionId = 0;
            var machineId = 0;

            if (window.localStorage)
            {
                machineId = window.localStorage["machineId"];
                sessionId = +window.localStorage["sessionId"];

                if (machineId === undefined)
                {
                    //----- get it a pseudo GUID ----
                    machineId = +Date.now() + vp.utils.now() + Math.random();
                    window.localStorage["machineId"] = machineId;
                    sessionId = 0;
                }

                sessionId = sessionId + 1;
                window.localStorage["sessionId"] = sessionId;
            }
            else
            {
                sessionId = vp.utils.now();
            }

            this._machineId = machineId + "";
            this._sessionId = sessionId + "";

            //var myChart = document.getElementById("myChart");
            this._rotateRing = new RotateRingClass();

            //----- regenerate sessionId/machineId ----
            //delete localStorage["machineId"];       // = undefined;
            //delete localStorage["sessionId"];

            //---- turn this on for normal use, but OFF FOR DEBUGGING ----
            window.onerror = (errorMsg, errorUrl, errorLineNum) =>
            {
                var msg = "Error: \r\n" + errorMsg;

                if (settings._isErrorReportingDisabled)
                {
                    vp.utils.debug(msg);
                }
                else
                {
                    this.showError(msg);
                }
            };

            vp.utils.setDebugId("client");

            var defaultBinCount = settings.defaultBins();

            this._sizeMapping = new bps.SizeMappingData(defaultBinCount);
            this._textMapping = new bps.TextMappingData(defaultBinCount);
            this._lineMapping = new bps.LineMappingData(defaultBinCount);
            this._imageMapping = new bps.ImageMappingData(defaultBinCount);
            this._facetMapping = new bps.FacetMappingData(defaultBinCount);

            this._xMapping = new bps.MappingData("", defaultBinCount);
            this._yMapping = new bps.MappingData("", defaultBinCount);
            this._zMapping = new bps.MappingData("", 3);            // this._defaultBins);

            this._insightMgr = new InsightMgrClass();
            this._insightMgr.registerForChange("layout", (e) => this.layoutScreen());
            this._insightMgr.registerForChange("insightLoaded", (e) => this.loadInsight());
            this._insightMgr.registerForChange("currentInsight", (e) => this.onCurrentInsightChanged());
            this._insightMgr.registerForChange("onAddInsightRequest", (name, changedBy, e) => this.addNewInsight(e));
            this._insightMgr.registerForChange("playing", (e) => this.onInsightPlayingChanged());
            this._insightMgr.registerForChange("showInsightBar", (e) => this.onShowInsightBarChanged());

            this._catColorMapping = new bps.ColorMappingData("Paired", false, defaultBinCount);
            this._numColorMapping = new bps.ColorMappingData("RdBu", false, defaultBinCount);
            this._dateColorMapping = new bps.ColorMappingData("Blues", false, defaultBinCount);
            this._currentColorMapping = this._numColorMapping;

            settings.resetAppSettings();

            settings.shapeOpacity(AppClass.defaultOpacity);;

            //---- enable DRAG and DROP on whole client document ---
            setTimeout((e) =>
            {
                vp.select(".sandDance")
                    .attach("dragover", (e) => e.preventDefault())
                    .attach("drop", (e) => this._fileOpenMgr.processDroppedTextOrFile(e));
            }, 1);

            //---- set image sources ----
            vp.select("#imgCreateInsight").addClass("fnInsightCreate");
            vp.select("#insightMenuButton").addClass("fnInsightMenu");
            vp.select("#insightCloseButton").addClass("fnClose");
            vp.select("#dataTipIcon").addClass("fnIconBarDataTip");
            vp.select("#imgDataSlicer").addClass("fnIconBarSlicer");

            this._chartUx = new ChartUxClass(this._bpsHelper, this._maxToolTipColumns);

            this._facetMgr = new FacetMgrClass();

            //---- hook WINDOW keyboard/mouse down ----
            var windowW = vp.select(".sandDance");

            //---- do these AFTER creating chartUx/rubberBand ----
            windowW.attach("mousedown", (e) => this.onWindowMouseDown(e));
            windowW.attach("keydown", (e) => this.onWindowKeyDown(e));
        }

        setSelectionDesc(selectDesc: SelectionDesc)
        {
            selectDesc.selectMode = this._selectionMode;

            this._selectionDesc = selectDesc;
        }

        isBrowserModern()
        {
            var isModern = true;

            //---- for now, just test for WebGL support ----
            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("webgl");
            if (!gl)
            {
                gl = canvas.getContext("experimental-webgl");
            }

            isModern = (!!gl);
            return isModern;
        }

        setHelperCmdId(value: string)
        {
            this._bpsHelper.setCmdId(value);
        }

        hookLocalStorageChanges()
        {
            //---- IE bug workaround - listen for storage events from OUTER HTML (not IFRAME) ----
            if (vp.utils.isIE)
            {
                vp.utils.debug("hookLocalStorageChanges");

                vp.events.attach(window, "storage", (e) =>
                {
                    if (e.key !== "appSettings")
                    {
                        var process = true;
                        if (e.key === "dummy")
                        {
                            var value = localStorage[e.key];
                            if (value === this._sessionId)
                            {
                                process = false;
                            }
                        }

                        if (process)
                        {
                            //vp.utils.debug("******* shareMgr.changeFunc: e.key=" + e.key);
                            //alert("storage event");

                            this._bpsHelper.onLocalStorageChange();
                        }
                    }
                });
            }
        }

        onShowInsightBarChanged()
        {
        }

        onFilenameChanged()
        {
            vp.select("#filenameText")
                .text(this._filename);

            this.setBigValue("Data", this._filename);
        }

        onAppFileLoaded()
        {
            this.onFilenameChanged();

            this.onRecordCountChanged();

            this.onChartOrLayoutChanged();
        }

        setAutualDrawingPrimitive()
        {
            if (settings._drawingPrimitive === bps.DrawPrimitive.auto)
            {
                //---- for now, ignore user-specified drawPrimitive ----
                if (this.is3DChart(this._prevChartName) || this.is3DChart(this._chartName))
                {
                    var value = bps.DrawPrimitive.cube;
                }
                else
                {
                    var value = bps.DrawPrimitive.quad;
                }
            }
            else
            {
                var value = settings._drawingPrimitive;
            }

            if (value !== this._actualDrawingPrimitive)
            {
                this._actualDrawingPrimitive = value;

                this._bpsHelper.setDrawingPrimitive(value);
            }
        }

        buildIconBar()
        {
            /// Note: it is much easier to get consistent, predictable results by building this toolbar in code, rather than HTML. 
            var tpW = vp.select("#iconBar")
                .clear()
                .css("min-height", "16px");

            var tableW = tpW.append("table")
            //.addClass("noSpaceTable")
                .css("width", "100%");

            var rowW = tableW.append("tr")
                .css("white-space", "nowrap")
                .id("iconBarRow");

            var leftW = rowW.append("td")
                .css("width", "100px");

            //var centerW = rowW.append("td")
            //    .css("width", "100px")
            //    .attr("text-align", "center")

            //var rightW = rowW.append("td")
            //    .css("width", "100px")
            //    .attr("text-align", "right")

            //---- create a table/TR for the LEFT group ----
            var tableW = leftW.append("table")
                .addClass("noSpaceTable");

            var trW = tableW.append("tr");

            this.createIconTextPair(trW, "onUndoClick", "undo", "Undo the last action", "fnIconBarUndo", "Undo", false);
            this.createIconTextPair(trW, "onRedoClick", "redo", "Redo the last undone action", "fnIconBarRedo", "Redo", false);
            this.createSpacer(trW);

            this.createIconTextPair(trW, "toggleInsightPanel", "insight", "Toggle the insight panel open/closed", "fnIconBarToggleInsightNorm", "Insight", true);
            this.createIconTextPair(trW, "startPlayback", "playIcon", "Playback the current insights", "fnIconBarPlay", "Play", true);
            this.createSpacer(trW);

            this.createIconTextPair(trW, "toggleTransformMode", "wheel", "Toggle the 3D tranform mode on/off", "fnIconBarToggle3dNorm", "Transform");
            this.createIconTextPair(trW, "onSelectClick", "select", "Change the selection mode", "fnSelectionNormal", "Selection");
            // this.createSpacer(trW);

            // this.createIconTextPair(trW, "onAddView", "addView", "Open a new SandDance browser tab/window", "fnIconBarNewView", "View", false);

            this.createIconTextPair(trW, "onOpenScrubber", "scrub", "Open the data scrubber dialog", "fnIconBarScrubber", "Scrub", false);
            this.createSpacer(trW);

            this.createIconTextPair(trW, "onIsolateClick", "isolate", "Isolate the selected items", "fnIconBarIsolate", "Isolate");
            this.createIconTextPair(trW, "onExcludeClick", "exclude", "Exclude the selected items", "fnIconBarExclude", "Exclude");
            this.createIconTextPair(trW, "onResetClick", "reset", "Reset the filter and selection", "fnIconBarReset", "Reset");
            this.createSpacer(trW);

            this.createIconTextPair(trW, "onDetailsClick", "details", "Show details of the selected items", "fnIconBarDetails", "Details", false, true);

            // Snapshot doesn't work because we don't have support in current browsers. It supports only IE.
            // this.createIconTextPair(trW, "onSnapshotClick", "snapshot", "Download snapshot of page", "fnIconBarSnapshot", "Snapshot");

            // this.createSpacer(trW);

            if (false)
            {
                //---- stacked on top of each other ----
                var tdTextW = trW.append("td");

                this.addToolText(tdTextW, "onFilteredInCountClick", "filteredInCountText", "Reset the filter", 15, -5, 120);
                this.addToolText(tdTextW, "onSelectedCountClick", "selectedCountText", "Reset the selection", 0, -5, 120);
            }
            else
            {
                //---- side-by-side ----
                this.addToolText(trW, "onFilteredInCountClick", "filteredInCountText", "Reset the filter", 15, 7, 120);
                this.addToolText(trW, "onSelectedCountClick", "selectedCountText", "Reset the selection", 0, 7, 120);
            }

            //----- convert X, Y, Z placeholders to ICON TEXT PAIR ----
            this.addIconTextPair("x", "Select a column for X-axis mapping or grouping", null, "X", true);
            this.addIconTextPair("y", "Select a column for Y-axis mapping or grouping", null, "Y", true, undefined, undefined, true);
            this.addIconTextPair("z", "Select a column for Z-axis mapping or grouping", null, "Z", true);

            //---- initially hide X, Y, and Z buttons ----
            vp.select("#xButton").css("display", "none");
            vp.select("#yButton").css("display", "none");
            vp.select("#zButton").css("display", "none");

            this.fixUpButtonsAfterRuleChange();
        }

        //---- called from appSettings panel ----
        toggleStats()
        {
            settings.isShowingChartStatus(!settings._isShowingChartStatus);
        }

        disableBigButton(baseName: string, isDisabled: boolean)
        {
            var value = (isDisabled) ? "true" : "false";

            vp.select("#bb" + baseName).attr("data-disabled", value);
            vp.select("#bb" + baseName + "Value").attr("data-disabled", value);

            //---- hide chevron if disabled ----
            vp.select("#bb" + baseName + "Chevron").css("display", (isDisabled) ? "none" : "");
        }

        disableIconButton(baseName: string, isDisabled: boolean)
        {
            var value = (isDisabled) ? "true" : "false";

            vp.select("#" + baseName + "Button").attr("data-disabled", value);
            vp.select("#" + baseName + "Img").attr("data-disabled", value);
            vp.select("#" + baseName + "Text").attr("data-disabled", value);

            //---- hide chevron if disabled ----
            vp.select("#" + baseName + "Chevron").css("display", (isDisabled) ? "none" : "");
        }

        onSelectClick()
        {
            var items = [];

            items.push(new MenuItemData("Normal", "The new selection overrides the previous selection", "fnSelectionNormal"));
            items.push(new MenuItemData("Add", "The new selection is added to the previous selection", "fnSelectionUnite"));
            items.push(new MenuItemData("Subtract", "The new selection is subtracted from the previous selection", "fnSelectionSubtract"));
            items.push(new MenuItemData("Intersect", "Selects the intersection of the new and previous selections", "fnSelectionIntersect"));

            var picker = this.createGeneralPicker("selectButton", "selectionMode", items, (mid: MenuItemData, columns) =>
            {
                var selectName = mid.text;

                var mode = bps.SelectMode.normal;

                if (selectName === "Add")
                {
                    mode = bps.SelectMode.additive;
                }
                else if (selectName === "Subtract")
                {
                    mode = bps.SelectMode.subtractive;
                }
                else if (selectName === "Intersect")
                {
                    mode = bps.SelectMode.intersection;
                }

                this._bpsHelper.setSelectionMode(mode);

                this._selectionMode = mode;

                this.onSelectionModeChanged(mid.iconSrc, columns.map((item) => {
                    return item.iconSrc;
                }));

            });

            if (picker)
            {
                var rc = vp.select("#selectButton").getBounds(true);
                let sandDanceBounds = vp.select(".sandDance").getBounds(true),
                    bigBarBounds = vp.select("#playAndIconBar").getBounds(true);

                rc.left -= sandDanceBounds.left;//TODO: remove this hard fix.
                rc.bottom -= sandDanceBounds.top + bigBarBounds.bottom;

                picker.show(rc.left, rc.bottom);
            }
        }

        onSelectionModeChanged(imgSrc: string, imgSources: string[] = [])
        {
            //---- update the selection button to reflect the new mode ----
            var isSelected = (imgSrc !== "fnSelectionNormal");

            if (isSelected)
            {
                imgSrc = imgSrc.replace("white", "black");
            }

            let element = vp.select("#selectImg");

            imgSources.forEach((srcClass) => {
                element.removeClass(srcClass);
            });

            element.addClass(imgSrc);

            //---- don't enable this until we have the negative selectionMode icons ----
            element.attr("data-selected", (isSelected) ? "true" : "false");

        }

        fixUpButtonsAfterRuleChange()
        {
            //---- handle exceptions to app options for text/icons/chevrons in buttons ----
            vp.select("#xText").css("display", "block");
            vp.select("#yText").css("display", "block");
            vp.select("#zText").css("display", "block");

            vp.select("#searchColumnChevron").css("display", "inline-block");
            vp.select("#insightChevron").css("display", "none");
        }

        onWindowMouseDown(e?: any)
        {
            //this._chartUx.onWindowMouseDown(e);
            //this.stopPlayback();

            if (e && this._rcPlot)
            {
                var pt = vp.events.mousePosition(e);

                //---- ensure mouse is over PLOT area ----
                if (vp.geom.rectContainsPoint(this._rcPlot, pt))
                {

                    if (e.which === 3)
                    {
                        //---- right click: toggle DATA TIP ----
                    }
                }
                else if (e.which === 1)
                {
                    //---- LEFT CLICK ----
                    var elem = vp.events.elementFromPoint(pt.x, pt.y);
                    if (elem && elem.control && elem.control instanceof DataTipClass)
                    {
                        var dataTip = <DataTipClass>elem.control;
                    
                        //---- pass click to dataTip (since it has its pointer-events turned off) ----
                        dataTip.onMouseDown(e);
                    }
                }
            }
        }

        onWindowKeyDown(e?: any)
        {
            //this.stopPlayback();
        }

        closeAllPopups()
        {
            //---- old code - track each popup ----
            //this.closeGeneralPicker();
            //this.closeContextMenu();
            //this._insightMgr.closeMenus();

            //---- new code - find all close all popupMenu's and panels without a title bar ----
            var popups = vp.select(".popupMenu");
            popups.toArray().forEach((p) =>
            {
                p.jsObj.close();
            });

            var panels = vp.select(".panel");
            panels.toArray().forEach((p) =>
            {
                p.jsObj.close();
            });

            var panels = vp.select(".popupPanel");
            panels.toArray().forEach((p) =>
            {
                p.jsObj.close();
            });
        }

        onInsightPlayingChanged()
        {
            var isPlaying = (this._insightMgr.isPlaying());

            if (isPlaying)
            {
                if (this._insightMgr.isPaused())
                {
                    this.onPlaybackPaused();
                }
                else
                {
                    this.onPlaybackStarted();
                }
            }
            else
            {
                this.onPlaybackStopped();
            }
        }

        stopPlayback()
        {
            if (this._insightMgr.isPlaying())
            {
                this._insightMgr.stopPlayback();
                //this.onPlaybackStopped();
            }
        }

        pausePlayback()
        {
            if (this._insightMgr.isPlaying())
            {
                this._insightMgr.pausePlayback();
                //this.onPlaybackStopped();
            }
        }

        showPlayUI(value: boolean, isPaused?: boolean)
        {
            vp.select("#iconBar").css("display", (value) ? "none" : "");
            vp.select("#searchPanel").css("display", (value) ? "none" : "");
            vp.select("#btSettings").css("display", (value) ? "none" : "");

            vp.select("#playPanel").css("display", (value || isPaused) ? "" : "none");

            //---- show/hide axis bins adjusters ----
            this.updateUiForLayoutChange(value);
        }

        onPlaybackStarted()
        {
            //vp.select("#stopButton")
            //    .css("display", "")

            vp.select("#playExButton")
                .text("Pause");

            this.showPlayUI(true);

            this._showInsightPanelOnStop = this._insightMgr.isPanelOpen();
            this._insightMgr.showInsightBar(false);

            this.layoutScreen();
        }

        onPlaybackPaused()
        {
            //vp.select("#stopButton").css("display", "");

            vp.select("#playExButton")
                .text("Resume");

            this.showPlayUI(false, true);

            this._insightMgr.showInsightBar(false);

            this.layoutScreen();
        }

        onPlaybackStopped()
        {
            //vp.select("#stopButton").css("display", "none")

            this.showPlayUI(false);

            if (this._showInsightPanelOnStop)
            {
                this._insightMgr.showInsightBar(true);
            }

            this.layoutScreen();
        }

        onPlayExClick(e)
        {
            var text = vp.select("#playExButton").text();

            if (text === "Pause")
            {
                this.pausePlayback();
            }
            else if (text === "Resume")
            {
                this.resumePlayback();
            }
        }

        startPlayback()
        {
            this.stopPlayback();
            this._insightMgr.startPlayback();
        }

        resumePlayback()
        {
            this._insightMgr.resumePlayback();
        }

        addToolText(parentW: vp.dom.singleWrapperClass, callbackName: string, id: string, tooltip: string,
            spacer?: number, topAdjust = 0, width?: number)
        {
            var textW = parentW.append("div")
                .addClass("textButton")
                .id(id)
                .css("margin-top", topAdjust + "px")
                .title(tooltip)
                .attach("click", (e) =>
                {
                    this[callbackName](e);
                });

            if (width)
            {
                textW.css("min-width", width + "px");
            }

            if (spacer)
            {
                parentW.append("td")
                    .css("width", spacer + "px");
            }

            return textW[0];
        }

        addBigBarEntry(trW: vp.dom.singleWrapperClass, id: string, prompt: string, tooltip: string,
            callback?: any, omitValueText?: boolean, allowPromptWrap?: boolean)
        {
            //---- CONTAINER ----
            var tdW = trW.append("td")
                .addClass("bigBarEntry")
                .id(id)
                .css("float", "left")
                .title(tooltip);

            tdW[0]._title = tooltip;        // save for later restoration use

            if (callback)
            {
                tdW.attach("click", (e) =>
                {
                    AppUtils.callPanelOpen(e, callback);
                });
            }

            //---- PROMPT (line 1) ----
            tdW.append("div")
                .text(prompt)
                .addClass("bigBarPrompt");

            //---- VALUE container (line 2)
            var divW = tdW.append("div");
            //.css("text-align", "center")

            if (!omitValueText)
            {
                //---- VALUE TEXT ----
                divW.append("span")
                    .text("None")
                    .id(id + "Value")
                    .addClass("bigBarValue noneValue");

                //---- VALUE CHEVRON ----
                divW.append("div")//img
                    .addClass("chevronOfCombo")
                    .id(id + "Chevron");
                    //.attr("src", "Images/smallChevron3.png")
                    // .css("width", "8px")
                    // .css("opacity", ".5")
            }
        }

        isSumByEnabled()
        {
            var isEnabled = (this._chartName === "Column" || this._chartName === "Bar");
            return isEnabled;
        }

        isLineByEnabled()
        {
            var isEnabled = (this._chartName === "Scatter" || this._chartName === "Radial");
            return isEnabled;
        }

        addBigBarSpacer(trW: vp.dom.singleWrapperClass)
        {
            trW.append("td")
                .addClass("bigBarEntry")
                .css("float", "left")
                .css("width", "8px");
        }

        buildBigBar()
        {
            var trW = vp.select("#bigBar")
                .append("tr");

            //---- DATASET ----
            this.addBigBarEntry(trW, "bbData", "Dataset", "Open a data source", (e) => this._fileOpenMgr.onFileNameClick(e));

            //---- SPAVER ----
            //this.addBigBarSpacer(trW); //TODO: remove it?

            //---- VIEW AS ----
            this.addBigBarEntry(trW, "bbView", "View as", "Select a chart for viewing the data", (e) => this.onChartClick(e));

            //---- X AXIS ----
            this.addBigBarEntry(trW, "bbX", "X axis", "Change the X axis mapping", (e) => this.onXClick(e));

            //---- Y AXIS ----
            this.addBigBarEntry(trW, "bbY", "Y axis", "Change the Y axis mapping", (e) => this.onYClick(e));

            //---- Z AXIS ----
            this.addBigBarEntry(trW, "bbZ", "Z axis", "Change the Z axis mapping", (e) => this.onZClick(e));

            //---- SUM BY ----
            this.addBigBarEntry(trW, "bbSum", "Sum by", "Select a column for summing the data", (e) =>
            {
                if (this.isSumByEnabled())
                {
                    this.onSumByClick(e);
                }
            });
            
            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- FACET BY ----
            this.addBigBarEntry(trW, "bbFacet", "Facet by", "Select a column for grouping the data info multiple face views",
                (e) => this.onFacetClick(e));

            //---- COLOR BY ----
            this.addBigBarEntry(trW, "bbColor", "Color by", "Select a column, color palette, etc for data color mapping",
                (e) => this.onColorPanelClick(e));

            //---- SIZE BY ----
            this.addBigBarEntry(trW, "bbSize", "Size by", "Select a column for data size mapping", (e) => this.onSizeClick());

            //---- SHAPE BY ----
            this.addBigBarEntry(trW, "bbShape", "Shape by", "Select a column for data shape mapping", (e) => this.onImageClick());

            if (this._edition !== "client")
            {
                //---- TEXT BY ----
                this.addBigBarEntry(trW, "bbText", "Text by", "Select a column for datat text mapping",
                    (e) => this.onTextClick());

                //---- LINE BY ----
                this.addBigBarEntry(trW, "bbLine", "Line by", "Select a column for data line mapping",
                    (e) => this.onLineClick());
            }

            //---- SORT BY ----
            this.addBigBarEntry(trW, "bbSort", "Sort by", "Define how items and bins are sorted", (e) => this.onSortClick(e));

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SELECTION ----
            this.addBigBarEntry(trW, "bbSelect", "Selection", "View or clear the selection", (e) => this.onSelectionClick(e));

            //---- FILTER ----
            this.addBigBarEntry(trW, "bbFilter", "Filter", "View or clear the filter", (e) => this.onFilterClick(e));

            //---- CHART OPTIONS ----
            this.addBigBarEntry(trW, "bbChart", "Chart Options", "Open the Chart Options panel", (e) => this.onChartOptionsClick(e), true, true);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);

            //---- SPAVER ----
            this.addBigBarSpacer(trW);
        }

        onSelectionClick(e)
        {
            this.onSelectedCountClick(e);
        }

        onFilterClick(e)
        {
            this.onFilteredInCountClick(e);
        }

        onChartNotesClick()
        {
            //---- for now, click means HIDE notes ----
            vp.select("#chartNotes")
                .css("display", "none");
        }

        onCurrentInsightChanged()
        {
            var insight = this._insightMgr.currentInsight();
            var source = (insight) ? insight.notesSource : null;
            var notes = null;
            var title = null;

            if (insight && source && source !== bps.NotesSource.none)
            {
                if (source === bps.NotesSource.name && insight.name)
                {
                    notes = insight.name;
                }
                else if (source === bps.NotesSource.notes && insight.notes)
                {
                    notes = insight.notes;
                }
                else if (source === bps.NotesSource.both)
                {
                    title = insight.name;
                    notes = insight.notes;
                }
            }

            //---- close current panel, if open ----
            this.closeNotesPanel();

            //---- only show notes panel for insight if it was result of a LOAD (vs. new insight) ----
            var reason = this._insightMgr.getCurrentInsightReason();
            if (reason === "load" || reason === "play load")
            {
                if (title || notes)
                {
                    if (!title)
                    {
                        title = notes;
                        notes = null;
                    }

                    this._bpsHelper.getPlotBounds((msgBlock) => 
                    {
                        var rcPlot = msgBlock.rcPlot;

                        //---- convert rcPlot from relative to window coordinates ----
                        var rcChart = vp.select("#myChart").getBounds(false);
                        rcPlot = vp.geom.createRect(rcChart.left + rcPlot.left, rcChart.top + rcPlot.top, rcPlot.width, rcPlot.height);

                        this._notesPanel = new NotesPanelClass(title, notes, insight.notesBounds, rcPlot);

                        //---- track panel movements ----
                        this._notesPanel.registerForChange("location", (e) => this.onInsightBoundsChange(insight));
                        this._notesPanel.registerForChange("size", (e) => this.onInsightBoundsChange(insight));
                    });
                }
            }
        }

        onInsightBoundsChange(insight: bps.InsightData)
        {
            var rc = vp.select(this._notesPanel.getRootElem()).getBounds(false);
            insight.notesBounds = rc;
        }

        closeNotesPanel()
        {
            if (this._notesPanel)
            {
                this._notesPanel.close();
                this._notesPanel = null;
            }
        }

        applyDefaultBins()
        {
            var binCount = settings._defaultBins;

            this.colorSteps(binCount);
            this.facetBins(binCount);
            this.xBins(binCount);
            this.yBins(binCount);
        }

        onUseNiceNumbersChanged()
        {
            var useNice = settings._useNiceNumbers;

            this.onColorMappingChanged(true);

            this._facetMapping.useNiceNumbers = useNice;
            this.onFacetMappingChanged();

            this._xMapping.useNiceNumbers = useNice;
            this.onXMappingChanged();

            this._yMapping.useNiceNumbers = useNice;
            this.onYMappingChanged();
        }

        onAddView(e)
        {
            window.open(window.location.href, "_blank", "resizable,scrollbars,status=0,titlebar=0");

            //---- log as not-undoable ----
            this.logAction(Gesture.click, e.target.id, ElementType.button, Action.open, Target.newAppInstance, false);
        }

        createTestMgrIfNeeded()
        {
            if (!this._testMgr)
            {
                var winAny = <any>window;

                var test = winAny.beachPartyTest;
                if (test)
                {
                    this._testMgr = new TestMgrClass(this, test);
                }
                else
                {
                    throw "Cannot find beachPartyTest";
                }
            }
        }

        plotTestResults()
        {
            //---- close the settings panel ----
            this.toggleAppPanel(null);

            this.createTestMgrIfNeeded();
            this._testMgr.plotPerfResults();
        }

        plotEngineEvents()
        {
            //---- close the settings panel ----
            this.toggleAppPanel(null);

            this._bpsHelper.getEngineEvents((msgBlock) =>
            {
                var engineEvents = msgBlock.engineEvents;

                if (engineEvents && engineEvents.length)
                {
                    this._fileOpenMgr.uploadData(engineEvents, "engineEvents", undefined, (e) =>
                    {
                        this.changeToChart("Scatter", null, Gesture.automatedTest);
                        this.changeXMapping("time");
                        this.changeYMapping("eventName");

                        this.colorColumn("eventName");
                        //this.changeImageMapping("eventType");
                        this.changeLineMapping("durationId");
                    });
                }
            });
        }

        addClientMemoryUse(memUse: any)
        {
            //---- first build a map of major objects in engine ----
            var memObjs = <any>{};

            memObjs.app = this;
            memObjs.appSettingsMgr = settings;
            memObjs.chartUx = this._chartUx;
            memObjs.fileOpenMgr = FileOpenMgr;
            memObjs.insightMgr = this._insightMgr;
            memObjs.undoMgr = this._undoMgr;

            utils.getMemoryUse(memObjs, memUse);
        }

        plotEngineMemoryUse()
        {
            //---- close the settings panel ----
            this.toggleAppPanel(null);

            this._bpsHelper.getMemoryUse((msgBlock) =>
            {
                var memUse = msgBlock.memUse;
                var engKeyCount = vp.utils.keys(memUse).length;

                this.addClientMemoryUse(memUse);

                //---- create a JSON record for each name/value pair ----
                var records = [];
                var keys = vp.utils.keys(memUse);

                for (var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    var space = (i < engKeyCount) ? "engine" : "client";

                    var record = { name: key, value: memUse[key], space: space };
                    records.push(record);
                }

                this._fileOpenMgr.uploadData(records, "memoryUse", undefined, (e) =>
                {
                    this.changeToChart("Scatter", null, Gesture.automatedTest);
                    this.changeXMapping("name");
                    this.changeYMapping("value");

                    //this.colorColumn("eventName");
                });
            });
        }

        startAutomatedTest()
        {
            //---- close the settings panel ----
            this.toggleAppPanel(null);

            if (this._testMgr && this._testMgr._isRunning)
            {
                this._testMgr.stop();
                this._testMgr = null;
            }
            else
            {
                this.createTestMgrIfNeeded();
                this._testMgr.start(true);
            }
        }

        stopAutomatedTest()
        {
            if (this._testMgr && this._testMgr._isRunning)
            {
                this._testMgr.stop();
                this._testMgr = null;
            }
        }

        remapColorData()
        {
            this.onColorMappingChanged(false, true);

            this.logAction(Gesture.click, null, ElementType.button, Action.remap, Target.colorMapping, true);
        }

//         onPlotMoved(rcPlot: ClientRect, rcRotateRing: ClientRect)//TODO: old version
//         {
//             //---- move chartUxDiv to capture events that happen within the plot area of the chart -----
//             var rc = vp.select("#myChart").getBounds(false);
// 
//             var left = rc.left + rcPlot.left;
//             var top = rc.top + rcPlot.top;
// 
//             //---- screen relative ----
//             this._rcPlot = vp.geom.createRect(left, top, rcPlot.width, rcPlot.height);
// 
//             //---- rcPlot relative ----
//             this._rcRotateRing = rcRotateRing;
// 
//             vp.select("#chartUxDiv")
//                 .css("left", left + "px")
//                 .css("top", top + "px")
//                 .css("width", rcPlot.width + "px")
//                 .css("height", rcPlot.height + "px")
// 
//             //vp.utils.debug("---> onPlotMoved");
//         }

        onPlotMoved(rcPlot: ClientRect, rcRotateRing: ClientRect)//TODO: this temporarily hack, remove it asap
        {
            //---- move chartUxDiv to capture events that happen within the plot area of the chart -----
            // var rc = vp.select("#myChart").getBounds(true),
            //     canvas3d = vp.select("#canvas3d").getBounds(true);

            var left = rcPlot.left;// + rcPlot.left + canvas3d.left + 5;
            var top = rcPlot.top;// + rcPlot.top + canvas3d.top;

            //---- screen relative ----
            this._rcPlot = vp.geom.createRect(left, top, rcPlot.width, rcPlot.height);

            //---- rcPlot relative ----
            this._rcRotateRing = rcRotateRing;

            vp.select("#chartUxDiv")
                .css("left", left + "px")
                .css("top", top + "px")
                .css("width", rcPlot.width + "px")
                .css("height", rcPlot.height + "px");

            //vp.utils.debug("---> onPlotMoved");
        }

        getPlotBounds()
        {
            return this._rcPlot;
        }

        quickStats(msg: string)
        {
            vp.select("#lastCycleFPS")
                .text(msg);
        }

        onFeedbackClick()
        {
            this.openFeedbackPanel();
        }

        openFeedbackPanel()
        {
            this._feedbackType = "Ideas";
            this._feedbackText = "";

            var rc = vp.select("#btFeedback").getBounds(false);

            buildJsonPanel("btFeedback", this, "feedback", true, undefined, rc.bottom+5,
                rc.right+0, undefined, undefined, undefined, undefined, undefined, true);
        }

        makeUIVisible()
        {
            vp.select("#iconBar").css("display", "inline-block");
            vp.select("#bigBar").css("display", "");
            vp.select("#searchPanel").css("display", "");

            vp.select("#feedbackBar")
                .css("display", "")
                .css("right", "30px");

            this.layoutScreen();

            vp.select(vp.select("#myChart")[0].firstChild)
                .css("opacity", "1");        // make visible on first resize;
        }

        /** post a message to the HOST of the beachParty client app. */
        postMessageToHost(msgObj)
        {
            if (window)//.parent)
            {
                //---- identify which VAAS inst this msgs is coming from ----
                msgObj.clientAppId = this._clientAppId;

                var msgStr = JSON.stringify(msgObj);
                var domain = bps.chartHostHelperClass.getDomain(this._hostDomain);

                vp.utils.debug("postMessageToHost: domain=" + domain + ", msg=" + msgObj.msg);

                
                hostBus.postMessage(msgStr);
                //window.parent.window.postMessage(msgStr, domain);
            }
        }

        selectXBox(index: number)
        {
            this._bpsHelper.selectXTickBox(index);
        }

        selectYBox(index: number)
        {
            this._bpsHelper.selectYTickBox(index);
        }

        selectColorBox(index: number)
        {
            this._colorLegend.selectColorBox(index);
        }

        onEngineLoaded(msgBlock)
        {
            this._chartIsLoaded = true;

            //---- process preload info ----
            var preloads = <bps.Preload[]>msgBlock.knownData;
            this._preloads = preloads.orderByStr((p) => p.name);

            //---- catch errors here so that we don't let bad data/session file ruin our initialization ----
            try
            {
                if (this._initSessionId)
                {
                    //---- load session specified in url ----
                    this._insightMgr.loadSessionFromServer(this._initSessionId);
                }
                else if (!this._clientAppId) 
                {
                    var loadedSomething = false;

                    if (settings.rememberLastSession)
                    {
                        loadedSomething = (this.loadLastSession() != null);
                    }

                    if (!loadedSomething && settings.rememberLastFile)
                    {
                        //---- load start-up file ----
                        this.loadInitialDataSet();
                    }

                    //this._bpsHelper.testRoundTripTime((msgBlock) =>
                    //{
                    //    vp.utils.debug("completed ROUND TRIP");
                    //});
                }
            }
            catch (error)
            {
                this.showError(error);

                this.makeUIVisible();
                this.hookLocalStorageChanges();
            }
        }

        loadInitialDataSet()
        {
            console.log("fileOpenMgr.instance.autoloadFile(settings._initFilename) from App.ts method loadInitialDataSet");
            //fileOpenMgr.instance.autoloadFile(settings._initFilename);
        }

        public loadLastSession()
        {
            var preload = null;

            if (true)
            {
                // var key = settings.getLastSessionKey();
                // var strPreload = localStorage[key];

                // if (strPreload)
                // {
                    preload = this.loadSettingsHandler && this.loadSettingsHandler(sandDance.SettingsType.session); //JSON.parse(strPreload);
                    if (preload)
                    {
                        this.loadInsightCore(preload);
                    }
                // }
            }

            return preload;
        }

        public loadAppSettings() {
            settings.loadAppSettings();
        }

        loadInsight()
        {
            var insight = this._insightMgr.currentInsight();
            if (insight)
            {
                this.loadInsightCore(insight);

                this.logAction(Gesture.click, null, ElementType.button, Action.load, Target.insight, true, "name", insight.name);
            }
        }

        setAppAutoRebuild(value: boolean, rebuildNow: boolean, ignoreFilterStage?: boolean)
        {
            if (this._autoRebuild !== value)
            {
                //this._autoRebuild = value;//TODO: check it line.

                vp.utils.debug("setAppAutoRebuild: value=" + value + ", rebuildNow=" + rebuildNow);

                this._bpsHelper.setAutoRebuild(value, rebuildNow, ignoreFilterStage);
            }
        }

        onInsightLoadStarted()
        {
            //var svd = new bps.SystemViewData();
            this._isLoggingEnabled = false;
            this._isInsightLoading = true;

            vp.utils.debug("setting _isInsightLoading = TRUE");

            //---- turn off auto draw of chart since we will be doing multiple async steps ----
            //---- this usually gets turned back on when we receive a "filterChanged" event from the engine ----
            this.setAppAutoRebuild(false, false);
        }

        onInsightLoadCompleted()
        {
            this._isLoggingEnabled = true;
            this._isInsightLoading = false;

            vp.utils.debug("setting _isInsightLoading = FALSE");

            this._insightMgr.onInsightLoadCompleted();

            //---- force a chart draw & turn autoRebuild back on ----
            this.setAppAutoRebuild(true, true, true);

            vp.utils.debug("---> onInsightLoadCompleted");
        }

        loadInsightCore(insight: bps.InsightData)
        {
            vp.utils.debug("loading insight: " + insight.name);

            this.onInsightLoadStarted();

            //---- supply a dataName so we can refer to this open data source when needed ----
            if (!insight.preload.dataName)
            {
                insight.preload.dataName = insight.preload.name;
            }

//             if (insight.loadAction == bps.LoadAction.all || insight.loadAction == bps.LoadAction.data
//                 || insight.loadAction === undefined)
//             {
//                 //---- load insight DATA ----
// 
//                 //---- clear local file data from last load ----
//                 this._fileOpenMgr.loadedFileOpenText(null);
// 
//                 //this._bpsHelper.loadData(insight.preload, (e) =>
//                 fileOpenMgr.instance.autoloadFile(insight.preload.dataName, insight.preload, (e) =>
//                 {
//                     this.loadInsightPost(insight);
//                 });
//             }
//             else
//             {
                //---- no data needed - can call loadInsightPost SYNC ----
                this.loadInsightPost(insight);
            // }
        }

        copyMapping(md: bps.MappingData)
        {
            var newMd = <bps.MappingData> vp.utils.copyMap(md, true);

            return newMd;
        }

        loadInsightPost(insight: bps.InsightData)
        {
            // CAUTION: if we are changing the filter, we don't want to ----
            // call "onInsightLoadCompleted" UNTIL we (the client) have processed the "onFilter" changed event ----
            vp.utils.debug("loadInsightPost starting");

            var preload = insight.preload;
            //this._insightCompletePending = false;
            this._insightWaitingForFilterChanged = false;

            //---- load SYSTEM VIEW properties ----
            var svd = new bps.SystemViewData();

            if (insight.loadAction === bps.LoadAction.selection)
            {
                svd.selectedKeys = preload.selectedKeys;

                this._bpsHelper.setSystemViewData(svd, (e) =>
                {
                    //this.onInsightLoadCompleted();
                });
            }
            else if (insight.loadAction === bps.LoadAction.filter)
            {
                svd.filteredOutKeys = preload.filteredOutKeys;

                this._insightWaitingForFilterChanged = true;
                //this._insightCompletePending = true;
                this._bpsHelper.setSystemViewData(svd);
            }
            else if (insight.loadAction === bps.LoadAction.data)
            {
                //this.onInsightLoadCompleted();
            }
            else
            {
                //----FULL LOAD of insight ----
                svd.selectedKeys = preload.selectedKeys;
                svd.filteredOutKeys = preload.filteredOutKeys;
                svd.worldTransform = preload.worldTransform;
                svd.rotationInertia = preload.rotationInertia;

                //---- assume that the insight changed the filter and will trigger needed actions ----
                //this.onClientFilterChange();

                var hasFilter = (svd.filteredOutKeys != null && svd.filteredOutKeys.length > 0);
                
                if (hasFilter)
                {
                    //this._insightCompletePending = true;
                    this._insightWaitingForFilterChanged = true;
                    this._bpsHelper.setSystemViewData(svd);
                }
                else
                {
                    this._bpsHelper.setSystemViewData(svd, (e) =>
                    {
                        //this.onInsightLoadCompleted();
                    });
                }

                //---- sorting stuff ----
                if (preload.sortCol)
                {
                    this._isItemSortAscending = preload.isSortAscending;
                    this.sortItemColumn(preload.sortCol);
                }

                //---- load CLIENT VIEW properties ----
                if (preload.chartName !== this._chartName || preload.subLayout !== this._layoutName)
                {
                    this.changeToChart(preload.chartName, preload.subLayout, Gesture.system);
                }

                //---- SIZE FACTOR ----
                if (preload.sizeFactor !== this._sizeFactor)
                {
                    this.sizeFactor(preload.sizeFactor);
                }

                //---- SEPARATION FACTOR ----
                if (preload.separationFactor !== this._separationFactor)
                {
                    this.separationFactor(preload.separationFactor);
                }

                //---- OPACITY ----
                if (preload.shapeOpacity !== settings._shapeOpacity)
                {
                    settings.shapeOpacity(preload.shapeOpacity);
                }

                //---- IMAGE ----
                if (preload.shapeImage !== settings._shapeImage)
                {
                    settings.shapeImage(preload.shapeImage);
                }

                //---- color ----
                if (preload.shapeColor !== settings._shapeColor)
                {
                    settings.shapeColor(preload.shapeColor);
                }

                //---- client-specific properties ----
                this.searchValue(insight.searchText);
                this.searchCol(insight.searchColumn);
                this.isDetailsPanelOpen(insight.isDetailsPanelOpen);
                this.isSortPanelOpen(insight.isSortPanelOpen);
                this.isAppPanelOpen(insight.isAppPanelOpen);
                this.isColorPanelOpen(insight.isColorPanelOpen);
                this.isSlicerPanelOpen(insight.isSlicerPanelOpen);
                this.isShowing3DWheel(insight.isShowing3DWheel);

                var icm = preload.colMappings;

                this._currentColorMapping = <bps.ColorMappingData> this.copyMapping(icm.color);
                this.onColorMappingChanged(true);

                this._sizeMapping = <bps.SizeMappingData> this.copyMapping(icm.size);
                this.onSizeMappingChanged();

                this._imageMapping = <bps.ImageMappingData> this.copyMapping(icm.image);
                this.onImageMappingChanged();

                this._facetMapping = <bps.FacetMappingData> this.copyMapping(icm.facet);
                this.onFacetMappingChanged();

                this._xMapping = this.copyMapping(icm.x);
                this.onXMappingChanged();

                this._yMapping = this.copyMapping(icm.y);
                this.onYMappingChanged();

                this._zMapping = (icm.z) ? this.copyMapping(icm.z) : new bps.MappingData();
                this.onZMappingChanged();

                this.loadDataTips(preload.dataTips);

                //---- trigger dataChanged events for all insight loaded properties that appear in controls or panels ----
                this.onDataChanged(null);
            }

            this._isInsightLoading = false;

            if (!this._insightWaitingForFilterChanged)
            {
                this.onInsightLoadCompleted();
            }

            //this._isLoggingEnabled = true;
        }

        onOpenScrubber(e)
        {
            //---- only open if not already open ----
            if (! this._scrubberDialog)
            {
                this._scrubberDialog = new ScrubberDialogClass(this._origColInfos, this._colInfos);

                this._scrubberDialog.registerForChange("ok", (e) =>
                {
                    var editInfos = this._scrubberDialog.getEditInfos();
                    this._fileOpenMgr.reloadDataPerScrubbing(editInfos);
                });

                this._scrubberDialog.registerForChange("close", (e) =>
                {
                    this._scrubberDialog = null;
                });
            }
        }

        closeScrubberDialog()
        {
            if (this._scrubberDialog)
            {
                this._scrubberDialog.close();
                this._scrubberDialog = null;
            }
        }

        loadDataTips(dataTips: bps.DataTipData[])
        {
            if (dataTips)
            {
                this._dataTipMgr.clearDataTips();

                for (var i = 0; i < dataTips.length; i++)
                {
                    var dtd = dataTips[i];

                    var dataTip = this._dataTipMgr.addDataTip(dtd.colName);
                     
                    dataTip.setDataTipData(dtd);
                }
            }
        }
        
        isDetailsPanelOpen(value?: boolean)
        {
            var isOpen = (this._detailsPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.toggleDetailsPanel(null);
            }

            this.onDataChanged("isDetailsPanelOpen");
        }

        isAppPanelOpen(value?: boolean)
        {
            var isOpen = (this._appPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.toggleAppPanel(null);
            }

            this.onDataChanged("isAppPanelOpen");
        }

        isSortPanelOpen(value?: boolean)
        {
            var isOpen = (this._sortPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.toggleSortPanel(null);
            }

            this.onDataChanged("isSortPanelOpen");
        }

        isColorPanelOpen(value?: boolean)
        {
            var isOpen = (this._colorPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.toggleColorPanel(null);
            }

            this.onDataChanged("isColorPanelOpen");
        }

        isFacetPanelOpen(value?: boolean)
        {
            var isOpen = (this._facetPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.onFacetClick(null);
            }

            this.onDataChanged("isFacetPanelOpen");
        }

        isSlicerPanelOpen(value?: boolean)
        {
            var isOpen = (this._slicerPanel != null);

            if (arguments.length === 0)
            {
                return isOpen;
            }

            if (value !== isOpen)
            {
                this.toggleSlicerPanel(null);
            }

            this.onDataChanged("isSlicerPanelOpen");
        }

        isShowing3DWheel(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isTransformMode;
            }

            this._isTransformMode = value;
            this._bpsHelper.setShowing3DWheel(value);

            //---- reflect in UI ----
            vp.select("#wheelButton")
                .attr("data-selected", value + "");

            this.onDataChanged("isShowing3DWheel");
        }

        getContextMenuItems(isDragSelecting: boolean)
        {
            var menuItems = [];

            if (isDragSelecting)
            {
                var mi = new MenuItemData("Select", "Set the selection to the shapes bound by the rectangle", null, false);
                var mi = new MenuItemData("Select additive", "Add the shapes bound by the rectangle to the selection", null, false);
                var mi = new MenuItemData("Select subtractive", "Remove the shapes bound by the rectangle from the selection", null, false);
                var mi = new MenuItemData("Select intersection", "Set the selection to the intersection of the current selection and the shapes bound by the rectangle", null, false);
                var mi = new MenuItemData("Select non-intersection", "Set the selection to the union of current selection and the bound shapes, minus the intersection of the two", null, false);

                var mi = new MenuItemData("-", "", null, false);
                var mi = new MenuItemData("Data zoom", "Zoom-in on the data bound by the rectangle", null, true);

                menuItems.push(mi);
            }
            else
            {
                var mi = new MenuItemData("3D wheel", "Show/hide the 3D wheel", null, false);
                menuItems.push(mi);
            }

            return menuItems;
        }

        //showChartContextMenu(isDragSelecting: boolean, mousePosition: any)
        //{
        //    this.closeContextMenu();

        //    var menuItems = this.getContextMenuItems(isDragSelecting);

        //    var pm = new popupMenuClass("pmChartContext", menuItems, (e, menu, textIndex, menuIndex) =>
        //    {
        //        var name = (<MenuItemData>menuItems[menuIndex]).text;
        //        var keywordCol = (<MenuItemData>menuItems[menuIndex]).extra;

        //        if (name == "3D wheel")
        //        {
        //            //---- toggle visibility ----
        //            this.isShowing3DWheel(!this._isShowing3DWheel);
        //        }

        //    }, true);

        //    var rc = vp.select("#myChart").getBounds(false);

        //    this.setContextMenu(pm);
        //    pm.show(mousePosition.x + rc.left, mousePosition.y + rc.top);
        //}

        setContextMenu(pm: PopupMenuClass)
        {
            if (this._activeContextMenu)
            {
                this._activeContextMenu.close();
            }

            this._activeContextMenu = pm;
        }

        closeContextMenu()
        {
            if (this._activeContextMenu)
            {
                this._activeContextMenu.hide();
                this._activeContextMenu = null;
            }
        }

        processUrlParams()
        {
            var cmdParams: any = vp.utils.getUrlParams();

            if (cmdParams)
            {
                var keys = vp.utils.keys(cmdParams);
                for (var k = 0; k < keys.length; k++)
                {
                    var key = keys[k];
                    var value = cmdParams[key];

                    if (key === "reset" && value === "true")
                    {
                        this.deleteLocalStorageInfo();
                    }
                    else if (key === "edition")
                    {
                        this.setEdition(value);
                    }
                    else if (key === "session")
                    {
                        this._initSessionId = value;
                    }
                    else if (key === "hostdomain")
                    {
                        this._hostDomain = value;
                    }
                    else if (key === "clientappid")
                    {
                        this._clientAppId = value;
                    }
                    else if (key === "appstarttime")
                    {
                    }
                    else if (key === "zoom")
                    {
                        //---- programatically set the zoom (for taking snapshots) ----
                        document.body.style.zoom = value;
                    }
                    else if (key === "animate")
                    {
                        if (value === "false")
                        {
                            this._animateDisabledFromUrlParams = true;
                        }
                    }
                    else if (key === "persistchanges")
                    {
                        if (value === "false")
                        {
                            settings._persistChangesDisabledFromUrlParams = true;
                        }
                    }
                    else if (key === "isbrowsercontrol")
                    {
                    }
                    else 
                    {
                        throw "Error: unrecognized URL param=" + key;
                    }
                }
            }
        }

        deleteLocalStorageInfo()
        {
            /// localStorage keys for BeachParty: 
            ///
            ///   [appSettings]:   AppSettings (as json string).
            ///   [session-fn]:    ShareStateData for file fn (as json string).
            ///   [preloads-fn]:   Preload for file fn (as json string).
            ///   [testResults]:   JSON perf records from most recent test run

            //---- delete localStorage for our settings ----
            if (localStorage)
            {
                //---- if we do this, let it trigger event to engine ----
                localStorage.clear();
            }
        }

        setEdition(value: string)
        {
            this._edition = value;

            //if (value == "server")
            //{
            //    vp.select("#btBeachParty")
            //        .text("BEACH PARTY SE")
            //        .css("color", "#0cf")
            //}
            //else if (value == "unlimited")
            //{
            //    vp.select("#btBeachParty")
            //        .text("BEACH PARTY UL")
            //        .css("color", "rgb(255,201,14)")
            //}
        }

        //onConditionalFormatTest(value?: boolean)
        //{
        //    if (arguments.length === 0)
        //    {
        //        return (!!this._currentColorMapping.customScalingCallback);
        //    }

        //    if (value)
        //    {
        //        var cbFunc = function (value)
        //        {
        //            return (value < 0) ? 2 : 1;
        //        };

        //        this._currentColorMapping.customScalingCallback = cbFunc.toString();
        //        this._currentColorMapping.colorPalette = ["red", "gray"];
        //    }
        //    else
        //    {
        //        this._currentColorMapping.customScalingCallback = null;
        //        this.buildColorPaletteFromSettings();
        //    }

        //    this.onColorMappingChanged(false);
        //}

        feedbackType(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._feedbackType;
            }

            this._feedbackType = value;

            this.onDataChanged("feedbackType");
        }

        feedbackText(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._feedbackText;
            }

            this._feedbackText = value;

            this.onDataChanged("feedbackText");
        }

        submitFeedback()
        {
            beachParty.logFeedbackToServer(this._feedbackType, this._feedbackText);

            //---- after dialog is closed, clear the feedback field for next time ----
            setTimeout((e) => this.feedbackText(""), 500);
        }

        selectedRecords(value?: any[])
        {
            if (arguments.length === 0)
            {
                return this._selectedRecords;
            }

            this._selectedRecords = value;
            this.onDataChanged("selectedRecords");
        }

        isItemSortAscending(value?: boolean, tellEngine = true)
        {
            if (arguments.length === 0)
            {
                return this._isItemSortAscending;
            }

            if (value !== this._isItemSortAscending)
            {
                this._isItemSortAscending = value;

                if (tellEngine)
                {
                    this.onSortParmsChanged(true);
                }

                this.onDataChanged("isItemSortAscending");
            }
        }

        sortItemColumn(value?: string, tellEngine = true)
        {
            if (arguments.length === 0)
            {
                return this._sortItemCol;
            }

            if (value !== this._sortItemCol)
            {
                this._sortItemCol = value;
                this.onSortParmsChanged(tellEngine);

                this.onDataChanged("sortItemColumn");
            }
        }

        xBinSorting(value?: bps.BinSorting)
        {
            if (arguments.length === 0)
            {
                return this._xMapping.binSorting;
            }

            this._xMapping.binSorting = value;
            this.onXMappingChanged();

            this.onDataChanged("xBinSorting");
        }

        yBinSorting(value?: bps.BinSorting)
        {
            if (arguments.length === 0)
            {
                return this._yMapping.binSorting;
            }

            this._yMapping.binSorting = value;
            this.onYMappingChanged();

            this.onDataChanged("yBinSorting");
        }

        slicerColName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._slicerColName;
            }

            this._slicerColName = value;
            this.onDataChanged("slicerColName");

            this.rebinDataForSlicer();
        }

        rebinDataForSlicer()
        {
            var colName = this._slicerColName;

            //---- request binResult for colName ----
            var md = new bps.MappingData(colName);
            md.tagDelimiter = (this._slicerControl) ? this._slicerControl.tagDelimiter() : bps.TagDelimiter.none;

            var colInfo = this.getColInfo(colName);
            var isCategory = (md.forceCategory || colInfo.colType === "string");

            if (isCategory)
            {
                md.binSorting = bps.BinSorting.ascending;
                md.binCount = AppClass.maxCategoryBins;      // max category bins
            }

            this._bpsHelper.getBinData(md, (msgBlock) =>
            {
                var binData = JSON.parse(msgBlock.param);
                this.slicerData(binData);

                if (this._slicerControl)
                {
                    this._slicerControl.colName(colName);

                    if (this._slicerInitialValue)
                    {
                        this._slicerControl.selectedValue(this._slicerInitialValue);
                        this._slicerInitialValue = null;
                    }
                }
            });

        }

        slicerData(value?: beachParty.BinResult)
        {
            if (arguments.length === 0)
            {
                return this._slicerData;
            }

            this._slicerData = value;

            this.onDataChanged("slicerData");
        }

        facetBinSorting(value?: bps.BinSorting)
        {
            if (arguments.length === 0)
            {
                return this._facetMapping.binSorting;
            }

            this._facetMapping.binSorting = value;
            this.onFacetMappingChanged();

            this.onDataChanged("facetBinSorting");
        }

        onItemsByColorClick()
        {
            var colName = (this._currentColorMapping) ? this._currentColorMapping.colName : "";

            this.sortItemColumn(colName);
            this.isItemSortAscending(true);
        }

        resetMappingsForNewFile()
        {
            var isLoadingInsight = this._isInsightLoading;

            //---- reset all attribute mapping ----
            this._sizeMapping.colName = null;
            this._textMapping.colName = null;
            this._lineMapping.colName = null;
            this._imageMapping.colName = null;
            this._facetMapping.colName = null;
            this._lastScatterXCol = null;
            this._lastScatterYCol = null;

            //---- get DEFAULT COLUMNS ----
            var defaultCols = this.getDefaultXYZCols();

            this.searchCol(defaultCols.x);

            //---- clear open slicer controls ----
            if (this._slicerControl)
            {
                this.slicerColName(defaultCols.x);
            }

            this._dataTipMgr.clearDataTips();

            if (!isLoadingInsight)
            {

                //---- reset all sorting (caution: don't sort multiple times here) ----
                this.sortItemColumn(null, false);
                this.isItemSortAscending(true, false);

                this.xBinSorting(bps.BinSorting.none);
                this.yBinSorting(bps.BinSorting.none);
                this.facetBinSorting(bps.BinSorting.none);

                //---- ensure sort UI gets updated ----
                this.onSortParmsChanged(false);
            
                //---- for color, we reset the colName on the currentColMapping ----
                this._currentColorMapping.colName = null;

                this._xMapping.colName = defaultCols.x;
                this._yMapping.colName = defaultCols.y;
                this._zMapping.colName = defaultCols.z;

                this.setMappingDataFormatting(this._xMapping);
                this.setMappingDataFormatting(this._yMapping);
                this.setMappingDataFormatting(this._zMapping);

                this.onSizeMappingChanged();
                this.onTextMappingChanged();
                this.onFacetMappingChanged();
                this.onImageMappingChanged();
                this.onColorMappingChanged(true);

                this.onXMappingChanged();
                this.onYMappingChanged();
                this.onZMappingChanged();

                //this._sizeFactorByChart = {};

                //---- selection ----
                this.selectedRecords(null);

                //this._bpsHelper.resetFilter();
                this._bpsHelper.resetTransform();

                //---- change to initial chart ----
                if (settings._initialChartType)
                {
                    var initChart = bps.ChartType[settings._initialChartType];
                    var initLayout = bps.Layout[settings._initialLayout];

                    this.changeToChart(initChart, initLayout, Gesture.system);
                }
            }

            this.applyDefaultBins();

            //---- update UI params ----
            this.onFilenameChanged();
            this.onRecordCountChanged();
            this.onSelectedCountChanged();
            this.onFilteredInCountChanged();
        }

        onClientFilterChange()
        {
            //---- prevent chart from rebuilding until engine sends us new filter info ----
            this.setAppAutoRebuild(false, false);
        }

        onFilterChangedFromEngine()
        {
            var wasFilterReset = (this._recordCount === this._filteredInCount);

            if (this.colorColumn())
            {
                //---- when filter is reset, force new color mapping ----
                if (wasFilterReset)
                {
                    this.onColorMappingChanged(false, true);
                }
            }

            if (this._sizeMapping.colName)
            {
                this.onSizeMappingChanged();
            }

            if (this._imageMapping.colName)
            {
                this.onImageMappingChanged();
            }

            if (this._facetMapping.colName)
            {
                this.onFacetMappingChanged();
            }

            if (this._insightWaitingForFilterChanged)
            {
                if (this._isInsightLoading)
                {
                    this._insightWaitingForFilterChanged = false;

                    this.onInsightLoadCompleted();
                }
            }
            else
            {
                this.setAppAutoRebuild(true, true);
            }
        }

        toggleTransformMode(e)
        {
            //---- toggle visiblity ----
            var action = (this._isTransformMode) ? Action.hide : Action.show;

            this.isShowing3DWheel(!this._isTransformMode);
            //this._wheelDownTime = vp.utils.now();

            //---- hide the chartUxDiv when transforMode = true ----
            vp.select("#chartUxDiv").css("display", (this._isTransformMode) ? "none" : "");

            AppUtils.setButtonSelectedState("wheel", this._isTransformMode, "fnIconBarToggle3dNorm", "fnIconBarToggle3dSelect");

            if (!settings._showWheelDuringTransformMode)
            {
                //---- use ring animation in place of wheel ----
                if (this._isTransformMode)
                {
                    this.showRing();
                    //this._rotateRing.startPulsing();
                }
                else
                {
                    this._rotateRing.exit();
                }
            }

            this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.threeDimWheel, true);
        }

        showRing()
        {
            //this._bpsHelper.getPlotBounds((msgBlock) =>
            //{
            //    this._rotateRing.setRotationBounds(msgBlock.rcRotateRing);
            //});

            this._rotateRing.enter();
        }

        onWheelUp(e)
        {
            //var elapsed = vp.utils.now() - this._wheelDownTime;
            //if (elapsed > 1000)
            //{
            //    //---- restore previous visiblity ----
            //    this.isShowing3DWheel(!this._isShowing3DWheel);
            //}
        }

        xBins(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._xMapping.binCount;
            }

            //---- setting: ensure value don't exceed allowable maxKeys ----
            var maxKeys = this.getMaxKeysForColumn(this._xMapping.colName);
            if (maxKeys != null && maxKeys < value)
            {
                value = maxKeys;
            }

            this._xMapping.binCount = value;
            //this._vsCurrent.xBinCount = value;

            //---- remember the binCount the current column mapping ----
            this._binCountForColumn[this._xMapping.colName] = value;

            this.onXMappingChanged();
            this.onDataChanged("xBins");
            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.xMapping, true, "binCount", value + "");
        }

        yBins(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._yMapping.binCount;
            }

            //---- setting: ensure value don't exceed allowable maxKeys ----
            var maxKeys = this.getMaxKeysForColumn(this._yMapping.colName);
            if (maxKeys != null && maxKeys < value)
            {
                value = maxKeys;
            }

            this._yMapping.binCount = value;
            //this._vsCurrent.yBinCount = value;

            //---- remember the binCount the current column mapping ----
            this._binCountForColumn[this._yMapping.colName] = value;

            this._bpsHelper.setYMapping(this._yMapping);
            this.onDataChanged("yBins");
            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.yMapping, true, "binCount", value + "");
        }

        zBins(value?: number) 
        {
            if (arguments.length === 0) 
            {
                return this._zMapping.binCount;
            }

            this._zMapping.binCount = value;
            this._vsCurrent.zBinCount = value;

            this.onDataChanged("zBins");

            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.zMapping, true, "binCount", value + "");

            this.onZMappingChanged();
        }

        facetMapping(value?: bps.FacetMappingData)
        {
            if (arguments.length === 0)
            {
                return this._facetMapping;
            }

            this._facetMapping = value;

            this.onFacetMappingChanged();
        }

        onFacetMappingChanged()
        {
            var fm = this._facetMapping;

            this._bpsHelper.setFacetMapping(fm);

            vp.select("#facetText")
                .css("font-style", (fm.colName) ? "italic" : "normal");

            vp.select("#facetBins")
                .css("display", (fm.colName) ? "" : "none");

            var colName = (fm.colName) ? fm.colName : "";
            this.setBigValue("Facet", colName);
            //vp.select("#bbFacetValue").text(colName);

            this.onDataChanged("facetMapping");
        }

        getPreloadField(colName: string)
        {
            var pf = <bps.PreloadField>null;
            var preload = this._fileOpenMgr.preload();

            if (preload && preload.fieldList)
            {
                var fieldList = preload.fieldList;

                for (var i = 0; i < fieldList.length; i++)
                {
                    if (fieldList[i].name === colName)
                    {
                        pf = fieldList[i];
                        break;
                    }
                }
            }

            return pf;
        }

        setMappingDataFormatting(md: bps.MappingData)
        {
            var formatting = null;

            if (md.colName)
            {
                var pf = this.getPreloadField(md.colName);
                if (pf)
                {
                    formatting = pf.formatting;
                }
            }

            md.formatting = formatting;
        }

        sizeMapping(value?: bps.SizeMappingData)
        {
            if (arguments.length === 0)
            {
                return this._sizeMapping;
            }

            this._sizeMapping = value;

            this.onSizeMappingChanged();
        }

        textMapping(value?: bps.TextMappingData)
        {
            if (arguments.length === 0)
            {
                return this._textMapping;
            }

            this._textMapping = value;

            this.onTextMappingChanged();
        }

        lineMapping(value?: bps.LineMappingData)
        {
            if (arguments.length === 0)
            {
                return this._lineMapping;
            }

            this._lineMapping = value;

            this.onLineMappingChanged();
        }

        imageMapping(value?: bps.ImageMappingData)
        {
            if (arguments.length === 0)
            {
                return this._imageMapping;
            }

            this._imageMapping = value;

            this.onImageMappingChanged();
        }

        onTextMappingChanged()
        {
            var tm = this._textMapping;

            this._bpsHelper.setTextMapping(tm);

            this.setBigValue("Text", tm.colName);

            this.onDataChanged("textMapping");
        }

        onLineMappingChanged()
        {
            var lm = this._lineMapping;

            this._bpsHelper.setLineMapping(lm);

            this.setBigValue("Line", lm.colName);

            this.onDataChanged("lineMapping");
        }

        onImageMappingChanged()
        {
            var im = this._imageMapping;
            im.imagePalette = ["filled circle", "filled square", "filled triangle", "circle", "square", "triangle"];

            var colInfo = this.getColInfo(im.colName);
            PaletteHelper.buildImageBreaksFromSettings(im, colInfo, settings._useNiceNumbers);

            this._bpsHelper.setImageMapping(im);

            vp.select("#imageText")
                .css("font-style", (im.colName) ? "italic" : "normal");

            var colName = (im.colName) ? im.colName : "";
            this.setBigValue("Shape", colName);

            //vp.select("#imageAdj")
            //    .css("display", (im.colName) ? "" : "none");

            this.onDataChanged("imageMapping");

            this.onLegendsChanged();
        }

        onSizeMappingChanged()
        {
            var sm = this._sizeMapping;
            sm.sizePalette = [.25, .5, .75, 1];

            var colInfo = this.getColInfo(this._sizeMapping.colName);
            PaletteHelper.buildSizeBreaksFromSettings(this._sizeMapping, colInfo, settings._useNiceNumbers);

            this._bpsHelper.setSizeMapping(sm);

            vp.select("#sizeText")
                .css("font-style", (sm.colName) ? "italic" : "normal");

            var colName = (sm.colName) ? sm.colName : "";
            this.setBigValue("Size", colName);
            //vp.select("#bbSizeValue").text(colName);

            this.onDataChanged("sizeMapping");
            this.onLegendsChanged();
        }

        colorMapping(value?: bps.ColorMappingData)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping;
            }

            this._currentColorMapping = value;

            this.onColorMappingChanged(false);
        }

        getColInfo(colName: string)
        {
            var colInfo = <bps.ColInfo> {};

            for (var i = 0; i < this._colInfos.length; i++)
            {
                var ci = this._colInfos[i];
                if (ci.name === colName)
                {
                    colInfo = ci;
                    break;
                }
            }

            return colInfo;
        }

        getColType(colName: string)
        {
            var colInfo = this.getColInfo(colName);
            var colType:string = (colInfo) ? colInfo.colType : null;

            return colType;
        }

        onColorMappingChanged(rebuildPalette: boolean, rebindColInfo?: boolean)
        {
            var cm = this._currentColorMapping;
            if (!cm)
            {
                //---- create temp cm for bps call ----
                cm = new bps.ColorMappingData(null, false, 0);
                cm.colName = null;
            }

            if (rebuildPalette)
            {
                var palette = beachParty.colorPalettesClass.getPaletteFromSettings(cm.paletteName, cm.stepsRequested, cm.isReversed);
                cm.colorPalette = palette;
            }

            //---- use the currently bound FILTERED-IN data set, if available ----
            var colInfo = cm.boundColInfo;
            if (rebindColInfo || !colInfo || colInfo.name !== cm.colName)
            {
                //---- REBIND colInfo to current filter setting ----
                colInfo = this.getColInfo(cm.colName);
                cm.boundColInfo = colInfo;
            }

            if (rebuildPalette || rebindColInfo)
            {
                PaletteHelper.buildColorBreaks(cm, colInfo, settings._useNiceNumbers);
            }

            this._bpsHelper.setColorMapping(cm);

            this.setBigValue("Color", cm.colName);
            //vp.select("#bbColorValue").text((cm.colName) ? cm.colName : "");

            vp.select("#colorText")
                .css("font-style", (cm.colName) ? "italic" : "normal");

            this.onDataChanged("colorMapping");
            this.onDataChanged("rebuildColorPaletteList");

            this.onLegendsChanged();
        }

        onXMappingChanged()
        {
            var xm = this._xMapping;

            this._bpsHelper.setXMapping(xm);

            vp.select("#xText").text("X: " + xm.colName);
            this.setBigValue("X", xm.colName);

            this.onDataChanged("xMapping");
        }

        /** since Y label is rotated 90 degrees, it needs some manual layout. */
        onYMappingChanged()
        {
            var ym = this._yMapping;

            this._bpsHelper.setYMapping(ym);

            //--- wierd layout issues - try a timer ----
            vp.select("#yText").text("Y: " + ym.colName);
            this.setBigValue("Y", ym.colName);

            this.manualLayoutForYStuff();

            this.onDataChanged("yMapping");
        }

        onZMappingChanged()
        {
            var zm = this._zMapping;

            this._bpsHelper.setZMapping(zm);
            var colName = (zm) ? zm.colName : "";

            vp.select("#zText").text("Z: " + colName);
            this.setBigValue("Z", colName);

            this.onDataChanged("zMapping");
        }

        manualLayoutForYStuff()
        {
            var rc = vp.select("#yText").getBounds(false);
            var textHeight = (rc) ? rc.height : 0;

            //---- adjust position of chevron due to y text rotation ----
            var chevTop = textHeight / 2 - 15;

            vp.select("#yChevron")
                .css("position", "relative")
                .css("left", "50px")
                .css("top", chevTop + "px");

            //---- adjust yButton to correct size, so that background (hover) will cover the text and chevron correctly ----
            var buttonTop = -(10 + textHeight / 2);

            vp.select("#yButton")
                .css("width", "35px")
                .css("height", textHeight + "px")
                .css("position", "relative")
                .css("top", buttonTop + "px")
                .css("left", "0px");

            //---- adjust position of y bin numAdjuster to be under the name ----
            var binTop = 4 - (textHeight / 2);
            vp.select("#yBins")
                .css("top", binTop + "px")
                .css("left", "2px");
        }

        facetBins(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._facetMapping.binCount;
            }

            this._facetMapping.binCount = value;
            this.onFacetMappingChanged();

            //this._bpsHelper.setFacetMapping(this._facetMapping);

            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.facetMapping, true, "binCount", value + "");

            this.onDataChanged("facetBins");
        }

        facetColumn(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._facetMapping.colName;
            }

            this._facetMapping.colName = value;
            this.setMappingDataFormatting(this._facetMapping);

            this.onFacetMappingChanged();

            //this._bpsHelper.setFacetMapping(this._facetMapping);

            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.facetMapping, true, "colName", value + "");

            this.onDataChanged("facetColumn");
        }

        onAppShapeOpacityChanged()
        {
            this._vsCurrent.shapeOpacity = settings._shapeOpacity;
        }

        textOpacity(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._textOpacity;
            }

            this._textOpacity = value;

            this._bpsHelper.setTextOpacity(value);
            this.onDataChanged("textOpacity");
        }

        toPercentOverride(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._toPercentOverride;
            }

            this._toPercentOverride = value;

            if (this._isAnimOverride)
            {
                this._bpsHelper.setToPercentOverride(value);
            }

            this.onDataChanged("toPercentOverride");
        }

        onAppPlaybackDurationChanged()
        {
            this._insightMgr.playbackDuration(settings._playbackDuration);
        }

        onAppPlaybackLoopngChanged()
        {
            this._insightMgr.isPlaybackLooping(settings._isPlaybackLooping);
        }

        infoMsg(msg: string)
        {
            this.showInfoMsg("Information", msg);
        }

        showError(msg: any)
        {
            if (msg.name !== undefined && msg.message !== undefined)
            {
                //---- from try/catch error object ----
                msg = msg.name + "\r\n" + msg.message;
            }
            else if (msg.errorMsg !== undefined && msg.errorUrl !== undefined)
            {
                //---- from engineError (appMgr.onerror) ----
                msg = msg.errorMsg + "\r\nLine " + msg.errorLineNum + " in " + msg.errorUrl;
            }

            //---- remove "Error: " suffix since we will use the title to display that ----
            if (msg.startsWith("Error: \r\n"))
            {
                msg = msg.substr(7).trim();
            }

            if (msg.startsWith("\r\n"))
            {
                msg = msg.substr(2).trim();
            }

            this.showInfoMsg("Error", msg);
        }

        showInfoMsg(title: string, msg: string)
        {
            vp.select("#infoMsgTitle")
                .text(title);

            var str = msg.replace(/\r\n/g, "<br />");

            vp.select("#infoMsgText").html(str);

            vp.select("#infoMsgBox")
                .css("max-width", (window.innerWidth - 50) + "px")
                .css("display", "");      // show

            vp.utils.debug("showInfoMsg: msg=" + msg);

            //---- set timer to hide after 15 secs ----
            //this.cancelErrorTimer();

            //this._infoMsgTimer = setTimeout((e) =>
            //{
            //    vp.select("#infoMsgBox").css("display", "none"); 
            //}, 15 * 1000);
        }

        cancelErrorTimer()
        {
            if (this._infoMsgTimer)
            {
                clearTimeout(this._infoMsgTimer);
                this._infoMsgTimer = null;
            }
        }

        openErrorPanel()
        {
            var left = 300;
            var top = 100;

            buildJsonPanel(null, this, "errorPanel", true, left, top, undefined, undefined);
        }

        searchCol(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._searchCol;
            }

            if (value !== this._searchCol)
            {
                this._searchCol = value;

                //this._bpsHelper.search(this._searchCol, this._searchValue);

                vp.select("#searchCol")
                    .text(value);

                this.onDataChanged("searchCol");
                this.onSearchParamsChanged();
            }
        }

        searchValue(legendSource: string, value?: string, searchType = bps.TextSearchType.startsWith, forceSet?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._searchValue;
            }

            if (forceSet || value !== this._searchValue)
            {
                value = value || "";

                this._searchValue = value;

                this.onSearchParamsChanged(searchType);

                this.onDataChanged("searchValue");
            }
        }

        onSearchParamsChanged(searchType = bps.TextSearchType.startsWith)
        {
            if (this._searchValue)
                {
                this._bpsHelper.search(this._searchCol, this._searchValue, null, searchType);
                }
        }

        isAnimOverride(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isAnimOverride;
            }

            this._isAnimOverride = value;

            this._bpsHelper.setAnimOverride(value);
            this.onDataChanged("isAnimOverride");
        }

        createShapesUrl(shapeTypes: string[])
        {
            var count = shapeTypes.length;
            var szPixels = 32;
            var width = szPixels * count;
            var height = szPixels;

            //---- create canvas we can draw on ----
            var canvasW = vp.select(document.body).append("canvas")
                .attr("width", width)
                .attr("height", height);

            //---- get drawing context ----
            var canvas = <HTMLCanvasElement>canvasW[0];
            var ctx = canvas.getContext("2d");

            //---- draw the circle ----
            ctx.clearRect(0, 0, width, height);
            var x = 0;
            var y = 0;

            for (var i = 0; i < shapeTypes.length; i++)
            {
                var shapeType = shapeTypes[i];

                this.drawShapeType(ctx, shapeType, x, y, szPixels, szPixels);

                x += szPixels;
            }

            var imgSrc = canvas.toDataURL();

            //---- remove the canvas ----
            document.body.removeChild(canvas);

            return imgSrc;
        }

        drawShapeType(ctx: CanvasRenderingContext2D, shapeType: string, x: number, y: number, width: number, height: number)
        {
            if (shapeType === "filled square")
            {
            }

            // var r = size / 2 - strokeSize / 2;
            //ctx.beginPath();
            //ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI, false);

            //if (strokeSize != 0)
            //{
            //    ctx.lineWidth = strokeSize;
            //    ctx.strokeStyle = "white";
            //    ctx.stroke();
            //}
            //else
            //{
            //    ctx.fillStyle = "white";
            //    ctx.fill();

            //    //ctx.font = "50px Tahoma";
            //    //ctx.fillText("x", 0, 0);
            //}
        }

        onAppShapeColorChanged()
        {
            if (this._currentColorMapping)
            {
                this._currentColorMapping.colName = null;
            }

            this.onColorMappingChanged(false);
        }

        sizeFactor(value?: number, animate?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._sizeFactor;
            }

            this._sizeFactor = value;

            this._bpsHelper.setSizeFactor(value, animate);
            this.onDataChanged("sizeFactor");
        }

        separationFactor(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._separationFactor;
            }

            this._separationFactor = value;

            //---- record changed size for this chart ----
            this._bpsHelper.setSeparationFactor(value);
            this.onDataChanged("separationFactor");
        }

        buildPaletteDiv(palette: string[], showSteps: boolean)
        {
            var anyPalette = <any> palette;

            var itemW = vp.select(document.createElement("div"))
                .addClass("listColorPaletteItem");

            var divW = itemW.append("span")
                .addClass("listColorPalette");

            var textW = itemW.append("span")
                .addClass("listColorPaletteName")
                .text(anyPalette.name);

            if (anyPalette.name === this._currentColorMapping.paletteName)
            {
                textW
                    .addClass("listColorPaletteNameSelected");
            }

            var paletteCount = this._currentColorMapping.stepsRequested;
            var entryWidth = (150 / paletteCount);      // - 1;

            if (showSteps)
            {
                for (var i = 0; i < palette.length; i++)
                {
                    var bgColor = vp.color.colorFromPalette(palette, i);

                    var entryW = divW.append("span")
                        .addClass("listColorPaletteEntry")
                        .css("width", entryWidth + "px")
                        // .css("height", entryHeight + "px")
                        .css("margin", "0px")
                        .css("padding", "0px")
                        .css("background", bgColor);

                    str += ", " + palette[i];
                }
            }
            else
            {
                //---- linear gradient, from left to right ----
                var str = "";
                for (var i = 0; i < palette.length; i++)
                {
                    var bgColor = vp.color.colorFromPalette(palette, i);
                    str += ", " + bgColor;
                }

                var width = palette.length * entryWidth;

                var entryW = divW.append("span")
                    .addClass("listColorPaletteGradient")
                    // .css("height", entryHeight + "px")
                    .css("width", width + "px")
                    .css("background", "linear-gradient(to right" + str + ")");
            }

            return itemW[0];
        }

        /** used to build palette list in colorPanel. */
        getColorPaletteEntry(index: number)
        {
            var entryElem = null;
            var cm = this._currentColorMapping;

            if (cm)
            {
                var showSteps = (!cm.isContinuous);

                //---- return HTML for custom list item ----
                var palettes = this.getColorPalettes();

                var palette = (index >= palettes.length) ? null : palettes[index];

                if (palette)
                {
                    entryElem = this.buildPaletteDiv(palette, showSteps);
                }
            }

            return entryElem;
        }

        getColorPalettes()
        {
            var palettes = null;

            var cm = this._currentColorMapping;
            var steps = cm.stepsRequested;
            if (!schemeType)
            {
                schemeType = "sequential";          // default
            }

            var reverse = cm.isReversed;           // by default, dark to light (low values to high values)

            while (steps >= 1)
            {
                palettes = beachParty.colorPalettesClass.getPalettesFromColorSchemeType(schemeType, steps, reverse);
                if (palettes && palettes.length)
                {
                    break;
                }

                steps--;
            }

            return palettes;
        }

        colorPaletteIndex(index: number)
        {
            if (arguments.length === 0)
            {
                return 0;       // not known
            }

            var palettes = this.getColorPalettes();
            var palette = palettes[index];

            this.colorPalette(palette);

            //---- tell the color panel that a user action just happened ----
            this._colorPanel.onUserAction();

            this.onDataChanged("colorPaletteIndex");
        }

        colorPalette(value?: any)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping.colorPalette;
            }

            this._currentColorMapping.colorPalette = value;
            this._currentColorMapping.paletteName = value.name;

            this.onDataChanged("colorPalette");
            //this.onDataChanged("paletteName");

            this.onColorMappingChanged(true);       // false);
        }

        onShowColorLegendChanged()
        {
            this._colorLegend.show(this._showColorLegend);
        }

        buildLegends()
        {
            //---- COLOR legend ----
            var colorLegend = new ColorLegendClass(this, "colorLegend", this._bpsHelper);
            this._colorLegend = colorLegend;
            colorLegend.registerForChange("colorPanelRequest", (e) =>
            {
                this.onColorPanelClick(null, true);
            });

            beachParty.connectModelView(this, "colorMapping", colorLegend, "colorMapping");

            //---- SIZE legend ----
            var sizeLegend = new SizeLegendClass(this, "sizeLegend", this._bpsHelper);
            this._sizeLegend = sizeLegend;
            sizeLegend.registerForChange("sizePanelRequest", (e) =>
            {
                this.onSizeClick(e, true);
            });

            beachParty.connectModelView(this, "sizeMapping", sizeLegend, "sizeMapping");

            //---- IMAGE legend ----
            var imageLegend = new ImageLegendClass(this, "imageLegend", this._bpsHelper);
            this._imageLegend = imageLegend;
            imageLegend.registerForChange("imagePanelRequest", (e) =>
            {
                this.onImageClick(null, true);
            });

            beachParty.connectModelView(this, "imageMapping", imageLegend, "imageMapping");

            //---- TEXT legend ----
            var textLegend = new TextLegendClass("textLegend", this._textMapping);
            this._textLegend = textLegend;

            beachParty.connectModelView(this, "textMapping", textLegend, "textMapping");

            ////---- FACET legend ----
            //var facetLegend = new facetLegendClass("facetLegend", this._facetMapping);
            //this._facetLegend = facetLegend;

            //facetLegend.registerForChange("facetColPickerRequest", (e) =>
            //{
            //    this.onFacetClick(e);
            //});

            ////---- for now, don't show facet legend ----
            //beachParty.connectModelView(this, "facetMapping", facetLegend, "facetMapping");
        }

        loadAutomatedTest()
        {
//             localFileHelper.loadFile(".js", (text, fn) => 
//             {
//                 try
//                 {
//                     eval(text);         // this will set window.beachPartyTest
// 
//                     settings.automatedTestName(fn);
//                 }
//                 catch (ex)
//                 {
//                     throw ("Error parsing test file: " + ex);
//                 }
//             });
        }

        buildBinAdjusters()
        {
            //---- FACET bins ----
            this._facetBinAdjuster = new NumAdjusterClass("facetBins", "Bins", this.facetBins(), 1, 99, "The number of facet bins to create.  Drag in circle to change.",
                AdjusterStyle.right, true, false, true);

            beachParty.connectModelView(this, "facetBins", this._facetBinAdjuster, "value");

            ////---- SIZE FACTOR ----
            //this._sizeFactorAdjuster = new numAdjusterClass("sizeFactorAdj", "Size", this._sizeFactor, 0, 10, "Adjust the relative size of the shapes.  Drag in circle to change.",
            //    AdjusterStyle.right, false, true, true);

            //beachParty.connectModelView(this, "sizeFactor", this._sizeFactorAdjuster, "value");

            ////---- when user does a mouse up (at end of size change), request a full chart rebuild ----
            //this._sizeFactorAdjuster.registerForChange("valueMouseUp", (e) =>
            //{
            //    this.sizeFactor(this._sizeFactor, false);

            //    this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.sizeFactor, true, "value",
            //        this._sizeFactor + "");
            //});

            //---- OPACITY adjuster ----
            this._opacityAdjuster = new NumAdjusterClass("opacityAdj", "Opacity", settings._shapeOpacity, 0, 1, "Adjust the opacity of the shapes.  Drag in circle to change.",
                AdjusterStyle.right, false, true);

            beachParty.connectModelView(settings, "shapeOpacity", this._opacityAdjuster, "value");

            //---- only log (and undo) the value on the dial's mouse up event ----
            this._opacityAdjuster.registerForChange("valueMouseUp", (e) =>
            {
                this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.shapeOpacity, true, "value",
                    settings._shapeOpacity+ "");
            });

            ////---- TEXT OPACITY adjuster ----
            //this._textOpacityAdjuster = new numAdjusterClass("textOpacityAdj", "Opacity", this._textOpacity, 0, 1, "Adjust the opacity of the text.  Drag in circle to change.",
            //    AdjusterStyle.right, false, true);

            //beachParty.connectModelView(this, "textOpacity", this._textOpacityAdjuster, "value");

            //---- X bins ----
            this._xBinAdjuster = new NumAdjusterClass("xBins", "Bins", this.xBins(), 1, 999, "The number of X-axis bins to create.  Drag in circle to change.",
                AdjusterStyle.bottom, true, false, true);

            beachParty.connectModelView(this, "xBins", this._xBinAdjuster, "value");

            //---- Y bins ----
            this._yBinAdjuster = new NumAdjusterClass("yBins", "Bins", this.yBins(), 1, 999, "The number of Y-axis bins to create.  Drag in circle to change.",
                AdjusterStyle.left, true, false, true);

            beachParty.connectModelView(this, "yBins", this._yBinAdjuster, "value");

            //---- Z bins ----
            this._zBinAdjuster = new NumAdjusterClass("zBins", "Bins", this.zBins(), 1, 10,
                "The number of z bins to create.  Drag in circle to change.", AdjusterStyle.left, true, false, false);

            beachParty.connectModelView(this, "zBins", this._zBinAdjuster, "value");

        }

        logAction(gesture: Gesture, elementId: string, elementType: ElementType, action: Action, target: Target, isUndoable: boolean,
            name1 = "", value1="", name2="", value2="", name3="", value3="", name4="", value4="")
        {
            //---- only log when past first data load and outside of a "load insight" operation ----
            if (this._isLoggingEnabled)
            {
                var sessionId = this._machineId + "-" + AppClass.buildId + "-" + this._sessionId;
                var strGesture = Gesture[gesture];
                var strElementType = ElementType[elementType];
                var strAction = Action[action];
                var strTarget = Target[target];

                beachParty.logActionToServer(sessionId, strGesture, elementId, strElementType, strAction, strTarget, name1, value1, name2, value2,
                    name3, value3, name4, value4);

                //---- build "tip" for insight and debugging ----
                var tip = strAction + "-" + strTarget;
                if (name1)
                {
                    tip = this.appendTip(tip, name1, value1);
                }
                if (name2)
                {
                    tip = this.appendTip(tip, name2, value2);
                }
                if (name3)
                {
                    tip = this.appendTip(tip, name3, value3);
                }
                if (name4)
                {
                    tip = this.appendTip(tip, name4, value4);
                }
                vp.utils.debug("logAction: tip=" + tip);

                if (isUndoable && gesture !== Gesture.system)
                {
                    this.createInsight(false, false, (insight) =>
                    {
                        this._undoMgr.push(insight, tip);
                    });
                }
            }
        }

        appendTip(tip: string, name: string, value: string)
        {
            if (!tip.contains("="))
            {
                tip += ": ";
            }
            else 
            {
                tip += ", ";
            }

            tip += name + "=" + value;

            return tip;
        }

        requestFullChartBuild()
        {
            this.onXMappingChanged();     // will trigger full build
        }

        toggleAppPanel(e)
        {
            var isOpen = this.isAppPanelOpen();
            if (isOpen)
            {
                this.closeAppPanel();
                var action = Action.close;
            }
            else
            {
                this.openAppPanel(e);
                var action = Action.open;
            }

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.appPanel, true);
            }
        }

        openAppPanel(e)
        {
            this._appPanel = buildJsonPanel("btSettings", settings, "appSettings", true);

            this._appPanel.registerForChange("close", (e) =>
            {
                this._appPanel = null;
            });

        }

        closeAppPanel()
        {
            if (this._appPanel)
            {
                this._appPanel.close();
                this._appPanel = null;
            }
        }

        onBeachPartyClick(e)
        {
            this.toggleAppPanel(e);
        }

        onSortClick(e)
        {
            this.toggleSortPanel(e);
        }

        toggleSortPanel(e)
        {
            var isOpen = this.isSortPanelOpen();
            if (isOpen)
            {
                this.closeSortPanel();
                var action = Action.close;
            }
            else
            {
                this.openSortPanel();
                var action = Action.open;
            }

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.sortPanel, true);
            }
        }

        openSortPanel()
        {
            var rc = vp.select("#bbSort").getBounds(true);

            this._sortPanel = buildJsonPanel("bbSort", this, "sorting", true, rc.left, rc.bottom, undefined, undefined,
            undefined, undefined, undefined, true);
            
            //---- adjust height of column picker so it doesn't exceed height of panel ----
            var panelMaxHeight = AppClass.maxPanelHeight;
            var maxListHeight = panelMaxHeight - 165;

            var panelRoot = this._sortPanel.getRootElem();
            var contentW = vp.select(panelRoot, "#tab0Content");

            vp.select(contentW[0], ".listBox")
                .css("max-height", maxListHeight + "px");
            
            this._sortPanel.registerForChange("close", (e) =>
            {
                this._sortPanel = null;
            });

        }

        closeSortPanel()
        {
            if (this._sortPanel)
            {
                this._sortPanel.close();
                this._sortPanel = null;
            }
        }

        onSettingsClick(e)
        {
        }

        /** At some point, we might want to support opening of multiple slicer panels. */
        onSlicerClick(e)
        {
            this.toggleSlicerPanel(e);
        }

        toggleSlicerPanel(e)
        {
            var isOpen = this.isSlicerPanelOpen();
            if (isOpen)
            {
                this.closeSlicerPanel();
                var action = Action.close;
            }
            else
            {
                this.openSlicerPanel(e);
                var action = Action.open;
            }

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.slicerPanel, true);
            }
        }

        openSlicerPanel(e)
        {
            var colName = vp.select("#searchCol").text();

            this.openSlicerCore(colName);
        }

        openSlicerCore(colName: string, value?: string, toggleOpen = true)
        {
            var rc = vp.select("#selectedCountText").getBounds(false);
            var left = rc.left;
            var top = rc.bottom;
            this.slicerColName(colName);
            this._slicerInitialValue = value;

            var panel = buildJsonPanel(null, this, "slicer", true, left, top, undefined, undefined, toggleOpen);
            this._slicerPanel = panel;

            if (panel)
            {
                //---- must set initial colName, since it is not a known data binding to the jsonPanel ----
                var slicerControl = <SlicerControlClass> panel.getControlById("slicer");
                this._slicerControl = slicerControl;

                slicerControl.colName(colName);

                slicerControl.registerForChange("selectedValue", (e) =>
                {
                    var sp = slicerControl.getSearchParams();

                    this._bpsHelper.search(sp.colName, sp.minValue, sp.maxValue, sp.searchType, sp.searchAction, sp.searchRawValues);
                });

                slicerControl.registerForChange("slicerColName", (e) =>
                {
                    var colName = slicerControl.colName();
                    this.slicerColName(colName);
                });

                slicerControl.registerForChange("tagDelimiter", (e) =>
                {
                    this.rebinDataForSlicer();
                });

                this._slicerPanel.registerForChange("close", (e) =>
                {
                    this._slicerPanel = null;
                });
            }
        }

        doSearch(legendSource: string, colName: string, minValue: any, maxValue: any, searchType: bps.TextSearchType)
        {
            var sp = new bps.SearchParams();
            sp.colName = colName;
            sp.minValue = minValue;
            sp.maxValue = maxValue;
            sp.searchType = searchType;

            var sd = new SelectionDesc();
            sd.searchParams = sp;
            sd.legendSource = legendSource;
            sd.selectMode = this._selectionMode;

            this._selectionDesc = sd;

            this._bpsHelper.search(colName, minValue, maxValue, searchType);
        }

        closeSlicerPanel()
        {
            if (this._slicerPanel)
            {
                this._slicerPanel.close();
                this._slicerPanel = null;
            }
        }

        /** User did pointer-down on dataTip icon: create a new datatip that user can drag. */
        onNewDataTipDown(e)
        {
            var dataTipIcon = vp.select("#dataTipIcon")[0];
            var offset = vp.events.mousePosition(e, dataTipIcon);

            //---- adjust for some offset around icon ----
            offset.x -= 4;
            offset.y -= 4;

            var colName = vp.select("#searchCol").text();

            var dataTip = this._dataTipMgr.addDataTip(colName);

            dataTip.startDrag(e, offset);
        }

        onDetailsClick(e)
        {
            this.toggleDetailsPanel(e);
        }

        imgUrlToBlob(url: string, callback)
        {
            var img = new Image();
            img.onload = (e) =>
            {
                //---- draw image onto canvas ----
                var canvas = <HTMLCanvasElement>document.createElement("canvas");
                canvas.setAttribute("width", img.width+"");
                canvas.setAttribute("height", img.height+"");

                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);

                var blob = null;

                if (canvas.msToBlob) {
                    blob = canvas.msToBlob();
                }

                callback(blob);
            };

            img.src = url;
        }

        onSnapshotClick(e)
        {
            /// NOTE: insight stored in undoMgr doesn't have images 
            //var insight = this._undoMgr.getCurrentInsight();

            this.createInsight(true, false, (insight) =>
            {
                //---- both of the below methods work - we prefer PNG output (so we use 2nd one) ----

                ////---- adjust imgUrl to real base64 bit string (remove funky header) ----
                //var imgUrl = insight.imageAsUrl;
                //imgUrl = imgUrl.substr(imgUrl.indexOf(",") + 1);
                //localFileHelper.saveBase64ToLocalFile("snapshot-" + appClass.nextSnapShotNum + ".jpg", imgUrl, "image/jpeg");

                this.imgUrlToBlob(insight.imageAsUrl, (blob) =>
                {
                    LocalFileHelper.saveBlobToLocalFile("snapshot-" + AppClass.nextSnapShotNum + ".png", blob, "image/png");
                });

                AppClass.nextSnapShotNum++;
            });

        }

        toggleDetailsPanel(e)
        {
            var isOpen = this.isDetailsPanelOpen();
            if (isOpen)
            {
                this.closeDetailsPanel();
                var action = Action.close;
            }
            else
            {
                this.openDetailsPanel();
                var action = Action.open;
            }

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.detailsPanel, true);
            }
        }

        closeDetailsPanel()
        {
            if (this._detailsPanel)
            {
                this._detailsPanel.close();
                this._detailsPanel = null;
            }
        }

        openDetailsPanel()
        {
            var rc = vp.select("#detailsButton").getBounds(true);
            var left = rc.left;
            var top = rc.bottom;

            var detailsPanel = buildJsonPanel(null, this, "details", true, left, top, undefined, undefined);
            detailsPanel.applyAppPanelOpacity();
            this._detailsPanel = detailsPanel;

            var recordView = <RecordViewClass>detailsPanel.getControlById("recordView");

            //recordView.registerForChange("selectedValue", (e) =>
            //{
            //    //---- process SEARCH request ----
            //    var colName = recordView.selectedColName();
            //    var value = recordView.getSelectedValue();
            //    this._bpsHelper.search(colName, value, null, bps.TextSearchType.exactMatch);
            //});

            this.registerForChange("dataFrame", (e) =>
            {
                recordView.colInfos(this._colInfos);
            });

            //---- set focus to panel so it can immediately respond to pageup, etc. ----
            var rvElem = recordView.getRootElem();
            rvElem.focus();

            //vp.select(rvElem)
            //    .css("max-height", innerHeight * .8+"")          // limit to 75% of window, so it can still be moved around comfortably

            recordView.colInfos(this._colInfos);

            detailsPanel.registerForChange("close", (e) =>
            {
                this._detailsPanel = null;
            });
        }

        onSelectedCountClick(e)
        {
            this._bpsHelper.clearSelection();

            this.logAction(Gesture.click, e.target.id, ElementType.button, Action.clear, Target.selection, true);
        }

        onFilteredInCountClick(e)
        {
            this._bpsHelper.resetFilter();

            this.logAction(Gesture.click, e.target.id, ElementType.button, Action.clear, Target.filterAndSelection, true);
        }

        createSpacer(trW: vp.dom.singleWrapperClass, spaceCount = 1)
        {
            trW.append("td")
                .addClass((spaceCount === 1) ? "iconBarSpacer" : "iconBarSpacer2");
        }

        /** add icon, with text under it at specified div.  if "addChevron" is true, add a dropdown icon to the right. */
        createIconTextPair(trW: vp.dom.singleWrapperClass, callbackName: string, rootName: string, tooltip: string, imgSrc: string, text: string, addChevron?: boolean, isDisabled?: boolean,
            isLeftAligned?: boolean, isRotated?: boolean)
        {
            var tdW = trW.append("td");

            if (!settings._isMenuTextVisible && !settings._isMenuChevronVisible)
            {
                //---- ICON ONLY button ----
                tdW
                    .title(tooltip)
                    .id(rootName + "Button")
                    .addClass("iconOnlyHolder")
                    //.css("border", "1px solid green")
                    .attach("click", (e) =>
                    {
                        this[callbackName](e);
                    });

                tdW.append("div") //img
                    .id(rootName + "Img")
                    .addClass(imgSrc) //src
                    .addClass("clickIcon")
                    .addClass("iconBarIcon")
                    .css("display", "block")        // required to remove extraneous spaces!
                    //.css("border", "1px solid red")
                    .attach("dragstart", function (e)
                    {
                        //---- prevent drag of icon ----
                        e.preventDefault();
                    });
            }
            else
            {
                //---- ICON/TEXT COMBO ----
                tdW.append("span")
                    .id(rootName + "Button")
                    .attach("click", (e) =>
                    {
                        this[callbackName](e);
                    });

                this.addIconTextPair(rootName, tooltip, imgSrc, text, addChevron, isDisabled, isLeftAligned, isRotated);
            }
        }

        /** add icon, with text under it at specified div.  if "addChevron" is true, add a dropdown icon to the right. */
        addIconTextPair(rootName: string, tooltip: string, imgSrc: string, text: string, addChevron?: boolean, isDisabled?: boolean,
            isLeftAligned?: boolean, isRotated?: boolean)
        {
            var root = vp.select("#" + rootName + "Button")
                .addClass("iconTextCombo")
                .css("display", "inline-block")
                .title(tooltip);

            //---- TABLE/ROW for easier alignment ----
            var tableW = root.append("table");

            if (imgSrc)
            {
                //---- first row: IMG ----
                var tdW = tableW.append("tr").append("td")
                    .css("text-align", (isLeftAligned) ? "left" : "center");

                tdW.append("div")
                    .addClass("iconOfCombo")
                    .addClass(imgSrc)
                    .id(rootName + "Img")
                //.css("margin", (isLeftAligned) ? "0px" : "auto")
                    .attach("dragstart", function (e)
                    {
                        //---- prevent drag of icon ----
                        e.preventDefault();
                    });
            }

            //---- second row: TEXT ----
            var rowW = tableW.append("tr");

            rowW.append("td").append("div")
                .addClass("textOfCombo")
                .css("margin-top", "-0px")
                .css("text-align", (isLeftAligned) ? "left" : "center")
                .css("white-space", "nowrap")
                .id(rootName + "Text")
                .text(text);

            if (isDisabled)
            {
                this.disableIconButton(rootName, true);
            }

            if (addChevron)
            {
                //textW
                //    .css("margin-left", "6px")          // to balance centering for chevron

                rowW.append("td").append("div") //img
                    .addClass("chevronOfCombo")
                    .addClass("chevron-background")
                    //.attr("src", "Images/smallChevron3.png")
                    .css("margin-left", (isRotated) ? "-30px" : "-8px")
                    .id(rootName + "Chevron")
                    .attach("dragstart", function (e)
                    {
                        //---- prevent drag of icon ----
                        e.preventDefault();
                    });
            }
        }

        preventHtmlSelection()
        {
            //---- prevent HTML selection in our app ----

            //---- don't use this in its current forms - it prevents user text selection, which we want ----
            //hostControls.enableElementSelection(document.body, false);

            //---- this doesn't stop the majority of the select problems - not called when starting drag on background and moving over ----
            //---- things like buttons, images, text spans, textBoxes. ----
            //---- define a funtion to prevent select on all non-textbox/non-HTML elements ----

            //---- but, keep it for now - it does prevent selection issues when setting legend constant values by dragging mouse ----
            document.body.onselectstart = (e) =>
            {
                var tt = vp.select(e.target);
                var isTextBox = ((tt.is("input")) && (tt.attr("type") === "text"));

                var isSelectable = (isTextBox || tt.is("html") || tt.is("textarea"));

                vp.utils.debug("selectstart: isSelectable=" + isSelectable);

                return isSelectable;
            };

            //function preventNodeSelection(node)
            //{
            //    if (node.nodeType == 1)
            //    {
            //        node.setAttribute("unselectable", "on");
            //    }

            //    var child = node.firstChild;
            //    while (child)
            //    {
            //        preventNodeSelection(child);
            //        child = child.nextSibling;
            //    }
            //}

            //preventNodeSelection(document.body);
        }

        getKnownFiles()
        {
            var knownData = this._preloads;
            var knownFileItems = [];

            for (var i = 0; i < knownData.length; i++)
            {
                var kd = knownData[i];
                if (kd.showInFileOpen)
                {
                    if (this._edition === "client" && (kd.name === "AthensCa" || kd.name === "RainFall" || kd.name === "Pitches"))
                    {
                        continue;
                    }

                    //var mid = new MenuItemData(kd.name, kd.description, "images/anyData.png", false);
                    var mid = new MenuItemData(kd.name, kd.description, null, false, "8px 2px");
                    knownFileItems.push(mid);
                }
            }

            return knownFileItems;
        }

        isKnownFile(name: string)
        {
            var isKnown = false;

            if (this._preloads)
            {
                for (var i = 0; i < this._preloads.length; i++)
                {
                    if (this._preloads[i].name === name)
                    {
                        isKnown = true;
                        break;
                    }
                }
            }

            return isKnown;
        }

        getMappingCols(includeNone: boolean)
        {
            var colItems = [];

            for (var i = 0; i < this._colInfos.length; i++)
            {
                var colInfo = this._colInfos[i];

                var colName = colInfo.name;
                var colType = colInfo.colType;
                var desc = (colInfo.desc) ? colInfo.desc : "";

                var tooltip = "Name: " + colName + "\r\nType: " + colType + "\r\nDesc: " + desc;

                var imgClass = "fnColPickerString";

                if (colType === "number")
                {
                    imgClass = "fnColPickerNumber";
                }
                else if (colType === "date")
                {
                    imgClass = "fnColPickerDate";
                }

                colItems.push(new MenuItemData(colName, tooltip, imgClass, false));
            }

            if (settings._isColPickerSorted)
            {
                colItems.sort(function (a, b) { return (a.text < b.text) ? -1 : ((a.text === b.text) ? 0 : 1); });
            }

            if (includeNone)
            {
                colItems.insert(0, new MenuItemData("None", "Unmap this attribute", "fnColPickerNone", false));
                colItems[0].isNone = true;

                colItems.insert(1, new MenuItemData("-"));
            }

            return colItems;
        }

        createDataPicker(callback, ownerElem?: HTMLElement)
        {
            var knownFiles = this.getKnownFiles();
            var picker = this.createGeneralPicker(null, "dataPicker", knownFiles, callback, undefined, undefined, ownerElem);

            return picker;
        }

        getBinCountForColumn(colName: string)
        {
            var binCount = this._binCountForColumn[colName];
            if (binCount === undefined)
            {
                var colType = this.getColInfo(colName).colType;
                binCount = (colType === "string") ? AppClass.maxCategoryBins : AppClass.defaultNumericBins;
            }

            return binCount;
        }

        getMaxKeysForColumn(colName: string)
        {
            var maxKeys = null;

            if (colName)
            {
                var ci = this.getColInfo(colName);
                if (ci && ci.colType === "string")
                {
                    maxKeys = ci.max + 1;
                }
            }

            return maxKeys;
        }

        onSumByClick(e)
        {
            var picker = this.createColumnPicker("bbSum", true, (mid) =>
            {
                var colName = mid.text;

                //vp.select("#bbSumValue").text(colName);
                this.setBigValue("Sum", colName);
                this._sumByColumn = colName;

                this.onSumByChanged();

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.sumByMapping, true,
                    "colName", mid.text);
            });

            if (picker)
            {
                picker.changeRootClass("popupPanel");

                var rc = vp.select("#bbSum").getBounds(true);
                picker.show(rc.left, rc.bottom);
            }
        }

        onSumByChanged()
        {
            var colName = this._sumByColumn;
            var binCount = this.getBinCountForColumn(colName);

            if (colName)
            {
                if (this._chartName === "Column")
                {
                    this.changeYMapping(colName);
                    this.yBins(binCount);
                }
                else if (this._chartName === "Bar")
                {
                    this.changeXMapping(colName);
                    this.xBins(binCount);
                }

                this.changeToLayout("Sum", true);
            }
            else
            {
                this.changeToLayout("Grid", true);
            }

        }

        onChartOptionsClick(e)
        {
            this.openChartPanelCore();
            var action = Action.open;

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.chartPanel, true);
            }
        }

        /** Show CHART panel. */
        openChartPanelCore()
        {
            var rc = vp.select("#bbChart").getBounds(true);

            var chartPanel = buildJsonPanel("bbChart", settings, "chartSettings", true, rc.left, rc.bottom,
                undefined, undefined, undefined, undefined, undefined, true);

            this._chartPanel = chartPanel;

            chartPanel.registerForChange("close", (e) =>
            {
                this._chartPanel = null;
            });

            return chartPanel;
        }

        onFacetClick(e)
        {
            this.openFacetPanelCore();
            var action = Action.open;

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.facetPanel, true);
            }
        }

        onXClick(e, isFromLegend?: boolean)
        {
            this.openAxisPanelCore("bbX", "xButton", "xPanel", isFromLegend);
            var action = Action.open;

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.xPanel, true);
            }
        }

        onYClick(e, isFromLegend?: boolean)
        {
            this.openAxisPanelCore("bbY", "yButton", "yPanel", isFromLegend);
            var action = Action.open;

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.yPanel, true);
            }
        }

        onZClick(e, isFromLegend?: boolean)
        {
            this.openAxisPanelCore("bbZ", "zButton", "zPanel", isFromLegend);
            var action = Action.open;

            if (e)
            {
                this.logAction(Gesture.click, e.target.id, ElementType.button, action, Target.zPanel, true);
            }
        }

        /** Show X, Y, or Z panel. */
        openAxisPanelCore(bigButtonName: string, legendButtonName: string, panelName: string, isFromLegend?: boolean)
        {
            var x2 = undefined;
            var y2 = undefined;
            var x = undefined;
            var y = undefined;

            if (isFromLegend)
            {
                var rc = vp.select("#" + legendButtonName).getBounds(true);

                if (legendButtonName === "yButton")
                {
                    x = rc.right;
                    y = rc.top / 2;
                }
                else if (legendButtonName === "zButton")
                {
                    x = rc.right;
                    y2 = rc.bottom;     // should be top - why need to adjust?
                }
                else if (legendButtonName === "xButton")
                {
                    x = rc.left;
                    y2 = rc.top;
                }
            }
            else
            {
                var rc = vp.select("#" + bigButtonName).getBounds(true);
                var x = rc.left;
                var y = rc.bottom;
            }

            var buttonNames = bigButtonName + " " + legendButtonName;

            var axisPanel = buildJsonPanel(buttonNames, this, panelName, true, x, y,
                x2, y2, undefined, undefined, undefined, true);

            //this._facetPanel = xPanel;

            //---- adjust height of column picker so it doesn't exceed height of panel ----
            var panelMaxHeight = AppClass.maxPanelHeight;
            var maxListHeight = panelMaxHeight - 75;

            var panelRoot = axisPanel.getRootElem();
            var contentW = vp.select(panelRoot, "#tab0Content");

            vp.select(contentW[0], ".listBox")
                .css("max-height", maxListHeight + "px");

            axisPanel.registerForChange("close", (e) =>
            {
                //this._facetPanel = null;
            });

            return axisPanel;
        }

        /** Show facet panel. */
        openFacetPanelCore()
        {
            var rc = vp.select("#bbFacet").getBounds(true);

            var facetPanel = buildJsonPanel("bbFacet", this, "facet", true, rc.left, rc.bottom,
            undefined, undefined, undefined, undefined, undefined, true);

            this._facetPanel = facetPanel;

            //---- adjust height of column picker so it doesn't exceed height of panel ----
            var panelMaxHeight = AppClass.maxPanelHeight;
            var maxListHeight = panelMaxHeight - 75;

            var panelRoot = facetPanel.getRootElem();
            var contentW = vp.select(panelRoot, "#tab0Content");

            vp.select(contentW[0], ".listBox")
                .css("max-height", maxListHeight + "px");

            facetPanel.registerForChange("close", (e) =>
            {
                this._facetPanel = null;
            });

            return facetPanel;
        }

        /** Show color panel. */
        openColorPanel(isFromLegend?: boolean)
        {
            var x = undefined;
            var y = undefined;
            var x2 = undefined;
            var y2 = undefined;

            if (isFromLegend)
            {
                var rc = vp.select("#colorLegendTitle").getBounds(true);
                x2 = rc.left;
                y = rc.top;
            }
            else
            {
                var rc = vp.select("#bbColor").getBounds(true);
                x = rc.left;
                y = rc.bottom;
            }

            var colorPanel = buildJsonPanel("bbColor colorLegendTitle", this, "color", true, x, y, x2, y2,
                undefined, undefined, undefined, true);

            //---- allow colorPanel to be 80% of window height ----
            this._colorPanel = colorPanel;
            var maxHeight = window.innerHeight * .8;

            vp.select(colorPanel.getRootElem())
                .css("max-height", maxHeight + "px")
                .css("overflow-x", "hidden")  
                .css("overflow-y", "hidden");     // list already does needed scrolling;

            //---- adjust height of column picker so it doesn't exceed height of panel ----
            var maxListHeight = maxHeight - 100;       // for tab headers

            var panelRoot = colorPanel.getRootElem();
            var contentW = vp.select(panelRoot, "#tab0Content");

            vp.select(contentW[0], ".listBox")
                .css("max-height", maxListHeight + "px");
            
            colorPanel.registerForChange("close", (e) =>
            {
                this._colorPanel = null;
            }); 

            return colorPanel;
        }

        onColorPanelClick(e?: any, isFromLegend?: boolean)
        {
            this.toggleColorPanel(e, isFromLegend);
        }

        toggleColorPanel(e, isFromLegend?: boolean)
        {
            this.openColorPanel(isFromLegend);

            var id = (e) ? e.target.id : null;
            this.logAction(Gesture.click, id, ElementType.button, Action.open, Target.colorPanel, true);
        }

        closeColorPanel()
        {
            if (this._colorPanel)
            {
                this._colorPanel.close();
                this._colorPanel = null;
            }
        }

        closeFacetPanel()
        {
            if (this._facetPanel)
            {
                this._facetPanel.close();
                this._facetPanel = null;
            }
        }

        onSearchClick(e)
        {
            var text = vp.select("#searchText").value();
            var gesture = (e.keyCode) ? Gesture.keyDown : Gesture.click;

            //---- parse text for comparison or range operators ----
            var scanner = new vp.utils.scanner(text);
            var tokType = scanner.scan();

            if (tokType === vp.utils.TokenType.operator)
            {
                this.doOperatorSearch(e, "Search", gesture, scanner);
            }
            else if (tokType === vp.utils.TokenType.number)
            {
                //---- look for range ----
                var minValue = scanner.token();
                tokType = scanner.scan();
                var tok = scanner.token();

                //---- caution: if no space bewteen dash and number, scanner will treat as a negative number ----
                if (tok.startsWith("-"))
                {
                    this.doRangeSearch(e, "Search", gesture, minValue, scanner, tok);
                }
                else
                {
                    this.doValueSearch(e, "Search", gesture, text);
                }
            }
            else
            {
                this.doValueSearch(e, "Search", gesture, text);
            }
        }

        doValueSearch(e, legendSource: string, gesture: Gesture, text: string)
        {
            this.searchValue(legendSource, text, bps.TextSearchType.startsWith);

            this.logAction(gesture, e.target.id, ElementType.textBox, Action.adjust, Target.selection, true,
                "colName", this._searchCol, "value", text, "searchType", "startsWith");
        }

        doRangeSearch(e, legendSource: string, gesture: Gesture, minValue, scanner: vp.utils.scanner, tok: string)
        {
            if (tok.length > 1)
            {
                var maxValue = tok.substr(1).trim();
            }
            else
            {
                scanner.scan();
                var maxValue = scanner.token();
            }

            this.doSearch(legendSource, this._searchCol, minValue, maxValue, bps.TextSearchType.betweenInclusive);

            this.logAction(gesture, e.target.id, ElementType.textBox, Action.adjust, Target.selection, true,
                "colName", this._searchCol, "minValue", minValue, "maxValue", maxValue, "searchType", "betweenInclusive");
        }

        doOperatorSearch(e, legendSource: string, gesture: Gesture, scanner: vp.utils.scanner)
        {
            //---- <operator> <value> ----
            var tok = scanner.token();
            scanner.scan();
            var value = scanner.token();
            var op = null;

            if (tok === "<")
            {
                op = bps.TextSearchType.lessThan;
            }
            else if (tok === "<=")
            {
                op = bps.TextSearchType.lessThanEqual;
            }
            else if (tok === ">")
            {
                op = bps.TextSearchType.greaterThan;
            }
            else if (tok === ">=")
            {
                op = bps.TextSearchType.greaterThanEqual;
            }
            else if ((tok === "=") || (tok === "=="))
            {
                op = bps.TextSearchType.exactMatch;
            }
            else if ((tok === "!=") || (tok = "<>"))
            {
                op = bps.TextSearchType.notEqual;
            }

            if (op !== null)
            {
                //---- VALID OP ----
                //this.searchValue(value, op);
                this.doSearch(legendSource, this._searchCol, value, value, op);

                var gesture = (e.keyCode) ? Gesture.keyDown : Gesture.click;

                this.logAction(gesture, e.target.id, ElementType.textBox, Action.adjust, Target.selection, true,
                    "colName", this._searchCol, "value", value, "op", tok);
            }
            else
            {
                //---- UNRECOGNIZED OPERATOR ----
                this._bpsHelper.clearSelection();

                this.logAction(gesture, e.target.id, ElementType.textBox, Action.clear, Target.selection, true,
                    "colName", this._searchCol, "reason", "unrecognized expression", "text", scanner._str);
            }
        }

        onSearchColClick(e)
        {
            var picker = this.createColumnPicker("btSearchCol", false, (mid) =>
            {
                this.searchCol(mid.text);

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.searchCol, true, "colName", mid.text);

                var st = vp.select("#searchText")[0];
                st.focus();
            });

            if (picker)
            {
                var rcText = vp.select("#searchCol").getBounds(true);
                var rcMenu = vp.select("#generalColPicker").getBounds(true);

                var x = rcText.left - rcMenu.width;
                var y = rcText.top + 4;

                picker.show(x, y);
            }
        }

        createEnumPicker(enumType, callback, ownerElem?: HTMLElement, internalOwnerElement?: HTMLElement)
        {
            var pickerItems = vp.utils.keys(enumType);

            //---- capitalize the first letter of each enum name ----
            pickerItems = pickerItems.map((name) => AppUtils.capitalizeFirstLetter(name));

            //---- todo: what does this filter out? ----
            var pickerItems = pickerItems.filter((k) =>
            {
                return (isNaN(+k));
            });

            //---- some long list of enum values have separators in them; substitute a menu line marker ----
            var pickerItems = pickerItems.map((val) =>
            {
                return (val === "separator") ? "-" : val;
            });

            var picker = this.createGeneralPicker(null, "enumPicker", pickerItems, callback, undefined, undefined, ownerElem, internalOwnerElement);

            return picker;
        }

        createScrubberPicker(callback, ownerElem?: HTMLElement)
        {
            var items = this._fileOpenMgr.getPreloadNamesFromLocalStorage();
            items.insert(0, "None");

            var picker = this.createGeneralPicker(null, "scrubberPicker", items, callback, undefined,
                undefined, ownerElem);

            return picker;
        }

        createColumnPicker(openerIds: string, includeBlank: boolean, callback, ownerElem?: HTMLElement)
        {
            var colItems = this.getMappingCols(includeBlank);
            var verticalMargin = 5;
            var iconWidth = 20;

            var picker = this.createGeneralPicker(openerIds, "colPicker", colItems, (mid: MenuItemData) =>
            {
                if (mid.isNone)
                {
                    //---- replace "None" with "" ----
                    mid = vp.utils.copyMap(mid);
                    mid.text = "";
                }

                callback(mid);
            }, verticalMargin, iconWidth, ownerElem);

            return picker;
        }

        createColumnPickerList(parent: HTMLElement, includeBlank: boolean, callback)
        {
            var colItems = this.getMappingCols(includeBlank);
            var iconWidth = 20;

            var listBox = new ListBoxClass(parent, colItems, (mid: MenuItemData) =>
            {
                if (mid.isNone)
                {
                    //---- replace "None" with "" ----
                    mid = vp.utils.copyMap(mid);
                    mid.text = "";
                }

                callback(mid);
            }, iconWidth);

            return listBox;
        }

        createKnownDataPickerList(parent: HTMLElement, includeBlank: boolean, callback)
        {
            var colItems = this.getKnownFiles();
            var listBox = new ListBoxClass(parent, colItems, callback);

            vp.select(listBox._root)
                .id("knownDataPickerList");

            return listBox;
        }

        createColorPicker(includeTransparent: boolean, callback, ownerElem?: HTMLElement, internalOwnerElement?: HTMLElement)
        {
            var colItems = ["beach blue", "black", "blue", "gray", "green", "orange", "purple", "red", "violet", "white", "yellow"];

            if (includeTransparent)
            {
                colItems.push("none");
                colItems.sort();
            }

            var picker = this.createGeneralPicker(null, "colorPicker", colItems, callback, undefined, undefined, ownerElem, internalOwnerElement);

            return picker;
        }

        createShapePicker(callback, ownerElem?: HTMLElement, internalOwnerElement?: HTMLElement)
        {
            var colItems = ["none", "circle", "square", "triangle", "filled circle", "filled square", "filled triangle"];
            var picker = this.createGeneralPicker(null, "shapePicker", colItems, callback, undefined, undefined, ownerElem, internalOwnerElement);

            return picker;
        }

        closeGeneralPicker()
        {
            //---- close & remove from DOM ----
            if (this._generalPicker)
            {
                this._generalPicker.remove();
                this._generalPicker = null;
            }
        }

        public createGeneralPicker(openerIds: string, name: string, colItems: any[], callback, verticalMargin = 0,
            iconWidth?: number, ownerElem?: HTMLElement, internalOwnerElement?: HTMLElement)
        {
            var pm: PopupMenuClass = null;

            if (colItems)
            {
                pm = new PopupMenuClass(openerIds, "generalColPicker", colItems, (e, menu, textIndex, menuIndex) =>
                {
                    var mid = <MenuItemData>colItems[menuIndex];
                    callback(mid, colItems);
                }, undefined, undefined, verticalMargin, iconWidth, ownerElem, internalOwnerElement);
            }

            this._generalPicker = pm;
            return pm;
        }

        createListBox(colItems: any[], callback)
        {
        }

        onSizeClick(e?: any, isFromLegend?: boolean)
        {
            var picker = this.createColumnPicker("bbSize sizeLegendTitle", true, (mid) =>
            {
                this.changeSizeMapping(mid.text, mid.iconSrc);

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.sizeMapping, true,
                    "colName", mid.text);
            });

            if (picker)
            {
                picker.changeRootClass("popupPanel");

                var x = undefined;
                var y = undefined;
                var x2 = undefined;
                var y2 = undefined;

                if (isFromLegend)
                {
                    var rc = vp.select("#sizeLegendTitle").getBounds(true);
                    x2 = rc.left;
                    y = rc.top;
                }
                else
                {
                    var rc = vp.select("#bbSize").getBounds(true);
                    x = rc.left;
                    y = rc.bottom;
                }

                picker.show(x, y, x2, y2);
            }
        }

        onLineClick()
        {
            var picker = this.createColumnPicker("bbLine lineLegendTitle", true, (mid) =>
            {
                this.changeLineMapping(mid.text, mid.iconSrc);

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.lineMapping, true,
                    "colName", mid.text);
            });

            if (picker)
            {
                picker.changeRootClass("popupPanel");

                var rc = vp.select("#bbLine").getBounds(true);
                picker.show(rc.left, rc.bottom);
            }
        }

        onTextClick()
        {
            var picker = this.createColumnPicker("bbText textLegendTitle", true, (mid) =>
            {
                this.changeTextMapping(mid.text, mid.iconSrc);

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.textMapping, true,
                    "colName", mid.text);
            });

            if (picker)
            {
                picker.changeRootClass("popupPanel");

                var rc = vp.select("#bbText").getBounds(true);
                picker.show(rc.left, rc.bottom);
            }
        }

        onImageClick(e?: any, isFromLegend?: boolean)
        {
            var picker = this.createColumnPicker("bbShape shapeLegendTitle", true, (mid) =>
            {
                this.changeImageMapping(mid.text, mid.iconSrc);

                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.imageMapping, true,
                    "colName", mid.text);
            });

            if (picker)
            {
                picker.changeRootClass("popupPanel");

                var x = undefined;
                var y = undefined;
                var x2 = undefined;
                var y2 = undefined;

                if (isFromLegend)
                {
                    var rc = vp.select("#shapeLegendTitle").getBounds(true);
                    x2 = rc.left;
                    y = rc.top;
                }
                else
                {
                    var rc = vp.select("#bbShape").getBounds(true);
                    x = rc.left;
                    y = rc.bottom;
                }

                picker.show(x, y, x2, y2);
            }
        }

        changeXMapping(name: string)
        {
            this._xMapping.colName = name;
            this.setMappingDataFormatting(this._xMapping);
            this.onXMappingChanged();
        }

        changeYMapping(name: string)
        {
            this._yMapping.colName = name;
            this.setMappingDataFormatting(this._yMapping);
            this.onYMappingChanged();
        }

        changeZMapping(name: string)
        {
            this._zMapping.colName = name;
            this.setMappingDataFormatting(this._zMapping);
            this.onZMappingChanged();
        }

        colorPaletteType(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._colorPaletteType;
            }

            this._colorPaletteType = value;
            this.onDataChanged("colorPaletteType");
            this.onDataChanged("rebuildColorPaletteList");
        }

        reverseColorPalette(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping.isReversed;
            }

            this._currentColorMapping.isReversed = value;
            this.onDataChanged("reverseColorPalette");

            this.onColorMappingChanged(true);
        }

        colorIsContinuous(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping.isContinuous;
            }

            this._currentColorMapping.isContinuous = value;
            this.onDataChanged("colorIsContinuous");

            this.onColorMappingChanged(false);
        }

        colorSteps(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping.stepsRequested;
            }

            this._currentColorMapping.stepsRequested = value;
            this.onDataChanged("colorSteps");

            this.logAction(Gesture.dial, null, ElementType.dial, Action.adjust, Target.colorMapping, true, "binCount", value + "");

            this.onColorMappingChanged(true);
        }

        //paletteName(value?: string)
        //{
        //    if (arguments.length == 0)
        //    {
        //        return this._currentColorMapping.paletteName;
        //    }

        //    this._currentColorMapping.paletteName = value;

        //    this.setPaletteFromName(value);
        //    this.onDataChanged("paletteName");
        //}

        setPaletteFromName(name: string)
        {
            var palettes = this.getColorPalettes();
            var palette = null;

            for (var i = 0; i < palettes.length; i++)
            {
                var anyPalette = <any> palettes[i];
                if (anyPalette.name === name)
                {
                    palette = palettes[i];
                    break;
                }
            }

            if (palette)
            {
                this._currentColorMapping.colorPalette = palette;
                this.onColorMappingChanged(false);
            }
        }

        colorColumn(value?: string)
        {
            if (arguments.length === 0)
            {
                return (this._currentColorMapping) ? this._currentColorMapping.colName : "";
            }

            this.onColorColumnChanged(value);

            this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.colorMapping, true,
                "colName", value);
        }

        colorDataType(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._colorDataType;
            }

            this._colorDataType = value;
            this.onDataChanged("colorDataType");
        }

        onColorColumnChanged(value: string)
        {
            if (value)
            {
                var colInfo = this.getColInfo(value);
                this.colorDataType(colInfo.colType);

                if (this._colorDataType === "string")
                {
                    this._currentColorMapping = this._catColorMapping;
                }
                else if (this._colorDataType === "number")
                {
                    this._currentColorMapping = this._numColorMapping;
                }
                else if (this._colorDataType === "date")
                {
                    this._currentColorMapping = this._dateColorMapping;
                }
                else
                {
                    throw "Error - unknown column type for column=" + value;
                }

                this._currentColorMapping.colName = value;
                this.setMappingDataFormatting(this._currentColorMapping);

                var colorPaletteType = beachParty.colorPalettesClass.getColorPaletteTypeFromName(this._currentColorMapping.paletteName);
                this.colorPaletteType(colorPaletteType);
            }
            else
            {
                this._currentColorMapping.colName = value;
                this.setMappingDataFormatting(this._currentColorMapping);
                this._colorDataType = null;
                this.colorPaletteType(null);
            }

            this.onColorMappingChanged(true);
            this.onDataChanged("colorColumn");
        }

        colorSpread(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.MappingSpread[this._currentColorMapping.spread];
            }

            this._currentColorMapping.spread = bps.MappingSpread[value];
            this.onDataChanged("colorSpread");

            this.onColorMappingChanged(false);
        }

        colorForceCategory(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._currentColorMapping.forceCategory;
            }

            this._currentColorMapping.forceCategory = value;
            this.onDataChanged("colorForceCategory");

            this.onColorMappingChanged(false);
        }

        colorShowLegend(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._showColorLegend;
            }

            this._showColorLegend = value;
            this.onDataChanged("colorShowLegend");

            this.onShowColorLegendChanged();
        }

        changeSizeMapping(name: string, iconStr?: string)
        {
            this._sizeMapping.colName = name;
            this.setMappingDataFormatting(this._sizeMapping);
            this.onSizeMappingChanged();
        }

        changeTextMapping(name: string, iconStr?: string)
        {
            this._textMapping.colName = name;
            this.setMappingDataFormatting(this._textMapping);
            this.onTextMappingChanged();
        }

        changeLineMapping(name: string, iconStr?: string)
        {
            this._lineMapping.colName = name;
            this.setMappingDataFormatting(this._lineMapping);
            this.onLineMappingChanged();
        }

        changeImageMapping(name: string, iconStr?: string)
        {
            this._imageMapping.colName = name;
            this.setMappingDataFormatting(this._imageMapping);
            this.onImageMappingChanged();
        }

        changeFacetMapping(name: string, iconStr?: string)
        {
            this._facetMapping.colName = name;
            this.setMappingDataFormatting(this._facetMapping);
            this.onFacetMappingChanged();
        }

        //getChartIndex(chartName: string)
        //{
        //    var index = null;

        //    for (var i = 0; i < this._chartMenuItems.length; i++)
        //    {
        //        if (this._chartMenuItems[i].text == chartName)
        //        {
        //            index = i;
        //            break;
        //        }
        //    }

        //    return index;
        //}

        getPreload(name: string)
        {
            var preload = null;

            for (var i = 0; i < this._preloads.length; i++)
            {
                var pl = this._preloads[i];
                if (pl.name === name)
                {
                    preload = pl;
                }
            }

            return preload;
        }

        setBigValue(baseName: string, value: string, toolTip?: string)
        {
            var buttonW = vp.select("#bb" + baseName);
            if (buttonW[0])
            {
                var valueW = vp.select("#bb" + baseName + "Value");

                if (!value)
                {
                    valueW.addClass("noneValue");
                    valueW.text("None");
                }
                else
                {
                    valueW.removeClass("noneValue");
                    valueW.text(value);
                }

                if (!toolTip)
                {
                    toolTip = buttonW[0]._title;         // the original tooltip 
                }

                buttonW.title(toolTip);
            }
        }

        onRecordCountChanged()
        {
            var countMsg = vp.formatters.comma(this._recordCount) + " items";

            if (countMsg)
            {
                vp.select("#itemCountText")
                    .text(countMsg)
                    .css("display", "");
            }
            else
            {
                vp.select("#itemCountText")
                    .css("display", "none");
            }
        }

        onUndoClick()
        {
            var tooltip = this._undoMgr.getUndoTooltip();
            var entry = this._undoMgr.undo();

            if (entry)
            {
                this.logAction(Gesture.click, "undoButton", ElementType.button, Action.load, Target.undoEntry, false, "tooltip", tooltip);

                this.loadInsightCore(entry.insight);
            }
        }

        onRedoClick()
        {
            var tooltip = this._undoMgr.getRedoTooltip();
            var entry = this._undoMgr.redo();

            if (entry)
            {
                this.logAction(Gesture.click, "redoButton", ElementType.button, Action.load, Target.redoEntry, false, "tooltip", tooltip);

                this.loadInsightCore(entry.insight);
            }
        }

        onUndoStackChange()
        {
            var undoTip = this._undoMgr.getUndoTooltip();
            vp.select("#undoButton")
                .title(undoTip);

            var redoTip = this._undoMgr.getRedoTooltip();
            vp.select("#redoButton")
                .title(redoTip);

            var isUndoAvail = this._undoMgr.isUndoAvailable();
            this.disableIconButton("undo", (!isUndoAvail));

            var isRedoAvail = this._undoMgr.isRedoAvailable();
            this.disableIconButton("redo", (!isRedoAvail));
        }

        onSelectedCountChanged()
        {
            var countMsg = (this._selectedCount) ? (vp.formatters.comma(this._selectedCount) + " selected") : "";
            var countMsg = (vp.formatters.comma(this._selectedCount) + " selected");
            if (countMsg)
            {
                vp.select("#selectedCountText")
                    .text(countMsg)
                    .css("display", "")
                    .attr("data-disabled", (this._selectedCount) ? "false" : "true");
            }
            else
            {
                vp.select("#selectedCountText")
                    .css("display", "none");
            }

            var selDisabled = (!this._selectedCount);

            this.disableIconButton("isolate", selDisabled);
            this.disableIconButton("exclude", selDisabled);
            this.disableIconButton("details", selDisabled);

            this.updateResetButton();
        }

        updateResetButton()
        {
            var isFiltered = (this._filteredInCount < this._recordCount);

            var resetDisabled = (!this._selectedCount && !isFiltered);

            this.disableIconButton("reset", resetDisabled);
        }

        onFilteredInCountChanged()
        {
            //var countMsg = (this._filteredInCount < this._recordCount) ? (vp.formatters.comma(this._filteredInCount) + " in filter") : "";
            var dim = (this._filteredInCount === this._recordCount);
            if (dim)
            {
                var countMsg = (vp.formatters.comma(this._recordCount)) + " items";
            }
            else
            {
                var countMsg = (vp.formatters.comma(this._filteredInCount)) + " of " + (vp.formatters.comma(this._recordCount)) + " items";
            }

            vp.select("#filteredInCountText")
                .text(countMsg);

            vp.select("#filteredInCountTextHolder")
                .attr("data-disabled", (dim) ? "true" : "false");

            this.updateResetButton();
        }

        onChartOrLayoutChanged()
        {
            this.applyViewSettings();

            this._bpsHelper.setChartType(this._chartName, this._layoutName);
        }

        applyViewSettings()
        {
            //---- turn off logging while we set various properties as side effect of main property change ----
            this._isLoggingEnabled = false;

            try
            {
                //---- apply view settings ----
                var key = this._chartName + "^" + this._layoutName + "^" + this._filename;
                var vs = <ViewSettings> this._viewSettings[key];

                if (!vs)
                {
                    vs = new ViewSettings();
                    this._viewSettings[key] = vs;
                }

                this._vsCurrent = vs;

                if (vs.sizeFactor)
                {
                    this.sizeFactor(vs.sizeFactor);
                }

                if (vs.shapeOpacity)
                {
                    settings.shapeOpacity(vs.shapeOpacity);
                }

                //if (vs.xBinCount)
                //{
                //    this.xBins(vs.xBinCount);
                //}

                //if (vs.yBinCount)
                //{
                //    this.yBins(vs.yBinCount);
                //}

                if (vs.zBinCount)
                {
                    this.zBins(vs.zBinCount);
                }
            }
            finally
            {
                this._isLoggingEnabled = true;
            }
        }

        onIsolateClick(e)
        {
            if (this._selectedCount)
            {
                this._filterDesc = this._selectionDesc;
                this.onClientFilterChange();

                this._bpsHelper.isolateSelection();

                var id = (e) ? e.target.id : null;
                this.logAction(Gesture.click, id, ElementType.button, Action.adjust, Target.filter, true,
                    "type", "Isolate");
            }
        }

        onExcludeClick(e)
        {
            if (this._selectedCount)
            {
                this._filterDesc = this._selectionDesc;
                this.onClientFilterChange();

                this._bpsHelper.excludeSelection();

                var id = (e) ? e.target.id : null;
                this.logAction(Gesture.click, id, ElementType.button, Action.adjust, Target.filter, true,
                    "type", "Exclude");
            }
        }

        onResetClick(e)
        {
            this.onClientFilterChange();

            this._bpsHelper.clearSelection();
            this._bpsHelper.resetFilter();

            //---- why does animatin get turned off here? ----
            this._bpsHelper.resetTransform();

            var id = (e) ? e.target.id : null;
            this.logAction(Gesture.click, id, ElementType.button, Action.clear, Target.filterAndSelection, true);
        }

        //onPopupHidden(name: string)
        //{
        //    this._popupClosedTime[name] = vp.utils.now();
        //}

        //popupJustHidden(name: string)
        //{
        //    var justHidden = false;

        //    var dt = this._popupClosedTime[name];
        //    if (dt !== undefined)
        //    {
        //        var delta = vp.utils.now() - dt;
        //        justHidden = (delta < 500);
        //    }

        //    return justHidden;
        //}

        /** Invoke a popup menu to select a new chart type. */
        onChartClick(e)
        {
            //if (!this.popupJustHidden("chartPicker"))
            {
                var rc = vp.select("#bbView").getBounds(true);

                var chartPicker = new ChartPickerClass(this._chartName, (newName: string) =>
                {
                    this.changeToChart(newName, null, Gesture.click);
                    this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.chartType, true, "name", newName);
                });

                chartPicker.open(rc.left, rc.bottom);

                //---- full opacity (override app option here) ----
                vp.select(chartPicker.getRootElem())
                    .css("opacity", "1");
            }
        }

        getLayoutsForCurrentChart()
        {
            var layouts = null;
            var chartName = this._chartName;

            /// chartnames: 
            ///     flat, column, density, line, scatter, pie
            ///     violin, graph, cluster, parallel, xxxx, xxxx

            if (chartName === "Flat") {
                layouts = ["Grid", "Circle", "Poisson", "Random"];
            }
            else if (chartName === "Column" || chartName === "Bar") {
                layouts = ["Grid", "Sum", "Random"];
            }
            else if (chartName === "Density") {
                layouts = ["Grid", "Random", "Circle"];
            }
            else if (chartName === "Stacks") {
                layouts = ["ScaleToFit", "Cubes"];
            }

            return layouts;
        }

        /** Invoke a popup menu for the current chart layout choices. */
        onLayoutClick(e)
        {
            var layouts = this.getLayoutsForCurrentChart();

            if (layouts)
            {
                var pm = new PopupMenuClass(null, "pmLayout", layouts, (e, menu, textIndex, menuIndex) =>
                {
                    var layout = layouts[menuIndex];
                    this.changeToLayout(layout, true);

                }, true);

                var rc = vp.select("#layoutText").getBounds(false);
                //var pt = vp.events.mousePosition(e);

                this.setContextMenu(pm);
                pm.show(rc.left, rc.top + 20);
            }
        }

        onChartChanged(layout: string)
        {
            var defaultLayout = null;

            var layouts = this.getLayoutsForCurrentChart();
            if (layouts && layouts.length)
            {
                //---- use first choice for now ----
                defaultLayout = layouts[0];
            }
            else
            {
                layout = null;      // no layouts for this chart
            }

            if (layout)
            {
                //---- remember last used layout for this chart type ----
                this._layoutsByChart[this._chartName] = name;
            }
            else
            {
                //---- get user-specified layout for this chart type ----
                layout = this._layoutsByChart[this._chartName];
            }

            if (!layout)
            {
                layout = defaultLayout;
            }

            //---- if the SUM BY ui is set, use the Sum layout ----
            if (this.isSumByEnabled() && this._sumByColumn)
            {
                layout = "Sum";

                //---- apply sumBy column to X or Y, depending on chart type ----
                this.onSumByChanged();
            }

            this.changeToLayout(layout, false);
        }

        changeToLayout(name: string, isFromUi: boolean)
        {
            this._layoutName = name;

            //---- don't bother updating UI until first data frame is loaded ----
            this.updateUiForLayoutChange();

            if (isFromUi)
            {
                this.logAction(Gesture.select, null, ElementType.picklist, Action.adjust, Target.layout, true, "name", name);
            }

            //---- tell the chart ----
            this.onChartOrLayoutChanged();
        }

        updateUiForLayoutChange(hideBins?: boolean)
        {
            var name = this._layoutName;
            var layoutDisabled = (!name);

            name = name || "none";

            vp.select("#layoutButton")
            //.css("display", (name) ? "inline-block" : "none");
                .css("opacity", (layoutDisabled) ? ".5" : "1");

            //---- update the UI ----
            vp.select("#layoutText")
                .text(name);

            //---- hide/show X axis ----
            var chartName = this._chartName;

            var showX = (chartName !== "Flat" && chartName !== "Bar");
            var showXBin = (chartName === "Column" || chartName === "Density" || chartName === "Stacks" || chartName === "Violin");

            var showY = (chartName !== "Flat" && chartName !== "Column" && chartName !== "Squarify");
            var showYBin = (chartName === "Density" || chartName === "Stacks" || chartName === "Violin" || chartName === "Bar");

            var showZ = (chartName === "Scatter-3D");
            var showZBin = (chartName === "Stacks");

            vp.select("#bbX").css("display", (showX) ? "" : "none");
            vp.select("#bbY").css("display", (showY) ? "" : "none");
            vp.select("#bbZ").css("display", (showZ) ? "" : "none");

            this._xBinAdjuster.show(showXBin && ! hideBins);
            this._yBinAdjuster.show(showYBin && !hideBins);
            this._zBinAdjuster.show(showZBin && !hideBins);

            vp.select("#xButton")
                .css("display", (showX) ? "" : "none");

            vp.select("#yButton")
                .css("display", (showY) ? "" : "none");

            vp.select("#zButton")
                .css("display", (showZ) ? "" : "none");

             //---- adjust xStuff to keep in place when showZ is true ----
            vp.select("#xStuff")
                .css("top", (showZ) ? "15px" : ((showXBin) ? "5px" : "21px"));

            //---- ensure this is called the first time we show the Y button / bins ----
            this.manualLayoutForYStuff();  

            settings.on3dViewChanged();
        }

        isItemSortByColor(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return (this._currentColorMapping.colName && this._currentColorMapping.colName === this._sortItemCol);
            }

            if (value)
            {
                this._sortItemCol = this._currentColorMapping.colName;
            }
            else
            {
                this._sortItemCol = this._lastScatterYCol;
            }

            this.onSortParmsChanged(true);

            this.onDataChanged("isItemSortByColor");
        }

        is3DChart(chartName: string)
        {
            return (chartName === "Scatter-3D" || chartName === "Stacks");
        }

        changeToChart(name: string, layout: string, gesture: Gesture)
        {
            var oldChartName = this._chartName;
            var newChartName = name;       

            this._prevChartName = oldChartName;
            this._chartName = newChartName;

            this.setAutualDrawingPrimitive();

            //---- set SORT ORDER such that transitions between SCATTER and BAR/COLUMN look their best ----
            if (oldChartName === "Scatter")
            {
                this._lastScatterYCol = this._yMapping.colName;
                this._lastScatterXCol = this._xMapping.colName;

                if (newChartName === "Column")
                {
                    this.sortIfPossible(this._lastScatterYCol);
                }
                else if (newChartName === "Bar")
                {
                    this.sortIfPossible(this._lastScatterXCol);
                }
            }
            else if (newChartName === "Scatter")
            {
                if (oldChartName === "Column")
                {
                    this.sortIfPossible(this._lastScatterYCol);
                }
                else if (oldChartName === "Bar")
                {
                    this.sortIfPossible(this._lastScatterXCol);
                }
            }

            var displayName = (name === "Scatter-3D") ? "Scatter 3D" : name;
            this.setBigValue("View", displayName);

            var isSumEnabled = this.isSumByEnabled();
            var isLineEnabled = this.isLineByEnabled();

            //this.disableBigButton("Sum", (!isSumEnabled));
            vp.select("#bbSum").css("display", isSumEnabled ? "" : "none");

            vp.select("#bbLine").css("display", isLineEnabled ? "" : "none");

            this.onChartChanged(layout);
        }

        sortIfPossible(colName: string)
        {
            if (colName && this._sortItemCol !== colName)
            {
                this.sortItemColumn(colName);

                if (!this._isItemSortAscending)
                {
                    this.isItemSortAscending(true);
                }
            }
        }

        toggleInsightPanel(e)
        {
            this._insightMgr.toggleInsightsPanel();
        }

        showInsightMenu(e)
        {
            this._activeContextMenu = this._insightMgr.showInsightButtonContextMenu(e);
        }

        addNewInsight(e)
        {
            this.createInsight(true, true, (insight) =>
            {
                this._insightMgr.addNewInsight(insight);
            });
        }

        createInsight(getSnapshot: boolean, getRepro: boolean, callback)
        {
            var insight = new bps.InsightData(null);

            //---- save some properties as early as possible (keys on text change quickly) ----

            //---- client-specific properties ----
            insight.searchText = this._searchValue;
            insight.searchColumn = this._searchCol;
            insight.isDetailsPanelOpen = this.isDetailsPanelOpen();;
            insight.isSortPanelOpen = this.isSortPanelOpen();
            insight.isAppPanelOpen = this.isAppPanelOpen();
            insight.isColorPanelOpen = this.isColorPanelOpen();
            insight.isSlicerPanelOpen = this.isSlicerPanelOpen();
            insight.isShowing3DWheel = this._isTransformMode;

            //---- request some additional data about current state from BPS ----
            this._bpsHelper.getSystemViewData(getSnapshot, getRepro, (msgBlock) =>
            {
                var svd = <bps.SystemViewData>JSON.parse(msgBlock.param);

                //---- IMPORTANT: wait until engine has processed our "getSystemViewData" before we record properties of insight ----
                //---- this gives the engine a chance to process all of our previous cmds and have them trickle to client properties ----
                var preload = <bps.Preload>vp.utils.copyMap(this._fileOpenMgr.preload());
                insight.preload = preload;

                //---- save VIEW properties ----
                preload.chartName = this._chartName;
                preload.subLayout = this._layoutName;
                preload.sizeFactor = this._sizeFactor;
                preload.separationFactor = this._separationFactor;
                preload.shapeOpacity = settings._shapeOpacity;
                preload.shapeColor = settings._shapeColor;
                preload.shapeImage = settings._shapeImage;

                //---- sorting stuff ----
                preload.sortCol = this._sortItemCol;
                preload.isSortAscending = this._isItemSortAscending;

                var xm = <bps.MappingData> vp.utils.copyMap(this._xMapping);
                var ym = <bps.MappingData>vp.utils.copyMap(this._yMapping);
                var zm = <bps.MappingData>vp.utils.copyMap(this._zMapping);
                var cm = <bps.ColorMappingData>vp.utils.copyMap(this._currentColorMapping);
                var sm = <bps.SizeMappingData>vp.utils.copyMap(this._sizeMapping);
                var im = <bps.ImageMappingData>vp.utils.copyMap(this._imageMapping);
                var fm = <bps.FacetMappingData>vp.utils.copyMap(this._facetMapping);

                var colMappings = new bps.ColMappings(null, null);
                preload.colMappings = colMappings;

                colMappings.x = xm;
                colMappings.y = ym;
                colMappings.z = zm;
                colMappings.color = cm;
                colMappings.size = sm;
                colMappings.image = im;
                colMappings.facet = fm;

                preload.selectedKeys = svd.selectedKeys; 
                preload.filteredOutKeys = svd.filteredOutKeys;
                preload.worldTransform = svd.worldTransform;
                preload.rotationInertia = svd.rotationInertia;

                insight.imageAsUrl = svd.imageAsUrl;
                insight.chartRepro = svd.chartRepro;

                this._dataTipMgr.getDataFromDataTips(preload);

                callback(insight);
            });
        }

        onSortParmsChanged(tellEngine: boolean)
        {
            if (tellEngine)
            {
                this._bpsHelper.sortData(this._sortItemCol, this._isItemSortAscending);
            }

            this.setBigValue("Sort", this._sortItemCol);
            //vp.select("#bbSortValue").text(this._sortItemCol);
        }

        isSet(md: bps.MappingData)
        {
            return (md.colName !== null && md.colName !== "");
        }
                
        onLegendsChanged()
        {
            var isLegendNeeded = (this.isSet(this._currentColorMapping) || this.isSet(this._sizeMapping) || this.isSet(this._imageMapping));
            var isRightPanelShowing = (vp.select("#rightPanel").css("display") === "block");

            if (isLegendNeeded !== isRightPanelShowing)
            {
                //---- hide or show right panel ----
                vp.select("#rightPanel").css("display", (isLegendNeeded) ? "block" : "none");

                this.layoutScreen(this.width, this.height);
            }
        }

        layoutScreen(width?: number, height?: number)
        {
            AppClass.maxPanelHeight = .65 * window.innerHeight;

            var w = width || this.width;//window.innerWidth;//TODO: replace 
            var h = height || this.height;//window.innerHeight;//TODO: replace 

            //---- we set the bounds of the chart manually ----
            var ibWidth = vp.select("#insightPanel").width();
            if (ibWidth > 0)
            {
                ibWidth += 15 - 10;      // vertical scrollbar and fudge factor
            }

            var lw = ibWidth + vp.select("#leftPanel").width();
            var rw = vp.select("#rightPanel").width();
            //var th = vp.select("#bigBar").getBounds(false).bottom;
            
            var th = vp.select("#bigBar").getBounds(true).height + vp.select("#playAndIconBar").getBounds(true).height + 10;
            var bh = vp.select("#bottomPanel").height();
            var sw = vp.select("#searchPanel").width();

            //---- chrome/firefox layouts are different ----
            if (vp.utils.isChrome)
            {
                th += 6;
            }
            else if (vp.utils.isFireFox)
            {
                th += 20;
            }

            var cw = Math.max(1, w - (lw + rw));
            var ch = Math.max(1, h - (th + bh));

            //---- ICON BAR ----
            vp.select("#iconBar")
                //.width(w - logoWidth)
                .width(w - (sw + 40));

            //---- BIG BAR ----
            //vp.select("#bigBar")
            //    .width(cw + lw + rw - 22)

            //---- INSIGHT PANEL ----
            vp.select("#insightPanel")
                .css("left", "10px")
                .css("top", (th + 10) + "px")
                .height(h - (th + 20));

            //---- INSIGHT PANEL LIST ----
            vp.select("#insightListHolder")
               .height(h - (th + 20 + 90));

            //---- LEFT PANEL ----
            vp.select("#leftPanel")
                .css("left", (ibWidth + 20) + "px")
                .css("top", (th + 10) + "px")
                .css("height", (h - th - 20) + "px");

            //---- MY CHART ----
            vp.select("#myChart")
                .css("left", lw + "px")
                .css("top", (th + 10) + "px")
                .width(cw)
                .height(ch)
                .css("opacity", "1");        // make visible on first resize;

            //---- FACET LABEL HOLDER ----
            vp.select("#facetLabelHolder")
                .css("left", lw + "px")
                .css("top", (th + 10) + "px");
                //.width(cw)
                //.height(ch)

            //---- RIGHT PANEL ----
            vp.select("#rightPanel")
                .css("top", (th + 10) + "px")
                .css("height", (h - th) + "px");

            //---- BOTTOM PANEL ----
            vp.select("#bottomPanel")
                .css("left", lw + "px")
                .width(cw - 30);

            //---- CHART NOTES ----
            vp.select("#chartNotesHolder")
                .css("left", lw + "px")
                .css("top", th + "px")
                .width(cw);

            //---- INFO MSG ----
            vp.select("#infoMsgBox")
                .css("left", (10) + "px")
                .css("top", Math.max(75, (th+4)) + "px");

            //---- SEARCH PANEL (Chrome bug workaround) ----
            if (vp.utils.isChrome)
            {
                //var rc = vp.select("#searchPanel").width();
                //var right = vp.select("#searchPanel").css("right");

                vp.select("#searchPanel")
                    .css("right", "124px");
            }

            if (this.coreApplicationInstance && this.coreApplicationInstance.layoutWindow) {
                this.coreApplicationInstance.layoutWindow(cw, ch);
            }
        }

        hideInfoMsg()
        {
            vp.select("#infoMsgBox").css("display", "none");
        }

        getDefaultXYZCols()
        {
            var colInfos = this._colInfos;
            var xm = null;
            var ym = null;
            var zm = null;

            var preload = this._fileOpenMgr._preload;

            if (preload && preload.colMappings)
            {
                xm = preload.colMappings.x;
                ym = preload.colMappings.y;
                zm = preload.colMappings.z;
            }

            var x = (xm) ? xm.colName : null;
            var y = (ym) ? ym.colName : null;
            var z = (zm) ? zm.colName : null;

            if (!x || !y || !z)
            {
                for (var i = 0; i < colInfos.length; i++)
                {
                    var colInfo = colInfos[i];
                    var name = colInfo.name.toLowerCase();

                    if (name === "lat" || name === "latitude")
                    {
                        y = colInfo.name;

                        // note: we can't effectively change colType on the client; needs to be sent to vaas.
                        //colInfo.colType = "number";     // for now, force this to be interpreted as a number
                    }
                    else if (name === "lon" || name === "long" || name === "longitude" || name === "date" || name === "year" || name === "time")
                    {
                        x = colInfo.name;

                        // note: we can't effectively change colType on the client; needs to be sent to vaas.
                        //colInfo.colType = "number";     // for now, force this to be interpreted as a number
                    }
                }
            }

            if (!x || !y || !z)
            {
                for (var i = 0; i < colInfos.length; i++)
                {
                    var colInfo = colInfos[i];
                    var colType = colInfo.colType;

                    if (colType === "number")
                    {
                        if (!x)
                        {
                            x = colInfo.name;
                        }
                        else if (!y)
                        {
                            y = colInfo.name;
                        }
                        else if (!z)
                        {
                            z = colInfo.name;
                        }
                    }

                    if (x && y && z)
                    {
                        break;
                    }
                }
            }

            if (!x)
            {
                x = colInfos[0].name;
            }

            if (!y)
            {
                y = colInfos[0].name;
            }

            if (!z)
            {
                z = colInfos[0].name;
            }

            return { x: x, y: y, z: z };
        }
    }

    /** chart settings that are saved with each chartType (current session only). */
    export class ViewSettings
    {
        sizeFactor: number;
        shapeOpacity: number;

        //xBinCount: number;
        //yBinCount: number;
        zBinCount: number;

        constructor()
        {
            this.sizeFactor = 1;
            this.shapeOpacity = AppClass.defaultOpacity;

            //this.xBinCount = 9;
            //this.yBinCount = 9;
            this.zBinCount = 3;
        }
    }

   //---- event logging enums - for consistent names ----
    export enum Gesture
    {
        click,
        dblClick,
        dial,               // circular drag
        drag,
        keyDown,
        none,
        select,             // item from list
        system,             // for system initiated action (usually result of a higher level gesture) 
        automatedTest,      // cmd came from running automated test
    }

    export enum ElementType
    {
        button,
        canvas,
        none,
        dial,
        slider,
        textBox,
        picklist,
    }

    export enum Action
    {
        adjust,         // chartType, layout, ...
        clear,
        open,
        close,
        show,
        hide,
        load,           // data, redoEntry, ...
        start,          // app
        remap,          // for remaping column to attribute with current filter
        //run,            // undoEntry
    }

    export enum Target
    {
        //---- panels ----
        appPanel,
        filePanel,
        sortPanel,
        detailsPanel,
        colorPanel,
        facetPanel,
        xPanel,
        yPanel,
        zPanel,
        slicerPanel,
        chartPanel,
        unknownPanel,

        //---- menus ----
        insightMenu,

        //---- dropdown picklists ----
        columnPicker,
        chartTypePicker,
        layoutPicker,

        //---- data ----
        data,
        selection,
        filter,
        filterAndSelection,

        //---- attributes ----
        xMapping,
        yMapping,
        zMapping,
        colorMapping,
        sizeMapping,
        imageMapping,
        textMapping,
        lineMapping,
        facetMapping,
        sumByMapping,

        //---- properties ----
        chartType,
        layout,
        shapeOpacity,
        sizeFactor,
        separationFactor,

        //---- other ----
        app,
        newAppInstance,
        undoEntry,
        redoEntry,
        insight,
        searchCol,
        threeDimWheel,
    }

    export class FilterStack
    {
        filters: SelectionStack;
    }

    export class SelectionStack
    {
        selects: SelectionDesc[];
    }

    export class SelectionDesc
    {
        selectMode: bps.SelectMode;
        legendSource: string;
        searchParams: bps.SearchParams;
        rectSelect: ClientRect;
    }
}