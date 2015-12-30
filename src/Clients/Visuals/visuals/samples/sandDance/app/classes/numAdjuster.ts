//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    numAdjuster.ts - gauge-type control to allow numeric values to be adjusted thru rotational dragging.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class NumAdjusterClass extends beachParty.dataChangerClass
    {
        _root: HTMLElement;
        _nameText: HTMLElement;
        _valueText: HTMLElement;
        _draggingLine: HTMLElement;
        _imgCircle: HTMLElement;
        _className = "numAdjusterClass";
        _valueAtStartOfDrag = 0;

        _isEndOfDrag = false;
        _isDragging = false;
        _ptDown = null;
        _isMouseDown = false;

        _delayTimer = null;             // used to throttle the large amount of mouse move messages

        //----- center of circles ----
        _xCircle = 0;
        _yCircle = 0;
        _angleAdj = 0;

        _name: string;
        _value: number;
        _minValue: number;
        _maxValue: number;
        _tooltip: string;
        _style: AdjusterStyle;
        _roundValues: boolean;
        _syncChanges: boolean;
        _spreadLow: boolean;

        _onMouseMove: () => any;
        _onMouseUp: () => any;

        /** if "syncChanges" is true, a dataChanged event on "value" is issued whenever the numAdjuster value is changed.  if false,
        event is only triggered on mouse up. */
        constructor(rootName: string, name: string, initialValue: number, minValue: number, maxValue: number, tooltip: string, style: AdjusterStyle,
            roundValues?: boolean, syncChanges?: boolean, spreadLow?: boolean)
        {
            super();

            this._value = initialValue;
            this._minValue = minValue;
            this._maxValue = maxValue;
            this._tooltip = tooltip;
            this._style = style;
            this._name = name;
            this._roundValues = roundValues;
            this._syncChanges = syncChanges;
            this._spreadLow = spreadLow;

            //---- adjust ROOT ----
            var root = vp.select("#" + rootName)//facetBins
                .addClass("numAdjuster")
                .title(tooltip)
                .css("position", "relative")    
                //.css("border", "1px solid yellow") 
                .css("width", "40px") 
                .attach("click", (e) =>
                {
                    this.onClickInCircle(e);
                });

            this._root = root[0];

            this.buildControlParts(root);

            this.hookEvents();

            //---- initialize the value text ----
            this.updateValueText();

            //---- make hidden initially ----
            this.show(false);

            this._onMouseMove = this.onMouseMove.bind(this);
            this._onMouseUp = this.onMouseUp.bind(this);
        }

        getRoot()
        {
            return this._root;
        }

        value(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._value;
            }

            value = Math.max(this._minValue, Math.min(this._maxValue, value));

            this._value = value;
            this.updateValueText();

            this.onDataChanged("value");
        }

        buildControlParts(root: vp.dom.IWrapperOuter)
        {
            /// valueX, valueY is where the value text should be placed
            /// ptX, ptY is an offset for the center of the circle 
            /// nameY is where the optional name label for the adjuster should be placed 

            var topData = { valueX: 7, valueY: 13, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 19, ptY: 0, angle: -270, nameY: -4 };
            //var rightData = { valueX: 7, valueY: 15, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 32, ptY: 20, angle: -0, nameY: -4 };
            var rightData = { valueX: 7, valueY: 21, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 32, ptY: 20, angle: -0, nameY: -4 };
            //var bottomData = { valueX: 7, valueY: 13, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 19, ptY: 31, angle: -90, nameY: -4 };
            var topInPanelData = { valueX: 7, valueY: -11, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 19, ptY: 0, angle: -270, nameY: -4 };

            //---- primary styles for BeachParty ----
            var leftData = { valueX: 7, valueY: 13, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 0, ptY: 20, angle: -180, nameY: -2 };
            var bottomInPanelData = { valueX: 7, valueY: 13, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 19, ptY: 31, angle: -90, nameY: -8 };
            var bottomData = { valueX: 8, valueY: 14, minX: 32, minY: 28, maxX: 32, maxY: 9, ptX: 19, ptY: 31, angle: -90, nameY: -8 };

            var inPanel = false;
            var backgrondClassName = "";
            var data = null;

            if (this._style === AdjusterStyle.left)
            {
                data = leftData;
                backgrondClassName = "fnAdjustDialLeft";
            }
            else if (this._style === AdjusterStyle.top)
            {
                data = topData;
                backgrondClassName = "fnAdjustDialTop";
            }
            else if (this._style === AdjusterStyle.right)
            {
                data = rightData;
                backgrondClassName = "fnAdjustDialRight";
            }
            else if (this._style === AdjusterStyle.bottom)
            {
                data = bottomData;
                backgrondClassName = "fnAdjustDialBottom";
            }
            else if (this._style === AdjusterStyle.bottomInPanel)
            {
                data = bottomInPanelData;
                backgrondClassName = "fnAdjustDialBottom";
                inPanel = true;
            }
            else if (this._style === AdjusterStyle.topInPanel)
            {
                data = topInPanelData;
                backgrondClassName = "fnAdjustDialTop";
                inPanel = true;
            }

            //---- add SEMI-CIRCLE image ----
            var styleForImg = this._style;
            if (this._style === AdjusterStyle.bottomInPanel)
            {
                styleForImg = AdjusterStyle.bottom;
            }
            else if (this._style === AdjusterStyle.topInPanel)
            {
                styleForImg = AdjusterStyle.top;
            }

            var imgW = root.append("div") //img
                .addClass("numAdjusterImg")
                .addClass(backgrondClassName)
                .addClass("fnAdjustDial")
                //.attr("src", backgrondClassName)
                // .css("width", "40px")
               //.css("text-align", "center")
                .attach("dragstart", function (e)
                {
                    //---- prevent drag of icon ----
                    e.preventDefault();
                });

            //---- add NAME ----
            var nameW = root.append("span")
                .text(this._name)
                .addClass("numAdjusterName")
                .css("position", "relative")
                .css("top", data.nameY + "px")          // "-4px")
                .css("width", "40px")
                .css("text-align", "center");

            //---- add VALUE TEXT ----
            var valueW = root.append("span")
                .addClass("numAdjusterValue")
                .text(this._value + "")
                .css("position", "absolute")
                .css("left", data.valueX + "px")
                .css("top", data.valueY + "px");

            if (this._style === AdjusterStyle.topInPanel || this._style === AdjusterStyle.bottomInPanel)
            {
                valueW
                    .addClass("numAdjusterInPanel");
            }

            this._xCircle = data.ptX;
            this._yCircle = data.ptY;
            this._angleAdj = data.angle;

            //---- add DRAG LINE ----
            var lineW = root.append("span")
                .addClass("numAdjusterLine")
                .css("position", "absolute");

            this._imgCircle = imgW[0];
            this._nameText = nameW[0];
            this._valueText = valueW[0];
            this._draggingLine = lineW[0];
        }

        show(value: boolean)
        {
            //---- use "inline-block" as workaround for IE and Chrome layout issues ----
            vp.select(this._root).css("display", (value) ? "inline-block" : "none");
        }

        /** if user clicked on left side of circle, decrement count by 1; otherwise, increment count by 1. */
        onClickInCircle(e)
        {
            var rc = vp.dom.getBounds(this._imgCircle, false);
            var w = rc.width;

            var pt = vp.events.mousePosition(e, this._imgCircle);
            if (pt.x >= 0 && pt.x < w)
            {
                var delta = (pt.x < w / 2) ? -1 : 1;
                this.value(this._value + delta);
            }
        }

        positionLine(p1, p2)
        {
            var rc = vp.dom.getBounds(this._imgCircle, true);

            var xdiff = p2.x - p1.x;
            var ydiff = p2.y - p1.y;

            var width = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
            var height = 1;

            var cx = (p1.x + p2.x) / 2;
            var cy = (p1.y + p2.y) / 2;

            var left = rc.left + cx - width / 2;
            var top = rc.top + cy - height / 2;

            var theta = Math.atan2(p1.y - p2.y, p1.x - p2.x);
            var angle = theta * 180 / Math.PI;
            var rotateStr = "rotate(" + angle + "deg)";

            vp.select(this._draggingLine)
                .css("width", width + "px")
                .css("left", left + "px")
                .css("top", top + "px")
                .transform(rotateStr);
        }

        updateValueText()
        {
            var value = this._value;

            var str = vp.formatters.comma(value);
            vp.dom.text(this._valueText, str);
        }

        onMouseDown(e)
        {
            //---- use mouse to move our dial ----
            var isInGauge = true;
            this._isMouseDown = true;

            if (isInGauge)
            {
                this._ptDown = vp.events.mousePosition(e);

                vp.select(this._valueText)
                    .addClass("numAdjusterActiveValue");

                // vp.events.setCaptureWindow((e) => this.onMouseMove(e), (e) => this.onMouseUp(e)/*, ["myChart"]*/);

                let sandDanceElement = vp.select(".sandDance");

                sandDanceElement.attach("mousemove", this._onMouseMove);
                sandDanceElement.attach("mouseup", this._onMouseUp);
            }

            vp.events.cancelEventDefault(e);
            e.stopPropagation();
        }

        onMouseMove(e)
        {
            //vp.utils.debug("numAdjuster.onMouseMove: delayTimer=" + this._delayTimer);

            if (!this._delayTimer)
            {
                //---- mousePosition of "group" is unreliable, so we use "outCircle" with small adjustment as needed ----
                var pt = vp.events.mousePosition(e, this._imgCircle);

                if (this._isMouseDown && (!this._isDragging))
                {
                    //---- don't start the value adjusting until user has dragged at least 3 pixels ----
                    var xd = Math.abs(pt.x - this._ptDown.x);
                    var yd = Math.abs(pt.y - this._ptDown.y);
                    if (Math.max(xd, yd) >= 3)
                    {
                        this._isDragging = true;
                        this._valueAtStartOfDrag = this._value;
                    }
                }

                if (this._isDragging)
                {
                    var xDiff = pt.x - this._xCircle;
                    var yDiff = pt.y - this._yCircle;

                    this.positionLine(pt, vp.geom.createPoint2(this._xCircle, this._yCircle));

                    vp.select(this._draggingLine)
                    //.to(pt.x, pt.y)
                        .css("display", "block");

                    //---- calculate angle from pt to center of circle ----
                    var theta = Math.atan2(yDiff, xDiff);
                    var angle = vp.utils.toDegrees(theta);

                    angle += this._angleAdj;
                    //angle -= 90;        // angle will=0 when mouse is at direct bottom (in middle of gap) 
                    //angle += 90;        // adjust for style=left

                    if (angle < 0)
                    {
                        angle += 360;
                    }

                    var inDeadZone = (angle < 90 || angle > 270);
                    angle = vp.data.clamp(angle, 90, 270);          // valid values (not in gap) 

                    //---- convert angle to percent ----
                    var percent = vp.data.mapValue(angle, 90, 270, 0, 1);
                    this.setValueFromPercent(percent, inDeadZone);
                }

                //vp.utils.debug("numAdjuster mousemove: percent: " + percent + ", value=" + this._currentValue + ", angle=" + angle + ", x=" + pt.x + ", y=" + pt.y);

                this.setNextMsgDelay();
            }

            vp.events.cancelEventDefault(e);
            e.stopPropagation();
        }

        setValueFromPercent(percent: number, inDeadZone: boolean)
        {
            var range = this._maxValue - this._minValue;

            if (this._spreadLow)
            {
                var goodRange = (range < 10) ? 10*range : range;

                var maxExponent = Math.log(goodRange) / Math.log(2);      // take log base 2 of percent
                var exponent = vp.data.mapValue(percent, 0, 1, 1, maxExponent);
                var result = Math.pow(2, exponent);
                percent = vp.data.mapValue(result, 2, goodRange, 0, 1);
            }

            var value = this._minValue + percent * range;

            if (this._roundValues)
            {
                value = Math.round(value);
            }

            if (false)       // inDeadZone)
            {
                //---- in dead zone, value is restored to "before drag" value ----
                value = this._valueAtStartOfDrag;
            }
            else
            {
                value = vp.data.clamp(value, this._minValue, this._maxValue);
            }

            this._value = value;

            this.updateValueText();

            if (this._syncChanges)
            {
                this.onDataChanged("value");
            }
        }

        setNextMsgDelay()
        {
            var delay = (this._syncChanges) ? 30 : 15;

            this._delayTimer = setTimeout((e) =>
            {
                this._delayTimer = null;
            }, delay);
        }

        onMouseUp(e)
        {
            this._isDragging = false;
            this._isMouseDown = true;

            // vp.events.releaseCaptureWindow();

            let sandDanceElement = vp.select(".sandDance");

            sandDanceElement.detach("mousemove", this._onMouseMove);
            sandDanceElement.detach("mouseup", this._onMouseUp);

            vp.events.cancelEventDefault(e);

            vp.select(this._valueText)
                .removeClass("numAdjusterActiveValue");

            vp.select(this._draggingLine)
                .css("display", "none");

            this.onDataChanged("value");
            this.onDataChanged("valueMouseUp");
        }

        hookEvents()
        {
            var root = this._root;

            root.onmousedown = (e) =>
            {
                this.onMouseDown(e);
            };

            if (!vp.utils.isIE)
            {
                (<any>root).ontouchstart = (e) =>
                {
                    this.onMouseDown(e);
                };
            }
        }
    }

    /** Choose the style according to where the adjuster will be placed within the window.  Use "bottom" for centeral placements. */
    export enum AdjusterStyle
    {
        left,
        top,
        right,
        bottom,
        bottomInPanel,      // temp fix for issues related to not having a prompt
        topInPanel,         // temp fix for issues related to not having a prompt
    }

}