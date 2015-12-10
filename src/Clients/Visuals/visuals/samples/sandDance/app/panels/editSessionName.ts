//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    editSessionName.js - dialog panel to edit name of session being saved.
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var editSessionName: any = {
            title: "Edit session name", tip: "Change the name of the session being saved to local file system", rowSpacing: "6px", isDialog: true,
            rows: [
                { text: "Name:", tip: "The name of the sessioh file being saved", dataName: "editSessionName", width: "200px" },
                { col: 1, button: "OK", tip: "Close the panel and save the session with the specified name", textAlign: "right", acceptButton: true },
            ]
        };
    }
}