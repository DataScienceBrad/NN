//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    slicerControl.ts - control to filter records based on a histogram of a column.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class SlicerControlClass extends beachParty.DataChangerClass implements IAppControl
    {
        private container: HTMLElement;
        private application: AppClass;

        _root: HTMLDivElement;
        //_colPickerName: HTMLElement;
        _histogram: HTMLElement;
        _histoHolder: HTMLElement;
        _selectedRowElem: HTMLElement;
        _slider: HTMLElement;
        _colPicker: PickerClass;
        _delimiterPicker: PickerClass;

        _isCategory: boolean;
        _binResult: beachParty.BinResult;
        _colName: string;
        _buildTimer = null;

        //---- search context ----
        _minValue = null;
        _searchParams: utils.SearchParamsEx;

        _panel: JsonPanelClass;
        _selectedBinIndex = null;
        _holderHeight: number;
        _rowElements = [];
        _updateRowAfterBuild = false;
        _tagDelimiter = bps.TagDelimiter.none;

        constructor(application: AppClass, container: HTMLElement, panel?: JsonPanelClass)
        {
            super();

            this.application = application;
            this.container = container;

            this._panel = panel;
            var root = document.createElement("div");
            this._root = root;

            //---- build slicer control ----
            vp.select(root)
                //.css("border", "1px solid green")
                .addClass("slicerControl");

            var rootW = vp.select(root);

            //---- add control bar at top ----
            this.buildTopBar(rootW);

            var histoHolderW = rootW.append("div")
                .addClass("histogramHolder")
                .css("overflow-y", "auto")
                .css("overflow-x", "hidden")
                .css("padding-right", "20px")    ;

            this._histoHolder = histoHolderW[0];

            //---- add slider root, for when we a hold numeric column ----
            var sliderW = histoHolderW.append("span")
                .addClass("slicerSlider")
                .css("position", "relative");

            this._slider = sliderW[0];

            var histogramW = histoHolderW.append("table")
                //.css("border", "1px solid red")
                .css("width", "100%")
                .attr("cellSpacing", "0")
                .addClass("histogram")
                .attach("mousedown", (e) =>
                {
                    //---- pass focus to our root, so keyboard thru records works correctly ----
                    setTimeout((e) => this._root.focus(), 100);
                });

            this._histogram = histogramW[0];

            this.markBuildNeeded();
            this.quickLayout();
        }

        tagDelimiter(value?: bps.TagDelimiter)
        {
            if (arguments.length === 0)
            {
                return this._tagDelimiter;
            }

            if (value !== this._tagDelimiter)
            {
                this._tagDelimiter = value;
                this.onDataChanged("tagDelimiter");

                this._delimiterPicker.value(bps.TagDelimiter[value]);
            }
        }

        buildTopBar(rootW: vp.dom.IWrapperOuter)
        {
            var barW = rootW.append("div")
                .addClass("slicerControlBar")
                .css("position", "relative")
                .css("top", "-4px");

            //---- add column picker ----
            var colPickerValues = this.application.getMappingCols(false);
            var colPicker = new PickerClass(this.application, this.container, barW[0], null, colPickerValues, "None", "Select a column for populating data slicer bars", true,
                20);

            this._colPicker = colPicker;
            vp.select(colPicker.getRoot()).css("margin-right", "20px");

            colPicker.registerForChange("value", (e) =>
            {
                var itemText = colPicker.value();
                this.colName(itemText);
            });

            //---- add TAG DELIMITER picker ----
            var tdValues = PickerClass.buildStringsFromEnum(bps.TagDelimiter);
            var tdPicker = new PickerClass(this.application, this.container, barW[0], "Tag:", tdValues, "None", "For TAG columns, specify the tag delimiter", true);

            this._delimiterPicker = tdPicker;
            vp.select(tdPicker.getRoot()).css("float", "right");

            tdPicker.registerForChange("value", (e) =>
            {
                var itemText = tdPicker.value(); 
                var td = bps.TagDelimiter[itemText.toLowerCase()];
                this.tagDelimiter(td);
            });
        }

        refreshColPickList()
        {
            var colPickerValues = this.application.getMappingCols(false);
            this._colPicker.values(colPickerValues);
        }

        /** property for setting the selected value in the UI when the control is loaded with data. */
        selectedValue(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._minValue;
            }

            this._minValue = value;

            //---- need to update the selected row ----
            if ((this._binResult) && (this._binResult.colName === this._colName) && (this._rowElements.length))
            {
                this.setSelectedBinIndexFromValue(value);
            }
            else
            {
                this._updateRowAfterBuild = true;
            }

            this.onDataChanged("selectedValue");
        }

        setSelectedBinIndexFromValue(value: string)
        {
            this.updateSelectedRow(null);

            if (!this._isCategory)
            {
                var numVal = +value;
            }

            var bins = this._binResult.bins;
            for (var i = 0; i < bins.length; i++)
            {
                var bin = bins[i];

                if (this._isCategory)
                {
                    if (bin.name === value)
                    {
                        this.updateSelectedRow(this._rowElements[i]);
                        break;
                    }
                }
                else
                {
                    var numBin = <beachParty.BinInfoNum>bin;
                    if (numVal >= numBin.min && numVal <= numBin.max)
                    {
                        this.updateSelectedRow(this._rowElements[i]);
                        break;
                    }
                }
            }
        }

        markBuildNeeded()
        {
            if (!this._buildTimer)
            {
                this._buildTimer = setTimeout((e) => this.buildHistogram(), 100);
            }
        }

        getRootElem()
        {
            return this._root;
        }

        onResize(width: number, height: number)
        {
            this.quickLayout();

            //this.markBuildNeeded();
        }

        quickLayout()
        {
            var rc = vp.select(this._root).getBounds(false);
            var height = (rc.height) ? rc.height : 270;     // window.innerHeight * .8;

            var hh = Math.max(25, height - 40);

            //---- quick layout ----
            vp.select(this._histoHolder)
                .css("height", hh + "px");

            this._holderHeight = hh;

            vp.utils.debug("quickLayout: height set=" + hh);
        }

        close()
        {
            vp.select(this._root)
                .remove();
        }

        slicerData(value?: beachParty.BinResult)
        {
            if (arguments.length === 0)
            {
                return this._binResult;
            }

            this._binResult = value;
            this._isCategory = (value && value.bins.length && ((<any>value.bins[0]).min === undefined || (<any>value.bins[0]).min === null));

            this.markBuildNeeded();
            this.refreshColPickList();

            this.onDataChanged("slicerData");
        }

        colName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._colName;
            }

            if (this._colName !== value)
            {
                this._colName = value;
                this._selectedBinIndex = null;
                this.markBuildNeeded();

                //---- reset delimiter when column changes ----
                if (this._tagDelimiter !== bps.TagDelimiter.none)
                {
                    this.tagDelimiter(bps.TagDelimiter.none);
                }

                this.onDataChanged("slicerColName");
            }
        }

        getSearchParams()
        {
            return this._searchParams;
        }

        buildNumericSliders()
        {
            var sliderBoxW = vp.select(this._slider)
                .css("height", this._holderHeight + "px")
                .css("width", "30px")
                .css("background", "green");

            var lineHeight = this._holderHeight - 8;

            sliderBoxW.append("span")
                .css("width", "1px")
                .css("height", lineHeight + "px")
                .css("background", "red")
                .css("margin-left", "8px")
                .css("margin-right", "12px");

            sliderBoxW.append("span")
                .css("width", "1px")
                .css("height", lineHeight + "Px")
                .css("background", "red")
                .css("margin-right", "8px");

            sliderBoxW.append("span")
                .css("width", "7px")
                .css("height", "7px")
                .css("background", "green")
                .css("position", "absolute")
                .css("left", "5px")
                .css("top", "5px");

            sliderBoxW.append("span")
                .css("width", "7px")
                .css("height", "7px")
                .css("background", "green")
                .css("position", "absolute")
                .css("left", "16px")
                .css("top", "5px");
        }

        getMaxCount(result: beachParty.BinResult)
        {
            var maxCount = 0;

            for (var i = 0; i < result.bins.length; i++)
            {
                maxCount = Math.max(maxCount, result.bins[i].count);
            }

            return maxCount;
        }

        buildHistogram()
        {
            this._buildTimer = null;
            this._rowElements = [];

            //---- update column picker name ----
            this._colPicker.value(this._colName);

            vp.select(this._slider)
                .clear();

            var isCategory = this._isCategory;

            if (!isCategory)
            {
                //this.buildNumericSliders();
            }

            var histogramW = vp.select(this._histogram)
                .clear();

            var binResult = this._binResult;
            if (binResult && binResult.bins.length)
            {
                var binCount = binResult.bins.length;
                var maxCount = this.getMaxCount(binResult);
                var barHeight = 16;     // approx text height of binName

                var width = vp.select(this._root).width();
                if (width === 0)
                {
                    //---- default width for panels whose size is still floating ----
                    width = 300;
                }

                for (var c = 0; c < binCount; c++)
                {
                    var bin = binResult.bins[c];
                    var binName = bin.name;
                    var count = bin.count;
                    var minWidth = 10;       // all bars are at least this wide (10%) (so they are clickable)

                    var barWidth = minWidth + count / maxCount * 90;

                    var rowW = histogramW.append("tr")
                        .addClass("histogramRow");

                    if (c === this._selectedBinIndex)
                    {
                        rowW.css("background", "#444");
                    }
                    else
                    {
                        rowW.css("background", "none");
                    }

                    var displayName = (binName === "") ? this.application._blankValueStr : binName;

                    //---- bin NAME td ----
                    rowW.append("td")
                        .addClass("histogramBinName")
                        .css("width", "1px")                    // make name col as small as possible
                        .css("white-space", "nowrap")
                        .text(displayName)
                        .attach("click", (e) => this.selectFromRow(e.target.parentElement));

                    //---- bin BAR td ----
                    var tdW = rowW.append("td")
                        .css("min-width", "60px");

                    //---- actual bar must be in a separate div ----
                    tdW.append("div")
                        .addClass("histogramBinBar")
                        .css("height", barHeight + "px")
                        .css("width", barWidth + "%")
                        .title(vp.formatters.comma(count) + " records")
                        .attach("click", (e) => this.selectFromRow(e.target.parentElement.parentElement));

                    utils.prepWithBinDirect(rowW[0], this._colName, isCategory, bin, "histoBar");
                   
                    this._rowElements.push(rowW[0]);
                }
            }

            if (this._updateRowAfterBuild)
            {
                this.setSelectedBinIndexFromValue(this._minValue);
                this._updateRowAfterBuild = false;
           }
        }

        updateSelectedRow(rowElem: any)
        {
            if (this._selectedBinIndex > -1 && this._selectedRowElem)
            {
                vp.dom.css(this._selectedRowElem, "background", "none");
            }

            this._selectedBinIndex = (rowElem) ? rowElem.binIndex : -1;
            this._selectedRowElem = (rowElem) ? rowElem : null;

            if (this._selectedBinIndex > -1)
            {
                vp.dom.css(this._selectedRowElem, "background", "#444");
            }
        }

        selectFromRow(rowElem: any)
        {
            this._searchParams = <utils.SearchParamsEx>rowElem._searchParams;

            this._minValue = this._searchParams.minValue;

            this.updateSelectedRow(rowElem);

            this.onDataChanged("selectedValue");
        }
    }

    export function createSlicer(panel: JsonPanelClass, application: AppClass, container: HTMLElement)
    {
        return new SlicerControlClass(application, container, panel);
    }
}
