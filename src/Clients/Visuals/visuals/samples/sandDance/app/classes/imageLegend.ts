//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    imageLegend.ts - draws an interactive, discreet image legend (image, ticks, labels).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class ImageLegendClass extends beachParty.DataChangerClass
    {
        private container: HTMLElement;

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

        _im: bps.ImageMappingData;
        _bpsHelper: bps.ChartHostHelperClass;
        _app: AppClass;                 // need to get latest ColInfo on legend build

        constructor(container: HTMLElement, app: AppClass, rootName: string, bpsHelper: bps.ChartHostHelperClass)
        {
            super();

            this.container = container;

            this._app = app;
            this._im = null;
            this._bpsHelper = bpsHelper;

            var root = vp.select(this.container, "." + rootName)
                .addClass("legend")
                .css("margin-bottom", "20px");

            //---- add colName as TITLE ----
            var title = root.append("div")
                .addClass("legendTitle textButton")
                .addClass("shapeLegendTitle")
                .attach("click", (e) =>
                {
                    //---- request that the image panel be opened by the client
                    AppUtils.callPanelOpen(e, (e) => this.onDataChanged("imagePanelRequest"));
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

        imageMapping(value?: bps.ImageMappingData)
        {
            if (arguments.length === 0)
            {
                return this._im;
            }

            this._im = value;
            this.onDataChanged("imageMapping");

            this.updateLegend();
        }

        updateLegend()
        {
            var cm = this._im;
            var name = (cm) ? cm.colName : "";

            vp.select(this._rootElem)
                .css("display", (name) ? "block" : "none");

            vp.select(this._titleElem)
                .text(name);

            this.rebuildPalette();

        }

        search(colName: string, value: string)
        {
            this._app.doSearch("Image", colName, value, value, bps.TextSearchType.exactMatch);
        }

        rebuildPalette()
        {
            var im = this._im;

            if (im && im.imagePalette && im.colName)
            {
                var imagePalette = im.imagePalette;
                var breaks = im.breaks;

                var count = imagePalette.length;
                if (breaks && breaks.length < count)
                {
                    count = breaks.length;
                }

                var colInfo = this._app.getColInfo(im.colName);
                var isNumeric = (colInfo.colType !== "string");            // number or date

                var entryHeight = this.drawImagePalette(im, count, imagePalette, isNumeric);
                this.drawTickMarks(im, count, imagePalette, this._entryWidth, entryHeight);
                this.drawLabels(im, count, imagePalette, this._entryWidth, entryHeight, isNumeric);
            }
        }

        drawTickMarks(cm: bps.ImageMappingData, count: number, imagePalette: any[], entryWidth: number, entryHeight: number)
        {
            var ticksW = vp.select(this._ticksElem);

            ticksW
                .clear();

            var textTop = (entryHeight / 2) - 9;
            count++;

            //---- go thru backwards, since we want the LIGHT images at the top (and client palettes start with DARK) ----
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

        drawLabels(cm: bps.ImageMappingData, count: number, imagePalette: any[], entryWidth: number, entryHeight: number, isNumeric: boolean)
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

                var imageIndex = i;        // (count - 1) - i;
                this._textElems[imageIndex] = labelW[0];

                lastValue = value;
                textTop -= entryHeight;
            }
        }

        searchForEntryValues(e)
        {
            var elem = e.target;

            if (elem.imageIndex !== undefined)
            {
                //---- get text element from this image palette entry ----
                elem = this._textElems[elem.imageIndex];
            }

            this._app.doSearch("Image", elem.colName, elem.fromValue, elem.toValue, elem.searchType);
        }

        getImageFromSheet(imgSheet: any, width: number, height: number, index: number)
        {
            var canvasW = vp.select(document.createElement("canvas"))
                .attr("width", width)
                .attr("height", height);

            //---- get drawing context ----
            var canvas = <HTMLCanvasElement>canvasW[0];
            var ctx = canvas.getContext("2d");

            //---- draw the selected shape onto the canvas ----
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(imgSheet, index * width, 0, width, height, 0, 0, width, height);

            return canvas;
        }

        drawImagePalette(im: bps.ImageMappingData, count: number, imagePalette: any[], isNumeric: boolean)
        {
            var entryWidth = this._entryWidth;
            var entryHeight = this._entryHeight;
            var breaks = im.breaks;

            var paletteW = vp.select(this._paletteElem);

            paletteW
                .clear();
                //.css("width", entryWidth + "px")

            //---- STEPS ----
            if (count * entryHeight > this._maxPaletteHeight)
            {
                entryHeight = this._maxPaletteHeight / count;
            }

            //---- build image as imageSheet ----
            var textureMaker = new beachParty.TextureMakerClass(im.imagePalette);
            textureMaker.buildShapeMakers(im.imagePalette);

            var drawShapeSize = 32;
            var imgSheet = textureMaker.createShapeImages(drawShapeSize, 3);

            //---- go thru backwards, since we want the LIGHT images at the top (and client palettes start with DARK) ----
            for (var i = count - 1; i >= 0; i--)
            {
                var text = (breaks) ? breaks[i] : "";

                //---- get image from imageSheet ----
                var canvas = this.getImageFromSheet(imgSheet, drawShapeSize, drawShapeSize, i);

                var cellW = paletteW.append("div")
                    .css("width", entryWidth + "px")
                    .css("height", (entryHeight) + "px")
                    .addClass("imagePaletteEntry")
                    .customAttr("value", text)
                    .attach("click", (e) => this.searchForEntryValues(e))
                    .css("margin-bottom", "-1px")           // overlap with next top border
                    .css("position", "relative");

                cellW[0].imageIndex = (isNumeric) ? (i + 1) : i;

                //---- now draw the image within the cell ----
                var shapeSize = entryHeight - 4;

                var left = (entryWidth - shapeSize) / 2;
                var top = (entryHeight - shapeSize) / 2;

                cellW.append("img")
                    .addClass("imagePaletteShape")
                    .css("width", shapeSize + "px")
                    .css("height", shapeSize + "px")
                    .css("display", "inline-block")
                    .css("top", left + "px")
                    .css("left", top + "px")
                    .css("position", "absolute")
                    .attr("src", canvas.toDataURL());

            }

            //---- allow for border with bottom/top overlap ----
            return (entryHeight + 1);
        }
    }
}
