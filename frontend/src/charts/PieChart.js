import { Chart } from "react-google-charts";
import React, { useEffect, useState, useCallback } from 'react';
export function PieChart({google, data}) {
    const [chart, setChart] = useState(null);
    useEffect(() => {
        const chartOptions = {
            title: "Monthly Spending Distribution",
            width: 400,
            height: 400,
            legend: null
        }

        if(google){
            // Instantiate and draw our chart, passing in some options.
            const newChart = new google.visualization.PieChart(document.getElementById('pizzaChart'));
            
            newChart.draw(data, chartOptions);
            setChart(newChart);
        }
      
    }, [google, data]);

    return (
        <div id="pizzaChart" />
    )


    // return  (
    //     <div>
    //         <Chart
    //             chartType={"PieChart"}
    //             data={prop.data}
    //             options={chartOptions}
    //             width={"100%"}
    //             height={"400px"}
    //         />
    //     </div>
    // )
}


