//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    textLegend.ts - draws an interactive, continuous/discreet color legend (color palette, ticks, labels).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class textLegendClass extends beachParty.dataChangerClass
    {
        //_colorPalette: any[];
        //_isContinuous: boolean;
        //_isCategory: boolean;
        //_numSteps: number;
        //_breaks: any[];

        _tm: bps.TextMappingData;

        _rootElem: HTMLElement;
        _titleElem: HTMLElement;
        _paletteElem: HTMLElement;

        constructor(rootName: string, tm: bps.TextMappingData)
        {
            super();

            this._tm = tm;
            var root = vp.select("#" + rootName)

            //---- add colName as TITLE ----
            var title = root.append("span")
                .addClass("legendTitle textButton")
                .id("textLegendTitle")
                .text(tm.colName)

            //---- add PALETTE ----
            var palette = root.append("div")
                .addClass("legendPalette")

            this._rootElem = root[0];
            this._titleElem = title[0];
            this._paletteElem = palette[0];

            this.updateLegend();
        }

        textMapping(value?: bps.TextMappingData)
        {
            if (arguments.length === 0)
            {
                return this._tm;
            }

            this._tm = value;
            this.onDataChanged("textMapping");

            this.updateLegend();
        }

        updateLegend()
        {
            var tm = this._tm;
            var name = tm.colName;

            vp.select(this._rootElem)
                .css("display", (name) ? "block" : "none")

            vp.select(this._titleElem)
                .text(name)

            this.rebuildPalette();
                
        }

        rebuildPalette()
        {
            //var cm = this.sm;
            //var colorPalette = cm.colorPalette;
            //var paletteW = vp.select(this._paletteElem);

            //var maxPaletteHeight = 150;
            //var entryHeight = 75;
            //var entryWidth = 20;

            //paletteW
            //    .clear()
            //    .css("width", entryWidth + "px")
            //    .css("opacity", this._opacity+"")

            //var count = colorPalette.length;

            //if (cm.isContinuous)
            //{
            //    var lg = "linear-gradient(";
            //    for (var i = 0; i < count; i++)
            //    {
            //        if (i)
            //        {
            //            lg += ",";
            //        }

            //        var cr = colorPalette[i];
            //        lg += cr;
            //    }

            //    lg += ")";

            //    //---- CONTINUOUS ----
            //    paletteW
            //        .css("background", lg)
            //        .css("height", maxPaletteHeight + "px")
            //}
            //else
            //{
            //    //---- STEPS ----
            //    if (count * entryHeight > maxPaletteHeight)
            //    {
            //        entryHeight = maxPaletteHeight / count;
            //    }

            //    for (var i = 0; i < count; i++)
            //    {
            //        var cr = colorPalette[i];

            //        paletteW.append("div")
            //            .css("background-color", cr)
            //            .addClass("colorPaletteEntry")
            //            .css("width", entryWidth + "px")
            //            .css("height", entryHeight + "px")

            //}
            //}
        }
    }
}
 