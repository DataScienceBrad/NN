//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    appSettings.js - describes the panel for changing application settings
//-------------------------------------------------------------------------------------

/// NOTE about SandDance panels:
///     - This is a description of how to build our (very regular and simple) panels.  This is not a general panel building system;
///       it will only work for our specific style of panels.
///     - Being a JSON description, we can make panel easier to write, read, and maintain.  We also add our own very 
///       specific kind of data binding.
///     - The hope is by keeping things simple and limited, we can make this easy to build.

module sandDance {
    export module panels {
        export var appSettings: any = {
            title: "SandDance Settings", tip: "change the SandDance application settings", isDialog: true,
            tabs: [

                {
                    tabName: "Animation", tip: "Settings for chart animation and staggering", rows:
                    [
                        { prompt: "Animaton:", tip: "Change animaton settings" },
                        { col: 1, checkbox: "Enabled", tip: "When true, changes to the shapes or charts are animated", dataName: "isAnimationEnabled" },
                        { col: 1, numAdjuster: "Duration:", tip: "Specifies how long an animation lasts (in seconds)", min: 0, max: 10, dataName: "animationDuration" },

                        { prompt: "Staggering:", tip: "Change staggered animmation settings" },
                        { col: 1, checkbox: "Enabled", tip: "When true, changes to the shapes are staggered in time, so they don't all change at once", dataName: "isStaggeringEnabled" },
                        { col: 1, numAdjuster: "Maximum:", tip: "Specifies the maximum delay for a stagger shape's animation (in seconds)", min: 0, max: 10, dataName: "maxStaggerTime" },

                        { prompt: "Easing:", tip: "Change the ease in/out parameters" },
                        { col: 1, enumPicker: "Ease function:", tip: "Sets the ease function", dataName: "easeFunction", enumType: bps.EaseFunction },
                        { col: 1, enumPicker: "Ease type:", tip: "Sets the type of easing to be used", dataName: "easeType", enumType: bps.EaseType },
                    ]
                },

                {
                    tabName: "3D", tip: "Setting for 3D", rows:
                    [
                        { prompt: "3D Transform:", tip: "Change options for the 3D transform mode" },
                        { col: 1, checkbox: "3D grid always on", tip: "Use 3D grid on all views", dataName: "is3dGridAlwaysOn" },
                        { col: 1, checkbox: "Rotation inertia", tip: "Use inertial of touch on wheel to keep it rotating", dataName: "isWheelInertia" },
                        { col: 1, checkbox: "Show transform wheel", tip: "Show the transform wheel during 3D transform mode ", dataName: "showWheelDuringTransformMode" },

                        { prompt: "3D lighting:", tip: "Change options for 3D lighting" },
                        { col: 1, checkbox: "Lighting always on", tip: "Use 3D lighting on all views", dataName: "isLightingAlwaysOn" },
                        { col: 1, numAdjuster: "Ambient level:", tip: "The ambient lighting level (0-1)", min: 0, max: 1, dataName: "ambientLightLevel", newCol: true },
                    ]
                },

                {
                    tabName: "Hover", tip: "Settings for hover-related action", rows:
                    [
                        { prompt: "Hover:", tip: "Change the mouse hover settings" },
                        { col: 1, enumPicker: "Hover match:", tip: "Sets the type of hover testing to match mouse position to shapes", dataName: "hoverMatch", enumType: bps.HoverMatch },
                        { col: 1, enumPicker: "Hover effect:", tip: "Sets how the hovered-over shape is drawn", dataName: "hoverEffect", enumType: bps.HoverEffect },
                        { col: 1, numAdjuster: "Match size:", tip: "Specifies the size of the hover testing area under the mouse, when hoverMatch=square)", min: 0, max: 100, roundValues: true, dataName: "hoverSize", newCol: true },
                        { col: 1, colorPicker: "Hover color:", tip: "Sets the color of the hovered-over shape ", dataName: "hoverColor", includeTransparent: true },

                        { prompt: "Other:", tip: "Other settings" },
                        { col: 1, checkbox: "Show tooltips", tip: "When true, hoving over a shape displays a tooltip", dataName: "isTooltipsEnabled" },
                    ]
                },

                {
                    tabName: "Selection", tip: "Control drawing of shapes when a selection is active", rows:
                    [
                        { prompt: "Selected:", tip: "Controls how selected shapes are drawn" },
                        { col: 1, enumPicker: "Effect:", tip: "How the shape color should be effected", dataName: "selectedColorEffect", enumType: bps.ColorEffect },
                        { col: 1, colorPicker: "Color:", tip: "The color, when Effect = SetColor", dataName: "selectedColor" },
                        { col: 1, numAdjuster: "Factor:", tip: "The color factor used by the effect)", min: 0, max: 2, dataName: "selectedColorFactor", newCol: true },

                        { prompt: "Unselected:", tip: "Controls how unselected shapes are drawn" },
                        { col: 1, enumPicker: "Effect:", tip: "How the shape color should be effected", dataName: "unselectedColorEffect", enumType: bps.ColorEffect },
                        { col: 1, colorPicker: "Color:", tip: "The color, when Effect = SetColor", dataName: "unselectedColor" },
                        { col: 1, numAdjuster: "Factor:", tip: "The color factor used by the effect)", min: 0, max: 2, dataName: "unselectedColorFactor", newCol: true },
                    ]
                },

                {
                    tabName: "Chart", tip: "Settings for drawing the chart and its shapes", rows:
                    [
                        { col: 1, numAdjuster: "Shape opacity:", tip: "Sets the opacity of all shapes", min: 0, max: 1, dataName: "shapeOpacity", newCol: true },
                        { col: 1, colorPicker: "Canvas:", tip: "Sets the background color", dataName: "canvasColor" },
                        { col: 1, numAdjuster: "Frame opacity:", tip: "Sets the chart frame opacity", min: 0, max: 1, dataName: "chartFrameOpacity", newCol: true },

                        { prompt: "Advanced:", tip: "Advanced shape properties" },
                        { col: 1, enumPicker: "Primitive:", tip: "Sets the drawing primitive used to draw shapes", dataName: "drawingPrimitive", enumType: bps.DrawPrimitive },
                        { col: 1, checkbox: "Continuous drawing", tip: "When true, drawing of frames will continue have plot has been completed", dataName: "isContinuousDrawing" },
                    ]
                },

                {
                    tabName: "UI", tip: "Settings for the Application Menus", rows:
                    [
                        { prompt: "Menus:", tip: "Change options for top-level menu items" },
                        { col: 1, checkbox: "Show text", tip: "Show the text associated with each menu item", dataName: "isMenuTextVisible" },
                        { col: 1, checkbox: "Show icons", tip: "Show the icons associated with each menu item", dataName: "isMenuIconVisible" },
                        { col: 1, checkbox: "Show chevrons", tip: "Show the chevrons associated with each menu item", dataName: "isMenuChevronVisible" },

                        { prompt: "Column picker:", tip: "Change options for the column picker control" },
                        { col: 1, checkbox: "Sort columns", tip: "Sort the columns in the column picker", dataName: "isColPickerSorted" },

                        { prompt: "Panels:", tip: "Parameters for panels" },
                        { col: 1, numAdjuster: "Panel opacity:", tip: "The opacity of panels", min: .4, max: 1, dataName: "panelOpacity", newCol: true },
                    ]
                },

                {
                    tabName: "Data", tip: "Options for data", rows:
                    [
                        { prompt: "File loading:", tip: "Parameters for loading data files" },
                        { col: 1, checkbox: "Cache local files", tip: "When user loads a local file, cache it in localstroage", dataName: "cacheLocalFiles" },
                        { col: 1, checkbox: "Cache web files", tip: "When user loads a web file, cache it in localstroage", dataName: "cacheWebFiles" },

                        { prompt: "Mapping:", tip: "Options for attribute mapping (Color, Size, Facets, X-Bins, Y-Bins)" },
                        { col: 1, checkbox: "Nice numbers", tip: "Adjust min/max/increment to use nice numbers", dataName: "useNiceNumbers" },

                        { col: 1, numAdjuster: "Default bins:", tip: "Set the default number of bins", min: 1, max: 99, roundValues: true, dataName: "defaultBins" },

                    ]
                },

                {
                    tabName: "Insights", tip: "Inight playback and other insight-related options", rows:
                    [
                        { prompt: "Insight playback:", tip: "Insight playback options" },
                        { col: 1, numAdjuster: "Duration:", tip: "Sets the duration of each insight during playback, in seconds", min: 0, max: 99, roundValues: false, dataName: "playbackDuration" },
                        { col: 1, checkbox: "Loop", tip: "When set to true, playback restarts after playing the last insight", dataName: "isPlaybackLooping" },
                    ]
                },

                {
                    tabName: "Startup", tip: "Controls initial settings for SandDance", rows:
                    [
                        { col: 1, checkbox: "Remember last file", tip: "Start with the last-used data file from the most recent SandDance session", dataName: "rememberLastFile" },
                        { col: 1, checkbox: "Remember last session", tip: "Start new SandDance sessions using the state from the previous session", dataName: "rememberLastSession" },
                        { col: 1, enumPicker: "Initial chart:", tip: "Sets the initial chart type to be used", dataName: "initialChartType", enumType: bps.ChartType },
                        { col: 1, enumPicker: "Initial layout:", tip: "Sets the initial laytout to be used", dataName: "initialLayout", enumType: bps.Layout },
                    ]
                },

                {
                    tabName: "Test", tip: "Internal testing tools for use by the SandDance development team", rows:
                    [

                        { prompt: "Testing:", tip: "Automated testing support" },
                        { col: 1, prompt: "Automated test:" },
                        { col: 2, text: "", tip: "Name of automated test to be run", dataName: "automatedTestName", readOnly: true, leftMargin: 20 },
                        { col: 3, button: "Load file", tip: "Load a test from a local file", dataName: "loadAutomatedTest", leftMargin: 20 },

                        { col: 1, button: "Start test", tip: "Start the SandDance automated test", dataName: "startAutomatedTest" },
                        { col: 2, button: "Stop test", tip: "Stop the SandDance automated test", dataName: "stopAutomatedTest", leftMargin: 20 },
                        { col: 1, button: "Plot results", tip: "Plot the data generated by the automated test", dataName: "plotTestResults" },
                    ]
                },

                {
                    tabName: "Debug", tip: "Internal settings for use by the SandDance development team", rows:
                    [
                        { prompt: "Info:", tip: "General debug support" },
                        { col: 1, checkbox: "Engine stats", tip: "Show chart engine stats info at top of chart", dataName: "isShowingChartStatus" },
                        { col: 1, checkbox: "Last cycle stats", tip: "Show summary of stats from last animation cycle", dataName: "isShowingLastCycle" },
                        { col: 1, checkbox: "Event stats", tip: "Show event attach/fire stats", dataName: "isShowingEventStats" },
                        { col: 1, checkbox: "Disable error reporting", tip: "Turn off display of errors in client UI", dataName: "isErrorReportingDisabled" },

                        { prompt: "Memory:", tip: "Memory usage information" },
                        { col: 1, button: "Plot memory use", tip: "Plot memory used by major engine objects", dataName: "plotEngineMemoryUse" },

                        { prompt: "Other:", tip: "Other debug-related controls" },
                        { col: 1, button: "Plot engine events", tip: "Plot the most recent engine trace events", dataName: "plotEngineEvents" },
                    ]
                },

                {
                    tabName: "Reset", tip: "Reset all application settings", rows:
                    [
                        { col: 1, button: "Reset app settings", tip: "Reset all application settings for current user", dataName: "resetSettingsAndReloadData" },
                    ]
                },

                {
                    tabName: "About", tip: "Information about the SandDance Application", rows:
                    [
                        { image: "Images/sanddance.png" },
                        { col: 1, prompt: "SandDance visualization prototype, Copyright (c) 2015, Microsoft Corporation.  All rights reserved." },
                        { col: 1, prompt: "" },
                        { col: 1, prompt: "For more infomation, email the <a class='panelLink' href='mailto:bpDiscuss@microsoft.com'>SandDance Discussion DL</a>.", isHtml: true },
                        { col: 1, prompt: "Brought to you by Steven M. Drucker, Roland Fernandez, and the extended SandDance team at Microsoft Research." },
                    ]
                },
            ]
        };
    }
}