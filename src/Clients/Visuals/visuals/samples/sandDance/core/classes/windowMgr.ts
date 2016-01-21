//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    windowMgr.ts - manages the mouse and drag events on the svgDOc.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /** Manages the UI events (mouse and touch) for the chart.  These should eventually ALL be moved to the client. */
    export class WindowMgrClass extends DataChangerClass
    {
        private container: HTMLElement;

        private _dataMgr: DataMgrClass;
        private _view: DataViewClass;
        private _svgDoc: HTMLElement;
        private _canvasElem: HTMLCanvasElement;
        private _ptLastDown = { x: 0, y: 0 };
        private _svgWidth = 0;
        private _svgHeight = 0;
        private _showDebugStats = true;
        private _showFileInfo = true;
        private _ptTouch = { x: 0, y: 0 };
        private _areTransformsEnabled = false;
        private _transformWheel: TransformWheelClass;
        private _transformMgr: TransformMgrClass; 
        private _isMouseDown = false;
        private _hammertime = null;
        private _showWheelDuringTransformMode = false;

        //---- event handling ----
        _isTouchEnabled = true;
        _delayTimer = null;             // used to throttle the massive amount of touch / mouse messages
        _wheelTimer = null;             // used to hide wheel after user starts using it
        _isPinching = false;            // use to prevent accidental pan when 1 finger is released
        _isSomeControlDragging = false;     // true if a gauge or other control is using mouse move messages
        _isCtrlKeyDown = false;

        _ieTouchCount = 0;
        _appMgr: AppMgrClass;
        _isVaas = false;

        _fileInfoElem: HTMLElement;
        _visStatsElem: HTMLElement;
        _gpuStatsElem: HTMLElement;

        constructor(container: HTMLElement, appMgr: AppMgrClass, dataView: DataViewClass, svgDoc: HTMLElement, canvasElem: HTMLCanvasElement, dataMgr: DataMgrClass,
            fileInfoElem: HTMLElement, visStatsElem: HTMLElement, gpuStatsElem: HTMLElement, isVaas: boolean)
        {
            super();

            this.container = container;

            this._appMgr = appMgr;
            this._view = dataView;
            this._svgDoc = svgDoc;
            this._canvasElem = canvasElem;
            this._fileInfoElem = fileInfoElem;
            this._visStatsElem = visStatsElem;
            this._gpuStatsElem = gpuStatsElem;
            this._isVaas = isVaas;
            this._transformMgr = dataView.getTransformMgr();
            this._view._windowMgr = this;

            this.setChartInfo("<no file loaded>");

            this.hookEvents();

            this._dataMgr = dataMgr;

            this._dataMgr.registerForChange("dataFrame", (e) =>
            {
                var df = this._dataMgr.getDataFrame();
                var fn = this._dataMgr.getFilename();
                //var colMappings = this._dataMgr.getColMappings();

                if (df)
                {
                    var count = df.getRecordCount();

                    //vp.utils.debug("openKnown: fn=" + fn + ", records=" + count);

                    this.setChartInfo(fn + ": " + count + " records");

                    //this._view.bindings(colMappings);
                    //this._view.setDataStream(jsonData, colMappings);
                }
                else
                {
                    throw ("Error reading data file: " + fn + ", " + e.response);
                }
            });

            var wheelSize = 100;        // this will get resized
            this._transformWheel = new TransformWheelClass(this, svgDoc, wheelSize);
            this._transformWheel.isActive(false);

            svgDoc.ondblclick = (e) =>
            {
                if (true)       // this._areTransformsEnabled)
                {
                    this.resetStuff();
                }
            };

            this.onDataStreamChanged();

            this.areTransformsEnabled(false);

            canvasElem.tabIndex = 0;
            canvasElem.focus();

            //---- enalble DRAG and DROP on whole PLOT ENGINE document ---
            // setTimeout((e) =>
            // {
            //     vp.select(document.body)
            //         .attach("dragover", (e) => e.preventDefault())
            //         .attach("drop", (e) => this.processEngineDroppedTextOrFile(e));
            // }, 1);
        }

        processEngineDroppedTextOrFile(e)
        {
            e.preventDefault();

            var dt = e.dataTransfer;
            var files = dt.files;

            if (files && files.length)
            {
                var file = files[0];
                var reader = new FileReader();
                var name = file.name;

                //---- avoid processing image files (especially if its an accidental drag of our of 1 of our icons) ----
                if (!utils.isImageFile(name))
                {
                    var reader = new FileReader();
                    reader.onload = (e) =>
                    {
                        // get file content
                        var text = (<any>e.target).result;

                        var wdParams = new bps.WorkingDataParams(file.name, file.name);
                        wdParams.hasHeader = true;
                        wdParams.separator = (file.name.endsWith(".txt")) ? "\t" : ",";
                        wdParams.fileType = bps.FileType.delimited;

                        //---- supply a dataName so we can refer to this open data source when needed ----
                        wdParams.dataName = file.name;

                        this._dataMgr.setDataDirect(text, wdParams);
                    };
                }

                //---- start the ASYNC read of the dropped file ----
                reader.readAsText(file);
            }
            else
            {
                //---- process the dropped TEXT ----
                var text = dt.getData("text"); if (text.contains("\t"))
                {
                    var fn = "dragAndDrop.txt";
                    var wdParams = new bps.WorkingDataParams(fn);
                    wdParams.hasHeader = true;
                    wdParams.separator = "\t";
                    wdParams.fileType = bps.FileType.delimited;

                    //---- supply a dataName so we can refer to this open data source when needed ----
                    wdParams.dataName = fn;

                    this._dataMgr.setDataDirect(text, wdParams);
                }
                else
                {
                    //---- process the dropped TEXT ----
                    var text = dt.getData("text");

                    this._appMgr.processEngineDroppedText(text);
                }
            }
        }

        //hitTestPendingRect(selectMode: bps.SelectMode)
        //{
        //    this._view.hitTestRectWithSelect(this._rcDragAndHold, selectMode);
        //}

        areTransformsEnabled(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._areTransformsEnabled;
            }

            this._areTransformsEnabled = value;
            this._transformWheel.isActive(value && this._showWheelDuringTransformMode);

            if (this._hammertime)
            {
                if (value)
                {
                    //---- ENABLE panning (aka, mouseMove) ----
                    this._hammertime.get('pan').set({ direction: (<any>Hammer).DIRECTION_ALL });
                }
                else
                {
                    //---- DISABLE panning (aka, mouseMove) ----
                    this._hammertime.get('pan').set({ direction: (<any>Hammer).DIRECTION_NONE });
                }
            }

            this.onDataChanged("areTransformsEnabled");
        }

        showWheelDuringTransformMode(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._showWheelDuringTransformMode;
            }

            this._showWheelDuringTransformMode = value;

            this._transformWheel.isActive(value && this._areTransformsEnabled);

            this.onDataChanged("showWheelDuringTransformMode");
        }

        showDebugStats(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._showDebugStats;
            }

            this._showDebugStats = value;
            this.onDataChanged("showDebugStats");

            vp.dom.css(this._visStatsElem, "display", (value) ? "block" : "none");
            vp.dom.css(this._gpuStatsElem, "display", (value) ? "block" : "none");
        }

        /** This code is used to draw the circle and for hit-testing.  Coordinates are plot-relative. */
        getRotationBounds()
        {
            var rc = this._view.getPlotBoundsInPixels();

            //---- return 30% center of plot ----
            var size = .3 * Math.min(rc.width, rc.height);
            var radius = size / 2;

            var rc = vp.geom.createRect(rc.width / 2 - radius, rc.height / 2 - radius, size, size);
            return rc;
        }

        getCurrentView()
        {
            return this._appMgr._dataView;
        }

        showFileInfo(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._showFileInfo;
            }

            if (!this._isVaas)
            {
                this._showFileInfo = value;
                vp.dom.css(this._fileInfoElem, "display", (value) ? "block" : "none");
            }

            this.onDataChanged("showFileInfo");
        }

        setChartInfo(msg: string)
        {
            if (!this._isVaas && this._fileInfoElem)
            {
                this._fileInfoElem.innerText = msg;
            }
        }

        getTransformMgr()
        {
            return this._transformMgr;
        }

        resetStuff()
        {
            this._isPinching = false;
            this.onDragChanged();

            this._transformMgr.inertia([0, 0, 0]);

            this._transformMgr.resetCamera();
            this._view.markBuildNeeded("resetStuff");

            this._transformWheel.partTouched("");
        }

        setBounds(left: number, top: number, width: number, height: number)
        {
            this._svgWidth = width;
            this._svgHeight = height;

            //---- center the transformWheel ----
            var left = width / 2;           // circle is drawn from center, so this works
            var top = height / 2 - 10;      // fudge factor

            var wheelSize = .8 * Math.min(width, height);
            this._transformWheel.wheelSize(wheelSize);

            vp.select(this._transformWheel._group)
                .translate(left, top);
        }

        openLocalFile()
        {
            //---- invoke the "file open" dialog by manually triggering the event ----
            // vp.select("#fileBrowse")[0].click();
        }

        onDataStreamChanged()
        {
            this.resetStuff();
        }

        setChartType(name: string)
        {
            this._view.setChartType(name);
        }

        openKnown(name: string)
        {
            this.setChartInfo("opening file: " + name);

            this._dataMgr.loadKnownAsync(name);
        }

        hookEvents()
        {
            // Prevent the Windows-rendered "box" that appears before the context menu appears [note: this works for IE only]
            // document.body.addEventListener("MSHoldVisual", function (e) { e.preventDefault(); }, false);

            //---- route the contextMenu event to the client ----
//             document.body.addEventListener("contextmenu", (e) =>
//             {
//                 var mousePosition = vp.events.mousePosition(e);
//                 var isDragSelecting = false;        /// this._rubberBandSelector.isDraggingRect();
// 
//                 this._appMgr.onContextMenu(isDragSelecting, mousePosition);
// 
//                 e.preventDefault();
//             }, false);

            this._view.registerForChange("dataStream", (e) =>
            {
                this.onDataStreamChanged();
            });

            //---- TODO: see this article to update our touch code: ----
            //---- http://blogs.msdn.com/b/ie/archive/2011/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx) ----
            //---- OR use a touch library ----

            //---- for NON-IE ----
            vp.events.attach(this._svgDoc, "mouseup", (e) =>
            {
                //alert("got touchend");

                if (e.touches === null || e.touches === undefined || (e.touches && e.touches.length === 0))
                {
                    this._isPinching = false;
                    this.onDragChanged();

                    this.onMouseUpRelated();
                }
            });

            this._svgDoc.onmouseleave = (e) =>
            {
                this._view.onMouseLeaveChart();
            };

            //---- history: we used to use "pointerdown" event for this, but it caused issues with browser control & non IE browers ----
            //---- MOUSEDOWN fires for TOUCH as well as MOUSE DOWN, so we use it ----
            vp.events.attach(this._svgDoc, "mousedown", (e) =>
            {
                this.onMouseDown(e);
            });

            this._svgDoc.onpointerleave = (e) =>
            {
                this._view.onMouseLeaveChart();
            };

            //---- "wheel" replaces the depreciated "mousewheel" event ----
            vp.events.attach(window, "wheel", (e) =>
            {
                if (this._areTransformsEnabled)
                {
                    var mousePos = vp.events.mousePosition(e, this._svgDoc);
                    var wheelDelta = (Math.abs(e.deltaX) > Math.abs(e.deltaY)) ? e.deltaX : e.deltaY;

                    if (wheelDelta > 0)
                    {
                        this._transformMgr.scaleCameraRelative(1.3, mousePos);
                    }
                    else
                    {
                        this._transformMgr.scaleCameraRelative(1 / 1.3, mousePos);
                    }
                }
            });

            this.hookHammerEvents();

            //---- always do this, so we can update 3D transform mode cursor ----
            // vp.select(".sandDance").attach("movemove", (e) => this.onPlotMouseMove(e));
            this.container.addEventListener("movemove", (e) => this.onPlotMouseMove(e));

            if (window.location.href.contains("isBrowserControl"))
            {
                //---- in case of hammer pan not working, hook mousemove also (hammer doesn't work in browser control?) ----
                // vp.select(".sandDance").attach("mousemove", (e) =>
                this.container.addEventListener("mousemove", (e) =>
                {
                    if (this._isTouchEnabled && !this._isPinching)
                    {
                        this.onPanEvent(e);
                    }
                });
            }

            this.hookKeyboardEvents();
        }

        /** called from "pointerDown" event (for IE touch and mouse) and from "mouseDown" event (for non IE). */
        onMouseDown(e)
        {
            // this._transformWheel.show(true);

            this._transformMgr.onUiOpStart();
            this._isMouseDown = true;

            vp.utils.debug("onMouseDown called");
            //vp.select("#consoleDiv").text("windowMgr got mouseDown");

            //---- tell client, so it can cancel context menu, etc. ----
            var pt = vp.events.mousePosition(e, this._canvasElem);
            this._appMgr.onChartMouseDown(pt, e);

            this._ptLastDown = pt;

            this.startWheelTimer();
        }

        stopWheelTimer()
        {
            if (this._wheelTimer)
            {
                clearTimeout(this._wheelTimer);
                this._wheelTimer = null;
            }
        }
    

        startWheelTimer()
        {
            this.stopWheelTimer();

            if (this._areTransformsEnabled)
            {
                this._wheelTimer = setTimeout((e) =>
                {
                    //---- after 1000 ms of using wheel, hide it until mouse up ----
                    this._transformWheel.show(false);
                }, 1000);
            }
        }

        hookHammerEvents()
        {
            var hammerOpts = { preventDefault: false };

            var hammertime = new (<any>Hammer)(this._svgDoc, hammerOpts);
            this._hammertime = hammertime;

            //---- enable PINCH ----
            hammertime.get('pinch').set({ enable: true });

            //---- enable 2-finger ROTATION ----
            //hammertime.get('rotate').set({ enable: true });

            hammertime.on('pinchstart', (e) =>
            {
                this._transformMgr.resetPanAndPinchDeltas();
            });

            hammertime.on('panstart', (e) =>
            {
                this._transformMgr.onUiOpStart();
                this._ptTouch = this.avgTouchPosition(e);

            });

            //---- don't need this - it is covered by pointerup (IE) and mouseUP (other) ----
            //hammertime.on('panend', (e) =>
            //{
            //    this._transformWheel.partTouched("");

            //    this._transformMgr.onUiOpStop();
            //});

            hammertime.on('pan', (e) =>
            {
                //vp.utils.debug("raw pan event");

                if (this._isTouchEnabled && !this._isPinching)
                {
                    this.onPanEvent(e);
                }
            });

            hammertime.on('swipe', (ev) =>
            {
                //console.log("swipe: " + ev);
            });

            hammertime.on('pinch', (e) =>
            {
                if (this._isTouchEnabled && this._areTransformsEnabled)
                {
                    //---- ignore single finger when user is removing 1 finger at a time from pinch ----
                    var pointerCount = e.pointers.length;
                    if (pointerCount >= 2)
                    {
                        this._isPinching = true;
                        var touchPos = this.avgTouchPosition(e);

                        vp.utils.debug("--> pinch event: x==" + touchPos.x + ", y=" + touchPos.y + ", scale=" + e.scale);

                        this._transformMgr.scaleCameraAbsolute(e.scale, touchPos);

                        this.setNextMsgDelay();
                    }
                }
            });

            //hammertime.on('rotate', (ev) =>
            //{
            //    if (this._isTouchEnabled)
            //    {
            //        var value = ev.rotation / 1000;

            //        console.log("rotate rotation=" + value);
            //        this._transformMgr.rotateMatrixZAbsolute(value);

            //        this.setNextMsgDelay();
            //    }
            //});

        }

        /** pt is a point to be tested, in engine document ("chart") coordinates. */
        get3dWheelPartTouched(pt)
        {
            var partTouched = "";

            if (this._showWheelDuringTransformMode)
            {
                partTouched = this._transformWheel.partTouched();
            }
            else
            {
                /// when the wheel is hidden, we use a BIGGER circle that is pulsed (drawn at various times)
                /// but not always visible.  This bigger circle is centered in the plot area and 
                /// is defined by this.getRotationBounds().

                //---- this is PLOT relative ----
                var rcRotation = this.getRotationBounds();

                var scale = sandDance.commonUtils.getScale(this.container);

                //var ptAdjust = { x: pt.x - rcPlot.left, y: pt.y - rcPlot.top };

                vp.utils.debug("plot relative pt: " + pt.x + ", " + pt.y);

                //---- test if pt is in circle defined by rcPlot ----
                var radius = rcRotation.width / 2;
                var xMiddle = rcRotation.left + radius;
                var yMiddle = rcRotation.top + radius;
                var xDist = pt.x / scale.x - xMiddle;
                var yDist = pt.y / scale.y - yMiddle;

                if (Math.sqrt(xDist * xDist + yDist * yDist) <= radius)
                {
                    //---- do free form transform ----
                    partTouched = "middle";
                }
                else
                {
                    //---- treat movement as pan ----
                    partTouched = "";
                }
            }

            return partTouched;
        }

        onPanEvent(e)
        {
            if (this._areTransformsEnabled)
            {
                var lastTouch = this._ptTouch;
                var thisTouch = this.avgTouchPosition(e);

                vp.utils.debug("onPanEvent: lastTouch.x=" + lastTouch.x + ", .y=" + lastTouch.y);

                var deltaX = thisTouch.x - lastTouch.x;
                var deltaY = thisTouch.y - lastTouch.y;

                var partTouched = this.get3dWheelPartTouched(this._ptLastDown);

                this._ptTouch = thisTouch;

                var delta = (Math.abs(deltaX) > Math.abs(deltaY)) ? deltaX : deltaY;
                var speedFactor = 1 / 100;

                vp.utils.debug("deltaX=" + deltaX + ", deltaY=" + deltaY);

                //---- make mouse event look like hammer event, if needed ----
                if (!e.srcEvent)
                {
                    e.srcEvent = e;
                }

                //if (!this._showWheelDuringTransformMode)
                //{
                //    var svgWidth = this._svgWidth;
                //    var svgHeight = this._svgHeight;

                //    var rcRotation = this.getRotationBounds();
                //    if (vp.geom.rectContainsPoint(rcRotation, this._ptLastDown))
                //    {
                //        //---- do free form transform ----
                //        partTouched = "middle";
                //    }
                //    else
                //    {
                //        //---- treat movement as pan ----
                //        partTouched = "";
                //    }
                //}

                if ((e.srcEvent.ctrlKey && e.srcEvent.shiftKey) || (partTouched === "circle"))
                {
                    //---- CTRL + SHIFT + drag = SPIN ----
                    this._transformMgr.rotateMatrixZ(delta * speedFactor);
                }

                if ((e.srcEvent.ctrlKey) || (partTouched === "hBar") || (partTouched === "middle"))
                {
                    //---- CTRL + drag = TURN ----
                    this._transformMgr.rotateMatrixY(-deltaX * speedFactor);
                }

                if ((e.srcEvent.shiftKey) || (partTouched === "vBar") || (partTouched === "middle"))
                {
                    //---- SHIFT + drag = FLIP ----
                    this._transformMgr.rotateMatrixX(-deltaY * speedFactor);
                }

                if ((!e.srcEvent.shiftKey) && (!e.srcEvent.ctrlKey) && (partTouched === ""))
                {
                    //---- MOVE ----
                    var mousePos = vp.events.mousePosition(e, this._canvasElem);
                    this._transformMgr.moveCamera(e.deltaX / 100, -e.deltaY / 100, mousePos);
                }

                this.setNextMsgDelay();
            }
        }

        onDragChanged()
        {
            this._isTouchEnabled =
            //(!this._dragObj && !this._delayTimer && !this._isSomeControlDragging);
            (!this._delayTimer && !this._isSomeControlDragging);
        }

        avgTouchPosition(e)
        {
            //vp.utils.debug("avgTouchPosition: e=" + e + ", e.pointers=" + e.pointers + ", avgTouchPosition.length=" + e.pointers.length);

            var pt = { x: 0, y: 0 };

            if (e.pointers)
            {
                //---- hammer.js event ----
                var count = e.pointers.length;

                for (var i = 0; i < count; i++)
                {
                    var pe = e.pointers[i];

                    var x = (pe.x === undefined || pe.x === null) ? pe.clientX : pe.x;
                    var y = (pe.y === undefined || pe.y === null) ? pe.clientY : pe.y;

                    vp.utils.debug("avgTouchPosition: pe[" + i + "]: x=" + x + ", y=" + y);

                    pt.x += x;
                    pt.y += y;
                }

                if (count)
                {
                    pt.x /= count;
                    pt.y /= count;
                }
            }
            else
            {
                pt = vp.events.mousePosition(e);
            }

            //vp.utils.debug("avgTouchPosition: x=" + pt.x + ", y=" + pt.y);

            return pt;
        }

        setNextMsgDelay()
        {
            this._delayTimer = setTimeout((e) =>
            {
                this._delayTimer = null;
                this.onDragChanged();
            }, 15);

            this.onDragChanged();
        }

        hookKeyboardEvents()
        {
            var canvas = this._canvasElem;
            var rotStep = Math.PI / 64;
            var transformMgr = this._transformMgr;

            vp.events.attach(document.body, "keyup", (e) =>
            {
                this._isCtrlKeyDown = e.ctrlKey;
            });

            vp.events.attach(canvas, "keydown", (e) =>
            {
                //vp.utils.debug("windowMgr - keydown");

                this._isCtrlKeyDown = e.ctrlKey;

                if (e.keyCode === vp.events.keyCodes.down)
                {
                    transformMgr.translateCamera(0, -.1, 0);
                }
                else if (e.keyCode === vp.events.keyCodes.up)
                {
                    transformMgr.translateCamera(0, .1, 0);
                }
                else if (e.keyCode === vp.events.keyCodes.left)
                {
                    transformMgr.translateCamera(-.1, 0, 0);
                }
                else if (e.keyCode === vp.events.keyCodes.right)
                {
                    transformMgr.translateCamera(.1, 0, 0);
                }
                else if (e.keyCode === vp.events.keyCodes.escape)
                {
                    //view.resetCamera();
                    this.resetStuff();

                    //if (this._currentActiveMenu)
                    //{
                    //    this._currentActiveMenu.openControl(false);
                    //}

                    //this.closeDragAndHold();

                    this._appMgr.onEscapeKey();
                }
                else if (e.keyCode === vp.events.keyCodes.A)
                {
                    transformMgr.rotateMatrixY(rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.D)
                {
                    transformMgr.rotateMatrixY(-rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.W)
                {
                    transformMgr.rotateMatrixX(rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.S)
                {
                    transformMgr.rotateMatrixX(-rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.Q)
                {
                    transformMgr.rotateMatrixZ(rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.E)
                {
                    transformMgr.rotateMatrixZ(-rotStep);
                }
                else if (e.keyCode === vp.events.keyCodes.R)
                {
                    var mousePos = vp.events.mousePosition(e, this._svgDoc);

                    transformMgr.scaleCameraRelative(1 / 1.3, mousePos);
                }
                else if (e.keyCode === vp.events.keyCodes.F)
                {
                    var mousePos = vp.events.mousePosition(e, this._svgDoc);

                    transformMgr.scaleCameraRelative(1.3, mousePos);
                }
                else if (e.keyCode === vp.events.keyCodes.pageUp)
                {
                    var sf = this._view.userSizeFactor();
                    this._view.userSizeFactor(sf * 1.3);

                    e.preventDefault();
                }
                else if (e.keyCode === vp.events.keyCodes.pageDown)
                {
                    var sf = this._view.userSizeFactor();
                    this._view.userSizeFactor(sf / 1.3);

                    e.preventDefault();
                }

            });
        }

        onPlotMouseMove(e)
        {
            vp.utils.debug("onPlotMouseMove");

            if (this._areTransformsEnabled)
            {
                var pt = this.avgTouchPosition(e);
                var partTouched = this.get3dWheelPartTouched(pt);

                vp.select(this._svgDoc).css("cursor", (partTouched === "middle") ? "cell" : "move");

                this.setNextMsgDelay();
            }
            else
            {
                vp.select(this._svgDoc).css("cursor", "");
            }
        }

        onMouseUp(e)
        {
            vp.events.cancelEventDefault(e);

            this.onMouseUpRelated();
        }

        onMouseUpRelated()
        {
            this._isMouseDown = false;

            this.stopWheelTimer();

            this._transformMgr.onUiOpStop();

            if (this._areTransformsEnabled) 
            {
                this._transformWheel.show(this._showWheelDuringTransformMode/* || true*/);

                //---- one-use wheel ----
                //this.areTransformsEnabled(false);
            }

            this._transformWheel.partTouched("");

            //---- set focus to CANVAS so that we can hook KEYBOARD events ----
            this._canvasElem.focus();
        }

        /** Called from dataView, based on the chart's onFrame event. */
        onFrame()
        {
            var hasInertia = this._transformMgr.onFrame();

            if ((this._areTransformsEnabled) && (! this._isMouseDown))
            {
                var showIt = (this._showWheelDuringTransformMode && (!hasInertia));

                this._transformWheel.show(showIt);
            }
        }
    }
}
