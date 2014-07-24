if (!d3.chart) d3.chart = {};

d3.chart.calendar = function () {

    var data;

    function getToday()
    {
        var milliscondsInDay = 24 * 60 * 60 * 1000;
        var today = new Date();
        
        today.setHours(0, 0 ,0 ,0);
        console.log(today);
        var tomorrow = new Date(today.getTime() + milliscondsInDay );

        
        return [today, tomorrow];
    };
    
       
    function chart(container) {
        var margin = {
                top: 200,
                right: 40,
                bottom: 200,
                left: 40
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain(getToday())
            .range([0, width]);

        var brush = d3.svg.brush()
            .x(x)
            .extent([new Date(2013, 2, 2, 1), new Date(2013, 2, 2, 3)])
            .on("brush", brushed);

        var svg = container
         .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "grid-background")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.minutes, 30)
                .tickSize(-height)
                .tickFormat(""))
            .selectAll(".tick")
            .classed("minor", function (d) {
                return d.getHours();
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.hours)
                .tickPadding(0))
            .selectAll("text")
            .attr("x", 6)
            .style("text-anchor", null);

        var gBrush = svg.append("g")
            .attr("class", "brush")
            .call(brush);

        gBrush.selectAll("rect")
            .attr("height", height);

        function brushed() {
            var extent0 = brush.extent(),
                extent1;

            // if dragging, preserve the width of the extent
            if (d3.event.mode === "move") {
                var d0 = d3.time.hour.round(extent0[0]),
                    d1 = d3.time.hour.offset(d0, Math.round((extent0[1] - extent0[0]) / (60*60*100)));
                extent1 = [d0, d1];
            }

            // otherwise, if resizing, round both dates
            else {
                extent1 = extent0.map(d3.time.day.round);

                // if empty when rounded, use floor & ceil instead
                if (extent1[0] >= extent1[1]) {
                    extent1[0] = d3.time.hour.floor(extent0[0]);
                    extent1[1] = d3.time.hour.ceil(extent0[1]);
                }
            }

            d3.select(this).call(brush.extent(extent1));
        }
    }

    chart.data = function (val) {
        if (!arguments.length) return data;
        data = val;
        return chart;
    }


    return chart;
};