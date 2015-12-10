//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    fileOpenMgr.ts - manages the File Open (aka "Dataset") panel
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class fileOpenMgr extends beachParty.dataChangerClass 
    {
        static instance: fileOpenMgr;

        _bpsHelper: bps.chartHostHelperClass;
        _fileOpenPanel = <jsonPanelClass>null;

        _fileOpenUrl = "";
        _fileOpenSource = null;
        _selectedSampleName = "";
        _selectedFileName = "<none>";
        _sqlTableName = "";
        _workingDataMaxRecords = 25 * 1000;
        _openFileTypeLocal = "tab";
        _openFileTypeWeb = "json";
        _fileHasHeader = true;
        _loadedFileOpenText = null;
        _dataScrubberName = "None";
        _preload: bps.Preload;

        constructor(bpsHelper: bps.chartHostHelperClass)
        {
            super();

            this._bpsHelper = bpsHelper;
            
            fileOpenMgr.instance = this;
        }

        preload(value?: bps.Preload)
        {
            if (arguments.length == 0)
            {
                return this._preload;
            }

            this._preload = value;
            this.onDataChanged("preload");
        }

        /** Show FILE OPEN panel. */
        openFileOpenPanel()
        {
            var rc = vp.select("#bbData").getBounds(false);
            var left = rc.left;
            var top = rc.bottom;

            this._fileOpenPanel = buildJsonPanel("bbData", this, "fileOpen", true, left, top);

            //---- make sure actions don't auto-close (except for "load" button) ----
            this._fileOpenPanel._isPinnedDown = true;

            var elem = this._fileOpenPanel.getRootElem();

            //---- hide SQL for the client edition ----
            if (appClass.instance._edition == "client")
            {
                vp.select(elem, "#tab3").css("display", "none");
            }

            //---- adjust length of knownDataPickerList ----
            var panelHeight = vp.select(elem).height();

            vp.select(elem, "#knownDataPickerList")
                .css("max-height", (panelHeight - 65) + "px");

        }

        uploadData(data: any, fn: string, wdParams?: bps.WorkingDataParams, callback?: any)
        {
            if (!wdParams)
            {
                var wdParams = new bps.WorkingDataParams(fn);
                wdParams.fileType = bps.FileType.json;
            }

            //---- supply a dataName so we can refer to this open data source when needed ----
            wdParams.dataName = fn;

            this._loadedFileOpenText = data;
            this._bpsHelper.setData(data, wdParams, callback);
        }

        processDroppedTextOrFile(e)
        {
            e.preventDefault();

            var dt = e.dataTransfer;
            var files = dt.files;

            if (files && files.length)
            {
                var file = files[0];
                var reader = new FileReader();
                var name = file.name;

                //---- avoid processing image files (especially if its an accidental drag of our of 1 of our icons) ----
                if (!utils.isImageFile(name))
                {
                    var fileType = file.type;
                    var size = file.size;

                    var reader = new FileReader();
                    reader.onload = (e) =>
                    {
                        // get file content
                        var text = (<any>e.target).result;

                        var wdParams = new bps.WorkingDataParams(file.name, file.name);
                        wdParams.hasHeader = true;
                        wdParams.separator = (file.name.endsWith(".txt")) ? "\t" : ",";
                        wdParams.fileType = bps.FileType.delimited;

                        this.uploadData(text, file.name, wdParams);
                    }

                    //---- start the ASYNC read of the dropped file ----
                    reader.readAsText(file);
                }
            }
            else
            {
                //---- process the dropped TEXT ----
                var text = dt.getData("text");

                if (text.contains("\t"))
                {
                    var fn = "dragAndDrop.txt";
                    var wdParams = new bps.WorkingDataParams(fn);
                    wdParams.hasHeader = true;
                    wdParams.separator = "\t";
                    wdParams.fileType = bps.FileType.delimited;

                    this.uploadData(text, fn, wdParams);
                }
                else
                {
                    appClass.instance._insightMgr.processDroppedText(text);
                }
            }
        }

        selectedSampleName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._selectedSampleName;
            }

            this._selectedSampleName = value;
            this._fileOpenSource = "sample";

            this.openKnownFile(value, true);
            this.closeFileOpenPanel();

            this.onDataChanged("selectedSampleName");
        }

        closeFileOpenPanel()
        {
            if (this._fileOpenPanel)
            {
                this._fileOpenPanel.close();
                this._fileOpenPanel = null;
            }

        }

        public updateDataView(data: any) {
            this._bpsHelper.updateDataView(data, null, () => {
                console.log("updateDataView: " + new Date());
            });
        }

        selectedFileName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._selectedFileName;
            }

            this._selectedFileName = value;
            this._fileOpenSource = "local";
            this.onDataChanged("selectedFileName");
        }

        openFileTypeLocal(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._openFileTypeLocal;
            }

            this._openFileTypeLocal = value;
            this.onDataChanged("openFileTypeLocal");
            this.onDataChanged("isFirstLineDisabledLocal");
        }

        openFileTypeWeb(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._openFileTypeWeb;
            }

            this._openFileTypeWeb = value;
            this.onDataChanged("openFileTypeWeb");
            this.onDataChanged("isFirstLineDisabledWeb");
        }

        fileOpenURL(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._fileOpenUrl;
            }

            this._fileOpenUrl = value;
            this._fileOpenSource = "web";
            this.setFileTypeFromNameWeb(value);

            this.onDataChanged("fileOpenURL");
        }

        sqlTableName(value?: string)
        {
            if (arguments.length === 0)
            {
                return this._sqlTableName;
            }

            this._sqlTableName = value;

            this.onDataChanged("sqlTableName");
        }

        fileHasHeader(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._fileHasHeader;
            }

            this._fileHasHeader = value;
            this.onDataChanged("fileHasHeader");
        }

        onFileNameClick(e)
        {
            //---- reset results from last file load ----
            this._selectedFileName = "";
            //this._fileOpenUrl = "";
            this._fileOpenSource = null;

            appClass.instance.logAction(Gesture.click, e.target.id, ElementType.button, Action.open, Target.filePanel, false);

            this.openFileOpenPanel();
        }

        setLocalFileType(fn: string)
        {
            var fileType = null;

            if (fn.endsWith(".txt"))
            {
                fileType = "tab";
            }
            else if (fn.endsWith(".csv"))
            {
                fileType = "comma";
            }
            else if (fn.endsWith(".json"))
            {
                fileType = "json";
            }

            if (fileType)
            {
                this.openFileTypeLocal(fileType);
            }
        }

        setFileTypeFromNameWeb(fn: string)
        {
            if (fn.endsWith(".txt"))
            {
                this.openFileTypeWeb("tab");
            }
            else if (fn.endsWith(".csv"))
            {
                this.openFileTypeWeb("comma");
            }
            else if (fn.endsWith(".json"))
            {
                this.openFileTypeWeb("json");
            }
        }

        isFirstLineDisabledLocal()
        {
            var ft = this._openFileTypeLocal;

            return (ft == "json");
        }

        isFirstLineDisabledWeb()
        {
            var ft = this._openFileTypeWeb;

            return (ft == "json");
        }

        onOpenFileClicked()
        {
            //---- user clicked on "Load File" button for local file open ----
            localFileHelper.loadFile(".csv,.txt,.json", (text, fn) => 
            {
                try
                {
                    //---- NOTE: file is actually uploaded via "loadFileOpenLocal()", called from fileOpenPanel OK button handler ----
                    this._loadedFileOpenText = text;
                    this.selectedFileName(fn);

                    this.setLocalFileType(fn);
                }
                catch (ex)
                {
                    throw ("Error parsing session file: " + ex);
                }
            });
        }

        /** used to open Web URL files and SQL files. */
        loadFileFromPanel(url?: string, sqlTableName?: string, maxRecords?: number)
        {
            /// some test URL's:
            ///     http://localhost/vuebigdata/datafiles/iris.txt
            ///     http://vibe10/vuebigdata/datafiles/loanData.csv
            ///     http://vibe10/vuebigdata/datafiles/mediumSales.json

            if (url)
            {
                url = url.trim();           // remove leading/tailing spaces

                var fileType = this._openFileTypeWeb;

                // var text = this._loadedFileOpenText;
                var fn = appUtils.getLastNodeOfUrl(url);
                var fileSource = (sqlTableName) ? "sql" : "url";

                var scrubberTemplate = this._dataScrubberName;
                if (scrubberTemplate)
                {
                    var wdParams = <bps.WorkingDataParams>this.getPreloadFromLocalStorage(scrubberTemplate, null, sqlTableName);
                }

                if (!wdParams)
                {
                    wdParams = new bps.WorkingDataParams(fn, url);
                    wdParams.hasHeader = this._fileHasHeader;
                    wdParams.separator = (fileType == "tab") ? "\t" : ",";
                    wdParams.fileType = (fileType == "json") ? bps.FileType.json : bps.FileType.delimited;
                    wdParams.fileSource = fileSource;
                }

                if (sqlTableName)
                {
                    if (sqlTableName.contains(" ") || sqlTableName.contains(";"))
                    {
                        wdParams.queryString = sqlTableName;
                        var name = sqlTableName;
                    }
                    else
                    {
                        wdParams.tableName = sqlTableName;
                        var name = sqlTableName;
                    }

                    wdParams.fileType = bps.FileType.sql;
                }

                wdParams.maxRecords = maxRecords;

                //---- supply a dataName so we can refer to this open data source when needed ----
                wdParams.dataName = fn;

                this._bpsHelper.loadData(wdParams);
            }

            this.closeFileOpenPanel();
        }

        loadFileOpenWeb()
        {
            /// some test URL's:
            ///     http://localhost/vuebigdata/datafiles/iris.txt
            ///     http://vibe10/vuebigdata/datafiles/loanData.csv
            ///     http://vibe10/vuebigdata/datafiles/mediumSales.json

            this.loadFileFromPanel(this._fileOpenUrl);
        }

        /** load the file from cache or as known file. */
        autoloadFile(filename: string, preload?: bps.Preload, callback?: any)
        {
            var entry = this.getDataFileFromCache(filename, "local");
            if (!entry)
            {
                entry = this.getDataFileFromCache(filename, "web");
            }

            if (entry)
            {
                this.uploadData(entry.data, filename, entry.wdParams, callback);
            }
            else
            {
                if (!appClass.instance.isKnownFile(filename))
                {
                    //filename = "Titanic";       // default known file name
                    throw "Cannot open file: " + filename;
                }

                this.openKnownFile(filename, false, callback);
            }
        }

        /** local a local file using our properties (include this._loadedFileOpenText). */
        loadFileOpenLocal()
        {
            var url = this._selectedFileName;
            if (url)
            {
                var isLocal = true;
                var fileType = this._openFileTypeLocal;
                var fn = appUtils.getLastNodeOfUrl(url);

                var scrubberTemplate = this._dataScrubberName;
                if (scrubberTemplate)
                {
                    var wdParams = <bps.WorkingDataParams>this.getPreloadFromLocalStorage(scrubberTemplate);        // fn, "local");
                }

                if (!wdParams)
                {
                    wdParams = new bps.WorkingDataParams(fn, url);
                    wdParams.hasHeader = this._fileHasHeader;
                    wdParams.separator = (fileType == "tab") ? "\t" : ",";
                    wdParams.fileType = (fileType == "json") ? bps.FileType.json : bps.FileType.delimited;
                    wdParams.fileSource = "local";
                }

                var text = this._loadedFileOpenText;
                this.uploadData(text, fn, wdParams);

                if (settings._cacheLocalFiles)
                {
                    this.storeDataFileToCache(url, "local", text, wdParams);
                }
            }

            this.closeFileOpenPanel();
        }

        getPreloadFromLocalStorage(fn: string, fileSource?: string, tableName?: string)
        {
            var preload = <bps.Preload>null;

            if (localStorage)
            {
                var key = this.makePreloadKey(fn, fileSource, tableName);
                vp.utils.debug("getPreloadFromLocalStorage: key=" + key);

                var str = localStorage[key];
                if (str && str.length)
                {
                    preload = JSON.parse(str);
                }
            }

            return preload;
        }

        /** get list of data scrubber templates from local storage. locType is one of 
         * "sql", "web", "local". */
        getPreloadNamesFromLocalStorage(locType?: string)
        {
            var list = [];

            if (localStorage)
            {
                var keyStart = "preloads-$";

                if (locType)
                {
                    keyStart += locType + "\\";
                }

                //---- enumerate all keys to find those that match our needs ----
                for (var i = 0; i < localStorage.length; i++)
                {
                    var key = localStorage.key(i);
                    if (key.startsWith(keyStart))
                    {
                        var fn = key.substr(keyStart.length);
                        list.push(fn);
                    }
                }
            }

            return list;
        }

        makePreloadKey(fn: string, fileSource?: string, tableName?: string)
        {
            if (fileSource)
            {
                var key = "preloads-$" + fileSource + "\\" + fn;
            }
            else
            {
                var key = "preloads-$" + fn;
            }

            if (fileSource == "sql")
            {
                //---- fn is connection string, tableName is table name or query string ----
                key += "\\" + tableName;
            }

            return key;
        }

        makeCacheKey(fn: string, fileSource?: string, tableName?: string)
        {
            if (fileSource)
            {
                var key = "fileCache-$" + fileSource + "\\" + fn;
            }
            else
            {
                var key = "fileCache-$" + fn;
            }

            if (fileSource == "sql")
            {
                //---- fn is connection string, tableName is table name or query string ----
                key += "\\" + tableName;
            }

            return key;
        }

        savePreloadToLocalStorage(preload: bps.Preload)
        {
            if (localStorage)
            {
                var str = JSON.stringify(preload);
                var fileSource = preload.fileSource;
                var fn = (fileSource == "url") ? preload.filePath : preload.dataName;

                var key = this.makePreloadKey(fn, fileSource, preload.tableName);
                vp.utils.debug("savePreloadToLocalStorage: key=" + key);

                localStorage[key] = str;
            }
        }

        reloadDataPerScrubbing(editInfos: editColInfo[])
        {
            //---- build fieldlist for preload ----
            var fieldList = <bps.PreloadField[]>[];

            for (var i = 0; i < editInfos.length; i++)
            {
                var ei = editInfos[i];
                if (ei.isVisible)
                {
                    var cfExpress = (ei.name == ei.displayName) ? null : ei.name;
                    var pf = new bps.PreloadField(ei.displayName, ei.desc, cfExpress, ei.colType, ei.sortedKeys);
                    pf.valueMap = ei.valueMap;

                    fieldList.push(pf);
                }
            }

            var preload = this._preload;
            preload.fieldList = fieldList;
            this.savePreloadToLocalStorage(preload);

            //---- reload data with new fieldList ----
            if (this._loadedFileOpenText)
            {
                this._bpsHelper.setData(this._loadedFileOpenText, preload);
            }
            else
            {
                this._bpsHelper.loadData(preload, null);
            }
        }

        loadFileOpenSql()
        {
            this.loadFileFromPanel(this._fileOpenUrl, this._sqlTableName, this._workingDataMaxRecords);
        }



        openKnownFile(name: string, fromUI: boolean, callback?: any)
        {
            vp.select("#filenameText")
                .text("[loading file: " + name + "]");

            //---- clear local file data from last load ----
            this._loadedFileOpenText = null;

            var preload = this.getPreloadFromLocalStorage(name, "known");
            if (preload)
            {
                this._bpsHelper.loadData(preload, (e) =>
                {
                    if (fromUI)
                    {
                        appClass.instance.logAction(Gesture.select, null, ElementType.picklist, Action.load, Target.data,
                            true, "fileName", name, "isKnown", "true");
                    }

                    if (callback)
                    {
                        callback();
                    }
                });
            }
            else
            {
                //vp.utils.debug("requesting known file=" + name);
                this._bpsHelper.loadKnownData(name, (e) =>
                {
                    if (fromUI)
                    {
                        appClass.instance.logAction(Gesture.select, null, ElementType.picklist, Action.load, Target.data,
                            true, "fileName", name, "isKnown", "true");
                    }

                    if (callback)
                    {
                        callback();
                    }

                });
            }
        }

        storeDataFileToCache(filename: string, fileSource: string, data: string, wdParams: bps.WorkingDataParams)
        {
            if (localStorage)
            {
                var key = this.makeCacheKey(filename, fileSource);

                var entry = new CacheEntry();
                entry.data = data;
                entry.wdParams = wdParams;
                
                var strEntry = JSON.stringify(entry);
                localStorage[key] = strEntry;
            }
        }

        getDataFileFromCache(filename: string, fileSource: string)
        {
            var entry = <CacheEntry> null;

            if (localStorage)
            {
                var key = this.makeCacheKey(filename, fileSource);
                var strEntry = localStorage[key];

                if (strEntry)
                {
                    entry = <CacheEntry>JSON.parse(strEntry);
                }
            }

            return entry;
        }

        dataScrubberName(value?: string)
        {
            if (arguments.length == 0)
            {
                return this._dataScrubberName;
            }

            this._dataScrubberName = value;
            this.onDataChanged("dataScrubberName");
        }

        loadedFileOpenText(value?: string)
        {
            if (arguments.length == 0)
            {
                return this._loadedFileOpenText;
            }

            this._loadedFileOpenText = value;
            this.onDataChanged("loadedFileOpenText");
        }


    }

    export class CacheEntry
    {
        data: string;
        wdParams: bps.WorkingDataParams;
    }
}