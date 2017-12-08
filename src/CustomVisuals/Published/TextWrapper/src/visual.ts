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
        alignment: string;
    }

    export interface IStaticTextSettings {
        showColon: boolean;
        textPosition: string;
        backgroundcolor: string;
        fontFamily: string;
        boldStyle: boolean;
        italicStyle: boolean;
        underlineStyle: boolean;
        postText: string;
    }

    export interface IDynamicTextContainer {
        textContainer: string;
        lengthContainer: number;
    }

    export interface IDynamicTextSettings {
        backgroundcolor: string;
        fontFamily: string;
        boldStyle: boolean;
        italicStyle: boolean;
        underlineStyle: boolean;
    }

    export let questTextProperties: {
        textSettings: {
            color: DataViewObjectPropertyIdentifier;
            fontSize: DataViewObjectPropertyIdentifier;
            postText: DataViewObjectPropertyIdentifier;
            alignment: DataViewObjectPropertyIdentifier;

        };
        staticTextSettings: {
            showColon: DataViewObjectPropertyIdentifier;
            textPosition: DataViewObjectPropertyIdentifier;
            backgroundcolor: DataViewObjectPropertyIdentifier;
            postText: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            boldStyle: DataViewObjectPropertyIdentifier;
            italicStyle: DataViewObjectPropertyIdentifier;
            underlineStyle: DataViewObjectPropertyIdentifier;
        };
        dynamicSettings: {
            backgroundcolor: DataViewObjectPropertyIdentifier;
            fontFamily: DataViewObjectPropertyIdentifier;
            boldStyle: DataViewObjectPropertyIdentifier;
            italicStyle: DataViewObjectPropertyIdentifier;
            underlineStyle: DataViewObjectPropertyIdentifier;
        }
    };

    questTextProperties = {
        textSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'color' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'fontSize' },
            postText: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'postText' },
            alignment: <DataViewObjectPropertyIdentifier>{ objectName: 'textSettings', propertyName: 'alignment' }

        },
        staticTextSettings: {
            showColon: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'showColon' },
            textPosition: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'textPosition' },
            backgroundcolor: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'backgroundcolor' },
            postText: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'postText' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'fontFamily' },
            boldStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'boldStyle' },
            italicStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'italicStyle' },
            underlineStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'staticText', propertyName: 'underlineStyle' }
        },
        dynamicSettings: {
            backgroundcolor: <DataViewObjectPropertyIdentifier>{ objectName: 'Settings', propertyName: 'backgroundcolor' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'Settings', propertyName: 'fontFamily' },
            boldStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'Settings', propertyName: 'boldStyle' },
            italicStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'Settings', propertyName: 'italicStyle' },
            underlineStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'Settings', propertyName: 'underlineStyle' }
        }
    };

    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    export class Visual implements IVisual {
        private target: d3.Selection<HTMLElement>;
        private updateCount: number;
        private dataViews: DataView;
        private staticTextSettings: IStaticTextSettings;
        private dynamicSettings: IDynamicTextSettings;
        private formatter: utils.formatting.IValueFormatter;
        private finalTextContainer: d3.Selection<HTMLElement>;
        constructor(options: VisualConstructorOptions) {
            this.target = d3.select(options.element);
            this.target.style({
                'overflow-y': 'auto',
                cursor: 'default'
            });
            this.updateCount = 0;
        }

        public pointToPixel(pt: number): string {
            const pxPtRatio: number = 4 / 3;
            const pixelString: string = 'px';

            return (pt * pxPtRatio) + pixelString;
        }

        // tslint:disable-next-line:no-any
        public getDecimalPlacesCount(value: any): number {
            let decimalPlaces: number = 0;
            if (value > 0) {
                const arr: string[] = value.toString().split('.');
                if (!arr[1] && parseFloat(arr[1]) > 0) {
                    decimalPlaces = arr[1].length;
                }
            }

            return decimalPlaces;
        }

        public getDynamicTextValue(dataView: DataView): IDynamicTextContainer {
            // tslint:disable-next-line:no-any
            let textValDynamicInput: any;
            let valueLength: number = 0;
            if (dataView
                && dataView.categorical) {
                if (dataView.categorical.categories
                    && dataView.categorical.categories[0]
                    && dataView.categorical.categories[0].values) {
                    valueLength = dataView.categorical.categories[0].values.length;
                    textValDynamicInput = valueLength ?
                        dataView.categorical.categories[0].values[0] :
                        '(blank)';
                    if (dataView.categorical.categories[0].source
                        && dataView.categorical.categories[0].source.format) {
                        const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                            format: dataView.categorical.categories[0].source.format
                        });
                        textValDynamicInput = formatter.format(textValDynamicInput);
                    }
                } else if (dataView.categorical.values
                    && dataView.categorical.values[0]
                    && dataView.categorical.values[0].values) {
                    valueLength = dataView.categorical.values[0].values.length;
                    textValDynamicInput = dataView.categorical.values[0].values[0] ? dataView.categorical.values[0]
                        .values[0] : 0;
                    if (dataView.categorical.values[0]
                        && dataView.categorical.values[0].source
                        && dataView.categorical.values[0].source.format) {

                        let decimalPlaces: number = this.getDecimalPlacesCount(textValDynamicInput);
                        decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                        const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                            format: dataView.categorical.values[0].source.format,
                            precision: decimalPlaces,
                            value: 1
                        });
                        textValDynamicInput = formatter.format(textValDynamicInput);
                    }

                }
                const obj: IDynamicTextContainer = {
                    textContainer: textValDynamicInput,
                    lengthContainer: valueLength
                };

                return obj;
            }
        }

        public getFontStyleClassName(settings: IDynamicTextSettings | IStaticTextSettings): string {
            let fontStyleClassName: string = '';
            let classArr: string[];
            classArr = [];

            if (settings.boldStyle) {
                classArr.push('tw_bold');
            }
            if (settings.italicStyle) {
                classArr.push('tw_italic');
            }
            if (settings.underlineStyle) {
                classArr.push('tw_underline');
            }
            fontStyleClassName = classArr.join(' ');

            return fontStyleClassName;
        }

        public update(options: VisualUpdateOptions): void {
            this.updateCount++;
            this.target.selectAll('.tw_value').remove();
            const dataView: DataView = this.dataViews = options.dataViews[0];
            let valueLength: number = 0;
            const textSettings: ItextSettings = this.getTextSettings(dataView);
            this.dynamicSettings = this.getDynamicTextSettings(dataView);
            this.staticTextSettings = this.getStaticTextSettings(dataView);
            const svgwidth: number = options.viewport.width;
            const svglen: number = parseInt(svgwidth.toString(), 10);
            const svgheight: number = options.viewport.height;
            const svgheightlen: number = parseInt(svgheight.toString(), 10);
            let textValDynamicInput: string;
            let textValStaticInput: string;
            let staticOriginaltext: string;
            if (this.updateCount === 1) {
                textValStaticInput = this.staticTextSettings.postText === '-1' ?
                    textSettings.postText : this.staticTextSettings.postText;
            } else {
                textValStaticInput = this.staticTextSettings.postText === '-1' ?
                    '' : this.staticTextSettings.postText;
            }
            this.staticTextSettings.postText = textValStaticInput;
            staticOriginaltext = textValStaticInput;
            const valuesContainer: IDynamicTextContainer = this.getDynamicTextValue(dataView);
            textValDynamicInput = valuesContainer.textContainer;
            const dynamicOriginaltext: string = textValDynamicInput;
            const textFontSize: number = textSettings.fontSize;
            const dynamictextFontFamily: string = this.dynamicSettings.fontFamily;
            const staticTextFontFamily: string = this.staticTextSettings.fontFamily;
            const dynfontStyleClass: string = this.getFontStyleClassName(this.dynamicSettings);
            const staticfontStyleClass: string = this.getFontStyleClassName(this.staticTextSettings);
            let textValStatic: string = '';
            let textValDynamic: string = '';
            valueLength = valuesContainer.lengthContainer;
            if (valueLength === 1) {
                const original: d3.Selection<HTMLElement> = this.target.append('div')
                    .classed('tw_value tw_finalText', true)
                    .style('font-size', this.pointToPixel(textFontSize))
                    .style('color', textSettings.color);
                textValStatic = textValStaticInput;
                textValDynamic = textValDynamicInput;
            } else if (valueLength > 1) {
                const errMsg: string = 'Query returned more than one row, please filter data to return one row';
                const original: d3.Selection<HTMLElement> = this.target.append('div')
                    .classed('tw_value errormsg', true)
                    .text(errMsg)
                    .attr('title', errMsg)
                    .style('font-size', this.pointToPixel(textSettings.fontSize))
                    .style('font-family', 'Segoe UI Semibold')
                    .style('color', '#777777');
            } else if (valueLength === 0) {
                const errMsg: string = 'Query contains null value';
                const original: d3.Selection<HTMLElement> = this.target.append('div')
                    .classed('tw_value errormsg', true)
                    .text(errMsg)
                    .attr('title', errMsg)
                    .style('font-size', this.pointToPixel(textSettings.fontSize))
                    .style('font-family', 'Segoe UI Semibold')
                    .style('color', '#777777');
            }
            this.finalTextContainer = d3.select('.tw_finalText').style('text-align', textSettings.alignment);

            let colonText: string;
            colonText = ': ';
            if (textValStatic !== '' && this.staticTextSettings.showColon) {
                if (this.staticTextSettings.textPosition === 'suffix') {
                    this.getText(textValDynamic, dynfontStyleClass, textFontSize, dynamictextFontFamily,
                                 this.dynamicSettings.backgroundcolor);
                    this.colonText(colonText);
                    this.getText(textValStatic, staticfontStyleClass, textFontSize, staticTextFontFamily,
                                 this.staticTextSettings.backgroundcolor);
                    if (this.dynamicSettings.italicStyle) {
                                    $('.dynamicpluscolon').css('padding-left', '4px');
                    }
                } else {
                    this.getText(textValStatic, staticfontStyleClass, textFontSize, staticTextFontFamily,
                                 this.staticTextSettings.backgroundcolor);
                    this.colonText(colonText);
                    this.getText(textValDynamic, dynfontStyleClass, textFontSize, dynamictextFontFamily,
                                 this.dynamicSettings.backgroundcolor);
                    if ( this.staticTextSettings.italicStyle) {
                                    $('.dynamicpluscolon').css('padding-left', '4px');
                                 }
                }
            } else if (textValStatic !== '' && !this.staticTextSettings.showColon) {
                if (this.staticTextSettings.textPosition === 'suffix') {
                    this.getText(textValDynamic, dynfontStyleClass, textFontSize, dynamictextFontFamily,
                                 this.dynamicSettings.backgroundcolor);
                    this.addSpace();
                    this.getText(textValStatic, staticfontStyleClass, textFontSize, staticTextFontFamily,
                                 this.staticTextSettings.backgroundcolor);

                } else {
                    this.getText(textValStatic, staticfontStyleClass, textFontSize, staticTextFontFamily,
                                 this.staticTextSettings.backgroundcolor);
                    this.addSpace();
                    this.getText(textValDynamic, dynfontStyleClass, textFontSize, dynamictextFontFamily,
                                 this.dynamicSettings.backgroundcolor);
                }
            } else if (textValStatic === '') {
                this.getText(textValDynamic, dynfontStyleClass, textFontSize, dynamictextFontFamily,
                             this.dynamicSettings.backgroundcolor);
            }
        }

        private getText(text: string, fontStyleClass: string, textFontSize: number, textFontFamily: string, backgroundcolor: string): void {
            this.finalTextContainer.append('span')
                .classed('dynamicText', true)
                .text(text)
                .classed(fontStyleClass, true)
                .style('font-size', this.pointToPixel(textFontSize))
                .style('font-family', textFontFamily)
                .style('background-color', backgroundcolor);
        }

        private colonText(colonText: string): void {
            this.finalTextContainer.append('span')
                .classed('dynamicpluscolon', true)
                .text(colonText);
        }

        private addSpace(): void {
            this.finalTextContainer.append('span')
                .classed('space', true)
                .text(' ');
        }

        public getDefaultTextSettings(): ItextSettings {
            return {
                color: '#777777',
                fontSize: 18,
                postText: '',
                alignment: 'left'
            };
        }

        public getTextSettings(dataView: DataView): ItextSettings {
            let objects: DataViewObjects = null;
            const textSetting: ItextSettings = this.getDefaultTextSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;

            textSetting.color = DataViewObjects.getFillColor(objects, questTextProperties.textSettings.color, textSetting.color);
            textSetting.fontSize = DataViewObjects.getValue(objects, questTextProperties.textSettings.fontSize, textSetting.fontSize);
            textSetting.postText = DataViewObjects.getValue(objects, questTextProperties.textSettings.postText, textSetting.postText);
            textSetting.alignment = DataViewObjects.getValue(
                objects, questTextProperties.textSettings.alignment, textSetting.alignment);

            return textSetting;
        }

        public getDefaultStaticTextSettings(): IStaticTextSettings {
            return {
                showColon: true,
                textPosition: 'suffix',
                backgroundcolor: '#ffffff',
                fontFamily: 'Segoe UI Semibold',
                boldStyle: false,
                italicStyle: false,
                underlineStyle: false,
                postText: '-1'
            };
        }

        public getDefaultDynamicTextSettings(): IDynamicTextSettings {
            return {
                backgroundcolor: '#ffffff',
                fontFamily: 'Segoe UI Semibold',
                boldStyle: false,
                italicStyle: false,
                underlineStyle: false
            };
        }

        public getDynamicTextSettings(dataView: DataView): IDynamicTextSettings {
            let objects: DataViewObjects = null;
            const dynamicSettings: IDynamicTextSettings = this.getDefaultDynamicTextSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return dynamicSettings;
            }
            objects = dataView.metadata.objects;
            dynamicSettings.backgroundcolor = DataViewObjects.getFillColor(objects, questTextProperties.dynamicSettings.backgroundcolor,
                                                                           dynamicSettings.backgroundcolor);
            dynamicSettings.fontFamily = DataViewObjects.getValue(objects, questTextProperties.dynamicSettings.fontFamily,
                                                                  dynamicSettings.fontFamily);
            dynamicSettings.boldStyle = DataViewObjects.getValue(objects, questTextProperties.dynamicSettings.boldStyle,
                                                                 dynamicSettings.boldStyle);
            dynamicSettings.italicStyle = DataViewObjects.getValue(objects, questTextProperties.dynamicSettings.italicStyle,
                                                                   dynamicSettings.italicStyle);
            dynamicSettings.underlineStyle = DataViewObjects.getValue(objects, questTextProperties.dynamicSettings.underlineStyle,
                                                                      dynamicSettings.underlineStyle);

            return dynamicSettings;
        }

        public getStaticTextSettings(dataView: DataView): IStaticTextSettings {
            let objects: DataViewObjects = null;
            const textSetting: IStaticTextSettings = this.getDefaultStaticTextSettings();

            if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
                return textSetting;
            }
            objects = dataView.metadata.objects;
            textSetting.showColon = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.showColon,
                                                             textSetting.showColon);
            textSetting.textPosition = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.textPosition,
                                                                textSetting.textPosition);
            textSetting.backgroundcolor = DataViewObjects.getFillColor(objects, questTextProperties.staticTextSettings.backgroundcolor,
                                                                       textSetting.backgroundcolor);
            textSetting.fontFamily = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.fontFamily,
                                                              textSetting.fontFamily);
            textSetting.boldStyle = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.boldStyle,
                                                             textSetting.boldStyle);
            textSetting.italicStyle = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.italicStyle,
                                                               textSetting.italicStyle);
            textSetting.underlineStyle = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.underlineStyle,
                                                                  textSetting.underlineStyle);
            textSetting.postText = DataViewObjects.getValue(objects, questTextProperties.staticTextSettings.postText,
                                                            textSetting.postText);

            return textSetting;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const textSetting: ItextSettings = this.getTextSettings(this.dataViews);
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'textSettings':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            color: textSetting.color,
                            fontSize: textSetting.fontSize,
                            alignment: textSetting.alignment

                        }
                    });
                    break;
                case 'staticText':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            showColon: this.staticTextSettings.showColon,
                            textPosition: this.staticTextSettings.textPosition,
                            backgroundcolor: this.staticTextSettings.backgroundcolor,
                            // This field to keep it compatible with the older version. DO NOT DELETE.
                            postText: this.staticTextSettings.postText,
                            fontFamily: this.staticTextSettings.fontFamily,
                            boldStyle: this.staticTextSettings.boldStyle,
                            italicStyle: this.staticTextSettings.italicStyle,
                            underlineStyle: this.staticTextSettings.underlineStyle
                        }
                    });
                    break;
                case 'Settings':
                    objectEnumeration.push({
                        objectName: objectName,
                        selector: null,
                        properties: {
                            backgroundcolor: this.dynamicSettings.backgroundcolor,
                            fontFamily: this.dynamicSettings.fontFamily,
                            boldStyle: this.dynamicSettings.boldStyle,
                            italicStyle: this.dynamicSettings.italicStyle,
                            underlineStyle: this.dynamicSettings.underlineStyle
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
