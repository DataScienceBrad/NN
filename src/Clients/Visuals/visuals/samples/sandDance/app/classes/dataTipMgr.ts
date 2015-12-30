//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataTipMgr.ts - manages the data tips on the client.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class DataTipMgrClass extends beachParty.dataChangerClass 
    {
        static instance: DataTipMgrClass;

        _dataTips: DataTipClass[] = [];

        constructor()
        {
            super();

            DataTipMgrClass.instance = this;
        }

        addDataTip(colName: string, pt?: any)
        {
            var rootW = vp.select("#dataTipsRoot");

            var dataTip = new DataTipClass(rootW[0], bps.chartHostHelperClass.instance);
            this._dataTips.push(dataTip);

            dataTip.setColumnName(colName);

            dataTip.registerForChange("position", (e) =>
            {
                var rc = dataTip.getPlotBounds();
                var msg = "dataTip: " + vp.geom.rectToString(rc);

                AppClass.instance.quickStats(msg);
            });

            if (pt)
            {
                dataTip.moveToPoint(pt.x, pt.y, true);
            }

            return dataTip;
        }

        getDataTip(primaryKey: string)
        {
            var dataTip = null;
            vp.utils.debug("getDataTip: primaryKey=" + primaryKey + ", dataTips.length=" + this._dataTips.length);

            for (var i = 0; i < this._dataTips.length; i++)
            {
                var dt = this._dataTips[i];
                if (dt._primaryKey === primaryKey)
                {
                    dataTip = dt;
                    break;
                }
            }

            return dataTip;
        }

        closeDataTip(dataTip: DataTipClass)
        {
            dataTip.close();
            this._dataTips.remove(dataTip);
        }

        hideDataTipsBeforeLayout()
        {
            for (var i = 0; i < this._dataTips.length; i++)
            {
                var dt = this._dataTips[i];

                dt.show(false);
            }
        }

        updateDataTipsAfterLayout()
        {
            for (var i = 0; i < this._dataTips.length; i++)
            {
                var dt = this._dataTips[i];

                dt.updateTextAndOffset(dt._primaryKey);
            }
        }

        clearDataTips()
        {
            //---- remove old data tips ----
            vp.select("#dataTipsRoot")
                .clear();

            this._dataTips = [];
        }

        getDataFromDataTips(preload: bps.Preload)
        {
            preload.dataTips = [];

            for (var i = 0; i < this._dataTips.length; i++)
            {
                var dataTip = this._dataTips[i];
                var dtd = dataTip.getDataTipData();

                preload.dataTips.push(dtd);
            }
        }
    }
} 