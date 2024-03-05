const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise;
const dbConnect =async ()=>{
    try {
        const conn = await mongoose.connect(process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD),{
            
            dbName: 'BeeTour'
        })
        console.log("Database connected successfully")
    } catch (error) {
        console.error(error);
    }
}

module.exports = dbConnect;
