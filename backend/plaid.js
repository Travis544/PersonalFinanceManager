const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
class Plaid {
    constructor() {
        this.client = null
    }
    
    async createLinkToken(request){
       return await this.client.linkTokenCreate(request);
    }

    async exchangePublicTokenForAccessToken(publicToken){
        const response = await this.client.itemPublicTokenExchange({
            public_token: publicToken,
        });

        return response
    }


    async getTransactions(transactionService, itemId, accessToken, lastCursor){
        // let item = await itemService.getItem(itemId)
        let added = [];
        let modified = [];
        // Removed transaction ids
        let removed = [];
        let hasMore = true;
        
        console.log("GETTING TRANSACTIONS.... Using cursor:"+lastCursor)
        const batchSize = 100;
        while (hasMore) {
            const request = {
              access_token: accessToken,
              cursor: lastCursor,
              options: {include_personal_finance_category: true},
              count: batchSize
            };
            const response = await this.client.transactionsSync(request);
            const data = response.data;
            // Add this page of results
            
            data.added = this.sanitizeTransaction(data.added)
            added = added.concat(data.added);
            data.modified = this.sanitizeTransaction(data.modified)
            modified = modified.concat(data.modified);
          
            removed = removed.concat(data.removed);
            hasMore = data.has_more;
            // Update cursor to the next cursor
            lastCursor = data.next_cursor;
        }


        await itemService.saveLastCursor(itemId,lastCursor )
        await transactionService.applyTransactionUpdates(itemId, added, modified, removed)
       
      
        
    }


     sanitizeTransaction(transactionData){

        if("personal_finance_category" in transactionData) {
            transactionData["single_category"] = transactionData["personal_finance_category"]["primary"]
        }else{
            transactionData["single_category"]= "N/A"
        }

        console.log('SINGLE CATEGORY')
        console.log(transactionData["single_category"])
        console.log(transactionData["personal_finance_category"])
        return transactionData
    }


    async createPlaidClient(){
        const {
            PLAID_CLIENT_ID,
            PLAID_ENV,
            PLAID_SECRET_DEVELOPMENT,
            PLAID_SECRET_SANDBOX,
        } = process.env;
    
        const PLAID_SECRET =
        PLAID_ENV === 'development' ? PLAID_SECRET_DEVELOPMENT : PLAID_SECRET_SANDBOX;
        
      
        const configuration = new Configuration({
            basePath: PlaidEnvironments[PLAID_ENV],
            baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
                'PLAID-SECRET': PLAID_SECRET,
            },
            },
        });
        this.client = new PlaidApi(configuration);
    }
}

module.exports = new Plaid()