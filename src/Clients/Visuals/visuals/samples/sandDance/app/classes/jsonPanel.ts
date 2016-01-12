//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    jsonPanel.ts - panel that is built from a JSON description
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    var nextId = 1;

    export class JsonPanelClass extends BasePanelClass
    {
        _groupDataName: string;         // for groups of radio buttons
        _lastRowW = null;
        _controlsById: any = {};
        _primaryControl: IAppControl = null;           // if set, pass focus to this control
        _isCol1Indent = true;           // by default,  use indent instead of another TD
        _rowSpacing = null;
        _controls = [];
        _lastTdW = null;
        _acceptDataName = null;         // data name from the ACCEPT BUTTON

        //---- tab stuff ----
        _currentTabContentElem: HTMLElement;
        _currentTabButtonElem: HTMLElement;

        constructor(openerIds: string, dataOwner: beachParty.DataChangerClass, name: string, json: any, bgColor?: string,
            isCol1Indent = true, hideClose = false, addAutoClose = false, addNormalClose?: boolean)
        {
            super(name, json.isDialog, bgColor, json.title, json.width, json.height, json.resizable, json.tip, hideClose, addAutoClose,
                addNormalClose);

            this._dataOwner = dataOwner;
            this._isCol1Indent = isCol1Indent;
            this._openerIds = openerIds;

            this._rowSpacing = json.rowSpacing;
            this._isDialog = json.isDialog;

            var rootW = vp.select(this._root);

            if (json.minHeight)
            {
                rootW.css("min-height", json.minHeight + "px");
            }

            if (json.minWidth)
            {
                rootW.css("min-width", json.minWidth + "px");
            }

            //---- create CONTENT ----
            if (json.tabs)
            {
                this.buildTabs(rootW, json.tabs, json.rightAlignTabs);
            }
            else if (json.rows)
            {
                //---- rows at top level (no tabs) ----
                this.createTabContent(rootW, null, json.rows);
            }

            this.setFocusToFirstControl();
        }

        setFocusToFirstControl()
        {
            var lowElem = null;

            for (var i = 0; i < this._controls.length; i++)
            {
                var control = this._controls[i];

                lowElem = control;
                break;
            }

            if (lowElem)
            {
                lowElem.focus();
            }
        }

        buildTabs(parentW: vp.dom.IWrapperOuter, tabs: any, rightAlignTabs: boolean)
        {
            var firstTabButton = null;

            //---- create container for tab buttons ----
            var tabButtonContainerW = parentW.append("div");

            tabButtonContainerW
                .addClass("tabButtonContainer");

            for (var i = 0; i < tabs.length; i++)
            {
                var tab = tabs[i];

                //---- add tab button ----
                var id = "tab" + i;

                var tabButtonW = tabButtonContainerW.append("span")
                    .addClass("tabButton")
                    .id(id)
                    .text(tab.tabName)
                    .title(tab.tip);

                tabButtonW
                    .attach("click", (e) =>
                    {
                        this.onTabSelected(e.target);
                    });

                //---- add tab content ----
                var contentId = id + "Content";

                this.createTabContent(parentW, contentId, tab.rows);

                if (i === 0)
                {
                    firstTabButton = tabButtonW[0];
                }
            }

            //---- make the first tab active ----
            this.onTabSelected(firstTabButton);
        }

        onTabSelected(tabButton: HTMLElement)
        {
            //---- hide current tab content ----
            if (this._currentTabContentElem)
            {
                vp.select(this._currentTabContentElem)
                    .css("display", "none");

                vp.select(this._currentTabButtonElem)
                    .removeClass("tabButtonOpen");

                this._currentTabContentElem = null;
                this._currentTabButtonElem = null;
            }

            //---- make new tab content visible ----
            var buttonId = tabButton.id;
            var contentId = buttonId + "Content";

            var tabContentW = vp.select("#" + contentId);

            if (tabContentW.length)
            {
                tabContentW
                    .css("display", "");         // makes it default to visible;

                var tabButtonW = vp.select("#" + buttonId)
                    .addClass("tabButtonOpen");

                this._currentTabContentElem = tabContentW[0];
                this._currentTabButtonElem = tabButtonW[0];
            }
        }

        addRow(tableW: any)
        {
            var rowW = tableW.append("tr")
                .addClass("panelRow");

            if (this._rowSpacing)
            {
                //---- always add a spacer row, to allow us to control space between rows -----
                tableW.append("tr")
                    .addClass("panelRowSpacer")
                    .css("height", this._rowSpacing);
            }

            return rowW;
        }

        startNewTable(parentW, rowSpanPos?: string)
        {
            var rowSpanTdW: vp.dom.IWrapperOuter = null;

            if (rowSpanPos)
            {
                //---- create "outer" table under parentW (to hold rowSpan content and normal innerTable) ----
                var outerTableW = parentW.append("table")
                    .css("position", "relative");

                var outerRowW = this.addRow(outerTableW);

                if (rowSpanPos === "left")
                {
                    rowSpanTdW = outerRowW.append("td")
                        .css("vertical-align", "top")
                        .id("rowSpanHolder");
                        //.attr("rowSpan", "99")
                }

                var tdMiddle = outerRowW.append("td")
                    .css("vertical-align", "top");

                var normalTableW = tdMiddle
                    .append("table")
                    .css("vertical-align", "top")
                    .css("position", "relative");

                if (rowSpanPos === "right")
                {
                    rowSpanTdW = outerRowW.append("td")
                        .css("vertical-align", "top")
                        .id("rowSpanHolder");
                        //.attr("rowSpan", "99")
                }

                if (rowSpanTdW)
                {
                    //---- add table/row ----
                    var tabW = rowSpanTdW = rowSpanTdW.append("table")
                        .css("position", "relative");

                    rowSpanTdW = this.addRow(tabW);
                }

            }
            else
            {
                var normalTableW = parentW.append("table")
                    .css("position", "relative");
            }

            return { normalTableW: normalTableW, rowSpanTdW: rowSpanTdW };
        }

        createTabContent(parentW: vp.dom.IWrapperOuter, id: string, rows: any)
        {
            var result = this.startNewTable(parentW);

            var tableW = result.normalTableW
                .addClass("panelContent");

            tableW.element()
                .addEventListener("mousedown", (e) => this.onFocus(e));

            if (id)
            {
                tableW
                    .css("display", "none")
                    .id(id);
            }

            for (var i = 0; i < rows.length; i++)
            {
                var row = rows[i];
                tableW = this.buildRow(parentW, tableW, row);
            }

            return tableW;
        }

        getDataOwner(memberName: string)
        {
            var thisObj = this._dataOwner;
            if (!thisObj[memberName])
            {
                //---- if member not found in dataOwner, fallback to appClass ----
                thisObj = AppClass.instance;
            }

            return thisObj;
        }

        callMethod(methodName: string, ...params: any[])
        {
            if (methodName)
            {
                var thisObj = this.getDataOwner(methodName);
                var func = thisObj[methodName];

                var returnValue = func.apply(thisObj, params);
                return returnValue;
            }

            return undefined;
        }

        getControlById(id: string)
        {
            return this._controlsById[id];
        }

        getValue(propName: string)
        {
            //---- call property getter on dataOwner obj ----
            var thisObj = this.getDataOwner(propName);

            var value = thisObj[propName]();
            return value;
        }

        setValue(propName: string, value: any)
        {
            //---- call property setter on dataOwner obj ----
            var thisObj = this.getDataOwner(propName);

            thisObj[propName](value);
        }

        /** we return 'tableW', in case we created a new table that caller should continue using. */
        buildRow(parentW: vp.dom.IWrapperOuter, tableW: vp.dom.IWrapperOuter, row: any)
        {
            var rowW = null;
            var startNewRow = ((row.sameCell !== true) && (!row.col) || (row.col === 1));
            var control = null;

            //if (this._startNewRowPending)
            //{
            //    startNewRow = true;
            //    this._startNewRowPending = false;
            //}

            if (row.rowSpan)
            {
                rowW = this.addRow(tableW);
                var tdW = rowW.append("td");

                //var result = this.startNewTable(parentW, row.rowSpan);
                var result = this.startNewTable(tdW, row.rowSpan);

                rowW = result.rowSpanTdW;
                tableW = result.normalTableW;
            }
            else if (row.separator)
            {
                parentW.append("div")
                    .addClass("panelSeparator");

                var result = this.startNewTable(parentW);

                tableW = result.normalTableW
                    .addClass("panelContent");

                rowW = this.addRow(tableW);

            }
            else if (startNewRow)
            {
                rowW = this.addRow(tableW);
            }
            else
            {
                rowW = this._lastRowW;
            }

            //rowW    
            //    .css("position", "relative")

            var tdW = (row.sameCell) ? this._lastTdW : rowW.append("td");
            this._lastTdW = tdW;

            if (row.fillClient)
            {
                tdW
                    .attr("rowSpan", "999")
                    .attr("colSpan", "999");
            }

            if (row.col)
            {
                //---- skip to next column ----
                //tdW = rowW.append("td")
                //    .css("position", "relative")
                //    .css("left", "-55px")

                if (row.col === 1)
                {
                    if (this._isCol1Indent)
                    {
                        tdW.css("padding-left", "30px");
                    }
                    else
                    {
                        tdW = rowW.append("td");
                            //.css("position", "relative")
                            //.css("left", "-55px")
                    }
                }

            }

            if (row.emptyRow)
            {
                tdW.append("div")
                    .addClass("emptyRow");

                tdW
                    .attr("colSpan", "99");
            }
            else if (row.prompt)
            {
                //---- create PROMPT ----
                this.createLabel(tdW, row.prompt, row.tip, row.isHtml);

                this._groupDataName = row.dataName;
            }
            else if (row.image !== undefined)
            {
                this.createImage(row.image, tdW, row);
            }
            else if (row.button !== undefined)
            {
                this.createButton(row.button, tdW, row);
            }
            else if (row.text !== undefined)
            {
                this.createText(row.text, rowW, tdW, row);
                this._groupDataName = row.dataName;
            }
            else if (row.textArea !== undefined)
            {
                this.createTextArea(row.textArea, rowW, tdW, row);
                this._groupDataName = row.dataName;
            }
            else if (row.checkbox !== undefined)
            {
                this.createCheckbox(tdW, row);
            }
            else if (row.radio !== undefined)
            {
                this.createRadioButton(tdW, row);
            }
            else if (row.numAdjuster !== undefined)
            {
                this.createNumAdjuster(row.numAdjuster, rowW, tdW, row);
            }
            else if (row.colPicker !== undefined)
            {
                this.createPicker(row.colPicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showColPicker(row.dataName, ddText, chevronW, e);
                });
            }
            else if (row.colPickerList !== undefined)
            {
                this.createColPickerList(row.colPickerList, rowW, tdW, row);
            }
            else if (row.colorPicker !== undefined)
            {
                this.createPicker(row.colorPicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showColorPicker(row.includeTransparent, dataName, ddText, chevronW, e);
                });
            }
            else if (row.knownDataPickerList !== undefined)
            {
                this.createKnownDataPickerList(row.knownDataPickerList, rowW, tdW, row);
            }
            else if (row.knownDataPicker !== undefined)
            {
                this.createPicker(row.knownDataPicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showDataPicker(dataName, ddText, chevronW, e);
                });
            }
            else if (row.enumPicker !== undefined)
            {
                this.createPicker(row.enumPicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showEnumPicker(dataName, ddText, chevronW, row.enumType, e);
                });
            }
            else if (row.scrubberPicker !== undefined)
            {
                this.createPicker(row.enumPicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showScrubberPicker(dataName, ddText, chevronW, row.enumType, e);
                });
            }
            else if (row.shapePicker !== undefined)
            {
                this.createPicker(row.shapePicker, rowW, tdW, row, (dataName, ddText, chevronW, e) =>
                {
                    this.showShapePicker(dataName, ddText, chevronW, e);
                });
            }
            else if (row.customList !== undefined)
            {
                this.createCustomList(row.customList, rowW, tdW, row);
            }
            else if (row.control)
            {
                var parts = row.control.split(".");
                var controlCreateFunc = <any>window;
                for (var p = 0; p < parts.length; p++)
                {
                    var part = parts[p];
                    controlCreateFunc = controlCreateFunc[part];
                }

                control = controlCreateFunc(this);
                var dataName = row.dataName;
                var thisObj = this.getDataOwner(dataName);

                if (control.dataParent)
                {
                    control.dataParent(thisObj);
                }

                var rootElem = control.getRootElem();

                tdW.append(rootElem);

                //---- set initial data ----
                var value = this.getValue(dataName);
                control[dataName](value);

                //---- route data from owner to control ----
                thisObj.registerForRemovableChange(dataName, this, (e) =>
                {
                    var value = this.getValue(dataName);
                    control[dataName](value);
                });
            }

            if (row.id)
            {
                this._controlsById[row.id] = control;
                this._primaryControl = control;
            }

            this._lastRowW = rowW;

            //if (row.rowSpan)
            //{
            //    this._startNewRowPending = true;
            //}

            return tableW;
        }

        createCustomList(prompt: string, rowW: vp.dom.IWrapperOuter, tdW: vp.dom.IWrapperOuter, row: any)
        {
            //var value = this.getValue(row.dataName);

            this.createLabel(tdW, prompt, row.tip);

            if (row.showValue)
            {
                var value = this.getValue(row.dataName);

                var textW = tdW.append("span")
                    .addClass("panelValue")
                    .text(value);

                var thisObj = this.getDataOwner(row.dataName);
                thisObj.registerForRemovableChange(row.dataName, this, (e) =>
                {
                    value = <string>this.getValue(row.dataName);
                    textW.text(value);
                });
            }

            //---- create a vertically-scrolling list ----
            var listW = tdW.append("div")
                // .css("overflow-y", "hidden")
                .css("overflow-x", "hidden")
                .addClass("customList")
                .addClass("colorList")
                .css("vertical-align", "top");
                //.css("background", "yellow")

            var height = row.height;
            if (height !== undefined)
            {
                listW.css("height", height);
            }

            if (row.width !== undefined)
            {
                listW.css("width", row.width + "px");
            }

            if (row.colSpan !== undefined)
            {
                tdW.attr("colspan", row.colSpan);
            }

            if (row.refreshEvent)
            {
                var thisObj = this.getDataOwner(row.dataName);
                thisObj.registerForRemovableChange(row.refreshEvent, this, (e) =>
                {
                    this.rebuildCustomList(listW, row);
                });
            }

            this.rebuildCustomList(listW, row);
        }

        rebuildCustomList(listW, row)
        {
            listW
                .clear();

            var itemGetter = row.itemGetter;

            for (var i = 0; i < 999; i++)
            {
                //---- add each item ----
                var thisObj = this.getDataOwner(itemGetter);
                var itemElem = thisObj[itemGetter](i);
                if (!itemElem)
                {
                    break;
                }

                itemElem._index = i;

                listW.append(itemElem)
                    .attach("click", (e) => 
                    {
                        var elem = e.target;
                        while (elem.parentElement && (elem._index === undefined || elem._index === null))
                        {
                            elem = elem.parentElement;
                        }

                        var value = (elem._value !== undefined) ? elem._value : elem._index;

                        this.setValue(row.dataName, value);
                    });
            }
        }

        createButton(prompt: string, tdW: vp.dom.IWrapperOuter, row: any)
        {
            //---- create BUTTON ----
            var buttonW = tdW.append("span")
                .addClass("panelButton")
                .text(row.button)
                .title(row.tip)
                .attr("tabIndex", "0");

            //---- store on-click properties on each instance ----
            buttonW[0].dataName = row.dataName;
            buttonW[0].acceptButton = row.acceptButton;
            buttonW[0].cancelButton = row.cancelButton;

            if (row.acceptButton)
            {
                this._acceptDataName = row.dataName;
            }

            if (row.leftMargin !== undefined)
            {
                buttonW.css("margin-left", row.leftMargin + "px");
            }

            buttonW.attach("click", (e) =>
            {
                this.onClickButton(e);

                this.onUserAction();
            });

            buttonW.attach("keydown", (e) =>
            {
                if (e.keyCode === vp.events.keyCodes.enter)
                {
                    this.onClickButton(e);
                }
            });

            this.applyCommonProperties(buttonW, tdW, row);
        }

        createImage(src: string, tdW: vp.dom.IWrapperOuter, row: any)
        {
            //---- create IMG ----
            var imgW = tdW.append("div")
                .addClass("panelImage")
                .text(src)
                // .attr("src", src)
                .title(row.tip);

            this.applyCommonProperties(imgW, tdW, row);
        }

        onEnterKey()
        {
            //---- simulate a button press on the ACCEPT BUTTON ----
            if (this._acceptDataName)
            {
                this.callMethod(this._acceptDataName);
            }

            super.onEnterKey();
        }

        onClickButton(e)
        {
            var elem = e.target;

            if (elem.acceptButton)
            {
                this.onEnterKey();
            }
            else
            {
                if (elem.dataName)
                {
                    this.callMethod(elem.dataName);
                }
            }

            if (elem.cancelButton)
            {
                this.onEscapeKey();
            }
        }

        applyCommonProperties(elemW: any, tdW: any, row: any, addAsControl = true)
        {
            if (addAsControl)
            {
                this._controls.push(elemW[0]);
            }

            if (row.textAlign)
            {
                //---- set on PARENT ----
                tdW.css("textAlign", row.textAlign);
            }

            if (row.readOnly)
            {
                elemW.attr("readonly", "true");
            }

            if (row.width)
            {
                elemW.css("width", row.width);
            }

            if (row.height)
            {
                elemW.css("height", row.height);
            }

            if (row.tabIndex)
            {
                elemW.attr("tabIndex", row.tabIndex);
            }

            if (row.marginLeft)
            {
                elemW.css("margin-left", row.marginLeft);
            }

            if (row.marginRight)
            {
                elemW.css("margin-right", row.marginRight);
            }

            if (row.marginTop)
            {
                elemW.css("margin-top", row.marginTop);
            }

            if (row.marginBottom)
            {
                elemW.css("margin-bottom", row.marginBottom);
            }

            if (vp.utils.isString(row.disabled))
            {
                var thisObj = this.getDataOwner(row.disabled);
                thisObj.registerForChange(row.disabled, (e) =>
                {
                    var value = this.getValue(row.disabled);

                    //---- not sure if this is form control, so disable using both methods ----
                    elemW.attr("data-disabled", value);

                    if (value)
                    {
                        elemW.attr("disabled", "true");
                    }
                    else
                    {
                        elemW[0].removeAttribute("disabled");
                    }
                });
            }
        }

        createText(prompt: string, rowW: vp.dom.IWrapperOuter, tdW: vp.dom.IWrapperOuter, row: any)
        {
            var value = <string>this.getValue(row.dataName);

            if (value && row.capitalize)
            {
                value = value.capitalize();
            }

            if (prompt && prompt !== "")
            {
                this.createLabel(tdW, prompt, row.tip);

                //---- add in next column ----
                tdW = rowW.append("td");
            }

            //---- create TEXT ----
            var textW = tdW.append("input")
                .addClass("panelText")
                .attr("type", "text")
                .value(value)
                .title(row.tip)
                .attach("focus", (e) =>
                {
                    //---- select all text on focus ----
                    e.target.select();
                })
                .attach("blur", (e) =>
                {
                    var newValue = vp.dom.value(e.target);
                    this.callMethod(row.dataName, newValue);
                });

            if (row.leftMargin !== undefined)
            {
                textW.css("margin-left", row.leftMargin + "px");
            }

            this.applyCommonProperties(textW, tdW, row);

            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (e) =>
            {
                value = <string>this.getValue(row.dataName);

                if (value && row.capitalize)
                {
                    value = value.capitalize();
                }

                textW.value(value);
            });

        }

        createLabel(tdW: vp.dom.IWrapperOuter, prompt: string, tip: string, isHtml?: boolean)
        {
            //---- create label ----
            var spanW = tdW.append("span")
                .addClass("panelPrompt")
                .title(tip);

            if (isHtml)
            {
                spanW.html(prompt);
            }
            else
            {
                spanW.text(prompt);
            }

            //---- make this cell top-aligned ----
            tdW
                .css("vertical-align", "top");
        }

        createTextArea(prompt: string, rowW: vp.dom.IWrapperOuter, tdW: vp.dom.IWrapperOuter, row: any)
        {
            var value = <string>this.getValue(row.dataName);

            if (prompt)
            {
                this.createLabel(tdW, prompt, row.tip);
            }

            //---- add in next column ----
            //tdW = rowW.append("td");

            //---- create TEXTAREA ----
            var textW = tdW.append("textarea")
                .addClass("panelTextArea")
                .value(value)
                .title(row.tip)
                .attr("placeholder", row.placeholder)
                .attach("focus", (e) =>
                {
                    //---- select all text on focus ----
                    e.target.select();
                })
                .attach("input", (e) =>
                {
                    var newValue = vp.dom.value(e.target);
                    this.callMethod(row.dataName, newValue);
                });

            this.applyCommonProperties(textW, tdW, row);

            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (e) =>
            {
                value = <string>this.getValue(row.dataName);

                textW.value(value);
            });

        }

        createNumAdjuster(prompt: string, rowW: vp.dom.IWrapperOuter, tdW: vp.dom.IWrapperOuter, row: any)
        {
            tdW.append("span")
                .addClass("panelPrompt")
                .text(prompt)
                .title(row.tip);

            var parentId = "numAdjuster" + nextId++;

            // ----create span to hold numAdjuster (in next column) ----
            var tdW2 = null;

            if (row.newCol)
            {
                //---- add num adjuster in a new table <td> ----
                tdW2 = rowW.append("td")
                    .css("position", "relative")
                    .css("left", "-12px");       // make it align correctly with other controls starting in new column;
            }
            else
            {
                tdW2 = tdW;
            }

            tdW2.append("span")
                .id(parentId)
                .css("margin-top", "-10px")
                .css("margin-bottom", "8px")
                .css("margin-left", "10px")
                .css("position", "relative")
                .css("top", "8px");

            var initValue = this.getValue(row.dataName);

            var numAdjuster = new NumAdjusterClass(parentId, "", initValue, row.min, row.max, row.tip,
                AdjusterStyle.bottomInPanel, row.roundValues, row.syncChanges, row.spreadLow);

            numAdjuster.show(true);

            //---- route events FROM DATAOWNER to numAdjuster ----
            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (name, dataChanger) =>
            {
                if (dataChanger._className !== "numAdjusterClass")       //  (dataChanger != numAdjuster)
                {
                    var value = this.getValue(row.dataName);
                    numAdjuster.value(value);
                }
            });

            //---- route events FROM NUMADJUSTER to dataOwner ----
            numAdjuster.registerForRemovableChange("value", this, (e) =>
            {
                var value = numAdjuster.value();
                //this.setValue(row.dataName, value);

                var thisObj = this.getDataOwner(row.dataName);
                thisObj.setDataWithChanger(row.dataName, value, numAdjuster);

                this.onUserAction();
            });
        }

        showColorPicker(includeTransparent: boolean, propName, ddText, chevronW, e)
        {
            var picker = this.callPanelCreator("createColorPicker", includeTransparent, (mid) =>
            {
                var value = (mid.text) ? mid.text : mid;

                ddText.text(value);
                this.setValue(propName, value);

                this.onUserAction();
            }, this._root, chevronW);

            this.openPicker(picker, chevronW);
        }

        showDataPicker(propName, ddText, chevronW, e)
        {
            var picker = this.callPanelCreator("createDataPicker", (mid) =>
            {
                var value = (mid.text) ? mid.text : mid;

                ddText.text(value);
                this.setValue(propName, value);

                //this.onUserAction();
                this.close();
            });

            this.openPicker(picker, chevronW);
        }

        showEnumPicker(propName, textW: vp.dom.singleWrapperClass, chevronW, enumType, e)
        {
            var picker = this.callPanelCreator("createEnumPicker", enumType, (mid) =>
            {
                var value = <string>(mid.text) ? mid.text : mid;

                //---- user select "value" from enum dropdown ----
                textW.text(value);

                //---- sometimes we upperCase first letter for UI, but we start all BeachParty enum values with lower case ----
                var lcValue = AppUtils.lowerCaseFirstLetter(value);

                this.setValue(propName, lcValue);

                this.onUserAction();
            }, this._root, chevronW);

            this.openPicker(picker, chevronW);
        }

        showScrubberPicker(propName, textW: vp.dom.singleWrapperClass, chevronW, enumType, e)
        {
            var picker = this.callPanelCreator("createScrubberPicker",  (mid) =>
            {
                var value = <string>(mid.text) ? mid.text : mid;

                //---- user select "value" from enum dropdown ----
                textW.text(value);

                this.setValue(propName, value);

                this.onUserAction();
            }, this._root);

            this.openPicker(picker, chevronW);
        }

        showShapePicker(propName, ddText, chevronW, e)
        {
            var picker = this.callPanelCreator("createShapePicker", (text) =>
            {
                ddText.text(text);
                this.setValue(propName, text);

                this.onUserAction();
            }, this._root, chevronW);

            this.openPicker(picker, chevronW);
        }

        createPicker(prompt: string, rowW: vp.dom.IWrapperOuter, tdW: vp.dom.IWrapperOuter, row: any, onOpenCallback)
        {
            var value = this.getValue(row.dataName);

            if (prompt)
            {
                // ----create prompt for dropdown ----
                tdW.append("span")
                    .addClass("panelPrompt")
                    .title(row.tip)
                    .text(prompt)
                    .css("vertical-align", "right")
                    .css("margin-right", "4px");

                if (!row.sameCol)
                {
                    tdW = rowW.append("td");
                }
            }

            var buttonContainer = tdW
                .append("div")
                .addClass("buttonContainer");

            //---- create DROPDOWN BUTTON to hold text and chevron ----
            var ddButton = buttonContainer.append("span")
                .addClass("panelButton")
                .title(row.tip)
                .css("cursor", "pointer")
                .css("white-space", "nowrap");

            // ----create TEXT part of button ----
            var ddText = ddButton.append("span")
                .addClass("panelButtonText")
                .css("vertical-align", "middle")
                .css("text-align", "left");

            if (row.width !== undefined)
            {
                ddText
                    .css("display", "inline-block")
                    .width(row.width);
            }

            //---- to workaround issue of mouse "dead zones" around img, try embedding it inside a in-line block span ----
            var divW = ddButton.append("span")
                .addClass("panelButtonChevron")
                .css("display", "inline-block")
                .css("cursor", "pointer");

            //---- add dropdown CHEVRON icon ----
            divW.append("div")
                // .attr("src", "Images/smallChevron3.png")
                .addClass("chevron-background")
                .css("margin-left", "4px")
                .css("margin-bottom", "2px")
                .css("vertical-align", "bottom")
                .element()
                .addEventListener("dragstart", function (e)
                {
                    //---- prevent drag of icon ----
                    e.preventDefault();
                });

            ddButton.element()
                .addEventListener("click", (e) =>
                {
                    onOpenCallback(row.dataName, ddText, /*chevronW*/buttonContainer, e);//rowW
                });

            //---- set initial value ----
            var value = this.getValue(row.dataName);
            if (row.enumPicker !== undefined)
            {
                //---- change all enum values to start with a capital letter ----
                value = AppUtils.capitalizeFirstLetter(value);
            }
            ddText.text(value);

            //---- listen to associated property changes & update HTML ----
            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (e) =>
            {
                var value = this.getValue(row.dataName);
                if (row.enumPicker !== undefined)
                {
                //---- change all enum values to start with a capital letter ----
                    value = AppUtils.capitalizeFirstLetter(value);
                }
                ddText.text(value);

            });
        }

        showColPicker(propName, ddTextW, chevronW, e)
        {
            var picker = this.callPanelCreator("createColumnPicker", null, true, (mid) =>
            {
                ddTextW.text(mid.text);
                this.setValue(propName, mid.text);
            });

            this.openPicker(picker, chevronW);
        }

        createKnownDataPickerList(propName, rowW, tdW, row: any)
        {
            var listBox = this.callPanelCreator("createKnownDataPickerList", tdW[0], true, (mid) =>
            {
                //ddTextW.text(mid.text)
                this.setValue(row.dataName, mid.text);

                this.onUserAction();
            });

            if (row.width !== undefined)
            {
                vp.select(listBox._root).css("width", row.width + "px");
            }

            if (row.height !== undefined)
            {
                vp.select(listBox._root).css("height", row.height + "px");
            }

            return listBox;
        }

        createColPickerList(prompt: string, rowW, tdW, row: any)
        {
            if (prompt)
            {
                // ----create prompt for dropdown ----
                tdW.append("span")
                    .addClass("panelPrompt")
                    .title(row.tip)
                    .text(prompt)
                    .css("vertical-align", "right")
                    .css("margin-right", "4px");

                if (!row.sameCol)
                {
                    //---- for column picker list, we start a new line ----
                    tdW = rowW.append("td");
                    tdW.append("br");
                }
            }

            var listBox = this.callPanelCreator("createColumnPickerList", tdW[0], row.includeNone, (mid) =>
            {
                //ddTextW.text(mid.text)
                this.setValue(row.dataName, mid.text);

                this.onUserAction();
            });

            //if (row.width != undefined)
            //{
            //    vp.select(listBox._root).css("width", row.width + "px")
            //}

            //if (row.height != undefined)
            //{
            //    vp.select(listBox._root).css("height", row.height + "px")
            //}

            var listBoxW = vp.select(listBox._root);
            this.applyCommonProperties(listBoxW, tdW, row, false);

            return listBox;
        }

        callPanelCreator(creatorMethod: string, p1, p2?, p3?, p4?, p5?)
        {
            return AppClass.instance[creatorMethod](p1, p2, p3, p4, p5);
        }

        openPicker(picker: beachPartyApp.PopupMenuClass, chevronW)
        {
            if (picker)
            {
                this.openWithoutPosition();

//                 var rcChevron = chevronW.getBounds(true),
//                     buttonBounds = vp.select(chevronW, ".panelButton").getBounds(true);
// 
//                 //---- ENUM PICKERS seem to need this adjustment - does this break anything else? ----
//                 picker.openWithoutOverlap(rcChevron.width - buttonBounds.width, rcChevron.bottom, false);
            }
        }

        createCheckbox(tdW: vp.dom.IWrapperOuter, row: any)
        {
            var cbName = "checkbox" + nextId++;

            tdW
                .attr("colSpan", "2");

            //---- create CHECKBOX ----
            var cbW = tdW.append("input")
                .addClass("panelCheckbox")
                .attr("type", "checkbox")
                .attr("id", cbName)
                .title(row.tip)
                .attach("dblclick", (e) =>
                {
                    e.preventDefault();
                    cbW[0].click();
                });

            var lab = tdW.append("label")
                .addClass("panelPrompt")
                .attr("for", cbName)            // relays click to element with id=cbName
                .text(row.checkbox)
                .css("position", "relative")
                .css("top", "-3px")
                .title(row.tip)
                .attach("dblclick", (e) =>
                {
                    e.preventDefault();
                    lab[0].click();

                    this.onUserAction();
                });

            cbW.attach("click", (e) =>
            {
                var value = cbW[0].checked;
                this.setValue(row.dataName, value);

                this.onUserAction();
            });

            var value = this.getValue(row.dataName);
            if (value)
            {
                cbW[0].checked = true;
            }

            //---- list to associated property changes & update HTML ----
            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (e) =>
            {
                var value = this.getValue(row.dataName);

                if (value)
                {
                    cbW[0].checked = true;
                }
                else
                {
                    cbW[0].checked = false;
                }

            });

            this.applyCommonProperties(cbW, tdW, row);

        }

        createRadioButton(tdW: vp.dom.IWrapperOuter, row: any)
        {
            var rbName = "radio" + nextId++;
            if (!row.dataName)
            {
                row.dataName = this._groupDataName;
            }

            var isUserAction = (row.userAction === null || row.userAction === undefined || row.userAction === true);

            //---- create RADIOBUTTON ----
            var cb = tdW.append("input")
                .addClass("panelRadio")
                .attr("type", "radio")
                .attr("id", rbName)
                .attr("name", row.dataName)         // for grouping radio buttons together
                .title(row.tip)
                .attach("dblclick", (e) =>
                {
                    e.preventDefault();
                    cb[0].click();
                });

            if (row.leftMargin !== undefined)
            {
                cb.css("margin-left", row.leftMargin + "px");
            }

            var lab = tdW.append("label")
                .addClass("panelPrompt")
                .attr("for", rbName)            // relays click to element with id=cbName
                .text(row.radio)
                .css("position", "relative")
                .css("top", "-3px")
                .title(row.tip)
                .attach("dblclick", (e) =>
                {
                    e.preventDefault();
                    lab[0].click();

                    if (isUserAction)
                    {
                        this.onUserAction();
                    }
                });

            //---- on CLICK, update OWNER property ----
            cb.attach("click", (e) =>
            {
                var value = cb[0].checked;
                if (value)
                {
                    this.setValue(row.dataName, row.value);

                    if (isUserAction)
                    {
                        this.onUserAction();
                    }
                }
            });

            //---- set INITIAL VALUE in element ----
            this.updateRadio(row.dataName, row.value, cb[0]);

            //---- list to associated property changes & update HTML ----
            var thisObj = this.getDataOwner(row.dataName);
            thisObj.registerForRemovableChange(row.dataName, this, (e) =>
            {
                this.updateRadio(row.dataName, row.value, cb[0]);
            });
        }

        updateRadio(dataName: string, myValue: any, rbElem: HTMLInputElement)
        {
            var value = this.getValue(dataName);
            if (value === myValue)
            {
                rbElem.checked = true;
            }
        }

    }

    export function buildJsonPanel(openerIds: string, dataOwner: beachParty.DataChangerClass, panelName: string, openPanel: boolean, left?: number,
        top?: number, right?: number, bottom?: number, toggleOpen = true, isCol1Indent = true, hideClose = false,
        addAutoClose = false, addNormalClose?: boolean, isCenter?: boolean): JsonPanelClass
    {
        var panel: JsonPanelClass = null;

        //var w = <any>window;//TODO: window?

        var desc = sandDance.panels[panelName];

        // var desc = w.panelDescriptions[panelName];

        panel = new JsonPanelClass(openerIds, dataOwner, panelName, desc, undefined, isCol1Indent, hideClose, addAutoClose, addNormalClose);

        var rc = vp.dom.getBounds(panel.getRootElem(), true);

        if ((left === undefined || left === null) && (right === undefined || right === null))
        {
            //---- center horizontally ----
            left = vp.select(".sandDance").element().innerWidth / 2 - rc.width / 2;
        }

        if ((top === undefined || top === null) && (bottom === undefined || bottom === null))
        {
            //---- center vertically ----
            top = vp.select(".sandDance").element().innerHeight / 2 - rc.height / 2;
        }

        if (openPanel)
        {
            if (isCenter) {
                panel.open();
            } else {
                panel.open(left, top, right, bottom);
            }
        }

        return panel;
    }
} 