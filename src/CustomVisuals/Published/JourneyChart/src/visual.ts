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

            if (!objects) { return defaultValue; }

            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];

            let object: DataViewObject;
            object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object: DataViewObject;
                object = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map: DataViewObjectMap;
                map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill;
            value = getValue(objects, propertyId);
            if (!value || !value.solid) { return defaultColor; }

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object) { return defaultValue; }

            // tslint:disable-next-line:no-any
            let propertyValue: any;
            propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) { return defaultValue; }

            return propertyValue;
        }
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) { return defaultColor; }

            return value.solid.color;
        }
    }

    // tslint:disable-next-line:no-any
    let d3: any;
    // tslint:disable-next-line:no-any
    d3 = (<any>window).d3;

    interface IJourneyData {
        nodes: INodes[];
        links: ILinks[];
    }
    interface INodes {
        id: string;
        group: string;
        description: string;
        program: string;
        name: string;
        numberofleads: number;
        percentage: number;
        color: string;
    }
    interface ILinks {
        source: string;
        target: string;
        value: number;
        Activity: string;
    }

    interface ILegendDataPoint {
        category: string;
        value: number;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    }

    interface ILegendSettings {
        show: boolean;
    }

    interface IRootSettings {
        text: string;
        color: string;
    }

    interface ILabelSettings {
        show: boolean;
        color: string;
        fontSize: number;
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private graph: IJourneyData;
        private root: d3.Selection<HTMLElement>;
        private svg: d3.Selection<HTMLElement>;
        private svgLegend: d3.Selection<HTMLElement>;
        public host: IVisualHost;
        // private colors: any;
        private data: IJourneyData;
        private legendDataPoints: ILegendDataPoint[];
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

        public getDefaultData(): IJourneyData {
            return {
                nodes: [],
                links: []
            };
        }

        public getDistinctElements(val: PrimitiveValue, i: number, self: PrimitiveValue[]): boolean {
            return self.indexOf(val) === i;
        }

        public calAggregate(combinedID: string, totalValues: number): number {
            let sum: number = 0;
            if (combinedID !== 'none') {
                let hierarchyArray: string[];
                hierarchyArray = combinedID.split('***');
                let level: number;
                level = hierarchyArray.length - 1;
                let counter: number;
                for (let iRow: number = 0; iRow < totalValues; iRow++) {
                    counter = 0;
                    for (let iLevel: number = 0; iLevel <= level; iLevel++) {
                        if (this.dataViews.categorical.categories[iLevel].values[iRow].toString() === hierarchyArray[iLevel]) {
                            counter += 1;
                            if (counter === level + 1) {
                                sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                            }
                        }
                    }
                }

                return sum;
            } else {
                for (let iRow: number = 0; iRow < totalValues; iRow++) {
                    sum += parseFloat(this.dataViews.categorical.values[0].values[iRow].toString());
                }

                return sum;
            }
        }

        public calNodesNLinks(
            // tslint:disable-next-line:no-any
            data: any, catDataset: DataViewCategoricalColumn[],
            combinedID: string, level: number, parentId: number, parentSum: number): number {
            if (!catDataset[level]) {
                if (this.measureData.length > 1) {
                    let splitId: string[];
                    splitId = combinedID.split('***');
                    let cnt: number = 0;
                    for (let iRow: number = 0; iRow < this.totalValues; iRow++) {
                        cnt = 0;
                        for (let cat: number = 0; cat < level; cat++) {
                            if (catDataset[cat].values[iRow].toString() === splitId[cat]) {
                                cnt += 1;
                                if (cnt === level) {
                                    let color: string;
                                    for (let iCounter: number = 0; iCounter < this.legendDataPoints.length; iCounter++) {
                                        if (splitId[0] === this.legendDataPoints[iCounter].category) {
                                            color = this.legendDataPoints[iCounter].color;
                                            break;
                                        } else {
                                            color = '#000';
                                        }
                                    }
                                    for (let iCounter: number = 0; iCounter < this.measureData.length; iCounter++) {
                                        let measureNewId: string;
                                        measureNewId = (++this.measureIdGen).toString();
                                        data.nodes.push({
                                            id: measureNewId,
                                            program: this.measureData[iCounter].source.displayName,
                                            name: this.measureData[iCounter].source.displayName,
                                            group: (level + 1).toString(),
                                            numberofleads: this.measureData[iCounter].values[iRow],
                                            percentage: iCounter === 0 ? 1 : (
                                                parseFloat(this.measureData[iCounter].values[iRow].toString()) /
                                                parseFloat(this.measureData[iCounter - 1].values[iRow].toString())),
                                            description: this.measureData[iCounter].source.displayName,
                                            color: color
                                        });
                                        data.links.push({
                                            source: iCounter === 0 ? parentId.toString() : this.measureIdGen - 1,
                                            target: measureNewId,
                                            value: this.measureData[iCounter].values[iRow],
                                            Activity: ''
                                        });
                                    } //end for this.measureData
                                } //end if cnt == level
                            } //end if catDataset[cat].values[iRow] == splitId[cat]
                        } //end for cat
                    } // end for iRow
                } //end if this.measureData.length > 1

                return 0;
            } else { // end if !catDataset[level]
                let uniqueElements: PrimitiveValue[];
                let splitId: string[];
                splitId = combinedID.split('***');
                if (combinedID !== '') {
                    let filteredData: PrimitiveValue[];
                    filteredData = [];
                    let cnt: number = 0;
                    for (let iRow: number = 0; iRow < this.totalValues; iRow++) {
                        cnt = 0;
                        for (let cat: number = 0; cat < level; cat++) {
                            if (catDataset[cat].values[iRow].toString() === splitId[cat]) {
                                cnt += 1;
                                if (cnt === level) {
                                    filteredData.push(catDataset[level].values[iRow]);
                                }
                            }
                        }
                    }
                    uniqueElements = filteredData.filter(this.getDistinctElements);
                } else {
                    uniqueElements = catDataset[0].values.filter(this.getDistinctElements);
                }

                uniqueElements.forEach((element: PrimitiveValue) => {
                    let color: string;
                    for (let iCounter: number = 0; iCounter < this.legendDataPoints.length; iCounter++) {
                        if (this.legendDataPoints[iCounter].category === splitId[0] ||
                            this.legendDataPoints[iCounter].category === element.toString()) {
                            color = this.legendDataPoints[iCounter].color;
                            break;
                        } else {
                            color = '#000';
                        }
                    }

                    let newCombinedID: string;
                    let newId: string;
                    newId = (this.idGen++).toString();
                    if (level === 0) {
                        newCombinedID = element.toString();
                    } else {
                        newCombinedID = combinedID;
                        newCombinedID += '***';
                        newCombinedID += element;
                    }
                    let calNumberOfLeads: number;
                    calNumberOfLeads = this.calAggregate(newCombinedID, this.totalValues);

                    data.links.push({
                        source: parentId.toString(),
                        target: newId,
                        value: calNumberOfLeads,
                        Activity: ''
                    });

                    data.nodes.push({
                        id: newId,
                        program: catDataset[level].source.displayName,
                        name: element,
                        group: (level + 1).toString(),
                        numberofleads: calNumberOfLeads,
                        percentage: calNumberOfLeads / parentSum,
                        description: newCombinedID,
                        color: color
                    });
                    this.calNodesNLinks(data, catDataset, newCombinedID, level + 1, parseFloat(newId), calNumberOfLeads);
                });
            }
        }

        public converter(dataView: DataView, host: IVisualHost, rootSettings: IRootSettings): IJourneyData {
            let data: IJourneyData;
            data = this.getDefaultData();
            if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0
                && dataView.categorical.values && dataView.categorical.values.length > 0) {
                this.totalValues = dataView.categorical.values[0].values.length;
                this.catLength = dataView.categorical.categories[0].values.filter(this.getDistinctElements).length;
                this.idGen = 1;
                this.measureIdGen = 10000000;
                this.measureData = dataView.categorical.values;
                let arrIDs: number[];
                arrIDs = [];
                let arrCombinedIDs: string[];
                arrCombinedIDs = [];
                let arrLevel: number[];
                arrLevel = [];
                let divider: string;
                divider = '***';
                let combinedID: string;
                combinedID = '';
                let category: string;
                category = '';
                let catData: DataViewCategoricalColumn[];
                catData = dataView.categorical.categories;
                let catLength: number;
                catLength = dataView.categorical.categories.length;
                let rootNode: string;
                rootNode = '';
                let totalValues: number;
                totalValues = dataView.categorical.categories[0].values.length;
                let rootNodeIndex: number;
                rootNodeIndex = 0;
                let arrCategoriesMapping: number[];
                arrCategoriesMapping = [];
                this.formatString = dataView.categorical.values[0].source.format;
                // Level 0 mappings
                let rootSum: number;
                rootSum = this.calAggregate('none', totalValues);

                let rootText: string;
                rootText = rootSettings.text;
                let rootTextProperties: TextProperties;
                rootTextProperties = {
                    text: rootText,
                    fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                    fontSize: '15px'
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
                    source: '0',
                    target: '0',
                    value: this.calAggregate('none', totalValues),
                    Activity: ''
                });

                // Creating Colors for Nodes
                this.legendDataPoints = [];
                let colorPalette: IColorPalette;
                colorPalette = host.colorPalette;
                // tslint:disable-next-line:no-any
                let categories: any;
                categories = jQuery.extend({}, dataView.categorical.categories[0]);
                // tslint:disable-next-line:no-any
                let catValues: any;
                catValues = categories.values.filter(this.getDistinctElements);
                categories.values = catValues;
                for (let iIterator: number = 0; iIterator < categories.values.length; iIterator++) {
                    let defaultColor: Fill;
                    defaultColor = {
                        solid: {
                            color: colorPalette.getColor(categories.values[iIterator].toString()).value
                        }
                    };
                    this.legendDataPoints.push({
                        category: categories.values[iIterator].toString(),
                        value: iIterator,
                        color: getCategoricalObjectValue<Fill>(categories, iIterator, 'colorSelector', 'fill', defaultColor).solid.color,
                        selectionId: host.createSelectionIdBuilder()
                            .withCategory(categories, iIterator)
                            .createSelectionId()
                    });
                }

                this.calNodesNLinks(data, catData, '', 0, 0, rootSum);

                return data;
            }

            return data;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.updateCount = 0;

            this.root = d3.select(options.element);
            this.svgLegend = this.root.append('svg');
            this.svg = this.root.append('svg');
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.width = 1500,
                this.height = 500;

            this.minXView = -1 * (this.width / 3);
            this.minYView = -1 * (this.height / 2.5);
        }

        public update(options: VisualUpdateOptions): void {
            let dataView: DataView;
            this.dataViews = dataView = options.dataViews[0];
            let rootSettings: IRootSettings;
            rootSettings = this.getRootSettings(this.dataViews);
            let labelSettings: ILabelSettings;
            labelSettings = this.getLabelSettings(this.dataViews);
            let legendSettings: ILegendSettings;
            legendSettings = this.getLegendSettings(this.dataViews);
            let data: IJourneyData;
            data = this.data = this.converter(dataView, this.host, rootSettings);
            let pxLiteral: string;
            pxLiteral = 'px';
            let spaceLiteral: string;
            spaceLiteral = ' ';
            this.svg.selectAll('*').remove();
            this.svgLegend.selectAll('*').remove();

            this.svgLegend
                .attr('width', options.viewport.width)
                .attr('style', 'position: absolute; top: 0; display: inherit; background-color: white');

            let thisObj: Visual;
            thisObj = this;

            if (legendSettings.show) {
                this.svgLegend.attr('height', '26.6666');
                let legendWidth: number = (options.viewport.width / (this.catLength + 1));
                legendWidth = legendWidth > 100 ? 100 : legendWidth;
                let group: d3.Selection<HTMLElement>;
                group = this.svgLegend
                    .append('g');
                group.selectAll('circle')
                    .data(this.legendDataPoints)
                    .enter()
                    .append('circle')
                    .attr('r', 5)
                    // tslint:disable-next-line:no-any
                    .attr('cx', function (d: any, i: number): number {
                        return (i * legendWidth) + 10;
                    })
                    .attr('cy', 10)
                    .attr('fill', function (d: ILegendDataPoint): string {
                        return d.color;
                    })
                    .attr('class', 'legendCircle')
                    .append('title')
                    .text(function (d: ILegendDataPoint): string {
                        return d.category;
                    });

                group.selectAll('text')
                    .data(this.legendDataPoints)
                    .enter()
                    .append('text')
                    .attr('font-family', 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif')
                    .attr('font-size', 15 + pxLiteral)
                    .attr('x', function (d: ILegendDataPoint, i: number): number {
                        if (i === 0) { return 20; }

                        return (i * legendWidth) + 20;
                    })
                    .attr('y', 15)
                    .text(function (d: ILegendDataPoint): string {
                        let textProperties: TextProperties;
                        textProperties = {
                            text: d.category,
                            fontFamily: 'Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: '15px'
                        };

                        return textMeasurementService.getTailoredTextOrDefault(textProperties, legendWidth - 25);
                    })
                    .append('title')
                    .text(function (d: ILegendDataPoint): string {
                        return d.category;
                    });
            } else {
                this.svgLegend.attr('height', '0');
            }
            let max: number;
            // tslint:disable-next-line:no-any
            max = d3.max(data.nodes, function (d: any): number {
                if (d.name === 'Root') { return 1; }

                return d.numberofleads;
            });
            // tslint:disable-next-line:no-any
            let linearScale: any;
            linearScale = d3.scaleLinear().domain([0, max]).range([10, 30]);
            // tslint:disable-next-line:no-any
            let linkLinearScale: any;
            linkLinearScale = d3.scaleLinear().domain([0, max]).range([2, 10]);
            // tslint:disable-next-line:no-any
            let linkStrengthLevel1Scale: any;
            linkStrengthLevel1Scale = d3.scaleLog().domain([1, 42500]).range([1, 0.1]).clamp(true);
            // tslint:disable-next-line:no-any
            let linkStrengthLevel2Scale: any;
            linkStrengthLevel2Scale = d3.scaleLog().domain([1, 42500]).range([1, 0.4]).clamp(true);

            let svg: d3.Selection<HTMLElement>;
            svg = this.svg;
            svg.attr('width', options.viewport.width) // resizes based on window
                .attr('height', options.viewport.height)
                .attr('viewBox', this.minXView + spaceLiteral + this.minYView + spaceLiteral + this.width + spaceLiteral + this.height)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            let linkDistance: number;
            linkDistance = 150;
            let manyBodyStrength: number;
            manyBodyStrength = -200;
            let linkIterations: number;
            linkIterations = 20;

            // tslint:disable-next-line:no-any
            let color: any;
            color = d3.scaleOrdinal(d3.schemeCategory20);

            // tslint:disable-next-line:no-any
            let simulation: any;
            simulation = d3.forceSimulation()
                // tslint:disable-next-line:no-any
                .force('link', d3.forceLink().id(function (d: any): any {
                    return d.id;
                    // tslint:disable-next-line:no-any
                }).strength(function (d: any): any {
                    //Set link strength based on effective size of node
                    if (d.target.group.toString() === '1' ||
                        d.target.group.toString() === '2'
                    ) {
                        return linkStrengthLevel1Scale(d.value);
                    } else {
                        return linkStrengthLevel2Scale(d.value);
                    }
                })
                )
                .force('charge', d3.forceManyBody().strength(-200))
                .force('center', d3.forceCenter(0, 0));

            let link: d3.Selection<ILinks>;
            link = svg.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(data.links)
                .enter().append('line')
                // tslint:disable-next-line:no-any
                .attr('stroke-width', function (d: ILinks): any { return linkLinearScale(d.value); });

            let node: d3.Selection<INodes>;
            node = svg.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(data.nodes)
                .enter().append('circle')
                // tslint:disable-next-line:no-any
                .attr('r', function (d: INodes): any {
                    if (d.name === 'Root') {
                        return linearScale(max);
                    }

                    return linearScale(d.numberofleads);
                })
                .attr('fill', function (d: INodes): string {
                    return d.color;
                })
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));
            let text: d3.Selection<INodes>;
            if (labelSettings.show) {
                text = svg.append('g')
                    .attr('class', 'text')
                    .selectAll('text')
                    .data(data.nodes)
                    .enter().append('text')
                    .attr('fill', labelSettings.color)
                    .attr('font-size', labelSettings.fontSize + pxLiteral)
                    .text(function (d: INodes): string {
                        return d.name;
                    });
            }

            simulation
                .nodes(data.nodes)
                .on('tick', ticked);

            simulation.force('link')
                .links(data.links)
                .distance(linkDistance).iterations(linkIterations);

            // Register events
            svg.on('wheel.zoom', svgMouseWheelHandler);
            svg.call(d3.drag().on('drag', svgDragHandler));

            // tslint:disable-next-line:no-any
            function svgMouseWheelHandler(event: any): void {
                let wheelDelta: number;
                wheelDelta = d3.event.wheelDeltaY || d3.event.deltaY;
                let tempWidth: number;
                tempWidth = (thisObj.width) + (wheelDelta * -2);
                let tempHeight: number;
                tempHeight = (thisObj.height) + (wheelDelta * -2);

                if (tempWidth > 0 && tempHeight > 0) {
                    thisObj.minXView = thisObj.minXView + (wheelDelta);
                    thisObj.minYView = thisObj.minYView + (wheelDelta);
                    thisObj.width = tempWidth;
                    thisObj.height = tempHeight;

                    svg.attr('viewBox', thisObj.minXView + spaceLiteral +
                        thisObj.minYView + spaceLiteral + thisObj.width + spaceLiteral + thisObj.height);
                }
            }

            function svgDragHandler(): void {
                thisObj.minXView += -1 * d3.event.dx;
                thisObj.minYView += -1 * d3.event.dy;
                svg.attr('viewBox', thisObj.minXView + spaceLiteral + thisObj.minYView +
                    spaceLiteral + thisObj.width + spaceLiteral + thisObj.height);
            }

            function ticked(): void {
                link
                    // tslint:disable-next-line:no-any
                    .attr('x1', function (d: any): number { return d.source.x; })
                    // tslint:disable-next-line:no-any
                    .attr('y1', function (d: any): number { return d.source.y; })
                    // tslint:disable-next-line:no-any
                    .attr('x2', function (d: any): number { return d.target.x; })
                    // tslint:disable-next-line:no-any
                    .attr('y2', function (d: any): number { return d.target.y; });

                node
                    // tslint:disable-next-line:no-any
                    .attr('cx', function (d: any): number { return d.x; })
                    // tslint:disable-next-line:no-any
                    .attr('cy', function (d: any): number { return d.y; });

                if (labelSettings.show) {
                    // tslint:disable-next-line:no-any
                    text.attr('x', function (d: any): number {
                        if (d.name === 'Root') {
                            return d.x + linearScale(max);
                        }

                        return d.x + linearScale(d.numberofleads);
                    })
                        // tslint:disable-next-line:no-any
                        .attr('y', function (d: any): number { return d.y - 10; });
                }
            }

            // tslint:disable-next-line:no-any
            function dragstarted(d: any): void {
                if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
                d.fx = d.x;
                d.fy = d.y;
            }

            // tslint:disable-next-line:no-any
            function dragged(d: any): void {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            // tslint:disable-next-line:no-any
            function dragended(d: any): void {
                if (!d3.event.active) { simulation.alphaTarget(0.5); }
                d.fx = null;
                d.fy = null;
            }

            this.tooltipServiceWrapper.addTooltip(
                this.svg.selectAll('circle'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);

        }

        // tslint:disable-next-line:no-any
        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let formatter: IValueFormatter;
            formatter = ValueFormatter.create({ format: this.formatString, value: 0, allowFormatBeautification: true, precision: 2 });
            let percentageLiteral: string;
            percentageLiteral = '%';

            return [{
                displayName: value.name,
                value: formatter.format(value.numberofleads)
            }, {
                displayName: 'Percentage',
                value: +(value.percentage * 100).toFixed(2) + percentageLiteral
            }];
        }

        public getLegendSettings(dataView: DataView): ILegendSettings {
            let objects: DataViewObjects;
            objects = null;
            let settings: ILegendSettings;
            settings = this.getDefaultLegendSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) { return settings; }
            objects = dataView.metadata.objects;
            settings.show = DataViewObjects.getValue(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'legendSettings', propertyName: 'show' }, settings.show);

            return settings;
        }

        public getRootSettings(dataView: DataView): IRootSettings {
            let objects: DataViewObjects = null;
            let settings: IRootSettings;
            settings = this.getDefaultRootSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) { return settings; }
            objects = dataView.metadata.objects;
            settings.text = DataViewObjects.getValue(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'rootSettings', propertyName: 'text' }, settings.text);
            settings.color = DataViewObjects.getFillColor(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'rootSettings', propertyName: 'color' }, settings.color);

            return settings;
        }

        public getLabelSettings(dataView: DataView): ILabelSettings {
            let objects: DataViewObjects = null;
            let settings: ILabelSettings;
            settings = this.getDefaultLabelSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) { return settings; }
            objects = dataView.metadata.objects;
            settings.show = DataViewObjects.getValue(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'show' }, settings.show);
            settings.color = DataViewObjects.getFillColor(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'color' }, settings.color);
            settings.fontSize = DataViewObjects.getValue(
                objects, <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' }, settings.fontSize);

            return settings;
        }

        public getDefaultLegendSettings(): ILegendSettings {
            return {
                show: true
            };
        }

        public getDefaultRootSettings(): IRootSettings {
            return {
                text: 'Root',
                color: '#000000'
            };
        }

        public getDefaultLabelSettings(): ILabelSettings {
            return {
                show: true,
                color: '#000000',
                fontSize: 25
            };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string;
            objectName = options.objectName;
            let rootSettings: IRootSettings;
            rootSettings = this.getRootSettings(this.dataViews);
            let labelSettings: ILabelSettings;
            labelSettings = this.getLabelSettings(this.dataViews);
            let legendSettings: ILegendSettings;
            legendSettings = this.getLegendSettings(this.dataViews);
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];
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
                    let legendData: ILegendDataPoint;
                    for (legendData of this.legendDataPoints) {
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
                            color: rootSettings.color
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
                default:
                    break;
            }

            return objectEnumeration;
        }
    }
}
