///-----------------------------------------------------------------------------------------------------------------
/// csv.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - part of the beachParty library
///     - converts a CSV (comma seperated file) into an array of json objects
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    /// converts a csv string (read from a csv file) into a json object.
    export function csvToJson(csv, hasHeader, sepChar, findTypes)
    {
        var loader = createCsvLoader(hasHeader, sepChar, findTypes);
        return loader.loadFromText(csv);
    }

    export class csvLoaderClass
    {
        //---- private state ----
        _colNames = [];
        _processedHdr = false;
        _lastLoadRemainder = "";
        _colCount = 0;
        _hasHeader: any = null;
        _sepChar = "";
        _quoteChar = "\"";
        _findTypes = false;
        _fixupValues = true;

        _shortRowsCount = 0;

        constructor(hasHeader: boolean, sepChar: string, findTypes: boolean, fixupValues: boolean)
        {
            this._hasHeader = (hasHeader === null) ? false : hasHeader;
            this._findTypes = findTypes;
            this._sepChar = (sepChar === null) ? "\t" : sepChar;
            this._fixupValues = fixupValues;
        }

        /// public: load(csv)
        public loadFromText(csv: string)
        {
            var startTimeInMs = vp.utils.now();
            var rows = [];

            var scanner = new csvScannerClass(csv, this._sepChar, "\"");

            if (!this._processedHdr)
            {
                if (this._hasHeader)
                {
                    //---- read first line containing column headers ----
                    var colNum = 0;

                    //---- process first line ----
                    while (true)
                    {
                        var colName = scanner.scan();
                        if (colName === csvScannerClass.endOfLine || colName === csvScannerClass.endOfFile)
                        {
                            break;
                        }

                        colName = colName.trim();

                        // Check that the column name doesn't contain any invalid chars [that JavaSctipt - or we - may choke on]
                        //if (colName.startsWith("@") || (colName.indexOf("&") != -1))
                        //{
                        //    throw ("Column name '" + colName + "' is invalid: column names cannot contain '&' or start with '@'");
                        //}

                        this._colNames.push(colName);
                    }

                    this._colCount = this._colNames.length;
                }

                this._processedHdr = true;
            }

            var lastRowOffset = 0;
            var malformedRowErrorCount = 0;
            var reportMalformedRowErrors = true;

            while (true)
            {
                var row = this.collectRowValues(scanner, this._colNames);

                var colsFound = vp.utils.keys(row).length;
                if (colsFound == 0 && scanner.endOfFile())
                {
                    break;
                }

                //---- if no header present, take first line of values as the "soft" column count ----
                if (this._colCount == 0)
                {
                    this._colCount = colsFound;
                }

                if (colsFound < this._colCount)
                {
                    this._shortRowsCount++;

                    if (this._shortRowsCount < 5)
                    {
                        //---- this is not an error, but we flag it for debugging purposes ----
                        vp.utils.debug("csv short row: rowIndex=" + rows.length + ", expected=" + this._colCount + ", found=" + colsFound);
                    }
                }

                rows.push(row);
                lastRowOffset = i;
            }

            if (this._shortRowsCount)
            {
                vp.utils.debug("csv total SHORT ROWS=" + this._shortRowsCount);
            }

            //---- test each column to see if all numeric; if so, convert to numbers ----
            if ((this._findTypes) && (rows.length > 0))
            {
                var firstRow = rows[0];
                var keys = vp.utils.keys(firstRow);

                //---- test each column ----
                for (var i = 0; i < keys.length; i++)
                {
                    this.tryToConvertColToNativeType(rows, keys[i]);
                }
            }

            var elapsedMs = new Date().getTime() - startTimeInMs;
            // alert("load() elapsed ms = " + elapsedMs.toString());

            return rows;
        }

        collectRowValues(scanner: csvScannerClass, colNames: string[])
        {
            //---- process next line (row) of data ----
            var colNum = 0;
            var row = {}

            while (true)
            {
                var colValue = scanner.scan();
                if (colValue === csvScannerClass.endOfLine || colValue === csvScannerClass.endOfFile)
                {
                    break;
                }

                var colName = (colNum < colNames.length) ? colNames[colNum] : "col" + colNum;
                row[colName] = colValue;

                colNum++;
            }

            return row;
        }

        tryToConvertColToNativeType(rows, colName)
        {
            if (!this.tryToConvertColToBool(rows, colName))
            {
                /// since JavaScript cannot tell the difference between a DATE and a number reliably, don't auto convert to date.
                if (true)       // ! tryToConvertColToDate(rows, colName))
                {
                    this.tryToConvertColToNumeric(rows, colName);
                }
            }
        }

        tryToConvertColToNumeric(rows, colName)
        {
            var isNumeric = true;
            var values = [];

            for (var i = 0; i < rows.length; i++)
            {
                var row = rows[i];
                var str = <string> row[colName];

                if (str)
                {
                    //---- TODO: add support for various standard number formats (e.g., 35,032.33) ----
                    //---- for now, just remove commas (works for US but not other locales) ----
                    str = str.replace(/,/g, "");
                }
                else
                {
                    str = "";
                }

                if (!this._fixupValues && str.trim() == "")
                {
                    //---- convert missing number to null ----
                    values.push(null);
                }
                else
                {
                    var value = Number(str);
                    if (isNaN(value))
                    {
                        str = str.toLowerCase();
                        if (str == "null" || str == "na" || str == "")
                        {
                            value = 0;
                        }
                        else
                        {
                            isNumeric = false;
                            break;
                        }
                    }

                    values.push(value);
                }
            }

            if (isNumeric)
            {
                for (var i = 0; i < rows.length; i++)
                {
                    var row = rows[i];
                    row[colName] = values[i];
                }
            }

            return isNumeric;
        }

        tryToConvertColToBool(rows, colName)
        {
            var isBool = true;
            var values = [];

            for (var i = 0; i < rows.length; i++)
            {
                var row = rows[i];
                var str = row[colName].toLowerCase();

                if (str == "true")
                {
                    values.push(true);
                }
                else if (str == "false")
                {
                    values.push(false);
                }
                else
                {
                    isBool = false;
                    break;
                }
            }

            if (isBool)
            {
                for (var i = 0; i < rows.length; i++)
                {
                    var row = rows[i];
                    row[colName] = values[i];
                }
            }

            return isBool;
        }

        tryToConvertColToDate(rows, colName)
        {
            var isDate = true;
            var values = [];

            for (var i = 0; i < rows.length; i++)
            {
                var row = rows[i];
                var str = row[colName];

                //---- TODO: add support for various standard date formats (e.g., yyyy-mm-dd) ----
                var value = Date.parse(str);
                if (isNaN(value))
                {
                    isDate = false;
                    break;
                }

                values.push(value);
            }

            if (isDate)
            {
                for (var i = 0; i < rows.length; i++)
                {
                    var row = rows[i];
                    row[colName] = values[i];
                }
            }

            return isDate;
        }

    }

    export function createCsvLoader(hasHeader: boolean, sepChar: string, findTypes: boolean, fixupValues = true)
    {
        return new csvLoaderClass(hasHeader, sepChar, findTypes, fixupValues);
    }
} 