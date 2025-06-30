import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import EditEventModal from "../components/EditEventModal";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { Book, CalendarCheck2, MapPin, Search, Users } from "lucide-react";
import Swal from "sweetalert2";

function MyEvents() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "current-week", label: "Current Week" },
    { id: "last-week", label: "Last Week" },
    { id: "current-month", label: "Current Month" },
    { id: "last-month", label: "Last Month" },
  ];

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
      setFiltered(res.data);
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

  useEffect(() => {
    let result = [...events];

    if (search.trim()) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const today = new Date();
    let range = null;

    if (dateFilter === "current-week") {
      range = {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    } else if (dateFilter === "last-week") {
      const lastWeek = subWeeks(today, 1);
      range = {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    } else if (dateFilter === "current-month") {
      range = {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    } else if (dateFilter === "last-month") {
      const lastMonth = subMonths(today, 1);
      range = {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    }

    if (range) {
      result = result.filter((e) => isWithinInterval(new Date(e.date), range));
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFiltered(result);
  }, [search, dateFilter, events]);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleUpdate = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
    setModalOpen(false);
  };

  const handleDelete = async (eventId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This event will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://event-management-app-production-f733.up.railway.app/api/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      setFiltered((prev) => prev.filter((e) => e._id !== eventId));

      Swal.fire("Deleted!", "Your event has been deleted.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Failed to delete the event.", "error");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="min-h-screen bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-15 pb-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Events</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage, edit, and delete your created events.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    dateFilter === filter.id
                      ? "bg-[#3B25C1] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">
              No events found.
            </p>
          ) : (
            filtered.map((event) => (
              <div
                key={event._id}
                className="relative bg-base-100 shadow-md rounded-lg overflow-hidden w-full max-w-sm"
              >
                <figure>
                  <img
                    className="w-full h-56 object-cover"
                    src={
                      event.imageUrl ||
                      "https://t4.ftcdn.net/jpg/06/71/92/37/240_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg"
                    }
                    alt={event.title}
                  />
                </figure>

                <div className="p-6 flex flex-col gap-3">
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  <p className="text-base text-gray-600">
                    {event.description.length > 100
                      ? event.description.slice(0, 100) + "..."
                      : event.description}
                  </p>

                  <ul className="text-sm flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <CalendarCheck2 size={18} />
                      <span>
                        {new Date(
                          `${event.date}T${event.time}`
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          `${event.date}T${event.time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{event.location}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Book size={18} />
                      <span>{event.creator}</span>
                    </li>
                  </ul>

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-500 text-white text-sm px-2 py-1 rounded-md shadow">
                    <Users size={16} />
                    <span>{event.joined?.length || 0}</span>
                  </div>

                  <div className="card-actions flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="btn btn-warning text-gray-900 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="btn btn-error text-gray-900 w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        <EditEventModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          event={editingEvent}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}

export default MyEvents;
