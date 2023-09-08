
import { DataGrid } from '@mui/x-data-grid';
export default function TransactionTable({monthlyTransactions}) {
    const columns = [
        { field: 'transactionId', headerName: 'Transaction ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'merchant', headerName: 'Merchant', width: 130 },
        {
            field: 'category',
            headerName: 'Category',
            width: 150,
            valueGetter: (params) =>
            `${params.row.personalFinanceCategory["primary"] || ''}`
        },

        {
          field: 'amount',
          headerName: 'Amount',
          type: 'number',
          width: 120,
        },

        {
            field: 'date',
            headerName: 'Date',
            width: 180,
        }
    ]
    return (
        <div>
            {monthlyTransactions&&
            <DataGrid
                getRowId={(row) => row.transactionId}
                rows={monthlyTransactions}
                columns={columns}
                initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />}
        </div>
      
    )
}
