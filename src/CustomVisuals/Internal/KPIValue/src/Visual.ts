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
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import axisHelper = powerbi.extensibility.utils.chart.axis;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;

    function visualTransform(options: VisualUpdateOptions): KPIData {
        let dataViews = options.dataViews;
        let viewModel: KPIData = {
            colorVal: 0,
            colorExists: false,
            goal: 0,
            goalExists: false,
            goalFormat: '',
            indicator: 0,
            indicatorExists: false,
            indicatorFormat: ''
        };
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.values) {
            return viewModel;
        }

        let categorical = dataViews[0].categorical;
        let dataValues = categorical.values;
        let len = dataValues.length;

        for (let i = 0; i < len; i++) {
            let dataValue = 0;
            if (categorical.values[i]
                && categorical.values[i].source) {
                if (categorical.values[i].values
                    && (categorical.values[i].values.length)) {
                    dataValue = !!categorical.values[i].values[0] ? <number>categorical.values[i].values[0] : 0;
                }
                if (categorical.values[i].source.roles['value']) {
                    viewModel.indicator = dataValue;
                    viewModel.indicatorExists = true;
                    viewModel.indicatorFormat = categorical.values[i].source.format
                        ? categorical.values[i].source.format : valueFormatter.DefaultNumericFormat;
                }
                if (categorical.values[i].source.roles['goal']) {
                    viewModel.goal = dataValue;
                    viewModel.goalExists = true;
                    viewModel.goalFormat = categorical.values[i].source.format
                        ? categorical.values[i].source.format : valueFormatter.DefaultNumericFormat;
                }
                if (categorical.values[i].source.roles['colorIndicator']) {
                    viewModel.colorVal = dataValue;
                    viewModel.colorExists = true;
                }
            }
        }

        return viewModel;
    }

    export class Visual implements IVisual {
        public host: IVisualHost;
        private target: HTMLElement;
        private selectionManager: ISelectionManager;
        private viewport: IViewport;
        private colorPalette: IColorPalette;
        private svg: d3.Selection<SVGElement>;
        private selectionIdBuilder: ISelectionIdBuilder;
        private dataView: DataView;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private root: d3.Selection<SVGElement>;
        private viewModel: KPIData;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.root.style({
                cursor: 'default'
            });
            this.selectionManager = options.host.createSelectionManager();
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.target = options.element;
        }

        public update(options: VisualUpdateOptions) {
            this.colorPalette = this.host.colorPalette;
            if (!options) {
                return;
            }
            this.viewport = options.viewport;
            const dataView: DataView = this.dataView = options.dataViews && options.dataViews[0]
                ? options.dataViews[0]
                : null;
            this.viewModel = visualTransform(options);

            let indicatorSettings: IIndicatorSettings = enumSettings.getIndicator(this.dataView);
            let goalSettings: IGoalSettings = enumSettings.getGoalSettings(this.dataView);
            let colorCoding: IColorCoding = enumSettings.getColorCoding(this.dataView);

            this.root.selectAll('div').remove();
            if (!this.viewModel.indicatorExists) {
                this.root.append('div').text('Please select Actual value');
                return;
            }
            
            let indicatorFontSize = parseInt(PixelConverter.fromPoint(indicatorSettings.fontSize), 10);
            let decimalPlaces = indicatorSettings.decimalPlaces;
            let displayUnits = indicatorSettings.displayUnits;
            let goalFontSize = 0;
            let indicatorColor = this.viewModel.colorExists ? '#000' : indicatorSettings.fontColor;
            let symbol = '';
            if (this.viewModel.goalExists && goalSettings.show) {
                goalFontSize = 12;
            }
            if (this.viewModel.colorExists) {
                let colorVal = this.viewModel.colorVal;
                switch (colorVal) {
                    case 1:
                        indicatorColor = colorCoding.oneColor;
                        break;
                    case 2:
                        indicatorColor = colorCoding.twoColor;
                        break;
                    case 3:
                        indicatorColor = colorCoding.threeColor;
                        break;
                    case 4:
                        indicatorColor = colorCoding.fourColor;
                        break;
                    default:
                        break;
                }
            }

            let topPos: any = this.viewport.height / 2 - (indicatorFontSize + goalFontSize) / 2;
            topPos = topPos > 0 ? topPos + 'px' : '0px';
            this.root.append('div')
                .classed('kpiValue_main', true)
                .style({
                    width: this.viewport.width + 'px',
                    top: topPos
                });

            let content = this.root.selectAll('.kpiValue_main');
            let indicatorDiv, goalDiv;
            if (this.viewModel.goalExists && goalSettings.show) {
                if (goalSettings.position === 'top') {
                    goalDiv = content.append('div').classed('kpi_goalVal', true);
                    indicatorDiv = content.append('div').classed('kpi_indicatorVal', true);
                } else {
                    indicatorDiv = content.append('div').classed('kpi_indicatorVal', true);
                    goalDiv = content.append('div').classed('kpi_goalVal', true);
                }
            } else {
                indicatorDiv = content.append('div').classed('kpi_indicatorVal', true);
            }

            let indicatorVal = this.viewModel.indicator;
            let indicatorFormat = this.viewModel.indicatorFormat;
            let indicatorData = VisualUtils.getFormattedData(indicatorVal, indicatorFormat, displayUnits, decimalPlaces, indicatorVal);
            let indicatorTooltip = VisualUtils.getFormattedData(indicatorVal, indicatorFormat, 1, '', indicatorVal);
            indicatorDiv
                .style({
                    width: '100%',
                    'font-size': indicatorFontSize + 'px',
                    'color': indicatorColor
                })
                .text(indicatorData)
                .attr('title', indicatorTooltip);

            if (this.viewModel.goalExists && goalSettings.show) {
                let goalPercent = ((this.viewModel.indicator / this.viewModel.goal) - 1) * 100;
                let decimalPlaceCount = VisualUtils.getDecimalPlaces(goalPercent);
                let goalPercentVal = decimalPlaceCount === 0 ? goalPercent + '%' : goalPercent.toFixed(2) + '%';
                goalPercentVal = goalPercentVal.indexOf('-') > -1 ? goalPercentVal : '+' + goalPercentVal;
                let goalVal = this.viewModel.goal;
                let goalFormat = this.viewModel.goalFormat;
                let goalData = VisualUtils.getFormattedData(goalVal, goalFormat, displayUnits, decimalPlaces, goalVal);
                let goalTooltip = VisualUtils.getFormattedData(goalVal, goalFormat, 1, '', goalVal);
                let goalText: string;
                let goalTooltipText: string;
                if (goalSettings.goal && goalSettings.distance) {
                    goalText = 'Target: ' + goalData + ' (' + goalPercentVal + ')';
                    goalTooltipText = 'Target: ' + goalTooltip + ' (' + goalPercentVal + ')';
                } else if (goalSettings.goal) {
                    goalText = 'Target: ' + goalData;
                    goalTooltipText = 'Target: ' + goalTooltip;
                } else if (goalSettings.distance) {
                    goalText = '(' + goalPercentVal + ')';
                    goalTooltipText = '(' + goalPercentVal + ')';
                }
                goalDiv
                    .style({
                        width: '100%',
                        'font-size': '12px',
                        'color': goalSettings.fontColor
                    })
                    .text(goalText)
                    .attr('title', goalTooltipText);
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            let indicatorSettings: IIndicatorSettings = enumSettings.getIndicator(this.dataView);
            let goalSettings: IGoalSettings = enumSettings.getGoalSettings(this.dataView);
            let colorCoding: IColorCoding = enumSettings.getColorCoding(this.dataView);

            switch (objectName) {
                case 'indicator':
                    if (this.viewModel.colorExists) {
                        objectEnumeration.push({
                            objectName: 'indicator',
                            properties: {
                                fontSize: indicatorSettings.fontSize,
                                labelDisplayUnits: indicatorSettings.displayUnits,
                                labelPrecision: indicatorSettings.decimalPlaces
                            },
                            selector: null
                        });
                    } else {
                        objectEnumeration.push({
                            objectName: 'indicator',
                            properties: {
                                fontSize: indicatorSettings.fontSize,
                                labelDisplayUnits: indicatorSettings.displayUnits,
                                labelPrecision: indicatorSettings.decimalPlaces,
                                fontColor: indicatorSettings.fontColor
                            },
                            selector: null
                        });
                    }

                    break;
                case 'goals':
                    if (this.viewModel.goalExists) {
                        objectEnumeration.push({
                            objectName: 'goals',
                            properties: {
                                show: goalSettings.show,
                                goal: goalSettings.goal,
                                distance: goalSettings.distance,
                                position: goalSettings.position,
                                color: goalSettings.fontColor
                            },
                            selector: null
                        });
                    }
                    break;
                case 'colorCoding':
                    objectEnumeration.push({
                        objectName: 'colorCoding',
                        properties: {
                            oneColor: colorCoding.oneColor,
                            twoColor: colorCoding.twoColor,
                            threeColor: colorCoding.threeColor,
                            fourColor: colorCoding.fourColor
                        },
                        selector: null
                    });
                    break;
                default:
                    break;
            }

            return objectEnumeration;
        }
    }
}
