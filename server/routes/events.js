const express = require('express');
const router = express.Router();
const { getDb } = require('../db')

// GET all events
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const events = await db.collection('events').find().toArray();
    res.send(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send({ message: 'Failed to fetch events' });
  }
});


module.exports = router;
