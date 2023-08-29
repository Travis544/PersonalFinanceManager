
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
    console.log(data)
    setLinkToken(data.link_token);
    
  };

  const exchangePublicTokenForAccessToken= async (publicToken) =>{

    let requestData = {
      "public_token": publicToken
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

  const handleOnSuccess= (public_token, metadata) =>{
    // send token to client server
    // axios.post("/auth/public_token", {
    //   public_token: public_token
    // });
  }

  const handleOnExit=() =>{
    // handle the case when your user exits Link
    // For the sake of this tutorial, we're not going to be doing anything here.
  }

  const { open, ready } = usePlaidLink({
    token: linkToken, 
    onSuccess: (public_token, metadata) => {
      // send public_token to server
      exchangePublicTokenForAccessToken(public_token)

    },
  });


  return  (
    <div>
      <button onClick={() => open()} >
      Connect a bank account
    </button>
  </div>)
};


export default App;
