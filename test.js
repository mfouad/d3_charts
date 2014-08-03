// divs
var svg = d3.select("#main");

// load data
var data = events;

function fixTime(arr)
{
    arr.forEach(function (d) {
        if (d.start > 22)
            return;
        
        var date = d3.time.hour.round(new Date());

        d.start = date.setHours(d.start);
        d.end = date.setHours(d.end);
    });
}

// draw table
var calendar = d3.chart.vcalendar();

calendar.width(500)
    .height(1000)
    .margin(60)
    .translate(100, 40);

fixTime(data);
calendar.data(data);
calendar(svg);

data.push({"name":"xxx", "start": 15, "end": 16});

fixTime(data);
//calendar.data(data);
calendar(svg);
