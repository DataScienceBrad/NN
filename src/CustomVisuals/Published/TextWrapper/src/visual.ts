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

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {
                return defaultValue;
            }
            const objectOrMap: DataViewObject = objects[propertyId.objectName];

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
        export function getFillColor(objects: DataViewObjects,
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
            const propertyValue: T = <T>object[propertyName];
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

    export interface ItextSettings {
        color: string;
        fontSize: number;
        postText: string;
    }

    export let questTextProperties: {
        textSettings: {
            color: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            postText: DataViewObjectPropertyIdentifier;
        };
    } = {
            textSettings: {
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'color' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'fontSize' },
                postText: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'postText' }
            }
        };

    export class Visual implements IVisual {
        private target: d3.Selection<SVGElement>;
        private updateCount: number;
        private dataViews: DataView;

        constructor(options: VisualConstructorOptions) {
            this.target = d3.select(options.element);
            this.target.style({
                'overflow-y': 'auto',
                cursor: 'default'
            });
            this.updateCount = 0;
        }
        // tslint:disable-next-line:no-any
        public getDecimalPlacesCount(value: any): number {
            let decimalPlaces: number = 0;
            if (value > 0) {
                const arr: string[] = value.toString().split('.');
                if (!!arr[1] && parseFloat(arr[1]) > 0) {
                    decimalPlaces = arr[1].length;
                }
            }

            return decimalPlaces;
        }
        public update(options: VisualUpdateOptions): void {

            this.target.selectAll('.tw_value').remove();
            const dataView: DataView = this.dataViews = options.dataViews[0];
            let valueLength: number = 0;
            const textSettings: ItextSettings = this.getTextSettings(dataView);
            // tslint:disable-next-line:no-any
            let textVal: any;
            if (dataView
                && dataView.categorical) {
                if (dataView.categorical.categories
                    && dataView.categorical.categories[0]
                    && dataView.categorical.categories[0].values) {
                    valueLength = dataView.categorical.categories[0].values.length;
                    textVal = dataView.categorical.categories[0].values[0] ? dataView.categorical.categories[0].values[0] : '(blank)';
                } else if (dataView.categorical.values
                    && dataView.categorical.values[0]
                    && dataView.categorical.values[0].values) {
                    valueLength = dataView.categorical.values[0].values.length;
                    textVal = dataView.categorical.values[0].values[0] ? dataView.categorical.values[0].values[0] : 0;
                    if (!!dataView.categorical.values[0]
                        && !!dataView.categorical.values[0].source
                        && !!dataView.categorical.values[0].source.format) {

                        let decimalPlaces: number = this.getDecimalPlacesCount(textVal);
                        decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                        const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                            format: dataView.categorical.values[0].source.format,
                            precision: decimalPlaces,
                            value: 1
                        });
                        textVal = formatter.format(textVal);
                    }
                }
            }
            if (valueLength === 1) {
                this.target.append('div')
                    .classed('tw_value hyphens', true)
                    .text(textSettings.postText ? `${textVal}${' : '}${textSettings.postText}` : textVal)
                    .style('font-size', `${textSettings.fontSize}px`)
                    .style('font-family', 'Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif')
                    .style('color', textSettings.color);
            } else if (valueLength > 1) {
                const errMsg: string = 'Query returned more than one row, please filter data to return one row';
                this.target.append('div')
                    .classed('tw_value', true)
                    .text(errMsg)
                    .attr('title', errMsg)
                    .style('font-size', `${textSettings.fontSize}px`)
                    .style('font-family', 'Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif')
                    .style('color', textSettings.color);
            }
        }

        private getTextSettings(dataView: DataView): ItextSettings {
            let objects: DataViewObjects = null;
            const textSetting: ItextSettings = this.getDefaultTextSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;
            const textProperties: {
                textSettings: {
                    color: DataViewObjectPropertyIdentifier;
                    fontSize: DataViewObjectPropertyIdentifier;
                    postText: DataViewObjectPropertyIdentifier;
                };
            }
                = questTextProperties;
            textSetting.color = DataViewObjects.getFillColor(objects, textProperties.textSettings.color, textSetting.color);
            textSetting.fontSize = DataViewObjects.getValue(objects, textProperties.textSettings.fontSize, textSetting.fontSize);
            textSetting.postText = DataViewObjects.getValue(objects, textProperties.textSettings.postText, textSetting.postText);

            return textSetting;
        }

        public getDefaultTextSettings(): ItextSettings {
            return {
                color: '#777777',
                fontSize: 18,
                postText: ''
            };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const textSetting: ItextSettings = this.getTextSettings(this.dataViews);
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
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
                default:
                    break;
            }

            return objectEnumeration;
        }

        public destroy(): void {
            //TODO: Perform any cleanup tasks here
        }
    }
}
