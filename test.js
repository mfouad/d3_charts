// divs
var svg = d3.select("#main");

// load data
var data = events;

data.forEach(function (d) {
    var date = new Date();
    
    d.start = date.setHours(d.start);
    d.end = date.setHours(d.end);
});

// draw table
var calendar = d3.chart.vcalendar();

calendar.width(534)
    .height(900)
    .margin(70)
    .translate(100, 40);
    
calendar.data(data);
calendar(svg);