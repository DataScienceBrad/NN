//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    facetLegend.ts - draws an interactive, continuous/discreet color legend (color palette, ticks, labels).
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class FacetLegendClass extends beachParty.DataChangerClass
    {
        _fm: bps.MappingData;

        _rootElem: HTMLElement;
        _titleElem: HTMLElement;

        constructor(rootName: string, cm: bps.MappingData)
        {
            super();

            this._fm = cm;
            var root = vp.select("#" + rootName);

            //---- add colName as TITLE ----
            var title = root.append("span")
                .addClass("legendTitle textButton")
                .id("facetLegendTitle")
                .text(cm.colName)
                .attach("click", (e) =>
                {
                    this.onDataChanged("facetColPickerRequest");
                });

            this._rootElem = root[0];
            this._titleElem = title[0];

            this.updateLegend();
        }

        facetMapping(value?: bps.MappingData)
        {
            if (arguments.length === 0)
            {
                return this._fm;
            }

            this._fm = value;
            this.onDataChanged("facetMapping");

            this.updateLegend();
        }

        updateLegend()
        {
            var cm = this._fm;
            var name = cm.colName;

            vp.select(this._rootElem)
                .css("display", (name) ? "block" : "none");

            vp.select(this._titleElem)
                .text(name);
        }
    }
}
 