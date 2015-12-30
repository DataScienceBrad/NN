//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    paletteHelper.ts - helps client apps build a color, size, and image palettes based on the associated MappingData.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    // import colorPalettesClass = beachParty.colorPalettesClass;

    export class PaletteHelper
    {
        public static buildColorBreaks(cm: bps.ColorMappingData, colInfo: bps.ColInfo, useNiceNumbers: boolean)
        {
            if (cm)
            {
                var palette = cm.colorPalette;
                var breaks = null;
                var colName = cm.colName;

                if (colName)
                {
                    if (colInfo)
                    {
                        //palette = colorPalettesClass.getPaletteFromSettings(cm.paletteName, cm.stepsRequested, cm.isReversed);

                        var isCategory = (cm.forceCategory || colInfo.colType === "string");

                        if (isCategory)
                        {
                            var result = this.buildCategoryBreaks(colInfo, palette);

                            breaks = result.breaks;
                            palette = result.palette;
                        }
                        else
                        {
                            //---- user-supplied palette overrides cm.binCount ----
                            //if (palette.length > cm.binCount)
                            //{
                            //    //---- shorten palette to # of color steps requested ----
                            //    palette = palette.slice(0, cm.binCount);
                            //}
                            cm.binCount = palette.length;

                            breaks = this.buildNumericBreaks(colInfo, palette, useNiceNumbers);
                        }
                    }
                }

                cm.colorPalette = palette;
                cm.breaks = breaks;
            }
        }

        static buildSizeBreaksFromSettings(sm: bps.SizeMappingData, colInfo: bps.ColInfo, useNiceNumbers: boolean)
        {
            if (sm)
            {
                var palette = sm.sizePalette;
                var breaks = null;
                var colName = sm.colName;

                if (colName)
                {
                    if (colInfo)
                    {
                        //---- the default size palette, for now ----
                        //palette = [.25, .5, .75, 1];

                        var isCategory = (sm.forceCategory || colInfo.colType === "string");

                        if (isCategory)
                        {
                            var result = this.buildCategoryBreaks(colInfo, palette);

                            breaks = result.breaks;
                            palette = result.palette;
                        }
                        else
                        {
                            breaks = this.buildNumericBreaks(colInfo, palette, useNiceNumbers);
                        }
                    }
                }

                sm.sizePalette = palette;
                sm.breaks = breaks;
            }
        }

        static buildImageBreaksFromSettings(im: bps.ImageMappingData, colInfo: bps.ColInfo, useNiceNumbers: boolean)
        {
            if (im)
            {
                var palette = im.imagePalette;
                var breaks = null;
                var colName = im.colName;

                if (colName)
                {
                    if (colInfo)
                    {
                        //---- the default image palette, for now ----
                        //palette = ["filled circle", "filled square", "filled triangle", "circle", "square", "triangle"];

                        var isCategory = (im.forceCategory || colInfo.colType === "string");

                        if (isCategory)
                        {
                            var result = this.buildCategoryBreaks(colInfo, palette);

                            breaks = result.breaks;
                            palette = result.palette;
                        }
                        else
                        {
                            breaks = this.buildNumericBreaks(colInfo, palette, useNiceNumbers);
                        }
                    }
                }

                im.imagePalette = palette;
                im.breaks = breaks;
            }
        }

        static buildCategoryBreaks(colInfo: bps.ColInfo, palette)
        {
            var keys = colInfo.sortedKeys ? colInfo.sortedKeys : (<any>colInfo).keys;      // support older "keys" format in QuickTest insights

            var keyCount = keys.length;

            if (keyCount < palette.length)
            {
                palette = palette.slice(0, keyCount);
            }

            var breaks = [];

            for (var i = 0; i < palette.length; i++)
            {
                if (i === palette.length - 1 && keyCount > palette.length)
                {
                    breaks.push("Other");
                }
                else
                {
                    breaks.push(keys[i]);
                }
            }

            return { breaks: breaks, palette: palette };
        }

        static buildNumericBreaks(colInfo: bps.ColInfo, palette, useNiceNumbers: boolean)
        {
            var min = colInfo.min;
            var max = colInfo.max;
            var stepCount = (palette.length) ? palette.length : 1;

            if (useNiceNumbers)
            {
                var result = vp.scales.niceNumbersAlt.calculate(min, max, stepCount + 1);
                min = result.min;
                max = result.max;
            }

            var stepAmt = (max - min) / stepCount;

            var breaks = vp.data.range(min, max, stepAmt);
            return breaks;
        }

    }
}
 