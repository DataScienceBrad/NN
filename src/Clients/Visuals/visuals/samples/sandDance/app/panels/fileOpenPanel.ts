//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    colorPanel.js - describes the panel for setting color mapping options
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var fileOpen: any = {
            minWidth: 300, minHeight: 370,
            tabs: [
                {
                    tabName: "Sample", tip: "Open one of the BeachParty sample data files", rows:
                    [
                        { knownDataPickerList: ":", tip: "Select a sample file", dataName: "selectedSampleName", width: 289 },
                    ]
                },

                /// warning: don't use "acceptButton: true" on the "Load" buttons - we don't currently do the right thing when there is more than 1 accept button.

                {
                    tabName: "Local", tip: "Open a local data file", rows:
                    [
                        { button: "Select File...", tip: "Invokes the brower's File Open dialog", dataName: "onOpenFileClicked" },
                        { col: 1, text: "", tip: "Selected filename", dataName: "selectedFileName", readOnly: true, width: "200px", marginTop: "6px" },
                        { prompt: "File type:", tip: "Select the type of file to be opened", dataName: "openFileTypeLocal" },
                        { col: 1, radio: "Tab-delimited (.txt)", tip: "Open as a tab-delimited file", value: "tab" },
                        { col: 1, radio: "Comma-delimited (.csv)", tip: "Open as a comma-delimited file", value: "comma" },
                        { col: 1, radio: "JSON data (.json)", tip: "Open as JSON file", value: "json" },
                        { checkbox: "First line is header", tip: "When set, treats first line of delimited file as a header", dataName: "fileHasHeader", disabled: "isFirstLineDisabledLocal" },

                        { emptyRow: true },
                        { prompt: "Data scrubber:", tip: "Select a Data Scrubber template to apply to file", },
                        { col: 1, scrubberPicker: "", tip: "Select a Data Scrubber template to apply to file", dataName: "dataScrubberName" },
                        { emptyRow: true },

                        { col: 1, button: "Load", tip: "Load the selected file (and close this panel)", textAlign: "right", acceptButton: false, dataName: "loadFileOpenLocal" },
                    ]
                },

                {
                    tabName: "Web", tip: "Open a local data file", rows:
                    [
                        { prompt: "URL:", tip: "Enter the Web URL of the file to be opened" },
                        { col: 1, text: "", tip: "Enter the Web URL of the file to be opened", dataName: "fileOpenURL", width: "200px" },
                        { prompt: "File type:", tip: "Select the type of file to be opened", dataName: "openFileTypeWeb" },
                        { col: 1, radio: "Tab-delimited (.txt)", tip: "Open as a tab-delimited file", value: "tab" },
                        { col: 1, radio: "Comma-delimited (.csv)", tip: "Open as a comma-delimited file", value: "comma" },
                        { col: 1, radio: "JSON data (.json)", tip: "Open as JSON file", value: "json" },
                        { checkbox: "First line is header", tip: "When set, treats first line of delimited file as a header", dataName: "fileHasHeader", disabled: "isFirstLineDisabledWeb" },

                        { emptyRow: true },
                        { prompt: "Data scrubber:", tip: "Select a Data Scrubber template to apply to file", },
                        { col: 1, scrubberPicker: "", tip: "Select a Data Scrubber template to apply to file", dataName: "dataScrubberName" },
                        { emptyRow: true },

                        { col: 1, button: "Load", tip: "Load the specified file (and close this panel)", textAlign: "right", acceptButton: false, dataName: "loadFileOpenWeb" },
                    ]
                },

                {
                    tabName: "SQL", tip: "Open a SQL table", rows:
                    [
                        { prompt: "Connection string:", tip: "Enter the SQL connection string" },
                        { col: 1, text: "", tip: "Enter the SQL connection string of the file to be opened", dataName: "fileOpenURL", width: "200px" },
                        { prompt: "Table name (or query):", tip: "Enter the table to open or query to run" },
                        { col: 1, text: "", tip: "Enter the table to open or query to run", dataName: "sqlTableName", width: "200px" },

                        { emptyRow: true },
                        { prompt: "Data scrubber:", tip: "Select a Data Scrubber template to apply to file", },
                        { col: 1, scrubberPicker: "", tip: "Select a Data Scrubber template to apply to file", dataName: "dataScrubberName" },
                        { emptyRow: true },

                        { col: 1, button: "Load", tip: "Load the specified file (and close this panel)", textAlign: "right", acceptButton: false, dataName: "loadFileOpenSql" },
                    ]
                },
            ]
        };
    }
}