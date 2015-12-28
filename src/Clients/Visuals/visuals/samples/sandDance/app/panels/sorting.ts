//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    sorting.js - describes the panel to set sorting options
//-------------------------------------------------------------------------------------

/// NOTE about BeachParty panels:
///     - This is a description of how to build our (very regular and simple) panels.  This is not a general panel building system;
///       it will only work for our specific style of panels.
///     - Being a JSON description, we can make panel easier to write, read, and maintain.  We also add our own very 
///       specific kind of data binding.
///     - The hope is by keeping things simple and limited, we can make this easy to build.

module sandDance {
    export module panels {
        export var sorting: any = {
            tabs:
            [
                {
                    tabName: "Items", tip: "Specify how the record items/shapes are sorted",
                    rows:
                    [
                        { checkbox: "Ascending", tip: "Sort items in ascending order (smallest to largest)", dataName: "isItemSortAscending", marginBottom: 6 },
                        { button: "Sort by color", tip: "Sets the item sort column to the color mapping column", dataName: "onItemsByColorClick", marginBottom: 6 },
                        { colPickerList: "", tip: "Sets column used to map facet", includeNone: true, dataName: "sortItemColumn", marginRight: -3 },
                    ]
                },

                {
                    tabName: "Bins", tip: "Specify how the X, Y, and Facet bins are sorted",
                    rows:
                    [
                        { prompt: "X bins:", tip: "Control how the X bins are sorted", dataName: "xBinSorting" },
                        { col: 1, radio: "None", tip: "Bins are listed in their natural order (by labels)", value: "0" },
                        { col: 1, radio: "Ascending", tip: "Bins are listed in their natural order (by labels)", value: "1" },
                        { col: 1, radio: "Descending", tip: "Bins are listed in their natural order (by labels)", value: "2" },

                        { prompt: "Y bins:", tip: "Control how the Y bins are sorted", dataName: "yBinSorting" },
                        { col: 1, radio: "None", tip: "Bins are listed in their natural order (by labels)", value: "0" },
                        { col: 1, radio: "Ascending", tip: "Bins are listed in their natural order (by labels)", value: "1" },
                        { col: 1, radio: "Descending", tip: "Bins are listed in their natural order (by labels)", value: "2" },

                        { prompt: "Facet bins:", tip: "Control how the Facet bins are sorted", dataName: "facetBinSorting" },
                        { col: 1, radio: "None", tip: "Bins are listed in their natural order (by labels)", value: "0" },
                        { col: 1, radio: "Ascending", tip: "Bins are listed in their natural order (by labels)", value: "1" },
                        { col: 1, radio: "Descending", tip: "Bins are listed in their natural order (by labels)", value: "2" }
                    ]
                }
            ]
        };
    }
}