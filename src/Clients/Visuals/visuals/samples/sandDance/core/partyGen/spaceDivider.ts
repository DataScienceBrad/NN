//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    spaceDivider.ts - algorithm(s) for dividing up a container into sub-containers.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export var maxContainers: number;

    /// Data Aggregation and Scaling for layouts:
    ///
    ///   There are several types of layouts supported by this class:
    ///
    ///     1. PLOT layouts (e.g., plotXY, polarXY)
    ///     2. PROPORTIONAL CELL SIZE layouts (e.g., fillX, fillY, squarify)
    ///     3. DATA INSENSITIVE layouts (e.g., packXY, poisson)
    ///
    ///   Types 1 & 2 need different X and/or Y values for each cell layed out (specified in the X and Y column mappings for
    ///   the associated spaceDivider).  For leaf nodes, these values are obtained directly from the leaf node record values.
    ///   For higher level ("inner") nodes, the column values at the leaf node are aggregated using a "leafStat" and then propagated up to the 
    ///   associated spaceDivider/container using a "innerStat".  
    ///
    ///   For example, you could have a #2 spaceDivider that uses "squarify" layout with "X" (the spacing column) mapped to the "Sales" column, 
    ///   with leafStat set to "Sum()" and innerStat set to "Sum"()".  This would compute the sum(Sales) for each group of level 3 and then
    ///   sum those for each group of level 2, and then layout each cell of level 2 like the outer containers in a Treemap.
    ///
    ///   All 3 of the above types may need to use a common scale (in X and/or Y), to facilitate comparison among containers
    ///   at various levels.  To accomplish that, they need to calculate the min/max (count or state) of X/Y at the leaf levels and 
    ///   then propagate  this to the root, so it can be passed to each of the relevant containers at layout() time.
    ///
    export class SpaceDivider
    {
        spaceType: SpaceType;
        cellShape: CellShape;
        margin: number;
        cellMargin: number;     // space between cells, where layout allows
        reverse: boolean;
        showContainers = false;
        showCounts = false;

        //---- labels ----
        showLabels = false;
        labelColName = "CabinClass";
        labelAddColon = false;
        labelPosition = LabelPositon.top;
        labelHalfCell = false;
        labelSize = 16;
        labelFill = "black";
        labelOpacity = 1;

        //---- stats for leaf and inner containers (must be set explictly by presets/UI)----
        xStat = new StatInfo();
        yStat = new StatInfo();

        xVector: number[];
        yVector: number[];

        //---- for drawing containers ----
        containerFill = "#ccc";
        containerStroke = "none";
        containerStrokeSize = 1;

        //---- X and Y mappings ----
        hAlign = HAlign.left;           // how to align cells that are not full width
        vAlign = VAlign.bottom;         // how to align cells that are not full height
       
        xMaxPeer = false;               // for fillX/FillY: scale X values relative to max(peer values)
        yMaxPeer = false;               // for fillX/fillY: scale Y values relative to max(peer values)

        //---- pre-computed random data (for reproducible drawing when attribute changes) ----
        xRandom: number[] = null;
        yRandom: number[] = null;

        //---- for common scaling, among sets of layouts ----
        scaleData: ScaleData;

        //---- choropleth support ----
        choroData = null;           // geoJSON shapes for ShapeType.choropleth
        choroMapType = ChoroMapType.none;
        choroColName = "";      // name of column that matches NAME in choroData

        constructor(spaceType = SpaceType.none, margin = 2)
        {
            this.spaceType = spaceType;
            this.margin = margin;
            this.cellMargin = margin;

            this.reverse = false;
            this.cellShape = CellShape.rectangle;
        }

        drawLabelsOnTop(cellData: CellData, svg, name: string)
        {
            var textHeight = 18;
            var rc = cellData.rect;
            var yText = rc.top + textHeight - 3;

            //labelPosition = LabelPositon.top;
            //labelHalfCell = false;

            var text = (this.labelAddColon) ? (name + ":") : name;

            var textW = vp.select(svg).append("text")
                .text(text)
                .attr("x", rc.left + rc.width / 2)
                .attr("y", yText)
                .attr("text-anchor", "middle")
                .colors(this.labelFill, "none", 0);

            if (this.labelSize)
            {
                textW.css("font-size", this.labelSize + "px");
            }

            if (this.labelOpacity !== undefined)
            {
                textW.css("opacity", this.labelOpacity + "");
            }

            rc = vp.geom.createRect(rc.left, rc.top + textHeight, rc.width, rc.height - textHeight);
            var cd = CellData.fromRect(rc, this.cellShape);

            return cd;
        }

        /** data can be either a dataFrameClass or an array of DataFrameClass objects. */
        divide(cellData: CellData, name: string, data: FrameOrArrayClass, shapeSize: number, scaleData: ScaleData, svg?: SVGElement)
        {
            var cellArray: CellData[] = [];
            var margin = this.margin;

            //---- get X and Y STAT data, if requested ----
            var xnv = data.getNumericVectorFromStat(this.xStat);
            this.xVector = (xnv) ? xnv.values.toArray() : null;

            var ynv = data.getNumericVectorFromStat(this.yStat);
            this.yVector = (ynv) ? ynv.values.toArray() : null;

            this.scaleData = scaleData;

            //---- apply margins ----
            var rcFull = cellData.rect;
            var rcMarg = vp.geom.createRect(rcFull.left + margin, rcFull.top + margin, rcFull.width - 2 * margin, rcFull.height - 2 * margin);

            var count = data.length;

            //vp.utils.debug("spaceDivider.divide: rcMarg.left=" + rcMarg.left + ", rcMarg.top=" + rcMarg.top);

            if (count)
            {
                //---- limit data ----
                var maxItems = beachParty.maxContainers;

                if (maxItems && count > maxItems)
                {
                    //var nd = <INumericRecords>data;

                    data = data.slice(0, maxItems-1);
                    count = maxItems;
                }

                if (this.spaceType === SpaceType.overlay)
                {
                    cellArray = data.map((pt) =>
                    {
                        return vp.geom.createRect(rcMarg.left, rcMarg.top, rcMarg.width, rcMarg.height);
                    });
                }
                else if (this.spaceType === SpaceType.poisson)
                {
                    var best = new BestPoisson();
                    var pts = best.layout(rcMarg, count);

                    cellArray = pts.map((pt) =>
                    {
                        //---- upper left corner ----
                        var x = pt[0] - .5;
                        var y = pt[1] - .5;

                        return CellData.fromRect(vp.geom.createRect(x, y, 1, 1), this.cellShape);
                    });
                }
                else if (this.spaceType === SpaceType.random)
                {
                    var rIndex = 0;

                    cellArray = data.map((d) =>
                    {
                        if (this.xRandom)
                        {
                            var xr = this.xRandom[rIndex];
                            var yr = this.yRandom[rIndex];
                            rIndex++;
                        }
                        else
                        {
                            var xr = Math.random();
                            var yr = Math.random();
                        }

                        var cx = rcMarg.left + rcMarg.width * xr;
                        var cy = rcMarg.top + rcMarg.height * yr;

                        //---- upper left corner ----
                        var x = cx - .5;
                        var y = cy - .5;

                        return CellData.fromRect(vp.geom.createRect(x, y, 1, 1), this.cellShape);
                    });
                }
                else if (this.spaceType === SpaceType.fillXY)
                {
                    cellArray = this.fillXY(rcMarg, data);
                }
                else if (this.spaceType === SpaceType.packXY)
                {
                    cellArray = this.packXY(rcMarg, data);
                }
                else if (this.spaceType === SpaceType.packYX)
                {
                    cellArray = this.packYX(rcMarg, data);
                }
                else if (this.spaceType === SpaceType.fillOut)
                {
                    cellArray = this.fillOut(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.packOut)
                {
                    cellArray = this.packOut(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.plotXY)
                {
                    cellArray = this.plotXY(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.polarXY)
                {
                    cellArray = this.polarXY(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.fillX)
                {
                    cellArray = this.fillXWithProp(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.fillY)
                {
                    cellArray = this.fillYWithProp(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.record)
                {
                    cellArray = this.record(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.squarify)
                {
                    cellArray = this.squarify(rcMarg, data, shapeSize);
                }
                else if (this.spaceType === SpaceType.choropleth)
                {
                    cellArray = this.choroLayout(rcMarg, data);
                }

                //---- debug -----
                if (this.spaceType !== SpaceType.none && this.spaceType !== SpaceType.choropleth)
                {
                    if (cellArray.length !== data.length)
                    {
                        throw "Layout error - size(cellArray) is different from data.length";
                    }
                }

                //---- draw containers ----
                if (svg && (this.showContainers || this.showCounts || this.showLabels))
                {
                    this.drawContainerOutlines(svg, cellArray, data);
                }
            }

            return cellArray;
        }

        choroLayout(rcMarg: ClientRect, data: FrameOrArrayClass)
        {
            var cellArray = [];

            if (this.choroData && this.choroColName)
            {
                var ranges = { xMin: Number.MAX_VALUE, xMax: -Number.MAX_VALUE, yMin: Number.MAX_VALUE, yMax: -Number.MAX_VALUE };
                var coordsMap: any = {};
                var shapeNames = data.getVector(this.choroColName, false);

                if (shapeNames)
                {
                    //---- first pass: find shapes and compute min/max of X/Y ----
                    for (var i = 0; i < shapeNames.length; i++)
                    {
                        var shapeName = shapeNames[i];

                        var coords = ChoroplethHelper.getShapeCoords(this.choroData, shapeName);
                        if (coords)
                        {
                            ChoroplethHelper.computeXYRange(ranges, coords);
                            coordsMap[shapeName] = coords;
                        }
                    }

                    //---- second pass: build path strings ----
                    for (var i = 0; i < shapeNames.length; i++)
                    {
                        var shapeName = shapeNames[i];
                        var coords = coordsMap[shapeName];
                        if (coords)
                        {
                            var path = ChoroplethHelper.buildPath(rcMarg, ranges, coords);

                            var cellData = new CellData();
                            cellData.cellShape = CellShape.path;
                            cellData.path = path;

                            cellArray.push(cellData);
                        }
                    }
                }
            }

            return cellArray;
        }

        makeScaleForCol(vector: number[], colType: string, minRange: number, maxRange: number, maxPeer?: number,
            zeroBased?: boolean): vp.scales.baseScale
        {
            var scale = null;

            if (vector && vector.length)
            {
                var min = vector.min();
                var max = (maxPeer) ? maxPeer : vector.max();

                if (zeroBased)
                {
                    if (max < 0)
                    {
                        max = 0;
                    }
                    else if (min > 0)
                    {
                        min = 0;
                    }
                }

                if (colType === "date")
                {
                    scale = vp.scales.createDate();
                }
                else if (colType === "number")
                {
                    scale = vp.scales.createLinear();
                }
                else
                {
                    //---- not sure - should this be createCategoryKey()? ----
                    scale = vp.scales.createCategoryIndex();
                }

                scale
                    .domain(min, max)
                    .range(minRange, maxRange);
            }

            return scale;
        }

        /** lays out containers, one per     */
        record(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];

            //---- for legends, we don't call measure, so no childStats exists ----
            var xVector = this.xVector;

            if (xVector && xVector.length)
            {
                var squarifyLayout = new SquarifyLayoutClass();
                cellArray = squarifyLayout.layout(xVector, rcMarg, this.cellMargin);
            }

            return cellArray;
        }

        /** lays out containers in a single-level squarified treemap.  Here, the "color" of a squarify cell
        will be determined by the shapes that populate it.  The size of each cell at the leaf nodes can be based
        on a column or just "1".  The size of intermediate container cells is based on the child data groups: count of    */
        squarify(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];

            //---- for legends, we don't call measure, so no childStats exists ----
            var xVector = this.xVector;

            if (xVector && xVector.length)
            {
                var squarifyLayout = new SquarifyLayoutClass();
                cellArray = squarifyLayout.layout(xVector, rcMarg, this.cellMargin);
            }

            return cellArray;
        }

        /** maps X, Y values to polar coordinates to plot shapes.  */
        polarXY(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];
            var xCol = this.xStat.colName;
            var yCol = this.yStat.colName;

            var xnv = data.getNumericVectorFromStat(this.xStat);
            var xVector = (xnv) ? xnv.values.toArray() : null;

            var ynv = data.getNumericVectorFromStat(this.yStat);
            var yVector = (ynv) ? ynv.values.toArray() : null;

            var maxRadius = Math.min(rcMarg.width / 2, rcMarg.height / 2);

            var anyData = <any>data;
            var xColType = (anyData.colTypes) ? anyData.colTypes[xCol] : "number";
            var yColType = (anyData.colTypes) ? anyData.colTypes[yCol] : "number";

            //---- X range: 0-2*PI ----
            var xScale = this.makeScaleForCol(xVector, xColType, 0, 2*Math.PI);

            //---- Y range: 0-maxRadius ----
            var yScale = this.makeScaleForCol(yVector, yColType, 0, maxRadius);

            var cx = rcMarg.left + rcMarg.width / 2;
            var cy = rcMarg.top + rcMarg.height / 2;

            var xScaled = 0;
            var yScaled = 0;

            for (var i = 0; i < data.length; i++)
            {
                if (xVector)
                {
                    var xValue = xVector[i];
                    xScaled = xScale.scale(xValue);
                }

                if (yVector)
                {
                    var yValue = yVector[i];
                    yScaled = yScale.scale(yValue);
                }

                var theta = -(Math.PI / 2 + xScaled);
                var radius = yScaled;

                var cxx = cx + radius * Math.cos(theta);
                var cyy = cy + radius * Math.sin(theta);

                //---- upper left corner ----
                var x = cxx - .5;
                var y = cyy - .5;

                var rcChild = vp.geom.createRect(x, y, 1, 1);
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));
            }

            return cellArray;
        }

        /** maps shapes along the X/Y axis using the xCol and yCol values.  */
        plotXY(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];
            var xCol = this.xStat.colName;
            var yCol = this.yStat.colName;

            var xVector = data.getVector(xCol);
            var yVector = data.getVector(yCol);

            var anyData = <any>data;
            var xColType = (anyData.colTypes) ? anyData.colTypes[xCol] : "number";
            var yColType = (anyData.colTypes) ? anyData.colTypes[yCol] : "number";

            var xScale = this.makeScaleForCol(xVector, xColType, rcMarg.left, rcMarg.right);
            var yScale = this.makeScaleForCol(yVector, yColType, rcMarg.top, rcMarg.bottom);

            var cx = 0;
            var cy = 0;

            for (var i = 0; i < data.length; i++)
            {
                if (xVector)
                {
                    var xValue = xVector[i];
                    cx = xScale.scale(xValue);
                }

                if (yVector)
                {
                    var yValue = yVector[i];
                    cy = yScale.scale(yValue);
                }

                //---- upper left corner ----
                var x = cx - .5;
                var y = cy - .5;

                var rcChild = vp.geom.createRect(x, y, 1, 1);
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));
            }

            return cellArray;
        }

        /** does a FILL along the X axis, where the width and height of each cell is proportional to xCol/yCol. */
        fillXWithProp(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];

            var xVector = this.xVector;
            var yVector = this.yVector;

            var cellMargin = this.cellMargin;
            var halfMargin = cellMargin / 2;

            var count = data.length;
            var uniformHeight = rcMarg.height;
            var uniformWidth = Math.max(0, rcMarg.width / count - cellMargin);

            var xFactor = 0;
            var yScale = null;

            if (xVector && xVector.length)
            {
                var xSum = xVector.sum((v) => Math.abs(v));
                xFactor = Math.max(0, (rcMarg.width - count * cellMargin) / xSum);
            }

            if (yVector && yVector.length)
            {
                yScale = this.makeScaleForCol(yVector, "number", 0, rcMarg.height, null, true);
            }

            var left = rcMarg.left + halfMargin;

            var valign = this.vAlign;
            var yCenter = rcMarg.top + rcMarg.height / 2;

            for (var i = 0; i < data.length; i++)
            {
                var width = (xVector) ? (Math.abs(xVector[i]) * xFactor) : uniformWidth;
                var height = (yVector) ? yScale.scale(yVector[i]) : uniformHeight;

                //---- make sure we can see all cells ----
                //width = Math.max(1, width);
                //height = Math.max(1, height);

                var top = rcMarg.bottom - height;

                if (valign === VAlign.middle)
                {
                    top = yCenter - height / 2;
                }
                else if (valign === VAlign.top)
                {
                    top = rcMarg.top;
                }

                var rcChild = vp.geom.createRect(left, top, width, height);
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));

                left += (width + cellMargin);
            }

            return cellArray;
        }

        /** does a FILL along the Y axis, where the width and height of each cell is proportional to xCol/yCol. */
        fillYWithProp(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];
            var xCol = this.xStat.colName;
            var yCol = this.yStat.colName;

            var xVector = data.getVector(xCol, true);
            var yVector = data.getVector(yCol, true);

            var cellMargin = this.cellMargin;
            var halfMargin = cellMargin / 2;

            var count = data.length;
            var uniformHeight = Math.max(0, (rcMarg.height / count - cellMargin));
            var uniformWidth = rcMarg.width;

            var xScale = null;
            var yFactor = 0;

            var xCol = this.xStat.colName;
            var yCol = this.yStat.colName;

            if (xVector)
            {
                var maxPeer = (this.xMaxPeer) ? this.scaleData.xMax : undefined;
                xScale = this.makeScaleForCol(xVector, "number", 0, rcMarg.width, maxPeer);
            }

            if (yVector)
            {
                var ySum = (this.yMaxPeer) ? this.scaleData.yMax : yVector.sum((v) => Math.abs(v));
                yFactor = Math.max(0, (rcMarg.height - count*cellMargin) / ySum);
            }

            var hAlign = this.hAlign;
            var xCenter = rcMarg.left + rcMarg.width / 2;

            var yOffset = (this.reverse) ? (rcMarg.bottom - halfMargin) : (rcMarg.top + halfMargin);
            var yDir = (this.reverse) ? -1 : 1;

            for (var i = 0; i < data.length; i++)
            {
                var width = (xVector) ? xScale.scale(xVector[i]) : uniformWidth;
                var height = (yVector) ? (Math.abs(yVector[i]) * yFactor) : uniformHeight;

                ////---- make sure we can see all cells ----
                //width = Math.max(1, width);
                //height = Math.max(1, height);

                var left = rcMarg.left;

                if (xVector)
                {
                    if (hAlign === HAlign.center)
                    {
                        left = xCenter - width / 2;
                    }
                    else if (hAlign === HAlign.right)
                    {
                        left = rcMarg.right - width;
                    }
                }

                if (yDir === -1)
                {
                    var rcChild = vp.geom.createRect(left, yOffset - height, width, height);
                }
                else
                {
                    var rcChild = vp.geom.createRect(left, yOffset, width, height);
                }
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));

                yOffset += yDir * (height + cellMargin);
            }

            return cellArray;
        }

        /** puts first shape at center, then packs other shapes around the first, starting at upper left corner of first shape. repeats
        until all shapes have been placed around the prior shapes.  */
        packOut(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];
            var halfSize = shapeSize / 2;

            var cx = rcMarg.left + rcMarg.width / 2 - halfSize;
            var cy = rcMarg.top + rcMarg.height / 2 - halfSize;
            var count = data.length;
            var cellMargin = this.cellMargin;

            //---- start algotirhm at dir=center ----
            var x = cx;
            var y = cy;
            var fillDir = FillDir.center;
            var dirMax = 1;
            var dirCount = 0;

            while (count--)
            {
                var rcChild = vp.geom.createRect(x, y, shapeSize, shapeSize);
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));

                dirCount++;

                if (dirCount === dirMax)
                {
                    //---- change direction ----
                    if (fillDir === FillDir.down)
                    {
                        fillDir = FillDir.right;
                    }
                    else if (fillDir === FillDir.right)
                    {
                        fillDir = FillDir.up;
                    }
                    else if (fillDir === FillDir.up)
                    {
                        fillDir = FillDir.left;
                    }
                    else if (fillDir === FillDir.left)
                    {
                        fillDir = FillDir.down;

                        //---- start a new layer ----
                        dirMax += 2;
                        x -= (shapeSize + cellMargin);
                        y -= (shapeSize + cellMargin);          // comphensate for upcoming y adjustment
                    }

                    dirCount = 0;
                }

                //---- move to next location ----
                if (fillDir === FillDir.center)
                {
                    //---- special handling for first shape ----
                    fillDir = FillDir.down;
                    dirMax = 2;
                    dirCount = 0;
                    x -= (shapeSize + cellMargin);
                }
                else if (fillDir === FillDir.down)
                {
                    y += (shapeSize + cellMargin);
                }
                else if (fillDir === FillDir.right)
                {
                    x += (shapeSize + cellMargin);
                }
                else if (fillDir === FillDir.up)
                {
                    y -= (shapeSize + cellMargin);
                }
                else if (fillDir === FillDir.left)
                {
                    x -= (shapeSize + cellMargin);
                }
            }

            return cellArray;
        }

        /** uses sunFlower drawing algorithm (aka fermat's apiral and disc phyllotaxis) to layout shapes in a spiral pattern that
        fills the specified space. */
        fillOut(rcMarg: ClientRect, data: FrameOrArrayClass, shapeSize: number)
        {
            var cellArray = [];
            var phyloSeed = 137.508;           // "golden angle"
            var count = data.length;

            var xSize = rcMarg.width;
            var ySize = rcMarg.height;

            var radius = Math.min(xSize, ySize);
            var spacing = .5 * radius / Math.sqrt(count);

            var cx = rcMarg.left + rcMarg.width / 2;
            var cy = rcMarg.top + rcMarg.height / 2;

            for (var i = 0; i < count; i++)
            {
                //---- filtered code can calc stuff here, but it will not be used ----
                var r = spacing * Math.sqrt(i);
                var theta = Math.PI / 180 * (i * phyloSeed);
                var cxx = cx + r * Math.sin(theta);
                var cyy = cy + r * Math.cos(theta);

                var x = cxx - shapeSize/2;
                var y = cyy - shapeSize / 2;

                var rcChild = vp.geom.createRect(x, y, shapeSize, shapeSize);
                cellArray.push(CellData.fromRect(rcChild, this.cellShape));
            }

            return cellArray;
        }

        fillXY(rcMarg: ClientRect, data: FrameOrArrayClass)
        {
            var cellArray = [];

            var width = rcMarg.width;
            var height = rcMarg.height;
            var aspect = width / height;

            //---- space between facets ----
            var xMargin = this.cellMargin;
            var yMargin = this.cellMargin;

            var cellsPerRowByCount = {
                0: 0, 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5,
                11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4
            };

            var count = data.length;

            //---- hard code layout for 0-16 cells ----
            var cellsPerRow = cellsPerRowByCount[count];
            if (cellsPerRow === undefined)
            {
                cellsPerRow = Math.ceil(Math.sqrt(aspect * count));
            }

            var rowCount = Math.ceil(count / cellsPerRow);

            //---- use whole numbers for sizes, for crisp drawing of frames ----
            var cellWidth = (width - xMargin * (cellsPerRow - 1)) / cellsPerRow;
            var cellHeight = (height - yMargin * (rowCount - 1)) / rowCount;

            for (var i = 0; i < count; i++)
            {
                var colIndex = Math.floor(i % cellsPerRow);
                var rowIndex = Math.floor(i / cellsPerRow);

                //---- use whole numbers for offsets ----
                //---- must align left cells to left edge of container (so labels outside are right next to them) ----
                var x = rcMarg.left + colIndex * (cellWidth + xMargin);
                var y = rcMarg.top + rowIndex * (cellHeight + yMargin);   

                //---- make sure all facets are the SAME width and height (critical for shape drawing algorithm and visual comparisons) ----
                var rc = vp.geom.createRect(x, y, cellWidth, cellHeight);
                var cellData = CellData.fromRect(rc, this.cellShape);

                cellArray.push(cellData);
            }

            return cellArray;
        }

        packXY(rcMarg: ClientRect, data: FrameOrArrayClass)
        {
            var cellMargin = this.cellMargin;
            var halfMargin = cellMargin / 2;

            var maxCount = (this.scaleData && this.scaleData.maxCount) ? this.scaleData.maxCount : this.getMaxCountInGroups(data);
            var aspect = rcMarg.width / rcMarg.height;

            var colCount = Math.ceil(Math.sqrt(aspect * maxCount));
            var rowCount = Math.ceil(maxCount / colCount);

            var boxWidth = rcMarg.width / colCount;
            var boxHeight = rcMarg.height / rowCount;

            var cellWidth = Math.max(0, boxWidth - cellMargin);
            var cellHeight = Math.max(0, boxHeight - cellMargin);

            var i = 0;
            var yStart = (this.reverse) ? (rcMarg.top + halfMargin) : (rcMarg.bottom - cellHeight - halfMargin);
            var yDir = (this.reverse) ? 1 : -1;

            var cellArray = data.map((d) =>
            {
                var colNum = i % colCount;
                var rowNum = Math.floor(i / colCount);

                var x = rcMarg.left + halfMargin + colNum * boxWidth;
                var y = yStart + yDir * rowNum * boxHeight;
                i++;

                return CellData.fromRect(vp.geom.createRect(x, y, cellWidth, cellHeight), this.cellShape);
            });

            return cellArray;
        }

        packYX(rcMarg: ClientRect, data: FrameOrArrayClass)
        {
            var cellMargin = this.cellMargin;
            var halfMargin = cellMargin / 2;

            var maxCount = (this.scaleData && this.scaleData.maxCount) ? this.scaleData.maxCount : this.getMaxCountInGroups(data);
            var aspect = rcMarg.width / rcMarg.height;

            var rowCount = Math.ceil(Math.sqrt(maxCount/aspect));
            var colCount = Math.ceil(maxCount / rowCount);

            var boxWidth = rcMarg.width / colCount;
            var boxHeight = rcMarg.height / rowCount;

            var cellWidth = Math.max(0, boxWidth - cellMargin);
            var cellHeight = Math.max(0, boxHeight - cellMargin);

            var i = 0;
            var yStart = (this.reverse) ? (rcMarg.top + halfMargin) : (rcMarg.bottom - cellHeight - halfMargin);
            var yDir = (this.reverse) ? 1 : -1;

            var cellArray = data.map((d) =>
            {
                var rowNum = i % rowCount;
                var colNum = Math.floor(i / rowCount);

                var x = rcMarg.left + halfMargin + colNum * boxWidth;
                var y = yStart + yDir * rowNum * boxHeight;
                i++;

                return CellData.fromRect(vp.geom.createRect(x, y, cellWidth, cellHeight), this.cellShape);
            });

            return cellArray;
        }

        getMaxCountInGroups(frameOrArray: FrameOrArrayClass)
        {
            var maxCount = 0;

            if (frameOrArray.array)
            {
                var firstGroup = frameOrArray.array[0];
                var isArray = (vp.utils.isArray(firstGroup));

                if (isArray)
                {
                    for (var i = 0; i < frameOrArray.length; i++)
                    {
                        var group = frameOrArray[i];
                        var count = group.length;

                        maxCount = Math.max(maxCount, count);
                    }
                }
                else
                {
                    //----- just a set of records ----
                    maxCount = frameOrArray.length;
                }
            }
            else
            {
                //----- just a set of records ----
                maxCount = frameOrArray.length;
            }

            //---- don't exceed our demo-tool max ----
            if (beachParty.maxContainers)
            {
                maxCount = Math.min(maxCount, beachParty.maxContainers);
            }

            return maxCount;
        }

        drawContainerOutlines(svg, cellArray: CellData[], data: FrameOrArrayClass)
        {
            //---- draw containers in red ----
            for (var i = 0; i < cellArray.length; i++)
            {
                var cellData = cellArray[i];
                var rcx = cellData.rect;

                var dataGroup = <any> data.getItem(i);

                var name = null;
                if (dataGroup.ctr === "dataFrameClass")
                {
                    name = (dataGroup._groupName) ? dataGroup._groupName : data.name;
                }
                else if (this.labelColName)
                {
                    name = dataGroup[this.labelColName];
                }

                if (this.showContainers)
                {
                    //---- make sure container is visible ----
                    var width = Math.max(2, rcx.width);
                    var height = Math.max(2, rcx.height);

                    if (this.cellShape === CellShape.rectangle)
                    {
                        vp.select(svg).append("rect")
                            .bounds(rcx.left, rcx.top, width, height)
                            .colors(this.containerFill, this.containerStroke, this.containerStrokeSize);
                    }
                    else
                    {
                        var radius = Math.min(width, height) / 2;
                        var cx = rcx.left + rcx.width / 2;
                        var cy = rcx.top + rcx.height / 2;

                        vp.select(svg).append("circle")
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .attr("r", radius)
                            .colors(this.containerFill, this.containerStroke, this.containerStrokeSize);
                    }
                }

                if (this.showCounts)
                {
                    var yText = rcx.top + 20;

                    if (this.spaceType === SpaceType.fillX)
                    {
                        //groupCount = Math.min(beachParty.maxContainers, groupCount);
                        yText = rcx.bottom;
                    }

                    vp.select(svg).append("text")
                        .text(data + "")
                        .attr("x", rcx.left + rcx.width / 2)
                        .attr("y", yText)
                        .attr("text-anchor", "middle")
                        .colors("black", "none", 0);
                }

                //---- draw label ----
                var minWidth = 10;
                var minHeight = 10;

                if (this.showLabels && name && rcx.width >= minWidth && rcx.height >= minHeight)
                {
                    var cdAdj = this.drawLabelsOnTop(cellData, svg, name);
                    cellArray[i] = cdAdj;
                }
            }
        }

        showStuff(showContainers, showCounts)
        {
            this.showContainers = showContainers;
            this.showCounts = showCounts;
        }
    }

    enum FillDir
    {
        center,
        down,
        right,
        up,
        left,
    }

    export enum SpaceType
    {
        none,
        choropleth,
        fillX,
        fillY,
        fillXY,
        fillOut,    // (sunFlower/phlloytaxis)
        packXY,
        packYX,
        packOut,
        plotXY,
        polarXY,
        overlay,
        poisson,
        random,
        record,
        squarify,
    }

    export enum CellShape
    {
        circle,
        path,
        pieSlice,
        rectangle,
    }

    export enum HAlign
    {
        left,
        center,
        right,
    }

    export enum VAlign
    {
        top,
        middle,
        bottom,
    }

    /** Type of statistic to gather about children of current container. Some stats use "statCol". */
    export enum StatType
    {
        none,
        count,
        min,
        max,
        sum,
        avg,
        median, 
        mode,
        std,
        variance,
    }

    export class StatInfo
    {
        statType: StatType;
        colName: string;
        colValueTransform = null;       // a callback to transform col value before building stat (e.g., Math.abs)
        peerScale: boolean;

        constructor(colName = "", statType: StatType = StatType.none)
        {
            this.statType = statType;
            this.colName = colName;
            this.peerScale = false;
            this.colValueTransform = null;
        }

        getAggColName()
        {
            var name = this.colName;

            if (this.statType === StatType.count)
            {
                name = "Count@";
            }
            else 
            {
                var statType = (this.statType === StatType.none) ? "sum" : StatType[this.statType];

                name = statType.capitalize() + "@" + name;
            }

            return name;
        }
    }

    export class CircleData
    {
        cx: number;
        cy: number;
        radius: number;

        constructor(cx: number, cy: number, radius: number)
        {
            this.cx = cx;
            this.cy = cy;
            this.radius = radius;
        }
    }

    export class PieSliceData extends CircleData
    {
        innerRadius: number;
        startAngle: number;
        endAngle: number;
    }

    export class CellData
    {
        cellShape: CellShape;

        rect: ClientRect;
        circle: CircleData;
        pieSlice: PieSliceData;
        path: string;

        static fromRect(rect: ClientRect, cellShape: CellShape)
        {
            var cd = new CellData();
            cd.cellShape = cellShape;
            cd.rect = rect;

            if (cellShape === CellShape.circle)
            {
                var radius = Math.min(rect.width, rect.height) / 2;
                cd.circle = new CircleData(rect.left + rect.width/2, rect.top + rect.height/2, radius);
            }

            return cd;
        }
    }

    export enum ChoroMapType
    {
        none,
        usStates,
        usCounties,
    }

    export enum LabelPositon
    {
        left,
        top,
        right,
        bottom,
    }
}
 