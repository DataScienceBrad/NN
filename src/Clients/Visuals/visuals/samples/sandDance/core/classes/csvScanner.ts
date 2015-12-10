///-----------------------------------------------------------------------------------------------------------------
/// csvScanner.ts.  Copyright (c) 2015 Microsoft Corporation.
///     - part of the beachParty library
///     - scans values in a CSV (text delimited) file
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class csvScannerClass
    {
        static endOfLine = -1;
        static endOfFile = null;

        _delimiter: string;
        _quoteChar: string;

        //---- scanner state ----
        _text = null;
        _offset = 0;

        constructor(text: string, delimiter: string, quoteChar: string)
        {
            this._delimiter = delimiter;
            this._quoteChar = quoteChar;
            this._offset - 0;

            //---- make scanner simpler by collapsing multi char line endings ----
            this._text = text.replace(/\r\n/g, "\n");
        }

        public scan()
        {
            var value = <any> csvScannerClass.endOfFile;

            var offset = this._offset;
            var start = offset;
            var text = this._text;

            if (offset < text.length)
            {
                var ch = text[offset++];

                if (ch == this._quoteChar)
                {
                    //---- scan QUOTED value ----
                    value = "";
                    var foundEndingQuote = false;

                    while (offset < text.length)
                    {
                        ch = text[offset++];

                        if (ch == this._quoteChar)
                        {
                            if (offset < text.length && text[offset] == this._quoteChar)
                            {
                                //---- EMBEDDED quote ----
                                value += ch;
                                offset++;       // skip over 2nd quote char
                            }
                            else
                            {
                                //---- ENDING quote ----
                                foundEndingQuote = true;

                                //---- next char must be delimiter or newLINE ----
                                if (offset < text.length)
                                {
                                    var ch = text[offset];

                                    if (ch == this._delimiter)
                                    {
                                        offset++;       // "use" delimiter now
                                    }
                                    else if (ch != "\n")
                                    {
                                        throw "expected delimiter or newline at end of quoted string, but found: " + ch;
                                    }
                                }

                                break;
                            }
                        }
                        else
                        {
                            value += ch;
                        }
                    }
                }
                else if (ch == "\n")
                {
                    value = csvScannerClass.endOfLine;
                }
                else if (ch == this._delimiter)
                {
                    value = "";
                }
                else
                {
                    //---- scan NORMAL value ----
                    while (offset < text.length)
                    {
                        var ch = text[offset++];

                        if (ch == this._delimiter)
                        {
                            value = text.substr(start, offset - start - 1);
                            break;
                        }
                        else if (ch == "\n")
                        {
                            //---- don't consume the newline until our next call ----
                            offset--;

                            value = text.substr(start, offset - start);
                            break;
                        }
                    }
                }

                this._offset = offset;
            }

            return value;
        }

        endOfFile()
        {
            return (this._offset >= this._text.length);
        }
    }

    function testCsvScanner()
    {
        var scanner = new csvScannerClass('abc;def;ghi\n1;2;3\naaa;"bbb";ccc\naaa;"bb""bb";ccc\n', ";", "\"");
        
        while (true)
        {
            var value = scanner.scan();
            vp.utils.debug("csvScan: value=" + value);

            if (value == csvScannerClass.endOfFile)
            {
                break;
            }
        }
    }

    //testCsvScanner();
} 