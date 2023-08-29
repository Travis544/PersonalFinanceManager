const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
class Plaid {
    constructor() {

    }

    createPlaidClient(){
        const {
            PLAID_CLIENT_ID,
            PLAID_ENV,
            PLAID_SECRET_DEVELOPMENT,
            PLAID_SECRET_SANDBOX,
        } = process.env;
    
        const PLAID_SECRET =
        PLAID_ENV === 'development' ? PLAID_SECRET_DEVELOPMENT : PLAID_SECRET_SANDBOX;
        
        console.log(process.env)
        console.log(PLAID_CLIENT_ID)
        const configuration = new Configuration({
            basePath: PlaidEnvironments[PLAID_ENV],
            baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
                'PLAID-SECRET': PLAID_SECRET,
            },
            },
        });
        const client = new PlaidApi(configuration);
        return client
    }
}

module.exports = new Plaid()