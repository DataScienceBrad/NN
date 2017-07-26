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
        export function getDefaultGradientSelectorSettings(): GradientSelectorSettings {
            return {
                minColor: '#CCF1EE',
                maxColor: '#01B8AA'
            };
        }
        export function getDefaultAxisSettings(axis: string, flip: string): AxisSettings {
            return {
                start: dotPlotUtils.returnMin(Visual.dataValues),
                end: dotPlotUtils.returnMax(Visual.dataValues),
                decimalPlaces: 0,
                displayUnits: 0,
                fontColor: '#777777',
                fontSize: 12,
                show: true,
                minWidth: 30,
                showTitle: true,
                titleText: axis === 'Y' ? Visual.yTitleText : Visual.xTitleText,
                titleColor: '#777777',
                titleSize: 12
            };
        }

        export function getDefaultRangeSettings(): RangeSettings {
            return {
                borderColor: '#BE4A47',
                max: 6,
                min: 2,
                transparency: 10
            };
        }

        export function getDefaultLegendSettings(dataView: DataView): LegendConfig {
            return {
                fontSize: 8,
                labelColor: 'rgb(102, 102, 102)',
                legendName: Visual.legendTitle,
                show: true,
                showTitle: true,
                sizeLegendColor: 'rgba(82, 82, 82, 1)',
                displayUnits: 0,
                decimalPlaces: 0
            };
        }
        export function getDefaultflipSettings(dataView: DataView): FlipSettings {
            return {
                orient: 'vertical',
                flipText: true,
                flipParentText: true
            };
        }

        export function getDefaultParentAxisSettings(): ParentAxisSettings {
            return {
                split: true,
                fontColor: '#777777',
                fontSize: 16
            };
        }

        export function getDefaultBackgroundSettings(): BackgroundSettings {
            return {
                bgPrimaryColor: '#999999',
                bgSecondaryColor: '#ffffff',
                bgTransparency: 90,
                show: true
            };
        }

        export function getDefaultGridLinesSettings(): GridLinesSettings {
            return {
                showAxisGridLines: true,
                thickness: 50,
                color: '#E8E8E8',
                showCategoryGridLines: true,
                categoryThickness: 50,
                categoryColor: 'rgb(166, 166, 166)'
            };
        }

        export function getDefaultTickSettings(): TickSettings {
            return {
                showAxisTicks: true,
                thickness: 50,
                color: '#E8E8E8',
                showCategoryTicks: true,
                categoryTickThickness: 50,
                categoryTickColor: 'rgb(166, 166, 166)'
            };
        }

        // Capabilities property object
        export let chartProperties = {
            RangeSelector: {
                max: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'max' },
                min: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'min' },
                borderColor: <DataViewObjectPropertyIdentifier>{ objectName: 'RangeSelector', propertyName: 'borderColor' },
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
            legendSettings: {
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' },
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
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'show' },
                showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'showTicks' },
                minWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'minWidth' },
                showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'showTitle' },
                titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleText' },
                titleColor: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleColor' },
                titleSize: <DataViewObjectPropertyIdentifier>{ objectName: 'xAxis', propertyName: 'titleSize' }
            },
            yAxisConfig: {
                start: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'start' },
                end: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'end' },
                decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'decimalPlaces' },
                displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'displayUnits' },
                fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fill' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'fontSize' },
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'show' },
                showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'showTicks' },
                minWidth: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'minWidth' },
                showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'showTitle' },
                titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleText' },
                titleColor: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleColor' },
                titleSize: <DataViewObjectPropertyIdentifier>{ objectName: 'yAxis', propertyName: 'titleSize' }
            },
            parentAxisConfig: {
                split: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'split' },
                fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'fontColor' },
                fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'fontSize' },
                showTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'showTicks' },
                showLines: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'showLines' },
                thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'parentAxis', propertyName: 'thickness' }
            },
            backgroundBanding: {
                showBackground: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'show' },
                bgPrimaryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'bgPrimaryColor' },
                bgSecondaryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'bgSecondaryColor' },
                bgTransparency: <DataViewObjectPropertyIdentifier>{ objectName: 'backgroundBanding', propertyName: 'bgTransparency' }
            },
            gridLines: {
                showAxisGridLines: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'showAxisGridLines' },
                thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'thickness' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'color' },
                showCategoryGridLines: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'showCategoryGridLines' },
                categoryThickness: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'categoryThickness' },
                categoryColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gridLines', propertyName: 'categoryColor' }
            },
            tickMarks: {
                showAxisTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'showAxisTicks' },
                thickness: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'thickness' },
                color: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'color' },
                showCategoryTicks: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'showCategoryTicks' },
                categoryTickThickness: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'categoryTickThickness' },
                categoryTickColor: <DataViewObjectPropertyIdentifier>{ objectName: 'tickMarks', propertyName: 'categoryTickColor' }
            },
            gradientSelector: {
                minColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientSelector', propertyName: 'minColor' },
                maxColor: <DataViewObjectPropertyIdentifier>{ objectName: 'gradientSelector', propertyName: 'maxColor' }
            }
        };

        export function getAxisSettings(dataView: DataView, axis: string, flip: string): AxisSettings {
            let axisSetting: AxisSettings = getDefaultAxisSettings(axis, flip);
            if (!dataView.metadata || !dataView.metadata.objects) { return axisSetting; }
            if (axis === 'X') {
                axisSetting = getXAxisSettings(axisSetting, dataView);
            } else {
                axisSetting = getYAxisSettings(axisSetting, dataView);
            }

            return axisSetting;
        }

        export function getYAxisSettings(yAxisSetting: AxisSettings, dataView: DataView): AxisSettings {
            let objects: DataViewObjects = null;
            objects = dataView.metadata.objects;
            yAxisSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.yAxisConfig.show, yAxisSetting.show);
            yAxisSetting.start = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.start, yAxisSetting.start);
            yAxisSetting.end = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.end, yAxisSetting.end);
            if (yAxisSetting.start > dotPlotUtils.returnMax(Visual.dataValues) || yAxisSetting.start > yAxisSetting.end) {
                yAxisSetting.start = dotPlotUtils.returnMin(Visual.dataValues);
            }
            if (yAxisSetting.end < dotPlotUtils.returnMin(Visual.dataValues) || yAxisSetting.end < yAxisSetting.start) {
                yAxisSetting.end = dotPlotUtils.returnMax(Visual.dataValues);
            }
            yAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.yAxisConfig.fontColor, yAxisSetting.fontColor);
            yAxisSetting.fontSize = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.fontSize, yAxisSetting.fontSize);
            yAxisSetting.displayUnits = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.displayUnits, yAxisSetting.displayUnits);
            yAxisSetting.decimalPlaces = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.decimalPlaces, yAxisSetting.decimalPlaces);
            if (yAxisSetting.decimalPlaces > 4) {
                yAxisSetting.decimalPlaces = 4;
            } else if (yAxisSetting.decimalPlaces < 0) {
                yAxisSetting.decimalPlaces = 0;
            }
            yAxisSetting.minWidth = DataViewObjects.getValue(objects, chartProperties.yAxisConfig.minWidth, yAxisSetting.minWidth);
            if (yAxisSetting.minWidth > 300) {
                yAxisSetting.minWidth = 300;
            } else if (yAxisSetting.minWidth < 5) {
                yAxisSetting.minWidth = 5;
            }
            yAxisSetting.showTitle = <boolean>DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.showTitle, yAxisSetting.showTitle);
            yAxisSetting.titleText = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.titleText, yAxisSetting.titleText);
            yAxisSetting.titleColor = DataViewObjects
                .getFillColor(objects, chartProperties.yAxisConfig.titleColor, yAxisSetting.titleColor);
            yAxisSetting.titleSize = DataViewObjects
                .getValue(objects, chartProperties.yAxisConfig.titleSize, yAxisSetting.titleSize);

            return yAxisSetting;
        }

        export function getXAxisSettings(xAxisSetting: AxisSettings, dataView: DataView): AxisSettings {
            let objects: DataViewObjects = null;
            objects = dataView.metadata.objects;
            xAxisSetting.show = <boolean>DataViewObjects.getValue(objects, chartProperties.xAxisConfig.show, xAxisSetting.show);
            xAxisSetting.start = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.start, xAxisSetting.start);
            xAxisSetting.end = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.end, xAxisSetting.end);
            if (xAxisSetting.start >
                dotPlotUtils.returnMax(Visual.dataValues) ||
                (xAxisSetting.end ? xAxisSetting.start > xAxisSetting.end : false)) {
                xAxisSetting.start = null;
            }
            if (xAxisSetting.end <
                dotPlotUtils.returnMin(Visual.dataValues) ||
                (xAxisSetting.start ? xAxisSetting.end < xAxisSetting.start : false)) {
                xAxisSetting.end = null;
            }
            xAxisSetting.fontColor = DataViewObjects.getFillColor(objects, chartProperties.xAxisConfig.fontColor, xAxisSetting.fontColor);
            xAxisSetting.fontSize = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.fontSize, xAxisSetting.fontSize);
            xAxisSetting.displayUnits = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.displayUnits, xAxisSetting.displayUnits);
            xAxisSetting.decimalPlaces = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.decimalPlaces, xAxisSetting.decimalPlaces);
            if (xAxisSetting.decimalPlaces > 4) {
                xAxisSetting.decimalPlaces = 4;
            } else if (xAxisSetting.decimalPlaces < 0) {
                xAxisSetting.decimalPlaces = 0;
            }
            xAxisSetting.minWidth = DataViewObjects.getValue(objects, chartProperties.xAxisConfig.minWidth, xAxisSetting.minWidth);
            if (xAxisSetting.minWidth > 300) {
                xAxisSetting.minWidth = 300;
            } else if (xAxisSetting.minWidth < 5) {
                xAxisSetting.minWidth = 5;
            }
            xAxisSetting.showTitle = <boolean>DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.showTitle, xAxisSetting.showTitle);
            xAxisSetting.titleText = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.titleText, xAxisSetting.titleText);
            xAxisSetting.titleColor = DataViewObjects
                .getFillColor(objects, chartProperties.xAxisConfig.titleColor, xAxisSetting.titleColor);
            xAxisSetting.titleSize = DataViewObjects
                .getValue(objects, chartProperties.xAxisConfig.titleSize, xAxisSetting.titleSize);

            return xAxisSetting;
        }

        export function getParentAxisSettings(dataView: DataView): ParentAxisSettings {
            let objects: DataViewObjects = null;
            let parentAxisSetting: ParentAxisSettings = getDefaultParentAxisSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return parentAxisSetting; }
            objects = dataView.metadata.objects;
            parentAxisSetting.split = DataViewObjects
                .getValue(objects, chartProperties.parentAxisConfig.split, parentAxisSetting.split);
            parentAxisSetting.fontColor = DataViewObjects
                .getFillColor(objects, chartProperties.parentAxisConfig.fontColor, parentAxisSetting.fontColor);
            parentAxisSetting.fontSize = DataViewObjects
                .getValue(objects, chartProperties.parentAxisConfig.fontSize, parentAxisSetting.fontSize);

            return parentAxisSetting;
        }

        export function getBackgroundSettings(dataView: DataView): BackgroundSettings {
            let objects: DataViewObjects = null;
            let backgroundSetting: BackgroundSettings = getDefaultBackgroundSettings();

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

        export function getGridLinesSettings(dataView: DataView): GridLinesSettings {
            let objects: DataViewObjects = null;
            let gridLinesSettings: GridLinesSettings = getDefaultGridLinesSettings();

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
        export function getTickSettings(dataView: DataView): TickSettings {
            let objects: DataViewObjects = null;
            let tickSettings: TickSettings = getDefaultTickSettings();

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

        export function getGradientSelectorSettings(dataView: DataView): GradientSelectorSettings {
            let objects: DataViewObjects = null;
            let gradientSelectorSetting: GradientSelectorSettings = getDefaultGradientSelectorSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return gradientSelectorSetting; }
            objects = dataView.metadata.objects;
            gradientSelectorSetting.minColor = DataViewObjects
                .getFillColor(objects, chartProperties.gradientSelector.minColor, gradientSelectorSetting.minColor);
            gradientSelectorSetting.maxColor = DataViewObjects
                .getFillColor(objects, chartProperties.gradientSelector.maxColor, gradientSelectorSetting.maxColor);

            return gradientSelectorSetting;
        }

        export function getRangeSettings(dataView: DataView): RangeSettings {
            let objects: DataViewObjects = null;
            let rangeSetting: RangeSettings = getDefaultRangeSettings();

            if (!dataView.metadata || !dataView.metadata.objects) { return rangeSetting; }

            objects = dataView.metadata.objects;
            rangeSetting.min = DataViewObjects.getValue(objects, chartProperties.RangeSelector.min, rangeSetting.min);
            rangeSetting.max = DataViewObjects.getValue(objects, chartProperties.RangeSelector.max, rangeSetting.max);
            rangeSetting.borderColor = DataViewObjects
                .getFillColor(objects, chartProperties.RangeSelector.borderColor, rangeSetting.borderColor);
            rangeSetting.transparency = DataViewObjects
                .getValue(objects, chartProperties.RangeSelector.transparency, rangeSetting.transparency);

            if (rangeSetting.min < 1) {
                rangeSetting.min = 1;
            } else if (rangeSetting.min > 10) {
                rangeSetting.min = 10;
            }
            if (rangeSetting.max < 1) {
                rangeSetting.max = 1;
            } else if (rangeSetting.max > 20) {
                rangeSetting.max = 20;
            }
            if (rangeSetting.max < rangeSetting.min) {
                rangeSetting.max = rangeSetting.min;
            }

            return rangeSetting;
        }

        export function getLegendSettings(dataView: DataView): LegendConfig {
            let objects: DataViewObjects = null;
            let legendSetting: LegendConfig = getDefaultLegendSettings(dataView);
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

        export function getFlipSettings(dataView: DataView): FlipSettings {
            let objects: DataViewObjects = null;
            let flipSetting: FlipSettings = getDefaultflipSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects) { return flipSetting; }
            objects = dataView.metadata.objects;
            flipSetting.orient = DataViewObjects.getValue(objects, chartProperties.flip.orient, flipSetting.orient);
            flipSetting.flipText = <boolean>DataViewObjects.getValue(objects, chartProperties.flip.flipText, flipSetting.flipText);
            flipSetting.flipParentText = <boolean>DataViewObjects
                .getValue(objects, chartProperties.flip.flipParentText, flipSetting.flipParentText);

            return flipSetting;
        }

        export function enumerateColorSelector(instance, objectName): void {
            if (!Visual.isGradientPresent && Visual.isColorCategoryPresent) {
                for (let dotPlotDataPoint of Visual.legendDataPoints) {
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

        export function enumerateGridLines(gridLinesSetting, instance, objectName, xAxisConfigs): void {
            let props = {};
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

        export function enumerateTickMarks(tickSetting, instance, objectName): void {
            let props = {};
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

        export function enumerateYAxis(yAxisConfigs, instance, objectName, flipSetting): void {
            let props = {};
            if (flipSetting.orient === 'horizontal') {
                if (yAxisConfigs.showTitle) {
                    props = {
                        show: yAxisConfigs.show,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
                        minWidth: yAxisConfigs.minWidth,
                        showTitle: yAxisConfigs.showTitle,
                        titleText: yAxisConfigs.titleText,
                        titleColor: yAxisConfigs.titleColor,
                        titleSize: yAxisConfigs.titleSize
                    };
                } else {
                    props = {
                        show: yAxisConfigs.show,
                        fill: yAxisConfigs.fontColor,
                        fontSize: yAxisConfigs.fontSize,
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
                        showTitle: yAxisConfigs.showTitle,
                        titleText: yAxisConfigs.titleText,
                        titleColor: yAxisConfigs.titleColor,
                        titleSize: yAxisConfigs.titleSize
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

        export function enumerateXAxis(xAxisConfigs, instance, objectName, flipSetting): void {
            let props = {};
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
                        showTitle: xAxisConfigs.showTitle,
                        titleText: xAxisConfigs.titleText,
                        titleColor: xAxisConfigs.titleColor,
                        titleSize: xAxisConfigs.titleSize
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
                        showTitle: xAxisConfigs.showTitle
                    };
                }
            } else {
                if (xAxisConfigs.showTitle) {
                    props = {
                        show: xAxisConfigs.show,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
                        minWidth: xAxisConfigs.minWidth,
                        showTitle: xAxisConfigs.showTitle,
                        titleText: xAxisConfigs.titleText,
                        titleColor: xAxisConfigs.titleColor,
                        titleSize: xAxisConfigs.titleSize
                    };
                } else {
                    props = {
                        show: xAxisConfigs.show,
                        fill: xAxisConfigs.fontColor,
                        fontSize: xAxisConfigs.fontSize,
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

        export function enumerateLegend(legendConfig, instance, objectName): void {
            let props = {};
            if (Visual.catSizePresent || Visual.isColorCategoryPresent) {
                if (Visual.catSizePresent && Visual.isColorCategoryPresent) {
                    props = {
                        show: legendConfig.show,
                        position: LegendPosition[Visual.legend.getOrientation()],
                        fontSize: legendConfig.fontSize,
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

        export function enumerateParentAxis(parentAxisConfigs, instance, objectName): void {
            let props = {};
            if (Visual.xParentPresent && Visual.catGroupPresent) {
                props = {
                    split: parentAxisConfigs.split,
                    fontColor: parentAxisConfigs.fontColor,
                    fontSize: parentAxisConfigs.fontSize
                };

                instance.push({
                    objectName: objectName,
                    properties: props,
                    selector: null
                });
            }
        }

        export function enumerateBackgroundBanding(backgroundSetting, instance, objectName, xAxisConfigs): void {
            let props = {};
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

        export function enumerateGradientSelector(gradientSelectorSetting, instance, objectName): void {
            let props = {};
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

        export function enumerateRangeSelector(rangeSetting, instance, objectName): void {
            let props = {};
            props = {
                max: rangeSetting.max,
                min: rangeSetting.min,
                borderColor: rangeSetting.borderColor,
                transparency: rangeSetting.transparency
            };
            instance.push({
                objectName: objectName,
                properties: props,
                selector: null
            });
        }

        export function enumerateFlip(flipSetting, instance, objectName): void {
            let props = {};
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
