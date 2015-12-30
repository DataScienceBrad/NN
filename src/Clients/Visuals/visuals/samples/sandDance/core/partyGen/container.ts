//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    container.ts - layout class that manages a set of sub-containers or shapes.
//-------------------------------------------------------------------------------------
//var mediumSales: any[];

/// <reference path="../_references.ts" />

module beachParty
{
    export class Container
    {
        level: number;
        inputData: DataFrameClass;
        childData: FrameOrArrayClass;   
        children: Container[];
        statType: StatType = null;
        statColName = "";
        name: string;
        binMap: any;
        shapeData: DataFrameClass;

        constructor(data: DataFrameClass, level: number, binMap?: any)
        {
            this.inputData = data;
            this.childData = new FrameOrArrayClass(data, data._groupName);
            this.name = data._groupName;

            this.children = [];
            this.level = level;
            this.binMap = (binMap) ? binMap : {};

            //---- add my binInfo to binMap ----
            if (data._groupColName)
            {
                this.binMap = vp.utils.copyMap(this.binMap);
                this.binMap[data._groupColName] = data._groupName;
            }
        }

        binAndGen(dividers: ChartDivider[])
        {
            var divideLevel = this.level;

            if (divideLevel < dividers.length)
            {
                var dataDivider = <DataDivider> dividers[divideLevel].dd;
                //var spaceDivider = <SpaceDivider> dividers[divideLevel].sd;

                //---- divide the DATA ----
                var dataGroups = dataDivider.divide(this.inputData);
                if (dataGroups)
                {
                    //---- data was BINNED ----
                    this.childData = new FrameOrArrayClass(dataGroups, this.inputData._groupName);

                    if (divideLevel !== dividers.length - 1)
                    {
                        //---- not at leaf, so create subContainers ----
                        var childLevel = divideLevel + 1;

                        //---- create child containers for each data group ----
                        for (var i = 0; i < dataGroups.length; i++)
                        {
                            var childData = dataGroups[i];

                            var child = new Container(childData, childLevel, this.binMap);
                            this.children.push(child);

                            if (true)       // !assignShapes)
                            {
                                //---- use next set of dividers on this ----
                                child.binAndGen(dividers);
                            }
                        }
                    }
                }
            }
        }

        measure(dividers: ChartDivider[])
        {
            var scaleData = new ScaleData();

            if (dividers && dividers.length)
            {
                var divider = dividers[this.level];
                var spaceDivider = divider.sd;

                var xStat = spaceDivider.xStat;
                var yStat = spaceDivider.yStat;

                if (this.children.length === 0)
                {
                    //---- process LEAF container ----
                    var data = this.childData;

                    scaleData.minCount = data.length;
                    scaleData.maxCount = data.length;

                    if (xStat.colName)
                    {
                        var vector = data.getNumericVectorFromStat(xStat).values;
                        scaleData.xMin = vector.min();
                        scaleData.xMax = vector.max();
                    }

                    if (yStat.colName)
                    {
                        var vector = data.getNumericVectorFromStat(yStat).values;
                        scaleData.yMin = vector.min();
                        scaleData.yMax = vector.max();
                    }

                    var shapeData = this.aggOrCopy(this.childData, divider);
                    this.shapeData = shapeData;

                    scaleData.allLeafData = shapeData;
                }
                else
                {
                    //---- process INNER container ----
                    for (var i = 0; i < this.children.length; i++)
                    {
                        var child = this.children[i];

                        var results = child.measure(dividers);

                        var sd = results.scaleData;

                        if (i === 0)
                        {
                            scaleData = sd;
                        }
                        else
                        {
                            scaleData.minCount = Math.min(scaleData.minCount, sd.minCount);
                            scaleData.maxCount = Math.max(scaleData.maxCount, sd.maxCount);

                            scaleData.xMin = Math.min(scaleData.xMin, sd.xMin);
                            scaleData.xMax = Math.max(scaleData.xMax, sd.xMax);

                            scaleData.yMin = Math.min(scaleData.yMin, sd.yMin);
                            scaleData.yMax = Math.max(scaleData.yMax, sd.yMax);

                            if (scaleData.allLeafData)
                            {
                                var dataCopy = scaleData.allLeafData.copyData();
                                dataCopy.append(sd.allLeafData);

                                scaleData.allLeafData = dataCopy;
                            }
                            else
                            {
                                scaleData.allLeafData = sd.allLeafData;
                            }
                        }
                    }
                }
            }

            return { scaleData: scaleData };
        }

        layout(dividers: ChartDivider[], cellData: CellData, scaleData: ScaleData, svg, leafRcArray?: any[])
        {
            var primaryShapeSize = null;
            if (dividers && dividers.length)
            {
                var div0 = dividers[0];
                if (div0.shapeLayers && div0.shapeLayers.length)
                {
                    primaryShapeSize = div0.shapeLayers[0].shapeSize;
                }
            }

            if (this.level < dividers.length)
            {
                var divider = dividers[this.level];
                var spaceDivider = divider.sd;

                //---- divide the SPACE ----
                var cellArray = spaceDivider.divide(cellData, this.name, this.childData, primaryShapeSize, scaleData, svg);

                //---- call LAYOUT for children, if any ----
                for (var i = 0; i < this.children.length; i++)
                {
                    var child = this.children[i];
                    var cdChild = cellArray[i];

                    if (child && cdChild)
                    {
                        child.layout(dividers, cdChild, scaleData, svg, leafRcArray);
                    }
                }

                //---- for last divider PAIR, assign shapes ----
                if (this.level === dividers.length - 1)
                {
                    //---- ASSIGN SHAPES ----
                    if (leafRcArray)
                    {
                        for (var i = 0; i < cellArray.length; i++)
                        {
                            var cellData = cellArray[i];
                            leafRcArray.push(cellData);
                        }
                    }
                }

                //---- render each layer of shapes ----
                var shapeMakers = divider.shapeLayers;

                for (var i = 0; i < shapeMakers.length; i++)
                {
                    var shapeMaker = shapeMakers[i];
                    shapeMaker.generate(cellArray, this.shapeData, scaleData.allLeafData);
                }
            }
        }

        addAggColumn(df: DataFrameClass, record: any, stat: StatInfo, colName?: string, statType?: StatType)
        {
            if (!stat)
            {
                stat = new StatInfo(colName, statType);
            }

            if (stat.colName)
            {
                if (true)       // df.getColType(shapeMaker.strokeColorMapping.colName) != "string")
                {
                    var aggColName = stat.getAggColName();

                    if (record[aggColName] === undefined && record[stat.colName] === undefined)        // not yet added
                    {
                        var value = df.aggData(stat);
                        record[aggColName] = value;
                    }
                }
            }
        }

        aggOrCopy(anyData: FrameOrArrayClass, divider: ChartDivider)
        {
            var newData: DataFrameClass = null;

            if (anyData.single)
            {
                newData = anyData.single.copyData();
            }
            else
            {
                var dfa = anyData.array;
                var records = [];
                var sd = divider.sd;

                //---- process each group of data into record ----
                for (var i = 0; i < dfa.length; i++)
                {
                    //---- create an aggregated record ----
                    var record: any = {};
                    var df = dfa[i];
                    var value = null;

                    //---- add each col of binColumns ----
                    var keys = vp.utils.keys(this.binMap);

                    for (var b = 0; b < keys.length; b++)
                    {
                        var colName = keys[b];
                        value = this.binMap[colName];

                        record[colName] = value;
                    }

                    //---- add my binCol and value ----
                    var colName = df._groupColName;
                    value = df._groupName;
                    record[colName] = value;

                    //---- for the X, Y, and Color columns, if they are not category columns, we aggregate their data ----
                    //---- and add the colName/value to the aggregate record. ----

                    this.addAggColumn(df, record, sd.xStat);
                    this.addAggColumn(df, record, sd.yStat);

                    //---- add COLOR column, from each shapeMaker ----
                    var shapeMakers = divider.shapeLayers;

                    for (var s = 0; s < shapeMakers.length; s++)
                    {
                        var shapeMaker = shapeMakers[s];

                        this.addAggColumn(df, record, null, shapeMaker.fillColorMapping.colName, shapeMaker.fillColorStat);
                        this.addAggColumn(df, record, null, shapeMaker.strokeColorMapping.colName, shapeMaker.strokeColorStat);

                    }

                    records.push(record);
                }

                newData = DataFrameClass.jsonToDataFrame(records);
            }

            return newData;
        }
    }

    export class ScaleData
    {
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;

        minCount: number;
        maxCount: number;

        allLeafData: DataFrameClass;       // data collected from all leaf nodes (possibly aggregated records) 
    }

    export class ChartDivider
    {
        name: string;
        dd: DataDivider;
        sd: SpaceDivider;
        shapeLayers: ShapeMaker[];

        constructor(svg?: any, dd?: DataDivider, sd?: SpaceDivider, shapeMaker1?: ShapeMaker, shapeMaker2?: ShapeMaker)
        {
            this.dd = dd || new DataDivider();
            this.sd = sd || new SpaceDivider();

            shapeMaker1 = shapeMaker1 || new ShapeMaker(svg, ShapeType.rectangle);
            shapeMaker2 = shapeMaker2 || new ShapeMaker(svg, ShapeType.none);

            this.shapeLayers = [shapeMaker1, shapeMaker2];
        }
    }

}
 