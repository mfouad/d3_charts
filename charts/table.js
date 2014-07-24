if (!d3.chart) d3.chart = {};

d3.chart.table = function () {

    var data;
    
    function chart(container) {
        var table = container.append("table");

        var rows = table.selectAll("tr.row").data(data);

        var rowsEnter = rows.enter().append("tr").classed("rows", true);

        rowsEnter.append("td").text(function (d) {
            return d.data.score
        });
        rowsEnter.append("td").append("img").attr({
            src: function (d) {
                return d.data.thumbnail
            }
        });

        rowsEnter.append("td").append("a").attr({
            href: function (d) {
                return d.data.url
            }
        }).text(function (d) {
            return d.data.title
        })

        rowsEnter.append("td").text(function (d) {
            return d.data.ups
        })
        rowsEnter.append("td").text(function (d) {
            return d.data.downs
        })
    }

    chart.data = function(val)
    {
        if (!arguments.length) return data;
        data = val;
        return chart;
    }


    return chart;
};