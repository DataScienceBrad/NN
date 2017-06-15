/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 * MAQ Charts 
 */
/*JSHint Count = 0*/
var prevYSeries = {};
var legendsEnable = {};

function getLegendEnable() {
    return legendsEnable;
}
function setLegendEnable(iCounter, total) {
    legendsEnable[iCounter] = total;
}
function MAQDrawChart(DataStyle, settings, nodeData, series, assignData, valueFormatter) {
    //data binding
    var dataView = DataStyle;
    //format options
    var configChange = settings;

    var config = {
        "chart": {
            "renderTo": "container",
            "isResponsive": true,
            "type": "bubble",
            "margin": [
                10,
                10,
                10,
                10
            ],
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
                "fill": "#0066CC",
                "fontSize": "24px",
                "fontFamily": "Segoe UI"
            }
        },
        "plotOptions": {
            "bubble": {
                "color": [
                ],
                "xAxisLabelsCount": 7
            }
        },
        "legend": {
            "enabled": true,
            "enableClick": true,
            "align": "left",
            "verticalAlign": "top",
            "verticalAlignLegend": true,
            "borderColor": "white",
            "borderStyle": "",
            "borderWidth": 1,
            "borderRadius": 20,
            "layout": "horizontal",
            "floating": false,
            "symbolWidth": 10,
            "symbolPadding": 3,
            "symbolRadius": 30,
            "individualDistance": 10,
            "lineHeight": 5,
            "style": {
                "fill": "#444",
                "fontSize": "12px",
                "fontFamily": "Segoe UI"
            },
            "x": 40,
            "enableTextClipping": true,
            "clipTextFrom": "right",
            "clippedTextLength": 10,
            "quadrantLabels": [settings.quadrant3, settings.quadrant4, settings.quadrant1, settings.quadrant2]
        },
        "xAxis": {
            "title": {
                "align": "center",
                "text": settings.xTitleText,
                "style": {
                    "fill": "#777777",
                    "fontSize": "16px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "labels": {
                "enabled": settings.showxAxisLabel,
                "align": "center",
                "series": [],
                "formatter": "scaleFormatter",
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "#777777",
                    "fontSize": "11px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 8,
            "gridLineX": settings.quadrantDivisionX,
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
            "usageWidth": 98
        },
        "yAxis": {
            "title": {
                "align": "center",
                "text": settings.yTitleText,
                "style": {
                    "fill": "#777777",
                    "fontSize": "16px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "labels": {
                "enabled": settings.showyAxisLabel,
                "align": "right",
                "series": [],
                "formatter": "scaleFormatter",
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "#777777",
                    "fontSize": "11px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 8,
            "gridLineY": settings.quadrantDivisionY,
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
        "tooltip": {
            "enabled": true,
            "customTooltip": null,
            "style": {
                "padding": "2px 5px",
                "border": "2px solid silver",
                "backgroundColor": "#fff",
                "color": "#444",
                "fontSize": "16px",
                "fontFamily": "Segoe UI"
            }
        },
        "series": [
            {
            }
        ]
    };
    //data binding
    var xAxisName = dataView.metadata.columns[assignData[0]].displayName;
    var yAxisName = dataView.metadata.columns[assignData[1]].displayName;
    if (!settings.showQuadrants) {
        config.legend.quadrantLabels = ["", "", "", ""];
    }
    if (!settings.showxAxis) {
        config.xAxis.title = "";
        config.xAxis.labels.enabled = false;
    }
    if (!settings.showyAxis) {
        config.yAxis.title = "";
        config.yAxis.labels.enabled = false;
    }
    if (!settings.showxAxisTitle)
        config.xAxis.title = "";
    if (!settings.showyAxisTitle)
        config.yAxis.title = "";
    config.series = series;
    for (var dIterator = 0; dIterator < nodeData.dataPoints.length; dIterator++) {
        config.plotOptions.bubble.color.push(nodeData.dataPoints[dIterator].color);
    }
    Xformatter = valueFormatter.create({ format: DataStyle.metadata.columns[assignData[0]].format });
    Yformatter = valueFormatter.create({ format: DataStyle.metadata.columns[assignData[1]].format });
    (function (config) {
        /*jslint white: true, devel:true, browser: true, this:true, for:true  */
        /*global MAQ, window,oDimensionTotalTitle,oGrpELESum,oData*/
        /*Create the MAQ Object*/
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
                if (!sInput || isNaN(sInput)) {
                    return 'N/A';
                }
                var fTempValue = parseFloat(sInput), sTempValue, aDigits, iTempValue, rPattern, sCurrency, sIntegerDigits, sFractionDigits, decimalLength;
                if (fTempValue < 0) {
                    sInput = -1 * fTempValue;
                } else {
                    sInput = fTempValue;
                }
                // Check for validity of decimal places parameter
                if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
                    iDecimalPlaces = 0;  // Default value is 0
                }
                sTempValue = sInput.toString();
                if (-1 !== sTempValue.indexOf('.')) {
                    decimalLength = sTempValue.substring(sTempValue.indexOf('.') + 1).length;

                    //to remove repeating labels when there is decimal value in labels.
                    if (decimalLength > 2) {
                        sTempValue = fTempValue.toFixed(2).toString();
                    }
                    else {
                        sTempValue = fTempValue.toString();
                    }
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
                    waterfall: {
                        padding: 10,
                        grouping: {
                            enabled: false,
                            index: 0
                        },
                        colors: [],
                        opacity: 0.8,
                        borderColor: '',
                        borderRadius: 0,
                        borderWidth: 1,
                        staggeredLine: {
                            align: 'left',
                            enabled: true,
                            staggeredLineStyle: {
                                'border-top': '2px dashed #2f2f2f',
                                'z-index': 1000
                            }
                        },
                        singleColumnStack: {
                            enabled: false,
                            stackLabel: '',
                            formatter: ''
                        },
                        isCustomLegends: '',
                        isBudgetForecastDiff: true,
                        auxiliaryLabel: {
                            height: 20,
                            formatter: '',
                            style: {
                                fontSize: '12px',
                                fontFamily: 'Segoe UI',
                                color: '#444',
                                textAlign: 'right'
                            }
                        },
                        section: {
                            labelStyle: {
                                color: '#444',
                                fontSize: '12px',
                                fontFamily: 'Segoe UI',
                                paddingLeft: '5px'
                            },
                            horizontal: { division: [] },
                            vertical: {
                                division: [],
                                seriesDivision: {
                                    chartMetric: [],
                                    chartMetricStyle: [],
                                    chartLabelStyle: [],
                                    nonChartMetric: [],
                                    nonChartMetricStyle: [],
                                    nonChartLabelStyle: []
                                }
                            }
                        },
                        errorCheck: { notNullSeries: ['Revenue'] }
                    },
                    brick: {
                        opacity: '1',
                        style: {
                            width: '159px',
                            height: '159px',
                            marginLeft: '61px',
                            marginTop: '15px'
                        },
                        brickCount: 10,
                        type: 'vertical',
                        brickStyle: {
                            border: '0.5px solid #000',
                            height: '15px',
                            width: '15px',
                            padding: '0',
                            margin: '0'
                        }
                    },
                    line: {
                        stepLine: false,
                        nullValues: 'ignore',
                        marker: {
                            enabled: true,
                            fillColor: '#FFF',
                            lineWidth: 2,
                            lineColor: null,
                            width: 0,
                            shape: ['circle'],
                            hover: {
                                enabled: true,
                                style: { opacity: 1 }
                            },
                            style: { opacity: 0.5 }
                        },
                        color: ['#0066CC'],
                        lineWidth: 2,
                        lineDashStyle: 'shortdash'
                    },
                    lift: {
                        dragAreaFill: 'silver',
                        dragAreaOpacity: 0.5,
                        dragLineStyle: '5,5',
                        dragLineWidth: 4,
                        dragLineColor: 'black',
                        dragWindowFill: 'transparent',
                        dragWindowBorderStyle: '',
                        dragWindowOpacity: 0,
                        dragCircleFill: '#0066CC',
                        intersectionMarker: {
                            radius: 20,
                            strokeColor: 'white',
                            strokeWidth: 4,
                            fontStyle: {
                                fill: '#fff',
                                fontSize: '10px',
                                fontFamily: 'Segoe UI',
                                fontWeight: 'bold'
                            },
                            dx: 0,
                            dy: 0
                        },
                        onDisplayAreaChange: function () {
                            return;
                        }
                    },
                    area: {
                        stepLine: false,
                        marker: {
                            enabled: false,
                            shape: ['circle'],
                            fillColor: '',
                            lineWidth: 1,
                            lineColor: '',
                            width: 4,
                            hover: {
                                enabled: false,
                                style: { opacity: 1 }
                            },
                            style: {}
                        },
                        color: [],
                        opacity: 0.8,
                        lineWidth: 1,
                        lineDashStyle: '',
                        strokes: []
                    },
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
                    bar: {
                        padding: 5,
                        groupPadding: 2,
                        stacked: true,
                        multiColored: true,
                        color: [],
                        hover: {
                            enabled: true,
                            style: { opacity: 0.7 }
                        },
                        opacity: 0.8,
                        borderColor: '',
                        borderRadius: 0,
                        borderWidth: 1,
                        pushBlankSeries: true,
                        borderDashStyle: '',
                        valueBox: {
                            enabled: false,
                            position: 'top',
                            marginBottom: 0,
                            style: {
                                fill: '#444',
                                fontSize: '14px',
                                fontFamily: 'Segoe UI'
                            }
                        }
                    },
                    pie: {
                        color: [],
                        opacity: 0.8,
                        borderColor: '',
                        borderWidth: 1,
                        borderDashStyle: '',
                        hover: {
                            enabled: true,
                            style: {
                                cursor: 'pointer',
                                opacity: 0.6
                            }
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: null,
                            lineWidth: 1,
                            lineColor: '#333333',
                            style: {
                                color: '#333',
                                fontSize: '13px',
                                fontFamily: 'Segoe UI'
                            }
                        },
                        sliceOnSelect: true,
                        resetPreviousSliced: true,
                        emptyPie: false
                    },
                    donut: {
                        color: [],
                        opacity: 1,
                        borderColor: '',
                        borderWidth: 1,
                        borderDashStyle: '',
                        innerRadius: false,
                        outerRadius: false,
                        dataLabels: {
                            enabled: true,
                            formatter: null,
                            lineWidth: 1,
                            multiline: true,
                            maxChars: 25,
                            lineLengthFactor: 8,
                            lineColor: '#333333',
                            style: {
                                color: '#333',
                                fontSize: '16px',
                                fontFamily: 'Segoe UI'
                            }
                        },
                        showTotal: {
                            enabled: true,
                            formatter: '',
                            title: {
                                text: '',
                                style: { 'text-anchor': 'middle' },
                                x: 0,
                                y: 0
                            },
                            spacing: 18,
                            sumvalue: {
                                style: { 'text-anchor': 'middle' },
                                x: 0,
                                y: 0
                            }
                        }
                    },
                    gauge: {
                        color: [
                            '#E71E27',
                            '#FBD116',
                            '#6BBE56'
                        ],
                        //zone colors
                        opacity: 1,
                        borderColor: '#000',
                        gaugeWidth: 40,
                        gaugeAngle: 180,
                        // Do not update value.. Functionality yet to be implemented.
                        pointerHeight: 17,
                        pointerWidth: 17,
                        borderWidth: 0,
                        borderDashStyle: '',
                        zone1Angle: 20,
                        // red zone angle
                        zone2Angle: 20,
                        // yelow zone angle
                        radius: 120,
                        // outer radius for gauge chart
                        minValue: 0,
                        maxValue: 400,
                        target: 200,
                        // target line value
                        variance: '-8.8%',
                        // variance value,
                        varianceText: 'MoM Variance',
                        pointerValue: 100,
                        // pointer value
                        dataLabels: {
                            enabled: true,
                            LabelStyle: {
                                color: 'black',
                                fontSize: '12px',
                                fontFamily: 'Segoe UI',
                                padding: '0px',
                                background: '#fff'
                            },
                            ValueStyle: {
                                color: 'green',
                                fontSize: '26px',
                                fontFamily: 'Segoe UI',
                                padding: '10px',
                                formatter: '',
                                targetLineColor: '#fff',
                                pointerColor: '#333'
                            },
                            ActualValueStyle: {
                                color: 'orange',
                                fontSize: '30px',
                                fontFamily: 'Segoe UI'
                            }
                        }
                    },
                    funnel: {
                        type: 1,
                        color: [],
                        opacity: 0.8,
                        borderColor: '',
                        borderWidth: 1,
                        borderDashStyle: '',
                        secondaryLabels: {
                            enabled: true,
                            style: {
                                fill: '#000',
                                fontSize: '12px',
                                fontFamily: 'Segoe UI'
                            },
                            dx: 0,
                            dy: 0
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: null,
                            position: 'center',
                            lineWidth: 1,
                            lineColor: '#333333',
                            dx: 0,
                            dy: 0,
                            style: {
                                fill: '#000',
                                fontSize: '13px',
                                fontFamily: 'Segoe UI'
                            }
                        }
                    },
                    horizontalFunnel: {
                        DrillDown: 'Some',
                        color: [
                            '9b4f95',
                            'ac88b5',
                            '682079'
                        ],
                        direction: true,
                        connector: true,
                        RectangleSize: 78,
                        ConnectorSize: 15,
                        GapBetweenConnector: 10,
                        MaxHeight: 133,
                        content: {
                            data: [
                                [
                                    'Select Lead 0%',
                                    40505247.0896,
                                    1262,
                                    0.20854193155066,
                                    40420952.4546
                                ],
                                [
                                    'Qualify Lead 10%',
                                    23683584.6195,
                                    586,
                                    -10.83350373574327,
                                    26561080.2395
                                ]
                            ]
                        },
                        legends: [
                            'Revenue',
                            'Opportunities',
                            'Wk/wk revenue',
                            'Previous week'
                        ],
                        RowLabels: [
                            'Select Lead 0%',
                            'Qualify Lead 10%'
                        ],
                        Title: 'Leads',
                        StartingYPos: 18
                    },
                    stock: {
                        padding: 15,
                        opacity: 0.8,
                        borderColor: 'silver',
                        borderRadius: 2,
                        borderWidth: 1,
                        borderDashStyle: 'solid',
                        lineWidth: 2,
                        lineColor: '#444',
                        lineDashStyle: ''
                    },
                    bubble: {
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
                    spiderweb: {
                        color: [
                            '#0066CC',
                            '#CC0000',
                            '#75962A'
                        ],
                        axis: {
                            labels: {
                                series: [],
                                style: {
                                    fill: '#555555',
                                    fontSize: '12px',
                                    fontFamily: 'Segoe UI'
                                }
                            },
                            lineWidth: 2,
                            lineColor: '#BBBBBB',
                            numberOfGridLines: 4
                        },
                        lineWidth: 2
                    },
                    combolinecolumn: {
                        color: [
                            '#0066CC',
                            '#CC0000',
                            '#75962A'
                        ]
                    },
                    timeline: {
                        stepLine: false,
                        marker: {
                            enabled: true,
                            shape: ['circle'],
                            fillColor: '',
                            lineWidth: 1,
                            lineColor: 'black',
                            width: 6,
                            hover: {
                                enabled: true,
                                style: { opacity: '1 !important' }
                            },
                            style: { opacity: 0 }
                        },
                        rangeDisplay: 'chart',
                        heightRatio: 0.3,
                        dragStart: 0,
                        // should be between 0 and data.length
                        dragWidth: 250,
                        // should be less than total width of range slider
                        dragEnd: 250,
                        gizmo: {
                            shape: 'triangle',
                            fill: 'white',
                            stroke: '#666'
                        },
                        dimmer: {
                            fill: 'rgb(224, 219, 219)',
                            stroke: 'rgb(224, 219, 219)',
                            opacity: 0.6
                        },
                        drillBoxes: {
                            fill: 'rgba(255,255,255,0.2)',
                            stroke: '#ccc',
                            'stroke-width': 2,
                            fontStyle: {
                                fontSize: '12px',
                                fill: 'black',
                                textAnchor: 'middle',
                                cursor: 'pointer'
                            }
                        },
                        onChange: '',
                        color: ['#0066CC'],
                        lineWidth: 2,
                        lineDashStyle: '',
                        strokes: [],
                        opacity: 1,
                        xAxisLabelCount: 10
                    },
                    bowtie: {
                        branch: {
                            left: {
                                fieldName: '',
                                fillColor: '#DBDBDB',
                                title: {
                                    text: '',
                                    align: '',
                                    style: {}
                                }
                            },
                            right: {
                                fieldName: '',
                                fillColor: '#DBDBDB',
                                title: {
                                    text: '',
                                    align: '',
                                    style: {}
                                }
                            },
                            spacing: 10,
                            drillDepenedency: 'independent',
                            drillFunction: '',
                            drillBackFunction: ''
                        },
                        label: {
                            left: {
                                enabled: false,
                                header: [],
                                headerStyle: {},
                                colModel: []
                            },
                            right: {
                                enabled: false,
                                header: [],
                                headerStyle: {},
                                colModel: []
                            },
                            headerDataSpacing: 0
                        },
                        showTotal: {
                            enabled: true,
                            side: 'max',
                            formatter: '',
                            title: {
                                text: '',
                                style: {}
                            },
                            spacing: 10,
                            style: {}
                        }
                    },
                    halfbowtie: {
                        branch: {
                            fieldName: '',
                            fillColor: '#DBDBDB',
                            title: {
                                text: '',
                                align: '',
                                style: {}
                            },
                            spacing: 10,
                            drillDepenedency: 'dependent',
                            drillFunction: '',
                            drillBackFunction: '',
                            navigationHierarchy: []
                        },
                        label: {
                            enabled: false,
                            header: [],
                            headerStyle: {},
                            colModel: [],
                            headerDataSpacing: 0,
                            headerList: []
                        },
                        showTotal: {
                            enabled: true,
                            side: 'max',
                            formatter: '',
                            titleTextArray: [],
                            title: {
                                text: '',
                                style: {}
                            },
                            spacing: 10,
                            style: {}
                        },
                        halfbowtieDataSet: []
                    },
                    treemap: {
                        fieldName: '',
                        fieldColor: '',
                        drillThrough: {
                            type: 'click',
                            style: {}
                        },
                        title: {
                            fieldName: '',
                            style: {}
                        }
                    }
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
                if (this.chartOptions.chart.type === 'treemap') {
                    oTreemapOptions = this.chartOptions.plotOptions.treemap;
                    oTreemapOptions.container = document.getElementById(chartConfigOptions.chart.renderTo);
                    oTreemapOptions.original = {};
                    oTreemapOptions.original.child = clone(chartConfigOptions.series.child);
                    oTreemapOptions.currentLevel = 0;
                    oTreemapOptions.selectedValue = [];
                    oTreemapOptions.selectedIndex = [];
                    oTreemapOptions.currentLayout = [];
                    oTreemapOptions.prevLayout = [];
                    oToolTip = document.createElement('div');
                    oTTStyle = chartConfigOptions.tooltip.style;
                    oTTStyle.position = 'absolute';
                    oTTStyle.display = 'none';
                    oTTStyle.minWidth = '0';
                    oTTStyle.left = '0';
                    oTTStyle.top = '0';
                    oTTStyle.minHeight = '0';
                    MAQ.applyStyle(oToolTip, oTTStyle);
                    this.chartOptions.container.appendChild(oToolTip);
                    this.chartOptions.tooltipDiv = oToolTip;
                    MAQ.createTreemap(this.chartOptions);
                } else if ('waterfall' === this.chartOptions.chart.type) {
                    MAQ.createWaterfallChart(this.chartOptions);
                } else if ('brick' === this.chartOptions.chart.type) {
                    MAQ.createBrickChart(this.chartOptions);
                } else {
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
                        'combolinecolumn'
                    ];
                    MAQ.createSVGDoc(this.chartOptions);
                    //Create SVG document
                    MAQ.drawChartTitle(this.chartOptions);
                    //Draw chart title
                    /* Chart differntiator */
                    switch (this.chartOptions.chart.type.toLowerCase()) {
                        case 'bubble':
                            MAQ.createBubbleChart(this.chartOptions);
                            break;
                    }
                }
            } else {
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
            if (getLegendEnable()[iSeriesIndex]) {
                oSeries[iSeriesIndex].enabled = true;
            }
            else if (getLegendEnable()[iSeriesIndex] === false) {
                oSeries[iSeriesIndex].enabled = false;
            }
            else if (oSeries[iSeriesIndex] && oSeries[iSeriesIndex].enabled === undefined) {
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
                iMax = Math.round(iMax);
                iMin = Math.round(iMin);
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
        function redrawChart(evt, oParam, isEvent) {
            'use strict';
            settings.quadrantDivisionY = -1;
            config.xAxis.gridLineX = -1;
            var oGrpDisplayArea = oParam.config.svgELE;
            if (oParam.config.series[oParam.seriesIndex].enabled) {
                oParam.config.series[oParam.seriesIndex].enabled = false;
                setLegendEnable(oParam.seriesIndex, false);
            } else if (0 !== oParam.config.series[oParam.seriesIndex].data) {
                oParam.config.series[oParam.seriesIndex].enabled = true;
                setLegendEnable(oParam.seriesIndex, true);
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
                case 'bubble':
                    MAQ.createBubbleChart(oParam.config);
                    break;
            }
        }
        /*
        END: MAQ.redrawChart: Redraw chart on selected legend
        */
        function removeLegendHover(evt, oParam) {
            'use strict';
            //remove all the hover effects
            var oLegendActive = document.querySelectorAll('.MAQCharts-legend-hover'), oChartActive = document.querySelectorAll('g.legendActive'), oLegendDim = document.querySelectorAll('.MAQCharts-legend-dim'), oChartDim = document.querySelectorAll('g.legendDim');
            MAQ.styles.removeClass(oLegendActive, 'MAQCharts-legend-hover');
            MAQ.styles.removeClass(oChartActive, 'legendActive');
            MAQ.styles.removeClass(oLegendDim, 'MAQCharts-legend-dim');
            MAQ.styles.removeClass(oChartDim, 'legendDim');
            /*Remove Legend Hover Effects*/
            //1. Static Tooltip Popup
            if (oParam.config.legend.hover.staticTooltip) {
                MAQ.showHideStaticTooltips(oParam, false);
            }
        }
        /*
         * applyLengendHover: This method applies the legend hover styles and effects to the corresponding chart plot on hovering of a legend
         * @param {oParam} user configuration parameters (config) and index of legend series (seriesIndex)
         */
        function applyLegendHover(evt, oParam) {
            'use strict';
            //first remove all the previous hover effects
            removeLegendHover(evt, oParam);
            var aLegends = oParam.config.legend.legends, iCount = 0;
            var iLen = aLegends.length;
            var oChartPlots = oParam.config.plotOptions[oParam.config.chart.type][oParam.config.chart.type + 's'], oMarkers;
            if (!oChartPlots) {
                return;
            }
            if (oParam.config.plotOptions[oParam.config.chart.type].marker) {
                oMarkers = oParam.config.plotOptions[oParam.config.chart.type].marker.markers;
            }
            var oEles = [];
            for (iCount = 0; iCount < iLen; iCount += 1) {
                oEles.push(aLegends[iCount].shape);
                oEles.push(aLegends[iCount].text);
            }
            //add counter effect to all legends
            MAQ.styles.addClass(oEles, 'MAQCharts-legend-dim');
            //remove counter effect from the hovered legend
            MAQ.styles.removeClass(aLegends[oParam.config.legend.customOrder[oParam.seriesIndex]].shape, 'MAQCharts-legend-dim');
            MAQ.styles.removeClass(aLegends[oParam.config.legend.customOrder[oParam.seriesIndex]].text, 'MAQCharts-legend-dim');
            //add hover styles to the hovered legend
            MAQ.styles.addClass(aLegends[oParam.config.legend.customOrder[oParam.seriesIndex]].shape, 'MAQCharts-legend-hover');
            MAQ.styles.addClass(aLegends[oParam.config.legend.customOrder[oParam.seriesIndex]].text, 'MAQCharts-legend-hover');
            //add counter effect to all the charts plots
            MAQ.styles.addClass(oChartPlots, 'legendDim');
            if (oMarkers) {
                MAQ.styles.addClass(oMarkers, 'legendDim');
            }
            //remove the counter effect from the chart plot corresponding to hovered legend
            MAQ.styles.removeClass(oChartPlots[oParam.seriesIndex], 'legendDim');
            if (oMarkers) {
                MAQ.styles.removeClass(oMarkers[oParam.seriesIndex], 'legendDim');
            }
            //add hover styles to the chart plot corresponding to the hovered legend
            MAQ.styles.addClass(oChartPlots[oParam.seriesIndex], 'legendActive');
            if (oMarkers) {
                MAQ.styles.addClass(oMarkers[oParam.seriesIndex], 'legendActive');
            }
            /*Add Legend Hover Effects*/
            //1. Static Tooltip
            if (oParam.config.legend.hover.staticTooltip) {
                MAQ.showHideStaticTooltips(oParam, true);
            }
        }
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
                        case 'bubble':
                            oToolTip.innerHTML = '<b>' + (oSeries.name) + '<br/><b>';
                            //X value in tooltip
                            if (Xformatter.format(oSeries.data.scaleX[iSelectedIndex]) === "(Blank)") {
                                oToolTip.innerHTML += '<b>' + (settings.showxAxisTitle ? oConfig.xAxis.title.text : xAxisName) + ': </b>' + (Math.round(oSeries.data.scaleX[iSelectedIndex] * 100) / 100) + '<br/><b>';
                            }
                            else {
                                oToolTip.innerHTML += '<b>' + (settings.showxAxisTitle ? oConfig.xAxis.title.text : xAxisName) + ': </b>' + Xformatter.format(Math.round(oSeries.data.scaleX[iSelectedIndex] * 100) / 100) + '<br/><b>';
                            }
                            //y value in tooltip
                            if (Yformatter.format(oSeries.data.scaleY[iSelectedIndex]) === "(Blank)") {
                                oToolTip.innerHTML += '<b>' + (settings.showyAxisTitle ? oConfig.yAxis.title.text : yAxisName) + ': </b>' + (Math.round(oSeries.data.scaleY[iSelectedIndex] * 100) / 100) + '<br/><b>';
                            }
                            else {
                                oToolTip.innerHTML += '<b>' + (settings.showyAxisTitle ? oConfig.yAxis.title.text : yAxisName) + ': </b>' + Yformatter.format(Math.round(oSeries.data.scaleY[iSelectedIndex] * 100) / 100) + '<br/><b>';
                            }
                            //radius in tooltip
                            oToolTip.innerHTML += '<b> Radius: </b>' + (Math.round(oSeries.data.radius[iSelectedIndex] * 100) / 100) + '<br/><b>';
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
            if (oConfig.tooltip.changeBorderColor && !oConfig.tooltip.seriesLevelTooltip) {
                var oPlotOptions = oConfig.plotOptions[oConfig.chart.type.toLowerCase()];
                oToolTip.style.borderColor = oPlotOptions.color && oPlotOptions.color[oParam.seriesIndex % oPlotOptions.color.length] || evt.target.getAttribute('fill') || oConfig.tooltip.style['border-color'];
            }
            var topScroll = $('#container').scrollTop();
            var fTopCordinate = topScroll + oCord.y - oToolTip.clientHeight - 5;
            if (fTopCordinate <= 10) {
                fTopCordinate = oCord.y + 10;
            }
            var leftScroll = $('#container').scrollLeft();
            var fLeftCordinate = leftScroll + oCord.x - oToolTip.clientWidth - 10;
            if (fLeftCordinate <= 10) {
                fLeftCordinate = oCord.x + 10;
            }
            oToolTip.style.top = fTopCordinate + 'px';
            oToolTip.style.left = fLeftCordinate + 'px';
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
        MAQ.drawLegend: Renders chart legend title
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawLegend = function (chartConfigOptions) {
            'use strict';
            var oLegend = chartConfigOptions.legend, oLegStyle, oChartStyle, oLegCStyle, oChartCStyle, sRectRule, sRectCRule, sTextRule, sTextCRule, sChartRule, sChartCRule, obj;
            if (oLegend.enabled) {
                oLegend.legends = [];
                if (chartConfigOptions.series.length > 0) {
                    var iNumSymbols = chartConfigOptions.series.length, iNoOfLegendLines = 1, iPadding = 4, oDim, iSeriesLen = chartConfigOptions.series.length, oAttr = { class: 'MAQCharts-legend' }, oGrpLegend = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr), customOrder = chartConfigOptions.legend.customOrder;
                    chartConfigOptions.svgELE.appendChild(oGrpLegend);
                    oAttr = { class: 'MAQCharts-legend-labels' };
                    var oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                    oGrpLegend.appendChild(oGrpELE);
                    var oParam = {};
                    var oSymbolAttr = {
                        x: 0,
                        y: 0,
                        rx: oLegend.symbolRadius,
                        ry: oLegend.symbolRadius,
                        width: oLegend.symbolWidth,
                        height: oLegend.symbolHeight,
                        fill: '',
                        opacity: 1
                    };
                    var oTextAttr = {
                        x: 0,
                        y: 0,
                        text: '',
                        style: JSON.parse(JSON.stringify(oLegend.style))
                    };
                    var oColor = chartConfigOptions.plotOptions[chartConfigOptions.chart.type].color, imaxWidth = 0, iSCounter = 0, oRectELE, sTempText, bAttachTooltip, iTextLen, oTextELE, oToolTip;
                    //init customOrder if not initialized
                    if (customOrder instanceof Array && customOrder.length < iSeriesLen) {
                        for (iSCounter = 0; iSCounter < iSeriesLen; iSCounter += 1) {
                            customOrder[iSCounter] = iSCounter;
                        }
                    }
                    if (oLegend.verticalAlignLegend) {
                        oLegend.align = 'left';
                        imaxWidth = 0;
                        //Function to find the max width of a particular legend and then assigning the max width to each legend for horizontal alignment between legends
                        //Updated by OL StoreBI team
                        for (iSCounter = 0; iSCounter < iNumSymbols; iSCounter += 1) {
                            //Create the temporary HTML element to calculate width
                            obj = document.createElement('span');
                            MAQ.applyStyle(obj, oLegend.style);
                            obj.style.position = 'absolute';
                            obj.style.visibility = 'hidden';
                            obj.innerText = chartConfigOptions.series[customOrder[iSCounter]].name;
                            document.body.appendChild(obj);
                            if (obj.clientWidth > imaxWidth) {
                                imaxWidth = obj.clientWidth;
                            }
                            //Delete the temporary HTML element used to calculate width
                            document.body.removeChild(obj);
                        }
                    }
                    for (iSCounter = 0; iSCounter < iNumSymbols; iSCounter += 1) {
                        if (!isSeriesEnabled(chartConfigOptions.series, customOrder[iSCounter])) {
                            oSymbolAttr.opacity = 0.3;
                            oTextAttr.opacity = 0.3;
                        } else {
                            oSymbolAttr.opacity = 1;
                            oTextAttr.opacity = 1;
                            oTextAttr.style.fill = oLegend.style.fill;
                        }
                        oSymbolAttr.fill = oColor[customOrder[iSCounter]];
                        oRectELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oSymbolAttr);
                        oGrpELE.appendChild(oRectELE);
                        oSymbolAttr.x += oSymbolAttr.width + oLegend.symbolPadding;
                        oTextAttr.x = oSymbolAttr.x;
                        oTextAttr.text = chartConfigOptions.series[customOrder[iSCounter]].name;
                        /* Code for clipping the text to specified number of characters */
                        sTempText = '';
                        bAttachTooltip = false;
                        if (oLegend.enableTextClipping && oLegend.clipTextFrom && 'string' === typeof oLegend.clipTextFrom) {
                            iTextLen = oTextAttr.text.length;
                            if (oLegend.clippedTextLength && 'number' === typeof oLegend.clippedTextLength && iTextLen > oLegend.clippedTextLength) {
                                sTempText = oTextAttr.text;
                                bAttachTooltip = true;
                                switch (oLegend.clipTextFrom.toLowerCase()) {
                                    case 'right':
                                        oTextAttr.text = '...' + oTextAttr.text.substring(iTextLen - oLegend.clippedTextLength, iTextLen);
                                        break;
                                    default:
                                        oTextAttr.text = oTextAttr.text.substring(0, oLegend.clippedTextLength) + '...';
                                        break;
                                }
                            }
                        }
                        oTextELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oTextAttr);
                        oGrpELE.appendChild(oTextELE);
                        if (bAttachTooltip) {
                            oParam = {
                                value: sTempText,
                                config: chartConfigOptions,
                                type: 'axis'
                            };
                            oToolTip = chartConfigOptions.tooltipDiv;
                            MAQ.addEventListener(oTextELE, 'mouseover', showToolTip, oParam);
                            MAQ.addEventListener(oTextELE, 'mouseout', hideToolTip, oToolTip);
                        }
                        oParam = {
                            config: chartConfigOptions,
                            grpNumber: customOrder[iSCounter]
                        };
                        if (oLegend.enableClick) {
                            oTextELE.style.cursor = 'pointer';
                            oRectELE.style.cursor = 'pointer';
                        }
                        oDim = MAQ.getObjectDimension(oTextELE);
                        //verticalAlignLegend property is set to true.
                        //Changing width to a const imaxWidth
                        if (oLegend.verticalAlignLegend) {
                            oTextELE.style.width = imaxWidth;
                        }
                        if (oLegend.layout === 'horizontal') {
                            // if verticalAlignLegend property is set to true
                            //Changing width to a const imaxWidth
                            if (oLegend.verticalAlignLegend && oSymbolAttr.x + imaxWidth > chartConfigOptions.availWidth || oSymbolAttr.x + oDim.width > chartConfigOptions.availWidth) {
                                oSymbolAttr.x = 0;
                                oSymbolAttr.y = iNoOfLegendLines * oDim.height;
                                iNoOfLegendLines += 1;
                                MAQ.addAttr(oRectELE, 'x', oSymbolAttr.x);
                                MAQ.addAttr(oRectELE, 'y', oSymbolAttr.y);
                                oSymbolAttr.x += oSymbolAttr.width + oLegend.symbolPadding;
                                oTextAttr.x = oSymbolAttr.x;
                                MAQ.addAttr(oTextELE, 'x', oTextAttr.x);
                            }
                            MAQ.addAttr(oTextELE, 'y', oSymbolAttr.y + Math.abs(oDim.y) - (oDim.height - oSymbolAttr.height) / 2);
                            if (oLegend.verticalAlignLegend) {
                                oSymbolAttr.x += imaxWidth + oLegend.individualDistance;
                            } else {
                                oSymbolAttr.x += oDim.width + oLegend.individualDistance;
                            }
                        } else if (oLegend.layout === 'vertical') {
                            MAQ.addAttr(oTextELE, 'y', oTextAttr.y + oDim.height - oSymbolAttr.height / 2);
                            oSymbolAttr.x = 0;
                            oSymbolAttr.y += oSymbolAttr.height + oLegend.lineHeight;
                            oTextAttr.y = oSymbolAttr.y;
                        }
                        oParam = {
                            seriesIndex: customOrder[iSCounter],
                            config: chartConfigOptions
                        };
                        if (chartConfigOptions.legend.enableClick) {
                            /*Call to Redraw Charts on toggling the legends*/
                            MAQ.addEventListener(oRectELE, 'click', redrawChart, oParam);
                            MAQ.addEventListener(oTextELE, 'click', redrawChart, oParam);
                        }
                        if (chartConfigOptions.legend.hover.enabled && isSeriesEnabled(chartConfigOptions.series, customOrder[iSCounter])) {
                            MAQ.addEventListener(oRectELE, 'mouseover', applyLegendHover, oParam);
                            MAQ.addEventListener(oTextELE, 'mouseover', applyLegendHover, oParam);
                            MAQ.addEventListener(oRectELE, 'mouseout', removeLegendHover, oParam);
                            MAQ.addEventListener(oTextELE, 'mouseout', removeLegendHover, oParam);
                        }
                        oLegend.legends.push({
                            shape: oRectELE,
                            text: oTextELE
                        });
                    }
                    if (chartConfigOptions.legend.hover.enabled) {
                        //define rule names
                        sRectRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-legend-labels>rect.MAQCharts-legend-hover';
                        sRectCRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-legend-labels>rect.MAQCharts-legend-dim';
                        sTextRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-legend-labels>text.MAQCharts-legend-hover';
                        sTextCRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-legend-labels>text.MAQCharts-legend-dim';
                        sChartRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-plotArea>g.legendActive';
                        sChartCRule = '#' + chartConfigOptions.chart.renderTo + ' .MAQCharts-plotArea>g.legendDim';
                        //set rule variables
                        oLegStyle = MAQ.styles.jsonToRule(chartConfigOptions.legend.hover.style);
                        oLegCStyle = MAQ.styles.jsonToRule(chartConfigOptions.legend.hover.counterStyle);
                        oChartStyle = MAQ.styles.jsonToRule(chartConfigOptions.legend.hover.chartStyle);
                        oChartCStyle = MAQ.styles.jsonToRule(chartConfigOptions.legend.hover.counterChartStyle);
                        //add the rules to MAQ charts style sheet
                        MAQ.styles.addRule(sRectRule + ', ' + sTextRule, oLegStyle);
                        MAQ.styles.addRule(sRectCRule + ', ' + sTextCRule, oLegCStyle);
                        MAQ.styles.addRule(sChartRule, oChartStyle);
                        MAQ.styles.addRule(sChartCRule, oChartCStyle);
                    }
                    oDim = MAQ.getObjectDimension(oGrpELE);
                    oSymbolAttr = {
                        x: -iPadding,
                        y: -iPadding,
                        rx: oLegend.borderRadius,
                        ry: oLegend.borderRadius,
                        width: oDim.width + iPadding * 2,
                        height: oDim.height + iPadding,
                        stroke: oLegend.borderColor,
                        fill: 'transparent',
                        'stroke-width': oLegend.borderWidth,
                        'stroke-dasharray': MAQ.computeStrokeDashStyle(oLegend.borderStyle)
                    };
                    var oBorderRect = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oSymbolAttr);
                    oGrpLegend.insertBefore(oBorderRect, oGrpELE);
                    oDim = MAQ.getObjectDimension(oGrpLegend);
                    var iLegendX, iLegendY, oLayout = [
                        0,
                        0
                    ];
                    oAttr = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                    switch (oLegend.verticalAlign.toLowerCase()) {
                        case 'middle':
                            iLegendY = (chartConfigOptions.availY + chartConfigOptions.availHeight) / 2 - oDim.height / 2;
                            break;
                        case 'top':
                            oLayout[0] = 1;
                            iLegendY = chartConfigOptions.availY + iPadding;
                            oAttr.y += oDim.height;
                            oAttr.height -= oDim.height;
                            break;
                        default:
                            oLayout[0] = 1;
                            iLegendY = chartConfigOptions.availY + chartConfigOptions.availHeight - oDim.height;
                            oAttr.height -= oDim.height + iPadding;
                            break;
                    }
                    switch (oLegend.align.toLowerCase()) {
                        case 'center':
                            iLegendX = chartConfigOptions.availWidth / 2 - oDim.width / 2;
                            break;
                        case 'right':
                            oLayout[1] = 1;
                            iLegendX = chartConfigOptions.availWidth - oDim.width;
                            oAttr.width = iLegendX - chartConfigOptions.availWidth - iPadding;
                            break;
                        case 'left':
                            iLegendX = iPadding * 2;
                            break;
                        default:
                            oLayout[1] = 1;
                            iLegendX = chartConfigOptions.availX + iPadding * 2;
                            //verticalAlignLegend property is set to true
                            //Changing the required variables
                            if (oLegend.verticalAlignLegend) {
                                oAttr.x += imaxWidth;
                                // oDim.width
                                oAttr.width -= imaxWidth;  // oDim.width
                            } else {
                                oAttr.x += oDim.width;
                                oAttr.width -= oDim.width;
                            }
                            break;
                    }
                    iLegendX += oLegend.x;
                    iLegendY += oLegend.y;
                    MAQ.addAttr(oGrpLegend, 'transform', 'translate(' + iLegendX + ',' + iLegendY + ')');
                    if (!oLegend.floating) {
                        chartConfigOptions.availX += oAttr.x;
                        chartConfigOptions.availY += oAttr.y;
                        chartConfigOptions.availWidth += oAttr.width;
                        chartConfigOptions.availHeight += oAttr.height;
                        if (oLayout[0] && oLayout[1]) {
                            if (oLegend.verticalAlign === 'top') {
                                chartConfigOptions.availY -= oDim.height;
                            }
                            chartConfigOptions.availHeight += oDim.height;
                        }
                    }
                }
            }
        };
        /*
        MAQ.drawYAxisTitle: Renders X-axis title
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawYAxisTitle = function (chartConfigOptions) {
            'use strict';
            var oYAxis = chartConfigOptions.yAxis, count, oAttr, oGrpELE, axis, oTitleObj, oDim = null;
            if (oYAxis.title.text) {
                if (!oYAxis.dualAxisEnabled) {
                    oAttr = { class: 'MAQCharts-yAxisTitle' };
                    if ('combolinecolumn' === chartConfigOptions.chart.type) {
                        axis = oYAxis.dualyAxis.axisLeft;
                    } else {
                        axis = oYAxis;
                    }
                    oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                    chartConfigOptions.svgELE.appendChild(oGrpELE);
                    oAttr = {
                        x: chartConfigOptions.availX,
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
                    oAttr.x += Math.abs(oDim.height);
                    MAQ.addAttr(oTitleObj, 'x', oAttr.x);
                    MAQ.addAttr(oTitleObj, 'transform', 'rotate(270 ' + Math.abs(oAttr.x) + ',' + oAttr.y + ')');
                    chartConfigOptions.availX += oDim.height;
                    chartConfigOptions.availWidth -= oDim.height;
                    if (axis.title.y > 0) {
                        chartConfigOptions.availX += axis.title.y;
                        chartConfigOptions.availWidth -= axis.title.y;
                    }
                } else {
                    if (oYAxis.dualyAxis.axisLeft && oYAxis.dualyAxis.axisRight) {
                        count = 0;
                        var iXvalue;
                        for (count = 0; count < 2; count += 1) {
                            if (count === 0) {
                                axis = oYAxis.dualyAxis.axisLeft;
                            } else {
                                axis = oYAxis.dualyAxis.axisRight;
                            }
                            oAttr = { class: 'MAQCharts-yAxisTitle' };
                            oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                            iXvalue = chartConfigOptions.availX;
                            if (1 === count) {
                                iXvalue = chartConfigOptions.availWidth + 5;
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
                    oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
                    var ooTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'title', oAttr);
                    oGrpELE.appendChild(oTitleObj);
                    oTitleObj.appendChild(ooTitleObj);

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
            var ah = chartConfigOptions.availHeight;
            var aw = chartConfigOptions.availWidth;

            var iCounter = 0, iLength = 0, sBigData = '', bottomSpacing = 0, leftSpacing = 0, sChartType = chartConfigOptions.chart.type, xAxis = chartConfigOptions.xAxis, yAxis = chartConfigOptions.yAxis, xAxisLabel = xAxis.labels, yAxisLabel = yAxis.labels, xAxisSeries = xAxisLabel.series, yAxisSeries = yAxisLabel.series, xAxisSeriesLength = 0, yAxisSeriesLength = 0, yAxisLimit = 0;
            var oAttr = {
                class: 'MAQCharts-chartArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
            };
            var oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null, oNormalizedData, iStart, iInterval, oTimelineData, temp, oGridAreaGrpELE, iNumberOfGridLines, oGrpYAxis, oGrpYAxisLblNTick, oAttrYAxis, oYAxisLine, intervalHeight, oAttrTick;
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
            if (flag === 0) {
                for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                    yAxisSeries[iCounter] = iStart;

                    iStart += iInterval;
                    iStart = Math.round(iStart * 100) / 100;
                    prevYSeries[iCounter] = yAxisSeries[iCounter];
                }
            }
            else {
                for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                    yAxisSeries[iCounter] = prevYSeries[iCounter];
                }

            }
            //to reset it to the middle
            if (settings.quadrantDivisionY > yAxisSeries[iLength] || settings.quadrantDivisionY < yAxisSeries[0]) {
                config.yAxis.gridLineY = (yAxisSeries[0] + yAxisSeries[iLength]) / 2;
                settings.quadrantDivisionY = config.yAxis.gridLineY;
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
            rightSpacing = MAQ.getAxisSpacing(chartConfigOptions, yAxis, sBigData, false);
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
            chartConfigOptions.availHeight = intervalHeight * yAxisSeriesLength;
            chartConfigOptions.plotIntervalHeight = intervalHeight;

            var skipgridsy = yAxis.numberOfGridLines / 2;
            for (iCounter = yAxisSeriesLength; yAxisLimit <= iCounter; iCounter -= 1) {
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    if (iCounter % skipgridsy === 0) {
                        if (sGridType === 'rect') {
                            if (iCounter > 0) {
                                if (iCounter % 2 === 0) {
                                    oGridArwaGrpELE.appendChild(oQuadrantLabel);
                                }
                            }
                        }
                    }
                    oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);

                    oGrpYAxisLblNTick.appendChild(oTick);
                    //y axis label
                    if (yAxisLabel.enabled) {

                        oAttrLabel.text = yAxisSeries[iCounter];

                        if (Yformatter.format(oAttrLabel.text) === "(Blank)") {
                            oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, yAxisLabel.formatter);
                        }
                        else {
                            oAttrLabel.text = Yformatter.format(oAttrLabel.text);
                        }
                        var sTempText = oAttrLabel.text;
                        //to avoid overlapping of labels
                        if (oAttrLabel.text.toString().length > 4) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, 2) + "...";
                        }
                        oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                        oGrpYAxisLblNTick.appendChild(oLabel);
                        oLabelDim = MAQ.getObjectDimension(oLabel);
                        MAQ.addAttr(oLabel, 'y', oAttrLabel.y + oLabelDim.height / 4);
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
                    iSkipInterval = yAxis.skipInterval;
                    if (iCounter + 1 > Math.floor(yAxis.skipInterval / 2)) {
                        bSkipPlot = false;
                    }
                }
                oAttrTick.y2 += intervalHeight;
                oAttrTick.y1 = oAttrTick.y2;
                oAttrLabel.y = oAttrTick.y2;
            }
            //drawgridlineY
            //labels have been drawn and checking if the gridline is out of bound of labels, then setting it to mid of the labels series.
            var finalY;
            if (settings.showQuadrants) {
                if (config.yAxis.gridLineY > yAxisSeries[yAxisSeriesLength] || config.yAxis.gridLineY < yAxisSeries[0]) {
                    config.yAxis.gridLineY = yAxisSeries[yAxisSeriesLength / 2];
                    settings.quadrantDivisionY = yAxisSeries[yAxisSeriesLength / 2];
                }
                if (config.yAxis.gridLineY === -1) {
                    finalY = (chartConfigOptions.availHeight) * (yAxisSeries[yAxisSeriesLength / 2]) / yAxisSeries[yAxisSeriesLength];
                    settings.quadrantDivisionY = yAxisSeries[yAxisSeriesLength / 2];
                }
                else {
                    finalY = (chartConfigOptions.availHeight) * (yAxisSeries[yAxisSeriesLength] - config.yAxis.gridLineY) / yAxisSeries[yAxisSeriesLength];
                }
                var oAttrGridLine = {
                    x: leftSpacing,
                    y: 0,
                    x1: leftSpacing,
                    y1: finalY,
                    x2: chartConfigOptions.availWidth - leftSpacing,
                    y2: finalY,
                    width: chartConfigOptions.availWidth - leftSpacing,
                    height: intervalHeight,
                    fill: 'transparent',
                    stroke: yAxis.gridLineColor,
                    'stroke-dasharray': MAQ.computeStrokeDashStyle(yAxis.gridLineDashStyle),
                    'stroke-width': yAxis.gridLineWidth
                };

                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                if (sGridType === 'rect') {
                    if (iCounter > 0) {
                        if (iCounter % 2 === 0) {
                            oGridAreaGrpELE.appendChild(oGridLine);
                        }
                    }
                } else {
                    oGridAreaGrpELE.appendChild(oGridLine);
                }
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
            Attr = { class: 'MAQCharts-xAxis' };
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
            aw = oAttrXAxis.x2;
            sGridType = 'line';
            if (xAxis.alternateGridColor) {
                sGridType = 'rect';
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
            var sTempText = '', iPrevX, oDim, isDrillBar, oParam, oToolTip, iStartOffset, skipgridsx = xAxis.numberOfGridLines / 2;
            for (iCounter = 0; iCounter < xAxisSeries.length; iCounter += 1) {
                isDrillBar = false;
                //If the next bar is a drill bar
                if (chartConfigOptions.drillActive && 1 === chartConfigOptions.drillActive && iCounter + 1 > chartConfigOptions.drillIndex && iCounter <= chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength) {
                    isDrillBar = true;
                }
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    if (iCounter % skipgridsy === 0) {
                        if (sGridType === 'rect') {
                            if (iCounter % 2 === 0) {
                            }
                        }
                    }
                    oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);

                    oGrpXAxisLblNTick.appendChild(oTick);
                    if (xAxisLabel.enabled) {


                        iPrevX = oAttrLabel.x;
                        oAttrLabel.text = parseFloat(xAxisSeries[iCounter]);
                        if (Xformatter.format(oAttrLabel.text) === "(Blank)") {
                            oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                        }
                        else {
                            oAttrLabel.text = Xformatter.format(oAttrLabel.text);
                        }
                        /* Code for clipping the text to specified number of characters */
                        sTempText = oAttrLabel.text;

                        //for overlapping x-axis label
                        var xlabelText = "";

                        if (Xformatter.format(oAttrLabel.text) === "(Blank)") {
                            xlabelText = oAttrLabel.text.toString();
                        }
                        else {
                            xlabelText = Xformatter.format(oAttrLabel.text).toString();
                        }
                        if (xlabelText.length > iNumOfCharsAllowed) {
                            oAttrLabel.text = xlabelText.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                        }
                        if (!xAxisLabel.formatter && sTempText.length > iNumOfCharsAllowed) {
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
                oAttrTick.x1 += intervalWidth;
                oAttrLabel.x = oAttrTick.x1;
                oAttrTick.x2 = oAttrTick.x1;
            }
            chartConfigOptions.availHeight = intervalHeight * yAxisSeriesLength;
            chartConfigOptions.availWidth = aw;
            //drawgridlineX
            var finalX;
            if (settings.showQuadrants) {
                if (config.xAxis.gridLineX > xAxisSeries[(xAxisSeries.length - 1)] || config.xAxis.gridLineX < xAxisSeries[0]) {
                    config.xAxis.gridLineX = xAxisSeries[(xAxisSeries.length - 1) / 2];
                    settings.quadrantDivisionX = xAxisSeries[(xAxisSeries.length - 1) / 2];
                }
                if (config.xAxis.gridLineX === -1) {
                    finalX = (chartConfigOptions.availWidth) * (xAxisSeries[(xAxisSeries.length - 1) / 2]) / xAxisSeries[xAxisSeries.length - 1];
                    config.xAxis.gridLineX = xAxisSeries[(xAxisSeries.length - 1) / 2];
                    settings.quadrantDivisionX = xAxisSeries[(xAxisSeries.length - 1) / 2];
                }
                else {
                    finalX = (chartConfigOptions.availWidth) * (config.xAxis.gridLineX) / xAxisSeries[xAxisSeries.length - 1];
                }
                oAttrGridLine = {
                    x: finalX,
                    y: oAttrYAxis.y1,
                    x1: finalX + oAttrYAxis.x1,
                    y1: oAttrYAxis.y1,
                    x2: finalX + oAttrYAxis.x1,
                    y2: oAttrYAxis.y2,
                    width: intervalWidth,
                    height: chartConfigOptions.availHeight,
                    fill: 'transparent',
                    stroke: xAxis.gridLineColor,
                    'stroke-dasharray': MAQ.computeStrokeDashStyle(xAxis.gridLineDashStyle),
                    'stroke-width': xAxis.gridLineWidth
                };
                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                if (sGridType === 'rect') {
                    if (iCounter > 0) {
                        if (iCounter % 2 === 0) {
                            oGridAreaGrpELE.appendChild(oGridLine);
                        }
                    }
                } else {
                    oGridAreaGrpELE.appendChild(oGridLine);
                }
            }
            //QuadrantLabels
            if (config.yAxis.gridLineY === -1) {
                config.yAxis.gridLineY = yAxisSeries[yAxisSeriesLength / 2];
            }

            oGrpQuadrantLabels = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpQuadrantLabels);
            if (typeof config.xAxis.gridLineX === 'undefined' || config.xAxis.gridLineX === -1) {
                config.xAxis.gridLineX = xAxisSeries[(xAxisSeriesLength) / 2];
                settings.quadrantDivisionX = config.xAxis.gridLineX;
            }
            var gridX = (chartConfigOptions.availWidth) * (config.xAxis.gridLineX) / xAxisSeries[xAxisSeries.length - 1];
            var gridY = (chartConfigOptions.availHeight) * (yAxisSeries[yAxisSeriesLength] - config.yAxis.gridLineY / 2) / yAxisSeries[yAxisSeriesLength];
            var oAttrQuadrantLabel = {
                x: ((gridX / 2) + leftSpacing),
                y: gridY,
                dx: 0,
                dy: 0,
                text: "",
                style: xAxisLabel.style
            };
            oAttrQuadrantLabel['text-anchor'] = "start";
            var i = 0, labelText, oQuadrantLabel;

            //showing four quadrants from here.
            while (i < 4) {
                oAttrQuadrantLabel.text = chartConfigOptions.legend.quadrantLabels[i];
                oQuadrantLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrQuadrantLabel);
                var title = document.createElementNS(chartConfigOptions.svgNS, "title"); //tooltip of four quadrants
                title.textContent = chartConfigOptions.legend.quadrantLabels[i];
                oQuadrantLabel.appendChild(title);
                oGrpQuadrantLabels.appendChild(oQuadrantLabel);
                var quadrantNameWidth = oQuadrantLabel.getBBox().width;
                labelText = chartConfigOptions.legend.quadrantLabels[i];
                var title1;
                iCounter = 0;
                var length = labelText.length;
                var labelTextTemp = labelText;
                title.textContent = chartConfigOptions.legend.quadrantLabels[i];
                //check for the available width to clip the Quadrant labels
                var availableWidth;
                if (i === 0 || i === 3) {
                    availableWidth = (chartConfigOptions.availWidth * (config.xAxis.gridLineX) / xAxisSeries[xAxisSeries.length - 1]) / 2;
                }
                else {
                    availableWidth = chartConfigOptions.availWidth * (xAxisSeries[xAxisSeries.length - 1] - config.xAxis.gridLineX) / xAxisSeries[xAxisSeries.length - 1] / 2;
                }
                var titleCopy;
                while ((iCounter < length) && (quadrantNameWidth) >= (availableWidth)) {
                    oGrpQuadrantLabels.removeChild(oQuadrantLabel);
                    labelText = chartConfigOptions.legend.quadrantLabels[i].substring(0, (chartConfigOptions.legend.quadrantLabels[i].length - iCounter - 1)) + "...";
                    titleCopy = document.createElementNS(chartConfigOptions.svgNS, "title");
                    titleCopy.textContent = labelText;
                    oAttrQuadrantLabel.text = labelText;
                    var oQuadrantLabelCopy = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrQuadrantLabel);
                    oQuadrantLabelCopy.appendChild(titleCopy);
                    oQuadrantLabel = oQuadrantLabelCopy;
                    oGrpQuadrantLabels.appendChild(oQuadrantLabel);
                    quadrantNameWidth = oQuadrantLabelCopy.getBBox().width;
                    iCounter++;
                }
                oGrpQuadrantLabels.removeChild(oQuadrantLabel);
                var oQuadrantLabelCopyText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrQuadrantLabel);
                titleCopy = document.createElementNS(chartConfigOptions.svgNS, "title");
                titleCopy.textContent = chartConfigOptions.legend.quadrantLabels[i];
                oQuadrantLabelCopyText.appendChild(title);
                oGrpQuadrantLabels.appendChild(oQuadrantLabelCopyText);
                if (i % 2 === 0) {
                    oAttrQuadrantLabel.x = (chartConfigOptions.availWidth) * (config.xAxis.gridLineX + (xAxisSeries[xAxisSeries.length - 1] - config.xAxis.gridLineX) / 2) / xAxisSeries[xAxisSeries.length - 1] + leftSpacing;
                    availableWidth = xAxisSeries[(xAxisSeries.length - 1)] - config.xAxis.gridLineX;
                }
                else {
                    oAttrQuadrantLabel.y = (chartConfigOptions.availHeight) * ((yAxisSeries[yAxisSeriesLength] - config.yAxis.gridLineY) / 2) / yAxisSeries[yAxisSeriesLength];
                }
                if (i === 2) {
                    oAttrQuadrantLabel.x = gridX / 2 + leftSpacing;
                }
                i++;
            }
        };

        /*
        MAQ.createBubbleChart: Renders bubble chart
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.createBubbleChart = function (chartConfigOptions) {
            if (chartConfigOptions.availWidth < 315 && chartConfigOptions.availHeight < 235) {
                d3.select('#container').style("overflow-y", "auto");
                d3.select('#container').style("overflow-x", "auto");
                chartConfigOptions.availWidth = 290;
                chartConfigOptions.availHeight = 210;
                d3.select('.MAQChartsSvgRoot').style("width", chartConfigOptions.availWidth + 'px');
                d3.select('.MAQChartsSvgRoot').style("height", chartConfigOptions.availHeight + 'px');
            }
            else {
                if (chartConfigOptions.availHeight < 235) {
                    d3.select('#container').style("overflow-y", "auto");
                    d3.select('#container').style("overflow-x", "hidden");
                    chartConfigOptions.availHeight = 235;
                    d3.select('.MAQChartsSvgRoot').style("height", chartConfigOptions.availHeight + 'px');
                }
                else if (chartConfigOptions.availWidth < 315) {
                    d3.select('#container').style("overflow-x", "auto");
                    d3.select('#container').style("overflow-y", "hidden");
                    chartConfigOptions.availWidth = 315;
                    d3.select('.MAQChartsSvgRoot').style("width", chartConfigOptions.availWidth + 'px');
                }
            }
            d3.select('.MAQChartsSvgRoot').attr("viewBox", "0 0 " + chartConfigOptions.availWidth + " " + chartConfigOptions.availHeight);
            'use strict';
            MAQ.drawLegend(chartConfigOptions);
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
            var oBubblePlotOptions = chartConfigOptions.plotOptions.bubble;
            var oSeries = chartConfigOptions.series;
            var iSeriesCounter = 0;
            var iSeriesLength = oSeries.length;
            var iCounter = 0;
            var iLength = 0;
            function getRadius() {
                return oBubblePlotOptions.radius;
            }
            var1 = 0;
            flag = 0;
            //put values in x and y axis
            for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                    oDataInfoX = MAQ.getMinMax(oSeries[iSeriesCounter].data.scaleX, oDataInfoX.min, oDataInfoX.max);
                    oDataInfoY = MAQ.getMinMax(oSeries[iSeriesCounter].data.scaleY, oDataInfoY.min, oDataInfoY.max);
                    var1++;
                }
                if (oBubblePlotOptions.consistentBubble === true) {
                    oSeries[iSeriesCounter].data.radius = oSeries[iSeriesCounter].data.radius.map(getRadius);
                }
            }
            //to check if all the Legends are disabled.
            if (var1 === 0) {
                flag = 1;
            }
            oBubblePlotOptions.bubbles = [];
            if (oDataInfoX.max && oDataInfoY.max) {
                if ((chartConfigOptions.yAxis.minVal || 0 === chartConfigOptions.yAxis.minVal) && chartConfigOptions.yAxis.maxVal) {
                    oNormalizedDataYAxis = {
                        min: chartConfigOptions.yAxis.minVal,
                        max: chartConfigOptions.yAxis.maxVal
                    };
                    oNormalizedDataYAxis.interval = (oNormalizedDataYAxis.max - oNormalizedDataYAxis.min) / chartConfigOptions.yAxis.numberOfGridLines;
                } else {
                    oNormalizedDataYAxis = MAQ.getNormalized_Min_Max_Interval(oDataInfoY.min, oDataInfoY.max, chartConfigOptions.yAxis.numberOfGridLines);
                }
                oNormalizedDataXAxis = MAQ.getNormalized_Min_Max_Interval(oDataInfoX.min, oDataInfoX.max, chartConfigOptions.xAxis.numberOfGridLines);
                oNormalizedDataXAxis.sum = oNormalizedDataXAxis.max + Math.abs(oNormalizedDataXAxis.min);
                oNormalizedDataYAxis.sum = oNormalizedDataYAxis.max + Math.abs(oNormalizedDataYAxis.min);
                var oxAxisSeries = [];
                chartConfigOptions.xAxis.labels.series = [];
                var iStartX = oNormalizedDataXAxis.min, numberParts;
                iLength = oNormalizedDataXAxis.sum / oNormalizedDataXAxis.interval;
                if (var1 > 0) {
                    xinterval = (oNormalizedDataXAxis.max - oNormalizedDataXAxis.min) / 8;
                }
                if (flag === 0) {
                    for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                        numberParts = iStartX.toString().split('.');
                        if (numberParts[1] && numberParts[1].length > 2) {
                            oxAxisSeries.push(iStartX.toFixed(2));
                        } else {
                            oxAxisSeries.push(iStartX);
                        }
                        iStartX += oNormalizedDataXAxis.interval;
                    }
                }
                else {
                    for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                        numberParts = iStartX.toString().split('.');
                        if (numberParts[1] && numberParts[1].length > 2) {
                            oxAxisSeries.push(iStartX.toFixed(2));
                        } else {
                            oxAxisSeries.push(iStartX);
                        }
                        iStartX += xinterval;
                    }
                }
                chartConfigOptions.xAxis.labels.series = oxAxisSeries;
                chartConfigOptions.plotOptions.bubble.normalizedData = oNormalizedDataYAxis;
                MAQ.drawAxis(chartConfigOptions);

                //Start drawing gridlines
                var oClipAttr = { id: 'myclippath' };
                var oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'clipPath', oClipAttr);
                //handle negative heights
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
                var oAttr = {
                    class: 'MAQCharts-plotArea',
                    transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                    opacity: 0,
                    'clip-path': 'url(#myclippath)'
                };
                oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                chartConfigOptions.svgELE.appendChild(oGrpELE);

                var iHeightFactor = chartConfigOptions.availHeight / (Math.abs(oNormalizedDataYAxis.min) + oNormalizedDataYAxis.max);
                var iWidthFactor = chartConfigOptions.availWidth / (Math.abs(oNormalizedDataXAxis.min) + oNormalizedDataXAxis.max);
                var iZeroXAxis = oNormalizedDataXAxis.min / oNormalizedDataXAxis.sum * chartConfigOptions.availWidth;
                iZeroXAxis = Math.abs(iZeroXAxis);
                var iZeroYAxis = oNormalizedDataYAxis.max / oNormalizedDataYAxis.sum * chartConfigOptions.availHeight;
                var oBubbleAttr = {
                    cx: 0,
                    cy: 0,
                    r: 0,
                    fill: '#0066CC',
                    opacity: oBubblePlotOptions.opacity,
                    stroke: oBubblePlotOptions.borderColor,
                    'stroke-width': oBubblePlotOptions.borderWidth,
                    'stroke-dasharray': MAQ.computeStrokeDashStyle(oBubblePlotOptions.borderDashStyle)
                }, oGrpBubbleChart, oDataArray, iXcord, iYcord, height, width, oBubble, oParam, oToolTip;
                for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                    oAttr = { class: 'MAQCharts-plotArea-bubbleChart-' + (iSeriesCounter + 1) };
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
                    oDataArray = oSeries[iSeriesCounter].data;
                    iLength = oDataArray.scaleX.length;
                    iXcord = 0;
                    iYcord = 0;

                    //find maximum radius from the input for normalizing the radius
                    var maxRadius = -1;
                    for (var i = 0; i < oDataArray.radius.length; i++) {
                        if (oDataArray.radius[i] > maxRadius) {
                            maxRadius = oDataArray.radius[i];
                        }
                    }

                    for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                        if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                            //don't show a bubble if the data itself is null
                            if (oDataArray.radius[iCounter] === null || oDataArray.scaleY[iCounter] === null || oDataArray.scaleX[iCounter] === null || oDataArray.radius[iCounter] === "" || oDataArray.scaleY[iCounter] === "" || oDataArray.scaleX[iCounter] === "") {
                                continue;
                            }
                            height = iHeightFactor * Math.abs(oDataArray.scaleY[iCounter]);
                            width = iWidthFactor * Math.abs(oDataArray.scaleX[iCounter]);
                            iYcord = iZeroYAxis - height;
                            if (oDataArray.scaleY[iCounter] < 0) {
                                iYcord = iYcord + 2 * height;
                            }
                            if (oDataArray.scaleX[iCounter] >= 0) {
                                iXcord = iZeroXAxis + width;
                            } else {
                                iXcord = iZeroXAxis - width;
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
                            oBubbleAttr.cx = Math.abs(iXcord);
                            oBubbleAttr.cy = iYcord;
                            if (maxRadius !== 0) {
                                oBubbleAttr.r = (oDataArray.radius[iCounter] / maxRadius) * 12; //normalize bubble radius according to input
                            }
                            else {
                                oBubbleAttr.r = 12; //if all values for radius- dataset is 0, set it to default   
                            }
                            oBubble = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oBubbleAttr);
                            oGrpBubbleChart.appendChild(oBubble);
                            oParam = {
                                seriesIndex: iSeriesCounter,
                                isPosavail: true,
                                position: iCounter,
                                config: chartConfigOptions
                            };
                            if (chartConfigOptions.tooltip.enabled) {
                                oToolTip = chartConfigOptions.tooltipDiv;
                                MAQ.addEventListener(oBubble, 'mousemove', showToolTip, oParam);
                                MAQ.addEventListener(oBubble, 'mouseout', hideToolTip, oToolTip);
                            }
                        }
                    }
                }
                MAQ.animateElement(oGrpELE, 'opacity', 1, 1000);
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
        MAQ.formatDate: Date formatting function
        @param {formatDate} input date
        @param {formatString} format string
        */
        MAQ.formatDate = function (formatDate, formatString) {
            'use strict';
            if (formatDate instanceof Date) {
                var months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ];
                var yyyy = formatDate.getFullYear();
                var yy = yyyy.toString().substring(2);
                var m = formatDate.getMonth();
                var mm = m < 10 ? '0' + m : m;
                var mmm = months[m];
                var d = formatDate.getDate();
                var dd = d < 10 ? '0' + d : d;
                var h = formatDate.getHours();
                var hh = h < 10 ? '0' + h : h;
                var n = formatDate.getMinutes();
                var nn = n < 10 ? '0' + n : n;
                var s = formatDate.getSeconds();
                var ss = s < 10 ? '0' + s : s;
                formatString = formatString.toLowerCase();
                formatString = formatString.replace('hh', hh);
                formatString = formatString.replace('h', h);
                formatString = formatString.replace('nn', nn);
                formatString = formatString.replace('n', n);
                formatString = formatString.replace('ss', ss);
                formatString = formatString.replace('s', s);
                formatString = formatString.replace('dd', dd);
                formatString = formatString.replace('d', d);
                formatString = formatString.replace('yyyy', yyyy);
                formatString = formatString.replace('yy', yy);
                formatString = formatString.replace('mmm', mmm);
                formatString = formatString.replace('mm', mm + 1);
                formatString = formatString.replace('m', m + 1);
                return formatString;
            } else {
                return '';
            }
        };
        function navigatorMouseDown(event, oParam) {
            'use strict';
            bExpanderDrag = false;
            bNavigatorDrag = true;
            event.preventDefault();
            var oCurrentElement = event.target || event.srcElement;
            MAQ.addEventListener(oCurrentElement, 'mousemove', navigatorMouseMove, oParam);
            iCurrentNavigatorX = event.clientX;
        }
        function navigatorMouseMove(event, oParam) {
            'use strict';
            //set the dragging source container id
            movingSource = oParam.config.chart.renderTo;
            event.preventDefault();
            var oCurrentElement = event.target || event.srcElement;
            if (bNavigatorDrag === true) {
                var iMouseXDiff = event.clientX - iCurrentNavigatorX;
                var iCurrX = parseFloat(oCurrentElement.x.baseVal.value + iMouseXDiff);
                if (iCurrX >= oParam.x && iCurrX <= oParam.maxX - oCurrentElement.width.baseVal.value) {
                    oCurrentElement.x.baseVal.value = iCurrX;
                    if (oParam.config.isTimeLineChart) {
                        oParam.expanderLeft.x.baseVal.value += iMouseXDiff;
                        oParam.expanderRight.x.baseVal.value += iMouseXDiff;
                        MAQ.addAttr(oParam.clipLeft, 'd', MAQ.getTriangleCoords(oParam.expanderLeft.x.baseVal.value + oParam.expanderLeft.width.baseVal.value, oParam.expanderLeft.y.baseVal.value + oParam.expanderLeft.height.baseVal.value / 2, -1 * Math.min(20, oParam.height)));
                        MAQ.addAttr(oParam.clipRight, 'd', MAQ.getTriangleCoords(oParam.expanderRight.x.baseVal.value, oParam.expanderRight.y.baseVal.value + oParam.expanderRight.height.baseVal.value / 2, Math.min(20, oParam.height)));
                    } else if (oParam.config.isLiftChart) {
                        oParam.lineLeft.x1.baseVal.value += iMouseXDiff;
                        oParam.lineLeft.x2.baseVal.value += iMouseXDiff;
                        oParam.lineRight.x1.baseVal.value += iMouseXDiff;
                        oParam.lineRight.x2.baseVal.value += iMouseXDiff;
                        oParam.lineTop.x1.baseVal.value += iMouseXDiff;
                        oParam.lineTop.x2.baseVal.value += iMouseXDiff;
                        oParam.lineBottom.x1.baseVal.value += iMouseXDiff;
                        oParam.lineBottom.x2.baseVal.value += iMouseXDiff;
                        oParam.expanderLeft.cx.baseVal.value += iMouseXDiff;
                        oParam.expanderLeftBottom.cx.baseVal.value += iMouseXDiff;
                        oParam.expanderRight.cx.baseVal.value += iMouseXDiff;
                        oParam.expanderRightBottom.cx.baseVal.value += iMouseXDiff;
                        MAQ.addAttr(oParam.leftTopTri, 'd', MAQ.getTriangleCoords(oParam.expanderLeft.cx.baseVal.value, oParam.expanderLeft.cy.baseVal.value, oParam.expanderLeft.r.baseVal.value));
                        MAQ.addAttr(oParam.leftBottomTri, 'd', MAQ.getTriangleCoords(oParam.expanderLeftBottom.cx.baseVal.value, oParam.expanderLeftBottom.cy.baseVal.value, oParam.expanderLeftBottom.r.baseVal.value));
                        MAQ.addAttr(oParam.rightTopTri, 'd', MAQ.getTriangleCoords(oParam.expanderRight.cx.baseVal.value, oParam.expanderRight.cy.baseVal.value, -oParam.expanderRight.r.baseVal.value));
                        MAQ.addAttr(oParam.rightBottomTri, 'd', MAQ.getTriangleCoords(oParam.expanderRightBottom.cx.baseVal.value, oParam.expanderRightBottom.cy.baseVal.value, -oParam.expanderRightBottom.r.baseVal.value));
                        /*Create intersection circles*/
                        var oIntersectionPointsAttr = MAQ.getIntersectionPoints(oParam.config, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value), iCounter;
                        for (iCounter = 0; iCounter < oParam.config.series.length; iCounter += 1) {
                            if (isSeriesEnabled(oParam.config.series, iCounter)) {
                                oParam.intersectionCircles[iCounter].cx.baseVal.value = oIntersectionPointsAttr.circleX[iCounter];
                                oParam.intersectionCircles[iCounter].cy.baseVal.value = oIntersectionPointsAttr.circleY[iCounter];
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'x', oIntersectionPointsAttr.circleX[iCounter]);
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'y', oIntersectionPointsAttr.circleY[iCounter]);
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'text', oIntersectionPointsAttr.values[iCounter] + '%');
                                oParam.circleTexts[iCounter].innerHTML = oIntersectionPointsAttr.values[iCounter] + '%';
                                /*for chrome*/
                                oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%';  /*for IE*/
                            }
                        }
                    }
                    var oRectAttr = {
                        x: oCurrentElement.x.baseVal.value,
                        y: oCurrentElement.y.baseVal.value,
                        width: oCurrentElement.width.baseVal.value,
                        height: oCurrentElement.height.baseVal.value
                    };
                    var sDattr = ' M ' + oParam.x + ',' + (oParam.height + oParam.y) + ' L ' + oParam.x + ',' + oParam.y + ' L ' + oRectAttr.x + ',' + oRectAttr.y + ' L ' + oRectAttr.x + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + (oParam.height + oParam.y) + ' Z';
                    MAQ.addAttr(oParam.dimmer, 'd', sDattr);
                    iCurrentNavigatorX = event.clientX;
                }
            }
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart, fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
            /*invoke the callback function*/
            if (typeof oParam.config.events.onNavigatorMove === 'function') {
                oParam.config.events.onNavigatorMove(oParam.config, Math.round(rangeStart + fNavigatorShiftRatio * oParam.navigator.x.baseVal.value), Math.round(rangeStart + fNavigatorShiftRatio * (oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value)));
            }
        }
        function navigatorMouseUp(event, oParam) {
            'use strict';
            //if this function is not called by the drag source container then simply return
            if (oParam.config.chart.renderTo !== movingSource && false === bNavigatorDrag) {
                return;
            }
            event.stopPropagation();
            event.preventDefault();
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart, fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
            if (bNavigatorDrag) {
                var oCurrentElement = event.target || event.srcElement;
                MAQ.removeEventListener(oCurrentElement, 'mousemove', navigatorMouseMove, oParam);
                if (oParam.config.isTimeLineChart) {
                    MAQ.updateTimeLineDisplayArea(oParam.config, rangeStart + fNavigatorShiftRatio * oParam.navigator.x.baseVal.value, rangeStart + fNavigatorShiftRatio * (oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value));
                } else if (oParam.config.isLiftChart) {
                    onRangeChange(oParam.config, oParam.navigator.x.baseVal.value, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value);
                }
                bNavigatorDrag = false;
            }
        }
        function stretcherMouseDown(event, oParam) {
            'use strict';
            bNavigatorDrag = false;
            bExpanderDrag = true;
            event.preventDefault();
            if ('TIMELINE' === oParam.config.chart.type.toUpperCase() && 'CHART' !== oParam.config.plotOptions.timeline.rangeDisplay.toUpperCase()) {
                var oNavigatorWindow = document.getElementById('MAQCharts-NavWindow-' + oParam.config.chart.renderTo);
                oNavigatorWindow.setAttribute('pointer-events', 'visible-fill');
            }
            var oCurrentElement = event.target || event.srcElement;
            sSelectedExpander = oCurrentElement.getAttribute('desc');
            MAQ.addEventListener(oParam.panel, 'mousemove', stretcherMouseMove, oParam);
            iCurrentNavigatorX = event.clientX;
        }
        function stretcherMouseMove(event, oParam) {
            'use strict';
            //set the dragging source container id
            movingSource = oParam.config.chart.renderTo;
            event.preventDefault();
            var iMouseXDiff = event.clientX - iCurrentNavigatorX;
            if (bExpanderDrag === true) {
                stretcherMove(oParam, iMouseXDiff);
                iCurrentNavigatorX = event.clientX;
            }
        }
        function stretcherMove(oParam, iMouseXDiff) {
            'use strict';
            var oCurrentElement = oParam.navigator;
            var iCurrX = parseFloat(oCurrentElement.x.baseVal.value + iMouseXDiff);
            var fLeftExpaderX, fRightExpaderX;
            if (oParam.config.isTimeLineChart) {
                fLeftExpaderX = oParam.expanderLeft.x.baseVal.value;
                fRightExpaderX = oParam.expanderRight.x.baseVal.value;
            } else if (oParam.config.isLiftChart) {
                fLeftExpaderX = oParam.expanderLeft.cx.baseVal.value;
                fRightExpaderX = oParam.expanderRight.cx.baseVal.value;
            }
            if (sSelectedExpander === 'left') {
                if (iCurrX >= oParam.x && fLeftExpaderX + iMouseXDiff <= fRightExpaderX - oParam.expanderWidth) {
                    if (oParam.config.isTimeLineChart) {
                        oParam.expanderLeft.x.baseVal.value += iMouseXDiff;
                        oCurrentElement.x.baseVal.value = iCurrX;
                        oCurrentElement.width.baseVal.value = oParam.expanderRight.x.baseVal.value - oParam.expanderLeft.x.baseVal.value - oParam.expanderRight.width.baseVal.value;
                        MAQ.addAttr(oParam.clipLeft, 'd', MAQ.getTriangleCoords(oParam.expanderLeft.x.baseVal.value + oParam.expanderLeft.width.baseVal.value, oParam.expanderLeft.y.baseVal.value + oParam.expanderLeft.height.baseVal.value / 2, -Math.min(20, oParam.height)));
                    } else if (oParam.config.isLiftChart) {
                        oParam.lineLeft.x1.baseVal.value += iMouseXDiff;
                        oParam.lineLeft.x2.baseVal.value += iMouseXDiff;
                        oParam.lineTop.x1.baseVal.value += iMouseXDiff;
                        oParam.lineBottom.x1.baseVal.value += iMouseXDiff;
                        oParam.expanderLeft.cx.baseVal.value += iMouseXDiff;
                        oParam.expanderLeftBottom.cx.baseVal.value += iMouseXDiff;
                        oCurrentElement.width.baseVal.value = oParam.expanderRight.cx.baseVal.value - oParam.expanderLeft.cx.baseVal.value;
                        oCurrentElement.x.baseVal.value = oParam.expanderLeft.cx.baseVal.value;
                        MAQ.addAttr(oParam.leftTopTri, 'd', MAQ.getTriangleCoords(oParam.expanderLeft.cx.baseVal.value, oParam.expanderLeft.cy.baseVal.value, oParam.expanderLeft.r.baseVal.value));
                        MAQ.addAttr(oParam.leftBottomTri, 'd', MAQ.getTriangleCoords(oParam.expanderLeftBottom.cx.baseVal.value, oParam.expanderLeftBottom.cy.baseVal.value, oParam.expanderLeftBottom.r.baseVal.value));
                    }
                }
            } else if (sSelectedExpander === 'right') {
                if (iCurrX + oCurrentElement.width.baseVal.value <= oParam.maxX && fRightExpaderX + iMouseXDiff >= fLeftExpaderX + oParam.expanderWidth) {
                    if (oParam.config.isTimeLineChart) {
                        oParam.expanderRight.x.baseVal.value += iMouseXDiff;
                        oCurrentElement.width.baseVal.value = oParam.expanderRight.x.baseVal.value - oParam.expanderLeft.x.baseVal.value - oParam.expanderRight.width.baseVal.value;
                        MAQ.addAttr(oParam.clipRight, 'd', MAQ.getTriangleCoords(oParam.expanderRight.x.baseVal.value, oParam.expanderRight.y.baseVal.value + oParam.expanderRight.height.baseVal.value / 2, Math.min(20, oParam.height)));
                    } else if (oParam.config.isLiftChart) {
                        oParam.lineRight.x1.baseVal.value += iMouseXDiff;
                        oParam.lineRight.x2.baseVal.value += iMouseXDiff;
                        oParam.lineTop.x2.baseVal.value += iMouseXDiff;
                        oParam.lineBottom.x2.baseVal.value += iMouseXDiff;
                        oParam.expanderRight.cx.baseVal.value += iMouseXDiff;
                        oParam.expanderRightBottom.cx.baseVal.value += iMouseXDiff;
                        oCurrentElement.width.baseVal.value = oParam.expanderRight.cx.baseVal.value - oParam.expanderLeft.cx.baseVal.value;
                        MAQ.addAttr(oParam.rightTopTri, 'd', MAQ.getTriangleCoords(oParam.expanderRight.cx.baseVal.value, oParam.expanderRight.cy.baseVal.value, -oParam.expanderRight.r.baseVal.value));
                        MAQ.addAttr(oParam.rightBottomTri, 'd', MAQ.getTriangleCoords(oParam.expanderRightBottom.cx.baseVal.value, oParam.expanderRightBottom.cy.baseVal.value, -oParam.expanderRightBottom.r.baseVal.value));
                        /*Create intersection circles*/
                        var oIntersectionPointsAttr = MAQ.getIntersectionPoints(oParam.config, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value), iCounter;
                        for (iCounter = 0; iCounter < oParam.config.series.length; iCounter += 1) {
                            if (isSeriesEnabled(oParam.config.series, iCounter)) {
                                oParam.intersectionCircles[iCounter].cx.baseVal.value = oIntersectionPointsAttr.circleX[iCounter];
                                oParam.intersectionCircles[iCounter].cy.baseVal.value = oIntersectionPointsAttr.circleY[iCounter];
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'x', oIntersectionPointsAttr.circleX[iCounter]);
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'y', oIntersectionPointsAttr.circleY[iCounter]);
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'text', oIntersectionPointsAttr.values[iCounter] + '%');
                                oParam.circleTexts[iCounter].innerHTML = oIntersectionPointsAttr.values[iCounter] + '%';
                                /*for chrome*/
                                oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%';  /*for IE*/
                            }
                        }
                    }
                }
            }
            var oRectAttr = {
                x: oCurrentElement.x.baseVal.value,
                y: oCurrentElement.y.baseVal.value,
                width: oCurrentElement.width.baseVal.value,
                height: oCurrentElement.height.baseVal.value
            };
            var sDattr = ' M ' + oParam.x + ',' + (oParam.height + oParam.y) + ' L ' + oParam.x + ',' + oParam.y + ' L ' + oRectAttr.x + ',' + oRectAttr.y + ' L ' + oRectAttr.x + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + (oParam.height + oParam.y) + ' Z';
            MAQ.addAttr(oParam.dimmer, 'd', sDattr);
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart;
            var fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
            /*invoke the callback function*/
            if (typeof oParam.config.events.onNavigatorMove === 'function') {
                oParam.config.events.onNavigatorMove(oParam.config, Math.round(rangeStart + fNavigatorShiftRatio * oParam.navigator.x.baseVal.value), Math.round(rangeStart + fNavigatorShiftRatio * (oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value)));
            }
        }
        function stretcherMouseUp(event, oParam) {
            'use strict';
            //if this function is not called by the drag source container then simply return
            if (oParam.config.chart.renderTo !== movingSource && false === bExpanderDrag) {
                return;
            }
            event.stopPropagation();
            event.preventDefault();
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart;
            var fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
            if ('TIMELINE' === oParam.config.chart.type.toUpperCase() && 'CHART' !== oParam.config.plotOptions.timeline.rangeDisplay.toUpperCase() && bExpanderDrag && (document !== event.target || document !== event.srcElement)) {
                var oNavigatorWindow = document.getElementById('MAQCharts-NavWindow-' + oParam.config.chart.renderTo);
                oNavigatorWindow.setAttribute('pointer-events', 'none');
            }
            if (bExpanderDrag) {
                MAQ.removeEventListener(oParam.panel, 'mousemove', stretcherMouseMove, oParam);
                if (oParam.config.isTimeLineChart) {
                    MAQ.updateTimeLineDisplayArea(oParam.config, rangeStart + fNavigatorShiftRatio * oParam.navigator.x.baseVal.value, rangeStart + fNavigatorShiftRatio * (oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value));
                } else if (oParam.config.isLiftChart) {
                    onRangeChange(oParam.config, oParam.navigator.x.baseVal.value, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value);
                }
                bExpanderDrag = false;
            }
        }
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
        /* ----------------- */
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
        MAQ.getForecastMinMax = function (oDataArray, min, max, fieldName) {
            'use strict';
            var oMergedDataArray = [];
            var jCount = 0, oMinMax = null;
            oMergedDataArray[0] = 0;
            for (jCount = 0; jCount < oDataArray.data.length; jCount += 1) {
                if (oDataArray.stacked[jCount]) {
                    oMergedDataArray[0] += oDataArray.data[jCount];
                } else {
                    oMergedDataArray[oMergedDataArray.length] = oDataArray.data[jCount];
                }
            }
            oMinMax = MAQ.getMinMax(oMergedDataArray, min, max);
            oMinMax.gapPoint = oMergedDataArray[0];
            return oMinMax;
        };
        MAQ.calculateAspectRatio = function (chartConfigOptions, iDimensionX, iDimensionY, iSum, iLastIndex) {
            'use strict';
            var iDataCounter = 0, oDataArray = chartConfigOptions.series.child, sFieldName = chartConfigOptions.plotOptions.treemap.fieldName, iCurrentDimensionX = iDimensionX, iIndividualHeight = 0, oLayout = chartConfigOptions.plotOptions.treemap.currentLayout;
            for (iDataCounter = 0; iDataCounter <= iLastIndex; iDataCounter += 1) {
                iIndividualHeight = oDataArray[iDataCounter][sFieldName] / iSum * iDimensionX;
                oLayout[iDataCounter] = iIndividualHeight;
                if (iIndividualHeight <= iCurrentDimensionX) {
                    iCurrentDimensionX = iIndividualHeight;
                }
            }
            return Math.max(iCurrentDimensionX / iDimensionY, iDimensionY / iCurrentDimensionX);
        };
        MAQ.plotArea = function (chartConfigOptions, iWidth, iHeight, numberOfValues, iDimension, a, b) {
            'use strict';
            var iCounter = 0, oContainerDiv = chartConfigOptions.container, oTreemapOptions = chartConfigOptions.plotOptions.treemap, oPrevLayout = oTreemapOptions.prevLayout, oData = chartConfigOptions.series.child;
            var leftDiv = document.createElement('div'), div, oParam, fParentHeight, titleDiv, width;
            leftDiv.style[a] = Math.round(iDimension) + 'px';
            leftDiv.style[b] = iHeight + 'px';
            leftDiv.style.cssFloat = 'left';
            oContainerDiv.appendChild(leftDiv);
            for (iCounter = 0; iCounter < numberOfValues; iCounter += 1) {
                if (Math.round(oPrevLayout[iCounter])) {
                    div = document.createElement('div');
                    div.style.cssFloat = 'left';
                    div.style.border = '1px solid white';
                    div.style[b] = oPrevLayout[iCounter] + 'px';
                    div.style[a] = Math.round(iDimension) + 'px';
                    if (typeof window[oTreemapOptions.fieldColor] === 'function') {
                        window[oTreemapOptions.fieldColor](div, oData[iCounter], oTreemapOptions.original.sum);
                    } else {
                        div.style.backgroundColor = '#CC0000';
                    }
                    leftDiv.appendChild(div);
                    if (oTreemapOptions.drillThrough) {
                        if (oData[iCounter].child) {
                            div.style.cursor = 'pointer';
                        }
                        oParam = {
                            chartConfigOptions: chartConfigOptions,
                            name: oData[iCounter][oTreemapOptions.title.fieldName],
                            level: oTreemapOptions.currentLevel,
                            data: oData[iCounter]
                        };
                        MAQ.addEventListener(div, 'mousedown', treemapDrill, oParam);
                        MAQ.addEventListener(div, 'mousemove', treemapInfoBox, oParam);
                        MAQ.addEventListener(div, 'mouseout', hideToolTip, chartConfigOptions.tooltipDiv);
                    }
                    if (oTreemapOptions.title && oTreemapOptions.title.fieldName) {
                        fParentHeight = div.clientHeight;
                        titleDiv = document.createElement('div');
                        if (oTreemapOptions.title.style) {
                            MAQ.applyStyle(titleDiv, oTreemapOptions.title.style);
                        }
                        width = 0;
                        if (b === 'width') {
                            width = Math.round(oPrevLayout[iCounter]);
                        } else {
                            width = Math.round(iDimension);
                        }
                        titleDiv.style.width = width - 2 + 'px';
                        if (oData[iCounter][oTreemapOptions.title.fieldName]) {
                            if (undefined !== titleDiv.innerText) {
                                titleDiv.innerText = oData[iCounter][oTreemapOptions.title.fieldName];
                            } else {
                                titleDiv.textContent = oData[iCounter][oTreemapOptions.title.fieldName];
                            }
                        } else {
                            if (undefined !== titleDiv.innerText) {
                                titleDiv.innerText = 'NA';
                            } else {
                                titleDiv.textContent = 'NA';
                            }
                        }
                        div.appendChild(titleDiv);
                        if (fParentHeight < titleDiv.clientHeight) {
                            div.removeChild(titleDiv);
                        }
                    }
                }
            }
            if (oData.length > 1) {
                var RightDiv = document.createElement('div');
                RightDiv.style[a] = iWidth - Math.round(iDimension) + 'px';
                RightDiv.style[b] = iHeight + 'px';
                RightDiv.style.cssFloat = 'right';
                oContainerDiv.appendChild(RightDiv);
                chartConfigOptions.container = RightDiv;
                chartConfigOptions.series.child = oData.splice(numberOfValues);
                MAQ.createTreemap(chartConfigOptions);
            }
        };
        MAQ.calculateDimension = function (chartConfigOptions, iDimensionX, iDimensionY, iTotal, bFlag) {
            'use strict';
            var iPrevAspectRatio = 0, iLoopCounter = 0, iSum = 0, iCurrAspectRatio = 0, oContainerDiv = chartConfigOptions.container, oData = chartConfigOptions.series.child, sFieldName = chartConfigOptions.plotOptions.treemap.fieldName, iCalcDimension = 0;
            for (iLoopCounter = 0; iLoopCounter < oData.length; iLoopCounter += 1) {
                iSum = iSum + oData[iLoopCounter][sFieldName];
                iCalcDimension = iSum / iTotal * iDimensionX;
                iCurrAspectRatio = MAQ.calculateAspectRatio(chartConfigOptions, iDimensionY, iCalcDimension, iSum, iLoopCounter);
                if (iPrevAspectRatio && iPrevAspectRatio < iCurrAspectRatio) {
                    break;
                }
                chartConfigOptions.plotOptions.treemap.prevLayout = chartConfigOptions.plotOptions.treemap.currentLayout.slice(0);
                iPrevAspectRatio = iCurrAspectRatio;
            }
            if (oData.length > 1) {
                if (iLoopCounter === oData.length) {
                    iLoopCounter -= 1;
                }
                iCalcDimension = (iSum - oData[iLoopCounter][sFieldName]) / iTotal * iDimensionX;
            }
            if (bFlag) {
                MAQ.plotArea(chartConfigOptions, oContainerDiv.clientWidth, oContainerDiv.clientHeight, iLoopCounter, iCalcDimension, 'width', 'height');
            } else {
                MAQ.plotArea(chartConfigOptions, oContainerDiv.clientHeight, oContainerDiv.clientWidth, iLoopCounter, iCalcDimension, 'height', 'width');
            }
        };
        function getDateParts(dateArray, sDatePart, iStart, iEnd) {
            'use strict';
            if ('string' !== typeof sDatePart) {
                console.log('Error: Expected string found ' + typeof sDatePart);
            } else {
                sDatePart = sDatePart.toUpperCase();
            }
            if (undefined === iStart) {
                iStart = 0;
            }
            if (undefined === iEnd) {
                iEnd = dateArray.length;
            }
            var months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            var datePartFunc;
            switch (sDatePart) {
                case 'DAY':
                    datePartFunc = function (array) {
                        return array.slice(iStart, iEnd + 1).map(function (iItem, iIndex) {
                            var oDate = new Date(iItem);
                            return {
                                value: oDate.getDate(),
                                start: iIndex,
                                end: iIndex
                            };
                        });
                    };
                    break;
                case 'WEEK':
                    datePartFunc = function (array) {
                        return array.slice(iStart, iEnd + 1).map(function (iItem, iIndex) {
                            var oDate = new Date(iItem);
                            return {
                                value: 'Week ' + oDate.getWeek(),
                                start: iIndex,
                                end: iIndex
                            };
                        });
                    };
                    break;
                case 'MONTH':
                    datePartFunc = function (array) {
                        return array.slice(iStart, iEnd + 1).map(function (iItem, iIndex) {
                            var oDate = new Date(iItem);
                            return {
                                value: months[oDate.getMonth()],
                                start: iIndex,
                                end: iIndex
                            };
                        });
                    };
                    break;
                default:
                    datePartFunc = function (array) {
                        return array.slice(iStart, iEnd + 1).map(function (iItem, iIndex) {
                            var oDate = new Date(iItem);
                            return {
                                value: oDate.getFullYear(),
                                start: iIndex,
                                end: iIndex
                            };
                        });
                    };
            }
            var tempArr = datePartFunc(dateArray);
            if (0 === tempArr.length) {
                return null;
            }
            var returnArr = [];
            var lastPushed = {};
            var lastStart = tempArr[0].end;
            var iCount;
            Object.keys(tempArr).forEach(function (iCount) {
                if (undefined !== lastPushed.value && lastPushed.value !== tempArr[iCount].value) {
                    lastPushed.start = iStart + lastStart;
                    returnArr.push(lastPushed);
                    lastStart = tempArr[iCount].start;
                }
                lastPushed = {
                    value: tempArr[iCount].value,
                    end: iStart + tempArr[iCount].end
                };
            });
            if (undefined !== lastPushed.value && (undefined === returnArr[returnArr.length - 1] || lastPushed.value !== returnArr[returnArr.length - 1].value)) {
                lastPushed.start = iStart + lastStart;
                returnArr.push(lastPushed);
            }
            return returnArr;
        }
        function getNextDrillLevel(sCurrentLevel) {
            'use strict';
            sCurrentLevel = sCurrentLevel.toUpperCase();
            if ('YEAR' === sCurrentLevel) {
                return 'MONTH';
            } else if ('MONTH' === sCurrentLevel) {
                return 'WEEK';
            } else {
                return 'DAY';
            }
        }
        /*TimeLine Drill Functions*/
        function createRangeSlider(chartConfigOptions, dateArray, sRangeSliderId, sDatePart, iStart, iEnd) {
            'use strict';
            if (null === sDatePart || '' === sDatePart) {
                return;
            }
            var items = getDateParts(dateArray, sDatePart, iStart, iEnd), divRangeSlider = document.getElementById(sRangeSliderId), dateItems = [], oParam;
            if (null === items) {
                return;
            }
            var currentDrillLevel = sDatePart;
            sDatePart = getNextDrillLevel(currentDrillLevel);
            var iCounter = 0, oRectAttr, oRect, iWidth, iRectX = 0, oTextAttr, oText;
            if (undefined !== divRangeSlider) {
                if (undefined !== divRangeSlider.innerHTML) {
                    divRangeSlider.innerHTML = '';
                } else {
                    while (0 < divRangeSlider.childNodes.length) {
                        divRangeSlider.removeChild(divRangeSlider.lastChild);
                    }
                }
                iWidth = chartConfigOptions.fNavigatorWidth / items.length;
                //this width is stored in the config object to be used later for snapping the navigator (snapping is not yet implemented)
                chartConfigOptions.plotOptions.timeline.drillWidth = iWidth;
                var rangeStart = items[0].start;
                chartConfigOptions.plotOptions.timeline.rangeStart = items[0].start;
                var rangeEnd = items[items.length - 1].end;
                chartConfigOptions.plotOptions.timeline.rangeEnd = items[items.length - 1].end;
                var fNavigatorShiftRatio = (rangeEnd - rangeStart) / chartConfigOptions.fNavigatorWidth, oDim, sVal, bToolTip, oToolTip;
                chartConfigOptions.plotOptions.timeline.shiftRatio = fNavigatorShiftRatio;
                for (iCounter = 0; iCounter < items.length; iCounter += 1) {
                    //if the current drill level is the lowest level drill, don't draw it
                    //or if the interval is not the lowest drill level and still has single data point and also it is the first or last interval, don't draw it
                    if ('DAY' === currentDrillLevel && items.length - 1 === iCounter || 'DAY' !== currentDrillLevel && items[iCounter].end === items[iCounter].start && (0 === iCounter || items.length - 1 === iCounter)) {
                        continue;
                    }
                    if (iCounter === items.length - 1) {
                        iWidth = chartConfigOptions.fNavigatorWidth - iRectX;
                    } else {
                        //start - 1 is done to ensure width calculation starts from previous elements end
                        iWidth = Math.ceil((items[iCounter].end - Math.max(items[iCounter].start - 1, 0)) / fNavigatorShiftRatio);
                    }
                    oRectAttr = {
                        x: iRectX,
                        y: 0,
                        width: iWidth,
                        height: chartConfigOptions.fNavigatorHeight,
                        cursor: 'pointer',
                        'pointer-events': 'visibleFill',
                        fill: chartConfigOptions.plotOptions.timeline.drillBoxes.fill,
                        stroke: chartConfigOptions.plotOptions.timeline.drillBoxes.stroke,
                        'stroke-width': chartConfigOptions.plotOptions.timeline.drillBoxes['stroke-width']
                    };
                    oRect = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oRectAttr);
                    oRect.setAttribute('data-start', items[iCounter].start);
                    oRect.setAttribute('data-end', items[iCounter].end);
                    oTextAttr = {
                        x: iRectX + iWidth / 2,
                        y: oRectAttr.height / 2 + 5,
                        text: items[iCounter].value,
                        'pointer-events': 'none',
                        style: chartConfigOptions.plotOptions.timeline.drillBoxes.fontStyle
                    };
                    //if text width is more than clip it and show tooltip
                    oDim = MAQ.utils.getTextDim('X', oTextAttr.style, chartConfigOptions);
                    sVal = oTextAttr.text;
                    bToolTip = false;
                    if (oDim.width * sVal.length > iWidth) {
                        oTextAttr.text = sVal.substr(0, Math.floor(iWidth / oDim.width));
                        oTextAttr.title = items[iCounter].value;
                        //show tooltip
                        bToolTip = true;
                    }
                    oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oTextAttr);
                    divRangeSlider.appendChild(oRect);
                    divRangeSlider.appendChild(oText);
                    dateItems.push(oRect);
                    if (bToolTip) {
                        oParam = {
                            value: sVal,
                            config: chartConfigOptions,
                            type: 'axis'
                        };
                        oToolTip = chartConfigOptions.tooltipDiv;
                        MAQ.addEventListener(oRect, 'mouseover', showToolTip, oParam);
                        MAQ.addEventListener(oRect, 'mouseout', hideToolTip, oToolTip);
                    }
                    //increment x position by width of previous drill box
                    iRectX += iWidth;
                }
                dateItems.forEach(function (oEle) {
                    oEle.addEventListener('click', function () {
                        var dataStart = parseInt(oEle.getAttribute('data-start'));
                        var dataEnd = parseInt(oEle.getAttribute('data-end'));
                        var oNavigatorWindow = document.getElementById('MAQCharts-NavWindow-' + chartConfigOptions.chart.renderTo);
                        if (dataStart === dataEnd) {
                            createRangeSlider(chartConfigOptions, chartConfigOptions.originalSeries.timeline, 'MAQCharts-TimeLineDrill-' + chartConfigOptions.chart.renderTo, 'year');
                            expandFullNavigator(chartConfigOptions);
                            chartConfigOptions.plotOptions.timeline.rangeStart = 0;
                            chartConfigOptions.plotOptions.timeline.rangeEnd = dateArray.length - 1;
                            fNavigatorShiftRatio = dateArray.length / chartConfigOptions.fNavigatorWidth;
                            MAQ.updateTimeLineDisplayArea(chartConfigOptions, fNavigatorShiftRatio * oNavigatorWindow.x.baseVal.value, fNavigatorShiftRatio * (oNavigatorWindow.x.baseVal.value + oNavigatorWindow.width.baseVal.value));
                            return;
                        }
                        createRangeSlider(chartConfigOptions, dateArray, sRangeSliderId, sDatePart, dataStart, dataEnd);
                        expandFullNavigator(chartConfigOptions);
                        MAQ.updateTimeLineDisplayArea(chartConfigOptions, dataStart + chartConfigOptions.plotOptions.timeline.shiftRatio * oNavigatorWindow.x.baseVal.value, dataStart + chartConfigOptions.plotOptions.timeline.shiftRatio * (oNavigatorWindow.x.baseVal.value + oNavigatorWindow.width.baseVal.value));
                    }, false);
                });
            } else {
                console.log('Error: No element exists with id ' + sRangeSliderId + '.');
            }
        }
        Date.prototype.getWeek = function () {
            'use strict';
            var startDate = new Date(this.getFullYear(), 0);
            startDate.setHours(0, 0, 0, 0);
            //daysLeft stores the no. of days left from the week in last year
            var daysLeft = 6 - startDate.getDay();
            var currentDate = new Date(this.getTime());
            currentDate.setHours(0, 0, 0, 0);
            var week = 1;
            //if daysLeft is 6 then the week starts with this date
            if (6 !== daysLeft) {
                startDate = new Date(startDate.getFullYear(), 0, startDate.getDate() + daysLeft + 1);
                week += 1;
            }
            while (startDate < currentDate) {
                startDate.setDate(startDate.getDate() + 7);
                week += 1;
            }
            if (startDate === currentDate) {
                return week;
            } else {
                return week - 1;
            }
        };
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