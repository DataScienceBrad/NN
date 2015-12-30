//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    linePlot.ts - builds a 2D line plot, with multiple series of lines identified by an "id" column.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    var useLinePrim = false;

    export class LinePlotClass extends BaseGlVisClass
    {
        _ptLast = null;
        _inverseSizeFactor = 0;

        constructor(view: DataViewClass, gl: any, chartState: any)
        {
            super("linePlotClass", view, gl, chartState);

            if (useLinePrim)
            {
                this._view.drawingPrimitive(bps.DrawPrimitive.line);
            }
        }

        preLayoutLoop(dc: DrawContext)
        {
            this._ptLast = null;
            this._inverseSizeFactor = 1 / dc.userSizeFactor;    // / dc.combinedSizeFactor;

            //this._uniformsChanged.lines = true;
        }

        positionLine(x1, y1, x2, y2)
        {
            var xdiff = x1 - x2;
            var ydiff = y1 - y2;

            var width = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

            var cx = (x1 + x2) / 2;
            var cy = (y1 + y2) / 2;

            var theta = Math.atan2(ydiff, xdiff);

            return { cx: cx, cy: cy, width: width, theta: theta };
        }

        layoutDataForRecord(i: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var scales = dc.scales;

            var sx = this.scaleColData(nv.x, i, scales.x);
            var sy = this.scaleColData(nv.y, i, scales.y);
            var z = -0;     // for correct rotation about Y axis
            var depth = dc.defaultDepth2d;      // test out 3d cube in a 2d shape;

            if (useLinePrim)
            {
                var x = sx;
                var y = sy;
                var width = this.scaleColData(nv.size, i, scales.size, 1);
                var height = width;
            }
            else
            {

                if (this._ptLast == null)
                {
                    var x = 0;
                    var y = 0;
                    var width = 0;
                    var height = 0;
                }
                else
                {
                    var result = this.positionLine(sx, sy, this._ptLast.x, this._ptLast.y);

                    var x = result.cx;
                    var y = result.cy;
                    var width = this._inverseSizeFactor * result.width;     // prevent shader from scaling this width
                    var height = .005;

                    ////---- rotate about z ----
                    //var sin = Math.sin(theta);
                    //var cos = Math.cos(theta);
                    //x = x * cos - y * sin;
                    //y = x * sin + y * cos;
                }
            }

            var colorIndex = this.scaleColData(nv.colorIndex, i, scales.colorIndex);
            var imageIndex = this.scaleColData(nv.imageIndex, i, dc.scales.imageIndex);
            var opacity = 1;

            this._ptLast = { x: sx, y: sy };

            return {
                x: x, y: y, z: z, width: width, height: height, depth: depth, colorIndex: colorIndex, opacity: opacity,
                imageIndex: imageIndex, theta: 0,
            };
        }
    }
}
 