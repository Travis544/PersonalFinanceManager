
import React, { useEffect, useState, useCallback } from 'react';
import { Chart } from "react-google-charts";
import { getCellValue } from "../utils/dataTableUtils";
import { color } from '@mui/system';

export function BarChart({google, data}) {
    const chartOptions = {
        title: "Monthly Spending",
        legend: { position: "none" },
        width: 600,
        height: 400,

    }
    const [chart, setChart] = useState(null);
  
    useEffect(() => {

        const colorBars = ()=>{
            // let styleColumn = {type: 'string', role: 'style'}
            // data.addColumn(styleColumn )
            // for(let i = 0; i<data.getNumberOfRows(); i++){
            //     // const categoryCellValue = getCellValue(data, i, "Category")
            //     let columnIndex = data.getColumnIndex(styleColumn)
            //     data.setValue(i, data.getNumberOfColumns()-1,'color: red')
            // }

            // console.log(data.toJSON())
        }

      
        if(google){
            colorBars()
            // Instantiate and draw our chart, passing in some options.
            const newChart = new google.visualization.ColumnChart(document.getElementById('barChart'));
          
            newChart.draw(data, chartOptions);
            setChart(newChart);
        }
    }, [google, data]);

    return (
        <div id="barChart" />
    )
    // return (
    //     <div>
    //         <Chart
    //             chartType={"Bar"}
    //             data={prop.data}
    //             options={chartOptions}
    //             width={"100%"}
    //             height={"400px"}
    //         />
    //     </div>
    // )
}