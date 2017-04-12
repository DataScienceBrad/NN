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

    export interface textSettings {
        color: string;
        fontSize: number;
        postText: string
    };

    export var questTextProperties = {
        textSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'fontSize' },
            postText: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'postText' },
        },
    };

    export class Visual implements IVisual {
        private target: d3.Selection<SVGElement>;
        private updateCount: number;
        private data;
        private dataViews;
        private textColor;

        constructor(options: VisualConstructorOptions) {
            this.target = d3.select(options.element);
            this.target.style('overflow-y','auto');
            this.updateCount = 0;
        }

        public update(options: VisualUpdateOptions) {

            this.target.selectAll('.value').remove();
            var dataView = this.dataViews = options.dataViews[0];
            var valueLength = 0;
            var textSettings: textSettings = this.getTextSettings(dataView);
            
            if(dataView
            && dataView.categorical 
            && dataView.categorical.categories 
            && dataView.categorical.categories[0]
            && dataView.categorical.categories[0].values){
                valueLength = dataView.categorical.categories[0].values.length;
            }

            if(valueLength == 1){
                this.target.append('div')
                .classed('value',true)
                .text(textSettings.postText ? dataView.categorical.categories[0].values[0] + ' : ' + textSettings.postText : dataView.categorical.categories[0].values[0]+'')
                .style('font-size',textSettings.fontSize + 'px')
                .style('font-family','Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif')
                .style('color',textSettings.color);
            }
            else if(valueLength > 1){
                this.target.append('div')
                .classed('value',true)
                .text("No Item Selected")
                .style('font-size',textSettings.fontSize + 'px')
                .style('font-family','Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif')
                .style('color',textSettings.color)
            }

        }

        private getTextSettings(dataView: DataView): textSettings {
            var objects: DataViewObjects = null;
            var textSetting: textSettings = this.getDefaultTextSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects)
                return textSetting;
            objects = dataView.metadata.objects;
            var textProperties = questTextProperties;
            textSetting.color = DataViewObjects.getFillColor(objects, textProperties.textSettings.color, textSetting.color);
            textSetting.fontSize = DataViewObjects.getValue(objects, textProperties.textSettings.fontSize, textSetting.fontSize);
            textSetting.postText = DataViewObjects.getValue(objects, textProperties.textSettings.postText, textSetting.postText);

            return textSetting;
        }

        public getDefaultTextSettings(): textSettings {
            return {
                color: '#777777',
                fontSize: 18,
                postText: ''
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        var textSetting: textSettings = this.getTextSettings(this.dataViews);
        var objectName = options.objectName;
        var objectEnumeration: VisualObjectInstance[] = [];
        
        switch(objectName) {
            case 'textSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Text Settings',
                        selector: null, 
                        properties: {
                            color: textSetting.color,
                            fontSize: textSetting.fontSize,
                            postText: textSetting.postText
                        }
                    });
                break;
        };
        
        
        return objectEnumeration;
    }

        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }
    }
}