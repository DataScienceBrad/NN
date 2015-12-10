///-----------------------------------------------------------------------------------------------------------------
/// colorPalettes.ts.
///     - A thin TypeScript wrapper for [the third party code] colorbrewer_schemes.js [lightly modified]
///      plus some of our own helper methods.
///-----------------------------------------------------------------------------------------------------------------

/*
-------------------------------------------------------------- START OF THIRD PARTY NOTICE ------------------------------------------------------------------------
This file is based on or incorporates material from the projects listed below (collectively, "Third Party Code"). Microsoft is not the original author of the Third Party Code.
The original copyright notice and the license under which Microsoft received such Third Party Code, are set forth below. 
Such licenses and notices are provided for informational purposes only. 
Microsoft licenses the Third Party Code to you under the terms set forth in the EULA for the Microsoft Product. 
Microsoft reserves all other rights not expressly granted under this agreement, whether by implication, estoppel or otherwise. 

jeanlauliac-colorbrewer
Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The Pennsylvania State University.
Provided for Informational Purposes Only 
Apache 2.0 License 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 
See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 
----------------------------------------------------------- END OF THIRD PARTY NOTICE -----------------------------------------------------------------------------
*/

/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/).  https://groups.google.com/forum/?fromgroups=#!topic/d3-js/iyXFgJR1JY0
 */

/// <reference path="../_references.ts" />

module beachParty
{

    export class colorPalettesClass
    {
        public static MaxQualitativeColors = 12;

        public static getColorSchemeNames(colorSchemeType: string): string[]
        {
            var colorSchemes = colorPalettesClass.colorBrewerSchemes; // For shorthand
            var colorSchemeNames: string[] = [];

            switch (colorSchemeType)
            {
                case "sequential":
                    colorSchemeNames = colorSchemes.sequentialColorSchemes;
                    break;
                case "diverging":
                    colorSchemeNames = colorSchemes.divergingColorSchemes;
                    break;
                case "qualitative":
                    colorSchemeNames = colorSchemes.qualitativeColorSchemes;
                    break;
                case "custom":
                    colorSchemeNames = colorSchemes.customColorSchemes;
                    break;

                default:
                    throw "Unknown colorSchemeType '" + colorSchemeType + "'";
            }

            return (colorSchemeNames);
        }


        public static getColorSchemeByName(colorSchemeName: string): any
        {
            var colorSchemes = colorPalettesClass.colorBrewerSchemes; // For shorthand

            if (colorSchemes[colorSchemeName] != null)
            {
                return (colorSchemes[colorSchemeName]);
            }
            else
            {
                throw "Unknown colorSchemeName '" + colorSchemeName + "'";
            }
        }

        public static getColorPaletteTypeFromName(paletteName: string)
        {
            var classes = ["sequential", "diverging", "qualitative", "custom"];
            var ptn = null;

            for (var i = 0; i < classes.length; i++)
            {
                var className = classes[i];
                var names = this.getColorSchemeNames(className);
                if (names.indexOf(paletteName) > -1)
                {
                    ptn = className;
                    break;
                }
            }

            return ptn;
        }

        public static getPaletteFromSettings(colorSchemeName: string, numSteps: number, reverse: boolean)
        {
            var palette: string[] = null;

            var scheme = this.getColorSchemeByName(colorSchemeName);
            //var scheme = colorPalettesClass.getPalettesFromColorScheme(colorSchemeName, i, reverse);

            if (scheme)
            {
                //---- build scheme array, so we can call getPaletteFromSteps() ----
                var schemeArray = [];
                var keys = vp.utils.keys(scheme);
                for (var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    var value = scheme[key];

                    schemeArray.push(value);
                }

                palette = this.getPaletteFromSteps(colorSchemeName, schemeArray, numSteps);

                /// palettes in this class are defined from LIGHT to DARK but clients expect them as DARK to LIGHT, so we 
                /// reverse the requested orders.  
                reverse = (!reverse);

                if (palette && reverse)
                {
                    palette = vp.utils.copyArray(palette).reverse();
                }
            }

            return palette;
        }


        // Qualitative schemes are special in that they don't all contain the same number of palettes:
        //   4 schemes contain palettes with 2 to 8 colors
        //   2 schemes contain palettes with 2 to 9 colors
        //   2 schemes contain palettes with 2 to 12 colors
        // Consequently when we display Qualitative schemes sometime we show all 8 schemes (if we need up to 8 colors), sometimes
        // we show 4 schemes (if we need up to 9 colors), and sometimes we only show 2 schemes (if we need up to 12 colors).
        // So when a selection is made we only have the RELATIVE scheme index (eg. "the 3rd qualitative scheme with 9 colors").
        // This method provides a way to convert the relative scheme index into an ABSOLUTE scheme index.
        public static getQualitativeColorSchemeIndex(relativeSchemeIndex: number, numColors: number): number
        {
            var colorSchemeNames = colorPalettesClass.getColorSchemeNames("qualitative");
            var countOfSchemesWithRequiredNumberOfColors = 0;

            for (var i = 0; i < colorSchemeNames.length; i++)
            {
                var colorSchemeName = colorSchemeNames[i];
                var colorScheme = colorPalettesClass.getColorSchemeByName(colorSchemeName);

                if (colorScheme[numColors] || (numColors == 1))
                {
                    if (countOfSchemesWithRequiredNumberOfColors == relativeSchemeIndex)
                    {
                        return (i);
                    }
                    countOfSchemesWithRequiredNumberOfColors++;
                }
            }
            throw "Unable to find the absolute scheme index for relative index " + relativeSchemeIndex + " in 'Qualitative' schemes containing " + numColors + " colors";
            return (0);
        }


        // Makes an array of SandDance palettes using ALL the schemes of type "qualitative", but including only those schemes that contain a palette with numQualitativeColors.
        // Note: A SandDance palette is an array of [r,g,b] color arrays.
        public static getQualitativePalettes(numQualitativeColors: number, invertPalettes: boolean): any[]
        {
            return (colorPalettesClass.getPalettesFromColorSchemeType("qualitative", numQualitativeColors, invertPalettes));
        }

        public static getPaletteFromSteps(paletteName: string, scheme: any, stepsRequested: number)
        {
            var palette = [];

            if (stepsRequested == 1)
            {
                // Palette[0] has 2 colors, so if only one color is desired then we create a single-color SandDance palette using the first color of Palette[0]
                var schemeIndex = (scheme.length > 1) ? 1 : 0;

                palette.push(scheme[schemeIndex][0]); 
            }
            else if (stepsRequested == 2 && scheme.length > 1)
            {
                // Palette[1] has 3 colors; use first and last.  Don't use Palette[0] - it was built incorrectly.
                var schemeIndex = (scheme.length > 1) ? 1 : 0;

                palette.push(scheme[schemeIndex][0]);
                palette.push(scheme[schemeIndex][2]);
            }
            else
            {
                var maxColorsInPaletteArray = scheme.length + 1;
                var stepCount = Math.min(maxColorsInPaletteArray, stepsRequested);

                palette = scheme[stepCount - 2];    // Palette[0] has 2 colors   
            }

            (<any>palette).name = paletteName;
            return palette;
        }

        // Makes an array of SandDance palettes using ALL the schemes of the specified type, but including only those schemes that contain a palette with numDesiredColors.
        // Note: A SandDance palette is an array of [r,g,b] color arrays.
        public static getPalettesFromColorSchemeType(colorSchemeType: string, numDesiredColors: number, invertPalettes: boolean): any[]
        {
            var colorSchemeNames = colorPalettesClass.getColorSchemeNames(colorSchemeType);
            var palettes: any[] = [];

            if (numDesiredColors < 1)
            {
                throw "The specified number of desired colors must be at least 1";
                numDesiredColors = 1;
            }

            for (var i = 0; i < colorSchemeNames.length; i++)
            {
                var name = colorSchemeNames[i];

                var candidatePaletteArray = colorPalettesClass.getPalettesFromColorScheme(colorSchemeType, i, invertPalettes);
                var maxColorsInPaletteArray = candidatePaletteArray.length + 1;

                var palette = this.getPaletteFromSteps(name, candidatePaletteArray, numDesiredColors);
                palettes.push(palette);
            }

            return (palettes);
        }


        // Makes an array of SandDance palettes using ALL the palettes in the color scheme of the specified type/index.
        // Note: A SandDance palette is an array of [r,g,b] color arrays.
        public static getPalettesFromColorScheme(colorSchemeType: string, colorSchemeIndex: number, invertPalettes: boolean): any[]
        {
            var colorSchemeNames = colorPalettesClass.getColorSchemeNames(colorSchemeType);

            // If colorSchemeIndex is greater than the number of schemes [of the specified type] then we default to scheme 0
            if ((colorSchemeIndex < 0) || (colorSchemeIndex >= colorSchemeNames.length))
            {
                colorSchemeIndex = 0;
            }

            var colorSchemeName = colorSchemeNames[colorSchemeIndex];
            var paletteArray = colorPalettesClass.getPalettesFromColorSchemeName(colorSchemeName, invertPalettes);

            return (paletteArray);
        }


        // Makes an array of SandDance palettes using ALL the palettes in the named color scheme.
        // Note: A SandDance palette is an array of [r,g,b] color arrays.
        public static getPalettesFromColorSchemeName(colorSchemeName: string, invertPalettes: boolean): any[]
        {
            var palettes: any[] = [];
            var colorScheme = colorPalettesClass.getColorSchemeByName(colorSchemeName);
            var colorSchemePaletteNames = vp.utils.keys(colorScheme);

            /// palettes in this class are defined from LIGHT to DARK but clients expect them as DARK to LIGHT, so we 
            /// reverse the requested orders.  
            var actualInvert = (!invertPalettes);

            for (var colorSchemePaletteNameIndex = 0; colorSchemePaletteNameIndex < colorSchemePaletteNames.length; colorSchemePaletteNameIndex++)
            {
                var colorSchemePaletteName = colorSchemePaletteNames[colorSchemePaletteNameIndex]; // Eg. "3"
                var colorSchemePalette: string[] = colorScheme[colorSchemePaletteName]; // An array of strings of the form "rgb(rrr,ggg,bbb)"
                var palette: any[] = []; // An array of rgb arrays


                // Convert each color in the color-scheme palette from "rgb(r,g,b)" to [r,g,b], then add that color array to our palette
                for (var i = 0; i < colorSchemePalette.length; i++)
                {
                    try
                    {
                        //---- we no longer need rgb arrays on the client ----
                        //var rgbArray: number[] = colorPalettesClass.getRgbColorArrayFromRgbColorString(colorSchemePalette[i]);

                        var rgbString = colorSchemePalette[i];

                        if (actualInvert)
                        {
                            var rIndex = (colorSchemePalette.length - 1) - i;
                            palette[rIndex] = rgbString;
                        }
                        else
                        {
                            palette.push(rgbString)
                        }
                    }
                    catch (err)
                    {
                        throw err + " in color scheme '" + colorSchemeName + "',  palette '" + colorSchemePaletteName + "'.";
                    }
                }

                palettes.push(palette);
            }

            return (palettes);
        }


        private static getRgbColorArrayFromRgbColorString(rgbColorString: string): number[]
        {
            var colorsArray = rgbColorString.replace("rgb(", "").replace(")", "").split(','); // rgbColorStrings is an array of string of the form "rgb(rrr, ggg, bbb)"
            var rgbArray: number[] = [];

            if (colorsArray.length == 3)
            {
                rgbArray.push(parseInt(colorsArray[0]));
                rgbArray.push(parseInt(colorsArray[1]));
                rgbArray.push(parseInt(colorsArray[2]));
            }
            else
            {
                throw "Malformed rgb() value '" + rgbColorString + "'";
            }

            return (rgbArray);
        }


        // This is the "heart" of colorbrewer_schemes.js 
        public static colorBrewerSchemes =
        {
            // Note: These 3 members were not part of the original colorbrewer_schemes.js 
            divergingColorSchemes: [ 'Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG', 'RdGy', 'PuOr'],
            //qualitativeColorSchemesOld: ['Khronos', 'Accent', 'Dark2', 'Pastel2', 'Set2', 'Pastel1', 'Set1', 'Paired', 'Set3'], // MUST be ordered by number of palettes
            qualitativeColorSchemes: ['Set3', 'Paired', 'Set1', 'Pastel1', 'Set2', 'Pastel2', 'Dark2', 'Accent', 'Khronos'], // MUST be ordered by number of palettes
            sequentialColorSchemes: ["Blues", "Greens", "Greys", "Oranges", "Purples", "Reds", "BuGn", "BuPu", "GnBu", "OrRd", "PuBu", "PuBuGn",
                "PuRd", "RdPu", "YlGn", "YlGnBu", "YlOrBu", "YlOrRd"],
            customColorSchemes: ["SpectralEx", "RedGreen", "RedBlue"],

            // Diverging color schemes [all palettes have 2..11 colors]
            Spectral: { 2: ['rgb(252,141,89)', 'rgb(153,213,148)'], 3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(153,213,148)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 6: ['rgb(213,62,79)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(50,136,189)'], 7: ['rgb(213,62,79)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(50,136,189)'], 8: ['rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)'], 9: ['rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)'], 10: ['rgb(158,1,66)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(94,79,162)'], 11: ['rgb(158,1,66)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(94,79,162)'] },
            RdYlGn: { 2: ['rgb(252,141,89)', 'rgb(145,207,96)'], 3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(145,207,96)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(166,217,106)', 'rgb(26,150,65)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(166,217,106)', 'rgb(26,150,65)'], 6: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(145,207,96)', 'rgb(26,152,80)'], 7: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(145,207,96)', 'rgb(26,152,80)'], 8: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'], 9: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'], 10: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)', 'rgb(0,104,55)'], 11: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)', 'rgb(0,104,55)'] },
            RdBu: { 2: ['rgb(239,138,98)', 'rgb(103,169,207)'], 3: ['rgb(239,138,98)', 'rgb(247,247,247)', 'rgb(103,169,207)'], 4: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(146,197,222)', 'rgb(5,113,176)'], 5: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(247,247,247)', 'rgb(146,197,222)', 'rgb(5,113,176)'], 6: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(103,169,207)', 'rgb(33,102,172)'], 7: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(103,169,207)', 'rgb(33,102,172)'], 8: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)'], 9: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)'], 10: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)', 'rgb(5,48,97)'], 11: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)', 'rgb(5,48,97)'] },
            PiYG: { 2: ['rgb(233,163,201)', 'rgb(161,215,106)'], 3: ['rgb(233,163,201)', 'rgb(247,247,247)', 'rgb(161,215,106)'], 4: ['rgb(208,28,139)', 'rgb(241,182,218)', 'rgb(184,225,134)', 'rgb(77,172,38)'], 5: ['rgb(208,28,139)', 'rgb(241,182,218)', 'rgb(247,247,247)', 'rgb(184,225,134)', 'rgb(77,172,38)'], 6: ['rgb(197,27,125)', 'rgb(233,163,201)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(161,215,106)', 'rgb(77,146,33)'], 7: ['rgb(197,27,125)', 'rgb(233,163,201)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(161,215,106)', 'rgb(77,146,33)'], 8: ['rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)'], 9: ['rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)'], 10: ['rgb(142,1,82)', 'rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)', 'rgb(39,100,25)'], 11: ['rgb(142,1,82)', 'rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)', 'rgb(39,100,25)'] },
            PRGn: { 2: ['rgb(175,141,195)', 'rgb(127,191,123)'], 3: ['rgb(175,141,195)', 'rgb(247,247,247)', 'rgb(127,191,123)'], 4: ['rgb(123,50,148)', 'rgb(194,165,207)', 'rgb(166,219,160)', 'rgb(0,136,55)'], 5: ['rgb(123,50,148)', 'rgb(194,165,207)', 'rgb(247,247,247)', 'rgb(166,219,160)', 'rgb(0,136,55)'], 6: ['rgb(118,42,131)', 'rgb(175,141,195)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(127,191,123)', 'rgb(27,120,55)'], 7: ['rgb(118,42,131)', 'rgb(175,141,195)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(127,191,123)', 'rgb(27,120,55)'], 8: ['rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)'], 9: ['rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)'], 10: ['rgb(64,0,75)', 'rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)', 'rgb(0,68,27)'], 11: ['rgb(64,0,75)', 'rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)', 'rgb(0,68,27)'] },
            RdYlBu: { 2: ['rgb(252,141,89)', 'rgb(145,191,219)'], 3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(145,191,219)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(171,217,233)', 'rgb(44,123,182)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(171,217,233)', 'rgb(44,123,182)'], 6: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(145,191,219)', 'rgb(69,117,180)'], 7: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(145,191,219)', 'rgb(69,117,180)'], 8: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)'], 9: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)'], 10: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)', 'rgb(49,54,149)'], 11: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)', 'rgb(49,54,149)'] },
            BrBG: { 2: ['rgb(216,179,101)', 'rgb(90,180,172)'], 3: ['rgb(216,179,101)', 'rgb(245,245,245)', 'rgb(90,180,172)'], 4: ['rgb(166,97,26)', 'rgb(223,194,125)', 'rgb(128,205,193)', 'rgb(1,133,113)'], 5: ['rgb(166,97,26)', 'rgb(223,194,125)', 'rgb(245,245,245)', 'rgb(128,205,193)', 'rgb(1,133,113)'], 6: ['rgb(140,81,10)', 'rgb(216,179,101)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(90,180,172)', 'rgb(1,102,94)'], 7: ['rgb(140,81,10)', 'rgb(216,179,101)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(90,180,172)', 'rgb(1,102,94)'], 8: ['rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)'], 9: ['rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)'], 10: ['rgb(84,48,5)', 'rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)', 'rgb(0,60,48)'], 11: ['rgb(84,48,5)', 'rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)', 'rgb(0,60,48)'] },
            RdGy: { 2: ['rgb(239,138,98)', 'rgb(153,153,153)'], 3: ['rgb(239,138,98)', 'rgb(255,255,255)', 'rgb(153,153,153)'], 4: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(186,186,186)', 'rgb(64,64,64)'], 5: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(255,255,255)', 'rgb(186,186,186)', 'rgb(64,64,64)'], 6: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(153,153,153)', 'rgb(77,77,77)'], 7: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(153,153,153)', 'rgb(77,77,77)'], 8: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)'], 9: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)'], 10: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)', 'rgb(26,26,26)'], 11: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)', 'rgb(26,26,26)'] },
            PuOr: { 2: ['rgb(241,163,64)', 'rgb(153,142,195)'], 3: ['rgb(241,163,64)', 'rgb(247,247,247)', 'rgb(153,142,195)'], 4: ['rgb(230,97,1)', 'rgb(253,184,99)', 'rgb(178,171,210)', 'rgb(94,60,153)'], 5: ['rgb(230,97,1)', 'rgb(253,184,99)', 'rgb(247,247,247)', 'rgb(178,171,210)', 'rgb(94,60,153)'], 6: ['rgb(179,88,6)', 'rgb(241,163,64)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(153,142,195)', 'rgb(84,39,136)'], 7: ['rgb(179,88,6)', 'rgb(241,163,64)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(153,142,195)', 'rgb(84,39,136)'], 8: ['rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)'], 9: ['rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)'], 10: ['rgb(127,59,8)', 'rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)', 'rgb(45,0,75)'], 11: ['rgb(127,59,8)', 'rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)', 'rgb(45,0,75)'] },

            // custom schemes
            SpectralEx: { 2: ['rgb(215,25,28)', 'rgb(43,131,186)'], 3: ['rgb(215,25,28)', 'rgb(255,255,191)', 'rgb(43,131,186)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 6: ['rgb(215,25,28)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(43,131,186)'], 7: ['rgb(215,25,28)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(43,131,186)'], 8: ['rgb(215,25,28)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(43,131,186)'], 9: ['rgb(215,25,28)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(43,131,186)'], 10: ['rgb(215,25,28)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(43,131,186)'], 11: ['rgb(215,25,28)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(43,131,186)'] },
            RedGreen: { 2: ["rgb(255, 0, 0)", "rgb(127, 255, 127)"] },
            RedBlue: { 2: ["rgb(255, 0, 0)", "rgb(0, 0, 255)"] },

            // Qualitative color schemes
            // [Palettes with 2..6 colors]
            Khronos: { 2: ['rgb(157,190,127)', 'rgb(255,255,255)'], 3: ['rgb(157,190,127)', 'rgb(232,109,113)', 'rgb(255,255,255)'], 4: ['rgb(157,190,127)', 'rgb(232,109,113)', 'rgb(194,195,178)', 'rgb(255,255,255)'], 5: ['rgb(157,190,127)', 'rgb(232,109,113)', 'rgb(252,238,78)', 'rgb(238,160,41)', 'rgb(255,255,255)'], 6: ['rgb(157,190,127)', 'rgb(232,109,113)', 'rgb(252,238,78)', 'rgb(238,160,41)', 'rgb(194,195,178)', 'rgb(255,255,255)'] },
            // [Palettes with 2..8 colors]
            Accent: { 2: ['rgb(127,201,127)', 'rgb(190,174,212)'], 3: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)'], 4: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)'], 5: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)'], 6: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)'], 7: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)', 'rgb(191,91,23)'], 8: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)', 'rgb(191,91,23)', 'rgb(102,102,102)'] },
            Dark2: { 2: ['rgb(27,158,119)', 'rgb(217,95,2)'], 3: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)'], 4: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)'], 5: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)'], 6: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)'], 7: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)', 'rgb(166,118,29)'], 8: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)', 'rgb(166,118,29)', 'rgb(102,102,102)'] },
            Pastel2: { 2: ['rgb(179,226,205)', 'rgb(253,205,172)'], 3: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)'], 4: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)'], 5: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)'], 6: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)'], 7: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)', 'rgb(241,226,204)'], 8: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)', 'rgb(241,226,204)', 'rgb(204,204,204)'] },
            Set2: { 2: ['rgb(102,194,165)', 'rgb(252,141,98)'], 3: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)'], 4: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)'], 5: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)'], 6: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)'], 7: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)'], 8: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)', 'rgb(179,179,179)'] },
            // [Palettes with 2..9 colors]
            Pastel1: { 2: ['rgb(251,180,174)', 'rgb(179,205,227)'], 3: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)'], 4: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)'], 5: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)'], 6: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)'], 7: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)'], 8: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)', 'rgb(253,218,236)'], 9: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)', 'rgb(253,218,236)', 'rgb(242,242,242)'] },
            Set1: { 2: ['rgb(228,26,28)', 'rgb(55,126,184)'], 3: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)'], 4: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)'], 5: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)'], 6: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)'], 7: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)'], 8: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)', 'rgb(247,129,191)'], 9: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)', 'rgb(247,129,191)', 'rgb(153,153,153)'] },
            // [Palettes with 2..12 colors]
            Paired: { 2: ['rgb(166,206,227)', 'rgb(31,120,180)'], 3: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)'], 4: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)'], 5: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)'], 6: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)'], 7: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)'], 8: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)'], 9: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)'], 10: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)'], 11: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)', 'rgb(255,255,153)'], 12: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)', 'rgb(255,255,153)', 'rgb(177,89,40)'] },
            Set3: { 2: ['rgb(141,211,199)', 'rgb(255,255,179)'], 3: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)'], 4: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)'], 5: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)'], 6: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)'], 7: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)'], 8: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)'], 9: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)'], 10: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)'], 11: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)'], 12: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)', 'rgb(255,237,111)'] },

            // Sequential color schemes [all palettes have 2..9 colors]
            Blues: { 2: ['rgb(222,235,247)', 'rgb(158,202,225)'], 3: ['rgb(222,235,247)', 'rgb(158,202,225)', 'rgb(49,130,189)'], 4: ['rgb(239,243,255)', 'rgb(189,215,231)', 'rgb(107,174,214)', 'rgb(33,113,181)'], 5: ['rgb(239,243,255)', 'rgb(189,215,231)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'], 6: ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'], 7: ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,69,148)'], 8: ['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,69,148)'], 9: ['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)'] },
            Greens: { 2: ['rgb(229,245,224)', 'rgb(161,217,155)'], 3: ['rgb(229,245,224)', 'rgb(161,217,155)', 'rgb(49,163,84)'], 4: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(35,139,69)'], 5: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(49,163,84)', 'rgb(0,109,44)'], 6: ['rgb(237,248,233)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(49,163,84)', 'rgb(0,109,44)'], 7: ['rgb(237,248,233)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,90,50)'], 8: ['rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,90,50)'], 9: ['rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'] },
            Greys: { 2: ['rgb(240,240,240)', 'rgb(189,189,189)'], 3: ['rgb(240,240,240)', 'rgb(189,189,189)', 'rgb(99,99,99)'], 4: ['rgb(247,247,247)', 'rgb(204,204,204)', 'rgb(150,150,150)', 'rgb(82,82,82)'], 5: ['rgb(247,247,247)', 'rgb(204,204,204)', 'rgb(150,150,150)', 'rgb(99,99,99)', 'rgb(37,37,37)'], 6: ['rgb(247,247,247)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(99,99,99)', 'rgb(37,37,37)'], 7: ['rgb(247,247,247)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(115,115,115)', 'rgb(82,82,82)', 'rgb(37,37,37)'], 8: ['rgb(255,255,255)', 'rgb(240,240,240)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(115,115,115)', 'rgb(82,82,82)', 'rgb(37,37,37)'], 9: ['rgb(255,255,255)', 'rgb(227,227,227)', 'rgb(200,200,200)', 'rgb(145,145,145)', 'rgb(127,127,127)', 'rgb(117,117,117)', 'rgb(89,89,89)', 'rgb(62,62,62)', 'rgb(34,34,34)'] },
            Oranges: { 2: ['rgb(254,230,206)', 'rgb(253,174,107)'], 3: ['rgb(254,230,206)', 'rgb(253,174,107)', 'rgb(230,85,13)'], 4: ['rgb(254,237,222)', 'rgb(253,190,133)', 'rgb(253,141,60)', 'rgb(217,71,1)'], 5: ['rgb(254,237,222)', 'rgb(253,190,133)', 'rgb(253,141,60)', 'rgb(230,85,13)', 'rgb(166,54,3)'], 6: ['rgb(254,237,222)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(230,85,13)', 'rgb(166,54,3)'], 7: ['rgb(254,237,222)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(140,45,4)'], 8: ['rgb(255,245,235)', 'rgb(254,230,206)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(140,45,4)'], 9: ['rgb(255,245,235)', 'rgb(254,230,206)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(166,54,3)', 'rgb(127,39,4)'] },
            Purples: { 2: ['rgb(239,237,245)', 'rgb(188,189,220)'], 3: ['rgb(239,237,245)', 'rgb(188,189,220)', 'rgb(117,107,177)'], 4: ['rgb(242,240,247)', 'rgb(203,201,226)', 'rgb(158,154,200)', 'rgb(106,81,163)'], 5: ['rgb(242,240,247)', 'rgb(203,201,226)', 'rgb(158,154,200)', 'rgb(117,107,177)', 'rgb(84,39,143)'], 6: ['rgb(242,240,247)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(117,107,177)', 'rgb(84,39,143)'], 7: ['rgb(242,240,247)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(74,20,134)'], 8: ['rgb(252,251,253)', 'rgb(239,237,245)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(74,20,134)'], 9: ['rgb(252,251,253)', 'rgb(239,237,245)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(84,39,143)', 'rgb(63,0,125)'] },
            Reds: { 2: ['rgb(254,224,210)', 'rgb(252,146,114)'], 3: ['rgb(254,224,210)', 'rgb(252,146,114)', 'rgb(222,45,38)'], 4: ['rgb(254,229,217)', 'rgb(252,174,145)', 'rgb(251,106,74)', 'rgb(203,24,29)'], 5: ['rgb(254,229,217)', 'rgb(252,174,145)', 'rgb(251,106,74)', 'rgb(222,45,38)', 'rgb(165,15,21)'], 6: ['rgb(254,229,217)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(222,45,38)', 'rgb(165,15,21)'], 7: ['rgb(254,229,217)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(153,0,13)'], 8: ['rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(153,0,13)'], 9: ['rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'] },

            BuGn: { 2: ['rgb(229,245,249)', 'rgb(153,216,201)'], 3: ['rgb(229,245,249)', 'rgb(153,216,201)', 'rgb(44,162,95)'], 4: ['rgb(237,248,251)', 'rgb(178,226,226)', 'rgb(102,194,164)', 'rgb(35,139,69)'], 5: ['rgb(237,248,251)', 'rgb(178,226,226)', 'rgb(102,194,164)', 'rgb(44,162,95)', 'rgb(0,109,44)'], 6: ['rgb(237,248,251)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(44,162,95)', 'rgb(0,109,44)'], 7: ['rgb(237,248,251)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,88,36)'], 8: ['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,88,36)'], 9: ['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'] },
            BuPu: { 2: ['rgb(224,236,244)', 'rgb(136,86,167)'], 3: ['rgb(224,236,244)', 'rgb(158,188,218)', 'rgb(136,86,167)'], 4: ['rgb(237,248,251)', 'rgb(179,205,227)', 'rgb(140,150,198)', 'rgb(136,65,157)'], 5: ['rgb(237,248,251)', 'rgb(179,205,227)', 'rgb(140,150,198)', 'rgb(136,86,167)', 'rgb(129,15,124)'], 6: ['rgb(237,248,251)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(136,86,167)', 'rgb(129,15,124)'], 7: ['rgb(237,248,251)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(110,1,107)'], 8: ['rgb(247,252,253)', 'rgb(224,236,244)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(110,1,107)'], 9: ['rgb(247,252,253)', 'rgb(224,236,244)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(129,15,124)', 'rgb(77,0,75)'] },
            GnBu: { 2: ['rgb(224,243,219)', 'rgb(168,221,181)'], 3: ['rgb(224,243,219)', 'rgb(168,221,181)', 'rgb(67,162,202)'], 4: ['rgb(240,249,232)', 'rgb(186,228,188)', 'rgb(123,204,196)', 'rgb(43,140,190)'], 5: ['rgb(240,249,232)', 'rgb(186,228,188)', 'rgb(123,204,196)', 'rgb(67,162,202)', 'rgb(8,104,172)'], 6: ['rgb(240,249,232)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(67,162,202)', 'rgb(8,104,172)'], 7: ['rgb(240,249,232)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,88,158)'], 8: ['rgb(247,252,240)', 'rgb(224,243,219)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,88,158)'], 9: ['rgb(247,252,240)', 'rgb(224,243,219)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,104,172)', 'rgb(8,64,129)'] },
            OrRd: { 2: ['rgb(254,232,200)', 'rgb(253,187,132)'], 3: ['rgb(254,232,200)', 'rgb(253,187,132)', 'rgb(227,74,51)'], 4: ['rgb(254,240,217)', 'rgb(253,204,138)', 'rgb(252,141,89)', 'rgb(215,48,31)'], 5: ['rgb(254,240,217)', 'rgb(253,204,138)', 'rgb(252,141,89)', 'rgb(227,74,51)', 'rgb(179,0,0)'], 6: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(227,74,51)', 'rgb(179,0,0)'], 7: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 8: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 9: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(179,0,0)', 'rgb(127,0,0)'] },
            PuBu: { 2: ['rgb(236,231,242)', 'rgb(166,189,219)'], 3: ['rgb(236,231,242)', 'rgb(166,189,219)', 'rgb(43,140,190)'], 4: ['rgb(241,238,246)', 'rgb(189,201,225)', 'rgb(116,169,207)', 'rgb(5,112,176)'], 5: ['rgb(241,238,246)', 'rgb(189,201,225)', 'rgb(116,169,207)', 'rgb(43,140,190)', 'rgb(4,90,141)'], 6: ['rgb(241,238,246)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(43,140,190)', 'rgb(4,90,141)'], 7: ['rgb(241,238,246)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(3,78,123)'], 8: ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(3,78,123)'], 9: ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(4,90,141)', 'rgb(2,56,88)'] },
            PuBuGn: { 2: ['rgb(236,226,240)', 'rgb(166,189,219)'], 3: ['rgb(236,226,240)', 'rgb(166,189,219)', 'rgb(28,144,153)'], 4: ['rgb(246,239,247)', 'rgb(189,201,225)', 'rgb(103,169,207)', 'rgb(2,129,138)'], 5: ['rgb(246,239,247)', 'rgb(189,201,225)', 'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,108,89)'], 6: ['rgb(246,239,247)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,108,89)'], 7: ['rgb(246,239,247)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,100,80)'], 8: ['rgb(255,247,251)', 'rgb(236,226,240)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,100,80)'], 9: ['rgb(255,247,251)', 'rgb(236,226,240)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,108,89)', 'rgb(1,70,54)'] },

            PuRd: { 2: ['rgb(231,225,239)', 'rgb(201,148,199)'], 3: ['rgb(231,225,239)', 'rgb(201,148,199)', 'rgb(221,28,119)'], 4: ['rgb(241,238,246)', 'rgb(215,181,216)', 'rgb(223,101,176)', 'rgb(206,18,86)'], 5: ['rgb(241,238,246)', 'rgb(215,181,216)', 'rgb(223,101,176)', 'rgb(221,28,119)', 'rgb(152,0,67)'], 6: ['rgb(241,238,246)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(221,28,119)', 'rgb(152,0,67)'], 7: ['rgb(241,238,246)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(145,0,63)'], 8: ['rgb(247,244,249)', 'rgb(231,225,239)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(145,0,63)'], 9: ['rgb(247,244,249)', 'rgb(231,225,239)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(152,0,67)', 'rgb(103,0,31)'] },
            RdPu: { 2: ['rgb(253,224,221)', 'rgb(250,159,181)'], 3: ['rgb(253,224,221)', 'rgb(250,159,181)', 'rgb(197,27,138)'], 4: ['rgb(254,235,226)', 'rgb(251,180,185)', 'rgb(247,104,161)', 'rgb(174,1,126)'], 5: ['rgb(254,235,226)', 'rgb(251,180,185)', 'rgb(247,104,161)', 'rgb(197,27,138)', 'rgb(122,1,119)'], 6: ['rgb(254,235,226)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(197,27,138)', 'rgb(122,1,119)'], 7: ['rgb(254,235,226)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)'], 8: ['rgb(255,247,243)', 'rgb(253,224,221)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)'], 9: ['rgb(255,247,243)', 'rgb(253,224,221)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)', 'rgb(73,0,106)'] },
            YlGn: { 2: ['rgb(247,252,185)', 'rgb(49,163,84)'], 3: ['rgb(247,252,185)', 'rgb(173,221,142)', 'rgb(49,163,84)'], 4: ['rgb(255,255,204)', 'rgb(194,230,153)', 'rgb(120,198,121)', 'rgb(35,132,67)'], 5: ['rgb(255,255,204)', 'rgb(194,230,153)', 'rgb(120,198,121)', 'rgb(49,163,84)', 'rgb(0,104,55)'], 6: ['rgb(255,255,204)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(49,163,84)', 'rgb(0,104,55)'], 7: ['rgb(255,255,204)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,90,50)'], 8: ['rgb(255,255,229)', 'rgb(247,252,185)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,90,50)'], 9: ['rgb(255,255,229)', 'rgb(247,252,185)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,104,55)', 'rgb(0,69,41)'] },
            YlGnBu: { 2: ['rgb(237,248,177)', 'rgb(44,127,184)'], 3: ['rgb(237,248,177)', 'rgb(127,205,187)', 'rgb(44,127,184)'], 4: ['rgb(255,255,204)', 'rgb(161,218,180)', 'rgb(65,182,196)', 'rgb(34,94,168)'], 5: ['rgb(255,255,204)', 'rgb(161,218,180)', 'rgb(65,182,196)', 'rgb(44,127,184)', 'rgb(37,52,148)'], 6: ['rgb(255,255,204)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(44,127,184)', 'rgb(37,52,148)'], 7: ['rgb(255,255,204)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(12,44,132)'], 8: ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(12,44,132)'], 9: ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(37,52,148)', 'rgb(8,29,88)'] },
            YlOrBu: { 2: ['rgb(255,247,188)', 'rgb(217,95,14)'], 3: ['rgb(255,247,188)', 'rgb(254,196,79)', 'rgb(217,95,14)'], 4: ['rgb(255,255,212)', 'rgb(254,217,142)', 'rgb(254,153,41)', 'rgb(204,76,2)'], 5: ['rgb(255,255,212)', 'rgb(254,217,142)', 'rgb(254,153,41)', 'rgb(217,95,14)', 'rgb(153,52,4)'], 6: ['rgb(255,255,212)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(217,95,14)', 'rgb(153,52,4)'], 7: ['rgb(255,255,212)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(140,45,4)'], 8: ['rgb(255,255,229)', 'rgb(255,247,188)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(140,45,4)'], 9: ['rgb(255,255,229)', 'rgb(255,247,188)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(153,52,4)', 'rgb(102,37,6)']  },
            YlOrRd: { 2: ['rgb(255,237,160)', 'rgb(240,59,32)'], 3: ['rgb(255,237,160)', 'rgb(254,178,76)', 'rgb(240,59,32)'], 4: ['rgb(255,255,178)', 'rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(227,26,28)'], 5: ['rgb(255,255,178)', 'rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(240,59,32)', 'rgb(189,0,38)'], 6: ['rgb(255,255,178)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(240,59,32)', 'rgb(189,0,38)'], 7: ['rgb(255,255,178)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(177,0,38)'], 8: ['rgb(255,255,204)', 'rgb(255,237,160)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(177,0,38)'], 9: ['rgb(255,255,204)', 'rgb(255,237,160)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(189,0,38)', 'rgb(128,0,38)'] },
        }

    }

    export enum KnownPalettes       // for UI access to palettes
    {
        //---- diverging ----
        Spectral,
        RdYlGn,
        RdBu,
        PiYG,
        PRGn,
        RdYlBu,
        BrBG,
        RdGy,
        PuOr,
        separator1,

        //---- sequential ----
        Blues,
        Greens,
        Greys,
        Oranges,
        Purples,
        Reds,
        separator2,

        BuGn,
        BuPu,
        GnBu,
        OrRd,
        PuBu,
        PuBuGn,
        separator3,

        PuRd,
        RdPu,
        YlGn,
        YlGnBu,
        YlOrBu,
        YlOrRd,
        separator4,

        //---- qualitative ----
        Accent,
        Dark2,
        Paired,
        Pastel1,
        Pastel2,
        Set1,
        Set2,
        Set3,
    }
}