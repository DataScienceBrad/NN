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
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;

    export module enumSettings {
        // Default values for format settings
        export function getDefaultColors(): IBarColors {
            return {
                satisfactoryColor: '#DE0F1D',
                goodColor: '#F9B700',
                vGoodColor: '#7FBA00',
                actualValColor: '#000000',
                targetValColor: '#000000',
            };
        }

        export function getDefaultLabelSettings(): ILabelSettings {
            return {
                labelSize: 12,
                labelColor: '#000',
                labelDecimalPlaces: 0,
                labelDisplayUnits: 0
            };
        }

        // Capabilities property object
        export let chartProperties = {
            colorSelector: {
                satisfactoryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'satisfactory' },
                goodColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'good' },
                vGoodColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'veryGood' },
                actualValColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'actualValue' },
                targetValColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'targetValue' }
            },
            labelSettings: {
                labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelColor' },
                labelDecimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
                labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
                labelSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' }
            }
        };

        export function getBarColors(dataView: DataView): IBarColors {
            let objects: DataViewObjects = null;
            let barColors: IBarColors = getDefaultColors();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return barColors;
            }
            objects = dataView.metadata.objects;
            let barProps = chartProperties.colorSelector;
            barColors.satisfactoryColor = DataViewObjects.getFillColor(objects, barProps.satisfactoryColor, barColors.satisfactoryColor);
            barColors.goodColor = DataViewObjects.getFillColor(objects, barProps.goodColor, barColors.goodColor);
            barColors.vGoodColor = DataViewObjects.getFillColor(objects, barProps.vGoodColor, barColors.vGoodColor);
            barColors.actualValColor = DataViewObjects.getFillColor(objects, barProps.actualValColor, barColors.actualValColor);
            barColors.targetValColor = DataViewObjects.getFillColor(objects, barProps.targetValColor, barColors.targetValColor);    
            return barColors;
        }

        export function getLabelSettings(dataView: DataView): ILabelSettings {
            let objects: DataViewObjects = null;
            let labelSettings: ILabelSettings = getDefaultLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return labelSettings;
            }
            objects = dataView.metadata.objects;
            let labelProps = chartProperties.labelSettings;
            let decimalPlaces: number;
            decimalPlaces = DataViewObjects.getValue(objects, labelProps.labelDecimalPlaces, labelSettings.labelDecimalPlaces);
            decimalPlaces = decimalPlaces > 0 ? (decimalPlaces > 4 ? 4 : decimalPlaces) : 0;
            labelSettings.labelDecimalPlaces = decimalPlaces;
            labelSettings.labelDisplayUnits =
                DataViewObjects.getValue(objects, labelProps.labelDisplayUnits, labelSettings.labelDisplayUnits);
            labelSettings.labelColor = DataViewObjects.getFillColor(objects, labelProps.labelColor, labelSettings.labelColor);
            labelSettings.labelSize = DataViewObjects.getValue(objects, labelProps.labelSize, labelSettings.labelSize);

            return labelSettings;
        }

        export function enumerateColorSelector(colorSetting, instance, objectName): void {
            let props = {};
            props = {
                satisfactory: colorSetting.satisfactoryColor,
                good: colorSetting.goodColor,
                veryGood: colorSetting.vGoodColor,
                actualValue: colorSetting.actualValColor,
                targetValue: colorSetting.targetValColor
            };

            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });

        }

        export function enumerateLabelSettings(labelConfigs, instance, objectName): void {
            let props = {};
            props = {
                fontSize: labelConfigs.labelSize,
                labelColor: labelConfigs.labelColor,
                labelDisplayUnits: labelConfigs.labelDisplayUnits,
                labelPrecision: labelConfigs.labelDecimalPlaces
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
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
        export function getCategoricalObjectValue<T>(
            category: DataViewCategoryColumn,
            index: number,
            objectName: string,
            propertyName: string,
            defaultValue: T): T {
            let categoryObjects = category.objects;

            if (categoryObjects) {
                let categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    let object = categoryObject[objectName];
                    if (object) {
                        let property: T = <T>object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }

            return defaultValue;
        }
        /* do not update*/
    }
}
