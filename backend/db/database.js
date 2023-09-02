//An Item represents a login at a financial institution
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
var mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemId : String,
    accessToken : String,
    institutionId: String,
    lastCursor : String
});


const UserSchema = new mongoose.Schema({
    username : String,
    items : [ItemSchema]
})

const AccountSchema = new mongoose.Schema({
    itemId : String,
    accountId: String,
    name: String,
    type: String,
    subtype: String
})

const TransactionSchema = new mongoose.Schema({
    transactionId : String,
    accountId : String,
    category : [String],
    personalFinanceCategory: Map,
    name: String,
    merchant : String,
    amount : Number, 
    

    date : Date
})

const Item = mongoose.model("Item", ItemSchema)
const User = mongoose.model("User", UserSchema)
const Account = mongoose.model("Account", AccountSchema)
const Transaction = mongoose.model("Transaction", TransactionSchema)

class Service{
    constructor(){
         const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
        
    }

  
}


class MongoDbItemService extends Service{
    constructor(){
        super()
        const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
       // this.uri = `mongodb+srv://travis544:${MONGO_DB_PASSWORD}@financedb.pj94cfj.mongodb.net/?retryWrites=true&w=majority`;
       this.uri = `mongodb+srv://travis544:${MONGO_DB_PASSWORD}@financedb.pj94cfj.mongodb.net/financeDb`
    }

    // async run() {
    //     try {
    //       // Connect the client to the server	(optional starting in v4.7)
    //       await this.client.connect();
    //       // Send a ping to confirm a successful connection
    //       await this.client.db("admin").command({ ping: 1 });
    //       console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //     } finally {
    //       // Ensures that the client will close when you finish/error
    //       await this.client.close();
    //     }
    // }

    async initialize(){
        await mongoose.connect(this.uri);   
    }


    async getUser(username) {
        return await User.findOne({username: username}).populate("items")
    }

    async getItem(itemId) {
        const results =  await User.aggregate([
            {
              $unwind: '$items' // Deconstruct the children array
            },
            {
              $match: {
                'items.itemId': itemId // Match by child ID
              }
            }
        ])

        if (results.length == 0){
            return null
        }
        return results[0]["items"]
    }

    async getItemByInstitutionId(user, institutionId){
      //  await mongoose.connect(this.uri);  
        const userFound =await User.findOne({username: user.username}).populate('items');
        if (userFound == null) {
            return null
        }

        
        const itemFound = userFound.items.filter(function (item) {
            return item.institutionId === institutionId;
        }).pop();
      // mongoose.connection.close()
        return itemFound
    }

    async saveItem(user, item){
       
    
        user.items.push(item)
        try {
           return await user.save();
           
        } catch (err) {
            err.message; // '#sadpanda'
         
        }
        // return this.client.db("financeDb").collection("User").updateOne(
        //     { _id: user.id},
        //     { $push: { items: item } },
        //     // { upsert: true }
        // )
    }

    async saveLastCursor(itemId, lastCursor) {
        // console.log("SAVING LAST CURSOR")
        // console.log(lastCursor)
        // console.log(itemId)
        //await mongoose.connect(this.uri);   
        // const itemFound = await Item.findOne({itemId: itemId})
        // console.log(itemFound)
        // const res = await Item.findOneAndUpdate({itemId: itemId}, {$set: {lastCursor: lastCursor}})
        // console.log(res)
        const updateRes = await User.updateOne({ 'items.itemId': itemId }, {$set: { 'items.$.lastCursor': lastCursor }})
        // const item = this.getItem(itemId)
        return updateRes
        // return res
    }
}


class MongoDbAccountService extends Service{
    constructor(){
        super()
    }

    async saveAccount(accountId, itemId, name, type, subType){
        const account = new Account({accountId: accountId, itemId: itemId, name: name, type: type, subType: subType })
        await account.save()
    }

    async saveAccounts(accountInfos) {
        const infoArr = accountInfos.map((accountInfo, index)=>{
            const {
                id: accountId, 
                name, 
                type,
                subtype
            } = accountInfo

           // const account = new Account({accountId:accountId, name:name, type: type, subType:subType})
           return {accountId:accountId, name:name, type: type, subtype:subtype}
        })

        Account.insertMany(infoArr)
    }

}


class MongoDbTransanctionService extends Service{
    constructor(){
        super()
    }

    async applyTransactionUpdates(itemId, newTransactions, modifiedTransactions, deletedTransactions) {
        console.log("GIVEN NEW TRANSACTION "+newTransactions.length)
        console.log("GIVEN MODIFIED TRANSACTION "+modifiedTransactions.length)
        console.log("DELETED TRANSACTION "+deletedTransactions.length)
        const insertedCount= await this.saveTransactions(newTransactions)
        const updatedCount = await this.updateTransactions(modifiedTransactions)
        const deletedcount = await this.deleteTransactions(deletedTransactions)
        console.log("Update Complete:")
        console.log("INSERTED COUNT"+insertedCount)
        console.log("UPDATED COUNT"+updatedCount)
        console.log("DELETED COUNT"+deletedcount)
    }

    async saveTransactions(newTransactions){
        const newTransactionPromises = newTransactions.map((newTransaction, index) => {
            const {
                account_id,
                transaction_id,
                category_id,
                category,
                payment_channel,
                name,
                amount,
                iso_currency_code,
                unofficial_currency_code,
                date,
                pending,
                account_owner,
                merchant_name,
               
                single_category,
                personal_finance_category
            } = newTransaction;

            const transaction = new Transaction({
                transactionId:transaction_id,
                accountId: account_id, 
                category: category,
                personalFinanceCategory: personal_finance_category,
                name: name,
                merchant: merchant_name,
                amount:amount,
                date: date
            })

           // console.log("GOT SINGLE CATEGORY OF" + single_category)

            return transaction.save()
        })

        // transactionId : String,
        // accountId : String,
        // category : String,
        // name: String,
        // merchant : String,
        // amount : Number, 
        // date : Date
        Promise.all(newTransactionPromises)
        .then((results) => {
            results.forEach((result, index) => {
        
            });
        })
        .catch((error) => {
            console.error('Error inserting transactions:', error);
        });

        return newTransactions.length

    }



    async updateTransactions(updatedTransactions){
        const updatePromises = updatedTransactions.map((updateTransaction, index) => {
            const {
                account_id,
                transaction_id,
                category_id,
                category,
                payment_channel,
                name,
                amount,
                iso_currency_code,
                unofficial_currency_code,
                date,
                pending,
                account_owner,
                merchant_name
            } = updateTransaction;

            const queryCriteria = {transactionId: transaction_id}
            const queryOperation = {$set: 
                {category: category, 
                amount: amount, 
                merchant: merchant_name,
                date : date,
                name : name,
            }}
            return Transaction.updateOne(queryCriteria, queryOperation)
        });

        Promise.all(updatePromises)
        .then((results) => {
            results.forEach((result, index) => {
               
            });
        })
        .catch((error) => {
            console.error('Error updating products:', error);
        });

        return updatedTransactions.length
    }

    async deleteTransactions(transactionsToDeleteFromPlaid){
        const deletePromises = transactionsToDeleteFromPlaid.map((payload, index) => {
            const {
                transaction_id 
            } = payload;
            const query = { transactionId: transaction_id };
            return Transaction.deleteOne(query);
        });
        
        Promise.all(deletePromises)
        .then((results) => {
            results.forEach((result, index) => {
                // console.log(`${result.deletedCount} transactions deleted for id`);
            });
        })
        .catch((error) => {
            console.error('Error deleting transactions:', error);
        });

        return transactionsToDeleteFromPlaid.length
    }

}


module.exports = {
    Item,
    User,
    Account,
    Transaction,
    MongoDbItemService, 
    MongoDbAccountService,
    MongoDbTransanctionService, 
    
}



