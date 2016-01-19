//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    densityGrid.ts - builds a density chart (2D histogram, with grid layout within each heatmap tile). 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class DensityGrid extends BaseGlVisClass
    {
        //---- all facet results ----
        _xFacetBinResults = null;
        _yFacetBinResults = null;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binLefts: number[];
        _binTops: number[];

        _itemWidth: number;
        _itemHeight: number;

        _binIndexesX: number[];
        _binIndexesY: number[];
        _binRelativeIndexes: number[];
        _hMargin = 0;
        _vMargin = 0;
        _hBetween = 0;
        _vBetween = 0;
        _binCounts: any;
        _xglobalmax = 1;
        _yglobalmax = 1;
        _xspace: number;
        _yspace: number;
        _space: number;
        _maxShapeSize: number;

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement, appMgr: AppMgrClass)
        {
            super("densityGrid", view, gl, chartState, container, appMgr);
        }

        /** Adjust scales as needed for our chart. */
        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            var facetHelper = dc.facetHelper;
            this._xFacetBinResults = [];
            this._yFacetBinResults = [];

            var xm = this._view.xMapping();
            var ym = this._view.yMapping();

            if (facetHelper)
            {
                var facetCount = facetHelper.facetCount();

                for (var i = 0; i < facetCount; i++)
                {
                    var data = nvFacetBuckets[i];

                    var xResults = ChartUtils.binTheDataForCount(dc, data, xm, "x");
                    this._xFacetBinResults.push(xResults);

                    var yResults = ChartUtils.binTheDataForCount(dc, data, ym, "y");
                    this._yFacetBinResults.push(yResults);
                }
            }
            else
            {
                var xResults = ChartUtils.binTheDataForCount(dc, dc.nvData, xm, "x");
                this._xFacetBinResults.push(xResults);

                var yResults = ChartUtils.binTheDataForCount(dc, dc.nvData, ym, "y");
                this._yFacetBinResults.push(yResults);
            }

            //---- adjust X scale ----
            dc.scales.x = ChartUtils.adjustScaleForBin(dc.scales.x, xResults);

            //---- adjust Y scale ----
            dc.scales.y = ChartUtils.adjustScaleForBin(dc.scales.y, yResults);

            return dc.filteredRecordCount;
        }

        assignRecordsToBins(nv: NamedVectors, resultX, resultY, dc: DrawContext)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector || [];

            var allAssignX = resultX.assignments;
            var allAssignY = resultY.assignments;

            var binIndexesX = [];
            var binIndexesY = [];
            var binRelativeIndexes = [];

            this._binCounts = {};              // will use string as our 3d index   (facet, x, y);

            for (var i = 0; i < filter.length; i++)
            {
                var shapeIndex = i;     // sri[i];        // process shape indexes, in sorted order

                if (! filter[shapeIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binIndexX = allAssignX[shapeIndex];
                    var binIndexY = allAssignY[shapeIndex];

                    binIndexesX[shapeIndex] = binIndexX;
                    binIndexesY[shapeIndex] = binIndexY;

                    //---- we are called once for each facet, so we don't need that in our countKey anymore ----
                    var countKey = binIndexX + "," + binIndexY;

                    if (this._binCounts[countKey] === undefined || this._binCounts[countKey] === null)
                    {
                        this._binCounts[countKey] = 0;
                    }

                    //binIndexes[shapeIndex] = binCounts[countKey];

                    this._binCounts[countKey] += 1;
                    var binRelativeIndex = this._binCounts[countKey];
                    binRelativeIndexes[shapeIndex] = binRelativeIndex;
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    binIndexesX[shapeIndex] = 0;
                    binIndexesY[shapeIndex] = 0;
                }
            }

            //---- find max # of entries in any bin ----
            var maxCount = 0;
            var keys = vp.utils.keys(this._binCounts);

            for (var k = 0; k < keys.length; k++)
            {
                var key = keys[k];
                var count = this._binCounts[key];
                maxCount = Math.max(count, maxCount);
            }

            var binsX = resultX.bins;
            var binsY = resultY.bins;

            //---- build an array of the bin names for the xScale labels ----
            var binNamesX = [];
            for (var i = 0; i < binsX.length; i++)
            {
                binNamesX[i] = (<any> binsX[i]).name;
            }

            var binNamesY = [];
            for (var i = 0; i < binsY.length; i++)
            {
                binNamesY[i] = (<any> binsY[i]).name;
            }

            //---- create bounds ----
            var binLefts: number[] = [];
            var binTops: number[] = [];

            var left = dc.x + this._hMargin;
            for (var i = 0; i < binsX.length; i++)
            {
                binLefts[i] = left;
                left += (this._itemWidth + this._hBetween);
            }

            var top = dc.y + this._vMargin + this._itemHeight;
            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = top;
                top += (this._itemHeight + this._vBetween);
            }

            this._binLefts = binLefts;
            this._binTops = binTops;

            this._binIndexesX = binIndexesX;
            this._binIndexesY = binIndexesY;

            this._binRelativeIndexes = binRelativeIndexes;

         

            return maxCount;
        }

        preLayoutLoop(dc: DrawContext)
        {
            var nv = dc.nvData;

            //---- use pre-computed bins ----
            var xResult = this._xFacetBinResults[dc.facetIndex];
            var yResult = this._yFacetBinResults[dc.facetIndex];

            var xBinCount = xResult.bins.length;
            var yBinCount = yResult.bins.length;

            var width = dc.width;
            var height = dc.height;

            var hMargin = 2 * dc.itemSize;
            var hBetween = .1 * (dc.width / xBinCount);

            var vMargin = 2 * dc.itemSize;
            var vBetween = .2 * (dc.height / yBinCount);

            this._hMargin = hMargin;
            this._hBetween = hBetween;

            this._vMargin = vMargin;
            this._vBetween = vBetween;

            //---- compute itemWidth and itemHeight ----
            var itemWidth = (width - 2 * hMargin - (xBinCount - 1) * hBetween) / xBinCount;
            var itemHeight = (height - 2 * vMargin - (yBinCount - 1) * vBetween) / yBinCount;

            this._itemWidth = itemWidth;
            this._itemHeight = itemHeight;

            var maxRecordsInABin = this.assignRecordsToBins(nv, xResult, yResult, dc);
            this._maxCount = maxRecordsInABin;
            this._xglobalmax = Math.max(Math.ceil(Math.sqrt(this._maxCount)), 1);
            this._yglobalmax = Math.max(Math.ceil(this._maxCount / this._xglobalmax), 1);
            this._xspace = this._itemWidth / (this._xglobalmax);
            this._yspace = this._itemHeight / (this._yglobalmax);
            this._space = Math.min(this._xspace, this._yspace);
            var maxShapeSize = Math.min(.85 * this._itemWidth / this._xglobalmax, .85 * this._itemHeight / this._yglobalmax);
            this._maxShapeSize = maxShapeSize;          //   / dc.transformSizeFactor;

        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var rowIndex = 0;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[recordIndex]);

            if (!filtered) {
                rowIndex = this._nextIndex++;
            }

            var binIndexX = this._binIndexesX[recordIndex];
            var binIndexY = this._binIndexesY[recordIndex];

            var left = this._binLefts[binIndexX];
            var top = this._binTops[binIndexY];

            var cx = left + this._itemWidth / 2;
            var cy = top - this._itemHeight / 2;

            //var cx = this._center.x;
            //var cy = this._center.y;

            var binRelativeIndex = this._binRelativeIndexes[recordIndex]-1;

            var countKey = binIndexX + "," + binIndexY;

            var binCount = 0;
            if (this._binCounts[countKey] === undefined || this._binCounts[countKey] === null) {
                binCount = 0;
            } else {
                binCount = this._binCounts[countKey];
            }

/*
            var xglobalmax = Math.max(Math.ceil(Math.sqrt(this._maxCount)), 1);
            var yglobalmax = Math.max(Math.ceil(this._maxCount / xglobalmax), 1);
            var xspace = this._itemWidth / xglobalmax;
            var yspace = this._itemHeight / yglobalmax;

            var xrel = binRelativeIndex % xglobalmax;
            var yrel = Math.floor(binRelativeIndex / yglobalmax);

            var x = left + xrel * xspace;
            var y = top - yrel * yspace;
  */

            var xlocalmax = Math.max(Math.ceil(Math.sqrt(binCount)), 1);
            var ylocalmax = Math.max(Math.ceil(binCount / xlocalmax), 1);
            /*
            var maxWidth = xlocalmax * this._xspace;
            var maxHeight = ylocalmax * this._yspace;
*/
            var maxWidth = xlocalmax * this._space;
            var maxHeight = ylocalmax * this._space;

            var xrel = binRelativeIndex % xlocalmax;
            var yrel = Math.floor(binRelativeIndex / xlocalmax);

            /*
            var x = cx + this._hMargin - maxWidth / 2 + xrel * this._xspace;
            var y = cy - this._vMargin + maxHeight/2 - yrel * this._yspace;
*/

            var width = this._maxShapeSize;
            var height = width;
            var depth = dc.defaultDepth2d   ;

            var x = cx - maxWidth/ 2.0 + xrel * this._space ;
            var y = cy + maxHeight/2.0 - yrel * this._space ;

            var z = 0;
            // var width = 1;      // scales.width._rangeMin;
            // var height = width;

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
 