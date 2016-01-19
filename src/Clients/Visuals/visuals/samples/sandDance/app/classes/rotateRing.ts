//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    rotateRing.ts - displays a slowly pulsing ring in the 3D rotation area, in center of plot area. 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class RotateRingClass 
    {
        private application: AppClass;
        private container: HTMLElement;

        _root: HTMLDivElement;
        _fullOpacity = "0";//"1"
        //_radius = 0;               // size of 3D transform center
        _pulseInterval = 5000;
        _pulseTimer = null;
        _pulseDuration = 0;
        //_rcRotation = null;

        constructor(application: AppClass, container: HTMLElement)
        {
            this.application = application;
            this.container = container;

            var rootW = vp.select(this.container).append("div")
                .addClass("rotateRing")
                .css("position", "absolute")
                .css("opacity", "0");

            this._root = rootW[0];
        }

        //setRotationBounds(rc)
        //{
        //    this._rcRotation = rc;
        //}

        getRcPlot()
        {
            var rcPlot = this.application.getPlotBounds();

            if (!rcPlot) {
                return vp.geom.createRect(0, 0, 0, 0);
            }

            return rcPlot;
        }

        private getFinalRotationBounds()
        {
            var rcPlot = this.getRcPlot();
            var rcRot = this.application._rcRotateRing;

            if (rcPlot && rcRot) {
                return vp.geom.createRect(rcPlot.left + rcRot.left, rcPlot.top + rcRot.top, rcRot.width, rcRot.height);
            }

            return vp.geom.createRect(0, 0, 0, 0);
        }

        enter()
        {
            var ring = this._root;
            var rcPlot = this.getRcPlot();
            var rcRing = this.getFinalRotationBounds();

            vp.utils.debug("ENTER");

            //---- FROM size ----
            vp.select(ring)
                //.css("transition", "all 0s")     // turn off animations
                .bounds(rcPlot.left, rcPlot.top, rcPlot.width, rcPlot.height)
                .css("border-radius", "0px")
                .css("opacity", "0");

            //---- ENDING bounds/radius ----
            setTimeout((e) =>
            {
                vp.select(ring)
                    .css("transition", "all .5s ease")
                    .bounds(rcRing.left, rcRing.top, rcRing.width, rcRing.height)
                    .css("border-radius", rcRing.width / 2 + "px")
                    .css("opacity", this._fullOpacity);
            }, 250);

            //---- FADE OUT ----
            setTimeout(function (e)
            {
                vp.select(ring)
                    .css("transition", "all .5s ease")
                    .css("opacity", "0");
            }, 1500);
        }

        startPulsing()
        {
            this.stopPulsing();

            this._pulseTimer = setInterval((e) =>
            {
                this.pulse();
            }, this._pulseInterval);
        }

        stopPulsing()
        {
            if (this._pulseTimer)
            {
                clearInterval(this._pulseTimer);
                this._pulseTimer = null;
            }
        }

        exit()
        {
            this.stopPulsing();

            var ring = this._root;
            var rcPlot = this.getRcPlot();
            var rcRing = this.getFinalRotationBounds();

            vp.utils.debug("EXIT");

            //---- STARTING bounds/radius ----
            vp.select(ring)
                .css("transition", "all .5 ease")
                .bounds(rcRing.left, rcRing.top, rcRing.width, rcRing.height)
                .css("border-radius", rcRing.width / 2 + "px")
                .css("opacity", this._fullOpacity);

            //---- TO size ----
            setTimeout(function (e)
            {
                vp.select(ring)
                    .css("transition", "all 3.5 ease")  
                    .bounds(rcPlot.left, rcPlot.top, rcPlot.width, rcPlot.height)
                    .css("border-radius", "0px")
                    .css("opacity", "0");
            }, 500);
        }

        pulse()
        {
            //---- update its rcRing (plot may have moved since last enter/pulse) ----
            var ring = this._root;
            var rcRing = this.getFinalRotationBounds();

            vp.utils.debug("PULSE");

            //---- FADE IN ----
            vp.select(ring)
                .bounds(rcRing.left, rcRing.top, rcRing.width, rcRing.height)
                .css("border-radius", rcRing.width / 2 + "px")
                .css("transition", "all .5s ease")
                .css("opacity", this._fullOpacity);

            //---- FADE OUT ----
            setTimeout(function (e)
            {
                vp.select(ring)
                    //.css("transition", "all .5s ease")
                    .css("opacity", "0");
            }, 500 + this._pulseDuration);
        }
    }
}