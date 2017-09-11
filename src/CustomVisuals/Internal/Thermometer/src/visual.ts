module powerbi.extensibility.visual {
    import Selection = d3.Selection;
    import DataView = powerbi.DataView;
    import IViewport = powerbi.IViewport;
    import VisualObjectInstance = powerbi.VisualObjectInstance;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import Legend = powerbi.extensibility.utils.chart.legend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendDataPoint = powerbi.extensibility.utils.chart.legend.LegendDataPoint;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    import SVGUtil = powerbi.extensibility.utils.svg;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export class ThermometerSettings extends DataViewObjectsParser {
        legend: LegendSettings = new LegendSettings();
    }

    export class LegendSettings {
        show: boolean = true;
        position: string = "Right";
        showTitle: boolean = false;
        titleText: string = "";
        labelColor: string = "#000000";
        fontSize: number = 8;
    }

    export interface ViewModel {
        value: number;
        targetValue: number;
        color?: string;
        min?: number;
        max?: number;
        drawTickBar?: boolean;
    }
    export interface Range {
        range1: number;
        range2: number;
        range3: number;
        range4: number;
    }

    export interface ThermometerViewModel {
        dataView: DataView;
        settings: ThermometerSettings;
        legendData: LegendData;
    }

    module Selectors {
        export const ClassName: ClassAndSelector = createClassAndSelector("thermometer");
        export const Chart: ClassAndSelector = createClassAndSelector("chart");
        export const ChartLine: ClassAndSelector = createClassAndSelector("chart-line");
        export const Body: ClassAndSelector = createClassAndSelector("thermometer-body");
        export const Label: ClassAndSelector = createClassAndSelector("label");
        export const LegendItems: ClassAndSelector = createClassAndSelector("legendItem");
        export const LegendTitle: ClassAndSelector = createClassAndSelector("legendTitle");
    }

    export class Thermometer implements IVisual {

        private viewport: IViewport;
        private settings: any;
        private svg: d3.Selection<SVGElement>;
        private mainGroup: d3.Selection<SVGElement>;
        private backCircle: d3.Selection<SVGElement>;
        private backRect: d3.Selection<SVGElement>;
        private fillCircle: d3.Selection<SVGElement>;
        private fillRect: d3.Selection<SVGElement>;
        private tempMarkings: d3.Selection<SVGElement>;
        private target: d3.Selection<SVGElement>;
        private text: d3.Selection<SVGElement>;
        public data: ViewModel;
        public range: Range;
        public dataView: DataView;
        private viewModel: ThermometerViewModel;
        public fill: string;
        public border: string;
        private ThermometerDiv: Selection<any>;
        private interactivityService: IInteractivityService;
        private host: IVisualHost;
        private isInteractiveChart: boolean = false;
        private legend: ILegend;
        private body: Selection<any>;
        private element: HTMLElement;

        private static LegendPropertyIdentifier: DataViewObjectPropertyIdentifier = {
            objectName: "legend",
            propertyName: "fill"
        };

        private prevDataViewObjects: any = {};

        private createLegendData(dataView: DataView, host: IVisualHost, settings: ThermometerSettings): LegendData {

            const legendData: LegendData = {
                fontSize: this.viewport.height * 0.032,
                dataPoints: [],
                title: settings.legend.showTitle ? (settings.legend.titleText) : null,
                labelColor: settings.legend.labelColor
            };

            var low = [this.data.min, this.range.range1, this.range.range2, this.range.range3];
            var high = [this.range.range1, this.range.range2, this.range.range3, this.data.max];
            var i = 0;
            var label = [];
            while (low[i] != this.data.max && i < 4) {
                label.push((i + 1).toString());
                i++;
            }
            var category = dataView.categorical.categories[0];

            legendData.dataPoints = label.map(
                (typeMeta: string, index: number): LegendDataPoint => {
                    let lowValue = low[parseInt(typeMeta) - 1] < 0 ? '(' + low[parseInt(typeMeta) - 1] + ')' : low[parseInt(typeMeta) - 1];
                    let highValue = high[parseInt(typeMeta) - 1] < 0 ? '(' + high[parseInt(typeMeta) - 1] + ')' : high[parseInt(typeMeta) - 1];
                    let label = lowValue + '-' + highValue;
                    return {
                        label: label as string,
                        color: Thermometer.getFill(dataView, 'fill' + typeMeta).solid.color,
                        icon: LegendIcon.Circle,
                        selected: false,
                        identity: host.createSelectionIdBuilder()
                            .withCategory(category, index)
                            .withMeasure(typeMeta)
                            .createSelectionId()
                    };
                });

            return legendData;
        }

        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            let svg = this.svg = d3.select(options.element).style('height', '100%').append('svg').classed('Thermometer', true);
            options.element.setAttribute("id", "container");
            this.body = d3.select(options.element);
            this.ThermometerDiv = this.body.append("div")
                .classed(Selectors.Body.class, true);
            this.interactivityService = createInteractivityService(this.host);
            this.element = options.element;
            this.legend = createLegend($(this.element),
                this.isInteractiveChart,
                this.interactivityService,
                true,
                null);
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            this.viewport = options.viewport;
            if (!options.dataViews)
                return;
            if (0 === options.dataViews.length)
                return;
            var dataView = options.dataViews[0];
            this.dataView = options.dataViews[0];

            this.data = {
                value: 0,
                targetValue: null,
                color: null,
                min: null,
                max: null,
                drawTickBar: null
            }
            if (dataView && dataView.categorical) {
                if (!dataView.categorical.categories || dataView.categorical.categories.length == 0)
                    return;
                if (typeof dataView.categorical.categories[0].values[0] !== 'number')
                    return;
                this.data.value = <number>dataView.categorical.categories[0].values[0];
                var series = dataView.categorical.values;

                if (series && 0 !== series.length) {
                    var length = series.length;
                    var iCount = 0;
                    while (iCount < length) {
                        if (series[iCount].source.roles["TargetValue"]) {
                            if (typeof series[iCount].values[0] === 'number')
                                this.data.targetValue = <number>series[iCount].values[0];
                        }
                        if (series[iCount].source.roles["Min"]) {
                            if (typeof series[iCount].values[0] === 'number')
                                this.data.min = <number>series[iCount].values[0];
                        }
                        if (series[iCount].source.roles["Max"]) {
                            if (typeof series[iCount].values[0] === 'number')
                                this.data.max = <number>series[iCount].values[0];
                        }
                        iCount++;
                    }
                }
            }
            if (!this.data.max)
                this.data.max = Thermometer.getValue(this.dataView, 'max', 100);
            if (!this.data.min)
                this.data.min = Thermometer.getValue(this.dataView, 'min', 0);

            this.data.drawTickBar = Thermometer.getValue(this.dataView, 'tickBar', true);
            let maximum = this.data.max;
            let minimum = this.data.min;
            if (this.data.targetValue) {
                maximum = Math.max(this.data.value, this.data.targetValue);
                minimum = Math.min(this.data.value, this.data.targetValue);
            }
            else {
                maximum = Math.max(this.data.value, maximum);
                minimum = Math.min(this.data.value, minimum);
            }
            // To handle values greater than max value
            if (maximum > this.data.max) {
                this.data.max = Math.ceil(maximum);
            }
            if (minimum < this.data.min) {
                this.data.min = Math.floor(minimum);
            }
            if (this.data.min >= this.data.max) {
                this.data.min = this.data.max - 1;
            }
            var viewport = options.viewport;
            var duration = 1000;

            // By default, only category-1
            this.range = {
                range1: this.data.max,
                range2: this.data.max,
                range3: this.data.max,
                range4: this.data.max
            };

            this.range.range1 = Thermometer.getValue(this.dataView, 'range1', undefined);
            this.range.range2 = Thermometer.getValue(this.dataView, 'range2', undefined);
            this.range.range3 = Thermometer.getValue(this.dataView, 'range3', undefined);
            this.range.range4 = Thermometer.getValue(this.dataView, 'range4', undefined);

            if (this.range.range1 <= this.data.min || this.range.range1 > this.data.max || this.range.range2 <= this.range.range1 || this.range.range2 > this.data.max || this.range.range3 <= this.range.range2 || this.range.range3 > this.data.max || this.range.range4 <= this.range.range3) {
                this.svg.selectAll("*").remove();
                this.body.select('.legend').style({ 'display': 'none' });
                this.body.select('.errorMessage').remove();
                this.body
                    .append('div')
                    .classed('errorMessage', true)
                    .text("Please enter appropriate range values")
                    .style({
                        'display': 'block'
                        , 'top': this.viewport.height / 2 + 'px', 'position': 'absolute'
                        , 'width': '100%'
                    });
                return
            }
            else {
                this.body.select('.errorMessage').remove();
                this.body.select('.legend').style({ 'display': 'block' });
                this.range.range1 = Thermometer.getValue(this.dataView, 'range1', this.data.max);
                this.range.range2 = Thermometer.getValue(this.dataView, 'range2', this.data.max);
                this.range.range3 = Thermometer.getValue(this.dataView, 'range3', this.data.max);
                this.range.range4 = this.data.max;
            }

            if (this.data.value >= this.data.min && this.data.value <= this.range.range1) {
                this.fill = 'fill1';
                this.border = 'border1';
            }
            else if (this.data.value > this.range.range1 && this.data.value <= this.range.range2) {
                this.fill = 'fill2';
                this.border = 'border2';
            }
            else if (this.data.value > this.range.range2 && this.data.value <= this.range.range3) {
                this.fill = 'fill3';
                this.border = 'border3';
            }
            else {
                this.fill = 'fill4';
                this.border = 'border4';
            }

            const settings: ThermometerSettings = ThermometerSettings.parse<ThermometerSettings>(dataView);
            let legendData = this.createLegendData(this.dataView, this.host, settings);
            this.viewModel = {
                dataView: this.dataView,
                settings: settings,
                legendData: legendData
            }
            this.renderLegend();
            var height = viewport.height;
            var width = viewport.width;
            this.svg.attr("width", width);
            this.svg.attr("height", '100%');
            d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - height);
            this.draw(width, 0.98 * height, duration);
        }

        public draw(width: number, height: number, duration: number) {
            this.svg.selectAll("*").remove();
            this.mainGroup = this.svg.append('g');
            this.backRect = this.mainGroup.append('rect');
            this.backCircle = this.mainGroup.append('circle');
            this.fillRect = this.mainGroup.append('rect');
            this.fillCircle = this.mainGroup.append('circle');
            this.text = this.mainGroup.append('text');
            this.tempMarkings = this.svg.append("g").attr("class", "y axis");
            this.target = this.svg.append("g").attr("class", "yLeftAxis axis");
            var radius = height * 0.1;
            var padding = radius * 0.25;
            this.drawBack(width, height, radius);
            this.drawFill(width, height, radius, padding, duration);
            this.drawTicks(width, height, radius, padding);
            this.drawText(width, height, radius, padding);
            if (this.data.targetValue)
                this.drawTarget(width, height, radius, padding);
            d3.select("#y axis").remove();
        }

        public drawBack(width: number, height: number, radius: number) {
            var rectHeight = height - radius;
            var fill = Thermometer.getFill(this.dataView, this.border).solid.color;
            this.backCircle
                .attr({
                    'cx': width / 2,
                    'cy': rectHeight,
                    'r': radius
                })
                .style({
                    'fill': fill
                });

            this.backRect
                .attr({
                    'x': (width - radius) / 2,
                    'y': 0,
                    'width': radius,
                    'height': rectHeight
                })
                .style({
                    'fill': fill
                })
        }

        public drawFill(width: number, height: number, radius: number, padding: number, duration: number) {
            var innerRadius = radius * 0.8;
            var fillWidth = innerRadius * 0.7;
            var ZeroValue = height - (radius * 2) - padding;
            var fill = Thermometer.getFill(this.dataView, this.fill).solid.color;

            var min = this.data.min;
            var max = this.data.max;

            var value = this.data.value;
            var percentage = (ZeroValue - padding) * ((value - min) / (max - min));
            var rectHeight = height - radius;
            if (isNaN(rectHeight)) {
                rectHeight = 0;
            }
            if (isNaN(percentage)) {
                percentage = 0;
            }
            this.fillCircle.attr({
                'cx': width / 2,
                'cy': rectHeight,
                'r': innerRadius
            }).style({
                'fill': fill
            });
            if (rectHeight !== 0 && percentage !== 0) {
                this.fillRect
                    .style({
                        'fill': fill
                    })
                    .attr({
                        'x': (width - fillWidth) / 2,
                        'width': fillWidth,
                    })
                    .attr({
                        'y': ZeroValue - percentage,
                        'height': rectHeight - ZeroValue + percentage
                    });
            }
        }

        private drawTicks(width: number, height: number, radius: number, padding: number) {
            d3.select(".y.axis").attr("visibility", "visible");
            var y, yAxis, tickData = [], iCount;
            var postFix = Thermometer.getValue(this.dataView, 'postfix', '');
            y = d3.scale.linear().range([height - (radius * 2) - padding, padding]);
            y.domain([this.data.min, this.data.max]);
            var interval = (this.data.max - this.data.min) / 5;
            tickData[0] = this.data.min;
            let sTextNew;
            for (iCount = 1; iCount < 6; iCount++) {
                tickData[iCount] = tickData[iCount - 1] + interval;
            }
            for (iCount = 0; iCount < 6; iCount++) {
                let sText = tickData[iCount] + " " + postFix;
                sTextNew = postFix;
                var fTextWidth, iTextHeight;
                let textProperties: TextProperties = {
                    text: sText,
                    fontFamily: 'Segoe UI',
                    fontSize: (radius * 0.48) + "px"
                };
                fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
                iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);
                let spaceAvailable = (width - radius) / 2 - (radius * 0.3);
                let iNumofChars = sText.length;
                let fCharSpace = fTextWidth / iNumofChars;
                let iNumofCharsAllowed = spaceAvailable / fCharSpace;
                if (iNumofCharsAllowed < iNumofChars)
                    sTextNew = sTextNew.substring(0, iNumofCharsAllowed - 10) + "...";
            }
            yAxis = d3.svg.axis().scale(y).ticks(6).orient("right").tickValues(tickData);
            this.tempMarkings
                .attr("transform", "translate(" + ((width + radius) / 2 + (radius * 0.15)) + ",0)")
                .style({
                    'font-size': (radius * 0.03) + 'em',
                    'font-family': 'Segoe UI',
                    'stroke': 'none',
                    'fill': '#333'
                })
                .call(yAxis);
            this.tempMarkings.selectAll('.axis line, .axis path').style({ 'stroke': '#333', 'fill': 'none' });
            for (iCount = 0; iCount < document.querySelectorAll('.axis text').length; iCount++) {
                document.querySelectorAll('.axis text')[iCount].innerHTML = document.querySelectorAll('.axis text')[iCount].innerHTML + ' ' + sTextNew;
            }
            if (!this.data.drawTickBar) {
                d3.select(".y.axis").attr("visibility", "hidden");
            }

        }

        private drawTarget(width: number, height: number, radius: number, padding: number) {
            var postFix = Thermometer.getValue(this.dataView, 'postfix', '');
            d3.select(".yLeftAxis.axis").attr("visibility", "visible");
            var target = this.data.targetValue;

            var ZeroValue = height - (radius * 2) - padding;
            var min = this.data.min;
            var max = this.data.max;
            var percentage = (ZeroValue - padding) * ((target - min) / (max - min));

            var yPos = ZeroValue - percentage;

            var sText = target + " " + postFix;
            var fTextWidth, iTextHeight;
            let textProperties: TextProperties = {
                text: sText,
                fontFamily: 'Segoe UI',
                fontSize: (radius * 0.48) + "px"
            };
            fTextWidth = textMeasurementService.measureSvgTextWidth(textProperties);
            iTextHeight = textMeasurementService.measureSvgTextHeight(textProperties);

            this.svg.append("line")
                .style("stroke", "black")
                .attr("x1", (width - radius) / 2)
                .attr("y1", yPos)
                .attr("x2", (width - radius) / 2 - (radius * 0.3))
                .attr("y2", yPos);

            let spaceAvailable = (width - radius) / 2 - (radius * 0.3);
            let iNumofChars = sText.length;
            let fCharSpace = fTextWidth / iNumofChars;
            let iNumofCharsAllowed = spaceAvailable / fCharSpace;
            let sTextNew = sText;
            if (iNumofCharsAllowed < iNumofChars)
                sTextNew = sText.substring(0, iNumofCharsAllowed - 2) + "...";
            let textPropertiesNew: TextProperties = {
                text: sTextNew,
                fontFamily: 'Segoe UI',
                fontSize: (radius * 0.48) + "px"
            };
            let fTextWidthNew = textMeasurementService.measureSvgTextWidth(textPropertiesNew);
            let iTextHeightNew = textMeasurementService.measureSvgTextHeight(textPropertiesNew);

            this.svg.append("text")
                .attr({ "x": (width - radius) / 2 - (radius * 0.3) - fTextWidthNew + "px", "y": (yPos) + iTextHeight * 0.1 + radius * 0.1 + "px", "font-size": (radius * 0.48) + "px", "text-anchor": "left" })
                .text(sTextNew)
                .append("svg:title")
                .text(function (d) { return "Target Value: " + sText });

        }

        private drawText(width: number, height: number, radius: number, padding: number) {
            this.text
                .text((this.data.value > this.data.max ? this.data.max : this.data.value) | 0)
                .attr({ 'x': width / 2, y: height - radius, 'dy': '.35em' })
                .style({
                    'fill': Thermometer.getFill(this.dataView, 'fontColor').solid.color,
                    'text-anchor': 'middle',
                    'font-family': 'Segoe UI',
                    'font-size': (radius * 0.03) + 'em'
                })
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;

            switch (options.objectName) {
                case 'config':
                    var config: VisualObjectInstance = {
                        objectName: 'config',
                        displayName: 'Configurations',
                        selector: null,
                        properties: {
                            max: Thermometer.getValue<number>(dataView, 'max', null),
                            min: Thermometer.getValue<number>(dataView, 'min', null),
                            tickBar: Thermometer.getValue<boolean>(dataView, 'tickBar', true),
                            fontColor: Thermometer.getFill(dataView, 'fontColor'),
                            postfix: Thermometer.getValue<string>(dataView, 'postfix', '')
                        }
                    };
                    instances.push(config);
                    break;
                case 'ranges':
                    var ranges: VisualObjectInstance = {
                        objectName: 'ranges',
                        displayName: 'Ranges',
                        selector: null,
                        properties: {
                            range1: Thermometer.getValue<number>(dataView, 'range1', null),
                            range2: Thermometer.getValue<number>(dataView, 'range2', null),
                            range3: Thermometer.getValue<number>(dataView, 'range3', null),
                            range4: Thermometer.getValue<number>(dataView, 'range4', null)
                        }
                    };
                    instances.push(ranges);
                    break;
                case 'category1':
                    var category1: VisualObjectInstance = {
                        objectName: 'category1',
                        displayName: 'Category 1',
                        selector: null,
                        properties: {
                            fill1: Thermometer.getFill(dataView, 'fill1'),
                            border1: Thermometer.getFill(dataView, 'border1')
                        }
                    };
                    instances.push(category1);
                    break;
                case 'category2':
                    var category2: VisualObjectInstance = {
                        objectName: 'category2',
                        displayName: 'Category 2',
                        selector: null,
                        properties: {
                            fill2: Thermometer.getFill(dataView, 'fill2'),
                            border2: Thermometer.getFill(dataView, 'border2')
                        }
                    };
                    instances.push(category2);
                    break;
                case 'category3':
                    var category3: VisualObjectInstance = {
                        objectName: 'category3',
                        displayName: 'Category 3',
                        selector: null,
                        properties: {
                            fill3: Thermometer.getFill(dataView, 'fill3'),
                            border3: Thermometer.getFill(dataView, 'border3')
                        }
                    };
                    instances.push(category3);
                    break;
                case 'category4':
                    var category4: VisualObjectInstance = {
                        objectName: 'category4',
                        displayName: 'Category 4',
                        selector: null,
                        properties: {
                            fill4: Thermometer.getFill(dataView, 'fill4'),
                            border4: Thermometer.getFill(dataView, 'border4')
                        }
                    };
                    instances.push(category4);
                    break;
                case 'legend':
                    var legend: VisualObjectInstance = {
                        objectName: 'legend',
                        displayName: 'Legend',
                        selector: null,
                        properties: {
                            show: Thermometer.getValue<boolean>(dataView, 'show', true),
                            position: Thermometer.getValue<string>(dataView, 'position', 'Right'),
                            showTitle: Thermometer.getValue<boolean>(dataView, 'showTitle', false),
                            titleText: Thermometer.getValue<string>(dataView, 'titleText', null),
                            labelColor: Thermometer.getFill(dataView, 'labelColor'),
                        }
                    };
                    instances.push(legend);
                    break;
            }

            return instances;
        }


        /**
         * Get legend data, calculate position and draw it
         */
        private renderLegend(): void {

            if (!this.viewModel)
                return;
            if (!this.viewModel.legendData) {
                return;
            }
            let position: LegendPosition = this.viewModel.settings.legend.show
                ? LegendPosition[this.viewModel.settings.legend.position]
                : LegendPosition.None;
            this.legend.changeOrientation(position);

            this.legend.drawLegend(this.viewModel.legendData, _.clone(this.viewport));
            Legend.positionChartArea(this.ThermometerDiv, this.legend);
            this.svg.style('margin', 0);
            switch (this.legend.getOrientation()) {
                case LegendPosition.Left:
                case LegendPosition.LeftCenter:
                    this.svg.style('margin-left', parseInt($(".legend").css('width')));
                case LegendPosition.Right:
                case LegendPosition.RightCenter:
                    this.viewport.width -= this.legend.getMargins().width;
                    break;
                case LegendPosition.Top:
                case LegendPosition.TopCenter:
                    this.svg.style('margin-top', parseInt($(".legend").css('height')));
                    d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - 2 * this.legend.getMargins().height);
                case LegendPosition.Bottom:
                case LegendPosition.BottomCenter:
                    this.viewport.height -= 1.9 * this.legend.getMargins().height;
                    d3.select(".legend").style('margin-top', parseInt($(".legend").css('marginTop')) - 2.2 * this.legend.getMargins().height);
                    break;
            }
        }


        private static getFill(dataView: DataView, key): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;

                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var fill = <Fill>config[key];
                        if (fill)
                            return fill;
                    }
                    var category1 = objects['category1'];
                    if (category1) {
                        var fill = <Fill>category1[key];
                        if (fill)
                            return fill;
                    }
                    var category2 = objects['category2'];
                    if (category2) {
                        var fill = <Fill>category2[key];
                        if (fill)
                            return fill;
                    }
                    var category3 = objects['category3'];
                    if (category3) {
                        var fill = <Fill>category3[key];
                        if (fill)
                            return fill;
                    }
                    var category4 = objects['category4'];
                    if (category4) {
                        var fill = <Fill>category4[key];
                        if (fill)
                            return fill;
                    }
                    var legend = objects['legend'];
                    if (legend) {
                        var fill = <Fill>legend[key];
                        if (fill)
                            return fill;
                    }
                }
            }
            switch (key) {
                case 'fontColor':
                    return { solid: { color: '#000' } };
                case 'fill1':
                    return { solid: { color: '#13D9F9' } };
                case 'fill2':
                    return { solid: { color: '#86EA22' } };
                case 'fill3':
                    return { solid: { color: '#FBA91C' } };
                case 'fill4':
                    return { solid: { color: '#EC4427' } };
                case 'border1':
                    return { solid: { color: '#D0EEF7' } };
                case 'border2':
                    return { solid: { color: '#D5F3B6' } };
                case 'border3':
                    return { solid: { color: '#ECCA90' } };
                case 'border4':
                    return { solid: { color: '#F9A99B' } };
                case 'labelColor':
                    return { solid: { color: '#000' } };
                default:
                    return { solid: { color: '#D0EEF7' } };
            }
        }

        private static getValue<T>(dataView: DataView, key: string, defaultValue: T): T {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var config = objects['config'];
                    if (config) {
                        var size = <T>config[key];
                        if (size != null)
                            return size;
                    }
                    var ranges = objects['ranges'];
                    if (ranges) {
                        var range = <T>ranges[key];
                        if (range)
                            return range;
                    }
                    var legend = objects['legend'];
                    if (legend) {
                        var value = <T>legend[key];
                        if (value != null)
                            return value;
                    }

                }
            }
            return defaultValue;
        }
    }

}