//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    facetHelper.ts - helps layout facets into a NxM grid.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class FacetHelperClass
    {
        _colName: string;
        _requestedFacets: number;
        _maxCategoryFacets: number;
        _layout: FacetLayout;
        _binResult: BinResult;
        _facetCount: number;
        _customScreenBounds: any[];        
        _transformer: TransformerClass;
        _fm: bps.FacetMappingData;

        constructor(colName: string, requestedFacets: number, maxCategoryFacets: number, customScreenBounds: any[],
            transformer: TransformerClass, fm: bps.FacetMappingData)
        {
            this._colName = colName;
            this._requestedFacets = requestedFacets;
            this._maxCategoryFacets = maxCategoryFacets;
            this._customScreenBounds = customScreenBounds;
            this._transformer = transformer;
            this._fm = fm;
        }

        setBinCountFromData(dataFrame: DataFrameClass, nv: NamedVectors, dataVector: NumericVector, fm: bps.FacetMappingData)
        {
            /// before we do the facet binning, we need to peek ahead and see the number of keys in all of the data ----
            var dataType = dataVector.colType;

            if (this._fm.breaks && this._fm.breaks.length)
            {
                facetCount = this._fm.breaks.length;
            }
            else if (dataType === "string")
            {
                var facetCount = Math.min(this._maxCategoryFacets, dataVector.keyInfo.keyCount); 
                facetCount = Math.min(this._requestedFacets, facetCount);
            }
            else if (this._fm.forceCategory)
            {
                var forcedNumVector = dataFrame.getNumericVector(dataVector.colName, true);
                var facetCount = Math.min(this._maxCategoryFacets, forcedNumVector.keyInfo.keyCount);   
                facetCount = Math.min(this._requestedFacets, facetCount);

                //var count = utils.countVectorKeys(dataVector);
                //this._facetCount = Math.min(this._requestedFacets, count);   
            }
            else
            {
                //---- number - cannot reply on this._requestedFacets - binHelperNum.createBins() might adjust (e.g., date) ----
                //var facetCount = this._requestedFacets;

                var results = BinHelperNum.createBins(nv, "facet", this._requestedFacets, null, null, null, null, fm);
                var facetCount = results.bins.length;
            }

            this._facetCount = facetCount;
        }

        facetCount()
        {
            return this._facetCount;
        }

        colName()
        {
            return this._colName;
        }

        layout()
        {
            return this._layout;
        }

        binResult(value?: BinResult)
        {
            if (arguments.length === 0)
            {
                return this._binResult;
            }

            this._binResult = value;
            this._facetCount = value.bins.length;
        }

        buildFacetLayout(xMin: number, yMin: number, xMax: number, yMax: number): beachParty.FacetLayout
        {
            var customScreenBounds = this._customScreenBounds;
            var plotBounds: beachParty.Bounds[] = [];
            var labelBounds: beachParty.Bounds[] = [];

            var labelHeight = this._transformer.screenSizeYToWorld(16);        // approx height of 16px font + padding

            if (customScreenBounds && customScreenBounds.length)
            {
                var rowCount = 1;       // hard to say

                for (var i = 0; i < customScreenBounds.length; i++)
                {
                    var rc = customScreenBounds[i];

                    var bounds = this._transformer.screenToWorldBounds(rc);

                    var cellWidth = bounds.width;
                    var cellHeight = bounds.height;

                    var x = bounds.left;
                    var y = bounds.bottom + .05;     // why is this fudge needed?

                    //---- make sure all facets are the SAME width and height (critical for shape drawing algorithm and visual comparisons) ----
                    var plotY = y - labelHeight;
                    var plotHeight = Math.max(0, cellHeight - labelHeight);

                    var fb = { x: x, y: plotY, width: cellWidth, height: plotHeight };
                    var lb = { x: x, y: y, width: cellWidth, height: labelHeight };

                    plotBounds.push(fb);
                    labelBounds.push(lb);
                }
            }
            else
            {
                var vm = this._transformer.screenSizeYToWorld(8);
                var hm = this._transformer.screenSizeXToWorld(8);   

                //---- add margins around overall space ----
                yMax -= vm;    
                yMin += vm;    
                xMin += hm;
                xMax -= hm;

                var width = Math.max(0, xMax - xMin);
                var height = Math.max(0, Math.abs(yMax - yMin));

                var aspect = width / height;
                var count = this._facetCount;

                //---- hard code layout for 0-16 cells ----
                var cellsPerRowByCount = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4 };
                var cellsPerRow = cellsPerRowByCount[count];
                if (cellsPerRow === undefined || cellsPerRow === null)
                {
                    cellsPerRow = Math.ceil(Math.sqrt(aspect * count));
                }
                var rowCount = Math.ceil(count / cellsPerRow);

                //---- space between facets ----
                var approxCellWidth = width / cellsPerRow;

                var hMargin = .075 * approxCellWidth;
                var vMargin = 1.5 * labelHeight;

                var cellWidth = (width - hMargin * (cellsPerRow - 1)) / cellsPerRow;
                var cellHeight = (height - vMargin * (rowCount - 1)) / rowCount;

                var yStart = yMax + 2*vMargin - labelHeight;

                for (var i = 0; i < count; i++)
                {
                    var colIndex = Math.floor(i % cellsPerRow);
                    var rowIndex = Math.floor(i / cellsPerRow);

                    //---- must align left cells to left edge of container (so labels outside are right next to them) ----
                    var x = xMin + colIndex * (cellWidth + hMargin);
                    //var y = yMin - rowIndex * (cellHeight + vMargin);         // flipped axis
                    var y = yStart - (1 + rowIndex) * (cellHeight + vMargin);         // flipped axis

                    //---- make sure all facets are the SAME width and height (critical for shape drawing algorithm and visual comparisons) ----
                    var plotY = y - labelHeight;
                    var plotHeight = Math.max(0, cellHeight - labelHeight);

                    var fb = { x: x, y: plotY, width: cellWidth, height: plotHeight };
                    var lb = { x: x, y: y + plotHeight, width: cellWidth, height: labelHeight };

                    plotBounds.push(fb);
                    labelBounds.push(lb);
                }
            }

            var layout = { facetBounds: plotBounds, labelBounds: labelBounds, rowCount: rowCount, columnCount: cellsPerRow };
            this._layout = layout;

            return layout;
        }
    }

    export class FacetLayout
    {
        facetBounds: Bounds[];
        labelBounds: Bounds[];
        rowCount: number;
        columnCount: number;
    }
}