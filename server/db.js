const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db('eventManagementDB');
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb() first.');
  }
  return db;
}

module.exports = { connectToDb, getDb };
