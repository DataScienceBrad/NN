///-----------------------------------------------------------------------------------------------------------------
// arrayHelpers.ts.  Copyright (c) 2013 Microsoft Corporation.
//     - part of SandLib library.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
//---- note: these are "this" functions - assumes "this" is the array pointer ----
var vp;
(function (vp) {
    /// colName is optional; if specified, array entires will be treated as records and colName will be used a key
    /// to extract the value to be summed.  If not specified, array entries will be treated like numbers and averaged directly.
    function arrayAvg(colNameOrCallback) {
        var total = 0;
        var count = 0;
        if (vp.utils.isFunction(colNameOrCallback)) {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = colNameOrCallback(value, i);
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                    count++;
                }
            }
        }
        else if (vp.utils.isString(colNameOrCallback)) {
            var colName = colNameOrCallback;
            for (var i = 0; i < this.length; i++) {
                var value = this[i][colName];
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                    count++;
                }
            }
        }
        else {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                    count++;
                }
            }
        }
        var avg = (count) ? total / count : 0;
        return avg;
    }
    /// colName is optional; if specified, array entires will be treated as records and colName will be used a key
    /// to extract the value to be summed.  If not specified, array entries will be treated like numbers and counted directly.
    function arrayCount(colNameOrCallback) {
        var count = 0;
        if (vp.utils.isFunction(colNameOrCallback)) {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = colNameOrCallback(value, i);
                value = parseFloat(value);
                if (isFinite(value)) {
                    count++;
                }
            }
        }
        else if (vp.utils.isString(colNameOrCallback)) {
            var colName = colNameOrCallback;
            for (var i = 0; i < this.length; i++) {
                var value = this[i][colName];
                value = parseFloat(value);
                if (isFinite(value)) {
                    count++;
                }
            }
        }
        else {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = parseFloat(value);
                if (isFinite(value)) {
                    count++;
                }
            }
        }
        return count;
    }
    /// colName is optional; if specified, array entires will be treated as records and colName will be used a key
    /// to extract the value to be summed.  If not specified, array entries will be treated like numbers and summed directly.
    function arraySum(colNameOrCallback) {
        var total = 0;
        if (vp.utils.isFunction(colNameOrCallback)) {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = colNameOrCallback(value, i);
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                }
            }
        }
        else if (vp.utils.isString(colNameOrCallback)) {
            var colName = colNameOrCallback;
            for (var i = 0; i < this.length; i++) {
                var value = this[i][colName];
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                }
            }
        }
        else {
            for (var i = 0; i < this.length; i++) {
                var value = this[i];
                value = parseFloat(value);
                if (isFinite(value)) {
                    total += value;
                }
            }
        }
        return total;
    }
    /// signature:  arraySelect(func)
    ///     summary: creates a new array by calling the specified function with each element of the array
    ///     paramType(func): function
    ///     snippet: var aray = [3, 5, 2, 1];
    ///     snippet: var newAray = arraySelect(aray, function(n) { return 10*n; });  // newAray will be: [30, 50, 20, 10]
    ///     returns: the new array
    function arraySelect(selectFunc) {
        if (!vp.utils.isFunction(selectFunc)) {
            throw new TypeError();
        }
        //var startTime = new Date().getTime();
        var newValues = Array(this.length);
        for (var i = 0; i < this.length; i++) {
            var elem = this[i];
            var value = selectFunc(elem, i);
            newValues[i] = value;
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return newValues;
    }
    var maxStackSize = 75 * 1000; // 125,000 gives "out of stack space" on IE11
    /// signature:  arrayMin(aray)
    ///     summary: returns the item in the array with the smallest value
    ///     snippet: var aray = [3, 5, 2, 1];
    ///     snippet: var myMax = arrayMin(aray);        // myMax will be set to 1.
    ///     returns: the item in the array with the smallest value
    /// signature: arrayMin(func)
    ///     summary: returns the item in the array for which calling func produces the smallest value
    ///     paramType(func): function
    ///     snippet: var aray = [-5, 3, 0, 3];
    ///     snippet: var myMax = arrayMin(Math.abs);        // myMax will be set to 0
    ///     returns: the item in the array for which calling func produces the smallest value
    function arrayMin(itemFunc) {
        //var startTime = new Date().getTime();
        var mm = Number.MAX_VALUE;
        if (vp.utils.isFunction(itemFunc)) {
            for (var i = 0; i < this.length; i++) {
                var value = itemFunc(this[i]);
                // the below code is 2x faster than: mm = Math.max(mm, aray[i]);
                if (value < mm) {
                    mm = value;
                }
            }
        }
        else {
            //---- this top code is about 10x as fast as the botoom, but crashes with length around 150K ----
            if (this.length <= maxStackSize) {
                mm = Math.min.apply(Math, this);
            }
            else {
                for (var i = 0; i < this.length; i++) {
                    // the below code is 2x faster than: mm = Math.min(mm, aray[i]);
                    if (this[i] < mm) {
                        mm = this[i];
                    }
                }
            }
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return mm;
    }
    function arrayMax(itemFunc) {
        //var startTime = new Date().getTime();
        var mm = -Number.MAX_VALUE; // do NOT use Number.MIN_VALUE 
        if (vp.utils.isFunction(itemFunc)) {
            for (var i = 0; i < this.length; i++) {
                var value = itemFunc(this[i]);
                // the below code is 2x faster than: mm = Math.max(mm, aray[i]);
                if (value > mm) {
                    mm = value;
                }
            }
        }
        else {
            //---- this top code is about 10x as fast as the botoom, but crashes with length around 150K ----
            if (this.length <= maxStackSize) {
                mm = Math.max.apply(Math, this);
            }
            else {
                for (var i = 0; i < this.length; i++) {
                    // the below code is 2x faster than: mm = Math.max(mm, aray[i]);
                    if (this[i] > mm) {
                        mm = this[i];
                    }
                }
            }
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return mm;
    }
    /// this function groups data by 1 or more grouping columns or callback functions.  returns an 
    /// array of records:  { key: keyValue, values: recordArray }
    function arrayGroupBy() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var groupObj = {};
        //---- build fast test of callback functions (vs. col names) ----
        var callbacks = [];
        for (var k = 0; k < args.length; k++) {
            var colNameOrFunc = args[k];
            if (vp.utils.isFunction(colNameOrFunc)) {
                callbacks[k] = colNameOrFunc;
            }
        }
        //---- group the records by the specified colNames ----
        for (var i = 0; i < this.length; i++) {
            var record = this[i];
            var key = "";
            if (args.length > 0) {
                //---- build key for this record ----
                for (var k = 0; k < args.length; k++) {
                    var colName = args[k];
                    if (k > 0) {
                        key += "^";
                    }
                    if (callbacks[k]) {
                        key += callbacks[k](record);
                    }
                    else {
                        key += record[colName];
                    }
                }
            }
            else {
                //---- no keys specified - assume this is a vector of values & group by simliar values ----
                //---- watch out for undefined, NULL, NaN, etc. ----
                key = (record) ? record.toString() : record;
            }
            var list = groupObj[key];
            if (list === undefined) {
                list = [];
                groupObj[key] = list;
            }
            list.push(record);
        }
        //---- now build list of groups to return ----
        var groups = [];
        for (var key2 in groupObj) {
            var list = groupObj[key2];
            var group = { key: key2, values: list };
            groups.push(group);
        }
        return groups;
    }
    /// return a copy of the specified array (contains references to same elements).
    /// this works true arrays and objects like Int32Array.
    function arrayClone() {
        var newAray = null;
        if (this) {
            if (this.slice) {
                newAray = this.slice(0);
            }
            else {
                newAray = [];
                for (var i = 0; i < this.length; i++) {
                    newAray[i] = this[i];
                }
            }
        }
        return newAray;
    }
    function arrayTake(count) {
        var newArray = this.slice(0, count);
        return newArray;
    }
    function arrayToArray() {
        var newArray = this.slice(0, this.length);
        return newArray;
    }
    /// signature:  arrayRemove(item)
    ///     summary:    removes the specified item from the array.
    ///     paramType(item): object
    ///     snippet:    var aray = [3, 4, 5, 6];
    ///     snippet:    arrayRemove(aray, 6);         // aray should now contain [3, 4, 5]
    ///     returns:    null.
    function arrayRemove(elem) {
        var index = this.indexOf(elem);
        if (index > -1) {
            this.splice(index, 1);
        }
    }
    /// signature:  arrayRemoveAt(index)
    ///     summary:    removes the item at the specified index from the array.
    ///     paramType(index): integer number
    ///     snippet:    var aray = [3, 4, 5, 6];
    ///     snippet:    arrayRemoveAt(aray, 0);         // aray should now contain [4, 5, 6]
    ///     returns:    null.
    function arrayRemoveAt(index) {
        if (index > -1) {
            this.splice(index, 1);
        }
    }
    function arrayInsert(index, value) {
        if (index > -1) {
            this.splice(index, 0, value);
        }
    }
    /// signature:  arrayWhere(func)
    ///     summary: creates a new array by only including elements of the current array that return true for the specified function
    ///     paramType(func): function
    ///     snippet: var aray = [3, 5, 2, 1];
    ///     snippet: var newAray = arrayWhere(aray, function(n) { return n >= 3; });  // newAray will be: [3, 5]
    ///     returns: the new array
    ///
    /// "arrayWhere" uses the callback function to conditionally include each record of the array 
    /// in the output stream.  One of our lightweight linq functions.
    function arrayWhere(whereFunc) {
        //var startTime = new Date().getTime();
        var newValues = [];
        for (var i = 0; i < this.length; i++) {
            var value = this[i];
            if (whereFunc(value, i)) {
                newValues.push(value);
            }
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return newValues;
    }
    /// signature:  arar.orderByNum()
    ///     summary: creates a copy of the current array with the items sorted in increasing numeric value
    ///     snippet: var aray = [3, 5, 2, 1];
    ///     snippet: var newAray = aray.orderByNum();     // newAray will be: [1, 2, 3, 5]
    ///     returns: the new array
    /// signature:  aray.orderByNum(func)
    ///     summary: creates a copy of the current array with the items sorted in increasing numeric value, using value returned from calling "func"
    ///     paramType(func): function
    ///     snippet: var aray = [-3, 5, -2, 1];
    ///     snippet: var newAray = aray.orderByNum(Math.abs);     // newAray will be: [1, 2, 3, 5]
    ///     returns: the new array
    ///
    /// "orderByNum" uses the callback function to produce a key for each record in the 
    /// array so the array can be sorted.  One of the VuePlotCore lightweight linq functions.
    function arrayOrderByNum(keyFunc) {
        //var startTime = new Date().getTime();
        var newValues = this.slice(0); // copy array
        if (keyFunc === undefined) {
            //---- JavaScript default: alphabetic, ascending sort ----
            newValues.sort(function (a, b) { return (+a) - (+b); });
        }
        else {
            newValues.sort(function (a, b) {
                var ka = keyFunc(a);
                var kb = keyFunc(b);
                return (+ka) - (+kb);
            });
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return newValues;
    }
    /// signature:  arar.orderByStr()
    ///
    /// "orderByStr" uses the optional callback function to produce a key for each record in the 
    /// array so the array can be sorted by string values.  One of our lightweight linq functions.
    function arrayOrderByStr(keyFunc) {
        //var startTime = new Date().getTime();
        var newValues = this.slice(0); // copy array
        if (keyFunc === undefined) {
            //---- JavaScript default: alphabetic, ascending sort ----
            newValues.sort();
        }
        else {
            newValues.sort(function (a, b) {
                var ka = keyFunc(a) + "";
                var kb = keyFunc(b) + "";
                //---- this works for strings and numbers ----
                return (ka > kb) ? 1 : ((ka == kb) ? 0 : -1);
            });
        }
        //var elapsedMs = new Date().getTime() - startTime;
        return newValues;
    }
    function memberArrayEquals(a2) {
        var eq = false;
        if (a2) {
            var eq = (this.length == a2.length);
            if (eq) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] != a2[i]) {
                        eq = false;
                        break;
                    }
                }
            }
        }
        return eq;
    }
    function arrayEquals(a1, a2) {
        var eq = true;
        if ((!a1) || (!a2)) {
            eq = (!a1) && (!a2);
        }
        else {
            eq = (a1.length == a2.length);
            if (eq) {
                for (var i = 0; i < a1.length; i++) {
                    if (a1[i] != a2[i]) {
                        eq = false;
                        break;
                    }
                }
            }
        }
        return eq;
    }
    vp.arrayEquals = arrayEquals;
    /// signature:  arrayDistinct()
    ///     summary: creates a copy of the current array with duplicated items removed
    ///     snippet: var aray = [3, 5, 3, 1];
    ///     snippet: var newAray = arrayDistinct(aray);     // newAray will be: [3, 5, 1]
    ///     returns: the new array
    /// signature:  arrayDistinct(func)
    ///     summary: creates a copy of the current array with items that produce duplicates values (when calling func) removed
    ///     paramType(func): function
    ///     snippet: var aray = [-3, 5, 3, 1];
    ///     snippet: var newAray = arrayDistinct(aray);     // newAray will be: [-3, 5, 1]
    ///     returns: the new array
    ///
    /// "distinct" returns the values in the array with duplicates removed, based on the values 
    /// returned for each array entry by the idFunc.
    function arrayDistinct(idFunc) {
        var dict = {};
        var newValues = [];
        for (var i = 0; i < this.length; i++) {
            var value = this[i];
            var id = (idFunc) ? idFunc(value) : value;
            if (!dict.hasOwnProperty(id)) {
                //---- its unique; add it ----
                dict[id] = 1;
                newValues.push(this[i]);
            }
        }
        return newValues;
    }
    function arrayGenerate(root, tagName, callBack) {
        var ss = null;
        var ss = vp.data.generateItems(root, tagName, this);
        if (callBack) {
            //---- for best perf, share one singleWrapper to wrap all objects ----
            var wrapper = vp.dom.createSingleWrapper(null);
            for (var i = 0; i < this.length; i++) {
                var dataItem = this[i];
                wrapper.elem = ss[i];
                wrapper[0] = ss[i];
                callBack(wrapper, dataItem, i);
            }
        }
        return ss;
    }
    /// this function coverts a dataset in "wide" format to "long" format.
    ///     - "wide" format is where each attribute is in its own column.
    ///     - "long" format is where all non-id attributes are represents in 2 columns: "attribute", "value".
    ///
    /// parameters: list of id columns (those that are preserved).  Other columns are transformed into name/value columns
    function arrayWideToLong(col1) {
        var records = [];
        if (this.length > 0) {
            //---- build list of OTHER columns ----
            var others = [];
            var curr = this[0];
            var preserved = vp.utils.argumentsAsArray(arguments);
            for (var cn in curr) {
                if (preserved.indexOf(cn) == -1) {
                    others.push(cn);
                }
            }
            //---- process each INPUT record ----
            for (var i = 0; i < this.length; i++) {
                var curr = this[i]; // input record
                //---- create an output record for each OTHER column ----
                for (var j = 0; j < others.length; j++) {
                    var other = others[j];
                    var record = {}; // output record
                    //---- transfer preserved columns ----
                    for (var a = 0; a < preserved.length; a++) {
                        var colName = preserved[a];
                        record[colName] = curr[colName];
                    }
                    //---- transfer OTHER column ----
                    record.attribute = other;
                    record.value = curr[other];
                    records.push(record);
                }
            }
        }
        return records;
    }
    /// this function coverts a dataset in "long" format to "wide" format.
    ///     - "wide" format is where each attribute is in its own column.
    ///     - "long" format is where all non-id attributes are represents in 2 columns: "attribute", "value".
    ///
    /// parameters: 
    ///     - array of id columns (to define a change in the logical record)
    ///     - attributeColName
    ///     - valueColName
    function arrayLongToWide(idColList, attributeColName, valueColName) {
        var records = [];
        if (this.length > 0) {
            //---- emit an OUTPUT record whenever the key changes or an attribute repeats ----
            var record = {};
            var newRecord = true;
            for (var i = 0; i < this.length; i++) {
                var curr = this[i];
                var changed = false;
                //---- has a column in id changed? ----
                for (var a = 0; a < idColList.length; a++) {
                    var colName = idColList[a];
                    if (curr[colName] != record[colName]) {
                        changed = true;
                        break;
                    }
                }
                //---- have this record seen this attribue before? ----
                var attrName = curr.attribute;
                if (record[attrName]) {
                    changed = true;
                }
                if (changed) {
                    if (i > 0) {
                        //---- output previous record ----
                        records.push(record);
                    }
                    record = {};
                    newRecord = true;
                }
                if (newRecord) {
                    //---- transfer id columns to new record ----
                    for (var a = 0; a < idColList.length; a++) {
                        var colName = idColList[a];
                        record[colName] = curr[colName];
                    }
                    newRecord = false;
                }
                //---- transfer name/value pairs from this record ----
                record[attrName] = curr.value;
            }
            //---- add last record ----
            records.push(record);
        }
        return records;
    }
    /// arrayReorder:  build a new array consisting of "partialValuesInOrder" and then any remaining values in "aray".
    function arrayReorder(partialValuesInOrder) {
        var outAray = [];
        var aray = this.clone();
        //---- add ordered keys ----
        for (var i = 0; i < partialValuesInOrder.length; i++) {
            var value = partialValuesInOrder[i];
            outAray.push(value);
            aray.remove(value);
        }
        //---- add remaining keys ----
        outAray = outAray.concat(aray);
        return outAray;
    }
    /// arrayRemoveValues:  return a new array consisting of elements of "arayOrig" when "values" are removed.
    function arrayRemoveValues(values) {
        var outAray = [];
        var aray = this.clone();
        //---- remove specified values ----
        for (var i = 0; i < values.length; i++) {
            var value = values[i];
            aray.remove(value);
        }
        return aray;
    }
    //---- safely extend Array and Float32Array functions (so that are NOT enumerable) ----
    //---- we extend array with each helper function using this method, so our help functions won't show up during a "for in" operation ----
    function extendArray(helperName, helperFunc) {
        if (Array.prototype[helperName] === undefined) {
            Object.defineProperty(Array.prototype, helperName, { enumerable: false, value: helperFunc });
        }
        if (Float32Array.prototype[helperName] === undefined) {
            Object.defineProperty(Float32Array.prototype, helperName, { enumerable: false, value: helperFunc });
        }
    }
    //---- now add our array helper functions ----
    extendArray("avg", arrayAvg);
    extendArray("count", arrayCount);
    extendArray("distinct", arrayDistinct);
    extendArray("equals", memberArrayEquals);
    extendArray("generate", arrayGenerate);
    extendArray("groupBy", arrayGroupBy);
    extendArray("max", arrayMax);
    extendArray("min", arrayMin);
    extendArray("orderByNum", arrayOrderByNum);
    extendArray("orderByStr", arrayOrderByStr);
    extendArray("remove", arrayRemove);
    extendArray("removeAt", arrayRemoveAt);
    extendArray("sum", arraySum);
    extendArray("take", arrayTake);
    extendArray("toArray", arrayToArray);
    extendArray("insert", arrayInsert);
    extendArray("where", arrayWhere);
})(vp || (vp = {}));
var vp;
(function (vp) {
    var unitTests;
    (function (unitTests) {
        //---- add "export" to include this test ----
        function testArrayFuncs() {
            vp.utils.debug("running: testArrayFuncs");
            var count = [3, 5, "abc", new Date(), "45px"].count();
            vp.utils.debug("  [4] count=" + count);
            var sum = [3, 5, "abc", new Date(), "45px"].sum();
            vp.utils.debug("  [53] sum=" + sum);
            var avg = [3, 5, "abc", new Date(), "45px"].avg();
            vp.utils.debug("  [17.667] avg=" + avg);
        }
    })(unitTests = vp.unitTests || (vp.unitTests = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// hsl.ts.  Copyright (c) 2014 Microsoft Corporation.
///     - part of the VuePlotCore library.
///     - a class that represents a color in HSL (hue, saturation, luminance) color space.
///-----------------------------------------------------------------------------------------------------------------
// Specifies an HSLA color value (stored as int + 3 floats).  Designed to support HSL color values as specified
/// for SVG.  Adapted from: http://www.w3.org/TR/css3-color/#hsl-color.  The SVG order is Hsla for creation.
/// 
/// CTR should accept 5 forms: 
///     - hsl (3-4 floats)    
///     - rgb (3-4 floats)
///     
/// Should provide 2 ToXXX() functions:
///     - toRgb()
///     - toString()
///     
/// Should provide 4 public READONLY properties:
///     - var hue
///     - var saturation
///     - var lightness
///     - var alpha
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var color;
    (function (color) {
        var hsl = (function () {
            function hsl(hue, saturation, lightness, alpha) {
                this._hue = hue;
                this._saturation = saturation;
                this._lightness = lightness;
                //---- init code ----
                this._alpha = (alpha === undefined) ? 1 : alpha;
            }
            /// public: toRgb()
            hsl.prototype.toRgb = function () {
                var rgb = vp.color.rgbFromHsl(this);
                return rgb;
            };
            hsl.prototype.toString = function () {
                return "{H: " + this._hue + ", S: " + this._saturation + ", L: " + this._lightness + ", A: " + this._alpha + "}";
            };
            hsl.prototype.lighten = function () {
                var light = Math.min(1, this._lightness + .13);
                return new vp.color.hsl(this._hue, this._saturation, light, this._alpha);
            };
            hsl.prototype.darken = function () {
                var light = Math.max(0, this._lightness - .13);
                return new vp.color.hsl(this._hue, this._saturation, light, this._alpha);
            };
            /// public: hue
            hsl.prototype.hue = function () {
                return this._hue;
            };
            /// public: saturation
            hsl.prototype.saturation = function () {
                return this._saturation;
            };
            /// public: lightness
            hsl.prototype.lightness = function () {
                return this._lightness;
            };
            /// public: alpha
            hsl.prototype.alpha = function () {
                return this._alpha;
            };
            hsl.prototype.adjustHue = function (factor) {
                var hue = this._hue * factor;
                return new hsl(hue, this._saturation, this._lightness, this._alpha);
            };
            hsl.prototype.adjustSaturation = function (factor) {
                var sat = this._saturation * factor;
                return new hsl(this._hue, sat, this._lightness, this._alpha);
            };
            hsl.prototype.adjustValue = function (factor) {
                var lightness = this._lightness * factor;
                return new hsl(this._hue, this._saturation, lightness, this._alpha);
            };
            return hsl;
        })();
        color.hsl = hsl;
        /// static public: vp.color.hslFromRgb()
        /// "rgb" should be a 3 or 4 element array of numbers, each 0-255.
        function hslFromRgb(rgb) {
            if (vp.utils.isString(rgb)) {
                rgb = vp.color.getColorFromString(rgb);
            }
            //---- convert RGB to HSL ----
            ///
            /// adapted from: http://130.113.54.154/~monger/hsl-rgb.html
            /// 
            var r = rgb[0] / 255; // convert to unit numbers
            var g = rgb[1] / 255;
            var b = rgb[2] / 255;
            var alpha = (rgb.length > 3) ? rgb[3] / 255 : 1;
            var min = Math.min(r, Math.min(g, b));
            var max = Math.max(r, Math.max(g, b));
            var lightness = (max + min) / 2;
            var saturation = 0;
            var hue = 0;
            if (max == min) {
                //---- some shade of gray ----
                saturation = 0;
                hue = 0; // actually undefined, but this is usual way to handle
            }
            else {
                if (lightness < .5) {
                    saturation = (max - min) / (max + min);
                }
                else {
                    saturation = (max - min) / (2 - max - min);
                }
                if (r == max) {
                    hue = (g - b) / (max - min);
                }
                else if (g == max) {
                    hue = 2 + (b - r) / (max - min);
                }
                else {
                    hue = 4 + (r - g) / (max - min);
                }
                //---- hue should now be in range 0..6 ----
                hue *= 60;
                if (hue < 0) {
                    hue += 360;
                }
                hue /= 360; // convert to a percentage
            }
            return new vp.color.hsl(hue, saturation, lightness, 1);
        }
        color.hslFromRgb = hslFromRgb;
        /// static public: vp.color.rgbFromHsl()
        function rgbFromHsl(hsl) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (arguments.length == 3) {
                hsl = new vp.color.hsl(arguments[0], arguments[1], arguments[2]);
            }
            //---- HSL to RGB Conversion----
            ///
            /// adapted from: http://www.w3.org/TR/2003/CR-css3-color-20030514/
            /// 
            var m2 = 0;
            var ll = hsl.lightness();
            var s = hsl.saturation();
            var hue = hsl.hue();
            if (ll <= .5) {
                m2 = ll * (s + 1);
            }
            else {
                m2 = ll + s - ll * s;
            }
            var m1 = ll * 2 - m2;
            var red = vp.color.hueToRgb(m1, m2, hue + 1 / 3);
            var green = vp.color.hueToRgb(m1, m2, hue);
            var blue = vp.color.hueToRgb(m1, m2, hue - 1 / 3);
            //---- we represent RGB values as 3-4 element numeric arrays ----
            var r = vp.data.clamp(Math.round(red * 255), 0, 255);
            var g = vp.data.clamp(Math.round(green * 255), 0, 255);
            var b = vp.data.clamp(Math.round(blue * 255), 0, 255);
            var a = vp.data.clamp(Math.round(hsl.alpha() * 255), 0, 255);
            return [r, g, b, a];
        }
        color.rgbFromHsl = rgbFromHsl;
        function hueToRgb(m1, m2, h) {
            if (h < 0) {
                h = h + 1;
            }
            if (h > 1) {
                h = h - 1;
            }
            if (h * 6 < 1) {
                return m1 + (m2 - m1) * h * 6;
            }
            if (h * 2 < 1) {
                return m2;
            }
            if (h * 3 < 2) {
                return m1 + (m2 - m1) * (2 / 3 - h) * 6;
            }
            return m1;
        }
        color.hueToRgb = hueToRgb;
        function normalizeHue(value) {
            if (value < 0) {
                value = 1 + value;
            }
            else if (value > 1) {
                value = value - 1;
            }
            value = vp.data.clamp(value, 0, 1);
            value = Math.floor(value) - value; // just fractional part
            value = Math.abs(value);
            return value;
        }
        color.normalizeHue = normalizeHue;
    })(color = vp.color || (vp.color = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// mathHelpers.ts.  Copyright (c) 2013 Microsoft Corporation.
///     - part of SandLib library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    function mathLog10(arg) {
        var result = Math.log(arg) / Math.LN10;
        return result;
    }
    function mathLog2(arg) {
        var result = Math.log(arg) / Math.LN2;
        return result;
    }
    ////---- safely extend MATH functions (so that are NOT enumerable) ----
    ////---- we extend Math with each helper function using this method, so our help functions won't show up during a "for in" operation ----
    //export function extendMath(helperName: string, helperFunc)
    //{
    //    if (Math..prototype[helperName] === undefined)
    //    {
    //        Object.defineProperty(Math.prototype, helperName, { enumerable: false, value: helperFunc });
    //    }
    //}
    //---- just directly add the static methods ----
    if (Math.log10 === undefined) {
        Math.log10 = mathLog10;
    }
    if (Math.log2 === undefined) {
        Math.log2 = mathLog2;
    }
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// scanner.ts.  Copyright (c) 2014 Microsoft Corporation.
///            part of the vuePlot library - general purpose text scanner class
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var utils;
    (function (utils) {
        //---- enum: TokenType ----
        (function (TokenType) {
            TokenType[TokenType["none"] = 0] = "none";
            TokenType[TokenType["operator"] = 1] = "operator";
            TokenType[TokenType["id"] = 2] = "id";
            TokenType[TokenType["string"] = 3] = "string";
            TokenType[TokenType["number"] = 4] = "number";
            TokenType[TokenType["comment"] = 5] = "comment";
            TokenType[TokenType["newLine"] = 6] = "newLine";
            TokenType[TokenType["space"] = 7] = "space";
            TokenType[TokenType["eof"] = 8] = "eof";
        })(utils.TokenType || (utils.TokenType = {}));
        var TokenType = utils.TokenType;
        //---- class: scanner ----
        var scanner = (function () {
            function scanner(str) {
                //---- private state ----
                this._index = 0;
                this._tokenType = TokenType.none;
                this._token = "";
                this._spacesSkipped = 0;
                this._str = "";
                this.init(str);
            }
            scanner.prototype.init = function (str) {
                this._str = str;
                this._index = 0;
                this._tokenType = TokenType.none;
                this._token = "";
            };
            /// public readonly: this._tokenType
            scanner.prototype.tokenType = function () {
                return this._tokenType;
            };
            scanner.prototype.spacesSkipped = function () {
                return (this._spacesSkipped > 0);
            };
            /// public readonly: this._token
            scanner.prototype.token = function () {
                return this._token;
            };
            scanner.prototype.restOfCmd = function () {
                return this._str.substr(this._index);
            };
            scanner.prototype.isStartOfNum = function (str, ch, index) {
                var isNum = ((ch >= '0') && (ch <= '9')) || (ch == "-");
                if (!isNum) {
                    if ((ch == ".") && (index + 1 < str.length)) {
                        var ch = str[index + 1];
                        isNum = ((ch >= '0') && (ch <= '9'));
                    }
                }
                return isNum;
            };
            scanner.prototype.isDigitChar = function (ch, isFirst) {
                var isDigit = ((ch >= "0") && (ch <= "9"));
                isDigit = isDigit || (ch == ".");
                return isDigit;
            };
            /// public: scan()
            scanner.prototype.scan = function () {
                this._spacesSkipped = 0;
                this._token = "";
                //---- skip spaces ----
                //---- note: "160" is the ISO 8859-1 char code for "non breaking space" ----
                while ((this._index < this._str.length) && ((this._str[this._index] == " ") || (this._str[this._index] == "\t") || (this._str[this._index].charCodeAt(0) == 160))) {
                    this._index++;
                    this._spacesSkipped++;
                }
                if (this._index >= this._str.length) {
                    this._tokenType = TokenType.eof;
                }
                else {
                    var ch = this._str[this._index];
                    if (ch == "\n") {
                        //---- NEWLINE ----
                        this._index++;
                        this._tokenType = TokenType.newLine;
                    }
                    else if ((this._index < this._str.length - 1) && (this._str[this._index] == "/") && (this._str[this._index + 1] == "/")) {
                        //---- END-OF-LINE COMMENT ----
                        var start = this._index;
                        this._index += 2;
                        while ((this._index < this._str.length) && (this._str[this._index] != "\n")) {
                            this._index++;
                        }
                        this._token = this._str.substring(start, this._index);
                        this._tokenType = TokenType.comment;
                    }
                    else if ((this._index < this._str.length - 1) && (this._str[this._index] == "/") && (this._str[this._index + 1] == "*")) {
                        //---- IN-PLACE COMMENT ----
                        var start = this._index;
                        this._index += 2;
                        while (this._index < this._str.length - 1) {
                            if (this._str[this._index] == "*" && this._str[this._index + 1] == "/") {
                                this._token = this._str.substring(start, this._index);
                                this._tokenType = TokenType.comment;
                                this._index += 2;
                                break;
                            }
                            this._index++;
                        }
                        this._token = this._str.substring(start, this._index);
                        this._tokenType = TokenType.comment;
                    }
                    else if ((ch == "\"") || (ch == "\'")) {
                        //---- STRING ----
                        var quote = this._str[this._index];
                        var start = this._index;
                        this._index++;
                        while ((this._index < this._str.length) && (this._str[this._index] != quote) && (this._str[this._index] != "\n")) {
                            this._index++;
                        }
                        //---- skip over ending quote ----
                        if ((this._index < this._str.length) && (this._str[this._index] == quote)) {
                            this._index++;
                        }
                        this._token = this._str.substring(start, this._index);
                        this._tokenType = TokenType.string;
                    }
                    else if (this.isStartOfNum(this._str, ch, this._index)) {
                        //---- NUMBER ----
                        var start = this._index;
                        this._index++;
                        while ((this._index < this._str.length) && (this.isDigitChar(this._str[this._index], false))) {
                            this._index++;
                        }
                        //---- see if there is a factional part ----
                        if ((this._index < this._str.length) && (this._str[this._index] == '.')) {
                            this._index++;
                            while ((this._index < this._str.length) && ((this._str[this._index] >= '0') && (this._str[this._index] <= '9'))) {
                                this._index++;
                            }
                        }
                        this._token = this._str.substring(start, this._index);
                        this._tokenType = TokenType.number;
                    }
                    else if ((ch.toLowerCase() >= 'a') && (ch.toLowerCase() <= 'z')) {
                        //---- ID ----
                        var start = this._index;
                        while (this._index < this._str.length) {
                            ch = this._str[this._index];
                            if ((ch >= '0') && (ch <= '9')) {
                            }
                            else if ((ch.toLowerCase() >= 'a') && (ch.toLowerCase() <= 'z')) {
                            }
                            else if (ch == "_") {
                            }
                            else {
                                break;
                            }
                            this._index++;
                        }
                        this._token = this._str.substring(start, this._index);
                        this._tokenType = TokenType.id;
                    }
                    else {
                        //---- OPERATOR ----
                        ///     operators: +, -, *, /, (), ++, --, <, <=, >, >=, ==, !=, =, +=, -=, *=, /=, ?:, [], !, 
                        ///         ., &&, ||
                        this._token = this._str[this._index];
                        this._index++;
                        var t2 = (this._index < this._str.length) ? (this._token + this._str[this._index]) : "";
                        //---- look for double char operator ----
                        if ((t2 == "()") || (t2 == "++") || (t2 == "--") || (t2 == "<=") || (t2 == ">=") ||
                            (t2 == "==") || (t2 == "!=") || (t2 == "<>") || (t2 == "+=") || (t2 == "-=") || (t2 == "*=") ||
                            (t2 == "/=") || (t2 == "&&") || (t2 == "||")) {
                            this._token = t2;
                            this._index++;
                        }
                        this._tokenType = TokenType.operator;
                    }
                }
                this._index = this._index; // update our class field
                return this._tokenType;
            };
            return scanner;
        })();
        utils.scanner = scanner;
    })(utils = vp.utils || (vp.utils = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// string.ts.  Copyright (c) 2013 Microsoft Corporation.
///     - part of VuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    /// signature:  stringStartsWith(prefix)
    ///     summary: returns true if the string starts with the specified prefix
    ///     paramType(prefix): string
    ///     snippet: var name = "Dr. Smith";
    ///     snippet: var isDoctor = stringStartsWith(name, "Dr. ");        // isDoctor will be true
    ///     returns: true if the string starts with the prefix; false otherwise
    function stringStartsWith(prefix) {
        var found = false;
        if (this.substr(0, prefix.length) == prefix) {
            found = true;
        }
        return found;
    }
    /// signature:  stringEndsWith(suffix)
    ///     summary: returns true if the string ends with the specified suffix
    ///     paramType(suffix): string
    ///     snippet: var animal = "cats";
    ///     snippet: var isPlural = stringEndsWith(animal, "s");        // isPlural will be true
    ///     returns: true if the string ends with the suffix; false otherwise
    function stringEndsWith(suffix) {
        var found = false;
        if (this.substr(this.length - suffix.length, suffix.length) == suffix) {
            found = true;
        }
        return found;
    }
    /// signature:  stringLeftTrim()
    ///     summary: return the string with the leading spaces removed
    ///     snippet: var name = " cat ";
    ///     snippet: var newName = stringLeftTrim(name);       // newName will be "cat "
    ///     returns: returns the newly trimmed string
    function stringLeftTrim() {
        var value = this;
        if (value.length > 0) {
            var i = 0;
            while ((value[i] == ' ') || (value[i] == '\t')) {
                i++;
                if (i >= value.length) {
                    break;
                }
            }
            value = this.substring(i);
        }
        return value;
    }
    /// signature:  stringRightTrim()
    /// summary: return the string with the trailing spaces removed
    /// snippet: var name = " cat ";
    /// snippet: var newName = stringRightTrim(name);         // newName will be " cat"
    function stringRightTrim() {
        var value = this;
        if (value.length > 0) {
            var i = value.length - 1;
            while ((value[i] == ' ') || (value[i] == '\t')) {
                i--;
                if (i < 0) {
                    break;
                }
            }
            value = this.substring(0, i + 1);
        }
        return value;
    }
    /// signature:  stringContains(str)
    ///     summary: return true if the string contains the "str" substring
    ///     paramType(str): string
    ///     snippet: var animals = "dog, cat, rabbit";
    ///     snippet: var hasCat = stringContains(animals, "cat");         // hasCat will be true
    ///     returns: returns true if the string contains the substring; false otherwise
    function stringContains(substr) {
        var index = this.indexOf(substr);
        return index > -1;
    }
    ///** replaces all occurences of 'target' with 'replacement' in 'str'. */
    //export function stringReplace(target, replacement)
    //{
    //    str = str.replace(RegExp(target, "g"), replacement);
    //    return str;
    //}
    // Changes the first character of the supplied string to upper-case.
    function stringCapitalize() {
        if (!this || (this.length == 0)) {
            return this;
        }
        var capFirstChar = this[0].toUpperCase();
        return (capFirstChar + ((this.length > 1) ? this.substring(1) : ''));
    }
    //---- safely extend String functions (so that are NOT enumerable) ----
    //---- we extend String with each helper function using this method, so our help functions won't show up during a "for in" operation ----
    function extendString(helperName, helperFunc) {
        if (String.prototype[helperName] === undefined) {
            Object.defineProperty(String.prototype, helperName, { enumerable: false, value: helperFunc });
        }
    }
    //---- now add our string helper functions ----
    extendString("startsWith", stringStartsWith);
    extendString("endsWith", stringEndsWith);
    extendString("ltrim", stringLeftTrim);
    extendString("rtrim", stringRightTrim);
    extendString("contains", stringContains);
    //extendString("replace", stringReplace);
    extendString("capitalize", stringCapitalize);
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// animation.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library 
///-----------------------------------------------------------------------------------------------------------------
/// class: animation 
/// creates a set of animations for the specified "elem". 
///
/// "elem" is an UNWRAPPED HTML/SVG/Canvas elem.
/// "duration" is the time in milliseconds that the animation lasts.
/// "easeObj" is an optional object to control start and end easing.
/// "container" is an  optional animation container (which controls multiple animations).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        var animationClass = (function () {
            function animationClass(elem, duration, easeObj, parentAnimation, delay) {
                //vp.utils.trace("ctr", "animation");
                this.ctr = "vp.animiation";
                //---- private state ----
                this._children = []; // animation objects for each obj/prop being animated
                this.elementsBeingAnimated = []; // list of elements to call "clearAnim()" when animation stops
                this.elemsToDelete = []; // elems to delete at end of animation
                this.completedFuncs = [];
                this.onFrameCallback = null;
                this.removed = []; // children that have been moved to shader list
                this.timer = null;
                this.timeStarted = undefined;
                this.delaying = false;
                this._frameCount = 0;
                if (vp.utils.isUndefined(duration)) {
                    duration = 1000;
                }
                if (easeObj === true) {
                    easeObj = new vp.eases.powEase(2);
                }
                this.elem = elem;
                this._duration = duration;
                this._easeObj = easeObj;
                this.parentAnimation = parentAnimation;
                this._delay = delay;
                if (parentAnimation) {
                    parentAnimation.add(this);
                }
                //---- start each animation JIT (when first child is added) ----
                //this.restart();
            }
            animationClass.prototype.restart = function () {
                //vp.utils.debug("animation.restart()");
                if (!this.parentAnimation) {
                    this.setTimer();
                }
                this.timeStarted = Date.now();
                this.delaying = (this._delay > 0);
                if (this.elem) {
                    this.initAnim(this.elem);
                }
                //vp.utils.debug("animation object created");
            };
            animationClass.prototype.setTimer = function () {
                var _this = this;
                this.timer = vp.animation.requestAnimationFrame(function (e) {
                    _this.animateFrame();
                });
                //vp.utils.debug("timer created: " + this.timer);
            };
            /// move the specified anim off the active children list to the "removed" list.
            animationClass.prototype.remove = function (anim) {
                this._children.remove(anim);
                this.removed.push(anim);
            };
            animationClass.prototype.frameCount = function () {
                return this._frameCount;
            };
            /// internal.
            animationClass.prototype.getSlideLoc = function (slideLoc, elem) {
                var parent = vp.utils.getCanvasOrSvgParent(elem); // vp.dom.parent(elem);
                var pw = vp.dom.width(parent);
                var ph = vp.dom.height(parent);
                //---- compute OFFSET from current position ----
                var x = 0;
                var y = 0;
                if ((slideLoc == vp.animation.SlideLoc.left) || (slideLoc == "left")) {
                    x = -pw; //-2000;
                }
                else if ((slideLoc == vp.animation.SlideLoc.right) || (slideLoc == "right")) {
                    x = pw;
                }
                else if ((slideLoc == vp.animation.SlideLoc.top) || (slideLoc == "top")) {
                    y = -ph;
                }
                else if ((slideLoc == vp.animation.SlideLoc.bottom) || (slideLoc == "bottom")) {
                    y = ph;
                }
                return { x: x, y: y };
            };
            animationClass.prototype.initAnim = function (elem) {
                elem.animation = this;
                elem._origTransform = undefined;
                elem._transformAnim = undefined;
                this.elementsBeingAnimated.push(elem);
            };
            animationClass.prototype.clearAnim = function (elem) {
                //---- delete animation properties added to elem ----
                delete elem.animation;
                delete elem._origTransform;
                delete elem._transformAnim;
            };
            animationClass.prototype.getTranslateTo = function (trans) {
                var parts = this.parseTransform(trans);
                var locTo = null;
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].name == "translate") {
                        locTo = { x: parts[i].p0, y: parts[i].p1 };
                        break;
                    }
                }
                return locTo;
            };
            /// public: applyEffect(elem, effect, isEnter)
            animationClass.prototype.applyEffect = function (elem, effect, isEnter) {
                if (isEnter) {
                    this.applyEnterEffect(elem, effect);
                }
                else {
                    this.applyExitEffect(elem, effect);
                }
            };
            /// public: applyEnterEffect(elem, effect)
            animationClass.prototype.applyEnterEffect = function (elem, effect) {
                var startingChildIndex = this._children.length;
                if (effect.fadeType) {
                    if ((effect.fadeType == vp.animation.FadeType.fade) || (effect.fadeType == "fade")) {
                        //---- use "css" (not "attr") for opacity to avoid conflicts when both are set ----
                        //elem.setAttribute("opacity", "0");
                        //---- and avoid the ".css", since that might trigger ANOTHER animation ----
                        var curOpacity = 0;
                        elem.style.opacity = curOpacity;
                        this.animateAttr(elem, "opacity", curOpacity, 1, undefined, undefined, true);
                    }
                }
                if (effect.slideLoc) {
                    var locFrom = this.getSlideLoc(effect.slideLoc, elem);
                    // CHW: use current location, even if transformed, as destination of enter effect
                    var locTo = this.getTranslateTo(vp.dom.transform(elem));
                    if (locTo == null) {
                        var elemAny = elem;
                        var origTransform = elemAny._origTransform;
                        locTo = this.getTranslateTo(origTransform);
                        if (locTo == null) {
                            //---- if elem has no transform, just use (0,0) as the "to" value ----
                            //locTo = { x: vp.dom.attr(elem, "x"), y: vp.dom.attr(elem, "y") }
                            locTo = { x: 0, y: 0 };
                        }
                    }
                    if (locFrom.x) {
                        this.animateAttr(elem, "translate.x", locFrom.x, locTo.x);
                    }
                    if (locFrom.y) {
                        this.animateAttr(elem, "translate.y", locFrom.y, locTo.y);
                    }
                }
                if (effect.growOrigin) {
                    if ((effect.growOrigin != vp.animation.GrowOrigin.none) && (effect.growOrigin != "none")) {
                        var w = vp.dom.width(elem);
                        var h = vp.dom.height(elem);
                        var x = vp.dom.left(elem);
                        var y = vp.dom.top(elem);
                        if ((effect.growOrigin == vp.animation.GrowOrigin.left) || (effect.growOrigin == "left")) {
                            this.animateAttr(elem, "scale.x", 0, 1, x, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.top) || (effect.growOrigin == "top")) {
                            this.animateAttr(elem, "scale.y", 0, 1, x, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.right) || (effect.growOrigin == "right")) {
                            this.animateAttr(elem, "scale.x", 0, 1, x + w, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.bottom) || (effect.growOrigin == "bottom")) {
                            this.animateAttr(elem, "scale.y", 0, 1, x, y + h);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.center) || (effect.growOrigin == "center")) {
                            this.animateAttr(elem, "scale.x", 0, 1, x + w / 2, y + h / 2);
                            this.animateAttr(elem, "scale.y", 0, 1, x + w / 2, y + h / 2);
                        }
                    }
                }
                if (effect.rotateAngle) {
                    var w = vp.dom.width(elem);
                    var h = vp.dom.height(elem);
                    var x = vp.dom.left(elem);
                    var y = vp.dom.top(elem);
                    this.animateAttr(elem, "rotate", effect.rotateAngle, 0, x + w / 2, y + h / 2);
                }
                //---- for enter animations, we don't want to restore the origTransform at the end ----
                var elemAny = elem;
                elemAny._origTransform = undefined;
                //---- apply first frame NOW (so we don't see pre-anim version of shape) ----
                this.animateFrameCore(0, startingChildIndex);
            };
            /// public: applyExitEffect(elem, effect)
            animationClass.prototype.applyExitEffect = function (elem, effect) {
                var startingChildIndex = this._children.length;
                if (effect.fadeType) {
                    if ((effect.fadeType == vp.animation.FadeType.fade) || (effect.fadeType == "fade")) {
                        // CHW: only set current opacity if not set
                        var curOpacity = vp.dom.css(elem, "opacity");
                        if (curOpacity == null) {
                            //---- don't use "attr" here, since it will create yet another animation child ----
                            //vp.dom.attr(elem, "opacity", 1);
                            //elem.setAttribute("opacity", "1");
                            elem.style.opacity = 1;
                        }
                        this.animateAttr(elem, "opacity", 0, undefined, undefined, undefined, true);
                    }
                }
                if (effect.slideLoc) {
                    var loc = this.getSlideLoc(effect.slideLoc, elem);
                    // CHW: TODO use current location, even if transformed, as source of exit effect
                    if (loc.x) {
                        this.animateAttr(elem, "translate.x", 0, loc.x);
                    }
                    if (loc.y) {
                        this.animateAttr(elem, "translate.y", 0, loc.y);
                    }
                }
                if (effect.growOrigin) {
                    if ((effect.growOrigin != vp.animation.GrowOrigin.none) && (effect.growOrigin != "none")) {
                        var w = vp.dom.width(elem);
                        var h = vp.dom.height(elem);
                        var x = vp.dom.left(elem);
                        var y = vp.dom.top(elem);
                        if ((effect.growOrigin == vp.animation.GrowOrigin.left) || (effect.growOrigin == "left")) {
                            this.animateAttr(elem, "scale.x", 1, 0, x, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.top) || (effect.growOrigin == "top")) {
                            this.animateAttr(elem, "scale.y", 1, 0, x, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.right) || (effect.growOrigin == "right")) {
                            this.animateAttr(elem, "scale.x", 1, 0, x + w, y);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.bottom) || (effect.growOrigin == "bottom")) {
                            this.animateAttr(elem, "scale.y", 1, 0, x, y + h);
                        }
                        else if ((effect.growOrigin == vp.animation.GrowOrigin.center) || (effect.growOrigin == "center")) {
                            this.animateAttr(elem, "scale.x", 1, 0, x + w / 2, y + h / 2);
                            this.animateAttr(elem, "scale.y", 1, 0, x + w / 2, y + h / 2);
                        }
                    }
                }
                if (effect.rotateAngle) {
                    var w = vp.dom.width(elem);
                    var h = vp.dom.height(elem);
                    var x = vp.dom.left(elem);
                    var y = vp.dom.top(elem);
                    this.animateAttr(elem, "rotate", 0, effect.rotateAngle, x + w / 2, y + h / 2);
                }
                //---- for exit animations, we don't want to restore the origTransform at the end ----
                var elemAny = elem;
                elemAny._origTransform = undefined;
                //---- apply first frame NOW (so we don't see pre-anim version of shape) ----
                this.animateFrameCore(0, startingChildIndex);
            };
            /// private.
            animationClass.prototype.getTransformObject = function (elem) {
                var elemAny = elem;
                var ta = elemAny._transformAnim;
                if (ta == null) {
                    elemAny._origTransform = vp.dom.transform(elem);
                    ta = new vp.animation.transformAnimation(this, elem);
                    elemAny._transformAnim = ta;
                    this.addAnimation(ta);
                }
                return ta;
            };
            /// private.
            animationClass.prototype.parseTransformParams = function (scanner, transObj, paramCount) {
                var paramNum = 0;
                var tt = scanner.tokenType();
                while (tt == vp.utils.TokenType.number) {
                    var pname = "p" + paramNum++;
                    transObj[pname] = scanner.token();
                    tt = scanner.scan();
                    //---- look for optional comma ----
                    if (scanner.token() == ",") {
                        tt = scanner.scan(); // skip over comma
                    }
                }
                return (paramNum == paramCount);
            };
            //---- parse a transform string into an array of transform part objects (translate, scale, rotate, skew) ----
            /// private.
            animationClass.prototype.parseTransform = function (str) {
                var parts = [];
                if (str != null) {
                    var scanner = new vp.utils.scanner(str);
                    var tt = scanner.scan();
                    var paramCounts = { scale: 2, translate: 2, rotate: 3, skew: 2 };
                    while (tt != vp.utils.TokenType.eof) {
                        if (tt != vp.utils.TokenType.id) {
                            //---- looks like an error; just stop parsing ----
                            //parts = [];
                            //break;
                            throw "Error #1 in animation.parseTransform()";
                        }
                        var transObj = { name: scanner.token() };
                        parts.push(transObj);
                        tt = scanner.scan();
                        if (scanner.token() == "(") {
                            tt = scanner.scan();
                            var counts = paramCounts[transObj.name];
                            if (!this.parseTransformParams(scanner, transObj, counts)) {
                                // CHW: handle some common cases that used to look like errors
                                if (transObj.name == "scale" && transObj["p0"]) {
                                    // scale with one parameter; second parameter should equal first
                                    transObj["p1"] = transObj["p0"];
                                }
                                else if (transObj.name == "translate" && transObj["p0"]) {
                                    // translate with one parameter; second parameter should be 0
                                    transObj["p1"] = "0";
                                }
                                else if (transObj.name == "rotate" && transObj["p0"]) {
                                    if (transObj["p2"] === undefined) {
                                        throw "Error #4 in animation.parseTransform(): expected 3 params in rotate()";
                                    }
                                }
                                else {
                                    //---- looks like an error; just stop parsing ----
                                    throw "Error #2 in animation.parseTransform()";
                                }
                            }
                            if (scanner.token() != ")") {
                                //---- looks like an error; just stop parsing ----
                                //parts = [];
                                //break;
                                throw "Error #3 in animation.parseTransform()";
                            }
                            tt = scanner.scan(); // get nextname
                        }
                    }
                }
                return parts;
            };
            /// private.
            animationClass.prototype.getFromNumber = function (elem, isStyle, name) {
                var from = null; // default, if we cannot read it from anywhere...
                var propOwner = (isStyle) ? elem.style : elem;
                // the BELOW code should be changed - it adds a direct property that later down overrides the attribute
                // for an SVG elem like "rect".
                ////---- initialize property with default value, if needed ----
                //if ((propOwner[name] === undefined) || (propOwner[name] === ""))
                //{
                //    propOwner[name] = 0;
                //}
                if (isStyle) {
                    from = vp.dom.css(elem, name);
                    if (!from) {
                        //---- wasn't specified as part of style, so get full computed style (relatively expensive call) ----
                        from = getComputedStyle(elem)[name];
                    }
                    if (vp.utils.isString(from)) {
                        var str = from;
                        if (str.endsWith("px")) {
                            str = str.substr(0, str.length - 2).trim();
                        }
                        from = +str;
                    }
                }
                else if (elem.getAttribute) {
                    var av = elem.getAttribute(name);
                    if (av) {
                        if (av.baseVal != undefined) {
                            from = vp.dom.getBaseVal(elem, name, av);
                        }
                        else if (av.value != undefined) {
                            from = parseFloat(av.value);
                        }
                        else {
                            from = parseFloat(av);
                        }
                    }
                    else {
                        //---- try style again after all ----
                        from = vp.dom.attr(elem, name);
                    }
                }
                else if (name in propOwner) {
                    if (elem.rootContainer) {
                        from = propOwner[name];
                    }
                    else {
                        from = (propOwner[name].baseVal) ? vp.dom.getBaseVal(elem, name, propOwner[name]) : 0;
                    }
                }
                if (from === undefined || from === null || isNaN(from)) {
                }
                return from;
            };
            animationClass.prototype.getFromColor = function (elem, isStyle, name) {
                var from = null;
                if (isStyle) {
                    from = elem.style[name];
                    if (!from || from == "") {
                        //---- need to call (relatively expensive) getComputedStyle ----
                        from = getComputedStyle(elem)[name];
                    }
                }
                else if (elem.getAttribute) {
                    from = elem.getAttribute(name);
                }
                else {
                    from = elem[name];
                }
                if (!from || from == "") {
                    throw "Error: could not find FROM color for property=" + name;
                }
                else {
                }
                return from;
            };
            /// private animatePointsValue()
            animationClass.prototype.animatePointsValue = function (elem, name, isStyle, fromValue, value) {
                var from = vp.dom.attr(elem, "points");
                if (from != value) {
                    var animate = new animation.pointsAnimation(this, elem, name, from, value);
                    this.addAnimation(animate);
                }
            };
            /// private animateColorValue()
            animationClass.prototype.animateColorValue = function (elem, name, isStyle, fromValue, value) {
                var from = fromValue;
                if (vp.utils.isUndefined(from)) {
                    from = this.getFromColor(elem, isStyle, name);
                }
                from = vp.color.getColorFromString(from);
                value = vp.color.getColorFromString(value);
                var areDiff = false;
                if (from != null && from.length > 0 && value != null && value.length > 0) {
                    if ((from[0] != value[0]) || (from[1] != value[1]) || (from[2] != value[2])) {
                        areDiff = true;
                    }
                    if (areDiff) {
                        var animate = new animation.colorAnimation(this, elem, name, from, value, isStyle);
                        this.addAnimation(animate);
                    }
                }
            };
            /// private animateColorValue()
            animationClass.prototype.animateTransformValue = function (elem, name, isStyle, fromValue, value) {
                var ta = this.getTransformObject(elem);
                var from = fromValue;
                if (vp.utils.isUndefined(from)) {
                    if (isStyle) {
                        from = vp.dom.css(elem, "transform");
                    }
                    else {
                        from = vp.dom.attr(elem, "transform");
                    }
                }
                //---- parse "transform" strings into theirparts ----
                var fromParts = this.parseTransform(from);
                var toParts = this.parseTransform(value);
                for (var i = 0; i < toParts.length; i++) {
                    var toPart = toParts[i];
                    var fromPart = (i < fromParts.length) ? fromParts[i] : null;
                    if ((fromPart) && (fromPart.name != toPart.name)) {
                        //---- this is an error for our current level of support ----
                        break;
                    }
                    if (toPart.name == "translate") {
                        var fromX = (fromPart) ? fromPart.p0 : 0;
                        var toX = toPart.p0;
                        var fromY = (fromPart) ? fromPart.p1 : 0;
                        var toY = toPart.p1;
                        ta.makeTransform("translate.x", fromX, toX);
                        ta.makeTransform("translate.y", fromY, toY);
                    }
                    else if (toPart.name == "scale") {
                        var fromX = (fromPart) ? fromPart.p0 : 1;
                        var toX = toPart.p0;
                        var fromY = (fromPart) ? fromPart.p1 : 1;
                        var toY = toPart.p1;
                        ta.makeTransform("scale.x", fromX, toX);
                        ta.makeTransform("scale.y", fromY, toY);
                    }
                    else if (toPart.name == "rotate") {
                        var from = (fromPart) ? fromPart.p0 : 0;
                        var to = toPart.p0;
                        ta.makeTransform("rotate", from, to, toPart.p1, toPart.p2);
                    }
                }
            };
            /// public: animateAttr() - add the specified attribute/value to children (attributes) being animated.
            animationClass.prototype.animateAttr = function (elem, name, value, value2, cx, cy, isStyle) {
                //vp.utils.debug("animateAttr: name=" + name + ", value=" + value);
                var animate = null;
                var fromValue = undefined;
                if (value2 !== undefined) {
                    fromValue = value;
                    value = value2;
                }
                if ((name == "color") || (name == "fill") || (name == "stroke")) {
                    //---- remove any previous animation using this name/element ----
                    this.removeChild(elem, name);
                    //---- COLOR value ----
                    this.animateColorValue(elem, name, isStyle, fromValue, value);
                }
                else if (name == "points") {
                    //---- remove any previous animation using this name/element ----
                    this.removeChild(elem, name);
                    //---- set of points for a line or polygon element ----
                    this.animatePointsValue(elem, name, isStyle, fromValue, value);
                }
                else if (name == "transform") {
                    //---- TRANSFORM value ----
                    this.animateTransformValue(elem, name, isStyle, fromValue, value);
                }
                else if ((name == "scale") || (name == "translate") || (name == "rotate")) {
                    //---- TRANSFORM value ----
                    var ta = this.getTransformObject(elem);
                    ta.makeTransform(name, fromValue, value, cx, cy);
                }
                else if ((name.startsWith("scale.")) || (name.startsWith("translate.")) || (name.startsWith("rotate."))) {
                    //---- TRANSFORM value ----
                    var ta = this.getTransformObject(elem);
                    ta.makeTransform(name, fromValue, value, cx, cy);
                }
                else {
                    //---- remove any previous animation using this name/element ----
                    this.removeChild(elem, name);
                    //---- NUMERIC value ----
                    var from = fromValue;
                    if (vp.utils.isUndefined(from)) {
                        from = this.getFromNumber(elem, isStyle, name);
                        if (from === undefined || from == null || isNaN(from)) {
                            from = 0;
                        }
                    }
                    //---- remove "px" at end of value ----
                    if (vp.utils.isString(value)) {
                        var str = value;
                        if (str.endsWith("px")) {
                            str = str.substr(0, str.length - 2).trim();
                            value = +str;
                        }
                    }
                    //vp.utils.debug("animation.animateAttr: [number detected], from=" + from + ", value=" + value);
                    //---- SVG (IE11 at least) seems to only retain 3 fractional digits, so compare accordingly ----
                    if (!vp.utils.unitsEq(from, value, .01)) {
                        if (name == "y" && elem.tagName == "text") {
                            var aa = 99; // debug
                        }
                        var animate = new animation.numberAnimation(this, elem, name, from, value, isStyle);
                        this.addAnimation(animate);
                    }
                }
                //---- if this is a child of a webGL canvas, add to new animatons list ----
                if (animate != null) {
                    if ((elem.rootContainer) && (elem.rootContainer.glHelper))
                        if (animation.shaderAnimationMgr) {
                            animation.shaderAnimationMgr.addNewAnimation(animate);
                        }
                }
            };
            /// public.
            animationClass.prototype.deleteElementOnCompleted = function (elem) {
                this.elemsToDelete.push(elem);
            };
            animationClass.prototype.removeChild = function (elem, name) {
                for (var i = this._children.length - 1; i >= 0; i--) {
                    var child = this._children[i];
                    if (child.element == elem && child.name == name) {
                        this._children.removeAt(i);
                        //vp.utils.debug("animation.removeChild: removed name=" + name);
                        break;
                    }
                }
            };
            /// private.
            animationClass.prototype.addAnimation = function (newChild) {
                if (newChild.name && newChild.name != "") {
                }
                if (newChild.name == "x" || newChild.name == "y") {
                }
                if ((this._children.length == 0) && (this.timer == null)) {
                    this.restart();
                }
                this._children.push(newChild);
            };
            /// called each frame to animate all contains attribute animations.  must return true when
            /// we have reached percent=1 (100%).
            animationClass.prototype.animateFrame = function () {
                //---- on first frame of first animation, see if a common setset of the GL animations ----
                //---- (those with the same duration) can be moved onto the shader animation list ---
                if (animation.shaderAnimationMgr) {
                    animation.shaderAnimationMgr.processNewAnimations();
                }
                var elapsed = Date.now() - this.timeStarted;
                if (this.delaying) {
                    //vp.utils.debug("anim: delay frame");
                    if (elapsed >= this._delay) {
                        this.delaying = false;
                        this.timeStarted = Date.now();
                        elapsed = 0;
                    }
                }
                else {
                    var percent = elapsed / this._duration;
                    if (percent > 1) {
                        percent = 1;
                    }
                    else if (percent < 0) {
                        percent = 0;
                    }
                    else {
                        //---- apply easing fuction ----
                        if (this._easeObj) {
                            percent = this._easeObj.ease(percent);
                        }
                    }
                    //vp.utils.debug("anim: percent: " + percent);
                    this.animateFrameCore(percent);
                }
                //---- if timer not cleared by onAnimatedStopped(), request another frame ----
                if (this.timer) {
                    this.setTimer();
                }
                return (percent == 1);
            };
            animationClass.prototype.children = function () {
                return this._children;
            };
            animationClass.prototype.animateFrameCore = function (percent, startingChildIndex) {
                //vp.utils.traceAniFrame(this._children.length, this._frameCount, percent);
                if (startingChildIndex !== undefined) {
                    //---- special ENTER/EXIT effect drawing before real frames start ----
                    for (var i = startingChildIndex; i < this._children.length; i++) {
                        this._children[i].animateFrame(percent);
                    }
                }
                else {
                    //---- normal frame ----
                    for (var i = 0; i < this._children.length; i++) {
                        this._children[i].animateFrame(percent);
                    }
                    this._frameCount++;
                    if (this.onFrameCallback) {
                        this.onFrameCallback(percent, this);
                    }
                }
                if (percent == 1) {
                    this.onAnimationStopped();
                }
            };
            /// public.
            animationClass.prototype.stop = function () {
                var stopped = false;
                if (true) {
                    //---- move all elems into their final position instantly ----
                    var percent = 1;
                    //vp.utils.debug("animation.stop: forcing percent=1 positions");
                    //---- experiment - try turning this off - 07/17/2014. ----
                    for (var i = 0; i < this._children.length; i++) {
                        this._children[i].animateFrame(percent);
                    }
                    this.onAnimationStopped(true);
                    stopped = true;
                }
                return stopped;
            };
            animationClass.prototype.onAnimationComplete = function (arg) {
                if (this.completedFuncs.indexOf(arg) == -1) {
                    this.completedFuncs.push(arg);
                }
                return this;
            };
            animationClass.prototype.onFrame = function (arg) {
                if (arguments.length == 0) {
                    return this.onFrameCallback;
                }
                this.onFrameCallback = arg;
                return this;
            };
            /// private.
            animationClass.prototype.onAnimationStopped = function (wasCancelled) {
                //---- stop further animations ----
                if (this.timer) {
                    clearInterval(this.timer);
                    if (!wasCancelled) {
                    }
                    this.timer = null;
                }
                //---- remove associated elements from their containers ----
                if (this.elemsToDelete.length > 0) {
                    for (var i = 0; i < this.elemsToDelete.length; i++) {
                        var elem = this.elemsToDelete[i];
                        vp.dom.remove(elem);
                        vp.utils.assert(elem.parentNode == null);
                    }
                    //vp.utils.debug("onAnimationStopped: removed children=" + this.elemsToDelete.length);
                    this.elemsToDelete = [];
                }
                for (var c = 0; c < this.completedFuncs.length; c++) {
                    var callback = this.completedFuncs[c];
                    callback(this, wasCancelled);
                }
                //---- remove this animation from the list of active animations on the container ----
                //if (this.elem.rootContainer)        // canvas element
                //{
                //    this.elem.rootContainer.removeAnimation(this);
                //}
                //---- remove the animation property so that subsequent property changes are normal ----
                var elements = this.elementsBeingAnimated;
                for (var i = 0; i < elements.length; i++) {
                    this.clearAnim(elements[i]);
                }
                if (this.elem) {
                    this.clearAnim(this.elem);
                }
                //---- note: animations are not directly reusable; all childrent must be re-added ----
                this._children = [];
                this.elementsBeingAnimated = [];
                this.elem = null;
            };
            animationClass.prototype.duration = function (value) {
                if (arguments.length == 0) {
                    return this._duration;
                }
                this._duration = value;
                return this;
            };
            animationClass.prototype.delay = function (value) {
                if (arguments.length == 0) {
                    return this._delay;
                }
                this._delay = value;
                return this;
            };
            animationClass.prototype.easeObj = function (value) {
                if (arguments.length == 0) {
                    return this._easeObj;
                }
                this._easeObj = value;
                return this;
            };
            return animationClass;
        })();
        animation.animationClass = animationClass;
        function createAnimation(elem, duration, easeObj, container, delay) {
            return new animationClass(elem, duration, easeObj, container, delay);
        }
        animation.createAnimation = createAnimation;
        function requestAnimationFrame(callback) {
            var timer = null;
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(callback);
                timer = -1;
            }
            else {
                timer = setTimeout(callback, 1000 / 60);
            }
            return timer;
        }
        animation.requestAnimationFrame = requestAnimationFrame;
        function cancelAnimationFrame(timer) {
            if (window.cancelAnimationFrame) {
                window.cancelAnimationFrame(timer);
            }
            else {
                clearTimeout(timer);
            }
        }
        animation.cancelAnimationFrame = cancelAnimationFrame;
        animation.shaderAnimationMgr = null;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// animationContainer.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library 
///   - controls multiple animation objects
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        /// class: animationContainer
        /// this is used to contain and control a set of vp.animation classes.  to keep animations
        /// crisp and in sync, a single timer is used in the container class. when stopped
        /// or all child animations are completed, the "completedFunc" is called.
        var animationContainer = (function () {
            function animationContainer() {
                this.ctr = "vp.animationContainer";
                //---- private state ----
                this.children = [];
                this.completedFunc = null;
                this.timer = null;
                this._timeStarted = null;
                this.easeObj = null;
                this.isRunning = false;
            }
            animationContainer.prototype.timeStarted = function () {
                return this._timeStarted;
            };
            /// public: add(anim)
            animationContainer.prototype.add = function (anim) {
                var _this = this;
                if (this.children.length == 0) {
                    //---- start the container when first child is added ---
                    this.timer = vp.animation.requestAnimationFrame(function (e) {
                        _this.animateFrame();
                    });
                    this._timeStarted = new Date();
                    this.isRunning = true;
                }
                this.children.push(anim);
            };
            /// public: stop()
            /// stop the running animation.
            animationContainer.prototype.stop = function () {
                var children = this.children;
                if (this.timer) {
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        child.stop();
                    }
                    this.onStoppedOrCompleted();
                }
            };
            /// public: onCompleted(completedFunc)
            /// set the callback func to be called when animation is stopped or completed.
            animationContainer.prototype.onCompleted = function (completedFuncParam) {
                this.completedFunc = completedFuncParam;
            };
            /// public: clear()
            animationContainer.prototype.clear = function () {
                this.stop();
                this.children = [];
            };
            /// private: onStoppedOrCompleted()
            /// this is called when animation container is explictly stopped or all of the child
            /// animations have completed.
            animationContainer.prototype.onStoppedOrCompleted = function () {
                clearInterval(this.timer);
                this.timer = null;
                this.isRunning = false;
                if (this.completedFunc) {
                    this.completedFunc();
                }
            };
            /// public: animateFrame()
            /// called once every 1/60 of a second or so.  its job is to call each child animation and
            /// keep track of which have completed.
            animationContainer.prototype.animateFrame = function () {
                var _this = this;
                var children = this.children;
                //---- go thru backwards, so its safe to remove entries ----
                for (var i = children.length - 1; i >= 0; i--) {
                    var child = children[i];
                    var completed = child.animateFrame();
                    if (completed) {
                        children.removeAt(i);
                    }
                }
                if (children.length == 0) {
                    this.onStoppedOrCompleted();
                }
                if (this.timer) {
                    vp.animation.requestAnimationFrame(function () {
                        _this.animateFrame();
                    });
                }
            };
            return animationContainer;
        })();
        animation.animationContainer = animationContainer;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// colorAnimation.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library
///  - animates a color.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        //---- class: colorAnimation ----
        var colorAnimation = (function () {
            function colorAnimation(parent, element, attributeName, fromColor, toColor, isStyle) {
                //vp.utils.trace("ctr", "colorAnimation");
                this.element = element;
                this.parent = parent;
                this.attributeName = attributeName;
                this.isStyle = isStyle;
                this.from = vp.color.getColorFromString(fromColor);
                this.to = vp.color.getColorFromString(toColor);
                if (!this.from) {
                    vp.utils.error("colorAnimation: 'from' is not defined");
                }
                if (!this.to) {
                    vp.utils.error("colorAnimation: 'to' is not defined");
                }
            }
            /// private: getAnimateCalue(percent)
            colorAnimation.prototype.getAnimatedValue = function (percent) {
                var from = this.from;
                var to = this.to;
                var r = Math.round(from[0] + percent * (to[0] - from[0]));
                var g = Math.round(from[1] + percent * (to[1] - from[1]));
                var b = Math.round(from[2] + percent * (to[2] - from[2]));
                var value = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
                return value;
            };
            /// public: animateFrame(percent)
            colorAnimation.prototype.animateFrame = function (percent) {
                var value = this.getAnimatedValue(percent);
                if (this.isStyle) {
                    this.element.style[this.attributeName] = value;
                }
                else {
                    this.element.setAttribute(this.attributeName, value);
                }
            };
            return colorAnimation;
        })();
        animation.colorAnimation = colorAnimation;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// eases.ts.  Copyright (c) 2014 Microsoft Corporation.
///            part of the vuePlotCore library - eases for animation.
///
/// - adapted from Microsoft WPF Framework (their ease functions).
///-----------------------------------------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vp;
(function (vp) {
    var eases;
    (function (eases) {
        //---- enum: easeMode ----
        (function (EaseMode) {
            EaseMode[EaseMode["easeIn"] = 0] = "easeIn";
            EaseMode[EaseMode["easeOut"] = 1] = "easeOut";
            EaseMode[EaseMode["easeInOut"] = 2] = "easeInOut";
        })(eases.EaseMode || (eases.EaseMode = {}));
        var EaseMode = eases.EaseMode;
        (function (BezierEaseMode) {
            BezierEaseMode[BezierEaseMode["ease"] = 0] = "ease";
            BezierEaseMode[BezierEaseMode["easeIn"] = 1] = "easeIn";
            BezierEaseMode[BezierEaseMode["easeOut"] = 2] = "easeOut";
            BezierEaseMode[BezierEaseMode["easeInOut"] = 3] = "easeInOut";
            BezierEaseMode[BezierEaseMode["linear"] = 4] = "linear";
            BezierEaseMode[BezierEaseMode["maxEase"] = 5] = "maxEase";
        })(eases.BezierEaseMode || (eases.BezierEaseMode = {}));
        var BezierEaseMode = eases.BezierEaseMode;
        //---- class: easeBase ----
        var easeBase = (function () {
            function easeBase() {
                this.easeMode = EaseMode.easeInOut;
            }
            //---- this function is overwritten by subclasses ----
            easeBase.prototype.easeCore = function (t) {
                return t;
            };
            easeBase.prototype.ease = function (t) {
                var value;
                if (this.easeMode == EaseMode.easeIn) {
                    value = this.easeCore(t);
                }
                else if (this.easeMode == EaseMode.easeOut) {
                    value = 1 - this.easeCore(1 - t);
                }
                else {
                    if (t < .5) {
                        var coreValue = this.easeCore(t * 2);
                        value = coreValue * .5;
                    }
                    else {
                        var coreValue = this.easeCore(2 * (1 - t));
                        value = (1 - coreValue) * .5 + .5;
                    }
                }
                return value;
            };
            return easeBase;
        })();
        eases.easeBase = easeBase;
        //---- class: floorEase ----
        //----      always uses the first value in a local pair of values. ----
        var floorEase = (function (_super) {
            __extends(floorEase, _super);
            function floorEase() {
                _super.apply(this, arguments);
            }
            floorEase.prototype.easeCore = function (t) {
                return 0;
            };
            return floorEase;
        })(easeBase);
        eases.floorEase = floorEase;
        //---- class: nearestNeighborEase ----
        //----      use the ease that "t" is closest to ----
        var nearestNeighborEase = (function (_super) {
            __extends(nearestNeighborEase, _super);
            function nearestNeighborEase() {
                _super.apply(this, arguments);
            }
            nearestNeighborEase.prototype.easeCore = function (t) {
                return (t < .5) ? 0 : 1;
            };
            return nearestNeighborEase;
        })(easeBase);
        eases.nearestNeighborEase = nearestNeighborEase;
        //---- class: linearEase ----
        //----      use the ease that "t" is closest to ----
        var linearEase = (function (_super) {
            __extends(linearEase, _super);
            function linearEase() {
                _super.apply(this, arguments);
            }
            linearEase.prototype.easeCore = function (t) {
                return t;
            };
            return linearEase;
        })(easeBase);
        eases.linearEase = linearEase;
        //---- class: quadraticEase ----
        var quadraticEase = (function (_super) {
            __extends(quadraticEase, _super);
            function quadraticEase() {
                _super.apply(this, arguments);
            }
            quadraticEase.prototype.easeCore = function (t) {
                return t * t;
            };
            return quadraticEase;
        })(easeBase);
        eases.quadraticEase = quadraticEase;
        //---- class: cubicEase ----
        var cubicEase = (function (_super) {
            __extends(cubicEase, _super);
            function cubicEase() {
                _super.apply(this, arguments);
            }
            cubicEase.prototype.easeCore = function (t) {
                return t * t * t;
            };
            return cubicEase;
        })(easeBase);
        eases.cubicEase = cubicEase;
        //---- class: quarticEase ----
        var quarticEase = (function (_super) {
            __extends(quarticEase, _super);
            function quarticEase() {
                _super.apply(this, arguments);
            }
            quarticEase.prototype.easeCore = function (t) {
                return t * t * t * t;
            };
            return quarticEase;
        })(easeBase);
        eases.quarticEase = quarticEase;
        //---- class: sineEase ----
        var sineEase = (function (_super) {
            __extends(sineEase, _super);
            function sineEase() {
                _super.apply(this, arguments);
            }
            sineEase.prototype.easeCore = function (t) {
                return 1 - Math.sin(Math.PI * .5 * (1 - t));
            };
            return sineEase;
        })(easeBase);
        eases.sineEase = sineEase;
        //---- class: circleEase ----
        var circleEase = (function (_super) {
            __extends(circleEase, _super);
            function circleEase() {
                _super.apply(this, arguments);
            }
            circleEase.prototype.easeCore = function (t) {
                return 1 - Math.sqrt(1 - t * t);
            };
            return circleEase;
        })(easeBase);
        eases.circleEase = circleEase;
        //---- class: backEase ----
        var backEase = (function (_super) {
            __extends(backEase, _super);
            function backEase(amplitude) {
                _super.call(this);
                this.amplitude = amplitude;
            }
            backEase.prototype.easeCore = function (t) {
                return Math.pow(t, 3.0) - t * this.amplitude * Math.sin(Math.PI * t);
            };
            return backEase;
        })(easeBase);
        eases.backEase = backEase;
        //---- class: powEase ----
        var powEase = (function (_super) {
            __extends(powEase, _super);
            function powEase(n) {
                _super.call(this);
                this.n = n;
            }
            powEase.prototype.easeCore = function (t) {
                return Math.pow(t, this.n);
            };
            return powEase;
        })(easeBase);
        eases.powEase = powEase;
        //---- class: stdEaseOut ----
        var stdEaseOut = (function (_super) {
            __extends(stdEaseOut, _super);
            function stdEaseOut() {
                _super.call(this);
                this.easeMode = EaseMode.easeOut;
            }
            stdEaseOut.prototype.easeCore = function (t) {
                return t * t;
            };
            return stdEaseOut;
        })(easeBase);
        eases.stdEaseOut = stdEaseOut;
        //---- class: expEase ----
        var expEase = (function (_super) {
            __extends(expEase, _super);
            function expEase(n) {
                _super.call(this);
                this.n = Math.max(0, n);
            }
            expEase.prototype.easeCore = function (t) {
                if (vp.utils.floatEq(0, this.n)) {
                    return t;
                }
                else {
                    return (Math.exp(this.n * t) - 1.0) / (Math.exp(this.n) - 1.0);
                }
            };
            return expEase;
        })(easeBase);
        eases.expEase = expEase;
        //---- class: springEase ----
        var springEase = (function (_super) {
            __extends(springEase, _super);
            function springEase(springiness, oscillations) {
                _super.call(this);
                this.springiness = springiness;
                this.oscillations = oscillations;
            }
            springEase.prototype.easeCore = function (t) {
                var expo = 0;
                if (vp.utils.floatEq(this.springiness, 0)) {
                    expo = t;
                }
                else {
                    expo = (Math.exp(this.springiness * t) - 1.0) / (Math.exp(this.springiness) - 1.0);
                }
                return expo * (Math.sin((Math.PI * 2.0 * this.oscillations + Math.PI * 0.5) * t));
            };
            return springEase;
        })(easeBase);
        eases.springEase = springEase;
    })(eases = vp.eases || (vp.eases = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dataAnimMgr.ts.  Copyright (c) 2014 Microsoft Corporation.
///   -part of the vuePlot library.
///   - manages a data source with respect to data changes, filtering, and related animation.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        /// class: dataAnimMgr 
        var dataAnimMgrClass = (function () {
            function dataAnimMgrClass(containerUW, pkFunc, appendSFCtor, layerId, isSeriesLayer, createTransition) {
                if (createTransition === void 0) { createTransition = true; }
                //---- private state ----
                this._enterShapes = []; // new shapes for this data change
                this._updateShapes = []; // existing shapes for this data change
                this._exitShapes = []; // exiting shapes for this data change
                this._updateRows = []; // list of rows that were "update" rows in setData()
                this._keys = {}; // dict to map data to shape (by primary key + seriesIndex)
                this._data = []; // the current set of data
                this._enterDataPairs = [];
                this._dataId = undefined;
                this._seriesCount = 1;
                this._appendNameOrCallback = null;
                //---- stats ----
                this._animStartTime = 0;
                this._animFPS = 0;
                this._shapesDrawn = 0;
                this._statsCallback = null;
                this.ctr = "vp.dataAnimMgrEx";
                this._container = ((containerUW) && (containerUW.length)) ? containerUW[0] : containerUW;
                this._pkCallback = pkFunc;
                this._appendNameOrCallback = appendSFCtor;
                this._layerId = layerId;
                this._isSeriesLayer = isSeriesLayer;
                if (createTransition) {
                    this._transition = vp.animation.createTransition(750);
                }
                if (this._pkCallback === undefined) {
                    //---- provide default key callback ----
                    this._pkCallback = vp.utils.indexKeyFunc;
                }
            }
            dataAnimMgrClass.prototype.transition = function (value) {
                if (arguments.length == 0) {
                    return this._transition;
                }
                this._transition = value;
                this.hookTransitionEvents();
                return this;
            };
            dataAnimMgrClass.prototype.hookTransitionEvents = function () {
                var _this = this;
                if (this._transition) {
                    var enter = this._transition.enter();
                    var update = this._transition.update();
                    var exit = this._transition.exit();
                    enter.onAnimationComplete(function (anim, wasCancelled) {
                        _this.onAnimationComplete(anim, wasCancelled, "ENTER");
                    });
                    update.onAnimationComplete(function (anim, wasCancelled) {
                        _this.onAnimationComplete(anim, wasCancelled, "UPDATE");
                    });
                    exit.onAnimationComplete(function (anim, wasCancelled) {
                        _this.onAnimationComplete(anim, wasCancelled, "EXIT");
                    });
                }
            };
            /** will stop all animations associated with this mgr. */
            dataAnimMgrClass.prototype.clearActiveAnimations = function () {
                if (this._transition) {
                    this._transition.clearAnimations(this);
                }
                //this._masterAnim.stop();
            };
            /// do not assume that "container" has been set here - OK to create new shapes but don't append them yet.
            dataAnimMgrClass.prototype.setData = function (newData, isNewDataSet, newDataId) {
                this.clearActiveAnimations();
                //---- merge both into existingShapes ----
                var existingShapes = this._updateShapes.concat(this._enterShapes);
                if (this._exitShapes.length > 0) {
                    //---- about to overwrite exit shapes - remove them now ----
                    this.removeExitShapesNow(-1);
                }
                this._enterShapes = [];
                this._exitShapes = [];
                this._updateShapes = [];
                this._enterDataPairs = [];
                this._updateRows = [];
                if ((isNewDataSet) || (!this._transition)) {
                    this._keys = {};
                    if (newData) {
                        //---- put all new items on "enter" ----
                        for (var i = 0; i < newData.length; i++) {
                            var pair = { dataItem: newData[i], dataIndex: i };
                            this._enterDataPairs.push(pair);
                        }
                    }
                    this._exitShapes = existingShapes;
                    if (!this._transition) {
                        //---- keep it simple and remove them all now ----
                        if (this._exitShapes.length > 0) {
                            this.removeExitShapesNow(-1);
                        }
                    }
                }
                else {
                    //---- mark all existing elements as "not yet found" ----
                    for (var i = 0; i < existingShapes.length; i++) {
                        existingShapes[i].notYetFound = true;
                    }
                    if (newData) {
                        var lastUpdateRow = -1;
                        //---- figure out split of new data into: enter, update groups ----
                        for (var i = 0; i < newData.length; i++) {
                            for (var s = 0; s < this._seriesCount; s++) {
                                var key = this.getFullKey(newData[i], i, s);
                                var uelem = this._keys[key];
                                if (uelem == undefined) {
                                    var pair = { dataItem: newData[i], dataIndex: i };
                                    this._enterDataPairs.push(pair);
                                }
                                else {
                                    uelem.notYetFound = false;
                                    //---- add "i" to  this._updateRows, on first time seen ----
                                    if (lastUpdateRow != i) {
                                        this._updateRows.push(i);
                                        lastUpdateRow = i;
                                    }
                                    //---- update data/dataIndex fields to reflect data change ----
                                    uelem.dataItem.data = newData[i];
                                    uelem.dataIndex = i;
                                    this._updateShapes.push(uelem);
                                }
                            }
                        }
                    }
                    //---- move any elements that we didn't find in the new data into the "exit" elements ----
                    for (var i = 0; i < existingShapes.length; i++) {
                        var elem = existingShapes[i];
                        if (elem.notYetFound === true) {
                            //---- remove key from keys ----
                            var key = this.getFullKey(elem.dataItem, elem.dataIndex, vp.dom.shapeId(elem));
                            this.deleteKey(elem, key);
                            //---- update dataIndex to reflect that data is not in current data[] ----
                            elem.dataIndex = -(elem.dataIndex + 1);
                            this._exitShapes.push(elem);
                        }
                    }
                }
                this._data = newData;
                this._dataId = newDataId;
                return this;
            };
            /** this is only called from layers that support series plotting.  It should be called after setData(), but before
            updateShapes().  */
            dataAnimMgrClass.prototype.setSeriesNames = function (value) {
                if (this._isSeriesLayer) {
                    //---- transform degenerate case to true value ----
                    if (value && value.length == 1 && value[0] == "") {
                        value = [];
                    }
                    this._pendingSeriesNames = value;
                }
            };
            dataAnimMgrClass.prototype.applySeriesNames = function () {
                if (this._updateRows.length) {
                    var data = this._data;
                    var beforeList = this._seriesNames;
                    if (!beforeList) {
                        beforeList = [];
                    }
                    var afterList = this._pendingSeriesNames;
                    if (!afterList) {
                        afterList = [];
                    }
                    //---- build a seriesIndex update table to map from before si to after si ----
                    var seriesUpdateTable = {};
                    for (var i = 0; i < beforeList.length; i++) {
                        var beforeName = beforeList[i];
                        var afterIndex = afterList.indexOf(beforeName);
                        seriesUpdateTable[i] = afterIndex;
                    }
                    //---- first pass - REMOVE old series ----
                    for (var j = this._updateShapes.length - 1; j >= 0; j--) {
                        var elem = this._updateShapes[j];
                        var si = seriesUpdateTable[elem.dataItem.shapeId];
                        if (si == -1) {
                            this._updateShapes.removeAt(j);
                            this._exitShapes.push(elem);
                            //---- remove key from keys ----
                            var key = this.getFullKey(elem.dataItem, elem.dataIndex, vp.dom.shapeId(elem));
                            this.deleteKey(elem, key);
                            //---- use seriesIndex=0 to ensure it gets processed in updateShapes() ----
                            elem.dataItem.shapeId = 0;
                        }
                    }
                    //---- second pass: UPDATE series index of shapes (to be relative to afterList) ----
                    for (var j = this._updateShapes.length - 1; j >= 0; j--) {
                        var elem = this._updateShapes[j];
                        var si = seriesUpdateTable[elem.dataItem.shapeId];
                        if (si > -1) {
                            //---- delete OLD key, if it belongs to elem ----
                            var key = this.getFullKey(elem.dataItem, elem.dataIndex, vp.dom.shapeId(elem));
                            if (this._keys[key] == elem) {
                                this.deleteKey(elem, key);
                            }
                            //---- UPDATE seriesIndex ----
                            elem.dataItem.shapeId = si;
                            //---- add NEW key ----
                            var key = this.getFullKey(elem.dataItem, elem.dataIndex, vp.dom.shapeId(elem));
                            this.addKey(elem, key);
                        }
                    }
                    //---- for each afterName that is new, create a series of shapes and add to _enterShapes ----
                    for (var i = 0; i < afterList.length; i++) {
                        var afterName = afterList[i];
                        if (beforeList.indexOf(afterName) == -1) {
                            //---- afterName ADDED - create a set of shapes for it ----
                            var pairList = [];
                            for (var j = 0; j < this._updateRows.length; j++) {
                                var row = this._updateRows[j];
                                var pair = { dataItem: data[row], dataIndex: row };
                                pairList.push(pair);
                            }
                            if (pairList.length) {
                                var shapes = this.createMultipleShapes(this._appendNameOrCallback, 1, pairList);
                                this.processNewlyCreatedShapes(shapes, pairList, 1, i);
                                //---- add these new shapes to _enterShapes ----
                                this._enterShapes = this._enterShapes.concat(shapes);
                            }
                        }
                    }
                }
                this._seriesNames = this._pendingSeriesNames;
                this._pendingSeriesNames = null;
            };
            /// public: updateShapes()
            /// call this after a call to setData().
            dataAnimMgrClass.prototype.updateShapes = function (seriesIndex, totalSeries, callBack, appendStrOrFunc) {
                //---- apply pending series names (was deferred until now, when caller has set our container) ----
                if (this._pendingSeriesNames && this._container) {
                    this.applySeriesNames();
                }
                this._seriesCount = totalSeries;
                var shapesTouched = [];
                var transition = this._transition;
                //---- we called clear animations in setData(); we don't want to call in a 2nd time here ----
                //if (seriesIndex == 0)
                //{
                //    this.clearActiveAnimations();
                //}
                var start = vp.utils.now();
                this.createEnterShapesIfNeeded(this._seriesCount, appendStrOrFunc);
                var enterElapsed = vp.utils.now() - start;
                var start = vp.utils.now();
                //---- update NEW shapes WITHOUT animation ----
                for (var i = 0; i < this._enterShapes.length; i++) {
                    var uelem = this._enterShapes[i];
                    var shapeId = vp.dom.shapeId(uelem);
                    if (shapeId == seriesIndex) {
                        vp.dom.animate(uelem, 0); // turn off animation for this shape
                        callBack(uelem, uelem.dataItem, uelem.dataIndex, true);
                        shapesTouched.push(uelem);
                    }
                }
                this._animStartTime = vp.utils.now();
                if (this._updateShapes.length) {
                    this.createUpdateAnimations(seriesIndex, shapesTouched, callBack);
                }
                if (this._enterShapes.length) {
                    this.createEnterAnimations(seriesIndex, shapesTouched, callBack);
                }
                if (this._exitShapes.length) {
                    this.createExitAnimations(seriesIndex, shapesTouched, callBack);
                }
                //---- return all shapes now in plot for this dataAnimMgr / seriesIndex ----
                var wrap = vp.dom.wrapElements(shapesTouched);
                return wrap;
            };
            dataAnimMgrClass.prototype.createExitAnimations = function (seriesIndex, shapesTouched, callBack) {
                var needDelete = true;
                if (this._transition) {
                    //---- create one animation object for all EXIT elements/properties being animated ----
                    var anim = this._transition.exit();
                    if (anim && anim.duration()) {
                        //vp.utils.debug("creating EXIT animations: id=" + this._layerId);
                        var effect = this._transition.exitEffect();
                        var aniCount = 0;
                        needDelete = false;
                        //---- go thru list backwards, removing entries as we find seriesIndex matches ----
                        for (var i = this._exitShapes.length - 1; i >= 0; i--) {
                            var uelem = this._exitShapes[i];
                            if (vp.dom.shapeId(uelem) == seriesIndex) {
                                anim.initAnim(uelem);
                                anim.applyExitEffect(uelem, effect);
                                anim.deleteElementOnCompleted(uelem);
                                aniCount++;
                                this._exitShapes.removeAt(i);
                            }
                        }
                    }
                    if (aniCount) {
                    }
                }
                if (needDelete) {
                    this.removeExitShapesNow(seriesIndex);
                }
                //var deleteElapsed = vp.utils.now() - start;
            };
            dataAnimMgrClass.prototype.createEnterAnimations = function (seriesIndex, shapesTouched, callBack) {
                if (this._transition) {
                    //---- create ENTER animations ----
                    var anim = this._transition.enter();
                    var effect = this._transition.enterEffect();
                    //var enterProps = this.buildAnimationProps(this._enterAnim);
                    if (anim.duration() && effect) {
                        //vp.utils.debug("creating ENTER animations: id=" + this._layerId);
                        //---- create one animation object for all ENTER elements/properties being animated ----
                        var aniCount = 0;
                        for (var i = 0; i < this._enterShapes.length; i++) {
                            var uelem = this._enterShapes[i];
                            if (vp.dom.shapeId(uelem) == seriesIndex) {
                                anim.initAnim(uelem);
                                anim.applyEnterEffect(uelem, effect);
                                aniCount++;
                            }
                        }
                        if (aniCount) {
                        }
                    }
                }
            };
            dataAnimMgrClass.prototype.createUpdateAnimations = function (seriesIndex, shapesTouched, callBack) {
                //---- create UPDATE animations ----
                var anim = (this._transition) ? this._transition.update() : null;
                if (anim && anim.duration() == 0) {
                    anim = null;
                }
                if (anim) {
                }
                //---- update EXISTING shapes WITH animation ----
                var aniCount = 0;
                for (var i = 0; i < this._updateShapes.length; i++) {
                    var uelem = this._updateShapes[i];
                    if (vp.dom.shapeId(uelem) == seriesIndex) {
                        if (anim) {
                            anim.initAnim(uelem);
                            aniCount++;
                        }
                        callBack(uelem, uelem.dataItem, uelem.dataIndex, false);
                        shapesTouched.push(uelem);
                    }
                }
            };
            /// public: getData()
            //---- this has explict "get" signature because we need to specify "isNewDataSet" for setter ----
            dataAnimMgrClass.prototype.getData = function () {
                return this._data;
            };
            /// remove all shapes from SVG canvas; clear all structures of previous shapes.
            dataAnimMgrClass.prototype.clear = function () {
                var existingShapes = this._updateShapes.concat(this._enterShapes);
                if (this._exitShapes.length > 0) {
                    //---- about to overwrite exit shapes - remove them now ----
                    this.removeExitShapesNow(-1);
                }
                this._enterShapes = [];
                this._exitShapes = [];
                this._updateShapes = [];
                this._enterDataPairs = [];
                this._keys = [];
                this._exitShapes = existingShapes;
                existingShapes = [];
                if (!this._transition) {
                    //---- keep it simple and remove them all now ----
                    if (this._exitShapes.length > 0) {
                        this.removeExitShapesNow(-1);
                    }
                }
            };
            dataAnimMgrClass.prototype.updateWithoutDataChange = function () {
                var existingShapes = this._updateShapes.concat(this._enterShapes);
                if (this._exitShapes.length > 0) {
                    //---- about to overwrite exit shapes - remove them now ----
                    this.removeExitShapesNow(-1);
                }
                this._enterShapes = [];
                this._exitShapes = [];
                this._enterDataPairs = [];
                this._updateShapes = existingShapes;
            };
            dataAnimMgrClass.prototype.createMultipleShapes = function (appendStrOrFunc, seriesCount, enterDataPairs) {
                var elements = [];
                var start = vp.utils.now();
                var count = seriesCount * enterDataPairs.length;
                var needAppend = true;
                if (appendStrOrFunc == null) {
                    appendStrOrFunc = this._appendNameOrCallback;
                }
                if (vp.utils.isFunction(appendStrOrFunc)) {
                    for (var s = 0; s < seriesCount; s++) {
                        for (var i = 0; i < enterDataPairs.length; i++) {
                            var pair = enterDataPairs[i];
                            var elem = appendStrOrFunc(pair.dataItem, pair.dataIndex, s, this._data);
                            elements.push(elem);
                        }
                    }
                }
                else if (appendStrOrFunc) {
                    if (this._container.append) {
                        //---- perf win for CREATE and APPEND ----
                        needAppend = false;
                        //---- create and append CANVAS elements ----
                        for (var i = 0; i < count; i++) {
                            var elem = this._container.append(this._appendNameOrCallback);
                            elements.push(elem);
                        }
                    }
                    else {
                        //---- perf win for CREATE ----
                        elements = vp.dom.createElements(this._container, appendStrOrFunc, count);
                        var createElapsed = vp.utils.now() - start;
                        var start = vp.utils.now();
                    }
                }
                if (needAppend) {
                    //---- perf win for APPEND ----
                    vp.dom.appendElements(this._container, elements);
                    var appendElapsed = vp.utils.now() - start;
                }
                return elements;
            };
            /// private: createShape()
            dataAnimMgrClass.prototype.createShape = function (appendStrOrFunc, dataRecord, index, key, seriesIndex) {
                var uelem = null;
                if (appendStrOrFunc == null) {
                    appendStrOrFunc = this._appendNameOrCallback;
                }
                if (vp.utils.isFunction(appendStrOrFunc)) {
                    uelem = appendStrOrFunc(dataRecord, index, seriesIndex, this._data);
                }
                else if (appendStrOrFunc) {
                    uelem = vp.dom.createElement(this._container, appendStrOrFunc);
                }
                if (uelem != null) {
                    vp.dom.append(this._container, uelem);
                    // "dataItem" should look like: { dataId: dd, shapeId: ss, key: kk, data: dataRecord }
                    var dataItemEx = { dataId: 1, shapeId: seriesIndex, key: key, data: dataRecord };
                    uelem.dataItem = dataItemEx;
                    uelem.dataIndex = index;
                }
                return uelem;
            };
            dataAnimMgrClass.prototype.createEnterShapesIfNeeded = function (seriesCount, appendStrOrFunc) {
                if (this._enterDataPairs.length > 0) {
                    var start = vp.utils.now();
                    var newShapes = this.createMultipleShapes(appendStrOrFunc, seriesCount, this._enterDataPairs);
                    var multiElapsed = vp.utils.now() - start;
                    this.processNewlyCreatedShapes(newShapes, this._enterDataPairs, this._seriesCount);
                    this._enterDataPairs = [];
                    this._enterShapes = this._enterShapes.concat(newShapes);
                }
            };
            dataAnimMgrClass.prototype.processNewlyCreatedShapes = function (newShapes, pairList, seriesCount, seriesIndex) {
                var shapeIndex = 0;
                var start = vp.utils.now();
                //---- create shapes for all series NOW ----
                for (var s = 0; s < seriesCount; s++) {
                    //---- loop thru all ENTER pair objects ----
                    for (var i = 0; i < pairList.length; i++) {
                        var pair = pairList[i];
                        var pk = this.getPrimaryKey(pair.dataItem, pair.dataIndex);
                        var si = (seriesIndex === undefined) ? s : seriesIndex;
                        var uelem = newShapes[shapeIndex++];
                        //var uelem = createShape(appendStrOrFunc, pair.dataItem, pair.dataIndex, pk, s);
                        //enterShapes.push(uelem);
                        // "dataItem" should look like: { dataId: dd, shapeId: ss, key: kk, data: dataRecord }
                        var dataItemEx = { dataId: 1, shapeId: si, key: pk, data: pair.dataItem };
                        uelem.dataItem = dataItemEx;
                        uelem.dataIndex = pair.dataIndex;
                        var key = this.getFullKey(pair.dataItem, pair.dataIndex, si, pk);
                        this.addKey(uelem, key);
                    }
                }
                var propsElapsed = vp.utils.now() - start;
            };
            dataAnimMgrClass.prototype.addKey = function (uelem, key) {
                this._keys[key] = uelem;
            };
            dataAnimMgrClass.prototype.deleteKey = function (uelem, key) {
                delete this._keys[key];
            };
            dataAnimMgrClass.prototype.onAnimationComplete = function (anim, wasCancelled, changeType) {
                var elapsed = vp.utils.now() - this._animStartTime;
                this._animFPS = Math.round(anim.frameCount() / (elapsed / 1000));
                if (this._statsCallback) {
                    var count = this._enterShapes.length + this._updateShapes.length;
                    this._statsCallback(this._animFPS, count, elapsed);
                }
            };
            dataAnimMgrClass.prototype.removeExitShapesNow = function (seriesIndex) {
                //---- no animation, so remove EXIT shapes now ----
                //---- go thru list backwards, removing entries as we find seriesIndex matches ----
                for (var i = this._exitShapes.length - 1; i >= 0; i--) {
                    var uelem = this._exitShapes[i];
                    if ((seriesIndex == -1) || (vp.dom.shapeId(uelem) == seriesIndex)) {
                        vp.dom.remove(uelem);
                        this._exitShapes.removeAt(i);
                    }
                }
                //exitShapes = [];
                var abc = 9;
            };
            dataAnimMgrClass.prototype.lookupElement = function (dataItem, dataIndex, seriesIndex) {
                var key = this.getFullKey(dataItem, dataIndex, seriesIndex);
                return this._keys[key];
            };
            /// private: getPrimaryKey()
            dataAnimMgrClass.prototype.getPrimaryKey = function (dataItem, dataIndex) {
                var key = dataIndex;
                if (dataItem && dataItem.key) {
                    key = dataItem.key;
                }
                else if (this._pkCallback) {
                    if (vp.utils.isString(this._pkCallback)) {
                        if (dataItem) {
                            key = dataItem[this._pkCallback];
                        }
                    }
                    else {
                        key = this._pkCallback(dataItem, dataIndex);
                    }
                }
                return key;
            };
            /// private: getFullKey()
            dataAnimMgrClass.prototype.getFullKey = function (dataItem, dataIndex, seriesIndex, key) {
                if (!key) {
                    key = this.getPrimaryKey(dataItem, dataIndex);
                }
                key += "+" + seriesIndex;
                return key;
            };
            /// public property: container
            dataAnimMgrClass.prototype.container = function (value) {
                if (arguments.length === 0) {
                    return this._container;
                }
                //---- setter ----
                this._container = ((value) && (value.length)) ? value[0] : value;
                return this;
            };
            // public property: dataId
            dataAnimMgrClass.prototype.dataId = function (value) {
                if (arguments.length === 0) {
                    return this._dataId;
                }
                //---- setter ----
                this._dataId = value;
                return this;
            };
            dataAnimMgrClass.prototype.keyFunc = function (value) {
                if (arguments.length === 0) {
                    return this._pkCallback;
                }
                //---- setter ----
                this._pkCallback = value;
                return this;
            };
            /// public: getExistingShapes()
            dataAnimMgrClass.prototype.getExistingShapes = function () {
                return this._enterShapes.concat(this._updateShapes);
            };
            dataAnimMgrClass.prototype.statsCallback = function (value) {
                this._statsCallback = value;
                return this;
            };
            return dataAnimMgrClass;
        })();
        animation.dataAnimMgrClass = dataAnimMgrClass;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// effects.ts.  Copyright (c) 2014 Microsoft Corporation.
///              part of the vuePlotCore library - support for enter/exit animation effects.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        //---- animate opacity ----
        (function (FadeType) {
            FadeType[FadeType["none"] = 0] = "none";
            FadeType[FadeType["fade"] = 1] = "fade";
        })(animation.FadeType || (animation.FadeType = {}));
        var FadeType = animation.FadeType;
        //---- move shape to/from specified location ----
        (function (SlideLoc) {
            SlideLoc[SlideLoc["none"] = 0] = "none";
            SlideLoc[SlideLoc["left"] = 1] = "left";
            SlideLoc[SlideLoc["top"] = 2] = "top";
            SlideLoc[SlideLoc["right"] = 3] = "right";
            SlideLoc[SlideLoc["bottom"] = 4] = "bottom";
        })(animation.SlideLoc || (animation.SlideLoc = {}));
        var SlideLoc = animation.SlideLoc;
        (function (GrowOrigin) {
            GrowOrigin[GrowOrigin["none"] = 0] = "none";
            GrowOrigin[GrowOrigin["left"] = 1] = "left";
            GrowOrigin[GrowOrigin["top"] = 2] = "top";
            GrowOrigin[GrowOrigin["right"] = 3] = "right";
            GrowOrigin[GrowOrigin["bottom"] = 4] = "bottom";
            GrowOrigin[GrowOrigin["center"] = 5] = "center";
        })(animation.GrowOrigin || (animation.GrowOrigin = {}));
        var GrowOrigin = animation.GrowOrigin;
        //---- make an effect object ----
        function makeEffects(fadeType, slideLoc, growOrigin, rotateAngle, rotateCx, rotateCy) {
            var effect;
            if (arguments.length == 1 && vp.utils.isString(fadeType)) {
                var str = fadeType;
                fadeType = FadeType.none;
                if (str == "fade") {
                    fadeType = FadeType.fade;
                }
                else if (str.startsWith("slide")) {
                    var loc = str.substr(5).toLowerCase();
                    slideLoc = SlideLoc[loc];
                }
                else if (str.startsWith("grow")) {
                    var loc = str.substr(4).toLowerCase();
                    growOrigin = GrowOrigin[loc];
                }
                effect =
                    {
                        fadeType: fadeType, slideLoc: slideLoc, growOrigin: growOrigin,
                        rotateAngle: rotateAngle, rotateCx: rotateCx, rotateCy: rotateCy
                    };
            }
            else if (fadeType == null || vp.utils.isNumber(fadeType)) {
                effect =
                    {
                        fadeType: fadeType, slideLoc: slideLoc, growOrigin: growOrigin,
                        rotateAngle: rotateAngle, rotateCx: rotateCx, rotateCy: rotateCy
                    };
            }
            else if (arguments.length == 1 && vp.utils.isObject(fadeType)) {
                //---- its already an effects object ----
                effect = fadeType;
            }
            else {
                throw "Error - first arg to makeEffect must be a string, FadeType, or effects object";
            }
            return effect;
        }
        animation.makeEffects = makeEffects;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// numberAnimation.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library 
///   - animates a numeric property.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        //---- class: numberAnimation ----
        var numberAnimation = (function () {
            function numberAnimation(parent, element, attributeName, fromValue, toValue, isCssProperty) {
                //vp.utils.trace("ctr", "numberAnimation");
                this.parent = parent;
                this.element = element;
                this.name = attributeName;
                var from = fromValue;
                var to = toValue;
                this.isCssProperty = isCssProperty;
                //---- remove "px" from value ----
                if ((vp.utils.isString(from)) && (from.endsWith("px"))) {
                    from = from.substr(0, from.length - 2);
                }
                //---- remove "px" from value ----
                if ((vp.utils.isString(to)) && (to.endsWith("px"))) {
                    to = to.substr(0, to.length - 2);
                }
                this.from = +from;
                this.to = +to;
            }
            /// private: getAnimatedValue(percent)
            numberAnimation.prototype.getAnimatedValue = function (percent) {
                var value = this.from + percent * (this.to - this.from);
                return value;
            };
            numberAnimation.prototype.isStyled = function () {
                return this.isCssProperty;
            };
            /// public: animateFrame(percent)
            numberAnimation.prototype.animateFrame = function (percent) {
                var value = this.getAnimatedValue(percent);
                var element = this.element;
                var attributeName = this.name;
                if (this.isCssProperty) {
                    if ((attributeName != "z-index") && (attributeName != "opacity")) {
                        value = value + "px";
                    }
                    element.style[attributeName] = value;
                }
                else if (element[attributeName] == null) {
                    if (value == 0) {
                        var a = 4242;
                    }
                    element.setAttribute(attributeName, value);
                }
                else {
                    //---- normal case - set using "baseVal.value" ----
                    if (element.rootContainer) {
                        //---- its a canvas element ----
                        //element[attributeName] = value;
                        //element.markDrawNeeded();
                        element.setAttribute(attributeName, value);
                    }
                    else if (element.setAttribute) {
                        element.setAttribute(attributeName, value);
                    }
                    else {
                        //---- its an SVG/HTML element ----
                        if (element[attributeName].baseVal) {
                            element[attributeName].baseVal.value = value;
                        }
                        else {
                            element[attributeName] = value;
                        }
                    }
                }
            };
            return numberAnimation;
        })();
        animation.numberAnimation = numberAnimation;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// pointsAnimation.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library
///  - animates between 2 "points" strings (for a line or polygon element).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        //---- class: pointsAnimation ----
        var pointsAnimation = (function () {
            function pointsAnimation(parent, element, attributeName, fromPoints, toPoints) {
                //vp.utils.trace("ctr", "pointsAnimation");
                this.element = element;
                this.parent = parent;
                this.attributeName = attributeName;
                if (fromPoints === null) {
                    fromPoints = "";
                }
                if (toPoints === null) {
                    toPoints = "";
                }
                //---- trim FROM POINTS empty space / entry ----
                fromPoints = fromPoints.trim();
                if (fromPoints.endsWith(",")) {
                    fromPoints = fromPoints.substr(0, fromPoints.length - 1).trim();
                }
                //---- trim TO POINTS empty space / entry ----
                toPoints = toPoints.trim();
                if (toPoints.endsWith(",")) {
                    toPoints = toPoints.substr(0, toPoints.length - 1).trim();
                }
                var fromPairs = fromPoints.split(' ');
                var toPairs = toPoints.split(' ');
                if (fromPairs.length != toPairs.length) {
                    //---- no way to reliably animate between these - just set the value now and don't do anything during the animation ----
                    vp.dom.attr(element, attributeName, toPoints, true);
                }
                else {
                    var xFrom = [];
                    var yFrom = [];
                    var xTo = [];
                    var yTo = [];
                    var diffFound = false;
                    for (var i = 0; i < fromPairs.length; i++) {
                        var fromPair = fromPairs[i];
                        var xParts = fromPair.split(",");
                        xFrom.push(+xParts[0]);
                        yFrom.push(+xParts[1]);
                        var toPair = toPairs[i];
                        var yParts = toPair.split(",");
                        xTo.push(+yParts[0]);
                        yTo.push(+yParts[1]);
                        if (xFrom != xTo || yFrom != yTo) {
                            diffFound = true;
                        }
                    }
                    if (!diffFound) {
                        vp.utils.error("pointsAnimation: from/to points are the same");
                    }
                    if (!xFrom.length || !yFrom.length) {
                        vp.utils.error("pointsAnimation: 'from' is not a valid points string");
                    }
                    if (!xTo.length || !yTo.length) {
                        vp.utils.error("pointsAnimation: 'to' is not a valid points string");
                    }
                    this.xFrom = xFrom;
                    this.yFrom = yFrom;
                    this.xTo = xTo;
                    this.yTo = yTo;
                }
            }
            /// private: getAnimateCalue(percent)
            pointsAnimation.prototype.getAnimatedValue = function (percent) {
                var xFrom = this.xFrom;
                var yFrom = this.yFrom;
                var xTo = this.xTo;
                var yTo = this.yTo;
                var value = "";
                for (var i = 0; i < xFrom.length; i++) {
                    //var x = Math.round(xFrom[i] + percent * (xTo[i] - xFrom[i]));
                    //var y = Math.round(yFrom[i] + percent * (yTo[i] - yFrom[i]));
                    var x = xFrom[i] + percent * (xTo[i] - xFrom[i]);
                    var y = yFrom[i] + percent * (yTo[i] - yFrom[i]);
                    if (i == 0) {
                        value = x + "," + y;
                    }
                    else {
                        value += " " + x + "," + y;
                    }
                }
                return value;
            };
            /// public: animateFrame(percent)
            pointsAnimation.prototype.animateFrame = function (percent) {
                //---- make sure at least 1 "part" exists ----
                if (this.xTo && this.xTo.length) {
                    var value = this.getAnimatedValue(percent);
                    this.element.setAttribute(this.attributeName, value);
                }
            };
            return pointsAnimation;
        })();
        animation.pointsAnimation = pointsAnimation;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// transformAnimation.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library 
///   - animates a transform (scale, translation, rotation).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        //---- class: transformAnimation ----
        var transformAnimation = (function () {
            function transformAnimation(parent, element) {
                //vp.utils.trace("ctr", "transformAnimation");
                this.parts = [];
                this.parent = parent;
                this.element = element;
            }
            /// public.
            transformAnimation.prototype.makeTransform = function (name, fromValue, toValue, cx, cy) {
                //---- remove any previous PART using this name ----
                this.removePart(name);
                var part = { name: name, from: fromValue, to: toValue, cx: cx, cy: cy };
                this.parts.push(part);
            };
            transformAnimation.prototype.removePart = function (name) {
                for (var i = this.parts.length - 1; i >= 0; i--) {
                    var part = this.parts[i];
                    if (part.name == name) {
                        this.parts.removeAt(i);
                        vp.utils.debug("transformAnimation.removePart: removed name=" + name);
                        break;
                    }
                }
            };
            /// private.
            transformAnimation.prototype.getAnimatedValue = function (percent) {
                //---- build transform string from parts[] ----
                var str = "";
                var parts = this.parts;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    var nextPartName = (i < parts.length - 1) ? parts[i + 1].name : "";
                    var from = +part.from;
                    var to = +part.to;
                    var value = from + percent * (to - from);
                    if (part.name == "scale.x") {
                        var x = value;
                        var y = 1;
                        if (nextPartName == "scale.y") {
                            i++;
                            var nextPart = parts[i];
                            y = +nextPart.from + percent * (+nextPart.to - +nextPart.from);
                        }
                        if (vp.utils.isDefined(part.cx)) {
                            //---- center the scaling at cx, cy ----
                            str += "translate( " + (-part.cx * (x - 1)) + ", " + (-part.cy * (y - 1)) + ") ";
                        }
                        str += "scale(" + x + " " + y + ") ";
                    }
                    else if (part.name == "scale.y") {
                        if (vp.utils.isDefined(part.cx)) {
                            //---- center the scaling at cx, cy ----
                            str += "translate(0 " + (-part.cy * (value - 1)) + ") ";
                        }
                        str += "scale(1 " + value + ") ";
                    }
                    else if (part.name == "translate.x") {
                        var x = value;
                        var y = 0;
                        if (nextPartName == "translate.y") {
                            i++;
                            var nextPart = parts[i];
                            y = +nextPart.from + percent * (+nextPart.to - +nextPart.from);
                        }
                        str += "translate(" + x + " " + y + ") ";
                    }
                    else if (part.name == "translate.y") {
                        str += "translate(0 " + value + ") ";
                    }
                    else if (part.name == "rotate") {
                        str += "rotate(" + value;
                        if (vp.utils.isDefined(part.cx)) {
                            str += " " + part.cx + " " + part.cy;
                        }
                        str += ") ";
                    }
                }
                return str;
            };
            /// public.
            transformAnimation.prototype.animateFrame = function (percent) {
                var transformStr = this.getAnimatedValue(percent).trim();
                this.element.setAttribute("transform", transformStr);
                //if (percent == 1)
                //{
                //    vp.utils.debug("transformAnimation.animateFrame: set transform=" + transformStr);
                //}
            };
            return transformAnimation;
        })();
        animation.transformAnimation = transformAnimation;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// transition.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlot library
///    - holds animation settings that can be passed to mark.update() functions.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var animation;
    (function (animation) {
        /** Supports data-based generation of SVG text primitives.  Can be used with animations.  Core function
        is "update()". */
        var transitionClass = (function () {
            function transitionClass(duration, easeObj, delay, enterEffect, exitEffect, id) {
                //vp.utils.trace("ctr", "transition");
                if (duration === void 0) { duration = 750; }
                if (easeObj === void 0) { easeObj = true; }
                if (delay === void 0) { delay = 0; }
                if (enterEffect === void 0) { enterEffect = "slideRight"; }
                if (exitEffect === void 0) { exitEffect = "slideLeft"; }
                if (id === void 0) { id = ""; }
                this._activeClients = [];
                this._enterAnim = vp.animation.createAnimation(null, duration, easeObj, null, delay);
                this._updateAnim = vp.animation.createAnimation(null, duration, easeObj, null, delay);
                this._exitAnim = vp.animation.createAnimation(null, duration, easeObj, null, delay);
                this._enterEffect = vp.animation.makeEffects(enterEffect);
                this._exitEffect = vp.animation.makeEffects(exitEffect);
                this._id = id;
                this.hookEnterCompleted();
                this.hookUpdateCompleted();
                this.hookExitCompleted();
            }
            transitionClass.prototype.hookEnterCompleted = function () {
                var _this = this;
                if (this._enterAnim) {
                    this._enterAnim.onAnimationComplete(function (anim, wasCancelled) {
                        if (!wasCancelled) {
                            var count = _this._enterAnim.children().length;
                            if (count > 0) {
                                vp.utils.debug("anim complete: id=" + _this._id + ", changeType=ENTER" +
                                    ", count=" + count);
                            }
                        }
                    });
                }
            };
            transitionClass.prototype.hookUpdateCompleted = function () {
                var _this = this;
                if (this._updateAnim) {
                    this._updateAnim.onAnimationComplete(function (anim, wasCancelled) {
                        if (!wasCancelled) {
                            var count = _this._updateAnim.children().length;
                            if (count > 0) {
                                vp.utils.debug("anim complete: id=" + _this._id + ", changeType=UPDATE" +
                                    ", count=" + count);
                            }
                        }
                    });
                }
            };
            transitionClass.prototype.hookExitCompleted = function () {
                var _this = this;
                if (this._exitAnim) {
                    this._exitAnim.onAnimationComplete(function (anim, wasCancelled) {
                        if (!wasCancelled) {
                            var count = _this._exitAnim.children().length;
                            if (count > 0) {
                                vp.utils.debug("anim complete: id=" + _this._id + ", changeType=EXIT" +
                                    ", count=" + count);
                            }
                        }
                    });
                }
            };
            transitionClass.prototype.addClient = function (clientObj) {
                this._activeClients.push(clientObj);
            };
            /** With this call, the first associated client to have existing animations will clear all of the animations. */
            transitionClass.prototype.clearAnimations = function (clientObj) {
                if (this._activeClients.indexOf(clientObj) > -1) {
                    var enterCount = this._enterAnim.children().length;
                    var updateCount = this._updateAnim.children().length;
                    var exitCount = this._exitAnim.children().length;
                    var total = enterCount + updateCount + exitCount;
                    if (total > 0) {
                    }
                    this._activeClients = [];
                    this._enterAnim.stop();
                    this._updateAnim.stop();
                    this._exitAnim.stop();
                }
                this.addClient(clientObj);
            };
            transitionClass.prototype.enter = function (value) {
                if (arguments.length === 0) {
                    return this._enterAnim;
                }
                this._enterAnim = value;
                this.hookEnterCompleted();
                return this;
            };
            transitionClass.prototype.exit = function (value) {
                if (arguments.length === 0) {
                    return this._exitAnim;
                }
                this._exitAnim = value;
                this.hookExitCompleted();
                return this;
            };
            transitionClass.prototype.update = function (value) {
                if (arguments.length === 0) {
                    return this._updateAnim;
                }
                this._updateAnim = value;
                this.hookUpdateCompleted();
                return this;
            };
            transitionClass.prototype.enterEffect = function (value) {
                if (arguments.length === 0) {
                    return this._enterEffect;
                }
                this._enterEffect = vp.animation.makeEffects(value);
                return this;
            };
            transitionClass.prototype.exitEffect = function (value) {
                if (arguments.length === 0) {
                    return this._exitEffect;
                }
                this._exitEffect = vp.animation.makeEffects(value);
                return this;
            };
            return transitionClass;
        })();
        animation.transitionClass = transitionClass;
        function createTransition(duration, easeObj, delay, enterEffect, exitEffect, id) {
            if (duration === void 0) { duration = 750; }
            if (easeObj === void 0) { easeObj = true; }
            if (delay === void 0) { delay = 0; }
            if (enterEffect === void 0) { enterEffect = "slideRight"; }
            if (exitEffect === void 0) { exitEffect = "slideLeft"; }
            if (id === void 0) { id = ""; }
            return new transitionClass(duration, easeObj, delay, enterEffect, exitEffect, id);
        }
        animation.createTransition = createTransition;
    })(animation = vp.animation || (vp.animation = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// axisHelperBase.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** The base class for the 4 axis classes.  This class holds drawing data & properties & provides getter/setter access to them.  */
        var axisBaseClass = (function () {
            function axisBaseClass(container, axisDataOrScale, useWebGl, isCrisp, location) {
                this._ellipsesBounds = null;
                this._axisSize = 100;
                this._expandSpace = 0;
                //_rootGroup: any;
                this._positiveAutoRotation = true;
                this._firstBuild = true;
                this._lastYTickBox = 0;
                this._lastXTickBox = 0;
                this._minWidth = 0;
                this._minHeight = 0;
                //---- used by generate routines ----
                this._offset = 0;
                this._maxTextWidth = 0;
                this._maxTextHeight = 0;
                //---- data ----
                this._name = "";
                //---- options----
                this._isAxisLineVisible = true;
                this._ticksOnInside = false;
                this._labelOverflow = LabelOverflow.overWrite;
                this._labelRotation = LabelRotation.none;
                this._nameRotation = LabelRotation.none;
                this._onShade = null; // user callback for shading of any part
                //---- label sizes ----
                /** minimum spacing between largest label and avail space per label before overflow algorithm applies, for 0, 45, and 90 degree rotations. */
                this._minLabelSpacing = [4, -2, -6];
                /** when set, limits the size of the label space perpendicular to the axis.  */
                this._maxPerpendicularSize = undefined;
                //---- measurements ----
                this._labelSizes = null;
                this._szMaxText = { width: 0, height: 0 }; // max measured text size
                this._availPixelsPerLabel = 0;
                this._actualLabelRotation = 0;
                this._measuredSize = 0;
                this._isLabelsVisible = true;
                this._isTicksVisible = true;
                this._isTickBoxesVisible = true;
                this._hideInteriorLabels = false;
                this._isMinorTicksVisible = false;
                var className = "vpxAxis " + LabelLocation[location] + "Axis";
                this._rootMark = vp.marks.createGroupMark(container, className);
                this._rootElem = this._rootMark.rootElem();
                this._location = location;
                var axisData;
                if (axisDataOrScale instanceof chartFrame.axisDataClass) {
                    axisData = axisDataOrScale;
                }
                else {
                    axisData = chartFrame.createAxisData(axisDataOrScale);
                }
                this._axisData = axisData;
                this.buildDefaultDrawingParams();
                vp.select(this._rootElem)
                    .addClass("vpxAxis");
                this._isCrisp = isCrisp;
                //---- use the groupElem that markBase created as our root elem ----
                var tempParent = this._rootElem;
                var svg = null;
                var fakeLabel = null;
                var fakeNameLabel = null;
                //---- always append this for measuring ----
                if (tempParent.tagName == "CANVAS" || tempParent.rootContainer) {
                    var svg = vp.select(document.body).append("svg")
                        .addClass("vpxAxis")
                        .css("opacity", "0")
                        .id("fakeSvgForMeasuring");
                    this._fakeSvg = svg;
                    fakeLabel = this.createFakeTextElement(svg);
                    fakeNameLabel = this.createFakeNameElement(svg);
                }
                else {
                    fakeLabel = this.createFakeTextElement(vp.select(tempParent));
                    fakeNameLabel = this.createFakeNameElement(vp.select(tempParent));
                }
                //---- leave space for elippses ----
                fakeLabel.text("...");
                var rc = this.bounds(fakeLabel[0]); //.getBBox();
                this._ellipsesBounds = rc;
                this._fakeLabel = fakeLabel[0];
                this._fakeNameLabel = fakeNameLabel[0];
            }
            axisBaseClass.prototype.bounds = function (elem) {
                var rc = vp.dom.getBounds(elem);
                var svgRc = { x: rc.left, y: rc.top, width: rc.width, height: rc.height };
                return svgRc;
            };
            axisBaseClass.prototype.createFakeTextElement = function (parent) {
                var fakeLabel = parent.append("text")
                    .addClass("vpxAxisLabel")
                    .id("fakeLabelForMeasuring")
                    .css("opacity", "0")
                    .attr("x", 0)
                    .attr("y", 0);
                return fakeLabel;
            };
            axisBaseClass.prototype.createFakeNameElement = function (parent) {
                var fakeLabel = parent.append("text")
                    .addClass("vpxAxisName")
                    .id("fakeNameForMeasuring")
                    .css("opacity", "0")
                    .attr("x", 0)
                    .attr("y", 0);
                return fakeLabel;
            };
            axisBaseClass.prototype.hide = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                this._rootMark.hide(transition);
            };
            axisBaseClass.prototype.show = function (transition, showValue) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                if (showValue === false) {
                    this._rootMark.hide(transition);
                }
                else {
                    this._rootMark.show(transition);
                    if (this._firstBuild) {
                        //---- do a build without animation so that the first show call shows a valid axis ----
                        this.build(null);
                    }
                }
            };
            axisBaseClass.prototype.isVisible = function () {
                return this._rootMark.isVisible();
            };
            axisBaseClass.prototype.buildDefaultDrawingParams = function () {
                this._drawingParams =
                    {
                        //tickLength: 8, minorTickLength: 6, labelToTickPadding: 4, labelToNamePadding: 10, startPadding: 0,
                        tickLength: 12, minorTickLength: 6, labelToTickPadding: 4, labelToNamePadding: 10, startPadding: 0,
                        endPadding: 0, maxPerpendicularSize: 200,
                        axisLine: {}, label: {}, minorTick: {}, tick: {}, tickBox: {}, name: {}
                    };
            };
            axisBaseClass.prototype.clearMeasurements = function () {
                this.labelSizes(null);
                this.labelStrings(null);
            };
            axisBaseClass.prototype.build = function (transition, measureOnly, clearMeasurements) {
                if (clearMeasurements === void 0) { clearMeasurements = true; }
                if (transition === undefined) {
                    transition = this._transition;
                }
                if (clearMeasurements) {
                    this.clearMeasurements();
                }
                //---- apply drawing params to sub-marks ----
                var dp = this._drawingParams;
                this._axisLineMark.drawingParams(dp ? dp.axisLine : null);
                this._tickMark.drawingParams(dp ? dp.tick : null);
                this._tickBox.drawingParams(dp ? dp.tickBox : null);
                this._minorTickMark.drawingParams(dp ? dp.minorTick : null);
                this._labelMark.drawingParams(dp ? dp.label : null);
                this._nameMark.drawingParams(dp ? dp.name : null);
                //---- apply NAME params to name mark ----
                //---- note that LABEL params are applied during "measureAllLabels()" ----
                var drawingParams = this._nameMark.drawingParams();
                vp.marks.applyTextParams(this._fakeNameLabel, drawingParams);
                vp.dom.css(this._fakeNameLabel, "opacity", 0); // ensure fake remains hidden
                var breaks = this._axisData.getActualBreaks();
                var labels = (this._isLabelsVisible) ? this._axisData.getActualLabels(breaks) : [];
                var off = this._axisData.getOffsets(breaks);
                var tickOffsets = off.tickOffsets;
                var labelOffsets = off.labelOffsets;
                var minorOffsets = [];
                if (this._isMinorTicksVisible) {
                    minorOffsets = this._axisData.getActualMinorOffsets(breaks);
                }
                if (!this._isTicksVisible) {
                    tickOffsets = [];
                    minorOffsets = [];
                }
                if (!this._isLabelsVisible) {
                    labelOffsets = [];
                }
                else if (this._hideInteriorLabels) {
                    if (labelOffsets.length > 2) {
                        //---- use first and last ----
                        labelOffsets = [labelOffsets[0], labelOffsets[labelOffsets.length - 1]];
                        labels = [labels[0], labels[labels.length - 1]];
                    }
                }
                this._tickOffsets = tickOffsets;
                this._minorTickOffsets = minorOffsets;
                this._labelOffsets = labelOffsets;
                this._labelStrings = labels;
                this._expandSpace = this._axisData._scale.expandSpace();
                this._breakValues = breaks;
                this
                    .shadeMarks(transition, vp.data, 0, true, null, measureOnly);
                this._firstBuild = false;
            };
            ///
            /// General Note: we must call generate on each mark, even if we don't want to draw the objects.
            ///
            axisBaseClass.prototype.generateHorizontalName = function (generate, transition, isRightOrBottomAxis) {
                //---- generate NAME ----
                var drawName = (this._name != null && this._name != "");
                if (drawName && isRightOrBottomAxis) {
                    this._offset += this._drawingParams.labelToNamePadding;
                }
                if (generate) {
                    this._nameMark.generate(drawName, transition);
                }
                //---- use this estimated width on both generate and measure passes (for consistent results) ----
                this._maxTextWidth = this.getNameWidth();
                if (drawName) {
                    if (isRightOrBottomAxis) {
                        this._offset += this._maxTextWidth;
                    }
                    else {
                        this._offset += this._maxTextWidth + this._drawingParams.labelToNamePadding;
                    }
                }
            };
            axisBaseClass.prototype.generateVerticalName = function (generate, transition, isRightOrBottomAxis) {
                //---- generate NAME ----
                var drawName = (this._name != null && this._name != "");
                if (drawName && isRightOrBottomAxis) {
                    this._offset += this._drawingParams.labelToNamePadding;
                }
                if (generate) {
                    this._nameMark.generate(drawName, transition);
                }
                //---- use this estimated height on both generate and measure passes (for consistent results) ----
                this._maxTextHeight = this.getNameHeight();
                if (drawName) {
                    if (isRightOrBottomAxis) {
                        this._offset += this._maxTextHeight;
                    }
                    else {
                        this._offset += this._maxTextHeight + this._drawingParams.labelToNamePadding;
                    }
                }
            };
            axisBaseClass.prototype.generateHorizontalLabels = function (generate, transition, isRightOrBottomAxis) {
                var _this = this;
                //---- measure labels ----
                if (!this._labelSizes) {
                    this._szMaxText = this.measureAllLabels(this._labelStrings);
                }
                //---- join label data and GENERATE (even if not drawing labels) ----
                var labelData = [];
                if (this._labelSizes) {
                    labelData = this._labelOffsets.map(function (data, index) {
                        return { offset: data, label: _this._labelStrings[index], breakValue: _this._breakValues[index] };
                    });
                }
                //---- draw labels ----
                this._maxTextWidth = 0;
                var drawLabels = (labelData.length > 0);
                if (drawLabels && isRightOrBottomAxis) {
                    this._offset += this._drawingParams.labelToTickPadding;
                }
                if (generate) {
                    this._labelMark.generate(labelData, transition);
                }
                //---- use this estimated width on both generate and measure passes (for consistent results) ----
                this._maxTextWidth = this.getMaxLabelSize(true).width;
                if (drawLabels) {
                    if (isRightOrBottomAxis) {
                        this._offset += this._maxTextWidth;
                    }
                    else {
                        this._offset += this._maxTextWidth + this._drawingParams.labelToTickPadding;
                    }
                }
            };
            axisBaseClass.prototype.generateVerticalLabels = function (generate, transition, isRightOrBottomAxis) {
                var _this = this;
                //---- measure labels ----
                if (!this._labelSizes) {
                    this._szMaxText = this.measureAllLabels(this._labelStrings);
                }
                //---- join label data and GENERATE (even if not drawing labels) ----
                var labelData = [];
                if (this._labelSizes) {
                    labelData = this._labelOffsets.map(function (data, index) {
                        return { offset: data, label: _this._labelStrings[index], breakValue: _this._breakValues[index] };
                    });
                }
                //---- draw labels ----
                this._maxTextHeight = 0;
                var drawLabels = (labelData.length > 0);
                if (drawLabels && isRightOrBottomAxis) {
                    this._offset += this._drawingParams.labelToTickPadding;
                }
                if (generate) {
                    this._labelMark.generate(labelData, transition);
                }
                //---- use this estimated height on both generate and measure passes (for consistent results) ----
                this._maxTextHeight = this.getMaxLabelSize(false).height;
                if (drawLabels) {
                    if (isRightOrBottomAxis) {
                        this._offset += this._maxTextHeight;
                    }
                    else {
                        this._offset += this._maxTextHeight + this._drawingParams.labelToTickPadding;
                    }
                }
            };
            axisBaseClass.prototype.generateTicks = function (generate, transition, isRightOrBottomAxis) {
                //---- update offsets for ticks ----
                var drawTicks = ((this._tickOffsets && this._tickOffsets.length) ||
                    (this._minorTickOffsets && this._minorTickOffsets.length));
                if (!isRightOrBottomAxis) {
                    if (this._ticksOnInside || (!drawTicks)) {
                        this._offset += 0;
                    }
                    else {
                        this._offset += this._drawingParams.tickLength;
                    }
                }
                //---- draw primary and minor TICKS  ----
                this.hideTicksIfTooMany();
                if (generate) {
                    this._tickMark.generate(this._tickOffsets, transition);
                    if (this._isTickBoxesVisible) {
                        var breaks = this._axisData.getActualBreaks();
                        var tickBoxData = this._tickOffsets.map(function (data, index) {
                            return { index: index, tickOffset: data, breakValue: breaks[index] };
                        });
                        this._tickBox.generate(tickBoxData, transition);
                    }
                    this._minorTickMark.generate(this._minorTickOffsets, transition);
                }
                if (isRightOrBottomAxis) {
                    if (this._ticksOnInside || (!drawTicks)) {
                        this._offset += 0;
                    }
                    else {
                        this._offset += this._drawingParams.tickLength;
                    }
                }
            };
            axisBaseClass.prototype.generateAxisLine = function (generate, transition, isRightOrBottomAxis) {
                //---- draw axis line ----
                var drawLine = (this._isAxisLineVisible) ? [1] : [];
                if (generate) {
                    this._axisLineMark.generate(drawLine, transition);
                }
                if (!isRightOrBottomAxis) {
                    this._offset += 1; // todo: support dp.axisLine.lineSize or CSS, whichever is set
                }
            };
            axisBaseClass.prototype.getMeasuredWidth = function () {
                this.build(null, true, true);
                return this._measuredSize;
            };
            axisBaseClass.prototype.getMeasuredHeight = function () {
                this.build(null, true, true);
                return this._measuredSize;
            };
            axisBaseClass.prototype.minWidth = function (value) {
                if (arguments.length === 0) {
                    return this._minWidth;
                }
                this._minWidth = value;
                return this;
            };
            axisBaseClass.prototype.minHeight = function (value) {
                if (arguments.length === 0) {
                    return this._minHeight;
                }
                this._minHeight = value;
                return this;
            };
            axisBaseClass.prototype.tickCount = function (value) {
                if (arguments.length === 0) {
                    return this._axisData.tickCount();
                }
                this._axisData.tickCount(value);
                return this;
            };
            axisBaseClass.prototype.isLabelsVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isLabelsVisible;
                }
                this._isLabelsVisible = value;
                return this;
            };
            axisBaseClass.prototype.isTicksVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isTicksVisible;
                }
                this._isTicksVisible = value;
                return this;
            };
            axisBaseClass.prototype.isTickBoxesVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isTickBoxesVisible;
                }
                this._isTickBoxesVisible = value;
                return this;
            };
            axisBaseClass.prototype.isAxisLineVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isAxisLineVisible;
                }
                this._isAxisLineVisible = value;
                return this;
            };
            axisBaseClass.prototype.hideInteriorLabels = function (value) {
                if (arguments.length === 0) {
                    return this._hideInteriorLabels;
                }
                this._hideInteriorLabels = value;
                return this;
            };
            axisBaseClass.prototype.isMinorTicksVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isMinorTicksVisible;
                }
                this._isMinorTicksVisible = value;
                return this;
            };
            axisBaseClass.prototype.axisData = function (value) {
                if (arguments.length === 0) {
                    return this._axisData;
                }
                this._axisData = value;
                return this;
            };
            //---- to be overridden by the subclass ----
            axisBaseClass.prototype.shadeMarks = function (transition, record, index, isNew, context, measureOnly) {
                var group = vp.select(this._rootElem)
                    .addClass("vpxAxis");
            };
            axisBaseClass.prototype.getNameWidth = function () {
                var sz = this.getFinalTextSize(this._name, this._drawingParams.name, this._fakeNameLabel);
                var width = this.rotatedSize(this._nameRotation, sz.width, sz.height);
                return width;
            };
            axisBaseClass.prototype.getNameHeight = function () {
                var sz = this.getFinalTextSize(this._name, this._drawingParams.name, this._fakeNameLabel);
                var height = this.rotatedSize(this._nameRotation, sz.height, sz.width);
                return height;
            };
            axisBaseClass.prototype.getMaxLabelSize = function (isForWidth) {
                var sz = this._szMaxText;
                var actualLabelRotation = this._actualLabelRotation;
                if (actualLabelRotation == 45 || actualLabelRotation == -45) {
                    sz = this.getRotateSize45(sz.width, sz.height);
                }
                else if (actualLabelRotation == 90 || actualLabelRotation == -90) {
                    //---- sizes are flipped ----
                    sz = { width: sz.height, height: sz.width };
                }
                var perpSize = this.getActualMaxPerpendicularSize();
                if (perpSize > 0) {
                    if (isForWidth) {
                        sz.width = Math.min(sz.width, perpSize);
                    }
                    else {
                        sz.height = Math.min(sz.height, perpSize);
                    }
                }
                return sz;
            };
            axisBaseClass.prototype.horizontalTickShader = function (element, record, index, isNew, xStart, length, y) {
                if (this._ticksOnInside) {
                    vp.select(element)
                        .hLine(xStart, xStart + length, y, this._isCrisp);
                }
                else {
                    vp.select(element)
                        .hLine(xStart - length, xStart, y, this._isCrisp);
                }
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
            };
            axisBaseClass.prototype.horizontalTickBoxShader = function (element, record, index, isNew, xStart, length, yRecord) {
                var y = yRecord.tickOffset;
                if (index > 0) {
                    var lastY = this._lastYTickBox;
                    var spacer = 0;
                    var height = Math.max(0, lastY - (y + 2 * spacer));
                    var x = (this._ticksOnInside) ? xStart : (xStart - length);
                    vp.select(element)
                        .bounds(x, y + spacer, length, height, this._isCrisp);
                }
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
                this._lastYTickBox = y;
            };
            axisBaseClass.prototype.verticalTickShader = function (element, record, index, isNew, yStart, length, x) {
                if (this._ticksOnInside) {
                    vp.select(element)
                        .vLine(yStart, yStart + length, x, this._isCrisp);
                }
                else {
                    vp.select(element)
                        .vLine(yStart - length, yStart, x, this._isCrisp);
                }
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
            };
            axisBaseClass.prototype.verticalTickBoxShader = function (element, record, index, isNew, yStart, length, xRecord) {
                var x = xRecord.tickOffset;
                if (index > 0) {
                    var lastX = this._lastXTickBox;
                    var spacer = 0;
                    var width = Math.max(0, x - (lastX + 2 * spacer));
                    var y = (this._ticksOnInside) ? (yStart - length) : yStart;
                    vp.select(element)
                        .bounds(lastX + spacer, y, width, length, this._isCrisp);
                }
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
                this._lastXTickBox = x;
            };
            axisBaseClass.prototype.rootElem = function () {
                return this._rootElem;
            };
            axisBaseClass.prototype.translate = function (x, y, isCrispAdjustment) {
                if (isCrispAdjustment === undefined && this._isCrisp) {
                    isCrispAdjustment = true;
                }
                //---- magic offset only works on direct groups? ----
                vp.select(this._rootElem)
                    .translate(x, y, isCrispAdjustment);
                return this;
            };
            axisBaseClass.prototype.rotateText45 = function (text, wrapElem, alignTo, angle, drawParams, fakeLabel) {
                //var text = wrapElem.text();
                var szText = this.getFinalTextSize(text, drawParams, fakeLabel);
                var finalHeight = szText.height;
                var finalWidth = szText.width;
                var rcCurrent = this.bounds(wrapElem[0]); // .getBBox() not defined in Chrome
                var xCurrent = rcCurrent.x;
                var yCurrent = rcCurrent.y;
                var anchor = "middle";
                var valign = "middle";
                if (alignTo == vp.chartFrame.LabelLocation.top) {
                    if (angle == -45) {
                        //---- rotate at MIDDLE RIGHT to keep top of text aligned ----
                        anchor = "end";
                        var rx = xCurrent + finalHeight; // + rc.width;
                        var ry = yCurrent; // + rc.height / 2;
                        //---- after-rotation adjustments ---
                        rx += finalWidth / 2 - 12;
                        ry += 4;
                    }
                    else {
                        //---- rotate at MIDDLE LEFT to keep top of text aligned ----
                        anchor = "start";
                        var rx = xCurrent + finalHeight / 2;
                        var ry = yCurrent; // + rc.height / 2;
                        //---- after-rotation adjustments ---
                        rx += finalWidth / 2 - 12 + 2;
                        ry += 4 - 5; //-6;
                    }
                }
                else if (alignTo == vp.chartFrame.LabelLocation.bottom) {
                    if (angle == -45) {
                        //---- rotate at BOTTOM LEFT to keep top of text aligned ----
                        anchor = "start";
                        valign = "bottom";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent + finalHeight;
                        //---- after-rotation adjustments ---
                        rx += (-finalWidth / 2) + 4;
                        ry += -2; //-(rc.height + 4)
                    }
                    else {
                        //---- rotate at BOTTOM RIGHT to keep top of text aligned ----
                        anchor = "end";
                        valign = "bottom";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent + finalHeight;
                        //---- after-rotation adjustments ---
                        rx -= finalWidth / 2 + 2;
                        ry += -2; //-(rc.height + 4);
                    }
                }
                else if (alignTo == vp.chartFrame.LabelLocation.right) {
                    if (angle == -45) {
                        //---- rotate at TOP RIGHT to keep top of text aligned ----
                        valign = "top";
                        anchor = "end";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent;
                        //---- after-rotation adjustments ---
                        rx += 12;
                        ry += -8;
                    }
                    else {
                        //---- rotate at TOP RIGHT to keep top of text aligned ----
                        valign = "top";
                        anchor = "end";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent;
                        //---- after-rotation adjustments ---
                        rx += 24; //-4;
                        ry += -4;
                    }
                }
                else if (alignTo == vp.chartFrame.LabelLocation.left) {
                    if (angle == -45) {
                        //---- rotate at TOP LEFT to keep top of text aligned ----
                        valign = "top";
                        anchor = "start";
                        var rx = xCurrent;
                        var ry = yCurrent;
                        //---- after-rotation adjustments ---
                        rx += -4;
                        ry += -4;
                    }
                    else {
                        //---- rotate at TOP LEFT to keep top of text aligned ----
                        valign = "top";
                        anchor = "start";
                        var rx = xCurrent;
                        var ry = yCurrent;
                        //---- after-rotation adjustments ---
                        rx += 4;
                        ry += -8;
                    }
                }
                var rotateStr = "rotate(" + angle + ", " + rx + ", " + ry + ")";
                wrapElem
                    .attr("x", rx)
                    .attr("y", ry)
                    .attr("text-anchor", anchor)
                    .attr("transform", rotateStr);
                this.finalTextBaseline(fakeLabel, wrapElem, valign);
                var sz = this.getRotateSize45(finalWidth, finalHeight);
                return sz;
            };
            axisBaseClass.prototype.getRotateSize45 = function (width, height) {
                //---- approximate sizes for 45 degree rotation ----
                var height = .85 * width; //  Math.cos(45)*rc.height + Math.sin(45)*finalWidth;
                var width = .85 * width; // Math.cos(45)*finalWidth + Math.sin(45)*rc.height;
                return { width: width, height: height };
            };
            axisBaseClass.prototype.rotatedSize = function (rotation, normalSize, size90) {
                var newSize = normalSize;
                if (rotation == LabelRotation.rotate90 || rotation == LabelRotation.rotateMinus90) {
                    newSize = size90;
                }
                else if (rotation == LabelRotation.rotate45 || rotation == LabelRotation.rotateMinus45) {
                    newSize = Math.cos(45) * normalSize + Math.sin(45) * size90;
                }
                return newSize;
            };
            axisBaseClass.prototype.finalTextBaseline = function (fakeLabel, wrapElem, align) {
                /// must compute the delta using "fakeLabel" (since it has the final text attributes) 
                /// and then apply delta to wrapElem
                if (fakeLabel.textContent == "") {
                    fakeLabel.textContent = "A"; // text content must be set for computeTextBaselineDelta() to succeed
                }
                var delta = vp.dom.computeTextBaselineDelta(fakeLabel, align);
                wrapElem.attr("dy", delta);
            };
            axisBaseClass.prototype.labelSizes = function (value) {
                if (arguments.length === 0) {
                    var data = {
                        sizes: this._labelSizes,
                        szMaxText: this._szMaxText,
                        pixelsPerLabel: this._availPixelsPerLabel,
                        actualLabelRotation: this._actualLabelRotation,
                    };
                    if (!this._labelSizes || !this.labelSizes.length) {
                        data = null;
                    }
                    return data;
                }
                this._labelSizes = (value) ? value.sizes : null;
                this._szMaxText = (value) ? value.szMaxText : { width: 0, height: 0 };
                this._availPixelsPerLabel = (value) ? value.pixelsPerLabel : 0;
                this._actualLabelRotation = (value) ? value.actualLabelRotation : 0;
                return this;
            };
            axisBaseClass.prototype.getActualMaxPerpendicularSize = function () {
                var perpSize = (this._maxPerpendicularSize > 0) ? this._maxPerpendicularSize : this._drawingParams.maxPerpendicularSize;
                return perpSize;
            };
            axisBaseClass.prototype.getAvailablePixelsPerLabelForTruncation = function (actualLabelRotation) {
                var availPixelsPerLabel = 0;
                var perpSize = this.getActualMaxPerpendicularSize();
                var perpSize45 = Math.sqrt(2) * perpSize;
                var regSize = this._availPixelsPerLabel;
                if (this._location == vp.chartFrame.LabelLocation.left || this._location == vp.chartFrame.LabelLocation.right) {
                    //---- vertical axis ----
                    if (actualLabelRotation == 90 || actualLabelRotation == -90) {
                        availPixelsPerLabel = regSize;
                    }
                    else if (actualLabelRotation == 45 || actualLabelRotation == -45) {
                        availPixelsPerLabel = perpSize45;
                    }
                    else {
                        availPixelsPerLabel = perpSize;
                    }
                }
                else {
                    //---- horizontal axis ----
                    if (actualLabelRotation == 0) {
                        availPixelsPerLabel = regSize;
                    }
                    else if (actualLabelRotation == 45 || actualLabelRotation == -45) {
                        availPixelsPerLabel = perpSize45;
                    }
                    else {
                        availPixelsPerLabel = perpSize;
                    }
                }
                return availPixelsPerLabel;
            };
            axisBaseClass.prototype.shadeTextLabel = function (index, element, cx, cy, text, hAlign, vAlign, alignTo, returnWidth, availPixelsPerLabel) {
                var fullText = text;
                var actualLabelRotation = this._actualLabelRotation;
                var fakeLabel = this._fakeLabel;
                //---- TRUNCATE TEXT ----
                if ((availPixelsPerLabel) && (this._labelOverflow == LabelOverflow.ellipses || this._labelOverflow == LabelOverflow.truncate)) {
                    text = this.truncateText(text, availPixelsPerLabel, this._labelOverflow, fakeLabel);
                }
                var wrap = vp.select(element)
                    .attr("x", cx)
                    .attr("y", cy)
                    .attr("text-anchor", hAlign)
                    .text(text)
                    .title(fullText);
                var szLabel = this.getFinalTextSize(text, this._drawingParams.label, this._fakeLabel);
                //if (text != fullText)       // we need new text measurement
                //{
                //    rcx = element.getBBox();
                //}
                this.finalTextBaseline(fakeLabel, wrap, vAlign);
                var mySize = (returnWidth) ? szLabel.width : szLabel.height;
                if (actualLabelRotation) {
                    var result;
                    if (actualLabelRotation == 45 || actualLabelRotation == -45) {
                        result = this.rotateText45(text, wrap, alignTo, actualLabelRotation, this._drawingParams.label, fakeLabel);
                    }
                    else if (actualLabelRotation == 90 || actualLabelRotation == -90) {
                        result = this.rotateText90(text, wrap, alignTo, cx, cy, actualLabelRotation, this._drawingParams.label, fakeLabel);
                    }
                    mySize = (returnWidth) ? result.width : result.height;
                }
                else {
                }
                return mySize;
            };
            axisBaseClass.prototype.getLabelBounds = function (index, x, y, hAlign) {
                var rc = new vp.geom.rectLight(0, 0, 1, 1);
                if (this._labelSizes) {
                    rc = this._labelSizes[index];
                }
                //---- yCorrection is the number text.top is shifted by due to unstoppable alphabetic line vertical alignment ----
                var yCorrection = -rc.y;
                if (hAlign == "middle") {
                    x -= rc.width / 2;
                }
                else if (hAlign == "end") {
                    x -= rc.width;
                }
                //---- cannot modify system SVGRect; must recreate it ----
                var rcx = { x: x, y: y - yCorrection, width: rc.width, height: rc.height, yCorrection: yCorrection };
                return rcx;
            };
            axisBaseClass.prototype.rotateText90 = function (text, wrapElem, alignTo, cx, cy, angle, drawParams, fakeLabel) {
                //var text = wrapElem.text();
                var szText = this.getFinalTextSize(text, drawParams, fakeLabel);
                var finalHeight = szText.height;
                var finalWidth = szText.width;
                var rcCurrent = this.bounds(wrapElem[0]); // .getBBox();
                var xCurrent = rcCurrent.x;
                var yCurrent = rcCurrent.y;
                var anchor = "middle";
                var valign = "middle";
                //---- compute true CENTER of element (where rotation will be done) ----
                var rx = cx + finalWidth / 2;
                var ry = cy + finalHeight / 2;
                var rxChanged = false;
                var ryChanged = false;
                //---- adjustsment needed after clean rotation  tp PRESERVE ALIGNMENT ----
                if (alignTo == vp.chartFrame.LabelLocation.left) {
                    //---- ALIGN TO LEFT ----
                    rx += -finalWidth / 2 + finalHeight / 2;
                    rxChanged = true;
                    ry -= 10;
                    ryChanged = true;
                }
                else if (alignTo == vp.chartFrame.LabelLocation.right) {
                    //---- ALIGN TO RIGHT ----
                    rx += (+finalWidth / 2 - finalHeight / 2);
                    rxChanged = true;
                }
                else if (alignTo == vp.chartFrame.LabelLocation.top) {
                    //---- ALIGN TO TOP ----
                    if (angle == -90) {
                        rx += (-finalHeight / 2 - finalWidth / 2) + 7;
                        ry += (+finalWidth / 2 - finalHeight / 2) + 4 - 7;
                        rxChanged = true;
                        ryChanged = true;
                    }
                    else {
                        rx += (-finalHeight / 2 - finalWidth / 2) + 11;
                        ry += (+finalWidth / 2) - (finalHeight / 2) + 4 - 7;
                        rxChanged = true;
                        ryChanged = true;
                    }
                }
                else if (alignTo == vp.chartFrame.LabelLocation.bottom) {
                    //---- ALIGN TO BOTTOM ----
                    if (angle == -90) {
                        //---- rotate at BOTTOM LEFT to keep top of text aligned ----
                        anchor = "start";
                        valign = "bottom";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent + finalHeight;
                        //---- after-rotation adjustments ---
                        rx += (-finalWidth / 2) + 7;
                        ry += -2 + 9; //-(finalHeight + 4)
                    }
                    else {
                        //---- rotate at BOTTOM RIGHT to keep top of text aligned ----
                        anchor = "end";
                        valign = "bottom";
                        var rx = xCurrent + finalWidth;
                        var ry = yCurrent + finalHeight;
                        //---- after-rotation adjustments ---
                        rx += -(finalWidth) / 2 + 2 - 8;
                        ry += -2 + 9; //-(finalHeight + 4);
                    }
                }
                wrapElem
                    .attr("x", rx)
                    .attr("text-anchor", anchor)
                    .attr("y", ry);
                //wrapElem.textBaseline(valign);
                this.finalTextBaseline(fakeLabel, wrapElem, valign);
                //---- finally, apply the rotation ----
                var rotateStr = "rotate(" + angle + ", " + rx + ", " + ry + ")";
                wrapElem
                    .attr("transform", rotateStr);
                //--- getBBox() doesn't report rotated info, so just calc ourselves ----
                return { width: finalHeight, height: finalWidth };
            };
            /// TODO: review axisBaseClass and try to minimize the number of measurements we do.
            axisBaseClass.prototype.getFinalTextSize = function (text, drawingParams, fakeLabel) {
                /// Note: we might be animating the fontSize or fontWeight, which will affect the layout.  We only
                /// do a single layout and then animate all properties to their final value.  This means that we 
                /// must measure each label with its final drawing properties, but also preserve the current properties.
                /// To accomplish this, we use "fakeLabel" to do the measurement here. 
                fakeLabel.textContent = text;
                //vp.marks.applyTextParams(fakeLabel, drawingParams);
                var rcFake = this.bounds(fakeLabel); // .getBBox();
                return { width: rcFake.width, height: rcFake.height };
            };
            axisBaseClass.prototype.hideTicksIfTooMany = function () {
                var availAxisSize = this._axisSize - 2 * this._expandSpace;
                var pixelsPerTick = availAxisSize / this._tickOffsets.length;
                var minPixelsPerTick = 2;
                if (pixelsPerTick < minPixelsPerTick) {
                    //---- hide the ticks ----
                    this._tickOffsets = [];
                    this._minorTickOffsets = [];
                }
            };
            axisBaseClass.prototype.getActualLabelRotation = function (maxMeasuredWidth, maxMeasuredHeight, axisSize, labelCount) {
                var rotation = this._labelRotation;
                if (rotation == LabelRotation.auto) {
                    //---- can labels fit unrotated? ----
                    rotation = LabelRotation.none;
                    var pixelsAvailPerLabel = (axisSize / labelCount) - this._minLabelSpacing[0];
                    if (pixelsAvailPerLabel < maxMeasuredWidth) {
                        //---- no; try 45 degrees ----
                        if (this._positiveAutoRotation) {
                            rotation = LabelRotation.rotate45;
                        }
                        else {
                            rotation = LabelRotation.rotateMinus45;
                        }
                        pixelsAvailPerLabel = (axisSize / labelCount) - this._minLabelSpacing[1];
                        var pixelsRequired = 1.34 * maxMeasuredHeight;
                        if (pixelsAvailPerLabel < pixelsRequired) {
                            //---- no; try 90 degrees ----
                            rotation = (this._positiveAutoRotation) ? LabelRotation.rotate90 : LabelRotation.rotateMinus90;
                            pixelsAvailPerLabel = (axisSize / labelCount) - this._minLabelSpacing[2];
                            var pixelsRequired = maxMeasuredHeight;
                            if (pixelsAvailPerLabel < pixelsRequired) {
                            }
                        }
                    }
                }
                return rotation;
            };
            axisBaseClass.prototype.getAvailPixelsPerLabel = function (actualRotation, availAxisSize, labelCount) {
                var avail = 0;
                if (actualRotation == LabelRotation.none) {
                    avail = (availAxisSize / labelCount) - this._minLabelSpacing[0];
                }
                else if (actualRotation == LabelRotation.rotate45 || actualRotation == LabelRotation.rotateMinus45) {
                    avail = (availAxisSize / labelCount) - this._minLabelSpacing[1];
                }
                else if (actualRotation == LabelRotation.rotate90 || actualRotation == LabelRotation.rotateMinus90) {
                    avail = (availAxisSize / labelCount) - this._minLabelSpacing[2];
                }
                return avail;
            };
            /** See if labels can fit the axis, using rotation and trimming. */
            axisBaseClass.prototype.canLabelsFit = function (availAxisSize, labelCount, maxMeasuredWidth, maxMeasuredHeight) {
                //---- unrotated fit ----
                var availPixels0 = (availAxisSize / labelCount) - this._minLabelSpacing[0];
                var neededPixels0 = maxMeasuredWidth;
                var canFit0 = (availPixels0 >= neededPixels0);
                //---- 45 degree fit ----
                var availPixels45 = (availAxisSize / labelCount) - this._minLabelSpacing[1];
                var neededPixels45 = 1.34 * maxMeasuredHeight;
                var canFit45 = (availPixels45 >= neededPixels45);
                //---- 90 degree fit ----
                var availPixels90 = (availAxisSize / labelCount) - this._minLabelSpacing[2];
                var neededPixels90 = maxMeasuredHeight;
                var canFit90 = (availPixels90 >= neededPixels90);
                //---- different for all values of rotation -----
                var canFit = false;
                var rotation = this._labelRotation;
                if (rotation == LabelRotation.none) {
                    canFit = canFit0;
                }
                else if (rotation == LabelRotation.rotate45 || rotation == LabelRotation.rotateMinus45) {
                    canFit = canFit45;
                }
                else if (rotation == LabelRotation.rotate90 || rotation == LabelRotation.rotateMinus90) {
                    canFit = canFit90;
                }
                else if (rotation == LabelRotation.auto) {
                    canFit = (canFit0 || canFit45 || canFit90);
                }
                return canFit;
            };
            axisBaseClass.prototype.measureAllLabels = function (labelStrings) {
                var availAxisSize = this._axisSize - 2 * this._expandSpace;
                var maxMeasuredWidth = 0;
                var maxMeasuredHeight = 0;
                var fakeLabel = this._fakeLabel;
                var labelSizes = null;
                var labels = labelStrings;
                var availPixelsPerLabel = 0;
                var actualLabelRotation = LabelRotation.none;
                if (labels.length) {
                    //---- PRE-MEASUREMENT policies ----
                    //---- IMPORTANT PERF: avoid measurement of more labels than could possibly fit ----
                    if (!this.canLabelsFit(availAxisSize, labels.length, this._ellipsesBounds.width / 3, this._ellipsesBounds.height)) {
                        //---- hide labels ----
                        this._labelOffsets = [];
                        this._labelStrings = [];
                    }
                    else {
                        labelSizes = [];
                        var cachedMeasurements = this._axisData.labelMeasurements();
                        if (cachedMeasurements.labelSizes) {
                            //vp.utils.debug("measureAllLabels: using CACHED sizes" + labels.length);
                            labelSizes = cachedMeasurements.labelSizes;
                            maxMeasuredWidth = cachedMeasurements.szMaxText.width;
                            maxMeasuredHeight = cachedMeasurements.szMaxText.height;
                        }
                        else {
                            //vp.utils.debug("measureAllLabels: count=" + labels.length);
                            //---- apply font, textSize, etc. to fakeLabel now ----
                            var drawingParams = this._labelMark.drawingParams();
                            vp.marks.applyTextParams(fakeLabel, drawingParams);
                            vp.dom.css(fakeLabel, "opacity", 0); // ensure fake remains hidden
                            //---- MEASURE all the labels here ----
                            for (var i = 0; i < labels.length; i++) {
                                var label = labels[i];
                                //---- set up for measuring "labelStr" ----
                                fakeLabel.textContent = label;
                                var rc = this.bounds(fakeLabel); //.getBBox();
                                labelSizes.push(rc);
                                maxMeasuredWidth = Math.max(maxMeasuredWidth, rc.width);
                                maxMeasuredHeight = Math.max(maxMeasuredHeight, rc.height);
                            }
                            //---- store results in cache ----
                            cachedMeasurements.labelSizes = labelSizes;
                            cachedMeasurements.szMaxText.width = maxMeasuredWidth;
                            cachedMeasurements.szMaxText.height = maxMeasuredHeight;
                        }
                    }
                    //---- POST-MEASUREMENT policies ----
                    //---- apply "auto rotation" policy ----
                    actualLabelRotation = this.getActualLabelRotation(maxMeasuredWidth, maxMeasuredHeight, availAxisSize, labels.length);
                    availPixelsPerLabel = this.getAvailPixelsPerLabel(actualLabelRotation, availAxisSize, labels.length);
                    //---- apply "hide all" policy ----
                    if (this._labelOverflow == LabelOverflow.hideAll) {
                        var canFit = this.canLabelsFit(availAxisSize, labels.length, maxMeasuredWidth, maxMeasuredHeight);
                        if (!canFit) {
                            //---- hide labels ----
                            this._labelOffsets = [];
                            this._labelStrings = [];
                            labelSizes = null;
                        }
                    }
                }
                this._labelSizes = labelSizes;
                this._availPixelsPerLabel = availPixelsPerLabel;
                this._actualLabelRotation = actualLabelRotation;
                return { width: maxMeasuredWidth, height: maxMeasuredHeight };
            };
            axisBaseClass.prototype.truncateText = function (text, maxLength, overflow, fakeLabel) {
                var ellipseWidth = this._ellipsesBounds.width;
                return vp.formatters.truncateText(text, maxLength, overflow == LabelOverflow.ellipses, fakeLabel, ellipseWidth);
            };
            axisBaseClass.prototype.eraseCanvas = function () {
                this._rootElem.eraseCanvas();
            };
            axisBaseClass.prototype.tickOffsets = function (value) {
                if (arguments.length === 0) {
                    return this._tickOffsets;
                }
                this._tickOffsets = value;
                return this;
            };
            axisBaseClass.prototype.minorTickOffsets = function (value) {
                if (arguments.length === 0) {
                    return this._minorTickOffsets;
                }
                this._minorTickOffsets = value;
                return this;
            };
            axisBaseClass.prototype.labelOffsets = function (value) {
                if (arguments.length === 0) {
                    return this._labelOffsets;
                }
                this._labelOffsets = value;
                return this;
            };
            axisBaseClass.prototype.labelStrings = function (value) {
                if (arguments.length === 0) {
                    return this._labelStrings;
                }
                this._labelStrings = value;
                return this;
            };
            axisBaseClass.prototype.name = function (value) {
                if (arguments.length === 0) {
                    return this._name;
                }
                this._name = value;
                return this;
            };
            axisBaseClass.prototype.labelRotation = function (value) {
                if (arguments.length === 0) {
                    return this._labelRotation;
                }
                this._labelRotation = value;
                return this;
            };
            axisBaseClass.prototype.positiveAutoRotation = function (value) {
                if (arguments.length === 0) {
                    return this._positiveAutoRotation;
                }
                this._positiveAutoRotation = value;
                return this;
            };
            axisBaseClass.prototype.ticksOnInside = function (value) {
                if (arguments.length === 0) {
                    return this._ticksOnInside;
                }
                this._ticksOnInside = value;
                return this;
            };
            axisBaseClass.prototype.nameRotation = function (value) {
                if (arguments.length === 0) {
                    return this._nameRotation;
                }
                this._nameRotation = value;
                return this;
            };
            axisBaseClass.prototype.minLabelSpacing = function (value) {
                if (arguments.length === 0) {
                    return this._minLabelSpacing;
                }
                if (!vp.utils.isArray(value)) {
                    value = [value];
                }
                this._minLabelSpacing = value;
                return this;
            };
            axisBaseClass.prototype.maxPerpendicularSize = function (value) {
                if (arguments.length === 0) {
                    return this._maxPerpendicularSize;
                }
                this._maxPerpendicularSize = value;
                return this;
            };
            axisBaseClass.prototype.expandSpace = function (value) {
                if (arguments.length === 0) {
                    return this._expandSpace;
                }
                this._expandSpace = value;
                return this;
            };
            axisBaseClass.prototype.labelOverflow = function (value) {
                if (arguments.length === 0) {
                    return this._labelOverflow;
                }
                this._labelOverflow = value;
                return this;
            };
            axisBaseClass.prototype.onShade = function (value) {
                if (arguments.length === 0) {
                    return this._onShade;
                }
                this._onShade = value;
                return this;
            };
            axisBaseClass.prototype.drawingParams = function (value) {
                if (arguments.length === 0) {
                    return this._drawingParams;
                }
                this._drawingParams = value;
                return this;
            };
            axisBaseClass.prototype.transition = function (value) {
                if (arguments.length == 0) {
                    return this._transition;
                }
                this._transition = value;
                return this;
            };
            axisBaseClass.prototype.isCrisp = function (value) {
                if (arguments.length === 0) {
                    return this._isCrisp;
                }
                this._isCrisp = value;
                return this;
            };
            return axisBaseClass;
        })();
        chartFrame.axisBaseClass = axisBaseClass;
        /** Specifies how to truncate or hide axis labels that exceed the available space.  If "maxLabelSize" is specified, the
        width of the unrotated label, or the height of the rotated label, is compared to the specified value of "maxLabelSize".  Otherwise, the rotated  size of the
        label in the direction of the axis is compared to the available space between breaks on the axis.  When not enough space is available,
        "LabelOverflow" specifies how the label is drawn. */
        (function (LabelOverflow) {
            //clip,
            /** draws the entire label, even if it results in labels overwriting each other. */
            LabelOverflow[LabelOverflow["overWrite"] = 0] = "overWrite";
            /** truncates the label to fit the available space. */
            LabelOverflow[LabelOverflow["truncate"] = 1] = "truncate";
            /** truncates the label with "..." marks to fit the available space. */
            LabelOverflow[LabelOverflow["ellipses"] = 2] = "ellipses";
            /** hides all of the labels on the axis if any of the labels is too large for the available space. */
            LabelOverflow[LabelOverflow["hideAll"] = 3] = "hideAll";
        })(chartFrame.LabelOverflow || (chartFrame.LabelOverflow = {}));
        var LabelOverflow = chartFrame.LabelOverflow;
        /** Specifies the rotation of the axis labels or name. */
        (function (LabelRotation) {
            LabelRotation[LabelRotation["none"] = 0] = "none";
            LabelRotation[LabelRotation["rotate45"] = 45] = "rotate45";
            LabelRotation[LabelRotation["rotateMinus45"] = -45] = "rotateMinus45";
            LabelRotation[LabelRotation["rotate90"] = 90] = "rotate90";
            LabelRotation[LabelRotation["rotateMinus90"] = -90] = "rotateMinus90";
            LabelRotation[LabelRotation["auto"] = -1] = "auto";
        })(chartFrame.LabelRotation || (chartFrame.LabelRotation = {}));
        var LabelRotation = chartFrame.LabelRotation;
        /** Specifies where the labels are, relative to the axis line.  */
        (function (LabelLocation) {
            LabelLocation[LabelLocation["left"] = 0] = "left";
            LabelLocation[LabelLocation["top"] = 1] = "top";
            LabelLocation[LabelLocation["right"] = 2] = "right";
            LabelLocation[LabelLocation["bottom"] = 3] = "bottom";
        })(chartFrame.LabelLocation || (chartFrame.LabelLocation = {}));
        var LabelLocation = chartFrame.LabelLocation;
        //* used for ticks and minor ticks. */
        function indexKeyFunc(data, index) {
            return index;
        }
        chartFrame.indexKeyFunc = indexKeyFunc;
        function offsetKeyFunc(data, index) {
            return data.offset;
        }
        chartFrame.offsetKeyFunc = offsetKeyFunc;
        /** used for labels. */
        function labelKeyFunc(data, index) {
            return data.label;
        }
        chartFrame.labelKeyFunc = labelKeyFunc;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// axisData.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** contain scale, breaks, lablels, and other info needed to build axes, legends, and grid lines.  */
        var axisDataClass = (function () {
            function axisDataClass(scale, name, tickCount, breaks, labels, formatter) {
                this._scale = scale;
                this._name = name;
                this._tickCount = (tickCount === undefined) ? 8 : tickCount;
                this._breaks = breaks;
                this._labels = labels;
                this._formatter = formatter;
                this._labelMeasurements = new labelMeasurementData();
                this.onScaleChanged();
            }
            axisDataClass.prototype.clearMeasurements = function () {
                this._labelMeasurements.clear();
            };
            axisDataClass.prototype.onScaleChanged = function () {
                this._dateScaleInfo = null;
                var scale = this._scale;
                if (scale) {
                    if (scale.scaleType() == vp.scales.ScaleType.dateTime) {
                        this._dateScaleInfo = vp.dateHelper.getDateScaleValues(scale.domainMin(), scale.domainMax());
                    }
                }
            };
            // private
            axisDataClass.prototype.getLinearBreaks = function () {
                var min = this._scale.domainMin();
                var max = this._scale.domainMax();
                var step = (max - min) / (this._tickCount - 1);
                var breaks = vp.data.range(min, max, step);
                return breaks;
            };
            // public
            axisDataClass.prototype.getActualBreaks = function () {
                var breaks = this._breaks;
                var scale = this._scale;
                var tickCount = this._tickCount;
                if (!breaks) {
                    var scaleType = scale.scaleType();
                    if (scaleType == vp.scales.ScaleType.categoryIndex || scaleType == vp.scales.ScaleType.categoryKey) {
                        breaks = vp.utils.keys(scale.categoryKeys());
                    }
                    else if (scaleType == vp.scales.ScaleType.log) {
                        var min = scale.domainMin();
                        var max = scale.domainMax();
                        breaks = [];
                        for (var i = 0; i < Number.MAX_VALUE; i++) {
                            var bv = min * Math.pow(10, i);
                            if (bv > max) {
                                break;
                            }
                            breaks.push(bv);
                        }
                    }
                    else if (scaleType == vp.scales.ScaleType.lowBias) {
                        var log25 = Math.log(25);
                        //---- to compute breaks, REVERSE MAP normalized steps (0-1) into data space ----
                        var min = scale.domainMin();
                        var max = scale.domainMax();
                        var range = (min == max) ? 1 : (max - min);
                        var stepCount = tickCount; // - 1;
                        var stepSize = 1 / (stepCount - 1);
                        breaks = [];
                        for (var i = 0; i < stepCount; i++) {
                            var percent = i * stepSize;
                            //---- convert to log-adjusted percent ----
                            var v = percent * log25;
                            v = Math.exp(v);
                            percent = (v - 1) / 24;
                            //---- convert from percent to value in domain ----
                            var breakValue = min + percent * range;
                            breaks.push(breakValue);
                        }
                    }
                    else if (scaleType == vp.scales.ScaleType.highBias) {
                        var exp4m1 = Math.exp(4) - 1;
                        //---- to compute breaks, REVERSE MAP normalized steps (0-1) into data space ----
                        var min = scale.domainMin();
                        var max = scale.domainMax();
                        var range = (min == max) ? 1 : (max - min);
                        var stepCount = tickCount; // - 1;
                        var stepSize = 1 / (stepCount - 1);
                        breaks = [];
                        for (var i = 0; i < stepCount; i++) {
                            var percent = i * stepSize;
                            //---- convert to exp-adjusted percent ----
                            var v = (percent * exp4m1) + 1;
                            v = Math.log(v);
                            percent = v / 4;
                            //---- convert from percent to value in domain ----
                            var breakValue = min + percent * range;
                            breaks.push(breakValue);
                        }
                    }
                    else if (scaleType == vp.scales.ScaleType.linear || scaleType == vp.scales.ScaleType.dateTime) {
                        breaks = this.getLinearBreaks();
                    }
                    else {
                        vp.utils.error("axis.generate: unsupported scaleType=" + scaleType);
                    }
                }
                return breaks;
            };
            /** Calculate the tick and label offsets for this axis data. */
            axisDataClass.prototype.getOffsets = function (breaks) {
                var _this = this;
                var tickOffsets = null;
                var labelOffsets = null;
                var scaleType = this._scale.scaleType();
                var isCategory = (scaleType == vp.scales.ScaleType.categoryIndex || scaleType == vp.scales.ScaleType.categoryKey);
                if (isCategory) {
                    var categoryScale = this._scale;
                    var halfStep = categoryScale.stepSize() / 2;
                    labelOffsets = [];
                    tickOffsets = breaks.map(function (value, index) {
                        var offset = _this._scale.scale(value);
                        labelOffsets.push(offset);
                        return offset - halfStep;
                    });
                    if (tickOffsets.length > 0) {
                        //---- add extra tick at end ----
                        var count = tickOffsets.length;
                        var extraOffset = tickOffsets[count - 1] + 2 * halfStep;
                        tickOffsets.push(extraOffset);
                    }
                }
                else {
                    //---- scale breaks into TICKOFFSETS ----
                    tickOffsets = breaks.map(function (value, index) {
                        return _this._scale.scale(value);
                    });
                    labelOffsets = tickOffsets;
                }
                return { tickOffsets: tickOffsets, labelOffsets: labelOffsets };
            };
            axisDataClass.prototype.makeLinearMinor = function (breaks, minorSteps) {
                var minor = [];
                for (var i = 1; i < breaks.length; i++) {
                    var thisBreak = breaks[i];
                    var lastBreak = breaks[i - 1];
                    var stepSize = (thisBreak - lastBreak) / (minorSteps + 1);
                    for (var j = 1; j <= minorSteps; j++) {
                        var minorBreak = lastBreak + j * stepSize;
                        var offset = this._scale.scale(minorBreak);
                        minor.push(offset);
                    }
                }
                return minor;
            };
            axisDataClass.prototype.makeCategoryMinor = function (breaks) {
                var minor = [];
                for (var i = 1; i < breaks.length; i++) {
                    var thisBreak = breaks[i];
                    var offset = this._scale.scale(thisBreak);
                    minor.push(offset);
                }
                return minor;
            };
            /** we skip over minor breaks and go straight for minor offsets.  This is because its hard to caculate
            minor breaks for category scales, and we don't have any other use for the minor break values themselves. */
            axisDataClass.prototype.getActualMinorOffsets = function (breaks) {
                var minor = [];
                var scaleType = this._scale.scaleType();
                if (scaleType == vp.scales.ScaleType.log) {
                    minor = [];
                    for (var i = 1; i < breaks.length; i++) {
                        var incr = breaks[i - 1];
                        for (var j = 2; j < 10; j++) {
                            var breakValue = j * incr;
                            var offset = this._scale.scale(breakValue);
                            minor.push(offset);
                        }
                    }
                }
                else if (scaleType == vp.scales.ScaleType.categoryIndex || scaleType == vp.scales.ScaleType.categoryKey) {
                    //---- category: use 1 line per major break (2 intervals) ----
                    minor = this.makeCategoryMinor(breaks);
                }
                else {
                    //---- linear: use 4 lines per major break (5 intervals) ----
                    minor = this.makeLinearMinor(breaks, 4);
                }
                return minor;
            };
            axisDataClass.prototype.getDecimalDigitCount = function (value) {
                var ddc = 0;
                var str = value + "";
                var index = str.indexOf(".");
                if (index > -1) {
                    ddc = str.length - (index + 1);
                }
                return ddc;
            };
            axisDataClass.prototype.getActualLabels = function (breakValues) {
                var labels = this._labels;
                if (!labels) {
                    var scaleType = this._scale.scaleType();
                    var isCategory = (scaleType == vp.scales.ScaleType.categoryIndex || scaleType == vp.scales.ScaleType.categoryKey);
                    //---- TODO: allow for user-specified formatter and user-specified "numDecimals" ----
                    var formatter = this._formatter;
                    if (!formatter) {
                        if (isCategory) {
                            formatter = vp.formatters.string;
                        }
                        else if (this._dateScaleInfo) {
                            formatter = vp.formatters.createExcelFormatter(this._dateScaleInfo.formatString, "date");
                        }
                    }
                    var numDecimals = undefined; // this._numDecimalPlaces;
                    if (!isCategory) {
                        numDecimals = 0;
                        if (breakValues.length > 0) {
                            numDecimals = this.getDecimalDigitCount(breakValues[0]);
                            if (breakValues.length > 1) {
                                var singleTickInterval = breakValues[1] - breakValues[0];
                                var ddc = this.getDecimalDigitCount(singleTickInterval);
                                numDecimals = Math.max(numDecimals, ddc);
                            }
                        }
                        numDecimals = Math.min(4, numDecimals); // don't show too much, by default
                        if (!formatter) {
                            formatter = vp.formatters.createCommaFormatter(numDecimals);
                        }
                    }
                    labels = breakValues.map(function (value, index) {
                        return formatter(value);
                    });
                }
                return labels;
            };
            axisDataClass.prototype.scale = function (value) {
                if (arguments.length == 0) {
                    return this._scale;
                }
                this._scale = value;
                this.onScaleChanged();
                return this;
            };
            axisDataClass.prototype.tickCount = function (value) {
                if (arguments.length == 0) {
                    return this._tickCount;
                }
                this._tickCount = value;
                return this;
            };
            axisDataClass.prototype.formatter = function (value) {
                if (arguments.length == 0) {
                    return this._formatter;
                }
                this._formatter = value;
                return this;
            };
            axisDataClass.prototype.labelMeasurements = function (value) {
                if (arguments.length == 0) {
                    return this._labelMeasurements;
                }
                this._labelMeasurements = value;
                return this;
            };
            return axisDataClass;
        })();
        chartFrame.axisDataClass = axisDataClass;
        function createAxisData(scale, name, tickCount, breaks, labels, formatter) {
            return new axisDataClass(scale, name, tickCount, breaks, labels, formatter);
        }
        chartFrame.createAxisData = createAxisData;
        //* these are label measurements, independent of a specific axis size or orientation. */
        var labelMeasurementData = (function () {
            function labelMeasurementData() {
                this.clear();
            }
            labelMeasurementData.prototype.clear = function () {
                this.labelSizes = null;
                this.szMaxText = { width: 0, height: 0 };
            };
            return labelMeasurementData;
        })();
        chartFrame.labelMeasurementData = labelMeasurementData;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// bottomAxis.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** creates a vertical axis with the labels to the right of the axis line. */
        var bottomAxisClass = (function (_super) {
            __extends(bottomAxisClass, _super);
            function bottomAxisClass(container, axisDataOrScale, useWebGl, isCrisp) {
                var _this = this;
                _super.call(this, container, axisDataOrScale, useWebGl, isCrisp, chartFrame.LabelLocation.bottom);
                //vp.utils.trace("ctr", "bottomAxis");
                var root = this._rootElem;
                //---- create AXIS LINE ----
                this._axisLineMark = vp.marks.createLineMark(root, "vpxAxisLine")
                    .onShade(function (element, record, index, isNew) {
                    var xStart = 0;
                    var xEnd = _this._axisSize;
                    var y = _this._offset;
                    vp.select(element)
                        .hLine(xStart - 1, xEnd, y, _this._isCrisp);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS TICKS ----
                this._tickMark = vp.marks.createLineMark(root, "vpxAxisTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickShader(element, record, index, isNew, _this._offset, -_this._drawingParams.tickLength, record);
                });
                //---- create AXIS TICK BOXES ----
                this._tickBox = vp.marks.createRectangleMark(root, "vpxAxisTickBox")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickBoxShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create MINOR TICKS  ----
                this._minorTickMark = vp.marks.createLineMark(root, "vpxAxisMinorTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickShader(element, record, index, isNew, _this._offset, -_this._drawingParams.minorTickLength, record);
                });
                //---- create AXIS LABELS ----
                this._labelMark = vp.marks.createTextMark(root, "vpxAxisLabel")
                    .keyFunc(chartFrame.labelKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    var cx = record.offset;
                    var cy = _this._offset;
                    var availPixelsPerLabel = _this.getAvailablePixelsPerLabelForTruncation(_this._actualLabelRotation);
                    var myHeight = _this.shadeTextLabel(index, element, cx, cy, record.label, "middle", "top", vp.chartFrame.LabelLocation.top, false, availPixelsPerLabel);
                    _this._maxTextHeight = Math.max(_this._maxTextHeight, myHeight);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create NAME ----
                this._nameMark = vp.marks.createTextMark(root, "vpxAxisName")
                    .onShade(function (element, record, index, isNew) {
                    /// General Note: when laying out elements with animations potentially active,
                    /// we cannot rely on system calls to determine position - we have to track 
                    /// x,y positions manually.  This is because calls like "elem.attr("x", 34)" don't change
                    /// "x" to 34 until the end of the animation.
                    var cx = _this._axisSize / 2;
                    var cy = _this._offset;
                    var wrap = vp.select(element)
                        .attr("x", cx + "")
                        .attr("y", cy + "")
                        .text(_this._name);
                    //---- now that properties are all set, VERT ALIGN at "cy" ----
                    _this.finalTextBaseline(_this._fakeNameLabel, wrap, "top");
                    if (_this._nameRotation) {
                        if (_this._nameRotation == 45 || _this._nameRotation == -45) {
                            var result = _this.rotateText45(_this._name, wrap, vp.chartFrame.LabelLocation.top, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextHeight = result.height;
                        }
                        else if (_this._nameRotation == 90 || _this._nameRotation == -90) {
                            var result = _this.rotateText90(_this._name, wrap, vp.chartFrame.LabelLocation.top, cx, cy, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextHeight = result.height;
                        }
                    }
                    else {
                        var szLabel = _this.getFinalTextSize(_this._name, _this._drawingParams.name, _this._fakeNameLabel);
                        _this._maxTextHeight = szLabel.height;
                    }
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
            }
            bottomAxisClass.prototype.shadeMarks = function (transition, record, index, isNew, context, measureOnly) {
                var dp = this._drawingParams;
                var generate = (!measureOnly);
                var group = vp.select(this._rootElem)
                    .addClass("vpxAxis");
                this._maxTextWidth = 0;
                this._offset = dp.startPadding;
                //---- generate SUB MARKS ----
                this.generateAxisLine(generate, transition, true);
                this.generateTicks(generate, transition, true);
                this.generateVerticalLabels(generate, transition, true);
                this.generateVerticalName(generate, transition, true);
                this._offset += dp.endPadding;
                this._measuredSize = this._offset;
            };
            bottomAxisClass.prototype.width = function (value) {
                if (arguments.length === 0) {
                    return this._axisSize;
                }
                this._axisSize = value;
                return this;
            };
            return bottomAxisClass;
        })(chartFrame.axisBaseClass);
        chartFrame.bottomAxisClass = bottomAxisClass;
        function createBottomAxis(container, axisDataOrScale, useWebGl, isCrisp) {
            if (isCrisp === void 0) { isCrisp = true; }
            return new bottomAxisClass(container, axisDataOrScale, useWebGl, isCrisp);
        }
        chartFrame.createBottomAxis = createBottomAxis;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
/// chartFrameEx.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** A visual object that hosts a title, legend, axes, gridlines, and a plot area.  */
        var chartFrameEx = (function () {
            function chartFrameEx(container, xData, yData) {
                //vp.utils.trace("ctr", "chartFrame");
                var _this = this;
                this._isCrisp = true;
                this._firstShow = true;
                this._xData = xData;
                this._yData = yData;
                this._container = container;
                //---- for SOME REASON, the CHART FRAME SVG group is not rendering on FireFox or Chrome. ----
                //var root = vp.select(container);
                //root.append("text")
                //    .position(20, 100)
                //    .colors("red", "black", .5)
                //    .font("verdana", 38, true, true)
                //    .text("BeachParty!");
                this._rootMark = vp.marks.createGroupMark(container, "vpxChartFrame");
                var uRootElem = this._rootMark.rootElem();
                this._rootElem = uRootElem;
                var rootElem = vp.select(uRootElem);
                rootElem
                    .addClass("vpxChartFrame");
                this._leftAxis = vp.chartFrame.createLeftAxis(uRootElem, yData, null, true);
                this._bottomAxis = vp.chartFrame.createBottomAxis(uRootElem, xData, null, true);
                this._topAxis = vp.chartFrame.createTopAxis(uRootElem, xData, null, true);
                this._rightAxis = vp.chartFrame.createRightAxis(uRootElem, yData, null, true);
                this._gridLines = vp.chartFrame.createGridLines(uRootElem, xData, yData, true)
                    .isXVisible(xData != null)
                    .isYVisible(yData != null);
                this._titleMark = vp.marks.createTextMark(uRootElem, "vpxAxisTitle")
                    .onShade(function (element, record, index, isNew) {
                    _this.shadeTextMark(10, 10, "start", element, _this._title.text);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                this._subTitleMark = vp.marks.createTextMark(uRootElem, "vpxAxisSubTitle")
                    .onShade(function (element, record, index, isNew) {
                    _this.shadeTextMark(10, 30, "start", element, _this._subTitle.text);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- PLACEHOLDER for now ----
                this._legend = vp.chartFrame.createRightAxis(uRootElem, null, null, true);
                this._boxMark = vp.marks.createRectangleMark(uRootElem, "vpxAxisBox")
                    .onShade(function (element, record, index, isNew) {
                    var rc = _this._rcPlot;
                    vp.select(element)
                        .bounds(rc.left, rc.top, rc.width, rc.height, _this._isCrisp);
                });
                //---- only LEFT and BOTTOM are visible by default ----
                this._topAxis.hide();
                this._rightAxis.hide();
                this._boxMark.hide();
                this._legend.hide();
                this._titleMark.hide();
                this._subTitleMark.hide();
                this._gridLines.hide();
                this.buildDefaultDrawingParams();
            }
            chartFrameEx.prototype.shadeTextMark = function (x, y, anchor, element, text) {
                var wrap = vp.select(element)
                    .text(text);
                wrap = vp.select(element)
                    .attr("x", x + "")
                    .attr("y", y + "")
                    .attr("text-anchor", anchor);
                //---- now that properties are all set, VERT ALIGN at "cy" ----
                //this.finalTextBaseline(this._fakeNameLabel, wrap, "middle");
                //var szLabel = this.getFinalTextSize(this._name, this._drawingParams.name, this._fakeNameLabel);
                //this._maxTextWidth = szLabel.width;
            };
            chartFrameEx.prototype.hide = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                this._rootMark.hide(transition);
            };
            chartFrameEx.prototype.show = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                this._rootMark.show(transition);
            };
            chartFrameEx.prototype.isVisible = function () {
                return this._rootMark.isVisible();
            };
            chartFrameEx.prototype.buildAndShow = function (axis, show) {
                if (show) {
                    if (axis.isVisible()) {
                        //---- change visible axis with animation ----
                        axis.build();
                    }
                    else {
                        axis.build(undefined); // build without animation
                        axis.show(); // show with animation
                    }
                }
                else {
                    axis.hide();
                }
            };
            chartFrameEx.prototype.build = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                //---- apply drawing params to sub-marks ----
                var dp = this._drawingParams;
                this._leftAxis.drawingParams(dp ? dp.leftAxis : null);
                this._topAxis.drawingParams(dp ? dp.topAxis : null);
                this._rightAxis.drawingParams(dp ? dp.rightAxis : null);
                this._bottomAxis.drawingParams(dp ? dp.bottomAxis : null);
                this._boxMark.drawingParams(dp ? dp.box : null);
                this._gridLines.drawingParams(dp ? dp.gridLines : null);
                this._titleMark.drawingParams(dp ? dp.title : null);
                this._subTitleMark.drawingParams(dp ? dp.subTitle : null);
                this._legend.drawingParams(dp ? dp.legend : null);
                var transition = this._transition;
                var width = this._width;
                var height = this._height;
                var left = 0;
                var top = 0;
                var right = width;
                var bottom = height;
                //---- layout TITLE ----
                //---- layout SUBTITLE ----
                //---- layout LEGEND ----
                this.layoutAxes(transition, left, top, right, bottom);
                var rcPlot = this._rcPlot;
                //---- call build() on all sub-marks ----
                this.buildAndShow(this._leftAxis, this._isLeftAxisVisible);
                this.buildAndShow(this._bottomAxis, this._isBottomAxisVisible);
                this.buildAndShow(this._topAxis, this._isTopAxisVisible);
                this.buildAndShow(this._rightAxis, this._isRightAxisVisible);
                //---- follow marks need show/hide calls ----
                if (this._isBoxVisible) {
                    this._boxMark.build();
                    this._boxMark.show();
                }
                else {
                    this._boxMark.hide();
                }
                //vp.utils.debug("chartFrame: isGridVisible: " + this._isGridLinesVisible);
                if (this._isGridLinesVisible) {
                    this._gridLines
                        .width(rcPlot.width)
                        .height(rcPlot.height)
                        .translate(rcPlot.left, rcPlot.top, this._isCrisp)
                        .show()
                        .build();
                }
                else {
                    this._gridLines.hide();
                }
                if (this._isTitleVisible) {
                    this._titleMark.build();
                }
                if (this._isSubTitleVisible) {
                    this._subTitleMark.build();
                }
                if (this._legend.isVisible()) {
                    this._legend.build();
                }
            };
            chartFrameEx.prototype.layoutAxes = function (transition, left, top, right, bottom) {
                //---- start with approx. values ----
                var xHeight = 35;
                var yWidth = 75;
                var width = right - left;
                var height = bottom - top;
                var plotWidth = width; // - 40;
                var plotHeight = height; // - 40;
                var leftAxis = this._leftAxis;
                var bottomAxis = this._bottomAxis;
                var topAxis = this._topAxis;
                var rightAxis = this._rightAxis;
                var showLeft = this._isLeftAxisVisible;
                var showTop = this._isTopAxisVisible;
                var showRight = this._isRightAxisVisible;
                var showBottom = this._isBottomAxisVisible;
                var xScale = this._xData.scale();
                var yScale = this._yData.scale();
                if (showLeft) {
                    // plotWidth -= yWidth;
                    //---- will measure left and right axes with full height ----
                    leftAxis
                        .height(plotHeight);
                }
                if (showRight) {
                    //plotWidth -= yWidth;
                    //---- will measure left and right axes with full height ----
                    rightAxis
                        .height(plotHeight);
                }
                if (showTop) {
                    plotHeight -= xHeight;
                    topAxis
                        .width(plotWidth);
                }
                if (showBottom) {
                    plotHeight -= xHeight;
                    bottomAxis
                        .width(plotWidth);
                }
                //---- when less than 4 axes are drawn, we need to use padding so we don't truncate the end labels (which are centered on borders) ----
                var topPad = 10;
                var bottomPad = 10;
                var leftPad = 20;
                var rightPad = 20;
                var axesOnOutSide = this._axesOnOutSide;
                //---- rcPlot will exactly define the plot area rectangle ----
                var rcPlot = vp.geom.createRect(0, 0, width, height);
                //---- important: this block of code must call "getMeasuredXXX()" on each visible axis ----
                if ((showLeft || showRight || showTop || showBottom)) {
                    var leftWidth = (showLeft) ? leftAxis.getMeasuredWidth() : leftPad;
                    if (!axesOnOutSide) {
                        rcPlot.left = leftWidth;
                        rcPlot.width -= leftWidth;
                    }
                    var rightWidth = (showRight) ? rightAxis.getMeasuredWidth() : rightPad;
                    if (!axesOnOutSide) {
                        rcPlot.width -= rightWidth;
                    }
                    //---- left and right widths are final; apply them to top/bottom axes ----
                    bottomAxis.width(rcPlot.width);
                    topAxis.width(rcPlot.width);
                    var bottomHeight = (showBottom) ? bottomAxis.getMeasuredHeight() : bottomPad;
                    if (!axesOnOutSide) {
                        rcPlot.height -= bottomHeight;
                    }
                    var topHeight = (showTop) ? topAxis.getMeasuredHeight() : topPad;
                    if (!axesOnOutSide) {
                        rcPlot.top = topHeight;
                        rcPlot.height -= topHeight;
                    }
                }
                if (axesOnOutSide) {
                    rcPlot = vp.geom.createRect(0, 0, width, height);
                }
                rcPlot.right = rcPlot.left + rcPlot.width;
                rcPlot.bottom = rcPlot.top + rcPlot.height;
                this._rcPlot = rcPlot;
                //---- OK, rcPlot is FINAL; now we can start the actual layout ----
                //---- here we update the RANGE of our X and Y scales in screen pixel coordinates ----
                //---- this may work against a client using 3D range coordinates; they should pass us a COPY of their scales ----
                xScale.range(0, rcPlot.width);
                yScale.range(rcPlot.height, 0);
                this._gridLines
                    .width(rcPlot.width)
                    .height(rcPlot.height);
                if (showLeft) {
                    leftAxis
                        .height(rcPlot.height);
                    if (axesOnOutSide) {
                        leftAxis.translate(-leftAxis._measuredSize + 1, 0, this._isCrisp);
                    }
                    else {
                        leftAxis.translate(1 + leftAxis._leftPad, rcPlot.top, this._isCrisp);
                    }
                }
                if (showRight) {
                    rightAxis
                        .height(rcPlot.height);
                    if (axesOnOutSide) {
                        rightAxis.translate(rcPlot.right, 0, this._isCrisp);
                    }
                    else {
                        rightAxis.translate(rcPlot.right + 1, rcPlot.top, this._isCrisp);
                    }
                }
                if (showBottom) {
                    bottomAxis
                        .width(rcPlot.width);
                    if (axesOnOutSide) {
                        bottomAxis.translate(0, rcPlot.bottom, this._isCrisp);
                    }
                    else {
                        bottomAxis.translate(rcPlot.left, rcPlot.bottom, this._isCrisp);
                    }
                }
                if (showTop) {
                    topAxis
                        .width(rcPlot.width);
                    if (axesOnOutSide) {
                        topAxis.translate(0, -topAxis._measuredSize, this._isCrisp);
                    }
                    else {
                        topAxis.translate(rcPlot.left, 1, this._isCrisp);
                    }
                }
            };
            chartFrameEx.prototype.translate = function (x, y, isCrispAdjustment) {
                if (isCrispAdjustment === undefined && this._isCrisp) {
                    isCrispAdjustment = true;
                }
                //---- magic offset only works on direct groups? ----
                vp.select(this._rootElem)
                    .translate(x, y, isCrispAdjustment);
                return this;
            };
            chartFrameEx.prototype.onShade = function (value) {
                if (arguments.length === 0) {
                    return this._onShade;
                }
                this._onShade = value;
                return this;
            };
            chartFrameEx.prototype.width = function (value) {
                if (arguments.length === 0) {
                    return this._width;
                }
                this._width = value;
                return this;
            };
            chartFrameEx.prototype.height = function (value) {
                if (arguments.length === 0) {
                    return this._height;
                }
                this._height = value;
                return this;
            };
            chartFrameEx.prototype.isBoxVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isBoxVisible;
                }
                this._isBoxVisible = value;
                return this;
            };
            chartFrameEx.prototype.isLeftAxisVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isLeftAxisVisible;
                }
                this._isLeftAxisVisible = value;
                return this;
            };
            chartFrameEx.prototype.isTopAxisVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isTopAxisVisible;
                }
                this._isTopAxisVisible = value;
                return this;
            };
            chartFrameEx.prototype.isRightAxisVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isRightAxisVisible;
                }
                this._isRightAxisVisible = value;
                return this;
            };
            chartFrameEx.prototype.isBottomAxisVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isBottomAxisVisible;
                }
                this._isBottomAxisVisible = value;
                return this;
            };
            chartFrameEx.prototype.isGridLinesVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isGridLinesVisible;
                }
                this._isGridLinesVisible = value;
                return this;
            };
            chartFrameEx.prototype.isTitleVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isTitleVisible;
                }
                this._isTitleVisible = value;
                return this;
            };
            chartFrameEx.prototype.axesOnOutside = function (value) {
                if (arguments.length === 0) {
                    return this._axesOnOutSide;
                }
                this._axesOnOutSide = value;
                return this;
            };
            chartFrameEx.prototype.drawingParams = function (value) {
                if (arguments.length === 0) {
                    return this._drawingParams;
                }
                this._drawingParams = value;
                return this;
            };
            chartFrameEx.prototype.transition = function (value) {
                if (arguments.length == 0) {
                    return this._transition;
                }
                this._transition = value;
                this.onTransitionChanged();
                return this;
            };
            chartFrameEx.prototype.onTransitionChanged = function () {
                var transition = this._transition;
                this._leftAxis.transition(transition);
                this._topAxis.transition(transition);
                this._rightAxis.transition(transition);
                this._bottomAxis.transition(transition);
                this._boxMark.transition(transition);
                this._titleMark.transition(transition);
                this._subTitleMark.transition(transition);
                this._gridLines.transition(transition);
                this._legend.transition(transition);
            };
            chartFrameEx.prototype.rootElem = function () {
                return this._rootElem;
            };
            chartFrameEx.prototype.buildDefaultDrawingParams = function () {
                this._drawingParams =
                    {
                        leftAxis: this._leftAxis.drawingParams(),
                        topAxis: this._topAxis.drawingParams(),
                        rightAxis: this._rightAxis.drawingParams(),
                        bottomAxis: this._bottomAxis.drawingParams(),
                        gridLines: this._gridLines.drawingParams(),
                        legend: this._legend.drawingParams(),
                        box: {},
                        title: {},
                        subTitle: {},
                    };
            };
            chartFrameEx.prototype.leftAxis = function () {
                return this._leftAxis;
            };
            chartFrameEx.prototype.topAxis = function () {
                return this._topAxis;
            };
            chartFrameEx.prototype.rightAxis = function () {
                return this._rightAxis;
            };
            chartFrameEx.prototype.bottomAxis = function () {
                return this._bottomAxis;
            };
            chartFrameEx.prototype.gridLines = function () {
                return this._gridLines;
            };
            chartFrameEx.prototype.legend = function () {
                return this._legend;
            };
            chartFrameEx.prototype.title = function () {
                return this._title;
            };
            chartFrameEx.prototype.subTitle = function () {
                return this._subTitle;
            };
            chartFrameEx.prototype.isCrisp = function (value) {
                if (arguments.length === 0) {
                    return this._isCrisp;
                }
                this._isCrisp = value;
                this.onIsCrispChanged();
                return this;
            };
            chartFrameEx.prototype.onIsCrispChanged = function () {
                var isCrisp = this._isCrisp;
                this._bottomAxis.isCrisp(isCrisp);
                this._leftAxis.isCrisp(isCrisp);
                this._topAxis.isCrisp(isCrisp);
                this._rightAxis.isCrisp(isCrisp);
                this._gridLines.isCrisp(isCrisp);
                this._legend.isCrisp(isCrisp);
            };
            chartFrameEx.prototype.xAxisData = function (value) {
                if (arguments.length == 0) {
                    return this._xData;
                }
                this._xData = value;
                this._bottomAxis.axisData(value);
                this._topAxis.axisData(value);
                this._gridLines.xAxisData(value);
                return this;
            };
            chartFrameEx.prototype.yAxisData = function (value) {
                if (arguments.length == 0) {
                    return this._yData;
                }
                this._yData = value;
                this._leftAxis.axisData(value);
                this._rightAxis.axisData(value);
                this._gridLines.yAxisData(value);
                return this;
            };
            chartFrameEx.prototype.plotAreaBounds = function () {
                return this._rcPlot;
            };
            return chartFrameEx;
        })();
        chartFrame.chartFrameEx = chartFrameEx;
        /** Note: this class will update the range of the x and y scales, so you may want to pass a copy of them, rather than the original. */
        function createChartFrameEx(container, xData, yData) {
            return new chartFrameEx(container, xData, yData);
        }
        chartFrame.createChartFrameEx = createChartFrameEx;
        var textData = (function () {
            function textData() {
            }
            return textData;
        })();
        chartFrame.textData = textData;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// gridLines.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** A set of horizontal and vertical gridlines, associated with X and Y scales.  */
        var gridLinesClass = (function () {
            function gridLinesClass(container, xData, yData, isCrisp) {
                //vp.utils.trace("ctr", "gridLines");
                var _this = this;
                if (isCrisp === void 0) { isCrisp = true; }
                this._firstShow = true;
                this._container = container;
                this._xData = xData;
                this._yData = yData;
                this._isCrisp = isCrisp;
                this._rootMark = vp.marks.createGroupMark(container, "vpxGridLines");
                var uRootElem = this._rootMark.rootElem();
                this._rootElem = uRootElem;
                var root = vp.select(uRootElem);
                root
                    .addClass("vpxGridLines");
                this.buildInitialDrawingParams();
                //---- create X GRID LINES ----
                this._xMark = vp.marks.createLineMark(uRootElem, "vpxXGridLine")
                    .onShade(function (element, record, index, isNew) {
                    var dp = _this._drawingParams ? _this._drawingParams.x : null;
                    _this.verticalGridLineShader(element, record, index, isNew, 0, _this._isCrisp, dp, -1);
                });
                //---- create X MINOR GRID LINES ----
                this._xMinorMark = vp.marks.createLineMark(uRootElem, "vpxXMinorGridLine")
                    .onShade(function (element, record, index, isNew) {
                    var dp = _this._drawingParams ? _this._drawingParams.xMinor : null;
                    _this.verticalGridLineShader(element, record, index, isNew, 0, _this._isCrisp, dp, -1);
                });
                //---- create Y GRID LINES ----
                this._yMark = vp.marks.createLineMark(uRootElem, "vpxYGridLine")
                    .onShade(function (element, record, index, isNew) {
                    var dp = _this._drawingParams ? _this._drawingParams.y : null;
                    _this.horizontalGridLineShader(element, record, index, isNew, 0, _this._isCrisp, dp, 1);
                });
                //---- create Y MINOR GRID LINES ----
                this._yMinorMark = vp.marks.createLineMark(uRootElem, "vpxYMinorGridLine")
                    .onShade(function (element, record, index, isNew) {
                    var dp = _this._drawingParams ? _this._drawingParams.yMinor : null;
                    _this.horizontalGridLineShader(element, record, index, isNew, 0, _this._isCrisp, dp, 1);
                });
            }
            gridLinesClass.prototype.buildInitialDrawingParams = function () {
                //---- don't overspecify - let CSS kick in where possible ----
                var daX = { startPadding: 0, endPadding: 0 }; //, lineSize: 1, lineType: "solid", opacity: 1, stroke: "gray" };
                var daY = { startPadding: 0, endPadding: 0 }; // , lineSize: 1, lineType: "solid", opacity: 1, stroke: "gray" };
                var daXMinor = { startPadding: 0, endPadding: 0, lineType: "dotted" }; //, lineSize: 1, opacity: 1, stroke: "gray" };
                var daYMinor = { startPadding: 0, endPadding: 0, lineType: "dotted" }; // , lineSize: 1, opacity: 1, stroke: "gray" };
                this._drawingParams = { x: daX, y: daY, xMinor: daXMinor, yMinor: daYMinor };
            };
            gridLinesClass.prototype.hide = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                this._rootMark.hide(transition);
                return this;
            };
            gridLinesClass.prototype.show = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                this._rootMark.show(transition);
                return this;
            };
            gridLinesClass.prototype.isVisible = function () {
                return this._rootMark.isVisible();
            };
            gridLinesClass.prototype.build = function (transition) {
                if (transition === undefined) {
                    transition = this._transition;
                }
                var xBreaks = this._xData.getActualBreaks();
                var result = this._xData.getOffsets(xBreaks);
                var xOffsets = result.tickOffsets;
                var xMinorOffsets = this._xData.getActualMinorOffsets(xBreaks);
                var yBreaks = this._yData.getActualBreaks();
                var result = this._yData.getOffsets(yBreaks);
                var yOffsets = result.tickOffsets;
                var yMinorOffsets = this._yData.getActualMinorOffsets(yBreaks);
                //---- hide X grids ----
                if (!this._isXVisible) {
                    xOffsets = [];
                    xMinorOffsets = [];
                }
                else if (!this._isXMinorVisible) {
                    xMinorOffsets = [];
                }
                //---- hide Y grids ----
                if (!this._isYVisible) {
                    yOffsets = [];
                    yMinorOffsets = [];
                }
                else if (!this._isYMinorVisible) {
                    yMinorOffsets = [];
                }
                //---- draw GRID LINES ----
                this._xMark.generate(xOffsets, transition);
                this._xMinorMark.generate(xMinorOffsets, transition);
                this._yMark.generate(yOffsets, transition);
                this._yMinorMark.generate(yMinorOffsets, transition);
            };
            gridLinesClass.prototype.horizontalGridLineShader = function (element, record, index, isNew, xOffset, isCrisp, da, dir) {
                if (dir === void 0) { dir = 1; }
                var width = this._width - da.startPadding - da.endPadding;
                var xStart = xOffset + dir * da.startPadding;
                var xEnd = xStart + dir * width;
                var y = record;
                vp.select(element)
                    .hLine(xStart, xEnd, y, isCrisp);
                vp.marks.applyLineParams(element, da);
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
            };
            gridLinesClass.prototype.verticalGridLineShader = function (element, record, index, isNew, yOffset, isCrisp, da, dir) {
                if (dir === void 0) { dir = 1; }
                var height = this._height - da.startPadding - da.endPadding;
                var x = record;
                var yStart = yOffset - dir * da.startPadding;
                var yEnd = yStart - dir * height;
                vp.select(element)
                    .vLine(yStart, yEnd, x, isCrisp);
                vp.marks.applyLineParams(element, da);
                if (this._onShade) {
                    this._onShade(element, record, index, isNew);
                }
            };
            gridLinesClass.prototype.opacity = function (value) {
                if (arguments.length === 0) {
                    return this._rootMark.opacity();
                }
                this._rootMark.opacity(value);
                return this;
            };
            gridLinesClass.prototype.height = function (value) {
                if (arguments.length === 0) {
                    return this._height;
                }
                this._height = value;
                return this;
            };
            gridLinesClass.prototype.width = function (value) {
                if (arguments.length === 0) {
                    return this._width;
                }
                this._width = value;
                return this;
            };
            gridLinesClass.prototype.isXVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isXVisible;
                }
                this._isXVisible = value;
                return this;
            };
            gridLinesClass.prototype.isYVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isYVisible;
                }
                this._isYVisible = value;
                return this;
            };
            gridLinesClass.prototype.isXMinorVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isXMinorVisible;
                }
                this._isXMinorVisible = value;
                return this;
            };
            gridLinesClass.prototype.isYMinorVisible = function (value) {
                if (arguments.length === 0) {
                    return this._isYMinorVisible;
                }
                this._isYMinorVisible = value;
                return this;
            };
            gridLinesClass.prototype.isCrisp = function (value) {
                if (arguments.length === 0) {
                    return this._isCrisp;
                }
                this._isCrisp = value;
                return this;
            };
            gridLinesClass.prototype.drawingParams = function (value) {
                if (arguments.length === 0) {
                    return this._drawingParams;
                }
                this._drawingParams = value;
                return this;
            };
            gridLinesClass.prototype.translate = function (x, y, isCrispAdjustment) {
                vp.select(this._rootElem)
                    .translate(x, y, isCrispAdjustment);
                return this;
            };
            gridLinesClass.prototype.transition = function (value) {
                if (arguments.length == 0) {
                    return this._transition;
                }
                this._transition = value;
                return this;
            };
            gridLinesClass.prototype.rootElem = function () {
                return this._rootElem;
            };
            gridLinesClass.prototype.xAxisData = function (value) {
                if (arguments.length == 0) {
                    return this._xData;
                }
                this._xData = value;
                return this;
            };
            gridLinesClass.prototype.yAxisData = function (value) {
                if (arguments.length == 0) {
                    return this._yData;
                }
                this._yData = value;
                return this;
            };
            return gridLinesClass;
        })();
        chartFrame.gridLinesClass = gridLinesClass;
        function createGridLines(container, xData, yData, isCrisp) {
            if (isCrisp === void 0) { isCrisp = true; }
            return new gridLinesClass(container, xData, yData, isCrisp);
        }
        chartFrame.createGridLines = createGridLines;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// leftAxis.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** creates a vertical axis with the labels to the right of the axis line. */
        var leftAxisClass = (function (_super) {
            __extends(leftAxisClass, _super);
            function leftAxisClass(container, axisDataOrScale, useWebGl, isCrisp) {
                var _this = this;
                _super.call(this, container, axisDataOrScale, useWebGl, isCrisp, chartFrame.LabelLocation.left);
                this._leftPad = 0;
                //vp.utils.trace("ctr", "leftAxis");
                this._nameRotation = 90; // the default for a left axis
                var root = this._rootElem;
                //---- create AXIS NAME ----
                this._nameMark = vp.marks.createTextMark(root, "vpxAxisName")
                    .onShade(function (element, record, index, isNew) {
                    /// General Note: when laying out elements with animations potentially active,
                    /// we cannot rely on system calls to determine position - we have to track 
                    /// x,y positions manually.  This is because calls like "elem.attr("x", 34)" don't change
                    /// "x" to 34 until the end of the animation.
                    var wrap = vp.select(element)
                        .text(_this._name);
                    var cx = _this._offset;
                    var cy = _this._axisSize / 2;
                    wrap = vp.select(element)
                        .attr("x", cx + "")
                        .attr("y", cy + "")
                        .attr("text-anchor", "start");
                    //---- now that properties are all set, VERT ALIGN at "cy" ----
                    _this.finalTextBaseline(_this._fakeNameLabel, wrap, "middle");
                    if (_this._nameRotation) {
                        if (_this._nameRotation == 45 || _this._nameRotation == -45) {
                            var result = _this.rotateText45(_this._name, wrap, vp.chartFrame.LabelLocation.left, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextWidth = result.width;
                        }
                        else if (_this._nameRotation == 90 || _this._nameRotation == -90) {
                            var result = _this.rotateText90(_this._name, wrap, vp.chartFrame.LabelLocation.left, cx, cy, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextWidth = result.width;
                        }
                    }
                    else {
                        var szLabel = _this.getFinalTextSize(_this._name, _this._drawingParams.name, _this._fakeNameLabel);
                        _this._maxTextWidth = szLabel.width;
                    }
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS LABELS ----
                this._labelMark = vp.marks.createTextMark(root, "vpxAxisLabel")
                    .keyFunc(chartFrame.labelKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    //---- szMaxText has been set to the largest measured label width/height ----
                    var textWidth = _this._szMaxText.width;
                    var availPixelsPerLabel = _this.getAvailablePixelsPerLabelForTruncation(_this._actualLabelRotation);
                    //---- will we apply truncation? ----
                    if (_this._labelOverflow == chartFrame.LabelOverflow.ellipses || _this._labelOverflow == chartFrame.LabelOverflow.truncate) {
                        textWidth = Math.min(textWidth, availPixelsPerLabel);
                    }
                    textWidth = _this.rotatedSize(_this._actualLabelRotation, textWidth, _this._szMaxText.height);
                    var xRight = _this._offset + textWidth;
                    var cy = record.offset;
                    var myWidth = _this.shadeTextLabel(index, element, xRight, cy, record.label, "end", "middle", chartFrame.LabelLocation.right, true, availPixelsPerLabel);
                    _this._maxTextWidth = Math.max(_this._maxTextWidth, myWidth);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS TICKS  ----
                this._tickMark = vp.marks.createLineMark(root, "vpxAxisTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create AXIS TICK BOXES  ----
                this._tickBox = vp.marks.createRectangleMark(root, "vpxAxisTickBox")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickBoxShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create MINOR TICKS  ----
                this._minorTickMark = vp.marks.createLineMark(root, "vpxAxisMinorTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickShader(element, record, index, isNew, _this._offset, _this._drawingParams.minorTickLength, record);
                });
                //---- create AXIS LINE ----
                this._axisLineMark = vp.marks.createLineMark(root, "vpxAxisLine")
                    .onShade(function (element, record, index, isNew) {
                    var yStart = 0;
                    var yEnd = _this._axisSize;
                    var x = _this._offset;
                    vp.select(element)
                        .vLine(yStart, yEnd, x, _this._isCrisp);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
            }
            leftAxisClass.prototype.shadeMarks = function (transition, record, index, isNew, context, measureOnly) {
                var dp = this._drawingParams;
                var generate = (!measureOnly);
                var group = vp.select(this._rootElem)
                    .addClass("vpxAxis");
                this._maxTextWidth = 0;
                this._offset = dp.startPadding;
                //---- generate SUB MARKS ----
                this.generateHorizontalName(generate, transition, false);
                this.generateHorizontalLabels(generate, transition, false);
                this.generateTicks(generate, transition, false);
                this.generateAxisLine(generate, transition, false);
                this._offset += dp.endPadding;
                if (this._minWidth && this._minWidth > this._offset) {
                    this._leftPad = this._minWidth - this._offset;
                    this._measuredSize = this._minWidth;
                }
                else {
                    this._leftPad = 0;
                    this._measuredSize = this._offset;
                }
            };
            leftAxisClass.prototype.height = function (value) {
                if (arguments.length === 0) {
                    return this._axisSize;
                }
                this._axisSize = value;
                return this;
            };
            return leftAxisClass;
        })(chartFrame.axisBaseClass);
        chartFrame.leftAxisClass = leftAxisClass;
        function createLeftAxis(container, axisDataOrScale, useWebGl, isCrisp) {
            if (isCrisp === void 0) { isCrisp = true; }
            return new leftAxisClass(container, axisDataOrScale, useWebGl, isCrisp);
        }
        chartFrame.createLeftAxis = createLeftAxis;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// rightAxis.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** creates a vertical axis with the labels to the right of the axis line. */
        var rightAxisClass = (function (_super) {
            __extends(rightAxisClass, _super);
            function rightAxisClass(container, axisDataOrScale, useWebGl, isCrisp) {
                var _this = this;
                _super.call(this, container, axisDataOrScale, useWebGl, isCrisp, chartFrame.LabelLocation.right);
                //vp.utils.trace("ctr", "rightAxis");
                this._nameRotation = 90; // the default for a right axis
                var root = this._rootElem;
                //---- create AXIS LINE ----
                this._axisLineMark = vp.marks.createLineMark(root, "vpxAxisLine")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    var yStart = 0;
                    var yEnd = _this._axisSize;
                    var x = _this._offset;
                    vp.select(element)
                        .vLine(yStart - 1, yEnd, x, _this._isCrisp);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS TICKS ----
                this._tickMark = vp.marks.createLineMark(root, "vpxAxisTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickShader(element, record, index, isNew, _this._offset, -_this._drawingParams.tickLength, record);
                });
                //---- create AXIS TICK BOXES  ----
                this._tickBox = vp.marks.createRectangleMark(root, "vpxAxisTickBox")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickBoxShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create MINOR TICKS  ----
                this._minorTickMark = vp.marks.createLineMark(root, "vpxAxisMinorTick")
                    .onShade(function (element, record, index, isNew) {
                    _this.horizontalTickShader(element, record, index, isNew, _this._offset, -_this._drawingParams.minorTickLength, record);
                });
                //---- create AXIS LABELS ----
                this._labelMark = vp.marks.createTextMark(root, "vpxAxisLabel")
                    .keyFunc(chartFrame.labelKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    //---- szMaxText has been set to the largest measured label width/height ----
                    var xLeft = _this._offset;
                    var cy = record.offset - 1; // small adjustment for asthetics
                    var availPixelsPerLabel = _this.getAvailablePixelsPerLabelForTruncation(_this._actualLabelRotation);
                    var myWidth = _this.shadeTextLabel(index, element, xLeft, cy, record.label, "start", "middle", vp.chartFrame.LabelLocation.left, true, availPixelsPerLabel);
                    _this._maxTextWidth = Math.max(_this._maxTextWidth, myWidth);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS NAME ----
                this._nameMark = vp.marks.createTextMark(root, "vpxAxisName")
                    .onShade(function (element, record, index, isNew) {
                    var wrap = vp.select(element)
                        .text(_this._name);
                    var cx = _this._offset;
                    var cy = _this._axisSize / 2;
                    wrap = vp.select(element)
                        .attr("x", cx + "")
                        .attr("y", cy + "")
                        .attr("text-anchor", "start");
                    //---- now that properties are all set, VERT ALIGN at "cy" ----
                    _this.finalTextBaseline(_this._fakeNameLabel, wrap, "middle");
                    if (_this._nameRotation) {
                        if (_this._nameRotation == 45 || _this._nameRotation == -45) {
                            var result = _this.rotateText45(_this._name, wrap, vp.chartFrame.LabelLocation.left, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextWidth = result.width;
                        }
                        else if (_this._nameRotation == 90 || _this._nameRotation == -90) {
                            var result = _this.rotateText90(_this._name, wrap, vp.chartFrame.LabelLocation.left, cx, cy, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextWidth = result.width;
                        }
                    }
                    else {
                        var szLabel = _this.getFinalTextSize(_this._name, _this._drawingParams.name, _this._fakeNameLabel);
                        _this._maxTextWidth = szLabel.width;
                    }
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
            }
            rightAxisClass.prototype.shadeMarks = function (transition, record, index, isNew, context, measureOnly) {
                var dp = this._drawingParams;
                var generate = (!measureOnly);
                var group = vp.select(this._rootElem)
                    .addClass("vpxAxis");
                this._maxTextWidth = 0;
                this._offset = dp.startPadding;
                //---- generate SUB MARKS ----
                this.generateAxisLine(generate, transition, true);
                this.generateTicks(generate, transition, true);
                this.generateHorizontalLabels(generate, transition, true);
                this.generateHorizontalName(generate, transition, true);
                this._offset += dp.endPadding;
                this._measuredSize = this._offset;
            };
            rightAxisClass.prototype.height = function (value) {
                if (arguments.length === 0) {
                    return this._axisSize;
                }
                this._axisSize = value;
                return this;
            };
            return rightAxisClass;
        })(chartFrame.axisBaseClass);
        chartFrame.rightAxisClass = rightAxisClass;
        function createRightAxis(container, axisDataOrScale, useWebGl, isCrisp) {
            if (isCrisp === void 0) { isCrisp = true; }
            return new rightAxisClass(container, axisDataOrScale, useWebGl, isCrisp);
        }
        chartFrame.createRightAxis = createRightAxis;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// topAxis.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var chartFrame;
    (function (chartFrame) {
        /** creates a vertical axis with the labels to the right of the axis line. */
        var topAxisClass = (function (_super) {
            __extends(topAxisClass, _super);
            function topAxisClass(container, axisDataOrScale, useWebGl, isCrisp) {
                var _this = this;
                _super.call(this, container, axisDataOrScale, useWebGl, isCrisp, chartFrame.LabelLocation.top);
                //vp.utils.trace("ctr", "topAxis");
                var root = this._rootElem;
                //---- create AXIS NAME ----
                this._nameMark = vp.marks.createTextMark(root, "vpxAxisName")
                    .onShade(function (element, record, index, isNew) {
                    var wrap = vp.select(element)
                        .text(_this._name);
                    //---- get early "rc" so we can bottom align (rotation vs. top align causing problem here) ----
                    var rc = vp.dom.getBounds(element); // .getBBox();
                    var cx = _this._axisSize / 2;
                    var textHeight = _this.rotatedSize(_this._nameRotation, rc.height, rc.width);
                    var cy = _this._offset; // + textHeight; 
                    var wrap = vp.select(element)
                        .attr("x", cx + "")
                        .attr("y", cy + "")
                        .attr("text-anchor", "middle");
                    //---- now that properties are all set, VERT ALIGN at "cy" ----
                    _this.finalTextBaseline(_this._fakeNameLabel, wrap, "top");
                    if (_this._nameRotation) {
                        if (_this._nameRotation == 45 || _this._nameRotation == -45) {
                            var result = _this.rotateText45(_this._name, wrap, vp.chartFrame.LabelLocation.bottom, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextHeight = result.height;
                        }
                        else if (_this._nameRotation == 90 || _this._nameRotation == -90) {
                            var result = _this.rotateText90(_this._name, wrap, vp.chartFrame.LabelLocation.bottom, cx, cy, _this._nameRotation, _this._drawingParams.name, _this._fakeNameLabel);
                            _this._maxTextHeight = result.height;
                        }
                    }
                    else {
                        var szLabel = _this.getFinalTextSize(_this._name, _this._drawingParams.name, _this._fakeNameLabel);
                        _this._maxTextHeight = szLabel.height;
                    }
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS LABELS ----
                this._labelMark = vp.marks.createTextMark(root, "vpxAxisLabel")
                    .keyFunc(chartFrame.labelKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    var textHeight = _this._szMaxText.height;
                    var availPixelsPerLabel = _this.getAvailablePixelsPerLabelForTruncation(_this._actualLabelRotation);
                    //---- will we apply truncation? ----
                    if (_this._labelOverflow == chartFrame.LabelOverflow.ellipses || _this._labelOverflow == chartFrame.LabelOverflow.truncate) {
                        textHeight = Math.min(textHeight, availPixelsPerLabel);
                    }
                    textHeight = _this.rotatedSize(_this._actualLabelRotation, textHeight, _this._szMaxText.width);
                    var cx = record.offset;
                    var yBottom = _this._offset + textHeight;
                    var availPixelsPerLabel = _this.getAvailablePixelsPerLabelForTruncation(_this._actualLabelRotation);
                    var myHeight = _this.shadeTextLabel(index, element, cx, yBottom, record.label, "middle", "bottom", chartFrame.LabelLocation.bottom, false, textHeight);
                    _this._maxTextHeight = Math.max(_this._maxTextHeight, myHeight);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
                //---- create AXIS TICKS ----
                this._tickMark = vp.marks.createLineMark(root, "vpxAxisTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create AXIS TICK BOXES ----
                this._tickBox = vp.marks.createRectangleMark(root, "vpxAxisTickBox")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickBoxShader(element, record, index, isNew, _this._offset, _this._drawingParams.tickLength, record);
                });
                //---- create MINOR TICKS  ----
                this._minorTickMark = vp.marks.createLineMark(root, "vpxAxisMinorTick")
                    .keyFunc(chartFrame.indexKeyFunc)
                    .onShade(function (element, record, index, isNew) {
                    _this.verticalTickShader(element, record, index, isNew, _this._offset, _this._drawingParams.minorTickLength, record);
                });
                //---- create AXIS LINE ----
                this._axisLineMark = vp.marks.createLineMark(root, "vpxAxisLine")
                    .onShade(function (element, record, index, isNew) {
                    var xStart = 0;
                    var xEnd = _this._axisSize;
                    var y = _this._offset;
                    vp.select(element)
                        .hLine(xStart, xEnd, y, _this._isCrisp);
                    if (_this._onShade) {
                        _this._onShade(element, record, index, isNew);
                    }
                });
            }
            topAxisClass.prototype.shadeMarks = function (transition, record, index, isNew, context, measureOnly) {
                var dp = this._drawingParams;
                var generate = (!measureOnly);
                var group = vp.select(this._rootElem)
                    .addClass("vpxAxis");
                this._maxTextWidth = 0;
                this._offset = dp.startPadding;
                //---- generate SUB MARKS ----
                this.generateVerticalName(generate, transition, false);
                this.generateVerticalLabels(generate, transition, false);
                this.generateTicks(generate, transition, false);
                this.generateAxisLine(generate, transition, false);
                this._offset += dp.endPadding;
                this._measuredSize = this._offset;
            };
            topAxisClass.prototype.width = function (value) {
                if (arguments.length === 0) {
                    return this._axisSize;
                }
                this._axisSize = value;
                return this;
            };
            return topAxisClass;
        })(chartFrame.axisBaseClass);
        chartFrame.topAxisClass = topAxisClass;
        function createTopAxis(container, axisDataOrScale, useWebGl, isCrisp) {
            if (isCrisp === void 0) { isCrisp = true; }
            return new topAxisClass(container, axisDataOrScale, useWebGl, isCrisp);
        }
        chartFrame.createTopAxis = createTopAxis;
    })(chartFrame = vp.chartFrame || (vp.chartFrame = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasElement.ts.  Copyright (c) 201r Microsoft Corporation.
///            Part of the vuePlotCore library - the base class for a canvas container or element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        var nextCanvasElementId = 1;
        //---- class: canvasElement ----
        //----    Lightweight class to hold attributes for a canvas shape, and optional children. ----
        var canvasElement = (function () {
            function canvasElement(parent) {
                this.ctr = "vp.canvasElement;";
                this.transform = null;
                this.id = nextCanvasElementId++;
                this.stylesByClass = {};
                this.stroke = "";
                this.fill = "";
                this.parentNode = parent;
                this.rootContainer = this.getRoot(parent);
                this.opacity = 1;
                this["stroke-width"] = 0;
            }
            canvasElement.prototype.clientRectToBoundingBox = function (rc) {
                var bb = { x: rc.left, y: rc.top, width: rc.width, height: rc.height, right: rc.right, bottom: rc.bottom };
                return bb;
            };
            canvasElement.prototype.getRoot = function (elem) {
                while ((elem) && (elem.ctr != "vp.canvasContainerElement") && (elem.tagName != "CANVAS")) {
                    elem = elem.parentNode;
                    ;
                }
                if (elem && elem.tagName == "CANVAS") {
                    elem = elem.canvasContainerElement; // canvasContainerElement associated with the CANVAS
                }
                return elem;
            };
            canvasElement.prototype.drawFrame = function (ctx, container) {
                this.preDraw(ctx);
                this.drawAll(ctx, container);
                this.postDraw(ctx);
            };
            canvasElement.prototype.preDraw = function (ctx) {
                ctx.globalAlpha = this.opacity;
                if (this.transform) {
                    var trans = this.transform;
                    ctx.setTransform(trans.sx, 0, 0, trans.sy, trans.tx, trans.ty);
                    if (trans.angle) {
                        ctx.translate(trans.cx, trans.cy);
                        ctx.rotate(Math.PI / 180 * trans.angle);
                    }
                }
            };
            canvasElement.prototype.drawAll = function (ctx, container) {
            };
            canvasElement.prototype.postDraw = function (ctx) {
                if (this.transform) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                }
            };
            canvasElement.prototype.markDrawNeeded = function () {
                this.rootContainer.markDrawNeeded();
            };
            canvasElement.prototype.setPathData = function (value) {
            };
            canvasElement.prototype.setPathPoints = function (value) {
            };
            /// todo: remove shortcuts (assuming no spaces between func name and "(", limited # of spaces in func args).
            canvasElement.prototype.getInsideOfFuncStr = function (str, funcName) {
                var result = null;
                var index = str.indexOf(funcName + "(");
                if (index > -1) {
                    var index2 = str.indexOf(")", index);
                    if (index2 > -1) {
                        var start = index + funcName.length + 1;
                        var len = index2 - start;
                        result = str.substr(start, len).trim();
                        result = result.replace(/,/g, ' '); // translate commas into spaces
                        result = result.replace(/  /g, ' '); // compress double spaces to single
                        result = result.replace(/  /g, ' '); // compress double spaces to single
                    }
                }
                return result;
            };
            canvasElement.prototype.setTransform = function (value) {
                var transform = null;
                if (value) {
                    var transform = { tx: 0, ty: 0, sx: 1, sy: 1, angle: 0, cx: 0, cy: 0 };
                    var result = this.getInsideOfFuncStr(value, "translate");
                    if (result) {
                        var numbers = result.split(' ');
                        transform.tx = +numbers[0];
                        transform.ty = +numbers[1];
                    }
                    var result = this.getInsideOfFuncStr(value, "scale");
                    if (result) {
                        var numbers = result.split(' ');
                        transform.sx = +numbers[0];
                        transform.sy = +numbers[1];
                    }
                    var result = this.getInsideOfFuncStr(value, "rotate");
                    if (result) {
                        var numbers = result.split(' ');
                        transform.angle = +numbers[0];
                        transform.cx = +numbers[1];
                        transform.cy = +numbers[2];
                    }
                }
                this.transform = transform;
                this.markDrawNeeded();
            };
            canvasElement.prototype.getTransform = function () {
                var str = "";
                if (this.transform) {
                    var trans = this.transform;
                    var str = "";
                    if (trans.tx != 0 || trans.ty != 0) {
                        str += "translate(" + trans.tx + " " + trans.ty + ") ";
                    }
                    if (trans.sx != 1 || trans.sy != 1) {
                        str += "scale(" + trans.sx + " " + trans.sy + ") ";
                    }
                    if (trans.angle) {
                        str += "rotate(" + trans.angle + " " + trans.cx + " " + trans.cy + ") ";
                    }
                }
                return str;
            };
            canvasElement.prototype.applyStyle = function (style) {
                if (style.opacity !== undefined) {
                    this.opacity = style.opacity;
                }
                if (style.fill !== undefined) {
                    this.fill = style.fill;
                }
                if (style.stroke !== undefined) {
                    this.stroke = style.stroke;
                }
                if (style.strokeWidth !== undefined) {
                    this["stroke-width"] = parseFloat(style.strokeWidth); // ignore "px" units on end, if any
                }
            };
            canvasElement.prototype.setAttribute = function (name, value) {
                if (name == "d") {
                    //---- special handling for path's data property ----
                    this.setPathData(value);
                }
                else if (name == "points") {
                    //---- special handling for path's data property ----
                    this.setPathPoints(value);
                }
                else if (name == "transform") {
                    this.setTransform(value);
                }
                else {
                    this[name] = value;
                }
                this.markDrawNeeded();
            };
            canvasElement.prototype.getAttribute = function (name) {
                return this[name];
            };
            canvasElement.prototype.append = function (strElem) {
                var elem = null;
                if (strElem == "rect") {
                    elem = new canvas.canvasRectElement(this);
                }
                else if (strElem == "circle") {
                    elem = new canvas.canvasCircleElement(this);
                }
                else if (strElem == "ellipse") {
                    elem = new canvas.canvasEllipseElement(this);
                }
                else if (strElem == "text") {
                    elem = new canvas.canvasTextElement(this);
                }
                else if (strElem == "line") {
                    elem = new canvas.canvasLineElement(this);
                }
                else if (strElem == "path") {
                    elem = new canvas.canvasPathElement(this);
                }
                else if (strElem == "image") {
                    elem = new canvas.canvasImageElement(this);
                }
                else if (strElem == "polygon") {
                    elem = new canvas.canvasPolygonElement(this);
                }
                else if (strElem == "g") {
                    elem = new canvas.canvasGroupElement(this);
                }
                else {
                    vp.utils.error("This element type not yet supported for canvas by VuePlot: " + strElem);
                }
                if (elem != null) {
                    this.children.push(elem);
                    this.markDrawNeeded();
                }
                return elem;
            };
            return canvasElement;
        })();
        canvas.canvasElement = canvasElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasCircleElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotore library - represents a lightweight CANVAS CIRCLE element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasCircleElement ----
        var canvasCircleElement = (function (_super) {
            __extends(canvasCircleElement, _super);
            function canvasCircleElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasCircleElement";
                this.tagName = "circle";
                this.cx = 0;
                this.cy = 0;
                this.r = 0;
            }
            canvasCircleElement.prototype.applyStyle = function (style) {
                _super.prototype.applyStyle.call(this, style);
            };
            canvasCircleElement.prototype.getOffset = function () {
                var x = this.cx - this.r;
                var y = this.cy - this.r;
                return { x: x, y: y };
            };
            /// return elem found at x,y.
            canvasCircleElement.prototype.hitTest = function (x, y) {
                var elem = null;
                //---- for circle, this is easy.  use distance <= r for match ----
                var xdiff = this.cx - x;
                var ydiff = this.cy - y;
                var dist = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                if (dist <= this.r) {
                    elem = this;
                }
                //vp.utils.debug("circle.hitTest: dist=" + dist);
                return elem;
            };
            canvasCircleElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    ctx.beginPath();
                    ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
                    ctx.closePath();
                    if (container.isHitTesting) {
                        container.hitTestPath(ctx, this);
                    }
                    if (this.fill != null && this.fill != "none" && this.fill != "") {
                        if (container.currentFill != this.fill) {
                            ctx.fillStyle = this.fill;
                            container.currentFill = this.fill;
                        }
                        ctx.fill();
                    }
                    if (this.stroke != null && this.stroke != "none" && this.stroke != "") {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        if (container.currentStrokeWidth != this["stroke-width"]) {
                            ctx.lineWidth = this["stroke-width"];
                            container.currentStrokeWidth = this["stroke-width"];
                        }
                        ctx.stroke();
                    }
                }
            };
            canvasCircleElement.prototype.getWidth = function () {
                return 2 * this.r;
            };
            canvasCircleElement.prototype.getHeight = function () {
                return 2 * this.r;
            };
            return canvasCircleElement;
        })(canvas.canvasElement);
        canvas.canvasCircleElement = canvasCircleElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasContainerElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - holds information associated with a CANVAS DOM element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas_1) {
        //---- class: canvasContainerElement - a helper class for a canvas element that has ----
        //---- lightweight "canvas elements" (our "property bags" for shapes drawn in a canvas).
        var canvasContainerElement = (function (_super) {
            __extends(canvasContainerElement, _super);
            function canvasContainerElement(canvas, ctx, contextRequest) {
                _super.call(this, null);
                //---- keep this instance as property on canvas, so other instances can reuse us ----
                //---- and, as we walk the hierarchy, we know that this is a canvas on which we have ----
                //---- canvas lightweight elements.
                this.ctr = "vp.canvasContainerElement";
                this.frameCount = 0;
                this.lastTime = Date.now();
                this.bufferBuildTime = 0;
                this.frameRate = 0;
                this.frameRateChanged = null;
                this.opacity = 1;
                this.currentFill = "";
                this.currentStroke = "";
                this.currentStrokeWidth = 0;
                this.selectedFill = "orange";
                this.drawCallback = null;
                this.activeAnimations = []; // list of active animations
                this.drawNeeded = false; // this flagged is used to rebuild buffers (don't remove)
                //---- hit test management ----
                this.isHitTesting = false;
                this.hitTestX = 0;
                this.hitTestY = 0;
                this.hitTestResult = null;
                this.drawTimer = null;
                //animTimer = null;
                this.drawCount = 0;
                this.rootContainer = this;
                this.parentNode = canvas;
                canvas.canvasContainerElement = this;
                this.canvas = canvas; // our canvas ELEMENT
                this.ctx = ctx;
                this.children = [];
                this.contextRequest = contextRequest;
                this.initialized = false;
                vp.utils.debug("canvasContainer CTR");
                if (this.contextRequest == "3d") {
                    this.initialized = true;
                }
            }
            /// hit testing for canvas 2D/3D elements (rect, circle, text, line, etc).
            canvasContainerElement.prototype.getCanvasElementAtPoint = function (x, y) {
                var elemFound = null;
                //---- canvas 2d - use pointInPath() during drawing to find elem ----
                this.isHitTesting = true;
                this.hitTestX = x;
                this.hitTestY = y;
                this.hitTestResult = null;
                this.drawFrame();
                elemFound = this.hitTestResult;
                return elemFound;
            };
            canvasContainerElement.prototype.markDrawNeeded = function () {
                //vp.utils.debug("container.markDrawNeeded: drawTimer=" + this.drawTimer);
                var _this = this;
                if (!this.drawTimer) {
                    this.drawTimer = setTimeout(function () {
                        _this.drawFrame(false);
                    }, 10);
                }
            };
            /// remove the specified child element.
            canvasContainerElement.prototype.removeChild = function (element) {
                this.children.remove(element);
                this.markDrawNeeded();
            };
            /// remove all children.
            canvasContainerElement.prototype.clear = function () {
                this.children = [];
                this.markDrawNeeded();
            };
            canvasContainerElement.prototype.hitTestPath = function (ctx, elem) {
                if (ctx.isPointInPath(this.hitTestX, this.hitTestY)) {
                    this.hitTestResult = elem;
                    this.isHitTesting = false;
                }
            };
            canvasContainerElement.prototype.drawAll = function (ctx) {
                ctx.globalAlpha = 1;
                //this.drawSelf(ctx);
                this.currentFill = "none";
                this.currentStroke = "none";
                this.currentStrokeWidth = -999;
                this.selectedFill = "orange";
                //---- draw children ----
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].drawFrame(ctx, this);
                }
            };
            canvasContainerElement.prototype.drawFrame = function (rearmTimer) {
                this.drawCount++;
                //vp.utils.debug("canvasContainerElement: draw(): drawCount=" + this.drawCount);
                this.drawTimer = null;
                //---- frame stats ----
                this.frameCount++;
                var elapsed = Date.now() - this.lastTime;
                if (elapsed >= 1000) {
                    this.frameRate = Math.round(this.frameCount / (elapsed / 1000));
                    if (this.frameRateChanged != null) {
                        var count = this.children.length;
                        this.frameRateChanged(this.frameRate, count, this.bufferBuildTime);
                    }
                    this.frameCount = 0;
                    this.lastTime = Date.now();
                }
                //---- clear the canvas ----
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawAll(this.ctx);
                if (this.children.length == 0) {
                    vp.utils.debug("canvas clear, children=" + this.children.length);
                }
                if (this.drawCallback) {
                    this.drawCallback();
                }
            };
            canvasContainerElement.prototype.close = function () {
                if (this.drawTimer) {
                    clearTimeout(this.drawTimer);
                    this.drawTimer = null;
                }
                this.children = [];
            };
            return canvasContainerElement;
        })(canvas_1.canvasElement);
        canvas_1.canvasContainerElement = canvasContainerElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasEllipseElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - represents a lightweight CANVAS ELLIPSE element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasEllipseElement ----
        var canvasEllipseElement = (function (_super) {
            __extends(canvasEllipseElement, _super);
            function canvasEllipseElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasEllipseElement";
                this.tagName = "ellipse";
                this.opacity = 1;
                this.cx = 0;
                this.cy = 0;
                this.rx = 0;
                this.ry = 0;
                this["stroke-width"] = 1;
            }
            canvasEllipseElement.prototype.getOffset = function () {
                var x = this.cx - this.rx;
                var y = this.cy - this.ry;
                return { x: x, y: y };
            };
            /// return elem found at x,y.
            canvasEllipseElement.prototype.hitTest = function (x, y) {
                var elem = null;
                //---- for ellipse, this is easy.  use distance <= r for match ----
                var xdiff = this.cx - x;
                var ydiff = this.cy - y;
                var dist = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                if (dist <= Math.max(this.rx, this.ry)) {
                    elem = this;
                }
                //vp.utils.debug("ellipse.hitTest: dist=" + dist);
                return elem;
            };
            canvasEllipseElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    var left = this.cx - this.rx;
                    var right = this.cx + this.rx;
                    var top = this.cy - this.ry;
                    var bottom = this.cy + this.ry;
                    //---- canvas has no built-in ellipse support, so we just scale a circle ----
                    var xScale = 1;
                    var yScale = 1;
                    var radius = this.rx;
                    if (this.rx > this.ry) {
                        yScale = this.ry / this.rx;
                        radius = this.rx;
                    }
                    else {
                        xScale = this.rx / this.ry;
                        radius = this.ry;
                    }
                    ctx.beginPath();
                    ctx.save();
                    ctx.translate(this.cx, this.cy);
                    ctx.scale(xScale, yScale);
                    ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
                    ctx.restore();
                    ctx.closePath();
                    if (container.isHitTesting) {
                        container.hitTestPath(ctx, this);
                    }
                    if (this.fill != null && this.fill != "none") {
                        if (container.currentFill != this.fill) {
                            ctx.fillStyle = this.fill;
                            container.currentFill = this.fill;
                        }
                        ctx.fill();
                    }
                    if (this.stroke != null) {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        if (container.currentStrokeWidth != this["stroke-width"]) {
                            ctx.lineWidth = this["stroke-width"];
                            container.currentStrokeWidth = this["stroke-width"];
                        }
                        ctx.stroke();
                    }
                }
            };
            canvasEllipseElement.prototype.getWidth = function () {
                return 2 * this.rx;
            };
            canvasEllipseElement.prototype.getHeight = function () {
                return 2 * this.ry;
            };
            return canvasEllipseElement;
        })(canvas.canvasElement);
        canvas.canvasEllipseElement = canvasEllipseElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasGroupElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - a class for a lightweight canvas GROUP element  
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasGroupElement ----
        var canvasGroupElement = (function (_super) {
            __extends(canvasGroupElement, _super);
            function canvasGroupElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasGroupElement";
                this.tagName = "g";
                this.opacity = 1;
                this.children = [];
                this.x = 0;
                this.y = 0;
            }
            canvasGroupElement.prototype.getOffset = function () {
                return { x: this.x, y: this.y };
            };
            /// find 2d/3d element that intersects with x,y at z=0.  return that element.
            canvasGroupElement.prototype.hitTest = function (x, y) {
                var elem = null;
                //---- for now, we test each child.  may use color-based bitmap in future. ----
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    elem = child.hitTest(x, y);
                    if (elem) {
                        break;
                    }
                }
                return elem;
            };
            canvasGroupElement.prototype.appendChild = function (element) {
                this.children.push(element);
                this.markDrawNeeded();
            };
            /// remove the specified child element.
            canvasGroupElement.prototype.removeChild = function (element) {
                this.children.remove(element);
                this.markDrawNeeded();
            };
            /// remove all children.
            canvasGroupElement.prototype.clear = function () {
                this.children = [];
                this.markDrawNeeded();
            };
            canvasGroupElement.prototype.drawAll = function (ctx, container) {
                //---- todo: apply transfrom from each element (group & children) ----
                if (this.visibility != "hidden") {
                    //---- draw children ----
                    for (var i = 0; i < this.children.length; i++) {
                        var child = this.children[i];
                        child.drawFrame(ctx, container);
                    }
                }
            };
            return canvasGroupElement;
        })(canvas.canvasElement);
        canvas.canvasGroupElement = canvasGroupElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasImageElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - represents a lightweight CANVAS IMAGE element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasImageElement ----
        var canvasImageElement = (function (_super) {
            __extends(canvasImageElement, _super);
            function canvasImageElement(parentElement) {
                var _this = this;
                _super.call(this, parentElement);
                this.ctr = "vp.canvasImageElement";
                this.tagName = "image";
                this.x = 0;
                this.y = 0;
                this.width = 100;
                this.height = 100;
                this.strokePlacement = "straddle"; // "inside", "straddle", "outside"
                this.image = new Image();
                this._href = null;
                this.opacity = 1;
                this["stroke-width"] = 0;
                this.image.onload = function (e) {
                    _this.markDrawNeeded();
                };
            }
            canvasImageElement.prototype.getOffset = function () {
                return { x: this.x, y: this.y };
            };
            canvasImageElement.prototype.getBBox = function () {
                var x = (vp.utils.isDefined(this.layoutX)) ? this.layoutX : this.x;
                var y = (vp.utils.isDefined(this.layoutY)) ? this.layoutY : this.y;
                //---- return bounds as a vuePlot rect ----
                var rc = {
                    left: x, top: y, width: this.width, height: this.height,
                    right: x + this.width, bottom: y + this.height
                };
                return rc;
            };
            canvasImageElement.prototype.hrefOverride = function (src) {
                if (arguments.length == 0) {
                    return this._href;
                }
                this._href = src;
                this.image.setAttribute("src", src);
            };
            /// return elem found at x,y.
            canvasImageElement.prototype.hitTest = function (x, y) {
                //---- for axis aligned rect, this is easy.  see if point is between left/right and top/bottom ----
                var elem = null;
                var myx = (vp.utils.isDefined(this.layoutX)) ? this.layoutX : this.x;
                var myy = (vp.utils.isDefined(this.layoutY)) ? this.layoutY : this.y;
                if ((x >= myx) && (x <= myx + this.width)) {
                    if ((y >= myy) && (y <= myy + this.height)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasImageElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
                    if (container.isHitTesting) {
                        ctx.save();
                        //---- create a rect path ----
                        ctx.beginPath();
                        ctx.rect(this.x, this.y, this.width, this.height);
                        container.hitTestPath(ctx, this);
                        ctx.restore();
                    }
                }
            };
            canvasImageElement.prototype.getWidth = function () {
                return this.width;
            };
            canvasImageElement.prototype.getHeight = function () {
                return this.height;
            };
            return canvasImageElement;
        })(canvas.canvasElement);
        canvas.canvasImageElement = canvasImageElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasLineElement.js.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlot library - represents a lightweight CANVAS LINE element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasLineElement ----
        var canvasLineElement = (function (_super) {
            __extends(canvasLineElement, _super);
            function canvasLineElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasLineElement";
                this.tagName = "rect";
                this.opacity = 1;
                this.x1 = 0;
                this.x2 = 0;
                this.y1 = 0;
                this.y2 = 0;
                this["stroke-width"] = 1;
            }
            canvasLineElement.prototype.getOffset = function () {
                var left = Math.min(this.x1, this.x2);
                var top = Math.min(this.y1, this.y2);
                return { x: left, y: top };
            };
            /// return line at x,y, if any.
            canvasLineElement.prototype.hitTest = function (x, y) {
                //---- for NOW, just use axis aligned rect.  later, we will test the non-axis aligned rect that is the line ----
                var elem = null;
                var left = Math.min(this.x1, this.x2);
                var right = Math.max(this.x1, this.x2);
                var top = Math.min(this.y1, this.y2);
                var bottom = Math.max(this.y1, this.y2);
                if ((x >= left) && (x <= right)) {
                    if ((y >= top) && (y <= bottom)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasLineElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    if ((this.stroke != null) && (this["stroke-width"] > 0)) {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        if (container.currentStrokeWidth != this["stroke-width"]) {
                            ctx.lineWidth = this["stroke-width"];
                            container.currentStrokeWidth = this["stroke-width"];
                        }
                        ctx.beginPath();
                        ctx.moveTo(this.x1, this.y1);
                        ctx.lineTo(this.x2, this.y2);
                        ctx.stroke();
                        if (container.isHitTesting) {
                            container.hitTestPath(ctx, this);
                        }
                    }
                }
            };
            canvasLineElement.prototype.getWidth = function () {
                return Math.abs(this.x1 - this.x2);
            };
            canvasLineElement.prototype.getHeight = function () {
                return Math.abs(this.y1 - this.y2);
            };
            return canvasLineElement;
        })(canvas.canvasElement);
        canvas.canvasLineElement = canvasLineElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasPathElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - represents a lightweight CANVAS PATH element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasPathElement ----
        var canvasPathElement = (function (_super) {
            __extends(canvasPathElement, _super);
            function canvasPathElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasPathElement";
                this.tagName = "path";
                this.opacity = 1;
                this.boundingBox = { x: 0, y: 0, width: 0, height: 0, right: 0, bottom: 0 };
                this.createPathFunc = null; // function to run the path cmds
                this.pathDataStr = ""; // the "d" string, used to generate "createPathFunc"
                this["stroke-width"] = 1;
            }
            canvasPathElement.prototype.getOffset = function () {
                return { x: this.boundingBox.x, y: this.boundingBox.y };
            };
            canvasPathElement.prototype.getBBox = function () {
                return this.boundingBox;
            };
            canvasPathElement.prototype.createPathOnContext = function (ctx) {
                //---- "createPathFunc" is generated when the "d" property is assigned a value ----
                //---- calling "drawPath(ctx)" runs the path commands in the specified ctx context. ----
                if (this.createPathFunc) {
                    this.createPathFunc(ctx);
                }
            };
            /// return elem found at x,y.
            canvasPathElement.prototype.hitTest = function (x, y) {
                //---- for axis aligned rect, this is easy.  see if point is between left/right and top/bottom ----
                var bb = this.boundingBox;
                var elem = null;
                if ((x >= bb.x) && (x <= bb.right)) {
                    if ((y >= bb.y) && (y <= bb.bottom)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasPathElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    ctx.beginPath();
                    this.createPathOnContext(ctx); // run the dynamically generatedto draw the path
                    if (this.fill != null && this.fill != "none") {
                        if (container.currentFill != this.fill) {
                            ctx.fillStyle = this.fill;
                            container.currentFill = this.fill;
                        }
                        ctx.fill();
                    }
                    if ((this.stroke != null) && (this["stroke-width"] > 0)) {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        if (container.currentStrokeWidth != this["stroke-width"]) {
                            ctx.lineWidth = this["stroke-width"];
                            container.currentStrokeWidth = this["stroke-width"];
                        }
                        ctx.stroke();
                    }
                    if (container.isHitTesting) {
                        container.hitTestPath(ctx, this);
                    }
                }
            };
            //--- this is the "d" attribute (the path string) ----
            canvasPathElement.prototype.setPathData = function (value) {
                this.pathDataStr = value;
                this.parseDataStr();
            };
            /// Canvas path is NOT a string - it a series of cmds executed on the ctx object, 
            /// so we generate that a JavaScript function to do those commands here...
            canvasPathElement.prototype.parseDataStr = function () {
                var parser = new vp.internal.parsePathDataAndGenerateDrawFunc(this.pathDataStr);
                var both = parser.parse();
                var funcStr = both[0];
                var rc = both[1];
                this.boundingBox = this.clientRectToBoundingBox(rc);
                //---- generate code for our----
                eval("this.createPathFunc = " + funcStr);
            };
            canvasPathElement.prototype.getWidth = function () {
                return this.boundingBox.width;
            };
            canvasPathElement.prototype.getHeight = function () {
                return this.boundingBox.height;
            };
            return canvasPathElement;
        })(canvas.canvasElement);
        canvas.canvasPathElement = canvasPathElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasPolygonElement.js.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlot library - represents a lightweight CANVAS POLYGON element.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasPolygonElement ----
        var canvasPolygonElement = (function (_super) {
            __extends(canvasPolygonElement, _super);
            function canvasPolygonElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasPolygonElement";
                this.tagName = "rect";
                this.opacity = 1;
                this.boundingBox = { x: 0, y: 0, width: 0, height: 0, right: 0, bottom: 0 };
                this.pointStr = "";
                this.fill = "";
                this.stroke = "";
                this["stroke-width"] = 1;
            }
            canvasPolygonElement.prototype.getOffset = function () {
                return { x: this.boundingBox.x, y: this.boundingBox.y };
            };
            canvasPolygonElement.prototype.getBBox = function () {
                return this.boundingBox;
            };
            canvasPolygonElement.prototype.drawPath = function (ctx) {
                //---- this is generated when the "points" property is assigned a value ----
            };
            /// return elem found at x,y.
            canvasPolygonElement.prototype.hitTest = function (x, y) {
                //---- for axis aligned rect, this is easy.  see if point is between left/right and top/bottom ----
                var bb = this.boundingBox;
                var elem = null;
                if ((x >= bb.x) && (x <= bb.right)) {
                    if ((y >= bb.y) && (y <= bb.bottom)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasPolygonElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    ctx.beginPath();
                    this.drawPath(ctx); // run the dynamically generatedto draw the path
                    if (this.fill != null && this.fill != "none") {
                        if (container.currentFill != this.fill) {
                            ctx.fillStyle = this.fill;
                            container.currentFill = this.fill;
                        }
                        ctx.fill();
                    }
                    if ((this.stroke != null) && (this["stroke-width"] > 0)) {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        if (container.currentStrokeWidth != this["stroke-width"]) {
                            ctx.lineWidth = this["stroke-width"];
                            container.currentStrokeWidth = this["stroke-width"];
                        }
                        ctx.stroke();
                    }
                    if (container.isHitTesting) {
                        container.hitTestPath(ctx, this);
                    }
                }
            };
            canvasPolygonElement.prototype.setPathPoints = function (value) {
                this.points(value);
            };
            canvasPolygonElement.prototype.points = function (value) {
                if (arguments.length == 0) {
                    return this.pointStr;
                }
                this.pointStr = value;
                this.genDrawFromPoints();
                return this;
            };
            canvasPolygonElement.prototype.genDrawFromPoints = function () {
                var funcStr = "function (ctx)\r\n"
                    + "{\r\n";
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var maxX = -Number.MAX_VALUE; // Number.MIN_VALUE;
                var maxY = -Number.MAX_VALUE; // Number.MIN_VALUE;
                var firstPt = null;
                var points = this.pointStr.split(" ");
                for (var i = 0; i < points.length; i++) {
                    var ptx = points[i];
                    var xy = ptx.split(",");
                    var pt = { x: +xy[0], y: +xy[1] };
                    if (i == 0) {
                        funcStr += "    ctx.moveTo(" + pt.x + "," + pt.y + ");\r\n";
                    }
                    else {
                        funcStr += "    ctx.lineTo(" + pt.x + "," + pt.y + ");\r\n";
                    }
                    if (firstPt == null) {
                        firstPt = pt;
                    }
                    minX = Math.min(minX, pt.x);
                    minY = Math.min(minY, pt.y);
                    maxX = Math.max(maxX, pt.x);
                    maxY = Math.max(maxY, pt.y);
                }
                //---- generate line back to initial point ----
                if (firstPt) {
                    funcStr += "    ctx.lineTo(" + firstPt.x + "," + firstPt.y + ");\r\n";
                }
                funcStr += "}\r\n";
                var rc = vp.geom.rect(minX, minY, maxX - minX, maxY - minY);
                this.boundingBox = this.clientRectToBoundingBox(rc);
                //---- generate code for our----
                eval("this.drawPath = " + funcStr);
            };
            canvasPolygonElement.prototype.getWidth = function () {
                return this.boundingBox.width;
            };
            canvasPolygonElement.prototype.getHeight = function () {
                return this.boundingBox.height;
            };
            return canvasPolygonElement;
        })(canvas.canvasElement);
        canvas.canvasPolygonElement = canvasPolygonElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasRectElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - represents a lightweight CANVAS RECT element.
///-----------------------------------------------------------------------------------------------------------------
//---- class: canvasRectElement ----
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        var canvasRectElement = (function (_super) {
            __extends(canvasRectElement, _super);
            function canvasRectElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasRectElement";
                this.tagName = "rect";
                this.x = 0;
                this.y = 0;
                this.width = 100;
                this.height = 100;
                this.strokePlacement = "straddle"; // "inside", "straddle", "outside"
                this.fill = "";
                this.stroke = "";
            }
            canvasRectElement.prototype.getOffset = function () {
                return { x: this.x, y: this.y };
            };
            canvasRectElement.prototype.getBBox = function () {
                var x = (vp.utils.isDefined(this.layoutX)) ? this.layoutX : this.x;
                var y = (vp.utils.isDefined(this.layoutY)) ? this.layoutY : this.y;
                //---- return bounds as a vuePlot rect ----
                var rc = {
                    left: x, top: y, width: this.width, height: this.height,
                    right: x + this.width, bottom: y + this.height
                };
                return rc;
            };
            /// return elem found at x,y.
            canvasRectElement.prototype.hitTest = function (x, y) {
                //---- for axis aligned rect, this is easy.  see if point is between left/right and top/bottom ----
                var elem = null;
                var myx = (vp.utils.isDefined(this.layoutX)) ? this.layoutX : this.x;
                var myy = (vp.utils.isDefined(this.layoutY)) ? this.layoutY : this.y;
                if ((x >= myx) && (x <= myx + this.width)) {
                    if ((y >= myy) && (y <= myy + this.height)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasRectElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    if (this.fill != null && this.fill != "none") {
                        if (container.currentFill != this.fill) {
                            ctx.fillStyle = this.fill;
                            container.currentFill = this.fill;
                        }
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    if ((this.stroke != null) && (this["stroke-width"] > 0)) {
                        if (container.currentStroke != this.stroke) {
                            ctx.strokeStyle = this.stroke;
                            container.currentStroke = this.stroke;
                        }
                        var sw = this["stroke-width"];
                        if (container.currentStrokeWidth != sw) {
                            ctx.lineWidth = sw;
                            container.currentStrokeWidth = sw;
                        }
                        if (this.strokePlacement == "inside") {
                            var sw_div2 = this["stroke-width"] / 2;
                            ctx.strokeRect(this.x + sw_div2, this.y + sw_div2, this.width - sw, this.height - sw);
                        }
                        else if (this.strokePlacement == "outside") {
                            var sw_div2 = this["stroke-width"] / 2;
                            ctx.strokeRect(this.x - sw_div2, this.y - sw_div2, this.width + sw, this.height + sw);
                        }
                        else {
                            ctx.strokeRect(this.x, this.y, this.width, this.height);
                        }
                    }
                    if (container.isHitTesting) {
                        ctx.save();
                        //---- create a rect path ----
                        ctx.beginPath();
                        ctx.rect(this.x, this.y, this.width, this.height);
                        container.hitTestPath(ctx, this);
                        ctx.restore();
                    }
                }
            };
            canvasRectElement.prototype.getWidth = function () {
                return this.width;
            };
            canvasRectElement.prototype.getHeight = function () {
                return this.height;
            };
            return canvasRectElement;
        })(canvas.canvasElement);
        canvas.canvasRectElement = canvasRectElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasTextElement.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - represents a lightweight CANVAS TEXT element.
///-----------------------------------------------------------------------------------------------------------------
//---- class: canvasRectElement ----
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasTextElement ----
        var canvasTextElement = (function (_super) {
            __extends(canvasTextElement, _super);
            function canvasTextElement(parentElement) {
                _super.call(this, parentElement);
                this.ctr = "vp.canvasTextElement";
                this.tagName = "text";
                this.textContent = "";
                this.opacity = 1;
                this.x = 0;
                this.y = 0;
                this.fill = "";
                this.stroke = "";
                this.width = 0;
                this.height = 0;
                this.verticalAlign = "top"; // all measurements rely on this (?)
            }
            canvasTextElement.prototype.applyStyle = function (style) {
                if (style.opacity !== undefined) {
                    this.opacity = style.opacity;
                }
                if (style.fill !== undefined) {
                    this.fill = style.fill;
                }
                if (style.stroke !== undefined) {
                    this.stroke = style.stroke;
                }
                if (style.strokeWidth !== undefined) {
                    this["stroke-width"] = style.strokeWidth;
                }
                if (style.fontSize !== undefined) {
                    this["font-size"] = style.fontSize;
                }
                if (style.fontWeight !== undefined) {
                    this.fontWeight = style.fontWeight;
                }
                if (style.fontStyle !== undefined) {
                    this.fontStyle = style.fontStyle;
                }
                if (style.fontFamily !== undefined) {
                    this["font-family"] = style.fontFamily;
                }
                if (style.textAnchor !== undefined) {
                    this["text-anchor"] = style.textAnchor;
                }
            };
            /// return elem found at x,y.
            canvasTextElement.prototype.hitTest = function (x, y) {
                //---- for text; just treat as rect.  see if point is between left/right and top/bottom ----
                var elem = null;
                if ((x >= this.x) && (x <= this.x + this.width)) {
                    if ((y >= this.y) && (y <= this.y + this.height)) {
                        elem = this;
                    }
                }
                return elem;
            };
            canvasTextElement.prototype.getOffset = function () {
                var left = this.x;
                var top = this.y;
                //---- elem.y specifies the bottom for text elements, so substract the height to get the top ----
                top -= this.getHeight();
                return { x: left, y: top };
            };
            canvasTextElement.prototype.setContextForDrawing = function (ctx) {
                var font = "";
                //---- STYLE ----
                if (this.fontStyle != undefined) {
                    font += this.fontStyle + " ";
                }
                //---- WEIGHT ----
                if (this.fontWeight != undefined) {
                    font += this.fontWeight + " ";
                }
                //---- SIZE ----
                if (this["font-size"] != undefined) {
                    var fs = this["font-size"];
                    if (vp.utils.isNumber(fs)) {
                        //---- SVG uses the "current user coordinate system" for this; we will assume it is pixels ----
                        font += fs + "px ";
                    }
                    else {
                        font += fs + " ";
                    }
                }
                if (this["font-family"]) {
                    font += this["font-family"] + " ";
                }
                else {
                    font += "tahoma ";
                }
                ctx.font = font;
                if (this.fill != null && this.fill != "none") {
                    ctx.fillStyle = this.fill;
                }
                else {
                    ctx.fillStyle = "transparent";
                }
                if (this.stroke != null && this.stroke != "none") {
                    ctx.strokeStyle = this.stroke;
                    ctx.lineWidth = this["stroke-width"];
                }
                else {
                    ctx.strokeStyle = "transparent";
                    ctx.lineWidth = 0;
                }
                var textAlign = this["text-anchor"]; // start, middle, or end
                if (textAlign) {
                    if (textAlign == "middle") {
                        textAlign = "center";
                    }
                    ctx.textAlign = textAlign;
                }
                if (this.verticalAlign) {
                    ctx.textBaseline = this.verticalAlign;
                }
            };
            canvasTextElement.prototype.drawAll = function (ctx, container) {
                if (this.visibility != "hidden") {
                    ctx.globalAlpha = this.opacity;
                    this.setContextForDrawing(ctx);
                    //---- apply alignment ----
                    var x = +this.x;
                    var y = +this.y;
                    if (this.transform && this.transform.angle) {
                        //var height = this.getHeight();
                        //var width = this.getWidth();
                        //---- must offset x, y from the rotation position ----
                        x -= this.transform.cx;
                        y -= this.transform.cy;
                    }
                    if (this.fill && this.fill != "none") {
                        ctx.fillText(this.textContent, x, y);
                    }
                    if (this.stroke && this.stroke != "none") {
                        ctx.strokeText(this.textContent, x, y);
                    }
                    if (container.isHitTesting) {
                        ctx.save();
                        //---- create a rect path to represent the text block (any other way to do this?) ----
                        ctx.beginPath();
                        var width = +ctx.measureText(this.textContent).width;
                        var height = this.getHeight();
                        ctx.rect(this.x, this.y, width, height);
                        container.hitTestPath(ctx, this);
                        ctx.restore();
                    }
                }
            };
            canvasTextElement.prototype.getBBox = function () {
                var x = (vp.utils.isDefined(this.layoutX)) ? this.layoutX : this.x;
                var y = (vp.utils.isDefined(this.layoutY)) ? this.layoutY : this.y;
                var w = this.getWidth();
                var h = this.getHeight();
                //---- return bounds as rect but using "x" and "y" instead of "left" and "top" ----
                var rc = {
                    x: x, y: y, width: w, height: h,
                    right: x + w, bottom: y + h
                };
                return rc;
            };
            canvasTextElement.prototype.getWidth = function () {
                var width = 0;
                var ctx = this.rootContainer.ctx;
                this.setContextForDrawing(ctx);
                width = ctx.measureText(this.textContent).width;
                return width;
            };
            canvasTextElement.prototype.getHeight = function () {
                var height = 0;
                //---- note: ctx.measureText() doesn't support height; parse it from ctx.font ----
                //---- since the font size is the height of characters rendered by that font ----
                var ctx = this.rootContainer.ctx;
                this.setContextForDrawing(ctx);
                var fontStr = ctx.font;
                height = parseFloat(fontStr); // starts with "10px" ...
                if (fontStr.contains("pt ")) {
                    height = height * 98 / 72;
                }
                return height;
            };
            return canvasTextElement;
        })(canvas.canvasElement);
        canvas.canvasTextElement = canvasTextElement;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggAvg.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: avg() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggAvg = (function () {
            function aggAvg() {
            }
            aggAvg.prototype.init = function () {
                this._total = 0;
                this._count = 0;
            };
            aggAvg.prototype.process = function (value) {
                this._total += +value;
                this._count++;
            };
            aggAvg.prototype.getResult = function () {
                var result = 0;
                if (this._count > 0) {
                    result = this._total / this._count;
                }
                return result;
            };
            return aggAvg;
        })();
        data.aggAvg = aggAvg;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggCount.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: count() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggCount = (function () {
            function aggCount() {
            }
            aggCount.prototype.init = function () {
                this._count = 0;
            };
            aggCount.prototype.process = function (value) {
                this._count++;
            };
            aggCount.prototype.getResult = function () {
                return this._count;
            };
            return aggCount;
        })();
        data.aggCount = aggCount;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggMax.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: max() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggMax = (function () {
            function aggMax() {
            }
            aggMax.prototype.init = function () {
                this._maxValue = undefined;
            };
            aggMax.prototype.process = function (value) {
                value = +value;
                if (this._maxValue === undefined || value > this._maxValue) {
                    this._maxValue = value;
                }
            };
            aggMax.prototype.getResult = function () {
                return this._maxValue;
            };
            return aggMax;
        })();
        data.aggMax = aggMax;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggMedian.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: median() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggMedian = (function () {
            function aggMedian() {
            }
            aggMedian.prototype.init = function () {
                this._values = [];
            };
            aggMedian.prototype.process = function (value) {
                this._values.push(+value);
            };
            aggMedian.prototype.getResult = function () {
                var sorted = this._values.orderByNum();
                var count = sorted.length;
                var result = 0;
                if (count > 0) {
                    if (count % 2 == 0) {
                        //---- even - take avg of 2 middle values ----
                        var index = count / 2;
                        result = (sorted[index - 1] + sorted[index]) / 2;
                    }
                    else {
                        //---- odd - take middle value ----
                        var index = Math.floor(count / 2);
                        result = sorted[index];
                    }
                }
                return result;
            };
            return aggMedian;
        })();
        data.aggMedian = aggMedian;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggMin.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: min() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggMin = (function () {
            function aggMin() {
            }
            aggMin.prototype.init = function () {
                this._minValue = undefined;
            };
            aggMin.prototype.process = function (value) {
                value = +value;
                if (this._minValue === undefined || value < this._minValue) {
                    this._minValue = value;
                }
            };
            aggMin.prototype.getResult = function () {
                return this._minValue;
            };
            return aggMin;
        })();
        data.aggMin = aggMin;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggMode.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: mode() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggMode = (function () {
            function aggMode() {
            }
            aggMode.prototype.init = function () {
                this._counts = {};
            };
            aggMode.prototype.process = function (value) {
                value = +value;
                var entry = this._counts[value];
                if (entry === undefined) {
                    this._counts[value] = 1;
                }
                else {
                    this._counts[value] = 1 + entry;
                }
            };
            aggMode.prototype.getResult = function () {
                var max = undefined;
                var mode = undefined;
                var keys = vp.utils.keys(this._counts);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var count = this._counts[key];
                    if (max === undefined || count > max) {
                        max = count;
                        mode = key;
                    }
                }
                //---- mode is undefined if no number is repeated ----
                return (max > 1) ? mode : undefined;
            };
            return aggMode;
        })();
        data.aggMode = aggMode;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggStdDev.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: stdDev() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggStdDev = (function () {
            function aggStdDev() {
            }
            aggStdDev.prototype.init = function () {
                this._total = 0;
                this._count = 0;
                this._numbers = [];
            };
            aggStdDev.prototype.process = function (value) {
                value = +value;
                this._total += value;
                this._count++;
                this._numbers.push(value);
            };
            aggStdDev.prototype.getResult = function () {
                var result = 0;
                var count = this._count;
                if (count > 0) {
                    var mean = this._total / count;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        var diff = this._numbers[i] - mean;
                        sum += diff * diff;
                    }
                    //---- variance of SAMPLE (vs. population) ----
                    var variance = sum / (count - 1);
                    result = Math.sqrt(variance);
                }
                return result;
            };
            return aggStdDev;
        })();
        data.aggStdDev = aggStdDev;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggSum.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: sum() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggSum = (function () {
            function aggSum() {
            }
            aggSum.prototype.init = function () {
                this._sum = 0;
            };
            aggSum.prototype.process = function (value) {
                this._sum += +value;
            };
            aggSum.prototype.getResult = function () {
                return this._sum;
            };
            return aggSum;
        })();
        data.aggSum = aggSum;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// aggVariance.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: variance() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggVariance = (function () {
            function aggVariance() {
            }
            aggVariance.prototype.init = function () {
                this._total = 0;
                this._count = 0;
                this._numbers = [];
            };
            aggVariance.prototype.process = function (value) {
                value = +value;
                this._total += value;
                this._count++;
                this._numbers.push(value);
            };
            aggVariance.prototype.getResult = function () {
                var result = 0;
                var count = this._count;
                if (count > 0) {
                    var mean = this._total / count;
                    var sum = 0;
                    for (var i = 0; i < count; i++) {
                        var diff = this._numbers[i] - mean;
                        sum += diff * diff;
                    }
                    //---- variance of SAMPLE (vs. population) ----
                    result = sum / (count - 1);
                }
                return result;
            };
            return aggVariance;
        })();
        data.aggVariance = aggVariance;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dataUtils.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library - data binding and related functions.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data_1) {
        function getTypeName(obj) {
            var typeName = typeof obj;
            if ((typeName != "number") && (typeName != "boolean") && (typeName != "string")) {
                var objStr = Object.prototype.toString.call(obj);
                if (objStr.endsWith(" Date]")) {
                    typeName = "date";
                }
                else if (objStr.endsWith("Array]")) {
                    typeName = "array";
                }
            }
            return typeName;
        }
        data_1.getTypeName = getTypeName;
        /** scans all of the entries in data and returns one of: "number", "date", "string". */
        function getDataType(data) {
            var count = data.length;
            var numberCount = 0;
            var dateCount = 0;
            var stringCount = 0;
            var noValueCount = 0;
            var hardTypeName = null;
            for (var i = 0; i < data.length; i++) {
                var value = data[i];
                if (value === null || value === undefined || value === "") {
                    noValueCount++;
                }
                else {
                    var typeName = typeof value;
                    if (typeName == "number") {
                        hardTypeName = "number";
                        break;
                    }
                    else if (typeName == "object") {
                        var strName = Object.prototype.toString.call(value);
                        if (strName.endsWith(" Date]")) {
                            hardTypeName = "date";
                            break;
                        }
                    }
                    else if (typeName == "string") {
                        if (!isNaN(+value)) {
                            numberCount++;
                        }
                        else if (!isNaN(Date.parse(value))) {
                            dateCount++;
                        }
                        else {
                            stringCount++;
                        }
                    }
                }
            }
            if (hardTypeName) {
                var typeName = hardTypeName;
            }
            else {
                var typeName = "string";
                if (stringCount == 0) {
                    if (dateCount > 0 && numberCount == 0) {
                        typeName = "date";
                    }
                    else if (numberCount > 0) {
                        typeName = "number";
                    }
                }
            }
            return typeName;
        }
        data_1.getDataType = getDataType;
        function calcNumDecimals(max, min, tickCount) {
            var numDecimals = 0;
            var range = max - min;
            if (range > 0) {
                var singleTickInterval = range / tickCount;
                var log10Val = Math.log(singleTickInterval) * Math.LOG10E;
                if (log10Val < 0) {
                    numDecimals = Math.ceil(-log10Val);
                }
            }
            return numDecimals;
        }
        data_1.calcNumDecimals = calcNumDecimals;
        function clamp(value, min, max) {
            if (value < min) {
                value = min;
            }
            else if (value > max) {
                value = max;
            }
            return value;
        }
        data_1.clamp = clamp;
        function mapValue(value, fromMin, fromMax, toMin, toMax) {
            var range = fromMax - fromMin;
            var percent = (range) ? (value - fromMin) / range : 1;
            var newValue = toMin + percent * (toMax - toMin);
            return newValue;
        }
        data_1.mapValue = mapValue;
        ///
        /// timing: range(1000*1000) takes 842ms on roland's home machine (3/23/2012).
        ///
        function range(from, to, incr) {
            //var startTime = new Date().getTime();
            var values = [];
            if (vp.utils.isUndefined(incr)) {
                incr = 1;
            }
            if (vp.utils.isUndefined(to)) {
                to = from;
                from = 1;
            }
            //---- guard against infinite loops ----
            if (incr == 0) {
            }
            else if ((from < to) && (incr < 0)) {
            }
            else if ((from > to) && (incr > 0)) {
            }
            else if ((from >= to) && (incr < 0)) {
                //---- emit normal range ----
                for (var value = from; vp.utils.floatGeq(value, to); value += incr) {
                    values.push(value);
                }
            }
            else if ((from <= to) && (incr > 0)) {
                //---- emit normal range ----
                for (var value = from; vp.utils.floatLeq(value, to); value += incr) {
                    values.push(value);
                }
            }
            //---- ensure last value="to" (floating point error) ----
            if (values.length > 0) {
                var epsilon = .00001;
                var last = values.length - 1;
                var diff = Math.abs(values[last] - to);
                if (diff != 0 && diff < epsilon) {
                    values[last] = to;
                }
            }
            //var elapsedMs = new Date().getTime() - startTime;
            return values;
        }
        data_1.range = range;
        //---- creates a hash object to hold a data item and its data index ----
        function dataPairHolder(dataItem, dataIndex) {
            var pair = { dataItem: dataItem, dataIndex: dataIndex };
            return pair;
        }
        data_1.dataPairHolder = dataPairHolder;
        function dataRepeat(value, count) {
            var values = [];
            for (var i = 0; i < count; i++) {
                values[i] = value;
            }
            return values;
        }
        data_1.dataRepeat = dataRepeat;
        function lerp(percent, a, b) {
            return a + percent * (b - a);
        }
        data_1.lerp = lerp;
        function makeLastData(data) {
            var lastRecord = (data.length) ? data[0] : null;
            var lastData = [];
            var lastIndex = 0;
            for (var i = 0; i < data.length; i++) {
                var origRecord = data[i];
                var record = { current: origRecord, index: i, last: lastRecord, lastIndex: lastIndex };
                lastData.push(record);
                lastRecord = origRecord;
                lastIndex = i;
            }
            return lastData;
        }
        data_1.makeLastData = makeLastData;
        function generateItems(root, tagName, data) {
            var elemArray = [];
            var start = Date.now();
            if (root.multiAppend) {
                elemArray = root.multiAppend(tagName, data.length);
                for (var i = 0; i < elemArray.length; i++) {
                    var elem = elemArray[i];
                    var dataItem = data[i];
                    vp.dom.dataItem(elem, dataItem);
                    vp.dom.dataIndex(elem, i);
                }
            }
            else {
                for (var i = 0; i < data.length; i++) {
                    //---- this does the right thing for canvas, SVG, and HTML elements ----
                    var elem = root.append(tagName);
                    var dataItem = data[i];
                    elem.dataItem(dataItem);
                    elem.dataIndex(i);
                    elemArray.push(elem[0]);
                }
            }
            var elapsed = Date.now() - start;
            //alert("append of " + data.length + " elements took: " + elapsed + "ms");
            var ss = vp.dom.wrapElements(elemArray);
            return ss;
        }
        data_1.generateItems = generateItems;
        /// public: dataJoin(data, "name", data2, "name2", ...)
        /// this joins the data in each array into a new array, with each field given the associated name.
        function dataJoin(data, name1) {
            var records = [];
            for (var i = 0; i < data.length; i++) {
                //---- loop thru all the fields and create a record ----
                var record = {};
                for (var a = 0; a < arguments.length; a += 2) {
                    var dataX = arguments[a];
                    var nameX = arguments[a + 1];
                    var valueX = dataX[i];
                    record[nameX] = valueX;
                }
                records.push(record);
            }
            return records;
        }
        data_1.dataJoin = dataJoin;
        /// public: $.dataFrame(desc)
        /// this builds an array of records whose name/vector pairs are given as key/values of the desc object.
        function dataFrame(desc) {
            var records = [];
            var firstVector = null;
            for (var k in desc) {
                firstVector = desc[k];
                break;
            }
            if (firstVector) {
                for (var i = 0; i < firstVector.length; i++) {
                    //---- loop thru all the fields and create a record ----
                    var record = {};
                    for (var name in desc) {
                        record[name] = desc[name][i];
                    }
                    records.push(record);
                }
            }
            return records;
        }
        data_1.dataFrame = dataFrame;
        /// public: dataSelect(data, fieldName)
        /// "data" is an array of records.
        /// "fieldName" is the name of one of the record's fields.
        /// returns an array of "fieldName" values (one entry from each record in data).
        function dataSelect(data, field) {
            var values = []; // empty array, by default
            if (!field) {
                //---- if no field specified, just return the data as is ----
                values = data;
            }
            else if (data.length > 0) {
                var firstRecord = data[0];
                if (firstRecord[field] !== undefined) {
                    values = data.map(function (data, index) { return data[field]; });
                }
            }
            return values;
        }
        data_1.dataSelect = dataSelect;
        function doesNestedRecordContainColumn(record, colName) {
            while (vp.utils.isArray(record)) {
                record = record[0];
            }
            var hasCol = record[colName] !== undefined;
            return hasCol;
        }
        data_1.doesNestedRecordContainColumn = doesNestedRecordContainColumn;
        /** extracts the vector of values from the array of records, which includes a field named colName.  If each
        record is in turn an array, returns the count of the array, if countIfArray=true. */
        function getVector(data, colName, countIfArray) {
            var values = null;
            if (data.length) {
                var firstRecord = data[0];
                if (vp.utils.isArray(firstRecord)) {
                    //---- special case - count array entries in each record ----
                    if (doesNestedRecordContainColumn(firstRecord, colName)) {
                        values = data.map(function (d, index) { return d.length; });
                    }
                }
                else if (firstRecord[colName] !== undefined) {
                    //---- normal case ----
                    values = data.map(function (d, index) { return d[colName]; });
                }
            }
            return values;
        }
        data_1.getVector = getVector;
        /**  builds a matrix of records in X and Y, dim size x size, with a "value" field that has some peaks and valleys. */
        function peaks(size, flatten) {
            var baseNum = 3;
            var incr = (2 * baseNum) / size;
            var rows = [];
            for (var y = -baseNum; y <= baseNum; y += incr) {
                var row = (flatten) ? rows : [];
                for (var x = -baseNum; x <= baseNum; x += incr) {
                    //z =  3*(1-x)^2*exp(-(x^2) - (y+1)^2) ... 
                    //   - 10*(x/5 - x^3 - y^5)*exp(-x^2-y^2) ... 
                    //   - 1/3*exp(-(x+1)^2 - y^2) 
                    var z1 = 3 * (1 - x) * (1 - x) * Math.exp(-(x * x) - (y + 1) * (y + 1));
                    var z2 = -10 * (x / 5 - x * x * x - Math.pow(y, 5)) * Math.exp(-(x * x) - (y * y));
                    var z3 = -1 / 3 * Math.exp(-(x + 1) * (x + 1) - (y * y));
                    var z = z1 + z2 + z3;
                    //var value = 5*Math.sin(x) + 4*Math.cos(y);
                    var record = { x: x, y: y, z: z };
                    row.push(record);
                }
                if (row != rows) {
                    rows.push(row);
                }
            }
            return rows;
        }
        data_1.peaks = peaks;
        function isAllIntegers(data) {
            var allInts = true;
            for (var i = 0; i < data.length; i++) {
                var value = data[i];
                if (!vp.utils.isInteger(value)) {
                    allInts = false;
                    break;
                }
            }
            return allInts;
        }
        data_1.isAllIntegers = isAllIntegers;
        function createAggregator(name) {
            var agg = undefined;
            if (name == "count") {
                agg = new data_1.aggCount();
            }
            else if (name == "sum") {
                agg = new data_1.aggSum();
            }
            else if (name == "min") {
                agg = new data_1.aggMin();
            }
            else if (name == "max") {
                agg = new data_1.aggMax();
            }
            else if (name == "avg" || name == "mean" || name == "average") {
                agg = new data_1.aggAvg();
            }
            else if (name == "median") {
                agg = new data_1.aggMedian();
            }
            else if (name == "mode") {
                agg = new data_1.aggMode();
            }
            else if (name == "stdDev" || name == "std") {
                agg = new data_1.aggStdDev();
            }
            else if (name == "variance" || name == "var") {
                agg = new data_1.aggVariance();
            }
            else if (name == "none") {
                agg = new data_1.aggNone();
            }
            return agg;
        }
        data_1.createAggregator = createAggregator;
        /** Groups the data by the specified group column and then takes the specified aggregate of the specified value column within each group.  Returns array of records
        with 2 columns: aggregate value, group key.  if groupRecord is omitted, data is assumed to be pre-grouped. */
        function aggByGroup(data, aggInfo, groupRecord) {
            var newRecords = [];
            var groupColumn = (groupRecord) ? groupRecord.column : null;
            var newGroupName = (groupRecord) ? groupRecord.name : "";
            var aggregator = createAggregator(aggInfo.aggName);
            //---- if groupColumn not specified, data is pre-grouped ----
            var groupedData = (groupColumn) ? data.groupBy(groupColumn) : data;
            //---- process each group ----
            for (var g = 0; g < groupedData.length; g++) {
                var group = groupedData[g];
                var values = group.values;
                aggregator.init();
                //---- process each value in group ----
                for (var v = 0; v < values.length; v++) {
                    var record = values[v];
                    var value = (aggInfo.column == "*") ? 1 : record[aggInfo.column];
                    value = parseFloat(value);
                    if (isFinite(value)) {
                        //total += value;
                        aggregator.process(value);
                    }
                }
                //---- get result for group ----
                var aggResult = aggregator.getResult();
                var newRecord = {};
                newRecord[newGroupName] = group.key;
                newRecord[aggInfo.name] = aggResult;
                newRecords.push(newRecord);
            }
            return newRecords;
        }
        data_1.aggByGroup = aggByGroup;
        /** Groups the data by the specified group column and then calculates the specified aggregates within each group.  Returns array of records
        with 2 columns for each specified aggregate: aggregate value, group key */
        function multiAggByGroup(data, aggArray, groupRecord) {
            var newRecords = [];
            var groupColumn = groupRecord.column;
            var newGroupName = groupRecord.name;
            var aggregators = [];
            for (var i = 0; i < aggArray.length; i++) {
                var aggInfo = aggArray[i];
                var aggregator = createAggregator(aggInfo.aggName);
                aggregator.init();
                aggregators.push(aggregator);
            }
            var groupedData = data.groupBy(groupRecord.column);
            //---- process each group ----
            for (var g = 0; g < groupedData.length; g++) {
                var group = groupedData[g];
                var values = group.values;
                for (var i = 0; i < aggArray.length; i++) {
                    aggregator = aggregators[i];
                    aggregator.init();
                }
                //---- process each value in group ----
                for (var v = 0; v < values.length; v++) {
                    var record = values[v];
                    var value = (aggInfo.column == "*") ? 1 : record[aggInfo.column];
                    value = parseFloat(value);
                    if (isFinite(value)) {
                        for (var i = 0; i < aggArray.length; i++) {
                            aggregator = aggregators[i];
                            aggregator.process(value);
                        }
                    }
                }
                //---- get result for group ----
                var newRecord = {};
                newRecord[newGroupName] = group.key;
                for (var i = 0; i < aggArray.length; i++) {
                    aggregator = aggregators[i];
                    var aggInfo = aggArray[i];
                    var aggResult = aggregator.getResult();
                    newRecord[aggInfo.name] = aggResult;
                }
                newRecords.push(newRecord);
            }
            return newRecords;
        }
        data_1.multiAggByGroup = multiAggByGroup;
        /** returns the date part of the DateTime value. */
        function datePart(date) {
            var newDate = new Date(date.valueOf());
            newDate.setHours(0, 0, 0, 0);
            return newDate;
        }
        data_1.datePart = datePart;
        var nameColumnPair = (function () {
            function nameColumnPair(name, column) {
                this.name = name;
                this.column = column;
            }
            return nameColumnPair;
        })();
        data_1.nameColumnPair = nameColumnPair;
        var nameColumnAgg = (function () {
            function nameColumnAgg(name, column, aggName) {
                this.name = name;
                this.column = column;
                this.aggName = aggName;
            }
            return nameColumnAgg;
        })();
        data_1.nameColumnAgg = nameColumnAgg;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
var vp;
(function (vp) {
    var unitTests;
    (function (unitTests) {
        function testDataUtils() {
            vp.utils.debug("running: testDataUtils");
            var data = [
                { sales: 1, year: 1990 },
                { sales: 5, year: 1990 },
                { sales: 3, year: 1990 },
                { sales: 8, year: 1990 },
                { sales: 2, year: 2001 },
                { sales: 7, year: 2001 },
                { sales: 10, year: 2009 },
            ];
            //---- avg by direct column group ----
            var newData = vp.data.aggByGroup(data, { name: "avgSales", column: "sales", aggName: "avg" }, { name: "year", column: "year" });
            var averages = vp.data.dataSelect(newData, "avgSales");
            vp.utils.debug("  [4.25, 4.5, 10] averageByGroup: " + averages);
            //---- avg by callback group ----
            var newData = vp.data.aggByGroup(data, { name: "avgSales", column: "sales", aggName: "avg" }, { name: "century", column: function (r) { return Math.floor(r.year / 100); } });
            var averages = vp.data.dataSelect(newData, "avgSales");
            vp.utils.debug("  [4.25, 6.33] averageByGroup: " + averages);
            //---- test datePart() ----
            var date = vp.data.datePart(new Date());
            vp.utils.debug("  [today at midnight] datePart: " + date);
        }
        unitTests.testDataUtils = testDataUtils;
    })(unitTests = vp.unitTests || (vp.unitTests = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// selectedSet.ts.  Copyright (c) 2014 Microsoft Corporation.
///              part of the vuePlot library - selected set functions.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        var selectedSet = (function () {
            //select = Array.prototype.select;
            function selectedSet(elements) {
                //---- make "selectedSet" look/act like an array object ---
                this.length = 0;
                this.push = Array.prototype.push;
                this.sort = Array.prototype.sort;
                this.splice = Array.prototype.splice;
                this.indexOf = Array.prototype.indexOf;
                if (elements) {
                    var sameCtr = true; // initially
                    var lastCtr = "";
                    for (var i = 0; i < elements.length; i++) {
                        var elem = elements[i];
                        this.push(elem);
                        if (i == 0) {
                            lastCtr = elem.ctr;
                        }
                        else {
                            if (elem.ctr != lastCtr) {
                                sameCtr = false;
                            }
                        }
                    }
                    //---- extend this wrapper if elem with custom control properties ----
                    if ((elements.length > 0) && (sameCtr)) {
                        var elem = elements[0];
                        if ((elem.control) && (elem.control.extendWrapper)) {
                            elem.control.extendWrapper(this);
                        }
                    }
                }
            }
            selectedSet.prototype.frameRateChanged = function (fpsCallBack) {
                var appendedElements = [];
                var firstContainer = null;
                this.each(function (index, container) {
                    vp.dom.frameRateChanged(this, fpsCallBack);
                });
                return this;
            };
            //---- ADD the content to the selected set of containers ----
            selectedSet.prototype.add = function (content) {
                var ss = null;
                var firstContainer = true;
                this.each(function (index, container) {
                    var newElems = vp.dom.add(container, content);
                    if (firstContainer) {
                        ss = vp.dom.wrapElements(newElems);
                        firstContainer = false;
                    }
                });
                return ss;
            };
            /// remove all children (childNodes) of each item in the selected set.
            selectedSet.prototype.clear = function () {
                return this.each(function (index, element) {
                    vp.dom.clear(element);
                });
            };
            selectedSet.prototype.show = function (showIt) {
                return this.each(function (index, element) {
                    vp.dom.show(this, showIt);
                });
            };
            selectedSet.prototype.showToggle = function () {
                return this.each(function (index, element) {
                    vp.dom.showToggle(this);
                });
            };
            selectedSet.prototype.hide = function (showIt) {
                return this.each(function (index, element) {
                    vp.dom.hide(this);
                });
            };
            selectedSet.prototype.collapse = function () {
                return this.each(function (index, element) {
                    vp.dom.collapse(this);
                });
            };
            selectedSet.prototype.expand = function () {
                return this.each(function (index, element) {
                    vp.dom.expand(this);
                });
            };
            /// gets the {left,top} offset of the HTML/SVG/Canvas element from the document origin.
            selectedSet.prototype.docOffset = function (elem) {
                var value = null;
                if (this.length > 0) {
                    value = vp.dom.docOffset(elem);
                }
                return value;
            };
            selectedSet.prototype.left = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.left(this[0]);
                    }
                    return value;
                }
                else {
                    //---- SET value ----
                    return this.each(function (index, element) {
                        vp.dom.left(this, value);
                    });
                }
            };
            selectedSet.prototype.top = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.top(this[0]);
                    }
                    return value;
                }
                else {
                    //---- SET value ----
                    return this.each(function (index, element) {
                        vp.dom.top(this, value);
                    });
                }
            };
            selectedSet.prototype.width = function (value) {
                if (arguments.length == 0) {
                    var value = null;
                    if (this.length > 0) {
                        value = vp.dom.width(this[0]);
                    }
                    return value;
                }
                else {
                    //---- SET value ----
                    var origValue = value;
                    return this.each(function (index, element) {
                        if (vp.utils.isFunction(origValue)) {
                            value = origValue(index, element);
                        }
                        vp.dom.width(this, value);
                    });
                }
            };
            selectedSet.prototype.css = function (name, value) {
                if (arguments.length == 1) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.css(this[0], name);
                    }
                    return value;
                }
                //---- SET value ----
                var origValue = value;
                return this.each(function (index, element) {
                    if (vp.utils.isFunction(origValue)) {
                        value = origValue(index, element);
                    }
                    vp.dom.css(this, name, value);
                });
            };
            selectedSet.prototype.height = function (value) {
                if (arguments.length == 0) {
                    var value = null;
                    if (this.length > 0) {
                        value = vp.dom.height(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                var origValue = value;
                return this.each(function (index, element) {
                    if (vp.utils.isFunction(origValue)) {
                        value = origValue(index, element);
                    }
                    vp.dom.height(this, value);
                });
            };
            /// get total height of first element
            selectedSet.prototype.totalHeight = function () {
                var value = null;
                if (this.length > 0) {
                    value = vp.dom.totalHeight(this[0]);
                }
                return value;
            };
            /// get total width of first element
            selectedSet.prototype.totalWidth = function () {
                var value = null;
                if (this.length > 0) {
                    value = vp.dom.totalWidth(this[0]);
                }
                return value;
            };
            selectedSet.prototype.toolTipEnabled = function (value) {
                if (arguments.length == 0) {
                    value = (this.length > 0) ? this[0].toolTipEnabled : false;
                    return value;
                }
                return this.each(function (index, element) {
                    vp.dom.toolTipEnabled(element, value);
                });
            };
            selectedSet.prototype.animate = function (duration, ease, container) {
                return this.each(function (index, element) {
                    vp.dom.animate(this, duration, ease, container);
                });
            };
            selectedSet.prototype.onAnimationComplete = function (completedFunc) {
                return this.each(function (index, element) {
                    vp.dom.onAnimationComplete(this, completedFunc);
                });
            };
            selectedSet.prototype.remove = function () {
                return this.each(function (index, element) {
                    if (this.animation == null) {
                        vp.dom.remove(this);
                    }
                    else {
                        this.animation.deleteElementsOnCompleted(this);
                    }
                });
            };
            selectedSet.prototype.attr = function (name, value) {
                if (arguments.length == 1) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.attr(this[0], name);
                    }
                    return value;
                }
                //---- SET value ----
                var origValue = value;
                return this.each(function (index, element) {
                    vp.dom.attr(this, name, value);
                });
            };
            selectedSet.prototype.prop = function (name, value) {
                if (arguments.length == 1) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.prop(this[0], name);
                    }
                    return value;
                }
                //---- SET value ----
                var origValue = value;
                return this.each(function (index, element) {
                    vp.dom.prop(this, name, value);
                });
            };
            selectedSet.prototype.attrXlink = function (name, origValue) {
                return this.attrNS("http://www.w3.org/1999/xlink", name, origValue);
            };
            selectedSet.prototype.attrNS = function (ns, name, value) {
                return this.each(function (index, element) {
                    vp.dom.attrNS(element, ns, name, value);
                });
            };
            selectedSet.prototype.hLine = function (x1, x2, y, makeCrisp) {
                return this.each(function (index, element) {
                    vp.dom.hLine(element, x1, x2, y, makeCrisp);
                });
            };
            selectedSet.prototype.vLine = function (y1, y2, x, makeCrisp) {
                return this.each(function (index, element) {
                    vp.dom.vLine(element, y1, y2, x, makeCrisp);
                });
            };
            selectedSet.prototype.bounds = function (x, y, width, height, makeCrisp) {
                return this.each(function (index, element) {
                    vp.dom.bounds(element, x, y, width, height, makeCrisp);
                });
            };
            selectedSet.prototype.radius = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    value = (this.length > 0) ? vp.dom.radius(this[0]) : 0;
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.radius(this, value);
                });
            };
            selectedSet.prototype.tabIndex = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    value = (this.length > 0) ? vp.dom.tabIndex(this[0]) : 0;
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.tabIndex(this, value);
                });
            };
            selectedSet.prototype.opacity = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.opacity(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.opacity(this, value);
                });
            };
            selectedSet.prototype.checked = function (value) {
                //---- GET value ----
                if (arguments.length == 0) {
                    value = null;
                    if (this.length > 0) {
                        value = vp.dom.checked(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    //---- animation not supported for "checked" ----
                    vp.dom.checked(this, value);
                });
            };
            selectedSet.prototype.position = function (x, y) {
                return this.each(function (index, element) {
                    vp.dom.position(element, x, y);
                });
            };
            selectedSet.prototype.absPosition = function (left, top) {
                return this.each(function (index, element) {
                    vp.dom.absPosition(element, left, top);
                });
            };
            selectedSet.prototype.removeProp = function (name) {
                return this.each(function (index, element) {
                    //---- animation not supported for this operation ----
                    vp.dom.removeProp(this, name);
                });
            };
            selectedSet.prototype.center = function (cx, cy) {
                return this.each(function (index, element) {
                    vp.dom.center(element, cx, cy);
                });
            };
            selectedSet.prototype.id = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.id(this[0]);
                    }
                    return value;
                }
                else {
                    //---- SET value ----
                    return this.each(function (index, element) {
                        vp.dom.id(this, value);
                    });
                }
            };
            selectedSet.prototype.addClass = function (name) {
                return this.each(function (index, element) {
                    vp.dom.addClass(this, name);
                });
            };
            selectedSet.prototype.removeClass = function (name) {
                return this.each(function (index, element) {
                    vp.dom.removeClass(this, name);
                });
            };
            selectedSet.prototype.hasClass = function (name) {
                var hasIt = false;
                if (this.length > 0) {
                    hasIt = vp.dom.hasClass(this[0], name);
                }
                return hasIt;
            };
            selectedSet.prototype.getBounds = function (relToParent) {
                var result = null;
                if (this.length > 0) {
                    result = vp.dom.getBounds(this[0], relToParent);
                }
                return result;
            };
            selectedSet.prototype.setClass = function (name) {
                return this.each(function (index, element) {
                    vp.dom.setClass(this, name);
                });
            };
            selectedSet.prototype.toggleClass = function (name) {
                return this.each(function (index, element) {
                    vp.dom.toggleClass(this, name);
                });
            };
            selectedSet.prototype.attach = function (eventName, funcToCall, useCapture) {
                return this.each(function (index, element) {
                    vp.events.attach(this, eventName, funcToCall, useCapture);
                });
            };
            selectedSet.prototype.detach = function (eventName, funcToCall, useCapture) {
                return this.each(function (index, element) {
                    vp.events.detach(this, eventName, funcToCall, useCapture);
                });
            };
            selectedSet.prototype.transform = function (value) {
                return this.each(function (index, element) {
                    vp.dom.transform(this, value);
                });
            };
            selectedSet.prototype.translate = function (x, y, makeCrispGroup, makeCrispRoot) {
                return this.each(function (index, element) {
                    vp.dom.translate(this, x, y, makeCrispGroup, makeCrispRoot);
                });
            };
            selectedSet.prototype.transformOrigin = function (value) {
                if (arguments.length == 0) {
                    value = (this.length > 0) ? vp.dom.transformOrigin(this[0]) : undefined;
                    return value;
                }
                return this.each(function (index, element) {
                    vp.dom.transformOrigin(value);
                });
            };
            selectedSet.prototype.addStop = function (offset, color, opacity) {
                return this.each(function (index, element) {
                    vp.dom.addStop(this, offset, color, opacity);
                });
            };
            selectedSet.prototype.textBaseline = function (alignType, rc) {
                return this.each(function (index, element) {
                    vp.dom.textBaseline(element, alignType, rc);
                });
            };
            selectedSet.prototype.from = function (x1, y1) {
                return this.each(function (index, element) {
                    vp.dom.from(element, x1, y1);
                });
            };
            selectedSet.prototype.to = function (x2, y2) {
                return this.each(function (index, element) {
                    vp.dom.to(element, x2, y2);
                });
            };
            selectedSet.prototype.font = function (family, size, weight, style) {
                return this.each(function (index, element) {
                    vp.dom.font(element, family, size, weight, style);
                });
            };
            selectedSet.prototype.dataPair = function (dataItem, dataIndex) {
                return this.each(function (index, element) {
                    vp.dom.dataPair(this, dataItem, dataIndex);
                });
            };
            selectedSet.prototype.data = function (value) {
                if (arguments.length == 0) {
                    var anyElem = this[0];
                    return (anyElem.data) ? anyElem.data() : null;
                }
                return this.each(function (index, element) {
                    var anyElem = element;
                    if (anyElem.data) {
                        anyElem.data(value);
                    }
                });
            };
            selectedSet.prototype.dataItem = function (dataItem) {
                if (dataItem != null) {
                    return this.each(function (index, element) {
                        this.dataItem = dataItem;
                    });
                }
                else {
                    return this[0].dataItem;
                }
            };
            selectedSet.prototype.dataIndex = function (value) {
                if (value != null) {
                    return this.each(function (index, element) {
                        this.dataIndex = value;
                    });
                }
                else {
                    return (this.length == 0) ? null : this[0].dataIndex;
                }
            };
            selectedSet.prototype.customAttr = function (name, value) {
                if (arguments.length == 1) {
                    value = (this.length > 0) ? vp.dom.customAttr(this[0], name) : undefined;
                    return value;
                }
                return this.each(function (index, element) {
                    vp.dom.customAttr(element, name, value);
                });
            };
            selectedSet.prototype.text = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    value = null;
                    if (this.length > 0) {
                        value = vp.dom.text(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.text(this, value);
                });
            };
            selectedSet.prototype.title = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    value = null;
                    if (this.length > 0) {
                        value = vp.dom.title(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.title(this, value);
                });
            };
            selectedSet.prototype.value = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    if (this.length > 0) {
                        value = vp.dom.value(this[0]);
                    }
                    return value;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.value(this, value);
                });
            };
            selectedSet.prototype.html = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    return (this.length == 0) ? null : this[0].innerHTML;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.html(this, value);
                });
            };
            selectedSet.prototype.colors = function (fill, stroke, strokeWidth) {
                return this.each(function (index, element) {
                    vp.dom.colors(this, fill, stroke, strokeWidth);
                });
            };
            selectedSet.prototype.href = function (value) {
                return this.attrNS("http://www.w3.org/1999/xlink", "href", value);
            };
            selectedSet.prototype.safeHref = function (value, fallback) {
                if ((!value) || (value.length == 0)) {
                    value = fallback;
                }
                return this.each(function (index, element) {
                    vp.dom.href(this, value);
                });
            };
            selectedSet.prototype.kids = function () {
                var kids = [];
                if (this.length > 0) {
                    kids = vp.dom.children(this[0]);
                }
                var wrappedKids = vp.dom.wrapElements(kids);
                return wrappedKids;
            };
            selectedSet.prototype.elementSizes = function (callBack) {
                var value = undefined;
                if (this.length > 0) {
                    value = vp.dom.elementSizes(this[0]);
                }
                return value;
            };
            selectedSet.prototype.background = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    return (this.length == 0) ? null : this[0].background;
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.background(this, value);
                });
            };
            selectedSet.prototype.focus = function () {
                if (this.length > 0) {
                    vp.dom.focus(this[0]);
                }
                return this;
            };
            selectedSet.prototype.dataId = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    return (this.length == 0) ? null : vp.dom.dataItem(this[0]);
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.dataItem(this, value);
                });
            };
            selectedSet.prototype.shapeId = function (value) {
                if (arguments.length == 0) {
                    //---- GET value ----
                    return (this.length == 0) ? null : vp.dom.shapeId(this[0]);
                }
                //---- SET value ----
                return this.each(function (index, element) {
                    vp.dom.shapeId(this, value);
                });
            };
            /// get element at specified index.  fails silently if index is not a number or out of range.
            selectedSet.prototype.get = function (index) {
                var element = null;
                if (vp.utils.isNumber(index)) {
                    if ((index >= 0) && (index < this.length)) {
                        element = this[index];
                    }
                }
                return element;
            };
            selectedSet.prototype.element = function () {
                return this.get(0);
            };
            /// wrap the element at specified index.  fails silently if index is not a number or out of range.
            selectedSet.prototype.wrap = function (index) {
                var element = this.get(index);
                var ss = null;
                if (element) {
                    ss = vp.dom.wrapElements(element);
                }
                return ss;
            };
            selectedSet.prototype.toArray = function () {
                return Array.prototype.slice.call(this, 0);
            };
            //---- eachsignature: callback(index, element) ----
            selectedSet.prototype.each = function (callback) {
                for (var i = 0; i < this.length; i++) {
                    var elem = this[i];
                    //---- callback with this=elem and 2 params ----
                    callback.call(elem, i, elem);
                }
                return this;
            };
            //---- eachWrappedsignature: callback(index, element) ----
            selectedSet.prototype.eachWrapped = function (callback) {
                var sw = vp.dom.createSingleWrapper(null);
                for (var i = 0; i < this.length; i++) {
                    var elem = this[i];
                    sw.elem = elem;
                    //---- callback with this=wrapper(elem) and 2 params ----
                    callback.call(sw, i, sw);
                }
                return this;
            };
            /// adds the specified element/array to the selected set.
            selectedSet.prototype.merge = function (elemOrArray) {
                var newElements = null;
                if (elemOrArray instanceof vp.dom.selectedSet) {
                    elemOrArray = elemOrArray.toArray();
                }
                else if (elemOrArray instanceof vp.canvas.canvasSelectedSet) {
                    elemOrArray = elemOrArray.toArray();
                }
                else if (elemOrArray instanceof vp.dom.singleWrapperSuperClass) {
                    elemOrArray = elemOrArray.elem;
                }
                if (vp.utils.isArray(elemOrArray)) {
                    newElements = this.toArray().concat(elemOrArray);
                }
                else {
                    newElements = this.toArray();
                    newElements.push(elemOrArray);
                }
                var newSet = new vp.dom.selectedSet(newElements);
                return newSet;
            };
            //---- remove the selected set from their parent ----
            selectedSet.prototype.removeCore = function (content) {
                this.each(function (index, element) {
                    vp.dom.remove(element);
                });
            };
            selectedSet.prototype.append = function (content) {
                return vp.dom.appendCoreMulti(this, content, "append");
            };
            selectedSet.prototype.prepend = function (content) {
                return vp.dom.appendCoreMulti(this, content, "prepend");
            };
            selectedSet.prototype.insertBefore = function (content) {
                return vp.dom.appendCoreMulti(this, content, "insertBefore");
            };
            selectedSet.prototype.insertAfter = function (content) {
                return vp.dom.appendCoreMulti(this, content, "insertAfter");
            };
            selectedSet.prototype.is = function (elementType) {
                var match = false;
                for (var i = 0; i < this.length; i++) {
                    var elem = this[i];
                    match = vp.dom.is(elem, elementType);
                    if (match) {
                        break;
                    }
                }
                return match;
            };
            //---- extend vuePlot selected set to add "context()" ----
            //---- use to obtain a Canvas (2d) or WebGL (3d) context ----
            selectedSet.prototype.context = function (origRequest) {
                var cc = null;
                var value = null;
                for (var i = 0; i < this.length; i++) {
                    var elem = this[i];
                    var contextRequest = origRequest;
                    if (elem.getContext) {
                        if (contextRequest == "3d") {
                            //---- works for IE11, Chrome, Safari, FireFox ----
                            contextRequest = "experimental-webgl";
                            //---- setting alpha=false prevents alpha values that we output from compositing with other DOM elements ----
                            value = elem.getContext(contextRequest, { alpha: false });
                        }
                        else {
                            value = elem.getContext(contextRequest);
                        }
                    }
                    if (value == null) {
                        if (origRequest == "2d") {
                        }
                        else {
                        }
                    }
                    if (value != null) {
                        if (elem.canvasContainerElement != null) {
                            //---- reuse existing object (prevent duplicates w/diff info) ----
                            cc = elem.canvasContainerElement;
                            cc.ctx = value;
                            cc.contextRequest = origRequest;
                        }
                        else {
                            cc = new vp.canvas.canvasContainerElement(elem, value, origRequest);
                        }
                    }
                    break;
                }
                return cc;
            };
            return selectedSet;
        })();
        dom.selectedSet = selectedSet;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// singleWrapper.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlot library
///    - class that wraps a single element (HTML, SVG, Canvas, or WebGL item).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        /** class that wraps a single element (HTML, SVG, Canvas, or WebGL item). */
        var singleWrapperSuperClass = (function () {
            function singleWrapperSuperClass(elem) {
                this.prop = null;
                this.elem = elem;
                //---- these are one and the same ----
                this.prop = this.customAttr;
                //---- we want calling code to be able to treat this as an array (so it doesn't have to special case ss vs. this) ----
                var self = this;
                self.length = 0;
                //---- make "selectedSet" look/act like an array object ---
                self.push = Array.prototype.push;
                self.splice = Array.prototype.splice;
                self.indexOf = Array.prototype.indexOf;
                self.select = Array.prototype.select;
                self.push(elem);
                //---- remove this as soon as all 15 controls are converted to TypeScript ----
                //---- extend this wrapper if elem with custom control properties ----
                var anyElem = elem;
                if ((anyElem) && (anyElem.control) && (anyElem.control.extendWrapper)) {
                    anyElem.control.extendWrapper(this);
                }
            }
            singleWrapperSuperClass.prototype.element = function (value) {
                if (arguments.length == 0) {
                    return this.elem;
                }
                this[0] = value;
                this.elem = value;
            };
            singleWrapperSuperClass.prototype.css = function (name, value) {
                if (arguments.length == 1) {
                    return vp.dom.css(this.elem, name);
                }
                vp.dom.css(this.elem, name, value);
                return this;
            };
            singleWrapperSuperClass.prototype.hLine = function (x1, x2, y, makeCrisp) {
                vp.dom.hLine(this.elem, x1, x2, y, makeCrisp);
                return this;
            };
            singleWrapperSuperClass.prototype.vLine = function (y1, y2, x, makeCrisp) {
                vp.dom.vLine(this.elem, y1, y2, x, makeCrisp);
                return this;
            };
            singleWrapperSuperClass.prototype.bounds = function (x, y, width, height, makeCrisp) {
                vp.dom.bounds(this.elem, x, y, width, height, makeCrisp);
                return this;
            };
            singleWrapperSuperClass.prototype.colors = function (fill, stroke, strokeWidth) {
                vp.dom.colors(this.elem, fill, stroke, strokeWidth);
                return this;
            };
            singleWrapperSuperClass.prototype.text = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.text(this.elem);
                }
                vp.dom.text(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.tabIndex = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.tabIndex(this.elem);
                }
                vp.dom.tabIndex(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.title = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.title(this.elem);
                }
                vp.dom.title(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.value = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.value(this.elem);
                }
                vp.dom.value(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.html = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.html(this.elem);
                }
                vp.dom.html(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.show = function (showIt) {
                vp.dom.show(this.elem, showIt);
                return this;
            };
            singleWrapperSuperClass.prototype.showToggle = function () {
                vp.dom.showToggle(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.hide = function (showIt) {
                vp.dom.hide(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.collapse = function () {
                vp.dom.collapse(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.expand = function () {
                vp.dom.expand(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.dataIndex = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.dataIndex(this.elem);
                }
                vp.dom.dataIndex(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.data = function (value) {
                var anyElem = this.elem;
                if (arguments.length == 0) {
                    return (anyElem.data) ? anyElem.data() : null;
                }
                if (anyElem.data) {
                    anyElem.data(value);
                }
                return this;
            };
            singleWrapperSuperClass.prototype.dataItem = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.dataItem(this.elem);
                }
                vp.dom.dataItem(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.dataPair = function (dataItem, dataIndex) {
                vp.dom.dataPair(this.elem, dataItem, dataIndex);
                return this;
            };
            singleWrapperSuperClass.prototype.to = function (x, y) {
                vp.dom.to(this.elem, x, y);
                return this;
            };
            singleWrapperSuperClass.prototype.from = function (x, y) {
                vp.dom.from(this.elem, x, y);
                return this;
            };
            singleWrapperSuperClass.prototype.attach = function (name, callBack, useCapture) {
                vp.events.attach(this.elem, name, callBack, useCapture);
                return this;
            };
            singleWrapperSuperClass.prototype.detach = function (name, callBack, useCapture) {
                vp.events.detach(this.elem, name, callBack, useCapture);
                return this;
            };
            singleWrapperSuperClass.prototype.transform = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.transform(this.elem);
                }
                vp.dom.transform(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.translate = function (x, y, makeCrispGroup, makeCrispRoot) {
                vp.dom.translate(this.elem, x, y, makeCrispGroup, makeCrispRoot);
                return this;
            };
            singleWrapperSuperClass.prototype.transformOrigin = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.transformOrigin(this.elem);
                }
                vp.dom.transformOrigin(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.href = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.href(this.elem);
                }
                vp.dom.href(this.elem, value);
                return this;
                // return vp.dom.attrNS("http://www.w3.org/1999/xlink", "href", value);
            };
            singleWrapperSuperClass.prototype.safeHref = function (value, fallback) {
                if ((!value) || (value.length == 0)) {
                    value = fallback;
                }
                vp.dom.href(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.font = function (family, size, weight, style) {
                vp.dom.font(this.elem, family, size, weight, style);
                return this;
            };
            singleWrapperSuperClass.prototype.setClass = function (value) {
                vp.dom.setClass(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.hasClass = function (value) {
                var returnValue = vp.dom.hasClass(this.elem, value);
                return returnValue;
            };
            singleWrapperSuperClass.prototype.addClass = function (value) {
                vp.dom.addClass(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.removeClass = function (value) {
                vp.dom.removeClass(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.toggleClass = function (value) {
                vp.dom.toggleClass(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.id = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.id(this.elem);
                }
                vp.dom.id(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.getBounds = function (relToParent) {
                return vp.dom.getBounds(this.elem, relToParent);
            };
            singleWrapperSuperClass.prototype.center = function (cx, cy) {
                vp.dom.center(this.elem, cx, cy);
                return this;
            };
            singleWrapperSuperClass.prototype.position = function (x, y) {
                vp.dom.position(this.elem, x, y);
                return this;
            };
            singleWrapperSuperClass.prototype.absPosition = function (left, top) {
                vp.dom.absPosition(this.elem, left, top);
                return this;
            };
            singleWrapperSuperClass.prototype.opacity = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.opacity(this.elem);
                }
                vp.dom.opacity(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.radius = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.radius(this.elem);
                }
                vp.dom.radius(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.attr = function (name, value, disableAnim) {
                if (arguments.length == 1) {
                    return vp.dom.attr(this.elem, name);
                }
                vp.dom.attr(this.elem, name, value, disableAnim);
                return this;
            };
            singleWrapperSuperClass.prototype.customAttr = function (name, value) {
                if (arguments.length == 1) {
                    return vp.dom.customAttr(this.elem, name);
                }
                vp.dom.customAttr(this.elem, name, value);
                return this;
            };
            singleWrapperSuperClass.prototype.remove = function () {
                vp.dom.remove(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.toolTipEnabled = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.toolTipEnabled(this.elem);
                }
                vp.dom.toolTipEnabled(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.height = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.height(this.elem);
                }
                vp.dom.height(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.width = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.width(this.elem);
                }
                vp.dom.width(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.totalHeight = function () {
                return vp.dom.totalHeight(this.elem);
            };
            singleWrapperSuperClass.prototype.totalWidth = function () {
                return vp.dom.totalWidth(this.elem);
            };
            singleWrapperSuperClass.prototype.left = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.left(this.elem);
                }
                vp.dom.left(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.top = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.top(this.elem);
                }
                vp.dom.top(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.checked = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.checked(this.elem);
                }
                vp.dom.checked(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.clear = function () {
                vp.dom.clear(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.add = function (content) {
                var elems = vp.dom.add(this.elem, content);
                var ss = vp.dom.wrapElements(elems);
                return ss;
            };
            singleWrapperSuperClass.prototype.append = function (content) {
                var ss = vp.dom.append(this.elem, content);
                return ss;
            };
            singleWrapperSuperClass.prototype.prepend = function (content) {
                var ss = vp.dom.prepend(this.elem, content);
                return ss;
            };
            singleWrapperSuperClass.prototype.insertBefore = function (content) {
                var ss = vp.dom.insertBefore(this.elem, content);
                return ss;
            };
            singleWrapperSuperClass.prototype.insertAfter = function (content) {
                var ss = vp.dom.insertAfter(this.elem, content);
                return ss;
            };
            singleWrapperSuperClass.prototype.addStop = function (offset, color, opacity) {
                vp.dom.addStop(this.elem, offset, color, opacity);
                return this;
            };
            singleWrapperSuperClass.prototype.textBaseline = function (alignType, rc) {
                vp.dom.textBaseline(this.elem, alignType, rc);
                return this;
            };
            singleWrapperSuperClass.prototype.animate = function (duration, ease, container) {
                vp.dom.animate(this.elem, duration, ease, container);
                return this;
            };
            singleWrapperSuperClass.prototype.onAnimationComplete = function (callback) {
                vp.dom.onAnimationComplete(this.elem, callback);
                return this;
            };
            singleWrapperSuperClass.prototype.frameRateChanged = function (callBack) {
                vp.dom.frameRateChanged(this.elem, callBack);
                return this;
            };
            /// creates a new selectedSet from the current this.elem and the specified element/array.
            singleWrapperSuperClass.prototype.merge = function (elemOrArray) {
                var newElements = null;
                if (elemOrArray instanceof vp.dom.selectedSet) {
                    elemOrArray = elemOrArray.toArray();
                }
                else if (elemOrArray instanceof vp.dom.singleWrapperSuperClass) {
                    elemOrArray = elemOrArray.elem;
                }
                if (vp.utils.isArray(elemOrArray)) {
                    newElements = this.toArray().concat(elemOrArray);
                }
                else {
                    newElements = this.toArray();
                    newElements.push(elemOrArray);
                }
                var newSet = new vp.dom.selectedSet(newElements);
                return newSet;
            };
            singleWrapperSuperClass.prototype.toArray = function () {
                return [this.elem];
            };
            singleWrapperSuperClass.prototype.wrap = function (index) {
                var we = null;
                if (index == 0) {
                    we = vp.dom.wrapElements(this.elem);
                }
                return we;
            };
            singleWrapperSuperClass.prototype.kids = function () {
                var kids = vp.dom.children(this.elem);
                var wrappedKids = vp.dom.wrapElements(kids);
                return wrappedKids;
            };
            singleWrapperSuperClass.prototype.each = function (callback) {
                //---- pass our element to callback as wrapped ("this") ----
                callback.call(this, 0, this);
                return this;
            };
            singleWrapperSuperClass.prototype.elementSizes = function () {
                return vp.dom.elementSizes(this.elem); //, callBack);
            };
            singleWrapperSuperClass.prototype.focus = function () {
                vp.dom.focus(this.elem);
                return this;
            };
            singleWrapperSuperClass.prototype.background = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.background(this.elem);
                }
                vp.dom.background(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.dataId = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.dataId(this.elem);
                }
                vp.dom.dataId(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.shapeId = function (value) {
                if (arguments.length == 0) {
                    return vp.dom.shapeId(this.elem);
                }
                vp.dom.shapeId(this.elem, value);
                return this;
            };
            singleWrapperSuperClass.prototype.is = function (elementType) {
                return vp.dom.is(this.elem, elementType);
            };
            return singleWrapperSuperClass;
        })();
        dom.singleWrapperSuperClass = singleWrapperSuperClass;
        /** class that wraps a single element (HTML, SVG, Canvas, or WebGL item). */
        var singleWrapperClass = (function (_super) {
            __extends(singleWrapperClass, _super);
            function singleWrapperClass() {
                _super.apply(this, arguments);
                this.ctr = "vp.singleWrapper"; // code depends on this exact string
            }
            return singleWrapperClass;
        })(singleWrapperSuperClass);
        dom.singleWrapperClass = singleWrapperClass;
        function createSingleWrapper(elem) {
            return new singleWrapperClass(elem);
        }
        dom.createSingleWrapper = createSingleWrapper;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// basicSelect.ts.  Copyright (c) 2014 Microsoft Corporation.
///              part of the vuePlot library - selectand related support.
///              Note: this file must be processed first in its folder.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        /// internal.
        /// elements: the list of collected elements to add matches to.
        function getElementsCore(elements, parentElem, byId, byClass, byTag, byColon, name) {
            //vp.utils.debug("getElementsCore: parentElem=" + parentElem + ", parentElem.tagName=" + parentElem.tagName);
            if ((parentElem.id == "canvases") || (parentElem.id == "2dRect")) {
                var dummy2 = 0;
            }
            var kids = vp.dom.children(parentElem);
            if ((kids) && (kids.length > 0)) {
                for (var i = 0; i < kids.length; i++) {
                    var elem = kids[i];
                    if (elem.tagName == "svg") {
                        var a = 9;
                    }
                    if (byId) {
                        if (elem.id == name) {
                            elements.push(elem);
                        }
                    }
                    else if (byTag) {
                        if ((elem.tagName) && (elem.tagName.toLowerCase() == name)) {
                            elements.push(elem);
                        }
                    }
                    else if (byColon) {
                        if (colonTest(elem, name)) {
                            elements.push(elem);
                        }
                    }
                    else if (byClass) {
                        if (vp.dom.hasClass(elem, name)) {
                            elements.push(elem);
                        }
                    }
                    else {
                        //---- must be "*" (include everything) ----
                        elements.push(elem);
                    }
                    var grandKids = vp.dom.children(elem);
                    if ((grandKids) && (grandKids.length > 0)) {
                        //---- search the children of "elem" and add the matches to "elements" ----
                        getElementsCore(elements, elem, byId, byClass, byTag, byColon, name);
                    }
                }
            }
        }
        /// internal: return true if element meets condition of specified colon filter
        function colonTest(elem, name) {
            var meets = false;
            /// for perf reasons, we don't call out to utility functions to check for values; that
            /// cross-browser code is duplicated here.
            if (elem != null) {
                if (name == "checked") {
                    meets = elem.checked;
                }
                else if (name == "hidden") {
                    meets = (elem.visibility == "hidden");
                }
                else if (name == "visible") {
                    meets = (elem.visibility != "hidden");
                }
                else if (name == "selected") {
                    meets = (elem.selected === true);
                }
                else if (name == "checked") {
                    meets = (elem.checked === true);
                }
                else if (name == "disabled") {
                    meets = (elem.disabled);
                }
                else if (name == "enabled") {
                    meets = (elem.disabled === undefined);
                }
                else if (name == "input") {
                    meets = (elem.tagName.toLowerCase() == "input");
                }
                else if (name == "radio") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "radio"));
                }
                else if (name == "button") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "button"));
                }
                else if (name == "checkbox") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "checkbox"));
                }
                else if (name == "button") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "button"));
                }
                else if (name == "password") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "password"));
                }
                else if (name == "text") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "text"));
                }
                else if (name == "submit") {
                    meets = ((elem.tagName.toLowerCase() == "input") && (elem.type.toLowerCase() == "submit"));
                }
            }
            return meets;
        }
        function getElementsInSelectorString(parentElem, selector) {
            var ss = selector.trim();
            var elements = [];
            var byId = false;
            var byTag = false;
            var byClass = false;
            var byColon = false;
            var name = "";
            if (parentElem == null) {
                parentElem = document;
            }
            else if (parentElem.length) {
                parentElem = parentElem[0]; // unwrap parent, if needed
            }
            //---- keep it very simple for now ----
            if (ss.startsWith("#")) {
                byId = true;
                name = ss.substring(1).ltrim();
            }
            else if (ss.startsWith(".")) {
                byClass = true;
                name = ss.substring(1).ltrim();
            }
            else if (ss.startsWith(":")) {
                byColon = true;
                name = ss.substring(1).ltrim();
            }
            else if (ss != "*") {
                byTag = true;
                name = ss.toLowerCase();
            }
            getElementsCore(elements, parentElem, byId, byClass, byTag, byColon, name);
            return elements;
        }
        dom.getElementsInSelectorString = getElementsInSelectorString;
        function wrapElements(elemOrArray) {
            var ss = null;
            if (vp.utils.isArray(elemOrArray)) {
                if (elemOrArray.length == 1) {
                    ss = vp.dom.createSingleWrapper(elemOrArray[0]);
                }
                else {
                    ss = new vp.dom.selectedSet(elemOrArray);
                }
            }
            else if (elemOrArray) {
                ss = vp.dom.createSingleWrapper(elemOrArray);
            }
            return ss;
        }
        dom.wrapElements = wrapElements;
        /// upwrap(elem): return unwrapped version of elem (can be wrapper or unwrapped element)
        function unwrap(elem) {
            if (elem.length) {
                elem = elem[0];
            }
            return elem;
        }
        dom.unwrap = unwrap;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
var vp;
(function (vp) {
    function select(p1, p2) {
        var parentElem = null;
        var selector = null;
        if (p2) {
            //---- selection string specified ----
            parentElem = p1;
            selector = p2;
        }
        else if (vp.utils.isString(p1)) {
            //---- only p1=string specified ----
            parentElem = document.body;
            selector = p1;
        }
        else {
            //---- only p1=NON-string specified ----
            parentElem = p1;
            selector = null;
        }
        //return new vp.dom.selectedSet(rootElement, selectStr);
        if (vp.utils.isString(selector)) {
            var elems = vp.dom.getElementsInSelectorString(parentElem, selector);
            return vp.dom.wrapElements(elems);
        }
        else if (vp.utils.isArray(parentElem)) {
            return vp.dom.wrapElements(parentElem);
        }
        else if (parentElem != null) {
            return vp.dom.wrapElements(parentElem);
        }
        else {
            return new vp.dom.selectedSet(); // empty selected set
        }
    }
    vp.select = select;
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasSelectedSet.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - holds a set of canvas items that actions can be executed against.  
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var canvas;
    (function (canvas) {
        //---- class: canvasSelectedSet ----
        var canvasSelectedSet = (function (_super) {
            __extends(canvasSelectedSet, _super);
            //---- "fnCanvas" functions live here ----
            function canvasSelectedSet(parentElem, selector) {
                _super.call(this);
                this.ctr = "vp.canvas.canvasSelectedSet";
                this.parentElem = parentElem;
                this.selector = selector;
                if (vp.utils.isString(selector)) {
                    var elems = vp.dom.getElementsInSelectorString(parentElem, selector);
                    for (var i = 0; i < elems.length; i++) {
                        this.push(elems[i]);
                    }
                }
                else if (vp.utils.isArray(selector)) {
                    for (var i = 0; i < selector.length; i++) {
                        this.push(selector[i]);
                    }
                }
                else if (selector != null) {
                    //---- assume it is a single element ----
                    this.push(selector);
                }
            }
            /// adds the specified element/array to the selected set.
            canvasSelectedSet.prototype.merge = function (elemOrArray) {
                var newElements = null;
                if (elemOrArray instanceof vp.canvas.canvasSelectedSet) {
                    elemOrArray = elemOrArray.toArray();
                }
                if (vp.utils.isArray(elemOrArray)) {
                    newElements = this.toArray().concat(elemOrArray);
                }
                else {
                    var aray = this.toArray();
                    aray.push(elemOrArray);
                    newElements = aray;
                }
                var newSet = new vp.canvas.canvasSelectedSet(this.parentElem, newElements);
                return newSet;
            };
            /// rapidly creates and appends the specified "str" canvas element for the specified "count".
            canvasSelectedSet.prototype.multiAppend = function (str, count) {
                var appendedElements = [];
                if (this.length > 0) {
                    //---- for now, only support first container ----//
                    var container = this[0];
                    for (var i = 0; i < count; i++) {
                        var elem = container.append(str);
                        appendedElements.push(elem);
                    }
                }
                return appendedElements;
            };
            canvasSelectedSet.prototype.updateBounds = function (w, h) {
                return this.each(function (index, container) {
                    this.updateBounds(w, h);
                });
            };
            canvasSelectedSet.prototype.initShaderAnimations = function (duration, onCompleteCallback) {
                return this.each(function (index, container) {
                    this.initShaderAnimations(duration, onCompleteCallback);
                });
            };
            canvasSelectedSet.prototype.resetShaderAnimations = function () {
                return this.each(function (index, container) {
                    this.resetShaderAnimations();
                });
            };
            canvasSelectedSet.prototype.pointSize = function (value) {
                if (arguments.length == 0) {
                    value = (this.length > 0) ? this[0].pointSize() : undefined;
                    return value;
                }
                return this.each(function (index, container) {
                    this.pointSize(value);
                });
            };
            canvasSelectedSet.prototype.usePointSprites = function (value) {
                if (arguments.length == 0) {
                    value = (this.length > 0) ? this[0].usePointSprites() : undefined;
                    return value;
                }
                return this.each(function (index, container) {
                    this.usePointSprites(value);
                });
            };
            canvasSelectedSet.prototype.usePointSize = function (value) {
                if (arguments.length == 0) {
                    value = (this.length > 0) ? this[0].usePointSize() : undefined;
                    return value;
                }
                return this.each(function (index, container) {
                    this.usePointSize(value);
                });
            };
            canvasSelectedSet.prototype.markRebuildNeeded = function () {
                return this.each(function (index, container) {
                    this.markRebuildNeeded();
                });
            };
            canvasSelectedSet.prototype.append = function (content) {
                var appendedElements = [];
                var firstContainer = null;
                this.each(function (index, container) {
                    if (firstContainer == null) {
                        firstContainer = container;
                    }
                    if (content instanceof vp.dom.selectedSet) {
                        content = content.toArray();
                    }
                    else if (content instanceof vp.dom.singleWrapperSuperClass) {
                        content = content.elem;
                    }
                    if (vp.utils.isArray(content)) {
                        for (var i = 0; i < content.length; i++) {
                            var child = content[i];
                            var element = container.appendChild(child);
                            appendedElements.push(element);
                        }
                    }
                    else if (vp.utils.isString(content)) {
                        var canvasElement = this.append(content);
                        if (canvasElement != null) {
                            //---- transfer data info from parent container ----
                            canvasElement.dataItem = container.dataItem;
                            canvasElement.dataIndex = container.dataIndex;
                            appendedElements.push(canvasElement);
                        }
                    }
                    else if (content != null) {
                        container.appendChild(content);
                        appendedElements.push(content);
                    }
                });
                var ss = null;
                if (firstContainer != null) {
                    ss = new vp.canvas.canvasSelectedSet(firstContainer, appendedElements);
                }
                return ss;
            };
            canvasSelectedSet.prototype.attr = function (name, origValue) {
                return this.each(function (index, element) {
                    var value = origValue;
                    if (typeof origValue === "function") {
                        value = origValue(element.dataItem, element.dataIndex);
                    }
                    if (vp.utils.isUndefined(this.animation)) {
                        //---- no animation is active - just set in instantly ----
                        //this[name] = value;
                        //this.markRebuildNeeded();
                        this.setAttribute(name, value);
                    }
                    else {
                        //---- add to current animation ----
                        this.animation.animateAttr(element, name, value);
                    }
                });
            };
            return canvasSelectedSet;
        })(vp.dom.selectedSet);
        canvas.canvasSelectedSet = canvasSelectedSet;
        function canvasSelect(selectStr) {
            return new vp.canvas.canvasSelectedSet(document.body, selectStr);
        }
        canvas.canvasSelect = canvasSelect;
        function selectContext(selectObj, contextName) {
            var ssCanvas = vp.canvas.canvasSelect();
            var elems = null;
            if (vp.utils.isString(selectObj)) {
                elems = vp.dom.getElementsInSelectorString(document.body, selectObj);
            }
            else {
                elems = [selectObj]; // assume it is a canvas element
            }
            var ss = new vp.dom.selectedSet(elems);
            if (ss.length > 0) {
                var cc = ss.context(contextName);
                if (cc != null) {
                    ssCanvas = ssCanvas.merge(cc);
                }
            }
            return ssCanvas;
        }
        canvas.selectContext = selectContext;
    })(canvas = vp.canvas || (vp.canvas = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// canvasUtils.ts.  Copyright (c) 2014 Microsoft Corporation.
///                part of the vuePlotCore library - misc utility functions for canvas.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var internal;
    (function (internal) {
        var parsePathDataAndGenerateDrawFunc = (function () {
            function parsePathDataAndGenerateDrawFunc(dstr) {
                this.index = 0;
                this.firstPt = { x: 0, y: 0 };
                this.lastPt = { x: 0, y: 0 };
                this.firstPointSeen = false;
                this.minX = Number.MAX_VALUE;
                this.minY = Number.MAX_VALUE;
                this.maxX = -Number.MAX_VALUE; // Number.MIN_VALUE;
                this.maxY = -Number.MAX_VALUE; // Number.MIN_VALUE;
                this.d = dstr;
            }
            parsePathDataAndGenerateDrawFunc.prototype.parse = function () {
                var funcStr = "function (ctx)\r\n"
                    + "{\r\n";
                var cmd = "";
                /// sample: d="M 100 100 L 300 100 L 200 300 z"
                /// uppercase cmd letter: absolute coordinates, lowercase: relative coordinates
                ///
                /// M=move, L=line, Z=close, H=horizontal line, V=vertical line, C=cubic bezier, S=reflective cubic bezier
                /// Q=quadratic bezier, T=reflective quadratic, A=arc
                var lastIndex = -1;
                var d = this.d;
                while (this.index < d.length) {
                    this.skipSpaces(d);
                    if (this.index == lastIndex) {
                        vp.utils.error("Error: internal error in parsePathDataAndGenerateDrawFunc()");
                    }
                    if (this.index >= d.length) {
                        break;
                    }
                    lastIndex = this.index;
                    var ch = d[this.index];
                    var isLower = ((ch >= "a") && (ch <= "z"));
                    var isUpper = ((ch >= "A") && (ch <= "Z"));
                    if ((isLower) || (isUpper)) {
                        //---- new cmd specified ----
                        cmd = ch;
                        this.index++;
                        this.skipSpaces(d);
                    }
                    else {
                        vp.utils.error("Error: unrecognized token in path: " + ch);
                    }
                    //---- process current command ----
                    if ((cmd == "M") || (cmd == "m")) {
                        this.firstPointSeen = false; // get ready for a new first point 
                        var pt = this.parsePoint(d, cmd == "m");
                        funcStr += "    ctx.moveTo(" + pt.x + ", " + pt.y + ");\r\n";
                    }
                    else if ((cmd == "L") || (cmd == "l")) {
                        var pt = this.parsePoint(d, cmd == "l");
                        funcStr += "    ctx.lineTo(" + pt.x + ", " + pt.y + ");\r\n";
                    }
                    else if (cmd == "X") {
                        var cx = this.parseNumber(d);
                        var cy = this.parseNumber(d);
                        var r = this.parseNumber(d);
                        var startAngle = this.parseNumber(d);
                        var endAngle = this.parseNumber(d);
                        var antiClock = this.parseNumber(d);
                        funcStr += "    ctx.arc(" + cx + ", " + cy + "," + r + "," +
                            startAngle + "," + endAngle + "," + antiClock + ");\r\n";
                    }
                    else if ((cmd == "A") || (cmd == "a")) {
                        vp.utils.error("Error - 'A' (arc) command in path not currently supported by VuePlot");
                    }
                    else if ((cmd == "Z") || (cmd == "z")) {
                        //if (this.firstPointSeen)
                        //{
                        //    //---- close path with straight line to first point ----
                        //    funcStr += "ctx.lineTo(" + this.firstPt.x + ", " + this.firstPt.y + ");\r\n";
                        //}
                        funcStr += "ctx.closePath();\r\n";
                    }
                    else {
                        vp.utils.error("Error: unrecognized cmd in path: " + cmd);
                    }
                }
                funcStr += "}\r\n";
                var bb = vp.geom.rect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
                return [funcStr, bb];
            };
            parsePathDataAndGenerateDrawFunc.prototype.skipSpaces = function (d) {
                while (this.index < this.d.length) {
                    var ch = this.d[this.index];
                    if ((ch == ' ') || (ch == "\t") || (ch == "\r") || (ch == '\n') || (ch == ",")) {
                        this.index++;
                    }
                    else {
                        break;
                    }
                }
            };
            parsePathDataAndGenerateDrawFunc.prototype.parseNumber = function (d) {
                this.skipSpaces(d);
                var isNegative = false;
                var value = 0;
                var d = this.d;
                if (this.index < d.length) {
                    var ch = d[this.index];
                    if (ch == "+") {
                        this.index++;
                    }
                    else if (ch == '-') {
                        this.index++;
                        isNegative = true;
                    }
                    var start = this.index;
                    while (this.index < d.length) {
                        var ch = d[this.index];
                        if ((ch == '.') || ((ch >= '0') && (ch <= '9'))) {
                            this.index++;
                        }
                        else {
                            break;
                        }
                    }
                    var str = d.substr(start, this.index - start);
                    value = parseFloat(str);
                }
                if (isNegative) {
                    value = -value;
                }
                this.index = this.index;
                return value;
            };
            parsePathDataAndGenerateDrawFunc.prototype.parsePoint = function (d, isRelative) {
                /// <number> [ "," ] <number>    (skip spaces in-between each element) 
                var x = this.parseNumber(d);
                var y = this.parseNumber(d);
                if (isRelative) {
                    x += this.lastPt.x;
                    y += this.lastPt.y;
                }
                var pt = { x: x, y: y };
                this.onPointSeen(pt);
                return pt;
            };
            parsePathDataAndGenerateDrawFunc.prototype.onPointSeen = function (pt) {
                if (!this.firstPointSeen) {
                    this.firstPt = pt;
                    this.firstPointSeen = true;
                }
                this.lastPt = pt;
                this.minX = Math.min(this.minX, pt.x);
                this.minY = Math.min(this.minY, pt.y);
                this.maxX = Math.max(this.maxX, pt.x);
                this.maxY = Math.max(this.maxY, pt.y);
            };
            return parsePathDataAndGenerateDrawFunc;
        })();
        internal.parsePathDataAndGenerateDrawFunc = parsePathDataAndGenerateDrawFunc;
    })(internal = vp.internal || (vp.internal = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// colors.ts.  Copyright (c) 2014 Microsoft Corporation.
///             part of the vuePlot library - color helper and related functions.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var color;
    (function (color) {
        color.colors = {};
        color.colors.aliceblue = [240, 248, 255];
        color.colors.antiquewhite = [250, 235, 215];
        color.colors.aqua = [0, 255, 255];
        color.colors.aquamarine = [127, 255, 212];
        color.colors.azure = [240, 255, 255];
        color.colors.beige = [245, 245, 220];
        color.colors.bisque = [255, 228, 196];
        color.colors.black = [0, 0, 0];
        color.colors.blanchedalmond = [255, 235, 205];
        color.colors.blue = [0, 0, 255];
        color.colors.blueviolet = [138, 43, 226];
        color.colors.brown = [165, 42, 42];
        color.colors.burlywood = [222, 184, 135];
        color.colors.cadetblue = [95, 158, 160];
        color.colors.chartreuse = [127, 255, 0];
        color.colors.chocolate = [210, 105, 30];
        color.colors.coral = [255, 127, 80];
        color.colors.cornflowerblue = [100, 149, 237];
        color.colors.cornsilk = [255, 248, 220];
        color.colors.crimson = [220, 20, 60];
        color.colors.cyan = [0, 255, 255];
        color.colors.darkblue = [0, 0, 139];
        color.colors.darkcyan = [0, 139, 139];
        color.colors.darkgoldenrod = [184, 134, 11];
        color.colors.darkgray = [169, 169, 169];
        color.colors.darkgreen = [0, 100, 0];
        color.colors.darkkhaki = [189, 183, 107];
        color.colors.darkmagenta = [139, 0, 139];
        color.colors.darkolivegreen = [85, 107, 47];
        color.colors.darkorange = [255, 140, 0];
        color.colors.darkorchid = [153, 50, 204];
        color.colors.darkred = [139, 0, 0];
        color.colors.darksalmon = [233, 150, 122];
        color.colors.darkseagreen = [143, 188, 143];
        color.colors.darkslateblue = [72, 61, 139];
        color.colors.darkslategray = [47, 79, 79];
        color.colors.darkturquoise = [0, 206, 209];
        color.colors.darkviolet = [148, 0, 211];
        color.colors.deeppink = [255, 20, 147];
        color.colors.deepskyblue = [0, 191, 255];
        color.colors.dimgray = [105, 105, 105];
        color.colors.dodgerblue = [30, 144, 255];
        color.colors.firebrick = [178, 34, 34];
        color.colors.floralwhite = [255, 250, 240];
        color.colors.forestgreen = [34, 139, 34];
        color.colors.fuchsia = [255, 0, 255];
        color.colors.gainsboro = [220, 220, 220];
        color.colors.ghostwhite = [248, 248, 255];
        color.colors.gold = [255, 215, 0];
        color.colors.goldenrod = [218, 165, 32];
        color.colors.gray = [128, 128, 128];
        color.colors.green = [0, 128, 0];
        color.colors.greenyellow = [173, 255, 47];
        color.colors.honeydew = [240, 255, 240];
        color.colors.hotpink = [255, 105, 180];
        color.colors.indianred = [205, 92, 92];
        color.colors.indigo = [75, 0, 130];
        color.colors.ivory = [255, 255, 240];
        color.colors.khaki = [240, 230, 140];
        color.colors.lavender = [230, 230, 250];
        color.colors.lavenderblush = [255, 240, 245];
        color.colors.lawngreen = [124, 252, 0];
        color.colors.lemonchiffon = [255, 250, 205];
        color.colors.lightblue = [173, 216, 230];
        color.colors.lightcoral = [240, 128, 128];
        color.colors.lightcyan = [224, 255, 255];
        color.colors.lightgoldenrodyellow = [250, 250, 210];
        color.colors.lightgray = [211, 211, 211];
        color.colors.lightgreen = [144, 238, 144];
        color.colors.lightpink = [255, 182, 193];
        color.colors.lightsalmon = [255, 160, 122];
        color.colors.lightseagreen = [32, 178, 170];
        color.colors.lightskyblue = [135, 206, 250];
        color.colors.lightslategray = [119, 136, 153];
        color.colors.lightsteelblue = [176, 196, 222];
        color.colors.lightyellow = [255, 255, 224];
        color.colors.lime = [0, 255, 0];
        color.colors.limegreen = [50, 205, 50];
        color.colors.linen = [250, 240, 230];
        color.colors.magenta = [255, 0, 255];
        color.colors.maroon = [128, 0, 0];
        color.colors.mediumaquamarine = [102, 205, 170];
        color.colors.mediumblue = [0, 0, 205];
        color.colors.mediumorchid = [186, 85, 211];
        color.colors.mediumpurple = [147, 112, 219];
        color.colors.mediumseagreen = [60, 179, 113];
        color.colors.mediumslateblue = [123, 104, 238];
        color.colors.mediumspringgreen = [0, 250, 154];
        color.colors.mediumturquoise = [72, 209, 204];
        color.colors.mediumvioletred = [199, 21, 133];
        color.colors.midnightblue = [25, 25, 112];
        color.colors.mintcream = [245, 255, 250];
        color.colors.mistyrose = [255, 228, 225];
        color.colors.moccasin = [255, 228, 181];
        color.colors.navajowhite = [255, 222, 173];
        color.colors.navy = [0, 0, 128];
        color.colors.oldlace = [253, 245, 230];
        color.colors.olive = [128, 128, 0];
        color.colors.olivedrab = [107, 142, 35];
        color.colors.orange = [255, 165, 0];
        color.colors.orangered = [255, 69, 0];
        color.colors.orchid = [218, 112, 214];
        color.colors.palegoldenrod = [238, 232, 170];
        color.colors.palegreen = [152, 251, 152];
        color.colors.paleturquoise = [175, 238, 238];
        color.colors.palevioletred = [219, 112, 147];
        color.colors.papayawhip = [255, 239, 213];
        color.colors.peachpuff = [255, 218, 185];
        color.colors.peru = [205, 133, 63];
        color.colors.pink = [255, 192, 203];
        color.colors.plum = [221, 160, 221];
        color.colors.powderblue = [176, 224, 230];
        color.colors.purple = [128, 0, 128];
        color.colors.red = [255, 0, 0];
        color.colors.rosybrown = [188, 143, 143];
        color.colors.royalblue = [65, 105, 225];
        color.colors.saddlebrown = [139, 69, 19];
        color.colors.salmon = [250, 128, 114];
        color.colors.sandybrown = [244, 164, 96];
        color.colors.seagreen = [46, 139, 87];
        color.colors.seashell = [255, 245, 238];
        color.colors.sienna = [160, 82, 45];
        color.colors.silver = [192, 192, 192];
        color.colors.skyblue = [135, 206, 235];
        color.colors.slateblue = [106, 90, 205];
        color.colors.slategray = [112, 128, 144];
        color.colors.snow = [255, 250, 250];
        color.colors.springgreen = [0, 255, 127];
        color.colors.steelblue = [70, 130, 180];
        color.colors.tan = [210, 180, 140];
        color.colors.teal = [0, 128, 128];
        color.colors.thistle = [216, 191, 216];
        color.colors.tomato = [255, 99, 71];
        color.colors.transparent = [255, 255, 255];
        color.colors.turquoise = [64, 224, 208];
        color.colors.violet = [238, 130, 238];
        color.colors.wheat = [245, 222, 179];
        color.colors.white = [255, 255, 255];
        color.colors.whitesmoke = [245, 245, 245];
        color.colors.yellow = [255, 255, 0];
        color.colors.yellowgreen = [154, 205, 50];
        ///--------------------------------------------------------
        /// parse 1 of 147 predefined SVG color names
        /// and return its value as a 3 element number array.
        ///--------------------------------------------------------
        function getColorFromName(name) {
            var value = color.colors[name.toLowerCase()];
            if (vp.utils.isUndefined(value)) {
            }
            return value;
        }
        color.getColorFromName = getColorFromName;
        function getRandomColor() {
            var keys = vp.utils.keys(color.colors);
            var index = Math.round(Math.random() * keys.length - 1);
            var colorName = keys[index];
            return color.colors[colorName];
        }
        color.getRandomColor = getRandomColor;
        ///--------------------------------------------------------
        /// parse 3 or 6 char hex string without leading "#"
        /// and return its value as a 3 element number array.
        ///--------------------------------------------------------
        function getColorFromHexString(str) {
            var value = color.colors.black;
            if (str.length == 3) {
                var redStr = str[0] + str[0];
                var r = parseInt(redStr, 16);
                var greenStr = str[1] + str[1];
                var g = parseInt(greenStr, 16);
                var blueStr = str[2] + str[2];
                var b = parseInt(blueStr, 16);
                value = [r, g, b];
            }
            else if (str.length == 6) {
                var redStr = str[0] + str[1];
                var r = parseInt(redStr, 16);
                var greenStr = str[2] + str[3];
                var g = parseInt(greenStr, 16);
                var blueStr = str[4] + str[5];
                var b = parseInt(blueStr, 16);
                value = [r, g, b];
            }
            return value;
        }
        color.getColorFromHexString = getColorFromHexString;
        function parseRGBPart(part) {
            var value = 0;
            part = part.trim();
            if (part.endsWith("%")) {
                //---- remove the "%" ----
                part = part.substring(0, part.length - 1).trim();
                var percent = parseFloat(part);
                value = Math.max(0, Math.min(255, Math.round(255 * percent)));
            }
            else {
                value = parseInt(part);
            }
            return value;
        }
        ///--------------------------------------------------------
        /// parse a comma separate rgb string (should be: xx, xx, xx)
        /// and return its value as a 3 element number array.  Each "xx"
        /// is either an integer number or a float followed by a "%" char.
        ///--------------------------------------------------------
        function getColorFromRgbString(str) {
            var value = color.colors.black;
            var parts = str.split(',');
            if (parts.length == 3) {
                var r = parseRGBPart(parts[0]);
                var g = parseRGBPart(parts[1]);
                var b = parseRGBPart(parts[2]);
                value = [r, g, b];
            }
            else if (parts.length == 4) {
                var r = parseRGBPart(parts[0]);
                var g = parseRGBPart(parts[1]);
                var b = parseRGBPart(parts[2]);
                var a = parseRGBPart(parts[3]);
                value = [r, g, b]; // for now, don't return the "a"
            }
            return value;
        }
        color.getColorFromRgbString = getColorFromRgbString;
        /// converts an array of 3 RGB numbers (0-255) into a valid HTML/SVG color string.
        function toColor(r, g, b, a) {
            var str = null;
            if (vp.utils.isString(r)) {
                str = r; // already a color string
            }
            else {
                if (arguments.length == 1) {
                    var aray = r;
                    r = aray[0];
                    g = aray[1];
                    b = aray[2];
                    if (aray.length > 3) {
                        a = aray[3];
                    }
                }
                var red = vp.data.clamp(Math.round(r), 0, 255);
                var green = vp.data.clamp(Math.round(g), 0, 255);
                var blue = vp.data.clamp(Math.round(b), 0, 255);
                //if (true)       // for now, always use just 3 colors   // a === undefined)
                if (a === undefined) {
                    //---- caution: SVG (at least in IE9) does NOT accept spaces betweeen commas ----
                    str = ("rgb(" + red + "," + green + "," + blue + ")");
                }
                else {
                    var alpha = vp.data.clamp(Math.round(a), 0, 255);
                    str = ("rgba(" + red + "," + green + "," + blue + "," + alpha + ")");
                }
            }
            return str;
        }
        color.toColor = toColor;
        function getColorFromString(str) {
            var value = str;
            if (vp.utils.isString(str)) {
                str = str.trim();
                if (str.startsWith("#")) {
                    value = getColorFromHexString(str.substring(1));
                }
                else if (str.startsWith("rgb(")) {
                    value = getColorFromRgbString(str.substring(4, str.length - 1));
                }
                else if (str.startsWith("rgba(")) {
                    value = getColorFromRgbString(str.substring(5, str.length - 1));
                }
                else {
                    value = getColorFromName(str);
                }
            }
            return value;
        }
        color.getColorFromString = getColorFromString;
        /// public: interpolateColors(color1, color2, percent)
        /// interpolate between color1 and color2, using "percent".  
        /// returns the interpolated value.
        function interpolateColors(color1, color2, percent) {
            if (!vp.utils.isArray(color1)) {
                color1 = getColorFromString(color1);
            }
            if (!vp.utils.isArray(color2)) {
                color2 = getColorFromString(color2);
            }
            var value = [];
            for (var i = 0; i < 3; i++) {
                var min = color1[i];
                var max = color2[i];
                value[i] = min + percent * (max - min);
            }
            return value;
        }
        color.interpolateColors = interpolateColors;
        function isValidColor(value) {
            var isValid = false;
            if (vp.utils.isNumber(value)) {
                isValid = true;
            }
            else if (vp.utils.isString(value)) {
                var parts = getColorFromString(value);
                isValid = (parts !== undefined);
            }
            return isValid;
        }
        color.isValidColor = isValidColor;
        /** extract an HTML legal color value from a palette.  Does NOT do blending between entries. */
        function colorFromPalette(palette, index, firstPaletteIndex) {
            //---- when a filter is active and we draw all shapes with a subset scale, ----
            //---- it is common for the index to be invalid.  so, we fix it up here ----
            if (firstPaletteIndex === void 0) { firstPaletteIndex = 0; }
            //---- new policy is that an "other" palette at the end catches all "too big" entries ----
            index = Math.floor(vp.data.clamp(index, firstPaletteIndex, palette.length - 1));
            var cr = palette[index];
            if (!vp.utils.isString(cr)) {
                cr = toColor(cr);
            }
            return cr;
        }
        color.colorFromPalette = colorFromPalette;
        /** extract an HTML legal color value from a palette by blending the 2 closest enties as per non-integer index. */
        function continuousColorFromPalette(palette, index) {
            //---- when a filter is active and we draw all shapes with a subset scale, ----
            //---- it is common for the index to be invalid.  so, we fix it up here ----
            index = (Math.abs(index) % palette.length); // recycle entires to fulfill request
            var cr;
            if ((index < palette.length - 1) && (index != Math.floor(index))) {
                //---- interpolate between two entries ----
                var fract = index - Math.floor(index);
                var floorIndex = Math.floor(index);
                cr = colorLerp(palette[floorIndex], palette[floorIndex + 1], fract);
            }
            else {
                cr = palette[Math.floor(index)];
            }
            if (!vp.utils.isString(cr)) {
                cr = toColor(cr);
            }
            return cr;
        }
        color.continuousColorFromPalette = continuousColorFromPalette;
        /** does a LERP (mixture) of 2 colors, both of which are 3-dim RGB arrays.  Returns result as a 3-dim RGB array.*/
        function colorLerp(color1, color2, percent) {
            var value = [];
            for (var i = 0; i < 3; i++) {
                var min = color1[i];
                var max = color2[i];
                value[i] = min + percent * (max - min);
            }
            return value;
        }
        color.colorLerp = colorLerp;
        /** converts an RGB color array (values 0-255) to an WebGL-compatible percentage array (values 0-1). */
        function makeColorArrayForWebGL(crArray) {
            var newArray = [crArray[0] / 255, crArray[1] / 255, crArray[2] / 255];
            return newArray;
        }
        color.makeColorArrayForWebGL = makeColorArrayForWebGL;
    })(color = vp.color || (vp.color = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// event.ts.  Copyright (c) 2014 Microsoft Corporation.
///            part of the vuePlot library - keyboard, mouse, and touch related event handling.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var events;
    (function (events) {
        events.eventAttachCount = 0;
        events.eventDetachCount = 0;
        //export var eventFireCount = 0;
        //---- keyCodes (for keyboard test, see: http://unixpapa.com/js/testkey.html) ----
        events.keyCodes = {
            //enter: "Enter", shift: 16, ctrl: 17, alt: 18, escape: "Esc", left: 37, up: 38, right: 39, down: 40,
            enter: 13, shift: 16, ctrl: 17, alt: 18, escape: 27, left: 37, up: 38, right: 39, down: 40,
            insert: 45, home: 36, pageUp: 33, "delete": 46, end: 35, pageDown: 34, space: 32,
            A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80,
            Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, minus: 189,
            f12: 123,
        };
        var _isDragDropEnabled = true;
        events.keyboardKeys = {};
        /// cross-browser support for cancelling an event.
        function cancelEventDefault(evt) {
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            else {
                return false;
            }
        }
        events.cancelEventDefault = cancelEventDefault;
        function cancelEventBubble(evt) {
            evt.stopPropagation();
        }
        events.cancelEventBubble = cancelEventBubble;
        function monitorKeyboard(enable) {
            if (enable) {
                attach(window, "keydown", onKeyDown);
                attach(window, "keyup", onKeyUp);
            }
            else {
                detach(window, "keydown", onKeyDown);
                detach(window, "keyup", onKeyUp);
            }
        }
        events.monitorKeyboard = monitorKeyboard;
        function isKeyPressed(keyCode) {
            return (events.keyboardKeys[keyCode] == "down");
        }
        events.isKeyPressed = isKeyPressed;
        /// used by vp.monitorKeyboard.
        function onKeyDown(evt) {
            events.keyboardKeys[evt.keyCode] = "down";
            //vp.utils.debug("keydown: " + evt.keyCode);
        }
        /// used by vp.monitorKeyboard.
        function onKeyUp(evt) {
            events.keyboardKeys[evt.keyCode] = "up";
            //vp.utils.debug("keyup: " + evt.keyCode);
        }
        /// returns the current mouse positon from the event object "e".  This value is in logical window space,
        /// which includes scroll offsets.
        function mousePosition(e, relToParent) {
            //    var isIe = (document.all);
            //    var xPos = (isIe) ? window.event.clientX + document.documentElement.scrollLeft : e.pageX;
            //    var yPos = (isIe) ? window.event.clientY + document.documentElement.scrollTop : e.pageY;
            var x = e.pageX;
            var y = e.pageY;
            // Handle a non-IE 'touch' event
            if (e.type.startsWith('touch') && (e.changedTouches != undefined) && (e.changedTouches.length > 0)) {
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            }
            if (relToParent) {
                var off = vp.dom.docOffset(relToParent);
                x -= off.left;
                y -= off.top;
            }
            return { x: +x, y: +y };
        }
        events.mousePosition = mousePosition;
        var mouseMoveCallback = null;
        var mouseUpCallback = null;
        var iframeNames = null;
        /** capture all MouseMove and MouseUp messages, even those that happen outside of the browser window. This
         works on all major browsers. */
        function setCaptureWindow(moveCallback, upCallback, frameNames) {
            vp.utils.debug("setCaptureWindow: start...");
            if (mouseMoveCallback) {
                var msg = "Error: setCaptureWindow is already active (call 'vp.events.releaseCaptureWindow' to clear)";
                //---- not sure why this is happening sometimes ----
                //throw msg;
                vp.utils.debug(msg);
                releaseCaptureWindow();
            }
            vp.events.attach(window, "mousemove", moveCallback);
            vp.events.attach(window, "mouseup", upCallback);
            mouseMoveCallback = moveCallback;
            mouseUpCallback = upCallback;
            iframeNames = frameNames;
            //---- turn off mouse events for iframes ----
            if (frameNames) {
                for (var i = 0; i < frameNames.length; i++) {
                    var name = frameNames[i];
                    vp.select("#" + name)
                        .css("pointer-events", "none");
                }
            }
            vp.utils.debug("setCaptureWindow: capture set.");
        }
        events.setCaptureWindow = setCaptureWindow;
        function releaseCaptureWindow() {
            if (mouseMoveCallback) {
                vp.events.detach(window, "mousemove", mouseMoveCallback);
                vp.events.detach(window, "mouseup", mouseUpCallback);
                mouseMoveCallback = null;
                mouseUpCallback = null;
            }
            //---- re-enabled mouse events for iframes ----
            var iframeNames = iframeNames;
            if (iframeNames) {
                for (var i = 0; i < iframeNames.length; i++) {
                    var name = iframeNames[i];
                    vp.select("#" + name)
                        .css("pointer-events", "");
                }
                iframeNames = null;
            }
            vp.utils.debug("releaseCaptureWindow: capture released.");
        }
        events.releaseCaptureWindow = releaseCaptureWindow;
        var mouseMoveWrapper = function (e) {
            //---- set by SetCapture ----
        };
        var mouseUpWrapper = function (e) {
            //---- set by SetCapture ----
        };
        /// captures the mouse for mouse events on "element".  if "setCapture" is not supported by
        /// the browser, it tries to simulate it.  The "mouseMoveCallback" and "mouseUpCallback", if supplied, 
        /// are attached to the best element for the situation.
        ///
        /// tested on roland's home machine - 8/5/2012.  seems to work perfectly now on IE9, Chrome, Firefox!
        ///   - no blue selection as we drag
        ///   - no system drag/drop interference
        ///   - cursor stays as specified during drag
        ///   - on releaseCapture(), all is restored to normal.
        function setCapture(element, evt, mouseMoveCallback, mouseUpCallback) {
            var useCapture = (element.setCapture);
            mouseMoveWrapper = function (e) {
                e.vp_element = element;
                mouseMoveCallback(e);
            };
            mouseUpWrapper = function (e) {
                e.vp_element = element;
                mouseUpCallback(e);
            };
            if (useCapture) {
                //---- listen to events on the ELEMENT ----
                if (mouseMoveCallback) {
                    attach(element, "mousemove", mouseMoveWrapper);
                }
                if (mouseUpCallback) {
                    attach(element, "mouseup", mouseUpWrapper);
                }
                //---- prevent text selection by browser during our drag operation (for FireFox) ----
                vp.dom.enableElementSelection(document.body, false);
                element.setCapture();
                element._turnedOffDrawDrop = null;
            }
            else {
                //---- listen to events on the DOCUMENT ----
                if (mouseMoveCallback) {
                    attach(document, "mousemove", mouseMoveWrapper);
                }
                if (mouseUpCallback) {
                    attach(document, "mouseup", mouseUpWrapper);
                }
                //---- prevent text selection by browser during our drag operation (for Chrome) ----
                vp.dom.enableElementSelection(document.body, false);
                element._turnedOffDrawDrop = enableDragDrop(false);
                var cursorState = vp.dom.css(element, "cursor");
                if (cursorState) {
                    //---- create a style sheet that keeps cursor constant during capture ----
                    var sheet = new vp.dom.styleSheetClass()
                        .addRule("*", "cursor: " + cursorState)
                        .id("vp_setCapture_ss");
                }
            }
            if (evt) {
                evt.preventDefault(); // don't allow selection to select text, etc. during our capture
                evt.stopPropagation();
                evt.cancelBubble = true;
            }
            return useCapture;
        }
        events.setCapture = setCapture;
        function setFocus(elem) {
            while ((elem) && (!elem.focus)) {
                elem = vp.dom.parent(elem);
            }
            if (elem.focus) {
                elem.focus();
            }
        }
        events.setFocus = setFocus;
        /// captures the mouse for mouse events on "element".
        function releaseCapture(element, evt, mouseMoveCallback, mouseUpCallback) {
            var callRelease = (element.releaseCapture);
            if (callRelease) {
                element.releaseCapture();
                //---- clear events on the ELEMENT ----
                if (mouseMoveWrapper) {
                    detach(element, "mousemove", mouseMoveWrapper);
                    mouseMoveWrapper = null;
                }
                if (mouseUpWrapper) {
                    detach(element, "mouseup", mouseUpWrapper);
                    mouseUpWrapper = null;
                }
                //---- re-enable text selection by browser (for FireFox) ----
                vp.dom.enableElementSelection(document.body, true);
            }
            else {
                //---- clear events on the DOCUMENT ----
                if (mouseMoveWrapper) {
                    detach(document, "mousemove", mouseMoveWrapper);
                    mouseMoveWrapper = null;
                }
                if (mouseUpWrapper) {
                    detach(document, "mouseup", mouseUpWrapper);
                    mouseUpWrapper = null;
                }
                //---- re-enable text selection by browser (for Chrome) ----
                vp.dom.enableElementSelection(document.body, true);
                if (element._turnedOffDrawDrop) {
                    enableDragDrop(true);
                }
                //---- remove the stylesheet, if we created it ----
                var elem = document.getElementById("vp_setCapture_ss");
                if (elem) {
                    vp.dom.remove(elem);
                }
            }
            return callRelease;
        }
        events.releaseCapture = releaseCapture;
        function stopDragDrop(evt) {
            evt.dataTransfer.dropEffect = 'none';
            evt.stopPropagation();
            evt.preventDefault();
        }
        function enableDragDrop(isEnabled) {
            if (_isDragDropEnabled != isEnabled) {
                var body = vp.select(document.body);
                body.attach("dragstart", function (e) {
                    return _isDragDropEnabled = true;
                });
                body.attr("draggable", isEnabled);
                if (isEnabled) {
                    body.detach("dragenter", stopDragDrop);
                    body.detach("ondragover", stopDragDrop);
                    body.detach("ondrop", stopDragDrop);
                }
                else {
                    body.attach("dragenter", stopDragDrop);
                    body.attach("ondragover", stopDragDrop);
                    body.attach("ondrop", stopDragDrop);
                }
                _isDragDropEnabled = isEnabled;
            }
        }
        events.enableDragDrop = enableDragDrop;
        function attach(elem, eventName, funcToCall, useCapturePhase) {
            events.eventAttachCount++;
            if ((eventName == "mousewheel") && (vp.utils.isFireFox)) {
                eventName = "DOMMouseScroll";
            }
            if ((eventName == "resize") && (elem != window)) {
                //---- add support for resize events on non-window elements ----
                if (!elem.resizeEvent) {
                    if (elem.tagName == "circle") {
                        elem.resizeEvent = { prevWidth: vp.dom.width(elem), prevRadius: vp.dom.attr(elem, "radius"), callBacks: [] };
                    }
                    else {
                        elem.resizeEvent = { prevWidth: vp.dom.width(elem), prevHeight: vp.dom.height(elem), callBacks: [] };
                    }
                }
                elem.resizeEvent.callBacks.push(funcToCall);
            }
            else {
                if ((elem.control) && (elem.control.addEventListener)) {
                    //---- let the control handle the event management ----
                    elem.control.addEventListener(eventName, funcToCall);
                }
                else if (elem.addEventListener) {
                    elem.addEventListener(eventName, funcToCall, useCapturePhase);
                }
                else if (elem.attachEvent) {
                    elem.attachEvent(eventName, funcToCall);
                }
            }
        }
        events.attach = attach;
        /// trigger the vuePlot "resize" event on the specified elem.
        function triggerResize(elem) {
            //---- has someone hooked the "resize" event on this elem? ----
            if (!elem.resizeEvent) {
                //---- try his kids ----
                var kids = vp.dom.children(elem);
                for (var i = 0; i < kids.length; i++) {
                    triggerResize(kids[i]);
                }
            }
            else {
                var resizeEvent = elem.resizeEvent;
                //---- see if at least one of size properties has really changed ----
                var changed = false;
                if (elem.tagName == "circle") {
                    var radius = elem.attr("radius");
                    changed = (radius != resizeEvent.prevRadius);
                    if (changed) {
                        resizeEvent.prevRadius = radius;
                    }
                }
                else {
                    var width = vp.dom.width(elem);
                    var changeWidth = (width != resizeEvent.prevWidth);
                    if (changeWidth) {
                        resizeEvent.prevWidth = width;
                    }
                    var height = vp.dom.height(elem);
                    var changeHeight = (height != resizeEvent.prevHeight);
                    if (changeHeight) {
                        resizeEvent.prevHeight = height;
                    }
                    changed = (changeWidth || changeHeight);
                }
                if (changed) {
                    var callBacks = resizeEvent.callBacks;
                    for (var i = 0; i < callBacks.length; i++) {
                        var callBack = callBacks[i];
                        var e = { target: elem, type: "resize", currentTarget: elem, cancelable: false, bubbles: false };
                        callBack(e);
                    }
                }
            }
        }
        events.triggerResize = triggerResize;
        /// window was resized; trigger the "resize" event on the element and all its children
        function triggerResizeRecursive(elem) {
            if (elem.resizeEvent) {
                triggerResize(elem);
            }
            var kids = vp.dom.children(elem);
            if ((kids) && (kids.length > 0)) {
                for (var i = 0; i < kids.length; i++) {
                    triggerResizeRecursive(kids[i]);
                }
            }
        }
        function wheelDelta(evt) {
            return (evt.detail) ? -40 * evt.detail : evt.wheelDelta;
        }
        events.wheelDelta = wheelDelta;
        function detach(elem, eventName, funcToCall, useCapture) {
            events.eventDetachCount++;
            if ((eventName == "mousewheel") && (vp.utils.isFireFox)) {
                eventName = "DOMMouseScroll";
            }
            if ((eventName == "resize") && (elem != window)) {
                //---- add support for resize events on non-window elements ----
                if (elem.resizeEvent) {
                    var callBacks = elem.resizeEvent.callBacks;
                    for (var i = 0; i < callBacks.length; i++) {
                        if (callBacks[i] == funcToCall) {
                            callBacks.removeAt(i);
                        }
                    }
                }
            }
            else {
                if ((elem.control) && (elem.control.removeEventListener)) {
                    //---- let the control handle the event management ----
                    elem.control.removeEventListener(eventName, funcToCall);
                }
                else if (elem.removeEventListener) {
                    elem.removeEventListener(eventName, funcToCall);
                }
                else if (elem.detachEvent) {
                    elem.detachEvent(eventName, funcToCall);
                }
            }
        }
        events.detach = detach;
        /// returns the HTML, SVG, or lightweight cavnas element at the specified x,y
        /// (pixels from document origin).
        function elementFromPoint(x, y) {
            //---- first, get the HTML or SVG element from the DOM ----
            var elem = document.elementFromPoint(x, y);
            if (elem != null) {
                //---- now, see if there is a canvas element at that location ----
                if (elem.canvasContainerElement) {
                    //---- make x, y relative to canvas ----
                    var off = vp.dom.docOffset(elem);
                    x -= off.left;
                    y -= off.top;
                    elem = elem.canvasContainerElement.getCanvasElementAtPoint(x, y);
                }
            }
            return elem;
        }
        events.elementFromPoint = elementFromPoint;
        //---- local init code ----
        attach(window, "resize", function (e) {
            triggerResizeRecursive(document.body);
        });
    })(events = vp.events || (vp.events = {}));
})(vp || (vp = {}));
//module vp
//{
//    export function attach(elem, eventName, funcToCall, useCapturePhase?)
//    {
//        return vp.events.attach(elem, eventName, funcToCall, useCapturePhase);
//    }
//    export function detach(elem, eventName, funcToCall, useCapturePhase?)
//    {
//        return vp.events.detach(elem, eventName, funcToCall, useCapturePhase);
//    }
//    export function mousePosition(e, relToParent?: any)
//    {
//        return vp.events.mousePosition(e, relToParent);
//    }
//}
///-----------------------------------------------------------------------------------------------------------------
/// inkHitTest.ts.  Copyright (c) 2014 Microsoft Corporation.
///     - part of the vuePlotCore library 
///     - does ink based hit testing of a shape and rectangle, using a temp. canvas
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var internal;
    (function (internal) {
        var inkHitTest = (function () {
            function inkHitTest(rect) {
                //---- private state ----
                this.tempCanvas = null;
                this.root = null;
                this.ctx = null;
                this.rect = rect;
                this.w = rect.width;
                this.h = rect.height;
                //---- create a temp. canvas object to render to ----
                this.tempCanvas = vp.select(document.body).append("canvas")
                    .id("$_tempCanvas")
                    .attr("width", this.w + "")
                    .attr("height", this.h + "");
                this.root = vp.canvas.selectContext("#$_tempCanvas", "2d");
                this.ctx = this.root[0].ctx;
            }
            inkHitTest.prototype.transferAttrs = function (fromElem, toElem, attrNameList) {
                //---- unwrap toElem ----
                toElem = (toElem.length) ? toElem[0] : toElem;
                for (var i = 0; i < attrNameList.length; i++) {
                    var name = attrNameList[i];
                    var value = (name == "text") ? vp.dom.text(fromElem) : vp.dom.attr(fromElem, name);
                    if (value !== undefined) {
                        vp.dom.attr(toElem, name, value);
                    }
                }
            };
            inkHitTest.prototype.canvasElemFromSvg = function (canvasRoot, svgElem) {
                //---- add svgElem to canvasRoot ----
                var canvasElem = null;
                if (svgElem.tagName == "g") {
                    canvasElem = canvasRoot.append("g");
                    this.transferAttrs(svgElem, canvasElem, []);
                }
                else if (svgElem.tagName == "rect") {
                    canvasElem = canvasRoot.append("rect");
                    this.transferAttrs(svgElem, canvasElem, ["x", "y", "width", "height"]);
                }
                else if (svgElem.tagName == "line") {
                    canvasElem = canvasRoot.append("line");
                    this.transferAttrs(svgElem, canvasElem, ["x1", "y1", "x2", "y2"]);
                }
                else if (svgElem.tagName == "circle") {
                    canvasElem = canvasRoot.append("circle");
                    this.transferAttrs(svgElem, canvasElem, ["cx", "cy", "r"]);
                }
                else if (svgElem.tagName == "ellipse") {
                    canvasElem = canvasRoot.append("ellipse");
                    this.transferAttrs(svgElem, canvasElem, ["cx", "cy", "rx", "ry"]);
                }
                else if (svgElem.tagName == "path") {
                    canvasElem = canvasRoot.append("path");
                    this.transferAttrs(svgElem, canvasElem, ["d"]);
                }
                else if (svgElem.tagName == "polyline") {
                    canvasElem = canvasRoot.append("polyline");
                    this.transferAttrs(svgElem, canvasElem, ["points"]);
                }
                else if (svgElem.tagName == "polygon") {
                    canvasElem = canvasRoot.append("polygon");
                    this.transferAttrs(svgElem, canvasElem, ["points"]);
                }
                else if (svgElem.tagName == "text") {
                    canvasElem = canvasRoot.append("text");
                    this.transferAttrs(svgElem, canvasElem, ["x", "y", "text", "dx", "dy", "font-size", "font-width", "font-weight",
                        "font-style", "font-family"]);
                }
                else {
                }
                if (canvasElem) {
                    //---- transfer common attributes -----
                    this.transferAttrs(svgElem, canvasElem, ["transform", "fill", "stroke", "stroke-width"]);
                    //---- unwrap canvasElem ----
                    canvasElem = (canvasElem.length) ? canvasElem[0] : canvasElem;
                    //---- don't interfere with our high-level transform ----
                    canvasElem.transform = null;
                }
                else {
                    canvasElem = vp.select(""); // empty wrapper
                }
                return canvasElem;
            };
            inkHitTest.prototype.addCanvasChild = function (canvasParent, svgElem) {
                if (svgElem.tagName) {
                    canvasParent = this.canvasElemFromSvg(canvasParent, svgElem);
                    //---- now add children of svgElem ----
                    var kids = vp.dom.children(svgElem);
                    if (kids.length > 0) {
                        var wcp = vp.dom.wrapElements(canvasParent);
                        for (var i = 0; i < kids.length; i++) {
                            this.addCanvasChild(wcp, kids[i]);
                        }
                    }
                }
            };
            inkHitTest.prototype.close = function () {
                //---- remove temp canvas ----
                this.root[0].close(); // stop drawing
                this.tempCanvas.remove();
            };
            inkHitTest.prototype.doesShapeOverlap = function (svgShape) {
                var shapeWidth = vp.dom.width(svgShape);
                var shapeHeight = vp.dom.height(svgShape);
                this.root.clear(); // remove previous shapes
                this.addCanvasChild(this.root, svgShape);
                //---- clear the canvas ----
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.clearRect(0, 0, this.w, this.h);
                //---- set the transform so that only the rect area of the shape will be drawn on the canvas ----
                var x = -this.rect.left;
                var y = -this.rect.top;
                this.ctx.setTransform(1, 0, 0, 1, x, y);
                //---- draw the shape ----
                this.root[0].drawAll(this.ctx);
                //---- get the pixels in the canvas ----
                var imageData = this.ctx.getImageData(0, 0, this.w, this.h);
                var intersects = false;
                //---- now, walk each pixel and see if any ink is present ----
                var index = 0;
                for (var r = 0; r < this.h; r++) {
                    if (intersects) {
                        break;
                    }
                    for (var c = 0; c < this.w; c++) {
                        if (intersects) {
                            break;
                        }
                        for (var p = 0; p < 4; p++) {
                            if (imageData.data[index++]) {
                                intersects = true;
                                break;
                            }
                        }
                    }
                }
                return intersects;
            };
            return inkHitTest;
        })();
        internal.inkHitTest = inkHitTest;
    })(internal = vp.internal || (vp.internal = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// insertAppend.ts.  Copyright (c) 2014 Microsoft Corporation.
///                   part of the vuePlot library - handles inserting and appending content to containers.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        function createHtml(tagName) {
            var element = document.createElement(tagName);
            return element;
        }
        dom.createHtml = createHtml;
        function createSvg(tagName) {
            var nsSvg = "http://www.w3.org/2000/svg";
            var svgElem = document.createElementNS(nsSvg, tagName);
            return svgElem;
        }
        dom.createSvg = createSvg;
        /** createElement(parent, tagName) - creates an HTML, SVG, or CANVAS element with the specified tagName.
        returns: the newly created element (unwrapped). */
        function createElement(parent, tagName) {
            var element = null;
            var parentElem = (parent.element) ? parent.element() : parent;
            if ((tagName.toLowerCase() == "svg") || (vp.utils.isSvgDocOrElement(parentElem))) {
                //---- normal SVG container ----
                //---- NOTE: do NOT include STYLE properties on the SVG document - causing polyline elements to not render (04/01/2015 - rfernand). ----
                element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
            }
            else {
                var tagNameLower = tagName.toLowerCase();
                var element = null;
                if (tagNameLower.startsWith("vp.")) {
                    var ctr = eval(tagName);
                    if (vp.utils.isFunction(ctr)) {
                        //---- create the vuePlot visual control ----
                        var obj = ctr.call();
                        if (vp.utils.isDefined(obj.tagName)) {
                            element = obj;
                        }
                        else {
                            element = obj.domElement;
                        }
                    }
                }
                else {
                    //---- regular HTML element ----
                    element = document.createElement(tagName);
                }
            }
            return element;
        }
        dom.createElement = createElement;
        /// this was created to help speed up our slow create and append routines by looping at the 
        /// lowest level possible.
        function createElements(parent, tagName, count) {
            var elements = [];
            var parentElem = (parent.element) ? parent.element() : parent;
            if ((tagName.toLowerCase() == "svg") || (vp.utils.isSvgDocOrElement(parentElem))) {
                //---- normal SVG container ----
                for (var i = 0; i < count; i++) {
                    var elem = document.createElementNS('http://www.w3.org/2000/svg', tagName);
                    elements[i] = elem;
                }
            }
            else {
                var tagNameLower = tagName.toLowerCase();
                var element = null;
                if (tagNameLower.startsWith("vp.")) {
                    var ctr = eval(tagName);
                    if (vp.utils.isFunction(ctr)) {
                        for (var i = 0; i < count; i++) {
                            //---- create the vuePlot visual control ----
                            var obj = ctr.call();
                            if (vp.utils.isDefined(obj.tagName)) {
                                element = obj;
                            }
                            else {
                                element = obj.domElement;
                            }
                            elements[i] = element;
                        }
                    }
                }
                else {
                    //---- regular HTML element ----
                    for (var i = 0; i < count; i++) {
                        element = document.createElement(tagName);
                        elements[i] = element;
                    }
                }
            }
            return elements;
        }
        dom.createElements = createElements;
        /// internal.
        function insertOrAppend(container, child, insertOp) {
            var returnValue = null;
            var addingToContainer = ((insertOp == "append") || (insertOp == "prepend"));
            if ((insertOp == "append") || ((addingToContainer) && (container.children.length == 0))) {
                returnValue = container.appendChild(child);
            }
            else if (insertOp == "prepend") {
                returnValue = container.insertBefore(child, container.children[0]);
            }
            else if (insertOp == "insertBefore") {
                var parent = container.parentNode;
                returnValue = parent.insertBefore(child, container);
            }
            else if (insertOp == "insertAfter") {
                var parent = container.parentNode;
                returnValue = parent.insertBefore(child, container.nextSibling);
            }
            return returnValue;
        }
        //---- INTERNAL: appends the content into the container, using the specified insertOp, and returns ----
        //---- an array of appended elements. ----
        function appendCoreSingle(container, content, insertOp) {
            var appendedElements = [];
            //---- look for all 3 "select set" types ----
            if (content instanceof vp.dom.selectedSet) {
                content = content.toArray();
            }
            else if (content.ctr == "vp.canvas.canvasSelectedSet") {
                content = content.toArray();
            }
            else if (content instanceof vp.dom.singleWrapperSuperClass) {
                //---- special handling since "content" is already wrapped ----
                var element = insertOrAppend(container, content.elem, insertOp);
                appendedElements = content; // already wrapped (don't rewrap)
            }
            //else if (content instanceof vp.marks.markBaseClass)
            //{
            //    var element = insertOrAppend(container, content._container, insertOp);
            //    appendedElements = content;      // already wrapped (don't rewrap)
            //}
            if (appendedElements.length == 0) {
                if (vp.utils.isArray(content)) {
                    for (var i = 0; i < content.length; i++) {
                        var child = content[i];
                        var element = insertOrAppend(container, child, insertOp);
                        appendedElements.push(element);
                    }
                }
                else if (vp.utils.isString(content)) {
                    var element = vp.dom.createElement(container, content);
                    if (element != null) {
                        //---- transfer data info from parent container ----
                        element.dataItem = container.dataItem;
                        element.dataIndex = container.dataIndex;
                        insertOrAppend(container, element, insertOp);
                        appendedElements.push(element);
                    }
                }
                else if (vp.utils.isFunction(content)) {
                    //---- call func to get content to append ----
                    var elemFromFunc = content(this);
                    var element = insertOrAppend(container, elemFromFunc, insertOp);
                    appendedElements.push(element);
                }
                else if (content != null) {
                    var element = insertOrAppend(container, content, insertOp);
                    appendedElements.push(element);
                }
            }
            return appendedElements;
        }
        //---- add specified content to container & return added elements as ARRAY ----
        //---- seems to be used only for HTML "select" element? ----
        //---- TODO: merge this with "vp.appendCoreSingle" (using a callBack functon to do the append/insert/add!) ----
        function add(container, content) {
            var addedElements = [];
            var element;
            //---- look for all 3 "select set" types ----
            if (content instanceof vp.dom.selectedSet) {
                content = content.toArray();
            }
            else if (content.ctr == "vp.canvas.canvasSelectedSet") {
                content = content.toArray();
            }
            else if (content instanceof vp.dom.singleWrapperSuperClass) {
                content = [content.elem];
            }
            if (vp.utils.isArray(content)) {
                for (var i = 0; i < content.length; i++) {
                    var child = content[i];
                    element = container.add(child);
                    addedElements.push(element);
                }
            }
            else if (vp.utils.isString(content)) {
                if (vp.utils.isSvgDocOrElement(container)) {
                    //---- normal SVG container ----
                    element = document.createElementNS('http://www.w3.org/2000/svg', content);
                    if (element != null) {
                        //---- transfer data info from parent container ----
                        element.dataItem = container.dataItem;
                        element.dataIndex = container.dataIndex;
                        container.add(element);
                        addedElements.push(element);
                    }
                }
                else {
                    //---- regular HTML element ----
                    element = document.createElement(content);
                    if (element != null) {
                        //---- transfer data info from parent container ----
                        element.dataItem = container.dataItem;
                        element.dataIndex = container.dataIndex;
                        container.add(element);
                        addedElements.push(element);
                    }
                }
            }
            else if (content != null) {
                container.add(content);
                addedElements.push(element);
            }
            return addedElements;
        }
        dom.add = add;
        //---- append into specified container and return elements in a wrapper ----
        function append(container, content) {
            var elements = null;
            if (container.tagName == "CANVAS") {
                if (!container.canvasContainerElement) {
                    //---- build a canvasContainerElement on the fly ----
                    container = vp.canvas.selectContext(container, "2d")[0];
                }
                else {
                    //---- switch from canvas element to our associated canvas container object ----
                    container = container.canvasContainerElement;
                }
            }
            if (container.append) {
                //---- its a canvasContainer or canvasGroup element ----
                elements = container.append(content);
            }
            else {
                elements = appendCoreSingle(container, content, "append");
            }
            if (!vp.utils.isSelectedSet(elements)) {
                elements = vp.dom.wrapElements(elements);
            }
            return elements;
        }
        dom.append = append;
        //---- append into specified container ----
        function appendElements(container, elements) {
            if (container.append) {
                for (var i = 0; i < elements.length; i++) {
                    container.append(elements[i]);
                }
            }
            else {
                for (var i = 0; i < elements.length; i++) {
                    container.appendChild(elements[i]);
                }
            }
        }
        dom.appendElements = appendElements;
        //---- prepend into specified container ----
        function prepend(container, content) {
            var elements = appendCoreSingle(container, content, "prepend");
            return vp.dom.wrapElements(elements);
        }
        dom.prepend = prepend;
        //---- insert content before specified container ----
        function insertBefore(container, content) {
            var elements = appendCoreSingle(container, content, "insertBefore");
            return vp.dom.wrapElements(elements);
        }
        dom.insertBefore = insertBefore;
        //---- insert content after specified container ----
        function insertAfter(container, content) {
            var elements = appendCoreSingle(container, content, "insertAfter");
            return vp.dom.wrapElements(elements);
        }
        dom.insertAfter = insertAfter;
        /// INTERNAL.
        function appendCoreMulti(self, content, insertOp) {
            var appendedElements = [];
            var firstContainer = true;
            self.each(function (index, container) {
                var newElements = appendCoreSingle(container, content, insertOp);
                if (firstContainer) {
                    appendedElements = newElements;
                    firstContainer = false;
                }
            });
            var ss = vp.dom.wrapElements(appendedElements);
            return ss;
        }
        dom.appendCoreMulti = appendCoreMulti;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// isFuncs.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - functions for testing object categories
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var utils;
    (function (utils) {
        utils.isFireFox = navigator.userAgent.toLowerCase().contains("firefox");
        utils.isChrome = navigator.userAgent.toLowerCase().contains("chrome");
        //export var isIE = (navigator.appName == 'Microsoft Internet Explorer');
        //export var isIE = navigator.userAgent.contains("Trident");
        utils.isIE = navigator.userAgent.toLowerCase().contains("trident");
        utils.isIE11 = navigator.userAgent.contains("Trident/7.0");
        function isUndefined(obj) {
            return (typeof obj === "undefined");
        }
        utils.isUndefined = isUndefined;
        function isDefined(obj) {
            return (!(typeof obj === "undefined"));
        }
        utils.isDefined = isDefined;
        /// returns true if obj is a VuePlot visualization element.
        function isVuePlotControl(obj) {
            return (obj && (!(typeof obj.control === "undefined")));
        }
        utils.isVuePlotControl = isVuePlotControl;
        /// is obj an svg child element?
        function isSvgElement(obj) {
            var isSvg = (obj && obj.tagName == "svg") ? false : vp.utils.isSvgDocOrElement(obj);
            return isSvg;
        }
        utils.isSvgElement = isSvgElement;
        /// is this element an svg document or svg child element?
        function isSvgDocOrElement(elem) {
            var isSvg = false;
            var parent = elem;
            while ((parent != null) && (parent != document)) {
                if (parent.tagName == "svg") {
                    isSvg = true;
                    break;
                }
                if (parent.tagName == "foreignObject") {
                    isSvg = false;
                    break;
                }
                if (parent.parentNode == null) {
                    // CHW: return true when root is an SVG.*Element
                    var cname = parent.constructor.toString();
                    if (cname.match(/object SVG.*Element/i)) {
                        // consider part of SVG tree if root element is an SVG element
                        isSvg = true;
                        break;
                    }
                }
                parent = parent.parentNode;
            }
            return isSvg;
        }
        utils.isSvgDocOrElement = isSvgDocOrElement;
        /// is obj an HTML 5 canvas ----
        function isCanvas(obj) {
            return ((obj != null) && (obj.tagName == "CANVAS"));
        }
        utils.isCanvas = isCanvas;
        /// is obj a lightweight canvas child? ----
        function isCanvasChild(obj) {
            return ((obj != null) && (obj.rootContainer) && (obj.rootContainer.canvas.tagName == "CANVAS"));
        }
        utils.isCanvasChild = isCanvasChild;
        function isCanvasContainer(obj) {
            return ((obj != null) && (obj.rootContainer == obj));
        }
        utils.isCanvasContainer = isCanvasContainer;
        /// returns true if obj is a function.
        function isFunction(obj) {
            return (typeof obj === "function");
        }
        utils.isFunction = isFunction;
        /// returns true if obj is a number.
        function isNumber(obj) {
            return (typeof obj === "number");
        }
        utils.isNumber = isNumber;
        /// returns true if obj is an object (not a primitive).
        function isObject(obj) {
            return (typeof obj === "object");
        }
        utils.isObject = isObject;
        /// returns true if obj is a boolean value (true/false).
        function isBoolean(obj) {
            return (typeof obj === "boolean");
        }
        utils.isBoolean = isBoolean;
        /// returns true if obj is a number and not a NAN and not infinity
        function isValidNumber(obj) {
            return ((typeof obj === "number") && (!isNaN(obj)) && (isFinite(obj)));
        }
        utils.isValidNumber = isValidNumber;
        function isInteger(value) {
            var isInt = isValidNumber(value);
            if (isInt) {
                if (value != Math.floor(value)) {
                    isInt = false;
                }
            }
            return isInt;
        }
        utils.isInteger = isInteger;
        /// returns true if obj is an array.
        function isArray(obj) {
            //return (typeof this === "array");
            return (obj == null) ? false : Object.prototype.toString.call(obj) === "[object Array]";
        }
        utils.isArray = isArray;
        /// returns true if obj is a string.
        function isString(obj) {
            return (typeof obj === "string");
        }
        utils.isString = isString;
        /// returns true if obj is a selected set.
        function isSelectedSet(elem) {
            return ((elem.ctr == "vp.dom.selectedSet") || (elem instanceof vp.dom.singleWrapperSuperClass));
        }
        utils.isSelectedSet = isSelectedSet;
        /// returns true if obj is a Date object.
        function isDate(obj) {
            return (obj instanceof Date);
        }
        utils.isDate = isDate;
    })(utils = vp.utils || (vp.utils = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dom.ts.  Copyright (c) 2014 Microsoft Corporation.
///            part of the vuePlot library - getters and setters for element attributes and CSS properties.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        function is(elem, elementType) {
            var match = false;
            if (elem.tagName) {
                match = (elem.tagName.toLowerCase() == elementType.toLowerCase());
            }
            return match;
        }
        dom.is = is;
        /// get/set the "left" css propperty (relative to its parent).  this supports HTML elements, 
        /// including the SVG and Canvas documents.
        /// SVG and Canvas children should use the "x" and "cx" attributes.
        function left(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                //---- try SVG first (since elem.offsetLeft returns "0" on Chrome for SVG elements) ----
                if (elem.getBBox) {
                    //---- SVG element ----
                    var rc = elem.getBBox();
                    value = rc.x;
                }
                else {
                    //---- try modern HTML ----
                    value = elem.offsetLeft;
                    if (value === undefined) {
                        if (elem.getOffset) {
                            //---- canvas element ----
                            value = elem.getOffset().x;
                        }
                    }
                }
                return value;
            }
            else {
                //---- SET value ----
                if (vp.utils.isNumber(value)) {
                    //---- ensure number without units get interpreted as pixels ----
                    value = value + "px";
                }
                if (vp.utils.isUndefined(elem.animation)) {
                    //---- no animation is active - just set in instantly ----
                    elem.style.left = value;
                }
                else {
                    //---- add to current animation object ----
                    elem.animation.animateAttr(elem, "left", value, undefined, undefined, undefined, true);
                }
            }
        }
        dom.left = left;
        /// get/set the "top" css propperty (relative to its parent).  this supports HTML elements, 
        /// including the SVG and Canvas documents.
        /// SVG and Canvas children should use the "x" and "cx" attributes.
        function top(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                //---- try SVG first (since elem.offsetLeft returns "0" on Chrome for SVG elements) ----
                if (elem.getBBox) {
                    //---- SVG element ----
                    var rc = elem.getBBox();
                    value = rc.y;
                }
                else {
                    //---- ftry modern HTML ----
                    value = elem.offsetTop;
                    if (value === undefined) {
                        if (elem.getOffset) {
                            //---- canvas element ----
                            value = elem.getOffset().y;
                        }
                    }
                }
                return value;
            }
            else {
                //---- SET value ----
                if (vp.utils.isNumber(value)) {
                    //---- ensure number without units get interpreted as pixels ----
                    value = value + "px";
                }
                if (vp.utils.isUndefined(elem.animation)) {
                    //---- no animation is active - just set it instantly ----
                    elem.style.top = value;
                }
                else {
                    //---- add to current animation object ----
                    elem.animation.animateAttr(elem, "top", value, undefined, undefined, undefined, true);
                }
            }
        }
        dom.top = top;
        /// public getBounds(elem) - return a RECT that represents the x, y, width, height relative 
        /// to its parent.  Works for HTML, SVG, and CANVAS elements.
        function getBounds(elem, relToParent) {
            var rc = undefined;
            //---- checking "getBoundingClientRect" was working but now seems to have broken ----
            //---- switched to check getBBox first on 10/23/2012 - rfernand ----
            if (elem.getBBox) {
                var rcx = elem.getBBox();
                //---- convert to true rect ----
                var rc = vp.geom.rect(rcx.x, rcx.y, rcx.width, rcx.height);
                //---- bug corrected: 03/24/2015 - rfernand ----
                //if ((!relToParent) && (elem.parentNode))
                if ((relToParent) && (elem.parentNode)) {
                    var rcp = getBounds(elem.parentNode, false);
                    rc = vp.geom.offsetRect(rc, rcp.left, rcp.top);
                }
            }
            else if (elem.getBoundingClientRect) {
                rc = elem.getBoundingClientRect();
                if ((relToParent) && (elem.parentNode)) {
                    var rcp = elem.parentNode.getBoundingClientRect();
                    rc = vp.geom.offsetRect(rc, -rcp.left, -rcp.top);
                }
            }
            return rc;
        }
        dom.getBounds = getBounds;
        function parentOffset(elem) {
            return { left: left(elem), top: top(elem) };
        }
        dom.parentOffset = parentOffset;
        /// return size of browser window.
        function windowSize() {
            return { width: window.innerWidth, height: window.innerHeight };
        }
        dom.windowSize = windowSize;
        /// return the actual width of the specified element.
        function getWidth(elem) {
            //---- get "width" value ----
            var width = 0;
            if (elem) {
                try {
                    if ((elem == window) || (elem == document)) {
                        width = windowSize().width;
                    }
                    else if (elem.rootContainer) {
                        //---- this is a vueplot canvasContainerElement ----
                        if (elem.rootContainer == elem) {
                            elem = elem.canvas;
                            width = elem.getBoundingClientRect().width;
                        }
                        else {
                            //---- its a canvas 2d/3d lightweight element ----
                            width = elem.getWidth.call(elem);
                        }
                    }
                    else if ((elem.tagName == "svg") && (vp.utils.isFireFox)) {
                        //---- SVG document on FireFox ----
                        if (elem.clientWidth) {
                            //---- svg document on Chrome needs this ----
                            width = elem.clientWidth;
                        }
                        if (width == 0) {
                            //---- sampleData.html needs this checked before checking elem.width.baseVal ----
                            if ((elem.style) && (elem.style.width !== undefined)) {
                                width = getCssNumber(elem.style.width, vp.dom.width(elem.parentNode));
                            }
                        }
                        if (width == 0) {
                            if ((elem.width) && (elem.width.baseVal)) {
                                width = getBaseVal(elem, "width", elem.width);
                            }
                        }
                    }
                    else {
                        //---- give getBBox() priority since FireFox computes text height wrong using getBoundingClientRect ----
                        if (vp.utils.isFireFox && elem.getBBox) {
                            width = elem.getBBox().width;
                        }
                        else if (vp.utils.isSvgDocOrElement(elem)) {
                            //---- SVG document not on FireFox ----
                            if (elem.clientWidth) {
                                //---- svg document on Chrome needs this ----
                                width = elem.clientWidth;
                            }
                            else if (!vp.utils.isFireFox && elem.getBBox) {
                                width = elem.getBBox().width;
                            }
                            else {
                                //---- sometimes we call too early and elem.getBoundingClientRect() gets an "unspecified error" ----
                                try {
                                    width = elem.getBoundingClientRect().width;
                                }
                                catch (ex) {
                                }
                                //---- simplfy this ASAP ----
                                if (width == 0) {
                                    if ((elem.width) && (elem.width.baseVal)) {
                                        width = getBaseVal(elem, "width", elem.width);
                                    }
                                    else {
                                        //---- last resort ----
                                        width = parseFloat(window.getComputedStyle(elem).width);
                                    }
                                }
                                //---- should check this sooner? ----
                                if ((width == 0) || (isNaN(width))) {
                                    width = +elem.getAttribute("width");
                                }
                            }
                        }
                        else {
                            //---- HTML element ----
                            width = elem.offsetWidth;
                        }
                    }
                }
                catch (ex) {
                }
            }
            return width;
        }
        dom.getWidth = getWidth;
        function totalWidth(elem) {
            var width = getWidth(elem);
            //---- add borders ----
            var cs = window.getComputedStyle(elem);
            var bs = parseFloat(cs["borderLeftWidth"]) + parseFloat(cs["borderRightWidth"]);
            width += bs;
            return width;
        }
        dom.totalWidth = totalWidth;
        function totalHeight(elem) {
            var height = getHeight(elem);
            //---- add borders ----
            var cs = window.getComputedStyle(elem);
            var bs = parseFloat(cs["borderTopWidth"]) + parseFloat(cs["borderBottomWidth"]);
            height += bs;
            return height;
        }
        dom.totalHeight = totalHeight;
        function elementSizes(elem) {
            //---- core width/height ----
            var width = getWidth(elem);
            var height = getHeight(elem);
            var cs = window.getComputedStyle(elem);
            //---- margins ----
            var marginWidth = parseFloat(cs["marginLeft"]) + parseFloat(cs["marginRight"]);
            var marginHeight = parseFloat(cs["marginTop"]) + parseFloat(cs["marginBottom"]);
            //---- borders ----
            var borderWidth = parseFloat(cs["borderLeftWidth"]) + parseFloat(cs["borderRightWidth"]);
            var borderHeight = parseFloat(cs["borderTopWidth"]) + parseFloat(cs["borderBottomWidth"]);
            //---- padding ----
            var paddingWidth = parseFloat(cs["paddingLeft"]) + parseFloat(cs["paddingRight"]);
            var paddingHeight = parseFloat(cs["paddingTop"]) + parseFloat(cs["paddingBottom"]);
            var sizes = {
                width: width, height: height,
                marginWidth: marginWidth, marginHeight: marginHeight,
                borderWidth: borderWidth, borderHeight: borderHeight,
                paddingWidth: paddingWidth, paddingHeight: paddingHeight
            };
            return sizes;
        }
        dom.elementSizes = elementSizes;
        function getBaseVal(elem, propName, prop) {
            var value = 0;
            try {
                if ((prop) && (prop.baseVal)) {
                    var unitType = prop.baseVal.unitType;
                    if ((unitType == 1) || (unitType == 5)) {
                        value = prop.baseVal.value;
                    }
                    else if (unitType == 2) {
                        //---- percentage (of parent) ----
                        if ((elem) && (elem.parentNode)) {
                            var pValue = 0;
                            var parent = elem.parentNode;
                            if (vp.utils.isSvgElement(parent)) {
                                pValue = attr(parent, propName);
                            }
                            else if (vp.utils.isCanvasChild(parent)) {
                                pValue = attr(parent, propName);
                            }
                            else {
                                pValue = css(parent, propName);
                            }
                            var factor = prop.baseVal.valueInSpecifiedUnits;
                            value = factor / 100 * pValue;
                        }
                    }
                }
            }
            catch (err) {
            }
            return value;
        }
        dom.getBaseVal = getBaseVal;
        /// return the actual height of the specified element.
        function getHeight(elem) {
            //--- get "height" value ----
            var height = 0;
            if (elem) {
                try {
                    if ((elem == window) || (elem == document)) {
                        height = windowSize().height;
                    }
                    else if (elem.rootContainer) {
                        //---- this is a vueplot canvasContainerElement ----
                        if (elem.rootContainer == elem) {
                            elem = elem.canvas;
                            height = elem.getBoundingClientRect().height;
                        }
                        else {
                            //---- its a canvas 2d/3d lightweight element ----
                            height = elem.getHeight.call(elem);
                        }
                    }
                    else if ((elem.tagName == "svg") && (vp.utils.isFireFox)) {
                        //---- SVG document on FireFox ----
                        if (elem.clientHeight) {
                            //---- svg document on Chrome needs this ----
                            height = elem.clientHeight;
                        }
                        if (height == 0) {
                            if ((elem.style) && (elem.style.height !== undefined)) {
                                height = getCssNumber(elem.style.height, vp.dom.height(elem.parentNode));
                            }
                        }
                        if (height == 0) {
                            if ((elem.height) && (elem.height.baseVal)) {
                                height = getBaseVal(elem, "height", elem.height);
                            }
                        }
                    }
                    else {
                        //---- give getBBox() priority since FireFox computes text height wrong using getBoundingClientRect ----
                        if (vp.utils.isFireFox && elem.getBBox) {
                            height = elem.getBBox().height;
                        }
                        else if (vp.utils.isSvgDocOrElement(elem)) {
                            //---- SVG document not on FireFox ----
                            if (elem.clientHeight) {
                                //---- svg document on Chrome needs this ----
                                height = elem.clientHeight;
                            }
                            else if (!vp.utils.isFireFox && elem.getBBox) {
                                height = elem.getBBox().height;
                            }
                            else {
                                //---- sometimes we call too early and elem.getBoundingClientRect() gets an "unspecified error" ----
                                try {
                                    height = elem.getBoundingClientRect().height;
                                }
                                catch (ex) {
                                }
                                //---- simplfy this ASAP ----
                                if (height == 0) {
                                    if ((elem.height) && (elem.height.baseVal)) {
                                        height = getBaseVal(elem, "height", elem.height);
                                    }
                                    else {
                                        //---- last resort ----
                                        height = parseFloat(window.getComputedStyle(elem).height);
                                    }
                                }
                                //---- should check this sooner? ----
                                if ((height == 0) || (isNaN(height))) {
                                    height = +elem.getAttribute("height");
                                }
                            }
                        }
                        else {
                            //---- HTML element ----
                            height = elem.offsetHeight;
                        }
                    }
                }
                catch (ex) {
                }
            }
            return height;
        }
        dom.getHeight = getHeight;
        function setWidth(elem, value) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                var isSvg = vp.utils.isSvgDocOrElement(elem);
                if (isSvg || vp.utils.isCanvasChild(elem)) {
                    elem.setAttribute("width", value);
                    //---- .css does its own triggerResize() call, but setAttribute does NOT ----
                    vp.events.triggerResize(elem);
                }
                else {
                    if (vp.utils.isNumber(value)) {
                        value = value + "px"; // important to have units specified for HTML elements
                    }
                    css(elem, "width", value);
                }
            }
            else {
                //---- add to current animation object ----
                elem.animation.animateAttr(elem, "width", value, undefined, undefined, undefined, true);
            }
        }
        dom.setWidth = setWidth;
        function setHeight(elem, value) {
            //---- SET value ----
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                {
                    var isSvg = vp.utils.isSvgDocOrElement(elem);
                    if (isSvg || vp.utils.isCanvasChild(elem)) {
                        elem.setAttribute("height", value);
                        //---- .css does its own triggerResize() call, but setAttribute does NOT ----
                        vp.events.triggerResize(elem);
                    }
                    else {
                        if (vp.utils.isNumber(value)) {
                            value = value + "px"; // important to have units specified for HTML elements
                        }
                        css(elem, "height", value);
                    }
                }
            }
            else {
                //---- add to current animation object ----
                elem.animation.animateAttr(elem, "height", value, undefined, undefined, undefined, true);
            }
        }
        dom.setHeight = setHeight;
        function width(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                return getWidth(elem);
            }
            setWidth(elem, value);
        }
        dom.width = width;
        function height(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                return getHeight(elem);
            }
            //---- SET value ----
            setHeight(elem, value);
        }
        dom.height = height;
        function background(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                return css(elem, "background");
            }
            //---- SET value ----
            css(elem, "background", value);
        }
        dom.background = background;
        /// parse a css style string as a number.
        function getCssNumber(cssValueStr, parentValue) {
            //---- can get fancier in future, but see if this basic functionality helps ----
            var value = 0;
            if (cssValueStr != "") {
                value = parseFloat(cssValueStr);
            }
            if (cssValueStr.endsWith("%")) {
                if (vp.utils.isNumber(parentValue)) {
                    //---- base percentage of size/width of parent ----
                    value = (value * parentValue) / 100;
                }
            }
            return value;
        }
        dom.getCssNumber = getCssNumber;
        function center(elem, cx, cy) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("cx", cx);
                elem.setAttribute("cy", cy);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "cx", cx);
                elem.animation.animateAttr(elem, "cy", cy);
            }
        }
        dom.center = center;
        function from(elem, x1, y1) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("x1", x1);
                elem.setAttribute("y1", y1);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "x1", x1);
                elem.animation.animateAttr(elem, "y1", y1);
            }
        }
        dom.from = from;
        function font(elem, family, size, weight, style) {
            if (weight === false) {
                weight = undefined;
            }
            else if (weight === true) {
                weight = "bold";
            }
            if (style === false) {
                style = undefined;
            }
            else if (style === true) {
                style = "italic";
            }
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("font-family", family);
                elem.setAttribute("font-size", size);
                if (weight != undefined) {
                    elem.setAttribute("font-weight", weight);
                }
                if (style != undefined) {
                    elem.setAttribute("font-style", style);
                }
            }
            else {
                //---- add to current animation ----
                this.animation.animateAttr(elem, "font-family", family);
                this.animation.animateAttr(elem, "font-size", size);
                if (weight != undefined) {
                    this.animation.animateAttr(elem, "font-weight", weight);
                }
                if (style != undefined) {
                    this.animation.animateAttr(elem, "font-style", style);
                }
            }
        }
        dom.font = font;
        function to(elem, x2, y2) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("x2", x2);
                elem.setAttribute("y2", y2);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "x2", x2);
                elem.animation.animateAttr(elem, "y2", y2);
            }
        }
        dom.to = to;
        function translate(elem, x, y, makeCrispGroup, makeCrispRoot) {
            if (makeCrispRoot) {
                //---- adjust the offset so that the group is a round number offset within the HTML document ----
                var result = vp.utils.getRootCrispTranslate(elem, x, y);
                x = result.x;
                y = result.y;
            }
            else if (makeCrispGroup) {
                //---- round the translation for child groups ----
                x = Math.round(x);
                y = Math.round(y);
            }
            transform(elem, "translate(" + x + "," + y + ")");
        }
        dom.translate = translate;
        function transform(elem, strTransform) {
            if (arguments.length == 1) {
                var value = undefined;
                if (vp.utils.isSvgDocOrElement(elem)) {
                    value = elem.getAttribute("transform");
                }
                else if (vp.utils.isCanvasChild(elem)) {
                    value = elem.getTransform();
                }
                else if (vp.utils.isDefined(elem.style.transform)) {
                    value = elem.style.transform;
                }
                else if (vp.utils.isDefined(elem.style.msTransform)) {
                    value = elem.style.msTransform;
                }
                else if (vp.utils.isDefined(elem.style.webkitTransform)) {
                    value = elem.style.webkitTransform;
                }
                else if (vp.utils.isDefined(elem.style.MozTransform)) {
                    value = elem.style.MozTransform;
                }
                return value;
            }
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                if (vp.utils.isSvgDocOrElement(elem)) {
                    elem.setAttribute("transform", strTransform);
                }
                else if (vp.utils.isCanvasChild(elem)) {
                    elem.setTransform(strTransform);
                }
                else if (vp.utils.isDefined(elem.style.transform)) {
                    elem.style.transform = strTransform;
                }
                else if (vp.utils.isDefined(elem.style.msTransform)) {
                    elem.style.msTransform = strTransform;
                }
                else if (vp.utils.isDefined(elem.style.webkitTransform)) {
                    elem.style.webkitTransform = strTransform;
                }
                else if (vp.utils.isDefined(elem.style.MozTransform)) {
                    elem.style.MozTransform = strTransform;
                }
            }
            else {
                //---- add to current animation ----
                //---- TODO: add support for transform here ----
                elem.animation.animateAttr(elem, "transform", strTransform);
            }
        }
        dom.transform = transform;
        function transformOrigin(elem, value) {
            if (arguments.length === 0) {
                return elem.getAttribute("transforOrigin");
            }
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                if (vp.utils.isSvgDocOrElement(elem)) {
                    elem.setAttribute("transformOrigin", value);
                }
            }
            else {
                //---- add to current animation ----
                //---- TODO: add support for transform here ----
                elem.animation.animateAttr(elem, "transformOrigin", value);
            }
        }
        dom.transformOrigin = transformOrigin;
        function position(elem, x, y) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("x", x);
                elem.setAttribute("y", y);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "x", x);
                elem.animation.animateAttr(elem, "y", y);
            }
        }
        dom.position = position;
        function absPosition(elem, left, top) {
            css(elem, "position", "absolute");
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                css(elem, "left", left);
                css(elem, "top", top);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "left", left, undefined, undefined, undefined, true);
                elem.animation.animateAttr(elem, "top", top, undefined, undefined, undefined, true);
            }
        }
        dom.absPosition = absPosition;
        /// private
        function isSizeName(name) {
            var isSizeName = ((name == "width") || (name == "height") || (name == "radius"));
            return isSizeName;
        }
        dom.isSizeName = isSizeName;
        function attr(elem, name, value, disableAnim) {
            if (arguments.length == 2) {
                //---- GET value ----
                if (elem) {
                    var needGetAttr = true;
                    if ((elem.control) && (elem.control.getAttribute)) {
                        var isSizeName = isSizeName(name); // CHW: pass name
                        if (!isSizeName) {
                            //---- let control handle the attribute GET ----
                            value = elem.control.getAttribute(name);
                            needGetAttr = false;
                        }
                    }
                    if (needGetAttr) {
                        value = elem.getAttribute(name);
                    }
                }
                return value;
            }
            //---- SET value ----
            var origValue = value;
            if (typeof origValue === "function") {
                value = origValue(elem.dataItem, elem.dataIndex);
            }
            //if (name == "opacity" && +value == 0)
            //{
            //    var a = 4242;
            //}
            //---- if attribute is not animatable, we need to apply now ----
            var isAttrAnimatable = ((!disableAnim) && (isPropertyAnimatable(name)));
            if ((vp.utils.isUndefined(elem.animation)) || (!isAttrAnimatable)) {
                var needSetAttr = true;
                //---- no animation is active - just set in instantly ----
                if ((elem.control) && (elem.control.setAttribute)) {
                    var isSizeName = isSizeName(name);
                    if (!isSizeName) {
                        if (value + "" === "NaN") {
                            //---- help  debug case where font-family get sets to "Nan" ----
                            var a = 9;
                        }
                        //---- let control handle the attribute SET ----
                        elem.control.setAttribute(name, value);
                        needSetAttr = false;
                    }
                }
                if (needSetAttr) {
                    if (value + "" === "NaN") {
                        var a = 9;
                        vp.utils.error("Error: cannot set attr value to NaN: " + name);
                    }
                    elem.setAttribute(name, value);
                }
                if ((name == "width") || (name == "height") || (name == "radius")) {
                    vp.events.triggerResize(elem);
                }
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, name, value);
            }
        }
        dom.attr = attr;
        function attrNS(elem, ns, name, value) {
            if (arguments.length == 3) {
                //---- GET value ----
                value = elem.getAttributeNS(ns, name);
                return value;
            }
            //---- SET value ----
            var origValue = value;
            if (typeof origValue === "function") {
                value = origValue(elem.dataItem, elem.dataIndex);
            }
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttributeNS(ns, name, value);
            }
            else {
                //---- add to current animation ----
                //---- TODO: pass "ns" along to animation... ----
                elem.animation.animateAttr(elem, name, value);
            }
        }
        dom.attrNS = attrNS;
        function href(elem, value) {
            //---- if element has this defined - call it instead ----
            if (vp.utils.isFunction(elem.hrefOverride)) {
                return elem.hrefOverride(value);
            }
            else {
                if (arguments.length == 1) {
                    if (vp.utils.isSvgDocOrElement(elem)) {
                        value = attrNS(elem, "http://www.w3.org/1999/xlink", "href");
                    }
                    else {
                        value = elem.getAttribute("href");
                    }
                    return value;
                }
                if (vp.utils.isSvgDocOrElement(elem)) {
                    attrNS(elem, "http://www.w3.org/1999/xlink", "href", value);
                }
                else {
                    elem.setAttribute("href", value);
                }
            }
        }
        dom.href = href;
        function prop(elem, name, value) {
            if (arguments.length == 2) {
                //---- GET value ----
                value = elem[name];
                return value;
            }
            //---- SET value ----
            var origValue = value;
            if (typeof origValue === "function") {
                value = origValue(elem.dataItem, elem.dataIndex);
            }
            //---- animation NOT supported for custom properties (most of them we do NOT want animated) ----
            if (true) {
                //---- no animation is active - just set in instantly ----
                elem[name] = value;
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, name, value);
            }
        }
        dom.prop = prop;
        //---- todo: we should probably only define one of these and zap the other one ---
        dom.customAttr = prop;
        /// get/set the "opacity" css property on the item.
        function opacity(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = (elem.rootContainer) ? elem.opacity : elem.style.opacity;
                return value;
            }
            else {
                //---- SET value ----
                if (vp.utils.isUndefined(elem.animation)) {
                    //---- no animation is active - just set in instantly ----
                    if (elem.rootContainer) {
                        elem.opacity = value;
                    }
                    else {
                        elem.style.opacity = value;
                    }
                }
                else {
                    //---- add to current animation ----
                    elem.animation.animateAttr(elem, "opacity", value, undefined, undefined, undefined, true);
                }
            }
        }
        dom.opacity = opacity;
        /// get/set the "checked" property on the item.
        function checked(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.checked;
            }
            else {
                //---- SET value ----
                elem.checked = value;
            }
            return value;
        }
        dom.checked = checked;
        function removeAttribute(elem, name) {
            elem.removeAttribute(name);
        }
        dom.removeAttribute = removeAttribute;
        function removeProp(elem, name) {
            return delete elem[name];
        }
        dom.removeProp = removeProp;
        function id(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.getAttribute("id");
                return value;
            }
            else {
                //---- SET value ----
                elem.setAttribute("id", value);
            }
        }
        dom.id = id;
        function toolTipEnabled(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.toolTipEnabled;
                return value;
            }
            else {
                //---- SET value ----
                elem.toolTipEnabled = value;
            }
        }
        dom.toolTipEnabled = toolTipEnabled;
        function getClass(elem) {
            var name = "";
            if ((vp.utils.isSvgDocOrElement(elem)) && (elem.getAttribute)) {
                name = elem.getAttribute("class");
            }
            else {
                name = elem.className;
            }
            if (name == null) {
                name = "";
            }
            else if (name.baseVal) {
                //---- chrome ----
                name = name.baseVal;
            }
            return name;
        }
        dom.getClass = getClass;
        /// sets the class name of the element to just the specified name.
        function setClass(elem, name) {
            if ((vp.utils.isSvgDocOrElement(elem)) && (elem.getAttribute)) {
                elem.setAttribute("class", name);
            }
            else {
                elem.className = name;
            }
        }
        dom.setClass = setClass;
        /// add the specified class name to the element, if it doesn't already have it.
        function addClass(elem, name) {
            if (!hasClass(elem, name)) {
                var cnBefore = getClass(elem);
                var newName = "";
                if (cnBefore == "") {
                    newName = name;
                }
                else {
                    newName = cnBefore + " " + name;
                }
                setClass(elem, newName);
            }
        }
        dom.addClass = addClass;
        /// returns true if the element has the specified class name.
        function hasClass(elem, name) {
            var hasIt = false;
            var cn = getClass(elem);
            if ((cn == name) || (cn.startsWith(name + " ")) || (cn.endsWith(" " + name)) || (cn.contains(" " + name + " "))) {
                hasIt = true;
            }
            return hasIt;
        }
        dom.hasClass = hasClass;
        /// removes the specified class name from the element, if it is found in it.
        function removeClass(elem, name) {
            var cn = getClass(elem);
            var nameLen = name.length;
            var newcn = cn;
            if (cn == name) {
                newcn = "";
            }
            else {
                var index = (cn.indexOf(" " + name + " "));
                if (index > -1) {
                    newcn = cn.substring(0, index) + cn.substring(index + nameLen + 1);
                }
                else {
                    if (cn.endsWith(" " + name)) {
                        var len = cn.length - (nameLen + 1);
                        newcn = cn.substring(0, len);
                    }
                    else if (cn.startsWith(name + "")) {
                        newcn = cn.substring(name.length + 1);
                    }
                }
            }
            if (newcn != cn) {
                setClass(elem, newcn);
            }
        }
        dom.removeClass = removeClass;
        /// if the class name is found in the element, it is removed.  otherwise, it is added.
        function toggleClass(elem, name) {
            if (hasClass(elem, name)) {
                removeClass(elem, name);
            }
            else {
                addClass(elem, name);
            }
        }
        dom.toggleClass = toggleClass;
        /// if the class name is found in the element, it is removed.  otherwise, it is added.
        function tabIndex(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.getAttribute(elem, "tabIndex");
                return value;
            }
            else {
                //---- SET value ----
                var actualValue = value;
                if (typeof value === "function") {
                    actualValue = value(elem.dataItem, elem.dataIndex);
                }
                elem.setAttribute("tabIndex", value);
            }
        }
        dom.tabIndex = tabIndex;
        /// get/set the "text" property on the element.
        function text(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.textContent;
                return value;
            }
            else {
                //---- SET value ----
                var actualValue = value;
                if (typeof value === "function") {
                    actualValue = value(elem.dataItem, elem.dataIndex);
                }
                elem.textContent = actualValue;
            }
        }
        dom.text = text;
        /// return the "title" child, if any, for the element.
        function getTitleChild(elem) {
            var title = null;
            for (var i = 0; i < elem.childNodes.length; i++) {
                var child = elem.childNodes[i];
                if (child.tagName == "title") {
                    title = child;
                    break;
                }
            }
            return title;
        }
        dom.getTitleChild = getTitleChild;
        /// get/set the "title" property on the element (standard tooltip).
        function title(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = null;
                if (vp.utils.isSvgElement(elem)) {
                    var title = getTitleChild(elem);
                    if (title) {
                        value = title.textContent;
                    }
                }
                else if (elem.getAttribute) {
                    value = elem.getAttribute("title");
                }
                return value;
            }
            else {
                //---- SET value ----
                var actualValue = value;
                if (typeof value === "function") {
                    actualValue = value(elem.dataItem, elem.dataIndex);
                }
                if (vp.utils.isSvgElement(elem)) {
                    var title = getTitleChild(elem);
                    if (!title) {
                        title = vp.dom.createSvg("title");
                        elem.appendChild(title);
                    }
                    title.textContent = value;
                }
                else {
                    elem.setAttribute("title", actualValue);
                }
            }
        }
        dom.title = title;
        function html(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.innerHTML;
                return value;
            }
            else {
                //---- SET value ----
                var actualValue = value;
                if (typeof value === "function") {
                    actualValue = value(elem.dataItem, elem.dataIndex);
                }
                elem.innerHTML = actualValue;
            }
        }
        dom.html = html;
        /// get/set the "value" property on the element.
        function value(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.value;
                return value;
            }
            else {
                //---- SET value ----
                var actualValue = value;
                if (typeof value === "function") {
                    actualValue = value(elem.dataItem, elem.dataIndex);
                }
                elem.value = actualValue;
            }
        }
        dom.value = value;
        /** remove all childNodes or children of the element. */
        function clear(element) {
            if (vp.utils.isCanvasChild(element)) {
                element.clear();
            }
            else if (vp.utils.isCanvasContainer(element)) {
                element.clear();
            }
            else if (element.childNodes) {
                while (element.childNodes.length > 0) {
                    element.removeChild(element.firstChild);
                }
            }
        }
        dom.clear = clear;
        /// remove the element from its parent.
        function remove(element) {
            var parentNode = element.parentNode;
            if (parentNode != null) {
                parentNode.removeChild(element);
            }
        }
        dom.remove = remove;
        /// hide an element.
        function hide(elem) {
            visibility(elem, "hidden");
        }
        dom.hide = hide;
        /// collapse an element.
        function collapse(elem) {
            //vp.visibility(elem, "collapse");
            css(elem, "display", "none");
        }
        dom.collapse = collapse;
        /// uncollapse an element.
        function expand(elem) {
            //vp.visibility(elem, "collapse");
            css(elem, "display", "block");
        }
        dom.expand = expand;
        /// show an element.
        function show(elem, showIt) {
            if (showIt === false) {
                visibility(elem, "hidden");
            }
            else {
                visibility(elem, "visible");
            }
        }
        dom.show = show;
        function visibility(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                if (elem.rootContainer == elem) {
                    value = elem.canvas.style.visibility;
                }
                else if (elem.rootContainer) {
                    //---- its a canvas lightweight element ----
                    value = elem.visibility;
                }
                else {
                    //---- normal HTML/SVG element ----
                    value = elem.style.visibility;
                }
                return value;
            }
            //---- SET value ----
            if (elem.rootContainer == elem) {
                elem.canvas.style.visibility = value;
            }
            else if (elem.rootContainer) {
                //---- its a canvas lightweight element ----
                elem.visibility = value;
            }
            else {
                //---- normal HTML/SVG element ----
                elem.style.visibility = value;
            }
        }
        dom.visibility = visibility;
        /// toggle an element between hidden and visible
        function showToggle(elem) {
            var vis = visibility(elem);
            if ((vis == "") || (vis == "visible")) {
                visibility(elem, "collapse");
            }
            else {
                visibility(elem, "visible");
            }
        }
        dom.showToggle = showToggle;
        function isPropertyAnimatable(name) {
            var nonAnimators = ["title", "d", "font-family", "cursor", "stroke-dasharray", "text-anchor", "shape-rendering",
                "text-rendering", "stroke-linecap"];
            var isAnimatable = (nonAnimators.indexOf(name) == -1);
            return isAnimatable;
        }
        /// get/set single CSS style property.
        function css(elem, prop, value) {
            if (elem.canvas) {
                elem = elem.canvas;
            }
            else if (elem.rootContainer) {
                //---- if child of a canvas, use the getAttribute/setAttribute functions for all properties ----
                return attr(elem, prop, value);
            }
            //---- is this still needed?  7/21/2014 - roland.  It messes up "stroke-dasharray" on IE (and others?) ----
            //---- provide translation from prop names like "short-shape" to "shortShape" for Firefox ----
            //var index = prop.indexOf('-');
            //while (index > -1)
            //{
            //    prop = prop.substr(0, index) + prop.substr(index + 1, 1).toUpperCase() + prop.substr(index + 2);
            //    index = prop.indexOf('-');
            //}
            if (arguments.length == 2) {
                //---- GET value ----
                if (prop == "width") {
                    value = getWidth(elem);
                }
                else if (prop == "height") {
                    value = getHeight(elem);
                }
                else {
                    value = elem.style[prop];
                }
                return value;
            }
            if (name == "fill") {
                var aaa = 999;
            }
            //---- if attribute is not animatable, we need to apply now ----
            var isAttrAnimatable = isPropertyAnimatable(prop);
            //---- SET value ----
            if ((vp.utils.isUndefined(elem.animation)) || (!isAttrAnimatable)) {
                //---- set it directly ----
                if (vp.utils.isNumber(value)) {
                    if ((prop != "z-index") && (prop != "zIndex") && (prop != "opacity")) {
                        value += "px";
                    }
                }
                if ((prop == "height") && (value) && (value.startsWith("0"))) {
                    var dummmy = 9;
                }
                if (value + "" === "NaN") {
                    //---- help  debug case where font-family get sets to "Nan" ----
                    var a = 23;
                }
                elem.style[prop] = value;
                if ((prop == "width") || (prop == "height") || (prop == "radius")) {
                    vp.events.triggerResize(elem);
                }
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, prop, value, undefined, undefined, undefined, true);
            }
        }
        dom.css = css;
        function parent(elem) {
            var parent = null;
            if (elem.parentNode) {
                parent = elem.parentNode;
            }
            return parent;
        }
        dom.parent = parent;
        function children(parentElem, includeAll) {
            var kids = [];
            if ((parentElem.tagName == "CANVAS") && (parentElem.canvasContainerElement)) {
                parentElem = parentElem.canvasContainerElement;
            }
            if ((parentElem.ctr == "vp.dom.selectedSet") || (parentElem.ctr == "vp.canvas.canvasSelectedSet")) {
                for (var i = 0; i < parentElem.length; i++) {
                    var hisKids = children(parentElem[i]);
                    kids = kids.concat(hisKids);
                }
            }
            else if (parentElem.ctr == "vp.singleWrapper") {
                kids = children(parentElem.elem);
            }
            else if (parentElem.children) {
                kids = parentElem.children;
            }
            else if (parentElem.childNodes) {
                //---- SVG document ----
                kids = parentElem.childNodes;
            }
            //---- convert from HTML Collection to array, if needed ----
            if (!vp.utils.isArray(kids)) {
                var collect = kids;
                kids = [];
                for (var i = 0; i < collect.length; i++) {
                    kids.push(collect[i]);
                }
            }
            //---- include indirect children, if specified ----
            if (includeAll) {
                for (var i = 0; i < kids.length; i++) {
                    var ikids = children(kids[i]);
                    kids = kids.concat(ikids);
                }
            }
            return kids;
        }
        dom.children = children;
        function childNodes(parentElem, includeAll) {
            var kids = [];
            if ((parentElem.tagName == "CANVAS") && (parentElem.canvasContainerElement)) {
                parentElem = parentElem.canvasContainerElement;
            }
            if ((parentElem.ctr == "vp.dom.selectedSet") || (parentElem.ctr == "vp.canvas.canvasSelectedSet")) {
                for (var i = 0; i < parentElem.length; i++) {
                    var hisKids = childNodes(parentElem[i]);
                    kids = kids.concat(hisKids);
                }
            }
            else if (parentElem.ctr == "vp.singleWrapper") {
                kids = childNodes(parentElem.elem);
            }
            else if (parentElem.childNodes) {
                kids = parentElem.childNodes;
            }
            //---- convert from HTML Collection to array, if needed ----
            if (!vp.utils.isArray(kids)) {
                var collect = kids;
                kids = [];
                for (var i = 0; i < collect.length; i++) {
                    kids.push(collect[i]);
                }
            }
            //---- include indirect children, if specified ----
            if (includeAll) {
                for (var i = 0; i < kids.length; i++) {
                    var ikids = childNodes(kids[i]);
                    kids = kids.concat(ikids);
                }
            }
            return kids;
        }
        dom.childNodes = childNodes;
        function bounds(elem, x, y, width, height, makeCrisp) {
            if (makeCrisp) {
                //---- round bounds ----
                x = Math.round(x);
                y = Math.round(y);
                width = Math.round(width);
                height = Math.round(height);
            }
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                if (height === undefined) {
                    //---- for circle-types ----
                    elem.setAttribute("cx", x);
                    elem.setAttribute("cy", y);
                    elem.setAttribute("r", width);
                }
                else {
                    if (vp.utils.isSvgDocOrElement(elem) || vp.utils.isCanvasChild(elem)) {
                        elem.setAttribute("x", x);
                        elem.setAttribute("y", y);
                        elem.setAttribute("width", width);
                        elem.setAttribute("height", height);
                    }
                    else {
                        css(elem, "left", x);
                        css(elem, "top", y);
                        css(elem, "width", width);
                        css(elem, "height", height);
                    }
                }
            }
            else {
                //---- add to current animation ----
                if (height === undefined) {
                    //---- for circle-types ----
                    elem.animation.animateAttr(elem, "cx", x);
                    elem.animation.animateAttr(elem, "cy", y);
                    elem.animation.animateAttr(elem, "r", width);
                }
                else {
                    if (vp.utils.isSvgDocOrElement(elem) || vp.utils.isCanvasChild(elem)) {
                        elem.animation.animateAttr(elem, "x", x);
                        elem.animation.animateAttr(elem, "y", y);
                        elem.animation.animateAttr(elem, "width", width);
                        elem.animation.animateAttr(elem, "height", height);
                    }
                    else {
                        elem.animation.animateAttr(elem, "left", x, undefined, undefined, undefined, true);
                        elem.animation.animateAttr(elem, "top", y, undefined, undefined, undefined, true);
                        elem.animation.animateAttr(elem, "width", width, undefined, undefined, undefined, true);
                        elem.animation.animateAttr(elem, "height", height, undefined, undefined, undefined, true);
                    }
                }
            }
        }
        dom.bounds = bounds;
        function colors(elem, fill, stroke, strokeWidth) {
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                if (fill !== undefined) {
                    elem.setAttribute("fill", fill);
                }
                if (stroke !== undefined) {
                    elem.setAttribute("stroke", stroke);
                }
                if (strokeWidth != undefined) {
                    elem.setAttribute("stroke-width", strokeWidth);
                }
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "fill", fill);
                elem.animation.animateAttr(elem, "stroke", stroke);
                elem.animation.animateAttr(elem, "strokeWidth", strokeWidth);
            }
        }
        dom.colors = colors;
        function addStop(brush, offset, color, opacity) {
            var ss = "stop-color: " + color;
            if (opacity != null) {
                ss += "; stop-opacity: " + opacity;
            }
            if (vp.utils.isUndefined(brush.animation)) {
                //---- no animation is active - just set in instantly ----
                var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", offset);
                stop.setAttribute("style", ss);
                brush.appendChild(stop);
            }
            else {
            }
        }
        dom.addStop = addStop;
        function dataItem(elem, value) {
            if (arguments.length == 1) {
                return elem.dataItem;
            }
            elem.dataItem = value;
        }
        dom.dataItem = dataItem;
        function dataIndex(elem, value) {
            if (arguments.length == 1) {
                return elem.dataIndex;
            }
            elem.dataIndex = value;
        }
        dom.dataIndex = dataIndex;
        function animate(elem, duration, ease, container, delay) {
            var anyElem = elem;
            if (duration) {
                //---- store the animation object on the element so it can be retreived later, if needed ----
                anyElem.animation = new vp.animation.animationClass(elem, duration, ease, container, delay);
            }
            else {
                delete anyElem.animation; // mark it as not animating, so we set attributes, etc. directly
            }
        }
        dom.animate = animate;
        function onAnimationComplete(elem, completedFunc) {
            elem.animation.onAnimationComplete(completedFunc);
        }
        dom.onAnimationComplete = onAnimationComplete;
        function frameRateChanged(elem, callBack) {
            elem.frameRateChanged = callBack;
        }
        dom.frameRateChanged = frameRateChanged;
        function radius(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.getAttribute("radius");
                return value;
            }
            //---- SET value ----
            if (vp.utils.isUndefined(elem.animation)) {
                //---- no animation is active - just set in instantly ----
                elem.setAttribute("radius", value);
            }
            else {
                //---- add to current animation ----
                elem.animation.animateAttr(elem, "radius", value);
            }
        }
        dom.radius = radius;
        function returnFalse() {
            return false;
        }
        dom.returnFalse = returnFalse;
        function dataPair(elem, dataItem, dataIndex) {
            elem.dataItem = dataItem;
            elem.dataIndex = dataIndex;
        }
        dom.dataPair = dataPair;
        function focus(elem) {
            elem.focus();
        }
        dom.focus = focus;
        function dataId(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.dataItem.dataId;
                return value;
            }
            //---- SET value ----
            elem.dataItem.dataId = value;
        }
        dom.dataId = dataId;
        function shapeId(elem, value) {
            if (arguments.length == 1) {
                //---- GET value ----
                value = elem.dataItem.shapeId;
                return value;
            }
            //---- SET value ----
            elem.dataItem.shapeId = value;
        }
        dom.shapeId = shapeId;
        /* This sets the attributes on the line element "elem" to make it a vertical line.  If "makeCrisp"
           is set to true, and the stroke-width is set to an odd whole number, the line is drawn "crisp",
           without antialiasing. */
        function vLine(elem, y1, y2, x, makeCrisp) {
            if (makeCrisp) {
                //---- NOTE: this code assumes that a parent elelment has offset our points to .5, .5 boundaries, relatative to the HTML document ----
                attr(elem, "shape-rendering", "crispEdges");
                y1 = .5 + Math.floor(y1);
                y2 = .5 + Math.floor(y2);
                x = Math.round(x); // this one does not get a .5 offset here
            }
            //---- SET value ----
            attr(elem, "y1", y1);
            attr(elem, "y2", y2);
            attr(elem, "x1", x);
            attr(elem, "x2", x);
        }
        dom.vLine = vLine;
        /* This sets the attributes on the line element "elem" to make it a horizontal line.  If "makeCrisp"
           is set to true, and the stroke-width is set to an odd whole number, the line is drawn "crisp",
           without antialiasing. */
        function hLine(elem, x1, x2, y, makeCrisp) {
            if (makeCrisp) {
                //---- NOTE: this code assumes that our parent groups/documents are all rounded to whole numbers ----
                attr(elem, "shape-rendering", "crispEdges");
                /// Rule from experiments/svgCrispLines.html:
                ///   - for horizontal lines, X=rounded, Y=.5+rounded
                x1 = .5 + Math.floor(x1);
                x2 = .5 + Math.floor(x2);
                y = Math.round(y);
            }
            //---- SET value ----
            attr(elem, "y1", y);
            attr(elem, "y2", y);
            attr(elem, "x1", x1);
            attr(elem, "x2", x2);
        }
        dom.hLine = hLine;
        /// used to temp. disable HTML element selection by the user with mouse/touch
        /// during a control's dragging operation.
        function enableElementSelection(elem, enable) {
            if (enable) {
                if (vp.utils.isDefined(elem.onselectstart)) {
                    elem.onselectstart = null;
                }
                else if (vp.utils.isDefined(elem.style.MozUserSelect)) {
                    //---- restore default of "text" ----
                    elem.style.MozUserSelect = "text";
                }
                else if (elem.onmousedown == returnFalse) {
                    elem.onmousedown = null;
                }
            }
            else {
                if (vp.utils.isDefined(elem.onselectstart)) {
                    elem.onselectstart = returnFalse;
                }
                else if (vp.utils.isDefined(elem.style.MozUserSelect)) {
                    elem.style.MozUserSelect = "none";
                }
                else {
                    //---- caution: this could break other things ----
                    elem.onmousedown = returnFalse;
                }
            }
        }
        dom.enableElementSelection = enableElementSelection;
        /// returns the scroll offset for the HTML page.  This value is in pixels from the document origin.
        /// verified correct by roland on 6/21/2013 on Windows 8 for: IE10, Chrome 27, and FireFox 21.0.
        function getBodyScroll() {
            return { x: window.pageXOffset, y: window.pageYOffset };
        }
        dom.getBodyScroll = getBodyScroll;
        /// gets the {left,top} offset of the HTML/SVG/Canvas element from the document origin.
        /// verified correct by roland on 5/12/2012 on Windows 7 for: IE9, Chrome 18.0, and FireFox 11.0.
        /// testing included HMTL document, HTML element, SVG doc, SVG element, Canvas 2d doc, Canvas 2d elem,
        /// Canvas 3d doc, Canvas 3d elem.
        function docOffset(elem) {
            var left = 0;
            var top = 0;
            var origElem = elem;
            //---- walk up the parent hierarchy until we hit a real HTML element ----
            while ((elem) && (elem != document.body)) {
                if ((elem.rootContainer) && (elem.rootContainer == elem)) {
                    elem = elem.canvas;
                }
                if (elem.rootContainer) {
                    //---- its a canvas 2d/3d lightweight element ----
                    var offset = elem.getOffset();
                    left += offset.x;
                    top += offset.y;
                }
                else if ((elem.tagName == "svg") && (!vp.utils.isIE)) {
                    //---- special handling for SVG document for Chrome/FireFox ----
                    //---- these browsers do wierd things when a viewBox is set on the SVG document, so we use this workaround ----
                    if (vp.utils.isFireFox) {
                        //---- FireFox ----
                        //var rc = elem.getBoundingClientRect();
                        // problem: getBoundingClinetRect() varies with viewBox on svgdoc, so it is not simple to use.
                        // as our workaround, we use elem.getBBox() for parent offset and then the location of the parent.
                        var vb = elem.viewBox;
                        if ((vb) && (vb.baseVal) && (vb.baseVal.width > 0) && (vb.baseVal.height > 0)) {
                            //---- viewbox is active ----
                            //---- add offset to parent ----
                            var box = elem.getBBox();
                            left += box.x;
                            top += box.y;
                            //---- wait - getBBox() is measured from outside box of parent (not content); so we need to ----
                            //---- adjust by adding the left/top margin and the left/top border size (yuck) ----
                            left -= getCssNumber(elem.parentNode.style.marginLeft);
                            left -= getCssNumber(elem.parentNode.style.borderLeft);
                            top -= getCssNumber(elem.parentNode.style.marginTop);
                            top -= getCssNumber(elem.parentNode.style.borderTop);
                        }
                        else {
                            //---- viewbox is inactive ----
                            var rc = elem.getBoundingClientRect();
                            left += rc.left;
                            top += rc.top;
                            //---- this stuff is really strange; now we seem to need to offset it by getBBox() ----
                            var bb = elem.getBBox();
                            left -= bb.x;
                            top -= bb.y;
                            break;
                        }
                    }
                    else {
                        //---- Chrome ----
                        if (vp.utils.isDefined(elem.offsetLeft)) {
                            //---- this fixes "mouse" and "panAndZoom" samples for Chrome, but more adjustments may be needed ----
                            //---- we also need to work for "stdChart" bar selection dragging ----
                            //---- as a temp workaround, use 2 code paths (one for active viewBox, one for other case) ----
                            var vb = elem.viewBox;
                            if ((vb) && (vb.baseVal) && (vb.baseVal.width > 0) && (vb.baseVal.height > 0)) {
                                //---- viewbox is active ----
                                left += elem.offsetLeft;
                                top += elem.offsetTop;
                                break;
                            }
                            else {
                                //---- viewbox is inactive ----
                                var rc = elem.getBoundingClientRect();
                                left += rc.left;
                                top += rc.top;
                                break;
                            }
                        }
                    }
                }
                else {
                    //---- HTML element ----
                    //---- "modern browser" assumption - we rely on getBoundClientRect() to do the hard work ----
                    var rc = elem.getBoundingClientRect();
                    left += rc.left;
                    top += rc.top;
                    break;
                }
                elem = elem.parentNode;
            }
            //---- must always add the scroll offset of the body ----
            var bs = getBodyScroll();
            left += bs.x;
            top += bs.y;
            return { left: left, top: top };
        }
        dom.docOffset = docOffset;
        function textBaseline(textElem, alignType, rc) {
            if (textBaseline instanceof vp.canvas.canvasTextElement) {
                textElem.setAttribute("textBaseline", alignType);
            }
            else {
                var delta = computeTextBaselineDelta(textElem, alignType);
                //---- animate if needed by using "attr" ----
                //textElem.setAttribute("dy", delta);
                vp.dom.attr(textElem, "dy", delta + "");
            }
        }
        dom.textBaseline = textBaseline;
        function computeTextBaselineDelta(textElem, alignType) {
            var yPos = +textElem.getAttribute("y");
            yPos += +textElem.getAttribute("dy");
            var rc = vp.dom.getBounds(textElem); //.getBBox();
            var yCorrection = yPos - rc.top;
            var height = rc.height;
            var delta = 0;
            if (alignType == "top") {
                //---- align TOP ----
                delta = yCorrection;
            }
            else if (alignType == "bottom") {
                //---- align BOTTOM ----
                delta = yCorrection - height;
            }
            else if (alignType == "middle") {
                //---- align BOTTOM ----
                delta = yCorrection - height / 2;
            }
            return delta;
        }
        dom.computeTextBaselineDelta = computeTextBaselineDelta;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// styleSheet.ts.  Copyright (c) 2014 Microsoft Corporation.
///                part of the vuePlot library - misc utility functions.
///
///     - adapted from code on the web.  Need URL...
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dom;
    (function (dom) {
        var styleSheetClass = (function () {
            function styleSheetClass(innerText) {
                //---- local state ----
                this._styleSheet = null;
                this._elem = null;
                this._elem = document.createElement('style');
                this._elem.type = 'text/css';
                if (innerText) {
                    this._elem.innerHTML = innerText;
                }
                //---- append to document <head> section ----
                var head0 = document.getElementsByTagName('head')[0];
                head0.appendChild(this._elem);
                //---- elem is not the final sheet object, so get the newly created sheet ----
                this._styleSheet = document.styleSheets[document.styleSheets.length - 1];
                //if (innerText)
                //{
                //    this._styleSheet.innerText = innerText;
                //}
            }
            //---- add a rule to this style sheet ----
            styleSheetClass.prototype.addRule = function (selector, style) {
                var myRules = this._styleSheet.rules || this._styleSheet.cssRules;
                var atIndex = myRules.length;
                this._styleSheet.insertRule(selector + ' {' + style + '}', atIndex);
                return this;
            };
            //---- remove this style sheet from the document
            styleSheetClass.prototype.remove = function () {
                this._styleSheet.remove();
                return this;
            };
            styleSheetClass.prototype.sheet = function () {
                return this._styleSheet;
            };
            /// propety: id
            styleSheetClass.prototype.id = function (value) {
                if (arguments.length === 0) {
                    return vp.dom.id(this._elem);
                }
                vp.dom.id(this._elem, value);
                return this;
            };
            return styleSheetClass;
        })();
        dom.styleSheetClass = styleSheetClass;
        function createStyleSheet(innerText) {
            return new styleSheetClass(innerText);
        }
        dom.createStyleSheet = createStyleSheet;
    })(dom = vp.dom || (vp.dom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// formatters.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlot library 
///   - defines a set of chart label formatting functions
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var formatters;
    (function (formatters) {
        var THOUSAND_SEPARATOR = ",";
        // TODO (07/28/2014): add "_locale" to "comma" and other formatting functions, to ease formatting override by clients.
        //var _locale: string = undefined;
        //export function locale(): string;
        //export function locale(value: string): any;
        //export function locale(value?: string): any
        //{
        //    if (arguments.length == 0)
        //    {
        //        return _locale;
        //    }
        //    _locale = value;
        //    return this;
        //}
        /// format a number nicely (shortest decimal possible, add commas for thousands).
        function comma(value, numDecimalPlaces, forceDecimalPlaces, removeLeadingSingleZero) {
            if (numDecimalPlaces === undefined) {
                numDecimalPlaces = 2;
            }
            //---- convert to a number, if possible ----
            var num = parseFloat(value);
            if ((vp.utils.isNumber(num)) && (!isNaN(num))) {
                value = num;
                var isWholeNum = (Math.abs(value - Math.round(value)) == 0); // < vp.epsilon);
                if ((!forceDecimalPlaces) && (isWholeNum)) {
                    value = Math.round(value).toString();
                }
                else {
                    //---- ensure "numDecimalPlaces" is a legal value ----
                    numDecimalPlaces = Math.round(numDecimalPlaces);
                    numDecimalPlaces = Math.max(0, Math.min(20, numDecimalPlaces));
                    var isLessThanOne = (Math.abs(value) < 1);
                    if (false) {
                        value = num + ""; // default formatting
                        var index = value.indexOf(".");
                        if (index > 0) {
                            var signifCount = 0;
                            var excessIndex = -1;
                            var firstSignifIndex = -1;
                            var excessCount = 0;
                            //---- remove excess digits after "numDecimalPlaces" ----
                            for (var i = index + 1; i < value.length; i++) {
                                if (value[i] >= "0" && value[i] <= "9") {
                                    //---- its a DIGIT (vs. +E..) ----
                                    if ((value[i] > "0") && (firstSignifIndex == -1)) {
                                        firstSignifIndex = i;
                                    }
                                    if (firstSignifIndex > -1) {
                                        signifCount++;
                                    }
                                    if ((signifCount > numDecimalPlaces) && (excessIndex == -1)) {
                                        excessIndex = i;
                                    }
                                    if (excessIndex > -1) {
                                        excessCount++;
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                            //---- reached end of digits after the "." ----
                            if (excessIndex > -1) {
                                //---- delete digits at "excessIndex" ----
                                value = value.substr(0, excessIndex) + value.substr(excessIndex + excessCount);
                            }
                        }
                    }
                    else {
                        value = value.toFixed(numDecimalPlaces);
                        if ((isLessThanOne) && (removeLeadingSingleZero) && (forceDecimalPlaces)) {
                            value = value.substr(1);
                        }
                        //---- remove extra zeros ----
                        if ((!forceDecimalPlaces) && (value.contains("."))) {
                            var allZeros = (0).toFixed(numDecimalPlaces).substr(1);
                            if (value.endsWith(allZeros)) {
                                var len = value.length - allZeros.length;
                                value = value.substr(0, len);
                            }
                        }
                    }
                }
                //---- add commas, as needed ----
                var parts = value.split('.');
                var left = parts[0];
                var right = (parts.length > 1) ? "." + parts[1] : "";
                var len = left.length;
                //---- don't add commas to 4 digit numbers ----
                if ((len > 4) || (len > 5 && len[0] == "-")) {
                    var startLen = (len % 3) == 0 ? 3 : len % 3;
                    var newLeft = left.substring(0, startLen);
                    for (var i = startLen; i < len; i += 3) {
                        newLeft += THOUSAND_SEPARATOR + left.substring(i, i + 3);
                    }
                    value = newLeft + right;
                }
                //---- look for exception to rule ----
                if (value.startsWith("-,")) {
                    value = "-" + value.substr(2);
                }
            }
            return value;
        }
        formatters.comma = comma;
        // Adds commas as the thousands separator (eg. 1234567.89 will become "1,234,567.89").
        // Exponent format numbers (eg. 6e+29) will NOT be formatted.
        function commaOnly(value) {
            var num = parseFloat(value);
            if ((vp.utils.isNumber(num)) && (!isNaN(num)) && (value.toString().indexOf("e+") == -1)) {
                //---- add commas, as needed ----
                var parts = value.toString().split('.'); // DON'T use 'num' here: we want to preserve any trailing 0's in the mantissa of 'value' [as potentially added by comma()]
                var left = parts[0];
                var right = (parts.length > 1) ? "." + parts[1] : "";
                var len = left.length;
                if (len > 3) {
                    var startLen = (len % 3) == 0 ? 3 : len % 3;
                    var newLeft = left.substring(0, startLen);
                    for (var i = startLen; i < len; i += 3) {
                        newLeft += THOUSAND_SEPARATOR + left.substring(i, i + 3);
                    }
                    value = newLeft + right;
                    //---- avoid "-," problem ----
                    if (value.startsWith("-,")) {
                        value = "-" + value.substr(2);
                    }
                }
            }
            return (value.toString());
        }
        formatters.commaOnly = commaOnly;
        function createCommaFormatter(numDecimals) {
            return function (value) {
                return comma(value, numDecimals);
            };
        }
        formatters.createCommaFormatter = createCommaFormatter;
        //---- format a number as a percentage ----
        function percent(value, numDecimalPlaces) {
            //---- convert to a number, if possible ----
            var num = parseFloat(value);
            if (vp.utils.isNumber(num)) {
                value = 100 * num;
                value = comma(value, numDecimalPlaces) + "%";
            }
            return value;
        }
        formatters.percent = percent;
        //---- format a number as a dollar amount (US only for now) ----
        function dollar(value, numDecimalPlaces) {
            if (numDecimalPlaces === undefined) {
                numDecimalPlaces = 2;
            }
            //---- convert to a number, if possible ----
            var num = parseFloat(value);
            if (vp.utils.isNumber(num)) {
                value = "$" + comma(value, numDecimalPlaces, true);
            }
            return value;
        }
        formatters.dollar = dollar;
        //---- format a number in scientific notation ----
        function scientific(value, numDecimalPlaces) {
            //---- convert to a number, if possible ----
            var num = parseFloat(value);
            if (vp.utils.isNumber(num)) {
                if (numDecimalPlaces === undefined) {
                    value = num.toExponential(2);
                }
                else {
                    value = num.toExponential(numDecimalPlaces);
                }
            }
            return value;
        }
        formatters.scientific = scientific;
        function date(value) {
            var date;
            if (!(value instanceof Date)) {
                date = new Date(value);
            }
            else {
                date = value;
            }
            //---- for now, hard code to year ----
            var str = date.getFullYear();
            return str;
        }
        formatters.date = date;
        function string(value) {
            return value + ""; // ensure it is a string
        }
        formatters.string = string;
        /// format a number nicely (shortest decimal possible, add commas for thousands).
        function format(value) {
            if (vp.utils.isNumber(value)) {
                value = comma(value);
            }
            return value;
        }
        formatters.format = format;
        function truncateText(text, maxLength, addEllipses, fakeLabel, ellipsesWidth) {
            var newStr = "";
            //---- first, see if whole text fits ----
            fakeLabel.textContent = text;
            var rc = vp.dom.getBounds(fakeLabel); // .getBBox();
            if (rc.width <= maxLength) {
                newStr = text;
            }
            else {
                if (addEllipses) {
                    //---- leave space for elippses ----
                    maxLength -= ellipsesWidth;
                }
                //---- do a binary search on the best string ----
                var low = 0;
                var high = text.length - 1;
                while (low <= high) {
                    var next = Math.floor((high + low) / 2);
                    var testStr = text.substr(0, next);
                    fakeLabel.textContent = testStr;
                    var rc = vp.dom.getBounds(fakeLabel); //.getBBox();
                    if (rc.width > maxLength) {
                        high = next - 1;
                    }
                    else {
                        low = next + 1;
                        newStr = testStr;
                    }
                }
                if (addEllipses) {
                    newStr += "...";
                }
            }
            return newStr;
        }
        formatters.truncateText = truncateText;
    })(formatters = vp.formatters || (vp.formatters = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// excelFormatter.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlot library 
///   - formats values using a simplified interpretation of an excel formatting string.  Used when we are running independent
///     of Excel (otherwise, we use Excel to format the values directly).
///
///   - one of the simplications that we do: we ignore locale-aware strings (all US formatting).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var formatters;
    (function (formatters) {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
            "November", "December"];
        var monthAbbrevs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var dayAbbrevs = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        function N2(n) {
            var str = +n + "";
            if (str.length < 2) {
                str = "0" + str;
            }
            return str;
        }
        function getHours(hours, ampm) {
            if (ampm) {
                if (hours == 0) {
                    hours = 12;
                }
                else if (hours > 12) {
                    hours = hours - 12;
                }
            }
            return hours;
        }
        /** Formats a number as a date or time, according to the specified 'format' string.  Example
        formats:  m/dd/yyyy, mmm-yy, hh:mm:ss AM/PM. */
        function formatDateTime(value, format) {
            var index = 0;
            var output = "";
            var ampm = format.contains("AM/PM");
            var hours = 0;
            var date;
            if (!(value instanceof Date)) {
                date = new Date(value);
            }
            else {
                date = value;
            }
            while (index < format.length) {
                var fmt = format.substr(index);
                if (fmt.startsWith("mmmm")) {
                    //---- full month name ----
                    var str = monthNames[date.getMonth()];
                    output += str;
                    index += 4;
                }
                else if (fmt.startsWith("mmm")) {
                    //---- 3 letter month abbreviaton ----
                    var str = monthAbbrevs[date.getMonth()];
                    output += str;
                    index += 3;
                }
                else if (fmt.startsWith("mm")) {
                    //---- 2 digit minutes ----
                    var str = N2(date.getMinutes());
                    output += str;
                    index += 2;
                }
                else if (fmt.startsWith("m")) {
                    //---- 1-2 digit day month number (1-relative) ----
                    var str = (date.getMonth() + 1) + "";
                    output += str;
                    index += 1;
                }
                else if (fmt.startsWith("q")) {
                    //---- 1 digit QUARTER number (1-relative) ----
                    var str = (Math.floor(date.getMonth() / 3) + 1) + "";
                    output += str;
                    index += 1;
                }
                else if (fmt.startsWith("dddd")) {
                    //---- full day of week ----
                    var str = dayNames[date.getDay()];
                    output += str;
                    index += 4;
                }
                else if (fmt.startsWith("ddd")) {
                    //---- 3 letter day abbreviaton ----
                    var str = dayAbbrevs[date.getDay()];
                    output += str;
                    index += 3;
                }
                else if (fmt.startsWith("dd")) {
                    //---- 2 digit day-of-month ----
                    var str = N2(date.getDate());
                    output += str;
                    index += 2;
                }
                else if (fmt.startsWith("d")) {
                    //---- 1-2 digit day of month ----
                    var str = date.getDate() + "";
                    output += str;
                    index += 1;
                }
                else if (fmt.startsWith("yyyy")) {
                    //---- 4 digit year ----
                    var str = date.getFullYear() + "";
                    output += str;
                    index += 4;
                }
                else if (fmt.startsWith("yy")) {
                    //---- 2 digit year----
                    var str = (date.getFullYear() % 100) + "";
                    output += str;
                    index += 3;
                }
                else if (fmt.startsWith(".0")) {
                    //---- milliseconds as fraction ----
                    var str = (date.getMilliseconds() / 1000) + "";
                    output += str;
                    index += 2;
                }
                else if (fmt.startsWith("ss")) {
                    //---- 2 digit seconds ----
                    var str = N2(date.getSeconds());
                    output += str;
                    index += 2;
                }
                else if (fmt.startsWith("s")) {
                    //---- 1-2 digit seconds ----
                    var str = date.getSeconds() + "";
                    output += str;
                    index += 1;
                }
                else if (fmt.startsWith("hh")) {
                    //---- 2 digit hours ----
                    hours = date.getHours();
                    var hrs = getHours(hours, ampm);
                    var str = N2(hrs);
                    output += str;
                    index += 2;
                }
                else if (fmt.startsWith("h")) {
                    //---- 1-2 digit hours ----
                    hours = date.getHours();
                    var hrs = getHours(hours, ampm);
                    var str = hrs + "";
                    output += str;
                    index += 1;
                }
                else if (fmt.startsWith("AM/PM")) {
                    //---- AM/PM indicator ----
                    var str = (hours > 11) ? "PM" : "AM";
                    output += str;
                    index += 5;
                }
                else {
                    //---- copy a literal char ----
                    output += fmt[0];
                    index += 1;
                }
            }
            return output;
        }
        formatters.formatDateTime = formatDateTime;
        function getDecimalDigits(fmt) {
            var digits = 0;
            var index = fmt.indexOf('.');
            if (index > -1) {
                index++;
                while (index < fmt.length) {
                    if (fmt[index] == '0') {
                        digits++;
                        index++;
                    }
                    else {
                        break;
                    }
                }
            }
            return digits;
        }
        function formatByType(value, valueType) {
            var str = null;
            if (valueType == "date") {
                str = formatDateTime(value, "m/dd/yyyy hh:mm:ss AM/PM");
            }
            else if (valueType == "number") {
                str = formatters.comma(value);
            }
            else {
                str = value;
            }
            return str;
        }
        formatters.formatByType = formatByType;
        /** Formats a number according to the specified 'format' string (a simplified version of an Excel numeric
        formatting string).  Example formats:  0, #,##0.000, $#,##0.00 */
        function formatNumber(value, format) {
            var index = 0;
            var output = "";
            var hasComma = format.contains(",");
            var hasDollar = format.contains("$");
            var hasPercent = format.contains("%");
            var hasDecimal = format.contains(".");
            var decimalDigits = getDecimalDigits(format);
            var fmt = format;
            if (fmt.contains("E+00")) {
                //---- scientific notation ----
                var str = value.toExponential(decimalDigits);
                index += 4;
            }
            else if (hasPercent) {
                value = value * 100;
                str = value.toFixed(decimalDigits);
            }
            else if (hasComma) {
                str = vp.formatters.comma(value, decimalDigits, true);
            }
            else {
                str = value.toFixed(decimalDigits);
            }
            if (hasDecimal && decimalDigits == 0) {
                str += ".";
            }
            if (hasDollar) {
                str = "$" + str;
            }
            if (hasPercent) {
                str += "%";
            }
            output += str;
            return output;
        }
        formatters.formatNumber = formatNumber;
        function createDateFormatterFromRange(minDate, maxDate, steps) {
            if (steps === void 0) { steps = 2; }
            /// formats: m/dd/yyyy, mmm-yy, hh:mm:ss AM/PM. */
            var msPerDay = 86400000;
            var msPerYear = 365 * msPerDay;
            var format = "yyyy";
            var duration = maxDate - minDate;
            var years = duration / msPerYear;
            if (years > 1) {
                if (years >= steps) {
                    //---- year is sufficient ----
                    format = "yyyy";
                }
                else {
                    //---- month and year ----
                    format = "mmm-yyyy";
                }
            }
            else {
                var days = years * 365;
                if (days >= steps) {
                    //---- date is sufficient ----
                    format = "m/dd/yyyy";
                }
                else if (days > 1) {
                    //---- date + hour ----
                    format = "m/dd/yyyy hh AM/PM";
                }
                else {
                    var secs = duration / 1000;
                    if (secs >= steps) {
                        //---- time is sufficient ----
                        format = "hh:mm:ss AM/PM";
                    }
                    else {
                        //---- time + MS ----
                        format = "hh:mm:ss.0";
                    }
                }
            }
            var formatter = createExcelFormatter(format, "date");
            return formatter;
        }
        formatters.createDateFormatterFromRange = createDateFormatterFromRange;
        function createExcelFormatter(formatString, colType) {
            var formatFunc = null;
            var external = window.external;
            //---- force VS debugger to open when hosted by Excel ----
            //---- for this to work: uncheck BOTH advanced "browsing" options about "disable script debugging" ----
            //var dummy;
            //var b = dummy.foo.bar;
            //---- is Excel available, for more accurate formatting? ----
            if (external && external.isHostedInExcel) {
                //---- use EXCEL HOST to format ----
                formatFunc = function (value) {
                    return external.formatValueWithExcel(value, formatString);
                };
            }
            else {
                //---- local formatting ----
                if (!formatString || formatString == "General") {
                    if (colType == "number") {
                        formatFunc = function (value) {
                            // Add the commas, but leave the full precision [ie. display the full mantissa] 
                            return vp.formatters.commaOnly(value);
                        };
                    }
                }
                else {
                    if (colType == "number") {
                        formatFunc = function (value) {
                            return vp.formatters.formatNumber(value, formatString);
                        };
                    }
                    else if (colType == "date") {
                        formatFunc = function (value) {
                            return vp.formatters.formatDateTime(value, formatString);
                        };
                    }
                }
                if (!formatFunc) {
                    //---- NO-OP function ----
                    formatFunc = function (value) {
                        return value;
                    };
                }
            }
            formatFunc._formatString = formatString;
            formatFunc._colType = colType;
            return formatFunc;
        }
        formatters.createExcelFormatter = createExcelFormatter;
    })(formatters = vp.formatters || (vp.formatters = {}));
})(vp || (vp = {}));
//-----------------------------------------------------------------------------------------------------------------
// BasicTypes.ts    Copyright 2014 Microsoft Corporation.
//-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        /// aka "SVGRect".
        var rectLight = (function () {
            function rectLight(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
            return rectLight;
        })();
        geom.rectLight = rectLight;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// matrix4.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - a 4x4 matrix class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        /// matrix4 class.
        /// formulas in matrix4 adapted from various Microsoft code:
        ///     - DxCodePack project: http://archive.msdn.microsoft.com/WindowsAPICodePack) File: D3DCommonStructs.h
        ///     - Microsoft DirectX docs: http://msdn.microsoft.com/en-us/library/windows/desktop/bb205351%28v=vs.85%29.aspx
        ///     - XnaMathMatrix.inl (Microsoft SDK file)
        ///     - Microsoft WPF (Orcas release): \Core\CSharp\System\Windows\Media3D\Matrix3D.cs\1\Matrix3D.cs (line 1285) 
        /// Note: WebGL uses a right-hand coordinate system (with positive z axis coming towards viewer), so shapes should
        /// be placed in the negative z space.  
        ///
        /// Dec-05/2014 - just verified that WebGL IS a RIGHT HAND system.  
        /// Camera goes in positive Z, object go in negative Z. And triangles on the "front" of an object wind COUNTER-CLOCKWISE. Also,
        /// matricies are multiplied in reverse order (right to left) to apply transformations in a RIGHT HAND system.  Wierd.
        ///
        /// from: http://stackoverflow.com/questions/6118996/matrix-mult-order-in-direct3d
        /// The fundamental difference between OpenGL and DirectX arises from the fact that OpenGL treats matrices in column major order,
        /// while DirectX treats matrics in row major order.
        var matrix4 = (function () {
            function matrix4() {
                //if (typeof Float32Array == 'undefined')
                //{
                //    this.mat = new Array(16);
                //}
                //else
                //{  
                //    this.mat = new Float32Array(16);
                //}
                //---- we want calling code to be able to treat this as an array ----
                var self = this;
                //---- add array support ----
                this.length = 16;
                self.push = Array.prototype.push;
                self.splice = Array.prototype.splice;
                self.indexOf = Array.prototype.indexOf;
                self.map = Array.prototype.map;
                self.select = Array.prototype.select;
            }
            matrix4.prototype.toArray = function () {
                var result = [];
                for (var i = 0; i < this.length; i++) {
                    result[i] = this[i];
                }
                return result;
            };
            matrix4.prototype.toFloat32Array = function () {
                var result = new Float32Array(this.length);
                for (var i = 0; i < this.length; i++) {
                    result[i] = this[i];
                }
                return result;
            };
            matrix4.fromFloats = function (m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
                var mat = new matrix4();
                mat[0] = m11;
                mat[1] = m12;
                mat[2] = m13;
                mat[3] = m14;
                mat[4] = m21;
                mat[5] = m22;
                mat[6] = m23;
                mat[7] = m24;
                mat[8] = m31;
                mat[9] = m32;
                mat[10] = m33;
                mat[11] = m34;
                mat[12] = m41;
                mat[13] = m42;
                mat[14] = m43;
                mat[15] = m44;
                return mat;
            };
            matrix4.identity = function () {
                var mat = new matrix4();
                //---- build identity matrix ----
                mat[0] = 1; // M11
                mat[1] = 0; // M12
                mat[2] = 0; // M13
                mat[3] = 0; // M14
                mat[4] = 0; // M21
                mat[5] = 1; // M22
                mat[6] = 0; // M23
                mat[7] = 0; // M24
                mat[8] = 0; // M31
                mat[9] = 0; // M32
                mat[10] = 1; // M33
                mat[11] = 0; // M34
                mat[12] = 0; // M41
                mat[13] = 0; // M42
                mat[14] = 0; // M43
                mat[15] = 1; // M44
                return mat;
            };
            matrix4.transpose = function (m) {
                var b = matrix4.identity();
                b[0] = m[0];
                b[1] = m[4];
                b[2] = m[8];
                b[3] = m[12];
                b[4] = m[1];
                b[5] = m[5];
                b[6] = m[9];
                b[7] = m[13];
                b[8] = m[2];
                b[9] = m[6];
                b[10] = m[10];
                b[11] = m[14];
                b[12] = m[3];
                b[13] = m[7];
                b[14] = m[11];
                b[15] = m[15];
                return b;
            };
            matrix4.toMat3Array = function (m) {
                var b = new Float32Array(9);
                b[0] = m[0];
                b[1] = m[1];
                b[2] = m[2];
                b[3] = m[4];
                b[4] = m[5];
                b[5] = m[6];
                b[6] = m[8];
                b[7] = m[9];
                b[8] = m[10];
                return b;
            };
            matrix4.invert = function (m) {
                var b = matrix4.identity();
                var _offsetX = m[12];
                var _offsetY = m[13];
                var _offsetZ = m[14];
                // compute all six 2x2 determinants of 2nd two columns
                var y01 = m[2] * m[7] - m[6] * m[3];
                var y02 = m[2] * m[11] - m[10] * m[3];
                var y03 = m[2] * m[15] - _offsetZ * m[3];
                var y12 = m[6] * m[11] - m[10] * m[7];
                var y13 = m[6] * m[15] - _offsetZ * m[7];
                var y23 = m[10] * m[15] - _offsetZ * m[11];
                // Compute 3x3 cofactors for 1st the column 
                var z30 = m[5] * y02 - m[9] * y01 - m[1] * y12;
                var z20 = m[1] * y13 - m[5] * y03 + _offsetY * y01;
                var z10 = m[9] * y03 - _offsetY * y02 - m[1] * y23;
                var z00 = m[5] * y23 - m[9] * y13 + _offsetY * y12;
                // Compute 4x4 determinant 
                var det = _offsetX * z30 + m[8] * z20 + m[4] * z10 + m[0] * z00;
                // If Determinant is computed using a different method then Inverse can throw 
                // NotInvertable when HasInverse is true.  (Windows OS #901174)
                //
                var epsilon = .0000001; // .0001;
                if (Math.abs(det) > epsilon) {
                    // Compute 3x3 cofactors for the 2nd column
                    var z31 = m[0] * y12 - m[4] * y02 + m[8] * y01;
                    var z21 = m[4] * y03 - _offsetX * y01 - m[0] * y13;
                    var z11 = m[0] * y23 - m[8] * y03 + _offsetX * y02;
                    var z01 = m[8] * y13 - _offsetX * y12 - m[4] * y23;
                    // Compute all six 2x2 determinants of 1st two columns 
                    y01 = m[0] * m[5] - m[4] * m[1];
                    y02 = m[0] * m[9] - m[8] * m[1];
                    y03 = m[0] * _offsetY - _offsetX * m[1];
                    y12 = m[4] * m[9] - m[8] * m[5];
                    y13 = m[4] * _offsetY - _offsetX * m[5];
                    y23 = m[8] * _offsetY - _offsetX * m[9];
                    // Compute all 3x3 cofactors for 2nd two columns
                    var z33 = m[2] * y12 - m[6] * y02 + m[10] * y01;
                    var z23 = m[6] * y03 - _offsetZ * y01 - m[2] * y13;
                    var z13 = m[2] * y23 - m[10] * y03 + _offsetZ * y02;
                    var z03 = m[10] * y13 - _offsetZ * y12 - m[6] * y23;
                    var z32 = m[7] * y02 - m[11] * y01 - m[3] * y12;
                    var z22 = m[3] * y13 - m[7] * y03 + m[15] * y01;
                    var z12 = m[11] * y03 - m[15] * y02 - m[3] * y23;
                    var z02 = m[7] * y23 - m[11] * y13 + m[15] * y12;
                    var rcp = 1.0 / det;
                    // Multiply all 3x3 cofactors by reciprocal & transpose
                    b[0] = z00 * rcp;
                    b[1] = z10 * rcp;
                    b[2] = z20 * rcp;
                    b[3] = z30 * rcp;
                    b[4] = z01 * rcp;
                    b[5] = z11 * rcp;
                    b[6] = z21 * rcp;
                    b[7] = z31 * rcp;
                    b[8] = z02 * rcp;
                    b[9] = z12 * rcp;
                    b[10] = z22 * rcp;
                    b[11] = z32 * rcp;
                    b[12] = z03 * rcp;
                    b[13] = z13 * rcp;
                    b[14] = z23 * rcp;
                    b[15] = z33 * rcp;
                }
                return b;
            };
            //---- returns a matrix that does an orthographic projection (RIGHT HAND) ----
            matrix4.createOrthographic = function (width, height, nearPlane, farPlane) {
                var zn = nearPlane;
                var zf = farPlane;
                var m22 = 1 / (zn - zf);
                var m32 = zn * m22;
                var mat = matrix4.fromFloats(2 / width, 0, 0, 0, // first row
                0, 2 / height, 0, 0, // second row
                0, 0, m22, 0, // third row   (added minus sign based on comparison to XNA)
                0, 0, m32, 1); // forth row
                return mat;
            };
            //---- returns a matrix that does an orthographic projection (RIGHT HAND) ----
            //---- note: the directx formula we use has different values in the z-scale and z-translation terms ----
            //---- as compared to results from gl-matrix.js. ----
            matrix4.createOrthographicOffCenter = function (left, right, bottom, top, near, far) {
                var mat = matrix4.fromFloats(2 / (right - left), 0, 0, 0, // first row
                0, 2 / (top - bottom), 0, 0, // second row
                0, 0, 1 / (near - far), 0, // third row
                (left + right) / (left - right), (top + bottom) / (bottom - top), near / (near - far), 1); // forth row
                return mat;
            };
            /// creates a RIGHT-HANDED view matrix  (the location and direction of the camera)
            /// "eyePos" is the camera location
            /// "lookAt" is the location that the camera is pointed
            /// "up" is a vector from the center to the top of the camera 
            ///
            /// corrected on 12/10/2014 to match directx formula:
            ///  http://msdn.microsoft.com/en-us/library/windows/desktop/bb281711(v=vs.85).aspx
            ///
            matrix4.createLookAt = function (eyePos, lookAt, up) {
                var zaxis = geom.vector3.normal(geom.vector3.subtract(eyePos, lookAt));
                var xaxis = geom.vector3.normal(geom.vector3.cross(up, zaxis));
                var yaxis = geom.vector3.cross(zaxis, xaxis);
                var mat = matrix4.fromFloats(xaxis.x, yaxis.x, zaxis.x, 0, xaxis.y, yaxis.y, zaxis.y, 0, xaxis.z, yaxis.z, zaxis.z, 0, -geom.vector3.dot(xaxis, eyePos), -geom.vector3.dot(yaxis, eyePos), -geom.vector3.dot(zaxis, eyePos), 1);
                return mat;
            };
            // confirmed with mark finch that "0" as last element in perspective matrices is correct (rfernand 12/18/2014).
            matrix4.createPerspectiveRH = function (width, height, zNear, zFar) {
                var mat = matrix4.fromFloats(2 * zNear / width, 0, 0, 0, 0, 2 * zNear / height, 0, 0, 0, 0, zFar / (zNear - zFar), -1, 0, 0, zNear * zFar / (zNear - zFar), 0);
                return mat;
            };
            /// "fov" is the field of view in the y direction, in radians.
            // confirmed with mark finch that "0" as last element in perspective matrices is correct (rfernand 12/18/2014).
            //---- correction for OPEN-GL from mark finch, 12/18/2014 (so we apply to webgl) ----
            // M[2, 2] = -(far + near) / (far – near)
            // M[3, 2] = -(2.0 * far * near) / (far – near)
            matrix4.createPerspectiveFovRH = function (fovY, aspect, zNear, zFar) {
                var yScale = 1 / Math.tan(fovY / 2); // cot(fovY/2)
                var xScale = yScale / aspect;
                /// 02/04/2015 rfernand: as per Mark Finch.
                var mat = matrix4.fromFloats(xScale, 0, 0, 0, 0, yScale, 0, 0, 0, 0, -(zFar + zNear) / (zFar - zNear), -1, // mark finch
                0, 0, -(2 * zFar * zNear) / (zFar - zNear), 0); // mark finch     
                return mat;
            };
            /** WARNING: do NOT use this for WebGL (use RH).
            "fov" is the field of view in the y direction, in radians. */
            matrix4.createPerspectiveFovLH = function (fovY, aspect, zNear, zFar) {
                var yScale = 1 / Math.tan(fovY / 2); // cot(fovY/2)
                var xScale = yScale / aspect;
                /// 02/04/2015 rfernand: as per XNA 4 code (differs from DirectX 9 docs).
                var mat = matrix4.fromFloats(xScale, 0, 0, 0, 0, yScale, 0, 0, 0, 0, zFar / (zNear - zFar), -1, 0, 0, (zNear * zFar) / (zNear - zFar), 0);
                return mat;
            };
            // confirmed with mark finch that "0" as last element in perspective matrices is correct (rfernand 12/18/2014).
            matrix4.createPerspectiveOffCenterRH = function (left, right, bottom, top, zNear, zFar) {
                var mat = matrix4.fromFloats(2 * zNear / (right - left), 0, 0, 0, 0, 2 * zNear / (top - bottom), 0, 0, (left + right) / (right - left), (top + bottom) / (top - bottom), zFar / (zNear - zFar), -1, 0, 0, 2 * zNear * zFar / (zNear - zFar), 0);
                return mat;
            };
            //---- multiply matrix and a vector ----
            //---- do NOT use this to transform a point - for webGL, we want v * m  (not m*v) ----
            matrix4.multiplyVector = function (m, v) {
                var x = v.x;
                var y = v.y;
                var z = v.z;
                var w = v.w;
                var x = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
                var y = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
                var z = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
                var w = m[12] * x + m[13] * y + m[14] * z + m[15] * w;
                var result = new geom.vector4(x, y, z, w);
                return result;
            };
            //---- multiply 2 matrices ----
            matrix4.multiply = function (a, b) {
                var mat = matrix4.fromFloats(a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12], // m[0]
                a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13], // m[1]
                a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14], // m[2]
                a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15], // m[3]
                a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12], // m[4]
                a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13], // m[5]
                a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14], // m[6]
                a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15], // m[7]
                a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12], // m[8]
                a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13], // m[9]
                a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14], // m[10]
                a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15], // m[11]
                a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12], // m[12]
                a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13], // m[13]
                a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14], // m[14]
                a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]); // m[15]
                return mat;
            };
            /** Note: this function treats "v" as if it were a vector4 (with 4th component=1). It
            performs the multipication:  v * mat    (not the reverse).
            NOTE: we return a vector4 so the call has a chance to use the returned v.w value, which
            sometimes should be used to scale the xyz value (1/w), like when you have the mat includes
            a projection component.  */
            matrix4.transformPoint = function (mat, v) {
                var x = v.x;
                var y = v.y;
                var z = v.z;
                var w = 1;
                var newX = x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12];
                var newY = x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13];
                var newZ = x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14];
                var newW = x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15];
                return new geom.vector4(newX, newY, newZ, newW);
            };
            /** taken from: http://msdn.microsoft.com/en-us/library/microsoft.xna.framework.matrix.aspx */
            matrix4.createTranslation = function (x, y, z) {
                //---- values get put into M41, M42, M43 (all on 4th row, M[12-14]) ----
                var mat = matrix4.identity();
                mat[12] = x;
                mat[13] = y;
                mat[14] = z;
                return mat;
            };
            matrix4.createScale = function (x, y, z) {
                var mat = matrix4.identity();
                mat[0] = x;
                mat[5] = y;
                mat[10] = z;
                return mat;
            };
            /**Returns a matrix that does a rotation about the X axis by the specified angle in radians. */
            matrix4.createRotationX = function (angle) {
                var mat = matrix4.fromFloats(1, 0, 0, 0, 0, Math.cos(angle), -Math.sin(angle), 0, 0, Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1);
                return mat;
            };
            /**Returns a matrix that does a rotation about the Y axis by the specified angle in radians. */
            matrix4.createRotationY = function (angle) {
                var mat = matrix4.fromFloats(Math.cos(angle), 0, Math.sin(angle), 0, 0, 1, 0, 0, -Math.sin(angle), 0, Math.cos(angle), 0, 0, 0, 0, 1);
                return mat;
            };
            /**Returns a matrix that does a rotation about the Z axis by the specified angle in radians. */
            matrix4.createRotationZ = function (angle) {
                var mat = matrix4.fromFloats(Math.cos(angle), -Math.sin(angle), 0, 0, Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
                return mat;
            };
            /**Returns a matrix that does a rotation about the Z axis by the specified angle in radians. */
            matrix4.createAxisRotation = function (theta, axis) {
                theta = -theta; // formula was off here
                var c = Math.cos(theta);
                var s = Math.sin(theta);
                var t = 1 - c;
                var x = axis[0];
                var y = axis[1];
                var z = axis[2];
                var mat = matrix4.fromFloats(t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0, t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0, t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0, 0, 0, 0, 1);
                return mat;
            };
            /** Returns a matrix that rotates about the z (yaw), y (pitch), and x (roll) axes.  All
            angles are specified in radians. */
            matrix4.createFromYawPitchRoll = function (yaw, pitch, roll) {
                var mz = matrix4.createRotationZ(yaw);
                var my = matrix4.createRotationY(pitch);
                var mx = matrix4.createRotationX(roll);
                var mat = mz;
                mat = matrix4.multiply(mat, my);
                mat = matrix4.multiply(mat, mx);
                return mat;
            };
            return matrix4;
        })();
        geom.matrix4 = matrix4;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// point2.ts.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlotCore library - a 2 dim point class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var point2 = (function () {
            function point2(x, y) {
                this.x = (x === undefined) ? 0 : x;
                this.y = (y === undefined) ? 0 : y;
            }
            return point2;
        })();
        geom.point2 = point2;
        function createPoint2(x, y) {
            return new point2(x, y);
        }
        geom.createPoint2 = createPoint2;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// point3.ts.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlotCore library - a 3 dim point class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var point3 = (function () {
            function point3(x, y, z) {
                this.x = (x === undefined) ? 0 : x;
                this.y = (y === undefined) ? 0 : y;
                this.z = (z === undefined) ? 0 : z;
            }
            point3.prototype.toString = function () {
                return "point3 {x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
            };
            return point3;
        })();
        geom.point3 = point3;
        function createPoint3(x, y, z) {
            return new point3(x, y, z);
        }
        geom.createPoint3 = createPoint3;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// rect.ts.  Copyright (c) 2014 Microsoft Corporation.
///     - part of the vuePlot library
///     - small library of flat rectangle functions   {left, top, right, bottom, width, height}
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        function createRect(left, top, w, h) {
            var rc = { left: left, top: top, width: w, height: h, right: left + w, bottom: top + h };
            return rc;
        }
        geom.createRect = createRect;
        function rect(left, top, w, h) {
            return createRect(left, top, w, h);
        }
        geom.rect = rect;
        function rectToString(rc) {
            var str = "{left: " + Math.round(rc.left) + ", top: " + Math.round(rc.top)
                + ", width: " + Math.round(rc.width) + ", height: " + Math.round(rc.height) + "}";
            return str;
        }
        geom.rectToString = rectToString;
        function rectFromPoints(pt1, pt2) {
            var x = Math.min(pt1.x, pt2.x);
            var y = Math.min(pt1.y, pt2.y);
            var w = Math.abs(pt1.x - pt2.x);
            var h = Math.abs(pt1.y - pt2.y);
            var rc = { left: x, top: y, width: w, height: h, right: x + w, bottom: y + h };
            return rc;
        }
        geom.rectFromPoints = rectFromPoints;
        function rectContainsPoint(rc, pt) {
            var contains = false;
            if (pt.x >= rc.left) {
                if (pt.x <= rc.right) {
                    if (pt.y >= rc.top) {
                        if (pt.y <= rc.bottom) {
                            contains = true;
                        }
                    }
                }
            }
            return contains;
        }
        geom.rectContainsPoint = rectContainsPoint;
        /** returns true if rcInner is completely contained within rcOuter. */
        function rectContainsRect(rcOuter, rcInner) {
            var contains = false;
            if (rcInner.left >= rcOuter.left) {
                if (rcInner.right <= rcOuter.right) {
                    if (rcInner.top >= rcOuter.top) {
                        if (rcInner.bottom <= rcOuter.bottom) {
                            contains = true;
                        }
                    }
                }
            }
            return contains;
        }
        geom.rectContainsRect = rectContainsRect;
        /** returns true if rc1 overlaps in any way with rc2. */
        function rectIntersectsRect(rc1, rc2) {
            var overlaps = true;
            if (rc1.right < rc2.left) {
                overlaps = false;
            }
            else if (rc1.left > rc2.right) {
                overlaps = false;
            }
            else if (rc1.bottom < rc2.top) {
                overlaps = false;
            }
            else if (rc1.top > rc2.bottom) {
                overlaps = false;
            }
            return overlaps;
        }
        geom.rectIntersectsRect = rectIntersectsRect;
        function rectIntersectsSvgShape(rc, shape) {
            var tag = shape.tagName;
            var intersects = false;
            if (tag == "line") {
                var x1 = vp.dom.attr(shape, "x1");
                var y1 = vp.dom.attr(shape, "y1");
                var x2 = vp.dom.attr(shape, "x2");
                var y2 = vp.dom.attr(shape, "y2");
                intersects = rectIntersectsLine(rc, x1, y1, x2, y2);
            }
            else if (tag == "polygon") {
                var pts = vp.dom.attr(shape, "points");
                intersects = rectIntersectsAreaPolygon(rc, pts);
            }
            else {
                //---- use bounding box test for all other shapes ----
                var rc2 = vp.dom.getBounds(shape, true);
                intersects = vp.geom.rectIntersectsRect(rc, rc2);
            }
            return intersects;
        }
        geom.rectIntersectsSvgShape = rectIntersectsSvgShape;
        function rectIntersectsAreaPolygon(rc, pointStr) {
            var overlaps = true;
            var pts = parsePoints(pointStr);
            var x1 = pts[0].x;
            var x2 = pts[2].x;
            var y1 = pts[0].y; // left bottom
            var y2 = pts[1].y;
            var y3 = pts[2].y;
            var y4 = pts[3].y; // right bottom
            //---- try to reject based on x bounds of area ----
            var maxX = Math.max(x1, x2);
            var minX = Math.min(x1, x2);
            if (maxX < rc.left) {
                overlaps = false;
            }
            else if (minX > rc.right) {
                overlaps = false;
            }
            else {
                //--- reject based on y bounds of area ----
                var maxY = Math.max(y1, y4);
                var minY = Math.min(y2, y3);
                if (maxY < rc.top) {
                    //--- bottom of area is above top of rect ----
                    overlaps = false;
                }
                else if (minY > rc.bottom) {
                    //---- top of area is below bottom of rect ----
                    overlaps = false;
                }
                else if (x1 != x2) {
                    //---- find where TOP diagonal line (x1,y2)..(x2,y3) intersects left & right of rect ----
                    var m = (y3 - y2) / (x2 - x1);
                    var b = y3 - m * x2;
                    var yLeft = m * rc.left + b;
                    var yRight = m * rc.right + b;
                    //---- if both are below the rect, they do not intercept ----
                    if ((yLeft > rc.bottom) && (yRight > rc.bottom)) {
                        overlaps = false;
                    }
                    else {
                        //---- find where BOTTOM diagonal line (x1,y1)..(x2,y4) intersects left & right of rect ----
                        var m = (y4 - y1) / (x2 - x1);
                        var b = y4 - m * x2;
                        var yLeft = m * rc.left + b;
                        var yRight = m * rc.right + b;
                        //---- if both are above the rect, they do not intercept ----
                        if ((yLeft < rc.top) && (yRight < rc.top)) {
                            overlaps = false;
                        }
                    }
                }
            }
            return overlaps;
        }
        geom.rectIntersectsAreaPolygon = rectIntersectsAreaPolygon;
        function parsePoints(str) {
            var pts = [];
            str = str.replace(/, /g, ","); // replace all ", " chars with just comma
            str = str.replace(/  /g, " "); // replace all double spaces with a single space
            var parts = str.split(" ");
            for (var i = 0; i < parts.length; i++) {
                var pps = parts[i].split(",");
                if (pps.length != 2) {
                    vp.utils.error("unsupported point format in shape");
                }
                var pt = { x: pps[0], y: pps[1] };
                pts.push(pt);
            }
            return pts;
        }
        function rectIntersectsLine(rc, x1, y1, x2, y2) {
            var overlaps = true;
            //---- try to reject based on x bounds of line ----
            var maxX = Math.max(x1, x2);
            var minX = Math.min(x1, x2);
            if (maxX < rc.left) {
                overlaps = false;
            }
            else if (minX > rc.right) {
                overlaps = false;
            }
            else {
                //--- reject based on y bounds of line ----
                var maxY = Math.max(y1, y2);
                var minY = Math.min(y1, y2);
                if (maxY < rc.top) {
                    overlaps = false;
                }
                else if (minY > rc.bottom) {
                    overlaps = false;
                }
                else {
                    //---- find where line intersects left & right of rect ----
                    var m = (y2 - y1) / (x2 - x1);
                    var b = y2 - m * x2;
                    var yLeft = m * rc.left + b;
                    var yRight = m * rc.right + b;
                    //---- if both are ABOVE the rect, they do not intercept ----
                    if ((yLeft < rc.top) && (yRight < rc.top)) {
                        overlaps = false;
                    }
                    //---- if both are BELOW the rect, they do not intercept ----
                    if ((yLeft > rc.bottom) && (yRight > rc.bottom)) {
                        overlaps = false;
                    }
                }
            }
            return overlaps;
        }
        geom.rectIntersectsLine = rectIntersectsLine;
        function offsetRect(rc, xoff, yoff) {
            var x = rc.left + xoff;
            var y = rc.top + yoff;
            var w = rc.width;
            var h = rc.height;
            return { left: x, top: y, width: w, height: h, right: x + w, bottom: y + h };
        }
        geom.offsetRect = offsetRect;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// vector2.ts.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlotCore library - a 2 dim vector class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var vector2 = (function () {
            function vector2(x, y) {
                this.x = (x === undefined) ? 0 : x;
                this.y = (y === undefined) ? 0 : y;
            }
            vector2.add = function (v, v2) {
                var vNew = new vector2(v.x + v2.x, v.y + v2.y);
                return vNew;
            };
            vector2.subtract = function (v, v2) {
                var vNew = new vector2(v.x - v2.x, v.y - v2.y);
                return vNew;
            };
            vector2.multiply = function (v, s) {
                var vNew = new vector2(v.x * s, v.y * s);
                return vNew;
            };
            vector2.dot = function (v, v2) {
                var sum = v.x * v2.x + v.y * v2.y;
                return sum;
            };
            /// return the normalized vector.
            vector2.normal = function (v) {
                var magnitude = Math.sqrt((v.x * v.x) + (v.y * v.y));
                var vNew = new vector2(v.x / magnitude, v.y / magnitude);
                return vNew;
            };
            return vector2;
        })();
        geom.vector2 = vector2;
        function createVector2(x, y) {
            return new vector2(x, y);
        }
        geom.createVector2 = createVector2;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// vector3.ts.  Copyright (c) 2012 Microsoft Corporation.
///            Part of the vuePlotCore library - a 3 dim vector class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var vector3 = (function () {
            function vector3(x, y, z) {
                this.x = (x === undefined) ? 0 : x;
                this.y = (y === undefined) ? 0 : y;
                this.z = (z === undefined) ? 0 : z;
            }
            vector3.add = function (v, v2) {
                var vNew = new vector3(v.x + v2.x, v.y + v2.y, v.z + v2.z);
                return vNew;
            };
            vector3.magnitude = function (v) {
                var mag = Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));
                return mag;
            };
            vector3.subtract = function (v, v2) {
                var vNew = new vector3(v.x - v2.x, v.y - v2.y, v.z - v2.z);
                return vNew;
            };
            vector3.multiply = function (v, s) {
                var vNew = new vector3(v.x * s, v.y * s, v.z * s);
                return vNew;
            };
            vector3.cross = function (v, v2) {
                var vNew = new vector3();
                vNew.x = v.y * v2.z - v.z * v2.y;
                vNew.y = v.z * v2.x - v.x * v2.z;
                vNew.z = v.x * v2.y - v.y * v2.x;
                return vNew;
            };
            vector3.dot = function (v, v2) {
                var sum = v.x * v2.x + v.y * v2.y + v.z * v2.z;
                return sum;
            };
            /// return the normalized vector.
            vector3.normal = function (v) {
                var magnitude = Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));
                var vNew = new vector3(v.x / magnitude, v.y / magnitude, v.z / magnitude);
                return vNew;
            };
            /// return the vector normal to 3 points.
            vector3.normalToPoints = function (pt1, pt2, pt3) {
                var v1 = new vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z);
                var v2 = new vector3(pt3.x - pt2.x, pt3.y - pt2.y, pt3.z - pt1.z);
                var vNew = vector3.cross(v1, v2);
                return vNew;
            };
            vector3.zero = function () {
                return new vector3(0, 0, 0);
            };
            vector3.up = function () {
                return new vector3(0, 1, 0);
            };
            vector3.prototype.toString = function () {
                return "vector3 {x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
            };
            return vector3;
        })();
        geom.vector3 = vector3;
        function createVector3(x, y, z) {
            return new vector3(x, y, z);
        }
        geom.createVector3 = createVector3;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// vector4.ts.  Copyright (c) 2013 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - a set of flat functions for 3d vector support.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var vector4 = (function () {
            function vector4(x, y, z, w) {
                this.x = (x === undefined) ? 0 : x;
                this.y = (y === undefined) ? 0 : y;
                this.z = (z === undefined) ? 0 : z;
                this.w = (w === undefined) ? 0 : w;
            }
            vector4.add = function (v, v2) {
                var vNew = new vector4(v.x + v2.x, v.y + v2.y, v.z + v2.z, v.w + v2.w);
                return vNew;
            };
            vector4.subtract = function (v, v2) {
                var vNew = new vector4(v.x - v2.x, v.y - v2.y, v.z - v2.z, v.w - v2.w);
                return vNew;
            };
            vector4.multiply = function (v, s) {
                var vNew = new vector4(v.x * s, v.y * s, v.z * s, v.w * s);
                return vNew;
            };
            ///// 
            //static cross(v, v2): vector4
            //{
            //    var x = v.y * v2.z - v.z * v2.y;
            //    var y = v.z * v2.x - v.x * v2.z;
            //    var z = v.x * v2.y - v.y * v2.x;
            //    var w = 1;          // ??
            //    return new vector4(x, y, z, w);
            //}
            vector4.dot = function (v, v2) {
                var sum = v.x * v2.x + v.y * v2.y + v.z * v2.z + v.w * v2.w;
                return sum;
            };
            /// return the normalized vector.
            vector4.normal = function (v) {
                var magnitude = Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z) + (v.w * v.w));
                var vNew = new vector4(v.x / magnitude, v.y / magnitude, v.z / magnitude, v.w / magnitude);
                return vNew;
            };
            vector4.zero = function () {
                return new vector4(0, 0, 0, 0);
            };
            return vector4;
        })();
        geom.vector4 = vector4;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// markBase.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - data-based generation "mark" base class.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Base class for all other mark classes. */
        var markBaseClass = (function () {
            /** "container" can be null, a string ("svg", "canvas", or "webGl"), or a container (SVG doc, SVG "g", Canvas element,
            or a canvas group element).  "shapeName" is name of the shape when an SVG or Canavas container is used.
            "glShapeName" is the name of the associated vuePlot webGl shape. */
            function markBaseClass(container, shapeName, glShapeName, useWebGl, className) {
                //super(container);
                this._seriesIndex = 0;
                this._seriesCount = 1;
                this._onShaderCallback = null;
                this._data = [0];
                this._fromGlParams = null;
                this._computedStyle = undefined;
                this._isVisible = true;
                this._firstShow = true;
                this._showOpacity = 1;
                var result = this.createContainerIfNeeded(container);
                container = result.container;
                useWebGl = (result.useWebGl !== undefined) ? result.useWebGl : useWebGl;
                this._container = container;
                //this.elem = container;
                this._shapeName = shapeName;
                this._glShapeName = glShapeName;
                this._className = className;
                this._jsParser = new marks.jsParserClass();
                //---- support for eBook calling ----
                var useWebGL = ((window["$usingWebGL"] === true || useWebGl) && (glShapeName != null));
                if (useWebGL) {
                    this._containerType = containerType.glCanvas;
                    this._glBuilder = new marks.glBuilderClass(container, glShapeName);
                    this._glBuilder.statsCallback(function (fps, shapesDrawn, elapsed) {
                        var w = window;
                        if (w.$setMarkStats) {
                            w.$setMarkStats(fps, shapesDrawn);
                        }
                    });
                }
                else {
                    if (container.tagName.toLowerCase() == "canvas") {
                        this._containerType = containerType.canvasElem;
                    }
                    else if (container.rootContainer) {
                        this._containerType = containerType.canvasGroup;
                    }
                    else {
                        this._containerType = containerType.svg;
                    }
                }
                if (this._containerType == containerType.canvasElem) {
                    //var request = (useWebGL) ? "3d" : "2d";
                    var canvasContainerElem = vp.canvas.selectContext(container, "2d")[0];
                    canvasContainerElem.clear();
                    this._container = canvasContainerElem;
                }
                var rootElem = this._container;
                if (!useWebGL) {
                    //---- create our own GROUP that will parent the generated shapes ----
                    var id = "rootElem-" + ((className) ? className : shapeName);
                    var groupElem = vp.select(container)
                        .append("g")
                        .id(id);
                    rootElem = groupElem[0];
                }
                this._rootElem = rootElem;
                vp.dom.css(rootElem, "opacity", "1"); // write as "1" so toggle code works
                //---- NOTE: "rootElem" is the container that shapes will be generated into ----
                this._dataAnimMgr = new vp.animation.dataAnimMgrClass(rootElem, null, shapeName, className, false, false);
                this._dataAnimMgr
                    .statsCallback(function (fps, shapesDrawn, elapsed) {
                    var w = window;
                    if (w.$setMarkStats) {
                        w.$setMarkStats(fps, shapesDrawn);
                    }
                });
                if (className) {
                    if (this._containerType == containerType.canvasElem || this._containerType == containerType.canvasGroup) {
                        var parentClassName = vp.select(this._container).attr("className");
                        this._computedStyle = vp.utils.getComputedStyleFromClass(shapeName, parentClassName, className);
                    }
                }
            }
            markBaseClass.prototype.createContainerIfNeeded = function (container) {
                if (!container) {
                    container = "svg";
                }
                var useWebGl = undefined;
                if (vp.utils.isString(container)) {
                    var containType = container;
                    useWebGl = (containType == "webGl");
                    if (containType == "svg") {
                        container = vp.dom.createSvg("svg");
                    }
                    else if (containType == "canvas" || useWebGl) {
                        container = vp.dom.createElement(null, "canvas");
                    }
                    else {
                        throw "Error - container string must be 'svg', 'canvas', or 'webGl', but was '" + containType + "'";
                    }
                }
                return { container: container, useWebGl: useWebGl };
            };
            markBaseClass.prototype.rootElem = function () {
                return this._rootElem;
            };
            markBaseClass.prototype.translate = function (x, y, makeCrispAdjustment) {
                if (makeCrispAdjustment === void 0) { makeCrispAdjustment = false; }
                if (this._rootElem) {
                    vp.select(this._rootElem)
                        .translate(x, y, makeCrispAdjustment);
                }
                return this;
            };
            markBaseClass.prototype.onShade = function (callback) {
                if (arguments.length === 0) {
                    return this._onShaderCallback;
                }
                this._onShaderCallback = callback;
                return this;
            };
            markBaseClass.prototype.keyFunc = function (callback) {
                if (arguments.length === 0) {
                    return this._dataAnimMgr.keyFunc();
                }
                this._dataAnimMgr.keyFunc(callback);
                return this;
            };
            markBaseClass.prototype.drawingParams = function (value) {
                if (arguments.length === 0) {
                    return this._drawingParams;
                }
                this._drawingParams = value;
                return this;
            };
            markBaseClass.prototype.opacity = function (value) {
                if (arguments.length === 0) {
                    return this._showOpacity;
                }
                this._showOpacity = value;
                vp.dom.css(this._rootElem, "opacity", value + "");
                this._isVisible = (value > 0);
                return this;
            };
            markBaseClass.prototype.build = function (transition, context) {
                this.generate(this._data, transition, context);
            };
            markBaseClass.prototype.generate = function (data, transition, context) {
                var _this = this;
                //---- support a few shortcuts for specifying the data ----
                if (data === true) {
                    //---- 1 row of dummy data ----
                    data = [1];
                }
                else if (data === false) {
                    //---- 0 rows of dummy data ----
                    data = [];
                }
                else if (vp.utils.isNumber(data)) {
                    data = vp.data.range(data);
                }
                if (data !== undefined) {
                    this._data = data;
                }
                if (!this._onShaderCallback) {
                    throw "Error - shader not defined for mark";
                }
                if (transition === undefined) {
                    transition = this._transition;
                }
                if (this._containerType == containerType.glCanvas) {
                    var glParams = this._jsParser.getGlParams(this._onShaderCallback, context);
                    this._glBuilder.drawScene(this._data, transition, glParams, this._fromGlParams);
                    this._fromGlParams = glParams;
                }
                else {
                    this.eraseCanvas();
                    this._dataAnimMgr
                        .transition(transition);
                    if (data === undefined) {
                        this._dataAnimMgr.updateWithoutDataChange();
                    }
                    else {
                        this._dataAnimMgr.setData(data);
                    }
                    this._dataAnimMgr.updateShapes(this._seriesIndex, this._seriesCount, function (elem, data, index, isNew) {
                        _this.applyClass(elem);
                        _this.applyDrawingParams(elem);
                        _this._onShaderCallback(elem, data.data, index, isNew, context, transition);
                        _this.postProcessShape(elem);
                    });
                }
            };
            //---- overridden by subclasses ----
            // private
            markBaseClass.prototype.applyDrawingParams = function (elem) {
            };
            markBaseClass.prototype.applyClass = function (elem) {
                if (this._className) {
                    var containType = this._containerType;
                    if (containType == containerType.svg) {
                        //---- just addClass on the element ----
                        vp.select(elem).addClass(this._className);
                    }
                    else if (this._computedStyle) {
                        //---- build style for named class ----
                        //var style = { fill: "gray", stroke: "black", strokeWidth: 1 };
                        elem.applyStyle(this._computedStyle);
                    }
                }
            };
            markBaseClass.prototype.postProcessShape = function (element) {
            };
            markBaseClass.prototype.clear = function () {
                this._dataAnimMgr.clear();
                this.eraseCanvas();
                return this;
            };
            markBaseClass.prototype.eraseCanvas = function () {
                if (this._glBuilder) {
                    this._glBuilder.clear();
                }
                else {
                    //vp.select(this._groupElem)
                    //    .clear();
                    var ctx = this._container.ctx;
                    if (ctx) {
                        var canvas = vp.select(this._container.canvas);
                        var w = canvas.width();
                        var h = canvas.height();
                        ctx.clearRect(0, 0, w, h);
                    }
                }
            };
            markBaseClass.prototype.isVisible = function () {
                return this._isVisible;
            };
            /** used at end of opacity animation, or in its place, to ensure item is hidden from hover, tooltips, clicks, etc. */
            markBaseClass.prototype.setVisibleNow = function (visible) {
                if (visible) {
                    vp.select(this._rootElem)
                        .css("opacity", this._showOpacity + "")
                        .css("visibility", "visible");
                }
                else {
                    vp.select(this._rootElem)
                        .css("opacity", "0")
                        .css("visibility", "hidden");
                }
            };
            markBaseClass.prototype.hide = function (transition) {
                var _this = this;
                if (transition === undefined) {
                    transition = this._transition;
                }
                var opacity = +vp.select(this._rootElem).css("opacity");
                if (opacity) {
                    if (transition) {
                        vp.select(this._rootElem)
                            .animate(transition.exit().duration(), null)
                            .onAnimationComplete(function (e) { return _this.setVisibleNow(false); })
                            .css("opacity", 0 + "");
                    }
                    else {
                        this.setVisibleNow(false);
                    }
                }
                this._isVisible = false;
            };
            markBaseClass.prototype.show = function (transition) {
                var _this = this;
                if (transition === undefined) {
                    transition = this._transition;
                }
                var opacity = +vp.select(this._rootElem).css("opacity");
                if (!opacity) {
                    if (transition) {
                        vp.select(this._rootElem)
                            .animate(transition.enter().duration(), null)
                            .onAnimationComplete(function (e) { return _this.setVisibleNow(true); })
                            .css("opacity", this._showOpacity + "");
                    }
                    else {
                        this.setVisibleNow(true);
                    }
                }
                this._firstShow = false;
                this._isVisible = true;
            };
            markBaseClass.prototype.transition = function (value) {
                if (arguments.length == 0) {
                    return this._transition;
                }
                this._transition = value;
            };
            return markBaseClass;
        })();
        marks.markBaseClass = markBaseClass;
        var markBase = (function (_super) {
            __extends(markBase, _super);
            function markBase() {
                _super.apply(this, arguments);
            }
            return markBase;
        })(markBaseClass);
        marks.markBase = markBase;
        (function (containerType) {
            containerType[containerType["svg"] = 0] = "svg";
            containerType[containerType["canvasElem"] = 1] = "canvasElem";
            containerType[containerType["canvasGroup"] = 2] = "canvasGroup";
            containerType[containerType["glCanvas"] = 3] = "glCanvas";
            containerType[containerType["glGroup"] = 4] = "glGroup";
        })(marks.containerType || (marks.containerType = {}));
        var containerType = marks.containerType;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// circleMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas CIRCLE primitives.  Can be used with animations.  Core function
        is "update()". */
        var circleMarkClass = (function (_super) {
            __extends(circleMarkClass, _super);
            function circleMarkClass(container, className) {
                _super.call(this, container, "circle", null, undefined, className);
                //vp.utils.trace("ctr", "circleMark");
            }
            // private 
            circleMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyShapeDrawingParams(elem, this._drawingParams);
            };
            return circleMarkClass;
        })(marks.markBaseClass);
        marks.circleMarkClass = circleMarkClass;
        function createCircleMark(container, className) {
            return new circleMarkClass(container, className);
        }
        marks.createCircleMark = createCircleMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// ellipseMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas ellipse primitives.  Can be used with animations.  Core function
        is "update()". */
        var ellipseMarkClass = (function (_super) {
            __extends(ellipseMarkClass, _super);
            function ellipseMarkClass(container, className) {
                _super.call(this, container, "ellipse", null, false, className);
                //vp.utils.trace("ctr", "ellipseMark");
            }
            // private 
            ellipseMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyShapeDrawingParams(elem, this._drawingParams);
            };
            return ellipseMarkClass;
        })(marks.markBaseClass);
        marks.ellipseMarkClass = ellipseMarkClass;
        function createEllipseMark(container, className) {
            return new ellipseMarkClass(container, className);
        }
        marks.createEllipseMark = createEllipseMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// drawingParams.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - interfaces and functions related to marks and their drawing parameter properties.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Apply the drawing parameters to the text element.  "hAdjust" and "vAdjust" allow the caller to apply
        additional positioning adjustments to those already specified in "dp". */
        function applyTextParams(elem, dp, alignText, hAdjust, vAdjust) {
            if (alignText === void 0) { alignText = true; }
            var clearMissing = true;
            if (elem != null) {
                //---- FILL ----
                if (dp && dp.fill !== undefined) {
                    vp.dom.css(elem, "fill", dp.fill);
                }
                else if (clearMissing && elem.style.fill != "") {
                    vp.dom.css(elem, "fill", "");
                }
                //---- OPACITY ----
                if (dp && dp.opacity !== undefined) {
                    vp.dom.css(elem, "opacity", dp.opacity);
                }
                else if (clearMissing && elem.style.opacity != "") {
                    vp.dom.css(elem, "opacity", "");
                }
                //---- TEXT SIZE ----
                if (dp && dp.textSize !== undefined) {
                    vp.dom.css(elem, "font-size", dp.textSize);
                }
                else if (clearMissing && elem.style.fontSize != "") {
                    vp.dom.css(elem, "font-size", "");
                }
                //---- FONT FAMILY ----
                if (dp && dp.fontFamily !== undefined) {
                    vp.dom.css(elem, "font-family", dp.fontFamily);
                }
                else if (clearMissing && elem.style.fontFamily != "") {
                    vp.dom.css(elem, "font-family", "");
                }
                if (dp && dp.fontWeight !== undefined) {
                    vp.dom.css(elem, "font-weight", dp.fontWeight);
                }
                else if (clearMissing && elem.style.fontWeight != "") {
                    vp.dom.css(elem, "font-weight", "");
                }
                //---- TEXT LABEL ----
                if (dp && dp.textLabel !== undefined) {
                    vp.dom.text(elem, dp.textLabel);
                }
                //---- "text" isn't safe to zap (and is unlikely to have been set in theme) ----
                //else if (clearMissing && elem.textContent != "")
                //{
                //    vp.dom.text(elem, "")
                //}
                if (alignText) {
                    //---- HALIGN, VALIGN ----
                    var hAlign = (dp) ? dp.hAlign : null;
                    if (hAdjust) {
                        hAlign = hAdjust.value + (hAdjust.sign * hAlign);
                    }
                    var vAlign = (dp) ? dp.vAlign : null;
                    if (vAdjust) {
                        vAlign = vAdjust.value + (vAdjust.sign * vAlign);
                    }
                    //---- DX and DY seem to be ATTR only ----
                    if (hAlign || vAlign) {
                        var adjust = calculateTextAdjust(elem, hAlign, vAlign);
                        vp.dom.attr(elem, "dx", adjust.x);
                        vp.dom.attr(elem, "dy", adjust.y);
                    }
                }
            }
        }
        marks.applyTextParams = applyTextParams;
        /// use the "hAlign" and "vAlign" property values to calculate the x/y adjustment
        /// needed for the text. requires the text element with the final text applied to it
        /// (and it should be attached to the document) so that it can be correctly measured.  
        ///
        /// return the adjustment as a {x, y} object.
        function calculateTextAdjust(textElem, hAlign, vAlign) {
            var hvals = { left: 0, middle: .5, right: 1 };
            var vvals = { top: 1, middle: .5, bottom: 0 };
            var adjust = { x: 0, y: 0 };
            if (textElem) {
                //---- HALIGN ----
                if (hvals[hAlign]) {
                    hAlign = hvals[hAlign];
                }
                //---- VALIGN ----
                if (vvals[vAlign]) {
                    vAlign = vvals[vAlign];
                }
                var uelem = (textElem.length) ? textElem[0] : textElem;
                var bb = vp.dom.getBounds(uelem);
                //---- horizontal alignment defaults to: text starts at "x" ----
                adjust.x = -(bb.width * hAlign);
                //---- UNROATED TEXT: vertical alignment defaults to: CENTER LINE of text is at "y" ----
                adjust.y = (1 - .25 - vAlign) * bb.height; // the ".25" is an asthetic adjustment for vertical alignment
            }
            return adjust;
        }
        marks.calculateTextAdjust = calculateTextAdjust;
        function applyLineParams(element, dp) {
            if ((element != null) && (dp != null)) {
                //---- use "css" to override values in CSS style sheets (vs. "attr") ----
                if (dp.stroke !== undefined) {
                    vp.dom.css(element, "stroke", dp.stroke);
                }
                if (dp.opacity !== undefined) {
                    vp.dom.css(element, "opacity", dp.opacity);
                }
                if (dp.lineSize !== undefined) {
                    vp.dom.css(element, "stroke-width", dp.lineSize);
                }
                if (dp.lineType !== undefined) {
                    var dashArray = vp.utils.lineTypeToDashArray(dp.lineType);
                    vp.dom.css(element, "stroke-dasharray", dashArray);
                }
            }
        }
        marks.applyLineParams = applyLineParams;
        function applyShapeDrawingParams(elem, dp) {
            if ((elem != null) && (dp != null)) {
                if (dp.stroke !== undefined) {
                    vp.dom.css(elem, "stroke", dp.stroke);
                }
                if (dp.fill !== undefined) {
                    vp.dom.css(elem, "fill", dp.fill);
                }
                if (dp.opacity !== undefined) {
                    vp.dom.css(elem, "opacity", dp.opacity);
                }
                if (dp.lineType !== undefined) {
                    var lineType = vp.utils.lineTypeToDashArray(dp.lineType);
                    vp.dom.attr(elem, "stroke-dasharray", lineType);
                }
                if (dp.lineSize !== undefined) {
                    vp.dom.attr(elem, "stroke-width", dp.lineSize);
                }
            }
        }
        marks.applyShapeDrawingParams = applyShapeDrawingParams;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// groupMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas group primitives.  Can be used with animations.  Core function
        is "update()". */
        var groupMarkClass = (function (_super) {
            __extends(groupMarkClass, _super);
            function groupMarkClass(container, className) {
                _super.call(this, container, "g", null, false, className);
                //vp.utils.trace("ctr", "groupMark");
            }
            return groupMarkClass;
        })(marks.markBaseClass);
        marks.groupMarkClass = groupMarkClass;
        function createGroupMark(container, className) {
            return new groupMarkClass(container, className);
        }
        marks.createGroupMark = createGroupMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// glBuilder.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** WebGL helper class for marks. */
        var glBuilderClass = (function () {
            function glBuilderClass(canvas, glShapeName) {
                this._trans3d = null; // our current elevation-based camera
                this._animation = null;
                this._usingPosition = false;
                this._shapeVertices = null;
                this._usingWidth = false;
                this._randomVectors = {};
                //---- stats ----
                this._animStartTime = 0;
                this._animFrameCount = 0;
                this._animFPS = 0;
                this._shapesDrawn = 0;
                this._statsCallback = null;
                this._canvas = canvas;
                this._gl = canvas.getContext("webgl");
                this._glShapeName = glShapeName;
                //vp.utils.trace("ctr", "glBuilder");
                if (!this._gl) {
                    this._gl = canvas.getContext("experimental-webgl");
                }
                if (!this._gl) {
                    alert("Your browser does not support WebGL");
                    return;
                }
                var rotation = 0;
                var elevation = 90;
                var width = vp.select(canvas).width();
                var height = vp.select(canvas).height();
                this._trans3d = vp.plotBox.createTransform3d(width, height, rotation, elevation, 0, width, 0, height, -1, 1);
            }
            glBuilderClass.prototype.init = function (data, glParams, fromGlParams) {
                this._gl.viewportWidth = this._canvas.width;
                this._gl.viewportHeight = this._canvas.height;
                this.initBuffers(data, glParams, fromGlParams);
                this.initShaders(glParams, fromGlParams);
            };
            glBuilderClass.prototype.updateScreenSize = function (w, h) {
                var changed = false;
                //---- prevent negative numbers ----
                w = Math.max(0, w);
                h = Math.max(0, h);
                var gl = this._gl;
                if (gl) {
                    if (w != gl.viewportWidth) {
                        gl.viewportWidth = w;
                        changed = true;
                    }
                    if (h != gl.viewportHeight) {
                        gl.viewportHeight = h;
                        changed = true;
                    }
                }
                if (changed) {
                    this._trans3d
                        .screenWidth(w)
                        .screenHeight(h)
                        .xMax(w)
                        .yMax(h)
                        .rebuild();
                }
            };
            glBuilderClass.prototype.buildVertexShader = function (glParams, fromGlParams) {
                var usePosition = this._usingPosition;
                var a = "//---- data buffers ----\n";
                a += "attribute float index;\n";
                if (usePosition) {
                    var vdim = this._shapeVertices.length / 3;
                    a += "attribute float vertexIndex_;\n";
                }
                for (var i = 0; i < glParams.dataColNames.length; i++) {
                    var colName = glParams.dataColNames[i];
                    a += "attribute float " + colName + ";\n";
                }
                for (var i = 0; i < glParams.randomColNames.length; i++) {
                    var colName = glParams.randomColNames[i];
                    a += "attribute float " + colName + ";\n";
                }
                a += "\n";
                a += "//---- constants ----\n";
                if (usePosition) {
                    a += "uniform vec3 vertices_[" + vdim + "];\n";
                }
                a += "uniform mat4 mvpMatrix_;\n";
                a += "uniform vec3 colors_[3];\n";
                a += "uniform float colorIndex_;\n";
                if (fromGlParams) {
                    a += "uniform float colorIndexFrom_;\n";
                    a += "uniform float percent_;\n";
                }
                a += "\n";
                a += "//---- shader output variables ----\n";
                a += "varying vec4 vColor;\n";
                a += "\n";
                a += "%functions%";
                a += "void main(void)\n";
                a += "{\n";
                a += "%cmds%";
                a += "  vColor = color_;\n";
                if (usePosition) {
                    if (this._usingWidth) {
                        a += "  vec3 v_ = vertices_[int(vertexIndex_)];\n";
                        a += "  vec3 pos_ = vec3(v_.x * width_, v_.y * height_, 0) + vec3(x_, y_, 0.0);\n";
                        a += "  gl_Position = mvpMatrix_ * vec4(pos_, 1.0);\n";
                    }
                    else {
                        a += "  vec3 pos_ = vertices_[int(vertexIndex_)] * size_ + vec3(x_, y_, 0.0);\n";
                        a += "  gl_Position = mvpMatrix_ * vec4(pos_, 1.0);\n";
                    }
                }
                else {
                    a += "  gl_Position = mvpMatrix_ * vec4(x_, y_, 0.0, 1.0);\n";
                    a += "  gl_PointSize = size_;  \n";
                }
                a += "}\n";
                return a;
            };
            glBuilderClass.prototype.fragShader = function () {
                var a = "\n \
                     precision mediump float;\n \
                     varying vec4 vColor;\n \
                            \n \
                     void main(void )\n \
                     {\n \
                        gl_FragColor =  vColor;  \n \
                     }\n \
                ";
                return a;
            };
            glBuilderClass.prototype.clear = function () {
                if (this._gl) {
                    var gl = this._gl;
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                }
            };
            glBuilderClass.prototype.drawScene = function (data, transition, glParams, fromGlParams) {
                var _this = this;
                this._usingPosition = (this._glShapeName != "point");
                this.init(data, glParams, fromGlParams);
                var gl = this._gl;
                //---- clear screen with BLACK color ----
                var cr = vp.select(this._canvas).css("background-color");
                var bg = vp.color.getColorFromString(cr);
                gl.clearColor(bg[0] / 255, bg[1] / 255, bg[2] / 255, 1);
                gl.enable(gl.DEPTH_TEST);
                //gl.enable(0x8642);     // gl.PROGRAM_POINT_SIZE  (undefined in some browsers)
                //gl.pointSize(33);      // for some reason, this one was not implemented (but vertex shader DOES support gl_pointSize)
                //---- enable blending ----
                gl.enable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST); // must turn off (takes priority over blending)
                //---- IE11 bug workaround - use simple blending because IE11 doesn't support the below alternative ----
                //gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                //---- set the shader constants ----
                this.setShaderConstants(glParams, fromGlParams);
                gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                //---- set up buffer mapping ----
                var floats = 1; // index
                if (this._usingPosition) {
                    floats++;
                }
                floats += glParams.dataColNames.length;
                floats += glParams.randomColNames.length;
                var strideInBytes = floats * 4;
                var buffOffset = 0;
                if (this._shaderProgram.alIndex > -1) {
                    gl.vertexAttribPointer(this._shaderProgram.alIndex, 1, gl.FLOAT, false, strideInBytes, buffOffset);
                }
                buffOffset += 4; // we always add INDEX data, so always offset by 4 here
                if (this._usingPosition) {
                    if (this._shaderProgram.alVertexIndex > -1) {
                        gl.vertexAttribPointer(this._shaderProgram.alVertexIndex, 1, gl.FLOAT, false, strideInBytes, buffOffset);
                    }
                    buffOffset += 4;
                }
                for (var i = 0; i < glParams.dataColNames.length; i++) {
                    var dataColName = glParams.dataColNames[i];
                    if (this._shaderProgram[dataColName] > -1) {
                        gl.vertexAttribPointer(this._shaderProgram[dataColName], 1, gl.FLOAT, false, strideInBytes, buffOffset);
                    }
                    buffOffset += 4;
                }
                for (var i = 0; i < glParams.randomColNames.length; i++) {
                    var randColName = glParams.randomColNames[i];
                    if (this._shaderProgram[randColName] > -1) {
                        gl.vertexAttribPointer(this._shaderProgram[randColName], 1, gl.FLOAT, false, strideInBytes, buffOffset);
                    }
                    buffOffset += 4;
                }
                this.drawSceneFrame(0);
                //---- start an animation ----
                if (fromGlParams && transition) {
                    var update = transition.update();
                    var duration = update.duration();
                    var easing = update.easeObj();
                    var delay = update.delay();
                    this._animStartTime = vp.utils.now();
                    this._animFrameCount = 0;
                    var animation = vp.animation.createAnimation(null, duration, easing, null, delay)
                        .onFrame(function (percent) {
                        _this.drawSceneFrame(percent);
                    })
                        .onAnimationComplete(function () {
                        var elapsed = vp.utils.now() - _this._animStartTime;
                        _this._animFPS = Math.round(_this._animFrameCount / (elapsed / 1000));
                        if (_this._statsCallback) {
                            _this._statsCallback(_this._animFPS, _this._shapesDrawn, elapsed);
                        }
                    });
                    animation.restart(); // have to start these manually since we are not adding child animations
                }
            };
            glBuilderClass.prototype.drawSceneFrame = function (percent) {
                var gl = this._gl;
                //---- clear viewport ----
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                //---- update percent constant ----
                this._gl.uniform1f(this._shaderProgram.ulPercent, percent);
                //vp.utils.debug("drawSceneFrame: percent=" + percent);
                //---- DRAW PRIMITIVES ----
                if (this._usingPosition) {
                    gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.numItems);
                }
                else {
                    gl.drawArrays(gl.POINTS, 0, this._vertexBuffer.numItems);
                }
                this._shapesDrawn = this._vertexBuffer.numItems;
                this._animFrameCount++;
            };
            glBuilderClass.prototype.applyShaderParams = function (shader, glParams, fromGlParams) {
                var cmd = "  float x_ = " + glParams.x + ";\n";
                cmd += "  float y_ = " + glParams.y + ";\n";
                if (this._usingWidth) {
                    cmd += "  float width_ = " + glParams.width + ";\n";
                    cmd += "  float height_ = " + glParams.height + ";\n";
                }
                else if (this._glShapeName == "line2d") {
                    cmd += "  float size_ = 1.0;\n";
                    cmd += "  float strokeWidth_ = " + glParams.strokeWidth + ";\n";
                }
                else {
                    cmd += "  float size_ = " + glParams.size + ";\n";
                }
                cmd += "  float opacity_ = " + glParams.opacity + ";\n";
                cmd += "  vec4 color_ = vec4(colors_[int(colorIndex_)], opacity_);\n";
                cmd += "\n";
                var cmds = glParams.cmds + cmd;
                if (fromGlParams) {
                    //--- run code in a inner block so we avoid variable name conflicts ----
                    var cmdFrom = "\n";
                    cmdFrom += "  if (percent_ < 1.0)\n";
                    cmdFrom += "  {\n";
                    cmdFrom += fromGlParams.cmds;
                    cmdFrom += "\n";
                    cmdFrom += "    float xFrom_ = " + fromGlParams.x + ";\n";
                    cmdFrom += "    float yFrom_ = " + fromGlParams.y + ";\n";
                    cmdFrom += "    float sizeFrom_ = " + fromGlParams.size + ";\n";
                    cmdFrom += "    vec4 colorFrom_ = vec4(colors_[int(colorIndexFrom_)], 1.0);\n";
                    cmdFrom += "\n";
                    cmdFrom += "    x_ = mix(xFrom_, x_, percent_);\n";
                    cmdFrom += "    y_ = mix(yFrom_, y_, percent_);\n";
                    cmdFrom += "    size_ = mix(sizeFrom_, size_, percent_);\n";
                    cmdFrom += "    color_ = mix(colorFrom_, color_, percent_);\n";
                    cmdFrom += "  }\n";
                    cmds += cmdFrom;
                }
                //---- add translated statements ----
                var str = shader.replace(/%functions%/, glParams.functions);
                var str = str.replace(/%cmds%/, cmds);
                return str;
            };
            glBuilderClass.prototype.getShader = function (gl, id, glParams, fromGlParams) {
                var str = (id == "shader-fs") ? this.fragShader() : this.buildVertexShader(glParams, fromGlParams);
                var shader;
                if (id == "shader-fs") {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                }
                else if (id == "shader-vs") {
                    str = this.applyShaderParams(str, glParams, fromGlParams);
                    //---- store for easy access by VuePlot eBook UI ----
                    var w = window;
                    if (w.setVertexShader) {
                        w.setVertexShader(this._canvas, str);
                    }
                    shader = gl.createShader(gl.VERTEX_SHADER);
                }
                else {
                    return null;
                }
                gl.shaderSource(shader, str);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    alert(gl.getShaderInfoLog(shader));
                    return null;
                }
                return shader;
            };
            glBuilderClass.prototype.initShaders = function (glParams, fromGlParams) {
                var w = window;
                var gl = this._gl;
                this._shaderProgram = this._gl.createProgram();
                var program = this._shaderProgram;
                var fragmentShader = this.getShader(this._gl, "shader-fs", null, null);
                var vertexShader = this.getShader(this._gl, "shader-vs", glParams, fromGlParams);
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    alert("Could not initialise shaders");
                }
                gl.useProgram(program);
                //---- attribute locations ----
                //---- map "index" to buffer ----
                program.alIndex = gl.getAttribLocation(program, "index");
                if (program.alIndex > -1) {
                    gl.enableVertexAttribArray(program.alIndex);
                }
                program.alVertexIndex = gl.getAttribLocation(program, "vertexIndex_");
                if (program.alVertexIndex > -1) {
                    gl.enableVertexAttribArray(program.alVertexIndex);
                }
                for (var i = 0; i < glParams.dataColNames.length; i++) {
                    var dataColName = glParams.dataColNames[i];
                    program[dataColName] = gl.getAttribLocation(program, dataColName);
                    if (program[dataColName] > -1) {
                        gl.enableVertexAttribArray(program[dataColName]);
                    }
                }
                for (var i = 0; i < glParams.randomColNames.length; i++) {
                    var randColName = glParams.randomColNames[i];
                    program[randColName] = gl.getAttribLocation(program, randColName);
                    if (program[randColName] > -1) {
                        gl.enableVertexAttribArray(program[randColName]);
                    }
                }
                //---- constant locations ----
                program.ulVertices = gl.getUniformLocation(program, "vertices_");
                program.ulColors = gl.getUniformLocation(program, "colors_");
                program.ulColorIndex = gl.getUniformLocation(program, "colorIndex_");
                program.ulColorIndexFrom = gl.getUniformLocation(program, "colorIndexFrom_");
                program.mvpMatrixUniform = gl.getUniformLocation(program, "mvpMatrix_");
                program.ulPercent = gl.getUniformLocation(program, "percent_");
                //alert("shaders initialized");
            };
            glBuilderClass.prototype.setShaderConstants = function (glParams, fromGlParams) {
                var gl = this._gl;
                var program = this._shaderProgram;
                this._gl.uniform1f(this._shaderProgram.ulPercent, 0);
                var usingStroke = (this._glShapeName == "line2d");
                //---- color palette ----
                var cr = (usingStroke) ? glParams.stroke : glParams.fill;
                if (!cr || cr.length != 3) {
                    cr = [0, 0, 0];
                }
                var crFrom = [.7, .2, .2]; // red
                if (fromGlParams) {
                    crFrom = (usingStroke) ? fromGlParams.stroke : fromGlParams.fill;
                    if (!crFrom || crFrom.length != 3) {
                        crFrom = [.7, .2, .2];
                    }
                }
                gl.uniform3fv(program.ulColors, [
                    cr[0], cr[1], cr[2],
                    crFrom[0], crFrom[1], crFrom[2],
                    .2, .2, .7]); // blue
                if (this._shapeVertices) {
                    gl.uniform3fv(program.ulVertices, this._shapeVertices);
                }
                gl.uniform1f(this._shaderProgram.ulColorIndex, 0); // to color 
                gl.uniform1f(this._shaderProgram.ulColorIndexFrom, 1); // from color 
                //---- set MATRIX from camera ----
                var mvp = this._trans3d.getMatrix();
                gl.uniformMatrix4fv(program.mvpMatrixUniform, false, mvp.toArray());
            };
            glBuilderClass.prototype.initBuffers = function (data, glParams, fromGlParams) {
                this._vertexBuffer = this._gl.createBuffer();
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
                var vertexBuff = [];
                var shape = this._glShapeName;
                var verticesPerRecord = 0;
                //---- add INDEX and SHAPE info ----
                if (shape == "point") {
                    verticesPerRecord = this.setPointVertices(data);
                }
                else if (shape == "triangle") {
                    verticesPerRecord = this.setTriangleVertices(data);
                }
                else if (shape == "rect2d") {
                    verticesPerRecord = this.setRect2dVertices(data);
                }
                else if (shape == "line2d") {
                    verticesPerRecord = this.setLine2dVertices(data);
                }
                else {
                    throw "Error: unsupported WebGl mark shape=" + shape;
                }
                //---- this number is independent of stride per vertex ----
                this._vertexBuffer.numItems = (verticesPerRecord == 0) ? (data.length) : (verticesPerRecord * data.length);
                //---- pack all the data into vertexBuff ----
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < Math.max(1, verticesPerRecord); j++) {
                        //---- add a triangle vertex index----
                        vertexBuff.push(i); // record index
                        if (verticesPerRecord > 0) {
                            vertexBuff.push(j); // vertex index          
                        }
                        //---- add data for columns referenced ----
                        for (var c = 0; c < glParams.origColNames.length; c++) {
                            var colName = glParams.origColNames[c];
                            if (colName == "value_number") {
                                var value = +data[i];
                            }
                            else {
                                var value = +data[i][colName];
                            }
                            vertexBuff.push(value); // data column value
                        }
                        //---- add RANDOM data columns ----
                        for (var c = 0; c < glParams.randomColNames.length; c++) {
                            var colName = "random" + (c + 1) + "_";
                            var vector = this.getRandomVector(colName, data.length);
                            var value = vector[i];
                            vertexBuff.push(value); // data column value
                        }
                    }
                }
                //var colCount = glParams.origColNames.length;
                this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertexBuff), this._gl.STATIC_DRAW);
                //alert("buffers initialized");
            };
            glBuilderClass.prototype.getRandomVector = function (name, count) {
                var vector = this._randomVectors[name];
                if (vector === undefined) {
                    vector = [];
                    for (var i = 0; i < count; i++) {
                        vector.push(Math.random());
                    }
                    this._randomVectors[name] = vector;
                }
                else if (vector.length < count) {
                    var oldCount = vector.length;
                    for (var i = oldCount; i < count; i++) {
                        vector.push(Math.random());
                    }
                }
                return vector;
            };
            glBuilderClass.prototype.setPointVertices = function (data) {
                this._shapeVertices = null;
                this._usingWidth = false;
                return 0;
            };
            glBuilderClass.prototype.setTriangleVertices = function (data) {
                var verticesPerRecord = 3;
                //---- single triangle: X, Y, Z ----
                var vertices = [
                    -.5, .5, 0,
                    .5, .5, 0,
                    .0, -.5, 0,
                ];
                this._shapeVertices = vertices;
                this._usingWidth = false;
                return verticesPerRecord;
            };
            glBuilderClass.prototype.setRect2dVertices = function (data) {
                var vertexBuff = [];
                var verticesPerRecord = 6;
                //---- draw with x,y in upper left corner ----
                var vertices = [
                    1, 1, 0,
                    0, 1, 0,
                    0, 0, 0,
                    1, 1, 0,
                    0, 0, 0,
                    1, 0, 0,
                ];
                this._shapeVertices = vertices;
                this._usingWidth = true;
                return verticesPerRecord;
            };
            glBuilderClass.prototype.setLine2dVertices = function (data) {
                var vertexBuff = [];
                var verticesPerRecord = 6;
                //---- draw with x,y in upper left corner ----
                var vertices = [
                    1, 1, 0,
                    0, 1, 0,
                    0, 0, 0,
                    1, 1, 0,
                    0, 0, 0,
                    1, 0, 0,
                ];
                this._shapeVertices = vertices;
                this._usingWidth = false;
                return verticesPerRecord;
            };
            glBuilderClass.prototype.statsCallback = function (value) {
                this._statsCallback = value;
                return this;
            };
            return glBuilderClass;
        })();
        marks.glBuilderClass = glBuilderClass;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// imageMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas image primitives.  Can be used with animations.  Core function
        is "update()". */
        var imageMarkClass = (function (_super) {
            __extends(imageMarkClass, _super);
            function imageMarkClass(container, className) {
                _super.call(this, container, "image", null, false, className);
                //vp.utils.trace("ctr", "imageMark");
            }
            return imageMarkClass;
        })(marks.markBaseClass);
        marks.imageMarkClass = imageMarkClass;
        function createImageMark(container, className) {
            return new imageMarkClass(container, className);
        }
        marks.createImageMark = createImageMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// jsParser.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Used to translate JavaScript shader functions into GL shader statements and expressions. */
        var jsParserClass = (function () {
            function jsParserClass() {
                this._context = null;
            }
            jsParserClass.prototype.makeRecordColumnName = function (name) {
                name = name.replace(/ /g, "_");
                return "data_" + name + "_";
            };
            jsParserClass.prototype.colorToGlColor = function (ca) {
                if ((ca.indexOf(",") > -1) && (ca.indexOf("(") == -1)) {
                    //---- its a string of 3 rgb numbers ----
                    ca = ca.split(",");
                }
                else {
                    ca = vp.color.getColorFromString(ca);
                }
                //---- GL wants normalized colors ----
                if (!ca) {
                    ca = [0, 0, 0];
                }
                else {
                    ca = [ca[0] / 255, ca[1] / 255, ca[2] / 255];
                }
                return ca;
            };
            jsParserClass.prototype.removeQuotes = function (name) {
                name = name.trim();
                if (name.startsWith("\"")) {
                    name = name.substr(1, name.length - 2).trim(); // remove quotes
                }
                return name;
            };
            jsParserClass.prototype.fixupNumber = function (value) {
                //---- ensure number is a float ----
                if (value.indexOf(".") == -1) {
                    value += ".0";
                }
                return value;
            };
            jsParserClass.prototype.processRecordColumn = function (token, attrBlock) {
                //---- make sure we only add name once ----
                var newColumn = false;
                if (attrBlock.origColNames.indexOf(token) == -1) {
                    attrBlock.origColNames.push(token);
                    newColumn = true;
                }
                //---- make the flat name safe for mixing with other user code ----
                token = this.makeRecordColumnName(token);
                if (newColumn) {
                    attrBlock.dataColNames.push(token);
                }
                return token;
            };
            jsParserClass.prototype.translateExp = function (line, usage, attrBlock) {
                var isCdRef = false;
                var isMathRef = false;
                var isvpRef = false;
                var isRecordRef = false;
                var isFirstToken = true;
                var scanner = new vp.utils.scanner(line);
                var tt = scanner.scan();
                var exp = "";
                while (tt != vp.utils.TokenType.eof) {
                    var token = scanner.token();
                    if (tt == vp.utils.TokenType.number) {
                        token = this.fixupNumber(token);
                        exp += " " + token;
                    }
                    else if (tt == vp.utils.TokenType.operator) {
                        if (token == ".") {
                            if (isCdRef || isMathRef || isvpRef || isRecordRef) {
                                token = null;
                            }
                        }
                        else if (isRecordRef) {
                            //---- code used "record" without the dot qualified - record is really just a number ----
                            var lastToken = this.processRecordColumn("value", attrBlock);
                            exp += " " + lastToken;
                        }
                        //---- output the operator ----
                        if (token) {
                            exp += " " + token;
                        }
                    }
                    else if (tt == vp.utils.TokenType.id) {
                        if (token == "Math") {
                            isMathRef = true;
                            token = null;
                        }
                        else if (token == "cd") {
                            isCdRef = true;
                            token = null;
                        }
                        else if (token == "vp") {
                            isvpRef = true;
                            token = null;
                        }
                        else if (token == "record") {
                            isRecordRef = true;
                            token = null;
                        }
                        else {
                            if (isMathRef) {
                                //---- just handle the exceptions since most are supported ----
                                if (token == "PI") {
                                    token = "3.14159265";
                                }
                                else if (token == "random") {
                                    var count = attrBlock.randomColNames.length + 1;
                                    var randColName = "random" + count + "_";
                                    attrBlock.randomColNames.push(randColName);
                                    token = randColName;
                                    //---- effectively remove the () in the input string ----
                                    scanner.scan(); // skip over "random" to "()"
                                }
                                else {
                                }
                            }
                            else if (isCdRef) {
                                token = this._context[token];
                                //---- is it a number? ----
                                if (!isNaN(+token)) {
                                    token = this.fixupNumber(token + "");
                                }
                            }
                            else if (isRecordRef) {
                                token = this.processRecordColumn(token, attrBlock);
                            }
                            else if (isvpRef) {
                                //---- vp.select(elem) line; just ignore it ----
                                break;
                            }
                            isCdRef = false;
                            isMathRef = false;
                            isvpRef = false;
                            isRecordRef = false;
                        }
                        if (token == "var") {
                            token = "float";
                        }
                        else if (token == "function" && isFirstToken) {
                            //---- the function header - ignore this line ----
                            break;
                        }
                        if (token) {
                            exp += " " + token;
                        }
                    }
                    else if (tt == vp.utils.TokenType.string) {
                        exp += " " + token;
                    }
                    else {
                    }
                    tt = scanner.scan();
                }
                if (isRecordRef) {
                    //---- code used "record" without the dot qualified - record is really just a number ----
                    var lastToken = this.processRecordColumn("value_number", attrBlock);
                    exp += " " + lastToken;
                }
                if (usage == "color") {
                    var str = this.removeQuotes(exp);
                    exp = this.colorToGlColor(str);
                }
                return exp;
            };
            jsParserClass.prototype.translateJsStatements = function (lines, attrBlock) {
                var bracketLevel = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (line.startsWith(".attr(")) {
                        this.translateAttrCall(line, attrBlock);
                        continue;
                    }
                    else if (line.startsWith("function")) {
                        //---- skip this line ----
                        continue;
                    }
                    else if (line.startsWith("vp.select(")) {
                        //---- skip this line ----
                        continue;
                    }
                    else if (line == "{") {
                        bracketLevel++;
                        if (bracketLevel == 1) {
                            continue;
                        }
                    }
                    else if (line == "}") {
                        bracketLevel--;
                        if (bracketLevel == 0) {
                            continue;
                        }
                    }
                    var cmd = this.translateExp(line, "cmd", attrBlock);
                    if (cmd && cmd.trim() != "") {
                        attrBlock.cmds += cmd + "\n";
                    }
                }
            };
            jsParserClass.prototype.translateAttrCall = function (line, attrBlock) {
                var part = line.substr(6); // skip over ".attr("
                if (part.length && part[part.length - 1] == ")") {
                    part = part.substr(0, part.length - 1).trim();
                }
                //---- divide pair at first space ----
                var name = part;
                var value = "";
                var index = part.indexOf(" ");
                if (index > -1) {
                    name = part.substr(0, index).trim();
                    value = part.substr(index + 1).trim();
                }
                if (name.length && name[name.length - 1] == ",") {
                    //---- remove trailing comma ----
                    name = name.substr(0, name.length - 1).trim();
                }
                name = this.removeQuotes(name);
                if (name == "width") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.width = value;
                }
                else if (name == "height") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.height = value;
                }
                else if (name == "size") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.size = value;
                }
                else if (name == "stroke-width") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.strokeWidth = value;
                }
                else if (name == "opacity") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.opacity = value;
                }
                else if (name == "fill") {
                    value = this.translateExp(value, "color", attrBlock);
                    attrBlock.fill = value;
                }
                else if (name == "stroke") {
                    value = this.translateExp(value, "color", attrBlock);
                    attrBlock.stroke = value;
                }
                else if (name == "x" || name == "cx") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.x = value;
                }
                else if (name == "y" || name == "cy") {
                    value = this.translateExp(value, "number", attrBlock);
                    attrBlock.y = value;
                }
            };
            jsParserClass.prototype.getGlParams = function (shaderCallback, context) {
                this._context = context;
                var size = "20.0";
                var fill = [0, 0, 1, 1]; // blue
                var stroke = [0, 0, 1, 1]; // blue
                var x = ".5";
                var y = ".5";
                var cmds = "";
                var attrBlock = {
                    size: size, width: size, height: size, fill: fill, stroke: stroke, x: x, y: y, opacity: "1.0", strokeSize: 1,
                    cmds: cmds, origColNames: [], dataColNames: [], randomColNames: [], functions: "",
                };
                var code = shaderCallback.toString();
                //alert("code=" + code);
                var lines = code.split("\n");
                this.translateJsStatements(lines, attrBlock);
                //if (attrBlock.randomCount)
                //{
                //    //---- use von Neumann's middle square method, with slight modification ----
                //    var rf = "float random(float seed1, float seed2)\n";
                //    rf += "{\n";
                //    rf += "  seed1 = seed1 + 17.3;\n";
                //    rf += "  seed2 = seed2 + 29.1;\n";
                //    rf += "  seed1 = fract((seed1*seed1 + seed2*seed2)*1024.0);\n";
                //    rf += "  return seed1;\n";
                //    rf += "}\n\n";
                //    attrBlock.functions += rf;
                //}
                return attrBlock;
            };
            return jsParserClass;
        })();
        marks.jsParserClass = jsParserClass;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// lineMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas line primitives.  Can be used with animations.  Core function
        is "update()". */
        var lineMarkClass = (function (_super) {
            __extends(lineMarkClass, _super);
            function lineMarkClass(container, className) {
                _super.call(this, container, "line", null, false, className);
                //vp.utils.trace("ctr", "lineMark");
            }
            // private 
            lineMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyLineParams(elem, this._drawingParams);
            };
            return lineMarkClass;
        })(marks.markBaseClass);
        marks.lineMarkClass = lineMarkClass;
        function createLineMark(container, className) {
            return new lineMarkClass(container, className);
        }
        marks.createLineMark = createLineMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// pathMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas path primitives.  Can be used with animations.  Core function
        is "update()". */
        var pathMarkClass = (function (_super) {
            __extends(pathMarkClass, _super);
            function pathMarkClass(container, className) {
                _super.call(this, container, "path", null, false, className);
                //vp.utils.trace("ctr", "pathMark");
            }
            // private 
            pathMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyShapeDrawingParams(elem, this._drawingParams);
            };
            return pathMarkClass;
        })(marks.markBaseClass);
        marks.pathMarkClass = pathMarkClass;
        function createPathMark(container, className) {
            return new pathMarkClass(container, className);
        }
        marks.createPathMark = createPathMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// pointMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of WebGL POINT primitives.  Can be used with animations.  Core function
        is "update()". */
        var pointMarkClass = (function (_super) {
            __extends(pointMarkClass, _super);
            function pointMarkClass(container, useWebGl, className) {
                _super.call(this, container, "rect", "point", useWebGl, className);
                //vp.utils.trace("ctr", "pointMark");
            }
            pointMarkClass.prototype.postProcessShape = function (element) {
                var wrap = vp.select(element);
                var size = wrap.attr("size");
                wrap
                    .attr("width", size)
                    .attr("height", size);
            };
            return pointMarkClass;
        })(marks.markBaseClass);
        marks.pointMarkClass = pointMarkClass;
        function createPointMark(container, className) {
            return new pointMarkClass(container, false, className);
        }
        marks.createPointMark = createPointMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// rect2dMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of WebGL rect2d primitives.  Can be used with animations.  Core function
        is "update()". */
        var rect2dMarkClass = (function (_super) {
            __extends(rect2dMarkClass, _super);
            function rect2dMarkClass(container, useWebGl, className) {
                _super.call(this, container, "rect", "rect2d", useWebGl, className);
                //vp.utils.trace("ctr", "rect2dMark");
            }
            rect2dMarkClass.prototype.postProcessShape = function (element) {
                var wrap = vp.select(element);
                var size = wrap.attr("size");
                wrap
                    .attr("width", size)
                    .attr("height", size);
            };
            return rect2dMarkClass;
        })(marks.markBaseClass);
        marks.rect2dMarkClass = rect2dMarkClass;
        function createRect2dMark(container, useWebGl, className) {
            return new rect2dMarkClass(container, useWebGl, className);
        }
        marks.createRect2dMark = createRect2dMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// rectangleMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas RECT primitives.  Can be used with animations.  Core function
        is "update()". */
        var rectangleMarkClass = (function (_super) {
            __extends(rectangleMarkClass, _super);
            function rectangleMarkClass(container, className) {
                _super.call(this, container, "rect", null, false, className);
                //vp.utils.trace("ctr", "rectangleMark");
            }
            // private 
            rectangleMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyShapeDrawingParams(elem, this._drawingParams);
            };
            return rectangleMarkClass;
        })(marks.markBaseClass);
        marks.rectangleMarkClass = rectangleMarkClass;
        function createRectangleMark(container, className) {
            return new rectangleMarkClass(container, className);
        }
        marks.createRectangleMark = createRectangleMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// textMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas text primitives.  Can be used with animations.  Core function
        is "update()". */
        var textMarkClass = (function (_super) {
            __extends(textMarkClass, _super);
            function textMarkClass(container, className) {
                _super.call(this, container, "text", null, false, className);
                //vp.utils.trace("ctr", "textMark");
            }
            // private 
            textMarkClass.prototype.applyDrawingParams = function (elem) {
                marks.applyTextParams(elem, this._drawingParams);
            };
            return textMarkClass;
        })(marks.markBaseClass);
        marks.textMarkClass = textMarkClass;
        function createTextMark(container, className) {
            return new textMarkClass(container, className);
        }
        marks.createTextMark = createTextMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// triangleMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of WebGL triangle primitives.  Can be used with animations.  Core function
        is "update()". */
        var triangleMarkClass = (function (_super) {
            __extends(triangleMarkClass, _super);
            function triangleMarkClass(container, className) {
                _super.call(this, container, null, "triangle", true, className);
                //vp.utils.trace("ctr", "triangleMark");
            }
            triangleMarkClass.prototype.postProcessShape = function (element) {
                var wrap = vp.select(element);
                var size = wrap.attr("size");
                wrap
                    .attr("width", size)
                    .attr("height", size);
            };
            return triangleMarkClass;
        })(marks.markBaseClass);
        marks.triangleMarkClass = triangleMarkClass;
        function createTriangleMark(container, className) {
            return new triangleMarkClass(container, className);
        }
        marks.createTriangleMark = createTriangleMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// quadTree.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
/// quadTreeClass code adapted from this algorithm:   http://en.wikipedia.org/wiki/Quadtree
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var layouts;
    (function (layouts) {
        /** A structure for accelerating N-body type calculations. */
        var quadTreeClass = (function () {
            function quadTreeClass(points) {
                this.points = points;
                this.buildTree();
            }
            quadTreeClass.prototype.buildTree = function () {
                var points = this.points;
                var xMin = Math.floor(points.min(function (data) { return data.x; }));
                var xMax = Math.ceil(points.max(function (data) { return data.x; }));
                var yMin = Math.floor(points.min(function (data) { return data.y; }));
                var yMax = Math.ceil(points.max(function (data) { return data.y; }));
                var root = new quadNodeClass(xMin, yMin, xMax, yMax);
                this.rootNode = root;
                for (var i = 0; i < points.length; i++) {
                    var pt = points[i];
                    root.insert(pt);
                }
            };
            /** Visits each node of the tree in pre-order. */
            quadTreeClass.prototype.visit = function (callback) {
                this.rootNode.visit(callback);
            };
            /** Visits each node of the tree in post-order. */
            quadTreeClass.prototype.visitPostOrder = function (callback, visitEmptyNodes) {
                if (visitEmptyNodes === void 0) { visitEmptyNodes = false; }
                this.rootNode.postOrder(callback, visitEmptyNodes);
            };
            return quadTreeClass;
        })();
        layouts.quadTreeClass = quadTreeClass;
        var quadNodeClass = (function () {
            function quadNodeClass(left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
                this.isLeaf = true;
            }
            quadNodeClass.prototype.postOrder = function (callback, visitEmptyNodes) {
                if (this.nodes && this.nodes.length) {
                    for (var i = 0; i < this.nodes.length; i++) {
                        var childNode = this.nodes[i];
                        if (childNode.point || visitEmptyNodes) {
                            childNode.postOrder(callback, visitEmptyNodes);
                        }
                    }
                }
                callback(this, this.left, this.top, this.right, this.bottom);
            };
            quadNodeClass.prototype.insert = function (pt) {
                if (!this.containsPoint(pt)) {
                    //---- pt doesn't belong in this node ----
                    return false;
                }
                if (!this.point) {
                    this.point = pt;
                    return true;
                }
                if (!this.nodes) {
                    this.subdivide();
                }
                //---- insert in 1 of our 4 nodes ----
                for (var i = 0; i < this.nodes.length; i++) {
                    var node = this.nodes[i];
                    if (node.insert(pt)) {
                        return true;
                    }
                }
                //---- could not insert ----
                throw "Error: could not insert point in quadTree: " + pt.x + ", " + pt.y;
            };
            quadNodeClass.prototype.subdivide = function () {
                //---- create 4 subnodes ----
                if (!this.nodes) {
                    var nodes = [];
                    this.nodes = nodes;
                    var xMid = (this.right + this.left) / 2;
                    var yMid = (this.bottom + this.top) / 2;
                    //---- watch out for floating point issues are these get super small in degenerate cases ----
                    //---- where all nodes are in same approximate location ----
                    var nwNode = new quadNodeClass(this.left, this.top, xMid, yMid);
                    nodes.push(nwNode);
                    var neNode = new quadNodeClass(xMid, this.top, this.right, yMid);
                    nodes.push(neNode);
                    var swNode = new quadNodeClass(this.left, yMid, xMid, this.bottom);
                    nodes.push(swNode);
                    var seNode = new quadNodeClass(xMid, yMid, this.right, this.bottom);
                    nodes.push(seNode);
                    this.isLeaf = false;
                }
            };
            quadNodeClass.prototype.visit = function (callback) {
                var skipChildren = callback(this, this.left, this.top, this.right, this.bottom);
                if ((!skipChildren) && (this.nodes)) {
                    for (var i = 0; i < this.nodes.length; i++) {
                        var node = this.nodes[i];
                        node.visit(callback);
                    }
                }
            };
            quadNodeClass.prototype.containsPoint = function (pt) {
                var contains = false;
                if (pt.x >= this.left && pt.x <= this.right) {
                    contains = (pt.y >= this.top && pt.y <= this.bottom);
                }
                return contains;
            };
            return quadNodeClass;
        })();
        layouts.quadNodeClass = quadNodeClass;
        function createQuadTree(points) {
            return new quadTreeClass(points);
        }
        layouts.createQuadTree = createQuadTree;
    })(layouts = vp.layouts || (vp.layouts = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dragHelper.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var layouts;
    (function (layouts) {
        /** Supports dragstart, drag, dragend events. */
        var dragHelperClass = (function () {
            function dragHelperClass(ownerCallback) {
                var _this = this;
                this._onDragStartCallback = null;
                this._onDragCallback = null;
                this._onDragEndCallback = null;
                this._dragElem = null;
                this._ownerCallback = null;
                this._ownerCallback = ownerCallback;
                vp.events.attach(window, "mousemove", function (e) {
                    _this.dragging(e);
                });
                vp.events.attach(window, "mouseup", function (e) {
                    _this.endDragging(e);
                });
            }
            dragHelperClass.prototype.addElements = function (elements) {
                for (var i = 0; i < elements.length; i++) {
                    var elem = elements[i];
                    this.addElement(elem);
                }
            };
            dragHelperClass.prototype.addElement = function (elem) {
                var _this = this;
                vp.select(elem)
                    .attach("mousedown", function (e) {
                    _this.startDragging(e);
                });
            };
            dragHelperClass.prototype.startDragging = function (e) {
                this._dragElem = e.target;
                if (this._ownerCallback) {
                    this._ownerCallback("dragstart", this._dragElem, e);
                }
                if (this._onDragStartCallback) {
                    this._onDragStartCallback(e);
                }
            };
            dragHelperClass.prototype.dragging = function (e) {
                if (this._dragElem) {
                    if (this._ownerCallback) {
                        this._ownerCallback("drag", this._dragElem, e);
                    }
                    if (this._onDragCallback) {
                        this._onDragCallback(e);
                    }
                }
            };
            dragHelperClass.prototype.endDragging = function (e) {
                var elem = this._dragElem;
                if (elem) {
                    this._dragElem = null;
                    if (this._ownerCallback) {
                        this._ownerCallback("dragend", elem, e);
                    }
                    if (this._onDragEndCallback) {
                        this._onDragEndCallback(e);
                    }
                }
            };
            dragHelperClass.prototype.onDragStart = function (callback) {
                if (arguments.length == 0) {
                    return this._onDragStartCallback;
                }
                this._onDragStartCallback = callback;
                return this;
            };
            dragHelperClass.prototype.onDrag = function (callback) {
                if (arguments.length == 0) {
                    return this._onDragCallback;
                }
                this._onDragCallback = callback;
                return this;
            };
            dragHelperClass.prototype.onDragEnd = function (callback) {
                if (arguments.length == 0) {
                    return this._onDragEndCallback;
                }
                this._onDragEndCallback = callback;
                return this;
            };
            return dragHelperClass;
        })();
        layouts.dragHelperClass = dragHelperClass;
    })(layouts = vp.layouts || (vp.layouts = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// forceLayout.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var layouts;
    (function (layouts) {
        /// TODO: [in-progress] debug Barnes-Hut technique to speed-up node-to-node charge calculations...
        /** Layout of nodes and optional links using force directed layout. Supports start, tick, and end events. */
        var forceLayoutClass = (function () {
            function forceLayoutClass() {
                this._alpha = 0; // simulated annealing "heat" parameter
                this._friction = .9;
                this._gravity = .1;
                this._charge = -30; // number or callback func
                this._width = 100;
                this._height = 100;
                this._linkDistance = 20;
                this._linkStrength = 1;
                this._chargeDistance = Infinity;
                this._theta = .8; // Barnes-Hut parameter
                this._tickCount = 0; // stats (count the # of ticks per "sim cycle"
                this._onStartCallback = null;
                this._onTickCallback = null;
                this._onEndCallback = null;
                this._lastTickTime = 0;
                this._lastDt = 0;
                this._tickCallbackInProgress = false;
                this._dragHelper = null;
                //---- offset on element where drag started ----
                this._xDelta = 0;
                this._yDelta = 0;
                //---- stats ----
                this._totalUpdateNodesTime = 0;
                this._maxUpdateNodesTime = 0;
                this._lastStatTime = 0;
                this._onStatsCallback = null;
            }
            /** Return a drag helper class, to assist caller in dragging elements associated with "nodes". */
            forceLayoutClass.prototype.getDragHelper = function () {
                var _this = this;
                if (!this._dragHelper) {
                    this._dragHelper = new layouts.dragHelperClass(function (name, dragElem, e) {
                        _this.processDragEvent(name, dragElem, e);
                    });
                }
                return this._dragHelper;
            };
            forceLayoutClass.prototype.processDragEvent = function (name, dragElem, e) {
                var node = dragElem.dataItem.data;
                if (name == "dragstart") {
                    node.dragFixed = true;
                    var pt = vp.events.mousePosition(e);
                    this._xDelta = node.x - pt.x;
                    this._yDelta = node.y - pt.y;
                    node.x = pt.x + this._xDelta;
                    node.y = pt.y + this._yDelta;
                    this.resume();
                }
                else if (name == "drag") {
                    var pt = vp.events.mousePosition(e);
                    node.x = pt.x + this._xDelta;
                    node.y = pt.y + this._yDelta;
                    this.resume();
                }
                else if (name == "dragend") {
                    node.dragFixed = false;
                    //---- set prev close to new current position ----
                    node.px = node.x + .1 * Math.random();
                    node.py = node.y + .1 * Math.random();
                }
            };
            forceLayoutClass.prototype.start = function () {
                this.innerStart(.1);
            };
            forceLayoutClass.prototype.innerStart = function (alphaValue) {
                //this.stop();
                var _this = this;
                this._alpha = alphaValue;
                if (this._nodes && this._nodes.length) {
                    if (this._onStartCallback) {
                        this._onStartCallback(null);
                    }
                    this.initNodesAsNeeded();
                    if (this._links) {
                        this.initLinksAsNeeded();
                    }
                    ////---- stats ----
                    //this._totalUpdateNodesTime = 0;
                    //this._maxUpdateNodesTime = 0;
                    //this._tickCount = 0;
                    //this._lastStatTime = vp.utils.now();
                    if (!this._timer) {
                        if (true) {
                            this.tick(true);
                        }
                        else {
                            //---- calling the first call on a timer keeps us from exceeding TPS limit of 60 ----
                            this._timer = vp.animation.requestAnimationFrame(function (e) {
                                _this.tick(true);
                            });
                        }
                    }
                }
            };
            forceLayoutClass.prototype.initNodesAsNeeded = function () {
                var nodes = this._nodes;
                var charge = this._charge;
                var chargeFunc = vp.utils.isFunction(charge);
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.x === undefined) {
                        node.x = Math.round(Math.random() * this._width);
                        node.y = Math.round(Math.random() * this._width);
                    }
                    if (node.px === undefined) {
                        node.px = node.x + .1 * Math.random();
                        node.py = node.y + .1 * Math.random();
                    }
                    node.weight = 1;
                    //---- refresh CHARGE info for each node ----
                    node.charge = (chargeFunc) ? charge(node, i) : charge;
                }
            };
            forceLayoutClass.prototype.initLinksAsNeeded = function () {
                var links = this._links;
                var distance = this._linkDistance;
                var distanceFunc = vp.utils.isFunction(distance);
                var strength = this._linkStrength;
                var strengthFunc = vp.utils.isFunction(strength);
                //---- CACHE distance and strength values ----
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    link.distance = (distanceFunc) ? distance(link, i) : distance;
                    link.strength = (strengthFunc) ? strength(link, i) : strength;
                    //---- adjust weight of connected nodes ----
                    link.source.weight++;
                    link.target.weight++;
                }
            };
            forceLayoutClass.prototype.stop = function () {
                if (this._timer) {
                    this.onStopped();
                }
            };
            forceLayoutClass.prototype.onStopped = function () {
                if (this._timer) {
                    vp.animation.cancelAnimationFrame(this._timer);
                    this._timer = undefined;
                }
                this._alpha = 0;
                if (this._onEndCallback) {
                    this._onEndCallback(null);
                }
                //vp.utils.debug("forceLayout.stop called");
            };
            forceLayoutClass.prototype.resume = function () {
                this.innerStart(.1);
            };
            forceLayoutClass.prototype.tick = function (startTimer) {
                var _this = this;
                var now = vp.utils.now();
                var delta = now - this._lastStatTime;
                if (delta > 1000) {
                    var tps = Math.round(this._tickCount / (delta / 1000));
                    if (this._onStatsCallback) {
                        this._onStatsCallback(tps, this._maxUpdateNodesTime, this._totalUpdateNodesTime / tps);
                    }
                    this._lastStatTime = now;
                    this._tickCount = 0;
                    this._maxUpdateNodesTime = 0;
                    this._totalUpdateNodesTime = 0;
                }
                var started = vp.utils.now();
                this.updateNodes();
                var elapsed = vp.utils.now() - started;
                this._totalUpdateNodesTime += elapsed;
                this._maxUpdateNodesTime = Math.max(this._maxUpdateNodesTime, elapsed);
                if (this._onTickCallback) {
                    this._tickCallbackInProgress = true;
                    try {
                        this._onTickCallback(null, this._quadTree);
                    }
                    finally {
                        this._tickCallbackInProgress = false;
                    }
                }
                var alphaDecayFactor = .99; // .97
                this._alpha *= alphaDecayFactor;
                if (this._alpha <= .0005) {
                    this._alpha = 0;
                }
                this._tickCount++;
                this._lastTickTime = vp.utils.now();
                //vp.utils.debug("forceLayout.tick: alpha=" + this._alpha + ", tickCount=" + this._tickCount);
                if (this._alpha > 0 && startTimer) {
                    this._timer = vp.animation.requestAnimationFrame(function (e) {
                        _this.tick(true);
                    });
                }
                else {
                    this.onStopped();
                }
            };
            forceLayoutClass.prototype.updateNodes = function () {
                if (this._tickCallbackInProgress) {
                    throw "Error - updateNodes() called while tick callback in progress";
                }
                var nodes = this._nodes;
                var quadTree = null;
                if (this._charge && this._theta) {
                    quadTree = vp.layouts.createQuadTree(nodes);
                    this.addMassToQuadTree(quadTree);
                }
                this._quadTree = quadTree;
                //---- values for "dt" between .2 and .4 work best so far ----
                var dt = .2 + .2 * Math.random();
                //var dt = (this._lastTickTime) ? (this._lastTickTime - Date.now())/.3 : Math.random();
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (!node.dragFixed && !node.fixed) {
                        var lastDt = (this._lastDt) ? this._lastDt : dt;
                        this.updateNode(node, quadTree, dt, lastDt);
                    }
                }
                this._lastDt = dt;
            };
            forceLayoutClass.prototype.addMassToQuadTree = function (quadTree) {
                //---- visit each node, from children to their parents ----
                quadTree.visitPostOrder(function (origNode, left, top, right, bottom) {
                    //---- note: we only visit non-empty quadNodes, so "point" will be set ----
                    var qtNode = origNode;
                    var totalMass = 0;
                    var xCom = 0;
                    var yCom = 0;
                    //---- first, calculate the total mass for this qtNode ----
                    var node = qtNode.point;
                    totalMass = node.charge;
                    if (qtNode.nodes) {
                        for (var i = 0; i < qtNode.nodes.length; i++) {
                            var qtChild = qtNode.nodes[i];
                            if (qtChild.point) {
                                totalMass += qtChild.totalMass;
                            }
                        }
                    }
                    //---- now, calculate the center of mass ----
                    var factor = (totalMass) ? node.charge / totalMass : 1;
                    xCom += factor * node.x;
                    yCom += factor * node.y;
                    if (qtNode.nodes) {
                        for (var i = 0; i < qtNode.nodes.length; i++) {
                            var qtChild = qtNode.nodes[i];
                            if (qtChild.point) {
                                var factor = (totalMass) ? qtChild.totalMass / totalMass : 1;
                                xCom += factor * qtChild.xCom;
                                yCom += factor * qtChild.yCom;
                            }
                        }
                    }
                    qtNode.totalMass = totalMass;
                    qtNode.xCom = xCom;
                    qtNode.yCom = yCom;
                });
            };
            forceLayoutClass.prototype.updateNode = function (node, quadTree, dt, lastDt) {
                if (isNaN(node.x) || isNaN(node.y)) {
                    throw "Error - nan value found in node";
                }
                var forceTotal = { x: 0, y: 0 };
                //---- compute force from GRAVITY (modified by distance from center) ----
                var cx = this._width / 2;
                var cy = this._height / 2;
                this.addForceWithDistance(node, { x: cx, y: cy, id: -1 }, this._gravity, Infinity, "*", forceTotal);
                //---- compute force from OTHER NODES ----
                if (this._charge) {
                    var result = this.computeNodeForces(node, quadTree);
                    forceTotal.x += result.x;
                    forceTotal.y += result.y;
                    if (node.id == 1) {
                    }
                }
                if (this._linkDistance && this._links) {
                    result = this.computeLinkForces(node);
                    forceTotal.x += result.x;
                    forceTotal.y += result.y;
                }
                //---- apply force using Verlet Integration, with friction ----
                var dt2 = dt * dt;
                var maxTickCount = 300;
                var decayingPercent = (maxTickCount - this._tickCount) / maxTickCount;
                var px = node.px;
                var py = node.py;
                node.px = node.x;
                node.py = node.y;
                var x = node.x;
                var y = node.y;
                //---- verlet formulas from: http://en.wikipedia.org/wiki/Verlet_integration ----
                //---- regular verlet ----
                //node.x = node.x + (node.x - px) + forceX/node.weight * dt2;
                //node.y = node.y + (node.y - py) + forceY/node.weight * dt2;
                //---- time-corrected verlet ----
                //node.x = node.x + (node.x - px)*dt/lastDt + forceX / node.weight * dt2;
                //node.y = node.y + (node.y - py)*dt/lastDt + forceY / node.weight * dt2;
                //---- basic stormer-verlet ----
                //node.x = 2 * node.x - px + forceX/node.weight * dt2;
                //node.y = 2 * node.y - py + forceY/node.weight * dt2;
                //---- basic stormer-verlet with friction ----
                //node.x = (2 - f) * node.x - (1 - f)px + forceX/node.weight * dt2;
                //node.y = (2 - f) * node.y - (1 - f)py + forceY/node.weight * dt2;
                //---- warning: heatFactor exceeding .9 will cause unstable behavior ----
                //var heatFactor = 9.5 * this._alpha;   
                var heatFactor = (this._tickCount < 75) ? .85 : (0 + .95 * decayingPercent); // linear decay (vs alpha decay)
                heatFactor *= this._friction;
                //---- regular verlet with heat on momentum ----
                node.x = x + (x - px) * heatFactor + forceTotal.x / node.weight * dt2;
                node.y = y + (y - py) * heatFactor + forceTotal.y / node.weight * dt2;
                if (isNaN(node.x) || isNaN(node.y)) {
                    throw "Error - nan value found in node";
                }
            };
            forceLayoutClass.prototype.computeLinkForces = function (node) {
                var links = this._links;
                var force = { x: 0, y: 0 };
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    if (link.source == node) {
                        this.computeLinkForce(node, link.target, link, force);
                    }
                    else if (link.target == node) {
                        this.computeLinkForce(node, link.source, link, force);
                    }
                }
                return force;
            };
            forceLayoutClass.prototype.computeLinkForce = function (node, target, link, forceTotal) {
                //---- compute distance between node & target ----
                var dx = node.x - target.x;
                var dy = node.y - target.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var delta = link.distance - dist;
                var rawForce = delta * link.strength;
                this.addForceWithDistance(target, node, rawForce, Infinity, null, forceTotal);
            };
            forceLayoutClass.prototype.computeNodeForces = function (fromNode, quadTree) {
                var nodes = this._nodes;
                var forceTotal = { x: 0, y: 0 };
                if (this._theta) {
                    //---- use Barnes-Hut trick for caclulating force faster ----
                    this.computeQuadTreeNodeForce(fromNode, quadTree.rootNode, forceTotal);
                }
                else {
                    //---- calc force 1-1 with all other nodes ----
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        if (node != fromNode) {
                            this.addForceWithDistance(fromNode, node, node.charge, this._chargeDistance, "/", forceTotal);
                        }
                    }
                }
                return forceTotal;
            };
            forceLayoutClass.prototype.addForceWithDistance = function (from, to, charge, maxDistance, distOp, forceTotal) {
                if (charge) {
                    var dx = to.x - from.x;
                    var dy = to.y - from.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDistance) {
                        var rawForce;
                        if (distOp === "*") {
                            rawForce = charge * dist;
                        }
                        else if (distOp === "/") {
                            rawForce = (dist > .000001) ? (charge / dist) : 0;
                        }
                        else {
                            rawForce = charge;
                        }
                        if (rawForce) {
                            //---- separate rawForce into X and Y components ----
                            var radians = Math.atan2(dy, dx);
                            var fx = Math.cos(radians) * rawForce;
                            var fy = Math.sin(radians) * rawForce;
                            forceTotal.x += fx;
                            forceTotal.y += fy;
                        }
                    }
                }
            };
            forceLayoutClass.prototype.computeQuadTreeNodeForce = function (node, qtNode, forceTotal) {
                //---- compute distance between node and center of mass of qtNode ----
                var dx = node.x - qtNode.xCom;
                var dy = node.y - qtNode.yCom;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var regionWidth = qtNode.right - qtNode.left;
                var ratio = regionWidth / dist;
                //vp.utils.debug("ratio: " + ratio + ", regionWidth: " + regionWidth + ", dist: " + dist);
                if (ratio < this._theta) {
                    //---- use shortcut ----
                    this.addForceWithDistance(node, { x: qtNode.xCom, y: qtNode.yCom }, qtNode.totalMass, this._chargeDistance, "/", forceTotal);
                }
                else {
                    //---- calc with qtNode: point, and 4 child nodes ----
                    if (qtNode.point && qtNode.point != node) {
                        var ptNode = qtNode.point;
                        this.addForceWithDistance(node, ptNode, ptNode.charge, this._chargeDistance, "/", forceTotal);
                    }
                    if (qtNode.nodes) {
                        for (var i = 0; i < qtNode.nodes.length; i++) {
                            var childNode = qtNode.nodes[i];
                            if (childNode.point) {
                                this.computeQuadTreeNodeForce(node, childNode, forceTotal);
                            }
                        }
                    }
                }
            };
            forceLayoutClass.prototype.onStart = function (callback) {
                this._onStartCallback = callback;
                return this;
            };
            forceLayoutClass.prototype.onTick = function (callback) {
                this._onTickCallback = callback;
                return this;
            };
            forceLayoutClass.prototype.onEnd = function (callback) {
                this._onEndCallback = callback;
                return this;
            };
            forceLayoutClass.prototype.onStats = function (callback) {
                this._onStatsCallback = callback;
                return this;
            };
            forceLayoutClass.prototype.nodes = function (value) {
                if (arguments.length === 0) {
                    return this._nodes;
                }
                this._nodes = value;
                return this;
            };
            forceLayoutClass.prototype.links = function (value) {
                if (arguments.length === 0) {
                    return this._links;
                }
                this._links = value;
                return this;
            };
            forceLayoutClass.prototype.gravity = function (value) {
                if (arguments.length === 0) {
                    return this._gravity;
                }
                this._gravity = value;
                return this;
            };
            forceLayoutClass.prototype.charge = function (value) {
                if (arguments.length === 0) {
                    return this._charge;
                }
                this._charge = value;
                return this;
            };
            forceLayoutClass.prototype.width = function (value) {
                if (arguments.length === 0) {
                    return this._width;
                }
                this._width = value;
                return this;
            };
            forceLayoutClass.prototype.height = function (value) {
                if (arguments.length === 0) {
                    return this._height;
                }
                this._height = value;
                return this;
            };
            forceLayoutClass.prototype.alpha = function (value) {
                if (arguments.length === 0) {
                    return this._alpha;
                }
                this._alpha = value;
                if (!this._timer && value > 0) {
                    this.innerStart(this._alpha);
                }
                return this;
            };
            forceLayoutClass.prototype.chargeDistance = function (value) {
                if (arguments.length === 0) {
                    return this._chargeDistance;
                }
                this._chargeDistance = value;
                return this;
            };
            forceLayoutClass.prototype.linkDistance = function (value) {
                if (arguments.length === 0) {
                    return this._linkDistance;
                }
                this._linkDistance = value;
                return this;
            };
            forceLayoutClass.prototype.theta = function (value) {
                if (arguments.length === 0) {
                    return this._theta;
                }
                this._theta = value;
                return this;
            };
            forceLayoutClass.prototype.friction = function (value) {
                if (arguments.length === 0) {
                    return this._friction;
                }
                this._friction = value;
                return this;
            };
            return forceLayoutClass;
        })();
        layouts.forceLayoutClass = forceLayoutClass;
        function createForceLayout() {
            return new forceLayoutClass();
        }
        layouts.createForceLayout = createForceLayout;
        var quadNodeMass = (function (_super) {
            __extends(quadNodeMass, _super);
            function quadNodeMass() {
                _super.apply(this, arguments);
            }
            return quadNodeMass;
        })(layouts.quadNodeClass);
        layouts.quadNodeMass = quadNodeMass;
    })(layouts = vp.layouts || (vp.layouts = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// buildPie.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var paths;
    (function (paths_1) {
        function buildPie(data, cx, cy, innerRadius, outerRadius, createCanvasPath, callback) {
            var paths = [];
            var lastX = null;
            var lastYMin = null;
            var lastYMax = null;
            var yValues = [];
            //---- first pass - collect all the data ----
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var info = { y: 100 };
                callback(record, i, info);
                yValues.push(info.y);
            }
            var abc = "hi there";
            if (abc.startsWith("dkdk")) {
            }
            //---- second pass - normalize the data ----
            var sum = yValues.sum(function (d) {
                return Math.abs(d);
            });
            var rotation = 0;
            //---- third pass - generate the slices ----
            for (var i = 0; i < data.length; i++) {
                var angle = 360 * (yValues[i] / sum);
                var path = getPieSlicePath(cx, cy, innerRadius, outerRadius, angle, rotation, createCanvasPath);
                paths.push(path);
                rotation += angle;
            }
            return paths;
        }
        paths_1.buildPie = buildPie;
        function placeOnCircle(ptCenter, radius, rotationDegrees) {
            rotationDegrees -= 90; // make 0 degrees start "12:00" position
            var radians = rotationDegrees * (Math.PI / 180);
            var xEnd = ptCenter.x + Math.cos(radians) * radius;
            var yEnd = ptCenter.y + Math.sin(radians) * radius;
            return { x: xEnd, y: yEnd };
        }
        //---- draw ARC from current point to ptEnd ----
        function makeArc(arcDegrees, sweepClockwise, radius, ptEnd) {
            var isLarge = (arcDegrees >= 180) ? 1 : 0;
            var sweepFlag = (sweepClockwise) ? 1 : 0;
            var path = "A" + radius + "," + radius + ",0," + isLarge + "," + sweepFlag + "," +
                ptEnd.x + "," + ptEnd.y + " ";
            return path;
        }
        function pointAlongLine(ptStart, ptEnd, dist) {
            var x = ptStart.x + dist * (ptEnd.x - ptStart.x);
            var y = ptStart.y + dist * (ptEnd.y - ptStart.y);
            var pt = { x: x, y: y };
            return pt;
        }
        function getPieSlicePath(xCenter, yCenter, innerRadius, outerRadius, angleDegrees, rotation, createCanvasPath) {
            var path = null;
            if (createCanvasPath) {
                path = getPieSlicePathCanvas(xCenter, yCenter, innerRadius, outerRadius, angleDegrees, rotation);
            }
            else {
                path = getPieSlicePathSvg(xCenter, yCenter, innerRadius, outerRadius, angleDegrees, rotation);
            }
            return path;
        }
        paths_1.getPieSlicePath = getPieSlicePath;
        function getPieSlicePathSvg(xCenter, yCenter, innerRadius, outerRadius, angleDegrees, rotation) {
            var ptCenter = { x: xCenter, y: yCenter };
            var ptStart = { x: xCenter, y: yCenter };
            if (innerRadius > 0) {
                //ptStart.x += innerRadius;
                ptStart = placeOnCircle(ptCenter, innerRadius, rotation);
            }
            var path = "M" + ptStart.x + "," + ptStart.y + " ";
            var fullPie = false;
            if (angleDegrees >= 360) {
                fullPie = true;
                //---- the ARC cmd cannot draw a full circle, but this value seems to work well ----
                angleDegrees = 359.999;
            }
            var ptArc = placeOnCircle(ptCenter, outerRadius, rotation);
            if (!fullPie) {
                //---- first line (extends to the start of the arc) ----
                path += "L" + ptArc.x + "," + ptArc.y + " ";
            }
            else {
                path += "M" + ptArc.x + "," + ptArc.y + " ";
            }
            //---- the arc ----
            var ptArcEnd = placeOnCircle(ptCenter, outerRadius, rotation + angleDegrees);
            var arc = makeArc(angleDegrees, true, outerRadius, ptArcEnd);
            path += arc;
            if (innerRadius > 0) {
                var ptEnd = placeOnCircle(ptCenter, innerRadius, rotation + angleDegrees);
                if (fullPie) {
                    //---- need to move to ptEnd ---
                    path += "M" + ptEnd.x + "," + ptEnd.y + " ";
                }
                else {
                    //---- draw a line to ptEnd ----
                    path += "L" + ptEnd.x + "," + ptEnd.y + " ";
                }
                //---- reverse, innner arc ----
                var arc2 = makeArc(angleDegrees, false, innerRadius, ptStart);
                path += arc2;
            }
            path += "Z"; // close path
            //---- test ----
            //path = "M 100 100 L 300 100 L 200 300 z";
            return path;
        }
        paths_1.getPieSlicePathSvg = getPieSlicePathSvg;
        function getPieSlicePathCanvas(xCenter, yCenter, innerRadius, outerRadius, angleDegrees, rotation) {
            var ptCenter = { x: xCenter, y: yCenter };
            var ptStart = { x: xCenter, y: yCenter };
            if (innerRadius > 0) {
                //ptStart.x += innerRadius;
                ptStart = placeOnCircle(ptCenter, innerRadius, rotation);
            }
            var path = "M" + ptStart.x + "," + ptStart.y + " ";
            var fullPie = false;
            if (angleDegrees >= 360) {
                fullPie = true;
                //---- the ARC cmd cannot draw a full circle, but this value seems to work well ----
                angleDegrees = 359.999;
            }
            var ptArc = placeOnCircle(ptCenter, outerRadius, rotation);
            if (!fullPie) {
                //---- first line (extends to the start of the arc) ----
                path += "L" + ptArc.x + "," + ptArc.y + " ";
            }
            else {
                path += "M" + ptArc.x + "," + ptArc.y + " ";
            }
            var startAngle = (rotation - 90) * Math.PI / 180; // convert to radians
            var endAngle = (rotation - 90 + angleDegrees) * Math.PI / 180; // convert to radians
            //---- the arc ----
            var ptArcEnd = placeOnCircle(ptCenter, outerRadius, rotation + angleDegrees);
            //var arc = makeArc(angleDegrees, true, outerRadius, ptArcEnd);
            var arc = "X" + xCenter + "," + yCenter + "," + outerRadius + "," + startAngle + "," + endAngle + ",0 ";
            arc += "M" + ptArcEnd.x + "," + ptArcEnd.y + " "; // move current point to end of arc
            path += arc;
            if (innerRadius > 0) {
                var ptEnd = placeOnCircle(ptCenter, innerRadius, rotation + angleDegrees);
                if (fullPie) {
                    //---- need to move to ptEnd ---
                    path += "M" + ptEnd.x + "," + ptEnd.y + " ";
                }
                else {
                    //---- draw a line to ptEnd ----
                    path += "L" + ptEnd.x + "," + ptEnd.y + " ";
                }
                //---- reverse, innner arc ----
                //var arc2 = makeArc(angleDegrees, false, innerRadius, ptStart);
                var arc2 = "X" + xCenter + "," + yCenter + "," + innerRadius + "," + endAngle + "," + startAngle + ",1 ";
                arc2 += "M" + ptStart.x + "," + ptStart.y + " "; // move current point to end of arc
                path += arc2;
            }
            path += "Z"; // close path
            //---- test ----
            //path = "M 100 100 L 300 100 L 200 300 z";
            return path;
        }
        paths_1.getPieSlicePathCanvas = getPieSlicePathCanvas;
    })(paths = vp.paths || (vp.paths = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// curveFitting.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - curve fitting functions.
///-----------------------------------------------------------------------------------------------------------------
/// all of these functions in this file, unless specified otherwise, 
/// were adapted from book "practical WPF Charts and Graphics"
/// http://www.amazon.com/Practical-Charts-Graphics-Experts-Voice/dp/1430224819, Chapter 11 Curve Fitting.  
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var curveFitting;
    (function (curveFitting) {
        function line(xa, ya) {
            var values = {};
            if ((!xa) || (!xa.length) || (!ya) || (!ya.length)) {
                vp.utils.error("error - polyfit() requires X and Y number arrays");
            }
            if (xa.length != ya.length) {
                vp.utils.error("error - polyfit() requires that X and Y be the same size");
            }
            var count = xa.length;
            //---- model: y = slope*x + intercept ----
            var xm = average(xa);
            var ym = average(ya);
            var btop = 0;
            var bbot = 0;
            for (var i = 0; i < count; i++) {
                btop += (ya[i] * (xa[i] - xm));
                bbot += (xa[i] * (xa[i] - xm));
            }
            var slope = btop / bbot;
            var intercept = ym - xm * slope;
            var sigma = 0;
            for (var i = 0; i < count; i++) {
                var t = ya[i] - intercept - (slope * xa[i]);
                sigma += t * t;
            }
            sigma = Math.sqrt(sigma / (count - 2));
            var ptFrom = { x: xa[0], y: slope * xa[0] + intercept };
            var ptTo = { x: xa[count - 1], y: slope * xa[count - 1] + intercept };
            values = { slope: slope, intercept: intercept, sigma: sigma, ptFrom: ptFrom, ptTo: ptTo };
            return values;
        }
        curveFitting.line = line;
        function average(nums) {
            var total = 0;
            var count = nums.length;
            for (var i = 0; i < nums.length; i++) {
                total += nums[i];
            }
            var avg = (count > 0) ? total / count : 0;
            return avg;
        }
        function matrix2d(rows, cols) {
            var m = [];
            for (var i = 0; i < rows; i++) {
                var row = [];
                for (var j = 0; j < cols; j++) {
                    row.push(0);
                }
                m.push(row);
            }
            return m;
        }
        function vector(cols) {
            var row = [];
            for (var j = 0; j < cols; j++) {
                row.push(0);
            }
            return row;
        }
        //export function linRegressPoly(xa, ya, degree)
        //{
        //    var f0 = function(x) {return 1;}
        //    var f1 = function(x) {return x;}
        //    var f2 = function(x) {return x*x;}
        //    var f3 = function(x) {return x*x*x;}
        //    var f = null;
        //    if (degree == 1)
        //    {
        //        f = [f0, f1];
        //    }
        //    else if (degree == 2)
        //    {
        //        f = [f0, f1, f2];
        //    }
        //    else if (degree == 3)
        //    {
        //        f = [f0, f1, f2, f3];
        //    }
        //    var result = export function linearRegression(xa, ya, f);
        //    return result;
        //}
        /// "xa" are the x data values, "ya" are the y data values, "degree" is the polynomial degress (1, 2, ...)
        function polyFit(xa, ya, degree) {
            var m = degree + 1;
            var a = matrix2d(m, m);
            var b = vector(m);
            var n = xa.length;
            for (var k = 0; k < m; k++) {
                b[k] = 0;
                for (var i = 0; i < n; i++) {
                    b[k] += Math.pow(xa[i], k) * ya[i];
                }
            }
            for (var j = 0; j < m; j++) {
                for (var k = 0; k < m; k++) {
                    a[j][k] = 0;
                    for (var i = 0; i < n; i++) {
                        a[j][k] += Math.pow(xa[i], j + k);
                    }
                }
            }
            var coef = gaussJordan(a, b);
            //---- calculate the std deviation ----
            var s = 0;
            for (var i = 0; i < n; i++) {
                var s1 = 0;
                for (var j = 0; j < m; j++) {
                    s1 += coef[j] * Math.pow(xa[i], j);
                }
                s += (ya[i] - s1) * (ya[i] - s1);
            }
            var sigma = Math.sqrt(s / (n - m));
            return { coef: coef, sigma: sigma };
        }
        curveFitting.polyFit = polyFit;
        /// "xa" are the x data values, "ya" are the y data values, "wa" are the weight values.
        function weightedLinearRegression(xa, ya, wa) {
            var n = xa.length;
            var xw = 0;
            var yw = 0;
            var b1 = 0;
            var b2 = 0;
            var a = 0;
            var b = 0;
            for (var i = 0; i < n; i++) {
                xw += xa[i] / n;
                yw = ya[i] / n;
            }
            for (var i = 0; i < n; i++) {
                b1 += wa[i] * wa[i] * ya[i] * (xa[i] - xw);
                //b2 += wa[i] * wa[i] * xa[i] * (xa[i] - xw);
                b2 += wa[i] * wa[i] * xa[i] * (ya[i] - yw);
            }
            b = b1 / b2;
            a = yw - xw * b;
            return { coef: [a, b] };
        }
        curveFitting.weightedLinearRegression = weightedLinearRegression;
        /// "xa" are the x data values, "ya" are the y data values, "degree" is the polynomial degress (1, 2, ...)
        function exponentialFit(xa, ya) {
            var logy = [];
            for (var i = 0; i < ya.length; i++) {
                logy[i] = Math.log(ya[i]);
            }
            var result = weightedLinearRegression(xa, logy, ya);
            return result;
        }
        curveFitting.exponentialFit = exponentialFit;
        /// "xa" are the x data values, "ya" are the y data values, "f" is an array of model func (usually returns x**N).
        function linearRegression(xa, ya, f) {
            var m = f.length;
            var a = matrix2d(m, m);
            var b = vector(m);
            var n = xa.length;
            for (var k = 0; k < m; k++) {
                b[k] = 0;
                for (var i = 0; i < n; i++) {
                    var result = f[k](xa[i]);
                    var term = result * ya[i];
                    b[k] += term;
                }
            }
            for (var j = 0; j < m; j++) {
                for (var k = 0; k < m; k++) {
                    a[j][k] = 0;
                    for (var i = 0; i < n; i++) {
                        var result = f[j](xa[i]);
                        var result2 = f[k](xa[i]);
                        var term = result * result2;
                        a[j][k] += term;
                    }
                }
            }
            var coef = gaussJordan(a, b);
            //---- calculate the std deviation ----
            var s = 0;
            for (var i = 0; i < n; i++) {
                var s1 = 0;
                for (var j = 0; j < m; j++) {
                    s1 += coef[j] * f[j](xa[i]);
                }
                s += (ya[i] - s1) * (ya[i] - s1);
            }
            var sigma = Math.sqrt(s / (n - m));
            return { coef: coef, sigma: sigma };
        }
        curveFitting.linearRegression = linearRegression;
        /// "a" is Matrix, "b" is array.
        function gaussJordan(a, b) {
            triangulate(a, b);
            var n = b.length;
            var x = vector(n);
            for (var i = n - 1; i >= 0; i--) {
                var d = a[i][i];
                if (Math.abs(d) < 1.0e-500) {
                    vp.utils.error("error: diagnoal element is too small for GaussJordan");
                }
                x[i] = (b[i] - dotProduct(a[i], x)) / d;
            }
            return x;
        }
        /// "a" is array, "b" is array.
        function dotProduct(a, b) {
            var sum = 0;
            for (var i = 0; i < a.length; i++) {
                sum += a[i] * b[i];
            }
            return sum;
        }
        /// "a" is Matrix, "b" is array.
        function triangulate(a, b) {
            var n = a.length;
            var v = vector(n);
            for (var i = 0; i < n - 1; i++) {
                var d = pivot(a, b, i);
                if (Math.abs(d) < 1.0e-500) {
                    vp.utils.error("error: diagnoal element is too small for triangulate");
                }
                for (var j = i + 1; j < n; j++) {
                    var dd = a[j][i] / d;
                    for (var k = i + 1; k < n; k++) {
                        a[j][k] -= dd * a[i][k];
                    }
                    b[j] -= dd * b[i];
                }
            }
        }
        /// "a" is Matrix, "b" is array, "q" in number.
        function pivot(a, b, q) {
            var n = b.length;
            var i = q;
            var d = 0;
            for (var j = q; j < n; j++) {
                var dd = Math.abs(a[j][q]);
                if (dd > d) {
                    d = dd;
                    i = j;
                }
            }
            if (i > q) {
                //---- swap rows "q" and "i" in a ----
                var temp = a[q];
                a[q] = a[i];
                a[i] = temp;
                //---- swap elements "q" and "i" in b ----
                temp = b[q];
                b[q] = b[i];
                b[i] = temp;
            }
            return a[q][q];
        }
        function spline(xx, yy) {
            //---- convert xx,yy into points ----
            var points = xx.map(function (data, index) {
                return { x: xx[index], y: yy[index] };
            });
            var tension = .5; // controls how smooth/sharp changes are at each point
            var tensions = null;
            var segments = [];
            if (points.length == 2) {
                if (tensions) {
                    tension = tensions[0];
                }
                addSplineSegment(segments, points[0], points[0], points[1], points[1], tension, tension);
            }
            else {
                for (var i = 0; i < points.length; i++) {
                    var t1 = (tensions) ? tensions[i % tensions.length] : tension;
                    var t2 = (tensions) ? tensions[(i + 1) % tensions.length] : tension;
                    if (i == 0) {
                        addSplineSegment(segments, points[0], points[0], points[1], points[2], t1, t2);
                    }
                    else if (i == points.length - 2) {
                        addSplineSegment(segments, points[i - 1], points[i], points[i + 1], points[i + 1], t1, t2);
                    }
                    else if (i != points.length - 1) {
                        addSplineSegment(segments, points[i - 1], points[i], points[i + 1], points[i + 2], t1, t2);
                    }
                }
            }
            return segments;
        }
        curveFitting.spline = spline;
        function addSplineSegment(segments, pt0, pt1, pt2, pt3, t1, t2) {
            // adapted from Charles Petzold book:
            // See Petzold, "Programming Microsoft Windows with C#", pages 645-646 or 
            //     Petzold, "Programming Microsoft Windows with Microsoft Visual Basic .NET", pages 638-639
            // for derivation of the following formulas:
            var SX1 = t1 * (pt2.x - pt0.x);
            var SY1 = t1 * (pt2.y - pt0.y);
            var SX2 = t2 * (pt3.x - pt1.x);
            var SY2 = t2 * (pt3.y - pt1.y);
            var AX = SX1 + SX2 + 2 * pt1.x - 2 * pt2.x;
            var AY = SY1 + SY2 + 2 * pt1.y - 2 * pt2.y;
            var BX = -2 * SX1 - SX2 - 3 * pt1.x + 3 * pt2.x;
            var BY = -2 * SY1 - SY2 - 3 * pt1.y + 3 * pt2.y;
            var CX = SX1;
            var CY = SY1;
            var DX = pt1.x;
            var DY = pt1.y;
            var tolerance = .25; // .25 is the standard tolerance for curve flattening (curve to lines)
            var num = Math.floor((Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y)) / tolerance);
            //num = 4;   // debugging
            var points = [];
            segments.push(points);
            // Notice begins at 1 so excludes the first point (which is just pt1)
            for (var i = 1; i < num; i++) {
                var t = i / (num - 1);
                var pt = {
                    x: AX * t * t * t + BX * t * t + CX * t + DX,
                    y: AY * t * t * t + BY * t * t + CY * t + DY
                };
                points.push(pt);
            }
        }
    })(curveFitting = vp.curveFitting || (vp.curveFitting = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// paths.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlot library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var paths;
    (function (paths_2) {
        function buildShape(shapeName, x, y, size, createCanvasPath) {
            var index = vp.paths.ShapeTypeNames.indexOf(shapeName);
            if (index == -1) {
                throw "Error: unknown shape name=" + shapeName;
            }
            var shapeType = index;
            var path = paths_2.getPathDataForShape(shapeType, x, y, size, size, createCanvasPath);
            return path;
        }
        paths_2.buildShape = buildShape;
        function buildLine(data, buildSinglePath, callback) {
            var paths = [];
            var lastX = null;
            var lastY = null;
            var path = "";
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var info = { x: 0, y: 100 };
                callback(record, i, info);
                if (i == 0) {
                    lastX = info.x;
                    lastY = info.y;
                }
                if (buildSinglePath) {
                    if (i == 0) {
                        path = "M" + lastX + "," + lastY;
                    }
                    path += " L" + info.x + "," + info.y;
                }
                else {
                    path = "M" + lastX + "," + lastY;
                    path += " L" + info.x + "," + info.y;
                }
                lastX = info.x;
                lastY = info.y;
                if (!buildSinglePath) {
                    paths.push(path);
                }
            }
            if (buildSinglePath) {
                paths.push(path);
            }
            return paths;
        }
        paths_2.buildLine = buildLine;
        function buildArea(data, callback) {
            var paths = [];
            var lastX = null;
            var lastYMin = null;
            var lastYMax = null;
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var info = { x: 0, yMin: 0, yMax: 100 };
                callback(record, i, info);
                if (i == 0) {
                    lastX = info.x;
                    lastYMin = info.yMin;
                    lastYMax = info.yMax;
                }
                var path = "M" + lastX + "," + lastYMin; // MOVE to lower left
                path += " L" + lastX + "," + lastYMax; // LINE to upper left
                path += " L" + info.x + "," + info.yMax; // LINE to upper right
                path += " L" + info.x + "," + info.yMin; // LINE to lower right
                path += " Z";
                lastX = info.x;
                lastYMin = info.yMin;
                lastYMax = info.yMax;
                paths.push(path);
            }
            return paths;
        }
        paths_2.buildArea = buildArea;
        function buildSpline(data, callback) {
            var paths = [];
            var lastX = null;
            var lastY = null;
            var path = "";
            var xa = [];
            var ya = [];
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                var info = { x: 0, y: 100 };
                callback(record, i, info);
                xa.push(info.x);
                ya.push(info.y);
            }
            //---- calc the spline path for this rect ----
            var segments = vp.curveFitting.spline(xa, ya);
            //---- create dummy path for first pt ----
            var path = "M0,0 ";
            paths.push(path);
            //---- convert segments to paths ----
            for (var s = 0; s < segments.length; s++) {
                var segment = segments[s];
                var path = "M";
                for (var i = 0; i < segment.length; i++) {
                    var pt = segment[i];
                    if (i > 0) {
                        path += "L";
                    }
                    path += pt.x + "," + pt.y + " ";
                }
                paths.push(path);
            }
            return paths;
        }
        paths_2.buildSpline = buildSpline;
    })(paths = vp.paths || (vp.paths = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// shapeData.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - uses to create paths for our set of shapeTypes.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var paths;
    (function (paths) {
        function getPathDataForShape(shapeType, x, y, w, h, createCanvasPath) {
            var move = function (str, x, y) {
                str += " M " + x + " " + y;
                return str;
            };
            var line = function (str, x, y) {
                str += " L " + x + " " + y;
                return str;
            };
            var circle = function (str, cx, cy, r) {
                if (createCanvasPath) {
                    str += " X " + cx + "," + cy + "," + r + ",0," + 2 * Math.PI + ",0";
                }
                else {
                    str += " M " + (cx - r) + " " + cy +
                        " a " + r + " " + r + " 0 1 0 " + (2 * r) + " 0" +
                        " a " + r + " " + r + " 0 1 0 " + (-2 * r) + " 0";
                }
                return str;
            };
            var close = function (str) {
                str += " z";
                return str;
            };
            var d = "";
            //---- scale our 0..1 vars as per the desired bounds ----
            var x0 = x - w / 2;
            var x1 = x + w / 2;
            var x5 = x;
            var y0 = y - h / 2;
            var y1 = y + h / 2;
            var y5 = y;
            switch (shapeType) {
                case ShapeType.triangleUp:
                    {
                        //---- triangle ----
                        d = move(d, x0, y1);
                        d = line(d, x5, y0);
                        d = line(d, x1, y1);
                        d = close(d);
                        break;
                    }
                case ShapeType.plus:
                    {
                        //---- plus sign ----
                        d = move(d, x0, y5);
                        d = line(d, x1, y5);
                        d = move(d, x5, y1);
                        d = line(d, x5, y0);
                        break;
                    }
                case ShapeType.x:
                    {
                        //---- big X ----
                        d = move(d, x0, y0);
                        d = line(d, x1, y1);
                        d = move(d, x1, y0);
                        d = line(d, x0, y1);
                        break;
                    }
                case ShapeType.diamond:
                    {
                        //---- diamond ----
                        d = move(d, x5, y0);
                        d = line(d, x0, y5);
                        d = line(d, x5, y1);
                        d = line(d, x1, y5);
                        d = line(d, x5, y0);
                        d = close(d);
                        break;
                    }
                case ShapeType.triangleDown:
                    {
                        //---- upside down triangle ----
                        d = move(d, x0, y0);
                        d = line(d, x5, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        break;
                    }
                case ShapeType.triangleLeft:
                    {
                        //---- left pointing triangle ----
                        d = move(d, x1, y0);
                        d = line(d, x1, y1);
                        d = line(d, x0, y5);
                        d = close(d);
                        break;
                    }
                case ShapeType.triangleRight:
                    {
                        //---- right pointing triangle ----
                        d = move(d, x0, y0);
                        d = line(d, x0, y1);
                        d = line(d, x1, y5);
                        d = close(d);
                        break;
                    }
                case ShapeType.pentagram:
                    {
                        //---- for pentagram ----
                        var y3 = y0 + .36 * h;
                        var y6 = y0 + .62 * h;
                        var y7 = y0 + .76 * h;
                        var x2 = x0 + .19 * w;
                        var x3 = x0 + .31 * w;
                        var x4 = x0 + .37 * w;
                        var x6 = x0 + .63 * w;
                        var x7 = x0 + .69 * w;
                        var x8 = x0 + .85 * w;
                        //---- 5 point star ----
                        d = move(d, x5, y0);
                        d = line(d, x6, y3);
                        d = line(d, x1, y3);
                        d = line(d, x7, y6);
                        d = line(d, x8, y1);
                        d = line(d, x5, y7);
                        d = line(d, x2, y1);
                        d = line(d, x3, y6);
                        d = line(d, x0, y3);
                        d = line(d, x4, y3);
                        d = close(d);
                        break;
                    }
                case ShapeType.hexagram:
                    {
                        //---- for hexagram ----
                        var y2 = y0 + .25 * h;
                        var y7 = y0 + .75 * h;
                        var x2 = x0 + .21 * w;
                        var x3 = x0 + .36 * w;
                        var x6 = x0 + .64 * w;
                        var x8 = x0 + .80 * w;
                        //---- 5 point star ----
                        d = move(d, x5, y0);
                        d = line(d, x6, y2);
                        d = line(d, x1, y2);
                        d = line(d, x8, y5);
                        d = line(d, x1, y7);
                        d = line(d, x6, y7);
                        d = line(d, x5, y1);
                        d = line(d, x3, y7);
                        d = line(d, x0, y7);
                        d = line(d, x2, y5);
                        d = line(d, x0, y2);
                        d = line(d, x3, y2);
                        d = close(d);
                        break;
                    }
                case ShapeType.xInSquare:
                    {
                        //---- X in square ----
                        //---- X-part ----
                        d = move(d, x0, y0);
                        d = line(d, x1, y1);
                        d = move(d, x1, y0);
                        d = line(d, x0, y1);
                        //---- square-part ----
                        d = move(d, x0, y0);
                        d = line(d, x0, y1);
                        d = line(d, x1, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        break;
                    }
                case ShapeType.asterisk:
                    {
                        //---- asterisk ----
                        //---- make diagonals a bit smaller ----
                        var diagFactor = .14;
                        var x2 = x0 + diagFactor * w;
                        var x8 = x1 - diagFactor * w;
                        var y2 = y0 + diagFactor * h;
                        var y8 = y1 - diagFactor * h;
                        d = move(d, x5, y0);
                        d = line(d, x5, y1);
                        d = move(d, x8, y2);
                        d = line(d, x2, y8);
                        d = move(d, x1, y5);
                        d = line(d, x0, y5);
                        d = move(d, x8, y8);
                        d = line(d, x2, y2);
                        break;
                    }
                case ShapeType.plusInDiamond:
                    {
                        //---- diamond with a plus inside ----
                        //---- diamond-part ----
                        d = move(d, x5, y0);
                        d = line(d, x0, y5);
                        d = line(d, x5, y1);
                        d = line(d, x1, y5);
                        d = line(d, x5, y0);
                        d = close(d);
                        //---- plus-part ----
                        d = move(d, x0, y5);
                        d = line(d, x1, y5);
                        d = move(d, x5, y1);
                        d = line(d, x5, y0);
                        break;
                    }
                case ShapeType.plusInCircle:
                    {
                        //---- plus in a circle ----
                        //---- circle-part ----
                        d = circle(d, x5, y5, w / 2);
                        //---- plus-part ----
                        d = move(d, x0, y5);
                        d = line(d, x1, y5);
                        d = move(d, x5, y1);
                        d = line(d, x5, y0);
                        break;
                    }
                case ShapeType.triangleUpDown:
                    {
                        //---- 2 triangles ----
                        //---- triangle-part ----
                        d = move(d, x0, y1);
                        d = line(d, x5, y0);
                        d = line(d, x1, y1);
                        d = close(d);
                        //---- down-triangle-part ----
                        d = move(d, x0, y0);
                        d = line(d, x5, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        break;
                    }
                case ShapeType.square:
                    {
                        //---- square with plus ----
                        //---- square-part ----
                        d = move(d, x0, y0);
                        d = line(d, x0, y1);
                        d = line(d, x1, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        break;
                    }
                case ShapeType.plusInSquare:
                    {
                        //---- square with plus ----
                        //---- square-part ----
                        d = move(d, x0, y0);
                        d = line(d, x0, y1);
                        d = line(d, x1, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        //---- plus-part ----
                        d = move(d, x0, y5);
                        d = line(d, x1, y5);
                        d = move(d, x5, y1);
                        d = line(d, x5, y0);
                        break;
                    }
                case ShapeType.circle:
                    {
                        //---- circle-part ----
                        d = circle(d, x5, y5, w / 2);
                        break;
                    }
                case ShapeType.xInCircle:
                    {
                        //---- X in a circle ----
                        //---- circle-part ----
                        d = circle(d, x5, y5, w / 2);
                        //---- X-part ----
                        d = move(d, x0, y0);
                        d = line(d, x1, y1);
                        d = move(d, x1, y0);
                        d = line(d, x0, y1);
                        break;
                    }
                case ShapeType.triangleInSquare:
                    {
                        //---- triangle in a square ----
                        //---- triangle-part ----
                        //---- triangle-part ----
                        d = move(d, x0, y1);
                        d = line(d, x5, y0);
                        d = line(d, x1, y1);
                        d = close(d);
                        //---- square-part ----
                        d = move(d, x0, y0);
                        d = line(d, x0, y1);
                        d = line(d, x1, y1);
                        d = line(d, x1, y0);
                        d = close(d);
                        break;
                    }
            }
            return d;
        }
        paths.getPathDataForShape = getPathDataForShape;
        (function (ShapeType) {
            //---- simple shapes that can be filled ----
            ShapeType[ShapeType["circle"] = 0] = "circle";
            ShapeType[ShapeType["diamond"] = 1] = "diamond";
            ShapeType[ShapeType["hexagram"] = 2] = "hexagram";
            ShapeType[ShapeType["pentagram"] = 3] = "pentagram";
            ShapeType[ShapeType["square"] = 4] = "square";
            ShapeType[ShapeType["triangleUp"] = 5] = "triangleUp";
            ShapeType[ShapeType["triangleDown"] = 6] = "triangleDown";
            ShapeType[ShapeType["triangleLeft"] = 7] = "triangleLeft";
            ShapeType[ShapeType["triangleRight"] = 8] = "triangleRight";
            ShapeType[ShapeType["asterisk"] = 9] = "asterisk";
            ShapeType[ShapeType["x"] = 10] = "x";
            ShapeType[ShapeType["plus"] = 11] = "plus";
            ShapeType[ShapeType["plusInDiamond"] = 12] = "plusInDiamond";
            ShapeType[ShapeType["plusInCircle"] = 13] = "plusInCircle";
            ShapeType[ShapeType["plusInSquare"] = 14] = "plusInSquare";
            ShapeType[ShapeType["triangleUpDown"] = 15] = "triangleUpDown";
            ShapeType[ShapeType["triangleInSquare"] = 16] = "triangleInSquare";
            ShapeType[ShapeType["xInCircle"] = 17] = "xInCircle";
            ShapeType[ShapeType["xInSquare"] = 18] = "xInSquare";
        })(paths.ShapeType || (paths.ShapeType = {}));
        var ShapeType = paths.ShapeType;
        paths.ShapeTypeNames = [
            //---- simple shapes that can be filled ----
            "circle",
            "diamond",
            "hexagram",
            "pentagram",
            "square",
            "triangleUp",
            "triangleDown",
            "triangleLeft",
            "triangleRight",
            //---- line and complex shapes that usually are not filled ----
            "asterisk",
            "x",
            "plus",
            "plusInDiamond",
            "plusInCircle",
            "plusInSquare",
            "triangleUpDown",
            "triangleInSquare",
            "xInCircle",
            "xInSquare",
        ];
    })(paths = vp.paths || (vp.paths = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// plotBox.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - a conceptual 3D box that holds the 2D/3D axes for a chart and provides pan/zoom/rotate functions.
///-----------------------------------------------------------------------------------------------------------------
///-----------------------------------------------------------------------------------------------------------------
/// plotBox.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - a conceptual 3D box that holds the 2D/3D axes for a chart and provides pan/zoom/rotate functions.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var plotBox;
    (function (plotBox) {
        var plotBoxClass = (function () {
            function plotBoxClass() {
                //---- private state ----
                this._transform3d = null;
                this._canvas = null;
                this._ctx = null;
                this._width = 0;
                this._height = 0;
                var canvas = document.createElement("canvas");
                this._canvas = canvas;
                var ctx = canvas.getContext("2d");
                this._ctx = ctx;
                var transform3d = plotBox.createTransform3d();
                this._transform3d = transform3d;
            }
            plotBoxClass.prototype.width = function (value) {
                if (arguments.length == 0) {
                    return this._width;
                }
                this._width = value;
                this._canvas.setAttribute("width", value + "");
                return this;
            };
            plotBoxClass.prototype.height = function (value) {
                if (arguments.length == 0) {
                    return this._height;
                }
                this._height = value;
                this._canvas.setAttribute("height", value + "");
                return this;
            };
            plotBoxClass.prototype.draw = function (xOptions, yOptions, zOptions) {
                var rect = vp.geom.createRect(0, 0, 100, 100);
                return rect;
            };
            return plotBoxClass;
        })();
        plotBox.plotBoxClass = plotBoxClass;
        function createPlotBox() {
            return new plotBoxClass();
        }
        plotBox.createPlotBox = createPlotBox;
    })(plotBox = vp.plotBox || (vp.plotBox = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// transform3d.js.  Copyright (c) 2012 Microsoft Corporation.
///     Part of the vuePlotCore library - class for translating 3D point3s to 2D (3D scaling using azimuth and elevation).
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var plotBox;
    (function (plotBox) {
        /** This class uses azimuth and elevation to project point3s from 3D space to 2D space. */
        var transform3dClass = (function () {
            /** builds a 3D matrix that can be used to translate point3s from 3D to 2D.  The projection
            is specified by an azimuth and an elevation (both in degrees of rotation).  The
            standard MATLAB setting for a 3D view is azimuth=-37.5, elevation=30.  For a direct overhead (2D)
            view, use azimuth=0, elevation=90. */
            function transform3dClass(screenWidth, screenHeight, azimuth, elevation, xMin, xMax, yMin, yMax, zMin, zMax, isScreenOutput) {
                //---- private adjustments ----
                this._xFact = 2; // 1.2;  
                this._yFact = 2; // 1.6
                this._xShift = 1; // 1.05
                this._yShift = 1; // .75
                //---- getter/setter fields ----
                this._azimuth = 0;
                this._elevation = 0;
                this._screenWidth = 0;
                this._screenHeight = 0;
                //---- public properties ----
                this._xOffset = 0;
                this._yOffset = 0;
                this._xScale = 0;
                this._yScale = 0;
                this._xMin = 0;
                this._xMax = 0;
                this._yMin = 0;
                this._yMax = 0;
                this._zMin = 0;
                this._zMax = 0;
                //---- internal state fields ----
                this._mat = null;
                this._mainMat = null;
                this._matScreen = null;
                this._origWidth = 0;
                this._xRange = 0;
                this._yRange = 0;
                this._zRange = 0;
                this._isScreenOutput = true;
                this._azimuth = azimuth;
                this._elevation = elevation;
                this._xMin = xMin;
                this._xMax = xMax;
                this._yMin = yMin;
                this._yMax = yMax;
                this._zMin = zMin;
                this._zMax = zMax;
                this._screenWidth = screenWidth;
                this._screenHeight = screenHeight;
                this._origWidth = screenWidth;
                this._isScreenOutput = isScreenOutput;
                //---- constants that effect how 3D image is contained in screen frame ----
                this.resetCamera();
            }
            transform3dClass.prototype.getZoom = function () {
                var zoom = this._xScale / this._xFact;
                return zoom;
            };
            transform3dClass.prototype.getX = function () {
                return this._xOffset;
            };
            transform3dClass.prototype.getY = function () {
                return this._yOffset;
            };
            transform3dClass.prototype.getElevation = function () {
                return this._elevation;
            };
            transform3dClass.prototype.getRotation = function () {
                return this._azimuth;
            };
            transform3dClass.prototype.setZoom = function (value) {
                var zoom = value * this._xFact;
                this._xScale = zoom;
                this._yScale = zoom;
            };
            transform3dClass.prototype.setX = function (value) {
                this._xOffset = value;
            };
            transform3dClass.prototype.setY = function (value) {
                this._yOffset = value;
            };
            transform3dClass.prototype.setElevation = function (value) {
                this._elevation = value;
            };
            transform3dClass.prototype.setRotation = function (value) {
                this._azimuth = value;
            };
            transform3dClass.prototype.resetCamera = function () {
                this._xOffset = 0;
                this._yOffset = 0;
                this._xScale = this._xFact;
                this._yScale = this._yFact;
                this.rebuild();
            };
            transform3dClass.prototype.getMatrix = function () {
                return this._mat;
            };
            transform3dClass.prototype.getScreenMatrix = function () {
                return this._matScreen;
            };
            transform3dClass.prototype.rebuild = function () {
                var elevation = this._elevation;
                var azimuth = this._azimuth;
                //elevation = vp.lamp(elevation, -90, 90);
                //azimuth = vp.lamp(azimuth, -180, 180);
                //---- convert to radians ----
                elevation = elevation * Math.PI / 180;
                azimuth = azimuth * Math.PI / 180;
                this._xRange = this.safeRange(this._xMax, this._xMin);
                this._yRange = this.safeRange(this._yMax, this._yMin);
                this._zRange = this.safeRange(this._zMax, this._zMin);
                //---- pre-compute 4 values ----
                var se = Math.sin(elevation);
                var ce = Math.cos(elevation);
                var sa = Math.sin(azimuth);
                var ca = Math.cos(azimuth);
                //---- NORMALIZE point3s in 3D space (to [-.5..+5]) ----
                //var x = (x - this._xMin) / this._xRange - .5;
                //var y = (y - this._yMin) / this._yRange - .5;
                //var z = (z - this._zMin) / this._zRange - .5;
                var preMat1 = vp.geom.matrix4.createTranslation(-this._xMin, -this._yMin, -this._zMin);
                var preMat2 = vp.geom.matrix4.createScale(1 / this._xRange, 1 / this._yRange, 1 / this._zRange);
                var preMat3 = vp.geom.matrix4.createTranslation(-.5, -.5, -.5);
                //---- MAP from 3D to 2D (to [-1..+1]) ----
                var mainMat = vp.geom.matrix4.fromFloats(ca, -se * sa, ce * sa, 0, sa, se * ca, -ce * ca, 0, 0, ce, se, 0, 0, 0, 0, 1);
                //---- MAP from ([-1..+1] to screen pixels ----
                //v.x = (this._xShift + this._xScale * v.x) * (this._screenWidth / 2) + this._xOffset;
                //v.y = (this._yShift - this._yScale * v.y) * (this._screenHeight / 2) + this._yOffset;
                var postMat1 = vp.geom.matrix4.createScale(this._xScale, -this._yScale, 1);
                var postMat2 = vp.geom.matrix4.createTranslation(this._xShift, this._yShift, 0);
                var postMat3 = vp.geom.matrix4.createScale(this._screenWidth / 2, this._screenHeight / 2, 1);
                var postMat4 = vp.geom.matrix4.createTranslation(this._xOffset, this._yOffset, 0);
                //---- now, multiple all matricies into a single transform matrix ----
                var mat = preMat1;
                mat = vp.geom.matrix4.multiply(mat, preMat2);
                mat = vp.geom.matrix4.multiply(mat, preMat3);
                mat = vp.geom.matrix4.multiply(mat, mainMat);
                mat = vp.geom.matrix4.multiply(mat, postMat1);
                mat = vp.geom.matrix4.multiply(mat, postMat2);
                mat = vp.geom.matrix4.multiply(mat, postMat3);
                mat = vp.geom.matrix4.multiply(mat, postMat4);
                this._matScreen = mat;
                if (!this._isScreenOutput) {
                    //---- transform from screen pixels back to -1, +1 range (for input to WebGL) ----
                    var postMat5 = vp.geom.matrix4.createScale(2 * 1 / this._screenWidth, 2 * 1 / this._screenHeight, 1);
                    var postMat6 = vp.geom.matrix4.createTranslation(-1, -1, 0);
                    mat = vp.geom.matrix4.multiply(mat, postMat5);
                    mat = vp.geom.matrix4.multiply(mat, postMat6);
                }
                this._mat = mat;
                this._mainMat = mainMat;
                return this;
            };
            transform3dClass.prototype.transformPointEx = function (x, y, z) {
                //---- NORMALIZE point3s in 3D space (to [-.5..+5]) ----
                var nx = (x - this._xMin) / this._xRange - .5;
                var ny = (y - this._yMin) / this._yRange - .5;
                var nz = (z - this._zMin) / this._zRange - .5;
                var v = vp.geom.matrix4.transformPoint(this._mainMat, new vp.geom.vector3(nx, ny, nz));
                //---- MAP from ([-1..+1] to screen pixels ----
                var xx = (this._xShift + this._xScale * v.x) * (this._screenWidth / 2) + this._xOffset;
                var yy = (this._yShift - this._yScale * v.y) * (this._screenHeight / 2) + this._yOffset;
                if (!this._isScreenOutput) {
                    //---- map back to -1, +1 ----
                    xx = (2 * xx / this._screenWidth) - 1;
                    yy = (2 * yy / this._screenHeight) - 1;
                }
                var vv = new vp.geom.vector3(xx, yy, v.z);
                return vv;
            };
            transform3dClass.prototype.adjustZoom = function (scaleFactor, x, y) {
                //---- concept: we want to set the xScale and yScale numbers to a new value, and then adjust the ----
                //---- xOffset and yOffset values such that ptOver is over the same point3 in data space.   ----
                //---- FOR REFERENCE: formula for mapping from ([-1..+1] to screen pixels ----
                //v.x = (this._xShift + this._xScale * v.x) * (this._screenWidth / 2) + this._xOffset;
                //v.y = (this._yShift - this._yScale * v.y) * (this._screenHeight / 2) + this._yOffset;
                if (!this._isScreenOutput) {
                    //---- from WebGL output to our system, the Y must be flipped ----
                    y = this._screenHeight - y;
                }
                //---- MAP ptOver from SCREEN to NORMALIZED 2D space ----
                var xNorm = (x - this._xOffset) / (this._screenWidth / 2);
                //var xNorm = (x - this._xOffset) / (this._screenWidth / 2);
                xNorm = (xNorm - this._xShift) / this._xScale;
                var yNorm = (y - this._yOffset) / (this._screenHeight / 2);
                //var yNorm = (y - this._yOffset) / (this._screenHeight / 2);
                //var yNorm = y / ((this._screenHeight / 2) - this._yOffset);
                yNorm = (yNorm - this._yShift) / (-this._yScale);
                //---- now, apply the new scaling factors ----
                if (scaleFactor < 0) {
                    //---- treat as absolute sclae ----
                    var zoom = -scaleFactor * this._xFact;
                    this._xScale = zoom;
                    this._yScale = zoom;
                }
                else {
                    this._xScale *= scaleFactor;
                    this._yScale *= scaleFactor;
                }
                //---- now, MAP (xNorm, yNorm) back to SCREEN space ----
                var xScreen = (this._xShift + this._xScale * xNorm) * (this._screenWidth / 2) + this._xOffset;
                var yScreen = (this._yShift - this._yScale * yNorm) * (this._screenHeight / 2) + this._yOffset;
                //---- now, compute difference between ptOver and (xScreen, yScreen) and add to xOffset, yOffset ----
                var xDiff = xScreen - x;
                var yDiff = yScreen - y;
                this._xOffset -= xDiff;
                this._yOffset -= yDiff;
                //---- test ----
                //this.rebuild();
            };
            transform3dClass.prototype.safeRange = function (max, min) {
                var range = max - min;
                if (range == 0) {
                    range = 1;
                }
                return range;
            };
            transform3dClass.prototype.testTheMatrix = function () {
                //---- test out mat ----
                var pt = this.transformPoint(0, 0, 0);
                vp.utils.assert(vp.utils.floatEq(pt.x, this._screenWidth / 2));
                vp.utils.assert(vp.utils.floatEq(pt.y, this._screenHeight / 2));
            };
            transform3dClass.prototype.xMin = function (value) {
                if (arguments.length == 0) {
                    return this._xMin;
                }
                this._xMin = value;
                //this.rebuild();
                return this;
            };
            transform3dClass.prototype.xMax = function (value) {
                if (arguments.length == 0) {
                    return this._xMax;
                }
                this._xMax = value;
                //this.rebuild();
                return this;
            };
            transform3dClass.prototype.yMin = function (value) {
                if (arguments.length == 0) {
                    return this._yMin;
                }
                this._yMin = value;
                //this.rebuild();
                return this;
            };
            transform3dClass.prototype.yMax = function (value) {
                if (arguments.length == 0) {
                    return this._yMax;
                }
                this._yMax = value;
                //this.rebuild();
                return this;
            };
            transform3dClass.prototype.screenWidth = function (value) {
                if (arguments.length == 0) {
                    return this._screenWidth;
                }
                this._screenWidth = value;
                this._origWidth = value;
                //this.rebuild();
                return this;
            };
            transform3dClass.prototype.screenHeight = function (value) {
                if (arguments.length == 0) {
                    return this._screenHeight;
                }
                this._screenHeight = value;
                //this.rebuild();
                return this;
            };
            //azimuth(): number;
            //azimuth(value: number): transform3dClass;
            //azimuth(value?: number): any
            //{
            //    if (arguments.length == 0)
            //    {
            //        return this._azimuth;
            //    }
            //    this._azimuth = value;
            //    //this.rebuild();
            //    return this;
            //}
            //elevation(): number;
            //elevation(value: number): transform3dClass;
            //elevation(value?: number): any
            //{
            //    if (arguments.length == 0)
            //    {
            //        return this._elevation;
            //    }
            //    this._elevation = value;
            //    //this.rebuild(); 
            //    return this;  
            //}  
            /** transform a point3 from 3D to 2D */
            transform3dClass.prototype.transformPoint = function (x, y, z) {
                var v = vp.geom.matrix4.transformPoint(this._mat, new vp.geom.vector3(x, y, z));
                return v;
            };
            return transform3dClass;
        })();
        plotBox.transform3dClass = transform3dClass;
        function createTransform3d(screenWidth, screenHeight, azimuth, elevation, xMin, xMax, yMin, yMax, zMin, zMax, isScreenOutput) {
            return new transform3dClass(screenWidth, screenHeight, azimuth, elevation, xMin, xMax, yMin, yMax, zMin, zMax, isScreenOutput);
        }
        plotBox.createTransform3d = createTransform3d;
    })(plotBox = vp.plotBox || (vp.plotBox = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// baseScale.ts.  Copyright (c) 2012 Microsoft Corporation.
///     Part of the vuePlot library - base class for scales.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        var baseScaleClass = (function () {
            function baseScaleClass() {
                this.ctr = "vp.scales.baseScaleClass";
                this.scaleName = "baseScale";
                this._expandSpace = 0; // for adding space after range min and before range max
                this._isRangeClipping = true; // try defaulting this to true, for BeachParty compatability and general sanity.  // when true, we clip values to start/end of range palette
                this._domainMin = 0;
                this._domainMax = 1;
                this._isPaletteDiscrete = undefined;
                this._mappingCallback = undefined; // used to allow caller to override normal mapping from percent to colors
                this._scaleType = ScaleType.linear;
                //---- other fields ----
                this._categoryKeys = {}; // used for categoryMap mapping
                this._nextKeyIndex = 0;
                this._domainDelta = 1;
                this._userSetCategoryKeys = false;
                /** this gets replaced by one of the 3 scale routines internally. */
                this.scale = function (value, seriesIndex) {
                    return 0;
                };
                this.onMapTypeChanged();
            }
            baseScaleClass.prototype.isCategory = function () {
                var isCat = (this._scaleType == ScaleType.categoryIndex || this._scaleType == ScaleType.categoryKey);
                return isCat;
            };
            baseScaleClass.prototype.expandSpace = function (value) {
                if (arguments.length === 0) {
                    return this._expandSpace;
                }
                this._expandSpace = value;
                this.onRangeChanged();
                return this;
            };
            baseScaleClass.prototype.mappingCallback = function (value) {
                if (arguments.length === 0) {
                    return this._mappingCallback;
                }
                this._mappingCallback = value;
                return this;
            };
            baseScaleClass.prototype.isPaletteDiscrete = function (value) {
                if (arguments.length === 0) {
                    return this._isPaletteDiscrete;
                }
                this._isPaletteDiscrete = value;
                return this;
            };
            baseScaleClass.prototype.isRangeClipping = function (value) {
                if (arguments.length == 0) {
                    return this._isRangeClipping;
                }
                this._isRangeClipping = value;
                return this;
            };
            baseScaleClass.prototype.scaleType = function (value) {
                if (arguments.length == 0) {
                    return this._scaleType;
                }
                if (value != this._scaleType) {
                    this._scaleType = value;
                    this.onMapTypeChanged();
                }
                return this;
            };
            baseScaleClass.prototype.palette = function (value) {
                if (arguments.length == 0) {
                    return this._palette;
                }
                this._palette = (arguments.length == 1) ? value : vp.utils.argumentsAsArray(arguments);
                this.onPaletteChanged();
                return this;
            };
            baseScaleClass.prototype.rangeMin = function (value) {
                if (!this._palette) {
                    //---- JIT, convert to 2 dimensional array ----
                    this._palette = [0, 100];
                }
                if (arguments.length == 0) {
                    return this._palette[0];
                }
                this._palette[0] = value;
                this.onRangeChanged();
                return this;
            };
            baseScaleClass.prototype.rangeMax = function (value) {
                if (!this._palette) {
                    //---- JIT, convert to 2 dimensional array ----
                    this._palette = [0, 100];
                }
                if (arguments.length == 0) {
                    return this._palette[1];
                }
                this._palette[1] = value;
                this.onRangeChanged();
                return this;
            };
            baseScaleClass.prototype.range = function (min, max) {
                this.rangeMin(min);
                this.rangeMax(max);
                return this;
            };
            baseScaleClass.prototype.onRangeChanged = function () {
            };
            baseScaleClass.prototype.onPaletteChanged = function () {
            };
            baseScaleClass.prototype.stops = function (value) {
                if (arguments.length == 0) {
                    return this._stops;
                }
                this._stops = (arguments.length == 1) ? value : vp.utils.argumentsAsArray(arguments);
                return this;
            };
            baseScaleClass.prototype.domainMin = function (value) {
                if (arguments.length == 0) {
                    return this._domainMin;
                }
                this._domainMin = value;
                this.onDomainChanged();
                return this;
            };
            baseScaleClass.prototype.domainMax = function (value) {
                if (arguments.length == 0) {
                    return this._domainMax;
                }
                this._domainMax = value;
                this.onDomainChanged();
                return this;
            };
            baseScaleClass.prototype.onDomainChanged = function () {
                this._domainDelta = this._domainMax - this._domainMin;
                if (this._domainDelta == 0) {
                    this._domainDelta = 1;
                }
            };
            baseScaleClass.prototype.resetKeys = function () {
                if (!this._userSetCategoryKeys) {
                    this._categoryKeys = {}; // reset the keys seen
                    this._nextKeyIndex = 0;
                }
            };
            baseScaleClass.prototype.categoryKeys = function (value) {
                if (arguments.length == 0) {
                    return this._categoryKeys;
                }
                this.setCategoryKeys(value);
                return this;
            };
            baseScaleClass.prototype.setCategoryKeys = function (keys) {
                this._categoryKeys = {};
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    this._categoryKeys[key] = i;
                }
                this._nextKeyIndex = keys.length;
                ;
                this._userSetCategoryKeys = true;
            };
            baseScaleClass.prototype.onMapTypeChanged = function () {
                var scaleType = this._scaleType;
                if (scaleType == ScaleType.categoryIndex) {
                    this.scale = this.categoryIndexScale;
                }
                else if (scaleType == ScaleType.categoryKey) {
                    this.scale = this.categoryKeyScale;
                }
                else if (scaleType == ScaleType.linear) {
                    this.scale = this.lerpScale;
                }
                this.resetKeys();
            };
            /** call this using the index of the key value, as stored in the categoryKeys property. */
            baseScaleClass.prototype.categoryIndexScale = function (keyIndex) {
                var result = undefined;
                var palette = this._palette;
                if (palette && palette.length > 0) {
                    if (this._isRangeClipping) {
                        var paletteIndex = this.clip(keyIndex, 0, palette.length - 1);
                    }
                    else {
                        var paletteIndex = keyIndex % palette.length;
                    }
                    //---- we require category scales to have an entry for each key (no interpolation) ----
                    //---- this is true for X, Y, Z category scales as well ----
                    //---- use "keyIndex" to get a value from palette ----
                    paletteIndex = Math.floor(paletteIndex);
                    result = palette[paletteIndex];
                }
                return result;
            };
            /** use this to get the index of the key before calling categoryScale(). */
            baseScaleClass.prototype.getIndexOfKey = function (value) {
                var index = this._categoryKeys[value];
                if (index === undefined) {
                    index = this._nextKeyIndex++;
                    this._categoryKeys[value] = index;
                }
                return index;
            };
            baseScaleClass.prototype.categoryKeyScale = function (value) {
                var index = this.getIndexOfKey(value);
                //---- pass all original arguments (subclass may have extra params) ----
                arguments[0] = index; // update "value" param
                var result = this.categoryIndexScale.apply(this, arguments);
                return result;
            };
            baseScaleClass.prototype.clip = function (value, min, max) {
                //---- it turns out we DON'T WANT clipping for our plots ----
                //---- so we disable this by default ----
                if (value < min) {
                    value = min;
                }
                else if (value > max) {
                    value = max;
                }
                return value;
            };
            baseScaleClass.prototype.calcPercent = function (value) {
                var divisor = (this._domainDelta === 0) ? 1 : this._domainDelta;
                var t = (value - this._domainMin) / divisor;
                if (this._isRangeClipping) {
                    t = this.clip(t, 0, 1);
                }
                //if (this._isWrappingEnabled)
                //{
                //    if (t > 1) 
                //    {
                //        t = t - Math.floor(t);      // get fractional part of value
                //    }
                //}
                return t;
            };
            baseScaleClass.prototype.lerpPalette = function (t, palette) {
                var result = null;
                var pcount = palette.length; // we know pcount >= 2
                var lastIndex = pcount - 1; // we know lastIndex >= 1
                //---- allow for t outside of bounds [0..1], but don't apply clipping ----
                if (t < 0) {
                    //---- always use first 2 palettes for this out of bounds case ----
                    result = this.interpolateValues(palette[0], palette[1], t);
                }
                else if (t > 1) {
                    //---- always use last 2 palettes for this out of bounds case ----
                    result = this.interpolateValues(palette[pcount - 2], palette[pcount - 1], t);
                }
                else if (t == 0) {
                    //---- take care of easy cases first ----
                    result = palette[0];
                }
                else if (t == 1) {
                    //---- take care of easy cases first ----
                    result = palette[lastIndex];
                }
                else {
                    var stops = this._stops;
                    if ((stops) && (stops.length != pcount)) {
                        stops = null;
                    }
                    var index = -1;
                    if (!stops) {
                        //---- common case, & faster path ----
                        var dindex = lastIndex * t;
                        var index = Math.min(lastIndex - 1, Math.floor(dindex));
                        //---- re-normalize t ----
                        t = dindex - index;
                    }
                    else {
                        //---- walk stops[] to find pair of values "t" is between ----
                        var index = -1;
                        for (var i = 0; i < pcount; i++) {
                            if (stops[i] >= t) {
                                index = i;
                                break;
                            }
                        }
                        if (index == -1) {
                            //---- never found - use last entry ----
                            result = palette[lastIndex];
                        }
                        else if (index == 0) {
                            //---- use first entry ----
                            result = palette[0];
                        }
                        else {
                            index--; // start with our previous entry
                            var interval = stops[index + 1] - stops[index];
                            //---- re-normalize "t" ----
                            t = (interval == 0) ? 0 : ((t - stops[index]) / interval);
                        }
                    }
                    ////---- now we can apply the ease ----
                    //if (easeFunc != null)
                    //{
                    //    t = easeFunc(t);
                    //}
                    if (t == 0) {
                        result = palette[index];
                    }
                    else if (t == 1) {
                        result = palette[index + 1];
                    }
                    else {
                        result = this.interpolateValues(palette[index], palette[index + 1], t);
                    }
                }
                return result;
            };
            baseScaleClass.prototype.lerpScale = function (value, rangePalette) {
                var result = undefined;
                var palette = (rangePalette) ? rangePalette : this._palette;
                if ((this._expandSpace) && (palette && palette.length == 2)) {
                    var p0 = palette[0];
                    var p1 = palette[1];
                    if (p0 > p1) {
                        //---- flipped scale ----
                        p0 = p0 - this._expandSpace;
                        p1 = p1 + this._expandSpace;
                    }
                    else {
                        p0 = p0 + this._expandSpace;
                        p1 = p1 - this._expandSpace;
                    }
                    //---- create new copy of palette (don't touch the class property ----
                    palette = [p0, p1];
                }
                value = +value;
                if (this._mappingCallback) {
                    var t = this.calcPercent(value);
                    result = this._mappingCallback(value, t);
                }
                else {
                    if ((palette && palette.length > 0) && (!isNaN(value))) {
                        if (palette.length == 1) {
                            //---- take care of odd case first ----
                            result = palette[0];
                        }
                        else {
                            ///
                            /// Note: "t" wiil be [0..1] and will be used to find pair of entries in palette[]) 
                            /// 
                            var t = this.calcPercent(value);
                            if (this._isPaletteDiscrete) {
                                var rawIndex = t * palette.length;
                                var index = Math.floor(rawIndex);
                                //---- correct edge case where t=1 ----
                                //---- correct edge case where a range of numeric values is treated as:   value > min, value <= max ----
                                if (index > 0 && index == rawIndex) {
                                    index--;
                                }
                                result = palette[index];
                            }
                            else {
                                result = this.lerpPalette(t, palette);
                            }
                        }
                    }
                }
                return result;
            };
            baseScaleClass.prototype.lerp = function (num, num2, t) {
                var result = num + t * (num2 - num);
                return result;
            };
            baseScaleClass.prototype.interpolateValues = function (min, max, t) {
                var result = this.lerp(min, max, t);
                return result;
            };
            return baseScaleClass;
        })();
        scales.baseScaleClass = baseScaleClass;
        var baseScale = (function (_super) {
            __extends(baseScale, _super);
            function baseScale() {
                _super.apply(this, arguments);
            }
            return baseScale;
        })(baseScaleClass);
        scales.baseScale = baseScale;
        //---- NEW VuePlot Wide Policy - make the first letter of enum name CAPITAL, to avoid accidental ambiguous reference to property of same name ----
        //---- that is usually not caught by TypeScript. ----
        /** type of mapping used in scales to extract values from a range palette. */
        (function (ScaleType) {
            /** use normalized input value to interplate between palette entries. */
            ScaleType[ScaleType["linear"] = 0] = "linear";
            /** take log of input values before doing linear scale to range. */
            ScaleType[ScaleType["log"] = 1] = "log";
            /** take log of normalized input values before doing linear scale to range. */
            ScaleType[ScaleType["lowBias"] = 2] = "lowBias";
            /** take exp of normalized input values before doing linear scale to range. */
            ScaleType[ScaleType["highBias"] = 3] = "highBias";
            /** use itemIndex as index into palette.  Caution: do NOT use with a filter, where your itemIndexes
             * are not consecutive.  */
            ScaleType[ScaleType["categoryIndex"] = 4] = "categoryIndex";
            /** use a map to track unique values and use key index as index into palette. */
            ScaleType[ScaleType["categoryKey"] = 5] = "categoryKey";
            /** simliar to linear, but with support for nice date breaks and formatting on axis/legend. */
            ScaleType[ScaleType["dateTime"] = 6] = "dateTime";
        })(scales.ScaleType || (scales.ScaleType = {}));
        var ScaleType = scales.ScaleType;
        //export interface IScale
        //{
        //    scale(value: any): any;
        //    getActualBreaks(): any[];
        //    getActualLabels(): string[];
        //    autoRange(): boolean;
        //    rangeMin(value: number): IScale;
        //    rangeMax(value: number): IScale;
        //}
        /** extract a numeric value from a discrete palette.  Does NOT do blending between entries. */
        function numberFromDiscretePalette(palette, index, firstPaletteIndex) {
            //---- when a filter is active and we draw all shapes with a subset scale, ----
            //---- it is common for the index to be invalid.  so, we fix it up here ----
            if (firstPaletteIndex === void 0) { firstPaletteIndex = 0; }
            //---- new policy is that an "other" palette at the end catches all "too big" entries ----
            index = Math.floor(vp.data.clamp(index, firstPaletteIndex, palette.length - 1));
            var value = palette[index];
            return value;
        }
        scales.numberFromDiscretePalette = numberFromDiscretePalette;
        /** extract a numeric value from a continuous palette by blending the 2 closest enties as per the non-integer index. */
        function numberFromContinuousPalette(palette, index) {
            //---- when a filter is active and we draw all shapes with a subset scale, ----
            //---- it is common for the index to be invalid.  so, we fix it up here ----
            index = (Math.abs(index) % palette.length); // recycle entires to fulfill request
            var value = 0;
            if ((index < palette.length - 1) && (index != Math.floor(index))) {
                //---- interpolate between two entries ----
                var fract = index - Math.floor(index);
                var floorIndex = Math.floor(index);
                value = vp.data.lerp(fract, palette[floorIndex], palette[floorIndex + 1]);
            }
            else {
                value = palette[Math.floor(index)];
            }
            return value;
        }
        scales.numberFromContinuousPalette = numberFromContinuousPalette;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// categoryScale.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - category scale.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        var categoryScaleClass = (function (_super) {
            __extends(categoryScaleClass, _super);
            /** if scaleByIndex is true, the scale() function will be passed the index of the key at scale() usage
            time.  if false, it will pass the key value itself (which is RECOMMENDED when a filter can be used). */
            function categoryScaleClass(scaleByIndex) {
                _super.call(this);
                this._rangeBounds = null;
                this._stepSize = 1; // size of a category within the range
                //vp.utils.trace("ctr", "categoryScale");
                this.ctr = "vp.scales.categoryScaleClass";
                this.scaleName = "category";
                if (scaleByIndex) {
                    this.scaleType(scales.ScaleType.categoryIndex);
                }
                else {
                    this.scaleType(scales.ScaleType.categoryKey);
                }
            }
            categoryScaleClass.prototype.stepSize = function () {
                return this._stepSize;
            };
            categoryScaleClass.prototype.domain = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (arguments.length == 0) {
                    return this._categoryKeys;
                }
                if (args.length == 1) {
                    this.setCategoryKeys(args[0]);
                }
                else {
                    this.setCategoryKeys(args);
                }
                if (this._rangeBounds) {
                    this.computeRangeFromBounds();
                }
                return this;
            };
            categoryScaleClass.prototype.rangeValues = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (arguments.length == 0) {
                    return this._palette;
                }
                if (args.length == 1) {
                    //---- values passed as single array ----
                    this.palette(args[0]);
                }
                else {
                    //---- values passed as function arguments ----
                    this.palette(args);
                }
                this._rangeBounds = null;
                return this;
            };
            /** create a palette of values from the range bounds. */
            categoryScaleClass.prototype.range = function (min, max, computeRangeSteps) {
                if (computeRangeSteps === void 0) { computeRangeSteps = true; }
                if (computeRangeSteps) {
                    this._rangeBounds = [min, max];
                    this.computeRangeFromBounds();
                }
                else {
                    this._palette = [min, max];
                }
                return this;
            };
            categoryScaleClass.prototype.onRangeChanged = function () {
                _super.prototype.onRangeChanged.call(this);
                if (this._rangeBounds) {
                    this.computeRangeFromBounds();
                }
            };
            categoryScaleClass.prototype.computeRangeFromBounds = function () {
                var keys = vp.utils.keys(this._categoryKeys);
                var steps = keys.length;
                var min = this._rangeBounds[0];
                var max = this._rangeBounds[1];
                if (min < max) {
                    min += this._expandSpace;
                    max -= this._expandSpace;
                }
                else {
                    max += this._expandSpace;
                    min -= this._expandSpace;
                }
                var delta = max - min; // might be negative
                this._stepSize = (steps >= 1) ? (delta / steps) : 1;
                var halfStep = this._stepSize / 2;
                //---- generate points in middle of each step ----
                var stopper = max - halfStep; // only generate "steps" steps
                this._palette = vp.data.range(min, stopper, this._stepSize).map(function (value, index) {
                    return value + halfStep;
                });
                //vp.utils.debug("*** rangeFromBounds: max=" + max + ", stepSize=" + this._stepSize +
                //    ", this._palette=" + this._palette);
            };
            categoryScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            return categoryScaleClass;
        })(scales.baseScale);
        scales.categoryScaleClass = categoryScaleClass;
        function createCategoryIndex() {
            return new categoryScaleClass(true);
        }
        scales.createCategoryIndex = createCategoryIndex;
        function createCategoryKey() {
            return new categoryScaleClass(false);
        }
        scales.createCategoryKey = createCategoryKey;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dateScale.ts.  Copyright (c) 2012 Microsoft Corporation.
///     Part of the vuePlot library - date/time scale.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        var dateScaleClass = (function (_super) {
            __extends(dateScaleClass, _super);
            function dateScaleClass() {
                _super.call(this);
                //vp.utils.trace("ctr", "dateScale");
                this.ctr = "vp.scales.dateScaleClass";
                this.scaleName = "date";
                this._scaleType = scales.ScaleType.dateTime;
            }
            dateScaleClass.prototype.domain = function (min, max) {
                if (arguments.length == 0) {
                    return [this._domainMin, this._domainMax];
                }
                //---- the "+" here will convert JavaScript data objects to their numeric equivalent ----
                this.domainMin(+min);
                this.domainMax(+max);
                return this;
            };
            dateScaleClass.prototype.range = function (min, max) {
                if (arguments.length == 0) {
                    if (arguments.length == 0) {
                        return this._palette;
                    }
                }
                this.palette([min, max]);
                return this;
            };
            dateScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            return dateScaleClass;
        })(scales.baseScale);
        scales.dateScaleClass = dateScaleClass;
        function createDate() {
            return new dateScaleClass();
        }
        scales.createDate = createDate;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// linearScale.ts.  Copyright (c) 2012 Microsoft Corporation.
///     Part of the vuePlot library - linear scale.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        var linearScaleClass = (function (_super) {
            __extends(linearScaleClass, _super);
            function linearScaleClass() {
                _super.call(this);
                //vp.utils.trace("ctr", "linearScale");
                this.ctr = "vp.scales.linearScaleClass";
                this.scaleName = "linear";
                this._scaleType = scales.ScaleType.linear;
            }
            linearScaleClass.prototype.domain = function (min, max) {
                if (arguments.length == 0) {
                    return [this._domainMin, this._domainMax];
                }
                this.domainMin(min);
                this.domainMax(max);
                return this;
            };
            linearScaleClass.prototype.range = function (min, max) {
                if (arguments.length == 0) {
                    if (arguments.length == 0) {
                        return this._palette;
                    }
                }
                this.palette([min, max]);
                return this;
            };
            linearScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            return linearScaleClass;
        })(scales.baseScale);
        scales.linearScaleClass = linearScaleClass;
        function createLinear() {
            return new linearScaleClass();
        }
        scales.createLinear = createLinear;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// logScale.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - log scale.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        var logScaleClass = (function (_super) {
            __extends(logScaleClass, _super);
            function logScaleClass() {
                _super.call(this);
                //vp.utils.trace("ctr", "logScale");
                this.ctr = "vp.scales.logScaleClass";
                this.scaleName = "log";
                this._scaleType = scales.ScaleType.log;
            }
            logScaleClass.prototype.domain = function (min, max) {
                if (arguments.length == 0) {
                    return [this._domainMin, this._domainMax];
                }
                this.domainMin(min);
                this.domainMax(max);
                return this;
            };
            logScaleClass.prototype.range = function (min, max) {
                if (arguments.length == 0) {
                    if (arguments.length == 0) {
                        return this._palette;
                    }
                }
                this.palette([min, max]);
                return this;
            };
            logScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            logScaleClass.prototype.calcPercent = function (value) {
                //---- TODO: precompute these when domain changes ----
                var logMin = Math.log(this._domainMin);
                var logMax = Math.log(this._domainMax);
                var logDelta = (logMax == logMin) ? 1 : (logMax - logMin);
                var logValue = Math.log(value);
                var t = (logValue - logMin) / logDelta;
                if (this._isRangeClipping) {
                    t = this.clip(t, 0, 1);
                }
                return t;
            };
            return logScaleClass;
        })(scales.baseScale);
        scales.logScaleClass = logScaleClass;
        function createLog() {
            return new logScaleClass();
        }
        scales.createLog = createLog;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// niceNumbers.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlot library
///    - used to caculate nice numbers for an axis, for histograms, etc.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        /** settings for an attribute (value, scaling, and legend data). */
        var niceNumbers = (function () {
            function niceNumbers() {
            }
            niceNumbers.niceUp = function (value) {
                var nice = 0;
                if (value < 0) {
                    nice = -niceNumbers.niceDown(-value);
                }
                else if (value > 0) {
                    var precision = 2; // round the 2 most significant digit
                    var exponent = Math.floor(Math.log10(value) - (precision + 1));
                    var sciNotation = value / Math.pow(10, exponent);
                    var nice = Math.ceil(sciNotation) * Math.pow(10, exponent);
                }
                return nice;
            };
            niceNumbers.niceUpAlt = function (value) {
                var nice = 0;
                if (value < 0) {
                    nice = -niceNumbers.niceDown(-value);
                }
                else if (value > 0) {
                    var exponent = Math.floor(Math.log10(value));
                    var mantissa = value / Math.pow(10, exponent);
                    if (mantissa <= 2) {
                        mantissa = 2;
                    }
                    else if (mantissa <= 5) {
                        mantissa = 5;
                    }
                    else if (mantissa < 10) {
                        mantissa = 10;
                    }
                    var nice = Math.ceil(mantissa) * Math.pow(10, exponent);
                }
                return nice;
            };
            /** Finds a nice number that is <= value. */
            niceNumbers.niceDown = function (value) {
                var nice = 0;
                if (value < 0) {
                    nice = -niceNumbers.niceUp(-value);
                }
                else if (value > 0) {
                    var precision = 2; // round the 2 most significant digit
                    var exponent = Math.floor(Math.log10(value) - (precision + 1));
                    var sciNotation = value / Math.pow(10, exponent);
                    var nice = Math.floor(sciNotation) * Math.pow(10, exponent);
                }
                return nice;
            };
            niceNumbers.calcMinMaxGivenTickCount = function (min, max, tickCount) {
                //hostServices.debug("START calcMinMaxGivenTickCount: min=" + min + ", max=" + max + ", tickCount=" + tickCount);
                var numDivs = tickCount - 1;
                var range = max - min;
                if ((numDivs > 0) && (range > 0)) {
                    //---- special case ----
                    if (min > 0 && min < .1 && max > .9 && max < 1) {
                        min = 0;
                        newMax = 1;
                        increment = 1 / numDivs;
                    }
                    else {
                        var increment = range / numDivs;
                        increment = niceNumbers.niceUp(increment);
                        //---- set min ----
                        if (min != 0) {
                            min = increment * (Math.floor(min / increment));
                        }
                        //---- set max ----
                        var newMax = min + numDivs * increment;
                        if (newMax < max) {
                            //---- need to again with adjusted min ----
                            range = max - min;
                            increment = range / numDivs;
                            increment = niceNumbers.niceUp(increment);
                            min = increment * (Math.floor(min / increment));
                            newMax = min + numDivs * increment;
                        }
                    }
                }
                else {
                    var newMax = max;
                    var increment = range;
                }
                var result = { min: min, max: newMax, increment: increment, tickCount: tickCount };
                //hostServices.debug("calcMinMaxGivenTickCount: newMin=" + result.min + ", newMax=" + result.max + ", increment=" +
                //    result.increment + ", tickCount=" + result.tickCount);
                return result;
            };
            niceNumbers.calculate = function (dataMin, dataMax, extendDomainToZero, useOnlyIntBreaks, callerMin, callerMax, callerTickCount, addmaxHeadroom) {
                //---- designed for "measure" data (see seperate algorithm for date values) ----
                var min = dataMin;
                var max = dataMax;
                var adjustMin = true;
                var adjustMax = true;
                if (callerMin != undefined) {
                    min = callerMin;
                    adjustMin = false;
                }
                if (callerMax != undefined) {
                    max = callerMax;
                    adjustMax = false;
                }
                if (addmaxHeadroom === undefined) {
                    addmaxHeadroom = true;
                }
                var incr = 0;
                if ((adjustMin) || (adjustMax)) {
                    var minMax = this.calcMinMax(min, max, adjustMin, adjustMax, extendDomainToZero, addmaxHeadroom, useOnlyIntBreaks);
                    min = minMax.min;
                    max = minMax.max;
                    incr = minMax.incr;
                }
                else {
                    var result2 = this.calcIncr(min, max, useOnlyIntBreaks);
                    incr = result2.incr;
                }
                //---- calc TICKS ----
                var ticks = 0;
                if (callerTickCount === undefined) {
                    var incrCount = (max - min) / incr;
                    ticks = 1 + Math.floor(incrCount + .00001);
                }
                else {
                    ticks = callerTickCount;
                }
                //---- assign final values ----
                var result = { min: min, max: max, tickCount: ticks };
                return result;
            };
            niceNumbers.calcIncr = function (min, max, useOnlyIntBreaks) {
                var incr = 1;
                var range = max - min;
                if (range > 0) {
                    var exp = Math.floor(Math.log10(range));
                    var r = range / Math.pow(10, exp);
                    if (r > 9.523) {
                        range *= 1.05;
                        max = min + range;
                        exp = Math.floor(Math.log10(range));
                        r = range / Math.pow(10, exp);
                    }
                    if (r < 2) {
                        incr = .2;
                    }
                    else if (r < 5) {
                        incr = .5;
                    }
                    incr = incr * Math.pow(10, exp);
                    if (useOnlyIntBreaks) {
                        incr = Math.max(1, Math.round(incr));
                    }
                }
                return { incr: incr, max: max };
            };
            niceNumbers.calcMinMax = function (dataMin, dataMax, adjustMin, adjustMax, extendDomainToZero, addmaxHeadroom, useOnlyIntBreaks) {
                var min = dataMin;
                var max = dataMax;
                if (extendDomainToZero) {
                    if ((min > 0) && (adjustMin)) {
                        min = 0;
                    }
                    if ((max < 0) && (adjustMax)) {
                        max = 0;
                    }
                }
                if ((min == max) && (adjustMax)) {
                    incr = (useOnlyIntBreaks) ? 1 : .1 * dataMin;
                    max = dataMin + incr;
                }
                else {
                    var range = max - min;
                    if (range > 0) {
                        if (useOnlyIntBreaks) {
                            min = Math.floor(min);
                            max = Math.ceil(max);
                        }
                        var result = niceNumbers.calcIncr(min, max, useOnlyIntBreaks);
                        var incr = result.incr;
                        max = result.max;
                        //---- set domainMin to max INCR increment that is < minValue (or <= if 0) ----
                        //---- set domainMax to min INCR increment that is > maxValue ----
                        if (min >= 0) {
                            min = incr * Math.floor(min / incr);
                        }
                        else {
                            min = incr * Math.floor(min * 1.001 / incr);
                        }
                        if (addmaxHeadroom) {
                            if ((max / incr) == Math.round(max / incr)) {
                                //---- if max is a multiple of "incr", add one increment ----
                                max = max + incr;
                            }
                            else {
                                //---- round UP to the next increment ----
                                //max = incr * Math.ceil(max / incr);
                                //---- try always adding one incr ----
                                max = incr * Math.round((max + incr) / incr);
                            }
                        }
                        else {
                            //---- try always adding part of one incr ----
                            max = incr * Math.floor((max + .9 * incr) / incr);
                        }
                    }
                }
                return { min: min, max: max, incr: incr };
            };
            return niceNumbers;
        })();
        scales.niceNumbers = niceNumbers;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// msgMgr.ts.  Copyright (c) 2014 Microsoft Corporation.
///                part of the vuePlotCore library - misc utility functions.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var utils;
    (function (utils) {
        /** a class that manages window messages for its associated window. */
        var msgMgrClass = (function () {
            function msgMgrClass(windowName) {
                var _this = this;
                this._windowName = windowName;
                //---- hook "message" event (msgs from hosting window) ----
                window.addEventListener('message', function (e) { _this.onMessageFromParent(e); });
            }
            msgMgrClass.prototype.postMessageToParent = function (msgObj) {
                if (!this._parentWindow) {
                    this._parentWindow = window.parent;
                }
                if (this._parentWindow) {
                    //---- don't overwrite the FROM field, if already set ----
                    if (!msgObj.from) {
                        msgObj.from = this._windowName;
                    }
                    var msg = JSON.stringify(msgObj);
                    var domain = this.getDomain();
                    this._parentWindow.postMessage(msg, domain);
                }
            };
            msgMgrClass.prototype.getDomain = function () {
                var domain = location.hostname;
                if (!domain) {
                    domain = "localhost";
                }
                domain = "http://" + domain;
                return domain;
            };
            msgMgrClass.prototype.onMessageFromParent = function (e) {
                //console.log("OnMessageFromParent!!!");
                if (e && e.data) {
                    var msgObj = JSON.parse(e.data);
                    if (msgObj.from != this._windowName) {
                        vp.utils.debug("got window message from " + msgObj.from + ": " + e.data);
                        this.processMessageFromParent(e, msgObj);
                    }
                }
            };
            //---- view class should override this ----
            msgMgrClass.prototype.processMessageFromParent = function (e, msgObj) {
            };
            return msgMgrClass;
        })();
        utils.msgMgrClass = msgMgrClass;
    })(utils = vp.utils || (vp.utils = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// traceMgr.ts.  Copyright (c) 2014 Microsoft Corporation.
///                part of the vuePlotCore library - misc utility functions.
///-----------------------------------------------------------------------------------------------------------------
//module vp.utils
//{
//    export var traceCmds: traceCmd[] = [];
//    export class traceMgrClass extends msgMgrClass
//    {
//        _traceWindow: Window = null;
//        constructor()
//        {
//            super("traceMgr");
//            //---- startup code for traceMgr ----
//            vp.events.attach(window.document, "keydown", (e) =>
//            {
//                if (e.keyCode == vp.events.keyCodes.f12 && e.ctrlKey)
//                {
//                    //---- open a "trace explorer" window on  Ctrl-F12 ----
//                    this._traceWindow = window.open("../TraceExplorer/TraceExplorer.html");
//                    //alert("set traceWindow=" + this._traceWindow.name);
//                    setTimeout((e) =>
//                    {
//                        //---- send trace explorer it's INIT msg ----
//                        this.postMessageToFrame({ msgType: "init" });
//                    }, 200);
//                    vp.events.cancelEventDefault(e);
//                }
//            });
//        }
//        processMessageFromParent(e, msgObj)
//        {
//            if (msgObj.msgType == "getTraceCmds")
//            {
//                alert("got 'getTraceCmds' request from window=" + this._traceWindow.name);
//                var traceStr = JSON.stringify(traceCmds);
//                var msgObj2 = { msgType: "traceCmds", value: traceStr };
//                alert("sending msg to traceExplorer, from window=" + window.name + ", to window=" + this._traceWindow.name );
//                this.postMessageToFrame(msgObj2);
//            }
//        }
//        postMessageToFrame(msgObj)
//        {
//            //var iframe = <HTMLIFrameElement>document.getElementById(id);
//            //var contentWindow = iframe.contentWindow;
//            var contentWindow = this._traceWindow;
//            //alert("postMessageToFrame; traceWindow=" + this._traceWindow.name);
//            if (contentWindow)
//            {
//                var msg = JSON.stringify(msgObj);
//                var domain = this.getDomain();
//                contentWindow.postMessage(msg, domain);
//            }
//        }
//    }
//    export function trace(traceType: string, id: string, status?: any)
//    {
//        var cmd = new traceCmd(traceType, id, status);
//        //debug("trace: " + cmd);
//        cmd.traceNum = traceCmds.length;
//        traceCmds.push(cmd);
//    }
//    export function traceAniFrame(childCount: number, frameNumber: number, percent: number)
//    {
//        var cmd = new aniFrameCmd(childCount, frameNumber, percent);
//        //debug("trace: " + cmd);
//        cmd.traceNum = traceCmds.length;
//        traceCmds.push(cmd);
//    }
//    // private
//    export class traceCmd
//    {
//        traceNum: number;
//        timeStamp: number;
//        traceType: string;
//        id: string;
//        status: any;
//        constructor(traceType: string, id: string, status?: any)
//        {
//            this.traceType = traceType;
//            this.id = id;
//            this.status = status;
//            this.timeStamp = vp.utils.now();
//        }
//        toString()
//        {
//            var str = this.traceType + ": " + this.id;
//            if (status)
//            {
//                str += "{" + status + "}";
//            }
//            return str;
//        }
//    }
//    export class aniFrameCmd extends traceCmd
//    {
//        childCount: number;
//        frameNumber: number;
//        percent: number;
//        constructor(childCount: number, frameNumber: number, percent: number)
//        {
//            super("aniFrame", "");
//            this.childCount = childCount;
//            this.frameNumber = frameNumber;
//            this.percent = percent;
//        }
//    }
//    //var traceMgr = new traceMgrClass();
//}
////---- create function in "window" global namespace ----
//function sendDirectMessage(msg)
//{
//    if (msg == "getTraceCmds")
//    {
//        var str = JSON.stringify(vp.utils.traceCmds);
//        return str;
//    }
//}
///-----------------------------------------------------------------------------------------------------------------
/// utils.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - general utility functions
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var utils;
    (function (utils) {
        var debugId = null;
        function now() {
            //---- for now, don't use this ----
            if (false) {
                //---- use HIGH PRECISION timer when available ----
                var value = window.performance.now();
            }
            else {
                //---- use this 15ms increment thing if we have to ----
                var value = +Date.now();
            }
            return value;
        }
        utils.now = now;
        utils.appStartTime = now();
        function mapEquals(map1, map2) {
            var keys1 = vp.utils.keys(map1);
            var keys2 = vp.utils.keys(map2);
            var eq = vp.arrayEquals(keys1, keys2);
            if (eq) {
                for (var i = 0; i < keys1.length; i++) {
                    var key = keys1[i];
                    var value1 = map1[key];
                    var value2 = map2[key];
                    eq = equals(value1, value2);
                    if (!eq) {
                        break;
                    }
                }
            }
            return eq;
        }
        utils.mapEquals = mapEquals;
        function equals(any1, any2) {
            if (vp.utils.isArray(any1)) {
                var eq = vp.arrayEquals(any1, any2);
            }
            else if (any1 instanceof Float32Array) {
                var eq = vp.arrayEquals(any1, any2);
            }
            else if (any1 instanceof Object) {
                var eq = vp.utils.mapEquals(any1, any2);
            }
            else {
                var eq = (any1 === any2);
            }
            return eq;
        }
        utils.equals = equals;
        function parseJsonIntoObj(json, obj) {
            var j = JSON.parse(json);
            copyMapIntoObj(j, obj);
            return obj;
        }
        utils.parseJsonIntoObj = parseJsonIntoObj;
        function addUnits(value, defaultUnits) {
            if (!vp.utils.isString(value)) {
                value = value + defaultUnits;
            }
            else {
                //---- see if value has any non-digits ----
                var foundUnits = false;
                for (var i = 0; i < value.length; i++) {
                    if ((value[i] < '0') || (value[i] > '9')) {
                        foundUnits = true;
                        break;
                    }
                }
                if (!foundUnits) {
                    value += defaultUnits;
                }
            }
            return value;
        }
        utils.addUnits = addUnits;
        function indexKeyFunc(dataRecord, index) {
            return index;
        }
        utils.indexKeyFunc = indexKeyFunc;
        function setDebugId(name) {
            debugId = name;
        }
        utils.setDebugId = setDebugId;
        /// send "msg" to the browser debug console, if present. 
        function debug(msg) {
            if (window.console && window.console.log) {
                var now = vp.utils.now() - vp.utils.appStartTime;
                var secs = now / 1000;
                var time = "@" + secs.toFixed(3);
                if (debugId) {
                    time += " [" + debugId + "]";
                }
                console.log(time + ": " + msg);
            }
        }
        utils.debug = debug;
        /// test condition - use alert if false
        function assert(cond, msg) {
            if (!cond) {
                if (!msg) {
                    msg = "vp.assert: conditon failed";
                }
                alert(msg);
            }
        }
        utils.assert = assert;
        /// return true if object has one or more dictionary keys.
        function hasKeys(obj) {
            /// fastest cross-browser test
            var count = 0;
            for (var k in obj) {
                count++;
                break;
            }
            return (count > 0);
        }
        utils.hasKeys = hasKeys;
        utils.computedStyles = {};
        function getComputedStyleFromClass(shapeName, parentClassName, className) {
            var key = shapeName + "^" + className;
            var cs = utils.computedStyles[key];
            if (!cs) {
                //---- create a temp SVG document ----
                var svg = vp.select(document.body).append("svg")
                    .addClass(parentClassName);
                var elem = svg.append(shapeName)
                    .addClass(className);
                //---- let browser system compute all casdaded styles as of this moment ----
                var css = window.getComputedStyle(elem[0]);
                //---- copy a subset of the properties we need because when we ----
                //---- remove our temp. elements, the css will be updated and useless to us ----
                cs = {
                    fill: css.fill, stroke: css.stroke, strokeWidth: css.strokeWidth, opacity: css.opacity,
                    fontFamily: css.fontFamily, fontSize: css.fontSize, fontWeight: css.fontWeight, fontStyle: css.fontStyle,
                    strokeDasharray: css.strokeDasharray, strokeDashoffset: css.strokeDashoffset, textAnchor: css.textAnchor,
                };
                utils.computedStyles[key] = cs;
                //---- clean up temp stuff ----
                elem.remove();
                svg.remove();
            }
            return cs;
        }
        utils.getComputedStyleFromClass = getComputedStyleFromClass;
        function getShapeId(element) {
            var id = "";
            var elem = element;
            if (elem.dataItem) {
                id = elem.dataItem.dataId + "," + elem.dataItem.key + ", " + elem.dataItem.shapeId;
            }
            return id;
        }
        utils.getShapeId = getShapeId;
        function toArray(pseudoArray) {
            var elems = [];
            for (var i = 0; i < pseudoArray.length; i++) {
                var elem = pseudoArray[i];
                elems.push(elem);
            }
            return elems;
        }
        utils.toArray = toArray;
        /** find HTML, SVG, or canvas elements that overlap with specificed rcBounds. */
        function getElementsInBounds(container, rcBounds, rcAdjusted) {
            var elems = [];
            var svgDoc = this.getCanvasOrSvgParent(container);
            if (svgDoc && svgDoc.getIntersectionList) {
                //---- very strange: getIntersectionList requires you to create the SVGRect this way ----
                var rc = svgDoc.createSVGRect();
                rc.x = rcBounds.left;
                rc.y = rcBounds.top;
                rc.width = rcBounds.width;
                rc.height = rcBounds.height;
                //---- returns a nodeList, which is not an array ----
                var nodeList = svgDoc.getIntersectionList(rc, null);
                elems = vp.utils.toArray(nodeList);
            }
            else {
                rcBounds = rcAdjusted;
                var kids = vp.dom.children(container);
                var svgIntersectCount = 0;
                for (var k = 0; k < kids.length; k++) {
                    var kid = kids[k];
                    if (kid.tagName != "defs") {
                        var rcLight = vp.dom.getBounds(kid, true);
                        //---- start with simple BOUNDING BOX test ----
                        var intersects = vp.geom.rectIntersectsRect(rcBounds, rcLight);
                        if (intersects) {
                            elems.push(kid);
                            if (vp.utils.isSvgElement(kid)) {
                                svgIntersectCount++;
                            }
                        }
                    }
                }
                //---- now, render to canvas and do test there ----
                //---- we can do more precise testing on SVG shapes, but limit shapes to prevent long waits ----
                if ((svgIntersectCount > 0) && (svgIntersectCount <= 100)) {
                    //---- do a more precise test using inkHitTest --
                    elems = getElementsInkHitTest(rcBounds, elems);
                }
            }
            //---- filter out non-SHAPES ----
            elems = elems.where(function (elem, index) {
                var id = getShapeId(elem);
                return (id != null && id != "");
            });
            //---- remove duplicates (so that 2 shapes for same id don't cancel each other out) ----
            elems = elems.distinct(function (elem, index) {
                return getShapeId(elem);
            });
            return elems;
        }
        utils.getElementsInBounds = getElementsInBounds;
        function getElementsInkHitTest(rcBand, elems) {
            var newElems = [];
            var inkHitTest = null;
            try {
                //---- currently, we select any partial overlap with rcBand and shapes ----
                for (var k = 0; k < elems.length; k++) {
                    var elem = elems[k];
                    var intersects = true; // until proven otherwise
                    if (vp.utils.isSvgElement(elem)) {
                        var tag = elem.tagName;
                        if ((tag != "rect") && (tag != "image") && (tag != "text")) {
                            //---- complex shape passes bounding box test ----
                            //---- we need to draw shape on a temp canvas to see if it overlaps rect ----
                            if (!inkHitTest) {
                                //--- small tweak required to rcBand for inkHit testing (why?) ----
                                var rcInk = vp.geom.rect(rcBand.left, rcBand.top + 4, rcBand.width, rcBand.height);
                                inkHitTest = new vp.internal.inkHitTest(rcInk);
                            }
                            intersects = inkHitTest.doesShapeOverlap(elem);
                        }
                    }
                    if (intersects) {
                        newElems.push(elem);
                    }
                }
            }
            finally {
                if (inkHitTest) {
                    inkHitTest.close();
                }
            }
            return newElems;
        }
        /// return the size of the text in a SPAN element whose class is the specified class.
        //export function measureText(text, spanClass)
        //{
        //    var span = document.createElement("span");
        //    document.body.appendChild(span);
        //    vp.dom.text(span, text);
        //    vp.setClass(span, spanClass);
        //    var sz = { width: vp.dom.width(span), height: vp.dom.height(span) }
        //    document.body.removeChild(span);
        //    return sz;
        //}
        ///// return the size of the text in an SVG element whose class is the specified class.
        //export function measureSvgText(svgNode, text, className)
        //{
        //    var textElem = document.createElementNS('http://www.w3.org/2000/svg', "text");
        //    svgNode.append(textElem);
        //    vp.setClass(textElem, className);
        //    var xx = vp.dom.getBounds(textElem);
        //    var rect = textElem.getBoundingClientRect();
        //    svgNode.remove(textElem);
        //    var sz = { width: rect.width, height: rect.height }
        //    return sz;
        //}
        function cb(thisObj, func) {
            var wrapper = function (thisObj, func) {
                if ((!thisObj) || (!func)) {
                    vp.utils.error("Bad vp.cb() call: both arguments must be non-null");
                }
                this.thisObj = thisObj;
                this.func = func;
                var self = this;
                this.callIt = function () {
                    return self.func.apply(self.thisObj, arguments);
                };
            };
            var wrapFunc = new wrapper(thisObj, func);
            return wrapFunc.callIt;
        }
        utils.cb = cb;
        //export function getMousePosition(e)
        //{
        //    var x: number = 0;
        //    var y: number = 0;
        //    // Handle a non-IE 'touch' event
        //    if ((<string>e.type).startsWith('touch') && (e.changedTouches != undefined) && (e.changedTouches.length > 0))
        //    {
        //        x = e.changedTouches[0].pageX;
        //        y = e.changedTouches[0].pageY;
        //    }
        //    else
        //    {
        //        x = <number> e.pageX;
        //        y = <number> e.pageY;
        //    }
        //    return { x: x, y: y };
        //}
        /** When set to a function, the function is called before an error is reported. */
        utils.onError = null;
        function error(msg, lineNum) {
            var omitThrow = false;
            if (lineNum) {
                msg += " [line: " + lineNum + "]";
            }
            if (vp.utils.onError) {
                omitThrow = vp.utils.onError(msg);
            }
            if (!omitThrow) {
                throw msg;
            }
        }
        utils.error = error;
        function jsonToStr(obj) {
            var value = "";
            if (obj instanceof Int32Array) {
                //---- support for this is marginal, at best, depending on browser. ----
                //---- we convert to a map whose keys are the index ----
                if (utils.isIE) {
                    //---- IE doesn't handle this at all; must do it manually ----
                    var map = {};
                    var ia = obj;
                    for (var i = 0; i < ia.length; i++) {
                        map[i] = ia[i];
                    }
                    value = "Int32Array" + JSON.stringify(map);
                }
                else {
                    value = "Int32Array" + JSON.stringify(obj);
                }
            }
            else {
                value = JSON.stringify(obj);
            }
            return value;
        }
        utils.jsonToStr = jsonToStr;
        function getFileExtension(name) {
            name = name.toLowerCase();
            var ext = "";
            var index = name.lastIndexOf(".");
            if (index > -1) {
                ext = name.substr(index);
            }
            return ext;
        }
        utils.getFileExtension = getFileExtension;
        function jsonFromStr(str) {
            var data = null;
            //---- note: JSON.parse() cannot handle "Int32Array{...}" ----
            if (str.startsWith("Int32Array")) {
                str = str.substr(10); // skip over Int32Array
                var objWithKeys = JSON.parse(str);
                var keys = vp.utils.keys(objWithKeys);
                //---- first pass: get exact length of new Int32Array ----
                var length = 0;
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    //---- watch out for non-numeric keys (other properties on map) ----
                    var index = +key;
                    if (!isNaN(index)) {
                        length++;
                    }
                }
                var ia = vp.utils.int32Array(length);
                //---- second pass: fill the new array ----
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    //---- watch out for non-numeric keys (other properties on map) ----
                    var index = +key;
                    if (!isNaN(index)) {
                        var value = objWithKeys[key];
                        ia[index] = +value;
                    }
                }
                data = ia;
            }
            else {
                data = JSON.parse(str);
            }
            return data;
        }
        utils.jsonFromStr = jsonFromStr;
        function float32Array(length) {
            var vector = null;
            if (typeof Float32Array === "undefined") {
                vector = new Array(length);
            }
            else {
                vector = new Float32Array(length);
            }
            return vector;
        }
        utils.float32Array = float32Array;
        function int32Array(length) {
            var vector = null;
            if (typeof Int32Array === "undefined") {
                vector = new Array(length);
            }
            else {
                vector = new Int32Array(length);
            }
            return vector;
        }
        utils.int32Array = int32Array;
        function toRadians(value) {
            return value * Math.PI / 180;
        }
        utils.toRadians = toRadians;
        function toDegrees(value) {
            return value * 180 / Math.PI;
        }
        utils.toDegrees = toDegrees;
        function toHex2(value) {
            var str = value.toString(16);
            if (str.length == 1) {
                str = "0" + str;
            }
            return str;
        }
        utils.toHex2 = toHex2;
        function makeCtxColorStr(cr3) {
            var red = vp.data.clamp(Math.round(cr3[0]), 0, 255);
            var green = vp.data.clamp(Math.round(cr3[1]), 0, 255);
            var blue = vp.data.clamp(Math.round(cr3[2]), 0, 255);
            //---- use hex format to compare correctly with ctx colors ----
            var str = "#" + this.toHex2(red) + this.toHex2(green) + this.toHex2(blue);
            return str;
        }
        utils.makeCtxColorStr = makeCtxColorStr;
        /// prevents the default event handling from happening.
        function cancelEventDefault(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }
        utils.cancelEventDefault = cancelEventDefault;
        /// prevents the event from bubbling to other controls.
        function cancelEventBubble(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            e.cancelBubble = false;
        }
        utils.cancelEventBubble = cancelEventBubble;
        function argumentsAsArray(args) {
            var array = [];
            for (var a = 0; a < args.length; a++) {
                array.push(args[a]);
            }
            return array;
        }
        utils.argumentsAsArray = argumentsAsArray;
        function setTimer(interval, callback) {
            return setInterval(callback, interval);
        }
        utils.setTimer = setTimer;
        function clearTimer(handle) {
            clearInterval(handle);
        }
        utils.clearTimer = clearTimer;
        function setOneShotTimer(interval, callback) {
            return setTimeout(callback, interval);
        }
        utils.setOneShotTimer = setOneShotTimer;
        function clearOneShotTimer(handle) {
            clearTimeout(handle);
        }
        utils.clearOneShotTimer = clearOneShotTimer;
        function globalEval(js, wantReturn) {
            //---- eval in global context by adding a script element to the <head> ----
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.text = (wantReturn) ? "window._evalResult = " + js : js;
            var head = document.getElementsByTagName("head")[0];
            if (!head) {
                throw "Error - HTML missing head element (required for globalEval)";
            }
            head.appendChild(script);
            head.removeChild(script);
            var win = window;
            var retVal = (wantReturn) ? win._evalResult : undefined;
            return retVal;
        }
        utils.globalEval = globalEval;
        //------------------------------------------------------------------------------------------------
        /// internal - supports "thisWrapper()"
        function wrapper(func, thisObj) {
            this.func = func;
            this.thisObj = thisObj;
            var self = this;
            this.callIt = function (e) {
                self.func.call(self.thisObj, e);
            };
        }
        /// get a list of the key/value parameters for the current page url.
        function getCmdParams(cmd) {
            var params = {};
            if (cmd) {
                var pairs = cmd.split("&");
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    var pp = pair.split("=");
                    if (pp.length > 1) {
                        var key = pp[0].toLowerCase();
                        params[key] = pp[1];
                    }
                    else {
                        params[pair] = "";
                    }
                }
            }
            return params;
        }
        utils.getCmdParams = getCmdParams;
        /// create a instance of the XMLHttpRequest object.
        function createXMLHttpRequest() {
            var req = null;
            if (XMLHttpRequest != null) {
                req = new XMLHttpRequest();
            }
            else {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            return req;
        }
        utils.createXMLHttpRequest = createXMLHttpRequest;
        /// get a list of the key/value parameters for the current page url.
        function getUrlParams() {
            var url = window.location.href;
            var params = {};
            var index = url.indexOf("?");
            if (index == -1) {
                //---- using hash tag to save state? ----
                index = url.indexOf("#");
            }
            if (index > -1) {
                params = getCmdParams(url.substring(index + 1));
            }
            return params;
        }
        utils.getUrlParams = getUrlParams;
        /// returns the directory portion of the current page's URL (excludes the page name)
        function getUrlDirectory() {
            var url = window.location.href;
            var index = url.lastIndexOf("/");
            if (index > -1) {
                url = url.substr(0, index);
            }
            return url;
        }
        utils.getUrlDirectory = getUrlDirectory;
        /// used for floating point comparisons.
        utils.epsilon = .00001;
        /// return true if a <= b (using floating point comparison).
        function floatLeq(a, b, eps) {
            if (eps === void 0) { eps = utils.epsilon; }
            return (b - a) >= -eps;
        }
        utils.floatLeq = floatLeq;
        function floatLess(a, b, eps) {
            if (eps === void 0) { eps = utils.epsilon; }
            return (!floatGeq(a, b, eps));
        }
        utils.floatLess = floatLess;
        /// return true if a >= b (using floating point comparison).
        function floatGeq(a, b, eps) {
            if (eps === void 0) { eps = utils.epsilon; }
            return (a - b) >= -eps;
        }
        utils.floatGeq = floatGeq;
        /// return true if a == b (using floating point comparison).
        function floatEq(a, b, eps) {
            if (eps === void 0) { eps = utils.epsilon; }
            return Math.abs(a - b) <= eps;
        }
        utils.floatEq = floatEq;
        /// return true if a == b (using string or floating point comparison).
        function unitsEq(a, b, eps) {
            if (eps === void 0) { eps = utils.epsilon; }
            var equal = false;
            if (utils.isString(a) && utils.isString(b)) {
                equal = (a == b);
            }
            else {
                equal = floatEq(+a, +b, eps);
            }
            return equal;
        }
        utils.unitsEq = unitsEq;
        /// add "keys" (list of dict properties) for browsers (like IE) that don't yet implement it.
        function keys(obj) {
            var keys = [];
            if (obj.keys) {
                keys = obj.keys;
            }
            else {
                for (var k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
            }
            return keys;
        }
        utils.keys = keys;
        /// return true if object has one or more dictionary keys.
        function hasKey(obj) {
            /// fastest cross-browser test
            var count = 0;
            for (var k in obj) {
                count++;
                break;
            }
            return (count > 0);
        }
        utils.hasKey = hasKey;
        //--- opera doesn't have Object.keys so we use this wrapper ----
        function numberOfKeys(theObject) {
            if (Object.keys)
                return Object.keys(theObject).length;
            var n = 0;
            for (var key in theObject)
                ++n;
            return n;
        }
        utils.numberOfKeys = numberOfKeys;
        /// return the size of the text in a SPAN element whose class is the specified class.
        function measureText(text, spanClass) {
            var span = document.createElement("span");
            document.body.appendChild(span);
            vp.dom.text(span, text);
            vp.dom.setClass(span, spanClass);
            var sz = { width: vp.dom.width(span), height: vp.dom.height(span) };
            document.body.removeChild(span);
            return sz;
        }
        utils.measureText = measureText;
        /// return the size of the text in an SVG element whose class is the specified class.
        function measureSvgText(svgNode, text, className) {
            var textElem = document.createElementNS('http://www.w3.org/2000/svg', "text");
            svgNode.append(textElem);
            vp.dom.setClass(textElem, className);
            var xx = vp.dom.getBounds(textElem);
            var rect = textElem.getBoundingClientRect();
            svgNode.remove(textElem);
            var sz = { width: rect.width, height: rect.height };
            return sz;
        }
        utils.measureSvgText = measureSvgText;
        function routePropCalls(from, to) {
            for (var i = 2; i < arguments.length; i++) {
                var methodName = arguments[i];
                if (vp.utils.isArray(methodName)) {
                    for (var m = 0; m < methodName.length; m++) {
                        var methName = methodName[m];
                        var method = to[methName];
                        from[methName] = makePropRouteCallFunc(from, to, method);
                    }
                }
                else {
                    var method = to[methodName];
                    from[methodName] = makePropRouteCallFunc(from, to, method);
                }
            }
        }
        utils.routePropCalls = routePropCalls;
        function routeFuncCalls(from, to) {
            for (var i = 2; i < arguments.length; i++) {
                var methodName = arguments[i];
                var method = to[methodName];
                from[methodName] = makeFuncRouteCallFunc(from, to, method);
            }
        }
        utils.routeFuncCalls = routeFuncCalls;
        function routePropCallsPost(from, to, postCall) {
            for (var i = 3; i < arguments.length; i++) {
                var methodName = arguments[i];
                var method = to[methodName];
                from[methodName] = makePropRouteCallFunc(from, to, method, postCall);
            }
        }
        utils.routePropCallsPost = routePropCallsPost;
        /// internal (needs to be a separate func due to closure rules.
        function makePropRouteCallFunc(from, to, method, postCall) {
            return function () {
                var result = method.apply(to, arguments);
                //---- if this is not a getter, we want to return "from" as then chaining object ----
                if (arguments.length > 0) {
                    result = from;
                }
                if (vp.utils.isDefined(postCall)) {
                    postCall.apply(from);
                }
                return result;
            };
        }
        /// internal (needs to be a separate func due to closure rules.
        function makeFuncRouteCallFunc(from, to, method, postCall) {
            return function () {
                var result = method.apply(to, arguments);
                if (vp.utils.isDefined(postCall)) {
                    postCall.apply(from);
                }
                return result;
            };
        }
        function generateFunc(args, body, maker) {
            var exp = "function foo(" + args + ")\n" + body + "";
            var func = null;
            if (maker == "eval") {
                func = eval("(" + exp + ")");
            }
            else if (maker == "script") {
                //---- inject a script element ----
                var script = document.createElement("script");
                document.body.appendChild(script);
                script.text = exp;
                func = window["foo"];
            }
            else if (maker == "Function") {
                func = Function(args, body);
            }
            return func;
        }
        utils.generateFunc = generateFunc;
        /* Makes a deep copy of the object.  TODO: replace with faster code. */
        function deepCopy(objectToCopy) {
            var copy = objectToCopy ? JSON.parse(JSON.stringify(objectToCopy)) : null;
            return (copy);
        }
        utils.deepCopy = deepCopy;
        function copyArray(aray) {
            var newArray = null;
            if (aray) {
                newArray = aray.slice(0);
            }
            return newArray;
        }
        utils.copyArray = copyArray;
        function copyMap(map, copyArrays) {
            var newMap = copyMapIntoObj(map, {}, copyArrays);
            return newMap;
        }
        utils.copyMap = copyMap;
        function copyMapIntoObj(from, to, copyArrays) {
            if (from) {
                var keys = vp.utils.keys(from);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = from[key];
                    if (vp.utils.isArray(value) && copyArrays) {
                        value = copyArray(value);
                    }
                    to[key] = value;
                }
            }
            return to;
        }
        utils.copyMapIntoObj = copyMapIntoObj;
        function getCanvasOrSvgParent(elem) {
            var parentElem = elem;
            if (parentElem.rootContainer) {
                //---- canvas element ----
                parentElem = parentElem.rootContainer.canvas;
            }
            else {
                //---- SVG ----
                while (parentElem && parentElem.tagName != "svg") {
                    //---- get parent of group ----
                    parentElem = vp.dom.parent(parentElem);
                }
            }
            return parentElem;
        }
        utils.getCanvasOrSvgParent = getCanvasOrSvgParent;
        /** adjust the x/y offset so that it has a .5/.5 fractional part. */
        function getRootCrispTranslate(container, x, y) {
            var parentElem = this.getCanvasOrSvgParent(container);
            var rc = parentElem.getBoundingClientRect();
            //---- goal is to move this ROOT GROUP to a x.5, y.5 number pixel boundary, relative to our html document ----
            var xSum = rc.left + x;
            var xFraction = xSum - Math.floor(xSum);
            var xOffset = .5 - xFraction;
            var ySum = rc.top + y;
            var yFraction = ySum - Math.floor(ySum);
            var yOffset = .5 - yFraction;
            x += xOffset;
            y += yOffset;
            return { x: x, y: y };
        }
        utils.getRootCrispTranslate = getRootCrispTranslate;
        function lineTypeToDashArray(lineType) {
            ///
            /// TODO: merge with definition of lineType in vuePlotTypes.ts 
            ///
            var lt = (vp.utils.isString(lineType)) ? lineType.toLowerCase() : lineType;
            var value = "";
            if ((lt === "blank") || (lt === 0)) {
                value = "0, 10";
            }
            else if ((lt === "solid") || (lt === 1)) {
                value = "";
            }
            else if ((lt === "dashed") || (lt === 2)) {
                value = "4, 4";
            }
            else if ((lt === "dotted") || (lt === 3)) {
                value = "1, 3";
            }
            else if ((lt === "dotdash") || (lt === 4)) {
                value = "1, 3, 4, 4";
            }
            else if ((lt === "longdash") || (lt === 5)) {
                value = "7, 3";
            }
            else if ((lt === "twodash") || (lt === 6)) {
                value = "2, 2, 6, 2";
            }
            else {
                //---- leave alone (let call specify on/off pattern in a string) ----
                value = lt;
            }
            return value;
        }
        utils.lineTypeToDashArray = lineTypeToDashArray;
        (function (LineType) {
            LineType[LineType["blank"] = 0] = "blank";
            LineType[LineType["solid"] = 1] = "solid";
            LineType[LineType["dashed"] = 2] = "dashed";
            LineType[LineType["dotted"] = 3] = "dotted";
            LineType[LineType["dotDash"] = 4] = "dotDash";
            LineType[LineType["longDash"] = 5] = "longDash";
            LineType[LineType["twoDash"] = 6] = "twoDash";
        })(utils.LineType || (utils.LineType = {}));
        var LineType = utils.LineType;
    })(utils = vp.utils || (vp.utils = {}));
})(vp || (vp = {}));
//---- this file, "_references.ts", must reside in directly in the vueplotCore\VuePlotCore project directory, so ----
//---- that it can correct control the *.ts file processing order, which then controls the order of the classes generated ----
//---- to the vuePlotCore.js file. ----
//---- helpers ----
///<reference path="helpers/array.ts" />
///<reference path="helpers/hsl.ts" />
///<reference path="helpers/math.ts" />
///<reference path="helpers/scanner.ts" />
///<reference path="helpers/string.ts" />
//---- animations ----
///<reference path="animation/animation.ts" />
///<reference path="animation/animationContainer.ts" />
///<reference path="animation/colorAnimation.ts" />
///<reference path="animation/eases.ts" />
///<reference path="animation/dataAnimMgr.ts" />
///<reference path="animation/effects.ts" />
///<reference path="animation/numberAnimation.ts" />
///<reference path="animation/pointsAnimation.ts" />
///<reference path="animation/transformAnimation.ts" />
///<reference path="animation/transition.ts" />
//---- chartFrame ----
///<reference path="chartFrame/axisBase.ts" />
///<reference path="chartFrame/axisData.ts" />
///<reference path="chartFrame/bottomAxis.ts" />
///<reference path="chartFrame/chartFrameEx.ts" />
///<reference path="chartFrame/gridLines.ts" />
///<reference path="chartFrame/leftAxis.ts" />
///<reference path="chartFrame/rightAxis.ts" />
///<reference path="chartFrame/topAxis.ts" />
//---- canvasElements ----
///<reference path="canvas/canvasElement.ts" />
///<reference path="canvas/canvasCircleElement.ts" />
///<reference path="canvas/canvasContainerElement.ts" />
///<reference path="canvas/canvasEllipseElement.ts" />
///<reference path="canvas/canvasGroupElement.ts" />
///<reference path="canvas/canvasImageElement.ts" />
///<reference path="canvas/canvasLineElement.ts" />
///<reference path="canvas/canvasPathElement.ts" />
///<reference path="canvas/canvasPolygonElement.ts" />
///<reference path="canvas/canvasRectElement.ts" />
///<reference path="canvas/canvasTextElement.ts" />
//---- data ----
///<reference path="data/aggAvg.ts" />
///<reference path="data/aggCount.ts" />
///<reference path="data/aggMax.ts" />
///<reference path="data/aggMedian.ts" />
///<reference path="data/aggMin.ts" />
///<reference path="data/aggMode.ts" />
///<reference path="data/aggStdDev.ts" />
///<reference path="data/aggSum.ts" />
///<reference path="data/aggVariance.ts" />
///<reference path="data/dataUtils.ts" />
//---- dom ----
//---- these must be first in this section ----
///<reference path="dom/selectedSet.ts" />
///<reference path="dom/singleWrapper.ts" />
///<reference path="dom/basicSelect.ts" />
///<reference path="dom/canvasSelectedSet.ts" />
///<reference path="dom/canvasUtils.ts" />
///<reference path="dom/colors.ts" />
///<reference path="dom/events.ts" />
///<reference path="dom/inkHitTest.ts" />
///<reference path="dom/insertAppend.ts" />
///<reference path="dom/isFuncs.ts" />
///<reference path="dom/dom.ts" />
///<reference path="dom/styleSheet.ts" />
//---- formatters ----
/// <reference path="formatters/formatters.ts" />
/// <reference path="formatters/excelFormatter.ts" />
//---- geom ----
/// <reference path="geom/basicTypes.ts" />
/// <reference path="geom/matrix4.ts" />
/// <reference path="geom/point2.ts" />
/// <reference path="geom/point3.ts" />
/// <reference path="geom/rect.ts" />
/// <reference path="geom/vector2.ts" />
/// <reference path="geom/vector3.ts" />
/// <reference path="geom/vector4.ts" />
//---- marks ----
/// <reference path="marks/markBase.ts" />
/// <reference path="marks/circleMark.ts" />
/// <reference path="marks/ellipseMark.ts" />
/// <reference path="marks/drawingParams.ts" />
/// <reference path="marks/groupMark.ts" />
/// <reference path="marks/glBuilder.ts" />
/// <reference path="marks/imageMark.ts" />
/// <reference path="marks/jsParser.ts" />
/// <reference path="marks/lineMark.ts" />
/// <reference path="marks/pathMark.ts" />
/// <reference path="marks/pointMark.ts" />
/// <reference path="marks/rect2dMark.ts" />
/// <reference path="marks/rectangleMark.ts" />
/// <reference path="marks/textMark.ts" />
/// <reference path="marks/triangleMark.ts" />
//---- layouts ----
/// <reference path="layouts/quadTree.ts" />
/// <reference path="layouts/dragHelper.ts" />
/// <reference path="layouts/forceLayout.ts" />
//---- paths ----
/// <reference path="paths/buildPie.ts" />
/// <reference path="paths/curveFitting.ts" />
/// <reference path="paths/paths.ts" />
/// <reference path="paths/shapeData.ts" />
//---- plotBox ----
/// <reference path="plotBox/axisOptions.ts" />
/// <reference path="plotBox/plotBox.ts" />
/// <reference path="plotBox/transform3d.ts" />
//---- scales ----
/// <reference path="scales/baseScale.ts" />
/// <reference path="scales/categoryScale.ts" />
/// <reference path="scales/dateScale.ts" />
/// <reference path="scales/linearScale.ts" />
/// <reference path="scales/logScale.ts" />
/// <reference path="scales/niceNumbers.ts" />
//---- utils ----
///<reference path="utils/msgMgr.ts" />
///<reference path="utils/traceMgr.ts" />
///<reference path="utils/utils.ts" />
///-----------------------------------------------------------------------------------------------------------------
/// aggNone.ts.  Copyright (c) 2014 Microsoft Corporation.
///   - part of the vuePlotCore library: count() aggregate class for groupBy/aggregation.
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var data;
    (function (data) {
        var aggNone = (function () {
            function aggNone() {
            }
            aggNone.prototype.init = function () {
            };
            aggNone.prototype.process = function (value) {
            };
            aggNone.prototype.getResult = function () {
                return null;
            };
            return aggNone;
        })();
        data.aggNone = aggNone;
    })(data = vp.data || (vp.data = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// quternion.ts.  Copyright (c) 2014 Microsoft Corporation.
///            Part of the vuePlotCore library - a quaternion helps you correctly accumulate successive rotations along various axes.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var geom;
    (function (geom) {
        var quaternion = (function () {
            function quaternion(x, y, z, w) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 1;
                if (x != undefined) {
                    this.x = x;
                }
                if (y != undefined) {
                    this.y = y;
                }
                if (z != undefined) {
                    this.z = z;
                }
                if (w != undefined) {
                    this.w = w;
                }
            }
            quaternion.fromAngleAxis = function (theta, axis) {
                //---- first, normalize the incoming axis vector ----
                var v3 = new geom.vector3(axis[0], axis[1], axis[2]);
                v3 = geom.vector3.normal(v3);
                var ax = v3.x;
                var ay = v3.y;
                var az = v3.z;
                var sin = Math.sin(theta / 2);
                var quat = new quaternion(ax * sin, ay * sin, az * sin, Math.cos(theta / 2));
                return quat;
            };
            quaternion.rotateAngleAxis = function (quat, theta, axis) {
                var quat2 = quaternion.fromAngleAxis(theta, axis);
                var result = quaternion.multiply(quat, quat2);
                return result;
            };
            quaternion.multiply = function (a, b) {
                var x = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
                var y = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
                var z = a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x;
                var w = a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w;
                var quat = new quaternion(x, y, z, w);
                return quat;
            };
            quaternion.toMatrix = function (q) {
                var qx = q.x;
                var qy = q.y;
                var qz = q.z;
                var qw = q.w;
                var mat = geom.matrix4.fromFloats(1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qw * qz), 2 * (qx * qz + qw * qy), 0, 2 * (qx * qy + qw * qz), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qw * qx), 0, 2 * (qx * qz - qw * qy), 2 * (qy * qz + qw * qx), 1 - 2 * (qx * qx + qy * qy), 0, 0, 0, 0, 1);
                return mat;
            };
            return quaternion;
        })();
        geom.quaternion = quaternion;
    })(geom = vp.geom || (vp.geom = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// colorPalettes.ts.  Copyright (c) 2014 Microsoft Corporation.
///     - a set of helper functions for creating color palettes (sets of colors).
///-----------------------------------------------------------------------------------------------------------------
/// <summary>
/// Predefined and custom color palettes.  A color palette is an array of colors that can be
/// used to with an Interpolator or a Scale to sample as discrete or continous colors.
/// 
/// note: below functions are continuous, unless marked as "discrete".
///
/// Predefined:
///     - blueRed              
///     - redGreen              
///     - surface
///     - grays(n)
///     - reds(n)
///     - greens(n)
///     - blues(n)
///     - rainbow(n)            (discrete)
///     - rainbowPairs(n)       (discrete)
///     
/// Custom:
///     - darkLight(cr, ...)        
///     - darkLightDark(cr, cr2)
///     - lightDark(cr, ...)        
///     - hueSteps(cr, n)       (discrete)
///     - analogs(cr)           (discrete)
///     - shades(cr, n)
///     
/// </summary>
///-----------------------------------------------------------------------------------------------------------------
"use strict";
var vp;
(function (vp) {
    var colorPalettes;
    (function (colorPalettes) {
        /// <summary>
        /// Predefined color scheme for displaying negative and positive continous values:
        ///     DarkBlue, DarkRed
        /// </summary>
        function blueRed() {
            return [vp.color.colors.darkblue, vp.color.colors.darkred];
        }
        colorPalettes.blueRed = blueRed;
        /// <summary>
        /// Predefined color scheme for displaying negative and positive continous values:
        ///     DarkRed, LightRed, LightGreen, DarkGreen
        /// </summary>
        function redGreen() {
            return [vp.color.colors.darkred, vp.color.rgbFromHsl(0, 1, .8), vp.color.colors.lightgreen, vp.color.colors.darkgreen];
        }
        colorPalettes.redGreen = redGreen;
        /// <summary>
        /// Predefined color scheme for surface colors:
        ///     DarkBlue, Aqua, Yellow, DarkRed
        /// </summary>
        /// <returns></returns>
        function surface() {
            var palette = ["rgb(0, 0, 143)", "rgb(0, 0, 255)", "rgb(0, 255, 255)", "rgb(255, 255, 0)", "rgb(255, 0, 0)", "rgb(128, 0, 0)"];
            var stops = [0, 1 / 8, 3 / 8, 5 / 8, 7 / 8, 1];
            palette.stops = stops;
            return palette;
        }
        colorPalettes.surface = surface;
        /// <summary>
        /// Predefined color scheme for shades of gray
        /// </summary>
        /// <returns></returns>
        function grays(steps, startPercent, endPercent) {
            startPercent = startPercent || 1;
            endPercent = endPercent || 0;
            return vp.colorPalettes.shades(vp.color.colors.gray, steps, startPercent, endPercent);
        }
        colorPalettes.grays = grays;
        /// <summary>
        /// Predefined color scheme for shades of red
        /// </summary>
        /// <returns></returns>
        function reds(steps) {
            return vp.colorPalettes.shades(vp.color.colors.red, steps);
        }
        colorPalettes.reds = reds;
        /// <summary>
        /// Predefined color scheme for shades of green
        /// </summary>
        /// <returns></returns>
        function greens(steps) {
            return vp.colorPalettes.shades(vp.color.colors.green, steps);
        }
        colorPalettes.greens = greens;
        /// <summary>
        /// Predefined color scheme using the specified number of hues spaced
        /// around the color wheel.
        /// </summary>
        /// <returns></returns>
        function rainbow(steps) {
            var values = [];
            var stepSize = 1 / steps;
            for (var i = 0; i < steps; i++) {
                var hue = i * stepSize;
                values[i] = vp.color.rgbFromHsl(hue, 1, .5);
            }
            return values;
        }
        colorPalettes.rainbow = rainbow;
        /// <summary>
        /// Predefined color scheme using the specified number of hues spaced
        /// around the color wheel.  Each hue generates 2 colors: light and dark versions
        /// of the hue.
        /// </summary>
        /// <returns></returns>
        function rainbowPairs(steps) {
            var values = [];
            var stepSize = 1 / steps;
            for (var i = 0; i < steps; i++) {
                var hue = i * stepSize;
                values.push(vp.color.rgbFromHsl(hue, 1, .3));
                values.push(vp.color.rgbFromHsl(hue, 1, .7));
            }
            return values;
        }
        colorPalettes.rainbowPairs = rainbowPairs;
        function htmlColors(count) {
            var keys = vp.utils.keys(vp.color.colors);
            var values = keys.slice(0, count);
            return values;
        }
        colorPalettes.htmlColors = htmlColors;
        /// <summary>
        /// Generates a custom color scheme, using a dark and light version of each
        /// specifed color.
        /// </summary>
        /// <returns></returns>
        function darkLight(color1) {
            var values = [];
            for (var i = 0; i < arguments.length; i++) {
                var hsl = vp.color.hslFromRgb(arguments[i]);
                values.push(vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .30));
                values.push(vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .70));
            }
            return values;
        }
        colorPalettes.darkLight = darkLight;
        /// <summary>
        /// Generates a custom color scheme, using a dark and light version of each
        /// specifed color.
        /// </summary>
        /// <returns></returns>
        function darkLightDark(cr, cr2) {
            var hsl = vp.color.hslFromRgb(cr);
            var hsl2 = vp.color.hslFromRgb(cr2);
            var colors = [
                vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .20),
                vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .80),
                vp.color.rgbFromHsl(hsl2.hue(), hsl2.saturation(), .80),
                vp.color.rgbFromHsl(hsl2.hue(), hsl2.saturation(), .20)
            ];
            return colors;
        }
        colorPalettes.darkLightDark = darkLightDark;
        /// <summary>
        /// Generates a custom color scheme, using a light and dark version of each
        /// specifed color.
        /// </summary>
        /// <returns></returns>
        function lightDark(color1) {
            var values = [];
            for (var i = 0; i < arguments.length; i++) {
                var hsl = vp.color.hslFromRgb(arguments[i]);
                values.push(vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .70));
                values.push(vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), .30));
            }
            return values;
        }
        colorPalettes.lightDark = lightDark;
        /// <summary>
        /// Returns a set of colors whose hues are equally spaces in the color wheel.
        /// </summary>
        /// <param name="color"></param>
        /// <param name="count"></param>
        /// <returns></returns>
        function hueSteps(color, steps) {
            var colors = [];
            var hsl = vp.color.hslFromRgb(color);
            var hue = hsl.hue();
            var step = 1 / steps;
            for (var i = 0; i < steps; i++) {
                var hx = vp.color.normalizeHue(hue + i * step);
                colors[i] = vp.color.rgbFromHsl(hx, hsl.saturation(), hsl.lightness());
            }
            return colors;
        }
        colorPalettes.hueSteps = hueSteps;
        /// <summary>
        /// Returns the set of 4 analog colors, based on the specified color.
        /// </summary>
        /// <param name="color"></param>
        /// <param name="count"></param>
        /// <returns></returns>
        function analogs(color) {
            var colors = [];
            var hsl = vp.color.hslFromRgb(color);
            var hue = hsl.hue();
            var step = 1 / 9;
            colors[0] = color;
            var h1 = vp.color.normalizeHue(hue + step);
            var h2 = vp.color.normalizeHue(hue + .5);
            var h3 = vp.color.normalizeHue(hue + .5 + step);
            colors[1] = vp.color.rgbFromHsl(h1, hsl.saturation(), hsl.lightness());
            colors[2] = vp.color.rgbFromHsl(h2, hsl.saturation(), hsl.lightness());
            colors[3] = vp.color.rgbFromHsl(h3, hsl.saturation(), hsl.lightness());
            return colors;
        }
        colorPalettes.analogs = analogs;
        /// <summary>
        /// Returns the specified number of shades of a color.
        /// </summary>
        /// <param name="color"></param>
        /// <param name="count"></param>
        /// <returns></returns>
        function shades(color, count, startPercent, endPercent) {
            startPercent = (startPercent === undefined) ? .98 : startPercent;
            endPercent = (endPercent === undefined) ? .09 : endPercent;
            if (count < 1) {
                vp.utils.error("Count must be at least 1");
            }
            var colors = [];
            if (count == 1) {
                colors.push(color);
            }
            else {
                var hsl = vp.color.hslFromRgb(color);
                var step = (endPercent - startPercent) / (count - 1);
                var index = 0;
                if (step >= 0) {
                    for (var percent = startPercent; vp.utils.floatLeq(percent, endPercent); percent += step) {
                        colors[index++] = vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), percent);
                    }
                }
                else {
                    for (var percent = startPercent; vp.utils.floatGeq(percent, endPercent); percent += step) {
                        colors[index++] = vp.color.rgbFromHsl(hsl.hue(), hsl.saturation(), percent);
                    }
                }
            }
            return colors;
        }
        colorPalettes.shades = shades;
    })(colorPalettes = vp.colorPalettes || (vp.colorPalettes = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// highBiasScale.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        /** Transforms data by applying a normalized exponential function; has the effect of "openening up" the data at the high end. */
        var highBiasScaleClass = (function (_super) {
            __extends(highBiasScaleClass, _super);
            function highBiasScaleClass() {
                _super.call(this);
                this.exp4m1 = Math.exp(4.0) - 1;
                //vp.utils.trace("ctr", "highBiasScale");
                this.ctr = "vp.scales.highBiasScaleClass";
                this.scaleName = "highBias";
                this._scaleType = scales.ScaleType.highBias;
            }
            highBiasScaleClass.prototype.domain = function (min, max) {
                if (arguments.length == 0) {
                    return [this._domainMin, this._domainMax];
                }
                this.domainMin(min);
                this.domainMax(max);
                return this;
            };
            highBiasScaleClass.prototype.range = function (min, max) {
                if (arguments.length == 0) {
                    if (arguments.length == 0) {
                        return this._palette;
                    }
                }
                this.palette([min, max]);
                return this;
            };
            highBiasScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            highBiasScaleClass.prototype.calcPercent = function (value) {
                var t = (value - this._domainMin) / this._domainDelta;
                //---- to get predictable exp() results, we first scale all data to the same range ----
                //---- scale value to: [0,4.0] and take EXP ----
                value = Math.exp(t * 4.0); // result in range 1-exp(4.0)
                t = vp.data.clamp((value - 1) / this.exp4m1, 0, 1);
                if (this._isRangeClipping) {
                    t = this.clip(t, 0, 1);
                }
                return t;
            };
            return highBiasScaleClass;
        })(scales.baseScale);
        scales.highBiasScaleClass = highBiasScaleClass;
        function createHighBias() {
            return new highBiasScaleClass();
        }
        scales.createHighBias = createHighBias;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// lowBiasScale.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        /** Transforms data by applying a normalized log; has the effect of "openening up" the data at the low end. */
        var lowBiasScaleClass = (function (_super) {
            __extends(lowBiasScaleClass, _super);
            function lowBiasScaleClass() {
                _super.call(this);
                this.log25 = Math.log(25);
                //vp.utils.trace("ctr", "lowBiasScale");
                this.ctr = "vp.scales.lowBiasScaleClass";
                this.scaleName = "lowBias";
                this._scaleType = scales.ScaleType.lowBias;
            }
            lowBiasScaleClass.prototype.domain = function (min, max) {
                if (arguments.length == 0) {
                    return [this._domainMin, this._domainMax];
                }
                this.domainMin(min);
                this.domainMax(max);
                return this;
            };
            lowBiasScaleClass.prototype.range = function (min, max) {
                if (arguments.length == 0) {
                    if (arguments.length == 0) {
                        return this._palette;
                    }
                }
                this.palette([min, max]);
                return this;
            };
            lowBiasScaleClass.prototype.map = function (value) {
                return this.scale(value);
            };
            lowBiasScaleClass.prototype.calcPercent = function (value) {
                var t = (value - this._domainMin) / this._domainDelta;
                //---- to get predictable log() results, we first scale all data to the same range ----
                //---- scale value to: [1,25] and take LOG() ----
                value = Math.log(t * 24 + 1); // result in range 0-log25
                t = vp.data.clamp(value / this.log25, 0, 1);
                if (this._isRangeClipping) {
                    t = this.clip(t, 0, 1);
                }
                return t;
            };
            return lowBiasScaleClass;
        })(scales.baseScale);
        scales.lowBiasScaleClass = lowBiasScaleClass;
        function createLowBias() {
            return new lowBiasScaleClass();
        }
        scales.createLowBias = createLowBias;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// dateHelper.ts.  Copyright (c) 2014 Microsoft Corporation.
///     Part of the vuePlotCore library - helper class for scaling and formatting date/time values.
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var dateHelper;
    (function (dateHelper) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        function addIntervalCore(date, units, unitFactor) {
            if (units == TimeUnits.years) {
                //dt = dt.AddYears(unitFactor);
                date.setFullYear(date.getFullYear() + unitFactor);
            }
            else if (units == TimeUnits.quarters) {
                //dt = dt.AddMonths(3 * unitFactor);
                date.setMonth(date.getMonth() + 3 * unitFactor);
            }
            else if (units == TimeUnits.months) {
                //dt = dt.AddMonths(unitFactor);
                date.setMonth(date.getMonth() + unitFactor);
            }
            else if (units == TimeUnits.days) {
                //dt = dt.AddDays(unitFactor);
                date.setDate(date.getDate() + unitFactor);
            }
            else if (units == TimeUnits.hours) {
                //dt = dt.AddHours(unitFactor);
                date.setHours(date.getHours() + unitFactor);
            }
            else if (units == TimeUnits.minutes) {
                //dt = dt.AddMinutes(unitFactor);
                date.setMinutes(date.getMinutes() + unitFactor);
            }
            else if (units == TimeUnits.seconds) {
                //dt = dt.AddSeconds(unitFactor);
                date.setSeconds(date.getSeconds() + unitFactor);
            }
            else {
                //dt = dt.AddMilliseconds(unitFactor);
                date.setMilliseconds(date.getMilliseconds() + unitFactor);
            }
        }
        function findNiceFactor(value, targetIntervals, niceNums) {
            var bestNice = undefined;
            var bestTargetDist = undefined;
            //---- try each nice number ----
            for (var i = 0; i < niceNums.length; i++) {
                var nice = niceNums[i];
                var intervals = Math.ceil(value / nice);
                var dist = Math.abs(targetIntervals - intervals);
                if (i == 0 || dist < bestTargetDist) {
                    bestTargetDist = dist;
                    bestNice = nice;
                }
            }
            return bestNice;
        }
        function getDateScaleValues(minValue, maxValue, targetIntervals) {
            if (targetIntervals === void 0) { targetIntervals = 7; }
            //---- javaScript doesn't support intervals, so we need to do everything on the 2 dates ----
            var ts = maxValue - minValue;
            //var msPerDay = 86400000;
            //var msPerYear = 365 * msPerDay;
            var units = TimeUnits.years;
            var unitFactor = 1;
            var formatString = "yyyy";
            var millisecs = ts;
            var seconds = millisecs / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var months = days / 30; // approx
            var years = days / 365.25; // approx
            if (years > 3) {
                units = TimeUnits.years;
                unitFactor = findNiceFactor(years, targetIntervals, [500, 250, 100, 50, 25, 10, 1]);
                formatString = "yyyy"; // e.g., "2014"
            }
            else if (years >= 1) {
                units = TimeUnits.quarters;
                unitFactor = 1;
                formatString = "Qq-yy"; // e.g, "Q2-14" (custom to VuePlot; not supported by Excel)
            }
            else if (months >= 4) {
                units = TimeUnits.months;
                unitFactor = 1;
                formatString = "mmm"; // e.g., "Apr"
            }
            else if (days >= 2) {
                units = TimeUnits.days;
                unitFactor = findNiceFactor(days, targetIntervals, [10, 7, 5, 1]);
                formatString = "m/d/yyyy"; // e.g., "10/10/2014"
            }
            else if (hours >= 4) {
                units = TimeUnits.hours;
                unitFactor = findNiceFactor(hours, targetIntervals, [12, 6, 3, 1]);
                formatString = "h AM/PM"; // e.g., "3 PM"
            }
            else if (minutes >= 4) {
                units = TimeUnits.minutes;
                unitFactor = findNiceFactor(minutes, targetIntervals, [30, 15, 10, 5, 1]);
                formatString = "h:mm AM/PM"; // e.g., "3:15 AM"
            }
            else if (seconds >= 4) {
                units = TimeUnits.seconds;
                unitFactor = findNiceFactor(seconds, targetIntervals, [30, 15, 10, 5, 1]);
                formatString = "h:mm:ss AM/PM"; // e.g., "3:15:03 PM"
            }
            else {
                units = TimeUnits.milliSeconds;
                unitFactor = findNiceFactor(millisecs, targetIntervals, [500, 250, 100, 50, 25, 10, 1]);
                formatString = "h:mm:ss.0 AM/PM"; // e.g., "3:15:03.341 AM"
            }
            var dt = new Date(minValue);
            dt = adjustDate(dt, units, unitFactor, -1);
            var dtMax = new Date(maxValue);
            dtMax = adjustDate(dtMax, units, unitFactor, 1);
            var steps = [];
            while (dt <= dtMax) {
                //---- must use .valueOf; otherwise would be same object by reference ----
                steps.push(dt.valueOf());
                addIntervalCore(dt, units, unitFactor);
            }
            return { units: units, unitFactor: unitFactor, steps: steps, formatString: formatString };
        }
        dateHelper.getDateScaleValues = getDateScaleValues;
        //---- adjusts the date up or down, so it is on an even time/date boundary ----
        function adjustDate(dt, units, unitFactor, dir) {
            if (dir > 0) {
                addIntervalCore(dt, units, unitFactor);
            }
            //---- take next lower unit*factor value ----
            if (units == TimeUnits.years) {
                var years = dt.getFullYear();
                years = unitFactor * Math.floor(years / unitFactor);
                dt = new Date(years, 0);
            }
            else if (units == TimeUnits.quarters) {
                var months = dt.getMonth();
                var qtr = months % 3;
                var newQtr = unitFactor * Math.floor(qtr / unitFactor);
                var newMonth = 3 * newQtr;
                dt = new Date(dt.getFullYear(), newMonth);
            }
            else if (units == TimeUnits.months) {
                var months = dt.getMonth();
                months = unitFactor * Math.floor(months / unitFactor);
                dt = new Date(dt.getFullYear(), months);
            }
            else if (units == TimeUnits.days) {
                var days = dt.getDate();
                days = unitFactor * Math.floor(days / unitFactor);
                dt.setDate(days);
                dt.setHours(0, 0, 0, 0); // zero out time
            }
            else if (units == TimeUnits.hours) {
                var hours = dt.getHours();
                hours = unitFactor * Math.floor(hours / unitFactor);
                dt.setHours(hours, 0, 0, 0);
            }
            else if (units == TimeUnits.minutes) {
                var minutes = dt.getMinutes();
                minutes = unitFactor * Math.floor(minutes / unitFactor);
                dt.setMinutes(minutes, 0, 0);
            }
            else if (units == TimeUnits.seconds) {
                var seconds = dt.getSeconds();
                seconds = unitFactor * Math.floor(seconds / unitFactor);
                dt.setSeconds(seconds, 0);
            }
            else if (units == TimeUnits.milliSeconds) {
                var ms = dt.getMilliseconds();
                ms = unitFactor * Math.floor(ms / unitFactor);
                dt.setMilliseconds(ms);
            }
            return dt;
        }
        (function (TimeUnits) {
            TimeUnits[TimeUnits["years"] = 0] = "years";
            TimeUnits[TimeUnits["quarters"] = 1] = "quarters";
            TimeUnits[TimeUnits["months"] = 2] = "months";
            TimeUnits[TimeUnits["days"] = 3] = "days";
            TimeUnits[TimeUnits["hours"] = 4] = "hours";
            TimeUnits[TimeUnits["minutes"] = 5] = "minutes";
            TimeUnits[TimeUnits["seconds"] = 6] = "seconds";
            TimeUnits[TimeUnits["milliSeconds"] = 7] = "milliSeconds";
        })(dateHelper.TimeUnits || (dateHelper.TimeUnits = {}));
        var TimeUnits = dateHelper.TimeUnits;
    })(dateHelper = vp.dateHelper || (vp.dateHelper = {}));
})(vp || (vp = {}));
var vp;
(function (vp) {
    var unitTests;
    (function (unitTests) {
        function test(dtMin, dtMax, desc) {
            var result = vp.dateHelper.getDateScaleValues(dtMin.valueOf(), dtMax.valueOf(), 7);
            var formatter = vp.formatters.createExcelFormatter(result.formatString, "date");
            vp.utils.debug("  getDateScaleValues: " + formatter(dtMin) + " - " + formatter(dtMax) + " (" + desc + ")");
            for (var i = 0; i < result.steps.length; i++) {
                var step = result.steps[i];
                var str = formatter(step);
                vp.utils.debug("    " + str);
            }
        }
        //---- add "export" to include this test ----
        function testDateHelper() {
            vp.utils.debug("running: testArrayFuncs");
            //---- test code for getDateScaleValues() ----
            //test(new Date("10/1/2014 10:12"), new Date("10/1/2014 10:57"), "45 mins");
            //test(new Date("10/1/2014 10:12"), new Date("10/1/2014 11:12"), "1 hour");
            //test(new Date("10/1/2014 10:12"), new Date("10/1/2014 11:27"), "1 hour, 15 mins");
            //test(new Date("10/1/2014 10:12"), new Date("10/2/2014 9:12"), "23 hours");
            //test(new Date("10/1/2014 10:12"), new Date("10/2/2014 11:12"), "25 hours");
            //test(new Date("10/1/2014 10:12"), new Date("10/5/2014 15:12"), "4+ days");
            //test(new Date("10/1/2014 10:12"), new Date("10/13/2014 15:12"), "12+ days");
            //test(new Date("10/1/2014 10:12"), new Date("10/19/2014 15:12"), "18 days");
            //test(new Date("10/1/2014 10:12"), new Date("10/28/2014 15:12"), "27 days");
            //test(new Date("2/1/2014 10:12"), new Date("9/28/2014 15:12"), "7+  months");
            test(new Date("2/1/2013 10:12"), new Date("5/3/2014 15:12"), "15+  months");
        }
    })(unitTests = vp.unitTests || (vp.unitTests = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// niceNumbersAlt.ts.  Copyright (c) 2012 Microsoft Corporation.
///    - part of the vuePlot library
///    - alternate method of calculating "nice number" min/max/interval for scales.
///
///    - adapted from: http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var scales;
    (function (scales) {
        /** settings for an attribute (value, scaling, and legend data). */
        var niceNumbersAlt = (function () {
            function niceNumbersAlt() {
            }
            niceNumbersAlt.niceNum = function (range, round) {
                var exponent = Math.floor(Math.log10(range));
                var mantissa = range / Math.pow(10, exponent);
                var niceMantissa = 10;
                if (round) {
                    if (mantissa < 1.5) {
                        niceMantissa = 1;
                    }
                    else if (mantissa < 3) {
                        niceMantissa = 2;
                    }
                    else if (mantissa < 7) {
                        niceMantissa = 5;
                    }
                }
                else {
                    if (mantissa <= 1) {
                        niceMantissa = 1;
                    }
                    else if (mantissa <= 2) {
                        niceMantissa = 2;
                    }
                    else if (mantissa <= 5) {
                        niceMantissa = 5;
                    }
                }
                var niceRange = niceMantissa * Math.pow(10, exponent);
                return niceRange;
            };
            niceNumbersAlt.calculate = function (min, max, steps) {
                var matchSteps = (steps !== undefined);
                if (!matchSteps) {
                    steps = 7; // must have default for calculations to work
                }
                if (steps < 1) {
                    steps = 2;
                }
                var range = max - min; // this.niceNum(max - min, false);
                var interval = this.niceNum(range / steps, true);
                var niceMin = Math.floor(min / interval) * interval;
                var niceMax = Math.ceil(max / interval) * interval;
                var bestSteps = (niceMax - niceMin) / interval;
                if (matchSteps) {
                    if (bestSteps != steps) {
                        //vp.utils.debug("** NEEDED=" + neededSteps + ", steps=" + steps);
                        //range = this.niceNum(max - min, true);
                        //interval = this.niceNum(range / steps, true);
                        //niceMin = Math.floor(min / interval) * interval;
                        //niceMax = Math.ceil(max / interval) * interval;
                        //neededSteps = (niceMax - niceMin) / interval;
                        //vp.utils.assert(neededSteps == steps);
                        //---- ensure we match STEPS exactly ----
                        interval = (niceMax - niceMin) / steps;
                    }
                }
                else {
                    steps = bestSteps;
                }
                return { min: niceMin, max: niceMax, interval: interval, steps: steps };
            };
            niceNumbersAlt.test = function (min, max, steps) {
                vp.utils.debug("min=" + min + ", max=" + max + ", steps=" + steps);
                var result = this.calculate(min, max, steps);
                vp.utils.assert(result.min <= min);
                vp.utils.assert(result.max >= max);
                vp.utils.debug("  results: min=" + result.min + ", max=" + result.max + ", interval=" + result.interval);
            };
            niceNumbersAlt.testRange = function (min, max) {
                for (var steps = 2; steps <= 12; steps++) {
                    this.test(min, max, steps);
                }
                vp.utils.debug("------------------");
            };
            niceNumbersAlt.testAll = function () {
                this.testRange(-33, -11);
                this.testRange(-8.32, 11.2);
                this.testRange(.09, .9);
                this.testRange(5, 89);
                this.testRange(106, 589);
            };
            return niceNumbersAlt;
        })();
        scales.niceNumbersAlt = niceNumbersAlt;
    })(scales = vp.scales || (vp.scales = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// wrapperTests.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///    - works out (in the small) how to design our classes to support function wrapping.
///-----------------------------------------------------------------------------------------------------------------
/// Lessons learned:
///     - Interfaces: use "T" as return signature for wrapper functions
///     - Base Classes: use "T" name as return signature for wrapper functions
///     - Outer Classes: use class name as return signature for all wrapper functions
///     - Select function: should return a concrete version of the IWrapper interface ("IWrapperOuter")
///     
///     - it is important that interfaces return "T" and not "MyInterface<T>" so that the chaining
///       doesn't get stuck at a base interface level - it always needs to reflect the chaining methods of 
///       the outer class.
var vp;
(function (vp) {
    var internal;
    (function (internal) {
        var SmallWrapperImpl = (function () {
            function SmallWrapperImpl() {
            }
            SmallWrapperImpl.prototype.background = function (value) {
                return this;
            };
            SmallWrapperImpl.prototype.close = function () {
                return this;
            };
            SmallWrapperImpl.prototype.foo = function () {
                var abc;
                abc.background("hi there").background("sdf").foo().background("asdf")
                    .background("sdf").foo();
                return this;
            };
            return SmallWrapperImpl;
        })();
        internal.SmallWrapperImpl = SmallWrapperImpl;
        function smallSelect(abc) {
            return new SmallWrapper3Impl();
        }
        internal.smallSelect = smallSelect;
        function testSmallSelect() {
            var wrapper = smallSelect("abc");
            wrapper
                .background("sdf")
                .background("werw")
                .fill("wer")
                .background("wer")
                .close()
                .fill("sdf");
        }
        var SmallWrapper2Base = (function () {
            function SmallWrapper2Base() {
            }
            SmallWrapper2Base.prototype.background = function (value) {
                return this;
            };
            SmallWrapper2Base.prototype.fill = function (value) {
                return this;
            };
            SmallWrapper2Base.prototype.close = function () {
                return this;
            };
            SmallWrapper2Base.prototype.foobar = function () {
                var abc;
                abc.foobar().background("asdf").fill("asdf")
                    .fill("sdf")
                    .background("asdf")
                    .foobar()
                    .fill("asdf")
                    .background("sdf")
                    .fill("er")
                    .foobar()
                    .close()
                    .foobar();
                return this;
            };
            return SmallWrapper2Base;
        })();
        internal.SmallWrapper2Base = SmallWrapper2Base;
        var SmallWrapper2Impl = (function (_super) {
            __extends(SmallWrapper2Impl, _super);
            function SmallWrapper2Impl() {
                _super.apply(this, arguments);
            }
            return SmallWrapper2Impl;
        })(SmallWrapper2Base);
        internal.SmallWrapper2Impl = SmallWrapper2Impl;
        var SmallWrapper3Impl = (function (_super) {
            __extends(SmallWrapper3Impl, _super);
            function SmallWrapper3Impl() {
                _super.apply(this, arguments);
            }
            return SmallWrapper3Impl;
        })(SmallWrapper2Impl);
        internal.SmallWrapper3Impl = SmallWrapper3Impl;
    })(internal = vp.internal || (vp.internal = {}));
})(vp || (vp = {}));
///-----------------------------------------------------------------------------------------------------------------
/// composerMark.ts.  Copyright (c) 2014 Microsoft Corporation.
///    - part of the vuePlotCore library
///-----------------------------------------------------------------------------------------------------------------
var vp;
(function (vp) {
    var marks;
    (function (marks) {
        /** Supports data-based generation of SVG/Canvas group primitives.  Can be used with animations.  Core function
        is "update()". */
        var composerMarkClass = (function (_super) {
            __extends(composerMarkClass, _super);
            function composerMarkClass(container, className, ctrCallback) {
                _super.call(this, container, "g", null, false, className);
                this._elemShaderInstances = {};
                this._ctrCallback = ctrCallback;
                //vp.utils.trace("ctr", "composerMark");
            }
            composerMarkClass.prototype.localShader = function (elem, data, index, isNew, context, transition) {
                var shaderInst = null;
                var anyElem = elem;
                if (isNew) {
                    var instance = this._ctrCallback(elem);
                    this._elemShaderInstances[anyElem] = instance;
                }
                else {
                    shaderInst = this._elemShaderInstances[anyElem];
                }
                //---- call the instance to shade the composed shape ----
                shaderInst.shadeMarks(transition, data.data, index, isNew, context);
                //---- finally, call the user callback, via the baseclass ----
                //super.localShader(elem, data, index, isNew, context, transition); 
            };
            return composerMarkClass;
        })(marks.markBaseClass);
        marks.composerMarkClass = composerMarkClass;
        function createComposerMark(container, className, ctrCallback) {
            return new composerMarkClass(container, className, ctrCallback);
        }
        marks.createComposerMark = createComposerMark;
    })(marks = vp.marks || (vp.marks = {}));
})(vp || (vp = {}));
//# sourceMappingURL=VuePlotCore.js.map