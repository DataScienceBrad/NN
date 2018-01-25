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
        export function getDefaultGradientSelectorSettings(): IGradientSelectorSettings {
            return {
                minColor: '#CCF1EE',
                maxColor: '#01B8AA'
            };
        }
        export function getDefaultAxisSettings(): IAxisSettings {
            return {
                start: null,
                end: null,
                decimalPlaces: null,
                displayUnits: 0,
                fontColor: '#777777',
                fontSize: 12,
                labelsFontFamily: 'Segoe UI',
                show: true,
                minWidth: null,
                showTitle: true,
                titleText: '',
                titleColor: '#777777',
                titleSize: 12,
                titleFontFamily: 'Segoe UI'
            };
        }

        export function getDefaultRangeSettings(): IRangeSettings {
            return {
                dots: true,
                dotsColor: '#01B8AA',
                border: true,
                borderColor: '#FFFFFF',
                hoverColor: '#BE4A47',
                max: null,
                min: null,
                transparency: 10
            };
        }

        export function getDefaultLegendSettings(dataView: DataView): ILegendConfig {
            return {
                fontSize: 8,
                fontFamily: 'Segoe UI',
                labelColor: 'rgb(102, 102, 102)',
                legendName: Visual.legendTitle,
                show: true,
                showTitle: true,
                sizeLegendColor: 'rgba(82, 82, 82, 1)',
                displayUnits: 0,
                decimalPlaces: 0
            };
        }
        export function getDefaultflipSettings(dataView: DataView): IFlipSettings {
            return {
                orient: 'vertical',
                flipText: true,
                flipParentText: true
            };
        }

        export function getDefaultSortSettings(dataView: DataView): ISortSettings {
            return {
                axis: 'asc',
                parent: 'asc'
            };
        }

        export function getDefaultParentAxisSettings(): IParentAxisSettings {
            return {
                split: true,
                fontColor: '#777777',
                fontSize: 16,
                fontFamily: 'Segoe UI'
            };
        }

        export function getDefaultBackgroundSettings(): IBackgroundSettings {
            return {
                bgPrimaryColor: '#999999',
                bgSecondaryColor: '#ffffff',
                bgTransparency: 90,
                show: true
            };
        }

        export function getDefaultGridLinesSettings(): IGridLinesSettings {
            return {
                showAxisGridLines: true,
                thickness: 50,
                color: '#E8E8E8',
                showCategoryGridLines: true,
                categoryThickness: 50,
                categoryColor: 'rgb(166, 166, 166)'
            };
        }

        export function getDefaultTickSettings(): ITickSettings {
            return {
                showAxisTicks: true,
                thickness: 50,
                color: '#E8E8E8',
                showCategoryTicks: true,
                categoryTickThickness: 50,
                categoryTickColor: 'rgb(166, 166, 166)'
            };
        }

        export function getDefaultBoxOptionsSettings(dataView: DataView): IBoxOptionsSettings {
            return {
                median: 'Inclusive',
                whiskerType: 'Min/Max',
                lower: 15,
                higher: 85,
                boxWidth: 'Medium',
                boxUpperColor: '#BDBDBD',
                boxLowerColor: '#585858',
                boxTransparency: 10,
                whiskerColor: '#424242',
                whiskerTransparency: 10,
                outliers: true
            };
        }

        export function getDefaultMeanSettings(dataView: DataView): IMeanSettings {
            return {
                show: true,
                meanShape: 'Circle',
                meanColor: '#ffffff',
                meanWidth: 'Medium'
            };
        }

        // Capabilities property object
        export let chartProperties: {
            RangeSelector: {
                dots: DataViewObjectPropertyIdentifier;
                dotsColor: DataViewObjectPropertyIdentifier;
                border: DataViewObjectPropertyIdentifier;
                borderColor: DataViewObjectPropertyIdentifier;
                max: DataViewObjectPropertyIdentifier;
                min: DataViewObjectPropertyIdentifier;
                hoverColor: DataViewObjectPropertyIdentifier;
                transparency: DataViewObjectPropertyIdentifier;
            };
            colorSelector: {
                fill: DataViewObjectPropertyIdentifier;
            };
            flip: {
                orient: DataViewObjectPropertyIdentifier;
                flipText: DataViewObjectPropertyIdentifier;
                flipParentText: DataViewObjectPropertyIdentifier;
            };
            sort: {
                axis: DataViewObjectPropertyIdentifier;
                parent: DataViewObjectPropertyIdentifier;
            };
            legendSettings: {
                fontSize: DataViewObjectPropertyIdentifier;
                fontFamily: DataViewObjectPropertyIdentifier;
                labelColor: DataViewObjectPropertyIdentifier;
                legendName: DataViewObjectPropertyIdentifier;
                position: DataViewObjectPropertyIdentifier;
                show: DataViewObjectPropertyIdentifier;
                showTitle: DataViewObjectPropertyIdentifier;
                sizeLegendColor: DataViewObjectPropertyIdentifier;
                displayUnits: DataViewObjectPropertyIdentifier;
                decimalPlaces: DataViewObjectPropertyIdentifier;
            };
            xAxisConfig: {
                start: DataViewObjectPropertyIdentifier;
                end: DataViewObjectPropertyIdentifier;
                decimalPlaces: DataViewObjectPropertyIdentifier;
                displayUnits: DataViewObjectPropertyIdentifier;
                fontColor: DataViewObjectPropertyIdentifier;
                fontSize: DataViewObjectPropertyIdentifier;
                labelsFontFamily: DataViewObjectPropertyIdentifier;
                show: DataViewObjectPropertyIdentifier;
                showTicks: DataViewObjectPropertyIdentifier;
                minWidth: DataViewObjectPropertyIdentifier;
                showTitle: DataViewObjectPropertyIdentifier;
                titleText: DataViewObjectPropertyIdentifier;
                titleColor: DataViewObjectPropertyIdentifier;
                titleSize: DataViewObjectPropertyIdentifier;
                titleFontFamily: DataViewObjectPropertyIdentifier;
            };
            yAxisConfig: {
                start: DataViewObjectPropertyIdentifier;
                end: DataViewObjectPropertyIdentifier;
                decimalPlaces: DataViewObjectPropertyIdentifier;
                displayUnits: DataViewObjectPropertyIdentifier;
                fontColor: DataViewObjectPropertyIdentifier;
                fontSize: DataViewObjectPropertyIdentifier;
                labelsFontFamily: DataViewObjectPropertyIdentifier;
                show: DataViewObjectPropertyIdentifier;
                showTicks: DataViewObjectPropertyIdentifier;
                minWidth: DataViewObjectPropertyIdentifier;
                showTitle: DataViewObjectPropertyIdentifier;
                titleText: DataViewObjectPropertyIdentifier;
                titleColor: DataViewObjectPropertyIdentifier;
                titleSize: DataViewObjectPropertyIdentifier;
                titleFontFamily: DataViewObjectPropertyIdentifier;
            };
            parentAxisConfig: {
                split: DataViewObjectPropertyIdentifier;
                fontColor: DataViewObjectPropertyIdentifier;
                fontSize: DataViewObjectPropertyIdentifier;
                fontFamily: DataViewObjectPropertyIdentifier;
                showTicks: DataViewObjectPropertyIdentifier;
                showLines: DataViewObjectPropertyIdentifier;
                thickness: DataViewObjectPropertyIdentifier;
            };
            backgroundBanding: {
                showBackground: DataViewObjectPropertyIdentifier;
                bgPrimaryColor: DataViewObjectPropertyIdentifier;
                bgSecondaryColor: DataViewObjectPropertyIdentifier;
                bgTransparency: DataViewObjectPropertyIdentifier;
            };
            gridLines: {
                showAxisGridLines: DataViewObjectPropertyIdentifier;
                thickness: DataViewObjectPropertyIdentifier;
                color: DataViewObjectPropertyIdentifier;
                showCategoryGridLines: DataViewObjectPropertyIdentifier;
                categoryThickness: DataViewObjectPropertyIdentifier;
                categoryColor: DataViewObjectPropertyIdentifier;
            };
            tickMarks: {
                showAxisTicks: DataViewObjectPropertyIdentifier;
                thickness: DataViewObjectPropertyIdentifier;
                color: DataViewObjectPropertyIdentifier;
                showCategoryTicks: DataViewObjectPropertyIdentifier;
                categoryTickThickness: DataViewObjectPropertyIdentifier;
                categoryTickColor: DataViewObjectPropertyIdentifier;
            };
            gradientSelector: {
                minColor: DataViewObjectPropertyIdentifier;
                maxColor: DataViewObjectPropertyIdentifier;
            };
            boxOptions: {
                median: DataViewObjectPropertyIdentifier;
                whiskerType: DataViewObjectPropertyIdentifier;
                lower: DataViewObjectPropertyIdentifier;
                higher: DataViewObjectPropertyIdentifier;
                boxWidth: DataViewObjectPropertyIdentifier;
                boxUpperColor: DataViewObjectPropertyIdentifier;
                boxLowerColor: DataViewObjectPropertyIdentifier;
                boxTransparency: DataViewObjectPropertyIdentifier;
                whiskerColor: DataViewObjectPropertyIdentifier;
                whiskerTransparency: DataViewObjectPropertyIdentifier;
                outliers: DataViewObjectPropertyIdentifier;
            };
            meanConfig: {
                show: DataViewObjectPropertyIdentifier;
                meanShape: DataViewObjectPropertyIdentifier;
                meanColor: DataViewObjectPropertyIdentifier;
                meanWidth: DataViewObjectPropertyIdentifier;
            }
        } = {
                RangeSelector: {
                    dots: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'show' },
                    dotsColor: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'dotsColor' },
                    border: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'border' },
                    borderColor: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'borderColor' },
                    max: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'max' },
                    min: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'min' },
                    hoverColor: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'hoverColor' },
                    transparency: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'transparency' }
                },
                colorSelector: {
                    fill: <DataViewObjectPropertyIdentifier>{ objectName: 'colorSelector', propertyName: 'fill' }
                },
                flip: {
                    orient: <DataViewObjectPropertyIdentifier>{ objectName: 'flip', propertyName: 'orient' },
                    flipText: <DataViewObjectPropertyIdentifier>{ objectName: 'flip', propertyName: 'flipText' },
                    flipParentText: <DataViewObjectPropertyIdentifier>{ objectName: 'flip', propertyName: 'flipParentText' }
                },
                sort: {
                    axis: <DataViewObjectPropertyIdentifier>{ objectName: 'sort', propertyName: 'axis' },
                    parent: <DataViewObjectPropertyIdentifier>{ objectName: 'sort', propertyName: 'parent' }
                },
                legendSettings: {
                    fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' },
                    fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontFamily' },
                    labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
                    legendName: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
                    position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
                    show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
                    showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
                    sizeLegendColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'sizeLegendColor' },
                    displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'displayUnits' },
                    decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'decimalPlaces' }
                },
                xAxisConfig: {
                    start: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'start' },
                    end: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'end' },
                    decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'decimalPlaces' },
                    displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'displayUnits' },
                    fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'fill' },
                    fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'fontSize' },
                    labelsFontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'labelsFontFamily' },
                    show: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'show' },
                    showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'showTicks' },
                    minWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'minWidth' },
                    showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'showTitle' },
                    titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleText' },
                    titleColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleColor' },
                    titleSize: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleSize' },
                    titleFontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleFontFamily'}
                },
                yAxisConfig: {
                    start: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'start' },
                    end: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'end' },
                    decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'decimalPlaces' },
                    displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'displayUnits' },
                    fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fill' },
                    fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontSize' },
                    labelsFontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'labelsFontFamily' },
                    show: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'show' },
                    showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'showTicks' },
                    minWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'minWidth' },
                    showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'showTitle' },
                    titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleText' },
                    titleColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleColor' },
                    titleSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleSize' },
                    titleFontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleFontFamily'}
                },
                parentAxisConfig: {
                    split: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'split' },
                    fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'fontColor' },
                    fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'fontSize' },
                    fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'fontFamily' },
                    showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'showTicks' },
                    showLines: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'showLines' },
                    thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'thickness' }
                },
                backgroundBanding: {
                    showBackground: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'show' },
                    bgPrimaryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'bgPrimaryColor' },
                    bgSecondaryColor: <DataViewObjectPropertyIdentifier>{
                        objectName: 'backgroundBanding',
                        propertyName: 'bgSecondaryColor'
                    },
                    bgTransparency: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'bgTransparency' }
                },
                gridLines: {
                    showAxisGridLines: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'showAxisGridLines' },
                    thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'thickness' },
                    color: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'color' },
                    showCategoryGridLines: <DataViewObjectPropertyIdentifier>{
                        objectName: 'gridLines',
                        propertyName: 'showCategoryGridLines'
                    },
                    categoryThickness: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'categoryThickness' },
                    categoryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'categoryColor' }
                },
                tickMarks: {
                    showAxisTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'showAxisTicks' },
                    thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'thickness' },
                    color: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'color' },
                    showCategoryTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'showCategoryTicks' },
                    categoryTickThickness: <DataViewObjectPropertyIdentifier>{
                        objectName: 'tickMarks',
                        propertyName: 'categoryTickThickness'
                    },
                    categoryTickColor: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'categoryTickColor' }
                },
                gradientSelector: {
                    minColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientSelector', propertyName: 'minColor' },
                    maxColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientSelector', propertyName: 'maxColor' }
                },
                boxOptions: {
                    median: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'median' },
                    whiskerType: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'whiskerType' },
                    lower: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'lower' },
                    higher: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'higher' },
                    boxWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'boxWidth' },
                    boxUpperColor: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'boxUpperColor' },
                    boxLowerColor: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'boxLowerColor' },
                    boxTransparency: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'boxTransparency' },
                    whiskerColor: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'whiskerColor' },
                    whiskerTransparency:
                                <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'whiskerTransparency' },
                    outliers: <DataViewObjectPropertyIdentifier>{ objectName: 'boxOptions', propertyName: 'outliers' }
                },
                meanConfig: {
                    show: <DataViewObjectPropertyIdentifier>{ objectName: 'meanConfig', propertyName: 'show' },
                    meanShape: <DataViewObjectPropertyIdentifier>{ objectName: 'meanConfig', propertyName: 'meanShape' },
                    meanColor: <DataViewObjectPropertyIdentifier>{ objectName: 'meanConfig', propertyName: 'meanColor' },
                    meanWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'meanConfig', propertyName: 'meanWidth' }
                }
            };

        export function getAxisSettings(dataView: DataView, axis: string): IAxisSettings {
            let axisSetting: IAxisSettings = getDefaultAxisSettings();
            if (!dataView.metadata || !dataView.metadata.objects) { return axisSetting; }
            if (axis === 'X') {
                axisSetting = getXAxisSettings(axisSetting, dataView);
            } else {
                axisSetting = getYAxisSettings(axisSetting, dataView);
            }

            return axisSetting;
        }

        export function getYAxisSettings(yAxisSetting: IAxisSettings, dataView: DataView): IAxisSettings {
            let objects: DataViewObjects = null;
            objects = dataView.metadata.objects;
            yAxisSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.yAxisConfig.show, yAxisSetting.show);
            yAxisSetting.start = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.start, yAxisSetting.start);
            yAxisSetting.end = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.end, yAxisSetting.end);
            yAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.yAxisConfig.fontColor, yAxisSetting.fontColor);
            yAxisSetting.fontSize =
                parseInt(DataViewObjects.getValue(objects, chartProperties.yAxisConfig.fontSize, yAxisSetting.fontSize).toString(), 10);
            yAxisSetting.labelsFontFamily = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.labelsFontFamily, yAxisSetting.labelsFontFamily);
            yAxisSetting.displayUnits = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.displayUnits, yAxisSetting.displayUnits);
            yAxisSetting.decimalPlaces = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.decimalPlaces, yAxisSetting.decimalPlaces);
            yAxisSetting.minWidth = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.minWidth, yAxisSetting.minWidth);
            yAxisSetting.showTitle = <boolean>DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.showTitle, yAxisSetting.showTitle);
            yAxisSetting.titleText = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.titleText, yAxisSetting.titleText);
            yAxisSetting.titleColor = DataViewObjects
                .getFillColor(objects, chartProperties.yAxisConfig.titleColor, yAxisSetting.titleColor);
            yAxisSetting.titleSize = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.titleSize, yAxisSetting.titleSize);
            yAxisSetting.titleFontFamily = DataViewObjects.
                getValue(objects, chartProperties.yAxisConfig.titleFontFamily, yAxisSetting.titleFontFamily);

            return yAxisSetting;
        }

        export function getXAxisSettings(xAxisSetting: IAxisSettings, dataView: DataView): IAxisSettings {
            let objects: DataViewObjects = null;
            objects = dataView.metadata.objects;
            xAxisSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.xAxisConfig.show, xAxisSetting.show);
            xAxisSetting.start = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.start, xAxisSetting.start);
            xAxisSetting.end = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.end, xAxisSetting.end);
            xAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.xAxisConfig.fontColor, xAxisSetting.fontColor);
            xAxisSetting.fontSize = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.fontSize, xAxisSetting.fontSize);
            xAxisSetting.labelsFontFamily = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.labelsFontFamily, xAxisSetting.labelsFontFamily);
            xAxisSetting.displayUnits = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.displayUnits, xAxisSetting.displayUnits);
            xAxisSetting.decimalPlaces = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.decimalPlaces, xAxisSetting.decimalPlaces);
            xAxisSetting.minWidth = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.minWidth, xAxisSetting.minWidth);
            xAxisSetting.showTitle = <boolean>DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.showTitle, xAxisSetting.showTitle);
            xAxisSetting.titleText = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.titleText, xAxisSetting.titleText);
            xAxisSetting.titleColor = DataViewObjects
                .getFillColor(objects, chartProperties.xAxisConfig.titleColor, xAxisSetting.titleColor);
            xAxisSetting.titleSize = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.titleSize, xAxisSetting.titleSize);
            xAxisSetting.titleFontFamily = DataViewObjects.
                getValue(objects, chartProperties.xAxisConfig.titleFontFamily, xAxisSetting.titleFontFamily);

            return xAxisSetting;
        }

        export function getParentAxisSettings(dataView: DataView): IParentAxisSettings {
            let objects: DataViewObjects = null;
            const parentAxisSetting: IParentAxisSettings = getDefaultParentAxisSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return parentAxisSetting; }
            objects = dataView.metadata.objects;
            parentAxisSetting.split = DataViewObjects
                .getValue(objects, chartProperties.parentAxisConfig.split, parentAxisSetting.split);
            parentAxisSetting.fontColor = DataViewObjects
                .getFillColor(objects, chartProperties.parentAxisConfig.fontColor, parentAxisSetting.fontColor);
            parentAxisSetting.fontSize = DataViewObjects
                .getValue(objects, chartProperties.parentAxisConfig.fontSize, parentAxisSetting.fontSize);
            parentAxisSetting.fontFamily = DataViewObjects
                .getValue(objects, chartProperties.parentAxisConfig.fontFamily, parentAxisSetting.fontFamily);

            return parentAxisSetting;
        }

        export function getBackgroundSettings(dataView: DataView): IBackgroundSettings {
            let objects: DataViewObjects = null;
            const backgroundSetting: IBackgroundSettings = getDefaultBackgroundSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return backgroundSetting; }
            objects = dataView.metadata.objects;
            backgroundSetting.bgPrimaryColor = DataViewObjects
                .getFillColor(objects, chartProperties.backgroundBanding.bgPrimaryColor, backgroundSetting.bgPrimaryColor);
            backgroundSetting.bgSecondaryColor = DataViewObjects
                .getFillColor(objects, chartProperties.backgroundBanding.bgSecondaryColor, backgroundSetting.bgSecondaryColor);
            backgroundSetting.bgTransparency = DataViewObjects
                .getValue(objects, chartProperties.backgroundBanding.bgTransparency, backgroundSetting.bgTransparency);
            backgroundSetting.show = DataViewObjects
                .getValue(objects, chartProperties.backgroundBanding.showBackground, backgroundSetting.show);

            return backgroundSetting;
        }

        export function getGridLinesSettings(dataView: DataView): IGridLinesSettings {
            let objects: DataViewObjects = null;
            const gridLinesSettings: IGridLinesSettings = getDefaultGridLinesSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return gridLinesSettings; }
            objects = dataView.metadata.objects;
            gridLinesSettings.showAxisGridLines = <boolean>DataViewObjects
                .getValue(objects, chartProperties.gridLines.showAxisGridLines, gridLinesSettings.showAxisGridLines);
            gridLinesSettings.color = DataViewObjects
                .getFillColor(objects, chartProperties.gridLines.color, gridLinesSettings.color);
            gridLinesSettings.thickness = DataViewObjects
                .getValue(objects, chartProperties.gridLines.thickness, gridLinesSettings.thickness);
            gridLinesSettings.showCategoryGridLines = <boolean>DataViewObjects
                .getValue(objects, chartProperties.gridLines.showCategoryGridLines, gridLinesSettings.showCategoryGridLines);
            gridLinesSettings.categoryColor = DataViewObjects
                .getFillColor(objects, chartProperties.gridLines.categoryColor, gridLinesSettings.categoryColor);
            gridLinesSettings.categoryThickness = DataViewObjects
                .getValue(objects, chartProperties.gridLines.categoryThickness, gridLinesSettings.categoryThickness);

            return gridLinesSettings;
        }
        export function getTickSettings(dataView: DataView): ITickSettings {
            let objects: DataViewObjects = null;
            const tickSettings: ITickSettings = getDefaultTickSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return tickSettings; }
            objects = dataView.metadata.objects;
            tickSettings.showAxisTicks = <boolean>DataViewObjects
                .getValue(objects, chartProperties.tickMarks.showAxisTicks, tickSettings.showAxisTicks);
            tickSettings.color = DataViewObjects
                .getFillColor(objects, chartProperties.tickMarks.color, tickSettings.color);
            tickSettings.thickness = DataViewObjects
                .getValue(objects, chartProperties.tickMarks.thickness, tickSettings.thickness);
            tickSettings.showCategoryTicks = <boolean>DataViewObjects
                .getValue(objects, chartProperties.tickMarks.showCategoryTicks, tickSettings.showCategoryTicks);
            tickSettings.categoryTickColor = DataViewObjects
                .getFillColor(objects, chartProperties.tickMarks.categoryTickColor, tickSettings.categoryTickColor);
            tickSettings.categoryTickThickness = DataViewObjects
                .getValue(objects, chartProperties.tickMarks.categoryTickThickness, tickSettings.categoryTickThickness);

            return tickSettings;
        }

        export function getGradientSelectorSettings(dataView: DataView): IGradientSelectorSettings {
            let objects: DataViewObjects = null;
            const gradientSelectorSetting: IGradientSelectorSettings = getDefaultGradientSelectorSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return gradientSelectorSetting; }
            objects = dataView.metadata.objects;
            gradientSelectorSetting.minColor = DataViewObjects
                .getFillColor(objects, chartProperties.gradientSelector.minColor, gradientSelectorSetting.minColor);
            gradientSelectorSetting.maxColor = DataViewObjects
                .getFillColor(objects, chartProperties.gradientSelector.maxColor, gradientSelectorSetting.maxColor);

            return gradientSelectorSetting;
        }

        export function getRangeSettings(dataView: DataView): IRangeSettings {
            let objects: DataViewObjects = null;
            const rangeSetting: IRangeSettings = getDefaultRangeSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return rangeSetting; }

            objects = dataView.metadata.objects;

            rangeSetting.dots = <boolean>DataViewObjects.getValue(objects, chartProperties.RangeSelector.dots, rangeSetting.dots);
            rangeSetting.dotsColor = DataViewObjects.getFillColor(objects, chartProperties.RangeSelector.dotsColor, rangeSetting.dotsColor);
            rangeSetting.border = <boolean>DataViewObjects.getValue(objects, chartProperties.RangeSelector.border, rangeSetting.border);
            rangeSetting.borderColor = DataViewObjects
                .getFillColor(objects, chartProperties.RangeSelector.borderColor, rangeSetting.borderColor);
            rangeSetting.min = DataViewObjects.getValue(objects, chartProperties.RangeSelector.min, rangeSetting.min);
            rangeSetting.max = DataViewObjects.getValue(objects, chartProperties.RangeSelector.max, rangeSetting.max);
            rangeSetting.hoverColor = DataViewObjects
                .getFillColor(objects, chartProperties.RangeSelector.hoverColor, rangeSetting.hoverColor);
            rangeSetting.transparency = DataViewObjects
                .getValue(objects, chartProperties.RangeSelector.transparency, rangeSetting.transparency);

            return rangeSetting;
        }

        export function getLegendSettings(dataView: DataView): ILegendConfig {
            let objects: DataViewObjects = null;
            const legendSetting: ILegendConfig = getDefaultLegendSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return legendSetting; }
            objects = dataView.metadata.objects;
            legendSetting.show = DataViewObjects
                .getValue<boolean>(objects, chartProperties.legendSettings.show, legendSetting.show);
            legendSetting.legendName = DataViewObjects
                .getValue(objects, chartProperties.legendSettings.legendName, legendSetting.legendName);
            legendSetting.showTitle = <boolean>DataViewObjects
                .getValue(objects, chartProperties.legendSettings.showTitle, legendSetting.showTitle);
            legendSetting.fontSize = DataViewObjects
                .getValue(objects, chartProperties.legendSettings.fontSize, legendSetting.fontSize);
            legendSetting.fontFamily = DataViewObjects
                .getValue(objects, chartProperties.legendSettings.fontFamily, legendSetting.fontFamily);
            legendSetting.labelColor = DataViewObjects
                .getFillColor(objects, chartProperties.legendSettings.labelColor, legendSetting.labelColor);
            legendSetting.sizeLegendColor = DataViewObjects
                .getFillColor(objects, chartProperties.legendSettings.sizeLegendColor, legendSetting.sizeLegendColor);
            legendSetting.displayUnits = DataViewObjects
                .getValue(objects, chartProperties.legendSettings.displayUnits, legendSetting.displayUnits);
            legendSetting.decimalPlaces = DataViewObjects
                .getValue(objects, chartProperties.legendSettings.decimalPlaces, legendSetting.decimalPlaces);

            if (legendSetting.decimalPlaces > 4) {
                legendSetting.decimalPlaces = 4;
            } else if (legendSetting.decimalPlaces < 0) {
                legendSetting.decimalPlaces = 0;
            }

            return legendSetting;
        }

        export function getFlipSettings(dataView: DataView): IFlipSettings {
            let objects: DataViewObjects = null;
            const flipSetting: IFlipSettings = getDefaultflipSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return flipSetting; }
            objects = dataView.metadata.objects;
            flipSetting.orient = DataViewObjects.getValue(objects, chartProperties.flip.orient, flipSetting.orient);
            flipSetting.flipText = <boolean>DataViewObjects.getValue(objects, chartProperties.flip.flipText, flipSetting.flipText);
            flipSetting.flipParentText = <boolean>DataViewObjects
                .getValue(objects, chartProperties.flip.flipParentText, flipSetting.flipParentText);

            return flipSetting;
        }

        export function getSortSettings(dataView: DataView): ISortSettings {
            let objects: DataViewObjects = null;
            const sortSetting: ISortSettings = getDefaultSortSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return sortSetting; }
            objects = dataView.metadata.objects;
            sortSetting.axis = DataViewObjects.getValue(objects, chartProperties.sort.axis, sortSetting.axis);
            sortSetting.parent = DataViewObjects.getValue(objects, chartProperties.sort.parent, sortSetting.parent);

            return sortSetting;
        }

        export function getBoxOptionsSettings(dataView: DataView): IBoxOptionsSettings {
            let objects: DataViewObjects = null;
            const boxOptionsSetting: IBoxOptionsSettings = getDefaultBoxOptionsSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return boxOptionsSetting; }
            objects = dataView.metadata.objects;
            boxOptionsSetting.median = DataViewObjects.getValue(objects, chartProperties.boxOptions.median, boxOptionsSetting.median);
            boxOptionsSetting.whiskerType = DataViewObjects
                        .getValue(objects, chartProperties.boxOptions.whiskerType, boxOptionsSetting.whiskerType);
            boxOptionsSetting.lower = DataViewObjects.getValue(objects, chartProperties.boxOptions.lower, boxOptionsSetting.lower);
            boxOptionsSetting.higher = DataViewObjects.getValue(objects, chartProperties.boxOptions.higher, boxOptionsSetting.higher);
            boxOptionsSetting.boxWidth = DataViewObjects.getValue(objects, chartProperties.boxOptions.boxWidth, boxOptionsSetting.boxWidth);
            boxOptionsSetting.boxUpperColor = DataViewObjects
                        .getFillColor(objects, chartProperties.boxOptions.boxUpperColor, boxOptionsSetting.boxUpperColor);
            boxOptionsSetting.boxLowerColor = DataViewObjects
                        .getFillColor(objects, chartProperties.boxOptions.boxLowerColor, boxOptionsSetting.boxLowerColor);
            boxOptionsSetting.boxTransparency = DataViewObjects
                        .getValue(objects, chartProperties.boxOptions.boxTransparency, boxOptionsSetting.boxTransparency);
            boxOptionsSetting.whiskerColor = DataViewObjects
                        .getFillColor(objects, chartProperties.boxOptions.whiskerColor, boxOptionsSetting.whiskerColor);
            boxOptionsSetting.whiskerTransparency = DataViewObjects
                        .getValue(objects, chartProperties.boxOptions.whiskerTransparency, boxOptionsSetting.whiskerTransparency);
            boxOptionsSetting.outliers = <boolean>DataViewObjects
                        .getValue(objects, chartProperties.boxOptions.outliers, boxOptionsSetting.outliers);

            return boxOptionsSetting;
        }

        export function getMeanSettings(dataView: DataView): IMeanSettings {
            let objects: DataViewObjects = null;
            const meanSetting: IMeanSettings = getDefaultMeanSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return meanSetting; }
            objects = dataView.metadata.objects;
            meanSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.meanConfig.show, meanSetting.show);
            meanSetting.meanShape =
                                DataViewObjects.getValue(objects, chartProperties.meanConfig.meanShape, meanSetting.meanShape);
            meanSetting.meanColor =
                        DataViewObjects.getFillColor(objects, chartProperties.meanConfig.meanColor, meanSetting.meanColor);
            meanSetting.meanWidth =
                        DataViewObjects.getValue(objects, chartProperties.meanConfig.meanWidth, meanSetting.meanWidth);

            return meanSetting;
        }

        export function enumerateColorSelector(instance: VisualObjectInstance[], objectName: string): void {
            if (!Visual.isGradientPresent && Visual.isColorCategoryPresent) {
                for (const dotPlotDataPoint of Visual.legendDataPoints) {
                    instance.push({
                        displayName: dotPlotDataPoint.category,
                        objectName: objectName,
                        properties: {
                            fill: {
                                solid: {
                                    color: dotPlotDataPoint.color
                                }
                            }
                        },
                        selector: dotPlotDataPoint.identity.getSelector()
                    });
                }
            }
        }

        export function enumerateGridLines(gridLinesSetting: IGridLinesSettings,
                                           instance: VisualObjectInstance[], objectName: string, xAxisConfigs: IAxisSettings): void {
            let props: {} = {};
            if (Visual.xParentPresent && Visual.catGroupPresent && xAxisConfigs.show) {
                if (gridLinesSetting.showAxisGridLines && gridLinesSetting.showCategoryGridLines) {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines,
                        thickness: gridLinesSetting.thickness,
                        color: gridLinesSetting.color,
                        showCategoryGridLines: gridLinesSetting.showCategoryGridLines,
                        categoryThickness: gridLinesSetting.categoryThickness,
                        categoryColor: gridLinesSetting.categoryColor
                    };
                } else if (gridLinesSetting.showAxisGridLines) {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines,
                        thickness: gridLinesSetting.thickness,
                        color: gridLinesSetting.color,
                        showCategoryGridLines: gridLinesSetting.showCategoryGridLines
                    };
                } else if (gridLinesSetting.showCategoryGridLines) {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines,
                        showCategoryGridLines: gridLinesSetting.showCategoryGridLines,
                        categoryThickness: gridLinesSetting.categoryThickness,
                        categoryColor: gridLinesSetting.categoryColor
                    };
                } else {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines,
                        showCategoryGridLines: gridLinesSetting.showCategoryGridLines
                    };
                }
            } else if ((Visual.xParentPresent || Visual.catGroupPresent)) {
                if (gridLinesSetting.showAxisGridLines) {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines,
                        thickness: gridLinesSetting.thickness,
                        color: gridLinesSetting.color
                    };
                } else {
                    props = {
                        showAxisGridLines: gridLinesSetting.showAxisGridLines
                    };
                }
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateTickMarks(tickSetting: ITickSettings, instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (Visual.catGroupPresent) {
                if (tickSetting.showAxisTicks && tickSetting.showCategoryTicks && Visual.xParentPresent) {
                    props = {
                        showAxisTicks: tickSetting.showAxisTicks,
                        thickness: tickSetting.thickness,
                        color: tickSetting.color,
                        showCategoryTicks: tickSetting.showCategoryTicks,
                        categoryTickThickness: tickSetting.categoryTickThickness,
                        categoryTickColor: tickSetting.categoryTickColor
                    };
                } else if (tickSetting.showAxisTicks && !Visual.xParentPresent) {
                    props = {
                        showAxisTicks: tickSetting.showAxisTicks,
                        thickness: tickSetting.thickness,
                        color: tickSetting.color
                    };
                } else if (tickSetting.showAxisTicks) {
                    props = {
                        showAxisTicks: tickSetting.showAxisTicks,
                        thickness: tickSetting.thickness,
                        color: tickSetting.color,
                        showCategoryTicks: tickSetting.showCategoryTicks
                    };
                } else if (tickSetting.showCategoryTicks) {
                    props = {
                        showAxisTicks: tickSetting.showAxisTicks,
                        showCategoryTicks: tickSetting.showCategoryTicks,
                        categoryTickThickness: tickSetting.categoryTickThickness,
                        categoryTickColor: tickSetting.categoryTickColor
                    };
                } else {
                    props = {
                        showAxisTicks: tickSetting.showAxisTicks,
                        showCategoryTicks: tickSetting.showCategoryTicks
                    };
                }
                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateYAxis(yAxisConfigs: IAxisSettings,
                                       instance: VisualObjectInstance[], objectName: string, flipSetting: IFlipSettings): void {
            let props: {} = {};
            if (flipSetting.orient === 'horizontal') {
                if (yAxisConfigs.showTitle) {
                    props = {
                        show: yAxisConfigs.show,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
                        labelsFontFamily: yAxisConfigs.labelsFontFamily,
                        minWidth: yAxisConfigs.minWidth,
                        showTitle: yAxisConfigs.showTitle,
                        titleText: yAxisConfigs.titleText,
                        titleColor: yAxisConfigs.titleColor,
                        titleSize: yAxisConfigs.titleSize,
                        titleFontFamily: yAxisConfigs.titleFontFamily
                    };
                } else {
                    props = {
                        show: yAxisConfigs.show,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
                        labelsFontFamily: yAxisConfigs.labelsFontFamily,
                        minWidth: yAxisConfigs.minWidth,
                        showTitle: yAxisConfigs.showTitle
                    };
                }
            } else {
                if (yAxisConfigs.showTitle) {
                    props = {
                        show: yAxisConfigs.show,
                        start: yAxisConfigs.start,
                        end: yAxisConfigs.end,
                        decimalPlaces: yAxisConfigs.decimalPlaces,
                        displayUnits: yAxisConfigs.displayUnits,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
                        labelsFontFamily: yAxisConfigs.labelsFontFamily,
                        showTitle: yAxisConfigs.showTitle,
                        titleText: yAxisConfigs.titleText,
                        titleColor: yAxisConfigs.titleColor,
                        titleSize: yAxisConfigs.titleSize,
                        titleFontFamily: yAxisConfigs.titleFontFamily
                    };
                } else {
                    props = {
                        show: yAxisConfigs.show,
                        start: yAxisConfigs.start,
                        end: yAxisConfigs.end,
                        decimalPlaces: yAxisConfigs.decimalPlaces,
                        displayUnits: yAxisConfigs.displayUnits,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
                        labelsFontFamily: yAxisConfigs.labelsFontFamily,
                        showTitle: yAxisConfigs.showTitle
                    };
                }
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateXAxis(xAxisConfigs: IAxisSettings,
                                       instance: VisualObjectInstance[], objectName: string, flipSetting: IFlipSettings): void {
            let props: {} = {};
            if (flipSetting.orient === 'horizontal') {
                if (xAxisConfigs.showTitle) {
                    props = {
                        show: xAxisConfigs.show,
                        start: xAxisConfigs.start,
                        end: xAxisConfigs.end,
                        decimalPlaces: xAxisConfigs.decimalPlaces,
                        displayUnits: xAxisConfigs.displayUnits,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
                        labelsFontFamily: xAxisConfigs.labelsFontFamily,
                        showTitle: xAxisConfigs.showTitle,
                        titleText: xAxisConfigs.titleText,
                        titleColor: xAxisConfigs.titleColor,
                        titleSize: xAxisConfigs.titleSize,
                        titleFontFamily: xAxisConfigs.titleFontFamily
                    };
                } else {
                    props = {
                        show: xAxisConfigs.show,
                        start: xAxisConfigs.start,
                        end: xAxisConfigs.end,
                        decimalPlaces: xAxisConfigs.decimalPlaces,
                        displayUnits: xAxisConfigs.displayUnits,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
                        labelsFontFamily: xAxisConfigs.labelsFontFamily,
                        showTitle: xAxisConfigs.showTitle
                    };
                }
            } else {
                if (xAxisConfigs.showTitle) {
                    props = {
                        show: xAxisConfigs.show,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
                        labelsFontFamily: xAxisConfigs.labelsFontFamily,
                        minWidth: xAxisConfigs.minWidth,
                        showTitle: xAxisConfigs.showTitle,
                        titleText: xAxisConfigs.titleText,
                        titleColor: xAxisConfigs.titleColor,
                        titleSize: xAxisConfigs.titleSize,
                        titleFontFamily: xAxisConfigs.titleFontFamily
                    };
                } else {
                    props = {
                        show: xAxisConfigs.show,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
                        labelsFontFamily: xAxisConfigs.labelsFontFamily,
                        minWidth: xAxisConfigs.minWidth,
                        showTitle: xAxisConfigs.showTitle
                    };
                }
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateLegend(legendConfig: ILegendConfig, instance: VisualObjectInstance[]
            ,                           objectName: string): void {
            let props: {} = {};
            if (Visual.catSizePresent || Visual.isColorCategoryPresent) {
                if (Visual.catSizePresent && Visual.isColorCategoryPresent) {
                    props = {
                        show: legendConfig.show,
                        position: LegendPosition[Visual.legend.getOrientation()],
                        fontSize: legendConfig.fontSize,
                        fontFamily: legendConfig.fontFamily,
                        labelColor: legendConfig.labelColor,
                        showTitle: legendConfig.showTitle,
                        titleText: legendConfig.legendName,
                        sizeLegendColor: legendConfig.sizeLegendColor,
                        displayUnits: legendConfig.displayUnits,
                        decimalPlaces: legendConfig.decimalPlaces
                    };
                } else if (Visual.catSizePresent && !Visual.isColorCategoryPresent) {
                    props = {
                        show: legendConfig.show,
                        position: LegendPosition[Visual.legend.getOrientation()],
                        fontSize: legendConfig.fontSize,
                        fontFamily: legendConfig.fontFamily,
                        labelColor: legendConfig.labelColor,
                        sizeLegendColor: legendConfig.sizeLegendColor,
                        displayUnits: legendConfig.displayUnits,
                        decimalPlaces: legendConfig.decimalPlaces
                    };
                } else {
                    props = {
                        show: legendConfig.show,
                        position: LegendPosition[Visual.legend.getOrientation()],
                        fontSize: legendConfig.fontSize,
                        fontFamily: legendConfig.fontFamily,
                        labelColor: legendConfig.labelColor,
                        showTitle: legendConfig.showTitle,
                        titleText: legendConfig.legendName
                    };
                }
                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateParentAxis(parentAxisConfigs: IParentAxisSettings,
                                            instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (Visual.xParentPresent && Visual.catGroupPresent) {
                props = {
                    split: parentAxisConfigs.split,
                    fontColor: parentAxisConfigs.fontColor,
                    fontSize: parentAxisConfigs.fontSize,
                    fontFamily: parentAxisConfigs.fontFamily
                };

                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateBackgroundBanding(backgroundSetting: IBackgroundSettings, instance: VisualObjectInstance[],
                                                   objectName: string, xAxisConfigs: IAxisSettings): void {
            let props: {} = {};
            if (Visual.xParentPresent && Visual.catGroupPresent && xAxisConfigs.show) {
                props = {
                    show: backgroundSetting.show,
                    bgPrimaryColor: backgroundSetting.bgPrimaryColor,
                    bgSecondaryColor: backgroundSetting.bgSecondaryColor,
                    bgTransparency: backgroundSetting.bgTransparency
                };

                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateGradientSelector(gradientSelectorSetting: IGradientSelectorSettings,
                                                  instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (Visual.isGradientPresent) {
                props = {
                    minColor: gradientSelectorSetting.minColor,
                    maxColor: gradientSelectorSetting.maxColor
                };

                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateRangeSelector(rangeSetting: IRangeSettings, instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (!Visual.isGradientPresent && !Visual.isColorCategoryPresent && rangeSetting.dots && rangeSetting.border) {
                props = {
                    show: rangeSetting.dots,
                    dotsColor: rangeSetting.dotsColor,
                    border: rangeSetting.border,
                    borderColor: rangeSetting.borderColor,
                    max: rangeSetting.max,
                    min: rangeSetting.min,
                    hoverColor: rangeSetting.hoverColor,
                    transparency: rangeSetting.transparency
                };
            } else if (!Visual.isGradientPresent && !Visual.isColorCategoryPresent && rangeSetting.dots) {
                props = {
                    show: rangeSetting.dots,
                    dotsColor: rangeSetting.dotsColor,
                    border: rangeSetting.border,
                    max: rangeSetting.max,
                    min: rangeSetting.min,
                    hoverColor: rangeSetting.hoverColor,
                    transparency: rangeSetting.transparency
                };
            } else if (rangeSetting.dots && rangeSetting.border) {
                props = {
                    show: rangeSetting.dots,
                    border: rangeSetting.border,
                    borderColor: rangeSetting.borderColor,
                    max: rangeSetting.max,
                    min: rangeSetting.min,
                    hoverColor: rangeSetting.hoverColor,
                    transparency: rangeSetting.transparency
                };
            } else if (rangeSetting.dots) {
                props = {
                    show: rangeSetting.dots,
                    border: rangeSetting.border,
                    max: rangeSetting.max,
                    min: rangeSetting.min,
                    hoverColor: rangeSetting.hoverColor,
                    transparency: rangeSetting.transparency
                };
            } else {
                props = {
                    show: rangeSetting.dots
                };
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateFlip(flipSetting: IFlipSettings, instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (flipSetting.orient === 'horizontal') {
                props = {
                    orient: flipSetting.orient,
                    flipText: flipSetting.flipText,
                    flipParentText: flipSetting.flipParentText
                };
            } else {
                props = {
                    orient: flipSetting.orient
                };
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateSort(
            sortSetting: ISortSettings,
            instance: VisualObjectInstance[],
            objectName: string,
            catGroupPresent: boolean,
            xParentPresent: boolean): void {
            let props: {
                [propertyName: string]: string | number | boolean | Date | Fill | FillRule  | data.ISemanticFilter |
                DefaultValueDefinition |
                ImageValue |
                Paragraphs |
                GeoJson } = {};
            if (catGroupPresent && xParentPresent) {
                props = {
                    axis: sortSetting.axis,
                    parent: sortSetting.parent
                };
            } else if (catGroupPresent && !xParentPresent) {
                props = {
                    axis: sortSetting.axis
                };
            } else if (!catGroupPresent && xParentPresent) {
                props = {
                    parent: sortSetting.parent
                };
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateBoxOptions(boxOptionsSetting: IBoxOptionsSettings,
                                            instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (boxOptionsSetting.whiskerType === 'Custom') {
                props = {
                    median: boxOptionsSetting.median,
                    whiskerType: boxOptionsSetting.whiskerType,
                    lower: boxOptionsSetting.lower,
                    higher: boxOptionsSetting.higher,
                    boxWidth: boxOptionsSetting.boxWidth,
                    boxUpperColor: boxOptionsSetting.boxUpperColor,
                    boxLowerColor: boxOptionsSetting.boxLowerColor,
                    boxTransparency: boxOptionsSetting.boxTransparency,
                    whiskerColor: boxOptionsSetting.whiskerColor,
                    whiskerTransparency: boxOptionsSetting.whiskerTransparency,
                    outliers: boxOptionsSetting.outliers
                };
            } else if (boxOptionsSetting.whiskerType === 'Min/Max') {
                props = {
                    median: boxOptionsSetting.median,
                    whiskerType: boxOptionsSetting.whiskerType,
                    boxWidth: boxOptionsSetting.boxWidth,
                    boxUpperColor: boxOptionsSetting.boxUpperColor,
                    boxLowerColor: boxOptionsSetting.boxLowerColor,
                    boxTransparency: boxOptionsSetting.boxTransparency,
                    whiskerColor: boxOptionsSetting.whiskerColor,
                    whiskerTransparency: boxOptionsSetting.whiskerTransparency
                };
            } else {
                props = {
                    median: boxOptionsSetting.median,
                    whiskerType: boxOptionsSetting.whiskerType,
                    boxWidth: boxOptionsSetting.boxWidth,
                    boxUpperColor: boxOptionsSetting.boxUpperColor,
                    boxLowerColor: boxOptionsSetting.boxLowerColor,
                    boxTransparency: boxOptionsSetting.boxTransparency,
                    whiskerColor: boxOptionsSetting.whiskerColor,
                    whiskerTransparency: boxOptionsSetting.whiskerTransparency,
                    outliers: boxOptionsSetting.outliers
                };
            }
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateMean(meanSetting: IMeanSettings,
                                      instance: VisualObjectInstance[], objectName: string): void {
            let props: {} = {};
            if (meanSetting.show === true) {
                props = {
                    show: meanSetting.show,
                    meanShape: meanSetting.meanShape,
                    meanColor: meanSetting.meanColor,
                    meanWidth: meanSetting.meanWidth
                };
            } else {
                props = {
                    show: meanSetting.show
                };
            }
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
                const objectOrMap: DataViewObject = objects[propertyId.objectName];

                const object: DataViewObject = <DataViewObject>objectOrMap;

                return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
            }

            /** Gets an object from objects. */
            export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
                if (objects && objects[objectName]) {
                    const object: DataViewObject = <DataViewObject>objects[objectName];

                    return object;
                } else { return defaultValue; }
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
                objects: DataViewObjects,
                propertyId: DataViewObjectPropertyIdentifier,
                defaultColor?: string): string {
                const value: Fill = getValue(objects, propertyId);
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
                    const object: DataViewObject = objects[objectName];
                    if (object) {
                        const property: T = <T>object[propertyName];
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

                const propertyValue: T = <T>object[propertyName];
                if (propertyValue === undefined) { return defaultValue; }

                return propertyValue;
            }

            /** Gets the solid color from a fill property using only a propertyName */
            export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
                const value: Fill = DataViewObject.getValue(objects, propertyName);
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
            const categoryObjects: DataViewObject[] = category.objects;

            if (categoryObjects) {
                const categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    const object: DataViewPropertyValue = categoryObject[objectName];
                    if (object) {
                        const property: T = <T>object[propertyName];
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
