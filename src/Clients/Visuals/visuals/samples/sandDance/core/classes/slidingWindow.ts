//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    slidingWindow.ts - a sliding window sampler for streaming data. 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /** A sliding window sampler for streaming data.  Keeps the samples received in the last windowLength milliseconds. */
    export class slidingWindowClass
    {
        _samples: TimeSample[];
        _windowLength: number;

        constructor(windowLength: number)
        {
            this._samples = [];
            this._windowLength = windowLength;
        }

        addSample(value: any, clear?: boolean)
        {
            var now = vp.utils.now();
            var ts = new TimeSample(value, now);

            if (clear)
            {
                this._samples = [];
            }

            this._samples.push(ts);

            this.removeExpiredEntires();
        }

        removeExpiredEntires()
        {
            var now = vp.utils.now();

            //---- remove all exipired entires ----
            var expired = now - this._windowLength;

            for (var i = this._samples.length - 1; i >= 0; i--)
            {
                var sample = this._samples[i];
                if (sample.timeStamp <= expired)
                {
                    this._samples = this._samples.slice(i + 1);
                    break;
                }
            }
        }

        getSamples()
        {
            this.removeExpiredEntires();

            return this._samples;
        }
    }

    export class TimeSample
    {
        value: any;
        timeStamp: number;          // vp.utils.now() units

        constructor(value: any, timeStamp: number)
        {
            this.value = value;
            this.timeStamp = timeStamp;
        }
    }
}
