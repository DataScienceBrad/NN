module powerbi.extensibility.visual {
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    var legendValues = {};
    var legendValuesTorender = {};
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import legend = powerbi.extensibility.utils.chart.legend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import legendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        export function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T {

            if (!objects)
                return defaultValue;

            let objectOrMap = objects[propertyId.objectName];

            let object = <DataViewObject>objectOrMap;
            return DataViewObject.getValue(object, propertyId.propertyName, defaultValue);
        }

        /** Gets an object from objects. */
        export function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject {
            if (objects && objects[objectName]) {
                let object = <DataViewObject>objects[objectName];
                return object;
            }
            else {
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
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }
    }

    export module DataViewObject {
        export function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T {

            if (!object)
                return defaultValue;

            let propertyValue = <T>object[propertyName];
            if (propertyValue === undefined)
                return defaultValue;

            return propertyValue;
        }

        /** Gets the solid color from a fill property using only a propertyName */
        export function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string {
            let value: Fill = DataViewObject.getValue(objects, propertyName);
            if (!value || !value.solid)
                return defaultColor;

            return value.solid.color;
        }

    }

    interface DonutChartViewModel {
        legendData: LegendData;
        dataPoints: DonutChartDataPoint[];
        dataMax: number;
        settings: DonutChartSettings;
        primaryMeasureSum: number;
        secondaryMeasureSum: number;
    };
    interface DonutChartDataPoint {
        value: PrimitiveValue;
        category: string;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    };

    interface DonutChartSettings {
        generalView: {
            opacity: number;
        };
    }

    export interface legendConfig {
        show: boolean;
        legendName: string;
        primaryMeasure: string;
        displayUnits: number;
        decimalPlaces: number;
    }

    //Interface for Detail Lables
    export interface DetailLables {
        show: boolean;
        fontSize: number;
        color: string;
        labelDisplayUnits: number;
        labelPrecision: number;
        labelStyle: string;
    };

    export interface summaryLabels {
        show: boolean;
        color: string;
        labelDisplayUnits: number;
        labelPrecision: number;
        fontSize: number;
        text: string;
    };
    export interface primaryIndicator {
        show: boolean;
        signIndicator: boolean;
        threshold: number;
        totalThreshold: number;
    };
    export interface secondaryIndicator {
        show: boolean;
        signIndicator: boolean;
        threshold: number;
        totalThreshold: number;
    };

    export var chartProperties = {
        legendSettings: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            legendName: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            primaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'detailedLegend' },
            displayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelDisplayUnits' },
            decimalPlaces: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelPrecision' }
        },
        labels:
        {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'show' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'color' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'fontSize' },
            labelStyle: <DataViewObjectPropertyIdentifier>{ objectName: 'labels', propertyName: 'labelStyle' },
        },
        summaryLabels:
        {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'show' },
            color: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'color' },
            labelDisplayUnits: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'labelDisplayUnits' },
            labelPrecision: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'labelPrecision' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'fontSize' },
            text: <DataViewObjectPropertyIdentifier>{ objectName: 'summaryLabels', propertyName: 'primaryMeasureSummaryText' },
        },
        indicators: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'show' },
            primaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'PrimaryMeasure' },
            threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Threshold' },
            totalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'Indicators', propertyName: 'Total_Threshold' },
        },
        smIndicator: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'show' },
            secondaryMeasure: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SecondaryMeasure' },
            threshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMThreshold' },
            totalThreshold: <DataViewObjectPropertyIdentifier>{ objectName: 'SMIndicator', propertyName: 'SMTotalThreshold' },
        }
    }

    var d3 = (<any>window).d3;

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, context: any): DonutChartViewModel {
        let dataViews = options.dataViews;
        let defaultSettings: DonutChartSettings = {
            generalView: {
                opacity: 100
            }
        };
        let viewModel: DonutChartViewModel = {
            legendData: null,
            dataPoints: [],
            dataMax: 0,
            settings: <DonutChartSettings>{},
            primaryMeasureSum: null,
            secondaryMeasureSum: null
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];

        let donutChartDataPoints: DonutChartDataPoint[] = [];
        let dataMax: number;
        let primaryMeasureSum = 0;
        let secondaryMeasureSum = 0;

        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
        let donutChartSettings: DonutChartSettings = {

            generalView: {
                opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity),
            }
        }
        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {

            if (options.dataViews[0].categorical.values[0].values[i]) {
                primaryMeasureSum += parseFloat(options.dataViews[0].categorical.values[0].values[i].toString());
            }
            if (options.dataViews[0].categorical.values[1] && options.dataViews[0].categorical.values[1].values[i]) {
                secondaryMeasureSum += parseFloat(options.dataViews[0].categorical.values[1].values[i].toString());
            }

            let category1 = categorical.categories[i];
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(category.values[i] + '').value
                }
            }

            donutChartDataPoints.push({
                category: category.values[i] + '',
                value: dataValue.values[i],
                color: getCategoricalObjectValue<Fill>(category, i, 'dataPoint', 'fill', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId()
            });
        }
        dataMax = <number>dataValue.maxLocal;
        return {
            legendData: context.getLegendData(dataViews[0], donutChartDataPoints, host),
            dataPoints: donutChartDataPoints,
            dataMax: dataMax,
            settings: donutChartSettings,
            primaryMeasureSum: primaryMeasureSum,
            secondaryMeasureSum: secondaryMeasureSum
        };
    }



    export class DonutChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private donutChartContainer: d3.Selection<SVGElement>;
        private donutContainer: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private donutDataPoints: DonutChartDataPoint[];
        private donutChartSettings: DonutChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private dataViews;
        private legend: ILegend;
        private legendObjectProperties: DataViewObject;
        public groupLegends: d3.Selection<SVGElement>;
        private legendData;
        public dataView: any;
        private currentViewport: IViewport;
        private settings: any;
        private rootElement;
        private defaultFontFamily: string;
        private labelFontFamily: string;
        private primaryMeasurePercent: boolean;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.rootElement = d3.select(options.element);
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('donutChart', true);

            this.locale = options.host.locale;

            var oElement: any = $('div');
            this.legend = createLegend(oElement, false, null, true);
            this.rootElement.select('.legend').style('top', 0);

            d3.select(options.element)
                .append('div')
                .classed('SummarizedDiv', true);
            this.defaultFontFamily = '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif';
            this.labelFontFamily = 'wf_standard-font, helvetica, arial, sans-serif';
            this.primaryMeasurePercent = false;
        }

        public getLegendData(dataView: DataView, QuadrantChartDataPoints: any, host: IVisualHost): LegendData {

            let legendSettings: legendConfig = this.getLegendSettings(dataView);
            var SelectionId: powerbi.visuals.ISelectionId;
            var sTitle = "";
            let secondaryMeasure = [], primaryTitle, secondaryTitle;

            var legendData: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: legendSettings.legendName
            };

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values[0] && dataView.categorical.values[0].values) {
                primaryTitle = dataView.categorical.values[0].source.displayName;
                legendData.primaryTitle = primaryTitle;
                legendData.primaryType = legendSettings.primaryMeasure;
            }

            if (dataView && dataView.categorical && dataView.categorical.values && dataView.categorical.values[1] && dataView.categorical.values[1].values) {
                secondaryMeasure = dataView.categorical.values[1].values;
                secondaryTitle = dataView.categorical.values[1].source.displayName;
                legendData.secondaryTitle = secondaryTitle;
            }

            for (var i = 0; i < QuadrantChartDataPoints.length; ++i) {
                if (dataView && dataView.categorical && dataView.categorical.categories && dataView.categorical.categories[0]) {
                    if (secondaryMeasure.length > 0) {
                        legendData.dataPoints.push({
                            measure: QuadrantChartDataPoints[i].value,
                            secondaryMeasure: secondaryMeasure[i],
                            label: QuadrantChartDataPoints[i].category,
                            color: QuadrantChartDataPoints[i].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            selected: false,
                            identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                        });
                    }
                    else {
                        legendData.dataPoints.push({
                            measure: QuadrantChartDataPoints[i].value,
                            label: QuadrantChartDataPoints[i].category,
                            color: QuadrantChartDataPoints[i].color,
                            icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                            selected: false,
                            identity: host.createSelectionIdBuilder().withCategory(dataView.categorical.categories[0], i).createSelectionId()
                        });
                    }
                }
                legendValues[i] = QuadrantChartDataPoints[i].category;
            }
            return legendData;
        }

        public update(options: VisualUpdateOptions) {
            this.dataViews = options.dataViews[0];
            var This = this;

            let viewModel: DonutChartViewModel = visualTransform(options, this.host, this);
            let settings = this.donutChartSettings = viewModel.settings;
            this.donutDataPoints = viewModel.dataPoints;
            let lablesettings: DetailLables = this.getDetailLable(this.dataViews);
            this.svg.selectAll("*").remove();
            this.rootElement.select(".SummarizedDivContainer").remove();
            this.rootElement.selectAll('.legend #legendGroup .legendItem, .legend #legendGroup .legendTitle, .legend #legendGroup .navArrow').remove();
            this.currentViewport = {
                height: Math.max(0, options.viewport.height),
                width: Math.max(0, options.viewport.width)
            };
            this.dataView = options.dataViews[0];

            let detaillabelprop: DetailLables = this.getDetailLable(this.dataViews);
            let legendSettings: legendConfig = this.getLegendSettings(this.dataViews);
            let summaryLabelSettings: summaryLabels = this.getSummaryLabels(this.dataViews);


            let donutWidth = options.viewport.width;
            let donutHeight = options.viewport.height;

            let legendWidth = 0, legendHeight = 0;
            if (legendSettings.show) {
                this.renderLegend(viewModel, this.dataViews);
                legendWidth = parseFloat($('.legend').attr('width'));
                legendHeight = parseFloat($('.legend').attr('height'));
                let legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                if (legendPos === "top" || legendPos === "topcenter" || legendPos === "bottom" || legendPos === "bottomcenter") {
                    donutHeight = donutHeight - legendHeight <= 0 ? 0 : donutHeight - legendHeight;
                } else if (legendPos === "left" || legendPos === "leftcenter" || legendPos === "right" || legendPos === "rightcenter") {
                    donutWidth = donutWidth - legendWidth <= 0 ? 0 : donutWidth - legendWidth;
                }
            }
            else {
                this.svg.style('margin-top', 0);
            }
            this.svg.attr({
                width: donutWidth,
                height: donutHeight
            });


            var radius = Math.min(donutWidth, donutHeight) / 2;

            var getAngle = function (d) {
                return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
            };

            var outerMultiplier = 0.85;
            var innerMultiplier = 0.55;

            if (lablesettings.show) {
                outerMultiplier = 0.8;
                innerMultiplier = 0.6;
            }


            var arc = d3.svg.arc()
                .outerRadius(radius * outerMultiplier)
                .innerRadius(radius * innerMultiplier);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) { return d.value; });


            var svg = d3.select(".donutChart").append("svg")
                .attr("width", donutWidth)
                .attr("height", donutHeight)
                .append("g")
                .attr("transform", "translate(" + donutWidth / 2 + "," + donutHeight / 2 + ")");

            var g = svg.selectAll(".arc")
                .data(pie(viewModel.dataPoints))
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) { return d.data.color });

            var outerArc = d3.svg.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);



            function midAngle(d) { return d.startAngle + ((d.endAngle - d.startAngle)) / 2; }

            if (lablesettings.show) {
                var enteringLabels = svg.selectAll(".polyline").data(pie(viewModel.dataPoints)).enter();
                var labelGroups = enteringLabels.append("g").attr("class", "polyline").style("fill", "none").style("stroke", "grey").style("stroke-width", "1px").style("opacity", "0.4");

                var line = labelGroups.
                    append("polyline")
                    .attr('points', function (d) {
                        var arccentroid = arc.centroid(d);
                        var pos = outerArc.centroid(d);
                        var pos1 = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 14) * (midAngle(d) < Math.PI ? 1 : -1);
                        var fpos = [(arccentroid[0] + pos1[0]) / 2, (arccentroid[1] + pos1[1]) / 2];
                        return [fpos, outerArc.centroid(d), pos]
                    })
                    .attr('id', function (d, i) {
                        return 'polyline_' + i;
                    });

                var enteringtext = svg.selectAll(".labelName").data(pie(viewModel.dataPoints)).enter();
                var textGroups = enteringtext.append("g").attr("class", "labelName");
                var labelcolor = lablesettings.color;
                var labeltextsize = lablesettings.fontSize + 'px';

                var label = textGroups
                    .append("text")
                    .attr('x', function (d) {
                        var pos = outerArc.centroid(d);
                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);
                        return pos[0];
                    })
                    .attr('y', function (d) {
                        var pos = outerArc.centroid(d);
                        return pos[1];
                    })
                    .attr('dy', '.20em')

                    .attr('id', function (d, i) {
                        return 'label_' + i;
                    })

                    .text(function (d) {
                        let primaryFormatter = '';
                        if (This.dataViews && This.dataViews.categorical && This.dataViews.categorical.values && This.dataViews.categorical.values[0]) {
                            primaryFormatter = This.dataViews.categorical.values[0].source.format;
                        }
                        let formatter = ValueFormatter.create({ format: primaryFormatter, value: detaillabelprop.labelDisplayUnits, precision: detaillabelprop.labelPrecision })
                        var text = "";
                        var summaryvalue = viewModel.primaryMeasureSum;
                        if (detaillabelprop.labelStyle === 'data') {
                            text = formatter.format((d.data.value))
                        }
                        else if (detaillabelprop.labelStyle === 'category') {
                            text = d.data.category;
                        }
                        else if (detaillabelprop.labelStyle === 'percent') {
                            text = (d.data.value / summaryvalue * 100).toFixed(2).toString() + "%";
                        }
                        else if (detaillabelprop.labelStyle === 'categorypercent') {
                            text = d.data.category + "(" + (d.data.value / summaryvalue * 100).toFixed(2).toString() + "%" + ")"
                        }
                        else if (detaillabelprop.labelStyle === 'datapercent') {
                            text = formatter.format(d.data.value) + "(" + (d.data.value / summaryvalue * 100).toFixed(2).toString() + "%" + ")"
                        }
                        else if (detaillabelprop.labelStyle === 'categorydata') {
                            text = d.data.category + " (" + formatter.format(d.data.value) + ")"
                        }
                        else {
                            text = d.data.category + " (" + formatter.format(d.data.value) + ")" + " (" + (d.data.value / summaryvalue * 100).toFixed(2).toString() + "%" + ")"
                        }

                        var textProperties: TextProperties = {
                            text: text,
                            fontFamily: This.defaultFontFamily,
                            fontSize: detaillabelprop.fontSize + 'px'
                        };
                        var widthOfText = textMeasurementService.measureSvgTextWidth(textProperties);

                        var pos = outerArc.centroid(d);

                        pos[0] = (Math.abs(outerArc.centroid(d)[0]) + 20) * (midAngle(d) < Math.PI ? 1 : -1);

                        //r = 1// l = -1
                        //logic to show ellipsis in Data Labels if there is no enough width
                        var position = (midAngle(d) < Math.PI ? 1 : -1);
                        var textEnd, finalText;
                        if (position == 1) {
                            textEnd = pos[0] + widthOfText;
                            if (textEnd > donutWidth / 2) {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, donutWidth / 2 - pos[0]);
                                if (finalText.length < 4) {
                                    return "";
                                }
                            } else {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, textEnd);
                            }
                        } else if (position == -1) {
                            textEnd = pos[0] + (-1 * widthOfText);
                            if (textEnd < (-1 * donutWidth / 2)) {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, pos[0] + donutWidth / 2);
                                if (finalText.length < 4) {
                                    return "";
                                }
                            } else {
                                finalText = textMeasurementService.getTailoredTextOrDefault(textProperties, Math.abs(textEnd));
                            }
                        }
                        return finalText;
                    })

                    .style(
                    'text-anchor', function (d) {
                        return (midAngle(d)) < Math.PI ? 'start' : 'end';
                    })
                    .style('fill', labelcolor)
                    .style('font-size', labeltextsize)
                    .style('font-family', this.defaultFontFamily)

                    .append("title")
                    .text(function (d) {

                        let formatter = ValueFormatter.create({ value: detaillabelprop.labelDisplayUnits, precision: detaillabelprop.labelPrecision });

                        var summaryvalue = viewModel.primaryMeasureSum, text;
                        if (detaillabelprop.labelStyle === 'data') {
                            text = formatter.format((d.data.value))
                        }
                        else if (detaillabelprop.labelStyle === 'category') {

                            text = d.data.category;
                        }
                        else if (detaillabelprop.labelStyle === 'percent') {

                            text = (d.data.value / summaryvalue * 100).toString() + "%";
                        }
                        else if (detaillabelprop.labelStyle === 'categorypercent') {
                            text = d.data.category + "(" + (d.data.value / summaryvalue * 100).toString() + "%" + ")"
                        }
                        else if (detaillabelprop.labelStyle === 'datapercent') {
                            text = (d.data.value) + "(" + (d.data.value / summaryvalue * 100).toString() + "%" + ")"
                        }
                        else if (detaillabelprop.labelStyle === 'categorydata') {
                            text = d.data.category + " (" + (d.data.value) + ")"
                        }
                        else {
                            text = d.data.category + " (" + (d.data.value) + ")" + " (" + (d.data.value / summaryvalue * 100).toString() + "%" + ")"
                        }
                        return text;

                    })

            }

            if (lablesettings.show) {
                var labelsLength = viewModel.dataPoints.length;
                for (var i = 0; i < labelsLength; i++) {
                    var obj1 = document.getElementById("label_" + (i)).getBoundingClientRect();
                    for (var j = i + 1; j <= labelsLength - 1; j++) {
                        var obj2 = document.getElementById("label_" + j).getBoundingClientRect();
                        if (!(obj2.left > obj1.right ||
                            obj2.right < obj1.left ||
                            obj2.top > obj1.bottom ||
                            obj2.bottom < obj1.top)) {
                            document.getElementById("label_" + j).style.display = "none";
                            document.getElementById("polyline_" + j).style.display = "none";
                        }
                    }
                    let legendPos = LegendPosition[this.legend.getOrientation()].toLowerCase();
                    if (legendPos === "top" || legendPos === "topcenter" || legendPos === "bottom" || legendPos === "bottomcenter") {
                        if (d3.select('#label_' + i)[0][0].childNodes.length <= 1 || obj1.top < legendHeight || obj1.top > donutHeight) {
                            document.getElementById("label_" + i).style.display = "none";
                            document.getElementById("polyline_" + i).style.display = "none";
                        }
                    } else {
                        if (d3.select('#label_' + i)[0][0].childNodes.length <= 1) {
                            document.getElementById("label_" + i).style.display = "none";
                            document.getElementById("polyline_" + i).style.display = "none";
                        }
                    }

                }
            }

            this.drawSummaryDiv(radius, options, viewModel, legendHeight, legendWidth, summaryLabelSettings, this.dataViews);
            let arcs = this.svg.selectAll('.arc').data(viewModel.dataPoints);

            this.tooltipServiceWrapper.addTooltip(this.svg.selectAll('.arc'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);

            let selectionManager = this.selectionManager;

            //This must be an anonymous function instead of a lambda because
            //d3 uses 'this' as the reference to the element that was clicked.
            arcs.on('click', function (d) {
                selectionManager.select(d.selectionId).then((ids: any[]) => {
                    function CompareIds(legendData) {
                        if (ids.length) {
                            if (legendData.identity.key == ids[0].key) {
                                return 1;
                            }
                            else {
                                return 0.5;
                            }
                        }
                        else {
                            return 1;
                        }
                    }
                    var legend: any = This.rootElement.selectAll('.legendItem');
                    legend.attr('fill-opacity', (d) => {
                        return CompareIds(d);
                    })

                    arcs.attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });
                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                });

                (<Event>d3.event).stopPropagation();
            });
            this.addLegendSelection();
            $('#legendGroup').on('click.load', '.navArrow', function () {
                This.addLegendSelection();
            });
            this.rootElement.on('click',
                () => this.selectionManager.clear().then(() => this.rootElement.selectAll('.legendItem').attr('fill-opacity', 1), this.rootElement.selectAll('.arc').attr('fill-opacity', 1)));
        }

        private addLegendSelection() {
            var This = this;
            var legends = this.rootElement.selectAll('.legendItem');
            var selectionManager = this.selectionManager;
            legends.on('click', function (d) {
                selectionManager.select(d.identity).then((ids: any[]) => {
                    function CompareIds(arcData) {
                        if (ids.length) {
                            if (arcData.selectionId.key == ids[0].key) {
                                return 1;
                            }
                            else {
                                return 0.5;
                            }
                        }
                        else {
                            return 1;
                        }
                    }
                    var arcs: any = This.rootElement.selectAll('.arc');
                    arcs.attr('fill-opacity', (d) => {
                        return CompareIds(d);
                    })
                    legends.attr({
                        'fill-opacity': ids.length > 0 ? 0.5 : 1
                    });

                    d3.select(this).attr({
                        'fill-opacity': 1
                    });
                });
                (<Event>d3.event).stopPropagation();
            });
        }

        public drawSummaryDiv(radius, options, viewModel, legendHeight, legendWidth, summaryLabelSettings, dataViews) {
            if (summaryLabelSettings.show) {
                let pmIndicator: primaryIndicator = this.getPrimaryIndicator(dataViews);
                let smIndicator: secondaryIndicator = this.getSecondaryIndicator(dataViews);
                this.rootElement.select('.SummarizedDiv').style({ 'display': 'block' });
                var sliceWidthRatio = 0.50;
                var innerRadius = radius * sliceWidthRatio;
                var halfViewPortWidth = options.viewport.width / 2;
                var halfViewPortHeight = options.viewport.height / 2;
                var x, y;
                var primaryFormatter = ValueFormatter.create({ format: options.dataViews[0].categorical.values[0].source.format, value: summaryLabelSettings.labelDisplayUnits, precision: summaryLabelSettings.labelPrecision });

                if (!this.legendObjectProperties) {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(legendHeight.toString(), 10) / 2;
                }
                else if ((this.legendObjectProperties['show']) && (this.legendObjectProperties['position'] === 'Top' || this.legendObjectProperties['position'] === 'TopCenter')) {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2) + parseInt(legendHeight.toString(), 10) / 2;
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Bottom' || this.legendObjectProperties['position'] === 'BottomCenter')) {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2) - parseInt(legendHeight.toString(), 10) / 2;
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Left' || this.legendObjectProperties['position'] === 'LeftCenter')) {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2) + parseInt(legendWidth.toString(), 10) / 2;
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2);
                }
                else if (this.legendObjectProperties['show'] && (this.legendObjectProperties['position'] === 'Right' || this.legendObjectProperties['position'] === 'RightCenter')) {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2) - parseInt(legendWidth.toString(), 10) / 2;
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2);
                }
                else {
                    x = halfViewPortWidth - (innerRadius / Math.SQRT2);
                    y = halfViewPortHeight - (innerRadius / Math.SQRT2);
                }

                var widthBox = (innerRadius * Math.SQRT2);
                var heightBox = (innerRadius * Math.SQRT2);

                if (this.currentViewport.width > 150 && this.currentViewport.height > 100) {
                    this.rootElement.select('.SummarizedDiv')
                        .append('div').style({
                            'width': widthBox + 'px',
                            'height': heightBox + 'px',
                            'top': y + 'px',
                            'left': x + 'px',
                            'position': 'absolute',
                            'overflow': 'hidden',
                            'font-size': summaryLabelSettings.fontSize + 'px',
                            'font-family': this.defaultFontFamily,
                            'color': summaryLabelSettings.color
                        }).classed('SummarizedDivContainer', true);
                    this.rootElement.select('.SummarizedDivContainer')
                        .append('div')
                        .classed('pContainer', true)
                        .style({
                            'position': 'absolute',
                            'top': '50%',
                            'transform': 'translate(0, -50%)',
                            'width': '100%',
                        });
                    this.rootElement.select('.pContainer')
                        .append('p')
                        .classed('TotalText', true)
                        .text(summaryLabelSettings.text)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });
                    this.rootElement.select('.pContainer')
                        .append('p')
                        .classed('TotalValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });
                    if (pmIndicator.show) {
                        var threshold_Value = 0;
                        if (!pmIndicator.signIndicator) {
                            threshold_Value = pmIndicator.totalThreshold;
                            if (dataViews.categorical.values[0].source.format.toString().indexOf('%') > -1) {
                                this.primaryMeasurePercent = true;
                                threshold_Value = threshold_Value / 100;
                            }
                        }
                        if (threshold_Value <= viewModel.primaryMeasureSum) {
                            this.rootElement.select('.TotalValue')
                                .html('<div class="primaryMeasureSum" title = "' + primaryFormatter.format(viewModel.primaryMeasureSum) + '"' + ' style="width:80%; float:left;text-overflow: ellipsis;overflow: hidden;">' + primaryFormatter.format(viewModel.primaryMeasureSum) + '</div><span class="primaryMeasureIndicator" style="width=15%;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        } else {
                            this.rootElement.select('.TotalValue')
                                .html('<div class="primaryMeasureSum" title = "' + primaryFormatter.format(viewModel.primaryMeasureSum) + '"' + ' style="width:80%; float:left;text-overflow: ellipsis;overflow: hidden;">' + primaryFormatter.format(viewModel.primaryMeasureSum) + '</div><span class="primaryMeasureIndicator" style="width=15%;float:left; color:red;margin-left:2px;">&#9650;</span>');
                        }
                    } else {
                        this.rootElement.select('.TotalValue')
                            .html('<div class="primaryMeasureSum" title = "' + primaryFormatter.format(viewModel.primaryMeasureSum) + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + primaryFormatter.format(viewModel.primaryMeasureSum));
                    }


                }
                var secondaryFormatter;
                if (options.dataViews[0].categorical.values[1] && options.dataViews[0].categorical.values[1].values) {
                    secondaryFormatter = ValueFormatter.create({ format: options.dataViews[0].categorical.values[1].source.format, value: summaryLabelSettings.labelDisplayUnits, precision: summaryLabelSettings.labelPrecision });
                    var isSecondaryPercentage = false;
                    if (dataViews.categorical.values[1].source.format.toString().indexOf('%') > -1) {
                        isSecondaryPercentage = true;
                    }
                    this.rootElement.select('.pContainer')
                        .append('p')
                        .classed('SecondaryText', true)
                        .text(options.dataViews[0].categorical.values[1].source.displayName)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });

                    this.rootElement.select('.pContainer')
                        .append('p')
                        .classed('SecondaryValue', true)
                        .style({ 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'text-align': 'center', 'vertical-align': 'middle', 'margin': '0', 'white-space': 'nowrap' });
                    if (smIndicator.show) {
                        var smThreshold = 0;
                        if (!smIndicator.signIndicator) {
                            smThreshold = smIndicator.totalThreshold;
                            if (isSecondaryPercentage) {
                                smThreshold = smThreshold / 100;
                            }
                        }
                        if (smThreshold <= viewModel.secondaryMeasureSum) {
                            this.rootElement.select('.SecondaryValue')
                                .html('<div class="secondaryMeasureSum" title = "' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '"' + ' style="width:80%; float:left;text-overflow: ellipsis;overflow: hidden;">' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '</div><span class="secondaryMeasureIndicator"style="width=15%;float:left; color:green;margin-left:2px;">&#9650;</span>');
                        } else {
                            this.rootElement.select('.SecondaryValue')
                                .html('<div class="secondaryMeasureSum" title = "' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '"' + ' style="width:80%; float:left;text-overflow: ellipsis;overflow: hidden;">' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '</div><span class="secondaryMeasureIndicator"style="width=15%;float:left; color:red;margin-left:2px;">&#9650;</span>');
                        }
                    }
                    else {
                        this.rootElement.select('.SecondaryValue')
                            .html('<div class="secondaryMeasureSum" title = "' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '"' + ' style="width:100%; float:left;text-overflow: ellipsis;overflow: hidden;">' + secondaryFormatter.format(viewModel.secondaryMeasureSum) + '</div>');
                    }
                }

                var pContainerDivWidth = parseFloat(this.rootElement.select('.pContainer').style('width'));

                var formattedPrimaryMeasureSumTextProperties: TextProperties = {
                    text: primaryFormatter.format(viewModel.primaryMeasureSum),
                    fontFamily: "Segoe UI",
                    fontSize: summaryLabelSettings.fontSize + "px"
                };
                var formattedSecondaryMeasureSumTextPropertiesWidth;
                if (secondaryFormatter) {
                    var formattedSecondaryMeasureSumTextProperties: TextProperties = {
                        text: secondaryFormatter.format(viewModel.secondaryMeasureSum),
                        fontFamily: "Segoe UI",
                        fontSize: summaryLabelSettings.fontSize + "px"
                    };
                    formattedSecondaryMeasureSumTextPropertiesWidth = textMeasurementService.measureSvgTextWidth(formattedSecondaryMeasureSumTextProperties);
                }
                var formattedPrimaryMeasureSumTextPropertiesWidth = textMeasurementService.measureSvgTextWidth(formattedPrimaryMeasureSumTextProperties);


                if (this.rootElement.select('.primaryMeasureIndicator')[0][0] !== null) {
                    if (formattedPrimaryMeasureSumTextPropertiesWidth + parseFloat(this.rootElement.select('.primaryMeasureIndicator').style('width')) * 2 > pContainerDivWidth) {
                        this.rootElement.select('.primaryMeasureIndicator').style('visibility', 'hidden');
                    }
                    else {
                        this.rootElement.select('.primaryMeasureIndicator').style('visibity', 'visible');
                    }
                }
                if (this.rootElement.select('.secondaryMeasureIndicator')[0][0] !== null) {
                    if (formattedSecondaryMeasureSumTextPropertiesWidth + parseFloat(this.rootElement.select('.secondaryMeasureIndicator').style('width')) * 2 > pContainerDivWidth) {
                        this.rootElement.select('.secondaryMeasureIndicator').style('visibility', 'hidden');
                    }
                    else {
                        this.rootElement.select('.secondaryMeasureIndicator').style('visibity', 'visible');
                    }
                }
                var pContainerDivHeight = parseFloat(this.rootElement.select('.pContainer').style('height'));
                var summarizedDivHeight = parseFloat(this.rootElement.select('.SummarizedDivContainer').style('height'));

                if (summarizedDivHeight < pContainerDivHeight) {
                    this.rootElement.select('.TotalText').style({ 'display': 'none' });
                    if (summarizedDivHeight < pContainerDivHeight / 1.5) {
                        this.rootElement.select('.SecondaryText').style({ 'display': 'none' });
                        if (summarizedDivHeight < pContainerDivHeight / 2) {
                            this.rootElement.select('.SecondaryValue').style({ 'display': 'none' });
                        }
                        else {
                            this.rootElement.select('.SecondaryValue').style({ 'display': 'block' });
                        }
                    }
                    else {
                        this.rootElement.select('.SecondaryText').style({ 'display': 'block' });
                    }
                }
                else {
                    this.rootElement.select('.TotalText').style({ 'display': 'block' });
                }
            }

        }

        private renderLegend(viewModel: DonutChartViewModel, dataViews: DataView): void {
            let legendSettings: legendConfig = this.getLegendSettings(dataViews);
            let pmIndicatorSettings: primaryIndicator = this.getPrimaryIndicator(dataViews);
            let smIndicatorSettings: secondaryIndicator = this.getSecondaryIndicator(dataViews);
            let primaryFormat = '';
            let secondaryFormat = '';
            let primaryFormatter, secondaryFormatter, primaryTooltipFormatter, primaryPercentFormatter, secondaryTooltipFormatter;
            if (!viewModel || !viewModel.legendData)
                return;
            if (this.dataView && this.dataView.metadata)
                this.legendObjectProperties = powerbi.extensibility.utils.dataview.DataViewObjects.getObject(this.dataView.metadata.objects, "legend", {});

            var legendData: LegendData = viewModel.legendData;
            var legendDataTorender: LegendData = {
                fontSize: 8,
                dataPoints: [],
                title: legendData.title
            };

            if (legendData.primaryTitle) {
                legendDataTorender.primaryTitle = legendData.primaryTitle;
                primaryFormat = dataViews.categorical.values[0].source.format;
                legendDataTorender.primaryType = legendData.primaryType;
            }
            if (legendData.secondaryTitle) {
                legendDataTorender.secondaryTitle = legendData.secondaryTitle;
                secondaryFormat = dataViews.categorical.values[1].source.format;
                secondaryFormatter = ValueFormatter.create({ format: secondaryFormat, value: legendSettings.displayUnits, precision: legendSettings.decimalPlaces });
                secondaryTooltipFormatter = ValueFormatter.create({ format: secondaryFormat, precision: legendSettings.decimalPlaces })
            }

            for (var j = 0; j < legendData.dataPoints.length; j++) {
                let primaryData, measureTooltip, percentData, secondaryMeasureData, secondaryMeasureTooltipData;

                if (legendData.primaryType === 'value') {
                    primaryFormatter = ValueFormatter.create({ format: primaryFormat, value: legendSettings.displayUnits, precision: legendSettings.decimalPlaces });
                    primaryTooltipFormatter = ValueFormatter.create({ format: primaryFormat, precision: legendSettings.decimalPlaces });

                    primaryData = primaryFormatter.format(legendData.dataPoints[j].measure);
                    measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);

                } else if (legendData.primaryType === 'percentage') {
                    primaryPercentFormatter = ValueFormatter.create({ value: 0, precision: legendSettings.decimalPlaces });

                    percentData = legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100;
                    primaryData = primaryPercentFormatter.format(percentData) + ' %';
                    measureTooltip = percentData + ' %';

                } else if (legendData.primaryType === 'both') {
                    primaryFormatter = ValueFormatter.create({ format: primaryFormat, value: legendSettings.displayUnits, precision: legendSettings.decimalPlaces });
                    primaryPercentFormatter = ValueFormatter.create({ value: 0, precision: legendSettings.decimalPlaces });
                    primaryTooltipFormatter = ValueFormatter.create({ format: primaryFormat, precision: legendSettings.decimalPlaces });

                    primaryData = primaryFormatter.format(legendData.dataPoints[j].measure) + ' '
                        + primaryPercentFormatter.format((legendData.dataPoints[j].measure / viewModel.primaryMeasureSum) * 100) + ' %';
                    measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure) + ' ' + primaryPercentFormatter.format(legendData.dataPoints[j].measure / viewModel.primaryMeasureSum * 100) + ' %';
                } else {
                    primaryFormatter = ValueFormatter.create({ format: primaryFormat, value: legendSettings.displayUnits, precision: legendSettings.decimalPlaces });
                    primaryTooltipFormatter = ValueFormatter.create({ format: primaryFormat, precision: legendSettings.decimalPlaces });

                    primaryData = primaryFormatter.format(legendData.dataPoints[j].measure);
                    measureTooltip = primaryTooltipFormatter.format(legendData.dataPoints[j].measure);
                }

                if (legendData.secondaryTitle) {
                    secondaryMeasureData = secondaryFormatter.format(legendData.dataPoints[j].secondaryMeasure);
                    secondaryMeasureTooltipData = secondaryTooltipFormatter.format(legendData.dataPoints[j].secondaryMeasure);
                    legendDataTorender.dataPoints.push({
                        measure: primaryData,
                        primaryTooltip: measureTooltip,
                        secondaryMeasure: secondaryMeasureData,
                        secondaryTooltip: secondaryMeasureTooltipData,
                        primaryIndicator: this.isPrimaryIndicator(legendData.dataPoints[j].measure, dataViews),
                        secondaryIndicator: this.isSecondaryIndicator(legendData.dataPoints[j].secondaryMeasure, dataViews),
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });
                } else {
                    legendDataTorender.dataPoints.push({
                        measure: primaryData,
                        primaryTooltip: measureTooltip,
                        primaryIndicator: this.isPrimaryIndicator(legendData.dataPoints[j].measure, dataViews),
                        label: legendData.dataPoints[j].label,
                        color: legendData.dataPoints[j].color,
                        icon: powerbi.extensibility.utils.chart.legend.LegendIcon.Box,
                        selected: false,
                        identity: legendData.dataPoints[j].identity
                    });

                    legendValuesTorender[j] = legendValues[j];
                }
                if (this.legendObjectProperties) {
                    powerbi.extensibility.utils.chart.legend.data.update(legendDataTorender, this.legendObjectProperties);
                    var position: string = <string>this.legendObjectProperties[powerbi.extensibility.utils.chart.legend.legendProps.position];
                    if (position)
                        this.legend.changeOrientation(LegendPosition[position]);
                }
                this.legend.drawLegend(legendDataTorender, _.clone(this.currentViewport));
                powerbi.extensibility.utils.chart.legend.positionChartArea(this.svg, this.legend);
            }
        }

        private isPrimaryIndicator(indicatorValue, dataview) {
            var isPrimaryIndicator, isPercentage;
            var primaryIndicator: primaryIndicator = this.getPrimaryIndicator(dataview);
            for (var i = 0; i < dataview.categorical.values.length; i++) {
                if (dataview.categorical.values[i].source.roles.hasOwnProperty('Y')) {
                    if (dataview.categorical.values[i].source.format && dataview.categorical.values[i].source.format.search('%') > 0)
                        isPercentage = true;
                    break;
                }
            }
            if (primaryIndicator.show) {
                if (primaryIndicator.signIndicator)
                    var threshold_Value = 0;

                else {
                    threshold_Value = primaryIndicator.threshold;

                    if (isPercentage) {
                        threshold_Value = threshold_Value / 100;

                    }
                }
                if (!isPercentage) {
                    indicatorValue = parseInt(indicatorValue, 10);
                }

                if (threshold_Value <= indicatorValue) {
                    isPrimaryIndicator = true;
                }
                else {
                    isPrimaryIndicator = false;
                }
            }
            else {
                isPrimaryIndicator = '';
            }
            return isPrimaryIndicator;
        }
        private isSecondaryIndicator(secondaryIndicator, dataview) {
            var isSecondaryIndicator, isPercentage;
            var smIndicator: secondaryIndicator = this.getSecondaryIndicator(dataview);
            for (var i = 0; i < dataview.categorical.values.length; i++) {
                if (dataview.categorical.values[i].source.roles.hasOwnProperty('SecondaryMeasure')) {
                    if (dataview.categorical.values[i].source.format && dataview.categorical.values[i].source.format.search('%') > 0)
                        isPercentage = true;
                    break;
                }
            }
            if (smIndicator.show) {
                if (smIndicator.signIndicator)
                    var threshold_Value = 0;

                else {
                    threshold_Value = smIndicator.threshold;
                    if (isPercentage)
                        threshold_Value = threshold_Value / 100;
                }
                if (!isPercentage) {
                    secondaryIndicator = parseInt(secondaryIndicator, 10);
                }
                if (threshold_Value <= secondaryIndicator) {
                    isSecondaryIndicator = true;
                }
                else {
                    isSecondaryIndicator = false;
                }
            }
            else {
                isSecondaryIndicator = '';
            }
            return isSecondaryIndicator;
        }

        private getDefaultLegendSettings(dataView: DataView): legendConfig {
            return {
                show: true,
                legendName: dataView.categorical.categories[0].source.displayName,
                primaryMeasure: 'none',
                displayUnits: 0,
                decimalPlaces: 0
            }
        }

        private getLegendSettings(dataView: DataView): legendConfig {
            var objects: DataViewObjects = null;
            var legendSetting: legendConfig = this.getDefaultLegendSettings(dataView);
            if (!dataView.metadata || !dataView.metadata.objects)
                return legendSetting;

            objects = dataView.metadata.objects;
            legendSetting.show = DataViewObjects.getValue(objects, chartProperties.legendSettings.show, legendSetting.show);
            legendSetting.legendName = DataViewObjects.getValue(objects, chartProperties.legendSettings.legendName, legendSetting.legendName);
            legendSetting.primaryMeasure = DataViewObjects.getValue(objects, chartProperties.legendSettings.primaryMeasure, legendSetting.primaryMeasure);
            legendSetting.displayUnits = DataViewObjects.getValue(objects, chartProperties.legendSettings.displayUnits, legendSetting.displayUnits);
            legendSetting.decimalPlaces = DataViewObjects.getValue(objects, chartProperties.legendSettings.decimalPlaces, legendSetting.decimalPlaces);
            return legendSetting;
        }

        private getDefaultDetailLable(): DetailLables {

            return <DetailLables>{
                show: false,
                color: 'grey',
                labelDisplayUnits: 0,
                labelPrecision: 0,
                fontSize: 9,
                labelStyle: 'category'
            }
        }


        private getDetailLable(dataView: DataView): DetailLables {
            var objects: DataViewObjects = null;
            var labelSettings: DetailLables = this.getDefaultDetailLable();
            if (!dataView.metadata || !dataView.metadata.objects)
                return this.getDefaultDetailLable();
            objects = dataView.metadata.objects;
            var detaillabelprop = chartProperties;


            labelSettings.show = DataViewObjects.getValue(objects, detaillabelprop.labels.show, labelSettings.show);

            labelSettings.color = DataViewObjects.getFillColor(objects, detaillabelprop.labels.color, labelSettings.color);

            labelSettings.labelDisplayUnits = DataViewObjects.getValue(objects, detaillabelprop.labels.labelDisplayUnits, labelSettings.labelDisplayUnits);
            labelSettings.labelPrecision = DataViewObjects.getValue(objects, detaillabelprop.labels.labelPrecision, labelSettings.labelPrecision);
            labelSettings.labelPrecision = labelSettings.labelPrecision < 0 ? 0 : (labelSettings.labelPrecision) > 20 ? 20 : (labelSettings.labelPrecision);
            labelSettings.fontSize = DataViewObjects.getValue(objects, detaillabelprop.labels.fontSize, labelSettings.fontSize);
            labelSettings.labelStyle = DataViewObjects.getValue(objects, detaillabelprop.labels.labelStyle, labelSettings.labelStyle);

            return labelSettings
        }

        private getDefaultSummaryLabel(): summaryLabels {
            return {
                show: true,
                color: '#777777',
                labelDisplayUnits: 0,
                labelPrecision: 0,
                fontSize: 12,
                text: 'Total'
            }
        }

        private getSummaryLabels(dataView: DataView): summaryLabels {
            var objects: DataViewObjects = null;
            var summaryLabelSettings: summaryLabels = this.getDefaultSummaryLabel();
            if (!dataView.metadata || !dataView.metadata.objects)
                return this.getDefaultSummaryLabel();
            objects = dataView.metadata.objects;
            var detaillabelprop = chartProperties;
            summaryLabelSettings.show = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.show, summaryLabelSettings.show);
            summaryLabelSettings.color = DataViewObjects.getFillColor(objects, detaillabelprop.summaryLabels.color, summaryLabelSettings.color);
            summaryLabelSettings.labelDisplayUnits = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.labelDisplayUnits, summaryLabelSettings.labelDisplayUnits);
            summaryLabelSettings.labelPrecision = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.labelPrecision, summaryLabelSettings.labelPrecision);
            summaryLabelSettings.labelPrecision = summaryLabelSettings.labelPrecision < 0 ? 0 : (summaryLabelSettings.labelPrecision) > 8 ? 8 : (summaryLabelSettings.labelPrecision);
            summaryLabelSettings.fontSize = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.fontSize, summaryLabelSettings.fontSize);
            summaryLabelSettings.text = DataViewObjects.getValue(objects, detaillabelprop.summaryLabels.text, summaryLabelSettings.text);
            return summaryLabelSettings
        }

        private getDefaultPrimaryIndicator(): primaryIndicator {
            return {
                show: false,
                signIndicator: false,
                threshold: null,
                totalThreshold: null
            }
        }

        private getPrimaryIndicator(dataView: DataView): primaryIndicator {
            var objects: DataViewObjects = null;
            var primaryIndicatorSettings: primaryIndicator = this.getDefaultPrimaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects)
                return primaryIndicatorSettings;
            objects = dataView.metadata.objects;
            var chartIndicatorProp = chartProperties.indicators;
            primaryIndicatorSettings.show = DataViewObjects.getValue(objects, chartIndicatorProp.show, primaryIndicatorSettings.show);
            primaryIndicatorSettings.signIndicator = DataViewObjects.getValue(objects, chartIndicatorProp.primaryMeasure, primaryIndicatorSettings.signIndicator);
            if (!primaryIndicatorSettings.signIndicator) {
                primaryIndicatorSettings.threshold = DataViewObjects.getValue(objects, chartIndicatorProp.threshold, primaryIndicatorSettings.threshold);
                primaryIndicatorSettings.totalThreshold = DataViewObjects.getValue(objects, chartIndicatorProp.totalThreshold, primaryIndicatorSettings.totalThreshold);
            }
            return primaryIndicatorSettings;
        }

        private getDefaultSecondaryIndicator(): secondaryIndicator {
            return {
                show: false,
                signIndicator: false,
                threshold: null,
                totalThreshold: null
            }
        }

        private getSecondaryIndicator(dataView: DataView): secondaryIndicator {
            var objects: DataViewObjects = null;
            var secIndicatorSettings: primaryIndicator = this.getDefaultSecondaryIndicator();
            if (!dataView.metadata || !dataView.metadata.objects)
                return secIndicatorSettings;
            objects = dataView.metadata.objects;
            var chartIndicatorProp = chartProperties.smIndicator;
            secIndicatorSettings.show = DataViewObjects.getValue(objects, chartIndicatorProp.show, secIndicatorSettings.show);
            secIndicatorSettings.signIndicator = DataViewObjects.getValue(objects, chartIndicatorProp.secondaryMeasure, secIndicatorSettings.signIndicator);
            if (!secIndicatorSettings.signIndicator) {
                secIndicatorSettings.threshold = DataViewObjects.getValue(objects, chartIndicatorProp.threshold, secIndicatorSettings.threshold);
                secIndicatorSettings.totalThreshold = DataViewObjects.getValue(objects, chartIndicatorProp.totalThreshold, secIndicatorSettings.totalThreshold);
            }
            return secIndicatorSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            let legendConfigs: legendConfig = this.getLegendSettings(this.dataViews);
            let detaillabelprop: DetailLables = this.getDetailLable(this.dataViews);
            let summaryLabels: summaryLabels = this.getSummaryLabels(this.dataViews);
            let pmIndicator: primaryIndicator = this.getPrimaryIndicator(this.dataViews);
            let smIndicator: secondaryIndicator = this.getSecondaryIndicator(this.dataViews);

            switch (objectName) {
                case 'legend':
                    objectEnumeration.push({
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: legendConfigs.show,
                            position: LegendPosition[this.legend.getOrientation()],
                            showTitle: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.showTitle, true),
                            titleText: legendConfigs.legendName,
                            labelColor: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.labelColor, null),
                            fontSize: powerbi.extensibility.utils.dataview.DataViewObject.getValue(this.legendObjectProperties, powerbi.extensibility.utils.chart.legend.legendProps.fontSize, 8),
                            detailedLegend: legendConfigs.primaryMeasure,
                            labelDisplayUnits: legendConfigs.displayUnits,
                            labelPrecision: legendConfigs.decimalPlaces
                        }
                    });
                    break;
                case 'dataPoint':
                    for (let donutDataPoint of this.donutDataPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: donutDataPoint.category,
                            properties: {
                                fill: {
                                    solid: {
                                        color: donutDataPoint.color
                                    }
                                }
                            },
                            selector: donutDataPoint.selectionId.getSelector()
                        });
                    }
                    break;
                case 'labels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: detaillabelprop.show,
                            color: detaillabelprop.color,
                            labelDisplayUnits: detaillabelprop.labelDisplayUnits,
                            labelPrecision: detaillabelprop.labelPrecision,
                            fontSize: detaillabelprop.fontSize,
                            labelStyle: detaillabelprop.labelStyle
                        },
                        selector: null
                    });
                    break;
                case 'summaryLabels':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: summaryLabels.show,
                            color: summaryLabels.color,
                            labelDisplayUnits: summaryLabels.labelDisplayUnits,
                            labelPrecision: summaryLabels.labelPrecision,
                            fontSize: summaryLabels.fontSize,
                            primaryMeasureSummaryText: summaryLabels.text
                        },
                        selector: null
                    });
                    break;
                case 'Indicators':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: pmIndicator.show,
                            PrimaryMeasure: pmIndicator.signIndicator,
                            Threshold: pmIndicator.threshold,
                            Total_Threshold: pmIndicator.totalThreshold
                        },
                        selector: null
                    });
                    break;

                case 'SMIndicator':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: smIndicator.show,
                            SecondaryMeasure: smIndicator.signIndicator,
                            SMThreshold: smIndicator.threshold,
                            SMTotalThreshold: smIndicator.totalThreshold
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }

        public destroy(): void {
            //Perform any cleanup tasks here
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                header: value.data.category,
                displayName: '',
                value: this.primaryMeasurePercent ? (value.value * 100).toFixed(2).toString() + ' %' : value.value.toString(),
                color: value.color,
            }];
        }
    }
}
