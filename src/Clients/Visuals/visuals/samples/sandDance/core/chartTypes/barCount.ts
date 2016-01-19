//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    barCount.ts - builds a sand Bar chart (unit histogram, where units are arranged in a grid within each column).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class BarCountClass extends BaseGlVisClass
    {
        //---- all facets info ----
        _facetBinResults: any[];
        _maxCountAllFacets = 0;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binTops: number[];
        _binWidths: number[];

        _itemWidth: number;
        _itemHeight: number;

        _shapesPerCol: number;
        _newColCount: number;
        _maxShapeSize: number;

        _rowToBinNum: number[];
        _rowToBinIndex: number[];

        _yMargin = 0;
        _yBetween = 0;

        _xMin = 0;                      // start of x space for our drawing (as per x scale)
        _xMax = 0;                      // end of x space for drawing (as per x scale)

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement, appMgr: AppMgrClass)
        {
            super("barCountClass", view, gl, chartState, container, appMgr);
        }

        /** Responsiblities: 
            1. compute max count for any bin, over all facets.  
            2. return max count
        */
        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            var facetHelper = dc.facetHelper;
            this._facetBinResults = [];
            var maxCount = 0;
            var ym = this._view.yMapping();

            if (facetHelper)
            {
                var facetCount = facetHelper.facetCount();

                for (var i = 0; i < facetCount; i++)
                {
                    var data = nvFacetBuckets[i];
                    var results = ChartUtils.computeMaxBinCountForData(dc, data, ym, "y");
                    this._facetBinResults.push(results.binResults);

                    maxCount = Math.max(maxCount, results.maxCount);
                }
            }
            else
            {
                var results = ChartUtils.computeMaxBinCountForData(dc, dc.nvData, ym, "y");

                this._facetBinResults.push(results.binResults);
                maxCount = results.maxCount;
            }

            //---- does client want to override max count? ----
            if (this._view.isMaxItemCountEnabled())
            {
                maxCount = this._view.maxItemCount();
            }

            this._maxCountAllFacets = maxCount;

            return maxCount;
        }

        /** Responsiblities: 
           1. adjust Y scale to reflect maxCount (across all facets).
           2. adjust X scale to reflect bin labels (on ticks, or in middle of ticks).
       */
        adjustScales(dc: DrawContext)
        {
            //---- adjust X scale ----
            this.xScaleAdjust(dc);

            //---- adjust Y scale ----
            var results = this._facetBinResults[0];
            dc.scales.y = ChartUtils.adjustScaleForBin(dc.scales.y, results);
        }

        /** create a new linear scale for X, based on the maximum count for a full bar. */
        xScaleAdjust(dc: DrawContext)
        {
            var oldScale = dc.scales.x;

            //---- adjust maxCount so that it represents a full bar, for our x scale max ----
            var maxCount = this._maxCountAllFacets;

            var binResults = this._facetBinResults;
            var yResult = binResults[0];

            let binCount: number = yResult && yResult.bins && yResult.bins.length
                ? yResult.bins.length
                : 0;

            //---- ESTIMATE itemWidth and itemHeight using full space of canvas ----
            this.preLayoutLoopCore(yResult, this._canvasWidth, this._canvasHeight, binCount);

            //---- NOTE: itemHeight is the height of a single bin container ----
            var aspect = this._itemWidth / this._itemHeight;
            //var aspect = this._itemHeight / this._itemWidth;

            var factor = Math.ceil(Math.sqrt(aspect * maxCount));
            var shapesPerCol = Math.ceil(maxCount / factor);

            var colCount = Math.ceil(maxCount / shapesPerCol);

            //---- lock these values in now ----
            this._shapesPerCol = shapesPerCol;
            this._newColCount = colCount;          

            //var maxCountForRow = rowCount * Math.ceil(maxCount / rowCount);

            var result = ChartUtils.computeBestCountFactor(maxCount, shapesPerCol);
            var maxCountForCol = result.maxCount;

            dc.scales.x = vp.scales.createLinear()
                .rangeMin(oldScale.rangeMin())
                .rangeMax(oldScale.rangeMax())
                .domainMin(0)
                .domainMax(maxCountForCol);

            //---- mark scale as being for chunk-based count ----
            var anyScale = <any>dc.scales.x;
            anyScale._tickCount = result.tickCount;

            dc.xCalcName = "_count";      // so we know this is a calc field
        }

        assignRecordsToBins(nv: NamedVectors, resultY, dc: DrawContext, maxBinCountForAllFacets: number)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector || [];

            var allAssignY = resultY
                ? resultY.assignments
                : [];

            var rowToBinNum = [];
            var rowToBinIndex = [];
            var binCounts = [];

            //---- process each (sorted) record ----
            for (var i = 0; i < filter.length; i++)
            {
                var recordIndex = i;    

                if (! filter[recordIndex])
                {
                    //--- assignments must be indexed by the recordIndex ----
                    var binIndexY = allAssignY[recordIndex];

                    rowToBinNum[recordIndex] = binIndexY;

                    if (binCounts[binIndexY] === undefined || binCounts[binIndexY] === null)
                    {
                        binCounts[binIndexY] = 0;
                    }

                    //---- this shape's index within its bin ----
                    rowToBinIndex[recordIndex] = binCounts[binIndexY];

                    binCounts[binIndexY] += 1;
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    rowToBinNum[recordIndex] = 0;
                    rowToBinIndex[recordIndex] = 0;
                }
            }

            var maxCount = maxBinCountForAllFacets;

            var width = dc.width;

            var binsY = resultY && resultY.bins
                ? resultY.bins
                : [];

            //---- build an array of the bin names for the xScale labels ----
            var binNamesY = [];
            for (var i = 0; i < binsY.length; i++)
            {
                binNamesY[i] = (<any> binsY[i]).name;
            }

            //---- create bounds for each BAR bin ----
            var binTops: number[] = [];
            var binWidths: number[] = [];

            var bottom = dc.y + this._yMargin;;        // dc.y - height + this._yMargin;
            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = bottom;
                if (binCounts[i] === undefined || binCounts[i] === null)
                {
                    binCounts[i] = 0;
                }

                binWidths[i] = binCounts[i] / maxCount * width;

                bottom += (this._itemHeight + this._yBetween);
            }

            this._binTops = binTops;
            this._binWidths = binWidths;
            this._rowToBinNum = rowToBinNum;
            this._rowToBinIndex = rowToBinIndex;

            //var colCount = this._shapesPerCol;          //  Math.ceil(Math.sqrt(aspect * maxCount));

            //this._colCount = colCount;
            //this._rowCount = rowCount;

            var maxShapeSize = this._itemWidth / this._newColCount;
            maxShapeSize = Math.min(maxShapeSize, .85 * this._itemHeight / this._shapesPerCol);
            this._maxShapeSize = maxShapeSize;      //  / dc.transformSizeFactor;

            vp.utils.debug("preLayoutLoopCore: itemWidth=" + this._itemWidth + ", itemHeight=" + this._itemHeight +
                ", maxShapeSize=" + this._maxShapeSize); 

            this._nextIndex = 0;
            return maxCount;
        }

        preLayoutLoop(dc: DrawContext)
        {
            //this.preLayoutLoopCore(dc, true);

            var shapesPerCol = this._shapesPerCol;
            var maxCountFullCol = shapesPerCol * Math.ceil(this._maxCountAllFacets / shapesPerCol);

            //---- don't use all of Y space; let scale determine boundaries ----
            //---- this is needed because sometimes scale may be larger than maxCount. ----
            //---- also, we should allow for optional expand space in range ----
            var xMin = dc.scales.x.scale(0);
            var xMax = dc.scales.x.scale(maxCountFullCol);

            this._xMin = xMin;
            this._xMax = xMax;

            var availWidth = xMax - xMin;
            var availHeight = dc.height;

            var binResults = this._facetBinResults;
            if (binResults && binResults.length)
            {
                var yResult = binResults[dc.facetIndex];

                let binCount: number = yResult && yResult.bins && yResult.bins.length
                    ? yResult.bins.length
                    : 0;

                this.preLayoutLoopCore(yResult, availWidth, availHeight, binCount);

                this.assignRecordsToBins(dc.nvData, yResult, dc, this._maxCountAllFacets);
            }
        }

        preLayoutLoopCore(yResult: BinResult, availWidth: number, availHeight: number, binCount: number)
        {
            var result = ChartUtils.computeBarBinSize(yResult, availWidth, availHeight);

            this._itemWidth = result.binWidth;
            this._itemHeight = result.binHeight;
            this._yMargin = result.yMargin;
            this._yBetween = result.yBetween;
        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[recordIndex]);

            var visibleIndex = 0;

            if (!filtered)
            {
                visibleIndex = this._nextIndex++;
            }

            var binIndexX = this._rowToBinNum[recordIndex];

            var top = this._binTops[binIndexX];
            var binWidth = this._binWidths[binIndexX];

            if (this._chartOptions.layout === "Random")
            {
                var xr = nv.randomX.values[recordIndex];
                var yr = nv.randomY.values[recordIndex];

                var x = dc.x + xr * binWidth;
                var y = top + yr * this._itemHeight;
            }
            else 
            {
                //---- GRID layout ----
                var indexInBin = this._rowToBinIndex[recordIndex];

                var rowNum = indexInBin % this._shapesPerCol;
                var colNum = Math.floor(indexInBin / this._shapesPerCol);

                //---- center shapes within their x-locations ----
                var x = dc.x + ((.5 + colNum) / this._newColCount) * this._itemWidth; 

                //---- center shapes relative to their row bottom ----
                var y = top + ((.5 + rowNum) / this._shapesPerCol) * this._itemHeight;
            }

            var scaleFactor = this.scaleColData(nv.size, recordIndex, dc.scales.size, 1);
            var width = this._maxShapeSize * scaleFactor;
            var height = width;

            var z = 0;
            var depth = dc.defaultDepth2d     ;

            var colorIndex = this.scaleColData(nv.colorIndex, recordIndex, dc.scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, recordIndex, dc.scales.imageIndex);
            var opacity = 1;

            return { 
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }
    }

}
 