//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    partyGenPlot.ts - creates a custom plot based on recursive binning and space division, as 
//          developed in the PartyGen tool.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class PartyGenPlotClass extends BaseGlVisClass
    {
        //---- all facets info ----
        _maxCountAllFacets = 0;

        _maxShapeSize = 0;
        _chartType: string;
        _nextInFilterIndex = 0;

        _dataDivider1: DataDivider;
        _dataDivider2: DataDivider;
        _dataDivider3: DataDivider;
        _dataDivider4: DataDivider;

        _spaceDivider1: SpaceDivider;
        _spaceDivider2: SpaceDivider;
        _spaceDivider3: SpaceDivider;
        _spaceDivider4: SpaceDivider;

        _shapeMaker: ShapeMaker;
        _fillCell = false;          // whether shapes should fill their layout cells

        _leafRcArray: CellData[];

        constructor(view: DataViewClass, gl: any, chartState: any, chartType: string)
        {
            super("partyGenPlotClass", view, gl, chartState);

            this._chartType = chartType;

            this._dataDivider1 = new DataDivider();
            this._dataDivider2 = new DataDivider();
            this._dataDivider3 = new DataDivider();
            this._dataDivider4 = new DataDivider();

            this._spaceDivider1 = new SpaceDivider();
            this._spaceDivider2 = new SpaceDivider();
            this._spaceDivider3 = new SpaceDivider();
            this._spaceDivider4 = new SpaceDivider();

            this._shapeMaker = new ShapeMaker(null, ShapeType.none);
        }

        computeFacetStats(dc: DrawContext, nvFacetBuckets: any[])
        {
            this._maxCountAllFacets = ChartUtils.computeMaxCountOverFacets(dc, nvFacetBuckets);

            //---- call this now so that "this._hideAxes" gets set in time to take effect ----
            this.applyPresets(dc);

            return this._maxCountAllFacets;
        }

        applyPresets(dc: DrawContext)
        {
            this.resetDividersAndShapes(dc);

            var chartType = this._chartType;
            var xm = this._view.xMapping();
            var ym = this._view.yMapping();
            var view = this._view;

            this._fillCell = false;

            if (chartType === "Scatter")
            {
                this._spaceDivider4.spaceType = SpaceType.plotXY;
            }
            else if (chartType === "FlatCircle")
            {
                this._spaceDivider4.spaceType = SpaceType.fillOut;
                this._hideAxes = true;
            }
            else if (chartType === "FlatGrid")
            {
                this._spaceDivider4.spaceType = SpaceType.packXY;
                this._spaceDivider4.reverse = true;     // flipped Y
                this._hideAxes = true;
            }
            else if (chartType === "FlatRandom")
            {
                this._spaceDivider4.spaceType = SpaceType.random;
                this._hideAxes = true;
            }
            else if (chartType === "FlatSquarify")
            {
                var cellMargin = view.separationFactor() * dc.width / 1000;       // (dc.filteredRecordCount) ? (dc.width / Math.sqrt(dc.filteredRecordCount)) : 0;

                this._spaceDivider4.spaceType = SpaceType.squarify;
                this._spaceDivider4.cellMargin = cellMargin;
                this._hideAxes = true;
                this._fillCell = true;
            }
            else if (chartType === "FlatPoisson")
            {
                this._spaceDivider4.spaceType = SpaceType.poisson;
                this._hideAxes = true;
            }
            else if (chartType === "ColumnGrid")
            {
                this._dataDivider3.colName = xm.colName;
                this._dataDivider3.groupCount = xm.binCount;
                this._dataDivider3.groupSorting = xm.binSorting;

                this._spaceDivider3.spaceType = SpaceType.fillX;
                this._spaceDivider3.cellMargin = dc.width / 50;

                this._spaceDivider4.spaceType = SpaceType.packXY;
                this._spaceDivider4.reverse = true;     // flipped Y

                this._hideAxes = true;
            }
            else if (chartType === "BarGrid")
            {
                this._dataDivider3.colName = ym.colName;
                this._dataDivider3.groupCount = ym.binCount;
                this._dataDivider3.groupSorting = ym.binSorting;

                this._spaceDivider3.spaceType = SpaceType.fillY;
                this._spaceDivider3.cellMargin = dc.width / 50;
                //this._spaceDivider3.reverse = true; 

                this._spaceDivider4.spaceType = SpaceType.packYX;
                this._spaceDivider4.reverse = true;     // flipped Y

                this._hideAxes = true;
            }
        }

        resetDividersAndShapes(dc: DrawContext)
        {
            this._hideAxes = false;

            var primaryCol = this._view.xMapping().colName;
            var secondaryCol = this._view.yMapping().colName;

            this._spaceDivider1.xStat.colName = primaryCol;
            this._spaceDivider2.xStat.colName = primaryCol;
            this._spaceDivider3.xStat.colName = primaryCol;
            this._spaceDivider4.xStat.colName = primaryCol;

            this._spaceDivider1.yStat.colName = secondaryCol;
            this._spaceDivider2.yStat.colName = secondaryCol;
            this._spaceDivider3.yStat.colName = secondaryCol;
            this._spaceDivider4.yStat.colName = secondaryCol;

            this._dataDivider1.colName = primaryCol;
            this._dataDivider2.colName = primaryCol;
            this._dataDivider3.colName = primaryCol;

            this._dataDivider1.groupCount = 5;
            this._dataDivider2.groupCount = 5;
            this._dataDivider3.groupCount = 5;

            beachParty.maxContainers = 0;     // off by default

            this._spaceDivider1.margin = 0;
            this._spaceDivider2.margin = 0;
            this._spaceDivider3.margin = 0;
            this._spaceDivider4.margin = 0;

            this._spaceDivider1.cellMargin = 0;
            this._spaceDivider2.cellMargin = 0;
            this._spaceDivider3.cellMargin = 0;
            this._spaceDivider4.cellMargin = 0;

            this._spaceDivider1.spaceType = SpaceType.none;
            this._spaceDivider2.spaceType = SpaceType.none;
            this._spaceDivider3.spaceType = SpaceType.none;
            this._spaceDivider4.spaceType = SpaceType.packXY;

            this._spaceDivider1.reverse = false;
            this._spaceDivider2.reverse = false;
            this._spaceDivider3.reverse = false;
            this._spaceDivider4.reverse = false;

            this._spaceDivider1.hAlign = HAlign.left;
            this._spaceDivider2.hAlign = HAlign.left;
            this._spaceDivider3.hAlign = HAlign.left;
            this._spaceDivider4.hAlign = HAlign.left;

            this._spaceDivider1.vAlign = VAlign.bottom;
            this._spaceDivider2.vAlign = VAlign.bottom;
            this._spaceDivider3.vAlign = VAlign.bottom;
            this._spaceDivider4.vAlign = VAlign.bottom;

            this._spaceDivider1.xStat.peerScale = false;
            this._spaceDivider2.xStat.peerScale = false;
            this._spaceDivider3.xStat.peerScale = false;
            this._spaceDivider4.xStat.peerScale = false;

            this._spaceDivider1.yStat.peerScale = false;
            this._spaceDivider2.yStat.peerScale = false;
            this._spaceDivider3.yStat.peerScale = false;
            this._spaceDivider4.yStat.peerScale = false;
        }

        addDivider(dividers: ChartDivider[], dd: DataDivider, sd: SpaceDivider, layers: ShapeMaker[]= [])
        {
            var divider = new ChartDivider();

            divider.dd = dd;
            divider.sd = sd;
            divider.shapeLayers = layers;

            dividers.push(divider);
            return divider;
        }

        /** called for each facet. */
        preLayoutLoop(dc: DrawContext)
        {
            this.applyPresets(dc);

            this._maxShapeSize = dc.maxShapeSize;     

            this._shapeMaker.shapeSize = this._maxShapeSize;

            this._spaceDivider4.xRandom = (dc.nvData.randomX) ? dc.nvData.randomX.values : null;
            this._spaceDivider4.yRandom = (dc.nvData.randomY) ? dc.nvData.randomY.values : null;

            var rc = vp.geom.createRect(dc.x, dc.y, dc.width, dc.height);

            //---- build "dividers" ----
            var dividers: ChartDivider[] = [];

            if (this._dataDivider1.colName && this._spaceDivider1.spaceType !== SpaceType.none)
            {
                this.addDivider(dividers, this._dataDivider1, this._spaceDivider1);
            }

            if (this._dataDivider2.colName && this._spaceDivider2.spaceType !== SpaceType.none)
            {
                this.addDivider(dividers, this._dataDivider2, this._spaceDivider2);
            }

            if (this._dataDivider3.colName && this._spaceDivider3.spaceType !== SpaceType.none)
            {
                this.addDivider(dividers, this._dataDivider3, this._spaceDivider3);
            }

            if (this._spaceDivider4.spaceType !== SpaceType.none)
            {
                this.addDivider(dividers, this._dataDivider4, this._spaceDivider4);
            }

            //---- get a dataFrame of the records for this facet ----
            var facetIndexes = null;
            if (dc.facetHelper)
            {
                facetIndexes = dc.facetHelper.binResult().bins[dc.facetIndex].rowIndexes;
            }
            var dataFrame = this._dataFrame.copyData(facetIndexes);

            if (dc.filteredRecordCount !== dc.recordCount)
            {
                var indexes = [];
                var filter = dc.layoutFilterVector;
                var count = dataFrame.getRecordCount();

                //---- filter data before layout ----
                for (var i = 0; i < count; i++)
                {
                    if (!filter[i])
                    {
                        indexes.push(i);
                    }
                }

                dataFrame = dataFrame.copyData(indexes);
            }

            //---- build the rcArray's for each container ----
            this.genLayout(null, rc, dataFrame, dividers, 0);

            this._nextInFilterIndex = 0;
        }

        genLayout(svg, rc: ClientRect, dataFrame: DataFrameClass, dividers: ChartDivider[], divideLevel: number)
        {
            //var shapeMakers = [shapeMaker];

            //---- GENERATE containers ----
            var root = new Container(dataFrame, 0);       
            root.binAndGen(dividers);

            //---- MEASURE sizes & stats ----
            var results = root.measure(dividers);
            
            //---- LAYOUT all containers ----
            var leafRcArray = [];
            var cellData = CellData.fromRect(rc, CellShape.rectangle);

            root.layout(dividers, cellData, results.scaleData, svg, leafRcArray);

            this._leafRcArray  = leafRcArray;
        }

        layoutDataForRecord(i: number, dc: DrawContext)
        {
            var nv = dc.nvData;
            var scales = dc.scales;
            var filter = dc.layoutFilterVector;

            ////---- DEBUG ----
            //if (i == 12956)
            //{
            //    var sorted = true;
            //}
            //else if (i == 14418)
            //{
            //    var sorted = false;
            //}

            if (!filter[i])
            {
                //---- IN FILTER - give it the next rcArray ----
                var index = this._nextInFilterIndex++;
                var cellData = this._leafRcArray[index];
                var rc = cellData.rect;
            }
            else
            {
                //---- OUT OF FILTER; give it default rc ----
                var rc = vp.geom.createRect(0, 0, 1, 1);
            }

            //var shapeType = this._shapeMaker.shapeType;
            var isRect = false;     // (shapeType == ShapeType.rectangle);

            if (this._fillCell)
            {
                var width = rc.width / dc.userSizeFactor;       // dc.combinedSizeFactor;
                var height = rc.height / dc.userSizeFactor;     // dc.combinedSizeFactor;
            }
            else
            {
                var width = this._maxShapeSize * this.scaleColData(nv.size, i, scales.size, 1);
                var height = width;
            }

            var depth = dc.defaultDepth2d;

            //---- center drawing within cell ----
            var x = rc.left + rc.width / 2;

            //---- work around facet vs. non-facet inconsistency in bottom/top usage ----
            var y = Math.min(rc.bottom, rc.top) + rc.height / 2;      // rc.top
            var z = 0;   

            if (isRect)
            {
                x -= width / 2;
                y -= height / 2;
            }

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
 