//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    listBox.ts - defines listbox that holds strings or MenuItemData items.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class ListBoxClass extends beachParty.dataChangerClass
    {
        _root: HTMLElement;

        constructor(parent: HTMLElement, items: any[], clickCallback, iconWidth?: number)
        {
            super();

            var menuItemIndex = 0;
            var textItemIndex = 0;
            var indexes = { menuItemIndex: menuItemIndex, textItemIndex: textItemIndex };

            var rootW = vp.select(parent).append("div")
                .addClass("listBox")
                .css("overflow-y", "auto")
                .css("overflow-x", "hidden");
                //.css("max-height", maxHeight + "px")

            this._root = rootW[0];

            var listW = rootW.append("div")
                .addClass("listBoxList");

            for (var i = 0; i < items.length; i++)
            {
                var item = items[i];
                PopupMenuClass.addItem(listW, item, indexes, false, (e, menu, textIndex, menuIndex) =>
                {
                    var mid = <MenuItemData>items[menuIndex];
                    clickCallback(mid);
                }, null, iconWidth);
            }
        }
    }
}
 