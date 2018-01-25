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
        public static margins: {
            bottom: number;
            left: number;
            right: number;
            top: number;
        } = {
            bottom: 30,
            left: 40,
            right: 0,
            top: 0
        };
        public static isGradientPresent: boolean;
        public static isColorCategoryPresent: boolean;
        public static legendDataPoints: ILegendDataPoint[];
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
        private data: IBoxWhiskerDataPoints;
        private boxArray: IBoxDataPoints[];
        private dataView: DataView;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private legendDotTitle: string;
        private interactivityService: IInteractivityService;
        private measureFormat: string;
        private sizeFormat: string;
        // tslint:disable-next-line:no-any
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
        private flipSetting: IFlipSettings;
        private yAxisConfig: IAxisSettings;
        private xAxisConfig: IAxisSettings;
        private rangeConfig: IRangeSettings;
        private legendSetting: ILegendConfig;
        private parentAxisConfigs: IParentAxisSettings;
        private gradientSetting: IGradientSelectorSettings;
        private backgroundSetting: IBackgroundSettings;
        private gridLinesSetting: IGridLinesSettings;
        private tickSetting: ITickSettings;
        private boxOptionsSetting: IBoxOptionsSettings;
        private meanSetting: IMeanSettings;
        private sortSetting: ISortSettings;
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
                .classed('boxWhisker_baseContainer', true);

            this.scrollableContainer = this.baseContainer
                .append('div')
                .classed('boxWhisker_scrollableContainer', true);

            this.svg = this.scrollableContainer
                .append('svg')
                .classed('boxWhisker_dotChart', true);

            this.bgParentAxis = this.svg
                .append('g')
                .classed('boxWhisker_bgParentAxis', true);

            this.svgGridLines = this.svg
                .append('g')
                .classed('boxWhisker_svgGridLines', true);

            this.axisGridLines = this.svg
                .append('g')
                .classed('boxWhisker_axisGridLines', true);

            this.dotsContainer = this.svg.append('g')
                .classed('boxWhisker_dotsContainer', true);

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
            host: IVisualHost): IBoxWhiskerDataPoints {
            const boxWhiskerdataPoints: IBoxWhiskerDataPoints = {
                dataPoints: [],
                xTitleText: '',
                yTitleText: ''
            };
            let dataPoint: IBoxWhiskerViewModel;
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
            let xParentIndex: number = 0;
            let yParentIndex: number = 0;
            let catMaxLen: number = 0;
            let currentCat: string = '';
            let xParentMaxLen: number = 0;
            let currentXParent: string = '';
            const groups: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();
            let i: number;

            groups.forEach((group: DataViewValueColumnGroup) => {
                for (i = 0; i < group.values[0].values.length; i++) {
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
                            highlights: null,
                            key: null
                        };

                        const selectionId: visuals.ISelectionId = host.createSelectionIdBuilder()
                            .withCategory(dataView.categorical.categories[0], i)
                            .withSeries(dataView.categorical.values, group)
                            .createSelectionId();

                        for (let k: number = 0; k < group.values.length; k++) {
                            if (group.values[k].source.roles.hasOwnProperty('measure')) {
                                yParentIndex = k;
                                boxWhiskerdataPoints.yTitleText = group.values[k].source.displayName;
                                dataPoint.value = (Number(group.values[k].values[i]));
                                dataPoint.highlights = group.values[k].highlights ? group.values[k].highlights[i] : null;
                                this.measureFormat = group.values[k].source.format;
                            }
                            if (group.values[k].source.roles.hasOwnProperty('categorySize')) {
                                this.legendDotTitle = group.values[k].source.displayName;
                                Visual.catSizePresent = true;
                                this.sizeFormat = group.values[k].source.format;
                                dataPoint.categorySize = (Number(group.values[k].values[i]));
                            }

                            if (group.values[k].source.roles.hasOwnProperty('categoryColor')) {
                                Visual.isGradientPresent = true;
                                dataPoint.categoryColor = boxWhiskerUtils.convertToString(group.values[k].values[i]);
                                this.categoryColorData.push(group.values[k].values[i]);
                            }
                            const formatter0: utils.formatting.IValueFormatter = valueFormatter.create({
                                format: group.values[k].source.format
                            });
                            const tooltipDataPoint: ITooltipDataPoints = {
                                name: group.values[k].source.displayName,
                                value: formatter0.format(parseFloat(boxWhiskerUtils.convertToString(group.values[k].values[i])))
                            };
                            dataPoint.tooltipData.push(tooltipDataPoint);
                        }

                        this.highlight = dataView.categorical.values[0].highlights ? true : false;
                        for (let cat1: number = 0; cat1 < dataView.categorical.categories.length; cat1++) {
                            const formatter1: utils.formatting.IValueFormatter = valueFormatter.create({
                                format: dataView.categorical.categories[cat1].source.format
                            });
                            if (dataView.categorical.categories[cat1].source.roles.hasOwnProperty('category')) {
                                dataPoint.category = formatter1.format(dataView.categorical.categories[cat1].values[i]);
                            }
                            if (dataView.categorical.categories[cat1].source.roles.hasOwnProperty('categoryGroup')) {
                                boxWhiskerdataPoints.xTitleText = dataView.categorical.categories[cat1].source.displayName;
                                dataPoint.categoryGroup = formatter1.format(dataView.categorical.categories[cat1].values[i]);
                                Visual.catGroupPresent = true;
                            }
                            if (dataView.categorical.categories[cat1].source.roles.hasOwnProperty('xCategoryParent')) {
                                xParentIndex = cat1;
                                dataPoint.xCategoryParent = formatter1.format(dataView.categorical.categories[cat1].values[i]);
                                Visual.xParentPresent = true;
                            }
                            const tooltipDataPoint: ITooltipDataPoints = {
                                name: dataView.categorical.categories[cat1].source.displayName,
                                value: formatter1.format(dataView.categorical.categories[cat1].values[i])
                            };

                            if (JSON.stringify(dataPoint.tooltipData).indexOf(JSON.stringify(tooltipDataPoint)) < 0) {
                                dataPoint.tooltipData.push(tooltipDataPoint);
                            }
                        }

                        for (const k of dataView.metadata.columns) {
                            if (k.roles.hasOwnProperty('categoryColor') && !Visual.isGradientPresent) {
                                dataPoint.categoryColor = boxWhiskerUtils.convertToString(group.name);
                                Visual.legendTitle = k.displayName;
                                Visual.isColorCategoryPresent = true;
                                const tooltipDataPoint: ITooltipDataPoints = {
                                    name: k.displayName,
                                    value: boxWhiskerUtils.convertToString(group.name)
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
                        boxWhiskerdataPoints.dataPoints.push(dataPoint);
                    }
                }
            });

            for (const iPoints of boxWhiskerdataPoints.dataPoints) {
                iPoints.updatedXCategoryParent = `${iPoints.xCategoryParent}$$$${iPoints.categoryGroup}`;
            }

            if (!Visual.catGroupPresent && Visual.xParentPresent) {
                boxWhiskerdataPoints.xTitleText = dataView.categorical.categories[xParentIndex].source.displayName;
                boxWhiskerdataPoints.yTitleText = dataView.categorical.values[yParentIndex].source.displayName;
            }

            // Creating colors
            Visual.legendDataPoints = [];
            const colorPalette: IColorPalette = host.colorPalette;
            const grouped: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();

            if (Visual.isColorCategoryPresent) {
                Visual.legendDataPoints = grouped.map((group: DataViewValueColumnGroup, index: number) => {
                    const defaultColor: Fill = {
                        solid: {
                            color: colorPalette.getColor(group.identity.key).value
                        }
                    };

                    return {
                        category: boxWhiskerUtils.convertToString(group.name),
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
            // Sorting functionality
            const catElements: string[] = [];
            const catParentElements: string[] = [];
            let catDistinctElements: string[];
            let catDistinctParentElements: string[];
            let concatenatedCat: string[] = [];
            let formatter: utils.formatting.IValueFormatter;

            for (const cat1 of dataView.categorical.categories) {
                if (cat1.source.roles.hasOwnProperty('categoryGroup')) {
                    formatter = valueFormatter.create({ format: cat1.source.format });
                    // tslint:disable-next-line:no-any
                    cat1.values.forEach((element: any) => {
                        catElements.push(formatter.format(element));
                    });
                    catDistinctElements = catElements.filter(boxWhiskerUtils.getDistinctElements);
                    if (this.sortSetting.axis === 'desc') {
                        catDistinctElements.reverse();
                    }
                }
                if (cat1.source.roles.hasOwnProperty('xCategoryParent')) {
                    formatter = valueFormatter.create({ format: cat1.source.format });
                    // tslint:disable-next-line:no-any
                    cat1.values.forEach((element: any) => {
                        catParentElements.push(formatter.format(element));
                    });
                    catDistinctParentElements = catParentElements.filter(boxWhiskerUtils.getDistinctElements);
                    if (this.sortSetting.parent === 'desc') {
                        catDistinctParentElements.reverse();
                    }
                }
            }

            if (Visual.xParentPresent && Visual.catGroupPresent) {
                for (let iCounter: number = 0; iCounter < catParentElements.length; iCounter++) {
                    concatenatedCat.push(`${catParentElements[iCounter]}$$$${catElements[iCounter]}`);
                }
                concatenatedCat = concatenatedCat.filter(boxWhiskerUtils.getDistinctElements);
                if (this.sortSetting.axis === 'desc' && this.sortSetting.parent === 'desc') {
                    concatenatedCat.reverse();
                } else if (this.sortSetting.parent === 'desc') {
                    const reversedParents: string[] = catDistinctParentElements; // already reversed catDistinctParentElements
                    concatenatedCat = [];
                    for (let iCounter: number = 0; iCounter < reversedParents.length; iCounter++) {
                        for (let jCounter: number = 0; jCounter < catParentElements.length; jCounter++) {
                            if (reversedParents[iCounter] === catParentElements[jCounter]) {
                                concatenatedCat.push(`${catParentElements[jCounter]}$$$${catElements[jCounter]}`);
                            }
                        }
                    }
                    concatenatedCat = concatenatedCat.filter(boxWhiskerUtils.getDistinctElements);
                } else if (this.sortSetting.axis === 'desc') {
                    concatenatedCat = [];
                    const newArray: string[] = [];
                    for (let iCounter: number = 0; iCounter < catDistinctParentElements.length; iCounter++) {
                        for (let jCounter: number = catParentElements.length - 1; jCounter >= 0; jCounter--) {
                            if (catDistinctParentElements[iCounter] === catParentElements[jCounter]) {
                                concatenatedCat.push(`${catParentElements[jCounter]}$$$${catElements[jCounter]}`);
                            }
                        }
                    }
                }
            }

            this.boxArray = [];

            // initializing values and adding datapoints for a single box when only category is present
            if (boxWhiskerdataPoints.dataPoints.length > 0 && !Visual.xParentPresent && !Visual.catGroupPresent) {
                this.boxArray[0] = {
                    dataPoints: [],
                    mean: 0,
                    IQR: 0,
                    Q1: 0,
                    Q2: 0,
                    Q3: 0,
                    updatedXCategoryParent: null,
                    min: 0,
                    max: 0,
                    tooltipData: []
                };
                for (const item of boxWhiskerdataPoints.dataPoints) {
                    this.boxArray[0].dataPoints.push(item.value);
                    this.boxArray[0].updatedXCategoryParent = item.updatedXCategoryParent;
                }

              // initializing values and adding datapoints for boxes when category, categoryGroup and xCategoryParent are present
            } else if (Visual.xParentPresent && Visual.catGroupPresent) {
                for (i = 0; i < concatenatedCat.length; i++) {
                    this.boxArray[i] = {
                        dataPoints: [],
                        mean: 0,
                        IQR: 0,
                        Q1: 0,
                        Q2: 0,
                        Q3: 0,
                        updatedXCategoryParent: null,
                        min: 0,
                        max: 0,
                        tooltipData: []
                    };
                }
                for (const item of boxWhiskerdataPoints.dataPoints) {
                    item.key = concatenatedCat.indexOf(item.updatedXCategoryParent) + 1;
                    this.boxArray[item.key - 1].dataPoints.push(item.value);
                    this.boxArray[item.key - 1].updatedXCategoryParent = item.updatedXCategoryParent;
                }

              // initializing values and adding datapoints for boxes when category and xCategoryParent are present
            } else if (Visual.xParentPresent && !Visual.catGroupPresent) {
                for (i = 0; i < catDistinctParentElements.length; i++) {
                    this.boxArray[i] = {
                        dataPoints: [],
                        mean: 0,
                        IQR: 0,
                        Q1: 0,
                        Q2: 0,
                        Q3: 0,
                        updatedXCategoryParent: null,
                        min: 0,
                        max: 0,
                        tooltipData: []
                    };
                }
                for (const item of boxWhiskerdataPoints.dataPoints) {
                    item.key = catDistinctParentElements.indexOf(item.xCategoryParent) + 1;
                    this.boxArray[item.key - 1].dataPoints.push(item.value);
                    this.boxArray[item.key - 1].updatedXCategoryParent = item.updatedXCategoryParent;
                }

              // initializing values and adding datapoints for boxes when category, categoryGroup and xCategory parent are present
            } else if (Visual.catGroupPresent) {
                for (i = 0; i < catDistinctElements.length; i++) {
                    this.boxArray[i] = {
                        dataPoints: [],
                        mean: 0,
                        IQR: 0,
                        Q1: 0,
                        Q2: 0,
                        Q3: 0,
                        updatedXCategoryParent: null,
                        min: 0,
                        max: 0,
                        tooltipData: []
                    };
                }
                for (const item of boxWhiskerdataPoints.dataPoints) {
                    item.key = catDistinctElements.indexOf(item.categoryGroup) + 1;
                    this.boxArray[item.key - 1].dataPoints.push(item.value);
                    this.boxArray[item.key - 1].updatedXCategoryParent = item.updatedXCategoryParent;
                }
            }
            boxWhiskerdataPoints.dataPoints.sort(boxWhiskerUtils.objectSort('key'));
            // Sorting functionality

            return boxWhiskerdataPoints;
        }

        public update(options: VisualUpdateOptions): void {
            this.colorPalette = this.host.colorPalette;
            if (!options) {
                return;
            }
            this.viewport = options.viewport;
            const dataView: DataView = this.dataView = options.dataViews && options.dataViews[0]
                ? options.dataViews[0]
                : null;

            const sortSetting: ISortSettings = this.sortSetting = enumSettings.getSortSettings(dataView);

            const data: IBoxWhiskerDataPoints = this.data = this.visualTransform(
                options,
                dataView,
                this.viewport.height,
                this.colorPalette,
                this.host);

            if (data === null) {
                this.xAxisSvg.remove();
                this.yAxisSvg.remove();
                this.yParentAxisSvg.remove();
                this.xParentAxisSvg.remove();
                this.yAxis.remove();
                this.xAxis.remove();
            }
            const visualContext: this = this;
            Visual.dataValues = [];

            data.dataPoints.forEach(function (d: IBoxWhiskerViewModel): void {
                Visual.dataValues.push(d.value);
            });
            Visual.xTitleText = data.xTitleText;
            Visual.yTitleText = data.yTitleText;
            const flipSetting: IFlipSettings = this.flipSetting = enumSettings.getFlipSettings(dataView);
            const yAxisConfig: IAxisSettings = this.yAxisConfig = enumSettings.getAxisSettings(this.dataView, 'Y');
            const xAxisConfig: IAxisSettings = this.xAxisConfig = enumSettings.getAxisSettings(this.dataView, 'X');
            const rangeConfig: IRangeSettings = this.rangeConfig = enumSettings.getRangeSettings(dataView);
            const legendSetting: ILegendConfig = this.legendSetting = enumSettings.getLegendSettings(dataView);
            const parentAxisConfigs: IParentAxisSettings = this.parentAxisConfigs = enumSettings.getParentAxisSettings(this.dataView);
            const gradientSelectorSetting: IGradientSelectorSettings = this.gradientSetting = enumSettings
                .getGradientSelectorSettings(this.dataView);
            const backgroundSetting: IBackgroundSettings = this.backgroundSetting = enumSettings.getBackgroundSettings(this.dataView);
            const gridLinesSetting: IGridLinesSettings = this.gridLinesSetting = enumSettings.getGridLinesSettings(this.dataView);
            const tickSettings: ITickSettings = this.tickSetting = enumSettings.getTickSettings(this.dataView);
            const boxOptionsSettings: IBoxOptionsSettings = this.boxOptionsSetting = enumSettings.getBoxOptionsSettings(this.dataView);
            const meanSettings: IMeanSettings = this.meanSetting = enumSettings.getMeanSettings(this.dataView);
            let width: number = _.clone(options.viewport.width);
            let height: number = _.clone(options.viewport.height);

            const dataSizeValues: number[] = [];
            data.dataPoints.forEach(function (d: IBoxWhiskerViewModel): void {
                dataSizeValues.push(d.categorySize);
            });

            // Legends
            let legendWidth: number = 0;
            let legendHeight: number = 0;
            let isScrollPresent: boolean = false;
            const legendContainer: d3.Selection<HTMLElement> = d3.select('.legend');
            const legendGroupContainer: d3.Selection<HTMLElement> = d3.select('.legend #legendGroup');
            if (legendSetting.show) {
                this.renderLegend(dataView, legendSetting, true);
                legendWidth = parseFloat(legendContainer.attr('width'));
                legendHeight = parseFloat(legendContainer.attr('height'));
            }

            d3.selectAll('.boxWhisker_legendCategory').remove();
            d3.selectAll('.boxWhisker_categorySize').remove();

            const legendOrient: LegendPosition = Visual.legend.getOrientation();
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
            isScrollPresent = isScrollPresent || !Visual.catSizePresent;
            this.renderLegend(dataView, legendSetting, isScrollPresent);

            this.legendDotSvg
                .attr({
                    class: 'boxWhisker_sizeLegend',
                    height: 0,
                    width: 0
                })
                .style('position', 'absolute');

            // Position chart, legends, boxWhisker legends according to legend position.
            if (Visual.isColorCategoryPresent && !Visual.isGradientPresent) {
                legendGroupContainer.selectAll('*').style('display', 'block');
            } else {
                legendGroupContainer.selectAll('*').style('display', 'none');
            }

            if (legendSetting.show) {
                switch (legendOrient) {
                    case 0:
                        height = height - legendHeight <= 1 ? 1 : height - legendHeight;
                        if (isScrollPresent) {
                            if (Visual.isColorCategoryPresent && Visual.catSizePresent) {
                                this.legendDotSvg.attr({
                                    height: legendHeight,
                                    width: options.viewport.width
                                });
                                height = height - legendHeight <= 1 ? 1 : height - legendHeight;
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
                        height = height - legendHeight <= 1 ? 1 : height - legendHeight;
                        if (isScrollPresent) {
                            if (Visual.isColorCategoryPresent && Visual.catSizePresent) {
                                this.legendDotSvg.attr({
                                    height: legendHeight,
                                    width: options.viewport.width
                                });
                                height = height - legendHeight <= 1 ? 1 : height - legendHeight;
                                this.legendDotSvg
                                    .style({ 'margin-top': legendContainer.style('margin-top'), 'margin-left': '0px' });
                                legendContainer.style('margin-top', `${height}px`);
                            } else {
                                this.legendDotSvg
                                    .style({ 'margin-top': legendContainer.style('margin-top'), 'margin-left': '0px' });
                            }
                        } else {
                            this.legendDotSvg.attr({
                                height: legendHeight,
                                width: options.viewport.width / 2
                            });
                            this.legendDotSvg
                                .style({
                                    'margin-top': legendContainer
                                        .style('margin-top'), 'margin-left': `${options.viewport.width / 2}px`
                                });
                        }
                        this.baseContainer.style('height', `${height}px`);
                        this.baseContainer.style('width', `${width}px`);
                        break;
                    case 3:
                        width = width - legendWidth <= 0 ? 0 : width - legendWidth;
                        height = height <= 1 ? 1 : height;
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
                        height = height <= 1 ? 1 : height;
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

            const originalSvgWidth: number = width;
            const originalSvgHeight: number = height;

            this.svg.selectAll('.boxWhisker_xAxisGrid').remove();
            this.svg.selectAll('.boxWhisker_yAxisGrid').remove();
            this.svg.selectAll('.boxWhisker_xAxisGridLines').remove();
            this.svg.selectAll('.boxWhisker_yAxisGridLines').remove();
            this.svg.selectAll('.boxWhisker_dot').remove();
            this.svg.selectAll('.boxWhisker_xAxisGridRect').remove();
            this.svg.selectAll('.boxLower').remove();
            this.svg.selectAll('.boxUpper').remove();
            this.svg.selectAll('.boxOutlineQ1').remove();
            this.svg.selectAll('.boxOutlineQ3').remove();
            this.svg.selectAll('.whiskerMin').remove();
            this.svg.selectAll('.whiskerMax').remove();
            this.svg.selectAll('.whiskerMinBox').remove();
            this.svg.selectAll('.whiskerMaxBox').remove();
            this.svg.selectAll('.shapeMean').remove();
            let translate: number = 0;

            let yAxisFormatter: utils.formatting.IValueFormatter;
            let yAxisWidth: number = 0;
            const xAxisWidth: number = 0;
            let xAxisParentHeight: number = 0;
            const yAxisParentHeight: number = 0;
            let yAxisHeight: number = 0;

            // tslint:disable-next-line:no-any
            let xScale: any; let yScale: any; let rScale: any;
            // tslint:disable-next-line:no-any
            let xAxisFormatter: utils.formatting.IValueFormatter; let yParentScale: any; yParentScale = null;
            const format: string = this.measureFormat;

            const boxArraylength: number = this.boxArray.length;
            let i: number = 0;

            // box calculations
            for (; i < boxArraylength; i++) {
                const dataPointsLength: number = this.boxArray[i].dataPoints.length;
                let mid: number;
                this.boxArray[i].dataPoints = this.boxArray[i].dataPoints.sort((a: number, b: number): number => a - b);

                // the following code snippet calculates the medians (Q1, Q2 and Q3)
                if (dataPointsLength === 1) {
                    this.boxArray[i].Q2 = this.boxArray[i].dataPoints[0];
                    this.boxArray[i].Q1 = this.boxArray[i].dataPoints[0];
                    this.boxArray[i].Q3 = this.boxArray[i].dataPoints[0];
                } else if (dataPointsLength % 2 === 0 || this.boxOptionsSetting.median === 'Inclusive') {
                    mid = dataPointsLength / 2 - 1;
                    this.boxArray[i].Q2 = boxWhiskerUtils.getMedian(this.boxArray[i], 0, dataPointsLength - 1);
                    this.boxArray[i].Q1 = boxWhiskerUtils.getMedian(this.boxArray[i], 0, Math.ceil(mid));
                    this.boxArray[i].Q3 = boxWhiskerUtils.getMedian(this.boxArray[i], Math.floor(mid + 1), dataPointsLength - 1);
                } else {
                    mid = (dataPointsLength - 1) / 2;
                    this.boxArray[i].Q2 = boxWhiskerUtils.getMedian(this.boxArray[i], 0, dataPointsLength - 1);
                    this.boxArray[i].Q1 = boxWhiskerUtils.getMedian(this.boxArray[i], 0, mid - 1);
                    this.boxArray[i].Q3 = boxWhiskerUtils.getMedian(this.boxArray[i], mid + 1, dataPointsLength - 1);
                }
                // calculating IQR
                this.boxArray[i].IQR = this.boxArray[i].Q3 - this.boxArray[i].Q1;

                // calculating mean
                let counter: number;
                for (counter = 0; counter < dataPointsLength; counter++) {
                    this.boxArray[i].mean += this.boxArray[i].dataPoints[counter];
                }
                this.boxArray[i].mean /= dataPointsLength;

                // the following code snippet calculates the upper and lower whisker values for each whisker type
                if (this.boxOptionsSetting.whiskerType === 'Min/Max') {                         // for 'Min/Max' whisker type

                    this.boxArray[i].min = this.boxArray[i].dataPoints[0];
                    this.boxArray[i].max = this.boxArray[i].dataPoints[dataPointsLength - 1];

                } else if (this.boxOptionsSetting.whiskerType === '< 1.5 IQR') {                // for '< 1.5 IQR' whisker type

                    this.boxArray[i].min = this.boxArray[i].dataPoints
                        .filter((min: number) => min >= (this.boxArray[i].Q1 - (1.5 * this.boxArray[i].IQR)))[0];
                    this.boxArray[i].max = this.boxArray[i].dataPoints
                        .filter((max: number) => max <= (this.boxArray[i].Q3 + (1.5 * this.boxArray[i].IQR))).reverse()[0];

                } else if (this.boxOptionsSetting.whiskerType === '= 1.5 IQR') {                // for '= 1.5 IQR' whisker type

                    this.boxArray[i].min = this.boxArray[i].Q1 - (1.5 * this.boxArray[i].IQR);
                    this.boxArray[i].max = this.boxArray[i].Q3 + (1.5 * this.boxArray[i].IQR);

                } else if (this.boxOptionsSetting.whiskerType === 'One Standard Deviation') {   // for 'One Standard Deviation' whisker type

                    let sigma: number = 0;
                    for (counter = 0; counter < dataPointsLength; counter++) {
                        sigma += Math.pow(this.boxArray[i].dataPoints[counter] - this.boxArray[i].mean, 2);
                    }
                    sigma /= (dataPointsLength - 1);
                    sigma = Math.sqrt(sigma);
                    this.boxArray[i].min = this.boxArray[i].mean - sigma;
                    this.boxArray[i].min = Math.min(this.boxArray[i].min, this.boxArray[i].Q1);
                    this.boxArray[i].max = this.boxArray[i].mean + sigma;
                    this.boxArray[i].max = Math.max(this.boxArray[i].max, this.boxArray[i].Q3);

                } else {                                                                        // for 'Custom' whisker type

                    if (this.boxOptionsSetting.higher > 100) { this.boxOptionsSetting.higher = 100; }
                    if (this.boxOptionsSetting.higher < 75) { this.boxOptionsSetting.higher = 75; }
                    if (this.boxOptionsSetting.lower > 25) { this.boxOptionsSetting.lower = 25; }
                    if (this.boxOptionsSetting.lower < 0) { this.boxOptionsSetting.lower = 0; }

                    const lowerIndex: number = this.boxOptionsSetting.lower / 100 * (dataPointsLength + 1);
                    const higherIndex: number = this.boxOptionsSetting.higher / 100 * (dataPointsLength + 1);
                    const lowerIndexRounded: number = Math.floor(lowerIndex);
                    const higherIndexRounded: number = Math.floor(higherIndex);

                    if (dataPointsLength === 1 || dataPointsLength === 2) {

                        this.boxArray[i].min = this.boxArray[i].Q1;
                        this.boxArray[i].max = this.boxArray[i].Q3;

                    } else if (higherIndexRounded >= dataPointsLength || lowerIndexRounded === 0) {

                        if (higherIndexRounded >= dataPointsLength && lowerIndexRounded === 0) {
                            this.boxArray[i].min = this.boxArray[i].dataPoints[0];
                            this.boxArray[i].max = this.boxArray[i].dataPoints[dataPointsLength - 1];
                        } else if (lowerIndexRounded === 0) {
                            this.boxArray[i].min = this.boxArray[i].dataPoints[0];

                            this.boxArray[i].max = this.boxArray[i].dataPoints[higherIndexRounded - 1] + (higherIndex - higherIndexRounded)
                                * (this.boxArray[i].dataPoints[higherIndexRounded] - this.boxArray[i].dataPoints[higherIndexRounded - 1]);
                            this.boxArray[i].max = Math.max(this.boxArray[i].max, this.boxArray[i].Q3);
                        } else {
                            this.boxArray[i].min = this.boxArray[i].dataPoints[lowerIndexRounded - 1] + (lowerIndex - lowerIndexRounded) *
                                (this.boxArray[i].dataPoints[lowerIndexRounded] - this.boxArray[i].dataPoints[lowerIndexRounded - 1]);
                            this.boxArray[i].min = Math.min(this.boxArray[i].min, this.boxArray[i].Q1);

                            this.boxArray[i].max = this.boxArray[i].dataPoints[dataPointsLength - 1];
                        }

                    } else {

                        this.boxArray[i].min = this.boxArray[i].dataPoints[lowerIndexRounded - 1] + (lowerIndex - lowerIndexRounded) *
                            (this.boxArray[i].dataPoints[lowerIndexRounded] - this.boxArray[i].dataPoints[lowerIndexRounded - 1]);
                        this.boxArray[i].min = Math.min(this.boxArray[i].min, this.boxArray[i].Q1);

                        this.boxArray[i].max = this.boxArray[i].dataPoints[higherIndexRounded - 1] + (higherIndex - higherIndexRounded) *
                            (this.boxArray[i].dataPoints[higherIndexRounded] - this.boxArray[i].dataPoints[higherIndexRounded - 1]);
                        this.boxArray[i].max = Math.max(this.boxArray[i].max, this.boxArray[i].Q3);

                    }

                }
                // box calculations

                // formatting and adding tooltip data for boxes
                const formatter: utils.formatting.IValueFormatter = valueFormatter.create({
                    format: options.dataViews[0].categorical.values[0].source.format
                                        ? options.dataViews[0].categorical.values[0].source.format : valueFormatter.DefaultNumericFormat
                });
                this.boxArray[i].tooltipData = [
                    {
                        name: 'Median Type',
                        value: boxWhiskerUtils.convertToString(this.boxOptionsSetting.median)
                    },
                    {
                        name: 'Whisker Type',
                        value: boxWhiskerUtils.convertToString(this.boxOptionsSetting.whiskerType)
                    },
                    {
                        name: 'Mean',
                        value: formatter.format(this.boxArray[i].mean)
                    },
                    {
                        name: 'Quartile 1',
                        value: formatter.format(this.boxArray[i].Q1)
                    },
                    {
                        name: 'Median',
                        value: formatter.format(this.boxArray[i].Q2)
                    },
                    {
                        name: 'Quartile 3',
                        value: formatter.format(this.boxArray[i].Q3)
                    },
                    {
                        name: 'Maximum',
                        value: formatter.format(Math.max(...this.boxArray[i].dataPoints))
                    },
                    {
                        name: 'Minimum',
                        value: formatter.format(Math.min(...this.boxArray[i].dataPoints))
                    },
                    {
                        name: 'IQR',
                        value: formatter.format(this.boxArray[i].IQR)
                    },
                    {
                        name: 'Upper Whisker',
                        value: formatter.format(this.boxArray[i].max)
                    },
                    {
                        name: 'Lower Whisker',
                        value: formatter.format(this.boxArray[i].min)
                    }
                ];
            }

            let xAxisTitleText: string = Visual.xTitleText;
            let yAxisTitleText: string = Visual.yTitleText;

            if (xAxisConfig.titleText) {
                xAxisTitleText = xAxisConfig.titleText;
            }
            if (yAxisConfig.titleText) {
                yAxisTitleText = yAxisConfig.titleText;
            }

            let rangeMin: number = 2;
            let rangeMax: number = 6;

            // Update Min/Max for radius scale
            if (rangeConfig.min || rangeConfig.min === 0) {
                if (rangeConfig.min > 10) {
                    rangeConfig.min = 10;
                    rangeMin = 10;
                } else if (rangeConfig.min < 1) {
                    rangeConfig.min = 1;
                    rangeMin = 1;
                } else {
                    rangeMin = rangeConfig.min;
                }
            }
            if (rangeConfig.max || rangeConfig.max === 0) {
                if (rangeConfig.max > 50) {
                    rangeConfig.max = 50;
                    rangeMax = 50;
                } else if (rangeConfig.max < 1) {
                    rangeConfig.max = 1;
                    rangeMax = 1;
                } else {
                    rangeMax = rangeConfig.max;
                }
                if (rangeConfig.max < rangeConfig.min) {
                    rangeConfig.max = rangeConfig.min;
                    rangeMax = rangeMin;
                }
            }

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
                    .classed('boxWhisker_xAxisSvg', true);
                this.xAxis = this.xAxisSvg
                    .append('g')
                    .classed('boxWhisker_xAxis', true);
                this.yAxisSvg = this.scrollableContainer.append('svg')
                    .classed('boxWhisker_yAxisSvg', true);
                this.yAxis = this.yAxisSvg
                    .append('g')
                    .classed('boxWhisker_yAxis', true);
                this.yTitle = this.yAxisSvg.append('g')
                    .classed('boxWhisker_yAxis boxWhisker_yTitle', true);
                this.xTitle = this.xAxisSvg.append('g')
                    .classed('boxWhisker_xAxis boxWhisker_xTitle', true);
                this.yParentAxisSvg = this.scrollableContainer.append('svg')
                    .classed('boxWhisker_yParentAxisSvg', true);
                this.yParentAxis = this.yParentAxisSvg
                    .append('g')
                    .classed('boxWhisker_yParentAxis', true);
                Visual.margins.right = 0;
                Visual.margins.left = 0;
                Visual.margins.bottom = 0;
                Visual.margins.top = 0;
                let measureTextProperties: TextProperties;

                let domainStart: number = boxWhiskerUtils.returnMin(Visual.dataValues);
                let domainEnd: number = boxWhiskerUtils.returnMax(Visual.dataValues);

                if (xAxisConfig.start || xAxisConfig.start === 0) {
                    if (xAxisConfig.end || xAxisConfig.end === 0) {
                        if (xAxisConfig.start < xAxisConfig.end) {
                            domainStart = xAxisConfig.start;
                        }
                    } else if (xAxisConfig.start < domainEnd) {
                        domainStart = xAxisConfig.start;
                    }
                }

                if (xAxisConfig.end || xAxisConfig.end === 0) {
                    if (xAxisConfig.start || xAxisConfig.start === 0) {
                        if (xAxisConfig.start < xAxisConfig.end) {
                            domainEnd = xAxisConfig.end;
                        }
                    } else if (xAxisConfig.end > domainStart) {
                        domainEnd = xAxisConfig.end;
                    }
                }

                const value: number =
                    Math.abs(domainEnd) > Math.abs(domainStart) ? Math.abs(domainEnd) : Math.abs(domainStart);
                let decimalPlaces: number = 0;

                if (xAxisConfig.decimalPlaces || xAxisConfig.decimalPlaces === 0) {
                    if (xAxisConfig.decimalPlaces > 4) {
                        xAxisConfig.decimalPlaces = 4;
                        decimalPlaces = xAxisConfig.decimalPlaces;
                    } else if (xAxisConfig.decimalPlaces < 0) {
                        xAxisConfig.decimalPlaces = null;
                    } else {
                        decimalPlaces = xAxisConfig.decimalPlaces;
                    }
                }
                xAxisFormatter = valueFormatter.create({
                    format: format, precision: decimalPlaces, value: xAxisConfig.displayUnits === 0 ?
                    boxWhiskerUtils.getValueUpdated(value) : xAxisConfig.displayUnits
                });
                const formattedMaxMeasure: string = xAxisFormatter.format(value);
                measureTextProperties = {
                    fontFamily: xAxisConfig.labelsFontFamily,
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: formattedMaxMeasure
                };
                if (xAxisConfig.show) {
                    let xTitleHeight: number = 0;
                    if (xAxisConfig.showTitle) {
                        const xTitleTextProperties: TextProperties = {
                            fontFamily: xAxisConfig.titleFontFamily,
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisTitleText
                        };
                        xTitleHeight = textMeasurementService.measureSvgTextHeight(xTitleTextProperties);
                        Visual.margins.bottom = xTitleHeight + 5;
                    }

                    const xAxisHeight: number = textMeasurementService.measureSvgTextHeight(measureTextProperties) + 5;
                    Visual.margins.bottom += xAxisHeight;
                } else {
                    Visual.margins.bottom = 5;
                    xAxisParentHeight = 0;
                }

                let yTitleHeight: number = 0;
                if (yAxisConfig.show) {
                    if (yAxisConfig.showTitle) {
                        const yTitleTextProperties: TextProperties = {
                            fontFamily: yAxisConfig.titleFontFamily,
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisTitleText
                        };
                        yTitleHeight = textMeasurementService.measureSvgTextHeight(yTitleTextProperties) + 5;
                        Visual.margins.left = yTitleHeight;
                    }

                    const catTextProperties: TextProperties = {
                        fontFamily: yAxisConfig.labelsFontFamily,
                        fontSize: `${yAxisConfig.fontSize}px`,
                        text: this.catLongestText
                    };
                    yAxisWidth = flipSetting.flipText ?
                        textMeasurementService.measureSvgTextWidth(catTextProperties) + 5 :
                        textMeasurementService.measureSvgTextHeight(catTextProperties) + 5;
                    Visual.margins.left += yAxisWidth;

                    const parentTextProperties: TextProperties = {
                        fontFamily: parentAxisConfigs.fontFamily,
                        fontSize: `${parentAxisConfigs.fontSize}px`,
                        text: this.xParentLongestText
                    };

                    if (Visual.catGroupPresent && Visual.xParentPresent) {
                        yAxisHeight = flipSetting.flipParentText ?
                            textMeasurementService.measureSvgTextWidth(parentTextProperties) + 15 :
                            textMeasurementService.measureSvgTextHeight(parentTextProperties);
                    } else {
                        const measureTextWidth: number = textMeasurementService.measureSvgTextWidth(measureTextProperties);
                        yAxisHeight = measureTextWidth / 2;
                    }

                    if (this.parentAxisConfigs.split) {
                        Visual.margins.right = yAxisHeight;
                    } else {
                        yAxisHeight = yAxisHeight;
                        Visual.margins.left += yAxisHeight + 5;
                        const measureTextWidth: number = textMeasurementService.measureSvgTextWidth(measureTextProperties) + 2;
                        Visual.margins.right = measureTextWidth / 2;
                    }

                } else {
                    const measureTextWidth: number = textMeasurementService
                        .measureSvgTextWidth(measureTextProperties) + 2; //2 for (-) sign in labels
                    Visual.margins.right = measureTextWidth / 2;
                    Visual.margins.left = measureTextWidth / 2;
                }
                Visual.margins.left -= 5;
                // Svg adjustment
                width = width - Visual.margins.left - Visual.margins.right < 0 ? 0 : width - Visual.margins.left - Visual.margins.right;
                height = height - Visual.margins.bottom < 0 ? 0 : height - Visual.margins.bottom;

                this.svg.attr('width', width);
                this.svg.attr('height', height);
                this.svg.style('margin-left', `${Visual.margins.left}px`);
                this.svg.style('margin-top', '0px');
                // X Axis adjustment
                this.xAxisSvg.attr({
                    width: `100%`,
                    height: `${((Visual.margins.bottom) / originalSvgHeight) * 100}%`
                });
                this.xAxisSvg.style({
                    'margin-top': `${height}px`
                });

                // Y Axis adjustment
                this.yAxisSvg.attr({
                    width: `${((Visual.margins.left) / originalSvgWidth) * 100}%`,
                    height: `${((height + Visual.margins.bottom) / originalSvgHeight) * 100}%`
                });

                // X Axis parent adjustment
                if (this.parentAxisConfigs.split) {
                    this.yParentAxisSvg.attr({
                        width: `${(Visual.margins.right / originalSvgWidth) * 100}%`,
                        height: `${((height + Visual.margins.bottom) / originalSvgHeight) * 100}%`
                    });
                    this.yParentAxisSvg.style('margin-left', `${width + Visual.margins.left}px`);
                } else {
                    this.yParentAxisSvg.attr({
                        width: `${(yAxisHeight / originalSvgWidth) * 100}%`,
                        height: `${((height + Visual.margins.bottom) / originalSvgHeight) * 100}%`
                    });
                    this.yParentAxisSvg.style('margin-left', `${yTitleHeight}px`);
                }

                // Scales
                xScale = d3.scale.linear()
                    .domain([domainStart, domainEnd])
                    .range([0, width]);

                yScale = d3.scale.ordinal()

                    .domain(data.dataPoints.map((d: IBoxWhiskerViewModel) => d.updatedXCategoryParent))
                    .rangeBands([height, 3]);

                rScale = d3.scale.linear()
                    .domain([boxWhiskerUtils.returnMin(dataSizeValues), (boxWhiskerUtils.returnMax(dataSizeValues))])
                    .range([rangeConfig.min, rangeConfig.max]);

                const widthForXAxis: number = width;
                const heightForXAxis: number = height;
                let textProperties: TextProperties = {
                    fontFamily: xAxisConfig.labelsFontFamily,
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: this.catLongestText
                };

                const yAxisPoints: number = data.dataPoints.map((d: IBoxWhiskerViewModel) =>
                    d.updatedXCategoryParent).filter(boxWhiskerUtils.getDistinctElements).length;

                // calcualte minimum width for Y-Axis labels
                let minWidth: number = 30;
                if (yAxisConfig.minWidth || yAxisConfig.minWidth === 0) {
                    if (yAxisConfig.minWidth > 300) {
                        yAxisConfig.minWidth = 300;
                        minWidth = 300;
                    } else if (yAxisConfig.minWidth < 5) {
                        yAxisConfig.minWidth = 5;
                        minWidth = 5;
                    } else {
                        minWidth = yAxisConfig.minWidth;
                    }
                    if (yAxisConfig.minWidth < yAxisConfig.fontSize) {
                        yAxisConfig.minWidth = yAxisConfig.fontSize;
                        minWidth = yAxisConfig.fontSize;
                    }
                }

                // Scroll logic
                if ((minWidth * yAxisPoints) > (height)) {
                    height = (minWidth * yAxisPoints);
                    width = width - 20 < 0 ? 0 : width - 20;
                    xScale.range([0, width]);
                    yScale.rangeBands([height, 3]);
                    this.svg.attr({
                        width: width,
                        height: height
                    });
                    this.yParentAxisSvg.attr({
                        height: height,
                        width: `${(yAxisHeight / (originalSvgWidth - 20)) * 100}%`
                    });
                    if (this.parentAxisConfigs.split) {
                        this.yParentAxisSvg.style('margin-left', `${width + Visual.margins.left}px`);
                    } else {
                        this.yParentAxisSvg.style('margin-left', `${yTitleHeight}px`);
                    }

                    this.yAxisSvg.attr({
                        width: Visual.margins.left,
                        height: height
                    });
                }

                this.scrollableContainer.style('width', `${Visual.margins.left + widthForXAxis + Visual.margins.right}px`);
                this.scrollableContainer.style('height', `${heightForXAxis}px`);
                this.scrollableContainer.style('margin-left', '0px');

                const yAxis: d3.svg.Axis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');

                const xAxis: d3.svg.Axis = d3.svg.axis()
                    .scale(xScale)
                    .ticks(axisHelper.getRecommendedNumberOfTicksForXAxis(width))
                    .orient('bottom');

                // Draw X Axis
                if (xAxisConfig.show) {
                    this.xAxis.attr('transform', `translate(${Visual.margins.left})`)
                        .call(xAxis);

                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick').append('title')

                        .text((d: string) => {
                            return d;
                        });
                }
                // Update y-Axis labels
                if (yAxisConfig.show) {
                    if (yAxisConfig.showTitle) {
                        const yTitleTextProps: TextProperties = {
                            fontFamily: yAxisConfig.titleFontFamily,
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisTitleText
                        };
                        this.yTitle
                            .classed('boxWhisker_yTitle', true)
                            .attr('transform', `translate(5,${heightForXAxis / 2})`)
                            .append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('dy', '0.71em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${yAxisConfig.titleSize}px`)
                            .style('font-family', yAxisConfig.titleFontFamily)
                            .style('fill', yAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(yTitleTextProps, heightForXAxis))
                            .append('title')
                            .text(yAxisTitleText);
                    }
                    this.yAxis
                        .attr('transform', `translate(${Visual.margins.left},0)`)
                        .call(yAxis);

                    const yAxisSvgText: d3.Selection<{}> = this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick text');
                    yAxisSvgText
                        .style('font-size', `${yAxisConfig.fontSize}px`)
                        .style('font-family', yAxisConfig.labelsFontFamily)
                        .style('fill', yAxisConfig.fontColor)
                        .text(function (d: string): string {
                            textProperties = {
                                fontFamily: yAxisConfig.labelsFontFamily,
                                fontSize: `${yAxisConfig.fontSize}px`,
                                text: boxWhiskerUtils.getText(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, flipSetting.flipText ?
                                1000 : yScale.rangeBand());
                        })
                        .attr('data-parent', function (d: string): string {
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
                        this.yParentAxis.selectAll('.boxWhisker_xAxisGridLines').remove();

                        // tslint:disable-next-line:no-any
                        let yTicks: any;
                        yTicks = this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick text');

                        const yTicksLen: number = yTicks.size();
                        const yParentTicks: string[] = [];
                        let isBool: boolean = false;
                        let iCounter: number = 0;
                        let j: number = 0; i = 0;
                        translate = height;
                        this.svgGridLines.append('line')
                            .classed('boxWhisker_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 1,
                                x2: 1,
                                y1: 3,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width,
                                x2: width,
                                y1: 3,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width,
                                x2: 0,
                                y1: 3,
                                y2: 3
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width,
                                x2: 0,
                                y1: height,
                                y2: height
                            });
                        if (tickSettings.showCategoryTicks && Visual.xParentPresent) {
                            this.yParentAxisSvg.append('line')
                                .classed('boxWhisker_yAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: 0,
                                    x2: yAxisHeight,
                                    y1: Visual.margins.top + 3,
                                    y2: Visual.margins.top + 3
                                });

                            this.yParentAxisSvg.append('line')
                                .classed('boxWhisker_yAxisparentGridLines', true)
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
                                .classed('boxWhisker_xAxisGridLines', true)
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

                            const parent: string = yTicks[0][i].getAttribute('data-parent');
                            let yWidth: number = 0;

                            // tslint:disable-next-line:no-any
                            let xAttr: any = yTicks[0][i].parentNode.getAttribute('transform').substring(12, yTicks[0][i]
                                .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][i]
                                    .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][i]
                                        .parentNode.getAttribute('transform').length - 1);
                            for (j = i; j < yTicksLen; j++) {

                                const nextParent: string = yTicks[0][j].getAttribute('data-parent');

                                let xNextAttr: string = yTicks[0][j].parentNode.getAttribute('transform').substring(12, yTicks[0][j]
                                    .parentNode.getAttribute('transform').lastIndexOf(',') > 12 ? yTicks[0][j]
                                        .parentNode.getAttribute('transform').lastIndexOf(',') : yTicks[0][j]
                                            .parentNode.getAttribute('transform').length - 1);
                                if (parent === nextParent) {
                                    isBool = true;
                                    yWidth += yScale.rangeBand();
                                    if (tickSettings.showAxisTicks) {
                                        this.yAxis.append('line')
                                            .classed('boxWhisker_yAxisGridLines', true)
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
                                                .classed('boxWhisker_yAxisGridLines', true)
                                                .attr({
                                                    stroke: tickSettings.categoryTickColor,
                                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                                    y1: -(yScale.rangeBand() / 2),
                                                    y2: -(yScale.rangeBand() / 2),
                                                    x1: 0,
                                                    x2: yAxisHeight,
                                                    transform: `translate(0, ${xNextAttr})`
                                                });
                                        }
                                        if (gridLinesSetting.showCategoryGridLines) {
                                            this.svgGridLines.append('line')
                                                .classed('boxWhisker_yAxisGridLines', true)
                                                .attr({
                                                    stroke: gridLinesSetting.categoryColor,
                                                    'stroke-width': 0.5 + (gridLinesSetting.categoryThickness / 100),
                                                    y1: -(yScale.rangeBand() / 2),
                                                    y2: -(yScale.rangeBand() / 2),
                                                    x1: 0,
                                                    x2: width,
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
                                            .classed('boxWhisker_yAxisGridLines', true)
                                            .attr({
                                                stroke: 'rgb(166, 166, 166)',
                                                'stroke-width': 1,
                                                y1: -(yScale.rangeBand() / 2),
                                                y2: -(yScale.rangeBand() / 2),
                                                x1: 0,
                                                x2: width,
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
                                fontFamily: parentAxisConfigs.fontFamily,
                                fontSize: `${parentAxisConfigs.fontSize}px`,
                                text: parent
                            };

                            this.yParentAxis
                                .append('g')
                                .attr('transform', `translate(0, ${xAttr})`)
                                .classed('boxWhisker_yParentAxis', true)
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
                                    .classed('boxWhisker_xAxisGridRect', true)
                                    .attr({
                                        fill: iCounter % 2 === 0 ? backgroundSetting.bgPrimaryColor : backgroundSetting.bgSecondaryColor,
                                        x: 0,
                                        y: 0,
                                        width: width - (1 + (gridLinesSetting.categoryThickness / 100)) < 0 ?
                                            0 : width - (0.5 + (gridLinesSetting.categoryThickness / 100)), // 10,
                                        height: yWidth,
                                        'fill-opacity': (100 - backgroundSetting.bgTransparency) / 100
                                    })
                                    .attr('transform', `translate(0, ${translate})`);
                            }
                            iCounter++;
                        }
                    }

                    this.yParentAxisSvg.selectAll('.boxWhisker_yParentAxis text')
                        .style('font-size', `${parentAxisConfigs.fontSize}px`)
                        .style('font-family', parentAxisConfigs.fontFamily)
                        .style('fill', parentAxisConfigs.fontColor);

                    if (!Visual.catGroupPresent && Visual.xParentPresent) {
                        this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick').append('title')
                            .text(function (d: string): string {
                                return d.substring(0, d.indexOf('$$$'));
                        });
                    } else {
                        this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick').append('title')
                            .text(function (d: string): string {
                                return d.substring(d.indexOf('$$$') >= 0 ? d.indexOf('$$$') + 3 : 0, d.length);
                        });
                    }
                } else {
                    this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick text').text('');
                    this.yAxisSvg.selectAll('path').remove();
                }
                if (xAxisConfig.show) {
                    // Draw X Axis grid lines

                    // tslint:disable-next-line:no-any
                    let xTicks: any;
                    xTicks = this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick');
                    const tickLeng: number = xTicks.size();

                    let start: number = 0;
                    if (gridLinesSetting.showAxisGridLines) {
                        for (; start < tickLeng; start++) {

                            const xCoordinate: string = xTicks[0][start]
                                .getAttribute('transform')
                                .substring(10, xTicks[0][start]
                                    .getAttribute('transform')
                                    .indexOf(',') >= 0 ? xTicks[0][start]
                                        .getAttribute('transform')
                                        .indexOf(',') : xTicks[0][start]
                                            .getAttribute('transform').length - 1);
                            this.axisGridLines.append('line')
                                .classed('boxWhisker_xAxisGrid', true).attr({
                                    stroke: gridLinesSetting.color,
                                    'stroke-width': 0.25 + (gridLinesSetting.thickness / 133.33),
                                    x1: xCoordinate,
                                    x2: xCoordinate,
                                    y1: (height),
                                    y2: 3
                                });
                        }
                    }

                    this.xAxis.selectAll('path')
                        .remove();

                    if (xAxisConfig.showTitle) {
                        const xTitleTextProps: TextProperties = {
                            fontFamily: xAxisConfig.titleFontFamily,
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisTitleText
                        };
                        this.xTitle
                            .classed('boxWhisker_xTitle', true)
                            .attr('transform', `translate(${Visual.margins.left + (widthForXAxis / 2)}, ${Visual.margins.bottom - 5})`)
                            .append('text')
                            .attr('dy', '-0.32em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${xAxisConfig.titleSize}px`)
                            .style('font-family', xAxisConfig.titleFontFamily)
                            .style('fill', xAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(xTitleTextProps, widthForXAxis))
                            .append('title')
                            .text(xAxisTitleText);
                    }

                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text')
                        .style('font-size', `${xAxisConfig.fontSize}px`)
                        .style('font-family', xAxisConfig.labelsFontFamily)
                        .style('fill', xAxisConfig.fontColor)
                        .text(function (d: string): string {
                            textProperties = {
                                fontFamily: xAxisConfig.labelsFontFamily,
                                fontSize: `${xAxisConfig.fontSize}px`,
                                text: xAxisFormatter.format(d)
                            };

                            return textMeasurementService
                                .getTailoredTextOrDefault(textProperties, ((width - Visual.margins.left) /
                                    axisHelper.getRecommendedNumberOfTicksForXAxis(width)) - 5);
                        });

                    //tooltip information adding
                    const tooptipFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                        format: this.measureFormat
                    });
                    d3.selectAll('.boxWhisker_xAxis .tick text')
                        .append('title')
                        .text(function (d: string): string {
                            return tooptipFormatter.format(d);
                        });

                } else {
                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text').text('');
                    this.xAxis.selectAll('path').remove();
                }

                if (rangeConfig.dots || boxOptionsSettings.outliers) {
                    const boxWhiskerdot: d3.Selection<IBoxWhiskerViewModel> = this.dotsContainer.selectAll('.boxWhisker_dot');
                    let circles: d3.selection.Update<IBoxWhiskerViewModel>;

                    // filters dots based on whether outliers are disabled or enabled
                    if (!boxOptionsSettings.outliers) {
                        circles = boxWhiskerdot.data(data.dataPoints.filter((outlier: IBoxWhiskerViewModel) =>
                                                                        outlier.value >= this.boxArray[outlier.key - 1].min
                                                                        && outlier.value <= this.boxArray[outlier.key - 1].max));
                    } else if (!rangeConfig.dots) {
                        circles = boxWhiskerdot.data(data.dataPoints.filter((outlier: IBoxWhiskerViewModel) =>
                                                                        outlier.value < this.boxArray[outlier.key - 1].min
                                                                        || outlier.value > this.boxArray[outlier.key - 1].max));
                    } else {
                        circles = boxWhiskerdot.data(data.dataPoints);
                    }

                    circles.enter()
                        .append('circle')
                        .classed('boxWhisker_dot', true);

                    circles.attr({
                        cx: (d: IBoxWhiskerViewModel): number => xScale(d.value),
                        cy: (d: IBoxWhiskerViewModel): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2,
                        r: (d: IBoxWhiskerViewModel): number => rScale(d.categorySize),
                        'fill-opacity': (100 - rangeConfig.transparency) / 100,
                        stroke: rangeConfig.border ? rangeConfig.borderColor : 'none',
                        'stroke-opacity': (100 - rangeConfig.transparency) / 100,
                        'stroke-width': 2
                    });

                    // Gradient logic
                    if (!Visual.isGradientPresent) {
                        circles.attr({ fill: (d: IBoxWhiskerViewModel): string => boxWhiskerUtils.getColor(rangeConfig, d) });
                    } else {
                        let minGradientValue: number = 9999999999999;
                        let maxGradientValue: number = 0;

                        // tslint:disable-next-line:no-any
                        this.categoryColorData.forEach((element: any) => {
                            if (parseFloat(element) < minGradientValue) {
                                minGradientValue = element;
                            }
                            if (parseFloat(element) > maxGradientValue) {
                                maxGradientValue = element;
                            }
                        });
                        const colorScale: d3.scale.Linear<number, number> = d3.scale.linear()
                            .domain([minGradientValue, maxGradientValue])
                            .range([0, 1]);
                        const colors: (t: number) => string = d3.interpolateRgb(gradientSelectorSetting.minColor,
                                                                                gradientSelectorSetting.maxColor);
                        circles.attr('fill', function (d: IBoxWhiskerViewModel): string {
                            return colors(colorScale(parseFloat(d.categoryColor)));
                        });
                    }
                }

                // plotting boxes, whiskers, median lines
                // plotting box below median (Q2)
                const boxesLower: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxLower')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                let boxWidth: number = yScale.rangeBand() / 2;
                if (this.boxOptionsSetting.boxWidth === 'Small') {
                    boxWidth /= 2;
                } else if (this.boxOptionsSetting.boxWidth === 'Large') {
                    boxWidth *= 1.5;
                }

                boxesLower.enter()
                    .append('rect')
                    .classed('boxLower', true);

                boxesLower.attr({
                    x: (d: IBoxDataPoints): number => xScale(d.Q1),
                    y: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    width: (d: IBoxDataPoints): number => xScale(d.Q2) - xScale(d.Q1),
                    height: (d: IBoxDataPoints): number => boxWidth,
                    fill: this.boxOptionsSetting.boxLowerColor,
                    'fill-opacity': (100 - this.boxOptionsSetting.boxTransparency) / 100
                });

                // plotting box above median (Q2)
                const boxesUpper: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxUpper')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                boxesUpper.enter()
                    .append('rect')
                    .classed('boxUpper', true);

                boxesUpper.attr({
                    x: (d: IBoxDataPoints): number => xScale(d.Q2),
                    y: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    width: (d: IBoxDataPoints): number => xScale(d.Q3) - xScale(d.Q2),
                    height: (d: IBoxDataPoints): number => boxWidth,
                    fill: this.boxOptionsSetting.boxUpperColor,
                    'fill-opacity': (100 - this.boxOptionsSetting.boxTransparency) / 100
                });

                // plotting Q1
                const lineQ1: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxOutlineQ1')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineQ1.enter()
                    .append('line')
                    .classed('boxOutlineQ1', true);

                lineQ1.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.Q1),
                    x2: (d: IBoxDataPoints): number => xScale(d.Q1),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 + boxWidth / 2
                });

                // plotting Q3
                const lineQ3: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxOutlineQ3')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineQ3.enter()
                    .append('line')
                    .classed('boxOutlineQ3', true);

                lineQ3.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.Q3),
                    x2: (d: IBoxDataPoints): number => xScale(d.Q3),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 + boxWidth / 2
                });

                // plotting lower whisker (vertical line)
                const lineMin: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMin')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMin.enter()
                    .append('line')
                    .classed('whiskerMin', true);

                lineMin.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.min),
                    x2: (d: IBoxDataPoints): number => xScale(d.min),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 + boxWidth / 2
                });

                // plotting upper whisker (vertical line)
                const lineMax: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMax')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMax.enter()
                    .append('line')
                    .classed('whiskerMax', true);

                lineMax.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.max),
                    x2: (d: IBoxDataPoints): number => xScale(d.max),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - boxWidth / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 + boxWidth / 2
                });

                // plotting lower whisker (horizontal line)
                const lineMinBox: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMinBox')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMinBox.enter()
                    .append('line')
                    .classed('whiskerMinBox', true);

                lineMinBox.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.min),
                    x2: (d: IBoxDataPoints): number => xScale(d.Q1),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2
                });

                // plotting upper whisker (horizontal line)
                const lineMaxBox: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMaxBox')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMaxBox.enter()
                    .append('line')
                    .classed('whiskerMaxBox', true);

                lineMaxBox.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.max),
                    x2: (d: IBoxDataPoints): number => xScale(d.Q3),
                    y1: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2,
                    y2: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2
                });

                // plotting mean
                if ( this.meanSetting.show ) {
                    const shapeMean: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.shapeMean')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                    let meanWidth: number = yScale.rangeBand() / 16;
                    if (this.meanSetting.meanWidth === 'Small') {
                        meanWidth /= 1.5;
                    } else if (this.meanSetting.meanWidth === 'Large') {
                        meanWidth *= 1.5;
                    }

                    if (this.meanSetting.meanShape === 'Circle') {                              // circular shape

                        shapeMean.enter()
                            .append('circle')
                            .classed('shapeMean', true);

                        shapeMean.attr({
                            cx: (d: IBoxDataPoints): number => xScale(d.mean),
                            cy: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2,
                            r: (d: IBoxDataPoints): number => meanWidth,
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            fill: this.meanSetting.meanColor
                        });

                    } else if (this.meanSetting.meanShape === 'Square') {                         // square shape

                        shapeMean.enter()
                        .append('rect')
                        .classed('shapeMean', true);

                        shapeMean.attr({
                            x: (d: IBoxDataPoints): number => xScale(d.mean) - meanWidth,
                            y: (d: IBoxDataPoints): number => yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2 - meanWidth,
                            width: (d: IBoxDataPoints): number => meanWidth * 2,
                            height: (d: IBoxDataPoints): number => meanWidth * 2,
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            fill: this.meanSetting.meanColor
                        });

                    } else {                                                                        // triangular shape

                        // tslint:disable-next-line:no-any
                        const arc: any = d3.svg.symbol().type('triangle-down')
                            .size(function (d: IBoxDataPoints): number { return 2 * meanWidth * meanWidth; });

                        shapeMean.enter()
                            .append('path')
                            .classed('shapeMean', true);

                        shapeMean.attr({
                            d: arc,
                            transform: function (d: IBoxDataPoints): string {
                                return `translate(${xScale(d.mean)},
                                    ${yScale(d.updatedXCategoryParent) + yScale.rangeBand() / 2}) rotate(90)`;
                            },
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            'fill-opacity': this.meanSetting.meanColor,
                            fill: this.meanSetting.meanColor
                        });
                        shapeMean.exit().remove();

                    }
                }

            } else {
                let xAxisHeight: number = 0;
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
                    .classed('boxWhisker_xAxisSvg', true);
                this.xAxis = this.xAxisSvg
                    .append('g')
                    .classed('boxWhisker_xAxis', true);
                this.yAxisSvg = this.baseContainer.append('svg')
                    .classed('boxWhisker_yAxisSvg', true);
                this.yAxis = this.yAxisSvg
                    .append('g')
                    .classed('boxWhisker_yAxis', true);
                this.yTitle = this.yAxisSvg.append('g')
                    .classed('boxWhisker_yAxis boxWhisker_yTitle', true);
                this.xTitle = this.xAxisSvg.append('g')
                    .classed('boxWhisker_xAxis boxWhisker_xTitle', true);
                this.xParentAxisSvg = this.scrollableContainer.append('svg')
                    .classed('boxWhisker_xParentAxisSvg', true);
                this.xParentAxis = this.xParentAxisSvg
                    .append('g')
                    .classed('boxWhisker_xParentAxis', true);

                let measureTextHeight: number;

                let domainStart: number = boxWhiskerUtils.returnMin(Visual.dataValues);
                let domainEnd: number = boxWhiskerUtils.returnMax(Visual.dataValues);

                if (yAxisConfig.start || yAxisConfig.start === 0) {
                    if (yAxisConfig.end || yAxisConfig.end === 0) {
                        if (yAxisConfig.start < yAxisConfig.end) {
                            domainStart = yAxisConfig.start;
                        }
                    } else if (yAxisConfig.start < domainEnd) {
                        domainStart = yAxisConfig.start;
                    }
                }

                if (yAxisConfig.end || yAxisConfig.end === 0) {
                    if (yAxisConfig.start || yAxisConfig.start === 0) {
                        if (yAxisConfig.start < yAxisConfig.end) {
                            domainEnd = yAxisConfig.end;
                        }
                    } else if (yAxisConfig.end > domainStart) {
                        domainEnd = yAxisConfig.end;
                    }
                }

                const value: number =
                    Math.abs(domainEnd) > Math.abs(domainStart) ? Math.abs(domainEnd) : Math.abs(domainStart);

                let decimalPlaces: number = 0;

                if (yAxisConfig.decimalPlaces || yAxisConfig.decimalPlaces === 0) {
                    if (yAxisConfig.decimalPlaces > 4) {
                        yAxisConfig.decimalPlaces = 4;
                        decimalPlaces = yAxisConfig.decimalPlaces;
                    } else if (yAxisConfig.decimalPlaces < 0) {
                        yAxisConfig.decimalPlaces = null;
                    } else {
                        decimalPlaces = yAxisConfig.decimalPlaces;
                    }
                }

                yAxisFormatter = valueFormatter.create({
                    format: format, precision: decimalPlaces, value: yAxisConfig.displayUnits === 0 ?
                    boxWhiskerUtils.getValueUpdated(value) : yAxisConfig.displayUnits
                });
                const formattedMaxMeasure: string = yAxisFormatter.format(value);
                const measureTextPropertiesForMeasure: TextProperties = {
                    fontFamily: yAxisConfig.labelsFontFamily,
                    fontSize: `${yAxisConfig.fontSize}px`,
                    text: formattedMaxMeasure
                };

                if (yAxisConfig.show) {
                    Visual.margins.left = 0;
                    let yTitleHeight: number = 0;
                    if (yAxisConfig.showTitle) {
                        const yTitleTextProperties: TextProperties = {
                            fontFamily: yAxisConfig.titleFontFamily,
                            fontSize: `${yAxisConfig.titleSize}px`,
                            text: yAxisTitleText
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
                    let xTitleHeight: number = 0;
                    if (xAxisConfig.showTitle) {
                        const xTitleTextProperties: TextProperties = {
                            fontFamily: xAxisConfig.titleFontFamily,
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisTitleText
                        };
                        xTitleHeight = textMeasurementService.measureSvgTextHeight(xTitleTextProperties);
                        Visual.margins.bottom = xTitleHeight + 10;
                    }
                    let measureTextPropertiesForGroup: TextProperties = {
                        fontFamily: xAxisConfig.labelsFontFamily,
                        fontSize: `${xAxisConfig.fontSize}px`,
                        text: 'X'
                    };
                    xAxisHeight = textMeasurementService.measureSvgTextHeight(measureTextPropertiesForGroup) + 5;
                    Visual.margins.bottom += xAxisHeight;

                    if (Visual.catGroupPresent && Visual.xParentPresent) {
                        measureTextPropertiesForGroup = {
                            fontFamily: parentAxisConfigs.fontFamily,
                            fontSize: `${parentAxisConfigs.fontSize}px`,
                            text: 'X'
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
                this.svg.attr('width', '100%');
                this.svg.attr('height', `${(height / originalSvgHeight) * 100}%`);
                this.svg.style('margin-top', `${Visual.margins.top}px`);
                this.svg.style('margin-left', '0px');
                // Y Axis adjustment
                this.yAxisSvg.attr({
                    width: `${(Visual.margins.left / options.viewport.width) * 100}%`,
                    height: `100%`
                });
                // X Axis adjustment
                this.xAxisSvg.attr({
                    width: `100%`,
                    height: `${(Visual.margins.bottom / originalSvgHeight) * 100}%`
                });
                this.xAxisSvg.style('margin-top', `${height + Visual.margins.top}px`);
                // X Axis parent adjustment
                if (this.parentAxisConfigs.split) {
                    this.xParentAxisSvg.attr({
                        width: '100%',
                        height: `${((xAxisParentHeight + 5) / (height + Visual.margins.bottom)) * 100}%`
                    });
                } else {
                    this.xParentAxisSvg.attr({
                        width: '100%',
                        height: `${((xAxisParentHeight + 5) / (options.viewport.height + Visual.margins.bottom)) * 100}%`
                    });
                    this.xParentAxisSvg.style('margin-top', `${height + xAxisHeight + Visual.margins.top}px`);
                }
                // Scales
                yScale = d3.scale.linear()
                    .domain([domainStart, domainEnd])
                    .range([height, 0]);

                xScale = d3.scale.ordinal()
                    .domain(data.dataPoints.map((d: IBoxWhiskerViewModel) => d.updatedXCategoryParent))
                    .rangeBands([0, width - 2]);

                rScale = d3.scale.linear()
                    .domain([boxWhiskerUtils.returnMin(dataSizeValues), (boxWhiskerUtils.returnMax(dataSizeValues))])
                    .range([rangeConfig.min, rangeConfig.max]);

                const widthForXAxis: number = width;
                const heightForXAxis: number = height;
                let textProperties: TextProperties = {
                    fontFamily: xAxisConfig.labelsFontFamily,
                    fontSize: `${xAxisConfig.fontSize}px`,
                    text: this.catLongestText
                };
                const xAxisPoints: number = data.dataPoints.map((d: IBoxWhiskerViewModel) => d.updatedXCategoryParent)
                    .filter(boxWhiskerUtils.getDistinctElements).length;

                // calcualte minimum width for X-Axis labels
                let minWidth: number = 30;
                if (xAxisConfig.minWidth || xAxisConfig.minWidth === 0) {
                    if (xAxisConfig.minWidth > 300) {
                        xAxisConfig.minWidth = 300;
                        minWidth = 300;
                    } else if (xAxisConfig.minWidth < 5) {
                        xAxisConfig.minWidth = 5;
                        minWidth = 5;
                    } else {
                        minWidth = xAxisConfig.minWidth;
                    }
                }

                // Scroll logic
                if ((minWidth * xAxisPoints) > (width)) {
                    width = (minWidth * xAxisPoints);
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
                        this.xParentAxisSvg.style('margin-top', `${height + xAxisHeight + Visual.margins.top}px`);
                    }
                    this.xAxisSvg.style({
                        'margin-top': `${height + Visual.margins.top}px`
                    });
                    this.xAxisSvg.attr({
                        width: width,
                        height: Visual.margins.bottom
                    });
                }
                this.scrollableContainer.style('width', `${((widthForXAxis) / options.viewport.width) * 100}%`);
                this.scrollableContainer
                    .style('height', `${((heightForXAxis + Visual.margins.bottom + Visual.margins.top) / options.viewport.height) * 100}%`);
                this.scrollableContainer.style('margin-left', `${Visual.margins.left}px`);

                const xAxis: d3.svg.Axis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

                const yAxis: d3.svg.Axis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(axisHelper.getRecommendedNumberOfTicksForYAxis(height - Visual.margins.bottom - Visual.margins.top))
                    .orient('left');

                if (yAxisConfig.show) {
                    yAxis.tickFormat(yAxisFormatter.format);
                    this.yAxis.attr('transform', `translate(${Visual.margins.left},${Visual.margins.top})`)
                        .call(yAxis);

                    this.yAxisSvg.selectAll('.boxWhisker_yAxis text')
                        .style('font-size', `${yAxisConfig.fontSize}px`)
                        .style('font-family', yAxisConfig.labelsFontFamily)
                        .style('fill', yAxisConfig.fontColor);

                    this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick').append('title')

                        .text((d: string) => {
                            return d;
                        });
                }

                this.xAxis.selectAll('.boxWhisker_xAxisGridLines').remove();
                if (xAxisConfig.show) {
                    if (xAxisConfig.showTitle) {
                        const xTitleTextProps: TextProperties = {
                            fontFamily: xAxisConfig.titleFontFamily,
                            fontSize: `${xAxisConfig.titleSize}px`,
                            text: xAxisTitleText
                        };
                        this.xTitle
                            .classed('boxWhisker_xTitle', true)
                            .attr('transform', `translate(${widthForXAxis / 2},${Visual.margins.bottom - 5})`)
                            .append('text')
                            .attr('dy', '-0.32em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${xAxisConfig.titleSize}px`)
                            .style('font-family', xAxisConfig.titleFontFamily)
                            .style('fill', xAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(xTitleTextProps, widthForXAxis))
                            .append('title')
                            .text(xAxisTitleText);
                    }

                    this.xAxis.call(xAxis);

                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text')
                        .style('font-size', `${xAxisConfig.fontSize}px`)
                        .style('font-family', xAxisConfig.labelsFontFamily)
                        .style('fill', xAxisConfig.fontColor);

                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text')
                        .text(function (d: string): string {
                            textProperties = {
                                fontFamily: xAxisConfig.labelsFontFamily,
                                fontSize: `${xAxisConfig.fontSize}px`,
                                text: boxWhiskerUtils.getText(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, xScale.rangeBand());
                        })
                        .attr('data-parent', function (d: string): string {
                            return d.substring(0, d.indexOf('$$$') >= 0 ? d.indexOf('$$$') : 0);
                        });

                    // For category Parent
                    if (!(!Visual.catGroupPresent && Visual.xParentPresent) || (!Visual.xParentPresent)) {
                        // tslint:disable-next-line:no-any
                        let xTicks: any;
                        xTicks = this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text');
                        // tslint:disable-next-line:no-any
                        const xTicksLen: any = xTicks.size();
                        const xParentTicks: string[] = [];
                        let isBool: boolean = false;
                        let iCounter: number = 0;
                        let j: number = 0; i = 0;
                        this.svgGridLines.append('line')
                            .classed('boxWhisker_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 1,
                                x2: 1,
                                y1: 0,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_xAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: width - 2,
                                x2: width - 2,
                                y1: 0,
                                y2: height
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 0,
                                x2: width - 2,
                                y1: 0,
                                y2: 0
                            });

                        this.svgGridLines.append('line')
                            .classed('boxWhisker_yAxisGridLines', true)
                            .attr({
                                stroke: 'rgb(166, 166, 166)',
                                'stroke-width': 1,
                                x1: 0,
                                x2: width - 2,
                                y1: (height),
                                y2: (height)
                            });
                        if (tickSettings.showCategoryTicks && Visual.xParentPresent) {
                            this.xParentAxisSvg.append('line')
                                .classed('boxWhisker_xAxisparentGridLines', true)
                                .attr({
                                    stroke: tickSettings.categoryTickColor,
                                    'stroke-width': 0.5 + (tickSettings.categoryTickThickness / 100),
                                    x1: 1,
                                    x2: 1,
                                    y1: xAxisParentHeight + 5,
                                    y2: 0
                                });

                            this.xParentAxisSvg.append('line')
                                .classed('boxWhisker_xAxisparentGridLines', true)
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
                                .classed('boxWhisker_xAxisGridLines', true)
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

                            const parent: string = xTicks[0][i].getAttribute('data-parent');
                            let xWidth: number = 0;

                            // tslint:disable-next-line:no-any
                            let xAttr: any = xTicks[0][i].parentNode.getAttribute('transform').substring(10, xTicks[0][i]
                                .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][i]
                                    .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][i]
                                        .parentNode.getAttribute('transform').length - 1);
                            for (j = i; j < xTicksLen; j++) {

                                const nextParent: string = xTicks[0][j].getAttribute('data-parent');

                                let xNextAttr: string = xTicks[0][j].parentNode.getAttribute('transform').substring(10, xTicks[0][j]
                                    .parentNode.getAttribute('transform').indexOf(',') >= 0 ? xTicks[0][j]
                                        .parentNode.getAttribute('transform').indexOf(',') : xTicks[0][j]
                                            .parentNode.getAttribute('transform').length - 1);
                                if (parent === nextParent) {
                                    isBool = true;
                                    xWidth += xScale.rangeBand();
                                    if (tickSettings.showAxisTicks) {
                                        this.xAxis.append('line')
                                            .classed('boxWhisker_xAxisGridLines', true)
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
                                                .classed('boxWhisker_xAxisGridLines', true)
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
                                                .classed('boxWhisker_xAxisGridLines', true)
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
                                            .classed('boxWhisker_xAxisGridLines', true)
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
                                fontFamily: parentAxisConfigs.fontFamily,
                                fontSize: `${parentAxisConfigs.fontSize}px`,
                                text: parent
                            };

                            if (backgroundSetting.show && Visual.xParentPresent && Visual.catGroupPresent) {
                                this.svgGridLines.append('rect')
                                    .classed('boxWhisker_xAxisGridRect', true)
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
                                .classed('boxWhisker_xParentAxis', true)
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

                    this.xParentAxisSvg.selectAll('.boxWhisker_xParentAxis text')
                        .style('font-size', `${parentAxisConfigs.fontSize}px`)
                        .style('font-family', parentAxisConfigs.fontFamily)
                        .style('fill', parentAxisConfigs.fontColor);

                    this.xAxis.selectAll('path')
                        .remove();

                    if (!Visual.catGroupPresent && Visual.xParentPresent) {
                        this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick').append('title')
                        .text(function (d: string): string {
                            return d.substring(0, d.indexOf('$$$'));
                        });
                    } else {
                        this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick').append('title')
                        .text(function (d: string): string {
                            return d.substring(d.indexOf('$$$') >= 0 ? d.indexOf('$$$') + 3 : 0, d.length);
                        });
                    }
                } else {
                    this.xAxisSvg.selectAll('.boxWhisker_xAxis .tick text').text('');
                    this.xAxis.selectAll('path').remove();
                }

                if (yAxisConfig.show) {
                    // Draw Y Axis grid lines

                    // tslint:disable-next-line:no-any
                    let yTicks: any;
                    yTicks = this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick');

                    // tslint:disable-next-line:no-any
                    const tickLeng: any = yTicks.size();
                    let start: number = 0;
                    if (gridLinesSetting.showAxisGridLines) {
                        for (; start < tickLeng; start++) {

                            const yCoordinate: string = yTicks[0][start]
                                .getAttribute('transform')
                                .substring(12, yTicks[0][start]
                                    .getAttribute('transform').length - 1);
                            this.axisGridLines.append('line')
                                .classed('boxWhisker_yAxisGrid', true).attr({
                                    stroke: gridLinesSetting.color,
                                    'stroke-width': 0.25 + (gridLinesSetting.thickness / 133.33),
                                    x1: 1,
                                    x2: width - 2,
                                    y1: yCoordinate,
                                    y2: yCoordinate
                                });
                        }
                    }
                    const yTitleTextProps: TextProperties = {
                        fontFamily: yAxisConfig.titleFontFamily,
                        fontSize: `${yAxisConfig.titleSize}px`,
                        text: yAxisTitleText
                    };
                    if (yAxisConfig.showTitle) {
                        this.yTitle
                            .classed('boxWhisker_yTitle', true)
                            .attr('transform', `translate(10,${Visual.margins.top + (height / 2)})`)
                            .append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('dy', '0.71em')
                            .attr('text-anchor', 'middle')
                            .style('font-size', `${yAxisConfig.titleSize}px`)
                            .style('font-family', yAxisConfig.titleFontFamily)
                            .style('fill', yAxisConfig.titleColor)
                            .text(textMeasurementService.getTailoredTextOrDefault(yTitleTextProps, height))
                            .append('title')
                            .text(yAxisTitleText);
                    }

                    this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick text')

                        .text(function (d: string): string {
                            textProperties = {
                                fontFamily: yAxisConfig.labelsFontFamily,
                                fontSize: `${yAxisConfig.fontSize}px`,
                                text: yAxisFormatter.format(d)
                            };

                            return textMeasurementService.getTailoredTextOrDefault(textProperties, yAxisWidth + 1);
                        });

                    //tooltip information adding
                    const tooptipFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                        format: this.measureFormat
                    });
                    d3.selectAll('.boxWhisker_yAxis .tick text')
                        .append('title')

                        .text(function (d: string): string {
                            return tooptipFormatter.format(d);
                        });

                    this.yAxisSvg.selectAll('.boxWhisker_yParentAxis .tick text')

                        .text(function (d: string): string {
                            textProperties = {
                                fontFamily: parentAxisConfigs.fontFamily,
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
                    this.yAxisSvg.selectAll('.boxWhisker_yAxis .tick text').text('');
                    this.yAxis.selectAll('path').remove();
                }

                if (rangeConfig.dots || boxOptionsSettings.outliers) {
                    const boxWhiskerdot: d3.Selection<IBoxWhiskerViewModel> = this.dotsContainer.selectAll('.boxWhisker_dot');
                    let circles: d3.selection.Update<IBoxWhiskerViewModel>;

                    // filters dots based on whether outliers are disabled or enabled
                    if (!boxOptionsSettings.outliers) {
                        circles = boxWhiskerdot.data(data.dataPoints
                                .filter((outlier: IBoxWhiskerViewModel) => outlier.value >= this.boxArray[outlier.key - 1].min
                                                                        && outlier.value <= this.boxArray[outlier.key - 1].max));
                    } else if (!rangeConfig.dots) {
                        circles = boxWhiskerdot.data(data.dataPoints
                                .filter((outlier: IBoxWhiskerViewModel) => outlier.value < this.boxArray[outlier.key - 1].min
                                                                        || outlier.value > this.boxArray[outlier.key - 1].max));
                    } else {
                        circles =
                        boxWhiskerdot.data(data.dataPoints);
                    }

                    circles.enter()
                        .append('circle')
                        .classed('boxWhisker_dot', true);

                    circles.attr({
                        cx: (d: IBoxWhiskerViewModel): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                        cy: (d: IBoxWhiskerViewModel): number => yScale(d.value),
                        r: (d: IBoxWhiskerViewModel): number => rScale(d.categorySize),
                        'fill-opacity': (100 - rangeConfig.transparency) / 100,
                        stroke: rangeConfig.border ? rangeConfig.borderColor : 'none',
                        'stroke-opacity': (100 - rangeConfig.transparency) / 100,
                        'stroke-width': 2
                    });

                    // Gradient logic
                    if (!Visual.isGradientPresent) {
                        circles.attr({ fill: (d: IBoxWhiskerViewModel): string => boxWhiskerUtils.getColor(rangeConfig, d) });
                    } else {
                        let minGradientValue: number = 9999999999999;
                        let maxGradientValue: number = 0;

                        // tslint:disable-next-line:no-any
                        this.categoryColorData.forEach((element: any) => {
                            if (parseFloat(element) < minGradientValue) {
                                minGradientValue = element;
                            }
                            if (parseFloat(element) > maxGradientValue) {
                                maxGradientValue = element;
                            }
                        });
                        const colorScale: d3.scale.Linear<number, number> = d3.scale.linear()
                            .domain([minGradientValue, maxGradientValue])
                            .range([0, 1]);
                        const colors: (t: number) => string = d3.interpolateRgb(gradientSelectorSetting.minColor,
                                                                                gradientSelectorSetting.maxColor);
                        circles.attr('fill', function (d: IBoxWhiskerViewModel): string {
                            return colors(colorScale(parseFloat(d.categoryColor)));
                        });
                    }
                }

                // plotting boxes, whiskers, median lines
                // plotting box below median (Q2)
                const boxesLower: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxLower')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                let boxWidth: number = xScale.rangeBand() / 2;
                if (this.boxOptionsSetting.boxWidth === 'Small') {
                    boxWidth /= 2;
                } else if (this.boxOptionsSetting.boxWidth === 'Large') {
                    boxWidth *= 1.5;
                }

                boxesLower.enter()
                    .append('rect')
                    .classed('boxLower', true);

                boxesLower.attr({
                    x: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    y: (d: IBoxDataPoints): number => yScale(d.Q2),
                    width: (d: IBoxDataPoints): number => boxWidth,
                    height: (d: IBoxDataPoints): number => yScale(d.Q1) - yScale(d.Q2),
                    fill: this.boxOptionsSetting.boxLowerColor,
                    'fill-opacity': (100 - this.boxOptionsSetting.boxTransparency) / 100
                });

                // plotting box above median (Q2)
                const boxesUpper: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxUpper')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                boxesUpper.enter()
                    .append('rect')
                    .classed('boxUpper', true);

                boxesUpper.attr({
                    x: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    y: (d: IBoxDataPoints): number => yScale(d.Q3),
                    width: (d: IBoxDataPoints): number => boxWidth,
                    height: (d: IBoxDataPoints): number => yScale(d.Q2) - yScale(d.Q3),
                    fill: this.boxOptionsSetting.boxUpperColor,
                    'fill-opacity': (100 - this.boxOptionsSetting.boxTransparency) / 100
                });

                // plotting Q1
                const lineQ1: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxOutlineQ1')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineQ1.enter()
                    .append('line')
                    .classed('boxOutlineQ1', true);

                lineQ1.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 + boxWidth / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.Q1),
                    y2: (d: IBoxDataPoints): number => yScale(d.Q1)
                });

                // plotting Q3
                const lineQ3: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.boxOutlineQ3')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineQ3.enter()
                    .append('line')
                    .classed('boxOutlineQ3', true);

                lineQ3.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 + boxWidth / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.Q3),
                    y2: (d: IBoxDataPoints): number => yScale(d.Q3)
                });

                // plotting lower whisker (horizontal line)
                const lineMin: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMin')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMin.enter()
                    .append('line')
                    .classed('whiskerMin', true);

                lineMin.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 + boxWidth / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.min),
                    y2: (d: IBoxDataPoints): number => yScale(d.min)
                });

                // plotting upper whisker (horizontal line)
                const lineMax: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMax')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMax.enter()
                    .append('line')
                    .classed('whiskerMax', true);

                lineMax.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - boxWidth / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 + boxWidth / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.max),
                    y2: (d: IBoxDataPoints): number => yScale(d.max)
                });

                // plotting lower whisker (vertical line)
                const lineMinBox: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMinBox')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMinBox.enter()
                    .append('line')
                    .classed('whiskerMinBox', true);

                lineMinBox.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.min),
                    y2: (d: IBoxDataPoints): number => yScale(d.Q1)
                });

                // plotting upper whisker (vertical line)
                const lineMaxBox: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.whiskerMaxBox')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                lineMaxBox.enter()
                    .append('line')
                    .classed('whiskerMaxBox', true);

                lineMaxBox.attr({
                    stroke: this.boxOptionsSetting.whiskerColor,
                    'stroke-width': 2,
                    'stroke-opacity': (100 - this.boxOptionsSetting.whiskerTransparency) / 100,
                    x1: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                    x2: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                    y1: (d: IBoxDataPoints): number => yScale(d.max),
                    y2: (d: IBoxDataPoints): number => yScale(d.Q3)
                });

                // plotting mean
                if ( this.meanSetting.show ) {
                    const shapeMean: d3.selection.Update<IBoxDataPoints> = this.dotsContainer.selectAll('.shapeMean')
                                    .data(this.boxArray.filter((d: IBoxDataPoints): boolean => d.dataPoints.length > 0));

                    let meanWidth: number = xScale.rangeBand() / 16;
                    if (this.meanSetting.meanWidth === 'Small') {
                        meanWidth /= 1.5;
                    } else if (this.meanSetting.meanWidth === 'Large') {
                        meanWidth *= 1.5;
                    }

                    if (this.meanSetting.meanShape === 'Circle') {                                              // circular shape

                        shapeMean.enter()
                            .append('circle')
                            .classed('shapeMean', true);

                        shapeMean.attr({
                            cx: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2,
                            cy: (d: IBoxDataPoints): number => yScale(d.mean),
                            r: (d: IBoxDataPoints): number => meanWidth,
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            fill: this.meanSetting.meanColor
                        });

                    } else if (this.meanSetting.meanShape === 'Square') {                                       // square shape

                        shapeMean.enter()
                            .append('rect')
                            .classed('shapeMean', true);

                        shapeMean.attr({
                            x: (d: IBoxDataPoints): number => xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2 - meanWidth,
                            y: (d: IBoxDataPoints): number => yScale(d.mean) - meanWidth,
                            width: (d: IBoxDataPoints): number => meanWidth * 2,
                            height: (d: IBoxDataPoints): number => meanWidth * 2,
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            fill: this.meanSetting.meanColor
                        });

                    } else {                                                                                      // triangular shape

                        // tslint:disable-next-line:no-any
                        const arc: any = d3.svg.symbol().type('triangle-down')
                            .size(function (d: IBoxDataPoints): number { return 2 * meanWidth * meanWidth; });

                        shapeMean.enter()
                            .append('path')
                            .classed('shapeMean', true);

                        shapeMean.attr({
                            d: arc,
                            transform: function (d: IBoxDataPoints): string {
                                return `translate(${xScale(d.updatedXCategoryParent) + xScale.rangeBand() / 2},
                                    ${yScale(d.mean)})`;
                            },
                            stroke: this.boxOptionsSetting.whiskerColor,
                            'stroke-width': 2,
                            'fill-opacity': this.meanSetting.meanColor,
                            fill: this.meanSetting.meanColor
                        });
                        shapeMean.exit().remove();

                    }
                }
            }
            visualContext.clickFlag = false;
            const dots: d3.Selection<IBoxWhiskerViewModel> = d3.selectAll('.boxWhisker_dot');
            // Highlighting logic
            if (this.highlight) {
                visualContext.clickFlag = true;

                dots.attr({
                    'fill-opacity': function (d: IBoxWhiskerViewModel): number {
                        if (d.highlights) {
                            return 0.9;
                        } else {
                            return 0.15;
                        }
                    },
                    'stroke-opacity': function (d: IBoxWhiskerViewModel): number {
                        if (d.highlights) {
                            return 0.9;
                        } else {
                            return 0.15;
                        }
                    }
                });
            }

            // Hover logic
            $('.boxWhisker_dot').mousemove(
                function (): void {
                    if (!visualContext.clickFlag) {
                        $(this)
                            .attr({
                                stroke: rangeConfig.hoverColor,
                                'stroke-opacity': (100 - rangeConfig.transparency) / 100,
                                'stroke-width': '2px'
                            });
                    }
                });
            $('.boxWhisker_dot').mouseout(
                function (): void {
                    if (!visualContext.clickFlag) {
                        dots.attr({
                            stroke: visualContext.rangeConfig.border ? visualContext.rangeConfig.borderColor : 'none'
                        });
                    }
                });
            // Cross filtering
            dots.on('click', function (d: IBoxWhiskerViewModel): void {
                visualContext.selectionManager.select(d.selectionId, true).then((ids: ISelectionId[]) => {
                    dots.attr({
                        'fill-opacity': function (e: IBoxWhiskerViewModel): number {
                            if (ids.length && ids.indexOf(e.selectionId) === -1 && visualContext.color.indexOf(e.categoryColor) === -1) {
                                return 0.15;
                            } else {
                                return 0.9;
                            }
                        },
                        'stroke-opacity': function (e: IBoxWhiskerViewModel): number {
                            if (ids.length && ids.indexOf(e.selectionId) === -1 && visualContext.color.indexOf(e.categoryColor) === -1) {
                                return 0.15;
                            } else {
                                return 0.9;
                            }
                        }
                    });

                    if (ids.length) {
                        dots.attr({
                                stroke: visualContext.rangeConfig.border ? visualContext.rangeConfig.borderColor : 'none'
                            });
                        visualContext.clickFlag = true;
                    } else {
                        dots.attr({
                                'fill-opacity': (100 - rangeConfig.transparency) / 100,
                                'stroke-opacity': (100 - rangeConfig.transparency) / 100
                            });
                        visualContext.clickFlag = false;
                    }

                    // tslint:disable-next-line:no-any
                    d3.selectAll('.legendItem').attr('fill-opacity', function (legend: any): number {
                        if (legend && legend.tooltip && visualContext.color.length && visualContext.color.indexOf(legend.tooltip) === -1) {
                            return 0.15;
                        } else {
                            return 1;
                        }
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
            $('#legendGroup').on('click.load', '.navArrow', function (): void {
                visualContext.addLegendSelection();
            });
            visualContext.addLegendSelection();

            // Document click
            $(document)
                .on('click', () => this.selectionManager.clear()
                    .then(() => this.clickFlag = false)
                    .then(() => dots)
                    .then(() => {
                        dots.attr({
                            'fill-opacity': (100 - rangeConfig.transparency) / 100,
                            stroke: visualContext.rangeConfig.border ? visualContext.rangeConfig.borderColor : 'none',
                            'stroke-opacity': (100 - rangeConfig.transparency) / 100,
                            'stroke-width': 2
                        });
                    })
                    .then(() => d3.selectAll('.legendItem').attr({ 'fill-opacity': 1 }))
                    .then(() => visualContext.color = []));

            // Adding tooltips on dots
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.boxWhisker_dot'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data, 0),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );

            // Adding tooltips on box, Q1 and Q3
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.boxUpper, .boxLower, .boxOutlineQ1, .boxOutlineQ3'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data, 0),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );

            // Adding tooltips on whiskers
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.whiskerMinBox, .whiskerMaxBox, .whiskerMin, .whiskerMax'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data, 0),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );

            // Adding tooltips on mean
            this.tooltipServiceWrapper.addTooltip(
                d3.selectAll('.shapeMean'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data, 1),
                (tooltipEvent: TooltipEventArgs<number>) => null
            );
        }

        public addLegendSelection(): void {
            const dots: d3.Selection<IBoxWhiskerViewModel> = d3.selectAll('.boxWhisker_dot');
            const visualContext: this = this;
            // tslint:disable-next-line:no-any
            const legends: d3.Selection<any> = d3.selectAll('.legendItem');
            const selectionManager: ISelectionManager = this.selectionManager;
            // tslint:disable-next-line:no-any
            legends.on('click', function (d: any): void {
                const index: number = visualContext.color.indexOf(d.tooltip.toString());
                if (index === -1) {
                    visualContext.color.push(d.tooltip.toString());
                } else {
                    visualContext.color.splice(index, 1);
                }
                visualContext.selectionManager.select(d.identity, true).then((ids: ISelectionId[]) => {
                    dots.attr({
                        'fill-opacity': function (dot: IBoxWhiskerViewModel): number {
                            if (ids.length && (visualContext.color.indexOf(dot.categoryColor) === -1
                            && ids.indexOf(dot.selectionId) === -1)) {
                                return 0.15;
                            } else {
                                return 0.9;
                            }
                        },
                        'stroke-opacity': function (dot: IBoxWhiskerViewModel): number {
                            if (ids.length && (visualContext.color.indexOf(dot.categoryColor) === -1
                            && ids.indexOf(dot.selectionId) === -1)) {
                                return 0.15;
                            } else {
                                return 0.9;
                            }
                        }
                    });
                    // tslint:disable-next-line:no-any
                    legends.attr('fill-opacity', function (legend: any): number {
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
                        dots.attr({
                                stroke: visualContext.rangeConfig.border ? visualContext.rangeConfig.borderColor : 'none'
                            });
                        visualContext.clickFlag = true;
                    } else {
                        dots.attr({
                                'fill-opacity': (100 - visualContext.rangeConfig.transparency) / 100,
                                'stroke-opacity': (100 - visualContext.rangeConfig.transparency) / 100
                            });
                        visualContext.clickFlag = false;
                    }
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        public renderLegend(dataViews: DataView, legendConfig: ILegendConfig, isScrollPresent: boolean): void {
            if (!Visual.legendDataPoints && Visual.legendDataPoints.length) { return; }
            const sTitle: string = '';
            let legendObjectProperties: DataViewObject;
            if (dataViews && dataViews.metadata) {
                legendObjectProperties = powerbi
                    .extensibility
                    .utils
                    .dataview
                    .DataViewObjects
                    .getObject(dataViews.metadata.objects, 'legend', {});
            }

            let legendData: ILegendDataPoint[];
            legendData = Visual.legendDataPoints;
            const legendDataTorender: utils.chart.legend.LegendData = {
                dataPoints: [],
                fontSize: legendConfig.fontSize,
                labelColor: legendConfig.labelColor,
                title: Visual.legendTitle
            };

            for (const iCounter of legendData) {
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
                const position: string = <string>legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                if (position) { Visual.legend.changeOrientation(powerbi.extensibility.utils.chart.legend.LegendPosition[position]); }

            }

            const legendOrient: LegendPosition = Visual.legend.getOrientation();
            const legendViewport: IViewport = _.clone(this.viewport);
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
            Visual.legend.drawLegend(
                legendDataTorender,
                ({ width: legendViewport.width, height: legendViewport.height }), this.legendSetting
            );
            powerbi.extensibility.utils.chart.legend.positionChartArea(this.baseContainer, Visual.legend);
            if (this.baseContainer.style('margin-top')) {
                const value: number = parseFloat(this.baseContainer.style('margin-top')
                    .substr(0, this.baseContainer.style('margin-top').length - 2));
                this.baseContainer.style('margin-top', `${value + 2}px`);
            }
        }

        public renderSizeLegend(
            sizeLegendHeight: number,
            legendOrient: LegendPosition,
            isScrollPresent: boolean,
            dataSizeValues: number[],
            legendSetting: ILegendConfig,
            sizeLegendWidth: number,
            options: VisualUpdateOptions): void {
            const sizeLegendTitleText: string = this.legendDotTitle ? this.legendDotTitle : '';
            let measureTextProperties: TextProperties = {
                fontFamily: legendSetting.fontFamily,
                fontSize: `${legendSetting.fontSize}pt`,
                text: sizeLegendTitleText
            };

            const legendCircles: d3.Selection<SVGElement> = this.legendDotSvg
                .append('g')
                .classed('boxWhisker_categorySize', true);

            if (legendOrient === 0 || legendOrient === 1) {
                const sizeArray: {
                    cX: number;
                    r: number;
                }[] = [{
                    cX: 0,
                    r: 0
                }];
                let cX: number = 0 + 10;
                let radius: number = 0;
                for (let iCounter: number = 0; iCounter < 6; iCounter++) {
                    radius = 2 + (iCounter * (Number(sizeLegendHeight) / 30)); // 2 was taken to have minimum circle visible
                    cX = cX + (radius * 2) + 5 + iCounter * 1; // 5 is distance between circles
                    const obj: {
                        cX: number;
                        r: number;
                    } = {
                            cX: cX,
                            r: radius
                        };
                    sizeArray.push(obj);
                }
                for (let iCounter: number = 1; iCounter < sizeArray.length; iCounter++) {
                    legendCircles.append('circle')
                        .classed('boxWhisker_legendDot', true)
                        .attr({
                            cx: sizeArray[iCounter].cX,
                            cy: radius + Number(sizeLegendHeight) / 7,
                            fill: legendSetting.sizeLegendColor,
                            r: sizeArray[iCounter].r
                        });
                }
                const legendDotData: number[] = [];
                const legendFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                    format: this.sizeFormat,
                    value: legendSetting.displayUnits === 0 ? boxWhiskerUtils.returnMax(dataSizeValues, true) : legendSetting.displayUnits,
                    precision: legendSetting.decimalPlaces
                });
                const legendTooltipFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                    format: valueFormatter.DefaultNumericFormat
                });
                // Push minimum and maximum category size values in this array
                legendDotData.push(boxWhiskerUtils.returnMin(dataSizeValues, true));
                legendDotData.push(boxWhiskerUtils.returnMax(dataSizeValues, true));

                for (let iCount: number = 0; iCount < 2; iCount++) {
                    let x: number = 0; let y: number = 0;
                    if (iCount === 0) {
                        x = sizeArray[1].cX;
                    } else {
                        x = sizeArray[sizeArray.length - 1].cX;
                    }
                    y = (radius * 2) + Number(sizeLegendHeight) / 2;
                    const textProperties: TextProperties = {
                        fontFamily: legendSetting.fontFamily,
                        fontSize: `${sizeLegendHeight / 2.5}px`,
                        text: legendFormatter.format(legendDotData[iCount])
                    };
                    legendCircles.append('text')
                        .classed('boxWhisker_legendDotText', true)
                        .attr({
                            fill: legendSetting.labelColor,
                            x: x,
                            y: y
                        })
                        .style({
                            color: legendSetting.labelColor,
                            'font-size': `${sizeLegendHeight / 2.5}px`,
                            'font-family': legendSetting.fontFamily,
                            'text-anchor': 'middle'
                        }).text(textMeasurementService.getTailoredTextOrDefault(textProperties, 40))
                        .append('title')
                        .text(legendTooltipFormatter.format(legendDotData[iCount]));
                }
                const totalWidth: number = sizeArray[sizeArray.length - 1].cX - sizeArray[0].cX + 10;

                // Size legend title
                const sizeLegendTitleUpdatedText: string = textMeasurementService
                    .getTailoredTextOrDefault(
                    measureTextProperties,
                    (isScrollPresent ? options.viewport.width : options.viewport.width / 2) - totalWidth - 20
                    );

                measureTextProperties = {
                    fontFamily: legendSetting.fontFamily,
                    fontSize: `${legendSetting.fontSize}pt`,
                    text: sizeLegendTitleUpdatedText
                };

                const sizeLegendTitleWidth: number = textMeasurementService.measureSvgTextWidth(measureTextProperties);

                const legendDotText: d3.Selection<SVGElement> = this.legendDotSvg
                    .append('g')
                    .classed('boxWhisker_legendCategory', true)
                    .append('text')
                    .text(sizeLegendTitleUpdatedText)
                    .style({
                        'font-color': legendSetting.labelColor,
                        'font-size': `${legendSetting.fontSize}pt`,
                        'font-family': legendSetting.fontFamily,
                        'font-weight': 600
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
                const sizeArray: {
                    cY: number;
                    r: number;
                }[] = [{
                    cY: 0,
                    r: 0
                }];
                let cY: number = 25;
                let radius: number = 0;
                for (let iCounter: number = 0; iCounter < 6; iCounter++) {
                    radius = 2 + (iCounter * (Number(sizeLegendWidth) / 80)); // 3 was taken to have minimum circle visible
                    cY = cY + (radius * 2) + 3 + iCounter * 1; // 5 is distance between circles
                    const obj: {
                        cY: number;
                        r: number;
                    } = {
                            cY: cY,
                            r: radius
                        };
                    sizeArray.push(obj);
                }
                for (let iCounter: number = 1; iCounter < sizeArray.length; iCounter++) {
                    legendCircles.append('circle')
                        .classed('boxWhisker_legendDot', true)
                        .attr({
                            cx: radius + Number(sizeLegendWidth) / 7,
                            cy: sizeArray[iCounter].cY,
                            fill: legendSetting.sizeLegendColor,
                            r: sizeArray[iCounter].r
                        });
                }
                const legendDotData: number[] = [];
                const legendFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                    format: this.sizeFormat,
                    value: legendSetting.displayUnits === 0 ? boxWhiskerUtils.returnMax(dataSizeValues, true) : legendSetting.displayUnits,
                    precision: legendSetting.decimalPlaces
                });
                const legendTooltipFormatter: utils.formatting.IValueFormatter = valueFormatter.create({
                    format: valueFormatter.DefaultNumericFormat
                });
                // Push minimum and maximum category size values in this array
                legendDotData.push(boxWhiskerUtils.returnMin(dataSizeValues, true));
                legendDotData.push(boxWhiskerUtils.returnMax(dataSizeValues, true));

                for (let iCount: number = 0; iCount < 2; iCount++) {
                    let x: number = 0; let y: number = 0;
                    if (iCount === 0) {
                        y = sizeArray[1].cY + 5;
                    } else {
                        y = sizeArray[sizeArray.length - 1].cY + 5;
                    }
                    x = (radius) + Number(sizeLegendWidth) / 2;
                    const textProperties: TextProperties = {
                        fontFamily: legendSetting.fontFamily,
                        fontSize: `${sizeLegendWidth / 6}px`,
                        text: legendFormatter.format(legendDotData[iCount])
                    };
                    legendCircles.append('text')
                        .classed('boxWhisker_legendDotText', true)
                        .attr({
                            fill: legendSetting.labelColor,
                            x: x,
                            y: y
                        })
                        .style({
                            color: legendSetting.labelColor,
                            'font-size': `${sizeLegendWidth / 8}px`,
                            'font-family': legendSetting.fontFamily,
                            'text-anchor': 'middle'
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(textProperties, ((radius) + Number(sizeLegendWidth) / 2)))
                        .append('title')
                        .text(legendTooltipFormatter.format(legendDotData[iCount]));
                }
                const totalHeight: number = sizeArray[sizeArray.length - 1].cY - sizeArray[0].cY + 10;
                legendCircles.attr('transform', `translate(0, ${options.viewport.height / 2 - totalHeight})`);

                // Size legend title
                const sizeLegendTitleUpdatedText: string = textMeasurementService
                    .getTailoredTextOrDefault(measureTextProperties, parseFloat(d3.select('.legend').style('width')));

                measureTextProperties = {
                    fontFamily: legendSetting.fontFamily,
                    fontSize: `${legendSetting.fontSize}pt`,
                    text: sizeLegendTitleUpdatedText
                };

                const sizeLegendTitleHeight: number = textMeasurementService.measureSvgTextHeight(measureTextProperties);

                const legendDotText: d3.Selection<SVGElement> = this.legendDotSvg
                    .append('g')
                    .classed('boxWhisker_legendCategory', true)
                    .append('text')
                    .text(sizeLegendTitleUpdatedText)
                    .style({
                        'font-color': legendSetting.labelColor,
                        'font-size': `${legendSetting.fontSize}pt`,
                        'font-family': legendSetting.fontFamily,
                        'font-weight': 600
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

        // tslint:disable-next-line:no-any
        public getTooltipData(value: any, isMean: number): VisualTooltipDataItem[] {
            const tooltipDataPoints: VisualTooltipDataItem[] = [];
            if (isMean === 1) {
                for (const iCounter of value.tooltipData) {
                    if ( iCounter.name === 'Mean') {
                        const tooltipData: VisualTooltipDataItem = {
                            displayName: '',
                            value: ''
                        };
                        tooltipData.displayName = iCounter.name;
                        tooltipData.value = iCounter.value;
                        tooltipDataPoints.push(tooltipData);
                    }
                }
            } else {
                for (const iCounter of value.tooltipData) {
                    const tooltipData: VisualTooltipDataItem = {
                        displayName: '',
                        value: ''
                    };
                    tooltipData.displayName = iCounter.name;
                    tooltipData.value = iCounter.value;
                    tooltipDataPoints.push(tooltipData);
                }
            }

            return tooltipDataPoints;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const objectName: string = options.objectName;
            const objectEnumeration: VisualObjectInstance[] = [];
            const parentAxisConfigs: IParentAxisSettings = this.parentAxisConfigs;
            const flipSetting: IFlipSettings = this.flipSetting;
            const sortSetting: ISortSettings = this.sortSetting;
            const yAxisConfigs: IAxisSettings = this.yAxisConfig;
            const xAxisConfigs: IAxisSettings = this.xAxisConfig;
            const rangeSetting: IRangeSettings = this.rangeConfig;
            const legendConfig: ILegendConfig = this.legendSetting;
            const gradientSelectorSetting: IGradientSelectorSettings = this.gradientSetting;
            const backgroundSetting: IBackgroundSettings = this.backgroundSetting;
            const gridLinesSetting: IGridLinesSettings = this.gridLinesSetting;
            const tickSetting: ITickSettings = this.tickSetting;
            const boxOptionsSetting: IBoxOptionsSettings = this.boxOptionsSetting;
            const meanSetting: IMeanSettings = this.meanSetting;

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
                case 'sort':
                    enumSettings.enumerateSort(sortSetting, objectEnumeration, objectName, Visual.catGroupPresent, Visual.xParentPresent);
                    break;
                case 'boxOptions':
                    enumSettings.enumerateBoxOptions(boxOptionsSetting, objectEnumeration, objectName);
                    break;
                case 'meanConfig':
                    enumSettings.enumerateMean(meanSetting, objectEnumeration, objectName);
                    break;
                default:
            }

            return objectEnumeration;
        }
    }
}
