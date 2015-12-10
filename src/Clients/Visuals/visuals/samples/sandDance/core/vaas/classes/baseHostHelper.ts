///-----------------------------------------------------------------------------------------------------------------
/// baseHostHelper.ts.  Copyright (c) 2015 Microsoft Corporation.
///    base class for hosting of BeachParty chart/app within an iframe.
///
/// Features:
///         - defines data structures used by chart engine API
///         - hooks incoming window messages
///         - support chart/app API calls, including callbacks and event subscriptions
///         - processing of <bps-chart> custom attributs & creation of <iframe> element
///         - setting "src" for <iframe> element
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module bps
{
    var htmlTagProcessed = false;
    var nextRequestId = 1;

    export class baseHostHelperClass
    {
        _hookers: any = {};
        _iframe: HTMLIFrameElement;
        _chartId: string;
        _cmdBatchingEnabled = true;         // allow multiple cmds to be sent as one when timer fires
        _batchTimer = null;
        _domain: string;
        _batchBuffer: any[];
        _engineIsLoaded = false;
        _edition = "client";
        _pendingCallbacks: any = {};
        _fromDomain = null;
        _hostId = null;
        _cmdId = null;

        /** bpsDomain should be set to the domain of the BeachParty server (e.g., "vibe10"). */
        constructor(bpsChartOrIFrameId: string, bpsDomain?: string, baseServerDir?: string, fromDomain?: string, hostId?: string,
            isDivHost?: boolean)
        {
            //debug("hostHelperBaseClass: this.processChartTag=" + this.processChartTag);

            this._chartId = bpsChartOrIFrameId;
            this._batchBuffer = [];
            this._fromDomain = fromDomain;

            this._hostId = hostId;

            var domain = baseHostHelperClass.getDomain(bpsDomain);
            this._domain = domain;

            //---- hook messages from vis ----
            window.addEventListener("message", (e) => { this.onMsgFromVis(e.data); });
            
            hostBus.addEventListener("message", (e) => { this.onMsgFromVis(e.data); });

             var elem = <HTMLElement> document.getElementById(bpsChartOrIFrameId);
//             if (!elem)
//             {
//                 throw "Error: cannot find element id=" + bpsChartOrIFrameId;
//             }
//             else
//             {
//                 if (elem.tagName == "IFRAME")
//                 {
//                     this.processChartTag(elem, baseServerDir, <HTMLIFrameElement> elem);
//                     this._iframe = <HTMLIFrameElement> elem;
//                 }
//                 else if (elem.tagName === "BPS-CHART")
//                 {
//                     this.processChartTag(elem, baseServerDir, null);
//                     this._iframe = <HTMLIFrameElement> elem.firstChild;
//                 }
//                 else if (isDivHost)
//                 {
//                     this.processChartTag(elem, baseServerDir, <HTMLIFrameElement> elem);
//                     this._iframe = <HTMLIFrameElement> elem;
//                 }
//                 else
//                 {
//                     throw "Error: element must be a <bps-chart> or <iframe> element: " + bpsChartOrIFrameId;
//                 }
//             }
        }

        public setCmdId(value: string)
        {
            this._cmdId = value;
        }

        public static getDomain(domainName: string)//TODO: remove this.
        {
            if (!domainName)
            {
                //---- if not specified, use the originating domain name ----
                domainName = (!location.hostname) ? "localhost" : location.hostname;
            }

            if (domainName.substr(0, 7) == "http://" || domainName.substr(0, 8) == "https://")
            {
                var domain = domainName;
            }
            else
            {
                //---- copy originating protocol ----
                var protocol = "http://";
                var index = location.href.indexOf("//");
                if (index > -1)
                {
                    protocol = location.href.substr(0, index + 2);
                }

                var domain = protocol + domainName;
            }

            return domain;
        }

        //---- this function sends messages to a VAAS ----
        postVisMsg(cmd: string, param?: string, param2?: string, param3?: string, param4?: string,
            param5?: string, disableBatching?: boolean, callback?: any, isOneTimeCallback?: boolean)
        {
            var requestId = "req-" + nextRequestId++;           // force it to be a string, so dict/key indexes works as desired

            //---- for now, only viewIndex=0 is supported (single view WITHIN a chart, but can have multiple charts that are linked together) ----
            var msgObj = {
                cmd: cmd, viewId: 0, requestId: requestId, param: param, param2: param2, param3: param3, param4: param4,
                param5: param5, fromHost: this._hostId, cmdId: this._cmdId
            };

            if (callback)
            {
                callback._isOneTimeCallback = isOneTimeCallback;

                this._pendingCallbacks[requestId] = callback;
            }

            if (this._cmdBatchingEnabled && !disableBatching)
            {
                //---- batch this cmd ----
                if (!this._batchTimer)
                {
                    //this._engineIsLoaded = true;//TODO: remove this line.
                    //---- don't start the time until the chart has been loaded ----
                    if (this._engineIsLoaded)
                    {
                        this._batchTimer = setTimeout((e) =>
                        {
                            this.sendBatchCmdsNow();
                        }, 1);

                        this._batchBuffer = [];
                    }
                }

                //debug("BATCHING cmd: " + cmd);
                this._batchBuffer.push(msgObj);
            }
            else
            {
                //---- no batching - send cmd now ----
                var msgStr = JSON.stringify(msgObj);
                this.postVisMsgNow(msgStr);
            }
        }

        sendBatchCmdsNow()
        {
            if (this._batchTimer)
            {
                clearTimeout(this._batchTimer);
                this._batchTimer = null;
            }

            if (this._batchBuffer.length)
            {
                //debug("====> sending " + this._batchBuffer.length + " BATCH cmds to IFrame now");

                var msgStr = JSON.stringify(this._batchBuffer);
                this.postVisMsgNow(msgStr);

                this._batchBuffer = [];
            }
        }

        postVisMsgNow(msgStr: string)
        {
            
            iframeBus.postMessage(msgStr);
            //this._iframe.contentWindow.postMessage(msgStr, this._domain);
        }

        onIFrameLoaded()
        {
            this._engineIsLoaded = true;
            this.sendBatchCmdsNow();
        }

        /** subclass must override this and return true for messages that belong to him. */
        preprocessMsg(msgBlock)
        {
            return false;
        }

        //---- this function receives messages (events) from a VAAS ----
        onMsgFromVis(strMsg)
        {
            //---- ignore FaceBook msgs from their iframe ----
            var isForUs = (strMsg.slice && strMsg.slice(0, 4) != "_FB_");

            if (isForUs)      
            {
                var jsonData = JSON.parse(strMsg);
                if (jsonData.msg)
                {
                    this.onMsgFromVisCore(jsonData);
                }
                else if (jsonData.length)
                {
                    //---- must be an array (a batch of msgs) ----
                    for (var i = 0; i < jsonData.length; i++)
                    {
                        var msgBlock = jsonData[i];
                        this.onMsgFromVisCore(msgBlock);
                    }
                }
                else
                {
                    throw "Error in onMsgFromVis: unknown data=" + jsonData;
                }
            }
        }

        onMsgFromVisCore(msgBlock)
        {
            //---- only process if this is for my chart ----
            if (this.preprocessMsg(msgBlock))
            {
                var key = msgBlock.visId + "." + msgBlock.msg;

                if (msgBlock.msg == "engineLoaded")
                {
                    this.onIFrameLoaded();
                }
                else if (msgBlock.msg == "clientAppLoaded")
                {
                    this.onIFrameLoaded();
                }

                //debug("onMsgFromVisCore: msgBlock.msg=" + msgBlock.msg);

                //if (msgBlock.reponseId !== undefined)
                //{
                //    debug("-----> onMsgFromVisCore: msgBlock.responseId=" + msgBlock.reponseId);
                //}

                var callback = this._pendingCallbacks[msgBlock.responseId];
                if (callback)
                {
                    callback(msgBlock, this);

                    if (callback._isOneTimeCallback)
                    {
                        delete this._pendingCallbacks[msgBlock.responseId];
                    }
                }

                var hooker = this._hookers[key];
                if (hooker)
                {
                    hooker(msgBlock, this);
                }
            }
        }

        /** subscribe to the specified chart engine event (string or bps.ChartEvent).  if "oneTimeOnly" is true, then subscription is turned off after first delivery. */
        public subscribe(event: any, returnData: boolean, callback: any, oneTimeOnly?: boolean)
        {
            var strEvent = event;

            if (!isNaN(+strEvent))
            {
                //---- convert from enum (number) to string ----
                strEvent = ChartEvent[strEvent];
            }

            var key = this._chartId + "." + strEvent;
            this._hookers[key] = callback;

            this.postVisMsg("subscribe", strEvent, returnData + "", oneTimeOnly + "");
        }


        /** <bps-chart> element has chart properties specified as custom attributes of the element. */
        private processBpsChartAttributes(elem: HTMLElement, iFrame: HTMLIFrameElement)
        {
            var str = "";

            for (var i = 0; i < elem.attributes.length; i++)
            {
                var attr = elem.attributes[i];

                if (attr.name == "style")
                {
                    iFrame.setAttribute("style", attr.value);
                }
                else if (true)       // attr.name != "width" && attr.name != "height" && attr.name != "id")
                {
                    str += "&" + attr.name + "=" + attr.value;
                }
            }

            return str;
        }

        /** IFRAME element has chart properties specified as the value of the "data-props" custom attribute. */
        processIFrameChartAttributes(elem: HTMLElement, iFrame: HTMLIFrameElement)
        {
            var str = "";
            var fromStr = elem.getAttribute("data-props");

            if (fromStr && fromStr.length)
            {
                var props = fromStr.split(";");

                for (var i = 0; i < props.length; i++)
                {
                    var prop = props[i].trim();
                    var parts = prop.split(":");

                    str += "&" + parts[0] + "=" + parts[1];
                }
            }

            return str;
        }

        /** subclass must override this. */
        getIFrameSrc(baseServerDir: string)
        {
            return null;
        }

        processChartTag(elem: HTMLElement, baseServerDir: string, iFrame?: HTMLIFrameElement)
        {
            var isBpsTag = false;

            if (!iFrame)
            {
                iFrame = <HTMLIFrameElement> document.createElement("iframe");
                iFrame.setAttribute("frameborder", "0");
                elem.appendChild(iFrame);
                isBpsTag = true;
            }

            var visId = elem.getAttribute("id");

            if (!baseServerDir)
            {
                //---- assume bpsHelper is on the same server ----
                baseServerDir = "..";
            }

            var src = this.getIFrameSrc(baseServerDir);

            //---- pass SOME URL parameters from APP to ENGINE ----
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

            if (url.toLowerCase().indexOf("isbrowsercontrol") > -1)
            {
                src += "&isBrowserControl=true";
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

            debug("setting chart iframe src=" + src);

            if (isBpsTag)
            {
                var attrValuePairs = this.processBpsChartAttributes(elem, iFrame);
            }
            else
            {
                var attrValuePairs = this.processIFrameChartAttributes(elem, iFrame);
            }

            //---- by default, expand iframe to fill parent element size (bps-chart) ----
            if (iFrame.style.width == "")
            {
                iFrame.style.width = "100%";
            }

            if (iFrame.style.height == "")
            {
                iFrame.style.height = "100%";
            }

            src += attrValuePairs;

            //---- this will cause the IFRAME to begin loading ----
            iFrame.src = src;
        }
    }


}