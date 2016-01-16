//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    sandViolin.ts - builds a unit violin plot (2D histogram, with variable width, with RANDOM layout within each heatmap tile). 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class ViolinClass extends BaseGlVisClass
    {
        //---- all facet results ----
        _xFacetBinResults = null;
        _yFacetBinResults = null;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binLefts: number[];
        _binTops: number[];

        _maxBinWidth: number;
        _binWidths: number[];              // for violin plot, each bin has a unique width, based on its item count  (index=2 dim in a string)
        _binHeight: number;

        _boxWidth: number;                  // width of grid box (matches gridlines)
        _boxHeight: number;                 // height of grid box (matches gridlines)

        _binIndexesX: number[];
        _binIndexesY: number[];

        _xSpacing = 0;
        _ySpacing = 0;

        //_chartOptions = new sandDensityOptions(5, 5, "Circle");

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement, appMgr: AppMgrClass)
        {
            super("sandViolin", view, gl, chartState, container, appMgr);
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

            var filter = dc.layoutFilterVector;

            var allAssignX = resultX.assignments;
            var allAssignY = resultY.assignments;

            var binIndexesX = [];
            var binIndexesY = [];

            var binCounts = {};              // will use string as our 3d index   (facet, x, y);

            var facetAssignments = (dc.facetHelper) ? dc.facetHelper.binResult().assignments : null;
            var lastFacetIndex = 0;

            for (var i = 0; i < filter.length; i++)
            {
                var shapeIndex = i;         // sri[i];        // process shape indexes, in sorted order

                if (!filter[shapeIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binIndexX = allAssignX[shapeIndex];
                    var binIndexY = allAssignY[shapeIndex];

                    binIndexesX[shapeIndex] = binIndexX;
                    binIndexesY[shapeIndex] = binIndexY;

                    if (facetAssignments)
                    {
                        var facetIndex = facetAssignments[shapeIndex];
                        if (i === 0)
                        {
                            lastFacetIndex = facetIndex;
                        }
                        else
                        {
                            if (facetIndex !== lastFacetIndex)
                            {
                                vp.utils.debug("----> ERROR: facetIndex changed");
                            }
                        }
                    }

                    //---- update bin COUNTS ----

                    //---- we are called once for each facet, so we don't need that in our countKey anymore ----
                    var countKey = binIndexX + "," + binIndexY;

                    if (binCounts[countKey] === undefined || binCounts[countKey] === null)
                    {
                        binCounts[countKey] = 0;
                    }

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

            //---- create bounds for each bin ----
            var binLefts: number[] = [];
            var binTops: number[] = [];
            var binWidths: number[] = [];

            //---- compute binLefts[] ----
            var left = dc.x + (this._xSpacing / 2);

            for (var i = 0; i < binsX.length; i++)
            {
                binLefts[i] = left;
                left += this._boxWidth;
            }

            //---- compute binTops[] ----
            var top = dc.y + this._boxHeight - (this._ySpacing/2);

            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = top;
                top += this._boxHeight;
            }

            //---- compute binWidths[] ----
            for (var i = 0; i < binsX.length; i++)
            {
                for (var j = 0; j < binsY.length; j++)
                {
                    //---- compute width of this bin ----
                    var countKey = i + "," + j;
                    var count = binCounts[countKey];
                    if (count === undefined)        // no items in bin
                    {
                        count = 0;
                    }

                    var binWidth = vp.data.mapValue(count, 0, maxCount, 0, this._maxBinWidth);
                    binWidths[countKey] = binWidth;
                }
            }

            this._binLefts = binLefts;
            this._binTops = binTops;
            this._binWidths = binWidths;

            this._binIndexesX = binIndexesX;
            this._binIndexesY = binIndexesY;

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

            var xSpacing = .02 * dc.height;
            var ySpacing = .02 * dc.height;

            //---- compute itemWidth and itemHeight ----
            var boxWidth = dc.width / xBinCount;
            var boxHeight = dc.height / yBinCount;

            var itemWidth = Math.max(0, boxWidth - xSpacing);
            var itemHeight = Math.max(0, boxHeight - ySpacing);

            this._xSpacing = xSpacing;
            this._maxBinWidth = itemWidth;
            this._boxWidth = boxWidth;

            this._ySpacing = ySpacing;
            this._binHeight = itemHeight;
            this._boxHeight = boxHeight;

            this.assignRecordsToBins(nv, xResult, yResult, dc);
        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;

            var filtered = (dc.layoutFilterVector && dc.layoutFilterVector[recordIndex]);
            var rowIndex = 0;

            if (!filtered)
            {
                rowIndex = this._nextIndex++;
            }

            var binIndexX = this._binIndexesX[recordIndex];
            var binIndexY = this._binIndexesY[recordIndex];

            var left = this._binLefts[binIndexX];
            var top = this._binTops[binIndexY];

            var xr = nv.randomX.values[recordIndex];
            var yr = nv.randomY.values[recordIndex];

            var countKey = binIndexX + "," + binIndexY;
            var binWidth = this._binWidths[countKey];
            var innerLeft = left + (this._maxBinWidth / 2) - (binWidth / 2);

            var x = innerLeft + (xr * binWidth);
            var y = top - (yr * this._binHeight);

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