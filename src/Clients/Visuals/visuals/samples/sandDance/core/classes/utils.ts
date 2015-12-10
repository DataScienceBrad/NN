//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    utils.ts - simple utils for this prototype.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module utils
{
    export var colorFromName: any = {};

    colorFromName.aliceblue = [240, 248, 255];
    colorFromName.antiquewhite = [250, 235, 215];
    colorFromName.aqua = [0, 255, 255];
    colorFromName.aquamarine = [127, 255, 212];
    colorFromName.azure = [240, 255, 255];
    colorFromName.beige = [245, 245, 220];
    colorFromName.bisque = [255, 228, 196];
    colorFromName.black = [0, 0, 0];
    colorFromName.blanchedalmond = [255, 235, 205];
    colorFromName.blue = [0, 0, 255];
    colorFromName.blueviolet = [138, 43, 226];
    colorFromName.brown = [165, 42, 42];
    colorFromName.burlywood = [222, 184, 135];
    colorFromName.cadetblue = [95, 158, 160];
    colorFromName.chartreuse = [127, 255, 0];
    colorFromName.chocolate = [210, 105, 30];
    colorFromName.coral = [255, 127, 80];
    colorFromName.cornflowerblue = [100, 149, 237];
    colorFromName.cornsilk = [255, 248, 220];
    colorFromName.crimson = [220, 20, 60];
    colorFromName.cyan = [0, 255, 255];
    colorFromName.darkblue = [0, 0, 139];
    colorFromName.darkcyan = [0, 139, 139];
    colorFromName.darkgoldenrod = [184, 134, 11];
    colorFromName.darkgray = [169, 169, 169];
    colorFromName.darkgreen = [0, 100, 0];
    colorFromName.darkkhaki = [189, 183, 107];
    colorFromName.darkmagenta = [139, 0, 139];
    colorFromName.darkolivegreen = [85, 107, 47];
    colorFromName.darkorange = [255, 140, 0];
    colorFromName.darkorchid = [153, 50, 204];
    colorFromName.darkred = [139, 0, 0];
    colorFromName.darksalmon = [233, 150, 122];
    colorFromName.darkseagreen = [143, 188, 143];
    colorFromName.darkslateblue = [72, 61, 139];
    colorFromName.darkslategray = [47, 79, 79];
    colorFromName.darkturquoise = [0, 206, 209];
    colorFromName.darkviolet = [148, 0, 211];
    colorFromName.deeppink = [255, 20, 147];
    colorFromName.deepskyblue = [0, 191, 255];
    colorFromName.dimgray = [105, 105, 105];
    colorFromName.dodgerblue = [30, 144, 255];
    colorFromName.firebrick = [178, 34, 34];
    colorFromName.floralwhite = [255, 250, 240];
    colorFromName.forestgreen = [34, 139, 34];
    colorFromName.fuchsia = [255, 0, 255];
    colorFromName.gainsboro = [220, 220, 220];
    colorFromName.ghostwhite = [248, 248, 255];
    colorFromName.gold = [255, 215, 0];
    colorFromName.goldenrod = [218, 165, 32];
    colorFromName.gray = [128, 128, 128];
    colorFromName.green = [0, 128, 0];
    colorFromName.greenyellow = [173, 255, 47];
    colorFromName.honeydew = [240, 255, 240];
    colorFromName.hotpink = [255, 105, 180];
    colorFromName.indianred = [205, 92, 92];
    colorFromName.indigo = [75, 0, 130];
    colorFromName.ivory = [255, 255, 240];
    colorFromName.khaki = [240, 230, 140];
    colorFromName.lavender = [230, 230, 250];
    colorFromName.lavenderblush = [255, 240, 245];
    colorFromName.lawngreen = [124, 252, 0];
    colorFromName.lemonchiffon = [255, 250, 205];
    colorFromName.lightblue = [173, 216, 230];
    colorFromName.lightcoral = [240, 128, 128];
    colorFromName.lightcyan = [224, 255, 255];
    colorFromName.lightgoldenrodyellow = [250, 250, 210];
    colorFromName.lightgray = [211, 211, 211];
    colorFromName.lightgreen = [144, 238, 144];
    colorFromName.lightpink = [255, 182, 193];
    colorFromName.lightsalmon = [255, 160, 122];
    colorFromName.lightseagreen = [32, 178, 170];
    colorFromName.lightskyblue = [135, 206, 250];
    colorFromName.lightslategray = [119, 136, 153];
    colorFromName.lightsteelblue = [176, 196, 222];
    colorFromName.lightyellow = [255, 255, 224];
    colorFromName.lime = [0, 255, 0];
    colorFromName.limegreen = [50, 205, 50];
    colorFromName.linen = [250, 240, 230];
    colorFromName.magenta = [255, 0, 255];
    colorFromName.maroon = [128, 0, 0];
    colorFromName.mediumaquamarine = [102, 205, 170];
    colorFromName.mediumblue = [0, 0, 205];
    colorFromName.mediumorchid = [186, 85, 211];
    colorFromName.mediumpurple = [147, 112, 219];
    colorFromName.mediumseagreen = [60, 179, 113];
    colorFromName.mediumslateblue = [123, 104, 238];
    colorFromName.mediumspringgreen = [0, 250, 154];
    colorFromName.mediumturquoise = [72, 209, 204];
    colorFromName.mediumvioletred = [199, 21, 133];
    colorFromName.midnightblue = [25, 25, 112];
    colorFromName.mintcream = [245, 255, 250];
    colorFromName.mistyrose = [255, 228, 225];
    colorFromName.moccasin = [255, 228, 181];
    colorFromName.navajowhite = [255, 222, 173];
    colorFromName.navy = [0, 0, 128];
    colorFromName.oldlace = [253, 245, 230];
    colorFromName.olive = [128, 128, 0];
    colorFromName.olivedrab = [107, 142, 35];
    colorFromName.orange = [255, 165, 0];
    colorFromName.orangered = [255, 69, 0];
    colorFromName.orchid = [218, 112, 214];
    colorFromName.palegoldenrod = [238, 232, 170];
    colorFromName.palegreen = [152, 251, 152];
    colorFromName.paleturquoise = [175, 238, 238];
    colorFromName.palevioletred = [219, 112, 147];
    colorFromName.papayawhip = [255, 239, 213];
    colorFromName.peachpuff = [255, 218, 185];
    colorFromName.peru = [205, 133, 63];
    colorFromName.pink = [255, 192, 203];
    colorFromName.plum = [221, 160, 221];
    colorFromName.powderblue = [176, 224, 230];
    colorFromName.purple = [128, 0, 128];
    colorFromName.red = [255, 0, 0];
    colorFromName.rosybrown = [188, 143, 143];
    colorFromName.royalblue = [65, 105, 225];
    colorFromName.saddlebrown = [139, 69, 19];
    colorFromName.salmon = [250, 128, 114];
    colorFromName.sandybrown = [244, 164, 96];
    colorFromName.seagreen = [46, 139, 87];
    colorFromName.seashell = [255, 245, 238];
    colorFromName.sienna = [160, 82, 45];
    colorFromName.silver = [192, 192, 192];
    colorFromName.skyblue = [135, 206, 235];
    colorFromName.slateblue = [106, 90, 205];
    colorFromName.slategray = [112, 128, 144];
    colorFromName.snow = [255, 250, 250];
    colorFromName.springgreen = [0, 255, 127];
    colorFromName.steelblue = [70, 130, 180];
    colorFromName.tan = [210, 180, 140];
    colorFromName.teal = [0, 128, 128];
    colorFromName.thistle = [216, 191, 216];
    colorFromName.tomato = [255, 99, 71];
    colorFromName.transparent = [255, 255, 255];
    colorFromName.turquoise = [64, 224, 208];
    colorFromName.violet = [238, 130, 238];
    colorFromName.wheat = [245, 222, 179];
    colorFromName.white = [255, 255, 255];
    colorFromName.whitesmoke = [245, 245, 245];
    colorFromName.yellow = [255, 255, 0];
    colorFromName.yellowgreen = [154, 205, 50];

    /** rebuild the 4 special properties for "toNV", based on info from the larger "fromNV" that toNV was built from. */
    export function rebuildStringKeyIndexes(toNV: beachParty.NumericVector, indexes: number[], fromNV: beachParty.NumericVector)
    {
        var indexesByKey: { [key: string]: number } = {};
        var keysByIndex: { [keyIndex: number]: string } = {};
        var rowsByKey: { [key: string]: number[] } = {};
        var keysByRow = [];
        var nextKeyId = 0;
        var sortedKeys = fromNV.keyInfo.sortedKeys;
        var toVector = toNV.values;

        if (toVector && toVector.length)
        {
            //---- look like non-numbers; treat as string ----
            for (var i = 0; i < indexes.length; i++)
            {
                var fromIndex = indexes[i];

                var key = fromNV.keyInfo.keysByRow[fromIndex];
                var keyValue = toVector[i];

                indexesByKey[key] = keyValue;
                keysByIndex[keyValue] = key;

                var rows = rowsByKey[key];
                if (rows === undefined)
                {
                    rows = [];
                    rowsByKey[key] = rows;

                    var si = sortedKeys.indexOf(key);
                    if (si == -1)
                    {
                        sortedKeys.push(key);
                    }
                }

                rows.push(i);
                keysByRow[i] = key;
            }
        }

        var keyInfo = new beachParty.KeyInfo(sortedKeys.length, indexesByKey, keysByIndex, rowsByKey, keysByRow, sortedKeys);
        toNV.keyInfo = keyInfo;
    }

    export function onFileOpenError(fileName: string, ex: string)
    {
        //---- separate error msg from stack trace ----
        var fullMsg = ex;

        ex = ex.replace(/&#39;/g, "'");

        var index = ex.indexOf("\r\n");
        if (index > -1)
        {
            ex = ex.substr(0, index);
        }

        //---- remove .NET error text ----
        index = ex.indexOf("returned an error: ");
        if (index > -1)
        {
            ex = ex.substr(index + 18);
        }

        var errorMsg = "Could not open '" + fileName + "' (error: " + ex + ").";
        vp.utils.debug(errorMsg);

        //---- this will be caught by the engine's window.onerror & sent back to the client ----
        throw errorMsg;
    }


    export function getDataLength(nv: beachParty.NamedVectors, applyFilter?: boolean)
    {
        var length = (nv) ? nv.length : 0;

        if (applyFilter && nv && nv.layoutFilter)
        {
            var filter = nv.layoutFilter.values;
            length = vector.countOff(filter);
        }

        return length;
    }

    export function toBool(value: string)
    {
        var bValue = <any>value;

        if (vp.utils.isString(value))
        {
            bValue = (value.toLowerCase() == "true");
        }

        return <boolean>bValue;
    }

    export function getMinMax(dataNumVector: beachParty.NumericVector, filterNumVector: beachParty.NumericVector)
    {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;

        if (dataNumVector)
        {
            var dataVector = dataNumVector.values;
            var filterVector = (filterNumVector) ? filterNumVector.values : null;

            for (var i = 0; i < dataVector.length; i++)
            {
                var value = dataVector[i];

                if (!filterVector || !filterVector[i])
                {
                    if (value < min)
                    {
                        min = value;
                    }

                    if (value > max)
                    {
                        max = value;
                    }
                }
            }
        }
        else
        {
            min = 0;
            max = 1;
        }

        return { min: min, max: max };
    }

    export function makeRangeScale(dataVector: beachParty.NumericVector, filterVector: beachParty.NumericVector,
        rangeMin: number, rangeMax: number, constantDefault = 0, md?: bps.MappingData)
    {
        var colType = (dataVector) ? dataVector.colType : null;
        var scale: vp.scales.baseScale = null;

        if (colType == "string")
        {
            //---- create CATEGORY scale ----
            
            /// NOTE: to ensure category scaling works when a filter is active, we need to use the true string key values for
            /// the catKeys, and when scaling, we will pass the true string key value.  This is necessary because when a 
            /// filter is active, the key numbers used in NumericVectors are not consecutive, like they are when the 
            /// filter is not active.

            var catKeys = utils.getFilteredSortedKeys(dataVector, filterVector);

            scale = vp.scales.createCategoryKey()
                .categoryKeys(catKeys)
                .range(rangeMin, rangeMax)
        }
        else if (colType == "date")
        {
            var result = getMinMax(dataVector, filterVector);

            //---- create DATE scale ----
            var scale = vp.scales.createDate()
                .domainMin(result.min)
                .domainMax(result.max)
                .rangeMin(rangeMin)
                .rangeMax(rangeMax)
        }
        else      
        {
            //---- create LINEAR scale ---
            var result = getMinMax(dataVector, filterVector);

            if (!dataVector)
            {
                rangeMin = constantDefault;
                rangeMax = constantDefault;
            }

            scale = vp.scales.createLinear()
                .domainMin(result.min)
                .domainMax(result.max)
                .rangeMin(rangeMin)
                .rangeMax(rangeMax)
        }

        this.buildFormatter(md, scale, colType);

        return scale;
    }

    export function buildFormatter(md: bps.MappingData, scale: vp.scales.baseScale, colType: string)
    {
        if (md && md.formatting)
        {
            var anyScale = <any>scale;
            anyScale._formatter = vp.formatters.createExcelFormatter(md.formatting, colType);
        }
    }

    /** this is used to scale palette-based attributes (like IMAGE and SHAPE), other than color. */
    export function makePaletteScale(dataVector: beachParty.NumericVector, filterVector: beachParty.NumericVector, palette: any[], isContinuous?: boolean,
        breaks?: number[], md?: bps.MappingData)
    {
        /// Note: scale input/domain can be Continuous (number, date) or discrete (string).  scale out/range can be continuous or discrete.
        /// Scale construction needs to consider all 4 possible combinations.

        var colType = (dataVector) ? dataVector.colType : null;
        var scale: vp.scales.baseScale = null;

        if (colType == "string")        // isContinuous)
        {
            //---- create CATEGORY scale ----
            //var catKeys = dataVector.keyInfo.sortedKeys;
            var catKeys = utils.getFilteredSortedKeys(dataVector, filterVector);

            scale = vp.scales.createCategoryKey()
                .categoryKeys(catKeys)
                .palette(palette)
        }
        else      
        {
            //---- create LINEAR scale ---
            if (breaks && breaks.length)
            {
                //---- get min/max from breaks ----
                var len = breaks.length;
                var minVal = breaks[0];
                var maxVal = breaks[len - 1];
            }
            else
            {
                //---- get min/max from data ----
                var result = getMinMax(dataVector, filterVector);

                minVal = result.min;
                maxVal = result.max;
            }

            scale = vp.scales.createLinear()
                .domainMin(minVal)
                .domainMax(maxVal)
                .palette(palette)
                .isPaletteDiscrete(! isContinuous)
        }

        this.buildFormatter(md, scale, colType);

        return scale;
    }

    export function makeLinearScale(min: number, max: number, rangeMin: number, rangeMax: number)
    {
        var linearScale = vp.scales.createLinear()
            .domainMin(min)
            .domainMax(max)
            .rangeMin(rangeMin)
            .rangeMax(rangeMax)

        return linearScale;
    }


    export function getCubeDefaultSize(shapeCount: number)
    {
        var logCount = Math.log10(shapeCount);
        var size = .1 / logCount;

        if (logCount < 3)
        {
            size *= 4;
        }
        else if (logCount < 3.5)
        {
            size *= 3;
        }
        else if (logCount < 4)
        {
            size *= 2;
        }

        //size /= 100;

        return size;
    }

    export function error(msg: string)
    {
        throw "Error: " + msg;
    }

    export function cloneMap(map: any)
    {
        var newMap: any = {};
        var keys = vp.utils.keys(map);

        for (var k = 0; k < keys.length; k++)
        {
            var key = keys[k];
            var value = map[key];

            newMap[key] = value;
        }

        return newMap;
    }

    export function getFilteredSortedKeys(colDataInfo: beachParty.NumericVector, filterVector: beachParty.NumericVector)
    {
        var keys: any[] = null;

        if (colDataInfo.keyInfo && colDataInfo.keyInfo.sortedKeys)
        {
            keys = colDataInfo.keyInfo.sortedKeys.slice(0);         // duplicate array (since we will change it)
            var colData = colDataInfo.values;

            //---- must remove any key in KEYS that is completely filtered out ----
            if (filterVector)
            {
                //---- use "colData" for building assignments, but "filteredData" for bin boundaries ----
                var filteredData = [];
                var filterValues = filterVector.values;
                var inKeys = {};

                for (var i = 0; i < colData.length; i++)
                {
                    if (!filterValues[i])
                    {
                        var key = <string>colDataInfo.keyInfo.keysByRow[i];
                        inKeys[key] = true;
                    }
                }

                //---- test each key in KEYS - preserving the key order ----
                for (var k = keys.length - 1; k >= 0; k--)
                {
                    var key = <string>keys[k];

                    if (inKeys[key] === undefined)
                    {
                        keys.removeAt(k);
                    }
                }
            }

            //if (returnKeyNumbers)
            //{
            //    //---- going to be used for scaling, so replace each key with its associated key number ----
            //    for (var k = 0; k < keys.length; k++)
            //    {
            //        var key = <string>keys[k];
            //        keys[k] = colDataInfo.keyInfo.rowsByKeys[key];
            //    }
            //}
        }

        return keys;
    }

    /** store SearchParams data on the specified element so it can later be used for a search operation. */
    export function prepElementForSearch(element: any, colName: string, scale: any, binResults: any, index, lastValue: any, isCat: boolean,
        record: any, id: string)
    {
        var useCatForBins = scale._useCategoryForBins;

        if (binResults)
        {
            var bin = (binResults) ? (binResults.bins[index]) : null;

            if ((isCat || scale._useCategoryForBins) && id == "label")
            {
                utils.prepWithBinDirect(element, colName, isCat, bin, id);
            }
            else
            {
                lastValue = utils.prepWithBinLast(element, colName, lastValue, bin, isCat, id);
            }
        }
        else
        {
            var firstBucket = (bin) ? bin.isFirst : (index == 1);
            var value = record.breakValue;

            lastValue = utils.prepWithValueLast(element, colName, lastValue, value, isCat, firstBucket, id);
        }

        return lastValue;
    }

    /** store SearchParams data on the specified element so it can later be used for a search operation. This API is called once for each bin. */
    export function prepWithBinDirect(elem: any, colName: string, isCategory: boolean, bin: beachParty.BinInfo, id: string)
    {
        var sp = <SearchParamsEx>{};
        var firstBucket = bin.isFirst;
        sp.buttonType = id;

        if (!bin)
        {
            throw "bin must be supplied";
        }

        if (bin.isTagBin)
        {
            colName = "_primaryKey";
            sp.searchRawValues = true;
        }

        sp.colName = colName;
        sp.searchType = bps.TextSearchType.exactMatch;

        if (isCategory)
        {
            var value = <any> bin.name;

            //---- CATEGORY ----
            if (bin.otherKeys)
            {
                value = bin.otherKeys;
            }

            sp.minValue = value;
            sp.maxValue = null;
        }
        else
        {
            //---- NUMERIC or DATE ----
            var numBin = <beachParty.BinInfoNum>bin;

            sp.minValue = numBin.min;
            sp.maxValue = numBin.max;

            if (sp.minValue === null)
            {
                //---- first label or first half of first bucket ----
                sp.searchType = bps.TextSearchType.exactMatch;
            }
            else if (firstBucket)  
            {
                //---- first bucket INCLUDES the minValue ----
                sp.searchType = bps.TextSearchType.betweenInclusive;
            }
            else
            {
                //---- normal bucket EXCLUDES the minValue ----
                sp.searchType = bps.TextSearchType.gtrValueAndLeqValue2;
            }
        }

        //vp.utils.debug("prepWithBinDirect: id=" + id + ", colName=" + colName + 
        //    ", sp.minValue=" + sp.minValue + ", sp.maxValue=" + sp.maxValue + ", sp.searchType=" + sp.searchType);

        elem._searchParams = sp;
    }

    /** store SearchParams data on the specified element so it can later be used for a search operation. */
    export function prepWithBinLast(elem: any, colName: string, lastBin: any, currBin: beachParty.BinInfo,
        isCategory: boolean, id: string)
    {
        var sp = <SearchParamsEx> {};
        sp.colName = colName;
        sp.searchType = bps.TextSearchType.exactMatch;
        sp.buttonType = id;

        var newLastBin = currBin;

        if (lastBin)
        {
            var firstBucket = lastBin.isFirst;

            if (isCategory)
            {
                var currValue = <any> lastBin.name;

                //---- CATEGORY ----
                if (lastBin.otherKeys)
                {
                    currValue = lastBin.otherKeys;
                }

                sp.minValue = currValue;
                sp.maxValue = null;
            }
            else
            {
                //---- NUMERIC or DATE ----
                var numBin = <beachParty.BinInfoNum>lastBin;

                sp.minValue = numBin.min;
                sp.maxValue = numBin.max;

                if (firstBucket)  
                {
                    //---- first bucket INCLUDES the minValue ----
                    sp.searchType = bps.TextSearchType.betweenInclusive;
                }
                else
                {
                    //---- normal bucket EXCLUDES the minValue ----
                    sp.searchType = bps.TextSearchType.gtrValueAndLeqValue2;
                }
            }
        }

        //vp.utils.debug("prepWithBinLast: id=" + id + ", colName=" + colName + 
        //    ", sp.minValue=" + sp.minValue + ", sp.maxValue=" + sp.maxValue + ", sp.searchType=" + sp.searchType);

        elem._searchParams = sp;

        return newLastBin;
    }

    export function isImageFile(fn: string)
    {
        var isImg = false;

        if (fn)
        {
            var ext = fn.substr(-4).toLowerCase();        // last 4 chars
            isImg = (ext == ".png" || ext == ".jpg" || ext == ".bmp");
        }

        return isImg;
    }

    export function getSizeOfMap(map: any, objList?: any[], forceCheck?: boolean)
    {
        var total = 0;

        if (map)
        {
            if (forceCheck || !objList || objList.indexOf(map) == -1)
            {
                if (!forceCheck && objList != null)
                {
                    //---- add this obj so that we never count it again ----
                    objList.push(map);
                }

                var keys = vp.utils.keys(map);
                for (var i = 0; i < keys.length; i++)
                {
                    var key = keys[i];
                    total += key.length;
                    var obj = map[key];

                    total += getSizeOfValue(obj, objList);
                }

                total += 8 * keys.length;       // hashtable estimate
            }
        }

        return total;
    }

    export function getSizeOfValue(value: any, objList?: any[])
    {
        var total = 0;

        if (value)
        {
            total = 4;          // estimated space for type info
            if (vp.utils.isNumber(value))
            {
                total += 8;
            }
            else if (vp.utils.isString(value))
            {
                total += value.length;
            }
            else if (vp.utils.isDate(value))
            {
                total += 8;          // estimate
            }
            else if (value instanceof Float32Array)
            {
                total += 4 * value.length;
            }
            else if (vp.utils.isArray(value))
            {
                var aray = <any[]>value;
                for (var i = 0; i < aray.length; i++)
                {
                    total += getSizeOfValue(aray[i], objList);
                }
                total += 8 * value.length;         // ptrs to strings (estimated)
            }
            else
            {
                //---- assume it is a map ----
                total += getSizeOfMap(value, objList);
            }
        }

        return total;
    }

    /** get the approximate memory used exclusively by the specified objects (overlapping memory not counted). 
     * Space used by functions and unusual memory types not counted. 
     */
    export function getMemoryUse(memObjMap: any, memUseMap?: any)
    {
        if (!memUseMap)
        {
            memUseMap = {};
        }

        var keys = vp.utils.keys(memObjMap);
        var objList = [];

        //---- build objList ----
        for (var i = 0; i < keys.length; i++)
        {
            var key = keys[i];
            var obj = memObjMap[key];
            objList.push(obj);
        }

        //---- get size of each object ----
        for (var i = 0; i < keys.length; i++)
        {
            var key = keys[i];
            var obj = memObjMap[key];

            var total = getSizeOfMap(obj, objList, true);
            memUseMap[key] = total;
        }
        
        return memUseMap;
    }


    /** store SearchParams data on the specified element so it can later be used for a search operation. */
    export function prepWithValueLast(elem: any, colName: string, lastValue: any, currValue: any,
        isCategory: boolean, firstBucket: boolean, id: string)
    {
        var sp = <SearchParamsEx>{};
        var newLastValue = currValue;
        sp.buttonType = id;

        sp.colName = colName;
        sp.searchType = bps.TextSearchType.exactMatch;

        if (isCategory)
        {
            //---- CATEGORY ----
            sp.minValue = lastValue;
            sp.maxValue = null;
        }
        else
        {
            //---- NUMERIC or DATE ----
            sp.minValue = lastValue;
            sp.maxValue = currValue;

            if (sp.minValue != sp.maxValue)
            {
                if (lastValue === null)
                {
                    //---- first label or first half of first bucket ----
                    sp.searchType = bps.TextSearchType.exactMatch;
                }
                else
                {
                    //---- when bins are sorted, this can happen ----
                    if (sp.minValue > sp.maxValue)
                    {
                        var temp = sp.minValue;
                        sp.minValue = sp.maxValue;
                        sp.maxValue = temp;
                    }

                    if (firstBucket)  
                    {
                        //---- first bucket INCLUDES the minValue ----
                        sp.searchType = bps.TextSearchType.betweenInclusive;
                    }
                    else
                    {
                        //---- normal bucket EXCLUDES the minValue ----
                        sp.searchType = bps.TextSearchType.gtrValueAndLeqValue2;
                    }
                }
            }
        }

        //vp.utils.debug("prepWithValueLast: id=" + id + ", colName=" + colName + 
        //    ", sp.minValue=" + sp.minValue + ", sp.maxValue=" + sp.maxValue + ", sp.searchType=" + sp.searchType);

        elem._searchParams = sp;

        return newLastValue;
    }

    export class SearchParamsEx extends bps.SearchParams
    {
        buttonType: string;           // type of button being clicked
        //colName: string;
        //minValue: any;
        //maxValue: any;
        //searchType: bps.TextSearchType;
    }
}

