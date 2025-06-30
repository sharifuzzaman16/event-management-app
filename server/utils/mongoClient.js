const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let cachedDb = null;

async function connectToDatabase() {
  if (!cachedDb) {
    await client.connect();
    // console.log('Connected to MongoDB (auth)');
    cachedDb = client.db('eventManagementDB');
  }

  return cachedDb;
}

module.exports = connectToDatabase;
