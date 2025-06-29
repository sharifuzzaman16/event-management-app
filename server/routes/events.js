const express = require('express');
const router = express.Router();
const { getDb } = require('../db')
const verifyJWT = require('../middleware/verifyJWT');

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

// Create a new event
router.post('/', verifyJWT, async (req, res) => {
  const db = getDb();
  const event = req.body;

  if (!event.title || !event.date || !event.description) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  event.createdBy = req.user.email;
  event.joined = [];

  try {
    const result = await db.collection('events').insertOne(event);
    res.send(result);
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Get events created by the logged-in user
router.get('/my-events', verifyJWT, async (req, res) => {
  const db = getDb();
  const email = req.user.email;

  try {
    const myEvents = await db.collection('events')
      .find({ createdBy: email })
      .toArray();

    res.send(myEvents);
  } catch (error) {
    console.error('Error fetching my events:', error);
    res.status(500).send({ message: 'Failed to get user events' });
  }
});




module.exports = router;
