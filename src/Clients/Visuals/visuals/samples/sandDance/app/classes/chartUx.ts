//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    chartUx.ts - manages the user interaction with the chart.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class ChartUxClass extends beachParty.DataChangerClass
    {
        private _chartUxElem: HTMLElement;

        private _rubberBandSelector: RubberBandSelectorClass;
        private _bpsHelper: bps.ChartHostHelperClass;
        private _areToolTipsEnabled = false;
        private _hoverPrimaryKey;
        private _maxToolTipColumns;

        constructor(bpsHelper: bps.ChartHostHelperClass, maxToolTipColumns: number)
        {
            super();

            this._bpsHelper = bpsHelper;
            this._maxToolTipColumns = maxToolTipColumns;

            this.buildRubberBand();

            var chartUxElem = document.getElementById("chartUxDiv");
            this._chartUxElem = chartUxElem;

            //vp.select(chartUxElem).attach("mousedown", (e) => this.onWindowMouseDown(e));
            vp.select(".sandDance").attach("mouseup", (e) => this.enableEngineUI(true));

            //---- MOUSE MOVE for tooltips ----
            vp.select(chartUxElem).attach("mousemove", (e) => this.onUxMouseMove(e));

            //---- KEY DOWN for keyboard commands ----
            vp.select(".sandDance").attach("keydown", (e) => this.onKeyDown(e));

            //---- DBL CLICK for reset transform ----
            vp.select(chartUxElem).attach("dblclick", (e) => this.onDblClick(e));

            //---- MOUSE OVER for 3D circle ----
            //vp.select("#myChart").attach("mouseover", (e) => this.onMouseOver(e));

            //---- CONTEXT MENU for toggling data tips on/off ----
            // vp.select(chartUxElem).attach("contextmenu", (e) => this.onPlotContextMenu(e));
        }

        onDblClick(e)
        {
            //---- why does animatin get turned off here? ----
            this._bpsHelper.resetTransform();
        }

        onKeyDown(e)
        {
            //---- TODO: add 3D nav keys here ----
            if (e.keyCode === vp.events.keyCodes.escape)
            {
                //---- why does animatin get turned off here? ----
                this._bpsHelper.resetTransform();
            }
        }

        //onMouseOver(e)
        //{
        //    appClass.instance.pulse3DCircleIfAppropriate();
        //}

        onPlotContextMenu(e)
        {
            //---- TODO: with TOUCH interface, hover does not get set - fix this so that it works just based on current pt ----
            vp.utils.debug("chartUx: onPlotContextMenu called");

            this._rubberBandSelector.cancelPendingUpEvent();

            //---- force hover info to be updated (especially important for TOUCH interface) ----
            this.onUxMouseMove(e, (evt) =>
            {
                var primaryKey = this._hoverPrimaryKey;
                vp.utils.debug("chartUx: onMouseMove callback: primaryKey=" + primaryKey);

                if (primaryKey)
                {
                    var dataTip = DataTipMgrClass.instance.getDataTip(primaryKey);
                    vp.utils.debug("chartUx: onMouseMove callback: dataTip=" + dataTip);

                    if (dataTip)
                    {
                        //---- REMOVE dataTip ----
                        DataTipMgrClass.instance.closeDataTip(dataTip);
                    }
                    else
                    {
                        //---- ADD dataTip ----
                        var colName = vp.select("#searchCol").text();
                        var pt = vp.events.mousePosition(e);

                        DataTipMgrClass.instance.addDataTip(colName, pt);

                        vp.events.cancelEventBubble(e);
                        vp.events.cancelEventDefault(e);
                    }
                }
            });
        }

        onUxMouseMove(e, callback?: any)
        {
            if (true)       // !this._delayTimer)         // throttle mouse events
            {
                var hoverEnabled = (settings.hoverEffect() !== "none");
                if (hoverEnabled && e.buttons !== 1)            // not left button
                {
                    var mousePos = vp.events.mousePosition(e, this._chartUxElem);

                    //---- show tooltips if middle/right mouse button pressed, or if tooltips are enabled ----
                    var getRecord = (e.buttons !== 0 || settings.isTooltipsEnabled());
                    var scale = this._rubberBandSelector.getScale();

                    this._bpsHelper.applyHover(mousePos.x / scale.x, mousePos.y / scale.y, getRecord, null, (msgBlock) =>
                    {
                        if (this._hoverPrimaryKey !== msgBlock.primaryKey)
                        {
                            this._hoverPrimaryKey = msgBlock.primaryKey;

                            if (getRecord)
                            {
                                this.showToolTipForShape(msgBlock.primaryKey, msgBlock.record);
                            }
                            else
                            {
                                vp.select(this._chartUxElem).title("");
                            }

                            //vp.utils.debug("chartUx: hover primaryKey=" + msgBlock.primaryKey);
                        }

                        if (callback)
                        {
                            callback(msgBlock);
                        }
                    });

                    //this.setNextMsgDelay();
                }
            }
        }

        enableEngineUI(value: boolean)
        {
            vp.select("#myChart").css("pointer-events", (value) ? "" : "none");

            if (!value)
            {
                //---- set focus so we can get keyboard events ----
                setTimeout((e) => this._chartUxElem.focus(), 10);
            }
        }

        getHoverPrimaryKey()
        {
            return this._hoverPrimaryKey;
        }

        buildRubberBand()
        {
            var chartUxElem = document.getElementById("chartUxDiv");
            this._rubberBandSelector = new RubberBandSelectorClass(chartUxElem);

            //---- hook the RECT SELECT event ----
            this._rubberBandSelector.attachOnSelect((evt, rcBand, toggle, mouseDownOrigin) =>
            {
                if (rcBand)
                {
                    let scale = this._rubberBandSelector.getScale();

                    //---- adjust rcBand so that it is relative to "myChart" ----
                    var rc = vp.select("#myChart").getBounds(false);

                    var rcBandAdj = vp.geom.createRect(
                        (rcBand.left - rc.left) / scale.x,
                        (rcBand.top - rc.top) / scale.y,
                        rcBand.width,
                        rcBand.height);

                    var sd = new SelectionDesc();
                    sd.legendSource = "rect drag";
                    sd.rectSelect = rcBandAdj;

                    AppClass.instance.setSelectionDesc(sd);
                    this._bpsHelper.rectSelect(rcBandAdj);
                }
            });

            this._rubberBandSelector.registerForChange("mouseDown", (e) =>
            {
                //---- mouse vs touch issue: turn off last tooltip info, or it shows wherever user touches screen (if cursor is over a shape) ----
                //this._view.hideToolTip();

                this.enableEngineUI(false);
            });

            this._rubberBandSelector.isEnabled(true);

        }

        showToolTipForShape(primaryKey: string, record: any)
        {
            var ttMsg = "";

            if (primaryKey !== null)
            {
                if (record)             // may be switching data sets
                {
                    var keys = vp.utils.keys(record);

                    keys.sort();

                    var maxCols = Math.min(keys.length, this._maxToolTipColumns);

                    for (var i = 0; i < maxCols; i++)
                    {
                        var key = keys[i];
                        var value = record[key];
                        var colType = AppClass.instance.getColType(key);

                        value = vp.formatters.formatByType(value, colType);

                        if (!key.startsWith("_"))
                        {
                            if (ttMsg !== "")
                            {
                                ttMsg += "\r\n";
                            }

                            ttMsg += key + "=" + value;
                        }
                    }

                    ttMsg += "\r\n\r\nprimaryKey=" + record[beachParty.primaryKeyName];
                }

            }

            //---- set tooltip on our div ----
            vp.select(this._chartUxElem).title(ttMsg);

            //vp.utils.debug("set tooltip=" + ttMsg);
        }

        hideToolTip()
        {
            vp.select(this._chartUxElem)
                .title("");
        }

        areToolTipsEnabled(value?: boolean)
        {
            if (value === undefined || value === null)
            {
                return this._areToolTipsEnabled;
            }

            this._areToolTipsEnabled = value;

            this.onDataChanged("areToolTipsEnabled");
        }
   }
}