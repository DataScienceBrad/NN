//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    chartSettings.js - describes the panel for changing application settings
//-------------------------------------------------------------------------------------

module sandDance {
    export module panels {
        export var chartSettings: any = {
            tabs: [
                {
                    tabName: "Chart Options",
                    tip: "Chart Options",
                    rows: [
                        { prompt: "Shapes:", tip: "Change shape settings" },
                        { col: 1, numAdjuster: "Shape size:", tip: "Adjust the size factor applied to all shapes", min: 0, max: 3, dataName: "sizeFactor", newCol: true },
                        { col: 1, colorPicker: "Shape color:", tip: "Sets the shape color (used when color is not mapped to a column) ", dataName: "shapeColor" },
                        { col: 1, shapePicker: "Shape image:", tip: "Sets the image used to draw shapes", dataName: "shapeImage" },

                        { prompt: "Layouts:", tip: "Change layout settings" },
                        { col: 1, numAdjuster: "Shape separation:", tip: "Adjust the separation factor used in layout-style views", min: 0, max: 5, dataName: "separationFactor", newCol: true },
                        {
                            col: 1, numAdjuster: "Stacking columns:", tip: "Adjust the number of columns used in the Stacks layout", min: 1, max: 10,
                            dataName: "zBins", newCol: true, roundValues: true,
                        },

                        { prompt: "Other:", tip: "Change other chart settings" },
                        { col: 1, checkbox: "X gridlines", tip: "Show the vertical gridlines associated with the X axis", dataName: "showXGridLines" },
                        { col: 1, checkbox: "Y gridlines", tip: "Show the vertical gridlines associated with the Y axis", dataName: "showYGridLines" },
                    ]
                }
            ]
        };
    }
}