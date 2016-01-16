//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    densityCircle.ts - builds a density chart (2D histogram, with CIRCLE layout within each heatmap tile). 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class DensityCircle extends BaseGlVisClass
    {
        //---- all facet results ----
        _xFacetBinResults = null;
        _yFacetBinResults = null;

        _phyloSeed = 137.508;           // "golden angle"
        _radius = 0;
        _spacing = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape
        //_center = { x: 0, y: 0 };

        _binLefts: number[];
        _binTops: number[];

        _sideMargin = 0;
        _betweenMargin = 0;

        _itemWidth: number;
        _itemHeight: number;

        _binIndexesX: number[];
        _binIndexesY: number[];

        _binRelativeIndexes: number[];

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement, appMgr: AppMgrClass)
        {
            super("densityCircle", view, gl, chartState, container, appMgr);
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

        computeCircleParams(rcxWorld, maxRecordsInABin: number)
        {
            var xSize = this._itemWidth;
            var ySize = this._itemHeight;

            this._radius = Math.min(xSize, ySize);
            this._spacing = .5 * this._radius / Math.sqrt(maxRecordsInABin);

            this._nextIndex = 0;

            //this._center.x = (rcxWorld.right + rcxWorld.left) / 2;
            //this._center.y = (rcxWorld.bottom + rcxWorld.top) / 2;
        }

        assignRecordsToBins(nv: NamedVectors, resultX, resultY, dc: DrawContext)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----
            var filter = dc.layoutFilterVector;

            //var isFiltered = dc.data.isFilteredOutOfLayout();

            var allAssignX = resultX.assignments;
            var allAssignY = resultY.assignments;

            var binIndexesX = [];
            var binIndexesY = [];
            var binRelativeIndexes = [];

            var binCounts = {};              // will use string as our 3d index   (facet, x, y);

            for (var i = 0; i < filter.length; i++)
            {
                var shapeIndex = i;         // sri[i];        // process shape indexes, in sorted order

                if (! filter[shapeIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binIndexX = allAssignX[shapeIndex];
                    var binIndexY = allAssignY[shapeIndex];

                    binIndexesX[shapeIndex] = binIndexX;
                    binIndexesY[shapeIndex] = binIndexY;

                    //---- update bin COUNTS ----

                    //---- we are called once for each facet, so we don't need that in our countKey anymore ----
                    var countKey = binIndexX + "," + binIndexY;

                    if (binCounts[countKey] === undefined || binCounts[countKey] === null)
                    {
                        binCounts[countKey] = 0;
                    }

                    var binRelativeIndex = binCounts[countKey];
                    binRelativeIndexes[shapeIndex] = binRelativeIndex;

                    binCounts[countKey] = binRelativeIndex + 1;
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
            var keys = vp.utils.keys(binCounts);

            for (var k = 0; k < keys.length; k++)
            {
                var key = keys[k];
                var count = binCounts[key];
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

            var left = dc.x + this._sideMargin;
            for (var i = 0; i < binsX.length; i++)
            {
                binLefts[i] = left;
                left += (this._itemWidth + this._betweenMargin);
            }

            var top = dc.y + this._sideMargin + this._itemHeight;
            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = top;
                top += (this._itemHeight + this._betweenMargin);
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

            var sideMargin = .002 * dc.width;
            var betweenMargin = 3 * sideMargin;

            this._sideMargin = sideMargin;
            this._betweenMargin = betweenMargin;

            //---- compute itemWidth and itemHeight ----
            var itemWidth = (width - 2 * sideMargin - (xBinCount - 1) * betweenMargin) / xBinCount;
            var itemHeight = (height - 2 * sideMargin - (yBinCount - 1) * betweenMargin) / yBinCount;

            this._itemWidth = itemWidth;
            this._itemHeight = itemHeight;

            var maxRecordsInABin = this.assignRecordsToBins(nv, xResult, yResult, dc);

            var rcBin = vp.geom.createRect(this._binLefts[0], this._binTops[0], this._itemWidth, this._itemHeight);
            this.computeCircleParams(rcBin, maxRecordsInABin);
        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var rowIndex = 0;

            var layoutFilterVector = dc.layoutFilterVector;
            var filtered = (layoutFilterVector && layoutFilterVector[recordIndex]);

            if (!filtered)
            {
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

            var binRelativeIndex = this._binRelativeIndexes[recordIndex];

            var r = this._spacing * Math.sqrt(binRelativeIndex);
            var theta = Math.PI / 180 * (binRelativeIndex * this._phyloSeed);
            var x = cx + r * Math.sin(theta);
            var y = cy + r * Math.cos(theta);

            var z = 0;
            //var width = 1;      // scales.width._rangeMin;
            var width = dc.maxShapeSize * this.scaleColData(nv.size, recordIndex, dc.scales.size, 1);

            var height = width;
            var depth = dc.defaultDepth2d   ;

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
 