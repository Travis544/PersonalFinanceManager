import { useContext, useState, useEffect } from "react"
import {API_URL} from "./Constants"
import {UserContext} from "./Context"
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


export function ItemList({items, accountSelectedCallback}) {
    const user = useContext(UserContext)

    const [selectedItem, setSelectedItem] = useState("")

    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState([])

    const getAccountsForItem = async (itemId)=>{

        
        const response = await fetch(`${API_URL}/api/accounts/${itemId}`, {
            method: 'GET',
            headers: {
                  "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        console.log("GOT ACCOUNT DATA")
        console.log(data)
        setAccounts(data.accounts)
    }

   
    const handleItemChange = (event)=>{
        setSelectedItem(event.target.value);
        getAccountsForItem(event.target.value);
    }

    const handleAccountChange=(event) =>{
        setSelectedAccount(event.target.value)
        accountSelectedCallback(event.target.value)
    }

    return  (
        <div>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selectedItem}
                label="Bank"
                onChange={handleItemChange}
            >
                {items.length > 0 
                && items.map((item) => 
                <MenuItem value={item.itemId} key={item.institutionId}>{item.institutionName}</MenuItem>)}
            </Select>
            
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selectedAccount}
                label="Account"
                onChange={handleAccountChange}
            >
                {items.length > 0 
                && accounts.map((account) => 
                <MenuItem value={account.accountId} key={account.accountId}>{account.name}</MenuItem>)}
            </Select>
        </div>
    )
}