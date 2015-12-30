//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    transformer.ts - manages the projection, view, and world matrices for a visualization.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class TransformerClass extends DataChangerClass
    {
        _matProjection: Float32Array;  // vp.geom.matrix4;
        _matView: Float32Array;     // vp.geom.matrix4;
        _matWorld: Float32Array;        // vp.geom.matrix4;
        _gl: any;

        _xRotation = 0;
        _yRotation = 0;
        _zRotation = 0;

        _cameraPos: vp.geom.vector3;
        _cameraLookAt: vp.geom.vector3;
        _rcxWorld: Rect3d = null;
        //_baseSizeFactor = 1;

        _canvasWidth = 1;
        _canvasHeight = 1;
        _isOrthoCamera = false;

        _transformChanged = true;

        /// When "_useScreenUnits" is true, we experience problems:
        ///   - shapes with depth are extruced greatly in Z (looks wrong)
        ///   - rotation about the Y and X axis make the chart disappear.

        /// So, as of 2/3/2015, we are sticking to using perspectiveFOV for non-ortho camera
        /// even though this means we cannot use screen coordinates (which are handy, especially when
        /// specifying the size of shapes.

        //---- use SCREEN units for perspective camera ----
        _useScreenUnits = false;

        constructor(gl: any)
        {
            super();

            this._gl = gl;

            this.resetMatrices();

            //this.testXnaPick();
        }

        rebuildProjectionMatrix(cameraPosZ: number)
        {
            var rads = vp.utils.toRadians(45);

            var cw = this._canvasWidth;
            var ch = this._canvasHeight;
            var nearDist = .001;
            var farDist = 20000;

            var margin = 15;
            var cwx = cw - margin;
            var chx = ch - margin;
            var aspect = cwx / chx;

            //vp.utils.debug("rebuildProjectionMatrix: cw=" + cw + ", ch=" + ch + ", aspect=" + aspect);

            this._matProjection = new Float32Array(16);

            if (this._isOrthoCamera)
            {
                //---- ORTHO: using screen coordinates ----
                this._rcxWorld = { left: -cwx / 2, right: cwx / 2, top: -chx / 2, bottom: chx / 2, front: nearDist, back: farDist };

                var nearPos = -5000;        // cameraPosZ - nearDist;
                var farPos = 20000;     // cameraPosZ - farDist;

                //this._matProjection = vp.geom.matrix4.createOrthographic(cw, ch, zMin, zMax);
                mat4.ortho(this._matProjection, -cw / 2, cw / 2, ch / 2, -ch / 2, nearPos, farPos);
                //this._baseSizeFactor = 1;
            }
            else
            {
                if (this._useScreenUnits)
                {
                    //---- PERSPECTIVE: using screen coordinates ----
                    this._rcxWorld = { left: -cwx / 2, right: cwx / 2, top: -chx / 2, bottom: chx / 2, front: nearDist, back: farDist };

                    //this._matProjection = vp.geom.matrix4.createPerspectiveRH(cw, ch, zMin, zMax);
                    mat4.frustum(this._matProjection, -cw / 2, cw / 2, ch / 2, -ch / 2, nearDist, farDist);
                    //this._baseSizeFactor = 1;
                }
                else
                {
                    //---- old method hard-coded the values, which were usually close to right ----
                    //var yb = percentToUse * 2.899;      // 2.8;
                    //var xb = aspect * yb;               // 4.2;

                    var zDepth = 4;    // the range of z values in world units where we place models

                    if (false)
                    {
                        //---- old way ----
                        var nearDist = .001;
                        var farDist = 20000;
                    }
                    else
                    {
                        //---- according to this article, the near plane should not be too close to zero ----
                        //---- https://www.opengl.org/archives/resources/faq/technical/depthbuffer.htm ----

                        var nearDist = 1;      
                        var farDist = nearDist + 100;    
                        //zDepth = 20;  
                    }

                    var zBack = -zDepth / 2;        // farDist;        
                    var zFront = zDepth / 2;        // zNear

                    //var matrix4Projection = vp.geom.matrix4.createPerspectiveFovRH(rads, cw / ch, zMin, zMax);
                    mat4.perspective(this._matProjection, rads, aspect, nearDist, farDist);

                    var ptWorld = this.unprojectFromScreen(0, 0, undefined, true);
                    var xb = Math.abs(ptWorld.x);
                    var yb = Math.abs(ptWorld.y);

                    //---- PERSPECTIVE: using 3D camera coordinates ----
                    this._rcxWorld = { left: -xb, right: xb, top: yb, bottom: -yb, front: zFront, back: zBack };

                    //this._baseSizeFactor = .01;
                }
            }
        }

        public resetMatrices()
        {
            var zPos = (this._useScreenUnits) ? .001 : 7;   //7;       // why do we need to specify exactly ".001" for perspective with screen units?

            var cameraPos = vp.geom.createVector3(0, 0, zPos);
            var lookAt = vp.geom.createVector3(0, 0, -1);
            var up = vp.geom.createVector3(0, 1, 0);

            this._matView = new Float32Array(16);
            mat4.lookAt(this._matView, this.toFloatv3(cameraPos), this.toFloatv3(lookAt), this.toFloatv3(up));

            this._cameraLookAt = lookAt;
            this._cameraPos = cameraPos;

            //this._matWorld = vp.geom.matrix4.identity();
            this._matWorld = new Float32Array(16);
            mat4.identity(this._matWorld);

            this.rebuildProjectionMatrix(zPos);

            //this.updateRcxWorld();
            this._transformChanged = true;
        }

        /// NOT YET WORKING; for now, just use our best guess method of yb = 2.899 and xb=aspect*yb.
        ///** recompute bounds of available World coordinate space (those that map into our screen). */
        //updateRcxWorld()
        //{
        //    var ptMin = this.unprojectFromNDC(-1, -1);
        //    var ptMax = this.unprojectFromNDC(1, 1);

        //    this._rcxWorld.left = ptMin.x;
        //    this._rcxWorld.right = ptMax.x;
        //    this._rcxWorld.top = ptMin.y;
        //    this._rcxWorld.bottom = ptMax.y;
        //}

        testXnaPick()
        {
            var width = 880;
            var height = 580;
            var near = .001;
            var far = 20000;

            var geom = vp.geom;
            var matrix4 = geom.matrix4;

            var rads = vp.utils.toRadians(45);
            var aspect = width / height;

            var matWorld = matrix4.identity();
            var matView = matrix4.createLookAt(geom.createVector3(0, 0, 7), geom.createVector3(0, 0, 0), geom.createVector3(0, 1, 0));
            var matProjection = matrix4.createPerspectiveFovLH(rads, aspect, near, far);        // use LH for this test ONLY!

            var ptNear = TransformerClass.unprojectXna(vp.geom.createVector3(875, 575, 0), width, height, matWorld, matView, matProjection);
            var ptFar = TransformerClass.unprojectXna(vp.geom.createVector3(875, 575, .9999), width, height, matWorld, matView, matProjection);

            vp.utils.debug("------------------");
            vp.utils.debug("ptNear: " + ptNear);
            vp.utils.debug("ptFar: " + ptFar);
            vp.utils.debug("------------------");
        }

        public getProjection()
        {
            return this._matProjection;
        }

        public getView()
        {
            return this._matView;
        }

        public world(value?: Float32Array)
        {
            if (arguments.length === 0)
            {
                return this._matWorld;
            }

            if (value)
            {
                this._matWorld = value;
                this.onDataChanged("world");
            }
        }

        private multiplyTransform(matTransform)
        {
            //---- for RIGHT HAND WebGL - matrix are applied in reverse order (right to left) ----

            if (false)
            {
                //---- as per Mark Finch's advice, we switched the order here and got ----
                //---- the screen-based axis rotation that we wanted! ----
                mat4.multiply(this._matWorld, this._matWorld, matTransform);
            }
            else
            {
                //---- something changed as of May-27-2015; we seem to be tranforming the CAMERA instead of the SHAPES, so let's try the old order ----
                mat4.multiply(this._matWorld, matTransform, this._matWorld);
            }

            this._transformChanged = true;
        }

        public clearTransforms()
        {
            mat4.identity(this._matWorld);
            this._transformChanged = true;
        }

        public getWorldViewProjection()
        {
            //---- webGL order (mat = mat x new) ----

            var matAll = new Float32Array(16);

            mat4.identity(matAll);
            mat4.multiply(matAll, matAll, this._matProjection);
            mat4.multiply(matAll, matAll, this._matView);
            mat4.multiply(matAll, matAll, this._matWorld);

            return matAll;
        }

        postProjTransformAdjust(v: vp.geom.vector4)
        {
            var w = (v.w === 0) ? 1 : v.w;
            
            return new vp.geom.vector3(v.x/w, v.y/w, v.z/w);
        }

        /** map a point from MODEL space to SCREEN space. */
        public projectToScreen(x: number, y: number, z: number)
        {
            var pos3x = this.projectToNDC(x, y, z);
            var screenPos = this.viewportTransformPoint(pos3x);

            return screenPos;

        }

        /** map a point from MODEL space to NDC space (-1 to 1). */
        public projectToNDC(x: number, y: number, z: number)
        {
            //var pos = new vp.geom.vector3(x, y, z);
            z = z || 0;

            var wvp = this.getWorldViewProjection();

            //var pos4 = vp.geom.matrix4.transformPoint(wvp, pos);
            //var pos3 = this.postProjTransformAdjust(pos4);

            var pos3 = new Float32Array(3);
            vec3.transformMat4(pos3, [x, y, z], wvp);
            var pos3x = vp.geom.createPoint3(pos3[0], pos3[1], pos3[2]);

            return pos3x;
        }

        public unprojectFromNDCUsingMarksApproach(x: number, y: number)
        {
            //var screenPosOfOrigin = this.project(0, 0, 0);

            //---- technique for determining zScreen, from mark finch ----

            //---- objPos is the center of the object is camera space ----
            //var objPos = new vp.geom.vector3(0, 0, 0);
            //objPos = vp.geom.matrix4.transformPoint(this._matWorld, objPos);
            //objPos = vp.geom.matrix4.transformPoint(this._matView, objPos);

            //---- objPos is the center of the object is camera space ----
            var objPos = [0, 0, 0];
            vec3.transformMat4(objPos, objPos, this._matWorld);
            vec3.transformMat4(objPos, objPos, this._matView);

            //---- dist = lookAt dot (cameraPos - objPos) ----
            //var pos = vp.geom.vector3.subtract(this._cameraPos, objPos);
            //var distance = vp.geom.vector3.dot(this._cameraLookAt, pos);

            //---- dist = lookAt dot (cameraPos - objPos) ----
            var pos = [0, 0, 0];
            vec3.subtract(pos, this.toFloatv3(this._cameraPos), objPos);
            var distance = vec3.dot(this.toFloatv3(this._cameraLookAt), pos);

            //--- zScreen = dist * proj.m22 + proj.m32 (per mark finch) ----
            var matProj = this._matProjection;
            var zScreen = Math.abs(distance * matProj[5] + matProj[6]);         // is m32  matProj[6] or matProj[9]?   

            //var test = this.projectToNDC(x, y, 0);
            //zScreen = test.z;

            vp.utils.debug("unproject: distance=" + distance + ", zScreen=" + zScreen);

            var posScr = this.unprojectFromNDCCore(x, y, zScreen);
            return posScr;
        }

        /** map from NDC (-1 to 1) to WORLD space */
        public unprojectFromNDC(x: number, y: number)
        {
            var pt = null;

            //---- build ray from near to far plane ----
            var ptNear = this.unprojectFromNDCCore(x, y, 0);
            var ptFar = this.unprojectFromNDCCore(x, y, 1);

            var rayOrigin = ptNear;

            var ptDiffs = vp.geom.vector3.subtract(ptFar, ptNear);     
            if (ptDiffs.x === 0 && ptDiffs.y === 0 && ptDiffs.z === 0)
            {
                pt = ptNear;            // ptNear=ptFar
            }
            else
            {
                var rayDir = vp.geom.vector3.normal(ptDiffs);

                //---- now, caculate the point where ray intersects the z=0 plane ----
                var dist = -rayOrigin.z / rayDir.z;
                dist = 5.8;   // this is about what dist should be (actually, 6.999) 
                pt = vp.geom.vector3.add(rayOrigin, vp.geom.vector3.multiply(rayDir, dist));
            }

            return pt;
        }

        public getRayFromScreenPos(x: number, y: number)
        {
            var pt = null;

            //---- build ray from near to far plane ----
            var ptn = this.unprojectFromScreen(x, y, 0);
            var ptf = this.unprojectFromScreen(x, y, .9999);

            var ptNear = this.toFloatv3(ptn);
            var ptFar = this.toFloatv3(ptf);

            var rayOrigin = ptNear;
            var rayDir = new Float32Array(3);

            var diffs = new Float32Array(3);
            vec3.subtract(diffs, ptFar, ptNear);        // ptNear, ptFar);

            if (diffs[0] === 0 && diffs[1] === 0 && diffs[2] === 0)
            {
                pt = ptNear;            // ptNear=ptFar
            }
            else
            {
                vec3.normalize(rayDir, diffs);
            }

            //var ptNear = transformerClass.unprojectXna(vp.geom.createVector3(875, 575, 0), width, height, matWorld, matView, matProjection);
            //var ptFar = transformerClass.unprojectXna(vp.geom.createVector3(875, 575, .9999), width, height, matWorld, matView, matProjection);

            var origin = vp.geom.createVector3(rayOrigin[0], rayOrigin[1], rayOrigin[2]);
            var dir = vp.geom.createVector3(rayDir[0], rayDir[1], rayDir[2]);

            //vp.utils.debug("getRayFromScreenPos: ptNear=" + ptn);
            //vp.utils.debug("getRayFromScreenPos: ptFar=" + ptf);

            //vp.utils.debug("getRayFromScreenPos: origin=" + origin);
            //vp.utils.debug("getRayFromScreenPos: dir=" + dir);

            var ray = new RayClass(origin, dir);
            return ray;
        }

        /** map from NDC (-1 to 1) to WORLD space (using glmatrix library) */
        public unprojectFromNDCEx(x: number, y: number)
        {
            var pt = null;

            //---- build ray from near to far plane ----
            var ptNear = this.toFloatv3(this.unprojectFromNDCCore(x, y, 0));
            var ptFar = this.toFloatv3(this.unprojectFromNDCCore(x, y, 1));

            var rayOrigin = ptNear;

            var diffs = new Float32Array(3);
            vec3.subtract(diffs, ptFar, ptNear);        // ptNear, ptFar);

            if (diffs[0] === 0 && diffs[1] === 0 && diffs[2] === 0)
            {
                pt = ptNear;            // ptNear=ptFar
            }
            else
            {
                var rayDir = new Float32Array(3);
                vec3.normalize(rayDir, diffs);

                //---- now, caculate the point where ray intersects the z = 0 plane ----
                var dist = -rayOrigin[2] / rayDir[2];       // .z;

                var product = new Float32Array(3);
                pt = new Float32Array(3);

                vec3.scale(product, rayDir, dist);
                vec3.add(pt, product, rayOrigin);
            }

            return { x: pt[0], y: pt[1], z: pt[2] };
        }

        /** map from HC (-1 to 1) to WORLD space */
        unprojectFromNDCCore(x: number, y: number, z: number, omitWorld?: boolean)
        {
            var invProjection = mat4.create();
            mat4.invert(invProjection, this._matProjection);

            var invView = mat4.create();
            mat4.invert(invView, this._matView);

            var invWorld = mat4.create();
            mat4.invert(invWorld, this._matWorld);

            //---- apply INV PROJECTION ----
            //var pt4 = new Float32Array(4);
            //vec4.transformMat4(pt4, [x, y, z, 1], invProjection);
            //var w = pt4[3];
            //var vp3 = [pt4[0] / w, pt4[1] / w, pt4[2] / w];

            var pt3 = new Float32Array(3);
            vec3.transformMat4(pt3, [x, y, z], invProjection);

            //---- apply INV VIEW ----
            var pp = new Float32Array(3);
            vec3.transformMat4(pp, pt3, invView);

            //---- apply INV WORLD ----
            if (omitWorld)
            {
                vWorld = pp;
            }
            else
            {
                var vWorld = new Float32Array(3);
                vec3.transformMat4(vWorld, pp, invWorld);
            }

            var posWorld = vp.geom.createPoint3(vWorld[0], vWorld[1], vWorld[2]);
            return posWorld;
        }

        public getInvMvpMatrix()
        {
            //var mat = this.getWorldViewProjection();

            var mat = mat4.create();

            mat4.identity(mat);
            mat4.multiply(mat, mat, this._matProjection);
            mat4.multiply(mat, mat, this._matView);
            mat4.multiply(mat, mat, this._matWorld);
            mat4.invert(mat, mat);

            return mat;
        }

        public getInvWorldpMatrix()
        {
            var mat = mat4.create();
            mat4.invert(mat, this._matWorld);

            return mat;
        }

        /** static version of unprojectFromScreen(), XNA style. */
        public static unprojectXna(vScr, vpWidth: number, vpHeight: number, matWorld, matView, matProjection)
        {
            var vpX = 0;
            var vpY = 0;
            var vpMinDepth = 0;
            var vpMaxDepth = 1;

            //---- transform from screen to NDC ---
            var position = new Float32Array(3);
            position[0] = (((vScr.x - vpX) / (vpWidth)) * 2) - 1;
            position[1] = -((((vScr.y - vpY) / (vpHeight)) * 2) - 1);
            position[2] = (vScr.z - vpMinDepth) / (vpMaxDepth - vpMinDepth);

            //---- this is the order that matches XNA results, but may have to be reverse for WebGL: projection, view, world ----
            var mat = mat4.create();

            mat4.identity(mat);
            mat4.multiply(mat, mat, matProjection);
            mat4.multiply(mat, mat, matView);
            mat4.multiply(mat, mat, matWorld);
            mat4.invert(mat, mat);

            //---- transform position with mat ----
            var vector = new Float32Array(3);
            vec3.transformMat4(vector, position, mat);

            //---- this part is handled by vec3.transformMat4 ----
            //var a = (((position[0] * m14) + (position[1] * m24)) + (position[2] * m34)) + m44;

            //if (! this.withinEpsilon(a, 1))
            //{
            //    vec3.scale(vector, vector, 1 / a);
            //}

            var posWorld = vp.geom.createPoint3(vector[0], vector[1], vector[2]);
            return posWorld;
        }

        static withinEpsilon(a: number, b: number)
        {
            var epsilon = 1.401298E-45;
            var num = a - b;
            return ((-1.401298E-45 <= num) && (num <= epsilon));
        }

        /** static version of unprojectFromScreen(). */ 
        public static unprojectEx(vScr, vpWidth: number, vpHeight: number, matWorld, matView, matProjection)
        {
            //---- transform from screen to NDC ---
            var newX = vp.data.mapValue(vScr.x, 0, vpWidth-1, -1, 1);
            var newY = vp.data.mapValue(vScr.y, 0, vpHeight-1, 1, -1);
            var newZ = vScr.z;

            //---- invert matrices ----
            var invProjection = mat4.create();
            mat4.invert(invProjection, matProjection);

            var invView = mat4.create();
            mat4.invert(invView, matView);

            var invWorld = mat4.create();
            mat4.invert(invWorld, matWorld);

            //---- apply inverted PROJECTION ----
            var pt4 = new Float32Array(4);
            vec4.transformMat4(pt4, [newX, newY, newZ, 1], invProjection);

            //--- correct with "w" when going from vec4 to vec3 ----
            var w = pt4[3];
            var vp3 = [pt4[0] / w, pt4[1] / w, pt4[2] / w];

            //---- apply inverted VIEW ----
            var ptView = new Float32Array(3);
            vec3.transformMat4(ptView, vp3, invView);

            //---- apply inverted WORLD ----
            var ptWorld = new Float32Array(3);
            vec3.transformMat4(ptWorld, ptView, invWorld);

            var posWorld = vp.geom.createPoint3(ptWorld[0], ptWorld[1], ptWorld[2]);
            return posWorld;
        }

        public getCameraPosAsArray()
        {
            return [this._cameraPos.x, this._cameraPos.y, this._cameraPos.z];
        }

        public getNdcZ()
        {
            //---- before we can unproject screen boundaries to get world space, we need to get the z from projection ----
            var pt3 = this.projectToNDC(0, 0, 0);
            var zNorm = pt3.z;

            return zNorm;
        }

        /** map a point from SCREEN space to MODEL space. */
        public unprojectFromScreen(xScreen: number, yScreen: number, zNorm?: number, omitWorld?: boolean)
        {
            if (zNorm === undefined)
            {
                zNorm = this.getNdcZ();
            }

            var ptNC = this.viewportUntransformPoint(vp.geom.createVector3(xScreen, yScreen, 0));
            var ptWorld = this.unprojectFromNDCCore(ptNC.x, ptNC.y, zNorm, omitWorld);

            return ptWorld;
        }

        /** maps point from homogeneous space (-1 to +1) to screen space. */
        public viewportTransformPoint(v: vp.geom.vector3)
        {
            var width = this._canvasWidth;
            var height = this._canvasHeight;

            var newX = vp.data.mapValue(v.x, -1, 1, 0, width);
            var newY = vp.data.mapValue(v.y, -1, 1, height, 0);
            var newZ = v.z;           //vp.data.mapValue(v.z, 0, 1, 0, ??);

            return new vp.geom.vector3(newX, newY, newZ);
        }

        /** maps point from screen space to homogeneous space (-1 to +1). */
        public viewportUntransformPoint(v: vp.geom.vector3)
        {
            var width = this._canvasWidth;
            var height = this._canvasHeight;

            var newX = vp.data.mapValue(v.x, 0, width, -1, 1);
            var newY = vp.data.mapValue(v.y, height, 0, -1, 1);
            var newZ = v.z;        

            return new vp.geom.vector3(newX, newY, newZ);
        }

        public scaleMatrix(factor: number, mousePos: any)
        {
            //---- map mouse position from screen to world coordinates ----
            var modelPos = this.unprojectFromScreen(mousePos.x, mousePos.y);
            
            this.scaleMatrixAt(factor, modelPos);
        }

        /** here, bounds.x is xMin, bounds.y is yMin.  */
        public worldBoundsToScreen(bounds: Bounds)
        {
            var min = this.projectToScreen(bounds.x, bounds.y, 0);
            var max = this.projectToScreen(bounds.x + bounds.width, bounds.y + bounds.height, 0);

            //---- in screen coordinates, the Y flips, so the max.y becomes the rc.top ----
            var rc = vp.geom.createRect(min.x, max.y, max.x - min.x, min.y - max.y);
            return rc;
        }

        public worldSizeToScreen(size: number)
        {
            var max = this.projectToScreen(size, 0, 0);
            var min = this.projectToScreen(0, 0, 0);

            var sizePx = max.x - min.x;
            return sizePx;
        }

        public screenSizeXToWorld(size: number)
        {
            var max = this.unprojectFromScreen(size, 0, undefined, true);
            var min = this.unprojectFromScreen(0, 0, undefined, true);

            var sizePx = max.x - min.x;
            return sizePx;
        }

        public screenSizeYToWorld(size: number)
        {
            var max = this.unprojectFromScreen(0, size, undefined, true);
            var min = this.unprojectFromScreen(0, 0, undefined, true);

            var sizePx = -(max.y - min.y);
            return sizePx;
        }

        mapLinearFromScreenToWorld(x: number, y: number)
        {
            //---- used for mapping bounds on the Z plane from screen to world (not for general object mapping) ----
            var xPercent = x / this._canvasWidth;
            var yPercent = (this._canvasHeight - y) / this._canvasHeight;           // flip it 

            var wb = this.getWorldBounds();

            var xWorld = wb.left + xPercent * (wb.right - wb.left);
            var yWorld = wb.bottom + yPercent * (wb.top - wb.bottom);

            var pt3 = { x: xWorld, y: yWorld, z: 0 };
            return pt3;
        }

        public screenToWorldBounds(rc: any)
        {
            var min = this.mapLinearFromScreenToWorld(rc.left, rc.bottom);
            var max = this.mapLinearFromScreenToWorld(rc.right, rc.top);

            var worldBounds = vp.geom.createRect(min.x, min.y, max.x - min.x, max.y - min.y);
            return worldBounds;
        }

        public translateMatrixEx(x: number, y: number, z: number)
        {
            var mat2 = vp.geom.matrix4.createTranslation(x, y, z);
            this.multiplyTransform(mat2);
        }

        public scaleMatrixAt(factor: number, atPos: vp.geom.vector3)
        {
            vp.utils.debug("scaleMatrixAt: factor=" + factor);

            //---- to scale at "atPos", we need to make atPos to the origin ----
            //---- translate by -atPos, scale, translate by +atPos ----
            // var mat1 = vp.geom.matrix4.createTranslation(-atPos.x, -atPos.y, -atPos.z);
            var mat2 = vp.geom.matrix4.createScale(factor, factor, factor);
            // var mat3 = vp.geom.matrix4.createTranslation(atPos.x, atPos.y, atPos.z);

            //---- until this is reliable, just use a simple scaling ----
            //this.multiplyTransform(mat1);
            this.multiplyTransform(mat2);
            //this.multiplyTransform(mat3);
        }

        public rotateMatrixX(value: number, additive = true)
        {
            var aaRot = vp.geom.matrix4.createRotationX(value);
            this.multiplyTransform(aaRot);
        }

        public rotateMatrixY(value: number)
        {
            //var aaRot = vp.geom.matrix4.createRotationY(value);

           // this.multiplyTransform(aaRot);
           // instead of premultiplying by Y rotation, we're postmultiplying by Z which gives the effect 
           // rotating around the Y axis while keeping the x rotation fixed.
           mat4.rotateZ(this._matWorld, this._matWorld, value);
        }

        public rotateMatrixZ(value: number)
        {
            var aaRot = vp.geom.matrix4.createRotationZ(value);
            this.multiplyTransform(aaRot);
        }

        public xRotation(value?: number)
        {
            if (value === undefined)
            {
                return vp.utils.toDegrees(this._xRotation);
            }

            value = vp.utils.toRadians(value);
            this.rotateMatrixX(value - this._xRotation);
            this._xRotation = value;
        }

        public yRotation(value?: number)
        {
            if (value === undefined)
            {
                return vp.utils.toDegrees(this._yRotation);
            }

            value = vp.utils.toRadians(value);
            this.rotateMatrixY(value - this._yRotation);
            this._yRotation = value;
        }

        public zRotation(value?: number)
        {
            if (value === undefined)
            {
                return vp.utils.toDegrees(this._zRotation);
            }

            value = vp.utils.toRadians(value);
            this.rotateMatrixZ(value - this._zRotation);
            this._zRotation = value;
        }

        public getMatrix()
        {
            return this._matWorld;
        }

        /** "width" is the width of the camera's canvas, is pixels.  "height" is height of canvas. */
        updateCamera(isOrthoCamera: boolean, width: number, height: number)
        {
            this._canvasWidth = width;
            this._canvasHeight = height;
            this._isOrthoCamera = isOrthoCamera;

            this.rebuildProjectionMatrix(7);
        }

        getWorldBounds()
        {
            return this._rcxWorld;
        }

        toFloatv3(v)
        {
            var a = new Float32Array(3);

            a[0] = v.x;
            a[1] = v.y;
            a[2] = v.z;

            return a;
        }

        //---- test/debug only ----
        public testProject()
        {
            //---- center of screen ----
            this.projectToScreen(0, 0, 0);         // should be about: myWidth/2, myHeight/2, z

            //vp.utils.assert(vp.utils.floatEq(rcenter.x, width / 2));
            //vp.utils.assert(vp.utils.floatEq(rcenter.y, height / 2));

            //    Vector3F bcenter = Unproject(rcenter);   // should be about: 0, 0, 0
            //Debug.Assert(FloatEqual(bcenter.X, 0));
            //Debug.Assert(FloatEqual(bcenter.Y, 0));

            //    //---- upper left corner ----
            //    Vector3F vul = new Vector3F(-2f, 1.4f, 0);    // 3d: (-2, 1.4, 0)

            //    Vector3F rul = Project(vul);                 // should be about (0, 0, z)
            //    //Debug.Assert(FloatEqual(rul.X, 0, 30));
            //    //Debug.Assert(FloatEqual(rul.Y, 0, 30));

            //    Vector3F bul = Unproject(rul);               // should be about (-2, 1.4, 0)
            //Debug.Assert(FloatEqual(bul.X, -2f));
            //Debug.Assert(FloatEqual(bul.Y, 1.4f));

            //    //---- lower right corner ----
            //    Vector3F vlr = new Vector3F(2f, -1.4f, 0);

            //    Vector3F rlr = Project(vlr);                 // should be about myWidth, myHeight
            //    //Debug.Assert(FloatEqual(rlr.X, myWidth, 30));
            //    //Debug.Assert(FloatEqual(rlr.Y, myHeight, 30));

            //    Vector3F blr = Unproject(rlr);               // should be about (2, -1.4, 0)
            //Debug.Assert(FloatEqual(blr.X, 2f));
            //Debug.Assert(FloatEqual(blr.Y, -1.4f));
        }

        //---- removed this, since we cannot combine it with the WorldViewProj matrix, as we thought, because ----
        //---- of the need to divide the transformed POINT by "w" after the WVP transform but before the ViewPort transform ----
        //public getViewportMatrix()
        //{
        //    var gl = this._gl;

        //    var mat = vp.geom.matrix4.createScale(this._canvasWidth / 2, -this._canvasHeight / 2, 1);
        //    var mat2 = vp.geom.matrix4.createTranslation(this._canvasWidth / 2, this._canvasHeight / 2, 0);
        //    var matProduct = vp.geom.matrix4.multiply(mat, mat2);

        //    return matProduct;
        //}

        //public getFullProjectMatrix()
        //{
        //    var matWVP = this.getWorldViewProjection();
        //    var matVP = this.getViewportMatrix();

        //    var matFull = vp.geom.matrix4.multiply(matWVP, matVP);
        //    return matFull;
        //}

                ////---- test/debug only ----
        //private getThreeMVP()
        //{
        //    var gl = this._gl;

        //    var matProj = new THREE.Matrix4();
        //    var povRadians = 45 / 180 * Math.PI;
        //    matProj = matProj.makePerspective(povRadians, this._canvasWidth / this._canvasHeight, 0.001, 20000);

        //    var cameraPos = new THREE.Vector3(0, 0, 30);
        //    var lookAt = new THREE.Vector3(0, 0, -1);
        //    var up = new THREE.Vector3(0, 1, 0);

        //    var matView = new THREE.Matrix4();
        //    matView = matView.lookAt(cameraPos, lookAt, up);

        //    var matWorld = new THREE.Matrix4();
        //    matWorld = matWorld.identity();

        //    var matTest = matWorld.multiply(matView);
        //    matTest = matTest.multiply(matProj);

        //    return matTest;
        //}

        ////---- test/debug only ----
        //private getThreeViewport()
        //{
        //    var gl = this._gl;

        //    var mat = new THREE.Matrix4();
        //    mat.scale(new THREE.Vector3(this._canvasWidth / 2, -this._canvasHeight / 2, 1));

        //    //---- yikes - ".translate()" removed by produces no exception!! ----
        //    //mat.translate(new THREE.Vector3(this._canvasWidth / 2, this._canvasHeight / 2, 0));
        //    mat.setPosition(new THREE.Vector3(this._canvasWidth / 2, this._canvasHeight / 2, 0));

        //    return mat;
        //}

        ////---- test/debug only ----
        //private testThreeProject()
        //{
        //    //---- test THREE ----
        //    var matMVP = this.getThreeMVP();
        //    var matVP = this.getThreeViewport();

        //    var pt = [0, 0, 0];
        //    //pt = matMVP.multiplyVector3Array(pt);
        //    //pt = matVP.multiplyVector3Array(pt);

        //    var v = new THREE.Vector3(0, 0, 0);
        //    v.applyMatrix4(matMVP);
        //    v.applyMatrix4(matVP);

        //    var v2 = new THREE.Vector3(0, 0, 0);
        //    var matAll = new THREE.Matrix4();
        //    matAll.multiply(matMVP);
        //    matAll.multiply(matVP);

        //    v2.applyMatrix4(matAll);

        //    var a = 9;
        //}

        ////---- test/debug only ----
        //private getGlMatrixMVP()
        //{
        //    var gl = this._gl;

        //    //---- this api is seriously messed up ----
        //    var matProj = mat4.create();
        //    var povRadians = 45 / 180 * Math.PI;
        //    mat4.perspective(matProj, povRadians, this._canvasWidth / this._canvasHeight, 0.001, 20000);

        //    var matView = mat4.create();
        //    var cameraPos = new Float32Array([0, 0, 30]);
        //    var lookAt = new Float32Array([0, 0, -1]);
        //    var up = new Float32Array([0, 1, 0]);
        //    matView = mat4.lookAt(matView, cameraPos, lookAt, up);

        //    var matWorld = mat4.create();
        //    mat4.identity(matWorld);

        //    var matTest = mat4.create();
        //    mat4.multiply(matTest, matWorld, matView);
        //    mat4.multiply(matTest, matProj, matTest);

        //    return matTest;
        //}

        ////---- test/debug only ----
        //private getGlMatrixViewport()
        //{
        //    var gl = this._gl;

        //    var mat = mat4.create();
        //    mat4.identity(mat);
        //    mat4.scale(mat, mat, new Float32Array([this._canvasWidth / 2, -this._canvasHeight / 2, 1]));
            
        //    var mat2 = mat4.create();
        //    mat4.identity(mat2);
        //    mat4.translate(mat2, mat2, new Float32Array([this._canvasWidth / 2, this._canvasHeight / 2, 0]));

        //    //---- it looks like their multiply is BACKWARDS ---- 
        //    var mat3 = mat4.create();
        //    mat4.identity(mat3);
        //    mat4.multiply(mat3, mat, mat2);

        //    return mat3;
        //}

        //private testGlMatrix()
        //{
        //    //---- test 2 pass project() ----
        //    var matMVP = this.getGlMatrixMVP();
        //    var matVP = this.getGlMatrixViewport();

        //    var pt = new Float32Array([0, 0, 0]);
        //    vec3.transformMat4(pt, pt, matMVP);
        //    vec3.transformMat4(pt, pt, matVP);

        //    //---- test 1 pass project() ----
        //    var v2 = new Float32Array([0, 0, 0]);
        //    var matAll;
        //    matAll = mat4.create();
        //    mat4.identity(matAll);

        //    mat4.multiply(matAll, matMVP, matAll);
        //    mat4.multiply(matAll, matVP, matAll);

        //    vec3.transformMat4(v2, v2, matAll);

        //    var a = 9;
        //}

    }

    export class Rect3d
    {
        left: number;
        right: number;

        top: number; 
        bottom: number;

        front: number;
        back: number;

        constructor(left: number, right: number, top: number, bottom: number, front: number, back: number)
        {
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.front = front;
            this.back = back;
        }
    }
}
 