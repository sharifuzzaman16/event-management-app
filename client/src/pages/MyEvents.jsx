import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import EditEventModal from "../components/EditEventModal";

function MyEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://event-management-app-production-f733.up.railway.app/api/events/my-events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load your events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

 const handleUpdate = (updatedEvent) => {
  console.log('Updated event received:', updatedEvent);
  setEvents(prevEvents =>
    prevEvents.map(e => e._id === updatedEvent._id ? updatedEvent : e)
  );
  setModalOpen(false);
};

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(
        `https://event-management-app-production-f733.up.railway.app/api/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      alert("Event deleted successfully.");
    } catch (err) {
      alert("Failed to delete event.");
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  if (error)
    return <p className="text-red-500 text-center mt-8 text-lg">{error}</p>;

  return (
    <>
      <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">
            You have no events.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white p-4 rounded shadow space-y-2 flex flex-col"
            >
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm">
                Date:{" "}
                {event.date
                  ? new Date(event.date).toLocaleDateString()
                  : "No date"}
              </p>

              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <EditEventModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        event={editingEvent}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default MyEvents;
