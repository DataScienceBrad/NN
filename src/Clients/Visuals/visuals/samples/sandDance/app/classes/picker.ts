//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    picker.ts - a BeachParty-style DROPDOWN control (with full control over styling, unlike HTML select control).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class PickerClass extends beachParty.DataChangerClass 
    {
        private application: AppClass;
        private container: HTMLElement;

        _root: HTMLDivElement;
        _parentElem: HTMLElement;
        _textElem: HTMLElement;
        _chevronElem: HTMLImageElement;

        _values: string[];
        _value: string;     
        _iconWidth: number;

        constructor(application: AppClass, container: HTMLElement, parentElem: HTMLElement, prompt: string, values: string[], initialValue: string, tooltip: string,
            capitalizeFirstValue?: boolean, iconWidth?: number)
        {
            super();

            this.application = application;
            this.container = container;

            this._parentElem = parentElem;
            this._values = values;
            this._iconWidth = iconWidth;

            //---- create prompt ----
            if (prompt)
            {
                var spanW = vp.select(parentElem).append("span");

                //---- prompt: TYPE ----
                spanW.append("span")
                    .addClass("panelPrompt")
                    .text(prompt)
                    .css("margin-right", "4px");

                parentElem = spanW[0];
            }

            //---- create DROPDOWN BUTTON to hold text and chevron ----
            var ddButtonW = vp.select(parentElem).append("span")
                .addClass("panelButton")
                .title(tooltip)
                .css("cursor", "pointer")
                .css("white-space", "nowrap");

            // ----create TEXT part of button ----
            var ddTextW = ddButtonW.append("span")
                .addClass("panelButtonText")
                .css("vertical-align", "middle")
                .css("text-align", "left");

            //---- to workaround issue of mouse "dead zones" around img, try embedding it inside a in-line block span ----
            var divW = ddButtonW.append("span")
                .addClass("panelButtonChevron")
                .css("display", "inline-block")
                .css("cursor", "pointer");

            //---- add dropdown CHEVRON icon ----
            var chevronW = divW.append("div")
                // .attr("src", "Images/smallChevron3.png")
                .addClass("chevron-background")
                .css("margin-left", "4px")
                .css("margin-bottom", "2px")
                .css("vertical-align", "bottom");

            chevronW.element()
                .addEventListener("dragstart", function (e)
                {
                    //---- prevent drag of icon ----
                    e.preventDefault();
                });

            ddButtonW.element()
                .addEventListener("click", (e) =>
                {
                    this.onPickerClick(e);        // //onOpenCallback(row.dataName, ddText, chevronW, e);
                });

            //---- set initial value ----
            var value = initialValue;
            if (capitalizeFirstValue)
            {
                //---- change all enum values to start with a capital letter ----
                value = AppUtils.capitalizeFirstLetter(value);
            }

            this._textElem = ddTextW[0];
            this._chevronElem = chevronW[0];

            if (prompt)
            {
                this._root = spanW[0];
            }
            else
            {
                this._root = ddButtonW[0];
            }

            this.value(value);
        }

        getRoot()
        {
            return this._root;
        }

        value(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._value;
            }

            if (value !== this._value)
            {
                this._value = value;
                this.onDataChanged("value");

                this._textElem.textContent = value;
            }
        }

        values(value?: string[])
        {
            if (arguments.length === 0)
            {
                return this._values;
            }

            this._values = value;
            this.onDataChanged("values");
        }

        static buildStringsFromEnum(enumType, capitalizeFirstLetter = true)
        {
            var pickerItems = vp.utils.keys(enumType);

            //---- capitalize the first letter of each enum name ----
            if (capitalizeFirstLetter)
            {
                pickerItems = pickerItems.map((name) => AppUtils.capitalizeFirstLetter(name));
            }

            //---- todo: what does this filter out? ----
            var pickerItems = pickerItems.filter((k) =>
            {
                return (isNaN(+k));
            });

            //---- some long list of enum values have separators in them; substitute a menu line marker ----
            var pickerItems = pickerItems.map((val) =>
            {
                return (val === "separator") ? "-" : val;
            });

            return pickerItems;
        }

        onPickerClick(e)
        {
            var picker: PopupMenuClass = null;
            var colItems = <any[]>this._values;
            var verticalMargin = null;
            var iconWidth = this._iconWidth;

            if (colItems)
            {
                picker = new PopupMenuClass(this.application, this.container, null, "generalColPicker", colItems, (e, menu, textIndex, menuIndex) =>
                {
                    var value = colItems[menuIndex];
                    if (value instanceof MenuItemData)
                    {
                        value = (<MenuItemData>value).text;
                    }

                    this.value(value);
                }, undefined, undefined, verticalMargin, iconWidth, this._parentElem);
            }

            picker.openWithoutPosition();
        }

    }

}