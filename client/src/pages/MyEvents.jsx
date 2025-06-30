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

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

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
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
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
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">
              No events found.
            </p>
          ) : (
            filtered.map((event) => (
              <div
                key={event._id}
                className="card bg-base-100 w-94 shadow-sm relative"
              >
                <figure>
                  <img
                    className="w-full h-56 object-cover rounded-t-lg"
                    src={
                      event.imageUrl ||
                      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAMFBMVEXx8/XCy9K/yND09vfw8vTP1tzp7O/i5ure4+fO1dvJ0dfT2d/EzNPt7/Lb4OXo6+4FeM7UAAAFL0lEQVR4nO2c24KrIAxFLdha7///t0dxOlWDSiAKztnrbR4G6SoJBKHZA6zJYncgQeCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ocEKBEwqcUOCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ot3Oi1KMq64FnWTVq+EueWzlRquqKVn/J+/ezEfdyHydKPYtc62yF1m1Xymq5ixPVdDnx8eslf1eCVu7hRFXFppAfLW39kNJyByeqOTJirGTvRsbKDZyozsHIpKUQsZK8E1Vu55GTrKTuRL0ZRoyVLviZaTtRVctUMuaVOnCoJO1E1WwjxsorbGZO2Qk7br5WuhApKTvpfZWMy5WAoZKuk6b1NhI4VJJ10uRBSsas0ng+OlUnVaARw9NvqCTqRERJpt9eUtJ0IqPEN36SdNIIKRnIPeafFJ0Ep9c5mr+qTdFJ2CRMpLAn5fScqJeokrFWZkoRdaImwtpw2T9iSnnxuiDoRFXda6hK28JzWTA14ryBxKFlTT9iTlT1W57o3Lta96yED8krRieknCw/DDuEP1TnKBlgzMlCTtZDXr+8pIjOwitK5x7JOKFD3mukiE85ix45S5FxYll46prdiv8ekpsU19wv4kS9LV1ouQPlrPzKliIzTuw9YDYiVfgFSxFx8rR+wcyMomSX9HYpTjlFwonqrB3gBc/JyYQjRcRJYe8Ay4l9rMlLcVi8iTjp7Y/nOBHcMjngWEoi4+TUlcmKw9rnxHzCWMqeU/ltkB9JEZl3SusnYmwQn1fm2GgPeiOzZrM9WZfu/3/BNDznYATLOLENffep+JppeMZBMSZUF9N6ljFM7KF3qpTduBZyQj4W53XTiRsEm1L2dr2k9k9W9Rtjq2BrJj9Zyk7pI7bP9lw8kfH+4KIFLGF77Sa3R90Un0POvHNCcYzsLVMk9+2buni1bd9xjMSJHMPmjCz7zov/fidW5GQ7OS/2e8BoRrLtrBfXScTIMVLsk09cJxEjZ8I6+cR1EmG1tsRaDsZ0EjlyDL0leuxOpulD4JTALtfXORRbnqVO1LDOePdtpoclWPsqulL+wt0P0SNnxFKrrp2opmuXl+5OuHA3PSmByDGQ9ezSydYdM+ELd4YUIsdANnoWTva2RSUv3JlnJRE5I2RbY+6kee1+dTrrhC7cPTZeMUdivZnydaIc3tdqqWuI6USOYZlSfp0oxzVlJxNByUSOYZlSPk6cDzqEXy17JDTn/LBMKRlTSRZ4X2giep2zZnEwZHLiGjifFt6BTtKKHMMspUxO2BkvDzoDm1jkGGa7bsaJx0t9XfgrOfuMlhezwsc48RrKufvhyiXXHatg8T2Zkm0eHzluxO8W4pXHKljkXycBt3h9blFdeqyCx2fPOguLbn6qTWsBu+Czxs/CopsdP4kmkx+mcZ8FRrfuWUqSTSYT005keDucW4iXnzRhMg17iYacC6A0VyZzzIQs0pBrUrn22JoXY4Us0pDjaZMzb+dIMX6/Qi0dHSU0XHySz48heqSaOs60vsvlq2mtpzj9OCh/Trgjew7afgLar63d6ec2SmTZm37+UyV7048K+Gmkm7O10A/8aaSbY7sEr8rYvYoNnX4Sr3EuYJVpVc35Ccu/innZbryMJ1n4v9f4N9FZ39XPZ931GYzMGH9VPHYfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADp8Q9+nG9anuOrfAAAAABJRU5ErkJggg=="
                    }
                    alt={event.title}
                  />
                </figure>

                <div className="card-body">
                  <h2 className="card-title">{event.title}</h2>
                  <p className="text-base">
                    {event.description.length > 100
                      ? event.description.slice(0, 100) + "..."
                      : event.description}
                  </p>

                  <ul className="my-2 flex flex-col gap-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CalendarCheck2 size={18} />
                      <span className="text-base">
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
                      <span className="text-base">{event.location}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Book size={18} />
                      <span className="text-base">{event.creator}</span>
                    </li>
                  </ul>

                  <div className="flex items-center absolute top-5 right-5 gap-2 badge badge-soft badge-accent">
                    <Users size={18} />
                    <span className="text-base">
                      {event.joined?.length || 0} attendees
                    </span>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="btn btn-warning text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="btn btn-error text-gray-900"
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
