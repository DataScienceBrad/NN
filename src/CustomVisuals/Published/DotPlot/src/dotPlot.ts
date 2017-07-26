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

    export class Visual implements IVisual {
        public static margins = {
            bottom: 30,
            left: 40,
            right: 0,
            top: 0
        };
        public static isGradientPresent: boolean;
        public static isColorCategoryPresent: boolean;
        public static legendDataPoints: LegendDataPoint[];
        public static xParentPresent: boolean;
        public static catGroupPresent: boolean;
        public static catSizePresent: boolean;
        public static legend: ILegend;
        public static dataValues: number[];
        public static xTitleText: string;
        public static yTitleText: string;
        public static legendTitle: string;
        public host: IVisualHost;
        private target: HTMLElement;
        private legendDotSvg: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
        private viewport: IViewport;
        private colorPalette: IColorPalette;
        private xAxis: d3.Selection<SVGElement>;
        private xParentAxis: d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        private yParentAxis: d3.Selection<SVGElement>;
        private xTitle: d3.Selection<SVGElement>;
        private yTitle: d3.Selection<SVGElement>;
        private svg: d3.Selection<SVGElement>;
        private selectionIdBuilder: ISelectionIdBuilder;
        private data: DotPlotDataPoints;
        private dataView: DataView;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private legendDotTitle: string;
        private interactivityService: IInteractivityService;
        private measureFormat: string;
        private sizeFormat: string;
        private categoryColorData: any;
        private baseContainer: d3.Selection<SVGElement>;
        private scrollableContainer: d3.Selection<SVGElement>;
        private yAxisSvg: d3.Selection<SVGElement>;
        private xAxisSvg: d3.Selection<SVGElement>;
        private dotsContainer: d3.Selection<SVGElement>;
        private svgGridLines: d3.Selection<SVGElement>;
        private xParentAxisSvg: d3.Selection<SVGElement>;
        private yParentAxisSvg: d3.Selection<SVGElement>;
        private catLongestText: string;
        private xParentLongestText: string;
        private axisGridLines: d3.Selection<SVGElement>;
        private bgParentAxis: d3.Selection<SVGElement>;
        private lastValue: boolean;
        private newValue: boolean;
        private isChanged: boolean;
        private flipSetting: FlipSettings;
        private yAxisConfig: AxisSettings;
        private xAxisConfig: AxisSettings;
        private rangeConfig: RangeSettings;
        private legendSetting: LegendConfig;
        private parentAxisConfigs: ParentAxisSettings;
        private gradientSetting: GradientSelectorSettings;
        private backgroundSetting: BackgroundSettings;
        private gridLinesSetting: GridLinesSettings;
        private tickSetting: TickSettings;
        private highlight: boolean;
        private clickFlag: boolean;
        private color: string[];

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            Visual.legend = powerbi.extensibility.utils.chart.legend.createLegend(
                jQuery(options.element),
                options.host && false,
                this.interactivityService,
                true);
            this.target = options.element;
            this.legendDotSvg = d3.select(this.target)
                .append('svg');
            this.baseContainer = d3.select(options.element)
                .append('div')
                .classed('dotPlot_baseContainer', true);

            this.scrollableContainer = this.baseContainer
                .append('div')
                .classed('dotPlot_scrollableContainer', true);

            this.svg = this.scrollableContainer
                .append('svg')
                .classed('dotPlot_dotChart', true);

            this.bgParentAxis = this.svg
                .append('g')
                .classed('dotPlot_bgParentAxis', true);

            this.svgGridLines = this.svg
                .append('g')
                .classed('dotPlot_svgGridLines', true);

            this.axisGridLines = this.svg
                .append('g')
                .classed('dotPlot_axisGridLines', true);

            this.dotsContainer = this.svg.append('g')
                .classed('dotPlot_dotsContainer', true);

            this.interactivityService = powerbi.extensibility.utils.interactivity.createInteractivityService(options.host);
            Visual.catSizePresent = false;
            Visual.xParentPresent = false;
            Visual.catGroupPresent = false;
            this.measureFormat = '';
            this.sizeFormat = '';
            this.xParentLongestText = '';
            this.lastValue = null;
            this.isChanged = false;
            this.color = [];
        }

        public visualTransform(
            options: VisualUpdateOptions, dataView: DataView,
            height: number,
            colors: IColorPalette,
            host: IVisualHost): DotPlotDataPoints {
            let dotPlotdataPoints: DotPlotDataPoints = {
                dataPoints: [],
                xTitleText: '',
                yTitleText: ''
            };
            let dataPoint: DotPlotViewModel;
            if (!dataView
                || !dataView.categorical
                || !dataView.categorical.values
                || !dataView.categorical.categories) {

                return null;
            }
            Visual.catSizePresent = false;
            Visual.xParentPresent = false;
            Visual.catGroupPresent = false;
            Visual.isColorCategoryPresent = false;
            Visual.isGradientPresent = false;
            this.categoryColorData = [];
            let xParentIndex = 0;
            let yParentIndex = 0;
            let catMaxLen = 0;
            let currentCat = '';
            let xParentMaxLen = 0;
            let currentXParent = '';
            const groups: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();

            groups.forEach((group) => {
                for (let i = 0; i < group.values[0].values.length; i++) {
                    if (group.values[0].values[i] !== null) {
                        dataPoint = {
                            category: '',
                            categoryColor: 'red',
                            categoryGroup: '',
                            categorySize: 1,
                            selectionId: null,
                            tooltipData: [],
                            value: 0,
                            xCategoryParent: '',
                            updatedXCategoryParent: '',
                            highlights: null
                        };
                        let colorPalette: IColorPalette = host.colorPalette;
                        let selectionId = host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], i)
                            .withSeries(dataView.categorical.values, group)
                            .createSelectionId();

                        for (let k = 0; k < group.values.length; k++) {
                            if (group.values[k].source.roles['measure']) {
                                yParentIndex = k;
                                dotPlotdataPoints.yTitleText = group.values[k].source.displayName;
                                dataPoint.value = (Number(group.values[k].values[i]));
                                dataPoint.highlights = group.values[k].highlights ? group.values[k].highlights[i] : null;
                                this.measureFormat = group.values[k].source.format;
                            }
                            if (group.values[k].source.roles['categorySize']) {
                                this.legendDotTitle = group.values[k].source.displayName;
                                Visual.catSizePresent = true;
                                this.sizeFormat = group.values[k].source.format;
                                dataPoint.categorySize = (Number(group.values[k].values[i]));
                            }

                            if (group.values[k].source.roles['categoryColor']) {
                                Visual.isGradientPresent = true;
                                dataPoint.categoryColor = dotPlotUtils.convertToString(group.values[k].values[i]);
                                this.categoryColorData.push(group.values[k].values[i]);
                            }
                            let formatter = valueFormatter.create({
                                format: group.values[k].source.format ? group.values[k].source.format : '#,0.00',
                                value: 0,
                                precision: 0
                            });
                            let tooltipDataPoint: TooltipDataPoints = {
                                name: group.values[k].source.displayName,
                                value: formatter.format(parseFloat(dotPlotUtils.convertToString(group.values[k].values[i])))
                            };
                            dataPoint.tooltipData.push(tooltipDataPoint);
                        }

                        this.highlight = dataView.categorical.values[0].highlights ? true : false;

                        for (let cat1 = 0; cat1 < dataView.categorical.categories.length; cat1++) {
                            if (dataView.categorical.categories[cat1].source.roles['category']) {
                                dataPoint.category = dotPlotUtils.convertToString(dataView.categorical.categories[cat1].values[i]);
                            }
                            if (dataView.categorical.categories[cat1].source.roles['categoryGroup']) {
                                dotPlotdataPoints.xTitleText = dataView.categorical.categories[cat1].source.displayName;
                                dataPoint.categoryGroup = dotPlotUtils.convertToString(dataView.categorical.categories[cat1].values[i]);
                                Visual.catGroupPresent = true;
                            }
                            if (dataView.categorical.categories[cat1].source.roles['xCategoryParent']) {
                                xParentIndex = cat1;
                                dataPoint.xCategoryParent = dotPlotUtils.convertToString(dataView.categorical.categories[cat1].values[i]);
                                Visual.xParentPresent = true;
                            }
                            let tooltipDataPoint: TooltipDataPoints = {
                                name: dataView.categorical.categories[cat1].source.displayName,
                                value: dotPlotUtils.convertToString(dataView.categorical.categories[cat1].values[i])
                            };

                            if (JSON.stringify(dataPoint.tooltipData).indexOf(JSON.stringify(tooltipDataPoint)) < 0) {
                                dataPoint.tooltipData.push(tooltipDataPoint);
                            }
                        }

                        for (let k of dataView.metadata.columns) {
                            if (k.roles['categoryColor'] && !Visual.isGradientPresent) {
                                dataPoint.categoryColor = dotPlotUtils.convertToString(group.name);
                                Visual.legendTitle = k.displayName;
                                Visual.isColorCategoryPresent = true;
                                let tooltipDataPoint: TooltipDataPoints = {
                                    name: k.displayName,
                                    value: dotPlotUtils.convertToString(group.name)
                                };
                                dataPoint.tooltipData.push(tooltipDataPoint);
                                break;
                            }
                        }

                        if (Visual.catGroupPresent) {
                            currentCat = dataPoint.categoryGroup;
                        } else if (!Visual.catGroupPresent && Visual.xParentPresent) {
                            currentCat = dataPoint.xCategoryParent;
                        }

                        if (Visual.xParentPresent) {
                            currentXParent = dataPoint.xCategoryParent;
                        }
                        if (currentCat.length > catMaxLen) {
                            catMaxLen = currentCat.length;
                            this.catLongestText = currentCat;
                        }
                        if (currentXParent.length > xParentMaxLen) {
                            xParentMaxLen = currentXParent.length;
                            this.xParentLongestText = currentXParent;
                        }
                        dataPoint.selectionId = selectionId;
                        dotPlotdataPoints.dataPoints.push(dataPoint);
                    }
                }
            });

            for (let iPoints of dotPlotdataPoints.dataPoints) {
                iPoints.updatedXCategoryParent = `${iPoints.xCategoryParent}$$$${iPoints.categoryGroup}`;
            }

            if (!Visual.catGroupPresent && Visual.xParentPresent) {
                dotPlotdataPoints.xTitleText = dataView.categorical.categories[xParentIndex].source.displayName;
                dotPlotdataPoints.yTitleText = dataView.categorical.values[yParentIndex].source.displayName;
            }

            // Creating colors
            Visual.legendDataPoints = [];
            let colorPalette: IColorPalette = host.colorPalette;
            let grouped = dataView.categorical.values.grouped();

            if (Visual.isColorCategoryPresent) {
                Visual.legendDataPoints = grouped.map((group: DataViewValueColumnGroup, index) => {
                    let defaultColor: Fill = {
                        solid: {
                            color: colorPalette.getColor(group.identity.key).value
                        }
                    };

                    return {
                        category: group.name as string,
                        color: enumSettings.DataViewObjects
                            .getValueOverload<Fill>(group.objects, 'colorSelector', 'fill', defaultColor).solid.color,
                        identity: host.createSelectionIdBuilder()
                            .withSeries(dataView.categorical.values, group)
                            .createSelectionId(),
                        selected: false,
                        value: index
                    };
                });
            } else {
                if (Visual.catSizePresent) {
                    Visual.legendDataPoints.push({
                        category: 'Dummy data',
                        color: '',
                        identity: host.createSelectionIdBuilder()
                            .withCategory(null, 0)
                            .createSelectionId(),
                        selected: false,
                        value: 0
                    });
                    Visual.legendTitle = 'blank';
                }
            }

            dotPlotdataPoints.dataPoints.sort(dotPlotUtils.objectSort('updatedXCategoryParent'));

            return dotPlotdataPoints;
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

            const data: DotPlotDataPoints = this.data = this.visualTransform(
                options,
                dataView,
                this.viewport.height,
                this.colorPalette,
                this.host);

            if (data === null) {
                d3.selectAll('.dotPlot_legendCategory').remove();
                d3.selectAll('.dotPlot_categorySize').remove();
                this.svg.selectAll('.dotPlot_xAxisGrid').remove();
                this.svg.selectAll('.dotPlot_yAxisGrid').remove();
                this.svg.selectAll('.dotPlot_xAxisGridLines').remove();
                this.svg.selectAll('.dotPlot_yAxisGridLines').remove();
                this.svg.selectAll('.dotPlot_dot').remove();
                this.xAxisSvg.remove();
                this.yAxisSvg.remove();
                this.yParentAxisSvg.remove();
                this.xParentAxisSvg.remove();
                this.yAxis.remove();
                this.xAxis.remove();
            }
            let visualContext = this;
            Visual.dataValues = [];

            data.dataPoints.forEach(function (d) {
                Visual.dataValues.push(d.value);
            });
            Visual.xTitleText = data.xTitleText;
            Visual.yTitleText = data.yTitleText;
            let flipSetting: FlipSettings = this.flipSetting = enumSettings.getFlipSettings(dataView);
            let yAxisConfig: AxisSettings = this.yAxisConfig = enumSettings.getAxisSettings(this.dataView, 'Y', flipSetting.orient);
            let xAxisConfig: AxisSettings = this.xAxisConfig = enumSettings.getAxisSettings(this.dataView, 'X', flipSetting.orient);
            let rangeConfig: RangeSettings = this.rangeConfig = enumSettings.getRangeSettings(dataView);
            let legendSetting: LegendConfig = this.legendSetting = enumSettings.getLegendSettings(dataView);
            let parentAxisConfigs: ParentAxisSettings = this.parentAxisConfigs = enumSettings.getParentAxisSettings(this.dataView);
            let gradientSelectorSetting: GradientSelectorSettings = this.gradientSetting = enumSettings
                .getGradientSelectorSettings(this.dataView);
            let backgroundSetting: BackgroundSettings = this.backgroundSetting = enumSettings.getBackgroundSettings(this.dataView);
            let gridLinesSetting: GridLinesSettings = this.gridLinesSetting = enumSettings.getGridLinesSettings(this.dataView);
            let tickSettings: TickSettings = this.tickSetting = enumSettings.getTickSettings(this.dataView);
            let width = _.clone(options.viewport.width);
            let height = _.clone(options.viewport.height);

            let dataSizeValues: number[] = [];
            data.dataPoints.forEach(function (d) {
                dataSizeValues.push(d.categorySize);
            });

            // Legends
            let legendWidth = 0, legendHeight = 0, isScrollPresent = false;
            if (legendSetting.show) {
                this.renderLegend(dataView, legendSetting, true);
                legendWidth = parseFloat(jQuery('.legend').attr('width'));
                legendHeight = parseFloat(jQuery('.legend').attr('height'));
            }

            d3.selectAll('.dotPlot_legendCategory').remove();
            d3.selectAll('.dotPlot_categorySize').remove();

            let legendOrient = Visual.legend.getOrientation();
            if (legendSetting.show && (Visual.isColorCategoryPresent || Visual.catSizePresent)) {
                switch (legendOrient) {
                    case 0:
                    case 1:
                        isScrollPresent = d3.select('.navArrow')[0][0] ||
                            ((options.viewport.width / 2) < 200 * (legendSetting.fontSize / 10)) ? true : false;
                        break;
                    case 2:
                    case 3:
                        isScrollPresent = d3.select('.navArrow')[0][0] ||
                            ((options.viewport.height / 2) < 200 * (legendSetting.fontSize / 10)) ? true : false;
                        break;
                    default:
                }
            }

            this.renderLegend(dataView, legendSetting, isScrollPresent);

            this.legendDotSvg
                .attr({
                    class: 'dotPlot_sizeLegend',
                    height: 0,
                    width: 0
                })
                .style('position', 'absolute');

            // Position chart, legends, dotPlot legends according to legend position.
            if (Visual.isColorCategoryPresent && !Visual.isGradientPresent) {
                d3.select('.legend #legendGroup').selectAll('*').style('display', 'block');
            } else {
                d3.select('.legend #legendGroup').selectAll('*').style('display', 'none');
            }
            if (legendSetting.show) {
                switch (legendOrient) {
                    case 0:
                        height = height - legendHeight <= 0 ? 0 : height - legendHeight;
                        if (isScrollPresent) {
                            this.legendDotSvg.attr({
                                height: legendHeight,
                                width: options.viewport.width
                            });
                            if (Visual.isColorCategoryPresent) {
                                height = height - legendHeight <= 0 ? 0 : height - legendHeight;
                                this.legendDotSvg
                                    .style({ 'margin-top': `${legendHeight}px`, 'margin-left': '0' });

                                this.baseContainer.style('margin-top', `${legendHeight * 2}px`);
                            } else {
                                this.legendDotSvg
                                    .style({ 'margin-left': '0' });
                                this.baseContainer.style('margin-top', `${legendHeight}px`);
                            }
                        } else {
                            this.legendDotSvg.attr({
                                height: legendHeight,
                                width: options.viewport.width / 2
                            });
                            this.legendDotSvg.style({ 'margin-top': 0, 'margin-left': `${options.viewport.width / 2}px` });
                        }
                        this.baseContainer.style('height', `${height}px`);
                        this.baseContainer.style('width', `${width}px`);
                        break;
                    case 1:
                        height = height - legendHeight <= 0 ? 0 : height - legendHeight;
                        if (isScrollPresent) {
                            this.legendDotSvg.attr({
                                height: legendHeight,
                                width: options.viewport.width
                            });
                            if (Visual.isColorCategoryPresent) {
                                height = height - legendHeight <= 0 ? 0 : height - legendHeight;
                                this.legendDotSvg
                                    .style({ 'margin-top': d3.select('.legend').style('margin-top'), 'margin-left': '0px' });
                                d3.select('.legend').style('margin-top', `${height}px`);
                            } else {
                                this.legendDotSvg
                                    .style({ 'margin-top': d3.select('.legend').style('margin-top'), 'margin-left': '0px' });
                            }
                        } else {
                            this.legendDotSvg.attr({
                                height: legendHeight,
                                width: options.viewport.width / 2
                            });
                            this.legendDotSvg
                                .style({
                                    'margin-top': d3.select('.legend')
                                        .style('margin-top'), 'margin-left': `${options.viewport.width / 2}px`
                                });
                        }
                        this.baseContainer.style('height', `${height}px`);
                        this.baseContainer.style('width', `${width}px`);
                        break;
                    case 3:
                        width = width - legendWidth <= 0 ? 0 : width - legendWidth;
                        if (isScrollPresent) {
                            this.legendDotSvg.attr({
                                width: 0,
                                height: 0
                            });
                        } else {
                            this.legendDotSvg.attr({
                                width: legendWidth,
                                height: options.viewport.height / 2
                            });
                            this.legendDotSvg
                                .style({ 'margin-top': `${options.viewport.height / 2}px`, 'margin-left': 0 });
                        }
                        this.baseContainer.style('height', `${height}px`);
                        this.baseContainer.style('width', `${width}px`);
                        break;
                    case 2:
                        width = width - legendWidth <= 0 ? 0 : width - legendWidth;
                        if (isScrollPresent) {
                            this.legendDotSvg.attr({
                                width: 0,
                                height: 0
                            });
                        } else {
                            this.legendDotSvg.attr({
                                width: legendWidth,
                                height: options.viewport.height / 2
                            });
                            this.legendDotSvg
                                .style({ 'margin-top': `${options.viewport.height / 2}px`, 'margin-left': `${width}px` });
                        }
                        this.baseContainer.style('height', `${height}px`);
                        this.baseContainer.style('width', `${width}px`);
                        break;
                    default:
                }
            }
            if (legendSetting.show && Visual.catSizePresent) {
                this.renderSizeLegend(legendHeight, legendOrient, isScrollPresent, dataSizeValues, legendSetting, legendWidth, options);
            }

            this.svg.attr({
                width: width,
                height: height
            });

            this.svg.selectAll('.dotPlot_xAxisGrid').remove();
            this.svg.selectAll('.dotPlot_yAxisGrid').remove();
            this.svg.selectAll('.dotPlot_xAxisGridLines').remove();
            this.svg.selectAll('.dotPlot_yAxisGridLines').remove();
            this.svg.selectAll('.dotPlot_dot').remove();
            this.svg.selectAll('.dotPlot_xAxisGridRect').remove();
            let translate = 0;
        
            let yAxisFormatter;
            let yAxisWidth = 0, xAxisWidth: number, xAxisParentHeight = 0, yAxisParentHeight: number, yAxisHeight = 0;
            let xScale, yScale, rScale, xAxisFormatter, xParentScale, yParentScale;
            const format: string = this.measureFormat;

            if (flipSetting.orient === 'horizontal') {
                this.scrollableContainer.style({ 'overflow-x': 'hidden', 'overflow-y': 'auto' });
                if (this.xAxisSvg) {
                    this.xAxisSvg.remove();
                }
                if (this.yAxisSvg) {
                    this.yAxisSvg.remove();
                }
                if (this.yParentAxisSvg) {
                    this.yParentAxisSvg.remove();
                }
                if (this.xParentAxisSvg) {
                    this.xParentAxisSvg.remove();
                }
                this.xAxisSvg = this.baseContainer
                    .append('svg')
                    .classed('dotPlot_xAxisSvg', true);
                this.xAxis = this.xAxisSvg
                    .append('g')
                    .classed('dotPlot_xAxis', true);
                this.yAxisSvg = this.scrollableContainer.append('svg')
                    .classed('dotPlot_yAxisSvg', true);
                this.yAxis = this.yAxisSvg
                    .append('g')
                    .classed('dotPlot_yAxis', true);
                this.yTitle = this.yAxisSvg.append('g')
                    .classed('dotPlot_yAxis dotPlot_yTitle', true);
                this.xTitle = this.xAxisSvg.append('g')
                    .classed('dotPlot_xAxis dotPlot_xTitle', true);
                this.yParentAxisSvg = this.scrollableContainer.append('svg')
                    .classed('dotPlot_yParentAxisSvg', true);
                this.yParentAxis = this.yParentAxisSvg
                    .append('g')
                    .classed('dotPlot_yParentAxis', true);
                Visual.margins.right = 0;
                Visual.margins.left = 0;
                Visual.margins.bottom = 0;
                Visual.margins.top = 0;
                let measureTextProperties;
                let value = parseFloat(dotPlotUtils.returnMax(Visual.dataValues).toString());
                xAxisFormatter = valueFormatter.create({
                    format: format, precision: xAxisConfig.decimalPlaces, value: xAxisConfig.displayUnits
                });
                let formattedMaxMeasure = xAxisConfig.displayUnits === 0 ?
                    dotPlotUtils.getValue(value, xAxisConfig, format) : xAxisFormatter.format(value);
                measureTextProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: formattedMaxMeasure
                };
                if (xAxisConfig.show) {
                    let xTitleHeight = 0;
                    if (xAxisConfig.showTitle) {
                        let xTitleTextProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisConfig.titleText
                        };
                        xTitleHeight = textMeasurementService.measureSvgTextHeight(xTitleTextProperties);
                        Visual.margins.bottom = xTitleHeight + 5;
                    }

                    let xAxisHeight: number = textMeasurementService.measureSvgTextHeight(measureTextProperties) + 5;
                    Visual.margins.bottom += xAxisHeight;
                } else {
                    Visual.margins.bottom = 5;
                    xAxisParentHeight = 0;
                }

                let yTitleHeight = 0;
                if (yAxisConfig.show) {
                    if (yAxisConfig.showTitle) {
                        let yTitleTextProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisConfig.titleText
                        };
                        yTitleHeight = textMeasurementService.measureSvgTextHeight(yTitleTextProperties) + 5;
                        Visual.margins.left = yTitleHeight;
                    }

                    let catTextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${yAxisConfig.fontSize}px`,
                        text: this.catLongestText
                    };
                    yAxisWidth = flipSetting.flipText ?
                        textMeasurementService.measureSvgTextWidth(catTextProperties) + 5 :
                        textMeasurementService.measureSvgTextHeight(catTextProperties) + 5;
                    Visual.margins.left += yAxisWidth;

                    let parentTextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${parentAxisConfigs.fontSize}px`,
                        text: this.xParentLongestText
                    };

                    if (Visual.catGroupPresent && Visual.xParentPresent) {
                        yAxisHeight = flipSetting.flipParentText ?
                            textMeasurementService.measureSvgTextWidth(parentTextProperties) + 5 :
                            textMeasurementService.measureSvgTextHeight(parentTextProperties);
                    } else {
                        //yAxisHeight = 15;
                        let measureTextWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                        yAxisHeight = measureTextWidth / 2;
                    }

                    if (this.parentAxisConfigs.split) {
                        Visual.margins.right = yAxisHeight;
                    } else {
                        yAxisHeight = yAxisHeight + 5;
                        Visual.margins.left += yAxisHeight;
                        let measureTextWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties) + 2;
                        Visual.margins.right = measureTextWidth / 2;
                    }

                } else {
                    let measureTextWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties) + 2; //2 for (-) sign in labels
                    Visual.margins.right = measureTextWidth / 2;
                    Visual.margins.left = measureTextWidth / 2;
                }

                // Svg adjustment
                width = width - Visual.margins.left - Visual.margins.right < 0 ? 0 : width - Visual.margins.left - Visual.margins.right;
                height = height - Visual.margins.bottom < 0 ? 0 : height - Visual.margins.bottom;
                this.svg.attr('width', width);
                this.svg.attr('height', height);
                this.svg.style('margin-left', `${Visual.margins.left}px`);
                this.svg.style('margin-top', '0px');
                // X Axis adjustment
                this.xAxisSvg.attr({
                    width: width + Visual.margins.left + Visual.margins.right,
                    height: Visual.margins.bottom
                });
                this.xAxisSvg.style({
                    'margin-top': `${height}px`
                });
                // Y Axis adjustment
                this.yAxisSvg.attr({
                    width: Visual.margins.left,
                    height: height
                });
                // X Axis parent adjustment
                if (this.parentAxisConfigs.split) {
                    this.yParentAxisSvg.attr({
                        width: Visual.margins.right,
                        height: height
                    });
                    this.yParentAxisSvg.style('margin-left', `${width + Visual.margins.left - 2}px`);
                } else {
                    this.yParentAxisSvg.attr({
                        width: yAxisHeight,
                        height: height
                    });
                    this.yParentAxisSvg.style('margin-left', `${yTitleHeight}px`);
                }

                // Scales
                xScale = d3.scale.linear()
                    .domain([xAxisConfig.start, xAxisConfig.end])
                    .range([0, width]);

                yScale = d3.scale.ordinal()
                    .domain(data.dataPoints.map(d => d.updatedXCategoryParent))
                    .rangeBands([height, 3]);

                rScale = d3.scale.linear()
                    .domain([dotPlotUtils.returnMin(dataSizeValues), (dotPlotUtils.returnMax(dataSizeValues))])
                    .range([rangeConfig.min, rangeConfig.max]);

                let widthForXAxis = width;
                let heightForXAxis = height;
                let textProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: this.catLongestText
                };
                let yAxisPoints = data.dataPoints.map(d => d.updatedXCategoryParent).filter(dotPlotUtils.getDistinctElements).length;

                // Scroll logic
                if ((yAxisConfig.minWidth * yAxisPoints) > (height)) {
                    height = (yAxisConfig.minWidth * yAxisPoints);
                    width = width - 20 < 0 ? 0 : width - 20;
                    xScale.range([0, width]);
                    yScale.rangeBands([height, 3]);
                    this.svg.attr({
                        width: width,
                        height: height
                    });
                    this.yParentAxisSvg.attr({
                        height: height
                    });
                    if (this.parentAxisConfigs.split) {
                        this.yParentAxisSvg.style('margin-left', `${width + Visual.margins.left - 2}px`);
                    } else {
                        this.yParentAxisSvg.style('margin-left', `${yTitleHeight}px`);
                    }
                    this.yAxisSvg.attr({
                        width: Visual.margins.left,
                        height: height
                    });
                }

                this.scrollableContainer.style('width', `${Visual.margins.left + widthForXAxis + Visual.margins.right}px`);
                this.scrollableContainer.style('height', `${heightForXAxis + 1}px`);
                this.scrollableContainer.style('margin-left', '0px');

                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');

                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .ticks(axisHelper.getRecommendedNumberOfTicksForXAxis(width))
                    .orient('bottom');

                // Draw X Axis
                if (xAxisConfig.show) {
                    this.xAxis.attr('transform', `translate(${Visual.margins.left})`)
                        .call(xAxis);

                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick').append('title')
                        .text((d) => {
                            return d;
                        });
                }
                // Update y-Axis labels
                if (yAxisConfig.show) {
                    if (yAxisConfig.showTitle) {
                        let yTitleTextProps = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisConfig.titleText
                        };
                        this.yTitle
                            .classed('dotPlot_yTitle', true)
                            .attr('transform', `translate(5,${heightForXAxis / 2})`)
                            .append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('dy', '0.71em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${yAxisConfig.titleSize}px`)
                            .style('fill', yAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(yTitleTextProps, heightForXAxis))
                            .append('title')
                            .text( yAxisConfig.titleText);
                    }
                    this.yAxis
                        .attr('transform', `translate(${Visual.margins.left},0)`)
                        .call(yAxis);

                    let yAxisSvgText = this.yAxisSvg.selectAll('.dotPlot_yAxis .tick text');
                    yAxisSvgText
                        .style('font-size', `${yAxisConfig.fontSize}px`)
                        .style('fill', yAxisConfig.fontColor)
                        .text(function (d) {
                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${yAxisConfig.fontSize}px`,
                                text: dotPlotUtils.getText(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, flipSetting.flipText ?
                                1000 : yScale.rangeBand());
                        })
                        .attr('data-parent', function (d) {
                            return d.substring(0, d.indexOf('$$$') >= 0 ? d.indexOf('$$$') : 0);
                        });

                    if (flipSetting.flipText) {
                        yAxisSvgText
                            .style('text-anchor', 'end')
                            .attr('transform', 'rotate(0)')
                            .attr('x', -3);
                    } else {
                        yAxisSvgText
                            .style('text-anchor', 'middle')
                            .attr('transform', 'rotate(-90)')
                            .attr('y', -yAxisWidth / 2)
                            .attr('x', 0);
                    }

                    this.yAxis.selectAll('path')
                        .remove();

                    this.xAxis.selectAll('path')
                        .remove();

                    // For category Parent
                    if (!(!Visual.catGroupPresent && Visual.xParentPresent) || (!Visual.xParentPresent)) {
                        this.yParentAxis.selectAll('.dotPlot_xAxisGridLines').remove();
                        let yTicks: any = this.yAxisSvg.selectAll('.dotPlot_yAxis .tick text');
                        let yTicksLen = yTicks.size();
                        let yParentTicks: string[] = [];
                        let isBool = false;
                        let iCounter = 0;
                        let j = 0, i = 0;
                        translate = height;
                        this.svgGridLines.append('line')
                            .classed('dotPlot_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 1,
                                x2: 1,
                                y1: 3,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width - 2,
                                x2: width - 2,
                                y1: 3,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width - 2,
                                x2: 0,
                                y1: 3,
                                y2: 3
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width - 2,
                                x2: 0,
                                y1: height,
                                y2: height
                            });
                        if (tickSettings.showCategoryTicks && Visual.xParentPresent) {
                            this.yParentAxisSvg.append('line')
                                .classed('dotPlot_yAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: 0,
                                    x2: yAxisHeight,
                                    y1: Visual.margins.top + 3,
                                    y2: Visual.margins.top + 3
                                });

                            this.yParentAxisSvg.append('line')
                                .classed('dotPlot_yAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: 0,
                                    x2: yAxisHeight,
                                    y1: height,
                                    y2: height
                                });
                        }
                        if (tickSettings.showAxisTicks) {
                            this.yAxisSvg.append('line')
                                .classed('dotPlot_xAxisGridLines', true)
                                .attr({
                                    stroke: tickSettings.color,
                                    'stroke-width': 0.25 + (tickSettings.thickness / 133.33),
                                    x1: 0,
                                    x2: -yAxisWidth,
                                    y1: height,
                                    y2: height
                                })
                                .attr('transform', `translate(${Visual.margins.left}, 0)`);
                        }

                        for (i = 0; i < yTicksLen; i++) {
                            isBool = false;
                            let parent = yTicks[0][i].getAttribute('data-parent');
                            let yWidth = 0;
                            let xAttr = yTicks[0][i].parentNode.getAttribute('transform').substring(12, yTicks[0][i]
                                .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][i]
                                    .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][i]
                                        .parentNode.getAttribute('transform').length - 1);
                            for (j = i; j < yTicksLen; j++) {
                                let nextParent = yTicks[0][j].getAttribute('data-parent');
                                let xNextAttr = yTicks[0][j].parentNode.getAttribute('transform').substring(12, yTicks[0][j]
                                    .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][j]
                                        .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][j]
                                            .parentNode.getAttribute('transform').length - 1);
                                if (parent === nextParent) {
                                    isBool = true;
                                    yWidth += yScale.rangeBand();
                                    if (tickSettings.showAxisTicks) {
                                        this.yAxis.append('line')
                                            .classed('dotPlot_yAxisGridLines', true)
                                            .attr({
                                                stroke: tickSettings.color,
                                                'stroke-width': 0.25 + (tickSettings.thickness / 133.33),
                                                y1: -(yScale.rangeBand() / 2),
                                                y2: -(yScale.rangeBand() / 2),
                                                x1: 0,
                                                x2: -yAxisWidth,
                                                transform: `translate(0, ${xNextAttr})`
                                            });
                                    }
                                } else if (isBool) {
                                    xAttr = (parseFloat(xAttr) +
                                        parseFloat(yTicks[0][j - 1].parentNode.getAttribute('transform').substring(12, yTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][j - 1]
                                                    .parentNode.getAttribute('transform').length - 1))) / 2;
                                    i = j - 1;
                                    xNextAttr = yTicks[0][i].parentNode.getAttribute('transform').substring(12, yTicks[0][i]
                                        .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][i]
                                            .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][i]
                                                .parentNode.getAttribute('transform').length - 1);
                                    if (j < yTicksLen) {
                                        if (tickSettings.showCategoryTicks) {
                                            this.yParentAxis.append('line')
                                                .classed('dotPlot_yAxisGridLines', true)
                                                .attr({
                                                    stroke: tickSettings.categoryTickColor,
                                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                                    y1: -(yScale.rangeBand() / 2),
                                                    y2: -(yScale.rangeBand() / 2),
                                                    x1: 0,
                                                    x2: width - 2,
                                                    transform: `translate(0, ${xNextAttr})`
                                                });
                                        }
                                        if (gridLinesSetting.showCategoryGridLines) {
                                            this.svgGridLines.append('line')
                                                .classed('dotPlot_yAxisGridLines', true)
                                                .attr({
                                                    stroke: gridLinesSetting.categoryColor,
                                                    'stroke-width': 0.5 + (gridLinesSetting.categoryThickness / 100),
                                                    y1: -(yScale.rangeBand() / 2),
                                                    y2: -(yScale.rangeBand() / 2),
                                                    x1: 0,
                                                    x2: width - 2,
                                                    transform: `translate(0, ${xNextAttr})`
                                                });
                                        }
                                    }

                                    break;
                                } else {
                                    xNextAttr = yTicks[0][j - 1].parentNode.getAttribute('transform').substring(12, yTicks[0][j - 1]
                                        .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').length - 1);
                                    if (j < yTicksLen - 1) {
                                        this.yAxis.append('line')
                                            .classed('dotPlot_yAxisGridLines', true)
                                            .attr({
                                                stroke: 'rgb(166, 166, 166)',
                                                'stroke-width': 1,
                                                y1: -(yScale.rangeBand() / 2),
                                                y2: -(yScale.rangeBand() / 2),
                                                x1: 0,
                                                x2: width - 2,
                                                transform: `translate(0, ${xNextAttr})`
                                            });
                                    }
                                    break;
                                }

                            }
                            if (j === yTicksLen && isBool) {
                                xAttr = (parseFloat(xAttr) + parseFloat(yTicks[0][j - 1]
                                    .parentNode.getAttribute('transform').substring(12, yTicks[0][j - 1]
                                        .parentNode.getAttribute('transform').indexOf(',') > 12 ? yTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').indexOf(',') : yTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').length - 1))) / 2;
                                i = j - 1;
                            }

                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${parentAxisConfigs.fontSize}px`,
                                text: parent
                            };

                            this.yParentAxis
                                .append('g')
                                .attr('transform', `translate(0, ${xAttr})`)
                                .classed('dotPlot_yParentAxis', true)
                                .append('text')
                                .text(textMeasurementService.getTailoredTextOrDefault(textProperties, flipSetting.flipParentText ?
                                    1000 : yWidth))
                                .attr('x', flipSetting.flipParentText ? 5 : 0)
                                .attr('y', flipSetting.flipParentText ? -10 : 6)
                                .attr('transform', flipSetting.flipParentText ? 'rotate(0)' : 'rotate(-90)')
                                .attr('dy', '0.71em')
                                .style('text-anchor', flipSetting.flipParentText ? 'start' : 'middle')
                                .append('title')
                                .text(parent);

                            // Alternating bg color logic
                            if (backgroundSetting.show && Visual.xParentPresent && Visual.catGroupPresent) {
                                translate -= (yWidth);
                                this.svgGridLines.append('rect')
                                    .classed('dotPlot_xAxisGridRect', true)
                                    .attr({
                                        fill: iCounter % 2 === 0 ? backgroundSetting.bgPrimaryColor : backgroundSetting.bgSecondaryColor,
                                        x: 0,
                                        y: 0,
                                        width: width - 2 - (1 + (gridLinesSetting.categoryThickness / 100)) < 0 ?
                                            0 : width - 2 - (0.5 + (gridLinesSetting.categoryThickness / 100)), // 10,
                                        height: yWidth,
                                        'fill-opacity': (100 - backgroundSetting.bgTransparency) / 100
                                    })
                                    .attr('transform', `translate(0, ${translate})`);
                            }
                            iCounter++;
                        }
                    }

                    this.yParentAxisSvg.selectAll('.dotPlot_yParentAxis text')
                        .style('font-size', `${parentAxisConfigs.fontSize}px`)
                        .style('fill', parentAxisConfigs.fontColor);

                    this.yAxisSvg.selectAll('.dotPlot_yAxis .tick').append('title')
                        .text(function (d) {
                            return d.substring(d.indexOf('$$$') >= 0 ? d.indexOf('$$$') + 3 : 0, d.length);
                        });
                } else {
                    this.yAxisSvg.selectAll('.dotPlot_yAxis .tick text').text('');
                    this.yAxisSvg.selectAll('path').remove();
                }
                if (xAxisConfig.show) {
                    // Draw X Axis grid lines
                    let xTicks: any = this.xAxisSvg.selectAll('.dotPlot_xAxis .tick');
                    let tickLeng = xTicks.size();

                    let start = 0;
                    if (gridLinesSetting.showAxisGridLines) {
                        for (; start < tickLeng; start++) {
                            let xCoordinate = xTicks[0][start]
                                .getAttribute('transform')
                                .substring(10, xTicks[0][start]
                                    .getAttribute('transform')
                                    .indexOf(',') >= 0 ? xTicks[0][start]
                                        .getAttribute('transform')
                                        .indexOf(',') : xTicks[0][start]
                                            .getAttribute('transform').length - 1);
                            this.axisGridLines.append('line')
                                .classed('dotPlot_xAxisGrid', true).attr({
                                    stroke: gridLinesSetting.color,
                                    'stroke-width': 0.25 + (gridLinesSetting.thickness / 133.33),
                                    x1: xCoordinate,
                                    x2: xCoordinate,
                                    y1: (height),
                                    y2: 0
                                });
                        }
                    }

                    this.xAxis.selectAll('path')
                        .remove();

                    if (xAxisConfig.showTitle) {
                        let xTitleTextProps = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisConfig.titleText
                        };
                        this.xTitle
                            .classed('dotPlot_xTitle', true)
                            .attr('transform', `translate(${Visual.margins.left + (widthForXAxis / 2)}, ${Visual.margins.bottom - 5})`)
                            .append('text')
                            .attr('dy', '-0.32em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${xAxisConfig.titleSize}px`)
                            .style('fill', xAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(xTitleTextProps, widthForXAxis))
                            .append('title')
                            .text( xAxisConfig.titleText);
                    }

                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text')
                        .style('font-size', `${xAxisConfig.fontSize}px`)
                        .style('fill', xAxisConfig.fontColor)
                        .text(function (d) {
                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${xAxisConfig.fontSize}px`,
                                text: xAxisConfig.displayUnits === 0 ?
                                    dotPlotUtils.getValue(d, xAxisConfig, format) : xAxisFormatter.format(d)
                            };

                            return textMeasurementService
                                .getTailoredTextOrDefault(textProperties, ((width - Visual.margins.left) /
                                    axisHelper.getRecommendedNumberOfTicksForXAxis(width)) - 5);
                        });
                } else {
                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text').text('');
                    this.xAxis.selectAll('path').remove();
                }
                let circles = this.dotsContainer.selectAll('.dotPlot_dot').data(data.dataPoints);

                circles.enter()
                    .append('circle')
                    .classed('dotPlot_dot', true);

                circles.attr({
                    cx: d => xScale(d.value),
                    cy: d => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2,
                    r: d => rScale(d.categorySize),
                    stroke: '#FFF',
                    'stroke-width': 2,
                    'fill-opacity': (100 - rangeConfig.transparency) / 100
                });

                // Gradient logic
                if (!Visual.isGradientPresent) {
                    circles.attr({ fill: d => dotPlotUtils.getColor(d) });
                } else {
                    let minGradientValue = 9999999999999;
                    let maxGradientValue = 0;
                    this.categoryColorData.forEach(element => {
                        if (parseFloat(element) < minGradientValue) {
                            minGradientValue = element;
                        }
                        if (parseFloat(element) > maxGradientValue) {
                            maxGradientValue = element;
                        }
                    });
                    let colorScale = d3.scale.linear()
                        .domain([minGradientValue, maxGradientValue])
                        .range([0, 1]);
                    let colors = d3.interpolateRgb(gradientSelectorSetting.minColor, gradientSelectorSetting.maxColor);
                    circles.attr('fill', function (d) {
                        return colors(colorScale(parseFloat(d.categoryColor)));
                    });
                }

                circles.exit().remove();

            } else {
                let xAxisHeight = 0;
                Visual.margins.right = 0;
                Visual.margins.top = 0;

                this.scrollableContainer.style({ 'overflow-x': 'auto', 'overflow-y': 'hidden' });

                if (this.xAxisSvg) {
                    this.xAxisSvg.remove();
                }
                if (this.yAxisSvg) {
                    this.yAxisSvg.remove();
                }
                if (this.xParentAxisSvg) {
                    this.xParentAxisSvg.remove();
                }
                if (this.yParentAxisSvg) {
                    this.yParentAxisSvg.remove();
                }
                this.xAxisSvg = this.scrollableContainer.append('svg')
                    .classed('dotPlot_xAxisSvg', true);
                this.xAxis = this.xAxisSvg
                    .append('g')
                    .classed('dotPlot_xAxis', true);
                this.yAxisSvg = this.baseContainer.append('svg')
                    .classed('dotPlot_yAxisSvg', true);
                this.yAxis = this.yAxisSvg
                    .append('g')
                    .classed('dotPlot_yAxis', true);
                this.yTitle = this.yAxisSvg.append('g')
                    .classed('dotPlot_yAxis dotPlot_yTitle', true);
                this.xTitle = this.xAxisSvg.append('g')
                    .classed('dotPlot_xAxis dotPlot_xTitle', true);
                this.xParentAxisSvg = this.scrollableContainer.append('svg')
                    .classed('dotPlot_xParentAxisSvg', true);
                this.xParentAxis = this.xParentAxisSvg
                    .append('g')
                    .classed('dotPlot_xParentAxis', true);

                let measureTextHeight;
                let value = parseFloat(dotPlotUtils.returnMax(Visual.dataValues).toString());
                yAxisFormatter = valueFormatter.create({
                    format: format, precision: yAxisConfig.decimalPlaces, value: yAxisConfig.displayUnits
                });
                let formattedMaxMeasure = yAxisConfig.displayUnits === 0 ?
                    dotPlotUtils.getValue(value, yAxisConfig, format) : yAxisFormatter.format(value);
                let measureTextPropertiesForMeasure: TextProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${yAxisConfig.fontSize}px`,
                    text: formattedMaxMeasure
                };
                if (yAxisConfig.show) {
                    Visual.margins.left = 0;
                    let yTitleHeight = 0;
                    if (yAxisConfig.showTitle) {
                        let yTitleTextProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisConfig.titleText
                        };
                        yTitleHeight = textMeasurementService.measureSvgTextHeight(yTitleTextProperties);
                        Visual.margins.left = yTitleHeight + 10;
                    }
                    yAxisWidth = textMeasurementService.measureSvgTextWidth(measureTextPropertiesForMeasure) + 10;
                    Visual.margins.left += (yAxisWidth);
                } else {
                    Visual.margins.left = 2;
                }
                if (xAxisConfig.show) {
                    Visual.margins.bottom = 0;
                    let xTitleHeight = 0;
                    if (xAxisConfig.showTitle) {
                        let xTitleTextProperties: TextProperties = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisConfig.titleText
                        };
                        xTitleHeight = textMeasurementService.measureSvgTextHeight(xTitleTextProperties);
                        Visual.margins.bottom = xTitleHeight + 10;
                    }
                    let sample = '';
                    if (!Visual.catGroupPresent && Visual.xParentPresent) {
                        sample = data.dataPoints[0].xCategoryParent;
                    } else {
                        sample = data.dataPoints[0].categoryGroup;
                    }
                    let measureTextPropertiesForGroup: TextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${xAxisConfig.fontSize}px`,
                        text: sample
                    };
                    xAxisHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForGroup) + 5;
                    Visual.margins.bottom += xAxisHeight;

                    if (Visual.catGroupPresent && Visual.xParentPresent) {
                        measureTextPropertiesForGroup = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${parentAxisConfigs.fontSize}px`,
                            text: data.dataPoints[0].xCategoryParent
                        };
                        xAxisParentHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForGroup);
                        if (this.parentAxisConfigs.split) {
                            Visual.margins.top = xAxisParentHeight + 5;
                        } else {
                            Visual.margins.bottom += xAxisParentHeight + 5;
                            measureTextHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForMeasure);
                            Visual.margins.top = measureTextHeight / 2;
                        }
                    } else {
                        measureTextHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForMeasure);
                        Visual.margins.top = measureTextHeight / 2;
                    }
                } else {
                    measureTextHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForMeasure);
                    Visual.margins.top = measureTextHeight / 2;
                    Visual.margins.bottom = measureTextHeight / 2;
                    xAxisParentHeight = 0;
                }
                // Svg adjustment
                width = width - Visual.margins.left < 0 ? 0 : width - Visual.margins.left;
                height = (height - Visual.margins.bottom - Visual.margins.top) < 0 ?
                    0 : height - Visual.margins.bottom - Visual.margins.top;
                this.svg.attr('width', width);
                this.svg.attr('height', height);
                this.svg.style('margin-top', `${Visual.margins.top}px`);
                this.svg.style('margin-left', '0px');
                // Y Axis adjustment
                this.yAxisSvg.attr({
                    width: Visual.margins.left,
                    height: height + Visual.margins.bottom + Visual.margins.top
                });
                // X Axis adjustment
                this.xAxisSvg.attr({
                    width: width,
                    height: Visual.margins.bottom
                });
                this.xAxisSvg.style('margin-top', `${height + Visual.margins.top}px`);
                // X Axis parent adjustment
                if (this.parentAxisConfigs.split) {
                    this.xParentAxisSvg.attr({
                        width: width,
                        height: Visual.margins.top
                    });
                } else {
                    this.xParentAxisSvg.attr({
                        width: width,
                        height: xAxisParentHeight + 5
                    });
                    this.xParentAxisSvg.style('margin-top', `${height + xAxisHeight + Visual.margins.top}px`);
                }

                // Scales
                yScale = d3.scale.linear()
                    .domain([yAxisConfig.start, yAxisConfig.end])
                    .range([height, 0]);

                xScale = d3.scale.ordinal()
                    .domain(data.dataPoints.map(d => d.updatedXCategoryParent))
                    .rangeBands([0, width - 2]);

                rScale = d3.scale.linear()
                    .domain([dotPlotUtils.returnMin(dataSizeValues), (dotPlotUtils.returnMax(dataSizeValues))])
                    .range([rangeConfig.min, rangeConfig.max]);

                let widthForXAxis = width;
                let heightForXAxis = height;
                let textProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: this.catLongestText
                };
                let xAxisPoints = data.dataPoints.map(d => d.updatedXCategoryParent).filter(dotPlotUtils.getDistinctElements).length;
                // Scroll logic
                if ((xAxisConfig.minWidth * xAxisPoints) > (width)) {
                    width = (xAxisConfig.minWidth * xAxisPoints);
                    height = height - 20 < 0 ? 0 : height - 20;
                    xScale.rangeBands([0, width - 2]);
                    yScale.range([height, 0]);
                    this.svg.attr({
                        width: width,
                        height: height
                    });
                    this.xParentAxisSvg.attr({
                        width: width
                    });
                    if (!this.parentAxisConfigs.split) {
                        this.xParentAxisSvg.style('margin-top', `${height + xAxisHeight}px`);
                    }
                    this.xAxisSvg.style({
                        'margin-top': `${height + Visual.margins.top}px`
                    });
                    this.xAxisSvg.attr({
                        width: width,
                        height: Visual.margins.bottom
                    });
                }
                this.scrollableContainer.style('margin-left', `${Visual.margins.left}px`);
                this.scrollableContainer.style('width', `${widthForXAxis + 1}px`);
                this.scrollableContainer.style('height', `${heightForXAxis + Visual.margins.bottom + Visual.margins.top}px`);

                let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

                let yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(axisHelper.getRecommendedNumberOfTicksForYAxis(height - Visual.margins.bottom - Visual.margins.top))
                    .orient('left');

                if (yAxisConfig.show) {
                    yAxis.tickFormat(yAxisFormatter.format);
                    this.yAxis.attr('transform', `translate(${Visual.margins.left},${Visual.margins.top})`)
                        .call(yAxis);

                    this.yAxisSvg.selectAll('.dotPlot_yAxis text')
                        .style('font-size', `${yAxisConfig.fontSize}px`)
                        .style('fill', yAxisConfig.fontColor);

                    this.yAxisSvg.selectAll('.dotPlot_yAxis .tick').append('title')
                        .text((d) => {
                            return d;
                        });
                }

                this.xAxis.selectAll('.dotPlot_xAxisGridLines').remove();
                if (xAxisConfig.show) {
                    if (xAxisConfig.showTitle) {
                        let xTitleTextProps = {
                            fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisConfig.titleText
                        };
                        this.xTitle
                            .classed('dotPlot_xTitle', true)
                            .attr('transform', `translate(${widthForXAxis / 2},${Visual.margins.bottom - 5})`)
                            .append('text')
                            .attr('dy', '-0.32em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${xAxisConfig.titleSize}px`)
                            .style('fill', xAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(xTitleTextProps, widthForXAxis))
                            .append('title')
                            .text( xAxisConfig.titleText);
                    }

                    this.xAxis.call(xAxis);

                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text')
                        .style('font-size', `${xAxisConfig.fontSize}px`)
                        .style('fill', xAxisConfig.fontColor);

                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text')
                        .text(function (d) {
                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${xAxisConfig.fontSize}px`,
                                text: dotPlotUtils.getText(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, xScale.rangeBand());
                        })
                        .attr('data-parent', function (d) {
                            return d.substring(0, d.indexOf('$$$') >= 0 ? d.indexOf('$$$') : 0);
                        });

                    // For category Parent
                    if (!(!Visual.catGroupPresent && Visual.xParentPresent) || (!Visual.xParentPresent)) {
                        let xTicks: any = this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text');
                        let xTicksLen = xTicks.size();
                        let xParentTicks: string[] = [];
                        let isBool = false;
                        let iCounter = 0;
                        let j = 0, i = 0;
                        this.svgGridLines.append('line')
                            .classed('dotPlot_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 1,
                                x2: 1,
                                y1: 0,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width - 2,
                                x2: width - 2,
                                y1: 0,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 0,
                                x2: width - Visual.margins.right - 2,
                                y1: 0,
                                y2: 0
                            });

                        this.svgGridLines.append('line')
                            .classed('dotPlot_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 0,
                                x2: width - Visual.margins.right - 2,
                                y1: (height),
                                y2: (height)
                            });
                        if (tickSettings.showCategoryTicks && Visual.xParentPresent) {
                            this.xParentAxisSvg.append('line')
                                .classed('dotPlot_xAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: 1,
                                    x2: 1,
                                    y1: xAxisParentHeight + 5,
                                    y2: 0
                                });

                            this.xParentAxisSvg.append('line')
                                .classed('dotPlot_xAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: width - 2,
                                    x2: width - 2,
                                    y1: xAxisParentHeight + 5,
                                    y2: 0
                                });
                        }
                        if (tickSettings.showAxisTicks) {
                            this.xAxisSvg.append('line')
                                .classed('dotPlot_xAxisGridLines', true)
                                .attr({
                                    stroke: tickSettings.color,
                                    'stroke-width': 0.25 + (tickSettings.thickness / 133.33),
                                    x1: 1,
                                    x2: 1,
                                    y1: 0,
                                    y2: xAxisHeight
                                });
                        }
                        for (i = 0; i < xTicksLen; i++) {
                            isBool = false;
                            let parent = xTicks[0][i].getAttribute('data-parent');
                            let xWidth = 0;
                            let xAttr = xTicks[0][i].parentNode.getAttribute('transform').substring(10, xTicks[0][i]
                                .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][i]
                                    .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][i]
                                        .parentNode.getAttribute('transform').length - 1);
                            for (j = i; j < xTicksLen; j++) {
                                let nextParent = xTicks[0][j].getAttribute('data-parent');
                                let xNextAttr = xTicks[0][j].parentNode.getAttribute('transform').substring(10, xTicks[0][j]
                                    .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][j]
                                        .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][j]
                                            .parentNode.getAttribute('transform').length - 1);
                                if (parent === nextParent) {
                                    isBool = true;
                                    xWidth += xScale.rangeBand();
                                    if (tickSettings.showAxisTicks) {
                                        this.xAxis.append('line')
                                            .classed('dotPlot_xAxisGridLines', true)
                                            .attr({
                                                stroke: tickSettings.color,
                                                'stroke-width': 0.25 + (tickSettings.thickness / 133.33),
                                                x1: xScale.rangeBand() / 2,
                                                x2: xScale.rangeBand() / 2,
                                                y1: 0,
                                                y2: xAxisHeight,
                                                transform: `translate(${xNextAttr}, 0)`
                                            });
                                    }
                                } else if (isBool) {
                                    xAttr = (parseFloat(xAttr) + parseFloat(xTicks[0][j - 1]
                                        .parentNode.getAttribute('transform').substring(10, xTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][j - 1]
                                                    .parentNode.getAttribute('transform').length - 1))) / 2;
                                    i = j - 1;
                                    xNextAttr = xTicks[0][i]
                                        .parentNode.getAttribute('transform').substring(10, xTicks[0][i]
                                            .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][i]
                                                .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][i]
                                                    .parentNode.getAttribute('transform').length - 1);
                                    if (j < xTicksLen) {
                                        if (tickSettings.showCategoryTicks) {
                                            this.xParentAxis.append('line')
                                                .classed('dotPlot_xAxisGridLines', true)
                                                .attr({
                                                    stroke: tickSettings.categoryTickColor,
                                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                                    x1: xScale.rangeBand() / 2,
                                                    x2: xScale.rangeBand() / 2,
                                                    y1: 0,
                                                    y2: xAxisParentHeight + 5,
                                                    transform: `translate(${xNextAttr}, 0)`
                                                });
                                        }

                                        if (gridLinesSetting.showCategoryGridLines) {
                                            this.svgGridLines.append('line')
                                                .classed('dotPlot_xAxisGridLines', true)
                                                .attr({
                                                    stroke: gridLinesSetting.categoryColor,
                                                    'stroke-width': 0.5 + (gridLinesSetting.categoryThickness / 100),
                                                    x1: xScale.rangeBand() / 2,
                                                    x2: xScale.rangeBand() / 2,
                                                    y1: 0,
                                                    y2: height,
                                                    transform: `translate(${xNextAttr}, 0)`
                                                });
                                        }
                                    }
                                    break;
                                } else {
                                    xNextAttr = xTicks[0][j - 1]
                                        .parentNode.getAttribute('transform').substring(10, xTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][j - 1]
                                                    .parentNode.getAttribute('transform').length - 1);
                                    if (j < xTicksLen - 1) {
                                        this.xAxis.append('line')
                                            .classed('dotPlot_xAxisGridLines', true)
                                            .attr({
                                                stroke: 'rgb(166, 166, 166)',
                                                'stroke-width': 1,
                                                x1: xScale.rangeBand() / 2,
                                                x2: xScale.rangeBand() / 2,
                                                y1: 0,
                                                y2: height,
                                                transform: `translate(${xNextAttr}, 0)`
                                            });
                                    }
                                    break;
                                }

                            }
                            if (j === xTicksLen && isBool) {
                                xAttr = (parseFloat(xAttr) + parseFloat(xTicks[0][j - 1]
                                    .parentNode.getAttribute('transform').substring(10, xTicks[0][j - 1]
                                        .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][j - 1]
                                            .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][j - 1]
                                                .parentNode.getAttribute('transform').length - 1))) / 2;
                                i = j - 1;
                            }

                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${parentAxisConfigs.fontSize}px`,
                                text: parent
                            };

                            if (backgroundSetting.show && Visual.xParentPresent && Visual.catGroupPresent) {
                                this.svgGridLines.append('rect')
                                    .classed('dotPlot_xAxisGridRect', true)
                                    .attr({
                                        fill: iCounter % 2 === 0 ? backgroundSetting.bgPrimaryColor : backgroundSetting.bgSecondaryColor,
                                        x: 1,
                                        y: 1,
                                        width: gridLinesSetting.showCategoryGridLines ?
                                            (xWidth - (1 + (gridLinesSetting.categoryThickness / 100))) : xWidth,
                                        height: height,
                                        'fill-opacity': (100 - backgroundSetting.bgTransparency) / 100
                                    })
                                    .attr('transform', `translate(${translate}, 0)`);

                                translate += (xWidth);
                            }

                            this.xParentAxis
                                .append('g')
                                .attr('transform', `translate(${xAttr}, 0)`)
                                .classed('dotPlot_xParentAxis', true)
                                .append('text')
                                .text(textMeasurementService.getTailoredTextOrDefault(textProperties, xWidth))
                                .attr('x', 0)
                                .attr('y', 9)
                                .attr('dy', '0.71em')
                                .style('text-anchor', 'middle')
                                .append('title')
                                .text(parent);

                            iCounter++;
                        }
                    }

                    this.xParentAxisSvg.selectAll('.dotPlot_xParentAxis text')
                        .style('font-size', `${parentAxisConfigs.fontSize}px`)
                        .style('fill', parentAxisConfigs.fontColor);

                    this.xAxis.selectAll('path')
                        .remove();

                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick').append('title')
                        .text(function (d) {
                            return d.substring(d.indexOf('$$$') >= 0 ? d.indexOf('$$$') + 3 : 0, d.length);
                        });

                } else {
                    this.xAxisSvg.selectAll('.dotPlot_xAxis .tick text').text('');
                    this.xAxis.selectAll('path').remove();
                }

                if (yAxisConfig.show) {
                    // Draw Y Axis grid lines
                    let yTicks: any = this.yAxisSvg.selectAll('.dotPlot_yAxis .tick');
                    let tickLeng = yTicks.size();
                    let start = 0;
                    if (gridLinesSetting.showAxisGridLines) {
                        for (; start < tickLeng; start++) {
                            let yCoordinate = yTicks[0][start]
                                .getAttribute('transform')
                                .substring(12, yTicks[0][start]
                                    .getAttribute('transform').length - 1);
                            this.axisGridLines.append('line')
                                .classed('dotPlot_yAxisGrid', true).attr({
                                    stroke: gridLinesSetting.color,
                                    'stroke-width': 0.25 + (gridLinesSetting.thickness / 133.33),
                                    x1: 0,
                                    x2: width,
                                    y1: yCoordinate,
                                    y2: yCoordinate
                                });
                        }
                    }
                    let yTitleTextProps = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${yAxisConfig.titleSize}px`,
                        text: yAxisConfig.titleText
                    };
                    if (yAxisConfig.showTitle) {
                        this.yTitle
                            .classed('dotPlot_yTitle', true)
                            .attr('transform', `translate(10,${Visual.margins.top + (height / 2)})`)
                            .append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('dy', '0.71em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${yAxisConfig.titleSize}px`)
                            .style('fill', yAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(yTitleTextProps, height))
                            .append('title')
                            .text( yAxisConfig.titleText);
                    }

                    this.yAxisSvg.selectAll('.dotPlot_yAxis .tick text')
                        .text(function (d) {
                            textProperties = {
                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${yAxisConfig.fontSize}px`,
                                text: yAxisConfig.displayUnits === 0 ?
                                    dotPlotUtils.getValue(d, yAxisConfig, format) : yAxisFormatter.format(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, yAxisWidth + 1);
                        });
                    
                    this.yAxisSvg.selectAll('.dotPlot_yParentAxis .tick text')
                        .text(function (d) {
                            textProperties = {

                                fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                                fontSize: `${parentAxisConfigs.fontSize}px`,
                                text: d
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, yParentScale.rangeBand());
                        })
                        .attr('dy', '0.8em')
                        .attr('x', '0')
                        .attr('y', '0')
                        .style('text-anchor', 'middle')
                        .attr('transform', 'rotate(90)');

                    this.yAxis.selectAll('path').remove();
                } else {
                    this.yAxisSvg.selectAll('.dotPlot_yAxis .tick text').text('');
                    this.yAxis.selectAll('path').remove();
                }
                let circles = this.dotsContainer.selectAll('.dotPlot_dot').data(data.dataPoints);

                circles.enter()
                    .append('circle')
                    .classed('dotPlot_dot', true);

                circles.attr({
                    cx: d => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                    cy: d => yScale(d.value),
                    r: d => rScale(d.categorySize),
                    stroke: '#FFF',
                    'stroke-width': 2,
                    'fill-opacity': (100 - rangeConfig.transparency) / 100
                });

                // Gradient logic
                if (!Visual.isGradientPresent) {
                    circles.attr({ fill: d => dotPlotUtils.getColor(d) });
                } else {
                    let minGradientValue = 9999999999999;
                    let maxGradientValue = 0;
                    this.categoryColorData.forEach(element => {
                        if (parseFloat(element) < minGradientValue) {
                            minGradientValue = element;
                        }
                        if (parseFloat(element) > maxGradientValue) {
                            maxGradientValue = element;
                        }
                    });
                    let colorScale = d3.scale.linear()
                        .domain([minGradientValue, maxGradientValue])
                        .range([0, 1]);
                    let colors = d3.interpolateRgb(gradientSelectorSetting.minColor, gradientSelectorSetting.maxColor);
                    circles.attr('fill', function (d) {
                        return colors(colorScale(parseFloat(d.categoryColor)));
                    });
                }

            }
            visualContext.clickFlag = false;

            // Highlighting logic
            if (this.highlight) {
                visualContext.clickFlag = true;

                d3.selectAll('.dotPlot_dot').attr('fill-opacity', function (d) {
                    if (d.highlights) {
                        return 0.9;
                    } else {
                        return 0.15;
                    }
                });
            }

            // Hover logic
            $('.dotPlot_dot').mousemove(
                function () {
                    if (!visualContext.clickFlag) {
                        $('.dotPlot_dot')
                            .attr({
                                'fill-opacity': 0.15,
                                stroke: '',
                                'stroke-width': 0
                            });
                        $(this)
                            .attr({
                                'fill-opacity': 0.9,
                                stroke: rangeConfig.borderColor,
                                'stroke-width': '2px'
                            });
                    }
                });
            $('.dotPlot_dot').mouseout(
                function () {
                    if (!visualContext.clickFlag) {
                        $('.dotPlot_dot')
                            .attr({
                                stroke: '#FFF',
                                'stroke-width': 2,
                                'fill-opacity': (100 - rangeConfig.transparency) / 100
                            });
                    }
                });
            // Cross filtering
            d3.selectAll('.dotPlot_dot').on('click', function (d) {
                visualContext.selectionManager.select(d.selectionId, true).then((ids: ISelectionId[]) => {
                    d3.selectAll('.dotPlot_dot').attr('fill-opacity', function (e) {
                        if (ids.length && ids.indexOf(e.selectionId) === -1 && visualContext.color.indexOf(e.categoryColor) === -1) {
                            return 0.15;
                        } else {
                            return 0.9;
                        }
                    });

                    if (ids.length) {
                        visualContext.clickFlag = true;
                    } else {
                        visualContext
                            .svg.selectAll('.dotPlot_dot')
                            .attr({ stroke: '#FFF', 'stroke-width': 2, 'fill-opacity': (100 - rangeConfig.transparency) / 100 });
                        visualContext.clickFlag = false;
                    }

                    d3.selectAll('.legendItem').attr('fill-opacity', function (legend) {
                        if (legend && legend.tooltip && visualContext.color.length && visualContext.color.indexOf(legend.tooltip) === -1) {
                            return 0.15;
                        } else {
                            return 1;
                        }
                    });
                });
                (<Event>d3.event).stopPropagation();
            });

            $('#legendGroup').on('click.load', '.navArrow', function () {
                visualContext.addLegendSelection();
            });
            visualContext.addLegendSelection();

            // Document click
            $(document)
                .on('click', () => this.selectionManager.clear()
                    .then(() => this.clickFlag = false)
                    .then(() => this.svg.selectAll('.dotPlot_dot')
                        .attr({ stroke: '#FFF', 'stroke-width': 2, 'fill-opacity': (100 - rangeConfig.transparency) / 100 }))
                    .then(() => d3.selectAll('.legendItem').attr({ 'fill-opacity': 1 }))
                    .then(() => visualContext.color = []));

            // Adding tooltips
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.dotPlot_dot'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );
        }

        public addLegendSelection() {
            let visualContext = this;
            let legends = d3.selectAll('.legendItem');
            let selectionManager = this.selectionManager;
            legends.on('click', function (d) {
                let index = visualContext.color.indexOf(d.tooltip.toString());
                if (index === -1) {
                    visualContext.color.push(d.tooltip.toString());
                } else {
                    visualContext.color.splice(index, 1);
                }
                visualContext.selectionManager.select(d.identity, true).then((ids: any[]) => {
                    d3.selectAll('.dotPlot_dot').attr('fill-opacity', function (dot) {
                        if (ids.length && (visualContext.color.indexOf(dot.categoryColor) === -1 && ids.indexOf(dot.selectionId) === -1)) {
                            return 0.15;
                        } else {
                            return 0.9;
                        }
                    });
                    legends.attr('fill-opacity', function (legend) {
                        if (legend && legend.tooltip &&
                            visualContext.color &&
                            visualContext.color.length &&
                            visualContext.color.indexOf(legend.tooltip.toString()) === -1) {
                            return 0.15;
                        } else {
                            return 1;
                        }
                    });

                    if (ids.length) {
                        visualContext.clickFlag = true;
                    } else {
                        visualContext.svg.selectAll('.dotPlot_dot')
                            .attr({ stroke: '#FFF', 'stroke-width': 2,
                                'fill-opacity': (100 - visualContext.rangeConfig.transparency) / 100 });
                        visualContext.clickFlag = false;
                    }
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        public renderLegend(dataViews: DataView, legendConfig: LegendConfig, isScrollPresent: boolean): void {
            if (!Visual.legendDataPoints && Visual.legendDataPoints.length) { return; }
            let sTitle = '';
            let legendObjectProperties;
            if (dataViews && dataViews.metadata) {
                legendObjectProperties = powerbi
                    .extensibility
                    .utils
                    .dataview
                    .DataViewObjects
                    .getObject(dataViews.metadata.objects, 'legend', {});
            }

            let legendData: any = Visual.legendDataPoints;
            let legendDataTorender: utils.chart.legend.LegendData = {
                dataPoints: [],
                fontSize: legendConfig.fontSize,
                labelColor: legendConfig.labelColor,
                title: Visual.legendTitle
            };

            for (let iCounter of legendData) {
                legendDataTorender.dataPoints.push({
                    color: iCounter.color,
                    icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                    identity: iCounter.identity,
                    label: iCounter.category,
                    selected: iCounter.selected
                });
            }
            if (legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, legendObjectProperties);
                let position: string = <string>legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                if (position) { Visual.legend.changeOrientation(powerbi.extensibility.utils.chart.legend.LegendPosition[position]); }

            }

            let legendOrient = Visual.legend.getOrientation();
            let legendViewport: IViewport = _.clone(this.viewport);
            switch (legendOrient) {
                case 0:
                case 1:
                    if (!isScrollPresent) {
                        legendViewport.width = legendViewport.width / 2;
                    }
                    break;
                case 2:
                case 3:
                    if (!isScrollPresent) {
                        legendViewport.height = legendViewport.height / 2;
                    }
                    break;
                default:
                    break;
            }
            Visual.legend.drawLegend(legendDataTorender, ({ width: legendViewport.width, height: legendViewport.height }));
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.baseContainer, Visual.legend);
            if (this.baseContainer.style('margin-top')) {
                let value = parseFloat(this.baseContainer.style('margin-top').substr(0, this.baseContainer.style('margin-top').length - 2));
                this.baseContainer.style('margin-top', `${value + 2}px`);
            }
        }

        public renderSizeLegend(
            sizeLegendHeight,
            legendOrient,
            isScrollPresent,
            dataSizeValues,
            legendSetting,
            sizeLegendWidth,
            options): void {
            let sizeLegendTitleText = this.legendDotTitle ? this.legendDotTitle : '';
            let measureTextProperties = {
                fontFamily: 'helvetica, arial, sans-serif',
                fontSize: `${legendSetting.fontSize}pt`,
                text: sizeLegendTitleText
            };

            let legendCircles = this.legendDotSvg
                .append('g')
                .classed('dotPlot_categorySize', true);

            if (legendOrient === 0 || legendOrient === 1) {
                let sizeArray = [{
                    cX: 0,
                    r: 0
                }];
                let cX = 0 + 10;
                let radius = 0;
                for (let iCounter = 0; iCounter < 6; iCounter++) {
                    radius = 2 + (iCounter * (Number(sizeLegendHeight) / 30)); // 2 was taken to have minimum circle visible
                    cX = cX + (radius * 2) + 5 + iCounter * 1; // 5 is distance between circles
                    let obj = {
                        cX: cX,
                        r: radius
                    };
                    sizeArray.push(obj);
                }
                for (let iCounter = 1; iCounter < sizeArray.length; iCounter++) {
                    legendCircles.append('circle')
                        .classed('dotPlot_legendDot', true)
                        .attr({
                            cx: sizeArray[iCounter].cX,
                            cy: radius + Number(sizeLegendHeight) / 7,
                            fill: legendSetting.sizeLegendColor,
                            r: sizeArray[iCounter].r
                        });
                }
                let legendDotData = [];
                let legendFormatter = valueFormatter.create({
                    format: this.sizeFormat,
                    value: legendSetting.displayUnits === 0 ? dotPlotUtils.returnMax(dataSizeValues, true) : legendSetting.displayUnits,
                    precision: legendSetting.decimalPlaces
                });
                // Push minimum and maximum category size values in this array
                legendDotData.push(dotPlotUtils.returnMin(dataSizeValues, true));
                legendDotData.push(dotPlotUtils.returnMax(dataSizeValues, true));

                for (let iCount = 0; iCount < 2; iCount++) {
                    let x = 0, y = 0;
                    if (iCount === 0) {
                        x = sizeArray[1].cX;
                    } else {
                        x = sizeArray[sizeArray.length - 1].cX;
                    }
                    y = (radius * 2) + Number(sizeLegendHeight) / 2;
                    let textProperties: TextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${sizeLegendHeight / 2.5}px`,
                        text: legendFormatter.format(legendDotData[iCount])
                    };
                    legendCircles.append('text')
                        .classed('dotPlot_legendDotText', true)
                        .attr({
                            fill: legendSetting.labelColor,
                            x: x,
                            y: y
                        })
                        .style({
                            color: legendSetting.labelColor,
                            'font-size': `${sizeLegendHeight / 2.5}px`,
                            'text-anchor': 'middle'
                        }).text(textMeasurementService.getTailoredTextOrDefault(textProperties, 40))
                        .append('title')
                        .text(legendDotData[iCount]);
                }
                let totalWidth = sizeArray[sizeArray.length - 1].cX - sizeArray[0].cX + 10;

                // Size legend title
                let sizeLegendTitleUpdatedText = textMeasurementService
                    .getTailoredTextOrDefault(
                    measureTextProperties,
                    (isScrollPresent ? options.viewport.width : options.viewport.width / 2) - totalWidth - 20
                    );

                measureTextProperties = {
                    fontFamily: 'helvetica, arial, sans-serif',
                    fontSize: `${legendSetting.fontSize}pt`,
                    text: sizeLegendTitleUpdatedText
                };

                let sizeLegendTitleWidth = textMeasurementService.measureSvgTextWidth(measureTextProperties);

                let legendDotText = this.legendDotSvg
                    .append('g')
                    .classed('dotPlot_legendCategory', true)
                    .append('text')
                    .text(sizeLegendTitleUpdatedText)
                    .style({
                        'font-color': legendSetting.labelColor,
                        'font-size': `${legendSetting.fontSize}pt`,
                        'font-family': 'helvetica, arial, sans-serif'
                    });
                legendDotText.attr({
                    fill: legendSetting.labelColor,
                    x: 2,
                    y: 9 + parseFloat(this.legendSetting.fontSize.toString())
                })
                    .append('title')
                    .text(sizeLegendTitleText);
                if (!isScrollPresent) {
                    legendDotText
                        .attr('transform', `translate(${(isScrollPresent ?
                            options.viewport.width : options.viewport.width / 2) - totalWidth - 20 - sizeLegendTitleWidth}, 0)`);
                    legendCircles
                        .attr('transform', `translate(${(isScrollPresent ?
                            options.viewport.width : options.viewport.width / 2) - totalWidth - 10},0)`);
                } else {
                    legendCircles
                        .attr('transform', `translate(${sizeLegendTitleWidth},0)`);
                }
            } else if ((legendOrient === 2 || legendOrient === 3) && !isScrollPresent) {
                let sizeArray = [{
                    cY: 0,
                    r: 0
                }];
                let cY = 25;
                let radius = 0;
                for (let iCounter = 0; iCounter < 6; iCounter++) {
                    radius = 2 + (iCounter * (Number(sizeLegendWidth) / 80)); // 3 was taken to have minimum circle visible
                    cY = cY + (radius * 2) + 3 + iCounter * 1; // 5 is distance between circles
                    let obj = {
                        cY: cY,
                        r: radius
                    };
                    sizeArray.push(obj);
                }
                for (let iCounter = 1; iCounter < sizeArray.length; iCounter++) {
                    legendCircles.append('circle')
                        .classed('dotPlot_legendDot', true)
                        .attr({
                            cx: radius + Number(sizeLegendWidth) / 7,
                            cy: sizeArray[iCounter].cY,
                            fill: legendSetting.sizeLegendColor,
                            r: sizeArray[iCounter].r
                        });
                }
                let legendDotData = [];
                let legendFormatter = valueFormatter.create({
                    format: this.sizeFormat,
                    value: legendSetting.displayUnits === 0 ? dotPlotUtils.returnMax(dataSizeValues, true) : legendSetting.displayUnits,
                    precision: legendSetting.decimalPlaces
                });
                // Push minimum and maximum category size values in this array
                legendDotData.push(dotPlotUtils.returnMin(dataSizeValues, true));
                legendDotData.push(dotPlotUtils.returnMax(dataSizeValues, true));

                for (let iCount = 0; iCount < 2; iCount++) {
                    let x = 0, y = 0;
                    if (iCount === 0) {
                        y = sizeArray[1].cY + 5;
                    } else {
                        y = sizeArray[sizeArray.length - 1].cY + 5;
                    }
                    x = (radius) + Number(sizeLegendWidth) / 2;
                    let textProperties: TextProperties = {
                        fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                        fontSize: `${sizeLegendWidth / 6}px`,
                        text: legendFormatter.format(legendDotData[iCount])
                    };
                    legendCircles.append('text')
                        .classed('dotPlot_legendDotText', true)
                        .attr({
                            fill: legendSetting.labelColor,
                            x: x,
                            y: y
                        })
                        .style({
                            color: legendSetting.labelColor,
                            'font-size': `${sizeLegendWidth / 8}px`,
                            'text-anchor': 'middle'
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(textProperties, ((radius) + Number(sizeLegendWidth) / 2)))
                        .append('title')
                        .text(legendDotData[iCount]);
                }
                let totalHeight = sizeArray[sizeArray.length - 1].cY - sizeArray[0].cY + 10;
                legendCircles.attr('transform', `translate(0, ${options.viewport.height / 2 - totalHeight})`);

                // Size legend title
                let sizeLegendTitleUpdatedText = textMeasurementService
                    .getTailoredTextOrDefault(measureTextProperties, parseFloat(d3.select('.legend').style('width')));

                measureTextProperties = {
                    fontFamily: 'helvetica, arial, sans-serif',
                    fontSize: `${legendSetting.fontSize}pt`,
                    text: sizeLegendTitleUpdatedText
                };

                let sizeLegendTitleHeight = textMeasurementService.measureSvgTextHeight(measureTextProperties);

                let legendDotText = this.legendDotSvg
                    .append('g')
                    .classed('dotPlot_legendCategory', true)
                    .append('text')
                    .text(sizeLegendTitleUpdatedText)
                    .style({
                        'font-color': legendSetting.labelColor,
                        'font-size': `${legendSetting.fontSize}pt`,
                        'font-family': 'helvetica, arial, sans-serif'
                    });

                legendDotText.attr({
                    fill: legendSetting.labelColor,
                    x: 2,
                    y: 0
                })
                    .append('title')
                    .text(sizeLegendTitleText);

                legendDotText
                    .attr('transform', `translate(5,${(options.viewport.height / 2) - totalHeight - sizeLegendTitleHeight + 20})`);
            }
        }

        public getTooltipData(value: any): VisualTooltipDataItem[] {

            let tooltipDataPoints: VisualTooltipDataItem[] = [];
            for (let iCounter of value.tooltipData) {
                let tooltipData: VisualTooltipDataItem = {
                    displayName: '',
                    value: ''
                };
                tooltipData.displayName = iCounter.name;
                tooltipData.value = iCounter.value;
                tooltipDataPoints.push(tooltipData);
            }

            return tooltipDataPoints;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            let parentAxisConfigs: ParentAxisSettings = this.parentAxisConfigs;
            let flipSetting: FlipSettings = this.flipSetting;
            let yAxisConfigs: AxisSettings = this.yAxisConfig;
            let xAxisConfigs: AxisSettings = this.xAxisConfig;
            let rangeSetting: RangeSettings = this.rangeConfig;
            let legendConfig: LegendConfig = this.legendSetting;
            let gradientSelectorSetting: GradientSelectorSettings = this.gradientSetting;
            let backgroundSetting: BackgroundSettings = this.backgroundSetting;
            let gridLinesSetting: GridLinesSettings = this.gridLinesSetting;
            let tickSetting: TickSettings = this.tickSetting;

            switch (objectName) {
                case 'parentAxis':
                    enumSettings.enumerateParentAxis(parentAxisConfigs, objectEnumeration, objectName);
                    break;

                case 'backgroundBanding':
                    enumSettings.enumerateBackgroundBanding(backgroundSetting, objectEnumeration, objectName, xAxisConfigs);
                    break;
                case 'gridLines':
                    enumSettings.enumerateGridLines(gridLinesSetting, objectEnumeration, objectName, xAxisConfigs);
                    break;
                case 'tickMarks':
                    enumSettings.enumerateTickMarks(tickSetting, objectEnumeration, objectName);
                    break;
                case 'yAxis':
                    enumSettings.enumerateYAxis(yAxisConfigs, objectEnumeration, objectName, flipSetting);
                    break;
                case 'xAxis':
                    enumSettings.enumerateXAxis(xAxisConfigs, objectEnumeration, objectName, flipSetting);
                    break;
                case 'legend':
                    enumSettings.enumerateLegend(legendConfig, objectEnumeration, objectName);
                    break;
                case 'colorSelector':
                    enumSettings.enumerateColorSelector(objectEnumeration, objectName);
                    break;
                case 'gradientSelector':
                    enumSettings.enumerateGradientSelector(gradientSelectorSetting, objectEnumeration, objectName);
                    break;
                case 'RangeSelector':
                    enumSettings.enumerateRangeSelector(rangeSetting, objectEnumeration, objectName);
                    break;
                case 'flip':
                    enumSettings.enumerateFlip(flipSetting, objectEnumeration, objectName);
                    break;
                default:
            }

            return objectEnumeration;
        }
    }
}
