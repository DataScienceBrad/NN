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

            if (!objects)
                return defaultValue;

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
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
    }

    export interface tooltip {
        text: string;
        header: string;
        imageurl: string;
    };

    export interface MeasureSettings {
        show: boolean;
        textPrecision: number;
        displayUnits: number;
    }

    export var visualProperties = {
        tooltip: {
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'text' },
            header: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'header' },
            imageurl: <DataViewObjectPropertyIdentifier>{ objectName: 'tooltip', propertyName: 'imageurl' },
        },
        MeasureSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'MeasureTooltip', propertyName: 'show' },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'MeasureTooltip', propertyName: 'textPrecision' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'MeasureTooltip', propertyName: 'displayUnits' }
        }
    };

    export class Visual implements IVisual {
        private target: HTMLElement;
        private updateCount: number;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private host: IVisualHost;
        private root: d3.Selection<SVGElement>;
        private image: d3.Selection<SVGElement>;
        private tooltipText: string;
        private header: string;
        private opacity: number;
        private dataViews;
        private imageurl: string;
        private showMeasure: boolean;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.updateCount = 0;
            this.root = d3.select(options.element);
            this.imageurl = "https://genericvisual.blob.core.windows.net/images/Tooltip.svg";
            this.image = this.root.append("div").append("img").attr("src", this.imageurl);
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.tooltipText = "Tooltip text here";
            this.header = "Tooltip header text here";
            this.showMeasure = false;
        }

        public update(options: VisualUpdateOptions) {

            // debugger;
            var textSetting: tooltip = this.getDefaultTextSettings();
            var img = d3.select('img');

            this.image.attr("width", options.viewport.width + 'px');
            this.image.attr("height", options.viewport.height + 'px');

            let dataViews = options.dataViews;
            if (dataViews && dataViews[0] && dataViews[0].metadata) {

                var dataView = this.dataViews = options.dataViews[0];
                var imagePatt = new RegExp('^https?://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png|svg)$');
                var selectedImage: string;
                var validImage: boolean;
                var tooltipSettings: tooltip = this.getToolTipSettings(dataView);
                var measureSettings: MeasureSettings = this.getMeasureSettings(dataView);

                this.tooltipText = tooltipSettings.text;
                this.header = tooltipSettings.header;
                if (measureSettings.show) {
                    if (dataViews[0].categorical && dataViews[0].categorical.values && dataViews[0].categorical.values[0]) {
                        this.header = dataViews[0].categorical.values[0].source.displayName;
                        this.tooltipText = dataViews[0].categorical.values[0].values.toString() != "" ? dataViews[0].categorical.values[0].values.toString() : tooltipSettings.text;
                        let decimalPlaces = measureSettings.textPrecision;
                        let displayUnits = measureSettings.displayUnits;
                        var formatter = valueFormatter.create({ format: dataViews[0].categorical.values[0].source.format, value: displayUnits, precision: decimalPlaces });
                        var formattedData = formatter.format(this.tooltipText);
                        this.tooltipText = formattedData;
                    }
                }
                selectedImage = tooltipSettings.imageurl;
                validImage = imagePatt.test(selectedImage);
                this.image = validImage ? img.attr("src", selectedImage) : img.attr("src", textSetting.imageurl);
                let objects = dataViews[0].metadata.objects;
            }

            if (this.tooltipText !== "") {
                this.tooltipServiceWrapper.addTooltip(this.root,
                    (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(this.tooltipText, this.header),
                    (tooltipEvent: TooltipEventArgs<number>) => null);
            }
        }

        private getToolTipSettings(dataView: DataView): tooltip {
            var objects: DataViewObjects = null;
            var textSetting: tooltip = this.getDefaultTextSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return textSetting;
            objects = dataView.metadata.objects;
            var textProperties = visualProperties;
            textSetting.text = DataViewObjects.getValue(objects, textProperties.tooltip.text, textSetting.text);
            textSetting.header = DataViewObjects.getValue(objects, textProperties.tooltip.header, textSetting.header);
            textSetting.imageurl = DataViewObjects.getValue(objects, textProperties.tooltip.imageurl, textSetting.imageurl);

            return textSetting;
        }

        public getMeasureSettings(dataView: DataView): MeasureSettings {
            var objects: DataViewObjects = null;
            var settings: MeasureSettings = this.getDefaultMeasureSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return settings;

            objects = dataView.metadata.objects;
            var properties = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.MeasureSettings.show, settings.show);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.MeasureSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects.getValue(objects, properties.MeasureSettings.textPrecision, settings.textPrecision);
            return settings;
        }

        public getDefaultTextSettings(): tooltip {
            return {
                text: "sample",
                header: "text",
                imageurl: "https://genericvisual.blob.core.windows.net/images/Tooltip.svg"
            }
        }

        public getDefaultMeasureSettings(): MeasureSettings {
            return {
                show: false,
                textPrecision: 0,
                displayUnits: 0
            }
        }

        private getTooltipData(tooltip: string, header: string): VisualTooltipDataItem[] {
            return [{
                displayName: "",
                value: tooltip,
                header: header
            }];
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var tooltipSetting: tooltip = this.getToolTipSettings(this.dataViews);
            var measureSettings: MeasureSettings = this.getMeasureSettings(this.dataViews);
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'tooltip':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Tooltip Settings',
                        properties: {
                            header: tooltipSetting.header,
                            text: tooltipSetting.text,
                            imageurl: tooltipSetting.imageurl
                        },
                        selector: null
                    });
                    break;
                case 'MeasureTooltip':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: 'Measure Tooltip',
                        selector: null,
                        properties: {
                            show: measureSettings.show,
                            textPrecision: measureSettings.textPrecision,
                            displayUnits: measureSettings.displayUnits
                        }
                    });
                    break;
            };
            return objectEnumeration;
        }
    }
}