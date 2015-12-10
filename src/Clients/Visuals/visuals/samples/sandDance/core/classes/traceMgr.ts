//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    traceMgr.ts - manages trace records.  These can be used to log structured information
//      and then plot the resulting records.  Can be used to diagnose complex, temporal issues with the engine.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class traceMgrClass
    {
        static instance: traceMgrClass;

        _cmds: any[];

        _maxCmds = 5000;
        _nextIndex = 0;

        constructor()
        {
            traceMgrClass.instance = this;
            this._cmds = [];
        }

        addTrace(eventName: string, name: string, eventType: TraceEventType, durationId = "")
        {
            //---- since we cannot currently control the shape palette, simplfy the event types ----
            if (eventType == TraceEventType.point)
            {
                var et = "point";
            }
            else
            {
                et = "duration";
            }

            var obj = { time: new Date(), eventName: eventName, name: name, eventType: et, durationId: durationId};

            this._cmds[this._nextIndex] = obj;
            this._nextIndex++;

            //---- we keep cmds in a circular list ----
            if (this._nextIndex >= this._maxCmds)
            {
                this._nextIndex = 0;
            }
        }

        getCmds()
        {
            var cmds = this._cmds;
            var index = this._nextIndex;

            var forwardCmds = cmds.slice(0, index);
            var backwardCmds = cmds.slice(index, cmds.length);

            var allCmds = backwardCmds.concat(forwardCmds);
            return allCmds;
        }
    }

    export enum TraceEventType
    {
        point,          // an event with no duration
        start,          // start of a duration event
        end,            // end of a duration event
    }

}

