import React, { useEffect, useState, useCallback } from 'react';
import {PieChart} from './charts/PieChart'
import {BarChart} from "./charts/BarChart"
import HorizontalChart from './charts/HorizontalChart';
export default function Dashboard({google, yearAndMonthTransactions}) {
  
    
    const [categorizeSpendingForYearDataTable, setCategorizeSpendingForYearDataTable] = useState(null)
    const [selectedMonthCategoricalSpendingDataTable, setSelectedMonthCategoricalSpendingDataTable] = useState(null)
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
        console.log("SELECTED")
        
        console.table(categoryToSpendingForAMonth)
        for(let category of Object.keys(categoryToSpendingForAMonth)) {
            let spending = categoryToSpendingForAMonth[category]
            
            dataTable.addRow([category, spending])
        }

        return dataTable
    }, [google])

    
    const viewChartsForGivenYearAndMonth=useCallback((year, month, yearAndMonthTransactions)=>{
       
        let allMonthlyTransactionForAYear = yearAndMonthTransactions[year]
        const categoryToSpendingForEachMonth = {}
        let allCategories = []

        let selectedMonthCategoricalSpending = {}
        for (let monthKey in allMonthlyTransactionForAYear) { 
            let monthlyTransactions = allMonthlyTransactionForAYear[monthKey]
            const categoryToSpending = calculateCategoricalSpendingForMonth(monthlyTransactions)
            let categories = Object.keys(categoryToSpending)
            allCategories = allCategories.concat(categories)
            categoryToSpendingForEachMonth[monthKey] = categoryToSpending   
            if (month === monthKey) {
                selectedMonthCategoricalSpending = categoryToSpending
            }
        }

        allCategories = new Set(allCategories)
        let dataTable = parseCategoricalSpendingForEachMonthIntoDataTable(allCategories, categoryToSpendingForEachMonth)

      
        let monthlyCategorizedSpendingDataTable = parseCategoricalSpendingForOneMonthIntoDataTable(selectedMonthCategoricalSpending)
        setCategorizeSpendingForYearDataTable(dataTable)
        setSelectedMonthCategoricalSpendingDataTable(monthlyCategorizedSpendingDataTable)

    }, [parseCategoricalSpendingForEachMonthIntoDataTable, parseCategoricalSpendingForOneMonthIntoDataTable])
    

    useEffect(()=>{
        if (Object.keys(yearAndMonthTransactions).length > 0) {
            let latestYear = Object.keys(yearAndMonthTransactions)[0]
            let monthlyTransactions = yearAndMonthTransactions[latestYear]
            let months = Object.keys(monthlyTransactions)
            let latestMonth = months[months.length-1]
            viewChartsForGivenYearAndMonth(latestYear, latestMonth, yearAndMonthTransactions)
        }
      
    },[viewChartsForGivenYearAndMonth, yearAndMonthTransactions])


    return  (
        <div>
            {categorizeSpendingForYearDataTable&&
            <div>
                <PieChart data={selectedMonthCategoricalSpendingDataTable} google={google}/>
                <HorizontalChart data={categorizeSpendingForYearDataTable} google={google}/>
                <BarChart data={selectedMonthCategoricalSpendingDataTable} google={google}/>
               
            </div>
            
            }
        </div>
    );

}