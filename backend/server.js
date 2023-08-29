
require('dotenv').config();
const express = require("express");
const plaid = require("./plaid");
const PORT = process.env.PORT || 3001;
const app = express();

var cors = require("cors");
app.use(cors());
app.use(express.json())

var session = require('express-session')

var corsOptions = {
    origin: ['http://localhost:3000/'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.listen(PORT,  () => {
  console.log(`Server listening on ${PORT}`);
});

const client = plaid.createPlaidClient()

app.post('/api/create_link_token',cors(corsOptions),  async function (request, response) {
    // Get the client_user_id by searching for the current user
    //const user = await User.find(...);
    const requestC = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: "THIS IS A TEST"
      },
      client_name: 'Plaid Test App',
      products: ['auth'],
      language: 'en',
      webhook: 'https://webhook.example.com',
      redirect_uri: 'http://localhost:3000/',
      country_codes: ['US'],
    };
    try {
    //   const createTokenResponse = await client.linkTokenCreate(requestC);
    //   response.json(createTokenResponse.data);
        const createResponse = await client.linkTokenCreate(requestC);
        console.log("REQUEST RETURNED")
        console.log(createResponse.data)
        response.json(createResponse.data);
    } catch (error) {
      // handle error
      console.log('error while fetching client token', error);
      response.json(error.data)
    }
  });
  
  app.post('/api/exchange_public_token',cors(corsOptions), async function (
    request,
    response,
    next,
  ) {


    const publicToken = request.body.public_token;
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });
      // These values should be saved to a persistent database and
      // associated with the currently signed-in user
      const accessToken = response.data.access_token;
      const itemID = response.data.item_id;
      
      console.log("GOT ACCESS TOKEN")
      console.log(accessToken)
      console.log(itemID)
      req.session.accessToken = accessToken
      res.json({ public_token_exchange: 'complete' });
    } catch (error) {
      // handle error
    }
  });