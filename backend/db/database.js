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
    subType: String
})

const TransactionSchema = new mongoose.Schema({
    transactionId : String,
    accountId : String,
    category : String,
    name: String,
    merchant : String,
    amount : Number, 
    date : Date
})

const Item = mongoose.model("Item", ItemSchema)
const User = mongoose.model("User", UserSchema)
const Account = mongoose.model("Account", AccountSchema)
const Transaction = mongoose.model("Account", AccountSchema)

class Service{
    constructor(){
        this.uri = `mongodb+srv://travis544:${MONGO_DB_PASSWORD}@financedb.pj94cfj.mongodb.net/financeDb`
    }

    async initialize(){
        await mongoose.connect(this.uri);   
    }
}


class MongoDbItemService extends Service{
    constructor(){
        super()
        const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD
        this.uri = `mongodb+srv://travis544:${MONGO_DB_PASSWORD}@financedb.pj94cfj.mongodb.net/?retryWrites=true&w=majority`;
       
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


    async getUser(username) {
        return await  User.findOne({username: username}).populate("items")
    }

    async getItemByInstitutionId(user, institutionId){
      //  await mongoose.connect(this.uri);  
        const userFound =await User.findOne({username: user.username}).populate('items');
        if (userFound == null) {
            return null
        }

        console.log(userFound)
        const itemFound = userFound.items.filter(function (item) {
            return item.institutionId === institutionId;
        }).pop();
      // mongoose.connection.close()
        return itemFound

    }

    async saveItem(user, item){
       
        console.log("SAVING ITEM>......")
        // console.log(user)
        // await this.client.connect()
        // let found =  await this.client.db("financeDb").collection("User").findOne(
        //     { _id: (user.id)}
        // )
       
        user.items.push(item)
        try {
           return res = await user.save();
           
        } catch (err) {
            err.message; // '#sadpanda'
            console.log(err.message)
        }
        // return this.client.db("financeDb").collection("User").updateOne(
        //     { _id: user.id},
        //     { $push: { items: item } },
        //     // { upsert: true }
        // )
    }

    async saveLastCursor(itemId, lastCursor) {
        //await mongoose.connect(this.uri);   
        const res = await Item.updateOne({itemId: itemId}, {lastCursor: lastCursor})
        return res
    }
}


class MongoDbAccountService extends Service{
    constructor(){
    }

    async saveAccount(accountId, itemId, name, type, subType){
        const account = new Account({accountId: accountId, itemId: itemId, name: name, type: type, subType: subType })
        await account.save()
    }

}


class MongoDbTransanctionService extends Service{
    constructor(){

    }

    async applyTransactionUpdates(itemId, newTransactions, modifiedTransactions, deletedTransactions) {
        
    }

    async saveTransactions(newTransactions){
        Transaction.insertMany(newTransactions)
    }

    async updateTransactions(updatedTransactions){
        const updatePromises = updatedTransactions.map((updateTransaction, index) => {
            const {
                account_id,
                transaction_id,
                category_id,
                category,
                transaction_type,
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
                {category: category, amount: amount, merchant: merchant_name }
            
            }}
            return Transaction.deleteOne(query);
        });

        Transaction.updateMany()
    }

    async deleteTransactions(transactionIdsToDelete){
        const deletePromises = transactionIdsToDelete.map((deleteId, index) => {
            const query = { transactionId: deleteId };
            return Transaction.deleteOne(query);
        });
        
        Promise.all(deletePromises)
        .then((results) => {
            results.forEach((result, index) => {
                console.log(`${result.deletedCount} transactions deleted for id ${transactionIdsToDelete[index]}`);
            });
        })
        .catch((error) => {
            console.error('Error deleting products:', error);
        });
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



