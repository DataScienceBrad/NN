//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dampener.ts - class for smoothing out drag/pinch motion, as applied to world matrix.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class DampenerClass
    {
        static windowDuration = 500;            // ms
         
        _target: number;
        _accum: number;
        _applyCallback = null;
        _dampenFactor = .1;      //   .3;     // .7;
        _keepMoving = true;
        _firstActual: number;
        _isOperationActive = false;
        _firstTargetFrame = true;
        _slidingWindow: SlidingWindowClass;

        constructor(applyCallback)
        {
            this._applyCallback = applyCallback; 

            this._slidingWindow = new SlidingWindowClass(DampenerClass.windowDuration);

            this.startUiOperation();
        }

        inertia(value?: number)
        {
            if (arguments.length === 0)
            {
                return (this._isOperationActive) ? 0 : this._firstActual;
            }

            this._firstActual = value;
        }

        hasInertia()
        {
            var has = (!this._isOperationActive) && (this._firstActual !== 0);
            return has;
        }

        startUiOperation()
        {
            this._target = 0;
            this._accum = 0;
            this._firstActual = 0;
            this._isOperationActive = true;

            //vp.utils.debug("startUiOperation called");
        }

        stopUIOperation()
        {
            this._isOperationActive = false;
            //vp.utils.debug("stopUIOperation called");

            //---- if we didn't move the requd distance in last "windowDuration" ms, clear the inertia ----
            var samples = this._slidingWindow.getSamples();
            var count = samples.length;

            //vp.utils.debug("--> length=" + count + ", dist=" + dist);

            if (count <  7)      // dist < .25)
            {
                this._firstActual = 0;
            }
        }

        setTarget(value: number)
        {
            this._target += value;
            this._firstTargetFrame = true;

            this._slidingWindow.addSample(value);

            //vp.utils.debug("dampener.setTarget: value=" + value);
        }

        apply(value: number)
        {
            if (Math.abs(value) > .0001)        // don't wiggle with small numbers forever
            {
                if (this._applyCallback)
                {
                    this._applyCallback(value);
                }
            }
        }

        onFrameApply()
        {
            var hasInertia = false;

            if (this._isOperationActive)
            {
                if (this._accum !== this._target)
                {
                    var frameTarget = vp.data.lerp(this._dampenFactor, this._accum, this._target);
                    var actual = frameTarget - this._accum;

                    //vp.utils.debug("dampener.onFrameApply: accum=" + this._accum + ", target=" + this._target +
                    //    ", frameTarget=" + frameTarget + ", actual=" + actual);

                    this.apply(actual);

                    if (this._firstTargetFrame)
                    {
                        this._firstActual = actual;
                        this._firstTargetFrame = false;
                        
                        //vp.utils.debug("firstActual set to: " + actual);
                    }

                    this._accum = frameTarget; 
                }
            }
            else if (this._keepMoving)
            {
                this.apply(this._firstActual);

                var epsilon = .001;
                hasInertia = (Math.abs(this._firstActual) > epsilon);
            }

            return hasInertia;
        }

        public static createCycle(group: SVGGElement, data: string[])
        {
            var count = data.length;

            //---- draw circles ----
            for (var i = 0; i < count; i++)
            {
            }

            //---- draw arrows ----
            for (var i = 0; i < count; i++)
            {
            }
        }
    }
}