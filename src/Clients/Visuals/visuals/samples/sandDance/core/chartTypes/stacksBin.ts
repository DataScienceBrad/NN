//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    stacksBins.ts - builds a stacked (in Z) 2D histogram, wheere each stack in a set of NxN substacks.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class StacksBinClass extends BaseGlVisClass
    {
        //---- all facet results ----
        _xFacetBinResults = null;
        _yFacetBinResults = null;

        _maxCount = 0;
        _nextIndex = 0;         // index to assigned to next unfiltered shape

        _binLefts: number[];
        _binTops: number[];

        _binWidth: number;
        _binHeight: number;
        _binDepth: number;

        _space: number;
        _maxCubesInAStack: number;

        //---- item SIZE and OFFSET ----
        _itemWidth: number;
        _itemHeight: number;
        _leftOff: number;
        _topOff: number;

        _binIndexesX: number[];     // for each shape, its index into x bins
        _binIndexesY: number[];     // for each shape, its index into y bins
        _stackIndexes: number[];    // for each shape, its stacking index in its xy bin (assuming stacking layout of 1x1)

        _hMargin = 0;
        _vMargin = 0;
        _hBetween = 0;
        _vBetween = 0;

        constructor(view: DataViewClass, gl: any, chartState: any, container: HTMLElement, appMgr: AppMgrClass)
        {
            super("stacksBinClass", view, gl, chartState, container, appMgr);

            //---- initially rotate about X axis 45 degrees for perspective view ----
            this._view.getTransformMgr().rotateMatrixX(Math.PI / 4.0, false, false);
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
                var allData = dc.nvData;

                var xResults = ChartUtils.binTheDataForCount(dc, allData, xm, "x");
                this._xFacetBinResults.push(xResults);

                var yResults = ChartUtils.binTheDataForCount(dc, allData, ym, "y");
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
            var binWidthCount = this._view.zMapping().binCount;
            var binHeightCount = this._view.zMapping().binCount;

            var filter = dc.layoutFilterVector;

            var allAssignX = resultX.assignments;
            var allAssignY = resultY.assignments;

            var binIndexesX = [];
            var binIndexesY = [];
            var stackIndexes = [];

            var binCounts = {};              // will use string as our 3d index   (facet, x, y);

            for (var i = 0; i < filter.length; i++)
            {
                var shapeIndex = i;     // sri[i];        // process shape indexes, in sorted order

                if (!filter[shapeIndex])
                {
                    //--- assignments must be indexed by the shapeIndex ----
                    var binIndexX = allAssignX[shapeIndex];
                    var binIndexY = allAssignY[shapeIndex];

                    binIndexesX[shapeIndex] = binIndexX;
                    binIndexesY[shapeIndex] = binIndexY;

                    //---- we are called once for each facet, so we don't need that in our countKey anymore ----
                    var countKey = binIndexX + "," + binIndexY;

                    if (binCounts[countKey] === undefined || binCounts[countKey] === null)
                    {
                        binCounts[countKey] = 0;
                    }

                    stackIndexes[shapeIndex] = binCounts[countKey];
                    binCounts[countKey] += 1;
                }
                else
                {
                    //---- generate data for these items but don't include in layout ----
                    binIndexesX[shapeIndex] = 0;
                    binIndexesY[shapeIndex] = 0;
                    stackIndexes[shapeIndex] = 0;
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

            //---- number of cubes in a stack should be a whole number ----
            var maxCubesInAStack = Math.ceil(maxCount / (binWidthCount * binHeightCount));
            this._maxCubesInAStack = maxCubesInAStack;

            var binDepth = dc.depth / maxCubesInAStack;
            //binDepth = Math.min(this._itemWidth, this._itemHeight, binDepth);

            this._binDepth = binDepth;

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
                left += (this._binWidth + this._hBetween);
            }

            var top = dc.y + this._vMargin + this._binHeight;
            for (var i = 0; i < binsY.length; i++)
            {
                binTops[i] = top;
                top += (this._binHeight + this._vBetween);
            }

            this._binLefts = binLefts;
            this._binTops = binTops;

            this._binIndexesX = binIndexesX;
            this._binIndexesY = binIndexesY;
            this._stackIndexes = stackIndexes;

            return maxCount;
        }

        preLayoutLoop(dc: DrawContext)
        {
            var binWidthCount = this._view.zMapping().binCount;
            var binHeightCount = this._view.zMapping().binCount;

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
            var binWidth = (width - 2 * hMargin - (xBinCount - 1) * hBetween) / xBinCount;
            var binHeight = (height - 2 * vMargin - (yBinCount - 1) * vBetween) / yBinCount;

            var ySpace = .1 * binHeight;
            var binHeight = binHeight - ySpace;

            //---- limit size, so we don't get slow ----
            this._binWidth = binWidth;
            this._binHeight = binHeight;
            var innerMargin = .001; // ??? what should inner margin be?
            var innerBetween = .001; // ?? what should innerBetween be?
            var potItemWidth = (binWidth - 2 * innerMargin - (binWidthCount - 1) * innerBetween) / binWidthCount;
            var potItemHeight = (binHeight - 2 * innerMargin - (binHeightCount - 1) * innerBetween) / binHeightCount;
            this._itemWidth = Math.min(potItemWidth, potItemHeight);
            this._itemHeight = Math.min(potItemWidth, potItemHeight);
            // this._itemWidth = Math.min(.2, binWidth);
            // this._itemHeight = Math.min(.2, binHeight);
            this._space = Math.min(1.1 * this._itemWidth, 1.1 * this._itemHeight);
            this._leftOff = (binWidth - this._itemWidth) / 2;
            this._topOff = (binHeight - this._itemHeight) / 2;

            this.assignRecordsToBins(nv, xResult, yResult, dc);
        }

        layoutDataForRecord(recordIndex: number, dc: DrawContext)
        {
            var stackWidth = this._view.zMapping().binCount;
            var stackHeight = this._view.zMapping().binCount;
            var nv = dc.nvData;

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

            //---- stackIndex in an index into a 1x1 stack; must adjust for our stackWidth and stackHeight ----
            var stackIndex = this._stackIndexes[recordIndex];
            var zlocalmax = stackWidth * stackHeight;

            var layernum = Math.floor(stackIndex / zlocalmax);
            var layerindex = stackIndex % zlocalmax;

            var xrel = layerindex % stackWidth;
            var yrel = Math.floor(layerindex / stackWidth);

            var height = width;

            var x = left + (xrel * this._space);
            var y = top + (yrel * this._space);
            // var z = -2.0 + (layernum * this._itemHeight * 1.1);

            var width = Math.abs(this._itemWidth);
            var height = Math.abs(this._itemHeight);

            var stackDepth = this._binDepth;

            if (this._chartOptions.layout === "Cubes")
            {
                //----- make the shapes as close to cubes as possible ----
                stackDepth = 1.1 * Math.abs(width);
                var cubeDepth = width;
            }
            else
            {
                //----- try to make the tallest column fill our z-range (this is the current "Stacks" view) ----

                //---- support for variable size columns (most useful if stackcount=1) ----
                if (nv.size && nv.size.count)
                {
                    width = width * this.scaleColData(nv.size, recordIndex, dc.scales.size, 1);
                    height = width;
                }

                //---- this keeps the shapes from becomming too distorted, so we don't always fill the space ----
                stackDepth = Math.min(this._binDepth, width);

                var cubeDepth = .9 * stackDepth;
            }

            var z = dc.z + (layernum * stackDepth) + stackDepth / 2;

            // var z = -2.0 + (layernum * depth * 1.1);

            //if (recordIndex == 0)
            //{
            //    vp.utils.debug("x = " + x + " y = " + y + " z = " + z + " width = " + width + " height = " + height + " depth = " + stackDepth);
            //}

            var colorIndex = this.scaleColData(nv.colorIndex, recordIndex, dc.scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, recordIndex, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: cubeDepth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }

    }
}