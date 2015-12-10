//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    shapeMaker.ts - generates shapes for containers.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class ShapeMaker
    {
        shapeType: ShapeType;
        strokeSize: number;
        shapeSize: number;
        svg: SVGElement;
        maxShapes: number;
        opacity: number;
        textCol: string;
        textSize = 16;

        //---- tooltips ----
        showTooltips: boolean;
        toolTipFields: string[];

        //---- fill ----
        shapeFill: string;
        fillColorMapping: bps.ColorMappingData;
        fillColorStat = StatType.none;
        fillScale: vp.scales.baseScale;
        fillVector: number[];

        //---- stroke ----
        shapeStroke: string;
        strokeColorMapping: bps.ColorMappingData;
        strokeColorStat = StatType.none;
        strokeScale: vp.scales.baseScale;
        strokeVector: number[];

        constructor(svg: SVGElement, shapeType = ShapeType.rectangle, shapeSize = 10, shapeFill = "none", shapeStroke = "#333", strokeSize = 1)
        {
            this.svg = svg;
            this.shapeType = shapeType;
            this.shapeFill = shapeFill;
            this.shapeStroke = shapeStroke;
            this.shapeSize = shapeSize;
            this.strokeSize = strokeSize;
            this.opacity = 1;

            this.textCol = "";

            this.fillColorMapping = new bps.ColorMappingData("", false, 12);
            this.strokeColorMapping = new bps.ColorMappingData("", false, 12);
        }

        generate(cellArray: CellData[], data: dataFrameClass, allData: dataFrameClass)
        {
            this.fillScale = null;
            this.strokeScale = null;

            if (this.svg)
            {
                var svgParentW = vp.select(this.svg);
                var rcAll = svgParentW.getBounds(false);
                rcAll = vp.geom.createRect(0, 0, rcAll.width, rcAll.height);

                //---- build color scales, if needed ----
                if (this.fillColorMapping.colName)
                {
                    this.buildColorPaletteFromSettings(this.fillColorMapping, allData);

                    //---- use allData to build color scale (for consistency and full color range across containers) ----
                    var result = this.buildShapeColorScale(this.fillColorMapping, this.fillColorStat, allData);
                    this.fillScale = result.scale;
                    this.fillVector = null;

                    if (this.fillScale)
                    {
                        //---- use data to build fillVector (for color values for this container) ----
                        this.fillVector = data.getNumericVector(result.colName, false, result.keys, false).values.toArray();
                    }
                }

                if (this.strokeColorMapping.colName)
                {
                    this.buildColorPaletteFromSettings(this.strokeColorMapping, data);

                    //---- use allData to build color scale (for consistency and full color range across containers) ----
                    var result = this.buildShapeColorScale(this.strokeColorMapping, this.fillColorStat, data);
                    this.strokeScale = result.scale;
                    this.strokeVector = null;

                    if (this.strokeScale)
                    {
                        //---- use data to build strokeVector (for color values for this container) ----
                        this.strokeVector = data.getNumericVector(result.colName, false, result.keys).values.toArray();
                    }
                }

                if (this.shapeType == ShapeType.line)
                {
                    this.genLine(cellArray, data);
                }
                else if (this.shapeType != ShapeType.none)
                {
                    for (var i = 0; i < cellArray.length; i++)
                    {
                        var cellData = cellArray[i];
                        //var rcAny = <any>cellData.rect;
                        var dataItem = data.getRecordByVectorIndex(i);

                        if (cellData.cellShape == CellShape.path)
                        {
                            this.genSinglePath(cellData, dataItem, i, data);
                        }
                        else
                        {
                            this.genSingle(cellData, dataItem, i, data);
                        }
                    }
                }
            }
        }

        genLine(cellData: CellData[], data: dataFrameClass)
        {
            var svgW = vp.select(this.svg);
            var points = "M ";

            var fill = this.getFillColor(0);
            var stroke = this.getStrokeColor(0);

            for (var i = 0; i < cellData.length; i++)
            {
                var rc = cellData[i].rect;
                var x = rc.left + rc.width / 2;
                var y = rc.top + rc.height / 2;

                if (i == 1)
                {
                    points += "L ";
                }

                points += x + "," + y + " ";
            }

            svgW.append("path")
                .colors(fill, stroke, this.strokeSize)
                .attr("opacity", this.opacity)
                .attr("d", points)
        }

        makeTooltip(record, dataFrame: dataFrameClass)
        {
            var ttMsg = "";

            if (this.toolTipFields)
            {
                var keys = this.toolTipFields;
            }
            else
            {
                var keys = vp.utils.keys(record);
                keys.sort();
            }

            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];
                var value = record[key];
                var colType = dataFrame.getColType(key);

                if (colType == "number")
                {
                    value = vp.formatters.comma(value, 2, false, true);
                }
                else if (colType == "date")
                {
                    value = vp.formatters.formatDateTime(value, " m/dd/yyyy");
                }

                if (!key.startsWith("_"))
                {
                    if (i > 0)
                    {
                        //---- NOTE: linebreaks on SVG tooltips are not supported by IE. ----
                        ttMsg += "\n";
                    }

                    ttMsg += key + ": " + value;
                }
            }

            return ttMsg;
        }

        getFillColor(index: number)
        {
            var fill = this.shapeFill;

            if (this.fillScale)
            {
                var value = this.fillVector[index];
                var paletteIndex = this.fillScale.scale(value);
                if (paletteIndex != undefined)
                {
                    fill = vp.color.colorFromPalette(this.fillColorMapping.colorPalette, paletteIndex);
                }
            }

            return fill;
        }

        getStrokeColor(index: number)
        {
            var stroke = this.shapeStroke;

            if (this.strokeScale)
            {
                var value = this.strokeVector[index];
                var paletteIndex = this.strokeScale.scale(value);

                if (paletteIndex != undefined)
                {
                    stroke = vp.color.colorFromPalette(this.strokeColorMapping.colorPalette, paletteIndex);
                }
            }

            return stroke;
        }

        //genPath(cellArray: CellData[], data: dataFrameClass)
        //{
        //    var svgW = vp.select(this.svg);

        //    for (var i = 0; i < cellArray.length; i++)
        //    {
        //        var cellData = cellArray[i];
        //        var path = cellData.path;

        //        if (path)
        //        {
        //            var fill = this.getFillColor(i);
        //            var stroke = this.getStrokeColor(i);
        //            var dataRecord = data.getRecord(i);
        //            var tipText = (this.showTooltips) ? this.makeTooltip(dataRecord, data) : null;

        //            svgW.append("path")
        //                .colors(fill, stroke, this.strokeSize)
        //                .attr("d", path)
        //                .attr("tooltip", tipText);
        //        }
        //    }
        //}

        genSinglePath(cellData: CellData, dataRecord: any[], index: number, dataFrame: dataFrameClass)
        {
            var tipText = (this.showTooltips) ? this.makeTooltip(dataRecord, dataFrame) : null;

            var fill = this.getFillColor(index);
            var stroke = this.getStrokeColor(index);
            var svgW = vp.select(this.svg);
            var path = cellData.path;

            if (this.shapeType == ShapeType.path)
            {
                svgW.append("path")
                    .colors(fill, stroke, this.strokeSize)
                    .attr("d", path)
                    .attr("tooltip", tipText);
            }
            else if (this.shapeType == ShapeType.circle)
            {

            }
        }

        genSingle(cellData: CellData, dataRecord: any[], index: number, dataFrame: dataFrameClass)
        {
            var rc = cellData.rect;

            var left = rc.left;
            var top = rc.top;

            var cx = left + rc.width / 2;
            var cy = top + rc.height / 2;
            var svgW = vp.select(this.svg);

            var halfSize = this.shapeSize / 2;

            var tipText = (this.showTooltips) ? this.makeTooltip(dataRecord, dataFrame) : null;

            var fill = this.getFillColor(index);
            var stroke = this.getStrokeColor(index);

            if (this.shapeType == ShapeType.circle)
            {
                var elemW = svgW.append("circle")
                    .attr("r", halfSize)
                    .colors(fill, stroke, this.strokeSize)
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("opacity", this.opacity)
            }
            else if (this.shapeType == ShapeType.circleFill)
            {
                var radius = Math.min(rc.width, rc.height) / 2;

                var elemW = svgW.append("circle")
                    .attr("r", radius)
                    .colors(fill, stroke, this.strokeSize)
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("opacity", this.opacity)
            }
            else if (this.shapeType == ShapeType.square)
            {
                var x = cx - halfSize;
                var y = cy - halfSize;

                var elemW = svgW.append("rect")
                    .colors(fill, stroke, this.strokeSize)
                    .bounds(x, y, this.shapeSize, this.shapeSize)
                    .attr("opacity", this.opacity)
            }
            else if (this.shapeType == ShapeType.rectangle)
            {
                var left = rc.left;
                var top = rc.top;
                var width = rc.width;
                var height = rc.height;

                if (cellData.cellShape == CellShape.circle)
                {
                    var r = Math.min(width, height) / 2;

                    var half = r / Math.sqrt(2);
                    var width = 2 * half;     
                    height = width;   

                    left = cellData.circle.cx - half;
                    top = cellData.circle.cy - half;
                }

                var elemW = svgW.append("rect")
                    .colors(fill, stroke, this.strokeSize)
                    .bounds(left, top, width, height)
                    .attr("opacity", this.opacity)
            }
            else if (this.shapeType == ShapeType.text)
            {
                var text = dataRecord[this.textCol];

                var elemW = svgW.append("text")
                    .colors(fill, stroke, this.strokeSize)
                    .attr("x", cx)
                    .attr("y", cy)
                    .attr("text-anchor", "middle")
                    .attr("opacity", this.opacity)
                    .text(text)

                if (this.textSize)
                {
                    elemW.css("font-size", this.textSize + "px");
                }

                //---- vertical align text in middle of cell ----
                var delta = vp.dom.computeTextBaselineDelta(elemW[0], "middle");
                elemW.attr("dy", delta);
            }
            else
            {
                throw "Error: shapeType not yet supported: " + this.shapeType;
            }

            if (elemW && tipText)
            {
                elemW.attr("tooltip", tipText);
            }
        }

        buildShapeColorScale(cm: bps.ColorMappingData, statType: StatType, allData: dataFrameClass)
        {
            var colName = cm.colName;
            var scale = null;
            var keys = null;

            //---- do we want the aggregated column, or the regular?  which is present? ----
            var statInfo = new StatInfo(colName, statType);
            var aggColName = statInfo.getAggColName();

            if (allData.isColumnName(aggColName))
            {
                colName = aggColName;
            }

            var nvColorIndex = allData.getNumericVector(colName, false);

            if (nvColorIndex)
            {
                var isContinuous = cm.isContinuous;
                var colorCount = cm.colorPalette.length;

                //---- palette index=0 is reserved for the selection color, so we use index=1 to index=N for our colors ----
                var maxIndex = colorCount;
                var maxColors = colorCount;

                keys = (nvColorIndex.keyInfo) ? nvColorIndex.keyInfo.sortedKeys : null;

                if (!isContinuous)
                {
                    //---- if keyCount is smaller than color palette, only map to keyCount entries ----
                    if (nvColorIndex && nvColorIndex.keyInfo && nvColorIndex.keyInfo.keyCount)
                    {
                        var keyCount = nvColorIndex.keyInfo.keyCount;
                        if (keyCount < colorCount)
                        {
                            maxIndex = keyCount;
                            maxColors = keyCount;
                        }
                        else if (keyCount > colorCount)
                        {
                            //---- scale for # of keys & then truncate to maxColors (in vertex shader) ----
                            maxIndex = keyCount;
                        }
                    }

                    //---- add this so that when we take floor(scaledValue), we correctly map to stepped palette entries ----
                    maxIndex += .999999;         // adding another "9" here breaks scaling on WebGL (gets interpreted as a "1")
                }

                if (cm.customScalingCallback)
                {
                    if (vp.utils.isString(cm.customScalingCallback))
                    {
                        //----  convert from string to func ----
                        var foo = null;
                        eval("foo = " + cm.customScalingCallback);

                        var customScale: any = {};
                        customScale.scale = foo;

                        cm.customScalingCallback = customScale;
                    }

                    colorIndexScale = cm.customScalingCallback;
                }
                else
                {
                    var result = utils.getMinMax(nvColorIndex, null);       //  nv.layoutFilter);

                    if (cm.spread == bps.MappingSpread.low)
                    {
                        var colorIndexScale = vp.scales.createLowBias()
                            .domainMin(result.min)
                            .domainMax(result.max)
                            .range(1, maxIndex)

                    }
                    else if (cm.spread == bps.MappingSpread.high)
                    {
                        var colorIndexScale = vp.scales.createHighBias()
                            .domainMin(result.min)
                            .domainMax(result.max)
                            .range(1, maxIndex)

                    }
                    else
                    {
                        var colorIndexScale = vp.scales.createLinear()
                            .domainMin(result.min)
                            .domainMax(result.max)
                            .range(1, maxIndex)
                    }
                }
            }

            return { scale: colorIndexScale, keys: keys, colName: colName };
        }

        buildColorPaletteFromSettings(cm: bps.ColorMappingData, dataFrame: dataFrameClass)
        {
            if (cm)
            {
                var colName = cm.colName;

                if (colName)
                {
                    var numVector = dataFrame.getNumericVector(colName);
                    var colType = numVector.colType;
                    var isCategory = (cm.forceCategory || colType == "string");

                    var paletteName = cm.paletteName;
                    if (!paletteName)
                    {
                        paletteName = (isCategory) ? "Paired" : "Blues";
                    }

                    var palette = colorPalettesClass.getPaletteFromSettings(paletteName, cm.stepsRequested, cm.isReversed);
                    var breaks = null;

                    if (isCategory)
                    {
                        var keys = numVector.keyInfo.sortedKeys;

                        var keyCount = keys.length;

                        if (keyCount < palette.length)
                        {
                            palette = palette.slice(0, keyCount);
                        }

                        breaks = [];

                        for (var i = 0; i < palette.length; i++)
                        {
                            if (i == palette.length - 1 && keyCount > palette.length)
                            {
                                breaks.push("Other");
                            }
                            else
                            {
                                breaks.push(keys[i]);
                            }
                        }
                    }

                    //---- add a selected color at palette[0] so that our color scaling works correctly ----
                    palette.insert(0, "pink");

                    cm.colorPalette = palette;
                    cm.breaks = breaks;
                }
            }
        }

    }

    export enum ShapeType
    {
        none,           // do not generate shapes for this value
        circle,
        circleFill,
        line,
        path,
        square,
        rectangle,      // stretches to fill cell
        text,
    }

}