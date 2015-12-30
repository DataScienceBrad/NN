///-----------------------------------------------------------------------------------------------------------------
/// binHelper.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - divides data into either numeric or categorical bins.
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />
 
module beachParty
{
    export class BinHelper
    {
        public static createBins(nv: NamedVectors, colName: string, numericBinCount: number,
            maxCategoryBins: number, forceCategory?: boolean, addIndexes?: boolean, buildAssignments?: boolean,
            binSortOptions?: BinSortOptionsClass, formatter?: any, useNiceNumbers?: boolean, md?: bps.MappingData): BinResult
        {
            var result = <BinResult> null;

            var colData = nv[colName];

            if (colData)
            {
                var typeName = colData.colType;

                if ((forceCategory) || (typeName === "string"))
                {
                    var requestCount = numericBinCount;         //    Math.max(numericBinCount, maxCategoryBins);

                    //---- BIN the CATEGORY data ----
                    result = BinHelperCat.createCatBins(nv, colName, requestCount, addIndexes, buildAssignments, binSortOptions, md);
                }
                else
                {
                    //---- BIN the NUMERIC data ----
                    result = BinHelperNum.createBins(nv, colName, numericBinCount, addIndexes, buildAssignments, formatter, useNiceNumbers,
                        md, binSortOptions);

                    if (binSortOptions && binSortOptions.sortDirection !== bps.BinSorting.none)
                    {
                        this.sortBins(result, binSortOptions, nv);
                    }
                }
            }

            return result;
        }

        public static splitBinsIntoNamedVectors(binResult, nv: NamedVectors): NamedVectors[]
        {
            var bins = binResult.bins;
            var count = bins.length;
            var buckets = [];

            for(var i = 0; i < count; i++)
            {
                var bin = bins[i];
                var bucket = this.buildBinBucket(bin, nv);

                buckets.push(bucket);
            }

            return buckets;
        }

        /** for facets: split data from nv into groups, as defined by the bin result "bin". */
        private static buildBinBucket(bin: BinInfo, nv: NamedVectors): NamedVectors
        {
            var indexes = bin.rowIndexes;       // the indexes in this facet bucket
            var keys = vp.utils.keys(nv);
            var bucket = <any>{};

            for (var k = 0; k < keys.length; k++)
            {
                var key = keys[k];
                var fromNV = nv[key];
                var toNV: NumericVector = null;

                if (key !== "length" && fromNV)
                {
                    var fromVector = fromNV.values;
                    var toVector = <any>[];
                    toNV = new NumericVector(toVector, key, fromNV.colType);

                    //---- transfer data for this key (named vector) ----
                    for (var i = 0; i < indexes.length; i++)
                    {
                        var index = indexes[i];
                        var value = fromVector[index];

                        toVector.push(value);
                    }

                    //---- if STRING, we need to recompute TEXT vector properties: rowsByKey and KeysByRow ---- 
                    if (toNV.colType === "string")
                    {
                        utils.rebuildStringKeyIndexes(toNV, indexes, fromNV);
                    }

                    bucket[key] = toNV;
                    bucket.length = toVector.length;        // fromVector.length;
                }
            }

            return bucket;
        }

        public static sortBins(binningResults: any, binSortOptions: BinSortOptionsClass, nv: NamedVectors)
        {
            if (((binSortOptions.sortByAggregateType !== "count") && (binSortOptions.sortByAggregateType !== "sum")) ||
                (binSortOptions.sortDirection === bps.BinSorting.none))
            {
                throw "One or more of the supplied binSortOptions values is invalid";
            }

            var result = binningResults;
            var preSortBinIDs: any[] = [];
            var postSortBinIDs: any[] = []; // Used to update result.assignments

            // Populate preSortBinIDs [needed to later populate postSortBinIDs]
            for (var i = 0; i < result.bins.length; i++)
            {
                var bin = result.bins[i];
                preSortBinIDs[bin.name] = i;
            }

            if (binSortOptions.sortByAggregateType === "count")
            {
                //---- Sort the bins by COUNT ----
                if (binSortOptions.sortDirection === bps.BinSorting.ascending)
                {
                    result.bins.sort((x, y) =>
                    {
                        if (x.count > y.count) { return (1); }
                        if (x.count < y.count) { return (-1); }
                        return (0);
                    });
                }
                if (binSortOptions.sortDirection === bps.BinSorting.descending)
                {
                    result.bins.sort((x, y) =>
                    {
                        if (x.count > y.count) { return (-1); }
                        if (x.count < y.count) { return (1); }
                        return (0);
                    });
                }
            }
            else if (binSortOptions.sortByAggregateType === "sum")
            {
                //---- Sort the bins by COUNT ----
                if (binSortOptions.sortDirection === bps.BinSorting.ascending)
                {
                    result.bins.sort((x, y) =>
                    {
                        if (x.sum > y.sum) { return (1); }
                        if (x.sum < y.sum) { return (-1); }
                        return (0);
                    });
                }
                if (binSortOptions.sortDirection === bps.BinSorting.descending)
                {
                    result.bins.sort((x, y) =>
                    {
                        if (x.sum > y.sum) { return (-1); }
                        if (x.sum < y.sum) { return (1); }
                        return (0);
                    });
                }
            }

            // Compute old-to-new bin ID mappings
            for (var i = 0; i < result.bins.length; i++)
            {
                var bin = result.bins[i];
                var oldBinID = preSortBinIDs[bin.name];
                postSortBinIDs[oldBinID] = i;
            }

            // Update bin assignments to match the new bin sorting
            if (result.assignments)
            {
                for (var i = 0; i < result.assignments.length; i++)
                {
                    var oldBinID = result.assignments[i];
                    var newBinID = postSortBinIDs[oldBinID];
                    result.assignments[i] = newBinID;
                }
            }
        }
    }

    export class BinSortOptionsClass
    {
        sortDirection: bps.BinSorting;     
        sortByAggregateType: string;    // "count" or "sum"
        sumByColumn: string;            // Only used when sortByAggregateType is "sum"
    }

    export class BinInfo
    {
        /** name of this bin. */
        name: string;

        /** number of items in this bin. */
        count: number;

        /** sum of all "SUM" column values for all records in the bin. */
        sum: number;            

        /** 0-based indexes of records in this bin. */
        rowIndexes: number[];

        /** indicates this is the first bin of a set.  For numeric/date bins, the first bin includes its minValue.  */
        isFirst: boolean;

        /** if true, this is a single bin containing values from all the remaining bins (in current order). */
        isOther: boolean;

        /** if true, this bin was produced from a tag column and needs special treatment. */
        isTagBin: boolean;

        /** if isOther, this contains the set of other keys/values. */
        otherKeys: any[];

        constructor(name: string, isOther?: boolean, otherKeys?: string[])
        {
            this.name = name;
            this.count = 0;
            this.rowIndexes = [];
            this.isFirst = false;
            this.isOther = isOther;
            this.otherKeys = otherKeys;
            this.sum = 0;
            this.isTagBin = false;
        }
    }

    export class BinInfoNum extends BinInfo
    {
        min: number;            // min and max are the equal bucket divisions
        max: number;

        /** formatted min value for this bin */
        minLabel: string;

        /** formatted max value for this bin */
        maxLabel: string;

        actualMin: number;      // min value found in bucket
        actualMax: number;      // max value found in bucket
        density: number;        // percentage of total data in this bucket
        ncount: number;         // normalized count
        ndensity: number;       // normalized density

        constructor(name: string, min: number, max: number, actualMin?: number, actualMax?: number, density?: number, ncount?: number, ndensity?: number)
        {
            super(name);

            this.min = min;
            this.max = max;
            this.minLabel = null;
            this.maxLabel = null;
            this.actualMin = actualMin;
            this.actualMax = actualMax;

            this.density = density;
            this.ncount = ncount;
            this.ndensity = ndensity;
        }
    }

    export class BinResult
    {
        colName: string;
        bins: BinInfo[];
        assignments: number[];      // bin numbers for each record number index
        isTagBinning: boolean;
    }

    export class BinResultNum extends BinResult
    {
        //bins: BinInfoNum[];
        dateFormatString: string;
    }

}