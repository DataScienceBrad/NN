//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    numSpreader.ts - popup panel for adjusting the search spread of a numeric field.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class numSpreaderClass        //extends basePanelClass
    {
        _root: HTMLElement;
        _colNameElem: HTMLSpanElement;
        _rangeButton: HTMLSpanElement;
        _slider: HTMLInputElement;
        _sliderText: HTMLSpanElement;

        _colName: string;
        _value: number;
        _minValue: number;
        _maxValue: number;
        _bpsHelper: bps.chartHostHelperClass;
        _minSpread: number;
        _maxSpread: number;
        _isOpen: boolean;
        _searchCallback: any;

        constructor(bpsHelper: bps.chartHostHelperClass, colName: string, value: number, minValue: number, maxValue: number,
            parentElem: HTMLElement, initialPercent, searchCallback)
        {
            //super(true, null, null, null, null, false, "Spread the value to search", false, parentElem);

            this._colName = colName;
            this._value = value;
            this._minValue = minValue;
            this._maxValue = maxValue;
            this._bpsHelper = bpsHelper;
            this._searchCallback = searchCallback;

            var rootW = vp.select(parentElem)
                .append("span")
                .addClass("numSpreaderPanel")
                .css("height", "15px")

            ////---- add the PERCENT TEXT ----
            //var sliderTextW = rootW.append("span")
            //    .addClass("numSpreaderPercent")
            //    .css("margin-left", "10px")
            //    .css("min-width", "40px")
            //    .css("display", "inline-block")

            //---- add the SLIDER CONTROL ----
            var sliderW = rootW.append("input")
                .addClass("numSpreaderSlider")
                .attr("type", "range")
                .title("Adjust spread of value to search")
                .attr("min", "0")
                .attr("max", "100")
                .attr("value", initialPercent + "")
                .css("display", "inline-block")
                .css("width", "80px")
                .css("margin-top", "0px")
                .css("margin-left", "10px")
                .css("height", "20px")
                //.css("border", "1px solid green")
                .css("position", "relative")
                .css("top", "3px")
                .attach("change", (e) => this.onSliderChange())
                .attach("mouseup", (e) => this.onRangeClick(e))

            ////---- add the COL NAME ----
            //var colNameW = rootW.append("span")
            //    .addClass("numSpreaderColName")
            //    .css("margin-left", "10px")
            //    .text(colName + ": ")

            //---- add the RANGE BUTTON ----
            var rangeButtonW = rootW.append("span")
                .addClass("numSpreaderRange")
                .addClass("selectedTextButton")
                .css("padding-top", "0px")
                .css("padding-bottom", "2px")
                .css("margin-left", "10px")
                .css("margin-right", "10px")
                .css("height", "20px")
                .css("display", "inline-block")
                .css("position", "relative")
                .css("top", "-2px")
                .title("Search in specified value range")
                .attach("click", (e) => this.onRangeClick(e))

            this._root = rootW[0];
            //this._colNameElem = colNameW[0];
            this._rangeButton = rangeButtonW[0];
            this._slider = sliderW[0];
            //this._sliderText = sliderTextW[0];

            this._isOpen = true;

            this.onSliderChange();
        }

        onRangeClick(e)
        {
            var percent = this._slider.value;

            this._searchCallback(this._colName, this._minSpread + "", this._maxSpread + "",
                bps.TextSearchType.betweenInclusive, percent);
        }

        isOpen()
        {
            return this._isOpen;
        }

        close()
        {
            vp.select(this._root)
                .remove();

            this._isOpen = false;
        }

        //onSearchClick()
        //{
        //    this._bpsHelper.search(this._colName, this._minSpread + "", this._maxSpread + "",
        //        bps.TextSearchType.betweenInclusive);
        //}

        format(value: number, decimals: number)
        {
            var str = value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
            return str;
        }

        onSliderChange()
        {
            var slider = this._slider;
            var percent = +slider.value;

            //---- apply "spread low" to lower value ----
            percent /= 100;         // convert to range 0..1
            percent = percent * percent;
            percent *= 100;         // convert back to original range

            var value = this._value;
            var minValue = this._minValue;
            var maxValue = this._maxValue;

            var valueDelta = maxValue - minValue;
            var delta = percent * valueDelta / 100;
            var minSpread = Math.max(minValue, value - delta);
            var maxSpread = Math.min(maxValue, value + delta);

            this._minSpread = minSpread;
            this._maxSpread = maxSpread;

            var spreadText = percent + "%";
            var vd = valueDelta / 50;
            var decimals = (vd >= 1) ? 0 : (-Math.ceil(Math.log10(vd)));

            if (percent == 0)
            {
                decimals = undefined;
            }

            var rangeText = this.format(minSpread, decimals) + " to " + this.format(maxSpread, decimals);

            if (this._sliderText)
            {
                this._sliderText.textContent = spreadText;
            }

            this._rangeButton.textContent = rangeText;
        }
    }
}