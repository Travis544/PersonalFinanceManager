import React, { useEffect, useState, useCallback } from 'react';

export default function HorizontalChart({google, data}) {

    const [chart, setChart] = useState(null);


    useEffect(() => { 
        // console.log("RECIEVED DATA")
        // console.log(data)
        // console.log(google)

        const chartOptions = {
            title: "Spending Acrosss Months",
            width: 600,
            height: 400,
            legend: { position: 'top', maxLines: 3 },
            bar: { groupWidth: '75%' },
            isStacked: true
        }

        if(google){
            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.BarChart(document.getElementById("barChart"));
           
            chart.draw(data, chartOptions);
            setChart(chart);
        }

    }, [google, data]);

    return (
        <div id="barChart" />
    )

}