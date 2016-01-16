///-----------------------------------------------------------------------------------------------------------------
/// popupMenu.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - code for managing a simple popup menu
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class PopupMenuClass extends BasePopupClass
    {
        public context = null;

        constructor(application: AppClass, container: HTMLElement, openerIds: string, id: string, names: any[], callback, hideAfterCallback = false, limitHeight = true, verticalMargin = 0,
            iconWidth?: number, ownerElem?: HTMLElement, internalOwnerElement: HTMLElement = ownerElem)
        {
            super(application, container, openerIds, ownerElem);

            var maxPanelHeight = AppClass.maxPanelHeight;

            //---- close and remove any existing popup menus before creating this one ----
            //vp.select("popupMenu")
            //    .remove();

            var rootW = vp.select(document.createElement("div"))
                .addClass(id)
                // .css("position", "absolute")
                .addClass("popupMenu");

            //---- holder of menu items ----
            var holderW = rootW.append("div")
                .addClass("menuItemHolder");

            var textItemIndex = 0;
            var menuItemIndex = 0;
            var indexes = { menuItemIndex: menuItemIndex, textItemIndex: textItemIndex };

            for (var i = 0; i < names.length; i++)
            {
                var info = names[i];
                PopupMenuClass.addItem(holderW, info, indexes, hideAfterCallback, callback, (e) => this.close(), iconWidth);
            }

            let currentOwnerElement: vp.dom.IWrapperOuter = null;

            if (internalOwnerElement) {
                currentOwnerElement = vp.select(internalOwnerElement);
            } else {
                currentOwnerElement = vp.select(this.container/*, ".sandDance"*/);
            }

            currentOwnerElement.append(rootW[0]);

            // document.body.appendChild(rootW[0]);

            this._root = rootW[0];
            rootW[0].jsObj = this;

            //---- adjust height of holder to be <= panel ----
            var holderHeight = Math.min(maxPanelHeight - verticalMargin, holderW.height());

            holderW
                .css("margin-top", verticalMargin + "px")
                .css("margin-bottom", verticalMargin + "px")
                .css("height", holderHeight + "px");
        }

        changeRootClass(newClass: string)
        {
            vp.select(this._root)
                .removeClass("popupMenu")
                .addClass(newClass);
        }

        public static addItem(parentW: vp.dom.IWrapperOuter, item: any, indexes: any, hideAfterCallback: boolean,
            clickCallback: any, hideCallback?: any, iconWidth?: number)
        {
            var name = item;
            var disabled = false;
            var tip = null;
            var iconSrc = null;
            var padding = null;

            if (!vp.utils.isString(item))
            {
                var md = <MenuItemData>item;

                name = md.text;
                disabled = md.isDisabled;
                tip = md.tooltip;
                iconSrc = md.iconSrc;
                padding = md.padding;
            }

            if (name === "-")
            {
                var menuItemW = parentW.append("hr")
                    .addClass("popupMenuHR")
                    .attr("_menuIndex", indexes.menuItemIndex++);
            }
            else
            {
                var menuItemHolder = vp.select(document.createElement("div"))
                    .addClass("popupMenuItemHolder")
                    .attr("_menuIndex", indexes.menuItemIndex)
                    .attr("_textIndex", indexes.textItemIndex)
                    .attr("title", tip);

                parentW.append(menuItemHolder);

                if (iconSrc)
                {
                    var imgW = menuItemHolder.append("div")//img
                        //.attr("src", iconSrc)
                        .addClass(iconSrc)
                        .addClass("popupMenuIcon");

                    imgW.element()
                        .addEventListener("dragstart", function (e)
                        {
                            //---- prevent drag of icon ----
                            e.preventDefault();
                        });

                    if (iconWidth !== undefined)
                    {
                        imgW.css("width", iconWidth + "px");
                    }

                }

                var menuItemW = menuItemHolder.append("span")
                    .addClass("popupMenuItem")
                    .text(name)
                    .attr("_menuIndex", indexes.menuItemIndex)
                    .attr("_textIndex", indexes.textItemIndex);

                if (padding)
                {
                    menuItemW
                        .css("padding", padding);
                }

                indexes.menuItemIndex++;
                indexes.textItemIndex++;

                if (disabled)
                {
                    //---- we use the custom attribute form here, since "disabled" only works on FORM elements ----
                    menuItemHolder.attr("data-disabled", true + "");
                    //tip = "[disabled] " + tip;
                }

                menuItemHolder.element().addEventListener("click", (e) => 
                {
                    var mi = e.target;
                    if (!vp.dom.hasClass(mi, "popupMenuItemHolder"))
                    {
                        mi = mi.parentElement;
                    }

                    if (mi.getAttribute("data-disabled") !== "true")
                    {
                        if (!hideAfterCallback)
                        {
                            if (hideCallback)
                            {
                                hideCallback();
                            }
                        }

                        var cbMenuItem = e.target;
                        if (!vp.dom.hasClass(cbMenuItem, "popupMenuItemHolder"))
                        {
                            cbMenuItem = cbMenuItem.parentElement;
                        }

                        var menuIndex = cbMenuItem.getAttribute("_menuIndex");
                        var textIndex = cbMenuItem.getAttribute("_textIndex");

                        setTimeout(function() {
                            clickCallback(e, parentW, textIndex, menuIndex);
                            
                            if (hideAfterCallback)
                            {
                                if (hideCallback)
                                {
                                    hideCallback();
                                }
                            }
                        }, 0);
                        //---- close is called by "hideCallback" ----
                    }
                    //else
                    //{
                    //    this.hide();
                    //}
                });

                return menuItemW;
            }
        }

    }

    export class MenuItemData
    {
        iconSrc: string;
        text: string;
        isDisabled: boolean;
        tooltip: string;
        padding: string;
        isNone: boolean;

        constructor(text: string, tooltip?: string, iconSrc?: string, isDisabled?: boolean, padding?: string)
        {
            this.text = text;
            this.tooltip = tooltip;
            this.iconSrc = iconSrc;
            this.isDisabled = isDisabled;
            this.padding = padding;
            this.isNone = false;
        }
    }

}
 