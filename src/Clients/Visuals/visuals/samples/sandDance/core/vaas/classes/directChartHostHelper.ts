///-----------------------------------------------------------------------------------------------------------------
/// directChartHostHelper.ts.  Copyright (c) 2015 Microsoft Corporation.
///    Helper code for hosting of BeachParty chart directly (in a DIV instead of an iframe).
///
///    When an iframe is re-parented in the DOM (or its parent is re-parented), the DOM forces the iframe to 
///    reload.  In our case, this creates a new chart object, and we lose the state of the previous chart.  To avoid
///    this, we can host the chart directly in a DIV using this class.  This functionaliity is needed when we host
///    the chart inside of an IPython Notebook (auto-snap feature moves the chart the current output cell as user
///    modifies its properties).  
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module bps
{
    export class directChartHostHelperClass extends chartHostHelperClass
    {
        constructor(bpsChartOrIFrameId: string, bpsDomain?: string, baseServerDir?: string, fromDomain?: string)
        {
            super(bpsChartOrIFrameId, bpsDomain, baseServerDir, fromDomain, null, true);

            //---- create a function to receive msgs from host ----
            var anyWin = <any>window;
            anyWin.sendToDirectHostHelper = (strMsgBlock: string) =>
            {
                this.onMsgFromVis(strMsgBlock);
            };
        }

        processChartTag(elem: HTMLElement, baseServerDir: string, hostElem?: HTMLIFrameElement)
        {
            var visId = elem.getAttribute("id");

            if (!baseServerDir)
            {
                //---- assume bpsHelper is on the same server ----
                baseServerDir = "..";
            }

            var src = this.getIFrameSrc(baseServerDir);

            var url = document.location.href;
            var index = url.indexOf("edition=");
            if (index > -1)
            {
                var value = url.substr(index + 8);
                index = value.indexOf("&");
                if (index > -1)
                {
                    value = value.substr(0, index);
                }

                this._edition = value;
                src += "&edition=" + value;
            }

            //---- add our startup time so that client/vaas debug msgs timestamps will be synchronize! ----
            var w = <any>window;
            var vp = w.vp;
            if (vp && vp.utils && vp.utils.appStartTime)
            {
                src += "&appStartTime=" + vp.utils.appStartTime;
            }

            //---- add fromDomain ----
            var fromDomain = this._fromDomain || location.hostname || "localhost";
            src += "&hostDomain=" + fromDomain;
            src += "&bpDir=" + baseServerDir + "/beachParty";

            debug("setting chart iframe src=" + src);

            var attrValuePairs = this.processIFrameChartAttributes(elem, hostElem);

            //---- by default, expand iframe to fill parent element size (bps-chart) ----
            if (hostElem.style.width == "")
            {
                hostElem.style.width = "100%"; 
            }

            if (hostElem.style.height == "")
            {
                hostElem.style.height = "100%";
            }

            src += attrValuePairs;

            //---- this will cause the IFRAME to begin loading ----
            //iFrame.src = src;

            //---- split URL from src ----
            var index = src.indexOf("?");
            var urlParams = src.substr(index + 1);
            var url = "defaultHtml.html";

            //---- load src HTML into hostElem ----
            this.readFile("defaultHtml.html", (htmlContent) =>
            {
                //content = "<div>this is a test</div>";

                hostElem.innerHTML = htmlContent;
                //alert("hostElem.innerHTML=" + hostElem.innerHTML);

                //---- chart engine startup code ----
                var anyWin = <any>window;
                var beachParty = anyWin.beachParty;            // scripts loaded by host in this document

                var appMgr = new beachParty.appMgrClass();
                anyWin.appMgr = appMgr;

                appMgr.init("canvas3d", "canvas2d", "svgDoc", "fileInfo", "visStats", "gpuStats", "hitTestStats", "perfStats",
                    urlParams);
            }); 
        }

        readFile(url, callback)
        {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function ()
            {
                if (request.readyState == 4 && request.status == 200)
                {
                    var content = request.responseText;
                    callback(content); 
                }
            }

            request.open("GET", url, true); 
            request.send(); 
        }

        postVisMsgNow(msgStr: string)
        {
            //this._iframe.contentWindow.postMessage(msgStr, this._domain);

            //---- simulate async of iframe communication ----
            setTimeout((e) =>
            {
                (<any>window).appMgr.sendMsgToVis(msgStr);
            }, 1);
        }
    }
}
 