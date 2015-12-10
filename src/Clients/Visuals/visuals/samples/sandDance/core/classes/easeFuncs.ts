//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    easeFuncs.ts - ease functions for animation.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module utils
{
    function quadratic(t)
    {
        return t * t;
    }

    function cubic(t)
    {
        return t * t * t;
    }

    function quartic(t)
    {
        return t * t * t * t;
    }

    function quintic(t)
    {
        return t * t * t * t * t;
    }

    function exponential(t)
    {
        var a = 3;
        return (Math.exp(a * t) - 1) / (Math.exp(a) - 1);
    }

    function sine(t)
    {
        return 1 - Math.sin(Math.PI * .5 * (1 - t));
    }

    function circle(t)
    {
        return 1 - Math.sqrt(1 - t * t);
    }

    export function getEasingFunction(value: bps.EaseFunction)
    {
        var func = null;

        switch (value)
        {
            case bps.EaseFunction.quadratic:
                func = quadratic;
                break;

            case bps.EaseFunction.cubic:
                func = cubic;
                break;

            case bps.EaseFunction.quartic:
                func = quartic;
                break;

            case bps.EaseFunction.quintic:
                func = quintic;
                break;

            case bps.EaseFunction.sine:
                func = sine;
                break;

            case bps.EaseFunction.exponential:
                func = exponential;
                break;

            case bps.EaseFunction.circle:
                func = circle;
                break;

        }

        return func;
    }
}
 