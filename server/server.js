require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;


const { connectToDb } = require('./db');

const authRoutes = require('./routes/auth');
const eventsRoute = require('./routes/events');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoute);


app.get('/', (req, res) => {
  res.send('Hello from the Event Management backend!');
});

app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


connectToDb().then(() => {
  app.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
  });
});
