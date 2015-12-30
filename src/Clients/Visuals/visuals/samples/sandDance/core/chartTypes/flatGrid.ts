//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    flatGrid.ts - builds a GROD 2d layout of sand shapes.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class FlatGrid extends BaseGlVisClass
    {
        //---- all facets info ----
        _maxCountAllFacets = 0;

        _colCount = 0;
        _rowCount = 0;
        _nextIndex = 0;
        _maxShapeSize = 1;
        _itemSize = 0;

        constructor(view: DataViewClass, gl: any, chartState: any)
        {
            super("flatGrid", view, gl, chartState);

            this._hideAxes = true;
        }

        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            this._maxCountAllFacets = ChartUtils.computeMaxCountOverFacets(dc, nvFacetBuckets);
            this._itemSize = dc.itemSize;

            return this._maxCountAllFacets;
        }

        buildScales(nv: NamedVectors, rcxWorld, filteredRecordCount: number, facetCount: number)
        {
            var result = super.buildScales(nv, rcxWorld, filteredRecordCount, facetCount);
            var margin = this._itemSize/4;

            //---- override X and Y scales - force the domain to [0..1] ----
            result.x = utils.makeLinearScale(0, 1, rcxWorld.left + margin, rcxWorld.right - margin);
            result.y = utils.makeLinearScale(0, 1, rcxWorld.bottom + margin, rcxWorld.top - margin);

            return result;
        }

        preLayoutLoop(dc: DrawContext)
        {
            var maxCount = this._maxCountAllFacets;

            var aspect = dc.width / dc.height;
            var colCount = Math.ceil(Math.sqrt(aspect * maxCount));
            var rowCount = Math.ceil(maxCount / colCount);

            this._colCount = colCount;
            this._rowCount = rowCount;

            //---- use .85 to allow some space between shapes ----
            var maxShapeSize = .85 * Math.min(dc.width / this._colCount, dc.height / this._rowCount);
            this._maxShapeSize = maxShapeSize;      //   / dc.transformSizeFactor;

            this._nextIndex = 0;
        }

        /** "bufferIndex" in the 0-based indexed into the sorted data buffers. */
        layoutDataForRecord(bufferIndex: number, dc: DrawContext)
        {
            //---- flat grid layout ----
            var nv = dc.nvData;
            var scales = dc.scales;

            var filtered = (dc.layoutFilterVector && dc.layoutFilterVector[bufferIndex]);

            //---- "layoutIndex" is the index into the FILTERED-IN shapes that are being layed out in this plot. */
            var layoutIndex = 0;

            if (!filtered)
            {
                layoutIndex = this._nextIndex++;
            }

            var xData = layoutIndex % this._colCount;
            var yData = Math.floor(layoutIndex / this._colCount);

            var x = scales.x.scale((xData + .5)/this._colCount);
            var y = scales.y.scale((yData + .5)/this._rowCount);

            var z = 0;      

            var width = this._maxShapeSize * this.scaleColData(nv.size, bufferIndex, dc.scales.size, 1);
            var height = width;
            var depth = dc.defaultDepth2d;      // test out 3d cube in a 2d shape;

            var colorIndex = this.scaleColData(nv.colorIndex, bufferIndex, scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, bufferIndex, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }
    }
}
 