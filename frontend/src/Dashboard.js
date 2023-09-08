
import './App.css';
import React, { useEffect, useState, useCallback } from 'react';
import {PieChart} from './charts/PieChart'
import {BarChart} from "./charts/BarChart"
import HorizontalChart from './charts/HorizontalChart';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TransactionTable from './tables/TransactionTable';

export default function Dashboard({google, yearAndMonthTransactions}) {

    const [categorizeSpendingForYearDataTable, setCategorizeSpendingForYearDataTable] = useState(null)
    const [selectedMonthCategoricalSpendingDataTable, setSelectedMonthCategoricalSpendingDataTable] = useState(null)
    const [selectedYear, setSelectedYear] = useState("") 
    const [selectedMonth, setSelectedMonth] = useState("") 
    
    console.log(yearAndMonthTransactions)

    const calculateCategoricalSpendingForMonth=(monthlyTransactions)=>{
      
        let categoryToSpending = {}
        for(let transaction of monthlyTransactions) {
            let personalFinanceCategory = transaction["personalFinanceCategory"]
            let primaryCategory = personalFinanceCategory["primary"]
            let amount = transaction["amount"]
            if (amount < 0) {
            continue
            }
            if (!(primaryCategory in categoryToSpending)) {
            
                categoryToSpending[primaryCategory] = amount
            } else {
                categoryToSpending[primaryCategory] += amount
            }
        }

        return categoryToSpending
    }


    // const createDataTableForMonthlyCategoricalSpendingOfAYear = useCallback((allCategories, categoryToSpendingForEachMonth) =>{

    //     return parseCategoricalSpendingForEachMonthIntoDataTable(allCategories, categoryToSpendingForEachMonth)
    //     // setCategorizeSpendingForYear)
    // }, [google])


    const parseCategoricalSpendingForEachMonthIntoDataTable=useCallback((allCategories, categoryToSpendingForEachMonth)=>{
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn("string", "month")
        for (let category of allCategories) {
            dataTable.addColumn("number", category)
        }     

        let rowIndex = 0
        for (let month in categoryToSpendingForEachMonth) {
            let monthRow = []
            monthRow.push(month)
            let categoryToSpending = categoryToSpendingForEachMonth[month]
            for (let category of allCategories) {
                //let columnIndex = dataTable.getColumnIndex(category)
                let spending = categoryToSpending[category]

                if (category in categoryToSpending) {
                   // dataTable.setCell(rowIndex, columnIndex, spending )
                   monthRow.push(spending)
                } else {
                  //  dataTable.setCell(rowIndex, columnIndex, 0 )
                  monthRow.push(0)
                }
            }
            dataTable.addRow(monthRow)
            rowIndex = rowIndex + 1
        }
        return dataTable
    }, [google])

    const parseCategoricalSpendingForOneMonthIntoDataTable = useCallback((categoryToSpendingForAMonth) => {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn("string", "Category")
        dataTable.addColumn("number", "Spending")
        // console.log("SELECTED")
        
        // console.table(categoryToSpendingForAMonth)
        for(let category of Object.keys(categoryToSpendingForAMonth)) {
            let spending = categoryToSpendingForAMonth[category]
            
            dataTable.addRow([category, spending])
        }

        return dataTable
    }, [google])

    
    const viewChartsForGivenYearAndMonth=useCallback((year, month, yearAndMonthTransactions)=>{
        // if (selectedYear === year && selectedMonth === month) {
        //     return
        // }

        // console.log("GIVEN MONTH")
        // console.log(month) 
        let allMonthlyTransactionForAYear = yearAndMonthTransactions[year]
        const categoryToSpendingForEachMonth = {}
        let allCategories = []

    
        for (let monthKey in allMonthlyTransactionForAYear) { 
            let monthlyTransactions = allMonthlyTransactionForAYear[monthKey]
            const categoryToSpending = calculateCategoricalSpendingForMonth(monthlyTransactions)
            let categories = Object.keys(categoryToSpending)
            allCategories = allCategories.concat(categories)
            categoryToSpendingForEachMonth[monthKey] = categoryToSpending   
            // if (month === monthKey) {
            //     selectedMonthCategoricalSpending = categoryToSpending
            // }
        }

        allCategories = new Set(allCategories)
        let dataTable = parseCategoricalSpendingForEachMonthIntoDataTable(allCategories, categoryToSpendingForEachMonth)
        setCategorizeSpendingForYearDataTable(dataTable)
        setSelectedYear(year)
        let selectedMonthlyTransactions = yearAndMonthTransactions[year][month]
        let selectedMonthCategoricalSpending = calculateCategoricalSpendingForMonth(selectedMonthlyTransactions)
        let monthlyCategorizedSpendingDataTable = parseCategoricalSpendingForOneMonthIntoDataTable(selectedMonthCategoricalSpending)
        setSelectedMonthCategoricalSpendingDataTable(monthlyCategorizedSpendingDataTable)
        setSelectedMonth(month)
       
    }, [parseCategoricalSpendingForEachMonthIntoDataTable, parseCategoricalSpendingForOneMonthIntoDataTable])
    
    const getLatestMonthForYear=useCallback((year, yearAndMonthTransactions)=>{
        let monthlyTransactions = yearAndMonthTransactions[year]
        let months = Object.keys(monthlyTransactions)
        let latestMonth = months[months.length-1]
        return latestMonth
     }, [])

     const getAvailableYears=()=>{
        return Object.keys(yearAndMonthTransactions)
     }
 

    useEffect(()=>{
        if (Object.keys(yearAndMonthTransactions).length > 0) {
            console.log("TRIGGERED")
            let years =  Object.keys(yearAndMonthTransactions)
            let latestYear = years[years.length-1]
            let latestMonth = getLatestMonthForYear(latestYear, yearAndMonthTransactions)
            viewChartsForGivenYearAndMonth(latestYear, latestMonth, yearAndMonthTransactions)
            
        }
    },[getLatestMonthForYear, viewChartsForGivenYearAndMonth, yearAndMonthTransactions])

    return  (
        <div>
            <div>
                <p>Select Year: </p>
                <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedYear}
                    label="Bank"
                    onChange={(event)=>{viewChartsForGivenYearAndMonth(event.target.value, getLatestMonthForYear(event.target.value, yearAndMonthTransactions), yearAndMonthTransactions)}}
                >
                    {getAvailableYears().length > 0 
                    && getAvailableYears().map((year) => 
                    <MenuItem value={year} key={year}>{year}</MenuItem>)}
                </Select>
            </div>

            {categorizeSpendingForYearDataTable&&
            <div >
                <div id="chartContainer">
                    <PieChart data={selectedMonthCategoricalSpendingDataTable} google={google}/>
                    <BarChart data={selectedMonthCategoricalSpendingDataTable} google={google}/>
                    <HorizontalChart data={categorizeSpendingForYearDataTable} google={google}/>
                </div>
               
                <div>
                    <TransactionTable monthlyTransactions={yearAndMonthTransactions[selectedYear][selectedMonth]}/>
                </div>
            </div>
            
            }
        </div>
    );

}