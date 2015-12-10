//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    basePanel.ts - base class for a floating (and optionally modal) panel.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    var nextId = 1;

    export class basePopupClass extends beachParty.dataChangerClass implements IAppControl
    {
        _root: HTMLElement;
        _ownerElem: HTMLElement;            // not the document parent, but another popup that this popup belongs to

        //---- removeable event handlers ----
        _keyboardFunc = null;
        _mouseDownFunc = null;
        _dblClickFunc = null;

        _openerIds: string;       // id's of UI elements that can open this panel
        _popupId: number;
        _hasTitle = false;

        constructor(openerIds: string, ownerElem?: HTMLElement)
        {
            super();

            this._openerIds = openerIds;
            this.installEventHandlers();
            this._popupId = nextId++;
            this._ownerElem = ownerElem;
        }

        setOpenerSelected(value: boolean)
        {
            if (this._openerIds)
            {
                var ids = this._openerIds.split(" ");
                if (ids.length)
                {
                    var id = ids[0];
                    vp.select("#" + id).attr("data-selected", (value) ? "true" : "false");
                }
            }
        }

        getRootElem()
        {
            return this._root;
        }

        show(left: number, top: number, right?: number, bottom?: number)
        {
            this.hide();

            var pickerElem = this.getRootElem();
            var rcPicker = vp.select(pickerElem).getBounds(true);

            if (right != undefined)
            {
                left = right - rcPicker.width;
            }

            if (bottom != undefined)
            {
                top = bottom - rcPicker.height;
            }

            this.openWithoutOverlap(left, top);
        }

        /** Open the specified panel so that it is near x,y but not overlapping with any of the 4 window edges. */
        openWithoutOverlap(x: number, yTop: number)
        {
            var rootW = vp.select(this._root);
            var myHeight = rootW.height();
            var yBottom = yTop + myHeight;
            var yMargin = 0;
            var xMargin = 0;

            //---- check for TOP overlap ----
            var topOverlap = (yTop - yMargin);
            if (topOverlap < 0)
            {
                //---- move DOWN ----
                yTop += (-topOverlap);
            }
            else
            {
                //---- check for BOTTOM overlap ----
                var bottomOverlap = (yBottom + yMargin) - innerHeight;
                if (bottomOverlap > 0)
                {
                    //---- move UP ----
                    yTop -= bottomOverlap;
                }
            }

            //---- check for LEFT overlap ----
            var leftOverlap = (x - xMargin);
            if (leftOverlap < 0)
            {
                //---- move RIGHT ----
                x += (-leftOverlap);
            }
            else
            {
                //---- check for RIGHT overlap ----
                var myWidth = rootW.width();

                var rightOverlap = (x + myWidth + xMargin) - innerWidth;
                if (rightOverlap > 0)
                {
                    //---- move LEFT ----
                    x -= rightOverlap;
                }
            }

            let sandDanceBounds = vp.select(".sandDance").getBounds(true),
                bigBarBounds = vp.select("#playAndIconBar").getBounds(true);

            x += sandDanceBounds.left;//TODO: remove this hard fix.
            yTop += sandDanceBounds.top + bigBarBounds.bottom;

            rootW
                .css("left", x + "px")
                .css("top", yTop + "px")

            rootW[0].focus();

            //---- set our button to "selected" state ----
            this.setOpenerSelected(true);
        }

        onAnyKeyDown(e)
        {
            if (e.keyCode == vp.events.keyCodes.escape)
            {
                this.close();
            }
        }

        onMyDblClick(e)
        {
            if (!this._hasTitle)
            {
                this.close();
            }
        }

        onAnyMouseDown(e)
        {
            if (e && e.target && (!this._hasTitle))
            {
                var elem = e.target;
                var parent = elem;

                //---- get top-most element (but not null) ----
                while (parent && parent != this._root && parent.parentElement)
                {
                    if (vp.select(parent).hasClass("popupMenu"))
                    {
                        break;
                    }

                    parent = parent.parentElement;
                }

                var isMyElem = (parent == this._root);

                if (! isMyElem)
                {
                    //---- see if this was a child popup of me ----
                    if (parent && parent.jsObj)
                    {
                        var popup = <basePopupClass>parent.jsObj;
                        if (popup._ownerElem == this._root)
                        {
                            isMyElem = true;
                        }
                    }
                }

                if (! isMyElem)
                {
                    //---- mouse clicked on an element that is NOT part of this popup/panel ----
                    this.close();

                    //---- find elem with id (some inner parts of buttons don't have them ----
                    if (!elem.id)
                    {
                        elem = elem.parentElement;
                    }

                    //---- cancel event if this was one of my openers (to prevent this panel from iddediately reopening ----
                    //---- when the user was clicking on our opener UI to TOGGLE our panel closed. ----
                    if (this.isMyOpener(elem.id))
                    {
                        //vp.events.cancelEventBubble(e);
                        //vp.events.cancelEventDefault(e);

                        //---- we can't prevent the upcoming CLICK event, so we mark the element instead ---
                        elem.ignoreNextClick = true;

                        vp.utils.debug("marking elem.ignoreNextClick=true for id=" + elem.id);
                    }
                }
            }
        }

        isMyOpener(id: string)
        {
            var isMine = false;
            if (this._openerIds)
            {
                var oNames = this._openerIds.split(" ");

                for (var i = 0; i < oNames.length; i++)
                {
                    var oName = oNames[i];
                    if (id.contains(oName))
                    {
                        isMine = true;
                        break;
                    }
                }
            }

            return isMine;
        }

        isVisible()
        {
            var elem = this._root;
            var isVisible = (vp.select(elem).css("visibility") == "visible");

            return isVisible;
        }

        installEventHandlers()//TODO: check this function
        {
            //---- install event handlers to capture ESCAPE or MOUSEDOWN at DOCUMENT level ----
            this._keyboardFunc = (e) => this.onAnyKeyDown(e);
            this._mouseDownFunc = (e) => this.onAnyMouseDown(e);
            this._dblClickFunc = (e) => this.onMyDblClick(e);

            //---- set this to install async so that current click doesn't interfere ----
            setTimeout((e) => 
            {
                document.addEventListener("keydown", this._keyboardFunc);
                document.addEventListener("mousedown", this._mouseDownFunc);
                this._root.addEventListener("dblclick", this._dblClickFunc);
            }, 1);

        }

        hide()
        {
            var elem = this._root;

            //---- remove our DOCUMENT event handlers ----
            document.removeEventListener("keydown", this._keyboardFunc);
            document.removeEventListener("mousedown", this._mouseDownFunc);
            this._root.removeEventListener("dblclick", this._dblClickFunc);

            if (this.isVisible())
            {
                //vp.utils.debug("popupMenu.hide: isVisible=true");

                vp.select(elem).hide();

                //appClass.instance.onPopupHidden(this._className);
            }
        }

        remove()
        {
            this.hide();

            vp.select(this._root)
                .remove();
        }

        /** Remove the panel from the DOM and unhook non-DOM event handlers on this._dataOwner. */
        close()
        {
            this.remove();

            appClass.instance.logAction(Gesture.click, null, ElementType.button, Action.close, Target.unknownPanel, true);

            //---- set our button to NOT "selected" state ----
            this.setOpenerSelected(false);

            this.onDataChanged("close");
        }
    }

    export interface IAppControl
    {
        getRootElem(): HTMLElement;
        close();
    }

}