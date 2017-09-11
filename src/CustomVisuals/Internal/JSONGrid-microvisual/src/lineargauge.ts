function createLinearGauge(svg, div, min, data, visualWidth, visualHeight) {
    
    var width = visualWidth - 60;
    var modHeight = visualHeight;
    var maxValue = Math.max(Math.abs(data.target), Math.abs(data.value), Math.abs(data.comparison), Math.abs(data.max));
    if (data.states.length === 0)
        data.states = [Math.ceil(maxValue) / 3, (Math.ceil(maxValue) / 3) * 2, Math.ceil(maxValue)];
    var sortedRanges = data.states.slice().sort(d3.descending);

    svg.attr('height',40);
    svg.attr('padding',10);
    var tooltipText = "Actual Value: "+ data.actual + "<br/> Target Value: " + data.target;
    var scale = d3.scale.linear()
        .domain([0, Math.max(sortedRanges[0], data.target, data.value)])
        .range([0, width]);

    var range = svg.selectAll('rect.range')
        .data(sortedRanges);
    range.enter()
        .append('rect')
        .attr('class', function (d, i) {
            return 'range s' + i;
        });
    range
        .attr('x', 0)
        .attr('width', function (d) {
            return (Math.abs(scale(d) - scale(0)));
        })
        .attr('height', modHeight)
        .style('fill', data.colorComparison)
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", 'black');
            div.html(tooltipText)
                .style("left", ((<any>d3.event).pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", ((<any>d3.event).pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", 'white');
        })
        .on("mousemove", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", 'black');
            div.html(tooltipText)
                .style("left", ((<any>d3.event).pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", ((<any>d3.event).pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", 'white');
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    var percent = (((data.actual - data.min) * 100) / (data.max - data.min));
    percent = (isNaN(percent)) ? 0 : percent;
    var actual = (((width * percent) / 100) <= 0) ? 0 : ((width * percent) / 100);
    actual = (isNaN(actual)) ? 0 : actual;
    //Main measure
    var measure = svg
        .append('rect')
        .classed('measure', true)
        .style('fill', data.colorActual);
    if (data.actual < data.max) {
        measure
            .attr('width', actual)
            .attr('height', modHeight)
            .attr('x', 0)
            .attr('y', 0);
    } else {
        measure
            .attr('width', width)
            .attr('height', modHeight)
            .attr('x', 0)
            .attr('y', 0);
    }
    if (data.max <= data.min) {
        measure.style('display', 'none');
    }
    measure.on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", 'black');
            div.html(tooltipText)
                .style("left", ((<any>d3.event).pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", ((<any>d3.event).pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", 'white');
        })
        .on("mousemove", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", 'black');
            div.html(tooltipText)
                .style("left", ((<any>d3.event).pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", ((<any>d3.event).pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", 'white');
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Target
    let svgLinear = svg
                .append('g');
    svgLinear.selectAll('line.marker').remove();
    var marker = svgLinear
        .append('line')
        .classed('marker', true)
        .style('stroke', 'black');
    var startingPoint = 0;
    var minvalueWidth = 0,
        tiltend;
    var customMin = (window.getComputedStyle($(min[0][0])[0]).width).slice(0, -2);
    startingPoint = Number(customMin) + 10;
    var globalminLength = startingPoint;
    var customsvgWidth = (window.getComputedStyle($(svg[0][0])[0]).width).slice(0, -2);
    var fullsvgWidth = Number(customsvgWidth) - 20;
    minvalueWidth = (fullsvgWidth * (((data.target - data.min) * 100) / (data.max - data.min))) / 100;
    var globalTargetWidth = minvalueWidth;
    
    var customwifth = (window.getComputedStyle($(svg[0][0])[0]).width).slice(0, -2);
    var wifth = Number(customwifth) - 10;
    var percen = (((data.target - data.min) * 100) / (data.max - data.min));
    percen = (isNaN(percen)) ? 0 : percen;
    var passingValue = (((wifth * percen) / 100) <= 0) ? 0 : ((wifth * percen) / 100);
    var diff = wifth - passingValue + 20;
    var targetVal = data.target;
    
    var targetValueText = data.targetFormat + targetVal
    var targetTextwidth = 9 * targetValueText.length + 10;
    var flag = false;
    if (globalTargetWidth < globalminLength || passingValue < (targetTextwidth + startingPoint)) {
        tiltend = globalminLength + 10;
        flag = true;
    } else {
        tiltend = passingValue;
        flag = false;
    }
    marker
        .attr({
            x1: passingValue,
            y1: 0,
            x2: passingValue,
            y2: modHeight
        });
}