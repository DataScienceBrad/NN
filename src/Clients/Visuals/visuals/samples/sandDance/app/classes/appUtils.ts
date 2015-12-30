//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    appUtils.ts - utility functions for BeachPartyApp.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class AppUtils
    {
        public static getLastNodeOfUrl(url: string)
        {
            var index = url.lastIndexOf("/");
            if (index === -1)
            {
                var index = url.lastIndexOf("\\");
            }

            if (index > -1)
            {
                url = url.substr(index + 1);
            }

            return url;
        }

        public static capitalizeFirstLetter(value: string)
        {
            if (value.length)
            {
                value = value[0].toUpperCase() + value.substr(1);
            }

            return value;
        }

        public static lowerCaseFirstLetter(value: string)
        {
            if (value.length)
            {
                value = value[0].toLowerCase() + value.substr(1);
            }

            return value;
        }

        public static callPanelOpen(e, callback)
        {
            if (e)
            {
                var elem = e.target;

                //---- find elem with id (some inner parts of buttons don't have them ----
                if (!elem.id)
                {
                    elem = elem.parentElement;
                }

                if (elem.ignoreNextClick)
                {
                    elem.ignoreNextClick = false;
                }
                else
                {
                    callback(e);
                }

            //vp.utils.debug("elem.id=" + elem.id + " +, elem.ignoreNextClick=" + elem.ignoreNextClick);
            }
            else
            {
                callback(e);
            }
        }

        public static setButtonSelectedState(baseName: string, value: boolean, fnNorm: string, fnSelect: string)
        {
            var buttonName = "#" + baseName + "Button";
            var imgName = "#" + baseName + "Img";

            if (value)
            {
                //---- mark as SELECTED and change images, if needed ----
                vp.select(buttonName).attr("data-selected", "true");
                vp.select(imgName).attr("data-selected", "true");
                vp.select(imgName).removeClass(fnNorm).addClass(fnSelect);
            }
            else
            {
                //---- mark as NOT SELECTED and change images, if needed ----
                vp.select(buttonName).attr("data-selected", "false");
                vp.select(imgName).attr("data-selected", "false");
                vp.select(imgName).removeClass(fnSelect).addClass(fnNorm);
            }
        }

    }
}
 