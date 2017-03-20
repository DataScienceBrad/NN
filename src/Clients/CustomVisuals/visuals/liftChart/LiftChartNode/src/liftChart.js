/*JSHint Count = 0*/
function myMAQlibrary(dWagon, nodeData, liftFormatters, tragicPragic) {

    var isOverlapped = false, totalWindowWidth = 0;
    if (liftFormatters.markerWidth < 0) {
        liftFormatters.markerWidth = 1;
    }
    var consumeData = dWagon;
    var liftConfig = {
        "chart": {
            "redrawMarker": false,
            "dragStart": 0,
            "dragWidth": 150,
            "renderTo": "liftVisual",
            "type": "lift",
            "isResponsive": false,
            "margin": [
                20,
                10,
                10,
                10
            ],
            "style": {
                "width": Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + "px",
                "height": Math.max(document.documentElement.clientHeight, window.innerHeight || 0) + "px",
                "border": "0px solid silver"
            }
        },
        "title": {
            "align": "center",
            "text": "0",
            "x": 0,
            "y": 0,
            "floating": false,
            "style": {
                "fontSize": "0px",
                "fontFamily": "Segoe UI",
                "textAnchor": "middle"
            }
        },
        "plotOptions": {
            "line": {
                "stepLine": liftFormatters.enableStepLine,
                "marker": {
                    "enabled": liftFormatters.enableMarker,
                    "fillColor": "",
                    "lineWidth": 1,
                    "lineColor": "",
                    "width": liftFormatters.markerWidth
                },
                "color": [],
                "lineWidth": liftFormatters.lineWidth,
                "lineDashStyle": ""
            },
            "lift": {
                "dragAreaFill": "",
                "dragAreaOpacity": 0.3,
                "dragLineStyle": "5,5",
                "dragLineWidth": liftFormatters.dragLineWidth,
                "dragLineColor": liftFormatters.dragLineColor,
                "dragWindowFill": "transparent",
                "dragWindowBorderStyle": "",
                "dragWindowOpacity": 0,
                "dragCircleFill": "#505151",
                "intersectionMarker": {
                    "radius": 20,
                    "strokeColor": liftFormatters.strokeColor,
                    "strokeWidth": liftFormatters.strokeWidth,
                    "fontStyle": {
                        "fill": liftFormatters.bubbleText,
                        "fontSize": liftFormatters.bubbleSize + "px",
                        "fontFamily": "Segoe UI",
                        "fontWeight": "bold"
                    },
                    "dx": 0,
                    "dy": 2
                }
            }
        },
        "legend": {
            "enabled": liftFormatters.legendValues,
            "enableClick": liftFormatters.enableLegendClick,
            "align": "center",
            "verticalAlign": "top",
            "verticalAlignLegend": true,
            "layout": "horizontal",
            "floating": false,
            "borderStyle": "",
            "borderWidth": 0,
            "borderRadius": 2,
            "symbolWidth": 10,
            "symbolPadding": 3,
            "individualDistance": 10,
            "lineHeight": 5,
            "symbolRadius": 30,
            "style": {
                "fill": "#444444",
                "fontSize": "12px",
                "fontFamily": "Segoe UI"
            },
            "enableTextClipping": false,
            "clipTextFrom": "left",
            "clippedTextLength": 10
        },
        "xAxis": {
            "title": {
                "align": "center",
                "text": "",
                "style": {
                    "fill": "#2A8AAD",
                    "fontSize": "16px",
                    "fontFamily": "Segoe UI",
                    "textAnchor": "middle"
                },
                "x": 0,
                "y": -5
            },
            "labels": {
                "enabled": liftFormatters.xAxisEnableLabels,
                "align": "center",
                "series": [],
                "formatter": null,
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "black",
                    "fontSize": liftFormatters.xAXisFontSize,
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 8,
            "gridLineWidth": liftFormatters.xAxisGridLineWidth,
            "gridLineColor": liftFormatters.xAxisGridLineColor,
            "gridLineDashStyle": "solid",
            "lineColor": "silver",
            "lineWidth": 0,
            "tickWidth": 0,
            "tickHeight": 0,
            "tickColor": "silver",
            "tickPosition": "outside",
            "labelSpacing": 5,
            "shiftStartBy": 0,
            "skipInterval": 0,
            "alternateGridColor": "",
            "usageWidth": 99
        },
        "yAxis": {
            "title": {
                "align": "center",
                "text": "Cumulative % Capture",
                "style": {
                    "fill": "#2A8AAD",
                    "fontSize": "0px",
                    "fontFamily": "Segoe UI",
                    "textAnchor": "middle"
                },
                "x": -20,
                "y": 0
            },
            "labels": {
                "enabled": liftFormatters.yAxisEnableLabels,
                "align": "right",
                "series": [],
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "black",
                    "fontSize": liftFormatters.yAXisFontSize,
                    "fontFamily": "Segoe UI"
                },
                "x": -5,
                "y": 0
            },
            "numberOfGridLines": 4,
            "gridLineWidth": liftFormatters.yAxisGridLineWidth,
            "gridLineColor": liftFormatters.yAxisGridLineColor,
            "gridLineDashStyle": "shortdash",
            "lineWidth": 0,
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
                "font": "14px \"Segoe UI\""
            }
        },
        "animation": {
            "enabled": false,
            "type": 1
        },
        "series": []
    };
    var normalizer = (liftFormatters.bubbleSize / 100);
    normalizer = normalizer * 12;
    liftConfig.plotOptions.lift.intersectionMarker.fontStyle.fontSize = normalizer + "px";
    normalizer = liftFormatters.yAXisFontSize / 100;
    normalizer = normalizer * 39;
    liftConfig.yAxis.labels.style.fontSize = normalizer + "px";
    normalizer = liftFormatters.xAXisFontSize / 100;
    normalizer = normalizer * 39;
    liftConfig.xAxis.labels.style.fontSize = normalizer + "px";
    normalizer = liftFormatters.markerWidth / 100;
    normalizer = normalizer * 17;
    liftConfig.plotOptions.line.marker.width = normalizer;
    normalizer = liftFormatters.lineWidth / 100;
    normalizer = normalizer * 33;
    liftConfig.plotOptions.line.lineWidth = normalizer;
    normalizer = liftFormatters.dragLineWidth / 100;
    normalizer = normalizer * 15;
    liftConfig.plotOptions.lift.dragLineWidth = normalizer;
    normalizer = liftFormatters.yAxisGridLineWidth / 100;
    normalizer = normalizer * 10;
    liftConfig.yAxis.gridLineWidth = normalizer;
    normalizer = liftFormatters.xAxisGridLineWidth / 100;
    normalizer = normalizer * 10;
    liftConfig.xAxis.gridLineWidth = normalizer;
    if (tragicPragic == true) {
        window.redrawMarker = true;
    }
    for (var dIterator = 0; dIterator < nodeData.dataPoints.length; dIterator++) {
        liftConfig.plotOptions.line.color.push(nodeData.dataPoints[dIterator].color);
    }
    var roles = {
        "measure": [],
        "category": []
    }
    var obj, data = [],
        jCount, iCount, keys;
    for (iCount = 0; iCount < dWagon.metadata.columns.length; iCount++) {
        keys = Object.keys(dWagon.metadata.columns[iCount].roles);
        for (jCount = 0; jCount < keys.length; jCount++) {
            if ('category' === keys[jCount] || typeof (dWagon.table.rows[0][iCount]) === 'number') {
                roles[keys[jCount]].push(iCount);
            }
        }
    }
    if (0 === roles.category.length) {
        document.getElementById('liftVisual').innerHTML = "";
        return;
    }
    var obj, data = [],
        sectionHeader;
    if (0 != dWagon.table.columns.length) {
        sectionHeader = dWagon.table.columns[roles.category[0]].displayName;
    }
    for (iCount = 0; iCount < roles.measure.length; iCount++) {
        if (typeof (dWagon.table.rows[0][roles.measure[iCount]]) === 'number') {
            obj = {
                name: dWagon.table.columns[roles.measure[iCount]].displayName,
                data: []
            };
            data.push(obj);
        }
    }
    liftConfig.xAxis.labels.series = [];
    for (jCount = 0; jCount < dWagon.table.rows.length; jCount++) {
        liftConfig.xAxis.labels.series.push(dWagon.table.rows[jCount][roles.category[0]]);
        for (iCount = 0; iCount < roles.measure.length; iCount++) {
            data[iCount].data.push(dWagon.table.rows[jCount][roles.measure[iCount]]);
        }
    }
    liftConfig.series = data;
    for (legendName = 0; legendName < dWagon.categorical.values.length; legendName++) {
        if (liftConfig.series[legendName]) {
            liftConfig.series[legendName].name = dWagon.categorical.values[legendName].source.displayName;
            liftConfig.series[legendName].enabled = powerbi.extensibility.visual.PBI_CV_0C8159C4_5413_4262_A0E1_4E0CEF5FFC65.Visual.getLegendEnable()[legendName];
        }
    }
    (function mike(liftConfig) {
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
            var copy, len, iCounter = 0,
                attr;
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
            },
                oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr),
                oDim;
            chartConfigOptions.svgELE.appendChild(oText);
            oDim = MAQ.getObjectDimension(oText);
            chartConfigOptions.svgELE.removeChild(oText);
            return oDim;
        };
        MAQ.utils.getMultiLineSVGText = function (sSvgNS, oChartRoot, sText, oTextAttr, maxChars, iData) {
            'use strict';
            var sTextItem, iDy = 0,
                iLineSpacing = 0,
                sTextKey, oTextGrp = MAQ.createSVGElement(sSvgNS, 'g', {}),
                iMaxWidth = 0,
                iSignX = 1,
                iSignY = -1,
                iOffsetX = 0,
                iTotalHeight = 0,
                iDeltaX = 15,
                //**Convert Text into multiline array**//
                sTexts = [],
                iLastIndex = 0,
                iTextLen = sText.length,
                sTempText, i;
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
            var pivotArr = [],
                iRows = arr.length,
                iCols = arr[0].length,
                iCount, jCount;
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
            var linearArr = [],
                iCount;
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
                    iDecimalPlaces = 0; // Default value is 0
                }
                var fTempValue = parseFloat(sInput),
                    sTempValue = fTempValue.toString(),
                    aDigits, rPattern, sIntegerDigits, sFractionDigits, decimalLength;
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
                    iDecimalPlaces = 1; // Default value is 1
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
                var fTempValue = parseFloat(sInput),
                    sTempValue, aDigits, iTempValue, rPattern, sCurrency, sIntegerDigits, sFractionDigits, decimalLength;
                if (fTempValue < 0) {
                    sInput = -1 * fTempValue;
                } else {
                    sInput = fTempValue;
                }
                // Check for validity of decimal places parameter
                if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
                    iDecimalPlaces = 0; // Default value is 0
                }
                sTempValue = sInput.toString();
                if (-1 !== sTempValue.indexOf('.')) {
                    decimalLength = sTempValue.substring(sTempValue.indexOf('.') + 1).length;
                    if (iDecimalPlaces < decimalLength) {
                        sTempValue = sInput.toFixed(iDecimalPlaces).toString();
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
                        iDecimalPlaces = 2; // Default value is 0
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
                var oJson, rule = '',
                    key;
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
                var iCount = 0,
                    iLen;
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
                var iCount = 0,
                    iLen;
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
                    redrawMarker: false,
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
                                style: {
                                    opacity: 1
                                }
                            },
                            style: {
                                opacity: 0.5
                            }
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
                                style: {
                                    opacity: 1
                                }
                            },
                            style: {}
                        },
                        color: [],
                        opacity: 0.8,
                        lineWidth: 1,
                        lineDashStyle: '',
                        strokes: []
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
                                style: {
                                    opacity: '1 !important'
                                }
                            },
                            style: {
                                opacity: 0
                            }
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
                        style: {
                            'stroke-width': '3px'
                        },
                        counterStyle: {
                            opacity: 0.3
                        },
                        chartStyle: {
                            opacity: 1,
                            'stroke-width': '2px'
                        },
                        counterChartStyle: {
                            opacity: 0.2
                        }
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
                    dualxAxis: [{
                        labels: {
                            style: {}
                        },
                        title: {
                            text: '',
                            style: {},
                            x: 0,
                            y: 0
                        }
                    }, {
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
                    }],
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
                median: {
                    enabled: true
                },
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
                        case 'lift':
                            MAQ.createLiftChart(this.chartOptions);
                            break;
                    }
                }
            } else {
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
            var iCount, arrColor, iColorLength, iSeriesLength, iLine, iBar, legendColor = [],
                arrTempColorSeries = [],
                tempSeries, lineCount = 0,
                iTempSeries, barCount = 0;
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
            var containerElement = document.getElementById(chartConfigOptions.chart.renderTo),
                oBowTie, oBranch, oYAxis, oXAxis;
            if (!containerElement) {
                return 'Invalid ID to render chart.';
            }
            chartConfigOptions.container = containerElement;
            if (!chartConfigOptions.chart.type) {
                return 'Kindly specify the type of chart to render.';
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
            var currentVal = oELE.getAttributeNS(null, sPropertyToAnimate),
                increment, counter, process;
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
                var currentVal = document.getElementById(oELE).getAttribute(sPropertyToAnimate),
                    increment, counter, process;
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
            var sStrokeDashValue = '',
                oDash = {
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
                var oStyleColl = Object.keys(oStyle),
                    iStyleCounter = 0,
                    iNumOfStyle = oStyleColl.length;
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
            var iDataArrayLength = oDataArray.length,
                iDataCounter = 0,
                iSum = 0,
                iCurrentValue = 0;
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
            var iOgMax = iMax,
                iOgMin = iMin,
                iInterval, fExponent, oMultiple, iMultipleLength, iNormalizationFactor, oNormalizationFactor, modRes, iCounter, iIndexPos, bMax, bMin, iNegAxisCount, iPosAxisCount, iOpNum, iLogMultiple, iRem, iOptimumMax;
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
                var oAttrColl = Object.keys(oAttr),
                    iAttrCounter = 0,
                    iAttrLength = oAttrColl.length;
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
                var oTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr),
                    oGrpELE = document.createElementNS(chartConfigOptions.svgNS, 'g');
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
                powerbi.extensibility.visual.PBI_CV_0C8159C4_5413_4262_A0E1_4E0CEF5FFC65.Visual.setLegendEnable(oParam.seriesIndex, false);
            } else if (0 !== oParam.config.series[oParam.seriesIndex].data) {
                oParam.config.series[oParam.seriesIndex].enabled = true;
                powerbi.extensibility.visual.PBI_CV_0C8159C4_5413_4262_A0E1_4E0CEF5FFC65.Visual.setLegendEnable(oParam.seriesIndex, true);
            } else {
                return; //#62 donut bug fix
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
            // Added code segemnt to fix chart shift issue (on click of legends)
            oParam.config.availX = 0;
            oParam.config.availY = 0;

            MAQ.drawChartTitle(oParam.config);
            switch (oParam.config.chart.type.toLowerCase()) {
                case 'lift':
                    MAQ.createLiftChart(oParam.config);
                    break;
            }
        }
        /*
        END: MAQ.redrawChart: Redraw chart on selected legend
        */
        function removeLegendHover(evt, oParam) {
            'use strict';
            //remove all the hover effects
            var oLegendActive = document.querySelectorAll('.MAQCharts-legend-hover'),
                oChartActive = document.querySelectorAll('g.legendActive'),
                oLegendDim = document.querySelectorAll('.MAQCharts-legend-dim'),
                oChartDim = document.querySelectorAll('g.legendDim');
            MAQ.styles.removeClass(oLegendActive, 'MAQCharts-legend-hover');
            MAQ.styles.removeClass(oChartActive, 'legendActive');
            MAQ.styles.removeClass(oLegendDim, 'MAQCharts-legend-dim');
            MAQ.styles.removeClass(oChartDim, 'legendDim');
            //console.log('removed legend hover effects for ' + oParam.seriesIndex);
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
            var aLegends = oParam.config.legend.legends,
                iCount = 0;
            var iLen = aLegends.length;
            var oChartPlots = oParam.config.plotOptions[oParam.config.chart.type][oParam.config.chart.type + 's'],
                oMarkers;
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
            var top = 0,
                left = 0,
                mouseX, mouseY;
            while (obj.tagName !== 'BODY') {
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }
            // return relative mouse position
            mouseX = evt.clientX - left + window.pageXOffset;
            mouseY = evt.clientY - top + window.pageYOffset;
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
            var oSVG = oConfig.svgELE,
                fInterval = oConfig.plotIntervalWidth,
                oCord = getMousePos(oConfig.container, evt),
                oToolTip = oConfig.tooltipDiv,
                oMarker;
            oToolTip.style.display = 'block';
            oToolTip.style.zIndex = 20;
            if (!oParam.type) {
                var oSeries = oConfig.series[oParam.seriesIndex],
                    oLabels = oConfig.series.label,
                    oPoint = oSVG.createSVGPoint();
                oPoint.x = evt.clientX;
                oPoint.y = evt.clientY;
                var oSVGCord = oPoint.matrixTransform(oSVG.getScreenCTM().inverse()),
                    iSelectedIndex = 0;
                if (oParam.isPosavail) {
                    iSelectedIndex = oParam.position;
                } else {
                    //if this is multi stacked combo line
                    if (undefined !== oParam.rowIndex) {
                        iSelectedIndex = MAQ.getDataIndexPosition(oSVGCord, oSeries.xPos[oParam.rowIndex], fInterval);
                    } else {
                        iSelectedIndex = MAQ.getDataIndexPosition(oSVGCord, oSeries.xPos, fInterval);
                    }
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
                    var sChartType = oConfig.chart.type,
                        iLen, i, tempValue;
                    switch (sChartType.toLowerCase()) {
                        default: oToolTip.innerHTML = document.querySelector(".MAQCharts-RangeSelector").querySelectorAll('text')[oParam.seriesIndex].innerHTML;
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
            var fTopCordinate = oCord.y - oToolTip.clientHeight - 5;
            if (fTopCordinate <= 10) {
                fTopCordinate = oCord.y + 10;
            }
            var fLeftCordinate = oCord.x - oToolTip.clientWidth - 10;
            var leftScroll = $('#liftVisual.visual').scrollLeft();
            if (fLeftCordinate <= 10) {
                fLeftCordinate = leftScroll + oCord.x + 10;
            }
            oToolTip.style.top = fTopCordinate + 'px';
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
            var oSeries = oConfig.series[oParam.seriesIndex],
                oMarker, iMarkerGrps, iCount = 0;
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
            var oConfig = oParam.config,
                oGrpTooltips = oConfig.plotGroup.querySelectorAll('.MAQCharts-plotArea-tooltips'),
                oSelGrpTooltip = oConfig.plotGroup.querySelector('#MAQCharts-plotArea-tooltips-' + (oParam.seriesIndex + 1)),
                oGrp;
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
            var oLegend = chartConfigOptions.legend,
                oLegStyle, oChartStyle, oLegCStyle, oChartCStyle, sRectRule, sRectCRule, sTextRule, sTextCRule, sChartRule, sChartCRule, obj;
            if (oLegend.enabled) {
                oLegend.legends = [];
                if (chartConfigOptions.series.length > 0) {
                    var iNumSymbols = chartConfigOptions.series.length,
                        iNoOfLegendLines = 1,
                        iPadding = 4,
                        oDim, iSeriesLen = chartConfigOptions.series.length,
                        oAttr = {
                            class: 'MAQCharts-legend',
                            id: 'legend'
                        },
                        oGrpLegend = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr),
                        customOrder = chartConfigOptions.legend.customOrder;
                    chartConfigOptions.svgELE.appendChild(oGrpLegend);
                    oAttr = {
                        class: 'MAQCharts-legend-labels'
                    };
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
                    var oColor = chartConfigOptions.plotOptions[chartConfigOptions.chart.type].color,
                        imaxWidth = 0,
                        iSCounter = 0,
                        oRectELE, sTempText, bAttachTooltip, iTextLen, oTextELE, oToolTip;
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
                                oAttr.width -= imaxWidth; // oDim.width
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
            var oYAxis = chartConfigOptions.yAxis,
                count, oAttr, oGrpELE, axis, oTitleObj, oDim = null;
            if (oYAxis.title.text) {
                if (!oYAxis.dualAxisEnabled) {
                    oAttr = {
                        class: 'MAQCharts-yAxisTitle'
                    };
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
                            oAttr = {
                                class: 'MAQCharts-yAxisTitle'
                            };
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
                    oAttr = {
                        class: 'MAQCharts-xAxisTitle'
                    };
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
                        var count = 0,
                            iYvalue;
                        for (count = 0; count < 2; count += 1) {
                            oAttr = {
                                class: 'MAQCharts-xAxisTitle'
                            };
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
            var oAxisLabel = oAxis.labels,
                fSpacing, oAttr, oText, oDimAxis;
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
        var iglobalCounter = 0,
            ioriginalyAxisLength, ioriginalxAxisLength;
        /*
        MAQ.drawAxis: Renders both the axes
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.drawAxis = function (chartConfigOptions) {
            'use strict';
            var iCounter = 0,
                iLength = 0,
                sBigData = '',
                bottomSpacing = 0,
                leftSpacing = 0,
                sChartType = chartConfigOptions.chart.type,
                xAxis = chartConfigOptions.xAxis,
                yAxis = chartConfigOptions.yAxis,
                xAxisLabel = xAxis.labels,
                yAxisLabel = yAxis.labels,
                xAxisSeries = xAxisLabel.series,
                yAxisSeries = yAxisLabel.series,
                xAxisSeriesLength = 0,
                yAxisSeriesLength = 0,
                yAxisLimit = 0;

            xAxisSeriesLength = xAxisSeries.length;
            var oAttr = {
                class: 'MAQCharts-chartArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
            };
            var oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null,
                oNormalizedData, iStart, iInterval, oTimelineData, temp, oGridAreaGrpELE, iNumberOfGridLines, oGrpYAxis, oGrpYAxisLblNTick, oAttrYAxis, oYAxisLine, intervalHeight, oAttrTick;

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
            oAttr = {
                class: 'MAQCharts-yAxis-gridArea'
            };
            oGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oAttr = {
                class: 'MAQCharts-yAxis'
            };
            oGrpYAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxis);
            oAttr = {
                class: 'MAQCharts-yAxis-Grid-Labels-Ticks'
            };
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

            /* Compute Space for X-Axis Labels */
            /* Plot X-Axis, X-Axis-Ticks, and X-Axis-Labels */
            var oAttrXAxis = {
                x1: oAttrYAxis.x1,
                y1: oAttrYAxis.y2,
                x2: chartConfigOptions.availWidth + oAttrYAxis.x1 - leftSpacing,
                y2: oAttrYAxis.y2,
                stroke: xAxis.lineColor,
                'stroke-width': xAxis.lineWidth
            };
            oAttr = {
                class: 'MAQCharts-xAxis'
            };
            var oGrpXAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxis);
            oAttr = {
                class: 'MAQCharts-xAxis-Grid-Labels-Ticks'
            };
            var oGrpXAxisLblNTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpXAxisLblNTick);
            chartConfigOptions.xLabels = oGrpXAxisLblNTick;
            oAttr = {
                class: 'MAQCharts-xAxis-gridArea'
            };
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
            var sTempText = '',
                iPrevX, oDim, isDrillBar, oParam, oToolTip, iStartOffset;

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
                    iPrevX = oAttrLabel.x;
                    oAttrLabel.text = xAxisSeries[iCounter] ? xAxisSeries[iCounter] : "";
                    oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                    /* Code for clipping the text to specified number of characters */
                    sTempText = oAttrLabel.text;
                    if (!xAxisLabel.formatter && sTempText.length > iNumOfCharsAllowed) {
                        oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 2)) + '...';
                        oAttrLabel.x = oAttrLabel.x + (20 * iCounter);
                        totalWindowWidth = oAttrLabel.x;
                        isOverlapped = true;
                    }
                    if (!xAxisLabel.enabled) {
                        oAttrLabel.text = "";
                    }
                    totalWindowWidth = oAttrLabel.x;
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
                    if (!xAxisLabel.enabled) {
                        oAttrLabel.text = "";
                    }
                    //}
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
            /*Condition Change*/
            if (xAxisSeries.length <= 0) {
                iLength = chartConfigOptions.series[0].data.length;
                oTimelineData = chartConfigOptions.series[0].timeline;
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    if (chartConfigOptions.isTimeLineChart) {
                        xAxisSeries[iCounter] = MAQ.formatDate(new Date(oTimelineData[iCounter]), 'mmm dd');
                    } else {
                        xAxisSeries[iCounter] = iCounter + 1;
                    }
                }
            }
            oAttr = {
                class: 'MAQCharts-yAxis-gridArea'
            };
            oGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oAttr = {
                class: 'MAQCharts-yAxis'
            };
            oGrpYAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxis);
            oAttr = {
                class: 'MAQCharts-yAxis-Grid-Labels-Ticks'
            };
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
            //Y-axis gridlines
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
            chartConfigOptions.availWidth = totalWindowWidth;
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
            var iSkipInterval = yAxis.skipInterval,
                oLabelDim;
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
        };
        /*
        MAQ.createLineChart: Renders line chart
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.createLineChart = function (chartConfigOptions) {
            'use strict';
            MAQ.drawLegend(chartConfigOptions);
            MAQ.drawXAxisTitle(chartConfigOptions);
            MAQ.drawYAxisTitle(chartConfigOptions);
            MAQ.applyMargin(chartConfigOptions, chartConfigOptions.chart.margin);
            var oDataInfo = {
                min: 0,
                max: 1
            },
                oSeries = chartConfigOptions.series,
                clipPathNode = '',
                clipPathID = '',
                iSeriesLength = oSeries.length,
                iSeriesCounter = 0,
                iCounter = 0,
                iLength = 0,
                oGrpELE, oNormalizedData, oMarkerEle, oTooltipEle, animationConfigurations = getAnimationConfigurations(chartConfigOptions);
            oSeries.label = chartConfigOptions.xAxis.labels.series;
            for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                    oDataInfo = MAQ.getMinMax(oSeries[iSeriesCounter].data, oDataInfo.min, oDataInfo.max);
                }
            }
            if (oDataInfo.min || oDataInfo.max) {
                if ((chartConfigOptions.yAxis.minVal || 0 === chartConfigOptions.yAxis.minVal) && chartConfigOptions.yAxis.maxVal) {
                    oNormalizedData = {
                        min: chartConfigOptions.yAxis.minVal,
                        max: chartConfigOptions.yAxis.maxVal
                    };
                    oNormalizedData.interval = (oNormalizedData.max - oNormalizedData.min) / chartConfigOptions.yAxis.numberOfGridLines;
                } else {
                    oNormalizedData = MAQ.getNormalized_Min_Max_Interval(oDataInfo.min, oDataInfo.max, chartConfigOptions.yAxis.numberOfGridLines);
                }
                oNormalizedData.sum = oNormalizedData.max + Math.abs(oNormalizedData.min);
                chartConfigOptions.plotOptions.line.normalizedData = oNormalizedData;
                MAQ.drawAxis(chartConfigOptions);
                if (chartConfigOptions.animation.enabled) {
                    clipPathNode = document.querySelectorAll('#' + chartConfigOptions.chart.renderTo + 'clippath');
                    if (clipPathNode.length > 0) {
                        clipPathID = String(chartConfigOptions.chart.renderTo + 'clippath' + clipPathNode.length);
                    } else {
                        clipPathID = String(chartConfigOptions.chart.renderTo + 'clippath');
                    }
                    var oClipAttr = {
                        id: clipPathID
                    };
                    oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'clipPath', oClipAttr);
                    var oClipRectAttr = {
                        id: clipPathID + 'Rect',
                        x: animationConfigurations.x - chartConfigOptions.plotOptions.line.marker.width,
                        y: animationConfigurations.y,
                        width: animationConfigurations.width,
                        height: animationConfigurations.height
                    };
                    oGrpELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oClipRectAttr));
                    chartConfigOptions.svgELE.appendChild(oGrpELE);
                }
                var oAttr = {
                    class: 'MAQCharts-plotArea',
                    transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                    opacity: 1,
                    width: 10,
                    'clip-path': chartConfigOptions.animation.enabled ? 'url(#' + clipPathID + ')' : ''
                };
                oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                chartConfigOptions.svgELE.appendChild(oGrpELE);
                //store a reference to the MAQCharts-PlotArea SVG group
                chartConfigOptions.plotGroup = oGrpELE;
                var iHeightFactor = chartConfigOptions.availHeight / (Math.abs(oNormalizedData.min) + oNormalizedData.max),
                    iZeroAxis = oNormalizedData.max / oNormalizedData.sum * chartConfigOptions.availHeight,
                    oLinePlotOptions = chartConfigOptions.plotOptions.line,
                    oTooltips = chartConfigOptions.tooltip,
                    bStaticTooltip = chartConfigOptions.legend.hover.staticTooltip && chartConfigOptions.legend.hover.enabled,
                    oMarker = oLinePlotOptions.marker,
                    bShowMarker = oMarker.enabled;
                //array to hold the marker elements
                oMarker.markers = [];
                //array to hold the tooltip elements
                oTooltips.tooltips = [];
                //array to hold the line elements
                oLinePlotOptions.lines = [];
                var bStepLine = oLinePlotOptions.stepLine,
                    oParam = {};
                var oGrpLineChart, oGrpStaticTooltips, oGrpLineMarkers, oPathAttr, oPath, oDataArray, iXcord, iYcord, oXcord, oYcord, bPathMoveFlag, height;
                chartConfigOptions.groupObjectArray = [];
                for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                    oAttr = {
                        class: 'MAQCharts-plotArea-lineChart-' + (iSeriesCounter + 1)
                    };
                    oGrpLineChart = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                    oGrpELE.appendChild(oGrpLineChart);
                    oLinePlotOptions.lines.push(oGrpLineChart);
                    //create static tooltip group
                    oGrpStaticTooltips = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', {
                        class: 'MAQCharts-plotArea-tooltips',
                        id: 'MAQCharts-plotArea-tooltips-' + (iSeriesCounter + 1),
                        display: 'none'
                    });
                    oTooltips.tooltips.push(oGrpStaticTooltips);
                    //create markers group
                    oAttr = {
                        class: 'MAQCharts-plotArea-markers-' + (iSeriesCounter + 1)
                    };
                    oGrpLineMarkers = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                    oMarker.markers.push(oGrpLineMarkers);
                    //add hover styles for marker with class name MAQCharts-marker-hover
                    //add this class to the respective markers when hovered
                    if (bShowMarker && oMarker.hover.enabled) {
                        MAQ.styles.addRule('#' + chartConfigOptions.chart.renderTo + ' .' + oAttr.class + ' .MAQCharts-marker-hover', MAQ.styles.jsonToRule(oMarker.hover.style));
                    }
                    chartConfigOptions.groupObjectArray[iSeriesCounter] = oGrpLineChart;
                    oPathAttr = {
                        d: '',
                        fill: 'transparent',
                        'z-index': 5,
                        'pointer-events': 'visibleStroke',
                        stroke: oLinePlotOptions.color[iSeriesCounter],
                        'stroke-width': oLinePlotOptions.lineWidth,
                        'stroke-dasharray': MAQ.computeStrokeDashStyle(oLinePlotOptions.lineDashStyle)
                    };
                    oPath = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oPathAttr);
                    oGrpLineChart.appendChild(oPath);
                    oDataArray = oSeries[iSeriesCounter];
                    iLength = oDataArray.data.length;
                    iXcord = 0;
                    iYcord = 0;
                    oXcord = [];
                    oYcord = [];
                    bPathMoveFlag = false;
                    if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                        var xVal;
                        for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                            xVal = iXcord;
                            if (isOverlapped) {
                                xVal = iXcord + (20 * iCounter);
                            }
                            height = iHeightFactor * Math.abs(oDataArray.data[iCounter]);
                            iYcord = iZeroAxis - height;
                            if (oDataArray.data[iCounter] < 0) {
                                iYcord = iYcord + 2 * height;
                            }
                            if (oDataArray.data[iCounter] !== null || oLinePlotOptions.nullValues !== 'ignore') {
                                if (bPathMoveFlag) {
                                    if (bStepLine) {
                                        oPathAttr.d += ' H ' + xVal + ' V ' + iYcord;
                                    } else {
                                        oPathAttr.d += ' L ' + xVal + ',' + iYcord;
                                    }
                                } else {
                                    oPathAttr.d = 'M ' + xVal + ',' + iYcord;
                                    bPathMoveFlag = true;
                                }
                            }
                            //draw markers
                            if (bShowMarker) {
                                oMarkerEle = MAQ.createMarker(oLinePlotOptions, {
                                    x: xVal,
                                    y: iYcord,
                                    fill: oLinePlotOptions.color[iSeriesCounter],
                                    stroke: oLinePlotOptions.color[iSeriesCounter]
                                }, chartConfigOptions.svgNS);
                                oGrpLineMarkers.appendChild(oMarkerEle);
                                if (!(oDataArray.data[iCounter] !== null || oLinePlotOptions.nullValues !== 'ignore')) {
                                    MAQ.addAttr(oMarkerEle, 'display', 'none');
                                }
                                oParam = {
                                    seriesIndex: iSeriesCounter,
                                    isPosavail: true,
                                    position: iCounter,
                                    config: chartConfigOptions
                                };
                                if (chartConfigOptions.tooltip.enabled) {
                                    oParam.toolTip = chartConfigOptions.tooltipDiv;
                                    MAQ.addEventListener(oMarkerEle, 'mouseover', showToolTip, oParam);
                                    MAQ.addEventListener(oMarkerEle, 'mouseout', hideToolTip, oParam);
                                }
                                if (chartConfigOptions.onClick.enabled) {
                                    MAQ.addEventListener(oMarkerEle, 'click', clickEventListener, oParam);
                                }
                            }
                            //draw static tooltips
                            if (bStaticTooltip) {
                                oTooltipEle = MAQ.createStaticTooltips(chartConfigOptions, iCounter, {
                                    x: iXcord,
                                    y: iYcord,
                                    fill: oLinePlotOptions.color[iSeriesCounter],
                                    stroke: oLinePlotOptions.color[iSeriesCounter]
                                }, chartConfigOptions.svgNS);
                                oGrpStaticTooltips.appendChild(oTooltipEle);
                                if (!(oDataArray.data[iCounter] !== null || oLinePlotOptions.nullValues !== 'ignore')) {
                                    MAQ.addAttr(oTooltipEle, 'display', 'none');
                                }
                            }
                            oXcord[iCounter] = iXcord + chartConfigOptions.availX;
                            oYcord[iCounter] = iYcord + chartConfigOptions.availY;
                            chartConfigOptions.availXLift = chartConfigOptions.availX;
                            chartConfigOptions.availYLift = chartConfigOptions.availY;
                            iXcord += chartConfigOptions.plotIntervalWidth;
                        }
                    }
                    oDataArray.xPos = oXcord.slice(0);
                    oDataArray.yPos = oYcord.slice(0);
                    MAQ.addAttr(oPath, 'd', oPathAttr.d);
                    oParam = {
                        seriesIndex: iSeriesCounter,
                        isPosavail: false,
                        config: chartConfigOptions
                    };
                    if (chartConfigOptions.tooltip.enabled) {
                        oParam.toolTip = chartConfigOptions.tooltipDiv;
                        MAQ.addEventListener(oPath, 'mousemove', showToolTip, oParam);
                        MAQ.addEventListener(oPath, 'mouseout', hideToolTip, oParam);
                    }
                    if (chartConfigOptions.onClick.enabled) {
                        MAQ.addEventListener(oPath, 'click', clickEventListener, oParam);
                    }
                }
                //add the markers and static tooltips at the end so they are visible on top of overlapping lines
                for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                    oGrpELE.appendChild(oMarker.markers[iSeriesCounter]);
                    oGrpELE.appendChild(oTooltips.tooltips[iSeriesCounter]);
                }
                if (chartConfigOptions.animation.enabled) {
                    MAQ.animateClipElement(clipPathID + 'Rect', animationConfigurations.propertyToAnimate, animationConfigurations.targetValue, 1000);
                }
            }
        };
        /*
        MAQ.createLiftChart: Renders lift chart
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.createLiftChart = function (chartConfigOptions) {
            'use strict';
            chartConfigOptions.availHeight -= 20;
            chartConfigOptions.availWidth -= 20;
            chartConfigOptions.isLiftChart = true;
            chartConfigOptions.chart.type = 'line';
            var originalWidth = chartConfigOptions.availWidth;
            MAQ.createLineChart(chartConfigOptions);
            chartConfigOptions.availWidth = originalWidth - chartConfigOptions.availX - chartConfigOptions.chart.margin[1];
            chartConfigOptions.chart.type = 'lift';
            var oSVGELE = chartConfigOptions.svgELE;
            chartConfigOptions.originalSVGELE = oSVGELE;
            /* ------------------------ NAVIGATOR AREA START ------------------------- */
            var oGrpNavigatorAttr = {
                class: 'MAQCharts-TimeLineNavigator'
            },
                oGrpNavigator = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oGrpNavigatorAttr);
            chartConfigOptions.svgELE.appendChild(oGrpNavigator);
            var fNavigatorX = chartConfigOptions.availX,
                fNavigatorY = chartConfigOptions.availY,
                fNavigatorWidth = chartConfigOptions.availWidth,
                fNavigatorHeight = chartConfigOptions.availHeight,
                oGrpRangeSelectorAttr = {
                    class: 'MAQCharts-RangeSelector',
                    transform: 'translate(' + fNavigatorX + ',' + fNavigatorY + ')'
                },
                oGrpRangeSelector = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oGrpRangeSelectorAttr);
            if (fNavigatorWidth < 0 || fNavigatorHeight < 0) {
                return;
            }
            if (isOverlapped) {
                fNavigatorWidth = totalWindowWidth - 30;
            }
            oGrpNavigator.appendChild(oGrpRangeSelector);
            fNavigatorX = 0;
            fNavigatorY = 0;
            var oRectAttr = {
                x: 0,
                y: fNavigatorY,
                width: .10 * Math.max(document.documentElement.clientWidth, window.innerWidth),
                height: fNavigatorHeight,
                'pointer-events': 'visibleFill',
                cursor: 'move',
                fill: chartConfigOptions.plotOptions.lift.dragWindowFill,
                opacity: chartConfigOptions.plotOptions.lift.dragWindowOpacity
            };
            // Relative positioning for X Axis
            var XManger = 0;
            // Relative positioning for width
            var widthManger = 0;
            var x2 = 0, intersectionPoints;
            if (window.redrawMarker == true) {
                if (window.blobWidth == undefined || window.blolOldWidth == undefined) {
                    oRectAttr.width = .10 * Math.max(document.documentElement.clientWidth, window.innerWidth);
                } else {
                    widthManger = (window.blobWidth * Math.max(document.documentElement.clientWidth, window.innerWidth));
                    oRectAttr.width = widthManger / window.blolOldWidth;
                }
                if (window.blolblolXValue == undefined || window.blolXValue == undefined) {
                    if (window.previousX == undefined) {
                        oRectAttr.x = 0;
                    }
                    else {
                        widthManger = (window.previousX * Math.max(document.documentElement.clientWidth, window.innerWidth));
                        oRectAttr.x = widthManger / window.blolOldWidth;
                    }
                } else {
                    if (window.previousX == undefined) {
                        oRectAttr.x = 0;
                    }
                    else {
                        widthManger = (window.previousX * Math.max(document.documentElement.clientWidth, window.innerWidth));
                        oRectAttr.x = widthManger / window.blolOldWidth;
                    }
                }
            }
            if (!isOverlapped) {
                if (oRectAttr.x + oRectAttr.width >= chartConfigOptions.availWidth) {
                    oRectAttr.x = chartConfigOptions.availWidth - oRectAttr.width;
                }
            }
            else {
                if (oRectAttr.x + oRectAttr.width >= Math.max(document.documentElement.clientWidth, window.innerWidth)) {
                    oRectAttr.x = Math.max(document.documentElement.clientWidth, window.innerWidth) - oRectAttr.width;
                }
            }

            window.blolOldWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
            window.previousX = oRectAttr.x;
            window.blobWidth = oRectAttr.width;
            var oLineLeftAttr = {
                x1: oRectAttr.x,
                y1: oRectAttr.y,
                x2: oRectAttr.x,
                y2: oRectAttr.height,
                'pointer-events': 'all',
                stroke: chartConfigOptions.plotOptions.lift.dragLineColor,
                'stroke-width': chartConfigOptions.plotOptions.lift.dragLineWidth
            };
            var oLineRightAttr = {
                x1: oRectAttr.x + oRectAttr.width,
                y1: oRectAttr.y,
                x2: oRectAttr.x + oRectAttr.width,
                y2: oRectAttr.height,
                'pointer-events': 'all',
                stroke: chartConfigOptions.plotOptions.lift.dragLineColor,
                'stroke-width': chartConfigOptions.plotOptions.lift.dragLineWidth
            };
            var oLineTopAttr = {
                x1: oRectAttr.x,
                y1: oRectAttr.height,
                x2: oRectAttr.x + oRectAttr.width,
                y2: oRectAttr.height,
                stroke: 'black',
                'stroke-width': 4,
                'stroke-dasharray': chartConfigOptions.plotOptions.lift.dragLineStyle
            };
            var oLineBottomAttr = {
                x1: oRectAttr.x,
                y1: oRectAttr.y,
                x2: oRectAttr.x + oRectAttr.width,
                y2: oRectAttr.y,
                stroke: 'black',
                'stroke-width': 4,
                'stroke-dasharray': chartConfigOptions.plotOptions.lift.dragLineStyle
            };

            var oExpandedLeftAttr = {
                r: 10,
                fill: chartConfigOptions.plotOptions.lift.dragCircleFill,
                cursor: 'e-resize'
            };
            oExpandedLeftAttr.cx = oRectAttr.x;
            oExpandedLeftAttr.cy = fNavigatorY - oExpandedLeftAttr.r;
            var oExpandedLeftBottomAttr = {
                r: 10,
                fill: chartConfigOptions.plotOptions.lift.dragCircleFill,
                cursor: 'e-resize'
            };
            oExpandedLeftBottomAttr.cx = oRectAttr.x;
            oExpandedLeftBottomAttr.cy = fNavigatorY + oRectAttr.height + oExpandedLeftBottomAttr.r;
            var oExpandedRightAttr = {
                r: 10,
                fill: chartConfigOptions.plotOptions.lift.dragCircleFill,
                cursor: 'e-resize'
            };
            oExpandedRightAttr.cx = oRectAttr.x + oRectAttr.width;
            oExpandedRightAttr.cy = fNavigatorY - oExpandedRightAttr.r;
            var oExpandedRightBottomAttr = {
                r: 10,
                fill: chartConfigOptions.plotOptions.lift.dragCircleFill,
                cursor: 'e-resize'
            };
            oExpandedRightBottomAttr.cx = oRectAttr.x + oRectAttr.width;
            oExpandedRightBottomAttr.cy = fNavigatorY + oRectAttr.height + oExpandedRightBottomAttr.r;
            var oGizmoArrow = [],
                iCounter;
            for (iCounter = 0; iCounter < 4; iCounter += 1) {
                oGizmoArrow[iCounter] = {};
                oGizmoArrow[iCounter].fill = 'white';
                oGizmoArrow[iCounter]['pointer-events'] = 'none';
                switch (iCounter) {
                    case 0:
                        oGizmoArrow[iCounter].d = MAQ.getTriangleCoords(oExpandedLeftAttr.cx, oExpandedLeftAttr.cy, oExpandedLeftAttr.r);
                        break;
                    case 1:
                        oGizmoArrow[iCounter].d = MAQ.getTriangleCoords(oExpandedLeftBottomAttr.cx, oExpandedLeftBottomAttr.cy, oExpandedLeftBottomAttr.r);
                        break;
                    case 2:
                        oGizmoArrow[iCounter].d = MAQ.getTriangleCoords(oExpandedRightAttr.cx, oExpandedRightAttr.cy, -oExpandedRightAttr.r);
                        break;
                    case 3:
                        oGizmoArrow[iCounter].d = MAQ.getTriangleCoords(oExpandedRightBottomAttr.cx, oExpandedRightBottomAttr.cy, -oExpandedRightBottomAttr.r);
                        break;
                }
            }
            var oDimmerAttr = {
                d: '',
                fill: chartConfigOptions.plotOptions.lift.dragAreaFill,
                stroke: chartConfigOptions.plotOptions.lift.dragAreaFill,
                opacity: chartConfigOptions.plotOptions.lift.dragAreaOpacity
            };
            oDimmerAttr.d = ' M ' + fNavigatorX + ',' + (fNavigatorHeight + fNavigatorY) + ' L ' + fNavigatorX + ',' + fNavigatorY + ' L ' + oRectAttr.x + ',' + oRectAttr.y + ' L ' + oRectAttr.x + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + oRectAttr.y + ' L ' + (fNavigatorX + fNavigatorWidth) + ',' + oRectAttr.y + ' L ' + (fNavigatorX + fNavigatorWidth) + ',' + (fNavigatorHeight + fNavigatorY) + ' Z';
            if (isOverlapped) {
                oDimmerAttr.d = ' M ' + fNavigatorX + ',' + (fNavigatorHeight + fNavigatorY) + ' L ' + fNavigatorX + ',' + fNavigatorY + ' L ' + oRectAttr.x + ',' + oRectAttr.y + ' L ' + oRectAttr.x + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + oRectAttr.y + ' L ' + (totalWindowWidth + 20) + ',' + oRectAttr.y + ' L ' + (totalWindowWidth + 30) + ',' + (fNavigatorHeight + fNavigatorY) + ' Z';
            }
            var oRect = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oRectAttr),
                oLeftLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineLeftAttr),
                oRightLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineRightAttr),
                oTopLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineTopAttr),
                oBottomLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineBottomAttr),
                oExpanderLeft = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oExpandedLeftAttr),
                oExpanderRight = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oExpandedRightAttr),
                oExpanderLeftBottom = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oExpandedLeftBottomAttr),
                oExpanderRightBottom = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oExpandedRightBottomAttr),
                oLeftTopTri = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oGizmoArrow[0]),
                oLeftBottomTri = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oGizmoArrow[1]),
                oRightTopTri = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oGizmoArrow[2]),
                oRightBottomTri = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oGizmoArrow[3]),
                oDimmerPath = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oDimmerAttr);
            oGrpRangeSelector.appendChild(oDimmerPath);
            oGrpRangeSelector.appendChild(oRect);
            oGrpRangeSelector.appendChild(oLeftLine);
            oGrpRangeSelector.appendChild(oRightLine);
            oGrpRangeSelector.appendChild(oTopLine);
            oGrpRangeSelector.appendChild(oBottomLine);
            oGrpRangeSelector.appendChild(oExpanderLeft);
            oGrpRangeSelector.appendChild(oExpanderRight);
            oGrpRangeSelector.appendChild(oExpanderLeftBottom);
            oGrpRangeSelector.appendChild(oExpanderRightBottom);
            oGrpRangeSelector.appendChild(oLeftTopTri);
            oGrpRangeSelector.appendChild(oLeftBottomTri);
            oGrpRangeSelector.appendChild(oRightTopTri);
            oGrpRangeSelector.appendChild(oRightBottomTri);
            MAQ.addAttr(oExpanderLeft, 'desc', 'left');
            MAQ.addAttr(oExpanderRight, 'desc', 'right');
            MAQ.addAttr(oExpanderLeftBottom, 'desc', 'left');
            MAQ.addAttr(oExpanderRightBottom, 'desc', 'right');
            /*INTERSECTION CIRCLES START*/
            var oIntersectionPointsAttr = MAQ.getIntersectionPoints(chartConfigOptions, oRectAttr.x + oRectAttr.width),
                oIntersectionMarkersAttr = [],
                oIntersectionCircles = [],
                oCircleTextsAttr = [],
                oCircleTexts = [];
            for (iCounter = 0; iCounter < chartConfigOptions.series.length; iCounter += 1) {
                oIntersectionMarkersAttr[iCounter] = {
                    r: chartConfigOptions.plotOptions.lift.intersectionMarker.radius,
                    'stroke-width': chartConfigOptions.plotOptions.lift.intersectionMarker.strokeWidth,
                    stroke: chartConfigOptions.plotOptions.lift.intersectionMarker.strokeColor,
                    cx: oIntersectionPointsAttr.circleX[iCounter],
                    cy: oIntersectionPointsAttr.circleY[iCounter],
                    fill: chartConfigOptions.plotOptions.line.color[iCounter % chartConfigOptions.plotOptions.line.color.length]
                };
                oCircleTextsAttr[iCounter] = {
                    x: oIntersectionPointsAttr.circleX[iCounter],
                    y: oIntersectionPointsAttr.circleY[iCounter],
                    dx: chartConfigOptions.plotOptions.lift.intersectionMarker.dx,
                    dy: chartConfigOptions.plotOptions.lift.intersectionMarker.dy,
                    text: oIntersectionPointsAttr.values[iCounter],
                    style: chartConfigOptions.plotOptions.lift.intersectionMarker.fontStyle,
                    'text-anchor': 'middle'
                };
                if (isNaN(oIntersectionPointsAttr.circleX[iCounter]) || isNaN(oIntersectionPointsAttr.circleY[iCounter])) {
                    continue;
                }
                if (isNaN(oCircleTextsAttr[iCounter].text)) {
                    oCircleTextsAttr[iCounter].text = '-';
                }
                else {
                    oCircleTextsAttr[iCounter].text += '%';
                }
                if (!isNaN(oIntersectionPointsAttr.circleX[iCounter]) && !isNaN(oIntersectionPointsAttr.circleY[iCounter])) {
                    oIntersectionCircles[iCounter] = MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oIntersectionMarkersAttr[iCounter]);
                    oCircleTexts[iCounter] = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oCircleTextsAttr[iCounter]);
                    oGrpRangeSelector.appendChild(oIntersectionCircles[iCounter]);
                    oGrpRangeSelector.appendChild(oCircleTexts[iCounter]);
                    var oToolTip = chartConfigOptions.tooltipDiv;
                    var oParam1 = {
                        seriesIndex: iCounter,
                        position: iCounter,
                        config: chartConfigOptions,
                        value: oCircleTextsAttr[iCounter].text
                    };
                    var oCircleElement = oIntersectionCircles[iCounter];
                    var oTextElement = oCircleTexts[iCounter];
                    MAQ.addEventListener(oCircleElement, 'mouseover', showToolTip, oParam1);
                    MAQ.addEventListener(oTextElement, 'mouseover', showToolTip, oParam1);
                    oTextElement.setAttribute("fill", oCircleElement.getAttribute("fill"));
                    MAQ.addEventListener(oCircleElement, 'mouseleave', hideToolTip, oToolTip);
                    MAQ.addEventListener(oTextElement, 'mouseleave', hideToolTip, oToolTip);
                }
            }
            /*INTERSECTION CIRCLES END*/
            var oParam = {
                x: fNavigatorX,
                y: fNavigatorY,
                width: fNavigatorWidth,
                height: fNavigatorHeight,
                navigator: oRect,
                dimmer: oDimmerPath,
                intersectionCircles: oIntersectionCircles,
                circleTexts: oCircleTexts,
                lineLeft: oLeftLine,
                lineRight: oRightLine,
                lineTop: oTopLine,
                lineBottom: oBottomLine,
                leftTopTri: oLeftTopTri,
                leftBottomTri: oLeftBottomTri,
                rightTopTri: oRightTopTri,
                rightBottomTri: oRightBottomTri,
                expanderLeft: oExpanderLeft,
                expanderRight: oExpanderRight,
                expanderLeftBottom: oExpanderLeftBottom,
                expanderRightBottom: oExpanderRightBottom,
                expanderWidth: oExpandedRightAttr.r,
                panel: oGrpRangeSelector,
                config: chartConfigOptions,
                maxX: fNavigatorX + fNavigatorWidth
            };
            //mouse down events
            MAQ.addEventListener(oRect, 'mousedown', navigatorMouseDown, oParam);
            MAQ.addEventListener(oExpanderLeft, 'mousedown', stretcherMouseDown, oParam);
            MAQ.addEventListener(oExpanderLeftBottom, 'mousedown', stretcherMouseDown, oParam);
            MAQ.addEventListener(oExpanderRight, 'mousedown', stretcherMouseDown, oParam);
            MAQ.addEventListener(oExpanderRightBottom, 'mousedown', stretcherMouseDown, oParam);
            //mouse up event
            MAQ.addEventListener(oGrpNavigator, 'mouseup', stretcherMouseUp, oParam);
            MAQ.addEventListener(oGrpNavigator, 'mouseup', navigatorMouseUp, oParam);
            MAQ.addEventListener(oGrpNavigator, 'mouseout', navigatorMouseUp, oParam);
            /* ------------------------ NAVIGATOR AREA END ------------------------- */
        };
        /*
        MAQ.getAnimationConfigurations: Fetch the configuration for animation
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
        function createTextTagForControl(sNS, sClass, sStyle, fX, fY, sDrillUrl, sValue) {
            'use strict';
            var oTextAttr = {
                x: fX,
                y: fY,
                text: sValue,
                class: sClass,
                style: sStyle
            };
            if (sDrillUrl) {
                oTextAttr.drillurl = sDrillUrl;
            }
            return MAQ.createSVGElement(sNS, 'text', oTextAttr);
        }
        function createPathTagForControl(sNS, sStroke, sStrokeDashArray, sDValue, sStyle) {
            'use strict';
            var oPathAttr = {
                style: sStyle,
                'stroke-dasharray': sStrokeDashArray,
                stroke: sStroke,
                d: sDValue
            };
            return MAQ.createSVGElement(sNS, 'path', oPathAttr);
        }
        function createRectTagForControl(sNS, sStyle, fX, fY, fWidth, fHeight, sClass) {
            'use strict';
            var oRectAttr = {
                x: fX,
                y: fY,
                width: fWidth,
                height: fHeight,
                style: sStyle,
                class: sClass
            };
            return MAQ.createSVGElement(sNS, 'rect', oRectAttr);
        }
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
            var fPt1 = oSVGCord.x - fInterval,
                fPt2 = oSVGCord.x + fInterval,
                oFilterData = oCalCord.filter(function (x) {
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
            var i = 0,
                L, sum = 0;
            for (L = array.length; i < L; i += 1) {
                sum += array[i];
            }
            return sum;
        };
        /* Time-Line functions*/
        var bNavigatorDrag = false,
            bExpanderDrag = false,
            movingSource = '',
            sSelectedExpander = '',
            iCurrentNavigatorX;
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
                    var oIntersectionPointsAttr = MAQ.getIntersectionPoints(oParam.config, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value),
                        iCounter;
                    for (iCounter = 0; iCounter < oParam.config.series.length; iCounter += 1) {
                        if (isSeriesEnabled(oParam.config.series, iCounter)) {
                            oParam.intersectionCircles[iCounter].cx.baseVal.value = oIntersectionPointsAttr.circleX[iCounter];
                            window.x2 = oParam.intersectionCircles[iCounter].cx.baseVal.value;
                            if (isNaN(oIntersectionPointsAttr.circleY[iCounter])) {
                                continue;
                            }
                            oParam.intersectionCircles[iCounter].cy.baseVal.value = oIntersectionPointsAttr.circleY[iCounter];
                            MAQ.addAttr(oParam.circleTexts[iCounter], 'x', oIntersectionPointsAttr.circleX[iCounter]);
                            MAQ.addAttr(oParam.circleTexts[iCounter], 'y', oIntersectionPointsAttr.circleY[iCounter]);
                            if (isNaN(oIntersectionPointsAttr.values[iCounter])) {
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'text', '-');
                                oParam.circleTexts[iCounter].innerHTML = '-'; /*for chrome*/
                                oParam.circleTexts[iCounter].textContent = '-'; /*for IE*/
                            }
                            else {
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'text', oIntersectionPointsAttr.values[iCounter] + '%');
                                oParam.circleTexts[iCounter].innerHTML = oIntersectionPointsAttr.values[iCounter] + '%'; /*for chrome*/
                                oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%'; /*for IE*/
                            }
                        }
                    }
                    var xQuery = document.querySelector(".MAQCharts-RangeSelector").querySelector('rect').x.animVal.value;
                    var widthQuery = document.querySelector(".MAQCharts-RangeSelector").querySelector('rect').width.animVal.value;
                    window.previousX = xQuery;
                    window.oldWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
                    window.blolOldWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
                    window.variantWidth = document.querySelector(".MAQCharts-RangeSelector").querySelector('rect').width.animVal.value;
                    window.backer = document.documentElement.clientWidth;
                    var oRectAttr = {
                        x: oCurrentElement.x.baseVal.value, //white
                        y: oCurrentElement.y.baseVal.value,
                        width: oCurrentElement.width.baseVal.value,
                        height: oCurrentElement.height.baseVal.value
                    };
                    if (isOverlapped) {
                        oParam.width = totalWindowWidth - 20;
                    }
                    window.blobWidth = oRectAttr.width;
                    var sDattr = ' M ' + oParam.x + ',' + (oParam.height + oParam.y) + ' L ' + oParam.x + ',' + oParam.y + ' L ' + oRectAttr.x + ',' + oRectAttr.y + ' L ' + oRectAttr.x + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + (oRectAttr.y + oRectAttr.height) + ' L ' + (oRectAttr.x + oRectAttr.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + oRectAttr.y + ' L ' + (oParam.x + oParam.width) + ',' + (oParam.height + oParam.y) + ' Z';
                    MAQ.addAttr(oParam.dimmer, 'd', sDattr);
                    iCurrentNavigatorX = event.clientX;
                }
            }
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart,
                fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
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
            var rangeStart = oParam.config.plotOptions.timeline.rangeStart,
                fNavigatorShiftRatio = oParam.config.plotOptions.timeline.shiftRatio;
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
                        var oIntersectionPointsAttr = MAQ.getIntersectionPoints(oParam.config, oParam.navigator.x.baseVal.value + oParam.navigator.width.baseVal.value),
                            iCounter;
                        for (iCounter = 0; iCounter < oParam.config.series.length; iCounter += 1) {
                            if (isSeriesEnabled(oParam.config.series, iCounter)) {
                                if (isNaN(oIntersectionPointsAttr.circleX[iCounter]) || isNaN(oIntersectionPointsAttr.circleX[iCounter])) {
                                    continue;
                                }
                                oParam.intersectionCircles[iCounter].cx.baseVal.value = oIntersectionPointsAttr.circleX[iCounter];
                                oParam.intersectionCircles[iCounter].cy.baseVal.value = oIntersectionPointsAttr.circleY[iCounter];
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'x', oIntersectionPointsAttr.circleX[iCounter]);
                                MAQ.addAttr(oParam.circleTexts[iCounter], 'y', oIntersectionPointsAttr.circleY[iCounter]);
                                if (isNaN(oIntersectionPointsAttr.values[iCounter])) {
                                    MAQ.addAttr(oParam.circleTexts[iCounter], 'text', '-');
                                    oParam.circleTexts[iCounter].innerHTML = '-'; /*for chrome*/
                                    oParam.circleTexts[iCounter].textContent = '-'; /*for IE*/
                                }
                                else {
                                    MAQ.addAttr(oParam.circleTexts[iCounter], 'text', oIntersectionPointsAttr.values[iCounter] + '%');
                                    oParam.circleTexts[iCounter].innerHTML = oIntersectionPointsAttr.values[iCounter] + '%'; /*for chrome*/
                                    oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%'; /*for IE*/
                                }
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
            window.blobWidth = oRectAttr.width;
            window.blolXValue = oCurrentElement.x.baseVal.value;
            window.blolOldWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
            window.blolblolXValue = document.querySelector(".MAQCharts-RangeSelector").querySelector('rect').width.animVal.value;
            var xQuery = document.querySelector(".MAQCharts-RangeSelector").querySelector('rect').x.animVal.value;
            window.previousX = xQuery;

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
        function expandFullNavigator(chartConfigOptions) {
            'use strict';
            var oNavigatorWindow = document.getElementById('MAQCharts-NavWindow-' + chartConfigOptions.chart.renderTo);
            var oExpanderLeft = document.getElementById('MAQCharts-ExpanderLeft-' + chartConfigOptions.chart.renderTo);
            var oExpanderRight = document.getElementById('MAQCharts-ExpanderRight-' + chartConfigOptions.chart.renderTo);
            var oTriLeft = document.getElementById('MAQCharts-ClipLeft-' + chartConfigOptions.chart.renderTo);
            var oTriRight = document.getElementById('MAQCharts-ClipRight-' + chartConfigOptions.chart.renderTo);
            var oDimmer = document.getElementById('MAQCharts-Dimmer-' + chartConfigOptions.chart.renderTo);
            oNavigatorWindow.x.baseVal.value = 0;
            oNavigatorWindow.width.baseVal.value = chartConfigOptions.fNavigatorWidth;
            oExpanderLeft.x.baseVal.value = -oExpanderLeft.width.baseVal.value;
            oExpanderRight.x.baseVal.value = oNavigatorWindow.width.baseVal.value;
            MAQ.addAttr(oTriLeft, 'd', MAQ.getTriangleCoords(oExpanderLeft.x.baseVal.value + oExpanderLeft.width.baseVal.value, oExpanderLeft.height.baseVal.value / 2, -Math.min(20, chartConfigOptions.fNavigatorHeight)));
            MAQ.addAttr(oTriRight, 'd', MAQ.getTriangleCoords(oExpanderRight.x.baseVal.value, oExpanderRight.height.baseVal.value / 2, Math.min(20, chartConfigOptions.fNavigatorHeight)));
            var sDattr = ' M ' + 0 + ',' + 0 + ' L ' + 0 + ',' + 0 + ' Z';
            MAQ.addAttr(oDimmer, 'd', sDattr);
        }
        /*
        MAQ.getSeriesValidation: Validate waterfall chart data series
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.getSeriesValidation = function (chartConfigOptions) {
            'use strict';
            var oChartSeries = [],
                jCount = 0,
                boolDataCheck = false,
                oChartPlotOptions = chartConfigOptions.plotOptions[chartConfigOptions.chart.type];
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
            var oChartSeries = [],
                jCount = 0;
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
            var jCount = 0,
                oMinMax = null;
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
        function dynamicSort(property, flag) {
            'use strict';
            if (flag) {
                return function (a, b) {
                    return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
                };
            } else {
                return function (a, b) {
                    return b[property] < a[property] ? -1 : b[property] > a[property] ? 1 : 0;
                };
            }
        }
        function getContainerRelativeCord(e) {
            'use strict';
            var posx = 0;
            var posy = 0;
            if (!e) {
                e = window.event;
            }
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            return {
                x: posx,
                y: posy
            };
        }
        MAQ.calculateAspectRatio = function (chartConfigOptions, iDimensionX, iDimensionY, iSum, iLastIndex) {
            'use strict';
            var iDataCounter = 0,
                oDataArray = chartConfigOptions.series.child,
                sFieldName = chartConfigOptions.plotOptions.treemap.fieldName,
                iCurrentDimensionX = iDimensionX,
                iIndividualHeight = 0,
                oLayout = chartConfigOptions.plotOptions.treemap.currentLayout;
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
            var iCounter = 0,
                oContainerDiv = chartConfigOptions.container,
                oTreemapOptions = chartConfigOptions.plotOptions.treemap,
                oPrevLayout = oTreemapOptions.prevLayout,
                oData = chartConfigOptions.series.child;
            var leftDiv = document.createElement('div'),
                div, oParam, fParentHeight, titleDiv, width;
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
            var iPrevAspectRatio = 0,
                iLoopCounter = 0,
                iSum = 0,
                iCurrAspectRatio = 0,
                oContainerDiv = chartConfigOptions.container,
                oData = chartConfigOptions.series.child,
                sFieldName = chartConfigOptions.plotOptions.treemap.fieldName,
                iCalcDimension = 0;
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
        MAQ.getTriangleCoords = function (cX, cY, r) {
            'use strict';
            var triCoords = {};
            triCoords.x1 = cX;
            triCoords.y1 = cY - r / 1.8;
            triCoords.x2 = cX;
            triCoords.y2 = cY + r / 1.8;
            triCoords.x3 = cX + r / 2;
            triCoords.y3 = cY;
            return 'M' + triCoords.x1 + ' ' + triCoords.y1 + ' L' + triCoords.x2 + ' ' + triCoords.y2 + ' L' + triCoords.x3 + ' ' + triCoords.y3 + ' Z';
        };
        MAQ.getIntersectionPoints = function (config, xPos) {
            'use strict';
            var fIndex = fIndex = xPos / config.plotIntervalWidth;
            if (isOverlapped) {
                fIndex = xPos / (config.plotIntervalWidth + 20);
            }
            if (0 === config.series.length)
                return;
            var xLength = config.series[0].xPos.length;
            for (var iCounter = 1; iCounter < config.series.length; iCounter++) {
                if (xLength < config.series[iCounter].xPos.length) {
                    xLength = config.series[iCounter].xPos.length;
                }
            }
            var iLowerIndex = Math.min(Math.floor(fIndex), xLength - 1),
                iHigerIndex = Math.min(Math.ceil(fIndex), xLength - 1),
                delta = fIndex - iLowerIndex,
                fLineLeftPointX = [],
                fLineRightPointX = [],
                fLineLeftPointY = [],
                fLineRightPointY = [],
                fLineLeftValues = [],
                fLineRightValues = [],
                intersectValue = [],
                iCounter;
            window.lowerIndex = iLowerIndex;
            window.HigerIndex = iHigerIndex;
            for (iCounter = 0; iCounter < config.series.length; iCounter += 1) {
                fLineLeftPointX[iCounter] = config.series[iCounter].xPos[iLowerIndex] - config.availXLift;
                fLineRightPointX[iCounter] = config.series[iCounter].xPos[iHigerIndex] - config.availXLift;
                if (isOverlapped) {
                    fLineLeftPointX[iCounter] = fLineLeftPointX[iCounter] + (20 * iLowerIndex);
                    fLineRightPointX[iCounter] = fLineRightPointX[iCounter] + (20 * iHigerIndex);
                }
                fLineLeftPointY[iCounter] = config.series[iCounter].yPos[iLowerIndex] - config.availYLift;
                fLineRightPointY[iCounter] = config.series[iCounter].yPos[iHigerIndex] - config.availYLift;
                fLineLeftValues[iCounter] = config.series[iCounter].data[iLowerIndex];
                fLineRightValues[iCounter] = config.series[iCounter].data[iHigerIndex];
                intersectValue[iCounter] = fLineLeftValues[iCounter] + (fLineRightValues[iCounter] - fLineLeftValues[iCounter]) * delta;
                intersectValue[iCounter] = intersectValue[iCounter].toFixed(1);
            }
            var circleX = [];
            var circleY = [],
                slope;
            for (iCounter = 0; iCounter < config.series.length; iCounter += 1) {
                circleX[iCounter] = xPos;
                slope = (fLineRightPointY[iCounter] - fLineLeftPointY[iCounter]) / (fLineRightPointX[iCounter] - fLineLeftPointX[iCounter]);
                if (isNaN(slope)) {
                    slope = 0;
                }
                circleY[iCounter] = slope * (xPos - fLineLeftPointX[iCounter]) + fLineLeftPointY[iCounter];
            }
            return {
                circleX: circleX,
                circleY: circleY,
                values: intersectValue,
                lowerIndex: iLowerIndex,
                higherIndex: iHigerIndex
            };
        };
        MAQ.CreatePattern = function (chartConfigOptions, iID) {
            'use strict';
            var sPatID = '';
            if (undefined !== chartConfigOptions.plotOptions.pattern[iID] && '' !== chartConfigOptions.plotOptions.pattern[iID]) {
                var sPattern = chartConfigOptions.plotOptions.pattern[iID].toUpperCase();
                if ('#' === sPattern[0] || 0 === sPattern.indexOf('RGB') || 0 === sPattern.indexOf('RGBA')) {
                    sPattern = 'COLOR';
                }
                sPatID = chartConfigOptions.chart.renderTo + 'Pat' + sPattern;
                var ele = document.getElementById(sPatID),
                    oDefsELE, oPatternAttr, oPatELE, oCircleAttr, oLineAttr;
                if (null !== ele) {
                    return sPatID;
                }
                switch (sPattern) {
                    case 'COLOR':
                        sPatID = sPattern;
                        break;
                    case 'DOTS':
                        oDefsELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'defs');
                        oPatternAttr = {
                            id: sPatID,
                            x: 0,
                            y: 0,
                            width: 4,
                            height: 4,
                            patternUnits: 'userSpaceOnUse'
                        };
                        oPatELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'pattern', oPatternAttr);
                        oCircleAttr = {
                            cx: 2,
                            cy: 2,
                            r: 1,
                            fill: '#7DBBDB'
                        };
                        oPatELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'circle', oCircleAttr));
                        oDefsELE.appendChild(oPatELE);
                        chartConfigOptions.svgELE.appendChild(oDefsELE);
                        break;
                    case 'HBARS':
                        oDefsELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'defs');
                        oPatternAttr = {
                            id: sPatID,
                            x: 0,
                            y: 0,
                            width: 4,
                            height: 4,
                            patternUnits: 'userSpaceOnUse'
                        };
                        oPatELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'pattern', oPatternAttr);
                        oLineAttr = {
                            x1: 0,
                            y1: 0,
                            x2: 100,
                            y2: 0,
                            'stroke-width': 4,
                            stroke: '#5e9cd2'
                        };
                        oPatELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineAttr));
                        oLineAttr.stroke = 'white';
                        oLineAttr.y2 = oLineAttr.y1 + oLineAttr['stroke-width'];
                        oLineAttr.y1 += oLineAttr['stroke-width'];
                        oLineAttr['stroke-width'] = 4;
                        oPatELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineAttr));
                        oDefsELE.appendChild(oPatELE);
                        chartConfigOptions.svgELE.appendChild(oDefsELE);
                        break;
                    default:
                        sPatID = '';
                        break;
                }
            }
            return sPatID;
        };
        MAQ.createMarker = function (oPlotOptions, oAttrs, svgNS) {
            'use strict';
            var oMarker = oPlotOptions.marker;
            var oShape, sShape = oMarker.shape[(oMarker.markers.length - 1) % oMarker.shape.length],
                oMarkerAttr = {};
            switch (sShape.toLowerCase()) {
                case 'diamond':
                    sShape = 'rect';
                    oMarkerAttr = {
                        x: oAttrs.x - oMarker.width / 2,
                        y: oAttrs.y - oMarker.width / 2,
                        width: oMarker.width,
                        height: oMarker.width,
                        transform: 'rotate(45,' + oAttrs.x + ',' + oAttrs.y + ')'
                    };
                    break;
                case 'square':
                    sShape = 'rect';
                    oMarkerAttr = {
                        x: oAttrs.x - oMarker.width / 2,
                        y: oAttrs.y - oMarker.width / 2,
                        width: oMarker.width,
                        height: oMarker.width
                    };
                    break;
                case 'tridown':
                    sShape = 'path';
                    oMarkerAttr = {
                        d: MAQ.getTriangleCoords(oAttrs.x, oAttrs.y, oMarker.width),
                        transform: 'rotate(90,' + oAttrs.x + ',' + oAttrs.y + ')'
                    };
                    break;
                case 'triup':
                    sShape = 'path';
                    oMarkerAttr = {
                        d: MAQ.getTriangleCoords(oAttrs.x, oAttrs.y, oMarker.width),
                        transform: 'rotate(-90,' + oAttrs.x + ',' + oAttrs.y + ')'
                    };
                    break;
                default:
                    sShape = 'circle';
                    oMarkerAttr = {
                        cx: oAttrs.x,
                        cy: oAttrs.y,
                        r: oMarker.width / 2
                    };
            }
            oMarkerAttr.fill = oMarker.fillColor;
            oMarkerAttr.stroke = oMarker.lineColor;
            oMarkerAttr['stroke-width'] = oMarker.lineWidth;
            oMarkerAttr['pointer-events'] = 'all';
            oMarkerAttr.style = oMarker.style;
            oMarkerAttr['z-index'] = 10;
            if (!oMarker.lineColor) {
                oMarkerAttr.stroke = oAttrs.fill;
            }
            if (!oMarker.fillColor) {
                oMarkerAttr.fill = oAttrs.stroke;
            }
            oShape = MAQ.createSVGElement(svgNS, sShape, oMarkerAttr);
            return oShape;
        };
        MAQ.createStaticTooltips = function (oConfig, iSelectedIndex, oAttrs, svgNS) {
            'use strict';
            var iSeriesIndex = oConfig.tooltip.tooltips.length - 1;
            var oSeries = oConfig.series[iSeriesIndex];
            var sLabel = oConfig.series.label[iSelectedIndex];
            var oTooltip = MAQ.createSVGElement(oConfig.svgNS, 'g');
            var oRectAttr = {
                width: '50',
                height: '30',
                x: oAttrs.x,
                y: oAttrs.y,
                stroke: oAttrs.stroke,
                fill: 'white',
                'stroke-width': 2
            };
            var oTextAttr = {
                text: sLabel + ': ' + (Math.round(oSeries.data[iSelectedIndex] * 100) / 100 || 0),
                style: {
                    'font-size': oConfig.tooltip.style['font-size'],
                    'font-family': oConfig.tooltip.style['font-family']
                }
            };
            var oDim = MAQ.utils.getTextDim(oTextAttr.text, oTextAttr.style, oConfig);
            oRectAttr.width = oDim.width + 6;
            oRectAttr.height = oDim.height + 4;
            oTextAttr.x = oAttrs.x + 3;
            oTextAttr.y = oAttrs.y + oDim.height - 1;
            oTooltip.appendChild(MAQ.createSVGElement(oConfig.svgNS, 'rect', oRectAttr));
            oTooltip.appendChild(MAQ.createSVGElement(oConfig.svgNS, 'text', oTextAttr));
            return oTooltip;
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
                var obj;
                if(circleCoordsStart &&circleCoordsEnd) {
                    obj = {
                        values: circleCoordsEnd.values,
                        range: [
                            circleCoordsStart.higherIndex,
                            circleCoordsEnd.higherIndex
                        ]
                    }
                };
                config.plotOptions.lift.onDisplayAreaChange(obj);
            }
        }
        MAQ.charts(liftConfig);
        if (isOverlapped) {
            $('#liftVisual.visual').css('height', '100%');
            $('#liftVisual.visual').css('overflow-x', 'auto');
            $('#liftVisual.visual').css('overflow-y', 'hidden');
            $('#liftVisual.visual > svg').css('border', '0px solid silver');
            $('#liftVisual.visual > svg').css('width', totalWindowWidth + 30 + 'px');
        }
    })(liftConfig);
}