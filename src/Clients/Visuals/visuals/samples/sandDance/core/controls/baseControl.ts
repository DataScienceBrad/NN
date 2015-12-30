//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    baseControl.ts - base class for menus and controls.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class BaseControlClass extends DataChangerClass implements IDragableControl
    {
        _group: SVGGElement;

        _windowMgr: WindowMgrClass;
        _xOffset = 0;
        _yOffset = 0;
        _ignoringClicks = false;
        _menu: MenuInfoClass;
        _controlType: string;

        constructor(controlType: string, menu: MenuInfoClass)
        {
            super();

            this._controlType = controlType;
            this._menu = menu;
        }

        getBounds()
        {
            var rc = vp.dom.getBounds(this.getRootElem());
            return rc;
        }

        getDataMgr(): DataChangerClass
        {
            var dataMgr = null;

            if (this._menu instanceof PropertyInfoClass)
            {
                var pic = <PropertyInfoClass>this._menu;
                dataMgr = pic.dataMgr;

                if (dataMgr === "view")
                {
                    dataMgr = this._windowMgr.getCurrentView();
                }
            }

            return dataMgr;
        }

        isMostlyOffScreen(svgDoc: HTMLElement, svgWidth, svgHeight)
        {
            var rc = this._group.getBoundingClientRect();

            //var leftCutoff = (this instanceof menuButtonClass) ? -45 : -15;
            var leftCutoff = -15;

            var leftOff = (rc.left < leftCutoff);      // support users that want to hide part of control on left
            var topOff = (rc.top < 0);
            var rightOff = (rc.right > svgWidth);
            var botOff = (rc.bottom > svgHeight);

            return (leftOff || topOff || rightOff || botOff);
        }

        getOffset()
        {
            return { x: this._xOffset, y: this._yOffset };
        }

        setOffset(x: number, y: number)
        {
            this._xOffset = x;
            this._yOffset = y;

            vp.dom.translate(this._group, x, y);
        }

        remove()
        {
            if (this._group && this._group.parentNode)
            {
                this._group.parentNode.removeChild(this._group);
            }
        }

        onEndOfDrag(svgDoc: HTMLElement)
        {
            //---- ignore click events for next few ms ----
            this._ignoringClicks = true;

            setTimeout((e) =>
            {
                this._ignoringClicks = false;
            }, 200);
        }

        getRootElem()
        {
            return this._group;
        }
    }

    export interface IDragableControl
    {
        getOffset();
        setOffset(x: number, y: number);
        isMostlyOffScreen(svgDoc: HTMLElement, svgWidth, svgHeight);
        onEndOfDrag(svgDoc: HTMLElement);
        remove();
        getRootElem();
    }

}
 