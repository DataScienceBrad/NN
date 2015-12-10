//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    columnCount.ts - builds a sand Column chart (unit histogram, where units are arranged in a grid within each column).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    /** this chart groups the items into N bins (using the X column), and then lays out the item's shapes in a grid for each column. All layout is 
     * done based on "_maxCountAllFacets" - the maximum # of items in any bin (across all facets).  This determines the "_shapesPerRow" 
     * and the "_rowCount".  Each column then drawn according to these variables.
      */
    export class columnCountClass extends baseGlVisClass
    {
        //---- all facets info ----
        _facetBinResults: any[];
        _maxCountAllFacets = 0;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binLefts: number[];
        _binHeights: number[];

        _binWidth: number;     // width of a single bin of shapes (each column of shapes) (across facets)
        _binHeight: number;    // height of a single bin (max height of any column) (across facets)
        _maxShapeWidth = 1;
        _maxShapeHeight = 1;

        _shapesPerRow: number;      // max # of shapes in a row of a column
        _rowCount: number;          // max # of rows in a column

        _rowToBinNum: number[];
        _rowToBinIndex: number[];

        _xMargin = 0;

        _yMin = 0;                      // bottom of y space for our drawing (as per y scale)
        _yMax = 0;                      // top of y space for drawing (as per y scale)

        _xBetween = 0;

        constructor(view: dataViewClass, gl: any, chartState: any)
        {
            super("columnCountClass", view, gl,chartState);
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
            var xm = this._view.xMapping();

            if (facetHelper)
            {
                var facetCount = facetHelper.facetCount();

                for (var i = 0; i < facetCount; i++)
                {
                    var data = nvFacetBuckets[i];
                    var results = chartUtils.computeMaxBinCountForData(dc, data, xm, "x");
                    this._facetBinResults.push(results.binResults);

                    maxCount = Math.max(maxCount, results.maxCount);
                }
            }
            else
            {
                var results = chartUtils.computeMaxBinCountForData(dc, dc.nvData, xm, "x");

                this._facetBinResults.push(results.binResults);
                maxCount = results.maxCount;
            }

            //---- does client want to override max count? ----
            if (this._view.isMaxItemCountEnabled())
            {
                maxCount = this._view.maxItemCount();
            }

            //vp.utils.debug("columnClass.computeFacetStats: dc.filteredCount=" + dc.filteredRecordCount + ", maxBinCountForAllFacets=" + maxCount);

            this._maxCountAllFacets = maxCount;

            return maxCount;
        }

        /** Responsiblities: 
            1. adjust Y scale to reflect maxCount (across all facets).
            2. adjust X scale to reflect bin labels (on ticks, or in middle of ticks).
        */
        adjustScales(dc: DrawContext)
        {
            //---- adjust X scale to reflect BINS ----
            var results = this._facetBinResults[0];
            dc.scales.x = chartUtils.adjustScaleForBin(dc.scales.x, results);

            //---- adjust Y scale to reflect MAX COUNT ----
            this.yScaleAdjust(dc);
        }

        /** create a new linear scale for Y, based on the maximum count for a full column. */
        yScaleAdjust(dc: DrawContext)
        {
            var oldScale = dc.scales.y;

            //---- adjust maxCount so that it represents a full column, for our y scale max ----
            var maxCount = this._maxCountAllFacets;

            var binResults = this._facetBinResults;
            if (binResults && binResults.length)
            {
                var xResult = binResults[0];

                //---- ESTIMATE itemWidth and itemHeight using full space of canvas ----
                this.preLayoutLoopCore(xResult, this._canvasWidth, this._canvasHeight, xResult.bins.length);   
            }

            var binAspect = this._binWidth / this._binHeight;
            var shapesPerRow = Math.ceil(Math.sqrt(binAspect * maxCount));
            this._shapesPerRow = shapesPerRow;          // lock this value in now for consistent results

            //vp.utils.debug("maxCount=" + maxCount + ", aspect=" + aspect + ", shapesPerRow=" + shapesPerRow);

            var result = chartUtils.computeBestCountFactor(maxCount, shapesPerRow);
            var maxCountForCol = result.maxCount;

            //---- range may not be set for oldScale since it probably didn't have an associated data column ----
            var rangeMin = dc.y;        // - dc.height;
            var rangeMax = dc.y + dc.height;

            dc.scales.y = vp.scales.createLinear()
                .rangeMin(rangeMin)
                .rangeMax(rangeMax)
                .domainMin(0)
                .domainMax(maxCountForCol)

            //---- mark scale as having pre-computed tickCount ----
            var anyScale = <any>dc.scales.y;
            anyScale._tickCount = result.tickCount;

            dc.yCalcName = "_count";      // so we know this is a calc field
        }

        assignRecordsToBins(nv: NamedVectors, resultX, dc: DrawContext, maxBinCountForAllFacets: number)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector;
            var isFiltered = (filter != null);

            var allAssignX = resultX.assignments;

            var rowToBinNum = [];
            var rowToBinIndex = [];
            var binCounts = [];

            var facetAssignments = (dc.facetHelper) ? dc.facetHelper.binResult().assignments : null;

            //vp.utils.debug("columnClass.assignRecordsToBins: dc.filteredCount=" + dc.filteredRecordCount + ", maxBinCountForAllFacets=" + maxBinCountForAllFacets);

            //---- process each (sorted) record ----
            for (var i = 0; i < dc.recordCount; i++)
            {
                var shapeIndex = i;    

                if (! isFiltered || ! filter[shapeIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binIndexX = allAssignX[shapeIndex];

                    rowToBinNum[shapeIndex] = binIndexX;

                    if (binCounts[binIndexX] === undefined)
                    {
                        binCounts[binIndexX] = 0;
                    }

                    //---- this shape's index within its bin ----
                    rowToBinIndex[shapeIndex] = binCounts[binIndexX];

                    binCounts[binIndexX] += 1;
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    rowToBinNum[shapeIndex] = 0;
                    rowToBinIndex[shapeIndex] = 0;
                }
            }

            var maxCount = maxBinCountForAllFacets;

            var width = dc.width;
            var height = this._yMax - this._yMin;        //  dc.height;

            var binsX = resultX.bins;

            //---- build an array of the bin names for the xScale labels ----
            var binNamesX = [];
            for (var i = 0; i < binsX.length; i++)
            {
                binNamesX[i] = (<any> binsX[i]).name;
            }

            //---- create bounds ----
            var binLefts: number[] = [];
            var binHeights: number[] = [];

            var left = dc.x + this._xMargin;

            for (var i = 0; i < binsX.length; i++)
            {
                binLefts[i] = left;
                binHeights[i] = binCounts[i] / maxCount * height;

                left += (this._binWidth + this._xBetween);
            }

            this._binLefts = binLefts;
            this._binHeights = binHeights;
            this._rowToBinNum = rowToBinNum;
            this._rowToBinIndex = rowToBinIndex;

            //---- set up GRID params ----
            var shapesPerRow = this._shapesPerRow;      // use precomputed (locked in) value  
            var rowCount = Math.ceil(maxCount / shapesPerRow);
            //this._colCount = colCount;
            this._rowCount = rowCount;

            var maxShapeWidth = .85 * this._binWidth / this._shapesPerRow;
            var maxShapeHeight = .85 * this._binHeight / this._rowCount;

            this._maxShapeWidth = maxShapeWidth;        //  / dc.transformSizeFactor;
            this._maxShapeHeight = maxShapeHeight;      //  / dc.transformSizeFactor;

            //vp.utils.debug("assignRecordsToBins: itemWidth=" + this._itemWidth + ", itemHeight=" + this._itemHeight + ", shapesPerRow=" + shapesPerRow +
            //    ", rowCount = " + rowCount + ", maxShapeWidth=" + maxShapeWidth); 

            this._nextIndex = 0;
            return maxCount;
        }

        preLayoutLoop(dc: DrawContext)
        {
            var shapesPerRow = this._shapesPerRow;
            var maxCountFullRow = shapesPerRow * Math.ceil(this._maxCountAllFacets / shapesPerRow);

            //---- don't use all of Y space; let scale determine boundaries ----
            //---- this is needed because sometimes scale may be larger than maxCount. ----
            //---- also, we should allow for optional expand space in range ----
            var yMin = dc.scales.y.scale(0);
            var yMax = dc.scales.y.scale(maxCountFullRow);

            this._yMin = yMin;
            this._yMax = yMax;

            var availWidth = dc.width;
            var availHeight = yMax - yMin;

            var binResults = this._facetBinResults;
            if (binResults && binResults.length)
            {
                var xResult = binResults[dc.facetIndex];

                this.preLayoutLoopCore(xResult, availWidth, availHeight, xResult.bins.length);

                this.assignRecordsToBins(dc.nvData, xResult, dc, this._maxCountAllFacets);
            }
        }

        preLayoutLoopCore(xResult: BinResult, availWidth: number, availHeight: number, binCount: number)
        {
            var result = chartUtils.computeColumnBinSize(xResult, availWidth, availHeight);

            this._binWidth = result.binWidth;
            this._binHeight = result.binHeight;
            this._xMargin = result.xMargin;
            this._xBetween = result.xBetween;
        }

        /** "bufferIndex" in the 0-based indexed into the sorted data buffers. */
        layoutDataForRecord(bufferIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var visibleIndex = 0;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[bufferIndex]);

            if (!filtered)
            {
                visibleIndex = this._nextIndex++;
            }

            var binIndexX = this._rowToBinNum[bufferIndex];

            var left = this._binLefts[binIndexX];
            //var bottom = dc.y - dc.height;
            var bottom = this._yMin;
            var binHeight = this._binHeights[binIndexX];

            if (this._chartOptions.layout == "Random")
            {
                var xr = nv.randomX.values[bufferIndex];
                var yr = nv.randomY.values[bufferIndex];
                var x = left + xr * this._binWidth;
                var y = bottom + yr * binHeight;
            }
            else 
            {
                //---- GRID layout ----
                var indexInBin = this._rowToBinIndex[bufferIndex];
                var colNum = indexInBin % this._shapesPerRow;
                var rowNum = Math.floor(indexInBin / this._shapesPerRow);

                //---- center shapes within their x-locations ----
                var x = left + ((.5 + colNum)/this._shapesPerRow) * this._binWidth; 

                //---- center shapes relative to their row bottom ----
                var y = bottom + ((.5 + rowNum) / this._rowCount) * this._binHeight;
            }

            var scaleFactor = this.scaleColData(nv.size, bufferIndex, dc.scales.size, 1);
            var width = this._maxShapeWidth * scaleFactor;
            var height = this._maxShapeHeight * scaleFactor;

            var z = 0;
            var depth = dc.defaultDepth2d     

            var colorIndex = this.scaleColData(nv.colorIndex, bufferIndex, dc.scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, bufferIndex, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
       }
    }
}
 