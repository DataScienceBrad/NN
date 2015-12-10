//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    transformMgr.ts - manages changes to 3D transform of chart.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

var demoData: string;

module beachParty
{
    var nextViewId = 0;

    /** manages changes to 3D transform of chart, including relative changes, 
      dampening, inerita, transformMode, and transformEnabled. */
    export class transformMgrClass extends dataChangerClass
    {
        private _transformer: transformerClass;
        private _gl;
        private _transformMode: TransformMode;
        private _isInertialEnabled = true;

        //---- damping of movement ----
        private _xRotDamp: dampenerClass;
        private _yRotDamp: dampenerClass;
        private _zRotDamp: dampenerClass;

        //---- this attempts to keep track of our current SCALE and OFFSET and we incrementally change them ----
        private _currentScale = 1;
        private _currentOffsetX = 0;
        private _currentOffsetY = 0;
        private _currentRotationZ = 0;

        constructor(gl)
        {
            super();

            this._gl = gl;
            this._transformer = new transformerClass(gl); 

            this._transformMode = TransformMode.move;

            //---- hook up dampening ----
            this._xRotDamp = new dampenerClass((actual) =>
            {
                this._transformer.rotateMatrixX(actual);
            })

            this._yRotDamp = new dampenerClass((actual) =>
            {
                this._transformer.rotateMatrixY(actual);
            })

            this._zRotDamp = new dampenerClass((actual) =>
            {
                this._transformer.rotateMatrixZ(actual);
            })

            this.resetPanAndPinchDeltas();
        }

        //buildGettersAndSetters()
        //{
        //    this._getterSetters["xRotation"] = (value) => this.xRotation(value);
        //    this._getterSetters["yRotation"] = (value) => this.yRotation(value);
        //    this._getterSetters["zRotation"] = (value) => this.zRotation(value);
        //    this._getterSetters["transformMode"] = (value) => this.transformMode(value);
        //}

        getRayFromScreenPos(screenX: number, screenY: number)
        {
            return this._transformer.getRayFromScreenPos(screenX, screenY);
        }

        /** called by dataView when chart frame changes. */
        onFrame()
        {
            var xHas = this._xRotDamp.onFrameApply();
            var yHas = this._yRotDamp.onFrameApply();
            var zHas = this._zRotDamp.onFrameApply();

            this.onDataChanged("frame");

            return (xHas || yHas || zHas);
        }

        getTransformer()
        {
            return this._transformer;
        }

        inertia(value?: number[])
        {
            if (arguments.length == 0)
            {
                var x = this._xRotDamp.inertia();
                var y = this._yRotDamp.inertia();
                var z = this._zRotDamp.inertia();

                return [x, y, z];
            }

            if (value && value.length)
            {
                this._xRotDamp.inertia(value[0]);
                this._yRotDamp.inertia(value[1]);
                this._zRotDamp.inertia(value[2]);
            }
        }

        resetPanAndPinchDeltas()
        {
            //vp.utils.debug("resetPanAndPinchDeltas");

            this._currentScale = 1;
            this._currentOffsetX = 0;
            this._currentOffsetY = 0;
            this._currentRotationZ = 0;
        }

        onUiOpStart()
        {
            this.onDataChanged("uiOpStart");

            this.resetPanAndPinchDeltas();

            this._xRotDamp.startUiOperation();
            this._yRotDamp.startUiOperation();
            this._zRotDamp.startUiOperation();
        }

        onUiOpStop()
        {
            this.onDataChanged("uiOpStop");

            this.resetPanAndPinchDeltas();

            this._xRotDamp.stopUIOperation();
            this._yRotDamp.stopUIOperation();
            this._zRotDamp.stopUIOperation();
        }

        isInertiaEnabled(value?: boolean)
        {
            if (value === undefined)
            {
                return this._isInertialEnabled;
            }

            this._isInertialEnabled = value;
            this.onDataChanged("isInertiaEnabled");
        }

        hasInertia()
        {
            var xHas = this._xRotDamp.hasInertia();
            var yHas = this._yRotDamp.hasInertia();
            var zHas = this._zRotDamp.hasInertia();

            var has = (xHas || yHas || zHas);
            return has;
        }

        resetCamera()
        {
            if (this._transformer)
            {
                this._transformer.resetMatrices();
            }

            //this._xRotDamp.reset();
            //this._yRotDamp.reset();
            //this._zRotDamp.reset();

            this.resetPanAndPinchDeltas();
        }

        applyPanMovement(xdiff: number, ydiff: number, targetX: number, targetY: number, mousePos)
        {
            var maxDiff = xdiff;
            if (Math.abs(ydiff) > Math.abs(xdiff))
            {
                maxDiff = ydiff;
            }

            if (this._transformer)
            {
                //var inerita = this._isInertialEnabled;

                if (this._transformMode == TransformMode.move)
                {
                    this._transformer.translateMatrixEx(xdiff, ydiff, 0);
                }
                else if (this._transformMode == TransformMode.spin)
                {
                    this.rotateMatrixZ(maxDiff);
                }
                else if (this._transformMode == TransformMode.turn)
                {
                    this.rotateMatrixY(-maxDiff);
                }
                else if (this._transformMode == TransformMode.flip)
                {
                    this.rotateMatrixX(maxDiff);
                }
                else if (this._transformMode == TransformMode.zoom)
                {
                    var factor = (maxDiff > 0) ? 1.3 : 1 / 1.3;
                    this.scaleCameraRelative(factor, mousePos);
                }
            }
        }

        transformMode(value?: number)
        {
            if (value === undefined)
            {
                var enumName = TransformMode[this._transformMode];
                return enumName;
            }

            if (vp.utils.isString(value))
            {
                this._transformMode = <TransformMode><any> TransformMode[value];
            }
            else
            {
                this._transformMode = value;
            }

            this.onDataChanged("transformMode");
        }

        resetTransform()
        {
            this.transformMode(TransformMode.move);

            if (this._transformer)
            {
                this._transformer.clearTransforms();
            }
        }

        moveCamera(targetX: number, targetY: number, mousePos)
        {
            var xdiff = targetX - this._currentOffsetX;
            var ydiff = targetY - this._currentOffsetY;

            //console.log("pan: " + targetX + ", " + targetY + ", diff=" + xdiff + ", " + ydiff);

            //---- todo: apply change in xy to our current position ----
            this.applyPanMovement(xdiff, ydiff, targetX, targetY, mousePos);

            this._currentOffsetX = targetX;
            this._currentOffsetY = targetY;

        }

        xRotation(value: number)
        {
            if (value === undefined)
            {
                return this._transformer.xRotation();
            }

            this._transformer.xRotation(value);
            this.onDataChanged("xRotation");
        }

        yRotation(value: number)
        {
            if (value === undefined)
            {
                return this._transformer.yRotation();
            }

            this._transformer.yRotation(value);
            this.onDataChanged("yRotation");
        }

        zRotation(value: number)
        {
            if (value === undefined)
            {
                return this._transformer.zRotation();
            }

            this._transformer.zRotation(value);
            this.onDataChanged("zRotation");
        }

        translateCamera(x: number, y: number, z: number)
        {
            this._transformer.translateMatrixEx(-x, -y, -z);
        }

        /** normally adds "value" (in radians) to the current X rotation, in the world matrix.  If additive=false, the x rotation is set 
        to "value". */
        rotateMatrixX(value: number, additive = true, useInertia = true)
        {
            if (this._isInertialEnabled && useInertia)
            {
                vp.utils.debug("xRotDamp: target=" + value);
                this._xRotDamp.setTarget(value);
            }
            else
            {
                this._transformer.rotateMatrixX(value, additive);
            }
        }

        //reverseDampX()
        //{
        //    if (this._isInertialEnabled)
        //    {
        //        this._xRotDamp.reverseAccum();
        //    }
        //    else
        //    {
        //        this._transformer.clearTransforms();
        //    }
        //}

        rotateMatrixY(rotStep: number)
        {
            if (this._isInertialEnabled)
            {
                vp.utils.debug("yRotDamp: target=" + rotStep);
                this._yRotDamp.setTarget(rotStep);
            }
            else
            {
                this._transformer.rotateMatrixY(rotStep);
            }
        }

        rotateMatrixZ(rotStep: number)
        {
            if (this._isInertialEnabled)
            {
                vp.utils.debug("zRotDamp: target=" + rotStep);
                this._zRotDamp.setTarget(rotStep);
            }
            else
            {
                this._transformer.rotateMatrixZ(rotStep);
            }
        }

        ///** Rotate the camera about the specified Z axis (relative to the value at the start of this gesture). */
        //rotateMatrixZAbsolute(value: number)
        //{
        //    var rotStep = value - this._currentRotationZ;

        //    this._transformer.rotateMatrixZ(rotStep);

        //    this._currentRotationZ = value;
        //}

        /** Scale the camera by a relative amount. */
        scaleCameraRelative(factor: number, mousePos)
        {
            if (factor != 0)
            {
                var doIt = true;

                if (factor > 1)
                {
                    doIt = (this._currentScale < 400);
                }
                else
                {
                    doIt = (this._currentScale > .120);
                }

                if (true)       // don't limit until this is absolute scale measure   (doIt)
                {
                    this._currentScale *= factor;

                    this._transformer.scaleMatrix(factor, mousePos);
                }

                //vp.utils.debug("scaleCameraRelative: newScale=" + this._currentScale);
            }
        }

        /** Scale the camera to the specified value (relative to the start of the gesture). */
        scaleCameraAbsolute(scale: number, mousePos)
        {
            var diffFactor = scale / this._currentScale;

            vp.utils.debug("scaleCameraAbsolute: scale=" + scale + ", currentScale=" + this._currentScale +
                ", diffFactor=" + diffFactor + ", mousePos.x=" + mousePos.x + ", mousePos.y=" + mousePos.y);

            this._transformer.scaleMatrix(diffFactor, mousePos);

            this._currentScale = scale;
        }

    }

    export enum TransformMode
    {
        move,
        spin,
        turn,
        flip,
        zoom,
    }

}
 