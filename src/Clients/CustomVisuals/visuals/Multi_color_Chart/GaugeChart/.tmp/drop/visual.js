var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230870;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230870) {
                /**
                 * Singleton reference of ColorPalette.
                 *
                 * @instance
                 */
                var colorManager;
                /**
                 * Factory method for creating a ColorPalette.
                 *
                 * @function
                 * @param {IColorInfo[]} colors - Array of ColorInfo objects that contain
                 *                                hex values for colors.
                 */
                function createColorPalette(colors) {
                    if (!colorManager)
                        colorManager = new ColorPalette(colors);
                    return colorManager;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.createColorPalette = createColorPalette;
                var ColorPalette = (function () {
                    function ColorPalette(colors) {
                        this.colorPalette = {};
                        this.colorIndex = 0;
                        this.colors = colors;
                    }
                    /**
                     * Gets color from colorPalette and returns an IColorInfo
                     *
                     * @function
                     * @param {string} key - Key of assign color in colorPalette.
                     */
                    ColorPalette.prototype.getColor = function (key) {
                        var color = this.colorPalette[key];
                        if (color) {
                            return color;
                        }
                        var colors = this.colors;
                        color = this.colorPalette[key] = colors[this.colorIndex++];
                        if (this.colorIndex >= colors.length) {
                            this.colorIndex = 0;
                        }
                        return color;
                    };
                    /**
                     * resets colorIndex to 0
                     *
                     * @function
                     */
                    ColorPalette.prototype.reset = function () {
                        this.colorIndex = 0;
                        return this;
                    };
                    /**
                     * Clears colorPalette of cached keys and colors
                     *
                     * @function
                     */
                    ColorPalette.prototype.clear = function () {
                        this.colorPalette = {};
                    };
                    return ColorPalette;
                }());
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 * MAQ Charts
 */
/*JSHint Count = 0*/
function MAQDrawChart(DataStyle, settings, nodeData) {
    if (settings.gaugeMinVal < 0) {
        settings.gaugeMinVal = 0;
    }
    if (settings.gaugeTargetHeight < 0) {
        settings.gaugeTargetHeight = 0;
    }
    if (settings.gaugeTargetWidth < 0) {
        settings.gaugeTargetWidth = 0;
    }
    var dataView = DataStyle, configChange = settings, config = {
        "chart": {
            "renderTo": "gaugeChart",
            "isResponsive": true,
            "type": "gauge",
            "margin": [
                -document.documentElement.clientHeight,
                0,
                0,
                0
            ],
            "style": {
                "width": Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + "px",
                "height": Math.max(document.documentElement.clientHeight, window.innerHeight || 0) + "px",
                "border": "0px solid silver",
            },
            "align": "left"
        },
        "title": {
            "align": "left",
            "text": "",
            "x": 25,
            "y": 0,
            "floating": false,
            "style": {
                "fill": "#00749e",
                "fontSize": "12px",
                "fontFamily": "Segoe UI"
            }
        },
        "plotOptions": {
            "gauge": {
                "color": [],
                "opacity": 1,
                "borderColor": "#000",
                "gaugeWidth": 30,
                "gaugeAngle": 180,
                "isAllText": true,
                'isStrokeRequired': false,
                "pointerHeight": parseInt(configChange.gaugeTargetHeight),
                "pointerWidth": configChange.gaugeTargetWidth,
                "borderWidth": 0,
                "borderDashStyle": "",
                "zoneAngle": 0,
                "radius": 120,
                "minValue": configChange.gaugeMinVal,
                "maxValue": configChange.gaugeMaxVal,
                "min": parseInt(configChange.gaugeMinVal),
                "max": 0,
                "pointerValue": [configChange.gaugeTarget],
                "gaugeValues": [],
                "gaugevaluesAngle": [],
                "dataLabels": {
                    "enabled": true,
                    "LabelStyle": {
                        "color": configChange.LabelColor,
                        "fontSize": "12px",
                        "fontFamily": "Segoe UI",
                        "padding": "0px",
                        "background": "#fff"
                    },
                    "ValueStyle": {
                        "color": " #707070",
                        "fontSize": "26px",
                        "fontFamily": "Segoe UI",
                        "padding": "10vmin",
                        "formatter": "",
                        "targetLineColor": "#fff",
                        "pointerColor": configChange.TargetColor,
                    },
                    "ActualValueStyle": {
                        "color": "#333333",
                        "fontSize": "0",
                        "fontFamily": "Segoe UI"
                    }
                }
            }
        },
        "tooltip": {
            "enabled": true,
            "changeBorderColor": false,
            "customTooltip": null,
            "style": {
                "padding": "2px 5px",
                "border": "2px solid silver",
                "backgroundColor": "#fff",
                "color": "#444",
                "font": "18px \"Segoe UI Light\""
            }
        },
        "animation": {
            "enabled": true,
            "type": 1
        },
    };
    var normalizer = settings.gaugeTargetWidth / 100;
    normalizer = normalizer * 70;
    config.plotOptions.gauge.pointerWidth = normalizer;
    var normalizer = settings.gaugeTargetHeight / 100;
    normalizer = normalizer * 50;
    config.plotOptions.gauge.pointerHeight = normalizer;
    var assignData = [0, 1];
    if (dataView.metadata.columns[0].roles.measure) {
        assignData[0] = 1;
        assignData[1] = 0;
    }
    var dataViewObject = Object.getPrototypeOf(dataView);
    var dataObj = {};
    if (!dataViewObject)
        return;
    for (var i = 0; i < dataViewObject.categorical.categories[assignData[0]].values.length; i++) {
        dataObj[dataViewObject.categorical.categories[assignData[0]].values[i]] = dataViewObject.categorical.categories[assignData[1]].values[i];
    }
    for (var dIterator = 0; dIterator < nodeData.dataPoints.length; dIterator++) {
        config.plotOptions.gauge.color.push(nodeData.dataPoints[dIterator].color);
    }
    (function (config) {
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
            }
            else if (oTextAttr.x < -iDeltaX) {
                iSignX = -1;
                iOffsetX = -6;
            }
            else {
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
                    iDecimalPlaces = 0; // Default value is 0
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
                var fTempValue = parseFloat(sInput), sTempValue, aDigits, iTempValue, rPattern, sCurrency, sIntegerDigits, sFractionDigits, decimalLength;
                if (fTempValue < 0) {
                    sInput = -1 * fTempValue;
                }
                else {
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
                }
                else if (iTempValue < 1000000000 && iTempValue >= 1000000) {
                    sIntegerDigits = iTempValue / 1000000;
                    sCurrency = 'M';
                    sFractionDigits = '';
                    sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
                }
                else if (iTempValue < 1000000 && iTempValue >= 1000) {
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
                }
                else {
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
                }
                else {
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
                    }
                    else if (!sClasses) {
                        oEle.setAttribute('class', sClass);
                    }
                    else if (-1 === sClasses.indexOf(sClass)) {
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
                }
                else if (undefined === oElements.length) {
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
                }
                else if (undefined === oElements.length) {
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
                    margin: [0, 0, 0, 0],
                    isResponsive: true,
                    style: {
                        "width": Math.max(document.documentElement.clientWidth, window.innerWidth || 0) + "px",
                        "height": Math.max(document.documentElement.clientHeight, window.innerHeight || 0) + "px",
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
                        color: ["", "silver"
                        ],
                        //zone colors
                        opacity: 1,
                        borderColor: '#000',
                        gaugeWidth: 40,
                        gaugeAngle: 180,
                        // Do not update value.. Functionality yet to be implemented.
                        borderWidth: 0,
                        borderDashStyle: '',
                        zoneAngle: 0,
                        zone2Angle: 0,
                        radius: 120,
                        minValue: 0,
                        maxValue: 400,
                        // outer radius for gauge chart
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
                }
                else if ('waterfall' === this.chartOptions.chart.type) {
                    MAQ.createWaterfallChart(this.chartOptions);
                }
                else if ('brick' === this.chartOptions.chart.type) {
                    MAQ.createBrickChart(this.chartOptions);
                }
                else {
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
                        case 'gauge':
                            MAQ.createGaugeChart(this.chartOptions);
                            break;
                    }
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
            }
            else {
                arrColor = chartConfigOptions.plotOptions[chartConfigOptions.chart.type].color;
            }
            iColorLength = arrColor.length;
            /* Validating the color for Combo Line Column Chart */
            if ('combolinecolumn' === chartConfigOptions.chart.type) {
                tempSeries = chartConfigOptions.series;
                for (iTempSeries = 0; iTempSeries < tempSeries.length; iTempSeries += 1) {
                    if ('line' === tempSeries[iTempSeries].type) {
                        lineCount += 1;
                    }
                    else {
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
                    }
                    else {
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
            }
            else {
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
                case 'gauge':
                    MAQ.validateDirectSeriesColor(chartConfigOptions, false);
                    break;
                default:
                    return 'Not a chart type';
            }
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
                        }
                        else if (oDest[x][attr] instanceof Array) {
                            MAQ.mergeObjects(attr, oDest[x], oSource[x]);
                        }
                        else {
                            if (oDest[x][attr]) {
                                if (Object.keys(oDest[x][attr]).length === 0) {
                                    oDest[x][attr] = oSource[x][attr];
                                }
                            }
                            MAQ.mergeObjects(attr, oDest[x], oSource[x]);
                        }
                    }
                    else {
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
            }
            else if (oMargin.length === 2) {
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
                }
                else if (MAQ.utils.formatters[sFormatterName] && typeof MAQ.utils.formatters[sFormatterName] === 'function') {
                    sText = MAQ.utils.formatters[sFormatterName](sText);
                }
                else if (typeof sFormatterName === 'function') {
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
            }
            else if (0 !== oParam.config.series[oParam.seriesIndex].data) {
                oParam.config.series[oParam.seriesIndex].enabled = true;
            }
            else {
                return; //#62 donut bug fix
            }
            if (oGrpDisplayArea) {
                MAQ.removeAllChildren(oGrpDisplayArea);
            }
            if (true === oParam.config.chart.isResponsive && 'treemap' !== oParam.config.chart.type) {
                oParam.config.availWidth = parseInt(oParam.config.chart.style.width, 10);
                oParam.config.availHeight = parseInt(oParam.config.chart.style.height, 10);
            }
            else {
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
                case 'gauge':
                    MAQ.drawChartTitle(oParam.config);
                    MAQ.createGaugeChart(oParam.config);
                    break;
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
                else {
                    //if this is multi stacked combo line
                    if (undefined !== oParam.rowIndex) {
                        iSelectedIndex = MAQ.getDataIndexPosition(oSVGCord, oSeries.xPos[oParam.rowIndex], fInterval);
                    }
                    else {
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
                        }
                        else {
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
                }
                else {
                    var sChartType = oConfig.chart.type, iLen, i, tempValue;
                    switch (sChartType.toLowerCase()) {
                        case 'gauge':
                            if (iSelectedIndex <= 1) {
                                oToolTip.innerHTML = '<b>' + oConfig.series[iSelectedIndex].name + '</b>:<br/>' + MAQ.applyFormatter(oConfig.series[iSelectedIndex].value, 'insertCommas');
                            }
                            else {
                                oToolTip.innerHTML = '<b>' + oConfig.series[iSelectedIndex].name + '</b><br/>' + oConfig.series[iSelectedIndex].maxValue + ' (' + (oConfig.series[iSelectedIndex].maxValue / oConfig.plotOptions.gauge.maxValue * 100).toFixed(2) + '%)';
                            }
                            break;
                        default:
                            oToolTip.innerHTML = '<b>' + oSeries.name + '</b><br/>' + oLabels[iSelectedIndex] + ': ' + (Math.round(oSeries.data[iSelectedIndex] * 100) / 100 || 0);
                            break;
                    }
                }
            }
            else {
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
                    }
                    else {
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
                        }
                        else {
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
                            }
                            else {
                                oSymbolAttr.x += oDim.width + oLegend.individualDistance;
                            }
                        }
                        else if (oLegend.layout === 'vertical') {
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
                            }
                            else {
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
        var iglobalCounter = 0, ioriginalyAxisLength, ioriginalxAxisLength;
        //Gauge chart
        MAQ.createGaugeChart = function (chartConfigOptions) {
            'use strict';
            var angle = 180;
            var angleIncrement = 180 / (config.plotOptions.gauge.gaugeValues.length - 1);
            var sortable = [];
            var maxValue = 0;
            var minValue = 0;
            for (var attr in dataObj) {
                sortable.push([attr, dataObj[attr]]);
                maxValue += dataObj[attr];
            }
            var totalMaxValue = parseInt(configChange.gaugeMinVal) + maxValue;
            var totalMinValue = parseInt(configChange.gaugeMinVal);
            configChange.gaugeMaxVal = totalMaxValue;
            chartConfigOptions.plotOptions.gauge.maxValue = totalMaxValue;
            config.plotOptions.gauge.maxValue = totalMaxValue;
            for (i = 0; i < sortable.length; i++) {
                config.plotOptions.gauge.gaugevaluesAngle[i] = sortable[i][1];
                config.plotOptions.gauge.gaugeValues[i] = sortable[i][0];
            }
            if (parseInt(configChange.gaugeTarget) < totalMinValue) {
                configChange.gaugeTarget = totalMinValue;
                config.plotOptions.gauge.minValue = totalMinValue;
                config.plotOptions.gauge.pointerValue = [totalMinValue];
            }
            // assign color to fill
            MAQ.applyMargin(chartConfigOptions, chartConfigOptions.chart.margin);
            var iCounter = 0, iLength = chartConfigOptions.plotOptions.gauge.gaugevaluesAngle.length, posX = [], posY = [], fAvailHeight = chartConfigOptions.availHeight, fAvailWidth = chartConfigOptions.availWidth, fCenterX = fAvailWidth / 2, fCenterY = fAvailHeight / 1.2, oGaugePlotOptions = config.plotOptions.gauge;
            var fRadius = Math.max((document.documentElement.clientWidth, window.innerWidth || 0) + (document.documentElement.clientHeight, window.innerHeight || 0)) / 8;
            var fInnerRadius = fRadius - oGaugePlotOptions.gaugeWidth, numOfColors = oGaugePlotOptions.color.length, borderWidth = oGaugePlotOptions.borderWidth, borderDashStyle = oGaugePlotOptions.borderDashStyle, fDegree = 0, arcDegree = 0, startX = fRadius, startY = 0, newX = 0, newY = 0, reflectNewY = 0, reflectStartY = 0, largeFlag = 0, xPos = 0, yPos = 0, idistanceFactor = 8, degreeSeries = [], oGaugeDataGroup, oPath, oParam, oToolTip, oAttr = {
                class: 'MAQCharts-plotArea',
                transform: 'translate(' + chartConfigOptions.availX + ',' + chartConfigOptions.availY + ')',
                opacity: 1,
                'clip-path': chartConfigOptions.animation.enabled ? 'url(#' + chartConfigOptions.chart.renderTo + 'clippath)' : ''
            }, oPathAttr = {
                d: '',
                fill: '',
                'z-index': 5,
                opacity: oGaugePlotOptions.opacity,
                stroke: oGaugePlotOptions.borderColor,
                'stroke-width': borderWidth,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(borderDashStyle)
            }, oGaugeDataGroupStyles, oGrpELE = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oAttr);
            chartConfigOptions.svgELE.appendChild(oGrpELE);
            MAQ.addAttr(oGrpELE, 'transform', 'translate(' + (chartConfigOptions.availX + fCenterX) + ', ' + (chartConfigOptions.availY + fCenterY) + ')');
            var i = 0, sum = degreeSeries[0];
            degreeSeries[0] = config.plotOptions.gauge.gaugevaluesAngle[0] * 180 / (config.plotOptions.gauge.maxValue - config.plotOptions.gauge.minValue);
            for (i = 1; i < iLength; i++) {
                degreeSeries[i] = (config.plotOptions.gauge.gaugevaluesAngle[i]) * 180 / (config.plotOptions.gauge.maxValue - config.plotOptions.gauge.minValue);
                sum = sum + degreeSeries[i];
            }
            oGaugePlotOptions.degrees = [];
            for (iCounter = 0; iCounter < iLength; iCounter += 1) {
                oGaugeDataGroupStyles = {};
                oGaugeDataGroup = MAQ.createSVGElement(chartConfigOptions.svgNS, 'g', oGaugeDataGroupStyles);
                oGrpELE.appendChild(oGaugeDataGroup);
                fDegree = degreeSeries[iCounter] / 180 * Math.PI;
                oGaugePlotOptions.degrees.push(fDegree);
                if (fDegree > Math.PI) {
                    largeFlag = 1;
                }
                newX = startX * Math.cos(fDegree) - startY * Math.sin(fDegree);
                newY = startX * Math.sin(fDegree) + startY * Math.cos(fDegree);
                reflectNewY = -newY;
                reflectStartY = -startY;
                if (!Math.floor(parseFloat(reflectNewY))) {
                    reflectNewY = 0;
                }
                xPos = (startX * Math.cos(fDegree / 2) - startY * Math.sin(fDegree / 2)) / idistanceFactor;
                yPos = -(startX * Math.sin(fDegree / 2) + startY * Math.cos(fDegree / 2)) / idistanceFactor;
                posX.push(-xPos);
                posY.push(yPos);
                oPathAttr.id = 'gauge' + iCounter;
                oPathAttr.d = 'M 0,0' + ' L ' + -newX + ',' + reflectNewY + ' A ' + fRadius + ',' + fRadius + ' 0 ' + largeFlag + ', 0 ' + -startX + ',' + reflectStartY + ' Z ';
                oPathAttr.fill = oGaugePlotOptions.color[iCounter % numOfColors];
                oPath = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oPathAttr);
                oGaugeDataGroup.appendChild(oPath);
                // Tooltip for Arc
                oParam = {
                    seriesIndex: 0,
                    isPosavail: true,
                    position: iCounter + 2,
                    config: chartConfigOptions
                };
                chartConfigOptions.series[iCounter + 2] = [];
                chartConfigOptions.series[iCounter + 2].name = sortable[iCounter][0];
                chartConfigOptions.series[iCounter + 2].min = oGaugePlotOptions.minValue;
                chartConfigOptions.series[iCounter + 2].max = oGaugePlotOptions.maxValue;
                chartConfigOptions.series[iCounter + 2].maxValue = chartConfigOptions.plotOptions.gauge.min + config.plotOptions.gauge.gaugevaluesAngle[iCounter];
                if (chartConfigOptions.tooltip.enabled) {
                    oToolTip = chartConfigOptions.tooltipDiv;
                    MAQ.addEventListener(oPath, 'mousemove', showToolTip, oParam);
                    MAQ.addEventListener(oPath, 'mouseout', hideToolTip, oToolTip);
                }
                largeFlag = 0;
                startX = newX;
                startY = newY;
                MAQ.animateClipElement('' + chartConfigOptions.chart.renderTo + 'clippathRect', 'r', fRadius + 100, 1000);
            }
            // Fill central void with white color
            var oPathVoidAttr = {
                d: '',
                fill: oGaugePlotOptions.dataLabels.LabelStyle.background,
                'z-index': 5,
                opacity: oGaugePlotOptions.opacity,
                stroke: oGaugePlotOptions.borderColor,
                'stroke-width': borderWidth,
                'stroke-dasharray': MAQ.computeStrokeDashStyle(borderDashStyle)
            };
            var VoidAngle = oGaugePlotOptions.gaugeAngle / 180 * Math.PI;
            oPathVoidAttr.id = 'GaugeVoid';
            oPathVoidAttr.d = 'M 0,1' + ' L ' + -(fInnerRadius * Math.cos(VoidAngle)) + ',' + -(fInnerRadius * Math.sin(VoidAngle) - 1) + ' A ' + fInnerRadius + ',' + fInnerRadius + ' 0 ' + largeFlag + ', 0 ' + -fInnerRadius + ',' + 1 + ' Z ';
            var oPathVoid = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', oPathVoidAttr);
            oGrpELE.appendChild(oPathVoid);
            // Tooltip for Pointer
            chartConfigOptions.series[0] = [];
            chartConfigOptions.series[0].name = 'Target Value';
            chartConfigOptions.series[0].value = oGaugePlotOptions.pointerValue;
            oParam = {
                seriesIndex: 0,
                isPosavail: true,
                position: 0,
                config: chartConfigOptions
            };
            if (chartConfigOptions.tooltip.enabled) {
                oToolTip = chartConfigOptions.tooltipDiv;
            }
            //Gauge Needle
            var Needle = {
                d: '',
                fill: oGaugePlotOptions.dataLabels.ValueStyle.pointerColor,
                'z-index': 100,
                opacity: 1
            };
            var deviationAngle = Math.atan(oGaugePlotOptions.pointerWidth / (fInnerRadius * 2));
            var needleAngleA = oGaugePlotOptions.gaugeAngle * (oGaugePlotOptions.pointerValue - oGaugePlotOptions.minValue) / (oGaugePlotOptions.maxValue - oGaugePlotOptions.minValue), needleAngleB, needleAngleC;
            // variable to be added
            needleAngleA = needleAngleA / 180 * Math.PI;
            needleAngleB = needleAngleA - deviationAngle;
            needleAngleC = needleAngleA + deviationAngle;
            Needle.id = 'gaugeNeedle';
            Needle.d = 'M ' + -(fInnerRadius + oGaugePlotOptions.pointerHeight) * Math.cos(needleAngleA) + ',' + -(fInnerRadius + oGaugePlotOptions.pointerHeight) * Math.sin(needleAngleA) + ' L ' + -fInnerRadius * Math.cos(needleAngleB) + ',' + -fInnerRadius * Math.sin(needleAngleB) + ' L ' + -fInnerRadius * Math.cos(needleAngleC) + ',' + -fInnerRadius * Math.sin(needleAngleC) + ' Z ';
            var oNeedleEle = MAQ.createSVGElement(chartConfigOptions.svgNS, 'path', Needle);
            oGrpELE.appendChild(oNeedleEle);
            //  Gauge Legends
            // Legend's positions
            if (oGaugePlotOptions.dataLabels.enabled) {
                fCenterX = fCenterX + chartConfigOptions.chart.margin[3];
                fCenterY = fCenterY + chartConfigOptions.availY;
                var oAttrValues = new Array(config.plotOptions.gauge.gaugeValues.length);
                i = 0;
                angle = 0;
                var angleIncrementGauge = degreeSeries[0], angleTemp = 0;
                while (i < config.plotOptions.gauge.gaugeValues.length) {
                    angleIncrementGauge = degreeSeries[i];
                    angle = angleTemp + degreeSeries[i] / 2;
                    angleTemp = angleTemp + degreeSeries[i];
                    oAttrValues[i] = {
                        "x": fCenterX + fRadius * Math.cos((180 + (angle)) / 180 * Math.PI),
                        "y": fCenterY + fRadius * Math.sin((180 + (angle)) / 180 * Math.PI),
                        "dx": oGaugePlotOptions.gaugeWidth * Math.cos((180 + (angle)) / 180 * Math.PI),
                        "dy": oGaugePlotOptions.gaugeWidth * Math.sin((180 + (angle)) / 180 * Math.PI) / 1.5,
                        "text": config.plotOptions.gauge.gaugeValues[i],
                        "fill": oGaugePlotOptions.dataLabels.LabelStyle.color,
                        "style": oGaugePlotOptions.dataLabels.LabelStyle,
                        "text-anchor": "middle"
                    };
                    i++;
                }
                var oAttrActualTitle = {
                    x: fCenterX,
                    y: fCenterY,
                    text: '',
                    dx: 0,
                    dy: -fInnerRadius / 2,
                    'text-anchor': 'middle',
                    fill: oGaugePlotOptions.dataLabels.LabelStyle.color,
                    style: oGaugePlotOptions.dataLabels.LabelStyle
                };
                var oAttrActualValue = {
                    "x": fCenterX,
                    "y": fCenterY,
                    "dx": 0,
                    "dy": 0,
                    "text": MAQ.applyFormatter(oGaugePlotOptions.pointerValue, oGaugePlotOptions.dataLabels.ValueStyle.formatter),
                    "fill": oGaugePlotOptions.dataLabels.ActualValueStyle.color,
                    "style": oGaugePlotOptions.dataLabels.ActualValueStyle,
                    "text-anchor": "middle"
                };
                var oActualTitleObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrActualTitle);
                //  Properties when gauge values are all text based
                var oSVGElements;
                if (oGaugePlotOptions.isAllText) {
                    i = 0;
                    oSVGElements = Array(chartConfigOptions.plotOptions.gauge.gaugeValues.length + 1);
                    i = 0;
                    var oActualValueObj = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrActualValue);
                    while (i < config.plotOptions.gauge.gaugeValues.length) {
                        oSVGElements[i] = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrValues[i]);
                        i++;
                    }
                    oSVGElements[i] = MAQ.createSVGElement(chartConfigOptions.svgNS, 'text', oAttrActualValue);
                }
                i = 0;
                oGrpELE = document.createElementNS(chartConfigOptions.svgNS, 'g');
                oGrpELE.setAttribute('class', 'MAQCharts-Legends');
                oGrpELE.appendChild(oActualTitleObj);
                while (i <= config.plotOptions.gauge.gaugeValues.length) {
                    oGrpELE.appendChild(oSVGElements[i]);
                    i++;
                }
            }
            if (fRadius > 50) {
                chartConfigOptions.svgELE.appendChild(oGrpELE);
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
            }
            else if ('function' === typeof sFunctionName) {
                oELE.addEventListener(sEventName, function (event) {
                    sFunctionName(event, oParam);
                }, true);
            }
            else {
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
            }
            else {
                fPt1 = oSVGCord.x - oFilterData[0];
                fPt2 = oFilterData[1] - oSVGCord.x;
                if (fPt1 < fPt2) {
                    return oCalCord.indexOf(oFilterData[0]);
                }
                else {
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
            }
            else {
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
                    }
                    else if (oParam.config.isLiftChart) {
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
                                oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%'; /*for IE*/
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
                }
                else if (oParam.config.isLiftChart) {
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
            }
            else if (oParam.config.isLiftChart) {
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
                    }
                    else if (oParam.config.isLiftChart) {
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
            }
            else if (sSelectedExpander === 'right') {
                if (iCurrX + oCurrentElement.width.baseVal.value <= oParam.maxX && fRightExpaderX + iMouseXDiff >= fLeftExpaderX + oParam.expanderWidth) {
                    if (oParam.config.isTimeLineChart) {
                        oParam.expanderRight.x.baseVal.value += iMouseXDiff;
                        oCurrentElement.width.baseVal.value = oParam.expanderRight.x.baseVal.value - oParam.expanderLeft.x.baseVal.value - oParam.expanderRight.width.baseVal.value;
                        MAQ.addAttr(oParam.clipRight, 'd', MAQ.getTriangleCoords(oParam.expanderRight.x.baseVal.value, oParam.expanderRight.y.baseVal.value + oParam.expanderRight.height.baseVal.value / 2, Math.min(20, oParam.height)));
                    }
                    else if (oParam.config.isLiftChart) {
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
                                oParam.circleTexts[iCounter].textContent = oIntersectionPointsAttr.values[iCounter] + '%'; /*for IE*/
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
                }
                else if (oParam.config.isLiftChart) {
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
        function dynamicSort(property, flag) {
            'use strict';
            if (flag) {
                return function (a, b) {
                    return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
                };
            }
            else {
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
            }
            else if (e.clientX || e.clientY) {
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
            }
            else {
                MAQ.plotArea(chartConfigOptions, oContainerDiv.clientHeight, oContainerDiv.clientWidth, iLoopCounter, iCalcDimension, 'height', 'width');
            }
        };
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
            }
            else {
                return week - 1;
            }
        };
        MAQ.charts(config);
    })(config);
}
/// <amd-dependency path='liquidFillGauge'>
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230870;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230870) {
                ;
                ;
                /**
                 * Interface for LiftChart settings.
                 *
                 * @interface
                 * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
                 */
                /**
                    * Function that converts queried data into a view model that will be used by the visual.
                    *
                    * @function
                    * @param {VisualUpdateOptions} options - Contains references to the size of the container
                    *                                        and the dataView which contains all the data
                    *                                        the visual had queried.
                    * @param {IVisualHost} host            - Contains references to the host which contains services
                    */
                function visualTransform(options, host) {
                    if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].categorical)
                        return;
                    var dataViews = options.dataViews;
                    var categorical = options.dataViews[0].categorical;
                    var category = categorical.categories[0];
                    var GaugeChartDataPoints = [];
                    var dataMax;
                    var colorPalette = PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.createColorPalette(host.colors).reset();
                    var dataViewObject = Object.getPrototypeOf(dataViews[0]);
                    var assignData = [0, 1];
                    if (dataViews[0].metadata.columns[0].roles["measure"] && dataViewObject.categorical.categories[1]) {
                        assignData[0] = 1;
                        assignData[1] = 0;
                    }
                    for (var iIterator = 0; iIterator < dataViewObject.categorical.categories[assignData[0]].values.length; iIterator++) {
                        var defaultColor = {
                            solid: {
                                color: colorPalette.getColor(dataViewObject.categorical.categories[assignData[0]].values[iIterator]).value
                            }
                        };
                        GaugeChartDataPoints.push({
                            category: dataViewObject.categorical.categories[assignData[0]].values[iIterator],
                            value: dataViewObject.categorical.categories[assignData[1]] ? dataViewObject.categorical.categories[assignData[1]].values[iIterator] : 0,
                            color: PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.getCategoricalObjectValue(category, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                            selectionId: host.createSelectionIdBuilder()
                                .withCategory(category, iIterator)
                                .createSelectionId()
                        });
                    }
                    return {
                        dataPoints: GaugeChartDataPoints
                    };
                }
                var Visual = (function () {
                    function Visual(options) {
                        this.prevDataViewObjects = {}; // workaround temp variable because the PBI SDK doesn't correctly identify style changes. See getSettings method.
                        this.host = options.host;
                        this.selectionManager = options.host.createSelectionManager();
                        this.viewport;
                        var svg = this.svg = d3.select(options.element).append('div').classed('gaugeChart', true);
                        options.element.setAttribute("id", "gaugeChart");
                    }
                    Visual.prototype.update = function (options) {
                        if (!options.viewport)
                            return;
                        document.getElementById('gaugeChart').innerHTML = "";
                        if (0 === options.dataViews.length)
                            return;
                        var dataView = options.dataViews[0];
                        var roles = {
                            "category": -1,
                            "measure": -1
                        };
                        var obj, data = [], jCount, iCount, keys;
                        for (iCount = 0; iCount < dataView.metadata.columns.length; iCount++) {
                            keys = Object.keys(dataView.metadata.columns[iCount].roles);
                            for (jCount = 0; jCount < keys.length; jCount++) {
                                roles[keys[jCount]] = iCount;
                            }
                        }
                        if (-1 == roles.category || -1 === roles.measure)
                            return;
                        var width = options.viewport.width;
                        var height = options.viewport.height;
                        var dataView = options.dataViews[0];
                        var viewModel = visualTransform(options, this.host);
                        if (!viewModel)
                            return;
                        this.gaugeChartPoints = viewModel.dataPoints;
                        this.svg.attr({
                            width: width,
                            height: height
                        });
                        // Grab the dataview object
                        if (options.dataViews && options.dataViews[0] && options.dataViews[0].tree.root.children) {
                            var dataView = options.dataViews[0];
                            var viewModel_1 = visualTransform(options, this.host);
                            if (!viewModel_1)
                                return;
                            var settingsChanged = this.getSettings(dataView.metadata.objects); // workaround because of sdk bug that doesn't notify when only style has changed
                            if (dataView.metadata.columns.length < 2)
                                return;
                            if (!this.gauge || settingsChanged || ((options.type & powerbi.VisualUpdateType.Resize) || options.type & powerbi.VisualUpdateType.ResizeEnd)) {
                                this.svg.selectAll("*").remove();
                                this.gauge = MAQDrawChart(dataView, this.settings, viewModel_1);
                            }
                            else {
                                // This means we have a gauge and the only thing that changed was the data.
                                this.gauge.update(dataView.single.value);
                            }
                        }
                        else {
                            return;
                        }
                    };
                    /**
                     * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
                     *
                     * @function
                     * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
                     */
                    Visual.prototype.enumerateObjectInstances = function (options) {
                        var objectName = options.objectName;
                        var objectEnumeration = [];
                        switch (objectName) {
                            case "colorSelector":
                                for (var _i = 0, _a = this.gaugeChartPoints; _i < _a.length; _i++) {
                                    var GaugeChartPoint = _a[_i];
                                    objectEnumeration.push({
                                        objectName: objectName,
                                        displayName: GaugeChartPoint.category,
                                        properties: {
                                            fill: {
                                                solid: {
                                                    color: GaugeChartPoint.color
                                                }
                                            }
                                        },
                                        selector: GaugeChartPoint.selectionId.getSelector()
                                    });
                                }
                                break;
                            case "RangeValues":
                                objectEnumeration.push({
                                    objectName: objectName,
                                    properties: {
                                        LabelColor: { solid: { color: this.settings.LabelColor } }
                                    },
                                    selector: null
                                });
                                break;
                        }
                        return objectEnumeration;
                    };
                    Visual.prototype.destroy = function () {
                        //TODO: Perform any cleanup tasks here
                    };
                    // Reads in settings values from the DataViewObjects and returns a settings object that the liquidFillGauge library understands
                    Visual.prototype.getSettings = function (objects) {
                        var settingsChanged = false;
                        if (typeof this.settings == 'undefined' || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                            this.settings = {
                                legendValues: PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.getValue(objects, 'Legend', 'legendValues', "Awareness:10,Knowledge:20,Liking:40,Preference:60,Conviction:80,Purchase:100"),
                                //Min and max value
                                gaugeMinVal: 0,
                                gaugeMaxVal: 0,
                                //Pointer
                                gaugeTarget: 0,
                                gaugeTargetHeight: 0,
                                gaugeTargetWidth: 0,
                                TargetColor: 'transparent',
                                //Label
                                LabelColor: PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.getValue(objects, 'RangeValues', 'LabelColor', { solid: { color: "#707070" } }).solid.color
                            };
                            settingsChanged = true;
                        }
                        this.prevDataViewObjects = objects;
                        return settingsChanged;
                    };
                    __decorate([
                        logExceptions(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', [Object]), 
                        __metadata('design:returntype', void 0)
                    ], Visual.prototype, "update", null);
                    __decorate([
                        logExceptions(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', [Object]), 
                        __metadata('design:returntype', Object)
                    ], Visual.prototype, "enumerateObjectInstances", null);
                    __decorate([
                        logExceptions(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', [Object]), 
                        __metadata('design:returntype', Boolean)
                    ], Visual.prototype, "getSettings", null);
                    return Visual;
                }());
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.Visual = Visual;
                function logExceptions() {
                    return function (target, propertyKey, descriptor) {
                        return {
                            value: function () {
                                try {
                                    return descriptor.value.apply(this, arguments);
                                }
                                catch (e) {
                                    console.error(e);
                                    throw e;
                                }
                            }
                        };
                    };
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.logExceptions = logExceptions;
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var extensibility;
    (function (extensibility) {
        var visual;
        (function (visual) {
            var PBI_CV_309E6B47_39A5_4681_808F_132AFB230870;
            (function (PBI_CV_309E6B47_39A5_4681_808F_132AFB230870) {
                /**
                 * Gets property value for a particular object.
                 *
                 * @function
                 * @param {DataViewObjects} objects - Map of defined objects.
                 * @param {string} objectName       - Name of desired object.
                 * @param {string} propertyName     - Name of desired property.
                 * @param {T} defaultValue          - Default value of desired property.
                 */
                function getValue(objects, objectName, propertyName, defaultValue) {
                    if (objects) {
                        var object = objects[objectName];
                        if (object) {
                            var property = object[propertyName];
                            if (property !== undefined) {
                                return property;
                            }
                        }
                    }
                    return defaultValue;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.getValue = getValue;
                /**
                 * Gets property value for a particular object in a category.
                 *
                 * @function
                 * @param {DataViewCategoryColumn} category - List of category objects.
                 * @param {number} index                    - Index of category object.
                 * @param {string} objectName               - Name of desired object.
                 * @param {string} propertyName             - Name of desired property.
                 * @param {T} defaultValue                  - Default value of desired property.
                 */
                function getCategoricalObjectValue(category, index, objectName, propertyName, defaultValue) {
                    var categoryObjects = category.objects;
                    if (categoryObjects) {
                        var categoryObject = categoryObjects[index];
                        if (categoryObject) {
                            var object = categoryObject[objectName];
                            if (object) {
                                var property = object[propertyName];
                                if (property !== undefined) {
                                    return property;
                                }
                            }
                        }
                    }
                    return defaultValue;
                }
                PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.getCategoricalObjectValue = getCategoricalObjectValue;
            })(PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 || (visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = {}));
        })(visual = extensibility.visual || (extensibility.visual = {}));
    })(extensibility = powerbi.extensibility || (powerbi.extensibility = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870 = {
                name: 'PBI_CV_309E6B47_39A5_4681_808F_132AFB230870',
                displayName: 'Multi-color Gauge',
                class: 'Visual',
                version: '1.0.0',
                apiVersion: '1.1.0',
                create: function (options) { return new powerbi.extensibility.visual.PBI_CV_309E6B47_39A5_4681_808F_132AFB230870.Visual(options); },
                custom: true
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
//# sourceMappingURL=visual.js.map