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
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    export module enumSettings {
        export let kpiValueProps = {
            indicatorSettings: {
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'indicator', propertyName: 'fontSize' },
                labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'indicator', propertyName: 'labelDisplayUnits' },
                labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'indicator', propertyName: 'labelPrecision' },
                fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'indicator', propertyName: 'fontColor' }
            },
            goalSettings: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'goals', propertyName: 'show' },
                goal: <DataViewObjectPropertyIdentifier>{ objectName: 'goals', propertyName: 'goal' },
                distance: <DataViewObjectPropertyIdentifier>{ objectName: 'goals', propertyName: 'distance' },
                position: <DataViewObjectPropertyIdentifier>{ objectName: 'goals', propertyName: 'position' },
                fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'goals', propertyName: 'color' }
            },
            colorCoding: {
                oneColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorCoding', propertyName: 'oneColor' },
                twoColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorCoding', propertyName: 'twoColor' },
                threeColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorCoding', propertyName: 'threeColor' },
                fourColor: <DataViewObjectPropertyIdentifier>{ objectName: 'colorCoding', propertyName: 'fourColor' },
            }
        };

        export function getDefaultIndicator(): IIndicatorSettings {
            return {
                fontSize: 12,
                displayUnits: 0,
                decimalPlaces: 0,
                fontColor: '#000'
            }
        }

        export function getIndicator(dataView: DataView): IIndicatorSettings {
            let objects: DataViewObjects = null;
            let indicatorSettings: IIndicatorSettings = this.getDefaultIndicator();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return indicatorSettings;
            }
            objects = dataView.metadata.objects;
            let indicatorProps = kpiValueProps.indicatorSettings;

            indicatorSettings.fontSize = DataViewObjects.getValue(objects, indicatorProps.fontSize, indicatorSettings.fontSize);
            indicatorSettings.displayUnits = DataViewObjects.getValue(objects, indicatorProps.labelDisplayUnits, indicatorSettings.displayUnits);
            let decimalPlaces = DataViewObjects.getValue(objects, indicatorProps.labelPrecision, indicatorSettings.decimalPlaces);
            indicatorSettings.decimalPlaces = decimalPlaces > 0 ? decimalPlaces <= 4 ? decimalPlaces : 4 : 0;
            indicatorSettings.fontColor = DataViewObjects.getFillColor(objects, indicatorProps.fontColor, indicatorSettings.fontColor);

            return indicatorSettings;
        }

        export function getDefaultGoalSettings(): IGoalSettings {
            return {
                show: true,
                goal: true,
                distance: true,
                position: 'bottom',
                fontColor: '#000'
            }
        }

        export function getGoalSettings(dataView: DataView): IGoalSettings {
            let objects: DataViewObjects = null;
            let goalSettings: IGoalSettings = this.getDefaultGoalSettings();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return goalSettings;
            }
            objects = dataView.metadata.objects;
            let goalProps = kpiValueProps.goalSettings;

            goalSettings.show = DataViewObjects.getValue(objects, goalProps.show, goalSettings.show);
            goalSettings.goal = DataViewObjects.getValue(objects, goalProps.goal, goalSettings.goal);
            goalSettings.distance = DataViewObjects.getValue(objects, goalProps.distance, goalSettings.distance);
            goalSettings.position = DataViewObjects.getValue(objects, goalProps.position, goalSettings.position);
            goalSettings.fontColor = DataViewObjects.getFillColor(objects, goalProps.fontColor, goalSettings.fontColor);

            return goalSettings;
        }

        export function getDefaultColorCoding(): IColorCoding {
            return {
                oneColor: '#3BB44A',
                twoColor: '#F2C811',
                threeColor: '#E81123',
                fourColor: '#999999'
            }
        }

        export function getColorCoding(dataView: DataView): IColorCoding {
            let objects: DataViewObjects = null;
            let colorCoding: IColorCoding = this.getDefaultColorCoding();
            if (!dataView.metadata || !dataView.metadata.objects) {
                return colorCoding;
            }
            objects = dataView.metadata.objects;
            let colorProps = kpiValueProps.colorCoding;

            colorCoding.oneColor = DataViewObjects.getFillColor(objects, colorProps.oneColor, colorCoding.oneColor);
            colorCoding.twoColor = DataViewObjects.getFillColor(objects, colorProps.twoColor, colorCoding.twoColor);
            colorCoding.threeColor = DataViewObjects.getFillColor(objects, colorProps.threeColor, colorCoding.threeColor);
            colorCoding.fourColor = DataViewObjects.getFillColor(objects, colorProps.fourColor, colorCoding.fourColor);

            return colorCoding;
        }
    }
}
