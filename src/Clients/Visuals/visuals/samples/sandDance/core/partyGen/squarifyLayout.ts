//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    squarifyLayout.ts - lays out items in a single-level squarified treemap.
//    adapted from: "Squarified Treemaps" paper by Mark Bruls, et al.  
//    http://www.win.tue.nl/~vanwijk/stm.pdf
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class squarifyLayoutClass
    {
        _values: number[];
        _rc: ClientRect;
        _isRowVertical = false;
        _cellArray = [];
        _cellMargin = 0;
        _sortedPairs = [];

        constructor()
        {
        }

        layout(origValues: number[], rc: ClientRect, cellMargin: number)
        {
            //---- use TEST DATA ----
            //values = [6, 6, 4, 3, 2, 2, 1];
            //rc = vp.geom.createRect(0, 0, 600, 400);

            var valuePairs = [];

            //---- ensure all values are not too small, and pair them with a record index ----
            for (var i = 0; i < origValues.length; i++)
            {
                var value = Math.max(.00001, origValues[i]);

                valuePairs[i] = { value: value, index: i };
            }

            //---- sort the values ----
            var sortedPairs = valuePairs.orderByNum((v) => v.value);
            sortedPairs = sortedPairs.reverse();
            this._sortedPairs = sortedPairs;

            //---- extract just the values ----
            var values = sortedPairs.map((v) => v.value);

            //---- normalize the data to the size of the rc ----
            var area = rc.width * rc.height;
            var totalSum = values.sum();

            for (var i = 0; i < values.length; i++)
            {
                values[i] = values[i] / totalSum * area;
            }

            this._values = values;
            this._rc = rc;
            this._cellMargin = cellMargin;

            this.squarify();
            return this._cellArray;
        }

        /** Returns the highest aspect ratio of the list of rectangles represented by "row". */
        worst(row: number[], w: number)
        {
            var wSquare = w * w;
            var sum = row.sum();
            var sSquare = sum * sum;
            var rMax = row.max();
            var rMin = row.min();

            var maxRatio = Math.max(wSquare * rMax / sSquare, sSquare / (wSquare * rMin));
            return maxRatio;
        }

        /** layout out the relative area sizes in "row", as a vertical or horizontal row in "rc". */
        layoutRow(row: number[], rowIndexes: number[], remainingChildren: number[])
        {
            var rowSum = row.sum();
            var totalSum = (remainingChildren.length) ? (rowSum + remainingChildren.sum()) : rowSum;

            var rc = this._rc;
            var left = rc.left;
            var cm = this._cellMargin;
            var cm2 = 2 * cm;

            if (this._isRowVertical)
            {
                //---- layout VERTICAL ROW (divisions in Y) ----
                var heightFactor = rc.height / rowSum;
                var width = rc.width * rowSum / totalSum;
                var adjWidth = Math.max(0, width -cm2);

                var bottom = rc.bottom;

                for (var i = 0; i < row.length; i++)
                {
                    var height = row[i] * heightFactor;
                    var adjHeight = Math.max(0, height - cm2);

                    var rcChild = vp.geom.createRect(left + cm, bottom - height + cm, adjWidth, adjHeight);
                    var cdChild = CellData.fromRect(rcChild, CellShape.rectangle);

                    //---- add index back to original data record ----
                    var index = rowIndexes[i];
                    this._cellArray[index] = cdChild;

                    bottom -= height;
                }

                //---- subtract used space from "rc" ----
                this._rc = vp.geom.createRect(rc.left + width, rc.top, rc.width - width, rc.height);
            }
            else
            {
                //---- layout HORIZONTAL ROW (divisions in X) ----
                var widthFactor = rc.width / rowSum;
                var height = rc.height * rowSum / totalSum;
                var adjHeight = Math.max(0, height - cm2);
                var top = rc.bottom - height;

                for (var i = 0; i < row.length; i++)
                {
                    var width = row[i] * widthFactor;
                    var adjWidth = Math.max(0, width - cm2);

                    var rcChild = vp.geom.createRect(left + cm, top + cm, adjWidth, adjHeight);
                    var cdChild = CellData.fromRect(rcChild, CellShape.rectangle);

                    //---- add index back to original data record ----
                    var index = rowIndexes[i];
                    this._cellArray[index] = cdChild;

                    left += width;
                }

                //---- subtract used space from "rc" ----
                this._rc = vp.geom.createRect(rc.left, rc.top, rc.width, rc.height - height);
            }
        }

        /** returns the length of the shortest side of remaining subrect in which current row is placed (this._rc). */
        width()
        {
            var rc = this._rc;
            this._isRowVertical = (rc.width > rc.height);

            return Math.min(rc.width, rc.height);
        }

        squarify()
        {
            var row = [];
            var rowIndexes = [];
            var nextRowIndex = 0;
            var children = this._values;
            var w = this.width();

            while (children.length)
            {
                var c = children[0];

                var wCurrent = this.worst(row, w);
                var wNext = this.worst(row.concat(c), w);

                //vp.utils.debug("squarify: c=" + c + ", wCurrent=" + wCurrent + ", wNext=" + wNext);

                //if (this.worst(row, w) <= this.worst(row.concat(c), w))
                if (row.length == 0 || (wNext <= wCurrent))
                {
                    children.removeAt(0);
                    row.push(c);

                    var origRowIndex = this._sortedPairs[nextRowIndex++].index;
                    rowIndexes.push(origRowIndex);

                    //this.squarify(children, row, w);
                }
                else
                {
                    this.layoutRow(row, rowIndexes, children);
                    row = [];
                    rowIndexes = [];
                    w = this.width();

                    //this.squarify(children, [], this.width());
                }
            }

            this.layoutRow(row, rowIndexes, children);
        }
    }
}
 