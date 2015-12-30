//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataDivider.ts - divides data into groups.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class DataDivider
    {
        colName: string;
        groupingType: GroupingType;
        aggregateType: AggregateType;
        groupCount: number;
        groupSorting: bps.BinSorting;
        isCategoryCol: boolean;

        constructor(colName = "", groupCount = 5, groupingType = GroupingType.bin, aggregateType = AggregateType.none,  groupSorting = bps.BinSorting.none)
        {
            this.colName = colName;
            this.groupingType = groupingType;
            this.aggregateType = aggregateType;
            this.groupCount = groupCount;
            this.groupSorting = groupSorting;
        }

        divide(dataFrame: DataFrameClass): DataFrameClass[]
        {
            var newData = null;       // default output

            //vp.utils.debug("dataDivider.divide: orig data.length=" + data.length);

            if (this.colName && this.groupingType !== GroupingType.none && dataFrame.getRecordCount())
            {
                if (this.groupingType === GroupingType.bin)
                {
                    var requestedBins = this.groupCount;

                    var sortOptions = new beachParty.BinSortOptionsClass();
                    sortOptions.sortDirection = this.groupSorting;
                    sortOptions.sortByAggregateType = "count";

                    //---- create a NamedVector object for binHelper ----
                    var nv = new NamedVectors(dataFrame.getRecordCount());
                    nv.x = dataFrame.getNumericVector(this.colName);

                    var binResults = beachParty.BinHelper.createBins(nv, "x", requestedBins, requestedBins,
                        false, true, true, sortOptions, null, false);
                    var bins = binResults.bins;

                    newData = bins.map((bin) =>
                    {
                        var group = dataFrame.copyData(bin.rowIndexes);
                        group._groupName = bin.name;
                        group._groupColName = this.colName;

                        return group;
                    });
                }
            }

            return newData;
        }

    }

    export enum GroupingType
    {
        none,
        bin,
        multiBin,
    }

    export enum AggregateType
    {
        none,
        count,
        sum,
    }
}