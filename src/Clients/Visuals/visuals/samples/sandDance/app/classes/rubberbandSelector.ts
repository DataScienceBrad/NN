///-----------------------------------------------------------------------------------------------------------------
/// rubberBandSelector.ts.  Copyright (c) 2015 Microsoft Corporation.
/// Part of the beachParty library
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    var nextSelectorId = 1;
    var maxHoldDist = 5;
    var holdTime = 2000;

    /** Note: this class hooks mouseDOWN using the chart canvas, and mouseUP using "window", 
    so that we can drag outside the chart.  We treat a mouseDOWN with isEnabled=false as a
    notification back to the client (so they can enable an inactive chart). 
    
    Also, this control implements its own context menu (when the mouse is not moved for a certain time).  The goal
    is to eventually use the standard browser context menu event in its place. */
    export class rubberBandSelectorClass extends beachParty.dataChangerClass      
    {
        //---- state ----
        _id = nextSelectorId++;
        _isEnabled = true;
        _isBanding = false;
        _ptMouseDown = null;
        _ptMouseHold = null;            // location where user is "holding" (not moving for holdTime ms)
        _holdTimer = null;
        _rubberBand: vp.dom.IWrapperOuter;   //   ITextBlock = null;      // an HTML absolute positioned DIV or SVG rect
        _selectCallback = null;
        _holdCallback = null;
        _dragSelectCanvas: HTMLElement = null;
        _canvasChanged = false;
        _mouseDownOrigin = "outsideChart";             // insideActiveChart, insideInactiveChart, outsideChart
        _isLeftButtonDown = false;
        _isRightButtonDown = false;
        _pendingUpEvent = false;

        _onMouseMoveFunc = null;
        _onMouseUpFunc = null;
        _isSetCaptureActive = false;

        //---- turn this off until we change this to look like a context menu on touch screen, with normal menu items ----
        _isHoldEnabled = false;

        constructor(dragSelectCanvas: HTMLElement)
        {
            super();

            this._onMouseMoveFunc = (e) => this.onRubberMove(e);
            this._onMouseUpFunc = (e) => this.onRubberUp(e);

            this._dragSelectCanvas = dragSelectCanvas;

            var rubberBand = vp.select(document.createElement("span"))     //   createTextBlock()
                .id("rubberBandSelector")
                .addClass("rubberBand")
                .css("z-index", "9999")
                .css("display", "none")

            this._rubberBand = rubberBand;

            /// try to prevent rubberBand from taking mouse events from the dragSelectCanvas
            /// but none of these really does the trick.
            rubberBand.css("pointer-events", "none");
            rubberBand[0].disabled = true;

            this.hookEvents(false);
        }

        isDragging()
        {
            return this._isBanding;
        }

        public isDraggingRect()
        {
            return (this._isBanding && this._isEnabled);
        }

    
        hookEvents(canvasChanged: boolean)
        {
            //---- always process mouse up, so we can track right mouse button up/down state ----
            vp.select(window).attach("mouseup", (e) => this.onMouseUp(e));

            this._canvasChanged = canvasChanged;

            var canvas = this._dragSelectCanvas;
            if (canvas)
            {
                //---- hook MOUSE DOWN ----
                canvas.onmousedown = (e) => this.onRubberDown(e);
                vp.select(canvas).attach("touchstart", (e) => this.onRubberDown(e));

                vp.select(canvas).attach("keydown", (e) =>
                {
                    if (e.keyCode == vp.events.keyCodes.escape)
                    {
                        this.cancelBanding(true, e);
                    }
                });

                //canvas.appendChild(this._rubberBand.getNative());
                vp.select(".sandDance").append(this._rubberBand[0])
                //document.body.appendChild(this._rubberBand[0]);
            }
        }

        attachOnSelect(callback)
        {
            this._selectCallback = callback;
        }

        attachOnHold(callback)
        {
            this._holdCallback = callback;
        }

        setRubberBand(rc)
        {
            var left = rc.left;
            var top = rc.top;

            //vp.utils.debug("rubberBandSelector.setRubberBand: left=" + rc.left + ", top=" + rc.top + ", width=" + rc.width +
            //    ", height=" + rc.height);

            this._rubberBand
                .css("position", "fixed")//TODO: remove this bad fix.
                .css("left", left + "px")
                .css("top", top + "px")
                .width(rc.width + "px")
                .height(rc.height + "px")
                .css("display", "block")
        }

        showRubberBand(value: boolean)
        {
            if (this._rubberBand)
            {
                this._rubberBand.css("display", (value) ? "block" : "none")
            }
        }

        cancelBanding(clearBanding: boolean, evt?: any)
        {
            this.showRubberBand(false);

            this.clearCapture();

            //---- re-enable text selection by browser (for Chrome, FireFox) ----
            //hostControls.enableElementSelection(document.body, true);

            if (clearBanding)
            {
                this.clearBanding();
            }

            this.clearHoldTimer();
        }

        clearCapture()
        {
            if (this._isSetCaptureActive)
            {
                vp.events.releaseCaptureWindow();
                vp.utils.debug("rubberBandSelection: RELEASE CAPTURE");

                this._isSetCaptureActive = false;
            }
        }

        clearBanding()
        {
            vp.utils.debug("cancelBanding: id=" + this._id);
            this._isBanding = false;
        }

        isToggleKey(evt)
        {
            return (evt.ctrlKey);
        }

        /// debug support: distingish between mouse and touch UP events.
        onTouchUp(evt)
        {
            //---- click on inactive window? ----
            if (!this._isEnabled)
            {
                if (this._mouseDownOrigin != "outsideChart")
                {
                    this.handleClickOnInactiveView(evt);
                }
            }
            else
            {
                this.onRubberUp(evt);
            }
        }

        handleClickOnInactiveView(evt)
        {
            var pt = vp.events.mousePosition(evt);
            var rc = this._dragSelectCanvas.getBoundingClientRect();

            if ((rc.width > 0) && (rc.height > 0))
            {
                if (vp.geom.rectContainsPoint(rc, pt))
                {
                    if (this._selectCallback)
                    {
                        this._selectCallback(evt, null, false, "insideInactiveChart");
                    }
                }
            }
        }

        /// debug support: distingish between mouse and touch UP events.
        onMouseUp(evt)
        {
            vp.utils.debug("rubberBandSelector: onMouseUp");

            //---- in case things get out of sync, always treat UP event as clearing isRightButtonDown ----
            if (true)       // evt.which == 3)
            {
                this._isRightButtonDown = false;
            }

            //---- including this 2nd UP call on IE causes 2 "clear selection" cmds to be recorded, so we don't include it. ----
            //---- the TOUCH up seem to now be required by rubberBand code for proper operation (vs. MOUSE UP). ----
            //---- BUT, Chrome requires this call. ----
            if ((!vp.utils.isIE) || (window.external && (<any>window.external).isHostedInExcel))
            {
                //---- click on inactive window? ----
                if (!this._isEnabled)
                {
                    this.handleClickOnInactiveView(evt);
                }
                else
                {
                    this.onRubberUp(evt);
                }
            }
        }

        cancelPendingUpEvent()
        {
            if (this._pendingUpEvent)
            {
                vp.utils.debug("rubberbandSelection: cancelling pending UP event");
                this._pendingUpEvent = false;

                this.cancelBanding(true);
            }
        }

        onRubberUp(evt)
        {
            //---- to enable a TOUCH context menu to cancel this potential select event, we give it a chance to fire before we process the UP ----
            this._pendingUpEvent = true;

            setTimeout((e) =>
            {
                if (this._pendingUpEvent)
                {
                    this._pendingUpEvent = false;
                    this.onRubberUpCore(evt);
                }
            }, 1);
        }

        onRubberUpCore(evt)
        {
            vp.utils.debug("rubberBandSelector.onRubberUpCore: id=" + this._id + ", isBanding=" + this._isBanding);

            this.clearCapture();

            if (this._isEnabled)
            {
                if (evt.which == 1)
                {
                    this._isLeftButtonDown = false;
                }


                /// this is triggered for all window mouse move events, so its important to only look at them
                /// when we have started a banding operation.
                if (this._isBanding)
                {
                    //vp.utils.debug("rubberBandSelector.onUp: id=" + this._id + ", isEnabled=" + this._isEnabled);

                    var cancelEvent = false;

                    this.clearHoldTimer();

                    //try
                    {
                        //this.cancelBanding(false, evt);
                        this.showRubberBand(false);

                        var toggle = this.isToggleKey(evt);

                        if (evt.type == "touchend")
                        {
                            var ptCurrent = this.changedTouchPosition(evt, null);
                        }
                        else
                        {
                            var ptCurrent = vp.events.mousePosition(evt);
                        }

                        var rcBand = vp.geom.rectFromPoints(ptCurrent, this._ptMouseDown);

                        //---- adjust rcBand so it matches actual location ----
                        var rect = this._dragSelectCanvas.getBoundingClientRect();

                        vp.utils.debug("rcBand: width=" + rcBand.width + ", height=" + rcBand.height);

                        //---- allow for a direct click (no movement) ----
                        if (true)   //(rcBand.width > 3) && (rcBand.height > 3))
                        {
                            vp.utils.debug("calling selectCallback from RUBBER BAND...");

                            if (this._selectCallback)
                            {
                                this._selectCallback(evt, rcBand, toggle, this._mouseDownOrigin);
                            }

                            cancelEvent = true;
                            this.onDataChanged("mouseUp");
                        }

                        //---- if we re banding, do not pass event along ----
                        vp.events.cancelEventDefault(evt);
                        vp.events.cancelEventBubble(evt);

                    }
                    //catch (ex)
                    //{
                    //    vp.utils.debug("Exception in rubber banding: " + ex);
                    //    throw ex;
                    //}
                    //finally
                    //{
                    //    this.cancelBanding(true, evt);
                    //}
                    this.cancelBanding(true, evt);
                }
                else
                {
                    ////---- isBanding=false ==> call back to tell client where the mouse down came from ----
                    //if (this._selectCallback)
                    //{
                    //    this._selectCallback(evt, null, false, this._mouseDownOrigin);
                    //}
                }
            }
            else
            {
                ////---- isEnabled=false ==> call back to tell client where the mouse down came from ----
                //if (this._selectCallback)
                //{
                //    this._selectCallback(evt, null, false, "insideInactiveChart");
                //}
            }

            //---- reset for next mouse down/up ----
            this._mouseDownOrigin = "outsideChart";
        }

        changedTouchPosition(e, elem?: HTMLElement) 
        {
            var x = <number> e.changedTouches[0].pageX;
            var y = <number> e.changedTouches[0].pageY;

            if (elem)
            {
                x -= elem.offsetLeft;
                y -= elem.offsetTop;
            }

            return { x: x, y: y }
        }

        touchPosition(e, elem?: HTMLElement) 
        {
            var x = <number>e.touches[0].pageX;
            var y = <number>e.touches[0].pageY;

            if (elem)
            {
                x -= elem.offsetLeft;
                y -= elem.offsetTop;
            }

            return { x: x, y: y }
        }

        onRubberMove(evt)
        {
            //vp.utils.debug("raw rubberband mouseMove");

            try
            {
                /// this is triggered for all window mouse move events, so its important to only look at them
                /// when we have started a banding operation.
                if (this._isBanding && this._isEnabled)
                {
                    //vp.utils.debug("rubberBandSelector.onMove: id=" + this._id);

                    if ((this._isLeftButtonDown) && (this._isRightButtonDown))  
                    {
                        //---- user started a 2-button drag (3D panning) - abandon this operation ----
                        this.cancelBanding(true, evt);
                    }
                    else
                    {
                        if (evt.type == "touchmove")
                        {
                            var ptCurrent = this.touchPosition(evt, null);
                        }
                        else
                        {
                            var ptCurrent = vp.events.mousePosition(evt);
                        }

                        var rc = vp.geom.rectFromPoints(ptCurrent, this._ptMouseDown);
                            //chartUxDivBounds = vp.select("#chartUxDiv").getBounds(false);
// 
//                         rc.left -= chartUxDivBounds.left;
//                         rc.top -= chartUxDivBounds.top;

                        //vp.utils.debug("rubberBandSelector: onMove: pt="+  ptCurrent + ", rc=" + rc); 

                        this.setRubberBand(rc);

                        //---- if we're banding, do not pass event along ----
                        vp.events.cancelEventDefault(evt);
                        vp.events.cancelEventBubble(evt);

                        //---- HOLD detection ----
                        if (this._isHoldEnabled)
                        {
                            var deltaX = Math.abs(ptCurrent.x - this._ptMouseHold.x);
                            var deltaY = Math.abs(ptCurrent.y - this._ptMouseHold.y);

                            if ((this._ptMouseHold == null) || (Math.max(deltaX, deltaY) > maxHoldDist))
                            {
                                //---- start a new hold location/time ----
                                this._ptMouseHold = ptCurrent;
                                this.restartHoldTimer();
                            }
                        }
                    }
                }
            }
            catch (ex)
            {
                vp.utils.debug("MouseMove Exception: " + ex);
            }
        }

        triggerHoldEvent()
        {
            var ptCurrent = this._ptMouseHold;

            this._ptMouseHold = null;
            this.clearHoldTimer();

            var rcBand = vp.geom.rectFromPoints(ptCurrent, this._ptMouseDown);

            ////---- adjust rcBand so it matches actual location ----
            //var rect = this._dragSelectCanvas.getBoundingClientRect();
            //var toggle = this.isToggleKey(evt);

            vp.utils.debug("HOLD rcBand: width=" + rcBand.width + ", height=" + rcBand.height);

            if (this._holdCallback)
            {
                this.clearBanding();

                this._holdCallback(rcBand, this._mouseDownOrigin, ptCurrent);
            }
        }

        triggerOnDown(e)
        {
            if (this._isEnabled)
            {
                this.onRubberDown(e)
            }
        }

        onRubberDown(evt)
        {
            vp.utils.debug("--> rubberBandSelector.onDown: id=" + this._id + ",isEnabled=" + this._isEnabled);

            if ((evt.which == 1) || (evt.type == "touchstart"))
            {
                if (!evt.ctrlKey)         // for now, CTRL prevents dragging/selecting
                {
                    this._isLeftButtonDown = true;
                }
            }

            if (evt.which == 3) 
            {
                this._isRightButtonDown = true;
            }

            //---- only process if LEFT DOWN and RIGHT UP (don't response to multi-button drags ----
            if ((this._isLeftButtonDown) && (!this._isRightButtonDown))   
            {
                if (this._isBanding)                // something went wrong
                {
                    this.cancelBanding(true, evt);
                }
                else if (this._isEnabled)
                {
                    var toggle = this.isToggleKey(evt);

                    //---- prevent text selection by browser during our drag operation (for Chrome, FireFox) ----
                    //enableElementSelection(document.body, false);

                    //---- use chart-relative point & then add chart-relative offset of each series ----
                    if (evt.type == "touchstart")
                    {
                        this._ptMouseDown = this.touchPosition(evt, null);
                    }
                    else
                    {
                        this._ptMouseDown = vp.events.mousePosition(evt);
                    }

                    if (this._isHoldEnabled)
                    {
                        this._ptMouseHold = this._ptMouseDown;
                        this.restartHoldTimer();
                    }

                    this._isBanding = true;
                    vp.utils.debug("rubberBandSelector: onDown");

                    //vp.utils.debug("rubberBandSelector.onDown: id=" + this._id + ", isBanding=" + this._isBanding);

                    /// when "vp.events.setCapture" tried by rfernand on Feb-27-2015, no mouse events were being sent to element 
                    /// betweeen call and next mouse click.  When "element.setCapture()" called directly, it returned "undefined"
                    /// and seemed to have no effect.  So, it was then turned off.  Normal mouse events work OK for rubberband
                    /// dragging, but behavior is awkward when mouse leaves document boundaries.

                    /// update:  as of Aug-27-2015, found that we were hooking mousedown twice (pointerdown and mousedown events).  As
                    /// a result, we would end up calling "cancelBanding()" on the 2nd time thru this function which would turn off
                    /// the CAPTURE of mouseMove/mouseUP events.  Fixed that, and now setCaptureWindow() is working correctly... almost - 
                    /// new problem: we are not getting events OUTSIDE of our window.

                    vp.events.setCaptureWindow(this._onMouseMoveFunc, this._onMouseUpFunc);

                    vp.utils.debug("rubberbandSelector: SET CAPTURE");
                    this._isSetCaptureActive = true;
                    //vp.select("#consoleDiv").text("rubberbandSelector: SET CAPTURE");

                    this._mouseDownOrigin = "insideActiveChart";
                }
                else
                {
                    this._mouseDownOrigin = "insideInactiveChart";
                }
            }
            else
            {
                vp.utils.debug("rubberBandSelection.onDown: ignored mouse down because it is not just LEFT BUTTON DOWN");
            }

            this.onDataChanged("mouseDown");
        }

        clearHoldTimer()
        {
            if (this._holdTimer)
            {
                clearInterval(this._holdTimer);
                this._holdTimer = null;
            }
        }

        /** we cannot just check the time in mousemove because the mouse might not be moving after reaching its destination. */
        restartHoldTimer()
        {
            this.clearHoldTimer();

            if (this._isEnabled)
            {
                this._holdTimer = setInterval(() =>
                {
                    this.triggerHoldEvent();
                }, holdTime);
            }
        }

        /// public property: isEnabled
        isEnabled(): boolean;
        isEnabled(value: boolean): rubberBandSelectorClass;
        isEnabled(value?: boolean): any
        {
            if (arguments.length == 0)
            {
                return this._isEnabled;
            }

            //vp.utils.debug("rubberBandSelector: id=" + this._id + ", setting isEnabled=" + value + ", isBanding=" + this._isBanding);

            this._isEnabled = value;

            if (!value)
            {
                this.cancelBanding(true);
            }

            return this;
        }

        dragSelectElement(): HTMLElement;
        dragSelectElement(value: HTMLElement): rubberBandSelectorClass;
        dragSelectElement(value?: HTMLElement): any
        {

            if (arguments.length == 0)
            {
                return this._dragSelectCanvas;
            }

            this._dragSelectCanvas = value;
            this.hookEvents(true);
        }

    }

    export function createRubberBandSelector(canvas: HTMLElement): rubberBandSelectorClass
    {
        return new rubberBandSelectorClass(canvas);
    }
} 