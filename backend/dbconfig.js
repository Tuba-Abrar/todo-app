const { MongoClient } = require("mongodb");
require("dotenv").config(); 

// MongoDB connection URL from .env
const url = process.env.MONGOOS_URL;
const dbName = process.env.DB_NAME;

const collectionName = "todo";

const client = new MongoClient(url); 
let dbInstance = null;


// Connection function
const connection = async () => {
    if (dbInstance){
        return dbInstance
    }
  try {
    await client.connect();
    console.log("MongoDB connected successfully ");
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error("MongoDB connection error ", err);
    throw err;
  }
};

// Export
module.exports = {
  connection,
  collectionName,
};
