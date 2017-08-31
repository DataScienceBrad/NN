/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
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
    // import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

    export module enumSettings {

        export let horizontalFunnelProps = {
            dataPoint: {
                fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' }
            },
            gradientColors: {
                minColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientColors', propertyName: 'minColor' },
                maxColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientColors', propertyName: 'maxColor' },
            },
            LabelSettings: {
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontColor' },
                labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
                labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' }
            },
            SecondaryLabelSettings: {
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'fontColor' },
                labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelDisplayUnits' },
                labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'secondaryLabels', propertyName: 'labelPrecision' }
            }
        };

        export function getDefaultDataLabelSettings(): ILabelSettings {
            return {
                color: '#333333',
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        export function getDataLabelSettings(dataView: DataView): ILabelSettings {

            let objects: DataViewObjects = null;
            let dataLabelSetting: ILabelSettings = this.getDefaultDataLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects)
                return dataLabelSetting;
            objects = dataView.metadata.objects;
            let labelProperties = horizontalFunnelProps.LabelSettings;
            dataLabelSetting.color = DataViewObjects.getFillColor(objects, labelProperties.color, dataLabelSetting.color);
            dataLabelSetting.displayUnits = DataViewObjects.getValue(objects, labelProperties.labelDisplayUnits, dataLabelSetting.displayUnits);
            dataLabelSetting.decimalPlaces = DataViewObjects.getValue(objects, labelProperties.labelPrecision, dataLabelSetting.decimalPlaces);
            dataLabelSetting.decimalPlaces = dataLabelSetting.decimalPlaces < 0 ? 0 : dataLabelSetting.decimalPlaces > 4 ? 4 : dataLabelSetting.decimalPlaces;

            return dataLabelSetting;
        }

        export function getDefaultSMLabelSettings(): ILabelSettings {
            return {
                color: '#333333',
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        export function getSMLabelSettings(dataView: DataView): ILabelSettings {

            let objects: DataViewObjects = null;
            let dataLabelSetting: ILabelSettings = this.getDefaultSMLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects)
                return dataLabelSetting;
            objects = dataView.metadata.objects;
            let labelProperties = horizontalFunnelProps.SecondaryLabelSettings;
            dataLabelSetting.color = DataViewObjects.getFillColor(objects, labelProperties.color, dataLabelSetting.color);
            dataLabelSetting.displayUnits = DataViewObjects.getValue(objects, labelProperties.labelDisplayUnits, dataLabelSetting.displayUnits);
            dataLabelSetting.decimalPlaces = DataViewObjects.getValue(objects, labelProperties.labelPrecision, dataLabelSetting.decimalPlaces);
            dataLabelSetting.decimalPlaces = dataLabelSetting.decimalPlaces < 0 ? 0 : dataLabelSetting.decimalPlaces > 4 ? 4 : dataLabelSetting.decimalPlaces;

            return dataLabelSetting;
        }

        export function getDefaultGradientColors(): IGradientColors {
            return {
                minColor: '#CCF1EE',
                maxColor: '#01B8AA'
            }
        }

        export function getGradientColors(dataView: DataView): IGradientColors {
            let objects: DataViewObjects = null;
            let gradientSettings: IGradientColors = this.getDefaultGradientColors();
            if (!dataView.metadata || !dataView.metadata.objects)
                return gradientSettings;
            objects = dataView.metadata.objects;
            let gradientProps = horizontalFunnelProps.gradientColors;
            gradientSettings.minColor = DataViewObjects.getFillColor(objects, gradientProps.minColor, gradientSettings.minColor);
            gradientSettings.maxColor = DataViewObjects.getFillColor(objects, gradientProps.maxColor, gradientSettings.maxColor);

            return gradientSettings;
        }
        /* do not update*/
        export module DataViewObjects {
            /** Gets the value of the given object/property pair. */
            export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

                if (!objects) { return defaultValue; }
                let objectOrMap = objects[propertyId.objectName];

                let object = <DataViewObject>objectOrMap;

                return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
            }

            /** Gets an object from objects. */
            export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
                if (objects && objects[objectName]) {
                    let object = <DataViewObject>objects[objectName];

                    return object;
                } else { return defaultValue; }
            }

            /** Gets a map of user-defined objects. */
            export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
                if (objects && objects[objectName]) {
                    let map = <DataViewObjectMap>objects[objectName];

                    return map;
                }
            }

            /** Gets the solid color from a fill property. */
            export function getFillColor(
                objects: DataViewObjects,
                propertyId: DataViewObjectPropertyIdentifier,
                defaultColor?: string): string {
                let value: Fill = getValue(objects, propertyId);
                if (!value || !value.solid) { return defaultColor; }

                return value.solid.color;
            }
            /**
             * Gets property value for a particular object.
             *
             * @function
             * @param {DataViewObjects} objects - Map of defined objects.
             * @param {string} objectName       - Name of desired object.
             * @param {string} propertyName     - Name of desired property.
             * @param {T} defaultValue          - Default value of desired property.
             */
            export function getValueOverload<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
                if (objects) {
                    let object = objects[objectName];
                    if (object) {
                        let property: T = <T>object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }

                return defaultValue;
            }
            
            export module DataViewObject {
                export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

                    if (!object) { return defaultValue; }

                    let propertyValue = <T>object[propertyName];
                    if (propertyValue === undefined) { return defaultValue; }

                    return propertyValue;
                }

                /** Gets the solid color from a fill property using only a propertyName */
                export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
                    let value: Fill = DataViewObject.getValue(objects, propertyName);
                    if (!value || !value.solid) { return defaultColor; }

                    return value.solid.color;
                }
            }
        }
    }
}
