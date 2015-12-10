//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    facetMgr.ts - manages the client side of facets.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class facetMgrClass extends beachParty.dataChangerClass 
    {
        _facetLayouts: bps.FacetLayoutInfo[];

        constructor()
        {
            super();
        }

        buildLabels(facetLayouts: bps.FacetLayoutInfo[])
        {
            this._facetLayouts = facetLayouts;
            var rootW = vp.select("#facetLabelHolder");      // #chartUxDiv")

            //---- clear previous labels ----
            rootW.clear();

            if (facetLayouts && facetLayouts.length)
            {
                for (var i = 0; i < facetLayouts.length; i++)
                {
                    var fl = facetLayouts[i];
                    var rc = fl.labelBounds;
                    var text = fl.facelLabel;

                    if (!text)
                    {
                        text = "<blank>";
                    }

                    //---- note that the text-align must be specified on the CONTAINTER ----
                    var divW = rootW.append("div")
                        .css("position", "absolute")
                        .css("text-align", "center")
                        .bounds(rc.left, rc.top + 6, rc.width, rc.height)

                    var labelW = divW.append("span")
                        .addClass("textButton facetLabel")
                        .text(text)
                        .attach("click", (e) =>
                        {
                            var elem = e.target;
                            var sp = <bps.SearchParams>elem.searchParams;

                            appClass.instance.doSearch("Facet", sp.colName, sp.minValue, sp.maxValue, sp.searchType);
                        });

                    labelW[0].searchParams = fl.searchParams;
                }
            }
        }
   }
}