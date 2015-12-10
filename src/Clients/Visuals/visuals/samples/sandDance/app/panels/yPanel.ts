//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    yPanel.js - describes the panel for setting Y axis mapping options
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var yPanel: any = {
            rows:
            [
                { numAdjuster: "Bins:", tip: "Specifies the number of bins to create", min: 2, max: 999, roundValues: true, spreadLow: true, dataName: "yBins" },
                { colPickerList: "", tip: "Sets column used to map the Y axis", dataName: "changeYMapping", marginRight: -48 },
            ]
        };

    }
}