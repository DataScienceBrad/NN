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

        /** Gets an object from objects. */
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
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }
    }

    var d3 = (<any>window).d3;

    interface journeyData {
        nodes: Array<nodes>,
        links: Array<links>
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

    interface LegendDataPoint {
        category: string;
        value: number;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    };

    interface legendSettings {
        show: boolean;
    }

    interface rootSettings {
        text: string;
        color: string;
    }

    interface labelSettings {
        show: boolean;
        color: string;
        fontSize: number;
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private graph: journeyData;
        private root: any;
        private svg: any;
        private svgLegend: any;
        public host: IVisualHost;
        private colors: any;
        private data: journeyData;
        private LegendDataPoints: Array<LegendDataPoint>;
        private dataViews: DataView;
        private totalValues: number;
        private catLength: number;
        private idGen: number;
        private measureIdGen: number;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private minXView:number;
        private minYView:number;
        private width:number;
        private height:number;
        private formatString:string;
        private measureData: DataViewValueColumns;

        public getDefaultData(): journeyData {
            return {
                nodes: [],
                links: []
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
            var sum:number = 0;
            if(combinedID != 'none'){
                var hierarchyArray = combinedID.split('***');
                var level = hierarchyArray.length-1;
                var counter;
                for(var iRow = 0; iRow < totalValues; iRow++){
                    counter = 0;
                    for(var iLevel = 0; iLevel <= level; iLevel++){
                        if(this.dataViews.categorical.categories[iLevel].values[iRow] == hierarchyArray[iLevel]){
                            counter += 1;
                            if(counter == level + 1){
                                sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                            }
                        }
                    }
                }
                return sum;
            }
            else{
                for(var iRow = 0; iRow < totalValues; iRow++){
                    sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                }
                return sum;
            }
        }

        public calNodesNLinks(data, catDataset, combinedID, level, parentId, parentSum){
            if(!catDataset[level]){
                if(this.measureData.length > 1){
                    var splitId = combinedID.split('***');
                    for(var iRow = 0; iRow < this.totalValues; iRow++){
                        cnt = 0;
                        for(var cat = 0; cat < level ; cat++){
                            if(catDataset[cat].values[iRow] == splitId[cat]){
                                cnt += 1;
                                if(cnt == level){
                                    var color;
                                    for(var iCounter = 0; iCounter < this.LegendDataPoints.length; iCounter++){
                                        if(splitId[0] == this.LegendDataPoints[iCounter].category){
                                            color = this.LegendDataPoints[iCounter].color;
                                            break;
                                        }
                                        else{
                                            color = '#000';
                                        }
                                    }
                                    for(var iCounter = 0; iCounter < this.measureData.length; iCounter++){
                                        var measureNewId = (++this.measureIdGen).toString();
                                        data.nodes.push({
                                            id: measureNewId,
                                            program: this.measureData[iCounter].source.displayName,
                                            name: this.measureData[iCounter].source.displayName,
                                            group: (level+1).toString(),
                                            numberofleads: this.measureData[iCounter].values[iRow],
                                            percentage: iCounter == 0 ? 1 : (parseFloat(this.measureData[iCounter].values[iRow].toString())/parseFloat(this.measureData[iCounter-1].values[iRow].toString())),
                                            description: this.measureData[iCounter].source.displayName,
                                            color: color
                                        })
                                        data.links.push({
                                            source: iCounter == 0 ? parentId.toString() : this.measureIdGen - 1,
                                            target: measureNewId,
                                            value: this.measureData[iCounter].values[iRow],
                                            Activity: ""
                                        });
                                    } //end for this.measureData
                                } //end if cnt == level
                            } //end if catDataset[cat].values[iRow] == splitId[cat]
                        } //end for cat
                    } // end for iRow
                } //end if this.measureData.length > 1
                return 0;
            } // end if !catDataset[level]
            else{
                var uniqueElements;
                var splitId = combinedID.split('***');
                if(combinedID !== ""){
                    var filteredData = [];
                    var cnt;
                    for(var iRow = 0; iRow < this.totalValues; iRow++){
                        cnt = 0;
                        for(var cat = 0; cat < level ; cat++){
                            if(catDataset[cat].values[iRow] == splitId[cat]){
                                cnt += 1;
                                if(cnt == level){
                                    filteredData.push(catDataset[level].values[iRow]);
                                }
                            }
                        }
                    }
                    uniqueElements = filteredData.filter(this.getDistinctElements);
                } 
                else{
                    uniqueElements = catDataset[0].values.filter(this.getDistinctElements);
                }
                
                uniqueElements.forEach(element => {
                    var color;
                    for(var iCounter = 0; iCounter < this.LegendDataPoints.length; iCounter++){
                        if(this.LegendDataPoints[iCounter].category == splitId[0] || this.LegendDataPoints[iCounter].category == element){
                            color = this.LegendDataPoints[iCounter].color
                            break;
                        }
                        else{
                            color = '#000';
                        }
                    }
                    
                    var newCombinedID;
                    var newId = (this.idGen++).toString();
                    if(level == 0){
                        newCombinedID = element.toString();
                    }else{
                        newCombinedID = combinedID + '***' + element;
                    }
                    var calNumberOfLeads = this.calAggregate(newCombinedID, this.totalValues);

                    data.links.push({
                        source: parentId.toString(),
                        target: newId,
                        value: calNumberOfLeads,
                        Activity: ""
                    });

                    data.nodes.push({
                        id: newId,
                        program: catDataset[level].source.displayName,
                        name: element,
                        group: (level+1).toString(),
                        numberofleads: calNumberOfLeads,
                        percentage: calNumberOfLeads/parentSum,
                        description: newCombinedID,
                        color: color
                    })
                    this.calNodesNLinks(data, catDataset, newCombinedID, level+1, newId, calNumberOfLeads)
                });
            }
        }

        public converter(dataView: DataView, colors: any, host: IVisualHost, rootSettings: rootSettings): journeyData {
            var data: journeyData = this.getDefaultData();
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

                data.nodes.push({
                    id: '0',
                    program: textMeasurementService.getTailoredTextOrDefault(rootTextProperties, 140),
                    name: textMeasurementService.getTailoredTextOrDefault(rootTextProperties, 140),
                    group: '0',
                    numberofleads: rootSum,
                    percentage: 1.00,
                    description: combinedID,
                    color: rootSettings.color
                });

                data.links.push({
                    source: "0",
                    target: "0",
                    value: this.calAggregate('none', totalValues),
                    Activity: ""
                });

                // Creating Colors for Nodes
                this.LegendDataPoints = [];
                let colorPalette: IColorPalette = host.colorPalette;
                let categories = jQuery.extend({}, dataView.categorical.categories[0]);
                var catValues = categories.values.filter(this.getDistinctElements);
                categories.values = catValues;
                for (let iIterator = 0; iIterator < categories.values.length; iIterator++) {
                    let defaultColor: Fill = {
                        solid: {
                            color: colorPalette.getColor(categories.values[iIterator] + '').value
                        }
                    }
                    this.LegendDataPoints.push({
                        category: categories.values[iIterator] + '',
                        value: iIterator,
                        color: getCategoricalObjectValue<Fill>(categories, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                        selectionId: host.createSelectionIdBuilder()
                            .withCategory(categories, iIterator)
                            .createSelectionId()
                    });
                }

                this.calNodesNLinks(data, catData, "", 0, 0, rootSum);
                return data;
            }
            return data;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.updateCount = 0;

            this.root = d3.select(options.element);
            this.svgLegend = this.root.append("svg");
            this.svg = this.root.append("svg");
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.width = 1500,
            this.height = 500;           
            
            this.minXView = -1 * (this.width / 3);
            this.minYView = -1 * (this.height / 2.5);
        }

        public update(options: VisualUpdateOptions) {
            var dataView: DataView;
            this.dataViews = dataView = options.dataViews[0];
            var rootSettings: rootSettings = this.getRootSettings(this.dataViews);
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var legendSettings: legendSettings = this.getLegendSettings(this.dataViews);
            var data = this.data = this.converter(dataView, this.colors, this.host, rootSettings);
            this.svg.selectAll("*").remove();
            this.svgLegend.selectAll("*").remove();            

            this.svgLegend
                .attr("width", options.viewport.width)
                .attr("style", "position: absolute; top: 0; display: inherit; background-color: white")

            var This = this;

            if(legendSettings.show){
                this.svgLegend.attr('height','26.6666');
                var legendWidth = (options.viewport.width/(this.catLength + 1));
                legendWidth = legendWidth > 100 ? 100 : legendWidth;
                var group = this.svgLegend
                    .append("g");
                group.selectAll("circle")
                    .data(this.LegendDataPoints)
                    .enter()
                    .append("circle")
                    .attr("r", 5)
                    .attr("cx", function (d, i) {
                        return (i * legendWidth) + 10;
                    })
                    .attr("cy", 10)
                    .attr("fill", function (d) {
                        return d.color;
                    })
                    .attr("class", "legendCircle")
                    .append("title")
                    .text(function (d) {
                            return d.category;
                    });

                group.selectAll('text')
                    .data(this.LegendDataPoints)
                    .enter()
                    .append("text")
                    .attr("font-family","Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif")
                    .attr("font-size",15 + "px")
                    .attr("x", function (d, i) {
                        if (i === 0)
                            return 20;
                        return (i * legendWidth) + 20;
                    })
                    .attr("y", 15)               
                    .text(function (d) {
                        var textProperties: TextProperties = {
                            text: d.category,
                            fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                            fontSize: "15px"
                        };
                        return textMeasurementService.getTailoredTextOrDefault(textProperties, legendWidth - 25)
                    })
                    .append("title")
                    .text(function (d) {
                            return d.category;
                    });;
            }
            else{
                this.svgLegend.attr('height','0');
            }
            var max = d3.max(data.nodes, function(d) { if(d.name === "Root") {return 1;} return d.numberofleads});
            var linearScale = d3.scaleLinear().domain([0, max]).range([10, 30]);
            var linkLinearScale = d3.scaleLinear().domain([0, max]).range([2, 10]);
            var linkStrengthLevel1Scale = d3.scaleLog().domain([1, 42500]).range([1, 0.1]).clamp(true);
            var linkStrengthLevel2Scale = d3.scaleLog().domain([1, 42500]).range([1, 0.4]).clamp(true);
            
            var svg = this.svg;
            svg.attr("width", options.viewport.width) // resizes based on window
                .attr("height", options.viewport.height)
                .attr("viewBox", this.minXView + " " + this.minYView + " " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "xMidYMid meet")

            var linkDistance = 150;
            var manyBodyStrength = -200;
            var linkIterations = 20;

            var color = d3.scaleOrdinal(d3.schemeCategory20);

            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function (d) {
                    return d.id;
                }).strength(function (d) {
                    //Set link strength based on effective size of node
                    if (d.target.group == "1" ||
                        d.target.group == "2"
                    ) {
                        return linkStrengthLevel1Scale(d.value);
                    }
                    else {
                        return linkStrengthLevel2Scale(d.value);
                    }
                })
                )
                .force("charge", d3.forceManyBody().strength(-200))
                .force("center", d3.forceCenter(0, 0));

            var link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(data.links)
                .enter().append("line")
                .attr("stroke-width", function (d) { return linkLinearScale(d.value); });

            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(data.nodes)
                .enter().append("circle")
                .attr("r", function (d) {
                    if(d.name === "Root"){
                        return linearScale(max);
                    }
                    return linearScale(d.numberofleads);
                })
                .attr("fill", function (d) {
                    return d.color;
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            if(labelSettings.show){
                var text = svg.append("g")
                    .attr("class", "text")
                    .selectAll("text")
                    .data(data.nodes)
                    .enter().append("text")
                    .attr("fill", labelSettings.color)
                    .attr("font-size", labelSettings.fontSize + 'px')
                    .text(function (d) {
                        return d.name;
                    })
            }

            simulation
                .nodes(data.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(data.links)
                .distance(linkDistance).iterations(linkIterations);

            // Register events
            svg.on("wheel.zoom", svgMouseWheelHandler);
            svg.call(d3.drag().on("drag", svgDragHandler));

            function svgMouseWheelHandler(event) {
                var wheelDelta = d3.event.wheelDeltaY || d3.event.deltaY;
                var tempWidth = (This.width) + (wheelDelta * -2);
                var tempHeight = (This.height) + (wheelDelta * -2);

                if (tempWidth > 0 && tempHeight > 0) {
                    This.minXView = This.minXView + (wheelDelta);
                    This.minYView = This.minYView + (wheelDelta);
                    This.width = tempWidth;
                    This.height = tempHeight;

                    svg.attr("viewBox", This.minXView + " " + This.minYView + " " + This.width + " " + This.height);
                }
            }

            function svgDragHandler() {
                This.minXView += -1 * d3.event.dx;
                This.minYView += -1 * d3.event.dy;
                svg.attr("viewBox", This.minXView + " " + This.minYView + " " + This.width + " " + This.height);
            }

            function ticked() {
                link
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
                    
                if(labelSettings.show){
                    text.attr("x", function(d) { 
                        if(d.name === "Root"){
                            return d.x + linearScale(max);
                        }
                        return d.x + linearScale(d.numberofleads);
                    })
                    .attr("y", function(d) { return d.y - 10})
                }
            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0.5);
                d.fx = null;
                d.fy = null;
            }
            
            function restrictGraphByNode(event) {
                var curScope = this;

                // call method to hide graph but current node
                hideGraphButCurrent(event.id);

                var sourceNodeLeaf = event.id;
                var sourceNode = event.id

                if (event.program) {
                    var filteredNodes = node.filter(function (d) {
                        return event.program == d.program;
                    });

                    filteredNodes.each(function (d) {
                        d3.select(this)
                            .attr("visibility", "visible");

                        // Case 1: Trace path towards leaf nodes
                        tracePathTillLeafNodes(d.id);

                        // Case 2: Trace path towards center node
                        tracePathTillCenterNode(d.id);
                    });
                } else {
                    var filteredNodes = node.filter(function (d) {
                        return event.id == d.id;
                    });

                    filteredNodes.each(function (d) {
                        d3.select(this)
                            .attr("visibility", "visible");

                        // Case 1: Trace path towards leaf nodes
                        tracePathTillLeafNodes(d.id);

                        // Case 2: Trace path towards center node
                        tracePathTillCenterNode(d.id);
                    });
                }
            }

            var hideGraphButCurrent = function (curNode) {
                var filteredNodes = node.filter(function (d) {
                    return d.id != curNode;
                });

                var filteredLinks = link.filter(function (d) {
                    return d.target.id != curNode;
                });

                filteredNodes
                    .each(function (d) {
                        d3.select(this)
                            .attr("visibility", "hidden");
                    });

                filteredLinks
                    .each(function (d) {
                        d3.select(this)
                            .attr("visibility", "hidden");
                    });
            }

            // trace till we reach leaf nodes
            var tracePathTillLeafNodes = function (nodeId) {
                var curScope = this;

                var filteredLinks = link.filter(function (d) {
                    return d.source.id == nodeId;
                });

                filteredLinks.each(function (d) {
                    d3.select(this)
                        .attr("visibility", "visible");

                    setTimeout(unhideNode(d.target.id), 0);
                });
            }

            // trace till we reach center node
            var tracePathTillCenterNode = function (nodeId) {
                var curScope = this;

                var filteredLinks = link.filter(function (d) {
                    return d.target.id == nodeId;
                });

                filteredLinks.each(function (d) {
                    d3.select(this)
                        .attr("visibility", "visible");

                    setTimeout(unhideNode(d.source.id), 0);

                    tracePathTillCenterNode(d.source.id);
                });
            }

            // Unhide Node
            var unhideNode = function (nodeId) {
                var filteredNodes = node.filter(function (d) {
                    return nodeId == d.id;
                });

                filteredNodes.each(function (d) {
                    d3.select(this)
                        .attr("visibility", "visible");
                });
            }

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('circle'), 
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
  
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            var formatter = ValueFormatter.create({ format: this.formatString, value: 0, allowFormatBeautification: true, precision: 2  });
            return [{
                displayName: value.name,
                value: formatter.format(value.numberofleads)
            },{
                displayName: "Percentage",
                value: +(value.percentage*100).toFixed(2) + '%'
            }];
        }

        public getLegendSettings(dataView: DataView): legendSettings {
            var objects: DataViewObjects = null;
            var settings: legendSettings = this.getDefaultLegendSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            settings.show = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'legendSettings', propertyName: 'show' }, settings.show);
            return settings;
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

        public getLabelSettings(dataView: DataView): labelSettings {
            var objects: DataViewObjects = null;
            var settings: labelSettings = this.getDefaultLabelSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            settings.show = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'show' }, settings.show);
            settings.color = DataViewObjects.getFillColor(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'color' }, settings.color);
            settings.fontSize = DataViewObjects.getValue(objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' }, settings.fontSize);
            return settings;
        }

        public getDefaultLegendSettings(): legendSettings {
            return {
                show: true
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
                color: '#000000',
                fontSize: 25
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            var rootSettings: rootSettings = this.getRootSettings(this.dataViews);
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var legendSettings: legendSettings = this.getLegendSettings(this.dataViews);
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case 'legendSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Legends',
                        selector: null, 
                        properties: {
                            show: legendSettings.show
                        }
                    });
                break;
                case 'colorSelector':
                    for (let legendData of this.LegendDataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: legendData.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: legendData.color
                                    }
                                }
                            },
                            selector: legendData.selectionId.getSelector()
                        });
                    }
                    break;
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
                            fontSize: labelSettings.fontSize
                        }
                    });
                break;
            };
            return objectEnumeration;
        }
    }
}