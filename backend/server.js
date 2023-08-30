
require('dotenv').config();
const express = require("express");
const plaid = require("./plaid");
const {
  Item,
  User,
  MongoDbItemService
} = require('./db/database');

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


//SET UP PLAID AND DB SERVICE
plaid.createPlaidClient()
itemService = new MongoDbItemService()


app.listen(PORT,  () => {
  console.log(`Server listening on ${PORT}`);
});



app.get("/", function(request, response) {
  response.json({"MESSAGE":"HI"})
})

app.post('/api/fuckYou', async function (
){
  const user = new User({ username:"Travis", items:[]})
  const item = new Item({itemId: "SOME STUFF", accessToken: "ACCESS", institutionId: "SOME INSTITUTION"})
  const saveRes = await itemService.saveItem(user,item)
})

app.post('/api/create_link_token',cors(corsOptions),  async function (request, response) {
    // Get the client_user_id by searching for the current user
    //const user = await User.find(...);
    const requestC = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: "THIS IS A TEST"
      },
      client_name: 'Plaid Test App',
      products: ['auth', 'transactions'],
      language: 'en',
      webhook: 'https://webhook.example.com',
      redirect_uri: 'http://localhost:3000/',
      country_codes: ['US'],
    };
    try {
    //   const createTokenResponse = await client.linkTokenCreate(requestC);
    //   response.json(createTokenResponse.data);
        const createResponse = await plaid.createLinkToken(requestC)
        console.log("REQUEST RETURNED")
        console.log(createResponse.data)
        response.json(createResponse.data);
    } catch (error) {
      // handle error
      console.log('error while fetching client token', error);
      response.json(error.data)
    }
  });
  
  main().catch(err => console.log(err));

  async function main() {
    itemService.initialize()
  }

  async function isAlreadyLinkedToBank(user, institutionId){
    const item = await itemService.getItemByInstitutionId(user, institutionId)
    console.log("ITEM FOUND", item)
    if (item != null){
      return true
    }else{
      return false
    }
  }
  
  app.post('/api/exchange_public_token',cors(corsOptions), async function (
    request,
    response,
    next,
  ) {
    const publicToken = request.body.public_token;
    const institutionId = request.body.institution_id;
    const accounts = request.body.accounts
    const username = "travis"
  
    //use fake user for now
    const user = await itemService.getUser(username)
    if (await isAlreadyLinkedToBank(user, institutionId)){
        response.status(409).json({error: "Already linked to this bank"});
        console.log("ALREADY LINKED TO THIS BANK ")
        return
    } else {
      try {
        const plaidResponse = await plaid.exchangePublicTokenForAccessToken(
          publicToken,
        );
        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = plaidResponse.data.access_token;
        const itemID = plaidResponse.data.item_id;
        
        console.log("GOT ACCESS TOKEN")
        console.log(accessToken)
        console.log(itemID)
       
        const item = new Item({itemId: itemID, accessToken: accessToken, institutionId: institutionId, lastCursor:null})
        const saveRes = await itemService.saveItem(user,item)
        
        console.log("ITEM ID!!"+itemID)
        //this is a new user, so retrieve transactions and save to db.
        await plaid.getTransactions(itemId, accessToken, null)
  
        console.log("SAVE RSULT")
        console.log(saveRes)
        response.json({ public_token_exchange: 'complete' });
      } catch (error) {
        // handle error
        console.log(error)
      }
    }
  });