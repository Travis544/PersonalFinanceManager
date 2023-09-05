import { Chart } from "react-google-charts";

export function PieChart(prop) {
    const chartOptions = {
        title: "Monthly Spending",
    }



    return  (
        <div>
            <Chart
                chartType={"PieChart"}
                data={prop.data}
                options={chartOptions}
                width={"100%"}
                height={"400px"}
            />
        </div>
    )
}


