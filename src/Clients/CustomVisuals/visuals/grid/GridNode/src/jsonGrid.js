var scripts = document.querySelectorAll('script[src]');
for (var i = 0; i < scripts.length; i++) {
    if (document.querySelectorAll('script[src]')[i] && document.querySelectorAll('script[src]')[i].src && 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js' === document.querySelectorAll('script[src]')[i].src) {
        var elem = document.querySelectorAll('script[src]')[i];
        elem.parentNode.removeChild(elem);
    }
}
var script = document.createElement("SCRIPT");
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
script.type = 'text/javascript';
document.getElementsByTagName("head")[0].appendChild(script);
function myMAQlibrary(dWagon, gridFormatters) {
    var consumeData = dWagon;
    var dataViewObj;
    var config = {
        "container": "KPIGrid",
        "data": [],
        "columnHeader": [],
        "gridSort": {},
        "pagination": {
            "maxRows": gridFormatters.maxRows,
            "retainPageOnSort": false,
            "paginate": true
        },
        "rows": {
            "alternate": false
        },
        "clientGrid": true,
        "isWin8App": false,
        "callBackFunc": null
    };


    var obj, data = [];
    for (jCount = 0; jCount < dWagon.table.rows.length; jCount++) {
        obj = {};
        for (iCount = 0; iCount < dWagon.table.columns.length; iCount++) {
            var col = dWagon.table.columns[iCount].queryName;
            var name = col.substring(col.indexOf('.') + 1, col.length);
            if (col.lastIndexOf(')') === (col.length - 1)) {
                name = col.substring(col.indexOf('.') + 1, col.lastIndexOf(')'));
            }
            obj[name] = dWagon.table.rows[jCount][iCount];
        }
        data.push(obj);
    }
    config.data = data;

    config.columnHeader = [];
    for (iCount = 0; iCount < dWagon.table.columns.length; iCount++) {
        obj = {};
        obj.columnText = dWagon.table.columns[iCount].displayName;
        var col = dWagon.table.columns[iCount].queryName;
        obj.name = col.substring(col.indexOf('.') + 1, col.length);
        if (col.lastIndexOf(')') === (col.length - 1)) {
            obj.name = col.substring(col.indexOf('.') + 1, col.lastIndexOf(')'));
        }
        obj.sortable = true;
        obj.sortType = "parseString";
        switch (typeof(dWagon.table.rows[0][iCount])) {
            case 'number':
                obj.sortType = "parseInteger";
                break;
            case 'object':
                if (dWagon.table.rows[iCount][0] instanceof Date) {
                    obj.sortType = "parseDate";
                }
                break;
        }
        var col = dWagon.table.columns[iCount].queryName;
        obj.sortKey = col.substring(col.indexOf('.') + 1, col.length);
        if (col.lastIndexOf(')') === (col.length - 1)) {
            obj.sortKey = col.substring(col.indexOf('.') + 1, col.lastIndexOf(')'));
        }
        obj.headerClassName = "TableHeader";
        obj.formatter = "";
        obj.style = {
            "width": "350px"
        };
        config.columnHeader.push(obj);
    }
    var col = dWagon.table.columns[0].queryName;
    var gridSort = {
        "sortby": col.substring(col.indexOf('.') + 1, col.length),
        "sortorder": "asc",
        "sortType": "parseString"
    };
    var sortKey = gridFormatters.sortKey,
        sortOrder = gridFormatters.sortOrder;
    if (sortKey) {
        sortKey = parseInt(sortKey);
        if (sortKey > dWagon.table.columns.length)
            sortKey = dWagon.table.columns.length;
        sortKey--;
        col = dWagon.table.columns[sortKey].queryName;
        gridSort.sortby = col.substring(col.indexOf('.') + 1, col.length);
    } else {
        sortKey = 0;
    }
    if (sortOrder && ('asc' == sortOrder.toLowerCase() || 'desc' == sortOrder.toLowerCase())) {
        gridSort.sortorder = sortOrder.toLowerCase();
    } else {
        sortOrder = 'asc';
    }
    switch (typeof(dWagon.table.rows[sortKey][sortKey])) {
        case 'number':
            gridSort.sortType = "parseInteger";
            break;
        case 'object':
            if (dWagon.table.rows[sortKey][0] instanceof Date) {
                gridSort.sortType = "parseDate";
            }
            break;
    }
    config.gridSort = gridSort;
    $('#KPIGrid').html('');

    function intializeEvents() {
        var apiUrl = gridFormatters.apiUrl;
        var columnNumber = gridFormatters.columnNumber;
        var isCustomRedirect = gridFormatters.isCustomRedirect;
        if (columnNumber > dataViewObj.table.columns.length)
            columnNumber = dataViewObj.table.columns.length;
        if (isCustomRedirect && apiUrl && columnNumber) {
            loadJquery(apiUrl, columnNumber);
        }
    }

    dataViewObj = dWagon;
    config.callBackFunc = intializeEvents;


    MAQ.JsonGrid(config);
    d3.select('.DataDiv').style({ 'font-size': gridFormatters.fontSize + 'px'});
    d3.select('.first').style({ 'width': gridFormatters.fontSize + 'px'});
    d3.select('.next').style({ 'width': gridFormatters.fontSize + 'px'});
    var apiUrl = gridFormatters.apiUrl;
    var columnNumber = gridFormatters.columnNumber;
    var isCustomRedirect = gridFormatters.isCustomRedirect;

    if (columnNumber > dWagon.table.columns.length)
        columnNumber = dWagon.table.columns.length;
    if (isCustomRedirect && apiUrl && columnNumber) {
        loadJquery(apiUrl, columnNumber);
    }

    function loadJquery(apiUrl, columnNumber) {
        if (!columnNumber) {
            columnNumber = 1;
        }
        $('.jsonGridRow:nth-child(' + columnNumber + ')').addClass('hyperLink');
        $('.jsonGridRow:nth-child(' + columnNumber + ')').unbind('click');
        $('.jsonGridRow:nth-child(' + columnNumber + ')').click(function() {
            sendRequest($(this).text(), apiUrl);
        });
    }

    function sendRequest(id, apiUrl) {
        if (!apiUrl) {
            apiUrl = "http://jsonplaceholder.typicode.com/posts/"
        }
        var frame = document.createElement('iframe');
        frame.setAttribute('style', 'display:none');
        frame.className = "hiddenFrame";
        frame.setAttribute('src', apiUrl + id);
        document.body.appendChild(frame);
    }
}

/*JSHint Count = 0*/

/// <disable>JS2076.IdentifierIsMiscased,JS3056.DeclareVariablesOnceOnly,JS3092.DeclarePropertiesBeforeUse,JS2032.PlaceLiteralsOnRightSideInComparisons,JS3057.AvoidImplicitTypeCoercion,JS3054.NotAllCodePathsReturnValue</disable>
/// <dictionary target='comment'>maqutility</dictionary>
/// <dictionary>maqutility</dictionary>
// Count without suppression: 37
// JSCOP count: 0; June 19, 2014.
// Current JSCOP count: 0;  June 19, 2014.
if ("undefined" === typeof oGridConstants) {
    var oGridConstants = {
        sNAN: "NaN",
        sNA: "N/A",
        sParseDate: "parseDate",
        sParseDollar: "parseUSD",
        sParseInteger: "parseInteger",
        sParseFloat: "parseDecimal",
        sParseString: "parseString",
        sParseSalesStage: "parseSalesStage",
        sError: "Unable to copy oObject! Its type isn't supported.",
        sFunction: "function",
        sPaginationText: "Jump to",
        sDefaultWidth: "250px",
        iDropDownLimit: 20
    };
}
var MAQUtility;
(function(MAQUtility) {
    function getParents(oNode, sClassSelector) {
        var aParents = [],
            oCurrentNode = oNode.parentNode,
            oTempNode;
        while (oCurrentNode !== document) {
            oTempNode = oCurrentNode;
            if (!sClassSelector || !sClassSelector.length || (-1 < oTempNode.className.indexOf(sClassSelector))) {
                aParents.push(oTempNode);
            }
            oCurrentNode = oTempNode.parentNode;
        }
        return aParents;
    }
    MAQUtility.getParents = getParents;

    function applyStyleToObject(oNode, oStyleObject) {
        var oStyles, iCounter;
        if (typeof oStyleObject === "undefined") {
            return;
        }
        oStyles = Object.keys(oStyleObject), iCounter = 0;
        for (iCounter; iCounter < oStyles.length; iCounter += 1) {
            try {
                oNode.style[oStyles[iCounter]] = oStyleObject[oStyles[iCounter]];
            } catch (exception) {}
        }
        return;
    }
    MAQUtility.applyStyleToObject = applyStyleToObject;

    function hasClass(oElement, sName) {
        if (oElement && oElement.className) {
            return new RegExp("(\\s|^)" + sName + "(\\s|$)").test(oElement.className);
        }
        return;
    }
    MAQUtility.hasClass = hasClass;

    function removeClass(oElement, sName) {
        var iIterator;
        if (oElement && oElement.length > 0) {
            for (iIterator = 0; iIterator < oElement.length; iIterator++) {
                if (hasClass(oElement[iIterator], sName)) {
                    oElement[iIterator].className = oElement[iIterator].className.replace(new RegExp("(\\s|^)" + sName + "(\\s|$)"), " ").replace(/^\s+|\s+$/g, "");
                }
            }
        } else {
            if (oElement && hasClass(oElement, sName)) {
                oElement.className = oElement.className.replace(new RegExp("(\\s|^)" + sName + "(\\s|$)"), " ").replace(/^\s+|\s+$/g, "");
            }
        }
    }
    MAQUtility.removeClass = removeClass;

    function addClass(oElement, sName) {
        var iIterator;
        if (oElement && oElement.length > 1) {
            for (iIterator = 0; iIterator < oElement.length; iIterator++) {
                if (!hasClass(oElement[iIterator], sName)) {
                    oElement[iIterator].className += (oElement[iIterator].className ? " " : "") + sName;
                }
            }
        } else {
            if (oElement && !hasClass(oElement, sName)) {
                oElement.className += (oElement.className ? " " : "") + sName;
            }
        }
    }
    MAQUtility.addClass = addClass;

    function sortBy(field, reverse, primer) {
        var key = function(x) {
                return primer ? primer(x[field]) : x[field];
            },
            time = function(x) {
                if (x[field]) {
                    return Date.parse(x[field]);
                }
                return 0;
            },
            trimUSD = function(x) {
                if (x[field] && x[field] !== oGridConstants.sNA) {
                    return parseInt(x[field].substring(1, x[field].length).split(",").join(""));
                }
                return 0;
            },
            trimSalesStage = function(x) {
                if (x[field] && x[field] !== oGridConstants.sNA) {
                    var oStageInfo = x[field].split(" ");
                    return parseInt(oStageInfo[oStageInfo.length - 1].slice(0, oStageInfo[oStageInfo.length - 1].length - 1));
                }
                return 0;
            },
            stringConvert = function(x) {
                if (x[field] && x[field] !== oGridConstants.sNA) {
                    return x[field].toString();
                }
                return 0;
            },
            parseInteger = function(x) {
                if (x[field]) {
                    return parseInt(x[field]);
                }
                return 0;
            },
            parseDecimal = function(x) {
                if (x[field]) {
                    return parseFloat(x[field]);
                }
                return 0;
            },
            parseString = function(x) {
                if (x[field]) {
                    return x[field].toString();
                }
                return "";
            };
        return function(a, b) {
            var iFirstValue, iSecondValue;
            if (primer === oGridConstants.sParseDate) {
                iFirstValue = time(a), iSecondValue = time(b);
            } else if (primer === oGridConstants.sParseDollar) {
                iFirstValue = trimUSD(a), iSecondValue = trimUSD(b);
            } else if (primer === oGridConstants.sParseSalesStage) {
                iFirstValue = trimSalesStage(a), iSecondValue = trimSalesStage(b);
            } else if (primer === oGridConstants.sParseInteger) {
                iFirstValue = parseInteger(a), iSecondValue = parseInteger(b);
            } else if (primer === oGridConstants.sParseFloat) {
                iFirstValue = parseDecimal(a), iSecondValue = parseDecimal(b);
            } else if (primer === oGridConstants.sParseString) {
                iFirstValue = parseString(a), iSecondValue = parseString(b);
            } else {
                if (primer === parseFloat || primer === parseInt) {
                    iFirstValue = key(a), iSecondValue = key(b);
                    if (String(iFirstValue) === oGridConstants.sNAN) {
                        iFirstValue = 0;
                    }
                    if (String(iSecondValue) === oGridConstants.sNAN) {
                        iSecondValue = 0;
                    }
                } else {
                    iFirstValue = (key(a) || "").toString().toLowerCase(), iSecondValue = key(b).toLowerCase();
                }
            }
            return ((iFirstValue < iSecondValue) ? -1 : (iFirstValue > iSecondValue) ? +1 : 0) * [-1, 1][+!!reverse];
        };
    }
    MAQUtility.sortBy = sortBy;

    function clone(oObject) {
        // Handle the 3 simple types, and null or undefined
        var copy, len, i = 0,
            attribute;
        if (oObject && oObject.length) {
            len = oObject.length;
        };
        if (null === oObject || "object" !== typeof oObject) {
            return oObject;
        }

        // Handle Date
        if (oObject instanceof Date) {
            copy = new Date();
            copy.setTime(oObject.getTime());
            return copy;
        }

        // Handle Array
        if (oObject instanceof Array) {
            copy = [];
            for (i = 0; i < len; i++) {
                copy[i] = MAQUtility.clone(oObject[i]);
            }
            return copy;
        }

        // Handle Object
        if (oObject instanceof Object) {
            copy = {};
            for (attribute in oObject) {
                if (oObject.hasOwnProperty(attribute)) {
                    copy[attribute] = MAQUtility.clone(oObject[attribute]);
                }
            }
            return copy;
        }
        throw new Error(oGridConstants.sError);
    }
    MAQUtility.clone = clone;

    // MAQUtility.applyFormatter: applies formatting to data
    function applyFormatter(sText, sFormatterName, oConfiguration, iIterator) {
        if (typeof oConfiguration === "undefined") {
            oConfiguration = {};
        }
        if (typeof iIterator === "undefined") {
            iIterator = 0;
        }
        if (sFormatterName) {
            if (typeof(window[sFormatterName]) === 'function') {
                sText = window[sFormatterName](sText, oConfiguration, iIterator);
            } else if (typeof sFormatterName === 'function') {
                sText = sFormatterName(sText, oConfiguration, iIterator);
            }
        }
        return sText;
    }
    MAQUtility.applyFormatter = applyFormatter;;
})(MAQUtility || (MAQUtility = {}));
/// <disable>JS2025.InsertSpaceBeforeCommentText</disable>


/// <disable>JS2028.UseCPlusPlusStyleComments,JS2032.PlaceLiteralsOnRightSideInComparisons,JS3057.AvoidImplicitTypeCoercion,JS3092.DeclarePropertiesBeforeUse</disable>
/// <dictionary>d-mmm-yy</dictionary>
//// Count without suppression: 79
// JSCOP count: 3, 8 September, 2014
// Current JSCOP count: 3, 8 September, 2014
"use strict";
// thousandFormatter: Formats the number in comma separator format (xxxK/M/B).
function thousandFormatter(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "0";
    } else if (!sInput || isNaN(sInput)) {
        return "N/A";
    }

    // Check for validity of decimal places parameter
    if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
        iDecimalPlaces = 0; // Default value is 0
    }

    var fTempValue = parseFloat(sInput);
    if (fTempValue < 0) {
        sInput = -1 * fTempValue;
    } else {
        sInput = fTempValue;
    }
    var sTempValue = sInput.toString();

    if (-1 !== sTempValue.indexOf(".")) {
        var decimalLength = sTempValue.substring(sTempValue.indexOf(".") + 1).length;
        if (iDecimalPlaces < decimalLength) {
            sTempValue = parseFloat(sInput.toFixed(iDecimalPlaces)).toString();
        }
    }
    var aDigits = sTempValue.split("."),
        sIntegerDigits = aDigits[0],
        sFractionDigits = aDigits.length > 1 ? "." + aDigits[1] : "";

    // Converting thousand to M
    var bConvert = false,
        kConvert = false,
        iTempValue = parseInt(sIntegerDigits),
        sCurrency = "";
    if (iTempValue >= 1000000000) {
        sIntegerDigits = iTempValue / 1000000000;
        sCurrency = "B";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000000 && iTempValue >= 1000000) {
        sIntegerDigits = iTempValue / 1000000;
        sCurrency = "M";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000 && iTempValue >= 1000) {
        sIntegerDigits = iTempValue / 1000;
        sCurrency = "K";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    }

    var rPattern = /(\d+)(\d{3})/;
    while (rPattern.test(sIntegerDigits)) {
        sIntegerDigits = sIntegerDigits.replace(rPattern, "$1" + "," + "$2");
    }
    if (parseInt(sIntegerDigits) || sFractionDigits) {
        return ((fTempValue < 0) ? "-" : "") + sIntegerDigits + sFractionDigits + sCurrency;
    } else {
        return "0";
    }
};

// insertCommasOnly: Formats the number in comma separator format (x,xxx,xxx.xx).
function insertCommasOnly(sInput, iDecimalPlaces) {
    if (!sInput || isNaN(sInput)) {
        return "N/A";
    }

    // Check for validity of decimal places parameter
    if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
        iDecimalPlaces = 0; // Default value is 0
    }
    var fTempValue = parseFloat(sInput),
        sTempValue = fTempValue.toString();

    if (-1 !== sTempValue.indexOf(".")) {
        var decimalLength = sTempValue.substring(sTempValue.indexOf(".") + 1).length;
        if (iDecimalPlaces < decimalLength) {
            sTempValue = fTempValue.toFixed(iDecimalPlaces).toString();
        }
    }
    var aDigits = sTempValue.split("."),
        sIntegerDigits = aDigits[0],
        sFractionDigits = aDigits.length > 1 ? "." + aDigits[1] : "";

    sIntegerDigits = sIntegerDigits.toString();
    var rPattern = /(\d+)(\d{3})/;
    while (rPattern.test(sIntegerDigits)) {
        sIntegerDigits = sIntegerDigits.replace(rPattern, "$1" + "," + "$2");
    }

    var sFinalValue = sIntegerDigits + sFractionDigits;
    if (0 === parseFloat(sFinalValue)) {
        return "0";
    }
    return sFinalValue;
};

// insertCommasOnlyWithOnePlace: Returns data with 1 decimal place in format (x,xxx,xxx.xx)
function insertCommasOnlyWithOnePlace(sInput) {
    if (0 === parseFloat(sInput)) {
        return "0";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return insertCommasOnly(sInput, 1);
    }
}

// revenueFormatter: Formats the number in revenue format ($x,xx.xxK).
function revenueFormatter(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "$0";
    } else if (!sInput || isNaN(sInput)) {
        return "N/A";
    }

    // Check for validity of decimal places parameter
    if (!iDecimalPlaces || isNaN(iDecimalPlaces)) {
        iDecimalPlaces = 1; // Default value is 0
    }
    var sTempValue = thousandFormatter(sInput, iDecimalPlaces);
    return ((parseFloat(sTempValue) < 0) ? "-$" + sTempValue.substr(1) : "$" + sTempValue);
};

// roundNoDecimalPercent: Formats the number with percentage and removes decimal places (xx%).
function roundNoDecimalPercent(sCellValue) {
    if ("N/A" !== sCellValue) {
        return Math.round(sCellValue) + "%";
    }
    return sCellValue;
};

// insertPercentages: Formats the number with percentage after multiplying by 100 (xx.xx%).
function insertPercentages(sCellValue, iDecimalPlaces) {
    if (0 === parseFloat(sCellValue)) {
        return "0%";
    } else if (!sCellValue || isNaN(sCellValue)) {
        return "N/A";
    }
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 0; // Default value is 0
    }
    sCellValue = sCellValue * 100;
    var sTempValue = insertCommasOnly(sCellValue, iDecimalPlaces);
    return sTempValue + "%";
};

// insertPercentageOnly: Formats the number with percentage (xx.xx%).
function insertPercentageOnly(sCellValue, iDecimalPlaces) {
    if (0 === parseFloat(sCellValue)) {
        return "0%";
    } else if (!sCellValue || isNaN(parseFloat(sCellValue))) {
        return "N/A";
    }
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 0; // Default value is 0
    }
    var sTempValue = insertCommasOnly(sCellValue, iDecimalPlaces);
    return sTempValue + "%";
};

// insertPercentageWithThousandFormatter: Returns data with decimal place in format x.xK/M/B%
function insertPercentageWithThousandFormatter(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "0%";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return thousandFormatter(sInput, iDecimalPlaces) + "%";
    }
};

// insertPercentageWithThousandFormatter: Returns data with decimal place in format x.xK/M/B%
function insertPercentageWithThousandFormatterOneDecimal(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "0%";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return thousandFormatter(sInput, 1) + "%";
    }
};

// insertPercentageWithThousandFormatter: Returns data with decimal place in format for tile x.xK/M/B%
function insertPercentageWithThousandFormatterForTile(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "0" + "<span class='tileUnitSymbol'>%</span>";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return thousandFormatter(sInput, 1) + "<span class='tileUnitSymbol'>%</span>";
    }
};

// dateStringToMonthFormatter: Converts the date passed as string to mmm, yyyy format
function dateStringToMonthFormatter(sInput) {
    if (sInput) {
        var dInputDate = new Date(sInput);
        if ("Invalid Date" !== dInputDate.toDateString()) {
            return formatDateFunction(dInputDate, "mmm, yyyy");
        }
        return "N/A";
    }
    return "N/A";
}

// formatDateFunction: Date formatting function.
function formatDateFunction(formatDate, formatString) {
    if (formatDate instanceof Date) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var sFullYear = formatDate.getFullYear();
        var yy = sFullYear.toString().substring(2);
        var m = formatDate.getMonth();
        var mm = m < 10 ? "0" + m : m;
        var sMonthName = months[m];
        var d = formatDate.getDate();
        var dd = d < 10 ? "0" + d : d;

        var h = formatDate.getHours();
        var hh = h < 10 ? "0" + h : h;
        var n = formatDate.getMinutes();
        var nn = n < 10 ? "0" + n : n;
        var s = formatDate.getSeconds();
        var ss = s < 10 ? "0" + s : s;

        formatString = formatString.toLowerCase();
        formatString = formatString.replace("hh", hh);
        formatString = formatString.replace("h", h);
        formatString = formatString.replace("nn", nn);
        formatString = formatString.replace("n", n);
        formatString = formatString.replace("ss", ss);
        formatString = formatString.replace("s", s);
        formatString = formatString.replace("dd", dd);
        formatString = formatString.replace("d", d);
        formatString = formatString.replace("yyyy", sFullYear);
        formatString = formatString.replace("yy", yy);
        formatString = formatString.replace("mmm", sMonthName);
        formatString = formatString.replace("mm", (mm + 1));
        formatString = formatString.replace("m", (m + 1));
        return formatString;
    }
    return "";
};

// customRevenueFormatter: Formats the number in revenue format and returns object with sign, value and currency ({"$","x,xx.xx","K"})
function customRevenueFormatter(sInput, iDecimalPlaces) {
    if (0 === sInput) {
        return {
            sign: "$",
            value: 0,
            currency: ""
        };
    } else if (isNaN(sInput) || !sInput) {
        return {
            sign: "N/A"
        };
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 0; // Default value is 2
    }
    var fTempValue = parseFloat(sInput);
    if (fTempValue < 0) {
        sInput = -1 * fTempValue;
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 2; // Default value is 2
    }
    var sTempValue = sInput.toString();

    if (-1 !== sTempValue.indexOf(".")) {
        var decimalLength = sTempValue.substring(sTempValue.indexOf(".") + 1).length;
        if (iDecimalPlaces < decimalLength) {
            sTempValue = sInput.toFixed(iDecimalPlaces).toString();
        }
    }
    var aDigits = sTempValue.split("."),
        sIntegerDigits = aDigits[0],
        sFractionDigits = aDigits.length > 1 ? "." + aDigits[1] : "";

    // Converting thousand to M
    var bConvert = false,
        kConvert = false,
        iTempValue = parseInt(sIntegerDigits),
        sCurrency = "";
    if (iTempValue >= 1000000000) {
        sIntegerDigits = iTempValue / 1000000000;
        sCurrency = "B";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000000 && iTempValue >= 1000000) {
        sIntegerDigits = iTempValue / 1000000;
        sCurrency = "M";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000 && iTempValue >= 1000) {
        sIntegerDigits = iTempValue / 1000;
        sCurrency = "K";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    }

    var rPattern = /(\d+)(\d{3})/;
    while (rPattern.test(sIntegerDigits)) {
        sIntegerDigits = sIntegerDigits.replace(rPattern, "$1" + "," + "$2");
    }
    return {
        sign: ((fTempValue < 0) ? "-$" : "$"),
        value: sIntegerDigits + sFractionDigits,
        currency: sCurrency
    };
};

// customRevenueFormatter: Formats the number in revenue format and returns object with sign, value and currency ({"-","x,xx.xx","K"})
function customThousandFormatter(sInput, iDecimalPlaces) {
    if (0 === sInput) {
        return {
            sign: "",
            value: "0",
            currency: ""
        };
    } else if (isNaN(sInput) || !sInput) {
        return {
            sign: "N/A"
        };
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 0; // Default value is 0
    }
    var fTempValue = parseFloat(sInput);
    if (fTempValue < 0) {
        sInput = -1 * fTempValue;
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 2; // Default value is 2
    }
    var sTempValue = sInput.toString();

    if (-1 !== sTempValue.indexOf(".")) {
        var decimalLength = sTempValue.substring(sTempValue.indexOf(".") + 1).length;
        if (iDecimalPlaces < decimalLength) {
            sTempValue = parseFloat(sInput).toFixed(iDecimalPlaces).toString();
        }
    }
    var aDigits = sTempValue.split("."),
        sIntegerDigits = aDigits[0],
        sFractionDigits = aDigits.length > 1 ? "." + aDigits[1] : "";

    // Converting thousand to M
    var bConvert = false,
        kConvert = false,
        iTempValue = parseInt(sIntegerDigits),
        sCurrency = "";
    if (iTempValue >= 1000000000) {
        sIntegerDigits = iTempValue / 1000000000;
        sCurrency = "B";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000000 && iTempValue >= 1000000) {
        sIntegerDigits = iTempValue / 1000000;
        sCurrency = "M";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 1000000 && iTempValue >= 1000) {
        sIntegerDigits = iTempValue / 1000;
        sCurrency = "K";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    }

    var rPattern = /(\d+)(\d{3})/;
    while (rPattern.test(sIntegerDigits)) {
        sIntegerDigits = sIntegerDigits.replace(rPattern, "$1" + "," + "$2");
    }
    return {
        sign: ((fTempValue < 0) ? "-" : ""),
        value: sIntegerDigits + sFractionDigits,
        currency: sCurrency
    };
};

function customHighPercentFormatter(sInput, iDecimalPlaces) {
    var rPattern = /(\d+)(\d{3})/,
        sTempValue, bConvert, kConvert, iTempValue, sCurrency, decimalLength, fTempValue;
    if (0 === sInput) {
        return {
            sign: "",
            value: 0,
            currency: ""
        };
    } else if (isNaN(sInput) || !sInput) {
        return {
            sign: "N/A"
        };
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 0; // Default value is 0
    }
    fTempValue = parseFloat(sInput);
    if (fTempValue < 0) {
        sInput = -1 * fTempValue;
    }

    // Check for validity of decimal places parameter
    if ((!iDecimalPlaces || isNaN(iDecimalPlaces)) && iDecimalPlaces !== 0) {
        iDecimalPlaces = 2; // Default value is 2
    }
    sTempValue = sInput.toString();

    if (-1 !== sTempValue.indexOf(".")) {
        decimalLength = sTempValue.substring(sTempValue.indexOf(".") + 1).length;
        if (iDecimalPlaces < decimalLength) {
            sTempValue = sInput.toFixed(iDecimalPlaces).toString();
        }
    }
    var aDigits = sTempValue.split("."),
        sIntegerDigits = aDigits[0],
        sFractionDigits = aDigits.length > 1 ? "." + aDigits[1] : "";

    // Converting thousand to M
    bConvert = false, kConvert = false, iTempValue = parseInt(sIntegerDigits), sCurrency = "";
    if (iTempValue >= 100000000) {
        sIntegerDigits = iTempValue / 1000000000;
        sCurrency = "B";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 100000000 && iTempValue >= 100000) {
        sIntegerDigits = iTempValue / 1000000;
        sCurrency = "M";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    } else if (iTempValue < 100000 && iTempValue >= 100) {
        sIntegerDigits = iTempValue / 1000;
        sCurrency = "K";
        sFractionDigits = "";
        sIntegerDigits = sIntegerDigits.toFixed(iDecimalPlaces).toString();
    }

    while (rPattern.test(sIntegerDigits)) {
        sIntegerDigits = sIntegerDigits.replace(rPattern, "$1" + "," + "$2");
    }
    return {
        sign: ((fTempValue < 0) ? "-" : ""),
        value: sIntegerDigits + sFractionDigits,
        currency: sCurrency
    };
};

// parseCustomBarChart: Renders bar chart and corresponding cell value
function parseCustomBarChart(cellValue, oRowJsonObject, oFormatterOptions) {
    var fMax = 1,
        sField, sNumberFormatter, fPercentValue = 0,
        sReturnValue, sBgColor, funFormatter, sCustomBarChartTemplate = "<div class='CustomerBarChartValue'>{2}</div><div style='width:{a}px' class='CustomerBarChart_Container'><div class='CustomerBarChart_{0}' style='width:{1}%; height:20px {3}'></div></div>",
        fParentWidth = 0;

    if (oFormatterOptions) {
        fMax = oFormatterOptions.maxValue;
        sField = oFormatterOptions.field;
        sNumberFormatter = oFormatterOptions.numberFormatter;
    }
    fParentWidth = (oFormatterOptions.fCell).replace("px", "").replace("%", "");

    if (!sNumberFormatter) {
        funFormatter = window["thousandFormatter"];
    } else {
        funFormatter = window[sNumberFormatter];
    }
    if (!cellValue || isNaN(parseFloat(cellValue))) {
        sReturnValue = sCustomBarChartTemplate.replace("{0}", sField).replace("{1}", "0").replace("{2}", "N/A").replace("{3}", "");
    } else {
        fPercentValue = parseFloat((parseFloat(cellValue) / fMax * 100).toFixed(2));
        if (oRowJsonObject.colorStyle && -1 !== oRowJsonObject.colorStyle.columnName.indexOf(sField)) {
            sBgColor = oRowJsonObject.colorStyle.color[oRowJsonObject.colorStyle.columnName.indexOf(sField)];
            sReturnValue = sCustomBarChartTemplate.replace("{0}", sField).replace("{1}", fPercentValue.toString()).replace("{2}", funFormatter(cellValue, 1)).replace("{3}", "; background-color:" + sBgColor).replace("{a}", (fParentWidth - 95).toString());
        } else {
            sReturnValue = sCustomBarChartTemplate.replace("{0}", sField + " CustomerBarChart_SingleColor").replace("{1}", fPercentValue.toString()).replace("{2}", funFormatter(cellValue, 1)).replace("{3}", "").replace("{a}", (fParentWidth - 105).toString());
        }
    }
    return sReturnValue;
}

// stringToDateFormatter: Converts the string passed into d-mmm-yy format
function stringToDateFormatter(sInput) {
    if (sInput) {
        var dInputDate = new Date(sInput);
        if ("Invalid Date" !== dInputDate.toDateString()) {
            return formatDateFunction(dInputDate, "d-mmm-yy");
        }
        return "N/A";
    }
    return "N/A";
}

// stringToNumericalDateFormatter: Converts the string passed into mm/dd/yyyy format
function stringToNumericalDateFormatter(sInput) {
    if (sInput) {
        var dInputDate = new Date(sInput);
        if ("Invalid Date" !== dInputDate.toDateString()) {
            return formatDateFunction(dInputDate, "m/d/yyyy");
        }
        return "N/A";
    }
    return "N/A";
}

// stringToDateFormatter: Converts the string passed into mmm d, yyyy format
function customStringToDateFormatter(sInput) {
    if (sInput) {
        var dInputDate = new Date(sInput);
        if ("Invalid Date" !== dInputDate.toDateString()) {
            return formatDateFunction(dInputDate, "mmm d, yyyy");
        }
        return "N/A";
    }
    return "N/A";
}

// insertCommasWithRevenueFormatter: Returns data in format $x,xxx,xxx.xx
function insertCommasWithRevenueFormatter(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "$0";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        var sTempValue = insertCommasOnly(sInput, iDecimalPlaces);
        return ((parseFloat(sTempValue) < 0) ? "-$" + sTempValue.substr(1) : "$" + sTempValue);
    }
}

// insertRevenueWithTwoPlaces: Returns data with 2 decimal places in format $xxx.xxK/M/B
function insertRevenueWithTwoPlaces(sInput) {
    if (0 === parseFloat(sInput)) {
        return "$0";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return revenueFormatter(sInput, 2);
    }
}

// insertRevenueWithTwoPlaces: Returns data with 2 decimal places in format $xxx.xxK/M/B
function insertPercentageWithTwoPlaces(sInput) {
    if (0 === parseFloat(sInput)) {
        return "0%";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return insertPercentageOnly(sInput, 2);
    }
}

// insertPercentageWithOnePlace: Returns data with 1 decimal place in format xx.x%
function insertPercentageWithOnePlace(sInput) {
    if (0 === parseFloat(sInput)) {
        return "0%";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return insertPercentageOnly(sInput, 1);
    }
}

// thousandFormatterWithOnePlace: Returns data with 1 decimal place in format xx.x%
function thousandFormatterWithOnePlace(sInput) {
    if (0 === parseFloat(sInput)) {
        return "0";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        return thousandFormatter(sInput, 1);
    }
}

// Add ellipsis after maxLength of characters
function trimMultiLine(sInput, maxLength) {
    if (!maxLength) {
        maxLength = 50; // Default is 25
    }
    var sOutput = sInput;
    if (sOutput.length > maxLength) {
        sOutput = sOutput.substr(0, maxLength - 3) + "...";
    }
    return sOutput;
}

/// <disable>JS2025.InsertSpaceBeforeCommentText</disable>
// insertCompetitorByRevLossFormatter: Returns data in format $x,xxx,xxx.x
function insertCompetitorByRevLossFormatter(sInput, iDecimalPlaces) {
    if (0 === parseFloat(sInput)) {
        return "$0";
    } else if (!sInput || isNaN(parseFloat(sInput))) {
        return "N/A";
    } else {
        var sTempValue = insertCommasOnly(sInput, 1);
        return ((parseFloat(sTempValue) < 0) ? "-$" + sTempValue.substr(1) : "$" + sTempValue);
    }
}
//# sourceMappingURL=formatters.js.map



/// <disable>S1003.SemanticAnalysisHalted,JS3092.DeclarePropertiesBeforeUse,JS2032.PlaceLiteralsOnRightSideInComparisons,JS3057.AvoidImplicitTypeCoercion,JS3054.NotAllCodePathsReturnValue</disable>
/// <dictionary target='member'>Config,sortby,sortorder,viewrecords,oParam, Param, aTrs</dictionary>
/// <dictionary target='variable'>arr,Config</dictionary>
// Count without suppression: 292.
// JS Cop count: 2; September 3, 2014.
// Current JS Cop count: 2; September 8, 2014.
var MAQ = {};
var pageid;
if ("undefined" === typeof oGridConstants) {
    var oGridConstants = {
        sNAN: "NaN",
        sNA: "N/A",
        sParseDate: "parseDate",
        sParseDollar: "parseUSD",
        sParseInteger: "parseInteger",
        sParseFloat: "parseDecimal",
        sParseString: "parseString",
        sParseSalesStage: "parseSalesStage",
        sError: "Unable to copy oObject! Its type isn't supported.",
        sFunction: "function",
        sPaginationText: "Jump to",
        sDefaultWidth: "250px",
        iDropDownLimit: 20
    };
}
MAQ.gridName = [];
MAQ.gridObject = [];

function newRecords(oElement, sGridName) {
    if (oElement) {
        if (!oElement.getAttribute("data-pageId")) {
            oElement = oElement.childNodes[0];
        }
        if (oElement.getAttribute("data-pageId")) {
            pageid = oElement.getAttribute('data-pageid');
            if (document.getElementsByClassName("ListOptionContainer") && document.getElementsByClassName("ListOptionContainer")[0])
                document.getElementsByClassName("ListOptionContainer")[0].value = pageid;
            var iGridObjectPosition = MAQ.gridName.indexOf(sGridName),
                iCurrentPage = parseInt(oElement.getAttribute("data-pageId")),
                iLastPage = parseInt(MAQ.gridObject[iGridObjectPosition].totalPages) + 1;
            MAQUtility.addClass(oElement, "SelectedPage");
            if (iCurrentPage) {
                MAQ.getPage(iCurrentPage, iLastPage, MAQ.gridObject[iGridObjectPosition]);
            }
        }
    }
}
MAQ.getAdjustedRowChunk = function(inputData, width) {
    return '<div class="jsonGridOverflow" title="' + inputData + '" style="width: ' + width + 'px;">' + inputData + "</div>";
};
MAQ.getAdjustedRowChunkAndToolTip = function(inputData, width) {
    width = width || "100";
    width = width.replace("%", "").replace("px", "");
    return '<span class="jsonGridOverflow" title="' + inputData + '" style="width: ' + (width - 15 >= 15 ? width - 15 : 15) + 'px;">' + inputData + "</span>";
};
MAQ.setViewRecords = function(oCurrentGridConfiguration) {
    /// <disable>JS3058</disable>
    var oGridElement = document.getElementById(oCurrentGridConfiguration.gridName),
        oViewRecords = document.getElementById(oCurrentGridConfiguration.gridName + "_ViewRecords"),
        iCurrentPage = (parseInt(oCurrentGridConfiguration.currentPage) || 0) + 1,
        iLastPage = (parseInt(oCurrentGridConfiguration.totalPages) || 0) + 1,
        iIterator, iStartIndex = 1,
        oElementDropDown = oGridElement.querySelector(".ListOption[data-pageId='" + iCurrentPage + "']"),
        iTotalPages = 0;

    MAQUtility.removeClass(oGridElement.querySelectorAll(".PageListItem"), "SelectedPage");
    MAQUtility.removeClass(oGridElement.querySelectorAll(".ListOption"), "SelectedPage");
    MAQUtility.addClass(oGridElement.querySelector(".PageListItem[data-pageId='" + iCurrentPage + "']"), "SelectedPage");
    MAQUtility.addClass(oElementDropDown, "SelectedPage");
    if (oElementDropDown) {
        oElementDropDown.selected = true;
    }

    // Create Pagination list
    iTotalPages = iLastPage < (iCurrentPage + 4) ? iLastPage : (iCurrentPage + 4);
    MAQ.generatePageList(oCurrentGridConfiguration, iCurrentPage, iTotalPages);
    if (oCurrentGridConfiguration.serverGrid.enabled) {
        var oHiddenContainer = document.getElementById(oCurrentGridConfiguration.container + "_hidden");
        if (oHiddenContainer) {
            oHiddenContainer.setAttribute("data-currentPage", oCurrentGridConfiguration.currentPage);
        }
        MAQ.callService(oCurrentGridConfiguration);
    } else {
        MAQ.populateGrid(oCurrentGridConfiguration);
    }
};

// Generate page list to be displayed in pagination control
MAQ.generatePageList = function(oCurrentGridConfiguration, iCurrentPage, iTotalPages) {
    var oGridElement = document.getElementById(oCurrentGridConfiguration.container),
        oPage, oPageList = oGridElement.querySelector(".ViewRecordDiv > div"),
        iIterator = 0,
        iStartIndex = 1;

    // Change page numbers
    if (oPageList) {
        // Clear existing page list
        $(oPageList).html("");
        iStartIndex = (((iTotalPages - 4) > 0) && iCurrentPage >= (iTotalPages - 4)) ? iTotalPages - 4 : iCurrentPage;
        iStartIndex = iTotalPages <= 5 ? 1 : iStartIndex;
        for (iIterator = iStartIndex; iIterator <= iTotalPages; iIterator++) {
            // Regenerate pages
            oPage = document.createElement("div");
            oPage.innerText = insertCommasOnly(iIterator, 0);
            if (iIterator === iCurrentPage) {
                MAQUtility.addClass(oPage, "SelectedPage");
            }
            MAQUtility.addClass(oPage, "PageListItem");
            oPage.setAttribute("data-pageId", iIterator);
            oPage.setAttribute("onclick", "newRecords(this,'" + oCurrentGridConfiguration.gridName + "')");
            oPageList.appendChild(oPage);
        }
    }
};
MAQ.getPage = function(iCurrentPageNum, iLastPageNum, oCurrentGridConfiguration) {
    var iCurrentPage = iCurrentPageNum,
        iLastPage = iLastPageNum,
        oFirst = document.getElementById(oCurrentGridConfiguration.gridName + "_First"),
        oLast = document.getElementById(oCurrentGridConfiguration.gridName + "_Last");
    if (iCurrentPage <= 1) {
        MAQ.goFirst(oFirst, oCurrentGridConfiguration.gridName);
    } else if (iCurrentPage >= iLastPage) {
        MAQ.goLast(oLast, oCurrentGridConfiguration.gridName);
    } else {
        // Go to respective page
        oCurrentGridConfiguration.currentPage = iCurrentPageNum - 1;
        if (!oCurrentGridConfiguration.serverGrid.enabled) {
            MAQ.enablePrev(oCurrentGridConfiguration.gridName);
            MAQ.enableNext(oCurrentGridConfiguration.gridName);
        }
        MAQ.setViewRecords(oCurrentGridConfiguration);
    }
};
MAQ.populateGrid = function(oCurrentGridConfiguration) {
    var htmlGridObject = oCurrentGridConfiguration.gridObject,
        numberOfRows, rowCounter, iRowsRight;
    if (htmlGridObject) {
        numberOfRows = oCurrentGridConfiguration.tblBody.rows.length;
        for (rowCounter = 0; rowCounter < numberOfRows; rowCounter += 1) {
            oCurrentGridConfiguration.tblBody.deleteRow(-1);
        }
        if (oCurrentGridConfiguration.fixedHeaderEnd) {
            for (rowCounter = 0; rowCounter < numberOfRows; rowCounter += 1) {
                oCurrentGridConfiguration.tblBodyRight.deleteRow(-1);
            }
        }
        MAQ.CreateHTMLTableRow(oCurrentGridConfiguration);
        oCurrentGridConfiguration.callBackFunc && oCurrentGridConfiguration.callBackFunc();
    }
};
MAQ.disablePrev = function(sGridName) {
    var previous = document.getElementById(sGridName + "_Prev");
    MAQUtility.addClass(previous, "click-disabled");
};
MAQ.enablePrev = function(sGridName) {
    var previous = document.getElementById(sGridName + "_Prev");
    MAQUtility.removeClass(previous, "click-disabled");
};
MAQ.disableNext = function(sGridName) {
    var next = document.getElementById(sGridName + "_Next");
    MAQUtility.addClass(next, "click-disabled");
};
MAQ.enableNext = function(sGridName) {
    var next = document.getElementById(sGridName + "_Next");
    MAQUtility.removeClass(next, "click-disabled");
};
MAQ.goLast = function(oElement, sGridName) {
    var gridObjectPosition, oCurrentGridConfiguration;
    if (!MAQUtility.hasClass(oElement, "click-disabled")) {
        if (MAQ.gridName.length) {
            gridObjectPosition = MAQ.gridName.indexOf(sGridName);
            if (-1 < gridObjectPosition) {
                oCurrentGridConfiguration = MAQ.gridObject[gridObjectPosition];
                oCurrentGridConfiguration.currentPage = oCurrentGridConfiguration.totalPages;
                MAQ.setViewRecords(oCurrentGridConfiguration);
                if (!oCurrentGridConfiguration.serverGrid.enabled) {
                    MAQ.disableNext(oCurrentGridConfiguration.gridName);
                    MAQ.enablePrev(oCurrentGridConfiguration.gridName);
                }
            }
        }
    }
};
MAQ.goFirst = function(oElement, sGridName) {
    var gridObjectPosition, oCurrentGridConfiguration;
    if (!MAQUtility.hasClass(oElement, "click-disabled")) {
        if (MAQ.gridName.length) {
            gridObjectPosition = MAQ.gridName.indexOf(sGridName);
            if (-1 < gridObjectPosition) {
                oCurrentGridConfiguration = MAQ.gridObject[gridObjectPosition];
                oCurrentGridConfiguration.currentPage = 0;
                MAQ.setViewRecords(oCurrentGridConfiguration);
                if (!oCurrentGridConfiguration.serverGrid.enabled) {
                    MAQ.disablePrev(oCurrentGridConfiguration.gridName);
                    MAQ.enableNext(oCurrentGridConfiguration.gridName);
                    MAQ.populateGrid(oCurrentGridConfiguration);
                }
            }
        }
    }
};
MAQ.goPrevious = function(oElement, sGridName) {
    var gridObjectPosition, oCurrentGridConfiguration;
    if (!MAQUtility.hasClass(oElement, "click-disabled")) {
        if (MAQ.gridName.length > 0) {
            gridObjectPosition = MAQ.gridName.indexOf(sGridName);
            if (-1 < gridObjectPosition) {
                oCurrentGridConfiguration = MAQ.gridObject[gridObjectPosition];
                pageid = oCurrentGridConfiguration.currentPage;
                if (document.getElementsByClassName("ListOptionContainer") && document.getElementsByClassName("ListOptionContainer")[0])
                    document.getElementsByClassName("ListOptionContainer")[0].value = pageid;
                oCurrentGridConfiguration.currentPage = parseInt(oCurrentGridConfiguration.currentPage.toString()) - 1;
                MAQ.setViewRecords(oCurrentGridConfiguration);
                if (!oCurrentGridConfiguration.serverGrid.enabled) {
                    if (!oCurrentGridConfiguration.currentPage) {
                        MAQ.disablePrev(oCurrentGridConfiguration.gridName);
                        MAQ.enableNext(oCurrentGridConfiguration.gridName);
                    }
                    if (parseInt(oCurrentGridConfiguration.currentPage.toString()) > 0) {
                        MAQ.enableNext(oCurrentGridConfiguration.gridName);
                    }
                }
            }
        }
    }
};
MAQ.goNext = function(oElement, sGridName) {
    var gridObjectPosition, oCurrentGridConfiguration;
    if (!MAQUtility.hasClass(oElement, "click-disabled")) {
        if (MAQ.gridName.length > 0) {
            gridObjectPosition = MAQ.gridName.indexOf(sGridName);
            if (-1 < gridObjectPosition) {
                oCurrentGridConfiguration = MAQ.gridObject[gridObjectPosition];
                oCurrentGridConfiguration.currentPage = parseInt(oCurrentGridConfiguration.currentPage.toString()) + 1;
                pageid = oCurrentGridConfiguration.currentPage + 1;
                if (document.getElementsByClassName("ListOptionContainer") && document.getElementsByClassName("ListOptionContainer")[0])
                    document.getElementsByClassName("ListOptionContainer")[0].value = pageid;
                MAQ.setViewRecords(oCurrentGridConfiguration);
                if (!oCurrentGridConfiguration.serverGrid.enabled) {
                    if (oCurrentGridConfiguration.currentPage > 0) {
                        MAQ.enablePrev(oCurrentGridConfiguration.gridName);
                    }
                    if (oCurrentGridConfiguration.currentPage === oCurrentGridConfiguration.totalPages) {
                        MAQ.disableNext(oCurrentGridConfiguration.gridName);
                        MAQ.enablePrev(oCurrentGridConfiguration.gridName);
                    }
                }
            }
        }
    }
};

// Check if text input is a number and call method to navigate to requested page
function isNumber(event, oElement, sGridName) {
    var iCharCode;
    event = (event) ? event : window.event;
    iCharCode = (event.which) ? event.which : event.keyCode;
    if (iCharCode > 31 && iCharCode !== 13 && (iCharCode < 48 || iCharCode > 57)) {
        return false;
    } else {
        MAQ.goToPage(iCharCode, oElement, sGridName);
    }
    return true;
}

// Navigate to page entered in text box
MAQ.goToPage = function(iCharCode, oElement, sGridName) {
    var iCurrentPage, iGridIndex, iLastPage = 0,
        oCurrentGridConfig;
    if (oElement && oElement.value) {
        iCurrentPage = parseInt(oElement.value);
        if (iCharCode === 13 && iCurrentPage) {
            if (MAQ.gridObject.length && MAQ.gridObject.length) {
                iGridIndex = MAQ.gridName.indexOf(sGridName + "_Grid");
                if (-1 < iGridIndex) {
                    oCurrentGridConfig = MAQ.gridObject[iGridIndex];
                    iLastPage = oCurrentGridConfig.totalPages + 1;
                    MAQ.getPage(iCurrentPage, iLastPage, oCurrentGridConfig);
                }
            }
        }
    }
};
MAQ.sortDataWithinGroup = function(oGridConfiguration, sFieldName, sSortFlag, sSortType) {
    var iCount = 0,
        iTotal = oGridConfiguration.groupedRowHeader.groupHeaderName.length,
        iInnerCount = 0,
        iInnerTotal = oGridConfiguration.data.length,
        arrTemp = [],
        arrSortedMerged = [];
    if (oGridConfiguration) {
        for (iCount = 0; iCount < iTotal; iCount++) {
            arrTemp = [];
            for (iInnerCount = 0; iInnerCount < iInnerTotal; iInnerCount++) {
                if (oGridConfiguration.groupedRowHeader.groupHeaderName[iCount] === oGridConfiguration.data[iInnerCount].groupHeaderName) {
                    arrTemp.push(MAQUtility.clone(oGridConfiguration.data[iInnerCount]));
                }
            }
            arrSortedMerged = arrSortedMerged.concat(MAQUtility.clone(arrTemp.sort(MAQUtility.sortBy(sFieldName, sSortFlag, sSortType))));
        }
        oGridConfiguration.data = MAQUtility.clone(arrSortedMerged);
    }
    return oGridConfiguration;
};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
MAQ.sortJsonGrid = function(cellObject, sGridName, fieldName) {
    var gridObjectPosition, sortOrder, sortFlag, oCurrentGridConfiguration, columnCounter, sortType = String,
        sortKey = "",
        oSortIndicators, iCount, oArrow;
    if (MAQ.gridName.length > 0) {
        pageid = 1;
        if (document.getElementsByClassName("ListOptionContainer") && document.getElementsByClassName("ListOptionContainer")[0])
            document.getElementsByClassName("ListOptionContainer")[0].value = 1;
        gridObjectPosition = MAQ.gridName.indexOf(sGridName);
        if (-1 < gridObjectPosition) {
            sortOrder = cellObject.getAttribute("sortorder");
            sortKey = cellObject.getAttribute("sortkey");
            sortFlag = false;
            if ("asc" === sortOrder) {
                sortFlag = true;
                cellObject.setAttribute("sortorder", "desc");
            } else {
                cellObject.setAttribute("sortorder", "asc");
            }
            oCurrentGridConfiguration = MAQ.gridObject[gridObjectPosition];
            oCurrentGridConfiguration.gridSort.sortby = fieldName;

            if (oCurrentGridConfiguration.serverGrid.enabled) {
                // Call service in case of service side grid
                var oHiddenContainer = document.getElementById(oCurrentGridConfiguration.container + "_hidden");
                if (oHiddenContainer) {
                    // Update sort order and sort by data values in hidden chunk
                    oHiddenContainer.setAttribute("data-sortOrder", sortOrder);
                    oHiddenContainer.setAttribute("data-sortKey", sortKey);
                    oHiddenContainer.setAttribute("data-sortBy", fieldName);
                    oHiddenContainer.setAttribute("data-currentPage", "0");
                }
                oCurrentGridConfiguration.currentPage = 0;
                MAQ.callService(oCurrentGridConfiguration);
            } else {
                for (columnCounter in oCurrentGridConfiguration.columnHeader) {
                    if (oCurrentGridConfiguration.columnHeader[columnCounter].name === fieldName && oCurrentGridConfiguration.columnHeader[columnCounter].sortType) {
                        if (oCurrentGridConfiguration.columnHeader[columnCounter].sortAttribute) {
                            fieldName = oCurrentGridConfiguration.columnHeader[columnCounter].sortAttribute;
                        }
                        sortType = oCurrentGridConfiguration.columnHeader[columnCounter].sortType;
                    }
                }
                if (oCurrentGridConfiguration.groupedRows && oCurrentGridConfiguration.groupedRowHeader && oCurrentGridConfiguration.groupedRowHeader.groupHeaderName) {
                    oCurrentGridConfiguration = MAQ.sortDataWithinGroup(oCurrentGridConfiguration, fieldName, sortFlag, sortType);
                } else {
                    oCurrentGridConfiguration.data.sort(MAQUtility.sortBy(fieldName, sortFlag, sortType));
                }
                oCurrentGridConfiguration.gridSort.sortby = fieldName;
                oSortIndicators = document.querySelectorAll("#" + sGridName + " .SortIndicator");
                for (iCount = 0; iCount < oSortIndicators.length; iCount++) {
                    MAQUtility.addClass(oSortIndicators[iCount], "itemHide");
                }
                oSortIndicators = document.querySelectorAll("#" + sGridName + "_right .SortIndicator");
                for (iCount = 0; iCount < oSortIndicators.length; iCount++) {
                    MAQUtility.addClass(oSortIndicators[iCount], "itemHide");
                }
                MAQUtility.removeClass(document.querySelector("#" + sGridName + "Head .jsonGridHeaderAlternate"), "jsonGridHeaderAlternate");
                oArrow = cellObject.querySelector("." + fieldName.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~ ]/g, '_') + "Hand");
                if ("asc" === cellObject.getAttribute("sortorder")) {
                    $(oArrow).html('<span class="desc"></span>');
                    MAQUtility.removeClass(oArrow, "itemHide");
                } else {
                    $(oArrow).html('<span class="asc"></span>');
                    MAQUtility.removeClass(oArrow, "itemHide");
                }
                MAQUtility.addClass(oArrow.parentNode, "jsonGridHeaderAlternate");
                if (!oCurrentGridConfiguration.pagination.retainPageOnSort && oCurrentGridConfiguration.totalPages) {
                    oCurrentGridConfiguration.currentPage = 0;
                    MAQ.setViewRecords(oCurrentGridConfiguration);
                    MAQ.disablePrev(oCurrentGridConfiguration.gridName);
                    MAQ.enableNext(oCurrentGridConfiguration.gridName);
                } else {
                    MAQ.populateGrid(oCurrentGridConfiguration);
                }
            }
        }
    }
};
MAQ.CreatePaginationControl = function(GridConfiguration) {
    var paginationSpaceRow = GridConfiguration.tblFoot.insertRow(0),
        row = GridConfiguration.tblFoot.insertRow(1),
        rightRow, leftGrid, rightGrid, rightSpaceCell, spaceCell = paginationSpaceRow.insertCell(0),
        cell = row.insertCell(0),
        oPaginationContainer = document.createElement("div"),
        oPreviousDiv = document.createElement("div"),
        oViewRecords = document.createElement("div"),
        oNextDiv = document.createElement("div"),
        oLabel = document.createElement("div"),
        oDropDownContainer = document.createElement("div"),
        oTotalPagesLabel = document.createElement("div"),
        oPageList = document.createElement("div"),
        iIterator, oPage, oListOptionContainerParent = document.createElement("div"),
        oListOptionContainer, oListOption, oSelectedElement, iDropDownWidth = 0,
        iCurrentPage = GridConfiguration.currentPage + 1,
        iLastPage = parseInt(GridConfiguration.totalPages) + 1,
        iTotalPages = 0;
    oListOptionContainer = (iLastPage > oGridConstants.iDropDownLimit) ? document.createElement("input") : document.createElement("select");
    oTotalPagesLabel.innerText = " of " + insertCommasOnly(iLastPage, 0);
    MAQUtility.addClass(oTotalPagesLabel, "jsonFooterLabel totalPagesLabel");

    if (GridConfiguration.fixedHeaderEnd) {
        if (GridConfiguration.containerObject.clientWidth - GridConfiguration.tblBody.clientWidth >= GridConfiguration.tblBodyRight.clientWidth) {
            rightRow = GridConfiguration.tblFootRight.insertRow(-1);
            rightSpaceCell = rightRow.insertCell(0);
            rightSpaceCell.colSpan = GridConfiguration.columnHeader.length;
            MAQUtility.addClass(rightSpaceCell, "jsonPaginationMargin");
            rightRow = GridConfiguration.tblFootRight.insertRow(-1);
            rightSpaceCell = rightRow.insertCell(0);
            rightSpaceCell.colSpan = GridConfiguration.columnHeader.length;
            MAQUtility.addClass(rightSpaceCell, "jsonFooter");
        } else {
            leftGrid = document.querySelector("#" + GridConfiguration.container + " .LeftGrid");
            rightGrid = document.querySelector("#" + GridConfiguration.container + " .RightGrid");
            rightGrid.style.height = rightGrid.clientHeight + (leftGrid.clientHeight - rightGrid.clientHeight + 29) + "px";
            MAQUtility.addClass(rightGrid, "paginationBorder");
        }
    }

    // Update properties of pagination space
    spaceCell.colSpan = GridConfiguration.columnHeader.length;
    MAQUtility.addClass(spaceCell, "jsonPaginationMargin");

    // Cell containing the pagination content
    cell.colSpan = GridConfiguration.columnHeader.length;
    oLabel.innerText = oGridConstants.sPaginationText;
    MAQUtility.addClass(oLabel, "jsonFooterLabel");
    if (!GridConfiguration.isWin8App) {
        // Disable previous only if current page is 0 i.e., first page
        if (0 === GridConfiguration.currentPage) {
            $(oPreviousDiv).html('<span id="' + GridConfiguration.gridName + '_Prev" class="prev cur-pointer click-disabled" active="1" onclick="MAQ.goPrevious(this,\'' + GridConfiguration.gridName + '\')"><</span>');
        } else {
            $(oPreviousDiv).html('<span id="' + GridConfiguration.gridName + '_Prev" class="prev cur-pointer" active="1" onclick="MAQ.goPrevious(this,\'' + GridConfiguration.gridName + '\')"><</span>');
        }
        if (iLastPage - 1 !== GridConfiguration.currentPage) {
            $(oNextDiv).html('<span id="' + GridConfiguration.gridName + '_Next" class="next cur-pointer" active="0" onclick="MAQ.goNext(this,\'' + GridConfiguration.gridName + '\')">></span>');
        }
    } else {
        MSApp.execUnsafeLocalFunction(function() {
            if (0 === GridConfiguration.currentPage) {
                WinJS.Utilities.setInnerHTML(oPreviousDiv, '<span id="' + GridConfiguration.gridName + '_Prev" class="prev cur-pointer click-disabled" active="1" width="24" onclick="MAQ.goPrevious(this,\'' + GridConfiguration.gridName + '\')"><</span>');
            } else {
                WinJS.Utilities.setInnerHTML(oPreviousDiv, '<span id="' + GridConfiguration.gridName + '_Prev" class="prev cur-pointer" active="1" width="24" onclick="MAQ.goPrevious(this,\'' + GridConfiguration.gridName + '\')"><</span>');
            }
            WinJS.Utilities.setInnerHTML(oNextDiv, '<span id="' + GridConfiguration.gridName + '_Next" class="next cur-pointer" active="0" width="24" onclick="MAQ.goNext(this,\'' + GridConfiguration.gridName + '\')">></span>');
        });
    }
    oPreviousDiv.className = "PaginationPrevArrowDiv";
    oViewRecords.id = GridConfiguration.gridName + "_ViewRecords";
    MAQUtility.addClass(oViewRecords, "ViewRecordDiv");
    oDropDownContainer.id = GridConfiguration.gridName + "_DropDownRecords";
    MAQUtility.addClass(oDropDownContainer, "DropDownRecords");
    if (!GridConfiguration.viewrecords) {
        oViewRecords.style.visibility = "hidden";
    }

    oNextDiv.className = "PaginationNextArrowDiv";
    oPaginationContainer.className = "jsonGridFooter";
    oPaginationContainer.appendChild(oPreviousDiv);
    oPaginationContainer.appendChild(oViewRecords);
    oPaginationContainer.appendChild(oNextDiv);
    oPaginationContainer.appendChild(oLabel);
    oPaginationContainer.appendChild(oDropDownContainer);
    oPaginationContainer.appendChild(oTotalPagesLabel);
    cell.appendChild(oPaginationContainer);
    MAQUtility.addClass(cell, "jsonFooter");

    // Create Page List
    if (oViewRecords) {
        if (!GridConfiguration.isWin8App) {
            oViewRecords.appendChild(oPageList);
        } else {
            MSApp.execUnsafeLocalFunction(function() {
                WinJS.Utilities.setInnerHTML(oViewRecords, oPageList.innerHTML);
            });
        }
        iTotalPages = iLastPage < (iCurrentPage + 4) ? iLastPage : (iCurrentPage + 4);
        MAQ.generatePageList(GridConfiguration, iCurrentPage, iTotalPages);
    }

    // Create drop down
    MAQUtility.addClass(oListOptionContainerParent, "ListOptionContainerParent");
    MAQUtility.addClass(oListOptionContainer, "ListOptionContainer");

    oListOptionContainerParent.appendChild(oListOptionContainer);
    oDropDownContainer.appendChild(oListOptionContainerParent);
    if (iLastPage > oGridConstants.iDropDownLimit) {
        // Create text box
        oListOptionContainer.type = "text";
        oListOptionContainer.value = parseInt(GridConfiguration.currentPage) + 1;
        oListOptionContainer.setAttribute("onkeypress", "isNumber(event,this,'" + GridConfiguration.container + "')");
    } else {
        for (iIterator = 1; iIterator <= iLastPage; iIterator++) {
            oListOption = document.createElement("option");
            oListOption.innerText = iIterator;
            MAQUtility.addClass(oListOption, "ListOption");
            oListOption.setAttribute("data-pageId", iIterator.toString());
            oListOption.setAttribute("onclick", "newRecords(this,'" + GridConfiguration.gridName + "')");
            oListOptionContainer.appendChild(oListOption);
        }
        oSelectedElement = document.querySelector("#" + GridConfiguration.gridName + " .ListOption[data-pageId='" + iCurrentPage + "']");
        MAQUtility.addClass(oSelectedElement, "SelectedPage");
        oSelectedElement.selected = true;
    }
    if (GridConfiguration.pagination.maxRows && GridConfiguration.pagination.maxRows > GridConfiguration.data.length) {
        if (!GridConfiguration.serverGrid.enabled) {
            MAQUtility.addClass(document.querySelector("#" + GridConfiguration.gridName + "_Last"), "click-disabled");
            MAQ.disableNext(GridConfiguration.gridName);
        }
    }
};

MAQ.setDrillDown = function(sCellValue, iCurrentRow, oGridConfiguration, bEndRow) {
    var oDrillCellContainer = document.createElement("div"),
        oDrillCell = document.createElement("div"),
        iDrillIterator, iDrillDownCounter = 0,
        oRow, oDrillObject = [],
        oRowRight, level;
    MAQUtility.addClass(oDrillCell, "DrillExpandCell");
    MAQUtility.addClass(oDrillCell, "DrillExpandIcon");
    MAQUtility.addClass(oDrillCell, "HandIcon");
    for (iDrillIterator = 0; iDrillIterator < oGridConfiguration.columnHeader.length; iDrillIterator++) {
        if (bEndRow) {
            oDrillObject.push(oGridConfiguration.endRow.data[oGridConfiguration.columnHeader[iDrillIterator].name] || "");
        } else {
            oDrillObject.push(oGridConfiguration.data[iCurrentRow][oGridConfiguration.columnHeader[iDrillIterator].name] || "");
        }
    }
    if (oDrillObject.length) {
        if (oGridConfiguration.drillDown.dataMapping) {
            oDrillCell.setAttribute("data-mapping", oGridConfiguration.data[iCurrentRow][oGridConfiguration.drillDown.dataMapping]);
        } else {
            oDrillCell.setAttribute("data-mapping", oDrillObject);
        }
        if ("undefined" !== oGridConfiguration.inPlaceGrid && oGridConfiguration.inPlaceGrid.level) {
            level = oGridConfiguration.inPlaceGrid.level;
            oDrillCell.setAttribute("data-parent", level + "_Row" + (iCurrentRow + 1));
            oDrillCell.setAttribute("data-parentClass", level);
        }
        oDrillCell.setAttribute("data-currentRow", iCurrentRow + 1);
        oDrillCell.setAttribute("data-productID", oGridConfiguration.data[iCurrentRow]["C" + Object.keys(oGridConfiguration.data[iCurrentRow]).length]);
        oDrillCell.setAttribute("data-firstLoad", 1);
    }
    oDrillCell.setAttribute("data-expanded", "0");
    oDrillCell.setAttribute("onclick", "MAQ.drillDown(this,'" + (oGridConfiguration.drillDown.sDrillDownCall || "") + "','" + oGridConfiguration.container + "','" + oGridConfiguration.sGridName + "')");
    oDrillCellContainer.appendChild(oDrillCell);
    if ("undefined" !== typeof oGridConfiguration.inPlaceGrid) {
        if (oGridConfiguration.inPlaceGrid.enableRowInsert) {
            oRow = oGridConfiguration.tblBody.insertRow(-1);
            if (oGridConfiguration.fixedHeaderEnd) {
                oRowRight = oGridConfiguration.tblBodyRight.insertRow(-1);
            }
            MAQUtility.addClass(oRow, "HiddenSection");
            MAQUtility.addClass(oRowRight, "HiddenSection");
            MAQUtility.addClass(oRow, "InnerRow");
            MAQUtility.addClass(oRowRight, "InnerRow");
            oDrillCell = oRow.insertCell(0);
        }
    }

    if (oGridConfiguration.fixedHeaderEnd) {
        oDrillCell.setAttribute("colspan", oGridConfiguration.fixedHeaderEnd);
        oDrillCell = oRowRight.insertCell(0);
        oDrillCell.setAttribute("colspan", oGridConfiguration.columnHeader.length - oGridConfiguration.fixedHeaderEnd + iDrillDownCounter);
    } else {
        oDrillCell.setAttribute("colspan", oGridConfiguration.columnHeader.length + iDrillDownCounter);
    }
    return $(oDrillCellContainer).html() + sCellValue;
};
MAQ.CreateHTMLTableRow = function(GridConfiguration) {
    /// <disable>JS3058</disable>
    var startIndex, endIndex, cell = null,
        cellCounter, drillCounter = 0,
        numberOfColumns = GridConfiguration.columnHeader.length,
        oCurrentObject = this,
        sIsNegativeLevel = "0",
        iInnerCounter = 0,
        iEndIndex, iCounter, row, iCount, iTotal, fMaxValue, fCurrent, sFieldName, cellBlank, innerRow, staticRow, iGroupedRowIndex = 0,
        iTotalGroupedRows = 0,
        iCurrentRowIndex = 0,
        bIsGroupedRow = (GridConfiguration.groupedRows && GridConfiguration.groupedRowHeader && GridConfiguration.groupedRowHeader.data),
        oGroupHeaderRow, sGroupHeaderChunk, oFormatterOptions = {},
        iCellCounter, iCellCounterRight, oRowRight, sReturnValue, oStaticHeader, sStaticColumnName, leftGrid, rightGrid, oConfig = {},
        sHeaderName = "",
        iHeaderIndex = 0;
    if (GridConfiguration.serverGrid.enabled) {
        startIndex = 0;
    } else {
        startIndex = GridConfiguration.currentPage * GridConfiguration.pagination.maxRows;
    }
    endIndex = (startIndex + GridConfiguration.pagination.maxRows) <= GridConfiguration.data.length ? (startIndex + GridConfiguration.pagination.maxRows) : GridConfiguration.data.length;
    endIndex = endIndex <= 0 ? GridConfiguration.data.length : endIndex;
    if (GridConfiguration.dataConfiguration.calculateMaximum) {
        MAQ.calculateMinMax(GridConfiguration, startIndex, endIndex);
    }
    oStaticHeader = GridConfiguration.staticHeaderRows;
    sStaticColumnName = oStaticHeader.columnName;
    if (oStaticHeader.enabled) {
        iEndIndex = oStaticHeader.staticHeader.length - 1;
    }
    if (bIsGroupedRow) {
        iTotalGroupedRows = GridConfiguration.groupedRowHeader.data.length;
    }

    if ("undefined" !== GridConfiguration.inPlaceGrid.parentContainer && GridConfiguration.inPlaceGrid.parentContainer) {
        var parentBodyContainer = document.getElementById(GridConfiguration.inPlaceGrid.parentContainer).getElementsByTagName("tbody")[0];
        GridConfiguration.tblBody = parentBodyContainer;
        var appendAfterRowID = (GridConfiguration.gridName.substr(0, GridConfiguration.gridName.lastIndexOf("_")) || ""),
            insert = document.querySelector("#" + GridConfiguration.inPlaceGrid.parentContainer + " #" + appendAfterRowID),
            iParentRowID = insert.id,
            insertRowAt = MAQ.getChildPosition(insert, parentBodyContainer);
    }
    for (this.rowPosition = startIndex; this.rowPosition < endIndex; this.rowPosition += 1) {
        iCellCounter = 0;
        iCellCounterRight = 0;
        iCounter = this.rowPosition;
        if ("undefined" !== GridConfiguration.inPlaceGrid.parentContainer && GridConfiguration.inPlaceGrid.parentContainer) {
            row = insert.parentNode.insertRow(insertRowAt + this.rowPosition + 1);
        } else {
            row = GridConfiguration.tblBody.insertRow(-1);
        }

        if (GridConfiguration.fixedHeaderEnd) {
            oRowRight = GridConfiguration.tblBodyRight.insertRow(-1);
            MAQUtility.addClass(oRowRight, "GridRow");
        }
        iInnerCounter = 0;
        if (oStaticHeader.enabled) {
            iEndIndex = oStaticHeader.staticHeader.length - 1;
        }
        for (iInnerCounter; iInnerCounter <= iEndIndex; iInnerCounter++) {
            if (oStaticHeader.enabled && "0" === oStaticHeader.staticHeader[iInnerCounter][sStaticColumnName]) {
                // Append static header after level 0 is encountered
                if (oStaticHeader.staticHeader[iInnerCounter][sStaticColumnName] === GridConfiguration.data[this.rowPosition][sStaticColumnName]) {
                    staticRow = GridConfiguration.tblBody.insertRow(-1);
                    $(staticRow).html("<td colspan=" + numberOfColumns + " class=" + oStaticHeader.staticHeader[iInnerCounter].className + ">" + oStaticHeader.staticHeader[iInnerCounter].columnText + "</td>");
                    MAQUtility.addClass(staticRow, "GridRow");
                }
            } else if ((iCounter) < (endIndex - 1) && oStaticHeader.enabled && "-1" === oStaticHeader.staticHeader[iInnerCounter][sStaticColumnName]) {
                // Append static header before level -1 is encountered
                if (oStaticHeader.staticHeader[iInnerCounter][sStaticColumnName] === GridConfiguration.data[++iCounter][sStaticColumnName] && "1" !== sIsNegativeLevel) {
                    sIsNegativeLevel = "1";
                    staticRow = GridConfiguration.tblBody.insertRow(-1);
                    $(staticRow).html("<td colspan=" + numberOfColumns + " class=" + oStaticHeader.staticHeader[iInnerCounter].className + ">" + oStaticHeader.staticHeader[iInnerCounter].columnText + "</td>");
                    MAQUtility.addClass(staticRow, "GridRow");
                }
            }
        }
        if (bIsGroupedRow) {
            // Insert group header before first data row
            if ((iCounter === startIndex) || (GridConfiguration.data[iCounter - 1]["groupHeaderName"] !== GridConfiguration.data[iCounter]["groupHeaderName"])) {
                if (iCounter === startIndex) {
                    iGroupedRowIndex = 0;
                    iCurrentRowIndex = 0;
                } else {
                    iCurrentRowIndex = iGroupedRowIndex + iCounter;
                }
                sHeaderName = GridConfiguration.data[iCounter]["groupHeaderName"];
                iHeaderIndex = 0;
                GridConfiguration.groupedRowHeader.data.forEach(function(element) {
                    if (element.name === sHeaderName) {
                        iHeaderIndex = GridConfiguration.groupedRowHeader.data.indexOf(element);
                    }
                });
                oGroupHeaderRow = GridConfiguration.tblBody.insertRow(iCurrentRowIndex);
                $(oGroupHeaderRow).html("<td colspan=" + numberOfColumns + " class='" + GridConfiguration.groupedRowHeader.data[iHeaderIndex].headerClassName + "'>" + GridConfiguration.groupedRowHeader.data[iHeaderIndex].columnText + "</td>");
                MAQUtility.addClass(oGroupHeaderRow, "GroupHeaderRow");
                if (GridConfiguration.groupedRowHeader.data[iHeaderIndex].style) {
                    MAQ.applyStyleToObject(oGroupHeaderRow, GridConfiguration.groupedRowHeader.data[iHeaderIndex].style);
                }
                iGroupedRowIndex++;
            }
        }
        if (!GridConfiguration.rows.alternate) {
            MAQUtility.addClass(row, GridConfiguration.rows.rowClassName || "GridRow");
        } else if (this.rowPosition % 2) {
            MAQUtility.addClass(row, (GridConfiguration.rows.rowClassName || "GridRow") + "_alt");
        } else {
            MAQUtility.addClass(row, GridConfiguration.rows.rowClassName || "GridRow");
        }
        if ("undefined" !== GridConfiguration.inPlaceGrid && GridConfiguration.inPlaceGrid.level) {
            var level = GridConfiguration.inPlaceGrid.level;
            if ("" === GridConfiguration.inPlaceGrid.parentContainer) {
                appendAfterRowID = GridConfiguration.container + "_" + level + "_Row" + (this.rowPosition + 1) + "_";
                row.setAttribute("id", appendAfterRowID);
            } else {
                var sAllParentContainer = level + "_Row" + (this.rowPosition + 1) + iParentRowID;
                row.setAttribute("data-rowParentID", appendAfterRowID);
                row.setAttribute("id", sAllParentContainer);
            }

            MAQUtility.addClass(row, level || "GridRow");
        }
        iCount = 0;
        for (cellCounter = 0; cellCounter < numberOfColumns; cellCounter++) {
            if (GridConfiguration.fixedHeaderEnd && parseInt(GridConfiguration.fixedHeaderEnd) <= cellCounter) {
                cell = oRowRight.insertCell(iCellCounterRight++);
            } else {
                cell = row.insertCell(iCellCounter++);
            }
            cell.setAttribute("class", "jsonGridRow");
            cell.style.textAlign = GridConfiguration.columnHeader[cellCounter].align;

            // To add which report to invoke
            if (GridConfiguration.columnHeader[cellCounter]["data-name"]) {
                cell.setAttribute("data-name", GridConfiguration.columnHeader[cellCounter]["data-name"]);
            }

            // Doing this to avoid overlapping of last column values and the scroll bar
            if (GridConfiguration.columnHeader[cellCounter].noOverlap) {
                if (cellCounter === numberOfColumns - 1) {
                    cell.style.paddingRight = String(20) + "px";
                    MAQUtility.addClass(cell, "noOverlap");
                }
            }

            //// TODO: Update code below to add style.
            if (GridConfiguration.altRowColor && this.rowPosition % 2 !== 0) {
                cell.style.backgroundColor = GridConfiguration.altRowColor;
            }
            if (GridConfiguration.columnHeader[cellCounter].style) {
                MAQ.applyStyleToObject(cell, GridConfiguration.columnHeader[cellCounter].style);
            }
            if (!GridConfiguration.columnHeader[cellCounter].formatter) {
                if (GridConfiguration.columnHeader[cellCounter].trimOnOverflow) {
                    sReturnValue = MAQ.getAdjustedRowChunk((GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name] || oGridConstants.sNA), GridConfiguration.columnHeader[cellCounter].style.width);
                } else {
                    if (GridConfiguration.columnHeader[cellCounter].trimOnOverflowAndShowToolTip) {
                        sReturnValue = MAQ.getAdjustedRowChunkAndToolTip((GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name] || oGridConstants.sNA), GridConfiguration.columnHeader[cellCounter].style.width);
                    } else {
                        sReturnValue = (GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name] || oGridConstants.sNA);
                    }
                }
            } else {
                sReturnValue = "";
                if (window[GridConfiguration.columnHeader[cellCounter].formatter] || GridConfiguration.columnHeader[cellCounter].formatter === "trimOnOverflowAndShowToolTip") {
                    switch (GridConfiguration.columnHeader[cellCounter].formatter) {
                        case "parseCustomBarChart":
                            iCount = 0, iTotal = 0, fMaxValue = 1, fCurrent = 0, sFieldName = GridConfiguration.columnHeader[cellCounter].name;
                            if (GridConfiguration.data.length) {
                                iTotal = GridConfiguration.data.length;
                                for (iCount = 0; iCount < iTotal; iCount++) {
                                    fCurrent = parseFloat(GridConfiguration.data[iCount][sFieldName]);
                                    if (!bIsGroupedRow || GridConfiguration.data[this.rowPosition].groupHeaderName === GridConfiguration.data[iCount].groupHeaderName) {
                                        if (!isNaN(fCurrent)) {
                                            if (fMaxValue < fCurrent) {
                                                fMaxValue = fCurrent;
                                            }
                                        }
                                    }
                                }
                            }
                            oFormatterOptions = {
                                maxValue: fMaxValue,
                                field: sFieldName,
                                numberFormatter: GridConfiguration.columnHeader[cellCounter].chartValueFormatter,
                                fCell: (cell.style.width || oGridConstants.sDefaultWidth)
                            };

                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], oFormatterOptions);
                            break;
                        case "parseDealValue":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name]);
                            break;
                        case "parsePastDueDeals":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.dataConfiguration.maxConfig);
                            break;
                        case "parseOpportunitiesTrack":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.dataConfiguration.maxConfig, cell.style.width || "");
                            break;
                        case "parseOpportunitiesMissing":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.dataConfiguration.maxConfig, cell.style.width || "");
                            break;
                        case "parseQuotaCoverage":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.dataConfiguration.maxConfig);
                            break;
                        case "calculatePercentByTotal":
                            oFormatterOptions = {
                                maxConfig: GridConfiguration.dataConfiguration.maxConfig,
                                field: GridConfiguration.endRow.data,
                                fCell: cell.style.width || "",
                                cellCounter: this.rowPosition,
                                barColor: GridConfiguration.columnHeader[2].barColors[this.rowPosition],
                                barColors: GridConfiguration.columnHeader[2].barColors,
                                dataSeries: GridConfiguration.data
                            };
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.gridName, GridConfiguration.columnHeader[cellCounter].name, oFormatterOptions);

                            break;
                        case "trimOnOverflowAndShowToolTip":
                            sReturnValue = MAQ.getAdjustedRowChunkAndToolTip((GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name] || oGridConstants.sNA), GridConfiguration.columnHeader[cellCounter].style.width);
                            break;
                        case "customPipelineBar":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition], GridConfiguration.data, GridConfiguration.endRow.data);
                            break;

                        default:
                            oFormatterOptions = {
                                maxConfig: GridConfiguration.dataConfiguration.maxConfig,
                                field: GridConfiguration.endRow.data,
                                fCell: cell.style.width || "",
                                cellCounter: this.rowPosition,
                                headerProperties: GridConfiguration.columnHeader[cellCounter],
                                dataSeries: GridConfiguration.data,
                                oInPlaceGridData: GridConfiguration.inPlaceGrid,
                                customSecondaryFormatter: GridConfiguration.dataConfiguration.customSecondaryFormatter,
                                stackedBarConfig: GridConfiguration.dataConfiguration.stackedBar
                            };
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.data[this.rowPosition][GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.data[this.rowPosition], GridConfiguration.gridName, GridConfiguration.columnHeader[cellCounter].name, oFormatterOptions);
                            break;
                    }
                }
            }

            // Format cell for drill down
            if (GridConfiguration.drillDown.enabled && GridConfiguration.drillDown.columnId === cellCounter) {
                sReturnValue = MAQ.setDrillDown(sReturnValue, this.rowPosition, GridConfiguration, false);
                MAQUtility.addClass(cell, "DrillDownCell");
            }

            // Format cell for drill down end
            if (!GridConfiguration.isWin8App) {
                $(cell).html(sReturnValue);
            } else {
                MSApp.execUnsafeLocalFunction(function() {
                    WinJS.Utilities.setInnerHTML(cell, sReturnValue);
                });
            }
        }
    }
    if (!GridConfiguration.serverGrid.enabled && GridConfiguration.fixedHeaderEnd && parseInt(GridConfiguration.fixedHeaderEnd) <= cellCounter && GridConfiguration.pagination.paginate && GridConfiguration.totalPages && (endIndex - startIndex < GridConfiguration.pagination.maxRows || 1 === GridConfiguration.pagination.iLast)) {
        leftGrid = document.querySelector("#" + GridConfiguration.container + " .LeftGrid");
        rightGrid = document.querySelector("#" + GridConfiguration.container + " .RightGrid");
        rightGrid.style.height = (leftGrid.clientHeight - 38) + "px";
        GridConfiguration.pagination.iLast *= -1;
    }
    if (GridConfiguration.endRow.enableEndRow) {
        // Use only data array
        iCellCounter = 0;
        iCellCounterRight = 0;
        GridConfiguration.endRow.endRowPosition = parseInt(GridConfiguration.endRow.endRowPosition);
        if (!isNaN(GridConfiguration.endRow.endRowPosition) && GridConfiguration.endRow.endRowPosition >= -1 && GridConfiguration.endRow.endRowPosition < GridConfiguration.data.length) {
            if (GridConfiguration.drillDown.enabled) {
                if ("undefined" !== typeof GridConfiguration.inPlaceGrid && "levelOne" !== GridConfiguration.inPlaceGrid.level) {
                    GridConfiguration.endRow.endRowPosition = 2 * GridConfiguration.endRow.endRowPosition;
                }
            }
            row = GridConfiguration.tblBody.insertRow(GridConfiguration.endRow.endRowPosition);
            if (GridConfiguration.fixedHeaderEnd) {
                oRowRight = GridConfiguration.tblBodyRight.insertRow(GridConfiguration.endRow.endRowPosition);
                MAQUtility.addClass(oRowRight, GridConfiguration.endRow.className);
            }

            MAQUtility.addClass(row, GridConfiguration.endRow.className);
            for (cellCounter = 0; cellCounter < numberOfColumns; cellCounter++) {
                if (GridConfiguration.fixedHeaderEnd && parseInt(GridConfiguration.fixedHeaderEnd) <= cellCounter) {
                    cell = oRowRight.insertCell(iCellCounterRight++);
                } else {
                    cell = row.insertCell(iCellCounter++);
                }

                // Doing this to avoid overlapping of last column values and the scroll bar
                if (GridConfiguration.columnHeader[cellCounter].noOverlap) {
                    if (cellCounter === numberOfColumns - 1) {
                        cell.style.paddingRight = String(20) + "px";
                        MAQUtility.addClass(cell, "noOverlap");
                    }
                }
                if (GridConfiguration.columnHeader[cellCounter].style) {
                    MAQ.applyStyleToObject(cell, GridConfiguration.columnHeader[cellCounter].style);
                }
                MAQUtility.addClass(cell, "jsonGridRow");
                MAQUtility.addClass(cell, "GridEndRow");
                cell.style.textAlign = GridConfiguration.columnHeader[cellCounter].align;
                if (GridConfiguration.endRow.includeFormatters && GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]) {
                    switch (GridConfiguration.columnHeader[cellCounter].formatter) {
                        case "parseDealValue":
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name]);
                            break;
                        case "parsePastDueDeals":
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name]);
                            break;
                        case "parseOpportunitiesTrack":
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.dataConfiguration.maxConfig, cell.style.width || oGridConstants.sDefaultWidth);
                            break;
                        case "parseOpportunitiesMissing":
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.dataConfiguration.maxConfig, cell.style.width || oGridConstants.sDefaultWidth);
                            break;
                        case "parseQuotaCoverage":
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.dataConfiguration.maxConfig);
                            break;
                        case "customPipelineBar":
                            sReturnValue = window[GridConfiguration.columnHeader[cellCounter].formatter](GridConfiguration.endRow.data, GridConfiguration.data, GridConfiguration.endRow.data);
                            break;
                        default:
                            sReturnValue = window[GridConfiguration.endRow.includeFormatters[GridConfiguration.columnHeader[cellCounter].name]](GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name], GridConfiguration.endRow.data, GridConfiguration.gridName, GridConfiguration.columnHeader[cellCounter].name);
                            break;
                    }
                } else {
                    sReturnValue = (GridConfiguration.endRow.data[GridConfiguration.columnHeader[cellCounter].name] || oGridConstants.sNA);
                }

                if (GridConfiguration.drillDown.enabled && GridConfiguration.drillDown.enableForEndRow && GridConfiguration.drillDown.columnId === cellCounter) {
                    sReturnValue = MAQ.setDrillDown(sReturnValue, 0, GridConfiguration, true);
                    MAQUtility.addClass(cell, "DrillDownCell");
                }

                if (!GridConfiguration.isWin8App) {
                    $(cell).html(sReturnValue);
                } else {
                    MSApp.execUnsafeLocalFunction(function() {
                        WinJS.Utilities.setInnerHTML(cell, sReturnValue);
                    });
                }
            }
            if (GridConfiguration) {
                // Add 15px split row above total row
                if ("undefined" !== typeof GridConfiguration.endRow.isSplitRowEnabled && GridConfiguration.endRow.isSplitRowEnabled && window[GridConfiguration.endRow.splitRowFormatter]) {
                    window[GridConfiguration.endRow.splitRowFormatter](GridConfiguration.container, GridConfiguration.data.length);
                }
            }
        }
    }
};

MAQ.CreateHTMLTableWithHeader = function(GridConfiguration) {
    var tHead = GridConfiguration.tblHead,
        row = "",
        cell = null,
        iLoopCounter, drillCounter = 0,
        iParentCounter = 0,
        numberOfHeaderColumns = GridConfiguration.columnHeader.length,
        iParentHeaderCount = GridConfiguration.headerTemplate.length,
        oRowRight, oHeaderRight, iGroupEnd, arrCurrentGroup = [],
        iCellCounter = 0,
        iCellCounterRight = 0;
    row = tHead.insertRow(-1);
    if (GridConfiguration.fixedHeaderEnd) {
        oHeaderRight = GridConfiguration.tblHeadRight;
        oRowRight = oHeaderRight.insertRow(-1);
    }
    for (iParentCounter = 0; iParentCounter < iParentHeaderCount; iParentCounter++) {
        if (GridConfiguration.headerTemplate[iParentCounter] && GridConfiguration.headerTemplate[iParentCounter].dataID) {
            arrCurrentGroup = GridConfiguration.headerTemplate[iParentCounter].dataID.split(",");
            iGroupEnd = arrCurrentGroup[arrCurrentGroup.length - 1];
            if (GridConfiguration.fixedHeaderEnd && parseInt(GridConfiguration.fixedHeaderEnd) < parseInt(iGroupEnd)) {
                cell = oRowRight.insertCell(iCellCounterRight++);
            } else {
                cell = row.insertCell(iCellCounter++);
            }
        }
        cell.setAttribute("colspan", GridConfiguration.headerTemplate[iParentCounter].colspan || 1);
        $(cell).html(GridConfiguration.headerTemplate[iParentCounter].columnText || "");
        cell.setAttribute("dataID", GridConfiguration.headerTemplate[iParentCounter].dataID || "parent");
        cell.setAttribute("onclick", GridConfiguration.headerTemplate[iParentCounter].onclick || "");
        MAQUtility.addClass(cell, "jsonGridParentHeader");
        if (GridConfiguration.headerTemplate[iParentCounter].headerClassName) {
            MAQUtility.addClass(cell, GridConfiguration.headerTemplate[iParentCounter].headerClassName);
        }
        MAQ.applyStyleToObject(cell, GridConfiguration.headerTemplate[iParentCounter].style || {});
    }

    if (iParentHeaderCount) {
        row = tHead.insertRow(-1);
        if (GridConfiguration.fixedHeaderEnd) {
            oRowRight = oHeaderRight.insertRow(-1);
        }
    }
    iCellCounter = 0;
    iCellCounterRight = 0;
    for (iLoopCounter = 0; iLoopCounter < (numberOfHeaderColumns); iLoopCounter += 1) {
        if (GridConfiguration.fixedHeaderEnd && parseInt(GridConfiguration.fixedHeaderEnd) <= iLoopCounter) {
            cell = oRowRight.insertCell(iCellCounterRight++);
        } else {
            cell = row.insertCell(iCellCounter++);
        }
        cell.setAttribute("id", GridConfiguration.columnHeader[iLoopCounter].id || "jsonGridHeader_" + iLoopCounter);
        MAQUtility.addClass(cell, GridConfiguration.columnHeader[iLoopCounter].headerClassName);
        MAQUtility.addClass(cell, "jsonGridHeader");
        if (GridConfiguration.columnHeader[iLoopCounter].style) {
            if (iLoopCounter === numberOfHeaderColumns - 1) {
                cell.style.width = (GridConfiguration.scrolling.enabled) ? (GridConfiguration.tblBody.rows[0].cells[iLoopCounter].clientWidth - 8) + "px" : GridConfiguration.columnHeader[iLoopCounter].style.width;
            } else {
                cell.style.width = (GridConfiguration.scrolling.enabled) ? (GridConfiguration.tblBody.rows[0].cells[iLoopCounter].clientWidth - 30) + "px" : GridConfiguration.columnHeader[iLoopCounter].style.width;
            }
            cell.style.textAlign = GridConfiguration.columnHeader[iLoopCounter].style.textAlign;
        }
        if (iLoopCounter + 1 === numberOfHeaderColumns) {
            cell.style.paddingRight = 10 + "px";
        }

        // Add sorting functionality
        if (GridConfiguration.columnHeader[iLoopCounter].sortable) {
            cell.setAttribute("onclick", 'MAQ.sortJsonGrid(this,"' + GridConfiguration.container + '_Grid","' + GridConfiguration.columnHeader[iLoopCounter].name + '")');
            cell.style.cursor = "pointer";
            if (GridConfiguration.columnHeader[iLoopCounter].name === GridConfiguration.gridSort.sortby) {
                if (GridConfiguration.gridSort.sortorder === "asc") {
                    cell.setAttribute("sortorder", "desc");
                } else {
                    cell.setAttribute("sortorder", "asc");
                }
                if (GridConfiguration.hiddenContainer) {
                    GridConfiguration.hiddenContainer.setAttribute("data-sortKey", GridConfiguration.columnHeader[iLoopCounter].sortKey);
                }
            } else {
                cell.setAttribute("sortorder", GridConfiguration.gridSort.sortorder);
            }
            cell.setAttribute("sortKey", GridConfiguration.columnHeader[iLoopCounter].sortKey);
        } else {
            cell.style.cursor = "default";
        }
        if (!GridConfiguration.gridSort.sortby && GridConfiguration.columnHeader[iLoopCounter].sortable) {
            GridConfiguration.gridSort.sortby = GridConfiguration.columnHeader[iLoopCounter].name;
        }
        if (GridConfiguration.columnHeader[iLoopCounter].name === GridConfiguration.gridSort.sortby && GridConfiguration.columnHeader[iLoopCounter].sortable) {
            MAQUtility.addClass(cell, "jsonGridHeaderAlternate");
            MAQUtility.addClass(document.querySelectorAll("#" + GridConfiguration.container + " .SortIndicator"), "itemHide");
            $(cell).html("<span class='ColumnText'>" + GridConfiguration.columnHeader[iLoopCounter].columnText + "</span>");
            if (GridConfiguration.gridSort.sortorder === "asc") {
                $(cell).append("<span class='SortIndicator " + GridConfiguration.columnHeader[iLoopCounter].name.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~ ]/g, '_') + "Hand'>" + '<span class="asc"></span>' + "</span>");
            } else {
                $(cell).append("<span class='SortIndicator " + GridConfiguration.columnHeader[iLoopCounter].name.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~ ]/g, '_') + "Hand'>" + '<span class="desc"></span>' + "</span>");
            }
        } else if (GridConfiguration.columnHeader[iLoopCounter].sortable) {
            $(cell).html("<span class='ColumnText'>" + GridConfiguration.columnHeader[iLoopCounter].columnText + "</span>");
            if (GridConfiguration.columnHeader[iLoopCounter].sortable) {
                $(cell).append("<span class='itemHide SortIndicator " + GridConfiguration.columnHeader[iLoopCounter].name.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~ ]/g, '_') + "Hand'>" + '<span class="asc"></span>' + "</span>");
            }
        } else {
            $(cell).html("<span class='ColumnText'>" + GridConfiguration.columnHeader[iLoopCounter].columnText + "</span>");
        }
    }
};
MAQ.applyStyleToObject = function(oGridObject, oStyleObject) {
    var oStyles, iCounter;
    if (typeof oStyleObject === "undefined") {
        return;
    }
    oStyles = Object.keys(oStyleObject), iCounter = 0;
    for (iCounter; iCounter < oStyles.length; iCounter += 1) {
        try {
            oGridObject.style[oStyles[iCounter]] = oStyleObject[oStyles[iCounter]];
        } catch (e) {}
    }
};

MAQ.CreateHTMLTable = function(GridConfiguration) {
    var gridContainer, grid, oRightGrid, oContainerDiv;
    if (GridConfiguration.fixedHeaderEnd) {
        gridContainer = document.createElement("div");
        gridContainer.setAttribute("id", GridConfiguration.gridName + "_HeaderParent");
    }
    grid = document.createElement("table");
    grid.setAttribute("id", GridConfiguration.gridName);
    if ("string" === typeof(GridConfiguration.container)) {
        grid.setAttribute("class", "jsonGrid");
    } else {
        grid.setAttribute("class", "InnerJsonGrid");
    }
    if (JSON.stringify(GridConfiguration.style) !== "{}") {
        MAQ.applyStyleToObject(grid, GridConfiguration.style);
    }
    if (GridConfiguration.fixedHeaderEnd) {
        oContainerDiv = document.createElement("div");
        MAQUtility.addClass(oContainerDiv, "LeftGrid");
        oContainerDiv.appendChild(grid);
        gridContainer.appendChild(oContainerDiv);
        GridConfiguration.containerObject.appendChild(gridContainer);
        if (GridConfiguration.columnHeader.length === parseInt(GridConfiguration.fixedHeaderEnd)) {
            oContainerDiv.style.width = "100%";
        }
        oRightGrid = document.createElement("table");
        oRightGrid.setAttribute("id", GridConfiguration.gridName + "_right");
        MAQUtility.addClass(oRightGrid, "jsonGrid");
        MAQ.applyStyleToObject(oRightGrid, GridConfiguration.style);
        oContainerDiv = document.createElement("div");
        MAQUtility.addClass(oContainerDiv, "RightGrid");
        oContainerDiv.appendChild(oRightGrid);
        gridContainer.appendChild(oContainerDiv);
    } else {
        GridConfiguration.containerObject.appendChild(grid);
    }
    return (GridConfiguration.fixedHeaderEnd) ? gridContainer : grid;
};

MAQ.CreateLegends = function(oGridConfiguration) {
    var sGridContainer, oLegendContainer = document.createElement("div"),
        oLegendSectionCover = document.createElement("div"),
        oLegendTitleSection = document.createElement("div"),
        oLegendTitleLabel = document.createElement("div"),
        oLegendSection = document.createElement("div"),
        oLegendSpace, oLegendLabel, oLegendIndicator, oLegendDivision, iIterator = 0,
        oData;
    MAQUtility.addClass(oLegendContainer, "LegendContainer");
    MAQUtility.addClass(oLegendSection, "LegendSection");
    if (oGridConfiguration.legends && oGridConfiguration.legends.legendTemplate) {
        MAQ.applyStyleToObject(oLegendContainer, oGridConfiguration.legends.containerStyle);
        oData = oGridConfiguration.legends.legendTemplate;
        for (iIterator = 0; iIterator < oData.length; iIterator++) {
            oLegendLabel = document.createElement("div");
            oLegendLabel.innerText = oData[iIterator].label;
            oLegendIndicator = document.createElement("div");
            oLegendDivision = document.createElement("div");
            oLegendIndicator.appendChild(oLegendDivision);
            MAQ.applyStyleToObject(oLegendDivision, oData[iIterator].indicatorStyle);
            MAQ.applyStyleToObject(oLegendLabel, oData[iIterator].labelStyle);
            if (!oGridConfiguration.legends.labelFirst) {
                oLegendSection.appendChild(oLegendIndicator);
                oLegendSection.appendChild(oLegendLabel);
            } else {
                oLegendSection.appendChild(oLegendLabel);
                oLegendSection.appendChild(oLegendIndicator);
            }
            oLegendSpace = document.createElement("div");
            oLegendSection.appendChild(oLegendSpace);
            MAQUtility.addClass(oLegendLabel, "LegendLabel");
            MAQUtility.addClass(oLegendSpace, "LegendSpace");
            MAQUtility.addClass(oLegendIndicator, "LegendIndicator");
            MAQ.applyStyleToObject(oLegendSpace, oGridConfiguration.legends.separationStyle);
        }
        oLegendTitleLabel.innerText = oGridConfiguration.legends.legendTitle || "";
        MAQ.applyStyleToObject(oLegendTitleLabel, oGridConfiguration.legends.titleStyle);
        oLegendTitleSection.appendChild(oLegendTitleLabel);
        oGridConfiguration.containerObject.appendChild(oLegendTitleSection);
        oLegendSectionCover.appendChild(oLegendSection);
        oLegendContainer.appendChild(oLegendSectionCover);
    }
    oGridConfiguration.containerObject.appendChild(oLegendContainer);
};
MAQ.JsonGrid = function(gridConfigurationOptions) {
    var oAttribute, tBody, checkKeys, bodyContainer, innerTable, indexPositionOfCurrentGrid, iIterator, iColumnIterator, iCount, iTotal, oTableBody, iColumnHeaderLength, iDataLength, iMargin, oAttributeObject, nCurrentValue, nCurrentColumn;
    if (typeof(gridConfigurationOptions.container) === "string") {
        this.containerObject = document.getElementById(gridConfigurationOptions.container);

        // Append data if grid already exists
        if (document.getElementById(gridConfigurationOptions.container + "_Grid")) {
            MAQ.appendDataToGrid(gridConfigurationOptions);
            return true;
        }
    } else {
        this.containerObject = gridConfigurationOptions.container;
    }
    if (gridConfigurationOptions.data.length <= 0) {
        return false;
    }
    if (this.containerObject) {
        this.gridOptions = {
            container: "",
            gridName: "",
            data: [],
            headerTemplate: [],
            columnHeader: [],
            style: {},
            altRowColor: "",
            gridSort: {
                sortby: "",
                sortorder: "asc",
                sortType: ""
            },
            serverGrid: {
                enabled: false,
                totalPages: 2,
                currentIndex: 1,
                sendRequestFunction: null
            },
            inPlaceGrid: {
                enableInPlaceGrid: false,
                disableHeader: false,
                parentContainer: "",
                level: "",
                enableRowInsert: false
            },
            viewrecords: true,
            pagination: {
                maxRows: 0,
                retainPageOnSort: true,
                iLast: -1,
                paginate: false
            },
            scrolling: {
                enabled: false,
                scrollStyle: {}
            },
            cellSpacing: 0,
            cellPadding: 0,
            rows: {
                alternate: true,
                rowClassName: ""
            },
            endRow: {
                enableEndRow: false,
                isTotalRow: false,
                includeFormatters: {},
                columnsExcluded: [],
                data: [],
                endRowPosition: -1,
                className: "",
                isSplitRowEnabled: false,
                splitRowFormatter: ""
            },
            drillDown: {
                enabled: false,
                enableForEndRow: false,
                currentLevel: 0,
                columnId: 0,
                dataMappings: [],
                sDrillDownCall: "",
                dataMapping: "",
                accordion: false
            },
            drilldownConfig: null,
            isWin8App: false,
            legends: {
                enableLegends: false,
                labelFirst: false,
                separationStyle: {},
                containerStyle: {},
                legendTemplate: []
            },
            groupedRows: false,
            groupedRowHeader: {
                groupHeaderName: [],
                data: []
            },
            fixedHeaderEnd: null,
            dataConfiguration: {
                calculateMaximum: false,
                columnsIncluded: [],
                maxConfig: {},
                includeEndRow: false,
                useAbsolutes: [],
                stackedBar: {
                    enabled: false,
                    stackedColumns: [],
                    color: [],
                    colorMapping: {
                        hasMultiColoredBars: false,
                        mappingColumn: "",
                        colorMap: []
                    },
                    hasRelativeRows: true,
                    relateByColumn: "",
                    displayRelateByColumn: false,
                    className: ""
                },
                customSecondaryFormatter: ""
            },
            staticHeaderRows: {
                enabled: false,
                columnName: "",
                staticHeader: []
            },
            callBackFunc: null
        };
        for (oAttribute in gridConfigurationOptions) {
            // Merge and clone for first level attributes
            if ("object" === typeof gridConfigurationOptions[oAttribute] && !(gridConfigurationOptions[oAttribute] instanceof Array)) {
                for (oAttributeObject in gridConfigurationOptions[oAttribute]) {
                    this.gridOptions[oAttribute][oAttributeObject] = MAQUtility.clone(gridConfigurationOptions[oAttribute][oAttributeObject]);
                }
            } else {
                this.gridOptions[oAttribute] = MAQUtility.clone(gridConfigurationOptions[oAttribute]);
            }
        }
        if (this.gridOptions.fixedHeaderEnd) {
            this.gridOptions.scrolling.enabled = false;
        }
        if (this.gridOptions.scrolling.enabled) {
            this.gridOptions.pagination.paginate = false;
        }
        if (!this.gridOptions.pagination.paginate) {
            this.gridOptions.pagination.maxRows = this.gridOptions.data.length;
        }
        this.gridOptions.containerObject = this.containerObject;
        if (this.gridOptions.legends.enableLegends) {
            new MAQ.CreateLegends(this.gridOptions);
        }
        this.gridOptions.currentPage = 0;
        if (this.gridOptions.pagination.maxRows > 0) {
            if (this.gridOptions.serverGrid.enabled) {
                this.gridOptions.totalPages = this.gridOptions.serverGrid.totalPages - 1;
            } else {
                this.gridOptions.totalPages = Math.ceil(this.gridOptions.data.length / this.gridOptions.pagination.maxRows) - 1;
            }
        } else {
            this.gridOptions.totalPages = 0;
        }

        // Disable drill down if invalid column Id is passed
        if (this.gridOptions.drillDown.enabled) {
            this.gridOptions.drillDown.columnId = parseInt(this.gridOptions.drillDown.columnId);
            if (!(!isNaN(this.gridOptions.drillDown.columnId) && this.gridOptions.drillDown.columnId >= -1 && this.gridOptions.drillDown.columnId <= this.gridOptions.columnHeader.length)) {
                this.gridOptions.drillDown.enabled = false;
            }
        }

        this.gridOptions.gridName = this.gridOptions.container + "_Grid";

        for (this.LoopCounter = 0; this.LoopCounter < this.gridOptions.columnHeader.length; this.LoopCounter += 1) {
            if (!(this.gridOptions.data[0].hasOwnProperty([this.gridOptions.columnHeader[this.LoopCounter].name].toString()) || "DUMMY" === this.gridOptions.columnHeader[this.LoopCounter].name)) {
                return false;
            }

            // Add color configuration for custom bar chart column
            if (this.gridOptions.columnHeader[this.LoopCounter].formatter && this.gridOptions.columnHeader[this.LoopCounter].formatter === "parseCustomBarChart") {
                iTotal = this.gridOptions.data.length;
                if (this.gridOptions.columnHeader[this.LoopCounter].chartColor && iTotal === this.gridOptions.columnHeader[this.LoopCounter].chartColor.length) {
                    for (iCount = 0; iCount < iTotal; iCount++) {
                        if (!this.gridOptions.data[iCount].colorStyle || !this.gridOptions.data[iCount].colorStyle.columnName || !this.gridOptions.data[iCount].colorStyle.color) {
                            this.gridOptions.data[iCount].colorStyle = {
                                columnName: [],
                                color: []
                            };
                        }
                        this.gridOptions.data[iCount].colorStyle.columnName.push(this.gridOptions.columnHeader[this.LoopCounter].name);
                        this.gridOptions.data[iCount].colorStyle.color.push(this.gridOptions.columnHeader[this.LoopCounter].chartColor[iCount]);
                    }
                }
            }
        }

        // Create Hidden grid to store parameters for server side grid.
        // Fork for client/server type grid.
        if (this.gridOptions.serverGrid.enabled) {
            MAQ.createHiddenChunk(this.gridOptions);

            // Add scroll handler if grid supports scrolling and Server Side is enabled.
            if (this.gridOptions.scrolling.enabled) {
                this.gridOptions.containerObject.addEventListener("scroll", function(oEvent) {
                    MAQ.handleGridScroll(oEvent.currentTarget);
                }, false);
            }
        } else {
            if (this.gridOptions.gridSort.sortby) {
                if (!this.gridOptions.groupedRows) {
                    if (this.gridOptions.gridSort.sortorder.toLowerCase() === "asc") {
                        this.gridOptions.data.sort(MAQUtility.sortBy(this.gridOptions.gridSort.sortby, true, this.gridOptions.gridSort.sortType));
                    }
                    if (this.gridOptions.gridSort.sortorder.toLowerCase() === "desc") {
                        this.gridOptions.data.sort(MAQUtility.sortBy(this.gridOptions.gridSort.sortby, false, this.gridOptions.gridSort.sortType));
                    }
                } else {
                    if (this.gridOptions.groupedRowHeader && this.gridOptions.groupedRowHeader.groupHeaderName) {
                        // Sort groups separately and then combine the data
                        if (this.gridOptions.gridSort.sortorder.toLowerCase() === "asc") {
                            this.gridOptions = MAQ.sortDataWithinGroup(this.gridOptions, this.gridOptions.gridSort.sortby, true, this.gridOptions.gridSort.sortType);
                        } else {
                            this.gridOptions = MAQ.sortDataWithinGroup(this.gridOptions, this.gridOptions.gridSort.sortby, false, this.gridOptions.gridSort.sortType);
                        }
                    }
                }
            }
        }

        iColumnHeaderLength = this.gridOptions.columnHeader.length;
        iDataLength = this.gridOptions.data.length;
        if (this.gridOptions.endRow.isTotalRow) {
            for (iColumnIterator = 0; iColumnIterator < iColumnHeaderLength; iColumnIterator++) {
                for (iIterator = 0; iIterator < iDataLength; iIterator++) {
                    if (this.gridOptions.endRow.columnsExcluded && this.gridOptions.endRow.columnsExcluded.indexOf(this.gridOptions.columnHeader[iColumnIterator].name) < 0) {
                        if ("undefined" === typeof this.gridOptions.endRow.data[this.gridOptions.columnHeader[iColumnIterator].name]) {
                            this.gridOptions.endRow.data[this.gridOptions.columnHeader[iColumnIterator].name] = 0;
                        } else if (isNaN(this.gridOptions.endRow.data[this.gridOptions.columnHeader[iColumnIterator].name])) {
                            this.gridOptions.endRow.data[this.gridOptions.columnHeader[iColumnIterator].name] = oGridConstants.sNA;
                            break;
                        }
                        nCurrentValue = parseFloat(this.gridOptions.data[iIterator][this.gridOptions.columnHeader[iColumnIterator].name]);
                        if (isNaN(nCurrentValue)) {
                            nCurrentValue = 0;
                        }
                        this.gridOptions.endRow.data[this.gridOptions.columnHeader[iColumnIterator].name] += nCurrentValue;
                    }
                }
            }
            nCurrentValue = 0;
        }
        if (this.gridOptions.dataConfiguration.calculateMaximum) {
            MAQ.calculateMinMax(this.gridOptions, 0, iDataLength);
        }
        if ("undefined" !== this.gridOptions.inPlaceGrid && !this.gridOptions.inPlaceGrid.enableInPlaceGrid) {
            var gridObject = MAQ.CreateHTMLTable(this.gridOptions);
            if (this.gridOptions.fixedHeaderEnd) {
                this.gridOptions.tblHead = gridObject.childNodes[0].childNodes[0].createTHead();
                this.gridOptions.tblFoot = gridObject.childNodes[0].childNodes[0].createTFoot();
                this.gridOptions.tblHeadRight = gridObject.childNodes[1].childNodes[0].createTHead();
                this.gridOptions.tblFootRight = gridObject.childNodes[1].childNodes[0].createTFoot();
                tBody = document.createElement("tbody");
                oTableBody = document.createElement("tbody");
                gridObject.childNodes[0].childNodes[0].appendChild(tBody);
                gridObject.childNodes[1].childNodes[0].appendChild(oTableBody);
                this.gridOptions.tblBody = tBody;
                this.gridOptions.tblBodyRight = oTableBody;
                this.gridOptions.gridObject = gridObject;
            } else {
                this.gridOptions.tblHead = gridObject.createTHead();
                this.gridOptions.tblFoot = gridObject.createTFoot();
                tBody = document.createElement("tbody");
                gridObject.appendChild(tBody);
                this.gridOptions.tblBody = tBody;
                this.gridOptions.gridObject = gridObject;
            }
        }

        // Create Pagination if grid supports pagination
        if (this.gridOptions.pagination.paginate) {
            new MAQ.CreateHTMLTableWithHeader(this.gridOptions);
            new MAQ.CreateHTMLTableRow(this.gridOptions);
            if (this.gridOptions.totalPages) {
                new MAQ.CreatePaginationControl(this.gridOptions);
            }
        } else if (this.gridOptions.scrolling.enabled) {
            new MAQ.CreateHTMLTableRow(this.gridOptions);
            new MAQ.CreateHTMLTableWithHeader(this.gridOptions);
            iMargin = this.gridOptions.tblHead.clientHeight;
            this.gridOptions.tblHead.style.marginTop = "-" + iMargin + "px";
            this.gridOptions.containerObject.style.marginTop = iMargin + "px";
            this.gridOptions.gridObject.style.width = this.gridOptions.containerObject.clientWidth + "px";
            MAQUtility.addClass(this.gridOptions.tblHead, "jsonScrollHeader");
            MAQUtility.addClass(this.gridOptions.containerObject, "jsonScrollContainer");
        } else {
            if ("undefined" !== this.gridOptions.inPlaceGrid.disableHeader) {
                if (!this.gridOptions.inPlaceGrid.disableHeader) {
                    new MAQ.CreateHTMLTableWithHeader(this.gridOptions);
                }
            }
            new MAQ.CreateHTMLTableRow(this.gridOptions);
        }
        indexPositionOfCurrentGrid = MAQ.gridName.indexOf(this.gridOptions.gridName);
        if (indexPositionOfCurrentGrid > -1) {
            MAQ.gridObject[indexPositionOfCurrentGrid] = this.gridOptions;
        } else {
            MAQ.gridName.push(this.gridOptions.gridName);
            MAQ.gridObject.push(this.gridOptions);
        }
    }

    //Pagination issue fix
    var selectedElement = document.getElementsByClassName("ListOptionContainer")[0];
    if (undefined !== selectedElement) {
        selectedElement.setAttribute("onchange", "jumpTo(0)");
    }

    selectedElement = document.getElementsByClassName("ListOptionContainer")[1];
    if (undefined !== selectedElement) {
        selectedElement.setAttribute("onchange", "jumpTo(1)");
    }
    return true;
};

function jumpTo(index) {
    if (document.getElementsByClassName('ListOptionContainer') && document.getElementsByClassName('ListOptionContainer')[index] && document.getElementsByClassName('ListOptionContainer')[index].options) {
        pageid = document.getElementsByClassName('ListOptionContainer')[index].options.selectedIndex + 1;
        var totalPages = document.getElementsByClassName('totalPagesLabel')[index].innerHTML;
        totalPages.substring(totalPages.indexOf('of') + 2, totalPages.length).trim();
        var oElemJumpTo = document.getElementsByClassName('ListOptionContainer')[index].options[document.getElementsByClassName('ListOptionContainer')[index].options.selectedIndex];
        if (pageid > totalPages) {
            pageid = totalPages;
            document.getElementsByClassName('ListOptionContainer')[index].value = pageid;
            oElemJumpTo = document.getElementsByClassName('ListOptionContainer')[index].options[pageid - 1];
        }
        newRecords(oElemJumpTo, $(document.getElementsByClassName('ListOptionContainer')[index]).parents('table').attr('id'));
    } else {
        pageid = document.getElementsByClassName('ListOptionContainer')[0].value;
    }
}
// Function to create and update hidden chunk (this will be called only in case of server side grid)
MAQ.createHiddenChunk = function(gridOptions) {
    var sContainer = gridOptions.container,
        oHiddenContainer = document.getElementById(sContainer + "_hidden");
    if (oHiddenContainer) {
        gridOptions.currentPage = parseInt(oHiddenContainer.getAttribute("data-currentPage"));
        gridOptions.totalPages = parseInt(oHiddenContainer.getAttribute("data-totalPages"));
        gridOptions.pagination.maxRows = parseInt(oHiddenContainer.getAttribute("data-maxRows"));
        gridOptions.gridSort.sortby = oHiddenContainer.getAttribute("data-sortBy");
        gridOptions.gridSort.sortorder = oHiddenContainer.getAttribute("data-sortOrder");
    } else {
        oHiddenContainer = document.createElement("div");
        oHiddenContainer.id = sContainer + "_hidden";
        oHiddenContainer.setAttribute("data-totalPages", gridOptions.totalPages.toString());
        oHiddenContainer.setAttribute("data-currentPage", gridOptions.currentPage.toString());
        oHiddenContainer.setAttribute("data-maxRows", gridOptions.pagination.maxRows.toString());
        oHiddenContainer.setAttribute("data-sortBy", gridOptions.gridSort.sortby.toString());
        oHiddenContainer.setAttribute("data-sortOrder", gridOptions.gridSort.sortorder.toString());
        oHiddenContainer.setAttribute("data-sent", "0"); // To check if response is received or not in case of scrollable server side grid
        MAQUtility.addClass(oHiddenContainer, "Hidden");
        gridOptions.containerObject.parentElement.appendChild(oHiddenContainer);
        gridOptions.hiddenContainer = oHiddenContainer;
    }
};

// Function to send service request in case of server side grid
MAQ.callService = function(gridOptions) {
    var oHiddenContainer = document.getElementById(gridOptions.container + "_hidden"),
        sCallBack = gridOptions.serverGrid.sendRequestFunction;

    // Properties to be sent in request
    var oParameters = {
        maxRows: gridOptions.pagination.maxRows,
        sortOrder: oHiddenContainer.getAttribute("data-sortOrder"),
        sortBy: oHiddenContainer.getAttribute("data-sortBy"),
        sortKey: oHiddenContainer.getAttribute("data-sortKey"),
        startIndex: parseInt(oHiddenContainer.getAttribute("data-currentPage")) + 1,
        gridContainer: gridOptions.container
    };
    if (sCallBack && typeof window[sCallBack] === oGridConstants.sFunction) {
        if (gridOptions.pagination.paginate) {
            // Empty the container before fetching next set of data in case of server side pagination
            $('#' + gridOptions.container).html("");
        }
        window[sCallBack](oParameters);
    }
};

// Function to add scroll handler
MAQ.handleGridScroll = function(oCurrentElement) {
    var oHiddenContainer, gridOptions, sRequestPending, iMaxPageNumber, iCurrentPage, iGridObjectPosition = MAQ.gridName.indexOf(oCurrentElement.id + "_Grid");
    if (-1 < iGridObjectPosition) {
        gridOptions = MAQ.gridObject[iGridObjectPosition];
        oHiddenContainer = document.getElementById(gridOptions.container + "_hidden");
        if (oHiddenContainer && oCurrentElement.scrollTop === (oCurrentElement.scrollHeight - oCurrentElement.offsetHeight)) {
            sRequestPending = oHiddenContainer.getAttribute("data-sent");
            iMaxPageNumber = parseInt(oHiddenContainer.getAttribute("data-totalPages")) || 0;
            iCurrentPage = (parseInt(oHiddenContainer.getAttribute("data-currentPage")) || 0) + 1;
            if ("1" !== sRequestPending && iCurrentPage <= iMaxPageNumber) {
                oHiddenContainer.setAttribute("data-currentPage", iCurrentPage);
                oHiddenContainer.setAttribute("data-sent", "1");
                MAQ.callService(gridOptions);
            }
        }
    }
};

// Function to append data to existing grid on scroll
MAQ.appendDataToGrid = function(gridOptions) {
    var oHiddenContainer = document.getElementById(gridOptions.container + "_hidden"),
        oGridConfigurationOptions, iGridObjectPosition = MAQ.gridName.indexOf(gridOptions.container + "_Grid");
    if (-1 < iGridObjectPosition) {
        oGridConfigurationOptions = MAQ.gridObject[iGridObjectPosition];
        oGridConfigurationOptions.data = gridOptions.data;
        oHiddenContainer.setAttribute("data-sent", "0");
        MAQ.CreateHTMLTableRow(oGridConfigurationOptions);
    }
};

MAQ.drillDown = function(oObject, sCallBack, sContainer) {
    var iGridObjectPosition = MAQ.gridName.indexOf(sContainer + "_Grid"),
        bAccordion = MAQ.gridObject[iGridObjectPosition].drillDown.accordion,
        oDrillSet = {},
        oDrillIconSet = {},
        oReferencedCell, oReferencedRow = oObject.parentNode.parentNode.nextSibling,
        bIsExpanded = "1" === oObject.getAttribute("data-expanded") ? true : false,
        iCount = 0,
        iTotal = 0;
    if (oReferencedRow && "undefined" !== typeof oReferencedRow) {
        oReferencedCell = oReferencedRow.childNodes[0];
    }
    if (bAccordion) {
        oDrillSet = document.querySelectorAll("#" + sContainer + "_Grid .InnerRow");
        oDrillIconSet = document.querySelectorAll("#" + sContainer + "_Grid .DrillCollpaseIcon");
        MAQUtility.addClass(oDrillSet, "HiddenSection");
        MAQUtility.removeClass(oDrillIconSet, "DrillCollpaseIcon");

        // Reset data-expanded to 0
        iTotal = oDrillIconSet.length;
        for (iCount = 0; iCount < iTotal; iCount++) {
            oDrillIconSet[iCount].setAttribute("data-expanded", "0");
        }
    }
    if (bIsExpanded) {
        MAQUtility.removeClass(oObject, "DrillCollpaseIcon");
        MAQUtility.addClass(oReferencedRow, "HiddenSection");
        oObject.setAttribute("data-expanded", "0");
    } else {
        MAQUtility.addClass(oObject, "DrillCollpaseIcon");
        MAQUtility.removeClass(oReferencedRow, "HiddenSection");
        oObject.setAttribute("data-expanded", "1");
    }

    if (sCallBack && "undefined" !== typeof window[sCallBack]) {
        window[sCallBack](oObject, sContainer, oReferencedCell);
    }
};

// Function to calculate max and min
MAQ.calculateMinMax = function(gridOptions, iStartIndex, iEndIndex) {
    var iColumnIncludedLength, iColumnIterator, nMax, nCurrentValue, nMin, nCurrentColumn, iIterator;
    iColumnIncludedLength = gridOptions.dataConfiguration.columnsIncluded.length;
    for (iColumnIterator = 0; iColumnIterator < iColumnIncludedLength; iColumnIterator++) {
        nCurrentColumn = gridOptions.dataConfiguration.columnsIncluded[iColumnIterator];
        nMax = 0, nMin = 0;
        for (iIterator = iStartIndex; iIterator < iEndIndex; iIterator++) {
            nCurrentValue = parseFloat(gridOptions.data[iIterator][nCurrentColumn]);
            if (isNaN(nCurrentValue)) {
                nCurrentValue = 0;
            }
            if (gridOptions.dataConfiguration.useAbsolutes.indexOf(nCurrentColumn) > -1) {
                if (Math.abs(nCurrentValue) > nMax) {
                    nMax = Math.abs(nCurrentValue);
                }
            } else {
                if (nCurrentValue > nMax) {
                    nMax = nCurrentValue;
                }
                if (nCurrentValue < nMin) {
                    nMin = nCurrentValue;
                }
            }
        }
        if (gridOptions.dataConfiguration.includeEndRow && gridOptions.endRow.enableEndRow) {
            nCurrentValue = parseFloat(gridOptions.endRow.data[nCurrentColumn]);
            if (isNaN(nCurrentValue)) {
                nCurrentValue = 0;
            }
            if (gridOptions.dataConfiguration.useAbsolutes.indexOf(nCurrentColumn) > -1) {
                if (Math.abs(nCurrentValue) > nMax) {
                    nMax = Math.abs(nCurrentValue);
                }
            } else {
                if (nCurrentValue > nMax) {
                    nMax = nCurrentValue;
                }

                if (nCurrentValue < nMin) {
                    nMin = nCurrentValue;
                }
            }
        }
        gridOptions.dataConfiguration.maxConfig[nCurrentColumn] = nMax;
        gridOptions.dataConfiguration.maxConfig[nCurrentColumn + "_Min"] = nMin;
    }
    return gridOptions;
};
MAQ.getChildPosition = function(oChildNode, oParentNode) {
    var index = -1,
        iCount, iTotal = oParentNode.querySelectorAll(oChildNode.tagName).length,
        aTrs = oParentNode.querySelectorAll(oChildNode.tagName);
    for (iCount = 0; iCount < iTotal; iCount++) {
        var oCurrentNode = aTrs[iCount];
        if (oChildNode === oCurrentNode) {
            index = iCount;
            return index;
        }
    }
};