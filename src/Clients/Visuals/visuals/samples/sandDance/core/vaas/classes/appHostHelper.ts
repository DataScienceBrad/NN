///-----------------------------------------------------------------------------------------------------------------
/// appHostHelper.ts.  Copyright (c) 2015 Microsoft Corporation.
///    base class for hosting of BeachParty client app within an iframe.
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module bps
{
    export class appHostHelperClass extends baseHostHelperClass
    {
        _clientAppId: string;

        constructor(iframeId: string, appDomain?: string, baseServerDir?: string, hostDomain?: string)
        {
            //alert("appHostHelper: iframeId=" + iframeId);
            this._clientAppId = iframeId;

            super(iframeId, appDomain, baseServerDir, hostDomain, "appHost");
        }

        preprocessMsg(msgBlock)
        {
            var processIt = false;
            // (<any>window).bar.ski = 3;

            if (msgBlock.clientAppId == this._clientAppId)
            {
                if (msgBlock.msg == "clientAppLoaded")
                {
                    this.onIFrameLoaded();
                }

                processIt = true;
            }

            return processIt;
        }

        getIFrameSrc(baseServerDir: string)
        {
            var src = baseServerDir + "/beachPartyApp/BeachPartyApp.html?clientAppId=" + this._clientAppId;
            return src;
        }

        /** Used to set the data used by the client app. */
        public setData(data: any, dataLoad?: WorkingDataParams)
        {
            var strData = JSON.stringify(data);
            var strParams = JSON.stringify(dataLoad);

            this.postVisMsg("setData", strData, strParams);
        }
    }
}