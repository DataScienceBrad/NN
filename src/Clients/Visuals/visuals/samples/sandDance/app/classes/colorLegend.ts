//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    colorLegend.ts - draws an interactive, continuous/discreet color legend (color palette, ticks, labels).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class colorLegendClass extends beachParty.dataChangerClass
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

        _paletteElements: HTMLElement[];

        _cm: bps.ColorMappingData;
        _bpsHelper: bps.chartHostHelperClass;
        _app: appClass;                 // need to get latest ColInfo on legend build

        constructor(app: appClass, rootName: string, bpsHelper: bps.chartHostHelperClass)
        {
            super();

            this._app = app;
            this._cm = null;
            this._bpsHelper = bpsHelper;

            var root = vp.select("#" + rootName)
                .addClass("legend")
                .css("margin-bottom", "20px")

            //---- add colName as TITLE ----
            var title = root.append("div")
                .addClass("legendTitle textButton")
                .id("colorLegendTitle")
                .attach("click", (e) =>
                {
                    appUtils.callPanelOpen(e, (e) => this.onDataChanged("colorPanelRequest"));
                });

            var table = root.append("table")
                .addClass("legendHolder")

            var row = table.append("tr")

            //---- add PALETTE ----
            var paletteW = row.append("td")
                .addClass("legendPalette")
                .attr("valign", "top")
                .css("width", "20px")

            //---- add TICKS ----
            var ticksW = row.append("td")
                .addClass("legendTicks")
                .css("width", "0px")
                .css("position", "relative")

            //---- add LABELS ----
            var labelsW = row.append("td")
                .addClass("legendLabels")
                .css("position", "relative")

            ////---- add spacer TD as last column ----
            //var spacerW = row.append("td")

            this._rootElem = root[0];
            this._titleElem = title[0];
            this._paletteElem = paletteW[0];
            this._labelsElem = labelsW[0];
            this._ticksElem = ticksW[0];

            this.updateLegend();
        }

        selectColorBox(index: number)
        {
            var elems = this._paletteElements;
            if (elems && elems.length)
            {
                if (index < 0)
                {
                    index += elems.length;
                }
                else
                {
                    //---- true elements start at index=1 ----
                    index++;
                }

                var elem = elems[index];
                var e = { target: elem };

                this.searchForEntryValues(e);
            }
        }

        show(value: boolean)
        {
            vp.select(this._rootElem)
                .css("display", (value) ? "" : "none")
        }

        colorMapping(value?: bps.ColorMappingData)
        {
            if (arguments.length === 0)
            {
                return this._cm;
            }

            this._cm = value;
            this.onDataChanged("colorMapping");

            this.updateLegend();
        }

        updateLegend()
        {
            var cm = this._cm;
            var name = (cm) ? cm.colName : "";

            vp.select(this._rootElem)
                .css("display", (name) ? "block" : "none")

            vp.select(this._titleElem)
                .text(name)

            this.rebuildPalette();

        }

        search(colName: string, value: string)
        {
            this._bpsHelper.search(colName, value);
        }

        rebuildPalette()
        {
            var cm = this._cm;

            if (cm && cm.colorPalette && cm.colName)
            {
                var colorPalette = cm.colorPalette;
                var breaks = cm.breaks;

                var count = colorPalette.length;
                if (breaks && breaks.length < count)
                {
                    count = breaks.length;
                }

                var colInfo = this._app.getColInfo(cm.colName);
                var isNumeric = (colInfo.colType != "string");            // number or date

                var entryHeight = this.drawColorPalette(cm, count, colorPalette, isNumeric);
                this.drawTickMarks(cm, count, colorPalette, this._entryWidth, entryHeight);
                this.drawLabels(cm, count, colorPalette, this._entryWidth, entryHeight, colInfo.colType);
            }
        }

        drawTickMarks(cm: bps.ColorMappingData, count: number, colorPalette: any[], entryWidth: number, entryHeight: number)
        {
            var breaks = cm.breaks;
            var ticksW = vp.select(this._ticksElem);

            ticksW
                .clear()

            var textTop = (entryHeight / 2) - 9;
            count++;

            //---- go thru backwards, since we want the LIGHT colors at the top (and client palettes start with DARK) ----
            for (var i = count - 1; i >= 0; i--)
            {
                ticksW.append("div")
                    .addClass("legendTick")
                    .css("position", "absolute")
                    .css("left", "-3px")
                    .css("top", textTop + "px")

                if (i == count - 1)
                {
                    textTop--;          // fudge factor
                }

                textTop += entryHeight;
            }
        }

        drawLabels(cm: bps.ColorMappingData, count: number, colorPalette: any[], entryWidth: number, entryHeight: number, colType: string)
        {
            var breaks = cm.breaks;
            var labelsW = vp.select(this._labelsElem);
            this._textElems = [];

            labelsW
                .clear()

            var textTop = ((count-1) * entryHeight) + (entryHeight / 2) - 10;
            var isNumeric = (colType != "string");

            if (isNumeric)
            {
                count++;
                textTop += 10;
            }

            var lastValue = null;
            
            if (colType == "number")
            {
                var formatter = <any>vp.formatters.createCommaFormatter(2);
            }
            else if (colType == "date")
            {
                var minDate = cm.breaks[0];
                var maxDate = cm.breaks[cm.breaks.length-1];
                var formatter = vp.formatters.createDateFormatterFromRange(minDate, maxDate, cm.stepsRequested);
            }
            else
            {
                var formatter = null;
            }

            //---- go thru forward, so we can access "lastValue" when processing "other" ----
            for (var i = 0; i < count; i++)
            {
                var value = (breaks) ? breaks[i] : "";
                var text = value;

                if (formatter)
                {
                    text = formatter(text);
                }

                var tooltip = (text == "Other") ? "All other values mapped here" : text;

                var labelW = labelsW.append("div")
                    .text(text)
                    .addClass("legendLabel")
                    .css("position", "absolute")
                    .css("left", "4px")
                    .css("max-width", "92px")
                    .css("top", textTop + "px")
                    .title(tooltip)
                    .attach("click", (e) => this.searchForEntryValues(e))

                labelW[0].colName = cm.colName;

                if (value == "Other")
                {
                    labelW[0].fromValue = lastValue;
                    labelW[0].toValue = lastValue;
                    labelW[0].searchType = bps.TextSearchType.greaterThanEqual;
                }
                else if (isNumeric)
                {
                    labelW[0].fromValue = (i == 0) ? value : lastValue;
                    labelW[0].toValue = value;
                    labelW[0].searchType = bps.TextSearchType.betweenInclusive;
                }
                else
                {
                    labelW[0].fromValue = value;
                    labelW[0].toValue = value;
                    labelW[0].searchType = bps.TextSearchType.exactMatch;
                }

                var colorIndex = i;        // (count - 1) - i;
                this._textElems[colorIndex] = labelW[0];

                lastValue = value;
                textTop -= entryHeight;
            }
        }

        searchForEntryValues(e)
        {
            var elem = e.target;

            if (elem.colorIndex !== undefined)
            {
                //---- get text element from this color palette entry ----
                elem = this._textElems[elem.colorIndex];
            }

            this._app.doSearch("Color", elem.colName, elem.fromValue, elem.toValue, elem.searchType);
        }

        drawColorPalette(cm: bps.ColorMappingData, count: number, colorPalette: any[], isNumeric: boolean)
        {
            var entryWidth = this._entryWidth;
            var entryHeight = this._entryHeight;
            var breaks = cm.breaks;

            var paletteW = vp.select(this._paletteElem);

            paletteW
                .clear()
                //.css("width", entryWidth + "px")

            if (cm.isContinuous)
            {
                var lg = "linear-gradient(";

                //---- go thru backwards, since we want the LIGHT colors at the top (and client palettes start with DARK) ----
                for (var i = count - 1; i >= 0; i--)
                {
                    if (i != count - 1)
                    {
                        lg += ",";
                    }

                    var cr = vp.color.colorFromPalette(colorPalette, i);
                    lg += cr;
                }

                lg += ")";

                var paletteHeight = Math.min(this._maxPaletteHeight, entryHeight * count);

                //---- CONTINUOUS ----
                paletteW
                    .css("background", lg)
                    .css("height", paletteHeight + "px")

                entryHeight = paletteHeight / count;
            }
            else
            {
                paletteW
                    .css("background", "")

                //---- STEPS ----
                if (count * entryHeight > this._maxPaletteHeight)
                {
                    entryHeight = this._maxPaletteHeight / count;
                }

                this._paletteElements = [];

                //---- go thru backwards, since we want the LIGHT colors at the top (and client palettes start with DARK) ----
                for (var i = count - 1; i >= 0; i--)
                {
                    var cr = vp.color.colorFromPalette(colorPalette, i);
                    var text = (breaks) ? breaks[i] : "";

                    var colorEntryW = paletteW.append("div")
                        .css("background-color", cr)
                        .addClass("colorPaletteEntry")
                        .css("width", entryWidth + "px")
                        .css("height", entryHeight + "px")
                        .customAttr("value", text)
                        .attach("click", (e) => this.searchForEntryValues(e))

                    colorEntryW[0].colorIndex = (isNumeric) ? (i + 1) : i;

                    this._paletteElements[i] = colorEntryW[0];
                }
            }

            return entryHeight;
        }
    }
}
 
 