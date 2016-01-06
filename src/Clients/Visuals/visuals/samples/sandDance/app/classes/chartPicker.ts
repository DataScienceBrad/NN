//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    chartPicker.ts - popup panel for selecting the current chart type.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class ChartPickerClass extends BasePanelClass
    {
        _tableElem: HTMLElement;
        _callback = null;
        _currentChart = null;

        constructor(currentChart: string, callback)
        {
            super("bbView", true, null, null, null, null);

            this._callback = callback;
            this._currentChart = currentChart;

            //---- create the table ----
            var tableW = vp.select(this._root).append("table")
                .addClass("chartPicker");

            //---- first row of CHARTS ----
            var rowW = tableW.append("tr");

            this.addChart(rowW, "Scatter", "fnChartPickerScatter", "Plot data in X and Y");
            this.addChart(rowW, "Column", "fnChartPickerCol", "Organize shapes into verticalcolumns");
            this.addChart(rowW, "Bar", "fnChartPickerBar", "Organize shapes into horizontal bars");
            this.addChart(rowW, "Flat", "fnChartPickerFlat", "View the shapes in a single grid");
            this.addChart(rowW, "Squarify", "fnChartPickerSquarify", "Size the shapes according to a column in using the Squrify Treemap algorithm");

            //---- spacing row ----
            var rowW = tableW.append("tr")
                .css("height", "10px");

            //---- second row of CHARTS ----
            var rowW = tableW.append("tr");

            this.addChart(rowW, "Density", "fnChartPickerDensity", "Organize shapes into X and Y bins");
            this.addChart(rowW, "Violin", "fnChartPickerViolin", "Organize shapes into X and Y bins, with width of bins representing the count");
            this.addChart(rowW, "Radial", "fnChartPickerRadial", "Plat data with X as the angle and Y as the radius");
            this.addChart(rowW, "Scatter3D", "fnChartPickerScatter3d", "Plot data in X, Y, and Z", "Scatter-3D");
            this.addChart(rowW, "Stacks", "fnChartPickerStacks", "Organize shapes into X and Y bins, stacked in Z");
        }

        addChart(rowW: vp.dom.singleWrapperClass, title: string, imgSrc: string, tooltip: string, valueText?: string)
        {
            if (!valueText)
            {
                valueText = title;
            }

            var tdW = rowW.append("td")
                .addClass("chartPickerEntry")
                .id(`chartPicker${title}`)
                .title(tooltip);
                
            tdW.element()
                .addEventListener("click", (e) => {
                    this.onClick(e);
                });
                // .attach("click", (e) =>
                // {
                //     this.onClick(e);
                // });

            tdW.append("div")
                .addClass("chartPickerImage")
                .attr("data-src", imgSrc)
                .element()
                .addEventListener("dragstart", function (e)
                {
                    //---- prevent drag of icon ----
                    e.preventDefault();
                });

            tdW.append("div")
                .addClass("chartPickerTitle")
                .text(title);

            if (this._currentChart === title)
            {
                tdW.attr("data-selected", "true");
            }

            tdW[0].returnName = valueText;
        }

        onClick(e)
        {
            var elem = e.target;
            if (!elem.returnName)
            {
                elem = elem.parentNode;
            }

            this._callback(elem.returnName);

            this.close();
        }
   }
}