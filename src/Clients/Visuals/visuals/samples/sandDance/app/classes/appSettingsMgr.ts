//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    appSettingsMgr.ts - manages the application setting parameters.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class AppSettingsMgr extends beachParty.DataChangerClass 
    {
        private container: HTMLElement;

        _bpsHelper: bps.ChartHostHelperClass;
        _isSavingSettingsDisabled = true;
        _persistChangesDisabledFromUrlParams = false;
        _appStyleSheet: vp.dom.styleSheetClass;

        //---- settings ----
        _shapeColor: string;
        _shapeOpacity = AppClass.defaultOpacity;
        _shapeImage: string;
        _canvasColor = "black";
        _drawingPrimitive: bps.DrawPrimitive = bps.DrawPrimitive.cube;
        _isContinuousDrawing = true;
        _chartFrameData: bps.ChartFrameData;
        _animationData: bps.AnimationData;
        _hoverParams: bps.HoverParams;
        _isTooltipsEnabled = true;
        _selectionParams: bps.SelectionParams;
        _isMenuTextVisible: boolean;
        _isMenuIconVisible: boolean;
        _isMenuChevronVisible: boolean;
        _isColPickerSorted = true;
        _panelOpacity: number;
        _is3dGridAlwaysOn = false;
        _isWheelInertia = true;
        _showWheelDuringTransformMode = false;
        _isLightingAlwaysOn = false;
        _lightingParams = new bps.Lighting();
        _defaultBins = 9;
        _useNiceNumbers = false;
        _playbackDuration: number;
        _isPlaybackLooping: boolean;
        _rememberLastFile = true;
        _rememberLastSession = true;
        _initFilename: string;
        _initialChartType = bps.ChartType.Scatter;
        _initialLayout = bps.Layout.Random;
        _isShowingChartStatus = false;
        _isShowingLastCycleStats = false;
        _isShowingEventStats = false;
        _isErrorReportingDisabled = false;
        _automatedTestName = "demoVoteTest.js";
        _cacheLocalFiles: boolean;
        _cacheWebFiles: boolean;

        private saveSettingsHandler: (settings: any, type: sandDance.SettingsType) => void;
        private loadSettingsHandler: (type: sandDance.SettingsType) => any;

        constructor(container: HTMLElement, bpsHelper: bps.ChartHostHelperClass, saveSettingsHandler: (settings: any, type: sandDance.SettingsType) => void, loadSettingsHandler: (type: sandDance.SettingsType) => any) {
            super();

            this.container = container;

            this.saveSettingsHandler = saveSettingsHandler;
            this.loadSettingsHandler = loadSettingsHandler;

            this._bpsHelper = bpsHelper;

            this._appStyleSheet = new vp.dom.styleSheetClass()
                .id("appStyleSheet");

            this._hoverParams = new bps.HoverParams();
            this._selectionParams = new bps.SelectionParams();
        }

        /** apply default values to all persisted app properties. */
        resetAppSettings()
        {
            this._isSavingSettingsDisabled = true;

            //---- CHART tab ----
            this.shapeColor("beach blue");
            this.shapeImage("none");
            this.canvasColor("black");
            this.drawingPrimitive("auto");
            this.isContinuousDrawing(false);

            this._chartFrameData = new bps.ChartFrameData();
            this._chartFrameData.padding = { left: 1, top: 1, right: 15, bottom: 1 };
            this.chartFrameOpacity(1);

            //---- ANIMATION tab ----
            var ad = new bps.AnimationData();
            this._animationData = ad;

            //---- HOVER tab ----
            this._hoverParams = new bps.HoverParams();
            this.isTooltipsEnabled(false);

            //---- SELECTION tab ----
            this._selectionParams = new bps.SelectionParams();

            //---- UI tab ----
            this.isMenuTextVisible(false);
            this.isMenuIconVisible(true);
            this.isMenuChevronVisible(false);
            this.isColPickerSorted(true);
            this.panelOpacity(.9);

            //---- 3D tab ----
            this.is3dGridAlwaysOn(false);
            this.isWheelInertia(true);
            this.showWheelDuringTransformMode(false);
            this.isLightingAlwaysOn(false);
            this.ambientLightLevel(.25);

            //---- DATA tab ----
            this.cacheLocalFiles(true);
            this.cacheWebFiles(true);
            this.useNiceNumbers(false);
            this.defaultBins(9);

            //---- INSIGHT tab ----
            this.playbackDuration(3);
            this.isPlaybackLooping(true);

            //---- STARTUP tab ----
            this.rememberLastFile(true);
            this.rememberLastSession(true);
            this._initFilename = null; //"Titanic"        // for shipping, need a faster loaded dataset
            this.initialChartType("Column");
            this.initialLayout("Grid");

            //---- DEBUG tab ----
            this.isShowingChartStatus(false);
            this.isShowingLastCycle(true);
            this.isShowingEventStats(false);
            this.isErrorReportingDisabled(false);

            this._isSavingSettingsDisabled = false;
        }

        saveAppSettings()//TODO: save settings in PowerBI.
        {
            if (!this._isSavingSettingsDisabled && !this._persistChangesDisabledFromUrlParams)
            {
                var appSettings = new AppSettings(AppClass.buildId);

                appSettings.showDebugStatus = this._isShowingChartStatus;
                appSettings.showLastCycle = this._isShowingLastCycleStats;
                appSettings.showEventStats = this._isShowingEventStats;
                appSettings.isErrorReportingDisabled = this._isErrorReportingDisabled;

                appSettings.shapeColor = this._shapeColor;
                appSettings.shapeImage = this._shapeImage;
                appSettings.canvasColor = this._canvasColor;

                //---- startup settings ----
                appSettings.rememberLastFile = null; //this._rememberLastFile;
                appSettings.rememberLastSession = this._rememberLastSession;

                if (this._rememberLastFile)
                {
                    appSettings.lastFileName = null;//appClass.instance._filename;
                }

                appSettings.initialChartType = this._initialChartType;
                appSettings.initialLayout = this._initialLayout;

                appSettings.isColPickerSorted = this._isColPickerSorted;
                appSettings.playbackDuration = this._playbackDuration;
                appSettings.isPlaybackLooping = this._isPlaybackLooping;

                appSettings.isWheelInertia = this._isWheelInertia;
                appSettings.isLightingAlwaysOn = this._isLightingAlwaysOn;
                appSettings.ambientLightLevel = this.ambientLightLevel();
                appSettings.isContinuousDrawing = this._isContinuousDrawing;
                appSettings.isTooltipsEnabled = this._isTooltipsEnabled;
                appSettings.is3dGridAlwaysOn = this._is3dGridAlwaysOn;
                appSettings.showWheelDuringTransformMode = this._showWheelDuringTransformMode;

                appSettings.isMenuTextVisible = this._isMenuTextVisible;
                appSettings.isMenuIconVisible = this._isMenuIconVisible;
                appSettings.isMenuChevronVisible = this._isMenuChevronVisible;
                appSettings.drawingPrimitive = this.drawingPrimitive();
                appSettings.panelOpacity = this.panelOpacity();

                appSettings.cacheLocalFiles = this.cacheLocalFiles();
                appSettings.cacheWebFiles = this.cacheWebFiles();
                appSettings.useNiceNumbers = this.useNiceNumbers();
                appSettings.hoverParams = this._hoverParams;
                appSettings.selectionParams = this._selectionParams;

                appSettings.defaultBins = this.defaultBins();

                appSettings.animationData = this._animationData;
                appSettings.chartFrameData = this._chartFrameData;

                this.saveSettingsHandler(appSettings, sandDance.SettingsType.application);

                // var str = JSON.stringify(appSettings);
                // localStorage["appSettings"] = str;
            }
        }

        getLastSessionKey()
        {
            return "$lastSession";
        }

        saveSessionToLocalStorage()
        {
            if (true) //localStorage
            {
                var preload = UndoMgrClass.instance.getCurrentInsight();

                if (preload)
                {
                    preload.name = "$lastSession";
                }

                // var strPreload = JSON.stringify(preload);
                // localStorage[key] = strPreload;

                this.saveSettingsHandler(preload, sandDance.SettingsType.session);
            }
        }

        public loadAppSettings()//TODO: load settings from PowerBI.
        {
            if (true)//localStorage
            {
                var str = "Hello";//localStorage["appSettings"];
                if (str && str !== "")
                {
                    this._isSavingSettingsDisabled = true;

                    try
                    {
                        var appSettings = this.loadSettingsHandler && this.loadSettingsHandler(sandDance.SettingsType.application);//<AppSettings>JSON.parse(str);

                        //---- only use if versionNum of appSettings is the same as the current version ----
                        if (appSettings && appSettings.versionNum === AppClass.buildId)
                        {

                            if (appSettings.showDebugStatus !== undefined && appSettings.showDebugStatus !== this._isShowingChartStatus)
                            {
                                this.isShowingChartStatus(appSettings.showDebugStatus);
                            }

                            if (appSettings.showLastCycle !== undefined && appSettings.showLastCycle !== this._isShowingLastCycleStats)
                            {
                                this.isShowingLastCycle(appSettings.showLastCycle);
                            }

                            if (appSettings.showEventStats !== undefined && appSettings.showEventStats !== this._isShowingEventStats)
                            {
                                this.isShowingEventStats(appSettings.showEventStats);
                            }

                            if (appSettings.isErrorReportingDisabled !== undefined && appSettings.isErrorReportingDisabled !== this._isErrorReportingDisabled)
                            {
                                this.isErrorReportingDisabled(appSettings.isErrorReportingDisabled);
                            }

                            if (appSettings.shapeColor !== undefined && appSettings.shapeColor !== this._shapeColor)
                            {
                                this.shapeColor(appSettings.shapeColor);
                            }

                            if (appSettings.canvasColor !== undefined && appSettings.canvasColor !== this._canvasColor)
                            {
                                this.canvasColor(appSettings.canvasColor);
                            }

                            if (appSettings.isColPickerSorted !== undefined && appSettings.isColPickerSorted !== this._isColPickerSorted)
                            {
                                this.isColPickerSorted(appSettings.isColPickerSorted);
                            }

                            if (appSettings.playbackDuration !== undefined && appSettings.playbackDuration !== this._playbackDuration)
                            {
                                this.playbackDuration(appSettings.playbackDuration);
                            }

                            if (appSettings.isPlaybackLooping !== undefined && appSettings.isPlaybackLooping !== this._isPlaybackLooping)
                            {
                                this.isPlaybackLooping(appSettings.isPlaybackLooping);
                            }

                            if (appSettings.rememberLastFile !== undefined && appSettings.rememberLastFile !== this._rememberLastFile)
                            {
                                // this.rememberLastFile(appSettings.rememberLastFile);
                            }

                            if (appSettings.rememberLastSession !== undefined && appSettings.rememberLastSession !== this._rememberLastSession)
                            {
                                this.rememberLastSession(appSettings.rememberLastSession);
                            }

                            if (appSettings.cacheLocalFiles !== undefined && appSettings.cacheLocalFiles !== this._cacheLocalFiles)
                            {
                                this.cacheLocalFiles(appSettings.cacheLocalFiles);
                            }

                            if (appSettings.cacheWebFiles !== undefined && appSettings.cacheWebFiles !== this._cacheWebFiles)
                            {
                                this.cacheWebFiles(appSettings.cacheWebFiles);
                            }

                            if (appSettings.initialChartType !== undefined && appSettings.initialChartType !== this._initialChartType)
                            {
                                this.initialChartType(bps.ChartType[appSettings.initialChartType]);
                            }

                            if (appSettings.initialLayout !== undefined && appSettings.initialLayout !== this._initialLayout)
                            {
                                this.initialLayout(bps.Layout[appSettings.initialLayout]);
                            }

                            if (appSettings.isWheelInertia !== undefined && appSettings.isWheelInertia !== this._isWheelInertia)
                            {
                                this.isWheelInertia(appSettings.isWheelInertia);
                            }

                            if (appSettings.isLightingAlwaysOn !== undefined && appSettings.isLightingAlwaysOn !== this._isLightingAlwaysOn)
                            {
                                this.isLightingAlwaysOn(appSettings.isLightingAlwaysOn);
                            }

                            if (appSettings.ambientLightLevel !== undefined && appSettings.ambientLightLevel !== this._lightingParams.ambientLight.lightFactor)
                            {
                                this.ambientLightLevel(appSettings.ambientLightLevel);
                            }

                            if (appSettings.isContinuousDrawing !== undefined && appSettings.isContinuousDrawing !== this._isContinuousDrawing)
                            {
                                this.isContinuousDrawing(appSettings.isContinuousDrawing);
                            }

                            if (appSettings.showWheelDuringTransformMode !== undefined && appSettings.showWheelDuringTransformMode !== this._showWheelDuringTransformMode)
                            {
                                this.showWheelDuringTransformMode(appSettings.showWheelDuringTransformMode);
                            }

                            if (appSettings.drawingPrimitive !== undefined && appSettings.drawingPrimitive !== this.drawingPrimitive())
                            {
                                this.drawingPrimitive(appSettings.drawingPrimitive);
                            }

                            if (appSettings.isMenuTextVisible !== undefined && appSettings.isMenuTextVisible !== this._isMenuTextVisible)
                            {
                                this.isMenuTextVisible(appSettings.isMenuTextVisible);
                            }

                            if (appSettings.panelOpacity !== undefined && appSettings.panelOpacity !== this._panelOpacity)
                            {
                                this.panelOpacity(appSettings.panelOpacity);
                            }

                            if (appSettings.isMenuIconVisible !== undefined && appSettings.isMenuIconVisible !== this._isMenuIconVisible)
                            {
                                this.isMenuIconVisible(appSettings.isMenuIconVisible);
                            }

                            if (appSettings.isMenuChevronVisible !== undefined && appSettings.isMenuChevronVisible !== this._isMenuChevronVisible)
                            {
                                this.isMenuChevronVisible(appSettings.isMenuChevronVisible);
                            }

                            if (appSettings.isTooltipsEnabled !== undefined && appSettings.isTooltipsEnabled !== this._isTooltipsEnabled)
                            {
                                this.isTooltipsEnabled(appSettings.isTooltipsEnabled);
                            }

                            if (appSettings.is3dGridAlwaysOn !== undefined && appSettings.is3dGridAlwaysOn !== this._is3dGridAlwaysOn)
                            {
                                this.is3dGridAlwaysOn(appSettings.is3dGridAlwaysOn);
                            }

                            if (appSettings.shapeImage !== undefined && appSettings.shapeImage !== this._shapeImage)
                            {
                                this.shapeImage(appSettings.shapeImage);
                            }

                            if (appSettings.defaultBins !== undefined && appSettings.defaultBins !== this._defaultBins)
                            {
                                this.defaultBins(appSettings.defaultBins);
                            }

                            if (appSettings.useNiceNumbers !== undefined && appSettings.useNiceNumbers !== this._useNiceNumbers)
                            {
                                this.useNiceNumbers(appSettings.useNiceNumbers);
                            }

                            if (appSettings.hoverParams !== undefined && appSettings.hoverParams !== this._hoverParams)
                            {
                                this._hoverParams = appSettings.hoverParams;
                                this.onHoverParamsChanged();
                            }

                            if (appSettings.selectionParams !== undefined && appSettings.selectionParams !== this._selectionParams)
                            {
                                this._selectionParams = appSettings.selectionParams;
                                this.onSelectionParamsChanged();
                            }

                            if (appSettings.lastFileName)
                            {
                                this._initFilename = appSettings.lastFileName;
                            }

                            if (appSettings.animationData)
                            {
                                this._animationData = appSettings.animationData;
                                this.onAnimationDataChanged();
                            }

                            if (appSettings.chartFrameData)
                            {
                                this._chartFrameData = appSettings.chartFrameData;
                                this.onChartFrameDataChanged();
                            }

                        }
                    }
                    finally
                    {
                        this._isSavingSettingsDisabled = false;
                    }
                }

            }
        }

        shapeColor(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._shapeColor;
            }

            this._shapeColor = value;

            this.onShapeColorChanged();
        }

        onShapeColorChanged()
        {
            var cr = (this._shapeColor === "beach blue" || this._shapeColor === "beachblue") ? "#0cf" : this._shapeColor;
            this._bpsHelper.setShapeColor(cr);

            AppClass.instance.onAppShapeColorChanged();
            this.saveAppSettings();

            this.onDataChanged("shapeColor");
        }

        shapeImage(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._shapeImage;
            }

            this._shapeImage = value;
            this.onShapeImageChanged();
        }

        onShapeImageChanged()
        {
            var value = this._shapeImage;

            this._bpsHelper.setShapeImage(value);
            this.saveAppSettings();

            this.onDataChanged("shapeImage");
        }

        canvasColor(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._canvasColor;
            }

            this._canvasColor = value;

            this.onCanvasColorChanged();
        }

        onCanvasColorChanged()
        {
            var cr = (this._canvasColor === "beach blue" || this._canvasColor === "beachblue") ? "#0cf" : this._canvasColor;
            this._bpsHelper.setCanvasColor(cr);
            this.saveAppSettings();

            this.onDataChanged("canvasColor");
        }

        drawingPrimitive(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.DrawPrimitive[this._drawingPrimitive];
            }

            var dpValue = bps.DrawPrimitive[value];
            if (dpValue !== this._drawingPrimitive)
            {
                this._drawingPrimitive = dpValue;
                this.saveAppSettings();

                AppClass.instance.setAutualDrawingPrimitive();

                this.onDataChanged("drawingPrimitive");
            }
        }

        isContinuousDrawing(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isContinuousDrawing;
            }

            this._isContinuousDrawing = value;
            this._bpsHelper.setContinuousDrawing(value);

            this.onDataChanged("isContinuousDrawing");
            this.saveAppSettings();
        }

        chartFrameOpacity(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._chartFrameData.opacity;
            }

            this._chartFrameData.opacity = value;

            this.onDataChanged("chartFrameOpacity");
            this.onChartFrameDataChanged();
        }

        onChartFrameDataChanged()
        {
            this.saveAppSettings();
            this._bpsHelper.setChartFrameData(this._chartFrameData);
        }

        isAnimationEnabled(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._animationData.isAnimationEnabled;
            }

            this._animationData.isAnimationEnabled = value;
            this.onAnimationDataChanged();

            this.onDataChanged("isAnimationEnabled");
        }

        isStaggeringEnabled(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._animationData.isStaggeringEnabled;
            }

            this._animationData.isStaggeringEnabled = value;
            this.onAnimationDataChanged();

            this.onDataChanged("isStaggeringEnabled");
        }

        easeFunction(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.EaseFunction[this._animationData.easeFunction];
            }

            this._animationData.easeFunction = bps.EaseFunction[value];
            this.onAnimationDataChanged();

            this.onDataChanged("easeFunction");
        }

        easeType(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.EaseType[this._animationData.easeType];
            }

            this._animationData.easeType = bps.EaseType[value];
            this.onAnimationDataChanged();

            this.onDataChanged("easeType");
        }

        animationDuration(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._animationData.animationDuration;
            }

            this._animationData.animationDuration = value;
            this.onAnimationDataChanged();

            this.onDataChanged("animationDuration");
        }

        maxStaggerTime(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._animationData.maxStaggerTime;
            }

            this._animationData.maxStaggerTime = value;
            this.onAnimationDataChanged();

            this.onDataChanged("maxStaggerTime");
        }

        onAnimationDataChanged()
        {
            this.saveAppSettings();
            this._bpsHelper.setAnimationData(this._animationData);
        }

        hoverMatch(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.HoverMatch[this._hoverParams.hoverMatch];
            }

            this._hoverParams.hoverMatch = bps.HoverMatch[value];

            this.onDataChanged("hoverMatch");
            this.onHoverParamsChanged();
        }

        hoverEffect(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.HoverEffect[this._hoverParams.hoverEffect];
            }

            this._hoverParams.hoverEffect = bps.HoverEffect[value];

            this.onDataChanged("hoverEffect");
            this.onHoverParamsChanged();
        }

        hoverColor(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._hoverParams.hoverColor;
            }

            this._hoverParams.hoverColor = value;

            this.onDataChanged("hoverColor");
            this.onHoverParamsChanged();
        }

        hoverSize(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._hoverParams.squareSize;
            }

            this._hoverParams.squareSize = value;

            this.onDataChanged("hoverSize");
            this.onHoverParamsChanged();
        }

        onHoverParamsChanged()
        {
            this._bpsHelper.setHoverParams(this._hoverParams);
            this.saveAppSettings();
        }

        isTooltipsEnabled(value?: boolean)
        {
            if (arguments.length === 0)
            {
                var enabled = (this._isTooltipsEnabled && !AppClass.instance._isEngineDrawing);
                return enabled;
            }

            this._isTooltipsEnabled = value;

            this.onDataChanged("isTooltipsEnabled");
            this.saveAppSettings();
        }

        selectedColorEffect(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.ColorEffect[this._selectionParams.selectedParams.colorEffect];
            }

            this._selectionParams.selectedParams.colorEffect = bps.ColorEffect[value];
            this.onDataChanged("selectedColorEffect");

            this.onSelectionParamsChanged();
        }

        unselectedColorEffect(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.ColorEffect[this._selectionParams.unselectedParams.colorEffect];
            }

            this._selectionParams.unselectedParams.colorEffect = bps.ColorEffect[value];
            this.onDataChanged("unselectedColorEffect");

            this.onSelectionParamsChanged();
        }

        selectedColor(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._selectionParams.selectedParams.color;
            }

            this._selectionParams.selectedParams.color = value;
            this.onDataChanged("selectedColor");

            this.onSelectionParamsChanged();
        }

        unselectedColor(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._selectionParams.unselectedParams.color;
            }

            this._selectionParams.unselectedParams.color = value;
            this.onDataChanged("unselectedColor");

            this.onSelectionParamsChanged();
        }

        selectedColorFactor(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._selectionParams.selectedParams.colorFactor;
            }

            this._selectionParams.selectedParams.colorFactor = value;
            this.onDataChanged("selectedColorFactor");

            this.onSelectionParamsChanged();
        }

        unselectedColorFactor(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._selectionParams.unselectedParams.colorFactor;
            }

            this._selectionParams.unselectedParams.colorFactor = value;
            this.onDataChanged("unselectedColorFactor");

            this.onSelectionParamsChanged();
        }

        onSelectionParamsChanged()
        {
            this._bpsHelper.setSelectionParams(this._selectionParams);
            this.saveAppSettings();
        }

        isMenuTextVisible(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isMenuTextVisible;
            }

            this._isMenuTextVisible = value;
            this.saveAppSettings();

            if (value)
            {
                vp.select(this.container, ".iconBarRow").css("height", "");
                this._appStyleSheet.addRule(".textOfCombo", "display: block");
            }
            else
            {
                vp.select(this.container, ".iconBarRow");
                this._appStyleSheet.addRule(".textOfCombo", "display: none");
            }

            this.onDataChanged("isMenuTextVisible");
            AppClass.instance.layoutScreen();            // make sure everything lines up after change
        }

        isMenuIconVisible(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isMenuIconVisible;
            }

            this._isMenuIconVisible = value;
            this.saveAppSettings();

            if (value)
            {
                this._appStyleSheet.addRule(".iconOfCombo", "display: inline-block");
            }
            else
            {
                this._appStyleSheet.addRule(".iconOfCombo", "display: none");
            }

            this.onDataChanged("isMenuIconVisible");
            AppClass.instance.layoutScreen();            // make sure everything lines up after change
        }

        isMenuChevronVisible(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isMenuChevronVisible;
            }

            this._isMenuChevronVisible = value;
            this.saveAppSettings();

            if (value)
            {
                this._appStyleSheet.addRule(".chevronOfCombo", "display: inline-block");
            }
            else
            {
                this._appStyleSheet.addRule(".chevronOfCombo", "display: none");
            }

            this.onDataChanged("isMenuChevronVisible");
        }

        isColPickerSorted(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isColPickerSorted;
            }

            this._isColPickerSorted = value;

            this.onDataChanged("isColPickerSorted");
            this.saveAppSettings();
        }

        panelOpacity(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._panelOpacity;
            }

            this._panelOpacity = value;
            this.onDataChanged("panelOpacity");
            this.saveAppSettings();
        }

        is3dGridAlwaysOn(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._is3dGridAlwaysOn;
            }

            this._is3dGridAlwaysOn = value;
            this.onDataChanged("is3dGridAlwaysOn");
            this.saveAppSettings();

            this.on3dViewChanged();
        }

        on3dViewChanged()
        {
            var chartName = AppClass.instance._chartName;

            var is3dView = (chartName === "Density" || chartName === "Radial" || chartName === "Violin" ||
                chartName === "Stacks" || chartName === "Scatter-3D" || chartName === "Scatter");

            var use3DGrid = (chartName === "Stacks" || chartName === "Scatter-3D");

            this._lightingParams.isLightingEnabled = (this._isLightingAlwaysOn || is3dView);
            this.onLightingParamsChanged();

            this.saveAppSettings();

            var use3dGrid = (this._is3dGridAlwaysOn || use3DGrid);
            this._bpsHelper.set3dGridVisible(use3dGrid);
        }

        isWheelInertia(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isWheelInertia;
            }

            this._isWheelInertia = value;
            this._bpsHelper.setWheelInertia(value);

            this.saveAppSettings();
            this.onDataChanged("isWheelInertia");
        }

        showWheelDuringTransformMode(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._showWheelDuringTransformMode;
            }

            this._showWheelDuringTransformMode = value;
            this._bpsHelper.showWheelDuringTransformMode(value);

            this.onDataChanged("showWheelDuringTransformMode");
            this.saveAppSettings();
        }

        isLightingAlwaysOn(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isLightingAlwaysOn;
            }

            this._isLightingAlwaysOn = value;
            this.onDataChanged("isLightingAlwaysOn");

            this.on3dViewChanged();
        }

        ambientLightLevel(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._lightingParams.ambientLight.lightFactor;
            }

            this._lightingParams.ambientLight.lightFactor = value;
            this.onDataChanged("ambientLightLevel");

            this.onLightingParamsChanged();
        }

        onLightingParamsChanged()
        {
            this._bpsHelper.setLightingParams(this._lightingParams);
        }

        cacheLocalFiles(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._cacheLocalFiles;
            }

            this._cacheLocalFiles = value;
            this.onDataChanged("cacheLocalFiles");
            this.saveAppSettings();
        }

        cacheWebFiles(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._cacheWebFiles;
            }

            this._cacheWebFiles = value;
            this.onDataChanged("cacheWebFiles");
            this.saveAppSettings();
        }

        useNiceNumbers(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._useNiceNumbers;
            }

            this._useNiceNumbers = value;
            this.onDataChanged("useNiceNumbers");
            this.saveAppSettings();

            AppClass.instance.onUseNiceNumbersChanged();
        }

        defaultBins(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._defaultBins;
            }

            this._defaultBins = value;
            this.onDataChanged("defaultBins");
            this.saveAppSettings();

            AppClass.instance.applyDefaultBins();
        }

        playbackDuration(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._playbackDuration;
            }

            this._playbackDuration = value;
            this.saveAppSettings();

            AppClass.instance.onAppPlaybackDurationChanged();

            this.onDataChanged("playbackDuration");
        }

        isPlaybackLooping(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isPlaybackLooping;
            }

            this._isPlaybackLooping = value;
            this.saveAppSettings();

            AppClass.instance.onAppPlaybackLoopngChanged();

            this.onDataChanged("isPlaybackLooping");
        }

        rememberLastFile(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._rememberLastFile;
            }

            this._rememberLastFile = value;
            this.onDataChanged("rememberLastFile");
            this.saveAppSettings();
        }

        rememberLastSession(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._rememberLastSession;
            }

            this._rememberLastSession = value;
            this.onDataChanged("rememberLastSession");
            this.saveAppSettings();
        }

        initialChartType(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.ChartType[this._initialChartType];
            }

            this._initialChartType = bps.ChartType[value];
            this.onDataChanged("initialChartType");
            this.saveAppSettings();
        }

        initialLayout(value?: string)
        {
            if (arguments.length === 0)
            {
                return bps.Layout[this._initialLayout];
            }

            this._initialLayout = bps.Layout[value];
            this.onDataChanged("initialLayout");
            this.saveAppSettings();
        }

        isShowingChartStatus(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isShowingChartStatus;
            }

            this._isShowingChartStatus = value;
            this._bpsHelper.setChartDebugInfo(value);
            this.saveAppSettings();

            this.onDataChanged("isShowingChartStatus");
        }

        isShowingLastCycle(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isShowingLastCycleStats;
            }

            this._isShowingLastCycleStats = value;

            vp.select(this.container, ".lastCycleFPS").css("display", (value) ? "" : "none");
            this.saveAppSettings();

            this.onDataChanged("isShowingLastCycle");
        }

        isShowingEventStats(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isShowingEventStats;
            }

            this._isShowingEventStats = value;

            vp.select(this.container, ".eventStats").css("display", (value) ? "" : "none");
            this.saveAppSettings();

            this.onDataChanged("isShowingEventStats");
        }

        isErrorReportingDisabled(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isErrorReportingDisabled;
            }

            this._isErrorReportingDisabled = value;
            this.saveAppSettings();

            this.onDataChanged("isErrorReportingDisabled");
        }

        showXGridLines(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._chartFrameData.xAxis.drawGridLines;
            }

            this._chartFrameData.xAxis.drawGridLines = value;

            this.onDataChanged("showXGridLines");

            this.onChartFrameDataChanged();
        }

        showYGridLines(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._chartFrameData.yAxis.drawGridLines;
            }

            this._chartFrameData.yAxis.drawGridLines = value;

            this.onDataChanged("showYGridLines");
            this.onChartFrameDataChanged();
        }

        shapeOpacity(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._shapeOpacity;
            }

            this._shapeOpacity = value;

            AppClass.instance.onAppShapeOpacityChanged();

            this._bpsHelper.setShapeOpacity(value);
            this.onDataChanged("shapeOpacity");
        }

        automatedTestName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._automatedTestName;
            }

            this._automatedTestName = value;
            this.onDataChanged("automatedTestName");
        }

        /** Reset all persisted app settings. */
        resetSettingsAndReloadData()
        {
            this.resetAppSettings();
            this.saveAppSettings();

            AppClass.instance.loadInitialDataSet();
        }

    }

    export class AppSettings
    {
        //---- to enforce latest default settings and new features, we set the "versionNum" to the build num that created it. ----
        versionNum: string;        

        //---- CHART tab ----
        shapeColor: string;
        shapeImage: string;
        canvasColor: string;
        drawingPrimitive: string;
        isColPickerSorted: boolean;
        isContinuousDrawing: boolean;
        chartFrameData: bps.ChartFrameData;

        //---- ANIMATION tab ----
        animationData: bps.AnimationData; 

        //---- HOVER tab ----
        hoverParams: bps.HoverParams;
        isTooltipsEnabled: boolean;

        //---- SELECTION tab ----
        selectionParams: bps.SelectionParams;

        //---- UI tab ----
        isMenuTextVisible: boolean;
        isMenuIconVisible: boolean;
        isMenuChevronVisible: boolean;
        sortColumnsInPicker: boolean;
        panelOpacity: number;

        //---- 3D tab ----
        is3dGridAlwaysOn: boolean;
        isWheelInertia: boolean;
        showWheelDuringTransformMode: boolean;
        isLightingAlwaysOn: boolean;
        ambientLightLevel: number;

        //---- DATA tab ----
        cacheLocalFiles: boolean;
        cacheWebFiles: boolean;
        useNiceNumbers: boolean;
        defaultBins: number;

        //---- INSIGHT tab ----
        playbackDuration: number;
        isPlaybackLooping: boolean;

        //---- STARTUP tab ----
        rememberLastFile: boolean;
        rememberLastSession: boolean;
        lastFileName: string;
        initialChartType: bps.ChartType;
        initialLayout: bps.Layout;

        //---- DEBUG tab ----
        showDebugStatus: boolean;
        showLastCycle: boolean;
        showEventStats: boolean;
        isErrorReportingDisabled: boolean;

        constructor(versionNum: string)
        {
            this.versionNum = versionNum;
        }
    }
}