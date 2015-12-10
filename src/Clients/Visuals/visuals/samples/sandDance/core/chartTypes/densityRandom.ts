//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    densityRandom.ts - builds a density chart (2D histogram, with RANDOM layout within each heatmap tile). 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    export class densityRandom extends baseGlVisClass
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

        _hMargin = 0;
        _vMargin = 0;
        _hBetween = 0;
        _vBetween = 0;

        constructor(view: dataViewClass, gl: any, chartState: any)
        {
            super("densityRandom", view, gl, chartState);
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

                    var xResults = chartUtils.binTheDataForCount(dc, data, xm, "x");
                    this._xFacetBinResults.push(xResults);

                    var yResults = chartUtils.binTheDataForCount(dc, data, ym, "y");
                    this._yFacetBinResults.push(yResults);
                }
            }
            else
            {
                var xResults = chartUtils.binTheDataForCount(dc, dc.nvData, xm, "x");
                this._xFacetBinResults.push(xResults);

                var yResults = chartUtils.binTheDataForCount(dc, dc.nvData, ym, "y");
                this._yFacetBinResults.push(yResults);
            }

            //---- adjust X scale ----
            dc.scales.x = chartUtils.adjustScaleForBin(dc.scales.x, xResults);

            //---- adjust Y scale ----
            dc.scales.y = chartUtils.adjustScaleForBin(dc.scales.y, yResults);

            return dc.filteredRecordCount;
        }

        assignRecordsToBins(nv: NamedVectors, resultX, resultY, dc: DrawContext)
        {
            //---- determine each item's position ("itemIndex") within its bin ----
            //---- for this part, we need to process the items in their sorted order ----

            var filter = dc.layoutFilterVector;
            var isFiltered = (filter != null);

            var allAssignX = resultX.assignments;
            var allAssignY = resultY.assignments;

            var binIndexesX = [];
            var binIndexesY = [];

            var binCounts = {}              // will use string as our 3d index   (facet, x, y)

            var facetAssignments = (dc.facetHelper) ? dc.facetHelper.binResult().assignments : null;

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

                    if (binCounts[countKey] === undefined)
                    {
                        binCounts[countKey] = 0;
                    }

                    //binIndexes[shapeIndex] = binCounts[countKey];

                    binCounts[countKey] += 1;
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

            var width = dc.width;
            var height = dc.height;

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

            var top = (dc.y - height) + this._vMargin + this._itemHeight;
            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = top;
                top += (this._itemHeight + this._vBetween);
            }

            this._binLefts = binLefts;
            this._binTops = binTops;

            this._binIndexesX = binIndexesX;
            this._binIndexesY = binIndexesY;

            return maxCount;
        }

        preLayoutLoop(dc: DrawContext)
        {
            var options = <sandDensityOptions>this._chartOptions;
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

            var ySpace = .1 * itemHeight;
            var binHeight = itemHeight - ySpace;

            this._itemWidth = itemWidth;
            this._itemHeight = itemHeight;

            var maxRecordsInABin = this.assignRecordsToBins(nv, xResult, yResult, dc);

            var rcBin = vp.geom.createRect(this._binLefts[0], this._binTops[0], this._itemWidth, this._itemHeight);
        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;

            var layoutFilterVector = dc.layoutFilterVector;

            var filtered = (dc.layoutFilterVector && dc.layoutFilterVector[recordIndex]);
            var rowIndex = 0;

            if (!filtered)
            {
                rowIndex = this._nextIndex++;
            }

            //var trueRecordIndex = nv.recordIndex[recordIndex];

            var binIndexX = this._binIndexesX[recordIndex];
            var binIndexY = this._binIndexesY[recordIndex];
            
            var left = this._binLefts[binIndexX];
            var top = this._binTops[binIndexY];

            var xr = nv.randomX.values[recordIndex];
            var yr = nv.randomY.values[recordIndex];
            var x = left + xr * this._itemWidth;
            var y = top - yr * this._itemHeight;

            var z = 0;
            //var width = 1;      // scales.width._rangeMin;
            var width = dc.maxShapeSize * this.scaleColData(nv.size, recordIndex, dc.scales.size, 1);

            var height = width;
            var depth = dc.defaultDepth2d   

            var colorIndex = this.scaleColData(nv.colorIndex, recordIndex, dc.scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, recordIndex, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }
    }

    export class sandDensityOptions
    {
        columns: number;
        rows: number;
        layout: string;

        constructor(columns: number, rows: number, layout: string)
        {
            this.columns = columns;
            this.rows = rows;
            this.layout = layout;
        }
    }

}
 