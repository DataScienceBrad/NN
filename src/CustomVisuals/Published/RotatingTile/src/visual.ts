/*
 *  Power BI Visual CLI
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
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects) {
                return defaultValue;
            }

            const objectOrMap = objects[propertyId.objectName];

            const object = <DataViewObject>objectOrMap;

            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                const object = <DataViewObject>objects[objectName]; {
                    return object;
                }
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                const map = <DataViewObjectMap>objects[objectName];

                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(
            objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
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

            const propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
        }
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill;
            value = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }

            return value.solid.color;
        }
    }

    export let visualProperties = {
        animationSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'flipVertically', propertyName: 'show' },
            duration: <DataViewObjectPropertyIdentifier>{ objectName: 'animationSettings', propertyName: 'duration' }
        },
        vfxSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'vfxSettings', propertyName: 'show' },
            bgColor: <DataViewObjectPropertyIdentifier>{ objectName: 'vfxSettings', propertyName: 'bgColor' },
            borderColor: <DataViewObjectPropertyIdentifier>{ objectName: 'vfxSettings', propertyName: 'borderColor' }
        },
        titleSettings: {
            titleColor: <DataViewObjectPropertyIdentifier>{ objectName: 'titleSettings', propertyName: 'titleColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'titleSettings', propertyName: 'fontSize' }
        },
        labelSettings: {
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'labelColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'fontSize' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'displayUnits' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labelSettings', propertyName: 'textPrecision' }
        }
    };

    export interface IAnimationSettings {
        show: boolean;
        duration: number;
    }

    export interface IVfxSettings {
        show: boolean;
        bgColor: string;
        borderColor: string;
    }

    export interface ITitleSettings {
        titleColor: string;
        fontSize: number;
    }

    export interface ILabelSettings {
        labelColor: string;
        fontSize: number;
        displayUnits: number;
        textPrecision: number;
    }

    export class Visual implements IVisual {
        private target: d3.Selection<SVGElement>;
        private dataViews;
        private rotationId: number;
        private frameId: number;
        private measureUpdateCounter: number;
        private elem;
        private rotationCount: number;
        private measureCount: number;
        private measureNameFormattedList;
        private measureDataList;
        private measureDataFormattedList;
        private measureNameList;

        constructor(options: VisualConstructorOptions) {
            this.target = d3.select(options.element);
            this.measureUpdateCounter = 0;
        }

        public update(options: VisualUpdateOptions) {
            // Clear the rotation effect
            clearInterval(this.frameId);
            clearInterval(this.rotationId);

            // Format pane settings
            this.dataViews = options.dataViews[0];
            const animationSettings: IAnimationSettings = this.getAnimationSettings(this.dataViews);
            const vfxSettings: IVfxSettings = this.getVfxSettings(this.dataViews);
            const titleSettings: ITitleSettings = this.getTitleSettings(this.dataViews);
            const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);

            if (options && options.dataViews && options.dataViews[0] && options.dataViews[0].table && options.dataViews[0].table.rows) {
                this.measureNameList = options.dataViews[0].table.columns;
                this.measureDataList = options.dataViews[0].table.rows[0];
                this.measureDataFormattedList = [];
                this.measureNameFormattedList = [];
                this.measureCount = this.measureNameList.length;
                this.target.selectAll('#baseContainer').remove();
                // Create base divs
                this.target
                    .append('div')
                    .attr('id', 'baseContainer');

                $('#baseContainer').css({
                    width: `${options.viewport.width}px`,
                    height: `${options.viewport.height}px`,
                    perspective: '400px',
                    position: 'relative'
                });
                let mainContainer;
                mainContainer = document.createElement('div');
                mainContainer.setAttribute('id', 'mainContainer');

                // 3D effect on/off
                if (vfxSettings.show) {
                    mainContainer.style.height = '60%';
                    mainContainer.style.top = `${options.viewport.height / 5}px`;
                    mainContainer.style.width = '60%';
                    mainContainer.style.margin = 'auto';
                    mainContainer.style.position = 'relative';
                    mainContainer.style.backgroundColor = vfxSettings.bgColor;
                    mainContainer.style.border = `1px solid ${vfxSettings.borderColor}`;
                } else {
                    mainContainer.style.height = `${options.viewport.height}px`;
                    mainContainer.style.width = `${options.viewport.width}px`;
                }

                $('#baseContainer').append(mainContainer);
                let mainContainerWidth: number;
                mainContainerWidth = parseFloat($('#mainContainer').css('width'));
                // Logic to format data label tiles (currency, percentage and ellipses)
                for (const measure in this.measureNameList) {
                    if (this.measureNameList.hasOwnProperty(measure)) {
                        let formatter;
                        formatter = ValueFormatter.create({
                            format: this.measureNameList[measure].format,
                            value: labelSettings.displayUnits,
                            precision: labelSettings.textPrecision
                        });
                        let measureDataProperties: TextProperties;
                        measureDataProperties = {
                            text: formatter.format(this.measureDataList[measure]),
                            fontFamily: 'Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: `${labelSettings.fontSize * 2}px`
                        };
                        let measureNameProperties: TextProperties;
                        measureNameProperties = {
                            text: this.measureNameList[measure].displayName,
                            fontFamily: 'Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif',
                            fontSize: `${titleSettings.fontSize}px`
                        };

                        this.measureDataFormattedList
                            .push(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, mainContainerWidth));
                        this.measureNameFormattedList
                            .push(textMeasurementService.getTailoredTextOrDefault(measureNameProperties, mainContainerWidth));
                    }
                }

                // Default values
                const defaultMeasureName = this.measureNameFormattedList[this.measureUpdateCounter];
                const defaultMeasureData = this.measureDataFormattedList[this.measureUpdateCounter];

                // Set default values in containers
                let dataDiv;
                dataDiv = document.createElement('div');
                let measureSpan;
                measureSpan = document.createElement('span');
                measureSpan.id = 'measureData';
                measureSpan.style.fontSize = `${labelSettings.fontSize * 2}px`;
                measureSpan.style.color = labelSettings.labelColor;
                measureSpan.textContent = defaultMeasureData;
                dataDiv.appendChild(measureSpan);

                dataDiv.appendChild(document.createElement('br'));

                let measureNameSpan;
                measureNameSpan = document.createElement('span');
                measureNameSpan.id = 'measureName';
                measureNameSpan.style.fontSize = `${titleSettings.fontSize}px`;
                measureNameSpan.style.color = titleSettings.titleColor;
                measureNameSpan.textContent = defaultMeasureName;
                dataDiv.appendChild(measureNameSpan);

                dataDiv.setAttribute('id', 'box');
                dataDiv.style.fontFamily = 'Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif';
                dataDiv.style.color = '#000';
                dataDiv.style.width = '100%';
                dataDiv.style.margin = 'auto';
                dataDiv.style.textAlign = 'center';
                dataDiv.style.position = 'absolute';
                dataDiv.style.top = '50%';
                dataDiv.style.transform = 'translateY(-50%)';
                $('#mainContainer').append(dataDiv);
                this.elem = document.getElementById('mainContainer');

                // Call rotation method
                if (this.measureCount > 1) {
                    clearInterval(this.rotationId);
                    this.rotationId = setInterval(() => this.rotation(), animationSettings.duration * 1000);
                }

                // Click functionality
                $('#mainContainer').on('click', () => {
                    clearInterval(this.rotationId);
                    this.rotation();
                    this.rotationId = setInterval(() => this.rotation(), animationSettings.duration * 1000);
                });

                // Hide labels if labels height > box size
                if (parseFloat($('#measureData').css('height')) + parseFloat($('#measureName').css('height'))
                    > parseFloat($('#mainContainer').css('height'))) {
                    $('#measureName').css('display', 'none');
                    if (parseFloat($('#measureData').css('height')) > parseFloat($('#mainContainer').css('height'))) {
                        $('#measureData').css('display', 'none');
                    } else {
                        $('#measureData').css('display', 'inline');
                    }
                } else {
                    $('#measureName').css('display', 'inline');
                }
            }
        }

        // Logic to rotate the tiles
        public rotation() {
            this.rotationCount = 1;
            clearInterval(this.frameId);
            this.frameId = setInterval(() => this.frame(), 5);
        }

        public frame() {
            const animationSettings: IAnimationSettings = this.getAnimationSettings(this.dataViews);

            if (this.rotationCount === 90) {
                this.measureUpdateCounter++;
                if (this.measureUpdateCounter >= this.measureCount) {
                    this.measureUpdateCounter = 0;
                }
                let measureName;
                measureName = document.getElementById('measureName');
                let measureData;
                measureData = document.getElementById('measureData');
                measureName.textContent = this.measureNameFormattedList[this.measureUpdateCounter].toString();
                if (this.measureDataList[this.measureUpdateCounter] === null) {
                    measureData.textContent = 'NA';
                } else {
                    measureData.textContent = this.measureDataFormattedList[this.measureUpdateCounter].toString();
                }
                this.rotationCount = -90;
            } else if (this.rotationCount === 0) {
                clearInterval(this.frameId);
            } else {
                this.rotationCount++;
                if (animationSettings.show) {
                    this.elem.style.transform = `rotateX(${-this.rotationCount}deg)`;
                } else {
                    this.elem.style.transform = `rotateY(${this.rotationCount}deg)`;
                }
            }
        }

        public getAnimationSettings(dataView: DataView): IAnimationSettings {
            let objects: DataViewObjects = null;
            let settings: IAnimationSettings;
            settings = this.getDefaultAnimationSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            const properties = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.animationSettings.show, settings.show);
            settings.duration = DataViewObjects.getValue(objects, properties.animationSettings.duration, settings.duration);
            settings.duration = settings.duration < 2 ? 2 : settings.duration > 10 ? 10 : settings.duration;

            return settings;
        }

        public getVfxSettings(dataView: DataView): IVfxSettings {
            let objects: DataViewObjects = null;
            let settings: IVfxSettings;
            settings = this.getDefaultVfxSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            const properties = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.vfxSettings.show, settings.show);
            settings.bgColor = DataViewObjects.getFillColor(objects, properties.vfxSettings.bgColor, settings.bgColor);
            settings.borderColor = DataViewObjects.getFillColor(objects, properties.vfxSettings.borderColor, settings.borderColor);

            return settings;
        }

        public getTitleSettings(dataView: DataView): ITitleSettings {
            let objects: DataViewObjects = null;
            let settings: ITitleSettings;
            settings = this.getDefaultTitleSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            const properties = visualProperties;
            settings.titleColor = DataViewObjects.getFillColor(objects, properties.titleSettings.titleColor, settings.titleColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.titleSettings.fontSize, settings.fontSize);

            return settings;
        }

        public getLabelSettings(dataView: DataView): ILabelSettings {
            let objects: DataViewObjects = null;
            let settings: ILabelSettings;
            settings = this.getDefaultLabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            const properties = visualProperties;
            settings.labelColor = DataViewObjects.getFillColor(objects, properties.labelSettings.labelColor, settings.labelColor);
            settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.labelSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects.getValue(objects, properties.labelSettings.textPrecision, settings.textPrecision);

            return settings;
        }

        public getDefaultAnimationSettings(): IAnimationSettings {
            return {
                show: false,
                duration: 4
            };
        }

        public getDefaultVfxSettings(): IVfxSettings {
            return {
                show: false,
                bgColor: '#f7f7f7',
                borderColor: '#000000'
            };
        }

        public getDefaultTitleSettings(): ITitleSettings {
            return {
                titleColor: '#999999',
                fontSize: 12
            };
        }
        public getDefaultLabelSettings(): ILabelSettings {
            return {
                labelColor: '#000000',
                fontSize: 13,
                displayUnits: 0,
                textPrecision: 0
            };
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const animationSettings: IAnimationSettings = this.getAnimationSettings(this.dataViews);
            const vfxSettings: IVfxSettings = this.getVfxSettings(this.dataViews);
            const titleSettings: ITitleSettings = this.getTitleSettings(this.dataViews);
            const labelSettings: ILabelSettings = this.getLabelSettings(this.dataViews);
            const objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[];
            objectEnumeration = [];

            switch (objectName) {
                case 'flipVertically':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Vertical flip',
                        selector: null,
                        properties: {
                            show: animationSettings.show
                        }
                    });
                    break;
                case 'vfxSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: '3D effect',
                        selector: null,
                        properties: {
                            show: vfxSettings.show,
                            bgColor: vfxSettings.bgColor,
                            borderColor: vfxSettings.borderColor
                        }
                    });
                    break;
                case 'animationSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Delay (seconds)',
                        selector: null,
                        properties: {
                            duration: animationSettings.duration
                        }
                    });
                    break;
                case 'titleSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Title Settings',
                        selector: null,
                        properties: {
                            titleColor: titleSettings.titleColor,
                            fontSize: titleSettings.fontSize
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
                            displayUnits: labelSettings.displayUnits,
                            textPrecision: labelSettings.textPrecision
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
