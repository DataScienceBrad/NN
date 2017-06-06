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

    export var visualProperties = {
        hierarchyData:{
            expanded: <DataViewObjectPropertyIdentifier>{ objectName: 'hierarchyData', propertyName: 'expanded' },
        },
        resizeData:{
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'resizeData', propertyName: 'width' },
        },
        headerSettings: {
            headerColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'headerColor' },
            bgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'bgColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'fontSize' }
        },
        labelSettings: {
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'labelColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            gap: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'gap' }
        },
        totalSettings: {
            totalText: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalText' },
            totalColor: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'fontSize' }
        },
        indicatorSettings:{
            prefixText: <DataViewObjectPropertyIdentifier>{ objectName: 'indicatorSettings', propertyName: 'prefixText' },
        }
    }

    export interface headerSettings {
        headerColor: string,
        bgColor: string,
        fontSize: number
    }

    export interface labelSettings {
        labelColor: string,
        fontSize: number,
        gap: number
    }

    export interface totalSettings {
        totalText: string,
        totalColor: string,
        fontSize: number
    }

    export interface indicatorSettings {
        prefixText: string
    }

    export class Visual implements IVisual {
        private visualHost: IVisualHost;
        private target: HTMLElement;
        private data;
        private noOflevels: number;
        private prevNoOfLevels: number;
        private prevNoOfMeasures: number;
        private numberOfMeasures: number;
        private measuresData;
        private totalRowsLength: number;
        private indicatorsData;
        private viewport: IViewport;
        private dataViews: DataView;
        private levelWidthPercentage: number;
        private measuresWidthPercentage: number;
        private gapDivPercentage: number;
        private expandedData;
        private resizeData;
        private scrollData;

        constructor(options: VisualConstructorOptions) {
            this.visualHost = options.host;
            this.target = options.element;
            this.levelWidthPercentage = 20.5;
            this.measuresWidthPercentage = 76;
            this.gapDivPercentage = 1.5;
            this.expandedData = [];
            this.resizeData = {};
            this.scrollData = {};
        }

        public getDistinctElements(val, i, self) { 
            return self.indexOf(val) === i;
        }

        public getNumberOfGaps(): number{
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var numberOfgaps:number = 0;
                if(labelSettings.gap != 0 && labelSettings.gap < this.numberOfMeasures){
                    numberOfgaps = this.numberOfMeasures / labelSettings.gap;
                    if( this.numberOfMeasures % labelSettings.gap == 0 ){
                        numberOfgaps = numberOfgaps - 1;
                    }
                    numberOfgaps = Math.floor(numberOfgaps);
                }
            return numberOfgaps;    
        }

        public getAggregate(dataset: any, measure: number, hierarchyId: String): number {
            var sum:number = 0;
            if(hierarchyId != 'none'){
                var hierarchyArray = hierarchyId.split('-$>');
                var level = hierarchyArray.length-1;
                var counter;
                for(var irow = 0; irow < this.totalRowsLength; irow++){
                    counter = 0;
                    for(var iLevel = 0; iLevel <= level; iLevel++){
                        if(this.data.categories[iLevel].values[irow] == hierarchyArray[iLevel]){
                            counter += 1;
                            if(counter == level + 1){
                                if(measure === undefined){
                                    sum += dataset[irow];
                                }
                                else{
                                    sum += dataset[measure].values[irow];
                                }
                            }
                        }
                    }
                }
                return sum;
            }
            else{
                for(var irow = 0; irow < this.totalRowsLength; irow++){
                    if(measure === undefined){    
                        sum += dataset[irow];
                    }
                    else{
                        sum += dataset[measure].values[irow];
                    }
                }
                return sum;
            }
        }

        public showNextLevel(hierarchyId:any, cacheFlag: boolean): any{
            var context:any = $('[hierarchyId="'+ hierarchyId +'"]');
            if(context &&
            context[0] &&
            context[0].children[0] &&
            context[0].children[0].children[0]){
                context[0].children[0].children[0].classList.remove('gridPlusIcon');
                context[0].children[0].children[0].classList.add('gridMinusIcon');
                context[0].children[0].children[0].setAttribute('status','expanded');
                var tableContent = this.printLevel(hierarchyId);
                context.append(tableContent);
                this.addClickListener(context);
            }
        }

        public hideNextLevel(currentContext: any): void{
            for(var iElement = 0; iElement < this.expandedData.length; iElement++){
                if(this.expandedData[iElement].indexOf(currentContext.parentElement.parentElement.getAttribute('hierarchyId')) != -1){
                    this.expandedData.splice(iElement, 1);
                    iElement--;
                }
            }
            this.persistExpandedData();
        }

        public printLevel(hierarchyId: String): string {
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var indicatorSettings: indicatorSettings = this.getIndicatorSettings(this.dataViews);
            var tableContent: string = '';
            var paddingLeft = 0;
            var hierarchyArray = hierarchyId.split('-$>');
            var level = hierarchyArray.length;
            var parentId = hierarchyArray[level-1];
            
            if(hierarchyId == "root"){
                level = 0;
            }
            var filteredCurrentLevelData =  this.data.categories[level].values;
            var currentLevelData = [];
            var tempValues = [];

            if(hierarchyId != "root"){
                var counter;
                for(var irow = 0; irow < this.totalRowsLength; irow++){
                    counter = 0;
                    for(var iLevel = 0; iLevel < level; iLevel++){
                        if(this.data.categories[iLevel].values[irow] == hierarchyArray[iLevel]){
                            counter += 1;
                            if(counter == level){
                                currentLevelData.push({
                                    key: irow,
                                    value: filteredCurrentLevelData[irow]
                                });
                                tempValues.push(filteredCurrentLevelData[irow]);
                            }
                        }
                    }
                }
                if(level != this.noOflevels - 1){
                    currentLevelData = [];
                    for(var iValue = 0; iValue < tempValues.filter( this.getDistinctElements ).length; iValue++){
                        currentLevelData.push({
                            key: iValue,
                            value: tempValues.filter( this.getDistinctElements )[iValue]
                        });
                    }
                }
            }
            else{
                for(var iValue = 0; iValue < filteredCurrentLevelData.filter( this.getDistinctElements ).length; iValue++){
                    currentLevelData.push({
                        key: iValue,
                        value: filteredCurrentLevelData.filter( this.getDistinctElements )[iValue]
                    });
                }
            }
            
            var levelLength = currentLevelData.length;
            var numberOfgaps = this.getNumberOfGaps();

            var gridWidth = 250 + 20 + (this.numberOfMeasures * 100) + (this.numberOfMeasures * 1) + (numberOfgaps * 20);

            var levelMarginLeft = 30;
            levelMarginLeft += level * 20;

            for(var iRow = 0; iRow < levelLength; iRow++){
                var newHierarchyId;
                if(level == 0){
                    newHierarchyId = currentLevelData[iRow].value.toString();
                }
                else{
                    newHierarchyId = hierarchyId + '-$>' + currentLevelData[iRow].value
                }
                //print levels column
                tableContent += '<div class = "gridRow" style = "width:'+ gridWidth +'px" hierarchyId = "'+ newHierarchyId +
                    '" parentId="'+ parentId +
                    '" eleId="'+ currentLevelData[iRow].value +
                    '" level="'+ level +
                    '" ><div class = "gridLevels rowLevel'+ level +'" style = "color:'+ labelSettings.labelColor +
                    '; font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:'+ labelSettings.fontSize +
                    'px">';

                    if(level != this.noOflevels - 1){
                        tableContent += '<span status="collapsed" style="margin-left:'+ levelMarginLeft +'px" class="expandCollapseButton gridPlusIcon"></span>';
                    }
                    tableContent += '<span class="gridText" style="margin-left:'+ levelMarginLeft +'px" title= '+ currentLevelData[iRow].value +'>' + currentLevelData[iRow].value + '</span></div>';
                    
                var gapCounter = -1;
                tableContent += '<div class="gapDiv"></div>';

                //print measure columns
                for(var iMeasure = 0; iMeasure < this.numberOfMeasures; iMeasure++){
                    gapCounter += 1;
                    if(gapCounter == labelSettings.gap && gapCounter != 0){
                        tableContent += '<div class="gapDiv"></div>';
                        gapCounter = 0;
                    }
                    var formatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format});
                    var tooltipFormatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format, value: 0, precision: 4 });
                    var measureValue;
                    var formattedMeasureData;
                    var tooltipFormattedMeasureData;

                    if(level != this.noOflevels - 1){
                        measureValue = this.getAggregate(this.measuresData, iMeasure, newHierarchyId);
                        formattedMeasureData = formatter.format(measureValue);
                        tooltipFormattedMeasureData = tooltipFormatter.format(measureValue);
                    }
                    else{
                        measureValue = this.measuresData[iMeasure].values[currentLevelData[iRow].key];
                        formattedMeasureData = formatter.format(measureValue);
                        tooltipFormattedMeasureData = tooltipFormatter.format(measureValue);
                    }

                    tableContent += '<div class = "gridMeasures rowLevel'+ level +' measure'+ (iMeasure+1) +'" style = "color:'+ labelSettings.labelColor +
                        '; font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:'+ labelSettings.fontSize +
                        'px"><span class="gridText" title="'+ tooltipFormattedMeasureData +'">'+ formattedMeasureData + '</span>';

                    //display indicators
                    if(this.indicatorsData[this.measuresData[iMeasure].source.displayName]){
                        var IndicatorMeasureValue: number;
                        var difference: number = 0;
                        var arrowClass: number;
                        if(level != this.noOflevels - 1){
                            IndicatorMeasureValue = this.getAggregate(this.indicatorsData[this.measuresData[iMeasure].source.displayName], undefined, newHierarchyId);
                        }else{
                            IndicatorMeasureValue = this.indicatorsData[this.measuresData[iMeasure].source.displayName][currentLevelData[iRow].key];
                        }
                        difference = measureValue - IndicatorMeasureValue;

                        var kpiArrow = document.createElement('span');
                        if(difference < 0){
                            tableContent += '<span title="'+ difference.toString() +'" class="kpiArrow1"></span>';
                        }
                        else if(difference == 0){
                            tableContent += '<span title="No change" class="kpiArrow2"></span>';
                        }
                        else{
                            tableContent += '<span title="+'+ difference.toString() +'" class="kpiArrow3"></span>';
                        }
                    }
                    tableContent += '</div>';
                }
            tableContent += '</div>';
            }
            return tableContent;
        }

        public update(options: VisualUpdateOptions) {
            this.target.innerHTML = `<div id = "baseContainer"></div>`;
            $('#baseContainer').css('width', options.viewport.width + 'px');
            $('#baseContainer').css('height', options.viewport.height + 'px');

            if(options && 
            options.dataViews[0] &&
            options.dataViews[0].categorical &&
            options.dataViews[0].categorical.categories[0] &&
            options.dataViews[0].categorical.categories[0].values){

                this.dataViews = options.dataViews[0];

                var headerSettings: headerSettings = this.getHeaderSettings(this.dataViews);
                var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
                var totalSettings: totalSettings = this.getTotalSettings(this.dataViews);
                var indicatorSettings: indicatorSettings = this.getIndicatorSettings(this.dataViews);

                
                this.viewport = options.viewport;
                this.totalRowsLength = options.dataViews[0].categorical.categories[0].values.length;
                this.noOflevels = options.dataViews[0].categorical.categories.length;
                
                this.data = options.dataViews[0].categorical;
                
                this.measuresData = [];
                this.indicatorsData = [];

                for(var iMeasure = 0; iMeasure < options.dataViews[0].categorical.values.length; iMeasure++){
                    if(options.dataViews[0].categorical.values[iMeasure].source.roles['measure']){
                        this.measuresData.push(options.dataViews[0].categorical.values[iMeasure]);
                    }
                    else{
                        var measureName: string = options.dataViews[0].categorical.values[iMeasure].source.displayName.toString();
                        var prefixText = indicatorSettings.prefixText;
                        if(prefixText && measureName.indexOf(prefixText) == 0){
                            this.indicatorsData[measureName.substr(prefixText.length, measureName.length)] = options.dataViews[0].categorical.values[iMeasure].values;
                        }
                    }
                }

                this.numberOfMeasures = this.measuresData.length;
                
                var numberOfgaps = this.getNumberOfGaps();
                
                var gridWidth = 250 + 20 + this.numberOfMeasures * 100 + this.numberOfMeasures * 1 + numberOfgaps * 20;

                //Add Table headers
                var tableHeaderRow = document.createElement('div');
                tableHeaderRow.setAttribute('class','gridRow')
                tableHeaderRow.setAttribute('id','headerRow');
                tableHeaderRow.style.width = gridWidth + 'px';
                

                //level headers
                var gridLevels = document.createElement('div');
                gridLevels.setAttribute('class','gridLevels');
                gridLevels.style.backgroundColor = headerSettings.bgColor;
                gridLevels.style.color = headerSettings.headerColor;
                gridLevels.style.fontSize = headerSettings.fontSize + 'px';

                var textSpan = document.createElement('span');
                textSpan.setAttribute('class','gridText headerLevel');
                textSpan.setAttribute('title',options.dataViews[0].categorical.categories[0].source.displayName);
                textSpan.innerHTML = options.dataViews[0].categorical.categories[0].source.displayName;
                gridLevels.appendChild(textSpan);

                //resizers
                var resizer = document.createElement('span');
                resizer.setAttribute('columnId','gridLevels');
                resizer.setAttribute('class','resizer');
                resizer.style.backgroundColor = headerSettings.bgColor;
                gridLevels.appendChild(resizer);
                tableHeaderRow.appendChild(gridLevels);
                
                //gap div
                var gapCounter = -1;
                var gapDiv = document.createElement('div');
                gapDiv.setAttribute('class','gapDiv');
                tableHeaderRow.appendChild(gapDiv);

                //measure headers
                for(var iMeasure = 0; iMeasure < this.numberOfMeasures; iMeasure++){
                    gapCounter += 1;
                    if(gapCounter == labelSettings.gap && gapCounter != 0){
                        var gapDiv = document.createElement('div');
                        gapDiv.setAttribute('class','gapDiv');
                        tableHeaderRow.appendChild(gapDiv);
                        gapCounter = 0;
                    }

                    //measureNames
                    var gridMeasures = document.createElement('div');
                    gridMeasures.setAttribute('class','gridMeasures measure'+ (iMeasure+1));
                    gridMeasures.style.backgroundColor = headerSettings.bgColor;
                    gridMeasures.style.color = headerSettings.headerColor;
                    gridMeasures.style.fontSize = headerSettings.fontSize + 'px';

                    textSpan = document.createElement('span');
                    textSpan.setAttribute('class','gridText');
                    textSpan.setAttribute('title',options.dataViews[0].categorical.values[iMeasure].source.displayName);
                    textSpan.innerHTML = options.dataViews[0].categorical.values[iMeasure].source.displayName;
                    gridMeasures.appendChild(textSpan);

                    //resizers
                    var resizer = document.createElement('span');
                    resizer.setAttribute('columnId','measure'+ (iMeasure+1));
                    resizer.setAttribute('class','resizer');
                    resizer.style.backgroundColor = headerSettings.bgColor;
                    gridMeasures.appendChild(resizer);
                    tableHeaderRow.appendChild(gridMeasures);
                }

                $('#baseContainer').append(tableHeaderRow);

                //hierarchy content
                var content = document.createElement('div');
                content.setAttribute('id','content');
                $('#baseContainer').append(content);
                
                $('#content').css('height', options.viewport.height-25 + 'px');
                $('#content').css('width', '100%');

                //print table
                var tableContent = this.printLevel("root");  //hierarchId=root id=root level=0
                $('#content').append(tableContent);

                //total row
                var tableTotalRow = document.createElement('div');
                tableTotalRow.setAttribute('class','gridRow');
                tableTotalRow.setAttribute('id','totalGridRow');
                tableTotalRow.style.width = gridWidth + 'px';

                var totalLabel = document.createElement('div');
                totalLabel.setAttribute('class','gridLevels totalGridLevel');
                totalLabel.style.color = totalSettings.totalColor;
                totalLabel.style.fontSize = totalSettings.fontSize + 'px';
                textSpan = document.createElement('span');
                textSpan.setAttribute('class','gridText totalLevel');
                textSpan.setAttribute('title',totalSettings.totalText);
                textSpan.innerHTML = totalSettings.totalText;
                totalLabel.appendChild(textSpan);
                tableTotalRow.appendChild(totalLabel);

                //gap div
                var gapCounter = -1;
                var gapDiv = document.createElement('div');
                gapDiv.setAttribute('class','gapDiv');
                tableTotalRow.appendChild(gapDiv);

                //total measures
                for(var iMeasure = 0; iMeasure < this.numberOfMeasures; iMeasure++){

                    gapCounter += 1;
                    if(gapCounter == labelSettings.gap && gapCounter != 0){
                        var gapDiv = document.createElement('div');
                        gapDiv.setAttribute('class','gapDiv');
                        tableTotalRow.appendChild(gapDiv);
                        gapCounter = 0;
                    }

                    var formatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format});
                    var tooltipFormatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format, value: 0, precision: 4 });
                    
                    var totalMeasures = document.createElement('div');
                    totalMeasures.setAttribute('class','gridMeasures totalGridMeasures measure'+ (iMeasure+1));
                    totalMeasures.style.color = totalSettings.totalColor;
                    totalMeasures.style.fontSize = totalSettings.fontSize + 'px';
                    
                    textSpan = document.createElement('span');
                    textSpan.setAttribute('class','gridText');
                    var measureValue = this.getAggregate(this.measuresData, iMeasure, 'none');
                    textSpan.setAttribute('title', tooltipFormatter.format(measureValue));
                    textSpan.innerHTML = formatter.format(measureValue);
                    totalMeasures.appendChild(textSpan);

                    //display indicators
                    if(this.indicatorsData[this.measuresData[iMeasure].source.displayName]){
                        var IndicatorMeasureValue: number;
                        var difference: number = 0;
                        var arrowClass: number;
                        IndicatorMeasureValue = this.getAggregate(this.indicatorsData[this.measuresData[iMeasure].source.displayName], undefined, 'none');
                        difference = measureValue - IndicatorMeasureValue;
                        
                        var kpiArrow = document.createElement('span');
                        if(difference < 0){
                            kpiArrow.setAttribute('class','kpiArrow1');
                            kpiArrow.setAttribute('title', '-' + difference.toString());
                        }
                        else if(difference == 0){
                            kpiArrow.setAttribute('class','kpiArrow2');
                            kpiArrow.setAttribute('title', 'No change');
                        }
                        else{
                            kpiArrow.setAttribute('class','kpiArrow3');
                            kpiArrow.setAttribute('title', '+' + difference.toString());
                        }
                        totalMeasures.appendChild(kpiArrow);
                    }
                    tableTotalRow.appendChild(totalMeasures);
                }
                $('#content').append(tableTotalRow);

                //add click listener
                this.addClickListener("");

                if((!!this.prevNoOfLevels && this.noOflevels != this.prevNoOfLevels) || (!!this.prevNoOfMeasures && this.numberOfMeasures != this.prevNoOfMeasures )){
                    //Reset all persisted data
                    this.expandedData = [];
                    this.persistExpandedData();
                    this.resizeData = {};
                    this.persistResizeData();
                }
                else{
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

        public addClickListener(currentContext: any){
            var This = this;
            var query = $('.expandCollapseButton');
            if(currentContext){
                var eleId = currentContext[0].getAttribute("eleId");
                var hierarchId = currentContext[0].getAttribute("hierarchyId");
                query = currentContext.children('[parentid="'+ eleId +'"]').find('.expandCollapseButton');
            }
            var flag:any;
            $(query).mousedown(function() {
                flag = this;
            });
            $(query).mouseup(function() {
                if(flag == this){
                    flag = 0;
                    if ($(this).attr('status') == 'expanded') {
                        This.hideNextLevel(this);
                    } else {
                        var hierarchId = this.parentElement.parentElement.getAttribute("hierarchyId");
                        This.expandedData.push(hierarchId);
                        This.persistExpandedData();
                    }
                }
            });
        }

        public addScrollListener(){
            var This = this;
            var scrolling;
            $('#content').scroll(function(){
                This.scrollData['scrollTop'] = $(this).scrollTop();
                This.scrollData['scrollLeft'] = $(this).scrollLeft();
                $("#headerRow").css('left', -$('#content').scrollLeft() + "px");
            });
        }

        public setScrollData(){
            if(this.scrollData){
                $("#content").scrollTop(this.scrollData['scrollTop']);
                $("#content").scrollLeft(this.scrollData['scrollLeft']);
                $("#headerRow").css('left', -$("#content").scrollLeft() + "px");
            }
        }
        
        public addResizeListener(){
            var pressed = false,
                moved = false,
                start = undefined,
                columnClass,
                startX, 
                startWidth, 
                startGridWidth, 
                xDiff, 
                calculateWidth,
                calculatedGridWidth,
                This = this;

            $(".resizer").mousedown(function(e) {
                columnClass = this.getAttribute('columnId');
                start = $("." + columnClass);
                pressed = true;
                startX = e.pageX;
                startWidth = start.width();
                startGridWidth = $(".gridRow").width();
            });

            $(document).mousemove(function(e) {
                if(pressed) {
                    moved = true;
                    var xDiff = (e.pageX-startX);
                    xDiff = xDiff < (-startWidth + 23) ? (-startWidth + 23) : xDiff;
                    calculateWidth = startWidth + xDiff;
                    calculatedGridWidth = startGridWidth + xDiff;
                    $(start).width(calculateWidth);
                    $(".gridRow").width(calculatedGridWidth);
                }
            });

            $(document).mouseup(function() {
                if(pressed) {
                    pressed = false;
                }
                if(moved && columnClass){
                    This.resizeData[columnClass] = calculateWidth;
                    This.resizeData['gridRow'] = calculatedGridWidth;
                    This.persistResizeData();
                    columnClass = undefined;
                    moved = false;
                }
            });
        }

        public persistResizeData(){
            var properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[visualProperties.resizeData.width.propertyName] = JSON.stringify(this.resizeData);
            var width: VisualObjectInstancesToPersist = {
                replace: [
                <VisualObjectInstance>{
                    objectName: visualProperties.resizeData.width.objectName,
                    selector: null,
                    properties: properties,
                }]
            }
            this.visualHost.persistProperties(width);
        }

        public persistExpandedData(){
            var properties: { [propertyName: string]: DataViewPropertyValue } = {};
            properties[visualProperties.hierarchyData.expanded.propertyName] = this.expandedData.join("=#=");
            var expanded: VisualObjectInstancesToPersist = {
                merge: [
                <VisualObjectInstance>{
                    objectName: visualProperties.hierarchyData.expanded.objectName,
                    selector: null,
                    properties: properties,
                }]
            }
            this.visualHost.persistProperties(expanded);
        }

        public printExpandedData(){
            var objects: DataViewObjects = null;
            objects = this.dataViews.metadata.objects;
            var getExpandedDataString = DataViewObjects.getValue<string>(objects, visualProperties.hierarchyData.expanded, "");
            if(getExpandedDataString){
                var expandedDataSplit = getExpandedDataString.split('=#=');
                this.expandedData = expandedDataSplit;
                expandedDataSplit.forEach(element => {
                    this.showNextLevel(element, true);
                });
            }
        }

        public setResizeData(){
            var objects: DataViewObjects = null;
            objects = this.dataViews.metadata.objects;
            var getJSONString = DataViewObjects.getValue<string>(objects, visualProperties.resizeData.width, "");
            if(getJSONString){
                var parsedString = JSON.parse(getJSONString);
                this.resizeData = parsedString;
                for(var iData in this.resizeData) {
                    if(iData == 'gridRow'){
                        var noOfGaps:number = this.getNumberOfGaps();
                         $('.' + iData).width(this.resizeData[iData] + (noOfGaps * 20));
                    }else{
                        $('.' + iData).width(this.resizeData[iData]);
                    }
                    
                }
            }
        }

        public getHeaderSettings(dataView: DataView): headerSettings {
            var objects: DataViewObjects = null;
            var settings: headerSettings = this.getDefaultHeaderSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            var properties = visualProperties;
            settings.headerColor = DataViewObjects.getFillColor(objects, properties.headerSettings.headerColor, settings.headerColor);
            settings.bgColor = DataViewObjects.getFillColor(objects, properties.headerSettings.bgColor, settings.bgColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.headerSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;
            return settings;
        }

        public getLabelSettings(dataView: DataView): labelSettings {
            var objects: DataViewObjects = null;
            var settings: labelSettings = this.getDefaultLabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            var properties = visualProperties;
            settings.labelColor = DataViewObjects.getFillColor(objects, properties.labelSettings.labelColor, settings.labelColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;
            settings.gap = DataViewObjects.getValue(objects, properties.labelSettings.gap, settings.gap);
            return settings;
        }
        
        public getTotalSettings(dataView: DataView): totalSettings {
            var objects: DataViewObjects = null;
            var settings: totalSettings = this.getDefaultTotalSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            var properties = visualProperties;
            settings.totalText = DataViewObjects.getValue(objects, properties.totalSettings.totalText, settings.totalText);
            settings.totalColor = DataViewObjects.getFillColor(objects, properties.totalSettings.totalColor, settings.totalColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.totalSettings.fontSize, settings.fontSize);
            settings.fontSize = settings.fontSize > 28 ? 28 : settings.fontSize;
            return settings;
        }

        public getIndicatorSettings(dataView: DataView): indicatorSettings {
            var objects: DataViewObjects = null;
            var settings: indicatorSettings = this.getDefaultIndicatorSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;
            objects = dataView.metadata.objects;
            var properties = visualProperties;
            settings.prefixText = DataViewObjects.getValue(objects, properties.indicatorSettings.prefixText, settings.prefixText);
            return settings;
        }

        public getDefaultHeaderSettings(): headerSettings {
            return {
                headerColor: '#FFFFFF',
                bgColor: '#505050',
                fontSize: 12
            }
        }

        public getDefaultLabelSettings(): labelSettings {
            return {
                labelColor: '#000000',
                fontSize: 12,
                gap: 0
            }
        }

        public getDefaultTotalSettings(): totalSettings {
            return {
                totalText: 'Total',
                totalColor: '#000000',
                fontSize: 12
            }
        }
        public getDefaultIndicatorSettings(): indicatorSettings {
            return {
                prefixText: '',
            }
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        
        var headerSettings: headerSettings = this.getHeaderSettings(this.dataViews);
        var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
        var totalSettings: totalSettings = this.getTotalSettings(this.dataViews);
        var indicatorSettings: indicatorSettings = this.getIndicatorSettings(this.dataViews);
        
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];
        
        switch(objectName) {
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
                        gap: labelSettings.gap
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
            case 'indicatorSettings':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: 'Indicator Settings',
                    selector: null, 
                    properties: {
                        prefixText: indicatorSettings.prefixText,
                    }
                });
            break;
        };
        return objectEnumeration;
        }
    }
}