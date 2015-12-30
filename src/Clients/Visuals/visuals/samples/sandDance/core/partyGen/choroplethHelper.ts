//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    choropletHelper.ts - helps read & process shapes from geoJSON files.
//-------------------------------------------------------------------------------------
//var mediumSales: any[];

/// <reference path="../_references.ts" />

module beachParty
{
    export class ChoroplethHelper
    {
        static atBottom(coords: any[])
        {
            var firstEntry = coords[0];
            var bottom = ((firstEntry.length === 2) && (!isNaN(firstEntry[0])));

            return bottom;
        }

        static buildPath(rc: ClientRect, ranges: any, coords: any[])
        {
            var linePath = "";

            for (var a = 0; a < coords.length; a++)
            {
                var coordA = coords[a];
                var atBottom = this.atBottom(coordA);

                if (atBottom)
                {
                    linePath = this.makePathPart(rc, linePath, coordA, ranges);
                }
                else
                {
                    for (var b = 0; b < coordA.length; b++)
                    {
                        var coorB = coordA[b];
                        linePath = this.makePathPart(rc, linePath, coorB, ranges);
                    }
                }
            }

            //vp.utils.debug("buildPath: linePath=" + linePath);

            return linePath;
        }

        static makePathPart(rc: ClientRect, linePath, coords, ranges)
        {
            linePath += "M ";

            for (var c = 0; c < coords.length; c++)
            {
                var coord = coords[c];
                var x = coord[0];
                var y = coord[1];

                var xScaled = vp.data.mapValue(x, ranges.xMin, ranges.xMax, rc.left, rc.right);
                var yScaled = vp.data.mapValue(y, ranges.yMin, ranges.yMax, rc.bottom, rc.top);

                if (c === 1)
                {
                    linePath += "L ";
                }

                linePath += xScaled + "," + yScaled + " ";
            }

            return linePath;
        }

        static computeXYRange(ranges: any, coords: any[])
        {
            for (var a = 0; a < coords.length; a++)
            {
                var coordA = coords[a];
                var atBottom = this.atBottom(coordA);

                if (atBottom)
                {
                    this.computeXYRangeEx(ranges, coordA);
                }
                else
                {
                    for (var b = 0; b < coordA.length; b++)
                    {
                        var coorB = coordA[b];
                        this.computeXYRangeEx(ranges, coorB);
                    }
                }
            }
        }

        static computeXYRangeEx(ranges: any, coords: any[])
        {
            for (var g = 0; g < coords.length; g++)
            {
                var coord = coords[g];
                var x = coord[0];
                var y = coord[1];

                if (isNaN(x) || isNaN(y))
                {
                    vp.utils.debug("NAN found: x=" + x + ", y=" + y);
                }

                ranges.xMin = Math.min(x, ranges.xMin);
                ranges.xMax = Math.max(x, ranges.xMax);

                ranges.yMin = Math.min(y, ranges.yMin);
                ranges.yMax = Math.max(y, ranges.yMax);
            }
        }

        static getShapeCoords(geoJson: any, shapeName: string)
        {
            var features = geoJson.features;

            for (var i = 0; i < features.length; i++)
            {
                var feature = features[i];
                if (feature.properties.NAME === shapeName)
                {
                    var coords = feature.geometry.coordinates;
                    break;
                }
            }

            return coords;
        }

        static getShapeCoordsByIndex(geoJson: any, index: number)
        {
            var feature = geoJson.features[index];
            var coords = null;

            if (feature)
            {
                var name = feature.properties.NAME;
                var coords = feature.geometry.coordinates;
                coords.name = name;
            }

            return coords;
        }

    }
} 