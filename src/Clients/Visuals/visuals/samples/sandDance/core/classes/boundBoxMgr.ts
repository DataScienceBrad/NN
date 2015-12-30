//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    boundingBoxMgr.ts - manages the set of bounding boxes as a set of arrays, for minimizing the memory usage.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /// Why?  An array of BoundingBox class objects requires 156 bytes per object in IE11.  By breaking up data into 
    /// Float32Arrays, we can reduce object size to 44 bytes per object.

    export class BoundingBoxMgrClass 
    {
        private _mins;
        private _maxes;
        private _thetas;
        private _distances;
        private _primaryKeys;
        private _nextIndex = 0;

        constructor()   
        {
        }

        adjustSizeAndClearList(count: number)
        {
            if (!this._primaryKeys || this._primaryKeys.length !== count)
            {
                this._mins = new Float32Array(3 * count);
                this._maxes = new Float32Array(3 * count);

                this._thetas = new Float32Array(count);
                this._distances = new Float32Array(count);
                this._primaryKeys = [];
            }

            this._nextIndex = 0;
        }

        addBox(xMin: number, yMin: number, zMin: number, xMax: number, yMax: number, zMax: number,
            theta: number, primaryKey: string, dist?: number)
        {
            var index = this._nextIndex++;
            var index3 = index * 3;

            this._mins[index3 + 0] = xMin;
            this._mins[index3 + 1] = yMin;
            this._mins[index3 + 2] = zMin;

            this._maxes[index3 + 0] = xMax;
            this._maxes[index3 + 1] = yMax;
            this._maxes[index3 + 2] = zMax;

            this._thetas[index] = theta;
            this._distances[index] = dist;
            this._primaryKeys[index] = primaryKey;
        }

        getBoxByKey(primaryKey: string)
        {
            var index = this._primaryKeys.indexOf(primaryKey);
            var box = <BoundingBox> null;
            
            if (index > -1)
            {
                box = new BoundingBox();
                var index3 = index * 3;

                box.xMin = this._mins[index3 + 0];
                box.yMin = this._mins[index3 + 1];
                box.zMin = this._mins[index3 + 2];

                box.xMax = this._maxes[index3 + 0];
                box.yMax = this._maxes[index3 + 1];
                box.zMax = this._maxes[index3 + 2];

                box.theta = this._thetas[index];
                box.dist = this._distances[index];
                box.primaryKey = this._primaryKeys[index];
            }

            return box;
        }

        /** warning - this is a boundBox index only, not the vectorIndex associated with all shapes in draw buffers. */
        getBoxByIndex(boxIndex: number)
        {
            var box = new BoundingBox();
            var index3 = boxIndex * 3;

            box.xMin = this._mins[index3 + 0];
            box.yMin = this._mins[index3 + 1];
            box.zMin = this._mins[index3 + 2];

            box.xMax = this._maxes[index3 + 0];
            box.yMax = this._maxes[index3 + 1];
            box.zMax = this._maxes[index3 + 2];

            box.theta = this._thetas[boxIndex];
            box.dist = this._distances[boxIndex];
            box.primaryKey = this._primaryKeys[boxIndex];

            return box;
        }

        getCount()
        {
            var len = (this._primaryKeys) ? this._primaryKeys.length : 0;
            return len;
        }

    }
} 