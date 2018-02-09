/*
 *  Power BI Visualizations
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
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;

    export type GanttDateType = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';
    export type GanttDataType = 'Integer' | 'Float';
    export type GanttKPIType = 'Value' | 'Indicator' | 'Type';
    export type GanttScrollPositionType = 'Start' | 'Today' | 'End';

    export interface IGeneralSettings {
        groupTasks: boolean;
    }

    export interface IBarColor {
        defaultColor: string;
        showall: boolean;
        fillColor: string;
    }

    export interface ILegendSettings {
        show: boolean;
        position: string;
        showTitle: boolean;
        titleText: string;
        labelColor: string;
        fontSize: number;
    }

    export interface ITaskLabelsSettings {
        show: boolean;
        fill: string;
        fontSize: number;
        fontFamily: string;
        width: number;
        isExpanded: boolean;
        isHierarchy: boolean;
    }
    export interface IColumnHeaderSettings {
        fill: string;
        fill2: string;
        columnOutline: string;
        fontFamily: string;
        fontSize: number;
    }
    export interface ITaskResourceSettings {
        show: boolean;
        position: string;
        fill: string;
        fontSize: number;
        fontFamily: string;
    }

    export interface ITaskGridLinesSettings {
        show: boolean;
        fill: string;
        interval: number;
    }

    export interface IDateTypeSettings {
        type: GanttDateType;
        enableToday: boolean;
    }

    export interface IDataTypeSettings {
        type: GanttDataType;

    }

    export interface IKPIColumnTypeSettings {
        value: GanttKPIType;
        indicator: GanttKPIType;
        type: GanttKPIType;
    }

    export interface IScrollPositionSettings {
        position: GanttScrollPositionType;
        position2: GanttScrollPositionType;
    }

    export interface IDisplayRatioSettings {
        ratio: number;
    }

    export interface ICategoryColumnsWidthSettings {
        width: string;
        categoryLength: number;
    }
    export interface IsortAttributesSettings {
        sortOrder: string;
        sortLevel: number;
        prevSortedColumn: number;
    }
    export interface IGanttSettings {
        general: IGeneralSettings;
        barColor: IBarColor;
        legend: ILegendSettings;
        taskLabels: ITaskLabelsSettings;
        columnHeader: IColumnHeaderSettings;
        taskResource: ITaskResourceSettings;
        scrollPosition: IScrollPositionSettings;
        dateType: IDateTypeSettings;
        datatype: IDataTypeSettings;
        kpiColumnType: IKPIColumnTypeSettings;
        taskGridlines: ITaskGridLinesSettings;
        displayRatio: IDisplayRatioSettings;
        categoryCoumnsWidth: ICategoryColumnsWidthSettings;
        sortAttributes: IsortAttributesSettings;
    }

    export class GanttSettings {
        // tslint:disable-next-line:typedef
        public static get Default() {

            return new this();
        }

        public static parse(objects: DataViewObjects, colors: IColorPalette): IGanttSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties;

            return {
                general: this.parseGeneralSettings(objects),
                barColor: this.parseBarColorSettings(objects, colors),
                legend: this.parseLegendSettings(objects, colors),
                taskLabels: this.parseTaskLabelsSettings(objects, colors),
                columnHeader: this.parseColumnHeaderSettings(objects, colors),
                taskResource: this.parseTaskResourceSettings(objects, colors),
                dateType: this.parseDateTypeSettings(objects),
                datatype: this.parseDataTypeSettings(objects),
                scrollPosition: this.parseScrollPositionSettings(objects),
                kpiColumnType: this.parseKPIColumnTypeSettings(objects),
                taskGridlines: this.parseTaskGridLinesSettings(objects, colors),
                displayRatio: this.parseDisplayRatioSettings(objects),
                categoryCoumnsWidth: this.parseCategoryColumnsWidthSettings(objects),
                sortAttributes: this.parsesortAttributesSettings(objects)
            };
        }

        private static parseCategoryColumnsWidthSettings(objects: DataViewObjects): ICategoryColumnsWidthSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.categoryColumnsWidth;
            const defaultSettings: ICategoryColumnsWidthSettings = this.categoryColumnsWidth;

            return {
                width: DataViewObjects.getValue<string>(objects, properties.width, defaultSettings.width),
                categoryLength: DataViewObjects.getValue<number>(objects, properties.categoryLength, defaultSettings.categoryLength)
            };

        }
        private static parsesortAttributesSettings(objects: DataViewObjects): IsortAttributesSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.sortAttributes;
            const defaultSettings: IsortAttributesSettings = this.sortAttributes;

            return {
                sortOrder: DataViewObjects.getValue<string>(objects, properties.sortOrder, defaultSettings.sortOrder),
                sortLevel: DataViewObjects.getValue<number>(objects, properties.sortLevel, defaultSettings.sortLevel),
                prevSortedColumn: DataViewObjects.getValue<number>(objects, properties.prevSortedColumn, defaultSettings.prevSortedColumn)
            };

        }

        private static parseDisplayRatioSettings(objects: DataViewObjects): IDisplayRatioSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.displayRatio;
            const defaultSettings: IDisplayRatioSettings = this.displayRatio;

            return {
                ratio: DataViewObjects.getValue<number>(objects, properties.ratio, defaultSettings.ratio)
            };

        }

        private static parseGeneralSettings(objects: DataViewObjects): IGeneralSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.general;
            const defaultSettings: IGeneralSettings = this.general;

            return {
                groupTasks: DataViewObjects.getValue<boolean>(objects, properties.groupTasks, defaultSettings.groupTasks)
            };
        }

        private static parseBarColorSettings(objects: DataViewObjects, colors: IColorPalette): IBarColor {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.barColor;
            const defaultSettings: IBarColor = this.barColor;

            return {
                defaultColor: DataViewObjects.getFillColor(objects, properties.defaultColor, defaultSettings.fillColor),
                showall: DataViewObjects.getValue<boolean>(objects, properties.showall, defaultSettings.showall),
                fillColor: DataViewObjects.getFillColor(objects, properties.fillColor, defaultSettings.fillColor)
            };
        }

        private static parseLegendSettings(objects: DataViewObjects, colors: IColorPalette): ILegendSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.legend;
            const defaultSettings: ILegendSettings = this.legend;

            return {
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                position: DataViewObjects.getValue<string>(objects, properties.position, defaultSettings.position),
                showTitle: DataViewObjects.getValue<boolean>(objects, properties.showTitle, defaultSettings.showTitle),
                titleText: DataViewObjects.getValue<string>(objects, properties.titleText, defaultSettings.titleText),
                labelColor: DataViewObjects.getFillColor(objects, properties.labelColor, defaultSettings.labelColor),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize)
            };
        }

        private static parseTaskLabelsSettings(objects: DataViewObjects, colors: IColorPalette): ITaskLabelsSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskLabels;
            const defaultSettings: ITaskLabelsSettings = this.taskLabels;

            return {
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize),
                fontFamily: DataViewObjects.getValue<string>(objects, properties.fontFamily, defaultSettings.fontFamily),
                width: DataViewObjects.getValue<number>(objects, properties.width, defaultSettings.width),
                isExpanded: DataViewObjects.getValue<boolean>(objects, properties.isExpanded, defaultSettings.isExpanded),
                isHierarchy: DataViewObjects.getValue<boolean>(objects, properties.isHierarchy, defaultSettings.isHierarchy)
            };
        }
        private static parseColumnHeaderSettings(objects: DataViewObjects, colors: IColorPalette): IColumnHeaderSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.columnHeader;
            const defaultSettings: IColumnHeaderSettings = this.columnHeader;

            return {
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fill2: DataViewObjects.getFillColor(objects, properties.fill2, defaultSettings.fill2),
                columnOutline: DataViewObjects.getValue<string>(objects, properties.columnOutline, defaultSettings.columnOutline),
                fontFamily: DataViewObjects.getValue<string>(objects, properties.fontFamily, defaultSettings.fontFamily),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize)
            };
        }

        private static parseTaskResourceSettings(objects: DataViewObjects, colors: IColorPalette): ITaskResourceSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskResource;
            const defaultSettings: ITaskResourceSettings = this.taskResource;

            return {
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                position: DataViewObjects.getValue<string>(objects, properties.position, defaultSettings.position),
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                fontSize: DataViewObjects.getValue<number>(objects, properties.fontSize, defaultSettings.fontSize),
                fontFamily: DataViewObjects.getValue<string>(objects, properties.fontFamily, defaultSettings.fontFamily)
            };
        }

        private static parseTaskGridLinesSettings(objects: DataViewObjects, colors: IColorPalette): ITaskGridLinesSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.taskGridlines;
            const defaultSettings: ITaskGridLinesSettings = this.taskGridLines;

            return {
                show: DataViewObjects.getValue<boolean>(objects, properties.show, defaultSettings.show),
                fill: DataViewObjects.getFillColor(objects, properties.fill, defaultSettings.fill),
                interval: DataViewObjects.getValue<number>(objects, properties.interval, defaultSettings.interval)
            };
        }

        private static parseDateTypeSettings(objects: DataViewObjects): IDateTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.dateType;
            const defaultSettings: IDateTypeSettings = this.dateType;

            return {
                type: DataViewObjects.getValue<GanttDateType>(objects, properties.type, defaultSettings.type),
                enableToday: DataViewObjects.getValue<boolean>(objects, properties.enableToday, defaultSettings.enableToday)
            };
        }

        private static parseDataTypeSettings(objects: DataViewObjects): IDataTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.datatype;
            const defaultSettings: IDataTypeSettings = this.datatype;

            return {
                type: DataViewObjects.getValue<GanttDataType>(objects, properties.type, defaultSettings.type)
            };
        }

        private static parseScrollPositionSettings(objects: DataViewObjects): IScrollPositionSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.scrollPosition;
            const defaultSettings: IScrollPositionSettings = this.scrollPosition;

            return {
                position: DataViewObjects.getValue<GanttScrollPositionType>(objects, properties.position, defaultSettings.position),
                position2: DataViewObjects.getValue<GanttScrollPositionType>(objects, properties.position2, defaultSettings.position2)
            };
        }

        private static parseKPIColumnTypeSettings(objects: DataViewObjects): IKPIColumnTypeSettings {
            // tslint:disable-next-line:typedef
            const properties = ganttProperties.kpiColumnType;
            const defaultSettings: IKPIColumnTypeSettings = this.kpiColumnType;

            return {
                value: DataViewObjects.getValue<GanttKPIType>(objects, properties.value, defaultSettings.value),
                indicator: DataViewObjects.getValue<GanttKPIType>(objects, properties.indicator, defaultSettings.indicator),
                type: DataViewObjects.getValue<GanttKPIType>(objects, properties.type, defaultSettings.type)
            };
        }

        // tslint:disable-next-line:no-any
        private static getColor(objects: DataViewObjects, properties: any, defaultColor: string, colors: IColorPalette): string {
            let colorHelper: ColorHelper;
            colorHelper = new ColorHelper(colors, properties, defaultColor);

            return colorHelper.getColorForMeasure(objects, properties);
        }

        // Default Settings
        private static general: IGeneralSettings = {
            groupTasks: false
        };

        private static barColor: IBarColor = {
            defaultColor: '#5F6B6D',
            showall: false,
            fillColor: '#5F6B6D'
        };

        private static legend: ILegendSettings = {
            show: true,
            position: 'Right',
            showTitle: true,
            titleText: '',
            labelColor: '#000000',
            fontSize: 8
        };

        private static taskLabels: ITaskLabelsSettings = {
            show: true,
            fill: '#000000',
            fontSize: 23,
            fontFamily: 'Segoe UI',
            width: 10,
            isExpanded: true,
            isHierarchy: false
        };

        private static columnHeader: IColumnHeaderSettings = {
            fill: '#000000',
            fill2: '#ffffff',
            columnOutline: 'none',
            fontFamily: 'Segoe UI',
            fontSize: 23
        };

        private static taskResource: ITaskResourceSettings = {
            show: true,
            position: 'Right',
            fill: '#000000',
            fontSize: 23,
            fontFamily: 'Segoe UI'
        };

        private static taskGridLines: ITaskGridLinesSettings = {
            show: true,
            fill: '#808080',
            interval: 2
        };

        private static dateType: IDateTypeSettings = {
            type: 'Month',
            enableToday: true
        };

        private static datatype: IDataTypeSettings = {
            type: 'Integer'
        };

        private static kpiColumnType: IKPIColumnTypeSettings = {
            value: 'Value',
            indicator: 'Indicator',
            type: 'Type'
        };

        private static scrollPosition: IScrollPositionSettings = {
            position: 'Start',
            position2: 'Start'
        };

        private static displayRatio: IDisplayRatioSettings = {
            ratio: 40
        };

        private static categoryColumnsWidth: ICategoryColumnsWidthSettings = {
            width: '',
            categoryLength: 0
        };
        private static sortAttributes: IsortAttributesSettings = {
            sortOrder: 'asc',
            sortLevel: 0,
            prevSortedColumn: -1
        };
    }
}
