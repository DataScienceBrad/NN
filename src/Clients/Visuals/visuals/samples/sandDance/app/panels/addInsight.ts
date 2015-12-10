//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    addInsight.js - dialog panel for adding an insight object.
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var addInsight: any = {
            title: "Add Insight", tip: "Add the name and notes for an insight", rowSpacing: "6px", isDialog: true,
            rows: [
                { text: "Name:", tip: "The name of the insight", dataName: "editInsightName", width: "300px" },
                { textArea: "Notes:", tip: "Your notes about the insight", dataName: "editInsightNotes", width: "300px", height: "60px" },
                { col: 1, button: "OK", tip: "Close the panel and create the insight", textAlign: "right", acceptButton: true },
            ]
        };
    }
}