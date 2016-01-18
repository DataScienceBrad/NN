//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataMgr.ts - loads and manages data streams used by BeachParty.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    //---- keep in sync with same names in dataServerApp/DataTransformer.cs ----
    export var selectedName = "_selected";
    export var filteredName = "_filtered";
    export var primaryKeyName = "_primaryKey";
    export var randomXName = "_randomX";
    export var randomYName = "_randomY";

    /** manages:
        - server data requests
        - client-side data requests
        - selection
        - filtering  
    */
    export class DataMgrClass extends DataChangerClass
    {
        private _dataFrame: DataFrameClass;
        private _fn: string = null;
        //private _colMappings: any = {};

        private _recordCount = 0;
        private _selectedCount = 0;
        private _filteredInCount = 0;
        private _wdParams: bps.WorkingDataParams = null;
        private _shareMgr: ShareMgrClass;
        private _preloadMgr: PreloadMgrClass;
        private _colInfos: bps.ColInfo[];
        private _origColInfos: bps.ColInfo[];
        private _appMgr: AppMgrClass;
        private _isClientEdition;

        /// selectMode logically belongs on the client, but since the engine processes events from the chart exes, 
        /// we keep it here.  this may change in the future.
        private _selectMode = bps.SelectMode.normal;

        constructor(appMgr: AppMgrClass, preloadMgr: PreloadMgrClass, isClientEdition: boolean)
        {
            super();

            this._appMgr = appMgr;
            this._preloadMgr = preloadMgr;
            this._isClientEdition = isClientEdition;

            //---- don't trip over NULL dataFrame ----
            this._dataFrame = new DataFrameClass({});

            this._shareMgr = new ShareMgrClass((sd: ShareStateData) =>
            {
                if (this.hasSelectionChanged(sd.selectedPrimaryKeys))
                {
                    this.setSelectionDirect(sd.selectedPrimaryKeys, "localstorage");
                }
            });

        }

        hasSelectionChanged(keyList: string[])
        {
            var hasChanged = true;

            var selVector = this.getSelectedVector(false);
            var vCount = vector.countOn(selVector);

            //---- quickest check - make sure # of 1's in vector matches length of keyList ----
            if (vCount === keyList.length)
            {
                var pktoIndex = this._dataFrame.getPkToVectorIndex();
                var hasChanged = false;

                for (var i = 0; i < keyList.length; i++)
                {
                    var key = keyList[i];
                    var index = pktoIndex[key];

                    if (!selVector[index])
                    {
                        hasChanged = true;
                        break;
                    }
                }
            }

            return hasChanged;
        }

        setDataDirect(data: any, wdParams: bps.WorkingDataParams)
        {
            vp.utils.debug("setDataDirect: calling loader");

            var loader = new DataLoaderClass(this._preloadMgr);
            var result = loader.processdData(data, wdParams);

            vp.utils.debug("setDataDirect: calling setDataAndInfo");

            this.setDataAndInfo(result.origDf, result.postDf, result.wdParams);

            vp.utils.debug("setDataDirect ending");
        }

        loadKnownAsync(name: string, wdParams?: bps.WorkingDataParams, callback?: any)
        {
            var loader = new DataLoaderClass(this._preloadMgr);

            loader.loadKnownAsyncCore(name, null, (origDf, postDf, wdParams) =>
            {
                this.setDataAndInfo(origDf, postDf, wdParams);

                if (callback)
                {
                    callback(postDf);
                }
            });
        }

        openPreloadAsync(dataFrame, wdParams?: bps.WorkingDataParams, callback?: any)
        {
            var loader = new DataLoaderClass(this._preloadMgr);

            loader.openPreload(wdParams, dataFrame, null, (origDf, postDf, wdParams) =>
            {
                this.setDataAndInfo(origDf, postDf, wdParams);

                if (callback)
                {
                    callback(postDf);
                }
            });
        }

        selectMode(value?: bps.SelectMode)
        {
            if (arguments.length === 0)
            {
                return this._selectMode;
            }

            this._selectMode = value;
            this.onDataChanged("SelectMode");
        }

        getFilteredInVector(colName: string)
        {
            var rawVector = <any[]>this._dataFrame.getVector(colName, false);
            var filter = this.getFilteredVector(false);
            var newVector = [];

            for (var i = 0; i < rawVector.length; i++)
            {
                if (!filter[i])
                {
                    newVector.push(rawVector[i]);
                }
            }

            return newVector;
        }

        getFilteredKeysMinMax(colName: string, colType: string)
        {
            var keys = null;
            var min = null;
            var max = null;

            var vector = this.getFilteredInVector(colName);

            if (colType === "string")
            {
                keys = vector.distinct();       // .length;
                min = 0;
                max = keys.length - 1;
            }
            else
            {
                keys = null;
                min = vector.min();
                max = vector.max();
            }

            return { keys: keys, min: min, max: max };
        }

        getOrigColInfos()
        {
            return this._origColInfos;
        }

        getColInfos(applyFilter?: boolean)
        {
            var colInfos = this._colInfos;

            if ((applyFilter) && (this._filteredInCount !== this._recordCount))
            {
                var newInfos: bps.ColInfo[] = [];

                for (var i = 0; i < colInfos.length; i++)
                {
                    var ci = colInfos[i];
                    var mm = this.getFilteredKeysMinMax(ci.name, ci.colType);
                    var ciTo = new bps.ColInfo(ci.name, ci.desc, ci.colType, mm.keys, mm.min, mm.max);
                    newInfos.push(ciTo);
                }

                colInfos = newInfos;
            }

            return colInfos;
        }

        buildColInfos(df: DataFrameClass)
        {
            var wdParams = this._wdParams;      // df.getPreload();
            var names = df.getColumnNames();
            var colInfos = <bps.ColInfo[]>[];

            for (var i = 0; i < names.length; i++)
            {
                var name = names[i];
                var fieldInfo = wdParams.getField(name);

                if (!name.startsWith("_"))
                {
                    var colType = df.getColType(name);

                    var keys = null;
                    var numVector = df.getNumericVector(name);

                    if (colType === "string")
                    {
                        keys = numVector.keyInfo.sortedKeys;
                    }

                    var desc = (fieldInfo) ? fieldInfo.description : "";

                    var min = numVector.values.min();
                    var max = numVector.values.max();

                    var info = new bps.ColInfo(name, desc, colType, keys, min, max);
                    info.calcFieldExp = (fieldInfo) ? fieldInfo.calcFieldExp : null;

                    colInfos.push(info);
                }
            }

            return colInfos;
        }

        isFileLoaded(file: bps.WorkingDataParams)
        {
            var isLoaded = false;

            if (this._wdParams)
            {
                isLoaded = (this._wdParams.filePath === file.filePath);

                if (isLoaded)
                {
                    //---- check to see if field list matches ----
                    if (!WdCompare.fieldListsMatch(this._wdParams.fieldList, file.fieldList))
                    {
                        isLoaded = false;
                    }
                }
            }

            return isLoaded;
        }

        onLocalStorageChange()
        {
            this._shareMgr.onLocalStorageChange();
        }

        getShareMgr()
        {
            return this._shareMgr;
        }

        getDataFrame(): DataFrameClass
        {
            return this._dataFrame;
        }

        getFilename()
        {
            return this._fn;
        }

        searchExactMatch(selection: number[], data: any[], value: string, maxValue: string)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue === value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchNotEqual(selection: number[], data: any[], value: string, maxValue: string)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue !== value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchContains(selection: number[], data: any[], value: string, maxValue: string)
        {
            value = value + "";     // force to a string

            for (var i = 0; i < data.length; i++)
            {
                var str = data[i] + "";
                if (str.contains(value))
                {
                    selection[i] = 1;
                }
            }
        }

        searchStartsWith(selection: number[], data: any[], value: string, maxValue: string)
        {
            value = value + "";     // force to a string

            for (var i = 0; i < data.length; i++)
            {
                var str = data[i] + "";
                if (str.startsWith(value))
                {
                    selection[i] = 1;
                }
            }
        }

        searchGreaterThan(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue > value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchGreaterThanEqual(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue >= value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchLessThan(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue < value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchLessThanEqual(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue <= value)
                {
                    selection[i] = 1;
                }
            }
        }

        searchBetweenInclusive(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue >= value && itemValue <= maxValue)
                {
                    selection[i] = 1;
                }
            }
        }

        searchGtrValueAndLeqValue2(selection: number[], data: any[], value: string, maxValue: string, isString: boolean)
        {
            for (var i = 0; i < data.length; i++)
            {
                var itemValue = data[i];
                if (itemValue > value && itemValue <= maxValue)
                {
                    selection[i] = 1;
                }
            }
        }

        searchColValueByKeys(selection: number[], data: any[], otherKeys: string[])
        {
            for (var i = 0; i < data.length; i++)
            {
                var strKey = data[i] + "";

                if (otherKeys.indexOf(strKey) > -1)
                {
                    selection[i] = 1;
                }
            }
        }

        dateToNumber(value: any)
        {
            var numValue: number;

            if (vp.utils.isString(value))
            {
                var dt = new Date(value);
                numValue = +dt;
            }
            else
            {
                numValue = +value;
            }

            return numValue;
        }

        searchColValue(sp: bps.SearchParams)
        {
            var colName = sp.colName;
            var value = sp.minValue;
            var maxValue = sp.maxValue;
            var searchType = sp.searchType;
            var searchAction = (sp.searchAction === undefined || sp.searchAction === null) ? bps.SearchAction.selectMatches : sp.searchAction;

            vp.utils.debug("search: colName=" + colName + ", value=" + value + ", maxValue=" + maxValue);

            if (value === "")
            {
                searchType = bps.TextSearchType.exactMatch;
            }

            var matchVector = <number[]> vp.data.dataRepeat(0, this._recordCount);

            var colType = this._dataFrame.getColType(colName);
            if (sp.searchRawValues)
            {
                colType = "string";
            }

            var isString = (colType === "string");

            if (isString)
            {
                //---- get original data vector ----
                var data = <any[]> this._dataFrame.getVector(colName, false);
            }
            else
            {
                //---- get numeric form of vector ----
                var data = <any[]>this._dataFrame.getNumericVector(colName, false).values.toArray();
            }

            if (colType === "number")
            {
                value = +value;
                maxValue = (maxValue !== null && maxValue !== undefined) ? +maxValue : value;
            }
            else if (colType === "date")
            {
                value = this.dateToNumber(value);
                maxValue = (maxValue !== null && maxValue !== undefined) ? this.dateToNumber(maxValue) : value;
            }

            if (vp.utils.isArray(value))
            {
                this.searchColValueByKeys(matchVector, data, value);
            }
            else if (searchType === bps.TextSearchType.exactMatch)
            {
                this.searchExactMatch(matchVector, data, value, maxValue);
            }
            else if (searchType === bps.TextSearchType.notEqual)
            {
                this.searchNotEqual(matchVector, data, value, maxValue);
            }
            else if (searchType === bps.TextSearchType.contains)
            {
                this.searchContains(matchVector, data, value, maxValue);
            }
            else if (searchType === bps.TextSearchType.startsWith)
            {
                this.searchStartsWith(matchVector, data, value, maxValue);
            }
            else if (searchType === bps.TextSearchType.greaterThan)
            {
                this.searchGreaterThan(matchVector, data, value, maxValue, isString);
            }
            else if (searchType === bps.TextSearchType.greaterThanEqual)
            {
                this.searchGreaterThanEqual(matchVector, data, value, maxValue, isString);
            }
            else if (searchType === bps.TextSearchType.lessThan)
            {
                this.searchLessThan(matchVector, data, value, maxValue, isString);
            }
            else if (searchType === bps.TextSearchType.lessThanEqual)
            {
                this.searchLessThanEqual(matchVector, data, value, maxValue, isString);
            }
            else if (searchType === bps.TextSearchType.betweenInclusive)
            {
                this.searchBetweenInclusive(matchVector, data, value, maxValue, isString);
            }
            else if (searchType === bps.TextSearchType.gtrValueAndLeqValue2)
            {
                this.searchGtrValueAndLeqValue2(matchVector, data, value, maxValue, isString);
            }

            var matches = null;

            if (searchAction === bps.SearchAction.selectMatches)
            {
                //---- convert from list of 0/1 values to a list of "value=1" record indexes ----
                var selectedIndexes = [];
                for (var i = 0; i < matchVector.length; i++)
                {
                    if (matchVector[i])
                    {
                        selectedIndexes.push(i);
                    }
                }

                this.updateSelectionFromVectorIndexes(selectedIndexes);
            }
            else if (searchAction === bps.SearchAction.returnMatches)
            {
                matches = [];
                var dataView = this._appMgr.getDataView();
                var pkVector = this._dataFrame.getVector(primaryKeyName, false);

                for (var i = 0; i < matchVector.length; i++)
                {
                    if (matchVector[i])
                    {
                        var key = pkVector[i];
                        var rc = dataView.getShapeScreenRect(key);

                        var match = { primaryKey: key, rcBounds: rc };
                        matches.push(match);
                    }
                }
            }

            return matches;
        }

        //getColMappings()
        //{
        //    return this._colMappings;
        //}

        getPreload()
        {
            return this._wdParams;
        }

        /** data can be either JSON array, map of named vectors, or text string. */
        public setDataAndInfo(origDf: DataFrameClass, postDf: DataFrameClass, wdParams: bps.WorkingDataParams)
        {
            this._dataFrame = postDf;
            this._wdParams = wdParams;
            this._fn = wdParams.dataName;

            this._recordCount = postDf.getRecordCount();

            this.computeSelectedCount();
            this.computeFilteredCount();

            //---- build ORIG colInfos, based on full set of (unchanged) columns in table ----
            this._origColInfos = this.buildColInfos(origDf);

            //---- build colInfos, based on SCRUBBED set of columns ----
            this._colInfos = this.buildColInfos(postDf);

            this.onDataChanged("selection");
            this.onDataChanged("dataFrame");
            //this.onDataChanged("filtered");
            this.onDataChanged("colMappings");
            this.onDataChanged("fn");

            this._shareMgr.setFilename(wdParams.dataName);
        }

        requestBinData(md: bps.MappingData, callback)
        {
            var sortOptions = new beachParty.BinSortOptionsClass();
            sortOptions.sortDirection = md.binSorting;
            sortOptions.sortByAggregateType = "count";

            //---- create a NamedVector object for binHelper ----
            var nv = new NamedVectors(this._recordCount);
            var dataFrame = this.getDataFrame();
            nv.x = dataFrame.getNumericVector(md.colName);
            nv.primaryKey = dataFrame.getNumericVector(primaryKeyName);

            var binResult = beachParty.BinHelper.createBins(nv, "x", md.binCount, md.binCount, md.forceCategory, true, true, sortOptions, null, md.useNiceNumbers, md);

            callback(binResult);
        }

        computeSelectedCount()
        {
            var select = this.getSelectedVector(false);
            this._selectedCount = vector.countOn(select);
        }

        private computeFilteredCount()
        {
            var filter = this.getFilteredVector(false);
            this._filteredInCount = vector.countOff(filter);
        }

        getSelectedVector(invalidateNumericCache: boolean)
        {
            var vector = <number[]> this._dataFrame.getVector(selectedName, invalidateNumericCache);
            return vector;
        }

        getFilteredVector(invalidateNumericCache: boolean)
        {
            var vector = this._dataFrame.getVector(filteredName, invalidateNumericCache);
            return vector;
        }

        //getRecordIndexVector()
        //{
        //    var vector = this._dataFrame.getVector(primaryKeyName, false);
        //    return vector;
        //}

        updateSelectionFromBoxes(origBoxes: BoundingBox[], selectMode?: bps.SelectMode)
        {
            //---- map origBoxes[] shapeIndex to sorted-data-relative boxIndexes[] ----
            if (origBoxes)
            {
                var vectorIndexes = <number[]> [];
                var pkToVectorIndex = this._dataFrame.getPkToVectorIndex();

                for (var i = 0; i < origBoxes.length; i++)
                {
                    var key = origBoxes[i].primaryKey;
                    var vectorIndex = pkToVectorIndex[key];

                    vectorIndexes.push(vectorIndex);
                }

                this.updateSelectionFromVectorIndexes(vectorIndexes, selectMode);
            }
        }

        updateSelectionFromVectorIndexes(indexes: number[], selectMode?: bps.SelectMode)
        {
            if (selectMode === undefined || selectMode === null)
            {
                selectMode = this._selectMode;
            }

            var select = this.getSelectedVector(true);

            if (selectMode === bps.SelectMode.normal)
            {
                //---- clear previous selection ----
                vector.clear(select);
            }

            if (selectMode === bps.SelectMode.subtractive)
            {
                for (var i = 0; i < indexes.length; i++)
                {
                    var recordIndex = indexes[i];
                    select[recordIndex] = 0;
                }
            }
            else if (selectMode === bps.SelectMode.intersection)
            {
                var temp = vp.utils.copyArray(select);

                for (var i = 0; i < indexes.length; i++)
                {
                    var recordIndex = indexes[i];
                    if (temp[recordIndex] === 1)
                    {
                        temp[recordIndex] = 2;
                    }
                }

                //---- tranfer to select ----
                for (var i = 0; i < temp.length; i++)
                {
                    select[i] = (temp[i] === 2) ? 1 : 0;
                }
            }
            else if (selectMode === bps.SelectMode.nonIntersection)
            {
                var temp = vp.utils.copyArray(select);

                for (var i = 0; i < indexes.length; i++)
                {
                    var recordIndex = indexes[i];
                    if (temp[recordIndex] === 1)
                    {
                        temp[recordIndex] = 2;
                    }
                    else
                    {
                        temp[recordIndex] = 1;
                    }
                }

                //---- tranfer to select ----
                for (var i = 0; i < temp.length; i++)
                {
                    select[i] = (temp[i] === 1) ? 1 : 0;
                }
            }
            else if (selectMode === bps.SelectMode.normal || selectMode === bps.SelectMode.additive)
            {
                for (var i = 0; i < indexes.length; i++)
                {
                    var recordIndex = indexes[i];
                    select[recordIndex] = 1;
                }
            }

            this.onSelectionChanged();
        }

        //---- set FILTERED-OUT records to the specified list of primary keys ----
        setFilter(filteredOutKeys: string[])
        {
            if (filteredOutKeys)
            {
                var filter = this.getFilteredVector(true);
                vector.clear(filter);

                var pkToVectorIndex = this._dataFrame.getPkToVectorIndex();

                for (var i = 0; i < filteredOutKeys.length; i++)
                {
                    var pk = filteredOutKeys[i];
                    var vi = pkToVectorIndex[pk];

                    filter[vi] = 1;              // mark this record as "filtered out"
                }

                this.computeFilteredCount();
                this.onDataChanged("filtered");
            }
        }

        forceFilterChangedEvent()
        {
            this.onDataChanged("filtered");
        }

        /** sets the selection vector to the records described by "selectedPrimaryKeys", without applying any boolean operations. */
        setSelectionDirect(selectedPrimaryKeys: string[], changeSource: string)
        {
            if (selectedPrimaryKeys)
            {
                var selectVector = this.getSelectedVector(true);
                vector.clear(selectVector);

                var pkToVectorIndex = this._dataFrame.getPkToVectorIndex();

                for (var i = 0; i < selectedPrimaryKeys.length; i++)
                {
                    var pk = selectedPrimaryKeys[i];
                    var vi = pkToVectorIndex[pk];

                    selectVector[vi] = 1;              // mark this record as "selected"
                }

                this.onSelectionChanged(changeSource);
            }
        }

        isolateSelection()
        {
            /// REMINDER: filtered[i] == true (or == 1) means record is filtered OUT of view  
            var select = this.getSelectedVector(false);
            var filter = this.getFilteredVector(true);

            for (var i = 0; i < select.length; i++)
            {
                //---- don't change filter of filtered-out records ----
                if (!filter[i])
                {
                    filter[i] = (1 - select[i]);
                }
            }

            this.computeFilteredCount();
            this.onDataChanged("filtered");

            this.clearSelection();
        }

        excludeSelection()
        {
            /// REMINDER: filtered[i] == true (or == 1) means record is filtered OUT of view  
            var select = this.getSelectedVector(false);
            var filter = this.getFilteredVector(true);

            for (var i = 0; i < select.length; i++)
            {
                //---- don't change filter of filtered-out records ----
                if (! filter[i]) 
                {
                    //---- record is filtered out if it IS selected ----
                    filter[i] = select[i];
                }
            }

            this.computeFilteredCount();
            this.onDataChanged("filtered");

            this.clearSelection();
        }

        getSelectedRecords(applyFilter?: boolean )
        {
            var select = this.getSelectedVector(false);
            var selectedRecords = [];
            var filter = null;

            if (applyFilter)
            {
                filter = this.getFilteredVector(true);
            }

            if (filter && filter.length)
            {
                for (var i = 0; i < select.length; i++)
                {
                    if ((select[i]) && (! filter[i]))
                    {
                        var record = this._dataFrame.getRecordByVectorIndex(i);
                        selectedRecords.push(record);
                    }
                }
            }
            else
            {
                for (var i = 0; i < select.length; i++)
                {
                    if (select[i])
                    {
                        var record = this._dataFrame.getRecordByVectorIndex(i);
                        selectedRecords.push(record);
                    }
                }
            }
            

            return selectedRecords;
        }

        sortData(colName: string, ascending: boolean)
        {
            var colType = this._dataFrame.getColType(colName);

            this._dataFrame.sortVectors(colName, ascending, colType);
            this.onDataChanged("sortOrder");
        }

        resetFilter()
        {
            var filter = this.getFilteredVector(true);
            vector.clear(filter);

            this.computeFilteredCount();
            this.onDataChanged("filtered");
            this.onDataChanged("filterReset");

            //---- this is no longer done in resetFilter ----
            //this.clearSelection();
        }

        clearSelection(omitNotify?: boolean)
        {
            var select = this.getSelectedVector(true);
            vector.clear(select);

            if (!omitNotify)
            {
                this.onSelectionChanged();
            }
        }

        onSelectionChanged(changeSource = "local")
        {
            this.computeSelectedCount();
            this.onDataChanged("selection");

            var select = this.getSelectedVector(false);

            if (changeSource === "local")
            {
                var selectedPrimaryKeys = this._dataFrame.vectorToPrimaryKeys(select);
                this._shareMgr.setSelection(selectedPrimaryKeys);
            }
        }

        getSelectedCount(applyFilter?: boolean)
        {
            var count = this._selectedCount;

            if (applyFilter && this._recordCount !== this._filteredInCount)
            {
                var select = this.getFilteredInVector(selectedName);
                count = vector.countOn(select);
            }

            return count;
        }

        getFilteredInCount()
        {
            return this._filteredInCount;
        }

        getKnownData()
        {
            return this._preloadMgr.getPreloads();
        }

        getPreloadMgr()
        {
            return this._preloadMgr;
        }
    }
}
 