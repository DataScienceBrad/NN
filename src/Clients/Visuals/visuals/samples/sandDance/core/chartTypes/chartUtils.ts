//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    chartUtils.ts - common functions used by some of the chart classes
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class chartUtils
    {
        static computeBestCountFactor(maxCount: number, shapesPerRow: number)
        {
            var breakCount = null;

            if (maxCount <= 1)
            {
                breakCount = 1;
            }
            else
            {
                var rowCount = Math.ceil(maxCount / shapesPerRow);
                maxCount = rowCount * shapesPerRow;
                var maxOver = 0;
                var bestFactor = null;

                //---- try various factors, in priority order ----
                var factors = [7, 8, 6, 5, 9, 4, 10, 3, 11, 12, 2];

                for (var i = 0; i < factors.length; i++)
                {
                    var f = factors[i];
                    var over = rowCount % f;
                    if (over === 0)
                    {
                        breakCount = f;
                        break;
                    }

                    if (i == 0 || over > maxOver)
                    {
                        maxOver = over;
                        bestFactor = f;
                    }
                }

                if (!breakCount)
                {
                    //---- take next highest factor of 7 ----
                    breakCount = bestFactor;
                    var rowsPerBreak = Math.ceil(rowCount / breakCount);
                    maxCount = rowsPerBreak * breakCount * shapesPerRow;
                }
            }

            return { maxCount: maxCount, tickCount: 1 + breakCount };
        }

        static computeMaxBinCountForData(dc, data, cm: bps.MappingData, binCol: string)
        {
            //---- compute single bin (for this facet) ----
            var requestedBins = cm.binCount;

            var sortOptions = new binSortOptionsClass();
            sortOptions.sortDirection = cm.binSorting;
            sortOptions.sortByAggregateType = "count";
            var maxCount = 0;

            var binResults = binHelper.createBins(data, binCol, requestedBins, cm.binCount, false, true, true, sortOptions, null, cm.useNiceNumbers, cm);
            if (binResults)
            {
                var binCount = binResults.bins.length;

                //---- compute maxCount ----
                var maxCount = 0;

                for (var i = 0; i < binCount; i++)
                {
                    var count = binResults.bins[i].count;
                    maxCount = Math.max(maxCount, count);
                }
            }

            return { maxCount: maxCount, binResults: binResults };
        }

        static binTheDataForCount(dc, data, cm: bps.MappingData, binCol: string)
        {
            var requestedBins = cm.binCount;

            var sortOptions = new binSortOptionsClass();
            sortOptions.sortDirection = cm.binSorting;
            sortOptions.sortByAggregateType = "count";
            var maxCount = 0;

            var binResults = binHelper.createBins(data, binCol, requestedBins, cm.binCount, false, true, true, sortOptions, null, cm.useNiceNumbers, cm);

            return binResults;
        }

        static computeSumForFacet(dc: DrawContext, data, cm: bps.MappingData, binColumn: string, sumByColumn: string)
        {
            var sortOptions = new binSortOptionsClass();
            sortOptions.sortDirection = cm.binSorting;
            sortOptions.sortByAggregateType = "sum";
            sortOptions.sumByColumn = sumByColumn;

            var maxCount = 0;
            var requestedBins = cm.binCount;

            var binResults = binHelper.createBins(data, binColumn, requestedBins, requestedBins, false, true, true, sortOptions, null, cm.useNiceNumbers, cm);
            if (binResults)
            {
                var binCount = binResults.bins.length;

                //cpp.binResults.push(xResult);

                //---- find tallest bin for the current facet ----
                var maxPosSum = 0;
                var maxNegSum = 0;

                for (var i = 0; i < binCount; i++)
                {
                    var result = this.computeBinNegPosSums(dc, binResults.bins[i], sumByColumn);

                    maxPosSum = Math.max(maxPosSum, result.posSum);
                    maxNegSum = Math.max(maxNegSum, result.negSum);
                }

                //cpp.maxBinPosSumForAllFacets = Math.max(cpp.maxBinPosSumForAllFacets, maxPosSum);
                //cpp.maxBinNegSumForAllFacets = Math.max(cpp.maxBinNegSumForAllFacets, maxNegSum);

            }

            return { maxPosSum: maxPosSum, maxNegSum: maxNegSum, binResults: binResults };
        }

        static computeBinNegPosSums(dc: DrawContext, binResult: BinInfo, sumColumn: string)
        {
            var rowIndexes = binResult.rowIndexes;
            var posHeight = 0;
            var negHeight = 0;
            var nv = dc.nvData;
            var values = nv[sumColumn].values;

            for (var i = 0; i < rowIndexes.length; i++)
            {
                var vectorIndex = rowIndexes[i];

                //---- only process FILTERED-IN records ----
                if (!dc.layoutFilterVector[vectorIndex])
                {
                    var height = values[vectorIndex];

                    if (height >= 0)
                    {
                        posHeight += height;
                    }
                    else
                    {
                        negHeight += height;
                    }
                }
            }

            return { posSum: posHeight, negSum: Math.abs(negHeight) };
        }

        static getOrderOfBins(bins: beachParty.BinInfoNum[])
        {
            var isAscend = true;
            var isDescend = true;
            var lastValue = null;

            for (var i = 0; i < bins.length; i++)
            {
                var value = bins[i].min;

                if (i > 0)
                {
                    if (value < lastValue)
                    {
                        isAscend = false;
                    }
                    else if (value > lastValue)
                    {
                        isDescend = false;
                    }
                }

                lastValue = value;
            }

            var order = (isAscend) ? +1 : ((isDescend) ? -1 : 0);
            return order;
        }

        static adjustScaleForBin(scale: vp.scales.baseScale, binResults: BinResult)
        {
            var scaleType = scale.scaleType();
            var bins = binResults.bins;

            //---- build an array of the bin names for the xScale labels ----
            var binNames = [];
            for (var i = 0; i < bins.length; i++)
            {
                binNames[i] = bins[i].name;
            }

            if (scaleType == vp.scales.ScaleType.categoryIndex || scaleType == vp.scales.ScaleType.categoryKey)
            {
                scale.categoryKeys(binNames);
            }
            else
            {
                var order = this.getOrderOfBins(<BinInfoNum[]>bins);

                //---- order = 0 means bins are in random order, according to their conseq. min/max values ----
                //---- order = -1 means descending order ----

                var useCategoryForBins = (order != 1);

                if (useCategoryForBins)
                {
                    var oldScale = scale;

                    scale = vp.scales.createCategoryIndex()
                        .categoryKeys(binNames)
                        .range(oldScale.rangeMin(), oldScale.rangeMax())

                    //---- enable scaling by keyIndex (default is key value) ----
                    //scale.scale = scale.categoryScale;
                }
                else
                {
                    var breakValues = [];
                    var labels = [];
                    var numBins = (<BinResultNum>binResults).bins;
                    var anyScale = <any>scale;

                    for (var b = 0; b < numBins.length; b++)
                    {
                        var numBin = <BinInfoNum>numBins[b];

                        breakValues.push(numBin.min);
                        labels.push(numBin.minLabel);

                        if (b == bins.length - 1)
                        {
                            breakValues.push(numBin.max);
                            labels.push(numBin.maxLabel);
                        }
                    }

                    anyScale._breaks = breakValues;
                    anyScale._labels = labels;

                    if (scaleType == vp.scales.ScaleType.dateTime && !anyScale._formatter)
                    {
                        //---- use the formatString returned by the binning function ----
                        var formatString = (<BinResultNum>binResults).dateFormatString;

                        var formatter = vp.formatters.createExcelFormatter(formatString, "date");
                        anyScale._formatter = formatter;
                    }
                }

            }

            var anyScale = <any>scale;
            anyScale._binResults = binResults;
            anyScale._useCategoryForBins = useCategoryForBins;

            return scale;
        }

        static getScatterShapeSize(dc: DrawContext, recordCount?: number, view?: dataViewClass)
        {
            var maxShapeSize = (view) ? view.defaultShapeSize() : null;

            if (maxShapeSize)
            {
                //---- convert from pixels to world units ----
                maxShapeSize = view.getTransformer().screenSizeXToWorld(maxShapeSize);
            }
            else
            {
                var facetCount = (dc.facetHelper) ? dc.facetHelper.facetCount() : 0;

                if (recordCount === undefined || recordCount === null)
                {
                    recordCount = dc.filteredRecordCount;
                }

                maxShapeSize = this.getScatterShapeSizeEx(recordCount, dc.width, dc.height, facetCount);
            }

            return maxShapeSize;
        }

        /** returns the best shape size (in world units) for a scatter-like chart. */
        static getScatterShapeSizeEx(filteredRecordCount: number, width: number, height: number, facetCount: number)
        {
            var count = filteredRecordCount;

            //---- density-based shape size ----
            var maxShapeSize = Math.sqrt((width * height) / count);

            //---- adjust for spacing ----

            if (facetCount > 1)
            {
                maxShapeSize *= 1.25;
            }
            else
            {
                maxShapeSize *= .375;       // .25;
            }

            return maxShapeSize;
        }

        static computeMaxCountOverFacets(dc: DrawContext, nvFacetBuckets: any[])
        {
            var maxCount = 0;

            if (nvFacetBuckets)
            {
                for (var i = 0; i < nvFacetBuckets.length; i++)
                {
                    var nv = <NamedVectors>nvFacetBuckets[i];
                    var count = nv.layoutFilter.count(0);

                    maxCount = Math.max(maxCount, count);
                }

                //maxCount = Math.floor(maxCount / nvFacetBuckets.length);        // Math.sqrt(nvFacetBuckets.length);      // asthetic adjustment
            }
            else
            {
                maxCount = dc.filteredRecordCount;
            }

            return maxCount;
        }

        /** Compute the fixed-width and max-height of bins for a Column Chart. This code is shared to encourage consistent layout results for
         * Column Grid, Column Sum.
         */
        static computeColumnBinSize(facetResult: BinResult, availWidth: number, availHeight: number)
        {
            var binCount = facetResult.bins.length;
            var approxItemWidth = availWidth / binCount;

            var xMargin = .05 * approxItemWidth;
            var xBetween = .15 * approxItemWidth;

            var binWidth = (availWidth - (2 * xMargin) - (binCount - 1) * xBetween) / binCount;
            var binHeight = availHeight;

            return { binWidth: binWidth, binHeight: binHeight, xMargin: xMargin, xBetween: xBetween };
        }

        /** Compute the max-width and fixed-height of bins for a Bar chart. This code is shared to encourage consistent layout results for
         * Bar Grid, Bar Sum.
         */
        static computeBarBinSize(facetResult: BinResult, availWidth: number, availHeight: number)
        {
            var binCount = facetResult.bins.length;
            var approxItemHeight = availHeight / binCount;

            var yMargin = .05 * approxItemHeight;
            var yBetween = .15 * approxItemHeight;

            //---- compute itemWidth and itemHeight ----
            var itemHeight = (availHeight - (2 * yMargin) - (binCount - 1) * yBetween) / binCount;
            var itemWidth = availWidth;

            return { binWidth: itemWidth, binHeight: itemHeight, yMargin: yMargin, yBetween: yBetween };
        }

    }
} 