// a vertical calendar control inspired by Google Calendar and D3 Brush Snapping block 
// http://bl.ocks.org/mbostock/6232620

if (!d3.chart) d3.chart = {};

d3.chart.vcalendar = function () {

    var data;
    var margin;
    var width;
    var height;

    function getToday() {
        var today = d3.time.day(new Date());
        var tomorrow = d3.time.day.offset(today, 1);

        return [today, tomorrow]; 
    };


    function chart(container) {
        var timeScale = d3.time.scale()
            .domain(getToday())
            .range([0, height]);

        var brush = d3.svg.brush()
            .y(timeScale)
            .on("brush", brushed);

        container
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var cal = container.append("rect")
            .attr("class", "grid-background")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        

        // Draw grid
        container.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.svg.axis()
                .scale(timeScale)
                .orient("left")
                .ticks(d3.time.minutes, 30)
                .tickSize(-width)
                .tickFormat(""))
            .selectAll(".tick")
            .classed("minor", function (d) {
                return d.getHours();
            });

        // draw ticks
        container.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.svg.axis()
                .scale(timeScale)
                .orient("left")
                .ticks(d3.time.hours)
                .tickPadding(0))
            .selectAll("text")
            .attr("x", -40)
            .style("text-anchor", null);

        var gBrush = container.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "brush")

        brush(gBrush);
        
        gBrush.selectAll("rect")
            .attr("width", width);

        

        function brushed() {
            var extent0 = brush.extent();
            var current_timespan = extent0[1] - extent0[0];
            var current_timespan_in_seconds = Math.round(current_timespan / 1000);
            var extent1;
        
            // if dragging, preserve the width of the extent
            // and snap to the nearest Hour.
            // todo: snap to nearest half an hour
            if (d3.event.mode === "move") {
                var d0 = d3.time.hour.round(extent0[0]);
                var d1 = d3.time.second.offset(d0, current_timespan_in_seconds);
                
                extent1 = [d0, d1];
            }

            // otherwise, if resizing, round both dates to nearest hour
            else {
                
                extent1 = extent0.map(d3.time.hour.round);

                // if empty when rounded, use floor & ceil instead
                if (extent1[0] >= extent1[1]) {
                    extent1[0] = d3.time.hour.floor(extent0[0]);
                    extent1[1] = d3.time.hour.ceil(extent0[1]);
                }
            }
            
            // apply the new extent, then redraw
            brush.extent(extent1);
            brush(gBrush);
        }
    }

    chart.width = function (val) {
        if (!arguments.length) return width;
        width = val;
        return chart;
    }

    chart.height = function (val) {
        if (!arguments.length) return height;
        height = val;
        return chart;
    }
    
    chart.margin = function (val) {
        if (!arguments.length) return margin;
        margin = val;
        return chart;
    }

     
    chart.data = function (val) {
        if (!arguments.length) return data;
        data = val;
        return chart;
    }


    return chart;
};