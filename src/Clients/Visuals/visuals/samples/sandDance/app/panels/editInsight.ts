//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    editInsight.js - dialog panel for editing an insight object.
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var editInsight: any = {
            title: "Edit Insight", tip: "View and change the name and notes for an insight", rowSpacing: "6px", isDialog: true,
            rows: [
                { text: "Name:", tip: "The name of the insight", dataName: "editInsightName", width: "300px" },
                { textArea: "Notes:", tip: "Your notes about the insight", dataName: "editInsightNotes", width: "300px", height: "100px" },
                //{ checkbox: "Notes in markdown format", tip: "When true, markdown formatting are recognized in the notes", dataName: "isNotesMarkDown" },
                { enumPicker: "Load action:", tip: "What should be loaded when this insight is selected", width: 60, dataName: "loadAction", enumType: bps.LoadAction },
                { enumPicker: "Chart title from:", tip: "Specifies the source of the text for the chart title box", width: 60, dataName: "notesSource", enumType: bps.NotesSource },

                { col: 1, button: "OK", tip: "Apply these changes and close the panel", textAlign: "right", width: 80, acceptButton: true },
            ]
        };
    }
}