//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    basePanel.ts - base class for a floating (and optionally modal) panel.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class BasePanelClass extends BasePopupClass
    {
        _root: HTMLElement;
        protected _imgPin: HTMLImageElement;
        protected _title: HTMLElement;

        _isDialog: boolean;
        _primaryControl: any;
        _dataOwner: beachParty.DataChangerClass;

        //---- DRAG of title bar ----
        _onMouseMoveFunc = null;        // setCapture
        _onMouseUpFunc = null;          // setCapture
        _ptDown: any;
        _isDragging = false;
        _isPinnedDown = false;

        //---- DRAG of resize gripper ----
        _isResizing = false;
        _resizeTarget = null;
        _sizeAtMouseDown = null;
        _onResizeMouseMoveFunc = null;  // setCapture
        _onResizeMouseUpFunc = null;    // setCapture
        _resizeElem: HTMLElement;

        constructor(name: string, isDialog: boolean, bgColor?: string, title?: string, width?: number, height?: number, resizeable?: boolean,
            tooltip?: string, hideClose?: boolean, addAutoClose?: boolean, addNormalClose?: boolean)
        {
            super(name);

            //---- create ROOT ----
            var maxHeight = AppClass.maxPanelHeight;
            var maxWidth = AppClass.maxPanelWidth;

            var rootW = vp.select(".sandDance").append("div")
                .id(name + "Panel");
                //.css("overflow-y", "auto")          // make each panel do more intelligent sizing of contained lists

            rootW.element()
                .addEventListener("focus", (e) => 
                {
                    this.onFocus(e);
                });

            if (title)
            {
                rootW.addClass("floatingPanel");
                this._hasTitle = true;
            }
            else
            {
                rootW.addClass("panel");

                if (addAutoClose)
                {
                    var btHolderW = rootW.append("div")
                        .css("float", "right");

                    var imgPinW = btHolderW.append("div")//images/pinLeft.png
                        .addClass("clickIcon")
                        .addClass("fnPinLeft")
                        .id("imgPin");
                        //.attr("src", fnPinLeft)
                        // .css("width", "15px")
                        // .css("height", "15px")
                        // .css("position", "relative")
                        // .css("top", "-2px")

                    imgPinW.element()
                        .addEventListener("click", (e) => this.togglePin(e));

                    var imgCloseW = btHolderW.append("div")
                        .addClass("clickIcon")
                        .addClass("closeButton");
                        //.attr("src", fnClose)
                        // .css("width", "20px")

                    imgCloseW.element()
                        .addEventListener("click", (e) => this.close());

                    this._imgPin = imgPinW[0];
                }
                else if (addNormalClose)
                {
                    var imgCloseW = rootW.append("div")
                        .addClass("clickIcon")
                        .addClass("fnClose")
                        .css("width", "20px")
                        .css("float", "right");

                    imgCloseW.element()
                        .addEventListener("click", (e) => this.close());
                }
            }

            rootW
                .css("max-height", maxHeight + "px")
                .css("max-width", maxWidth + "px");

            if (width !== undefined)
            {
                rootW.css("width", width + "px");
            }

            if (height !== undefined)
            {
                rootW.css("height", height + "px");
            }

            if (bgColor)
            {
                rootW
                    .css("background", bgColor);
            }

            this._root = rootW[0];
            (<any>this._root).jsObj = this;

            this._onMouseMoveFunc = (e) => this.onMouseMove(e);
            this._onMouseUpFunc = (e) => this.onMouseUp(e);

            this._onResizeMouseMoveFunc = (e) => this.onResizeMouseMove(e);
            this._onResizeMouseUpFunc = (e) => this.onResizeMouseUp(e);

            this._isDialog = isDialog;

            if (this._isDialog)
            {
                //---- don't show pin for dialogs ----
                this._isPinnedDown = true;
            }

            if (title)
            {
                this.createTitle(rootW, title, tooltip, hideClose);
            }

            if (resizeable)
            {
                this.createResizer(rootW);
            }
        }

        onUserAction()
        {
            if (!this._isPinnedDown)
            {
                this.close();
            }
        }

        togglePin(e)
        {
            this._isPinnedDown = (!this._isPinnedDown);

            vp.select(this._imgPin)
                .removeClass("fnPinDown")
                .removeClass("fnPinLeft")
                .addClass((this._isPinnedDown) ? "fnPinDown" : "fnPinLeft");

            // vp.select(this._imgPin).attr("src", (this._isPinnedDown) ? fnPinDown : fnPinLeft);
        }

        applyAppPanelOpacity()
        {
            var opacity = settings.panelOpacity();
            vp.select(this._root).css("opacity", opacity + "");
        }

        private getCenter(): { left: number, top: number } {
            var rc = vp.select(this._root).getBounds(false),
                chart = vp.select(".sandDance").getBounds(true);

            return {
                left: chart.width / 2 - rc.width / 2,
                top: chart.height / 2 - rc.height / 2
            };
        }

        centerPanel()
        {
            let center = this.getCenter();

            this.startPosition = {
                top: center.top,
                left: center.left
            };

            vp.select(this._root)
                .css("left", center.left + "px")
                .css("top", center.top + "px");
        }

        onFocus(e)
        {
            if (this._primaryControl)
            {
                var elem = this._primaryControl.getRootElem();

                setTimeout((e) => elem.focus(), 100);
            }
        }

        createResizer(rootW)
        {
            //---- add RESIZE icon as affordance ----
            var imgW = rootW.append("div")// img
                .addClass("panelResizer")
                .addClass("resize2")
                // .addClass("display-none")
                // .attr("src", "images/resize2.png")
                .css("position", "absolute")
                .css("right", "0px")
                .css("bottom", "0px")
                .css("z-index", "999");              // keep on top of all other elements;

            this._resizeElem = imgW[0];

            imgW.element()
                .addEventListener("mousedown", (e) =>
                {
                    this._ptDown = vp.events.mousePosition(e/*, this._root*/);
                    this._resizeTarget = (this._primaryControl) ? this._primaryControl.getRootElem() : this._root;
                    this._sizeAtMouseDown = vp.dom.getBounds(this._resizeTarget);
                    this._isResizing = true;

                    this.setEventHandlers(this._onResizeMouseMoveFunc, this._onResizeMouseUpFunc);
                    // vp.events.releaseCapture(imgW[0], e, this._onResizeMouseMoveFunc, this._onResizeMouseUpFunc);
                    // vp.events.setCapture(imgW[0], e, this._onResizeMouseMoveFunc, this._onResizeMouseUpFunc);
                });
        }

        createTitle(rootW, title: string, tip: string, hideClose: boolean)
        {
            if (title)
            {
                //---- create TITLE container ----
                var titleDiv = rootW.append("div")
                    .addClass("panelTitle")
                    .css("position", "relative");

                titleDiv.element()
                    .addEventListener("mousedown", (e) =>
                    {
                        this.onMouseDown(e);
                        this.onFocus(e);
                    });

                this._title = titleDiv[0];

                if (tip) {
                    titleDiv.title(tip);
                }

                //---- create TITLE text ----
                titleDiv.append("span")
                    .addClass("panelPrompt")
                    .text(title)
                    .css("margin-right", "30px");        // space for "x" button;

                if (!hideClose)
                {
                    //---- create CLOSE button ----
                    titleDiv.append("span")
                        .addClass("panelButton")
                        .text("X")
                        .css("position", "absolute")
                        .css("right", "4px")
                        .css("top", "2px")
                        .css("font-size", "17px")
                        .css("border", "0px")
                        .css("padding", "0px")
                        .element()
                        .addEventListener("click", (e) =>
                        {
                            this.close();
                        });
                }
            }
        }

        open(left?: number, top?: number, right?: number, bottom?: number)
        {
            var rootW = vp.select(this._root)
                .css("display", "block");

            if (arguments.length === 0)
            {
                this.centerPanel();
            }
            else
            {
                if (right !== undefined)
                {
                    //---- convert to left ----
                    left = right - rootW.width();
                }

                if (bottom !== undefined)
                {
                    //---- convert to top ----
                    top = bottom - rootW.height();
                }

                this.openWithoutOverlap(left, top);
            }
        }

        removeMaxSizesFromPanel()
        {
            vp.select(this._root)
                .css("max-width", "")
                .css("max-height", "");
        }

        onResizeMouseMove(e)
        {
            if (this._isResizing)
            {
                var pt = vp.events.mousePosition(e/*, this._root*/);

                var xDiff = pt.x - this._ptDown.x;
                var yDiff = pt.y - this._ptDown.y;

                //---- resize the RESIZE TARGET ----
                var targetW = vp.select(this._resizeTarget);
                var rcDown = this._sizeAtMouseDown;

                var minWidth = 75;
                var minHeight = 35;     //75;

                var width = Math.max(minWidth, rcDown.width + xDiff);
                var height = Math.max(minHeight, rcDown.height + yDiff);

                vp.utils.debug("onResizeMouseMove: xDiff=" + xDiff + ", yDiff=" + yDiff + ", width=" + width + ", height=" + height);

                this.removeMaxSizesFromPanel();

                targetW
                    .css("width", width + "px")
                    .css("height", height + "px");

                if (this._primaryControl)
                {
                    var anyControl = <any>this._primaryControl;

                    if (anyControl.onResize)
                    {
                        //---- resize the PRIMARY CONTROL ----
                        anyControl.onResize(width, height);
                    }
                }

                this.onDataChanged("size");
            }
        }

        onResizeMouseUp(e)
        {
            this._isResizing = false;

            this.setEventHandlers(this._onResizeMouseMoveFunc, this._onResizeMouseUpFunc, true);
            // vp.events.releaseCapture(this._resizeElem, e, this._onResizeMouseMoveFunc, this._onResizeMouseUpFunc);
        }

        onMouseDown(e: MouseEvent)
        {
            if (e.target === this._title) {
                this._ptDown = vp.events.mousePosition(e/*, this._root*/);
                this._isDragging = true;
            }

            this.setEventHandlers(this._onMouseMoveFunc, this._onMouseUpFunc);

            // vp.events.releaseCapture(/*document.body*/this._root, e, this._onMouseMoveFunc, this._onMouseUpFunc);
            // vp.events.setCapture(/*document.body*/this._root, e, this._onMouseMoveFunc, this._onMouseUpFunc);
        }

        onMouseMove(e)
        {
            if (this._isDragging)
            {
                var pt = vp.events.mousePosition(e/*, this._root*/);
                
                var x = pt.x - this._ptDown.x;
                var y = pt.y - this._ptDown.y;

                let startPosition = this.startPosition || this.getCenter();

                let left: number = startPosition.left + x,
                    top: number = startPosition.top + y;

                vp.select(this._root)
                    .css("left", left + "px")
                    .css("top", top + "px")
                    .css("right", "")
                    .css("bottom", "");

                this.currentPosition = {
                    left: left,
                    top: top
                };

                this.onDataChanged("location");
            }
        }

        onMouseUp(e)
        {
            this._isDragging = false;

            if (this.currentPosition) {
                this.startPosition = {
                    left: this.currentPosition.left,
                    top: this.currentPosition.top
                };
            } else if (this.startPosition) {
                this.currentPosition = {
                    left: this.startPosition.left,
                    top: this.startPosition.top
                };
            }

            // vp.events.releaseCapture(/*document.body*/this._root, e, this._onMouseMoveFunc, this._onMouseUpFunc);
            // vp.events.setCapture(/*document.body*/this._root, e, this._onMouseMoveFunc, this._onMouseUpFunc);

            this.setEventHandlers(this._onMouseMoveFunc, this._onMouseUpFunc);
        }

        private setEventHandlers(mousemove, mouseup, clear: boolean = false): void {
            let sandDanceElement = $(".sandDance").get(0);

            sandDanceElement.removeEventListener("mousemove", mousemove);
            sandDanceElement.removeEventListener("mouseup", mouseup);

            if (!clear) {
                sandDanceElement.addEventListener("mousemove", mousemove);
                sandDanceElement.addEventListener("mouseup", mouseup);
            }
        }

        //---- override basePopup onKey handling ----
        onAnyKeyDown(e)
        {
            if (e.keyCode === vp.events.keyCodes.enter)
            {
                this.onEnterKey();
            }
            else if (e.keyCode === vp.events.keyCodes.escape)
            {
                this.onEscapeKey();
            }
        }

        onEnterKey()
        {
            //---- trigger BLUR event on active text field to commit its data to asscoiated property ----
            document.body.focus();

            //---- give focus a chance to get processed ----
            setTimeout((e) =>
            {
                this.close();
                this.onDataChanged("onAccept");
            }, 100);

        }

        onEscapeKey()
        {
            this.close();
            this.onDataChanged("onCancel");
        }

    }
}