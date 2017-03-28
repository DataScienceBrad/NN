/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 * MAQ Charts 
 */
/*JSHint Count = 0*/
function MAQDrawChart(DataStyle, settings, viewPort, valueFormatter) {
    //data binding        
    var dataView = DataStyle;
    var availWidth;
    var dataViewObject = Object.getPrototypeOf(dataView);
    var identifierX = 0, identifierY = 1;
    var oNormalizedData;
    if (DataStyle.metadata.columns[0] !== undefined && DataStyle.metadata.columns[0].roles.hasOwnProperty('yAxis') && DataStyle.metadata.columns[0].roles.hasOwnProperty('xAxis')) {
        identifierX = 0;
        identifierY = 0;
    }
    else if (DataStyle.metadata.columns[0] !== undefined && DataStyle.metadata.columns[1] !== undefined && DataStyle.metadata.columns[0].roles.hasOwnProperty('yAxis') && DataStyle.metadata.columns[1].roles.hasOwnProperty('xAxis')) {
        identifierX = 1;
        identifierY = 0;
    }
    else if (DataStyle.metadata.columns.length < 2) {
        return;
    }
    if (typeof dataViewObject.categorical.categories[identifierX].values[0] !== 'number' || typeof dataViewObject.categorical.categories[identifierY].values[0] !== 'number') {
        d3.select('#container').attr({"style":null});
        d3.select('#container').append('svg').attr({"width":viewPort.width,"height":viewPort.height})
        d3.select('svg').append('text').attr({"x":viewPort.width / 2 ,"y":viewPort.height / 2 ,"font-size":"20px","text-anchor":"middle"}).text("No data to display")   ;
        return;
    }
    //format options
    var configChange = settings;
    var config = {
        "chart": {
            "renderTo": "container",
            "isResponsive": true,
            "type": "histogram",
            "margin": [20, 20, 20, 20],
            "style": {
                "width": Math.max(document.documentElement.clientWidth, window.frames.innerWidth || 0) + "px",
                "height": Math.max(document.documentElement.clientHeight, window.frames.innerHeight || 0) + "px",
                "border": "0px solid silver"
            }
        },
        "title": {
            "align": "center",
            "text": "",
            "x": 0,
            "y": 0,
            "floating": false,
            "style": {
                "fill": "#777777",
                "fontSize": "24px",
                "fontFamily": "Segoe UI"
            }
        },
        "plotOptions": {
            "histogram": {
                "enabled": configChange.showPoints,
                "color": [configChange.pointColor],
                "xAxisLabelsCount": 7,
                "pointSize": 3,
                "consistentBubble": true,
                "radius": 1,
                "tooltip": {
                    "enabled": configChange.pointTooltip,
                    "customTooltip": null,
                    "changeBorderColor": true,
                    "style": {
                        "padding": "2px 5px",
                        "border": "2px solid silver",
                        "backgroundColor": "#fff",
                        "color": "#444",
                        "font": "14px \"Segoe UI\""
                    }
                }
            },
            "column": {
                "enabled": configChange.showBars,
                "padding": 5,
                "groupPadding": 2,
                "hover": {
                    "enabled": true,
                    "style": { "opacity": 0.8 }
                },
                "background": {
                    "enabled": false,
                    "color": '#EEEEEE'
                },
                "stacked": true,
                "multiColored": true,
                "color": [configChange.barColor],
                "opacity": 0.8,
                "borderColor": '',
                "borderRadius": 0,
                "borderWidth": 1,
                "borderDashStyle": '',
                "similarColor": false,
                "valueBox": {
                    "enabled": false,
                    "position": 'top',
                    "marginBottom": 0,
                    "formatter": null,
                    "style": {
                        "fill": '#444',
                        "fontSize": '14px',
                        "fontFamily": 'Segoe UI'
                    }
                },
                "tooltip": {
                    "enabled": configChange.barTooltip,
                    "customTooltip": null,
                    "changeBorderColor": true,
                    "style": {
                        "padding": "2px 5px",
                        "border": "2px solid silver",
                        "backgroundColor": "#fff",
                        "color": "#444",
                        "font": "14px \"Segoe UI\""
                    }
                }
            }
        },
        "xAxis": {
            "title": {
                "enabled": configChange.showxAxisTitle,
                "align": "center",
                "text": configChange.xTitleText,
                "style": {
                    "fill": "#777777",
                    "fontSize": "12px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "labels": {
                "enabled": configChange.showxAxisLabel,
                "align": "center",
                "series": [],
                "formatter": "scaleFormatter",
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "#777777",
                    "fontSize": "12px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 8,
            "gridLineWidth": 1,
            "gridLineColor": "silver",
            "gridLineDashStyle": "shortdash",
            "lineColor": "silver",
            "lineWidth": 1,
            "tickWidth": 0,
            "tickHeight": 0,
            "tickColor": "silver",
            "tickPosition": "outside",
            "labelSpacing": 5,
            "shiftStartBy": 0,
            "skipInterval": 0,
            "alternateGridColor": "",
            "usageWidth": 90
        },
        "yAxis":
         {
             "dualAxisEnabled": "true",
             "title":
             {
                 "text": "true"
             },
             "dualyAxis": {
                 "axisLeft":
                 {
                     "title": {
                         "enabled": configChange.showyAxisLeftTitle,
                         "align": "center",
                         "text": configChange.yTitleTextLeft,
                         "style": {
                             "fill": "#777777",
                             "fontSize": "12px",
                             "fontFamily": "Segoe UI"
                         },
                         "x": 0,
                         "y": 0
                     },
                     "labels": {
                         "enabled": configChange.showyAxisLeftLabel,
                         "align": "right",
                         "series": [],
                         "formatter": "scaleFormatter",
                         "staggerLines": false,
                         "rotation": 0,
                         "style": {
                             "fill": "#777777",
                             "fontSize": "12px",
                             "fontFamily": "Segoe UI"
                         },
                         "x": 0,
                         "y": 0
                     },
                     "numberOfGridLines": 8,
                     "gridLineWidth": 1,
                     "gridLineColor": "silver",
                     "gridLineDashStyle": "shortdash",
                     "lineWidth": 1,
                     "lineColor": "silver",
                     "tickWidth": 0,
                     "tickHeight": 0,
                     "tickPosition": "onaxis",
                     "tickColor": "silver",
                     "labelSpacing": 5,
                     "shiftStartBy": 0,
                     "skipInterval": 0,
                     "alternateGridColor": ""
                 },
                 "axisRight":
                     {
                         "title": {
                             "enabled": configChange.showyAxisRightTitle,
                             "align": "center",
                             "text": configChange.yTitleTextRight,
                             "style": {
                                 "fill": "#777777",
                                 "fontSize": "12px",
                                 "fontFamily": "Segoe UI"
                             },
                             "x": 7,
                             "y": 0
                         },
                         "labels": {
                             "enabled": configChange.showyAxisRightLabel,
                             "align": "right",
                             "series": [],
                             "formatter": "scaleFormatter",
                             "staggerLines": false,
                             "rotation": 0,
                             "style": {
                                 "fill": "#777777",
                                 "fontSize": "12px",
                                 "fontFamily": "Segoe UI"
                             },
                             "x": 0,
                             "y": 0
                         },
                         "numberOfGridLines": 8,
                         "gridLineWidth": 1,
                         "gridLineColor": "silver",
                         "gridLineDashStyle": "shortdash",
                         "lineWidth": 1,
                         "lineColor": "silver",
                         "tickWidth": 0,
                         "tickHeight": 0,
                         "tickPosition": "onaxis",
                         "tickColor": "silver",
                         "labelSpacing": 5,
                         "shiftStartBy": 0,
                         "skipInterval": 0,
                         "alternateGridColor": ""
                     },
                 "numberOfGridLines": 8,
                 "gridLineWidth": 1,
                 "gridLineColor": "silver",
                 "gridLineDashStyle": "shortdash",
                 "lineWidth": 1,
                 "lineColor": "silver",
                 "tickWidth": 5,
                 "tickHeight": 5,
                 "tickPosition": "onaxis",
                 "tickColor": "silver",
                 "labelSpacing": 5,
                 "shiftStartBy": 0,
                 "skipInterval": 0,
                 "alternateGridColor": "",
             }
         },

        "tooltip": {
            "enabled": true,
            "customTooltip": null,
            "style": {
                "padding": "2px 5px",
                "border": "2px solid silver",
                "backgroundColor": "#fff",
                "color": "#444",
                "font": "14px \"Segoe UI\""
            }
        },
        "fixedWidth": 0,
        "series": [
        {
            "data": {
                "scaleX": dataViewObject.categorical.categories[identifierX].values,
                "scaleY": dataViewObject.categorical.categories[identifierY].values,
                "frequency":
                    {
                        "data": []
                    }

            }
        }
        ]
    };
    var marginRatio = 16;
    var width = Math.max(document.documentElement.clientWidth, window.frames.innerWidth || 0);
    var height = Math.max(document.documentElement.clientHeight, window.frames.innerHeight || 0);
    config.chart.margin[0] = height / marginRatio; //Top
    config.chart.margin[1] = width / marginRatio; //Right
    config.chart.margin[2] = height / marginRatio; //Bottom
    config.chart.margin[3] = width / marginRatio; //Left
    var xAxisName = dataView.metadata.columns[identifierX].displayName, yAxisName = dataView.metadata.columns[identifierY].displayName;


    //grid lines
    if ((!configChange.showGridLines) || (!configChange.showxAxisGridLines && !configChange.showyAxisGridLines)) {
        config.xAxis.gridLineWidth = 0;
        config.yAxis.dualyAxis.gridLineWidth = 0;
    }
        //for same column in both X data and Y data
    else if (!configChange.showxAxisGridLines) {
        config.xAxis.gridLineWidth = 0;
    }
    else if (!configChange.showyAxisGridLines) {
        config.yAxis.dualyAxis.gridLineWidth = 0;
    }
    if (!(dataViewObject && dataViewObject.categorical && dataViewObject.categorical.categories && dataViewObject.categorical.categories.length > 0)) {
        return;
    }
    if (dataViewObject.categorical.categories.length > 0 && dataViewObject.categorical.categories[0].values && dataViewObject.categorical.categories[identifierX].values.length === 0
       && dataViewObject.categorical.categories[identifierY].values.length == 0) {
        d3.select('#container').append('svg').attr({"width":viewPort.width,"height":viewPort.height});
        d3.select('svg').append('text').attr({"x":viewPort.width / 2 ,"y":viewPort.height / 2 ,"font-size":"20px","text-anchor":"middle"}).text("No data to display")   ;
        return;
    }
    var xAxisFormat = dataView.metadata.columns[identifierX].format;
    var yAxisFormat = dataView.metadata.columns[identifierY].format;
    var xFormatter = valueFormatter.create({ format: dataView.metadata.columns[identifierX].format });
    var yFormatter = valueFormatter.create({ format: dataView.metadata.columns[identifierY].format });
    (function (config) {
        /*jslint white: true, devel:true, browser: true, this:true, for:true  */
        /*global MAQ, window,oDimensionTotalTitle,oGrpELESum,oData*/
        /*Create the MAQ Object*/
        var MAQ = {};
        function clone(obj) {
            'use strict';
            // Handle the 3 simple types, and null or undefined
            if (null === obj || 'object' !== typeof obj) {
                return obj;
            }
            var copy, len, iCounter = 0, attr;
            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                len = obj.length;
                for (iCounter = 0; iCounter < len; iCounter += 1) {
                    copy[iCounter] = clone(obj[iCounter]);
                }
                return copy;
            }
            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                Object.keys(obj).forEach(function (attr) {
                    copy[attr] = clone(obj[attr]);
                });
                return copy;
            }
            throw new Error('Unable to copy obj! Its type isn\'t supported.');
        }
        /*
         * MAQ.utils: MAQ chart utility functions
         */
        if (undefined === MAQ.utils) {
            MAQ.utils = {};
        }
        MAQ.utils.clone = clone;
        MAQ.utils.isNumber = function (fNumber) {
            'use strict';
            return !isNaN(parseFloat(fNumber)) && isFinite(fNumber);
        };
        MAQ.utils.getTextDim = function (sText, oStyle, chartConfigOptions) {
            'use strict';
            var oAttr = {
                x: 10,
                y: 10,
                text: sText,
                style: oStyle
            }, oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr), oDim;
            chartConfigOptions.svgELE.appendChild(oText);
            oDim = MAQ.getObjectDimension(oText);
            chartConfigOptions.svgELE.removeChild(oText);
            return oDim;
        };
        MAQ.utils.getMultiLineSVGText = function (sSvgNS, oChartRoot, sText, oTextAttr, maxChars, iData) {
            'use strict';
            var sTextItem, iDy = 0, iLineSpacing = 0, sTextKey, oTextGrp = MAQ.createSVGElement(sSvgNS, 'g', {}), iMaxWidth = 0, iSignX = 1, iSignY = -1, iOffsetX = 0, iTotalHeight = 0, iDeltaX = 15,
              //**Convert Text into multiline array**//
              sTexts = [], iLastIndex = 0, iTextLen = sText.length, sTempText, i;
            while (true) {
                if (sText.length <= maxChars) {
                    sTexts.push(sText + ' : ' + (iData || ''));
                    break;
                }
                sTempText = sText.substr(iLastIndex, maxChars);
                i = Math.max(sTempText.lastIndexOf(','), sTempText.lastIndexOf(' '), sTempText.lastIndexOf('.'), sTempText.lastIndexOf(';'));
                if (i <= 0) {
                    i = maxChars;
                }
                sTexts.push(sText.substr(iLastIndex, i + 1));
                iLastIndex += i + 1;
                if (iLastIndex >= iTextLen) {
                    sTexts[sTexts.length - 1] = sTexts[sTexts.length - 1] + ' : ' + (iData || '');
                    break;
                }
            }
            //**Create the multiline text SVG**//
            Object.keys(sTexts).forEach(function (sTextKey) {
                sTextItem = MAQ.utils.getTextDim(sTexts[sTextKey], oTextAttr.style || {}, {
                    svgNS: sSvgNS,
                    svgELE: oChartRoot
                });
                iDy = sTextItem.height + iLineSpacing;
                iMaxWidth = Math.max(iMaxWidth, sTextItem.width);
                oTextAttr.text = sTexts[sTextKey];
                oTextAttr.y += iDy;
                iTotalHeight += iDy;
                oTextGrp.appendChild(MAQ.createSVGElement(sSvgNS, 'text', oTextAttr));
            });
            if (-iDeltaX < oTextAttr.x && oTextAttr.x < iDeltaX) {
                iSignX = -0.5;
                iSignY = 0;
            } else if (oTextAttr.x < -iDeltaX) {
                iSignX = -1;
                iOffsetX = -6;
            } else {
                iSignX = 0;
                iOffsetX = 6;
            }
            MAQ.addAttr(oTextGrp, 'transform', 'matrix(1 0 0 1 ' + (iSignX * iMaxWidth + iOffsetX) + ' ' + iSignY * iTotalHeight / 2 + ')');
            return oTextGrp;
        };
        MAQ.utils.isSafe = function (literalToCheck) {
            'use strict';
            if (!literalToCheck) {
                return false;
            }
            return true;
        };
        /*
           pivotArray: Performs a matrix transpose style tranformation
           @param {arr} 2D array to be pivoted
         */
        MAQ.utils.pivotArray = function (arr) {
            'use strict';
            //return if the passed array is not 2D
            if (!('[object Array]' === Object.prototype.toString.call(arr) && '[object Array]' === Object.prototype.toString.call(arr[0]))) {
                console.log('Passed argument is not a 2D array');
                return;
            }
            var pivotArr = [], iRows = arr.length, iCols = arr[0].length, iCount, jCount;
            for (iCount = 0; iCount < iCols; iCount += 1) {
                pivotArr[iCount] = [];
                for (jCount = 0; jCount < iRows; jCount += 1) {
                    pivotArr[iCount].push(arr[jCount][iCount]);
                }
            }
            return pivotArr;
        };
        /*
           toLinear: Converts a 2D array into 1D array
           @param {arr} 2D array to be convert
         */
        MAQ.utils.toLinear = function (arr) {
            'use strict';
            //return if the passed array is not 2D
            if (!('[object Array]' === Object.prototype.toString.call(arr) && '[object Array]' === Object.prototype.toString.call(arr[0]))) {
                console.log('Passed argument is not a 2D array');
                return;
            }
            var linearArr = [], iCount;
            for (iCount = 0; iCount < arr.length; iCount += 1) {
                linearArr = linearArr.concat(arr[iCount]);
            }
            return linearArr;
        };
        MAQ.utils.formatters = {
            trimText: function (sInput) {
                'use strict';
                if (sInput.length >= 13) {
                    sInput = sInput.substring(0, 9) + '...';
                }
                return sInput;
            },
            /*
              insertCommas: Formats the number in comma separator format ($ x,xxx,xxx.xx)
              @param {sInput} number to be formatted
              @param {iDecimalPlace} number to decimal values to be shown
              */
            insertCommas: function (sInput, iDecimalPlaces) {
                'use strict';
                if (0 === parseFloat(sInput)) {
                    return '0';
                }
                if (!sInput || isNaN(sInput)) {
                    return 'N/A';
                }
                // Check for validity of decimal places parameter
                if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
                    iDecimalPlaces = 0;  // Default value is 0
                }
                var fTempValue = parseFloat(sInput), sTempValue = fTempValue.toString(), aDigits, rPattern, sIntegerDigits, sFractionDigits, decimalLength;
                if (-1 !== sTempValue.indexOf('.')) {
                    decimalLength = sTempValue.substring(sTempValue.indexOf('.') + 1).length;
                    if (iDecimalPlaces < decimalLength) {
                        sTempValue = fTempValue.toFixed(iDecimalPlaces).toString();
                    }
                }
                aDigits = sTempValue.split('.');
                sIntegerDigits = aDigits[0];
                sFractionDigits = aDigits.length > 1 ? '.' + aDigits[1] : '';
                sIntegerDigits = sIntegerDigits.toString();
                rPattern = /(\d+)(\d{3})/;
                while (rPattern.test(sIntegerDigits)) {
                    sIntegerDigits = sIntegerDigits.replace(rPattern, '$1' + ',' + '$2');
                }
                return sIntegerDigits + sFractionDigits;
            },
            addPercent: function (sInput, iDecimalPlaces) {
                'use strict';
                if (0 === parseFloat(sInput)) {
                    return '0%';
                }
                if (!sInput || isNaN(parseFloat(sInput))) {
                    return 'N/A';
                }
                if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
                    iDecimalPlaces = 1;  // Default value is 1
                }
                return MAQ.utils.formatters.insertCommas(sInput, iDecimalPlaces) + '%';
            },
            /*
              scaleFormatter: Formats the number in K, M, B form (x.xxM)
              @param {sInput} number to be formatted
              @param {iDecimalPlace} number to decimal values to be shown
              */
            scaleFormatter: function (sInput, iDecimalPlaces) {
                'use strict';
                //TODO: Add trillion data formatter also
                if (0 === parseFloat(sInput)) {
                    return '0';
                }
                if (!sInput || typeof parseFloat(sInput) !== "number") {
                    return 'N/A';
                }
                var fTempValue = parseFloat(sInput), sTempValue, aDigits, iTempValue, rPattern, sCurrency, sIntegerDigits, sFractionDigits, decimalLength;
                if (fTempValue < 0) {
                    sInput = -1 * fTempValue;
                } else {
                    sInput = fTempValue;
                }
                // Check for validity of decimal places parameter
                if (!iDecimalPlaces || typeof iDecimalPlaces !== "number") {
                    iDecimalPlaces = 0;  // Default value is 0
                }
                sTempValue = sInput.toString();
                if (-1 !== sTempValue.indexOf('.')) {
                    decimalLength = sTempValue.substring(sTempValue.indexOf('.') + 1).length;
                    if (decimalLength < 2) {
                        iDecimalPlaces = decimalLength;
                    }
                    else {
                        iDecimalPlaces = 2;
                    }
                    sTempValue = sInput.toFixed(iDecimalPlaces).toString();
                }
                aDigits = sTempValue.split('.');
                sIntegerDigits = aDigits[0];
                sFractionDigits = aDigits.length > 1 ? '.' + aDigits[1] : '';
                // Converting thousand to M
                iTempValue = parseInt(sIntegerDigits, 10);
                sCurrency = '';
                if (iTempValue >= 1000000000) {
                    sIntegerDigits = iTempValue / 1000000000;
                    sCurrency = 'B';
                    sFractionDigits = '';
                    sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
                } else if (iTempValue < 1000000000 && iTempValue >= 1000000) {
                    sIntegerDigits = iTempValue / 1000000;
                    sCurrency = 'M';
                    sFractionDigits = '';
                    sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
                } else if (iTempValue < 1000000 && iTempValue >= 1000) {
                    sIntegerDigits = iTempValue / 1000;
                    sCurrency = 'K';
                    sFractionDigits = '';
                    sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
                }
                rPattern = /(\d+)(\d{3})/;
                while (rPattern.test(sIntegerDigits)) {
                    sIntegerDigits = sIntegerDigits.replace(rPattern, '$1' + ',' + '$2');
                }
                return (fTempValue < 0 ? '-' : '') + sIntegerDigits + sFractionDigits + sCurrency;
            },
            revenueFormatter: function (sInput, iDecimalPlaces) {
                'use strict';
                if (0 === parseFloat(sInput)) {
                    return '$0';
                }
                if (!sInput || isNaN(sInput)) {
                    return 'N/A';
                }
                // Check for validity of decimal places parameter
                if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
                    if (iDecimalPlaces !== 0) {
                        iDecimalPlaces = 2;  // Default value is 0
                    }
                }
                var sTempValue = MAQ.utils.formatters.scaleFormatter(sInput, iDecimalPlaces);
                return parseFloat(sTempValue) < 0 ? '-$' + sTempValue.substr(1) : '$' + sTempValue;
            }
        };
        /*
         * MAQ.styles: MAQ charts style Object
         */
        MAQ.styles = {
            //id of the dynamic style sheet
            styleSheetName: 'MAQCharts-Style-Sheet',
            //reference to the MAQcharts style tag
            styleTag: null,
            //track of whether style tag was created or not
            isInitialized: false,
            rules: [],
            /*
               * initStyles: adds the MAQcharts style tag to the document head and sets isInitialized to true
               */
            initStyles: function () {
                'use strict';
                if (this.isInitialized) {
                    return this.styleTag;
                }
                //get ref to document head
                var head = document.head || document.getElementsByTagName('head')[0],
                  //create the style tag
                  style = document.createElement('style');
                //set style type and id
                style.type = 'text/css';
                style.id = this.styleSheetName;
                //append style to head
                head.appendChild(style);
                this.styleTag = style;
                this.isInitialized = true;
                return this.styleTag;
            },
            /*
               * removeStyles: removes the MAQcharts style tag to the document head and sets isInitialized to false
               */
            removeStyles: function () {
                'use strict';
                if (!this.isInitialized) {
                    return;
                }
                var head = document.head || document.getElementsByName('head')[0];
                head.removeChild(this.styleTag);
                this.isInitialized = false;
                this.styleTag = null;
            },
            /*
               * addRule: adds a style rule to the MAQcharts style sheet
               * @param {selector}: the CSS selector to add the styles to
               * @param {rule}: the CSS rules separated by semicolon
               */
            addRule: function (selector, rule) {
                'use strict';
                //if selector already exists in styles then return to avoid duplicate rules
                if (undefined !== this.rules[selector]) {
                    return;
                }
                var styleTag, sheet, iRuleLength;
                if (!this.isInitialized) {
                    this.initStyles();
                }
                styleTag = this.styleTag;
                sheet = styleTag.sheet || styleTag.styleSheet;
                iRuleLength = sheet.cssRules ? sheet.cssRules.length : sheet.rules.length;
                // add a new rule to the style sheet
                if (sheet.insertRule) {
                    sheet.insertRule(selector + '{' + rule + '}', iRuleLength);
                } else {
                    sheet.addRule(selector, rule);
                }
                //add the selector to tracker
                this.rules[selector] = 1;
            },
            /*
               * jsonToRule: converts a json string or object to semicolon separated css rules
               * @param {sJson}: the CSS rules in json string or object form
               */
            jsonToRule: function (sJson) {
                'use strict';
                var oJson, rule = '', key;
                if ('string' === typeof sJson) {
                    oJson = JSON.parse(sJson);
                } else {
                    //else assume it is an Object
                    oJson = sJson;
                }

                Object.keys(oJson).forEach(function (key) {
                    rule += key + ':' + oJson[key] + ';';
                });
                return rule;
            },
            /*
               * addClass: adds css class to specified object or array of objects
               * @param {oElements}: array of elements or a single element on which class has to be added
               * @param {sClass}: the class to be added
               */
            addClass: function (oElements, sClass) {
                'use strict';
                if (!oElements) {
                    return;
                }
                function add_Class(oEle) {
                    if (!oEle) {
                        return;
                    }
                    var sClasses = oEle.getAttribute('class');
                    if (oEle.classList && oEle.classList.add) {
                        oEle.classList.add(sClass);
                    } else if (!sClasses) {
                        oEle.setAttribute('class', sClass);
                    } else if (-1 === sClasses.indexOf(sClass)) {
                        sClasses += ' ' + sClass;
                        oEle.setAttribute('class', sClasses);
                    }
                }
                var iCount = 0, iLen;
                if (oElements.length > 0) {
                    iLen = oElements.length;
                    for (iCount = 0; iCount < iLen; iCount += 1) {
                        add_Class(oElements[iCount]);
                    }
                } else if (undefined === oElements.length) {
                    add_Class(oElements);
                }
            },
            /*
               * addClass: removes css class from specified object or array of objects
               * @param {oElements}: array of elements or a single element from which class has to be removed
               * @param {sClass}: the class to be removed
               */
            removeClass: function (oElements, sClass) {
                'use strict';
                if (!oElements) {
                    return;
                }
                function remove_class(oEle) {
                    var sClasses = oEle.getAttribute('class');
                    if (oEle.classList && oEle.classList.add) {
                        oEle.classList.remove(sClass);
                        return;
                    }
                    if (!sClasses || -1 === sClasses.indexOf(sClass)) {
                        return;
                    }
                    sClasses = sClasses.replace(new RegExp(sClass + 's?', 'g'), '');
                    oEle.setAttribute('class', sClasses);
                }
                var iCount = 0, iLen;
                if (oElements.length > 0) {
                    iLen = oElements.length;
                    for (iCount = 0; iCount < iLen; iCount += 1) {
                        remove_class(oElements[iCount]);
                    }
                } else if (undefined === oElements.length) {
                    remove_class(oElements);
                }
            }
        };
        /*
        MAQ.charts: Take config from user and call to chart rendering functions
        @param {chartConfigOptions} User configuration
        */
        MAQ.charts = function (chartConfigOptions) {
            'use strict';
            var x, sResult, oTreemapOptions, oToolTip, oTTStyle, self;
            this.chartOptions = {
                chart: {
                    renderTo: '',
                    type: '',
                    margin: [5],
                    isResponsive: false,
                    style: {
                        width: '500px',
                        height: '500px'
                    }
                },
                title: {
                    align: 'left',
                    text: '',
                    floating: false,
                    x: 0,
                    y: 0,
                    style: {}
                },
                plotOptions: {
                    colors: [
                      '#DDDF0D',
                      '#7798BF',
                      '#55BF3B',
                      '#DF5353',
                      '#aaeeee',
                      '#ff0066',
                      '#eeaaee',
                      '#55BF3B',
                      '#DF5353',
                      '#7798BF',
                      '#aaeeee'
                    ],
                    pattern: [''],
                    column: {
                        padding: 5,
                        groupPadding: 2,
                        hover: {
                            enabled: true,
                            style: { opacity: 0.8 }
                        },
                        background: {
                            enabled: false,
                            color: '#EEEEEE'
                        },
                        stacked: true,
                        multiColored: true,
                        drill: false,
                        drillSeparatorColor: '#DBDBDB',
                        drillSeparatorWidth: 1.5,
                        drillSeparatorStyle: '4, 1',
                        drillColor: [],
                        color: [],
                        opacity: 0.8,
                        borderColor: '',
                        borderRadius: 0,
                        borderWidth: 1,
                        borderDashStyle: '',
                        similarColor: false,
                        valueBox: {
                            enabled: false,
                            position: 'top',
                            marginBottom: 0,
                            formatter: null,
                            style: {
                                fill: '#444',
                                fontSize: '14px',
                                fontFamily: 'Segoe UI'
                            }
                        }
                    },
                    histogram: {
                        color: [
                          '#0066CC',
                          '#CC0000',
                          '#75962A',
                          '#4572a7',
                          '#aa4643',
                          '#89a54e',
                          '#80699b',
                          '#3d96ae',
                          '#db843d'
                        ]
                    },
                },
                legend: {
                    enabled: true,
                    enableClick: true,
                    align: 'center',
                    verticalAlign: 'bottom',
                    verticalAlignLegend: false,
                    borderColor: 'silver',
                    borderStyle: '',
                    borderWidth: 1,
                    borderRadius: 5,
                    layout: 'horizontal',
                    floating: false,
                    symbolWidth: 11,
                    symbolHeight: 11,
                    symbolPadding: 5,
                    symbolRadius: 3,
                    individualDistance: 5,
                    lineHeight: 3,
                    customOrder: [],
                    hover: {
                        enabled: true,
                        staticTooltip: false,
                        style: { 'stroke-width': '3px' },
                        counterStyle: { opacity: 0.3 },
                        chartStyle: {
                            opacity: 1,
                            'stroke-width': '2px'
                        },
                        counterChartStyle: { opacity: 0.2 }
                    },
                    style: {
                        fill: '#444',
                        fontSize: '14px',
                        fontFamily: 'Segoe UI'
                    },
                    labelFormat: 1,
                    enableTextClipping: false,
                    clipTextFrom: 'left',
                    clippedTextLength: 10,
                    x: 0,
                    y: 0
                },
                events: {
                    onAnimationComplete: null,
                    onTimelineUpdate: null,
                    onNavigatorMove: null
                },
                xAxis: {
                    title: {
                        align: 'left',
                        text: '',
                        style: {},
                        x: 0,
                        y: 0
                    },
                    labels: {
                        enabled: true,
                        align: 'center',
                        series: [],
                        formatter: null,
                        staggerLines: false,
                        rotation: 0,
                        style: {},
                        x: 0,
                        y: 0
                    },
                    dualxAxis: [
                      {
                          labels: { style: {} },
                          title: {
                              text: '',
                              style: {},
                              x: 0,
                              y: 0
                          }
                      },
                      {
                          title: {
                              text: '',
                              style: {},
                              x: 0,
                              y: 0
                          },
                          labels: {
                              enabled: true,
                              align: 'left',
                              series: [],
                              formatter: null,
                              staggerLines: false,
                              rotation: 0,
                              style: {},
                              x: 0,
                              y: 0
                          }
                      }
                    ],
                    dualAxisEnabled: false,
                    numberOfGridLines: 10,
                    lineWidth: 0,
                    lineColor: 'silver',
                    gridLineWidth: 1,
                    gridLineColor: 'silver',
                    gridLineDashStyle: 'solid',
                    tickWidth: 5,
                    tickHeight: 1,
                    tickColor: 'silver',
                    tickPosition: 'onAxis',
                    labelSpacing: 3,
                    shiftStartBy: 0,
                    skipInterval: 0,
                    alternateGridColor: null,
                    usageWidth: 100
                },
                yAxis: {
                    title: {
                        align: 'left',
                        text: '',
                        style: {},
                        x: 0,
                        y: 0
                    },
                    labels: {
                        enabled: true,
                        align: 'right',
                        staggerLines: false,
                        series: [],
                        formatter: null,
                        rotation: 0,
                        style: {},
                        x: 0,
                        y: 0
                    },
                    dualyAxis: {
                        axisLeft: {
                            title: {
                                align: 'left',
                                text: '',
                                style: {},
                                x: 0,
                                y: 0
                            },
                            labels: {
                                enabled: true,
                                align: 'right',
                                staggerLines: false,
                                series: [],
                                formatter: null,
                                rotation: 0,
                                style: {},
                                x: 0,
                                y: 0
                            }
                        },
                        axisRight: {
                            title: {
                                align: 'left',
                                text: '',
                                style: {},
                                x: 0,
                                y: 0
                            },
                            labels: {
                                enabled: true,
                                align: 'right',
                                staggerLines: false,
                                series: [],
                                formatter: null,
                                rotation: 0,
                                style: {},
                                x: 0,
                                y: 0
                            }
                        }
                    },
                    dualAxisEnabled: false,
                    minVal: null,
                    maxVal: null,
                    numberOfGridLines: 10,
                    lineWidth: 0,
                    lineColor: 'silver',
                    gridLineWidth: 1,
                    gridLineColor: 'silver',
                    gridLineDashStyle: 'solid',
                    tickWidth: 5,
                    tickHeight: 1,
                    tickColor: 'silver',
                    tickPosition: 'onAxis',
                    labelSpacing: 3,
                    shiftStartBy: 0,
                    skipInterval: 0,
                    alternateGridColor: null
                },
                tooltip: {
                    enabled: true,
                    changeBorderColor: true,
                    seriesLevelTooltip: false,
                    customTooltip: null,
                    style: {
                        'border-color': 'silver',
                        'font-size': '10px',
                        'font-family': 'Segoe UI'
                    }
                },
                onClick: {
                    enabled: false,
                    clickFunction: null
                },
                median: { enabled: true },
                series: [],
                animation: {
                    enabled: true,
                    type: 1
                }
            };
            /* Copy configuration parameters */
            self = this;
            Object.keys(chartConfigOptions).forEach(function (x) {
                MAQ.mergeObjects(x, self.chartOptions, chartConfigOptions);
            });
            /* Validate Important Options */
            sResult = MAQ.validateOptions(this.chartOptions);
            if (!sResult) {
                this.chartOptions.svgNS = 'http://www.w3.org/2000/svg';
                this.chartOptions.xlinkNS = 'http://www.w3.org/1999/xlink';
                this.chartOptions.availX = 0;
                this.chartOptions.availY = 0;
                this.chartOptions.availWidth = 0;
                this.chartOptions.availHeight = 0;
                this.chartOptions.useFullXAxis = [
                  'line',
                  'area',
                  'bubble',
                  'combolinecolumn',
                  'histogram'
                ];
                MAQ.createSVGDoc(this.chartOptions);
                //Create SVG document
                MAQ.drawChartTitle(this.chartOptions);
                //Draw chart title
                /* Chart differntiator */
                switch (this.chartOptions.chart.type.toLowerCase()) {
                    case 'histogram':
                        MAQ.createHistogramChart(this.chartOptions);
                        break;
                }
            }
            else {
                alert(sResult);
                return false;
            }
        };
        /*
        MAQ.validateDirectSeriesColor: Validated the color for all the charts
        @param {chartConfigOptions} user configuration parameters
        @param (inData) to specify whether data values are in data object
        */
        MAQ.validateDirectSeriesColor = function (chartConfigOptions, inData) {
            'use strict';
            var iCount, arrColor, iColorLength, iSeriesLength, iLine, iBar, legendColor = [], arrTempColorSeries = [], tempSeries, lineCount = 0, iTempSeries, barCount = 0;
            if (chartConfigOptions.chart.type === 'lift') {
                arrColor = chartConfigOptions.plotOptions.line.color;
            } else {
                arrColor = chartConfigOptions.plotOptions[chartConfigOptions.chart.type].color;
            }
            iColorLength = arrColor.length;
            /* Validating the color for Combo Line Column Chart */
            if ('combolinecolumn' === chartConfigOptions.chart.type) {
                tempSeries = chartConfigOptions.series;
                for (iTempSeries = 0; iTempSeries < tempSeries.length; iTempSeries += 1) {
                    if ('line' === tempSeries[iTempSeries].type) {
                        lineCount += 1;
                    } else {
                        barCount += 1;
                    }
                }
                if (chartConfigOptions.plotOptions.combolinecolumn.line.color.length < lineCount) {
                    arrColor = chartConfigOptions.plotOptions.combolinecolumn.line.color;
                    iColorLength = arrColor.length;
                    for (iCount = 0; iCount < lineCount; iCount += 1) {
                        arrTempColorSeries.push(arrColor[iCount % iColorLength]);
                    }
                    chartConfigOptions.plotOptions.combolinecolumn.line.color = arrTempColorSeries;
                }
                if (chartConfigOptions.plotOptions.combolinecolumn.column.color.length < barCount) {
                    arrColor = chartConfigOptions.plotOptions.combolinecolumn.column.color;
                    iColorLength = arrColor.length;
                    //empty the array
                    arrTempColorSeries = [];
                    for (iCount = 0; iCount < barCount; iCount += 1) {
                        arrTempColorSeries.push(arrColor[iCount % iColorLength]);
                    }
                    chartConfigOptions.plotOptions.combolinecolumn.column.color = arrTempColorSeries;
                }
                /* Filling the legend color */
                iLine = 0;
                iBar = 0;
                tempSeries = chartConfigOptions.series;
                for (iTempSeries = 0; iTempSeries < tempSeries.length; iTempSeries += 1) {
                    if ('line' === tempSeries[iTempSeries].type) {
                        iLine += 1;
                        legendColor[iTempSeries] = chartConfigOptions.plotOptions.combolinecolumn.line.color[iLine];
                    } else {
                        iBar += 1;
                        legendColor[iTempSeries] = chartConfigOptions.plotOptions.combolinecolumn.column.color[iBar];
                    }
                }
                chartConfigOptions.plotOptions.combolinecolumn.color = legendColor;
                chartConfigOptions.plotOptions.combolinecolumn.line.color = legendColor;
                if (!chartConfigOptions.plotOptions.combolinecolumn.column.multiColored) {
                    chartConfigOptions.plotOptions.combolinecolumn.column.color = legendColor;
                }
                return;
            }
            /* Validating the color for all other charts */
            /* Variable: inData is used to specify whether data values are in data object */
            if (!inData) {
                iSeriesLength = chartConfigOptions.series.length;
            } else {
                iSeriesLength = chartConfigOptions.series[0].data.length;
            }
            if (iColorLength < iSeriesLength) {
                for (iCount = 0; iCount < iSeriesLength; iCount += 1) {
                    arrTempColorSeries.push(arrColor[iCount % iColorLength]);
                }
                chartConfigOptions.plotOptions[chartConfigOptions.chart.type].color = arrTempColorSeries;
            }
        };
        /*
        MAQ.validateOptions: Validates configuration parameter passed by user
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.validateOptions = function (chartConfigOptions) {
            'use strict';
            if (!chartConfigOptions.chart.renderTo) {
                return 'Provide an ID of element to render chart.';
            }
            var containerElement = document.getElementById(chartConfigOptions.chart.renderTo), oBowTie, oBranch, oYAxis, oXAxis;
            if (!containerElement) {
                return 'Invalid ID to render chart.';
            }
            chartConfigOptions.container = containerElement;
            if (!chartConfigOptions.chart.type) {
                return 'Kindly specify the type of chart to render.';
            }
            switch (chartConfigOptions.chart.type.toLowerCase()) {
                case 'line':
                case 'lift':
                case 'bubble':
                case 'histogram':
                case 'area':
                case 'spiderweb':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, false);
                    if (!chartConfigOptions.series.length) {
                        return 'Require atleast 1 series to plot the chart';
                    }
                    break;
                case 'column':
                case 'bar':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, true);
                    if (!chartConfigOptions.series.length) {
                        return 'Require atleast 1 series to plot the chart';
                    }
                    break;
                case 'pie':
                case 'donut':
                case 'gauge':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, false);
                    break;
                case 'combolinecolumn':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, false);
                    break;
                case 'funnel':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, false);
                    if (!chartConfigOptions.series.length) {
                        return 'Require atleast 1 series to plot the chart';
                    }
                    break;
                case 'stock':
                    break;
                case 'bowtie':
                    if (!chartConfigOptions.series.length || chartConfigOptions.series.length !== 2) {
                        return 'Require two different series to plot the chart';
                    }
                    oBowTie = chartConfigOptions.plotOptions.bowtie;
                    oBranch = oBowTie.branch;
                    if (oBranch.drillDepenedency === 'independent' || oBranch.drillDepenedency === 'dependent') {
                        if (oBranch.drillDepenedency === 'dependent') {
                            if (!oBranch.drillDepenedency || (oBranch.drillDepenedency && typeof window[oBranch.drillFunction] !== 'function')) {
                                return 'Value in drillDependency is not a valid function';
                            }
                        }
                    } else {
                        return 'Not a valid dependency type';
                    }
                    if (!(oBowTie.branch.left.fieldName && oBowTie.branch.right.fieldName)) {
                        return 'Field name for both left and right bow is required';
                    }
                    if (oBowTie.label.left.enabled) {
                        if (oBowTie.label.left.header.length !== oBowTie.label.left.colModel.length) {
                            return 'Number of columns does not match with number of headers for left branch';
                        }
                    }
                    if (oBowTie.label.right.enabled) {
                        if (oBowTie.label.right.header.length !== oBowTie.label.right.colModel.length) {
                            return 'Number of columns does not match with number of headers for right branch';
                        }
                    }
                    break;
                case 'horizontalfunnel':
                    break;
                case 'timeline':
                    break;
                case 'halfbowtie':
                    break;
                case 'treemap':
                    break;
                case 'waterfall':
                    break;
                case 'brick':
                    break;
                default:
                    return 'Not a chart type';
            }
            oYAxis = chartConfigOptions.yAxis;
            oXAxis = chartConfigOptions.xAxis;
            switch (chartConfigOptions.chart.type) {
                case 'line':
                case 'area':
                case 'column':
                    if (oYAxis.numberOfGridLines < 2) {
                        oYAxis.numberOfGridLines = 2;
                    }
                    oXAxis.numberOfGridLines = oYAxis.numberOfGridLines;
                    break;
                case 'bar':
                    if (oXAxis.numberOfGridLines < 2) {
                        oXAxis.numberOfGridLines = 2;
                    }
                    oYAxis.numberOfGridLines = oXAxis.numberOfGridLines;
                    break;
            }
        };
        /*
        MAQ.animateElement: Used to perform animation on SVG element
        @param {oELE} element to animate
        @param {sPropertyToAnimate} property name of element to animate
        @param {sAnimateValue} value to set for the property
        @param {iDuration} duration of animation
        */
        MAQ.animateElement = function (oELE, sPropertyToAnimate, sAnimateValue, iDuration) {
            'use strict';
            var currentVal = oELE.getAttributeNS(null, sPropertyToAnimate), increment, counter, process;
            if (currentVal.indexOf('px') > -1) {
                currentVal = currentVal.split('px')[0];
            }
            currentVal = parseInt(currentVal, 10);
            iDuration = iDuration / 3.5;
            increment = (sAnimateValue - currentVal) / iDuration;
            counter = 1;
            process = setInterval(function () {
                currentVal += increment;
                MAQ.addAttr(oELE, sPropertyToAnimate, currentVal);
                if (counter >= iDuration) {
                    clearInterval(process);
                }
                counter += 1;
            }, 1);
        };
        /*
        MAQ.animateClipElement: Used to perform animation on clip element
        @param {oELE} element to animate
        @param {sPropertyToAnimate} property name of element to animate
        @param {sAnimateValue} value to set for the property
        @param {iDuration} duration of animation
        */
        MAQ.animateClipElement = function (oELE, sPropertyToAnimate, sAnimateValue, iDuration) {
            'use strict';
            if (null !== document.getElementById(oELE)) {
                var currentVal = document.getElementById(oELE).getAttribute(sPropertyToAnimate), increment, counter, process;
                if (!currentVal) {
                    currentVal = '0';
                }
                if (currentVal.indexOf('px') > -1) {
                    currentVal = currentVal.split('px')[0];
                }
                currentVal = parseInt(currentVal, 10);
                iDuration = iDuration / 3.5;
                increment = (sAnimateValue - currentVal) / iDuration;
                counter = 1;
                process = setInterval(function () {
                    if (null !== document.getElementById(oELE)) {
                        currentVal += increment;
                        document.getElementById(oELE).setAttribute(sPropertyToAnimate, currentVal);
                        if (counter >= iDuration) {
                            clearInterval(process);
                        }
                        counter += 1;
                    }
                }, 1);
            }
        };
        /*
        MAQ.mergeObjects: Merges objects together like jQuery.extend
        @param {x} input object of type: property name of object to merge
        @param {oDest} destination object
        @param {oSource} source object
        */
        MAQ.mergeObjects = function (x, oDest, oSource) {
            'use strict';
            var copy, attr;
            if (typeof oSource[x] === 'string' || typeof oSource[x] === 'number') {
                oDest[x] = oSource[x];
            }
            if (oDest[x] instanceof Date) {
                copy = new Date();
                copy.setTime(oSource[x].getTime());
                oDest[x] = copy;
            }
            if (oDest[x] instanceof Array) {
                if (oSource[x].length > 0) {
                    oDest[x] = oSource[x].slice(0);
                }
            }
            if (oDest[x] instanceof Object) {
                attr = null;
                Object.keys(oSource[x]).forEach(function (attr) {
                    if (oDest[x].hasOwnProperty(attr)) {
                        if (typeof oSource[x][attr] !== 'object') {
                            oDest[x][attr] = oSource[x][attr];
                        } else if (oDest[x][attr] instanceof Array) {
                            MAQ.mergeObjects(attr, oDest[x], oSource[x]);
                        } else {
                            if (oDest[x][attr]) {
                                if (Object.keys(oDest[x][attr]).length === 0) {
                                    oDest[x][attr] = oSource[x][attr];
                                }
                            }
                            MAQ.mergeObjects(attr, oDest[x], oSource[x]);
                        }
                    } else {
                        oDest[x][attr] = oSource[x][attr];
                        MAQ.mergeObjects(attr, oDest[x], oSource[x]);
                    }
                });
            }
        };
        /*
        isSeriesEnabled: To check is series is enabled
        @param {oSeries} user configuration parameters
        @param {iSeriesIndex} series of legend enabled/ disabled
        */
        function isSeriesEnabled(oSeries, iSeriesIndex) {
            'use strict';
            if (oSeries[iSeriesIndex] && oSeries[iSeriesIndex].enabled === undefined) {
                oSeries[iSeriesIndex].enabled = true;
            }
            return oSeries[iSeriesIndex].enabled;
        }
        /*
        MAQ.computeStrokeDashStyle: Returns SVG value of stroke-dash for a user-friendly name
        @param {sDashType} user friendly stroke-dash name
        */
        MAQ.computeStrokeDashStyle = function (sDashType) {
            'use strict';
            var sStrokeDashValue = '', oDash = {
                solid: '',
                shortdash: '6,2',
                shortdot: '2,2',
                shortdashdot: '6,2,2,2',
                shortdashdotdot: '6,2,2,2,2,2',
                dot: '2,6',
                dash: '8,6',
                longdash: '16,6',
                dashdot: '8,6,2,6',
                longdashdot: '16,6,2,6',
                longdashdotdot: '16,6,2,6,2,6'
            };
            if (oDash[sDashType]) {
                sStrokeDashValue = oDash[sDashType];
            }
            return sStrokeDashValue;
        };
        /*
        MAQ.addAttr: Adds an attribute to object
        @param {oELE} input object
        @param {sAttrName} attribute name
        @param {sAttrValue} attribute value
        */
        MAQ.addAttr = function (oELE, sAttrName, sAttrValue) {
            'use strict';
            if (oELE) {
                oELE.setAttribute(sAttrName, sAttrValue);
            }
        };
        /*
        MAQ.applyStyle: Applies to object
        @param {oELE} input object
        @param {oStyle} style object containing styling properties
        */
        MAQ.applyStyle = function (oELE, oStyle) {
            'use strict';
            if (oStyle && typeof oStyle === 'object') {
                var oStyleColl = Object.keys(oStyle), iStyleCounter = 0, iNumOfStyle = oStyleColl.length;
                for (iStyleCounter = iNumOfStyle; 0 <= iStyleCounter; iStyleCounter -= 1) {
                    oELE.style[oStyleColl[iStyleCounter]] = oStyle[oStyleColl[iStyleCounter]];
                }
            }
        };
        /*
        MAQ.applyMargin: applies margin to chart
        @param {chartConfigOptions} user configuration parameters
        @param {oMargin} margin array
        */
        MAQ.applyMargin = function (chartConfigOptions, oMargin) {
            'use strict';
            if (oMargin.length <= 1 || oMargin.length > 4 || oMargin.length === 3) {
                /*Condition Change*/
                if (1 !== oMargin.length || 0 >= oMargin[0]) {
                    oMargin[0] = 5;
                }
                oMargin[1] = oMargin[0];
                oMargin[2] = oMargin[0];
                oMargin[3] = oMargin[0];
            } else if (oMargin.length === 2) {
                oMargin[2] = oMargin[0];
                oMargin[3] = oMargin[1];
            }
            chartConfigOptions.availX += oMargin[3];
            chartConfigOptions.availY += oMargin[0];
            chartConfigOptions.availWidth -= oMargin[1] + oMargin[3];
            chartConfigOptions.availHeight -= oMargin[0] + oMargin[2];
        };
        /*
        MAQ.applyFormatter: applies formatting to data
        @param {sText} data to be formatted
        @param {sFormatterName} formatter function/ function name
        */
        MAQ.applyFormatter = function (sText, sFormatterName) {
            'use strict';
            if (sFormatterName) {
                if (typeof window[sFormatterName] === 'function') {
                    sText = window[sFormatterName](sText);
                } else if (MAQ.utils.formatters[sFormatterName] && typeof MAQ.utils.formatters[sFormatterName] === 'function') {
                    sText = MAQ.utils.formatters[sFormatterName](sText);
                } else if (typeof sFormatterName === 'function') {
                    sText = sFormatterName(sText);
                }
            }
            return sText;
        };
        /*
        MAQ.removeAllChildren: removes all child nodes
        @param {oELE} input object
        */
        MAQ.removeAllChildren = function (oELE) {
            'use strict';
            while (oELE.hasChildNodes()) {
                oELE.removeChild(oELE.lastChild);
            }
        };
        /*
        MAQ.getMinMax: Returns minimum and maximum value
                       Compares users min and max with min and max from Array and returns best result
        @param {oDataArray} array of values
        @param {min} user's minimum value
        @param {max} user's maximum value
        */
        MAQ.getMinMax = function (oDataArray, min, max, fieldName) {
            'use strict';
            var iDataArrayLength = oDataArray.length, iDataCounter = 0, iSum = 0, iCurrentValue = 0;
            if (iDataArrayLength) {
                for (iDataCounter = 0; iDataCounter < iDataArrayLength; iDataCounter += 1) {
                    iCurrentValue = oDataArray[iDataCounter];
                    if (iCurrentValue && typeof iCurrentValue === 'object') {
                        if (iCurrentValue[fieldName]) {
                            iCurrentValue = iCurrentValue[fieldName];
                        }
                    }
                    if (typeof iCurrentValue === 'number') {
                        iSum += iCurrentValue;
                        if (min > iCurrentValue) {
                            min = iCurrentValue;
                        }
                        if (max < iCurrentValue) {
                            max = iCurrentValue;
                        }
                    }
                    if (typeof iCurrentValue === 'string') {
                        if (min.length > iCurrentValue.length) {
                            min = iCurrentValue;
                        }
                        if (max.length < iCurrentValue.length) {
                            max = iCurrentValue;
                        }
                    }
                }
            } else {
                min = Math.min(0, min);
                max = Math.max(0, max);
                iSum = 0;
            }
            return {
                min: min,
                max: max,
                total: iSum
            };
        };

        /*
        MAQ.getNormalized_Min_Max_Interval: Returns mormalized minimum and maximum value along with axis inteval
        @param {iMin} minimum value
        @param {iMax} maximum value
        @param {iNumberOfAxis} # of axis on X or Y axis
        */
        MAQ.getNormalized_Min_Max_Interval = function (iMin, iMax, iNumberOfAxis) {
            'use strict';
            var iOgMax = iMax, iOgMin = iMin, iInterval, fExponent, oMultiple, iMultipleLength, iNormalizationFactor, oNormalizationFactor, modRes, iCounter, iIndexPos, bMax, bMin, iNegAxisCount, iPosAxisCount, iOpNum, iLogMultiple, iRem, iOptimumMax;
            if (iMin < 0) {
                iMax -= iMin;
            }
            bMax = false;
            bMin = false;
            if (iMax < 10) {
                iMax = iMax * 100;
                bMax = true;
            }
            if (Math.abs(iMin) < 10) {
                iMin = iMin * 100;
                bMin = true;
            }
            if (bMax && bMin) {
                iOgMax = iOgMax * 100;
                iOgMin = iOgMin * 100;
            }
            iInterval = Math.ceil(iMax / iNumberOfAxis);
            fExponent = Math.floor(Math.log(iInterval) / Math.log(10));
            oMultiple = [
              2,
              5,
              10
            ];
            iMultipleLength = oMultiple.length;
            iNormalizationFactor = 0;
            oNormalizationFactor = [];
            for (iCounter = 0; iCounter < iMultipleLength; iCounter += 1) {
                modRes = iInterval % Math.pow(oMultiple[iCounter], fExponent);
                oNormalizationFactor[iCounter] = modRes;
                iNormalizationFactor = modRes > iNormalizationFactor ? modRes : iNormalizationFactor;
            }
            iIndexPos = oNormalizationFactor.lastIndexOf(iNormalizationFactor);
            iInterval += Math.pow(oMultiple[iIndexPos], fExponent) - iNormalizationFactor;
            iMax = iOgMax + iInterval - Math.abs(iOgMax) % iInterval;
            if (iMin < 0) {
                iMin = iOgMin - (iOgMin % iInterval + iInterval);
                iNegAxisCount = -(iMin / iInterval);
                iPosAxisCount = iNumberOfAxis - iNegAxisCount;
                if (0 === iPosAxisCount) {
                    iPosAxisCount = 1;
                }
                iOptimumMax = iPosAxisCount * iInterval;
                if (iOptimumMax < iOgMax) {
                    iOpNum = Math.ceil(iOgMax);
                    iLogMultiple = Math.pow(oMultiple[iIndexPos], fExponent);
                    while (true) {
                        if (iOpNum % iPosAxisCount === 0 && iOpNum % iLogMultiple === 0) {
                            if (iOpNum / iPosAxisCount / iNegAxisCount % iLogMultiple === 0) {
                                break;
                            }
                            iRem = iOpNum / iPosAxisCount / iNegAxisCount % iLogMultiple;
                            iOpNum += iRem;
                        } else {
                            if (iOpNum % iPosAxisCount !== 0) {
                                iOpNum = iOpNum + (iPosAxisCount - iOpNum % iPosAxisCount);
                            }
                            if (iOpNum % iLogMultiple !== 0) {
                                iOpNum = iOpNum + (iLogMultiple - iOpNum % iLogMultiple);
                            }
                        }
                    }
                    iMax = iOpNum;
                    iInterval = iOpNum / iPosAxisCount;
                    iMin = -(iInterval * iNegAxisCount);
                } else {
                    iMax = iOptimumMax;
                }
            } else {
                iMax = iInterval * iNumberOfAxis;
            }
            if (bMax && bMin) {
                iInterval = iInterval / 100;
                iMax = iMax / 100;
                iMin = iMin / 100;
            } else {
                iMax = Math.round(iMax,2);
                iMin = Math.round(iMin,2);
            }
            return {
                min: iMin,
                max: iMax,
                interval: iInterval
            };
        };
        /*
        MAQ.getObjectDimension: Returns SVG element dimensions like x, y, width and height
        @param {oELE} SVG element
        */
        MAQ.getObjectDimension = function (oELE) {
            'use strict';
            if (oELE) {
                var oMDim = {};
                var oDim = oELE.getBBox();
                var oDim1 = oELE.getBoundingClientRect();
                oMDim.x = oDim.x;
                oMDim.y = oDim.y;
                oMDim.width = oDim1.width;
                oMDim.height = oDim1.height;
                return oMDim;
            }
        };
        /*
        MAQ.createSVGDoc: Creates SVG document to hold the chart content
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.createSVGDoc = function (chartConfigOptions) {
            'use strict';
            chartConfigOptions.container.style.position = 'relative';
            var svgELE = document.createElementNS(chartConfigOptions.svgNS, 'svg');
            MAQ.addAttr(svgELE, 'xmlns', chartConfigOptions.svgNS);
            MAQ.addAttr(svgELE, 'xmlns:xlink', chartConfigOptions.xlinkNS);
            //write viewbox code here
            var sViewBox = '0 0 ';
            if (!chartConfigOptions.chart.style.width) {
                chartConfigOptions.chart.style.width = '500px';
            }
            if (!chartConfigOptions.chart.style.height) {
                chartConfigOptions.chart.style.height = '500px';
            }
            MAQ.applyStyle(svgELE, chartConfigOptions.chart.style);
            chartConfigOptions.container.appendChild(svgELE);
            //Firefox major fix - Do not edit
            chartConfigOptions.availWidth = 0 === svgELE.clientWidth ? 0 === chartConfigOptions.container.clientWidth ? parseInt(chartConfigOptions.chart.style.width, 10) : chartConfigOptions.container.clientWidth : svgELE.clientWidth;
            chartConfigOptions.availHeight = 0 === svgELE.clientHeight ? 0 === chartConfigOptions.container.clientHeight ? parseInt(chartConfigOptions.chart.style.height, 10) : chartConfigOptions.container.clientHeight : svgELE.clientHeight;
            //store total witdh & height for future reference
            chartConfigOptions.width = chartConfigOptions.availWidth;
            chartConfigOptions.height = chartConfigOptions.availHeight;
            //Responsiveness code
            if (true === chartConfigOptions.chart.isResponsive && 'treemap' !== chartConfigOptions.chart.type) {
                //Get the width and height to be used for setting the viewBox
                var iWidth = parseInt(chartConfigOptions.chart.style.width, 10);
                chartConfigOptions.availWidth = parseInt(chartConfigOptions.chart.style.width, 10);
                var iHeight = parseInt(chartConfigOptions.chart.style.height, 10);
                chartConfigOptions.availHeight = parseInt(chartConfigOptions.chart.style.height, 10);
                sViewBox += iWidth + ' ' + iHeight;
                MAQ.addAttr(svgELE, 'viewBox', sViewBox);
                MAQ.addAttr(svgELE, 'preserveAspectRatio', 'xMinYMin meet');
                //Apply percentage width and height to svg root
                svgELE.style.width = '100%';
                svgELE.style.height = '100%';
                MAQ.styles.addClass(svgELE, 'MAQChartsSvgRoot');
                //Hack to maintain height and width ratio of container div
                chartConfigOptions.container.style.height = '0';
                chartConfigOptions.container.style.paddingTop = iHeight / iWidth * 100 + '%';
                svgELE.style.position = 'absolute';
                svgELE.style.top = '0';
                svgELE.style.left = '0';
            }
            var oToolTip = document.createElement('div');
            var oTTStyle = chartConfigOptions.tooltip.style;
            oTTStyle.position = 'absolute';
            oTTStyle.display = 'none';
            oTTStyle.minWidth = '0';
            oTTStyle.minHeight = '0';
            oTTStyle.top = '0';
            oTTStyle.left = '0';
            MAQ.applyStyle(oToolTip, oTTStyle);
            chartConfigOptions.container.appendChild(oToolTip);
            chartConfigOptions.svgELE = svgELE;
            chartConfigOptions.tooltipDiv = oToolTip;
        };
        /*
        MAQ.createSVGElement: Creates any SVG element
        @param {nameSpace} SVG namespace
        @param {sELEName} SVG element name
        @param {oAttr} attibute object consisting of attributes and style object
        */
        MAQ.createSVGElement = function (nameSpace, sELEName, oAttr) {
            'use strict';
            var oSVGELE = document.createElementNS(nameSpace, sELEName);
            if (undefined !== oAttr) {
                var oAttrColl = Object.keys(oAttr), iAttrCounter = 0, iAttrLength = oAttrColl.length;
                for (iAttrCounter = 0; iAttrCounter < iAttrLength; iAttrCounter += 1) {
                    switch (oAttrColl[iAttrCounter].toLowerCase()) {
                        case 'text':
                            oSVGELE.appendChild(document.createTextNode(oAttr.text));
                            break;
                        case 'style':
                            MAQ.applyStyle(oSVGELE, oAttr.style);
                            break;
                        case 'image':
                            oSVGELE.setAttributeNS(nameSpace, 'href', oAttr.image);
                            break;
                        default:
                            MAQ.addAttr(oSVGELE, oAttrColl[iAttrCounter], oAttr[oAttrColl[iAttrCounter]]);
                            break;
                    }
                }
            }
            return oSVGELE;
        };
        /*
        MAQ.drawChartTitle: Renders chart title
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawChartTitle = function (chartConfigOptions) {
            'use strict';
            var oTitle = chartConfigOptions.title;
            if (oTitle && oTitle.text) {
                var oAttr = {
                    x: 0,
                    y: 0,
                    text: oTitle.text,
                    style: oTitle.style
                };
                switch (oTitle.align.toLowerCase()) {
                    case 'center':
                        oAttr.x = chartConfigOptions.availWidth / 2;
                        oAttr.style.textAnchor = 'middle';
                        break;
                    case 'right':
                        oAttr.x = chartConfigOptions.availWidth;
                        oAttr.style.textAnchor = 'end';
                        break;
                }
                var oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr), oGrpELE = document.createElementNS(chartConfigOptions.svgNS, 'g');
                oGrpELE.setAttribute('class', 'MAQCharts-title');
                oGrpELE.appendChild(oTitleObj);
                chartConfigOptions.svgELE.appendChild(oGrpELE);
                var oDim = MAQ.getObjectDimension(oTitleObj);
                MAQ.addAttr(oTitleObj, 'y', Math.abs(oDim.y));
                if (oTitle.x) {
                    MAQ.addAttr(oTitleObj, 'dx', oTitle.x);
                }
                if (oTitle.y) {
                    MAQ.addAttr(oTitleObj, 'dy', oTitle.y);
                }
                if (!chartConfigOptions.title.floating) {
                    chartConfigOptions.availX = 0;
                    chartConfigOptions.availY = oDim.height;
                    chartConfigOptions.availWidth -= chartConfigOptions.availX;
                    chartConfigOptions.availHeight -= oDim.height;
                    if (oTitle.y > 0) {
                        chartConfigOptions.availY += oTitle.y;
                        chartConfigOptions.availHeight -= oTitle.y;
                    }
                }
            }
        };
        /*
        redrawChart: Redraw chart on selected legend
        @param {oParam} user configuration parameters (config) and index of legend series (seriesIndex)
        */
        function redrawChart(evt, oParam) {
            'use strict';
            var oGrpDisplayArea = oParam.config.svgELE;
            if (oParam.config.series[oParam.seriesIndex].enabled) {
                oParam.config.series[oParam.seriesIndex].enabled = false;
            } else if (0 !== oParam.config.series[oParam.seriesIndex].data) {
                oParam.config.series[oParam.seriesIndex].enabled = true;
            } else {
                return;  //#62 donut bug fix
            }
            if (oGrpDisplayArea) {
                MAQ.removeAllChildren(oGrpDisplayArea);
            }
            if (true === oParam.config.chart.isResponsive && 'treemap' !== oParam.config.chart.type) {
                oParam.config.availWidth = parseInt(oParam.config.chart.style.width, 10);
                oParam.config.availHeight = parseInt(oParam.config.chart.style.height, 10);
            } else {
                //Firefox major fix - Do not edit
                oParam.config.availWidth = 0 === oParam.config.svgELE.clientWidth ? 0 === oParam.config.container.clientWidth ? parseInt(oParam.config.svgELE.style.width, 10) : oParam.config.container.clientWidth : oParam.config.svgELE.clientWidth;
                oParam.config.availHeight = 0 === oParam.config.svgELE.clientHeight ? 0 === oParam.config.container.clientHeight ? parseInt(oParam.config.svgELE.style.height, 10) : oParam.config.container.clientHeight : oParam.config.svgELE.clientHeight;
            }
            /*
                  Added code segemnt to fix chart shift issue (on click of legends)
              */
            oParam.config.availX = 0;
            oParam.config.availY = 0;
            MAQ.drawChartTitle(oParam.config);
            switch (oParam.config.chart.type.toLowerCase()) {
                case 'histogram':
                    MAQ.createHistogramChart(oParam.config);
                    break;
            }
        }
        /*
        END: MAQ.redrawChart: Redraw chart on selected legend
        */
        /*
        MAQ.getMousePos: Gets the current mouse pointer position
        @param {obj} object
        @param {evt} event
        */
        function getMousePos(obj, evt) {
            'use strict';
            // get canvas position
            var top = 0, left = 0, mouseX, mouseY;
            while (obj.tagName !== 'BODY') {
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }
            // return relative mouse position
            mouseX = evt.clientX - left + window.frames.pageXOffset;
            mouseY = evt.clientY - top + window.frames.pageYOffset;
            return {
                x: mouseX,
                y: mouseY
            };
        }
        /*
        MAQ.showToolTip: Renders the tooltip on SVG
        @param {evt} event
        @param {oParam} user configuration parameters and series parameters
        */
        function showToolTip(evt, oParam) {
            'use strict';
            var oConfig = oParam.config;
            var oSVG = oConfig.svgELE, fInterval = oConfig.plotIntervalWidth, oCord = getMousePos(oConfig.container, evt), oToolTip = oConfig.tooltipDiv, oMarker;
            oToolTip.style.display = 'block';
            oToolTip.style.zIndex = 20;
            if (!oParam.type) {
                var oSeries = oConfig.series[oParam.seriesIndex], oLabels = oConfig.series.label, oPoint = oSVG.createSVGPoint();
                oPoint.x = evt.clientX;
                oPoint.y = evt.clientY;
                var oSVGCord = oPoint.matrixTransform(oSVG.getScreenCTM().inverse()), iSelectedIndex = 0;
                if (oParam.isPosavail) {
                    iSelectedIndex = oParam.position;
                }
                var iMarkerGrps, oCircle, iCount = 0;
                //This "if" drives the marker style changing feature on hover
                if (oSeries.xPos && oSeries.xPos.length > 1 && oConfig.plotOptions[oConfig.chart.type].marker) {
                    oMarker = oConfig.plotOptions[oConfig.chart.type].marker;
                    if (oMarker.hover && oMarker.hover.enabled && oMarker.markers) {
                        iMarkerGrps = oMarker.markers.length;
                        if (oConfig.tooltip.seriesLevelTooltip) {
                            for (iCount = 0; iCount < iMarkerGrps; iCount += 1) {
                                if (oMarker.markers[iCount].childNodes[iSelectedIndex]) {
                                    oCircle = oMarker.markers[iCount].childNodes[iSelectedIndex];
                                    if (undefined !== oMarker.markers[iCount].prevSelectedId) {
                                        MAQ.styles.removeClass(oMarker.markers[iCount].childNodes[oMarker.markers[iCount].prevSelectedId], 'MAQCharts-marker-hover');
                                    }
                                    MAQ.styles.addClass(oCircle, 'MAQCharts-marker-hover');
                                    oMarker.markers[iCount].prevSelectedId = iSelectedIndex;
                                }
                            }
                        } else {
                            oCircle = oMarker.markers[oParam.seriesIndex].childNodes[iSelectedIndex];
                            if (undefined !== oMarker.markers[oParam.seriesIndex].prevSelectedId) {
                                MAQ.styles.removeClass(oMarker.markers[oParam.seriesIndex].childNodes[oMarker.markers[oParam.seriesIndex].prevSelectedId], 'MAQCharts-marker-hover');
                            }
                            MAQ.styles.addClass(oCircle, 'MAQCharts-marker-hover');
                            oMarker.markers[oParam.seriesIndex].prevSelectedId = iSelectedIndex;
                        }
                    }
                }
                var sToolTipFunctionName = oConfig.tooltip.customTooltip;
                if (sToolTipFunctionName) {
                    var oExtParam = {
                        seriesIndex: oParam.seriesIndex,
                        dataIndex: iSelectedIndex,
                        chartOptions: oConfig
                    };
                    //this if is for multi stacked combo line column chart
                    if (oParam.rowIndex) {
                        oExtParam.rowIndex = oParam.rowIndex;
                    }
                    oToolTip.innerHTML = MAQ.applyFormatter(oExtParam, sToolTipFunctionName);
                } else {
                    var sChartType = oConfig.chart.type, iLen, i, tempValue;
                    switch (sChartType.toLowerCase()) {
                        case 'histogram':
                            if (oParam.category == "histogram") {
                                var x, y;
                                if (xFormatter.format(Math.round(oSeries.data.scaleX[iSelectedIndex] * 100) / 100) === "(Blank)") {
                                    x = MAQ.applyFormatter(Math.round(oSeries.data.scaleX[iSelectedIndex] * 100) / 100 || 0);
                                }
                                else {
                                    x = xFormatter.format(Math.round(oSeries.data.scaleX[iSelectedIndex] * 100) / 100 || 0);
                                }
                                if (yFormatter.format(Math.round(oSeries.data.scaleY[iSelectedIndex] * 100) / 100) === "(Blank)") {
                                    y = MAQ.applyFormatter(Math.round(oSeries.data.scaleY[iSelectedIndex] * 100) / 100 || 0);
                                }
                                else {
                                    y = yFormatter.format(Math.round(oSeries.data.scaleY[iSelectedIndex] * 100) / 100 || 0);
                                }
                                oToolTip.innerHTML = '<b>' + (oConfig.xAxis.title.enabled ? oConfig.xAxis.title.text : xAxisName) + ': </b>' + x + '<br/><b>' + (oConfig.yAxis.dualyAxis.axisRight.title.enabled ? oConfig.yAxis.dualyAxis.axisRight.title.text : yAxisName) + ': </b>' + y;
                            }
                            else if (oParam.category == "column") {
                                oToolTip.innerHTML = '<b>' + (oConfig.yAxis.dualyAxis.axisLeft.title.enabled ? oConfig.yAxis.dualyAxis.axisLeft.title.text : 'Histogram Count') + ': </b>' + oSeries.data.frequency.data[oParam.position];
                            }
                            break;

                        default:
                            oToolTip.innerHTML = '<b>' + oSeries.name + '</b><br/>' + oLabels[iSelectedIndex] + ': ' + (Math.round(oSeries.data[iSelectedIndex] * 100) / 100 || 0);
                            break;
                    }
                }
            } else {
                oToolTip.innerHTML = oParam.value;
            }
            //if changeBorder is true and series level tool tip is false then change the border color
            var oPlotOptions;
            if (oConfig.tooltip.changeBorderColor && !oConfig.tooltip.seriesLevelTooltip) {
                oPlotOptions = oConfig.plotOptions[oConfig.chart.type.toLowerCase()];
                oToolTip.style.borderColor = oPlotOptions.color && oPlotOptions.color[oParam.seriesIndex % oPlotOptions.color.length] || evt.target.getAttribute('fill') || oConfig.tooltip.style['border-color'];
            }
            if (oConfig.chart.type == 'histogram') {
                oPlotOptions = oConfig.plotOptions[oParam.category];
                if (oPlotOptions.tooltip.changeBorderColor && !oPlotOptions.tooltip.seriesLevelTooltip) {
                    oToolTip.style.borderColor = oPlotOptions.color && oPlotOptions.color[oParam.seriesIndex % oPlotOptions.color.length] || evt.target.getAttribute('fill') || oConfig.tooltip.style['border-color'];
                }
            }
            var fTopCordinate = oCord.y - oToolTip.clientHeight - 5;
            var topScroll = $('#container').scrollTop();
            if (fTopCordinate <= 10) {
                fTopCordinate = oCord.y + 10;
            }
            var fLeftCordinate = oCord.x - oToolTip.clientWidth - 10;
            var leftScroll = $('#container').scrollLeft();
            if (fLeftCordinate <= 10) {
                fLeftCordinate = oCord.x + 10;
            }
            oToolTip.style.top = topScroll + fTopCordinate + 'px';
            oToolTip.style.left = leftScroll + fLeftCordinate + 'px';
        }
        function hideToolTip(evt, oParam) {
            'use strict';
            if (undefined === oParam.toolTip) {
                if (oParam.style) {
                    oParam.style.display = 'none';
                }
                return;
            }
            var oConfig = oParam.config;
            var oSeries = oConfig.series[oParam.seriesIndex], oMarker, iMarkerGrps, iCount = 0;
            if (oSeries.xPos && oSeries.xPos.length > 1 && oConfig.plotOptions[oConfig.chart.type].marker) {
                oMarker = oConfig.plotOptions[oConfig.chart.type].marker;
                if (oMarker.hover && oMarker.hover.enabled && oMarker.markers) {
                    iMarkerGrps = oMarker.markers.length;
                    if (oConfig.tooltip.seriesLevelTooltip) {
                        for (iCount = 0; iCount < iMarkerGrps; iCount += 1) {
                            if (undefined !== oMarker.markers[iCount].prevSelectedId) {
                                MAQ.styles.removeClass(oMarker.markers[iCount].childNodes[oMarker.markers[iCount].prevSelectedId], 'MAQCharts-marker-hover');
                            }
                        }
                    } else {
                        if (undefined !== oMarker.markers[oParam.seriesIndex].prevSelectedId) {
                            MAQ.styles.removeClass(oMarker.markers[oParam.seriesIndex].childNodes[oMarker.markers[oParam.seriesIndex].prevSelectedId], 'MAQCharts-marker-hover');
                        }
                    }
                }
            }
            oParam.toolTip.style.display = 'none';
        }
        /*
         * MAQ.showHideStaticTooltips: Shows or hides static tooltips for each data point of the selected series
         * @param {oParam} user configuration options and seriesIndex
         * @param {bShow} whether to show or hide
         * **NOTE: Currently only supported for line charts
         */
        MAQ.showHideStaticTooltips = function (oParam, bShow) {
            'use strict';
            if ('line' !== oParam.config.chart.type.toLowerCase()) {
                console.log('Static tooltips are only supported for line charts.');
                return;
            }
            var oConfig = oParam.config, oGrpTooltips = oConfig.plotGroup.querySelectorAll('.MAQCharts-plotArea-tooltips'), oSelGrpTooltip = oConfig.plotGroup.querySelector('#MAQCharts-plotArea-tooltips-' + (oParam.seriesIndex + 1)), oGrp;
            //find static tooltip class under plot Options group
            //apply display none to all the static tooltip groups
            if (oGrpTooltips && oGrpTooltips.length > 0) {
                Object.keys(oGrpTooltips).forEach(function (oGrp) {
                    MAQ.addAttr(oGrpTooltips[oGrp], 'display', 'none');
                });
            }
            //use series index to get the right group
            //remove display none from the selected series static tooltip.
            if (oSelGrpTooltip && bShow) {
                MAQ.addAttr(oSelGrpTooltip, 'display', '');
            }
        };

        /*
        MAQ.drawYAxisTitle: Renders X-axis title
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawYAxisTitle = function (chartConfigOptions) {
            'use strict';
            var oYAxis = chartConfigOptions.yAxis, count, oAttr, oGrpELE, axis, oTitleObj, oDim = null;
            if (oYAxis.dualyAxis.axisLeft && oYAxis.dualyAxis.axisRight) {
                count = 0;
                var iXvalue;
                for (count = 0; count < 2; count += 1) {
                    if (count === 0) {
                        axis = oYAxis.dualyAxis.axisLeft;
                    } else {
                        axis = oYAxis.dualyAxis.axisRight;
                    }
                    if (axis.title.enabled) {
                        oAttr = { class: 'MAQCharts-yAxisTitle' };
                        oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                        iXvalue = chartConfigOptions.availX;
                        if (1 === count) {
                            iXvalue = chartConfigOptions.availWidth - axis.title.x;
                        }
                        chartConfigOptions.svgELE.appendChild(oGrpELE);
                        oAttr = {
                            x: iXvalue,
                            y: chartConfigOptions.y,
                            text: axis.title.text,
                            style: axis.title.style
                        };
                        if (axis.title.x) {
                            oAttr.dx = axis.title.x;
                        }
                        if (axis.title.y) {
                            oAttr.dy = axis.title.y;
                        }
                        switch (axis.title.align.toLowerCase()) {
                            case 'center':
                                oAttr.y = chartConfigOptions.availHeight / 2;
                                oAttr.style.textAnchor = 'middle';
                                break;
                            case 'right':
                                oAttr.y = chartConfigOptions.availHeight;
                                oAttr.style.textAnchor = 'end';
                                break;
                        }
                        oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
                        oGrpELE.appendChild(oTitleObj);
                        oDim = MAQ.getObjectDimension(oTitleObj);
                        if (!count) {
                            oAttr.x += Math.abs(oDim.height);
                            chartConfigOptions.availX += oDim.height;
                        }
                        chartConfigOptions.availWidth -= oDim.height;
                        MAQ.addAttr(oTitleObj, 'x', oAttr.x);
                        MAQ.addAttr(oTitleObj, 'transform', 'rotate(270 ' + Math.abs(oAttr.x) + ',' + oAttr.y + ')');
                        if (axis.title.y > 0) {
                            chartConfigOptions.availX += axis.title.y;
                            chartConfigOptions.availWidth -= axis.title.y;
                        }
                    }
                }
            }
        };


        /*
        MAQ.drawXAxisTitle: Renders X-axis title
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawXAxisTitle = function (chartConfigOptions) {
            'use strict';
            var oXAxis = chartConfigOptions.xAxis;
            var oTitleObj, oAttr, oGrpELE, oDim = null;
            if (oXAxis.title.text) {
                if (!oXAxis.dualAxisEnabled) {
                    oAttr = { class: 'MAQCharts-xAxisTitle' };
                    oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                    chartConfigOptions.svgELE.appendChild(oGrpELE);
                    oAttr = {
                        x: chartConfigOptions.availX,
                        y: chartConfigOptions.availY + chartConfigOptions.availHeight - 4,
                        text: oXAxis.title.text,
                        style: oXAxis.title.style
                    };
                    switch (oXAxis.title.align.toLowerCase()) {
                        case 'center':
                            oAttr.x += chartConfigOptions.availWidth / 2;
                            oAttr.style.textAnchor = 'middle';
                            break;
                        case 'right':
                            oAttr.x += chartConfigOptions.availWidth;
                            oAttr.style.textAnchor = 'end';
                            break;
                    }
                    if (!chartConfigOptions.xAxis.title.enabled) {
                        oAttr.text = "";
                    }
                    oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
                    oGrpELE.appendChild(oTitleObj);
                    if (oXAxis.title.x) {
                        MAQ.addAttr(oTitleObj, 'dx', oXAxis.title.x);
                    }
                    if (oXAxis.title.y) {
                        MAQ.addAttr(oTitleObj, 'dy', oXAxis.title.y);
                    }
                    oDim = MAQ.getObjectDimension(oTitleObj);
                    chartConfigOptions.availHeight -= oDim.height;
                    if (oXAxis.title.y < 0) {
                        chartConfigOptions.availHeight -= Math.abs(oXAxis.title.y);
                    }
                } else {
                    if (oXAxis.dualxAxis.length === 2) {
                        var count = 0, iYvalue;
                        for (count = 0; count < 2; count += 1) {
                            oAttr = { class: 'MAQCharts-xAxisTitle' };
                            oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                            chartConfigOptions.svgELE.appendChild(oGrpELE);
                            iYvalue = chartConfigOptions.availY + chartConfigOptions.availHeight - 4;
                            if (1 === count) {
                                iYvalue = chartConfigOptions.availY;
                            }
                            oAttr = {
                                x: chartConfigOptions.availX,
                                y: iYvalue,
                                text: chartConfigOptions.xAxis.dualxAxis[count].title.text,
                                style: chartConfigOptions.xAxis.dualxAxis[count].title.style
                            };
                            switch (oXAxis.title.align.toLowerCase()) {
                                case 'center':
                                    oAttr.x += chartConfigOptions.availWidth / 2;
                                    oAttr.style.textAnchor = 'middle';
                                    break;
                                case 'right':
                                    oAttr.x += chartConfigOptions.availWidth;
                                    oAttr.style.textAnchor = 'end';
                                    break;
                            }
                            oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
                            oGrpELE.appendChild(oTitleObj);
                            if (oXAxis.title.x) {
                                MAQ.addAttr(oTitleObj, 'dx', oXAxis.title.x);
                            }
                            if (oXAxis.title.y) {
                                MAQ.addAttr(oTitleObj, 'dy', oXAxis.title.y);
                            }
                            oDim = MAQ.getObjectDimension(oTitleObj);
                            chartConfigOptions.availHeight -= oDim.height;
                            if (oXAxis.title.y < 0) {
                                chartConfigOptions.availHeight -= Math.abs(oXAxis.title.y);
                            }
                        }
                    }
                }
            }
        };
        /*
        MAQ.getAxisSpacing: Computes space around axis lines
        @param {chartConfigOptions} user configuration parameters
        @param {oAxis} axis object
        @param {sBigData} biggest data in the axis label set
        @param {bFlag} flag to decide xAxis or yAxis
        */
        MAQ.getAxisSpacing = function (chartConfigOptions, oAxis, sBigData, bFlag) {
            'use strict';
            var oAxisLabel = oAxis.labels, fSpacing, oAttr, oText, oDimAxis;
            if (oAxisLabel.enabled) {
                sBigData = MAQ.applyFormatter(sBigData, oAxisLabel.formatter);
            } else {
                sBigData = '';
            }
            fSpacing = 0;
            oAttr = {
                x: 10,
                y: 10,
                text: sBigData,
                style: oAxisLabel.style
            };
            if (oAxisLabel.rotation) {
                oAttr.transform = 'rotate( ' + oAxisLabel.rotation + ' 0,0)';
            }
            oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
            chartConfigOptions.svgELE.appendChild(oText);
            oDimAxis = MAQ.getObjectDimension(oText);
            chartConfigOptions.svgELE.removeChild(oText);
            if (bFlag) {
                fSpacing = oDimAxis.height;
            } else {
                fSpacing = oDimAxis.width + oAxis.labelSpacing;
            }
            if (!oAxisLabel.rotation) {
                if (oAxisLabel.staggerLines) {
                    fSpacing = 2 * (oDimAxis.height + oAxis.labelSpacing);
                }
            }
            oAxis.tickPosition = oAxis.tickPosition.toLowerCase();
            if (oAxis.tickPosition === 'onaxis') {
                if (bFlag) {
                    fSpacing += oAxis.tickHeight / 2;
                } else {
                    fSpacing += oAxis.tickWidth / 2;
                }
            } else if (oAxis.tickPosition === 'outside') {
                if (bFlag) {
                    fSpacing += oAxis.tickHeight;
                } else {
                    fSpacing += oAxis.tickWidth;
                }
            }
            fSpacing = Math.ceil(fSpacing);
            return fSpacing;
        };
        var iglobalCounter = 0, ioriginalyAxisLength, ioriginalxAxisLength;
        /*
        MAQ.drawAxis: Renders both the axes
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawAxis = function (chartConfigOptions) {
            'use strict';
            var iCounter = 0, iLength = 0, sBigData = '', bottomSpacing = 0, leftSpacing = 0, sChartType = chartConfigOptions.chart.type, xAxis = chartConfigOptions.xAxis, yAxis = chartConfigOptions.yAxis, xAxisLabel = xAxis.labels, yAxisLabel = yAxis.labels, xAxisSeries = xAxisLabel.series, yAxisSeries = yAxisLabel.series, xAxisSeriesLength = 0, yAxisSeriesLength = 0, yAxisLimit = 0;
            var oAttr = {
                class: 'MAQCharts-chartArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
            };
            var oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null, oNormalizedData, iStart, iInterval, oTimelineData, temp, oGridAreaGrpELE, iNumberOfGridLines, oGrpYAxis, oGrpYAxisLblNTick, oAttrYAxis, oYAxisLine, intervalHeight, oAttrTick;
            //Funnel Chart variables
            var fTotalInterval, oSeries = chartConfigOptions.series, fdelta, fConnectorHeight, fFunnelGap, fTubeHeight;

            /* Compute Space for X-Axis Labels */
            if (xAxisSeries.length <= 0) {
                iLength = chartConfigOptions.series[0].data.length;
                oTimelineData = chartConfigOptions.series[0].timeline;
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    xAxisSeries[iCounter] = iCounter + 1;
                }
            }
            /* Compute Space for Y-Axis Labels */
            iLength = yAxis.numberOfGridLines;
            oNormalizedData = chartConfigOptions.plotOptions[sChartType].normalizedData;
            if (iLength !== (oNormalizedData.max - oNormalizedData.min) / oNormalizedData.interval) {
                iLength += 1;
            }

            iStart = oNormalizedData.min;
            iInterval = oNormalizedData.interval;
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                yAxisSeries[iCounter] = iStart;
                iStart += iInterval;
                iStart = Math.round(iStart * 100) / 100;
            }

            xAxisSeriesLength = xAxisSeries.length;
            if (chartConfigOptions.useFullXAxis.indexOf(sChartType) > -1) {
                xAxisSeriesLength -= 1;
            }
            yAxisSeriesLength = iLength;

            oDataInfo = MAQ.getMinMax(xAxisSeries, '', '');
            sBigData = oDataInfo.max;
            bottomSpacing = MAQ.getAxisSpacing(chartConfigOptions, xAxis, sBigData, true);
            oDataInfo = MAQ.getMinMax(yAxisSeries, '', '');
            sBigData = oDataInfo.max;
            leftSpacing = MAQ.getAxisSpacing(chartConfigOptions, yAxis, sBigData, false);


            /* Plot Y-Axis, Y-Axis-Ticks, Y-Axis-GridLines and Y-Axis-Labels */
            oAttr = { class: 'MAQCharts-yAxis-gridArea' };
            oGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oAttr = { class: 'MAQCharts-yAxis' };
            oGrpYAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxis);
            oAttr = { class: 'MAQCharts-yAxis-Grid-Labels-Ticks' };
            oGrpYAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxisLblNTick);
            chartConfigOptions.yLabels = oGrpYAxisLblNTick;
            oGrpYAxisLblNTick.appendChild(oGridAreaGrpELE);
            oAttrYAxis = {
                x1: 0 + leftSpacing,
                y1: 0,
                x2: 0 + leftSpacing,
                y2: chartConfigOptions.availHeight - bottomSpacing,
                stroke: chartConfigOptions.yAxis.lineColor,
                'stroke-width': yAxis.lineWidth
            };
            oAttrYAxis.y2 += oAttrYAxis.y1;
            oYAxisLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrYAxis);
            oGrpYAxis.appendChild(oYAxisLine);
            if (yAxis.shiftStartBy > 0) {
                oAttrYAxis.y1 += yAxis.shiftStartBy;
            }
            intervalHeight = (oAttrYAxis.y2 - oAttrYAxis.y1) / yAxisSeriesLength;
            oAttrTick = {
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y1,
                x2: oAttrYAxis.x1 + yAxis.tickWidth,
                y2: oAttrYAxis.y1,
                stroke: yAxis.tickColor,
                'stroke-width': yAxis.tickHeight
            };
            var oAttrGridLine = {
                x: oAttrYAxis.x1,
                y: oAttrYAxis.y1,
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y1,
                x2: chartConfigOptions.availWidth + oAttrYAxis.x1 - leftSpacing,
                y2: oAttrYAxis.y1,
                width: chartConfigOptions.availWidth - leftSpacing,
                height: intervalHeight,
                fill: 'transparent',
                stroke: yAxis.gridLineColor,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(yAxis.gridLineDashStyle),
                'stroke-width': yAxis.gridLineWidth
            };
            var oGridLine;
            var sGridType = 'line';
            if (yAxis.alternateGridColor) {
                sGridType = 'rect';
                oAttrGridLine.stroke = 'transparent';
                oAttrGridLine['stroke-width'] = 0;
                oAttrGridLine.fill = yAxis.alternateGridColor;
            }
            if (yAxis.tickPosition === 'onaxis') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.tickWidth / 2;
            } else if (yAxis.tickPosition === 'outside') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.tickWidth;
            }
            oAttrTick.x2 = oAttrTick.x1 + yAxis.tickWidth;
            var oAttrLabel = {
                x: oAttrTick.x1 - yAxis.labelSpacing,
                y: oAttrTick.y1,
                text: '',
                dx: yAxisLabel.x,
                dy: yAxisLabel.y,
                'text-anchor': 'end',
                style: yAxis.labels.style
            };
            var oLabel;
            var oTick;
            switch (yAxis.labels.align) {
                case 'left':
                    oAttrLabel.x -= leftSpacing - yAxis.labelSpacing;
                    oAttrLabel['text-anchor'] = 'start';
                    break;
                case 'center':
                    oAttrLabel.x -= leftSpacing / 2;
                    oAttrLabel['text-anchor'] = 'middle';
                    break;
            }
            var bSkipPlot = false;
            if (yAxis.skipInterval < 0) {
                yAxis.skipInterval = 0;
            }
            var iSkipInterval = yAxis.skipInterval, oLabelDim;
            if (yAxisLabel.rotation) {
                oAttrLabel.transform = 'rotate( ' + yAxisLabel.rotation + ' ' + oAttrLabel.x + ',' + oAttrLabel.y + ')';
            }
            chartConfigOptions.availY += oAttrGridLine.y1;
            chartConfigOptions.availHeight = intervalHeight * yAxisSeriesLength;
            chartConfigOptions.plotIntervalHeight = intervalHeight;

            for (iCounter = yAxisSeriesLength; yAxisLimit <= iCounter; iCounter -= 1) {
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                    oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                    if (sGridType === 'rect') {
                        if (iCounter > 0) {
                            if (iCounter % 2 === 0) {
                                oGridAreaGrpELE.appendChild(oGridLine);
                            }
                        }
                    } else {
                        oGridAreaGrpELE.appendChild(oGridLine);
                    }
                    oGrpYAxisLblNTick.appendChild(oTick);
                    if (yAxisLabel.enabled) {
                        oAttrLabel.text = yAxisSeries[iCounter];
                        oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, yAxisLabel.formatter);
                        oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                        oGrpYAxisLblNTick.appendChild(oLabel);
                        oLabelDim = MAQ.getObjectDimension(oLabel);
                        MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oLabelDim.height / 4);
                    }
                    bSkipPlot = true;
                }
                if (iSkipInterval === 0) {
                    iSkipInterval = yAxis.skipInterval;
                    if (iCounter + 1 > Math.floor(yAxis.skipInterval / 2)) {
                        bSkipPlot = false;
                    }
                }
                oAttrTick.y2 += intervalHeight;
                oAttrGridLine.y = oAttrTick.y2;
                oAttrGridLine.y1 = oAttrTick.y2;
                oAttrGridLine.y2 = oAttrTick.y2;
                oAttrTick.y1 = oAttrTick.y2;
                oAttrLabel.y = oAttrTick.y2;
            }
            /* Plot X-Axis, X-Axis-Ticks, and X-Axis-Labels */
            var oAttrXAxis = {
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y2,
                x2: chartConfigOptions.availWidth + oAttrYAxis.x1 - leftSpacing,
                y2: oAttrYAxis.y2,
                stroke: xAxis.lineColor,
                'stroke-width': xAxis.lineWidth
            };
            oAttr = { class: 'MAQCharts-xAxis' };
            var oGrpXAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxis);
            oAttr = { class: 'MAQCharts-xAxis-Grid-Labels-Ticks' };
            var oGrpXAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxisLblNTick);
            chartConfigOptions.xLabels = oGrpXAxisLblNTick;
            oAttr = { class: 'MAQCharts-xAxis-gridArea' };
            var oXAxisGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oGrpXAxisLblNTick.appendChild(oXAxisGridAreaGrpELE);
            var oXAxisLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrXAxis);
            oGrpXAxis.appendChild(oXAxisLine);
            iLength = xAxisSeriesLength;
            oAttrXAxis.x2 = xAxis.usageWidth / 100 * (oAttrXAxis.x2 - oAttrXAxis.x1 - xAxis.shiftStartBy);
            oAttrXAxis.x1 += xAxis.shiftStartBy;
            var oChartPlotOptions = chartConfigOptions.plotOptions[sChartType];
            //if fixedWidth is specified then set the interval width equal to it.
            var intervalWidth = chartConfigOptions.fixedWidth && oChartPlotOptions.fixedWidth + oChartPlotOptions.padding - oChartPlotOptions.groupPadding || oAttrXAxis.x2 / Math.max(iLength, 1);
            oAttrGridLine = {
                x: oAttrXAxis.x1,
                y: oAttrYAxis.y1,
                x1: oAttrXAxis.x1,
                y1: oAttrYAxis.y1,
                x2: oAttrXAxis.x1,
                y2: oAttrYAxis.y2,
                width: intervalWidth,
                height: chartConfigOptions.availHeight,
                fill: 'transparent',
                stroke: xAxis.gridLineColor,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(xAxis.gridLineDashStyle),
                'stroke-width': xAxis.gridLineWidth,
            };
            sGridType = 'line';
            if (xAxis.alternateGridColor) {
                sGridType = 'rect';
                oAttrGridLine.stroke = 'transparent';
                oAttrGridLine['stroke-width'] = 0;
                oAttrGridLine.fill = xAxis.alternateGridColor;
            }
            oAttrTick = {
                x1: oAttrXAxis.x1,
                y1: oAttrYAxis.y2,
                x2: oAttrXAxis.x1,
                y2: oAttrYAxis.y2 + xAxis.tickHeight,
                stroke: xAxis.tickColor,
                'stroke-width': xAxis.tickWidth
            };
            if (xAxis.tickPosition === 'onaxis') {
                oAttrTick.y1 = oAttrYAxis.y2 - xAxis.tickHeight / 2;
                oAttrTick.y2 = oAttrTick.y1 + xAxis.tickHeight;
            } else if (xAxis.tickPosition === 'inside') {
                oAttrTick.y1 = oAttrYAxis.y2 - xAxis.tickHeight;
                oAttrTick.y2 = oAttrYAxis.y2;
            }
            oAttrLabel = {
                x: oAttrTick.x1,
                y: oAttrTick.y2 + xAxis.labelSpacing,
                dx: xAxisLabel.x,
                dy: xAxisLabel.y,
                text: '',
                style: xAxisLabel.style
            };
            switch (xAxisLabel.align) {
                case 'right':
                    oAttrLabel['text-anchor'] = 'end';
                    break;
                case 'center':
                    oAttrLabel['text-anchor'] = 'middle';
                    break;
            }
            chartConfigOptions.availX += oAttrTick.x1;
            var drillIntervalWidth = 0;
            //if drill option is specified and a bar is currently in drilled down state
            //then set the drill interval width equal to drillFixedWidth if specified else set it to normal interval width
            if (chartConfigOptions.drillActive && 1 === chartConfigOptions.drillActive) {
                drillIntervalWidth = chartConfigOptions.plotOptions[sChartType].drillFixedWidth && chartConfigOptions.plotOptions[sChartType].drillFixedWidth + oChartPlotOptions.padding - oChartPlotOptions.groupPadding || intervalWidth;
                chartConfigOptions.availWidth = drillIntervalWidth * (chartConfigOptions.drillDataLength + 1) + intervalWidth * (Math.max(iLength, 1) - (chartConfigOptions.drillDataLength + 1) - 1);
            } else {
                //width edit
                if ('timeline' === chartConfigOptions.chart.type.toLowerCase()) {
                    chartConfigOptions.availWidth = intervalWidth * Math.max(xAxisSeries.length - 1, 1);
                } else {
                    chartConfigOptions.availWidth = intervalWidth * Math.max(iLength - 1, 1);
                }
            }
            chartConfigOptions.plotIntervalWidth = intervalWidth;
            oAttr = {
                x: 10,
                y: 10,
                text: 'M',
                style: xAxisLabel.style
            };
            var oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
            chartConfigOptions.svgELE.appendChild(oText);
            var oDimAxis = MAQ.getObjectDimension(oText);
            chartConfigOptions.svgELE.removeChild(oText);
            bSkipPlot = false;
            if (xAxis.skipInterval < 0) {
                xAxis.skipInterval = 0;
            }
            iSkipInterval = xAxis.skipInterval;
            var iNumOfCharsAllowed = Math.ceil(chartConfigOptions.plotIntervalWidth * Math.max(iSkipInterval, 1) / oDimAxis.width);
            var sTempText = '', iPrevX, oDim, isDrillBar, oParam, oToolTip, iStartOffset;
            for (iCounter = 0; iCounter < xAxisSeries.length; iCounter += 1) {
                isDrillBar = false;
                //If the next bar is a drill bar
                if (chartConfigOptions.drillActive && 1 === chartConfigOptions.drillActive && iCounter + 1 > chartConfigOptions.drillIndex && iCounter <= chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength) {
                    isDrillBar = true;
                }
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                    oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                    if (sGridType === 'rect') {
                        if (iCounter % 2 === 0) {
                            oXAxisGridAreaGrpELE.appendChild(oGridLine);
                        }
                    } else {
                        oXAxisGridAreaGrpELE.appendChild(oGridLine);
                    }
                    oGrpXAxisLblNTick.appendChild(oTick);
                    if (xAxisLabel.enabled) {
                        iPrevX = oAttrLabel.x;
                        oAttrLabel.text = parseFloat(xAxisSeries[iCounter]);
                        oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                        /* Code for clipping the text to specified number of characters */
                        sTempText = oAttrLabel.text;
                        if (!xAxisLabel.formatter && oAttrLabel.text.length > iNumOfCharsAllowed) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                        }
                        if (xAxisLabel.rotation) {
                            oAttrLabel.transform = 'rotate(' + xAxisLabel.rotation + ' ' + oAttrLabel.x + ',' + oAttrLabel.y + ')';
                        }
                        oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                        oGrpXAxisLblNTick.appendChild(oLabel);
                        oDim = MAQ.getObjectDimension(oLabel);
                        MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oDim.height / 2);
                        if (xAxisLabel.staggerLines && !xAxisLabel.rotation) {
                            if (iCounter % 2 !== 0) {
                                MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oDim.height * 2);
                            }
                        }
                        oParam = {
                            value: sTempText,
                            config: chartConfigOptions,
                            type: 'axis'
                        };
                        oToolTip = chartConfigOptions.tooltipDiv;
                        MAQ.addEventListener(oLabel, 'mouseover', showToolTip, oParam);
                        MAQ.addEventListener(oLabel, 'mouseout', hideToolTip, oToolTip);
                    }
                    bSkipPlot = true;
                }
                if (iSkipInterval === 0) {
                    iSkipInterval = xAxis.skipInterval;
                    if (xAxisSeries.length - iCounter - 1 > Math.floor(xAxis.skipInterval / 2)) {
                        bSkipPlot = false;
                    }
                }
                if (iCounter === xAxisSeries.length - 2 && oDim && oAttrLabel.x + intervalWidth - iPrevX > oDim.width) {
                    bSkipPlot = false;
                }
                if (isDrillBar) {
                    //iStartOffset holds the width/2 value of the Bar just before the first drill bar.
                    iStartOffset = 0;
                    //if the iCounter equals to first or the last drill bar then set the value of iStartOffset to maintain centering of labels incase of unequal interval width for normal bars and drilled bars
                    if (iCounter === chartConfigOptions.drillIndex || iCounter === chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength) {
                        iStartOffset = intervalWidth / 2 - drillIntervalWidth / 2;
                    }
                    oAttrGridLine.width = drillIntervalWidth + iStartOffset;
                    oAttrTick.x1 += drillIntervalWidth + iStartOffset;
                } else {
                    oAttrGridLine.width = intervalWidth;
                    oAttrTick.x1 += intervalWidth;
                }
                oAttrGridLine.x = oAttrTick.x1;
                oAttrGridLine.x1 = oAttrTick.x1;
                oAttrGridLine.x2 = oAttrTick.x1;
                oAttrLabel.x = oAttrTick.x1;
                oAttrTick.x2 = oAttrTick.x1;
            }
        };
        /*
        MAQ.drawSecondaryYAxis: Renders both the axes along with secondary Y axis
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawSecondaryYAxis = function (chartConfigOptions) {
            'use strict';
            var iCounter = 0, index, tempText, iLength = 0, bottomSpacing = 0, leftSpacing = 0, sChartType = chartConfigOptions.chart.type, xAxis = chartConfigOptions.xAxis, yAxis = chartConfigOptions.yAxis.dualyAxis, xAxisLabel = xAxis.labels, yAxisLabel = yAxis.axisLeft.labels, xAxisSeries = xAxisLabel.series, yAxisSeries = yAxisLabel.series, xAxisSeriesLength = 0, yAxisSeriesLength = 0, yAxisLimit = 0, sStr = '', oAttr = {
                class: 'MAQCharts-chartArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
            }, oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null;
            /* Compute Space for X-Axis Labels */
            if (xAxisSeries.length <= 0) {
                iLength = chartConfigOptions.series[0].data.length;
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    xAxisSeries[iCounter] = iCounter + 1;
                }
            }
            /* Compute Space for Y-Axis Labels */
            iLength = yAxis.numberOfGridLines;
            var oNormalizedData1 = chartConfigOptions.plotOptions[sChartType].normalizedData[1];
            while (iLength !== (oNormalizedData1.max - oNormalizedData1.min) / oNormalizedData1.interval) {
                iLength += 1;
            }
            var iStart = oNormalizedData1.min, iInterval = oNormalizedData1.interval, yAxisSeries1 = [];
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                yAxisSeries1[iCounter] = iStart;
                iStart += iInterval;
            }
            oDataInfo = MAQ.getMinMax(yAxisSeries1, '', '');
            var rightSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisRight, oDataInfo.max, false);
            /* Compute Space for Y-Axis Labels */
            var oNormalizedData = chartConfigOptions.plotOptions[sChartType].normalizedData[0];
            iStart = oNormalizedData.min;
            iInterval = oNormalizedData.interval;
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                yAxisSeries[iCounter] = Math.round(iStart * 100) / 100;
                iStart += iInterval;
            }
            xAxisSeriesLength = xAxisSeries.length;
            yAxisSeriesLength = iLength;
            oDataInfo = MAQ.getMinMax(xAxisSeries, '', '');
            bottomSpacing = MAQ.getAxisSpacing(chartConfigOptions, xAxis, oDataInfo.max, true);
            oDataInfo = MAQ.getMinMax(yAxisSeries, '', '');
            leftSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisLeft, oDataInfo.max, false);
            /* Plot Y-Axis, Y-Axis-Ticks, Y-Axis-GridLines and Y-Axis-Labels */
            oAttr = { class: 'MAQCharts-yAxis-gridArea' };
            var oGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oAttr = { class: 'MAQCharts-yAxis' };
            var oGrpYAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxis);
            oAttr = { class: 'MAQCharts-yAxis-Grid-Labels-Ticks' };
            var oGrpYAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxisLblNTick);
            chartConfigOptions.yLabels = oGrpYAxisLblNTick;
            oGrpYAxisLblNTick.appendChild(oGridAreaGrpELE);

            var oAttrYAxis = {
                x1: 0 + leftSpacing,
                y1: 0,
                x2: 0 + leftSpacing,
                y2: chartConfigOptions.availHeight - bottomSpacing,
                stroke: yAxis.axisLeft.lineColor,
                'stroke-width': yAxis.axisLeft.lineWidth
            };
            oAttrYAxis.y2 += oAttrYAxis.y1;
            var oYAxisLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrYAxis);
            oGrpYAxis.appendChild(oYAxisLine);
            if (yAxis.shiftStartBy > 0) {
                oAttrYAxis.y1 += yAxis.shiftStartBy;
            }
            var intervalHeight = (oAttrYAxis.y2 - oAttrYAxis.y1) / yAxisSeriesLength;
            var oAttrTick = {
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y1,
                x2: oAttrYAxis.x1 + yAxis.axisLeft.tickWidth,
                y2: oAttrYAxis.y1,
                stroke: yAxis.axisLeft.tickColor,
                'stroke-width': yAxis.axisLeft.tickHeight
            };
            var oTick;
            var oAttrGridLine = {
                x: oAttrYAxis.x1,
                y: oAttrYAxis.y1,
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y1,
                x2: chartConfigOptions.availWidth - rightSpacing + oAttrYAxis.x1 - leftSpacing,
                y2: oAttrYAxis.y1,
                width: chartConfigOptions.availWidth - rightSpacing - leftSpacing,
                height: intervalHeight,
                fill: 'transparent',
                stroke: yAxis.gridLineColor,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(yAxis.gridLineDashStyle),
                'stroke-width': yAxis.gridLineWidth
            };
            var oGridLine, sGridType = 'line';
            if (yAxis.alternateGridColor) {
                sGridType = 'rect';
                oAttrGridLine.stroke = 'transparent';
                oAttrGridLine['stroke-width'] = 0;
                oAttrGridLine.fill = yAxis.alternateGridColor;
            }
            if (yAxis.axisLeft.tickPosition === 'onaxis') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.axisLeft.tickWidth / 2;
            } else if (yAxis.axisLeft.tickPosition === 'outside') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.axisLeft.tickWidth;
            }
            oAttrTick.x2 = oAttrTick.x1 + yAxis.axisLeft.tickWidth;
            var oAttrLabel = {
                x: oAttrTick.x1 - yAxis.axisLeft.labelSpacing,
                y: oAttrTick.y1,
                text: '',
                dx: yAxisLabel.x,
                dy: yAxisLabel.y,
                'text-anchor': 'end',
                style: yAxisLabel.style
            };
            var oLabel, oLabelDim, decimalLength;
            switch (yAxisLabel.align) {
                case 'left':
                    oAttrLabel.x -= leftSpacing - yAxis.axisLeft.labelSpacing;
                    oAttrLabel['text-anchor'] = 'start';
                    break;
                case 'center':
                    oAttrLabel.x -= leftSpacing / 2;
                    oAttrLabel['text-anchor'] = 'middle';
                    break;
            }
            if (yAxisLabel.rotation) {
                oAttrLabel.transform = 'rotate( ' + yAxisLabel.rotation + ' ' + oAttrLabel.x + ',' + oAttrLabel.y + ')';
            }
            chartConfigOptions.availY += oAttrGridLine.y1;
            chartConfigOptions.availHeight = intervalHeight * yAxisSeriesLength;
            chartConfigOptions.plotIntervalHeight = intervalHeight;
            var iNumOfCharsAllowed = 5;
            for (iCounter = yAxisSeriesLength; yAxisLimit <= iCounter; iCounter -= 1) {
                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                if (sGridType === 'rect') {
                    if (iCounter > 0) {
                        if (iCounter % 2 === 0) {
                            oGridAreaGrpELE.appendChild(oGridLine);
                        }
                    }
                } else {
                    oGridAreaGrpELE.appendChild(oGridLine);
                }
                oGrpYAxisLblNTick.appendChild(oTick);
                if (yAxisLabel.enabled) {
                    oAttrLabel.text = yAxisSeries[iCounter];
                    index = String(iCounter);
                    oAttrLabel.class = 'text' + index;
                    oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, yAxisLabel.formatter);
                    if (yAxisLabel.formatter) {
                        oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, yAxisLabel.formatter);
                    } else {
                        sStr = oAttrLabel.text.toString();
                        if (-1 !== sStr.indexOf('.')) {
                            decimalLength = sStr.substring(sStr.indexOf('.') + 1).length;
                            if (2 < decimalLength) {
                                sStr = oAttrLabel.text * 100 / 100;
                                sStr = sStr.toString();
                                oAttrLabel.text = Number(sStr.match(/^-?\d+(?:\.\d{0,2})?/));
                            }
                        }
                    }
                    tempText = oAttrLabel.text;
                    if (oAttrLabel.text.length > iNumOfCharsAllowed) {
                        oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                    }
                    oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                    oGrpYAxisLblNTick.appendChild(oLabel);
                    d3.select('.MAQCharts-yAxis-Grid-Labels-Ticks').select('.text' + String(iCounter)).append("svg:title").text(tempText);
                    oLabelDim = MAQ.getObjectDimension(oLabel);
                    MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oLabelDim.height / 4);
                }
                oAttrTick.y2 += intervalHeight;
                oAttrGridLine.y = oAttrTick.y2;
                oAttrGridLine.y1 = oAttrTick.y2;
                oAttrGridLine.y2 = oAttrTick.y2;
                oAttrTick.y1 = oAttrTick.y2;
                oAttrLabel.y = oAttrTick.y2;
            }
            oNormalizedData.min = 0;
            oNormalizedData.max = yAxisSeries[yAxisSeries.length - 1];
            oNormalizedData.sum = oNormalizedData.min + oNormalizedData.max;

            /* Plot secondary Y-axis */
            yAxisLabel = yAxis.axisRight.labels;
            oGrpYAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxisLblNTick);
            chartConfigOptions.yLabels = oGrpYAxisLblNTick;
            oGrpYAxisLblNTick.appendChild(oGridAreaGrpELE);
            oAttrYAxis = {
                x1: 0 + chartConfigOptions.availWidth - rightSpacing,
                y1: 0,
                x2: 0 + chartConfigOptions.availWidth - rightSpacing,
                y2: chartConfigOptions.availHeight,
                stroke: yAxis.axisRight.lineColor,
                'stroke-width': yAxis.axisRight.lineWidth
            };
            oAttrYAxis.y2 += oAttrYAxis.y1;
            oYAxisLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrYAxis);
            oGrpYAxis.appendChild(oYAxisLine);
            if (yAxis.shiftStartBy > 0) {
                oAttrYAxis.y1 += yAxis.shiftStartBy;
            }
            intervalHeight = (oAttrYAxis.y2 - oAttrYAxis.y1) / yAxisSeriesLength;
            oAttrTick = {
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y1,
                x2: oAttrYAxis.x1 + yAxis.axisRight.tickWidth,
                y2: oAttrYAxis.y1,
                stroke: yAxis.axisRight.tickColor,
                'stroke-width': yAxis.axisRight.tickHeight
            };
            if (yAxis.axisRight.tickPosition === 'onaxis') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.axisRight.tickWidth / 2;
            } else if (yAxis.tickPosition === 'outside') {
                oAttrTick.x1 = oAttrTick.x1 - yAxis.axisRight.tickWidth;
            }
            oAttrTick.x2 = oAttrTick.x1 + yAxis.axisRight.tickWidth;
            oAttrLabel = {
                x: oAttrTick.x2 + yAxis.axisRight.labelSpacing,
                y: oAttrTick.y1,
                text: '',
                dx: yAxisLabel.x,
                dy: yAxisLabel.y,
                'text-anchor': 'start',
                style: yAxisLabel.style
            };
            switch (yAxisLabel.align) {
                case 'left':
                    oAttrLabel.x -= leftSpacing - yAxis.axisRight.labelSpacing;
                    oAttrLabel['text-anchor'] = 'start';
                    break;
                case 'center':
                    oAttrLabel.x -= leftSpacing / 2;
                    oAttrLabel['text-anchor'] = 'middle';
                    break;
            }
            if (yAxisLabel.rotation) {
                oAttrLabel.transform = 'rotate( ' + yAxisLabel.rotation + ' ' + oAttrLabel.x + ',' + oAttrLabel.y + ')';
            }
            chartConfigOptions.availHeight = intervalHeight * yAxisSeriesLength;
            chartConfigOptions.plotIntervalHeight = intervalHeight;
            for (iCounter = yAxisSeriesLength; yAxisLimit <= iCounter; iCounter -= 1) {
                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                oGrpYAxisLblNTick.appendChild(oTick);
                if (yAxisLabel.enabled) {
                    oAttrLabel.text = yAxisSeries1[iCounter];
                    index = String(iCounter);
                    oAttrLabel.text = yAxisSeries1[iCounter];
                    oAttrLabel.class = 'textRight' + index;
                    var index = String(iCounter);
                    if (yFormatter.format(oAttrLabel.text) === "(Blank)") {
                        oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, yAxisLabel.formatter);
                    }
                    else {
                        oAttrLabel.text = yFormatter.format(oAttrLabel.text);
                    }
                    tempText = oAttrLabel.text;
                    if (oAttrLabel.text.length > iNumOfCharsAllowed) {
                        oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                    }
                    oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                    oGrpYAxisLblNTick.appendChild(oLabel);
                    d3.selectAll('.MAQCharts-yAxis-Grid-Labels-Ticks').select('.textRight' + String(iCounter)).append("svg:title").text(tempText);
                    oLabelDim = MAQ.getObjectDimension(oLabel);
                    MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oLabelDim.height / 4);
                }
                oAttrTick.y2 += intervalHeight;
                oAttrGridLine.y = oAttrTick.y2;
                oAttrGridLine.y1 = oAttrTick.y2;
                oAttrGridLine.y2 = oAttrTick.y2;
                oAttrTick.y1 = oAttrTick.y2;
                oAttrLabel.y = oAttrTick.y2;
            }
            /* Plot X-Axis, X-Axis-Ticks, and X-Axis-Labels */
            var oAttrXAxis = {
                x1: leftSpacing,
                y1: oAttrYAxis.y2,
                x2: chartConfigOptions.availWidth - rightSpacing,
                y2: oAttrYAxis.y2,
                stroke: xAxis.lineColor,
                'stroke-width': xAxis.lineWidth
            };
            oAttr = { class: 'MAQCharts-xAxis' };
            var oGrpXAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxis);
            oAttr = { class: 'MAQCharts-xAxis-Grid-Labels-Ticks' };
            var oGrpXAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxisLblNTick);
            chartConfigOptions.xLabels = oGrpXAxisLblNTick;
            oAttr = { class: 'MAQCharts-inner-xAxis-Grid-Labels-Ticks' };
            var oGrpInnerXAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpInnerXAxisLblNTick);
            chartConfigOptions.xInnerLabels = oGrpInnerXAxisLblNTick;
            var oXAxisGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oGrpXAxisLblNTick.appendChild(oXAxisGridAreaGrpELE);
            var oXAxisLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrXAxis);
            oGrpXAxis.appendChild(oXAxisLine);
            iLength = xAxisSeriesLength;
            oAttrXAxis.x2 = xAxis.usageWidth / 100 * (oAttrXAxis.x2 - oAttrXAxis.x1 - xAxis.shiftStartBy - rightSpacing - leftSpacing);
            oAttrXAxis.x1 += xAxis.shiftStartBy;
            var intervalWidth = (chartConfigOptions.availWidth - rightSpacing) / iLength;
            oAttrGridLine = {
                x: oAttrXAxis.x1,
                y: oAttrYAxis.y1,
                x1: oAttrXAxis.x1,
                y1: oAttrYAxis.y1,
                x2: oAttrXAxis.x1,
                y2: oAttrYAxis.y2,
                width: intervalWidth,
                height: chartConfigOptions.availHeight,
                fill: 'transparent',
                stroke: xAxis.gridLineColor,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(xAxis.gridLineDashStyle),
                'stroke-width': xAxis.gridLineWidth
            };
            sGridType = 'line';
            if (xAxis.alternateGridColor) {
                sGridType = 'rect';
                oAttrGridLine.stroke = 'transparent';
                oAttrGridLine['stroke-width'] = 0;
                oAttrGridLine.fill = xAxis.alternateGridColor;
            }
            oAttrTick = {
                x1: oAttrXAxis.x1,
                y1: oAttrYAxis.y2,
                x2: oAttrXAxis.x1,
                y2: oAttrYAxis.y2 + xAxis.tickHeight,
                stroke: xAxis.tickColor,
                'stroke-width': xAxis.tickWidth
            };
            if (xAxis.tickPosition === 'onaxis') {
                oAttrTick.y1 = oAttrYAxis.y2 - xAxis.tickHeight / 2;
                oAttrTick.y2 = oAttrTick.y1 + xAxis.tickHeight;
            } else if (xAxis.tickPosition === 'inside') {
                oAttrTick.y1 = oAttrYAxis.y2 - xAxis.tickHeight;
                oAttrTick.y2 = oAttrYAxis.y2;
            }
            oAttrLabel = {
                x: oAttrTick.x1,
                y: oAttrTick.y2 + xAxis.labelSpacing,
                dx: xAxisLabel.x,
                dy: xAxisLabel.y,
                text: '',
                style: xAxisLabel.style
            };
            var oAttrInnerLabel = {
                x: oAttrTick.x1,
                y: oAttrTick.y2 + xAxis.labelSpacing,
                dx: xAxisLabel.innerX,
                dy: xAxisLabel.innerY,
                'text-anchor': 'middle',
                text: '',
                style: xAxisLabel.innerStyle
            };
            switch (xAxisLabel.align) {
                case 'right':
                    oAttrLabel['text-anchor'] = 'end';
                    break;
                case 'center':
                    oAttrLabel['text-anchor'] = 'middle';
                    break;
            }
            chartConfigOptions.availX += oAttrTick.x1;
            chartConfigOptions.availWidth = intervalWidth * (iLength - 1);
            chartConfigOptions.plotIntervalWidth = intervalWidth;
            oAttr = {
                x: 10,
                y: 10,
                text: 'M',
                style: xAxisLabel.style
            };
            var oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
            chartConfigOptions.svgELE.appendChild(oText);
            var oDimAxis = MAQ.getObjectDimension(oText);
            chartConfigOptions.svgELE.removeChild(oText);
            var iNumOfCharsAllowed = 5;
            var bSkipPlot = false;
            if (xAxis.skipInterval < 0) {
                xAxis.skipInterval = 0;
            }
            var iSkipInterval = xAxis.skipInterval, sTempText = '', iPadding = chartConfigOptions.plotOptions.column.padding, iGrpPadding = chartConfigOptions.plotOptions.column.groupPadding, iInnerSeriesLen, bSetTooltip, oParam, oDim, oToolTip, jCount;
            for (iCounter = 0; iCounter < xAxisSeries.length; iCounter += 1) {
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    iInnerSeriesLen = 0;
                    bSetTooltip = false;
                    jCount = 0;
                    oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                    oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                    if (sGridType === 'rect') {
                        if (iCounter % 2 === 0) {
                            oXAxisGridAreaGrpELE.appendChild(oGridLine);
                        }
                    } else {
                        oXAxisGridAreaGrpELE.appendChild(oGridLine);
                    }
                    oGrpXAxisLblNTick.appendChild(oTick);

                    if (xAxisLabel.enabled) {
                        bSetTooltip = false;
                        oAttrLabel.text = parseFloat(xAxisSeries[iCounter]);
                        index = String(iCounter);
                        oAttrLabel.class = 'text' + index;
                        /* Code for clipping the text to specified number of characters */
                        if (xFormatter.format(oAttrLabel.text) === "(Blank)") {
                            oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                        }
                        else {
                            oAttrLabel.text = xFormatter.format(oAttrLabel.text);
                        }
                        if (xAxisLabel.rotation) {
                            oAttrLabel.transform = 'rotate(' + xAxisLabel.rotation + ' ' + oAttrLabel.x + ',' + oAttrLabel.y + ')';
                        }
                        tempText = oAttrLabel.text;
                        if (oAttrLabel.text.length > iNumOfCharsAllowed) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                        }
                        oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                        oGrpXAxisLblNTick.appendChild(oLabel);
                        d3.selectAll('.MAQCharts-xAxis-Grid-Labels-Ticks').select('.text' + String(iCounter)).append("svg:title").text(tempText);
                        oDim = MAQ.getObjectDimension(oLabel);
                        MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oDim.height / 2);
                        if (xAxisLabel.staggerLines && !xAxisLabel.rotation) {
                            if (iCounter % 2 !== 0) {
                                MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oDim.height * 2);
                            }
                        }
                        if (bSetTooltip) {
                            oParam = {
                                value: sTempText,
                                config: chartConfigOptions,
                                type: 'axis'
                            };
                            oToolTip = chartConfigOptions.tooltipDiv;
                            MAQ.addEventListener(oLabel, 'mouseover', showToolTip, oParam);
                            MAQ.addEventListener(oLabel, 'mouseout', showToolTip, oToolTip);
                        }
                    }
                    bSkipPlot = true;
                }
                if (iSkipInterval === 0) {
                    iSkipInterval = xAxis.skipInterval;
                    if (xAxisSeries.length - iCounter - 1 > Math.floor(xAxis.skipInterval / 2)) {
                        bSkipPlot = false;
                    }
                }
                if (iCounter === xAxisSeries.length - 2) {
                    bSkipPlot = false;
                }
                oAttrTick.x1 += intervalWidth;

                oAttrGridLine.x = oAttrTick.x1;
                oAttrGridLine.x1 = oAttrTick.x1;
                oAttrGridLine.x2 = oAttrTick.x1;
                oAttrLabel.x = oAttrTick.x1;
                oAttrTick.x2 = oAttrTick.x1;
            }
        };

        /* Create Histogram XY chart */
        MAQ.createHistogramChart = function (chartConfigOptions) {
            'use strict';
            d3.select('#container').style({ "overflow-y": "hidden", "overflow-x": "hidden" })
            if (chartConfigOptions.availHeight < 170 && chartConfigOptions.availWidth < 510) {
                chartConfigOptions.availHeight = 170;
                chartConfigOptions.availWidth = 510;
                d3.select('.MAQChartsSvgRoot').style({ "height": chartConfigOptions.availHeight + 'px', "width": chartConfigOptions.availWidth + 'px' })
                d3.select('#container').style({ "overflow-y": "auto", "overflow-x": "auto" })
            }
            if (chartConfigOptions.availWidth < 510) {
                chartConfigOptions.availWidth = 510;
                chartConfigOptions.availHeight = chartConfigOptions.availHeight - chartConfigOptions.availHeight / 10;
                d3.select('.MAQChartsSvgRoot').style("width", chartConfigOptions.availWidth + 'px');
                d3.select('#container').style("overflow-x", "auto");
            }
            if (chartConfigOptions.availHeight < 170) {
                chartConfigOptions.availHeight = 170;
                d3.select('.MAQChartsSvgRoot').style("height", chartConfigOptions.availHeight + 'px');
                d3.select('#container').style("overflow-y", "auto");
            }
            d3.select('.MAQChartsSvgRoot').attr("viewBox", "0 0 " + chartConfigOptions.availWidth + " " + chartConfigOptions.availHeight);
            MAQ.drawXAxisTitle(chartConfigOptions);
            MAQ.drawYAxisTitle(chartConfigOptions);
            MAQ.applyMargin(chartConfigOptions, chartConfigOptions.chart.margin);

            var oDataInfoX = {
                min: 0,
                max: 1
            }, oNormalizedDataXAxis;
            var oDataInfoY = {
                min: 0,
                max: 1
            }, oNormalizedDataYAxis;

            var oBubblePlotOptions = chartConfigOptions.plotOptions.histogram;
            var oSeries = chartConfigOptions.series;
            var iSeriesCounter = 0;
            var iSeriesLength = oSeries.length;
            var iCounter = 0;
            var iLength = 0;
            function getRadius() {
                return oBubblePlotOptions.radius;
            }
            //getting minimum, maximum for X and Y
            oDataInfoX = MAQ.getMinMax(oSeries[0].data.scaleX, oDataInfoX.min, oDataInfoX.max);
            oDataInfoY = MAQ.getMinMax(oSeries[0].data.scaleY, oDataInfoY.min, oDataInfoY.max);

            oBubblePlotOptions.bubbles = [];
            //Normalized X Axis and Y Axis according to grid lines 
            oNormalizedDataYAxis = MAQ.getNormalized_Min_Max_Interval(oDataInfoY.min, oDataInfoY.max, chartConfigOptions.yAxis.numberOfGridLines);
            oNormalizedDataXAxis = MAQ.getNormalized_Min_Max_Interval(oDataInfoX.min, oDataInfoX.max, chartConfigOptions.xAxis.numberOfGridLines);

            //Sum for x and y axis
            oNormalizedDataXAxis.sum = oNormalizedDataXAxis.max + Math.abs(oNormalizedDataXAxis.min);
            oNormalizedDataYAxis.sum = oNormalizedDataYAxis.max + Math.abs(oNormalizedDataYAxis.min);

            var oxAxisSeries = [];
            chartConfigOptions.xAxis.labels.series = [];
            var iStartX = oNormalizedDataXAxis.min, numberParts;
            iLength = oNormalizedDataXAxis.sum / oNormalizedDataXAxis.interval;

            //loop for xAxis labels
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                numberParts = iStartX.toString().split('.');
                if (numberParts[1] && numberParts[1].length > 2) {
                    oxAxisSeries.push(iStartX.toFixed(2));
                    chartConfigOptions.xAxis.labels.series[iCounter] = iStartX.toFixed(2);
                } else {
                    oxAxisSeries.push(iStartX);
                    chartConfigOptions.xAxis.labels.series[iCounter] = iStartX;
                }
                iStartX += oNormalizedDataXAxis.interval;
            }

            //For frequency data
            for (iCounter = 0; iCounter < chartConfigOptions.xAxis.numberOfGridLines; iCounter++) {
                chartConfigOptions.series[iSeriesCounter].data.frequency.data[iCounter] = 0;
            }
            for (iCounter = 0; iCounter < chartConfigOptions.yAxis.numberOfGridLines; iCounter++) {
                if (chartConfigOptions.series[iSeriesCounter].data.scaleX[iCounter] !== null && chartConfigOptions.series[iSeriesCounter].data.scaleY[iCounter] !== null
                && typeof chartConfigOptions.series[iSeriesCounter].data.scaleX[iCounter] === "number" && typeof chartConfigOptions.series[iSeriesCounter].data.scaleY[iCounter] === "number") {
                    var finalValue = chartConfigOptions.series[iSeriesCounter].data.scaleX[iCounter] - oxAxisSeries[0];
                    chartConfigOptions.series[iSeriesCounter].data.frequency.data[Math.floor(finalValue / oNormalizedDataXAxis.interval)]++;
                }
            }
            var oDataInfo = {
                min: 0,
                max: 1
            }, oColumnPlotOptions = chartConfigOptions.plotOptions.column;
            oNormalizedData;
            //get minimum and maximum for frqueny data
            oDataInfo = MAQ.getMinMax(chartConfigOptions.series[0].data.frequency.data, oDataInfo.min, oDataInfo.max);
            //get normalized data for frequency of points
            oNormalizedData = MAQ.getNormalized_Min_Max_Interval(oDataInfo.min, oDataInfo.max, chartConfigOptions.yAxis.numberOfGridLines);
            oNormalizedData.sum = oNormalizedData.max + Math.abs(oNormalizedData.min);
            chartConfigOptions.plotOptions.column.normalizedData = oNormalizedData;
            chartConfigOptions.plotOptions.histogram.normalizedData = oNormalizedDataXAxis;
            chartConfigOptions.plotOptions.histogram.normalizedData[0] = oNormalizedData;
            chartConfigOptions.plotOptions.histogram.normalizedData[1] = oNormalizedDataYAxis;

            MAQ.drawSecondaryYAxis(chartConfigOptions);

            var oClipAttr = { id: 'myclippath' };
            var oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'clipPath', oClipAttr);
            // Handle negative height and width
            if (chartConfigOptions.availWidth < 0 || chartConfigOptions.availHeight < 0)
                return;
            var oClipRectAttr = {
                x: 0,
                y: 0,
                width: chartConfigOptions.availWidth,
                height: chartConfigOptions.availHeight
            };
            oGrpELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oClipRectAttr));
            chartConfigOptions.svgELE.appendChild(oGrpELE);
            oAttr = {
                class: 'MAQCharts-plotArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                opacity: 0,
                'clip-path': 'url(#myclippath)'
            };
            oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oGrpELE);
            var leftSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisLeft, oDataInfo.max, false);
            var rightSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisRight, oDataInfo.max, false);


            //Create bars
            oSeries = chartConfigOptions.series[0].data.frequency;
            iSeriesCounter = 0;
            iSeriesLength = oSeries.length;
            iLength = oSeries.data.length;
            var oNYCord, oYCord;
            var oMin = oSeries.data.map(function (x) {
                return x - x;
            });

            var oMax = oMin.slice(0);
            oYCord = oMin.slice(0);
            oNYCord = oMin.slice(0);
            var bSeriesEnable = false, i, j, iCount;

            var oAttr = {
                class: 'MAQCharts-plotArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                opacity: 1,
                'clip-path': 'url(#' + chartConfigOptions.chart.renderTo + 'clippath)'
            };

            oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oGrpELE);
            if (chartConfigOptions.plotOptions.column.enabled === true) {
                //Height factor
                var iHeightFactor = chartConfigOptions.availHeight / (Math.abs(oNormalizedData.min) + oNormalizedData.max);
                var iZeroAxis = oNormalizedData.max / oNormalizedData.sum * chartConfigOptions.availHeight;
                var oBarWidth = chartConfigOptions.plotIntervalWidth - 2 * oColumnPlotOptions.padding;
                var fGrpPadding = oColumnPlotOptions.groupPadding;
                if (fGrpPadding < 0) {
                    fGrpPadding = 0;
                }
                if (fGrpPadding > 100) {
                    fGrpPadding = 100;
                }
                fGrpPadding = fGrpPadding / 100 * oBarWidth;
                if (!oColumnPlotOptions.stacked) {
                    oBarWidth = oBarWidth - fGrpPadding * (iSeriesLength - 1);
                }
                var oRectAttr = {
                    x: 0,
                    y: 0,
                    rx: oColumnPlotOptions.borderRadius,
                    ry: oColumnPlotOptions.borderRadius,
                    width: oBarWidth,
                    height: 0,
                    fill: '',
                    'z-index': 5,
                    opacity: oColumnPlotOptions.opacity,
                    stroke: oColumnPlotOptions.borderColor,
                    'stroke-width': oColumnPlotOptions.borderWidth,
                    'stroke-dasharray': MAQ.computeStrokeDashStyle(oColumnPlotOptions.borderDashStyle)
                };
                var oValueBoxAttr = {
                    x: 0,
                    y: 0,
                    text: null,
                    'text-anchor': 'middle',
                    style: oColumnPlotOptions.valueBox.style
                };
                var oBgRectAttr = {
                    x: 0,
                    y: 0,
                    rx: oColumnPlotOptions.borderRadius,
                    ry: oColumnPlotOptions.borderRadius,
                    width: chartConfigOptions.plotIntervalWidth - oColumnPlotOptions.padding + 1,
                    height: chartConfigOptions.availHeight,
                    fill: oColumnPlotOptions.background.color,
                    'z-index': 5,
                    opacity: oColumnPlotOptions.opacity
                }, oGrpColumnChart, oDataArray, iXcord, iYcord, oRectangle, isDrillBar, height, sColor, oRect, oLineAttr, oDrillLine, oToolTip, oParam, oValueBox, sPatID;
                oColumnPlotOptions.columns = [];
                iSeriesCounter = 0;
                oAttr = {
                    class: 'MAQCharts-plotArea-columnChart-' + (iSeriesCounter + 1)
                };
                oGrpColumnChart = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                oGrpELE.appendChild(oGrpColumnChart);
                oColumnPlotOptions.columns.push(oGrpColumnChart);
                oRectAttr.fill = oColumnPlotOptions.color[iSeriesCounter];
                oDataArray = oSeries.data;
                iLength = oDataArray.length;
                iXcord = 0;
                iYcord = 0;
                //Start drawing bars
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    if (oColumnPlotOptions.similarColor === true) {
                        oRectAttr.fill = oColumnPlotOptions.color[iCounter];
                    }
                    height = iHeightFactor * Math.abs(oDataArray[iCounter]);
                    iYcord = iZeroAxis - height;
                    if (oDataArray[iCounter] < 0) {
                        iYcord = iZeroAxis;
                    }
                    oRectAttr.x = iXcord + oColumnPlotOptions.padding;
                    if (oDataArray[iCounter] < 0) {
                        oRectAttr.y = iYcord + oNYCord[iCounter];
                        oNYCord[iCounter] += height;
                    } else {
                        oRectAttr.y = iYcord - oYCord[iCounter];
                        oYCord[iCounter] += height;
                    }
                    oRectAttr.height = height;
                    sColor = oColumnPlotOptions.color[iCounter];

                    if (iSeriesLength === 1 && oColumnPlotOptions.multiColored === true) {
                        oRectAttr.fill = sColor;
                    }
                    if (oRectAttr.height < 0 || oRectAttr.width < 0)
                        return;
                    if(typeof oRectAttr.height === "number" && typeof oRectAttr.width === "number") {
                        oRect = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oRectAttr);
                        oGrpColumnChart.appendChild(oRect);

                        oParam = {
                            seriesIndex: iSeriesCounter,
                            isPosavail: true,
                            position: iCounter,
                            config: chartConfigOptions,
                            category: "column"
                        };
                        if (chartConfigOptions.plotOptions.column.tooltip.enabled) {
                            oToolTip = chartConfigOptions.tooltipDiv;
                            MAQ.addEventListener(oRect, 'mouseover', showToolTip, oParam);
                            MAQ.addEventListener(oRect, 'mouseout', hideToolTip, oToolTip);
                        }
                        iXcord += oColumnPlotOptions.fixedWidth && oColumnPlotOptions.fixedWidth + oColumnPlotOptions.padding - oColumnPlotOptions.groupPadding || chartConfigOptions.plotIntervalWidth;
                }
            }
                //add hover styles
                if (oColumnPlotOptions.hover.enabled) {
                    MAQ.styles.addRule('#' + chartConfigOptions.chart.renderTo + ' .' + oAttr.class + '>rect:hover', MAQ.styles.jsonToRule(oColumnPlotOptions.hover.style));
                }
            }
            //Bubble drawing
            if (chartConfigOptions.plotOptions.histogram.enabled === true) {
                oSeries = chartConfigOptions.series;
                iSeriesLength = oSeries.length;
                var iHeightFactorBubble = chartConfigOptions.availHeight / (Math.abs(oNormalizedDataYAxis.min) + oNormalizedDataYAxis.max);
                var iWidthFactorBubble = chartConfigOptions.availWidth / (Math.abs(oNormalizedDataXAxis.min) + oNormalizedDataXAxis.max);

                var iZeroXAxis = oNormalizedDataXAxis.min / oNormalizedDataXAxis.sum * chartConfigOptions.availWidth;
                iZeroXAxis = Math.abs(iZeroXAxis);
                var iZeroYAxis = oNormalizedDataYAxis.max / oNormalizedDataYAxis.sum * chartConfigOptions.availHeight;

                //Bubble attributes
                var oBubbleAttr = {
                    cx: 0,
                    cy: 0,
                    r: oBubblePlotOptions.radius,
                    fill: '#0066CC',
                    stroke: oBubblePlotOptions.borderColor,
                    'stroke-dasharray': MAQ.computeStrokeDashStyle(oBubblePlotOptions.borderDashStyle)
                }, oGrpBubbleChart, oDataArrayBubble, iXcordBubble, iYcordBubble, heightBubble, widthBubble, oBubble, oParamBubble, oToolTipBubble;

                //Draw all the bubbles
                oAttr = {
                    class: 'MAQCharts-plotArea-bubbleChart-' + (iSeriesCounter + 1)
                };
                oGrpBubbleChart = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                oGrpELE.appendChild(oGrpBubbleChart);
                oBubblePlotOptions.bubbles.push(oGrpBubbleChart);
                if (oBubblePlotOptions.color[iSeriesCounter]) {
                    oBubbleAttr.fill = oBubblePlotOptions.color[iSeriesCounter];
                    oBubbleAttr.stroke = oBubblePlotOptions.color[iSeriesCounter];
                } else {
                    oBubbleAttr.fill = oBubblePlotOptions.color[iSeriesCounter % oBubblePlotOptions.color.length];
                    oBubbleAttr.stroke = oBubblePlotOptions.color[iSeriesCounter % oBubblePlotOptions.color.length];
                }
                oDataArrayBubble = oSeries[iSeriesCounter].data;
                iLength = oDataArrayBubble.scaleX.length;
                iXcordBubble = 0;
                iYcordBubble = 0;
                iSeriesCounter = 0;
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    if (isSeriesEnabled(oSeries, iSeriesCounter) && oDataArrayBubble.scaleY[iCounter] !== null && oDataArrayBubble.scaleX[iCounter] !== null) {
                        heightBubble = iHeightFactorBubble * Math.abs(oDataArrayBubble.scaleY[iCounter]);
                        widthBubble = iWidthFactorBubble * Math.abs(oDataArrayBubble.scaleX[iCounter]);
                        iYcordBubble = iZeroYAxis - heightBubble;
                        if (oDataArrayBubble.scaleY[iCounter] < 0) {
                            iYcordBubble = iYcordBubble + 2 * heightBubble;
                        }
                        if (oDataArrayBubble.scaleX[iCounter] >= 0) {
                            iXcordBubble = iZeroXAxis + widthBubble;
                        } else {
                            iXcordBubble = iZeroXAxis - widthBubble;
                        }
                        if (iSeriesLength === 1) {
                            if (oBubblePlotOptions.color[iCounter]) {
                                oBubbleAttr.fill = oBubblePlotOptions.color[iCounter];
                                oBubbleAttr.stroke = oBubblePlotOptions.color[iCounter];
                            } else {
                                oBubbleAttr.fill = oBubblePlotOptions.color[iCounter % oBubblePlotOptions.color.length];
                                oBubbleAttr.stroke = oBubblePlotOptions.color[iCounter % oBubblePlotOptions.color.length];
                            }
                        }
                        if(typeof iXcordBubble === "number" && typeof iYcordBubble === "number") {
                            oBubbleAttr.cx = Math.abs(iXcordBubble);
                            oBubbleAttr.cy = iYcordBubble;
                            oBubble = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oBubbleAttr);
                            oGrpBubbleChart.appendChild(oBubble);
                            oParamBubble = {
                                seriesIndex: iSeriesCounter,
                                isPosavail: true,
                                position: iCounter,
                                config: chartConfigOptions,
                                category: "histogram"
                            };
                            if (chartConfigOptions.plotOptions.histogram.tooltip.enabled) {
                                oToolTipBubble = chartConfigOptions.tooltipDiv;
                                MAQ.addEventListener(oBubble, 'mouseover', showToolTip, oParamBubble);
                                MAQ.addEventListener(oBubble, 'mouseout', hideToolTip, oToolTipBubble);
                            }
                        }
                    }
                }
            }
        };

        /*
        MAQ.addEventListener: Attaches code to object's event
        @param {oELE} object to attach event
        @param {sEventName} event name
        @param {sFunctionName} function name
        @param {oParam} parameters object
        */
        MAQ.addEventListener = function (oELE, sEventName, sFunctionName, oParam) {
            'use strict';
            if ('string' === typeof sFunctionName && 'function' === typeof window[sFunctionName]) {
                oELE.addEventListener(sEventName, function (event) {
                    window[sFunctionName](event, oParam);
                }, true);
            } else if ('function' === typeof sFunctionName) {
                oELE.addEventListener(sEventName, function (event) {
                    sFunctionName(event, oParam);
                }, true);
            } else {
                console.log(sFunctionName + ' is not a function!');
            }
        };
        /*
        MAQ.removeEventListener: Removes code from object's event
        @param {oELE} object to attach event
        @param {sEventName} event name
        @param {sFunctionName} function name
        @param {oParam} parameters object
        */
        MAQ.removeEventListener = function (oELE, sEventName, sFunctionName, oParam) {
            'use strict';
            oELE.removeEventListener(sEventName, function (event) {
                window[sFunctionName](event, oParam);
            }, true);
        };
        /*
        MAQ.getDataIndexPosition: Gets the current data index based on mouse pointer position on SVG
        @param {oSVGCord} SVG coordinates
        @param {oCalCord} Calculated coordinates
        @param {fInterval} step interval on x axis
        */
        MAQ.getDataIndexPosition = function (oSVGCord, oCalCord, fInterval) {
            'use strict';
            var fPt1 = oSVGCord.x - fInterval, fPt2 = oSVGCord.x + fInterval, oFilterData = oCalCord.filter(function (x) {
                return x > fPt1 && x < fPt2;
            });
            if (oFilterData.length === 1) {
                return oCalCord.indexOf(oFilterData[0]);
            } else {
                fPt1 = oSVGCord.x - oFilterData[0];
                fPt2 = oFilterData[1] - oSVGCord.x;
                if (fPt1 < fPt2) {
                    return oCalCord.indexOf(oFilterData[0]);
                } else {
                    return oCalCord.indexOf(oFilterData[1]);
                }
            }
        };
        /*
        MAQ.getMax: Gets maximum value
        @param {array} array of values
        */
        MAQ.getMax = function (array) {
            'use strict';
            return Math.max.apply(Math, array);
        };
        /*
        MAQ.showToolTip: Gets maximum value
        @param {array} array of values
        */
        MAQ.getMin = function (array) {
            'use strict';
            return Math.min.apply(Math, array);
        };
        /*
        MAQ.arraySum: Gets sum of values
        @param {array} array of values
        */
        MAQ.arraySum = function (array) {
            'use strict';
            var i = 0, L, sum = 0;
            for (L = array.length; i < L; i += 1) {
                sum += array[i];
            }
            return sum;
        };
        /* Time-Line functions*/
        var bNavigatorDrag = false, bExpanderDrag = false, movingSource = '', sSelectedExpander = '', iCurrentNavigatorX;

        /*
        clickEventListener: Renders total value in center of both bows
        @param {evt} event
        @param {oParam} user configuration parameters
        */
        function clickEventListener(evt, oParam) {
            'use strict';
            var oConfig = oParam.config;
            var oSVG = oConfig.svgELE;
            var fInterval = oConfig.plotIntervalWidth, oSeries = oConfig.series[oParam.seriesIndex], oLabels = oConfig.series.label, oPoint = oSVG.createSVGPoint();
            oPoint.x = evt.clientX;
            oPoint.y = evt.clientY;
            var oSVGCord = oPoint.matrixTransform(oSVG.getScreenCTM().inverse()), iSelectedIndex = 0;
            if (oParam.isPosavail) {
                iSelectedIndex = oParam.position;
            } else {
                iSelectedIndex = MAQ.getDataIndexPosition(oSVGCord, oSeries.xPos, fInterval);
            }
            if (oConfig.plotOptions.column.drill) {
                drillDown(oConfig, iSelectedIndex);
            }
            if (typeof window[oConfig.onClick.clickFunction] === 'function') {
                /* */
                switch (oConfig.chart.type) {
                    case 'pie':
                    case 'donut':
                        window[oConfig.onClick.clickFunction](oSeries.name, '', oSeries.data);
                        break;
                    default:
                        window[oConfig.onClick.clickFunction](oSeries.name, oLabels[iSelectedIndex], oSeries.data[iSelectedIndex]);
                        break;
                }
            }
        }

        /*
        MAQ.getSeriesValidation: Validate waterfall chart data series
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.getSeriesValidation = function (chartConfigOptions) {
            'use strict';
            var oChartSeries = [], jCount = 0, boolDataCheck = false, oChartPlotOptions = chartConfigOptions.plotOptions[chartConfigOptions.chart.type];
            function validateDataNode(iDataNode) {
                if (!parseFloat(iDataNode)) {
                    return true;
                }
            }
            for (jCount = 0; jCount < chartConfigOptions.series.length; jCount += 1) {
                if (oChartPlotOptions.errorCheck.notNullSeries.indexOf(chartConfigOptions.series[jCount].name) !== -1) {
                    boolDataCheck = chartConfigOptions.series[jCount].data.every(validateDataNode);
                    if (!chartConfigOptions.series[jCount].data.length || boolDataCheck) {
                        throw 'No data';
                    }
                }
            }
            return oChartSeries;
        };
        MAQ.getChartSeries = function (oLabelArray, chartConfigOptions) {
            'use strict';
            var oChartSeries = [], jCount = 0;
            for (jCount = 0; jCount < chartConfigOptions.series.length; jCount += 1) {
                if (oLabelArray.indexOf(chartConfigOptions.series[jCount].name) !== -1) {
                    oChartSeries.push(chartConfigOptions.series[jCount]);
                }
            }
            return oChartSeries;
        };
        /*MAQ.getAnimationConfigurations: Fetch the configuration for animation
         @param {chartConfigOptions} user configuration parameters
         */
        function getAnimationConfigurations(chartConfigOptions) {
            'use strict';
            var animationConfig = {
                x: 0,
                y: 0,
                width: 0,
                height: chartConfigOptions.availHeight,
                propertyToAnimate: 'width',
                targetValue: chartConfigOptions.availWidth
            };
            switch (chartConfigOptions.animation.type) {
                case 1:
                    animationConfig.x = 0;
                    animationConfig.y = 0;
                    animationConfig.width = 0;
                    animationConfig.height = chartConfigOptions.availHeight;
                    animationConfig.propertyToAnimate = 'width';
                    animationConfig.targetValue = chartConfigOptions.availWidth;
                    break;
                case 2:
                    animationConfig.x = 0;
                    animationConfig.y = chartConfigOptions.availHeight;
                    animationConfig.width = chartConfigOptions.availWidth;
                    animationConfig.height = chartConfigOptions.availHeight;
                    animationConfig.propertyToAnimate = 'y';
                    animationConfig.targetValue = 0;
                    break;
            }
            return animationConfig;
        }
        /*
        onRangeChange: calls the user-defined callback function after moving the slider of lift chart
        @param {config} user configuration parameters
        @param {start} the x-position of left slider
        @param {end} the x-position of right slider
        */
        function onRangeChange(config, start, end) {
            'use strict';
            if (typeof config.plotOptions.lift.onDisplayAreaChange === 'function') {
                var circleCoordsStart = MAQ.getIntersectionPoints(config, start);
                var circleCoordsEnd = MAQ.getIntersectionPoints(config, end);
                var obj = {
                    values: circleCoordsEnd.values,
                    range: [
                      circleCoordsStart.higherIndex,
                      circleCoordsEnd.higherIndex
                    ]
                };
                config.plotOptions.lift.onDisplayAreaChange(obj);
            }
        }
        MAQ.charts(config);

    })(config);
}