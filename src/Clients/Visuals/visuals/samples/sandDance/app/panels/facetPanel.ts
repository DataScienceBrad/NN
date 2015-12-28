//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    facetPanel.js - describes the panel for setting facet mapping options
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var facet: any = {
            rows:
            [
                { numAdjuster: "Facets:", tip: "Specifies the number of facets to create", min: 2, max: 12, roundValues: true, dataName: "facetBins" },

                //---- note: marginBottom is not effective here; go to app.openFacetPanelCore() to adjust ----
                { colPickerList: "", tip: "Sets column used to map facet", includeNone: true, dataName: "facetColumn", marginRight: -40 },
            ]
        };
    }
}