//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    scatterplot3d.ts - builds a 3D scatter plot.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class ScatterPlot3dClass extends BaseGlVisClass
    {
        _maxShapeSize = 0;

        constructor(view: DataViewClass, gl: any, chartState: any)
        {
            super("scatterPlot3dClass", view, gl, chartState);
        }

        preLayoutLoop(dc: DrawContext)
        {
            this._maxShapeSize = dc.maxShapeSize;       //  chartUtils.getScatterShapeSize(dc);
        }

        layoutDataForRecord(i: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var scales = dc.scales;

            var x = this.scaleColData(nv.x, i, scales.x);
            var y = this.scaleColData(nv.y, i, scales.y);
            var z = this.scaleColData(nv.z, i, scales.z);

            var width = this._maxShapeSize * this.scaleColData(nv.size, i, scales.size, 1);
            var height = width;
            var depth = width;          // .1 / dc.combinedSizeFactor;

            var colorIndex = this.scaleColData(nv.colorIndex, i, scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, i, dc.scales.imageIndex);
            var opacity = 1;

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }
    }
}
 