/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    var d3 = (<any>window).d3;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects)
                return defaultValue;

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object = <DataViewObject>objects[objectName];
                return object;
            }
            else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map = <DataViewObjectMap>objects[objectName];
                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill = getValue(objects, propertyId);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object)
                return defaultValue;

            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined)
                return defaultValue;

            return propertyValue;
        }
    }


    //enum settings
    interface labelSettings {
        show: boolean;
        color: string;
        fontSize: number;
        displayUnits: number;
        decimalPlaces: number;
    }

    interface titleSettings {

        color: string;
        fontSize: number;

    }

    interface rectanglecolor {
        color: string;
    }

    interface linkcolor {
        color: string;
    }
     interface circlecolor {
        color: string;
        color2: string;
        Border: number;
    }
    export var chartProperties = {

        labels:
        {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'displayUnits' },
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
        },
        title:
        {
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'fontSize' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'title', propertyName: 'color' },
        },
        rectcolor:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: ' rectcolor', propertyName: 'color' },
        },
        linkcolr:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: ' linkcolr', propertyName: 'color' },
        },
       circlecolr:
        {
            color: <DataViewObjectPropertyIdentifier>{ objectName: ' circlecolr', propertyName: 'color' },
            color2: <DataViewObjectPropertyIdentifier>{ objectName: ' circlecolr', propertyName: 'color2' },
            Border: <DataViewObjectPropertyIdentifier>{ objectName: 'circlecolr', propertyName: 'Border' },
        }
    }

    var d3 = (<any>window).d3;

    interface journeyData {
        objects: Array<objects>,
    }
    interface objects {
        key: string,
        size: number,
        children: any
    }
    interface nodes {
        id: string,
        group: string,
        description: string,
        program: string,
        name: string,
        numberofleads: number,
        percentage: number,
        color: string
    }
    interface links {
        source: string,
        target: string,
        value: number,
        Activity: string;
    }

    interface rootSettings {
        text: string;
        color: string;
    }


    export class Visual implements IVisual {

        public Data: objects;
        private target: HTMLElement;
        private updateCount: number;
        private treeData: any;
        private treedata: any;
        private treedatasub: any;
        private FinalTree: any;
        private margin: any;
        private svg: any;
        private data: objects;
        private viewport: IViewport;
        private measuresData;
        private totalRowsLength: number;
        private measureValues;
        private noOflevels: number;
        private numberOfMeasures: number;
        public host: IVisualHost;
        private svgLegend: any;
        private colors: any;
        private finaldata: any;
        private currentViewport: IViewport;
        private dataViews: DataView;
        private totalValues: number;
        private catLength: number;
        private idGen: number;
        private measureIdGen: number;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private minXView: number;
        private minYView: number;
        private width: number;
        private height: number;
        private formatString: string;
        private measureData: DataViewValueColumns;
        private maxNodeCount: any;
        private updateparam: any;
        private rootDiv: d3.Selection<SVGElement>;

        public getDefaultData(): objects {
            return {
                key: "",
                size: 0,
                children: []
            }
        }

        public getDividerIndex(mainString, iteration, divider): number {
            var index: number = 0;
            var occurences: number = 0;

            while (index != -1) {

                index = mainString.indexOf(divider, index);

                if (index != -1) {
                    occurences++;
                    if (occurences == iteration) {
                        return index;
                    }
                    index += divider.length;
                }
            }
            return index;
        }

        public getDistinctElements(val, i, self) {
            return self.indexOf(val) === i;
        }

        public calAggregate(combinedID: string, totalValues: number): number {
            var sum: number = 0;
            if (combinedID != 'none') {
                var hierarchyArray = combinedID.split('***');
                var level = hierarchyArray.length - 1;
                var counter;
                for (var iRow = 0; iRow < totalValues; iRow++) {
                    counter = 0;
                    for (var iLevel = 0; iLevel <= level; iLevel++) {
                        if (this.dataViews
                            && this.dataViews.categorical
                            && this.dataViews.categorical.categories
                            && this.dataViews.categorical.categories[iLevel]
                            && this.dataViews.categorical.categories[iLevel].values) {
                            let catData = this.dataViews.categorical.categories[iLevel].values[iRow] ? this.dataViews.categorical.categories[iLevel].values[iRow] : "(blank)";
                            if (catData == hierarchyArray[iLevel]) {
                                counter += 1;
                                if (counter == level + 1) {
                                    sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                                }
                            }
                        }
                    }
                }
                return sum;
            }
            else {
                for (var iRow = 0; iRow < totalValues; iRow++) {
                    sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                }
                return sum;
            }
        }

        public calNodesNLinks(data, catDataset, combinedID, level, parentId, parentSum) {
            //   ;
            if (!catDataset[level]) {
                var splitId = combinedID.split('***');
                for (var iRow = 0; iRow < this.totalValues; iRow++) {
                    cnt = 0;
                    for (var cat = 0; cat < level; cat++) {
                        if (catDataset && catDataset[cat] && catDataset[cat].values) {
                            let catData = catDataset[cat].values[iRow] ? catDataset[cat].values[iRow] : "(blank)";
                            if (catData === splitId[cat]) {
                                cnt += 1;
                                if (cnt === level - 1) {
                                    if (catDataset[level - 1] && catDataset[level - 1].values) {
                                        data.children.push(
                                            {
                                                key: catDataset[level - 1].values[iRow] ? catDataset[level - 1].values[iRow] : "(blank)",
                                                size: this.measureData[0].values[iRow],
                                            }
                                        )
                                    }
                                } //end if cnt == level
                            } //end if catDataset[cat].values[iRow] == splitId[cat]
                        }
                    } //end for cat
                } // end for iRow
                // } //end if this.measureData.length > 1
                return 0;
            } // end if !catDataset[level]
            else {
                var uniqueElements;
                var splitId = combinedID.split('***');
                if (combinedID !== "") {
                    var filteredData = [];
                    var cnt;
                    for (var iRow = 0; iRow < this.totalValues; iRow++) {
                        cnt = 0;
                        for (var cat = 0; cat < level; cat++) {
                            if (catDataset && catDataset[cat] && catDataset[cat].values) {
                                let catData = catDataset[cat].values[iRow] ? catDataset[cat].values[iRow] : "(blank)";
                                if (catData === splitId[cat]) {
                                    cnt += 1;
                                    if (cnt === level - 1) {
                                        if (catDataset[level - 1] && catDataset[level - 1].values) {
                                            let catVal = catDataset[level - 1].values[iRow] ? catDataset[level - 1].values[iRow] : "(blank)";
                                            filteredData.push(catVal);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    uniqueElements = filteredData.filter(this.getDistinctElements);
                }
                else {
                    uniqueElements = catDataset[0].values.filter(this.getDistinctElements);
                }
                var This = this;
                uniqueElements.forEach(function (element, index) {
                    var newCombinedID;
                    var newId = (This.idGen++).toString();
                    if (level == 1) {
                        newCombinedID = element.toString();
                    } else {
                        newCombinedID = combinedID + '***' + element;
                    }
                    var calNumberOfLeads = This.calAggregate(newCombinedID, This.totalValues);
                    data.children.push(
                        {
                            key: element,
                            size: calNumberOfLeads,
                            children: []
                        }
                    )
                    This.calNodesNLinks(data.children[index], catDataset, newCombinedID, level + 1, newId, calNumberOfLeads)
                });
            }
        }


        public converter(dataView: DataView, colors: any, host: IVisualHost, rootSettings: rootSettings): objects {
            var data: objects = this.getDefaultData();

            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0
                && dataView.categorical.values && dataView.categorical.values.length > 0) {
                this.totalValues = dataView.categorical.values[0].values.length;
                this.catLength = dataView.categorical.categories[0].values.filter(this.getDistinctElements).length;
                this.idGen = 1;
                this.measureIdGen = 10000000;
                this.measureData = dataView.categorical.values;
                var arrIDs: Array<number> = [],
                    arrCombinedIDs: Array<string> = [],
                    arrLevel: Array<number> = [],
                    divider: string = "***",
                    combinedID: string = "",
                    category: string = "",
                    catData: DataViewCategoricalColumn[] = dataView.categorical.categories,
                    catLength: number = dataView.categorical.categories.length,
                    rootNode: string = "",
                    totalValues: number = dataView.categorical.categories[0].values.length,
                    rootNodeIndex: number = 0;
                var arrCategoriesMapping: Array<number> = [];
                this.formatString = dataView.categorical.values[0].source.format;

                // Level 0 mappings
                var rootSum = this.calAggregate('none', totalValues);

                var rootText = rootSettings.text;
                var rootTextProperties: TextProperties = {
                    text: rootText,
                    fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                    fontSize: "15px"
                };
                this.Data = data;//data.objects;
                this.calNodesNLinks(data, catData, "", 1, 0, rootSum);
                return data;
            }

            return data;
        }

        constructor(options: VisualConstructorOptions) {

            this.target = options.element;
            this.updateCount = 0;

            this.maxNodeCount = 0;

            this.rootDiv = d3.select(options.element)
                .append('div')
                .classed('rootDiv', true)

            this.svg = this.rootDiv.append("svg").style("z-index", "5").style("padding-left", "60px")
                .style("padding-top", "30px")
                .style("padding-bottom", "10px")

        }

        ///slice default load acc to the current node///
        public override(d, labelSettings, dataView): any {

            var Expand = [];
            if (d) {
                if (d.depth == 1) {
                  
                    Expand = this.onClick(d, dataView);
                    // console.log(Expand);
                    this.UpdateDefaultView(Expand, dataView, labelSettings)
                }
                if (d.depth == 2) {
                    Expand = this.onClick(d, dataView);
                    this.UpdateDefaultView(Expand, dataView, labelSettings)
                }
                if (d.depth == 3) {
                    Expand = this.onClick(d, dataView);
                    this.UpdateDefaultView(Expand, dataView, labelSettings)
                }
                if (d.depth == 4) {
                    Expand = this.onClick(d, dataView);
                    this.UpdateDefaultView(Expand, dataView, labelSettings)
                }

            }

        }

        //collapse slice
        public collapseoverride(d, labelSettings, dataView, circlecolor, options): any {
            var collapse = [];
            if (d) {
                if (d.depth == 1) {
                    this.svg.selectAll(".default").remove()
                    setTimeout(() => this.DefaultView(dataView, circlecolor, labelSettings, options), 400)
                }
                if (d.depth == 2) {
                    collapse = this.onClick(d, dataView);
                    this.UpdateDefaultView(collapse, dataView, labelSettings)
                }
                if (d.depth == 3) {
                    collapse = this.onClick(d, dataView);
                    this.UpdateDefaultView(collapse, dataView, labelSettings)
                }
                if (d.depth == 4) {
                    collapse = this.onClick(d, dataView);
                    this.UpdateDefaultView(collapse, dataView, labelSettings)
                }
                if (d.depth == 5) {
                    collapse = this.onClick(d, dataView);
                    this.UpdateDefaultView(collapse, dataView, labelSettings)
                }

            }
        }

        public convertToString(str: any): string {
            if (str) {
                return str.toString();
            } else {
                return "";
            }
        }

        public onClick(d, dataView) {

            var da = this.distinctArray(dataView);
            var onClick = [];
            var z = 0;

            if (d) {
                if (d.children) {
                    z = d.depth + 2;
                } else {
                    z = d.depth + 1;
                }

                for (var l = 0; l < da.length; l++) {

                    if ((l + z) < this.dataViews.categorical.categories.length) {

                        for (var i = 0; i < da[d.depth].values.length; i++) {

                            if (d.key === da[d.depth].values[i]) {

                                for (var j = 0; j < da[l + z].values.length; j++) {
                                    var sum = 0;
                                    if (da[l + z].values[j] === null) {
                                        da[l + z].values[j] = "(blank)"
                                    }

                                    for (var k = 0; k < this.dataViews.categorical.categories[0].values.length; k++) {

                                        if (this.dataViews.categorical.categories[l + z].values[k] === da[l + z].values[j] && this.dataViews.categorical.categories[(d.depth)].values[k] == d.key)
                                            sum += parseInt((this.measureData[0].values[k]).toString())
                                    }
                                    onClick.push(
                                        {
                                            name: da[l + z].values[j],
                                            size: sum,
                                            id: l + z
                                        }
                                    )
                                }

                            }

                        }

                    }
                }

            }

            return onClick;

        }

        public UpdateDefaultView(object, dataView, labelSettings) {

            var obj = object;
            var da = this.distinctArray(dataView);


            for (var j = 3; j < da.length; j++) {

                for (var k = 0; k < da[j].values.length; k++) {

                    var c = 0;
                    for (var i = 0; i < obj.length; i++) {

                        if (j === obj[i].id) {

                            $("#depth" + j + "size" + c).delay(400)
                                // .text(obj[i].size)
                                .text(function (d) {
                                    var displayUnits: number = labelSettings.displayUnits;
                                    let primaryFormatterVal = 0;
                                    if (labelSettings.displayUnits === 0) {
                                        let alternateFormatter = parseInt(obj[i].size, 10).toString().length;
                                        if (alternateFormatter > 9) {
                                            primaryFormatterVal = 1e9;
                                        } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                            primaryFormatterVal = 1e6;
                                        } else if (alternateFormatter <= 6 && alternateFormatter > 3) {
                                            primaryFormatterVal = 1e3;
                                        } else {
                                            primaryFormatterVal = 10;
                                        }
                                    }

                                    let formatter = ValueFormatter.create({
                                        value: labelSettings.displayUnits === 0 ? primaryFormatterVal : labelSettings.displayUnits,
                                        precision: labelSettings.decimalPlaces,
                                    });

                                    let formattedValue = formatter.format(obj[i].size);

                                    let textProps: TextProperties = {
                                        fontSize: labelSettings.fontSize + "px",
                                        fontFamily: "Segoe UI",
                                        text: formattedValue,
                                    }
                                    let updatedSizeText = textMeasurementService.getTailoredTextOrDefault(textProps, 45);

                                    let finalText = updatedSizeText;

                                    return finalText;
                                })
                                .attr("fill", labelSettings.color)
                                .attr("font-size", labelSettings.fontSize + 'px')

                            this.svg.select("#depth" + j + "size" + c)
                                .append("title")
                                .text(function (d) { return da[j].values[c] + " " + obj[i].size; })
                            c++;
                        }

                    }
                }
            }

        }

        public distinctArray(dataView) {

            var dataview = dataView
            var distinctarray = [];

            for (var i = 0; i < dataview.categorical.categories.length; i++) {
                var tempk = [];
                var sumk = [];
                tempk = dataview.categorical.categories[i].values.filter(this.getDistinctElements)
                for (var k = 0; k < tempk.length; k++) {
                    var sum = 0;
                    for (var j = 0; j < dataview.categorical.categories[i].values.length; j++) {
                        if (tempk[k] == this.dataViews.categorical.categories[i].values[j]) {

                            sum += parseInt((this.measureData[0].values[j]).toString())
                        }

                    }
                    sumk.push(
                        {
                            size: sum
                        }
                    )
                }
                distinctarray.push(
                    {
                        values: tempk,
                        size: sumk
                    }
                )
            }

            return distinctarray
        }

        public DefaultView(dataView, circlecolor, labelSettings, options) {
            var da = this.distinctArray(dataView);

            var x = 315
            var h = options.viewport.height

            for (var j = 2; j < da.length; j++) {
                var y = 50//h / da[j].values.length
                for (var k = 0; k < da[j].values.length; k++) {
                    this.svg.
                        append("circle")
                        .attr("r", 12)
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("id", "rect" + j + "circle" + k)
                        .attr("class", "default depth" + j)
                        .style("fill", circlecolor.color)

                    this.svg.
                        append("text")
                        .attr("x", x + 20)
                        .attr("y", y + 5)
                        .attr("class", "default depth" + j)
                        .attr("id", "depth" + j + "Name" + k)
                        // .text(da[j].values[k])
                        .text(function (d) {
                            let textProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: da[j].values[k],
                            }
                            let updatedText = textMeasurementService.getTailoredTextOrDefault(textProps, 90);
                            let finalText = updatedText;
                            let arr = updatedText.split(" ");
                            if (updatedText.indexOf("...") > -1 && arr.length > 1) {
                                finalText = "";
                                arr.forEach(function (element, index) {

                                    if (!(element.indexOf("...") > -1)) {
                                        if (index === 0) {
                                            finalText += element;
                                        } else {
                                            finalText += " " + element;
                                        }

                                    } else if (element.indexOf("...") > -1 && element === "...") {
                                        finalText += "...";
                                    }
                                });
                            }
                            return finalText;
                        })
                        .style("fill", labelSettings.color)
                        .style("font-size", labelSettings.fontSize)
                        .append("title")
                        .text(da[j].values[k])

                    let textProperties: TextProperties = {
                        fontSize: labelSettings.fontSize + "px",
                        fontFamily: "Segoe UI",
                        text: "text",
                    }



                    let heightOfText = textMeasurementService.measureSvgTextHeight(textProperties);

                    this.svg.
                        append("text")
                        .attr("x", x + 20)
                        .attr("y", heightOfText + y + 10)
                        .attr("class", "default depth" + j)
                        .attr("id", "depth" + j + "size" + k)
                        .text(function (d) {
                            var displayUnits: number = labelSettings.displayUnits;
                            let primaryFormatterVal = 0;
                            if (labelSettings.displayUnits === 0) {
                                let alternateFormatter = parseInt(da[j].size[k].size, 10).toString().length;
                                if (alternateFormatter > 9) {
                                    primaryFormatterVal = 1e9;
                                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                    primaryFormatterVal = 1e6;
                                } else if (alternateFormatter <= 6 && alternateFormatter > 3) {
                                    primaryFormatterVal = 1e3;
                                } else {
                                    primaryFormatterVal = 10;
                                }
                            }

                            let formatter = ValueFormatter.create({
                                value: labelSettings.displayUnits === 0 ? primaryFormatterVal : labelSettings.displayUnits,
                                precision: labelSettings.decimalPlaces,
                            });

                            let formattedValue = formatter.format(da[j].size[k].size);

                            let textProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: formattedValue,
                            }
                            let updatedSizeText = textMeasurementService.getTailoredTextOrDefault(textProps, 75);

                            let keyTextProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: da[j].values[k],
                            }
                            let updatedKeyText = textMeasurementService.getTailoredTextOrDefault(keyTextProps, 90);
                            let finalText = updatedSizeText;
                            let arr = updatedKeyText.split(" ");
                            if (updatedKeyText.indexOf("...") > -1 && arr.length > 1) {
                                finalText = "";
                                arr.forEach(function (element) {
                                    if (element.indexOf("...") > -1 && element !== "...") {
                                        keyTextProps.text = element;
                                        let updatedKeyText2 = textMeasurementService.getTailoredTextOrDefault(keyTextProps, 75);
                                        finalText += updatedKeyText2;
                                    }
                                });
                                if (finalText.length) {
                                    finalText = finalText + updatedSizeText;
                                } else {
                                    finalText = updatedSizeText;
                                }
                            }
                            return finalText;
                        })
                        .style("fill", labelSettings.color)
                        .style("font-size", labelSettings.fontSize)
                        .append("title")
                        .text(function (d) { return da[j].values[k] + " " + da[j].size[k].size; });

                    y = y + 100;
                }
                x = x + 170;
            }

        }

        public update(options: VisualUpdateOptions) {

            this.updateparam = options;
            var dataView: DataView;
            this.dataViews = dataView = options.dataViews[0];
            var rootSettings: rootSettings = this.getRootSettings(this.dataViews);
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var titleSettings: titleSettings = this.gettitleSettings(this.dataViews);
            var rectanglecolor: rectanglecolor = this.getrectcolor(this.dataViews);
            var linkcolor: linkcolor = this.getlinkcolor(this.dataViews);
            var circlecolor: circlecolor = this.getcirclecolor(this.dataViews);
            var This = this;
            this.data = this.converter(dataView, this.colors, this.host, rootSettings);
            this.svg.selectAll("*").remove();

            var x = -50,
                w = //options.viewport.width/this.dataViews.categorical.categories.length+ 'px' 
                    "160px",
                height = options.viewport.height
            for (var i = 0; i < this.dataViews.categorical.categories.length; i++) {


                this.svg.append("text")
                    .text(this.dataViews.categorical.categories[i].source.displayName)
                    .attr("x", x + 25)
                    .attr("y", 10)
                    .style("fill", titleSettings.color)
                    .style("font-size", titleSettings.fontSize)

                this.svg.append("rect")
                    .attr("x", x)
                    .attr("y", 30)
                    .attr("width", w)
                    .attr("height", height)
                    .attr("id", "rect" + i)
                    .attr("class", "rectdepth" + i)
                    .style("fill", rectanglecolor.color)
                    .style("position", "absolute");
                x = x + 170;
            }

            this.DefaultView(dataView, circlecolor, labelSettings, options);

            function updateoverride(d) {

                This.override(d, labelSettings, dataView);
            }

            function updatecollapseoverride(d) {

                This.collapseoverride(d, labelSettings, dataView, circlecolor, options);
            }
            

            var rootName = this.convertToString(this.dataViews.categorical.categories[0].values[0]);

            var finalobject = {
                key: "",
                children: [{}
                ],
                size: 0,
                currlevel: 0
            };

            var margin = null;

            this.margin = margin = { top: 0, right: 0, bottom: 20, left: 30 };

            var width = options.viewport.width,
                height = options.viewport.height;
            //var width = options.viewport.width;

            this.rootDiv = this.rootDiv
                .style("width", width + 'px')
                .style("height", height + 'px')

            var i = 0,
                duration = 750,
                root;

            var edge_weight = d3.scale.linear()
                .domain([0, 100])
                .range([2, 50]);

            var diagonal = d3.svg.diagonal()
                .projection(function (d) { return [d.y, d.x]; });

            var svgwidth = 1150
            this.svg = this.svg
                .attr("width", svgwidth)
                .attr("height", height - (margin.top + margin.bottom))

                .attr("transform", "translate(" + margin.bottom + "," + margin.top + ")")

            var tree = d3.layout.tree().size([height, svgwidth]);

            // Assigns parent, children, height, depth
            let total_size = this.data && this.data.children && this.data.children[0] && this.data.children[0].size ? this.data.children[0].size : 0;
            edge_weight.domain([0, total_size]);

            root = this.data && this.data.children && this.data.children[0] ? this.data.children[0] : {};
            console.log(root)
            root.x0 = height / 2;
            root.y0 = 0;

            // Collapse after the second level
            root.children.forEach(collapse);
            /*
            * Collapses the node d and all the children nodes of d
            * @param {node} d
            */

            function collapse(d) {

                if (d.children) {
                    d._children = d.children
                    d._children.forEach(function (d1) { d1.parent = d; collapse(d1); });
                    d.children = null
                }

            }

            var This = this;

            updateInternal(root);

            d3.select(self.frameElement).style("height", options.viewport.height + "px");

            function updateInternal(source) {
                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) { d.y = d.depth * 180; });

                // Update the nodes…
                var node = This.svg.selectAll("g.node")
                    .data(nodes, function (d) { return d.id || (d.id = ++i); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                    .on("click", click);

                nodeEnter.append("circle")
                    .attr("r", 12)
                    .attr("cy", 0)
                    .style("fill", function (d) { return d._children ? circlecolor.color : rectanglecolor.color; })
                    .style("stroke",circlecolor.color2)
                    .style("stroke-width", function (d) { return circlecolor.Border > 6 ?   6:circlecolor.Border; })

                if (labelSettings.show) {
                    nodeEnter.append("text")
                        .classed("labelText", true)
                        .attr("x", function (d) { return d.children || d._children ? 20 : 0; })
                        .attr("y", function (d) { return d.children || d._children ? 25 : 25; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
                        .text(function (d) {
                            let textProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: d.key,
                            }
                            //max width is 90 (leaving some space for circles and padding) here because each category width is 180. Needs update if width of each category changes
                            let updatedText = textMeasurementService.getTailoredTextOrDefault(textProps, 90);
                            let finalText = updatedText;
                            let arr = updatedText.split(" ");
                            if (updatedText.indexOf("...") > -1 && arr.length > 1) {
                                finalText = "";
                                arr.forEach(function (element, index) {

                                    if (!(element.indexOf("...") > -1)) {
                                        if (index === 0) {
                                            finalText += element;
                                        } else {
                                            finalText += " " + element;
                                        }

                                    } else if (element.indexOf("...") > -1 && element === "...") {
                                        finalText += "...";
                                    }
                                });
                            }
                            return finalText;
                        })
                        .style("fill-opacity", 1e-6)
                        .style("fill", labelSettings.color)
                        .style("font-size", labelSettings.fontSize + "px")
                        .append("title")
                        .text(function (d) {
                            return d.key + " " + d.size;
                        });

                    let textProperties: TextProperties = {
                        fontSize: labelSettings.fontSize + "px",
                        fontFamily: "Segoe UI",
                        text: "text",
                    }
                    let heightOfText = textMeasurementService.measureSvgTextHeight(textProperties);

                    nodeEnter.append("text")
                        .classed("labelValue", true)
                        .attr("x", function (d) { return d.children || d._children ? 20 : 0; })
                        .attr("y", function (d) { return heightOfText + 25; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
                        .style("font-size", labelSettings.fontSize + "px")
                        .text(function (d) {
                            var displayUnits: number = labelSettings.displayUnits;
                            let primaryFormatterVal = 0;
                            if (labelSettings.displayUnits === 0) {
                                let alternateFormatter = parseInt(d.size, 10).toString().length;
                                if (alternateFormatter > 9) {
                                    primaryFormatterVal = 1e9;
                                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                                    primaryFormatterVal = 1e6;
                                } else if (alternateFormatter <= 6 && alternateFormatter > 3) {
                                    primaryFormatterVal = 1e3;
                                } else {
                                    primaryFormatterVal = 10;
                                }
                            }

                            let formatter = ValueFormatter.create({
                                value: labelSettings.displayUnits === 0 ? primaryFormatterVal : labelSettings.displayUnits,
                                precision: labelSettings.decimalPlaces,
                            });

                            let formattedValue = formatter.format(d.size);

                            let textProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: formattedValue,
                            }

                            let updatedSizeText = textMeasurementService.getTailoredTextOrDefault(textProps, 75);

                            let keyTextProps: TextProperties = {
                                fontSize: labelSettings.fontSize + "px",
                                fontFamily: "Segoe UI",
                                text: d.key,
                            }
                            //max width is 90 (leaving some space for circles and padding) here because each category width is 180. Needs update if width of each category changes
                            let updatedKeyText = textMeasurementService.getTailoredTextOrDefault(keyTextProps, 90);
                            let finalText = updatedSizeText;
                            let arr = updatedKeyText.split(" ");
                            if (updatedKeyText.indexOf("...") > -1 && arr.length > 1) {
                                finalText = "";
                                arr.forEach(function (element) {
                                    if (element.indexOf("...") > -1 && element !== "...") {
                                        keyTextProps.text = element;
                                        let updatedKeyText2 = textMeasurementService.getTailoredTextOrDefault(keyTextProps, 75);
                                        finalText += updatedKeyText2;
                                    }
                                });
                                if (finalText.length) {
                                    finalText = finalText + updatedSizeText;
                                } else {
                                    finalText = updatedSizeText;
                                }
                            }
                            return finalText;
                        })
                        .style("fill", labelSettings.color)
                        .append("title")
                        .text(function (d) { return d.key + " " + d.size; });
                }

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) { return "translate(" + (d.y) + "," + (d.x) + ")"; });

                nodeUpdate.select("circle")
                    .attr("r", 12)//function (d) { return edge_weight(d.size)/2; })
                    .style("fill", function (d) { return d._children ? circlecolor.color : rectanglecolor.color; })
                    .style("stroke",circlecolor.color2)
                    .style("stroke-width", function (d) { return circlecolor.Border > 6 ?   6:circlecolor.Border; })

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) { return "translate(" + (source.y) + "," + source.x + ")"; })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 10) 
                    .style("stroke",circlecolor.color2)
                    .style("stroke-width", function (d) { return circlecolor.Border > 6 ?   6:circlecolor.Border; })

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = This.svg.selectAll("path.link")
                    .data(links, function (d) { return d.target.id; });


                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("stroke-width", function (d) {
                        return 1;
                    })
                    .attr("d", function (d) {
                        var o = { x: source.x0, y: (source.y0) };
                        return diagonal({ source: o, target: o });
                    })
                    .attr("stroke",
                    linkcolor.color)


                // Transition links to their new position.

                link.transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        /* calculating the top shift */
                        var source = { x: (d.source.x - edge_weight(calculateLinkSourcePosition(d))), y: (d.source.y) };
                        var target = { x: (d.target.x), y: (d.target.y) };
                        return diagonal({ source: source, target: target });
                    })
                    .attr("stroke-width", function (d) {
                        return edge_weight(d.target.size / 2);
                    });

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = { x: source.x, y: (source.y) };
                        return diagonal({ source: o, target: o });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d: any) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });


            }
            /**
             * Calculates the source y-axis position of the link.
             * @param {json structure} link
             */
            function calculateLinkSourcePosition(link) {
                var targetID = link.target.id;
                var childrenNumber = link.source.children.length;
                var widthAbove = 0;
                for (var i = 0; i < childrenNumber; i++) {
                    if (link.source.children[i].id == targetID) {
                        // we are done
                        widthAbove = widthAbove + link.source.children[i].size / 30;
                        break;
                    } else {
                        // keep adding
                        widthAbove = widthAbove + link.source.children[i].size / 6
                    }
                }
                return link.source.size / 30 - widthAbove;
            }

            function click(d) {

                debugger;
                if (d.depth > 0 && d.depth < 6) {
                    let arr = d.parent.children;
                    let arrLen = arr.length;
                    for (let j = 0; j < arrLen; j++) {
                        if (arr[j].key !== d.key) {
                            if (arr[j].children) {
                                arr[j]._children = arr[j].children;
                                arr[j].children = null;
                            }
                        }
                    }

                    if (d.children) {

                        d._children = d.children;
                        d.children = null;
                        updatecollapseoverride(d);

                        switch (d.depth) {

                            case 1:
                                $(".depth2").delay(200).fadeIn("slow");
                                $(".depth3").delay(200).fadeIn("slow");
                                $(".depth4").delay(200).fadeIn("slow");
                                $(".depth5").delay(200).fadeIn("slow");
                                $(".depth6").delay(200).fadeIn("slow");
                                This.maxNodeCount = This.maxNodeCount - 5;
                                break;
                            case 2:
                                //$(".depth1").delay(200).fadeIn("slow");
                                $(".depth3").delay(200).fadeIn("slow");
                                $(".depth4").delay(200).fadeIn("slow");
                                $(".depth5").delay(200).fadeIn("slow");
                                $(".depth6").delay(200).fadeIn("slow");
                                This.maxNodeCount = This.maxNodeCount - 4;
                                break;
                            case 3:
                                //$(".depth2").delay(200).fadeIn("slow");
                                $(".depth4").delay(200).fadeIn("slow");
                                $(".depth5").delay(200).fadeIn("slow");
                                $(".depth6").delay(200).fadeIn("slow");
                                This.maxNodeCount = This.maxNodeCount - 3;
                                break;
                            case 4:
                                // $(".depth3").delay(200).fadeIn("slow");
                                $(".depth5").delay(200).fadeIn("slow");
                                $(".depth6").delay(200).fadeIn("slow");
                                This.maxNodeCount = This.maxNodeCount - 2;
                                break;
                            case 5:
                                $(".depth6").delay(200).fadeIn("slow");
                                This.maxNodeCount = This.maxNodeCount - 1;
                                break;
                        }


                    } else {
                        d.children = d._children;
                        d._children = null;

                        for (var i = 0; i < d.children.length; i++) {
                            if (d.children[i].children) {
                                d.children[i]._children = d.children[i].children;
                                d.children[i].children = null;
                            }
                        }

                        updateoverride(d);
                        // Display all the values after clicked node.
                        for (var j = d.depth + 1; j <= 5; j++) {

                            $(".depth" + j).fadeIn("slow");
                        }

                        // Show all Default view till maxNodeCount

                        switch (d.depth) {
                            case 1:
                                //This.maxNodeCount = 1;
                                $(".depth2").fadeOut("slow");
                                break;
                            case 2:
                                //This.maxNodeCount = 2;
                                $(".depth3").fadeOut("slow");
                                break;
                            case 3:
                                //This.maxNodeCount = 3;
                                $(".depth4").fadeOut("slow");
                                break;
                            case 4:
                                //This.maxNodeCount = 4;
                                $(".depth5").fadeOut("slow");
                                break;
                            case 5:
                                //This.maxNodeCount = 5;
                                $(".depth6").fadeOut("slow");
                                break;
                        }

                    }

                    updateInternal(d);

                }
            }

        }

        public getDefaultRootSettings(): rootSettings {
            return {
                text: 'Root',
                color: '#000000',
            }
        }

        public getDefaultLabelSettings(): labelSettings {
            return {
                show: true,
                color: '#fff',
                fontSize: 12,
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        public getDefaulttitleSettings(): titleSettings {
            return {

                color: '#0000',
                fontSize: 16,

            }
        }


        public getDefaultrectcolor(): rectanglecolor {
            return {
                color: '#465262'
            }
        }

        public getDefaultlinkcolor(): linkcolor {
            return {
                color: '#88edd9'
            }
        }

           public getDefaultcirclecolor(): circlecolor {
            return {
                color: '#88EDD9',
                color2: '#FFF',
                Border: 2

            }
        }
        public getLabelSettings(dataView: DataView): labelSettings {
            var objects: DataViewObjects = null;
            var settings: labelSettings = this.getDefaultLabelSettings();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            settings.show = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'show' }, settings.show);
            settings.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'color' }, settings.color);
            settings.fontSize = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' }, settings.fontSize);
            settings.displayUnits = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'displayUnits' }, settings.displayUnits);
            settings.decimalPlaces = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'labelPrecision' }, settings.decimalPlaces);
            return settings;
        }
        public gettitleSettings(dataView: DataView): titleSettings {
            var objects: DataViewObjects = null;
            debugger;
            var settingstitle: titleSettings = this.getDefaulttitleSettings();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settingstitle;
            objects = dataView.metadata.objects;

            settingstitle.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'titleSettings', propertyName: 'color' }, settingstitle.color);
            settingstitle.fontSize = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'titleSettings', propertyName: 'fontSize' }, settingstitle.fontSize);

            return settingstitle;
        }

        public getrectcolor(dataView: DataView): rectanglecolor {
            debugger;
            var objects: DataViewObjects = null;
            var settingsrect: rectanglecolor = this.getDefaultrectcolor();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settingsrect;
            objects = dataView.metadata.objects;
            settingsrect.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'rectanglecolor', propertyName: 'color' }, settingsrect.color);
            return settingsrect;
        }

        public getlinkcolor(dataView: DataView): linkcolor {
            var objects: DataViewObjects = null;
            var settingslink: linkcolor = this.getDefaultlinkcolor();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settingslink;
            objects = dataView.metadata.objects;
            settingslink.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'linkcolor', propertyName: 'color' }, settingslink.color);
            return settingslink;
        }

       public getcirclecolor(dataView: DataView): circlecolor {
            var objects: DataViewObjects = null;
            var settingscircle: circlecolor = this.getDefaultcirclecolor();
            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settingscircle;
            objects = dataView.metadata.objects;
            settingscircle.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'circlecolor', propertyName: 'color' }, settingscircle.color);
            settingscircle.color2 = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'circlecolor', propertyName: 'color2' }, settingscircle.color2);
            settingscircle.Border = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'circlecolor', propertyName: 'Border' }, settingscircle.Border);
            return settingscircle;
        }

        public getRootSettings(dataView: DataView): rootSettings {
            var objects: DataViewObjects = null;
            var settings: rootSettings = this.getDefaultRootSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            settings.text = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'rootSettings', propertyName: 'text' }, settings.text);
            settings.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'rootSettings', propertyName: 'color' }, settings.color);
            return settings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            let objectName = options.objectName;
            var rootSettings: rootSettings = this.getRootSettings(this.dataViews);
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var titleSettings: titleSettings = this.gettitleSettings(this.dataViews);
            var rectanglecolor: rectanglecolor = this.getrectcolor(this.dataViews);
            var linkcolor: linkcolor = this.getlinkcolor(this.dataViews)
            var circlecolor: circlecolor = this.getcirclecolor(this.dataViews)

            debugger;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'rootSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Root Settings',
                        selector: null,
                        properties: {
                            text: rootSettings.text,
                            color: rootSettings.color,
                        }
                    });
                    break;


                case 'labelSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Label Settings',
                        selector: null,
                        properties: {
                            show: labelSettings.show,
                            color: labelSettings.color,
                            fontSize: labelSettings.fontSize,
                            displayUnits: labelSettings.displayUnits,
                            labelPrecision: labelSettings.decimalPlaces,
                        }
                    });
                    break;

                case 'titleSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Title Settings',
                        selector: null,
                        properties: {

                            color: titleSettings.color,
                            fontSize: titleSettings.fontSize,

                        }
                    });
                    break;

                case 'rectanglecolor':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Rectangle Settings',
                        selector: null,
                        properties: {

                            color: rectanglecolor.color,

                        }
                    });
                    break;
                case 'linkcolor':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Link Settings',
                        selector: null,
                        properties: {

                            color: linkcolor.color,

                        }
                    });
                    break;
                   
                    case 'circlecolor':
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: 'circle Settings',
                            selector: null,
                            properties: {
    
                                color: circlecolor.color,
                                color2: circlecolor.color2,
                                Border: circlecolor.Border,
    
                            }
                       });
                      
                    break
            };
            return objectEnumeration;
        }

    }
}