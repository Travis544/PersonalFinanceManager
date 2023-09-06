export function getCellValue(dataTable, rowIndex, columnName) {
    // Find the column index based on the column name
    const columnIndex = dataTable.getColumnIndex(columnName);
    
    // Check if the column exists
    if (columnIndex !== -1) {
      // Retrieve the value
      const value = dataTable.getValue(rowIndex, columnIndex);
      return value;

    } else {
      // Column with the specified name not found
      return null;
    }
}



export function spliceDataTableRow(google, dataTable, rowIndex) {

}