//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    bestPoisson.ts - does "best candidate" algorithm using a high resolution hit testing grid.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    var bestCache: any = {};        // caches pts for layout consistency between changes

    export class bestPoisson
    {
        grid: any[];
        cellWidth: number;
        cellHeight: number;
        rc: ClientRect;

        avgCellCount: number;

        constructor()
        {
        }

        private distSquared(p1, p2)
        {
            var dx = p1[0] - p2[0];
            var dy = p1[1] - p2[1];
            var dist = dx * dx + dy * dy;

            return dist;
        }

        /** if any points in cellPts are closer to pt than minDist, return that new minDist. */
        private checkCellPoints(minDist: number, pt, cellPts: any[])
        {
            for (var i = 0; i < cellPts.length; i++)
            {
                var cellPt = cellPts[i];
                var dist = this.distSquared(pt, cellPt);

                if (dist < minDist)
                {
                    minDist = dist;
                }
            }

            return minDist;
        }

        private checkGrid(minDist, pt, r, c)
        {
            //vp.utils.debug("checkGrid: x=" + pt[0] + ", y=" + pt[1] + ", r=" + r + ", c=" + c);
            
            if (r >= 0 && r < this.grid.length)
            {
                var row = this.grid[r];

                if (c >= 0 && c < row.length)
                {
                    var cellPts = row[c];
                    if (cellPts.length)
                    {
                        minDist = this.checkCellPoints(minDist, pt, cellPts);
                    }
                }
            }

            return minDist;
        }

        /** returns the DIST between pt and closest of points in grid/pts. */
        private findClosest(pts: any[], pt)
        {
            var minDist = Number.MAX_VALUE;

            var col = Math.floor((pt[0] - this.rc.left) / this.cellWidth);
            var row = Math.floor((pt[1] - this.rc.top) / this.cellHeight);

            minDist = this.checkGrid(minDist, pt, row - 1, col - 1);
            minDist = this.checkGrid(minDist, pt, row - 1, col);
            minDist = this.checkGrid(minDist, pt, row - 1, col + 1);

            minDist = this.checkGrid(minDist, pt, row, col - 1);
            minDist = this.checkGrid(minDist, pt, row, col);
            minDist = this.checkGrid(minDist, pt, row, col + 1);

            minDist = this.checkGrid(minDist, pt, row + 1, col - 1);
            minDist = this.checkGrid(minDist, pt, row + 1, col);
            minDist = this.checkGrid(minDist, pt, row + 1, col + 1);

            return minDist;
        }        

        private findBestPoissonCandidate(pts: any[], rc: ClientRect, maxSamples: number, grid)
        {
            var bestPt = null;
            var bestDist = 0;
            var width = rc.width;
            var height = rc.height;

            for (var i = 0; i < maxSamples; i++)
            {
                var pt = [rc.left + width * Math.random(), rc.top + height * Math.random()];
                var dist = this.findClosest(pts, pt);

                if (i == 0 || dist > bestDist)
                {
                    bestPt = pt;
                    bestDist = dist;
                }
            }

            return bestPt;
        }

        makeGrid(rowCount, colCount)
        {
            var grid = [];

            for (var r = 0; r < rowCount; r++)
            {
                var row = [];
                grid[r] = row;

                for (var c = 0; c < colCount; c++)
                {
                    row[c] = [];
                }
            }

            return grid;
        }

        layout(rc: ClientRect, count: number, maxSamples = 30)
        {
            var pts = [];

            if (count && rc && rc.width > 0 && rc.height > 0)
            {
                var cacheKey = rc.left + "," + rc.top + "," + rc.width + "," + rc.height + "," + count;

                if (bestCache[cacheKey])
                {
                    pts = bestCache[cacheKey];
                }
                else
                {

                    //---- compute cell size, for hit-testing points ----
                    var aspect = rc.width / rc.height;
                    
                    //var cellWidth = aspect * Math.sqrt(count);
                    //var cellHeight = count / cellWidth;

                    var colCount = Math.ceil(Math.sqrt(aspect * count));
                    var rowCount = Math.ceil(count / colCount);
                    var cellWidth = rc.width / colCount;
                    var cellHeight = rc.height / rowCount;

                    //---- make them so small, they can only hold max of 1 optimially distributed points ----
                    //cellWidth /= 10;
                    //cellHeight /= 10;

                    //---- make cells bigger so that checking neighbor will check 2-3 sizes bigger than optimally distributed points ----
                    //---- FACTOR is critical for perf: the lower the factor, the smaller the avg count of a grid cell & the faster we can check a candidate. ----
                    //---- FACTOR is critical for quality of layout - if it is too small, local clumping results. ----
                    var exp3 = Math.max(.1, Math.log10(count) - 3);
                    var factor = 1 / (10 * exp3);

                    cellWidth *= factor;
                    cellHeight *= factor;

                    var colCount = Math.ceil(rc.width / cellWidth);
                    var rowCount = Math.ceil(rc.height / cellHeight);

                    var grid = this.makeGrid(rowCount, colCount);

                    //---- update this vars ----
                    this.cellHeight = cellHeight;
                    this.cellWidth = cellWidth;
                    this.grid = grid;
                    this.rc = rc;

                    for (var i = 0; i < count; i++)
                    {
                        var pt = this.findBestPoissonCandidate(pts, rc, maxSamples, grid);

                        //---- add to grid ----
                        var col = Math.floor((pt[0] - this.rc.left) / this.cellWidth);
                        var row = Math.floor((pt[1] - this.rc.top) / this.cellHeight);
                        grid[row][col].push(pt);

                        pts.push(pt);
                    }

                    //---- calculate the avg grid cell count ----
                    var entryCouint = 0;
                    var cellCount = 0;

                    for (var i = 0; i < rowCount; i++)
                    {
                        var rr = grid[i];

                        for (var c = 0; c < colCount; c++)
                        {
                            var cells = rr[c];
                            entryCouint += cells.length;
                            cellCount++;
                        }
                    }

                    this.avgCellCount = entryCouint / cellCount;
                }

                bestCache[cacheKey] = pts;
            }

            return pts;
        }
    }
}
 