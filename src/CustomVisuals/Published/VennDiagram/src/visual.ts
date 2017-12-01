module powerbi.extensibility.visual {
    let legendValues = {};
    let legendValuesTorender = {};
    let colorval = [];
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {
            if (!objects) {
                return defaultValue;
            }
            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object = <DataViewObject>objects[objectName];
                return object;
            } else {
                return defaultValue;
            }
        }

        /** Gets a map of user-defined objects. */
        export function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap {
            if (objects && objects[objectName]) {
                let map = <DataViewObjectMap>objects[objectName];
                return map;
            }
        }

        /** Gets the solid color from a fill property. */
        export function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string {
            let value: Fill = getValue(objects, propertyId);
            if (!value || !value.solid) {
                return defaultColor;
            }
            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {
            if (!object) {
                return defaultValue;
            }
            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined) {
                return defaultValue;
            }
            return propertyValue;
        }
        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid) {
                return defaultColor;
            }
            return value.solid.color;
        }
    }

    export let visualProperties = {
        labelSettings: {
            color: <DataViewObjectPropertyIdentifier>{ objectName: "labelSettings", propertyName: "color" },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: "labelSettings", propertyName: "displayUnits" },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: "labelSettings", propertyName: "fontSize" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "labelSettings", propertyName: "show" },
            textPrecision: <DataViewObjectPropertyIdentifier>{ objectName: "labelSettings", propertyName: "textPrecision" }
        },
        legend: {
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "labelPrecision" },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "labelDisplayUnits" },
            show: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "show" },
            showPrimary: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "showPrimary" },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: "legend", propertyName: "titleText" }
        },
        opacity: {
            externalArc: <DataViewObjectPropertyIdentifier>{ objectName: "opacity", propertyName: "external" },
            internalArc: <DataViewObjectPropertyIdentifier>{ objectName: "opacity", propertyName: "internal" }
        }
    };

    export interface LegendSetting {
        show: boolean;
        titleText: string;
        displayUnits: number;
        decimalPlaces: number;
        showPrimary: boolean;
    }

    export interface LabelSettings {
        show: boolean;
        color: string;
        fontSize: number;
        displayUnits: number;
        textPrecision: number;
    }

    export interface OpacitySettings {
        externalArc: number;
        internalArc: number;
    }

    let numberOfObjects = 0;
    let finalSingleObjects;
    let finalSingleObjectsValues;

    interface VennViewModel {
        legendData: LegendData;
        dataPoints: VennDataPoint[];
    }

    interface VennDataPoint {
        category: string;
        value: number;
        color: string;
        selectionId: {};
    }
    function objectSort(objProperty) {
        let sortOrder = 1;
        if (objProperty[0] === '-') {
            sortOrder = -1;
            objProperty = objProperty.substr(1);
        }

        return function (a, b) {
            let result = (a[objProperty] < b[objProperty]) ? -1 : (a[objProperty] > b[objProperty]) ? 1 : 0;

            return result * sortOrder;
        };
    }
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): VennViewModel {
        if (!options.dataViews) {
            return;
        }
        if (!options.dataViews[0]) {
            return;
        }
        if (!options.dataViews[0].categorical) {
            return;
        }
        let dataViews = options.dataViews[0];
        let colorPalette: IColorPalette = host.colorPalette;
        let VennDataPoints: VennDataPoint[] = [];
        let categorical: any = options.dataViews[0].categorical;
        let category = categorical.categories;
        let i = 0;
        for (let iIterator = 0; iIterator < dataViews.metadata.columns.length; iIterator++) {
            if (dataViews.metadata.columns[iIterator].roles['category']) {
                let defaultColor: Fill = {
                    solid: {
                        color: colorPalette.getColor(dataViews.metadata.columns[iIterator].displayName).value
                    }
                }
                let defaultColors = [{ solid: { color: "#01B8AA" } }, { solid: { color: "#374649" } }, { solid: { color: "#FD625E" } }, { solid: { color: "#F2C80F" } }];
                VennDataPoints.push({
                    category: dataViews.metadata.columns[iIterator].displayName,
                    value: iIterator,
                    color: getValue<Fill>(dataViews.metadata.columns[iIterator].objects, 'colors', 'colorToFill', defaultColors[i]).solid.color,
                    selectionId: { metadata: dataViews.metadata.columns[iIterator].queryName },
                });
                i++;
            }
        }
        return {
            dataPoints: VennDataPoints,
            legendData: context.getLegendData(dataViews, VennDataPoints, host),
        };
    }

    export class VennDiagram implements IVisual {
        public host: IVisualHost;
        public circles: any = {};
        public rectangle: any = {};
        public texts: any = {};
        public legendtext: any = {};
        public checkbox: any = {};
        public svgpaths: any = {};
        public paths: any = {};
        public dataView: DataView;
        public NumberOfObjects = 0;
        public singleTemp: any = [];
        public singleTempValue: any = [];
        public finalSingleObjects: any = [];
        public dataModified: any = [];
        public finalSingleObjectsValues: any = [];
        public finalOtherObjects: any = [];
        public finalOtherObjectsValues: any = [];
        public finalUpdatedSingleObjectsValues: any = [];
        public finalUpdatedOtherObjectsValues: any = [];
        public finalPercentIndicator: any = [];
        public percentIndicator: any = [];
        public combinations: any = [];
        public radius: any = [];
        public margin = 10;
        public finalDataSet: any = [];
        public countOfOverlapping = [];
        public dataSet: any;
        public options: VisualUpdateOptions;
        public width: any;
        public height: any;
        public viewModel: VennViewModel;
        public groupLegends: d3.Selection<SVGElement>;
        public formatter: any;

        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private dataViews: DataView;
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        private rootElement;
        private currentViewport: IViewport;
        private target: HTMLElement;
        private vennPoints: VennDataPoint[];
        private selectionManager: ISelectionManager;
        private prevDataViewObjects: any = {};
        private mainGroup: any = {};
        private text: d3.Selection<SVGElement>;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        private legendData;

        public static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                let objects = dataView.metadata.objects;
                if (objects) {
                    let config = objects["config"];
                    if (config) {
                        let size = <T>config[key];
                        if (size != null) {
                            return size;
                        }
                    }
                }
            }
            return defaultValue;
        }

        public getLegendData(dataView: DataView, VennDataPoint, host: IVisualHost): LegendData {
            let legendSetting: LegendSetting = this.getLegendSettings(this.dataViews);
            let measureSum = 0;
            let legendData: LegendData = {
                dataPoints: [],
                fontSize: 8,
                title: legendSetting.titleText,
                showPrimary: legendSetting.showPrimary,
            };
            let legendDataValue = [];
            let valuesArr = this.dataViews
                && this.dataViews.categorical
                && this.dataViews.categorical.values
                && this.dataViews.categorical.values[0] ? this.dataViews.categorical.values[0].values : [];
            let categories = this.dataViews
                && this.dataViews.categorical
                && this.dataViews.categorical.categories ? this.dataViews.categorical.categories : [];
            let categoriesLen = categories.length;
            let sumObj = {};
            let totalSum = 0;
            // logic to calculate value of each legend item
            for (let k = 0; k < VennDataPoint.length; k++) {
                let currentDataPoint = VennDataPoint[k].category;
                for (let i = 0; i < categoriesLen; i++) {
                    let currentCatName = categories[i].source.displayName;
                    let currentCat = categories[i];
                    if (currentDataPoint === currentCatName) {
                        let currentCatValues = currentCat.values;
                        let sum: any = 0;
                        for (let j = 0; j < currentCatValues.length; j++) {
                            if (currentCatValues[j].toString().toLowerCase() === "yes"
                                || currentCatValues[j].toString().toLowerCase() === "true"
                                || currentCatValues[j].toString() === "1") {
                                sum += parseFloat(valuesArr[j].toString());
                            }
                        }
                        sumObj[currentCatName] = sum;
                    }
                }
            }
            // logic to calculate total sum of measure
            for (let i = 0; i < valuesArr.length; i++) {
                if (valuesArr[i]) {
                    totalSum += parseFloat(valuesArr[i].toString());
                }
            }
            for (let iCounter = 0; iCounter < VennDataPoint.length; iCounter++) {
                let labelName = this.finalSingleObjects[iCounter];
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    legendData.dataPoints.push({
                        color: VennDataPoint[iCounter].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        identity: host.createSelectionIdBuilder()
                            .withMeasure(VennDataPoint[iCounter].category)
                            .createSelectionId(),
                        label: labelName,
                        measure: sumObj[labelName] ? sumObj[labelName] : 0,
                        selected: false,
                    });
                }
            }
            legendData.measureSum = totalSum;

            return legendData;
        }

        public validateData(dataView: DataView): boolean {
            let isInvalidData = false;
            let dataFormat = ["yes", "no", "true", "false", "1", "0"];
            let categories = dataView && dataView.categorical && dataView.categorical.categories ? dataView.categorical.categories : [];
            if (categories.length) {
                let catLen = categories.length;
                for (let i = 0; i < catLen; i++) {
                    let currentCat = categories[i];
                    let currentCatValues = currentCat && currentCat.values ? currentCat.values : [];
                    let curCatValLen = currentCatValues.length;
                    for (let j = 0; j < curCatValLen; j++) {
                        let curVal = currentCatValues[j] ? currentCatValues[j].toString().toLowerCase() : " ";
                        if (dataFormat.indexOf(curVal) < 0 && curVal !== " ") {
                            isInvalidData = true;
                            break;
                        }
                    }
                }
            }

            return isInvalidData;
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.rootElement = d3.select(options.element);
            let svg = this.svg = this.rootElement.append("svg").classed("VennDiagram", true);
            this.mainGroup = svg.append("g");

            let oElement: any = $("div");
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select(".legend").style("top", 0);

            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width),
            };
            this.dataViews = options.dataViews[0];
            let isInvalidData = false;
            isInvalidData = this.validateData(this.dataViews);
            let legendSetting: LegendSetting = this.getLegendSettings(this.dataViews);
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            this.mainGroup.selectAll("*").remove();
            this.rootElement.selectAll(".legend #legendGroup .legendItem, .legend #legendGroup .legendTitle, .legend #legendGroup .navArrow").remove();
            $(".ErrorMessage").remove();

            if (isInvalidData) {
                let htmlChunk = '<div class="ErrorMessage"' +
                    'title="Please provide data in valid format">Please provide data in valid format</div>';
                $('#sandbox-host').append(htmlChunk);
                return;
            }
            if (!(options.dataViews &&
                options.dataViews[0].categorical &&
                options.dataViews[0].categorical.values &&
                options.dataViews[0].categorical.values[0] &&
                options.dataViews[0].categorical.categories &&
                options.dataViews[0].categorical.categories[0])) {
                let htmlChunk = '<div class="ErrorMessage">Please select "Category" and "Measure"</div>';
                $('#sandbox-host').append(htmlChunk);
                return;
            }
            let This = this;

            this.dataView = options.dataViews[0];
            let viewport = options.viewport,
                height = viewport.height,
                width = viewport.width,
                padding = 10;
            this.options = options;

            this.width = width;
            this.height = height;
            // Calculate percentage label
            this.getDataForPercent();
            this.getData();
            // Fetching capabilities
            this.viewModel = visualTransform(this.options, this.host, this);
            this.formatter = ValueFormatter.create({
                format: options.dataViews[0].categorical.values[0].source.format,
                precision: labelSettings.textPrecision,
                value: labelSettings.displayUnits,
            });

            // Render legends
            // Manage svg height and width based on legend height and width
            let legendHeight = 0;
            let legendWidth = 0;
            let vennHeight = options.viewport.height;
            let vennWidth = options.viewport.width;
            if (legendSetting.show) {
                this.renderLegend(this.viewModel);
                legendWidth = parseFloat($('.legend').attr('width'));
                legendHeight = parseFloat($('.legend').attr('height'));
                let legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                if (legendPos === 'top' || legendPos === 'topcenter' || legendPos === 'bottom' || legendPos === 'bottomcenter') {
                    vennHeight = vennHeight - legendHeight <= 0 ? 0 : vennHeight - legendHeight;
                } else if (legendPos === 'left' || legendPos === 'leftcenter' || legendPos === 'right' || legendPos === 'rightcenter') {
                    vennWidth = vennWidth - legendWidth <= 0 ? 0 : vennWidth - legendWidth;
                }
            } else {
                this.svg.style({
                    'margin-top': '0px'
                });
            }
            this.svg.attr({
                height: vennHeight,
                width: vennWidth,
            });

            // Adjust visual size and position according to legend position
            this.adjustVisual(legendSetting);
            this.vennPoints = this.viewModel.dataPoints;
            this.draw(this.width, this.height, this.viewModel);

            let selectionManager = this.selectionManager;
        }

        public getFormattedData(value: any, precision: number, displayUnits: number, maxVal: number): string {
            let formattedData = "";
            let formatValue = displayUnits;
            let formatter: any;
            let format = "";
            if (this.dataViews
                && this.dataViews.categorical
                && this.dataViews.categorical.values
                && this.dataViews.categorical.values[0]
                && this.dataViews.categorical.values[0].source
                && this.dataViews.categorical.values[0].source.format) {
                format = this.dataViews.categorical.values[0].source.format;
            }
            if (format === "")
                format = "0";
            if (formatValue === 0) {
                let alternateFormatter = parseInt(maxVal.toString(), 10).toString().length;
                let formatterVal = 10;
                if (alternateFormatter > 9) {
                    formatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    formatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter >= 4) {
                    formatterVal = 1e3;
                }
                formatter = ValueFormatter.create({
                    format: format,
                    precision: precision,
                    value: formatterVal,
                });
                this.formatter.value = formatterVal;
                formattedData = formatter.format(value);
            } else {
                formatter = ValueFormatter.create({
                    format: format,
                    precision: precision,
                    value: displayUnits,
                });
                this.formatter.value = formatValue;
                formattedData = formatter.format(value);
            }
            return formattedData;
        }

        public adjustVisual(legendSetting: LegendSetting) {
            let legendHeight = this.rootElement.select(".legend").attr("height");
            let legendWidth = this.rootElement.select(".legend").attr("width");
            let legendOrient = this.legend.getOrientation();
            if (legendSetting.show) {
                this.svg.style("margin-right", 0);
                switch (legendOrient) {
                    case 0:
                    case 5:
                    case 1:
                    case 4:
                    case 6: {
                        this.height = (this.height - parseFloat(legendHeight)) < 0 ? 0 : (this.height - parseFloat(legendHeight));
                        break;
                    }
                    case 2:
                    case 7:
                        this.width = (this.width - parseFloat(legendWidth)) < 0 ? 0 : (this.width - parseFloat(legendWidth));
                        break;
                    case 8:
                    case 3: {
                        this.width = (this.width - parseFloat(legendWidth)) < 0 ? 0 : (this.width - parseFloat(legendWidth));
                        break;
                    }
                    default:
                        break;
                }
            }
        }

        public renderLegend(viewModel: VennViewModel): void {
            let legendSettings: LegendSetting = this.getLegendSettings(this.dataView);
            if (!viewModel || !viewModel.legendData) {
                return;
            }
            if (this.dataView && this.dataView.metadata) {
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(this.dataView.metadata.objects, "legend", {});
            }
            let legendData: LegendData = viewModel.legendData;
            let legendDataTorender: LegendData = {
                dataPoints: [],
                fontSize: 8,
                title: legendData.title,
                showPrimary: legendData.showPrimary,
            };
            let totalValue: number = viewModel && viewModel.legendData && viewModel.legendData.measureSum ? viewModel.legendData.measureSum : 1;

            let dataArr = [];
            for (let iCounter = 0; iCounter < legendData.dataPoints.length; iCounter++) {
                let currVal: number = legendData.dataPoints[iCounter].measure ? legendData.dataPoints[iCounter].measure : 0;
                dataArr.push(currVal);
            }

            for (let iCounter = 0; iCounter < legendData.dataPoints.length; iCounter++) {
                // get the maximum value of the data
                let maxDataVal = Math.max.apply(null, dataArr);
                let formatterValue = 10;
                if (legendSettings.displayUnits === 0) {
                    let alternateValueFormatter = parseInt(maxDataVal, 10).toString().length;
                    if (alternateValueFormatter > 9) {
                        formatterValue = 1e9;
                    } else if (alternateValueFormatter <= 9 && alternateValueFormatter > 6) {
                        formatterValue = 1e6;
                    } else if (alternateValueFormatter <= 6 && alternateValueFormatter >= 4) {
                        formatterValue = 1e3;
                    }
                }
                let formatter = ValueFormatter.create({
                    format: this.dataView.categorical.values[0].source.format,
                    precision: legendSettings.decimalPlaces,
                    value: legendSettings.displayUnits === 0 ? formatterValue : legendSettings.displayUnits,
                });
                let tooltipFormatter = ValueFormatter.create({
                    format: this.dataView.categorical.values[0].source.format,
                    precision: 0,
                });
                let formattedMeasure = formatter.format(legendData.dataPoints[iCounter].measure);
                let formattedMeasureTooltip = tooltipFormatter.format(legendData.dataPoints[iCounter].measure);
                let percentageCalc = (legendData.dataPoints[iCounter].measure / totalValue) * 100;
                let percentageTooltip = `${percentageCalc.toFixed(4)}%`;
                let percentageVal = `${percentageCalc.toFixed(legendSettings.decimalPlaces)}%`;

                legendDataTorender.dataPoints.push({
                    color: legendData.dataPoints[iCounter].color,
                    icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                    identity: legendData.dataPoints[iCounter].identity,
                    label: legendData.dataPoints[iCounter].label,
                    measure: formattedMeasure,
                    measureTooltip: formattedMeasureTooltip,
                    percTooltip: percentageTooltip,
                    percentage: percentageVal,
                    selected: false,
                });
                legendValuesTorender[iCounter] = legendValues[iCounter];
            }
            if (this.legendObjectProperties) {
                powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                let position: string = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                if (position) {
                    this.legend.changeOrientation(LegendPosition[position]);
                }
                this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
                powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
            }
        }

        public Join(text: string) {
            let len = text.length;
            for (let iCounter = 1; iCounter < len; iCounter++) { //initialized iCounter=1 (column names null will not work)
                if (text[iCounter] === "$") {
                    return true;
                }
            }
            return false;
        }

        public getCombinations() {
            let oCounter = 0;
            for (let iCounter = 0; iCounter < Math.pow(2, this.NumberOfObjects); iCounter++) {
                let objectData = { sets: [], value: 0 };
                let newCombinationGenerated = "";
                for (let jCounter = 0; jCounter < this.NumberOfObjects; jCounter++) {
                    // tslint:disable-next-line:no-bitwise
                    if (iCounter & Math.pow(2, jCounter)) {
                        newCombinationGenerated = newCombinationGenerated + this.finalSingleObjects[jCounter] + "$";
                        objectData.sets.push(this.finalSingleObjects[jCounter]);
                    }
                }
                if (newCombinationGenerated !== "") {
                    if (this.Join(newCombinationGenerated.substring(0, newCombinationGenerated.length - 1))) {
                        this.finalOtherObjects[oCounter] = newCombinationGenerated.substring(0, newCombinationGenerated.length - 1);
                        oCounter++;
                    }
                    this.finalDataSet[iCounter - 1] = objectData;
                }
            }
        }
        public contains(a, n, x) {
            for (let i = 0; i < n; i++) {
                if (a[i] === x) {
                    return true;
                }
            }
        }
        public equalCombination(text1: string, text2: string) {
            let text1Split = text1.split("$");
            let text2Split = text2.split("$");
            let i;
            for (i = 0; i < text1Split.length; i++) {
                if (!this.contains(text2Split, text2Split.length, text1Split[i])) {
                    return false;
                }
            }
            for (i = 0; i < text2Split.length; i++) {
                if (!this.contains(text1Split, text1Split.length, text2Split[i])) {
                    return false;
                }
            }
            return true;
        }

        public getNamesOfCategories(): {
            "categories": string[],
            "values": number[],
        } {
            let categories: string[] = [];
            let count = this.dataView.categorical.categories[0].values.length;
            let catCount = this.dataView.categorical.categories.length;
            let cats = this.dataView.categorical.categories;
            let catValues = this.dataView.categorical.values[0].values;
            let values: number[] = [];
            let valuesNew: number[] = [];
            let supportCategories: string[][] = [];
            let This = this;
            for (let i = 0; i < count; i++) {
                let str = "";
                let value = catValues[i];
                for (let j = 0; j < catCount; j++) {
                    if (cats[j].values[i].toString().toLowerCase() === "yes"
                        || cats[j].values[i].toString().toLowerCase() === "true"
                        || cats[j].values[i].toString() === "1") {
                        str += cats[j].source.displayName + "$";
                    }
                }
                if (str.split("$").length > 1) {
                    categories.push(str.trim().substring(0, str.length - 1));
                    values.push(Number(value));
                    supportCategories.push(str.trim().split("$"));
                    valuesNew.push(0);
                }
            }
            // Calculating all sum up values
            categories.forEach(function (str, index) {
                categories.forEach(function (strInner, indexInner) {
                    if (This.FindMatch(supportCategories[index], supportCategories[indexInner])) {
                        valuesNew[index] += values[indexInner];
                    }
                });
            });

            // Adding all categories from the i/p dataset even if all of its entries are "no"
            if (categories.filter(str => str.split("$").length === 1).length !== catCount) {
                for (let k = 0; k < catCount; k++) {
                    if (categories.indexOf(cats[k].source.displayName) === -1) {
                        categories.push(cats[k].source.displayName);
                        valuesNew.push(0);
                        // ClickFlag[k] = false;
                    }
                }
            }

            return {
                "categories": categories,
                "values": valuesNew,
            };
        }

        public FindMatch(a: string[], b: string[]): boolean {
            let difference = a.filter(x => b.indexOf(x) === -1);
            return difference.length > 0 ? false : true;
        }

        public getDataForPercent() {
            let categorical = Object.getPrototypeOf(this.dataView.categorical);
            let data: any = {};
            let value: any = {};
            let jCounter = 0;
            let finalDataName = [];
            let finalDataValue = [];
            this.NumberOfObjects = 0;
            let iSumSingle = 0;
            let iSumOther = 0;
            let iSumTotal: any = {};
            this.finalSingleObjects = [];
            this.finalOtherObjects = [];
            this.finalPercentIndicator = [];
            this.percentIndicator = [];

            // changing logic
            let dataModified = {
                "categories": [],
                "values": [],
            };
            this.dataModified = dataModified = this.getNamesOfCategories();
            value = dataModified.values;
            data = dataModified.categories;

            let maxObj = 11;

            for (let iCounter = 0; iCounter < maxObj; iCounter++) {
                this.finalSingleObjectsValues[iCounter] = 0;
                this.finalOtherObjectsValues[iCounter] = 0;
                this.finalUpdatedSingleObjectsValues[iCounter] = 0;
                this.finalUpdatedOtherObjectsValues[iCounter] = 0;
            }

            for (let iCounter = 0; iCounter < data.length; iCounter++) {
                if (!this.Join(dataModified.categories[iCounter])) {
                    this.finalSingleObjects[jCounter] = dataModified.categories[iCounter];
                    this.finalSingleObjectsValues[jCounter] = dataModified.values[iCounter];
                    jCounter++;
                }
            }
            this.NumberOfObjects = numberOfObjects = this.dataView.categorical.categories.length;

            this.getCombinations();
            for (let iCounter = 1; iCounter < this.finalSingleObjects.length; iCounter++) {
                finalDataName[iCounter] = this.finalSingleObjects[iCounter];
                finalDataValue[iCounter] = 0;
            }
            for (let iCounter = this.finalSingleObjects.length; iCounter < this.finalSingleObjects.length + this.finalOtherObjects.length - 1; iCounter++) {
                finalDataName[iCounter] = this.finalOtherObjects[iCounter];
                finalDataValue[iCounter] = 0;
            }

            for (jCounter = 0; jCounter < data.length; jCounter++) {
                for (let iCounter = 1; iCounter < Math.pow(2, this.NumberOfObjects); iCounter++) {
                    if (data[jCounter] === finalDataName[iCounter]) {
                        this.finalDataSet[iCounter - 1].value = value[jCounter];
                        break;
                    }
                }
            }
            for (let iCounter = 0; iCounter < data.length; iCounter++) {
                for (jCounter = 0; jCounter < this.finalOtherObjects.length; jCounter++) {
                    if (this.equalCombination(data[iCounter], this.finalOtherObjects[jCounter])) {
                        this.finalOtherObjectsValues[jCounter] = value[iCounter];
                    }
                }
            }
            for (let iCounter = 0; iCounter < this.finalOtherObjects.length; iCounter++) {
                if (!this.finalOtherObjectsValues[iCounter]) {
                    this.finalOtherObjectsValues[iCounter] = 0;
                }
            }
            finalSingleObjects = this.finalSingleObjects;
            finalSingleObjectsValues = this.finalSingleObjectsValues;
            // Calculating individual region values
            this.finalUpdatedOtherObjectsValues[10] = this.finalOtherObjectsValues[10];

            this.finalUpdatedOtherObjectsValues[3] = this.finalOtherObjectsValues[3] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[3] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[6] = this.finalOtherObjectsValues[6] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[6] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[8] = this.finalOtherObjectsValues[8] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[8] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[9] = this.finalOtherObjectsValues[9] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[9] - this.finalOtherObjectsValues[10] : 0;

            let FUOOV0 = this.finalOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[0] = FUOOV0 < 0 ? 0 : FUOOV0;
            let FUOOV1 = this.finalOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[1] = FUOOV1 < 0 ? 0 : FUOOV1;
            let FUOOV2 = this.finalOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[2] = FUOOV2 < 0 ? 0 : FUOOV2;
            let FUOOV4 = this.finalOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[4] = FUOOV4 < 0 ? 0 : FUOOV4;
            let FUOOV5 = this.finalOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[5] = FUOOV5 < 0 ? 0 : FUOOV5;
            let FUOOV7 = this.finalOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[7] = FUOOV7 < 0 ? 0 : FUOOV7;


            let FUSOV0 = this.finalSingleObjectsValues[0]
                - this.finalUpdatedOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[8]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[0] = FUSOV0 < 0 ? 0 : FUSOV0;
            let FUSOV1 = this.finalSingleObjectsValues[1]
                - this.finalUpdatedOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[1] = FUSOV1 < 0 ? 0 : FUSOV1;
            let FUSOV2 = this.finalSingleObjectsValues[2]
                - this.finalUpdatedOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[2] = FUSOV2 < 0 ? 0 : FUSOV2;
            let FUSOV3 = this.finalSingleObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6]
                - this.finalUpdatedOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[3] = FUSOV3 < 0 ? 0 : FUSOV3;
            // Calculating percentage indicator value
            for (let iCounter = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                this.finalUpdatedSingleObjectsValues[iCounter] = this.finalUpdatedSingleObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedSingleObjectsValues[iCounter];
                iSumSingle += this.finalUpdatedSingleObjectsValues[iCounter];
            }
            for (let iCounter = 0; iCounter < this.finalUpdatedOtherObjectsValues.length; iCounter++) {
                this.finalUpdatedOtherObjectsValues[iCounter] = this.finalUpdatedOtherObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedOtherObjectsValues[iCounter];
                iSumOther += this.finalUpdatedOtherObjectsValues[iCounter];
            }
            iSumTotal = iSumSingle + iSumOther;
            for (let iCounter = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                this.finalPercentIndicator[iCounter] = ((this.finalUpdatedSingleObjectsValues[iCounter] / iSumTotal) * 100) < 0 ? 0 : (this.finalUpdatedSingleObjectsValues[iCounter] / iSumTotal) * 100;
                this.percentIndicator[iCounter] = this.finalPercentIndicator[iCounter];
                this.finalPercentIndicator[iCounter] = this.finalPercentIndicator[iCounter].toFixed(2) + "%";
            }
        }

        public getData() {
            let categorical = Object.getPrototypeOf(this.dataView.categorical);
            let data: any = {};
            let value: any = {};
            let jCounter = 0;
            let mCounter = 0;
            let lCounter = 0;
            let maxObj = 11;
            let finalDataName = [];
            let finalDataValue = [];
            this.NumberOfObjects = 0;
            this.finalSingleObjects = [];

            data = this.dataModified.categories;
            value = this.dataModified.values;

            for (let iCounter = 0; iCounter < maxObj; iCounter++) {
                this.finalSingleObjectsValues[iCounter] = 0;
                this.finalOtherObjectsValues[iCounter] = 0;
                this.finalUpdatedSingleObjectsValues[iCounter] = 0;
                this.finalUpdatedOtherObjectsValues[iCounter] = 0;
            }
            this.singleTempValue = [];
            for (let iCounter = 0; iCounter < data.length; iCounter++) {
                if (!this.Join(data[iCounter])) {
                    this.singleTemp[jCounter] = data[iCounter];
                    this.singleTempValue.push(value[iCounter]);
                    jCounter++;
                }
            }

            for (let iCounter = 0; iCounter < jCounter; iCounter++) {
                this.finalSingleObjects[lCounter] = this.singleTemp[iCounter];
                this.finalSingleObjectsValues[lCounter] = this.singleTempValue[iCounter];
                lCounter++;
            }
            this.NumberOfObjects = this.dataView.categorical.categories.length;
            this.getCombinations();
            for (let iCounter = 1; iCounter < this.finalSingleObjects.length; iCounter++) {
                finalDataName[iCounter] = this.finalSingleObjects[iCounter];
                finalDataValue[iCounter] = 0;
            }
            for (let iCounter = this.finalSingleObjects.length; iCounter < this.finalSingleObjects.length + this.finalOtherObjects.length - 1; iCounter++) {
                finalDataName[iCounter] = this.finalOtherObjects[iCounter];
                finalDataValue[iCounter] = 0;
            }

            for (jCounter = 0; jCounter < data.length; jCounter++) {
                for (let iCounter = 1; iCounter < Math.pow(2, this.NumberOfObjects); iCounter++) {
                    if (data[jCounter] === finalDataName[iCounter]) {
                        this.finalDataSet[iCounter - 1].value = value[jCounter];
                        break;
                    }
                }
            }
            for (let iCounter = 0; iCounter < data.length; iCounter++) {
                for (jCounter = 0; jCounter < this.finalOtherObjects.length; jCounter++) {
                    if (this.equalCombination(data[iCounter], this.finalOtherObjects[jCounter])) {
                        this.finalOtherObjectsValues[jCounter] = value[iCounter];
                    }
                }
            }

            for (let iCounter = 0; iCounter < this.finalOtherObjects.length; iCounter++) {
                if (this.finalOtherObjects[iCounter].split("$").length > this.NumberOfObjects) {
                    this.finalOtherObjectsValues[iCounter] = 0;
                }
            }

            for (let iCounter = 0; iCounter < 11; iCounter++) {
                if (!this.finalOtherObjectsValues[iCounter]) {
                    this.finalOtherObjectsValues[iCounter] = 0;
                }
            }

            if (this.NumberOfObjects === 2) {
                for (let iCounter = 0; iCounter < 11; iCounter++) {
                    if (iCounter !== 0) {
                        this.finalOtherObjectsValues[iCounter] = 0;
                    }
                }
            }

            if (this.NumberOfObjects === 3) {
                for (let iCounter = 0; iCounter < 11; iCounter++) {
                    if (iCounter !== 0 && iCounter !== 1 && iCounter !== 2 && iCounter !== 3) {
                        this.finalOtherObjectsValues[iCounter] = 0;
                    }
                }
            }
            finalSingleObjects = this.finalSingleObjects;
            finalSingleObjectsValues = this.finalSingleObjectsValues;
            // Calculating individual region value
            this.finalUpdatedOtherObjectsValues[10] = this.finalOtherObjectsValues[10];

            this.finalUpdatedOtherObjectsValues[3] = this.finalOtherObjectsValues[3] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[3] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[6] = this.finalOtherObjectsValues[6] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[6] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[8] = this.finalOtherObjectsValues[8] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[8] - this.finalOtherObjectsValues[10] : 0;
            this.finalUpdatedOtherObjectsValues[9] = this.finalOtherObjectsValues[9] > this.finalOtherObjectsValues[10] ? this.finalOtherObjectsValues[9] - this.finalOtherObjectsValues[10] : 0;

            let FUOOV0 = this.finalOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[0] = FUOOV0 < 0 ? 0 : FUOOV0;
            let FUOOV1 = this.finalOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[1] = FUOOV1 < 0 ? 0 : FUOOV1;
            let FUOOV2 = this.finalOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[2] = FUOOV2 < 0 ? 0 : FUOOV2;
            let FUOOV4 = this.finalOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[4] = FUOOV4 < 0 ? 0 : FUOOV4;
            let FUOOV5 = this.finalOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[5] = FUOOV5 < 0 ? 0 : FUOOV5;
            let FUOOV7 = this.finalOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9] - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedOtherObjectsValues[7] = FUOOV7 < 0 ? 0 : FUOOV7;


            let FUSOV0 = this.finalSingleObjectsValues[0]
                - this.finalUpdatedOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[8]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[0] = FUSOV0 < 0 ? 0 : FUSOV0;
            let FUSOV1 = this.finalSingleObjectsValues[1]
                - this.finalUpdatedOtherObjectsValues[0] - this.finalUpdatedOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[1] = FUSOV1 < 0 ? 0 : FUSOV1;
            let FUSOV2 = this.finalSingleObjectsValues[2]
                - this.finalUpdatedOtherObjectsValues[1] - this.finalUpdatedOtherObjectsValues[2] - this.finalUpdatedOtherObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[2] = FUSOV2 < 0 ? 0 : FUSOV2;
            let FUSOV3 = this.finalSingleObjectsValues[3]
                - this.finalUpdatedOtherObjectsValues[4] - this.finalUpdatedOtherObjectsValues[5] - this.finalUpdatedOtherObjectsValues[6]
                - this.finalUpdatedOtherObjectsValues[7] - this.finalUpdatedOtherObjectsValues[8] - this.finalUpdatedOtherObjectsValues[9]
                - this.finalUpdatedOtherObjectsValues[10];
            this.finalUpdatedSingleObjectsValues[3] = FUSOV3 < 0 ? 0 : FUSOV3;

            for (let iCounter = 0; iCounter < this.finalUpdatedSingleObjectsValues.length; iCounter++) {
                this.finalUpdatedSingleObjectsValues[iCounter] = this.finalUpdatedSingleObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedSingleObjectsValues[iCounter];
            }
            for (let iCounter = 0; iCounter < this.finalUpdatedOtherObjectsValues.length; iCounter++) {
                this.finalUpdatedOtherObjectsValues[iCounter] = this.finalUpdatedOtherObjectsValues[iCounter] < 0 ? 0 : this.finalUpdatedOtherObjectsValues[iCounter];
            }
        }

        public min(a: number, b: number) {
            if (a < b) {
                return a;
            } else {
                return b;
            }
        }
        public max(a: number, b: number) {
            if (a > b) {
                return a;
            } else {
                return b;
            }
        }

        public drawOneObjects(width: number, height: number, marginX: number, marginY: number, color: any) {
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            let opSettings: OpacitySettings = this.getOpacitySettings(this.dataViews);
            let externalOpacity = opSettings.externalArc / 100;
            let mainGroup = this.mainGroup;
            width = width - 2 * marginX;
            height = height - 2 * marginY;
            let circleRadius = this.min(width, height) / 3;
            this.circles[0] = this.mainGroup.append("circle");
            this.texts[0] = this.mainGroup.append("text");
            this.texts[1] = this.mainGroup.append("text");

            this.circles[0]
                .attr({
                    "cx": width / 2 + circleRadius / 2,
                    "cy": height / 2,
                    "r": circleRadius,
                })
                .style({
                    "fill": color[0],
                    "opacity": externalOpacity,
                })
                .classed("A", true);

            if (labelSettings.show) {
                let precision: number = labelSettings.textPrecision;
                let displayUnits: number = labelSettings.displayUnits;
                let maxVal: number = Math.max.apply(null, this.finalSingleObjectsValues);

                let textProps = [];
                textProps.push({ "val": this.getFormattedData(this.finalSingleObjectsValues[0], precision, displayUnits, maxVal), "x": width / 2 + circleRadius / 2, "y": height / 2, "maxWidth": circleRadius * 2 }); // A

                let measureDataProperties: TextProperties = {
                    fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                    fontSize: labelSettings.fontSize + "px",
                    text: textProps[0].val,
                };
                this.mainGroup
                    .append("text")
                    .classed('venn_singleLabel', true)
                    .attr({
                        "fill": labelSettings.color,
                        "font-size": labelSettings.fontSize + "px",
                        "text-anchor": "middle",
                        "x": textProps[0].x,
                        "y": textProps[0].y,
                    })
                    .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[0].maxWidth));
            }

            let maxVal = Math.max.apply(null, this.finalUpdatedSingleObjectsValues);
            // Add tooltip
            let tooltipData = [];
            tooltipData.push({ "key": this.finalSingleObjects[0], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal) }); // A
            this.svg.selectAll("circle").data(tooltipData);
            this.svg.selectAll(".venn_singleLabel").data(tooltipData);

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll("circle, .venn_singleLabel"),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        public drawTwoObjects(width: number, height: number, marginX: number, marginY: number, color: any) {
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            let opSettings: OpacitySettings = this.getOpacitySettings(this.dataViews);
            let externalOpacity = opSettings.externalArc / 100;
            let internalOpacity = opSettings.internalArc / 100;
            let mainGroup = this.mainGroup;
            let finalOtherObjectsValues = this.finalOtherObjectsValues;
            let finalUpdatedSingleObjectsValues = this.finalUpdatedSingleObjectsValues;
            let finalUpdatedOtherObjectsValues = this.finalUpdatedOtherObjectsValues;

            width = width - 2.5 * marginX;
            height = height - 2 * marginY;

            // Calculate radius circles
            let circleRadius = this.min(width, height) / 3;

            // Calculate centre of circles
            let CentreAx = width / 2;
            let CentreAy = height / 2;
            let CentreBx = width / 2 + circleRadius;
            let CentreBy = height / 2;

            // Calculate IntersectionPoint
            let distanceIntersectionPoint = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let IntersectionPointX = CentreAx + circleRadius / 2;
            let IntersectionPointYTop = CentreAy - distanceIntersectionPoint;
            let IntersectionPointYBottom = CentreAy + distanceIntersectionPoint;


            // Create paths
            let pathCoordinates0 = "M" + IntersectionPointX + " " + IntersectionPointYTop
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointX + " " + IntersectionPointYBottom
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 1 + "," + 1 + "," + IntersectionPointX + " " + IntersectionPointYTop;

            this.paths[0] = this.mainGroup.append("path");
            this.paths[0].attr({ "d": pathCoordinates0, "fill": color[0] })
                .style("opacity", externalOpacity)
                .classed("A", true);

            let pathCoordinates1 = "M" + IntersectionPointX + " " + IntersectionPointYTop
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 1 + "," + 1 + "," + IntersectionPointX + " " + IntersectionPointYBottom
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointX + " " + IntersectionPointYTop;

            this.paths[1] = this.mainGroup.append("path");
            this.paths[1].attr({ "d": pathCoordinates1, "fill": color[1] })
                .style("opacity", externalOpacity)
                .classed("B", true);


            let pathCoordinates2 = "M" + IntersectionPointX + " " + IntersectionPointYTop
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointX + " " + IntersectionPointYBottom
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointX + " " + IntersectionPointYTop;

            color[2] = colorAverage(color[0], color[1]).toString();
            this.paths[2] = this.mainGroup.append("path");
            this.paths[2].attr({ "d": pathCoordinates2 })
                .style("fill", color[2])
                .style("opacity", internalOpacity)
                .classed("AB", true);

            // funtion to calculate intermediate color
            function padToTwo(numberString) {
                if (numberString.length < 2) {
                    numberString = "0" + numberString;
                }
                return numberString;
            }
            function colorAverage(a, b) {
                let args = Array.prototype.slice.call(arguments);
                return args.reduce(function (prev, currentValue) {
                    return currentValue.replace(/^#/, "")
                        .match(/.{2}/g)
                        .map(function (value, index) {
                            return prev[index] + parseInt(value, 16);
                        });
                }, [0, 0, 0])
                    .reduce(function (prev, currentValue) {
                        return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                    }, "#");
            }

            if (labelSettings.show) {
                let precision: number = labelSettings.textPrecision;
                let displayUnits: number = labelSettings.displayUnits;
                let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                let maxVal = Math.max.apply(null, fullDataArr);
                // Add text
                let textProps = [];
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], precision, displayUnits, maxVal), "x": width / 2 - circleRadius / 2, "y": height / 2, "maxWidth": circleRadius }); // A
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], precision, displayUnits, maxVal), "x": CentreAx + circleRadius + circleRadius / 2, "y": height / 2, "maxWidth": circleRadius }); // B
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], precision, displayUnits, maxVal), "x": (CentreAx + CentreBx) / 2, "y": height / 2, "maxWidth": circleRadius }); // AB
                for (let iCounter = 0; iCounter < 3; iCounter++) {
                    let measureDataProperties: TextProperties = {
                        fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                        fontSize: labelSettings.fontSize + "px",
                        text: textProps[iCounter].val,
                    };
                    this.mainGroup.append("text")
                        .attr({
                            "fill": labelSettings.color,
                            "font-size": labelSettings.fontSize + "px",
                            "text-anchor": "middle",
                            "x": textProps[iCounter].x,
                            "y": textProps[iCounter].y,
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                }
            }

            let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
            let maxVal = Math.max.apply(null, fullDataArr);
            // Add tooltip
            let tooltipData = [];
            tooltipData.push({ "key": this.finalSingleObjects[0], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal) }); // A
            tooltipData.push({ "key": this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal) }); // B
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal) }); // AB

            this.svg.selectAll("path").data(tooltipData);
            this.svg.selectAll("text").data(tooltipData);

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll("path, text"),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        public drawThreeObjects(width: number, height: number, marginX: number, marginY: number, color: any) {
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            let opSettings: OpacitySettings = this.getOpacitySettings(this.dataViews);
            let externalOpacity = opSettings.externalArc / 100;
            let internalOpacity = opSettings.internalArc / 100;
            let mainGroup = this.mainGroup;
            let circleRadius;
            width = width - 2.5 * marginX;
            height = height - 2 * marginY;
            circleRadius = this.min(width, height) / 3;

            // Calculate Centre Of circle
            let centreAx = width / 2;
            let centreAy = marginY + height / 4;
            let centreBx = width / 2 + circleRadius;
            let centreBy = marginY + height / 4;

            // Calculate IntersectionPoint
            let distanceIntersectionPoint1 = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let IntersectionPointAB_X = centreAx + circleRadius / 2;
            let IntersectionPointABTop_Y = centreAy - distanceIntersectionPoint1;
            let IntersectionPointABBottom_Y = centreAy + distanceIntersectionPoint1;

            let IntersectionPointXTop2 = width / 2 + circleRadius;
            let IntersectionPointYTop2 = marginY + height / 4;
            let IntersectionPointACBottom_X = width / 2 + circleRadius / 2 - circleRadius;
            let IntersectionPointACBottom_Y = IntersectionPointABBottom_Y;

            let IntersectionPointBCTop_X = width / 2;
            let IntersectionPointBCTop_Y = marginY + height / 4;
            let IntersectionPointBCBottom_X = width / 2 + circleRadius / 2 + circleRadius;
            let IntersectionPointBCBottom_Y = IntersectionPointABBottom_Y;

            let centreCx = width / 2 + circleRadius / 2;
            let centreCy = IntersectionPointABBottom_Y;
            // Create paths
            let pathCoordinates0 = "M" + IntersectionPointAB_X + " " + IntersectionPointABTop_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointBCTop_X + " " + IntersectionPointBCTop_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointACBottom_X + " " + IntersectionPointACBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + IntersectionPointAB_X + " " + IntersectionPointABTop_Y;

            this.paths[0] = this.mainGroup.append("path")
                .attr("d", pathCoordinates0)
                .attr("fill", color[0])
                .attr("opacity", externalOpacity)
                .classed("A", true);

            let pathCoordinates1 = "M" + IntersectionPointAB_X + " " + IntersectionPointABTop_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + IntersectionPointBCBottom_X + " " + IntersectionPointBCBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointAB_X + " " + IntersectionPointABTop_Y;

            this.paths[1] = this.mainGroup.append("path")
                .attr("d", pathCoordinates1)
                .attr("fill", color[1])
                .attr("opacity", externalOpacity)
                .classed("B", true);

            let pathCoordinates2 = "M" + IntersectionPointACBottom_X + " " + IntersectionPointACBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointBCBottom_X + " " + IntersectionPointBCBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + IntersectionPointACBottom_X + " " + IntersectionPointACBottom_Y;

            this.paths[2] = this.mainGroup.append("path")
                .attr("d", pathCoordinates2)
                .attr("fill", color[2])
                .attr("opacity", externalOpacity)
                .classed("C", true);

            let pathCoordinates3 = "M" + IntersectionPointAB_X + " " + IntersectionPointABTop_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointAB_X + " " + IntersectionPointABTop_Y;

            color[3] = colorAverage(color[0], color[1]).toString();
            this.paths[3] = this.mainGroup.append("path")
                .attr("d", pathCoordinates3)
                .attr("fill", color[3])
                .attr("opacity", internalOpacity)
                .classed("AB", true);

            let pathCoordinates4 = "M" + IntersectionPointACBottom_X + " " + IntersectionPointACBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + IntersectionPointACBottom_X + " " + IntersectionPointACBottom_Y;

            color[4] = colorAverage(color[0], color[2]).toString();
            this.paths[4] = this.mainGroup.append("path")
                .attr("d", pathCoordinates4)
                .attr("fill", color[4])
                .attr("opacity", internalOpacity)
                .classed("AC", true);

            let pathCoordinates5 = "M" + IntersectionPointBCBottom_X + " " + IntersectionPointBCBottom_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + IntersectionPointBCBottom_X + " " + IntersectionPointBCBottom_Y;
            color[5] = colorAverage(color[1], color[2]).toString();
            this.paths[5] = this.mainGroup.append("path")
                .attr("d", pathCoordinates5)
                .attr("fill", color[5])
                .attr("opacity", internalOpacity)
                .classed("BC", true);

            let pathCoordinates6 = "M" + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreAx + " " + centreAy;

            color[6] = colorAverage(color[4], color[5]).toString();
            color[6] = colorAverage(color[6], color[5]).toString();
            this.paths[6] = this.mainGroup.append("path")
                .attr("d", pathCoordinates6)
                .attr("fill", color[6])
                .attr("opacity", internalOpacity)
                .classed("ABC", true);

            // funtion to calculate intermediate color
            function padToTwo(numberString) {
                if (numberString.length < 2) {
                    numberString = "0" + numberString;
                }
                return numberString;
            }

            function colorAverage(a, b) {
                let args = Array.prototype.slice.call(arguments);
                return args.reduce(function (prev, currentValue) {
                    return currentValue
                        .replace(/^#/, "")
                        .match(/.{2}/g)
                        .map(function (value, index) {
                            return prev[index] + parseInt(value, 16);
                        });
                }, [0, 0, 0])
                    .reduce(function (prev, currentValue) {
                        return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                    }, "#");
            }

            if (labelSettings.show) {
                let labelPrecision: number = labelSettings.textPrecision;
                let labelDisplayUnits: number = labelSettings.displayUnits;

                let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
                let maxVal = Math.max.apply(null, fullDataArr);
                // Add text
                let textProps = [];
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2 - circleRadius / 3, "y": height / 4 + circleRadius / 4, "maxWidth": circleRadius - 30 }); // A
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2 + circleRadius + circleRadius / 3, "y": height / 4 + circleRadius / 4, "maxWidth": circleRadius - 30 }); // B
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[2], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2 + circleRadius / 2, "y": marginY + height / 4 + 1.5 * circleRadius, "maxWidth": circleRadius }); // C
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2 + circleRadius / 2, "y": (height / 4 + circleRadius / 8) - 10, "maxWidth": circleRadius - 30 }); // AB
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[1], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2.05, "y": marginY + height / 3.5 + circleRadius / 2, "maxWidth": circleRadius / 1.8 }); // AC
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], labelPrecision, labelDisplayUnits, maxVal), "x": width / 1.95 + circleRadius, "y": marginY + height / 3.5 + circleRadius / 2, "maxWidth": circleRadius / 1.8 }); // BC
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], labelPrecision, labelDisplayUnits, maxVal), "x": width / 2 + circleRadius / 2, "y": (marginY + height / 4 + circleRadius / 2), "maxWidth": circleRadius / 1.8 }); // ABC

                for (let iCounter = 0; iCounter < 7; iCounter++) {
                    let measureDataProperties: TextProperties = {
                        fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                        fontSize: labelSettings.fontSize + "px",
                        text: textProps[iCounter].val,
                    };
                    this.mainGroup.append("text")
                        .attr({
                            "fill": labelSettings.color,
                            "font-size": labelSettings.fontSize + "px",
                            "text-anchor": "middle",
                            "x": textProps[iCounter].x,
                            "y": textProps[iCounter].y,
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                }
            }

            let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues);
            let maxVal = Math.max.apply(null, fullDataArr);
            // Add tooltip
            let tooltipData = [];
            tooltipData.push({ "key": this.finalSingleObjects[0], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal) }); // A
            tooltipData.push({ "key": this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal) }); // B
            tooltipData.push({ "key": this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[2], 0, 1, maxVal) }); // C
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal) }); // AB
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[1], 0, 1, maxVal) }); // AC
            tooltipData.push({ "key": this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], 0, 1, maxVal) }); // BC
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], 0, 1, maxVal) }); // ABC

            this.svg.selectAll("path").data(tooltipData);
            this.svg.selectAll("text").data(tooltipData);

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll("path, text"),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        public drawFourObjects(width: number, height: number, marginX: number, marginY: number, color: any) {
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            let opSettings: OpacitySettings = this.getOpacitySettings(this.dataViews);
            let externalOpacity = opSettings.externalArc / 100;
            let internalOpacity = opSettings.internalArc / 100;
            let mainGroup = this.mainGroup;
            let finalUpdatedOtherObjectsValues = this.finalUpdatedOtherObjectsValues;
            width = width - 2.2 * marginX - this.min(width, height) / 32;
            height = height - 2 * marginY;
            let circleRadius = this.min(width, height) / 3;

            // Calculate Centre for two circles
            let centreAx = width / 2 - circleRadius / 4;
            let centreAy = marginY + height / 2;
            let centreCx = width / 2 + 1.25 * circleRadius;
            let centreCy = marginY + height / 2;

            // find IntersectionPoint for two circles
            let distanceIntersectionPoint1 = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let IntersectionPointAB_X = centreAx + circleRadius / 2;
            let IntersectionPointYTop1 = centreAy - distanceIntersectionPoint1;
            let IntersectionPointYBottom1 = centreAy + distanceIntersectionPoint1;

            // Calculate centre
            let centreBx = width / 2 + circleRadius / 2;
            let centreBy = IntersectionPointYBottom1 - 3 * circleRadius / 16;
            let centreDx = width / 2 + circleRadius / 2;
            let centreDy = IntersectionPointYTop1 + 3 * circleRadius / 16;


            // Calculate IntersectionPoint for each circles
            let distanceIntersectionPointAD_X = (centreAx + centreDx) / 2;
            let distanceIntersectionPointAD_Y = (centreAy + centreDy) / 2;
            let distanceIntersectionAD_Top = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let distanceIntersectionPointTopAD_X = distanceIntersectionPointAD_X - .570 * circleRadius;
            let distanceIntersectionPointTopAD_Y = distanceIntersectionPointAD_Y - distanceIntersectionAD_Top + .22 * circleRadius;
            let distanceIntersectionPointBottomAD_X = distanceIntersectionPointAD_X + .570 * circleRadius;
            let distanceIntersectionPointBottomAD_Y = distanceIntersectionPointAD_Y + distanceIntersectionAD_Top - .22 * circleRadius;

            let distanceIntersectionPointDC_X = (centreCx + centreDx) / 2;
            let distanceIntersectionPointDC_Y = (centreCy + centreDy) / 2;
            let distanceIntersectionDC_Top = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let distanceIntersectionPointTopDC_X = distanceIntersectionPointDC_X + .570 * circleRadius;
            let distanceIntersectionPointTopDC_Y = distanceIntersectionPointDC_Y - distanceIntersectionDC_Top + .22 * circleRadius;
            let distanceIntersectionPointBottomDC_X = distanceIntersectionPointDC_X - .570 * circleRadius;
            let distanceIntersectionPointBottomDC_Y = distanceIntersectionPointDC_Y + distanceIntersectionDC_Top - .22 * circleRadius;

            let distanceIntersectionPointAB_X = (centreAx + centreBx) / 2;
            let distanceIntersectionPointAB_Y = (centreAy + centreBy) / 2;
            let distanceIntersectionAB_Top = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let distanceIntersectionPointTopAB_X = distanceIntersectionPointAB_X + .570 * circleRadius;
            let distanceIntersectionPointTopAB_Y = distanceIntersectionPointAB_Y - distanceIntersectionAB_Top + .22 * circleRadius;
            let distanceIntersectionPointBottomAB_X = distanceIntersectionPointAB_X - .570 * circleRadius;
            let distanceIntersectionPointBottomAB_Y = distanceIntersectionPointAB_Y + distanceIntersectionAB_Top - .22 * circleRadius;

            let distanceIntersectionPointBC_X = (centreCx + centreBx) / 2;
            let distanceIntersectionPointBC_Y = (centreCy + centreBy) / 2;
            let distanceIntersectionBC_Top = Math.sqrt(Math.pow(circleRadius, 2) - (Math.pow(circleRadius, 2) / 4));
            let distanceIntersectionPointTopBC_X = distanceIntersectionPointBC_X - .570 * circleRadius;
            let distanceIntersectionPointTopBC_Y = distanceIntersectionPointBC_Y - distanceIntersectionBC_Top + .22 * circleRadius;
            let distanceIntersectionPointBottomBC_X = distanceIntersectionPointBC_X + .570 * circleRadius;
            let distanceIntersectionPointBottomBC_Y = distanceIntersectionPointBC_Y + distanceIntersectionBC_Top - .22 * circleRadius;

            // Draw paths
            let pathCoordinates0 = "M" + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomAB_X + " " + distanceIntersectionPointBottomAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopAD_X + " " + distanceIntersectionPointTopAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreAx + " " + centreAy;

            this.paths[0] = this.mainGroup.append("path")
                .attr("d", pathCoordinates0)
                .attr("fill", color[0])
                .attr("opacity", externalOpacity)
                .classed("A", true);

            let pathCoordinates1 = "M" + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomAB_X + " " + distanceIntersectionPointBottomAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomBC_X + " " + distanceIntersectionPointBottomBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreBx + " " + centreBy;

            this.paths[1] = this.mainGroup.append("path")
                .attr("d", pathCoordinates1)
                .attr("fill", color[1])
                .attr("opacity", externalOpacity)
                .classed("B", true);

            let pathCoordinates2 = "M" + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopDC_X + " " + distanceIntersectionPointTopDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomBC_X + " " + distanceIntersectionPointBottomBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreCx + " " + centreCy;

            this.paths[2] = this.mainGroup.append("path")
                .attr("d", pathCoordinates2)
                .attr("fill", color[2])
                .attr("opacity", externalOpacity)
                .classed("C", true);

            let pathCoordinates3 = "M" + centreDx + " " + centreDy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopDC_X + " " + distanceIntersectionPointTopDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopAD_X + " " + distanceIntersectionPointTopAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreDx + " " + centreDy;

            this.paths[3] = this.mainGroup.append("path")
                .attr("d", pathCoordinates3)
                .attr("fill", color[3])
                .attr("opacity", externalOpacity)
                .classed("D", true);


            let pathCoordinates4 = "M" + distanceIntersectionPointTopAD_X + " " + distanceIntersectionPointTopAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreDx + " " + centreDy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopBC_X + " " + distanceIntersectionPointTopBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopAD_X + " " + distanceIntersectionPointTopAD_Y;

            // funtion to calculate intermediate color
            function padToTwo(numberString) {
                if (numberString.length < 2) {
                    numberString = "0" + numberString;
                }
                return numberString;
            }

            function colorAverage(a, b) {
                let args = Array.prototype.slice.call(arguments);
                return args.reduce(function (prev, currentValue) {
                    return currentValue
                        .replace(/^#/, "")
                        .match(/.{2}/g)
                        .map(function (value, index) {
                            return prev[index] + parseInt(value, 16);
                        });
                }, [0, 0, 0])
                    .reduce(function (prev, currentValue) {
                        return prev + padToTwo(Math.floor(currentValue / args.length).toString(16));
                    }, "#");
            }

            color[4] = colorAverage(color[0], color[3]).toString();
            this.paths[4] = this.mainGroup.append("path")
                .attr("d", pathCoordinates4)
                .attr("fill", color[4])
                .attr("opacity", internalOpacity)
                .classed("AD", true);


            let pathCoordinates5 = "M" + distanceIntersectionPointTopDC_X + " " + distanceIntersectionPointTopDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreDx + " " + centreDy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopAB_X + " " + distanceIntersectionPointTopAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopDC_X + " " + distanceIntersectionPointTopDC_Y;

            color[5] = colorAverage(color[2], color[3]).toString();
            this.paths[5] = this.mainGroup.append("path")
                .attr("d", pathCoordinates5)
                .attr("fill", color[5])
                .attr("opacity", internalOpacity)
                .classed("CD", true);

            let pathCoordinates6 = "M" + distanceIntersectionPointBottomAB_X + " " + distanceIntersectionPointBottomAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomDC_X + " " + distanceIntersectionPointBottomDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomAB_X + " " + distanceIntersectionPointBottomAB_Y;

            color[6] = colorAverage(color[0], color[1]).toString();
            this.paths[6] = this.mainGroup.append("path")
                .attr("d", pathCoordinates6)
                .attr("fill", color[6])
                .attr("opacity", internalOpacity)
                .classed("AB", true);


            let pathCoordinates7 = "M" + distanceIntersectionPointBottomBC_X + " " + distanceIntersectionPointBottomBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomAD_X + " " + distanceIntersectionPointBottomAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomBC_X + " " + distanceIntersectionPointBottomBC_Y;

            color[7] = colorAverage(color[1], color[2]).toString();
            this.paths[7] = this.mainGroup.append("path")
                .attr("d", pathCoordinates7)
                .attr("fill", color[7])
                .attr("opacity", internalOpacity)
                .classed("BC", true);

            let pathCoordinates8 = "M" + centreBx + " " + centreBy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomAD_X + " " + distanceIntersectionPointBottomAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomDC_X + " " + distanceIntersectionPointBottomDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreBx + " " + centreBy;

            color[8] = colorAverage(color[6], color[7]).toString();
            this.paths[8] = this.mainGroup.append("path")
                .attr("d", pathCoordinates8)
                .attr("fill", color[8])
                .attr("opacity", internalOpacity)
                .classed("ABC", true);

            let pathCoordinates9 = "M" + centreAx + " " + centreAy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopBC_X + " " + distanceIntersectionPointTopBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointBottomDC_X + " " + distanceIntersectionPointBottomDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + centreAx + " " + centreAy;

            color[9] = colorAverage(color[4], color[6]).toString();
            this.paths[9] = this.mainGroup.append("path")
                .attr("d", pathCoordinates9)
                .attr("fill", color[9])
                .attr("opacity", internalOpacity)
                .classed("ABD", true);

            let pathCoordinates10 = "M" + centreDx + " " + centreDy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopBC_X + " " + distanceIntersectionPointTopBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopAB_X + " " + distanceIntersectionPointTopAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreDx + " " + centreDy;

            color[10] = colorAverage(color[4], color[5]).toString();
            this.paths[10] = this.mainGroup.append("path")
                .attr("d", pathCoordinates10)
                .attr("fill", color[10])
                .attr("opacity", internalOpacity)
                .classed("ACD", true);

            let pathCoordinates11 = "M" + centreCx + " " + centreCy
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + distanceIntersectionPointTopAB_X + " " + distanceIntersectionPointTopAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomAD_X + " " + distanceIntersectionPointBottomAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 0 + "," + centreCx + " " + centreCy;

            color[11] = colorAverage(color[7], color[5]).toString();
            this.paths[11] = this.mainGroup.append("path")
                .attr("d", pathCoordinates11)
                .attr("fill", color[11])
                .attr("opacity", internalOpacity)
                .classed("BCD", true);


            let pathCoordinates12 = "M" + distanceIntersectionPointTopAB_X + " " + distanceIntersectionPointTopAB_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomAD_X + " " + distanceIntersectionPointBottomAD_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointBottomDC_X + " " + distanceIntersectionPointBottomDC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopBC_X + " " + distanceIntersectionPointTopBC_Y
                + "A " + circleRadius + " " + circleRadius + "," + 0 + "," + 0 + "," + 1 + "," + distanceIntersectionPointTopAB_X + " " + distanceIntersectionPointTopAB_Y;
            color[13] = colorAverage(color[8], color[9]).toString();
            color[14] = colorAverage(color[10], color[11]).toString();
            color[12] = colorAverage(color[13], color[14]).toString();
            this.paths[12] = this.mainGroup.append("path")
                .attr("d", pathCoordinates12)
                .attr("fill", color[12])
                .attr("opacity", internalOpacity)
                .classed("ABCD", true);

            if (labelSettings.show) {
                let labelDisplayUnits: number = labelSettings.displayUnits;
                let labelPrecision: number = labelSettings.textPrecision;
                let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues, this.finalOtherObjectsValues);
                let maxVal = Math.max.apply(null, fullDataArr);
                // Add text
                let textProps = [];
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], labelPrecision, labelDisplayUnits, maxVal), "x": centreAx - circleRadius / 2, "y": centreAy + circleRadius / 16, "maxWidth": circleRadius }); // A
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], labelPrecision, labelDisplayUnits, maxVal), "x": centreBx, "y": centreBy + circleRadius / 2, "maxWidth": circleRadius * 1.8 }); // B
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[2], labelPrecision, labelDisplayUnits, maxVal), "x": centreCx + circleRadius / 2, "y": centreCy + circleRadius / 16, "maxWidth": circleRadius }); // C
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedSingleObjectsValues[3], labelPrecision, labelDisplayUnits, maxVal), "x": centreDx, "y": centreDy - circleRadius / 2, "maxWidth": circleRadius * 1.8 }); // D
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[4], labelPrecision, labelDisplayUnits, maxVal), "x": (centreAx + centreDx - circleRadius / 2) / 2, "y": (centreAy + centreDy - circleRadius / 2) / 2, "maxWidth": circleRadius / 1.8 }); // AD
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[7], labelPrecision, labelDisplayUnits, maxVal), "x": (centreDx + centreCx + circleRadius / 2) / 2, "y": (centreDy + centreCy - circleRadius / 2) / 2, "maxWidth": circleRadius / 1.8 }); // CD
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], labelPrecision, labelDisplayUnits, maxVal), "x": (centreAx + centreBx - circleRadius / 2) / 2, "y": (centreAy + centreBy + circleRadius / 2) / 2, "maxWidth": circleRadius / 1.8 }); // AB
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], labelPrecision, labelDisplayUnits, maxVal), "x": (centreBx + centreCx + circleRadius / 2) / 2, "y": (centreBy + centreCy + circleRadius / 2) / 2, "maxWidth": circleRadius / 1.8 }); // BC
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], labelPrecision, labelDisplayUnits, maxVal), "x": centreBx, "y": centreBy - circleRadius / 6, "maxWidth": circleRadius / 3.5 }); // ABC
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[6], labelPrecision, labelDisplayUnits, maxVal), "x": centreAx + circleRadius / 3.5, "y": centreAy + circleRadius / 16, "maxWidth": circleRadius / 2.2 }); // ABD
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[8], labelPrecision, labelDisplayUnits, maxVal), "x": centreDx, "y": centreDy + circleRadius / 4, "maxWidth": circleRadius / 3.5 }); // ACD
                textProps.push({ "val": this.getFormattedData(this.finalUpdatedOtherObjectsValues[9], labelPrecision, labelDisplayUnits, maxVal), "x": centreCx - circleRadius / 3.5, "y": centreCy + circleRadius / 16, "maxWidth": circleRadius / 2.2 }); // BCD
                textProps.push({ "val": this.getFormattedData(this.finalOtherObjectsValues[10], labelPrecision, labelDisplayUnits, maxVal), "x": (centreAx + centreCx) / 2, "y": (centreAy + centreCy) / 2 + circleRadius / 16, "maxWidth": circleRadius / 2.2 }); // ABCD

                for (let iCounter = 0; iCounter < 13; iCounter++) {
                    let measureDataProperties: TextProperties = {
                        fontFamily: "Segoe UI,wf_segoe-ui_semibold,helvetica,arial,sans-serif",
                        fontSize: labelSettings.fontSize + "px",
                        text: textProps[iCounter].val,
                    };
                    this.mainGroup.append("text")
                        .attr({
                            "fill": labelSettings.color,
                            "font-size": labelSettings.fontSize + "px",
                            "text-anchor": "middle",
                            "x": textProps[iCounter].x,
                            "y": textProps[iCounter].y,
                        })
                        .text(textMeasurementService.getTailoredTextOrDefault(measureDataProperties, textProps[iCounter].maxWidth));
                }
            }
            let fullDataArr = this.finalUpdatedSingleObjectsValues.concat(this.finalUpdatedOtherObjectsValues, this.finalOtherObjectsValues);
            let maxVal = Math.max.apply(null, fullDataArr);
            // Add tooltip
            let tooltipData = [];
            tooltipData.push({ "key": this.finalSingleObjects[0], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[0], 0, 1, maxVal) }); // A
            tooltipData.push({ "key": this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[1], 0, 1, maxVal) }); // B
            tooltipData.push({ "key": this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[2], 0, 1, maxVal) }); // C
            tooltipData.push({ "key": this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedSingleObjectsValues[3], 0, 1, maxVal) }); // D
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[4], 0, 1, maxVal) }); // AD
            tooltipData.push({ "key": this.finalSingleObjects[2] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[7], 0, 1, maxVal) }); // CD
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[0], 0, 1, maxVal) }); // AB
            tooltipData.push({ "key": this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[2], 0, 1, maxVal) }); // BC
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[3], 0, 1, maxVal) }); // ABC
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[6], 0, 1, maxVal) }); // ABD
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[2] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[8], 0, 1, maxVal) }); // ACD
            tooltipData.push({ "key": this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalUpdatedOtherObjectsValues[9], 0, 1, maxVal) }); // BCD
            tooltipData.push({ "key": this.finalSingleObjects[0] + " & " + this.finalSingleObjects[1] + " & " + this.finalSingleObjects[2] + " & " + this.finalSingleObjects[3], "value": this.getFormattedData(this.finalOtherObjectsValues[10], 0, 1, maxVal) }); // ABCD

            this.svg.selectAll("path").data(tooltipData);
            this.svg.selectAll("text").data(tooltipData);

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll("path, text"),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);
        }

        public draw(width: number, height: number, viewModel) {
            let color = {};
            for (let iCounter = 0; iCounter < viewModel.dataPoints.length; iCounter++) {
                color[iCounter] = viewModel.dataPoints[iCounter].color;
            }
            let padding = 10;
            let radius = width / this.NumberOfObjects;
            if (this.NumberOfObjects === 1) {
                this.drawOneObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
            } else if (this.NumberOfObjects === 2) {
                this.drawTwoObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
            } else if (this.NumberOfObjects === 3) {
                this.drawThreeObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
            } else if (this.NumberOfObjects === 4) {
                this.drawFourObjects(width, height, Math.min(width, height) / 10, Math.min(width, height) / 10, color);
            }
        }

        public getLabelSettings(dataView: DataView): LabelSettings {
            let objects: DataViewObjects = null;
            let settings: LabelSettings = this.getDefaultLabelSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            let properties = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.labelSettings.show, settings.show);
            settings.color = DataViewObjects.getFillColor(objects, properties.labelSettings.color, settings.color);
            settings.fontSize = DataViewObjects.getValue(objects, properties.labelSettings.fontSize, settings.fontSize);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.labelSettings.displayUnits, settings.displayUnits);
            settings.textPrecision = DataViewObjects.getValue(objects, properties.labelSettings.textPrecision, settings.textPrecision);
            settings.textPrecision = settings.textPrecision < 0 ? 0 : settings.textPrecision > 4 ? 4 : settings.textPrecision;
            return settings;
        }

        public getDefaultLabelSettings(): LabelSettings {
            return {
                color: "#000000",
                displayUnits: 0,
                fontSize: 12,
                show: true,
                textPrecision: 0,
            };
        }

        public getLegendSettings(dataView: DataView): LegendSetting {
            let objects: DataViewObjects = null;
            let settings: LegendSetting = this.getDefaultLegendSettings();

            if (!dataView.metadata || !dataView.metadata.objects) {
                return settings;
            }
            objects = dataView.metadata.objects;
            let properties = visualProperties;
            settings.show = DataViewObjects.getValue(objects, properties.legend.show, settings.show);
            settings.titleText = DataViewObjects.getValue(objects, properties.legend.titleText, settings.titleText);
            settings.displayUnits = DataViewObjects.getValue(objects, properties.legend.displayUnits, settings.displayUnits);
            settings.decimalPlaces = DataViewObjects.getValue(objects, properties.legend.decimalPlaces, settings.decimalPlaces);
            settings.decimalPlaces = settings.decimalPlaces < 0 ? 0 : settings.decimalPlaces > 4 ? 4 : settings.decimalPlaces;
            settings.showPrimary = DataViewObjects.getValue(objects, properties.legend.showPrimary, settings.showPrimary);
            return settings;
        }

        public getDefaultLegendSettings(): LegendSetting {
            return {
                decimalPlaces: 0,
                displayUnits: 0,
                show: true,
                titleText: "Legend",
                showPrimary: true,
            };
        }

        public getDefaultOpacity(): OpacitySettings {
            return {
                externalArc: 100,
                internalArc: 50
            }
        }

        public getOpacitySettings(dataView: DataView): OpacitySettings {
            let opSettings: OpacitySettings = this.getDefaultOpacity();
            let objects: DataViewObjects = null;
            if (!dataView.metadata || !dataView.metadata.objects) {
                return opSettings;
            }
            objects = dataView.metadata.objects;
            let properties = visualProperties.opacity;
            opSettings.externalArc = DataViewObjects.getValue(objects, properties.externalArc, opSettings.externalArc);
            opSettings.externalArc = opSettings.externalArc > 10 ? opSettings.externalArc : 10;
            opSettings.internalArc = DataViewObjects.getValue(objects, properties.internalArc, opSettings.internalArc);
            opSettings.internalArc = opSettings.internalArc > 10 ? opSettings.internalArc : 10;

            return opSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let labelSettings: LabelSettings = this.getLabelSettings(this.dataViews);
            let legendSettings: LegendSetting = this.getLegendSettings(this.dataViews);
            let opSettings: OpacitySettings = this.getOpacitySettings(this.dataViews);
            let legendData = this.getLegendData(this.dataViews, this.vennPoints, this.host);
            let metadataColumns: DataViewMetadataColumn[] = this.dataView.metadata.columns;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (objectName) {
                case "legend":
                    objectEnumeration.push({
                        displayName: "Legend",
                        objectName: "legend",
                        properties: {
                            show: legendSettings.show,
                            // tslint:disable-next-line:object-literal-sort-keys
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            titleText: legendSettings.titleText,
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8),
                            labelDisplayUnits: legendSettings.displayUnits,
                            labelPrecision: legendSettings.decimalPlaces,
                            showPrimary: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showPrimary, true),
                        },
                        selector: null,
                    });
                    break;
                case "colors":
                    let dataLen = this.vennPoints.length;
                    for (let i = 0; i < dataLen; i++) {
                        let vennPoint = this.vennPoints[i];
                        let catName = this.finalSingleObjects[i] ? this.finalSingleObjects[i] : this.vennPoints[i].category;
                        objectEnumeration.push({
                            displayName: catName,
                            objectName: objectName,
                            properties: {
                                colorToFill: {
                                    solid: {
                                        color: vennPoint.color,
                                    },
                                },
                            },
                            selector: vennPoint.selectionId,
                        });

                    }
                    break;
                case "labelSettings":
                    objectEnumeration.push({
                        displayName: "Labels",
                        objectName: objectName,
                        properties: {
                            show: labelSettings.show,
                            // tslint:disable-next-line:object-literal-sort-keys
                            color: labelSettings.color,
                            fontSize: labelSettings.fontSize,
                            displayUnits: labelSettings.displayUnits,
                            textPrecision: labelSettings.textPrecision,
                        },
                        selector: null,
                    });
                    break;
                case "opacity":
                    objectEnumeration.push({
                        displayName: "opacity",
                        objectName: objectName,
                        properties: {
                            external: opSettings.externalArc,
                            internal: opSettings.internalArc
                        },
                        selector: null,
                    });
                    break;
                default:
                    break;
            }
            return objectEnumeration;
        }

        public getSettings(objects: DataViewObjects): boolean {
            let settingsChanged = false;
            if (typeof this.settings === "undefined" || (JSON.stringify(objects) !== JSON.stringify(this.prevDataViewObjects))) {
                this.settings = {
                };
                settingsChanged = true;
            }
            this.prevDataViewObjects = objects;
            return settingsChanged;
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value && value.key ? value.key : "",
                value: value && value.value ? value.value.toString() : "",
            }];
        }
    }
}