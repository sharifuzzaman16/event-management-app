const express = require('express');
const router = express.Router();
const { getDb } = require('../db')
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');

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


// Delete an event (only if user is creator)
router.delete('/:id', verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;

  try {
    const result = await db.collection('events').deleteOne({
      _id: new ObjectId(eventId),
      createdBy: userEmail
    });

    if (result.deletedCount === 0) {
      return res.status(403).send({ message: 'Not allowed to delete this event or event not found' });
    }

    res.send({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).send({ message: 'Failed to delete event' });
  }
});

// Update an event by ID (only creator)
router.put('/:id', verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;
  const updatedEvent = req.body;

  if (!updatedEvent.title || !updatedEvent.date || !updatedEvent.description) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(eventId), createdBy: userEmail },
      { $set: { title: updatedEvent.title, date: updatedEvent.date, description: updatedEvent.description } }
    );

    if (result.matchedCount === 0) {
      return res.status(403).send({ message: 'Not allowed to update this event or event not found' });
    }

    res.send({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).send({ message: 'Failed to update event' });
  }
});



module.exports = router;
