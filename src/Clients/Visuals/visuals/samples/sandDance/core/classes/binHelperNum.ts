//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    binHelperNum.ts - divides up numeric data into bins.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class binHelperNum
    {
        /// returns an array of {min, max, count, density} bin objects for the specified data and binsize.
        public static createBins(nv: NamedVectors, colName: string, binCount: number, addIndexes?: boolean,
            returnBinAssignments?: boolean, formatter?: any, useNiceNumbers?: boolean, md?: bps.MappingData,
            binSortOptions?: binSortOptionsClass): BinResultNum
        {
            if (md && md.breaks && md.breaks.length)
            {
                binCount = md.breaks.length - 1;
            }

            var bins: BinInfoNum[] = [];
            var assignments: number[] = [];
            var usingLocalFormatter = false;
            var recommendedDateFormatString = undefined;

            var numColData = nv[colName];
            var colData = numColData.values;

            var sumColData = null;
            if (binSortOptions && binSortOptions.sumByColumn)
            {
                sumColData = nv[binSortOptions.sumByColumn].values;
            }

            var filteredData = colData;
            var typeName = numColData.colType;
            var fixedSizedBuckets = true;

            if (binCount > 0)
            {
                //---- support case where we are binning with numbers, but have a formatting string from Excel ----
                //---- in this case, ignore the Excel format, and do our own local bin formatting ----
                if (formatter && formatter._colType == "number")
                {
                    //var isAllIntegers = vp.data.isAllIntegers(colData);
                    if (true)       // isAllIntegers)
                    {
                        //---- remove the "General" formatter and create a smarter local formatter below ----
                        formatter = null;
                    }
                }

                if (md.formatting)
                {
                    formatter = vp.formatters.createExcelFormatter(md.formatting, typeName);
                }

                var filterVector = nv.layoutFilter;
                if (filterVector)
                {
                    //---- use "colData" for building assignments, but "filteredData" for bin boundaries ----
                    filteredData = [];
                    var filterValues = filterVector.values;

                    for (var i = 0; i < colData.length; i++)
                    {
                        if (! filterValues[i])
                        {
                            filteredData.push(colData[i]);
                        }
                    }
                }

                var dataMin = filteredData.min();
                var dataMax = filteredData.max();

                if (dataMin == dataMax)
                {
                    //binCount = 1;           // single value - force to just 1 data bucket

                    dataMax = dataMin + 1;          // make 2 values so that we can honor requested number of buckets
                }

                if (typeName == "number")
                {
                    if (md.minBreak !== undefined && md.minBreak < dataMin)
                    {
                        dataMin = md.minBreak;
                    }

                    if (md.maxBreak !== undefined && md.maxBreak > dataMax)
                    {
                        dataMax = md.maxBreak;
                    }
                }

                //---- convert min/max to NiceNums ----
                ////var nn = plotServices.niceNumbers.calculate(dataMin, dataMax, false, false, null, null, binCount, false);

                if (useNiceNumbers)
                {
                    var requestedCount = (md.isBinCountSoft) ? undefined : (binCount + 1);

                    var nn = vp.scales.niceNumbersAlt.calculate(dataMin, dataMax, requestedCount)
                    dataMin = nn.min;
                    dataMax = nn.max;

                    if (md.isBinCountSoft)
                    {
                        binCount = nn.steps;
                    }
                }

                var dataRange = dataMax - dataMin;
                var binSize = dataRange / binCount;

                //---- step 1: build empty bins ----
                var binStart = dataMin;
                var isDescending = (dataMin > dataMax);

                var numDecimals = vp.data.calcNumDecimals(dataMax, dataMin, binCount);

                if (!formatter)
                {
                    if (typeName == "date")
                    {
                        //---- defer this until we get recommendedDateFormatter ----
                        //formatter = vp.formatters.createExcelFormatter("mm/dd/yy", "date");
                    }
                    else
                    {
                        formatter = vp.formatters.createCommaFormatter(numDecimals);
                    }

                    usingLocalFormatter = true;
                }

                if (md && md.breaks && md.breaks.length)
                {
                    for (var i = 0; i < md.breaks.length - 1; i++)
                    {
                        var minValue = <number>md.breaks[i];
                        var maxValue = <number>md.breaks[i + 1];

                        var bin = new BinInfoNum("", minValue, maxValue);

                        var thisSize = bin.max - bin.min;

                        if (i == 0)
                        {
                            binSize = thisSize;
                        }
                        else if (thisSize != binSize)
                        {
                            fixedSizedBuckets = false;
                        }

                        if (addIndexes)
                        {
                            bin.rowIndexes = [];
                        }

                        bin.isFirst = (i == 0);

                        bins.push(bin);
                    }

                    if (typeName == "date")
                    {
                        if (!formatter)
                        {
                            var result = vp.dateHelper.getDateScaleValues(dataMin, dataMax, 7);
                            recommendedDateFormatString = result.formatString;

                            formatter = vp.formatters.createExcelFormatter(recommendedDateFormatString, "date");
                        }
                    }
                }
                else if (typeName == "date")
                {
                    //---- TODO: figure out best units to use here ----
                    //---- for now, we use HOURS or multiples thereof ----

                    var result = vp.dateHelper.getDateScaleValues(dataMin, dataMax, 7);
                    var steps = <number[]>result.steps;
                    recommendedDateFormatString = result.formatString;

                    if (!formatter)
                    {
                        formatter = vp.formatters.createExcelFormatter(recommendedDateFormatString, "date");
                    }

                    var binCount = steps.length - 1;
                    binSize = undefined;

                    //var dtMin = new Date(dataMin);
                    //var dtMax = new Date(dataMax);

                    //var hourMin = Math.floor(dtMin.getHours());
                    //var hourMax = Math.ceil(dtMax.getHours() + 1);

                    //var dtStart = new Date(dataMin);
                    //var dtEnd = new Date(dataMin);

                    //binCount = hourMax - hourMin;

                    for (var i = 0; i < binCount; i++)
                    {
                        //var hour = hourMin + i;

                        //dtStart.setHours(hour);
                        //dtEnd.setHours(hour + 1);

                        var minValue = steps[i];
                        var maxValue = steps[i + 1];

                        var bin = new BinInfoNum("", minValue, maxValue);

                        if (binSize === undefined)
                        {
                            binSize = bin.max - bin.min;
                        }

                        if (addIndexes)
                        {
                            bin.rowIndexes = [];
                        }

                        bin.isFirst = (i == 0);

                        bins.push(bin);
                    }
                }
                else
                {
                    //---- number ----
                    for (var i = 0; i < binCount; i++)
                    {
                        var binStart = dataMin + (i * binSize);

                        if (isDescending)
                        {
                            var binEnd = Math.max(dataMax, binStart + binSize);
                        }
                        else
                        {
                            var binEnd = Math.min(dataMax, binStart + binSize);
                        }

                        var bin = new BinInfoNum("", binStart, binEnd);

                        if (addIndexes)
                        {
                            bin.rowIndexes = [];
                        }

                        bin.isFirst = (i == 0);

                        bins.push(bin);
                    }

                    // Make sure that the maximum value is always included as the last bin boundary [because
                    // of the inherent float imprecision issues that arise from the way binStart is computed
                    // (see the comment below regarding the "BEFORE bin case")]
                    bins[binCount - 1].max = isDescending ? dataMin : dataMax;
                }

                //---- step 2: fill bins ----
                var firstBinMin = bins[0].min;

                for (var i = 0; i < colData.length; i++)
                {
                    //---- filtered-out shapes will go into bin 0 ----
                    var binIndex = 0;
                    var bin = bins[binIndex];

                    if (! filterValues || ! filterValues[i])
                    {
                        var value = colData[i];
                        if (isNaN(value))
                        {
                            //---- convert NAN values to 0, so their bin locations are well defined ----
                            value = 0;
                        }

                        //---- find "fltIndex" ----
                        if (fixedSizedBuckets && binSize)
                        {
                            var fltIndex = (value - firstBinMin) / binSize;
                        }
                        else
                        {
                            for (var j = 0; j < bins.length; j++)
                            {
                                var bin = bins[j];
                                if (value <= bin.max || j == (bins.length-1))
                                {
                                    fltIndex = j;
                                    break;
                                }
                            }
                        }

                        //var binIndex = Math.max(0, Math.floor(fltIndex - hostServices.epsilon));

                        /*
                        // RichardH: Commented out 2/4/2014: With this code in place, the bin index will sometimes disagree with the bin.min/max values
                        // [eg. in DemoVote, a MedianHomeValue of 200,000 (with 15 columns) will be placed into bin index 3 (200,000.2 to 266,666.93) instead of bin index 2].
                        var binIndex = Math.max(0, Math.floor(fltIndex + hostServices.epsilon));
                        binIndex = Math.min(binIndex, binCount - 1);
                        */

                        binIndex = Math.min(Math.floor(fltIndex), binCount - 1);

                        // If we have, for example, 3 columns: "0 .. 10", "> 10 .. 20", "> 20 .. 30" then we need to
                        // ensure that the value 10 falls into bin[0] (not bin 1) and 20 falls into bin[1] (not bin 2).
                        // Note that we need to do 2 checks for the BEFORE bin case:
                        // Is the value <= the max of the bin before, or is the value equal to the min of the current bin?
                        // We need both since 'max of the bin before' and 'min of the current bin' may NOT be the same value
                        // due to float imprecision. See this in action with the titanic dataset and 15 columns on 'Age':
                        // bins[5].max = 31.999999999999996 yet bins[6].min = 32. 
                        // This happens because:
                        // (5 * binSize) + binSize = 31.999999999999996, but 6 * binSize = 32.

                        //---- enforce bin min/max settings for edge cases ----
                        if ((binIndex > 0) && (value <= bins[binIndex].min))
                        {
                            binIndex--;
                        }
                        else if ((binIndex < bins.length - 1) && (value > bins[binIndex].max))
                        {
                            binIndex++;
                        }

                        //---- update BIN STATS (only for filtered-IN shapes) ----
                        var bin = bins[binIndex];
                        bin.count = bin.count + 1;

                        if (sumColData)
                        {
                            var sumValue = sumColData[i];
                            bin.sum += sumValue;
                        }

                        if (bin.actualMin === undefined || value < bin.actualMin)
                        {
                            bin.actualMin = value;
                        }

                        if (bin.actualMax === undefined || value > bin.actualMax)
                        {
                            bin.actualMax = value;
                        }

                    }

                    //---- we build these lists for both IN and OUT records ----
                    if (addIndexes)
                    {
                        bin.rowIndexes.push(i);
                    }

                    if (returnBinAssignments)
                    {
                        //---- just let FILTERED OUT items fall into bin 0 assignments (but they will not be put there during drawing) ----
                        assignments[i] = binIndex;
                    }
                }

                //---- add "density" field ----   
                var itemCount = filteredData.length;

                this.computeBinStats(bins, itemCount);

                if (usingLocalFormatter && typeName == "number")
                {
                    //---- ensure that label decimal precision is true to the bin's content ----
                    for (var i = 0; i < 5; i++)             // maximum of 5 times / extra decimals
                    {
                        if (!this.labelsNeedMoreDecimals(bins, formatter))
                        {
                            break;
                        }

                        //---- add 1 more decimal to formatter and rebuild labels ----
                        numDecimals++;
                        formatter = vp.formatters.createCommaFormatter(numDecimals);
                    }
                }

                //---- assign final labels ----
                for (var i = 0; i < bins.length; i++)
                {
                    var bin = bins[i];

                    if (md && md.labels && md.labels.length)
                    {
                        var minLabel = md.labels[i];
                        var maxLabel = md.labels[i + 1];
                    }
                    else
                    {
                        var minLabel = <string>formatter(bin.min);
                        var maxLabel = <string>formatter(bin.max);
                    }

                    bin.name = ((i == 0) ? "" : "> ") + minLabel + " ... " + maxLabel;

                    bin.minLabel = minLabel;
                    bin.maxLabel = maxLabel;
                }
            }

            var retValue = new BinResultNum();

            retValue.colName = colName;
            retValue.bins = bins;
            retValue.assignments = assignments;
            retValue.dateFormatString = recommendedDateFormatString;
            retValue.isTagBinning = false;

            return retValue;
        }

        private static computeBinStats(bins: BinInfoNum[], dataItemCount: number)
        {
            for (var i = 0; i < bins.length; i++)
            {
                var bin = bins[i];
                bin.density = bin.count / dataItemCount;
            }

            var maxCount = bins.max(function (data) { return data.count });
            var maxDensity = bins.max(function (data) { return data.density });

            for (var i = 0; i < bins.length; i++)
            {
                var bin = bins[i];

                //---- add "ncount" field (count scaled to maximum of 1) ----
                bin.ncount = bin.count / maxCount;

                //---- add "ndensity" field (density scaled to maximum of 1) ----
                bin.ndensity = bin.density / maxDensity;
            }
        }

        private static labelsNeedMoreDecimals(bins: any[], formatter: any)
        {
            var needMoreDecimals = false;

            for (var i = 0; i < bins.length; i++)
            {
                var bin = bins[i];
                var displayMin = +formatter(bin.min);
                var displayMax = +formatter(bin.max);

                if (i == 0)     // must be between min/max inclusive
                {
                    if (bin.actualMin !== undefined)
                    {
                        if (bin.actualMin < displayMin || bin.actualMax > displayMax)
                        {
                            needMoreDecimals = true;
                            break;
                        }
                    }
                }
                else
                {
                    //---- should be > min and <= max ----
                    if (bin.actualMin !== undefined)
                    {
                        if (bin.actualMin <= displayMin || bin.actualMax > displayMax)
                        {
                            needMoreDecimals = true;
                            break;
                        }
                    }
                }
            }

            return needMoreDecimals;
        }
    }


}