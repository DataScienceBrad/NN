module powerbi.extensibility.visual {

    interface PyramidChartViewModel {
        dataPoints: PyramidChartDataPoint[];
    };

    interface PyramidChartDataPoint {
        category: string;
        color: string;
        selectionId: ISelectionId;
    };

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): PyramidChartViewModel {
        if (!options.dataViews)
            return;
        if (!options.dataViews[0])
            return;
        if (!options.dataViews[0].categorical)
            return;
       
        let dataViews = options.dataViews;
        let categorical: any;
        categorical = options.dataViews[0].categorical;
        let category: any;
        category = categorical.categories[0];
        let pyramidChartDataPoints: PyramidChartDataPoint[] = [];
        let colorPalette: IColorPalette = createColorPalette(host.colors).reset();
        let objects = options.dataViews[0];
        for (let iIterator = 0; iIterator < category.values.length; iIterator++) {
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(category.values[iIterator]).value
                }
            }
            pyramidChartDataPoints.push({
                category: category.values[iIterator],
                color: getCategoricalObjectValue<Fill>(category, iIterator, 'sectionColors', 'sColors', defaultColor).solid.color,
                selectionId: host.createSelectionIdBuilder().withCategory(category, iIterator).createSelectionId()
            });
        }
        return {
            dataPoints: pyramidChartDataPoints
        };

    }

    export class PyramidChart implements IVisual {
        private viewport: IViewport;
        private svg: d3.Selection<SVGElement>;
        public dataView: DataView;
        public mainGroup: any;
        private label: any = {};
        private path: any = {};
        private lines: any = {};
        private prevDataViewObjects: any = {};
        public tangentLeft: any;
        public tangentRight: any;
        public color: any = {};
        public host: IVisualHost;
        private pyramidChartPoints: PyramidChartDataPoint[];
        private selectionManager: ISelectionManager;
        public toolTipDiv: any;
        public assignData = [0, 1];
            
        /** This is called once when the visual is initialially created */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            let svg = this.svg = d3.select(options.element).append('svg').classed('PyramidChart', true);
            options.element.setAttribute("id", "container");
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            var temp;
            this.svg.selectAll("*").remove();
            this.mainGroup = this.svg.append('g');
            if (!options.dataViews)
                return;
            if (0 === options.dataViews.length)
                return;
            this.dataView = options.dataViews[0];
            if (!this.dataView.categorical || !Object.getPrototypeOf(this.dataView.categorical).categories || !Object.getPrototypeOf(this.dataView.categorical).categories[0] || !Object.getPrototypeOf(this.dataView.categorical).categories[1])
                return

            // Color format option
            // Sorting
            if (Object.getPrototypeOf(this.dataView.categorical).categories[0].identityFields["0"].ref == "Value") {
                this.assignData[0] = 1; this.assignData[1] = 0;
            }
            else {
                this.assignData[0] = 0; this.assignData[1] = 1;
            }
            for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                for (var j = i + 1; j < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; j++) {
                    if (Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i] < Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[j]) {
                        temp = Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i];
                        Object.getPrototypeOf(this.dataView.categorical).categories[1].values[i] = Object.getPrototypeOf(this.dataView.categorical).categories[1].values[j];
                        Object.getPrototypeOf(this.dataView.categorical).categories[1].values[j] = temp;
                        temp = Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i];
                        Object.getPrototypeOf(this.dataView.categorical).categories[0].values[i] = Object.getPrototypeOf(this.dataView.categorical).categories[0].values[j];
                        Object.getPrototypeOf(this.dataView.categorical).categories[0].values[j] = temp;
                    }
                }
            }
            for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[0].values.length; i++) {
                this.path[i] = this.mainGroup.append('path');
                this.label[i] = this.mainGroup.append('text');
                this.lines[i] = this.mainGroup.append('path');
            }
            let viewModel: PyramidChartViewModel = visualTransform(options, this.host);
            if (!viewModel)
                return;
            this.pyramidChartPoints = viewModel.dataPoints;
            for (var i = 0; i < this.pyramidChartPoints.length; i++) {
                this.color[i] = this.pyramidChartPoints[i].color;
            }
            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;
            var duration = 1;
            this.svg.attr({ 'height': height, 'width': width });
            this.draw(width, height, duration);
        }

        public calculateTangent(x1: number, y1: number, x2: number, y2: number) {
            return (y2 - y1) / (x2 - x1);
        }

        public draw(width: number, height: number, duration: number) {
            var availWidth = width, availHeight = height, sumValues = 0;
            var marginWidth = availWidth * 0.2, marginHeight = availHeight * 0.2;
            var mainGroup = this.mainGroup;
            var dataView = this.dataView;
            //draw pyramid sections
            this.tangentLeft = this.calculateTangent(availHeight - marginHeight / 2, marginWidth / 2, marginHeight / 2, availWidth / 2);
            this.tangentRight = this.calculateTangent(availHeight - marginHeight / 2, availWidth - marginWidth / 2, marginHeight / 2, availWidth / 2);
            var calculatedXLeft = 0, calculatedY = 0, calculatedXRight = 0, calculatedHeight = 0, calculatedWidth = 0;
            var oAttrPyramid = {
                x1: marginWidth / 2,
                y1: availHeight - marginHeight / 2,
                x2: availWidth - marginWidth / 2,
                y2: availHeight - marginHeight / 2,
                x3: 0,
                y3: 0,
                x4: 0,
                y4: 0
            }
            var oAttrLabel = {
                x: marginWidth / 2,
                y: availHeight - marginHeight / 2,
                text: ''
            };
            for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[0]].values.length; i++) {
                sumValues = sumValues + Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i];
            }
            var pointsParameters = "";
            var sumHeight = 0;
            var textBox;
            for (var i = 0; i < Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[0]].values.length; i++) {
                //draw sections
                calculatedHeight = (availHeight - marginHeight) * Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i] / sumValues;
                sumHeight += calculatedHeight
                calculatedY = availHeight - sumHeight - marginHeight / 2; 0;
                calculatedXLeft = availWidth / 2 - this.tangentLeft * (marginHeight / 2 - calculatedY);
                calculatedXRight = availWidth / 2 - this.tangentRight * (marginHeight / 2 - calculatedY);
                oAttrPyramid.x3 = calculatedXRight;
                oAttrPyramid.y3 = calculatedY;
                oAttrPyramid.x4 = calculatedXLeft;
                oAttrPyramid.y4 = calculatedY;
                pointsParameters = "M" + oAttrPyramid.x1 + "," + oAttrPyramid.y1 + "," + oAttrPyramid.x2 + "," + oAttrPyramid.y2 + "," + oAttrPyramid.x3 + "," + oAttrPyramid.y3 + "," + oAttrPyramid.x4 + "," + oAttrPyramid.y4 + "Z";
                oAttrLabel.text = Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i];
                oAttrLabel.x = availWidth - oAttrPyramid.x1;
                oAttrLabel.y = (oAttrPyramid.y1 + oAttrPyramid.y4) / 2;
                var xCord: any, yCord: any, pointsParametersArray, textBox, xToolTip, yToolTip;
                this.path[i].attr({ 'd': pointsParameters, 'text': Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[0]].values[i] + ": " + Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i], 'color': this.color[i] })
                    .style({ 'fill': this.color[i], 'stroke': this.color[i], 'stroke-width': '1' })
                this.path[i].on("mouseover", function (d) {
                    pointsParametersArray = this.getAttribute('d').slice(1, this.getAttribute('d').length - 1).split(',');
                    yCord = (parseFloat(pointsParametersArray[1]) + parseFloat(pointsParametersArray[5])) / 2;
                    mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px' });
                    textBox = document.getElementById('toolTip').getBoundingClientRect();
                    mainGroup.append('rect').attr({ 'width': textBox.width + 10, 'height': textBox.height + 5, 'x': d3.mouse(this)[0] +10, 'y': d3.mouse(this)[1] - 26.5, 'id': 'toolTipRect' }).style({ 'fill': 'white', 'stroke': this.attributes.color.textContent, 'stroke-width': '1' })
                    d3.select("#toolTip").remove();
                    mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px', 'fill': 'black' });
                })
                    .on("mouseout", function () { d3.select("#toolTip").remove(); d3.select("#toolTipRect").remove(); })
                    .on("mousemove", function () {
                        d3.select("#toolTip").remove();
                        d3.select("#toolTipRect").remove();
                        pointsParametersArray = this.getAttribute('d').slice(1, this.getAttribute('d').length - 1).split(',');
                        yCord = (parseFloat(pointsParametersArray[1]) + parseFloat(pointsParametersArray[5])) / 2;
                        mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px' });
                        textBox = document.getElementById('toolTip').getBoundingClientRect();
                        mainGroup.append('rect').attr({ 'width': textBox.width + 10, 'height': textBox.height + 5, 'x': d3.mouse(this)[0] + 10, 'y': d3.mouse(this)[1] - 26.5, 'id': 'toolTipRect' }).style({ 'fill': 'white', 'stroke': this.attributes.color.textContent})
                        d3.select("#toolTip").remove();
                        mainGroup.append('text').text(this.attributes.text.textContent).attr({ 'x': d3.mouse(this)[0] + 15, 'y': d3.mouse(this)[1] - 10, 'id': 'toolTip' }).style({ 'text-anchor': 'top', 'font-size': '14px', 'fill': 'black' });
                        });
                oAttrPyramid.x1 = oAttrPyramid.x4;
                oAttrPyramid.x2 = oAttrPyramid.x3;
                oAttrPyramid.y1 = oAttrPyramid.y4;
                oAttrPyramid.y2 = oAttrPyramid.y3;
                //draw labels
                this.label[i].text(oAttrLabel.text).attr({ 'x': oAttrLabel.x, 'y': oAttrLabel.y, 'font-size': "2vw" });
            this.label[i].append("svg:title").text(Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[0]].values[i] + ": " + Object.getPrototypeOf(this.dataView.categorical).categories[this.assignData[1]].values[i]);
                var lineParameters = "M" + availWidth / 2 + "," + oAttrLabel.y + "," + oAttrLabel.x + "," + (oAttrLabel.y - 4) + "Z";
                this.lines[i].attr({ 'd': lineParameters })
                    .style({ 'fill': this.color[i], 'stroke': this.color[i], 'stroke-width': '1' });

            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            switch (options.objectName) {
                case "sectionColors":
                   for (let pyramidChartPoint of this.pyramidChartPoints) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: pyramidChartPoint.category,
                            properties: {
                                sColors: {
                                    solid: {
                                        color: pyramidChartPoint.color
                                    }
                                }
                            },
                            selector: pyramidChartPoint.selectionId.getSelector()
                        });
                    }
                    break;
            }
            return objectEnumeration;
        }
    }
}