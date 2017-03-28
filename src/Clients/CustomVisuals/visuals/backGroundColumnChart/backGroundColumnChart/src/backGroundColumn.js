/*JSHint Count = 0*/
function myMAQlibrary(dWagon, modeling, liftFormatters, valueFormatter) {
    var consumeData = dWagon;
    var backGroundConfig = {
        "chart": {
            "renderTo": "chartmultibarDiv",
            "isResponsive": true,
            "type": "column",
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
            "column": {
                "padding": 5,
                "groupPadding": 2,
                "stacked": false,
                "multiColored": true,
                "hover": {
                    "enabled": true,
                    "style": {
                        "opacity": 0.6
                    }
                },
                "color": [],
                "opacity": 0.8,
                "borderColor": "",
                "borderRadius": 0,
                "borderWidth": 1,
                "borderDashStyle": "",
                "valueBox": {
                    "enabled": liftFormatters.yAxisDataLabelEnable,
                    "position": "top",
                    "formatter": null,
                    "marginBottom": 3,
                    "style": {
                        "fill": liftFormatters.yAXisDataLabelsColor,
                        "fontSize": 14,
                        "fontFamily": "Segoe UI"
                    }
                }
            }
        },
        "legend": {
            "enabled": liftFormatters.legendValues,
            "enableClick": false,
            "align": "left",
            "verticalAlign": "top",
            "verticalAlignLegend": false,
            "borderColor": "silver",
            "borderStyle": "",
            "borderWidth": 0,
            "borderRadius": 2,
            "layout": "horizontal",
            "floating": false,
            "symbolWidth": 12,
            "symbolPadding": 3,
            "symbolRadius": 10,
            "individualDistance": 10,
            "lineHeight": 5,
            "style": {
                "fill": "#000",
                "fontSize": "12px",
                "fontFamily": "Segoe UI"
            },
            "enableTextClipping": false,
            "clipTextFrom": "left",
            "clippedTextLength": 10,
            "y": 10,
            "x": 20
        },
        "xAxis": {
            "title": {
                "align": "center",
                "text": "",
                "style": {
                    "fill": "#0066CC",
                    "fontSize": "16px",
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": -5
            },
            "labels": {
                "enabled": liftFormatters.xAxisEnableLabels,
                "align": "center",
                "series": [
                    {
                        "name": [],
                        "enabled": []               /* TODO : To check for click events on legend */
                    }
                ],
                "formatter": null,
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "#0066CC",
                    "fontSize": 14,
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 8,
            "gridLineWidth": 0,
            "gridLineColor": "silver",
            "gridLineDashStyle": "shortdash",
            "lineColor": "silver",
            "lineWidth": 1,
            "tickWidth": 1,
            "tickHeight": 0,
            "tickColor": "silver",
            "tickPosition": "outside",
            "labelSpacing": 5,
            "shiftStartBy": 10,
            "skipInterval": 0,
            "alternateGridColor": "",
            "usageWidth": 98
        },
        "yAxis": {
            "colors": [liftFormatters.FirstRow, liftFormatters.SecondRow, liftFormatters.ThirdRow, liftFormatters.FourthRow],
            "title": {
                "align": "center",
                "text": "",
                "style": {
                    "fill": "#0066CC",
                    "fontSize": "16px",
                    "fontWeight": "bold",
                    "fontFamily": "Segoe UI"
                },
                "x": -20,
                "y": 0
            },
            "labels": {
                "enabled": liftFormatters.yAxisEnableLabels,
                "align": "right",
                "series": [],
                "formatter": "InsertCommas",
                "staggerLines": false,
                "rotation": 0,
                "style": {
                    "fill": "#0066CC",
                    "fontSize": 14,
                    "fontFamily": "Segoe UI"
                },
                "x": 0,
                "y": 0
            },
            "numberOfGridLines": 4,
            "gridLineWidth": 1,
            "gridLineColor": "silver",
            "gridLineDashStyle": "line",
            "lineWidth": 1,
            "lineColor": "",
            "tickWidth": 0,
            "tickHeight": 5,
            "tickPosition": "onaxis",
            "tickColor": "silver",
            "labelSpacing": 5,
            "shiftStartBy": 10,
            "skipInterval": 0,
            "alternateGridColor": 'green'
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
        "onClick": {
            "enabled": true,
            "clickFunction": "customFunction"
        },
        "animation": {
            "enabled": false,
            "type": 1
        },
        "series": [{
            "name": "",
            "data": [
            ]
        }],
        "formatter": [{
            "xAxis": null,
            "yAxis": null
        }]
    };

    if (!dWagon || !dWagon.tree || !dWagon.tree.root || !dWagon.tree.root.children || (dWagon.tree.root.children.length === 0)) {
        d3.select('#chartmultibarDiv').attr({ "style": null });
        d3.select('#chartmultibarDiv').append('svg').attr({ "width": window.frames.innerWidth, "height": window.frames.innerHeight })
        d3.select('svg').append('text').attr({ "x": window.frames.innerWidth / 2, "y": window.frames.innerHeight / 2, "font-size": "20px", "text-anchor": "middle" }).text("No data to display");
        return;
    }


    for (var j = 0; j < dWagon.categorical.categories[0].values.length; j++) {
        if (!dWagon.tree.root.children[j] || !dWagon.tree.root.children[j].name) {
            d3.select('#chartmultibarDiv').attr({ "style": null });
            d3.select('#chartmultibarDiv').append('svg').attr({ "width": window.frames.innerWidth, "height": window.frames.innerHeight })
            d3.select('svg').append('text').attr({ "x": window.frames.innerWidth / 2, "y": window.frames.innerHeight / 2, "font-size": "20px", "text-anchor": "middle" }).text("No data to display");
            return;
        }
        backGroundConfig.xAxis.labels.series[0].name[j] = dWagon.tree.root.children[j].name;
        backGroundConfig.xAxis.labels.series[0].enabled[j] = true;                  /* TODO : For legend click events */
        if (!(typeof (dWagon.tree.root.children[j].value) === "string" || typeof (dWagon.tree.root.children[j].value) === "object")) {
            backGroundConfig.series[0].data[j] = dWagon.tree.root.children[j].value;
        }
        else {
            d3.select('#chartmultibarDiv').attr({ "style": null });
            d3.select('#chartmultibarDiv').append('svg').attr({ "width": window.frames.innerWidth, "height": window.frames.innerHeight })
            d3.select('svg').append('text').attr({ "x": window.frames.innerWidth / 2, "y": window.frames.innerHeight / 2, "font-size": "20px", "text-anchor": "middle" }).text("No data to display");
            return;

        }

    }

    if (dWagon.metadata.columns && dWagon.metadata.columns.length === 2) {
        if (dWagon.metadata.columns[0].roles["category"]) {
            backGroundConfig.formatter[0].xAxis = valueFormatter.create({ format: dWagon.metadata.columns[0].format });
            backGroundConfig.formatter[0].yAxis = valueFormatter.create({ format: dWagon.metadata.columns[1].format });
            backGroundConfig.series[0].name = dWagon.metadata.columns[1].displayName;
        }
        else {
            backGroundConfig.formatter[0].xAxis = valueFormatter.create({ format: dWagon.metadata.columns[1].format });
            backGroundConfig.formatter[0].yAxis = valueFormatter.create({ format: dWagon.metadata.columns[0].format });
            backGroundConfig.series[0].name = dWagon.metadata.columns[0].displayName;
        }
    }

    for (i = 0; i < modeling.dataPoints.length; i++) {
        backGroundConfig.plotOptions.column.color.push(modeling.dataPoints[i].color);
    }


    (function mike(backGroundConfig) {
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
                            style: {
                                opacity: 0.8
                            }
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
                    "colors": ["#000", "#000", "#000", "#000"],
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
                        case 'column':
                            MAQ.createColumnChart(this.chartOptions);
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
            switch (chartConfigOptions.chart.type.toLowerCase()) {
                case 'column':
                case 'stock':
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


        /* TODO : For legend click events . Would return true always if legend click event is disabled  */
        function isClicked(oSeries, iSeriesIndex) {
            'use strict';
            if (oSeries && oSeries[iSeriesIndex]) {
                return true;
            }
            return false;
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
            if (oParam.config.xAxis.labels.series[0].enabled[oParam.seriesIndex]) {
                oParam.config.xAxis.labels.series[0].enabled[oParam.seriesIndex] = false;
            } else if (0 !== oParam.config.xAxis.labels.series[0].name) {
                oParam.config.xAxis.labels.series[0].enabled[oParam.seriesIndex] = true;
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
            /*
                  Added code segemnt to fix chart shift issue (on click of legends)
              */
            oParam.config.availX = 0;
            oParam.config.availY = 0;
            MAQ.drawChartTitle(oParam.config);
            switch (oParam.config.chart.type.toLowerCase()) {
                case 'column':
                    MAQ.createColumnChart(oParam.config);
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
                        default:
                            oToolTip.innerHTML = '<b>' + oSeries.name + '</b><br/>' + backGroundConfig.formatter[0].xAxis.format(oLabels[iSelectedIndex]) + ': ' + backGroundConfig.formatter[0].yAxis.format(oSeries.data[iSelectedIndex]);
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

            var topScroll = $('#chartmultibarDiv').scrollTop();
            var fTopCordinate = oCord.y + topScroll - oToolTip.clientHeight - 5;
            if (fTopCordinate <= 10) {
                fTopCordinate = oCord.y + 10;
            }
            var leftScroll = $('#chartmultibarDiv').scrollLeft();
            var fLeftCordinate = oCord.x + leftScroll - oToolTip.clientWidth - 10;
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
                    var iNumSymbols = chartConfigOptions.xAxis.labels.series[0].name.length,
                        iNoOfLegendLines = 1,
                        iPadding = 4,
                        oDim, iSeriesLen = chartConfigOptions.xAxis.labels.series[0].name.length,
                        oAttr = {
                            class: 'MAQCharts-legend'
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
                            obj.innerText = chartConfigOptions.xAxis.labels.series[0].name[iSCounter];
                            document.body.appendChild(obj);
                            if (obj.clientWidth > imaxWidth) {
                                imaxWidth = obj.clientWidth;
                            }
                            //Delete the temporary HTML element used to calculate width
                            document.body.removeChild(obj);
                        }
                    }
                    for (iSCounter = 0; iSCounter < iNumSymbols; iSCounter += 1) {
                        if (!isClicked(chartConfigOptions.xAxis.labels.series[0].enabled, customOrder[iSCounter])) {                       /* TODO  : For Legend Click :    Would always result in else if legend click is disabled*/
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
                        oTextAttr.text = backGroundConfig.formatter[0].xAxis.format(chartConfigOptions.xAxis.labels.series[0].name[iSCounter]);
                        /* Code for clipping the text to specified number of characters */
                        sTempText = oTextAttr.text;
                        bAttachTooltip = true;
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
                        MAQ.getObjectDimension(oRectELE)
                        oDim = MAQ.getObjectDimension(oTextELE);
                        //verticalAlignLegend property is set to true.
                        //Changing width to a const imaxWidth
                        if (oLegend.verticalAlignLegend) {
                            oTextELE.style.width = imaxWidth;
                        }
                        if (oLegend.layout === 'horizontal') {
                            // if verticalAlignLegend property is set to true
                            //Changing width to a const imaxWidth
                            if (oLegend.verticalAlignLegend && oSymbolAttr.x + imaxWidth > chartConfigOptions.availWidth - 30 || oSymbolAttr.x + oDim.width > chartConfigOptions.availWidth - 30) {
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
                        if (chartConfigOptions.legend.hover.enabled && !oLegend.enabled) {
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
                if (bFlag) {
                    if (sBigData.length == 0) {
                        sBigData = backGroundConfig.xAxis.labels.series[0].name[0];
                    }
                    sBigData = backGroundConfig.formatter[0].xAxis.format(sBigData);
                }
                else {
                    if (sBigData.length == 0) {
                        sBigData = backGroundConfig.series[0].data[0];
                    }
                    sBigData = backGroundConfig.formatter[0].yAxis.format(sBigData);
                }
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
                xAxisSeries = xAxisLabel.series[0].name,
                yAxisSeries = yAxisLabel.series,
                xAxisSeriesLength = 0,
                yAxisSeriesLength = 0,
                yAxisLimit = 0;
            var oAttr = {
                class: 'MAQCharts-chartArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
            };
            var oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null,
                oNormalizedData, iStart, iInterval, oTimelineData, temp, oGridAreaGrpELE, iNumberOfGridLines, oGrpYAxis, oGrpYAxisLblNTick, oAttrYAxis, oYAxisLine, intervalHeight, oAttrTick;
            //Funnel Chart variables
            var fTotalInterval, oSeries = chartConfigOptions.series,
                fdelta, fConnectorHeight, fFunnelGap, fTubeHeight;
            /* Compute Space for X-Axis Labels */
            if (sChartType === 'bar') {
                xAxisSeries = yAxisSeries.slice(0);
                if (iglobalCounter === 0) {
                    ioriginalyAxisLength = chartConfigOptions.yAxis.labels.series.length;
                    ioriginalxAxisLength = chartConfigOptions.xAxis.labels.series.length;
                    iglobalCounter += 1;
                }
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
            /* Compute Space for Y-Axis Labels */
            iLength = yAxis.numberOfGridLines;
            oNormalizedData = chartConfigOptions.plotOptions[sChartType].normalizedData;

            if ('funnel' !== sChartType) {
                iStart = oNormalizedData.min;
                iInterval = oNormalizedData.interval;
                for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                    yAxisSeries[iCounter] = iStart;
                    iStart += iInterval;
                    iStart = Math.round(iStart * 100) / 100;
                }
            } else {
                for (iCounter = 0; iCounter < chartConfigOptions.series.length; iCounter += 1) {
                    yAxisSeries[iCounter] = chartConfigOptions.series[iCounter].name;
                }
            }
            xAxisSeriesLength = xAxisSeries.length;
            if (chartConfigOptions.useFullXAxis.indexOf(sChartType) > -1) {
                xAxisSeriesLength -= 1;
            }
            yAxisSeriesLength = iLength;
            if (sChartType === 'bar') {
                temp = [];
                temp = xAxisSeries.slice();
                xAxisSeries = yAxisSeries.slice(0);
                yAxisSeries = temp.slice(0);
                chartConfigOptions.yAxis.labels.series = yAxisSeries;
                //iNumberOfGridLines = yAxis.numberOfGridLines;
                //yAxis.numberOfGridLines = iNumberOfGridLines;
                xAxisSeries = xAxisSeries.slice(0, iNumberOfGridLines + 1);
                xAxisSeriesLength = xAxisSeries.length;
                if (chartConfigOptions.plotOptions.bar.pushBlankSeries) {
                    yAxisSeriesLength = yAxisSeries.length;
                    yAxisSeries.push('');
                } else {
                    yAxisSeriesLength = yAxisSeries.length > 0 ? yAxisSeries.length - 1 : 0;
                }
                yAxisSeries.reverse();
                yAxisLimit = 1;
                xAxis.shiftStartBy = 0;
                xAxisSeriesLength -= 1;
            }
            oDataInfo = MAQ.getMinMax(xAxisSeries, '', '');
            sBigData = oDataInfo.max;
            bottomSpacing = MAQ.getAxisSpacing(chartConfigOptions, xAxis, sBigData, true);
            oDataInfo = MAQ.getMinMax(yAxisSeries, '', '');
            sBigData = oDataInfo.max;
            leftSpacing = MAQ.getAxisSpacing(chartConfigOptions, yAxis, sBigData, false);
            leftSpacing = leftSpacing > 60 ? 60 : leftSpacing;
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
            if ('funnel' === sChartType) {
                fTotalInterval = chartConfigOptions.availHeight / oSeries.length;
                fdelta = fTotalInterval * 0.2 / (oSeries.length - 1);
                fConnectorHeight = fdelta + fTotalInterval * 0.2;
                //funnelGap = 0.2% of TotalInterval + portion of the extra funnelGap as gaps are 1 less than length
                fFunnelGap = fTotalInterval * 0.05 * oSeries.length / (oSeries.length - 1);
                fdelta += fTotalInterval * 0.05 / (oSeries.length - 1);
                fTubeHeight = (chartConfigOptions.availHeight - fConnectorHeight * (oSeries.length - 1)) / oSeries.length - 2 * fFunnelGap;
                oAttrGridLine['stroke-width'] = fTubeHeight + 2 * fFunnelGap;
                var tempValue = oAttrGridLine.y1 + fTubeHeight / 2 + 2 * fFunnelGap;
                oAttrGridLine.y = tempValue;
                oAttrGridLine.y1 = tempValue;
                oAttrGridLine.y2 = tempValue;
                oAttrTick.y1 = tempValue;
                oAttrLabel.y = tempValue;
                oAttrTick.y2 = tempValue;
            }
            //vNext
            for (iCounter = yAxisSeriesLength; yAxisLimit <= iCounter; iCounter -= 1) {
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    if (sGridType === 'rect') {
                        if (iCounter > 0) {
                            if (iCounter == 1) {
                                oAttrGridLine.fill = chartConfigOptions.yAxis.colors[0];
                                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                                oGridAreaGrpELE.appendChild(oGridLine);
                            }
                            if (iCounter == 2) {
                                oAttrGridLine.fill = chartConfigOptions.yAxis.colors[1];
                                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                                oGridAreaGrpELE.appendChild(oGridLine);
                            }
                            if (iCounter == 3) {
                                oAttrGridLine.fill = chartConfigOptions.yAxis.colors[2];
                                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                                oGridAreaGrpELE.appendChild(oGridLine);
                            }
                            if (iCounter == 4) {
                                oAttrGridLine.fill = chartConfigOptions.yAxis.colors[3];
                                oGridLine = MAQ.createSVGElement(chartConfigOptions.svgNS, sGridType, oAttrGridLine);
                                oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                                oGridAreaGrpELE.appendChild(oGridLine);
                            }
                        }
                    } else {
                        oGridAreaGrpELE.appendChild(oGridLine);
                    }
                    oGrpYAxisLblNTick.appendChild(oTick);
                    if (yAxisLabel.enabled) {
                        oAttrLabel.text = yAxisSeries[iCounter];
                        oAttrLabel.text = backGroundConfig.formatter[0].yAxis.format(oAttrLabel.text);
                        var sTempText = oAttrLabel.text;
                        if (oAttrLabel.text.length > 5) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, 5) + "...";
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
                if ('funnel' === sChartType) {
                    oAttrTick.y2 += fTubeHeight + 2 * fFunnelGap + fConnectorHeight;
                } else {
                    oAttrTick.y2 += intervalHeight;
                }
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
            intervalWidth = intervalWidth < 25 ? 25 : intervalWidth;
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
                    if (xAxisLabel.enabled) {
                        iPrevX = oAttrLabel.x;
                        oAttrLabel.text = xAxisSeries[iCounter];
                        //  oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                        oAttrLabel.text = backGroundConfig.formatter[0].xAxis.format(oAttrLabel.text);
                        /* Code for clipping the text to specified number of characters */
                        sTempText = oAttrLabel.text;
                        if (!xAxisLabel.formatter && sTempText.length > iNumOfCharsAllowed) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 1)) + '...';
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
            var iCounter = 0,
                iLength = 0,
                bottomSpacing = 0,
                leftSpacing = 0,
                sChartType = chartConfigOptions.chart.type,
                xAxis = chartConfigOptions.xAxis,
                yAxis = chartConfigOptions.yAxis.dualyAxis,
                xAxisLabel = xAxis.labels,
                yAxisLabel = yAxis.axisLeft.labels,
                xAxisSeries = xAxisLabel.series,
                yAxisSeries = yAxisLabel.series,
                xAxisSeriesLength = 0,
                yAxisSeriesLength = 0,
                yAxisLimit = 0,
                sStr = '',
                oAttr = {
                    class: 'MAQCharts-chartArea',
                    transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')'
                },
                oChartContainerGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oChartContainerGroup);
            var oDataInfo = null;
            /* Compute Space for X-Axis Labels */
            if (sChartType === 'bar') {
                xAxisSeries = yAxisSeries.slice(0);
            }
            /*Condition change*/
            if (xAxisSeries.length <= 0) {
                iLength = chartConfigOptions.series[0].data.length;
                for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                    xAxisSeries[iCounter] = iCounter + 1;
                }
            }
            /* Compute Space for Y-Axis Labels */
            iLength = yAxis.numberOfGridLines;
            var oNormalizedData1 = chartConfigOptions.plotOptions[sChartType].normalizedData[1];
            if (iLength !== (oNormalizedData1.max - oNormalizedData1.min) / oNormalizedData1.interval) {
                iLength += 1;
            }
            var iStart = oNormalizedData1.min,
                iInterval = oNormalizedData1.interval,
                yAxisSeries1 = [];
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                yAxisSeries1[iCounter] = iStart;
                iStart += iInterval;
            }
            oDataInfo = MAQ.getMinMax(yAxisSeries1, '', '');
            var rightSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisRight, oDataInfo.max, false);
            //chartConfigOptions.availWidth = chartConfigOptions.availWidth - rightSpacing;
            /* Compute Space for Y-Axis Labels */
            var oNormalizedData = chartConfigOptions.plotOptions[sChartType].normalizedData[0];
            iStart = oNormalizedData.min;
            iInterval = oNormalizedData.interval;
            for (iCounter = 0; iCounter <= iLength; iCounter += 1) {
                yAxisSeries[iCounter] = iStart;
                iStart += iInterval;
            }
            xAxisSeriesLength = xAxisSeries.length;
            yAxisSeriesLength = iLength;
            oDataInfo = MAQ.getMinMax(xAxisSeries, '', '');
            bottomSpacing = MAQ.getAxisSpacing(chartConfigOptions, xAxis, oDataInfo.max, true);
            oDataInfo = MAQ.getMinMax(yAxisSeries, '', '');
            leftSpacing = MAQ.getAxisSpacing(chartConfigOptions, chartConfigOptions.yAxis.dualyAxis.axisLeft, oDataInfo.max, false);
            /* Plot Y-Axis, Y-Axis-Ticks, Y-Axis-GridLines and Y-Axis-Labels */
            oAttr = {
                class: 'MAQCharts-yAxis-gridArea'
            };
            var oGridAreaGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oAttr = {
                class: 'MAQCharts-yAxis'
            };
            var oGrpYAxis = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            oChartContainerGroup.appendChild(oGrpYAxis);
            oAttr = {
                class: 'MAQCharts-yAxis-Grid-Labels-Ticks'
            };
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
                    oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                    oGrpYAxisLblNTick.appendChild(oLabel);
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
                    oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrLabel);
                    oGrpYAxisLblNTick.appendChild(oLabel);
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
                class: 'MAQCharts-inner-xAxis-Grid-Labels-Ticks'
            };
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
            var intervalWidth = (oAttrXAxis.x2 + leftSpacing) / iLength;
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
            var iNumOfCharsAllowed = Math.ceil(chartConfigOptions.plotIntervalWidth / oDimAxis.width);
            var bSkipPlot = false;
            if (xAxis.skipInterval < 0) {
                xAxis.skipInterval = 0;
            }
            var iSkipInterval = xAxis.skipInterval,
                sTempText = '',
                iPadding = chartConfigOptions.plotOptions.combolinecolumn.column.padding,
                iGrpPadding = chartConfigOptions.plotOptions.combolinecolumn.column.groupPadding,
                iInnerSeriesLen, bSetTooltip, oParam, oDim, oToolTip, jCount;
            for (iCounter = 0; iCounter < xAxisSeries.length; iCounter += 1) {
                if (bSkipPlot) {
                    iSkipInterval -= 1;
                } else {
                    iInnerSeriesLen = 0;
                    bSetTooltip = false;
                    jCount = 0;
                    if (chartConfigOptions.plotOptions.combolinecolumn.column.multiStacked) {
                        iInnerSeriesLen = xAxisLabel.innerSeries.length;
                        for (jCount = 0; jCount < iInnerSeriesLen; jCount += 1) {
                            oTick = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oAttrTick);
                            oGrpInnerXAxisLblNTick.appendChild(oTick);
                            bSetTooltip = false;
                            oAttrInnerLabel.text = xAxisLabel.innerSeries[jCount];
                            oAttrInnerLabel.text = MAQ.applyFormatter(oAttrInnerLabel.text, xAxisLabel.formatter);
                            /* Code for clipping the text to specified number of characters */
                            sTempText = oAttrInnerLabel.text;
                            if (!xAxisLabel.formatter && !xAxisLabel.staggerLines && sTempText.length > iNumOfCharsAllowed) {
                                oAttrInnerLabel.text = oAttrInnerLabel.text.substring(0, iNumOfCharsAllowed) + '...';
                                bSetTooltip = true;
                            }
                            if (xAxisLabel.innerRotation) {
                                oAttrInnerLabel.transform = 'rotate(' + xAxisLabel.innerRotation + ' ' + oAttrInnerLabel.x + ',' + oAttrInnerLabel.y + ')';
                            }
                            oLabel = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrInnerLabel);
                            oGrpInnerXAxisLblNTick.appendChild(oLabel);
                            oDim = MAQ.getObjectDimension(oLabel);
                            MAQ.addAttr(oLabel, 'y', oAttrInnerLabel.y + oDim.height / 2);
                            if (xAxisLabel.staggerLines && !xAxisLabel.innerRotation) {
                                if (jCount % 2 !== 0) {
                                    MAQ.addAttr(oLabel, 'y', oAttrInnerLabel.y + oDim.height * 2);
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
                            oAttrTick.x1 += (intervalWidth - iPadding + iGrpPadding) / iInnerSeriesLen;
                            oAttrInnerLabel.x = oAttrTick.x1;
                            oAttrTick.x2 = oAttrTick.x1;
                        }
                        bSkipPlot = true;
                        oAttrTick.x1 += iPadding - iGrpPadding;
                        oAttrInnerLabel.x = oAttrTick.x1;
                        oAttrTick.x2 = oAttrTick.x1;
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
                    }
                    if (xAxisLabel.enabled) {
                        bSetTooltip = false;
                        oAttrLabel.text = xAxisSeries[iCounter];
                        oAttrLabel.text = MAQ.applyFormatter(oAttrLabel.text, xAxisLabel.formatter);
                        /* Code for clipping the text to specified number of characters */
                        sTempText = oAttrLabel.text;
                        if (!xAxisLabel.formatter && !xAxisLabel.staggerLines && sTempText.length > iNumOfCharsAllowed) {
                            oAttrLabel.text = oAttrLabel.text.substring(0, iNumOfCharsAllowed) + '...';
                            bSetTooltip = true;
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
                if (!chartConfigOptions.plotOptions.combolinecolumn.column.multiStacked) {
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
        /*
        MAQ.createColumnChart: Renders column chart
        @param {chartConfigOptions} user configuration parameters
        */
        MAQ.createColumnChart = function (chartConfigOptions) {
            'use strict';

            d3.select('#container').style({ "overflow-y": "hidden", "overflow-x": "hidden" })
            var iMinRerquiredWidth = backGroundConfig.xAxis.labels.series[0].name.length * 27;

            if (iMinRerquiredWidth > chartConfigOptions.availWidth) {
                chartConfigOptions.availWidth = iMinRerquiredWidth;
                chartConfigOptions.availHeight = chartConfigOptions.availHeight - chartConfigOptions.availHeight / 10;
                d3.select('.MAQChartsSvgRoot').style({ "width": chartConfigOptions.availWidth + 'px' });
                d3.select('#chartmultibarDiv').style("overflow-x", "auto");
            }


            if (chartConfigOptions.availHeight < 170 && chartConfigOptions.availWidth < 340) {
                chartConfigOptions.availHeight = 170;
                chartConfigOptions.availWidth = 340;
                d3.select('.MAQChartsSvgRoot').style({ "height": chartConfigOptions.availHeight + 'px', "width": chartConfigOptions.availWidth + 'px' })
                d3.select('#chartmultibarDiv').style({ "overflow-y": "auto", "overflow-x": "auto" })
            }
            else if (chartConfigOptions.availWidth < 340) {
                chartConfigOptions.availWidth = 340;
                chartConfigOptions.availHeight = chartConfigOptions.availHeight - chartConfigOptions.availHeight / 10;
                d3.select('.MAQChartsSvgRoot').style("width", chartConfigOptions.availWidth + 'px');
                d3.select('#chartmultibarDiv').style("overflow-x", "auto");
            }
            else if (chartConfigOptions.availHeight < 170) {
                chartConfigOptions.availHeight = 170;
                d3.select('.MAQChartsSvgRoot').style("height", chartConfigOptions.availHeight + 'px');
                d3.select('#chartmultibarDiv').style("overflow-y", "auto");
            }
            d3.select('.MAQChartsSvgRoot').attr("viewBox", "0 0 " + chartConfigOptions.availWidth + " " + chartConfigOptions.availHeight);


            MAQ.drawLegend(chartConfigOptions);
            MAQ.drawXAxisTitle(chartConfigOptions);
            MAQ.drawYAxisTitle(chartConfigOptions);
            MAQ.applyMargin(chartConfigOptions, chartConfigOptions.chart.margin);

            var oDataInfo = {
                min: 0,
                max: 1
            },

                oColumnPlotOptions = chartConfigOptions.plotOptions.column,
                oSeries = chartConfigOptions.series;
            oSeries.label = chartConfigOptions.xAxis.labels.series[0].name;
            var oValueClicked = chartConfigOptions.xAxis.labels.series[0].enabled;
            var iSeriesCounter = 0;
            var iSeriesLength = oSeries.length;
            var iCounter = 0;
            var iLength = oSeries[0].data.length;
            var oGrpELE, oNYCord, oYCord;

            if (false === oColumnPlotOptions.stacked) {
                for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                    if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                        oDataInfo = MAQ.getMinMax(oSeries[iSeriesCounter].data, oDataInfo.min, oDataInfo.max);
                    }
                }
            } else {
                var oMin = oSeries[0].data.map(function (x) {
                    return x - x;
                });
                var oMax = oMin.slice(0);
                oYCord = oMin.slice(0);
                oNYCord = oMin.slice(0);
                var bSeriesEnable = false,
                    i, j, iCount;
                for (i = 0; i < iLength; i += 1) {
                    for (j = 0; j < iSeriesLength; j += 1) {
                        if (isSeriesEnabled(oSeries, j)) {
                            if (oSeries[j].data[i] < 0) {
                                oMin[i] += oSeries[j].data[i];
                            }
                            if (oSeries[j].data[i] >= 0) {
                                oMax[i] += oSeries[j].data[i];
                            }
                            bSeriesEnable = true;
                        }
                    }
                }
                if (bSeriesEnable) {
                    var oConcatArr = oMax.concat(oMin);
                    oDataInfo.min = Math.min.apply(null, oConcatArr);
                    oDataInfo.max = Math.max.apply(null, oConcatArr);
                    oDataInfo.total = 0;
                    for (iCount = 0; iCount < oConcatArr.length; iCount += 1) {
                        oDataInfo.total += oConcatArr[iCount];
                    }
                }
            }
            var animationConfigurations = getAnimationConfigurations(chartConfigOptions);
            if (chartConfigOptions.animation.enabled) {
                var oClipAttr = {
                    id: chartConfigOptions.chart.renderTo + 'clippath'
                };
                oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'clipPath', oClipAttr);
                var oClipRectAttr = {
                    id: chartConfigOptions.chart.renderTo + 'clippathRect',
                    x: animationConfigurations.x,
                    y: animationConfigurations.y,
                    width: animationConfigurations.width,
                    height: animationConfigurations.height
                };
                oGrpELE.appendChild(MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oClipRectAttr));
                chartConfigOptions.svgELE.appendChild(oGrpELE);
            }
            var oNormalizedData;
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

                while (4 !== (oNormalizedData.max - oNormalizedData.min) / oNormalizedData.interval) {
                    oNormalizedData = MAQ.getNormalized_Min_Max_Interval(oNormalizedData.min, oNormalizedData.max, chartConfigOptions.yAxis.numberOfGridLines);
                }

                oNormalizedData.sum = oNormalizedData.max + Math.abs(oNormalizedData.min);
                chartConfigOptions.plotOptions.column.normalizedData = oNormalizedData;
                // new fixedwidth
                chartConfigOptions.fixedWidth = chartConfigOptions.plotOptions.column.fixedWidth || false;
                MAQ.drawAxis(chartConfigOptions);
                var oAttr = {
                    class: 'MAQCharts-plotArea',
                    transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                    opacity: 1,
                    'clip-path': 'url(#' + chartConfigOptions.chart.renderTo + 'clippath)'
                };
                oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                chartConfigOptions.svgELE.appendChild(oGrpELE);
                var iHeightFactor = chartConfigOptions.availHeight / (Math.abs(oNormalizedData.min) + oNormalizedData.max);
                var iZeroAxis = oNormalizedData.max / oNormalizedData.sum * chartConfigOptions.availHeight;
                var oBarWidth = chartConfigOptions.plotIntervalWidth - oColumnPlotOptions.padding;
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
                MAQ.addAttr(chartConfigOptions.xLabels, 'transform', 'translate(' + (oBarWidth / 2 + fGrpPadding) + ', 0)');
                if (!oColumnPlotOptions.stacked) {
                    //new fixedwidth
                    oBarWidth = oColumnPlotOptions.fixedWidth || oBarWidth / iSeriesLength;
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
                /*UNTESTED*/
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
                },
                    oGrpColumnChart, oDataArray, iXcord, iYcord, oRectangle, isDrillBar, height, sColor, oRect, oLineAttr, oDrillLine, oToolTip, oParam, oValueBox, sPatID;
                oColumnPlotOptions.columns = [];
                for (iSeriesCounter = 0; iSeriesCounter < iSeriesLength; iSeriesCounter += 1) {
                    if (isSeriesEnabled(oSeries, iSeriesCounter)) {
                        oAttr = {
                            class: 'MAQCharts-plotArea-columnChart-' + (iSeriesCounter + 1)
                        };
                        oGrpColumnChart = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
                        oGrpELE.appendChild(oGrpColumnChart);
                        oColumnPlotOptions.columns.push(oGrpColumnChart);
                        oRectAttr.fill = oColumnPlotOptions.color[iSeriesCounter];
                        oDataArray = oSeries[iSeriesCounter];
                        iLength = oDataArray.data.length;
                        iXcord = 0;
                        iYcord = 0;
                        for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                            isDrillBar = false;
                            if (1 === chartConfigOptions.drillActive && iCounter > chartConfigOptions.drillIndex && iCounter <= chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength) {
                                isDrillBar = true;
                            }
                            //add background rect svg
                            /*UNTESTED*/
                            if (oColumnPlotOptions.background.enabled && iSeriesLength - 1 === iSeriesCounter) {
                                oBgRectAttr.x = iXcord;
                                oRectangle = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oBgRectAttr);
                                oGrpColumnChart.appendChild(oRectangle);
                            }
                            /*UNTESTED*/
                            //new drill fixedwidth
                            if (isDrillBar) {
                                oRectAttr.width = oColumnPlotOptions.drillFixedWidth || oBarWidth;
                                oRectAttr.cursor = '';
                            } else {
                                oRectAttr.width = oBarWidth;
                                if (true === chartConfigOptions.plotOptions.column.drill) {
                                    oRectAttr.cursor = 'pointer';
                                }
                            }
                            if (oColumnPlotOptions.similarColor === true) {
                                oRectAttr.fill = oColumnPlotOptions.color[iCounter];
                            }
                            height = iHeightFactor * Math.abs(oDataArray.data[iCounter]);
                            iYcord = iZeroAxis - height;
                            if (oDataArray.data[iCounter] < 0) {
                                iYcord = iZeroAxis;
                            }
                            if (!oColumnPlotOptions.stacked) {
                                oRectAttr.x = iXcord + (oBarWidth + fGrpPadding) * iSeriesCounter;
                                oRectAttr.y = iYcord;
                            } else {
                                oRectAttr.x = iXcord;
                                if (oDataArray.data[iCounter] < 0) {
                                    oRectAttr.y = iYcord + oNYCord[iCounter];
                                    oNYCord[iCounter] += height;
                                } else {
                                    oRectAttr.y = iYcord - oYCord[iCounter];
                                    oYCord[iCounter] += height;
                                }
                            }
                            oRectAttr.height = height;
                            sColor = oColumnPlotOptions.color[iCounter];
                            if (undefined !== chartConfigOptions.plotOptions.pattern[iSeriesCounter] && '' !== chartConfigOptions.plotOptions.pattern[iSeriesCounter]) {
                                sPatID = MAQ.CreatePattern(chartConfigOptions, iSeriesCounter);
                                if ('' !== sPatID) {
                                    sColor = 'url(#' + sPatID + ')';
                                } else {
                                    sColor = 'transparent';
                                }
                            }
                            if (iSeriesLength === 1 && oColumnPlotOptions.multiColored === true) {
                                oRectAttr.fill = sColor;
                            }

                            if (!isClicked(oValueClicked, iCounter)) {      /* TODO : For Legend Click :  Would always result in else if legend click is disabled*/
                                oRectAttr.opacity = 0.3;

                            } else {
                                oRectAttr.opacity = 1;
                            }


                            oRect = MAQ.createSVGElement(chartConfigOptions.svgNS, 'rect', oRectAttr);
                            oGrpColumnChart.appendChild(oRect);
                            if (1 === chartConfigOptions.drillActive && (iCounter === chartConfigOptions.drillIndex + 1 || iCounter === chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength + 1)) {
                                oLineAttr = {
                                    x1: oRectAttr.x - oColumnPlotOptions.padding / 2,
                                    y1: oRectAttr.y + oRectAttr.height,
                                    x2: oRectAttr.x - oColumnPlotOptions.padding / 2,
                                    y2: oRectAttr.y + oRectAttr.height - chartConfigOptions.availHeight,
                                    stroke: chartConfigOptions.plotOptions.column.drillSeparatorColor,
                                    'stroke-dasharray': chartConfigOptions.plotOptions.column.drillSeparatorStyle,
                                    'stroke-width': chartConfigOptions.plotOptions.column.drillSeparatorWidth
                                };
                                oDrillLine = MAQ.createSVGElement(chartConfigOptions.svgNS, 'line', oLineAttr);
                                oGrpColumnChart.appendChild(oDrillLine);
                            }
                            if (oColumnPlotOptions.valueBox.enabled) {
                                oValueBoxAttr.x = oRectAttr.x + oRectAttr.width / 2;
                                if (oColumnPlotOptions.valueBox.position === 'middle') {
                                    oValueBoxAttr.y = oRectAttr.y + oRectAttr.height / 2;
                                } else {
                                    if (oRectAttr.y < 15) {
                                        oValueBoxAttr.y = 15;
                                    } else if (oDataArray.data[iCounter] < 0) {
                                        if (chartConfigOptions.availHeight - (oRectAttr.y + oRectAttr.height) < 15) {
                                            oValueBoxAttr.y = oRectAttr.y + oRectAttr.height - 5;
                                        } else {
                                            oValueBoxAttr.y = oRectAttr.y + oRectAttr.height + 15;
                                        }
                                    } else {
                                        oValueBoxAttr.y = oRectAttr.y - 5;
                                    }
                                }
                                oAttr = {
                                    x: 10,
                                    y: 10,
                                    text: '9',
                                    style: oColumnPlotOptions.valueBox.style
                                };
                                var oText = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttr);
                                chartConfigOptions.svgELE.appendChild(oText);
                                var oDimAxis = MAQ.getObjectDimension(oText);
                                chartConfigOptions.svgELE.removeChild(oText);

                                var iNumOfCharsAllowed = Math.ceil(oBarWidth / oDimAxis.width);
                                oValueBoxAttr.y = oRectAttr.y - oColumnPlotOptions.valueBox.marginBottom;
                                oValueBoxAttr.text = oDataArray.data[iCounter];
                                oValueBoxAttr.text = backGroundConfig.formatter[0].yAxis.format(oValueBoxAttr.text).toString();
                                var sTempText = oValueBoxAttr.text;

                                if (oValueBoxAttr.text.length > iNumOfCharsAllowed) {
                                    oValueBoxAttr.text = oValueBoxAttr.text.substring(0, Math.max(iNumOfCharsAllowed - 3, 1)) + "...";
                                }

                                oValueBox = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oValueBoxAttr);
                                oGrpColumnChart.appendChild(oValueBox);


                                oParam = {
                                    value: sTempText,
                                    config: chartConfigOptions,
                                    type: 'axis'
                                };
                                if (chartConfigOptions.tooltip.enabled) {
                                    oToolTip = chartConfigOptions.tooltipDiv;
                                    MAQ.addEventListener(oValueBox, 'mouseover', showToolTip, oParam);
                                    MAQ.addEventListener(oValueBox, 'mouseout', hideToolTip, oToolTip);
                                }

                            }
                            oParam = {
                                seriesIndex: iSeriesCounter,
                                isPosavail: true,
                                position: iCounter,
                                config: chartConfigOptions
                            };
                            if (chartConfigOptions.tooltip.enabled) {
                                oToolTip = chartConfigOptions.tooltipDiv;
                                MAQ.addEventListener(oRect, 'mousemove', showToolTip, oParam);
                                MAQ.addEventListener(oRect, 'mouseout', hideToolTip, oToolTip);
                            }


                            if (chartConfigOptions.onClick.enabled) {
                                if (undefined === chartConfigOptions.drillActive || 0 === chartConfigOptions.drillActive || 1 === chartConfigOptions.drillActive && (iCounter <= chartConfigOptions.drillIndex || iCounter > chartConfigOptions.drillIndex + chartConfigOptions.drillDataLength)) {
                                    MAQ.addEventListener(oRect, 'click', 'clickEventListener', oParam);
                                }
                            }
                            if (isDrillBar) {
                                iXcord += oColumnPlotOptions.drillFixedWidth && oColumnPlotOptions.drillFixedWidth + oColumnPlotOptions.padding - oColumnPlotOptions.groupPadding || chartConfigOptions.plotIntervalWidth;
                            } else {
                                iXcord += oColumnPlotOptions.fixedWidth && oColumnPlotOptions.fixedWidth + oColumnPlotOptions.padding - oColumnPlotOptions.groupPadding || chartConfigOptions.plotIntervalWidth;
                            }
                        }
                        //add hover styles
                        if (oColumnPlotOptions.hover.enabled) {
                            MAQ.styles.addRule('#' + chartConfigOptions.chart.renderTo + ' .' + oAttr.class + '>rect:hover', MAQ.styles.jsonToRule(oColumnPlotOptions.hover.style));
                        }
                    }
                }
                if (chartConfigOptions.animation.enabled) {
                    MAQ.animateClipElement(chartConfigOptions.chart.renderTo + 'clippathRect', animationConfigurations.propertyToAnimate, animationConfigurations.targetValue, 800);
                }
            } else if (!oDataInfo.min || !oDataInfo.max) {
                //unverified
                if ((chartConfigOptions.yAxis.minVal || 0 === chartConfigOptions.yAxis.minVal) && chartConfigOptions.yAxis.maxVal) {
                    oNormalizedData = {
                        min: chartConfigOptions.yAxis.minVal,
                        max: chartConfigOptions.yAxis.maxVal
                    };
                    oNormalizedData.interval = (oNormalizedData.max - oNormalizedData.min) / chartConfigOptions.yAxis.numberOfGridLines;
                } else {
                    oNormalizedData = MAQ.getNormalized_Min_Max_Interval(oDataInfo.min, oDataInfo.max, chartConfigOptions.yAxis.numberOfGridLines);
                }
                // The below 3 lines are to avoid NaN scenario in the above function
                oNormalizedData.min = 0;
                oNormalizedData.max = chartConfigOptions.yAxis.numberOfGridLines;
                oNormalizedData.interval = 1;
                oNormalizedData.sum = oNormalizedData.max + Math.abs(oNormalizedData.min);
                chartConfigOptions.plotOptions.column.normalizedData = oNormalizedData;
                MAQ.drawAxis(chartConfigOptions);
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
                // console.log(sFunctionName + ' is not a function!');
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
        /*
        clickEventListener: Renders total value in center of both bows
        @param {evt} event
        @param {oParam} user configuration parameters
        */
        function clickEventListener(evt, oParam) {
            'use strict';
            var oConfig = oParam.config;
            var oSVG = oConfig.svgELE;
            var fInterval = oConfig.plotIntervalWidth,
                oSeries = oConfig.series[oParam.seriesIndex],
                oLabels = oConfig.series.label,
                oPoint = oSVG.createSVGPoint();
            oPoint.x = evt.clientX;
            oPoint.y = evt.clientY;
            var oSVGCord = oPoint.matrixTransform(oSVG.getScreenCTM().inverse()),
                iSelectedIndex = 0;
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
        MAQ.charts(backGroundConfig);
    })(backGroundConfig);
}