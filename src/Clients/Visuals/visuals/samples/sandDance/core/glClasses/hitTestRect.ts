//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    hitTestRect.ts - hit-testing of screen rectangle against set of bounding boxes.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class hitTestRect
    {
        private static ndcRects = null;
        private static buildTimer = null;

        //---- schedule a build the next time we are idle (should only be called AFTER animation is completed) ----
        public static markCacheBuildNeeded(transformer: transformerClass, boxMgr: boundingBoxMgrClass)
        {
            this.ndcRects = null;
            this.clearBuildTimer();

            //this.buildTimer = setTimeout((e) =>
            //{
            //    this.clearBuildTimer();
            //    this.buildNdcRects(transformer, boxes);
            //}, 100);
        }

        private static clearBuildTimer()
        {
            if (this.buildTimer)
            {
                clearTimeout(this.buildTimer);
                this.buildTimer = null;
            }
        }

        public static buildNdcRects(transformer: transformerClass, boxMgr: boundingBoxMgrClass)
        {
            vp.utils.debug("-- buildNdcRects --");

            var matWVP = transformer.getWorldViewProjection();
            this.ndcRects = [];
            var bbCount = boxMgr.getCount();

            //---- now, transform & test each box ----
            for (var i = 0; i < bbCount; i++)
            {
                var box = boxMgr.getBoxByIndex(i);
                var rcBox = this.transformBox(box, matWVP);

                this.ndcRects.push(rcBox);
            }
        }

        static getRectToPtDist(rc: ClientRect, pt: any)
        {
            //---- for now, just compute distance to center of rc ----
            var cx = (rc.left + rc.right) / 2;
            var cy = (rc.top + rc.bottom) / 2;

            var dx = pt.x - cx;
            var dy = pt.y - cy;

            var dist = dx * dx + dy * dy;       // don't need true dist (sqrt)
            return dist;
        }

        public static intersectUsingTransforms(rcScreen: ClientRect, transformer: transformerClass, boxMgr: boundingBoxMgrClass)
        {
            /// algorithm: transform each bounding box into NDC and then do simple rect/rect intersection test 
            if (!rcScreen)
            {
                throw "Error; rcScreen is null";
            }

            if (this.ndcRects === null)
            {
                this.buildNdcRects(transformer, boxMgr);
            }

            var intersections = [];
            var matWVP = transformer.getWorldViewProjection();

            //---- first, translate mouse rect from screen coordinates into NDC ----
            var mrLeftTop = transformer.viewportUntransformPoint(vp.geom.createVector3(rcScreen.left, rcScreen.top, 0));
            var mrRightBot = transformer.viewportUntransformPoint(vp.geom.createVector3(rcScreen.right, rcScreen.bottom, 0));

            //---- note: y values are swamped here because axis is flipped ----
            var rcMouse = vp.geom.createRect(mrLeftTop.x, mrRightBot.y, mrRightBot.x - mrLeftTop.x, mrLeftTop.y - mrRightBot.y);

            //---- ptMouse is used for distance testing ----
            var ptMouse = { x: (rcMouse.left + rcMouse.right) / 2, y: (rcMouse.top + rcMouse.bottom) / 2 };
            var bbCount = boxMgr.getCount();

            //---- now, transform & test each box ----
            for (var i = 0; i < bbCount; i++)
            {
                var rcBox = this.ndcRects[i];

                if (rcBox && vp.geom.rectIntersectsRect(rcBox, rcMouse))
                {
                    var dist = this.getRectToPtDist(rcBox, ptMouse);
                    var box = boxMgr.getBoxByIndex(i);

                    box.dist = dist;

                    intersections.push(box);
                }
            }

            return intersections;
        }

        public static transformBox(box: BoundingBox, matWVP: Float32Array)
        {
            //---- transform 8 points of box, and then form bounding rect from new points ----
            var xMin = box.xMin;
            var yMin = box.yMin;
            var zMin = box.zMin;

            var xMax = box.xMax;
            var yMax = box.yMax;
            var zMax = box.zMax;

            //---- allow for z-rotation ----
            if (box.theta)
            {
                var cx = (xMin + xMax) / 2;
                var cy = (yMin + yMax) / 2;
                var cz = (zMin + zMax) / 2;

                var sin = Math.sin(box.theta);
                var cos = Math.cos(box.theta);

                //var matCenter = mat4.translate(-cx, -cy, -cz);
                //var matPos = mat4.translate(cx, cy, cz);

                var mat = new Float32Array(16);
                mat4.identity(mat);

                //---- (in reverse order): move to center, rotate about z, move back, transform by WorldViewProjection ----
                mat4.multiply(mat, mat, matWVP);
                mat4.translate(mat, mat, [cx, cy, cz]);
                mat4.rotateZ(mat, mat, box.theta);
                mat4.translate(mat, mat, [-cx, -cy, -cz]);

                matWVP = mat;
            }

            var p1 = this.transformPoint(xMin, yMin, zMin, matWVP);
            var p2 = this.transformPoint(xMin, yMax, zMin, matWVP);
            var p3 = this.transformPoint(xMax, yMax, zMin, matWVP);
            var p4 = this.transformPoint(xMax, yMin, zMin, matWVP);

            var p5 = this.transformPoint(xMin, yMin, zMax, matWVP);
            var p6 = this.transformPoint(xMin, yMax, zMax, matWVP);
            var p7 = this.transformPoint(xMax, yMax, zMax, matWVP);
            var p8 = this.transformPoint(xMax, yMin, zMax, matWVP);

            var xMin = Math.min(p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x, p8.x);
            var yMin = Math.min(p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y, p8.y);

            var xMax = Math.max(p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x, p8.x);
            var yMax = Math.max(p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y, p8.y);

            var rc = vp.geom.createRect(xMin, yMin, xMax - xMin, yMax - yMin);
            return rc;
        }
        
        private static transformPoint(x, y, z, matrix)
        {
            var pos3 = new Float32Array(3);
            vec3.transformMat4(pos3, [x, y, z], matrix);
            var pos3x = vp.geom.createPoint3(pos3[0], pos3[1], pos3[2]);

            return pos3x;
        }

        public static intersectUsingFrustrum(rcScreen: ClientRect, transformer: transformerClass, origBoxes: any[])
        {
            /// Our algorithm removes boxes that are outside the bounding frustrum of rcScreen
            /// projected from the near to the far clipping planes.  Any objects that remain must be
            /// in, or overlap with, our frustrum.

            //---- make a copy of the list of boxes ----
            var boxes = vp.utils.copyArray(origBoxes);
            var zNear = 0;
            var zFar = .999;

            //---- get points aligned with near plane ---
            var np1 = transformer.unprojectFromScreen(rcScreen.left, rcScreen.bottom, zNear);
            var np2 = transformer.unprojectFromScreen(rcScreen.left, rcScreen.top, zNear);
            var np3 = transformer.unprojectFromScreen(rcScreen.right, rcScreen.top, zNear);
            var np4 = transformer.unprojectFromScreen(rcScreen.right, rcScreen.bottom, zNear);

            //---- get points aligned with far plane ---
            var fp1 = transformer.unprojectFromScreen(rcScreen.left, rcScreen.bottom, zFar);
            var fp2 = transformer.unprojectFromScreen(rcScreen.left, rcScreen.top, zFar);
            var fp3 = transformer.unprojectFromScreen(rcScreen.right, rcScreen.top, zFar);
            var fp4 = transformer.unprojectFromScreen(rcScreen.right, rcScreen.bottom, zFar);

            //---- eliminate boxes outside of each plane ----
            this.eliminateBoxesOutsidePlane(boxes, np1, np2, np3, np4);         // FRONT plane
            this.eliminateBoxesOutsidePlane(boxes, fp1, fp2, np2, np1);         // LEFT plane
            this.eliminateBoxesOutsidePlane(boxes, fp1, fp2, fp3, fp4);         // BACK plane
            this.eliminateBoxesOutsidePlane(boxes, np4, np3, fp3, fp4);         // RIGHT plane
            this.eliminateBoxesOutsidePlane(boxes, np3, np2, fp2, fp3);         // TOP plane
            this.eliminateBoxesOutsidePlane(boxes, np4, np1, fp1, fp4);         // BOTTOM plane

            return boxes;
        }

        private static eliminateBoxesOutsidePlane(boxes: BoundingBox[], p1, p2, p3, p4)
        {
            var plane = { p1: p2, p2: p2, p3: p3 };

            for (var i = boxes.length - 1; i >= 0; i--)
            {
                var box = boxes[i];

                if (this.isBoxOutsidePlane(box, plane))
                {
                    boxes.removeAt(i);
                }
            }
        }

        private static isBoxOutsidePlane(box: BoundingBox, plane)
        {
            //---- box is outside if all 8 of its points are outside ----
            var isOutside = true;

            var xMin = box.xMin;
            var yMin = box.yMin;
            var zMin = box.zMin;

            var xMax = box.xMax;
            var yMax = box.yMax;
            var zMax = box.zMax;

            if (! this.isPointOutsidePlane(xMin, yMin, zMin, plane))         // point 1
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMin, yMax, zMin, plane))     // point 2
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMax, yMax, zMin, plane))     // point 3
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMax, yMin, zMin, plane))     // point 4
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMin, yMin, zMax, plane))     // point 5
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMin, yMax, zMax, plane))     // point 6
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMax, yMax, zMax, plane))     // point 7
            {
                isOutside = false;
            }
            else if (!this.isPointOutsidePlane(xMax, yMin, zMax, plane))     // point 8
            {
                isOutside = false;
            }

            return isOutside;
        }

        private static isPointOutsidePlane(x, y, z, plane: any)
        {
            var q = vp.geom.createPoint3(x, y, z);

            //---- compute vector from pt1 of plane to q ----
            var pq = vp.geom.vector3.subtract(plane.p1, q);

            //---- compute normal of plane ----
            var normal = (plane.normal === undefined) ? this.getPlaneNormal(plane) : plane.normal;

            var dotValue = vp.geom.vector3.dot(normal, pq);
            var isOutside = (dotValue < 0);

            return isOutside;
        }

        private static getPlaneNormal(plane)
        {
            var vector3 = vp.geom.vector3;

            var u = vector3.subtract(plane.p2, plane.p1);
            var v = vector3.subtract(plane.p3, plane.p1);

            var x = (u.y * v.z) - (u.z - v.y);
            var y = (u.z * v.x) - (u.x - v.z);
            var z = (u.x * v.y) - (u.y - v.x);

            var normal = vp.geom.createVector3(x, y, z);
            plane.normal = normal;      // cache for later use

            return normal;
        }
    }
}