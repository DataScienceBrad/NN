//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    frameOrArray.ts - encapsulates an array of dataFrameClass or a single instance.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export class frameOrArrayClass
    {
        array: dataFrameClass[];
        single: dataFrameClass;
        length: number;
        name: string;

        constructor(data: any, name: string)
        {
            if (vp.utils.isArray(data))
            {
                this.array = data;
                this.length = data.length;
            }
            else if (data.getVector)
            {
                this.single = data;
                this.length = this.single.getRecordCount();
            }
            else 
            {
                throw "Error: not a dataFrame or an Array";
            }

            this.name = name;
        }

        slice(from: number, to: number): frameOrArrayClass
        {
            var value = null;

            if (this.array)
            {
                value = this.array.slice(from, to);
            }
            else
            {
                value = this.single.copyData(vp.data.range(from, to));
            }

            var foa = new frameOrArrayClass(value, this.name);
            return foa;
        }

        getItem(index: number)
        {
            var item = null;

            if (this.array)
            {
                item = this.array[index];
            }
            else if (this.single)
            {
                item = this.single.getRecordByVectorIndex(index);
            }

            return item;
        }

        getVector(colName: string, countIfArray?: boolean): any[]
        {
            var vector = null;

            if (this.single)
            {
                vector = this.single.getVector(colName, false);
            }
            else
            {
                //---- array of dataFrames ----
                if (this.array.length)
                {
                    //---- ensure colName exists on first dataFrame ----
                    var firstDf = this.array[0];

                    if (firstDf._groupColName == colName)
                    {
                        vector = this.array.map((df) =>
                        {
                            return df._groupName;
                        });
                    }
                    else if (countIfArray)
                    {

                        if (firstDf.getVector(colName, false))
                        {
                            vector = this.array.map((df) =>
                            {
                                return df.getRecordCount();
                            });
                        }
                    }
                }
            }

            return vector;
        } 

        getNumericVectorFromStat(statInfo: StatInfo, countIfArray?: boolean): NumericVector
        {
            var numVector: NumericVector = null;
            var colName = statInfo.colName;

            if (colName || statInfo.statType == StatType.count)
            {
                var aggColName = statInfo.getAggColName();

                if (this.single)
                {
                    if (this.single.isColumnName(aggColName))
                    {
                        colName = aggColName;
                    }

                    if (statInfo.statType == StatType.count)
                    {
                        var vector = vp.data.dataRepeat(1, this.single.getRecordCount());
                        numVector = new NumericVector(vector, "Count@", "number");
                    }
                    else
                    {
                        numVector = this.single.getNumericVector(colName);
                    }
                }
                else
                {
                    vector = [];

                    for (var i = 0; i < this.array.length; i++)
                    {
                        var df = this.array[i];
                        var value = df.aggData(statInfo);
                        vector.push(value);
                    }

                    numVector = new NumericVector(vector, "aggColName", "number");
                }
            }

            return numVector;
        } 

        map(callback)
        {
            var value = null;

            if (this.array)
            {
                value = this.array.map(callback);
            }
            else
            {
                var firstName = this.single.getNames()[0];
                var firstVector = this.single.getVector(firstName, false);

                value = firstVector.map(callback);
            }

            return value;
        }
    }
}
 