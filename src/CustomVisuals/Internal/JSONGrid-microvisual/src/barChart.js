function createBarChart(svg, div, data, tooltip, visualWidth,
    barColor, strokewidth, toolColor, fontColor) {
    var margin = { top: 5, right: 0, bottom: 5, left: 0 };
    var width = visualWidth * 0.6;
    var height = 50;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function (d) { return d.x; }));
    y.domain([0, d3.max(data, function (d) { return d.y; })]);

    var axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)")

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .style("fill", barColor)
        .attr("x", function (d) { return x(d.x); })
        .attr("width", x.rangeBand() - 5)
        .attr("y", function (d) { return y(d.y); })
        .attr("height", function (d) { return height - y(d.y); })
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9)
                .style("background", toolColor);
            div.html(tooltip[i]['catColumn'] + ': ' + tooltip[i]['category'] + "<br/>" + tooltip[i]['valueColumn'] + ': ' + tooltip[i]['value'])
                .style("left", (d3.event.pageX + document.getElementById("KPIGrid").scrollLeft) + "px")
                .style("top", (d3.event.pageY - 28 + document.getElementById("KPIGrid").scrollTop) + "px")
                .style("color", fontColor);
            d3.select(this)
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
            d3.select(this)
                .style("opacity", .5);
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this)
                .style("opacity", .9);
        });;

}