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
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export class Visual implements IVisual {
        public static margins = {
            bottom: 20,
            left: 10,
            right: 10,
            top: 40
        };
        public host: IVisualHost;
        private target: HTMLElement;
        private svg: d3.Selection<SVGElement>;
        private viewport: IViewport;
        private colorPalette: IColorPalette;
        private dataView: DataView;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private maxDataValue: number;
        private actualValue: number;
        private actualFormat: string;
        private targetDataFormat: string;
        private goodValue: number;
        // private satisfactoryValue: number;
        // private vGoodValue: number;
        private targetValue: number;

        // bullet chart formatting pane options
        private barColorSettings: IBarColors;
        private labelSettings: ILabelSettings;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.target = options.element;
            this.svg = d3.select(this.target)
                .append('svg');
            this.maxDataValue = -1;
            // this.interactivityService = powerbi.extensibility.utils.interactivity.createInteractivityService(options.host);
        }

        public visualTransform(options: VisualUpdateOptions, host: IVisualHost): BulletViewModel {
            let dataViews = options.dataViews;
            let viewModel: BulletViewModel = {
                dataPoints: []
            };
            if (!dataViews
                || !dataViews[0]
                || !dataViews[0].categorical.values) {
                return viewModel;
            }

            let categorical = dataViews[0].categorical;
            let values = categorical.values;
            let valuesLen = values.length;

            for (let i = 0; i < valuesLen; i++) {
                let bulletDataPoint: BulletDataPoint = {
                    category: '',
                    value: -1,
                    color: '',
                    index: 0
                };
                if (categorical
                    && categorical.values
                    && categorical.values[i]
                    && categorical.values[i].source) {
                    let value = -1;
                    if (categorical.values[i].values
                        && categorical.values[i].values[0]) {
                        value = <number>categorical.values[i].values[0];
                    }

                    if (categorical.values[i].source.roles['satisfactory']) {
                        bulletDataPoint.category = 'Satisfactory';
                        bulletDataPoint.value = value;
                        bulletDataPoint.color = 'satisfactoryColor';
                        bulletDataPoint.index = 1;
                    }
                    else if (categorical.values[i].source.roles['good']) {
                        bulletDataPoint.category = 'Good';
                        bulletDataPoint.value = value;
                        bulletDataPoint.color = 'goodColor';
                        bulletDataPoint.index = 2;
                        this.goodValue = value;
                        this.targetDataFormat = categorical.values[i].source.format ? categorical.values[i].source.format : valueFormatter.DefaultNumericFormat;
                    }
                    else if (categorical.values[i].source.roles['vGood']) {
                        bulletDataPoint.category = 'Very Good';
                        bulletDataPoint.value = value;
                        this.maxDataValue = value;
                        bulletDataPoint.color = 'vGoodColor';
                        bulletDataPoint.index = 3;
                    }
                    else if (categorical.values[i].source.roles['actualValue']) {
                        this.actualValue = value;
                        bulletDataPoint.category = 'Actual Value';
                        bulletDataPoint.value = value;
                        bulletDataPoint.color = 'actualValColor';
                        bulletDataPoint.index = 4;
                        this.actualFormat = categorical.values[i].source.format ? categorical.values[i].source.format : valueFormatter.DefaultNumericFormat;
                    }
                    else if (categorical.values[i].source.roles['targetValue']) {
                        this.targetValue = value;
                        bulletDataPoint.category = 'Target Value';
                        bulletDataPoint.value = value;
                        bulletDataPoint.color = 'targetValColor';
                        bulletDataPoint.index = 5;
                    }
                    viewModel.dataPoints.push(bulletDataPoint);
                }
            }
            viewModel.dataPoints.sort(this.objectSort('index'));
            return viewModel;
        }
        public objectSort(objProperty) {
            let sortOrder = 1;
            if (objProperty[0] === '-') {
                sortOrder = -1;
                objProperty = objProperty.substr(1);
            }

            return function (a, b) {
                let result = (a[objProperty] < b[objProperty]) ? -1 : (a[objProperty] > b[objProperty]) ? 1 : 0;

                return result * sortOrder;
            }
        }

        public update(options: VisualUpdateOptions) {
            this.colorPalette = this.host.colorPalette;
            if (!options) {
                return;
            }

            this.svg.selectAll('*').remove();
            this.viewport = options.viewport;
            const dataView: DataView = this.dataView = options.dataViews && options.dataViews[0]
                ? options.dataViews[0]
                : null;

            let visualWidth = options.viewport.width - Visual.margins.left - Visual.margins.right > 0
                ? options.viewport.width - Visual.margins.left - Visual.margins.right : 0;

            let visualHeight = options.viewport.height - Visual.margins.top - Visual.margins.bottom < 25 ?
                options.viewport.height - Visual.margins.top - Visual.margins.bottom : 25;

            let viewModel: BulletViewModel = this.visualTransform(options, this.host);

            let labelConfig: ILabelSettings = this.labelSettings = enumSettings.getLabelSettings(dataView);
            let barColorConfig: IBarColors = this.barColorSettings = enumSettings.getBarColors(dataView);
            if (this.maxDataValue < 0) {
                this.maxDataValue = this.goodValue > 0 ? this.goodValue : this.actualValue > 0 ? this.actualValue * 2 : 1;
            }
            let THIS = this;
            this.svg.attr({
                width: options.viewport.width,
                height: options.viewport.height
            });

            this.svg.style('fill', '#fff');
            this.svg.attr({
                x: Visual.margins.left,
                y: Visual.margins.top
            });

            let formattedActualVal = visualUtils.getValue(this.actualValue, this.actualFormat, false, labelConfig);            
            let formattedMaxVal = this.targetValue ? visualUtils.getValue(this.targetValue, this.targetDataFormat, false, labelConfig) : "";

            let actualTextProps: TextProperties = {
                fontFamily: 'Segoe UI',
                fontSize: `${labelConfig.labelSize}px`,
                text: formattedActualVal
            };
            let actualText = textMeasurementService.getTailoredTextOrDefault(actualTextProps, visualWidth);

            // for displaying the labels at top
            this.svg.append('text')
                .text(actualText)
                .attr({
                    x: Visual.margins.left,
                    y: 30,
                    fill: labelConfig.labelColor,
                    'font-size': `${labelConfig.labelSize}px`
                })
                .append('title')
                .text(visualUtils.getValue(this.actualValue, this.actualFormat, true));

            // Empty background bar
            this.svg.append('rect')
                .classed('bullet_bar', true)
                .style('fill', barColorConfig.vGoodColor)
                .attr({
                    width: visualWidth,
                    height: visualHeight
                })
                .attr({
                    x: Visual.margins.left,
                    y: Visual.margins.top
                });

            let values = viewModel && viewModel.dataPoints ? viewModel.dataPoints.length : [];

            // function to calculate width of each bar
            function getWidth(currentVal) {
                let width: number = 0;
                width = (currentVal * visualWidth) / THIS.maxDataValue;

                return width;
            }

            // code for creating bars            
            let labelXPos = Visual.margins.right;
            for (let i = 0; i < values; i++) {
                let xPos = Visual.margins.left;
                let yPos = Visual.margins.top;
                let barHeight = visualHeight;
                let barWidth = getWidth(viewModel.dataPoints[i].value);
                if (viewModel.dataPoints[i].color === 'actualValColor') {
                    xPos = Visual.margins.left;
                    barHeight = visualHeight / 4;
                    yPos = yPos + visualHeight / 2 - barHeight / 2;
                    this.svg.append('rect')
                        .classed(viewModel.dataPoints[i].category, true)
                        .classed('bullet_bars', true)
                        .style('fill', barColorConfig[viewModel.dataPoints[i].color])
                        .attr({
                            width: barWidth,
                            height: barHeight
                        })
                        .attr({
                            x: xPos,
                            y: yPos
                        });
                } else if (viewModel.dataPoints[i].color === 'targetValColor') {
                    if (this.targetValue >= 0) {
                        xPos = Visual.margins.left + getWidth(this.targetValue);
                        labelXPos = xPos;
                        barWidth = 2;
                    } else {
                        barWidth = 0;
                    }

                    this.svg.append('line')
                        .classed(viewModel.dataPoints[i].category, true)
                        .classed('targetLine', true)
                        .style({ 'stroke': barColorConfig[viewModel.dataPoints[i].color], 'stroke-width': barWidth })
                        .attr({
                            x1: xPos,
                            x2: xPos,
                            y1: yPos,
                            y2: yPos + barHeight
                        });
                } else {
                    if (i > 0) {
                        let prevWidth = getWidth(viewModel.dataPoints[i - 1].value);
                        // x position should be margin left + width of previous bar
                        xPos = Visual.margins.left + prevWidth;
                        // bar width should be bar width - bar width of previous bar
                        barWidth = barWidth - prevWidth < 0 ? 0 : barWidth - prevWidth;
                    }
                }
                if (viewModel.dataPoints[i].color !== 'targetValColor' && viewModel.dataPoints[i].color !== 'actualValColor') {
                    if (this.targetValue < 0) {
                        barWidth = 0;
                    }
                    this.svg.append('rect')
                        .classed(viewModel.dataPoints[i].category, true)
                        .classed('bullet_bars', true)
                        .style('fill', barColorConfig[viewModel.dataPoints[i].color])
                        .attr({
                            width: barWidth,
                            height: barHeight
                        })
                        .attr({
                            x: xPos,
                            y: yPos
                        });
                }

            }

            let maxValTextProps: TextProperties = {
                fontFamily: 'Segoe UI',
                fontSize: `${labelConfig.labelSize}px`,
                text: formattedMaxVal
            };
            let maxValText = textMeasurementService.getTailoredTextOrDefault(maxValTextProps, options.viewport.width - labelXPos + 4);

            // for displaying the labels at bottom
            if (this.targetValue && this.targetValue >= 0) {
                this.svg.append('text')
                    .text(maxValText)
                    .attr({
                        x: labelXPos - 4,
                        y: Visual.margins.top + visualHeight + parseInt(labelConfig.labelSize.toString()),
                        fill: labelConfig.labelColor,
                        'font-size': `${labelConfig.labelSize}px`
                    })
                    .append('title')
                    .text(visualUtils.getValue(this.targetValue, this.targetDataFormat, true));
            } else {

            }

            let barsData = this.svg.selectAll('rect.bullet_bars').data(viewModel.dataPoints);

            // Adding tooltips
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('rect.bullet_bars'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );
        }

        public getTooltipData(value: any): VisualTooltipDataItem[] {
            let tooltipDataPoints: VisualTooltipDataItem[] = [];
            let displayName = value && value.category ? value.category : '';
            let dataValue = value && value.value ? value.value : '';
            dataValue = visualUtils.getValue(dataValue, this.actualFormat, true);
            let tooltipData: VisualTooltipDataItem = {
                displayName: displayName,
                value: dataValue
            };
            tooltipDataPoints.push(tooltipData);

            return tooltipDataPoints;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            let labelConfig: ILabelSettings = this.labelSettings;
            let barColorConfig: IBarColors = this.barColorSettings;

            switch (objectName) {
                case 'colorSelector':
                    enumSettings.enumerateColorSelector(barColorConfig, objectEnumeration, objectName);
                    break;
                case 'labels':
                    enumSettings.enumerateLabelSettings(labelConfig, objectEnumeration, objectName);
                    break;
                default:
            }

            return objectEnumeration;
        }
    }
}
