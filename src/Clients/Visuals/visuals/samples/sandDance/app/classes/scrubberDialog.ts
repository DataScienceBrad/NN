//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    scrubberDialog.ts - popup panel for data scrubbing.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class scrubberDialogClass extends basePanelClass
    {
        static maxRows = 9;

        //---- dialog controls ----
        _listElem: HTMLElement;
        _displayElem: HTMLElement;
        _descElem: HTMLElement;
        _valuesTableElem: HTMLTableElement;
        _typeCombo: pickerClass;

        _origColInfos: bps.ColInfo[];           // full set of columns (unscrubbed)
        _startingColInfos: bps.ColInfo[];       // SCRUBBED columns, on input
        _editColInfos: editColInfo[];           // current state of SCRUBBED columns

        _showOnlyVisible = false;
        _searchText = null;
        _selectedEditItem: editColInfo = null;
        _listItemElems = [];
        _resetValueMapsWhenLoaded = false;
        _selectedValueIndex = -1;
        _valueRows: HTMLElement[];

        //---- tab stuff ----
        _currentTabContentElem: HTMLElement;
        _currentTabButtonElem: HTMLElement;

        constructor(origColInfos: bps.ColInfo[], colInfos: bps.ColInfo[])
        {
            super("scrubberDialog", true, null, "Data Scrubber", null, null);

            this._origColInfos = origColInfos;
            this._startingColInfos = colInfos;

            var rootW = vp.select(this._root)

            var maxHeight = 125;

            var panelTableW = rootW.append("table")
                .css("border-bottom", "1px solid gray")

            var panelRow = panelTableW.append("tr")

            //---- add LEFT PANEL ----
            var leftPanelW = panelRow.append("td")
                .css("border-right", "1px solid gray")

            //---- add RIGHT PANEL ----
            var rightPanelW = panelRow.append("td")
            //.css("border", "1px solid gray")
                .css("width", "200px")
                .attr("valign", "top")

            //---- add TABS to right panel ----
            var tabsHolderW = rightPanelW.append("div")
                .addClass("tabButtonContainer")

            //---- PROPERTIES tab ----
            var propsW = tabsHolderW.append("span")
                .addClass("tabButton")
                .text("Properties")
                .id("properties")
                .title("View or Edit the properties of the column")
                .attach("click", (e) =>
                {
                    this.onTabSelected(e.target);
                })

            //---- VALUES tab ----
            var valuesW = tabsHolderW.append("span")
                .addClass("tabButton")
                .text("Values")
                .id("values")
                .title("View or Edit the values of the column")
                .attach("click", (e) =>
                {
                    this.onTabSelected(e.target);
                })

            var divW = rightPanelW.append("div")
                .css("height", "254px")     // keep constant height (as content height changes)
                .css("width", "290px")

            this.addPropertyControls(divW, "propertiesContent");
            this.addValueControls(divW, "valuesContent");

            //---- RESET button ----
            var resetW = rightPanelW.append("td").append("span")
                .addClass("panelButton")
                //.css("width", "55px")
                .text("Reset column")
                .title("Remove all scrubbing for this column")
                .css("float", "right")
                .attach("click", (e) =>
                {
                    this.resetColumn(this._selectedEditItem);
                });

            //---- make the first tab active ----
            this.onTabSelected(propsW[0]);

            this.buildLeftPanel(leftPanelW);

            this.addOkCancelButtons(rootW);

            this.centerPanel();
        }

        buildLeftPanel(leftPanelW: vp.dom.singleWrapperClass)
        {
            this.addSearchBox(leftPanelW);

            this.addShowOnlyCheckbox(leftPanelW);

            //---- add LISTBOX ----
            var listW = leftPanelW.append("div")
                .addClass("listBox")
                .attr("size", "5")
                .css("overflow-y", "auto")
                .css("overflow-x", "none")
                .css("width", "220px")
                .css("border", "1px solid gray")
                .css("margin", "6px")
                //.css("max-height", maxHeight + "px")
                .css("height", "200px")             // fix height to avoid resizing dialog when toggle VISIBLE filter

            //var listW = listW.append("div")
            //    .addClass("listBoxList")

            this._listElem = listW[0];

            this.buildEditColInfos(false);
            this.buildListBoxItems();

            this.addBottomButtons(leftPanelW);
        }

        onTabSelected(tabButton: HTMLElement)
        {
            //---- hide current tab content ----
            if (this._currentTabContentElem)
            {
                vp.select(this._currentTabContentElem)
                    .css("display", "none")

                vp.select(this._currentTabButtonElem)
                    .removeClass("tabButtonOpen")

                this._currentTabContentElem = null;
                this._currentTabButtonElem = null;
            }

            //---- make new tab content visible ----
            var buttonId = tabButton.id;
            var contentId = buttonId + "Content";

            var tabContentW = vp.select("#" + contentId)

            if (tabContentW.length)
            {
                tabContentW
                    .css("display", "")         // makes it default to visible

                var tabButtonW = vp.select("#" + buttonId)
                    .addClass("tabButtonOpen")

                this._currentTabContentElem = tabContentW[0];
                this._currentTabButtonElem = tabButtonW[0];
            }
        }

        addValueControls(rootW: vp.dom.IWrapperOuter, id: string)
        {
            var divW = rootW.append("div")
                .css("margin", "10px")
                .attr("id", id)
                .css("max-height", "254px")
                .css("overflow-y", "auto")
                .css("display", "none")     // hide initially
                .css("white-space", "nowrap")

            //---- up/down holder ----
            var upDownW = divW.append("div")

            //---- add DOWN button ----
            var upW = upDownW.append("span")
                .addClass("panelButton")
                .id("downButton")
                .css("float", "right")
                .css("margin-right", "10px")
                .css("margin-bottom", "5px")
                .html("&#8595;")        // down arrow
                .title("Move the selected value down")
                .attach("click", (e) =>
                {
                    this.moveSelectedValue(1);
                })

            //---- add UP button ----
            var upW = upDownW.append("span")
                .addClass("panelButton")
                .id("upButton")
                .css("float", "right")
                .html("&#8593;")         // up arrow
                .title("Move the selected value up")
                .attach("click", (e) =>
                {
                    this.moveSelectedValue(-1);
                })

            var tableW = divW.append("table")
                .css("border-collapse", "collapse")

            this._valuesTableElem = tableW[0];
        }

        onSelectedValueChanged()
        {
            var upDisabled = (this._selectedValueIndex <= 0);

            var downDisabled = (this._selectedValueIndex == -1);
            if ((!downDisabled) && this._selectedEditItem && this._selectedEditItem.sortedKeys)
            {
                downDisabled = (this._selectedValueIndex >= this._selectedEditItem.sortedKeys.length - 1);
            }

            vp.select(this._root, "#upButton")
                .attr("data-disabled", upDisabled ? "true" : "false")

            vp.select(this._root, "#downButton")
                .attr("data-disabled", downDisabled ? "true" : "false")
        }

        moveSelectedValue(delta: number)
        {
            if (this._selectedValueIndex != -1)
            {
                var fromIndex = this._selectedValueIndex;
                var sortedKeys = this._selectedEditItem.sortedKeys;

                var toIndex = this._selectedValueIndex + delta;
                if (toIndex >= 0 && toIndex < sortedKeys.length)
                {
                    var value = sortedKeys[fromIndex];

                    sortedKeys.removeAt(fromIndex);

                    //if (delta < 0)
                    //{
                    //    toIndex--;
                    //}

                    sortedKeys.insert(toIndex, value);

                    this._selectedValueIndex = toIndex;
                    this.loadColumnValues(this._selectedEditItem, false);

                    this.onSelectedValueChanged();
                }
            }
        }

        addPropertyControls(rootW: vp.dom.IWrapperOuter, id: string)
        {
            var tableW = rootW.append("table")
                //.css("border", "1px solid blue")
                .css("margin", "10px")
                .attr("id", id)

            //---- 2nd row ----
            var nextRowW = tableW.append("tr")
                .css("height", "30px")

            //---- prompt: DISPLAY ----
            var promptW = nextRowW.append("td")
                .addClass("panelPrompt")
                .text("Display:")

            //---- TEXT ----
            var displayW = nextRowW.append("td").append("input")
                .addClass("panelText")
                .attr("type", "text")
                .css("width", "100px")
                .attach("keyup", (e) =>
                {
                    this._selectedEditItem.displayName = e.target.value;
                })

            this._displayElem = displayW[0];

            //---- 3nd row ----
            var nextRowW = tableW.append("tr")

            //---- prompt: TYPE ----
            var promptW = nextRowW.append("td")
                .addClass("panelPrompt")
                .text("Type:")

            //---- don't use HTML SELECT elements - they don't style well on Windows ----
            var tdW = nextRowW.append("td");
            var picker = new pickerClass(tdW[0], null, ["string", "number", "date"], "string", "set how this column's values are recognized", false);

            picker.registerForChange("value", (e) =>
            {
                var newType = picker.value();
                var selectedItem = this._selectedEditItem;

                selectedItem.colType = newType;

                if (newType == "string")
                {
                    selectedItem.min = null;
                    selectedItem.max = null;
                }
                else
                {
                    selectedItem.min = selectedItem.origCol.min;
                    selectedItem.max = selectedItem.origCol.max;
                }
            });

            this._typeCombo = picker;

            //---- 4nd row ----
            var nextRowW = tableW.append("tr")

            //---- prompt: DESC ----
            var promptW = nextRowW.append("td")
                .addClass("panelPrompt")
                .text("Desc:")
                .attr("valign", "top")

            //---- TEXTAREA ----
            var textAreaW = nextRowW.append("td").append("textarea")
                .addClass("panelTextArea")
                .css("height", "80px")
                .attach("keyup", (e) =>
                {
                    this._selectedEditItem.desc = e.target.value;
                })

            this._descElem = textAreaW[0];

            //---- 5nd row ----
            var nextRowW = tableW.append("tr")
                .css("height", "15px")

            var nextRowW = tableW.append("tr")

            var promptW = nextRowW.append("td")

        }

        resetColumn(ei: editColInfo)
        {
            //---- copy info from matching entry in colInfos ----
            var ci = ei.origCol;

            ei.displayName = ci.name;
            ei.colType = ci.colType;
            ei.desc = ci.desc;
            ei.sortedKeys = vp.utils.copyArray(ci.sortedKeys);

            this.resetValueMap(ei.valueMap);

            //ei.isVisible = true;

            this.loadColumnProps(ei);
            this.loadColumnValues(ei);
        }

        resetValueMap(vm: bps.ValueMapEntry[])
        {
            //---- reset values in valueMap ----
            for (var i = 0; i < vm.length; i++)
            {
                var entry = vm[i];
                entry.newValue = entry.originalValue;
            }
        }

        addSearchBox(rootW: vp.dom.IWrapperOuter)
        {
            //---- start new row ----
            var nextRowW = rootW.append("div")
                .css("margin-top", "10px")
                .css("margin-bottom", "10px")
                .css("margin-left", "10px")

            //---- SEARCH prompt ----
            var promptW = nextRowW.append("span")
                .addClass("panelPrompt")
                .text("Search:")

            //---- TEXTBOX ----
            var cbW = nextRowW.append("input")
                .attr("type", "text")
                .addClass("panelText")
                .title("Search for columns containing this text")
                .css("margin-left", "10px")
                .css("margin-right", "10px")
            //.css("width", "50px")
                .attach("focus", (e) =>
                {
                    //---- select all text on focus ----
                    e.target.select();
                })
                .attach("keyup", (e) =>
                {
                    this.doSearch(e);
                })
         
        }

        doSearch(e)
        {
            this._searchText = e.target.value.toLowerCase();
            this.buildListBoxItems();
        }

        addShowOnlyCheckbox(rootW: vp.dom.IWrapperOuter)
        {
            //---- start new row ----
            var nextRowW = rootW.append("div")
                .css("margin-top", "10px")
                .css("margin-bottom", "10px")
                .title("when checked, only visible columns are shown in the list below")
                .attach("click", (e) =>
                {
                    this.toggleShowFilter(e);
                })

            //---- add "show only visible columns" CHECKBOX ----
            var cbW = nextRowW.append("input")
                .attr("type", "checkbox")
                .addClass("panelCheckbox")
                .css("margin-left", "10px")

            var cbTextW = nextRowW.append("span")
                .addClass("panelPrompt")
                .text("Show only visible columns")

            nextRowW[0].checkBox = cbW[0];
        }

        addBottomButtons(rootW: vp.dom.IWrapperOuter)
        {
            //---- start new row ----
            var nextRowW = rootW.append("div")
                .css("margin-top", "10px")
                .css("margin-bottom", "20px")

            //---- add SHOW ALL button ----
            var showAllW = nextRowW.append("span")
                .addClass("panelButton")
                .css("margin-left", "10px")
                .css("width", "55px")
                .text("Show All")
                .css("white-space", "nowrap")
                .title("Make all columns visible")
                .attach("click", (e) =>
                {
                    this.showAllColumns(true);
                })

            //---- add HIDE ALL button ----
            var showAllW = nextRowW.append("span")
                .addClass("panelButton")
                .css("margin-left", "10px")
                .css("width", "55px")
                .text("Hide All")
                .title("Make all columns hidden")
                .attach("click", (e) =>
                {
                    this.showAllColumns(false);
                })

            //---- add RESET button ----
            var resetW = nextRowW.append("span")
                .addClass("panelButton")
                .css("margin-left", "10px")
                .css("width", "55px")
                .text("Reset")
                .title("Remove all scrubbing and restore all columns to their original values")
                .attach("click", (e) =>
                {
                    this.resetAllColumns();
                })
        }

        addOkCancelButtons(rootW: vp.dom.IWrapperOuter)
        {
            //---- start dialog button row ----
            var buttonRowW = rootW.append("div")
                .css("margin-top", "10px")
                .css("margin-bottom", "10px")

            //---- add CANCEL button ----
            var okW = buttonRowW.append("span")
                .addClass("panelButton")
                .text("Cancel")
                .css("width", "55px")
                .css("margin-right", "10px")
                .css("margin-bottom", "10px")
                .css("float", "right")
                .attach("click", (e) =>
                {
                    this.closeDialog(false);
                })

            //---- add OK button ----
            var okW = buttonRowW.append("span")
                .addClass("panelButton")
                .css("width", "55px")
                .css("margin-right", "10px")
                .text("OK")
                .css("float", "right")
                .attach("click", (e) =>
                {
                    this.closeDialog(true);
                })

        }

        resetAllColumns()
        {
            this._selectedEditItem = null;         // will select the first item when listBox is rebuilt
            this._resetValueMapsWhenLoaded = true;

            this.buildEditColInfos(true);
            this.buildListBoxItems();
        }

        showAllColumns(show: boolean)
        {
            var editInfos = this._editColInfos;

            for (var i = 0; i < editInfos.length; i++)
            {
                var ei = editInfos[i];
                ei.isVisible = show;
            }

            this.buildListBoxItems();
        }

        buildEditColInfos(resetColumns: boolean)
        {
            //---- we need to start with origColInfos, and then apply any changes from SCRUBBED input=colInfos ----
            var newInfos = <editColInfo[]>[];
            var editMap = {};

            //---- first, build list using origColInfos ----
            for (var i = 0; i < this._origColInfos.length; i++)
            {
                var gi = this._origColInfos[i];

                var newCi = new editColInfo(gi.name, gi.desc, gi.colType, vp.utils.copyArray(gi.sortedKeys), gi.min, gi.max);
                
                newCi.isVisible = resetColumns;
                newCi.origCol = gi;
                
                newInfos.push(newCi);
                editMap[gi.name] = i;

                //if (resetColumns)
                //{
                //    //---- must update values in sortedKeys from original values to match mapValue ----
                //    this.updateColSortedKeysToNewValues(newCi);
                //}
            }

            if (!resetColumns)
            {
                //---- now, update the list using colInfos ----
                for (var i = 0; i < this._startingColInfos.length; i++)
                {
                    var si = this._startingColInfos[i];

                    //---- find matching item in our list ----
                    var index = editMap[si.name];
                    if (index === undefined)
                    {
                        //---- if this a renamed field? ----
                        index = editMap[si.calcFieldExp];
                    }

                    if (index !== undefined)
                    {
                        var newCi = newInfos[index];
                        newCi.isVisible = true;
                        newCi.colType = si.colType;

                        if (si.calcFieldExp)
                        {
                            newCi.displayName = si.name;
                        }

                        /// during initialization, we set this "sortedKeysNeedsOrigValues" flag to true
                        /// so that we can update the values when the valueMap for this column has been loaded.
                        newCi.sortedKeys = si.sortedKeys;
                        newCi.sortedKeysNeedsOrigValues = (si.sortedKeys != null);
                    }
                }
            }

            this._editColInfos = newInfos;
        }

        closeDialog(keepChanges: boolean)
        {
            if (keepChanges)
            {
                this.onDataChanged("ok");
            }

            this.close();
        }

        buildListBoxItems()
        {
            var cbList = [];
            var editInfos = this._editColInfos;

            var listW = vp.select(this._listElem);
            var foundSelectedItem = false;
            var eiFirstAdded = null;

            listW.clear();

            for (var i = 0; i < editInfos.length; i++)
            {
                var ei = editInfos[i];

                //---- apply showOnly filter ----
                var add = (ei.isVisible || !this._showOnlyVisible);

                //---- apply search filter ----
                if (add && this._searchText)
                {
                    var name = ei.name.toLowerCase();
                    add = name.contains(this._searchText);
                }

                if (add)
                {
                    if (!eiFirstAdded)
                    {
                        eiFirstAdded = ei;
                    }

                    var itemW = listW.append("div")
                        .addClass("checkboxItem")
                        //.css("background", "black")
                        .attach("click", (e) =>
                        {
                            this.toggleItem(e);
                        })

                    var checkboxW = itemW.append("input")
                        .attr("type", "checkbox")
                        .addClass("panelCheckbox")

                    if (ei.isVisible)
                    {
                        checkboxW
                            .attr("checked", "true")
                    }

                    var promptW = itemW.append("span")
                        .addClass("checkboxText")
                        .text(ei.name)
                        .css("position", "relative")
                        .css("top", "-2px")

                    cbList.push(itemW[0]);

                    itemW[0].checkBox = checkboxW[0];
                    itemW[0].prompt = promptW[0];
                    itemW[0].editInfo = ei;
                    
                    if (ei == this._selectedEditItem)
                    {
                        this.markItemSelected(itemW[0], true);
                        this.loadColumnProps(ei);
                        this.loadColumnValues(ei);
                        foundSelectedItem = true;
                    }
                }
            }

            this._listItemElems = cbList;

            //--- make sure something is always selected ----
            if (!foundSelectedItem)
            {
                if (eiFirstAdded)
                {
                    this.selectItem(eiFirstAdded);
                }
                else
                {
                    this.loadColumnProps(null);
                    this.loadColumnValues(null);
                }
            }
        }

        toggleShowFilter(e)
        {
            var elem = e.target;
            var isCheckbox = (elem.tagName == "INPUT");

            if (!elem.checkBox)
            {
                //---- try parent ----
                elem = elem.parentNode;
            }

            //---- ignore event from checkbox ----
            if (!isCheckbox)
            {
                if (elem.checkBox)
                {
                    elem.checkBox.checked = (!elem.checkBox.checked);
                }

                vp.events.cancelEventBubble(e);
                vp.events.cancelEventDefault(e);
            }

            this._showOnlyVisible = elem.checkBox.checked;
            this.buildListBoxItems();
        }

        markItemSelected(itemElem: HTMLElement, isSelected: boolean)
        {
            //---- mark parent ----
            itemElem.setAttribute("data-isSelected", (isSelected) ? "true" : "false");

            //---- mark prompt ----
            (<any>itemElem).prompt.setAttribute("data-isSelected", (isSelected) ? "true" : "false");
        }

        /** find the HTML elem (div) that represents the specified ei. */
        getItemElem(ei: editColInfo)
        {
            var elem = null;

            for (var i = 0; i < this._listItemElems.length; i++)
            {
                var itemElem = this._listItemElems[i];

                if (itemElem.editInfo == ei)
                {
                    elem = itemElem;
                    break;
                }
            }

            return elem;
        }

        selectItem(editItem: editColInfo)
        {
            //---- turn off selection on current item ----
            if (this._selectedEditItem)
            {
                var item = this.getItemElem(this._selectedEditItem);
                if (item)
                {
                    this.markItemSelected(item, false);
                }
            }

            this._selectedEditItem = editItem;

            //---- turn on selection on new item ----
            if (editItem)
            {
                var item = this.getItemElem(editItem);
                this.markItemSelected(item, true);
            }

            this.loadColumnProps(editItem);
            this.loadColumnValues(editItem);
        }

        loadColumnProps(ei: editColInfo)
        {
            if (ei == null)
            {
                vp.select(this._displayElem).value("");
                this._typeCombo.value("string");
                vp.select(this._descElem).value("");
            }
            else
            {
                var colTypes = ["string", "number", "date"];

                vp.select(this._displayElem).value(ei.displayName);
                this._typeCombo.value(ei.colType);
                vp.select(this._descElem).value(ei.desc);
            }
        }

        loadColumnValues(ei: editColInfo, resetSelection = true)
        {
            var table = this._valuesTableElem;

            if (resetSelection)
            {
                this._selectedValueIndex = 0;
                this.onSelectedValueChanged();
            }

            //---- delete previous rows (except for header row) ----
            while (table.rows.length > 0)
            {
                table.deleteRow(table.rows.length - 1);
            }

            if (ei)
            {
                var valueMap = this._selectedEditItem.valueMap;
                if (valueMap)
                {
                    this.loadColumValuesFromValueMapInSortedKeysOrder(valueMap, table);
                }
                else
                {
                    //---- request valueMap from engine ----
                    beachPartyApp.appClass.instance._bpsHelper.getValueMap(ei.name, scrubberDialogClass.maxRows, (msgBlock) =>
                    {
                        var valueMap = <bps.ValueMapEntry[]> msgBlock.valueMap;

                        if (this._resetValueMapsWhenLoaded)
                        {
                            this.resetValueMap(valueMap);
                        }

                        this.loadColumValuesFromValueMapInSortedKeysOrder(valueMap, table);
                    });
                }
            }
        }

        /** "keys" should be in "originalValue" value set. */
        private sortValueMap(valueMap: bps.ValueMapEntry[], keys: string[])
        {
            var newMap = <bps.ValueMapEntry[]>[];

            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];

                for (var j = 0; j < valueMap.length; j++)
                {
                    var entry = valueMap[j];
                    if (entry.originalValue == key)
                    {
                        newMap.push(entry);
                        break;
                    }
                }
            }

            return newMap;
        }

        loadColumValuesFromValueMapInSortedKeysOrder(valueMap: bps.ValueMapEntry[], table)
        {
            var selectedItem = this._selectedEditItem;

            if (selectedItem.sortedKeysNeedsOrigValues)
            {
                //---- set "valueMap" to unsorted values (will sort in code below) ----
                selectedItem.valueMap = valueMap;

                //---- this means we need to load them from startingCol
                var sortedKeys = selectedItem.sortedKeys;

                for (var i = 0; i < sortedKeys.length; i++)
                {
                    var currKey = sortedKeys[i];
                    var origKey = this.getValueMapEntry(selectedItem, currKey, false);

                    if (origKey)
                    {
                        sortedKeys[i] = origKey.originalValue;
                    }

                }

                selectedItem.sortedKeysNeedsOrigValues = false;
            }

            //---- always re-sort the value map (in case sortedKeys has changed) ----
            if (selectedItem.sortedKeys)
            {
                //---- match order to sortedValues ----
                valueMap = this.sortValueMap(valueMap, selectedItem.sortedKeys); 
            }
            else
            {
                //---- build sortedKeys from valueMap ----
                selectedItem.sortedKeys = valueMap.map((e) => { return e.originalValue });
            }

            selectedItem.valueMap = valueMap;
            var maxRows = scrubberDialogClass.maxRows;

            var tableW = vp.select(table)
                    maxRows = Math.min(maxRows, valueMap.length);

            var valueRows = [];

            for (var i = 0; i < maxRows; i++)
            {
                var vme = valueMap[i];
                var trW = tableW.append("tr")
                    .addClass("listItem")
                    .attach("click", (e) => this.onValueRowClick(e))

                if (this._selectedValueIndex == i)
                {
                    trW.attr("data-selected", "true")
                }
                else
                {
                    trW.attr("data-selected", "false")
                }

                //---- add COLUMN VALUES ----
                trW.append("td")
                    .addClass("tableValue")
                    .text(vme.originalValue)
                    .css("text-align", "right")

                trW.append("td")
                    .addClass("tableValue")
                    .text("(" + vme.valueCount + ")")
                    .css("padding-left", "4px")
                    .css("padding-right", "4px")

                var newValueW = trW.append("td")
                    .addClass("tableValue")
                    .css("padding-left", "4px")
                    //.css("padding-right", "4px")

                var newValue = (vme.newValue) ? vme.newValue : vme.originalValue;

                var textboxW = newValueW.append("input")
                    .attr("type", "text")
                    .addClass("panelText")
                    .value(newValue)
                    .attach("focus", (e) =>
                    {
                        //---- select all text on focus ----
                        e.target.select();

                        //this.selectValue(e.target.valueIndex);
                    })
                    .attach("keyup", (e) =>
                    {
                        this.onValueEdited(e);
                    })

                textboxW[0].valueIndex = i;
                trW[0].valueIndex = i;

                valueRows.push(trW[0]);
            }

            this._valueRows = valueRows;
        }

        onValueRowClick(e)
        {
            var elem = e.target;

            while (elem && elem.valueIndex === undefined)
            {
                elem = elem.parentNode;
            }

            this.selectValue(elem.valueIndex);
        }

        selectValue(index: number)
        {
            if (this._selectedValueIndex != -1)
            {
                vp.select(this._valueRows[this._selectedValueIndex])
                    .attr("data-selected", "false")
            }

            this._selectedValueIndex = index;

            if (index > -1)
            {
                vp.select(this._valueRows[index])
                    .attr("data-selected", "true")
            }

            this.onSelectedValueChanged();
        }

        onValueEdited(e)
        {
            var valueMap = this._selectedEditItem.valueMap;
            if (valueMap)
            {
                var valueIndex = e.target.valueIndex;
                var entry = valueMap[valueIndex];
                if (entry)
                {
                    entry.newValue = e.target.value;
                }
            }
        }

        toggleItem(e)
        {
            var elem = e.target;
            var isCheckbox = (elem.tagName == "INPUT");

            if (!elem.checkBox)
            {
                //---- try parent ----
                elem = elem.parentNode;
            }

            this.selectItem(elem.editInfo);

            var isVisible = elem.checkBox.checked;
            elem.editInfo.isVisible = isVisible;
        }

        getEditInfos()
        {
            this.updatedAllSortedKeysToNewValues();

            return this._editColInfos;
        }

        updatedAllSortedKeysToNewValues()
        {
            for (var i = 0; i < this._editColInfos.length; i++)
            {
                var ei = this._editColInfos[i];
                this.updateColSortedKeysToNewValues(ei);
            }
        }

        updateColSortedKeysToNewValues(ei: editColInfo)
        {
            if (ei.sortedKeys)
            {
                for (var i = 0; i < ei.sortedKeys.length; i++)
                {
                    var mapEntry = this.getValueMapEntry(ei, ei.sortedKeys[i]);
                    if (mapEntry && mapEntry.newValue)
                    {
                        ei.sortedKeys[i] = mapEntry.newValue;
                    }
                }
            }
        }

        getValueMapEntry(ei: editColInfo, value: string, matchOrig = true)
        {
            var mapEntry = <bps.ValueMapEntry>null;

            if (ei.valueMap)
            {
                for (var i = 0; i < ei.valueMap.length; i++)
                {
                    var entry = ei.valueMap[i];
                    var matchValue = (matchOrig || entry.newValue === undefined) ? entry.originalValue : entry.newValue;

                    if (matchValue == value)
                    {
                        mapEntry = ei.valueMap[i];
                        break;
                    }
                }
            }

            return mapEntry;
        }
    }

    /** these fields represent the column properties and values that can be changed in this dialog. */
    export class editColInfo extends bps.ColInfo
    {
        isVisible: boolean;
        displayName: string;
        origCol: bps.ColInfo;
        valueMap: bps.ValueMapEntry[];
        sortedKeysNeedsOrigValues: boolean;

        constructor(name: string, desc: string, colType: string, sortedKeys: string[], min: number, max: number)
        {
            super(name, desc, colType, sortedKeys, min, max);

            this.isVisible = true;
            this.displayName = name;
            this.valueMap = null;
            this.sortedKeysNeedsOrigValues = false;
        }
    }
}