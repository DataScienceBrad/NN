module powerbi.extensibility.visual {

    //color
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    //tooltip
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ISelectionManager = powerbi.extensibility.ISelectionManager;
    import IVisual = powerbi.extensibility.visual.IVisual;
    import IVisualHost = powerbi.extensibility.visual.IVisualHost;
    import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
    import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
    import SelectionManager = powerbi.extensibility.ISelectionManager;
    import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
    import pixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import SelectionId = powerbi.visuals.ISelectionId;
    //tooltip
    import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import ITooltipServiceWrapper = powerbi.extensibility.utils.tooltip.ITooltipServiceWrapper;
    //color
    import IDataColorPalette = powerbi.extensibility.IColorPalette;
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;
    import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
    import IDataLabelSettings = powerbi.extensibility.utils.chart.dataLabel.IDataLabelSettings;
    //label
    import dataLabelUtils = powerbi.extensibility.utils.chart.dataLabel.utils;
    import DataLabelObject = powerbi.extensibility.utils.chart.dataLabel.DataLabelObject;
    import VisualDataLabelsSettingsOptions = powerbi.extensibility.utils.chart.dataLabel.VisualDataLabelsSettingsOptions;

    export interface ITooltipService {
        enabled(): boolean;
        show(options: TooltipShowOptions): void;
        move(options: TooltipMoveOptions): void;
        hide(options: TooltipHideOptions): void;
    }
    export interface TooltipDataItem {
        displayName: string;
        value: string;
    }
    export var cardProps = {
        categoryLabels: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'show'
            },
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'color'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'categoryLabels',
                propertyName: 'fontSize'
            },
        },
        labels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'labels',
                propertyName: 'fontSize'
            },

        },
        trendlabels: {
            color: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'color'
            },
            labelPrecision: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelPrecision'
            },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'labelDisplayUnits'
            },
            fontSize: <DataViewObjectPropertyIdentifier>{
                objectName: 'trendlabels',
                propertyName: 'fontSize'
            },
        },
        wordWrap: {
            show: <DataViewObjectPropertyIdentifier>{
                objectName: 'wordWrap',
                propertyName: 'show'
            },
        },
    };

    export interface ILabelSettings {
        color: string;
        displayUnits: number;
        decimalPlaces: number;
    }

    export interface ShowLegendSettings {
        show: boolean;
    }
    export interface CardFormatSetting {
        showTitle: boolean;
        textSize: number;
        labelSettings: any;//VisualDataLabelsSettings;
        wordWrap: boolean;
    }
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
    export var horizontalFunnelProps = {
        dataPoint: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'fill' },
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPoint', propertyName: 'defaultColor' },
        },
        show: { objectName: 'FunnelTitle', propertyName: 'show' },
        titleText: { objectName: 'FunnelTitle', propertyName: 'titleText' },
        titleFill: { objectName: 'FunnelTitle', propertyName: 'fill1' },
        titleBackgroundColor: { objectName: 'FunnelTitle', propertyName: 'backgroundColor' },
        titleFontSize: { objectName: 'FunnelTitle', propertyName: 'fontSize' },
        tooltipText: { objectName: 'FunnelTitle', propertyName: 'tooltipText' },
        SortBy: {
            SortBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'SortBy' },
            OrderBy: <DataViewObjectPropertyIdentifier>{ objectName: 'Sort', propertyName: 'OrderBy' },
        },
        ShowLegend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'ShowLegend', propertyName: 'show' }
        },
        LabelSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' }
        }
    };
    export var sortType: any = [
        { value: 'Auto', displayName: 'Auto' },
        { value: 'Series', displayName: 'Series' },
        { value: 'PrimaryMeasure', displayName: 'Primary Measure' },
        { value: 'SecondaryMeasure', displayName: 'Secondary Measure' }
    ];
    export var orderType: any = [
        { value: 'ascending', displayName: 'Ascending', description: 'Ascending' },
        { value: 'descending', displayName: 'Descending', description: 'Descending' }
    ]
    export class HorizontalFunnel implements IVisual {
        public host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private root: d3.Selection<SVGElement>;
        private dataView: DataView;
        private style: any;//IVisualStyle;
        private colors: IDataColorPalette;
        private colorHelper: ColorHelper;
        private cardFormatSetting: CardFormatSetting;
        private static MinOpacity: number = 0.3;
        private static MaxOpacity: number = 1;
        private durationAnimations: number = 200;
        private selectionManager: SelectionManager;
        private defaultDataPointColor = undefined;
        private tooltipInfoValue: any;
        private viewModel = undefined;
        private Values = [
            {
                "value": "Auto",
                "displayName": "Auto"
            },
            {
                "value": "None",
                "displayName": "None"
            },
            {
                "value": "Thousands",
                "displayName": "Thousands"
            },
            {
                "value": "Millions",
                "displayName": "Millions"
            },
            {
                "value": "Billions",
                "displayName": "Billions"
            },
            {
                "value": "Trillions",
                "displayName": "Trillions"
            }];


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

        public getDefaultLegendSettings(): ShowLegendSettings {
            return {
                show: false
            }
        }

        public getLegendSettings(dataView: DataView): ShowLegendSettings {
            var objects: DataViewObjects = null;
            var legendSetting: ShowLegendSettings = this.getDefaultLegendSettings();

            if (!dataView.metadata || !dataView.metadata.objects)
                return legendSetting;
            objects = dataView.metadata.objects;
            var legendProperties = horizontalFunnelProps;
            legendSetting.show = DataViewObjects.getValue(objects, legendProperties.ShowLegend.show, legendSetting.show);

            return legendSetting;

        }

        public getDefaultDataLabelSettings(): ILabelSettings {
            return {
                color: '#333333',
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        public getDataLabelSettings(dataView: DataView): ILabelSettings {

            var objects: DataViewObjects = null;
            var dataLabelSetting: ILabelSettings = this.getDefaultDataLabelSettings();
            if (!dataView.metadata || !dataView.metadata.objects)
                return dataLabelSetting;
            objects = dataView.metadata.objects;
            var labelProperties = horizontalFunnelProps.LabelSettings;
            dataLabelSetting.color = DataViewObjects.getFillColor(objects, labelProperties.color, dataLabelSetting.color);
            dataLabelSetting.displayUnits = DataViewObjects.getValue(objects, labelProperties.labelDisplayUnits, dataLabelSetting.displayUnits);
            dataLabelSetting.decimalPlaces = DataViewObjects.getValue(objects, labelProperties.labelPrecision, dataLabelSetting.decimalPlaces);
            dataLabelSetting.decimalPlaces = dataLabelSetting.decimalPlaces < 0 ? 0 : dataLabelSetting.decimalPlaces > 4 ? 4 : dataLabelSetting.decimalPlaces;

            return dataLabelSetting;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration: VisualObjectInstance[] = [];
            if (!this.dataView)
                if (!this.cardFormatSetting)
                    this.cardFormatSetting = this.getDefaultFormatSettings();
            let formatSettings = this.cardFormatSetting;
            let showLegendSettings: ShowLegendSettings = this.getLegendSettings(this.dataView);
            let dataLabelSettings: ILabelSettings = this.getDataLabelSettings(this.dataView);
            switch (options.objectName) {
                case 'FunnelTitle':
                    enumeration.push({
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
                case 'Sort':
                    enumeration.push({
                        objectName: 'Sort',
                        displayName: 'Sort',
                        selector: null,
                        properties: {
                            SortBy: this.getSortBy(this.dataView),
                            OrderBy: this.getOrderBy(this.dataView)
                        }
                    });

                    break;
                case 'labels':
                    enumeration.push({
                        objectName: options.objectName,
                        properties: {
                            color: dataLabelSettings.color,
                            labelDisplayUnits: dataLabelSettings.displayUnits,
                            labelPrecision: dataLabelSettings.decimalPlaces
                        },
                        selector: null,
                    });
                    break;
                case 'dataPoint':
                    this.enumerateDataPoints(enumeration);
                    break;
                case 'ShowLegend':
                    enumeration.push({
                        objectName: 'ShowLegend',
                        displayName: 'Show Legend',
                        selector: null,
                        properties: {
                            show: showLegendSettings.show,
                        }
                    });
                    break;

            }
            return enumeration;
        }
        private enumerateDataPoints(enumeration: VisualObjectInstance[]): void {
            var data = this.viewModel.categories;
            if (!data)
                return;
            var dataPointsLength = data.length;
            var primaryValues = this.viewModel.values;
            for (var i = 0; i < dataPointsLength; i++) {
                if (primaryValues[i].values[0]) {
                    if (!data[i].color.value) {
                        data[i].color.value = '(Blank)';
                    }
                    enumeration.push({
                        objectName: 'dataPoint',
                        displayName: data[i].value,
                        selector: ColorHelper.normalizeSelector(data[i].identity.getSelector()),
                        properties: {
                            fill: { solid: { color: data[i].color.value } }
                        },
                    });
                }
            }
            enumeration.push({
                objectName: 'dataPoint',
                selector: null,
                properties: {
                    defaultColor: { solid: { color: this.defaultDataPointColor } }
                }
            });
        }

        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value[0].displayName.toString(),
                value: value[0].value.toString()
            },
            {
                displayName: value[1].displayName.toString(),
                value: value[1].value.toString()
            }];
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
            if (precision > 4) {
                precision = 4;
            }
            if (show === void 0) { show = false; }
            if (format) {
                var hasDots = true;//powerbi.NumberFormat.getCustomFormatMetadata(format).hasDots;
            }
            // precision = defaultCountLabelPrecision;
            // if (labelPrecision) {
            //     precision = labelPrecision;
            // }
            // else if (hasDots) {
            //     precision = defaultDecimalLabelPrecision;
            // }
            return {
                show: show,
                position: 0 /* Above */,
                displayUnits: 0,
                precision: precision,
                labelColor: labelColor || defaultLabelColor,
                formatterOptions: null,
            };
        }
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
        private getSortBy(dataView: DataView) {
            var property: any = [], sort: string = 'Auto';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('Sort')) {
                    property = dataView.metadata.objects['Sort'];
                    if (property && property.hasOwnProperty('SortBy')) {
                        sort = property['SortBy'];
                    }
                    // if (sort === 'SecondaryMeasure') {
                    //     (this.viewModel.secondaryColumn) ? sort = 'SecondaryMeasure' : sort = 'Auto';
                    // }
                    if (sort === 'SecondaryMeasure') {
                        var secondaryColumn = null;
                        for (var iLoop = 0; iLoop < dataView.categorical.values.length; iLoop++) {
                            if (dataView.categorical.values[iLoop].source.roles
                                && dataView.categorical.values[iLoop].source.roles.hasOwnProperty('secondaryMeasure')) {
                                secondaryColumn = dataView.categorical.values[iLoop].source.displayName;
                            }
                        }
                        sort = secondaryColumn ? 'SecondaryMeasure' : 'Auto';
                    }
                }
            }
            return sort;
        }
        private getOrderBy(dataView: DataView) {
            var property: any = [], order: string = 'ascending';
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('Sort')) {
                    property = dataView.metadata.objects['Sort'];
                    if (property && property.hasOwnProperty('OrderBy')) {
                        order = property['OrderBy'];
                    }
                    else {
                        order = 'ascending';
                    }
                }
            }
            else {
                order = 'ascending';
            }
            return order;
        }
        public static converter(dataView: DataView, colors: IDataColorPalette, sort: string, order: string, host: IVisualHost): FunnelViewModel[] {
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
                        var unsortcategoriesvalues: any = JSON.parse(JSON.stringify(categorical.categories[0].values)),
                            unsortcategories: any = categorical.categories[0], unsorttargetvalues: any = JSON.parse(JSON.stringify(categorical.values[targetvalueIndex].values)),
                            unsortindex: number, unsortsecondaryvalues: any, YAxis1SortedValues: any = [],
                            YAxis2SortedValues: any = [], XAxisSortedValues: any = [];
                        if (viewModel[0].secondaryColumn) {
                            unsortsecondaryvalues = JSON.parse(JSON.stringify(categorical.values[yvalueIndex].values));
                        }
                        switch (sort) {
                            case 'Auto':  /*********************************************START SORTING****************************************/
                                var
                                    arrValuesToBeSorted = [],
                                    iSmallestValue,
                                    iIndex = 0,
                                    arrTempXAxisValues = categorical.categories[0].values,
                                    arrTempYAxisValues1 = categorical.values[0].values,
                                    arrTempYAxisValues2 = [],
                                    iValueToBeSorted,
                                    arrIntegerValuesSortIndexes = [],
                                    arrTextValuesSortIndexes = {
                                        textValue: [],
                                        textIndex: []
                                    },
                                    YAxisAutoSort = [],
                                    YAxis1AutoSort = [],
                                    XAxisSortedIntegerValues = [],
                                    iTotalXAxisNumericValues = 0;
                                if (2 === categorical.values.length) {
                                    arrTempYAxisValues2 = categorical.values[1].values;
                                }
                                /*****************************CREATE ARRAY FOR VALUES TO BE SORTED******************************/
                                /* Change of value*/
                                var value: any;
                                for (var iCount = 0; iCount < categorical.categories[0].values.length; iCount++) {
                                    value = categorical.categories[0].values[iCount];
                                    if (isNaN(value)) {
                                        iValueToBeSorted = categorical.categories[0].values[iCount].toString().match(/-?\d+\.?\d*/);
                                        if (null !== iValueToBeSorted) {
                                            arrValuesToBeSorted.push(parseFloat(iValueToBeSorted[0]));
                                            iTotalXAxisNumericValues++;
                                        }
                                        else {
                                            arrValuesToBeSorted.push(value);
                                        }
                                    }
                                    else {
                                        value = categorical.categories[0].values[iCount];
                                        if (isNaN(parseFloat(value))) {
                                            arrValuesToBeSorted.push(value);
                                        }
                                        else {
                                            arrValuesToBeSorted.push(parseFloat(value));
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
                                                YAxisAutoSort.push(arrTempYAxisValues1[arrIntegerValuesSortIndexes[iLoop]]);
                                            }
                                            else if (1 === iNumberOfYAxisParameters) {
                                                YAxis1AutoSort.push(arrTempYAxisValues2[arrIntegerValuesSortIndexes[iLoop]]);
                                            }
                                        }
                                    }
                                    for (var iLoop = 0; iLoop < arrTextValuesSortIndexes.textValue.length; iLoop++) {
                                        XAxisSortedIntegerValues.push(arrTempXAxisValues[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                        for (var iNumberOfYAxisParameters = 0; iNumberOfYAxisParameters < categorical.values.length; iNumberOfYAxisParameters++) {
                                            if (0 === iNumberOfYAxisParameters) {
                                                YAxisAutoSort.push(arrTempYAxisValues1[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                            }
                                            else if (1 === iNumberOfYAxisParameters) {
                                                YAxis1AutoSort.push(arrTempYAxisValues2[arrTextValuesSortIndexes.textIndex[iLoop]]);
                                            }
                                        }
                                    }
                                }
                                else {
                                    XAxisSortedIntegerValues = JSON.parse(JSON.stringify(unsortcategoriesvalues));
                                    YAxisAutoSort = JSON.parse(JSON.stringify(unsorttargetvalues));
                                    if (viewModel[0].secondaryColumn) {
                                        YAxis1AutoSort = JSON.parse(JSON.stringify(unsortsecondaryvalues));
                                    }
                                }
                                if (order === 'descending') {
                                    for (var iCount = XAxisSortedIntegerValues.length - 1; iCount >= 0; iCount--) {
                                        // if (XAxisSortedIntegerValues[iCount] === XAxisSortedValues[index]) {
                                        XAxisSortedValues.push(XAxisSortedIntegerValues[iCount]);
                                        YAxis1SortedValues.push(YAxisAutoSort[iCount]);
                                        if (viewModel[0].secondaryColumn) {
                                            YAxis2SortedValues.push(YAxis1AutoSort[iCount]);
                                        }
                                    }
                                }
                                else {
                                    XAxisSortedValues = JSON.parse(JSON.stringify(XAxisSortedIntegerValues));
                                    YAxis1SortedValues = JSON.parse(JSON.stringify(YAxisAutoSort));
                                    YAxis2SortedValues = JSON.parse(JSON.stringify(YAxis1AutoSort));
                                }
                                break;
                            case 'Series':
                                var index: number = 0;
                                if (order === 'ascending')
                                    XAxisSortedValues = categorical.categories[0].values.sort(d3.ascending);
                                else {
                                    XAxisSortedValues = categorical.categories[0].values.sort(d3.descending);
                                }
                                for (var iCount = 0; iCount < XAxisSortedValues.length; iCount++) {
                                    var temp = XAxisSortedValues[iCount];
                                    for (var index = 0; index < unsortcategoriesvalues.length; index++) {
                                        if (temp === unsortcategoriesvalues[index]) {
                                            YAxis1SortedValues.push(categorical.values[targetvalueIndex].values[index]);
                                            if (viewModel[0].secondaryColumn) {
                                                YAxis2SortedValues.push(categorical.values[yvalueIndex].values[index]);
                                            }
                                            break;
                                        }
                                    }
                                }
                                break;
                            case 'PrimaryMeasure':
                                if (order === 'ascending')
                                    YAxis1SortedValues = unsorttargetvalues.sort(d3.ascending);
                                else {
                                    YAxis1SortedValues = unsorttargetvalues.sort(d3.descending);
                                }
                                for (var iCount = 0; iCount < YAxis1SortedValues.length; iCount++) {
                                    var temp = YAxis1SortedValues[iCount];
                                    for (var index = 0; index < categorical.values[targetvalueIndex].values.length; index++) {
                                        if (temp === categorical.values[targetvalueIndex].values[index]) {
                                            if (XAxisSortedValues.indexOf(unsortcategoriesvalues[index]) > -1) {
                                                continue;
                                            }
                                            else {
                                                XAxisSortedValues.push(unsortcategoriesvalues[index]);
                                                if (viewModel[0].secondaryColumn) {
                                                    YAxis2SortedValues.push(unsortsecondaryvalues[index]);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'SecondaryMeasure':
                                // var index: number = 0, iCount: number = 0;
                                if (order === 'ascending')
                                    YAxis2SortedValues = unsortsecondaryvalues.sort(d3.ascending);
                                else {
                                    YAxis2SortedValues = unsortsecondaryvalues.sort(d3.descending);
                                }
                                for (var iCount = 0; iCount < YAxis2SortedValues.length; iCount++) {
                                    var temp = YAxis2SortedValues[iCount];
                                    for (var index = 0; index < categorical.values[yvalueIndex].values.length; index++) {
                                        if (temp === categorical.values[yvalueIndex].values[index]) {
                                            if (XAxisSortedValues.indexOf(unsortcategoriesvalues[index]) > -1) {
                                                continue;
                                            }
                                            else {
                                                XAxisSortedValues.push(unsortcategoriesvalues[index]);
                                                if (viewModel[0].primaryColumn) {
                                                    YAxis1SortedValues.push(unsorttargetvalues[index]);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                        /*********************************END sorting*******************************************************/

                        var categories = categorical.categories, series = categorical.values, catDv: DataViewCategorical = dataView.categorical,
                            cat = catDv.categories[0], values = catDv.values, formatStringProp = <DataViewObjectPropertyIdentifier>{
                                objectName: 'general',
                                propertyName: 'formatString'
                            };
                        var colorHelper = new ColorHelper(colors, horizontalFunnelProps.dataPoint.fill);
                        if (categories && series && categories.length > 0 && series.length > 0) {
                            var categorySourceFormatString = ValueFormatter.getFormatString(cat.source, formatStringProp), toolTipItems = [],
                                formattedCategoryValue, toolTip, value;
                            var categoryColumn = categorical.categories[0];
                            for (var iLoop = 0, catLength = XAxisSortedValues.length; iLoop < catLength; iLoop++) {

                                toolTipItems = [];
                                if (iLoop !== 0) {
                                    viewModel.push({ toolTipInfo: [] });
                                    //colorIndex = colorIndex + 2;
                                }

                                viewModel[0].categories.push({
                                    value: XAxisSortedValues[iLoop],
                                    color: '' //colors.getColorByIndex(colorIndex).value
                                });
                                formattedCategoryValue = ValueFormatter.format(XAxisSortedValues[iLoop], categorySourceFormatString);
                                var tooltipInfo: TooltipDataItem[] = [];
                                var tooltipItem1: TooltipDataItem = { displayName: "", value: "" };
                                var tooltipItem2: TooltipDataItem = { displayName: "", value: "" };
                                tooltipItem1.displayName = catDv.categories["0"].source.displayName;
                                tooltipItem1.value = formattedCategoryValue;
                                tooltipInfo.push(tooltipItem1);
                                tooltipItem2.displayName = catDv.values["0"].source.displayName;
                                let decimalPlaces: number = HorizontalFunnel.getDecimalPlacesCount(YAxis1SortedValues[iLoop]);
                                decimalPlaces = decimalPlaces > 4 ? 4 : decimalPlaces;
                                let primaryFormat: string = series && series[0] && series[0].source && series[0].source.format ? series[0].source.format : '';
                                let formatter = ValueFormatter.create({
                                    format: primaryFormat,
                                    precision: decimalPlaces,
                                    value: 0
                                });
                                let formattedTooltip = formatter.format(YAxis1SortedValues[iLoop]);
                                tooltipItem2.value = formattedTooltip;
                                // tooltipItem2.value = ValueFormatter.format(YAxis1SortedValues[iLoop], categorySourceFormatString);
                                tooltipInfo.push(tooltipItem2);
                                value = YAxis1SortedValues[iLoop];
                                viewModel[0].values.push({ values: [] });
                                viewModel[0].values[iLoop].values.push(value);
                                if (yvalueIndex !== undefined) {
                                    value = YAxis2SortedValues[iLoop];
                                    viewModel[0].values[iLoop].values.push(value);
                                }
                                viewModel[iLoop].toolTipInfo = tooltipInfo;
                                var x: any = viewModel[0].values[iLoop];
                                x.toolTipInfo = tooltipInfo;
                            }
                            for (var iLoop = 0; iLoop < catLength; iLoop++) {
                                for (var unLoop = 0; unLoop < catLength; unLoop++) {
                                    if (unsortcategoriesvalues[unLoop] === XAxisSortedValues[iLoop]) {
                                        var objects = categoryColumn.objects && categoryColumn.objects[unLoop];
                                        var dataPointObject: any;
                                        if (objects)
                                            dataPointObject = categoryColumn.objects[unLoop];
                                        var color;
                                        if (objects && dataPointObject && dataPointObject.dataPoint && dataPointObject.dataPoint.fill && dataPointObject.dataPoint.fill.solid.color)
                                            color = { value: dataPointObject.dataPoint.fill.solid.color };
                                        else
                                            color = colors[unLoop];
                                        unsortindex = unLoop;
                                        var categorySelectionId = host.createSelectionIdBuilder()
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
        private getDisplayUnits(dataView: DataView) {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var FTitle = dataView.metadata.objects['labels'];
                    if (FTitle && FTitle.hasOwnProperty('labelDisplayUnits')) {
                        return FTitle['labelDisplayUnits'];
                    }
                } else {
                    return 'Auto';
                }
            }
            return 'Auto';
        }
        private getPrecision(dataView: DataView) {
            if (dataView && dataView.metadata && dataView.metadata.objects) {
                if (dataView.metadata.objects && dataView.metadata.objects.hasOwnProperty('labels')) {
                    var FTitle = dataView.metadata.objects['labels'];
                    if (FTitle && FTitle.hasOwnProperty('labelPrecision')) {
                        return FTitle['labelPrecision'];
                    }
                } else {
                    return 0;
                }
            }
            return 0;
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
        private format(d: number, displayunitValue: number, precisionValue: number, format: string) {

            var result: string;
            var displayUnits: number = displayunitValue;
            let primaryFormatterVal = 0;
            if (displayUnits === 0) {
                let alternateFormatter = d.toString().length;
                if (alternateFormatter > 9) {
                    primaryFormatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    primaryFormatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                    primaryFormatterVal = 1e3;
                } else {
                    primaryFormatterVal = 10;
                }
            }
            let formatter;
            if (format) {
                if (format.indexOf('%') >= 0) {
                    formatter = ValueFormatter.create({

                        precision: precisionValue,
                        format: format
                    });
                }
                else {
                    formatter = ValueFormatter.create({
                        value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                        precision: precisionValue,
                        format: format
                    });
                }
            }
            else {
                formatter = ValueFormatter.create({
                    value: displayUnits === 0 ? primaryFormatterVal : displayUnits,
                    precision: precisionValue
                })
            }
            let formattedValue = formatter.format(d);
            return formattedValue;
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

        public static getDecimalPlacesCount(value: number): number {
            let decimalPlaces: number = 0;
            let splitArr = value ? value.toString().split('.') : [];
            if (splitArr[1]) {
                decimalPlaces = splitArr[1].length;
            }
            return decimalPlaces;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.root = d3.select(options.element);
            this.style = options.element.style;
            var cPalette: any = options.host.colorPalette;
            this.colors = cPalette.colors;
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.selectionManager = options.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {
            var host = this.host;
            if (!options.dataViews || (options.dataViews.length < 1) || !options.dataViews[0] || !options.dataViews[0].categorical) return;
            var dataView = this.dataView = options.dataViews[0], ymax: number, ytot: number = 0, precisionValue: number = 0, displayunitValue: number = 0,
                yarr = [], index: number = 0, percentageVal = [], legendpos: number = 0, labelSettings = null,
                sKMBValueY1Axis: any, sKMBValueY2Axis: any, displayValue: string,
                title: string = "", dimension: string,
                color: any, fontsize, titlecolor: any, titlefontsize: number, titlebgcolor: any, titleText: IDataLabelSettings, tooltiptext: any, FunnelTitleOnOffStatus: IDataLabelSettings,
                defaultText: d3.Selection<SVGElement>, parentDiv: d3.Selection<SVGElement>, showDefaultText: number, viewport, dataPoints, catLength: number, parentWidth: number, parentHeight: number,
                width: number, height: number, element: d3.Selection<SVGElement>, classname: string, legendvalue: d3.Selection<SVGElement>, oddsvg: d3.Selection<SVGElement>, y: number, val: number = 1,
                evensvg: d3.Selection<SVGElement>, selection: any, nextyheight: number, prevyheight: number, areafillheight = [], visualHeight: number, titleHeight: number, titlemargin: number;
            this.cardFormatSetting = this.getDefaultFormatSettings();
            defaultText = this.root.select('.hf_defaultText');
            var dataViewMetadata = dataView.metadata;
            var defaultDataPointColor;
            if (dataViewMetadata) {
                var objects: DataViewObjects = dataViewMetadata.objects;
                if (objects) {
                    labelSettings = this.cardFormatSetting.labelSettings;
                    labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardProps.labels.color, labelSettings.labelColor);
                    labelSettings.precision = DataViewObjects.getValue(objects, cardProps.labels.labelPrecision, labelSettings.precision);
                    // The precision can't go below 0
                    if (labelSettings.precision) {
                        labelSettings.precision = (labelSettings.precision >= 0) ? ((labelSettings.precision <= 4) ? labelSettings.precision : 4) : 0;
                        precisionValue = labelSettings.precision;
                    }
                    // this.showAllDataPoints = DataViewObjects.getValue<boolean>(objects, horizontalFunnelProps.dataPoint.showAllDataPoints);
                    defaultDataPointColor = DataViewObjects.getFillColor(objects, horizontalFunnelProps.dataPoint.defaultColor);
                    labelSettings.displayUnits = DataViewObjects.getValue(objects, cardProps.labels.labelDisplayUnits, labelSettings.displayUnits);
                    this.colorHelper = new ColorHelper(this.colors, horizontalFunnelProps.dataPoint.fill, this.defaultDataPointColor);
                    var labelsObj = <DataLabelObject>dataView.metadata.objects['labels'];
                    dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, labelSettings);
                }
            }
            var showLegendProp = this.getLegendSettings(this.dataView);
            this.defaultDataPointColor = defaultDataPointColor;
            viewport = options.viewport;
            this.root.selectAll('div').remove();
            dataPoints = HorizontalFunnel.converter(dataView, this.colors, this.getSortBy(dataView), this.getOrderBy(dataView), this.host);
            this.viewModel = dataPoints[0];
            catLength = this.viewModel.categories.length;
            parentWidth = viewport.width;
            parentHeight = viewport.height;
            width = parentWidth / (1.4 * catLength);
            //changed now
            if (parentHeight >= 65)
                visualHeight = parentHeight - 65;
            else {
                visualHeight = 65 - parentHeight;
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
            titlefontsize = Number(this.getTitleSize(this.dataView));
            if (!titlefontsize) titlefontsize = 12;
            if (FunnelTitleOnOffStatus && (titleText || tooltiptext)) {

                let titleTextProperties: TextProperties = {
                    fontFamily: 'Segoe UI,wf_segoe-ui_normal,helvetica,arial,sans-serif',
                    fontSize: `${titlefontsize}pt`,
                    text: titleText.toString()
                };
                titleHeight = TextMeasurementService.measureSvgTextHeight(titleTextProperties);
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
                this.root.append('div').style({ 'height': titleHeight + 'px', 'width': '100%' }).classed('hf_Title_Div', true);
                this.root.select('.hf_Title_Div').append('div').style({ 'width': '100%' }).classed('hf_Title_Div_Text', true);
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ 'display': 'inline-block' });
                this.root.select('.hf_Title_Div_Text').classed('hf_title', true).style({ 'display': 'inline-block' });
            }
            this.root.append('div').style({ 'width': parentWidth + 'px', 'height': height + 60 + 'px' }).classed('hf_parentdiv', true);
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
                let totalWidth = viewport.width;
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
            if (showLegendProp.show) {
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
                        element.append('div')
                            .style({
                                'overflow': 'hidden',
                                'position': 'absolute',
                                'font-size': fontsize + 'px',
                                'color': color,
                                'width': (parentWidth - width) / (1.8 * catLength) + 'px',
                                'padding-right': '10px',
                                'margin-top': '5px',
                                'margin-left': '0',
                                'word-break': 'keep-all',
                                'white-space': 'normal'
                            })
                            .attr({ 'title': this.viewModel.secondaryColumn })
                            .text(this.trimString(this.viewModel.secondaryColumn, ((parentWidth - width) / (1.8 * catLength)) / parseInt(fontsize.toString(), 10)))
                            .classed('hf_yaxis2', true);
                    }
                    else {
                        element.append('div')
                            .style({
                                'overflow': 'hidden',
                                'position': 'absolute',
                                'font-size': fontsize + 'px',
                                'color': color,
                                'width': (parentWidth - width) / (1.8 * catLength) + 'px',
                                'padding-right': '10px',
                                'margin-left': '0',
                                'margin-top': '5px',
                                'word-break': 'keep-all',
                                'white-space': 'normal'
                            })
                            .attr({ 'title': this.viewModel.secondaryColumn })
                            .text(this.viewModel.secondaryColumn).classed('hf_yaxis2', true);
                    }
                }
            }

            for (var i = 0; i < (2 * catLength - 1); i++) {
                if (!showLegendProp.show) {
                    width = parentWidth / (1.6 * ((catLength == 1 ? 2 : catLength) - 1));
                }
                element = this.root.select('.hf_parentdiv').append('div').style({ 'height': height + 'px' }).classed('hf_svg hf_parentElement', true);
                if (i % 2 === 0) {
                    classname = 'hf_odd' + i;
                    element.append('div').style({ 'color': color, 'font-size': fontsize + 'px', 'width': width - (0.08 * width) + 'px' }).classed('hf_legend_item' + i + ' hf_xAxisLabels',
                        true).classed('hf_legend', true);
                    element.append('div')
                        .style({ 'color': color, 'font-size': fontsize + 'px', 'width': width })
                        .classed('hf_legend_value1' + i, true)
                        .classed('hf_legend', true);
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
                        element.append('div')
                            .style({ 'color': color, 'width': width })
                            .classed('hf_legend_value2' + i, true)
                            .style({ 'font-size': fontsize + 'px' })
                            .classed('hf_yaxis2', true);
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
                    title = String(dataPoints[i].toolTipInfo[1].value);
                    // if (precisionValue === 0 && title.split('.').length > 1) {
                    //     precisionValue = title.split('.')[1].length;
                    precisionValue = precisionValue;
                    //}
                    sKMBValueY1Axis = this.format(this.viewModel.values[i].values[0], displayunitValue, precisionValue, this.dataView.categorical.values[0].source.format);
                    let decimalPlaces = HorizontalFunnel.getDecimalPlacesCount(this.viewModel.values[i].values[0]);
                    // tooltip values
                    let sKMBValueY1AxisTooltip = this.format(this.viewModel.values[i].values[0], 1, decimalPlaces, this.dataView.categorical.values[0].source.format);

                    // if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                    //     displayValue = this.addSpecialCharacters(sKMBValueY1Axis, title);
                    // else
                    displayValue = sKMBValueY1Axis;
                    this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': sKMBValueY1AxisTooltip }).text(this.trimString(displayValue, width / 10));
                    // if (title[title.length - 1] !== '%') {
                    //     this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': sKMBValueY1AxisTooltip }).text(this.trimString(displayValue, width / 10));
                    // }
                    // else {
                    //     this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                    // }
                }
                else {
                    displayValue = "(Blank)";
                    title = "(Blank)";
                    this.root.select('.hf_legend_value1' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                }
                if (this.viewModel.values[i].values.length > 1) {
                    let sKMBValueY2AxisTooltip;
                    if (this.viewModel.values[i].values[1] !== null) {
                        var PM = [];
                        sKMBValueY2Axis = this.format(this.viewModel.values[i].values[1], displayunitValue, precisionValue, this.dataView.categorical.values[1].source.format);
                        let decimalPlaces = HorizontalFunnel.getDecimalPlacesCount(this.viewModel.values[i].values[1]);
                        sKMBValueY2AxisTooltip = this.format(this.viewModel.values[i].values[1], 1, decimalPlaces, this.dataView.categorical.values[1].source.format);
                        if (dataPoints[i].toolTipInfo.length === 3) {//series,y1 and y2
                            title = dataPoints[i].toolTipInfo[2].value;
                            // if (precisionValue === 0 && title.split('.').length > 1) {
                            //     precisionValue = title.split('.')[1].length;
                            // }
                            precisionValue = labelSettings.precision;
                            // if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                            //     displayValue = this.addSpecialCharacters(sKMBValueY2Axis, title);
                            // else
                            displayValue = sKMBValueY2Axis;
                        }
                        else {
                            title = dataPoints[i].toolTipInfo[1].value;
                            // if (precisionValue === 0 && title.split('.').length > 1) {
                            //     precisionValue = title.split('.')[1].length;
                            // }
                            precisionValue = precisionValue;
                            // if (isNaN(parseInt(title[0], 10)) || isNaN(parseInt(title[title.length - 1], 10)))
                            //     displayValue = this.addSpecialCharacters(sKMBValueY2Axis, title);
                            // else
                            displayValue = sKMBValueY2Axis;
                        }
                        this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': sKMBValueY2AxisTooltip }).text(this.trimString(displayValue, width / 10));
                        // if (title[title.length - 1] !== '%') {
                        //     // this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': title }).text(this.trimString(displayValue, width / 10));
                        //     this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': sKMBValueY2AxisTooltip }).text(this.trimString(displayValue, width / 10));
                        // }
                        // else {
                        //     this.root.select('.hf_legend_value2' + legendpos).attr({ 'title': title }).text(this.trimString(title, width / 10));
                        // }
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
                            // oddsvg.append('rect').classed('hf_datapoint hf_dataColor', true); // need to change this
                            // showing dotted line if there is no data      
                            y = ((height - (percentageVal[index] * height / 100)) / 2);//-10
                            oddsvg.append('line')
                                .attr({
                                    x1: 10,
                                    y1: y,
                                    x2: width,
                                    y2: y,
                                    'stroke-width': 1,
                                }).classed('hf_datapoint hf_dataColor', true)
                                .style("stroke-dasharray", "1,2");
                        }
                        areafillheight.push(0);
                    }
                    index++;
                }
            }
            var svgElement = d3.selectAll('.hf_datapoint.hf_dataColor');
            for (var i = 0; i < (catLength); i++) {
                svgElement[0][i]['cust-tooltip'] = this.viewModel.values[i].toolTipInfo;
            }
            for (var i = 0; i < percentageVal.length; i++) {
                var polygonColor;
                if (this.defaultDataPointColor) {
                    polygonColor = this.defaultDataPointColor;
                } else {
                    polygonColor = this.ColorLuminance(this.viewModel.categories[i].color.value);
                }
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
                    //.classed('fillcolor', true);
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
            this.root.selectAll('.fillcolor').style('fill', (d, i) => this.colors[i + 1].value);
            this.root.selectAll('.hf_dataColor').style('fill', (d, i) => this.viewModel.categories[i].color.value);
            // This is for the dotted line
            this.root.selectAll('.hf_dataColor').style('stroke', (d, i) => this.viewModel.categories[i].color.value);
            selection = this.root.selectAll('.hf_datapoint').data(dataPoints, (d, idx) => (dataPoints[idx] === 0) ? String(idx) : String(idx + 1));
            var viewModel = this.viewModel;
            this.tooltipServiceWrapper.addTooltip(d3.selectAll('.hf_datapoint'), (tooltipEvent: TooltipEventArgs<number>) => {
                return tooltipEvent.context['cust-tooltip'];
            }, (tooltipEvent: TooltipEventArgs<number>) => null, true);
            this.setSelectHandler(selection);
        }
        private setSelectHandler(selection: d3.Selection<SVGElement>): void {
            this.setSelection(selection);
            selection.on("click", (data: FunnelViewModel) => {
                var ev: any = d3.event;
                this.selectionManager.select(data.identity, ev.ctrlKey).then((selectionIds: SelectionId[]) => {
                    this.setSelection(selection, selectionIds);
                });
                ev.stopPropagation();
            });
            this.root.on("click", () => {
                this.selectionManager.clear();
                this.setSelection(selection);
            });
        }
        private setSelection(selection: d3.Selection<SVGElement>, selectionIds?: SelectionId[]): void {
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
    }
}