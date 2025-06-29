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
router.put('/events/:id', verifyJWT, async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    const updatedEvent = await db.collection('events').findOneAndUpdate(
      { _id: new ObjectId(eventId) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updatedEvent.value) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent.value);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});



// Join an event (only once per user)
router.patch('/join/:id', verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;

  try {
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    if (event.joined.includes(userEmail)) {
      return res.status(400).send({ message: 'You have already joined this event' });
    }

    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { joined: userEmail } }
    );

    res.send({ message: 'Successfully joined the event' });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).send({ message: 'Failed to join event' });
  }
});


 // Filter events based on search and date range
router.get('/', async (req, res) => {
  const db = getDb();
  const { search, filter } = req.query;

  const query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (filter) {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (filter) {
      case 'current-week': {
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start.setDate(today.getDate() + diffToMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }

      case 'last-week': {
        const day = today.getDay();
        const diffToLastMonday = day === 0 ? -13 : -6 - day;
        start.setDate(today.getDate() + diffToLastMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }

      case 'current-month': {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      }

      case 'last-month': {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      }

      default:
        break;
    }

    query.date = {
      $gte: start.toISOString().split('T')[0],
      $lte: end.toISOString().split('T')[0],
    };
  }

  try {
    const events = await db.collection('events').find(query).toArray();
    res.send(events);
  } catch (error) {
    console.error('Error filtering events:', error);
    res.status(500).send({ message: 'Failed to fetch events' });
  }
});


module.exports = router;
