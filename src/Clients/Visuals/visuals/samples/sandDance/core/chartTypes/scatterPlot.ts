//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    scatterPlot.ts - builds a 2D scatter plot of sand shapes.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    ///-------------------------------------------------------------------------------------------------------------------------------------
    /// Chart Layout rules:
    ///     1. to honor the 2-stage filter, only layout the records not removed by dc.layoutFilterVector.
    ///     2. dc.filteredRecordCount correctly counts the filtered-in records (as per the 2-stage filter)
    ///     3. honor facets by using dc.x, dc.y, dc.width, dc.height for the bounds of the facet/chart
    ///     4. CAUTION with overriding "buildScales()" since it is called TWICE (computeFacetStats & final scales) (not per facet)
    ///     5. If you build info for shapes, be consistent with its index (suggest using true shapeIndex rather than facet-relative index)
    ///     6. use "computeFacetStats(dc, data)" for operations across facets (like maxBinCount used by Column chart) AND to adjust scales.
    ///-------------------------------------------------------------------------------------------------------------------------------------

    ///-------------------------------------------------------------------------------------------------------------------------------------
    /// BaseGLVis layout steps:     (charts should override the CHART.xxx() calls)
    ///     - prepassAndFrameBuild()
    ///         - buildNamedVectors()
    ///
    ///         - //---- build PREPASS info ----
    ///         - updateChartBounds()       // with 0 size chartFrame
    ///         - calcRanges()
    ///         - buildScales()
    ///         - dc = new DrawContext()
    ///         - CHART.computeFacetStats()               // chart should compute stats across all facets
    ///         - CHART.adjustScales()
    ///         - chartFrameHelper.build()      // build Y and X axes
    ///
    ///         - //---- build FINAL info ----
    ///         - updateChartBounds()           // finalize space for plot area
    ///         - calcRanges()
    ///         - buildScales()                 // build scales using finalized space
    ///         - dc = new DrawContext()
    ///         - CHART.adjustScales()          // adjust scales
    ///     - getAttributesForCycle()
    ///     - getNamedBuffers()
    ///     - for each facet:
    ///         - layoutChartOrFacet()              
    ///             - CHART.preLayoutLoop()
    ///             - for each record:
    ///                 - CHART.layoutDataForRecord()
    ///                 - processRecord()
    ///                 - fillBuffersForRecord()
    ///             - fillGridLinesBuffer()
    ///-------------------------------------------------------------------------------------------------------------------------------------
    export class scatterPlotClass extends baseGlVisClass
    {
        _maxShapeSize = 0;
        _halfSizeSize = 0;
        _z = 0;

        constructor(view: dataViewClass, gl: any, chartState: any)
        {
            super("scatterPlotClass", view, gl, chartState);
        }

        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            //---- this call modifies the PREPASS scales (for use by the chart frame) ----
            this.modifyXYScales(dc);

            return dc.filteredRecordCount;
        }

        modifyXYScales(dc: DrawContext, halfShapeSize?: number)
        {
            //---- add spacing on both sides of X and Y scales to keep shapes within the borders ----
            if (!halfShapeSize)
            {
                halfShapeSize = (dc.maxShapeSize / 2);      //  * dc.transformSizeFactor;       //  dc.combinedSizeFactor;

                //---- this is not yet correct, but getting closer ----
                //halfShapeSize *= .8;           .3;
            }

            //---- note: expandSpace() for scale in specifed in range units (world units, in this case) ----
            dc.scales.x
                .expandSpace(halfShapeSize);

            dc.scales.y
                .expandSpace(halfShapeSize);

            this._halfSizeSize = halfShapeSize;
        }

        preLayoutLoop(dc: DrawContext)
        {
            //---- this call modifies the FINAL scales (for use by our X/Y mapping) ----
            this.modifyXYScales(dc, this._halfSizeSize);

            this._maxShapeSize = dc.maxShapeSize;     

            //---- place our 2D place in middle of Z space ----
            this._z =  dc.z + dc.depth/2; 
        }

        /** "bufferIndex" in the 0-based indexed into the sorted data buffers. */
        layoutDataForRecord(bufferIndex: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var scales = dc.scales;

            var x = this.scaleColData(nv.x, bufferIndex, scales.x);
            var y = this.scaleColData(nv.y, bufferIndex, scales.y);
            var z = this._z;         // for correct rotation about Y axis

            var width = this._maxShapeSize * this.scaleColData(nv.size, bufferIndex, scales.size, 1);
            var height = width;
            var depth = dc.defaultDepth2d   

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
 