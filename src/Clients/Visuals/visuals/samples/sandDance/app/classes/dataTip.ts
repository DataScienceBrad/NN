//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataTip.ts - control that displays text from record that is positioned over.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class DataTipClass extends beachParty.DataChangerClass implements IAppControl
    {
        _root: HTMLDivElement;
        _img: HTMLImageElement;
        _text: HTMLDivElement;

        _bpsHelper: bps.ChartHostHelperClass;
        _dataTipOffset = null;          // where mouse/pointer clicked on the datatip
        _columnName: string;            // if bound to a column
        _primaryKey: string;            // if bound to a specific record
        _plotBounds: any;
        _ptMouseDown: any;              // screen coordinates of mouse when we clicked on tooltip
        _isRealDrag = false;            // true if datatip has been dragged more than just accidental movement during a click
        _dataTipPanel: DataTipPanelClass;

        constructor(parentElem: HTMLElement, bpsHelper: bps.ChartHostHelperClass)
        {
            super();

            this._bpsHelper = bpsHelper;

            //---- build control ----
            var rootW = vp.select(parentElem).append("div")
                .addClass("dataTipContainer")
                .css("position", "absolute")
                .css("z-index", "999")
                .attach("contextmenu", (e) =>
                {
                    this.showContextMenu(e);
                });

            //---- create image to drag with mouse movements ----
            var imgW = rootW.append("div")
                .addClass("dataTipDragger")
                .addClass("fnDragDataTip")
                .css("width", "20px")
                .attach("mousedown", (e) => this.onMouseDown(e));

            //---- create associated TEXT window ----
            var textW = rootW.append("div")
                .addClass("dataTipText")
                .css("position", "relative")
                .css("bottom", "40px")                  // a space of about 20 pixels between text & img
                .css("left", "-1px")
                .attach("mousedown", (e) =>
                {
                });

            this._root = rootW[0];
            this._img = imgW[0];
            this._text = textW[0];

            //---- save pointer this dataTip instance ----
            rootW[0].control = this;
        }

        showContextMenu(e)
        {
            var items =
                [
                    new MenuItemData("Properties", "Open the properties panel for this data tip"),
                    new MenuItemData("Delete", "Delete this data tip"),
                ];

            var pm = new PopupMenuClass(null, "pmInsights", items, (e, menu, textIndex, menuIndex) =>
            {
                var name = (<MenuItemData> items[menuIndex]).text;

                if (name === "Delete")
                {
                    DataTipMgrClass.instance.closeDataTip(this);
                }
                else if (name === "Properties")
                {
                    this._dataTipPanel = new DataTipPanelClass(this);

                    var rc = vp.select(this._img).getBounds(false);
                    this._dataTipPanel.show(rc.right, rc.bottom);
                }

            }, true);

            var pt = vp.events.mousePosition(e);
            pm.show(pt.x, pt.y);
        }

        onMouseDown(e)
        {
            if (e.which === 1)
            {
                //---- LEFT CLICK ----
                var offset = vp.events.mousePosition(e, this._img);

                //---- adjust for some offset around icon ----
                //offset.x -= 4;
                offset.y -= 0;

                this.startDrag(e, offset);

                vp.events.cancelEventBubble(e);
                vp.events.cancelEventDefault(e);
            }
            //else if (e.which == 3)
            //{
            //    //---- RIGHT CLICK ----
            //    this.close();           
            //}

        }

        getPlotBounds()
        {
            return this._plotBounds;
        }

        getDataTipData()
        {
            var dtd = new bps.DataTipData();

            dtd.text = vp.select(this._text).text();
            dtd.primaryKey = this._primaryKey;

            var rc = vp.select(this._root).getBounds(true);
            dtd.offset = { left: rc.left, top: rc.top };

            dtd.colName = this._columnName;

            return dtd;
        }

        setDataTipData(dtd: bps.DataTipData)
        {
            //---- OFFSET and TEXT will be updated again if recordIndex is set ----
            //---- but we do it now for the case when the data is not bound to a record ----
            //---- and in case the record binding fails ----
            vp.select(this._root)
                .css("left", dtd.offset.left + "px")
                .css("top", dtd.offset.top + "px");

             vp.select(this._text)
                .text(dtd.text);

            this._primaryKey = dtd.primaryKey;
            this._columnName = dtd.colName;

            if (dtd.primaryKey !== null && dtd.primaryKey !== undefined)
            {
                this.updateTextAndOffset(dtd.primaryKey);
            }
        }

        setColumnName(value: string)
        {
            this._columnName = value;
            this.updateTextAndOffset();
        }

        show(value?: boolean)
        {
            vp.select(this._root)
                .css("display", (value) ? "" : "none");
        }

        updateTextAndOffset(primaryKey?: string)
        {
            var requestedColumnNames = [this._columnName];

            if (primaryKey !== undefined)
            {
                //---- get information about bound record index ----
                this._bpsHelper.getRecordAndBounds(primaryKey, requestedColumnNames, (msgBlock) =>
                {
                    this._primaryKey = primaryKey;

                    var rc = msgBlock.screenBounds;

                    if (rc)
                    {
                        var x = (rc.left + rc.right) / 2;
                        var y = (rc.top + rc.bottom) / 2;

                        //---- offset by half drag icon size ----
                        var rcIcon = vp.select(this._img).getBounds(true);
                        x -= rcIcon.width / 2;
                        y -= rcIcon.height / 2;

                        //---- offset by rcPlot ----
                        var rcPlot = msgBlock.rcPlot;
                        x += rcPlot.left;
                        y += rcPlot.top;

                        //---- offset by rcChart ----
                        var rcChart = vp.select("#myChart").getBounds(true);
                        x += rcChart.left;
                        y += rcChart.top;

                        vp.select(this._root)
                            .css("left", x + "px")
                            .css("top", y + "px")
                            .css("display", "");

                        this.buildTextFromColumnValues(requestedColumnNames, msgBlock.colValues);
                    }
                    else
                    {
                        //---- hide it until we have a place to put it ----
                        vp.select(this._root)
                            .css("display", "none");
                    }
                });
            }
            else
            {
                var rcScreen = vp.dom.getBounds(this._img);

                var rcPlot = vp.select("#myChart")
                    .getBounds(false);

                //--- bug workaround: -= operator broken for ClientRect properties ----
                var lineWidth = 2;
                var lineWidth2 = 2 * lineWidth;

                var rc = vp.geom.createRect(rcScreen.left - rcPlot.left + lineWidth, rcScreen.top - rcPlot.top + lineWidth,
                    rcScreen.width - lineWidth2, rcScreen.height - lineWidth2);

                this._plotBounds = rc;

                this._bpsHelper.getMostCentralRecord(rc, requestedColumnNames, (msgBlock) =>
                {
                    this.buildTextFromColumnValues(requestedColumnNames, msgBlock.colValues);

                    this._primaryKey = msgBlock.recordIndex;
                });
            }
             
        }

        buildTextFromColumnValues(colNames: string[], colValues: string[])
        {
            var html = "";

            if (colValues)
            {
                for (var i = 0; i < colValues.length; i++)
                {
                    var colName = colNames[i];
                    var colType = AppClass.instance.getColType(colName);

                    var value = colValues[i];
                    var strValue = vp.formatters.formatByType(value, colType);

                    html += strValue + "<br />";
                }
            }

            if (html === "")
            {
                html = "&nbsp;&nbsp;";
            }

            //---- set text / HTML ----
            var textW = vp.select(this._text);

                textW.html(html);

                ////---- position bottom of text 40 pixels above img ----
                //var rc = textW.getBounds(false);
                //textW
                //    .css("top", -(rc.height + 40) + "px")
        }

        startDrag(e, offset)
        {
            this._ptMouseDown = vp.events.mousePosition(e);
            this._isRealDrag = false;

            this._dataTipOffset = offset;

            //---- capture mouse ----
            // vp.events.setCaptureWindow((e) => this.onMouseMove(e), (e) => this.onMouseUp(e), ["myChart"]);

            //---- draw first image ----
            this.onMouseMove(e);

            vp.events.cancelEventDefault(e);
        }

        onMouseMove(e)
        {
            var pt = vp.events.mousePosition(e);
            pt.x -= this._dataTipOffset.x;
            pt.y -= this._dataTipOffset.y;

            if (!this._isRealDrag)
            {
                var xdiff = Math.abs(pt.x - this._ptMouseDown.x);
                var ydiff = Math.abs(pt.x - this._ptMouseDown.x);

                if (xdiff > 3 || ydiff > 3)
                {
                    this._isRealDrag = true;
                }
            }

            if (this._isRealDrag)
            {
                this.moveToPoint(pt.x, pt.y, false);
            }
        }

        moveToPoint(x: number, y: number, centerRelative?: boolean)
        {
            if (centerRelative)
            {
                var rc = vp.select(this._root).getBounds(false);
                x -= rc.width / 2;
                y -= rc.height / 2;
            }

            vp.select(this._root)
                .css("left", x + "px")
                .css("top", y + "px");

            this.onDataChanged("position");

            this.updateTextAndOffset();
        }

        onMouseUp(e)
        {
            vp.events.releaseCaptureWindow();
            vp.events.cancelEventDefault(e);

            var closeMe = (!this._isRealDrag);
            if (!closeMe)
            {
                //---- if outside of plot, remove ----
                var rcImg = vp.dom.getBounds(this._img);

                var rcPlot = vp.select("#myChart")
                    .getBounds(false);

                if (!vp.geom.rectIntersectsRect(rcImg, rcPlot))
                {
                    closeMe = true;
                }
            }

            if (closeMe)
            {
                this.close();
            }

        }

        getRootElem()
        {
            return this._root;
        }

        close()
        {
            vp.select(this._root)
                .remove();
        }
    }
}