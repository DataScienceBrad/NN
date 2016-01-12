//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    shareMgr - manages sharing of selection and other information among multiple BeachParty sessions.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class ShareMgrClass extends DataChangerClass
    {
        _sessionId: string;
        _changeNumber: number;
        _fn: string;
        _itemId: string;
        _callback = null;

        //---- events are async, so we cannot set a flag to know if it is us writing to LS ----
        //_isMySetting = false;

        //---- ISSUES DISCOVERED: ----
        // - For IFRAMES, IE needs to use parent window to hook storage event
        // - Each browser (IE, Chrome, Firefox) has their own localstorage - they can NOT talk to each other using LOCALSTORAGE
        // - Some browsers do NOT support "window.onstorage" form of event hooking

        constructor(callback)
        {
            super();

            this._changeNumber = 1;
            this._callback = callback;

            //---- our unique session id ----
            this._sessionId = Date.now() + "";

            var win = window;

            //---- this workaround fails under certain conditions ----
            //if (vp.utils.isIE)
            //{
            //    //---- IE workarond for IFRAMES ----
            //    win = (parent || window.opener || window);
            //}

            vp.events.attach(win, "storage", (e) =>
            {
                //vp.utils.debug("******* shareMgr.changeFunc: e.key=" + e.key);

                TraceMgrClass.instance.addTrace("localStorage", e.key, TraceEventType.point);

                if (e.key === this._itemId)
                {
                    this.processStorageChangedRecord(e.newValue);
                }
            });
        }

        /** this simulates a local storage change. */
        onLocalStorageChange()
        {
            // var json = localStorage.getItem(this._itemId);
            // this.processStorageChangedRecord(json);
        }

        public setFilename(fn: string)
        {
            this._fn = fn;
            this._itemId = "session-" + fn;

            //vp.utils.debug("shareName set to: " + this._itemId);

            //---- get current selection ----
            this.onLocalStorageChange();
        }

        private processStorageChangedRecord(sdStr)
        {
            var sdx = <ShareStateData>JSON.parse(sdStr);

            if (sdx && sdx.changedById !== this._sessionId)            // ignore my changes 
            {
                //---- watch out for illegal times ----
                var timeDiff = Math.abs(Date.now() - sdx.changeTime);

                if (timeDiff < 30 * 1000)       // ignore entries older than 30 secs
                {
                    //vp.utils.debug("====> onStorageChanged: myId=" + this._sessionId + ", sdx.filename=" + sdx.filename + ", sdx.changedById=" + sdx.changedById +
                    //    ", sdx.changeNumber=" + sdx.changeNumber);

                    this._callback(sdx);
                }
            }
        }

        public setSelection(selectedPrimaryKeys: string[])
        {
//             var sd = new ShareStateData(this._sessionId, this._changeNumber++, this._fn, selectedPrimaryKeys);
//             // var jsonStr = JSON.stringify(sd);
// 
//             // localStorage.setItem(this._itemId, jsonStr);
// 
//             vp.utils.debug("shareMgr.setSelection: fn=" + this._fn);
        }
    }

    export class ShareStateData
    {
        changedById: string;
        changeNumber: number;
        changeTime: number;
        filename: string;
        selectedPrimaryKeys: string[];

        constructor(changedById: string, changeNumber: number, fn: string, selectedPrimaryKeys: string[])
        {
            this.changedById = changedById;
            this.changeNumber = changeNumber;
            this.changeTime = Date.now();
            this.filename = fn;
            this.selectedPrimaryKeys = selectedPrimaryKeys;
        }
    }
}
 