//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    localFileHelper.ts - helps open and save to local files.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class LocalFileHelper
    {
        public static loadFile(fileExts: string, callback)
        {
            //---- click on the hidden FILE button to invoke the brower's FILE OPEN dialog ----
            var button = document.getElementById("inputFileOpen");
            button.setAttribute("accept", fileExts);

            //---- MUST clear out previous contents of button (or onchange may not work) ----
            button.onchange = null;
            vp.dom.value(button, "");

            button.onchange = (e) => this.loadFileStageTwo(button, callback);

            button.click();
        }

        private static loadFileStageTwo(button: any, callback)
        {
            var fileToLoad = button.files[0];

            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent)
            {
                var text = (<any>fileLoadedEvent.target).result;
                callback(text, fileToLoad.name);
            };

            fileReader.readAsText(fileToLoad);      // , "UTF-8");
        }

        public static saveToLocalFile(fn: string, value: any, blobType = "text/plain")
        {
            var blobObject = new Blob([value], { type: blobType });
            this.saveBlobToLocalFile(fn, blobObject, blobType);
        }

        public static saveBlobToLocalFile(fn: string, blobObject: Blob, blobType = "text/plain")
        {
            blobObject.type = blobType;

            if (vp.utils.isIE)
            {
                window.navigator.msSaveOrOpenBlob(blobObject, fn);
            }
            else
            {
                var downloadLink = <any>document.getElementById("helperAnchor");
                var anyWindow = <any>window;

                downloadLink.download = fn;
                downloadLink.innerHTML = "Download File";
                downloadLink.href = anyWindow.URL.createObjectURL(blobObject);

                downloadLink.click();
            }
        }

        public static saveBase64ToLocalFile(fn: string, strBase64: string, blobType = "image/png")
        {
            //---- convert base64 string to a set of byte arrays ----
            var byteChars = atob(strBase64);       // create a character for each byte of binary data represented in strBase64
            var byteNumbers = [];       //new Array(byteCharacters.length);

            for (var i = 0; i < byteChars.length; i++)
            {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);
            var blobObject = new Blob([byteArray], { type: blobType });

            this.saveBlobToLocalFile(fn, blobObject, blobType);
        }
    }
}
