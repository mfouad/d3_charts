// divs
var svg = d3.select("#main");

// load data
var data = pics.data.children;


// draw table
var calendar = d3.chart.calendar();
calendar.data(data);
calendar(svg);
