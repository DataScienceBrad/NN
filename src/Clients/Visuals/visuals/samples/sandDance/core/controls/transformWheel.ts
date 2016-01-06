//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    baseControl.ts - base class for menus and controls.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class TransformWheelClass extends BaseControlClass
    {
        //---- SVG elements ----
        _group: SVGGElement;
        _circle: SVGCircleElement;
        _vBar: SVGLineElement;
        _hBar: SVGLineElement;

        _svgParent: any;
        _windowMgr: WindowMgrClass;
        _center: SVGRect;
        _partTouched = "";
        _isActive = true;
        _wheelSize = 0;

        constructor(windowMgr: WindowMgrClass, svgParent: any, wheelSize: number)
        {
            super("transformerWheel", null);

            this._windowMgr = windowMgr;
            this._svgParent = svgParent;

            //---- create GROUP ----
            var groupW = vp.select(svgParent).append("g")
                .addClass("transformWheel");
            this._group = groupW[0];

            this.show(false);       // initially hidden
            this.rebuild();
        }

        rebuild()
        {
            var wheelSize = this._wheelSize;
            var size2 = wheelSize / 2 - 30;

            var groupW = vp.select(this._group)
                .clear();

            //---- CIRCLE ----
            var circle = groupW.append("circle")
                .addClass("transformWheelCircle")
                .attr("r", wheelSize/2);

            this._circle = circle[0];

            //---- VBAR ----
            var vBar = groupW.append("line")
                .addClass("transformWheelVBar")
                .from(0, -size2)
                .to(0, size2);

            this._vBar = vBar[0];

            //---- HBAR ----
            var hBar = groupW.append("line")
                .addClass("transformWheelHBar")
                .from(-size2, 0)
                .to(size2, 0);

            this._hBar = hBar[0];

            //---- hook events ----
            circle.attach("mousedown", (e) => this.onPartMouseDown(e, "circle"));
            hBar.attach("mousedown", (e) => this.onPartMouseDown(e, "hBar"));
            vBar.attach("mousedown", (e) => this.onPartMouseDown(e, "vBar"));

            //---- support 2nd finger down here, for temp. wheel operation (while first finger holds wheel down) ----
            // circle.attach("pointerdown", (e) => this.onPartMouseDown(e, "circle"));
            // hBar.attach("pointerdown", (e) => this.onPartMouseDown(e, "hBar"));
            // vBar.attach("pointerdown", (e) => this.onPartMouseDown(e, "vBar"));

            circle.attach("mouseup", (e) => {this.onPartMouseUp(e, "circle");});
            hBar.attach("mouseup", (e) => this.onPartMouseUp(e, "hBar"));
            vBar.attach("mouseup", (e) => this.onPartMouseUp(e, "vBar"));

            this.setTooltip(true);
        }

        wheelSize(value?: number)
        {
            if (arguments.length === 0)
            {
                return value;
            }

            this._wheelSize = value;
            this.rebuild();
            this.onDataChanged("wheelSize");
        }

        isActive(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isActive;
            }

            this._isActive = value;
            this.show(value);

            this.onDataChanged("isActive");
        }

        setTooltip(value: boolean)
        {
            vp.select(this._group)
                .title((value) ? "Use the transform wheel to turn, flip, and spin the current chart in 3D space" : "");

        }

        onPartMouseUp(e, part: string)
        {
            /// TURN THIS OFF - it is too easy to trigger accidently.
            //if (this._partTouched == "middle")
            //{
            //    //---- touching middle resets TRANSFORMS ----
            //    this._windowMgr.resetStuff();
            //}

            this.partTouched("");

            this.setTooltip(true);
        }

        onPartMouseDown(e, part: string)
        {
            //vp.select("#consoleDiv").text("onParseMouseDown: part=" + part);

            if (this._isActive)
            {
                if (part === "vBar" || part === "hBar")
                {
                    var pt = vp.events.mousePosition(e, this._group);

                    if (this.isPtInMiddle(pt, true))
                    {
                        part = "middle";
                    }
                }

                this.partTouched(part);
                this.setTooltip(false);
            }
        }

        isPtInMiddle(pt, isRelativeToGroup: boolean)
        {
            if (!isRelativeToGroup)
            {
                //var rcx = vp.select(this._group).getBounds(false);
                var rcx = this._group.getBoundingClientRect();
                pt.x -= rcx.left;
                pt.y -= rcx.top;
            }

            var barSize = 40;       // matches .transformWheel stroke-width in .css
            var halfBar = barSize / 2;
            var halfSize = this._wheelSize / 2;
            var middleStart = halfSize - halfBar + halfBar;             // +halfBar = fudge factor

            var rc = vp.geom.createRect(middleStart, middleStart, barSize, barSize);
            var inMiddle = (vp.geom.rectContainsPoint(rc, pt));

            return inMiddle;
        }

        partTouched(value?: string)
        {
            if (this._isActive)
            {
                if (value === undefined || value === null)
                {
                    return this._partTouched;
                }

                this._partTouched = value;
                this.onDataChanged("partTouched");
            }
        }

        show(value: boolean)
        {
            //var vis = (value) ? "visible" : "hidden";

            //vp.select(this._group)
            //    .css("visibility", vis);

            var opacity = (value) ? 1 : 0;

            vp.select(this._group)
                .css("opacity", opacity + "")
                .css("pointer-events", (value) ? "" : "none");
        }
    }
} 