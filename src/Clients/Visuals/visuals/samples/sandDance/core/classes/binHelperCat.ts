///-----------------------------------------------------------------------------------------------------------------
/// binHelperCat.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - divide the data into bins based on the specified categorical column.
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class BinHelperCat
    {
        public static createCatBins(nv: NamedVectors, colName: string, maxCategoryBins: number,
            addIndexes: boolean, buildAssignments: boolean, binSortOptions?: BinSortOptionsClass, md?: bps.MappingData): BinResult
        {
            var bins = [];
            var assignments = [];

            var colDataInfo = <NumericVector> nv[colName];
            var filter = (nv.layoutFilter) ? nv.layoutFilter.values : null;
            var isUsingTags = (md && md.tagDelimiter !== undefined && md.tagDelimiter !== bps.TagDelimiter.none);
            var keyList = <string[]>null;
            var keysSorted = true;

            if (isUsingTags)
            {
                keyList = [];
                var groups = this.groupTags(nv, colName, filter, md, binSortOptions, keyList, assignments, buildAssignments);
            }
            else
            {
                //---- first, just group the records by their keys ----
                var groups = this.groupRecordsByKey(nv, colName, filter, binSortOptions);
            }

            var sumColData = null;
            if (binSortOptions && binSortOptions.sumByColumn)
            {
                sumColData = nv[binSortOptions.sumByColumn].values;
            }

            if (!keyList)
            {
                //---- get preferred list of keys ----
                if (md && md.breaks)
                {
                    keyList = md.breaks.map((value) => value + "");
                }
                else 
                {
                    keyList = <string[]>utils.getFilteredSortedKeys(colDataInfo, nv.layoutFilter);

                    if (!keyList)
                    {
                        keyList = vp.utils.keys(groups);
                        keysSorted = false;
                    }
                }
            }

            //---- now sort keys as needed ----
            var sortByKeyNames = (binSortOptions === undefined || binSortOptions === null || binSortOptions.sortDirection === bps.BinSorting.none);
            if (sortByKeyNames)
            {
                if (!keysSorted)
                {
                    //---- sort the keys, if not too many ----
                    var sortMax = 50000;
                    if (keyList.length <= sortMax)
                    {
                        keyList.sort();
                    }
                }
            }
            else 
            {
                keyList = this.sortByContent(keyList, groups, binSortOptions);
            }

            //---- now it is safe to compute the OTHER column (as per keyList sorted keys) ----
            var useOtherBin = (keyList.length > maxCategoryBins);
            if (useOtherBin)
            {
                var otherKeys = keyList.slice(maxCategoryBins - 1);
                keyList = keyList.slice(0, maxCategoryBins - 1);
                var otherMap = {};

                //--- build otherList ----
                var otherList: string[] = [];
                for (var i = 0; i < otherKeys.length; i++)
                {
                    var otherKey = otherKeys[i];
                    otherMap[key] = true;

                    var list = <string[]>groups[otherKey];
                    otherList = otherList.concat(list);
                }

                //---- for now, always put the "other" column at the end of the sorted keys ----
                keyList.push("Other");
                var otherIndex = keyList.length - 1;

                groups["Other"] = otherList;
            }

            var binCount = keyList.length;
            vp.utils.debug("--> binHelperCat: colName=" + colName + ", origCol=" + colDataInfo.colName + ", keyCount=" + binCount);

            var keyIndexes: any = {};
            var pkVector = nv.primaryKey;

            //---- initialize each bin ----
            for (var i = 0; i < binCount; i++)
            {
                var name = keyList[i];
                var isOther = false;

                if ((i === binCount - 1) && (useOtherBin))
                {
                    //name = "Other";
                    isOther = true;
                    //otherKeys = keyList.slice(i);
                }

                if (md && md.labels && md.labels.length)
                {
                    var displayName = md.labels[i];
                }
                else
                {
                    var displayName = name;

                    if (md.formatting)
                    {
                        var fmtFunc = vp.formatters.createExcelFormatter(md.formatting, "string");
                        displayName = fmtFunc(displayName);
                    }
                }

                bins[i] = new BinInfo(displayName, isOther, (isOther) ? otherKeys : null );
                keyIndexes[name] = i;

                if (isUsingTags)
                {
                    //---- finish the bin now ----
                    var bin = bins[i];
                    bin.isTagBin = true;
                    var binRecords = groups[name];

                    bin.count = binRecords.length;
                    bin.rowIndexes = binRecords;

                    bin.isOther = true;

                    //---- build otherKeys ----
                    otherKeys = [];

                    for (var b = 0; b < binRecords.length; b++)
                    {
                        var ri = binRecords[b];
                        var primaryKey = pkVector.getRawData(ri) + "";

                        otherKeys.push(primaryKey);
                    }

                    bin.otherKeys = otherKeys;
                }
            }

            if (!isUsingTags)
            {
                var colData = colDataInfo.values;
                var byVector = colData;
                var filter = (nv.layoutFilter) ? nv.layoutFilter.values : null;

                //---- ASSIGN each record to a BIN ----
                for (var i = 0; i < byVector.length; i++)
                {
                    var binIndex = 0;
                    var bin = bins[binIndex];

                    if (!filter || !filter[i])
                    {
                        if (colDataInfo.keyInfo)
                        {
                            var key = "" + colDataInfo.keyInfo.keysByRow[i];        // force to a string, so that IndexOf works
                        }
                        else
                        {
                            var key = "" + colData[i];
                        }

                        var binIndex = <number>keyIndexes[key];

                        if (binIndex === undefined || binIndex === null)
                        {
                            if (otherMap && otherMap[key])
                            {
                                binIndex = otherIndex;
                            }
                            else
                            {
                                //---- this key was not in breaks or sortedKeys; what to do? ----
                                binIndex = bins.length - 1;          // for now, put it in the last bin
                            }
                        }

                        //var binIndex = (keyIndexes[key] == undefined) ? -1 : <number>keyIndexes[key]; //var binIndex = keys.indexOf(key);

                        if (binIndex >= binCount || binIndex === -1)
                        {
                            //---- put in last (OTHER) bin ----
                            binIndex = binCount - 1;
                        }

                        if (binIndex === -1)
                        {
                            // If the items have been filtered, then keysByRow will not contain an entry for the filtered-out items.
                            // As a result, 'key' will be undefined and indexOf(key) will return -1.  Since there is no bin for this
                            // item, there is nothing left to do. 
                            // See bug #9792.
                            if (byVector[i] === -1) // Confirms that the item is filtered out
                            {
                                continue;
                            }
                        }

                        var bin = bins[binIndex];
                        bin.count++;

                        if (sumColData)
                        {
                            //---- sum data from NUMERIC sum column ----
                            var sumValue = sumColData[i];
                            bin.sum += sumValue;
                        }
                    }

                    //---- we build these lists for both IN and OUT records ----
                    if (addIndexes)
                    {
                        bin.rowIndexes.push(i);
                    }

                    //----  let FILTERED OUT items fall into bin 0 (but they will not be drawn there) ----
                    if (buildAssignments)
                    {
                        assignments.push(binIndex); // binIndex may be -1 (see comment below)
                    }
                }
            }

            var result = new BinResult();
            result.bins = bins;
            result.assignments = assignments;
            result.colName = colName;
            result.isTagBinning = isUsingTags;

            return result;
        }

        static groupTags(nv: NamedVectors, colName: string, filter: any, md: bps.MappingData, binSortOptions: BinSortOptionsClass,
            keys: string[], assignments: any[], buildAssignments: boolean)
        {
            var groups = {};
            var colDataInfo = <NumericVector>nv[colName];

            //---- ASSIGN each record to 0-N tags ----
            var count = colDataInfo.values.length;
            var delimiter = bps.TagDelimiters[<number>md.tagDelimiter];

            for (var i = 0; i < count; i++)
            {
                //---- only include filtered IN records ----
                if (!filter || !filter[i])
                {
                    var tagList = <string>colDataInfo.getRawData(i);
                    var tags = tagList.split(delimiter);

                    if (buildAssignments)
                    {
                        assignments[i] = [];
                    }

                    for (var t = 0; t < tags.length; t++)
                    {
                        var tag = tags[t].trim();

                        //---- add record i to group tag ----
                        var tagArray = groups[tag];
                        if (tagArray === undefined || tagArray === null)
                        {
                            //---- new tag/key ----
                            keys.push(tag);
                            tagArray = [];
                            tagArray.keyIndex = keys.length;
                            groups[tag] = tagArray;
                        }

                        tagArray.push(i);

                        if (buildAssignments)
                        {
                            assignments[i].push(tagArray.keyIndex);
                        }
                    }
                }
            }

            return groups;
        }

        static groupRecordsByKey(nv: NamedVectors, colName: string, filter: any, binSortOptions?: BinSortOptionsClass)
        {
            var groups = {};
            var colDataInfo = <NumericVector> nv[colName];
            var numVector = colDataInfo.values;
            var typeName = colDataInfo.colType;
            var isString = (typeName === "string");
            var keysByRow = (colDataInfo.keyInfo) ? colDataInfo.keyInfo.keysByRow : null;

            var aggColName = (binSortOptions) ? (binSortOptions.sumByColumn) : null;
            if (aggColName)
            {
                var aggColDataInfo = <NumericVector> nv[aggColName];
                var aggNumVector = aggColDataInfo.values;
                var aggTypeName = aggColDataInfo.colType;
                var aggIsString = (aggTypeName === "string");
                var aggKeysByRow = (aggColDataInfo.keyInfo) ? aggColDataInfo.keyInfo.keysByRow : null;
            }

            //---- ASSIGN each record to a BIN ----
            for (var i = 0; i < numVector.length; i++)
            {
                //---- only include filtered IN records ----
                if (!filter || !filter[i])
                {
                    var groupValue = (isString) ? keysByRow[i] : (numVector[i] + "");

                    if (aggColName)
                    {
                        var aggValue = (aggIsString) ? +aggKeysByRow[i] : aggNumVector[i];
                    }
                    else
                    {
                        aggValue = +groupValue;
                    }

                    var list = groups[groupValue];
                    if (list === undefined || list === null)
                    {
                        list = [];
                        groups[groupValue] = list;
                    }

                    list.push(aggValue);
                }
            }

            return groups;
        }

        static sortByContent(keyList: string[], groups: any, binSortOptions: BinSortOptionsClass)
        {
            var count = (binSortOptions.sortByAggregateType === "count");
            var sum = (binSortOptions.sortByAggregateType === "sum");

            //---- compute agg value for each list in group, as indexed by keyList ----
            for (var i = 0; i < keyList.length; i++)
            {
                var key = keyList[i];
                var list = <number[]> groups[key];

                if (list)
                {
                    //---- TODO: replace this calculation of "aggValue" with precomputed bin.sum ----
                    var anyList = <any>list;
                    if (count)
                    {
                        anyList.aggValue = list.length;
                    }
                    else if (sum)
                    {
                        anyList.aggValue = list.sum();
                    }
                }
            }

            //---- sort the keyList by "aggValue" ----
            var newKeyList = keyList.slice(0);           // copy before sorting (protect original sources);

            if (binSortOptions.sortDirection === bps.BinSorting.ascending)
            {
                newKeyList.sort((xx, yy) =>
                {
                    var x = groups[xx];
                    var y = groups[yy];

                    if (x.aggValue > y.aggValue) { return (1); }
                    if (x.aggValue < y.aggValue) { return (-1); }
                    return (0);
                });
            }
            else if (binSortOptions.sortDirection === bps.BinSorting.descending)
            {
                newKeyList.sort((xx, yy) =>
                {
                    var x = groups[xx];
                    var y = groups[yy];

                    if (x.aggValue > y.aggValue) { return (-1); }
                    if (x.aggValue < y.aggValue) { return (1); }
                    return (0);
                });
            }

            return newKeyList;
        }
    }
}
