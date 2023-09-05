
require('dotenv').config();
const express = require("express");
const plaid = require("./plaid");

const {
  Item,
  User,
  MongoDbItemService, 
  MongoDbAccountService,
  MongoDbTransanctionService
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
accountService = new MongoDbAccountService()
transactionService = new MongoDbTransanctionService()

app.listen(PORT,  () => {
  console.log(`Server listening on ${PORT}`);
});



app.get("/", function(request, response) {
  response.json({"MESSAGE":"HI"})
})

// app.post('/api/fuckYou', async function (
// ){
//   const user = new User({ username:"Travis", items:[]})
//   const item = new Item({itemId: "SOME STUFF", accessToken: "ACCESS", institutionId: "SOME INSTITUTION"})
//   const saveRes = await itemService.saveItem(user,item)
// })

app.post('/api/create_link_token',cors(corsOptions),  async function (request, response) {
    // Get the client_user_id by searching for the current user
    //const user = await User.find(...);

    let userId = "64ee7e5d9ae395bfde6e3794"
    const requestC = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: userId
      },
      client_name: 'Personal Finance Manager',
      products: ['transactions'],
      language: 'en',
      webhook: process.env.WEBHOOK_URL,
      redirect_uri: 'https://dc8d-104-33-32-2.ngrok-free.app',
      country_codes: ['US'],
    };
    try {
    //   const createTokenResponse = await client.linkTokenCreate(requestC);
    //   response.json(createTokenResponse.data);
  
        const createResponse = await plaid.createLinkToken(requestC)
        response.json(createResponse.data);
        console.log("CREATING LINK TOKEN SUCCESS")
    } catch (error) {
      // handle error
      console.log('error while fetching client token', error);
      response.json(error.data)
    }
  });
  
  main().catch(err => console.log("RECEIVED ERROR"));

  async function main() {
    itemService.initialize()
  }

  async function isAlreadyLinkedToBank(user, institutionId){
    const item = await itemService.getItemByInstitutionId(user, institutionId)
    if (item != null){
      return true
    }else{
      return false
    }
  }

  
  app.post("/api/simulate_transaction_webhook", async (req, res)=>{
    console.log("SIMULATING WEBHOOK.....")
    try{
      //use travis token
      const user = await itemService.getUser("travis")
      const item = user.items[0]
      const access_token = item.accessToken
      const firewebhookResponse = await plaid.simulateTransactionWebhook(access_token)
    
     
    } catch(error){
      console.log(error)
    }

  })

  app.post('/api/receive_webhook', async (req, res, next)=>{
    console.log("RECEIVED WEBHOOK....")
    console.dir(req.body, {colors:true, depth: null})
    const product = req.body.webhook_code;
    const itemId = req.body.item_id
    switch(product) {
      case 'SYNC_UPDATES_AVAILABLE': {
        // Fired when new transactions data becomes available.
        // const {
        //   addedCount,
        //   modifiedCount,
        //   removedCount,
        // } = await updateTransactions(plaidItemId);
        // const { id: itemId } = await retrieveItemByPlaidItemId(plaidItemId);
        // serverLogAndEmitSocket(`Transactions: ${addedCount} added, ${modifiedCount} modified, ${removedCount} removed`, itemId);
        // break;
        const itemFound = await itemService.getItem(itemId)
        if (itemFound!= null) {
          console.log("ITEM FOUND")
          console.log(itemFound)
          plaid.getTransactions(transactionService, itemId, itemFound.accessToken, itemFound.lastCursor);
        }
      
       // 
        
      }
    }
  })


  app.post('/api/exchange_public_token',cors(corsOptions), async function (
    request,
    response,
    next,
  ) {
    const publicToken = request.body.public_token;
    const institutionId = request.body.institution_id;
    const accounts = request.body.accounts
    const institutionName = request.body.institution_name
    const username = "travis"
  
    // console.log(accounts)
    //use fake user for now
    const user = await itemService.getUser(username)
    if (user == null) {
      return
    }

    const itemFound = await itemService.getItemByInstitutionId(user, institutionId)
    if (itemFound != null){
       //response.status(409).json({error: "Already linked to this bank"});
        await plaid.getTransactions(transactionService, itemFound.itemId, itemFound.accessToken, itemFound.lastCursor)
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
       
        const item = new Item({itemId: itemID, accessToken: accessToken, institutionId: institutionId, institutionName: institutionName, lastCursor:null})
        const saveRes = await itemService.saveItem( user,item)
        const saveAccountRes = await accountService.saveAccounts(username, itemID, accounts)
        
        //this is a new user, so retrieve transactions and save to db.
        await plaid.getTransactions(transactionService, itemID, accessToken, null)
  
        response.json({ public_token_exchange: 'complete' });
      } catch (error) {
        // handle error
      }
    }
  });


  app.get("/api/accounts/:itemId", cors(corsOptions), async function (request, response){
    console.log(request.params.itemId)
    let itemId = request.params.itemId
    const accounts = await accountService.getAccountsForItem(itemId)
    console.log(accounts)
    response.json({"accounts": accounts})
  })

  app.get("/api/items/:username", cors(corsOptions), async function (request, response){
    console.log(request.params.username)
    let username = request.params.username
    const items = await itemService.getItems(username)
    console.log("GOT ITEMS")
    console.log(items)
    response.json({"items": items})
  })


  app.get("/api/get_last_x_years_transactions_for_account/:accountId", cors(corsOptions), async function (request, response){
    console.log(request.query)
    console.log(request.params)
    let accountId = request.params.accountId
    let yearsToSelect = request.query.yearsToSelect
    const transactionsSortedByDate = await transactionService.getTransactionsForAccount(accountId)
    //run my partition algorithm
    yearToMonthTransaction = {}
    for(let transaction of transactionsSortedByDate){
      let dt = new Date(transaction.date);
      yearInQuestion = dt.getFullYear()
      monthInQuestion = dt.getMonth()+1
      if (!(yearInQuestion in yearToMonthTransaction)) {
        yearToMonthTransaction[yearInQuestion] = {}
      }

      if (!(monthInQuestion in yearToMonthTransaction[yearInQuestion])) {
        yearToMonthTransaction[yearInQuestion][monthInQuestion] = []
      }

      yearToMonthTransaction[yearInQuestion][monthInQuestion].push(transaction)
    }

    // console.log("PARTITION")
    // console.log(yearToMonthTransaction)
   
    let years = Object.keys(yearToMonthTransaction).sort().reverse();
    console.log("YEARS")
    console.log(years)
    let finalResponse = {}
    for (let i = 0; i < yearsToSelect; i++) {
      // console.log(years[i])

      // console.log(yearToMonthTransaction[years[i]])

      if (i>=years.length) {
        break
      }
      finalResponse[years[i]]=yearToMonthTransaction[years[i]]
    }
    response.json({data:finalResponse})
  })