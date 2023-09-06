
import './App.css';
import React, { useEffect, useState, useCallback } from 'react';
import { UserContext } from './Context';
// import {PlaidLink} from "react-plaid-link";
import { usePlaidLink } from 'react-plaid-link';

import {ItemList} from './ItemList'
import {API_URL} from "./Constants"
import Dashboard from './Dashboard';
import useGoogleCharts from './charts/useGoogleCharts';

function App() {
  const [user, setUser] = useState("travis")
  const [linkToken, setLinkToken] = useState(null);
  const [transactions, setTransactions] = useState({})
  const [items, setItems] = useState([])
  const [isReady, setIsReady] = useState(false)

  const google = useGoogleCharts();

  const exchangePublicTokenForAccessToken= async (publicToken, metadata) =>{

    let requestData = {
      "public_token": publicToken,
      "institution_id":metadata.institution.institution_id,
      "institution_name": metadata.institution.name,
      "accounts": metadata.accounts
    }

    const response = await fetch(`${API_URL}/api/exchange_public_token`, {
      method: 'POST',
      headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(requestData)

    });
    const data = await response.json();
    // console.log(data)
  }

  const generateToken = useCallback(async () => {
    console.log("GENERATE TOK EN")
    const response = await fetch(`${API_URL}/api/create_link_token`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log("GOT LINK TOKEN")
    setLinkToken(data.link_token);
    
  }, []);

  const getItemsForUser = useCallback(async ()=>{
    const response = await fetch(`${API_URL}/api/items/${user}`, {
        method: 'GET',
        headers: {
              "Content-Type": "application/json",
        },
    });

    const data = await response.json();
      setItems(data.items)
    }, [user])


  useEffect(() => {
    generateToken();
    getItemsForUser()
  }, [generateToken, getItemsForUser]);



  const { open, ready } = usePlaidLink({
    token: linkToken, 
    onSuccess: async (public_token, metadata) => {
      // send public_token to server
      console.log(metadata)
      await exchangePublicTokenForAccessToken(public_token, metadata)
      await getItemsForUser()
    },
  });

  const simulateTransactionWebhook= async ()=>{
    const response = await fetch(`${API_URL}/api/simulate_transaction_webhook`, {
      method: 'POST',
      headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      //body: JSON.stringify(requestData)
    
    });

    const data = await response.json();
    console.log(data)
  }

  const getTransactions= async (accountId)=>{
    const params = {
      yearsToSelect: "2"
    };

    const paramString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/get_last_x_years_transactions_for_account/${accountId}?${paramString}`, {
      method: 'GET',
      headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
      },    
    });
    const data = await response.json();
    console.log("DATA RECEIVED")
    console.log(data)
    setTransactions(data.data)
    // console.log(Object.keys(transactions))
    
    
  }

 

  return  (
    <div>
      <button onClick={() => open()} >
      Connect a bank account
    </button>
    <div>
    <button onClick={() => simulateTransactionWebhook()} >
      Simulate Transaction Webhook
    </button>
    </div>

    <div>
      <button onClick={() => getTransactions()} >
        Test API call
      </button>
    </div>

    <div id="BankAndAccountWrapper">
      <UserContext.Provider value={user} >
        {/* <div>
          <PieChart data={categorizeCount}/>
        </div> */}
        <ItemList items={items} accountSelectedCallback={getTransactions}/>
      </UserContext.Provider>
    </div>
    
    <Dashboard google={google} yearAndMonthTransactions={transactions}/>

  </div>)
};


export default App;
