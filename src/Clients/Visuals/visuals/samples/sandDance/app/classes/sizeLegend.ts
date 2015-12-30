//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    sizeLegend.ts - draws an interactive, continuous/discreet size legend (size palette, ticks, labels).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class SizeLegendClass extends beachParty.dataChangerClass
    {
        //---- constants ----
        _maxPaletteHeight = 200;
        _entryHeight = 20;
        _entryWidth = 20;

        _rootElem: HTMLElement;
        _titleElem: HTMLElement;
        _paletteElem: HTMLElement;
        _labelsElem: HTMLElement;
        _ticksElem: HTMLElement;
        _textElems: HTMLElement[];

        _sm: bps.SizeMappingData;
        _bpsHelper: bps.chartHostHelperClass;
        _app: AppClass;                 // need to get latest ColInfo on legend build

        constructor(app: AppClass, rootName: string, bpsHelper: bps.chartHostHelperClass)
        {
            super();

            this._app = app;
            this._sm = null;
            this._bpsHelper = bpsHelper;

            var root = vp.select("#" + rootName)
                .addClass("legend")
                .css("margin-bottom", "20px");

            //---- add colName as TITLE ----
            var title = root.append("div")
                .addClass("legendTitle textButton")
                .id("sizeLegendTitle")
                .attach("click", (e) =>
                {
                    //---- request that the size panel be opened by the client
                    AppUtils.callPanelOpen(e, (e) => this.onDataChanged("sizePanelRequest"));
                });

            var table = root.append("table")
                .addClass("legendHolder");

            var row = table.append("tr");

            //---- add PALETTE ----
            var paletteW = row.append("td")
                .addClass("legendPalette")
                .attr("valign", "top")
                .css("width", "20px");

            //---- add TICKS ----
            var ticksW = row.append("td")
                .addClass("legendTicks")
                .css("width", "0px")
                .css("position", "relative");

            //---- add LABELS ----
            var labelsW = row.append("td")
                .addClass("legendLabels")
                .css("position", "relative");

            ////---- add spacer TD as last column ----
            //var spacerW = row.append("td")

            this._rootElem = root[0];
            this._titleElem = title[0];
            this._paletteElem = paletteW[0];
            this._labelsElem = labelsW[0];
            this._ticksElem = ticksW[0];

            this.updateLegend();
        }

        show(value: boolean)
        {
            vp.select(this._rootElem)
                .css("display", (value) ? "" : "none");
        }

        sizeMapping(value?: bps.SizeMappingData)
        {
            if (arguments.length === 0)
            {
                return this._sm;
            }

            this._sm = value;
            this.onDataChanged("sizeMapping");

            this.updateLegend();
        }

        updateLegend()
        {
            var cm = this._sm;
            var name = (cm) ? cm.colName : "";

            vp.select(this._rootElem)
                .css("display", (name) ? "block" : "none");

            vp.select(this._titleElem)
                .text(name);

            this.rebuildPalette();

        }

        search(colName: string, value: string)
        {
            this._app.doSearch("Size", colName, value, value, bps.TextSearchType.exactMatch);
        }

        rebuildPalette()
        {
            var cm = this._sm;

            if (cm && cm.sizePalette && cm.colName)
            {
                var sizePalette = cm.sizePalette;
                var breaks = cm.breaks;

                var count = sizePalette.length;
                if (breaks && breaks.length < count)
                {
                    count = breaks.length;
                }

                var colInfo = this._app.getColInfo(cm.colName);
                var isNumeric = (colInfo.colType !== "string");            // number or date

                var entryHeight = this.drawSizePalette(cm, count, sizePalette, isNumeric);
                this.drawTickMarks(cm, count, sizePalette, this._entryWidth, entryHeight);
                this.drawLabels(cm, count, sizePalette, this._entryWidth, entryHeight, isNumeric);
            }
        }

        drawTickMarks(cm: bps.SizeMappingData, count: number, sizePalette: any[], entryWidth: number, entryHeight: number)
        {
            var ticksW = vp.select(this._ticksElem);

            ticksW
                .clear();

            var textTop = (entryHeight / 2) - 9;
            count++;

            //---- go thru backwards, since we want the LIGHT sizes at the top (and client palettes start with DARK) ----
            for (var i = count - 1; i >= 0; i--)
            {
                ticksW.append("div")
                    .addClass("legendTick")
                    .css("position", "absolute")
                    .css("left", "-3px")
                    .css("top", textTop + "px");

                if (i === count - 1)
                {
                    textTop--;          // fudge factor
                }

                textTop += entryHeight;
            }
        }

        drawLabels(cm: bps.SizeMappingData, count: number, sizePalette: any[], entryWidth: number, entryHeight: number, isNumeric: boolean)
        {
            var breaks = cm.breaks;
            var labelsW = vp.select(this._labelsElem);
            this._textElems = [];

            labelsW
                .clear();

            var textTop = ((count - 1) * entryHeight) + (entryHeight / 2) - 10;

            if (isNumeric)
            {
                count++;
                textTop += 10;
            }

            var lastValue = null;

            //---- go thru forward, so we can access "lastValue" when processing "other" ----
            for (var i = 0; i < count; i++)
            {
                var value = (breaks) ? breaks[i] : "";
                var text = value;

                if (isNumeric)
                {
                    text = vp.formatters.comma(text, 2);
                }

                var tooltip = (text === "Other") ? "All other values mapped here" : text;

                var labelW = labelsW.append("div")
                    .text(text)
                    .addClass("legendLabel")
                    .css("position", "absolute")
                    .css("left", "4px")
                    .css("max-width", "92px")
                    .css("top", textTop + "px")
                    .title(tooltip)
                    .attach("click", (e) => this.searchForEntryValues(e));

                labelW[0].colName = cm.colName;

                if (value === "Other")
                {
                    labelW[0].fromValue = lastValue;
                    labelW[0].toValue = lastValue;
                    labelW[0].searchType = bps.TextSearchType.greaterThan;
                }
                else if (isNumeric)
                {
                    labelW[0].fromValue = (i === 0) ? value : lastValue;
                    labelW[0].toValue = value;
                    labelW[0].searchType = bps.TextSearchType.betweenInclusive;
                }
                else
                {
                    labelW[0].fromValue = value;
                    labelW[0].toValue = value;
                    labelW[0].searchType = bps.TextSearchType.exactMatch;
                }

                var sizeIndex = i;        // (count - 1) - i;
                this._textElems[sizeIndex] = labelW[0];

                lastValue = value;
                textTop -= entryHeight;
            }
        }

        searchForEntryValues(e)
        {
            var elem = e.target;

            if (elem.sizeIndex !== undefined)
            {
                //---- get text element from this size palette entry ----
                elem = this._textElems[elem.sizeIndex];
            }

            this._app.doSearch("Size", elem.colName, elem.fromValue, elem.toValue, elem.searchType);
        }

        drawSizePalette(sm: bps.SizeMappingData, count: number, sizePalette: any[], isNumeric: boolean)
        {
            var entryWidth = this._entryWidth;
            var entryHeight = this._entryHeight;
            var breaks = sm.breaks;

            var paletteW = vp.select(this._paletteElem);

            paletteW
                .clear();
                //.css("width", entryWidth + "px")

            if (false)      // "continuous" size palette not yet supported      sm.isContinuous)
            {
                var lg = "linear-gradient(";

                //---- go thru backwards, since we want the LIGHT sizes at the top (and client palettes start with DARK) ----
                for (var i = count - 1; i >= 0; i--)
                {
                    if (i !== count - 1)
                    {
                        lg += ",";
                    }

                    var sz = vp.scales.numberFromContinuousPalette(sizePalette, i);

                    lg += sz;
                }

                lg += ")";

                var paletteHeight = Math.min(this._maxPaletteHeight, entryHeight * count);

                //---- CONTINUOUS ----
                paletteW
                    .css("background", lg)
                    .css("height", paletteHeight + "px");

                entryHeight = paletteHeight / count;
            }
            else
            {
                paletteW
                    .css("background", "");

                //---- STEPS ----
                if (count * entryHeight > this._maxPaletteHeight)
                {
                    entryHeight = this._maxPaletteHeight / count;
                }

                /// NOTE: sizePalette should only contain values between 0 and 1. 

                //---- go thru backwards, since we want the LIGHT sizes at the top (and client palettes start with DARK) ----
                for (var i = count - 1; i >= 0; i--)
                {
                    var sz = vp.scales.numberFromDiscretePalette(sizePalette, i);
                    var text = (breaks) ? breaks[i] : "";

                    var cellW = paletteW.append("div")
                        .css("width", entryWidth + "px")
                        .css("height", (entryHeight) + "px")
                        .addClass("sizePaletteEntry")
                        .customAttr("value", text)
                        .attach("click", (e) => this.searchForEntryValues(e))
                        .css("margin-bottom", "-1px")           // overlap with next top border
                        //.css("display", "table-cell")
                        .css("position", "relative");

                    cellW[0].sizeIndex = (isNumeric) ? (i + 1) : i;

                    //---- now draw the size shape within the cell ----
                    var shapeSize = sz * (entryHeight-4);
                    var left = (entryWidth - shapeSize) / 2;
                    var top = (entryHeight - shapeSize) / 2;

                    cellW.append("span")
                        .addClass("sizePaletteShape")
                        .css("width", shapeSize + "px")
                        .css("height", shapeSize + "px")
                        .css("background", "#bbb")
                        .css("display", "inline-block")                        
                        .css("top", left + "px")                        
                        .css("left", top + "px")                        
                        .css("position", "absolute");
                        
                }
            }

            //---- allow for border with bottom/top overlap ----
            return (entryHeight + 1);
        }
    }
}
