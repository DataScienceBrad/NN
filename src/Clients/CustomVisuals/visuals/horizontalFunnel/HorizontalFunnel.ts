module powerbi.visuals {
    import SelectionManager = utility.SelectionManager;
    import getAnimationDuration = AnimatorCommon.GetAnimationDuration;
    import pixelConverter = jsCommon.PixelConverter;
    export interface FunnelViewModel {
        primaryColumn?: string;
        secondaryColumn?: string;
        count?: number;
        toolTipInfo?: TooltipDataItem[];
        categories?: CategoryViewModel[];
        values?: ValueViewModel[];
        identity?: SelectionId;
    }
    export interface CategoryViewModel {
        value: string;
        color: string;
        identity?: SelectionId;
    }
    export interface ValueViewModel {
        values: any;
    }
    export interface FunnelConstructorOptions {
        animator?: IGenericAnimator;
    }
    export var horizontalFunnelProps = {
        dataPoint: {
            //defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            //showAllDataPoints: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'showAllDataPoints' },
        },
        show: { objectName: 'FunnelTitle', propertyName: 'show' },
        titleText: { objectName: 'FunnelTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'FunnelTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'FunnelTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'FunnelTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'FunnelTitle', propertyName: 'tooltipText' },
    };
    export class HorizontalFunnel implements IVisual {
        private root: D3.Selection;
        private dataView: DataView;
        private style: IVisualStyle;
        private colors: IDataColorPalette;
        private colorHelper: ColorHelper;
        private cardFormatSetting: CardFormatSetting;
        private static MinOpacity: number = 0.3;
        private static MaxOpacity: number = 1;
        private durationAnimations: number = 200;
        private animator: IGenericAnimator;
        private selectionManager: SelectionManager;
        private defaultDataPointColor = undefined;
        private viewModel = undefined;
        public static getDefaultData(): FunnelViewModel {
            return {
                count: 0,
                categories: [],
                values: [],
                primaryColumn: '',
                secondaryColumn: '',
                toolTipInfo: [],
                identity: null
            };
        }
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Category',
                    kind: VisualDataRoleKind.Grouping,
                    displayName: 'Series'
                },
                {
                    name: 'primaryMeasure',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Primary Measure'
                },
                {
                    name: 'secondaryMeasure',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Secondary Measure'
                },
            ],
            objects: {
                dataPoint: {
                    displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                    description: data.createDisplayNameGetter('Visual_DataPointDescription'),
                    properties: {
                        fill: {
                            type: { fill: { solid: { color: true } } }
                        },
                        fillRule: {
                            displayName: data.createDisplayNameGetter('Visual_Gradient'),
                            type: { fillRule: {} },
                            rule: {
                                inputRole: 'Gradient',
                                output: {
                                    property: 'fill',
                                    selector: ['Group'],
                                }
                            }
                        }
                    },
                },
                labels: {
                    displayName: data.createDisplayNameGetter('Visual_DataPointsLabels'),
                    description: data.createDisplayNameGetter('Visual_DataPointsLabelsDescription'),
                    properties: {
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                            description: data.createDisplayNameGetter('Visual_LabelsFillDescription'),
                            type: { fill: { solid: { color: true } } }
                        },
                        labelDisplayUnits: {
                            displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                            description: data.createDisplayNameGetter('Visual_DisplayUnitsDescription'),
                            type: { formatting: { labelDisplayUnits: true } },
                            suppressFormatPainterCopy: true
                        },
                        labelPrecision: {
                            displayName: data.createDisplayNameGetter('Visual_Precision'),
                            description: data.createDisplayNameGetter('Visual_PrecisionDescription'),
                            placeHolderText: data.createDisplayNameGetter('Visual_Precision_Auto'),
                            type: { numeric: true },
                            suppressFormatPainterCopy: true
                        }
                    },
                },
                FunnelTitle: {
                    displayName: 'Funnel Title',
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        titleText: {
                            displayName: 'Title Text',
                            description: 'The name of the visual',
                            type: { text: true }
                        },
                        fill1: {
                            displayName: 'Font color',
                            description: 'Font color for the funnel title',
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: 'Text Size',
                            description: 'Font size for the funnel title',
                            type: { formatting: { fontSize: true } }
                        },
                        backgroundColor: {
                            displayName: 'Background color',
                            description: 'Background color for the funnel title',
                            type: { fill: { solid: { color: true } } }
                        },
                        tooltipText: {
                            displayName: 'Tooltip Text',
                            description: 'Tooltip text for the funnel title',
                            type: { text: true }
                        },
                    }
                }
            },
            dataViewMappings: [{
                conditions: [
                    { 'Category': { max: 1 }, 'primaryMeasure': { max: 1 }, 'secondaryMeasure': { max: 1 } }
                ],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        select: [{ bind: { to: 'primaryMeasure' } }, { bind: { to: 'secondaryMeasure' } }],
                        dataReductionAlgorithm: { top: {} }
                    },
                    rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                },
            }],
            suppressDefaultTitle: true,
        };
        public constructor(options?: FunnelConstructorOptions) {
            if (options) {
                if (options.animator) {
                    this.animator = options.animator;
                }
            }
        }
        public static converter(dataView: DataView, colors: IDataColorPalette): FunnelViewModel[] {
            var viewModel: FunnelViewModel[] = [];
            viewModel.push(HorizontalFunnel.getDefaultData());
            if (dataView) {
                var objects = dataView.metadata.objects;
                var targetvalueIndex: number, yvalueIndex: number;
                if (!dataView || !dataView.categorical || !dataView.categorical.values || !dataView.categorical.categories) {
                    viewModel[0].count = -1;
                    return viewModel;
                }
                for (var iLoop = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                    if (dataView.categorical.values[iLoop].source.roles && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('primaryMeasure')) {
                        targetvalueIndex = iLoop;
                        viewModel[0].primaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    }
                    else if (dataView.categorical.values[iLoop].source.roles && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('secondaryMeasure')) {
                        yvalueIndex = iLoop;
                        viewModel[0].secondaryColumn = dataView.categorical.values[iLoop].source.displayName;
                    }
                }
                if (targetvalueIndex !== undefined) {
                    var categorical = dataView.categorical;
                    if (categorical) {
                        /*********************************************START SORTING****************************************/
                        var
                            arrValuesToBeSorted = [],
                            iSmallestValue,
                            iIndex = 0,
                            unsortcategoriesvalues: any = categorical.categories[0].values,
                            unsortcategories: any = categorical.categories[0],
                            unsortindex: number,
                            arrTempXAxisValues = categorical.categories[0].values,
                            arrTempYAxisValues1 = categorical.values[0].values,
                            arrTempYAxisValues2 = [],
                            iValueToBeSorted,
                            arrIntegerValuesSortIndexes = [],
                            arrTextValuesSortIndexes = {
                                textValue: [],
                                textIndex: []
                            },
                            XAxisSortedIntegerValues = [],
                            YAxis1SortedValues = [],
                            YAxis2SortedValues = [],
                            iTotalXAxisNumericValues = 0;
                        if (2 === categorical.values.length) {
                            arrTempYAxisValues2 = categorical.values[1].values;
                        }
                        /*****************************CREATE ARRAY FOR VALUES TO BE SORTED******************************/
                        for (var iCount = 0; iCount < categorical.categories[0].values.length; iCount++) {
                            if (isNaN(categorical.categories[0].values[iCount])) {
                                iValueToBeSorted = categorical.categories[0].values[iCount].toString().match(/-?\d+\.?\d*/);
                                if (null !== iValueToBeSorted) {
                                    arrValuesToBeSorted.push(parseFloat(iValueToBeSorted[0]));
                                    iTotalXAxisNumericValues++;
                                }
                                else {
                                    arrValuesToBeSorted.push(categorical.categories[0].values[iCount]);
                                }
                            }
                            else {
                                if (isNaN(parseFloat(categorical.categories[0].values[iCount]))) {
                                    arrValuesToBeSorted.push(categorical.categories[0].values[iCount]);
                                }
                                else {
                                    arrValuesToBeSorted.push(parseFloat(categorical.categories[0].values[iCount]));
                                }
                                iTotalXAxisNumericValues++;
                            }
                        }
                       
                        /*****************************END create array for values to be sorted*****************************/
                        if (iTotalXAxisNumericValues) {
                            for (var iCounter = 0; iCounter < arrValuesToBeSorted.length; iCounter++) {
                                if (-1 === arrIntegerValuesSortIndexes.indexOf(iCounter) && -1 === arrTextValuesSortIndexes.textIndex.indexOf(iCounter)) {
                                    iSmallestValue = arrValuesToBeSorted[iCounter];
                                    iIndex = iCounter;
                                    if (isNaN(parseFloat(iSmallestValue))) {
                                        arrTextValuesSortIndexes.textValue.push(iSmallestValue);
                                        arrTextValuesSortIndexes.textIndex.push(iCounter);
                                        continue;
                                    }
                                    else {
                                        for (var iInnerCount = iCounter + 1; iInnerCount < arrValuesToBeSorted.length; iInnerCount++) {
                                            if (!isNaN(arrValuesToBeSorted[iInnerCount]) && -1 === arrIntegerValuesSortIndexes.indexOf(iInnerCount) && null !== arrValuesToBeSorted[iInnerCount]) {
                                                if (arrValuesToBeSorted[iInnerCount] < iSmallestValue) {
                                                    iIndex = iInnerCount;
                                                    iSmallestValue = arrValuesToBeSorted[iInnerCount];
                                                }
                                            }
                                        }
                                        arrIntegerValuesSortIndexes.push(iIndex);
                                    }
                                    if (-1 === arrIntegerValuesSortIndexes.indexOf(iCounter)) {
                                        iCounter--;
                                    }
                                }
                            }
                            for (var iLoop = 0; iLoop < arrIntegerValuesSortIndexes.length; iLoop++) {
                                XAxisSortedIntegerValues.push(arrTempXAxisValues[arrIntegerValuesSortIndexes[iLoop]]);
                                for (var iNumberOfYAxisParameters = 0; iNumberOfYAxisParameters < categorical.values.length; iNumberOfYAxisParameters++) {
                                    if (0 === iNumberOfYAxisParameters) {
                                        YAxis1SortedValues.push(arrTempYAxisValues1[arrIntegerValuesSortIndexes[iLoop]]);
                                    }
                                    else if (1 === iNumberOfYAxisParameters) {
                                        YAxis2SortedValues.push(arrTempYAxisValues2[arrIntegerValuesSortIndexes[iLoop]]);
                                    }
                                }
                            }
                            for (var iLoop = 0; iLoop < arrTextValuesSortIndexes.textValue.length; iLoop++) {
                                XAxisSortedIntegerValues.push(arrTempXAxisValues[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                for (var iNumberOfYAxisParameters = 0; iNumberOfYAxisParameters < categorical.values.length; iNumberOfYAxisParameters++) {
                                    if (0 === iNumberOfYAxisParameters) {
                                        YAxis1SortedValues.push(arrTempYAxisValues1[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                    }
                                    else if (1 === iNumberOfYAxisParameters) {
                                        YAxis2SortedValues.push(arrTempYAxisValues2[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                    }
                                }
                            }
                            categorical.categories[0].values = XAxisSortedIntegerValues;
                            categorical.values[0].values = YAxis1SortedValues;
                            if (0 !== YAxis2SortedValues.length) {
                                categorical.values[1].values = YAxis2SortedValues;
                            }
                        }                    
                        /*********************************END sorting*******************************************************/
                        var categories = categorical.categories, series = categorical.values, catDv: DataViewCategorical = dataView.categorical,
                            cat = catDv.categories[0], catValues = cat.values, values = catDv.values, formatStringProp = <DataViewObjectPropertyIdentifier>{
                                objectName: 'general',
                                propertyName: 'formatString'
                            };
                        var colorHelper = new ColorHelper(colors, horizontalFunnelProps.dataPoint.fill);
                        if (categories && series && categories.length > 0 && series.length > 0) {
                            var categorySourceFormatString = valueFormatter.getFormatString(cat.source, formatStringProp), toolTipItems = [],
                                formattedCategoryValue, tooltipInfo: TooltipDataItem[], toolTip, value;
                            var categoryColumn = categorical.categories[0];
                            for (var iLoop = 0, catLength = categories[0].values.length; iLoop < catLength; iLoop++) {

                                toolTipItems = [];
                                if (iLoop !== 0) {
                                    viewModel.push({ toolTipInfo: [] });
                                    //colorIndex = colorIndex + 2;
                                }

                                viewModel[0].categories.push({
                                    value: categories[0].values[iLoop],
                                    color: '' //colors.getColorByIndex(colorIndex).value
                                });
                                formattedCategoryValue = valueFormatter.format(catValues[iLoop], categorySourceFormatString);
                                tooltipInfo = TooltipBuilder.createTooltipInfo(
                                    formatStringProp,
                                    catDv,
                                    formattedCategoryValue,
                                    (values[targetvalueIndex].values[iLoop] !== null ? values[targetvalueIndex].values[iLoop] : 0),
                                    null,
                                    null,
                                    targetvalueIndex);
                                if (values.length > 1) {
                                    toolTip = TooltipBuilder.createTooltipInfo(
                                        formatStringProp,
                                        catDv,
                                        formattedCategoryValue,
                                        (values[yvalueIndex].values[iLoop] !== null ? values[yvalueIndex].values[iLoop] : '(Blank)'),
                                        null,
                                        null,
                                        yvalueIndex)[1];
                                    if (toolTip) {
                                        tooltipInfo.push(toolTip);
                                    }
                                }
                                value = series[targetvalueIndex].values[iLoop];
                                viewModel[0].values.push({ values: [] });
                                viewModel[0].values[iLoop].values.push(value);
                                if (yvalueIndex !== undefined) {
                                    value = series[yvalueIndex].values[iLoop];
                                    viewModel[0].values[iLoop].values.push(value);
                                }
                                viewModel[iLoop].toolTipInfo = tooltipInfo;
                            }
                            for (var iLoop = 0; iLoop < catLength; iLoop++) {
                                for (var unLoop = 0; unLoop < catLength; unLoop++) {
                                    if (unsortcategoriesvalues[unLoop] === categories[0].values[iLoop]) {
                                        var objects = categoryColumn.objects && categoryColumn.objects[unLoop];
                                        var color = colorHelper.getColorForSeriesValue(objects, categoryColumn.identityFields, categoryColumn.values[unLoop]);
                                        unsortindex = unLoop;
                                        var categorySelectionId = SelectionIdBuilder.builder()
                                            .withCategory(unsortcategories, unsortindex)
                                            .createSelectionId();
                                        viewModel[iLoop].identity = categorySelectionId;
                                        viewModel[0].categories[unLoop].identity = categorySelectionId;
                                        viewModel[0].categories[unLoop].color = color;
                                        break;
                                    }
                                }
                            }
                            viewModel[0].count = catLength;
                        }
                    }
                }
            }
            return viewModel;
        }
        public init(options: VisualInitOptions): void {
            this.root = d3.select(options.element.get(0));
            this.style = options.style;
            this.colors = this.style.colorPalette.dataColors;
            this.selectionManager = new SelectionManager({ hostServices: options.host });
        }
        public update(options: VisualUpdateOptions) {
            if (!options.dataViews || (options.dataViews.length < 1) || !options.dataViews[0] || !options.dataViews[0].categorical) return;
            var dataView = this.dataView = options.dataViews[0], ymax: number, ytot: number = 0, precisionValue: number = 0, displayunitValue: number = 0,
                yarr = [], index: number = 0, percentageVal = [], legendpos: number = 0, labelSettings = null,
                sKMBValueY1Axis: string, sKMBValueY2Axis: string, displayValue: string,
                title: string = "", dimension: string,
                color: IDataLabelSettings, fontsize, titlecolor: IDataLabelSettings, titlefontsize: number, titlebgcolor: IDataLabelSettings, titleText: IDataLabelSettings, tooltiptext: IDataLabelSettings, FunnelTitleOnOffStatus: IDataLabelSettings,
                defaultText: D3.Selection, parentDiv: D3.Selection, showDefaultText: number, viewport, dataPoints, catLength: number, parentWidth: number, parentHeight: number,
                width: number, height: number, element: D3.Selection, classname: string, legendvalue: D3.Selection, oddsvg: D3.Selection, y: number, val: number = 1,
                evensvg: D3.Selection, selection: D3.Selection, nextyheight: number, prevyheight: number, areafillheight = [], visualHeight: number, titleHeight: number, titlemargin: number;
            this.cardFormatSetting = this.getDefaultFormatSettings();
            this.durationAnimations = getAnimationDuration(
                this.animator,
                options.suppressAnimations);
            defaultText = this.root.select('.hf_defaultText');
            var dataViewMetadata = dataView.metadata;
            if (dataViewMetadata) {
                var objects: DataViewObjects = dataViewMetadata.objects;
                if (objects) {
                    labelSettings = this.cardFormatSetting.labelSettings;
                    labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardProps.labels.color, labelSettings.labelColor);
                    labelSettings.precision = DataViewObjects.getValue(objects, cardProps.labels.labelPrecision, labelSettings.precision);
                    // The precision can't go below 0
                    if (labelSettings.precision) {
                        labelSettings.precision = (labelSettings.precision >= 0) ? ((labelSettings.precision < 20) ? labelSettings.precision : 20) : 0;
                        precisionValue = labelSettings.precision;
                    }
                    // this.showAllDataPoints = DataViewObjects.getValue<boolean>(objects, horizontalFunnelProps.dataPoint.showAllDataPoints);
                    // this.defaultDataPointColor = DataViewObjects.getFillColor(objects, horizontalFunnelProps.dataPoint.defaultColor);
                    labelSettings.displayUnits = DataViewObjects.getValue(objects, cardProps.labels.labelDisplayUnits, labelSettings.displayUnits);
                    this.colorHelper = new ColorHelper(this.colors, horizontalFunnelProps.dataPoint.fill, this.defaultDataPointColor);
                    var labelsObj = <DataLabelObject>dataView.metadata.objects['labels'];
                    dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
                }
            }
            viewport = options.viewport;
            this.root.selectAll('div').remove();
            dataPoints = HorizontalFunnel.converter(dataView, this.colors);
            this.viewModel = dataPoints[0];
            catLength = this.viewModel.categories.length;
            parentWidth = viewport.width;
            parentHeight = viewport.height;
            width = parentWidth / (1.4 * catLength);
            if (parentHeight >= 120)
                visualHeight = parentHeight - 120;
            else {
                if (parentHeight > 100) {
                    visualHeight = parentHeight - 100;
                }
                else {
                    visualHeight = 100 - parentHeight;
                }
            }
			
            //find max y value
            for (var iLoop = 0; iLoop < this.viewModel.categories.length; iLoop++) {
                yarr.push(this.viewModel.values[iLoop].values[0]);
                ytot += this.viewModel.values[iLoop].values[0];
                ymax = Math.max.apply(Math, yarr);
            }
            if (this.getShowTitle(this.dataView)) {
                FunnelTitleOnOffStatus = this.getShowTitle(this.dataView);
            }
            if (this.getTitleText(this.dataView)) {
                titleText = this.getTitleText(this.dataView);
            }
            if (this.getTooltipText(this.dataView)) {
                tooltiptext = this.getTooltipText(this.dataView);
            }
            titlefontsize = this.getTitleSize(this.dataView);
            if (!titlefontsize) titlefontsize = 12;
            if (FunnelTitleOnOffStatus && (titleText || tooltiptext)) {
                titleHeight = titlefontsize;
            }
            else { titleHeight = 0; }
            var props = dataLabelUtils.getDefaultColumnLabelSettings(false);
            fontsize = pixelConverter.fromPointToPixel(props.fontSize);
            if (titleHeight > visualHeight) {
                height = titleHeight - (visualHeight);
            }
            else {
                height = visualHeight - (titleHeight);
            }
            if (!this.viewModel.secondaryColumn) {
                height += (2 * fontsize + 5);
            }
            titlemargin = titleHeight;
            if (titleHeight !== 0) {
                this.root.append('div').style({ 'margin-bottom': titlemargin + 'px', 'height': titleHeight + 'px', 'width': '100%' }).classed('hf_Title_Div', true);
                this.root.select('.hf_Title_Div').append('div').style({ 'width': '100%' }).classed('hf_Title_Div_Text', true);
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ 'display': 'inline-block' });
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ 'display': 'inline-block' });
            }
            this.root.append('div').style({ 'width': parentWidth + 'px', 'height': height + 'px' }).classed('hf_parentdiv', true);
            element = this.root.select('.hf_parentdiv').append('div').classed('hf_svg hf_parentElement', true);
            parentDiv = this.root.select('.hf_parentdiv');
            showDefaultText = 1;
            if (dataView && dataView.categorical && dataView.categorical.values) {
                for (var i = 0; i < dataView.categorical.values.length; i++) {
                    if (dataView.categorical.values[i].source.roles && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                        showDefaultText = 0;
                    }
                }
            }
            if (!dataView.categorical.categories || 1 === showDefaultText) {
                parentDiv.html("Please select 'Series' and 'Primary Measure' values").classed('hf_defaultText', true).style({ 'top': height / 2.5 + 'px' });
            }
            // if (this.getLabelFill(this.dataView)) {
            //     color = this.getLabelFill(this.dataView).solid.color;
            // }
            if (labelSettings !== undefined && labelSettings !== null) {
                displayunitValue = (labelSettings.displayUnits ? labelSettings.displayUnits : 0);
                color = labelSettings.labelColor;
            }
            var props = dataLabelUtils.getDefaultColumnLabelSettings(false);
            //this.getLabelSize(this.dataView);
            fontsize = pixelConverter.fromPointToPixel(props.fontSize);
            if (this.getTitleFill(this.dataView)) {
                titlecolor = this.getTitleFill(this.dataView).solid.color;
            }
            if (this.getTitleBgcolor(this.dataView)) {
                titlebgcolor = this.getTitleBgcolor(this.dataView).solid.color;
            }
            if (titleHeight !== 0) {
                if (!titleText) {
                    this.root.select('.hf_Title_Div_Text').html('<div class = "hf_Title_Div_Text_Span" style = "max-width: 80%; display: inline-block;visibility:hidden">' + "." + '</div>'
                        + '<span class = "hf_infoImage hf_icon" title =' + tooltiptext + ' style = "width: 2%; display: inline-block; position: absolute">&nbsp(&#063;)</span>');
    
                    // this.root.select('.Title_Div_Text_Span').style({'visibility':'none'});
                }
                else {
                    this.root.select('.hf_Title_Div_Text').html('<div class = "hf_Title_Div_Text_Span" style = "max-width: 80%; display: inline-block">' + titleText + '</div>'
                        + '<span class = "hf_infoImage hf_icon" title =' + tooltiptext + ' style = "width: 2%; display: inline-block; position: absolute">&nbsp(&#063;)</span>');
                }
                if (!tooltiptext) {
                    this.root.select('.hf_infoImage').style({ 'display': 'none' });
                }
                else {
                    this.root.select('.hf_infoImage').attr('title', tooltiptext);
                }
                if (titlecolor) {
                    this.root.select('.hf_Title_Div').style({ 'color': titlecolor, 'font-size': titlefontsize + 'pt' });
                } else {
                    this.root.select('.hf_Title_Div').style({ 'color': '#333333', 'font-size': titlefontsize + 'pt' });
                }
                if (titlebgcolor) {
                    this.root.select('.hf_Title_Div').style({ 'background-color': titlebgcolor });
                    this.root.select('.hf_Title_Div_Text').style({ 'background-color': titlebgcolor });
                    this.root.select('.hf_infoImage').style({ 'background-color': titlebgcolor });
                } else {
                    this.root.select('.hf_Title_Div').style({ 'background-color': 'none' });
                }
                if (FunnelTitleOnOffStatus) {
                    this.root.select('.hf_Title_Div').classed('hf_show_inline', true);
                } else {
                    this.root.select('.hf_Title_Div').classed('hf_hide', true);
                }
            }
            element.style({ 'vertical-align': 'top', 'width': (parentWidth - width) / (1.8 * catLength) + 'px' });
            element.append('div').style({ 'color': color, 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'font-size': fontsize + 'px', 'visibility': 'hidden' }).classed('hf_legend_item', true).text('s');
            var length = ((parseInt(fontsize.toString(), 10) * (this.viewModel.primaryColumn.length)) / ((parentWidth - width) / (1.8 * catLength))) * 100;
            if ((((parentWidth - width) / (1.8 * catLength)) < 60) || (height < 100)) {
                element.append('div').style({ 'overflow': 'hidden', 'position': 'absolute', 'font-size': fontsize + 'px', 'color': color, 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'padding-right': '10px', 'margin-left': '0', 'word-break': 'keep-all' }).attr
                    ({ 'title': this.viewModel.primaryColumn }).text(this.trimString(this.viewModel.primaryColumn, ((parentWidth - width) / (1.8 * catLength)) / parseInt(fontsize.toString(), 10))).classed('hf_primary_measure', true);
            }
            else {
                element.append('div').style({
                    'overflow': 'hidden', 'color': color, 'font-size': fontsize + 'px', 'position': 'absolute', 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'padding-right': '10px', 'word-break': 'keep-all'
                }).classed('hf_primary_measure', true).attr({ 'title': this.viewModel.primaryColumn }).text(this.viewModel.primaryColumn);
            }
            if (catLength > 0) {
                element
                    .append('svg')
                    .attr({
                        height: height,
                        width: (parentWidth - width) / (1.8 * catLength),
                        fill: 'white'
                    });
            }
            if (this.viewModel.secondaryColumn !== '') {
                element.append('div').style({ 'color': color, 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'font-size': fontsize + 'px', 'visibility': 'hidden' }).classed('hf_legend_item', true).text('s');
                //check whether text fits or append ellipses
                var length = ((parseInt(fontsize.toString(), 10) * (this.viewModel.secondaryColumn.length)) / ((parentWidth - width) / (1.8 * catLength))) * 100;
                if ((((parentWidth - width) / (1.8 * catLength)) < 60) || (height < 100)) {
                    element.append('div').style({ 'overflow': 'hidden', 'position': 'absolute', 'font-size': fontsize + 'px', 'color': color, 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'padding-right': '10px', 'margin-top': '5px', 'margin-left': '0', 'word-break': 'keep-all', 'white-space': 'normal' }).attr
                        ({ 'title': this.viewModel.secondaryColumn }).text(this.trimString(this.viewModel.secondaryColumn, ((parentWidth - width) / (1.8 * catLength)) / parseInt(fontsize.toString(), 10))).classed('hf_yaxis2', true);
                }
                else {
                    element.append('div').style({ 'overflow': 'hidden', 'position': 'absolute', 'font-size': fontsize + 'px', 'color': color, 'width': (parentWidth - width) / (1.8 * catLength) + 'px', 'padding-right': '10px', 'margin-left': '0', 'margin-top': '5px', 'word-break': 'keep-all', 'white-space': 'normal' }).attr
                        ({ 'title': this.viewModel.secondaryColumn }).text(this.viewModel.secondaryColumn).classed('hf_yaxis2', true);
                }
            }
            for (var i = 0; i < (2 * catLength - 1); i++) {
                element = this.root.select('.hf_parentdiv').append('div').style({ 'height': height + 'px' }).classed('hf_svg hf_parentElement', true);
                if (i % 2 === 0) {
                    classname = 'hf_odd' + i;
                    element.append('div').style({ 'color': color, 'font-size': fontsize + 'px', 'width': width - (0.08 * width) + 'px' }).classed('hf_legend_item' + i + ' hf_xAxisLabels',
                        true).classed('hf_legend', true);
                    element.append('div').style({ 'color': color, 'font-size': fontsize + 'px', 'width': width }).classed('hf_legend_value1' + i, true).classed('hf_legend', true);
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
                    if (this.viewModel.secondaryColumn)
                        element.append('div').style({ 'color': color, 'width': width }).classed('hf_legend_value2' + i, true).style({ 'font-size': fontsize + 'px' }).classed('hf_yaxis2', true);
                }
                else {
                    classname = 'hf_even' + i;
                    element
                        .append('svg')
                        .attr({
                            'id': i,
                            height: height,
                            width: width / 4,
                            fill: '#FAFAFA'
                        })
                        .classed(classname, true)
                        .append('rect')
                        .attr({
                            x: 10,
                            y: 0,
                            height: height,
                            width: width / 4
                        });
                }
            }
            for (var i = 0; i < this.viewModel.categories.length; i++) {
                if (this.viewModel.values[i].values[0] === null || this.viewModel.values[i].values[0] === 0) {
                    percentageVal.push(-1);
                }
                else {
                    if (ymax - this.viewModel.values[i].values[0] > 0) {
                        percentageVal.push(((this.viewModel.values[i].values[0] * 100) / ymax).toFixed(2));
                    }
                    else {
                        percentageVal.push(0);
                    }
                }
                legendvalue = this.root.select('.hf_legend_item' + legendpos);
                if (this.viewModel.categories[i].value !== null) {
                    title = dataPoints[i].toolTipInfo[0].value;
                    legendvalue.attr({ 'title': title }).text(title);
                }
                else {
                    legendvalue.attr({ 'title': "(Blank)" }).text("(Blank)");
                }
                if (this.viewModel.values[i].values[0] !== null) {
                    title = dataPoints[i].toolTipInfo[1].value;
                    if (precisionValue === 0 && title.split('.').length > 1) {
                        precisionValue = title.split('.')[1].length;
                    }
                    sKMBValueY1Axis = this.format(this.viewModel.values[i].values[0], displayunitValue, precisionValue);
                    if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                        displayValue = this.addSpecialCharacters(sKMBValueY1Axis, title);
                    else
                        displayValue = sKMBValueY1Axis;
                    if (title[title.length - 1] !== '%') {
                        this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': title }).text(this.trimString(displayValue, width / 10));
                    }
                    else {
                        this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                    }
                }
                else {
                    displayValue = "(Blank)";
                    title = "(Blank)";
                    this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                }
                if (this.viewModel.values[i].values.length > 1) {
                    if (this.viewModel.values[i].values[1] !== null) {
                        sKMBValueY2Axis = this.format(this.viewModel.values[i].values[1], displayunitValue, precisionValue);
                        if (dataPoints[i].toolTipInfo.length === 3) {//series,y1 and y2
                            title = dataPoints[i].toolTipInfo[2].value;
                            if (precisionValue === 0 && title.split('.').length > 1) {
                                precisionValue = title.split('.')[1].length;
                            }
                            if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                                displayValue = this.addSpecialCharacters(sKMBValueY2Axis, title);
                            else
                                displayValue = sKMBValueY2Axis;
                        }
                        else {
                            title = dataPoints[i].toolTipInfo[1].value;
                            if (precisionValue === 0 && title.split('.').length > 1) {
                                precisionValue = title.split('.')[1].length;
                            }
                            if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                                displayValue = this.addSpecialCharacters(sKMBValueY2Axis, title);
                            else
                                displayValue = sKMBValueY2Axis;
                        }
                        if (title[title.length - 1] !== '%') {
                            this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': title }).text(this.trimString(displayValue, width / 10));
                        }
                        else {
                            this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                        }
                    }
                    else {
                        displayValue = "(Blank)";
                        title = "(Blank)";
                        this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                    }
                }
                legendpos += 2;
            }
            for (var i = 0; i < (2 * catLength - 1); i++) {
                if (i % 2 === 0) {
                    classname = 'hf_odd' + i;
                    oddsvg = this.root.select('.' + classname);
                    if (percentageVal[index] !== 0 && percentageVal[index] !== -1) {
                        percentageVal[index] = parseFloat(percentageVal[index]);//+5
                        y = 0;
                        y = ((height - (percentageVal[index] * height / 100)) / 2);//-10
                        //if (y < 10) {
                        //    y = 10 + (10 - y);
                        //}
                        areafillheight.push(percentageVal[index] * height / 100);
                        oddsvg.append('rect')
                            .attr({
                                x: 10,
                                y: y,
                                height: areafillheight[index],
                                width: width
                            }).classed('hf_datapoint hf_dataColor', true);
                    }
                    else {
                        if (percentageVal[index] === 0) {
                            oddsvg.append('rect')
                                .attr({
                                    x: 10,
                                    y: 0,
                                    height: height,
                                    width: width
                                }).classed('hf_datapoint hf_dataColor', true);
                        }
                        else if (percentageVal[index] === -1) {
                            oddsvg.append('rect').classed('hf_datapoint hf_dataColor', true);
                        }
                        areafillheight.push(0);
                    }
                    index++;
                }
            }
            for (var i = 0; i < percentageVal.length; i++) {
                var polygonColor = this.ColorLuminance(this.viewModel.categories[i].color);
                classname = '.hf_even' + val;
                evensvg = this.root.select(classname);
                if (percentageVal[i] === 0 && percentageVal[i + 1] === 0) {
                    evensvg.append('rect')
                        .attr({
                            x: 10,
                            y: 0,
                            height: height,
                            width: width / 4,
                            fill: polygonColor
                        });
                    // .classed('fillcolor', true);
                }
                else {
                    prevyheight = (height - areafillheight[i]) / 2;
                    //if (prevyheight < 10) {
                    //    prevyheight = 10 + (10 - prevyheight);
                    //}
                    nextyheight = (height - areafillheight[i + 1]) / 2;
                    //if (nextyheight < 10) {
                    //    nextyheight = 10 + (10 - nextyheight);
                    //}
                    if (percentageVal[i] && percentageVal[i + 1]) {
                        dimension = 10 + "," + prevyheight + " " + 10 + "," + (areafillheight[i] + prevyheight) + " " + (width / 4) + "," + (areafillheight[i + 1] + nextyheight) + " " +
                            (width / 4) + "," + nextyheight;
                    }
                    else if (percentageVal[i] && !(percentageVal[i + 1])) {
                        dimension = 10 + "," + prevyheight + " " + 10 + "," + (areafillheight[i] + prevyheight) + " " + (width / 4) + "," + height + " " + (width / 4) + "," + 0;
                    }
                    else if (!(percentageVal[i]) && percentageVal[i + 1]) {
                        dimension = 10 + "," + 0 + " " + 10 + "," + (height) + " " + (width / 4) + "," + (areafillheight[i + 1] + nextyheight) + " " + (width / 4) + "," + nextyheight;
                    }
                    evensvg.append('polygon')
                        .attr('points', dimension).attr({ fill: polygonColor });
                
                    //.classed('fillcolor', true);
                }
                val += 2;
            }
            // this.root.selectAll('.fillcolor').style('fill', (d, i) => this.colors.getColorByIndex(i + 1).value);
            this.root.selectAll('.hf_dataColor').style('fill', (d, i) => this.viewModel.categories[i].color);
            selection = this.root.selectAll('.hf_datapoint').data(dataPoints, (d, idx) => (dataPoints[idx] === 0) ? idx : (idx + 1));
            TooltipManager.addTooltip(selection, (tooltipEvent: TooltipEvent) => tooltipEvent.data.toolTipInfo);
            this.setSelectHandler(selection);
        }
        public getDefaultFormatSettings(): CardFormatSetting {
            return {
                showTitle: true,
                textSize: 10,
                labelSettings: this.getDefaultLabelSettings(true, '#333333', undefined, undefined),
                wordWrap: false,
            };
        }
        public getDefaultLabelSettings(show, labelColor, labelPrecision, format) {
            var defaultCountLabelPrecision: number = undefined;
            var defaultDecimalLabelPrecision: number = 2;
            var defaultLabelColor = "#333333";
            var precision = 0;
            if (show === void 0) { show = false; }
            if (format) {
                var hasDots = powerbi.NumberFormat.getCustomFormatMetadata(format).hasDots;
            }
            precision = defaultCountLabelPrecision;
            if (labelPrecision) {
                precision = labelPrecision;
            }
            else if (hasDots) {
                precision = defaultDecimalLabelPrecision;
            }
            return {
                show: show,
                position: 0 /* Above */,
                displayUnits: 0,
                precision: precision,
                labelColor: labelColor || defaultLabelColor,
                formatterOptions: null,
            };
        }
        private setSelectHandler(selection: D3.Selection): void {
            this.setSelection(selection);
            selection.on("click", (data: FunnelViewModel) => {
                this.selectionManager.select(data.identity, d3.event.ctrlKey).then((selectionIds: SelectionId[]) => {
                    this.setSelection(selection, selectionIds);
                });
                d3.event.stopPropagation();
            });
            this.root.on("click", () => {
                this.selectionManager.clear();
                this.setSelection(selection);
            });
        }
        private ColorLuminance(hex) {
            var lum = 0.50;
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;

            // convert to decimal and change luminosity
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }

            return rgb;
        }
        private setSelection(selection: D3.Selection, selectionIds?: SelectionId[]): void {
            selection.transition()
                .duration(this.durationAnimations)
                .style("fill-opacity", HorizontalFunnel.MaxOpacity);
            if (!selectionIds || !selectionIds.length) {
                return;
            }
            selection
                .filter((selectionData: FunnelViewModel) => {
                    return !selectionIds.some((selectionId: SelectionId) => { return selectionData.identity === selectionId; });
                })
                .transition()
                .duration(this.durationAnimations)
                .style("fill-opacity", HorizontalFunnel.MinOpacity);
        }
        public destroy(): void {
            this.root = null;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            if (!this.dataView)
                if (!this.cardFormatSetting)
                    this.cardFormatSetting = this.getDefaultFormatSettings();
            var formatSettings = this.cardFormatSetting;
            switch (options.objectName) {
                case 'FunnelTitle':
                    enumeration.pushInstance({
                        objectName: 'FunnelTitle',
                        displayName: 'Funnel title',
                        selector: null,
                        properties: {
                            show: this.getShowTitle(this.dataView),
                            titleText: this.getTitleText(this.dataView),
                            tooltipText: this.getTooltipText(this.dataView),
                            fill1: this.getTitleFill(this.dataView),
                            backgroundColor: this.getTitleBgcolor(this.dataView),
                            fontSize: this.getTitleSize(this.dataView),
                        }
                    });
                    break;
                case 'labels':
                    var labelSettingOptions: VisualDataLabelsSettingsOptions = {
                        enumeration: enumeration,
                        dataLabelsSettings: formatSettings.labelSettings,
                        show: true,
                        displayUnits: true,
                        precision: true,
                    };
                    dataLabelUtils.enumerateDataLabels(labelSettingOptions);
                    break;
                case 'dataPoint':
                    this.enumerateDataPoints(enumeration);
                    break;
            }
            return enumeration.complete();
        }

        private enumerateDataPoints(enumeration: ObjectEnumerationBuilder): void {
            var data = this.viewModel.categories;

            if (!data)
                return;
            var dataPointsLength = data.length;
            var primaryValues = this.viewModel.values;
            for (var i = 0; i < dataPointsLength; i++) {
                if (primaryValues[i].values[0]) {
                    if (!data[i].value) {
                        data[i].value = '(Blank)';
                    }
                    enumeration.pushInstance({
                        objectName: 'dataPoint',
                        displayName: data[i].value,
                        selector: ColorHelper.normalizeSelector(data[i].identity.getSelector()),
                        properties: {
                            fill: { solid: { color: data[i].color } }
                        },
                    });
                }
            }
            // }
        }
		
        // This function returns the font colot selected for the title in the format window
        private getTitleFill(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var FTitle = dataView.metadata.objects['FunnelTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fill1')) {
                        return <Fill>FTitle['fill1'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, horizontalFunnelProps.titleFill, { solid: { color: '#333333' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, horizontalFunnelProps.titleFill, { solid: { color: '#333333' } });
        }
        
        // This function returns the background color selected for the title in the format window
        private getTitleBgcolor(dataView: DataView): Fill {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var FTitle = dataView.metadata.objects['FunnelTitle'];
                    if (FTitle && FTitle.hasOwnProperty('backgroundColor')) {
                        return <Fill>FTitle['backgroundColor'];
                    }
                } else {
                    return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, horizontalFunnelProps.titleBackgroundColor, { solid: { color: 'none' } });
                }
            }
            return dataView && dataView.metadata && DataViewObjects.getValue(dataView.metadata.objects, horizontalFunnelProps.titleBackgroundColor, { solid: { color: 'none' } });
        }
        
        /* This function returns the title text given for the title in the format window. 
		   If only x-axix(series) is present it return x-axix,
		   if only y-axix(primary measure) is present it returns y-axix, 
		   else it returns y-axix by x-axix */
        private getTitleText(dataView: DataView): IDataLabelSettings {
            var returnTitle: string, yaxixValue: string;
            returnTitle = "";
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var titletext = dataView.metadata.objects['FunnelTitle'];
                    if (titletext && titletext.hasOwnProperty('titleText')) {
                        return <IDataLabelSettings>titletext['titleText'];
                    }
                } else {
                    if ((dataView && dataView.categorical)) {
                        if (!(dataView.categorical.values) && !(dataView.categorical.categories)) {
                            returnTitle = '';
                        } else if ((dataView.categorical.values) && !(dataView.categorical.categories)) {
                            yaxixValue = dataView.categorical.values[0].source.displayName;
                            for (var i = 0; i < dataView.categorical.values.length; i++) {
                                if (dataView.categorical.values[i].source.roles && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                                    yaxixValue = dataView.categorical.values[i].source.displayName;
                                    break;
                                }
                            }
                            returnTitle = yaxixValue;
                        } else if (!(dataView.categorical.values) && (dataView.categorical.categories)) {
                            returnTitle = dataView.categorical.categories[0].source.displayName;
                        } else {
                            yaxixValue = dataView.categorical.values[0].source.displayName;
                            for (var i = 0; i < dataView.categorical.values.length; i++) {
                                if (dataView.categorical.values[i].source.roles && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                                    yaxixValue = dataView.categorical.values[i].source.displayName;
                                    break;
                                }
                            }
                            returnTitle = yaxixValue + " by " + dataView.categorical.categories[0].source.displayName;
                        }
                    }
                    return <IDataLabelSettings>returnTitle;
                }
            }
            if ((dataView && dataView.categorical) !== undefined) {
                if (!(dataView.categorical.values) && !(dataView.categorical.categories)) {
                    returnTitle = '';
                } else if ((dataView.categorical.values) && !(dataView.categorical.categories)) {
                    yaxixValue = dataView.categorical.values[0].source.displayName;
                    for (var i = 0; i < dataView.categorical.values.length; i++) {
                        if (dataView.categorical.values[i].source.roles && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                            yaxixValue = dataView.categorical.values[i].source.displayName;
                            break;
                        }
                    }
                    returnTitle = yaxixValue;
                } else if (!(dataView.categorical.values) && (dataView.categorical.categories)) {
                    returnTitle = dataView.categorical.categories[0].source.displayName;
                } else {
                    yaxixValue = dataView.categorical.values[0].source.displayName;
                    for (var i = 0; i < dataView.categorical.values.length; i++) {
                        if (dataView.categorical.values[i].source.roles && dataView.categorical.values[i].source.roles.hasOwnProperty('primaryMeasure')) {
                            yaxixValue = dataView.categorical.values[i].source.displayName;
                            break;
                        }
                    }
                    returnTitle = yaxixValue + " by " + dataView.categorical.categories[0].source.displayName;
                }
            }
            return <IDataLabelSettings>returnTitle;
        }
        
        // This function returns the tool tip text given for the tooltip in the format window
        private getTooltipText(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var tooltiptext = dataView.metadata.objects['FunnelTitle'];
                    if (tooltiptext && tooltiptext.hasOwnProperty('tooltipText')) {
                        return <IDataLabelSettings>tooltiptext['tooltipText'];
                    }
                } else {
                    return <IDataLabelSettings>'Your tooltip text goes here';
                }
            }
            return <IDataLabelSettings>'Your tooltip text goes here';
        }
		
        // This function returns on/off status of the funnel title properties
        private getShowTitle(dataView: DataView): IDataLabelSettings {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var showTitle = dataView.metadata.objects['FunnelTitle'];
                    if (dataView.metadata.objects && showTitle.hasOwnProperty('show')) {
                        return <IDataLabelSettings>showTitle['show'];
                    }
                } else {
                    return <IDataLabelSettings>true;
                }
            }
            return <IDataLabelSettings>true;
        }
        
        // This function returns the funnel title font size selected for the title in the format window
        private getTitleSize(dataView: DataView) {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('FunnelTitle')) {
                    var FTitle = dataView.metadata.objects['FunnelTitle'];
                    if (FTitle && FTitle.hasOwnProperty('fontSize')) {
                        return FTitle['fontSize'];
                    }
                } else {
                    return 12;
                }
            }
            return 12;
        }
        // This function is to give comma formatting to numbers.
        public formatNumber(iNumber) {
            if (null === iNumber) {
                return "null";
            }
            iNumber = iNumber.toString();
            var arrSplittedNumber = iNumber.split('.'), beforeDecimalPart = arrSplittedNumber[0], formattedNumber = "";
            for (var iCount = 0; iCount < beforeDecimalPart.length; iCount++) {
                if (0 !== iCount && 1 !== iCount && 0 === (iCount) % 3) {
                    formattedNumber = "," + formattedNumber;
                }
                formattedNumber = beforeDecimalPart.charAt(beforeDecimalPart.length - 1 - iCount) + formattedNumber;
            }
            if (2 === arrSplittedNumber.length) {
                formattedNumber = formattedNumber + "." + arrSplittedNumber[1];
            }
            return formattedNumber;
        }
		
        // This function is to trim numbers if it exceeds number of digits.
        public trimString(sValue, iNumberOfDigits) {
            if (null === sValue) {
                return "null";
            }
            if (sValue.toString().length < iNumberOfDigits) {
                return sValue;
            }
            else {
                return (sValue.toString().substring(0, iNumberOfDigits) + "...");
            }
        }
      
        // This function is to perform KMB formatting on values.
        private format(d: number, displayunitValue: number, precisionValue: number) {
            var result: string;
            switch (displayunitValue) {
                case 0:
                    {
                        var prefix = d3.formatPrefix(d);
                        result = d3.round(prefix.scale(d), precisionValue).toFixed(precisionValue) + prefix.symbol.toUpperCase();
                        break;
                    }
                case 1:
                    {
                        result = this.numberWithCommas(d.toFixed(precisionValue));
                        break;
                    }
                case 1000:
                    {
                        result = this.numberWithCommas((d / 1000).toFixed(precisionValue)) + 'K';
                        break;
                    }
                case 1000000:
                    {
                        result = this.numberWithCommas((d / 1000000).toFixed(precisionValue)) + 'M';
                        break;
                    }
                case 1000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000).toFixed(precisionValue)) + 'bn';
                        break;
                    }
                case 1000000000000:
                    {
                        result = this.numberWithCommas((d / 1000000000000).toFixed(precisionValue)) + 'T';
                        break;
                    }
            }
            return result;
            // var prefix = d3.formatPrefix(d);
            // return d3.round(prefix.scale(d),2) + ' ' + prefix.symbol
        }
        public numberWithCommas(x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
            // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        // This function is to add special chanraters such as $ to values if needed
        public addSpecialCharacters(sKMBValue, title) {
            var displayValue: string = '', specialcharacters: string = '', titlelength: number = title.length;
            //Append characters front
            if (isNaN(parseInt(title[0], 10))) {
                for (var iLoop = 0; iLoop < title.length; iLoop++) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialcharacters += title[iLoop];
                    }
                    else break;
                }
                displayValue = specialcharacters + sKMBValue;
            }
            //Append characters end
            if (isNaN(parseInt(title[title.length - 1], 10))) {
                var specialarray = [], index: number = 0;
                for (var iLoop = titlelength - 1; iLoop >= 0; iLoop--) {
                    if (isNaN(parseInt(title[iLoop], 10))) {
                        specialarray[index] = title[iLoop];
                        index++;
                    }
                    else break;
                }
                for (var iLoop = specialarray.length - 1; iLoop >= 0; iLoop--) {
                    specialcharacters += specialarray[iLoop];
                }
                displayValue = sKMBValue + specialcharacters;
            }
            // if (isNaN(parseInt(title[0])) || isNaN(parseInt(title[title.length - 1])))
		
            return displayValue.trim();
        }
    }
}