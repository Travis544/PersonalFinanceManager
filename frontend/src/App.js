
import './App.css';
import React, { useEffect, useState } from 'react';
// import {PlaidLink} from "react-plaid-link";
import { usePlaidLink } from 'react-plaid-link';

function App() {
  const API_URL = "http://127.0.0.1:3001"
  const [linkToken, setLinkToken] = useState(null);
 
  const generateToken = async () => {
    console.log("GENERATE TOKEN")
    const response = await fetch(`${API_URL}/api/create_link_token`, {
      method: 'POST',
     
    });
    const data = await response.json();

    setLinkToken(data.link_token);
    
  };

  const exchangePublicTokenForAccessToken= async (publicToken, metadata) =>{

    let requestData = {
      "public_token": publicToken,
      "institution_id":metadata.institution.institution_id,
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
    console.log(data)
  }

  useEffect(() => {
    
    generateToken();
  }, []);


  useEffect(()=>{
    console.log(linkToken)
  }, [linkToken])


  const { open, ready } = usePlaidLink({
    token: linkToken, 
    onSuccess: (public_token, metadata) => {
      // send public_token to server
      console.log(metadata)
      exchangePublicTokenForAccessToken(public_token, metadata)

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
  </div>)
};


export default App;
