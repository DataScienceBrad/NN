
function createSparkLine(svg, div, data, tooltip, visualWidth,
    sparkColor, strokewidth, toolColor, fontColor) {

    var width = visualWidth * 0.6;
    var height = 50;
    var min = Math.min(...data);
    var max = Math.max(...data);
    var x = d3.scale.linear().domain([0, data.length]).range([2, width - 2]);
    var y = d3.scale.linear().domain([min, max]).range([height - 4, 2]);


    var line = d3.svg.line()
        .x(function (d, i) { return x(i); })
        .y(function (d) { return y(d); })

    var area = d3.svg.area()
        .x(function (d, i) { return x(i); })
        .y0(height)
        .y1(function (d) { return y(d); });

    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", sparkColor)
        .attr("opacity", "0.3");

    svg
        .attr("width", width).attr("height", height)
        .append("path").attr("d", line(data))
        .style("fill", "none")
        .attr("stroke-width", strokewidth)
        .attr("stroke", sparkColor);
    
    var scrollX = Window.scrollX;
    var scrollY = Window.scrollY;
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "tool")
        .attr("r", 2)
        .attr("cx", function (d, i) { return x(i); })
        .attr("cy", function (d) { return y(d); })
        .style("fill", sparkColor)
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", toolColor);
            div.html(tooltip[i]['catColumn'] + ': ' + tooltip[i]['category'] + "<br/>" + tooltip[i]['valueColumn'] + ': ' + tooltip[i]['value'])
                .style("left", (d3.event.pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", (d3.event.pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", fontColor);
            d3.select(this).attr("r", 4)
                .style("opacity", .5);
        })
        .on("mousemove", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", toolColor);
            div.html(tooltip[i]['catColumn'] + ': ' + tooltip[i]['category'] + "<br/>" + tooltip[i]['valueColumn'] + ': ' + tooltip[i]['value'])
                .style("left", (d3.event.pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", (d3.event.pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", fontColor);
            d3.select(this).attr("r", 4)
                .style("opacity", .5);
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).attr("r", 2)
                .style("opacity", .9);
        });

}

