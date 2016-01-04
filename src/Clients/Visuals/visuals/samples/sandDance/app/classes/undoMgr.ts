//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    undoMgr.ts - manages the UNDO stack for BeachPartyApp.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    /** this class is designed around an initial app state being pushed after the app init process is complete.  This becomes the
     * permanent _stack[0] entry (which is used to "undo" the first user action).
     */
    export class UndoMgrClass extends beachParty.DataChangerClass
    {
        static instance: UndoMgrClass;

        _stack: UndoEntry[] = [];
        _index = -1;
        _maxUndoLevels = 100;
        //_initEntry = null;              // this is an entry created from the initial (and stable) app state 

        constructor()
        {
            super();

            UndoMgrClass.instance = this;
        }

        getCurrentInsight(): bps.InsightData
        {
            var index = this._index;

            var insight = (index > -1) ? this._stack[index].insight : null;
            return insight;
        }

        push(insight: bps.InsightData, tooltip: string)
        {
            var stack = this._stack;
            var index = this._index;

            if (index < stack.length - 1)
            {
                //---- running new cmd in middle of a "back" sequence ----
                //---- throw away entries above stack[index] ----
                stack = stack.slice(0, index + 1);
            }

            if (stack.length + 1 > this._maxUndoLevels)
            {
                //---- too many undo states; must remove oldest entry in stack ----
                stack = stack.slice(1);
            }

            var cmdState = new UndoEntry(insight, tooltip);
            stack.push(cmdState);

            this._index = stack.length - 1;
            this._stack = stack;

            this.onDataChanged("undoStack");
        }

        isUndoAvailable()
        {
            return (this._index > 0);
        }

        getUndoTooltip()
        {
            var tip = "Undo the last action (currently unavailable)";

            if (this._index > 0) 
            {
                var entry = this._stack[this._index];
                tip = "Undo the last action: \r\n" + entry.tooltip;
            }

            return tip;
        }

        undo()
        {
            var entry = <UndoEntry>null;

            if (this._index > 0) 
            {
                this._index--;
                entry = this._stack[this._index];

                this.onDataChanged("undoStack");
            }

            return entry;
        }

        isRedoAvailable()
        {
            return (this._index < this._stack.length - 1);
        }

        getRedoTooltip()
        {
            var tip = "Redo the previously undone action (currently unavailable)";

            if (this._index < this._stack.length - 1)
            {
                var entry = this._stack[this._index+1];
                tip = "Redo the previously undone action:\r\n" + entry.tooltip;
            }

            return tip;
        }

        redo()
        {
            var entry = <UndoEntry>null;

            if (this._index < this._stack.length - 1)
            {
                this._index++;
                entry = this._stack[this._index];

                this.onDataChanged("undoStack");
            }

            return entry;
        }
    }

    export class UndoEntry
    {
        insight: bps.InsightData;
        tooltip: string;

        constructor(insight: bps.InsightData, tooltip: string)
        {
            this.insight = insight;
            this.tooltip = tooltip;
        }
    }
} 