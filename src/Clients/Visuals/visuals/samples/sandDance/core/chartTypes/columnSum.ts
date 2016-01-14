//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    columnSum.ts - builds a summed sand Column chart (where each item is a rectangle, stacked on top of each other, with height
 //   proportional to y column value.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class ColumnSumClass extends BaseGlVisClass
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
        _itemBottoms: number[];
        _itemHeights: number[];

        _binWidth: number;
        _binHeight: number;

        _heightFactor = 0;                  // adjust each item's bottom/height to fit the tallest bin
        _inverseSizeFactor = 0;             // used to reverse effect of shader sizing

        _xMargin = 0;
        _xBetween = 0;
        _yMin = 0;
        _yMax = 0;

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement)
        {
            super("columnSumClass", view, gl, chartState, container);
        }

        /** Responsiblities: 
            1. compute max count for any bin, over all facets.  
            2. return max count
        */
        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            var facetHelper = dc.facetHelper;
            this._facetBinResults = [];
            var xm = this._view.xMapping();

            var maxPosSum = 0;
            var maxNegSum = 0;

            if (facetHelper)
            {
                var facetCount = facetHelper.facetCount();

                for (var i = 0; i < facetCount; i++)
                {
                    var data = nvFacetBuckets[i];
                    var results = ChartUtils.computeSumForFacet(dc, data, xm, "x", "y");

                    this._facetBinResults.push(results.binResults);
                    maxPosSum = Math.max(maxPosSum, results.maxPosSum);
                    maxNegSum = Math.max(maxNegSum, results.maxNegSum);
                }
            }
            else
            {
                var results = ChartUtils.computeSumForFacet(dc, dc.nvData, xm, "x", "y");

                this._facetBinResults.push(results.binResults);
                maxPosSum = Math.max(maxPosSum, results.maxPosSum);
                maxNegSum = Math.max(maxNegSum, results.maxNegSum);
            }

            this._maxPosSumAllFacets = maxPosSum;
            this._maxNegSumAllFacets = maxNegSum;

            //---- return the sum of both as the "max item count" ----
            return maxPosSum + maxNegSum;  
        }

        /** Responsiblities: 
           1. adjust Y scale to reflect maxCount (across all facets).
           2. adjust X scale to reflect bin labels (on ticks, or in middle of ticks).
       */
        adjustScales(dc: DrawContext)
        {
            //---- adjust X scale to reflect BINS ----
            var results = this._facetBinResults[0];
            dc.scales.x = ChartUtils.adjustScaleForBin(dc.scales.x, results);
             
            //---- adjust Y scale to reflect MAX SUM ----
            var oldScale = dc.scales.y;

            //---- use nice numbers for domain min/max ----
            var nn = vp.scales.niceNumbersAlt.calculate(-this._maxNegSumAllFacets, this._maxPosSumAllFacets);
           
            dc.scales.y = vp.scales.createLinear()
                .rangeMin(oldScale.rangeMin())
                .rangeMax(oldScale.rangeMax())
                .domainMin(nn.min)
                .domainMax(nn.max);

            //---- mark scale as having pre-computed tickCount ----
            var anyScale = <any>dc.scales.y;
            anyScale._tickCount = nn.steps + 1;;
        }

        assignRecordsToBins(nv: NamedVectors, resultX, dc: DrawContext)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector;

            var binAssignments = resultX.assignments;

            var itemHeights = [];           // the height of each item (per its Y column value)
            var itemBottoms = [];            // the bottom value of each item with its bin ;
            var binPosOffsets = [];         // next position for an item in positive part of each bin
            var binNegOffsets = [];         // next position for an item in negative part of each bin

            //---- process each (sorted) record ----
            for (var vectorIndex = 0; vectorIndex < filter.length; vectorIndex++)
            {
                if (!filter[vectorIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binAssign = binAssignments[vectorIndex];

                    if (binPosOffsets[binAssign] === undefined || binPosOffsets[binAssign] === null)
                    {
                        binPosOffsets[binAssign] = 0;
                        binNegOffsets[binAssign] = 0;
                    }

                    //---- calculate the relative height of this item ----
                    var itemHeight = nv.y.values[vectorIndex];      

                    itemHeights[vectorIndex] = itemHeight;

                    if (itemHeight >= 0)
                    {
                        itemBottoms[vectorIndex] = binPosOffsets[binAssign];
                        binPosOffsets[binAssign] += itemHeight;
                    }
                    else
                    {
                        binNegOffsets[binAssign] += itemHeight;
                        itemBottoms[vectorIndex] = binNegOffsets[binAssign];
                    }
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    itemHeights[vectorIndex] = 0;
                    itemBottoms[vectorIndex] = 0;
                }
            }

            this._itemHeights = itemHeights;
            this._itemBottoms = itemBottoms;

            var binsX = resultX.bins;

            //---- build an array of the bin names for the xScale labels ----
            var binNamesX = [];
            for (var i = 0; i < binsX.length; i++)
            {
                binNamesX[i] = (<any> binsX[i]).name;
            }

            var yMin = dc.scales.y.scale(-this._maxNegSumAllFacets);
            var yMax = dc.scales.y.scale(this._maxPosSumAllFacets);
            var availHeight = yMax - yMin;

            /// prevent size adjustments in shader by setting our scale factor here to reverse shader shading.
            this._heightFactor = availHeight / (this._maxPosSumAllFacets + this._maxNegSumAllFacets);

            //---- create bounds ----
            var binLefts: number[] = [];
            var binBottoms: number[] = [];

            var left = dc.x + this._xMargin;        // + dc.itemHalf;
            var bottom = dc.y;                      // + dc.itemHalf;

            for (var i = 0; i < binsX.length; i++)
            {
                binLefts[i] = left;
                left += (this._binWidth + this._xBetween);

                //---- offset all bins by the same amount to enable comparisons ----
                var yOffset = this._heightFactor * this._maxNegSumAllFacets;

                binBottoms[i] = bottom + yOffset;
            }

            this._binLefts = binLefts;
            this._binBottoms = binBottoms;
            this._itemAssignments = binAssignments;

            this._inverseSizeFactor = 1 / dc.userSizeFactor;            //  dc.combinedSizeFactor;
        }

        preLayoutLoop(dc: DrawContext)
        {
            //---- compute usable part of Y axis ----
            var yMin = <number>dc.scales.y.scale(this._maxNegSumAllFacets);
            var yMax = <number>dc.scales.y.scale(this._maxPosSumAllFacets);
            this._yMin = yMin;
            this._yMax = yMax;

            if (this._facetBinResults && dc.facetIndex < this._facetBinResults.length)
            {
                var facetResult = this._facetBinResults[dc.facetIndex];
                var availHeight = yMax - yMin;

                var result = ChartUtils.computeColumnBinSize(facetResult, dc.width, availHeight);
                this._binWidth = result.binWidth;
                this._binHeight = result.binHeight;
                this._xMargin = result.xMargin;
                this._xBetween = result.xBetween;

                this.assignRecordsToBins(dc.nvData, facetResult, dc);
            }
        }

        layoutDataForRecord(itemIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var visibleIndex = 0;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[itemIndex]);

            if (!filtered)
            {
                visibleIndex = this._nextIndex++;
            }

            var binAssign = this._itemAssignments[itemIndex];

            var left = this._binLefts[binAssign];
            var bottom = this._binBottoms[binAssign];

            var heightFactor = this._heightFactor;
            var inverseSizeFactor = this._inverseSizeFactor;
            var trueHeight = Math.abs(heightFactor * this._itemHeights[itemIndex]);

            //---- layout as STACKED rectangles ----
            var x = left + this._binWidth / 2;          // place at horizontal center of shape
            var y = bottom + (heightFactor * this._itemBottoms[itemIndex]);

            y += trueHeight / 2;                        // place at vertical center of shape

            var z = 0;

            var height = inverseSizeFactor * trueHeight;
            var width = inverseSizeFactor * this._binWidth;      
            var depth = dc.defaultDepth2d;      // test out 3d cube in a 2d shape;

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
 