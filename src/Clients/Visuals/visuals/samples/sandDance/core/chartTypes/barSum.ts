//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    barSum.ts - builds a summed sand Bar chart (where each item is a rectangle, stacked on to right of each other, with width
 //   proportional to x column value.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    export class barSumClass extends baseGlVisClass
    {
        //---- all facets info ----
        _facetBinResults: any[];
        _maxPosSumAllFacets = 0;
        _maxNegSumAllFacets = 0;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binLefts: number[];
        _binBottoms: number[];
        _itemAssignments: number[];
        _itemLefts: number[];
        _itemWidths: number[];

        _binWidth: number;
        _binHeight: number;

        _widthFactor = 0;                  // adjust each item's bottom/height to fit the tallest bin
        _inverseSizeFactor = 0;             // used to reverse effect of shader sizing

        _yMargin = 0;
        _yBetween = 0;
        _xMin = 0;
        _xMax = 0;

        constructor(view: dataViewClass, gl: any, chartState: any)
        {
            super("barSumClass", view, gl, chartState);
        }

        /** Two responsiblities: 1. compute max count for any bin, over all facets.  2. adjust scales as needed for our chart. */
        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            var facetHelper = dc.facetHelper;
            this._facetBinResults = [];
            var ym = this._view.yMapping();

            var maxPosSum = 0;
            var maxNegSum = 0;

            if (facetHelper)
            {
                var facetCount = facetHelper.facetCount();

                for (var i = 0; i < facetCount; i++)
                {
                    var data = nvFacetBuckets[i];
                    var results = chartUtils.computeSumForFacet(dc, data, ym, "y", "x");

                    this._facetBinResults.push(results.binResults);
                    maxPosSum = Math.max(maxPosSum, results.maxPosSum);
                    maxNegSum = Math.max(maxNegSum, results.maxNegSum);
                }
            }
            else
            {
                var results = chartUtils.computeSumForFacet(dc, dc.nvData, ym, "y", "x");

                this._facetBinResults.push(results.binResults);
                maxPosSum = Math.max(maxPosSum, results.maxPosSum);
                maxNegSum = Math.max(maxNegSum, results.maxNegSum);
            }

            this._maxPosSumAllFacets = maxPosSum;
            this._maxNegSumAllFacets = maxNegSum;

            vp.utils.debug("computeFacetStats: maxPosSum=" + maxPosSum + ", maxNegSum=" + maxNegSum);

            //---- return the sum of both as the "max item count" ----
            return maxPosSum + maxNegSum;  
        }

        /** Responsiblities: 
         1. adjust Y scale to reflect maxCount (across all facets).
         2. adjust X scale to reflect bin labels (on ticks, or in middle of ticks).
        */
        adjustScales(dc: DrawContext)
        {
            //---- adjust Y scale to reflect BINS ----
            var results = this._facetBinResults[0];
            dc.scales.y = chartUtils.adjustScaleForBin(dc.scales.y, results);

            //---- adjust X scale to reflect MAX SUM ----
            var oldScale = dc.scales.x;

            //---- use nice numbers for domain min/max ----
            var nn = vp.scales.niceNumbersAlt.calculate(-this._maxNegSumAllFacets, this._maxPosSumAllFacets);

            dc.scales.x = vp.scales.createLinear()
                .rangeMin(oldScale.rangeMin())
                .rangeMax(oldScale.rangeMax())
                .domainMin(nn.min)
                .domainMax(nn.max)

            //---- mark scale as having pre-computed tickCount ----
            var anyScale = <any>dc.scales.x;
            anyScale._tickCount = nn.steps + 1;
        }

        assignRecordsToBins(nv: NamedVectors, resultY, dc: DrawContext)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector;
            var isFiltered = (filter != null);

            var binAssignments = resultY.assignments;

            var itemWidths  = [];           // the width of each item (per its X column value)
            var itemLefts = []              // the left value of each item within its bin 
            var binPosOffsets = [];         // next position for an item in positive part of each bin
            var binNegOffsets = [];         // next position for an item in negative part of each bin

            //---- process each (sorted) record ----
            for (var vectorIndex = 0; vectorIndex < filter.length; vectorIndex++)
            {
                if (!filter[vectorIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binAssign = binAssignments[vectorIndex];

                    if (binPosOffsets[binAssign] === undefined)
                    {
                        binPosOffsets[binAssign] = 0;
                        binNegOffsets[binAssign] = 0;
                    }

                    //---- calculate the relative width of this item ----
                    var itemWidth = nv.x.values[vectorIndex];      

                    itemWidths[vectorIndex] = itemWidth;

                    if (itemWidth >= 0)
                    {
                        itemLefts[vectorIndex] = binPosOffsets[binAssign];
                        binPosOffsets[binAssign] += itemWidth;
                    }
                    else
                    {
                        binNegOffsets[binAssign] += itemWidth;
                        itemLefts[vectorIndex] = binNegOffsets[binAssign];
                    }
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    itemWidths[vectorIndex] = 0;
                    itemLefts[vectorIndex] = 0;
                }
            }

            this._itemWidths = itemWidths;
            this._itemLefts = itemLefts;

            var facetWidth = dc.width;
            var facetHeight = dc.height;

            var binsY = resultY.bins;

            //---- build an array of the bin names for the yScale labels ----
            var binNamesY = [];
            for (var i = 0; i < binsY.length; i++)
            {
                binNamesY[i] = (<any> binsY[i]).name;
            }

            var xMin = dc.scales.x.scale(-this._maxNegSumAllFacets);
            var xMax = dc.scales.x.scale(this._maxPosSumAllFacets);
            var availWidth = xMax - xMin;

            //// prevent size adjustments in shader by setting our scale factor here to reverse shader shading.
            this._widthFactor = availWidth/ (this._maxPosSumAllFacets + this._maxNegSumAllFacets);

            //---- create bounds ----
            var binLefts: number[] = [];
            var binBottoms: number[] = [];

            var bottom = dc.y + this._yMargin;

            for (var i = 0; i < binsY.length; i++)
            {
                binBottoms[i] = bottom;
                bottom += (this._binHeight + this._yBetween);

                //---- offset all bins by the same amount to enable comparisons ----
                var xOffset = this._widthFactor * this._maxNegSumAllFacets;

                binLefts[i] = dc.x + xOffset;
            }

            this._binLefts = binLefts;
            this._binBottoms = binBottoms;
            this._itemAssignments = binAssignments;

            this._inverseSizeFactor = 1 / dc.userSizeFactor;    //  dc.combinedSizeFactor;
        }

        preLayoutLoop(dc: DrawContext)
        {
            //var options = <sandDensityOptions>this._chartOptions;
            //var nv = dc.nvData;

            //var binResults = this._facetBinResults;

            //if (binResults && binResults.length)
            //{
            //    var yResult = binResults[dc.facetIndex];
            //    var binCount = yResult.bins.length;

            //    var width = dc.width;
            //    var height = dc.height;

            //    var approxItemHeight = height / binCount;

            //    var yMargin = .1 * approxItemHeight;
            //    var yBetween = .1 * approxItemHeight;

            //    this._yMargin = yMargin;
            //    this._yBetween = yBetween;

            //    //---- compute itemWidth and itemHeight ----
            //    var itemHeight = (height - 2 * yMargin - (binCount - 1) * yBetween) / binCount;
            //    var itemWidth = width;

            //    this._binWidth = itemWidth;
            //    this._binHeight = itemHeight;

            //    this.assignRecordsToBins(nv, yResult, dc);
            //}

            //---- compute usable part of X axis ----
            var xMin = <number>dc.scales.x.scale(this._maxNegSumAllFacets);
            var xMax = <number>dc.scales.x.scale(this._maxPosSumAllFacets);
            this._xMin = xMin;
            this._xMax = xMax;

            if (this._facetBinResults && dc.facetIndex < this._facetBinResults.length)
            {
                var facetResult = this._facetBinResults[dc.facetIndex];
                var availWidth = xMax - xMin;

                var result = chartUtils.computeBarBinSize(facetResult, availWidth, dc.height);
                this._binWidth = result.binWidth;
                this._binHeight = result.binHeight;
                this._yMargin = result.yMargin;
                this._yBetween = result.yBetween;

                this.assignRecordsToBins(dc.nvData, facetResult, dc);
            }
        }

        layoutDataForRecord(itemIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[itemIndex]);

            var visibleIndex = 0;

            if (!filtered)
            {
                visibleIndex = this._nextIndex++;
            }

            var binAssign = this._itemAssignments[itemIndex];

            var left = this._binLefts[binAssign];
            var bottom = this._binBottoms[binAssign];

            var widthFactor = this._widthFactor;
            var inverseSizeFactor = this._inverseSizeFactor;
            var trueWidth = Math.abs(widthFactor * this._itemWidths[itemIndex]);

            //---- layout as STACKED rectangles ----
            var x = left + (widthFactor * this._itemLefts[itemIndex]);
            var y = bottom + this._binHeight / 2;          // place at horizontal center of shape

            x += trueWidth / 2;                        // place at horizontal center of shape

            var z = 0;

            var width = inverseSizeFactor * trueWidth;
            var height = inverseSizeFactor * this._binHeight;      
            var depth = dc.defaultDepth2d      // test out 3d cube in a 2d shape

            var colorIndex = this.scaleColData(nv.colorIndex, itemIndex, dc.scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, itemIndex, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
       }
    }
}
 