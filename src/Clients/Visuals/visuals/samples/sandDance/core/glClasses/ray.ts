//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    ray.ts - ray-based hit testing.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /** This code adpoted from XNA 4 Ray and BoundingBox classes (Microsoft). */
    export class RayClass
    {
        position: vp.geom.point3;
        direction: vp.geom.vector3;

        constructor(position: vp.geom.point3, direction: vp.geom.vector3)
        {
            this.position = position;
            this.direction = direction;
        }

        /** return null if no intersection found; otherwise returns distance to  intersection point. */
        intersectSphere(sphere): number
        {
            var spx = sphere.center.x - this.position.x;
            var spy = sphere.center.y - this.position.y;
            var spz = sphere.center.z - this.position.z;

            var num7 = ((spx * spx) + (spy * spy)) + (spz * spz);
            var num2 = sphere.radius * sphere.radius;

            if (num7 <= num2)
            {
                return 0;
            }

            var num = ((spx * this.direction.x) + (spy * this.direction.y)) + (spz * this.direction.z);
            if (num < 0)
            {
                return null;
            }
            var num6 = num7 - (num * num);
            if (num6 > num2)
            {
                return null;
            }

            var num8 = Math.sqrt(num2 - num6);
            return (num - num8);
        }

        /** return null if no intersection found; otherwise returns distance to intersection point. */
        intersectBox(box: BoundingBox): number
        {
            var num = 0;
            var maxValue = Number.MAX_VALUE;
            if (Math.abs(this.direction.x) < 1E-06)
            {
                if ((this.position.x <box.xMin) || (this.position.x > box.xMax))
                {
                    return null;
                }
            }
            else
            {
                var num11 = 1 / this.direction.x;
                var num8 = (box.xMin - this.position.x) * num11;
                var num7 = (box.xMax - this.position.x) * num11;
                if (num8 > num7)
                {
                    var num14 = num8;
                    num8 = num7;
                    num7 = num14;
                }
                num = Math.max(num8, num);

                maxValue = Math.min(num7, maxValue);
                if (num > maxValue)
                {
                    return null;
                }
            }

            if (Math.abs(this.direction.y) < 1E-06)
            {
                if ((this.position.y < box.yMin) || (this.position.y > box.yMax))
                {
                    return null;
                }
            }
            else
            {
                var num10 = 1 / this.direction.y;
                var num6 = (box.yMin - this.position.y) * num10;
                var num5 = (box.yMax - this.position.y) * num10;
                if (num6 > num5)
                {
                    var num13 = num6;
                    num6 = num5;
                    num5 = num13;
                }
                num = Math.max(num6, num);
                maxValue = Math.min(num5, maxValue);
                if (num > maxValue)
                {
                    return null;
                }
            }

            if (Math.abs(this.direction.z) < 1E-06)
            {
                if ((this.position.z < box.zMin) || (this.position.z > box.zMax))
                {
                    return null;
                }
            }
            else
            {
                var num9 = 1 / this.direction.z;
                var num4 = (box.zMin - this.position.z) * num9;
                var num3 = (box.zMax - this.position.z) * num9;
                if (num4 > num3)
                {
                    var num12 = num4;
                    num4 = num3;
                    num3 = num12;
                }
                num = Math.max(num4, num);
                maxValue = Math.min(num3, maxValue);
                if (num > maxValue)
                {
                    return null;
                }
            }

            return num;
        }
    }

    export class HitTestResult
    {
        distance: number;
        primaryKey: string;             // primary key of record of SHAPE under mouse/touch
        boundingBox: BoundingBox;

        constructor(dist: number, primaryKey: string, boundingBox: BoundingBox)
        {
            this.distance = dist;
            this.primaryKey = primaryKey;
            this.boundingBox = boundingBox;
        }
    }
}
