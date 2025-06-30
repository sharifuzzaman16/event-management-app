const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const verifyJWT = require("../middleware/verifyJWT");
const { ObjectId } = require("mongodb");

// GET all events with filtering
router.get("/", async (req, res) => {
  const db = getDb();
  const { search, filter } = req.query;

  const query = {};

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (filter) {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (filter) {
      case "current-week": {
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start.setDate(today.getDate() + diffToMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }
      case "last-week": {
        const day = today.getDay();
        const diffToLastMonday = day === 0 ? -13 : -6 - day;
        start.setDate(today.getDate() + diffToLastMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }
      case "current-month": {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      }
      case "last-month": {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      }
      default:
        break;
    }

    query.date = {
      $gte: start.toISOString().split("T")[0],
      $lte: end.toISOString().split("T")[0],
    };
  }

  try {
    const events = await db.collection("events").find(query).toArray();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// Create a new event
router.post("/", verifyJWT, async (req, res) => {
  const db = getDb();
  const {
    title,
    date,
    time,
    location,
    description,
    imageUrl,
    creator,
  } = req.body;


  if (!title || !date || !time || !location || !description || !imageUrl || !creator) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const event = {
    title,
    date,
    time,
    location,
    description,
    imageUrl,
    creator,
    createdBy: req.user.email,
    joined: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const result = await db.collection("events").insertOne(event);
    const createdEvent = await db
      .collection("events")
      .findOne({ _id: result.insertedId });

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error("Failed to create event:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Get events created by the logged-in user
router.get("/my-events", verifyJWT, async (req, res) => {
  const db = getDb();
  const email = req.user.email;

  try {
    const myEvents = await db
      .collection("events")
      .find({ createdBy: email })
      .toArray();
    res.status(200).json(myEvents);
  } catch (error) {
    console.error("Error fetching my events:", error);
    res.status(500).json({ message: "Failed to get user events" });
  }
});

// Update an event by ID (only creator) - FINAL FIX
router.put("/:id", verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;
  const updatedEvent = req.body;

  if (!updatedEvent.title || !updatedEvent.date || !updatedEvent.description) {
    return res.status(400).json({
      success: false,
      message: "Title, date, and description are required",
    });
  }

  try {
    const existingEvent = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
      createdBy: userEmail,
    });

    if (!existingEvent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    const updateResult = await db.collection("events").updateOne(
      { _id: new ObjectId(eventId) },
      {
        $set: {
          title: updatedEvent.title,
          date: updatedEvent.date,
          description: updatedEvent.description,
          photoURL: updatedEvent.photoURL || existingEvent.photoURL || "",
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const updatedDoc = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
    });

    return res.status(200).json({
      success: true,
      event: updatedDoc,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during update",
    });
  }
});

// Delete an event (only if user is creator)
router.delete("/:id", verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;

  try {
    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(eventId),
      createdBy: userEmail,
    });

    if (result.deletedCount === 0) {
      return res.status(403).json({
        message: "Not authorized to delete this event or event not found",
      });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Join an event
router.patch("/join/:id", verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;

  try {
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.joined.includes(userEmail)) {
      return res
        .status(400)
        .json({ message: "You have already joined this event" });
    }

    const result = await db
      .collection("events")
      .findOneAndUpdate(
        { _id: new ObjectId(eventId) },
        { $push: { joined: userEmail } },
        { returnDocument: "after" }
      );

    res.status(200).json(result.value);
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: "Failed to join event" });
  }
});

// Leave an event
router.patch("/leave/:id", verifyJWT, async (req, res) => {
  const db = getDb();
  const eventId = req.params.id;
  const userEmail = req.user.email;

  try {
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.joined.includes(userEmail)) {
      return res
        .status(400)
        .json({ message: "You are not attending this event" });
    }

    const result = await db
      .collection("events")
      .findOneAndUpdate(
        { _id: new ObjectId(eventId) },
        { $pull: { joined: userEmail } },
        { returnDocument: "after" }
      );

    res.status(200).json(result.value);
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({ message: "Failed to leave event" });
  }
});

module.exports = router;
