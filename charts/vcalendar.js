// a vertical calendar control inspired by Google Calendar and D3 Brush Snapping block 
// http://bl.ocks.org/mbostock/6232620

/*global d3 */
/*global clearInterval */
/*global setInterval */

if (!d3.chart) { d3.chart = {}; }

d3.chart.vcalendar = function () {
    "use strict";
    var events, width, height, timeScale, gEvents, timer, gTimer, timeFormater,
        inner_width, xpos , ypos, margin, gFrame, 
        dayStart = 0,
        dayEnd = 0;
    
    function getToday() {
        var today = d3.time.day(new Date()),
            tomorrow = d3.time.day.offset(today, 1);
        
        today = d3.time.hour.offset(today, dayStart);
        if (dayEnd > 0) {
            tomorrow = d3.time.hour.offset(today, dayEnd);
        }
        return [today, tomorrow];
    }
    
    timeFormater = d3.time.format.multi([
          ["%_I:%M", function(d) { return d.getMinutes(); }],
          ["%_I %p", function(d) { return d.getHours(); }],
          ["%b %d", function(d) { return d.getDate(); }]
        ]);


    function chart(container) {
       
        container.selectAll("*").remove();
        
        inner_width = width - margin;
        
        timeScale = d3.time.scale()
            .domain(getToday())
            .range([0, height]);

        gFrame = container.append("g")
            .attr("width", width )
            .attr("height", height )
            .attr("transform", "translate(" + xpos + "," + ypos + ")");
        
        
        
                // draw hour ticks
        gFrame.append("g")
            .attr("class", "x axis")
            .call(d3.svg.axis()
                .scale(timeScale)
                .orient("left")
                .ticks(d3.time.hours)
                .tickSize(-width, 0)
                .tickPadding(0)
                .tickFormat(timeFormater))
            .selectAll("text")
            .attr("x", margin - 5)
            .attr("y", 10)
            .style("text-anchor", "end");

        
        var gCal = gFrame.append("g")
            .attr("width", inner_width)
            .attr("height", height)
            .attr("transform", "translate(" + margin + "," + 0 + ")");
        
        gCal.append("rect")
            .attr("class", "grid-background")
            .attr("width", inner_width)
            .attr("height", height);
        
        // Draw half hour ticks
        gCal.append("g")
            .attr("class", "x grid")
            .call(d3.svg.axis()
                .scale(timeScale)
                .orient("left")
                .ticks(d3.time.minutes, 30)
                .tickSize(-inner_width)
                .tickFormat(""))
            .selectAll(".tick")
            .classed("minor", function (d) { return d.getMinutes();})
            .classed("major", function (d) { return d.getMinutes() === 0;});

        
        gEvents = gCal.append("g");
        
        // draw the Timer progress line
        gTimer = gCal.append("g")
            .attr("class", "timer");
        
        chart.moveTimer();
            
        gTimer.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", inner_width)
            .attr("y2", 0)
            .classed("timeline", true);
        gTimer.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 2)
            .classed("timeblob", true);


        // Creates a brush for each event
        events.forEach(chart.addEvent);
        
        chart.start();

    }
    
    chart.start = function () {
        timer = setInterval(chart.moveTimer, 60 * 1000);
    };
            
    chart.stop = function () {
        clearInterval(timer);
    };

    chart.moveTimer = function () {
        var yTimer = timeScale(Date.now());
        gTimer.attr("transform", "translate(" + 0 + "," + yTimer + ")");
    };
    
    // a function factory, associates a brush with an event
    chart.addEvent = function (event) {
        var extent,
            brush,
            gBrush;
        
        extent = [event.start, event.end];
        brush = d3.svg.brush()
            .y(timeScale)
            .extent(extent)
            .on("brush", brushed);

        gBrush = gEvents.append("g")
            .attr("class", "brush");


        // Draw the brush
        brush(gBrush);

        // text position will be set by the brush event
        brush.text = gBrush.append("text").text(event.name)
            .attr("x", 30)
            .attr("y", timeScale(d3.sum(extent) / 2));


        gBrush.classed("future", (event.end >= Date.now()))
            .classed("past", event.end < Date.now());

        
        gBrush.selectAll("rect")
            .attr("width", inner_width);
        

        brush.checkbox = gBrush.append("foreignObject")
            .attr('x', 10)
            .attr('y', timeScale(d3.sum(extent) / 2) - 10)
            .attr('width', "20")
            .attr('height', "20");

        brush.checkbox //.append("xhtml:body")
            .html("<form><input class=task type=checkbox id=check></input></form>");


        // Each brush has a large background rect to capture mouse events on the whole domain
        // this background will cover older brushes, and only force the use of the latest created brush
        // disable this behaviour by making the brush background very small
        gBrush.selectAll(".background").attr("height", 0);

        
        // this is a closure callback function, it will have access to all the variables
        // declared in this specific CreateEvent function
        function brushed() {
            var extent0,
                extent1,
                timespan_in_ms,
                timespan_in_seconds,
                d0,
                d1,
                y;
            
            extent0 = brush.extent();
            timespan_in_ms = extent0[1] - extent0[0];
            timespan_in_seconds = Math.round(timespan_in_ms / 1000);
            extent1 = extent0;

            // if dragging, preserve the width of the extent
            // and snap to the nearest Hour.
            // todo: snap to nearest half an hour
            if (d3.event.mode === "move") {
                d0 = d3.time.hour.round(extent0[0]);
                d1 = d3.time.second.offset(d0, timespan_in_seconds);

                extent1 = [d0, d1];
            } else {              // otherwise, if resizing, round both dates to nearest hour
                extent1 = extent0.map(d3.time.hour.round);

                // if empty when rounded, use floor & ceil instead
                if (extent1[0] >= extent1[1]) {
                    extent1[0] = d3.time.hour.floor(extent0[0]);
                    extent1[1] = d3.time.hour.ceil(extent0[1]);
                }
            }


           
            
            // apply the new extent, then redraw the brush
            // then redraw the text in the middle
            brush.extent(extent1);
            
            // set event data
            event.start = extent1[0];
            event.end = extent1[1];
            event.past = true;

            // animate
            y = timeScale(d3.sum(extent1) / 2);
            brush.text.attr("y", y);
            brush.checkbox.attr("y", y - 10);
            brush(gBrush);
            gBrush.selectAll(".background").attr("height", 0);
            gBrush.classed("future", (event.end >= Date.now()))
                .classed("past", event.end < Date.now());
        }
    };

    chart.width = function (val) {
        if (!arguments.length) {
            return width;
        }
        width = val;
        return chart;
    };

    chart.height = function (val) {
        if (!arguments.length) {
            return height;
        }
        height = val;
        return chart;
    };
    
    chart.margin = function (val) {
        if (!arguments.length) {
            return margin;
        }
        margin = val;
        return chart;
    };


    chart.translate = function (x, y) {
        xpos = x;
        ypos = y;
        return chart;
    };

    chart.data = function (val) {
        if (!arguments.length) {
            return events;
        }
        events = val;
        return chart;
    };
    
    chart.dayEnd = function (val) {
        if (!arguments.length) {
            return dayEnd;
        }
        dayEnd = val;
        return chart;
    };
    
    chart.dayStart = function (val) {
        if (!arguments.length) {
            return dayStart;
        }
        dayStart = val;
        return chart;
    };
    
    


    return chart;
};