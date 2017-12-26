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

    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {
                return defaultValue;
            }

            let objectOrMap: DataViewObject;
            objectOrMap = objects[propertyId.objectName];
            const object: DataViewObject = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                const object: DataViewObject = <DataViewObject>objects[objectName];

                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                const map: DataViewObjectMap = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects,
            propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            const value: Fill = getValue(objects, propertyId);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object) {
                return defaultValue;
            }

            // tslint:disable-next-line:no-any
            const propertyValue: any = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            const value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    // tslint:disable-next-line:no-any
    export let visualProperties: any = {
        hierarchyData: {
            expanded: <DataViewObjectPropertyIdentifier>{ objectName: 'hierarchyData', propertyName: 'expanded' }
        },
        resizeData: {
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'resizeData', propertyName: 'width' }
        },
        headerSettings: {
            headerColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'headerColor' },
            bgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'bgColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'fontSize' }
        },
        labelSettings: {
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'labelColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            gap: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'gap' },
            RowbgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'RowbgColor' }
        },
        totalSettings: {
            totalText: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalText' },
            totalColor: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'fontSize' }
        },
        indicatorSettings: {
            IndicatorSwitch: <DataViewObjectPropertyIdentifier>{ objectName: 'indicatorSettings', propertyName: 'IndicatorSwitch' }
        },
        PrefixSettings: {
            prefixText: <DataViewObjectPropertyIdentifier>{ objectName: 'PrefixSettings', propertyName: 'prefixText' }
        }
    };

    export interface IHeaderSettings {
        headerColor: string;
        bgColor: string;
        fontSize: number;
    }

    export interface ILabelSettings {
        labelColor: string;
        fontSize: number;
        gap: number;
        RowbgColor: string;
    }

    export interface ITotalSettings {
        totalText: string;
        totalColor: string;
        fontSize: number;
    }

    export interface IIndicatorSettings {
        IndicatorSwitch: boolean;

    }
    export interface IPrefixSettings {
        prefixText: string;
    }

    export interface IKPISettings {
        value: boolean;
        key: string;
        selectionId: {};
    }
    export class Visual implements IVisual {
        // tslint:disable-next-line:no-any
        private static currentLevelData: any = [];
        private visualHost: IVisualHost;
        private target: HTMLElement;
        private data: DataViewCategorical;
        private noOflevels: number;
        private prevNoOfLevels: number;
        private prevNoOfMeasures: number;
        private numberOfMeasures: number;
        private measuresData: DataViewValueColumn[];
        private totalRowsLength: number;
        private indicatorsData: PrimitiveValue[];
        private viewport: IViewport;
        private dataViews: DataView;
        private levelWidthPercentage: number;
        private measuresWidthPercentage: number;
        private gapDivPercentage: number;
        private expandedData: string[];
        // tslint:disable-next-line:no-any
        private resizeData: any;
        private scrollData: number[];
        private kpiDisplay: IKPISettings[];
        private contentElement: JQuery;

        constructor(options: VisualConstructorOptions) {
            this.visualHost = options.host;
            this.target = options.element;
            this.levelWidthPercentage = 20.5;
            this.measuresWidthPercentage = 76;
            this.gapDivPercentage = 1.5;
            this.expandedData = [];
            this.resizeData = {};
            this.scrollData = [];
        }

        public getDistinctElements(val: PrimitiveValue, i: number, self: PrimitiveValue[]): boolean {
            return self.indexOf(val) === i;
        }

        public getNumberOfGaps(): number {
            const labelSettings: ILabelSettings = this.getlabelSettings(this.dataViews);
            let numberOfgaps: number = 0;
            if (labelSettings.gap !== 0 && labelSettings.gap < this.numberOfMeasures) {
                numberOfgaps = this.numberOfMeasures / labelSettings.gap;
                if (this.numberOfMeasures % labelSettings.gap === 0) {
                    numberOfgaps = numberOfgaps - 1;
                }
                numberOfgaps = Math.floor(numberOfgaps);
            }

            return numberOfgaps;
        }

        public getAggregate(dataset: DataViewValueColumn[], measure: number, hierarchyId: String): number {
            let sum: number = null;
            if (hierarchyId !== 'none') {
                const hierarchyArray: string[] = hierarchyId.split('-$>');
                const level: number = hierarchyArray.length - 1;
                let counter: number;
                let currentLevelDataName: string;
                for (let irow: number = 0; irow < this.totalRowsLength; irow++) {
                    counter = 0;
                    for (let iLevel: number = 0; iLevel <= level; iLevel++) {
                        currentLevelDataName = this.data.categories[iLevel].values[irow] ?
                            this.data.categories[iLevel].values[irow].toString() : '$blankData$';
                        if (currentLevelDataName === hierarchyArray[iLevel].toString()) {
                            counter += 1;
                            if (counter === level + 1) {
                                if (measure === undefined) {
                                    if (dataset[irow] !== null) {
                                        sum += parseFloat(dataset[irow].toString());
                                    }
                                } else {
                                    if (dataset[measure].values[irow] !== null) {
                                        sum += parseFloat(dataset[measure].values[irow].toString());
                                    }
                                }
                            }
                        }
                    }
                }

                return sum;
            } else {
                for (let irow: number = 0; irow < this.totalRowsLength; irow++) {
                    if (measure === undefined) {
                        if (dataset[irow] !== null) {
                            sum += parseFloat(dataset[irow].toString());
                        }
                    } else {
                        if (dataset[measure].values[irow] !== null) {
                            sum += parseFloat(dataset[measure].values[irow].toString());
                        }
                    }
                }

                return sum;
            }
        }

        public showNextLevel(hierarchyId: string, cacheFlag: boolean): void {
            const context: JQuery = $(`[hierarchyId="${hierarchyId}"]`);
            if (context &&
                context[0] &&
                context[0].children[0] &&
                context[0].children[0].children[0]) {
                context[0].children[0].children[0].classList.remove('gridPlusIcon');
                context[0].children[0].children[0].classList.add('gridMinusIcon');
                context[0].children[0].children[0].setAttribute('status', 'expanded');
                const tableContent: string = this.printLevel(hierarchyId);
                context.append(tableContent);

                const levelLength: number = Visual.currentLevelData.length;
                const hierarchyArray: string[] = hierarchyId.split('-$>');
                const level: number = hierarchyArray.length;
                const parentId: string = hierarchyArray[level - 1];

                for (let iRow: number = 0; iRow < levelLength; iRow++) {

                    let newHierarchyId: string;
                    const currentLevelDataName: string = Visual.currentLevelData[iRow].value ?
                        Visual.currentLevelData[iRow].value.toString() : '$blankData$';
                    if (level === 0) {
                        newHierarchyId = currentLevelDataName;
                    } else {
                        newHierarchyId = `${hierarchyId}-$>${currentLevelDataName}`;
                    }

                    $(`.gridText${iRow}`).parent(`.gridLevels.rowLevel${level}`).parent(`[eleId=""]`).attr('parentId', parentId);
                    $(`.gridText${iRow}`).parent(`.gridLevels.rowLevel${level}`).parent(`[parentId="${parentId}"]`)
                        .attr('eleId', Visual.currentLevelData[iRow].value);
                    $(`.gridText${iRow}`).parent(`.gridLevels.rowLevel${level}`).parent(`[parentId="${parentId}"]`)
                        .attr('hierarchyId', newHierarchyId);
                    $(`[parentId="${parentId}"]`).children(`[class="gridLevels rowLevel${level}"]`)
                        .children(`.gridText${iRow}`).text(currentLevelDataName === '$blankData$' ? '(Blank)' : currentLevelDataName);
                }

                this.addClickListener(context);
            }
        }

        public hideNextLevel(currentContext: HTMLElement): void {
            for (let iElement: number = 0; iElement < this.expandedData.length; iElement++) {
                if (this.expandedData[iElement].indexOf(currentContext.parentElement.parentElement.getAttribute('hierarchyId')) !== -1) {
                    this.expandedData.splice(iElement, 1);
                    iElement--;
                }
            }
            this.persistExpandedData();
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public printLevel(hierarchyId: String): string {
            const labelSettings: ILabelSettings = this.getlabelSettings(this.dataViews);
            const indicatorSettings: IIndicatorSettings = this.getindicatorSettings(this.dataViews);
            let tableContent: string = '';
            const paddingLeft: number = 0;
            const hierarchyArray: string[] = hierarchyId.split('-$>');
            let level: number = hierarchyArray.length;
            const parentId: string = hierarchyArray[level - 1];

            if (hierarchyId === 'root') {
                level = 0;
            }
            const filteredCurrentLevelData: PrimitiveValue[] = this.data.categories[level].values;
            // tslint:disable-next-line:no-any
            let currentLevelData: any = [];
            const tempValues: PrimitiveValue[] = [];
            let currentLevelDataName: string;
            Visual.currentLevelData = [];
            if (hierarchyId !== 'root') {
                let counter: number;
                for (let irow: number = 0; irow < this.totalRowsLength; irow++) {
                    counter = 0;
                    for (let iLevel: number = 0; iLevel < level; iLevel++) {
                        currentLevelDataName = this.data.categories[iLevel].values[irow] ?
                        this.data.categories[iLevel].values[irow].toString() : '$blankData$';
                        if (currentLevelDataName === hierarchyArray[iLevel].toString()) {
                            counter += 1;
                            if (counter === level) {
                                currentLevelData.push({
                                    key: irow,
                                    value: filteredCurrentLevelData[irow]
                                });
                                tempValues.push(filteredCurrentLevelData[irow]);
                            }
                        }
                    }
                }
                if (level !== this.noOflevels - 1) {
                    currentLevelData = [];
                    let items: PrimitiveValue[];
                    items = tempValues.filter(this.getDistinctElements);
                    let itemsLength: number;
                    itemsLength = items.length;
                    for (let iValue: number = 0; iValue < itemsLength; iValue++) {
                        currentLevelData.push({
                            key: iValue,
                            value: items[iValue]
                        });
                    }
                }
            } else {
                let items: PrimitiveValue[];
                items = filteredCurrentLevelData.filter(this.getDistinctElements);
                let itemsLength: number;
                itemsLength = items.length;
                for (let iValue: number = 0; iValue < itemsLength; iValue++) {
                    currentLevelData.push({
                        key: iValue,
                        value: items[iValue]
                    });
                }
            }
            const levelLength: number = currentLevelData.length;
            for (let i: number = 0; i < levelLength; i++) {
                Visual.currentLevelData[i] = (currentLevelData[i]);
            }

            const numberOfgaps: number = this.getNumberOfGaps();

            const gridWidth: number = 250 + 20 + (this.numberOfMeasures * 100) + (this.numberOfMeasures * 1) + (numberOfgaps * 20);

            let levelMarginLeft: number = 30;
            levelMarginLeft += level * 20;

            for (let iRow: number = 0; iRow < levelLength; iRow++) {
                let newHierarchyId: string;
                currentLevelDataName = currentLevelData[iRow].value ? currentLevelData[iRow].value.toString() : '$blankData$';
                if (level === 0) {
                    newHierarchyId = currentLevelDataName;
                } else {
                    newHierarchyId = `${hierarchyId}-$>${currentLevelDataName}`;
                }

                //print levels column
                tableContent += `<div class = "gridRow" style = "width:${gridWidth}px" level="${level}" eleId="" >
                <div class = "gridLevels rowLevel${level}" style = "color:${labelSettings.labelColor};
                background-color:${labelSettings.RowbgColor};
                font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:${labelSettings.fontSize}px">`;

                if (level !== this.noOflevels - 1) {
                    tableContent += `<span status="collapsed"
                        style="margin-left:${levelMarginLeft}px" class="expandCollapseButton gridPlusIcon"></span>`;
                }
                tableContent += `<span class="gridText${iRow}" style="margin-left:${levelMarginLeft}px"></span></div>`;

                let gapCounter: number = -1;
                tableContent += `<div class="gapDiv"></div>`;

                //print measure columns
                for (let iMeasure: number = 0; iMeasure < this.numberOfMeasures; iMeasure++) {
                    gapCounter += 1;
                    if (gapCounter === labelSettings.gap && gapCounter !== 0) {
                        tableContent += '<div class="gapDiv"></div>';
                        gapCounter = 0;
                    }
                    const formatter: IValueFormatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format });
                    let measureValue: PrimitiveValue;
                    let formattedMeasureData: string;
                    let tooltipFormattedMeasureData: string;
                    if (level !== this.noOflevels - 1) {
                        measureValue = this.getAggregate(this.measuresData, iMeasure, newHierarchyId);
                        formattedMeasureData = formatter.format(measureValue);
                        tooltipFormattedMeasureData = formatter.format(measureValue);
                    } else {
                        measureValue = this.measuresData[iMeasure].values[currentLevelData[iRow].key];
                        formattedMeasureData = formatter.format(measureValue);
                        tooltipFormattedMeasureData = formatter.format(measureValue);
                    }
                    tableContent += `<div class = "gridMeasures rowLevel${level} measure${(iMeasure + 1)}"
                         style = "color:${labelSettings.labelColor}; background-color:${labelSettings.RowbgColor};
                        font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:${labelSettings.fontSize}px">
                        <span class="gridText" title="${tooltipFormattedMeasureData}">${formattedMeasureData}</span>`;

                    //display indicators
                    if (this.indicatorsData[this.measuresData[iMeasure].source.displayName]) {
                        let indicatorMeasureValue: number;
                        let difference: number = 0;
                        let differenceModified: string = '';

                        if (level !== this.noOflevels - 1) {
                            indicatorMeasureValue = this.getAggregate(
                                this.indicatorsData
                                [this.measuresData[iMeasure].source.displayName],
                                undefined, newHierarchyId);
                        } else {
                            indicatorMeasureValue = this.indicatorsData[this.measuresData[iMeasure]
                                .source.displayName][currentLevelData[iRow].key];
                        }

                        if (measureValue !== null) {
                            difference = parseFloat(measureValue.toString()) - indicatorMeasureValue;
                        } else {
                            difference = null;
                        }

                        if (difference !== null) {

                            differenceModified = Math.abs(difference -
                                parseFloat(difference.toString())) > 0 ? difference.toFixed(2) : difference.toString();

                            // indicator toggle
                            for (let l: number = 0; l < this.kpiDisplay.length; l++) {
                                if (this.kpiDisplay[l].key === this.measuresData[iMeasure].source.displayName) {
                                    if (this.kpiDisplay[l].value === true) {
                                        if (difference > 0) {
                                            tableContent += '<span title="+';
                                            tableContent += formatter.format(parseFloat(differenceModified));
                                            tableContent += '" class="up-red"></span>';
                                        } else if (difference === 0) {
                                            tableContent += '<span title="No change" class="right-grey"></span>';
                                        } else {
                                            if (formatter.format(parseFloat(differenceModified))[0] === '('
                                                && formatter.format(parseFloat(differenceModified))[formatter.format(
                                                    parseFloat(differenceModified)).length - 1] === ')') {
                                                tableContent += '<span title="-';
                                                tableContent += formatter.format(
                                                    parseFloat(differenceModified)).slice(1, -1);
                                                tableContent += '" class="down-green"></span>';
                                            } else {
                                                tableContent += '<span title="';
                                                tableContent += formatter.format(parseFloat(differenceModified));
                                                tableContent += '" class="down-green"></span>';
                                            }
                                        }
                                    } else {
                                        if (difference > 0) {
                                            tableContent += '<span title="+';
                                            tableContent += formatter.format(parseFloat(differenceModified));
                                            tableContent += '" class="up-green"></span>';
                                        } else if (difference === 0) {
                                            tableContent += '<span title="No change" class="right-grey"></span>';
                                        } else {
                                            if (formatter.format(parseFloat(differenceModified))[0] === '(' &&
                                                formatter.format(parseFloat(differenceModified))[formatter.format(
                                                    parseFloat(differenceModified)).length - 1] === ')') {
                                                tableContent += '<span title="-';
                                                tableContent += formatter.format(parseFloat(differenceModified)).slice(1, -1);
                                                tableContent += '" class="down-red"></span>';
                                            } else {
                                                tableContent += '<span title="';
                                                tableContent += formatter.format(parseFloat(differenceModified));
                                                tableContent += '" class="down-red"></span>';
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    tableContent += '</div>';
                }
                tableContent += '</div>';
            }

            return tableContent;
        }

        // tslint:disable-next-line:cyclomatic-complexity
        public update(options: VisualUpdateOptions): void {
            this.target.innerHTML = `<div id = "baseContainer"></div>`;
            let baseContainer: JQuery;
            baseContainer = $('#baseContainer');
            baseContainer.css('width', `${options.viewport.width}px`);
            baseContainer.css('height', `${options.viewport.height}px`);

            if (options &&
                options.dataViews[0] &&
                options.dataViews[0].categorical &&
                options.dataViews[0].categorical.categories[0] &&
                options.dataViews[0].categorical.categories[0].values) {

                this.dataViews = options.dataViews[0];

                const headerSettings: IHeaderSettings = this.getheaderSettings(this.dataViews);
                const labelSettings: ILabelSettings = this.getlabelSettings(this.dataViews);
                const totalSettings: ITotalSettings = this.gettotalSettings(this.dataViews);
                const indicatorSettings: IIndicatorSettings = this.getindicatorSettings(this.dataViews);
                const prefixSettings: IPrefixSettings = this.getPrefixSettings(this.dataViews);

                this.viewport = options.viewport;
                this.totalRowsLength = options.dataViews[0].categorical.categories[0].values.length;
                this.noOflevels = options.dataViews[0].categorical.categories.length;

                this.data = options.dataViews[0].categorical;

                this.measuresData = [];
                this.indicatorsData = [];
                this.kpiDisplay = [];

                let objects: DataViewObjects;
                objects = this.dataViews.metadata.objects;

                let metadataColumns: DataViewMetadataColumn[];
                metadataColumns = options.dataViews[0].metadata.columns;
                let measures: string[];
                measures = [];
                let measureLiteral: string;
                let measure2Literal: string;
                measureLiteral = 'measure';
                measure2Literal = 'measure2';

                for (let iMeasure: number = 0; iMeasure < options.dataViews[0].categorical.values.length; iMeasure++) {

                    if (options.dataViews[0].categorical.values[iMeasure].source.roles[measureLiteral]) {

                        this.measuresData.push(options.dataViews[0].categorical.values[iMeasure]);
                        measures.push(options.dataViews[0].categorical.values[iMeasure].source.displayName);
                    }
                }

                for (let iMeasure: number = 0; iMeasure < options.dataViews[0].categorical.values.length; iMeasure++) {
                    if (options.dataViews[0].categorical.values[iMeasure].source.roles[measure2Literal]) {
                        let currentColumn: DataViewMetadataColumn = null;
                        let measureName: string;
                        let prefixText: string;
                        measureName = options.dataViews[0].categorical.values[iMeasure].source.displayName.toString();
                        prefixText = prefixSettings.prefixText;
                        if (prefixText && measureName.indexOf(prefixText) === 0
                            && measures.indexOf(measureName.substr(prefixText.length, measureName.length)) >= 0) {
                            this.indicatorsData[measureName.substr(prefixText.length, measureName.length)] =
                                options.dataViews[0].categorical.values[iMeasure].values;

                            for (let b: number = 0; b < metadataColumns.length; b++) {
                                if (metadataColumns[b].displayName === measureName) {
                                    currentColumn = metadataColumns[b];
                                }
                            }
                            this.kpiDisplay.push({
                                key: measureName.substr(prefixText.length, measureName.length),
                                value: getValue<boolean>(currentColumn.objects, 'indicatorSettings', 'IndicatorSwitch', false),
                                selectionId: { metadata: currentColumn.queryName }
                            });
                        }
                    }
                }

                this.numberOfMeasures = this.measuresData.length;

                const numberOfgaps: number = this.getNumberOfGaps();

                const gridWidth: number = 250 + 20 + this.numberOfMeasures * 100 + this.numberOfMeasures * 1 + numberOfgaps * 20;

                //Add Table headers
                const tableHeaderRow: HTMLDivElement = document.createElement('div');
                tableHeaderRow.setAttribute('class', 'gridRow');
                tableHeaderRow.setAttribute('id', 'headerRow');
                tableHeaderRow.style.width = `${gridWidth}px`;

                //level headers
                const gridLevels: HTMLDivElement = document.createElement('div');
                gridLevels.setAttribute('class', 'gridLevels');
                gridLevels.style.backgroundColor = headerSettings.bgColor;
                gridLevels.style.color = headerSettings.headerColor;
                gridLevels.style.fontSize = `${headerSettings.fontSize}px`;

                let textSpan: HTMLSpanElement = document.createElement('span');
                textSpan.setAttribute('class', 'gridText headerLevel');
                textSpan.setAttribute('title', options.dataViews[0].categorical.categories[0].source.displayName);
                textSpan.textContent = options.dataViews[0].categorical.categories[0].source.displayName;
                gridLevels.appendChild(textSpan);

                //resizers
                let resizer: HTMLSpanElement = document.createElement('span');
                resizer.setAttribute('columnId', 'gridLevels');
                resizer.setAttribute('class', 'resizer');
                resizer.style.backgroundColor = headerSettings.bgColor;
                gridLevels.appendChild(resizer);
                tableHeaderRow.appendChild(gridLevels);

                //gap div
                let gapCounter: number = -1;
                let gapDiv: HTMLDivElement = document.createElement('div');
                gapDiv.setAttribute('class', 'gapDiv');
                tableHeaderRow.appendChild(gapDiv);

                //measure headers
                for (let iMeasure: number = 0; iMeasure < this.numberOfMeasures; iMeasure++) {
                    gapCounter += 1;
                    if (gapCounter === labelSettings.gap && gapCounter !== 0) {
                        gapDiv = document.createElement('div');
                        gapDiv.setAttribute('class', 'gapDiv');
                        tableHeaderRow.appendChild(gapDiv);
                        gapCounter = 0;
                    }

                    //measureNames
                    const gridMeasures: HTMLDivElement = document.createElement('div');
                    gridMeasures.setAttribute('class', `gridMeasures measure${(iMeasure + 1)}`);
                    gridMeasures.style.backgroundColor = headerSettings.bgColor;
                    gridMeasures.style.color = headerSettings.headerColor;
                    gridMeasures.style.fontSize = `${headerSettings.fontSize}px`;

                    textSpan = document.createElement('span');
                    textSpan.setAttribute('class', 'gridText');
                    textSpan.setAttribute('title', options.dataViews[0].categorical.values[iMeasure].source.displayName);
                    textSpan.textContent = options.dataViews[0].categorical.values[iMeasure].source.displayName;
                    gridMeasures.appendChild(textSpan);

                    //resizers
                    resizer = document.createElement('span');
                    resizer.setAttribute('columnId', `measure${(iMeasure + 1)}`);
                    resizer.setAttribute('class', 'resizer');
                    resizer.style.backgroundColor = headerSettings.bgColor;
                    gridMeasures.appendChild(resizer);
                    tableHeaderRow.appendChild(gridMeasures);
                }

                baseContainer.append(tableHeaderRow);

                //hierarchy content
                const content: HTMLDivElement = document.createElement('div');
                content.setAttribute('id', 'content');
                baseContainer.append(content);

                this.contentElement = $('#content');
                this.contentElement.css('height', `${options.viewport.height - 25}px`);
                this.contentElement.css('width', '100%');

                //print table
                const tableContent: string = this.printLevel('root');  //hierarchId=root id=root level=0
                this.contentElement.append(tableContent);
                let currentLevelDataName: string;
                for (let iRow: number = 0; iRow < Visual.currentLevelData.length; iRow++) {
                    currentLevelDataName = Visual.currentLevelData[iRow].value ?
                        Visual.currentLevelData[iRow].value.toString() : '$blankData$';
                    $(`.gridText${iRow}`).parent(`.gridLevels.rowLevel0`).parent(`[class="gridRow"]`)
                        .attr('eleId', currentLevelDataName);
                    $(`.gridText${iRow}`).parent('.gridLevels.rowLevel0').parent('[class="gridRow"]').attr('parentId', 'root');
                    $(`.gridText${iRow}`).parent('.gridLevels.rowLevel0').parent('[class="gridRow"]')
                        .attr('hierarchyId', currentLevelDataName);
                    $(`.gridText${iRow}`).text(currentLevelDataName === '$blankData$' ? '(Blank)' : currentLevelDataName);
                }

                //total row
                const tableTotalRow: HTMLDivElement = document.createElement('div');
                tableTotalRow.setAttribute('class', 'gridRow');
                tableTotalRow.setAttribute('id', 'totalGridRow');
                tableTotalRow.style.width = `${gridWidth}px`;

                const totalLabel: HTMLDivElement = document.createElement('div');
                totalLabel.setAttribute('class', 'gridLevels totalGridLevel');
                totalLabel.style.color = totalSettings.totalColor;
                totalLabel.style.fontSize = `${totalSettings.fontSize}px`;
                textSpan = document.createElement('span');
                textSpan.setAttribute('class', 'gridText totalLevel');
                textSpan.setAttribute('title', totalSettings.totalText);
                textSpan.textContent = totalSettings.totalText;
                totalLabel.appendChild(textSpan);
                tableTotalRow.appendChild(totalLabel);

                //gap div
                gapCounter = -1;
                gapDiv = document.createElement('div');
                gapDiv.setAttribute('class', 'gapDiv');
                tableTotalRow.appendChild(gapDiv);

                //total measures
                for (let iMeasure: number = 0; iMeasure < this.numberOfMeasures; iMeasure++) {

                    gapCounter += 1;
                    if (gapCounter === labelSettings.gap && gapCounter !== 0) {
                        gapDiv = document.createElement('div');
                        gapDiv.setAttribute('class', 'gapDiv');
                        tableTotalRow.appendChild(gapDiv);
                        gapCounter = 0;
                    }

                    const formatter: IValueFormatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format });

                    const totalMeasures: HTMLDivElement = document.createElement('div');
                    totalMeasures.setAttribute('class', `gridMeasures totalGridMeasures measure${(iMeasure + 1)}`);
                    totalMeasures.style.color = totalSettings.totalColor;
                    totalMeasures.style.fontSize = `${totalSettings.fontSize}px`;

                    textSpan = document.createElement('span');
                    textSpan.setAttribute('class', 'gridText');
                    const measureValue: number = this.getAggregate(this.measuresData, iMeasure, 'none');
                    textSpan.setAttribute('title', formatter.format(measureValue));
                    textSpan.textContent = formatter.format(measureValue);
                    totalMeasures.appendChild(textSpan);

                    //display indicators
                    if (this.indicatorsData[this.measuresData[iMeasure].source.displayName]) {
                        let indicatorMeasureValue: number = 0;
                        let difference: number = 0;
                        const arrowClass: number = 0;
                        let differenceModified: string = '';
                        indicatorMeasureValue = this.getAggregate(
                            this.indicatorsData[this.measuresData[iMeasure].source.displayName],
                            undefined, 'none');

                        if (measureValue !== null) {
                            difference = measureValue - indicatorMeasureValue;
                        } else {
                            difference = null;
                        }

                        if (difference !== null) {
                            differenceModified = Math.abs(difference -
                                parseInt(difference.toString(), 10)) > 0 ? difference.toFixed(2) : difference.toString();
                            let kpiArrow: HTMLSpanElement;
                            kpiArrow = document.createElement('span');

                            // indicator toggle
                            for (let l: number = 0; l < this.kpiDisplay.length; l++) {
                                if (this.kpiDisplay[l].key === this.measuresData[iMeasure].source.displayName) {
                                    if (this.kpiDisplay[l].value === true) {
                                        kpiArrow = document.createElement('span');
                                        if (difference > 0) {
                                            let addLiteral: string;
                                            addLiteral = '+';
                                            kpiArrow.setAttribute('class', 'up-red');
                                            kpiArrow.setAttribute('title', addLiteral + formatter.format(parseFloat(differenceModified)));
                                        } else if (difference === 0) {
                                            kpiArrow.setAttribute('class', 'right-grey');
                                            kpiArrow.setAttribute('title', 'No change');
                                        } else {
                                            if (formatter.format(parseFloat(differenceModified))[0] === '(' &&
                                                formatter.format(parseFloat(differenceModified))[formatter.format(
                                                    parseFloat(differenceModified)).length - 1] === ')') {
                                                kpiArrow.setAttribute('class', 'down-green');
                                                kpiArrow.setAttribute(
                                                    'title', formatter.format(parseFloat(differenceModified)).slice(1, -1));
                                            } else {
                                                kpiArrow.setAttribute('class', 'down-green');
                                                kpiArrow.setAttribute('title', formatter.format(parseFloat(differenceModified)));
                                            }
                                        }
                                        totalMeasures.appendChild(kpiArrow);
                                    } else {
                                        if (difference > 0) {
                                            let addLiteral: string;
                                            addLiteral = '+';
                                            kpiArrow.setAttribute('class', 'up-green');
                                            kpiArrow.setAttribute('title', addLiteral + formatter.format(parseFloat(differenceModified)));
                                        } else if (difference === 0) {
                                            kpiArrow.setAttribute('class', 'right-grey');
                                            kpiArrow.setAttribute('title', 'No change');
                                        } else {
                                            if (formatter.format(parseFloat(differenceModified))[0] === '('
                                                && formatter.format(parseFloat(differenceModified))[formatter.format(
                                                    parseFloat(differenceModified)).length - 1] === ')') {
                                                kpiArrow.setAttribute('class', 'down-red');
                                                kpiArrow.setAttribute(
                                                    'title', formatter.format(parseFloat(differenceModified)).slice(1, -1));
                                            } else {
                                                kpiArrow.setAttribute('class', 'down-red');
                                                kpiArrow.setAttribute('title', formatter.format(parseFloat(differenceModified)));
                                            }
                                        }
                                        totalMeasures.appendChild(kpiArrow);
                                    }
                                }
                            }
                        }
                    }
                    tableTotalRow.appendChild(totalMeasures);
                }
                this.contentElement.append(tableTotalRow);

                //add click listener
                this.addClickListener(undefined);

                if ((!!this.prevNoOfLevels && this.noOflevels !== this.prevNoOfLevels) ||
                    (!!this.prevNoOfMeasures && this.numberOfMeasures !== this.prevNoOfMeasures)) {
                    //Reset all persisted data
                    this.expandedData = [];
                    this.persistExpandedData();
                    this.resizeData = {};
                    this.persistResizeData();
                } else {
                    //Print persisted hierarchy data
                    this.printExpandedData();

                    //Set resized columns data
                    this.setResizeData();

                    //Set scroll data
                    this.setScrollData();
                }

                this.prevNoOfLevels = this.noOflevels;
                this.prevNoOfMeasures = this.numberOfMeasures;

                //Add resize listener
                this.addResizeListener();

                //Add content scroll listener
                this.addScrollListener();

            }
            //end if (dataview validator)
        }

        public addClickListener(currentContext: JQuery): void {
            const iThis: Visual = this;
            let query: JQuery = $('.expandCollapseButton');
            if (currentContext) {
                const eleId: string = currentContext[0].getAttribute('eleId');
                query = currentContext.children(`[parentid="${eleId}"]`).find('.expandCollapseButton');
            }
            // tslint:disable-next-line:no-any
            let flag: any;
            $(query).mousedown(function (): void {
                flag = this;
            });
            $(query).mouseup(function (): void {
                if (flag === this) {
                    flag = 0;
                    if ($(this).attr('status') === 'expanded') {
                        iThis.hideNextLevel(this);
                    } else {
                        const hierarchId: string = this.parentElement.parentElement.getAttribute('hierarchyId');
                        iThis.expandedData.push(hierarchId);
                        iThis.persistExpandedData();
                    }
                }
            });
        }

        public addScrollListener(): void {
            const iThis: Visual = this;
            const scrolling: number = 0;
            let scrollTopLiteral: string;
            let scrollLeftLiteral: string;
            scrollTopLiteral = 'scrollTop';
            scrollLeftLiteral = 'scrollLeft';
            this.contentElement = $('#content');
            this.contentElement.scroll(function (): void {
                iThis.scrollData[scrollTopLiteral] = $(this).scrollTop();
                iThis.scrollData[scrollLeftLiteral] = $(this).scrollLeft();
                $('#headerRow').css('left', `${-$('#content').scrollLeft()}px`);
            });
        }

        public setScrollData(): void {
            let scrollTopLiteral: string;
            let scrollLeftLiteral: string;
            scrollTopLiteral = 'scrollTop';
            scrollLeftLiteral = 'scrollLeft';
            this.contentElement = $('#content');
            if (this.scrollData) {
                this.contentElement.scrollTop(this.scrollData[scrollTopLiteral]);
                this.contentElement.scrollLeft(this.scrollData[scrollLeftLiteral]);
                $('#headerRow').css('left', `${-$('#content').scrollLeft()}px`);
            }
        }

        public addResizeListener(): void {
            let pressed: boolean = false;
            let moved: boolean = false;
            let start: JQuery;
            let columnClass: string;
            let startX: number;
            let startWidth: number;
            let startGridWidth: number;
            let xDiff: number = 0;
            let calculateWidth: number;
            let calculatedGridWidth: number;
            const iThis: Visual = this;

            $('.resizer').mousedown(function (e: JQueryMouseEventObject): void {
                columnClass = this.getAttribute('columnId');
                start = $(`.${columnClass}`);
                pressed = true;
                startX = e.pageX;
                startWidth = start.width();
                startGridWidth = $('.gridRow').width();
            });

            $(document).mousemove(function (e: JQueryMouseEventObject): void {
                if (pressed) {
                    moved = true;
                    xDiff = (e.pageX - startX);
                    xDiff = xDiff < (-startWidth + 23) ? (-startWidth + 23) : xDiff;
                    calculateWidth = startWidth + xDiff;
                    calculatedGridWidth = startGridWidth + xDiff;
                    $(start).width(calculateWidth);
                    $('.gridRow').width(calculatedGridWidth);
                }
            });

            $(document).mouseup(function (): void {
                let gridRowLiteral: string;
                gridRowLiteral = 'gridRow';

                if (pressed) {
                    pressed = false;
                }
                if (moved && columnClass) {
                    iThis.resizeData[columnClass] = calculateWidth;
                    iThis.resizeData[gridRowLiteral] = calculatedGridWidth;
                    iThis.persistResizeData();
                    columnClass = undefined;
                    moved = false;
                }
            });
        }

        public persistResizeData(): void {
            const properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[visualProperties.resizeData.width.propertyName] = JSON.stringify(this.resizeData);
            const width: VisualObjectInstancesToPersist = {
                replace: [
                    <VisualObjectInstance>{
                        objectName: visualProperties.resizeData.width.objectName,
                        selector: null,
                        properties: properties
                    }]
            };
            this.visualHost.persistProperties(width);
        }

        public persistExpandedData(): void {
            const properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[visualProperties.hierarchyData.expanded.propertyName] = this.expandedData.join('=#=');
            const expanded: VisualObjectInstancesToPersist = {
                merge: [
                    <VisualObjectInstance>{
                        objectName: visualProperties.hierarchyData.expanded.objectName,
                        selector: null,
                        properties: properties
                    }]
            };
            this.visualHost.persistProperties(expanded);
        }

        public printExpandedData(): void {
            let objects: DataViewObjects = null;
            objects = this.dataViews.metadata.objects;
            const getExpandedDataString: string = DataViewObjects.getValue<string>(objects, visualProperties.hierarchyData.expanded, '');
            if (getExpandedDataString) {
                const expandedDataSplit: string[] = getExpandedDataString.split('=#=');
                this.expandedData = expandedDataSplit;
                expandedDataSplit.forEach((element: string) => {
                    this.showNextLevel(element, true);
                });
            }
        }

        public setResizeData(): void {
            let objects: DataViewObjects = null;
            objects = this.dataViews.metadata.objects;
            const getJSONString: string = DataViewObjects.getValue<string>(objects, visualProperties.resizeData.width, '');
            if (getJSONString) {
                // tslint:disable-next-line:no-any
                const parsedString: any = JSON.parse(getJSONString);
                this.resizeData = parsedString;
                for (const iData in this.resizeData) {
                    if (iData === 'gridRow') {
                        const noOfGaps: number = this.getNumberOfGaps();
                        $(`.${iData}`).width(this.resizeData[iData] + (noOfGaps * 20));
                    } else {
                        $(`.${iData}`).width(this.resizeData[iData]);
                    }

                }
            }
        }

        public getheaderSettings(dataView: DataView): IHeaderSettings {
            let objects: DataViewObjects = null;
            const settings: IHeaderSettings = this.getDefaultheaderSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const properties: any = visualProperties;
            settings.headerColor = DataViewObjects.getFillColor(objects, properties.headerSettings.headerColor, settings.headerColor);
            settings.bgColor = DataViewObjects.getFillColor(objects, properties.headerSettings.bgColor, settings.bgColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.headerSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;

            return settings;
        }

        public getlabelSettings(dataView: DataView): ILabelSettings {
            let objects: DataViewObjects = null;
            const settings: ILabelSettings = this.getDefaultlabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const properties: any = visualProperties;
            settings.labelColor = DataViewObjects.getFillColor(objects, properties.labelSettings.labelColor, settings.labelColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;
            settings.gap = DataViewObjects.getValue(objects, properties.labelSettings.gap, settings.gap);
            settings.gap = settings.gap >= 0 ? settings.gap : 0;
            settings.RowbgColor = DataViewObjects.getFillColor(objects, properties.labelSettings.RowbgColor, settings.RowbgColor);

            return settings;
        }

        public gettotalSettings(dataView: DataView): ITotalSettings {
            let objects: DataViewObjects = null;
            const settings: ITotalSettings = this.getDefaulttotalSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            const properties: any = visualProperties;
            settings.totalText = DataViewObjects.getValue(objects, properties.totalSettings.totalText, settings.totalText);
            settings.totalColor = DataViewObjects.getFillColor(objects, properties.totalSettings.totalColor, settings.totalColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.totalSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;

            return settings;
        }

        public getindicatorSettings(dataView: DataView): IIndicatorSettings {
            let objects: DataViewObjects = null;
            const settings: IIndicatorSettings = this.getDefaultindicatorSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return settings; }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let properties: any;
            properties = visualProperties;
            settings.IndicatorSwitch = DataViewObjects.getValue(
                objects, properties.indicatorSettings.IndicatorSwitch, settings.IndicatorSwitch);

            return settings;
        }

        public getPrefixSettings(dataView: DataView): IPrefixSettings {
            let objects: DataViewObjects = null;
            let settings: IPrefixSettings;
            settings = this.getDefaultPrefixSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return settings; }
            objects = dataView.metadata.objects;
            // tslint:disable-next-line:no-any
            let properties: any;
            properties = visualProperties;
            settings.prefixText = DataViewObjects.getValue(objects, properties.PrefixSettings.prefixText, settings.prefixText);

            return settings;
        }

        public getDefaultheaderSettings(): IHeaderSettings {
            return {
                headerColor: '#FFFFFF',
                bgColor: '#505050',
                fontSize: 12
            };
        }

        public getDefaultlabelSettings(): ILabelSettings {
            return {
                labelColor: '#000000',
                fontSize: 12,
                gap: 0,
                RowbgColor: '#f0f0f0'
            };
        }

        public getDefaulttotalSettings(): ITotalSettings {
            return {
                totalText: 'Total',
                totalColor: '#000000',
                fontSize: 12
            };
        }
        public getDefaultindicatorSettings(): IIndicatorSettings {
            return {
                IndicatorSwitch: false
            };
        }

        public getDefaultPrefixSettings(): IPrefixSettings {
            return {
                prefixText: ''
            };
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            const headerSettings: IHeaderSettings = this.getheaderSettings(this.dataViews);
            const labelSettings: ILabelSettings = this.getlabelSettings(this.dataViews);
            const totalSettings: ITotalSettings = this.gettotalSettings(this.dataViews);
            const indicatorSettings: IIndicatorSettings = this.getindicatorSettings(this.dataViews);

            let prefixSettings: IPrefixSettings;
            prefixSettings = this.getPrefixSettings(this.dataViews);
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'headerSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Header Settings',
                        selector: null,
                        properties: {
                            headerColor: headerSettings.headerColor,
                            bgColor: headerSettings.bgColor,
                            fontSize: headerSettings.fontSize
                        }
                    });
                    break;
                case 'labelSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Label Settings',
                        selector: null,
                        properties: {
                            labelColor: labelSettings.labelColor,
                            fontSize: labelSettings.fontSize,
                            gap: labelSettings.gap,
                            RowbgColor: labelSettings.RowbgColor
                        }
                    });
                    break;
                case 'totalSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Total Settings',
                        selector: null,
                        properties: {
                            totalText: totalSettings.totalText,
                            totalColor: totalSettings.totalColor,
                            fontSize: totalSettings.fontSize
                        }
                    });
                    break;
                case 'PrefixSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            prefixText: prefixSettings.prefixText
                        }
                    });
                    break;

                case 'indicatorSettings':
                    for (let i: number = 0; i < this.kpiDisplay.length; i++) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: this.kpiDisplay[i].key,
                            properties: {
                                IndicatorSwitch: this.kpiDisplay[i].value

                            },
                            selector: this.kpiDisplay[i].selectionId
                        });
                    }
                    break;
                default:

            }

            return objectEnumeration;
        }
    }
}
