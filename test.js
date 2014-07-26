// divs
var svg = d3.select("#main");

// load data
var data = events;

console.log(data);

data.forEach(function(d){
    date = new Date();
    d.start = date.setHours(d.start);
    d.end = date.setHours(d.end);
});
console.log(data);

var margin = {
    left: 100,
    top: 40,
    right: 200,
    bottom: 40
};

var width = 500;
var height = 900;


// draw table
var calendar = d3.chart.vcalendar();

calendar.width(width)
    .height(height)
    .margin(margin);
    
calendar.data(data);
calendar(svg);