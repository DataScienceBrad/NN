module powerbi.extensibility.visual {

    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import SelectionManager = powerbi.extensibility.ISelectionManager;
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import IDataColorPalette = powerbi.extensibility.IColorPalette;

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): IHFViewModel {
        let dataViews = options.dataViews;
        let viewModel: IHFViewModel = {
            hfDataPoints: [],
            bowtieDataPoint: [],
            primaryValMax: 0,
            secondaryValMax: 0,
            primaryMeasureName: '',
            secondaryMeasureName: '',
            primaryExists: false,
            secondaryExists: false,
            categoryExists: false,
            subCategoryExists: false,
            primaryFormatter: '',
            secondaryFormatter: '',
            hfTotalDataPoints: []
        };
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.values) {
            return viewModel;
        }
        let categorical = dataViews[0].categorical;
        let subCategoryIndex: number = 0;
        let categoryExists: boolean = false;
        let dataView: DataView = dataViews[0];
        const groups: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();
        let hfDataPoints: IHFDataPoint[] = [];
        let colorPalette: IColorPalette = host.colorPalette;
        let primaryValMax: number = 0;
        let secondaryValMax: number = 0;
        let primaryMeasureName: string = '';
        let isPMExists: boolean = false;
        let secondaryMeasureName: string = '';
        let isSMExists: boolean = false;
        let scExists: boolean = false;
        let uniqueSubCategories = [];
        let primaryFormatter;
        let secondaryFormatter;
        let subCategorySource = "";

        let grouped = dataView.categorical.values.grouped();
        if (grouped.length > 1) {
            for (let dataViewColumn of dataView.metadata.columns) {
                if (dataViewColumn.roles['subCategory']) {                                        
                    subCategorySource = dataViewColumn.displayName;
                    break;
                }
            }
            let legendDataPoints = grouped.map((group: DataViewValueColumnGroup, index) => {
                let defaultColor: Fill = {
                    solid: {
                        color: colorPalette.getColor(group.identity.key).value
                    }
                };

                return {
                    category: group.name as string,
                    color: enumSettings.DataViewObjects
                        .getValueOverload<Fill>(group.objects, 'dataPoint', 'fill', defaultColor).solid.color,
                    identity: host.createSelectionIdBuilder()
                        .withSeries(dataView.categorical.values, group)
                        .createSelectionId()
                };
            });

            groups.forEach((group) => {
                for (let i = 0; i < group.values[0].values.length; i++) {
                    if (group.values[0].values[i] !== null) {
                        let hfDataPoint: IHFDataPoint = {
                            primaryVal: 0,
                            secondaryVal: 0,
                            category: '',
                            subCategory: '',
                            color: '',
                            selectionId: null,
                            tooltipData: []
                        };

                        scExists = true;
                        hfDataPoint.subCategory = group.name ? group.name.toString() : '';
                        if (!!hfDataPoint.subCategory
                            && hfDataPoint.subCategory !== ''
                            && uniqueSubCategories.indexOf(hfDataPoint.subCategory) < 0) {
                            uniqueSubCategories.push(hfDataPoint.subCategory);
                        }
                        // ignoring the category for tooltips
                        let tooltipDataPoint: ITooltipDataPoints = {
                            formatter: '',
                            name: subCategorySource,
                            value: hfDataPoint.subCategory
                        };
                        hfDataPoint.tooltipData.push(tooltipDataPoint);
                        let catlength = (dataViews[0].categorical && dataViews[0].categorical.categories) ? dataViews[0].categorical.categories.length : 0;
                        for (let cat1 = 0; cat1 < catlength; cat1++) {
                            let dataView: DataView = dataViews[0];
                            if (dataView.categorical.categories[cat1].source.roles['category']) {
                                hfDataPoint.category = dataView.categorical.categories[cat1].values[i] ?
                                    (dataView.categorical.categories[cat1].values[i].toString()) : '';
                                categoryExists = true;
                            }
                        }

                        for (let k = 0; k < group.values.length; k++) {
                            let dataView: DataView = dataViews[0];
                            if (group.values[k].source.roles['primaryMeasure']) {
                                primaryMeasureName = group.values[k].source.displayName;
                                primaryFormatter = group.values[k].source.format ?
                                    group.values[k].source.format : ValueFormatter.DefaultNumericFormat;
                                hfDataPoint.primaryVal = (Number(group.values[k].values[i]));
                                if (!categoryExists) {
                                    primaryValMax = primaryValMax < hfDataPoint.primaryVal ? hfDataPoint.primaryVal : primaryValMax;
                                }
                                isPMExists = true;
                            }
                            if (group.values[k].source.roles['secondaryMeasure']) {
                                secondaryMeasureName = group.values[k].source.displayName;
                                secondaryFormatter = group.values[k].source.format ? group.values[k].source.format : ValueFormatter.DefaultNumericFormat;
                                hfDataPoint.secondaryVal = (Number(group.values[k].values[i]));
                                if (!categoryExists) {
                                    secondaryValMax = secondaryValMax < hfDataPoint.secondaryVal ? hfDataPoint.secondaryVal : secondaryValMax;
                                }
                                isSMExists = true;
                            }
                            let tooltipDataPoint: ITooltipDataPoints = {
                                formatter: !!group.values[k].source.format ? group.values[k].source.format : ValueFormatter.DefaultIntegerFormat,
                                name: group.values[k].source.displayName,
                                value: group.values[k].values[i] ? (group.values[k].values[i].toString()) : ''
                            };
                            hfDataPoint.tooltipData.push(tooltipDataPoint);
                        }

                        hfDataPoint.color = getColor(legendDataPoints, hfDataPoint.subCategory);
                        hfDataPoint.selectionId = getSelectionId(legendDataPoints, hfDataPoint.subCategory);
                        hfDataPoints.push(hfDataPoint);
                    }
                }
            });
        }

        // Aggregate the primary and secondary values based on sub category
        let hfDataPointFinal: IHFDataPoint[] = [];
        if (categoryExists) {
            for (let i = 0; i < uniqueSubCategories.length; i++) {
                let primarySum = 0;
                let secondarySum = 0;
                let hfData: IHFDataPoint = {
                    primaryVal: 0,
                    secondaryVal: 0,
                    subCategory: '',
                    category: '',
                    color: '',
                    selectionId: null,
                    tooltipData: []
                }

                for (let j = 0; j < hfDataPoints.length; j++) {
                    if (uniqueSubCategories[i] === hfDataPoints[j].subCategory) {
                        primarySum += hfDataPoints[j].primaryVal;
                        secondarySum += hfDataPoints[j].secondaryVal;
                        hfData.subCategory = hfDataPoints[j].subCategory;
                        hfData.color = hfDataPoints[j].color;
                        hfData.selectionId = hfDataPoints[j].selectionId;
                        // handling tooltip aggregated values
                        if (hfDataPoints[j].tooltipData
                            && hfDataPoints[j].tooltipData[1]
                            && hfDataPoints[j].tooltipData[1].value) {
                            hfDataPoints[j].tooltipData[1].value = primarySum.toString();
                        }
                        if (hfDataPoints[j].tooltipData
                            && hfDataPoints[j].tooltipData[2]
                            && hfDataPoints[j].tooltipData[2].value) {
                            hfDataPoints[j].tooltipData[2].value = secondarySum.toString();
                        }
                        hfData.tooltipData = hfDataPoints[j].tooltipData;
                    }
                }
                primaryValMax = primaryValMax < primarySum ? primarySum : primaryValMax;
                secondaryValMax = secondaryValMax < secondarySum ? secondarySum : secondaryValMax;
                hfData.primaryVal = primarySum;
                hfData.secondaryVal = secondarySum;
                hfDataPointFinal.push(hfData);
            }
        } else {
            // Remove if sub category is empty
            hfDataPointFinal = hfDataPoints.filter(function (ele) {
                return ele.subCategory !== '';
            });
        }
        let bowtieDataPoints: IBowtieDataPoint[] = [];
        if (categoryExists) {
            // Create mapping for category and sub category for bowtie
            let arrCategory = [];
            for (let i = 0; i < hfDataPoints.length; i++) {
                let bowtieDataPoint: IBowtieDataPoint = {
                    source: '',
                    destination: '',
                    value: 0,
                    SourceArcWidth: 0
                }
                if (!!hfDataPoints[i].category
                    && hfDataPoints[i].subCategory !== ''
                    && hfDataPoints[i].category !== ''
                    && arrCategory.indexOf(hfDataPoints[i].category) < 0) {
                    arrCategory.push(hfDataPoints[i].category);
                    bowtieDataPoint.source = hfDataPoints[i].category;
                    bowtieDataPoint.destination = hfDataPoints[i].subCategory;
                    bowtieDataPoint.value = hfDataPoints[i].primaryVal;
                    bowtieDataPoints.push(bowtieDataPoint);
                }
            }
        }
        viewModel.hfDataPoints = hfDataPointFinal;
        viewModel.hfTotalDataPoints = hfDataPoints;
        viewModel.bowtieDataPoint = bowtieDataPoints;
        viewModel.primaryValMax = primaryValMax;
        viewModel.secondaryValMax = secondaryValMax;
        viewModel.primaryExists = isPMExists;
        viewModel.secondaryExists = isSMExists;
        viewModel.categoryExists = categoryExists;
        viewModel.subCategoryExists = scExists;
        viewModel.primaryMeasureName = primaryMeasureName;
        viewModel.secondaryMeasureName = secondaryMeasureName;
        viewModel.primaryFormatter = primaryFormatter;
        viewModel.secondaryFormatter = secondaryFormatter;
        return viewModel;
    }

    function getColor(legendDataPoints, name): string {
        let color = "";
        legendDataPoints.forEach(element => {
            if (element.category === name)
                color = element.color;
        });
        return color;
    }

    function getSelectionId(legendDataPoints, name): powerbi.visuals.ISelectionId {
        let selectionId = null;
        legendDataPoints.forEach(element => {
            if (element.category === name)
                selectionId = element.identity;
        });
        return selectionId;
    }

    export class HorizontalFunnel implements IVisual {
        public host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private root: d3.Selection<SVGElement>;
        private dataView: DataView;
        private style: any;
        private colors: IDataColorPalette;
        private selectionManager: SelectionManager;
        private dataViewModel: IHFViewModel;
        private filterName: string;
        private filterID: string;

        private ColorLuminance(hex) {
            let lum = 0.50;
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;

            // convert to decimal and change luminosity
            let rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }

            return rgb;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let enumeration: VisualObjectInstance[] = [];

            let labelSettings: ILabelSettings = enumSettings.getDataLabelSettings(this.dataView);
            let gradientColors: IGradientColors = enumSettings.getGradientColors(this.dataView);
            let secondaryLabelSettings: ILabelSettings = enumSettings.getSMLabelSettings(this.dataView);

            switch (options.objectName) {
                case 'dataPoint':
                    for (let hfDataPoint of this.dataViewModel.hfDataPoints) {
                        enumeration.push({
                            objectName: 'dataPoint',
                            displayName: hfDataPoint.subCategory,
                            properties: {
                                fill: {
                                    solid: {
                                        color: hfDataPoint.color
                                    }
                                }
                            },
                            selector: hfDataPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case 'labels':
                    enumeration.push({
                        objectName: 'labels',
                        properties: {
                            fontColor: labelSettings.color,
                            labelDisplayUnits: labelSettings.displayUnits,
                            labelPrecision: labelSettings.decimalPlaces
                        },
                        selector: null
                    });
                    break;

                case 'secondaryLabels':
                    if (this.dataViewModel && this.dataViewModel.secondaryExists) {
                        enumeration.push({
                            objectName: 'secondaryLabels',
                            properties: {
                                fontColor: secondaryLabelSettings.color,
                                labelDisplayUnits: secondaryLabelSettings.displayUnits,
                                labelPrecision: secondaryLabelSettings.decimalPlaces
                            },
                            selector: null
                        });
                    }
                    break;
                case 'gradientColors':
                    enumeration.push({
                        objectName: 'gradientColors',
                        properties: {
                            minColor: gradientColors.minColor,
                            maxColor: gradientColors.maxColor
                        },
                        selector: null
                    });
                    break;
                default:
                    break;
            }
            return enumeration;
        }


        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let tooltipDataPointsFinal: VisualTooltipDataItem[] = [];
            let tooltipData = value.tooltipData;
            let dataLen = tooltipData.length;
            for (let i = 0; i < dataLen; i++) {
                let tooltipDataItem: VisualTooltipDataItem = {
                    displayName: '',
                    value: ''
                };
                tooltipDataItem.displayName = tooltipData[i].name;

                if (isNaN(tooltipData[i].value)) {
                    tooltipDataItem.value = tooltipData[i].value;
                } else {
                    tooltipData[i].value = tooltipData[i].value === '' ? '0' : tooltipData[i].value;
                    let decimalPlaces: number = VisualUtils.getDecimalPlacesCount(tooltipData[i].value);
                    let formattingString = tooltipData[i].formatter
                        ? tooltipData[i].formatter : ValueFormatter.DefaultNumericFormat;
                    let formatter = ValueFormatter.create({
                        format: formattingString,
                        value: 0,
                        precision: decimalPlaces
                    });
                    tooltipDataItem.value = formatter.format(parseFloat(tooltipData[i].value));
                }
                tooltipDataPointsFinal.push(tooltipDataItem);
            }
            return tooltipDataPointsFinal;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.style = options.element.style;
            let cPalette: any = options.host.colorPalette;
            this.colors = cPalette.colors;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.selectionManager = options.host.createSelectionManager();
            this.filterName = "";
            this.filterID = "";
        }

        public renderBowtie(viewport): void {
            let bowTieHeight = viewport.height;
            let bowTieWidth = viewport.width * 0.2;
            // code to create bow tie chart
            let bowTieData = this.dataViewModel && this.dataViewModel.bowtieDataPoint ? this.dataViewModel.bowtieDataPoint : [];
            let gradientColorSetting: IGradientColors = enumSettings.getGradientColors(this.dataView);
            if (bowTieData.length) {
                this.root.append('div')
                    .classed('hfb_bowtie', true)
                    .style({
                        height: bowTieHeight + 'px',
                        width: bowTieWidth + 'px',
                        float: 'left'
                    });
                let availableHeight = viewport.height;
                let bowtieDiv = this.root.select('.hfb_bowtie');
                bowtieDiv.append('div')
                    .classed('bowtie_labels', true)
                    .style({ width: bowTieWidth / 2 + 'px', height: availableHeight + 'px' });
                let BowtieSVG = bowtieDiv.append('div')
                    .classed('bowtie_arcs', true)
                    .style({ width: bowTieWidth / 2 + 'px', height: availableHeight + 'px' });
                let numberOfCategories = bowTieData.length;
                let divisionHeight = viewport.height / numberOfCategories;
                for (let i = 0; i < numberOfCategories; i++) {
                    if (bowTieData[i] && bowTieData[i].source) {
                        let sourceVal = bowTieData[i].source;
                        let textProps: TextProperties = {
                            text: sourceVal,
                            fontFamily: 'SEGOE UI',
                            fontSize: '12px'
                        }
                        let maxWidth = (bowTieWidth / 2) * 0.7;
                        let trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, maxWidth);
                        let labelItem = this.root.select('.hfb_bowtie .bowtie_labels')
                            .append('div')
                            .style({
                                height: divisionHeight + 'px',
                                width: (bowTieWidth / 2) + 'px'
                            });

                        // adding the circles of the labels
                        labelItem
                            .append('span')
                            .style({
                                height: divisionHeight + 'px',
                                width: '15px'
                            })
                            .attr('title', sourceVal)
                            .classed('hfbowtie_labelItem', true)
                            .attr('id', 'hfb_label_' + i + '$$circle')
                            .append('svg')
                            .classed('hfb_circle', true)
                            .style({
                                height: divisionHeight + 'px',
                                width: '15px'
                            })
                            .append('circle')
                            .attr('id', 'hfb_label_' + i + '_circle')
                            .classed('hfb_circle', true)
                            .attr({
                                'r': 5,
                                stroke: 'rgb(1, 184, 170)',
                                fill: '#FFF',
                                cy: divisionHeight / 2,
                                cx: 5.5
                            });

                        // adding the labels
                        labelItem.append('span')
                            .text(trimmedText)
                            .attr('title', sourceVal)
                            .style({
                                'line-height': divisionHeight + 'px',
                                'margin-right': '5px',
                                'font-size': '12px'
                            })
                            .classed('hfbowtie_labelItem', true)
                            .attr('id', 'hfb_label_' + i + '$$label');
                    }
                }

                let fStartX = 0;
                let fStartY = 0;
                let fBranchHeight = 50;
                let fEndX = bowTieWidth / 2;
                let fEndY = availableHeight / 2 - fBranchHeight / 2;
                let fCurveFactor = 0.25;
                let sum = 0, aggregatedSum = 0;
                bowTieData.forEach(function (value) {
                    aggregatedSum += value.value;
                })
                bowTieData.forEach(function (value) {
                    value.SourceArcWidth = value.value / aggregatedSum;
                })
                // Creating SVG 
                let svg = BowtieSVG.append('svg')
                    .style('height', availableHeight + 'px');

                // Code for SVG Path
                for (let iDiv = 0; iDiv < numberOfCategories; iDiv++) {
                    //for (let iDiv = numberOfCategories; iDiv < 0; iDiv++) {
                    let percentage = bowTieData[iDiv].value / aggregatedSum;
                    let height1 = (bowTieData[iDiv].SourceArcWidth * fBranchHeight);
                    fStartY = ((iDiv) * divisionHeight) + divisionHeight / 2;// - height1 / 2;
                    let fPipeArea = Math.abs(fStartX - fEndX);
                    height1 = height1 > 1 ? height1 : 1;
                    fEndY += (height1 / 2);

                    if (iDiv > 0) {
                        if ((bowTieData[iDiv - 1].SourceArcWidth * fBranchHeight) > 1) {
                            fEndY += ((bowTieData[iDiv - 1].SourceArcWidth * fBranchHeight) / 2);
                        }
                        else {
                            fEndY += 0.5;
                        }
                    }
                    let d = 'M ' + fStartX + ' ' + fStartY + ' C ' + (fEndX - (fPipeArea * fCurveFactor)) + ' ' + fStartY +
                        ' ' + (fStartX + (fPipeArea * fCurveFactor)) + ' ' + fEndY + ' ' + fEndX + ' ' + fEndY;

                    // Gradient colors
                    let minGradientValue = 9999999999999;
                    let maxGradientValue = 0;
                    bowTieData.forEach(element => {
                        if (!!element && !!element.value) {
                            let eleValue = element.value.toString();
                            if (parseFloat(eleValue) < minGradientValue) {
                                minGradientValue = parseFloat(eleValue);
                            }
                            if (parseFloat(eleValue) > maxGradientValue) {
                                maxGradientValue = parseFloat(eleValue);
                            }
                        }

                    });
                    let colorScale = d3.scale.linear()
                        .domain([minGradientValue, maxGradientValue])
                        .range([0, 1]);
                    let colors = d3.interpolateRgb(gradientColorSetting.minColor, gradientColorSetting.maxColor);
                    let arcColor = colors(colorScale(bowTieData[iDiv].value));
                    let path = svg
                        .append('path')
                        .attr('d', d)
                        .attr('title', bowTieData[iDiv].source)
                        .classed('hfbowtie_labelItem', true)
                        .attr('id', 'hfb_label_' + iDiv + '$$arc')
                        .attr('stroke', arcColor)
                        .attr('fill', 'none')
                        .attr('stroke-width', height1)
                        .append('title')
                        .text(bowTieData[iDiv].source);

                    // adding gradient color to the label circles
                    let labelCircle = $('.hfbowtie_labelItem #hfb_label_' + iDiv + '_circle');
                    if (labelCircle && labelCircle.length) {
                        labelCircle.attr('stroke', arcColor);
                    }
                }
            }
        }

        public update(options: VisualUpdateOptions) {
            let host = this.host;
            if (!options.dataViews
                || (options.dataViews.length < 1)
                || !options.dataViews[0]
                || !options.dataViews[0].categorical)
                return;
            let dataView = this.dataView = options.dataViews[0],
                ymax: number,
                index: number = 0,
                percentageVal = [],
                dimension: string,
                color: any,
                fontsize,
                viewport,
                catLength: number,
                parentWidth: number,
                parentHeight: number,
                width: number,
                height: number,
                element: d3.Selection<SVGElement>,
                classname: string,
                oddsvg: d3.Selection<SVGElement>,
                y: number, val: number = 1,
                evensvg: d3.Selection<SVGElement>,
                nextyheight: number,
                prevyheight: number,
                areafillheight = [],
                visualHeight: number;

            let labelSettings: ILabelSettings = enumSettings.getDataLabelSettings(this.dataView);
            let SMLabelSettings: ILabelSettings = enumSettings.getSMLabelSettings(this.dataView);

            this.dataViewModel = visualTransform(options, this.host);

            this.root.selectAll('div').remove();
            if (!this.dataViewModel.primaryExists || !this.dataViewModel.subCategoryExists) {
                this.root.append('div').text('Please select Sub Category and Primary Measure Values');
                return;
            } else if (this.dataViewModel.primaryValMax === 0) {
                this.root.append('div').text('No data');
                return;
            }
            let This = this;
            viewport = options.viewport;

            let originalValues: IHFDataPoint[] = [];
            originalValues = jQuery.extend([{}], This.dataViewModel.hfDataPoints);

            let originalMaxValue = this.dataViewModel.primaryValMax;

            // Render the bowtie chart only if Category exists
            if (this.dataViewModel.categoryExists) {
                this.renderBowtie(viewport);
            }

            renderVisual(this.filterName, this.filterID);

            function renderVisual(filterName: string, filterID: string) {
                This.root.selectAll('div.hf_parentdiv').remove();
                index = 0;
                percentageVal = [];
                areafillheight = [];
                val = 1;

                catLength = This.dataViewModel.hfDataPoints.length;

                if (This.dataViewModel.categoryExists) {
                    if (filterName.length) {
                        let filteredData = This.dataViewModel.hfTotalDataPoints.filter(function (obj) {
                            return obj.category.toLowerCase() === filterName;
                        });

                        let arrUpdated = [];
                        This.dataViewModel.hfDataPoints.forEach(function (obj, arrIndex) {
                            for (let k = 0; k < filteredData.length; k++) {
                                if (obj.subCategory === filteredData[k].subCategory) {
                                    obj.primaryVal = filteredData[k].primaryVal;
                                    obj.secondaryVal = filteredData[k].secondaryVal;
                                    if (!!obj.tooltipData[1]
                                        && obj.tooltipData[1].value) {
                                        obj.tooltipData[1].value = filteredData[k].primaryVal.toString();
                                    }
                                    if (!!obj.tooltipData[2]
                                        && obj.tooltipData[2].value) {
                                        obj.tooltipData[2].value = filteredData[k].secondaryVal.toString();
                                    }
                                    arrUpdated.push(arrIndex);
                                }
                            }
                        });
                        let primaryValues = [];

                        This.dataViewModel.hfDataPoints.forEach(function (obj, arrIndex) {
                            if (arrUpdated.indexOf(arrIndex) < 0) {
                                obj.primaryVal = 0;
                                obj.secondaryVal = 0;
                            }
                            primaryValues.push(obj.primaryVal);
                        });
                        This.dataViewModel.primaryValMax = Math.max.apply(null, primaryValues);
                    } else {
                        // This.dataViewModel.hfDataPoints = originalValues;
                        // Update this section
                        This.dataViewModel.hfDataPoints = visualTransform(options, This.host).hfDataPoints;
                        // This.dataViewModel.hfDataPoints = jQuery.extend([{}], originalValues);
                        This.dataViewModel.primaryValMax = originalMaxValue;
                    }
                }

                parentWidth = viewport.width * 0.99;

                if (This.dataViewModel.categoryExists) {
                    parentWidth = viewport.width * 0.79; // leaving 20% width for Bowtie
                }
                parentHeight = viewport.height;

                width = parentWidth / (1.4 * catLength);
                if (parentHeight >= 65) {
                    visualHeight = parentHeight - 65;
                } else {
                    visualHeight = 65 - parentHeight;
                }

                let textProperties: TextProperties = {
                    text: 'A',
                    fontFamily: 'SEGOE UI',
                    fontSize: '12px'
                }
                let textHeight = TextMeasurementService.measureSvgTextHeight(textProperties);

                // here 3 and 5 are number of lines of labels
                if (This.dataViewModel.secondaryExists) {
                    height = parentHeight * 0.9 - 5 * textHeight > 0 ? parentHeight * 0.9 - 5 * textHeight : 0;
                } else {
                    height = parentHeight * 0.9 - 3 * textHeight > 0 ? parentHeight * 0.9 - 3 * textHeight : 0;
                }

                ymax = This.dataViewModel.primaryValMax;

                This.root.append('div')
                    .style({
                        'width': parentWidth + 'px',
                        'height': parentHeight + 'px'
                    })
                    .classed('hf_parentdiv', true);

                for (let j = 0; j < This.dataViewModel.hfDataPoints.length; j++) {
                    if (This.dataViewModel.hfDataPoints[j].primaryVal == 0) {
                        percentageVal.push(-1);
                    }
                    else {
                        if (ymax - This.dataViewModel.hfDataPoints[j].primaryVal > 0) {
                            percentageVal.push(((This.dataViewModel.hfDataPoints[j].primaryVal * 100) / ymax));
                        }
                        else {
                            percentageVal.push(0);
                        }
                    }
                }
                fontsize = 12;
                color = labelSettings.color;
                let labelDisplayUnits = labelSettings.displayUnits;
                let labelDecimalPlaces = labelSettings.decimalPlaces;

                let SMColor = SMLabelSettings.color;
                let SMDisplayUnits = SMLabelSettings.displayUnits;
                let SMDecimalPlaces = SMLabelSettings.decimalPlaces;

                let flag = 0;
                for (let i = 0; i < (2 * catLength - 1); i++) {
                    element = This.root.select('.hf_parentdiv')
                        .append('div')
                        .style({ 'height': parentHeight + 'px' })
                        .classed('hf_svg hf_parentElement', true);
                    let constantMultiplier = 1;
                    if (catLength > 0) {
                        constantMultiplier = 4 / (5 * catLength - 3); // dividing the available space into equal parts
                    }
                    width = (parentWidth - 20) * constantMultiplier; // remove 10 from total width as 10 is x displacement

                    if (i % 2 === 0) {
                        classname = 'hf_odd' + i;
                        //code to add sub category name
                        let textProps: TextProperties = {
                            text: This.dataViewModel.hfDataPoints[index].subCategory,
                            fontFamily: 'segoe ui',
                            fontSize: fontsize + 'px'
                        }
                        let trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, width - 10);

                        element.append('div')
                            .style({
                                'color': color,
                                'font-size': fontsize + 'px',
                                'width': 0.92 * width + 'px',
                                height: textHeight + 'px'
                            })
                            .classed('hf_legend_item' + i + ' hf_xAxisLabels', true)
                            .classed('hf_legend', true)
                            .text(trimmedText)
                            .attr('title', This.dataViewModel.hfDataPoints[index].subCategory);

                        //code to add Primary Measure column name
                        textProps = {
                            text: This.dataViewModel.primaryMeasureName,
                            fontFamily: 'segoe ui',
                            fontSize: fontsize + 'px'
                        }
                        trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, width - 10);

                        element.append('div')
                            .style({
                                'color': color,
                                'font-size': fontsize + 'px',
                                'width': 0.92 * width + 'px'
                            })
                            .classed('hf_legend_item' + i + ' hf_xAxisMeasure', true)
                            .classed('hf_legend', true)
                            .text(trimmedText)
                            .attr('title', This.dataViewModel.primaryMeasureName);

                        //code to add Primary Measure value
                        let formattedValue = VisualUtils.getFormattedData(
                            This.dataViewModel.hfDataPoints[index].primaryVal,
                            This.dataViewModel.primaryFormatter,
                            labelSettings.displayUnits,
                            labelSettings.decimalPlaces,
                            ymax);
                        textProps = {
                            text: formattedValue,
                            fontFamily: 'segoe ui',
                            fontSize: fontsize + 'px'
                        }
                        trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, width - 10);
                        let defaultDecimalPlaces = VisualUtils.getDecimalPlacesCount(This.dataViewModel.hfDataPoints[index].primaryVal);
                        let formattedTooltipVal = VisualUtils.getFormattedData(
                            This.dataViewModel.hfDataPoints[index].primaryVal,
                            This.dataViewModel.primaryFormatter,
                            1,
                            defaultDecimalPlaces,
                            ymax
                        );
                        element.append('div')
                            .style({
                                'color': color,
                                'font-size': fontsize + 'px',
                                'width': width
                            })
                            .classed('hf_legend_value1' + i, true)
                            .classed('hf_legend', true)
                            .text(trimmedText)
                            .attr('title', formattedTooltipVal);

                        let displacement = i === 0 ? 0 : 10;
                        element
                            .append('svg')
                            .attr({
                                'id': i,
                                height: height,
                                width: width,
                                fill: '#FAFAFA'
                            }).classed(classname, true)
                            .append('rect')
                            .attr({
                                x: 10,
                                y: 0,
                                height: height,
                                width: width
                            });

                        // code to create inner rectangle
                        oddsvg = This.root.select('.' + classname);
                        if (percentageVal[index] !== 0 && percentageVal[index] !== -1) {
                            percentageVal[index] = parseFloat(percentageVal[index]);
                            y = 0;
                            y = ((height - (percentageVal[index] * height / 100)) / 2);
                            areafillheight.push(percentageVal[index] * height / 100);
                            let disp = 10;
                            oddsvg.append('rect')
                                .attr({
                                    x: disp,
                                    y: y,
                                    height: areafillheight[index] > 1 ? areafillheight[index] : 1,
                                    width: width
                                }).classed('hf_datapoint hf_dataColor', true);
                        } else {
                            let disp = 10;
                            if (percentageVal[index] === 0) {
                                oddsvg.append('rect')
                                    .attr({
                                        x: disp,
                                        y: 0,
                                        height: height,
                                        width: width
                                    }).classed('hf_datapoint hf_dataColor', true);
                            } else if (percentageVal[index] === -1) {
                                // showing dotted line if there is no data      
                                y = ((height - (percentageVal[index] * height / 100)) / 2);//-10
                                oddsvg.append('line')
                                    .attr({
                                        x1: disp,
                                        y1: y,
                                        x2: width,
                                        y2: y,
                                        'stroke-width': 1,
                                    }).classed('hf_datapoint hf_dataColor', true)
                                    .style({ "stroke-dasharray": "1,2", "stroke": "black" });
                            }
                            areafillheight.push(0);
                        }

                        // code to add secondary measure value
                        if (This.dataViewModel.secondaryExists) {
                            let smMaxVal = This.dataViewModel.secondaryValMax;
                            // secondary measure name
                            textProps = {
                                text: This.dataViewModel.secondaryMeasureName,
                                fontFamily: 'segoe ui',
                                fontSize: fontsize + 'px'
                            }
                            trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, width - 10);

                            element.append('div')
                                .style({
                                    'color': SMColor,
                                    'font-size': fontsize + 'px',
                                    'width': width - (0.08 * width) + 'px'
                                })
                                .classed('hf_legend_item' + i + ' hf_xAxisSMName', true)
                                .classed('hf_legend', true)
                                .text(trimmedText)
                                .attr('title', This.dataViewModel.secondaryMeasureName);

                            // secondary measure value
                            formattedValue = VisualUtils.getFormattedData(
                                This.dataViewModel.hfDataPoints[index].secondaryVal,
                                This.dataViewModel.secondaryFormatter,
                                SMDisplayUnits,
                                SMDecimalPlaces,
                                smMaxVal);
                            textProps = {
                                text: formattedValue,
                                fontFamily: 'segoe ui',
                                fontSize: fontsize + 'px'
                            }
                            trimmedText = TextMeasurementService.getTailoredTextOrDefault(textProps, width - 10);
                            defaultDecimalPlaces = VisualUtils.getDecimalPlacesCount(This.dataViewModel.hfDataPoints[index].secondaryVal);
                            formattedTooltipVal = VisualUtils.getFormattedData(
                                This.dataViewModel.hfDataPoints[index].secondaryVal,
                                This.dataViewModel.secondaryFormatter,
                                1,
                                defaultDecimalPlaces,
                                smMaxVal);
                            element.append('div')
                                .style({
                                    'color': SMColor,
                                    'font-size': fontsize + 'px',
                                    'width': width - (0.08 * width) + 'px'
                                })
                                .classed('hf_legend_item' + i + ' hf_xAxisSMName', true)
                                .classed('hf_legend', true)
                                .text(trimmedText)
                                .attr('title', formattedTooltipVal);
                        }
                        index++;
                    } else {
                        let connectorCount = 2 * (catLength - 3); // do not create the connector for last 2 bars
                        if (i < connectorCount) {
                            // creating elements for connectors
                            element
                                .append('div')
                                .classed('hf_connectors', true)
                                .style('height', 3 * textHeight + 'px');

                            classname = 'hf_even' + i;
                            let disp = 10;
                            element
                                .append('svg')
                                .attr({
                                    'id': i,
                                    height: height,
                                    width: width / 4,
                                    fill: '#FFF'
                                })
                                .classed(classname, true)
                                .append('rect')
                                .attr({
                                    x: disp,
                                    y: 0,
                                    height: height,
                                    width: width / 4
                                });
                        } else {
                            if (flag === 0) {
                                element
                                    .append('div')
                                    .classed('hf_connectors', true)
                                    .classed('hf_connectorLine', true)
                                    .style('height', parentHeight + 'px');

                                flag++;
                            }
                        }
                    }
                }
                // code to draw connectors
                for (let i = 0; i < percentageVal.length - 2; i++) {
                    let polygonColor;
                    polygonColor = This.ColorLuminance(This.dataViewModel.hfDataPoints[i].color);
                    classname = '.hf_even' + val;
                    evensvg = This.root.select(classname);
                    if (percentageVal[i] === 0 && percentageVal[i + 1] === 0) {
                        evensvg.append('rect')
                            .attr({
                                x: 10,
                                y: 0,
                                height: height,
                                width: width / 4,
                                fill: polygonColor
                            });
                    }
                    else {
                        nextyheight = (height - areafillheight[i + 1]) / 2;
                        prevyheight = (height - areafillheight[i]) / 2;
                        let disp = 10;
                        let prevFill = areafillheight[i] > 1 ? areafillheight[i] : 1;
                        let nextFill = areafillheight[i + 1] > 1 ? areafillheight[i + 1] : 1;
                        if (percentageVal[i] && percentageVal[i + 1]) {
                            dimension = disp + "," + prevyheight + " " + disp + "," + (prevFill + prevyheight) + " " + (width / 4) + "," + (nextFill + nextyheight) + " " +
                                (width / 4) + "," + nextyheight;
                        }
                        else if (percentageVal[i] && !(percentageVal[i + 1])) {
                            dimension = disp + "," + prevyheight + " " + disp + "," + (prevFill + prevyheight) + " " + (width / 4) + "," + height + " " + (width / 4) + "," + 0;
                        }
                        else if (!(percentageVal[i]) && percentageVal[i + 1]) {
                            dimension = disp + "," + 0 + " " + disp + "," + (height) + " " + (width / 4) + "," + (nextFill + nextyheight) + " " + (width / 4) + "," + nextyheight;
                        }

                        evensvg.append('polygon')
                            .attr('points', dimension)
                            .attr({
                                fill: polygonColor
                            });
                    }
                    val += 2;
                }

                // coloring the bars
                This.root.selectAll('.hf_dataColor').style('fill', (d, colorIndex) => This.dataViewModel.hfDataPoints[colorIndex].color);

                // adding tooltip to the bars
                let rectBars = This.root.selectAll('.hf_datapoint').data(This.dataViewModel.hfDataPoints);
                This.tooltipServiceWrapper
                    .addTooltip(
                    This.root.selectAll('.hf_datapoint'),
                    (tooltipEvent: TooltipEventArgs<number>) => This.getTooltipData(tooltipEvent.data),
                    (tooltipEvent: TooltipEventArgs<number>) => null
                    );

                // adding selection manager feature on click of the bars
                let selectionManager = This.selectionManager;
                rectBars.on('click', function (d) {
                    selectionManager.select(d.selectionId).then((ids: any[]) => {
                        rectBars.attr({
                            'fill-opacity': ids.length > 0 ? 0.5 : 1
                        });
                        d3.select(this).attr({
                            'fill-opacity': 1
                        });
                    });

                    (<Event>d3.event).stopPropagation();
                });

                This.root.on("click", () => {
                    This.selectionManager.clear();
                    This.root.selectAll('.hf_datapoint').attr('fill-opacity', 1);
                });
                if (This.dataViewModel.categoryExists) {
                    if (This.filterID !== '') {
                        let selectedCircleString = This.filterID.split('$$');
                        let selectedCircle;
                        if (selectedCircleString.length) {
                            selectedCircle = selectedCircleString[0];
                        }
                        $('.hfb_circle#' + selectedCircle + '_circle').addClass('hfb_selectedCircle');
                    }
                    let bowtieLabelItems = This.root.selectAll('.hfbowtie_labelItem');
                    bowtieLabelItems.on('click', function () {
                        // logic for hightlighting the selected category
                        $('circle.hfb_circle').removeClass('hfb_selectedCircle');
                        This.filterID = $(this).attr('id');
                        let currentEle = This.filterID;
                        let id, circleId;
                        if (currentEle.length) {
                            id = currentEle.split('$$');
                        }
                        if (id.length) {
                            circleId = $('.hfb_circle#' + id[0] + '_circle');
                        }
                        if (circleId) {
                            $(circleId).addClass('hfb_selectedCircle');
                        }
                        if (This.filterName === $(this)[0].getAttribute("title").toLowerCase()) {
                            This.filterName = '';
                            This.filterID = '';
                            $(circleId).removeClass('hfb_selectedCircle');
                        } else {
                            This.filterName = $(this)[0].getAttribute("title").toLowerCase();
                        }

                        renderVisual(This.filterName, This.filterID);
                        event.stopPropagation();
                    });
                }


            }
            $(document).on("click", () => {
                renderVisual("", "");
                $('circle.hfb_circle').removeClass('hfb_selectedCircle');
                event.stopPropagation();
            });
        }
    }
}