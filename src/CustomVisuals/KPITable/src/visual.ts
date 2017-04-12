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
        headerSettings: {
            headerColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'headerColor' },
            bgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'bgColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'headerSettings', propertyName: 'fontSize' }
        },
        labelSettings: {
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'labelColor' },
            bgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'bgColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'textPrecision' },
            gap: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'gap' }
        },
        totalSettings: {
            totalText: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalText' },
            totalColor: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'totalColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'fontSize' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'totalSettings', propertyName: 'textPrecision' },
        }
    }

    export interface headerSettings {
        headerColor: string,
        bgColor: string,
        fontSize: number
    }

    export interface labelSettings {
        labelColor: string,
        bgColor: string,
        fontSize: number,
        displayUnits: number,
        textPrecision: number,
        gap: number
    }

    export interface totalSettings {
        totalText: string,
        totalColor: string,
        fontSize: number,
        displayUnits: number,
        textPrecision: number,
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private data;
        private noOflevels;
        private numberOfMeasures;
        private measuresData;
        private totalRowsLength;
        private MIndicatorsData;
        private viewport;
        private dataViews;
        private id;
        private parentId;
        private level;
        private hasChildLevel;
        private categories;
        private worldWideRowIndex: number;
        private gridData;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
        }

        public getDistinctElements(val, i, self) { 
            return self.indexOf(val) === i;
        }

        public showNextLevel(currentContext: any): any{
            //debugger;
            var level = currentContext.parentElement.parentElement.parentElement.getAttribute("level");
            var eleId = currentContext.parentElement.parentElement.parentElement.getAttribute("eleId");
            var tableContent = this.printLevel(level, eleId);
            $(currentContext.parentElement.parentElement.parentElement).append(tableContent);
            this.addClickFunctionality(currentContext);
            this.gridData = $('#baseContainer').html();
            
        }

        public hideNextLevel(currentContext: any): void{
            //debugger;
            var eleId = currentContext.parentElement.parentElement.parentElement.getAttribute("eleId");
            $(currentContext.parentElement.parentElement.parentElement).find("[parentId='"+ eleId +"']").remove();
        }

        public printLevel(level: number, parentId: string): string{
            //debugger;
            var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
            var tableContent:string = '';

            level = level - 1;

            for(var iRow = 0; iRow < this.totalRowsLength; iRow++){

                if(this.categories[iRow].toString().toUpperCase() == 'WORLDWIDE'){
                    this.worldWideRowIndex = iRow;
                    continue;
                }

                //optimize this by creating a new cached level array
                if(level == this.level[iRow] && (parentId == "" || (this.parentId[iRow] && parentId == this.parentId[iRow].split('|')[0].split(/ +/)[0]))){

                    var currentLevelDataProperties: TextProperties = {
                        text: this.categories[iRow],
                        fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
                        fontSize: labelSettings.fontSize + "px"
                    };

                    var newParentId = parentId == "" ? "root" : parentId;
                    //debugger;
                    var numberOfgaps = 0;
                    if(labelSettings.gap != 0 && labelSettings.gap < this.numberOfMeasures){
                        numberOfgaps = this.numberOfMeasures / labelSettings.gap;
                        if( this.numberOfMeasures % labelSettings.gap == 0 ){
                            numberOfgaps = numberOfgaps - 1;
                            numberOfgaps = Math.floor(numberOfgaps);
                        }
                    }
                    var gridWidth = 250 + 20 + this.numberOfMeasures * 100 + this.numberOfMeasures * 1 + numberOfgaps * 20;

                    //print levels
                    tableContent += '<div class = "gridRow rowLevel'+ level +'" style = "width:'+ gridWidth +'px" level = "'+ level +
                        '" parentId="'+ newParentId +
                        '" eleId="'+ this.id[iRow] +
                        '" ><div class = "gridLevels" style = "color:'+ labelSettings.labelColor +
                        '; font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:'+ labelSettings.fontSize +
                        'px"><span class="level'+ level;
                        
                    if(this.hasChildLevel[iRow] == 1){
                        var formattedLevelData = textMeasurementService.getTailoredTextOrDefault(currentLevelDataProperties, 250); //minus exand button width and margin left
                        tableContent += ' gridText"><span status = "collapsed" class = "expandCollapseButton gridPlusIcon"></span>' + formattedLevelData +
                            '</span></div>';
                    }
                    else{                    
                        var formattedLevelData = textMeasurementService.getTailoredTextOrDefault(currentLevelDataProperties, 250); //minus exand button width and margin left
                        tableContent += ' gridText">'+ formattedLevelData +
                            '</span></div>';
                    }

                    var gapCounter = -1;

                    tableContent += '<div class="gapDiv"></div>';
                    
                    //print measure columns
                    for(var iMeasure = 0; iMeasure < this.numberOfMeasures; iMeasure++){
                        gapCounter += 1;
                        if(gapCounter == labelSettings.gap && gapCounter != 0){
                            tableContent += '<div class="gapDiv"></div>';
                            gapCounter = 0;
                        }
                        
                        var formatter = ValueFormatter.create({ format: this.measuresData[iMeasure].source.format, value: labelSettings.displayUnits, precision: labelSettings.textPrecision });
                        var measureDataProperites: TextProperties;

                        measureDataProperites = {
                            text: formatter.format(this.measuresData[iMeasure].values[iRow]),
                            fontFamily: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
                            fontSize: labelSettings.fontSize + "px"
                        };
                        //debugger;
                        var tailoredMeasureData = textMeasurementService.getTailoredTextOrDefault(measureDataProperites, 53);
                        tableContent += '<div class = "gridMeasures" style = "color:'+ labelSettings.labelColor +
                            '; font-family:Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif; font-size:'+ labelSettings.fontSize +
                            'px"><span class="gridText">'+ tailoredMeasureData +'</span>';

                            if(this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '1']){
                                tableContent += '<span class="kpiShape'+ this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '1'][iRow] + '"></span>'; 
                            }
                            if(this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '2']){
                                tableContent += '<span class="kpiArrow'+ this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '2'][iRow] + '"></span>';  
                            }
                       tableContent += '</div>';
                    }
                }
            tableContent += '</div>';
            }
            return tableContent;
        }

        public addClickFunctionality(currentContext: any){
            //debugger;
            var This = this;
            var query = $('.expandCollapseButton');
            if(currentContext){
                var eleId = currentContext.parentElement.parentElement.parentElement.getAttribute("eleId");
                query = $('[parentid~="'+ eleId +'"] .expandCollapseButton');
            }
            query.click(function() {
                if ($(this).attr('status') == 'expanded') {
                    $(this).attr('status','collapsed');
                    $(this).removeClass('gridMinusIcon');
                    $(this).addClass('gridPlusIcon');
                    This.hideNextLevel(this);
                } else {
                    $(this).attr('status','expanded');
                    $(this).removeClass('gridPlusIcon');
                    $(this).addClass('gridMinusIcon');
                    This.showNextLevel(this);
                }
                });
        }

        public update(options: VisualUpdateOptions) {
            //debugger;
            console.log(options.dataViews[0]);
            this.target.innerHTML = `<div id = "baseContainer"></div>`;
            $('#baseContainer').css('width', options.viewport.width + 'px');
            $('#baseContainer').css('height', options.viewport.height + 'px');

            //debugger;
            if(options && 
            options.dataViews[0] &&
            options.dataViews[0].categorical &&
            options.dataViews[0].categorical.categories[0] &&
            options.dataViews[0].categorical.categories[0].values &&
            options.dataViews[0].categorical.categories[1] &&
            options.dataViews[0].categorical.categories[1].values &&
            options.dataViews[0].categorical.categories[2] &&
            options.dataViews[0].categorical.categories[2].values &&
            options.dataViews[0].categorical.categories[3] &&
            options.dataViews[0].categorical.categories[3].values &&
            options.dataViews[0].categorical.categories[4] &&
            options.dataViews[0].categorical.categories[4].values){

                this.viewport = options.viewport;
                this.data = options.dataViews[0].categorical;
                this.totalRowsLength = options.dataViews[0].categorical.categories[0].values.length;
                this.noOflevels = options.dataViews[0].categorical.categories.length;
                this.dataViews = options.dataViews[0];
                this.measuresData = options.dataViews[0].categorical.values;
                this.numberOfMeasures = options.dataViews[0].categorical.values.length;

                var tempMeasuresData = [];
                var tempMIndicators = [];
                //debugger;
                for(var iMeasure = 0; iMeasure < this.numberOfMeasures; iMeasure++){
                    if(this.measuresData[iMeasure].source.roles['measure']){
                        tempMeasuresData.push(this.measuresData[iMeasure]);
                    }
                    else{
                        var measureName: string = this.measuresData[iMeasure].source.displayName.toString();
                        var underScoreIndex = measureName.indexOf('#',0);
                        if(measureName[underScoreIndex+1]){
                            tempMIndicators[measureName.substr(0, underScoreIndex)+measureName[underScoreIndex+1]] = this.measuresData[iMeasure].values;
                        }
                    }
                }
                this.MIndicatorsData = tempMIndicators;
                this.measuresData = tempMeasuresData;
                this.numberOfMeasures = this.measuresData.length;

                this.id = this.data.categories[0].values;
                this.parentId = this.data.categories[1].values;
                this.level = this.data.categories[2].values;
                this.hasChildLevel = this.data.categories[3].values;
                this.categories = this.data.categories[4].values;


                var headerSettings: headerSettings = this.getHeaderSettings(this.dataViews);
                var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
                var totalSettings: totalSettings = this.getTotalSettings(this.dataViews);
                
                console.log(this.gridData);
                //debugger;
                if(this.gridData){
                    $('#baseContainer').append(this.gridData);
                    this.addClickFunctionality("");
                }
                else{
                    var numberOfgaps = 0;
                    if(labelSettings.gap != 0 && labelSettings.gap < this.numberOfMeasures){
                        numberOfgaps = this.numberOfMeasures / labelSettings.gap;
                        if( this.numberOfMeasures % labelSettings.gap == 0 ){
                            numberOfgaps = numberOfgaps - 1;
                            numberOfgaps = Math.floor(numberOfgaps);
                        }
                    }
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

                    var levelHeaderProperties: TextProperties = {
                        text: options.dataViews[0].categorical.categories[4].source.displayName,
                        fontFamily: "Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                        fontSize: headerSettings.fontSize + "px"
                    };
                    var textSpan = document.createElement('span');
                    textSpan.setAttribute('class','gridText');

                    gridLevels.appendChild(textSpan);

                    textSpan.innerHTML = textMeasurementService.getTailoredTextOrDefault(levelHeaderProperties, 250);
                    
                    tableHeaderRow.appendChild(gridLevels);

                    //gap div
                    var gapCounter = -1;
                    var gapDiv = document.createElement('div');
                    gapDiv.setAttribute('class','gapDiv');

                    tableHeaderRow.appendChild(gapDiv);

                    //measure headers
                    for(var i = 0; i < this.numberOfMeasures; i++){

                        gapCounter += 1;
                        if(gapCounter == labelSettings.gap && gapCounter != 0){
                            var gapDiv = document.createElement('div');
                            gapDiv.setAttribute('class','gapDiv');
                            tableHeaderRow.appendChild(gapDiv);
                            gapCounter = 0;
                        }

                        var gridMeasures = document.createElement('div');
                        gridMeasures.setAttribute('class','gridMeasures');
                        gridMeasures.style.backgroundColor = headerSettings.bgColor;
                        gridMeasures.style.color = headerSettings.headerColor;
                        gridMeasures.style.fontSize = headerSettings.fontSize + 'px';

                        var gridMeasuresProperties: TextProperties = {
                            text: options.dataViews[0].categorical.values[i].source.displayName,
                            fontFamily: "Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                            fontSize: headerSettings.fontSize + "px"
                        };

                        textSpan = document.createElement('span');
                        textSpan.setAttribute('class','gridText');

                        gridMeasures.appendChild(textSpan);

                        textSpan.innerHTML = textMeasurementService.getTailoredTextOrDefault(gridMeasuresProperties, 100);

                        tableHeaderRow.appendChild(gridMeasures);
                    }

                    $('#baseContainer').append(tableHeaderRow);

                    var numberOfLevels = this.level.filter(this.getDistinctElements).length;
                    //print table
                    var tableContent = this.printLevel(numberOfLevels,"");  //numberOfLevels=3 id=""
                    $('#baseContainer').append(tableContent);

                    //total row
                    var tableTotalRow = document.createElement('div');
                    tableTotalRow.setAttribute('class','totalGridRow')
                    tableTotalRow.style.width = gridWidth + 'px';

                    var totalLabel = document.createElement('div');
                    totalLabel.setAttribute('class','totalLevels');
                    totalLabel.style.color = totalSettings.totalColor;
                    totalLabel.style.fontSize = totalSettings.fontSize + 'px';

                    var totalLabelProperties: TextProperties = {
                        text: 'Worldwide',
                        fontFamily: "Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                        fontSize: totalSettings.fontSize + "px"
                    };

                    textSpan = document.createElement('span');
                    textSpan.setAttribute('class','gridText');

                    totalLabel.appendChild(textSpan);

                    textSpan.innerHTML = textMeasurementService.getTailoredTextOrDefault(totalLabelProperties, 250);
                    
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

                        var totalMeasures = document.createElement('div');
                        totalMeasures.setAttribute('class','totalMeasures');
                        totalMeasures.style.color = totalSettings.totalColor;
                        totalMeasures.style.fontSize = totalSettings.fontSize + 'px';

                        var formatter = ValueFormatter.create({ format: this.data.values[iMeasure].source.format, value: totalSettings.displayUnits, precision: totalSettings.textPrecision });

                        var totalMeasuresProperties: TextProperties = {
                            text: formatter.format(this.measuresData[iMeasure].values[this.worldWideRowIndex]),
                            fontFamily: "Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                            fontSize: totalSettings.fontSize + "px"
                        };

                        textSpan = document.createElement('span');
                        textSpan.setAttribute('class','gridText');
                        textSpan.innerHTML = textMeasurementService.getTailoredTextOrDefault(totalMeasuresProperties, 100);
                        totalMeasures.appendChild(textSpan);

                        if(this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '1']){
                            textSpan = document.createElement('span');
                            textSpan.setAttribute('class','kpiShape' + this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '1'][this.worldWideRowIndex] );
                            totalMeasures.appendChild(textSpan);
                        }

                        if(this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '2']){
                            textSpan = document.createElement('span');
                            textSpan.setAttribute('class','kpiArrow' + this.MIndicatorsData[this.measuresData[iMeasure].source.displayName + '2'][this.worldWideRowIndex] );
                            totalMeasures.appendChild(textSpan);
                        }

                        tableTotalRow.appendChild(totalMeasures);
                    }

                    $('#baseContainer').append(tableTotalRow);

                    //add click functionality
                    this.addClickFunctionality('');
                }

                
            }
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
                bgColor: '#f0f0f0',
                fontSize: 12,
                displayUnits: 0,
                textPrecision: 0,
                gap: 0
            }
        }

        public getDefaultTotalSettings(): totalSettings {
            return {
                totalText: 'Total',
                totalColor: '#000000',
                fontSize: 12,
                displayUnits: 0,
                textPrecision: 0,
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
            settings.bgColor = DataViewObjects.getFillColor(objects, properties.labelSettings.bgColor, settings.bgColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.labelSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects.getValue(objects, properties.labelSettings.textPrecision, settings.textPrecision);
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
            settings.displayUnits = DataViewObjects.getValue(objects, properties.totalSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects.getValue(objects, properties.totalSettings.textPrecision, settings.textPrecision);
            return settings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        
        var headerSettings: headerSettings = this.getHeaderSettings(this.dataViews);
        var labelSettings: labelSettings = this.getLabelSettings(this.dataViews);
        var totalSettings: totalSettings = this.getTotalSettings(this.dataViews);

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
                        bgColor: labelSettings.bgColor,
                        fontSize: labelSettings.fontSize,
                        displayUnits: labelSettings.displayUnits,
                        textPrecision: labelSettings.textPrecision,
                        gap: labelSettings.gap,
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
                        fontSize: totalSettings.fontSize,
                        displayUnits: totalSettings.displayUnits,
                        textPrecision: totalSettings.textPrecision,
                    }
                });
            break;
        };
        return objectEnumeration;
        }
    }
}