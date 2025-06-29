require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const app = express();


// Use middleware
app.use(cors());
app.use(express.json());


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');

    const db = client.db('eventManagementDB'); 

    const eventsCollection = db.collection('events');


  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello from the Event Management backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
